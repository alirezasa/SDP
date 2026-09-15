
/* $Id$ */
var table_comp_request, table_combined_task,kanban_comp_request;
var requests_table = (function () {
    var r = {};
    /* list view current mode eg. classic | table */
    r.viewMode = ""; //No I18N
    /* filter view */
    r.filterBy = ""; //No I18N
    /* check the current view is unified */
    r.isUnifiedView = false;
    /** By default edit mode is true */
    r.inlineEditEnabled=true;
    /** By Default Filter is enabled */
    r.filterEnabled=true;
    /** Remove Body scroll */
    /** By Default hideFilter is false */
    r.hideFilter = false;
    r.disableBodyScroll=false;
    /** By default the addIn is false */
    r.addIn = false;
    /** Advanced portal setting data*/
    r.self_service_portal_settings = {};
    r.initComponent = function (view_mode) {
        var _self = this,  rl = {};
            var t_info = {};
            _self.addIn = !!window.isAddin;
            _self.isUnifiedView = requestListViews.isUnified;
            if(view_mode == "classic"){ // No I18N
                t_info = table_comp.getTableInfo("classic_requests"); // No I18N
                t_info.personalize_key = "classic_requests";// No I18N
            } else if(view_mode == "rq_leftpanel" && !_self.isUnifiedView){ // No I18N
                t_info = table_comp.getTableInfo("rq_leftpanel"); // No I18N
                t_info.personalize_key = "rq_leftpanel";// No I18N
                this.sort_field ? t_info.list_info.sort_field = this.sort_field : undefined;
                this.sort_order ? t_info.list_info.sort_order = this.sort_order : undefined;
            } else if (view_mode == "combined" || (view_mode == "rq_leftpanel" && _self.isUnifiedView)) { // No I18N
                var personlizeKey = view_mode == "rq_leftpanel" ? "leftpanel_com_request" : "combined_requests";// No I18N
                t_info = getPersonalizeData(personlizeKey);// No I18N
                if(jQ.isEmptyObject(t_info)){
                    t_info = {
                        "combined_modules_object" : { //NO I18N
                            "request" : { //No I18N
                                "fields_required" : view_mode == "rq_leftpanel" ? {"subject":"","requester":"","due_by_time":"","notification_status" : "","has_notes" : "","is_service_request": ""} : {"subject":"","requester":"","due_by_time":"","status":"","priority":"","group":"","site":"","notification_status" : "","has_notes" : "","is_service_request": "","technician":""} //No I18N
                            },
                            "task" : { //No I18N
                                "fields_required" : { "priority":"","status":"","title":"","group" : "","owner" : ""} //No I18N
                            }
                        },
                        "list_info": { // No I18N
                            "row_count": "25", // No I18N
                            "sort_order":"desc" // No I18N
                        }
                    };
                }
                if(view_mode == "rq_leftpanel"){ //No I18N
                    this.sort_field ? t_info.list_info.sort_field = this.sort_field : undefined;
                    this.sort_order ? t_info.list_info.sort_order = this.sort_order : undefined;
                }
                
                r.task_tinfo = JSON.parse(JSON.stringify(t_info));
                r.request_tinfo = JSON.parse(JSON.stringify(t_info));
                var taskObj = t_info.combined_modules_object.task; //NO I18N
                var reqObj = t_info.combined_modules_object.request; //NO I18N
                r.task_tinfo.fields_required = taskObj.fields_required;
                if(taskObj.column_order){
                    r.task_tinfo.column_order = taskObj.column_order;
                }
                delete r.task_tinfo.combined_modules_object;
                r.request_tinfo.fields_required = reqObj.fields_required;
                if(reqObj.column_order){
                    r.request_tinfo.column_order = reqObj.column_order;
                }
                delete r.request_tinfo.combined_modules_object;
                t_info = r.request_tinfo;
                t_info.personalize_key = personlizeKey;// No I18N
            }
            else if (view_mode == "kanban") {
                t_info.list_info = {
                    start_index: "1"
                };
                t_info.filterBy = this.filterBy;
            }
            else {
                t_info = table_comp.getTableInfo("table_requests"); // No I18N
                t_info.personalize_key = "table_requests"; // No I18N
            }
            if(_self.from && _self.from != "null" && _self.from != "cf_request"){
                //To have the same Column chooser personalization for dashboard and Drill down
                var selfFrom = _self.from=='admin' ? 'dashboard' : _self.from; // No I18N
                t_info = table_comp.getTableInfo("table_requests_"+selfFrom,"table_requests"); // No I18N
                t_info.personalize_key = "table_requests_"+selfFrom; // No I18N
            }
            if(view_mode == "table"){
                if((jQuery.isArray(this.search_criteria) && this.search_criteria.length > 0) ||
                    (!jQuery.isArray(this.search_criteria) && !jQuery.isEmptyObject(this.search_criteria))){
                     t_info.list_info.default_search_criteria = this.search_criteria;
                }
            }
            t_info.viewMode = r.viewMode = view_mode;//No I18N
            if((jQuery.isArray(this.search_criteria) && this.search_criteria.length == 0) ||
                (!jQuery.isArray(this.search_criteria) && jQuery.isEmptyObject(this.search_criteria))){
                delete this.search_criteria;
            }

            if (_self.filterBy) {
                t_info.list_info.filter_by = _self.filterBy;
                requests_table.searchCriterFilterByI18n = viewDisplayName[_self.filterBy.name];
            }
            /**Removeing the filter_by option if no filterBy is passed
             * Note: This use case working for custom filter preview options or request list view without filterby
            */
            else{
                delete t_info.list_info.filter_by;
            }

            //if critieria is persent on url
            if(this.search_criteria){
                t_info.list_info.search_criteria = typeof this.search_criteria == "string" ? JSON.parse(this.search_criteria) : this.search_criteria; //No I18N
            }
            /**Global search values */
            if(_self.gsearch){
                t_info.list_info.gsearch = _self.gsearch;
                delete t_info.list_info.filter_by;
            }

            if(_self["for"]){
                t_info["for"] = _self["for"];
            }


            if(isMSP){
    			t_info.list_info.account_id = getAccountId()//No I18N
            }

            _self.callTableComponent(t_info);
            return t_info;
        },
        r.callTableComponent = function (t_info) {
            var _self = this;
            _self.service_requests_ids = [];
            var table_content = {},
                options = {};
            table_content.header = _self.headerdataConstruct(t_info, _self);
            // SD-109291 : Removing the approval_status from column chooser and fields required when 'show approval tab to requester' is disabled.
            let show_approval_tab_to_requester = null;
            if(sdp_user.USERTYPE == 'Requester'){ // NO I18N
                let sspData = _self.getSspData();
                if(sspData && (typeof sspData.show_approval_tab == 'boolean')){
                    show_approval_tab_to_requester = sspData.show_approval_tab;
                    if(!show_approval_tab_to_requester){
                        t_info.column_order.remove('approval_status'); // NO I18N
                        delete t_info.fields_required.approval_status;
                        delete table_content.header.approval_status;
                    }
                }
                if(table_content.header.assigned_time){
                    delete table_content.header.assigned_time;
                }
            }
            options.tr_class = "fx:requests_table.isRead"; //No I18N
            options.paginationEnabled = true;
            t_info.viewMode == "table" ? options.searchEnabled = true: ""; //No I18N
            options.columnChooserEnabled = true;
            options.staticHeader = true;
            options.getmetaInfo = true;
            options.personalize_key = t_info.personalize_key;
            options.row_inputdata = _self.rowdataConstruct(t_info, _self);
            options.callbackRowfunction = _self.rowdataConstruct;
            options.callbackURL = "requests"; // No I18N
            options.entity_name = "requests"; // No I18N
            options.get_total_count = _self.show_total_count ? _self.show_total_count : false;
            options.metainfo_entity = "requests";//No I18N
            options.support_search_criteria = true;
            options.isFR_ListInfo_Support = true;
            options.udfValuePath=true;
            // to skip the user audit only for request all get list call from details page.
            options.skip_user_audit = t_info.viewMode == "rq_leftpanel" ? true : false; //No I18N

            if(t_info.viewMode === "table"){
                options.callbackSearchFunction = _self.urlSearchCallBackFunction;
                options.urlSearch = !window.location.pathname.includes("/ListViewFilter.do"); // NO I18N
            }
            if(t_info.viewMode === "classic" || t_info.viewMode === "table"){
                options.refreshEnabled = requestListData.refresh ? requestListData.refresh.showRefresh : false;
                options.listSettingEnabled = true;
                options.listSettingOptions = {
                    enableSettings: ["record_per_page","refresh_frequency"], //No I18N
                    disableSettings: ["text_wrapping"] //No I18N
                }
                //SD-102042
                if(requestListData.refresh && !requestListData.refresh.showRefresh){
                    options.listSettingOptions.disableSettings = ["text_wrapping","refresh_frequency"]; //No I18N
                    options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N
                }
                /**
                 * Request list view in listpopup  need to remove reset personlization, reset width options, listview refresh
                 */
                if(_self.from === "report" || _self.from === "admin"){ //No I18N
                    options.listSettingOptions.disableSettings = ["text_wrapping","reset_personalization","reset_column_width"]; //No I18N
                    options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N
                }
                //When requester login need to remove the refresh frequecny
                if(sdp_user.USERTYPE !== "Technician"){
                    options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N
                }
            }
            if(t_info.viewMode === "combined"){ //NO I18N
                options.listSettingEnabled = true;
                options.listSettingOptions = {
                    enableSettings: ["record_per_page","refresh_frequency"], //No I18N
                    disableSettings: ["text_wrapping","reset_personalization"] //No I18N
                }
            }
            // t_info.viewMode === "classic" || t_info.viewMode === "table" && (options.trashEnabled = true) //No I18N
            options.reinitializeCalback = function(){
                requestListViews.initRequestListView();
            }

            if (_self.columnChooserObj) { //TaskID:74878 ->  Restricting the ColumnChooser Count in rq_leftpanel
                options.max_allowed_fields = t_info.viewMode == "rq_leftpanel" ? _self.columnChooserObj.req_leftpanel_selectable_field : _self.columnChooserObj.selectable_field; //No I18N
            } else {
                options.max_allowed_fields = 20;
            }
            options.row_min_height = 60;
            /** setting height for the Request List view - Classical and Combined view */
            var paddingBottom = window.externalframe ? 0 : 20;
            var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
            if(jQuery('#header-placeholder').length == 0) {
                options.height = jQuery(window).height() - jQuery('#top-header').height() - paddingBottom - chatbar_height ;  //No I18N
            } else {
                options.height = jQuery(window).height() - jQuery('#header-placeholder').height() - paddingBottom - chatbar_height;  //No I18N
            }
            options.height -= jQuery("#listcontrols").outerHeight(true, true);
            t_info.viewMode === "table" && (options.height += 35); //No I18N
            options.isFR_ListInfo_Support = true;
            /**Handling failure message from API */
            options.callbackOnAPIFailure = _self.apiFailuerCallback;
                options.inlineEditEnabled = true;
                options.inlineEditEntity = "request"; //No I18N
                options.inlineEditUrl = "requests"; //No I18N
                options.nodataString = '<div class="req-empty-list empty-state tc fh">'+
                '    <div class="empty-svg">'+
                '        <div class="empty-content">'+
                '            <span class="empty-title">'+ getMessageForKey('common.emptytext1') + '</span>' +
                '            <p class="mt5">'+getMessageForKey('common.emptytext2')+'</p>'+
                '        </div>'+
                '    </div>'+
                '</div>';
            if(sdp_user.USERTYPE === "Technician"){ //NO I18N
                options.nodataStringHTML = options.nodataString;
                options.nodataStringText =  getMessageForKey('zia.bot.requests.empty');
            }

            // For the requester, we doesn't show the image
            if(sdp_user.USERTYPE === "Requester"){ // NO I18N
                options.nodataString = '';
            }
            options.included_fields = ["id","technician","is_first_response_overdue", "is_overdue","is_read","linked_to_request","is_fcr","has_attachments","short_description","onhold_scheduler","unreplied_count","lifecycle","is_editing_completed","cancel_requested_is_pending"];  //No I18N
            options.must_included_fields = ["editing_status","status.stop_timer","status.in_progress"]; //No I18N
            if(isMSPOrSCP && t_info.viewMode == "table" && !window.externalframe && sdp_user.USERTYPE == "Technician" && sdp_app.SHOW_BILLING_CONTRACT_DETAILS_TO_USER){
                options.must_included_fields.push("is_contract_consumed");
            }
            options.discard_without_displayname = true;
            options.sortingEnabled = true;
            //options.advSrchFiltEnabled = true;
            options.color_settings = color_settings_helper.color_settings;
            options.staticCheckbox = true;
            // requests id duplicating so we provide the table holder
            if(!_self.isUnifiedView && (t_info.viewMode === "classic" || t_info.viewMode === "table" || t_info.viewMode === "rq_leftpanel")){
                options.tableHolder = "requests_list"; // No I18N
            }
            /*
            Classic and combined activity based on table component initialize start here
            */
            if (t_info.viewMode == "classic" || t_info.viewMode == "combined" || t_info.viewMode == "rq_leftpanel" || t_info.viewMode == "kanban") {
                options.view = "kanban";//No I18N
                if (t_info.viewMode == "rq_leftpanel") {
                    options.nodataString = '<div class="pos-rel text-center p10" style="top:50%;transform:translateY(-50%);">'+getMessageForKey("sdp.requests.listview.norequestmessage");+'</div>';
                    options.inlineEditEnabled = false;
                    options.width = t_info.viewMode == "rq_leftpanel" ? 279: 320; //No I18N
                    if(window.isAddin){
                        options.width = jQ("#Right-Section").outerWidth();
                    }
                    options.lazyloadingEnabled = true; //No I18N
                    options.newtab_settings = {
                        enabled: t_info.viewMode =="rq_leftpanel", //NO I18N
                        link_string:"WorkOrder.do?woMode=viewWO&woID=${id}" //No I18N
                    }
                    if(t_info.viewMode !== "kanban") {
                        options.selectedId = woID ? woID : "";
                    }
                }else{
                    options.width = jQ("#listview").width();
                    (t_info.viewMode == "classic") && options.listSettingOptions.enableSettings.push("sorting"); //No I18N
                    if(t_info.viewMode == "kanban" || t_info.viewMode == "rq_leftpanel" ){
                        options.listSettingEnabled = false;
                    }
                    //fixing the listview height
                    var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
                    jQuery('#header-placeholder').length == 0 ? options.height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : options.height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - 80);//No I18N
                    //bulkaction settings
                    if (!_self.isUnifiedView) {
                        options.bulkSelectionSetting = {
                            constructSelectedListCB: function(data){
                                var reqicon = '<span class="icon-sm disp-ib mr5 '+(data.is_service_request ? "cspr service-req icon-sm mt3" : "cspr incident-req icon-sm mt3")+'"></span>'; //No I18N
                                return '<span rel="uitip" mode_ellipsis="true" title="'+ZSEC.Encoder.encodeForHTMLAttribute(data.subject)+'">'+reqicon+'#'+data.id+' '+ZSEC.Encoder.encodeForHTML(data.subject)+'</span>';
                            },
                            selectionDisplayField: "subject", // No I18N
                            unSelectionCallback: function (elm) {
                                requestListViews.toggleCheckbox(elm);
                            },
                            selectionCallback: function (elm) {
                                requestListViews.toggleCheckbox(elm);
                            }
                        }
                    }
                }
                t_info.viewMode == "classic" || t_info.viewMode == "combined" ? options.view_mode = "linear" : undefined ; //No I18N
                options.discard_without_displayname = true; // No I18N
                //included_fields - To avoid discarded by TableComponent
                options.column_settings = {
                    "default_position": 2,//No I18N
                    "assign_label_width": false,//No I18N
                    "assign_content_width":false,//No I18N
                    "columns": [{//No I18N
                        "size": 1//No I18N
                    }, {
                        "size": 11,//No I18N
                        "pipe_separation": true, //No I18N
                        "row_count": 2, //No I18N
                        "default_rowposition": 2//No I18N
                    }]
                };
                if(t_info.viewMode === "kanban") {
                    options.column_settings.row_custom_class = "kanban-list";   //No I18N
                    // options.column_settings.cell_custom_class = "font-small";
                    // options.column_settings.label_custom_class = "sb";
                }
                if (t_info.viewMode !== "rq_leftpanel" && t_info.viewMode !== "kanban") {
                    options.icon_settings = {
                        "show_icons_Bottom": true, //No I18N
                        "position": 2, //No I18N
                        "isPrepend":true,  //No I18N
                        "rowPosition" : 2,  //No I18N
                        "class": "req_icons disp-ib vmiddle" //No I18N
                    };
                } else {
                    options.icon_settings = {
                        "show_icons_Bottom": true, //No I18N
                        "position": 2, //No I18N
                        // "isPrepend":true,  //No I18N
                        "rowPosition" : 2,  //No I18N
                        "class": "req_icons mt5" //No I18N
                    };
                    options.get_total_count = true;
                }

                if (_self.isUnifiedView) {
                    options.callbackURL = "activities"; // No I18N
                    options.entity_name = "activities"; // No I18N

                    options.combined_settings = {
                        "module": "request", //No I18N
                        "component_type": "child", //No I18N
                        "columnchooser": { //No I18N
                            "id": "request", //No I18N
                            "title": "Request" //No I18N
                        },
                        "parentComponent": "table_combined_task" //No I18N
                    }
                    options.changeComponentObject = _self.changeComponentObject;
                } else {
                    options.paginationEnabled = true;
                    options.callbackURL = "requests"; // No I18N
                    options.entity_name = "requests"; // No I18N
                    options.sortingEnabled = true;
                }
                if(window.isMSP && t_info.viewMode === "rq_leftpanel" && options.entity_name === "requests") {
                    // appending ACCOUNTID as 0 for fetching left panel requests alone in request details page to retrieve requests list based on thread local filter and not based on header account.
                    options.callbackURL = options.callbackURL + "?ACCOUNTID=0"; // No I18N
                }
            }
            /**Table  */
            else {
                options.width = jQ("#listview").width();
                options.height -= 86;
                options.bulkSelectionSetting = {
                    constructSelectedListCB: function(data){
                        var reqicon = '<span class="icon-sm disp-ib mr5 '+(data.is_service_request ? "cspr service-req icon-sm mt3" : "cspr incident-req icon-sm mt3")+'"></span>'; //No I18N
                        return '<span rel="uitip" mode_ellipsis="true" title="'+ZSEC.Encoder.encodeForHTMLAttribute(data.subject)+'">'+reqicon+'#'+data.id+' '+ZSEC.Encoder.encodeForHTML(data.subject)+'</span>';
                    },
                    selectionDisplayField: "subject", // No I18N
                    unSelectionCallback: function (elm) {
                        requestListViews.toggleCheckbox(elm);
                    },
                    selectionCallback: function (elm) {
                        requestListViews.toggleCheckbox(elm);
                    }
                }
            }

            //discarded_fields - To be discarded by TableComponent
            options.discarded_fields = [
                "impact_details", // NO I18N
                "description", // NO I18N
                "email_cc", // NO I18N
                "email_ids_to_notify", // NO I18N
                "email_to", // NO I18N
                "editor", // NO I18N
                "assets", // NO I18N
				"configuration_items", // NO I18N
                "closure_info", // NO I18N
                "service_approvers", // NO I18N
                "resolution", // NO I18N
                "service_sla", // NO I18N
                "ola_due_by_time", // NO I18N
                "is_vipuser", // NO I18N
                "is_reopened", // NO I18N
                "cancel_requested", // NO I18N
                "is_shared", // NO I18N
                "age_after_sla_response_violation", // NO I18N
                "has_dependency", // NO I18N
                "assigned_time", // NO I18N
                "sla_violated_technician", // NO I18N
                "fr_sla_violated_technician", // NO I18N
                "update_reason", // NO I18N
                "is_pending_status", // NO I18N
                "primary_asset", // NO I18N
                "responded_time", // NO I18N
                "response_time_elapsed", // NO I18N
                "total_unassigned_time", // NO I18N
                "service_cost", // NO I18N
                "reason_for_cancel", // NO I18N
                "time_elapsed", // NO I18N
                "sla_violated_group", // NO I18N
                "fr_sla_violated_group", // NO I18N
                "age_after_violation", // NO I18N
                "ola_status", // NO I18N
                "ola_group", // NO I18N
                "resources", // NO I18N
                "onhold_time", // NO I18N
                "is_service_request", // NO I18N
                "space" // NO I18N
              ]; 

            if(isMSPOrSCP)
            {
                options.discarded_fields.push("is_billable", "tags");
                if(isSCP){
                    options.discarded_fields.push("total_cost", "on_behalf_of");
                    if(!sdp_app.IS_PRODUCT_MODULE_ENABLED){
                        options.discarded_fields.push("product");
                    }
                }
                if(!sdp_app.SHOW_BILLING_CONTRACT_DETAILS_TO_USER){
                    options.discarded_fields.push("billing_status", "accountcontract", "is_active_contract");
                }
            }
            if (sdp_user.USERTYPE == "Requester") {
                options.discarded_fields.push("has_notes");
                options.discarded_fields.push("notification_status");
                options.discarded_fields.push("sla");
                // options.discarded_fields.push("first_response_due_by_time");
                options.discarded_fields.push("response_time_elapsed");
                options.discarded_fields.push("responded_time");
                options.discarded_fields.push("time_elapsed");
                options.discarded_fields.push("template");
                options.discarded_fields.push("scheduled_end_time");
                options.discarded_fields.push("scheduled_start_time");
                options.discarded_fields.push("service_category");
                options.discarded_fields.push("total_cost");
                options.discarded_fields.push("urgency");
                options.discarded_fields.push("impact");
                options.discarded_fields.push("has_linked_requests");
                options.discarded_fields.push("first_response_due_by_time");
                // SD-109291 : Removing the approval_status from column chooser and fields required when 'show approval tab to requester' is disabled.
                if(show_approval_tab_to_requester != null && !show_approval_tab_to_requester){
                    options.discarded_fields.push("approval_status");
                }
                if(isMSPOrSCP)
                {
                    options.discarded_fields.push("accountcontract", "is_active_contract", "billing_status");
                    if(isMSP) {
                        options.discarded_fields.push("account");
                    }
                    if(isSCP && sdp_user.ROLES.indexOf("SCPSalesRep") == -1) {
                        options.discarded_fields.push("account", "subaccount");
                    }
                }
            }
            if(_self.from === "cf_request"){
                options.discarded_fields.push("has_notes");
            }
            options.isODAPI = true;
            options.callbackAfterBodyRender = r.callAfterEveryRender;
            options.callbackAfterInitialRender = _self.callbackInitialRender;
            options.metaInfo_input = {"for":"request_list_view"}; //No I18N

        if (t_info.viewMode == "kanban") {
                options.support_search_criteria = true;
                options.isFR_ListInfo_Support = true;
                options.view_mode = "full_kanban";  //NO I18N
                options.entity_name_s = "request";  //NO I18N
                // options.viewName = "All_Requests";  //NO I18N
                options.default_group_by = "technician";    //NO I18N
                options.default_sort_field = "id";    //NO I18N
                options.default_sort_order = "desc";    //NO I18N
                options.default_fields_required = global_table_info.rq_leftpanel.fields_required;
                options.default_list_info = global_table_info.rq_leftpanel.list_info;
                options.default_row_count = 10;
                options.personalize_key = "kanban_requests";// No I18N
                options.group_by_list = [{
                    id: "technician",   //No I18N
                    name: getMessageForKey("common.technician"),    //No I18N
                    pl_name: translate("sdp.admin.leftpanel.users.technician"),    //No I18N
                    type: "user",    //No I18N
                    additional_fields: {
                        "status": "", //No I18N
                        "priority": ""    //No I18N
                    },
                    unassigned: {
                       name: getMessageForKey("sdp.common.unAssign")    //No I18N
                    }
                }, {
                    id: "status",   //No I18N
                    name: getMessageForKey("common.status"),    //No I18N
                    pl_name: translate("common.statuses"),    //No I18N
                    type: "color",   //No I18N
                    additional_fields: {
                        "technician": "", //No I18N
                        "priority": ""    //No I18N
                    }
                }, {
                    id: "priority", //No I18N
                    name: getMessageForKey("common.priority"),  //No I18N
                    pl_name: translate("common.priorities"),    //No I18N
                    type: "color",   //No I18N
                    additional_fields: {
                        "technician": "", //No I18N
                        "status": ""    //No I18N
                    },
                    unassigned: {
                        color: "#484848",
                        name: getMessageForKey("sdp.common.notassigned")    //No I18N
                    }
                }];
                options.sort_by_container = "req-kvsort-container"; //No I18N
                options.group_by_container = "req-managegroups-container";  //No I18N
                options.manage_group_btn = "req-kvmanagegroup-btn"; //No I18N
                options.kanban_container = "req-kanban-container";  //No I18N
                options.kanban_right_container = "req-kv-right-container";  //No I18N
                options.kanban_outer_container = "listview";  //No I18N
                options.nodataString = '<div class="sdp-kanban-nodata">'+   //No I18N
                    '<span class="sdp-kanban-nodatasvg"></span>'+   //No I18N
                    '<span class="kanban-list-no-data">'+getMessageForKey('common.dragdrop.here')+'</span>'+    //No I18N
                    '</div>';   //No I18N
                options.updateHandler = requestListViews.updateKanbanRequest;
                options.global_view_name = requestListViews.global_view_name;
                if(requestListViews.global_view_name != "All_Requests") {    //No I18N
                    options.global_filter  = {"key": "is_service_request", "value": (requestListViews.global_view_name == "Service_Requests")};    //No I18N
                }
                options.lazyloadingEnabled=true;
                options.appliedFilter = function() {
                    requestListViews.toggleViewFilter(true);
                };
                options.cancelledFilter = function() {
                    requestListViews.toggleViewFilter(false);
                };
                var callBacks = {
                    viewFilter: r.initViewFilter,
                    checkSite: r.checkSiteValue
                };
                // TASKID: 75088
                if(table_comp_request && table_comp_request instanceof tableComponent){
                    table_comp_request.destroy();
                }
                requests_table.filterEnabled = true;
                kanban_comp_request = kanbanComponent.initComponent(t_info, table_content, options, _self, callBacks);
            }else{
                if(_self.from === "merge"){ //NO I18N
                    _self.fromMerge(t_info, table_content, options, _self);
                }
                if(_self.from === "dashboard"){ // NO I18N
                    _self.fromDashboard(t_info, table_content, options, _self);
                }
                else if(_self.viewMode==='table') { // When the Request listview is loaded from Dashboard in NewTab
                    var url = new URL(document.URL);
                    var input_data = url.searchParams.get('input_data');
                    input_data = JSON.parse(input_data);
                    if(input_data && input_data.list_info && input_data.list_info.search_criteria && input_data.list_info.filter_by ){
                        _self.fromDashboardInNewTab(_self, true);
                    }
                    else{
                        requests_table.filterEnabled = true;
                    }
                }
                if(_self.from === "link_request"){ // NO I18N
                    _self.fromLinkRequest(t_info, table_content, options, _self);
                }

                 if((_self.viewMode === "table" || _self.viewMode === "classic")&& _self.from !=="dashboard" && _self.from !=="admin"){ // NO I18N
                    t_info["for"]="list_view_filter"; //No I18N
                 }

                /*options.group_by_settings = {
                    enable : true,
                    fields : ["technician","status","priority"]
                };*/
                if(table_comp_request && table_comp_request instanceof tableComponent){
                    table_comp_request.destroy();
                }
                // TASK 79602
                var urlSearch =$spa.getSearchParam('url_search'); // NO I18N
                if(urlSearch){
                    urlSearch = decodeURIComponent(urlSearch);
                    try {
                        urlSearch = JSON.parse(urlSearch);
                        urlSearch = !jQuery.isEmptyObject(urlSearch.search_criteria)
                    } catch (error) {
                        urlSearch = false;
                    }
                }


                if(
                    (_self.filterBy && _self.filterBy.name == "TRASH") || // NO I18N
                    (_self.gsearch) ||
                    (urlSearch)
                    ){
                    options.nodataString = getMessageForKey('zia.bot.requests.empty');
                }
                table_comp_request = new tableComponent(t_info, table_content, options, _self);
            }

        if (_self.isUnifiedView) {
            var taskListData = {};
                taskListData.isUnifiedView = _self.isUnifiedView;

                /** Extending taskListview object with Request Object
                 * $taskList will be avaliable in /scripts/taskList.js
                 * r - (typeof requests_table) will be the request object
                */
                _self = jQ.extend({},r,$taskList);
            if (_self.isUnifiedView) {
                task_personalize = t_info.viewMode == "rq_leftpanel" ? "leftpanel_com_request" : "combined_requests";// No I18N
            }
            var tl = {};
            tl.isUnifiedView = true;
            tl.personalize_key = task_personalize;
            tl.viewMode = t_info.viewMode;
            tl.filterBy = _self.filterBy;
            tl.t_info = r.task_tinfo;
            tl.show_total_count = options.get_total_count;
            if(tl.t_info && tl.t_info.list_info && !tl.t_info.list_info.sort_field){
                tl.t_info.list_info.sort_field = "created_time"; //No I18N
            }
            var taskTableObj = _self.init(tl);
            setTimeout(function(){
                var table_info1 = taskTableObj.table_info,
                    table_content1 = taskTableObj.table_content,
                    options1 = taskTableObj.options;
                options1.callbackAfterBodyRender = _self.callAfterEveryRender;
                options1.callbackAfterInitialRender = _self.callbackInitialRender;
                options1.changeComponentObject = _self.changeComponentObject;
                options1.refreshEnabled = true;
                options1.listSettingEnabled = true;
                options1.listSettingOptions = {
                    enableSettings: ["record_per_page","refresh_frequency"], //No I18N
                    disableSettings: ["text_wrapping","reset_personalization"] //No I18N
                }
                //bulk action settings
                options1.bulkSelectionSetting = {
                    constructSelectedListCB: function (data) {
                        var str = table_combined_task.bulkSelect.selectedModule == "task" ? data.title : data.subject;// No I18N
                        return '<span rel="uitip" mode_ellipsis="true" title="'+ZSEC.Encoder.encodeForHTMLAttribute(str)+'">#'+data.id+' '+ZSEC.Encoder.encodeForHTML(str)+'</span>';
                    },
                    // selectionDisplayField: "title",
                    // selectionCallBack: _self.toggleCheckbox,
                    unSelectionCallback: function (elm) {
                        requestListViews.toggleCheckbox(elm);
                    },
                    selectionCallback: function (elm) {
                        requestListViews.toggleCheckbox(elm);
                    }
                }
                options1.sortingEnabled = false;
                table_combined_task = new tableComponent(table_info1, table_content1, options1, _self);
            },10);
            }
        },
        /*
         * Initiate view filter Component on callback
         */
        r.initViewFilter = function(options) {
            var vfOptions=jQuery.extend(true,{},options);
            delete vfOptions.metaInfoData;

            if(isMSPOrSCP && window.current_req_mode == "kanban"){
                vfOptions.skipFields.push("accountcontract");
            }
            if(!!vfOptions.groupByChange) {
                viewFilterComponent.changeSkipFields(vfOptions);
                return;
            }
			if(!vfOptions.metaOverride){
				vfOptions.metaOverride={};
			}
			vfOptions.metaOverride.maintenance={"read_only":false,"type":"boolean"}; //NO I18N
			vfOptions.serialize= function(data,type){
				if(data.field=="maintenance"){
					if(type=="get"){
						if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
						{
							data.condition="is not"; //NO I18N
							data.values=[null];
						}
						else
						{
							data.condition="is"; //NO I18N
							data.values=[null];
						}
					}
					else{
						if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
						{
							data.values=['false'];
						}
						else
						{
							data.condition="is"; //NO I18N
							data.values=['true'];
						}

					}
					return data;
				}
				else{
					return data;
				}
			}
			vfOptions.metaParam="advanced_search_filter";
            vfOptions.entity="requests"
            viewFilterComponent.initComponent(vfOptions);
        },
        /*
         * Check whether default value for site field can be set or not
         */
        r.checkSiteValue = function() {
            return ((sdp_user.ROLES.indexOf("Restrict site access") === -1 || sdp_user.ROLES.indexOf("ViewRequestsNotInAnySite") > -1));  //No I18N
        },
        r.callAfterEveryRender = function () {
            //Attachment component - initialization
            $sdEventListener("#listview"); //NO I18N
            var selector = requests_table.viewMode == "rq_leftpanel" ? "#request-left-panel" : (requests_table.viewMode == "kanban" ? "#req-kanban-container" :  "#worequestview"); //No I18N
            jQuery(selector+" .paperclip").each(function (index, el) {
                // TASKID: 75416
                var _attachment = new attachPreview(jQuery(this), {
                    api: true,
                    is_odapi: true,
                    is_odapi_v2: true,
                    layouts: false,
                    popover: {
                        enable: true,
                        target: jQuery(this).data("targetId") //No I18N
                    }
                });
            });
            var tableObj = window.current_req_mode == "combined" ? table_combined_task : table_comp_request;//No I18N
            /*Check for hiding the columnchooser icon in request details page left panel  */
            if (requests_table && requests_table.viewMode == "rq_leftpanel") {
                setTimeout(function () {
                    jQuery(".req-column-choose #columnsort").html('<span class="cspr clmchooser icon-sm vsub top-1 mr5" aria-hidden="true"></span>'+getMessageForKey("common.columnchooser")) //No I18N
                }, 100);
                var totalcount = tableObj.t_obj.table_info.list_info.total_count;
                jQuery("#listview_btn").find('.req-lv-count').remove().end().append("<span class='req-lv-count text-muted fl pl5 mt2'>(" + totalcount + ")</span>").attr("title", jQuery("#listview_btn").attr("title") + " ( " + totalcount + " )"); //No I18N
            }
            if (sdp_user.KB_SHORTCUTS) {
                var txt = jQuery("#listview_btn").find("#filter_name").text();
                jQuery("#listview_btn").attr("title", function () { return txt + " (v)" });
            }
        try {
                // TASKID: 76193
                if(
                // only on table and classic view
                !["rp_leftpanel","kanban","combined"].includes(requests_table.viewMode) && //NO I18N
                // not on the trash view
                (requests_table.filterBy && requests_table.filterBy.name != "TRASH") && //NO I18N
                // the column chooser have task column
                (Object.prototype.hasOwnProperty.call(tableObj.t_obj.table_info.fields_required,"task")) && //NO I18N
                // User is technician
                (sdp_user.USERTYPE === "Technician") //NO I18N
                ){
                    summary_call.init();
                }
                requests_table.viewMode != 'rq_leftpanel' ? ((window.top.requests_table.viewMode == 'kanban' && !!window.top.requestListViews.kan_col_id) ? $se.page_scripts.render("rdp_page") : $se.page_scripts.render("rlv_page")) : undefined;//No I18N
                var tableObj = window.current_req_mode == "combined" ? table_combined_task : table_comp_request;//No I18N
            if(requests_table.addIn==true){
                $se.page_scripts.render("rlv_page")
            }
        } catch(e) {
            requests_table.viewMode != 'rq_leftpanel' ? $se.page_scripts.render("rlv_page") : undefined;//No I18N
        }
        jQuery('.listloader').hide();
        jQuery('.page-progressbar').hide();
        jQuery(".listview").css("visibility","inherit"); //No I18N
            requests_table.resizeTableWidthHeight();
            //disable export when now data is present
            if(requests_table.viewMode === "table" || requests_table.viewMode === "classic"){
                if (table_comp_request.visibleContents < 1) {
                    jQuery("#reqlist_actions_export").addClass('disabled');
                    jQuery("#reqlist_actions_export_icon").removeClass('opac5').addClass('opac3');
                    jQuery("#popupListViewExport").addClass("hide").removeClass("bs-noconflict");
                }
                else {
                    jQuery("#reqlist_actions_export").removeClass('disabled');
                    jQuery("#reqlist_actions_export_icon").removeClass('opac3').addClass('opac5');
                    jQuery("#popupListViewExport").addClass("bs-noconflict").removeClass("hide");
                }
            }
            // TASKID: 75113
            // set the loaded data in the listview
            if(["table","classic"].includes(requestListViews.viewMode)){ //NO I18N
                var loadedrecords = table_comp_request.visibleContents;
                var lists = [];

                if(isMSPOrSCP)
                {
                   var  req_list_view_acc_data = {};
                }
                jQuery.each(loadedrecords, function(index, key){
                    lists.push(key.id);
                    // #21625 issue fix
                    if(isMSPOrSCP && key.account)
                    {
                        req_list_view_acc_data[key.id] = key.account.id;
                    }

                });
                if(lists.length > 0){
                    Store.setItem({
                        key:"req_list_view_data", // NO I18N
                        value: sdpToJSON(lists)
                    });

                    if(isMSPOrSCP)
                    {
                        Store.setItem({
                            key:"req_list_view_acc_data", // NO I18N
                            value: sdpToJSON(req_list_view_acc_data)
                        });
                    }
                }
            }
            /**
             * TASK ID: 79737
             * Calculate height input for spot search
             */
            jQuery("#requests_list_listSearch").on("click", function(){ //NO I18N
                requests_table.resizeTableWidthHeight();
            });
            if(window.externalframe) {
                $extFrame.setOptions();
            }
        },
        /**
         * A helper function is used to reduce the amount code that is repeated
         * in the cell construction
         */
        r.editConditions =  function(){
            var _self = this;
            if (
            // Has Modify Request permission
            sdp_user.ROLES.indexOf("ModifyRequests") != -1 && //NO I18N
            // Not a kanban view
            (_self.viewMode !== "kanban") && // NO I18N
            // Not a Trash view
            (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED")) && // NO I18N
            // Not a Left Panel view
            _self.viewMode !== "rq_leftpanel" && // No I18N
            // Not a Addin view
            !_self.addIn &&
            // Inline Edit is Enabled
            _self.inlineEditEnabled
            ) {
                return true;
            }else{
                return false;
            }
        },
        /**
         * When the URL contains from=dashboard, this function will call
         */
        r.fromDashboard = function(t_info, table_content, options, _self){
            // Request list view in listpopup  need to remove reset personlization, reset width options, listview refresh
            options.listSettingOptions.disableSettings = ["text_wrapping","reset_personalization","reset_column_width"]; //No I18N
            options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N

            //When custom filter use case, viewName doesn't pass and we dont need the edit and checkbox in preview mode
            if( sdp_user.USERTYPE === "Technician"){
                delete table_content.header.edit;
                delete table_content.header.task;
            }
            // Disable the inline Edit for request_table
            _self.inlineEditEnabled = false;
            // Disable the inline edit for the request list view
            options.inlineEditEnabled = false;
            // Disable the filter
            _self.filterEnabled = false;
            // Remove the body Scroll
            _self.disableBodyScroll = true;
            //hide filter box
            _self.hideFilter = true;
        },

        r.fromDashboardInNewTab = function(_self, isHideFilters) {
            if(isHideFilters) {
                if(_self.filterEnabledBackup == undefined) {
                    _self.filterEnabledBackup = _self.filterEnabled;
                }
                _self.filterEnabled = false;
                _self.hideFilter = true;
            }
            else if(_self.filterEnabledBackup!= undefined){
                _self.filterEnabled = _self.filterEnabledBackup;
            }
        },

        /**
         * This popup is used to show the list of the request in the merge request on
         * the details page.
         * Basically, it modifies the request list view column
         */
        r.fromMerge = function(t_info, table_content, options, _self) {

                /**
             * Request list view in listpopup  need to remove reset personlization, reset width options, listview refresh
             */
            options.listSettingOptions.disableSettings = ["text_wrapping","reset_personalization","reset_column_width"]; //No I18N
            options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N

            // remove the no data template
            options.nodataString = "";
            // disable the inline edit
            options.inlineEditEnabled = false;
            // Disable the inline Edit  Enabled
            _self.inlineEditEnabled = false;
            // remove the checkbox column
            // delete t_info.fields_required.requests_list_head_chk;
            delete table_content.header.requests_list_head_chk;
            delete table_content.header.edit;

            // remove url search from the table
            options.urlSearch = false;

            // // Table Content Header
            table_content.header.merge = {
                sortable:false,
                "default": true, //NO I18N
                searchable:false,
                type:"icon", //No I18N
                dataCelltransformer: function (table_data) {
                    var rd = table_data.row_data;
                    var html = "";
                    html += '<div class="mergeicon"><a href="/" nonce='+sdpNonce+' data-event="click" data-handler="validateMergeForm(\''+rd.id+'\')" title="'+getMessageForKey('sdp.requests.merge.title')+'"></a></div>' //NO I18N
                    return html;
                }
            }

            // // Add the request type column
            table_content.header.type = {
                sortable:false,
                searchable:false,
                "default": true, //NO I18N
                type:"icon",//No I18N
                dataCelltransformer: function (table_data) {
                    var rd = table_data.row_data;
                    var html = "";
                    if(rd.is_service_request){
                        html = '<span class="req-sprite service-req-icon ml5" title="'+getMessageForKey("sdp.home.ssp.templates.tooltip.servicerequest")+'"></span>'
                    }
                    else{
                        html = '<span class="req-sprite incident-req-icon ml5" title="'+getMessageForKey("sdp.requests.view.incidentrequest")+'"></span>'
                    }
                    return html;
                }
            }

        },
        r.fromLinkRequest = function(t_info, table_content, options, _self) {
            /**
             * Request list view in listpopup  need to remove reset personlization, reset width options, listview refresh
             */
            options.listSettingOptions.disableSettings = ["text_wrapping","reset_personalization","reset_column_width"]; //No I18N
            options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N

            // remove the no data template
            options.nodataString = "";

            // Disable the inline Edit  Enabled
            _self.inlineEditEnabled = false;

            delete table_content.header.edit;

            // remove url search from the table
            options.urlSearch = false;

        },
        r.callbackInitialRender = function (table_info, _self) {
            jQuery("#req_skloader").skLoader("hide"); //No I18N
            jQuery("#list_view_container").fadeIn(500);
            //show the leftpanel gear when leftpanel loads
            jQuery(".left-panel-settings").fadeIn("slow"); //No I18N
            initTooltip("#listcontrols"); //No I18N
        },
        r.headerdataConstruct = function (table_info, _self) {
        var meta_data = {};
        //Role permission
        var tech_meta ={}
        var isModify = sdp_user.ROLES.indexOf("ModifyRequests") != -1;//No I18N
            if (sdp_user.USERTYPE == "Technician") {
                tech_meta = {
                    "requests_list_head_chk": { // No I18N
                        "dataCelltransformer": _self.constructChkboxCell, // No I18N
                        "type": "checkbox", // No I18N
                        "default": true, // No I18N
                        "td_class": "headercheckbox", // No I18N
                        "text": getMessageForKey("sdp.requests.common.selectbox") // No I18N
                    },
                    "edit": { // No I18N
                        "dataCelltransformer": _self.constructEditCell, // No I18N
                        "type": "icon", // No I18N
                        "default": true, // No I18N
                        "text": getMessageForKey("common.edit"), // No I18N
                        "sortable" : false // No I18N
                    },
                    "task": { // No I18N
                        "dataCelltransformer": _self.constructTaskCell, // No I18N
                        "type": "icon", // No I18N
                        "text": getMessageForKey("common.task") // No I18N
                    },
                    "notification_status": { // No I18N
                        "dataCelltransformer": _self.constructNotifyCell, // No I18N
                        "type": "icon", // No I18N
                        "text": getMessageForKey("sdp.requests.viewrequest.notify") // No I18N
                    },
                    "has_notes": { //NO I18N
                        "dataCelltransformer": _self.constructNotesCell, // No I18N
                        "type": "icon", // No I18N
                        "text": getMessageForKey("sdp.requests.common.notes") // No I18N
                    },
                    "has_linked_requests": { //NO I18N
                        "dataCelltransformer": _self.constructLinkReqCell, // No I18N
                        "headCellTransformer": _self.constructLinkReqHeader, // No I18N
                        "type": "icon", // No I18N
                        "text": getMessageForKey("sdp.requests.view.linkedfrom.linked") // No I18N
                    },
                    "sla": { // No I18N
                        "dataCelltransformer": _self.constructSlaCell, // No I18N
                        "sortable": false, // No I18N
                        "searchable": false, // No I18N
                        "value_path":"sla.name"// No I18N
                    },
                    "first_response_due_by_time": { // No I18N
                        "type": "date-time" // No I18N
                    },
                    "scheduled_end_time": {// No I18N
                    },
                    "scheduled_start_time": {// No I18N
                    },
                    "dependency_status": { // No I18N
                        "dataCelltransformer": _self.constructDependCell, // No I18N
                        "type": "icon", // No I18N
                        "text": getMessageForKey("sdp.requests.viewrequest.dependency") // No I18N
                    },
                    "technician_timer":{ // No I18N
                        "type": "icon", // No I18N
                        "dataCelltransformer": _self.constructTechnicianTimer, // No I18N
                        "td_class": "pos-rel", // No I18N
                        "text": getMessageForKey("sdp.request.view.technician.timer") //No I18N
                    },
                    "service_category": {// No I18N
                        "value_path":"service_category.name"// No I18N
                    },
                    "urgency": {// No I18N
                        "frommeta":true,// No I18N
                        "value_path":"urgency.name"// No I18N
                    },
                    "impact": {// No I18N
                        "frommeta":true,// No I18N
                        "value_path":"impact.name"// No I18N
                    },
                    "association_project": {// No I18N
                        "dataCelltransformer": _self.constructAssociationProject, // No I18N
                        "sortable": false, // No I18N
                        "searchable": false, //No I18N
                        "text": getMessageForKey("sdp.requests.projectdialog.projectid") // No I18N
                    },
                    "total_cost":{// No I18N
                        "text": getMessageForKey("sdp.common.totalcost")+ " ("+sdp_app.CURRENCY_SYMBOL+")" // No I18N
                    },
                    "created_by": {// No I18N
                        "value_path":"created_by.name"// No I18N
                    }
                };
                if(isMSPOrSCP){
                    if(sdp_app.SHOW_BILLING_CONTRACT_DETAILS_TO_USER){
                        tech_meta.is_active_contract = jQuery.extend(true, tech_meta.is_active_contract, {
                        "dataCelltransformer": _self.constructIsActiveContract, // No I18N
                        "sortable": false, // No I18N
                        "searchable": false, //No I18N
                        "text": getMessageForKey("ae.contract.report.ismaincontract") // No I18N
                    });
                    }
                    if(isSCP){
                        delete tech_meta.total_cost;
                        delete tech_meta.association_project;
                    }
                }
            }
            meta_data = {
                "id": { // No I18N
                    "text": getMessageForKey("sdp.common.id"), // No I18N
                    "default_width" : "90px" //No I18N
                },
                "subject": { // No I18N
                    "dataCelltransformer": _self.constructSubjectCell, // No I18N
                    "width" : "200px", //No I18N
                    "searchingEnabled":true // No I18N
                },
                "due_by_time": { // No I18N
                    "type": "date-time" // No I18N
                },
                "requester": { // No I18N
                    "value_path":"requester.name",// No I18N
                    "dataCelltransformer": _self.constructRequesterCell //No I18N
                },
                "status": { // No I18N
                    "dataCelltransformer": _self.constructStatusCell, // No I18N
                    "changeCallBack": _self.statusCallback, // No I18N
                    "searchingEnabled":true,// No I18N
                    "value_path":"status.name",// No I18N
                    "td_class": "pos-rel" // No I18N
                },
                "created_time": { // No I18N
                    "type": "date-time" // No I18N
                },
                "priority": { // No I18N
                    "dataCelltransformer": _self.constructPriorityCell, // No I18N
                    "searchingEnabled":true,// No I18N
                    "value_path":"priority.name",// No I18N
                    "td_class": "pos-rel" // No I18N
                },
                "site":{// No I18N
                    "value_path":"site.name"// No I18N
                },
                "group": { // No I18N
                    "dataCelltransformer": _self.constructRequestGroupCell,// No I18N
                    "searchingEnabled":true,// No I18N
                    "value_path":"group.name"// No I18N
                },
                "technician": { // No I18N
                    "dataCelltransformer": _self.constructOwnerCell, // No I18N
                    "text": getMessageForKey("sdp.requests.viewrequest.listview.assignedto"), // No I18N
                    "searchingEnabled":true,// No I18N
                    "value_path":"technician.name"// No I18N
                },
                "is_service_request": { // No I18N
                    "dataCelltransformer": _self.constructTemplateTypeCell, // No I18N
                    "text": getMessageForKey("sdp.requests.view.templatetype") // No I18N
                },
                "completed_time": { // No I18N
                    "type": "date-time"// No I18N
                },
                "approval_status": { // No I18N
                    "type": "icon", //No I18N
                    "dataCelltransformer": _self.constructApprovalStatusCell // No I18N
                },
                "last_updated_time": { // No I18N
                    "type": "date-time" // No I18N
                },
                "resolved_time": { // No I18N
                    "type": "date-time" // No I18N
                },
                "category": {// No I18N
                    "dataCelltransformer": _self.constructCSICell, // No I18N
                    "value_path":"category.name"// No I18N
                },
                "subcategory": {// No I18N
                    "dataCelltransformer": _self.constructCSICell, // No I18N
                    "value_path":"subcategory.name"// No I18N
                },
                "item": {// No I18N
                    "dataCelltransformer": _self.constructCSICell, // No I18N
                    "value_path":"item.name"// No I18N
                },
                "level": {// No I18N
                    "value_path":"level.name"// No I18N
                },
                "mode": {// No I18N
                    "value_path":"mode.name"// No I18N
                },
                "request_type": {// No I18N
                    "value_path":"request_type.name"// No I18N
                },
                "department": {// No I18N
                    "value_path":"department.name"// No I18N
                },
				"maintenance": {// No I18N
					"dataCelltransformer": _self.constructMaintenanceCell, // No I18N
					"disableSorting" : true, // No I18N
					"disableSearching" : true, // No I18N
					"sortable":false, // No I18N
					"value_path":"maintenance.name"// No I18N
				},
                "created_by": {// No I18N
                    "value_path":"created_by.name"// No I18N
                },
                "responded_time": { // No I18N
                    "type": "date-time" // No I18N
                },
                "assigned_time": { // No I18N
                    "type": "date-time" // No I18N
                }
            };

            if(isMSPOrSCP){
                meta_data.account = {
                    value_path: "account.name" // No I18N
                }
                meta_data.accountcontract = {
                    value_path: "accountcontract.name" // No I18N
                }
                meta_data.billing_status = {
                    value_path: "billing_status.name" // No I18N
                }
                if(isSCP)
                {
                    delete meta_data.site;
                    delete meta_data.department;
                }
            }

            if(_self.viewMode == "rq_leftpanel" || _self.viewMode == "classic" ||_self.viewMode == "combined" ||_self.viewMode == "kanban"){
                _self.viewMode == "rq_leftpanel" || _self.viewMode == "kanban" ? delete tech_meta.edit : undefined; // No I18N
                meta_data.is_service_request = jQuery.extend(true, meta_data.is_service_request, {
                    "column_settings": { "position": 1 }, // No I18N
                    "default": true,// No I18N
                    "hide_label": true // No I18N
                });

                meta_data.subject = jQuery.extend(true, meta_data.subject, {
                    "default": true, // No I18N
                    "hide_label": true,// No I18N
                    "column_settings": { "view_type": "row", "rowposition": 1 } // No I18N
                });
                if(sdp_user.USERTYPE == "Technician"){
                    if(_self.viewMode == "classic" ||_self.viewMode == "combined"){
                        tech_meta.edit = jQuery.extend(true, tech_meta.edit, {
                            "column_settings": { "position": 1 }, // No I18N
                            "hide_label": true  //No I18N
                        });
                        delete tech_meta.edit.type;
                    }
                    delete tech_meta.requests_list_head_chk;
                    _self.viewMode != "classic" ? delete tech_meta.task : ""; //No I18N
                    // delete tech_meta.technician_timer;
                }
                // delete meta_data.id;
                delete meta_data.has_dependency;
                if(_self.addIn){
                    delete tech_meta.notification_status;
                    delete tech_meta.edit;
                    delete meta_data.status.changeCallBack;
                }
            }
            if(_self.viewMode == "table"){
                delete meta_data.subject.width;
                meta_data.is_service_request.type = "icon";
                if(sdp_user.USERTYPE === "Technician" && !window.externalframe){
                    delete tech_meta.edit["default"]; //No I18N
                    //Low privileged technician need to remove selectbox
                    sdp_user.ROLES.indexOf("ModifyRequests") == -1 && sdp_user.ROLES.indexOf("DeleteRequests") == -1 && delete tech_meta.requests_list_head_chk; //No I18N
                    sdp_user.ROLES.indexOf("ModifyRequests") == -1 && delete tech_meta.edit;
                }
                //When custom filter use case, viewName doesn't pass and we dont need the edit and checkbox in preview mode
                if((_self.from === "cf_request" || _self.from === "admin" || _self.from === "report" ||  _self.from === "dashboard" || self.from === "merge") && sdp_user.USERTYPE === "Technician"){
                    (_self.from === "report" || _self.from === "cf_request" ) && delete tech_meta.requests_list_head_chk; //No I18N
                    delete tech_meta.edit;
                    if(_self.from !== "dashboard" && _self.from !== "admin") {
                      delete tech_meta.has_notes;
                    }
                    delete tech_meta.task;
                }else if(_self.filterBy && _self.filterBy.name == "TRASH"){ //No I18N
                    delete tech_meta.task;
                    delete tech_meta.edit;
                }else if(isMSPOrSCP && sdp_feature_status.is_unapproved_requester_enabled && _self.filterBy && _self.filterBy.name == "UNAPPROVED"){
                    delete tech_meta.edit;
                }
            }
            //TaskId: 77334,75877
            if(_self.viewMode != "table"){
                if(sdp_user.USERTYPE === "Technician"){
                    delete tech_meta.technician_timer;
                }
            }


            meta_data = sdp_user.USERTYPE == "Technician" ? jQuery.extend(tech_meta, meta_data) : meta_data; //NO I18N
            return meta_data;
        },
        r.isRead=function (table_data){ //Method to turn whole row into Bold upon is_Read flag.
            var rd = table_data.row_data;
            var cssClass = (rd.is_read) ? "" : "unread-item"; // No I18N
            return cssClass;
        },
        r.rowdataConstruct = function (table_info, ctl) {
            var fields_required = table_info.fields_required;
            var inputObject = {};
            var fields_required_arr = fields_required instanceof Array ? fields_required : Object.keys(fields_required);
                inputObject.list_info = table_info.list_info;
            var linkindex = fields_required_arr.indexOf("edit"); // No I18N
                linkindex > -1 && fields_required_arr.splice(linkindex, 1);
            var chkindex = fields_required_arr.indexOf("requests_list_head_chk"); // No I18N
                chkindex > -1 && fields_required_arr.splice(chkindex, 1);
            var taskindex = fields_required_arr.indexOf("task"); // No I18N
                taskindex > -1 && fields_required_arr.splice(taskindex, 1);
                fields_required_arr.push("template"); // No I18N
            if(fields_required_arr.indexOf("site")==-1 && !isSCP){
                fields_required_arr.push("site");
            }
                // this field added for to show the incident and service request in bulk select dropdown
                fields_required_arr.indexOf("is_service_request") == -1 && fields_required_arr.push("is_service_request"); // No I18N
            if(sdp_user.USERTYPE == "Requester"){
                //Following fields are not allowed for requester. If available in fields_required array, removing them.
                var reqNotAllowedFields  = [
                "has_notes", "first_response_due_by_time","scheduled_end_time","scheduled_start_time","total_cost","has_linked_requests","sla" //No I18N
                ];
                for (var i = 0; i < reqNotAllowedFields.length; i++) {
                     var field = reqNotAllowedFields[i];
                     var fieldIndex = fields_required_arr.indexOf(field);
                     if(fieldIndex > -1){
                          fields_required_arr.splice(fieldIndex, 1);
                     }
                }
            }

            //Subject dependent fields
            if (ctl.viewMode != "table") {
                fields_required_arr.push("subject");// No I18N
                fields_required_arr.push("has_attachments");// No I18N
                fields_required_arr.push("category");// No I18N
                fields_required_arr.push("short_description");// No I18N
            } else {
                if (fields_required_arr.indexOf("subject") != -1) {
                    fields_required_arr.push("category");// No I18N
                    fields_required_arr.push("short_description");// No I18N
                    fields_required_arr.push("has_attachments");// No I18N
                }
            }
            //Status & SLA dependent fields
            var isStatus = fields_required_arr.indexOf("status") != -1 , isSLA = fields_required_arr.indexOf("sla") != -1 ; // No I18N
            if (isStatus || isSLA) {
                fields_required_arr.push("created_time");// No I18N
                fields_required_arr.push("responded_time");// No I18N
                fields_required_arr.push("completed_time");// No I18N
                fields_required_arr.push("resolved_time");// No I18N
                fields_required_arr.push("due_by_time");// No I18N
                fields_required_arr.push("is_overdue");// No I18N
                fields_required_arr.push("is_first_response_overdue");// No I18N
                // TASKID: 75423
                fields_required_arr.push("status.in_progress");// No I18N
                fields_required_arr.push("status.stop_timer");// No I18N
                isStatus && is_service_catalog_enabled && fields_required_arr.push("is_editing_completed");
                sdp_user.USERTYPE == "Technician" && fields_required_arr.push("first_response_due_by_time");// No I18N
                if (sdp_user.USERTYPE == "Technician") {
                    fields_required_arr.push("is_fcr");// No I18N
                    if(isStatus){
                    fields_required_arr.push("onhold_scheduler.change_to_status");// No I18N
                    fields_required_arr.push("onhold_scheduler.scheduled_time");// No I18N
                    fields_required_arr.push("onhold_scheduler.held_by");// No I18N
                    if (is_service_catalog_enabled) {
                        fields_required_arr.push("editor");
                        fields_required_arr.push("editing_status");
                    }
                }
            }
            }
            //Link request dependent fields
            if(sdp_user.USERTYPE == "Technician" && fields_required_arr.indexOf("has_linked_requests") != -1 ){
                fields_required_arr.push("linked_to_request.request"); // No I18N
                fields_required_arr.push("linked_to_request.link_comments"); // No I18N
            }
            sdp_user.USERTYPE == "Technician" && fields_required_arr.push("is_read");// No I18N
            //Notification status
            if (sdp_user.USERTYPE == "Technician" && fields_required_arr.indexOf("notification_status") != -1) {
                fields_required_arr.push("unreplied_count"); // No I18N
            }
            if (color_settings_helper.color_settings && color_settings_helper.color_settings.is_enabled) {
                if (fields_required_arr.indexOf(color_settings_helper.color_settings.field) === -1) {
                    fields_required_arr.push(color_settings_helper.color_settings.field);
                }
            }
            fields_required_arr.push("cancel_requested_is_pending");
            // field required for RLC config request
            fields_required_arr.push("lifecycle"); // No I18N

            if (ctl.isUnifiedView) {
                for (var i = 0; i < fields_required_arr.length; i++) {
                    fields_required_arr[i] = "request." + fields_required_arr[i]; //No I18N
                }
                if (table_combined_task) {
                    inputObject.list_info.sort_field = table_combined_task.t_obj.table_info.list_info.sort_field;
                }
            }
            if(sdp_user.USERTYPE == "Requester" && fields_required_arr.indexOf("has_notes")!=-1 ){ // for outlook addin has_notes is been blocked by requester API so we removed in fields_required
                fields_required_arr.splice(fields_required_arr.indexOf("has_notes"),1);
            }
            if(ctl.from === "merge"){ // NO I18N
                // remove "merge"
                fields_required_arr.splice(fields_required_arr.indexOf("merge"),1); // NO I18N
                // remove "type"
                fields_required_arr.splice(fields_required_arr.indexOf("type"),1); // NO I18N
            }

            if(isMSPOrSCP) {
                if(table_info.viewMode == "table" && !window.externalframe && sdp_user.USERTYPE == "Technician" && sdp_app.SHOW_BILLING_CONTRACT_DETAILS_TO_USER){
                    fields_required_arr.push("is_contract_consumed");
                }

                if(table_info.viewMode == "rq_leftpanel")
                {
                    fields_required_arr.push("account", "account.advisory");
                }
            }

            inputObject.fields_required = fields_required_arr;
            inputObject = r.inputDataModifier(inputObject);

            /**
             * Global search handling with global filter
             */
            // if(inputObject.list_info.gsearch && !jQuery.isEmptyObject(inputObject.list_info.search_fields) && inputObject.list_info.search_fields.hasOwnProperty("is_service_request")){ //No I18N
            //     inputObject.list_info.search_criteria = [{"field":"is_service_request","condition": "is","logical_operator":"and","value":inputObject.list_info.search_fields.is_service_request }]; //No I18N
            //     delete inputObject.list_info.search_fields;
            // }
            return inputObject;
        },
        /**
         * Cell constructing starts here
         */
        r.constructChkboxCell = function (table_data) {
            var rd = table_data.row_data;
            return "<input type='checkbox' name='checkbox' value=" + rd.id + " templateid=" + rd.template.id + " data-table-checkbox aria-label='Request List'>"; //No I18N
        },
        r.constructOwnerCell = function (table_data,_self) {
            var row_data = table_data.row_data;
            var col_str = "-",owner_id = "",grp_id = "",dropIcon=""; // No I18N
            var isModify = sdp_user.ROLES.indexOf("ModifyRequests") != -1 && sdp_user.ROLES.indexOf("AssigningTechnician") != -1 &&  _self.inlineEditEnabled, inline_edit = ""; //No I18N
            if (row_data.technician != null) {
                col_str = row_data.technician.name ? row_data.technician.name : row_data.technician;
                owner_id = row_data.technician.id;
            } else {
                col_str = getMessageForKey("sdp.requests.common.unAssign"); // No I18N
            }
            if (_self.viewMode != "rq_leftpanel" && isModify && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED") )) {
                dropIcon = "<span class='dr-down-icon'></span>"; // No I18N
            }
            inline_edit = isModify && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED")) && _self.viewMode !== "kanban" && _self.viewMode !== "rq_leftpanel" ?  "lv-inline-actions cur-ptr" : "";   //No I18N
            grp_id = row_data.group != null ? row_data.group.id : ""; // No I18N
            return '<span class="'+ inline_edit +' no-bord-back " data-lv-action="technician" rel="uitip" mode_ellipsis="true" title="'+e_attr(col_str)+'">' + e_html(col_str)+ dropIcon + '</span>'; //No I18N
        },
        r.constructRequestGroupCell = function (table_data,_self) {
            var row_data = table_data.row_data;
            var col_str = "-",owner_id = "",grp_id = "",isMarked = false,isAssigned = true,dropIcon=""; // No I18N
            var isModify = sdp_user.ROLES.indexOf("ModifyRequests") != -1  && _self.inlineEditEnabled, inline_edit = ""; //No I18N
            if (row_data.group != null || row_data.owner != null) {
                if (row_data.group != null) {
                    col_str = row_data.group.name ? row_data.group.name : row_data.group;
                    grp_id = row_data.group.id;
                }
                owner_id = row_data.owner ? row_data.owner.id : ""; // No I18N
            }
            if (_self.viewMode != "rq_leftpanel" && isModify && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED"))) {
                dropIcon = "<em></em>"; // No I18N
            }
            isModify && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED")) && _self.viewMode !== "kanban" && _self.viewMode !== "rq_leftpanel" ? inline_edit = "cur-ptr lv-inline-actions text-combobox" : undefined;//No I18N
            return '<span class="'+inline_edit+' no-bord-back" data-lv-action="technician" rel="uitip" mode_ellipsis="true" title="' + e_attr(col_str) + '">' + dropIcon + e_html(col_str) +'</span>';//No I18N
        },
        r.constructNotifyCell = function (table_data,_self) {
            var rd = table_data.row_data,
                title = getMessageForKey("sdp.requests.listview.notifications.noconv.title"),
                conIcon = "tc-out-noconv",   // No I18N
                colstr = "",
                unreplycount="",
                viewMode = "active"; //No I18N
            var hasReply = rd.notification_status;
                var hasData = false;
            if (hasReply != null &&  hasReply != "" && hasReply != "NO_REPLY") { // No I18N
                    hasData = true;
                conIcon = hasReply == "TECH_REPLY" ? "list-sprite icon-sm outgoing-conv-icon vtop" : "list-sprite icon-sm incoming-conv-icon";// No I18N
                title = hasReply == "TECH_REPLY" ? getMessageForKey("sdp.requests.listview.notifications.viewconv.title"): getMessageForKey("sdp.requests.listview.notifications.reqreply.title",[""]) ; // No I18N
                if (rd.unreplied_count && rd.unreplied_count != null) {
                     if (rd.unreplied_count > 9) {
                        unreplycount = '<span class="sdp-notify sdp-count-lv">9+</span>'; // No I18N
                    }else{
                        unreplycount = '<span class="sdp-notify sdp-count-lv">' + e_html(rd.unreplied_count) + '</span>';// No I18N
                    }
                    conIcon += ' mr5';// No I18N
                    title = getMessageForKey("sdp.requests.listview.notifications.reqreply.title",[rd.unreplied_count]);
                }
            }
                // TASKID: 75417
                if(hasData && _self.filterBy && _self.filterBy.name && _self.filterBy.name === "TRASH"){ //No I18N
                    title = getMessageForKey("sdp.requests.listview.notifications.viewconv.title"); // No I18N
                    viewMode = "TRASH"; // No I18N
                }
                var cl = "cur-ptr pos-rel mr5"; //NO I18N
                if(requests_table && !requests_table.inlineEditEnabled){
                    cl +=' disableDiv'; //NO I18N
                }
                colstr = "<a href='/' nonce='"+sdpNonce+"' data-event='click' data-handler='showConversationInDialog(\"/common/ViewConversationsFromList.jsp?mode=view&currentView=" + viewMode + "&module=requests&id=" + rd.id + "&view=conversations\"," + rd.id + ")' title='" + title + "' rel='uitip' class='"+cl+"' id='view_conversation_"+rd.id+"'><span class='"+conIcon+"' role='img' aria-label='" + title + "'></span>"+unreplycount+"</a>"; // No I18N
            if(_self.addIn){
                colstr = "<a href='/' title='" + title + "' rel='uitip' class='cur-ptr mr10 '><span class='"+conIcon+"'></span>"+unreplycount+"</a>"; // No I18N
            }

            return colstr;
        },
        r.constructNotesCell = function (table_data,_self) {
            var rd = table_data.row_data;
            var cl = "tc-notes",title = "sdp.requests.notes.addnotes.title"; // No I18N
            if (!rd.has_notes) {
                cl = "tc-nonotes"; // No I18N
            } else {
                title="sdp.requests.note.viewaddnote";// No I18N
            }

            if(_self.filterBy && _self.filterBy.name && _self.filterBy.name === "TRASH"){ //No I18N
                title = "common.view.notes"; // No I18N
            }

            // var isRetiredHelpdesk = esm_details && esm_details.current_portal.isRetired;
            var viewname = _self.filterBy ? _self.filterBy.id ? _self.filterBy.id: _self.filterBy.name : undefined;
            var onclick = 'data-event="click"  nonce="'+sdpNonce+'"  data-handler="showConversationInDialog(\'/common/ViewConversationsFromList.jsp?mode=view&currentView=' + viewname + '&amp;module=requests&amp;id=' + rd.id +'&amp;view=notes\',\'note' + rd.id + '\')"';//no i18n
            if(_self.addIn){// for addin alone the click should not be visible , if we removed from meta , then has_notes will be shown as normal property field so only added check over here
                onclick="";
                title="";
            }
            if(requests_table && !requests_table.inlineEditEnabled){
                cl +=' disableDiv'; //NO I18N
            }

            return '<div id="req_notes_' + rd.id + '" class="vbottom mr5 disp-ib"><a href="/" '+onclick+' role="img" aria-label="'+ getMessageForKey(title) +'" title="'+ getMessageForKey(title) +'" rel="uitip" class="' + cl + '" id="note' + rd.id + '"> </a></div>'; // No I18N
        },
        r.constructEditCell = function (table_data,_self) {
            var rd = table_data.row_data;
            if (_self.viewMode == "table") {
                return '<a href="WorkOrder.do?woMode=editWO&amp;woID=' + rd.id + '&amp;" title="' + getMessageForKey("sdp.requests.viewrequest.editrequest") + '" rel="uitip" data-externalframe="true"><span class="tc-edit" role="img" aria-label="' + getMessageForKey("sdp.requests.viewrequest.editrequest") + '"></span> </a>'; // No I18N
            } else {
                var html = "";// No I18N
                if (sdp_user.ROLES.indexOf("ModifyRequests") != -1 || sdp_user.ROLES.indexOf("AssigningTechnician") != -1 || sdp_user.ROLES.indexOf("DeleteRequests") != -1 || sdp_user.ROLES.indexOf("ClosingRequest") != -1) {
                    html = '<div class="btn-group tc-req-edit bs-noconflict"> <a class="cur-ptr cspr menulist icon-xs flat2 sdmenu-toggle vmiddle" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
                    '<ul class="sdmenu-dd" role="menu">';
                    html += sdp_user.ROLES.indexOf("ModifyRequests") != -1 ? '<li><a data-cs-field="edit_request" data-spa="true" data-spa-page="requests-edit" data-externalframe="true" data-spa-module="requests" href="WorkOrder.do?woMode=editWO&amp;woID=' + rd.id + '&amp;" data-i18n-key="sdp.common.edit">' + getMessageForKey("sdp.common.edit") + ' </a></li>':"";// No I18N
                    html += sdp_user.ROLES.indexOf("AssigningTechnician") != -1 ? '<li><a href="/" class="lv-inline-actions" data-lv-action="technician"  data-cs-field="assign_request">' + getMessageForKey("common.assign") + '</a></li>':"";// No I18N
                    if (!rd.lifecycle && rd.lifecycle == null) {
                        html += sdp_user.ROLES.indexOf("ClosingRequest") != -1 ? '<li><a href="/" data-cs-field="close_request" data-event="click" nonce="'+sdpNonce+'"  data-handler="requestListViews.closeRequest(' + rd.id + ')" data-i18n-key="common.close">' + getMessageForKey("common.close") + '</a></li>' : "";// No I18N
                    }
                    html += sdp_user.ROLES.indexOf("DeleteRequests") != -1 ? '<li class="divider"></li><li><a href="/" data-cs-field="delete_request"  data-event="click" nonce="'+sdpNonce+'"  data-handler="requestListViews.bulkOrSingleDelete(' + rd.id + ');" data-i18n-key="sdp.common.delete">' + getMessageForKey("sdp.common.delete") + '</a></li>':"";// No I18N
                    html +='</ul></div>';// No I18N
                }
                return html;
            }
        },
        r.constructTaskCell = function (table_data) {
            var rd = table_data.row_data;
            return '<div id="req_task_' + rd.id + '" class="vbottom disp-ib"><span title="' + getMessageForKey("sdp.request.listview.legand.notasks") + '" rel="uitip" class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
        },
        r.constructSubjectCell = function (table_data,_self) {
            var rd = table_data.row_data, isTrashReq =  _self.filterBy && _self.filterBy.name == "TRASH",color="transparent"; // No I18N
            var trashDetail = ''; // No I18N
            var cssClass = (rd.is_read || (rd.technician!=null && rd.technician.id!=sdp_user.LOGGEDIN_USERID)) ? "" : "sb"; // No I18N
            var strikeCssClass = "";    // var added for MSP/SCP
            if(isMSPOrSCP && _self.viewMode === 'table' && !window.externalframe && sdp_user.USERTYPE == "Technician" && sdp_app.SHOW_BILLING_CONTRACT_DETAILS_TO_USER && rd.is_contract_consumed){
                strikeCssClass = " inactiverequest"; //No I18N
            }
            if (isTrashReq) {
                trashDetail = "<strong>" + getMessageForKey("sdp.requests.common.deletedon") + ":</strong> " + e_html(rd.deleted_on.display_value) + "<br><strong>" + getMessageForKey("sdp.requests.common.deletedby") + ":</strong>" + e_html(rd.deleted_by.name); // No I18N
            }
            if (_self.viewMode != "table" && color_settings_helper.color_settings && color_settings_helper.color_settings.is_enabled  && !isDark()) {
                var colorSetting = color_settings_helper.color_settings;
                var csField = colorSetting.field;
                /** SD-132065 Not assigned values colors is not applied in classic view color setting changes */
                var hasNotAssigned = (colorSetting[csField] && colorSetting[csField][0] && colorSetting[csField][0].name === getMessageForKey("sdp.common.notassigned") && rd[csField] === null)  || false; // No I18N
                if (rd[csField] != null || hasNotAssigned) {
                    var curFieldval = hasNotAssigned ? 0 : rd[csField].id;
                    if (colorSetting[csField]) {
                        if (colorSetting[csField][curFieldval]) {
                            color = colorSetting[csField][curFieldval].background_color;
                        } else {
                            color = colorSetting.default_color;
                        }
                    }
                } else {
                    color = colorSetting.default_color;
                }
                color = e_attr(color);
            }
            var attachmentIcon = "";
            if (rd.has_attachments) {
                attachmentIcon = '<span><div class="hide" id="attach_popup_' + rd.id + '"></div><span role="button" id="req_attachments_' + rd.id + '" class="cur-ptr top-1 icon-sm cspr paperclip mr5 opac5" data-entity="requests" data-entity_id="' + rd.id + '" data-target-id="#attach_popup_' + rd.id + '"  role="img" aria-label="Attachments"></span></span>'; // No I18N
            }

            var link, spaAttrs, target="";

                link = "WorkOrder.do?woMode=viewWO&woID=" + rd.id + (window.current_req_mode != "combined" ? "&fromListView=true" : "");    //No I18N
                if(window.isMDHSetup && window.isMDHSetup === "true"){ // NO I18N
                    link += "&PORTALID="+window.PORTALID; // NO I18N
                }

            let externalFrameAttr = 'data-externalframe="true"'; // No I18N
            if(window.externalframe && (_self.from == "dashboard" || _self.from == "admin" || _self.from == "merge" || _self.from == "link_request")) {
                link += "&from="+_self.from; // NO I18N
                if(_self.from === 'dashboard') { //Requests opened from dashboard opens without header (externalframe=true passed in url). Refer this link => https://connect.zoho.com/portal/intranet/stream/105001036521500/105001036639469
                    externalFrameAttr = "";
                }
            }
            spaAttrs = 'data-spa="true" data-spa-page="requests-details" data-spa-module="requests"';    //No I18N

            var onclick = null;
            if(window.externalframe) {
                onclick = "requestListViews.openAjaxRequest('" + rd.id + "', " + !!window.externalframe + "); return false;"; //No I18N
                spaAttrs = "";  //No I18N
            }

            if(window.current_req_mode === "kanban") {
                onclick = "requestListViews.showRequestPreview('" + rd.id + "', event);";//No I18N
            }
            var subjectString = '';
            var categoryName = '-';
            if(rd.category && rd.category!== null) {
               categoryName=rd.category.name ? e_html(rd.category.name) : rd.category;
            }
            var title = '<strong>'+translate('common.requestid')+' :</strong>' + rd.id + '<br><strong>'+translate('sdp.common.category')+' :</strong> ' + categoryName + ' <br><strong>'+translate('sdp.common.subject')+' :</strong> ' + ZSEC.Encoder.encodeForHTML(rd.subject) + ' <br><strong>'+translate('sdp.common.description')+' :</strong> ' + rd.short_description + ' <br> ' + trashDetail + ''; // No I18N
            if(_self.viewMode === 'rq_leftpanel') {
                subjectString = '<span class="disp-ib p3 truncate-ellipsis" style="background-color:'+color+'"><span class ="truncate-wrapper cur-ptr ' + cssClass + '" rel="uitip" mode_html="true"  title="'+e_attr(title)+'">' + attachmentIcon + '#' + rd.id +' '+ ZSEC.Encoder.encodeForHTML(rd.subject) + '</span></span>'; // No I18N
                if(window.externalframe){
                    subjectString = '<span class="disp-ib p3 truncate-ellipsis" style="background-color:'+color+'"><a class ="truncate-wrapper cur-ptr ' + cssClass + '"  '+(window.isAddin ? ' data-event="click" nonce="'+sdpNonce+'"  data-handler="'+onclick+'"' : 'href="'+href+'"')+'>' + attachmentIcon + '#' + rd.id +' '+ ZSEC.Encoder.encodeForHTML(rd.subject) + '</a></span>'; // No I18N
                }
            } else {
                var reqIdStr = "#" + rd.id; //No I18N
                if(_self.viewMode === 'kanban') {
                    reqIdStr = "<span class='req-id'>#" + rd.id + "</span>";  //No I18N
                    cssClass = "";  //No I18n
                }
                // if(_self.from === "admin"){
                //     target = "_blank"; //No I18N
                // }
                subjectString = '<span class="listreq-empsz ' + (isMSPOrSCP? strikeCssClass : "") + '"><span class="truncate-wrapper"><a style="background-color:'+color+'" class ="' + cssClass + '" ' + spaAttrs + '  '+ (target ? 'target="' + target : "")+ '" rel="uitip" mode_html="true" title="'+e_attr(title)+'" ' + (onclick ? ' data-event="click" nonce="'+sdpNonce+'"  data-handler="' + onclick : "") + ' " href="' + link + '"' + externalFrameAttr + '>' + attachmentIcon; // No I18N
                if(rd.cancel_requested_is_pending) {
                    subjectString += '<span class="cspr cancel-req-lv icon-sm vtop top0 mr5" role="img" aria-label="Cancelled Request"></span>'; // No I18N
                }
                subjectString += (_self.viewMode != "table" ? '#'+rd.id +' ': "") + ZSEC.Encoder.encodeForHTML(rd.subject) + '</a></span></span>'; // No I18N
            }

            if(isMSP)
            {
                var accId = rd && rd.account ?  rd.account.id : null;
                if(accId)
                {
                    var acc_html = '<span class="hide" req-account-id='+e_attr(accId)+' req-acc-name="'+e_attr(rd.account.name)+'"></span>';  //No I18N
                    subjectString = acc_html + subjectString;
                }

            }
            return subjectString;
        },
        r.constructStatusCell = function (table_data, _self) {
            var rd = table_data.row_data;
            var rd = table_data.row_data;
            var isFCR = rd.is_fcr != null ? rd.is_fcr : false;
            var statusName = rd.status.name ? rd.status.name : rd.status;
            var incompleteEditing = rd.is_editing_completed;
            var appendOverDueIcon = ""; //No I18N
            var incomplete = "<span class='mandatory'>&nbsp; *</span>"; //No I18N
            //Constructing tooltip for the cell.
            var SLADueByToolTip = "-",FRDueByToolTip = "-",statusToolTip = ""; //No I18N
            var dueByTime = rd.due_by_time; //No I18N
            var frDueTime = rd.first_response_due_by_time; //No I18N
            var workOrderID = rd.id; //No I18N
            var isOverDue = rd.is_overdue; //No I18N
            var isFrOverDue = rd.is_first_response_overdue //No I18N
            var isNearBy = false;
            var woStatusId = rd.status.id;

            //Obtaining dueByTime,frDueTime,isCompleted,isNearBy values for the workorderid
            var timeInfo = r.getDueByTime(rd);
            var isCompleted = timeInfo.isCompleted;
            var isResponded = timeInfo.isResponded;
            isNearBy = timeInfo.isNearBy;
            var dueByString = "",frDueString = ""; //No I18N //If dueByString or frDueString is null it indicates that the time difference is in seconds.
            //Constructing tooltip for SLA
            if (dueByTime != null) { //If dueByTime has a value then SLADueByToolTip is set accordingly, else it is set as empty
                dueByString = timeInfo.dueByTime;
                SLADueByToolTip = r.getOverDueMessage(dueByString, isCompleted, isNearBy, isOverDue);
            }
            //Constructing tooltip for First Response overdue
            if (frDueTime != null) { //If frDueTime has a value then FRDueByToolTip is set accordingly, else it is set as empty
                frDueString = timeInfo.frDueTime;
                if (isCompleted && !isResponded) {
                    FRDueByToolTip = getMessageForKey("sdp.admin.response.not.done"); // No I18N
                } else if (frDueString == "" && !isCompleted && !isResponded) { //If frDueString is null, no response sent and request is not closed then request is on due
                    FRDueByToolTip = getMessageForKey("sdp.requests.view.ondue"); // No I18N
                } else if (!frDueString == "") {
                    if (isFrOverDue) {
                        if ((isCompleted || isResponded)) { //If isFrOverDue is set, either request is closed or response is sent then the first response is delayed by frDueString
                            FRDueByToolTip = getMessageForKey("sdp.requests.view.delayedby") + " " + frDueString; // No I18N
                        } else {
                            FRDueByToolTip = getMessageForKey("sdp.requests.view.delayby") + " " + frDueString; // No I18N
                        }
                    } else if (!isResponded && !isCompleted) { //If isFrOverDue is not set, request is not closed and response is not sent then the first response is due by frDueString
                        FRDueByToolTip = getMessageForKey("sdp.requests.view.duein") + " " + frDueString; // No I18N
                    }
                }
            }
            // }
            if (FRDueByToolTip != "-" && FRDueByToolTip != "") { //If FRDueByToolTip is '-' then ToolTip for FRDueByTime is not displayed
                statusToolTip = getMessageForKey("sdp.request.listview.tooltip.responsestatus") + " : " + FRDueByToolTip; // No I18N
            }
            if (SLADueByToolTip != "-" && SLADueByToolTip != "") { //If SLADueByToolTip is '-' then ToolTip for SLADueByTime is not displayed
                if (!statusToolTip == "") {
                    statusToolTip += "<br>"; //appending line break
                }
                statusToolTip += getMessageForKey("sdp.request.listview.tooltip.resolutionstatus") + " : " + SLADueByToolTip; // No I18N
            }
            //Setting icons
            if (isOverDue && isFrOverDue) {
                appendOverDueIcon = "<span class='tc-fr-due vtop'></span><span class='tc-flag-w'></span>"; //No I18N
            } else if (isOverDue) {
                appendOverDueIcon = "<span class='icon-sm'></span><span class='tc-flag-w'></span>"; //No I18N
            } else if (isFrOverDue && isNearBy) {
                appendOverDueIcon = "<span class='tc-fr-due'></span><span class='tc-flag-i'></span>"; //No I18N
            } else if (isNearBy) {
                appendOverDueIcon = "<span class='icon-sm'></span><span class='tc-flag-i'></span>"; //No I18N
            } else if (isFrOverDue) {
                appendOverDueIcon = "<span class='tc-fr-due' role='img' aria-label='" + statusToolTip + "'></span><span class='icon-sm'></span>"; //No I18N
            } else {
                appendOverDueIcon = "<span class='icon-sm'></span><span class='icon-sm'></span>"; //No I18N
            }
            var tableFix = (_self.viewMode==="classic" || _self.viewMode==="combined")?"<div class='disp-flex fw'>":"<div class='disp-ib fw'>"; //No I18N
            tableFix += "<span class='icons-cell fl' rel='uitip' mode_html='true' title='" + statusToolTip + "' role='img'>"; //No I18N
            tableFix += appendOverDueIcon;
            tableFix += "</span>"; //No I18N
            var dispFCRIcon = isFCR && sdp_user.USERTYPE == "Technician" ? true : false; // No I18N
            //For FCR Icon
            if (dispFCRIcon) {
                tableFix += "<span class='tc-fcr fr' rel='uitip' title='" + getMessageForKey("sdp.requests.viewrequest.fcrmarked") + "' role='img'></span>"; //No I18N
            }

            //onHold Scheduled icons
            // TASKID : 76077
            if (rd.onhold_scheduler && rd.onhold_scheduler != null && !_self.addIn && (_self.filterBy && _self.filterBy.name !== "TRASH")) {
                var change_to_status = rd.onhold_scheduler.change_to_status != null ? rd.onhold_scheduler.change_to_status.name : "-"; // No I18N
                var scheduled_time = rd.onhold_scheduler.scheduled_time != null ? rd.onhold_scheduler.scheduled_time.display_value : "-"; // No I18N
                var held_by = rd.onhold_scheduler.held_by != null ? rd.onhold_scheduler.held_by.name : "-"; // No I18N
                //SD-129216: Removed one of encoding for the tooltip to avoid double encoding.
                var title = getMessageForKey("sdp.workorder.onholdschedule.operation", [change_to_status, scheduled_time, held_by]); // NO I18N
                tableFix += "<span data-allowhtml='true' rel='uitip'  data-event='click' nonce='"+sdpNonce+"'  data-handler='$req.prop.loadOnHoldBox(event," + rd.id + "); return false;' class='tc-schd-i ml5 fr' title='" + e_attr(title) + "' role='img'></span>";//No I18N
            }
            var inline_edit = r.editConditions() ? " lv-inline-actions cur-ptr text-combobox": ""; // NO I18N
            var dispClass=(_self.viewMode == "table") ? '' :'disp-ib fw';// NO I18N
            tableFix += "<div class='no-bord-back vmiddle "+dispClass+" "+inline_edit+"' data-lv-action='status'>"+(inline_edit ? "<em></em>":''); //No I18N
            if(_self.viewMode === "kanban") {
                tableFix += "<span class='priority-badge mr5' style='min-width:0px;background:" + e_attr(rd.status.color) + ";'>&nbsp;</span>";   //No I18N
                tableFix += "<span rel='uitip' mode_ellipsis='true' title='"+e_attr(statusName)+"'>"+e_html(statusName)+"</span>";   //No I18N
            } else {
                tableFix += "<span rel='uitip' mode_ellipsis='true' title='"+e_attr(statusName)+"'>"+e_html(statusName)+"</span>";   //No I18N
            }
            //incompleteEditor
            if (rd.is_editing_completed != undefined && rd.is_editing_completed != null && !rd.is_editing_completed) {
                tableFix += "<span class='mandatory'>&nbsp; *</span>";//No I18N
            }
            tableFix += "</div>";
            tableFix += "<div class='inline-edit inplace-edit boxsetpanel mt-4 hide' style='width:150px;top:"+(_self.viewMode == "table" ? "11" : "41")+"px'></div>";
            return tableFix += "</div>";
        },
        r.statusCallback = function (select2) {
            var val = jQuery(select2).val();
            var viewStatusObj = jQuery(this).next();
            viewStatusObj.removeClass('hide');
            viewStatusObj.html('');
        var woID = jQuery(select2).closest(".cv-task-item").find("input[type='checkbox']").val(); //No I18N
            $req.details.resetProperties();
            $req.details.initialize(woID);
            $req.prop.fromListview = true;
            $req.prop.render();
            $req.prop.setRightPanelEdit('status'); //NO I18N
            var statusCloned = jQuery('#property-content [name=status]').clone();
            statusCloned.css({'width':'120px','position':'absolute'}); //NO I18N
            viewStatusObj.append(statusCloned);
            if(val!=$req.details.request_info.status.id){
            //if form was close,then we need to opening the form
            if(!jQuery('#property-content [name=status]').length){
                $req.prop.sectionalEdit();
                $req.prop.sectionalCancel();
            }
            jQuery('#property-content [name=status]').val(val).trigger('change');
        }
        },
        r.constructPriorityCell = function (table_data, _self) {
            var rd = table_data.row_data,
                colstr = "", priority_name = "-",priority_color="";
            if (rd.priority) {
                priority_name = rd.priority.name ? rd.priority.name : rd.priority;
            }
            priority_color= rd.priority ? (rd.priority.color?"<span class='priority-badge mr5 inline-priority' style='min-width:0px;background:" + e_attr(rd.priority.color) + ";' role='img' aria-label='"+ZSEC.Encoder.encodeForHTMLAttribute(priority_name)+"'>&nbsp;</span>" :"<span class='disp-ib vmiddle boxszbb bgtransp block-bordered icon-xs mr5 top-1' 'role='img' aria-label='"+ZSEC.Encoder.encodeForHTMLAttribute(priority_name)+"'>&nbsp;</span>" ):"";
            var inline_edit = "", drp_icon = "";
            if (r.editConditions()) {
                var isPriorityMatrix = requestListData && requestListData.is_priority_matrix == "false" ? false : true;
                if(isPriorityMatrix){
                    inline_edit = " lv-inline-actions cur-ptr text-combobox"; // No I18N
                    drp_icon = "<em></em>";
                }
            }
                    colstr = "<div class='no-bord-back  " + inline_edit + "' data-lv-action='priority'>"+ drp_icon +  priority_color + "<span class='text-overflow' rel='uitip' mode_ellipsis='true' title='"+e_attr(priority_name)+"'>"+e_html(priority_name)+"</span> </div>";
                    colstr += "<div class='inline-edit inplace-edit boxsetpanel mt-4 hide' style='width:150px;top:" + (_self.viewMode == "table" ? "11" : "41") + "px'></div>";
            return colstr;
        },
        r.constructApprovalStatusCell = function (table_data) {
            var rd = table_data.row_data,
                apprSt = ""; // No I18N
        var approvalStatusName = rd.approval_status ? rd.approval_status.name : null,
		apprstatusDetails =  {
			"Pending Approval": {// No I18N
				"cssClass": "APPR_1",// No I18N
				"i18nKey": "sdp.request.listview.help.pending"// No I18N
			},
			"Approved": {// No I18N
				"cssClass": "APPR_2",// No I18N
				"i18nKey": "sdp.request.listview.help.approved"// No I18N
			},
			"Denied": {// No I18N
				"cssClass": "APPR_3",// No I18N
				"i18nKey": "sdp.request.listview.help.rejected"// No I18N
			},
			"To Be Sent": {// No I18N
				"cssClass": "APPR_4",// No I18N
				"i18nKey": "sdp.approval.status.tobesent" //No I18N
			},
			"Pending Clarification": {// No I18N
				"cssClass": "APPR_5",// No I18N
				"i18nKey": "sdp.request.listview.help.pendingclarification"// No I18N
			}
		};
        if (approvalStatusName != null && rd.status && (rd.status.in_progress==true || !approvalStatusName.includes("Pending"))) {
            apprSt = "<img class='vtop mt2 " + apprstatusDetails[approvalStatusName].cssClass + "' src='/images/spacer.gif' rel='uitip' title='" + getMessageForKey(apprstatusDetails[approvalStatusName].i18nKey) + "'>"; // No I18N
            }
            return apprSt;
        },
        r.constructDependCell = function (table_data) {
            var rd = table_data.row_data,
                colstr = "-"; //NO I18N
            switch(rd.dependency_status){
                case "parent_request_completed": //NO I18N
                    colstr =
                    colstr = '<a href="/" nonce='+sdpNonce+' data-event="click" data-handler="NewWindow(&apos;/RequestDependencies.do?SubmitAction=getMap&amp;Module=request&amp;EntityId='+rd.id+'&apos;,&apos;RequestDependencies&apos;, &apos;1300&apos;, &apos;600&apos;,&apos;yes&apos;,&apos;center&apos;)"><span rel="uitip" title="' + e_attr(getMessageForKey("sdp.requests.listview.dependency.completed")) + '" class="dependency-completed mr5"></span></a>'; //NO I18N
                    break;
                case "dependent_request_pending": //NO I18N
                    colstr = '<a href="/" nonce='+sdpNonce+' data-event="click" data-handler="NewWindow(&apos;/RequestDependencies.do?SubmitAction=getMap&amp;Module=request&amp;EntityId='+rd.id+'&apos;,&apos;RequestDependencies&apos;, &apos;1300&apos;, &apos;600&apos;,&apos;yes&apos;,&apos;center&apos;)"><span rel="uitip" title="' + e_attr(getMessageForKey("sdp.requests.listview.dependency.pending")) + '" class="dependency-pending mr5"></span></a>'; //NO I18N
                break;
                default:
                    colstr = '<span rel="uitip" title="' + e_attr(getMessageForKey("sdp.requests.listview.dependency.nodependents")) + '" class="reqdependency mr5" role="img"></span>'; //NO I18N
            }
            return colstr;
        },
        r.constructTemplateTypeCell = function (table_data,_self) {
            if (_self.viewMode != "classic" && _self.viewMode != "combined") {
                var rd = table_data.row_data,title = "sdp.requests.view.incidentrequest",ic_class = "cspr incident-req icon-sm mt3"; // No I18N
                if(_self.addIn){
                    ic_class = "cspr incident-req icon-sm mt10";  // No I18N
                }
                if (rd.is_service_request) {
                    r.service_requests_ids.push(rd.id);
                    title = "sdp.home.ssp.templates.tooltip.servicerequest"; // No I18N
                    ic_class = "cspr service-req icon-sm mt3"; // No I18N
                    if(_self.addIn){
                        ic_class = "cspr service-req icon-sm mt10"; // No I18N
                    }
                }
                return "<span title='" + getMessageForKey(title) + "' rel='uitip' class='" + ic_class + "'role='img'></span>"; // No I18N
            } else {
                var rd = table_data.row_data,title = "sdp.requests.view.incidentrequest",ic_class = "rspr r-inci-h icon-xl"; // No I18N
                if (rd.is_service_request) {
                    r.service_requests_ids.push(rd.id);
                    title = "sdp.home.ssp.templates.tooltip.servicerequest"; // No I18N
                    ic_class = "rspr r-ser-h icon-xl"; // No I18N
                }
                var isModify = sdp_user.ROLES.indexOf("ModifyRequests") != -1;
                var isDelete = sdp_user.ROLES.indexOf("DeleteRequests") != -1;
                var html = ''; // No I18N
                if (isModify || isDelete) {
                    var disable = "";
                    if (_self.viewMode == 'combined') {
                        disable = table_combined_task.bulkSelect.selectedModule && table_combined_task.bulkSelect.selectedModule != rd.entity_module ? "disabled" : ""; // No I18N
                    }
                    html += '<div class="flip-container mt15">'; // No I18N
                    html += '<div class="flipper">' + // No I18N
                            '<div class="front"><span class="' + ic_class + '"></span></div>' + // No I18N
                            '<label for="chkreq' + rd.id + '"><div class="back"><input type="checkbox" '+disable+' data-table-checkbox id="chkreq' + rd.id + '" value="' + rd.id + '"  templateid="' + rd.template.id + '" name="request" aria-label="'+getMessageForKey("common.checkbox.button")+'"></div></label>'; // No I18N
                } else {
                    html += '<div class="flip-container mt15">'; // No I18N
                    html += '<div class="flipper no-flipper">' + // No I18N
                            '<div class="front no-flipper"><span class="' + ic_class + '"></span></div>'; // No I18N
                }
                html += '</div>' +// No I18N
                        '</div>';// No I18N
                return html;
            }
        },
        r.constructLinkReqCell = function (table_data, _self) {
            var rd = table_data.row_data,title = "sdp.request.listview.linkrequest.haslink.tooltip",isTrashReq = false,colstr = ""; // No I18N
            if (rd.has_linked_requests) {
                var yesString = '<span class="cspr icon-sm link-req" role="img" aria-label="' + getMessageForKey(title) + '"></span>'; // No I18N
                if (!isTrashReq) {
                    var onclick  = "showURLInDialog('/RemoveRequestLink.do?removeLink=getLinkedRequests&parentId=" + rd.id + "&fromParent=true&actionFrom=ListView',' position=absmiddle, modal=yes, width=1000px, title=" + getMessageForKey('sdp.requests.view.linkedfrom.linked') + "');"; //NO I18N
                    if(_self.addIn){
                        onclick = "";
                    }
                    colstr = "<a class='mr10 vbottom' href='/'  data-event='click' nonce='"+sdpNonce+"'  data-handler=\""+onclick+"\" title='" + getMessageForKey(title) + "' rel='uitip'>" + yesString + "</a>"; // No I18N
                } else {
                    colstr = "<strong  title='" + getMessageForKey(title) + "' rel='uitip'>" + yesString + "</strong>"; // No I18N
                }
            } else {
                var isLinkedReq = rd.linked_to_request;
                if (isTrashReq || isLinkedReq == null) {
                    colstr = "<span rel='uitip' title='" + getMessageForKey('sdp.request.listview.linkrequest.nolinkedfrom.tooltip') + "' class='mr10 vmiddle' role='img'>" + '<span class="cspr icon-sm unlink-req"></span>' + "</span>" // No I18N

                } else {
                    var target = window.externalframe ? 'target="_blank"' : ''; // NO I18N
                    var linkedId = rd.linked_to_request.request.id
                    var linkComment = rd.linked_to_request.link_comments; // No I18N
                    title = getMessageForKey("sdp.request.listview.linkrequest.linkedto.tooltip", [linkedId + "<br>" + e_html(linkComment)]); // No I18N
                    colstr = "<a class='mr10 vbottom' "+target+" href='/WorkOrder.do?woMode=viewWO&woID=" + linkedId + "' title='" + e_attr(title) + "' rel='uitip' mode_html='true'>" + '<span class="cspr icon-sm child-req" role="img" aria-label="' + e_attr(title) + '" ></span>' + "</a>"; // No I18N
                }
            }
            return colstr;
        },
        r.constructLinkReqHeader = function () {
            return '<img src="/images/spacer.gif" class="associatedlink-search" width="16" height="1" alt="Associated Link">'; // No I18N
        },
        r.constructSlaCell = function (table_data) {
            var rd = table_data.row_data;
            var woId = rd.id;
            var dueByString = "",cssClass = "",dueByTimeTrimmed = "-"; //No I18N
            // var woStatusId = rd.status ? rd.status.id : ""; //No I18N
            // if (woStatusId) {
            var dueByTime = rd.due_by_time //No I18N
            if (dueByTime != null) {
                var SLATimeInfo = r.getDueByTime(rd);
                dueByString = SLATimeInfo.dueByTime //If dueByString is null it indicates that the time difference is in seconds.
                dueByTimeTrimmed = SLATimeInfo.dueByTimeTrimmed; //If dueByTimeTrimmed is null it indicates that the time difference is in seconds.
                var isNearBy = SLATimeInfo.isNearBy;
                var isCompleted = SLATimeInfo.isCompleted;
                var isOverDue = rd.is_overdue
                if (isOverDue || dueByString == "") { //If request is OverDue or dueByString is empty then text is shown in red color
                    cssClass = "text-danger"; //No I18N
                }
                dueByString = r.getOverDueMessage(dueByString, isCompleted, isNearBy, isOverDue);
                dueByTimeTrimmed = r.getOverDueMessage(dueByTimeTrimmed, isCompleted, isNearBy, isOverDue);
                //TASKID: 75423
                if ((!dueByString || !dueByTimeTrimmed ) ||
                    (rd.status && rd.status.in_progress && rd.status.stop_timer)
                ) { //If dueByString is null
                    dueByString = "";
                    dueByTimeTrimmed = "-";
                }
            }
            // }
            if (dueByString == null) {
                dueByString = "<span rel='uitip' class='" + cssClass + "'>" + e_html(dueByTimeTrimmed) + "</span>";
            } else {
                dueByString = "<span rel='uitip' title='" + e_attr(dueByString) + "' class='" + cssClass + "'>" + e_html(dueByTimeTrimmed) + "</span>";
            }
            return dueByString;
        },
        r.constructCSICell = function(rd,_self){
            var row_data = rd.row_data, col_str = "-", dropIcon=""; // No I18N;
            var isModify = sdp_user.ROLES.indexOf("ModifyRequests") != -1  && _self.inlineEditEnabled, inline_edit = ""; // No I18N
            inline_edit = isModify && _self.viewMode != "rq_leftpanel" && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED") ) && _self.viewMode !== "kanban" && _self.viewMode !== "rq_leftpanel" ?  "lv-inline-actions cur-ptr text-combobox" : "";   //No I18N
            var csiEntity = rd.head_data.lookup_entity;
            var csiField = row_data[csiEntity];
            if(csiField != null){
                col_str = row_data[csiEntity].hasOwnProperty("name") ? row_data[csiEntity].name : row_data[csiEntity];
            }
            if (_self.viewMode != "rq_leftpanel" && _self.viewMode != "kanban"&& isModify && (_self.filterBy && _self.filterBy.name !== "TRASH" && (!isMSPOrSCP || !sdp_feature_status.is_unapproved_requester_enabled || _self.filterBy.name !== "UNAPPROVED") )) {
                dropIcon = "<em></em>"; // No I18N
            }
            return '<span class="'+ inline_edit +' no-bord-back " data-lv-action="category" data-display-name="'+e_attr(rd.head_data.display_name)+'" rel="uitip" mode_ellipsis="true" title="'+e_attr(col_str)+'">'+dropIcon+e_html(col_str)+'</span>'
        },
        r.constructAssociationProject = function (rd, _self) {
            rd = rd.row_data, str = "-";
            if(rd.association_project){
               str = _self.viewMode === "rq_leftpanel" ? rd.association_project.id : '<a target="_blank"  href="/ProjectAction.do?submitaction=ViewProject&amp;projectid='+rd.association_project.id+'" rel="uitip noopener" title="' + getMessageForKey("sdp.requests.projectdialog.associatedproject") + '">'+rd.association_project.id+'</a>';
            }
            return str;
        },
        r.constructTechnicianTimer = function(rd){
            var rd = rd.row_data, str = "", title="sdp.request.view.technician.timer.nooneisworkingonthisrightnow", cls="cur-ptr list-sprite start-timer-icon-off", img="/images/spacer.gif", tech_count = "", leftPadding="ml2"; //No I18N
            if (rd.technician_timer) {
                switch(rd.technician_timer.timer_status){
                    case "other_timer": // No I18N
                        title = "sdp.request.view.technician.timer.technicianisworkingonthisrightnow"; // No I18N
                        cls = "list-sprite start-timer-icon"; //No I18N
                        img = "/images/spacer.gif"; //No I18N
                        leftPadding=""; //No I18N
                        tech_count = rd.technician_timer.tech_count > 1 ? rd.technician_timer.tech_count : ""; // No I18N
                        break;
                    case "my_timer": // No I18N
                        title = "sdp.request.view.technician.timer.stopyourworklogtimer"; // No I18N
                        cls = "cur-ptr"; //No I18N
                        img = "images/timer-clock-icon.gif"; //No I18N
                        tech_count = rd.technician_timer.tech_count > 1 ? rd.technician_timer.tech_count : ""; // No I18N
                        break;
                    case "disable_timer": //No I18N
                        title = "request.closed"; // No I18N
                        cls = "list-sprite start-timer-icon wlt-disabled"; //No I18N
                        img = "/images/spacer.gif"; //No I18N
                        break;
                }

                var cl = "";
                if(requests_table && !requests_table.inlineEditEnabled){
                    cl +=' disableDiv'; //NO I18N
                }

                str = '<div class="disp-ib vtop" id="timericon-request'+rd.id+'" data-requestid="'+rd.id+'" data-timer-status="'+rd.technician_timer.timer_status+'"><div class="inline-timer wlt-div '+cl+'"><img src="'+img+'" title="'+e_attr(getMessageForKey(title))+'" rel="uitip" mode_html="true" class="icon-sm '+cls+'"><span class="pos-rel '+leftPadding+' right0 top2 sb">'+tech_count+'</span></div><div id="worklog_timer_'+rd.id+'" class="hide top5 worklog-timer wlt-div"></div></div>'; // No I18N
            }
            return str;
        },
        //Requester cell construct
        r.constructRequesterCell = function(rd,_self){
            var rd = rd.row_data, title = "", vipClass=""; //No I18N
            var widthStyle=_self.viewMode === "table" ? "calc(100% - 20px)":"80px"; //No I18N
            var requesterName=(rd.requester.name ? e_html(rd.requester.name) : "-"); //No I18N

            if(rd.requester.is_vipuser){
                vipClass = "vip-name-xs vmiddle icon-sm p0 top0"; //No I18N
                title = e_attr(getMessageForKey("sdp.admin.requesterDef.vipuser")); //No I18N
            }
            return '<span class="disp-ib vmiddle text-overflow" style="max-width: '+widthStyle+'"; title="'+requesterName+'" rel="uitip" mode_ellipsis="true">'+requesterName+ '</span><span role="img" class="'+vipClass+'" title="'+title+'"></span>'; //No I18N
        },
         // Cell constructing ends here

        //It will be used for combined(request and task) view to change the component object based on module (request/task)
        r.changeComponentObject = function (rdata) {
            var retObj = "", module = rdata.entity_module;
            if (!module) {
                module = jQ(rdata).attr("data-module");
            }
            if (module == "task") {
                retObj = table_combined_task;
            } else {
                retObj = table_comp_request;
            }
            return retObj;
        },  /*
        * Method to get dueByTime,frDueTime,isCompleted,isNearByvalues for the given workorderid
        * dueByTime and frDueTime are returned as String containing the time duration.
        * isCompleted,isNearBy are returned as Boolean Values
        * returns a HashMap containing all the above attributes
        */
        r.getDueByTime = function(rd) {
            var timeInfo = {};
            var dueByTime = rd.due_by_time;
            var dueByString = "-",
                frDueString = "-",
                dueByStringTrimmed = "-",
                frDueStringTrimmed = "-"; // No I18N
            var frDueTime = rd.first_response_due_by_time != null ? parseInt(rd.first_response_due_by_time.value) : null;
            var completedTime = rd.completed_time != null ? parseInt(rd.completed_time.value) : null;
            var respondedTime = rd.responded_time != null ? parseInt(rd.responded_time.value) : null;
            var resolvedTime = rd.resolved_time != null ? parseInt(rd.resolved_time.value) : null;
            var currentSystemTime;
            var isCompleted = false,
                isResponded = false,
                isNearBy = false;
            //checking for the presence of Completed time of the respective workorder
            //ResolvedTime will be considered first for sla calculation than completedTime
            if (resolvedTime != null) {
                currentSystemTime = resolvedTime;
                isCompleted = true;
            } else if (completedTime != null) {
                currentSystemTime = completedTime;
                isCompleted = true;
            } else {
                currentSystemTime = Date.now();
                isCompleted = false;
            }
            //checking for the presence of DueByTime for the respective Workorder.
            if (dueByTime != null) {
                if (parseInt(dueByTime.value) > currentSystemTime && !isCompleted) {
                    var createdTime = parseInt(rd.created_time.value);
                    dueByString = r.constructTimeDiff(parseInt(dueByTime.value), currentSystemTime, false); //dueByTime.display_value;
                    //the absolute time difference
                    dueByStringTrimmed = r.constructTimeDiff(parseInt(dueByTime.value), currentSystemTime, true);
                    //Constructs the absolute time difference with trimmed time format
                    //checking whether the DueByTime is neared for the workorder.
                    if (r.isNearByDueByTime(parseInt(dueByTime.value), createdTime, currentSystemTime)) {
                        isNearBy = true;
                    }
                } else if (parseInt(dueByTime.value) <= currentSystemTime) {
                    dueByString = r.constructTimeDiff(parseInt(parseInt(dueByTime.value)), currentSystemTime, false); //dueByTime.display_value;
                    //Constructs the absolute time difference
                    dueByStringTrimmed = r.constructTimeDiff(parseInt(dueByTime.value), currentSystemTime, true); //Constructs the absolute time difference with trimmed time format
                }
            }
            //checking for the presence of Responded time of the respective workorder
            if (respondedTime != null) {
                currentSystemTime = respondedTime;
                isResponded = true;
            } else {
                currentSystemTime = Date.now();
                isResponded = false;
            }
            //checking for the presence of frDueTime for the respective Workorder.
            if (frDueTime != null) {
                if (frDueTime > currentSystemTime && !isResponded) {
                    frDueString = r.constructTimeDiff(parseInt(rd.first_response_due_by_time.value), currentSystemTime, false); //rd.first_response_due_by_time.display_value;
                    //the absolute time difference
                    frDueStringTrimmed = r.constructTimeDiff(parseInt(rd.first_response_due_by_time.value), currentSystemTime, true); //Constructs the absolute time difference  with trimmed time format
                } else if (frDueTime <= currentSystemTime) {
                    frDueString = r.constructTimeDiff(parseInt(rd.first_response_due_by_time.value), currentSystemTime, false); //rd.first_response_due_by_time.display_value;
                    //the absolute time difference
                    frDueStringTrimmed = r.constructTimeDiff(parseInt(rd.first_response_due_by_time.value), currentSystemTime, true); //Constructs the absolute time difference  with trimmed time format
                }
            }
            timeInfo.isCompleted = isCompleted;
            timeInfo.isResponded = isResponded;
            timeInfo.isNearBy = isNearBy;
            timeInfo.dueByTime = dueByString;
            timeInfo.frDueTime = frDueString;
            timeInfo.dueByTimeTrimmed = dueByStringTrimmed;
            timeInfo.frDueTimeTrimmed = frDueStringTrimmed;
            return timeInfo;
        },
            /*
            *returns true if the workorder is nearing the duebytime
            */
        r.isNearByDueByTime = function(dueByTime, createdTime, currentTime) {
            var isNearByTime = false;
            var nearByTime = (((dueByTime - createdTime) / 100) * 70) + createdTime;
            if (currentTime > nearByTime) {
                isNearByTime = true;
            }
            return isNearByTime;
        },
        r.getOverDueMessage = function(dueByString, isCompleted, isNearBy, isOverDue) {
            var retString = "";
            if (dueByString == "" && !isCompleted) { //If dueByString is null and request is not closed then request is on due
                retString = getMessageForKey("sdp.requests.view.ondue"); // No I18N
            } else if (!dueByString == "") {
                if (isNearBy && !isCompleted) {
                    retString = getMessageForKey("sdp.requests.view.duein") + " " + dueByString; // No I18N
                } else if (isOverDue) {
                    if (isCompleted) { //If request is overdue and closed then the request is closed after the duebytime
                        retString = getMessageForKey("sdp.requests.view.delayedby") + " " + dueByString; // No I18N
                    } else { //If request is overdue and open then the request is on delay
                        retString = getMessageForKey("sdp.requests.view.delayby") + " " + dueByString; // No I18N
                    }
                } else if (!isCompleted) { //If request is open, overdue not set then the request is due by time given by dueByString
                    retString = getMessageForKey("sdp.requests.view.duein") + " " + dueByString; // No I18N
                }
            }
            return retString;
        },
        /*
        * Constructs the Time Difference between the given two time periods.
        */
        r.constructTimeDiff = function(dueByTime, endTime, isTrimmed) {
            var diffString = "";
            var timeDiff = (function (n) {
                return n < 0 ? Math.ceil(n) : Math.floor(n);
            })((dueByTime - endTime) / (1000 * 60));
            var days = (function (n) {
                return n < 0 ? Math.ceil(n) : Math.floor(n);
            })(timeDiff / (60 * 24));
            var hours = ((function (n) {
                return n < 0 ? Math.ceil(n) : Math.floor(n);
            })(timeDiff / (60))) % 24;
            var minutes = (timeDiff) % 60;
            if (timeDiff !== 0) {
                if (days !== 0) {
                    if (isTrimmed) {
                        diffString += Math.abs(days) + getMessageForKey("sdp.requests.view.short.day");
                    } else if (Math.abs(days) > 1) {
                        diffString += Math.abs(days) + " " + getMessageForKey("sdp.requests.view.days");
                    } else {
                        diffString += Math.abs(days) + " " + getMessageForKey("sdp.requests.view.day");
                    }
                    if (hours !== 0) {
                        if (isTrimmed) {
                            diffString += " " + Math.abs(hours) + getMessageForKey("sdp.requests.view.short.hour");
                        } else if (Math.abs(hours) > 1) {
                            diffString += " " + Math.abs(hours) + " " + getMessageForKey("sdp.requests.view.hours");
                        } else {
                            diffString += " " + Math.abs(hours) + " " + getMessageForKey("sdp.requests.view.hour");
                        }
                    }
                } else {
                    if (hours !== 0) {
                        if (isTrimmed) {
                            diffString += " " + Math.abs(hours) + getMessageForKey("sdp.requests.view.short.hour");
                        } else if (Math.abs(hours) > 1) {
                            diffString += " " + Math.abs(hours) + " " + getMessageForKey("sdp.requests.view.hours");
                        } else {
                            diffString += " " + Math.abs(hours) + " " + getMessageForKey("sdp.requests.view.hour");
                        }
                    }
                    if (minutes !== 0) {
                        if (isTrimmed) {
                            diffString += " " + Math.abs(minutes) + getMessageForKey("sdp.requests.view.short.minute");
                        } else if (Math.abs(minutes) > 1) {
                            diffString += " " + Math.abs(minutes) + " " + getMessageForKey("sdp.requests.view.minutes");
                        } else {
                            diffString += " " + Math.abs(minutes) + " " + getMessageForKey("sdp.requests.view.minute");
                        }
                    }
                }
            }
            return diffString;
    },
    // Method added for MSP/SCP
    r.constructIsActiveContract = function(rd, _self){
        rd = rd.row_data, str = "-";
        var widthStyle=_self.viewMode === "table" ? "calc(100% - 20px)":"80px"; //No I18N
        if(rd.accountcontract){
            str=rd.accountcontract.isactivecontract;
        }
        return '<span class="disp-ib vmiddle text-overflow" style="max-width: '+widthStyle+'"; title="'+str+'" rel="uitip" mode_ellipsis="true">'+str+ '</span>';
    }
    /**
     * Custom view with user additional fields currently not supported
     * handling when the view cames reset to default view
     */
    r.apiFailuerCallback = function (resp) {
        var _self = resp[0];
        var resp = resp[1].responseJSON;
        //SD-126588
        if(_self.context.viewMode=="classic"){
            jQuery("#req_skloader").skLoader("hide"); //No I18N
            jQuery("#list_view_container").fadeIn(500);
            //show the leftpanel gear when leftpanel loads
            jQuery(".left-panel-settings").fadeIn("slow"); //No I18N
            initTooltip("#listcontrols"); //No I18N
        }
        if(resp){
        var responseText = resp.response_status && resp.response_status.constructor === Array ? resp.response_status[0] : resp.response_status;
        var user_add_msg = getMessageForKey("api.customview.invalid.column"); // No I18N
            var invalid_filter_criteria=getMessageForKey("sdp.customfilter.invalid.criteria");// No I18N
            /***
             * Added the check api callback failure for filter_by value if its was deleted | technician changed as user | license degrade
             */
            if(_self.context && (_self.context.viewMode == "table" || _self.context.viewMode == "classic" || _self.context.viewMode == "rq_leftpanel" || _self.context.viewMode == "kanban") && (user_add_msg === responseText.messages[0].message || (responseText.messages[0].message === translate("apicodes.4001") && responseText.messages[0].field == "list_info.filter_by")||(responseText.messages[0].message==invalid_filter_criteria))){
                if(user_add_msg === responseText.messages[0].message){
            showalert('warning', getMessageForKey("customview.invalid.currentview"),"isAutoHide=true"); // No I18N
                }
                else if(invalid_filter_criteria === responseText.messages[0].message){
                    showalert('failure', getMessageForKey("sdp.customfilter.invalid.criteria"),"isAutoHide=true,delay=3"); // No I18N
                }
            // var perObj = sdp_user.CLIENT_CONF.requestlistview;
                var viewname =  requestListViews.filter_by.name = sdp_user.USERTYPE === "Requester" ? "All_Pending_Requester" : "Open_System"; // No I18N
            // perObj.classic ? perObj.classic.viewname = viewname : perObj.classic =  sdp_user.CLIENT_CONF.requestlistview.classic = {"viewname": viewname}; //No i18n
            // addPersonalization("requestlistview", perObj); // No I18N
                if(baseFilterDetails){
                    var view_id = requestListViews.filter_by.id = sdp_user.USERTYPE === "Requester" ? baseFilterDetails.defaultFilterRequester :  baseFilterDetails.defaultFilterTechnician; // No I18N
                }

            if (_self.context.viewMode == "rq_leftpanel") {
                  /**
                 * handle the viewname when leftpanel came
                 */
                    requestListViews.filter_i18n = sdp_user.USERTYPE === "Requester" ? getMessageForKey("sdp.requests.viewrequest.allmypendingrequests") :getMessageForKey("sdp.requests.viewrequest.openrequests"); //No I18N
                    if(view_id){
                        _self.t_obj.table_info.list_info.filter_by = { id: view_id };
                    }
                    else{
                _self.t_obj.table_info.list_info.filter_by = { name: viewname };
                    }
                    jQuery(".viewname").attr("title", e_attr(requestListViews.filter_i18n));
                    var widthSet = _self.context.viewMode == "rq_leftpanel" ? 'style="max-width:110px"' : 'style="width: auto; max-width: 145px;"'; //No I18N
                    jQuery("#listview_btn").html('<span class="dd"><strong class="caret m0"></strong></span><div id="filter_name" class="fl text-overflow" ' + widthSet + '>' + e_html(requestListViews.filter_i18n) + '</div>'); //No I18N
                setTimeout(function(){
                    _self.refreshTable('refresh'); // No I18N
                        jQuery("#req_skloader").skLoader("hide"); //No I18N
                },1000);

            } else {
                /**
                     * TASK - 79962
                     * If the selected custom is failed then we change the filter into none
                     * and change the view name to "All_Requests"
                     * and reloading the page
                 */
                     var data = { global_view_name: "All_Requests" }; // NO I18N
                    addPersonalization("requestlistview", data); // No I18N
                    if(view_id){
                        sdpAjaxUrlHandler("/WOListView.do?viewID="+view_id); // No I18N
                    }else{
                sdpAjaxUrlHandler("/WOListView.do?viewName="+viewname); // No I18N
            }

                }
            }//Kanban View Special Error Handling as there will be multiple table components in  Kanban alone
            else if(_self.entity_controller){
                if(_self.entity_controller.viewMode == "kanban"){
                    var viewname =  requestListViews.filter_by.name = sdp_user.USERTYPE === "Requester" ? "All_Pending_Requester" : "Open_System"; // No I18N
                    if(view_id){
                        sdpAjaxUrlHandler("/WOListView.do?viewID="+view_id); // No I18N
                    }else{
                    sdpAjaxUrlHandler("/WOListView.do?viewName="+viewname); // No I18N
                }
                }
            }
            else {
                showalert('failure', e_html(responseText.messages[0].message),"isAutoHide=true,delay=10"); // No I18N
        }
        }
        else{
            //Server logged out state.TaskId: 76557
            showalert('failure',  getMessageForKey("sdp.admin.associatedapplications.connectionfailure.msg",["SDP"]),"isAutoHide=true,delay=3"); // No I18N
        }
        return false;
    }
    //Kanban List Construct
    r.constructTechList = function (data) {
        var str = '';
        str = '<span class="kanban-userimg-container"><span class="cspr icon-xl tech-avatar-default vmiddle fl"></span></span>';
        str += '<span class="request-kanban-picker-techname top3">'+e_html(data.name)+'</span>';
        return str;
    }
    /**
     * Url search Callback function handling
     */
    r.urlSearchCallBackFunction = function(type, tb_obj){
        if(type !== "tableSearch"){ //No I18N
            return;
        }
        var searchCriterias = table_comp_request.t_obj.table_info.list_info.search_criteria;

        if(!Array.isArray(searchCriterias) && !jQuery.isEmptyObject(searchCriterias)){
            searchCriterias = [searchCriterias];
        }

        /**
         * If the advSearch have some criteria, then we need to merge it.
         */
        if(requestListViews.advSearchCriteria && Array.isArray(requestListViews.advSearchCriteria)){
            if(Array.isArray(searchCriterias)){
            searchCriterias = searchCriterias.concat(requestListViews.advSearchCriteria);
            } else if(jQuery.isEmptyObject(searchCriterias)) {
                searchCriterias = requestListViews.advSearchCriteria;
            }
        }

        // Modify the search condition using inputDataModifier
        searchCriterias = r.inputDataModifier({
            list_info:{
                search_criteria: searchCriterias
            }
        });
        searchCriterias = searchCriterias.list_info.search_criteria;

        table_comp_request.t_obj.table_info.list_info.search_criteria = searchCriterias;
        if(searchCriterias && !searchCriterias.length){
            table_comp_request.t_obj.options.nodataString = table_comp_request.t_obj.options.nodataStringHTML;
        }else{
            table_comp_request.t_obj.options.nodataString = table_comp_request.t_obj.options.nodataStringText;
        }
        table_comp_request.refreshTable('search'); // No I18N
    },
    r.searchFieldsToCriteria = function(searchObj, t_obj){
        var searchCriterias = [];
        jQuery.each(searchObj, function(key,value){
            var condition = "contains"; //No I18N
            var metaKey = key.split('.').length > 0 && key.indexOf("udf_fields") == -1 ? key.split('.')[0] : key;
            var metaInfo = t_obj.t_obj.meta_info[metaKey];
            switch(metaInfo.type){
                case "icon": //No I18N
                case "long": //No I18N
                case "boolean": //No I18N
                    condition = "is"; //No I18N
                    break;
                default:
                    condition = "contains"; //No I18N
            }
            searchCriterias.push({
                "field" : key, // No I18N
                "value" : value, // No I18N
                "condition" : condition, //No I18N
                "logical_operator" : "and" // No I18N
            });
        });
        return searchCriterias;
    }
    r.resizeTableWidthHeight = function(){
        var _self = this;
        var tableObj = _self.viewMode == "combined" ? table_combined_task : table_comp_request; //No I18N
        var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        var height = 0;
        var paddingBottom = window.externalframe ? 0 : 10;
        // 74872[4] - https://sdp-issues/TaskDefAction.do?submitaction=viewTask&TASKID=74872&from=QuickLink
        if (jQuery('#header-placeholder').length == 0 && !window.externalframe) {
            height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - paddingBottom - 80)
        } else {
            if (window.externalframe) {
                // For externalframe the offet is set to be 120
                // https://sdp-issues/TaskDefAction.do?submitaction=viewTask&TASKID=75086&from=QuickLink
                height = jQuery(window).height() - 120
            } else {
                height = (jQuery(window).height() - (jQuery('#header-placeholder').height() || 0) - chatbar_height - paddingBottom - 80)
            }
        }
        var alert = jQuery("#listcontrols .alert:visible"); // NO I18N
        if(alert.length > 0){
            var alertHeight = alert.closest("div").outerHeight(); //NO I18N
            height = height - alertHeight;
        }
        if(_self.from && (_self.from == 'dashboard' || _self.from == 'admin')) {
            height = height + 46;
        }
        var searchRowHeight = jQuery("#requests_list .searchRow:visible").outerHeight() || 0;
        height = height - searchRowHeight;
        // var width = jQuery(window).width() - 10;
        tableObj && tableObj.setTableHeight(height);
        if(_self.disableBodyScroll){
            jQuery("body").addClass("atp-open"); //No I18N
        }
        // tableObj && tableObj.setTableWidth(width);
        setTimeout(function(){
            jQuery('#worequestview').height(height+5);//No I18N
        }, 1000);
        // tableObj.setTablewidth()
        // if trash view, we are hide the body scroll
        if(requestListViews.filter_by && requestListViews.filter_by.name == "TRASH"){ // NO I18N
            jQuery("body").addClass("atp-open"); //No I18N
        }
    }
   /**
     * This method used to manipulate the input_data before process them into tableComponent
     * @param {Object} input_data
     */
   r.inputDataModifier = function(input_data){
        if(this.from === "merge" || this.from === "link_request"){ // NO I18N
            if(this.from === "merge"){ // NO I18N
                // We need to skip the request that invoke the merge
                var woID = top.window.woID;
                var search_criteria = input_data.list_info.search_criteria;
                if (!Array.isArray(search_criteria)) {
                    search_criteria = [];
                }
                var hasIDNotIn = false;
                var hasISServiceTemplate = false;
                var hasISServiceRequest = false;
                for (var index = 0; index < search_criteria.length; index++) {
                    var item = search_criteria[index];
                    if (item.field === "id" && item.condition === "is not" && item.value == woID) {
                        hasIDNotIn = true;
                    }
                    if (top.window.$req.details.request_info.template.is_service_template) {
                        if (item.field === "template.is_service_template" && item.condition === "is" && item.value == false) {
                            hasISServiceRequest = true;
                        }
                        if (item.field === "template.id" && item.condition === "is" && item.value == top.window.$req.details.request_info.template.id) {
                            hasISServiceTemplate = true;
                        }
                    }
                }
                if (!hasIDNotIn) {
                    var criteria = {
                        "condition": "is not", // NO I18N
                        "field": "id", // NO I18N
                        "logical_operator": "and", // NO I18N
                        "value": woID // NO I18N
                    }
                }
                if (top.window.$req.details.request_info.template.is_service_template) {
                    if (!hasISServiceRequest || !hasISServiceTemplate) {
                        // object has
                        if (!criteria.hasOwnProperty("children")) {
                            criteria.children = [];
                        }
                        if (!hasISServiceRequest) {
                            criteria.children.push({
                                "condition": "is", // NO I18N
                                "field": "template.is_service_template", // NO I18N
                                "logical_operator": "and", // NO I18N
                                "value": false // NO I18N
                            });
                        }
                        if (!hasISServiceTemplate) {
                            criteria.children.push({
                                "condition": "is", // NO I18N
                                "field": "template.id", // NO I18N
                                "logical_operator": "or", // NO I18N
                                "value": top.window.$req.details.request_info.template.id // NO I18N
                            });
                        }
                    }
                }
                if(input_data.list_info && input_data.list_info.search_criteria && Array.isArray(input_data.list_info.search_criteria)){
                    input_data.list_info.search_criteria.push(criteria);
                }else{
                    if(!input_data.list_info){
                        input_data.list_info = {};
                    }
                    input_data.list_info.search_criteria = [criteria];
                }
                // SD-102000
                // remove empty array
                if(input_data.list_info && input_data.list_info.search_criteria.length){
                    input_data.list_info.search_criteria = input_data.list_info.search_criteria.filter(function(item){
                        if(item){
                            return item;
                        }
                    });
                }
            }
            else if(this.from === "link_request"){ // NO I18N

                var woID = top.window.woID;
                var search_criteria = input_data.list_info.search_criteria;
                if (!Array.isArray(search_criteria)) {
                    search_criteria = [];
                }
                var hasIDNotIn = false;
                var hasLinkedWorkorder = false;
                var hasGlobalViewCriteria= false;
                for (var index = 0; index < search_criteria.length; index++) {
                    var item = search_criteria[index];
                    if (item.field === "id" && item.condition === "is not" && item.value == woID) {
                        hasIDNotIn = true;
                    }
                    if (item.field === "linked_workorder" && item.condition === "is not" && item.value == woID) {
                        hasLinkedWorkorder = true;
                    }
                    if (item.field === "is_service_request") {
                        input_data.list_info.search_criteria.splice(index,1);
                        index--; //To loop from top
                    }
                }

                var criteria =[];
                if (!hasIDNotIn) {
                    criteria.push({
                        "condition": "is not", // NO I18N
                        "field": "id", // NO I18N
                        "logical_operator": "and", // NO I18N
                        "value": woID // NO I18N
                    });
                }

                if(!hasLinkedWorkorder){
                    criteria.push({
                        "condition": "is not", // NO I18N
                        "field": "linked_workorder",  // NO I18N
                        "logical_operator": "and",  // NO I18N
                        "value": woID // NO I18N
                      });
                }

                if(input_data.list_info && input_data.list_info.search_criteria && Array.isArray(input_data.list_info.search_criteria)){
                    input_data.list_info.search_criteria=input_data.list_info.search_criteria.concat(criteria);
                }else{
                    if(!input_data.list_info){
                        input_data.list_info = {};
                    }
                    input_data.list_info.search_criteria = criteria;
                }

            }


            if(window.globalViewName == "Service_Requests" || window.globalViewName == "Incident_Requests"){
                var isServiceRequest=(window.globalViewName == "Service_Requests")?true:false; // NO I18N
                try{
                    input_data.list_info.search_criteria.unshift({"condition": "is", // NO I18N
                    "field": "is_service_request", // NO I18N
                    "logical_operator": "and", // NO I18N
                    "value": isServiceRequest // NO I18N
                    });
                }
                catch(error){}

            }
        }
        return input_data;
    },
	r.constructMaintenanceCell=function(table_data){
		var rd=table_data.row_data;
		if(!rd.maintenance){
			return '<span>-</span>';
		}
		if(sdp_user.ROLES.indexOf("ViewRequestMaintenances")>-1 && (!rd.is_service_request || ( rd.is_service_request && sdp_app.IS_SERVICECATALOG_ENABLED) ) ){
			return '<a class="cur-ptr" title="'+getMessageForKey('maintenance.info.rlv')+'" rel="uitip"  data-event="click" nonce="'+sdpNonce+'"  data-handler="requestListViews.openMaintenancePreview('+rd.maintenance.id+')" >'+getMessageForKey('created.via.maintenance')+'</a>';
    }
		else{
			return '<span>'+getMessageForKey('created.via.maintenance')+'</span>';
		}
	}
	r.getSspData = function(){
	    if(r.self_service_portal_settings && Object.keys(r.self_service_portal_settings).length > 0){
	        return r.self_service_portal_settings;
	    }
        let sspData;
        sdpAjax({
            url: '/api/v3/self_service_portal_settings', // No I18N
            async: false,
            success: (response) => {
                if(response["self_service_portal_settings"]){
                    sspData = response["self_service_portal_settings"][0];
                    r.self_service_portal_settings = sspData;
                }
            }
        });
        return sspData;
    }

    return r;
}());
/**
 * Request list view  initailization start here
 * Currently working view - Classic , combined and leftpanel
 *
 */
var requestListViews = {
    /** variable for retain previous filter view */
    previous_filter_state: "", //No I18N
    /** variable for retain filter view */
    filter_by: { name: "Open_System"}, //No I18N
    /** variable for retain current view */
    viewMode: "classic", //No I18N
    /** this for left panel combined view (request and task)  */
    isUnified: false,
    /**Refresh interval for list view  */
    refreshInterval: "",
    /* combined and classic view Init starts here  */
    initRequestListView: function () {
        var _self = this;
        _self.addIn=(typeof requestListData != "undefined" && requestListData.addIn); // No I18N
        jQuery(".page-progressbar").show(); //No I18N
        //swtiching between classic or combined view base(content),navgiation,columns chooser div id for table component
        if (!this.isUnified && jQuery("#activities_div").length > 0) {
            jQuery("#activities_div").attr("id", "requests_list_div").html(""); //No I18N
            jQuery("#bulk_selection_activities").attr("id", "bulk_selection_requests_list");//No I18N
            jQuery("#t_list_settings_activities").attr("id", "t_list_settings_requests_list");//No I18N
            jQuery("#t_column_choos_requests_list").html(""); //No I18N
            jQuery(".quick-filters").show(); //No I18N
        }
        if (this.isUnified && jQuery("#requests_list_div").length > 0) {
            jQuery("#requests_list_div").attr("id", "activities_div").html(""); //No I18N
            jQuery("#bulk_selection_requests_list").attr("id", "bulk_selection_activities");//No I18N
            jQuery("#t_list_settings_requests_list").attr("id", "t_list_settings_activities");//No I18N
            jQuery("#t_column_choos_activities").html(""); //No I18N
            jQuery(".quick-filters").hide(); //No I18N
        }
        //To avoid mulitple column chooser initialization during page resizing in request details page
        if (this.viewMode == "rq_leftpanel") {
            jQuery("#t_column_choos_requests_list,#t_column_choos_activities").html(""); //No I18N
        }
        setTimeout(function () {
            _self.bindEvents();
            // if (typeof viewDisplayName != "undefined" && isNaN(_self.viewName)) {
                jQuery("#listview_btn").attr("title", e_attr(this.filter_i18n));
                var widthSet = _self.viewMode == "rq_leftpanel" ? 'style="max-width:110px"' : 'style="width: auto; max-width: 145px;"'; //No I18N
                var isDropdown = requests_table.filterEnabled ? '<span class="dd"><strong class="caret m0"></strong></span>' : ""; //No I18N
                jQuery("#listview_btn").html(isDropdown+'<div id="filter_name" class="fl text-overflow" ' + widthSet + '>' + e_html(_self.filter_i18n) + '</div>'); //No I18N
            // }
        }, 100);
        requests_table.filterBy = _self.filter_by;
        if (_self.viewMode == "classic" || _self.viewMode == "table" && _self.viewMode != "combined") {
            delete requests_table.search_criteria;
            if (requestListData.global_view_name && requestListData.global_view_name != "All_Requests" && requestListData.global_view_name != "Requests") { //No I18N
                requests_table.search_criteria = [{"field":"is_service_request","value": requestListData.global_view_name == "Service_Requests" ? true : false, "condition":"is","logical_operator":"and"}]; //No I18N
            }
        }
        //when leftpanel is present getting sortfield from personlization and pass to tablecomponent initialization
        var listInfoPerObject = sdp_user.CLIENT_CONF[window.current_req_mode + "_requests"];
        if (_self.viewMode == "rq_leftpanel" && listInfoPerObject) {
            if(_self.input_data && _self.input_data.list_info && _self.input_data.list_info.filter_by && _self.input_data.list_info.filter_by.id && _self.input_data.list_info.filter_by.name) {
                _self.filter_by.id = _self.input_data.list_info.filter_by.id;
                _self.filter_i18n = requests_table.searchCriterFilterByI18n;
            }
            listInfoPerObject.list_info && listInfoPerObject.list_info.sort_field ? requests_table.sort_field = listInfoPerObject.list_info.sort_field : undefined;
            listInfoPerObject.list_info && listInfoPerObject.list_info.sort_order ? requests_table.sort_order = listInfoPerObject.list_info.sort_order : undefined;
        }
        requests_table.columnChooserObj = requestListViews.columnChooserObj;
        requests_table.show_total_count = _self.viewMode != "rq_leftpanel" && _self.viewMode != "kanban" ? requestListData.show_total_count : false; //No I18N
        if(_self.from && _self.from == "cf_request"){
            requests_table.show_total_count=_self.get_total_count?_self.get_total_count:false;
        }

        //TODO checking criteria
        if (_self.viewMode != "rq_leftpanel" && _self.input_data != null) {
            var list_data = _self.input_data;
            // list_data.list_info.filter_by ? requests_table.viewName = list_data.list_info.filter_by.name : "";
            // requests_table.filterBy = undefined;
            (_self.from === "admin" || _self.from === "report" || _self.input_data.list_info.filter_by == undefined)? requests_table.filterBy = undefined : undefined; //No I18N
            requests_table.search_criteria = list_data.list_info.search_criteria;
            // requests_table.search_fields = searchObj;
        }
        _self.from ? requests_table.from = _self.from : "";

        /**
         * Global search (gsearch)
         *
        */
        if(_self.searchText && _self.searchText != "null"){
            var searchText = _self.searchText;
            if(_self.subModSelText != "null" && _self.subModSelText != "default" && _self.subModSelText != "requestid"){
            //SD-108400 - For request global search with submodule request id,  adding a space before first id so that first request id is also fetched along with other ids given
                searchText = _self.subModSelText+(_self.subModSelText=="resolution"?":":"::")+searchText; //No I18N
            }
            requests_table.gsearch = searchText;
        }else{
            requests_table.gsearch = null;
        }

        if(_self.input_data){
             if(_self.input_data.hasOwnProperty("for")){
                requests_table["for"]=_self.input_data["for"];
            }
        }

        requests_table.initComponent(this.viewMode);
        this.previous_filter_state = this.filter_by && this.filter_by.name && this.filter_by.name == "TRASH" ? "TRASH" : undefined;
        if(isMSPOrSCP && sdp_feature_status.is_unapproved_requester_enabled && this.previous_filter_state == undefined && this.filter_by && this.filter_by.name && this.filter_by.name == "UNAPPROVED") {
            this.previous_filter_state = "UNAPPROVED";  //No I18N
        }
        //reseting the searchObject when switch to the another view
        delete _self.searchObjects;
        delete _self.searchFormObj;
        //check for combined view have assigning technician role to remove dropdown in filter view
        if(typeof viewDisplayName != "undefined" && Object.keys(viewDisplayName).length == 1){
            setTimeout(function () {
                jQuery("#ListViewFilterMenu").addClass("no-border").find('button').removeClass("btn").find("span").remove().end().end().find('ul').remove()
            }, 100);
        }
        if (_self.viewMode == "combined") {
            jQuery("#listview_btn").attr("title", e_attr(this.filter_i18n));
            var widthSet = _self.viewMode == "rq_leftpanel" ? 'style="max-width:110px"' : 'style="width: auto; max-width: 145px;"'; //No I18N
            jQuery("#listview_btn").html('<span class="dd"><strong class="caret m0"></strong></span><div id="filter_name" class="fl text-overflow" ' + widthSet + ' >' + e_html(_self.filter_i18n) + '</div>'); //No I18N
        }
    },
    /* classic and combined view related event bind delcared here  */
    bindEvents: function () {
        var _self = this;

        if(requests_table.filterEnabled){
        jQuery("#listview_btn").one('click', function (event) { //No i18n
                _self.initFilter();
            });
            }

        /* list view refresh handled  */
        jQuery("#refresh-frequency li input[name=Minutes]").off().on('click', function () { //NO I18N
            _self.changeRefreshFrequency();
        });
        jQuery("#refreshfreq").off('click.refreshfreq').on('click.refreshfreq', function () { //NO I18N
            _self.isUnified ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
        });

        if(_self.isUnified){
        jQuery("#requests_listSearch").off("click.requests_listSearch").on("click.requests_listSearch", function () { //No I18N
            _self.constructSearchPop();
        });
        }

        if (_self.viewMode == "rq_leftpanel") {
            jQuery(".cview").on("click", ".incoming-conv-icon,.outgoing-conv-icon", function (e) {
                $req.lpanel.iconAction('conversation', e); //NO I18N
            })
        }
        if(_self.viewMode != "kanban" && _self.viewMode != "combined" && _self.viewMode != "rq_leftpanel" && sdp_user.USERTYPE == "Technician"){
             /**
            * Custom Filter
            */
            var options = {
                // skipFields: ["impact_details", "description", "on_behalf_of", "email_cc", "email_ids_to_notify", "email_to", "editor", "assets","closure_info","service_approvers","resolution","service_sla","ola_due_by_time"], // No I18N
                parentDiv: "req_custom_filter", //No I18N
                support_search_criteria :true,
                isFR_ListInfo_Support:true,
                entity: "requests", //No I18N
                entityComponent: table_comp_request,
                applyFn: requestListViews.applyFilter,
                cancelFn: requestListViews.cancelFilter,
                enableSave: true,
                skipFields: ["service_sla"], //No I18N
                haveNestedColumns: true,
                module: "request", //No I18N
                refFiltFn: requestListViews.saveFilter,
                passOnlyIds: true,
                noneValID: "$(none)",  //No I18N
                metaParam: "advanced_search_filter",  //No I18N
                allowReadOnly: true,
                errFiltFn: function (resp) {
                    if(resp.responseJSON.response_status.messages[0].status_code === 4008){
                        showalert("failure", translate("sdp.api.customfilter.name.exists"), "isAutoHide=true, delay=3") //No I18N
                    }
                    else if(resp.responseJSON.response_status.messages[0].status_code === 4001){
                        if(resp.responseJSON.response_status.messages[0].field == "display_name"){
                            showalert("failure", translate("sdp.customfilter.invalid.name"), "isAutoHide=true, delay=3") //No I18N
                        } else {
                           showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                        }
                    }
                    else if(resp.responseJSON.response_status.status === "failed") {
                        showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                        requestListViews.temp_list_info ? table_comp_request.t_obj.table_info.list_info = requestListViews.temp_list_info: "";
                        delete requestListViews.temp_list_info;
                        delete table_comp_request.t_obj.table_info["for"];
                        table_comp_request.refreshTable("refresh"); //No I18N
                        requestListViews.advSearchCriteria = undefined;
                        requestListViews.toggleViewFilter(false);
                    }
    },
                // refFiltFn: function(){alert(1)},
                metaOverride: {
                    "udf_fields": { "display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields") }, //No I18N
                    "maintenance": {"read_only":false,"type":"boolean"} //NO I18N
                },
                subFieldsArr: {"site":["region","name"]},  //No I18N
                subUDFFields: {"requester": ["user_udf_fields"] , "technician": ["user_udf_fields","technician_udf_fields"], "on_behalf_of":["user_udf_fields"], "created_by":["user_udf_fields"], "editor":["user_udf_fields","technician_udf_fields"], "sla_violated_technician":["user_udf_fields","technician_udf_fields"],"fr_sla_violated_technician":["user_udf_fields","technician_udf_fields"]}, //No I18N
                // haveOtherUDF: true
                preSaveFn: function(criteria){
                    var isRestrict = true;
                    criteria.map(function(val){
                        if(val.field === "resolution.content" || val.field === "description"){ //No I18N
                            isRestrict = false;
                        }
                    })
                    if(!isRestrict){
                        showalert("warning", getMessageForKey("filters.resolution.description.notallowed"), "isAutoHide=true, delay=15"); //No I18N
                        return false;
                    }
                    return criteria;
                },
                specialFormats: ["have_none"],
                fieldTypeConditions: {
                    "resolution.content": ["is_empty", "is_not_empty", "contains", "not_contains"], //No I18N
                    "description": ["is_empty", "is_not_empty", "contains", "not_contains"] //No I18N
                },
                allowNegativeValues: false,
                dollarSupport:{
                    "$_user":{"fields": ["technician","sla_violated_technician","fr_sla_violated_technician","created_by"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} },//No I18N
                    "$_system_user":{"fields": ["created_by","sla_violated_technician","fr_sla_violated_technician"], "option":{"id":"$(system_user)", "text": getMessageForKey("common.systemuser")} },//No I18N
                    "$_group":{"fields": ["group"], "option":{"id":"$(my_group)", "text": getMessageForKey("sdp.requests.listview.allmyqueues")} },//No I18N
                    //SD-120037
                     "$_pendingstatus":{"fields": ["status"], "option":{"id":"$(is_pending)", "text": getMessageForKey("sdp.common.allpending")} },//No I18N
                     "$_completedstatus":{"fields": ["status"], "option":{"id":"$(is_completed)", "text": getMessageForKey("sdp.common.allcompleted")} }//No I18N
                },
                skipFieldTypeConditions : {
                    "status" : ["is_empty", "is_not_empty"] // No I18N
                },
                haveStrTypesUDF: false, //Moving over ID based model, this is can be made false.
                haveMultiString: true,
                changeURLData: requestListViews.changeURLData,
                setNullSiteDef:true,
                ignoreNoneFields:['site','template','status','requester','created_by'], //No I18N
                addNoneOption:requestListViews.addNoneOptionFn,
                enableDragHandle: true,
                innerCriteriaEnabled:true,
                maxinnerrows: 5
            };
            if(isMSPOrSCP){
                if(isMSP){
                    options.subFieldsArr.account=["name","country","city","doornumber","emailid","fax","weburl","postalcode","state","street","landline"]; //No I18N
                }else{
                    options.subFieldsArr.account = ["name","country","city","doornumber","emailid","fax","weburl","postalcode","state","street","landline","account_manager","industry","timezone","inactive"]; //No I18N
                    options.subFieldsArr.product = ["name","product_type","inactive"]; //No I18N
                    options.subUDFFields.account=["accountudf_fields"]; //No I18N
                    options.subUDFFields.product=["udf_fields"]; //No I18N
                }
            }
            if(sdp_user.ROLES.indexOf("SDAdmin") == -1 ){ //No I18N
                options.hideMarkPublic = true
            }
			options.serialize= function(data,type){
			if(data.field=="maintenance"){
				if(type=="get"){
					if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
					{
						data.condition="is not"; //NO I18N
						data.values=[null];
					}
					else
					{
						data.condition="is"; //NO I18N
						data.values=[null];
					}
				}
				else{
					if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
					{
						data.values=['false'];
					}
					else
					{
						data.condition="is"; //NO I18N
						data.values=['true'];
					}

				}
				return data;
			}
			else{
				return data;
			}
			}
            requestListViews.from != "cf_request" && viewFilterComponent.initComponent(options); //No I18N
        }

        jQuery("#load_export_dialog").off("click").on("click", function () { //No I18N
            exportListViews.render({
                title: getMessageForKey('sdp.requests.export.title'), //No I18N
                view_name: "RequestsView" //No I18N
            });
        })

        jQuery(document).off("click.exportlistview").on("click.exportlistview", "#export_requestlistview", function () { //No I18N
            var type = jQuery('input[name="export-format"]:checked').val();
            var list_info = table_comp_request.t_obj.table_info.list_info;
            delete list_info.has_more_rows;
            delete list_info.end_index;
            delete list_info.total_count;
            delete list_info.sort_valuepath;

            var options = {
                type: type,
                list_info: table_comp_request.t_obj.table_info.list_info,
                module: "requests" ,//No I18N
                //By default title of the export document is "Request"
                title: getMessageForKey('common.requests')//No I18N
            }
            //SD-113471 column order remains unchanged while exporting the request
            var getColumnOrder = function(column_order, fields_required){
                 column_order = column_order.filter(function(el){
                      return fields_required.hasOwnProperty(el);
                 })
                 return column_order
            }
            options.list_info.fields_required = getColumnOrder(table_comp_request.t_obj.table_info.column_order,table_comp_request.t_obj.table_info.fields_required);
    /**
             * If the listview is open from the popup,
             * then the export document title is set to timestamp.
             * else the default title "requests" will be present
             */
            try {
                if( typeof top.listview_popup !== undefined && top.listview_popup.title ) {
                    options.title = new Date().getTime().toString();
                }
            } catch (error) {}

            exportListViews.exportView(options);
        });


        jQuery(document).off('click.inlineaction', '.lv-inline-actions').on('click.inlineaction', '.lv-inline-actions', function(event) { //NO I18N
            var currentAction = jQuery(this).attr("data-lv-action");
            _self.listviewInlineAction(this, currentAction);
        });

        //List view technician timer edit
        jQuery(document).off('click.inlineaction', '.inline-timer').on('click.inlineaction', '.inline-timer', function (event) { //NO I18N
            var val = window.current_req_mode && window.current_req_mode == "classic" || window.current_req_mode == "combined" ? jQuery(this).closest(".cv-task-item").find("input[type='checkbox']").val() : jQuery(this).closest('tr.tc-row').attr("data-entityid"); //NO I18N
            var status = jQuery("#timericon-request" + val).attr("data-timer-status");
            if (status === "disable_timer") {
                return false;
            }
            $req.details.request_info.id = val;
            if (status == "no_timer" || status == "other_timer") {
                $req.details.operational_data.links = {
                    worklog_timer: { post: { href: "" } },
                    worklog: { post: {}}
                };
            }
            jQuery(".worklog-timer").addClass("hide");
            $req.header.openTimer(val, "worklog_timer_" + val); //No I18N

            $req.details.request_info.id = undefined;
            $req.details.operational_data.links.worklog_timer ?  $req.details.operational_data.links.worklog_timer = undefined: undefined;
            $req.details.operational_data.links.worklog ?  $req.details.operational_data.links.worklog = undefined: undefined;
            // Position the timer popup horizontally
            if (jQuery("body").css("direction").toLowerCase() == "rtl"){
                (jQuery('#timericon-request'+val).offset().left) < 400  ? jQuery('#timericon-request'+val).find('.worklog-timer').addClass('show-at-left') :jQuery('#timericon-request'+val).find('.worklog-timer').removeClass('show-at-left'); //No I18N
            }
            else{
                (jQuery(document).width()-jQuery('#timericon-request'+val).offset().left) < 400 ? jQuery('#timericon-request'+val).find('.worklog-timer').addClass('show-at-left') : jQuery('#timericon-request'+val).find('.worklog-timer').removeClass('show-at-left'); //No I18N
            }
            jQuery('#worklog_timer_'+val).find('textarea').trigger('focus');//No I18N
        });
    },
    changeURLData: function(field,url){ //Method to handle modifications in API URLs used in Custom filter component
        var  fieldData='';
        var fieldIncludesInactives=['category','subcategory','item','department','group','impact','level','mode','priority','urgency','closure_code','request_type','service_category','sla_violated_group','fr_sla_violated_group','sla','status','template','site']; //No I18N
        var fieldIncludesFor=['on_behalf_of','template','status','service_category','sla','requester']; //No I18N
        var data={};
        if(url){ //This section is for handling changes in URL of allowed values API
            if(fieldIncludesFor.includes(field)){
                data["for"]="advanced_search_filter"; //No I18N
            }
            if(fieldIncludesInactives.includes(field) || field.indexOf("udf_pick_") > -1){
                data["include_inactive_value"]=true; //No I18N
            }
            fieldData={"data":data}; //No I18N
            return fieldData;
        }
        else{ //This section is for handling changes in URL of Meta Info API
            if(field == "item" || field == "subcategory" || field == "category" || field == "site" || (isMSPOrSCP && field == "account")){
                fieldData={"data":{input_data:sdpToJSON( {"for":"advanced_search_filter"})}}; //No I18N
                return fieldData;
            }
        }
    },
    //Method to append 'None' to field value in criteria section, if allowed values is empty.
    addNoneOptionFn:  function(id){
        return [{"id": "$(none)", "text":translate("common.none")}]; //No I18N
    },
    initFilter: function () {
        var _self = this;
        var filterList_obj = new filterListComp();
        filterList_obj.initComponent({
            triggerElement: "#listview_btn", //No i18n
            element: "#ListViewFilterMenu", //No i18n
            module: _self.isUnified ? "activities": "request", //No i18n
            personalize_key: "request_filter_views", //No i18n
            filter_action: "requestListViews.renderListView", //No i18n
            managefilter_url: "/ListViewFilter.do?module=request&action=listview", //No i18n
            user_type: sdp_user.USERTYPE,
            favoritable: sdp_user.USERTYPE == "Technician" && window.current_req_mode != "combined", //No i18n
            hideFilterSearch: window.current_req_mode == "combined", //No i18n
            custom_filters: window.externalframe || sdp_user.USERTYPE !== "Technician" ? false : true // No I18N
        });
        if(jQuery(window).height() < 700) {
            !_self.isUnified && jQuery("#filtersortlist").css("height", "160px");   //No I18N
        }
    },
    applyFilter: function (search_criteria) {
        if(Object.keys(requestListViews.temp_list_info).length == 0){
            requestListViews.temp_list_info = jQuery.extend({},table_comp_request.t_obj.table_info.list_info);
        }
        /**
         * Handling the global filter with advance search cases
         * When Incident/Service filter is present and advance filter is applied we are converting the search_fields in to search criteria
         */
        var defaultCriteria = [];

        //TaskId:::  76925
        if(!jQuery.isEmptyObject(requestListViews.temp_list_info.search_criteria)){
            defaultCriteria=requestListViews.temp_list_info.search_criteria;
        }
        table_comp_request.t_obj.table_info.list_info.search_criteria = search_criteria.concat(defaultCriteria);
        table_comp_request.t_obj.table_info["for"] = "advanced_search_filter";//No I18N
        delete table_comp_request.t_obj.table_info.list_info.filter_by;
        table_comp_request.refreshTable("refresh"); //No I18N
        requestListViews.advSearchCriteria = search_criteria;
        requestListViews.toggleViewFilter(true);
    },
    cancelFilter: function(){
        table_comp_request.t_obj.table_info.list_info = requestListViews.temp_list_info;
        delete requestListViews.temp_list_info;
        delete table_comp_request.t_obj.table_info["for"];
        table_comp_request.refreshTable("refresh"); //No I18N
        requestListViews.advSearchCriteria = undefined;
        requestListViews.toggleViewFilter(false);
    },
    saveFilter: function (param) {
        // table_comp_request.t_obj.table_info.list_info = requestListViews.temp_list_info;
        var data = param.list_view_filter;
        requestListViews.renderListView(data.id, data.display_name);
        requestListViews.initFilter();
        // table_comp_request.t_obj.table_info.list_info.filter_by = requestListViews.filter = { id: data.id };
        // jQuery("#listview_btn div").text(data.name);
        // table_comp_request.refreshTable();
        // delete requestListViews.temp_list_info;
        requestListViews.advSearchCriteria = undefined;
        requestListViews.toggleViewFilter(false);
        // FIX for 102747
        try {
            delete  table_comp_request.t_obj.table_info.list_info.search_criteria;
            table_comp_request.changeFilterString("clearOnly"); //NO I18N
        } catch (error) {
        }
    },
    /**
     * rendering the list view based on the filter view
     * @param {String} viewname passing the viewname to api
     */
    renderListView: function (viewID, viewI18n) {
        var _self = this;
        //reseting searchObject when changing the view filter
        delete _self.searchObjects;
        delete _self.searchFormObj;
        viewID = decodeURIComponent(viewID);
        requestListViews.filter_by = _self.isUnified ? {name: viewID} : {id: viewID};
        var widthSet = _self.viewMode == "rq_leftpanel" ? 'style="max-width:110px"' : 'style="width: auto; max-width: 145px;"'; //No I18N
        // TODO need to handle later
        if(!viewI18n && requestListViews.filter_by.id){
            var disText = jQuery("#filtersortlist li").find("[data-id='"+viewID+"']").text();
            jQuery("#listview_btn").attr("title", e_attr(disText)).html('<span class="dd"><strong class="caret m0"></strong></span><div id="filter_name" class="fl text-overflow" ' + widthSet + ' >' + e_html(disText) + '</div>');
            _self.filter_i18n = disText;
        }else if(viewI18n){
            jQuery("#listview_btn div").text(viewI18n);
        } else {
            jQuery("#listview_btn").attr("title", viewDisplayName[viewID]);
            jQuery("#listview_btn").html('<span class="dd"><strong class="caret m0"></strong></span><div id="filter_name" class="fl text-overflow" ' + widthSet + ' >' + e_html(viewDisplayName[viewID]) + '</div>'); //No I18N
        }

        // viewName ? viewName = viewname : undefined;
        if (_self.isUnified) {
            table_combined_task.t_obj.table_info.list_info.filter_by = { "name": viewID}; //No i18n
            table_comp_request.t_obj.table_info.list_info.filter_by = {"name": viewID}; //No i18n
            table_combined_task.t_obj.table_info.list_info.start_index = 1;
            delete table_combined_task.t_obj.table_info.list_info.search_criteria;
            table_combined_task.refreshTable()
            var perObj = sdp_user.CLIENT_CONF.requestlistview//getPersonalizeData("requestlistview"); //No i18n
            perObj.combined ? perObj.combined.viewname =  sdp_user.CLIENT_CONF.requestlistview.combined.viewname = viewID: perObj.combined =  sdp_user.CLIENT_CONF.requestlistview.combined = {"viewname": viewID}; //No i18n
            addPersonalization("requestlistview", perObj); //No i18n

        } else if (_self.viewMode == "classic" || _self.viewMode == "table" || _self.viewMode == "rq_leftpanel") { //No i18n
            table_comp_request.t_obj.table_info.list_info.filter_by = {"id": viewID}; //No I18N
            table_comp_request.t_obj.table_info.list_info.start_index = 1;
            delete table_comp_request.t_obj.table_info.list_info.search_criteria;
            var perObj = sdp_user.CLIENT_CONF.requestlistview
            perObj ? perObj.filter_by = sdp_user.CLIENT_CONF.requestlistview.filter_by = viewID : perObj = { filter_by: viewID };
            if (perObj.global_view_name && perObj.global_view_name != "All_Requests" && perObj.global_view_name != "Requests") { //No I18N
                requests_table.search_criteria = [{"field":"is_service_request","value": perObj.global_view_name == "Service_Requests" ? true : false,"condition":"is","logical_operator":"and"}]; //No I18N
                table_comp_request.t_obj.table_info.list_info.search_criteria = requests_table.search_criteria;
            }
            addPersonalization("requestlistview",perObj);
            if (_self.previous_filter_state == "TRASH" || (isMSPOrSCP && sdp_feature_status.is_unapproved_requester_enabled && _self.previous_filter_state == "UNAPPROVED") ||  location.href.indexOf("SearchN") > -1) {
                _self.searchText = null;
                requestListViews.filter_i18n = undefined;
                requests_table.gsearch = null;
                sdpAjaxUrlHandler("/WOListView.do"); //No I18N
                return;
            }
            if (_self.viewMode == "table" || _self.viewMode == "classic" ) {
                var reExp1 = /[\?]([a-zA-Z0-9_\W]*)&/gm;
                var reExp2 = /[\&]([a-zA-Z0-9_\W]*)&/gm;
               /**
                * If the inline search have some value and then
                * the change the filter, we need to replace/add the viewID to the existing url
                * Refer: https://sdp-issues/TaskDefAction.do?submitaction=viewTask&TASKID=74975&from=QuickLink
        */
                var url = window.location.search.toString();
                if(!window.externalframe) {//skip url push state in external frame
                    if (url) {
                        var isafterQueMark = /[\?]viewID=/gm.test(url);
                        var newUrl = isafterQueMark ? url.replace(reExp1, "?viewID=" + viewID + "&") : url.replace(reExp2, "&viewID=" + viewID);
                        history.pushState("StateChange", viewID, "WOListView.do" + newUrl); //No I18N
                    } else {
                        history.pushState("StateChange", viewID, "WOListView.do?viewID=" + viewID + "&globalViewName=" + requestListData.global_view_name); //No I18N
                    }
                }
                // WOListActions.changeListView(viewname);
                // return;
            }
            if(_self.from && (_self.from=='link_request' || _self.from=='merge')){
                table_comp_request.t_obj.table_info=requests_table.inputDataModifier(table_comp_request.t_obj.table_info);
            }

            table_comp_request.refreshTable();
        }
        // TODO need to handle later
        else if (_self.viewMode == "kanban") {
            var perObj = sdp_user.CLIENT_CONF.requestlistview //No i18n
            perObj ? perObj.filter_by = sdp_user.CLIENT_CONF.requestlistview.filter_by = viewID : perObj.requestlistview = {filter_by: viewID};
            addPersonalization("requestlistview", perObj); //No i18n
            kanban_comp_request.k_obj.t_info.list_info.filter_by.id = viewID;
            kanban_comp_request.refreshKanbanList(true);
        }

        /** table component get total count reset on filter change if global config {SHOW_REQUEST_COUNT} is false*/
        if (_self.viewMode == "classic" || _self.viewMode == "combined") {
            var tbObj = _self.viewMode == "classic" ? table_comp_request : table_combined_task; //No I18N
            if (!tbObj.t_obj.options.get_total_count) {
                jQuery('.gettotalcount').removeClass('hide');
                jQuery('.displaytotel_count').removeClass('hide').addClass('hide');
            }
        }

        _self.previous_filter_state = requestListViews.filter_by.name && requestListViews.filter_by.name == "TRASH" ? "TRASH" : undefined;
        if(isMSPOrSCP && sdp_feature_status.is_unapproved_requester_enabled && _self.previous_filter_state == undefined && requestListViews.filter_by.name && requestListViews.filter_by.name == "UNAPPROVED") {
            _self.previous_filter_state = "UNAPPROVED"; //No I18N
        }
        _self.viewMode == "rq_leftpanel" && setTimeout(function () { $req.lpanel.selectItem(woID, jQuery('[data-entityid="' + woID + '"]'));}, 1000); //NO I18N
    },
    // /**
    //  * Check if its viewname is unified or normal request
    //  * @param {String} view_name passing the viewname
    //  */
    // checkIsUnified: function (view_name) {
    //     var unifiedFilter = ["my_pending", "my_group_pending", "my_pending_group_unassigned"]; //No i18n
    //     return unifiedFilter.indexOf(view_name) != -1 ? true : false;
    // },
    /**
     * Getting list for seleted value
     * @param {boolean} dataValues for returing object of row values (id and template values for bulk edit)
     */
    getSelectedRowValues: function (dataValues) {
        var rowValues = [];
        var tableObj = !this.isUnified ? table_comp_request : table_combined_task;
        if (dataValues) {
            var selectedChk = tableObj.bulkSelect.getSelectedIDs();
            for (var i = 0; i < selectedChk.length; i++){
                var rowId = selectedChk[i];
                var data = tableObj.bulkSelect.selectedRecords[rowId];
                //SD-111114: Appended site details to selected rows values.
                    var siteID='0'; //No i18N
                    if(this.viewMode == "combined"){
                        if(data.request.site!=null){
                            siteID=data.request.site.id;
                        }
                    }
                    else {
                        if(data.site!=null){
                            siteID=data.site.id;
                        }
                    }rowValues.push({
                    "id": rowId, //NO I18N
                        "tempid": this.viewMode == "combined" ? data.request.template.id : data.template.id, //No i18n
                        "site_id": siteID, //No i18N
                        "is_service_request":!!data.is_service_request // NO I18N
                });
            }
        } else {
                var techConflictRow = jQuery('#assign-tech-conflict table tbody input[type="checkbox"]:checked'); // NO I18N
                var rowValues = [];
                if( jQuery('#assign-tech-conflict table').is(':visible')  && techConflictRow.length>0){ // NO I18N
                    techConflictRow.each(function(index, element){
                        rowValues.push(element.value);
                    });
                }else{
            rowValues = tableObj.bulkSelect.getSelectedIDs();
        }
        }
        return rowValues;
    },
    //Request pickup
    pickUpRequests: function () {
        var rowValues = this.getSelectedRowValues();
        var failedReq = [];
        var _self = this;
        if (rowValues.length == 0) {
            alert(getMessageForKey("sdp.requests.listview.pickup.choose"));
            return false;
        }
        var failedReq = [];
        jQuery('.page-progressbar').show();
        setTimeout(function () {
            sdpAjax({
                //Bulk pickup using convenience operation
                url: "/api/v3/requests/_pickup?ids="+rowValues.toString(), //No I18N
                type: "PUT", //No I18N
                //data: sdpAjaxInputData({"request":{"technician":{"id":sdp_user.LOGGEDIN_USERID}}}), //No I18N
                async: false,
                ignorefailuremessage: true,
                success: function (resp) {
                    showalert("success", getMessageForKey("sdp.requests.viewrequest.pickupsuccessmsg"), "isAutoHide=true, delay=3"); //No I18N
                },
                error: function (resp) {
                    jQuery("#lc-pickup").prop("disabled",false); // No I18N
                    var resp = JSON.parse(resp.responseText);
                    failedReq = _self.handleBulkResponse(resp.response_status);
                }
            });
            failedReq.length > 0 && showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.pickup",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel")); //No I18N
            requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
            requestListViews.hideActionBar();
       },1);
    },
    assignRequests: function () {
        var rowValues = this.getSelectedRowValues();
        var _self = this;
        var failedReq = [];
        var technician = jQuery('#technician').val();
        jQuery('.page-progressbar').show();
        setTimeout(function () {
            sdpAjax({
                //Bulk assign using convenience operation
                url: "/api/v3/requests/_assign?ids=" + rowValues.toString(), //No I18N
                type: "PUT", //No I18N
                // SD-101471
                data: sdpAjaxInputData({ "request": {"technician": { "id": technician } } }), //No I18N
                async: false,
                ignorefailuremessage: true,
                success: function (resp) {
                    showalert("success", getMessageForKey("sdp.requests.viewrequest.assignsuccessmsg"), "isAutoHide=true, delay=3"); //No I18N
                },
                error: function (resp) {
                    var resp = JSON.parse(resp.responseText);
                    failedReq = _self.handleBulkResponse(resp.response_status);
                }
            });
            failedReq.length > 0 && showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.assign",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel")); //No I18N
            requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
            requestListViews.hideActionBar();
        }, 1);
    },
    closeRequests: function (closureInfo) {
        var rowValues = this.getSelectedRowValues();
        var _self = this;
        var failedReq = [];
        jQuery('.page-progressbar').show();
        setTimeout(function () {
            sdpAjax({
                url: "/api/v3/requests?ids=" + rowValues.toString(), //No I18N
                type: "PUT", //No I18N
                data: sdpAjaxInputData(closureInfo),
                async: false,
                ignorefailuremessage: true,
                success: function (resp) {
                    showalert("success", getMessageForKey("sdp.requests.viewrequest.closesuccessmsg"), "isAutoHide=true, delay=3"); //No I18N
                },
                error: function (resp) {
                    var resp = JSON.parse(resp.responseText);
                    failedReq = _self.handleBulkResponse(resp.response_status);
                }
            });
            failedReq.length > 0 && showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.close",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel")); //No I18N
            requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
            requestListViews.hideActionBar();
            closeDialog();
        }, 1);
    },
    /* Bulk edit (using the mickylite bulk edit )*/
    bulkEditRequests: function (el) {
        var hasSerReq = false;
        var rowValues = this.getSelectedRowValues(true);
        if (rowValues.length == 0) {
            alert(getMessageForKey("sdp.requests.listview.edit.choose")); //No I18N
            return false;
        }
        reqIDs = new Array();
        var hasServiceRequets=false;
        jQuery.each(rowValues, function (i, elm) {
            var reqID = rowValues[i].id;
            //SD-111114 : Changed the Template ID to Status ID
            var siteID = rowValues[i].site_id;
            if(rowValues[i].is_service_request){
                hasServiceRequets=true;
            }
            reqIDs.push(reqID + "--" + siteID); // No I18N
        });
        if(hasServiceRequets){
            alert(getMessageForKey("sdp.requests.servicerequests.editerror")); //No I18N
        }
        reqIDs.sort();
        var reqList = reqIDs.join(","); // No I18N
        NewWindow('BulkEditRequest.do?reqIDs=' + reqList + "&hasSerReq=" + encodeURIComponent(hasSerReq) + "&globalView=" + encodeURIComponent(globalViewName) + "&parentView=", 'BulkEdit', '875', '500', 'yes', 'center'); // No I18N
    },
    /**
     *  Bulk or single delete for request
     * @param {string} reqId used for deleting the individual id in the list view
    */
    bulkOrSingleDelete: function (reqId,isPermDelete) {
        var _self = this;
        var rowValues = this.getSelectedRowValues();
        _self.deleteRequests({reqId: reqId, reqList : rowValues.toString()}, function() {
            requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
        });
    },
    /* Method to make delete request(s) API call */
    deleteRequests: function(options, callback) {
        var _self = this;
        if(!options.reqId && !options.reqList) {
            alert(getMessageForKey("sdp.requests.listview.delete.choose")); //No I18N
            return false;
        }
        var failedReq = [];
        jQuery('.page-progressbar').show();
        setTimeout(function () {
            _self.sdpAjaxCall({
                type: "DELETE", //No I18N
                action: "_move_to_trash", //No I18N
                module: "requests", //No I18N
                Id: options.reqId ? options.reqId : options.reqList,
                bulk: !options.reqId ? true : false
            }, function (resp, stat) {
                if (!stat) {
                    showalert("success", getMessageForKey("sdp.requests.viewrequest.deletetotrashsuccessmsg"), "isAutoHide=true, delay=3") //No I18N
                    if(!!callback && typeof callback == 'function') {   //NO I18N
                        callback();
                    }
                } else {
                    if (options.reqId) {
                        showalert("failure", getMessageForKey("sdp.requests.viewrequest.deletefailuremsg"), "isAutoHide=true, delay=3") //No I18N
                        return;
                    }
                    var resp_text = JSON.parse(resp.responseText).response_status;
                    for (var i = 0; i < resp_text.length; i++) {
                        resp_text[i].status == 'failed' ? failedReq.push(resp_text[i].id) : undefined; //No I18N
                    }
                    showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.delete",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel"))    //NO I18N
                }
                requestListViews.hideActionBar();
            });
        },1);
    },
    /**
     * Deleting the request from the trash list view
     */
    deleteFromTrash:function(){
        var _self = this;
        var rowValues = this.getSelectedRowValues();
        var failedReq = [];
        if (rowValues.length == 0) {
            alert(getMessageForKey("sdp.requests.listview.delete.choose")); //No I18N
            return false;
        }
        if (confirm(getMessageForKey('sdp.requests.listview.delete.confirmdelete'))) {
            jQuery('.page-progressbar').show();
            _self.sdpAjaxCall({
                type: "DELETE", //No I18N
                url: "/api/v3/requests?ids="+ rowValues.toString(),//No I18N
                bulk: true
            }, function (resp,stat) {
                    if (!stat) {
                        showalert("success", getMessageForKey("sdp.requests.viewrequest.deletesuccessmsg"), "isAutoHide=true, delay=3") //No I18N
                    } else {
                        var resp_text = JSON.parse(resp.responseText).response_status;
                    for (var i = 0; i < resp_text.length; i++) {
                        resp_text[i].status == 'failed' ? failedReq.push(resp_text[i].id) : undefined; //No I18N
                    }
                    showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.delete",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel"))
                    }
            })
            table_comp_request.refreshTable("refresh"); //NO I18N
            requestListViews.hideActionBar();
        }
    },
    /**
     * Restore the trash request
     */
    restoreTrashRequest:function(){
        var _self = this;
        var rowValues = _self.getSelectedRowValues();
        var failedReq = [];
        if (rowValues.length == 0) {
            alert(getMessageForKey("sdp.requests.listview.restore.choose"));
            return false;
        }
        if (confirm(getMessageForKey('sdp.requests.listview.delete.confirmrestore'))) {
            jQuery('.page-progressbar').show();
            _self.sdpAjaxCall({
                type: "PUT", //No I18N
                action: "_restore_from_trash", //No I18N
                module: "requests", //No I18N
                Id: rowValues.toString(),
                bulk: true
            }, function (resp, stat) {
                if (!stat) {
                    showalert("success", getMessageForKey("sdp.requests.viewrequest.restoresuccessmsg"), "isAutoHide=true, delay=3") //No I18N
                } else {
                    var resp_text = JSON.parse(resp.responseText).response_status;
                    for (var i = 0; i < resp_text.length; i++) {
                        resp_text[i].status == 'failed' ? failedReq.push(resp_text[i].id) : undefined; //No I18N
                    }
                    showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("request.bulk.failed.restore",[failedReq.join("&#44 ")]) +', cancelbutton=' + getMessageForKey("sdp.common.cancel"))
                }
            });
            table_comp_request.refreshTable("refresh"); //NO I18N
            requestListViews.hideActionBar();
        }
    },
    /**
     * Linked to the request
     * @param {Boolean} isPopup purpose for showing where the comment we adding for linking requests
     * @param {String} from -> To check if its from details page
     * @param {Long} woID -> ID of the request from which it is invoked from details page
     */
    linkToRequest: function (isPopup,from,woID) {

        var ids = this.getSelectedRowValues();
        ids.sort(function(a, b){return a - b});
        var isDetailsPage=(from && from =="link_request")?true:false; //No I18N
        var initialValue=isDetailsPage?0:1;
        var parentId=isDetailsPage?woID:ids[0];

        if (!isDetailsPage && ids.length == 1) { //From details page even a single request can be linked to its parent.
            alert(getMessageForKey("sdp.requests.listview.link.requests.choose")); //No I18N
            return;
        }

                if(isMSP && !isDetailsPage)
                {
                    var validationUrl = "/servlet/MSPAjaxServlet?action=ValidateWOLink&parentId="+parentId; // No I18N
                    for (var i = initialValue; i < ids.length; i++) {
                        validationUrl += "&woID=" + ids[i]; // No I18N
                    }

                    var resJson = sdpAjax({
                        url: validationUrl,
                        ignorefailuremessage: true,
                        async: false
                    }).responseJSON;

                    var message = resJson.message;
                    if (message && message == "Cannot link across accounts") {// No I18N
                        alert(getMessageForKey("msp.request.merge.across.accounts"));
                        return false;
                    }
                }

        if (isPopup) {
            var html_src = $('wostolink@@@').innerHTML; // No I18N
            html_src = html_src.replace(/@@@/g, ''); //No I18N
            showDialog(html_src, "position=relative,width=400px, title=" + getMessageForKey("sdp.requests.viewrequest.linkrequests")); //No I18N
            jQuery("[sdpJs='js-event-WorkOrderListView-22']").off("click").on("click", function () { //No I18N
                jQuery("[sdpJs='js-event-WorkOrderListView-22']").prop("disabled",true); // No I18N
                return requestListViews.linkToRequest(false,requestListViews.from,top.woID);
            });
            jQuery("[sdpJs='js-event-WorkOrderListView-23']").off("click").on("click", function () { //No I18N
                closeDialog();
            });

            return;
        }
        var input_obj = {
            link_requests: []
        };
        var linkRequestComments = document.getElementById("linkRequestCommentid").value;
        for (var i = initialValue; i < ids.length; i++) {
            input_obj.link_requests.push({"linked_request": { //NO I18N
                    "id": ids[i] //No I18N
                },
                "comments": linkRequestComments, //No I18N
                "filter_by" : requestListViews.filter_by //No I18N
            })
        }
        jQuery('.page-progressbar').show();
        setTimeout(function () {
            sdpAjax({
                url: "/api/v3/requests/" + parentId + "/_link_requests", //NO I18N
                type: "POST", //NO I18N
                data: sdpAjaxInputData(input_obj),
                success: function (obj) {
                    var resp = obj.response_status;
                    if (resp.status != "Failed") {
                        showalert('success', resp.messages[0].message, "isAutoHide=true"); // No I18N
                    }
                    if(isDetailsPage){top.$req.details.updateRequestTemplates("link_requests");} //No I18N
                    closeDialog()
                    requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
                    requestListViews.hideActionBar();
                },
                error: function(){
                    jQuery("[sdpJs='js-event-WorkOrderListView-22']").prop("disabled",false); // No I18N
                }
            });
        },1);
    },
    /**
     * Mergin the request
     * @param {Boolean} isPopup showing the popup for choose the parent request
     */
    mergeRequest: function (isPopup) {
        var ids = this.getSelectedRowValues();

        //SD-93697 only allow 50 requests to merge
        if(ids.length > 50){
            alert(getMessageForKey("sdp.request.merge.excced"));
            return false;
        }
        if (isPopup) {
            if (ids.length == 1) {
                alert(getMessageForKey("sdp.requests.listview.merge.requests.choose"));
                return false;
            }
            var selectedWOs = "<option selected='selected' value='0'>-- " + getMessageForKey('sdp.requests.markdependson') + " --</option>"; // No I18N
            woURL = "/servlet/SDAjaxServlet?action=ValidateWOMerge"; // No I18N
            for (var i = 0; i < ids.length; i++) {
                woURL += "&woID=" + ids[i]; // No I18N
            }
            jQuery.ajax({
                url: woURL,
                success: function (response) {
                    var message = response.message;
                    if (message == "success") { //NO I18N
                        var woDetails = response.data;
                        jQuery.each(woDetails, function () {
                            id = this.id;
                            title = this.title;
                            isService = this.is_service_template;
                            if (isService) {
                                selectedWOs += "<option class='service' value='" + id + "'>" + id + " - " + e_html(title) + "</option>"; // No I18N
                            } else {
                                selectedWOs += "<option class='incident' value='" + id + "'>" + id + " - " + e_html(title) + "</option>"; // No I18N
                            }
                        });
                        jQuery('#Merge-select-list').children().remove();
                        jQuery('#Merge-select-list').append(selectedWOs);
                        showDialog(jQuery('#mergeConfirm').html(), 'title=' + getMessageForKey('sdp.requests.merge.title') + ',modal=yes,closeButton=yes,position=absmiddle,width=400'); // No I18N
                        jQuery('#_DIALOG_CONTENT #Merge-select-list').select2({
                            formatNoMatches: translate("common.no.match.found"), // No I18N
                            formatResult: formatMergeRequestList
                        });
                        jQuery("[sdpJs='js-event-WorkOrderListView-16']").off("click").on("click", function () { //No I18N
                            jQuery("[sdpJs='js-event-WorkOrderListView-16']").prop("disabled",true); // No I18N
                            requestListViews.mergeRequest();
                        })
                        jQuery("[sdpJs='js-event-WorkOrderListView-17']").off("click").on("click", function () { //No I18N
                            closeDialog();
                        })
                    } else if (message == "service template error") { // No I18N
                        alert(getMessageForKey('sdp.requests.merge.servicetemplate.error'));
                        return false;
                    } else if (message == "unauthorised access") {// No I18N
                        alert(getMessageForKey("sdp.requests.updaterequest.autherror"));
                        return false;
                    } else if (message == "invalid request") {// No I18N
                        alert(getMessageForKey());
                        return false;
                    } else if (isMSP && message == "Cannot merge across accounts") {// No I18N
                        alert(getMessageForKey("msp.request.merge.across.accounts"));
                        return false;
                    }
                }
            });
        } else {
            var parentVal = jQuery('#_DIALOG_CONTENT #Merge-select-list').val(); //NO I18N
            if (parentVal != 0) {
                var inputData = {
                    "merge_requests": [] //NO I18N
                }
                ids = ids.filter(function (id) {
                    return id != parentVal;
                })
                for (var i = 0; i < ids.length; i++) {
                    inputData.merge_requests.push({
                        "id": ids[i]
                    }); //NO I18N
                }
                inputData = sdpAjaxInputData(inputData);
                jQuery('.page-progressbar').show();
                setTimeout(function () {
                    requestListViews.sdpAjaxCall({
                        Id: parentVal,
                        type: "PUT", //NO I18N
                        module: "requests", //NO I18N
                        action: "_merge_requests", //NO I18N
                        data: inputData
                    }, function (resp, status) {
                        if (!status) {
                            var resp = resp.response_status;
                            showalert('success', resp.messages[0].message, "isAutoHide=true"); // No I18N
                            closeDialog();
                                requestListViews.viewMode == "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //NO I18N
                                requestListViews.hideActionBar();
                            }
                        if(status=="error"){
                            jQuery("[sdpJs='js-event-WorkOrderListView-16']").prop("disabled",false); // No I18N
                        }
                    })
                 },1);
            } else {
                alert(getMessageForKey("sdp.requests.merge.select.parent"));
                return false;
            }
        }
    },
    /**
     * Closing the request (used the request details page close popup concept)
     * @param {string} id  Request Id
     */
    closeRequest:function(id){
        /* Close request popup */
        woID = id;
        var statusId = 3;
        //getting status id from status API (Portal specfic status)
        statusId = this.getStatusID("requests"); //No i18n
        $req.details.resetProperties();
        $req.details.initialize(woID);
        $req.prop.fromListview = true;
        $req.prop.render();
        $req.prop.setRightPanelEdit('status'); //NO I18N
        $req.prop.wizard.statusChange(statusId, null ,event)//No i18n
    },
    /**
     * Closing the bulk request
     */
    bulkCloseRequest: function () {
        if(!requestListData.is_close_comment_mandatory){
            this.closeRequests({"request":{"status":{"id":closedStatusID}}}); // NO I18N
        }
        else{
        var ids = this.getSelectedRowValues();
        if (ids.length === 0) {
            alert(getMessageForKey('sdp.requests.listview.close.choose'));
            return false;
        }
        var selBox = $('woListBox@@@'); // No I18N
        selBox.options.length = 0;
        var idx = 0;
        for (i = 0; i < ids.length; i++) {
            var val = ids[i];
            selBox.options[idx] = new Option(val, val, true, true);
            //selBox.options[idx].selected =true;       // for IE
            idx++;
        }
        var html_src = $('wostoclose').innerHTML; // No I18N
        html_src = html_src.replace(/@@@/g, ''); // No I18N
        //alert(html_src);
        showDialog(html_src, "position=relative, title=" + getMessageForKey("sdp.requests.viewrequest.closerequest")); // No I18N
        jQuery("[sdpJs='js-event-WorkOrderListView-24']").off("click").on("click", function () { //No I18N
            hidePlaceHolderLabel('closeReqComment') ; //NO I18N
        });
        jQuery("[sdpJs='js-event-WorkOrderListView-25']").off("click").on("click", function () { //No I18N
            hidePlaceHolder();
        });
         jQuery("[sdpJs='js-event-WorkOrderListView-25']").on("blur", function () { //No I18N
            showPlaceholder(event.currentTarget.value);
        });
         jQuery("[sdpJs='js-event-WorkOrderListView-27']").off("click").on("click", function (event) { //No I18N
            WOListActions.submitCloseAccepted(event.currentTarget.form, 'reqOperation=Close&',event.currentTarget.dataset.statusChangeReason); //NO I18N
        });
         jQuery("[sdpJs='js-event-WorkOrderListView-28']").off("click").on("click", function (event) { //No I18N
            WOListActions.submitCloseAccepted(event.currentTarget.form, 'reqOperation=Close&'); //NO I18N
        });
         jQuery("[sdpJs='js-event-WorkOrderListView-29']").off("click").on("click", function () { //No I18N
            closeDialog();
        });
        }
    },
    /**
     * Closing the task
     * @param {string} id Task Id
     * @param {boolean} bulk to perform bulk opertaion
     */
    closeTask: function (id) {
        //Updating the task status to "Closed"
        //getting status id from status API (Portal specfic status)
        var status_id = this.getStatusID("tasks") //NO I18N
        var input_obj = { "task": { "status": { "id": status_id } } }; //NO I18N
        var dataVal = sdpAjaxInputData(input_obj);
            sdpAjax({
                url: "/api/v3/tasks/" + id, //NO I18N
                type: "PUT", //NO I18N
                data: dataVal,
                success: function (data) {
                    showalert('success', window.getMessageForKey("sdp.project.task.closemsg"), "isAutoHide=true"); // No I18N
                },
                async: false
            });
            //table component obj for unified activity(combined view) list refresh
            table_combined_task.refreshTable("refresh"); //NO I18N
    },
    /**
     *  Deleting the task
     * @param {string} id Task Id
     * @param {boolean} bulk to perform bulk opertaion
     */
    deleteTask: function (id, bulk) {
        if (confirm(getMessageForKey('sdp.task.delete'))) {
            if (bulk) {
                var failed = [];
                var selectedID = this.getSelectedRowValues();
                jQuery('.page-progressbar').show();
                var failedReq = [];
                setTimeout(function () {
                    /* eslint-disable no-loop-func */
                    for (var i = 0; i < selectedID.length; i++) {
                        var errHandler = function () {
                            failedReq.push(selectedID[i]);
                        }
                        sdpAjax({
                            url: "/api/v3/tasks/" + selectedID[i], //NO I18N
                            type: "DELETE", //NO I18N
                            async: false,
                            error: errHandler
                        });
                    }
                     /* eslint-enable no-loop-func */
                    failedReq.length > 0 ? showconfirm(true, 'title=' + getMessageForKey("sdp.common.failed") + ', message=' + getMessageForKey("task.bulk.failed.delete", [failedReq.join("&#44 ")]) + ', cancelbutton=' + getMessageForKey("sdp.common.cancel")) : failedReq.length == 0 && showalert("success",getMessageForKey("sdp.project.task.deletemsg"),"isAutoHide=true") //No I18N
                    requestListViews.hideActionBar();
                    setTimeout(function () {
                        table_combined_task.refreshTable("refresh"); //NO I18N
                    },1000);
                },1);
            } else {
                sdpAjax({
                    url: "/api/v3/tasks/" + id, //NO I18N
                    type: "DELETE", //NO I18N
                    success: function (obj) {
                        var resp = obj.response_status;
                        if (resp.status == "success") {
                            showalert('success', resp.messages[0].message, "isAutoHide=true"); // No I18N
                        } else {
                            showalert('success', resp.messages[0].message, "isAutoHide=true"); // No I18N
                        }
                    }
                });
                setTimeout(function () {
                    table_combined_task.refreshTable("refresh"); //NO I18N
                },1000);
            }
        }
    },
    /**
     * Toggling the check box to show hide actions
     * @param {elementSelector} elm row checkbox element
     */
    toggleCheckbox: function (elm) {
        var invalidSel = false,
            isUnified = this.isUnified,
            module = ""; //No I18N
        module = jQuery(elm).closest(".cv-task-item").attr("data-module"); //No I18N
        var tableObj = this.viewMode == "classic" || this.viewMode == "table" ? table_comp_request : table_combined_task;//No I18N
        var selectedIds = tableObj.bulkSelect.getSelectedIDs().length;
        if (elm.length != 0) {
            if (!module) {
                if (selectedIds > 0) {
                    switchAction("req", "task");
                    jQuery(".listcontrols").addClass("req-bulk").removeClass("req-default");
                    enableBtnsInBulkHeader();
                } else {
                    jQuery(".listcontrols").removeClass("req-bulk").addClass("req-default");
                    switchAction("req", "task");
                }
            } else {
                if (selectedIds > 0) {
                    module == "task" ? (jQuery("[data-module='request']").addClass("disable-row").find("input[type='checkbox']").prop('disabled', true), switchAction("task", "req")) : (jQuery("[data-module='task']").addClass("disable-row").find("input[type='checkbox']").prop('disabled', true), switchAction("req", "task")); //No I18N
                    jQuery(".listcontrols").addClass("req-bulk").removeClass("req-default");
                    enableBtnsInBulkHeader();
                } else {
                    jQuery(".cv-task-item").removeClass("disable-row").find("input[type='checkbox']").prop('disabled', false); //No I18N
                    switchAction(module == "task" ? "task" : "req", module == "task" ? "req" : "task"); //No I18N
                    jQuery(".listcontrols").removeClass("req-bulk").addClass("req-default");
                }
            }
            jQuery(elm).is(":checked") ? jQuery(elm).closest(".flipper").addClass("flip-active") : jQuery(elm).closest(".flipper").removeClass("flip-active"); //No I18N
            this.viewMode == "combined" ? table_combined_task.bulkSelect.selectedModule = module : "";//No I18N
            this.viewMode == "combined" && selectedIds == 0 ? tableObj.bulkSelect.selectedModule = "" : ""; // No I18N
        } else {
            selectedIds == 0 ? (jQuery(".listcontrols").removeClass("req-bulk").addClass("req-default"),jQuery(".cv-task-item").removeClass("disable-row").find("input[type='checkbox']").prop('disabled', false)) : ""; //No I18N
        }
        function switchAction(showEl, hideEl) {
            jQuery("." + hideEl + "-action").addClass("hide").removeClass("show");
            jQuery("." + showEl + "-action").addClass("show").removeClass("hide");
        }
        function enableBtnsInBulkHeader(){
            // The buttons in the listview(Pickup, Assign, Merge, Link, Close) need to be disabled to prevent multiple API calls from triggering.
            // The header will show/hide based on the class "req-bulk" and "req-default". So when the header is shown again, need to re-enable the buttons
            // Assign case will be handled in the SGT popup
            jQuery("#lc-pickup").prop("disabled",false); // Pickup Button in listview header  // No I18N
            jQuery("[name=CloseAccept]").prop("disabled",false); // Close Request button in the popup form listview header  // No I18N
            jQuery("[sdpJs='js-event-WorkOrderListView-16']").prop("disabled",false); // Merge Request button in the popup form listview header  // No I18N
            jQuery("[sdpJs='js-event-WorkOrderListView-22']").prop("disabled",false); // Link Request button in the popup form listview header // No I18N
        }
    },
    /* Refreshing the list view */
    changeRefreshFrequency: function () {
        var _self = this;
        var value = jQuery('input[name=Minutes]:checked').val(); //No I18N
        var tbObj = this.isUnified ? table_combined_task : table_comp_request
        tbObj.t_obj.table_info.refresh_time = value;
        tbObj.addPersonalizeData(tbObj.t_obj.table_info);
        _self.refreshInterval ? clearInterval(_self.refreshInterval) : "";
        if (value != 0) {
            _self.refreshInterval = setInterval(function () {
                tbObj.refreshTable("refresh"); //NO I18N
            }, value * 60 * 1000);
        }
        jQuery('input[name=Minutes]:checked').closest(".btn-group").removeClass("open"); //No I18N
    },
    /**
     * calling sdpajax funtion for handling unified activity(request and task) api calls (bulk and single)
     * @param {object} options options for sdpajx call perform
     * @param {function} callBackFun Callback function
     */
    sdpAjaxCall: function (options, callBackFun) {
        var type = options.type,
            url = "/api/v3/" + options.module + "/"; //No I18N
        if (options.Id && !options.bulk) {
            url += options.Id + "/" + options.action; //No I18N
        } else {
            url += options.action + "?ids=" + options.Id; //No I18N
        }
        options.url ? url = options.url : ""; //No I18N
        sdpAjax({
            url: url,
            type: type,
            async: false,
            ignorefailuremessage: options.bulk,
            data: options.data,
            success: function (resp) {
                typeof callBackFun == "function" ? callBackFun(resp) : undefined; //No I18N
                return;
            },
            error: function (resp, status) {
                typeof callBackFun == "function" ? callBackFun(resp, status) : undefined; //No I18N
                return;
            }
        });
    },
    /** Construct the search popup with meta data */
    constructSearchPop: function () {
        var _self = this;
        var formString = '<form class="form-wrapper" id="requests_searchForm" style="max-height:490px;overflow-y:auto;"></div><div class="form-footer"><button class="btn btn-primary k_searchBtn mr10" type="button">' + getMessageForKey("common.search.title") + '</button><button class="btn btn-default mr10" type="button"  data-event="click" nonce="'+sdpNonce+'"  data-handler="requestListViews.resetSearchForm()">' + getMessageForKey("sdp.common.reset") + '</button><button class="btn btn-default" type="button"  data-event="click" nonce="'+sdpNonce+'"  data-handler="closeDialog()">' + getMessageForKey("sdp.common.cancel") + '</button></form>'; // No I18N
        var meta_info = {};
        var meta = JSON.parse(JSON.stringify(table_comp_request.t_obj.meta_info));
        if(isMSPOrSCP && window.current_req_mode == "classic"){
            delete meta["accountcontract"];
            if(isMSP){
                delete meta["account"];
            }
        }
        var searchObj = _self.searchObjects;
        jQuery.each(meta, function (field, Obj) {
                meta_info[field] = Obj;
                if (_self.searchObjects) {
                    delete meta_info[field].default_value;
                    jQuery.each(searchObj, function (fld, obj) {
                        if (fld == field) {
                            if (fld == "group" && _self.searchFormObj) {
                                meta_info[field].default_value = _self.searchFormObj[field];
                            } else {
                                meta_info[field].default_value = obj;
                            }
                        }
                    });
                } else {
                    delete meta_info[field].default_value;
                }
                field == "subject" && delete meta_info[field].mandatory;//No I18N
                delete meta_info[field].changeCallBack;
        });
        showDialog(formString, "width=400,top=150,left=600, title=" + translate('common.search.list') + ",position=absolute", function () { //NO I18N
            $sdEventListener(jQuery("#_DIALOG_LAYER div.form-footer")); // No I18N
            var searchable_req_fields = []; // No I18N
            // var searchable_req_fields = ["subject", "priority", "status", "requester", "site", "group", "technician", "level", "mode", "category", "subcategory", "impact"]; // No I18N
            var searchable_comb_fields = ["priority", "status", "group", "technician"] //"created_time","due_by_time","scheduled_start_time","scheduled_end_time" // No I18N
            jQuery.each(meta_info, function (index,item) {
                if (item.type == "lookup" && !item.hasOwnProperty("read_only") || (item.display_type == "Pick List" || item.display_type == "Multi Line" || !item.display_type == "MultiSelect" || item.display_type == "Single Line" || item.type == "long" || item.type == "double")) {
                    item.display_type == "Multi Line" ? item.display_type = "Single Line" : undefined;//NO I18N
                    switch(index){
                        case "category": //NO I18N
                            item.criteriaCallback = categoryCallback;
                            break;
                        case "subcategory": //NO I18N
                            item.criteriaCallback = subcategoryCallback;
                            break;
                        case "item": //NO I18N
                            item.criteriaCallback = itemCallback;
                            break;
                        case "service_category": //NO I18N
                            item.listinfoCallback = serviceCatCallback;
                            break;
                        case "site": //NO I18N
                            item.changeCallBack   = siteChangeCallback;
                            break;
                        case "group": //NO I18N
                            item.criteriaCallback = groupCriteriaCallback;
                            item.changeCallBack   = groupchangeCallback;
                            item.formatResult     = groupFormatResult;
                            item.formatSelection  = groupFormatSelection;
                            break;
                        case "technician": //NO I18N
                            item.listinfoCallback = techCriteriaCallback;
                            item.formatResult     = technicianFormatResult;
                            item.formatSelection  = technicianFormatResult;
                            item.isTooltipEnabled = true;
                            break;
                    }
                    if (index.indexOf('udf_fields') == -1) {
                        searchable_req_fields.push(index);
                    }
                }
            })
            var searchFieldsArray = _self.viewMode == "classic" ? searchable_req_fields : searchable_comb_fields; // No I18N
            var search_form_fields = [];
            for (var i = 0; i < searchFieldsArray.length; i++) {
                var fieldMeta = jQ.extend({}, meta_info[searchFieldsArray[i]]);
                fieldMeta.name = searchFieldsArray[i];
                search_form_fields.push(fieldMeta);
            }
            var form_data = {},
                options = {},
                formObject = [{"sections": {"header": "","name": "requests-search-group","fields": [{"fields": search_form_fields }] }}]; // No I18N
            options.holderele = jQuery("#_DIALOG_LAYER").find("#requests_searchForm"); // No I18N
            options.layoutObj = formObject;
            options.metainfo = meta_info;
            options.skipInvalidValue = true;
            options.searchForm = true;
            options.formId = "requests_searchForm"; // No I18N
            _self.searchform = new FormComponent(options, form_data);
            // initialize the form validation
            var formValidate =requestListViews.searchform.initFormValidator(_self.searchform.options.formId, _self.searchform.validateRules, _self.searchform.validateMsg);
            jQuery("#_DIALOG_LAYER").find(".k_searchBtn").on("click", function () {
                if(formValidate.valid()){
                _self.searchListView();
                }else{
                    formValidate.focusInvalid();
                }
            });
        });

       /**
         * callback function when changing the category, subcategory, item to list the dependent data
        */
        // reset the subcatory and item when clicking the category
        function categoryCallback(searchText){
            jQuery('#' + _self.searchform.select2Objects.subcategory.select2Id).select2('val', '');// No I18N
            jQuery('#' + _self.searchform.select2Objects.item.select2Id).select2('val', '');// No I18N
            var criteria = [];
            if (searchText) {
                criteria.push({
                    "field": "name", // No I18N
                    "condition": 'like', // No I18N
                    "values": [searchText], // No I18N
                    "logical_operator": "and" // No I18N
                })
            }
            return criteria;
        }
         // search criteria for subcategory
        function subcategoryCallback(searchText) {
            var searchObj = _self.getSearchInputObject();
            jQuery('#' + _self.searchform.select2Objects.item.select2Id).select2('val', '');// No I18N
            var criteria = []
            if (!jQuery.isEmptyObject(searchObj) && searchObj.category) {
                criteria.push({
                    "field": "category", // No I18N
                    "value": { "id": searchObj.category.id }, // No I18N
                    "condition": "in" // No I18N
                });
            }
            if (searchText) {
                criteria.push({
                    "field": "name", // No I18N
                    "condition": 'like', // No I18N
                    "values": [searchText], // No I18N
                    "logical_operator": "and" // No I18N
                })
            }
            return criteria;
        }
         // search criteria for item
         function itemCallback(searchText) {
            var searchObj = _self.getSearchInputObject();
            var criteria = []
             if (!jQuery.isEmptyObject(searchObj) && searchObj.subcategory) {
                 criteria.push({
                     "field": "subcategory", // No I18N
                     "value": { "id": searchObj.subcategory.id }, // No I18N
                     "condition": "in" // No I18N
                 });
             }
             if (searchText) {
                criteria.push({
                    "field": "name", // No I18N
                    "condition": 'like', // No I18N
                    "values": [searchText], // No I18N
                    "logical_operator": "and" // No I18N
                })
            }
            return criteria;
        }
         //Search criteria for Service Category
         function serviceCatCallback(listinfo,searchText) {
             var listInfo = listinfo ? listinfo : {};
            if (requestListData && requestListData.global_view_name && requestListData.global_view_name != "All_Requests") {
                var filterBy = requestListData.global_view_name == "Incident_Requests" ? "hasIncidentTemplates" : "hasServiceTemplates"; //NO I18N
                listInfo.filter_by = { "name": filterBy }; //NO I18N
                listInfo.fields_required = ["id", "name"]; //NO I18N
            }
            if (searchText) {
                listInfo.search_criteria = {
                    "field": "name", // No I18N
                    "condition": 'like', // No I18N
                    "values": [searchText], // No I18N
                    "logical_operator": "and" // No I18N
                }
            }
            return listInfo;
        }

        function siteChangeCallback(){
            jQuery("#_DIALOG_LAYER").find("#select_group").select2("data","");   //No I18N
            jQuery("#_DIALOG_LAYER").find("#select_technician").select2("data","");   //No I18N
        }

        function groupCriteriaCallback(searchText){
            var childObj = "", criteria = "";   //No I18N
            var siteId = jQuery("#_DIALOG_LAYER").find("#select_site").val();   //No I18N
            if(siteId){
                var siteKey = "site.id";   //No I18N
                if(siteId == -1){
                    siteId = null;
                    siteKey = "site";   //No I18N
                }
                criteria = {"field" : siteKey , "condition" :"is" ,"value":siteId,"logical_operator" :"and"};   //No I18N
            }
            if(searchText){
                childObj = {"field" : "name" , "condition" :"contains" ,"value":searchText,"logical_operator" :"and"};   //No I18N
                if(criteria){
                    criteria.children = [childObj];
                }else{
                    criteria = childObj;
                }
            }
            return criteria;
        }

         function groupchangeCallback(){
            jQuery("#_DIALOG_LAYER").find("#select_technician").select2("data","");   //No I18N
        }
        function groupFormatResult(state) {
            if(isMSP && accid == "0"){
                return getAccountAppendedGroupNameForMSP(state);
            }
            return e_html(state.text) + ( state.site ? " (" + e_html(state.site.name) + ")" : "" );   //No I18N
        }
        function groupFormatSelection(state) {
            if (!jQuery.isEmptyObject(_self.searchFormObj) && _self.searchFormObj.group && state.text === _self.searchFormObj.group.text ) {
                state = _self.searchFormObj.group;
            }
            if(isMSP && accid == "0"){
                return getAccountAppendedGroupNameForMSP(state);
            }
            return e_html(state.text) + ( state.site ? " (" + e_html(state.site.name) + ")" : "" );   //No I18N
        }
        // method written for MSP/SCP
        function getAccountAppendedGroupNameForMSP(state){
            if(isMSP){
                var accountString = ( state.account ? " ("+ e_html(state.account.name) : "" ); //No I18N
                var siteString = ( state.site ? (accountString == "" ? " (" : " > ") + e_html(state.site.name) + ")" : "" ); //No I18N
                return e_html(state.text) + accountString + siteString;
            }
        }

        function techCriteriaCallback(crit, searchText){
            var childObj = "", criteria = "";
            if(jQuery("#_DIALOG_LAYER").find("#select_group").val()){   //No I18N
                criteria = {"field" : "support_group.id" , "condition" :"is" ,"value":jQuery("#_DIALOG_LAYER").find("#select_group").val(),"logical_operator" :"and"};   //No I18N
            }
            if(searchText){
                childObj = {"field" : "name" , "condition" :"contains" ,"value":searchText,"logical_operator" :"and"};   //No I18N
                if(criteria){
                    criteria.children = [childObj];
                }else{
                    criteria = childObj;
                }
            }
            var list_info ={};
            if(criteria){
                list_info.search_criteria = criteria
            }
            list_info.fields_required = ["id","name","email_id","employee_id","department"];   //No I18N
            return list_info;
        }

        function technicianFormatResult(user){
            var titleStr = e_attr('<div><b>'+getMessageForKey('sdp.common.name.is')+' : </b><span>'+e_attr(user.text)+'</span><br><b>'+getMessageForKey('sdp.common.email.is')+' : </b><span>'+(user.email_id ? e_attr(user.email_id) : "N/A" )+'</span><br><b>'+getMessageForKey('sdp.common.empid.is')+' : </b><span>'+(user.employee_id ? e_attr(user.employee_id) : 'N/A' )+'</span><br><b>'+getMessageForKey('sdp.common.dept.is')+' : </b><span>'+((user.department && user.department.name)? e_attr(user.department.name) + (user.department.site ? ", " + e_attr(user.department.site.name) : "" ) : 'N/A' )+'</span><br></div>'); // No I18N
            return '<div rel="uitip" mode_ellipsis="true" title="'+titleStr+'" data-allowhtml="true" data-default-tooltip="true">'+e_html(user.text)+'</div>';   //No I18N
        }
    },
    /** list view search action */
    searchListView: function () {
        var _self = this;
        _self.searchObjects = _self.getSearchInputObject();
        if(Object.keys(_self.searchObjects).length == 0){
            alert(getMessageForKey('request.searchfield.select'));
            return;
        }
        var tableComp = _self.viewMode == "classic" ? table_comp_request : table_combined_task; // No I18N
        tableComp.t_obj.table_info.list_info.start_index = 1;
        if (_self.viewMode == "combined") { // No I18N
            tableComp.t_obj.table_info.list_info.search_criteria = _self.populateSearhCriteria(_self.searchObjects);
            tableComp.t_obj.table_info.list_info.search_criteria.length == 0 ? delete tableComp.t_obj.table_info.list_info.search_criteria : undefined;
        } else {
            var searchObj = JSON.parse(JSON.stringify(_self.searchObjects));
            if (!jQ.isEmptyObject(searchObj)) {
                jQ.each(searchObj, function (field, valueObj) {
                    delete searchObj[field].text;
                    if (typeof valueObj == "object") { // No I18N
                        var fldKey = Object.keys(valueObj);
                        if(field.indexOf('udf') != -1){
                            searchObj[field] = valueObj[fldKey]
                        } else {
                            searchObj[field + "." + fldKey] = valueObj[fldKey];
                            delete searchObj[field];
                        }

                    }
                });
            }
            tableComp.t_obj.k_search_fields = searchObj;
            if(!jQuery.isEmptyObject(searchObj)){
                searchCriterias = requests_table.searchFieldsToCriteria(searchObj,tableComp);
                tableComp.t_obj.table_info.list_info.search_criteria = searchCriterias; //Remove
            }
        }
        // reset the no data string
        tableComp.t_obj.options.nodataString = tableComp.t_obj.options.nodataStringText;
        tableComp.refreshTable("search"); // No I18N
    },
    //TODO searchCriteria is supported need to use this function
    populateSearhCriteria:function(obj,isKeyPair) {
            var critieria = [];
            var i = 1;
            jQ.each(obj, function (field, valueObj) {
                if (field == "due_by_time" || field == "created_time" || field == "scheduled_start_time" || field == "scheduled_end_time") { // No I18N
                    // if (i == 1) {
                    // var dayStart = moment(parseInt(valueObj.value)).startOf("day").valueOf();
                    // var dayEnd = moment(parseInt(valueObj.value)).endOf("day").valueOf();
                    // if (field == "due_by_time" || field == "created_time") { // No I18N
                    //     critieria.push({"field": field, "values": [dayStart,dayEnd], "condition": "between","logical_operator": "and"});// No I18N
                    // } else if (field == "scheduled_start_time") { // No I18N
                    //     critieria.push({ "field": field, "value": dayStart, "condition": "gt" });// No I18N
                    // }else if (field == "scheduled_end_time") {// No I18N
                    //     critieria.push({ "field": field, "value": dayEnd, "condition": "lt" });// No I18N
                    // } else {
                    //     critieria.push({ "field": field, "value": valueObj.value, "condition": "in" });// No I18N
                    // }
                    // No I18N
                    //  critieria.push({ "field": field, "value": valueObj.value, "condition": "in" });// No I18N
                    //     // critieria.push({ "field": field, "value": valueObj.value, "condition": "in" });// No I18N
                    // } else {
                    //     critieria.push({ "field": field, "value": valueObj.value, "logical_operator": "and","condition": "in" });// No I18N
                    // }
                    // i++;
                    return;
                }
            if (isKeyPair) {
                var fldKey = field.split(".");
                fldKey.length > 1 && fldKey[1] != "name" ? fldKey[1] == "id" : ""; // No I18N
                fldKey.length == 1 ? fldKey.push("id") : ""; // No I18N
                if (i == 1) {
                    critieria.push({"field": fldKey[0],"value": JSON.parse('{"' + fldKey[1] + '":"' + valueObj + '"}'),"condition": "in"}); // No I18N
                } else {
                    critieria.push({"field": fldKey[0],"value": JSON.parse('{"' + fldKey[1] + '":"' + valueObj + '"}'),"logical_operator": "and","condition": "in"}); // No I18N
                }
            } else {
                var fldKey = Object.keys(valueObj);
                fldKey = fldKey[0];
                if (i == 1) {
                    critieria.push({"field": field,"value": JSON.parse('{"' + fldKey + '":' + valueObj[fldKey] + '}'),"condition": "in"}); // No I18N
                } else {
                    critieria.push({"field": field,"value": JSON.parse('{"' + fldKey + '":' + valueObj[fldKey] + '}'),"logical_operator": "and","condition": "in"}); // No I18N
                }
            }

                // critieria.push({ "field": field, "value": JSON.parse('{"' + fldKey + '":' + valueObj[fldKey] + '}'), "logical_operator": "and", "condition": "in" });
                i++;
            });
            return critieria;
    },
    /** maping the inputs objects for search the data */
    getSearchInputObject: function () {
        var _self = this;
        _self.searchFormObj = {};
        var formObject = {},
            FORM = jQ("#" + _self.searchform.options.formId);
        jQuery(FORM).find("[name]:visible,input[name*='date'],input[data-type='date'],input[data-type='datetime'],input[data-type='date-time']").each(function (index, ele) { // No I18N
            var eleName = ele.name;
            var elevalue = ele.value;
            var eleObj = "";
            var dtype = jQuery(ele).attr('data-type');
            if (elevalue != "") {
                if (dtype === "lookup" || dtype === "Pick List") {
                    var seleObj = jQuery(ele).select2('data'); // No I18N
                    _self.searchFormObj[eleName] = seleObj;
                    if (seleObj.length != 0 && (typeof seleObj == "object" && !jQuery.isEmptyObject(seleObj))) {
                        eleObj = {'id': seleObj.id, "text": seleObj.text }; // No I18N
                    }
                } else {
                    eleObj = elevalue;
                }
                formObject[eleName] = eleObj;
            }
        });
        return formObject;
    },
    /** reset the form inputs */
    resetSearchForm: function () {
        var _self = this;
        var tableComp = _self.viewMode == "classic" ? table_comp_request : table_combined_task; // No I18N
        jQuery(':input', '#requests_searchForm').not(':button').val(''); // No I18N
        jQuery.each(requestListViews.searchform.select2Objects, function (fields, Obj) {
            jQuery("#" + Obj.select2Id).select2("val", ""); // No I18N
        });
        _self.searchObjects && delete _self.searchObjects;
        _self.searchFormObj && delete _self.searchFormObj;
        delete tableComp.t_obj.table_info.list_info.search_criteria;
        tableComp.t_obj.options.nodataString = tableComp.t_obj.options.nodataStringHTML;
        tableComp.refreshTable("search"); //NO I18N
    },
    /**
     * function for hide list control actions for some action can be done
     */
    hideActionBar:function() {
        jQuery(".listcontrols").removeClass("req-bulk").addClass("req-default");
        jQuery('.page-progressbar').hide();
    },
    handleBulkResponse: function(resp) {
        var failed_request = [];
        for (var i = 0; i < resp.length; i++){
            resp[i].status != "success" ? failed_request.push(resp[i].id) : "";
        }
        return failed_request;
    },
    /**
     *
     * @param {*} module name of the module
     *  Getting Status Id from Status API
     */
    getStatusID: function (module) {
        var status,id=3;
        var inputData = sdpAjaxInputData({ "list_info": {"start_index":1,"search_criteria": { "field":"internal_name","value": "closed","condition":"eq" } } }); //NO I18N
        sdpAjax({
            url: "/api/v3/"+module+"/status", //NO I18N
            type: "GET", //NO I18N
            data: inputData,
            async: false,
            success: function (resp) {
                status = resp.status;
            }
        });
        if (status.length > 1) {
            for (var i=0; i < status.length; i++){
                if (status[i].internal_name === "Closed") {
                    id =  status[i].id;
                }
            }
        } else {
            id = status[0].id;
        }
        return id;
    },

    showRequestPreview: function(id, event) {
        var options = {
            rpanel: false,
            width: "70%"
        };
        this.kan_col_id = jQuery(event.target).closest('.sdp-kanban-list-ul').attr("data-columnid");    //NO I18N
        $ReqPreview.showRequestPreview(id, options, event);
    },

    updateKanbanRequest: function(requestId, columnId, field, kanban, callback) {
        $req.details.resetProperties();
        $req.details.initialize(requestId);
        $req.prop.fromListview = true;
        $req.prop.render();
        $req.prop.sectionalUpdateJson = {};
        $req.prop.checkRightPanel = true;
        // $req.prop.checkBulkEdit = true;
        $req.prop.sectionalEdit();

        /**
         * since FAFR events are bound to the elements only after 10 + 100 ms of the form rendering,
         * we have to set the value only after that.
         */
        setTimeout(function() {
            requestListViews.kanbanUpdateFn = null;
            for(var key in $req.prop.fafrKeyMapping) {
                if($req.prop.fafrKeyMapping[key].name === field) {
                    var didSet = $CS.setValue(key, columnId);
                    // If new technician doesn't belong to specific group, change group as null and try assigning the technician again
                    if(!didSet && key == "TECHNICIAN" && !!$CS.getValue("GROUP")) { //No I18N
                        var gSet = $CS.setValue("GROUP","0");   //No I18N
                        if(gSet) {
                            didSet = $CS.setValue(key, columnId);
                        }
                    }
                    if(!didSet) {
                        if(!!$req.details.request_info && !!$req.details.request_info.lifecycle && key == "STATUS") {
                            showalert("failure", getMessageForKey("request.kanban.updation.rlcerror", [$req.details.request_info.id]), "isAutoHide=true, delay=15"); //No I18N
                        } else {
                            showalert("failure", getMessageForKey("common.update.failed.message", [ kanban.k_obj.options.current_groupby.name ]), "isAutoHide=true, delay=15"); //No I18N
                        }
                        callback(false);
                        return;
                    }
                    $CS.element(key).trigger("change");    //No I18N
                    break;
                }
            }

            setTimeout(function() {
                /** restrict auto saving if the Request Close wizard is opened */
                if($req.prop.wizard.isEnabled) {
                    requestListViews.kanbanUpdateFn = callback;
                } else {
                    $req.prop.inlineSave(undefined, undefined, undefined, undefined, function() {
                        var is_updated = false;
                        if($req.prop.checkSubmitMsg === "success" || $req.prop.checkSubmitMsg === "warning") {
                            callback(true);
                        } else {
                            if($req.prop.wizard.isEnabled) {
                                requestListViews.kanbanUpdateFn = callback;
                            } else {
                                if(!jQuery("#alertbox").children().length) {    //No I18N
                                    showalert("failure", getMessageForKey("common.update.failed.message", [ kanban.k_obj.options.current_groupby.name ]), "isAutoHide=true, delay=15"); //No I18N
                                }
                                callback(false);
                                requestListViews.kanbanUpdateFn = null;
                            }
                        }
                    });
                }
            }, 100);
        }, 200);
    },

    /**
     * Opens the Request details view page in AJAX without reloading the entire window
     */
    openAjaxRequest: function(id) {
        $req.details.resetProperties();
        var _self = this;
        if(!window.close_dialog_container) {
            window.close_dialog_container = jQuery("#wo-details-form").html();
        }
        if(!_self.addIn){
        jQuery("#wo-details-form").children().remove();
        window.temp_current_req_mode = window.current_req_mode;
        window.current_req_mode = undefined;
        jQuery("#freeze-layer").removeClass("hide");
        }else{
            jQuery("#woform").addClass("hide");
        }
        //SD-125215: added classes overflow as auto to enable scroll for details page in external frames
        jQuery("#detailview").addClass('of-a').removeClass("hide").html('<div class="loading1" style="top: 49%;"><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div></div>');   //No I18N
        jQuery("#detailview").animate({right: "0%"}, 350, "swing", function() {   //No I18N
            if(_self.addIn){
                externalCallback("request_details",{id:id}) // No I18N
            }else{
                // change for when details page open from report page(listviewpopup) need to show the details page in preview
                _self.from === "report" && (window.print_mode =true); //No I18N
                var url = "/WorkOrder.do?woMode=viewWO&woID=" + id + "&externalframe=true&fromListView=true";  //No I18N
                if(window.externalframe && (_self.from == "dashboard" || _self.from == "admin" || _self.from == "merge" || _self.from == "link_request")) {
                    url += "&from="+_self.from; // NO I18N
                }
                if(isMSP)
                {
                    jQuery("#accountComboBoxId").remove();
                }
                jQuery("#detailview").load(url, function() {  //No I18N
                // window.history.pushState({'id': id, 'page': 'req_detailsview', 'from': 'req_listview'}, '...', 'WorkOrder.do?woMode=viewWO&woID=' + id);  //No I18N
                // $spa.historyRef.push("/WorkOrder.do?woMode=viewWO&woID=" + id); //No I18N
                    window.reqDetailsOnLoadHandler();
                    $req.prop.fromListview = false;
                 });
            }
        });
    },

    /**
     * Opens the New Request page in AJAX without reloading the entire window
     */
    openAjaxForm: function(woID) {
        var _self = this;
        if(!window.close_dialog_container) {
            window.close_dialog_container = jQuery("#wo-details-form").html();
        }
        jQuery("#detailview").addClass('hide');
        jQuery("#woform").removeClass("hide");
        jQuery("#detailview,#woform").children().remove();
        jQuery("#woform").html('<div class="loading1" style="top: 49%;"><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div></div>');   //No I18N
        jQuery("#woform").animate({right: "0%"}, 350, "swing", function() {   //No I18N
            jQuery(this).css("box-shadow", "none"); //No I18N
            jQuery("body").css("overflow", "auto"); //No I18N
            var header='<div class="p10">\
            <p class="text-overflow disp-ib font-xlarge vmiddle mb0" style="max-width:230px"><a nonce="' + sdpNonce + '" data-event="click" data-handler="$req.form.cancelForm();" rel="uitip" title="'+getMessageForKey("common.back.listview")+'" class="cur-ptr sdpIcon-leftarrow disp-ib vmiddle mb3"></a>'+(woID?getMessageForKey("sdp.requests.viewrequest.editrequest"):getMessageForKey("chat.create.request"))+'</p>\
              <div class="disp-ib fr pr5 ">\
                <span rel="uitip" title="'+getMessageForKey("request.addin.import_from_mail")+'" class="cur-ptr sdpIcon-mailFetch mr5"></span>\
                <span rel="uitip" title="'+getMessageForKey("sdp.common.reset")+'" class="cur-ptr sdpIcon-FormReset"></span>\
              </div>\
             </div><div id="req_form"></div>';
            jQuery("#woform").html(jQuery(header));
            $sdEventListener("#woform");//no i18n
            //jQuery("#listview").css({right: "100%"});
            var url ="/WorkOrder.do?externalframe=true"+(requestListData.addIn?"&service=OutlookAddIn":"")+(woID?"&woMode=editWO&woID="+woID:"&woMode=newWO");//no i18n
            if(window.isAddin){
                url+="&noheader=true";//no i18n
            }
            jQuery("#req_form").load(url);
        });

        /** preventing key shortcut 's' from opening the search dialog inside the Request Details page */
        // jQuery(document).off("keydown", _self.preventSearch).on("keydown", _self.preventSearch);    //No I18N
    },

    backToAjaxListview: function() {
        var _self = this;
        var id = $req.details && $req.details.request_info ? $req.details.request_info.id : undefined;
        var highlightRow = function(id, refresh) {
            var row;
            var highlight = function(row) {
                var el_bg_color = row.css('background-color');    //NO I18N
                row.animate({
                    backgroundColor: "#f0f5f9"  //NO I18N
                }, 500, function(){
                    row.animate({
                        backgroundColor: el_bg_color
                    }, 200);
                });
            }
            if(id) {
                row = jQuery("#requests_list_div input[name='request'][value='" + id + "']");
                if(row.length > 0) {
                    row = row.parents(".tc-row:first"); //No I18N
                }
            }
            if(!row || row.length === 0) {
                return;
            }
            if(refresh) {
                jQuery("#requests_kanban_div").animate({
                    scrollTop: ( row.offset().top - 60 )
                }, 300, function() {
                    highlight(row);
                });
            } else {
                highlight(row);
            }
        };
        jQuery("#detailview").animate({right: "-100%"}, 350, "swing", function() {    //No I18N
            jQuery("#freeze-layer").addClass("hide");
            jQuery("#detailview,#woform").addClass("hide"); //No I18N
            if($req.details.did_modify || _self.addIn) {
                table_comp_request.refreshTable("refresh"); //No I18N
                if(id) {
                    setTimeout(function() {
                        highlightRow(id, true);
                    }, 1000);
                    $req.details.did_modify = false;
                }
            } else {
                highlightRow(id);
            }
            $req.prop.fromListview = true;
            window.current_req_mode = window.temp_current_req_mode;
            window.req_details = undefined;
            jQuery("#wo-details-form").html(window.close_dialog_container);
            // jQuery(document).off("keydown", _self.preventSearch);   //No I18N
            jQuery("body").css("overflow", "hidden"); //No I18N
            jQuery("#detailview,#woform").children().remove();
        });
    },

    preventSearch: function(event) {
        if(event.keyCode == 83) {
            event.preventDefault();
        }
    },
    //Hiding the filter view button when applying the filter
    toggleViewFilter: function(toggle) {
        toggle ? jQuery("#ListViewFilterMenu").find("#listview_btn").hide().end().prev().hide() : jQuery("#ListViewFilterMenu").find("#listview_btn").show().end().prev().show(); //No I18N
    },
    listviewInlineAction: function(currentEle, currentAction){
        $req.details.allowedValues = {};
        var val = window.current_req_mode && window.current_req_mode == "classic" || window.current_req_mode == "combined" ? jQuery(currentEle).closest(".cv-task-item").find("input[type='checkbox']").val() : jQuery(currentEle).closest('tr.tc-row').attr("data-entityid"); //NO I18N
        if(currentAction === "technician"){
            var resetPopup = function(){
                var $technicianPopUp =  jQuery("#technicianPopUp"); // NO I18N
                $technicianPopUp.find('.form-group').addClass("hide"); // NO I18N
                jQuery("#assign-notes").addClass("hide");	//No I18N
                jQuery("#assign-notes").removeClass("disp-ib"); //No I18N
            };
            resetPopup();
        }
        $req.details.resetProperties();
        $req.details.initialize(val);
        $req.prop.fromListview = true;
        $req.prop.render();
        $req.rpanel.render();
        $req.prop.setRightPanelEdit(currentAction);
        if(currentAction === "technician" || currentAction === "category"){
            /* creating dialog box */
            var posId = false;
            isTechnician = currentAction === "technician"; //NO I18N
            var mainElement = isTechnician ? jQuery('#site-right-panel') : jQuery('#category-right-panel'); //No I18N
            if(isTechnician && (jQuery('#technician-right-panel').length && $req.prop.hideRightPanelFields.indexOf('TECHNICIAN') == -1) || (jQuery('#group-right-panel').length && $req.prop.hideRightPanelFields.indexOf('GROUP') == -1) || (mainElement.length && !mainElement.parent().hasClass('hide'))){
                posId = true;
            }else if(currentAction === "category"){ //No I18N
                if((jQuery('[data-name=category]').length  == 0) && (jQuery('[data-name=subcategory]').length  == 0) && (jQuery('[data-name=item]').length  == 0)){
                    showalert("warning", getMessageForKey("request.markCSI.fieldsdisabled.message"), "isAutoHide=true, delay=15"); //No I18N
                    return;
                }
                posId = true;
            }
            if(posId){
                var dialogSelctor = isTechnician ? "#technicianPopUp" : "#categoryPopUp"; //No I18N
                jQuery(dialogSelctor).dialog({
                    modal: true,
                    closeOnEscape: false,
                    open: function() {
                        jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
                            $req.prop.cancelRightPanelTechnician(isTechnician);
                            isTechnician && resetPopup();
                        });
                    },
                    width: 350,
                    title: function(){
                        var title = ""; //No I18N
                        if(currentAction === "category"){
                            var dialogTitle = jQuery(currentEle).attr("data-display-name"); //No I18N
                            title = dialogTitle ? dialogTitle : getMessageForKey("sdp.requests.common.category"); //No I18N
                        }else{
                            title = getMessageForKey("sdp.requests.viewrequest.assigntitle"); //No I18N
                        }
                        return "#" + val + " - " + title; //No I18N
                    }
                });
                window.current_req_mode && window.current_req_mode == "table" ? highLightRow(currentEle): undefined; //No I18N
            }else{
                if(isTechnician && jQuery('#technician-right-panel').length === 0 && jQuery('#group-right-panel').length === 0) {
                    showalert("warning", getMessageForKey("sdp.request.assignreq.fieldsdisabled.message"), "isAutoHide=true, delay=15"); //No I18N
                }else {
                    showalert("failure", getMessageForKey("request.field.rules.modify.error"), "isAutoHide=false"); //NO I18N
                }
            }
        }else{
            jQuery(".inline-"+currentAction).removeClass('hide');
            //jQuery(currentEle).addClass('hide'); //Commented for taskid: 78002
            jQuery('.inline-edit').addClass('hide');
            var viewFieldObj = jQuery(currentEle).next();
            viewFieldObj.removeClass('hide');
            viewFieldObj.html('');
            var actionFieldCloned = jQuery('#property-content [name='+currentAction+']').clone();
            actionFieldCloned.css({'width':'120px','position':'absolute'}); //NO I18N
            viewFieldObj.append(actionFieldCloned);
            viewFieldObj.find('[name='+currentAction+']').select2({
                formatNoMatches: translate("common.no.match.found"), //No I18N
                allowClear: true
            }).select2('open'); //NO I18N
            var button = '<div class="spot-actions fr"><button type="button" class="btn btn-sm btn-link" title="'+translate("common.cancel")+'" rel="uitip"  data-event="click" nonce="'+sdpNonce+'"  data-handler="'+(currentAction === "status" ? "WOListActions.closeStatusPopup(this);return false;" : "WOListActions.closePriorityPopup(this);return false;" )+'"> <span class="spot-icon failure icon-xs" role="img" aria-label="close"></span> </button> </div>'; 
            var ele = jQuery.parseHTML(button)[0];
            $sdEventListener(ele);
            viewFieldObj.append(ele);
            viewFieldObj.find('[name='+currentAction+']').on('change',function(e){
                var val = jQuery(this).val();
                if(currentAction === "status" && val!=$req.details.request_info.status.id){
                    var currentStatusId = $req.details.request_info.status.id;
                    if($req.details.request_info.cancel_requested && ($req.details.operational_data.close_status_id
    != currentStatusId && $req.details.operational_data.resolved_status_id
    != currentStatusId && $req.details.operational_data.closed_resolved_status.indexOf(currentStatusId) == -1) && ($req.details.operational_data.close_status_id
    == val || $req.details.operational_data.resolved_status_id
    == val || $req.details.operational_data.closed_resolved_status.indexOf(val) != -1)) {
                            if(!window.confirm(getMessageForKey("request.cancel.requested.status.change.warning"))) {
                                WOListActions.closeStatusPopup(this);
                                return false;
                            }
                        }
                        handleEdit(val)
                }else if(currentAction === "priority" && $req.details.request_info.priority == null || val!=$req.details.request_info.priority.id){ //No I18N
                    handleEdit(val);
                }
            });
            function handleEdit(val){
                //if  form was close,then we need to opening the form
                if(!jQuery('#property-content [name='+currentAction+']').length){
                    $req.prop.sectionalEdit();
                    $req.prop.sectionalCancel();
                }
                jQuery('#property-content [name='+currentAction+']').val(val).trigger('change');
            }
        }
    },
	openMaintenancePreview : function(id){
		$previewComponent.load('/ui/maintenances?mode=details&externalframe=true&id='+id,getMessageForKey("sdp.app.asset.details",[getMessageForKey("common.maintenance")]), "70%", parseInt(jQuery(window).height()) - 65, null, "maintenance-details-dialog", false,98); //NO I18N
    }
}

// Summmary call after the list view render
var summary_call = {
    sum_req: {},
    init: function () {
        var req_id = [];
        var html;
        // var $current_list = jQuery("#requests_div").find("input[type='checkbox']")
        var list_ids = table_comp_request.visibleContents;
        var filterId= table_comp_request.t_obj.table_info.list_info.filter_by;
        if (list_ids.length > 0) {
            for (var i = 0; i < list_ids.length; i++) {
                req_id.push(list_ids[i].id);
            }
            var input =  {"list_info": {"filter_by": filterId,"fields_required": ["task_pending_count","task_completed_count","task_total_count","my_task_pending_count","my_task_completed_count","has_pending_dependency"]}} // No I18N
            input = sdpAjaxInputData(input);
            sdpAjax({
                url: "/api/v3/requests/summary?ids=" + req_id.join(), // No I18N
                type: "GET", // No I18N
                data: input,
                success:function (resp) {
                    summary_data = resp.summary;
                    if (summary_data.length > 0) {
                        for (var i = 0; i < req_id.length; i++) {
                            if (summary_data[i].task_total_count > 0) {
                                var total_task = summary_data[i].task_total_count;
                                var comp_task = summary_data[i].task_completed_count;
                                var pen_task = summary_data[i].task_pending_count;
                                var my_pen_task = summary_data[i].my_task_pending_count;
                                var my_com_task = summary_data[i].my_task_completed_count;
                                var title = getMessageForKey("sdp.request.listview.tasks.total", [total_task]); // No I18N
                                var iconClass = "tc-task"; // No I18N
                                if (pen_task > 0) {
                                    title += "<br>" + getMessageForKey("sdp.request.listview.tasks.pending", [pen_task]); // No I18N
                                    iconClass = "tc-task-p"; // NO I18N
                                }
                                if (comp_task > 0) {
                                    title += "<br>" + getMessageForKey("sdp.request.listview.tasks.completed", [comp_task]); // No I18N
                                }
                                if (my_pen_task > 0) {
                                    title += "<br>" + getMessageForKey("sdp.request.listview.tasks.pendingowner", [my_pen_task]); //No I18N
                                    iconClass = "tc-task-p-t"; // NO I18N
                                }
                                if (my_com_task) {
                                    title += "<br>" +getMessageForKey("sdp.request.listview.tasks.completedowner", [my_com_task]); //No I18N
                                }
                                if (comp_task > 0 && pen_task == 0) {
                                    iconClass = "tc-task-c"; // NO I18N
                                }
                                html = '<a href="/" rel="uitip" mode_html="true" nonce="'+sdpNonce+'" data-event="click" data-handler="$tasks.loadTasks(\'unified\',\'request\','+req_id[i]+',null,null,null,null,null,null,{\'completed\':'+comp_task+',\'total\':'+total_task+'})" title="' + title + '"><span role="img" class="' + iconClass + '" aria-label="' + title + '"></span></a>'
                                jQuery("#req_task_" + req_id[i]).html(html);
                                $sdEventListener("#req_task_" + req_id[i]);
                                initTooltip("#requests_list_div"); // NO I18N
                            }else{
                                jQuery("#req_task_" + req_id[i]).find("span").removeClass().addClass("tc-task");
                            }
                        }
                        initTooltip("#requests_list_div"); // No I18N
                    }
                }
            })
            initTooltip("#requests_list_div"); // No I18N
        }
    }
}

// Export list view options with API implementation
var exportListViews = {
    context: {},
    exportModal: function() {
        this.context.formats = [{
            key: 'HTML',    //NO I18N
            name: getMessageForKey('ae.export.format.html'),   //NO I18N
            icon_class: 'attachment-sprite attach-ie',       //NO I18N
            checked: "checked"  //NO I18N
        }, {
            key: 'XLS', //NO I18N
            name: getMessageForKey('sdp.reports.customreport.xls'),    //NO I18N
            icon_class: 'attachment-sprite attach-xls',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'XLSX', //NO I18N
            name: getMessageForKey('reports.customreport.xlsx'),    //NO I18N
            icon_class: 'attachment-sprite attach-xls',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'PDF', //NO I18N
            name: getMessageForKey('sdp.reports.customreport.pdf'),    //NO I18N
            icon_class: 'attachment-sprite attach-pdf',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'CSV', //NO I18N
            name: getMessageForKey('sdp.reports.customreport.csv'),    //NO I18N
            icon_class: 'attachment-sprite attach-file', //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'DOC', //NO I18N
            name: getMessageForKey('reports.customreport.doc'),    //NO I18N
            icon_class: 'attachment-sprite attach-doc', //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'DOCX', //NO I18N
            name: getMessageForKey('reports.customreport.docx'),    //NO I18N
            icon_class: 'attachment-sprite attach-doc', //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'XML', //NO I18N
            name: getMessageForKey('reports.customreport.xml'),    //NO I18N
            icon_class: 'attachment-sprite attach-xml', //NO I18N
            checked: ""  //NO I18N
        }];
    },
    init: function (options, exportInfo) {
        this.exportModal();
        this.context.info = getMessageForKey('ae.mc.export.info.rowlimit');    //NO I18N
        var excludedCols = exportInfo.excluded_columns;
        if (excludedCols && excludedCols.length > 0) {
            var info;
            for (var i = 0; i < excludedCols.length; i++) {
                info = info ? info + ", " + excludedCols[i] : excludedCols[i];  //NO I18N
            }
            info = getMessageForKey('ae.mc.export.info.excludedcolumns', [info]);   //NO I18N
            this.context.info = this.context.info ? this.context.info + '<br>' + info : info;  //NO I18N
        }
    },
    /**
     *
     * @param {object} options render the export popup
     */
    render: function (options) {
        var _self = this;
        // TODO need to remove the component object later
        var totalRecords = table_comp_request.visibleContents.length || 0;
        if (totalRecords > 0) {
            jQuery.ajax('/servlet/AJaxServlet?action=getMickeyListExportInfo&viewName=' + options.view_name, {  //NO I18N
                method: 'GET'   //NO I18N
            }).done(function(exportInfo) {
                if (exportInfo.have_export_columns) {
                    _self.init(options, exportInfo);
                    if (!jQuery("#exportlistview").length) { //No I18N
                        jQuery('body').append("<div id='exportlistview'></div>"); //NO I18N
                    }
                    var dlgContent=renderhbs("", "request-export", _self.context, false, "requests", false, false, "",true);
                    jQuery("#exportlistview").html(dlgContent).dialog({ //No I18N
                        title: options.title,
                        width: 500,
                        close: function () {
                            jQuery(this).dialog("close").remove(); //NO I18N
                        }
                    })
                    jQuery("#export_requestlistview_cancel").off("click").on("click", function () { //No I18N
                        jQuery('#exportlistview').dialog('close'); //NO I18N
                    })
                } else {
                    showalert('info',getMessageForKey('ae.mc.export.invalidcolumns'), 'isAutoHide=true');   //NO I18N
                }
            });
        }
    },
    /**
     *
     * @param {object} options option for exporting the list view
     */
    exportView: function (options) {
        var list_info = jQuery.extend({}, options.list_info);
        var linkindex = list_info.fields_required.indexOf("edit"); // No I18N
            linkindex > -1 && list_info.fields_required.splice(linkindex, 1);
        var chkindex = list_info.fields_required.indexOf("requests_list_head_chk"); // No I18N
            chkindex > -1 && list_info.fields_required.splice(chkindex, 1);
        var taskindex = list_info.fields_required.indexOf("task"); // No I18N
            taskindex > -1 && list_info.fields_required.splice(taskindex, 1);
        var notesindex = list_info.fields_required.indexOf("has_notes"); // No I18N
            notesindex > -1 && list_info.fields_required.splice(notesindex, 1);
        var depindex = list_info.fields_required.indexOf("dependency_status"); // No I18N
            depindex > -1 && list_info.fields_required.splice(depindex, 1);
        var notifiindex = list_info.fields_required.indexOf("notification_status"); // No I18N
            notifiindex > -1 && list_info.fields_required.splice(notifiindex, 1);
        var techtimerindex = list_info.fields_required.indexOf("technician_timer"); // No I18N
            techtimerindex > -1 && list_info.fields_required.splice(techtimerindex, 1);
        var association_project_index = list_info.fields_required.indexOf("association_project"); // No I18N
            association_project_index > -1 && list_info.fields_required.splice(association_project_index, 1);
        var sla_index = list_info.fields_required.indexOf("sla"); // No I18N
            if(sla_index > -1 )
            {
                list_info.fields_required[sla_index]="is_overdue"; // No I18N
            }
        var input_data = {
            "export": { //No I18N
                "format": options.type, //No I18N
            },
            "list_info": list_info //No I18N
        }
        if(table_comp_request.t_obj.table_info["for"]){ //No I18N
           input_data["for"]= table_comp_request.t_obj.table_info["for"] //No I18N
        }
        if(options.title){
            input_data["export"]["title"] = options.title;
        }
        try {
            var link = document.createElement("a");
            var fileType = (isFileProtectionRequired && isFileProtectionRequired=="true")?"zip":options.type.toLowerCase();//No I18N
            link.download = (options.title ? options.title : Date.now()) + "."+fileType;
            link.href = "/api/v3/" + options.module + "/_export?" + sdpAjaxInputData(input_data);
            link.click();
            // window.location = "/api/v3/" + options.module + "/export?" + sdpAjaxInputData(input_data);
            jQuery('#exportlistview').dialog('close'); //No I18N
        } catch (e) {

        }
    }
}

//copy ticket list view init code start here 
copyTicketConfig.initCopyText('requestListTable',function(evt, holderData, callback) {//NO I18N
    var options = copyTicketConfig.getTemplateConfig('requests',{//NO I18N
        getData:getModuleData,
        holderData:holderData
    });

   if (callback) {
       callback(options);
   }
});
//copy ticket list view init code start end

