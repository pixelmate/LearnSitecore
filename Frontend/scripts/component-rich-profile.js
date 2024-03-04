(function ($) {
    //modal popup
    function modalpopup(datatarget){
        $(datatarget).fadeToggle(200);    
        $('body').toggleClass('modal-open')
    }
    function popupopen($this) {
        $this.parent().find('.richprofile-modal').show();
    }
    $('.richprofilelisting .profile-listing .rich-profile').on('click', function () {
        popupopen($(this));
    });
    
   //modal close on click button
    function popupclose() {
        $('.richprofile-modal').hide();
    }
    $('.closepopup').on('click', function (e) {
        e.stopImmediatePropagation();
        popupclose();
    })
    //modal close when we click outside of the pop-up
    $('.richprofile-modal').on('click',function(){
        popupclose();
    });
    $('.modal-dialog,.modal-body').click(function(e){
        e.stopPropagation();
     });
    
     $('.store-locator  [data-toggle="modal"]').on('click', function(){         
        modalpopup($(this).data('target'))
     })
     $('.store-locator .close-btn').on('click', function(){
        modalpopup($(this).data('dismiss'))          
     })
     $('#store-overlay').on('click', function(){
        modalpopup($(this))          
     })
    

})(jQuery);
