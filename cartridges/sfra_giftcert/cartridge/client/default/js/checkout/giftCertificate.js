'use strict';

function submitGiftCertCode() {
    $('.giftcertcode-button').click(function (e) {
        e.preventDefault();
        $.spinner().start();
        // $('.giftcert-message').hide();
        $('.coupon-missing-error').hide();
        $('.coupon-error-message').hide();
        if (!$('.giftcert-input-field').val()) {
            $('.coupon-missing-error').show();
            $.spinner().stop();
            return false;
        }

        var $giftcertcode = $('.giftcert-input-field').val();

        console.log('$giftcertcode: ' + $giftcertcode);
        var $data = $('.giftcert-input-field').attr('data-gift-cert-add');
        console.log('url: ' + $data);

        $.ajax({
            url: $('.giftcert-input-field').attr('data-gift-cert-add'),
            type: 'GET',
            dataType: 'json',
            data: 'giftCertCode=' + $giftcertcode,
            success: function (data) {
                if (data.error) {
                    $('.giftcert-message').show();
                    if(data.message) {
                        $('.coupon-error-message').empty().show().append(data.message);
                    } else {
                        $('.coupon-error-message').empty().show().append('Sorry, could not process your request now, please try again later.');
                    }
                    
                } else {
                    $('.coupon-error-message').empty();
                    if(data.noMorePaymentReq) {
                        //Update the divs to disable all other payment options here.
                        //Also disable the anymore GC Add
                        $('.giftcert-message').show().append('<div id="gc-no-more-payments-enabled" class="gc-no-more-payments-enabled"/>');
                    }
                    // console.log("totalMorePaymetRequired:"+data.totalMorePaymetRequired);
                    // console.log("totalMorePaymetRequired:"+data.totalGCsAdded);
                    $('.gc-balance-summary-total .gc-added-total-sum').empty().append("("+data.totalGCsAdded+")");
                    $('.gc-balance-summary-total .remaining-added-total-sum').empty().append(data.totalMorePaymetRequired);
                    $('.gc-balance-summary-total').show();
                    

                    // TOD: Always disable PayPal and StoreCredit as one of the GC is applied
                    
                    $('.giftcert-input-field').attr("placeholder", "Enter up to 4 codes").val("");
                    $('.giftcert-message').show().append('<div id="'+data.payInstrumentId+'" class="added-gc-message" ><button type="button" id="gc-remove-button" class="remove-btn-lg btn btn-light remove-gc" data-pid="'+data.payInstrumentId+'" data-action="/on/demandware.store/Sites-AcmeTools-Site/en_US/GiftCertificate-Remove" aria-label="Remove"><span aria-hidden="true">×</span></button>'+data.message+'</div>');
                }
                $.spinner().stop();
            },
            error: function (err) {
                $('.giftcert-message').show();
                if(err.responseText) {
                    $('.coupon-error-message').empty().show().append(err.responseText);
                } else {
                    $('.coupon-error-message').empty().show().append('Sorry, could not process your request now, please try again later.');
                }
                $.spinner().stop();
            }
        });
    });
}

function removeGiftCertCode() {

    //Logic to remove individual GC from the order 
    $('#gift-card-list').on('click','.remove-gc',function(e){
        e.preventDefault();
        $.spinner().start();

        var payInsId = $(this).attr('data-pid');
        var removeURL = $(this).attr('data-action');

        $.ajax({
            url: removeURL,
            type: 'GET',
            dataType: 'json',
            data: 'removeAll=false&payInsId=' + payInsId,
            success: function (data) {
                if (data.error) {
                    $('.giftcert-remove-error-message').show();
               } else {
                    $('.coupon-error-message').empty();
                    $('.giftcert-remove-error-message').empty();
                    //TODO: Always enable CC payment option here, StoreCredit and PayPal should be disabled
                    if(data.successfulyRemoved) {
                        $('#'+payInsId).remove();
                        //Since GC is removed currently there is a need of more payment, so remove the div tag
                        if($('.gc-no-more-payments-enabled').length) {
                            $('.gc-no-more-payments-enabled').remove();
                        }
                        // console.log("data.removeGCDiv::"+data.removeGCDiv);
                        // console.log("data.totalBalancePaymentRequired::"+data.totalBalancePaymentRequired);
                        // console.log("data.totalGCRemaining::"+data.totalGCRemaining);
                        if(data.removeGCDiv) {
                            $('.gc-balance-summary-total').hide();
                        } else {
                            $('.gc-balance-summary-total .gc-added-total-sum').empty().append("("+data.totalGCRemaining+")");
                            $('.gc-balance-summary-total .remaining-added-total-sum').empty().append(data.totalBalancePaymentRequired);
                            $('.gc-balance-summary-total').show();
                        }
                    }
                    
                }
                $.spinner().stop();
            },
            error: function (err) {
                $('.giftcert-message').show();
                if(err.responseText) {
                    $('.coupon-error-message').empty().show().append(err.responseText);
                } else {
                    $('.coupon-error-message').empty().show().append('Sorry, could not process your request now, please try again later.');
                }
                $.spinner().stop();
            }
        });        
    });

    //Logic to remove all the GCs from the order as customer selected PayPal or CC or B2B Store Credit (When GC covers the whole order)
    $('.gc-delete-confirmation-btn').click(function (e) {
        e.preventDefault();
        $.spinner().start();
        var removeURL = $(this).attr('data-action');
        $.ajax({
            url: removeURL,
            type: 'GET',
            dataType: 'json',
            data: 'removeAll=true',
            success: function (data) {
                if (data.error) {
                    //Error with GC removal so show error message
                    //$('.giftcert-remove-error-message').show();

               } else {
                    //Successfully all the GCs are remove, close the modal
                    $('.gc-to-remove-message-cc').hide();
                    $('.gc-to-remove-message-pp').hide();
                    $(".added-gc-message").remove();
                    $(".gc-no-more-payments-enabled").remove();
                    $(".gift-certificate-content").removeClass('active');
                    $('.gc-balance-summary-total').hide();
                }
                $.spinner().stop();
            },
            error: function (err) {
                $.spinner().stop();
            }
        });        
    });

}


function validateGCSelection() {

    $('.credit-card-tab').click(function (e) {
        e.preventDefault();
        if($('.gc-no-more-payments-enabled').length) {
            //Message t add in the modal is, since we already covered with GC, you still wanted to remove the GC
            $('.gc-to-remove-message-cc').show();
            $('#removeGCModal').modal();
        } else {
            $('#gift-certificate-content').removeClass('active');
            
        }
       
    });

    $('.paypal-tab').click(function (e) {
        e.preventDefault();
        // if($('.added-gc-message').length) {
        //     //Message is since GC is added and it cannot be combined with PayPal, you wanted to remove GC already added
        //     $('.gc-to-remove-message-pp').show();
        //     $('#removeGCModal').modal();
        // } else {
        //     $('#gift-certificate-content').removeClass('active');
        // }
        if($('.gc-no-more-payments-enabled').length) {
            //Message t add in the modal is, since we already covered with GC, you still wanted to remove the GC
            $('.gc-to-remove-message-cc').show();
            $('#removeGCModal').modal();
        } else {
            $('#gift-certificate-content').removeClass('active');
            
        }        

    });

    $('.store-credit-tab').click(function (e) {
        e.preventDefault();
        if($('.added-gc-message').length) {
            //Message is since GC is added and it cannot be combined with B2B Store, you wanted to remove GC already added
            $('.gc-to-remove-message-storecredit').show();
            $('#removeGCModal').modal();
        } else {
            $('#gift-certificate-content').removeClass('active');
        }

    });
    
}

function clearGCErrorMessages(){
    $('.gc-delete-cancel-btn').click(function (e) {

        if($('.gc-to-remove-message-cc').length) {
            $('.gc-to-remove-message-cc').hide();
            $('.credit-card-tab').removeClass('active');
            $('.credit-card-content').removeClass('active');
        }
        if($('.gc-to-remove-message-pp').length) {
            $('.gc-to-remove-message-pp').hide();
            $('.paypal-tab').removeClass('active');
            $('.paypal-content').removeClass('active');
        }
        if($('.gc-to-remove-message-storecredit').length) {
            $('.gc-to-remove-message-storecredit').hide();
            $('.store-credit-tab').removeClass('active');
            $('.store-credit-content').removeClass('active');
        }

        $('#gift-certificate-content').addClass('active');
        $('.gift-certificate-tab').addClass('active');

        

    });
    
}


module.exports = {
    submitGiftCertCode: submitGiftCertCode,
    removeGiftCertCode: removeGiftCertCode,
    validateGCSelection: validateGCSelection,
    clearGCErrorMessages: clearGCErrorMessages
};