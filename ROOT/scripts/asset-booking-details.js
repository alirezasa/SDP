// $Id$
var $asset_booking_details = (function(){
    "use strict";//NO I18N
    var bookingDetObj = {};
        bookingDetObj.bookedTableComp = "";
        bookingDetObj.getSepBookingIds = {};
        //function to load booked assets details page
        bookingDetObj.initDetails=function(bookingId){
            bookingDetObj.getSepBookingIds = {};
            var parentElement = jQuery('#asset-bookings-section'),
                inputData =  {
                    "include": [//NO I18N   
                      "meta_info",//NO I18N
                      "links"//NO I18N
                    ]
                  };
                $asset_booking_form.ajaxFun('asset_bookings/'+bookingId,bookingId,null,inputData,function(response){//NO I18N
                    bookingDetObj.getBookingSectionDetails = response;
                    bookingDetObj.getAllBookedAssetsList = [];
                    var bookingIdData = bookingDetObj.getBookingSectionDetails.asset_booking,
                                bookingMetainfo = bookingDetObj.getBookingSectionDetails.meta_info;
    
                            var topSectionWithSite = ["display_id","booked_by", "purpose", "site", "comments"],//NO I18N
                                topSection = ["display_id","booked_by","purpose","comments"],//NO I18N
                                bottomSection = ["employee_id","phone","department","jobtitle","mobile"],//NO I18N
                                topSection = (bookingIdData.site!=null) ? topSection: topSectionWithSite;
                    var bookingItemsData = bookingDetObj.getBookingSectionDetails.asset_booking && (bookingDetObj.getBookingSectionDetails.asset_booking.booking_items.length>0) && bookingDetObj.getBookingSectionDetails.asset_booking.booking_items;
                    //render right section data regarding booking
                    renderhbs("#asset-bookings-section","booking-details-page-list-view",{//NO I18N
                        bookingData : bookingIdData,
                        metainfo    : bookingMetainfo,
                        topDataArr  : topSection
                    },null,'asset-booking');//NO I18N
                    //render left section data regarding time and user (with reschedule and email user button)
                    renderhbs('#renderDate',"booking-details-page-list-view",{start_disVal:bookingIdData.start_time.display_value,end_disVal:bookingIdData.end_time.display_value},null,'asset-booking');//NO I18N
                    var bookedUserDetails = $asset_booking_form.getAllDataAtOnce('asset_bookings/'+bookingId+'/booked_by/'+bookingIdData.booked_by.id,'','user'); //NO I18N
                    //render right section data regarding user
                    renderhbs('#booking_details_tab','booking-details-page-list-view',{isLVHeader:true},null,'asset-booking');//NO I18N
                    if(bookingIdData.booked_by.name != null && bookingIdData.booked_by.name != "") {
                        $asset_booking_form.ajaxFun('asset_bookings/'+bookingId+'/booked_by/'+bookingIdData.booked_by.id+'/_metainfo',null,'metainfo',"", function(resp){
                            bookingDetObj.bookingUserMetainfo = resp.metainfo;
                            bookingDetObj.userName = bookedUserDetails.name;
                            renderhbs("#requesterdetailsdiv","booking-details-page-list-view",{//NO I18N
                                usermatainfo   : bookingDetObj.bookingUserMetainfo,
                                bookedUserData : bookedUserDetails,
                                bottomDataArr  : bottomSection,
                                isUserSection  : true,
                                checkRequests  : checkUserRole('ViewRequests')//NO I18N
                            },null,'asset-booking');//NO I18N
                        });
                        
                    }

                    if(bookingItemsData){
                        var currCountVal = 0;
                        for(var i=0;i<bookingItemsData.length;i++){
                            bookingDetObj.getBookedAssetsDetails =  $asset_booking_form.ajaxFun('asset_bookings/'+bookingDetObj.getBookingSectionDetails.asset_booking.id+'/booking_items/'+bookingItemsData[i].id,null,null,inputData,function(getAssetDet){//NO I18N
                                currCountVal++;
                                bookingDetObj.getBookedAssetsDetails = getAssetDet;
                                bookingDetObj.getAllBookedAssetsList[bookingDetObj.getBookedAssetsDetails.booking_item.id]=bookingDetObj.getBookedAssetsDetails;
                                
                                //clicking function for booked assets and history tabs
                                bookingDetObj.whileInit = true;
                                bookingDetObj.detCheckboxOnclkFun(true);
                                if(currCountVal==bookingItemsData.length){
                                    bookingDetObj.constructBookedDataForTable(bookingId);
                                }
                            });
                                    
                        }
                    }
                    
                    bookingDetObj.disableReschedule(bookingId,true);

                    if(bookingDetObj.getBookingSectionDetails.asset_booking && bookingDetObj.getBookingSectionDetails.asset_booking.booking_items.length==0){
                        bookingDetObj.constructBookedDataForTable(bookingId);
                    }
                    jQuery("#BookedDetTab").off('click').on('click','li',function(){//NO I18N
                        var ariaControls = jQuery(this).find('a').attr('aria-controls');
                            parentElement.find('#bookingdetailTab .sdtab-pane,#bookedAsset').hide();
                            parentElement.find('#cancelledAsset,#'+ariaControls).show();
                    });
                    initTooltip('#asset-bookings-section');//NO I18N
                    //added for right section tooltip in UI
                    setTimeout(function(){
                        initTooltip('#requesterdetailsdiv');//NO I18N
                        if($asset_booking_details.bookedTableComp && $asset_booking_details.bookedTableComp.visibleContents && $asset_booking_details.bookedTableComp.visibleContents.length<10){
                            jQuery("#bookingsDet_kanban_div").css("height","auto");//NO I18N
                        }
                    },100)
                    
                })
                
        };
        //Disable reschedule button  based on _links for assetBooking id
        bookingDetObj.disableReschedule = function(bookingId,isLoad){
            var parentElement = jQuery('#assetDetailPage'),
                rescheduleAvail = true,
                getScheduleAllowedVal = "",
                emailUser = true;
                
                if(isLoad){
                    getScheduleAllowedVal = bookingDetObj.getBookingSectionDetails._links;
                }else{
                    getScheduleAllowedVal = bookingId ? $asset_booking_form.getAllDataAtOnce('asset_bookings/'+bookingId+'/_links','','_links').links : null;//NO I18N
                }
                
                if(getScheduleAllowedVal){
                    getScheduleAllowedVal.forEach(function(field,index){
                        if(field.name=="reschedule"){
                            rescheduleAvail=false;
                        }
                        else if(field.name=="email_user"){
                            emailUser = false;
                        }
                        parentElement.find("#reschedule-btn").prop("disabled",rescheduleAvail);//NO I18N
                        parentElement.find("#email-user").prop("disabled",emailUser);//NO I18N
                    });
                }
        };
        //Open notify popup in new window while clicking Email users
        bookingDetObj.openLoanNotifyWindow=function(loanId, userId){
            NewWindow("/Notify.do?mode=get&id="+loanId+"&notifyTo="+userId+'&notifyModule=Booking','notifyowner','900','600','yes','center');//No I18N
        };
        bookingDetObj.getSelectedIDs= function() {
            var self = this;
            var sel_id = []; 
            var selChkBoxLen = jQuery('#bookingsDet_kanban_div input[type="checkbox"]:checked').length;
            if(selChkBoxLen>0) {
                for(var i=0;i<selChkBoxLen;i++){
                    sel_id.push(jQuery('#bookingsDet_kanban_div input[type="checkbox"]:checked')[i].value);    //No I18N
                }
                
            }
            return sel_id;
        };
        bookingDetObj.detCheckboxOnclkFun=function(isLoad){
            $asset_booking_details.checkAvailIds = {};
            //enable loan, ready for pickup and cancel booking icon based on common header checkbox in listview
            jQuery("#booking_details_tab").on('change', '#bookingsDet_head_chk, #bookingsDet_kanban_div input[type="checkbox"]',function(e){
                getLinksOfSelChkBox(e);
            });
            function getLinksOfSelChkBox(e){
                var getLinks = "", selInputBoxes = "", minLinkLength = -1;
                selInputBoxes = jQuery('#bookingsDet_kanban_div input[type="checkbox"]:checked');
                jQuery('#bookingdetailTab .listcontrols button').prop('disabled',true);//NO I18N
                $asset_booking_details.getAllowedValues = [];
                jQuery.each(selInputBoxes,function(index,fields){

                    if(Object.keys($asset_booking_details.checkAvailIds).indexOf(fields.value)!=-1 && !bookingDetObj.getHeaderLink){
                        getLinks = $asset_booking_details.checkAvailIds[fields.value];
                    }else{
                        if(bookingDetObj.getHeaderLink){
                            getLinks = $asset_booking_form.getAllDataAtOnce('booking_items/'+Number(fields.value)+'/_links',null,'_links').links;//NO I18N
                            bookingDetObj.getHeaderLink = false;
                            bookingDetObj.getAllBookedAssetsList[fields.value]._links=getLinks;
                        }else{
                            getLinks = bookingDetObj.getAllBookedAssetsList[fields.value]._links;
                        }
                    }
                    $asset_booking_details.checkAvailIds[fields.value] = getLinks;

                    var getAllowedValues = [];

                    for(var i=0;i<getLinks.length;i++){
                        if(getLinks[i].name && getLinks[i].name!="self"){
                            if(getAllowedValues.length>0 && getAllowedValues.indexOf(getLinks[i].name)==-1){
                                getAllowedValues.push(getLinks[i].name);
                            }else{
                                getAllowedValues.push(getLinks[i].name);
                            }
                        }
                    }

                    if(minLinkLength==-1 || getLinks.length<minLinkLength){
                        minLinkLength = getLinks.length;
                        $asset_booking_details.getAllowedValues = getAllowedValues;
                    }

                });
                jQuery("#booking_details_tab").find('[data-link="bookingsDet"]').attr('data-link','').prop('disabled',true);//NO I18N
                    
                if(selInputBoxes.length==0){
                    jQuery('#bookingdetailTab .listcontrols button').prop('disabled',true);//NO I18N
                    $asset_booking_details.checkAvailIds = {};
                    
                }else{
                    for(var i=0;i<$asset_booking_details.getAllowedValues.length;i++){
                        jQuery('#'+$asset_booking_details.getAllowedValues[i]).attr('data-link','bookingsDet').prop('disabled',false);
                    }
                }  
                
            }
        };
        //Function to construct table json for booking details page
        bookingDetObj.constructBookedDataForTable = function(bookingId){
            
            var fields_required = {"product_type":"","criteria":"","status":"","booking":"","total_count":"","loaned_count":"","order":""};//NO I18N
            var table_content = {
                "bookingsDet_head_chk" : { //NO I18N
                    "type"    : "checkbox",//NO I18N
                    "width"   : "50px",//NO I18N
                    "dataCelltransformer" : $asset_booking_list.constructCheckBoxCell,//NO I18N
                    "column_settings": {"view_type": "row", "position": 1}, //No I18N
                    "hide_label": true, //No I18N
                    "default" : true // No I18N
                },
                "product_type":{// No I18N
                    "hide_label": true, //No I18N
                    "column_settings": {"rowposition":1}, //No I18N
                    "dataCelltransformer" : bookingDetObj.constructNameRowCell//NO I18N
                }
            }
            var urlHolder = {
                url               : 'asset_bookings/'+bookingId+'/booking_items',//NO I18N
                entity_name       : 'booking_items',//NO I18N
                tableHolder       : "bookingsDet",//NO I18N
                paginationEnabled : false,
                searchEnabled     : false,
                sortingEnabled    : false,
                getmetaInfo       : false,
                meta_data         : bookingDetObj.getBookedAssetsDetails && bookingDetObj.getBookedAssetsDetails.meta_info.fields,
                static_meta       : bookingDetObj.getBookedAssetsDetails && bookingDetObj.getBookedAssetsDetails.meta_info.fields,
                lazyloadingEnabled: true,
                callbackAfterBodyRender:bookingDetObj.callbackAfterBodyRender
            };

            var addlOptions = {
                view : "kanban",//NO I18N
                view_mode : "linear",//NO I18N
                nodataString: '<div class="pos-rel tc p10">'+translate("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg")+'</div>',
                width:"100%",
                "bulkSelectionSetting" : {//NO I18N
                    enabled: true
                },
                column_settings : {
                    "default_position": 2,//No I18N
                    "assign_label_width": false,//No I18N
                    "assign_content_width":false,//No I18N
                    "columns": [{//No I18N
                        "size": 1,//No I18N
                        "width": "40px"//NO I18N
                    }, {
                        "size": 11,//No I18N
                        "default_rowposition": 2//No I18N
                    }]
                }
            }

            var inputData = {
                "search_criteria":{//NO I18N
                    "field":"booking.id",//No I18N
                    "condition":"=",//No I18N
                    "value":bookingId,//No I18N
                    children:[{
                        "field":"total_count",//No I18N
                        "condition":"!=",//No I18N
                        "value":"0",//No I18N
                        "logical_operator":"AND"//No I18N
                    }]
                },
                "sort_order":"asc",//NO I18N
                "sort_field":"order",//NO I18N
                "row_count":"100"//NO I18N
            }
            bookingDetObj.bookedTableComp = $asset_booking_list.constructTableComponent(fields_required,table_content,urlHolder,inputData,addlOptions);
            jQuery('#bookingsDet_kanban_div').html('<div class="pos-rel">' + ajaxBar() + '</div>');
        };
        //function to construct what to execute in name cell in table
        bookingDetObj.constructNameRowCell = function(tableData){
            var asset = tableData.row_data.product_type,
                criteria = tableData.row_data.criteria,
                pendingAsset = tableData.row_data.total_count - tableData.row_data.loaned_count;
                var pendingElement = (tableData.row_data.loaned_count>0 && pendingAsset>0) ? '<span class="alert-danger font-small ml10">'+translate('sdp.requests.common.Pending')+' ('+pendingAsset+')</span>' : '';
               
                if(criteria){
                    var specification = '<span class="vtop">'+e_html(criteria.display_name)+' : '+e_html(criteria.display_value)+'</span>';
                    if(criteria.children){
                        let getIsMemory = false;
                            for(var i=0;i<criteria.children.length;i++){
                                getIsMemory = criteria.field=="physical_memory" ? true : ((criteria.children[i].field=="physical_memory" && !getIsMemory)  ? true : false);//NO I18N
                                if(criteria.children[i].field=="physical_memory" && !getIsMemory){//NO I18N
                                    specification+='<span class="vtop">'+e_html(criteria.children[i].display_name)+' : '+e_html(criteria.children[i].display_value)+'</span>';
                                }else if(criteria.children[i].field!="physical_memory"){
                                    specification+='<span class="vtop">'+e_html(criteria.children[i].display_name)+' : '+e_html(criteria.children[i].display_value)+'</span>';
                                }
                            }
                        
                    }
                    var fullspec = '<p class="spec-blk" ><strong class="text-muted vtop">'+translate('booking.selected.specification')+' : </strong>'+specification+'</p>';
                    
                }
                var tr = tableData.row_data;
                if(bookingDetObj.whileInit){
                    var getAllBookedAssets = bookingDetObj.getAllBookedAssetsList[tr.id] && bookingDetObj.getAllBookedAssetsList[tr.id].booking_item;
                    return subFunConstructNameCell(getAllBookedAssets,tr);
                }else{
                    var getAllBookedAssets = $asset_booking_form.getAllDataAtOnce('asset_bookings/'+tr.booking.id+'/booking_items/'+tr.id,null,'booking_item','');//NO I18N
                    return subFunConstructNameCell(getAllBookedAssets,tr);
                }
                
                function subFunConstructNameCell(getAllBookedAssets,tr){
                    if(getAllBookedAssets){
                        var bookedAssetIdAttr = getAllBookedAssets && getAllBookedAssets.booked_assets && getAllBookedAssets.booked_assets.length>0 && getAllBookedAssets.booked_assets[0].id;                      
                        var editIcon = (tr.status && tr.status.internal_name==="Loaned") ? '' : '<span data-val="'+e_attr(tr.product_type.display_name)+'" class="cspr edit2 hover icon-md ml5 mr5 vtop cur-ptr" data-booking-id="'+tr.booking.id+'" data-asset-id="'+tr.id+'" data-id="'+tr.id+'" rel="uitip" data-booked-asset="'+bookedAssetIdAttr+'" data-total-count="'+tr.total_count+'" title="'+translate('sdp.common.edit')+'" nonce="'+sdpNonce+'"></span>';
                        var associatedAsset = [];
                            bookingDetObj.getSepBookingIds[tr.id] = {
                            loanedAsset:"",
                            loanedAssetIds:[],
                            getAssocAssets:[],
                            getAssocAssetsName:[],
                            getBookedIds : [[],[]]
                        };
                        jQuery.each(getAllBookedAssets.booked_assets,function(index,val){
                            if(val.asset && val.asset.name && !val.is_loaned){
                                associatedAsset.push(val.asset.name);
                                bookingDetObj.getSepBookingIds[tr.id].getAssocAssets.push(val.asset.id);
                                bookingDetObj.getSepBookingIds[tr.id].getAssocAssetsName.push(val.asset.name);
                                var obj = {
                                    bookedId:val.id,
                                    assetId:val.asset.id
                                }
                                bookingDetObj.getSepBookingIds[tr.id].getBookedIds[0].push(obj);
                            }else if(val.asset && val.asset.name && val.is_loaned){
                                !bookingDetObj.getSepBookingIds[tr.id].loanedAsset && (bookingDetObj.getSepBookingIds[tr.id].loanedAsset = val.asset.name);

                                bookingDetObj.getSepBookingIds[tr.id].loanedAssetIds.push(Number(val.asset.id));
                            }else{
                                var obj = {
                                    bookedId:val.id,
                                    assetId:val.asset
                                }
                                bookingDetObj.getSepBookingIds[tr.id].getBookedIds[1].push(obj);
                            }
                        });

                        setTimeout(function(){
                            if(jQuery("#loanedAssetsDiv_"+tr.id) && jQuery("#loanedAssetsDiv_"+tr.id).length>0){
                                renderhbs('#loanedAssetsDiv_'+tr.id,'booking-details-page-list-view',{// No I18N
                                    name:bookingDetObj.getSepBookingIds[tr.id].loanedAsset,
                                    remainingAssets:bookingDetObj.getSepBookingIds[tr.id].loanedAssetIds.length-1,
                                    currId:tr.id,
                                    isLVAssetDetails : true
                                },null,'asset-booking');//NO I18N
                                jQuery('#loanedAssetsDiv_'+tr.id).addClass('pt10');
                            }
                        },400);
                        var totalAssociated = associatedAsset.length>1 ? '<span class="text-link cur-ptr" data-val="'+e_attr(tr.product_type.display_name)+'" data-booking-id="'+tr.booking.id+'" data-asset-id="'+tr.id+'" data-id="'+tr.id+'" data-booked-asset="'+getAllBookedAssets.booked_assets[0].id+'" data-total-count="'+tr.total_count+'">' + (associatedAsset.length>0 ? translate("booking.bookedasset.more.assets",[associatedAsset.length>0 && associatedAsset.length-1, ""]) : "" )+'</span>' : "";

                        var associateText = '<div class="ast-sel-blk"><div class="txt-view"><div><strong class="text-muted vtop">'+translate('ae.contract.contracted.assets')+' : </strong> <div class="disp-ib">'+e_html(associatedAsset.length >0 ? associatedAsset[0] : "")+ " " +totalAssociated+'</div>'+editIcon+'</div></div></div>';
                        var loanedDiv = '<div id="loanedAssetsDiv_'+tr.id+'" ></div>';
                        var getCurrStatus = tableData.row_data.status,
                        statusBadge="",
                        tr = tableData.row_data;
                        if(getCurrStatus){
                            var addlClass = (getCurrStatus.internal_name==="Ready For Pickup") ? "success" : (getCurrStatus.internal_name==='Canceled') ? "danger" : "info",//NO I18N
                                statusName = getCurrStatus.name,
                                statusTitle = "",
                                pendingAsset = tr.total_count - tr.loaned_count;
                            if(getCurrStatus.internal_name==="Partially Loaned"){
                                statusName = getCurrStatus.name+' : '+tr.loaned_count+'/'+tr.total_count;
                                statusTitle = translate('booking.pending.status.info',[tr.loaned_count,tr.total_count,pendingAsset]);
                            }
                            statusBadge = '<span class="status-badge top0 off pos-abs right15 '+addlClass+'" role="status">'+e_html(statusName)+'</span>';
                        }
                        const getImageIcon = asset.icon ? asset.icon["content-url"] : "/images/no-image-icon.svg";//NO I18N
                        return '<div class="ab-ast-blk mt10"><div class="ast-img-blk" role="figure"><img src="'+getImageIcon+'" title="'+e_attr(asset.display_name)+'" rel="uitip" alt="'+e_attr(asset.display_name)+'"/></div><div class="ast-txt-blk pl5"><p class="text-overflow pr50" rel="uitip" title="'+e_attr(asset.display_name)+'" mode_ellipsis="true" style="max-width:54vw"><strong>'+e_html(asset.display_name)+' ('+tableData.row_data.total_count+')</strong>'+pendingElement+'</p>'+(fullspec ? fullspec : "")+(editIcon ? associateText : "")+loanedDiv+'</div>'+statusBadge+'</div>';
                    }
                    
                }
        };
        //function to render association dropdown while clicking associated assets in table
        bookingDetObj.renderAssoDropdown=function(){
            var selAsetType = [{id:'recommended',text:translate('booking.details.matching.assets')},{id:'other',text:translate('booking.details.other.assets')}];//NO I18N
            var getAllBookedAssets = "";
            var inputData = {
                "start_index":1,//NO I18N
            }
            jQuery('#selAssetType').select2({
                    data : selAsetType,
                    width : 200
            }).select2('data',selAsetType[0]).on('change',function(){//NO I18N
                var selVal = this.value;
                if(selVal=="recommended"){
                    inputData.filter_by = {
                        "name": "recommended"//NO I18N
                    };
                    bookingDetObj.renderSelectFromListView(inputData);
                }else{
                    inputData.filter_by = {
                        "name": "others"//NO I18N
                    };
                    bookingDetObj.renderSelectFromListView(inputData);
                }
            });
                inputData.filter_by = {
                    "name": "recommended"//NO I18N
                };
                return inputData;

        };
        //function to open association popup for selected asset
        bookingDetObj.openAssociatePopup=function(ele){
            jQuery('<div class="pos-rel" id="common_load_bar">' + ajaxBar() + '</div>').insertBefore( "#booking_details_tab");// No I18N
            var ele = ele;
            bookingDetObj.bookingItemsId = jQuery(ele).attr('data-asset-id');
            bookingDetObj.bookingId = jQuery(ele).attr('data-booking-id');
            bookingDetObj.bookingAssetId = jQuery(ele).attr('data-booked-asset');
            bookingDetObj.bookingProductType = jQuery(ele).attr('data-val');

            bookingDetObj.chkAssoAsset = [];
            bookingDetObj.unchkAssoAsset = [];
            bookingDetObj.scanbarcodeArr = ["empty"];

            renderhbs('#forAssociate','booking-details-page-associate-and-loaned-popup',null,null,'asset-booking');//NO I18N
            jQuery('#associateDialog').dialog({
                width     : 1200,
                resizable : false,
                minHeight : 550,
                maxHeight : 500,
                modal: true,
                close:function(){
                    $asset_booking_reschedule.popupCancelFun();
                    bookingDetObj.detCheckboxOnclkFun();
                    jQuery('#forAssociate').empty();
                }   
            });
            jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
            initTooltip('.ui-dialog');//NO I18N
            renderhbs('#from_listview_tab','booking-details-page-barcode-listview-table',null,null,'asset-booking');//NO I18N
            var inputData = bookingDetObj.renderAssoDropdown();
            var selObj =  bookingDetObj.getAssoAssetsByDefault();
            bookingDetObj.renderSelectFromListView(inputData,selObj);
            jQuery("#asset-associate").prop('disabled',true);//No I18N
            jQuery("#common_load_bar").remove();
        };
        //function to get and render what are the assets are associated for selected assets
        bookingDetObj.getAssoAssetsByDefault=function(){
            var selectRecordsobj = {};
            var alreadyAssoAssets = bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getAssocAssets;
            alreadyAssoAssets.forEach(function(id,index){

                selectRecordsobj[id] = {
                    "id":id,//NO I18N
                    "name":bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getAssocAssetsName[index]
                };
            });
            return selectRecordsobj;
        };
        bookingDetObj.renderSelectFromListView=function(inputData,selObj,getAssEle,selId){
            var assoTableHolder = getAssEle || "assets_list";//NO I18N

            var selObj =  assoTableHolder=="assets_list" && (selObj || bookingDetObj.loadSelectFromListview());//NO I18N

            var inputData = inputData;

            var fields_required = {"name":"","org_serial_number":"","product_type":"","product":"","product":"","department":"","user":"","site":""},//NO I18N
                table_content = {};
                    if(!getAssEle){
                        table_content[assoTableHolder+"_head_chk"] = { //NO I18N
                            "type"    : "checkbox",//NO I18N
                            "default" : true,//NO I18N
                            "width"   : "50px",//NO I18N
                            "dataCelltransformer" : $asset_booking_list.constructCheckBoxCell //NO I18N
                        }
                    }
                    table_content["name"]={//NO I18N
                        dataCelltransformer: bookingDetObj.constructAssetsForDetailsPage,
                    }

                var getEleId =selId || bookingDetObj.bookingAssetId;
                var urlHolder = {
                    url                  : assoTableHolder=="assets_list" ? 'booked_assets/'+getEleId+'/asset' : 'asset_assets',//NO I18N
                    entity_name          : assoTableHolder=="assets_list" ? 'asset' : "asset_assets",//NO I18N
                    tableHolder          : assoTableHolder,
                    paginationEnabled    : true,
                    searchEnabled        : true,
                    sortingEnabled       : true,
                    columnChooserEnabled : true,
                    height               : 500,
                    isODAPI              : true,
                    personalize_key      : assoTableHolder,
                    width                : jQuery("#assets_list_div").width(),
                    discarded_fields     : ["region_sys_attribute","sys_name","technician_sys_attribute","product_depreciation","is_personal","is_depreciation_configured","is_depreciation_calculated","retain_user_site","asset_depreciation","sys_description","sys_uptime","asset_fields","site_sys_attribute","is_loanable","last_success_audit","sys_location","last_audit","id","ci"]//NO I18N
                };

                if(assoTableHolder=="assets_list"){
                    urlHolder.bulkSelectionSetting = { //to enable bulk select.
                        enabled: true,
                        selectedRecords: selObj
                    }
                }else if(assoTableHolder=="viewassets_list"){// No I18N
                    urlHolder.callbackSearchFunction = $asset_booking_list.searchCallBack;
                    urlHolder.width = jQuery("#viewassets_list_div").width();
                }
                bookingDetObj[assoTableHolder] = $asset_booking_list.constructTableComponent(fields_required,table_content,urlHolder,inputData);
                bookingDetObj.selectListviewTabClkFun();
                jQuery(".submit-row").css("width",jQuery("#viewassets_list_div").width()+20);// No I18N
        };
        bookingDetObj.constructAssetsForDetailsPage=function(tableData){
            const getAssetData = tableData.row_data.product.all_product_type,
						      getAssetModule = e_html(getAssetData.api_plural_name),
						      getAssetId = tableData.row_data.id;
            return '<a href="/ui/asset?module='+getAssetModule+'&entity_id='+getAssetId+'&mode=details" title="'+e_attr(tableData.row_data.name)+'" target="_blank" rel="uitip noopener" mode_ellipsis=true>'+e_html(tableData.row_data.name)+'</a>';
        };
        //Function to render scan bar code tab with selected assets count
        bookingDetObj.renderScanBarcode=function(){
            var selObj =  bookingDetObj.loadSelectFromListview();
            var fields_required = {"name":"","barcode":"","org_serial_number":"","product_type":"","product":"","product":"","department":"","user":"","site":""},//NO I18N
                table_content = {};

                    table_content["assets_list_head_chk"] = { //NO I18N
                        "type"    : "checkbox",//NO I18N
                        "default" : true,//NO I18N
                        "width"   : "50px",//NO I18N
                        "dataCelltransformer" : $asset_booking_list.constructCheckBoxCell //NO I18N
                    }

                var inputData = {
                "search_criteria":{//NO I18N
                    "field":"barcode",//NO I18N
                    "condition":"is",//NO I18N
                    "values":bookingDetObj.scanbarcodeArr,//NO I18N
                },
                "filter_by":{"name":"recommended"},//NO I18N
                "row_count":100//NO I18N
            }
                var getEleId = bookingDetObj.bookingAssetId;
                var urlHolder = {
                    url                  : 'booked_assets/'+getEleId+'/asset',//NO I18N
                    entity_name          : 'asset',//NO I18N
                    tableHolder          : "assets_list",//NO I18N
                    paginationEnabled    : true,
                    searchEnabled        : true,
                    sortingEnabled       : true,
                    columnChooserEnabled : true,
                    height               : 500,
                    isODAPI              : true,
                    personalize_key      : "assets_list",//NO I18N
                    width                : jQuery("#assets_list_div").width(),
                    discarded_fields     : ["region_sys_attribute","sys_name","technician_sys_attribute","product_depreciation","is_personal","is_depreciation_configured","is_depreciation_calculated","retain_user_site","asset_depreciation","sys_description","sys_uptime","asset_fields","site_sys_attribute","is_loanable","last_success_audit","sys_location","last_audit","id","ci"],//NO I18N
                    bulkSelectionSetting : { //to enable bulk select.
                        enabled: true,
                        selectedRecords: selObj
                    }
                };
                bookingDetObj["assets_list"] = $asset_booking_list.constructTableComponent(fields_required,table_content,urlHolder,inputData);
                bookingDetObj.scanBarcodeTabClkFun();
                bookingDetObj.selectListviewTabClkFun();
                jQuery("#scan_barcode_input").focus();
        };
        //function to save recently associated assets selected by user
        bookingDetObj.saveAssociatedAssetFun=function(){
            var saveBtn = jQuery("#asset-associate");
            inProgressBtn(saveBtn, translate("sdp.asset.loan.save.inProgress"), true);

            var bookedAssetCount = jQuery('[data-booked-asset='+bookingDetObj.bookingAssetId+']').attr('data-total-count');
            var numberOfChecked = bookingDetObj.assets_list.bulkSelect.selectedRecordsCount;
            var loanedAssetLength = $asset_booking_details.getSepBookingIds[bookingDetObj.bookingItemsId].loanedAssetIds.length;
            var needtochecked = (bookedAssetCount - loanedAssetLength);
            var checkUncheckArr = [[],[]];
            var checkMsgArr= ["",""];
            if(numberOfChecked>needtochecked){
                showalert('failure',translate('booking.booked.asset.association.maximumlimit',[needtochecked]),"isAutoHide=false");//NO I18N
                var saveBtn = jQuery("#asset-associate");
                inProgressBtn(saveBtn, translate("sdp.header.checklist.associate"), false);
            }else{
                var getBookIdArr = bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getBookedIds;
                var alreadyAssociatedAssets = getBookIdArr[0].map(function(e){return e.assetId});
                bookingDetObj.chkAssoAsset = bookingDetObj.chkAssoAsset.filter(function(e){
                    return alreadyAssociatedAssets.indexOf(e)==-1; //means element is not present
                });
                bookingDetObj.unchkAssoAsset = bookingDetObj.unchkAssoAsset.filter(function(e){
                    return alreadyAssociatedAssets.indexOf(e)!=-1; //means element is present
                });


                if(bookingDetObj.unchkAssoAsset.length>0){
                    var getAssetBookedId = "";
                    bookingDetObj.unchkAssoAsset.each(function(id,indexVal){
                        getBookIdArr[0].forEach(function(fieldVal,index){
                            if(fieldVal.assetId==id){
                                getAssetBookedId = fieldVal.bookedId;
                                getBookIdArr[1].push(fieldVal);
                                getBookIdArr[0].splice(index,1);
                            }
                        });
                        checkUncheckArr[0].push(getAssetBookedId);
                    });
                }

                if(bookingDetObj.chkAssoAsset.length>0){
                    var getAssetBookedId = "";
                    bookingDetObj.chkAssoAsset.each(function(id,indexVal){
                        if(getBookIdArr[1].length>0){
                            getAssetBookedId = getBookIdArr[1][0].bookedId;
                        }else if(getBookIdArr[0].length>0){
                            getAssetBookedId = getBookIdArr[0][0].bookedId;
                        }
                        checkUncheckArr[1].push(getAssetBookedId);
                        getBookIdArr[1].shift();
                    });
                }

                if(checkUncheckArr[1].length>0){
                    checkUncheckArr[1].each(function(cid,cindex){
                        if(checkUncheckArr[0].length>0){
                            checkUncheckArr[0].each(function(uid,uindex){
                                if(uid==cid){
                                    checkUncheckArr[0].splice(uindex,1);
                                }
                            });
                        }
                    })
                }
                /*checkUncheckArr[0] -> uncheckedAssets, checkUncheckArr[1] -> checkedAssets
                check condition while uncheckedAssets>=checkedAssets*/
                var getBookedArrIds = []; 
                
                if(checkUncheckArr[0].length>=checkUncheckArr[1].length){
                    for(var i=0;i<checkUncheckArr[1].length;i++){
                       var obj = {
                            "asset": {//NO I18N
                                id: Number(bookingDetObj.chkAssoAsset[i])
                            },
                            "id":checkUncheckArr[1][i]
                        }
                       var checkMsg = (checkUncheckArr[1].length - 1 == i) ? true : false;
                       getBookedArrIds.push(obj)
                       
                   }
                   for(var i=0;i<checkUncheckArr[0].length;i++){
                    var obj = {
                            "asset": null,//NO I18N
                            "id":checkUncheckArr[0][i]
                    }
                    var checkMsg = (checkUncheckArr[0].length - 1 == i) && (checkUncheckArr[1].length==0) ? true : false;
                   getBookedArrIds.push(obj)
                }
               }
               //check if checkedAssets>uncheckedAssets
                if(checkUncheckArr[1].length>checkUncheckArr[0].length){
                    for(var i=0;i<checkUncheckArr[0].length;i++){
                        var obj = {
                               "asset": {//NO I18N
                                   id: Number(bookingDetObj.chkAssoAsset[i])
                               },
                               "id":checkUncheckArr[0][i]
                            }  
                       var checkMsg = (checkUncheckArr[0].length - 1 == i) ? true : false;
                       getBookedArrIds.push(obj)
                   }
                   for(var i=0;i<checkUncheckArr[1].length;i++){
                    var obj = {
                            "asset": {//NO I18N
                                id: Number(bookingDetObj.chkAssoAsset[i])
                            },
                            "id":checkUncheckArr[1][i]
                    }
                    var checkMsg = (checkUncheckArr[1].length - 1 == i) ? true : false;
                    getBookedArrIds.push(obj)
                }
               }
                var input_data={"booked_assets":getBookedArrIds}//NO I18N
                $asset_booking_form.putAndPostOperation("asset_bookings/"+bookingDetObj.bookingId+"/booking_items/"+bookingDetObj.bookingItemsId+"/booked_assets","PUT",input_data,'associate');
                if(bookingDetObj.chkAssoAsset.length==0 && bookingDetObj.unchkAssoAsset.length==0){
                    inProgressBtn(saveBtn, translate("sdp.header.checklist.associate"), false);
                    showalert('failure',translate('common.nothing.to.save'),"isAutoHide=false");//NO I18N
                }

            }

        };
        bookingDetObj.selectListviewTabClkFun = function(){
            //click function for all rows checkbox in listview to get checked and unchecked checkboxes for change data list while clicking
            jQuery('#assets_list_div').off('change','#assets_list_body input[type="checkbox"]').on('change','#assets_list_body input[type="checkbox"]',function(event){//NO I18N
                jQuery("#asset-associate").removeAttr('disabled');//No I18N
                var currVal = this.value;
                bookingDetObj.changeDataIdBasedOnChkBox(currVal, jQuery('#assets_list_body input[type="checkbox"][value='+currVal+']').prop('checked')==true);//NO I18N
            });
            //header checkbox in listview to change data list for unchecked values while clicking
            jQuery('#assets_list_div').off('change','#assets_list_head #assets_list_head_chk').on('change','#assets_list_head #assets_list_head_chk',function(event){//NO I18N
                jQuery("#asset-associate").removeAttr('disabled');//No I18N
                var getBookIdArr = bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getBookedIds;
                var checkedAssets = getBookIdArr[0].map(function(e){return e.assetId});
                if(jQuery('#assets_list_head input[type="checkbox"').prop('checked')){
                    bookingDetObj.unchkAssoAsset = [];
                    jQuery('#assets_list_div #assets_list_body input:checkbox').each(function(e){
                        if(checkedAssets.indexOf(this.value)==-1){
                            bookingDetObj.changeDataIdBasedOnChkBox(this.value, true);
                        }
                    })
                }
                else{
                    bookingDetObj.chkAssoAsset = [];
                    bookingDetObj.unchkAssoAsset = [];
                    getBookIdArr[0].each(function(e){
                        bookingDetObj.changeDataIdBasedOnChkBox(e.assetId, false);
                    });
                }
            });

            //close icon inside selected records dropdown - in listview to change data list for unchecked values while clicking
            jQuery('#bulk_selection_assets_list').off("click").on("click",'#selected_assets_list_button', function() {//NO I18N
                var currParentEle = jQuery('#bulk_selection_assets_list');
                jQuery(currParentEle).find("[data-assets_list-id]").on("click",function(){//NO I18N
                    jQuery("#asset-associate").removeAttr('disabled');//No I18N
                    var currVal = jQuery(this).attr('data-assets_list-id');
                    bookingDetObj.changeDataIdBasedOnChkBox(currVal, false);
                });
            });
            //selected records common close icon in dropdown - in listview to change data list for unchecked values while clicking
            jQuery("#associateDialog").off("click").on("click",'#bulk_unselect_assets_list', function() {//NO I18N
                jQuery("#asset-associate").removeAttr('disabled');//No I18N
                var getBookIdArr = bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getBookedIds;
                    bookingDetObj.chkAssoAsset = [];
                    bookingDetObj.unchkAssoAsset = [];
                    getBookIdArr[0].each(function(e){
                        bookingDetObj.changeDataIdBasedOnChkBox(e.assetId, false);
                    });
            });

        };
        //function to change default booking asset while clicking checkboxes by changing checking and unchecking ids 
        bookingDetObj.changeDataIdBasedOnChkBox = function(currVal,conchk){
            var getBookIdArr = bookingDetObj.getSepBookingIds[bookingDetObj.bookingItemsId].getBookedIds;
            if(conchk){
                var unchkindex = bookingDetObj.unchkAssoAsset.length>0 && bookingDetObj.unchkAssoAsset.indexOf(currVal);
                    if(unchkindex!=-1){
                        bookingDetObj.unchkAssoAsset.splice(unchkindex,1);
                    }
                var chkindex = bookingDetObj.chkAssoAsset.length>0 && bookingDetObj.chkAssoAsset.indexOf(currVal);
                    if(chkindex==-1 || chkindex==false || chkindex==0){
                        bookingDetObj.chkAssoAsset.push(currVal);
                    }

            }else{
                var chkindex = bookingDetObj.chkAssoAsset.length>0 && bookingDetObj.chkAssoAsset.indexOf(currVal);
                    if(chkindex!=-1){
                        bookingDetObj.chkAssoAsset.splice(chkindex,1);
                    }
                var unchkindex = bookingDetObj.unchkAssoAsset.length>0 && bookingDetObj.unchkAssoAsset.indexOf(currVal);
                    if(unchkindex==-1 || unchkindex==false || unchkindex==0){
                        bookingDetObj.unchkAssoAsset.push(currVal);
                    }
            }

            bookingDetObj.chkAssoAsset = bookingDetObj.chkAssoAsset.filter(function (el) {
                return el != null;
            });

            bookingDetObj.unchkAssoAsset = bookingDetObj.unchkAssoAsset.filter(function (el) {
                return el != null;
            });
        };
        //Get entered text by user while key up to render asset
        bookingDetObj.scanBarcodeTabClkFun = function(){
            jQuery('#associateDialog').off('keyup').on('keyup',"#scan_barcode_input",function(event) {
                if(event.keyCode === 13) {//execute only click enter button
                    bookingDetObj.scanBarCodeInitFun();
                    var barCodeScan = bookingDetObj.scanbarcodeArr;
                    var isScanBarCodeAvail = true;
                    if(barCodeScan.length>0){
                        jQuery.each(bookingDetObj["assets_list"].loadedRecords,function(id,data){
                            if(data.barcode && data.barcode.toUpperCase()==barCodeScan[barCodeScan.length-1].toUpperCase()){
                                isScanBarCodeAvail=false;
                            }
                        });
                    }
                    if(isScanBarCodeAvail){
                        bookingDetObj.scanbarcodeArr.pop();
                        showalert('failure',translate('sdp.asset.loan.validate.barcode.noAsset'),"isAutoHide=false");//NO I18N
                    }
                }
            });
        };
        //Initiate barcode scaned function
        bookingDetObj.scanBarCodeInitFun=function(){
            var getEnteredText = jQuery("#scan_barcode_input").val(),
                index = bookingDetObj.scanbarcodeArr.indexOf(getEnteredText);
                if(index==-1){
                    bookingDetObj.scanbarcodeArr.push(getEnteredText);
                }
                var inputData = {
                    "search_criteria":{//NO I18N
                        "field":"barcode",//NO I18N
                        "condition":"is",//NO I18N
                        "values":bookingDetObj.scanbarcodeArr,//NO I18N
                    },
                    "row_count":100//NO I18N
                }
                bookingDetObj.renderScanBarcode(inputData);
        };
        //"Select list view" and "Scan bar code" Tab clicking function 
        bookingDetObj.tabOnClickFunction=function(currTab,currEle){
           
                var parentElement = jQuery('#associateDialog');
                parentElement.find('.sdtab-pane').hide().empty().end()
                             .find('#'+currTab).show().end()
                             .find('#associateTabs li').removeClass('active').end()
                             .find(currEle).parent('li').addClass('active');//NO I18N
                if(currTab=="from_listview_tab"){
                    renderhbs('#from_listview_tab','booking-details-page-barcode-listview-table',null,null,'asset-booking');//NO I18N
                    var inputData = bookingDetObj.renderAssoDropdown();
                    bookingDetObj.renderSelectFromListView(inputData);
                }else{
                    renderhbs('#from_barcode_tab','booking-details-page-barcode-listview-table',{isBarCode:true},null,'asset-booking');//NO I18N
                    bookingDetObj.renderScanBarcode();
                }
               
            
        };
        bookingDetObj.loadSelectFromListview=function(isCheck){
            var selectRecordsobj = bookingDetObj.assets_list.bulkSelect.selectedRecords;
            selectRecordsobj = jQuery.extend(true,selectRecordsobj, bookingDetObj.assets_list && bookingDetObj.assets_list.bulkSelect.selectedRecords)

            if($asset_booking_details.unchkAssoAsset.length>0){
                for(var i=0;i<$asset_booking_details.unchkAssoAsset.length;i++){
                    delete selectRecordsobj[$asset_booking_details.unchkAssoAsset[i]];
                }
            }
            return selectRecordsobj;
        };
        //The below function process the history tab by changing json structure for needed format
        bookingDetObj.processHistory=function(arg){
            var addDiff = [],
                getIndex = [];
            var getFieldDiff = "";
            arg.forEach(function(fields,index){
                fields.className = "list-sprite icon-sm task-icon";
                if(fields.operation=="booking_item_add" || fields.operation=="booked_asset_edit" || fields.operation=="booking_item_edit"){
                    var obj = {};
                    getFieldDiff = fields.diff;
                    fields.diff.forEach(function(fieldsVal,fieldInd){
                        
                        if(fieldsVal.field.name=="ASSETID"){
                            if(obj.assetid){
                                obj.assetid.current_value+=","+fieldsVal.current_value;
                                getIndex.push(fieldInd);
                            }else{
                                obj.assetid=fieldsVal;
                            }
                        }else if(fieldsVal.field.name=="asset_display_value"){
                            fieldsVal.field.display_name = translate("booking.associate.asset.name");
                        }else if(fieldsVal.field.name=="criteria"){
                            if(fieldsVal.current_value && fieldsVal.current_value!="null"){
                                var criteriaStr = "";
                                criteriaStr = fieldsVal.current_value.display_name+ " " +translate('sdp.admin.rule.addrule.condition.is')+ " " +e_html(fieldsVal.current_value.display_value);
                                var subCriteria = fieldsVal.current_value.children;
                                if(subCriteria && subCriteria.length>0){
                                    for(var i=0;i<subCriteria.length;i++){
                                        criteriaStr += ", "+ subCriteria[i].display_name+ " " +translate('sdp.admin.rule.addrule.condition.is')+ " " +e_html(subCriteria[i].display_value);
                                    }
                                }
                                fieldsVal.current_value = criteriaStr;
                            }else{
                                fieldsVal.current_value = translate("sdp.admin.requesterDef.none");
                            }
                        }else if(fieldsVal.field.name=="product_type_display_name" || fieldsVal.field.name=="product_type_display_value"){
                            fieldsVal.field.display_name = translate('sdp.helpdesk.common.citype')
                        }else if(fieldsVal.field.name=="asset_loans"){
                            fieldsVal.current_value = fieldsVal.current_value.id
                        }else if(fieldsVal.field.name=="LOANCUSTOMID"){
                            fieldsVal.custom_value =  getFieldDiff.find(e => e.field.name === 'LOANID');
                        }
                        else if(fieldsVal.field.name=="product_type" || fieldsVal.field.name=="LOANID" || fieldsVal.field.name=="asset" || fieldsVal.field.name=="criteria_display_value"){
                            getIndex.push(fieldInd);
                        }else if(fieldsVal.field.name=="status"){
                            if(!fieldsVal.current_value || fieldsVal.current_value=="null"){
                                fieldsVal.current_value = "-";
                            }
                        }
                        
                        
                        if(fields.diff.length-1==fieldInd){
                            $asset_booking_form.spliceArrFunction(getIndex,arg[index].diff);
                            getIndex = [];
                        }
                    });
                    
                }
                else if(fields.operation=="Notification"){
                    fields.diff.forEach(function(fieldsVal,fieldInd){
                        if(fieldsVal.field.name=="NOTIFICATIONID" || fieldsVal.field.name=="NOTIFICATIONTITLE" || fieldsVal.field.name=="ASSETID"){
                            getIndex.push(fieldInd);
                        }
                        if(fields.diff.length-1==fieldInd){
                            $asset_booking_form.spliceArrFunction(getIndex,arg[index].diff);
                            getIndex = [];
                        }
                    });
                }else if(fields.operation=="add"){//NO I18N
                    fields.diff.forEach(function(fieldsVal,fieldInd){
                        if(fieldsVal.field.name=="site" || fieldsVal.field.name=="department"){
                            if(!fieldsVal.current_value){
                                fieldsVal.current_value = "-";
                            }
                        }
                    });
                }
                fields.display_operation_name=translate(fields.operation_display_value) || fields.operation
            });
        };
        //Function to getting associated assets
        bookingDetObj.getAssociatedAssets = function(currEle){
            var selId = jQuery(currEle).attr('data-id'),
                inputData = {
                    "search_criteria":{//NO I18N
                        "field"    :"id",//NO I18N
                        "condition":"is",//NO I18N
                        "values"   :bookingDetObj.getSepBookingIds[selId] && bookingDetObj.getSepBookingIds[selId].loanedAssetIds//NO I18N
                    }
                };
                    renderhbs('#viewAssociatedAsset','booking-details-page-associate-and-loaned-popup',{isLoanedPopup:true},null,'asset-booking');//NO I18N
                jQuery('#viewAssociatedAsset').dialog({
                    width     : 1200,
                    resizable : false,
                    minHeight : 550,
                    maxHeight : 500,
                    modal: true,
                    close:function(){
                        $asset_booking_reschedule.popupCancelFun();
                        jQuery('#viewAssociatedAsset').empty();
                    }
                });
                jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
                initTooltip('.ui-dialog');//NO I18N
                bookingDetObj.renderSelectFromListView(inputData,null,"viewassets_list",selId);//NO I18N
        };
        //Function to render popup while clicking "Cancel" button in details page
        bookingDetObj.cancelledPopup=function(cancelId){
            bookingDetObj.cancelId = cancelId;
            jQuery('#ast_desc_remng_cnt').remove();
            var parentElement = jQuery('#asset-loan');
            jQuery('#cancelPopup').find('#cancel-comments').val("")
                jQuery('#cancelPopup').dialog({
                    width     : 500,
                    resizable : false,
                    maxHeight : 400,
                    modal: true
                });
                jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
                initTooltip('.ui-dialog');//NO I18N
                showDescriptionRemainingCount('#cancel-comments');//NO I18N
        };
        //Function to save by giving reason for "Cancel" 
        bookingDetObj.cancelledPopupSaveFun=function(){
            $asset_booking_details.checkAvailIds = {};
            var saveBtn = jQuery("#asset_cancelled");
            inProgressBtn(saveBtn, translate("sdp.asset.loan.save.inProgress"), true);

            var selIds = bookingDetObj.cancelId || bookingDetObj.getSelectedIDs().join(),
                input_data = {
                  "comments": jQuery('#cancel-comments').val()//NO I18N
                }
                $asset_booking_form.putAndPostOperation("booking_items/_cancel?ids="+selIds,"PUT",input_data,'cancelled');
                bookingDetObj.disableReschedule();

        };
        //move asset status as ready for pickup by clicking "ready for pickup" button
        bookingDetObj.markasReadyForPickup=function(){
            $asset_booking_details.checkAvailIds = {};
            var selIds = bookingDetObj.getSelectedIDs().join();
            var completeCallBack = function(){
                var getLinks = $asset_booking_form.getAllDataAtOnce('booking_items/_links?ids='+selIds,null,'_links');//NO I18N
                if(getLinks){
                    if(getLinks.links){
                        bookingDetObj.getAllBookedAssetsList[getLinks.id]._links=getLinks.links;
                    }
                    else{
                        getLinks.forEach(function(bookingItem){
                            bookingDetObj.getAllBookedAssetsList[bookingItem.id]._links=bookingItem.links;
                        });
                    }
                }
            }
            $asset_booking_form.putAndPostOperation("booking_items/_mark_as_ready?ids="+selIds,"PUT",null,"readytopickp",null,completeCallBack);
        };
        //Render all history in booking details page by clicking history tab
        bookingDetObj.historyTabRender=function(bookingId,e){
            var container = "history-content-section",//NO I18N
                url = "/common/ViewHistory.jsp?id="+bookingId+"&module=asset_bookings&key=booking_history_sort_order"; //No I18N
                jQuery("#" + container).html('<div class="pos-rel">' + ajaxBar() + '</div>').load(url);
                setTimeout(function(){
                    if(jQuery('#history_content').prev().hasClass("pos-rel")){
                        jQuery('#history_content').prev().remove();
                    }
                },100)
        };
        bookingDetObj.openBookedAssetLoanPopup=function(){
            jQuery('<div class="pos-rel" id="common_load_bar">' + ajaxBar() + '</div>').insertBefore( "#booking_details_tab");// No I18N
            //setTimeout(function(){
                $asset_booking_details.checkAvailIds = {};
            var parentElement = jQuery('#asset-loan'),
                getBookingsAssetData = [],
                getBookingsAssetId = jQuery('#loanDialog').attr('data-book-id'),
                getBookingsIds = bookingDetObj.getSelectedIDs(),
                userData,start_time,end_time;
                bookingDetObj.assetNames = [];
                bookingDetObj.getSelectedChkBoxIds = getBookingsIds;
                jQuery('.ui-dialog,#ast_desc_remng_cnt').remove();
                if(getBookingsIds.length>0){
                    var inputData = {
                        "list_info":{//NO I18N
                            "start_index":"1",//NO I18N
                            "row_count":"100",//NO I18N
                            "get_total_count":true,//NO I18N
                            "search_criteria": {//NO I18N
                                "field": "asset",//NO I18N
                                "condition": "!=",//NO I18N
                                "value": null,//NO I18N
                                children:[{
                                    "field": "is_loaned",//NO I18N
                                    "condition": "!=",//NO I18N
                                    "value": true,//NO I18N
                                    "logical_operator":"AND"//NO I18N
                                },
                                {
                                    "field":"booking.id",//NO I18N
                                    "condition":"=",//NO I18N
                                    "value":getBookingsAssetId,//NO I18N
                                    "logical_operator":"AND"//NO I18N
                                },
                                {
                                    "field":"booking_item.id",//NO I18N
                                    "condition":"=",//NO I18N
                                    "values":getBookingsIds,//NO I18N
                                    "logical_operator":"AND"//NO I18N
                                }]
                            },
                        }
                    };
                    var getAllBookedAssets = bookingDetObj.getAllLoanDataAtOnce("booked_assets","booked_assets",inputData);//NO I18N
                }
                for(var j=0;j<getAllBookedAssets.length;j++){
                    if(getAllBookedAssets[j]){
                        userData = getAllBookedAssets[j].booking.booked_by;
                        start_time = getAllBookedAssets[j].booking.start_time;
                        end_time = getAllBookedAssets[j].booking.end_time;
                        if(getAllBookedAssets[j].asset){
                            bookingDetObj.assetNames.push(getAllBookedAssets[j].asset.name);
                            getBookingsAssetData.push(getAllBookedAssets[j].asset);
                        }
                    }
                }
                var getReturnedVal = bookingDetObj.moreAssetsInLoanPopup(),
                    astName = getReturnedVal.assetsByCount,
                    count = getReturnedVal.count,
                    remainingAssets = bookingDetObj.assetNames.length - count;
                //convert time into particular format
                var strTime = getFormattedDateTime(new Date(),true);
                if(bookingDetObj.assetNames.length>0){
                    renderhbs('#loanDialog','booking-details-page-list-view',{// No I18N
                        bookingData:getBookingsAssetData,
                        start_time:start_time,
                        end_time:end_time,
                        currTime : strTime,
                        userData:userData,
                        userName:bookingDetObj.userName,
                        isLoanedPopup:true
                    },null,'asset-booking');//NO I18N

                    renderhbs('#assetNames','booking-details-page-list-view',{// No I18N
                        name:astName,
                        remainingAssets:remainingAssets,
                        count:count,
                        isAssetName : true,
                        isLVAssetDetails : true
                    },null,'asset-booking');//NO I18N   

                    bookingDetObj.bookedDatas = {
                        bookingData:getBookingsAssetData,
                        start_time:start_time,
                        end_time:end_time,userData:userData,
                        bookingId:getBookingsAssetId
                    }
                    jQuery('#loanPopup').dialog({
                        width     : 725,
                        resizable : false,
                        maxHeight : 440,
                        modal: true,
                        close:function(){
                            jQuery('.ui-dialog,#common_load_bar').remove();
                        }
                    });
                    jQuery('.ui-dialog-titlebar-close').attr("title",translate('sdp.common.close')).attr("rel","uitip")
                    initTooltip('.ui-dialog');//NO I18N
                }else{
                    jQuery('#common_load_bar').remove();
                    showalert('failure',translate('booking.noassets.loaned'),"isAutoHide=false");//NO I18N
                }
                jQuery('#loadingIcon').hide();
                showDescriptionRemainingCount('#checkoutComments')//NO I18N
            //},1)
            
        };
        bookingDetObj.getAllLoanDataAtOnce=function(url,entity,inputData){
            var entityData = [], hasmorerows = true;
                    while(hasmorerows){
                        sdpAjax({
                            url:'/api/v3/'+url,//NO I18N
                            cache: false,
                            async: false,
                            data:sdpAjaxInputData(inputData),
                            success: function(response)
                            {
                                entityData = entityData.concat(response[entity]);
                                if(response.list_info && response.list_info.has_more_rows == true){
                                    inputData.list_info.start_index = entityData.length + 1;
                                }else{
                                    hasmorerows=false;
                                }
                            },
                            error:function(){
                                hasmorerows=false;
                            }
                        });
                    }
                    return entityData;
        },
        // Get all assets by clicking "more" button inside loan popup 
        bookingDetObj.getMoreAssetsWhileClick=function(ele){
            var getReturnedVal = bookingDetObj.moreAssetsInLoanPopup(ele),
                astName = getReturnedVal.assetsByCount,
                count = getReturnedVal.count,
                remainingAssets = bookingDetObj.assetNames.length - count;

                renderhbs('#assetNames','booking-details-page-list-view',{// No I18N
                    name:astName,
                    remainingAssets:remainingAssets,
                    count:count,
                    isAssetName : true,
                    isLVAssetDetails : true
                },null,'asset-booking');//NO I18N
        }
        // Call back function for Render all assets inside loan popup 
        bookingDetObj.moreAssetsInLoanPopup = function(ele){
            var eleId = ele && jQuery(ele).attr('id'),
                count = 1,
                tempArr = [], joinArr = "", arrayWithData = bookingDetObj.assetNames;
                if(eleId=="more"){
                   count = Number(jQuery(ele).attr('data-count')) + Number(100);
                }
                if(arrayWithData.length>0){
                    for(var i=0;i<count;i++){
                        if(arrayWithData[i]){
                            tempArr.push(arrayWithData[i]);
                        }
                    }
                }
                joinArr = tempArr.join(', ');
                return {
                    assetsByCount : joinArr,
                    count : count
                };
        };
        // function to check out selected assets for loan
        bookingDetObj.loanCheckOutFunction=function(){
            var saveBtn = jQuery("#create-loan");
            inProgressBtn(saveBtn, translate("sdp.asset.loan.add.inProgress"), true);

            var currDate = Date.now();
            var loanedAssets = [],
                assetDatas = bookingDetObj.bookedDatas.bookingData;
                for(var i=0;i<assetDatas.length;i++){
                    loanedAssets.push({
                        "asset": {//NO I18N
                            "id": assetDatas[i].id,//NO I18N
                            "name": assetDatas[i].name//NO I18N
                        }
                    });
                    
                    if((i!=0 && (i+1)%100==0) || (i == assetDatas.length -1)){
                        var inputData = {
                            "asset_loan": {//NO I18N
                                "booking": {//NO I18N
                                    "id": bookingDetObj.bookedDatas.bookingId//NO I18N
                                },
                                "loaned_assets": loanedAssets,//NO I18N
                                "start_time": {//NO I18N
                                    "value": currDate//NO I18N
                                },
                                "end_time": {//NO I18N
                                    "value": bookingDetObj.bookedDatas.end_time.value//NO I18N
                                },
                                "loaned_to": {//NO I18N
                                    "id": bookingDetObj.bookedDatas.userData.id//NO I18N
                                },
                                "comments": jQuery('#checkoutComments').val()//NO I18N
                            }
                        }
                        $asset_booking_form.putAndPostOperation("asset_loans","POST",inputData,'loaned');
                        loanedAssets = [];
                        bookingDetObj.disableReschedule();
                    }
                }
        };
        bookingDetObj.callbackAfterBodyRender=function(){
            jQuery("[data-booked-asset]").off('click').on('click',function(){
                $asset_booking_details.openAssociatePopup(this)
            })
           
        };
        return bookingDetObj;
}());
