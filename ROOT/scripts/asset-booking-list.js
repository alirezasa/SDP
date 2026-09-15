/* $Id$ */
var $asset_booking_list = (function(){
    "use strict";//NO I18N
    var bookingAssetObj = {};
        bookingAssetObj.onLoad=function(){
            bookingAssetObj.store_criteria = {};
            renderhbs("#asset-bookings-section","booking-page-list-view",{//NO I18N
                "isCheckBooking":sdp_app.IS_BOOKING_ENABLED//NO I18N
            },null,"asset-booking");//NO I18N
            bookingAssetObj.siteBookingTypeFilter();
            // if(sdp_app.IS_BOOKING_ENABLED && sdp_app.IS_ASSET_WIDGET_DISABLED){
            //     jQuery("#template-customize-info").show();
            // }
        };
        bookingAssetObj.rowDataConstruct=function(tableData){
            var inputObject = {},
                fieldsRequired = tableData.fields_required ? Object.keys(tableData.fields_required) : [];
                fieldsRequired.push("barcode");//No I18N
                inputObject.list_info = tableData.list_info;
                fieldsRequired && fieldsRequired.length>0 ? (inputObject.fields_required = fieldsRequired) : null;
                if(Object.keys(bookingAssetObj.store_criteria).length>0){
                    if(bookingAssetObj.store_criteria.search_criteria && Object.keys(bookingAssetObj.store_criteria.search_criteria)){
                        inputObject.list_info.search_criteria = bookingAssetObj.store_criteria.search_criteria;
                    }
                    if(bookingAssetObj.store_criteria.filter_by && Object.keys(bookingAssetObj.store_criteria.filter_by)){
                        inputObject.list_info.filter_by = bookingAssetObj.store_criteria.filter_by;
                    }
                    
                }
                return inputObject;
        };
        //navigation function - render listview table/graph based on navigation tabs
        bookingAssetObj.constructDataForTable = function(searchCriteria){
            bookingAssetObj.tableComp = "";
            var getPersoData = sdp_user.CLIENT_CONF.asset_bookings;   
            var getFieldDataPers = getPersoData ? getPersoData.fields_required  : null;
            var fields_required = {"display_id":"","product_type":"","start_time":"","end_time":"","booked_by":"","status":"","comments":""},//NO I18N

                table_content = {
                    "display_id":{//NO I18N
                        dataCelltransformer: bookingAssetObj.constructIdCellForBooking,
                        default:true
                    },
                    "product_type":{//NO I18N
                        dataCelltransformer: bookingAssetObj.constructAssetsByComma,
                        default:true
                    },
                    "start_time":{width: (getFieldDataPers && getFieldDataPers.start_time && getFieldDataPers.start_time.width) || "200px"},//NO I18N
                    "end_time":{width: (getFieldDataPers && getFieldDataPers.end_time && getFieldDataPers.end_time.width) || "200px"},//NO I18N
                    "created_on":{width: (getFieldDataPers && getFieldDataPers.created_on && getFieldDataPers.created_on.width) || "200px"},//NO I18N
                    "last_updated_on":{width: (getFieldDataPers && getFieldDataPers.last_updated_on && getFieldDataPers.last_updated_on.width) || "200px"},//NO I18N
                    "booked_by": { value_path: "booked_by.name" }, // NO I18N
                    "status": { value_path: "status.name",default:true}, // NO I18N
                    "purpose": { value_path: "purpose.name" } // NO I18N
                }
                $asset_booking_list.getsites.length>1 ? fields_required.site = "" : null;
                $asset_booking_list.getsites.length>1 ? table_content.site = {width:"100px",dataCelltransformer: bookingAssetObj.constructSite} : null;//NO I18N
                var urlHolder = {
                    url               : 'asset_bookings',//NO I18N
                    entity_name       : 'asset_bookings',//NO I18N
                    tableHolder       : "bookings",//NO I18N
                    paginationEnabled : true,
                    searchEnabled     : true,
                    sortingEnabled    : true,
                    discarded_fields  : ["id","asset_loans","booked_assets"],//NO I18N
                    columnChooserEnabled :true,
                    personalize_key   : "asset_bookings",//NO I18N
                    callbackSearchFunction : $asset_booking_list.searchCallBack,
                    width             : $asset_booking_route.getAssetBookingWidth - 265,
                    callbackAfterBodyRender : $asset_booking_list.callbackAfterBodyRender,
                };
                bookingAssetObj.tableComp = bookingAssetObj.constructTableComponent(fields_required,table_content,urlHolder,searchCriteria);
                
        };
        bookingAssetObj.searchCallBack = function(tabSearch,val,tableData){
            var crit_Obj = {}, critChildArray = [];
            var searchEntity = tableData.t_obj.options.entity_name;
            if(tableData.tableId=="viewassets_list"){
                var search_Obj = $asset_booking_details[tableData.tableId].t_obj.table_info.list_info.search_fields
                var metainfo = $asset_booking_details[tableData.tableId].t_obj.meta_info;
                var newSearchCriteria = tableData.t_obj.table_info.list_info.search_criteria;
                newSearchCriteria.children = [{condition: 'is', field: 'name', value: search_Obj.name,"logical_operator":"AND"}]// No I18N
                delete $asset_booking_details[tableData.tableId].t_obj.table_info.list_info.search_fields;
                $asset_booking_details[tableData.tableId].t_obj.table_info.list_info.search_criteria = newSearchCriteria;
                $asset_booking_details[tableData.tableId].refreshTable();
            }
            else{
                var search_Obj = bookingAssetObj.tableComp.t_obj.table_info.list_info.search_fields;
                var metainfo = bookingAssetObj.tableComp.t_obj.meta_info;
                jQuery.each(search_Obj,function(key,value){

                    var condition = "contains"; // No I18N
                    //as discussed with server team change key based on users in admin
                    if(key=="product_type"){// No I18N
                         key="booking_items.product_type.display_name";// No I18N
                    }
                    if(metainfo[key] && (metainfo[key].type === "long" ||  metainfo[key].type === "int")){ // No I18N
                         condition = "is"; // No I18N
                    }
                    critChildArray.push({
                         "field"            : key, // No I18N
                         "value"            : value, // No I18N
                         "condition"        : condition, // No I18N
                         "logical_operator" : "AND" // No I18N
                    });
               });
               if(bookingAssetObj.store_criteria && bookingAssetObj.store_criteria.search_criteria){
                    bookingAssetObj.store_criteria.search_criteria.logical_operator = "AND";//NO I18N
                    critChildArray = critChildArray.concat(bookingAssetObj.store_criteria.search_criteria);
               }
               delete bookingAssetObj.tableComp.t_obj.table_info.list_info.search_fields;
               bookingAssetObj.tableComp.t_obj.table_info.list_info.search_criteria = critChildArray;
               bookingAssetObj.tableComp.refreshTable();
            }
        };
        //construct table component for users/subscriptions list view
        bookingAssetObj.constructTableComponent = function(fields_required,header,urlHolder,seachCriteria,addlOptions){
            var table_info = {
                "list_info":{//NO I18N
                    "start_index":"1",//NO I18N
                    "row_count":seachCriteria && seachCriteria.row_count||"10",//NO I18N
                    "filter_by":seachCriteria && seachCriteria.filter_by,//NO I18N
                    'get_total_count':true//NO I18N
                },
                fields_required:fields_required
            }

            if(urlHolder.tableHolder=="bookings" || urlHolder.tableHolder=="assets_list" || urlHolder.tableHolder=="purposeconfig" || urlHolder.tableHolder=="viewassets_list"){
                var table_info = table_comp.getTableInfo(urlHolder.personalize_key||addlOptions.personalize_key);
                /**For removing filter_by in Other assets list info */
                if(!seachCriteria || !seachCriteria.filter_by){
                    delete table_info.list_info.filter_by
                }
                !table_info.fields_required ? table_info.fields_required=fields_required : null;
            }

            var options = {
                tableHolder          : urlHolder.tableHolder,
                row_inputdata        : bookingAssetObj.rowDataConstruct(table_info),
                getmetaInfo          : urlHolder.getmetaInfo || true,
                meta_data            : urlHolder.meta_data,
                static_meta          : urlHolder.static_meta,
                isODAPI              : true,
                callbackURL          : urlHolder.url,
                entity_name          : urlHolder.entity_name,
                metainfo_entity      : urlHolder.url,
                paginationEnabled    : urlHolder.paginationEnabled,
                searchEnabled        : urlHolder.searchEnabled,
                sortingEnabled       : urlHolder.sortingEnabled,
                multiDeleteEnabled   : true,
                personalize_key      : urlHolder.personalize_key,
                columnChooserEnabled : urlHolder.columnChooserEnabled,
                callbackRowfunction  : bookingAssetObj.rowDataConstruct,
                discarded_fields     : urlHolder.discarded_fields,
                staticHeader         : urlHolder.staticHeader,
                height               : urlHolder.height,
                bulkSelectionSetting : urlHolder.bulkSelectionSetting,
                isFR_ListInfo_Support: true,
                lazyloadingEnabled   : urlHolder.lazyloadingEnabled,
                staticHeader         : true,
                width                : urlHolder.width,
                callbackAfterBodyRender : urlHolder.callbackAfterBodyRender,
            }

            if(urlHolder.callbackSearchFunction){
                options.callbackSearchFunction = urlHolder.callbackSearchFunction
           }

            seachCriteria ? Object.assign(options.row_inputdata.list_info,seachCriteria) : null;

            if(addlOptions){
                jQuery.extend(true,options,addlOptions);
            }
            if((urlHolder.tableHolder=="bookings" && table_info.list_info.search_criteria && (table_info.list_info.search_criteria.field == "status.name" || table_info.list_info.search_criteria.children)) || (urlHolder.tableHolder=="assets_list" && table_info.list_info.search_criteria)){
                delete table_info.list_info.filter_by;
            }
            return new tableComponent(table_info, {"header":header},options,null);//NO I18N
        };
        bookingAssetObj.constructIdCellForBooking = function(tableData){
            return '<a href="/" data-event="click" name="booking-list" data-handler="$asset_booking_route.renderPage({mode:\'details\',entity_id:'+tableData.row_data.id+'})" nonce='+sdpNonce+'>'+tableData.row_data.display_id+'</a>';
        };
        bookingAssetObj.constructSite = function(tableData){
            if(!tableData.row_data.site){
                return '<span title="'+translate('sdp.admin.technician.addtechnician.nosite')+'" rel="uitip" mode_ellipsis="true">'+translate('sdp.admin.technician.addtechnician.nosite')+'</span>';
            }
            return '<span title="'+e_attr(tableData.row_data.site.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(tableData.row_data.site.name)+'</span>';
        };
        bookingAssetObj.constructCheckBoxCell = function(tableData,options,currTabObj){
            var tr = tableData.row_data;
            if((tr.status && tr.status.internal_name==="Loaned") || (currTabObj.tableId=="assets_list" && ($asset_booking_details.getSepBookingIds[$asset_booking_details.bookingItemsId].loanedAssetIds.length>0 && $asset_booking_details.getSepBookingIds[$asset_booking_details.bookingItemsId].loanedAssetIds.indexOf(tr.id)!=-1))){
                return '';
            }

            if(currTabObj.tableId=="bookingsDet"){
                if($asset_booking_details.getBookedAssetsDetails){
                    const checkIsCancelAvail = $asset_booking_details.getBookedAssetsDetails._links.find(field => field.name === "cancel");
                    if(checkIsCancelAvail){
                        var cancelBtn = (!tableData.row_data.status || tableData.row_data.status.internal_name!=="Loaned") ? '<span class="cspr close-red ml10 mt5 pos-abs cur-ptr" rel="uitip" name="booking-cancel" data-id="cancel_'+tableData.row_data.id+'" data-event="click" data-handler="$asset_booking_details.cancelledPopup('+tableData.row_data.id+')" nonce='+sdpNonce+' title="'+translate('booking.cancel')+'" role="img"></span>' : "";
                        return '<input type="checkbox" value="' + e_attr(tableData.row_data.id) + '" data-table-checkbox aria-label="'+translate("booked.assets")+'" class="mt3"> '+cancelBtn;
                    }
                }
                
            }
            var getAriaLabel = currTabObj.tableId=="assets_list" ? "sdp.purchase.addNew.view.Assets.title" : "booking.purpose.config";//NO I18N
            /*Checkbox icon not shows for default fields*/
            return '<input type="checkbox" value="' + e_attr(tableData.row_data.id) + '" data-table-checkbox aria-label="'+translate(getAriaLabel)+'" class="mt3">';
        };
        bookingAssetObj.constructAssetsByComma = function(tableData){
            if(tableData.row_data && tableData.row_data.product_types && tableData.row_data.product_types.length ==0){
                return '<span title="'+translate('sdp.asset.details.empty.deleted')+'">'+translate('sdp.requests.viewrequest.noworkstation')+'</span>'
            }
            var assetsJoin = tableData.row_data.product_types && tableData.row_data.product_types.length>0 ? tableData.row_data.product_types.join(', ') : '-';
                return '<a href="/" data-event="click" name="booking-list" data-handler="$asset_booking_route.renderPage({mode:\'details\',entity_id:'+tableData.row_data.id+'})" nonce='+sdpNonce+' title="'+e_attr(assetsJoin)+'" rel="uitip" mode_ellipsis=true>'+e_html(assetsJoin)+'</a>';

        };
        bookingAssetObj.callbackAfterBodyRender=function(){
            $sdEventListener("[name='booking-list']");//NO I18N
            $sdEventListener("[name='booking-cancel']");//NO I18N
            
        };
        bookingAssetObj.siteBookingTypeFilter = function(){
            var inputData = {
                "list_info":{//NO I18N
                    "sort_field":"id",//NO I18N
                    "sort_order":"asc"//NO I18N
                }
            };
            var parentElement = jQuery('#asset-bookings-section'),
                getAllStatus = $asset_booking_form.getAllDataAtOnce('asset_bookings/status',null,'status',inputData),//NO I18N
                getAllSites = $asset_booking_form.getAllDataAtOnce('asset_bookings/site',null,'site'),//NO I18N
                statusData=[{id:'all',text:translate("booking.status.all")}];
                //its a object
                bookingAssetObj.getsites = getAllSites;


                if(getAllSites.length>1){
                    parentElement.find('#siteFilter').show();

                }else{
                    parentElement.find('#siteFilter').hide();
                }

                jQuery.each(getAllStatus,function(index,val){
                    statusData.push({
                        id  : val.internal_name,
                        text: val.name
                    });
                });
                statusData.splice(2, 0, {id:'pending',text:translate("booking.status.pending")});
                var selStatusData = sdp_user.CLIENT_CONF.bookingTypeFilter && sdp_user.CLIENT_CONF.bookingTypeFilter.id ? sdp_user.CLIENT_CONF.bookingTypeFilter : statusData[1];
                parentElement.find('#bookingTypeFilter').select2({
                    data : statusData,
                    width : 200
                }).select2('data',selStatusData).on('change',function(){//NO I18N
                    bookingAssetObj.store_criteria = bookingAssetObj.searchCriteriaFun();
                    bookingAssetObj.constructDataForTable(bookingAssetObj.store_criteria);
                    addPersonalization("bookingTypeFilter", jQuery(this).select2('data'));//NO I18N
                    
                });


                parentElement.find('#siteFilter').sdp_select2({
                    value:{id:'all',text:translate('sdp.admin.org.technician.allsite')},//NO I18N
                    width : 200,
                    url: [{
                        url:"/api/v3/asset_bookings/site",//NO I18N
                        field: "site",//NO I18N
                        list_info:{start_index:1,row_count:100}
                    }],
                    default_option:{id:'all',text:translate('sdp.admin.org.technician.allsite')}//NO I18N
                });
                parentElement.find('#siteFilter').on('change',function(){//NO I18N
                    bookingAssetObj.store_criteria = bookingAssetObj.searchCriteriaFun();
                    bookingAssetObj.constructDataForTable(bookingAssetObj.store_criteria);
                });
                parentElement.find('#bookingTypeFilter').trigger("change");
        };
        bookingAssetObj.searchCriteriaFun = function(inputData,fromFun){
            bookingAssetObj.store_criteria = {};

            var getCurrSite = jQuery('#siteFilter').select2('data').id,//NO I18N
                getCurrStatus = jQuery('#bookingTypeFilter').select2('data').id,//NO I18N
                inputData = {};

            if(getCurrSite=="all"){
                inputData.search_criteria = null;
            }else if(getCurrSite==-1){
               inputData.search_criteria = {
                    "field": "site",//NO I18N
                    "condition": "=",//NO I18N
                    "value": null//NO I18N
                }
            }else{
                inputData.search_criteria = {
                    "field": "site.id",//NO I18N
                    "condition": "=",//NO I18N
                    "value": getCurrSite//NO I18N
                }
            }

            if(getCurrStatus=="all" || getCurrStatus=="pending"){
                inputData.filter_by = {
                    "name": getCurrStatus//NO I18N
                }
            }else{
                var obj = {
                    "field": "status.name",//NO I18N
                    "condition": "=",//NO I18N
                    "value": getCurrStatus,//NO I18N
                    "logical_operator":"AND"//NO I18N
                };
                if(inputData.search_criteria){
                    inputData.search_criteria.children = [obj]
                }else{
                    delete obj.logical_operator;
                     inputData.search_criteria = obj;
                }

            }

            return inputData;
        };
        return bookingAssetObj;
}());