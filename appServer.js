var express = require('express');
var app = express();
var bodyParser= require('body-parser');
var mongoClient = require("mongodb").MongoClient;
var url = require("url");
var fs = require('fs');
const nodemailer = require('nodemailer');
var urlDBAutoService='mongodb://localhost:27017/autoService';

insertDB = function(urlDB, postData, nameCollection) {
    mongoClient.connect(urlDB,function(err, db){
      if(err){
          console.log(err);
      }else {
        console.log("Connected to db: "+urlDB);
        db.collection(nameCollection).insert(postData,function(err,data){
          console.log(data.ops);
          if(err){
            throw(err);
          }else{
            console.log("sucessfuly inserted");
          }
        });
      }
      db.close();
    });
};

showDB = function(urlDB, nameCollection, res) {
    mongoClient.connect(urlDB, function(err, db){
      if(err){
        return console.log(err);
      }else {
        console.log("Connected to db: "+urlDB);
        db.collection(nameCollection).find({nameForm: nameCollection}).toArray(function(err, reqService){
          if (err) {
            return console.log(err.message);
          }else{
            res.setHeader('Content-Type', 'application/json');
            return res.send(reqService);
          }
        });
      }
      db.close();
    });
};

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/form', function (req, res) {
    var postData=req.body;
    console.log("Your POST request:" + postData.nameForm);
    res.setHeader('Content-Type', 'application/json');
    res.send({location: req.url,
              pageName: "Home",
              postData});
    if (postData.nameForm=='formReqToService') {
      insertDB(urlDBAutoService, postData, postData.nameForm);
    }else if(postData.nameForm=='formSubscribe'){
      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com", // hostname
          secureConnection: true, // use SSL, true for 465, false for other ports
          port: 465, // port for secure SMTP
          auth: {
            user: 'lwcrgarage@gmail.com',// local user
            pass: 'lowcargarage' // local password
         }
        });
        // setup email data with unicode symbols
        let mailOptions = {
          from: ' <lwcrgarage@gmail.com>', // sender address
          to: postData.subscribeEmail, // list of receivers
          subject: 'Subscribe', // Subject line
          text: 'Subscribe to LowCarGarage', // plain text body
          html: '<b>Вы только что подписались на новости от LowCarGarage</b>' // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info)  {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
        });
      });
      insertDB(urlDBAutoService, postData, postData.nameForm);
    }else if(postData.nameForm=='formReviews'){
      insertDB(urlDBAutoService, postData, postData.nameForm);
    }
});

app.post('/reqService', function (req, res){
  showDB(urlDBAutoService, 'formReqToService', res);
});

app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/httperror.html', function(req,res){
    res.sendFile(__dirname + '/public/error.html');
});

app.get(/.*.html*$/, function(req, res, err){
  if (req.query.reqAjax=='ajax') {
    res.sendFile(__dirname + '/public/modules/' + url.parse(req.url).pathname);
    return console.log('STATUS: '+res.statusCode);
  }else{
    fs.stat(__dirname + '/public/modules/' + url.parse(req.url).pathname, function(err, stat) {
      if(err == null) {
          console.log('File exists');
          res.sendFile(__dirname + '/public/index.html');
      } else if(err.code == 'ENOENT') {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).redirect('error.html');
        console.log('httpError:404 - '+url.parse(req.url).pathname);
      } else {
          console.log('Some other error: ', err.code);
      }
    });
  }
});

app.get(/.*.js$/, function(req, res){
  res.sendFile(__dirname + '/public/javascript'+req.url);
  console.log(  req.url);
});

app.get(/.*.css$/, function(req, res){
  res.sendFile(__dirname + '/public/css'+req.url);
  console.log(  req.url);
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  console.log(req.url);
  res.status(404).redirect('error.html');
});

app.listen(3012, function(){
  console.log('listening on 3012 port...')
});
