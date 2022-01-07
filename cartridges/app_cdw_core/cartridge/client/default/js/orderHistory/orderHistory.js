'use strict';

var base = require('base/orderHistory/orderHistory');


/**
 * Submits the filters and get the response from S2K to display them refreshing
 * 
 *
 * @return {string[]} - List of selected bundle product item ID's
 */
 function submitOrderHistoryFilters() {
    $('.btn-order-history-filter').click(function (e) {
        var $ordersContainer = $('.order-list-container');
        $ordersContainer.empty();
        $.spinner().start();
        $('.order-history-select').trigger('orderHistory:sort', e);

        var queryText = $('.order-history-query-text').val();
        var dateFilter = $('.order-history-filter-select').val();
        var url = $('.btn-order-history-filter').data("url");
        var data = {
            queryText: queryText,
            dateFilter: dateFilter,
            orderFilterRequest: true
        };

        console.log(JSON.stringify(data));
        $.ajax({
            url: url,
            method: 'GET',
            data: data,
            success: function (data) {
                 $ordersContainer.html(data);
                 if(!(data.length > 1)) {
                    var emptyOrderHistoryHtml = '<div class="row justify-content-center">' +
                        '<div class="col-12 col-sm-8 col-md-6 mb-4 text-center">' +
                        '<h3> No order history to display. </h3>' + '</div>';

                    $('.order-list-container').append(emptyOrderHistoryHtml);
                 }
                 $.spinner().stop();
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
                $.spinner().stop();
            }
        });
    });
}


// var exportDetails = $.extend(base, { submitOrderHistoryFilters: submitOrderHistoryFilters } );

module.exports = { submitOrderHistoryFilters: submitOrderHistoryFilters };
