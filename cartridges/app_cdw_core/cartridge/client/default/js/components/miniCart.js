'use strict';

var cart = require('../cart/cart');

var updateMiniCart = true;

var base = function () {
    cart();

    $('.minicart').on('count:update', function (event, count) {
        if (count && $.isNumeric(count.quantityTotal)) {
            $('.minicart .minicart-quantity').text(count.quantityTotal);
            $('.minicart .minicart-link').attr({
                'aria-label': count.minicartCountOfItems,
                title: count.minicartCountOfItems
            });
        }
    });

    $('.minicart').on('mouseenter focusin touchstart', function () {
        if ($('.search:visible').length === 0) {
            return;
        }
        var url = $('.minicart').data('action-url');
        var count = parseInt($('.minicart .minicart-quantity').text(), 10);

        if (count !== 0 && $('.minicart .popover.show').length === 0) {
            if (!updateMiniCart) {
                $('.minicart .popover').addClass('show');
                return;
            }

            $('.minicart .popover').addClass('show');
            $('.minicart .popover').spinner().start();
            $.get(url, function (data) {
                $('.minicart .popover').empty();
                $('.minicart .popover').append(data);
                updateMiniCart = false;
                $.spinner().stop();
            });
        }
    });
    $('body').on('touchstart click', function (e) {
        if ($('.minicart').has(e.target).length <= 0 && !e.target.classList.contains('closeX')) {
            $('.minicart .popover').removeClass('show');
        }
    });
    // $('.minicart').on('mouseleave focusout', function (event) {
    //     if ((event.type === 'focusout' && $('.minicart').has(event.target).length > 0)
    //         || (event.type === 'mouseleave' && $(event.target).is('.minicart .quantity'))
    //         || $('body').hasClass('modal-open')) {
    //         event.stopPropagation();
    //         return;
    //     }
    //     $('.minicart .popover').removeClass('show');
    // });
    $('body').on('change', '.minicart .quantity', function () {
        if ($(this).parents('.bonus-product-line-item').length && $('.cart-page').length) {
            location.reload();
        }
    });
    $('body').on('product:afterAddToCart', function () {
        updateMiniCart = true;
    });
    $('body').on('cart:update', function () {
        updateMiniCart = true;
    });
};

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 */
function displayMessageAndRemoveFromCart(data) {
    $.spinner().stop();
    var status = data.success ? 'alert-success' : 'alert-danger';

    var $messageWrapper=$('.add-to-cart-messages');
    if ($messageWrapper.length === 0) {
        $('body').append('<div class="add-to-cart-messages "></div>');
        $messageWrapper=$('.add-to-cart-messages');
    }
    else {
        $messageWrapper.html('');
    }
    $('.add-to-cart-messages')
        .append('<div class="alert add-to-basket-alert text-center ' + status + '">' 
                + data.msg 
                + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
                + '</div>');

    $messageWrapper.find('.closeX').on('click', function(){
        $('.add-to-basket-alert').remove();
    });
    
    var $targetElement = $('a[data-pid="' + data.pid + '"]').closest('.product-info').find('.remove-product');
    var itemToMove = {
        actionUrl: $targetElement.data('action'),
        productID: $targetElement.data('pid'),
        productName: $targetElement.data('name'),
        uuid: $targetElement.data('uuid')
    };
    $('body').trigger('afterRemoveFromCart', itemToMove);
    setTimeout(function () {
        $('.cart.cart-page #removeProductModal').modal();
    }, 2000);
}
/**
 * move items from Cart to wishlist
 * returns json object with success or error message
 */
function moveToWishlist() {
    $('body').on('click', '.product-move .move', function (e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var pid = $(this).data('pid');
        var optionId = $(this).closest('.product-info').find('.lineItem-options-values').data('option-id');
        var optionVal = $(this).closest('.product-info').find('.lineItem-options-values').data('value-id');
        optionId = optionId || null;
        optionVal = optionVal || null;
        if (!url || !pid) {
            return;
        }

        $.spinner().start();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: {
                pid: pid,
                optionId: optionId,
                optionVal: optionVal
            },
            success: function (data) {
                displayMessageAndRemoveFromCart(data);
            },
            error: function (err) {
                displayMessageAndRemoveFromCart(err);
            }
        });
    });
}

module.exports = {
    base: base,
    moveToWishlist: moveToWishlist
};
