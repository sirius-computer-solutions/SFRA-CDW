'use strict';

var server = require('server');

server.extend(module.superModule);
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

const {
    removePaypalPaymentInstrument
} = require('int_paypal/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');


/**
 * Cart-UpdateQuantity : The Prepend for Cart-UpdateQuantity endpoint handles updating the quantity of a product line item in the basket
 * @name Base/Cart-UpdateQuantity
 * @function
 * @memberof Cart
 * @param {querystringparameter} - pid - the product id
 * @param {querystringparameter} - quantity - the quantity to be updated for the line item
 * @param {querystringparameter} -  uuid - the universally unique identifier of the product object
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
 server.prepend('UpdateQuantity', function (req, res, next) {

    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var collections = require('*/cartridge/scripts/util/collections');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });

        return next();
    }

    var productId = req.querystring.pid;
    var updateQuantity = parseInt(req.querystring.quantity, 10);
    var uuid = req.querystring.uuid;
    var productLineItems = currentBasket.productLineItems;
    var matchingLineItem = collections.find(productLineItems, function (item) {
        return item.productID === productId && item.UUID === uuid;
    });
    
    
    if (matchingLineItem) {
        var maxOrdQtyExceeded = false;
        var product = ProductMgr.getProduct(productId);
        var preferences = require('*/cartridge/config/preferences');
        var maxOrdQty = preferences.maxOrderQty || 1000;
        if(product && 'custom' in product && 'maxOrderQuantity' in product.custom)
        {
            maxOrdQty = product.custom['maxOrderQuantity'];
        }
        maxOrdQtyExceeded = updateQuantity>maxOrdQty;
        if(maxOrdQtyExceeded)
        {
            var result = {};
            result.error = true;
            result.message = Resource.msgf(
                'error.alert.max.quantity.cannot.be.added.for',
                'product',
                null,
                maxOrdQty,
                product.name
            );
            res.setStatusCode(500);
            res.json({
                errorMessage: Resource.msgf('error.alert.max.quantity.cannot.be.added.for','product',null,maxOrdQty,product.name)
            });
            this.emit('route:Complete', req, res);
            return;
        }
        
    }
    next();
 });

 server.append('MiniCartShow', function (req, res, next) {
    var viewData = res.getViewData();
    // Read items from viewData and reverse if length is greater than 1.
    if ('items' in viewData && viewData.items.length > 1) {
        var lineItems = viewData.items;
        var pliList = new dw.util.ArrayList(lineItems);
        // order of items is reverse in case of mini cart display
        pliList.reverse();
        var cartItems = new dw.util.ArrayList();
        var bonusItems = new dw.util.ArrayList();
        for(var i=0;i<pliList.length;i++)
        {
            if(pliList[i].isBonusProductLineItem===true)
            {
                bonusItems.push(pliList[i]);
            }
            else
            {
                cartItems.push(pliList[i]);
            }
        }
        for(var i=0;i<bonusItems.length;i++)
        {
            cartItems.push(bonusItems[i]);
        }
        viewData.items = cartItems;
        res.setViewData(viewData);
    }
    next();
});




/**
 * Cart-Show : The Cart-Show endpoint renders the cart page with the current basket
 * @name Base/Cart-Show
 * @function
 * @memberof Cart
 * @param {middleware} - server.middleware.https
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - csrfProtection.generateToken
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
 server.append(
    'Show',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {

        var computedMetaData = {
            title: Resource.msg('cart.page.title', 'cart', null),
            description: Resource.msg('cart.page.description', 'cart', null),
            keywords: Resource.msg('cart.page.keywords', 'cart', null),
            pageMetaTags: []
        };
    
        var pageGroup = {name: Resource.msg('cart.page.pageGroup.name', 'cart', null),
                        ID: Resource.msg('cart.page.pageGroup.name', 'cart', null),
                        content: Resource.msg('cart.page.pageGroup.value', 'cart', null)};
        var robots = {name: Resource.msg('cart.page.robots.name', 'cart', null),
                        ID: Resource.msg('cart.page.robots.name', 'cart', null),
                        content: Resource.msg('cart.page.robots.value', 'cart', null)};                    
        computedMetaData.pageMetaTags.push(pageGroup);
        computedMetaData.pageMetaTags.push(robots);

        res.setViewData({
            CurrentPageMetaData: computedMetaData
        });

        next();
    }
);

/**
 * Cart-RemoveProductLineItem : The Cart-RemoveProductLineItem endpoint removes a product line item from the basket
 * @name Base/Cart-RemoveProductLineItem
 * @function
 * @memberof Cart
 * @param {querystringparameter} - pid - the product id
 * @param {querystringparameter} - uuid - the universally unique identifier of the product object
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
 server.append('RemoveProductLineItem', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    if(currentBasket && currentBasket.allProductLineItems.empty) {
        removePaypalPaymentInstrument(currentBasket);
    }
    next();
 });


module.exports = server.exports();
