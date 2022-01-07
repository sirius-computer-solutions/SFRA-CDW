'use strict';

var formValidation = require('base/components/formValidation');

module.exports = {

    contactAccountManager: function () {
        $('.contact-account-manager-form').submit(function (e) {
            var form = $(this);
            e.preventDefault();
            var url = form.attr('action');
            $.spinner().start();
            $('.contact-account-manager-form').trigger('header:contactAccountManager', e);
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    $.spinner().stop();
                    if (!data.success) {
                        formValidation(form, data);
                    } else {
                        // display the confirmation message 
                        $(".contact-account-manager-confirmation-message").empty().append(data.confirmationMessage);
                        $('.sales-messageContent').val("");
                    }
                },
                error: function () {
                    $.spinner().stop();
                }
            });
            return false;
        });
    },
    closeAccountManagerModal: function () {
        $('.sales-manager-modal-close').click(function (e) {
            console.log("333");
            e.preventDefault();
            //Reset the modal forms
            $('.sales-messageContent').val("");
            $(".contact-account-manager-confirmation-message").empty();

            return;
        });
    },
    checkPlatform: function() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        var platform = "desktop";
        if (/android/i.test(userAgent)) {
            platform = "android";
        }
        else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            platform = "ios";
            if (/iPhone/.test(userAgent) && !window.MSStream) {
                platform += " iphone";
            }
            else if (/iPhone/.test(userAgent) && !window.MSStream) {
                platform += " ipad";
            }
        }
        else {
            if(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1){
                platform = "ios ipad";
            }
        }
        $('html').addClass(platform);
    },
    lazyLoadImages: function(){
        var initialize = function(){
            $('img:not([src]):not(.set)').each(function() {
                var $this = $(this);
                var src = $this.data('src');
                if(src) {
                    $this.attr('src', src);
                    $this.addClass('set')
                }
            });
        }
        $(function(){
            //intialize images on page load
            initialize();
        });

        //intialize images when manually triggered
        $(document).on("image:init", initialize);

        //intialize images when modal is shown
        $(document).on('shown.bs.modal', initialize);
    }
};
