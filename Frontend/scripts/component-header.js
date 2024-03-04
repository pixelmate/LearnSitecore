//varient 3
(function ($) {
  // initializing function priority based **************************************//
  function addsubmenuclass() {
    //adding class to the li which has submenu list
    var itemWithSublist = $(".component.page-list.variant-1 ul.items li.item");

    if (itemWithSublist.length > 0) {
      $(".component.page-list.variant-1 ul.items li.item").each(function () {
        if ($(this).find(".submenu-utility-linklist").length > 0) {
          $(this).addClass("has-submenu-list");
        }
      });
    }
  }

  function addsubmenuclasssecondlevel() {
    //adding class to the li which has submenu list
    var itemWithSublist = $(".component.page-list.variant-1 ul.items li.item .submenu-utility-linklist .sub-menu-wrapper .column-splitter > div");

    if (itemWithSublist.length > 0) {
      itemWithSublist.each(function () {
        if ($(this).find(".link-list").length > 0) {
          $(this).addClass("has-sublist");
        }
      });
    }
  }

  // trigger function

  addsubmenuclass();
  addsubmenuclasssecondlevel();
  //******************************************************************************//

  //Global Variable Declaration
  var topNavigation = $('.header-global-menu ul.items li.item .has-sublist,.component.page-list ul.items li.has-submenu-list'),
    secondLevelNav = $('.component.page-list .submenu-utility-linklist .has-sublist .component.link'),
    commonHamburger = $('.component.plain-html .hamburger'),
    componentSearch = $('.header-shell .component.search-box'),
    commonSearchBox = $(".component.search-box .search-input-wrapper .custom-search-box-button"),
    offSideCanvas = $('html,body'),
    headerGlobalMenu = $('.submenu-utility-linklist, .component.page-list, .header-global-menu'),
    mobileSearchBtn = $('.header-shell .mobile-search-button'),
    topNav = $(".header-shell .utility-navigation .top-nav[mobile-view='true']"),       
    $searhinput = componentSearch.find(".search-input-wrapper input"),
    clonesearch = componentSearch.clone().addClass('d-lg-none');

  // clone serch box  
    if (componentSearch.length && componentSearch.find('.global-search').attr('data-clonesearchbox') == "True") {
      $(".header-global-menu ul.items, .page-list ul.items").append(clonesearch);
    }


  // Global function Declaration
  function cloneutilitynav() {
    if (topNav.length) {
      topNav.clone().addClass("d-lg-none top-nav-clone").appendTo(".header-shell .header-global-menu, .header-shell .component.page-list");
    }
  }

  function toplevelnavigation($this) {
    if ($this.parents('.header-global-menu').length > 0) {
      var $parent = $this.parents(".item").eq(0);
      var $sibling = $parent.siblings();      
      $parent.hasClass('open') ? $parent.removeClass("open") : $parent.addClass('open'), $sibling.removeClass('open');
    } else if ($this.parents('.page-list').length > 0) {
      var $parent2 = $this;
      var $sibling2 = $parent2.siblings();
      var $siblingItem = $this.parents('.sub-menu-wrapper').siblings().find('.has-submenu-list');
      $parent2.hasClass('open') ? $parent2.removeClass("open") : $parent2.addClass('open'), $sibling2.removeClass('open');
      $siblingItem.hasClass('open') ? $siblingItem.removeClass("open"):"";
    }
  }

  function secondlevelnavigation($this) {
    var $parent = $this.parents('.has-sublist');
    var $sibling = $parent.siblings();
    $parent.hasClass('active') ? $parent.removeClass("active") : $parent.addClass('active'), $sibling.removeClass('active');
  }

  function globalhamburger($this) {
    var $parent = $this.parents(".header-shell"),
      $megaMenu = $parent.find('.page-list div.open, .page-list li.open,.page-list div.active, .page-list li.active, .page-list ul.items');
    if ($parent.hasClass("active")) {
      $parent.removeClass("active");
      $megaMenu.removeClass('open active enable-second-level');
    } else {
      $parent.addClass("active");
      $parent.find('.search-box').removeClass('active');
    }
  }

  function globalsearchbox($this) {
    var $searchbox = $this.parents(".search-box");
    $searchbox.hasClass('active') ? $searchbox.removeClass('active') : $searchbox.addClass('active'), $('.header-shell .search-input-wrapper input').focus();
  }

  function offcanvas($this) {
    var $activeDiv = $this.find('.header-shell div, .header-shell li,.header-shell');
    $activeDiv.removeClass('active open enable-second-level');
  }

  function removesearchplaceholder() {
    var searchInput = $(".header-shell .search-box .search-input-wrapper input");    
    searchInput.val("");
  }



  //Triger event for all header with two level navigation ...
  topNavigation.on("click", function (e) {
    e.stopPropagation();
    toplevelnavigation($(this));
  });

  secondLevelNav.on('click', function (e) {
    e.stopPropagation();
    secondlevelnavigation($(this));
  })

  //Triger event for all hamburger ...
  commonHamburger.on("click", function (e) {
    e.stopPropagation();
    globalhamburger($(this));
  });

  //Triger event for all searchbox button ...
  commonSearchBox.on("click", function (e) {
    e.stopPropagation();
    globalsearchbox($(this));
  });

  // event for off canvas click 
  offSideCanvas.on('click', function () {
    offcanvas($(this));
  });

  headerGlobalMenu.on('click', function (e) {
    e.stopPropagation();
  });

  mobileSearchBtn.on('click', function (e) {
    var $inputWrapper = $('.component.search-box'),
      $headerShell = $('.component.header-shell');
    e.stopPropagation();
    $inputWrapper.hasClass('active') ? $inputWrapper.removeClass('active') : $inputWrapper.addClass('active'), $headerShell.removeClass('active'), $inputWrapper.find('.search-input-wrapper input').focus();

  })

  componentSearch.on('click', function (e) {
    e.stopPropagation();
  })

  $(window).resize(function () {
    if ($(window).width() > 991) {
      offcanvas($(this));
    }
  });


  //utility navigation cloning
  cloneutilitynav();

  //search clean and focus
  removesearchplaceholder();

})(jQuery);