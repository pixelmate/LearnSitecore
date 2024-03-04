//product details
(function($) {    
 
//related product slider start
if (!($(".on-page-editor").length)) {
    $('.popular-products.is-mobile-carousel .row,.related-articles-horizontal-view .is-mobile-carousel').each(function(i, e) {
        var settings = {
            infinite: true,
            speed: 300,
            dots: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            adaptiveHeight: false,
            responsive: [{
                    breakpoint: 9999,
                    settings: 'unslick'
                },
                {
                    breakpoint: 840,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 541,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        };
        $(e).slick(settings);
        //Resize function...
        var w = 0;
        $(window).resize(_.debounce(function() {
            if (!($(".on-page-editor").length) && w != $(window).width()) {
                if ($(window).width() <= 1023 && !$(e).hasClass('slick-initialized')) {
                    $(e).slick(settings);
                }
                w = $(window).width();
            }
        }, 400));

    });
    
}
//product image
$(".field-image embed").on('click', function(){
   // console.log($(this).attr('src'))
    var imageUrl= $(this).attr('src');
  //  console.log(imageUrl);
   $('.image-placeholder img').attr('src', imageUrl);
 

});
})(jQuery);