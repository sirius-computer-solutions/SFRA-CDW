

try {
    if (typeof sfraDatalayer === 'undefined') {
        window.sfraDatalayer = {
            data: {},
            event: [],
        };
    }

    const sfraTrackingData = {};
    document.addEventListener('DOMContentLoaded', function () {
        window.assignTracking = function (nodePropertyName, trackingObject, node) {
            const tmp = JSON.parse(node.dataset[nodePropertyName]);
            if (tmp && tmp.constructor === Array) {
                tmp.forEach((m) => {
                    Object.assign(trackingObject, m);
                });
            }
        };
        const viewNodes = document.querySelectorAll('[data-tracking-view]');
        // eslint-disable-next-line no-undef
        viewNodes.forEach(assignTracking.bind(this, 'trackingView', sfraTrackingData));

        window.sfraDatalayer.data = sfraTrackingData;

        // eslint-disable-next-line no-unused-vars
        window.$('body').on('product:beforeAddToCart', (event, data) => {
            sfraDatalayer.event.push('beforeAddToCart event');
        });

        // eslint-disable-next-line no-unused-vars
        window.$('body').on('product:afterAddToCart', (event, data) => {
            sfraDatalayer.event.push('afterAddToCart event');
        });
    });
} catch (e) {
    // temporary work around to force a server side log entry if an exception happens
    const head = document.getElementsByTagName('head').item(0);
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `\${URLUtils.https("Error-Force").abs()}?exception=${e.toString()}`);
    head.appendChild(script);
}

