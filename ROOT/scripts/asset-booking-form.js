/* $Id$ */
var $asset_booking_form = (function()
{   
    "use strict";//NO I18N
    var assetBookingFormObj = {},
        productTypeName = "",
        productTypeImgName="",
        productTypeId=null,
        checkSpecArr = [],
        productTypeArr = [],
        backupArrForSelAsset = {},
        generateIndividualId = 0,
        checkAvailProductTypes = [],
        getUnavailProductTypes = [],
        getCriteriaForAvail = {};
        //object
        assetBookingFormObj.getSpecArr=[];
        
    //execute this function while asset booking page load it get all product types and listed in UI
    assetBookingFormObj.onLoad = function(){
        //clear all variables while loading add page
        assetBookingFormObj.clearAllVariables();
        //check wheather the portal is technician or user 
        assetBookingFormObj.checkUserIsAdmin = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
        var getProTypeCallBackFun = function(response_pt) {
            var produtTypeData = response_pt.product_type;
                if(produtTypeData.length>0){
                    var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings';//NO I18N
                    assetBookingFormObj.ajaxFun(settingUrl,null,'asset_booking_settings', "",function(response_abs){
                        assetBookingFormObj.getAssetBookSettings = response_abs.asset_booking_settings[0];
                        if(assetBookingFormObj.getAssetBookSettings && Object.keys(assetBookingFormObj.getAssetBookSettings).length>0 && assetBookingFormObj.getAssetBookSettings.is_booking_enabled){
                            assetBookingFormObj.ajaxFun('asset_bookings/_get_asset_summary',null,'asset_assets', "", function(response){
                                assetBookingFormObj.getAllAssetsCount = response.asset_assets;
                                var tempSpliceArray = [];
                                assetBookingFormObj.removeWorkstationOrServer = [];
                                /**For removing unavailable assets product types from array  */
                                produtTypeData.forEach(function(fldVal,index){
                                    var notAvailProductType = assetBookingFormObj.getAllAssetsCount.find(e => e.module.internal_name === fldVal.internal_name);
                                    if(notAvailProductType == undefined){
                                        tempSpliceArray.push(index);
                                        assetBookingFormObj.removeWorkstationOrServer.push(fldVal.internal_name);
                                    }
                                });
                                $asset_booking_form.spliceArrFunction(tempSpliceArray,produtTypeData);
                                /**End */
                            renderhbs("#asset-bookings-section","booking-add-page-left-section",{//NO I18N
                                productType : produtTypeData,
                                checkUserIsAdmin : assetBookingFormObj.checkUserIsAdmin
                            },null,"asset-booking");//NO I18N
                                showDescriptionRemainingCount('#book-comment');//NO I18N
                                assetBookingFormObj.setStartTimeByDefaultFun();
                            assetBookingFormObj.searchAssetsForBooking();
                            assetBookingFormObj.purposeSelect2Function();
                        });
                           
                            initTooltip('#asset-bookings-section');//NO I18N
                           
                            
                        }else{
                            renderhbs("#asset-bookings-section","booking-add-page-empty-section",{//NO I18N
                                checkUserIsAdmin : assetBookingFormObj.checkUserIsAdmin,
                                isBookingDisabled: true
                            },null,"asset-booking");//NO I18N
                            initTooltip('#asset-bookings-section');//NO I18N
                        }
                    });
                }else{
                    renderhbs("#asset-bookings-section","booking-add-page-empty-section",{//NO I18N
                        checkUserIsAdmin : assetBookingFormObj.checkUserIsAdmin
                    },null,"asset-booking");//NO I18N
                    initTooltip('#asset-bookings-section');//NO I18N
                }
        }
            var inputData = {
                "list_info":{//NO I18N
                    "start_index":1,//NO I18N
                    "row_count":100//NO I18N
                }
            },
            elePresent = jQuery('#sdp-tabs #assets');
            //get all loanable product types in add page for booking
            assetBookingFormObj.ajaxFun('booking_items/product_type',null,'product_type',inputData,getProTypeCallBackFun);//NO I18N
            if(elePresent.length>0){
                elePresent.parent().attr('class','active'); 
            }else{
                jQuery('#sdp-tabs #home').parent().attr('class','active');
            }
            //check if asset product types are available or not
            assetBookingFormObj.preventContClickIfNotExe = true;
            initTooltip('#asset-bookings-section');//NO I18N
            jQuery('#asset-bookings-section').addClass("fh");
            jQuery('#content-header,#emptyPageDiv,#content-header-booking-table,#booking_page_container').css("min-height",jQuery(window).height() - (getConsolidatedHeight() + 50))//NO I18N
            setTimeout(function(){
                jQuery('#booking_page_container').css("min-height",jQuery(window).height() - (getConsolidatedHeight() + 50))//NO I18N
            },1000)
    };
    assetBookingFormObj.clearAllVariables=function(){
        backupArrForSelAsset = {};
        generateIndividualId = 0;
        getCriteriaForAvail = {};
        assetBookingFormObj.getSpecArr=[];
        checkSpecArr = [];
        productTypeArr = [];
        assetBookingFormObj.currentFocusAvailEle = ""; 
        checkAvailProductTypes = [];
        getUnavailProductTypes = [];
    };
    assetBookingFormObj.setStartTimeByDefaultFun = function(){
        //get current time and add (1 day + 5 min) as default time while opening popup 
        var currentTime = assetBookingFormObj.getAssetBookSettings && new Date().getTime() + 24 * 60 * 60 * (assetBookingFormObj.getAssetBookSettings.advance_booking_minimum_days * 1000) + (60000*5);          
        var currentDateTime= new Date();
        currentDateTime.setMilliseconds(0);
        currentDateTime.setSeconds(0);
        jQuery("#calenStartTime").val(currentTime);
        var currentTimeFormat = currentTime + getTimezoneDifference(currentDateTime.getTime());
        var dateObj = new Date(currentTimeFormat);
        var get_start_date = getFormattedDateTime(dateObj,true)
        jQuery("#calenStartTime_Display").val(get_start_date); 
    };
    assetBookingFormObj.enableBookingButton = function(){
        jQuery('#book-btn').prop('disabled',false);//No I18N
        jQuery('#book-btn').removeAttr('title');//No I18N
    };
    assetBookingFormObj.disableBookingButton = function(){
        jQuery('#book-btn').prop('disabled',true);//No I18N
        jQuery('#book-btn').attr('title',getMessageForKey('booking.remove.unavilable.msg'));
    };
    assetBookingFormObj.specificationPopupFunction = function(){
        //delay to prevent partial rendering while clicking multiple time continuously
        jQuery('#specificationPopup').hide();
        jQuery('.freezeLayer').hide();
        checkSpecArr = [];
       
    };
    //it executes while clicking product types - it appended in right side (booking details) section
    assetBookingFormObj.openBookingDetailsPopup = function(e,selEle){
        //added condition for avoid clicking continuously without executing previous functionality 
        if(assetBookingFormObj.preventContClickIfNotExe){
            
            var parentElement = jQuery('#booking_page_container'),
                fromDate = parentElement.find('#calenStartTime').val(),
                toDate = parentElement.find('#calenEndTime').val();
                
            var selProTypeEle = selEle || parentElement.find(e.target).parents('li');//NO I18N
            if(selProTypeEle.find(".ab-img-blk").length==0 && selProTypeEle.prevObject.find(".ab-img-blk").hasClass("disableDiv")){
                    return;
            }
            assetBookingFormObj.preventContClickIfNotExe = false;
            //These are global variables declared in top of function
            productTypeName = selProTypeEle.attr('data-internal');
            productTypeId = selProTypeEle.attr('id');
            productTypeImgName = selProTypeEle.find('#img1').attr('name');

            parentElement.find('#productList li').removeClass('act');
            selProTypeEle.addClass('act');
            generateIndividualId++;
            //while clicking product types new asset, submit section and related product types are displayed in booking details section
            if(!jQuery(selProTypeEle).find(".ab-img-blk").hasClass("disableDiv")){
                parentElement.find('#newAsset').show().end()
                            .find('#newAsset').parents('.ab-nw-ast').show();//NO I18N
                parentElement.find('#form-footer').show();
                parentElement.find('#selectedProductTypes .ab-li').removeClass('act');
                parentElement.find('#s2id_assetDropdown').remove().end();
                parentElement.find('#assetDropdown').remove().end();
            }
            
            if(fromDate && toDate){
                assetBookingFormObj.commonProductTypeAccessFun(null,generateIndividualId); 
            }else{
                assetBookingFormObj.commonProductTypeAccessFun(true,generateIndividualId);
            }
            initTooltip('#asset-bookings-section');//NO I18N
            
            if(jQuery('#sdp-chat-bar').length > 0){
                if(!jQuery('#sdp-chat-bar .zia-chat').hasClass('rounded5')){
                    jQuery('.ab-rgt-frm #form-footer').css('bottom',jQuery('#sdp-chat-bar').height());//NO I18N
                    jQuery('.ab-li.ab-nw-ast').css('bottom',(jQuery('#sdp-chat-bar').height() + 49));//NO I18N
                } else{
                    jQuery('.ab-rgt-frm #form-footer').css('bottom',0);//NO I18N
                    jQuery('.ab-li.ab-nw-ast').css('bottom',49);//NO I18N
                }
            }			
        }
    };
    //calander initiate function for both add booking page and reschedule page
    assetBookingFormObj.calenderInitFun=function(e,eleToInit,eleToCompare,condition){
        $asset_booking_reschedule.calenderInitFun(e,eleToInit,eleToCompare,condition)
    };
    //get current date and time to validate minimum and maximum days in calender
    assetBookingFormObj.getValueForDateAndTime = function(dateVal){
        return $asset_booking_reschedule.getValueForDateAndTime(dateVal)
    };
    //get different days between current date and selected date
    assetBookingFormObj.getDiffFromStartAndEnd=function(arg){
        return $asset_booking_reschedule.getDiffFromStartAndEnd(arg)
    };
    //calender clicking function
    assetBookingFormObj.calenderClickFunction=function(e,eleToInit,eleToCompare,condition){
        var parentElement = jQuery('#booking_page_container');
            assetBookingFormObj.calenderInitFun(e,eleToInit,eleToCompare,condition);
            
    };
    assetBookingFormObj.calenderValidateFun = async function(e,eleToInit,eleToCompare,condition){
        var parentElement = jQuery('#booking_page_container');
        var fromDate = parentElement.find('#calenStartTime').val(),
            toDate = parentElement.find('#calenEndTime').val(),
            criteriaAssetKeys = Object.keys(getCriteriaForAvail);
            if(fromDate == toDate && fromDate!=""){//NO I18N
                showalert('failure',translate('booking.not.available.required.count.msg'),"isAutoHide=false");//NO I18N
                return;
            }
            if(fromDate && toDate){
                checkAvailProductTypes = criteriaAssetKeys.length>0 ? assetBookingFormObj.checkEmptyIsAvailable() : getUnavailProductTypes;
                    parentElement.find('#selectedProductTypes [data-name="spec"]').show();
                    if(criteriaAssetKeys.length>0){
                        assetBookingFormObj.getAllSelProductsAvailability(true);
                    }
                    jQuery("#productTypeSearch").focus();
                    var currSelProType;
                    if(eleToInit=="calenEndTime"){
                        if(criteriaAssetKeys.length==0 && generateIndividualId>1) {
                            var getAvailability= assetBookingFormObj.checkAvailability(generateIndividualId,null,function(result){
                                assetBookingFormObj.getProductTypeAvailability(generateIndividualId,true,getAvailability);
                                currSelProType = parentElement.find('[data-unique-id='+generateIndividualId+']').find('#asset');
                                assetBookingFormObj.selectedAssetClickFun(currSelProType,getAvailability);
                            });
                            
                        }
                    }
                    var conProductType = [],
                        convertedInput = {};
                        
                    for(var i=0;i<assetBookingFormObj.getAllAssetsCount.length;i++){
                        var obj = {};
                        obj.product_type={"name":assetBookingFormObj.getAllAssetsCount[i].module.display_name};
                        conProductType.push(obj);
                    }
                    convertedInput.booking_items = conProductType;
                    assetBookingFormObj.checkAvailability(null,convertedInput,function(getAvailability){
                        assetBookingFormObj.getAssetAvailInParDate = getAvailability;
                        var bookingAllowed = true;
                        if(getAvailability && getAvailability.booking_items){
                            getUnavailProductTypes=[];
                            for(var i=0;i<getAvailability.booking_items.length;i++){
                                assetBookingFormObj.getAllAssetsCount.forEach(function(fields,index){
                                    if(getAvailability.booking_items[i].product_type && fields.module.display_name==getAvailability.booking_items[i].product_type.name){
                                        var productId = assetBookingFormObj.getAllAssetsCount[i].module.id;
                                        if(getAvailability.booking_items[i].available_count==0){
                                            bookingAllowed = false;
                                            parentElement.find('#'+productId+" img").addClass('disableDiv');
                                            parentElement.find('#'+productId+" #img1").addClass('disableDiv');
                                            parentElement.find('#'+productId+" .ab-img-blk").addClass('disableDiv');
                                            parentElement.find('#'+productId+' .addtag').text(translate('booking.unavailable.selected.dates'));
                                            getUnavailProductTypes.push(getAvailability.booking_items[i].product_type.name);
                                            var isCheckEmptyProType = assetBookingFormObj.checkEmptyIsAvailable(true);
                                            if(isCheckEmptyProType.length>0){
                                                jQuery("#specificationPopup").hide();
                                                assetBookingFormObj.disableBookingButton();
                                            }else{
                                                assetBookingFormObj.enableBookingButton();
                                                generateIndividualId>0 &&  assetBookingFormObj.getCurrentAssetSpecification(generateIndividualId)
                                            }
                                        }else{
                                            assetBookingFormObj.disableListIfEmpty(productId);
                                        }
                                    }
                                });
                            }
                        }
                        if(bookingAllowed){
                            assetBookingFormObj.enableBookingButton();
                        }
                    });
            }
    };
    assetBookingFormObj.checkEmptyIsAvailable = function(isLoad){
        var parentElement = jQuery('#booking_page_container');
        var criteriaAssetKeys = Object.keys(getCriteriaForAvail);
        checkAvailProductTypes = [];
        if(criteriaAssetKeys.length>0){
            for(var j=0;j<criteriaAssetKeys.length;j++){
                if(getCriteriaForAvail[criteriaAssetKeys[j]].product_type){
                    if(getUnavailProductTypes.indexOf(getCriteriaForAvail[criteriaAssetKeys[j]].product_type.name)!=-1){
                        checkAvailProductTypes.push(getCriteriaForAvail[criteriaAssetKeys[j]].product_type.name);
                    }else if(!isLoad && getCriteriaForAvail[criteriaAssetKeys[j]].required_count==0 || parentElement.find('#quantity_'+generateIndividualId).attr('max')==0){
                        checkAvailProductTypes.push(getCriteriaForAvail[criteriaAssetKeys[j]].product_type.name);
                    }
                }
            }
        }
        return checkAvailProductTypes;
    };
    //render purpose dropdown for add booking page
    assetBookingFormObj.purposeSelect2Function = function(){
        var parentElement = jQuery('#booking_page_container');
            parentElement.find('#purDropdownAppend').html('<input class="form-control" id="purposeDropdown" type="text"/>');
            parentElement.find("#purposeDropdown").sdp_select2({
               value: "",//NO I18N
               cache:{},
               multiple:false,
               allowClear : true,
               placeholder: translate("form.select.placeholder",[translate('booking.purpose')]), // No I18N
               url:[{
                    url:"/api/v3/asset_bookings/purpose",//NO I18N
                    field:'purpose'//NO I18N
               }]
            });
    };
    //render new asset added dropdown for add booking page
    assetBookingFormObj.newAssetSelect2Fun=function(){
        var parentElement = jQuery('#booking_page_container');
            parentElement.find("#assetDropdown").sdp_select2({
               value: "",//NO I18N
               cache:{},
               multiple:false,
               placeholder:  translate("sdp.purchase.filter.producttype"), // No I18N
               url:[{
                    url:"/api/v3/booking_items/product_type",//NO I18N
                    field:'product_type',//NO I18N
                    list_info:{start_index:1,row_count:100},
               }],
               processResults: function(search_data, data, field) {
                    if($asset_booking_form.removeWorkstationOrServer && $asset_booking_form.removeWorkstationOrServer.length>0 && $asset_booking_form.removeWorkstationOrServer.indexOf(data.internal_name)!=-1) {
                        search_data = [];
                    }
                    if(data){
                       if(getUnavailProductTypes.indexOf(data.display_name)!="-1"){
                            search_data = [];
                        }else{
                            search_data.push(data)
                        }
                    }

                },
               formatResult: function (item) { return e_html(item.display_name); },
               formatSelection: function (item) { return e_html(item.display_name); }
            });
    };
    //render function while select and unselect radio button in specification popup
    assetBookingFormObj.checkUnCheckAllBoxBySelection = function(uniqueId){
        var parentElement = jQuery('#booking_page_container');
            checkSpecArr = [];
            //get specification available data based on selected radio button id
            parentElement.off('change').on('change', "[data-field-type='select_spec']",function() {
                var ele = this,
                    $box = parentElement.find(ele);
                jQuery('#specloadingIcon').show();
            
                    var fieldName = $box.attr('name');
                    if($box.is(":checked")) {
                       var group = "input:radio[data-rad-id='" + fieldName + "_" + uniqueId +"']",//NO I18N
                            alreadyChkBox = "",
                            checkAvail="",
                            conCheck = false,
                            spliceArr = [],
                            obj = {
                                spec_field  : fieldName,
                                field_value : $box.attr('data-actual-value'),
                                spec_name   : $box.attr('data-spec-name'),
                                field_name  : $box.attr('value'),
                                group_name  : $box.attr('data-group'),
                                label_val   :  $box.attr('value'),
                                min_value   :  $box.attr('data-min-value'),
                                max_value   :  $box.attr('data-max-value'),
                                data_rad_id : $box.attr('data-rad-id')
                            };
                            
                            parentElement.find(group).prop("checked", false);   //NO I18N
                            if(checkSpecArr.length>0){
                                checkSpecArr.forEach(function(fields,index){
                                    alreadyChkBox = checkSpecArr[index];
                                    if(fields.spec_field===fieldName){
                                        checkSpecArr[index] = obj;
                                        conCheck=true;
                                    }
                                });
                            }
                            if(!conCheck){
                                checkSpecArr.push(obj);
                            }
                            assetBookingFormObj.checkAvailability(uniqueId,null,function(checkAvail){
                                
                                var availableOrder = jQuery('[data-sep-id='+uniqueId+']').attr("id").split("_")[1],
                                availableCount="";
                                if(checkAvail){
                                    jQuery.each(checkAvail.booking_items,function(index,val){
                                        if(val.order==availableOrder){
                                            availableCount = val.available_count;
                                        }
                                    });
                                }
                                if(availableCount>0){
                                    $box.prop("checked", true);//NO I18N
                                    commonForCheckAndUnchk(checkAvail);
                                }else{
                                    showalert('failure',translate('boooking.asset.count.not.available'),"isAutoHide=false");//NO I18N
                                    checkSpecArr = [];
                                    $asset_booking_form.spliceArrFunction(spliceArr,checkSpecArr);
                                    jQuery('#specloadingIcon').hide(); 
                                    $box.prop('checked',false);//NO I18N
                                    
                                    backupArrForSelAsset[uniqueId].pop();
                                    return true;
                                }
                                jQuery.each(getCriteriaForAvail,function(index,fieldobj){
                                    var getCurrAvailACount = jQuery("#quantity_"+index).val();
                                    if(getCurrAvailACount>0 && fieldobj.product_type && (fieldobj.product_type.name == productTypeName)){
                                        var currSpec = backupArrForSelAsset[index];
                                        checkSpecArr = [];
                                        var currentPostition = Object.keys(getCriteriaForAvail).indexOf(index);
                                        assetBookingFormObj.getProductTypeAvailability(index,null,checkAvail,null,currSpec,null,currentPostition);
                                    }
                                });
                                
                            });
                           
                    } else {
                        var spliceArr = [];
                            checkSpecArr.forEach(function(fields,index){
                                if(fields.spec_field===fieldName){
                                    spliceArr.push(index);
                                }
                            });
                            $box.prop("checked", false);//NO I18N
                            $asset_booking_form.spliceArrFunction(spliceArr,checkSpecArr);
                            assetBookingFormObj.checkAvailability(uniqueId,null,function(checkAvail){
                                commonForCheckAndUnchk(checkAvail);
                            });
                    }
                    
                
                function commonForCheckAndUnchk(checkAvail){
                    backupArrForSelAsset[uniqueId] = checkSpecArr;
                    var selEleID = uniqueId || generateIndividualId; 
                    var currSelProType = parentElement.find('[data-unique-id='+selEleID+']').find('#asset');
                    assetBookingFormObj.selectedAssetClickFun(currSelProType,checkAvail);
                    // assetBookingFormObj.getProductTypeAvailability(uniqueId,null,checkAvail,null,null,true);
                    jQuery('#specloadingIcon').hide();
                }
            });
    };
    //check availablity of asset while selecting date
    assetBookingFormObj.checkAvailability =function(uniqueId,getProductData,callback,isClear){
        var parentElement = jQuery('#booking_page_container'),
            startDate = parentElement.find('#calenStartTime').val(),
            endDate = parentElement.find('#calenEndTime').val(),
            convertedInput  = {},
            conProductType = [];

            if(getProductData && getProductData.booking_items){
                convertedInput = getProductData;
            }else{
                var inputData = {
                    "product_type": {"name": getProductData&&getProductData.name||productTypeName}//NO I18N
                };
                if(!getProductData){
                    if(checkSpecArr && checkSpecArr.length>0){
                        for(var i=0;i<checkSpecArr.length;i++){
                        var bookingFieldName = checkSpecArr[i].spec_field;
                        if(checkSpecArr[i].group_name){
                            bookingFieldName = checkSpecArr[i].group_name+"."+bookingFieldName;
                        }
                            var fieldName = checkSpecArr[i].spec_field,
                                condition = "=",//NO I18N
                                criValue = [checkSpecArr[i].field_value];
                            
                            if(i==0){
                                if((parseInt(checkSpecArr[i].min_value) > 0 && parseInt(checkSpecArr[i].max_value) > parseInt(checkSpecArr[i].min_value)) && (fieldName == "physical_memory")){
                                    const getUnitVal = "B";//NO I18N
                                    const getMemVal = [{"value":checkSpecArr[i].max_value,"unit":getUnitVal}];//NO I18N 
                                    inputData.criteria = {
                                        "condition":"lte",//NO I18N
                                        "field":bookingFieldName,//NO I18N
                                        "logical_operator": "AND",//NO I18N
                                        "values": getMemVal,//NO I18N
                                        "children":[{"condition":"gte","field":"physical_memory","logical_operator":"and","values":[{"value":checkSpecArr[i].min_value,"unit":getUnitVal}]}]//NO I18N
                                    }
                                }else{
                                    inputData.criteria = {
                                        "condition":condition,//NO I18N
                                        "field":bookingFieldName,//NO I18N
                                        "logical_operator": "AND",//NO I18N
                                        "values": criValue,//NO I18N
                                    }
                                    inputData.criteria.children=[];
                                }
                            }else{
                                if((parseInt(checkSpecArr[i].min_value) > 0 && parseInt(checkSpecArr[i].max_value) > parseInt(checkSpecArr[i].min_value)) && (fieldName == "physical_memory")){
                                    const getUnitVal = "B";//NO I18N
                                    const getMemVal = [{"value":checkSpecArr[i].max_value,"unit":getUnitVal}];//NO I18N 
                                    inputData.criteria.children.push({
                                        "condition":"lte",//NO I18N
                                        "field":bookingFieldName,//NO I18N
                                        "logical_operator": "AND",//NO I18N
                                        "values": getMemVal,//NO I18N
                                    });
                                    inputData.criteria.children.push({
                                        "condition":"gte",//NO I18N
                                        "field":bookingFieldName,//NO I18N
                                        "logical_operator": "AND",//NO I18N
                                        "values": [{"value":checkSpecArr[i].min_value,"unit":getUnitVal}],//NO I18N
                                    });
                                }else{
                                    inputData.criteria.children.push({
                                        "condition":condition,//NO I18N
                                        "field":bookingFieldName,//NO I18N
                                        "logical_operator": "AND",//NO I18N
                                        "values": criValue,//NO I18N
                                    });
                                }
                            }
                        }
                        inputData.criteria.children.length==0 && delete inputData.criteria.children;
                    }
                    getCriteriaForAvail[uniqueId] = inputData;
                }

                if(Object.keys(getCriteriaForAvail).length>0){
                    var criteriaArr = Object.keys(getCriteriaForAvail)
                    jQuery.each(getCriteriaForAvail,function(index,val){
                        var obj = {},
                            currIndex = criteriaArr.indexOf(index);
                        getCriteriaForAvail[index].order=Number(currIndex)+Number(1);
                        obj.order = getCriteriaForAvail[index].order;
                        obj.required_count = parentElement.find("#quantity_"+index).val();
                        obj.product_type = val.product_type;
                        obj.criteria = val.criteria;
                        conProductType.push(obj);
                    });
                }else{
                    var obj = {};
                    obj.product_type = inputData.product_type;
                    conProductType.push(obj);
                }
                convertedInput.booking_items = conProductType;
            }

            convertedInput.start_time={
                "value": startDate//NO I18N
            }
            convertedInput.end_time={
                "value": endDate//NO I18N
            }
            var displayOrder = 0;
            var removeEmptyAssets = [];
            var isValueDecresed = false;
            jQuery.each(convertedInput.booking_items,function(index,fieldObj){
                fieldObj.display_order = displayOrder+1;
                displayOrder=displayOrder+1;
                delete fieldObj.total_count;
                if(fieldObj.order==assetBookingFormObj.currentFocusAvailEle){
                    var getRequiredCount = assetBookingFormObj.getAvailDataForBackup.booking_items[index] && assetBookingFormObj.getAvailDataForBackup.booking_items[index].required_count;
                    if(assetBookingFormObj.getAvailDataForBackup && assetBookingFormObj.getAvailDataForBackup.booking_items && getRequiredCount && getRequiredCount > fieldObj.required_count){
                        isValueDecresed = true;
                    }
                }
                
                if(fieldObj.required_count==0){
                    if(isValueDecresed){
                        fieldObj.required_count=1
                    }else if(!isClear){
                        removeEmptyAssets.push(index);
                    } 
                }
            });
            
            assetBookingFormObj.spliceArrFunction(removeEmptyAssets,convertedInput.booking_items);
            var isCheckEmptyProType = $asset_booking_form.checkEmptyIsAvailable();
            if(isCheckEmptyProType.length>0){
                assetBookingFormObj.disableBookingButton();
            }else{
                assetBookingFormObj.enableBookingButton();
            }
            assetBookingFormObj.ajaxFun('booked_assets/_get_asset_availability',null,'get_asset_availability',convertedInput,function(response){//NO I18N
                var getAvailability = response.get_asset_availability;
                assetBookingFormObj.getAvailDataForBackup = getAvailability;
                callback && callback(getAvailability)
            });
    };
    // get product availability for selected asset
    assetBookingFormObj.getProductTypeAvailability = function(uniqueId,isNewAsset,getAvailability,getAllAssInDt,currSpec,isSpec,currentPostition){
        var currSelProTypeSec = "[data-unique-id="+uniqueId+"] .updateSpecDiv",   //NO I18N
            parentElement = jQuery('#booking_page_container'),
            fromDate = parentElement.find('#calenStartTime').val(),
            toDate = parentElement.find('#calenEndTime').val();
            
            if(getAllAssInDt || (isNewAsset && getAvailability.booking_items && getAvailability.booking_items.length>0)){
                    renderhbs("#selectedProductTypes","booking-add-page-right-selected-asset-section",{//NO I18N
                        productNameforId  : productTypeName.replace(/ /g, ""),
                        productType        : productTypeName,
                        productTypeId      : productTypeId,
                        productTypeImgName : productTypeImgName,
                        generateUniqueId   : uniqueId
                    },true,"asset-booking");//NO I18N
                    
                    var getEleIndex = (currentPostition!==-1) ? currentPostition : (getAvailability && getAvailability.booking_items && getAvailability.booking_items.length-1);
                    renderhbs(currSelProTypeSec,"booking-add-page-right-selected-asset-section",{//NO I18N
                        productType      : productTypeName,
                        generateUniqueId : uniqueId,
                        getAllAssInDt    : getAllAssInDt ? getAllAssInDt : getAvailability.booking_items && getAvailability.booking_items[getEleIndex],
                        currOrder        : getAllAssInDt ? getAllAssInDt.order : getCriteriaForAvail[uniqueId].order,
                        isClearSpec      : true,
                        isDateSel        : (fromDate && toDate) ? true : false
                    },null,"asset-booking");//NO I18N
                    if(getAvailability && getAvailability.booking_items){
                        jQuery.each(getAvailability.booking_items, function(i,val){
                            if(jQuery("#avail_"+val.order).length>0){
                                var requiredCount = jQuery("#avail_"+val.order+" [name='change_avail_count']").val(),
                                getUniqueID = jQuery("#avail_"+val.order).attr("data-sep-id");
                                renderhbs("#avail_"+val.order,"booking-add-page-right-selected-asset-section",{//NO I18N
                                    getAvailableData : val.available_count,
                                    requiredCount    : requiredCount||1,
                                    generateUniqueId : getUniqueID,
                                    isTakeAvailCount : true
                                },null,"asset-booking");//NO I18N
                            }
                        });
                    }

                    if(getAllAssInDt){
                        if(jQuery("#avail_"+getAllAssInDt.order).length>0){
                            renderhbs("#avail_"+getAllAssInDt.order,"booking-add-page-right-selected-asset-section",{//NO I18N
                                getAllAssInDt : getAllAssInDt,
                                requiredCount : 1,
                                generateUniqueId : uniqueId,
                                isTakeAvailCount : true
                            },null,"asset-booking");//NO I18N
                        }
                    }

            }else{
                
                if(!getAvailability || getAvailability && getAvailability.booking_items.length>0){
                    var getEleIndex = (currentPostition!==-1) ? currentPostition : (getAvailability && getAvailability.booking_items && getAvailability.booking_items.length-1);
                    renderhbs(currSelProTypeSec,"booking-add-page-right-selected-asset-section",{//NO I18N
                        getAvailableData : getAvailability.booking_items && getAvailability.booking_items[getEleIndex],
                        productType      : productTypeName,
                        specSelDetails   : currSpec||checkSpecArr,
                        generateUniqueId : uniqueId,
                        currOrder        : getCriteriaForAvail[uniqueId].order,
                        isDateSel        : (fromDate && toDate) ? true : false,
                        isClearSpec      : true
                    },null,"asset-booking");//NO I18N
                    jQuery.each(getAvailability.booking_items, function(i,val){
                        if(val.order==getCriteriaForAvail[uniqueId].order){
                            var getUniqueID = jQuery("#avail_"+val.order).attr("data-sep-id");
                            var isavailCount = val.available_count<val.required_count;
                            if(isavailCount){
                                showalert('failure',translate('booking.not.available.required.count.msg'),"isAutoHide=false");//NO I18N
                            }
                            var curCount = val.available_count<val.required_count?val.available_count:val.required_count;
                            if(jQuery("#avail_"+val.order).length>0){
                                renderhbs("#avail_"+val.order,"booking-add-page-right-selected-asset-section",{//NO I18N
                                    getAvailableData : val.available_count,
                                    requiredCount    : curCount||1,
                                    generateUniqueId : getUniqueID,
                                    isTakeAvailCount : true
                                },null,'asset-booking');//NO I18N
                            }
                                if(isSpec && isavailCount && val.available_count!=0){
                                    showalert('failure',translate('booking.not.available.required.count.msg'),"isAutoHide=false");//NO I18N
                                }
                        }
                    });
                }
            }
            //onchanging function for availabilty input field in booking popup
            jQuery("#selectedProductTypes").off('change').on('change','input[name="change_avail_count"]',function(event,isValue){
                event.preventDefault();
                parentElement = jQuery("#booking_page_container");
                var fromDate = parentElement.find('#calenStartTime').val();
                var toDate = parentElement.find('#calenEndTime').val();
                if(fromDate && toDate){
                assetBookingFormObj.currentFocusAvailEle = jQuery(this).attr("id") && jQuery(this).attr("id").split("_")[1];
                var value = Number(this.value);
                    productTypeId = parentElement.find(this).parents("[name=assetSection]").attr("id").split("_")[1];//NO I18N
                    productTypeName = parentElement.find(this).parents("[name=assetSection]").attr("id").split("_")[0];//NO I18N
                    if(value<=0 && !isValue){
                        showalert('failure',translate('ae.barcode.formValidation.validCount'),"isAutoHide=false");//NO I18N
                        this.value=1;
                    }
                    else{
                        var selProductType = jQuery(this).parents("[name=assetSection]").attr("id").split("_")[0],//NO I18N
                            conProductType = [],
                            convertedInput = {},
                            sameProAvailCount = 0;
                            var ord=0;
                            jQuery.each(getCriteriaForAvail,function(index,fieldobj){
                                fieldobj.order=++ord;
                                if(fieldobj.product_type && (fieldobj.product_type.name == selProductType)){
                                    sameProAvailCount++;
                                    delete fieldobj.total_count;
                                    fieldobj.required_count = parentElement.find("#quantity_"+index).val();
                                    conProductType.push(fieldobj);
                                }
                            });
                            convertedInput.booking_items = conProductType;

                            if(sameProAvailCount>=1 && fromDate && toDate){
                                assetBookingFormObj.checkAvailability(null,convertedInput,function(getAvailability){
                                    
                                    jQuery.each(getCriteriaForAvail,function(index,fieldobj){
                                        if(fieldobj.product_type && (fieldobj.product_type.name == selProductType)){
                                            var currSpec = backupArrForSelAsset[index];
                                            checkSpecArr = [];
                                            var currentPostition = Object.keys(getCriteriaForAvail).indexOf(index);
                                            assetBookingFormObj.getProductTypeAvailability(index,null,getAvailability,null,currSpec,null,currentPostition);
                                        }
                                    });
                                });
                                
                            }
                    }
                }
            });
            jQuery("#selectedProductTypes").off('keypress').on('keypress','input[name="change_avail_count"]',function(event){
                return $asset_booking_form.acceptOnlyNumbers(event);
            });
            initTooltip('#asset-bookings-section');//NO I18N
            assetBookingFormObj.preventContClickIfNotExe = true;
    };
    assetBookingFormObj.acceptOnlyNumbers=function(evt,isBooking) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && ((charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105))){
            return false;
        }
        if(isBooking==="bookingsettings"){
            var getCurrVal = jQuery(evt.target).val();
            var parentElement = jQuery('#asset-settings-section'),
                advMaxVal = parentElement.find('#advmax').val(),
                advMinVal = parentElement.find('#advmin').val();
            if(advMaxVal>=advMinVal){
                jQuery("#advmax,#advmin").parent().next().remove();
            }
        }
        return true;
    };
    //render function while selecting asset in UI
    assetBookingFormObj.selectedAssetClickFun=function(currSection,availability){
        var parentElement = jQuery('#booking_page_container'),
            currSecEle = parentElement.find(currSection).parents('[name="assetSection"]'),// No I18N
            fromDate = parentElement.find('#calenStartTime').val(),
            toDate = parentElement.find('#calenEndTime').val(),
            getAlreadySelEle = jQuery('[name="assetSection"].act').attr("data-unique-id"),
            chkIsSpecPopHide = jQuery("#specificationPopup").is(":hidden"),//NO I18N
            uniqueId = currSecEle && currSecEle.attr('data-unique-id');
            if(chkIsSpecPopHide || getAlreadySelEle!=uniqueId || (getAlreadySelEle==uniqueId && availability && Object.keys(availability).length>0)){
                parentElement.find('#specificationPopup .ab-lst-blk, #specificationPopup .controls').empty();
                productTypeId = currSecEle && currSecEle.attr('data-disable-id');
                productTypeName = currSecEle && currSecEle.attr('data-product-type');
                checkSpecArr = backupArrForSelAsset[uniqueId];
                (fromDate && toDate) && parentElement.find('.freezeLayer').show();
                var getAvailableCount = jQuery('[data-sep-id='+uniqueId+'] input').attr("max");
                if(fromDate && toDate && (getAvailableCount>0)){
                    jQuery('#specloadingIcon,#specificationPopup').show();
                }else{
                    jQuery('#specloadingIcon,#specificationPopup').hide();
                }
                //assetBookingFormObj.enableBookingButton();
                parentElement.find('#selectedProductTypes .ab-li').removeClass('act');
                parentElement.find('.freezeLayer,#specificationPopup').css("height",jQuery("#booking_page_container").css("height"));// No I18N
                currSecEle.addClass('act');
                (fromDate && toDate) && assetBookingFormObj.getCurrentAssetSpecification(uniqueId,availability);
                initTooltip('#asset-bookings-section');//NO I18N
                jQuery('#specloadingIcon').hide();
               
            }
    };
    //get current asset specification
    assetBookingFormObj.getCurrentAssetSpecification = function(uniqueId,availability){
        
        var parentElement = jQuery('#booking_page_container'),
        fromDate = parentElement.find('#calenStartTime').val(),
        toDate = parentElement.find('#calenEndTime').val();
        parentElement.find('.freezeLayer,#specificationPopup').css("height",jQuery("#booking_page_container").css("height"));// No I18N
        parentElement.find('.freezeLayer').show();
        
        var inputData = {
                "product_type": {//NO I18N
                    "id": productTypeId//NO I18N
                  },
                  "start_time": {//NO I18N
                    "value": fromDate//NO I18N
                  },
                  "end_time": {//NO I18N
                    "value": toDate//NO I18N
                  },
                "list_info": {//NO I18N
                    "row_count":100,//NO I18N
                    "get_total_count":true//NO I18N
                 }
            };
            if(checkSpecArr && checkSpecArr.length>0){
                for(var i=0;i<checkSpecArr.length;i++){
                    var bookingFieldName = checkSpecArr[i].spec_field;
                    if(checkSpecArr[i].group_name){
                        bookingFieldName = checkSpecArr[i].group_name+"."+bookingFieldName;
                    }
                    var fieldName = checkSpecArr[i].spec_field,
                        condition = "=",//NO I18N
                        criValue = [checkSpecArr[i].field_value];
                    if(i==0){
                        if((parseInt(checkSpecArr[i].min_value) > 0 && parseInt(checkSpecArr[i].max_value) > parseInt(checkSpecArr[i].min_value)) && (fieldName == "physical_memory")){
                            const getUnitVal = "B";//NO I18N
                            const getMemVal = [{"value":checkSpecArr[i].max_value,"unit":getUnitVal}];//NO I18N 
                            inputData.criteria = {
                                "condition":"lte",//NO I18N
                                "field":bookingFieldName,//NO I18N
                                "logical_operator": "AND",//NO I18N
                                "values": getMemVal,//NO I18N
                                "children":[{"condition":"gte","field":"physical_memory","logical_operator":"and","values":[{"value":checkSpecArr[i].min_value,"unit":getUnitVal}]}]//NO I18N
                            }
                        }else{
                            inputData.criteria = {
                                "condition":condition,//NO I18N
                                "field":bookingFieldName,//NO I18N
                                "logical_operator": "AND",//NO I18N
                                "values": criValue,//NO I18N
                            }
                            inputData.criteria.children=[];
                        }
                        
                    } else {
                        if((parseInt(checkSpecArr[i].min_value) > 0 && parseInt(checkSpecArr[i].max_value) > parseInt(checkSpecArr[i].min_value)) && (fieldName == "physical_memory")){
                            const getUnitVal = "B";//NO I18N
                            const getMemVal = [{"value":checkSpecArr[i].max_value,"unit":getUnitVal}];//NO I18N 
                            inputData.criteria.children.push({
                                "condition":"lte",//NO I18N
                                "field":bookingFieldName,//NO I18N
                                "logical_operator": "AND",//NO I18N
                                "values": getMemVal,//NO I18N
                            });
                            inputData.criteria.children.push({
                                "condition":"gte",//NO I18N
                                "field":bookingFieldName,//NO I18N
                                "logical_operator": "AND",//NO I18N
                                "values": [{"value":checkSpecArr[i].min_value,"unit":getUnitVal}],//NO I18N
                            });
                        }else{
                            inputData.criteria.children.push({
                                "condition":condition,//NO I18N
                                "field":bookingFieldName,//NO I18N
                                "logical_operator": "AND",//NO I18N
                                "values": criValue,//NO I18N
                            });
                        }
                        
                    }
                }
                inputData.criteria.children.length==0 && delete inputData.criteria.children;
            }
            var bookingAllowed = true;
            jQuery('#booking_page_container').find('[name=change_avail_count]').each(function(){
                if(this.value==0){
                    bookingAllowed = false;
                    assetBookingFormObj.disableBookingButton();
                }
            });
            
            if(bookingAllowed){
                assetBookingFormObj.enableBookingButton();
            }
           
            assetBookingFormObj.ajaxFun('booking_fields/_get_values',null,'get_values',inputData,function(response){//NO I18N
                var getSpecifications = response.get_values;
                jQuery.each(getSpecifications, function(index,field){
                    var spliceArr = getFieldValues(field);
                    if(spliceArr.length>0){
                        assetBookingFormObj.spliceArrFunction(spliceArr,field.values);
                    }
                    getSpecifications[index]["specInfo"] = {id:field.id,start_index:field.values.length+1};
                    getSpecifications[index]["getSpecValues"] = field.values;
                    
                    getSpecifications[index]["ind"] = index;
                });
                function getFieldValues(field){
                    var spliceArr = [];
                    jQuery.each(field.values,function(currIndex,fieldVal){
                        if(field.field_name=="physical_memory"){
                            field.spliceVal = field.values.length;
                        }
                        if(typeof fieldVal.value=="string"){
                            var fieldValVar = fieldVal.value.replace(/(?<=\d)[\s.]+(?=\d)/g,'');
                            fieldVal["spec_id"] = fieldValVar.replace(/\s/g,''); //NO I18N
                        }else{
                            fieldVal["spec_id"] = fieldVal.value;
                        }

                        if(fieldVal.value=="-"){
                            spliceArr.push(currIndex);
                        }
                    });
                    return spliceArr;
                }
                 var availableCount =jQuery("#selectedProductTypes").find('[data-sep-id='+uniqueId+'] input').attr("max");
                renderhbs("#specificationPopup","booking-add-page-right-selected-asset-section",{//NO I18N
                    getSpecData      : getSpecifications,
                    productType      : productTypeName,
                    generateUniqueId : uniqueId,
                    isGetSeeMoreList : true,
                    isChkCountNull   : (availableCount==0) ? true : false
                },null,'asset-booking');//NO I18N
                assetBookingFormObj.checkUnCheckAllBoxBySelection(uniqueId);
                assetBookingFormObj.getSpecArr = getSpecifications;
                $asset_booking_settings.getAllPTRelatedSpecs = getSpecifications;
            
                if(backupArrForSelAsset.hasOwnProperty(uniqueId)){
                    checkSpecArr = backupArrForSelAsset[uniqueId];
                    assetBookingFormObj.setValueForCheckBox(uniqueId);
                }
                //added for dynamically rendering tooltip for specification popup in UI
                setTimeout(function(){
                    initTooltip('#specificationPopup');//NO I18N
                },150)
            });

            

    };
    //set selected values for radio button
    assetBookingFormObj.setValueForCheckBox=function(uniqueId){
        jQuery.each(backupArrForSelAsset[uniqueId], function(index,field){
            var getFirstSpecEle = jQuery('#booking_page_container').find('[name='+field.spec_field+']')[0];
            jQuery(getFirstSpecEle).prop('checked',true);//NO I18N
        });
    };
    //ajax function to get data based on url
    assetBookingFormObj.ajaxFun=function(url,moduleid,entityName,inputData, callback){
        sdpAjax({
            url:'/api/v3/'+url,//NO I18N
            data:sdpAjaxInputData(inputData),
            success : function(response){
                callback(response);
            },
            error:function(response){
                var getResponseData = response.responseJSON.response_status && response.responseJSON.response_status.messages.length>0 && response.responseJSON.response_status.messages[0].status_code=="4002";
                if(getResponseData){
                    window.location.href = "/InventoryHome.do";
                }

            }
        });
    };
    //Rendering data - get all data until has_more_rows as true
    assetBookingFormObj.getAllDataAtOnce=function(url,moduleid,entityName,inputData){
        var hasmorerows = false;
        var responseObj = "";
        
        sdpAjax({
            url:'/api/v3/'+url,//NO I18N
            data:sdpAjaxInputData(inputData),
            async:  false ,
            success : function(response){
                responseObj = response[entityName];
            }
        });
        return responseObj;
    };
    //ajax function for specification
    assetBookingFormObj.ajaxFunForSpecification=function(url,moduleid,entityName,inputData){
        var url = moduleid ? url+'/'+moduleid : url;
        var entityData = [],
        hasmorerows = true;
    
        sdpAjax({
            url:'/api/v3/'+url,//NO I18N
            cache: false,
            async: false,
            data:sdpAjaxInputData(inputData),
            success: function(response)
            {
                entityData = entityData.concat(entityName ? response[entityName] : response[url]);
                if(!moduleid && response.list_info && response.list_info.has_more_rows == true){
                    inputData.list_info.start_index = entityData.length + 1;
                }else{
                    hasmorerows=false;
                }
            }
        });

        return {data:entityData,hasmorerows:hasmorerows};
    };
    //cancel btn function in add booking page
    assetBookingFormObj.cancelBtnFunction=function(){
        var cancelMsg = translate('booked.asset.cancel.alert.msg');
        if (confirm(cancelMsg) == true) {
            var parentElement = jQuery('#booking_page_container');
            parentElement.find('#selectedProductTypes').empty().end()
                     .find('#specificationPopup,#form-footer,.freezeLayer').hide().end()
                     .find('#productList li').removeClass('act').end()
                     .find('#newAsset').parents('.ab-nw-ast').hide();//NO I18N
            assetBookingFormObj.clearAllVariables();
            parentElement.find('#calenEndTime_Display,#calenStartTime_Display,#calenEndTime,#calenStartTime').val('');
            closeCalDialog();
            parentElement.find('#assetDropdown,#s2id_assetDropdown').remove();
            assetBookingFormObj.disableListIfEmpty();
            assetBookingFormObj.setStartTimeByDefaultFun();
            checkAvailProductTypes = [];
            getUnavailProductTypes = [];
            assetBookingFormObj.currentFocusAvailEle = "";
        } 
    };
    assetBookingFormObj.disableListIfEmpty=function(id){
        var parentElement = jQuery('#booking_page_container');
        var selEle = id ? id : "productList";//no i18n
        parentElement.find('#' +selEle+ ' .ab-img-blk').removeClass("disableDiv");
        parentElement.find('#' +selEle+ ' img').removeClass("disableDiv");
        parentElement.find('#' +selEle+ ' #img1').removeClass("disableDiv");
        parentElement.find('#' +selEle+ ' .addtag').text(translate('booking.add.to.booking.placeholder.hovering'));
    }
    //getting all selected product availability for rendering available assets
    assetBookingFormObj.getAllSelProductsAvailability=function(isDateChange){
        var parentElement = jQuery('#booking_page_container'),
            startDate = parentElement.find('#calenStartTime').val(),
            endDate = parentElement.find('#calenEndTime').val(),
            criteriaAssetKeys = Object.keys(getCriteriaForAvail),
            conProductType = [],
            convertedInput  = {};
            jQuery.each(criteriaAssetKeys,function(index,val){
                var tempObj = jQuery.extend(true, {}, getCriteriaForAvail[val]),
                    obj = {};
                    getCriteriaForAvail[val].order=Number(index)+Number(1);
                    if(getCriteriaForAvail[val].product_type && getCriteriaForAvail[val].product_type.name==""){
                        tempObj = {};
                    }
                    obj.order = getCriteriaForAvail[val].order;
                    var currReqCount = jQuery("#avail_"+val+" [name='change_avail_count']").val();
                    if(isDateChange){
                        currReqCount = (currReqCount==0) ? "1" :  currReqCount;
                    }
                    
                    obj.required_count = currReqCount;
                    obj.product_type = tempObj.product_type;
                    tempObj.criteria  ? obj.criteria = tempObj.criteria : null;
                    conProductType.push(obj);
            });

                convertedInput.start_time={
                "value": startDate//NO I18N
                }
                convertedInput.end_time={
                    "value": endDate//NO I18N
                }
                convertedInput.booking_items = conProductType;
                assetBookingFormObj.ajaxFun('booked_assets/_get_asset_availability',null,'get_asset_availability',convertedInput, function(response){//NO I18N
                    var getAvailability = response.get_asset_availability;
                    if(getAvailability){
                        jQuery.each(criteriaAssetKeys,function(index,val){
                            var currSectionId = jQuery("#selectedProductTypes").find("[data-unique-id="+val+"] .updateSpecDiv"); //NO I18N
                            if(currSectionId.length>0){
                                renderhbs(currSectionId,"booking-add-page-right-selected-asset-section",{//NO I18N
                                    getAvailableData : getAvailability.booking_items && getAvailability.booking_items[index],
                                    productType      : getCriteriaForAvail[val].product_type && getCriteriaForAvail[val].product_type.name,
                                    specSelDetails   : backupArrForSelAsset[val],
                                    generateUniqueId : val,
                                    currOrder        : getCriteriaForAvail[val].order,
                                    isClearSpec      : true,
                                    isDateSel        : (startDate && endDate) ? true : false,
                                },null,'asset-booking');//NO I18N
                            }
                            
                            if(getAvailability && getAvailability.booking_items){
                                jQuery.each(getAvailability.booking_items, function(i,val){
                                    var getUniqueID = jQuery("#avail_"+val.order).attr("data-sep-id");
                                    
                                        if(isDateChange){
                                            var requiredCount = (val.available_count >= val.required_count) ? val.required_count : null;
                                        }else{
                                            var requiredCount = jQuery("#quantity_"+getUniqueID).val();
                                        }
                                    
                                        if(jQuery("#avail_"+val.order).length>0){
                                            renderhbs("#avail_"+val.order,"booking-add-page-right-selected-asset-section",{//NO I18N
                                                getAvailableData  : val.available_count,
                                                requiredCount     : requiredCount||1,
                                                generateUniqueId  : getUniqueID,
                                                isTakeAvailCount : true
                                            },null,'asset-booking');//NO I18N
                                        }
                                });
                            }
                        });
                    }
                    initTooltip('#asset-bookings-section');//NO I18N
                })
                
    };
    //execute function while clicking close icon in selected asset section
    assetBookingFormObj.clearSpecifications=function(ele,e){
        e.stopPropagation();
        jQuery('#specloadingIcon').show();
       
            var parentElement = jQuery('#booking_page_container'),
            specName = parentElement.find(ele).attr('data-spec-name'),
            selSection = parentElement.find(ele).parents('[name=assetSection]');//NO I18N
            selSection.find('#asset').trigger('click');
            
            var uniqueId = selSection.attr('data-unique-id');
            assetBookingFormObj.setValueForCheckBox(uniqueId);
            parentElement.find('[data-unique-id='+uniqueId+'] [name='+specName+']').prop("checked", false);//NO I18N
            
            checkSpecArr = backupArrForSelAsset[uniqueId];
            var spliceArr = [];
                checkSpecArr.forEach(function(fields,index){
                    if(fields.spec_field===specName){
                        spliceArr.push(index);
                    }
                });
                $asset_booking_form.spliceArrFunction(spliceArr,checkSpecArr);
                assetBookingFormObj.checkAvailability(uniqueId,null,function(getAvailability){
                    assetBookingFormObj.getCurrentAssetSpecification(uniqueId,getAvailability);
                    backupArrForSelAsset[uniqueId] = checkSpecArr;
                    
                    var currentPostition = Object.keys(getCriteriaForAvail).indexOf(uniqueId);
                    assetBookingFormObj.getProductTypeAvailability(uniqueId,null,getAvailability,null,null,null,currentPostition);
                    jQuery('#specloadingIcon').hide();
                });
      
    };
    assetBookingFormObj.removeResetSpecifications=function(ele){
        var getCurrAssetSpec = jQuery(ele).attr('data-spec-name');
        var curParentId = jQuery(ele).attr('data-parunique-id');
        jQuery('#booking_page_container').find('[name=assetSection][data-unique-id='+curParentId+']').find('[data-spec-name='+getCurrAssetSpec+']').trigger("click");
    };
    //function to delete selected asset by clicking delete icon
    assetBookingFormObj.deleteSelectedAsset=function(ele,e){
        e.stopPropagation();
        assetBookingFormObj.preventContClickIfNotExe = true;
        var parentElement = jQuery('#booking_page_container'),
                    uniqueId = parentElement.find(ele).parents('[name=assetSection]').attr('data-unique-id');//NO I18N
       if(Object.keys(backupArrForSelAsset).length>0 && backupArrForSelAsset.hasOwnProperty(uniqueId)){
        backupArrForSelAsset[uniqueId] = {};
       }
       getCriteriaForAvail[uniqueId] = {};
        parentElement.find(ele).parents('[name=assetSection]').remove();//NO I18N
        parentElement.find('#specificationPopup,.freezeLayer').hide();
        assetBookingFormObj.getSpecArr=[];
        var isCheckEmptyProType = assetBookingFormObj.checkEmptyIsAvailable();
        if(isCheckEmptyProType.length>0){
            assetBookingFormObj.disableBookingButton();
        }else{
            assetBookingFormObj.enableBookingButton();
        }
        checkAvailProductTypes = [];
    };
    //function to render product type dropdown in booking popup
    assetBookingFormObj.newAssetInsidePopup=function(){
        var parentElement = jQuery('#booking_page_container');
            parentElement.find('#selectedProductTypes .ab-li').removeClass('act');
            parentElement.find('#newAsset').parent().append('<input type="text" id="assetDropdown" class="form-control mt2" />');
            parentElement.find('#newAsset').hide();
            assetBookingFormObj.newAssetSelect2Fun();

            parentElement.find('#assetDropdown').on('change',function(){
                generateIndividualId++;
                var assetSelectData = parentElement.find(this).select2('data');//NO I18N
                    checkSpecArr=[];
                    productTypeName = assetSelectData.display_name;
                    productTypeImgName=parentElement.find('#'+assetSelectData.id).find('#img1').attr('name');
                    productTypeId=assetSelectData.id;

                    parentElement.find('#newAsset').siblings('.select2-container').remove();//NO I18N
                    parentElement.find('#assetDropdown').remove().end()
                                 .find('#newAsset').show().end()
                                 .find('#selectedProductTypes').animate({
                                    scrollTop: parentElement.find('#selectedProductTypes')[0].scrollHeight},
                                 500);

                    var fromDate = parentElement.find('#calenStartTime').val(),
                        toDate = parentElement.find('#calenEndTime').val();
                        if(fromDate && toDate){
                            assetBookingFormObj.commonProductTypeAccessFun(null);
                        }else{
                            assetBookingFormObj.commonProductTypeAccessFun(true);
                        }
            });
    };
    //funtion for getting Product type by all the ways like selected in dropdown, selected in icon
    assetBookingFormObj.commonProductTypeAccessFun=function(isDateEmpty){
        var parentElement = jQuery('#booking_page_container')
        assetBookingFormObj.enableBookingButton();
        if(isDateEmpty){
            getCriteriaForAvail[generateIndividualId] = {
                product_type:{
                    name  : productTypeName
                }
            };
            
            if(assetBookingFormObj.getAllAssetsCount){
                assetBookingFormObj.getAllAssetsCount.forEach(function(fields,index){
                    if(fields.module.id==productTypeId){
                        fields.order=Number(Object.keys(getCriteriaForAvail).length-1)+Number(1);
                        assetBookingFormObj.getProductTypeAvailability(generateIndividualId,true,null,fields);
                    }
                });
            }
            parentElement.find('#selectedProductTypes [data-name="spec"]').hide();
        }else{
            jQuery('#specificationPopup,#specloadingIcon').hide();
                var assetSelLen = jQuery('[name=assetSection]').length;
                var getSelId = jQuery('#selectedProductTypes').find('[data-asset-name=selectedProductType_'+productTypeId+']');
                if(getSelId.length>0){
                    var assetBookingItems = [];//to send only the repeated items in getCriteriaForAvail - booking items on right panel
                    if(Object.keys(getCriteriaForAvail).length>0){
                        var criteriaArr = Object.keys(getCriteriaForAvail);
                        var parentElement = jQuery('#booking_page_container');
                        jQuery.each(getCriteriaForAvail,function(index,val){
                            var currIndex = criteriaArr.indexOf(index);
                            val.order = Number(currIndex)+Number(1);
                            val.required_count = parentElement.find("#quantity_"+index).val();
                            val.product_type = val.product_type;
                            val.criteria = val.criteria;
                        });
                    }
                    getCriteriaForAvail[generateIndividualId] = {
                        product_type:{
                            name  : productTypeName,
                        },
                        order : Number(Object.keys(getCriteriaForAvail).length)+Number(1)
                    };
                    jQuery.each(getCriteriaForAvail,function(index,fieldobj){
                        if(fieldobj.product_type && (productTypeName==fieldobj.product_type.name)){
                            assetBookingItems.push(fieldobj);
                        }
                    });
                    //assetBookingFormObj.checkEmptyIsAvailable();
                    //if(checkAvailProductTypes.length==0){
                        assetBookingFormObj.checkAvailability(generateIndividualId,{booking_items:assetBookingItems},function(getAvailability){
                            var currentPostition = Object.keys(getCriteriaForAvail).indexOf(generateIndividualId);
                            assetBookingFormObj.getProductTypeAvailability(generateIndividualId,true,getAvailability,null,null,null,currentPostition);
                            var currSelProType = parentElement.find('[data-unique-id='+generateIndividualId+']').find('#asset');
                            assetBookingFormObj.selectedAssetClickFun(currSelProType,getAvailability);
                        });
                     //}
                }else{
                    if(assetBookingFormObj.getAssetAvailInParDate){
                        getCriteriaForAvail[generateIndividualId] = {
                            product_type:{
                                name  : productTypeName
                            }
                        };
                        jQuery.each(assetBookingFormObj.getAssetAvailInParDate.booking_items,function(index,fieldobj){
                            if(fieldobj.product_type.name==productTypeName){
                                fieldobj.order=Number(Object.keys(getCriteriaForAvail).length-1)+Number(1);
                                var currentPostition = Object.keys(getCriteriaForAvail).indexOf(index);
                                assetBookingFormObj.getProductTypeAvailability(generateIndividualId,true,null,fieldobj,null,null,currentPostition);
                                assetBookingFormObj.getCurrentAssetSpecification(generateIndividualId,fieldobj);
                                jQuery('#booking_page_container .freezeLayer').show()
                                jQuery('#booking_page_container .freezeLayer,#booking_page_container #specificationPopup').css("height",jQuery("#booking_page_container").css("height"));// No I18N
                                if(fieldobj.available_count>0){
                                    jQuery('#specificationPopup,#specloadingIcon').show();
                                    initTooltip('#asset-bookings-section');//NO I18N
                                }
                            }
                        });
                    }
                }
                jQuery('#specloadingIcon').hide();
            
            
        }
        initTooltip('#asset-bookings-section');//NO I18N
    };
    //function to Search assets in booking page "searching" Input field
    assetBookingFormObj.searchAssetsForBooking = function(){
        var parentElement = jQuery('#booking_page_container'),
            booking_search_row = parentElement.find(".admin-searchrow"),//no i18n
            bookingpage_search = parentElement.find('input.admin-searchbar'),
            $select2 = jQuery("<input id='search_products' class=search_producttypes aria-label="+translate("sdp.admin.producttype.listview.title")+">"),
            booking_searchresult = parentElement.find('.admin-searchresult');
            parentElement.find('.search_producttypes').remove();
            parentElement.find('.select2-container').remove();

            booking_search_row.append($select2);
            var inputData = {start_index:1,row_count:100}
           
            $select2.sdp_select2({
                containerCssClass: "hide",//no i18n
                value: "",//NO I18N
                cache:{},
                multiple:false,
                allowClear : true,
                url:[{
                    url:"/api/v3/booking_items/product_type",//NO I18N
                    field:'product_type',//NO I18N
                    list_info:inputData
                }],
                processResults: function(search_data, data, field) {
                    if($asset_booking_form.removeWorkstationOrServer && $asset_booking_form.removeWorkstationOrServer.length>0 && $asset_booking_form.removeWorkstationOrServer.indexOf(data.internal_name)!=-1) {
                        search_data = [];
                    }
                    if(data){
                        if(getUnavailProductTypes.indexOf(data.display_name)!="-1"){
                            search_data = [];
                        }else{
                            search_data.push(data)
                        }
                    }
                    
                },
                formatResult: function (item) { return e_html(item.display_name); },
                formatSelection: function (item) { return e_html(item.display_name); }
            });
            booking_search_row.find(".select2-container").width(booking_search_row.width());
            booking_search_row.find(".select2-container").addClass('hide');//no i18n
            $select2.on("change", function (e) {
                var selEle = jQuery(this).val(),
                    ele = parentElement.find('#'+selEle);
                assetBookingFormObj.openBookingDetailsPopup(null,ele);
            }).on("select2-close", function (e){
                booking_search_row.find(".select2-container").addClass('hide');
                bookingpage_search.removeClass('hide');
                booking_search_row.find(".search1").removeClass('hide');
            }).on('select2-open', function () {
                jQuery(this).select2('data','');//NO I18N
                booking_search_row.find(".search1").addClass('hide');//no i18n
            });
            
            bookingpage_search.trigger('focus');
            bookingpage_search.on('keydown', function (event) {
                booking_search_row.find(".select2-container").removeClass('hide');//no i18n
                bookingpage_search.addClass('hide');
                assetBookingFormObj.select2_search($select2, event.key);
            });
    };
    //callback function for seaching assets field
    assetBookingFormObj.select2_search=function($el, term){
        var $search = $el.data('select2') && $el.data('select2').dropdown;//No i18n
            $search.val(term);
            $search.trigger('keyup');
            $el.select2('open'); //No i18n
    };
    //Performing operations while saving booked assets
    assetBookingFormObj.saveFunForBookedAssets=function(e){
        e.preventDefault();    
        var parentElement = jQuery('#booking_page_container'),
            productTypesArr = [],
            start_date = parentElement.find('#calenStartTime').val(),
            comments = parentElement.find('#book-comment').val(),
            purpose = parentElement.find('#purposeDropdown').select2('data') ? parentElement.find('#purposeDropdown').select2('data').text : null,//NO I18N
            end_date = parentElement.find('#calenEndTime').val(),
            allAssetCount = 0,
            isUnavailable = false;
            if(!end_date){
                inProgressBtn(jQuery("#book-btn"), translate("booking.save.button"), false);
                showalert('failure',translate('booking.end.date.validation.msg'),"isAutoHide=false");//NO I18N
                return;
            }
            jQuery.each(getCriteriaForAvail,function(index,fieldobj){
                var currObj = fieldobj;
                    delete currObj.start_time;
                    delete currObj.end_time;
                    delete currObj.order;
                    delete currObj.required_count;
                    delete currObj.display_order;
                    if(assetBookingFormObj.getAssetAvailInParDate && assetBookingFormObj.getAssetAvailInParDate.booking_items.length){
                        var currAssetAvailability = assetBookingFormObj.getAssetAvailInParDate.booking_items.find(function(asset){
                            if(asset.product_type && currObj.product_type){
                            return asset.product_type.name == currObj.product_type.name;
                            }
                        });
                        currAssetAvailability = currAssetAvailability && currAssetAvailability.available_count;
                        currObj.total_count = parentElement.find('#quantity_'+index).val();
                        allAssetCount = Number(allAssetCount) + Number(currObj.total_count);
                        if(currAssetAvailability && currObj.total_count<=currAssetAvailability && currObj.total_count>0){
                            productTypesArr.push(currObj);
                     }else if(currObj.product_type && currObj.product_type.name!='' && currObj.total_count<=currAssetAvailability){
                            isUnavailable = true;
                        }
                    }
                    if(Number(currObj.total_count)>100){
                    	showalert('failure',translate('booking.booked.asset.maximumlimit',[100]),"isAutoHide=false");//NO I18N
                	}
            });
            $asset_booking_reschedule.validateForm('bookingForm');//NO I18N

            var isValid = jQuery('#bookingForm').valid(),
                list_info = {
                    "asset_booking": {//NO I18N
                        "booking_items": productTypesArr,//NO I18N
                        "status": {//NO I18N
                          "name": "Open"//NO I18N
                        },
                        "purpose": purpose ? {//NO I18N
                            "name": purpose//NO I18N
                        } : null,
                        "start_time": {//NO I18N
                            value : start_date
                        },
                        "end_time": {//NO I18N
                            value : end_date
                        },
                        "comments": comments//NO I18N
                    }
                };

                if(!isValid){
                    inProgressBtn(saveBtn, translate("booking.save.button"), false);
                    return true;
                }
                if(isUnavailable){
                    showalert('failure',translate('booking.remove.unavilable.msg'),"isAutoHide=false");//NO I18N
                }else if(allAssetCount>400){
                    showalert('failure',translate('booking.booked.asset.maximumlimit',[400]),"isAutoHide=false");//NO I18N
                }else{
                    var saveBtn = jQuery("#book-btn");
                    inProgressBtn(saveBtn, translate("booking.title"), true);
                    assetBookingFormObj.putAndPostOperation('asset_bookings',"POST",list_info,'asset_bookings');
                }
    };
    //See more and See less clicking function for booking settings and booking page specification 
    assetBookingFormObj.seemoreInSpecification=function(currentEle,parentEle,bookingSettingSpec,isPopup){
        var parentElement = parentEle ? jQuery('#'+parentEle) : jQuery('#booking_page_container'),
            seemoreSpec = parentElement.find(currentEle),
            seemoreId = seemoreSpec.attr('data-field-name'),
            dataVal = seemoreSpec.attr('data-val'),
            uniqueId = generateIndividualId,
            startDate = parentElement.find('#calenStartTime').val(),
            endDate = parentElement.find('#calenEndTime').val(),
            smtemplateCont = bookingSettingSpec ? "booking-settings-render-tab-section" : "booking-add-page-right-selected-asset-section",//NO I18N
            
            specInd = seemoreSpec.attr('data-ind');
            var parentEleOfLi = seemoreSpec.parent().attr("id").split("_")[1];
            var collectSpecArr = [];
            
            //Getting and setting scrollTop to all specification section
            $asset_booking_settings.getCurrentScrollVal = [];
            assetBookingFormObj.functionForRenderScroll(true);
            var currArrofValues = "";
            if(isPopup){
                collectSpecArr = assetBookingFormObj.getSpecArr.slice();
                currArrofValues =  collectSpecArr[specInd]["getPreviewValues"];
            }else{
                collectSpecArr = $asset_booking_settings.getAllPTRelatedSpecs.slice();
                currArrofValues = collectSpecArr[specInd]["getSpecValues"]
            }
           
            jQuery.each(collectSpecArr,function(currIndex,fieldVal){
                if(parentEleOfLi==fieldVal.id){
                    specInd = currIndex;
                }
            });
            
            if(dataVal=="0"){
                if(collectSpecArr[specInd] && collectSpecArr[specInd]["hasMoreRows"]){
                    var startIndex  = collectSpecArr[specInd]["getTotalCountHasMoreRows"]==false ? 1 : collectSpecArr[specInd]["specInfo"].start_index;
                    
                    if(seemoreId==="physical_memory" && currArrofValues.length<10){
                        var startIndex  = Number(collectSpecArr[specInd]["spliceVal"])+Number(1); 
                    }
                    var inputData = {list_info:{"start_index":startIndex,"row_count":100}};//NO I18N
                    if(bookingSettingSpec){
                        inputData["list_info"]["filter_by"] = {//NO I18N
                            "name": "booking_settings"//NO I18N
                        }
                    }else{
                        inputData["start_time"] = {value:startDate};
                        inputData["end_time"]={value:endDate};
                     }
                    if(collectSpecArr[specInd]["getTotalCountHasMoreRows"]==false){
                        var getCurrSpecVal = assetBookingFormObj.ajaxFunForSpecification('booking_fields/'+collectSpecArr[specInd]["specInfo"].id+'/_get_values',null,'get_values',inputData);
                    }else{
                
                        var getCurrSpecVal = assetBookingFormObj.ajaxFunForSpecification('booking_fields/'+collectSpecArr[specInd]["specInfo"].id+'/_get_values',null,'get_values',inputData);
                    }
                   
                    var spliceArr = [];
                    jQuery.each(getCurrSpecVal.data,function(currIndex,fieldVal){
                        if(typeof fieldVal.value=="string"){
                            var fieldValVar = fieldVal.value.replace(/(?<=\d)[\s.]+(?=\d)/g,'');
                            fieldVal["spec_id"] = fieldValVar.replace(/\s/g,''); //NO I18N
                        }else{
                            fieldVal["spec_id"] = fieldVal.value;
                        }

                        if(fieldVal.value=="-"){
                            spliceArr.push(currIndex);
                        }
                    });
                    if(spliceArr.length>0){
                        assetBookingFormObj.spliceArrFunction(spliceArr,getCurrSpecVal.data);
                    }
                    
                    if(isPopup){
                        collectSpecArr[specInd]["getPreviewValues"].push.apply(collectSpecArr[specInd]["getPreviewValues"],getCurrSpecVal.data);
                        
                    }else{
                        collectSpecArr[specInd]["getSpecValues"].push.apply(collectSpecArr[specInd]["getSpecValues"],getCurrSpecVal.data);
                        
                    }
                    
                    /**Used for memory removing duplicate value as discussed as per server side changes */
                    
                    function removeDuplicates(currArrofValues,isPopup) {
                        let newArray = [];
                        let uniqueObject = {};
                        for (let i in currArrofValues) {
                            if(currArrofValues[i].hasOwnProperty('display_value')){
                                var objTitle = currArrofValues[i]['display_value'];
                            uniqueObject[objTitle] = currArrofValues[i];
                            }else{
                                currArrofValues.splice(i,1);
                            }

                            
                        }
                        for (i in uniqueObject) {
                            newArray.push(uniqueObject[i]);
                        }
                        if(isPopup){
                            collectSpecArr[specInd]["getPreviewValues"] = newArray;
                        }else{
                            collectSpecArr[specInd]["getSpecValues"] = newArray;
                        }
                        
                    }
                    if(seemoreId==="physical_memory"){
                        removeDuplicates(currArrofValues,isPopup);
                    }
                    /**End */
                    if(isPopup){
                        collectSpecArr[specInd]["specInfo"].start_index = Number(collectSpecArr[specInd]["getPreviewValues"].length)+Number(1);
                    }else{
                        collectSpecArr[specInd]["specInfo"].start_index = Number(collectSpecArr[specInd]["getSpecValues"].length)+Number(1);
                    }
                    
                    collectSpecArr[specInd]["getTotalCountHasMoreRows"] = getCurrSpecVal.hasmorerows;
                    
                    

                    if(bookingSettingSpec){
                        if(productTypeArr.length==0){
                            productTypeArr = $asset_booking_settings.productTypeArr;
                        }
                        var chkedChkBox = jQuery("#specificationSection input[type=checkbox]:checked");
                        if(isPopup){
                            var id = jQuery('#produtTypesList').select2('data') && jQuery('#produtTypesList').select2('data').id;// No I18N
                            var getData = $asset_booking_settings.divideArrForGeneralSettings(id,true,collectSpecArr);
                            renderhbs('#specificationPopup',smtemplateCont,{getSpecData:getData,isPopup:true,isGetSeeMoreList : true,isSpecDetails:true},null,'asset-booking');//NO I18N
                        }
                        else{
                            var getPTVal = jQuery("#produtTypesList").select2('data'),//NO I18N
                                getPTId = jQuery("#produtTypesList").select2('data') && jQuery("#produtTypesList").select2('data').id,//NO I18N
                                getData = $asset_booking_settings.divideArrForGeneralSettings(getPTId || productTypeArr[0] && productTypeArr[0].id,null,collectSpecArr);
                            getData[0].length>0 && fixedformfooter(document.getElementById("specificationSection"), document.querySelector("[data-name=form-footer]"), "fixedbtnpbottom=false");// No I18N
                            
                            getData[0].length>0 && renderhbs('#specificationSection','booking-settings-render-tab-section',{getSpecData:getData,isSpecDetails:true},null,'asset-booking');//NO I18N
                            
                            if(jQuery('[name=a_b_filters]:checked').length==0){
                                jQuery('#preview-btn').prop('disabled',true);//NO I18N
                            }
                        }
                        jQuery.each(chkedChkBox,function(index,ele){
                            if(isPopup){
                                var ckhdataName = e_attr(jQuery(this).attr('data-name'));
                                jQuery("#specificationPopup #ulpop_"+ele.id+" [name=spec_"+ckhdataName+"]").show();
                            }else{
                                jQuery("#specificationSection #"+ele.id).prop("checked",true);//NO I18N
                                var findEle = jQuery("#specificationSection [data-id="+ele.id+"]");
                                var ckhdataName = e_attr(jQuery(this).attr('data-name'));
                                $asset_booking_settings.specDropdownFun(jQuery(findEle));
                                jQuery("#specificationSection [data-id="+ele.id+"]+ul [name=spec_"+ckhdataName+"]").show();
                            }
                        });
                    }
                    else{
                        renderhbs("#specificationPopup",smtemplateCont,{//NO I18N
                            getSpecData      : collectSpecArr,
                            productType      : productTypeName,
                            generateUniqueId : uniqueId,
                            isGetSeeMoreList : true
                        },null,'asset-booking');//NO I18N
                        assetBookingFormObj.checkUnCheckAllBoxBySelection(uniqueId);
                        if(backupArrForSelAsset.hasOwnProperty(uniqueId)){
                            checkSpecArr = backupArrForSelAsset[uniqueId];
                            assetBookingFormObj.setValueForCheckBox(uniqueId);
                        }
                    }
                }
                
                parentElement.find('[name="spec_'+seemoreId+'"]').show();
                if(!bookingSettingSpec)
                    parentElement.find('[name='+seemoreId+']')[collectSpecArr[specInd]["specInfo"].start_index-2].focus();//NO I18N
                
                 if(!(collectSpecArr[specInd] && collectSpecArr[specInd]["getTotalCountHasMoreRows"])){
                    parentElement.find('[name="spec_'+seemoreId+'"]').show();
                    seemoreSpec = jQuery("#"+seemoreSpec.parent().attr("id")+" [data-field-name="+currentEle.getAttribute("data-field-name")+"]");
                    seemoreSpec.attr('data-val',"1");
                    seemoreSpec.text(translate('sdp.comment.seeless'));
                    if(!bookingSettingSpec)
                        parentElement.find('[name='+seemoreId+']')[collectSpecArr[specInd]["specInfo"].start_index-2].focus();//NO I18N
                }
                initTooltip('#asset-bookings-section');//NO I18N
            }else{
                
                jQuery(seemoreSpec.parent()).find("[name=spec_"+seemoreId+"]").remove();
               
                seemoreSpec.attr('data-val',"0");
                seemoreSpec.text(translate('sdp.comment.seemore'));
                collectSpecArr[specInd]["getTotalCountHasMoreRows"] = true;
                collectSpecArr[specInd]["specInfo"].start_index = 11;
                
               var spliceIndex  = seemoreId==="physical_memory" ? collectSpecArr[specInd]["spliceVal"] : 10;
                
               currArrofValues.splice(spliceIndex,currArrofValues.length-1);
                
                 if(seemoreId==="physical_memory"){
                    for(var i=9;i>collectSpecArr[specInd]["spliceVal"]-1;i--){
                        seemoreSpec.parent().find('li')[i].remove();
                    }
                   }
            }
            initTooltip('#asset-bookings-section');//NO I18N
            //added for animating scroll by ranjani as discussed with ui team 
             if(bookingSettingSpec){
                var specScrollElement = parentElement.find('[name="spec_'+seemoreId+'"]').parent();
                specScrollElement.animate({ scrollTop: specScrollElement.prop("scrollHeight")}, 300);//NO I18N
            }
            jQuery("#specificationSection").css("min-height",jQuery("#specificationSection").height()); // No I18N
            assetBookingFormObj.functionForRenderScroll();
            setTimeout(function(){
                initTooltip('#specificationPopup');//NO I18N
            },150)
    };
    //set Scroll to previous position if render data for new template
    assetBookingFormObj.functionForRenderScroll=function(isGetVal){
        var getSpecDataVal = $asset_booking_settings.getAllPTRelatedSpecs;
        if(isGetVal){
            for(var i=0;i<getSpecDataVal.length;i++){
                var getCurrEleScroll = jQuery("#ul_"+getSpecDataVal[i].id).scrollTop();
                $asset_booking_settings.getCurrentScrollVal.push(getCurrEleScroll);
            }
        }else{
            var setSpecDataVal = $asset_booking_settings.getCurrentScrollVal;
            for(var i=0;i<setSpecDataVal.length;i++){
                jQuery("#ul_"+getSpecDataVal[i].id).scrollTop(setSpecDataVal[i]);
            }
        }
    };
    //common function for performing (put,post,delete) operation in booking feature
    assetBookingFormObj.putAndPostOperation=function(url,type,input_data,entityName,getmessage,completeCallBack){
        sdpAjax({
            url     : "/api/v3/"+url, //No I18N
            type    : type,
            async   : true,
            data    : input_data ? sdpAjaxInputData(input_data) : null,
            success : function(response){
                $asset_booking_reschedule.popupCancelFun();
                jQuery('<div class="pos-rel" id="common_load_bar">' + ajaxBar() + '</div>').insertBefore( "#booking_details_tab");// No I18N
                
                var message = "";
                    $asset_booking_details.getAllowedValues = [];
                    switch (entityName) {
                        case 'rescheduled'://no i18n
                            message = translate("booking.reschedule.success");
                            if($asset_booking_details.bookedTableComp){
                                $asset_booking_details.bookedTableComp && $asset_booking_details.historyTabRender($asset_booking_details.bookedTableComp.visibleContents[0].booking.id);
                            }
                            break;
                        case "asset_bookings"://no i18n
                            message =  translate("booked.assets.success.msg");// No I18N
                            break;
                        case "cancel_booking"://no i18n
                            message =  translate("booking.cancel.success");// No I18N
                            break;
                        case "cancelled"://no i18n
                            message =  translate("booking.cancel.success");// No I18N
                            break;
                        case "readytopickp"://no i18n
                            message =  translate("booking.ready.success");// No I18N
                            break;
                        case "specifications"://no i18n
                            message =  translate('sdp.admin.servicecatalog.saved');// No I18N
                            break;
                        case "purpose"://no i18n
                            message = translate('api.saved.success', [translate("booking.purpose")]);// No I18N
                            $asset_booking_settings.purposeTableComp.refreshTable();
                            break;
                        case "loaned"://no i18n
                            message =  translate("sdp.asset.loan.add.success");// No I18N
                            break;
                        case "associate"://no i18n
                            message =  translate("api.associate.success.msg",[translate("sdp.header.inventory")]);// No I18N
                            break;
                        case "settings"://no i18n
                            message =  getmessage;
                            break;
                        default:
                            message =  getmessage;
                            break; 
                    }
                
                        entityName ? showalert('success', message,"isAutoHide=true") : null;// No I18N
                        

                    if(entityName=="loaned" || entityName=="readytopickp" || entityName=="cancelled" || entityName=="associate" || entityName=="rescheduled"){
                        $asset_booking_details.whileInit=false;
                        if(entityName=="loaned" || entityName=="readytopickp" || entityName=="cancelled"){
                            $asset_booking_details.getHeaderLink=true;
                        }
                        assetBookingFormObj.commonFunRenderDetailsWhileSave()
                    }
                    if(entityName=="settings"){
                        $asset_booking_settings.renderSpecAfterDisOrEnable();
                    }
                    if(entityName=="asset_bookings"){
                        setTimeout(function(){
                            assetBookingFormObj.checkUserIsAdmin ? $asset_booking_route.renderPage({mode:'details',entity_id:response.asset_booking.id}) : window.location.href="/ui/home";
                        },300)
                    }
                    jQuery('#common_load_bar').remove();
            },
            error:function(response){
                removeprogress();
                var responseError = response.responseJSON;
                var message = responseError && responseError.response_status && responseError.response_status.messages && responseError.response_status.messages.length>0 && responseError.response_status.messages[0].message;
                showalert('failure', message,"isAutoHide=false")//NO I18N
                jQuery('#common_load_bar').remove();
            },
            complete:function(response){
                removeprogress();
                completeCallBack && completeCallBack();
            }
        });

        function removeprogress(){
            if(entityName=="loaned"){//NO I18N
                var saveBtn = jQuery("#create-loan");
                inProgressBtn(saveBtn, translate("sdp.asset.loan.checkOut"), false);
            }else if(entityName=="rescheduled"){//NO I18N
                var saveBtn = jQuery("#rescheduled");
                inProgressBtn(saveBtn, translate("booking.reschedule"), false);
            }else if(entityName=="asset_bookings"){//NO I18N
                var saveBtn = jQuery("#book-btn");
                inProgressBtn(saveBtn, translate("booking.save.button"), false);
            }else{
                var saveBtn = (entityName=="cancelled") ? jQuery("#asset_"+entityName) : jQuery("#"+entityName);//NO I18N
                var getBtnMsg = (entityName=="cancelled") ? "sdp.admin.translation.proceed" : "sdp.common.save";//NO I18N
                inProgressBtn(saveBtn, translate(getBtnMsg), false);
            }
        }
    };
    //common function to return array by removing specified index  
    assetBookingFormObj.spliceArrFunction=function(indexArr,dataArr){
        return $asset_booking_reschedule.spliceArrFunction(indexArr,dataArr);
    };
    assetBookingFormObj.commonFunRenderDetailsWhileSave=function(){
        var checkRole = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
        if(checkRole){
            var bookingId = $asset_booking_details.bookedTableComp && $asset_booking_details.bookedTableComp.visibleContents.length>0 && $asset_booking_details.bookedTableComp.visibleContents[0].booking.id;
                var inputData =  {
                    "include": [//NO I18N   
                        "meta_info",//NO I18N
                        "links"//NO I18N
                    ]
                    };
            $asset_booking_form.ajaxFun('asset_bookings/'+bookingId,bookingId,'asset_booking',inputData,function(response){//NO I18N
                $asset_booking_details.bookedTableComp && $asset_booking_details.bookedTableComp.refreshTable();
                var bookingIdData = response.asset_booking;
                jQuery('#loanrightdiv #status').html(e_html(bookingIdData && bookingIdData.status && bookingIdData.status.name)).addClass('info').removeClass('success');
                if(bookingIdData.status.internal_name==="Ready For Pickup"){
                    jQuery('#loanrightdiv #status').addClass('success').removeClass('info');
                }
                if($asset_booking_details.getSelectedChkBoxIds && $asset_booking_details.getSelectedChkBoxIds.length>0){
                    for(var i=0;i<$asset_booking_details.getSelectedChkBoxIds.length;i++){
                        var getBookedIdValue = $asset_booking_details.getSelectedChkBoxIds[i];
                        if(jQuery("#loanedAssetsDiv_"+getBookedIdValue) && jQuery("#loanedAssetsDiv_"+getBookedIdValue).length>0){
                            renderhbs('#loanedAssetsDiv_'+getBookedIdValue,'booking-details-page-list-view',{// No I18N
                                name: $asset_booking_details.getSepBookingIds && $asset_booking_details.getSepBookingIds[getBookedIdValue].loanedAsset,
                                bookedAssets:$asset_booking_details.bookingAssetId,
                                currId:getBookedIdValue,
                                remainingAssets:$asset_booking_details.getSepBookingIds && $asset_booking_details.getSepBookingIds[getBookedIdValue].loanedAssetIds.length-1,
                                isLVAssetDetails : true
                            },null,'asset-booking');//NO I18N
                        }
                    }
                }
                $asset_booking_details.disableReschedule($asset_booking_details.bookedTableComp.visibleContents[0].booking.id);
            })
                
        }
    };
    return assetBookingFormObj;
}());
