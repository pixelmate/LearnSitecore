(function ($) { 
  /* Global Variable declare */

  /* Method declaration Block */
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  function updateQueryStringParameter(url, param, paramVal) {
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
      var tmpAnchor = additionalURL.split("#");
      var TheParams = tmpAnchor[0];
      TheAnchor = tmpAnchor[1];
      if (TheAnchor){
        additionalURL = TheParams;
      }
      tempArray = additionalURL.split("&");
      for (var i = 0; i < tempArray.length; i++) {
        if (tempArray[i].split('=')[0] != param) {
          newAdditionalURL += temp + tempArray[i];
          temp = "&";
        }
      }
    }
    else {
      var tmpAnchor = baseURL.split("#");
      var TheParams = tmpAnchor[0];
      TheAnchor = tmpAnchor[1];
      if (TheParams){
        baseURL = TheParams;
      }
    }
    if (TheAnchor)
      paramVal += "#" + TheAnchor;
    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
  }

  function removeURLParameters(removeParams) {
    const deleteRegex = new RegExp(removeParams.join('=|') + '=')
    const params = location.search.slice(1).split('/')
    let search = []
    for (let i = 0; i < params.length; i++) if (deleteRegex.test(params[i]) === false) search.push(params[i])
    window.history.replaceState({}, document.title, location.pathname + (search.length ? '?' + search.join('&') : '') + location.hash)
  }

  /* Method declaration Block */

  /* Method & Events calling Block */
  $(document).on('keypress', '.typeahead', function (event) {
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key) && $(this).val() == "") {
       event.preventDefault();
       return false;
    }
  });

  var $typehead = $("header .global-search .typeahead");
  $(document).on('focus',"header .global-search .typeahead",function () {    
    if ($typehead.length && ($typehead.parents("form").eq(0).attr("data-disableautosugession") === "False")) {
      $(this).autocomplete({
        source: function (request, response) {
          var globalsearch = $(".global-search");
          var totalcount = parseInt(globalsearch.attr("data-MaxPredictiveResultsCount"));
          var currentitemid = $("#context-item").val();
          var product = parseInt(globalsearch.attr("data-MaxProductResultsCount"));
          var article = parseInt(globalsearch.attr("data-MaxArticleResultsCount"));
          var others = parseInt(globalsearch.attr("data-MaxOthersResultCount"));
          var searchSuggestionAPI = globalsearch.attr("data-SearchSuggestionAPI");
          return $.ajax({
            type: "GET",
            url: searchSuggestionAPI,
            cache: false,
            datatype: JSON,
            contentType: "application/json; charset=utf-8",
            data: {
              searchTerm: request.term,
              MaxPredictiveResult: totalcount,
              MaxProductCount: product,
              MaxArticleCount: article,
              MaxOthersCount: others,
              currentItemId: currentitemid
            },
            success: function (data) {
              response($.map(JSON.parse(data), function (data) {
                return {
                  label: data.title,
                  value: data.link
                };
              }));
            },
            error: function (data) {
              console.log(data);
            }
          });
        },
        classes: {
          "ui-autocomplete": "global-search-sugest",
        },
        minLength: 3,
        select: function (event, ui) {
          event.preventDefault();
          $(event).val(ui.item.label);
          window.location.href = ui.item.value;
        }
      });
    }
  }).focusout(function () {
    if ($(this).hasClass("ui-autocomplete-input") === true) {
      $(this).autocomplete("destroy");
    }
  });
  
  /* Method & Events calling Block */

  $('.product-wrap input[type="checkbox"]').on('change', function () {
    var data = {}, fdata = []
    //, loc = $('<a>', { href: window.location })[0],$this = $(this);
    $('.product-wrap input[type="checkbox"]').each(function () {
      if (this.checked) {
        if (!data.hasOwnProperty(this.name)) {
          data[this.name] = [];
        }
        data[this.name].push(encodeURIComponent(this.id));
      }
    });

    // get all keys.
    var keys = Object.keys(data);
    // iterate over them and create the fdata
    keys.forEach(function (key, i) {
      if (i > 0) { fdata += ';'; } // if its not the first key add ;

      data[key].forEach(function (q,i){
        fdata += key + ":" + q + ";";
      });
      fdata = fdata.slice(0, -1);
      //fdata += key + ":" + data[key].join('|');
    });
    // var $productlist,category="";
    // //var pdata = fdata,$productlist,category="";
    // $productlist = $this.parents(".product-wrap").eq(0).find(".product-list");
    // if($(".product-listing").length){
    //   category = "product";
    // }else if($(".article-listing").length){
    //   category = "article";
    // }else{
    //   $productlist = $this.parents(".product-wrap").eq(0).find("#search-wrapper").parent();
    // }
    window.location.href = updateQueryStringParameter(window.location.href, "f", fdata);

    //window.history.pushState({ path: updateQueryStringParameter(window.location.href, "f", fdata) }, '', updateQueryStringParameter(window.location.href, "f", fdata));
    //$productlist.empty();
    // $.ajax({
    //   type: "POST",
    //   url: "/api/sitecore/Search/GlobalSearchWithFilters",
    //   //data: pdata,
    //   data: { "SearchItemId": $("#context-item").val(), "SearchTerm": getParameterByName("q"), "Category": category, "SearchCount": 10, "SkipCount": 0, "Filters": getParameterByName("f") },
    //   success: function (response) {
    //     if (response == null) {
    //       return;
    //     }
    //     $productlist.html(response);
    //     console.log(response);
    //   }
    // });
  });

  $(document).on("submit",".global-search",function (e) {
    e.preventDefault();
    if($(this).find(".search-input").val() != ""){
      var searchsrting = $(this).find(".search-input").val();
      if ($(this).attr("action")) {
        window.location.href = updateQueryStringParameter($(this).attr("action"), "q", searchsrting);
      } else {
        window.location.href = updateQueryStringParameter(window.location.href, "q", searchsrting);
      }
    }
  });

  $(".clear-filter-btn").on("click", function () {
    window.history.pushState({}, document.title, window.location.pathname);
    location.reload();
  })

  /* retain select box vale */
  $(".global-search input").val(getParameterByName("q"));
  // document.addEventListener('touchmove', function (event) {
  //   if (event.scale !== 1) { event.preventDefault(); }
  // }, { passive: false });

})(jQuery);