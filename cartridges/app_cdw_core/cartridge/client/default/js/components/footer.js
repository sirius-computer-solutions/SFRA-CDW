'use strict';

var scrollAnimate = require('base/components/scrollAnimate');

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for email sign-up
 */
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    var $messageWrapper=$('.email-signup-message');
    if ($messageWrapper.length === 0) {
        $('body').append(
           '<div class="email-signup-message"></div>'
        );
        $messageWrapper=$('.email-signup-message');
    }
    else {
        $messageWrapper.html('');
    }

    $messageWrapper
        .append('<div class="email-signup-alert text-center ' + status + '">' 
        + data.msg 
        + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
        + '</div>');

    $messageWrapper.find('.closeX').on('click', function(){
        $messageWrapper.remove();
        button.removeAttr('disabled');
    });
}

function isValidZipCode(text)
{
    var zipCode = /^\d{5}$|^\d{5}-\d{4}$/;
    if(text.match(zipCode)) {
        return true;
      
    }else {
      return false;
    }
 
}

function isValidEmail(text)
{
    var email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(text.match(email)) {
        return true;
      
    }else {
      return false;
    }
 
}

module.exports = function () {
    $('.back-to-top').click(function () {
        scrollAnimate();
    });

    $('.subscribe-email').on('click', function (e) {
        e.preventDefault();
        $('.invalid-footer-email').hide();
        $('.invalid-footer-zipCode').hide();
        var url = $(this).data('href');
        var button = $(this);
        var validForm = true;
        var emailId = $('input[name=hpEmailSignUp]').val();
        var zipCode = $('input[name=hpZipSignUp]').val();

        if(!isValidEmail(emailId)) {
            $('.invalid-footer-email').show();
            validForm =false;
        }

        if(!isValidZipCode(zipCode)) {
            $('.invalid-footer-zipCode').show();
            validForm =false;
        }

        var data = {
            emailId: emailId,
            zipCode: zipCode
        };

        $('body').trigger('footer:newsletterSignup', data);

        $.spinner().start();
        $(this).attr('disabled', true);
        if(validForm) {
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    emailId: emailId,
                    zipCode: zipCode
                },
                success: function (data) {
                    displayMessage(data, button);
                },
                error: function (err) {
                    displayMessage(err, button);
                }
            });
        } else{
            $.spinner().stop();
            button.removeAttr('disabled');
        }

    });
};
