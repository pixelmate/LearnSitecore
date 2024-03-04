(function ($) {
  $('button[data-toggle="collapse"]').on("click", function () {
    var dataTarget = $(this).attr("data-target");
    if ($(dataTarget).hasClass("show")) {
      $(dataTarget).removeClass("show");
      $(this).attr("aria-expanded", false);
    } else {
      $(dataTarget).addClass("show");
      $(this).attr("aria-expanded", true);
    }
  });

  // for desktop open all accordion
  
  function accordionResponsive(){
    var contentWrapper = $(".facet-wrapper .collapse"),
        toggleButton = $('.facet-wrapper button[data-toggle="collapse"');

    if ($(window).width() > 991 && !contentWrapper.hasClass('.show')) {
      contentWrapper.addClass("show");
      toggleButton.attr("aria-expanded", true);
    }    
  }
  accordionResponsive();
  $(window).resize(function (){
    accordionResponsive();
  });
  
})(jQuery);
