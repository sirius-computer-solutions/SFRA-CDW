'use strict';



/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
 function handlePostCartAdd(response) {
    if(!response.error) {
        $('.minicart').trigger('count:update', response);
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        $('.minicart').trigger('mouseenter', response);
    }
    var messageType = response.error ? 'alert-danger' : 'alert-success';
    // show add to cart toast
    if (response.newBonusDiscountLineItem
        && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        chooseBonusProducts(response.newBonusDiscountLineItem);
    } else if (response.error){
        var $messageWrapper=$('.add-to-cart-messages');
        if ($messageWrapper.length === 0) {
            $('body').append(
                '<div class="add-to-cart-messages"></div>'
            );
            $messageWrapper=$('.add-to-cart-messages');
        }
        else {
            $messageWrapper.html('');
        }
        
        $messageWrapper.append(
            '<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">'
            + response.message
            + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
            + '</div>'
        );

        $messageWrapper.find('.closeX').on('click', function(){
            $('.add-to-basket-alert').remove();
        });
    }
}

// module.exports = function () {
// /*
//     $('.quantity-select').on('focusout', function (event) {
//         var pid = $('.product-detail:not(".bundle-item")').data('pid');
//         var qty = $('.quantity-select').val();
//         var params = "?pid="+pid+"&quantity="+qty;
//         var validForm = true;

//         if(qty == null || qty == '' || qty <= 0) {
//             validForm = false;
//         }

//         var url=$('.quantity-select').attr('data-action')+params;
//         if(validForm) {
//             $.ajax({
//                 url: url,
//                 type: 'get',
//                 dataType: 'json',
//                 success: function (data) {
//                     if(data.productAvailability.availability.messages[0]) {
//                         if(!data.productAvailability.available){
//                             $('.os-confirmation-btn').hide();
//                         } else {
//                             $('.os-confirmation-btn').show();
//                         }
//                         $('.over-sell-confirmation-body').text(data.productAvailability.availability.messages[0]);
//                         $('#oversellConfModal').modal('show');
//                     }
//                 },
//                 error: function (err) {
    
//                 }
//             });
//         } else {
//             // if ($('.add-to-cart-messages').length === 0) {
//             //     $('body').append(
//             //         '<div class="add-to-cart-messages"></div>'
//             //     );
//             // }
    
//             // $('.add-to-cart-messages').append(
//             //     '<div class="alert alert-danger add-to-basket-alert text-center" role="alert">'
//             //     + "The value in the quantity field is invalid. Ensure the value is positive integer and try again."
//             //     + '</div>'
//             // );
    
//             // setTimeout(function () {
//             //     $('.add-to-basket-alert').remove();
//             // }, 5000);


//             $('.quantity-select').val("1");
//         }

//     });
// */
// };

function handleOverSell() {
    $('.os-confirmation-btn').on('click',function (e) {
        e.preventDefault();
        
        // var pid = $('.product-detail:not(".bundle-item")').data('pid');
        var pid = $(this).data('pid');
        var qty = $(this).data('qty');
        var form = {
            pid: pid,
            quantity: qty
        };

        $.spinner().start();
        $.ajax({
            url: $('.add-to-cart-url').val(),
            method: 'POST',
            data: form,
            success: function (data) {
                $('body').trigger('product:afterAddToCart', data);
                handlePostCartAdd(data);
                $.spinner().stop();
                miniCartReportingUrl(data.reportingURL);
                $('.quantity-select').val("1");
            },
            error: function () {
                $.spinner().stop();
                $('.quantity-select').val("1");
            }
        });
        
    });

    $('.os-cancel-btn').on('click',function (e) { 
        $('.quantity-select').val("1");
        $.spinner().stop();
    });
    
    $('#oversellConfModal .close').on('click',function (e) { 
        $('.quantity-select').val("1");
        $.spinner().stop();
    });    
}


/**
 * Makes a call to the server to report the event of adding an item to the cart
 *
 * @param {string | boolean} url - a string representing the end point to hit so that the event can be recorded, or false
 */
 function miniCartReportingUrl(url) {
    if (url) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function () {
                // reporting urls hit on the server
            },
            error: function () {
                // no reporting urls hit on the server
            }
        });
    }
}

$('.quantity-select').keyup(function () {
    var regex = new RegExp(/[^0-9]/g);
    var containsNonNumeric = this.value.match(regex);
    if (containsNonNumeric)
        this.value = this.value.replace(regex, '');
});


var exportDetails = $.extend({}, { handleOverSell: handleOverSell });

module.exports = exportDetails;