//функция обновления контента методом ajax
updateState = function(pages){
    $.ajax({
        url: pages,
        beforeSend: function(){
            $('#content').html('<div class="load"><hr/><hr/><hr/><hr/></div>');
        },
        type: 'get',
        dataType: "html",
        data:{'reqAjax':'ajax'},
        success: function(data){
          $("#content").css("display", "none").fadeIn(800).html(data);
        },
        error:function(){alert("error")}
    });
};
(function($){
  $(document).ready(function(){
    var navigation = document.querySelector('.navigation');//поиск меню навигации по классу
    //функция замены заголовка страницы во вкладке
    changeTitle = function(pages){
      var strId = pages.split('/')[1].split('.')[0];
      if (strId == 'home' || strId == '') {
        return document.title = 'Главная';
      }else if (strId == 'form') {
        return document.title = document.getElementById('requestToService').getAttribute('value');
      }
      document.title = document.getElementById(strId).getAttribute('value');
    };
    //слушаем клики по кнопкам истории браузера
    window.addEventListener('popstate', function(e){
      if (document.location.pathname=='/') {
        updateState('/home.html');
        changeTitle('/home.html');
        return;
      }
      updateState(document.location.pathname);
      changeTitle(document.location.pathname);
    });
    //слушаем клики по меню навигации
    navigation.addEventListener('click', function(e){
      var state;
      state = {
        page: e.target.getAttribute('data-page')
      };
      updateState('/'+state.page+'.html');
      changeTitle('/'+state.page+'.html');
      history.pushState('', '', state.page+'.html');
      e.preventDefault();
    });
    //слушаем клик по кнопке на подачу заявки
    $("#requestToService").click(function(event){
      updateState('/form.html');
      history.pushState('', '', 'form.html');
      document.title="Оставить заявку";
    });
    $('input[type=email]').blur(function() { //blur-обработчик события потери фокуса
      var emailRegular = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;//регулярное выражение из спецификации W3C HTML5
      if(this.value.match(emailRegular)){//Валидация поля email
        $(document).on('submit', 'form', function(event) { //делегирование, так как некоторые формы подгружаются ajax
          event.preventDefault();//отменим действия по умолчанию для клика по кнопке
          var form = $("form");
          var formData = {
            nameForm: this.name //получим значения поля name используемой формы
          };
          form.serializeArray().map(function(x){formData[x.name] = x.value;});
          $.ajax({
            url: "/form",
            type: "post",
            dataType: "json",
            data: JSON.stringify(formData),
            contentType: "application/json",
            success: function(responseData) {
              console.log(responseData);
              updateState('/shares.html');
              history.pushState('', '', 'shares.html');
              document.title="Акции";
            },
            error: function(xhr) {
              console.log(xhr.responseText);
            }
          });
          document.getElementById("email").value = "";
        });
      }else {
        alert('Вы ввели некорректный email, проверьте правильность введенных данных');
      }
    });
  });
})(jQuery);
