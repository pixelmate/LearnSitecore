(function ($) {

    function popuptoggle(popupid) {
        $(popupid).fadeToggle(function () {
            $('body').toggleClass('modal-open');
        }).toggleClass('show');
    }

    function validate(user, pass) {
        $.ajax({
            type: "POST",
            data: {
                "Name" : user,
                "Password" : pass,
                "RememberMe" : $('#user-login-remember').is(":checked")
            },
            url: "/api/sitecore/Account/checkUser",
            success: function (data) {
                if (data == null) {
                    $("#enter-credential-error").css("display", "block");
                } else {
                    console.log(data);
                    if (data.isSuccess == true) {
                      

                        popuptoggle($('#userlogin-modal'))

                    } else {

                        $("#enter-credential-error").html(data.message);
                    }
                }
            }
        });
    }

    $("#enter-credential-error").css("display", "none");
    popuptoggle($('#userlogin-modal'))
    $('#userlogin-modal .close').on('click', function () {
        popuptoggle($('#userlogin-modal'))
    })

    $("#userlogin").on("click", function () {
        var user = $("#Name").val();
        var pass = $("#Password").val();
        if (user == '' || pass == '') {
            $("#enter-credential-error").css("display", "block");
        } else {

            validate(user, pass);
        }
    });
     

    $(".cancel").on("click", function () {        
        location.href="/"
    });
    $(".close").on("click", function () {        
        location.href="/"
    });

  

})(jQuery);