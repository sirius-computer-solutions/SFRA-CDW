'use strict';

/**
 * Display the returned message.
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for contact us sign-up
 */
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    var $messageWrapper=$('.contact-us-signup-message');
    if ($messageWrapper.length === 0) {
        $('body').append(
            '<div class="contact-us-signup-message"></div>'
        );
        $messageWrapper=$('.contact-us-signup-message');
    }
    else {
        $messageWrapper.html('');
    }
    $messageWrapper
        .append('<div class="contact-us-signup-alert text-center ' + status + '" role="alert">' 
        + data.msg 
        + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
        + '</div>'
    );

    $messageWrapper.find('.closeX').on('click', function(){
        $messageWrapper.remove();
        button.removeAttr('disabled');
    });
}

module.exports = {
    subscribeContact: function () {
        $('form.contact-us').submit(function (e) {
            e.preventDefault();
            var form = $(this);
            var button = $('.subscribe-contact-us');
            var url = form.attr('action');

            $.spinner().start();
            button.attr('disabled', true);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    displayMessage(data, button);
                    if (data.success) {
                        $('.contact-us').trigger('reset');
                    }
                },
                error: function (err) {
                    displayMessage(err, button);
                }
            });
        });
    }
};
