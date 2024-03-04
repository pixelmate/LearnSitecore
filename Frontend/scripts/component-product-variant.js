(function ($) {
  function setslick($this) {
    var $asnavfor = null,
      $imgplaceholder = $this.parents(".productimage").find(".image-placeholder");
    if ($this.parent().is(".iscarousel:not('.slick-initialized')")) {
      $this.slick({
        arrows: true,
        asNavFor: $imgplaceholder,
        focusOnSelect: true,
        slidesToScroll: 1,
        slidesToShow: 4,
      });
      $asnavfor = $this;
    }

    $imgplaceholder.slick({
      arrows: false,
      asNavFor: $asnavfor,
      fade: true,
      mobileFirst: true,
      slidesToScroll: 1,
      slidesToShow: 1,
      responsive: [
        {
          breakpoint: 1199,
          settings: {
            // vertical: true,
          },
        },
      ],
    });

    $(".slick-initialized video").length ? $(".slick-initialized video").length.removeAttr("autoplay") : "";

    $('.swipebox').swipebox({
      removeBarsOnMobile: false,
      loopAtEnd: true,
    });
    setTimeout(function () {
      $(".image-placeholder").trigger("click");
    }, 1500);
  }

  function setselectbox($this, selectboxdata) {
    var selectbox = $this;
    if (!($this.is(".product-variant"))) {
      $this = $this.parents(".product-variant").eq(0);
    }

    var primaryval = $this.find("#primaryvariationvalue").val() != null ? $this.find("#primaryvariationvalue").val() : "",
      secondaryval = $this.find("#secondaryvariationvalue"),
      tertiaryval = $this.find("#tertiaryvariationvalue");

    if (!(selectbox.is("#secondaryvariationvalue")) && !(selectbox.is("#tertiaryvariationvalue"))) {
      secondaryval.empty();
      tertiaryval.empty();
      selectboxdata.ProductVariantList.filter(function (val) {
        if (val.Primary == primaryval && !(secondaryval.find("option[value='" + val.Secondary + "']").length) && val.Secondary != "") {
          secondaryval.append($("<option></option>").attr("value", val.Secondary.replace(/\s/g, '')).text(val.SecondaryText));
        }
      });

      //show if have results.
      secondaryval.find("option").length ? secondaryval.show() && secondaryval.prev().show() : secondaryval.hide() && secondaryval.prev().hide();
    }
    if (!(selectbox.is("#tertiaryvariationvalue"))) {
      tertiaryval.empty();
      selectboxdata.ProductVariantList.filter(function (val) {
        if (val.Primary == primaryval && val.Secondary == secondaryval.val() && !(tertiaryval.find("option[value='" + val.Tertiary + "']").length) && val.Tertiary != "") {
          tertiaryval.append($("<option></option>").attr("value", val.Tertiary.replace(/\s/g, '')).text(val.TertiaryText));
        }
      });
    }
    // show if have results.
    tertiaryval.find("option").length ? tertiaryval.show() && tertiaryval.prev().show() : tertiaryval.hide() && tertiaryval.prev().hide();
  }

  function bindvariantdata($this, selectboxdata) {
    if (!($this.is(".product-variant"))) {
      $this = $this.parents(".product-variant").eq(0);
    }

    var primaryval = $this.find("#primaryvariationvalue").val() != null ? $this.find("#primaryvariationvalue").val() : "",
      secondaryval = $this.find("#secondaryvariationvalue").val() != null ? $this.find("#secondaryvariationvalue").val() : "",
      tertiaryval = $this.find("#tertiaryvariationvalue").val() != null ? $this.find("#tertiaryvariationvalue").val() : "",
      productimage = $this.parents("main").eq(0).find(".productimage"),
      gallarydata = JSON.parse(productimage.length ? productimage.attr("data-gallery") : "");

    //widged variant binding ...
    var productsku = "";
    selectboxdata != "" ? selectboxdata.ProductVariantList.filter(function (val) {
      var parentsrow = $this.parents(".row").eq(0);
      if (val.Primary == primaryval && val.Secondary == secondaryval && val.Tertiary == tertiaryval) {
        productsku = val.VariantSKU;
        parentsrow.parents("main").find(".ps-widget").attr("ps-sku", val.VariantSKU);
        parentsrow.parents("main").find(".ps-widget").attr("data-ps-sku", val.VariantSKU);
        PriceSpider != null || PriceSpider != undefined ? PriceSpider.rebind() : "";
        parentsrow.parents("main").find(".variant-description").empty();
        parentsrow.parents("main").find(".variant-description").html("<div class='text-wrap'>" + val.VariantDescription + "</div>");
        val.VariantUPC ? parentsrow.parents("main").find(".variant-id").empty(): null ;
        val.VariantUPC ? parentsrow.parents("main").find(".variant-id").html("<p class='variant-text-color'>UPC#:<span>" + val.VariantUPC + "</span></p>") : "" ;
      }
    }) : "";

    // gallery data binding...
    gallarydata != "" ? gallarydata.ProductVariantList.filter(function (val) {
      if (productsku == val.VariantSKU && val.ProductMediaList.length) {
        productimage.find(".image-container.slick-initialized").length ? productimage.find(".image-container.slick-initialized").slick('unslick') : "";
        productimage.find(".image-placeholder.slick-initialized").length ? productimage.find(".image-placeholder.slick-initialized").slick('unslick') : "";
        productimage.find(".image-container,.image-placeholder").empty();
        val.ProductMediaList.filter(function (val) {
          if (val.MediaType == "image") {
            productimage.find(".image-container").append(`<div class="product-tile field-image" tabindex="0"><img src="${val.MediaURL}" /></div>`);
            productimage.find(".image-placeholder").append(`<a href="${val.MediaURL}" class="swipebox"><img src="${val.MediaURL}" /></a>`);
          } else if (val.MediaType == "youtube") {
            productimage.find(".image-container").append(`<div class="product-tile video-checkbox" tabindex="0"><img src="https://i.ytimg.com/vi/${val.YoutubeId}/default.jpg" /></div>`);
            productimage.find(".image-placeholder").append(`<a href="https://www.youtube.com/embed/${val.YoutubeId}" class="swipebox"><iframe src="https://www.youtube.com/embed/${val.YoutubeId}" ></iframe></a>`);
          } else if (val.MediaType == "video") {
            productimage.find(".image-container").append(`<div class="product-tile internal" tabindex="0"><video><source src="${val.MediaURL}" /></video></div>`);
            productimage.find(".image-placeholder").append(`<a href="${val.MediaURL}" class="swipebox"><video><source src="${val.MediaURL}" /></video></a`);
          }
        });
        //productimage.find(".image-placeholder").html(productimage.find(".image-container > div").eq(0).html());
        setslick(productimage.find(".inner-wrap .image-container"));
      }
    }) : "";
  }

  $(".component.product-variant").each(function () {
    var productData = JSON.parse($(this).attr("data-product"));
    var productVariantList = productData.ProductVariantList;
    
    if (window.location.search.length) {
      var urlParams = new URLSearchParams(window.location.search);
      var productsku = urlParams.get("sku");
      
      for (var item of productVariantList) {
        if (productsku == item.VariantSKU) {
          var primaryVal = item.Primary,
            secondaryVal = item.Secondary,
            tertiaryVal = item.Tertiary;
        }
      }
      
      $('#secondaryvariationvalue').empty()
      $('#tertiaryvariationvalue').empty()

      for (var i of productVariantList){
        if (primaryVal == i.Primary && i.Secondary != ""){
          $('#secondaryvariationvalue').append($("<option></option>").attr("value", i.Secondary).text(i.SecondaryText)); 
        }
        if (primaryVal == i.Primary && i.Secondary != "" && i.Tertiary != ""){
          $('#tertiaryvariationvalue').append($("<option></option>").attr("value", i.Tertiary).text(i.TertiaryText)); 
        }
      } 

      $(this).find('#primaryvariationvalue option[value="' + primaryVal + '"]').prop("selected", true);
      $(this).find('#secondaryvariationvalue option[value="' + secondaryVal + '"]').prop("selected", true);
      $(this).find('#tertiaryvariationvalue option[value="' + tertiaryVal + '"]').prop("selected", true);
      
      $(this).find("#primaryvariationvalue,#secondaryvariationvalue,#tertiaryvariationvalue").on("change", function () {
          const url = new URL(window.location);
          url.searchParams.delete("sku");
          window.history.replaceState({}, "", url);         
          bindvariantdata($(this), productData);       
        });
      
      bindvariantdata($(this), productData);
    }

    var $this = $(this), selectboxdata = "";
    selectboxdata = JSON.parse($this.attr("data-product"));

    //bind selectbox secondary and teritary.
    $(this).find("#primaryvariationvalue,#secondaryvariationvalue,#tertiaryvariationvalue").on("change", function () {
      setselectbox($(this), selectboxdata);
      bindvariantdata($this, selectboxdata);
      $(".component.product-variant select").each(function () {         
        if($(this).find('option').length > 1 ){
            $(this).removeAttr('disabled');
          }else{
            $(this).prop("disabled",true);
          }
        
      });
    });
    bindvariantdata($this, selectboxdata);   
  });

  $(document).on('click', ".component.productimage .inner-wrap:not('.iscarousel') .image-container .product-tile", function () {
    var $this = $(this);
    $('.image-placeholder').slick('slickGoTo', $this.index());
  });
  
})(jQuery);
