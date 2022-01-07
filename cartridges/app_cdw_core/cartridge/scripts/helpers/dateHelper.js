'use strict';

/**
 * Formats date
 * @param {*} date 
 * @returns 
 */
function formatShippingDate(date) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var dateObj = new Date(date);
    var dayName = days[dateObj.getDay()];
    return  dayName + '.' + (dateObj.getMonth()+1)+ '/' + dateObj.getDate();
}

function formatEstimatedDate(date) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    var dateObj = new Date(date);
    var dayName = days[dateObj.getDay()];
    var monthName = months[dateObj.getMonth()];
    return  dayName + ' ' + monthName + ' ' + dateObj.getDate();
}

module.exports = {
    formatShippingDate : formatShippingDate,
    formatEstimatedDate : formatEstimatedDate
};