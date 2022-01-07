'use strict';

module.exports = function () {
    $(function(){
        $('img').not('[onerror]').on("error", function () {
            $(this).attr("src", $('header').data('image-na'));  
        });
        $('.hero-bg-search-banner-image').each(function () {
            let image_url = $(this).data('imgsrc');
            let element = $(this);
            $.get(image_url)
                .done(function() { 
                    element.attr("src", image_url); 
                }).fail(function() { 
                });
             
        });
    })
};