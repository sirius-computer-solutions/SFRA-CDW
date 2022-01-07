'use strict';

var formValidation = require('base/components/formValidation');
var createErrorNotification = require('base/components/errorNotification');

var base = require('base/login/login');

/**
 * REgistration action
 */
 function register() {
    $('form.registration').submit(function (e) {
        var form = $(this);
        e.preventDefault();
        $('.g-captcha-error-message').empty();
        var url = form.attr('action');
        form.spinner().start();
        $('form.registration').trigger('login:register', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
                form.spinner().stop();
                if (!data.success) {
                    if(data.errorField) {
                        $('.g-captcha-error-message').empty().show().append(data.message);
                    }
                    
                    var $recaptcha = $('.g-recaptcha iframe');
                    if ($recaptcha.length) {
                        $recaptcha.each(function () {
                            var $this = $(this),
                                recaptchaSoure = $this[0].src;
                            $this[0].src = '';
                            $this[0].src = recaptchaSoure;
                            // setInterval(function () { $this[0].src = recaptchaSoure; }, 5);
                        });
                    }

                    $('form.registration').trigger('login:register:error', data);
                    formValidation(form, data);
                } else {
                    $('form.registration').trigger('login:register:success', data);
                    location.href = data.redirectUrl;
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                } else {
                    createErrorNotification($('.error-messaging'), err.responseJSON.errorMessage);
                }

                form.spinner().stop();
            }
        });
        return false;
    });
}

base.register = register;

module.exports = base;
