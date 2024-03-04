(function ($) {
  $(".component.article-image-gallery .inner-wrap .product-tile").on('click',function () {
    var $this = $(this),
    $img = $this.clone(),
    $imgplaceholder = $this.parents(".article-image-gallery").eq(0).find(".image-placeholder");
    $imgplaceholder.empty();

    $imgplaceholder.html($img);
  });

  $(".article-image-gallery").each(function () {
    var $this = $(this);
    if ($this.find(".inner-wrap").is(".iscarousel")) {
      $this.find(".inner-wrap .image-container").slick({
        arrows: true,
        slidesToScroll: 1,
        slidesToShow: 4
      });
      //$(".slick-initialized video").length ? $(".slick-initialized video").length.removeAttr("autoplay") : "";
    }
  });
})(jQuery);
