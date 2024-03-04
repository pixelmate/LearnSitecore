(function ($) {
// color in banner mobile view 
HeaderMobileColor();


$(window).resize(function () {
    HeaderMobileColor();
})
//declaration
function HeaderMobileColor() {
    var mobBgColor = $(".hero.with-alignment .hero-banner-title").attr('mob-bg-color');
    var bgColor = $(".hero.with-alignment .hero-banner-title").attr('bg-color');
    if ($(window).width() < 992) {        
        $(".hero.with-alignment .hero-banner-title").css("background-color", mobBgColor);
    } else {
        $(".hero.with-alignment .hero-banner-title").css("background-color", bgColor);
    }
}
})(jQuery);