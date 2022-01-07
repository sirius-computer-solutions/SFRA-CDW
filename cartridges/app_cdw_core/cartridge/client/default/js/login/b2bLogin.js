'use strict';

var formValidation = require('base/components/formValidation');

function clearRegistrationForm() {
    var form = $('form[name="dwfrm_profile"]');
    if (form) {
        $(form).find('.form-control.is-invalid').removeClass('is-invalid');
        if ($('input[name$=_organizationName]', form)) {
            $('input[name$=_organizationName]', form).val('');
        }
        if ($('input[name$=_firstname]', form)) {
            $('input[name$=_firstname]', form).val('');
        }
        if ($('input[name$=_lastname]', form)) {
            $('input[name$=_lastname]', form).val('');
        }
        if ($('input[name$=_phone]', form)) {
            $('input[name$=_phone]', form).val('');
        }
        if ($('input[name$=_email]', form)) {
            $('input[name$=_email]', form).val('');
        }
        if ($('input[name$=_logonId]', form)) {
            $('input[name$=_logonId]', form).val('');
        }
        if ($('input[name$=_logonId]', form)) {
            $('input[name$=_logonId]', form).val('');
        }
        if ($('input[name$=_password]', form)) {
            $('input[name$=_password]', form).val('');
        }
        if ($('input[name$=_passwordconfirm]', form)) {
            $('input[name$=_passwordconfirm]', form).val('');
        }
    }

    var locateform = $('form[name="locate-account"]');
    if (locateform) {
        $(locateform).find('.form-control.is-invalid').removeClass('is-invalid');
        if ($('input[name$=accountNumber]', locateform)) {
            $('input[name$=accountNumber]', locateform).val('');
        }
        if ($('input[name$=zipCode]', locateform)) {
            $('input[name$=zipCode]', locateform).val('');
        }
        if ($('#form-accountnumber-error')) {
            $('#form-accountnumber-error').empty();
        }
    }
}

module.exports = {

    accountTypes: function () {
        $('.user-account-type-selector').change(function () {
            var accountType = $(this).find("option:selected").val();
            if (accountType == '') {
                // do not display any form
                $('.individual-account').hide();
                $('.b2b-locate-account').hide();
                $('.b2b-govt-account').hide();
            } else if (accountType == "IND") { 
                // display the B2C registration form
                clearRegistrationForm();
                $('.individual-account').show();
                $('.b2b-locate-account').hide();
                $('.b2b-govt-account').hide();
            } else if (accountType == "B2B-NEW" || accountType == "GOVT-NEW") { 
                // display the B2B/GOVT registration form
                $('.individual-account').hide();
                $('.b2b-locate-account').hide();
                clearRegistrationForm();
                $('.b2b-govt-account').show();
                if (accountType == "B2B-NEW") {
                    if ($("input[name='displayACAOption']").val() == "true") {
                        $('#interestedInACA').attr('checked', true);
                        $('.interested_in_aca_b2b_govt').show();
                    } else {
                        $('#interestedInACA').attr('checked', false);
                        $('.interested_in_aca_b2b_govt').hide();
                    }
                } else {
                    $('#interestedInACA').attr('checked', true);
                    $('.interested_in_aca_b2b_govt').show();
                }
            } else if (accountType == "B2B-EXISTING" || accountType == "GOVT-EXISTING") {
                // display the Locate Account form
                $('.individual-account').hide();
                clearRegistrationForm();
                $('.b2b-locate-account').show();
                $('.b2b-govt-account').hide();
            } 
        });
    },

    locateAccount: function () {
        $('form.locateaccount').submit(function (e) {
            var form = $(this);
            e.preventDefault();
            var url = form.attr('action');
            $('#form-accountnumber-error').empty().hide();
            $.spinner().start();
            $('form.locateaccount').trigger('login:locateaccount', e);
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    if (!data.success) {
                        // display the error message 
                        $('#form-accountnumber-error').empty().append(data.errorMessage).show();
                    } else {
                        // set the retrieved information in the form fields
                        if ((data.accountDetails != undefined) && (data.accountDetails.billto != undefined)) {
                            var billTo = data.accountDetails.billto;
                            if (billTo.name != undefined) {
                                $('#registration-form-organizationName').val(billTo.name);
                            }
                            $('[name=isB2BUser]').val("true");
                            $('[name=isB2BAdmin]').val("true");
                            $('[name=isB2BAdminApproved]').val("true");
                            if (billTo.payByTerms != undefined) {
                                $('[name=isB2BPayByTerms]').val(billTo.payByTerms);
                            }
                            if (billTo.webEnabled != undefined) {
                                $('[name=isB2BWebEnabled]').val(billTo.webEnabled);
                            }
                            if (billTo.poRequired != undefined) {
                                $('[name=isB2BPORequired]').val(billTo.poRequired);
                            }
                            if (billTo.creditLimit != undefined) {
                                $('[name=b2bCreditLimit]').val(billTo.creditLimit);
                            }
                            if (billTo.balanceDue != undefined) {
                                $('[name=b2bBalanceDue]').val(billTo.balanceDue);
                            }
                            if (billTo.id != undefined) {
                                $('[name=b2bAccountNumber]').val(billTo.id);
                            }
                            if ((billTo.salesmanNo != undefined) && (billTo.salesmanName != undefined)) {
                                var salesPersonInfo = '{ ' 
                                                    + '"salesmanNo" : ' + JSON.stringify(billTo.salesmanNo) + ','
                                                    + '"salesmanName" : ' + JSON.stringify(billTo.salesmanName)
                                                    + '}';
                                $('[name=b2bSalesPersonInfo]').val(salesPersonInfo);
                            }
                        }

                        var selectedAccountType = $('.user-account-type-selector').find("option:selected").val();
                        if (selectedAccountType == "B2B-EXISTING" || selectedAccountType == "GOVT-EXISTING") {
                            // display the existing account form
                            $('.individual-account').hide();
                            $('.b2b-locate-account').hide();
                            $('.b2b-govt-account').show();
                            // display the interested in credit application option (if applicable)
                            if (selectedAccountType == "B2B-EXISTING") {
                                if ($("input[name='displayACAOption']").val() == "true") {
                                    $('#interestedInACA').attr('checked', true);
                                    $('.interested_in_aca_b2b_govt').show();
                                } else {
                                    $('#interestedInACA').attr('checked', false);
                                    $('.interested_in_aca_b2b_govt').hide();
                                }
                            } else {
                                $('#interestedInACA').attr('checked', true);
                                $('.interested_in_aca_b2b_govt').show();
                            }
                        } 
                    }
                    $.spinner().stop();
                },
                error: function (err) {
                    // display the error message 
                    $('#form-accountnumber-error').empty().append(err.errorMessage).show(); 
                    $.spinner().stop();
                }
            });
            return false;
        });
    },

    businessRegister: function () {
        $('form.businessRegistration').submit(function (e) {
            var form = $(this);
            e.preventDefault();
            $('.g-captcha-error-message').empty();
            var url = form.attr('action');
            $.spinner().start();
            $('form.businessRegistration').trigger('login:businessRegister', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    $.spinner().stop();
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

                        $('form.businessRegistration').trigger('login:businessRegister:error', data);
                        formValidation(form, data);
                    } else {
                        $('form.businessRegistration').trigger('login:businessRegister:success', data);
                        location.href = data.redirectUrl;
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } 

                    $.spinner().stop();
                }
            });
            return false;
        });
    },
};
