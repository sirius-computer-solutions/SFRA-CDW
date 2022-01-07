'use strict';
var collections = require('*/cartridge/scripts/util/collections');
var formatHelpers = require('*/cartridge/scripts/helpers/formatHelpers');
var MessageDigest = require('dw/crypto/MessageDigest');
var Bytes = require('dw/util/Bytes');

/**
 * The purpose of this module is to collect and preparae tracking data which will then be injected into the site.
 * Conceptionally the goal is to use objects we already have at certain places in our application and put them into the datalayer.
 * This way we avoid fetching additional information, which might turn out expensive.
 *
 */

var datalayerEvent = [];
var datalayerView = [];
var datalayerEventSort = [];
var defaultPageData = { pageTypeIdentifier: "StaticContent", pageSubIdentifier: "", pageGroup: "Content", supportCenter: "1" };
var defaultOwnerData = { sectionName: "Ownership",Owner: "Acmetools.com",copyRights: "All Rights Reserved"};

/**
 * Retrieve ACME OWNER tracking data
 * @param {Object} obj - JSON object with required properties
 * @return {Object} - tracking data
 */
function getOwnerData() {
    var data = {
        "OWNER": [
            defaultOwnerData
        ]
    };
    return data;
};

/**
 * Retrieve ACME PAGE tracking data
 * @param {Object} obj - JSON object with required properties
 * @return {Object} - tracking data
 */
function getPageData(obj) {
    var data = {
        "PAGE": [
            obj
        ]
    };
    return data;
};

/**
 * A helper function to detect mobile users
 * @param {*} request 
 */
function isMobile() {
    var mobileAgentHash = ["mobile","tablet","phone","ipad","ipod","iphone","android","blackberry","windows ce","opera mini","palm"],
        idx = 0,
        item = null,
        isMobile = false,
        userAgent = request.httpUserAgent.toLowerCase();

    while (item = mobileAgentHash[idx++] && !isMobile) {
        isMobile = (userAgent.indexOf(mobileAgentHash[idx]) >= 0);
    }
    return isMobile;
};

/**
 * Retrieve ACME USER tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
function getUserData(req) {
    var data = {
        "USER": [
            {
                "wceUserId": "-1002",
                "guestUser": "true",
                "mobileDevice": isMobile()?"Y":"N",
                "wceEnvironment": "1",
                "wceStoreId": "11301",
                "wceCatalogId": "10551",
                "wceLogonId": "",
                "wceEmailAddress": "",
                "wceEmailAddressSHA1": "",
                "wceEmailAddressSHA256": "",
                "wceEmailAddressSHA512": ""
            }
        ]
    };

    if (req.currentCustomer.profile) {
        data.USER[0].wceUserId = req.currentCustomer.profile.customerNo;
        data.USER[0].guestUser = "false";
        data.USER[0].wceLogonId = req.currentCustomer.profile.logonId;
        data.USER[0].wceEmailAddress = req.currentCustomer.profile.email;

        if(!empty(req.currentCustomer.profile.email)) {
            var bytes = new Bytes(req.currentCustomer.profile.email);
            var hashedEmail256 = new MessageDigest(MessageDigest.DIGEST_SHA_256).digest(bytes);
            data.USER[0].wceEmailAddressSHA256 = hashedEmail256.toString();

            var hashedEmail512 = new MessageDigest(MessageDigest.DIGEST_SHA_512).digest(bytes);
            data.USER[0].wceEmailAddressSHA512 = hashedEmail512.toString();
        }

    
    }

    return data;
};

/**
 * Retrieve ACME PDP tracking data
 * @param {Object} product - a salesforce product
 * @return {Object} - tracking data
 */
function getPDPData(product) {

    var data = {
        "PDP": [{}
        ]
    };

    return data;
};

/**
 * Retrieve ACME PDP tracking data
 * @param {Object} product - a salesforce product
 * @return {Object} - tracking data
 */
function getEcommerceData(product) {

    var data = {
        "ECOMMERCE": [
            {
                "CART": []
            },
            {
                "ADJUSTMENT": []
            },
            {
                "REWARD": []
            },
            {
                "LINEITEMS": []
            }
        ]
    };

    return data;
};

/**
 * Retrieve ACME ecommerce tracking data
 * @param {Object} data - a salesforce product
 * @param {Object} basket - a salesforce product
 * @return {Object} - updated tracking data
 */
function addActionAndProductData(data, basket, container) {
    if(!container){
        container = "cart";
    }

    if(basket){
        var orderNo = Object.hasOwnProperty.call(basket, 'orderNo')?basket.orderNo: null;

        // build actionField
        var actionField = {
            "id": orderNo,
            "affiliation": "AcmeTools",
            "subTotal": basket.merchandizeTotalPrice.value,
            "tax": basket.totalTax,
            "shipping": basket.adjustedShippingTotalPrice.value,
            "handling": basket.adjustedShippingTotalTax.value,
            "adjustments": 0, //todo
            "coupon": "",
            "couponSavings": "",
            "couponCode": "",
            "impactCouponSavings": "0.00",  //todo
            "customerStatus": basket.customer.registered?"Returning Customer":"New", 
            "orderTotal": basket.totalGrossPrice.value,
            "email": basket.customerEmail?basket.customerEmail:""
        };

        // build products
        var products = []
        var position = 1;
    
        collections.forEach(basket.productLineItems, function (productLineItem) {
            var item = {
                'id': productLineItem.product && productLineItem.product.custom && 'acme-tools-part-number' in productLineItem.product.custom ? productLineItem.product.custom['acme-tools-part-number']:productLineItem.manufacturerSKU,
                'name': productLineItem.productName,
                "brand": productLineItem.manufacturerName,
                "category": productLineItem.product && productLineItem.product.primaryCategory?productLineItem.product.primaryCategory.displayName:'',
                "variant": "", //todo
                "price": formatHelpers.formatPrice(productLineItem.basePrice.value),
                "quantity": formatHelpers.formatNumber(productLineItem.quantity.value),
                "productTotal":  formatHelpers.formatPrice(productLineItem.adjustedNetPrice.value),
                "coupon": "",
                "couponSavings": "",
                "position": position
            };
            products.push(item);
            position++;
        });
         // clear out object and add both
        data[4].ECOMMERCE[0] = {};
        data[4].ECOMMERCE[0][container] = { actionField: actionField, products: products};
        data[4].ECOMMERCE.length = 1;
    }
};

/**
 * datalayerUtils is used to provide the individual helper functionality for various dataobjects being invoked from the page.
 */
var datalayerUtils = {};

datalayerUtils.getDefaultData = function (req) {
    var data = [];
    data.push(getOwnerData());
    data.push(getPageData(defaultPageData));
    if(req){
        data.push(getUserData(req));
    }
    data.push(getPDPData(null));
    data.push(getEcommerceData(null));
    return data;
}

/**
 * Retrieve Home tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getHomeData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "HomePage";
    data[1].PAGE[0].pageSubIdentifier = "Root";
    
    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);
    
    return data;
};

/**
 * Retrieve Category tracking data
 * @param {dw.catalog.ProductSearchModel} productSearch - with category category search is being executed
 * @return {Object} - tracking data
 */
datalayerUtils.getCategoryData = function (req, productSearch, refinementIncludedH1) {
    var data = datalayerUtils.getDefaultData(req);

    if (productSearch && productSearch.category && productSearch.category.id){
        //for category searches only
        var origCatId = req.querystring.oci;
        var categoryName = productSearch.category.name;
        var categoryId = productSearch.category.id;
        if (origCatId && "ewhatsnew" === origCatId) {
            categoryId = origCatId;
            categoryName = refinementIncludedH1;
        }

        data[1].PAGE[0].pageTypeIdentifier = "Category";
        data[1].PAGE[0].pageSubIdentifier = categoryName;
        data[1].PAGE[0].pageGroup = "Category";
        data[1].PAGE[0].categoryId = categoryId;
        data[1].PAGE[0].categoryName = categoryName;
        if ("Heavy Equipment" === categoryName) {
            data[1].PAGE[0].supportCenter = "2";
        }
    } else {
        //otherwise, this is a keyword search
        data[1].PAGE[0].pageTypeIdentifier = "SearchResults";
        data[1].PAGE[0].pageSubIdentifier = productSearch?productSearch.searchKeywords?productSearch.searchKeywords.toLowerCase():'':'';
        data[1].PAGE[0].pageGroup = "Search";
    }

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Product tracking data
 * @param {Object} req - current request object
 * @param {Object} product
 * @param {Object} apiProduct
 * @return {Object} - tracking data
 */
datalayerUtils.getProductData = function (req, product, apiProduct) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "PDP-Item";
    data[1].PAGE[0].pageGroup = "Item";

    if (product && product.id){
        data[1].PAGE[0].pageSubIdentifier = product.id;
        data[1].PAGE[0].brand = product.brand;
        data[1].PAGE[0].skuName = product.productName;

        var isAirRestricted = false;
        if(apiProduct.custom && "w1noair" in apiProduct.custom) {
            if(apiProduct.custom["w1noair"] == 'Y'){
                isAirRestricted = true;
            }
        }
        var isFreight = false;
        if(apiProduct.custom && "w1frt" in apiProduct.custom) {
            if(apiProduct.custom["w1frt"] == 'F'){
                isFreight = true;
            }
        }
        var isCarbCompliant = true;
        if(apiProduct.custom && "w1carb" in apiProduct.custom) {
            if(apiProduct.custom["w1carb"] == 'N'){
                isCarbCompliant = false;
            }
        }
        var isHeavyEquipment = false;
        if(apiProduct.custom && "acme-tools-heavy-equipment" in apiProduct.custom) {
            if(apiProduct.custom["acme-tools-heavy-equipment"] == 'true'){
                isHeavyEquipment = true;
            }
        }
        var commodityCode = "";
        if(apiProduct.custom && "acme-tools-commodity-code" in apiProduct.custom) {
            commodityCode = apiProduct.custom["acme-tools-commodity-code"];
        }
        var isQuoteOnly = false;
        if(apiProduct.custom && "acme-tools-quote-only-item" in apiProduct.custom) {
            if(apiProduct.custom["acme-tools-quote-only-item"] == 'true'){
                isQuoteOnly = true;
            }
        }
        var inStoreOnly = "No";
        if(apiProduct.custom && "acme-tools-available-in-store-only" in apiProduct.custom) {
            inStoreOnly = apiProduct.custom["acme-tools-available-in-store-only"];
        }
        
        var isFreeShipping = false;
        if(product.price && product.price.sales && product.price.sales.value >= 199){
            isFreeShipping = true;
        }

        if(isHeavyEquipment){
            data[1].PAGE[0].supportCenter = "2";
        }

        data[3].PDP[0].catentryId = product.id.toString();
        data[3].PDP[0].shortDescription = product.shortDescription?product.shortDescription.toString():"";
        data[3].PDP[0].pageTypeIdentifier = "PDP-Item";
        data[3].PDP[0].pageSubIdentifier = product.id.toString();
        data[3].PDP[0].pageGroup = "Item";
        data[3].PDP[0].skuName = product.productName.toString();
        data[3].PDP[0].brand = product.brand?product.brand.toString():"";
        data[3].PDP[0].pageTitle = product.productName.toString();
        data[3].PDP[0].categoryId = apiProduct.categories && apiProduct.categories.length>0?apiProduct.categories[0].ID:"";
        data[3].PDP[0].partNumber = !empty(product.acmePartnumber) ? product.acmePartnumber: !empty(product.manufacturerSKU)?product.manufacturerSKU:'';
        data[3].PDP[0].partType = "item";
        data[3].PDP[0].numParentCategories = apiProduct.categories.length.toString();
        data[3].PDP[0].listPrice = product.price.list && product.price.list.decimalPrice?product.price.list.decimalPrice.toString():"";
        data[3].PDP[0].wasPrice = product.price.was && product.price.was.decimalPrice?product.price.was.decimalPrice.toString():"";
        data[3].PDP[0].regPrice = "0.00";
        data[3].PDP[0].callPrice = "0.00";
        data[3].PDP[0].mapPrice = product.price.sales!=null && product.price.sales.decimalPrice!=null ? product.price.sales.decimalPrice.toString():"0.00";
        data[3].PDP[0].salePrice = product.price.sales!=null && product.price.sales.decimalPrice!=null ? product.price.sales.decimalPrice.toString():"0.00";
        data[3].PDP[0].handlingCharge = product.surchargeValue.toString();
        data[3].PDP[0].allowBackOrders = "YES";
        data[3].PDP[0].hasInventory = product.available?product.available.toString():false;
        data[3].PDP[0].isNew = false.toString();
        data[3].PDP[0].hasHandlingCharge = product.hasSurcharge.toString();
        data[3].PDP[0].hasFreeShipping = isFreeShipping.toString();
        data[3].PDP[0].isFreight = isFreight?"Yes":"No";
        data[3].PDP[0].freightShipOnly = isFreight?"Yes":"No";
        data[3].PDP[0].maxOrderQty = product.maxOrderQuantity.toString();
        data[3].PDP[0].isAirRestricted = isAirRestricted.toString();
        data[3].PDP[0].isHeavyEquipment = isHeavyEquipment.toString();
        data[3].PDP[0].skuTaxCode = "?";
        data[3].PDP[0].isQuoteOnlyItem = isQuoteOnly.toString();
        data[3].PDP[0].isItemDiscontinued = product.discontinued.toString();
        data[3].PDP[0].isItemPresale = false.toString();//TODO
        data[3].PDP[0].storeOnlyItem = inStoreOnly.toString();
        data[3].PDP[0].hasReplacement = "false";
        data[3].PDP[0].isNonCarbCompliant = (!isCarbCompliant).toString();
        data[3].PDP[0].commodityCode = commodityCode.toString();
        data[3].PDP[0].bestPrice = "";
        data[3].PDP[0].category = apiProduct.categories && apiProduct.categories.length>0?apiProduct.categories[0].displayName:"";
        data[3].PDP[0].variant = apiProduct.variant.toString();

        var supplementalObject = {
            pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
            pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
            pageGroup:data[1].PAGE[0].pageGroup
        };
        data.push(supplementalObject);
    }

    return data;
};

/**
 * Retrieve Cart tracking data
 * @param {Object} req - current request object
 * @param {Object} basket - current basket object
 * @return {Object} - tracking data
 */
datalayerUtils.getCartData = function (req, basket) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "CartPage";
    data[1].PAGE[0].pageSubIdentifier = "CartPage";
    data[1].PAGE[0].pageGroup = "Checkout";
    addActionAndProductData(data,basket,"cart");

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Checkout tracking data
 * @param {Object} req - current request object
 * @param {Object} basket - current basket object
 * @return {Object} - tracking data
 */
datalayerUtils.getCheckoutData = function (req, basket) {
    var data = datalayerUtils.getDefaultData(req);
    var checkoutStage = req.querystring?req.querystring.stage?req.querystring.stage:"Acme Tools":"Acme Tools";
    data[1].PAGE[0].pageTypeIdentifier = "Checkout-Summary";
    data[1].PAGE[0].pageSubIdentifier = checkoutStage;
    data[1].PAGE[0].pageGroup = "Checkout";
    addActionAndProductData(data,basket,"checkout");
    data[4].ECOMMERCE[0].checkout.actionField.step = 1;
    data[4].ECOMMERCE[0].checkout.actionField.option = "Shipping Address";

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Confirmation tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getConfirmationData = function (req, orderModel) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "Checkout-OrderConfirmation";
    data[1].PAGE[0].pageSubIdentifier = "Acme Tools";
    data[1].PAGE[0].pageGroup = "Checkout-Confirmation";
    addActionAndProductData(data, orderModel, "purchase");

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);
    
    return data;
};

/**
 * Retrieve Static tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getStaticData = function (req, pageName) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "StaticContent";
    data[1].PAGE[0].pageSubIdentifier = pageName;
    data[1].PAGE[0].pageGroup = "Content";

    if("heavy-equipment" === pageName){
        data[1].PAGE[0].supportCenter = "2";
    }
    
    var supplementalObject = {
        pageTypeIdentifier: "StaticContent",
        pageSubIdentifier: pageName,
        pageGroup:"Content"
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Compare tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getCompareData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "ComparePage";
    data[1].PAGE[0].pageSubIdentifier = "ComparePage";
    data[1].PAGE[0].pageGroup = "Compare";

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Store Locations tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getLocationsData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "LOCATIONS";
    data[1].PAGE[0].pageSubIdentifier = "MAP";
    data[1].PAGE[0].pageGroup = "Locations";

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);
    
    return data;
};

/**
 * Retrieve Contact Us tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getContactUsData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "CONTACTUS";
    data[1].PAGE[0].pageSubIdentifier = "CONTACTUS";
    data[1].PAGE[0].pageGroup = "FORM-ContactUs";

    var supplementalObject = {
        pageTypeIdentifier: "CONTACTUS",
        pageSubIdentifier: "CONTACTUS",
        pageGroup:"FORM-ContactUs"
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Catalog request tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getRequestCatalogData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "REQUESTCATALOG";
    data[1].PAGE[0].pageSubIdentifier = "REQUESTCATALOG";
    data[1].PAGE[0].pageGroup = "FORM-RequestCatalog";

    var supplementalObject = {
        pageTypeIdentifier: "REQUESTCATALOG",
        pageSubIdentifier: "REQUESTCATALOG",
        pageGroup:"FORM-RequestCatalog"
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Quote request tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
datalayerUtils.getRequestQuoteData = function (req) {
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "REQUESTQUOTE";
    data[1].PAGE[0].pageSubIdentifier = "REQUESTQUOTE";
    data[1].PAGE[0].pageGroup = "FORM-RequestQuote";

    var supplementalObject = {
        pageTypeIdentifier: "REQUESTQUOTE",
        pageSubIdentifier: "REQUESTQUOTE",
        pageGroup:"FORM-RequestQuote"
    };
    data.push(supplementalObject);

    return data;
};

/**
 * Retrieve Quote request tracking data
 * @param {Object} req - current request object
 * @return {Object} - tracking data
 */
 datalayerUtils.getAccountData = function (req, subpage) {
    var pageSubIdentifier = subpage || "ACCOUNT";
    var data = datalayerUtils.getDefaultData(req);
    data[1].PAGE[0].pageTypeIdentifier = "ACCOUNT";
    data[1].PAGE[0].pageSubIdentifier = pageSubIdentifier;
    data[1].PAGE[0].pageGroup = "ACCOUNT";

    var supplementalObject = {
        pageTypeIdentifier: data[1].PAGE[0].pageTypeIdentifier,
        pageSubIdentifier: data[1].PAGE[0].pageSubIdentifier,
        pageGroup:data[1].PAGE[0].pageGroup
    };
    data.push(supplementalObject);
    
    return data;
};


module.exports = {
    populate: function () {
        var args = [].slice.call(arguments);
        var context = args.shift();
        var methodName = 'get' + context;
        if (typeof datalayerUtils[methodName] === 'function') {
            var dataObj = datalayerUtils[methodName].apply(datalayerUtils, args);
            var datalayerViewLength1 = datalayerView.length;
            datalayerView.push(dataObj);
        }
    },
    // we allow to override the view value to be flexible on every datalayer
    updateView: function (view) {
        datalayerView = view;
    },
    getDatalayerView: function () {
        var a = datalayerView;
        return datalayerView;
    },
    getDatalayerEvent: function () {
        return datalayerEvent;
    },
    getDatalayerEventSort: function () {
        return datalayerEventSort;
    },
    CONTEXT: {
        HOME: 'HomeData',
        CATEGORY: 'CategoryData',
        SEARCH: 'SearchData',
        PRODUCT: 'ProductData',
        CART: 'CartData',
        CHECKOUT: 'CheckoutData',
        CONFIRMATION: 'ConfirmationData',
        LOCATIONS: 'LocationsData',
        STATIC: 'StaticData',
        COMPARE: 'CompareData',
        CONTACTUS: 'ContactUsData',
        REQUESTCATALOG: 'RequestCatalogData',
        REQUESTQUOTE: 'RequestQuoteData',
        ACCOUNT: 'AccountData'
    }
};
