//Match Dimentions ...

(function($) {
    $.fn.matchDimensions = function(dimension) {
  
      var itemsToMatch = $(this),
          maxHeight = 0,
          maxWidth = 0;
  
      if (itemsToMatch.length > 0) {
  
        switch (dimension) {
  
          case "height":
  
            itemsToMatch.css("min-height", "initial").each(function() {
              maxHeight = Math.max(maxHeight, $(this).height());
            }).css("min-height",maxHeight);
  
            break;
  
          case "width":
  
            itemsToMatch.css("width", "auto").each(function() {
              maxWidth = Math.max(maxWidth, $(this).width());
            }).width(maxWidth);
  
            break;
  
          default:
  
            itemsToMatch.each(function() {
              var thisItem = $(this);
              maxHeight = Math.max(maxHeight, thisItem.height());
              maxWidth = Math.max(maxWidth, thisItem.width());
            });
  
            itemsToMatch
              .css({
                "width": "auto",
                "min-height": "initial"
              })
              .css("min-height",maxHeight)
              .width(maxWidth);
  
            break;
        }
      }
      return itemsToMatch;
    };
  })(jQuery);