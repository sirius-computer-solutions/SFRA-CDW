'use strict';

var scrollAnimate = require('base/components/scrollAnimate');

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for notify-me sign-up
 */
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    var $messageWrapper=$('.notify-me-message');
    if ($messageWrapper.length === 0) {
        $('body').append(
           '<div class="notify-me-message"></div>'
        );
        $messageWrapper=$('.notify-me-message');
    }
    else {
        $messageWrapper.html('');
    }

    $('.notify-me-message')
        .append('<div class="notify-me-alert text-center ' + status + '">' 
        + data.msg 
        + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
        + '</div>');

    $messageWrapper.find('.closeX').on('click', function(){
        $messageWrapper.remove();
        button.removeAttr('disabled');
    });
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

    $('.btn-notify-me-submit').on('click', function (e) {
        e.preventDefault();
        $('.invalid-notify-me-email').hide();
        var url = $(this).data('url');
        var button = $(this);
        var validForm = true;
        var emailId = $('input[name=notifyMeEmail]').val();
        var addToEmailList = $('input[name=addtoemaillist]').is(':checked');

        if(!isValidEmail(emailId)) {
            $('.invalid-notify-me-email').show();
            validForm =false;
        }
        var data = {
            emailId: emailId,
            addToEmailList: addToEmailList
        }
        
        $('body').trigger('product:notifyMe', data);

        $.spinner().start();
        $(this).attr('disabled', true);
        if(validForm) {
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    emailId: emailId,
                    addToEmailList: addToEmailList
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
