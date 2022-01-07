'use strict';

var compare = require('../product/compare');
/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
    var $updates = $results.find(selector);
    if($updates.html() === undefined || $updates.html() == 'undefined') {
        $(selector).css('display','none');
    }else {
        $(selector).css('display','');
        $(selector).empty().html($updates.html());
    }
    
}

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
    $('.refinement.active').each(function () {
        $(this).removeClass('active');
        var activeDiv = $results.find('.' + $(this)[0].className.replace(/ /g, '.'));
        activeDiv.addClass('active');
        activeDiv.find('button.title').attr('aria-expanded', 'true');
    });

    updateDom($results, '.refinements');
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
    var $results = $(response);
    var specialHandlers = {
        '.refinements': handleRefinements
    };

    // Update DOM elements that do not require special handling
    [
        '.all-sub-categories',
        '.search-banner',
        '.breadcrumb',
        '.grid-header',
        '.header-bar',
        '.header.page-title',
        '.product-grid',
        '.show-more',
        '.filter-bar'
    ].forEach(function (selector) {
        updateDom($results, selector);
    });

    // $(".search-banner").empty().html("YYOOYYYYYYYYY");

    Object.keys(specialHandlers).forEach(function (selector) {
        specialHandlers[selector]($results);
    });
}

/**
 * This function retrieves another page of content to display in the content search grid
 * @param {JQuery} $element - the jquery element that has the click event attached
 * @param {JQuery} $target - the jquery element that will receive the response
 * @return {undefined}
 */
function getContent($element, $target) {
    var showMoreUrl = $element.data('url');
    $.spinner().start();
    $.ajax({
        url: showMoreUrl,
        method: 'GET',
        success: function (response) {
            $target.append(response);
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
    var $tempDom = $('<div>').append($(response));
    var sortOptions = $tempDom.find('.grid-footer').data('sort-options').options;
    sortOptions.forEach(function (option) {
        $('option.' + option.id).val(option.url);
    });
}

/**
 * Updates the URL to determine stage
 * @param {string} pathName
 */
    function updateUrl(pathName) {
    // alert("currentStage::"+currentStage);
    history.pushState(
        111,
        document.title,
        pathName
    );
}

module.exports = {
    filter: function () {
        // Display refinements bar when Menu icon clicked
        $('.container').on('click', 'button.filter-results', function () {
            $('.refinement-bar').show();
            $('body').css('overflow','hidden');
            $('.refinement-bar').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', true);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', true);
            $('.refinement-bar .close').focus();
        });
    },

    closeRefinements: function () {
        // Refinements close button
        $('.container').on('click', '.refinement-bar button.close, .modal-background', function () {
            $('.refinement-bar, .modal-background').hide();
            $('body').css('overflow','auto');
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
            $('.btn.filter-results').focus();
        });
    },

    resize: function () {
        // Close refinement bar and hide modal background if user resizes browser
        $(window).resize(function () {
            $('.refinement-bar, .modal-background').hide();
            $('.refinement-bar').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.row').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.tab-pane.active').siblings().attr('aria-hidden', false);
            $('.refinement-bar').closest('.container.search-results').siblings().attr('aria-hidden', false);
        });
    },

    sort: function () {
        // Handle sort order menu selection
        $('body').on('change', '.sort-order-options', (function (e) {
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:sort', this.value);
            
            $.ajax({
                url: this.value,
                data: { //selectedUrl: this.value 
                },
                method: 'GET',
                success: function (response) {
                    $('.product-grid').empty().html(response);
                    compare.handleClearCompareBar();
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        }));
    },

    showMore: function () {
        // Show more products
        $('.container').on('click', '.show-more a', function (e) {
            e.stopPropagation();
            var showMoreUrl = $(this).data('url');
            e.preventDefault();

            $.spinner().start();
            $(this).trigger('search:showMore', e);
            $.ajax({
                url: showMoreUrl,
                data: { //selectedUrl: showMoreUrl 
                },
                method: 'GET',
                success: function (response) {
                    $('.product-grid').empty().append(response);
                    updateSortOptions(response);

                    /** Handling canonical URL */
                    if($(".pagination-canonical-url").attr("data-id") != null && $(".pagination-canonical-url").attr("data-id") != undefined && 
                            $(".pagination-canonical-url").attr("data-id") != 'null') {
                                window.history.replaceState("","",$(".pagination-canonical-url").attr("data-id"));
                                $('link[rel=canonical]').attr("href",$(".pagination-canonical-url").attr("data-id"));
                    }

                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    },

    applyFilter: function () {
        // Handle refinement value selection and reset click
        $('.container').on(
            'click',
            '.refinements li a, .refinement-bar button.reset, .filter-value a, .swatch-filter a',
            function (e) {
                e.preventDefault();
                e.stopPropagation();

                $.spinner().start();
                $(this).trigger('search:filter', e);
                $.ajax({
                    url: $(this).data('href'),
                    data: {
                        page: $('.grid-footer').data('page-number')
                        //selectedUrl: $(this).data('href')
                    },
                    method: 'GET',
                    success: function (response) {
                        parseResults(response);
                        /** Handling the H1 replacement */
                        if($(".refinement-included-h1").attr("data-id") != null && $(".refinement-included-h1").attr("data-id") != undefined && 
                                $(".refinement-included-h1").attr("data-id") != 'null') {
                            $('.header.page-title').empty().show().append($(".refinement-included-h1").attr("data-id"));
                            $(document).attr("title", $(".page-title-value").attr("data-id"));
                        }
                        if($(".window-replace-url").attr("data-id")) {
                            var updateURL = $(".window-replace-url").attr("data-id");
                            window.history.replaceState("","",updateURL);
                            $('link[rel=canonical]').attr("href",updateURL);
                        }

                        if($(".refinement-included-banner-image").attr("data-id") != null && $(".refinement-included-banner-image").attr("data-id") != undefined && 
                                $(".refinement-included-banner-image").attr("data-id") != 'null') {
                                var bannerImageUrl = $(".refinement-included-banner-image").attr("data-id");
                                var noSpacerImage = $(".no-spacer-image-path").attr("data-id");    
                                $.get(bannerImageUrl)
                                    .done(function() { 
                                        $('.hero-bg').empty().show().append('<img src="'+bannerImageUrl+'" onerror="this.src=\''+noSpacerImage+'\'">');
                                    }).fail(function() { 
                                    });
                            
                        }                        
                        
                        /** Handle the Canonical URL Udpate */
                        /** Handle the BannerImage for Category with Brand appended */
                        /** Handle the PageTitle */
                        compare.handleClearCompareBar();
                        $('html, body').animate({ scrollTop: 300 }, 'fast');
                        $.spinner().stop();
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            });
    },

    showContentTab: function () {
        // Display content results from the search
        $('.container').on('click', '.content-search', function () {
            if ($('#content-search-results').html() === '') {
                getContent($(this), $('#content-search-results'));
            }
        });

        // Display the next page of content results from the search
        $('.container').on('click', '.show-more-content button', function () {
            getContent($(this), $('#content-search-results'));
            $('.show-more-content').remove();
        });
    },
    showMoreRefinementValues: function () {
        // Display all the refinement values
        $('.container').on('click','.see-more-refinement-vaues', function (e) {
            var reinementName = $(this).attr("data-refinement-name");
            $('#refinement-'+reinementName+" .values .reinement-values-li").each(function () {
                $('#refinement-'+reinementName+" .values .reinement-values-li").css('display', 'block');
            });
            $(this).css('display', 'none');
        });

    },
    updateItemsPerPage: function () {
        // Update Items Per Page
        $('body').on('change', '.plp-items-per-page', function (e) {
            e.stopPropagation();
            var updateItemsPerPageUrl = $(this).data('url');
            e.preventDefault();
            var itemsPerPage = $(this).val();

            $.spinner().start();
            $(this).trigger('search:showMore', e);
            $.ajax({
                url: updateItemsPerPageUrl,
                data: { start: "0",
                        sz: itemsPerPage},
                method: 'GET',
                success: function (response) {
                    $('.product-grid').empty().append(response);
                    updateSortOptions(response);
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    }
};
