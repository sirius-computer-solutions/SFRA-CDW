'use strict';

var base = require('./base');
var detail = require('instorepickup/product/details');

/**
 * Update availability on change event on quantity selector and on store:afterRemoveStoreSelection event.
 * If store has been selected, exit function otherwise proceed to update attributes.
 * @param {Object} element DOM Element.
 */
function updateAvailability(element) {
    var searchPID = $(element).closest('.product-detail').attr('data-pid');
    var selectorPrefix = '.product-detail[data-pid="' + searchPID + '"]';
    if ($(selectorPrefix + ' .selected-store-with-inventory').is(':visible')) {
        return;
    }

    var $productContainer = $(element).closest('.product-detail');
    if (!$productContainer.length) {
        $productContainer = $(element).closest('.modal-content').find('.product-quickview');
    }

    if ($('.bundle-items', $productContainer).length === 0) {
        base.attributeSelect($(element).find('option:selected').data('url'),
            $productContainer);
    }
}

/**
 * Registering on change event on quantity selector and on store:afterRemoveStoreSelection event.
 */
function availability() {
    $(document).on('change', '.quantity-select', function (e) {
        e.preventDefault();
        updateAvailability($(this));
    });
    $(document).on('store:afterRemoveStoreSelection', function (e, element) {
        e.preventDefault();
        updateAvailability(element);
    });
}

$(function () {
    $('.share-icon').popover({ 
      html : true,
      content: function() {
        return $('#socialPopover').html();
      },
      container: $('#socialPopoverContainer')
    });

    if ($(window).width() < 768)
        $(".top-social-icons-container").css('padding-bottom', $('.prices-add-to-cart-actions').height() - 40 + "px");

    if ($(window).width() > 544) 
        $(".d-sm-none .promotions").empty();

    $('.modal-overlay').on('swipeleft swiperight touchstart touchend', function(e){
        e.stopPropagation();
    }).off('click').on('click', function(){
        $(this).parents('.modal').modal('hide');
    });

    $('.pdp-image .modal-dialog').on('swipeleft swiperight touchstart touchend', function(e){
        e.stopPropagation();
    });
});

$('body').on('click','.close-popover i, #fa-link',function(){
    $('.share-icon').popover('hide');
});

$('.copy-link-message .closeX').on('click', function(){
    $('.copy-link-message').addClass('d-none');
}); 

$('.pdp-image .pdp-carousel').keydown(function(e) {
    if (e.keyCode === 37) {
        // Previous
        $(".pdp-image .pdp-carousel .carousel-control-prev").click();
        return false;
    }
    if (e.keyCode === 39) {
        // Next
        $(".pdp-image .pdp-carousel .carousel-control-next").click();
        return false;
    }
});

var exportDetails = $.extend({}, base, detail, { availability: availability });

module.exports = exportDetails;
