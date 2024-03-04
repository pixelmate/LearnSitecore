// document ready  page Scoll button
(function($) {
    // Global vars
    var gridFloatBreakpoint = 992;
    var scrollTop;
    var isDesktop;
    var isScrolledToTop = true;
    
    $('.scroll-button-wrap').find('a').addClass('to-top');
    var backToTop = function() {
        var scrollTrigger = 300;
        //stick to footer

        function calcToTopBottomPosition() {
            return responsiveUtils.isDesktop() ? 120 : 0;
        }

        return _.debounce(function() {
            if ($(window).scrollTop() > scrollTrigger) {
                $('.to-top').addClass('show');
            } else {
                $('.to-top').removeClass('show');
            }
        }, 150);
    };
    $(window).on('scroll', backToTop());

    //Event handlers
    $(document).on('click', '.to-top', function(e) {
        if ($(this).hasClass('show')) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: 0
            }, 700);
        } else {
            e.stopPropagation();
        }
    });


    var responsiveUtils = {
        isMobile: function() {
            return Modernizr.mq('(max-width: 767px)');
        },
        isTablet: function() {
            return Modernizr.mq('(min-width: 768px) and (max-width: 1024px)');
        },
        isDesktop: function() {
            return Modernizr.mq('(min-width: 1025px)');
        }
    }

})(jQuery);