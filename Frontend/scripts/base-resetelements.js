 //Ask them the question about leaving
 (function ($){
    $(window).on('beforeunload', function () {
        $(select).prop('selectedIndex',0);
    });
 })(jQuery);