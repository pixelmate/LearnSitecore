(function ($) {
    if($(".cta-banner").length){
        var delaytime = $(".cta-banner").find(".inner-wrap").attr("delaytime");
        setTimeout(function(){
            $(".cta-banner").removeClass("d-none");
        },delaytime);
        $(".cta-banner .close-btn").on("click",function(){
            $(this).parents(".cta-banner").addClass("d-none");
        });
    }
})(jQuery);