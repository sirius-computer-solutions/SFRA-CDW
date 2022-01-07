'use strict';

var formHelper = require('../../../../scripts/helpers/formHelper');
module.exports = function () {
    $('#registration-form-phone').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});
    $('#b2bregistration-form-phone').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});
	$('#address-form-phone').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});
	$('.shippingPhoneNumber').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});	
	$('#billing-phoneNumber').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});		
	$('#phoneNo').keyup(function(e)
	{
		if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
    		this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
		}
	});		

	$(".submit-registration-form").click(function() {
		var isValid = formHelper.validateForm();
		if(!isValid) {
			setTimeout(function() {
				var target = $('.is-invalid:first');
				$('html, body').animate({
					scrollTop: $(target).offset().top - 100
			    });
			}, 500 );
		}
	});
	$('#registration-form-phone, #b2bregistration-form-phone, #address-form-phone, .shippingPhoneNumber, #billing-phoneNumber, #phoneNo')
	.on('input', function(e) {
		if(!e.keyCode) {
			this.value= this.value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
		}
	});	


	$('.webReferenceNumber-input-field')
	.on('input', function(e) {
		if(!e.keyCode) {
			this.value= this.value.replace(/[\+\%]/gi, '');
		}
	});	
	
	  
}
