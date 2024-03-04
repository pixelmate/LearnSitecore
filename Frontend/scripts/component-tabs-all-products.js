(function($) { 
    /* tabContend add nw Line */
    if($('.nav-tabs li').length > 0){
        $('.nav-tabs li').each(function(){
            if ($(this).text().trim().length == 0) {
                $(this).hide();
            } 
        }); 
        $('.nav-tabs > li:first-child').find('a').addClass('active');
        $('.tab-content > .tab-pane:first-child').show().addClass('active');  
    } 
    
    $('.nav-tabs li a').click(function(){ 
        $(this).closest('.container').find(' li a').removeClass('active');
        $(this).addClass('active'); 
        var currentTab = $(this).attr('href'); 
        //alert(currentTab);
        $(this).closest('.container').find('.tab-pane').hide().removeClass('active');
        $(currentTab).show().addClass('active');
        return false;
    });
})(jQuery);
