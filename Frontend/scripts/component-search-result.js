(function ($) {
  /* variable declare */
  var scrollenabled = true, lastScrollTop = 0, WAIT = 100;

  /* Function definations starts*/
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function getloadmoreresults($this) {
    var searchType = $this.parent().attr("data-searchtype"),
      pagesize = $this.parent().attr("data-pagesize"),
      $productlist = $this.parents(".product-result-tiles").eq(0).find(".product-list"),
      pageNumber = $this.parent().attr("data-initpage");
    var valuespreservedlisting = $this.parents(".product-result-tiles").eq(0).find("#values-preserved-listing");
    if (valuespreservedlisting != undefined) {
      var gridSelection = valuespreservedlisting.attr("data-gridclasstype"),
        hidedescriptionontiles = valuespreservedlisting.attr("data-hidedescriptionontiles"),
        hidetitleontiles = valuespreservedlisting.attr("data-hidetitleontiles"),
        articlelistingfacettype = valuespreservedlisting.attr("data-articlelistingfacettype"),
        checktoloadchildarticlesonly = valuespreservedlisting.attr("data-checktoloadchildarticlesonly"),
        filterorder = valuespreservedlisting.attr("data-filterorder"),
        listingsortdirection = valuespreservedlisting.attr("data-listingsortdirection"),
        listingsortorder = valuespreservedlisting.attr("data-listingsortorder"),
        descriptionfieldtype = valuespreservedlisting.attr("data-descriptionfieldtype"),
        descriptionlengthlimit = valuespreservedlisting.attr("data-descriptionlengthlimit") != null ? valuespreservedlisting.attr("data-descriptionlengthlimit") : 0;
    }
    if ($this.parent().attr("data-initpage") == parseInt($this.parent().attr("data-totalpage")) - 1) {
      $this.parent().addClass("d-none");
    }
    $.ajax({
      type: "POST",
      data: {
        "SearchItemId": $("#context-item").val(),
        "SearchTerm": getParameterByName("q"),
        "Category": searchType,
        "SearchCount": pagesize,
        "SkipCount": (pageNumber * pagesize),
        "Filters": getParameterByName("f"),
        "GridSelection": gridSelection,
        "HideDescriptionOnTiles": hidedescriptionontiles,
        "HideTitleOnTiles": hidetitleontiles,
        "ArticleListingFacetType": articlelistingfacettype,
        "CheckToLoadChildArticlesOnly": checktoloadchildarticlesonly,
        "FilterOrder": filterorder,
        "ListingSortDirection": listingsortdirection,
        "ListingSortOrder": listingsortorder,
        "DescriptionLengthLimit": descriptionlengthlimit,
        "DescriptionFieldType": descriptionfieldtype,
        "Language": $('html').attr('lang')
      },
      url: "/api/sitecore/search/GlobalLoadMoreResult",
      success: function (data) {
        if (data == null && data.result.Results.length) {
          return;
        }
        $.each(data.result.Results, function (key, value) {
          let description = value.ResultItem.OpengraphDescription;
          if(data.result.DescriptionFieldType != undefined)
          {
            let descriptionFieldType = data.result.DescriptionFieldType;
            if(descriptionfieldtype ==="extendedcontent_t")
            {
              description = value.ResultItem.ExtendedContent;
            }
            else if(descriptionfieldtype ==="longtitle_t")
            {
              description = value.ResultItem.LongTitle;
            }
          }
          
          let contentUrl = (typeof value.ResultItem.RedirectUrl === "string" && value.ResultItem.RedirectUrl.trim().length > 0) ? value.ResultItem.RedirectUrl : value.ResultItem.ContentUrl;
          let rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
          if (description != null && data.result.HideDescriptionOnTiles !== true) {
            let limit = $("#values-preserved-listing").attr("data-descriptionlengthlimit") != null ? $("#values-preserved-listing").attr("data-descriptionlengthlimit") : 0;
            if (limit != undefined && limit > 0) {
              description = retruncate(description, limit);
            }
          }
          $productlist.append(`
               <li class="col-12 ${data.result.GridSelection}">
                   <div class="cgp-product h-100">
                       <div class="image-holder">
                       ${value.ResultItem.ComputedImage != null  ? `
                           <a href="${contentUrl}">
                           ${value.ResultItem.ComputedImage}
                           </a>
                       `: ``}
                       </div>
                       <div class="body-copy">
                           ${data.result.HideTitleOnTiles!==true ? `
                           <h3><a href="${contentUrl}">${value.ResultItem.Title}</a></h3>`: ``}
                           ${description != null && data.result.HideDescriptionOnTiles !== true ? `<p>${description}</p>` : ``}
                       </div>
                   </div>
               </li>
             `);
        })
        /*again enable loading on scroll... */
        $this.parent().attr("data-initpage", (parseInt($this.parent().attr("data-initpage")) + 1));
        scrollenabled = true;
      },
      error: function (data) {
        // console.log("Error occured!!");
      },
    });
  }

  function showhideloadmore() {
    $(".product-wrap .product-result-tiles").each(function () {
      var $this = $(this), loadmore = $(this).find(".load-more-result");
      var totalcount = $this.find(".total-count").val(),
        pageno = loadmore.attr("data-initpage"),
        pagesize = loadmore.attr("data-pagesize");
      loadmore.attr("data-totalpage", Math.ceil(totalcount / pagesize));
      if (totalcount > 0 && (totalcount > (pageno * pagesize))) {
        loadmore.removeClass("d-none");
      }
    })
  }

  function retruncate(text,max) {
    return text && text.length > max ? text.slice(0,max).split(' ').slice(0, -1).join(' ') + '...' : text
}
  function gotTop() {
    $(".product-wrap .product-result-tiles").length ? window.scrollTo(0, 0) : "";
  }
  /* Function definations ends */





  /** Events defination and calling **/
  if (!($(".on-page-editor").length)) {
    showhideloadmore();
  }
  
  $(window).on("load", function () {
    if (!($(".on-page-editor").length)) {
      gotTop();
    }
  });

  $(window).scroll(_.throttle(function () {
    if (!($(".on-page-editor").length)) {
      var st = $(this).scrollTop();
      if (st > lastScrollTop && scrollenabled) {
        $('.product-wrap .product-result-tiles').each(function () {
          var $this = $(this), button = $(this).find(".load-more-result");
          if (button.attr('data-initpage') <= button.attr('data-scrollsize') && $(window).scrollTop() >= ($(this).offset().top + $this.outerHeight() - window.innerHeight) * 0.9) {
            getloadmoreresults($this.find(".loadresult"));
            scrollenabled = false;
          }
        });
      }
      lastScrollTop = st;
    }
  }, WAIT));

  $(".product-wrap .product-result-tiles .loadresult").on("click", function () {
    var $this = $(this);
    getloadmoreresults($this);
  });

  /** Event defination and calling  **/
})(jQuery);