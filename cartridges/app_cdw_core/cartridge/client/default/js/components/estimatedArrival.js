'use strict';

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

module.exports = function () {
    $('.est-zipCode').keyup(function () {
        var regex = new RegExp(/[^0-9]/g);
        var containsNonNumeric = this.value.match(regex);
        if (containsNonNumeric)
            this.value = this.value.replace(regex, '');
    });

    $('.zip-code-submit-btn').on('click',function (e) {
        e.preventDefault();
        var zipCode = $('input[name=zipCode]').val();
        
        if ($('input[name=zipCode]').val().length != 5) {
            $('.invalid-zipCode').html('Please enter a valid zipcode');
        } else {
            $('.zip-code-submit-btn').attr('data-dismiss', 'modal');

            $.spinner().start();
            var estimatedArrivalURL = $('.zip-code-submit-btn').attr('data-action');
            
            $.ajax({
                url: estimatedArrivalURL,
                type: 'GET',
                data: {
                    zipCode: zipCode 
                },
                success: function (data) {
                    $('.estimated-arrival').html(data);
                    setCookie('zipCode',zipCode,7);
                    $('.invalid-zipCode').empty();
                    $('.zip-code-submit-btn').removeAttr('data-dismiss', 'modal');
                    $.spinner().stop();
                },
                error: function (err) {
                    $('.est-zipCode').val("");
                    $('.invalid-zipCode').empty();
                    $('.zip-code-submit-btn').removeAttr('data-dismiss', 'modal');
                    $.spinner().stop();
                }
            });
        }
    });

    $('.zip-code-close-btn').on('click',function (e) { 
        $('.invalid-zipCode').empty();
        $('.est-zipCode').val("");
    });

    $('.close').on('click',function (e) { 
        $('.invalid-zipCode').empty();
        $('.est-zipCode').val("");
    });
};