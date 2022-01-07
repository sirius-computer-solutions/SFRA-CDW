'use strict';
var shippingHelpers = require('../checkout/shipping');

function isValidUTF8length(UTF16String, maxlength) {
    if (utf8StringByteLength(UTF16String) > maxlength) {
        return false;
    }
    else {
        return true;
    }
}

function utf8StringByteLength(UTF16String) {

    if (UTF16String === null) return 0;
    
    var str = String(UTF16String);
    var oneByteMax = 0x007F;
    var twoByteMax = 0x07FF;
    var byteSize = str.length;
    
    for (var i = 0; i < str.length; i++) {
        var chr = str.charCodeAt(i);
        if (chr > oneByteMax) byteSize = byteSize + 1;
        if (chr > twoByteMax) byteSize = byteSize + 1;
    }  

    return byteSize;
}

function isValidPhone(text)
{
    var phoneno = /^\d{3}?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if(text.match(phoneno)) {
        return true;
      
    }else {
      return false;
    }
 
}

module.exports = function () {
   
    var checkMobileNumberURL = $('#checkMobileNumberURL').val();
    
    var defer = $.Deferred(); 

    $.ajax({
        url: checkMobileNumberURL,
        method: 'GET',
        dataType: 'json',
        success: function (res) {    
            if(res.hasPhoneNumber == 'false'){
                $('#paypal-phonenumber-modal').modal();
            }
        }
    });
    
    $('#savePPPhoneNumberBtn').click(function(){
        var url = $('#savePPPhoneNumberBtn').attr('data-post-url');
        var phoneNumber = $('#phoneNo').val();
        var reWhiteSpace = new RegExp(/^\s+$/);
        if (phoneNumber == "" || reWhiteSpace.test(phoneNumber)) {
            var msg = "The phone number field cannot be empty."
            $('#paypalMissingPhoneErrorMessage').html(msg);
            $('#phoneNo').focus();
            return false;
        }

        if (!isValidPhone(phoneNumber)) {
            var msg = "Please match the requested format."
            $('#paypalMissingPhoneErrorMessage').html(msg);
            $('#phoneNo').focus();
            return false;
        }
        $.ajax({
            url: url,
            method: 'POST',
            dataType: 'json',
            contentType:'application/json; charset=utf-8',
            data: phoneNumber,
            success: function (data) {   
                $('.contact-info-block .phone').val(phoneNumber);
                $('.shipping-phone').empty().append(phoneNumber);
                $('.shippingPhoneNumber').val(phoneNumber);
                $('#billing-phoneNumber').val(phoneNumber);
                $('.order-summary-phone').empty().append(phoneNumber);
                $('#paypal-phonenumber-modal').css('display','none');

                shippingHelpers.methods.shippingFormResponse(defer, data);
                if(data.order.shipping[0].selectedShippingMethod.storePickupEnabled) {
                    $('.billing-address-block .billing-address').show();
                } else {
                    $('.billing-address-block .billing-address').hide();
                }
                
                $('#paypal-content').toggle(true);
                $('#credit-card-content').toggle(false);
                $('#paypal-content').addClass("active");
                $('#credit-card-content').removeClass("active");

            }
        });
    });



};