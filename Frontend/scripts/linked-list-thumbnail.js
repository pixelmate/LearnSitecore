(function ($) {
  if (!$(".on-page-editor").length){
  if ($(".submenu-utility-linklist").length > 0) {
    $(".submenu-utility-linklist")
      .find(".linked-thumbnail")
      .addClass("js-disable-slick");
  }

  if ($(".linked-thumbnail") && $(".linked-thumbnail ul li").length > 10) {
    $(".component.linked-thumbnail:not(.js-disable-slick) ul").each(function (
      i,
      e
    ) {
      var settings = {
        infinite: true,
        speed: 300,
        dots: false,
        slidesToShow: 10,
        slidesToScroll: 1,
        adaptiveHeight: false,
        responsive: [
          {
            breakpoint: 999,
            //settings: 'unslick'
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: false,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              dots: false,
            },
          },
        ],
      };
      $(e).slick(settings);
      // $(".slick-slide").each(function (index, element) {
      //   if (
      //     $(element).find(".field-image").length == 0 &&
      //     $(element).find(".field-description").length == 0
      //   ) {
      //     $(element).css("display", "none");
      //   }
      // });
    });
  } else {
    $(".linked-thumbnail").addClass("horizontal-list");
  }
}
})(jQuery);
