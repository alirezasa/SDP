/* $Id$ */
var $approvalsTable = {
    tableInstance : {},
    isPendingApprovalsView : true, //SD-113488 - To show Approval Action preview
    isModulePendingApprovalsView : false,
    approval_comment_config:null,
    /**
    * When show all from approvals widget is clicked, first point of reach for approval list view
    */
    loadApprovalsListView: function(){
        jQuery(document).ready(function () {
            /*To destroy previous instance of tablecomponent*/
            if($approvalsTable && $approvalsTable.tableInstance && !jQuery.isEmptyObject($approvalsTable.tableInstance)){
                $approvalsTable.tableInstance.destroy();
            }
            if($approvalsTable.from_filter != "null"){
                $approvalsTable.updateHeaderName($approvalsTable.from_filter);
            }
            $approvalsTable.eventBindings();
            $approvalsTable.render();
        });
    },

    render: function () {
        var componentName = "webc-approvalsList" ; // No I18N
        var doRender = !WebComponents.instancePool[componentName] || (WebComponents.instancePool[componentName] && !jQuery("#" + WebComponents.instancePool[componentName].t_obj.options.tableHolder + "_div").length); // No I18N
        if (doRender) {
            delete WebComponents.instancePool[componentName];
            WebComponents.render(componentName);
        }
        $approvalsTable.tableInstance = WebComponents.getInstance(componentName) ;
        initTooltip("#ListViewFilterButton"); // No I18N
        $approvalsTable.applyStoredFilterView();
    },

    //This method is used to show the take action button when approvals are selected from the module pending approvals list view through check boxes
    eventBindings: function () {
        jQuery("#approval_list_container").off('change.approvalSelectEvent').on('change.approvalSelectEvent', "table tr input[type='checkbox']", function() {
            var isSelected = ($approvalsTable.tableInstance.bulkSelect.selectedRecordsCount > 0);
            (isSelected) ? jQuery("#approvals_action_panel").removeClass('hide') : jQuery("#approvals_action_panel").addClass('hide');
        });
        jQuery("#bulk_unselect_approvals").off('click.approvalSelectEvent').on('click.approvalSelectEvent', function() {  // No I18N
            jQuery("#approvals_action_panel").addClass('hide');
        });
    },

    //This method is used to modify the filter name in the header
    updateHeaderName: function (module) {
        var filterTitle = $approvalsTable.getFilterInfoForModule($approvalsTable.from_filter, false);
        jQuery('#listview_btn').find('.text-overflow').text(filterTitle);
        jQuery("#listview_btn").attr('title', filterTitle);
    },

    row_inputdata: function (table_info) {
        var _self = this;
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        var fields_required_arr = Object.keys(table_info.fields_required);
        fields_required_arr.push("approval.notification_details", "approval_level.change.created_time", "approval_level.request.created_time", "approval_level.release.created_time", "approval_level.purchase_request.created_date", "approval_level.purchase_order.created_date"); // No I18N
        var iconIndex = fields_required_arr.indexOf("approval_icon"); // No I18N
        iconIndex > -1 && fields_required_arr.splice(iconIndex, 1);
        table_info.list_info.fields_required = fields_required_arr;
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
        inputObject.fields_required = fields_required_arr;
        return inputObject;
    },

    //Checkbox construction for bulk approvals action in only module pending approvals list view
    constructCheckboxCell : function(td,comp){
        var rd = td.row_data;
        if($approvalsTable.isModulePendingApprovalsView){
            jQuery("#approvals_head_chk").removeClass('hide');
            return '<span class="fl ml5"><input type="checkbox" aria-label="Checkbox" value="'+rd.id+'" data-id=approvals_'+rd.id+'_head_chk" data-table-checkbox></span>';
        }else{
            jQuery("#approvals_head_chk").addClass('hide');
            return '<span class="fl ml5 opac5"></span>';
        }
    },

    constructRequesterName : function (table_data) {
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var requesterJSON = {} ;
        // As each module has different path name , having multiple if checks.

        switch (associated_entity){
            case "purchase_request":  //NO I18N
                requesterJSON = row_data.approval_level[associated_entity].requested_by;
                break;

            case "change":  //NO I18N
                requesterJSON = row_data.approval_level[associated_entity].change_requester ;
                break;

            case "request": //NO I18N
                requesterJSON = row_data.approval_level[associated_entity].requester;
                break ;

            case "release":  //NO I18N
                requesterJSON = row_data.approval_level[associated_entity].release_requester ;
                break;

            case "purchase_order": //NO I18N
                requesterJSON = row_data.approval_level[associated_entity].requested_by;
        }

        return ( (requesterJSON!=null) ?  '<div>'+e_html(requesterJSON.name) +'</div>' : "-" ) ;
    },

    constructPriority : function(table_data) {
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var priority = {};
        var col_str = '-'; // No I18N
        if(associated_entity == "purchase_order"){
            return col_str ;
        }
        priority = row_data.approval_level[associated_entity].priority ;
        if(priority!=null){
            col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" rel="uitip" title="'+ e_attr(priority.name) +'" style="background:'+e_attr(priority.color)+'"></span><span class="vmiddle">'+ e_html(priority.name)+'</span></div>';// No I18N
        }
        return col_str ;
     },

    constructDescription : function(table_data) {
        var row_data = table_data.row_data ;
        var desc = row_data.description ;
        return ((desc && desc!=null) ? '<span rel="uitip" title="'+ e_attr(desc) +'">'+e_html(desc) +'</span>' : "-");// No I18N
    },

    constructLogo : function(table_data) {
        var row_data = table_data.row_data ;
        var action_status = row_data.status.name ;
        var col_str,status_preview_title ;
        if(action_status === "Pending Approval") {
            status_preview_title = translate("sdp.purchase.status.pendingapproval") ;
            col_str = '<div class="d_w tc"><img class="APPR_1" rel="uitip" src="/images/spacer.gif" title="'+status_preview_title+'"> </div>' ;
        }
        else if(action_status === "Approved") {
            status_preview_title = translate("sdp.common.status.approved") ;
            col_str = '<div class="d_w tc"><img class="APPR_2" rel="uitip" src="/images/spacer.gif" title="'+status_preview_title+'"></div>' ;
        }
        else if(action_status === "Denied") {
            status_preview_title = translate("sdp.purchase.status.rejected") ;
            col_str = '<div class="d_w tc"><img class="APPR_3" rel="uitip" src="/images/spacer.gif" title="'+status_preview_title+'"> </div>' ;
        }
        else if(action_status === "Pending Clarification") {
            status_preview_title = translate("sdp.approve.needclarification") ;
            col_str = '<div class="d_w tc"><img class="cspr icon-sm nmi-replied" rel="uitip" src="/images/spacer.gif" title="'+status_preview_title+'"> </div>' ;
        }
        return col_str ;
    },

    constructActionsStatus : function(table_data) {
        var row_data = table_data.row_data ;
        var action_status = row_data.status.name ;
        if(action_status === "Denied")
        {
            action_status = translate("sdp.purchase.status.rejected") ;  // No I18N
        }
        else if(action_status === "Pending Clarification")
        {
            action_status = translate("sdp.approve.needclarification"); // No I18N
        }
        else if(action_status === "Pending Approval")
        {
            action_status = translate("sdp.purchase.status.pendingapproval") ; //No I18N
        }
        else{
            action_status = translate("sdp.common.status.approved") ; //No I18N
        }

        return '<div>'+action_status +'</div>';

    },
    constructModuleID : function(table_data) {
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var moduleId = row_data.approval_level[associated_entity].id ;
        if(associated_entity == "purchase_order"){
            moduleId = row_data.approval_level[associated_entity].custom_po_id;
        }
        return $approvalsTable.constructApprovalPreview(table_data, moduleId);
    },

    //SD-113488 - To show Approval Action preview
    constructModuleTitle : function(table_data) {
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var moduleTitle =  row_data.approval_level[associated_entity].title;
        switch (associated_entity){
            case "request": //NO I18N
                moduleTitle = row_data.approval_level[associated_entity].subject;
                break ;
            case "purchase_order": //NO I18N
                moduleTitle = row_data.approval_level[associated_entity].name;
        }
        return $approvalsTable.constructApprovalPreview(table_data, moduleTitle);
    },
    constructModuleName : function(table_data) {
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var moduleName;

        switch (associated_entity){
            case "purchase_request":  //NO I18N
                moduleName = translate("sdp.purchase.request");// No I18N
                break ;

            case "change":  //NO I18N
                moduleName = translate("common.change");// No I18N
                break;

            case "request": //NO I18N
                moduleName = translate("common.request");// No I18N
                break ;

            case "release":  //NO I18N
                moduleName = translate("common.release");// No I18N
                break;

            case "purchase_order": //NO I18N
                moduleName = translate("common.newpo");// No I18N
        }
        return '<div rel="uitip" title="'+moduleName +'">'+moduleName +'</div>';

    },


    callbackInitialRender : function(viewMode) {
        if(!$approvalsTable.filterList_obj){
            $approvalsTable.filterList_obj = new filterListComp();
        }
    },

    filterDropdownClick : function (){
        $approvalsTable.filterList_obj.initComponent({
            element : "#ListViewFilterMenu",  // No I18N
            module : "all_modules_approval",  // No I18N
            personalize_key : "approvals_filter_views",// No I18N
            filter_action : "$approvalsTable.switchFilterView", //No I18N
            isTrashEnabled: false,
            favoritable : false,
            custom_filters : false,
            skipPersonalization : true,
            hideFilterSearch : true
        });
    },

    switchFilterView : function(viewId,viewName){
        $approvalsTable.tableInstance.t_obj.table_info.list_info.filter_by = { "id": viewId}; //No i18n
        $approvalsTable.tableInstance.t_obj.table_info.list_info.start_index = 1;
        jQuery("#approvals_action_panel").addClass('hide');
        $approvalsTable.modulePendingApprovalFilters = ["my_request_pending_approvals", "my_change_pending_approvals", "my_release_pending_approvals", "my_purchase_pending_approvals"]; // NO I18N
        sdpAjax({
            url: '/api/v3/list_view_filters/'+viewId, // No I18N
            success: function(resp) {
                var url = "/ui/approvals?mode=get" + (window.location.href.includes("externalframe=true") ? "&externalframe=true" : "") + (window.location.href.includes("noheader=true") ? "&noheader=true" : ""); //NO I18N
                if(resp.list_view_filter.name == "my_pending_approvals"){
                    $approvalsTable.isPendingApprovalsView = true;
                    $approvalsTable.isModulePendingApprovalsView = false;
                    if(window.location.pathname==='/ui/home' && jQuery(".approvals-tab").length>0) {
                        jQuery(".approvals-tab.active a").trigger("click");
                        return;
                    }
                    window.location.href = url;
                }else if($approvalsTable.modulePendingApprovalFilters.includes(resp.list_view_filter.name)){
                    $approvalsTable.isPendingApprovalsView = false;
                    $approvalsTable.isModulePendingApprovalsView = true;
                    var from_filter_value = resp.list_view_filter.name.split('_')[1];
                    if(window.location.pathname==='/ui/home' && jQuery(".approvals-tab").length>0) {
                        $home_page.approvalTabURL = $home_page.allowedTabs.approval.url+"&from_filter="+from_filter_value; //NO I18N
                        jQuery(".approvals-tab.active a").trigger("click");
                        return;
                    }
                    window.location.href = url + '&from_filter=' + from_filter_value;
                }else{
                    if($approvalsTable.isModulePendingApprovalsView){
                        var json = `filter_view_id=${viewId}&filter_view_name=${viewName}`;
                        localStorage.setItem('filterSwitch', json); //No I18N                        
                        if(window.location.pathname==='/ui/home' && jQuery(".approvals-tab").length>0) {
                            jQuery(".approvals-tab.active a").trigger("click");
                            return;
                        }
                        window.location.href = url;
                    } else {
                        $approvalsTable.isPendingApprovalsView = false;
                        $approvalsTable.isModulePendingApprovalsView = false;
                        $approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
                        jQuery('#approvals-filters').text(viewName); // No I18N
                        jQuery('#listview_btn').attr("title",viewName);// No I18N
                    }
                }
            },
            async: false
        });
    },

    applyStoredFilterView : function(){
        if (localStorage.getItem('filterSwitch') != null) {
            var storedJson = localStorage.getItem('filterSwitch'); //No I18N
            var params = storedJson.split('&').reduce(function (result, param) {
                var parts = param.split('=');
                result[parts[0]] = parts[1];
                return result;
            }, {});
            localStorage.removeItem('filterSwitch'); //No I18N
            $approvalsTable.switchFilterView(params.filter_view_id, params.filter_view_name);
        }
    },

    /**
     * SD-112710 - Module id search fix - Searching multiple fields is not working with search_fields. Hence, search fields is converted into search_criteria.
     * Inline search Call back function to handle a api call - Every time api call happened via search box this function will be triggered */
    callbackSearchFunction : function(){

        var _self = this;
        var search_criteria = [];

        //search_fields to search_criteria conversion
        var search_fields  = $approvalsTable.tableInstance.t_obj.table_info.list_info.search_fields;
        var module_id_search = false;
        var module_id = null;

        jQuery.each(search_fields,function(key,value){
            var condition = "contains"; // No I18N
            if(key === 'moduleId'){ // No I18N
                module_id_search = true;
                module_id = value;
                return true;
            }
            search_criteria.push({
                "field" : key, // No I18N
                "value" : value, // No I18N
                "condition" : condition, // No I18N
                "logical_operator" : "AND" // No I18N
            });
        });

        if(module_id != null && module_id.length > 19){
            showalert('failure', translate("apicodes.4001"), 'isAutoHide=true'); //NO I18N
            return;
        }

        var module_criteria = [];
        if(module_id_search){
            var modules = ['request', 'change', 'release', 'purchase_request', 'purchase_order']; // No I18N
            jQuery.each(modules,function(key,value){
                var condition = "is"; // No I18N
                module_criteria.push({
                    "field" : "approval_level." + value + ".id", // No I18N
                    "value" : module_id, // No I18N
                    "condition" : condition, // No I18N
                    "logical_operator" : (value == 'request') ? "AND" : "OR" // No I18N
                });
            });
        }
        if(search_criteria.length == 0){
            search_criteria = module_criteria;
        } else if(module_id_search){
            search_criteria[0].children = module_criteria;
        }
        //Deleting search_fields to prevent issues from tableComponent side.
        delete _self.tableInstance.t_obj.table_info.list_info.search_fields;
        $approvalsTable.tableInstance.t_obj.table_info.list_info.search_criteria = search_criteria;
        //Refreshing table component to reflect new data.
        $approvalsTable.tableInstance.refreshTable("refresh"); //NO I18N

    },

    setHeight : function(){
        var height;
        var listview_height = 128;

        var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
        return height-15;
    },
    setWidth : function(){
        var width = jQuery("#listview").width(); // No I18N
        return width;
    },
    //SD-113488 - To show Approval Action preview
    constructSubject : function(table_data){
        var row_data = table_data.row_data ;
        var subject = row_data.title ? row_data.title : '-';
        return $approvalsTable.constructApprovalPreview(table_data, subject);
    },
    constructApprovalPreview : function(table_data, column_data){
        var row_data = table_data.row_data ;
        var associated_entity = row_data.associated_entity ;
        var action_status = row_data.status.name ;
        var approval_id = row_data.id ;
        var level_id = row_data.approval_level.id;
        var portal_id = row_data.portal_id;
        var entity_id = row_data.approval_level[associated_entity].id;
        var stage_id = (associated_entity == "change" ? row_data.approval_level.change_stage.id : null); // No I18N
        var from = $approvalsTable.isPendingApprovalsView ? "pendingApprovalsList":"approvalsList"; // No I18N

        var approvals_info = headerApprovals.getApprovalsUrlTitle(associated_entity,approval_id,level_id,portal_id,entity_id,stage_id,from,action_status);
        var unique_id = 'approval_' + approval_id + '_' + entity_id; // No I18N
        var click_event;
        if ($approvalsTable.isModulePendingApprovalsView) {
            click_event = '$header.openApprovalNotifications(false,\''+associated_entity+'\','+entity_id+','+level_id+','+approval_id+','+stage_id+','+portal_id+','+'true);'; //No I18N
        } else {
            click_event = '$previewComponent.load(\''+approvals_info.approval_page_url+'\',\''+translate(approvals_info.module_preview_title)+'\',\'60%\',\'\',\'\',\'module_preview\',\'\',\'\',\'scrolling:no'+((associated_entity == "request" && $approvalsTable.isPendingApprovalsView) ? ',closecallback:$approvalsTable.reloadList':'')+'\');' //NO I18N
        }
        var col_str = '<a href="/" rel="uitip" id="approval_title_tag" title="'+ e_attr(column_data) +'" data-event="click" data-handler="'+ click_event+'" nonce="'+sdpNonce+'"><span>'+e_html(column_data) +'</span></a>';
        return col_str;
    },
    reloadList: function(){
        if(window.location.pathname === "/ui/approvals" || window.location.pathname === "/ui/home"){
            $extFrame.getActiveWindow().$approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
        }
    },
    /**
    * After table is rendered, we need to set the comments configuration based on each module and portal id
    */
    callbackAfterTableRender : function(){
        jQuery('body').addClass('of-h'); // No I18N
        if($approvalsTable.isPendingApprovalsView){
            var all_portal_comments = headerApprovals.getApprovalCommentConfig();
            var approval_comment_config = {"request":{},"change":{},"release":{},"purchase_request":{},"purchase_order":{}}; // No I18N
            var my_pending_approvals = $approvalsTable.tableInstance.visibleContents;
            if(my_pending_approvals.length > 0){
                for (i = 0; i < my_pending_approvals.length; i++) {
                    var associated_entity = my_pending_approvals[i].associated_entity;
                    var portal_id = my_pending_approvals[i].portal_id;
                    var approval_id= my_pending_approvals[i].id;
                    var current_portal_comments = all_portal_comments[portal_id];

                    switch (associated_entity){
                        case "request": //NO I18N
                            var mandateComment = {};
                            if(current_portal_comments.MandateApprovalComments == 'true'){
                                if(current_portal_comments.ActionNameForMandateComments == 'all'){
                                    mandateComment.mandateAcceptComment = true;
                                    mandateComment.mandateRejectComment = true;
                                }else{
                                    mandateComment.mandateAcceptComment = false;
                                    mandateComment.mandateRejectComment = true;
                                }
                            }else {
                                mandateComment.mandateAcceptComment = false;
                                mandateComment.mandateRejectComment = false;
                            }
                            approval_comment_config[associated_entity][approval_id]=mandateComment;
                        break;
                        case "purchase_request": //NO I18N
                            var mandateComment = {};
                            if(current_portal_comments.MandatePurchaseApprovalComments == 'true'){
                                mandateComment.mandateAcceptComment = true;
                                mandateComment.mandateRejectComment = true;
                            }else{
                                mandateComment.mandateAcceptComment = false;
                                mandateComment.mandateRejectComment = true;
                            }
                            approval_comment_config[associated_entity][approval_id]=mandateComment;
                        break;
                        case "purchase_order": //NO I18N
                            var mandateComment = {};
                            if(current_portal_comments.MandatePurchaseApprovalComments == 'true'){
                                mandateComment.mandateAcceptComment = true;
                                mandateComment.mandateRejectComment = true;
                            }else{
                                mandateComment.mandateAcceptComment = false;
                                mandateComment.mandateRejectComment = true;
                            }
                            approval_comment_config[associated_entity][approval_id]=mandateComment;
                        break;
                    }
                }
            }
            $approvalsTable.approval_comment_config = approval_comment_config;
        }
        if(window.externalframe) {
            $extFrame.setOptions();
        }
        if (window.location.href.indexOf("mode=embedWidget") != -1) { //NO I18N
            jQuery("#to-homepage a").attr("href", "/ui/home?action=embedWidget&externalframe=true&widget=approval_widget"); //NO I18N
        }
    },
    personalizeCallback : function(tableInfo){
        delete tableInfo.list_info.filter_by;
        return tableInfo;
    },
    tableCompOptions : function(){
        var options = {
            "personalizeCallback" : this.personalizeCallback, default_sort_field : {"sort_field" : "sent_on","sort_order" : "desc"}, //NO I18N
            "bulkSelectionSetting": {"enabled": true, constructSelectedListCB : $approvalsTable.constructSelectedListCB}  //NO I18N
            }
        return options;
    },
    constructSelectedListCB: function(data){
        return '<span rel="uitip" mode_ellipsis=true title="' + e_attr(data.title) + '">#' + data.id + ' ' + e_html(data.title) + '</span>';
    },

    //This method triggers the approval action popup after verifying if there are any approvals pending clarification status. If so, it requests confirmation; otherwise, it displays the approval popup for bulk approval action.
    initiateBulkApprovalAction : function(){

        var hasPendingClarifications = false, selectedRecords = $approvalsTable.tableInstance.bulkSelect.selectedRecords, checkedIds = Object.keys(selectedRecords);
        for(var i=0;i<checkedIds.length;i++){
            var approvalsObj = selectedRecords[checkedIds[i]];
            if(approvalsObj.status.name === 'Pending Clarification'){
                hasPendingClarifications = true;
                break;
            }
        }
        if(hasPendingClarifications){
            var message = translate('api.approval.action.confirmation.msg'); // No I18N
            var title = translate('api.approval.action.confirmation.title'); // No I18N
            showconfirm(true,'title=' + title + ', message=' + message + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("sdp.common.back") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
                if(save) {
                    $approvalsTable.openApprovalActionPopup();
                }
            });
        } else {
            $approvalsTable.openApprovalActionPopup();
        }
    },

    //This method is used to show the approval action pop-up when the take action button is clicked after selecting the approvals from the listview
    openApprovalActionPopup : function(){
        var filtername = jQuery("#approvals-filters").text();
        var [canApprove, canReject] = $approvalsTable.isCommentMandatory(filtername);
        $approvalsTable.cmt_man_str = (!canApprove || !canReject);
        $approvalsTable.is_change_release = filtername.includes('Change') || filtername.includes('Release'); //No I18N
        $approvalsTable.cmt_err_msg = translate("form.character.maximumlength.alert", [2000]);
        var compiledHtml = renderhbs(null, "bulk-approval-action-template", $approvalsTable, false, "approval", false, false, null, true); // NO I18N
        jQuery("#BulkApprovalsPopUp").html(compiledHtml);
        jQuery("#BulkApprovalsPopUp").dialog({ modal: true, closeOnEscape: true, draggable: true, position: { my: 'center', at: 'center' }, width: "450", title: translate("sdp.approve.apprcomments"), close:function(){ // No I18N
                jQuery("#BulkApprovalsPopUp").empty();
                jQuery("#BulkApprovalsPopUp").dialog("destroy");//No I18N
            }
        });
        const textarea = jQuery('#appr_comments'), error_span = jQuery('#maxlen-error'), maxLength = 2000;
        textarea.off('input.err_msg').on('input.err_msg', function() { jQuery(this).val().length >= maxLength ? error_span.removeClass('hide') : error_span.addClass('hide'); }); //No I18N
        ['bulk_approve_button', 'bulk_reject_button'].forEach((id, i) => document.getElementById(id).disabled = !(i ? canReject : canApprove)); //No I18N
        $approvalsTable.approvalPopUpEventBindings(canApprove, canReject);
        textarea.trigger('focus');
    },

    isCommentMandatory: function(filter_name) {
        const config = headerApprovals.getApprovalCommentConfig()[sdp_app.PORTAL_ID];
        const reqConditions = () => config.MandateApprovalComments !== null && config.ActionNameForMandateComments === "reject" ? [true, false] : [false, false];
        const purConditions = () => config.MandatePurchaseApprovalComments ? [true, false] : [false, false];

        if (filter_name.includes("Request")) {
            return config.MandateApprovalComments === "false" ? [true, true] : config.ActionNameForMandateComments === "all" ? [false, false] : reqConditions();
        }
        if (filter_name.includes("Purchase")) {
            return purConditions();
        }
        return [false, false];
    },

    approvalPopUpEventBindings(canApprove, canReject){
        jQuery("#appRejectPopup").ready(function() {
            const [approveButton, rejectButton, commentBox] = ['bulk_approve_button', 'bulk_reject_button', 'appr_comments'].map(id => document.getElementById(id)); //No I18N
            commentBox.addEventListener('input', () => {
                const isNotEmpty = commentBox.value.trim().length > 0;
                approveButton.disabled = (canApprove) ? false : !isNotEmpty;
                rejectButton.disabled = (canReject) ? false : !isNotEmpty;
            });
        });
    },

    //This method is used to take bulk approvals action from the approval action pop up
    takeBulkApprovalAction : function(approval_action){

        jQuery("#bulk_action_"+ approval_action +"_load").removeClass("hide");
        jQuery("#bulk_approve_button, #bulk_reject_button").prop('disabled', true); //NO I18N
        var selectedRecords = $approvalsTable.tableInstance.bulkSelect.selectedRecords, checkedIds = Object.keys(selectedRecords);
        var approval_comments = jQuery("#appr_comments").val(), chd_approvals = [], module_name = null;
        for(var i=0;i<checkedIds.length;i++){
            var approvalsObj = selectedRecords[checkedIds[i]];
            module_name = approvalsObj.associated_entity;
            var appObj = {
              "id": approvalsObj.id, // No I18N
              "approval_level_id": approvalsObj.approval_level.id, // No I18N
              "module_id": approvalsObj.approval_level[module_name].id, // No I18N
              "portal_id": approvalsObj.portal_id // No I18N
            };
            if(module_name.includes('purchase')){ // No I18N
                appObj.parent_module = module_name;
                module_name = "purchase"; // No I18N
            }
            chd_approvals[i] = appObj;
        }

        var data = {
            "module": module_name, //NO I18N
            "comments": approval_comments, // No I18N
            "approval" : chd_approvals //NO I18N
        };
        $approvalsTable.checked_approvals = chd_approvals;
        var inputData = sdpAjaxInputData(data);

        jQuery("#approvals_action_panel").addClass('hide'); //NO I18N
        sdpAjax({
            url: "/api/v3/approvals/" + approval_action, //NO I18N
            data: inputData,
            ignorefailuremessage:true,
            type: 'PUT', //No I18N
            success: function(response) {
                jQuery("#BulkApprovalsPopUp").dialog("close"); //NO I18N
                for(var i=0;i<checkedIds.length;i++){
                    var response_status = response.response_status[i].status, failure = false;
                    var failed_records = {}, j = 0;
                    if (response_status == "failed") {
                        failure = true;
                        failed_records[j++] = selectedRecords[checkedIds[i]].approval_level[curr_record.associated_entity].id;
                    }
                }
                if(!failure){
                    $extFrame.getActiveWindow().showalert('success', translate("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                } else {
                    var error_response = $approvalsTable.updateResponseJSONForSummaryDialog(response.responseJSON);
                    $approvalsTable.tableInstance.t_obj.options.bulk_action_summary = {"entity_i18n": "sdp.approval.moduleid", field: "approval_level.request.id"}; //No I18N
                    $approvalsTable.tableInstance.showUpdateOrDeleteSummary(error_response, "update"); //No I18N
                }
                $extFrame.getActiveWindow().$approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
            },
            error: function(response) {
                jQuery("#BulkApprovalsPopUp").dialog("close"); //NO I18N
                var error_response = $approvalsTable.updateResponseJSONForSummaryDialog(response);
                $approvalsTable.tableInstance.t_obj.options.bulk_action_summary = {"entity_i18n": "sdp.approval.moduleid", field: "approval_level.request.id"}; //No I18N
                $approvalsTable.tableInstance.showUpdateOrDeleteSummary(error_response, "update"); //No I18N
                $extFrame.getActiveWindow().$approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
            }
        });
    },
    updateResponseJSONForSummaryDialog : function(response){
        var status = response.responseJSON.response_status;
        for(var i=0; i<status.length; i++){
            if(status[i].status === "failed"){
                status[i].id = $approvalsTable.checked_approvals[i].module_id;
            } else {
                status[i].messages = null;
            }
        }
        response.responseJSON.response_status = status;
        return response.responseJSON;
    },
    /**
    * Execute the approval action and display appropriate message based on success/failure
    * @param _this -- current element
    * @param associated_entity -- Module/Entity which contains the approval
    * @param id -- Associated Entity id
    * @param level_number -- Approval level id
    * @param approval_id -- Approval id
    * @param from -- "pendingApprovalsList"{Pending approval filter in show all}
    */
    approvalsAction : function(_this,associated_entity, id, level_number, approval_id, from, portal_id){
        var approval_action = jQuery(_this).attr('data-id');
        var approval_comment = jQuery(_this).closest('.approval-footer').find('textarea').val() || jQuery("#ActionCmnt").val(); //NO I18N
        $approvalsTable.associated_entity = associated_entity;
        if (!approval_comment || approval_comment === "") {
            if(associated_entity == "request" || associated_entity == "purchase_order" || associated_entity == "purchase_request"){ //NO I18N
                var comment_config = null;
                if(from == "pendingApprovalsList"){
                    comment_config = $extFrame.getActiveWindow().$approvalsTable.approval_comment_config[associated_entity];
                }
                if(comment_config && comment_config[approval_id]){
                    if((approval_action == "accept" && comment_config[approval_id].mandateAcceptComment)||(approval_action == "reject" && comment_config[approval_id].mandateRejectComment)){
                        showalert('failure', translate("sdp.changedetails.comments.emptyalert"), 'isAutoHide=false'); //NO I18N
                        return;
                    }
                }
            }
        }

        var data = {
            "approval": { //NO I18N
                "comments": approval_comment //NO I18N
            }
        };
        var inputData = sdpAjaxInputData(data);
        // passing portal id for other portal approvals action
        if(portal_id){
            inputData = appendParameter(inputData,"PORTALID",portal_id);  //NO I18N
        }
        sdpAjax({
            url: "/api/v3/" + associated_entity + "s/" + id + "/approval_levels/" + level_number + "/approvals/" + approval_id + "/" + approval_action, //NO I18N
            data: inputData,
            cache: false,
            type: 'PUT', //No I18N
            success: function(response) {
                var response_status = response.response_status.status;
                if (response_status == "success") {
                    $extFrame.getActiveWindow().showalert('success', translate("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                    var action_status = (approval_action === 'approve') ? "Approved" : "Denied";
                    $extFrame.getActiveWindow().headerApprovals.renderApprovalStatusBanner($approvalsTable.associated_entity, action_status);
                    $extFrame.getActiveWindow().$approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
                }else{
                    $extFrame.getActiveWindow().showalert('failure', response_status, 'isAutoHide=false'); //NO I18N
                }
            }
        });
    },
    constructSentOn : function(table_data){
        var row_data = table_data.row_data ;
        return row_data.sent_on ? row_data.sent_on.display_value : '-'; //NO I18N
    },
    constructActionTakenOn : function(table_data){
        var row_data = table_data.row_data ;
        return row_data.action_taken_on ? row_data.action_taken_on.display_value : '-'; //NO I18N
    },
    constructHelpdeskName : function(table_data){
        var row_data = table_data.row_data ;
        return e_html(row_data.portal_name);
    },
    setNoDataString : function(){
        return '<span>'+translate("sdp.approvals.none")+'</span>';// No I18N
    },
    //This method is used to get the filter based on the module
    getFilterInfoForModule: function(module, isFilterName) {
        const filterMap = {
            "request": "my_request_pending_approvals", //NO I18N
            "change": "my_change_pending_approvals", //NO I18N
            "release": "my_release_pending_approvals" , //NO I18N
            "purchase": "my_purchase_pending_approvals"  //NO I18N
        };
        const filterKeyMap = {
            "request": "approvals.filter.requestpendingapprovals", //NO I18N
            "change": "approvals.filter.changependingapprovals", //NO I18N
            "release": "approvals.filter.releasependingapprovals" , //NO I18N
            "purchase": "approvals.filter.purchasependingapprovals"  //NO I18N
        };
        if(isFilterName) {
            return filterMap.hasOwnProperty(module) ? filterMap[module] : "my_pending_approvals";
        } else {
            return filterMap.hasOwnProperty(module) ? translate(filterKeyMap[module]) : translate("sdp.header.pending.approvals"); //NO I18N
        }
    },

    setTableInfo : function(personalize_key){
        var table_info = getPersonalizeData(personalize_key);
        if($approvalsTable.from_filter != "null"){
            $approvalsTable.isPendingApprovalsView = false;
            $approvalsTable.isModulePendingApprovalsView = true;
        }
        var filterName = $approvalsTable.getFilterInfoForModule($approvalsTable.from_filter, true);
        if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            var t_info;
            var listInfo = {
                //SD-112710 - Module id search fix - Filter criteria is not passed in when loading listview by default
                filter_by : { "name": filterName}, // No I18N
                start_index : 1,
                row_count : 10,
                get_total_count :"true" // No I18N
            };
            t_info = {
                "list_info": listInfo, //No i18N
                "fields_required": {"moduleId":"","module":"","moduleTitle":"","approval_name":"","status.name":"","comments":"","subject":"", "sent_on":"","action_taken_on":"","requester_name":"","priority":"","description":"", "helpdesk_name":""},// No I18N
                "column_order" : ["moduleId", "module","moduleTitle", "approval_name", "status.name","comments","subject","sent_on", "action_taken_on", "requester_name", "priority", "description","helpdesk_name"]// No I18N
            };
            return t_info;
        }else{
            //SD-112710 - Module id search fix - Filter criteria is not passed in when loading listview by default
            if(table_info.list_info.filter_by == null){
                table_info.list_info.filter_by = {"name": filterName}; // NO I18N
            }
            //SD-129629 - Due to the security XML entries added for the Table component, the personalized data is now received as an array, and thus does not require manual conversion. However, this behavior might not be consistent in upgraded setups, where the workaround implemented below is still necessary.
            if(table_info.column_order && Object.prototype.toString.call(table_info.column_order) === '[object String]'){
                //temporary workaround for column_order since in table component, the personalized data is saved with twice quoted string because of the usage of personalizeCallback. Hence, parsing it here once and then again in component
                table_info.column_order = JSON.parse(table_info.column_order);
            }
            return table_info;
        }
    }
}
