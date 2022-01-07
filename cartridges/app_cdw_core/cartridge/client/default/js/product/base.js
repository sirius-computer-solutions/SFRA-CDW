'use strict';
var base = require('base/product/base');

/**
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */
 function getAddToCartUrl() {
    return $('.add-to-cart-url').val();
}

/**
 * Retrieves the value associated with the Quantity pull-down menu
 * @param {jquery} $el - DOM container for the relevant quantity
 * @return {string} - value found in the quantity input
 */
 function getQuantitySelected($el) {
    return getQuantitySelector($el).val();
}

/**
 * Retrieves the bundle product item ID's for the Controller to replace bundle master product
 * items with their selected variants
 *
 * @return {string[]} - List of selected bundle product item ID's
 */
 function getChildProducts() {
    var childProducts = [];
    $('.bundle-item').each(function () {
        childProducts.push({
            pid: $(this).find('.product-id').text(),
            quantity: parseInt($(this).find('label.quantity').data('quantity'), 10)
        });
    });

    return childProducts.length ? JSON.stringify(childProducts) : [];
}

/**
 * Retrieve product options
 *
 * @param {jQuery} $productContainer - DOM element for current product
 * @return {string} - Product options and their selected values
 */
 function getOptions($productContainer) {
    var options = $productContainer
        .find('.product-option')
        .map(function () {
            var $elOption = $(this).find('.options-select');
            var urlValue = $elOption.val();
            var selectedValueId = $elOption.find('option[value="' + urlValue + '"]')
                .data('value-id');
            return {
                optionId: $(this).data('option-id'),
                selectedValueId: selectedValueId
            };
        }).toArray();

    return JSON.stringify(options);
}


/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
 function handlePostCartAdd(response) {

    
    $('.minicart').trigger('count:update', response);
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    if(response.error==false){
        $('.minicart').trigger('mouseenter', response);
    }

    var messageType = response.error ? 'alert-danger' : 'alert-success';
    // show add to cart toast
    if (response.newBonusDiscountLineItem
        && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        chooseBonusProducts(response.newBonusDiscountLineItem);
    } else if (response.error){
        var $messageWrapper=$('.add-to-cart-messages');
        if ($messageWrapper.length === 0) {
            $('body').append(
                '<div class="add-to-cart-messages"></div>'
            );
            $messageWrapper=$('.add-to-cart-messages');
        }
        else {
            $messageWrapper.html('');
        }
        
        $messageWrapper.append(
            '<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">'
            + response.message
            + '<button class="closeX btn"><span aria-hidden="true">×</span></button>'
            + '</div>'
        );

        $messageWrapper.find('.closeX').on('click', function(){
            $('.add-to-basket-alert').remove();
        });
    }
}

function numberWithCommas(x) {
    x = x.indexOf('.0')!=-1? x.substring(0,x.indexOf('.0')):x;
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return x;
}

function addToCart() {
    $(document).on('click', 'button.add-to-cart, button.add-to-cart-global', function (e) {
        var addToCartUrl;
        var pid;
        var pidsObj;
        var setPids;

        $('body').trigger('product:beforeAddToCart', this);

        if ($('.set-items').length && $(this).hasClass('add-to-cart-global')) {
            setPids = [];

            $('.product-detail').each(function () {
                if (!$(this).hasClass('product-set-detail')) {
                    setPids.push({
                        pid: $(this).find('.product-id').text(),
                        qty: $(this).find('.quantity-select').val(),
                        options: getOptions($(this))
                    });
                }
            });
            pidsObj = JSON.stringify(setPids);
        }

        pid = getPidValue($(this));

        var $productContainer = $(this).closest('.product-detail');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.quick-view-dialog').find('.product-detail');
        }

        addToCartUrl = getAddToCartUrl();
        if(addToCartUrl == null || addToCartUrl == undefined)
        {
            addToCartUrl = '/on/demandware.store/Sites-CDWStarterStore-Site/en_US/Cart-AddProduct';
        }

        var qty = getQuantitySelected($(this));
        if(qty == null || qty == undefined)
        {
            qty = 1;
        }

        if($(e.target).hasClass('recommendations')) {
            qty = 1;
        }

        var form = {
            pid: pid,
            pidsObj: pidsObj,
            childProducts: getChildProducts(),
            quantity: qty
        };

        if (!$('.bundle-item').length) {
            form.options = getOptions($productContainer);
        }

        $(this).trigger('updateAddToCartFormData', form);
        
        var quantityValidationparams = "?pid="+pid+"&quantity="+qty;
        var quantityValidationUrl = $('.quantity-validation-url').val();

        if(quantityValidationUrl == null || quantityValidationUrl == undefined)
        {
            quantityValidationUrl = '/on/demandware.store/Sites-CDWStarterStore-Site/en_US/Product-ValidateQty';
        }
        quantityValidationUrl = quantityValidationUrl + quantityValidationparams;

        var maxQty  = 1000;
        
        if($(this) && $(this).data("wlproduct-id") ) {
            var lineNumber =  $(this).data("wlproduct-lineid");
            var maxQuantityElement = $('#maxQuantity-'+lineNumber);
            if(maxQuantityElement){
                maxQty = maxQuantityElement.val();
            }
        }
        else{
            var maxQuantityElement = $('#maxQuantity-1');
            if(maxQuantityElement){
                maxQty = maxQuantityElement.val();
            }
        }
        if(form.quantity*1 > maxQty*1)
        {
            $.spinner().stop();
            var response = [];
            response.error = true;
            response.message = 'You can only order a maximum quantity of '+numberWithCommas(maxQty)+'.'
            handlePostCartAdd(response);
            return;
        }

        $.ajax({
            url: quantityValidationUrl,
            type: 'get',
            dataType: 'json',
            success: function (data) {
                if(data.productAvailability.availability.messages[0]) {
                    if(!data.productAvailability.available){
                        $('.os-confirmation-btn').hide();
                    } else {
                        $('.os-confirmation-btn').show();
                    }
                    $('.over-sell-confirmation-body').text(data.productAvailability.availability.messages[0]);
                    $('.os-confirmation-btn').data('pid',pid);
                    $('.os-confirmation-btn').data('qty',qty);
                    $.spinner().stop();
                    $('#oversellConfModal').modal('show');
                }
                else 
                {
                    
                    if (addToCartUrl) {
                        $.ajax({
                            url: addToCartUrl,
                            method: 'POST',
                            data: form,
                            success: function (data) {
                                $('body').trigger('product:afterAddToCart', data);
                                handlePostCartAdd(data);                               
                                $.spinner().stop();
                                base.miniCartReportingUrl(data.reportingURL);
                            },
                            error: function () {
                                $.spinner().stop();
                            }
                        });
                    }
                }
            },
            error: function (err) {

            }
        });
        
    });
 }

/**
 * Retrieves the relevant pid value
 * @param {jquery} $el - DOM container for a given add to cart button
 * @return {string} - value to be used when adding product to cart
 */
 function getPidValue($el) {
    var pid;

    //Handling condition for WishList
    if($el && $el.data("wlproduct-id")) {
        pid =  $el.data("wlproduct-id");
        
    }
    else if($el && $el.data("rec-product-id")) {
        pid =  $el.data("rec-product-id");
    }
    else if ($('#quickViewModal').hasClass('show') && !$('.product-set').length) {
        pid = $($el).closest('.modal-content').find('.product-quickview').data('pid');
    } else if ($('.product-set-detail').length || $('.product-set').length) {
        pid = $($el).closest('.product-detail').find('.product-id').text();
    } else {
        pid = $('.product-detail:not(".bundle-item")').data('pid');
    }


    return pid;
}

/**
 * Updates the quantity DOM elements post Ajax call
 * @param {UpdatedQuantity[]} quantities -
 * @param {jQuery} $productContainer - DOM container for a given product
 */
 function updateQuantities(quantities, $productContainer) {
    if ($productContainer.parent('.bonus-product-item').length <= 0) {
        var optionsHtml = quantities.map(function (quantity) {
            var selected = quantity.selected ? ' selected ' : '';
            return '<option value="' + quantity.value + '"  data-url="' + quantity.url + '"' +
                selected + '>' + quantity.value + '</option>';
        }).join('');
        getQuantitySelector($productContainer).empty().html(optionsHtml);
    }
}

function createCarousel(imgs, $productContainer) {
    
}


/**
 * Process the attribute values for an attribute that has image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 * @param {Object} msgs - object containing resource messages
 */
 function processSwatchValues(attr, $productContainer, msgs) {
    attr.values.forEach(function (attrValue) {
        var $attrValue = $productContainer.find('[data-attr="' + attr.id + '"] [data-attr-value="' +
            attrValue.value + '"]');
        var $swatchButton = $attrValue.parent();

        if (attrValue.selected) {
            $attrValue.addClass('selected');
            $attrValue.siblings('.selected-assistive-text').text(msgs.assistiveSelectedText);
        } else {
            $attrValue.removeClass('selected');
            $attrValue.siblings('.selected-assistive-text').empty();
        }

        if (attrValue.url) {
            $swatchButton.attr('data-url', attrValue.url);
        } else {
            $swatchButton.removeAttr('data-url');
        }

        // Disable if not selectable
        $attrValue.removeClass('selectable unselectable');

        $attrValue.addClass(attrValue.selectable ? 'selectable' : 'unselectable');
    });
}

/**
 * Process attribute values associated with an attribute that does not have image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 */
function processNonSwatchValues(attr, $productContainer) {
    var $attr = '[data-attr="' + attr.id + '"]';
    var $defaultOption = $productContainer.find($attr + ' .select-' + attr.id + ' option:first');
    $defaultOption.attr('value', attr.resetUrl);

    attr.values.forEach(function (attrValue) {
        var $attrValue = $productContainer
            .find($attr + ' [data-attr-value="' + attrValue.value + '"]');
        $attrValue.attr('value', attrValue.url)
            .removeAttr('disabled');

        if (!attrValue.selectable) {
            $attrValue.attr('disabled', true);
        }
    });
}

/**
 * Routes the handling of attribute processing depending on whether the attribute has image
 *     swatches or not
 *
 * @param {Object} attrs - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {jQuery} $productContainer - DOM element for a given product
 * @param {Object} msgs - object containing resource messages
 */
function updateAttrs(attrs, $productContainer, msgs) {
    // Currently, the only attribute type that has image swatches is Color.
    var attrsWithSwatches = ['color'];

    attrs.forEach(function (attr) {
        if (attrsWithSwatches.indexOf(attr.id) > -1) {
            processSwatchValues(attr, $productContainer, msgs);
        } else {
            processNonSwatchValues(attr, $productContainer);
        }
    });
}

/**
 * Updates the availability status in the Product Detail Page
 *
 * @param {Object} response - Ajax response object after an
 *                            attribute value has been [de]selected
 * @param {jQuery} $productContainer - DOM element for a given product
 */
function updateAvailability(response, $productContainer) {
    var availabilityValue = '';
    var availabilityMessages = response.product.availability.messages;
    if (!response.product.readyToOrder) {
        availabilityValue = '<li><div>' + response.resources.info_selectforstock + '</div></li>';
    } else {
        availabilityMessages.forEach(function (message) {
            availabilityValue += '<li><div>' + message + '</div></li>';
        });
    }

    $($productContainer).trigger('product:updateAvailability', {
        product: response.product,
        $productContainer: $productContainer,
        message: availabilityValue,
        resources: response.resources
    });
}

/**
 * Generates html for product attributes section
 *
 * @param {array} attributes - list of attributes
 * @return {string} - Compiled HTML
 */
function getAttributesHtml(attributes) {
    if (!attributes) {
        return '';
    }

    var html = '';

    attributes.forEach(function (attributeGroup) {
        if (attributeGroup.ID === 'mainAttributes') {
            attributeGroup.attributes.forEach(function (attribute) {
                html += '<div class="attribute-values">' + attribute.label + ': '
                    + attribute.value + '</div>';
            });
        }
    });

    return html;
}

/**
 * @typedef UpdatedOptionValue
 * @type Object
 * @property {string} id - Option value ID for look up
 * @property {string} url - Updated option value selection URL
 */

/**
 * @typedef OptionSelectionResponse
 * @type Object
 * @property {string} priceHtml - Updated price HTML code
 * @property {Object} options - Updated Options
 * @property {string} options.id - Option ID
 * @property {UpdatedOptionValue[]} options.values - Option values
 */

/**
 * Updates DOM using post-option selection Ajax response
 *
 * @param {OptionSelectionResponse} optionsHtml - Ajax response optionsHtml from selecting a product option
 * @param {jQuery} $productContainer - DOM element for current product
 */
function updateOptions(optionsHtml, $productContainer) {
	// Update options
    $productContainer.find('.product-options').empty().html(optionsHtml);
}

/**
 * Retrieve contextual quantity selector
 * @param {jquery} $el - DOM container for the relevant quantity
 * @return {jquery} - quantity selector DOM container
 */
 function getQuantitySelector($el) {
    var quantitySelected;

    //Handling condition for WishList
    if($el && $el.data("wlproduct-id")) {
        var lineNumber =  $el.data("wlproduct-lineid");
        quantitySelected = $('#quantity-'+lineNumber);
        
    }else {
        if ($el && $('.set-items').length) {
            quantitySelected = $($el).closest('.product-detail').find('.quantity-select');
        } else if ($el && $('.product-bundle').length) {
            var quantitySelectedModal = $($el).closest('.modal-footer').find('.quantity-select');
            var quantitySelectedPDP = $($el).closest('.bundle-footer').find('.quantity-select');
            if (quantitySelectedModal.val() === undefined) {
                quantitySelected = quantitySelectedPDP;
            } else {
                quantitySelected = quantitySelectedModal;
            }
        } else {
            quantitySelected = $('.quantity-select');
        }
    }


    return quantitySelected;
}

/**
 * updates the product view when a product attribute is selected or deselected or when
 *         changing quantity
 * @param {string} selectedValueUrl - the Url for the selected variation value
 * @param {jQuery} $productContainer - DOM element for current product
 */
 function attributeSelect(selectedValueUrl, $productContainer) {
    
    if (selectedValueUrl) {
        $('body').trigger('product:beforeAttributeSelect',
            { url: selectedValueUrl, container: $productContainer });

        $.ajax({
            url: selectedValueUrl,
            method: 'GET',
            success: function (data) {
                handleVariantResponse(data, $productContainer);
                updateOptions(data.product.optionsHtml, $productContainer);
                updateQuantities(data.product.quantities, $productContainer);
                $('body').trigger('product:afterAttributeSelect',
                    { data: data, container: $productContainer });
                try{
                    $('.product-name').empty().html(data.product.productName);
                    if(data.product.availability.preOrder)
                    {
                        $('#pdpAddToCart').empty().html('Pre-Order ');
                        $("#pdpAddToCart").attr('class', 'add-to-cart btn-pre-order btn btn-primary');
                        $("#pdpNotifyMe").removeClass('d-none');
                    }
                    else{
                        $('#pdpAddToCart').empty().html('Add to Cart ');
                        $("#pdpAddToCart").attr('class', 'btn btn-primary add-to-cart');
                        $("#pdpNotifyMe").addClass('d-none');
                    }
                    if(data.product.availability.inStock){
                        $("#estArrivalPDP").removeClass('d-none');
                        $("#pdpNotifyMe").addClass('d-none');
                    }
                    else{
                        $("#estArrivalPDP").addClass('d-none');
                        $("#pdpNotifyMe").removeClass('d-none');
                    }
                    
                    if(data.product.price.isCallForPriceProduct==true)
                    {
                        $('.call-for-price-wrapper').removeClass('d-none');
                        $('.prices-add-to-cart-actions').addClass('d-none');
                    }
                    else{
                        $('.call-for-price-wrapper').addClass('d-none');
                        $('.prices-add-to-cart-actions').removeClass('d-none');
                    }
                }catch (ex) {}    
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    }
}


/**
 * Parses JSON from Ajax call made whenever an attribute value is [de]selected
 * @param {Object} response - response from Ajax call
 * @param {Object} response.product - Product object
 * @param {string} response.product.id - Product ID
 * @param {Object[]} response.product.variationAttributes - Product attributes
 * @param {Object[]} response.product.images - Product images
 * @param {boolean} response.product.hasRequiredAttrsSelected - Flag as to whether all required
 *     attributes have been selected.  Used partially to
 *     determine whether the Add to Cart button can be enabled
 * @param {jQuery} $productContainer - DOM element for a given product.
 */
 function handleVariantResponse(response, $productContainer) {
    var isChoiceOfBonusProducts = false;
    if($productContainer)
        isChoiceOfBonusProducts = $productContainer.parents('.choose-bonus-product-dialog').length > 0;
    var isVaraint;
    if (response && response.product.variationAttributes) {
        updateAttrs(response.product.variationAttributes, $productContainer, response.resources);
        isVaraint = response.product.productType === 'variant';
        if (isChoiceOfBonusProducts && isVaraint) {
            $productContainer.parent('.bonus-product-item')
                .data('pid', response.product.id);

            $productContainer.parent('.bonus-product-item')
                .data('ready-to-order', response.product.readyToOrder);
        }
    }

    // Update primary images
    var primaryImageUrls = response.product.images.large;
    createCarousel(primaryImageUrls, $productContainer);

    // Update pricing
    if (!isChoiceOfBonusProducts) {
        var $priceSelector = $('.prices .price', $productContainer).length
            ? $('.prices .price', $productContainer)
            : $('.prices .price');
        $priceSelector.replaceWith(response.product.price.html);
    }

    // Update promotions
    $productContainer.find('.promotions').empty().html(response.product.promotionsHtml);

    updateAvailability(response, $productContainer);

    if (isChoiceOfBonusProducts) {
        var $selectButton = $productContainer.find('.select-bonus-product');
        $selectButton.trigger('bonusproduct:updateSelectButton', {
            product: response.product, $productContainer: $productContainer
        });
    } else {
        // Enable "Add to Cart" button if all required attributes have been selected
        $('button.add-to-cart, button.add-to-cart-global, button.update-cart-product-global').trigger('product:updateAddToCart', {
            product: response.product, $productContainer: $productContainer
        }).trigger('product:statusUpdate', response.product);
    }

    // Update attributes
    $productContainer.find('.main-attributes').empty()
        .html(getAttributesHtml(response.product.attributes));
}

function selectAttribute() {
    $(document).on('change', 'select[class*="cdw-"], .options-select', function (e) {
        e.preventDefault();
        var $productContainer = $(this).closest('.set-item');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.product-detail');
        }
        attributeSelect(e.currentTarget.value, $productContainer);
    });
}

base.addToCart = addToCart;
base.getPidValue = getPidValue;
base.getQuantitySelected = getQuantitySelected;

//base.attributeSelect = attributeSelect;
base.selectAttribute = selectAttribute;

var exportDetails = $.extend({}, base);

module.exports = exportDetails;