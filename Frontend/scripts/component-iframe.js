(function ($) {
    $('.embed_frame').length ? $('.embed_frame').show().css({"width":"1px","min-width":"100%"}).iFrameResize({log:false, checkOrigin: false}) : "";
})(jQuery);