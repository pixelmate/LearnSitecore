(function($) {

    //TAG change function i.e. $(this).replaceTagName('a');
    $.fn.replaceTagName = function(replaceWith) {
        var tags = [],
            i = this.length;
        while (i--) {
            var newElement = document.createElement(replaceWith),
                thisi = this[i],
                thisia = thisi.attributes;
            for (var a = thisia.length - 1; a >= 0; a--) {
                var attrib = thisia[a];
                newElement.setAttribute(attrib.name, attrib.value);
            }
            newElement.innerHTML = thisi.innerHTML;
            $(thisi).after(newElement).remove();
            tags[i] = newElement;
        }
        return $(tags);
    }

    // Variant-1

    //make div tag on blank url & remove h3 on blank 
    if ($('.feature-content-tiles.variant-1').length > 0) {
        $('.feature-content-tiles.variant-1 .inner-wrapper .copy-wrap a').each(function() {
            var url = $(this).attr('href');
            var h3val = $(this).find('h3').text().length;
            if (h3val < 1) {
                $(this).find('h3').remove();
            }
            if (url.length < 1) {
                $(this).replaceTagName('div');

            }
        })
    }

    //variant-2 slider    

    if (!($(".on-page-editor").length)) {
        $('.feature-content-tiles.variant-2 .is-mobile-carousel .row').each(function(i, e) {
            var settings = {
                infinite: true,
                speed: 300,
                dots: true,
                slidesToShow: 3,
                adaptiveHeight: false,
                responsive: [{
                        breakpoint: 9999,
                        settings: 'unslick'
                    },
                    {
                        breakpoint: 768,
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

    //variant-3 

    //make anchor tag on desktop.
    if ($('.feature-content-tiles.variant-3 .body-copy .content-col').length > 0) {
        var w = $(window).width() >= 768;
        $('.feature-content-tiles.variant-3 .body-copy .content-col').each(function() {
            var url = $(this).attr('data-href');

            if (w) {
                $(this).attr('href', url);
                $(this).find('.figcaption').remove();
                $(this).replaceTagName('a');
            } else {
                $(this).find('.figcaption a').attr('href', url);
            }
        })
    }

    //slider

    if (!($(".on-page-editor").length)) {
        $('.feature-content-tiles.variant-3 .body-copy').each(function(i, e) {
            var settings = {
                infinite: true,
                speed: 300,
                dots: true,
                slidesToShow: 3,
                adaptiveHeight: false,
                responsive: [{
                        breakpoint: 9999,
                        settings: 'unslick'
                    },
                    {
                        breakpoint: 768,
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

    //Variant-4 2 column 3 row slider

    if (!($(".on-page-editor").length)) {
        $('.feature-content-tiles.variant-4 .pull-right').each(function(i, e) {
            var settings = {
                infinite: true,
                speed: 300,
                dots: true,
                slidesToShow: 3,
                adaptiveHeight: false,
                responsive: [{
                        breakpoint: 9999,
                        settings: 'unslick'
                    },
                    {
                        breakpoint: 767,
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
    // match height in feature-content-tiles variant-2 cta and content
    $('.feature-content-tiles.variant-2 .field-data p').matchDimensions();
 
})(jQuery);