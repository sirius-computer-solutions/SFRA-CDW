'use strict';

var HashMap = require('dw/util/HashMap');

/**
 * @constructor
 * @desc Get an ordered list of product attributes
 *
 * @param {Product} products - Selected products instantiated through productFactory
 */
function CompareAttributesModel(products) {
    var attributes = {};
    var sorted = [];
    var sortedKeys = [];
    var compareAttributesMap = new HashMap();

    products.forEach(function (product) {
        if (product.attributes) {
            product.attributes.forEach(function (productAttr) {
                var isMainAttr = productAttr.ID === 'mainAttributes';
                productAttr.attributes.forEach(function (attr) {
                    if (!attributes[attr.label]) {
                        attributes[attr.label] = {
                            values: [],
                            order: isMainAttr ? 0 : 1
                        };
                    }
                    attributes[attr.label].values.push({
                        pid: product.id,
                        values: attr.value.join(',')
                    });
                });
            });
        }
    });

    Object.keys(attributes).sort(function (a, b) {
        return attributes[a].order - attributes[b].order;
    }).forEach(function (key) {
        var newAttrvalues = [];
        for(var i=0;i<products.length;i++) {
            var productId = products[i].id;
            var availableAttrValues = attributes[key].values;
            var attrValue='';
            for(var j=0;j<availableAttrValues.length;j++) {
                if(availableAttrValues[j].pid === productId){
                    attrValue = availableAttrValues[j].values;
                }
            }
            if(empty(attrValue)) {
                attrValue = "N/A";
            } else {
                
            }
            var attrValues = {
                pid: productId,
                values: attrValue
            }
            newAttrvalues.push(attrValues); 
            
        }
        attributes[key].values = newAttrvalues;
         var attrs = attributes[key];
         attrs.displayName = key;
         compareAttributesMap.put(key,attrs);
         sorted.push(attrs);
         sortedKeys.push(key);
    });

    const alphaNumericSort = (arr) => {
        const sorter = (a, b) => {
           const isNumber = (v) => (+v).toString() === v;
           const aPart = a.match(/\d+|\D+/g);
           const bPart = b.match(/\d+|\D+/g);
           let i = 0; let len = Math.min(aPart.length, bPart.length);
           while (i < len && aPart[i] === bPart[i]) { i++; };
              if (i === len) {
                 return aPart.length - bPart.length;
           };
           if (isNumber(aPart[i]) && isNumber(bPart[i])) {
              return aPart[i] - bPart[i];
           };
           return aPart[i].localeCompare(bPart[i]); };
           arr.sort(sorter);
     };
    alphaNumericSort(sortedKeys);
    
    sortedKeys.forEach(function (attrKey) {
        var attr = compareAttributesMap.get(attrKey);
        this.push(attr);
    }, this);
}

CompareAttributesModel.prototype = [];

module.exports = CompareAttributesModel;
