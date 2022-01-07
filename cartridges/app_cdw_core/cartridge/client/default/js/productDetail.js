'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    // Wishlists
    try {
        processInclude(require('wishlist/product/wishlist'));
    } catch (ex) {
        // plugin not in use
    }   

    processInclude(require('./product/pdpInstoreInventory'));
    processInclude(require('./product/notifyMe'));
    processInclude(require('./product/details'));
    
 
});
