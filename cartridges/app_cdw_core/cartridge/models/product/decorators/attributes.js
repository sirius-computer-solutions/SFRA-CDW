'use strict';

var collections = require('*/cartridge/scripts/util/collections');


/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.ProductAttributeModel} attributeModel - attributeModel for a given product.
 * @return {Object|null} an object containing the visible attributes for a product.
 */
function getAttributes(attributeModel) {
    var attributes;
    var ArrayList = require('dw/util/ArrayList');
    var visibleAttributeGroupsOrg = attributeModel.visibleAttributeGroups;
    var visibleAttributeGroups = new ArrayList();
    var HashMap = require('dw/util/HashMap');
    var attributeOverride = new HashMap();
    var attributeIgnore = new HashMap();
    var visibleAttributeGroupsIter = visibleAttributeGroupsOrg.iterator();
    while(visibleAttributeGroupsIter.hasNext())
    {
        var attrGrp = visibleAttributeGroupsIter.next();
        if(attrGrp.ID==='Acme Overrides')
        {
            var attrDefIter = attributeModel.getVisibleAttributeDefinitions(attrGrp).iterator();
            while(attrDefIter.hasNext())
            {
                var attrDef = attrDefIter.next();
                var attrVal = attributeModel.getDisplayValue(attrDef);
                if(attrVal!=null)
                {
                    var attrID = attrDef.ID.replace('-override','');
                    attrID = attrID.replace('acme-tools-','');
                    attributeOverride.put(attrID,attrVal);
                    attributeIgnore.put(attrDef.ID,attrVal);
                }
                
            }
        }
        else
        {
            visibleAttributeGroups.add(attrGrp);
        }
    }
    
    if (visibleAttributeGroups.getLength() > 0) {
        attributes = collections.map(attributeModel.visibleAttributeGroups, function (group) {
            var attributeResult = {};
            var visibleAttributeDefOrig = attributeModel.getVisibleAttributeDefinitions(group);  
            var visibleAttributeDef =  new ArrayList();
            attributeResult.ID = group.ID;
            attributeResult.name = group.displayName;
            var visibleAttributeDefIter = visibleAttributeDefOrig.iterator();
            while(visibleAttributeDefIter.hasNext())
            {
                var visibleAttr = visibleAttributeDefIter.next();
                if(!attributeIgnore.containsKey(visibleAttr.ID))
                {
                    visibleAttributeDef.add(visibleAttr);
                }
            }
            attributeResult.attributes = collections.map(
                visibleAttributeDef,
                function (definition) {
                    var definitionResult = {};
                    definitionResult.label = definition.displayName;
                    definitionResult.ID = definition.ID;
                    if (definition.multiValueType) {
                        definitionResult.value = attributeModel.getDisplayValue(definition).map(
                            function (item) {
                                return item;
                            });
                    } else {
                        if(attributeOverride.containsKey(definition.ID))
                        {
                            definitionResult.value = [attributeOverride.get(definition.ID)];
                        }
                        else{
                            definitionResult.value = [attributeModel.getDisplayValue(definition)];
                        }
                    }
                    return definitionResult;
                }
            );
            return attributeResult;
        });
    } else {
        attributes = null;
    }
    return attributes;
}

module.exports = function (object, attributeModel) {
    Object.defineProperty(object, 'attributes', {
        enumerable: true,
        value: getAttributes(attributeModel)
    });
};