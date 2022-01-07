'use strict';

var Locale = require('dw/util/Locale');
var URLUtils = require('dw/web/URLUtils');

/**
 * The purpose of this module is to collect and preparae tracking data which will then be injected into the site.
 * Conceptionally the goal is to use objects we already have at certain places in our application and put them into the datalayer.
 * This way we avoid fetching additional information, which might turn out expensive.
 *
 */
var datalayerEvent = [];
var datalayerView = [];
var datalayerEventSort = [];

/**
 * Page identifier
 */
var pageTypes = {
    ACCOUNT: 'account',
    BASKET: 'basket',
    CHECKOUT: 'checkout',
    CONTENT: 'content',
    ERROR: 'error',
    ORDER_CONFIRMATION: 'orderConfirmation',
    PRODUCT_DETAIL_PAGE: 'pdp',
    PRODUCT_LIST_PAGE: 'plp',
    SEARCH: 'search',
    STARTPAGE: 'startpage',
    WISHLIST: 'wishlist'
};

/**
 * datalayerUtils is used to provide the individual helper functionality for various dataobjects being invoked from the page.
 */
var datalayerUtils = {};

/**
 * Retrieve global tracking data
 * @param {Object} req - current request object
 * @param {string} pageType - allows identification of current page context
 * @return {Object} - tracking data with page_level_X
 */
datalayerUtils.getGlobalData = function (req, pageType) {
    var data = {};
    var hasType = Object.keys(pageTypes).filter(function (type) { return pageTypes[type] === pageType; }).length > 0;
    if (hasType) {
        var currentLocale = Locale.getLocale(req.locale.id);

        data = {
            page_country_iso: currentLocale.country.toLowerCase(),
            page_language_iso: currentLocale.language,
            page_currency_code_iso: req.session.currency.currencyCode
        };
        if ([pageTypes.SEARCH, pageTypes.PRODUCT_DETAIL_PAGE].indexOf(pageType) < 0) {
            data.page_type = pageType;
            data.page_level_1 = pageType.toLowerCase();
        }
        var pageName = [
            currentLocale.country.toLowerCase(),
            currentLocale.language
        ];
        pageName.push(pageType.toLowerCase() + '|' + pageType.toLowerCase());

        data.page_name = pageName.join('.');
    }
    return data;
};

datalayerUtils.getBasketData = function (req, cartModel) {
    var data = {
        product_line_items: [],
        page_type: pageTypes.BASKET
    };
    var BasketMgr = require('dw/order/BasketMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    if (currentBasket) {
        var cartProductLineItems = cartModel.items;

        for (var j = 0; j < cartProductLineItems.length; j += 1) {
            var cartLineItem = cartProductLineItems[j];
            var apiProduct = ProductMgr.getProduct(cartLineItem.id);
            var productID = apiProduct.masterProduct ? apiProduct.masterProduct.ID : apiProduct.ID;
            data.product_line_items.push({
                product_master_id: productID,
                product_quantity: cartLineItem.quantity,
                product_price: cartLineItem.price.sales.decimalPrice
            });
        }
    }
    return data;
};

/**
 * Collect data for success event tracking for register and subscribe event.
 * @returns {Object} created data tracking object including success event information
 */
datalayerUtils.getRegisterSuccessEventData = function () {
    var data = {
        link_type: 'success',
        link_event: 'success-register',
        link_name: 'register'
    };
    return data;
};

/**
 * Function being used to collect product data being fetched already for the product detail page.
 * @param {Object} req The current request
 * @param {Object} product The product object
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @returns {Object} created data tracking object including product related information
 */
datalayerUtils.getProductData = function (req, product, apiProduct) {
    var masterProduct = !Object.hasOwnProperty.call('masterProduct', apiProduct) ? apiProduct : apiProduct.masterProduct;
    var data = {
        product_master_id: [masterProduct.ID], // variationMaster
        product_name_local_lang: [product.productName],
        product_quantity: [1],
        product_availability: [product.available ? 'yes' : 'no'],
        product_status: 'prodView',
        page_type: pageTypes.PRODUCT_DETAIL_PAGE
    };
    if (product.price.list && product.price.sales) {
        data.product_price_original = [product.price.list.decimalPrice]; // price VAT
        data.product_price_to_customer = [product.price.sales.decimalPrice];
        data.product_price_original_number = [product.price.list.value];
        data.product_price_to_customer_number = [product.price.sales.value];
    } else if (!product.price.list && product.price.type !== 'range') {
        data.product_price_original = [product.price.sales.decimalPrice]; // price VAT
        data.product_price_to_customer = [product.price.sales.decimalPrice];
        data.product_price_original_number = [product.price.sales.value];
        data.product_price_to_customer_number = [product.price.sales.value];
    } else if (!product.price.sales && product.price.type !== 'range') {
        data.product_price_original = [product.price.list.decimalPrice]; // price VAT
        data.product_price_to_customer = [product.price.list.decimalPrice];
        data.product_price_original_number = [product.price.list.value];
        data.product_price_to_customer_number = [product.price.list.value];
    }

    if (apiProduct.variant) {
        data.product_id = [apiProduct.ID];
    }

    var pageName = [];
    var productCategory;
    if (apiProduct.primaryCategory) {
        productCategory = apiProduct.primaryCategory;
    } else if (apiProduct.categoryAssignments.size() > 0) {
        var productCategoryAssignment = apiProduct.categoryAssignments.iterator().next();
        productCategory = productCategoryAssignment.category;
    } else if (apiProduct.variationGroup && apiProduct.masterProduct.primaryCategory) {
        productCategory = apiProduct.masterProduct.primaryCategory;
    }
    if (productCategory) {
        while (productCategory.parent != null) {
            pageName.unshift(productCategory.displayName.toLowerCase());
            productCategory = productCategory.parent;
        }
    }
    // set page_level for pdp
    var i = 1;
    pageName.forEach(function (name) {
        data['page_level_' + i] = name;
        i += 1;
    });
    data['page_level_' + i] = apiProduct.ID;

    // page_name for pdp
    var currentLocale = Locale.getLocale(req.locale.id);
    pageName.unshift(currentLocale.language);
    pageName.unshift(currentLocale.country.toLowerCase());
    pageName.push(apiProduct.ID + '|' + pageTypes.PRODUCT_DETAIL_PAGE);
    data.page_name = pageName.join('.');

    var image = masterProduct.getImages('large')[0];
    if (image) {
        data.product_large_image_1 = [image.httpsURL.toString()];
    }

    data.product_url = [URLUtils.abs('Product-Show', 'pid', apiProduct.ID).toString()];
    data.product_long_description = [apiProduct.longDescription];
    data.product_short_description = [apiProduct.shortDescription];

    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var breadcrumbs = [];
    /**
     * @param {string} cgid - cgid param for recursive loop
     * @param {array} breadcrumbs - array containing category Ids
     * @returns {array} breadcrumbs
     */
    function getAllBreadcrumbs(cgid, breadcrumbs) { //eslint-disable-line 
        var category;
        if (cgid) {
            category = CatalogMgr.getCategory(cgid);
        } else {
            category = apiProduct.variant
                ? apiProduct.masterProduct.primaryCategory
                : apiProduct.primaryCategory;
        }
        if (category) {
            breadcrumbs.push(category.ID);
            if (category.parent && category.parent.ID !== 'root') {
                return getAllBreadcrumbs(category.parent.ID, breadcrumbs);
            }
        }
        return breadcrumbs;
    }

    var breadCrumbsToReturn = getAllBreadcrumbs(null, breadcrumbs);
    data.product_breadcrumb_as_string = [breadCrumbsToReturn.reverse().join('|').toUpperCase()];
    return data;
};

/**
 * Function being used to collect some personalized information linked to the customer/session.
 * This is causing the need to have this being executed from a uncached remote include, hence it is IMPORTANT to keep logic here to a minimum.
 * IT IS NOT ALLOWED to fetch additional objects from the database and data is limited to what is provided by the request/session.
 * @param {Object} req The request
 * @returns {Object} created data tracking object including personalized user specific infortmation related information
 */
datalayerUtils.getPersonalizedData = function (req) {
    var data = {};
    if (req.currentCustomer.profile) {
        data.page_login_status = 'logged-in';
        data.customer_id = req.currentCustomer.profile.customerNo;
        data.customer_email = req.currentCustomer.profile.email || '';
        data.userName = (req.currentCustomer.profile.firstName || '') + ' ' + (req.currentCustomer.profile.lastName || '');
        if (req.currentCustomer.raw.customerGroups.length > 0) {
            data.customer_group = req.currentCustomer.raw.customerGroups.toArray().map(function (g) { return g.ID; }).join(',');
        }
    } else if (req.currentCustomer.credentials) {
        data.page_login_status = 'soft-logged-in';
        data.customer_id = req.currentCustomer.raw.profile.customerNo;
    } else {
        data.page_login_status = 'logged-out';
    }
    data.sf_sid = session.sessionID;
    return data;
};

/**
 * Retrieve account tracking data
 * @param {Object} req - current request object
 * @param {string} pageType - allows identification of current page context
 * @param {Object} subpage - The current subpage of the account
 * @return {Object} - tracking data for checkout type
 */
datalayerUtils.getAccountData = function (req, pageType, subpage) {
    var globalData = datalayerUtils.getGlobalData(req, pageType);
    var currentLocale = Locale.getLocale(req.locale.id);

    var subPages = {
        personalDetails: 'personal-details',
        orderHistory: 'order-history',
        addressBook: 'my-address'
    };

    // enhances globalData
    globalData.page_level_2 = subPages[subpage];

    // overrides globalData page_name with account values
    var pageName = [
        currentLocale.country.toLowerCase(),
        currentLocale.language,
        globalData.page_level_1
    ];
    if (Object.hasOwnProperty.call(globalData, 'page_level_2')) {
        pageName.push(globalData.page_level_2 + '|' + pageType);
    }
    globalData.page_name = pageName.join('.');

    return globalData;
};

/**
 * Function being used to collect the sorting data on the product listing page.
 * @param {Object} sortingRule the sorting rule of the product search results
 * @returns {Object} created data tracking object including product related information
 */
datalayerUtils.getSorting = function (sortingRule) {
    var data = {
        event: 'sort-usage',
        sort_value_name: sortingRule.split('-').join(' '),
        sorting_status: 'sorting-select'
    };
    return data;
};

/**
 * Create category path for search result page
 * @param {Object} localeID - ID of the current site locale
 * @param {dw.catalog.ProductSearchModel} productSearch - with category category search is being executed
 * @returns {Object} - tracking data with page_level_X
 */
datalayerUtils.getSearchData = function (localeID, productSearch) {
    var data = { page_type: pageTypes.SEARCH };

    var categoryPath = [];
    if (Object.prototype.hasOwnProperty.call(productSearch, 'category') &&
        productSearch.category instanceof dw.catalog.Category // eslint-disable-line
    ) {
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        var tmpCategory = CatalogMgr.getCategory(productSearch.categoryID);

        while (tmpCategory.parent != null) {
            categoryPath.unshift(tmpCategory.displayName.toLowerCase());
            tmpCategory = tmpCategory.parent;
        }
        if (Object.prototype.hasOwnProperty.call(productSearch.category.custom, 'pageType') &&
            productSearch.category.custom.pageType.value === 'content'
        ) {
            data.page_type = 'content';
        } else if (categoryPath.length === 1) {
            data.page_type = 'overview';
        } else {
            data.page_type = pageTypes.PRODUCT_LIST_PAGE;
        }
    }

    var currentLocale = Locale.getLocale(localeID);

    var pageName = [currentLocale.country.toLowerCase(), currentLocale.language];
    for (var i = 0; i < categoryPath.length; i += 1) {
        var categoryName = categoryPath[i];
        data['page_level_' + (i + 1)] = categoryName;
        if ((i + 1) === categoryPath.length && data.page_type === pageTypes.PRODUCT_LIST_PAGE) {
            pageName.push(categoryName + '|' + pageTypes.PRODUCT_LIST_PAGE);
        } else {
            pageName.push(categoryName);
        }
    }
    if (pageName.length === 2) {
        pageName.push(pageTypes.SEARCH + '|' + pageTypes.SEARCH);
        data.page_level_1 = pageTypes.SEARCH;
    }
    data.page_name = pageName.join('.');
    data.categoryPathAsString = categoryPath.map(function (category) {
        return category.toUpperCase().replace(/ /g, '');
    }).join('|');
    return data;
};

/**
 * Function being used to collect some informations about a customers order(thank-you-page)
 * @param {Object} order The order Model
 * @param {string} pageType - allows identification of current page context
 * @returns {Object} created data tracking object including order specific infortmation
 */
datalayerUtils.getOrderData = function (order, pageType) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var data = {};

    if (!order) {
        return data;
    }

    data = {
        order_total_gross_price_decimal: order.totals.totalGrossPriceDecimal, // product value w/o VAT
        order_id: order.orderNumber,
        page_currency_code_iso: order.totals.currencySymbol,
        product_line_items: []
    };

    if (pageType) {
        data.page_type = pageType;
    }

    var paymentMethod = [];
    order.billing.payment.selectedPaymentInstruments
        .forEach(function (payment) {
            paymentMethod.push(payment.paymentMethod.toLowerCase());
            if (payment.paymentMethod === 'CREDIT_CARD') {
                data.payment_card_type = payment.type; // card type if credit card payment
            }
        });
    data.payment_method = paymentMethod.join();
    var productLineItems = order.items.items;

    for (var i = 0; i < productLineItems.length; i += 1) {
        var lineItem = productLineItems[i];
        var apiProduct = ProductMgr.getProduct(lineItem.id);
        var productID = apiProduct.masterProduct ? apiProduct.masterProduct.ID : apiProduct.ID;
        data.product_line_items.push({
            product_master_id: productID,
            product_quantity: lineItem.quantity,
            product_price: lineItem.price.sales.decimalPrice
        });
    }
    return data;
};

module.exports = {
    populate: function () {
        var args = [].slice.call(arguments);
        var context = args.shift();
        var methodName = 'get' + context;
        if (typeof datalayerUtils[methodName] === 'function') {
            var dataObj = datalayerUtils[methodName].apply(datalayerUtils, args);
            if ([this.CONTEXT.GLOBAL,
                this.CONTEXT.PERSONALIZED,
                this.CONTEXT.PRODUCT,
                this.CONTEXT.SEARCH,
                this.CONTEXT.BASKET,
                this.CONTEXT.ORDER,
                this.CONTEXT.ACCOUNT].indexOf(context) > -1) {
                // page view data population
                datalayerView.push(dataObj);
            } else if (context === this.CONTEXT.SORTING) {
                // dedicated event handling for sorting
                datalayerEventSort.push(dataObj);
            } else {
                // anything else is handled here as general event
                // this mainly links to server side event (ex: REGISTERSUCCESS)
                datalayerEvent.push(dataObj);
            }
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
        GLOBAL: 'GlobalData',
        BASKET: 'BasketData',
        PERSONALIZED: 'PersonalizedData',
        PRODUCT: 'ProductData',
        REGISTERSUCCESS: 'RegisterSuccessEventData',
        ACCOUNT: 'AccountData',
        SEARCH: 'SearchData',
        SORTING: 'Sorting',
        ORDER: 'OrderData'
    },
    pageTypes: pageTypes
};
