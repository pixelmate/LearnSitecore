(function ($) {
    /* Function definations */
    function dataShow(details) {
        var wrapper = $('.representative-results-wrapper');
        console.log(details);
        wrapper.empty();
        wrapper.append("<h1>" + details[0].StateName + "</h1><div class='representative-wrapper'></div>");

        details[0].SalesRepModelList.filter(function (val) {
            var $image = (val.ImageURL.length && val.ImageURL != '') ? `<div class="sxa-representative-img-wrapper"><img src="${val.ImageURL}" /></div>` : "",
                $name = (val.Name.length && val.Name != '') ? `<h3 class="sxa-representative-name">${val.Name}</h3>` : "",
                $salestitle = (val.SalesRepTitle.length && val.SalesRepTitle != '') ? `<p class="sxa-representative-designation">${val.SalesRepTitle}</p>` : "",
                $phone = (val.Phone.length && val.Phone != '') ? `<p class="sxa-representative-phone">${val.Phone}</p>` : "",
                $email = (val.Email.length && val.Email != '') ? `<p class="sxa-representative-email"><a href="mailto:${val.Email}">${val.Email}</a></p>` : "",
                $salesdesc = (val.Name.length && val.Name != '') ? `<p class="sxa-representative-description">${val.SalesRepDescription}</p>` : "",
                html = `
            <div class="representative-results row">
            <div class="sxa-representative-content-wrapper">
            ${$image}
            <div class="sxa-representative-caption">      
                ${$name}    
                ${$salestitle}
                ${$phone}
                ${$email}
                ${$salesdesc}
            </div>
            `;
            wrapper.find(".representative-wrapper").append(html);
        })
    }

    function getMapStateData(code, salesdata) {
        if (code) {
            var listdata = [];
            code = code.toUpperCase();
            listdata = (salesdata != "") ? salesdata.filter(function (val) {
                return val.StateCode == code;
            }) : "";
            return listdata;
        } else {
            return 'no data found';
        }
    }

    /*Function definations */

    /* Function Calling */
    var salesrepre = $(".sales-representative-map"),
        salesrepredata = $(".sales-representative-map-data"),
        salesdata = {};
    if (salesrepre.length) {
        salesrepredata.css('display', 'none');
        salesrepre.each(function () {
            var salesdata = JSON.parse($(this).attr("data-salesrepresentative")),
                path = $(this).find('#vmap svg path');

            path.on('click', function (el) {
                var state = el.target,
                    id = state.id,
                    details = getMapStateData(id.split('_')[1], salesdata);

                //remove all yellow colors
                $(this).siblings().removeClass("selected");
                $(this).attr("class", "selected");
                dataShow(details);
            });

            // on change for mobile view
            $(this).find("#select-state").on("change", function () {
                var details = getMapStateData($(this).find(':selected').val(), salesdata);
                dataShow(details);
            })

            path.hover(function (e) {
                $(this).parents(".sales-representative-map").find('#info-box').css('display', 'block');
                var state = e.target;
                var id = state.id;
                var details = getMapStateData(id.split('_')[1], salesdata);
                $('#info-box').html(details[0].StateName);
            });

            path.mouseleave(function (e) {
                $(this).parents(".sales-representative-map").find('#info-box').css('display', 'none');
            });

        })
        
        if($('#info-box').parents('.column-splitter')){
            $('#info-box').parents('.col-12').eq(1).css('position', 'static');
        }
        $(document).mousemove(function (e) {
            var vmapOffsetTop = $('#vmap').offset().top - 60;
            $('#info-box').css('top', e.pageY - vmapOffsetTop);
            $('#info-box').css('left', e.pageX - 15);            

        }).mouseover();
    }
    /* Function Calling */

})(jQuery);