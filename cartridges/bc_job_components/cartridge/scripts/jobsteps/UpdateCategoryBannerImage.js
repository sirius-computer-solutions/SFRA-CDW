var Logger = require('dw/system/Logger').getLogger('cs.job.bannerImageUpdate');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var Site = require('dw/system/Site');
    
var StepUtil = require('~/cartridge/scripts/util/StepUtil');

/**
 * Import wasPrice
 *
 * @param {array} args
 */
 var updateCategoryBannerImage = function updateCategoryBannerImage(args) {
   
    var warnMsg = [];

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    var catalogMgr = require('dw/catalog/CatalogMgr');
    var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();
    updateCategoryBannerImageValue(siteRootCategory);
    

};




/**
 * Calls the 'ValidateActiveDataFile' pipelet to validate an import file.
 *
 * @param {String} filePath The file path of the file to validate. It should be relative to '/IMPEX/src'.
 *
 * @return {Object}
 */
 function updateCategoryBannerImageValue(category) {
    

    var bannerString = "";



    if('custom' in category && 'alternativeUrl' in category.custom) {

        var altURLStr = category.custom.alternativeUrl.source;
        var refinenementStringArr = Site.current.getCustomPreferenceValue('refinementKeyUpdateBannerImage');

        //$url('Search-Show','cgid','Outdoor Power Equipment','prefn1','cdw-tools-brand-name','prefv1','EGO')$  
        //BBelow logic for Preferencs  
        if(!empty(refinenementStringArr)){
            for(var i=0;i<refinenementStringArr.length;i++) {
                var refinedStr = refinenementStringArr[i];
                if(altURLStr.indexOf(refinedStr) != -1) {
                   var updatedStr =  altURLStr.substring(altURLStr.indexOf(refinedStr),altURLStr.toString().length);
                   updatedStr = updatedStr.substring(updatedStr.indexOf("prefv")+5,updatedStr.toString().length);
                   updatedStr = updatedStr.substring(updatedStr.indexOf("','")+3,updatedStr.toString().length);
                   updatedStr = updatedStr.substring(0,updatedStr.indexOf("'"));
                    if(bannerString != "") {
                        bannerString = bannerString+"-"+updatedStr;
                    }else {
                        bannerString = updatedStr;
                    }
                }
            }
        }

        //Below Logic for CGID
        var cgIdStr = "cgid";
        if(altURLStr.indexOf(cgIdStr) != -1) {
            var updatedStr =  altURLStr.substring(altURLStr.indexOf(cgIdStr)+7,altURLStr.toString().length);
            updatedStr = updatedStr.substring(0,updatedStr.indexOf("'"));
             if(bannerString != "") {
                 bannerString = bannerString+"-"+updatedStr;
             }else {
                 bannerString = updatedStr;
             }
         }


        Transaction.wrap(function () {
            if(!empty(bannerString)) {
                bannerString = bannerString.replace(/ /g,"-");
                if('custom' in category && 'slotBannerImage' in category.custom) {
                    Logger.info(category.custom.slotBannerImage.getURL().toString()+","+bannerString.toLowerCase()+".jpg");
                }
                
                category.custom.bannerImageName = bannerString.toLowerCase()+".jpg";
            }
            
         });
    }

    var subCategories = category.getSubCategories() ? category.getSubCategories() : null;
    if (subCategories) {
        var subCategoriesItr = subCategories.iterator();
        while(subCategoriesItr.hasNext())
        {
            updateCategoryBannerImageValue(subCategoriesItr.next());
        }
    }

};

exports.updateCategoryBannerImage = updateCategoryBannerImage;