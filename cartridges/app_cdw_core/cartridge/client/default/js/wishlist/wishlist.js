'use strict';


var wishList = require('wishlist/wishlist/wishlist');


function addToCartFromWishlist() {
}

wishList.addToCartFromWishlist = addToCartFromWishlist;


var exportDetails = $.extend({}, wishList);

module.exports = exportDetails;