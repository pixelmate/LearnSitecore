// document ready
(function($) {
    $('body').on("click",'.product-description-accordion .panel-title a[data-toggle]',function(e){
        e.preventDefault()
        var tabId = $(this).attr('href');
        $(this).toggleClass('collapsed');
        $("div"+tabId).slideToggle();
      })
    if (($(".component.tabs").length)) {
        $(".component.tabs").each(function() {
            $(this).find(".tabs-container .tab").each(function(i) {
                var $tabContent = $(this).parents(".tabs-inner").eq(0).find('.tabs-heading li').eq(i).find(".row").html();
                $(this).prepend("<div class='row tab-heading-mob'>" + $tabContent + "</div>");
            });
        });
    }
    // console.log("Desktop " + $(window).width());
    if ($(window).width() > 997) {
        tabsdeskhndlr();
    } else {
        accordiontabsmobhndlr();
    }


    //start mobile tab  
    var winScrollTop = $(window).scrollTop();
    var scrollTop;

    if ($('.tabs:not(".not-scroll") .tabs-container').length) {
        if ($(window).width() < 992) {
            $('.tabs-container .tab-heading-mob').click(function() {
                var position = $(this).position();
                //  e.preventDefault();
                $('html,body').animate({
                    scrollTop: position.top - 15
                }, 700);

            })
        }
    }

    
    //end  mobile tab
    // expanded by default product-tab-accordion
    var expandbydefault = $('.product-tab-accordion:not(.product-tab) .tabs-accordion[expandbydefault="true"]'),
        firstCardContent = expandbydefault.children('.card').eq(0).find('#collapse-general'),
        firstCardHeading = expandbydefault.children('.card').eq(0).find('button.btn-link');
    if(expandbydefault){
        firstCardContent.addClass('show');
        firstCardHeading.attr("aria-expanded", true);
    }

})(jQuery);

// to be run when window resize by user
jQuery(window).resize(function() {
    // console.log("Mobile " + jQuery(window).width());
    if (jQuery(window).width() > 997) {
        tabsdeskhndlr();
    } else {
        accordiontabsmobhndlr();
    }
});

// tabs accordian handling for mobile and tabs screen
function accordiontabsmobhndlr() {
    jQuery('.tabs-container .tab .tab-heading-mob').on('click', function() {
        jQuery(this).closest('.tabs-container').find(".tab").removeClass('active');
        jQuery(this).closest('.tab').addClass("active").slideDown();

        // remove active class from all headig li
        jQuery('.tabs-heading li').removeClass('active');

        jQuery(this).closest('.tabs-container').find(".tab").each(function(count) {
            if (jQuery(this).is(".active")) {
                jQuery(this).find('.row:last').slideDown();

                // below code use to select tabs button based on accordian active in mobile
                jQuery('.tabs-heading li:eq(' + count + ')').addClass('active');
            } else {
                jQuery(this).find('.row:last').slideUp();
            }
        });
    });
}

// tabs handling for large screen
function tabsdeskhndlr() {
    jQuery('.tabs-container').find('.tab').each(function() {        
    });
}