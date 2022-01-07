'use strict';



function addMoreProductsSection(){
    $('.add-more-products-contact-us').click(function (e) {

      $('.contact-us-products-section').show().append('<div class="row contact-us-item"> <div class="col"> <div class="form-group">  <input type="text"  class="form-control" aria-describedby="form-contact-model-error" id="contact-model" name="contactModel"> </div> </div>  <div class="col"> <div class="form-group"> <input type="text"  class="form-control" aria-describedby="form-contact-qty-error" id="contact-qty" name="contactQty"> </div> </div></div>');
       

    });
    
}

function phoneFormatting(){
  $('#contact-phone').keyup(function(e)
  {
    if(!(e.keyCode == 8 || e.keyCode == 46) && this.value.trim().length<=8){
        this.value = this.value.replace(/(\d{3})\-?/g,'$1-');
    }
  });	
}

$('#contact-phone')
	.on('input', function(e) {
		if(!e.keyCode) {
			this.value= this.value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
		}
});	

module.exports = {
    addMoreProductsSection: addMoreProductsSection,
    phoneFormatting: phoneFormatting
};