'use strict';

var debounce = require('lodash/debounce');

/**
 * Determines the number of columns to be displayed for the current screen size
 * @param {jQuery} $carousel - jquery object of the current carousel that is being used
 * @returns {Object} an object containing the latest carousel state
 */
function getCarouselState($carousel) {
    var result = {
        itemsToDisplay: null,
        columnCount: null,
        carouselPosition: 0,
        itemsCount: 0,
        rowCount: null,
        maxPosition: 0
    };
    var viewSize = $(window).width();
    var columnCountByWidth = $carousel.data(_DATA_COLUMN_COUNT_BY_WIDTH);
    if(typeof columnCountByWidth != "object" && columnCountByWidth){
        try {
            columnCountByWidth=JSON.parse(columnCountByWidth.replaceAll('\'', '"'));
        }
        catch(e){
            columnCountByWidth = _DEFAULT_COLUMN_COUNT_BY_WIDTH;
        }
    }
    else if (!columnCountByWidth){
        columnCountByWidth = _DEFAULT_COLUMN_COUNT_BY_WIDTH;
    }
    
    result.columnCount = $carousel.data(_DATA_COLUMN_COUNT);
    result.carouselPosition = $carousel.data(_DATA_CAROUSEL_POSITION) || 0;
    result.itemsCount = $carousel.data(_DATA_ITEMS_COUNT);
    result.rowCount = $carousel.data(_DATA_ROW_COUNT);
    var breakpoints = Object.keys(columnCountByWidth).sort((a,b)=>parseInt(b)-parseInt(a));
    for (var i=0; i<breakpoints.length; i++){
        if(viewSize > breakpoints[i]) {
            result.itemsToDisplay = columnCountByWidth[breakpoints[i]];
            break;
        }
    }
    return result;
}

/**
 * Sets the visibility of the carousel items according to the position of the carousel
 * and makes hidden items unreachable for screen readers and keyboard nav
 * @param {jQuery} carousel - the current carousel that is being used
 */
 function refreshCarousel(carousel) {
    var $carousel = $(carousel);
    var $carouselItems = $carousel.find(_CAROUSEL_ITEM_SELECTOR);
    var count = $carouselItems.length;
    if(count){
        $carousel.data(_DATA_ITEMS_COUNT, count);
        $carousel.addClass(_INITIALIZED_CLASS);

        var carouselState = getCarouselState($carousel);
        if(carouselState.itemsToDisplay != carouselState.columnCount){
            carouselState.carouselPosition=0;
            if(carouselState.rowCount){
                $carousel.find('.acme-carousel-row > .acme-carousel-item').unwrap();
                var maxItemsInRow = carouselState.rowCount * carouselState.itemsToDisplay;
                var $div;

                for(var i=0; i<$carouselItems.length; i++){
                    if(i%maxItemsInRow === 0){
                        $div = $("<div class='acme-carousel-row'></div>");
                        $carousel.find(_CAROUSEL_INNER_SELECTOR).append($div);
                    }
                    $($carouselItems[i]).appendTo($div);
                }
            }

            navigateCarousel($carousel, carouselState);
            hideInactiveCarousels($carousel, carouselState);
        }
    }
}

/**
 * Hides inavtive carousels
 * @param {*} $carousel 
 * @param {*} carouselState 
 */
function hideInactiveCarousels($carousel, carouselState){
    if(carouselState.maxPosition && !carouselState.rowCount){
        var $carouselsToHide = $carousel.find(_CAROUSEL_INACTIVE_ITEMS_SELECTOR);
        $carouselsToHide.addClass(_VHIDDEN_CLASS);
        $carouselsToHide.removeAttr('tabindex').removeAttr('aria-hidden');
        $carouselsToHide.find('a, button, details, input, textarea, select')
            .removeAttr('tabindex')
            .removeAttr('aria-hidden');
    }
}

/**
 * Navigates the carousel to the appropriate location
 * @param {jQuery} $carousel - jquery object of the current carousel that is being used
 * @param {*} carouselState - carousel's next state object
 */
function navigateCarousel($carousel, carouselState){
    if(_timeoutID){
        clearTimeout(_timeoutID);
    }
    
    var maxPosition;
    var $carouselItems = $carousel.find(_CAROUSEL_ITEM_SELECTOR);
    var $carouselRows = $carousel.find(_CAROUSEL_ROWS_SELECTOR);
    var width = (Math.floor(100 * parseFloat(100/carouselState.itemsToDisplay)) / 100).toFixed(2);
    $carouselItems.css("width", width + '%');

    if(carouselState.rowCount){
        $carouselRows.removeClass(_VHIDDEN_CLASS).removeClass(_ACTIVE_CLASS);
        maxPosition = Math.ceil($carouselItems.length/carouselState.itemsToDisplay/carouselState.rowCount)-1;
    }
    else {
        //show all items for smooth transition
        $carouselItems.removeClass(_VHIDDEN_CLASS).removeClass(_ACTIVE_CLASS);
        maxPosition = Math.ceil($carouselItems.length/carouselState.itemsToDisplay)-1;
    }
    carouselState.maxPosition = maxPosition;

    if(carouselState.carouselPosition == -1){
        carouselState.carouselPosition = maxPosition;
    }
    else if(carouselState.carouselPosition > maxPosition){
        carouselState.carouselPosition = 0;
    }

    if(maxPosition){
        if(!carouselState.rowCount){
            //mark active items to be displayed
            var startIndex = carouselState.carouselPosition * carouselState.itemsToDisplay;
            for(var i=startIndex; i<startIndex+carouselState.itemsToDisplay; i++){
                if($carouselItems[i]){
                    var item = $carouselItems[i];
                    item.classList.add(_ACTIVE_CLASS);
                }
                else break;
            }
        }

        var left = -carouselState.carouselPosition*100 + '%';
        var $carouselInner = $carousel.find(_CAROUSEL_INNER_SELECTOR);
        $carouselInner.css('left', left);
        $carouselInner.addClass('no-transition');

        $carousel.data(_DATA_COLUMN_COUNT, carouselState.itemsToDisplay);
        $carousel.data(_DATA_CAROUSEL_POSITION, carouselState.carouselPosition);

        //hide all inactive items after CSS transition completes
        _timeoutID = setTimeout(function(){
            if (_isSafari) {
                $carousel.hide().show(0);
            } 
            hideInactiveCarousels($carousel, carouselState);
        }, _ANIMATION_DURATION);
        $carousel.find('.' + _NEXT_ICON_CLASS).removeClass(_HIDDEN_CLASS);
        $carousel.find('.' + _PREV_ICON_CLASS).removeClass(_HIDDEN_CLASS);
    }
    else {
        $carousel.find('.' + _NEXT_ICON_CLASS).addClass(_HIDDEN_CLASS);
        $carousel.find('.' + _PREV_ICON_CLASS).addClass(_HIDDEN_CLASS);
    }
}

/**
 * Moves the carousel to either left or right. Tied to click listener of prev/next.
 * @param {Object} event - Event object of click
 * @param {*} direction - Direction in which the carousel should be moved
 */
function move(event, direction){
    event.preventDefault();
    event.stopPropagation();
    var $carousel = $(event.target).parents(_CAROUSEL_SELECTOR);
    var carouselState = getCarouselState($carousel);

    switch(direction){
        case _DIRECTION.LEFT: 
            carouselState.carouselPosition--;
            break;
        
        case _DIRECTION.RIGHT: 
            carouselState.carouselPosition++;
            break;
    }
    navigateCarousel($carousel, carouselState);
}

/**
 * Moves the carousel as per data-slide-to set in carousel indicators. Tied to click listener of carousel indicators.
 * @param {Object} event - Event object of click
 */
 function moveTo(event){
    event.preventDefault();
    event.stopPropagation();
    var $this = $(event.target);
    var $carousel = $this.parents(_CAROUSEL_SELECTOR);
    if($carousel.hasClass(_CAROUSEL_INDICATORS_CLASS)){
        $carousel = $carousel.prev(_CAROUSEL_SELECTOR)
    }
    var carouselState = getCarouselState($carousel);

    carouselState.carouselPosition = $this.data('slide-to');
    navigateCarousel($carousel, carouselState);
}

/**
 * Handles touch start event for touch devices
 * @param {*} touchStartEvent Event object
 */
function touchStartListener (touchStartEvent) {
    var $carousel = $(this);
    var $carouselInner = $carousel.find(_CAROUSEL_INNER_SELECTOR)
    _xClick = touchStartEvent.originalEvent.touches[0].pageX;
    _xLeft = parseFloat($carouselInner.css('left'));
    _carouselWidth = $carouselInner.width();
    $carousel.find(_CAROUSEL_ITEM_SELECTOR).removeClass(_VHIDDEN_CLASS).removeClass(_ACTIVE_CLASS);
}

/**
 * Handles touch move event for touch devices to detech swipe
 * @param {*} touchMoveEvent Event object
 */
function touchMoveListener (touchMoveEvent) {
    var $carousel = $(this);
    var xMove = touchMoveEvent.originalEvent.touches[0].pageX;
    var xDiff = _xClick - xMove;
    var newLeft = _xLeft - (xDiff/_carouselWidth)*100;
    var $carouselInner = $carousel.find(_CAROUSEL_INNER_SELECTOR);
    $carouselInner.addClass('no-transition');

    //Handle swipe beyond left and right edges
    var maxPosition = Math.ceil($carousel.data(_DATA_ITEMS_COUNT)/$carousel.data(_DATA_COLUMN_COUNT))-1;
    var mmaxLeft = -maxPosition*100 + '%';
    newLeft = Math.min(0, newLeft);
    newLeft = Math.max(mmaxLeft, newLeft);

    $carouselInner.css('left', newLeft + '%');
}

/**
 * Handles touch end event for touch devices
 * @param {*} touchMoveEvent Event object
 */
function touchEndListener (touchMoveEvent) {
    var xMove = touchMoveEvent.originalEvent.changedTouches[0].pageX;
    var xDiff = _xClick - xMove;
    if(xDiff >= _SWIPE_OFFSET){
        move(touchMoveEvent, _DIRECTION.RIGHT)
    }
    else if(xDiff <= -_SWIPE_OFFSET){
        move(touchMoveEvent, _DIRECTION.LEFT)
    }
    else {
        var $target = $(touchMoveEvent.target);
        if($target.parents('.' + _NEXT_ICON_CLASS).length || $target.hasClass(_NEXT_ICON_CLASS)){
            move(touchMoveEvent, _DIRECTION.RIGHT);
        }
        else if($target.parents('.' + _PREV_ICON_CLASS).length || $target.hasClass(_PREV_ICON_CLASS)){
            move(touchMoveEvent, _DIRECTION.LEFT);
        }
    }
}


function initialize() {
    var $carouselList = $(_UNINITIALIZED_CAROUSEL_SELECTOR);
    $carouselList.each((index, carousel) => refreshCarousel(carousel));

    $(window).on('resize', debounce(function () {
        $carouselList.each((index, carousel) => refreshCarousel(carousel));
    }, _DEBOUNCE_DELAY));

    $(_CAROUSEL_NEXT_SELECTOR).off('click').on('click', (event) => move(event, _DIRECTION.RIGHT));
    $(_CAROUSEL_PREV_SELECTOR).off('click').on('click', (event) => move(event, _DIRECTION.LEFT));
    $(_CAROUSEL_INDICATOR_SELECTOR).off('click').on('click', (event) => moveTo(event));

    $carouselList.off('touchstart').on('touchstart', touchStartListener);
    $carouselList.off('touchmove').on('touchmove', touchMoveListener);
    $carouselList.off('touchend').on('touchend', touchEndListener);
    
}

const _DEFAULT_COLUMN_COUNT_BY_WIDTH = {"0": 2,"750": 3,"1200": 4};
const _DATA_COLUMN_COUNT_BY_WIDTH = 'column-count-by-width';
const _DATA_COLUMN_COUNT = 'column-count';
const _DATA_CAROUSEL_POSITION = 'carousel-position';
const _DATA_ITEMS_COUNT = 'items-count';
const _DATA_ROW_COUNT = 'row-count';
const _CAROUSEL_SELECTOR = '.acme-carousel';
const _UNINITIALIZED_CAROUSEL_SELECTOR = '.acme-carousel:not(.initialized)';
const _CAROUSEL_INNER_SELECTOR = '.acme-carousel-inner';
const _CAROUSEL_ITEM_SELECTOR = '.acme-carousel-inner > .acme-carousel-item, .acme-carousel-row > .acme-carousel-item';
const _CAROUSEL_ROWS_SELECTOR = '.acme-carousel-row';
const _CAROUSEL_INDICATOR_SELECTOR = '.acme-carousel .carousel-indicators, .acme-carousel + .carousel-indicators';
const _CAROUSEL_INACTIVE_ITEMS_SELECTOR = '.acme-carousel-inner > .acme-carousel-item:not(.active), .acme-carousel-row > .acme-carousel-item:not(.active)';
const _CAROUSEL_NEXT_SELECTOR = '.acme-carousel .carousel-control-next';
const _CAROUSEL_PREV_SELECTOR = '.acme-carousel .carousel-control-prev';
const _NEXT_ICON_CLASS = 'carousel-control-next';
const _PREV_ICON_CLASS = 'carousel-control-prev';
const _CAROUSEL_INDICATORS_CLASS = 'carousel-indicators';
const _VHIDDEN_CLASS = 'vhidden';
const _ACTIVE_CLASS = 'active';
const _INITIALIZED_CLASS = 'initialized';
const _HIDDEN_CLASS = 'hidden';
const _ANIMATION_DURATION = 500;
const _DEBOUNCE_DELAY = 500;
const _SWIPE_OFFSET = 50;
const _DIRECTION = {
    LEFT: 1,
    RIGHT: 2
}
var _timeoutID = null;
var _xClick;
var _xLeft;
var _carouselWidth;
var _isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

module.exports = function () {
    $(function () {
        initialize()
        $(document).on("acme-carousel:init", _UNINITIALIZED_CAROUSEL_SELECTOR, initialize);
    });
};