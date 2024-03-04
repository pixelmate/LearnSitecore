(function ($) {
  if ($(".linked-thumbnail.quick-links").length > 0) {
    $(".linked-thumbnail.quick-links ul li").each(function () {
      if ($(this).find(".field-description").length === 0) {
        $(this).css("display", "none");
      }
    });
  }
})(jQuery);
