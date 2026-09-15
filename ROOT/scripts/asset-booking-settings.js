var $asset_booking_settings = (function(){
    "use strict";//NO I18N
    var bookingSettingsObj = {};
        bookingSettingsObj.onLoad =function(){
            var parentElement = jQuery('#a_b_settings'), 
                checkIscurrTab = window.location.hash ? window.location.hash.split("#")[1] : "specification",
                currSettingsTabName = "ab_settings_"+checkIscurrTab+"_tab";//no i18n
                
                var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings';//NO I18N
                bookingSettingsObj.getAssetBookSettings = $asset_booking_form.getAllDataAtOnce(settingUrl,null,'asset_booking_settings')[0];//NO I18N
                
                var tabArr=[{
                    "key" : translate("booking.product.type.spec"),//no i18n
                    "tabname" : "ab_settings_specification_tab"//no i18n
                },{
                    "key" : translate("sdp.admin.settings.general"),//no i18n
                    "tabname" : "ab_settings_general_tab"//no i18n
                },{
                    "key" : translate("booking.purpose.config"),//no i18n
                    "tabname" : "ab_settings_purpose_tab"//no i18n
                },{
                    "key" : translate("common.history"),//no i18n
                    "tabname" : "ab_settings_history_tab"//no i18n
                }]
                renderhbs('#asset-settings-section','booking-settings-render-tab-section',{settingData:bookingSettingsObj.getAssetBookSettings,tabArr:tabArr,currSettingsTabName:currSettingsTabName,isRenderTab:true},null,'asset-booking');//NO I18N
                renderhbs('#settingsSpecId','booking-settings-render-tab-section',{settingData:bookingSettingsObj.getAssetBookSettings},null,'asset-booking')//NO I18N
                bookingSettingsObj.settingsTabClkFun(currSettingsTabName);
                if(sdp_app.IS_BOOKING_ENABLED && sdp_app.IS_ASSET_WIDGET_DISABLED){
                    jQuery("#template-customize-info").show();
                }
                /**Onclick event binding for product specifications */
                jQuery("#ab_settings_specification_tab").on('click',"[data-setname='settings_panel']",function(){
                    $asset_booking_settings.specDropdownFun(this);
                });
                jQuery("#ab_settings_specification_tab").on('keypress',"[data-setname='booking_general_keypress']",function(event){
                    $asset_booking_form.acceptOnlyNumbers(event,'bookingsettings');//NO I18N
                });
               
                /**End */
                
        };
        bookingSettingsObj.renderSpecificationFun=function(){
            bookingSettingsObj.storeSpecData = [];
            var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings';//NO I18N
            bookingSettingsObj.getAssetBookSettings = $asset_booking_form.getAllDataAtOnce(settingUrl,null,'asset_booking_settings')[0];//NO I18N
            jQuery('#a_b_s_enabled_toggle').prop('checked',bookingSettingsObj.getAssetBookSettings.is_booking_enabled);//NO I18N
            var parentElement = jQuery('#a_b_settings'),
                inputData = {
                    list_info:{
                        "start_index":1,//NO I18N
                        "row_count":1,//NO I18N
                        "filter_by": {//NO I18N
                            "name": "booking_settings"//NO I18N
                          },
                    }
                },

                getProductTypeList = $asset_booking_form.getAllDataAtOnce('booking_items/product_type',null,'product_type',inputData);//NO I18N
                if(getProductTypeList.length>0){
                
                bookingSettingsObj.productTypeArr = [{id:getProductTypeList[0].id,text:getProductTypeList[0].display_name}];
                var getData = bookingSettingsObj.getAssetBookSettings.is_booking_enabled ? bookingSettingsObj.divideArrForGeneralSettings(bookingSettingsObj.productTypeArr[0] && bookingSettingsObj.productTypeArr[0].id) : null;
                    
                renderhbs('#settingsSpecId','booking-settings-render-tab-section',{settingData:bookingSettingsObj.getAssetBookSettings,getSpecData:getData},null,'asset-booking')//NO I18N
                    if(bookingSettingsObj.getAssetBookSettings.is_booking_enabled){
                        getData[0].length>0 && fixedformfooter(document.getElementById("specificationSection"), document.querySelector("[data-name=form-footer]"), "fixedbtnpbottom=false");// No I18N
                        getData[0].length>0 && renderhbs('#specificationSection','booking-settings-render-tab-section',{getSpecData:getData,isSpecDetails:true},null,'asset-booking');//NO I18N
                    }
                    
                jQuery("#specificationSection").css("min-height",jQuery("#specificationSection").height()); // No I18N
                jQuery('#produtTypesList').sdp_select2({
                    value : bookingSettingsObj.productTypeArr[0],
                    width : 200,
                    cache:{},
                    multiple:false,
                    placeholder : translate("booking.select.asset"), // No I18N
                    url:[{
                        url:"/api/v3/booking_items/product_type",//NO I18N
                        field:'product_type',//NO I18N
                        list_info:{
                            "start_index":1,//NO I18N
                            "row_count":100,//NO I18N
                            "filter_by": {//NO I18N
                                "name": "booking_settings"//NO I18N
                              },
                        }
                    }],
                      processResults: function(search_data,data,field) {
                          data["text"] = data.display_name;
                          search_data.push(data);
                      }

                });
                bookingSettingsObj.divideArrForGeneralSettings(bookingSettingsObj.productTypeArr[0] && bookingSettingsObj.productTypeArr[0].id,true,$asset_booking_form.getSpecArr);
            }
                jQuery('#produtTypesList').on('change',function(){//NO I18N
                    jQuery('#preview-btn').prop('disabled',false);//NO I18N
                    var id = jQuery(this).select2('data').id,//NO I18N
                        getData = bookingSettingsObj.divideArrForGeneralSettings(id);
                        renderhbs('#specificationSection','booking-settings-render-tab-section',{getSpecData:getData,isSpecDetails:true},null,'asset-booking');//NO I18N
                        /**For hiding preview popup */
                        bookingSettingsObj.divideArrForGeneralSettings(id,true,$asset_booking_form.getSpecArr);
                });

                
                if(jQuery('[name=a_b_filters]:checked').length==0){
                    jQuery('#preview-btn').prop('disabled',true);//NO I18N
                }
                
        };
        bookingSettingsObj.renderSpecAfterDisOrEnable = function(){
                var CheckBtn = jQuery("#a_b_s_enabled_toggle").prop("checked");//NO I18N
                if(bookingSettingsObj.productTypeArr && bookingSettingsObj.productTypeArr.length>0){               
                    var getData = CheckBtn ? bookingSettingsObj.divideArrForGeneralSettings(bookingSettingsObj.productTypeArr[0] && bookingSettingsObj.productTypeArr[0].id) : null;
                    if(CheckBtn){
                        getData[0].length>0 && fixedformfooter(document.getElementById("specificationSection"), document.querySelector("[data-name=form-footer]"), "fixedbtnpbottom=false");// No I18N
                        getData[0].length>0 && renderhbs('#specificationSection','booking-settings-render-tab-section',{getSpecData:getData,isSpecDetails:true},null,'asset-booking');//NO I18N
                    }
                    
                }
        };
        bookingSettingsObj.toggleOnClickFun=function(ele){
            var parentElement = jQuery('#asset-settings-section'),
                toggleCls = jQuery(ele).hasClass('on'),//NO I18N
                inputEle = jQuery(ele).prev();
                var confirmMsg = "booking.enable.confirm";//No I18N
                if(toggleCls) {
                     confirmMsg = "booking.disable.confirm"; //No I18N
                }
                if(confirm(translate(confirmMsg))){
                    if(toggleCls) {
                        jQuery(ele).addClass('off').removeClass('on');
                        jQuery(inputEle).prop("checked",false);//NO I18N
                        parentElement.find('#ab_settings_specification_tab,#ab_settings_general_tab,#ab_settings_purpose_tab').addClass('disableDiv').end()
                                    .find('#toggleText').html(translate('sdp.admin.robo.disabled'));
                        parentElement.find('[name=toggleButton]').attr('title',translate('sdp.admin.robo.disabled'));
                        if(sdp_app.IS_ASSET_WIDGET_DISABLED){
                            jQuery("#template-customize-info").hide();
                        }
                        jQuery('#specificationSection').empty();

                    } else {

                        jQuery(ele).addClass('on').removeClass('off');
                        jQuery(inputEle).prop("checked",true);//NO I18N
                        parentElement.find('#ab_settings_specification_tab,#ab_settings_general_tab,#ab_settings_purpose_tab').removeClass('disableDiv').end()
                                    .find('#toggleText').html(translate('sdp.common.enabled'));
                        parentElement.find('[name=toggleButton]').attr('title',translate('sdp.common.enabled'));
                        if(sdp_app.IS_ASSET_WIDGET_DISABLED){
                            jQuery("#template-customize-info").show();
                        }
                    }
                    bookingSettingsObj.enableOrDisableConfig(bookingSettingsObj.getAssetBookSettings);
                    
                    
               }
        };
        bookingSettingsObj.settingsTabClkFun=function(currTab){
            var parentElement = jQuery('#asset-settings-section');
                var urlStr = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search; 
                switch (currTab) {
                    case "ab_settings_specification_tab"://no i18n
                        bookingSettingsObj.renderSpecificationFun();
                        urlStr += "#specification";//NO I18N
                        break;
                    case "ab_settings_general_tab"://no i18n
                        bookingSettingsObj.generalSettingsTemplate();
                        urlStr += "#general";//NO I18N
                        break;
                    case "ab_settings_purpose_tab"://no i18n
                        bookingSettingsObj.purposeConfigTemplate();
                        urlStr += "#purpose";//NO I18N
                        break;
                    case "ab_settings_history_tab"://no i18n
                        bookingSettingsObj.historyTabRender('asc','desc','asc');//NO I18N
                        urlStr += "#history";//NO I18N
                        break;
                }
                window.history.pushState({ path: urlStr }, '', urlStr);
                parentElement.find('#a_b_settings .sdtab-pane').addClass("hide");
                parentElement.find('#'+currTab).removeClass("hide");
                initTooltip('#asset-settings-section');//NO I18N
        };
        bookingSettingsObj.enableOrDisableConfig = function(getdata){
            var isCheck = jQuery('#a_b_s_enabled_toggle').prop('checked'),//NO I18N
                data = {
                    "asset_booking_setting": {//NO I18N
                        "is_booking_enabled": isCheck//NO I18N
                    }
                },
                message = isCheck ? translate('common.action.enabled',[translate('booking.settings')]) : translate('common.action.disabled',[translate('booking.settings')]);
                var settingUrl = (PORTALID && PORTALID>0) ? "asset_booking_settings/"+getdata.id+"?PORTALID="+PORTALID : "asset_booking_settings/"+getdata.id;//NO I18N
                $asset_booking_form.putAndPostOperation(settingUrl,"PUT",data,"settings",message);

        }
        bookingSettingsObj.divideArrForGeneralSettings = function(id,isPopup,getSpecifications,isFirstOpen){
            
            if(!getSpecifications || isFirstOpen){
                
                var getSpecifications = bookingSettingsObj.getSpecAndRelatedValues(id,isPopup);
                $asset_booking_settings.getAllPTRelatedSpecs=getSpecifications.slice();
            }
            
            var divider = Math.round(getSpecifications.length/2),
                temp = [],
                newSpecifications = "",
                spliceArr = [], removeEmptyValues = [];
                if(isPopup){
                    var specSpliceArr = [];
                    jQuery("#specificationSection").find("input:checkbox[data-spec-attr=a_b_filters]:checked").each(function(){
                        getCheckedBoxesValue(this)
                    });
                    jQuery("#specificationSection").find("input:checkbox[data-spec-attr=a_b_filters]:unchecked").each(function(){
                        getUncheckedBoxesValue(this);
                    });
                    function getCheckedBoxesValue(ele){
            
                        var id = jQuery(ele).attr('id');
                        if(bookingSettingsObj.storeSpecData.length>0){
                            jQuery.each(bookingSettingsObj.storeSpecData,function(index,field){
                                if(field && field.id==id){
                                    getSpecifications.splice(field.ind, 0, bookingSettingsObj.storeSpecData[index]);
                                    specSpliceArr.push(index);
                                }
                            });
                        }
                        removeEmptyValues = bookingSettingsObj.removeEmptyFromPreview(getSpecifications,id,removeEmptyValues);
                    }
                    function getUncheckedBoxesValue(ele){
                        var id = jQuery(ele).attr('id');
                        jQuery.each(getSpecifications,function(index,field){
                            if(field.id==id){
                                spliceArr.push(index);
                                bookingSettingsObj.pushRemovedSpecificationList(field.id,getSpecifications,index)
                            }
                        });
                    }
                    
                    $asset_booking_form.spliceArrFunction(specSpliceArr,bookingSettingsObj.storeSpecData);
                    spliceArr = spliceArr.concat(removeEmptyValues);
                    /**Sort array index values from asc to desc to splice */
                    spliceArr.sort(function(a, b){return a - b});
                    $asset_booking_form.spliceArrFunction(spliceArr,getSpecifications);
                    
                    if(getSpecifications.length==0){
                        jQuery("#preview-btn").prop("disabled",true);//no i18n
                    }else{
                        jQuery("#preview-btn").prop("disabled",false);//no i18n
                        divider = Math.round(getSpecifications.length/2);
                    }
                }

                temp.push(getSpecifications);

                newSpecifications = (getSpecifications.length>1) ? bookingSettingsObj.sliceIntoChunks(getSpecifications, divider) : temp;
                return newSpecifications;
        };
        bookingSettingsObj.removeEmptyFromPreview=function(getSpecifications,id,removeEmptyValues){
            jQuery.each(getSpecifications,function(index,field){    
                var currValueObj = field.getSpecValues || field.getPreviewValues; 
                if(field.id==id && currValueObj.length==0 && (removeEmptyValues.indexOf(index)==-1)){
                    removeEmptyValues.push(index);
                }
            });
            return removeEmptyValues;
        };
        bookingSettingsObj.pushRemovedSpecificationList = function(specId,getSpecifications,splIndex){
            
            var arrVal = bookingSettingsObj.storeSpecData;
            var checkSpec = false;
            if(arrVal.length>0){
                jQuery.each(arrVal, function(index,field){
                    if(specId==field.id){
                        checkSpec = true;
                    }
                });
                if(!checkSpec){
                    bookingSettingsObj.storeSpecData.push(getSpecifications[splIndex]);
                }
            }else{
                bookingSettingsObj.storeSpecData.push(getSpecifications[splIndex]);
            }
            
        };
        bookingSettingsObj.sliceIntoChunks = function(arr, chunkSize){
            var res = [];
                for (var i = 0; i < arr.length; i += chunkSize) {
                    var chunk = arr.slice(i, i + chunkSize);
                    res.push(chunk);
                }
                return res;
        };
        bookingSettingsObj.getSpecAndRelatedValues = function(id,isPopup){
            var inputData = {
                "product_type": {//NO I18N
                    "id": id//NO I18N
                  },

                "list_info": {//NO I18N
                    "row_count":100,//NO I18N
                    "get_total_count":true,//NO I18N
                    "filter_by": {//NO I18N
                        "name": "booking_settings"//NO I18N
                    }
                 }
            },
            getSpecifications = $asset_booking_form.getAllDataAtOnce('booking_fields/_get_values',null,'get_values',inputData);//NO I18N
            bookingSettingsObj.getStartIndex = [];
            bookingSettingsObj.getTotalCountSpecifications = [];
            var spliceSpecArr = [];
            var checkedBtn = jQuery('#a_b_s_enabled_toggle').prop('checked');//NO I18N
            if(checkedBtn){
                jQuery.each(getSpecifications, function(index,field){
                    var spliceArr = [];
                        if(field.field_name=="physical_memory"){
                            field.spliceVal = field.values.length;
                        }
                        if(field.values){
                            jQuery.each(field.values,function(currIndex,fieldVal){
                                if(fieldVal.value=="-"){
                                    spliceArr.push(currIndex);
                                    if(field.values.length==1){
                                        spliceSpecArr.push(index)
                                    }
                                }   
                            });
                            
                            if(spliceArr.length>0){
                                $asset_booking_form.spliceArrFunction(spliceArr,field.values);
                            }
                            getSpecifications[index]["specInfo"] = {id:field.id,start_index:field.values.length+1};
                           
                            if(isPopup){
                                getSpecifications[index]["getPreviewValues"] = field.values;
                            }else{
                                getSpecifications[index]["getSpecValues"] = field.values;
                            }   
                            
                            getSpecifications[index]["ind"] = index;
                        }else{
                            spliceSpecArr.push(index);
                        }
                    
                });
                if(spliceSpecArr.length>0){
                    $asset_booking_form.spliceArrFunction(spliceSpecArr,getSpecifications);
                }
            }
            $asset_booking_form.getSpecArr = getSpecifications;
            return getSpecifications;
        };
        //loading rules/groups/triggers while scroll 
	    bookingSettingsObj.specificationsLoadingWhileScroll= function(hasMoreRows) {
	    	var self = this;
            var checkMoreRows= hasMoreRows;
            setTimeout(function(){
                jQuery('.ab-spec-preview').on('scroll',function(){
                    if(checkMoreRows){
                        var specScroll = bookingSettingsObj.isScrollEvent;
                        var divHeight = jQuery(this).scrollTop() + jQuery(this).innerHeight();
                        var scrollHeight = jQuery(this)[0].scrollHeight;
                        // //Getting API call, whenver scroll reaches the bottom of the div and "has_more_rows" is true
                        if(Math.abs(divHeight - scrollHeight) <= 1) {
                            bookingSettingsObj.scrollHeight = divHeight;
                            var currEleIndex = jQuery(this).attr("data-key");
                            bookingSettingsObj.getStartIndex[currEleIndex] = bookingSettingsObj.getStartIndex[currEleIndex]+100;
                            $asset_booking_form.getSpecArr[currEleIndex].values = bookingSettingsObj.getTotalCountSpecifications[currEleIndex];
                            $asset_booking_form.getSpecArr[currEleIndex].getSpecValues = bookingSettingsObj.getTotalCountSpecifications[currEleIndex];
                            $asset_booking_form.seemoreInSpecification(null,'a_b_settings',true,null,jQuery(this))
                        }
                    }
                    
                });
            },400)
	    },
        bookingSettingsObj.openPreviewSelecterPopup = function(){
            jQuery('.ui-dialog').remove();
            var getCurrSettData = $asset_booking_settings.getAllPTRelatedSpecs;
            var id = jQuery('#produtTypesList').select2('data').id,// No I18N
                getData = bookingSettingsObj.divideArrForGeneralSettings(id,true,$asset_booking_form.getSpecArr,true);
                renderhbs('#specificationPopup','booking-settings-render-tab-section',{getSpecData:getData,isPopup:true,isSpecDetails:true},null,'asset-booking');//NO I18N
                jQuery('#specificationPopup').dialog({
                    width     : 850,
                    resizable : false,
                    minHeight : 550,
                    maxHeight : 550,
                    modal: true,
                    close:function(){
                        $asset_booking_settings.getAllPTRelatedSpecs = getCurrSettData;
                    }
                });
                jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
                initTooltip('.ui-dialog');//NO I18N
        };      
        bookingSettingsObj.saveSpecification = function(e){
            e.preventDefault();
            var checkedSpecArr = [],
                uncheckedSpecArr = [];

                jQuery("#specificationSection").find("input:checkbox[data-spec-attr=a_b_filters]:checked").each(function(){
                    checkedSpecArr.push(jQuery(this).attr('id'));
                });
                jQuery("#specificationSection").find("input:checkbox[data-spec-attr=a_b_filters]:unchecked").each(function(){
                    uncheckedSpecArr.push(jQuery(this).attr('id'));
                });
                checkedSpecArr = checkedSpecArr.join();
                uncheckedSpecArr = uncheckedSpecArr.join();
                checkedSpecArr.length>0 ? $asset_booking_form.putAndPostOperation("booking_fields?ids="+checkedSpecArr,"PUT",{booking_field:{"is_enabled":true}},uncheckedSpecArr.length==0 ? 'specifications' : null) : null;
                uncheckedSpecArr.length>0 ? $asset_booking_form.putAndPostOperation("booking_fields?ids="+uncheckedSpecArr,"PUT",{booking_field:{"is_enabled":false}},'specifications') : null;

        };
        bookingSettingsObj.generalSettingsTemplate = function(){
            var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings'; //NO I18N
            var getGeneralSettingsData = $asset_booking_form.getAllDataAtOnce(settingUrl,null,'asset_booking_settings')[0];// No I18N
                getGeneralSettingsData.splitHoursToDay = parseInt(getGeneralSettingsData.minimum_booking_interval_time / 24);
                getGeneralSettingsData.remainingHours = getGeneralSettingsData.minimum_booking_interval_time - (getGeneralSettingsData.splitHoursToDay *24);
                renderhbs('#ab_settings_general_tab','booking-settings-render-tab-section',{settingsData:getGeneralSettingsData,isGeneSet:true},null,'asset-booking');// No I18N
                bookingSettingsObj.validateSettings();
        };
        bookingSettingsObj.validateSettings=function(){
            var rules = {
                max:{
                    required : true
                },
                advmin: {
                    max:function() {
                        return parseInt(jQuery('#advmax').val()-1);
                    },
                    required : true
                },
                advmax: {
                    min:function() {
                        return parseInt(parseInt(jQuery('#advmin').val())+parseInt(1));
                    },
                    required : true
                },
                intervalday:{
                    required:true
                }

            };
            var messages = {
                max:{
                    required : translate("booking.settings.fieldmandatory")
                },
                advmin: {
                    max : function(){
                        var getCurrVal = jQuery('#advmin').val();
                        if(getCurrVal>366){
                            return translate("ae.asset.max.num.limit",[366])
                        }else{
                            return translate("booking.min.value.msg")
                        }
                    },
                    required : translate("booking.settings.fieldmandatory")
                },
                advmax: {
                    min : function(){
                        var getCurrVal = jQuery('#advmax').val();
                        if(getCurrVal>366){
                            return translate("ae.asset.max.num.limit",[366])
                        }else{
                            return translate("booking.max.value.msg")
                        } 
                    },
                    required : translate("booking.settings.fieldmandatory")
                },
                intervalday:{
                    required : translate("booking.settings.fieldmandatory")
                }
            };
            jQuery("#ab_settings_general_tab").find('[name="a_b_general_settings_form"]').validate({
                rules: rules,
                messages: messages,
                errorClass: 'text-danger', //No I18N
                errorElement: 'span', //No i18N
                errorPlacement: function(error, element) {
                    if (element.parents(".input-group").length > 0) {
                        element = element.parents(".input-group"); //No I18N
                    } else if ((element.attr("type") === "checkbox" || element.attr("type") === "radio" ) && element.parent("label").length > 0) { //NO I18N
                        element = element.parent("label"); //NO I18N
                    }
                    error.insertAfter(element);
                    error.addClass("alert alert-danger p5 fl m0");

                    error.css({'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + element.height() + 10) + 'px'}); //No i18N
                }
            });
        };
        bookingSettingsObj.saveGeneralSettingsFun = function(e){
            var isValid = jQuery("#ab_settings_general_tab").find('[name="a_b_general_settings_form"]').valid(),
                parentElement = jQuery('#asset-settings-section'),
                settingsId = parentElement.find('#general').attr('data-id'),
                maximumVal = parentElement.find('#max').val(),
                advMaxVal = parentElement.find('#advmax').val(),
                advMinVal = parentElement.find('#advmin').val(),
                inDayVal = parentElement.find('#intervalday').val();

                if(!isValid){
                    return true;
                }
                var inputData = {
                    "asset_booking_setting":{// No I18N
                        "allowed_maximum_booking_days"  : maximumVal,// No I18N
                        "advance_booking_maximum_days"  : advMaxVal,// No I18N
                        "advance_booking_minimum_days"  : advMinVal,// No I18N
                        "minimum_booking_interval_time" : inDayVal// No I18N
                    }
                };
                var settingUrl = (PORTALID && PORTALID>0) ? "asset_booking_settings/"+settingsId+"?PORTALID="+PORTALID : "asset_booking_settings/"+settingsId;//NO I18N
                $asset_booking_form.putAndPostOperation(settingUrl,"PUT",inputData,'genspecifications',translate("api.updated.success",[translate("booking.settings")]));
                e.preventDefault();
        };
        bookingSettingsObj.purposeConfigTemplate = function(){
            renderhbs('#ab_settings_purpose_tab','booking-settings-render-tab-section',{isConfigTemp:true},null,'asset-booking');// No I18N
            bookingSettingsObj.constructDataForPurposeTable();
            jQuery('#ab_settings_purpose_tab').off('click').on('click','#purposeconfig_delete',function(e){//NO I18N
                bookingSettingsObj.deletePurposeConfig(null,null);
            });

        };
        bookingSettingsObj.constructDataForPurposeTable = function(seachCriteria){
            var fields_required = {
                    "deleted":"",//NO I18N
                    "name":""//NO I18N
                };
            var nameWidth = jQuery('#settingsTabBtn').width() - 100;
                var table_content = {
                "purposeconfig_head_chk" : { // No I18N
                    "type"    : "checkbox",//NO I18N
                    "default" : true,//NO I18N
                    "width"   : "50px",//NO I18N
                    "column_settings": {"view_type": "row", "position": 1}, //No I18N
                    "hide_label": true, //No I18N
                    "dataCelltransformer" : $asset_booking_list.constructCheckBoxCell //NO I18N
                },
                "deleted":{// No I18N
                    "column_settings": {"view_type": "row", "rowposition": 1,"position":2}, //No I18N
                    "hide_label": true, //No I18N
                    dataCelltransformer: bookingSettingsObj.constructActiveOrInactive
                },
                "name":{// No I18N
                    "column_settings": {"view_type": "row", "rowposition": 1,"position":3}, //No I18N
                    dataCelltransformer: bookingSettingsObj.constructNameCell,
                    "hide_label": true, //No I18N
                    "width":nameWidth+"px"//NO I18N
                }
            }
            var urlHolder = {
                url               : 'booking_purposes',//NO I18N
                entity_name       : 'booking_purposes',//NO I18N
                tableHolder       : "purposeconfig",// No I18N
                paginationEnabled : true,
                searchEnabled     : false,
                sortingEnabled    : false,
                personalize_key   : "booking_purposes",//NO I18N
                callbackAfterBodyRender : bookingSettingsObj.callbackAfterBodyRender
            };

            var addlOptions = {
                view : "kanban",//NO I18N
                view_mode : "linear",//NO I18N
                nodataString: '<div class="pos-rel tc p10">'+translate("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg")+'</div>',
                width:"100%",
                height:(jQuery(window).height() - 350),
                "bulkSelectionSetting" : {//NO I18N
                    enabled: true
                },
                column_settings : {
                    "assign_label_width": false,//No I18N
                    "assign_content_width":false,//No I18N
                    "columns": [{//No I18N
                        "size": 1,//No I18N
                        "width": "40px"//NO I18N
                    }, {
                        "size": 1,//No I18N
                        "width": "50px"//NO I18N
                    }, {
                        "size": 10,//No I18N
                    }]
                }
            }
            bookingSettingsObj.purposeTableComp = $asset_booking_list.constructTableComponent(fields_required,table_content,urlHolder,seachCriteria,addlOptions);
        };
        bookingSettingsObj.constructNameCell = function(tableData){
            var getPurEleFromTemp = renderhbs('<span>','booking-settings-render-tab-section',{tableData:tableData,isPurConfigName:true},null,'asset-booking',null,null,null,true);
            //apend element here so no need to encode
            return '<div id="abs_purpose_'+e_attr(tableData.row_data.id)+'">'+getPurEleFromTemp+'</div>';
        };
        bookingSettingsObj.cancelInlinePurpose=function(closeBtn){
            var closeId = jQuery(closeBtn).attr('id').split("_")[1],
                parentElement = jQuery("#a_b_settings"),
                val = jQuery('#purname_'+closeId).text();
                parentElement.find('#purposeComment-error').remove();
                parentElement.find('#purparent_'+closeId).show().end()
                             .find('#puredit_'+closeId).hide().find('input').val(e_attr(val));
        };
        bookingSettingsObj.saveInlinePurpose=function(saveBtn,e){
            var saveId = jQuery(saveBtn).attr('id').split("_")[1];
                bookingSettingsObj.savePurposeConfiguration(e,saveId);
        };
        bookingSettingsObj.purposeNameClickFunc=function(currELe){
            var currId = jQuery(currELe).attr('id').split("_")[1],
                parentElement = jQuery("#a_b_settings");
                parentElement.find('#puredit_'+currId).show().end()
                             .find('#purparent_'+currId).hide();
                //settimeout added for gettting focus on input element
                setTimeout(function(){
                    parentElement.find("#purposeForm_"+currId+" [name=purposeComment]").focus();
                },100)
        };
        bookingSettingsObj.constructActiveOrInactive=function(tableData){
            var chkBox = '<input value="'+tableData.row_data.id+'" data-id="togg_'+tableData.row_data.id+'" type="checkbox" data-toggle checked=""  class="togglechk" aria-label="'+translate("sdp.common.toggle")+'" nonce="'+sdpNonce+'"/>';
            var toggleTitleName = translate('filter.active');
            if(tableData.row_data.deleted){
                chkBox = '<input value="'+tableData.row_data.id+'" aria-label="'+translate("sdp.common.toggle")+'" type="checkbox" nonce="'+sdpNonce+'" data-toggle data-id="togg_'+tableData.row_data.id+'" class="togglechk"/>';
                toggleTitleName = translate('common.inactive.entity');
            }
            return '<label class="disp-iflex mr10" title='+toggleTitleName+' rel="uitip">'+chkBox+'<span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
        };
        bookingSettingsObj.moveToActiveorInactive=function(inputEle){
            var inputEleChk = jQuery(inputEle).prop('checked'),//NO I18N
                inputEleId = jQuery(inputEle).val();
                if(inputEleChk){
                    bookingSettingsObj.markAsInactiveToActive(inputEleId);
                }else{
                    bookingSettingsObj.deletePurposeConfig(inputEleId,inputEle);
                }
        };
        //Mark purpose as active to inactive while clicking toggle icon
        bookingSettingsObj.markAsInactiveToActive=function(eid){
            var getSelIds = typeof eid!="object" && eid || bookingSettingsObj.purposeTableComp.bulkSelect.getSelectedIDs().join();//NO I18N
                $asset_booking_form.putAndPostOperation("booking_purposes/_restore_from_trash?ids="+getSelIds,"PUT",null,'purpose');
        };
        //Render function while open purpose tab in settings
        bookingSettingsObj.openPurposeConfiguration = function(e,id){
            e.preventDefault();
            var purposeData = id ? $asset_booking_form.getAllDataAtOnce('booking_purposes/'+id,null,'booking_purpose')[0] : null;// No I18N
                renderhbs('#purposenew_form','booking-settings-render-tab-section',{data:purposeData,isPurPopup:true},null,'asset-booking');// No I18N
                jQuery('#purposenew_form').dialog({
                    width     : 520,
                    resizable : false,
                    minHeight : 100,
                    modal     : true
                });
                jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
                initTooltip('.ui-dialog');//NO I18N
                //settimeout added for gettting focus on input element
                setTimeout(function(){
                    jQuery("#purposeComment").focus();
                }, 100);
        };
        bookingSettingsObj.processHistory=function(arg){
            var assetBookingSettingsMeta = $asset_booking_form.getAllDataAtOnce('asset_booking_settings/_metainfo',null,'metainfo').fields;//NO I18N
            var getFieldDiff = "";
            arg.forEach(function(fields,index){
                var currPurposeName = fields.booking_purpose && fields.booking_purpose.name;
                if(fields.operation=="edit"){
                    fields.display_operation_name = translate('sdp.requests.history.updated');
                    var entityName = fields.entity.name;
                    getFieldDiff = fields.diff;
                    fields.diff.forEach(function(fieldsVal,fieldInd){
                        
                        if(entityName=="booking_field"){
                            if(fieldsVal.field.name=="display_key"){
                                
                                fieldsVal.field.display_name = translate('sdp.admin.requesttemplate.insertfield.constraint.message.part1');
                            }else if(fieldsVal.field.name=="product_type_display_name"){
                                fieldsVal.field.display_name = translate('sdp.admin.product.listview.type');
                            }else if(fieldsVal.field.name=="is_enabled"){
                                var findProductFieldName = getFieldDiff.find(e => e.field.name === 'display_key');
                                fieldsVal.field.display_name = translate(findProductFieldName.current_value);
                            }
                            fieldsVal.current_value = translate(fieldsVal.current_value)
                        }else if(entityName=="asset_booking_setting"){// No I18N
                            fieldsVal.field.display_name =  assetBookingSettingsMeta[fieldsVal.field.name].display_name;
                        }else if(entityName=="booking_purpose"){// No I18N
                            fieldsVal.field.display_name = translate('common.purpose');
                        }
                        if(fieldsVal.field.name=="deleted"){
                            
                            var previousVal = fieldsVal.previous_value,
                                currentVal = fieldsVal.current_value,
                                preDispText = previousVal=="true" ? translate("sdp.project.projectstatusattribute.isdeleted") : translate("sdp.contract.listViewI.active"),
                                currDispText = currentVal=="true" ? translate("sdp.project.projectstatusattribute.isdeleted") : translate("sdp.contract.listViewI.active");
                                //assign display value based on response
                                fieldsVal.previous_value = preDispText;
                                fieldsVal.current_value = currDispText;
                                fieldsVal.field.display_name += " : "+currPurposeName;
                        }
                    });
                }
                if(fields.operation=="add"){
                    fields.display_operation_name = translate('sdp.history.added');
                    if(fields.entity.name=="booking_purpose"){
                        fields.diff = [];
                        fields.diff.push({field: {display_name:translate('common.purpose'),name: fields.entity.name}, previous_value: false, current_value: fields.booking_purpose.name})
                    }
                }
                fields.className = "list-sprite icon-sm notes-icon2 right2"; 
            });
        };
        bookingSettingsObj.purposeCloseBtnFun = function(e){
            e.preventDefault();
            jQuery('#purposenew_form').dialog('close');// No I18N
            jQuery(".ui-dialog").remove();
        };
        //Execute while saving purpose config in settings tab
        bookingSettingsObj.savePurposeConfiguration=function(e,id){
            
            
            var rules =  {
                    'purposeComment': {//no i18n
                        minlength:2
                    }
                }
           var messages = {
               'purposeComment': {//no i18n
                   minlength: translate("sdp.api.error.constraint.min_length",["","2"])
               }
           }
           var currFormName = id ? "purposeForm_"+id : "purposeForm";//no i18n
           $asset_booking_reschedule.validateForm(currFormName,rules,messages);
            var isValidForm = jQuery('#'+currFormName).valid();
            if(isValidForm){
                e.preventDefault();
                var purposeName = id ? jQuery('#puredit_'+id).find('input').val() : jQuery('#purposeComment').val();// No I18N
                
                var inputData = {
                    "booking_purpose":{// No I18N
                        "name": trim(purposeName) // No I18N
                    }
                }
                if(id){
                    $asset_booking_form.putAndPostOperation("booking_purposes/"+id,"PUT",inputData,'purpose');
                }else{
                    $asset_booking_form.putAndPostOperation("booking_purposes","POST",inputData,'purpose');
                }
            }else{
                return true;
            }
            
        };
        //function for deleting purpose config in settings page while clicking delete function
        bookingSettingsObj.deletePurposeConfig=function(eid,ele){
            var confirmDel = confirm(translate("booking.purpose.confirm")); //No I18N
                if(confirmDel) {
                    var selIds = eid || bookingSettingsObj.purposeTableComp.bulkSelect.getSelectedIDs().join();
                        sdpAjax({
                            url: "/api/v3/booking_purposes/_move_to_trash?ids="+selIds, //No I18N
                            type:"DELETE",// No I18N
                            async: true,
                            cache:false,
                            success:function(){
                                showalert('success', translate('api.deleted.success', [translate("booking.purpose")]), "isAutoHide=true"); // No I18N
                                bookingSettingsObj.purposeTableComp.refreshTable();
                            }
                        });    
                }else{
                    jQuery(ele).prop('checked',true); //No I18N
                }
        };
        //History tab render function in booking settings
        bookingSettingsObj.historyTabRender=function(){
            var container = "history-content-section",//NO I18N
                url = "/common/ViewHistory.jsp?id=1&module=asset_booking_settings&key=setting_history_sort_order"; //No I18N
                jQuery("#" + container).html('<div class="pos-rel">' + ajaxBar() + '</div>').load(url);
                setTimeout(function(){
                    if(jQuery('#history_content').prev().hasClass("pos-rel")){
                        jQuery('#history_content').prev().remove();
                    }
                },100)
        };
        //function execute while changing active/inactive filter in purpose config in booking settings 
        bookingSettingsObj.changeFilter= function(isDeleted,filterName,isActive) {
            var parentElement =jQuery('#a_b_settings');
                if(isActive=="inactive"){
                    var data = {
                        "filter_by": {//NO I18N
                          "name": "trash"//NO I18N
                        }
                    }
                    parentElement.find('#activeSection').hide().end()
                                 .find('#inactiveSection').show();
                    bookingSettingsObj.constructDataForPurposeTable(data);
                }else{
                    parentElement.find('#activeSection').show().end()
                                 .find('#inactiveSection').hide();
                    bookingSettingsObj.constructDataForPurposeTable();
                }
                
                parentElement.find('#filterViewMenu').html('<span class="dd mt0 fr"><strong class="caret"></strong></span>'+translate(filterName,[translate('booking.purpose')]));//NO I18N
                parentElement.find('#filtersList').find('li').removeClass('active');
                parentElement.find('#'+isActive).addClass('active');
        };
        //specification dropdown in booking settings page
        bookingSettingsObj.specDropdownFun=function(ele){
            var parentElement = jQuery('#asset-settings-section'),
                currEle = parentElement.find(ele).attr('data-id'),
                numberOfChecked = '',
                isChecked = jQuery(ele).find('input').prop('checked');// No I18N

                if(isChecked){
                    parentElement.find("#ul_"+currEle).show();
                }else{
                    parentElement.find("#ul_"+currEle).hide();
                }
                numberOfChecked = jQuery('#specificationSection').find('[data-spec-attr="a_b_filters"]:checked').length;
                if(numberOfChecked==0){
                    jQuery('#preview-btn').prop('disabled',true);//NO I18N
                }else{
                    jQuery('#preview-btn').prop('disabled',false);//NO I18N
                }
                var id = jQuery('#produtTypesList').select2('data').id;//no i18n
                bookingSettingsObj.divideArrForGeneralSettings(id,true,$asset_booking_form.getSpecArr);
        };
        bookingSettingsObj.callbackAfterBodyRender=function(){
            jQuery("#purposeconfig_div").off('click','[data-toggle]').on('click','[data-toggle]',function(){// No I18N
                $asset_booking_settings.moveToActiveorInactive(this)
            });
        }
        return bookingSettingsObj;
}());
