/* $Id$ */
var $asset_booking_reschedule = (function(){
    "use strict";//NO I18N
    var reschBookObj = {};
    //function render while loading reschedule popup
    reschBookObj.loadBookedAssets = function(){
        //added for loading symbol
        jQuery("#assetBookingSection").html('<div class="ab-main-blk"><div class="widget-subhead"><div class="disp-c vtop"><strong>'+translate("booked.assets")+'</strong></div></div></div><div class="pos-rel" id="common_load_bar" style="top:70px;">' + ajaxBar() + '</div>');// No I18N
        reschBookObj.getAssetBookingDatas = [];
        //remove old url and include url as per booking feature
        var inputData = {"list_info":{"start_index":1,"row_count":100}};//NO I18N
        reschBookObj.getAllBookingItemsAtOnce("asset_bookings",inputData,function(asset_booking_resp){//NO I18N
            reschBookObj.getAllAssetBookingsRespCallbak(asset_booking_resp);
        });
    };
    reschBookObj.getAllAssetBookingsRespCallbak = function(response){
        var getBookedRecords = [];
        if(response!=null &&  response.length>0){
            var checkUser = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
            getBookedRecords = response;
            reschBookObj.entityData = [];
            reschBookObj.getAllBookingItems = [];
            //get call for booking items
            var inputData = {"list_info":{"start_index":1,"row_count":100,"search_criteria":{"field":"status","condition":"is","value":null,"logical_operator":"OR",children:[{"field":"status.internal_name","condition":"!=","values":["Canceled","Loaned"],"logical_operator":"OR"}]}}};//NO I18N
            reschBookObj.getAllBookingItemsAtOnce("booking_items",inputData,function(booking_item_resp){//NO I18N
                getBookedRecords.booking_items_links = [];
                getBookedRecords.asset_bookings_links = [];
                //get booking items for selected booking based on id
                for(var i=0;i<getBookedRecords.length;i++){
                    getBookedRecords[i].booking_items = [];
                    getBookedRecords.asset_bookings_links.push(getBookedRecords[i].id);
                    for(var b=0;b<reschBookObj.getAllBookingItems.length;b++){
                        if(reschBookObj.getAllBookingItems[b].booking.id==getBookedRecords[i].id){
                            getBookedRecords[i].booking_items.push(reschBookObj.getAllBookingItems[b]);
                            getBookedRecords.booking_items_links.push(reschBookObj.getAllBookingItems[b].id);
                        }
                    }       
                }
                
                var getScheduleAllowedVal=[],
                    getDelAllowedVal=[];
                if(reschBookObj.getAssetBookingDatas.length>0 && reschBookObj.getAllBookingItems.length>0){
                    for(var i=0;i<getBookedRecords.asset_bookings_links.length;i=i+100){
                        var getHunAssetBook = getBookedRecords.asset_bookings_links.slice(i,i+100);
                        var joinGetAssetBookingLinks = getHunAssetBook.join();
                        getScheduleAllowedVal = getScheduleAllowedVal.concat(joinGetAssetBookingLinks && reschBookObj.ajaxFun('asset_bookings/_links?ids='+joinGetAssetBookingLinks,null,'_links'));//NO I18N
                    
                    }
                    if(!checkUser){
                        for(var i=0;i<getBookedRecords.booking_items_links.length;i=i+100){
                            var getHunBookItems = getBookedRecords.booking_items_links.slice(i,i+100);
                            var joinGetBookedItemsLinks = getHunBookItems.join();
                            getDelAllowedVal = getDelAllowedVal.concat(joinGetBookedItemsLinks && reschBookObj.ajaxFun('booking_items/_links?ids='+joinGetBookedItemsLinks,null,'_links'));//NO I18N
                        
                        }
                    }
                    
                    //Get All links at once based on that display cancel and reschedule icon
                    if(getBookedRecords.asset_bookings_links.length>0){
                        //avoid network call and use data stored in getAssetBookingDatas by getting once 
                        for(var i=0;i<getBookedRecords.length;i++){
                            var getCurrAssetBookLink = getScheduleAllowedVal.find(function(fld){
                                if(getBookedRecords[i].id==fld.id){
                                    fld.links.forEach(function(subfields,subindex){
                                        if(subfields.name=="reschedule"){
                                            getBookedRecords[i].reschedule_allowedval = true;
                                        }
                                    });
                                }
                            })
                            if(getBookedRecords.booking_items_links.length>0){
                                for(var j=0;j<getBookedRecords[i].booking_items.length;j++){
                                    var getCurrBookItemLink = getDelAllowedVal.find(function(fld){
                                        if(getBookedRecords[i].booking_items[j].id==fld.id){
                                            fld.links.forEach(function(subfields,subindex){
                                                if(subfields.name=="cancel"){
                                                    getBookedRecords[i].booking_items[j].cancel_allowedval = true;
                                                }
                                            });
                                        } 
                                    });
                                }
                            }
                            
                        }
                    } 
                }
               
                if(!checkUser){
                    renderhbs("#assetBookingSection","sdpbooked-assets",{bookingData:getBookedRecords}, false, "home_requester");//NO I18N
                    jQuery("#sdphome-Assets-placeholder .widget-panel").scrollTop(reschBookObj.getAssetCurrScroll);
                }
                initTooltip('#assetBookingSection');//no i18n
            });
            jQuery('#assetBookingSection').next().hide();
        }else{
            jQuery('#assetBookingSection').html("").next().show();
            jQuery("#common_load_bar").remove();
        }
        var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings';//NO I18N
        reschBookObj.getAssetBookSettings = reschBookObj.ajaxFun(settingUrl,null,'asset_booking_settings')[0];//NO I18N
        initTooltip('#assetBookingSection');//no i18n
        setTimeout(function() { $extFrame.setOptions('#assetBookingSection'); }, 100);
    }
    //ajax function for getting all data at once by using has_more_rows
    reschBookObj.getAllBookingItemsAtOnce=function(url,inputData,callback){
        var getCurrEleVal = [];
        var currObjName = url=="asset_bookings" ? "getAssetBookingDatas" : "getAllBookingItems"; //NO I18N
        getCurrEleVal = getAjaxResponse(inputData);
        function getAjaxResponse(inputData){
            sdpAjax({
                url:'/api/v3/'+url,//NO I18N
                data:sdpAjaxInputData(inputData),
                async:true,
                success: function(response)
                {
                    reschBookObj[currObjName] = reschBookObj[currObjName].concat(response[url]);
                    if(response.list_info && response.list_info.has_more_rows == true){
                        inputData.list_info.start_index = reschBookObj[currObjName].length + 1;
                        getCurrEleVal = getAjaxResponse(inputData)  

                    }else{
                        if(callback){
                            callback(reschBookObj[currObjName]);
                        }
                    }
                }
            });
        }
    };
    reschBookObj.rescheduleBookedAssets=function(e,popupWidth){
        jQuery('.ui-dialog,#ast_desc_remng_cnt').remove();
        var eleId = jQuery(e.target).attr('data-asset-id');
        var checkUser = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
        // var currPageAssetBookStore = checkUser ? "$asset_booking_details.getBookingSectionDetails.asset_booking" : "reschBookObj.getAssetBookingDatas";//NO I18N
        
        var selBookedAssetData = "";
            if(checkUser){
                selBookedAssetData =  $asset_booking_details.getBookingSectionDetails.asset_booking;
            }else{
                selBookedAssetData =  reschBookObj.getAssetBookingDatas.find(e => e.id === eleId);
            }
           
        //    var selBookingAssets = checkUser ? selBookedAssetData.booked_assets : reschBookObj.getAllBookingItems,
        //     pushAssetArr = [];
        //     var bId = jQuery('#loanDialog').attr('data-book-id');
            reschBookObj.selBookedAssetData = selBookedAssetData;
            var calenderLoop = [{
                "name1" : "rescheduleStartTime",//no i18n
                "name2" : "rescheduleEndTime", //no i18n
                "key"  :translate("sdp.common.startdate"),//no i18n
                "displayval"  : selBookedAssetData.start_time.display_value,//no i18n
                "val"  : selBookedAssetData.start_time.value,//no i18n
                "elename":"start_date",//no i18n
                "eleid":"calStartTime",//no i18n
                "label" :"sdp.common.from",//no i18n
                "addl" :null//no i18n
            },{
                "name1" : "rescheduleEndTime",//no i18n
                "name2" : "rescheduleStartTime",//no i18n
                "key"  :  translate("sdp.common.expenddate"),//no i18n
                "displayval"  : selBookedAssetData.end_time.display_value,//no i18n
                "val"  : selBookedAssetData.end_time.value,//no i18n
                "elename":"end_date",//no i18n
                "eleid":"calEndTime",//no i18n
                "label" :"sdp.common.to",//no i18n
                "addl" :"less"//no i18n
            }];
            var rescheduleCont = "booking-details-page-reschedule-popup";//no i18n
            
            if(checkUser){
                renderhbs("#reschedulePopup",rescheduleCont,{assetData:selBookedAssetData,calLoop:calenderLoop},null,'asset-booking');//NO I18N
            }else{
                renderhbs("#reschedulePopup","reschedulePopupDialog",{assetData:selBookedAssetData,calLoop:calenderLoop}, false, "home_requester");//NO I18N
            }
           

            jQuery('#reschedule').dialog({
                width     : popupWidth || 750,
                resizable : false,
                modal: true,
                close:function(){
                    $asset_booking_reschedule.popupCancelFun();
                },
				open: function(){
					initTooltip('#reschedule'); //NO I18N
				}
            });
            jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
            initTooltip('.ui-dialog');//NO I18N
            showDescriptionRemainingCount('#reschedule-comment');//NO I18N
    };
    reschBookObj.rescheduleCalenderValidateFun = function(){
        var parentElement = jQuery('#reschedule,#reschedule-btn'),
            startVal = parentElement.find('#rescheduleStartTime').val(),
            endVal = parentElement.find('#rescheduleEndTime').val(),
            commmetVal = parentElement.find('#reschedule-comment').val(),
            oldData = reschBookObj.selBookedAssetData;
        if(startVal!=oldData && oldData.start_time.value || endVal!=oldData && oldData.end_time.value || (commmetVal && commmetVal!=oldData.comments)){
            jQuery('#rescheduled,#reschedule-btn').prop("disabled",false);//NO I18N
        }else{
            jQuery('#rescheduled,#reschedule-btn').prop("disabled",true);//NO I18N
        }
    };
    //Execute function while saving - changing time and reschedule booking 
    reschBookObj.rescheduleSaveFun=function(getPage,e){
        reschBookObj.getAssetCurrScroll = jQuery("#sdphome-Assets-placeholder .widget-panel").scrollTop();
        e.preventDefault();
        var saveBtn = jQuery("#rescheduled"),
            checkUser = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
        inProgressBtn(saveBtn, translate("sdp.asset.loan.save.inProgress"), true);

        reschBookObj.validateForm('rescheduleForm');//NO I18N
        var isValid = jQuery('#rescheduleForm').valid();
        if(!isValid){
            return true;
        }
        var parentElement = jQuery('#reschedule'),
            rescheduleId = parentElement.attr('data-asset-id'),
            startVal = parentElement.find('#rescheduleStartTime').val(),
            startDisVal = parentElement.find('#rescheduleStartTime_Display').val(),
            endVal = parentElement.find('#rescheduleEndTime').val(),
            endDisVal = parentElement.find('#rescheduleEndTime_Display').val(),
            commentsVal = parentElement.find('#reschedule-comment').val(),
            data = {
                "start_time": {//NO I18N
                    "value": startVal,//NO I18N
                    "display_value": startDisVal//NO I18N
                },
                "end_time": {//NO I18N
                    "value": endVal,//NO I18N
                    "display_value": endDisVal//NO I18N
                },
                "comments": commentsVal//NO I18N
            };

            reschBookObj.putAndPostOperation("asset_bookings/"+rescheduleId+"/_reschedule","PUT",data,'rescheduled',"booking.reschedule.success");
            //!getPage && $asset_booking_reschedule.loadBookedAssets();
            // if(checkUser){
            //     getPage && renderhbs('#renderDate','booking-details-page-list-view',{start_disVal:startDisVal,end_disVal:endDisVal},null,'asset-booking');//NO I18N
            //     //update start and end time data for reusing data without getting by api call
            //     $asset_booking_details.getBookingSectionDetails.asset_booking.start_time = {
            //         "value": startVal,//NO I18N
            //         "display_value": startDisVal//NO I18N
            //     } 
            //     $asset_booking_details.getBookingSectionDetails.asset_booking.end_time = {
            //         "value": endVal,//NO I18N
            //         "display_value": endDisVal//NO I18N
            //     } 
            // }else{
            //     getPage && renderhbs('#renderDate','dateTemplate',{start_disVal:startDisVal,end_disVal:endDisVal});//NO I18N
            // }
            
    };
    //trigger function while jquery dialog popup close event
    reschBookObj.popupCancelFun=function(){
        jQuery('.ui-dialog .ui-dialog-titlebar-close').trigger("click");
        jQuery('.ui-dialog,#common_load_bar').remove();
    };
    reschBookObj.deleteBookedAssets=function(ele){
        var delAssetId = jQuery(ele).attr('data-canasset-id'),
            input_data={
                "comments": "Event Cancelled"//NO I18N
            }

            showconfirm(true,
            "title=" + translate("booking.cancel") + "," + //No I18N
            "message=" + translate("booked.asset.cancel.alert.msg") + "," +   //No I18N
            "submitbutton=" + translate("sdp.admin.translation.proceed") + "," +    //No I18N
            "cancelbutton=" + translate("sdp.wotopo.popup.back") + "," + //No I18N
            "closebutton=yes," +    //No I18N
            "closeOnEscKey=yes", function(didConfirm) { //No I18N
                if(didConfirm) {
                    reschBookObj.getAssetCurrScroll = jQuery("#sdphome-Assets-placeholder .widget-panel").scrollTop();
                    reschBookObj.putAndPostOperation("booking_items/"+delAssetId+"/_cancel","PUT",input_data,'cancel_booking',"booking.cancel.success");
                }
            });
            initTooltip('#asset-bookings-section');//NO I18N
    };
    //ajax function to get data based on url
    reschBookObj.ajaxFun=function(url,moduleid,entityName,inputData){
        var url = moduleid ? url+'/'+moduleid : url;
        var entityData = [];
        var responseObj = "";
        sdpAjax({
            url:'/api/v3/'+url,//NO I18N
            cache: false,
            async: false,
            data:sdpAjaxInputData(inputData),
            success: function(response)
            {
                responseObj = entityName ? response[entityName] : (url.includes("/") ? response : response[url]);
                if(!moduleid && response.list_info && response.list_info.has_more_rows == true && inputData && inputData.list_info){
                    if(entityName == "get_values") {
                        inputData.list_info.row_count=100;
                    }
                    inputData.list_info.start_index = entityData.length + 1;
                }
            }
        });
        entityData = entityData.concat(responseObj);
        return entityData;
    };
    reschBookObj.spliceArrFunction=function(indexArr,dataArr){
        var reversed = indexArr.reverse();
            jQuery.each(reversed,function(currIndex,fieldVal){
                dataArr && dataArr.splice(fieldVal,1);
            });
            return dataArr;
    };
    reschBookObj.validateForm= function(formId,rules,messages) {
        var rules = rules ? rules : {
                start_date: {
                    required: true
                },
                end_date: {
                    required: true
                },
            },
            messages = messages ? messages : {
                start_date: {
                    required: translate("booking.start.date.validation.msg"),
                },
                end_date: {
                    required: translate("booking.end.date.validation.msg")
                },
            },
            form = jQuery('#'+formId);

            var validator = form.validate({
                rules: rules,
                messages: messages,
                ignore: [],
                errorClass: 'text-danger', //No I18N
                errorElement: 'span', //No i18N
                errorPlacement: function(error, element) {
                    var eleId = element.prev().attr('id');
                        if (element.parents(".input-group").length > 0) {
                          element = element.parents(".input-group"); //No I18N
                        }
                        error.insertAfter(element);
                        error.addClass("alert alert-danger p5 fl m0");

                        if(eleId=="calenEndTime" || eleId=="rescheduleEndTime"){
                            error.attr('style', 'margin-left: 15px !important'); //No i18N
                        }
                        error.css({'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + element.height() + 10) + 'px'}); //No i18N
                }
            });
            validator.resetForm();//reset validation.
    };
    //common function for performing (put,post,delete) operation in booking feature
    reschBookObj.putAndPostOperation=function(url,type,input_data,entityName,getmessage){
        sdpAjax({
            url     : "/api/v3/"+url, //No I18N
            type    : type,
            async   : true,
            data    : input_data ? sdpAjaxInputData(input_data) : null,
            success : function(response){
                $asset_booking_reschedule.popupCancelFun();
                var message = translate(getmessage);
                    entityName ? showalert('success', message,"isAutoHide=true") : null;// No I18N
                var checkUser = checkUserRole('ViewInventoryWS') && (checkUserRole('BookingAdmin') || checkUserRole('BookingTechnician'));//NO I18N
                if(checkUser){
                    var parentElement = jQuery('#reschedule'),
                    startVal = parentElement.find('#rescheduleStartTime').val(),
                    startDisVal = parentElement.find('#rescheduleStartTime_Display').val(),
                    endVal = parentElement.find('#rescheduleEndTime').val(),
                    endDisVal = parentElement.find('#rescheduleEndTime_Display').val();
                    //update start and end time data for reusing data without getting by api call
                    $asset_booking_details.getBookingSectionDetails.asset_booking.start_time = {
                        "value": startVal,//NO I18N
                        "display_value": startDisVal//NO I18N
                    } 
                    $asset_booking_details.getBookingSectionDetails.asset_booking.end_time = {
                        "value": endVal,//NO I18N
                        "display_value": endDisVal//NO I18N
                    } 
                    renderhbs('#renderDate','booking-details-page-list-view',{start_disVal:startDisVal,end_disVal:endDisVal},null,'asset-booking');//NO I18N
                }else{
                    $asset_booking_reschedule.loadBookedAssets();
                    renderhbs('#renderDate','dateTemplate',{start_disVal:startDisVal,end_disVal:endDisVal});//NO I18N
                }
                $asset_booking_form.commonFunRenderDetailsWhileSave();
            },
            error:function(response){
                var saveBtn = jQuery("#rescheduled");
                inProgressBtn(saveBtn, translate("booking.reschedule"), false);
                if(entityName && entityName=='rescheduled'){
                    var responseError = response.responseJSON;
                    var message = responseError && responseError.response_status && responseError.response_status.messages.length>0 && responseError.response_status.messages[0].message;
                    showalert('failure', message,"isAutoHide=false")//NO I18N
                }
            },
            complete:function(response){
                var saveBtn = jQuery("#rescheduled");
                inProgressBtn(saveBtn, translate("booking.reschedule"), false);
            }
        });
    };
    reschBookObj.calenderInitFun=function(e,eleToInit,eleToCompare,condition){
        var eleTime = jQuery(e.target).prev().attr('id'),
            eleToCompareDiv,eleToInitDiv,
            eleToCompareDiv=document.getElementById(eleToCompare),
            eleToInitDiv=document.getElementById(eleToInit),
            
            validateArgs=[eleToInitDiv,eleToCompareDiv,translate('sdp.contract.addNew.jsDateDiffErr')];
            //validate date based on some conditions
            var settingUrl = (PORTALID && PORTALID>0) ? 'asset_booking_settings?PORTALID='+PORTALID : 'asset_booking_settings';//NO I18N
            var generalSettingsData = reschBookObj.getAssetBookSettings || $asset_booking_form.getAssetBookSettings || reschBookObj.ajaxFun(settingUrl,null,'asset_booking_settings')[0];//NO I18N
            var myDate = function(e,eleToInit,eleToCompare,condition){
                var getEleId = arguments[0].getAttribute('id'),
                    minDateVal = reschBookObj.getValueForDateAndTime(generalSettingsData.advance_booking_minimum_days),
                    maxDateVal = reschBookObj.getValueForDateAndTime(generalSettingsData.advance_booking_maximum_days);
                    if(eleToInit.id=="calenStartTime" || eleToInit.id=="calenEndTime"){
                        $asset_booking_form.calenderValidateFun(e,eleToInit.id,eleToCompare,condition);
                    }else{
                        $asset_booking_reschedule.rescheduleCalenderValidateFun()
                    }
                    
                    if(arguments[0].value && arguments[1].value){
                        if(getEleId=="calenEndTime" || getEleId=="rescheduleEndTime"){
                            var checkArgUSingTo = arguments[0].value<arguments[1].value;
                        }else{
                            var checkArgUSingTo = arguments[0].value>arguments[1].value;
                        }
                        var diffInDays = reschBookObj.getDiffFromStartAndEnd(arguments);
                        if(arguments[0].value == arguments[1].value){
                            var alertMsg =  translate("booking.start.end.time.sameerror");
                            showalert('failure',alertMsg,"isAutoHide=false");//NO I18N
                            return false;
                        }
                    }

                    if(eleTime=="calenStartTime"){
                        var checkBasedOnSel = arguments[0].value<minDateVal || arguments[0].value>maxDateVal;
                    } else if (eleTime=="rescheduleStartTime"){ //NO I18N
                       var checkBasedOnSel = arguments[0].value>maxDateVal;
                    } else{
                        var checkBasedOnSel = (arguments[0].value ? arguments[0].value<minDateVal : (!arguments[1].value && arguments[0].value<minDateVal));
                    }
                    
                    if(checkBasedOnSel){
                        var alertMsg = arguments[0].value>maxDateVal ? translate("booking.starttime.max.exceed",[generalSettingsData.advance_booking_maximum_days]) : translate("booking.starttime.min.less",[generalSettingsData.advance_booking_minimum_days]);
                        showalert('failure',alertMsg,"isAutoHide=false");//NO I18N
                        return false;
                    }
                    else if(diffInDays>generalSettingsData.allowed_maximum_booking_days){
                        showalert('failure',translate("booking.starttime.max.exceed",[generalSettingsData.allowed_maximum_booking_days]),"isAutoHide=false");//NO I18N
                        return false;
                    }
                    if(checkArgUSingTo){
                        showalert('failure',translate('sdp.contract.addNew.jsDateDiffErr'),"isAutoHide=false");//NO I18N
                        return false;
                    }else{
                        return true;
                    }
                    
            }
            initCalendar(eleToInit, null, null, null, null, myDate, window,validateArgs);
    };
    reschBookObj.getValueForDateAndTime = function(dateVal){
        var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * (dateVal * 1000)),
            dateToVal = currentDate.getTime();
            return dateToVal;
    };
    reschBookObj.getDiffFromStartAndEnd=function(arg){
        var getEleId = arg[0].getAttribute('id'),
            toDate = (getEleId=="calenEndTime" || getEleId=="rescheduleEndTime") ? arg[0].value : arg[1].value,
            fromDate = (getEleId=="calenEndTime" || getEleId=="rescheduleEndTime") ? arg[1].value : arg[0].value,
            difference_In_Time = toDate - fromDate,
            difference_In_Days = difference_In_Time / (1000 * 3600 * 24);
            return difference_In_Days;
    };
    return reschBookObj;
}());
