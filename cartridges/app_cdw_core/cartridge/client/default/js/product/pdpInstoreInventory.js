'use strict';

var pdpInstoreInventory = require('instorepickup/product/pdpInstoreInventory');
var storeLocator = require('base/storeLocator/storeLocator');
var base = require('base/product/base');


/**
 * Restores Quantity Selector to its original state.
 * @param {HTMLElement} $quantitySelect - The Quantity Select Element
 */
 function restoreQuantityOptions($quantitySelect) {
    var originalHTML = $quantitySelect.data('originalHTML');
    if (originalHTML) {
        $quantitySelect.html(originalHTML);
    }
}

/**
 * Updates the Quantity Selector based on the In Store Quantity.
 * @param {string} quantitySelector - Quantity Selector
 * @param {string} quantityOptionSelector - Quantity Option Selector
 * @param {number} productAtsValue - Inventory in the selected store
 */
 function updateQOptions(quantitySelector, quantityOptionSelector, productAtsValue) {
    var selectedQuantity = $(quantitySelector).val();
    restoreQuantityOptions($(quantitySelector));
    for (var i = $(quantityOptionSelector).length - 1; i >= productAtsValue; i--) {
        $(quantityOptionSelector).eq(i).remove();
    }
    $(quantitySelector + ' option[value="' + selectedQuantity + '"]').attr('selected', 'selected');
}

/**
 * Sets the data attribute of Quantity Selector to save its original state.
 * @param {HTMLElement} $quantitySelect - The Quantity Select Element
 */
 function setOriginalQuantitySelect($quantitySelect) {
    if (!$quantitySelect.data('originalHTML')) {
        $quantitySelect.data('originalHTML', $quantitySelect.html());
    } // If it's already there, don't re-set it
}

/**
 * Update quantity options. Only display quantity options that are available for the store.
 * @param {sring} searchPID - The product ID of the selected product.
 * @param {number} storeId - The store ID selected for in store pickup.
 */
 function updateQuantityOptions(searchPID, storeId) {
    var selectorPrefix = '.product-detail[data-pid="' + searchPID + '"]';
    var productIdSelector = selectorPrefix + ' .product-id';
    var quantitySelector = selectorPrefix + ' .quantity-select';
    var quantityOptionSelector = quantitySelector + ' option';

    setOriginalQuantitySelect($(quantitySelector));

    var requestData = {
        pid: base.getPidValue($(this)),
        quantitySelected: $(quantitySelector).val(),
        storeId: storeId
    };

    $.ajax({
        url: $('.btn-get-in-store-inventory').data('ats-action-url'),
        data: requestData,
        method: 'GET',
        success: function (response) {
            // Update Quantity dropdown, Remove quantity greater than inventory
            var productAtsValue = response.atsValue;

            var availabilityValue = '';

            var $productContainer = $('.product-detail[data-pid="' + searchPID + '"]');

            if (!response.product.readyToOrder) {
                availabilityValue = '<div>' + response.resources.info_selectforstock + '</div>';
            } else {
                response.product.messages.forEach(function (message) {
                    availabilityValue += '<div>' + message + '</div>';
                });
            }

            // $($productContainer).trigger('product:updateAvailability', {
            //     product: response.product,
            //     $productContainer: $productContainer,
            //     message: availabilityValue,
            //     resources: response.resources
            // });

            // $('button.add-to-cart, button.add-to-cart-global, button.update-cart-product-global').trigger('product:updateAddToCart', {
            //     product: response.product, $productContainer: $productContainer
            // });

            updateQOptions(quantitySelector, quantityOptionSelector, productAtsValue);

            $('.bopis-add-to-cart').html(response.storeNameWithATS);
            if(productAtsValue === 0) {
                $('.bopis-add-to-cart').attr('disabled','disabled');                
            } else {
                if($('.bopis-add-to-cart').attr('disabled') && $('.bopis-add-to-cart').attr('disabled').length >0) {
                    $('.bopis-add-to-cart').removeAttr('disabled');
                }
            }
        }
    });
}

/**
 * Override to skip the BOPIS add to cart as BOPIS is handled through the different button
 */
function updateAddToCartFormData() {
    $('body').on('updateAddToCartFormData', function (e, form) {
        if (form.pidsObj) {
            var pidsObj = JSON.parse(form.pidsObj);
            pidsObj.forEach(function (product) {
                var storeElement = $('.product-detail[data-pid="' +
                    product.pid
                    + '"]').find('.store-name');
                product.storeId = $(storeElement).length// eslint-disable-line no-param-reassign
                    ? $(storeElement).attr('data-store-id')
                    : null;
            });

            form.pidsObj = JSON.stringify(pidsObj);// eslint-disable-line no-param-reassign
        }

        var storeElement = $('.product-detail[data-pid="'
            + form.pid
            + '"]');

        if ($(storeElement).length) {
            // form.storeId = $(storeElement).find('.store-name') // eslint-disable-line
            //     .attr('data-store-id');
        }
    });
}

/**
 * Override to skip the BOPIS add to cart as BOPIS is handled through the different button
 */
 function updateAddToCartFormDataForBOPIS() {
    $('body').on('updateAddToCartFormDataForBOPIS', function (e, form) {
        if (form.pidsObj) {
            var pidsObj = JSON.parse(form.pidsObj);
            pidsObj.forEach(function (product) {
                var storeElement = $('.product-detail[data-pid="' +
                    product.pid
                    + '"]').find('.store-name');
                product.storeId = $(storeElement).length// eslint-disable-line no-param-reassign
                    ? $(storeElement).attr('data-store-id')
                    : null;
            });

            form.pidsObj = JSON.stringify(pidsObj);// eslint-disable-line no-param-reassign
        }

        var storeElement = $('.product-detail[data-pid="'
            + form.pid
            + '"]');

        if ($(storeElement).length) {
            form.storeId = $(storeElement).find('.store-name') // eslint-disable-line
                .attr('data-store-id');
        }

    });
}

function removeStoreSelection() {
    $('body').on('click', '#remove-store-selection', (function () {

        var resetSessionURL = $(this).closest('.product-detail').find('.store-name').attr('data-reset-url');

        $.ajax({
            url: resetSessionURL,
            method: 'GET',
            data: "",
            success: function (data) {
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });

        deselectStore($(this).closest('.product-detail'));
        $(document).trigger('store:afterRemoveStoreSelection', $(this).closest('.product-detail').find('.quantity-select'));

        //Disable the BOPIS AddToCart Button
        $('.bopis-add-to-cart').hide();
        
    }));
}

/**
 * Remove the selected store.
 * @param {HTMLElement} $container - the target html element
 */
 function deselectStore($container) {
    var storeElement = $($container).find('.selected-store-with-inventory');
    $(storeElement).find('.card-body').empty();
    $(storeElement).addClass('display-none');
    $($container).find('.btn-get-in-store-inventory').show();
    if($('.btn-get-in-store-inventory').attr('disabled') && $('.btn-get-in-store-inventory').attr('disabled').length >0) {
        $('.btn-get-in-store-inventory').removeAttr('disabled');
    }
    $($container).find('.quantity-select').removeData('originalHTML');
}

/**
 * Handles the newly created BOPIS button in PDP
 */
 function handleBOPISAddToCart() {
    $('.bopis-add-to-cart').click(function (e) {
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
                        pid: base.getPidValue($(this)),
                        qty: $(this).find('.quantity-select').val(),
                        options: getOptions($(this))
                    });
                }
            });
            pidsObj = JSON.stringify(setPids);
        }        

        pid = base.getPidValue($(this));

        var $productContainer = $(this).closest('.product-detail');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.quick-view-dialog').find('.product-detail');
        }

        addToCartUrl = getAddToCartUrl();

        var form = {
            pid: pid,
            pidsObj: pidsObj,
            childProducts: getChildProducts(),
            quantity: base.getQuantitySelected($(this))
        };

        if (!$('.bundle-item').length) {
            form.options = getOptions($productContainer);
        }
        $(this).trigger('updateAddToCartFormDataForBOPIS', form);
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
    });
}


/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
 function handlePostCartAdd(response) {
    if(!response.error) {
        $('.minicart').trigger('count:update', response);
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        $('.minicart').trigger('mouseenter', response);
    }
    
    var messageType = response.error ? 'alert-danger' : 'alert-success';
    // show add to cart toast
    if (response.newBonusDiscountLineItem
        && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
            pdpInstoreInventory.methods.editBonusProducts(response.newBonusDiscountLineItem);
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
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */
 function getAddToCartUrl() {
    return $('.add-to-cart-url').val();
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

function selectStoreWithInventory() {
    $('body').on('store:selected', function (e, data) {
        var searchPID = $('.btn-storelocator-search').attr('data-search-pid');
        var storeElement = $('.product-detail[data-pid="' + searchPID + '"]');
        // $(storeElement).find('.selected-store-with-inventory .card-body').empty();
        // $(storeElement).find('.selected-store-with-inventory .card-body').append(data.storeDetailsHtml);
        $(storeElement).find('.store-name').attr('data-store-id', data.storeID);
        // $(storeElement).find('.selected-store-with-inventory').removeClass('display-none');
        // $(storeElement).find('.change-store-section').show();
        

        var $changeStoreButton = $(storeElement).find('.change-store');
        $($changeStoreButton).data('postal', data.searchPostalCode);
        $($changeStoreButton).data('radius', data.searchRadius);

        $(storeElement).find('.btn-get-in-store-inventory').hide();

        updateQuantityOptions(searchPID, data.storeID);

        $('#inStoreInventoryModal').modal('hide');
        $('#inStoreInventoryModal').remove();
        //Enable the BOPIS AddToCart Button
        $('.bopis-add-to-cart').show();
    });
}

/**
 * Generates the modal window on the first call.
 */
 function getModalHtmlElement() {
    if ($('#inStoreInventoryModal').length !== 0) {
        $('#inStoreInventoryModal').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal " id="inStoreInventoryModal" role="dialog">'
        + '<div class="modal-dialog in-store-inventory-dialog">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '<div class="modal-header justify-content-end">'
        + '    <button type="button" class="close pull-right" data-dismiss="modal" title="'
        +          $('.btn-get-in-store-inventory').data('modal-close-text') + '">'    // eslint-disable-line
        + '        &times;'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body"></div>'
        + '<div class="modal-footer"></div>'
        + '</div>'
        + '</div>'
        + '</div>';
    $('body').append(htmlString);
    $('#inStoreInventoryModal').modal('show');
}

/**
 * Replaces the content in the modal window with find stores components and
 * the result store list.
 * @param {string} pid - The product ID to search for
 * @param {number} quantity - Number of products to search inventory for
 * @param {number} selectedPostalCode - The postal code to search for inventory
 * @param {number} selectedRadius - The radius to search for inventory
 */
 function fillModalElement(pid, quantity, selectedPostalCode, selectedRadius) {
    var requestData = {
        products: pid + ':' + quantity
    };

    if (selectedRadius) {
        requestData.radius = selectedRadius;
    }

    if (selectedPostalCode) {
        requestData.postalCode = selectedPostalCode;
    }

    $('#inStoreInventoryModal').spinner().start();
    $.ajax({
        url: $('.btn-get-in-store-inventory').data('action-url'),
        data: requestData,
        method: 'GET',
        success: function (response) {
            $('#inStoreInventoryModal .modal-body').empty();
            $('#inStoreInventoryModal .modal-body').html(response.storesResultsHtml);
            storeLocator.search();
            storeLocator.changeRadius();
            storeLocator.selectStore();
            storeLocator.updateSelectStoreButton();

            $('.btn-storelocator-search').attr('data-search-pid', pid);

            if (selectedRadius) {
                $('#radius').val(selectedRadius);
            }

            if (selectedPostalCode) {
                $('#store-postal-code').val(selectedPostalCode);
            }

            if (!$('.results').data('has-results')) {
                $('.store-locator-no-results').show();
            }

            $('#inStoreInventoryModal').modal('show');
            $('#inStoreInventoryModal').spinner().stop();
        },
        error: function () {
            $('#inStoreInventoryModal').spinner().stop();
        }
    });
}

function showInStoreInventory() {
    $('.btn-get-in-store-inventory').on('click', function (e) {
        var pid = $(this).closest('.product-detail').attr('data-pid');
        var quantity = $(this).closest('.product-detail').find('.quantity-select').val();
        getModalHtmlElement();
        fillModalElement(pid, quantity);
        e.stopPropagation();
    });
}

function changeStore() {
    $('body').on('click', '.change-store', (function () {
        var pid = $(this).closest('.product-detail').attr('data-pid');
        var quantity = $(this).closest('.product-detail').find('.quantity-select').val();
        getModalHtmlElement();
        fillModalElement(pid, quantity, $(this).data('postal'), $(this).data('radius'));
    }));
}


var exportDetails = $.extend(pdpInstoreInventory, { handleBOPISAddToCart: handleBOPISAddToCart, updateAddToCartFormDataForBOPIS: updateAddToCartFormDataForBOPIS } );
pdpInstoreInventory.updateAddToCartFormData = updateAddToCartFormData;
pdpInstoreInventory.removeStoreSelection = removeStoreSelection;
pdpInstoreInventory.selectStoreWithInventory = selectStoreWithInventory;
pdpInstoreInventory.showInStoreInventory = showInStoreInventory;
pdpInstoreInventory.changeStore = changeStore;

module.exports = exportDetails;
