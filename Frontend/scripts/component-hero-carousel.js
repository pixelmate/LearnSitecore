(function ($) {
  if (!$(".on-page-editor").length) {
    $(".hero-carousel .slides").each(function (i, e) {
      if ($(this).parents(".hero-carousel").is(".mulitple-bottom-links")) {
        var bottomSlides = $(this).find(".bottom-tile").clone();
        $(this)
          .find(".slide")
          .each(function (index) {
            $(this).find(".bottom-links-list").empty();
            var $this = $(this);
            bottomSlides.each(function (i) {
              if (index == i) {
                $this
                  .find(".bottom-links-list")
                  .append(
                    "<div class='bottom-tile highlight'>" +
                    $(this).html() +
                    "</div>"
                  );
              } else {
                $this
                  .find(".bottom-links-list")
                  .append(
                    "<div class='bottom-tile'>" + $(this).html() + "</div>"
                  );
              }
            });
          });
        //alert($(this).find(".slide .bottom-tile").length);
        var settings = {
          infinite: true,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        };
        $(e).slick(settings);
      } else if ($(this).parents(".hero-carousel").is(".responsive-carousel")) {
        var $this = $(this);
        $this
        .find(".slide")
        .each(function (index) {
          var mobileImageUrl = $(this).attr('data-mob-img-src'),
            imageHtml = `<div class="mobile-img d-lg-none"><img src='${mobileImageUrl}'></div>`;
            if($this.attr('data-iscontentoverimage') == 'false'){                            
              $(this).prepend(imageHtml);
            }

        });

        if ($(window).width() < 992) {
          if ($this.attr('data-iscontentoverimage') == 'true') {
            $(this)
              .find(".slide")
              .each(function (index) {
                var desktopImageUrl = $(this).attr('data-desktop-img-src'),
                  mobileImageUrl = $(this).attr('data-mob-img-src');
                $(this).css('background-image', `url(${mobileImageUrl})`);
              });
          } else {
            $this
              .find(".slide")
              .each(function (index) {
                var desktopImageUrl = $(this).attr('data-desktop-img-src'),
                  mobileImageUrl = $(this).attr('data-mob-img-src');                 
                $(this).css('background-image', 'none');
              });
          }
        } else {
          $(this)
            .find(".slide")
            .each(function (index) {
              var desktopImageUrl = $(this).attr('data-desktop-img-src'),
                mobileImageUrl = $(this).attr('data-mob-img-src');
              $(this).css('background-image', `url(${desktopImageUrl})`);
            });
        }
        //alert($(this).find(".slide .bottom-tile").length);
        var settings = {
          infinite: true,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        };
        $(e).slick(settings);

      } else {
        $(this)
          .find(".slide")
          .each(function (index) {
            var imageUrl = $(this).find(".mobile-img").attr("data-src");
            $(this)
              .find(".mobile-img")
              .css("background-image", "url(" + imageUrl + ")");
          });
        var settings1 = {
          infinite: true,
          autoplay: true,
          autoplaySpeed: 10000,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        };
        $(e).slick(settings1);
      }
      //Resize function...
      // var w = 0;
      // $(window).resize(_.debounce(function () {
      //     if (!($(".on-page-editor").length) && w != $(window).width()) {
      //         if ($(window).width() <= 1023 && !$(e).hasClass('slick-initialized')) {
      //             $(e).slick(settings);
      //         }
      //         w = $(window).width();
      //     }
      // }, 400));
    });
  }
  $(window).resize(_.debounce(function () {
    $(".hero-carousel .slides").each(function (i, e) {
      if ($(this).parents(".hero-carousel").is(".responsive-carousel")) {
        var $this = $(this);

        if ($(window).width() < 992) {
          if ($this.attr('data-iscontentoverimage') == 'true') {
            $(this)
              .find(".slide")
              .each(function (index) {
                var desktopImageUrl = $(this).attr('data-desktop-img-src'),
                  mobileImageUrl = $(this).attr('data-mob-img-src');
                $(this).css('background-image', `url(${mobileImageUrl})`);
              });
          } else {
            $this
              .find(".slide")
              .each(function (index) {
                $(this).css('background-image', 'none');  
              });
          }
        } else {
          $(this)
            .find(".slide")
            .each(function (index) {
              var desktopImageUrl = $(this).attr('data-desktop-img-src'),
                mobileImageUrl = $(this).attr('data-mob-img-src');
              $(this).css('background-image', `url(${desktopImageUrl})`);
            });
        }
      }

    });
  }));

})(jQuery);