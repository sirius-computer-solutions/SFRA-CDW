'use strict';

function validateForm() {
    var isValid = true;
    $('input[required]').each(function() {
      if ( $(this).val() === '' )
          isValid = false;
    });
    return isValid;
}

module.exports = {
    validateForm : validateForm
};