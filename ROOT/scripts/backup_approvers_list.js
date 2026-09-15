var $backup_appr = {
    isEdit: false,
    defaltImagePath: "/images/default-profile-pic2.svg", // No I18N
    backappr_tbl: {},
    isCancelledFilter: false,
    filterViewType: "activeView", // No I18N
    allFilterViewsMap: {},
    hasAdminRole: false,
    user: undefined,
    isRetiredHelpdesk: false, //not to allow any operations on retired portal
    approverAccountId: undefined, //added for MSP
    /* prerequisites for list view: fetching list view filters */
    initBackupApprListView(personalizeKey, componentName) {
        /*check if the user has any of the admin roles*/
        if (sdp_user.ROLES.includes('SDAdmin') || sdp_user.ROLES.includes('SDSiteAdmin') || sdp_user.ROLES.includes('SDCo-ordinator')) {
            $backup_appr.hasAdminRole = true;
        } else {
            sdpAjax({
                url: "/api/v3/users/" + sdp_user.LOGGEDIN_USERID, //NO I18N
                async: false,
                ignorefailuremessage: true,
                success(response) {
                    $backup_appr.user = response.user ;
                }
            });
        }
        /*fetching the available list view filter views and storing in a filter map for future reference*/
        const inputObject = {
            "show_all": { "module": "backup_approver" }, //NO I18N
            "list_info": { "row_count": "100", "search_fields": { "module": "backup_approver" } } //NO I18N
        };
        const dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
            url: '/api/v3/list_view_filters/show_all', //NO I18N
            data: dataVal,
            success(resp) {
                const filters = resp.show_all;
                for (let i = 0; i < filters.length; i++) {
                    $backup_appr.allFilterViewsMap[filters[i].name] = filters[i].display_name;
                }
            },
            acceptODCompatible: true,
            async: false
        });
        const table_info = getPersonalizeData(personalizeKey);
        if (!jQuery.isEmptyObject(table_info) && !jQuery.isEmptyObject(table_info.list_info) && !jQuery.isEmptyObject(table_info.list_info.filter_by)) {
            const filter_name = table_info.list_info.filter_by.name;
            /*when a role of a tech who was previously SDSiteAdmin/SDAdmin/SDCo-ordinator might have "all filters" personalized. Hence personalized data should be deleted */
            if($backup_appr.allFilterViewsMap != null && $backup_appr.allFilterViewsMap[filter_name] != undefined){
                $backup_appr.setFilterViewType(filter_name);
                $backup_appr.filter_display_name = $backup_appr.allFilterViewsMap[filter_name];
            }else{
                addPersonalization("backup_approvers",{}); //NO I18N
            }
        }
        $backup_appr.showBackApprListView(componentName);
    },
    /* renders list view */
    showBackApprListView(componentName) {
        const contextObj = {};
        /*setting common filters and admin filters to render in dropdown*/
        contextObj.filterView = $backup_appr.filterViewType;
        const entries = Object.entries($backup_appr.allFilterViewsMap);
        contextObj.commonFilters = {};
        if (entries.length <= 3) {
            contextObj.commonFilters = $backup_appr.allFilterViewsMap;
        } else {
            contextObj.adminFilters = {};
            for (let i = 0; i < entries.length; i++) {
                const [internal_name, display_name] = entries[i];
                if (i < 3) {
                    contextObj.adminFilters[internal_name] = display_name;
                } else {
                    contextObj.commonFilters[internal_name] = display_name;
                }
            }
        }
        $backup_appr.isRetiredHelpdesk = contextObj.isRetiredHelpdesk = window.hasOwnProperty("esm_details") && window.esm_details.hasOwnProperty("current_portal") && window.esm_details.current_portal.isRetired; //No I18N

        renderhbs("#listviewloader", 'backup-approver-listview', contextObj, false, 'backup-approver'); // NO I18N
        /*To destroy previous instance of tablecomponent*/
        delete WebComponents.instancePool[componentName];
        WebComponents.render(componentName);
        $backup_appr.backappr_tbl = WebComponents.getInstance(componentName);
    },
    /* sets appropriate filter type for the given filter name */
    setFilterViewType(filter_name){
        if (filter_name == "canceled_backup_approvers" || filter_name == "mycanceled_backup_approvers") { //NO I18N
            $backup_appr.filterViewType = "cancelledView"; //NO I18N
        } else if (filter_name == "active_backup_approvers" || filter_name == "myactive_backup_approvers") { //NO I18N
            $backup_appr.filterViewType = "activeView"; //NO I18N
        } else if(filter_name == "backup_approver_assignments"){ //NO I18N
            $backup_appr.filterViewType = "assignmentView"; //NO I18N
        } else {
            $backup_appr.filterViewType = "expireView"; //NO I18N
        }
    },
    /*removes unwanted fields from fields_required obj*/
    approversListInfo(table_info) {
        const inputObject = {};
        inputObject.list_info = table_info.list_info;
        const fields_required_arr = Object.keys(table_info.fields_required);
        const iconIndex = fields_required_arr.indexOf("actioncell"); // No I18N
        if (iconIndex > -1) {
            fields_required_arr.splice(iconIndex, 1);
        }
        inputObject.fields_required = fields_required_arr;
        return inputObject;
    },
    /*displays the current filter view after table initial render*/
    afterInitialRender() {
        if (!$backup_appr.filterList_obj) {
            $backup_appr.filterList_obj = new filterListComp();
        }
        jQuery('#backup_approver_filter_link').text($backup_appr.filter_display_name).attr("title",$backup_appr.filter_display_name);
    },
    afterBodyRender(){
        let height;
        const listview_height = 160;
        const chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0;// No I18N
        const headerbar_height = jQuery('.headerbar').length !== 0 ? jQuery('.headerbar').height() : 0; // No I18N
        height = jQuery('#header-placeholder').length == 0 ? (jQuery(window).height() - jQuery('#top-header').height() - headerbar_height - chatbar_height - 80) : (jQuery(window).height() - jQuery('#header-placeholder').height() - headerbar_height -chatbar_height - 80);//No I18N
        jQuery("#backup_approvers_div").height(height); // No I18N
        jQuery("#backup_approvers_div").removeClass("tablebrd1"); // No I18N
        jQuery("[data-value=aprover-block]").closest(".d_w").removeClass("d_w").removeAttr("style");  // No I18N
        jQuery("[data-value=backup-aprov-block]").closest(".d_w").removeClass("d_w").removeAttr("style");  // No I18N
    },
    /*constructs the action cell with delete, edit, cancel options as per the row status*/
    constCellAction(input) {
        let actionDiv = `<div class="btn-group tc-req-edit bs-noconflict pos-abs ml5 mt-5 disp-h">
                <a href="/" class="btn btn-link btn-sm sdmenu-toggle" data-switch="sdmenu" rel="uitip" title="${translate("sdp.common.actions")}">  
                    <span class="cspr menulist icon-xs"></span>
                </a>
                <ul class="sdmenu-dd minw-100px">
                    <li>
                        <a href="/" data-action="edit" data-event="click" data-handler="$backup_appr.addBackupappr(${input.row_data.id}); return false;" nonce=`+sdpNonce+`>
                            <span>${translate("common.edit")}</span>
                        </a>
                    </li>`;

        if (input.row_data.status == "upcoming") {
            actionDiv += `
                    <li>
                        <a href="/" data-entitycancel="1" data-event="click" data-handler="$backup_appr.backApprDeleteRow(${input.row_data.id})" nonce=`+sdpNonce+`>
                            <span>${translate("common.delete")}</span>
                        </a>
                    </li>
                </ul>`;
        } else {
            actionDiv += `
                    <li>
                        <a href="/" data-entitycancel="1" data-event="click" data-handler="$backup_appr.cancelBackupApprover(${input.row_data.id})" nonce=`+sdpNonce+`>
                            <span>${translate("common.cancel")}</span>
                        </a>
                    </li>
                </ul>`;
        }
        actionDiv +='</div>'
        return actionDiv;
    },

    /*constructs the approver cell with approver's name*/
    constCellApprover(input) {
        const email = input.row_data.user.email_id != null ? input.row_data.user.email_id : "";
        const position = "mb5"; // No I18N
        const username = input.row_data.user.name;
        const profilePic = $backup_appr.getProfilePic(input.row_data.user, input.row_data.user.image_token);
        let html = `<div data-value="aprover-block"`; // No I18N
        if ($backup_appr.filterViewType == "activeView" && !$backup_appr.isRetiredHelpdesk) { // No I18N
            html += ` data-event="click" data-handler="$backup_appr.addBackupappr(${input.row_data.id});" nonce=`+sdpNonce+` class="cur-ptr">`; // No I18N
        }
        html += `<div class="disp-t pt10 pb10 tl-fixed w-240px">
                    <div class="disp-c pr10 w-60px">
                        <span class="prp">
                            <img src="${profilePic}" alt="${e_attr(username)}" onerror="this.src='${$backup_appr.defaltImagePath}'">
                        </span>
                    </div>
                    <div class="disp-c fw vtop pt10">
                        <div class="${position} font-medium1 bk-truncate pr20 a11yemphasize" rel="uitip" mode_ellipsis=true title="${e_attr(username)}" data-value="aprName">
                            ${e_html(username)}
                        </div>
                        <div class="text-color7 bk-truncate pr20" data-value="aprEmail" rel="uitip" mode_ellipsis=true title="${e_attr(email)}">
                            ${e_html(email)}
                        </div>
                    </div>
                </div>
            </div>`;
        return html;
    },

    /*constructs the backup approver cell with backup approver's name*/
    constCellbackApprover(input) {
        const email = input.row_data.backup_user.email_id != null ? input.row_data.backup_user.email_id : "";
        const position = "mb5"; // No I18N
        const username = input.row_data.backup_user.name;
        const profilePic = $backup_appr.getProfilePic(input.row_data.backup_user, input.row_data.user.image_token);
        let html = `<div data-value="backup-aprov-block"`; // No I18N
        if ($backup_appr.filterViewType == "activeView" && !$backup_appr.isRetiredHelpdesk) { // No I18N
            html += ` data-event="click" data-handler="$backup_appr.addBackupappr(${input.row_data.id});" nonce=`+sdpNonce+` class="cur-ptr">`; // No I18N
        }
        html += `<div class="disp-t pt10 pb10 tl-fixed w-240px">
                         <div class="disp-c pr10 w-60px">
                             <span class="prp">
                                 <img src="${profilePic}" alt="${e_attr(username)}" onerror="this.src='${$backup_appr.defaltImagePath}'">
                             </span>
                         </div>
                         <div class="disp-c fw vtop pt10">
                             <div class="${position} font-medium1 bk-truncate pr20 a11yemphasize" data-value="aprName" rel="uitip" mode_ellipsis=true title="${e_attr(username)}">
                                 ${e_html(username)}
                             </div>
                             <div class="text-color7 bk-truncate pr20" data-value="aprEmail" rel="uitip" mode_ellipsis=true title="${e_attr(email)}">
                                 ${e_html(email)}
                             </div>
                         </div>
                     </div>
                 </div>`;
        return html;
    },

    /*renders date range configured*/
    constCellDateRange(input) {
        return `<div class='disp-t mt10 mb5 tl-fixed'>
            <div class='disp-c text-color5 text-overflow fl vmiddle w-40px'>
                <span rel='uitip' mode_ellipsis=true title='${translate('sdp.common.from')}'>
                    ${translate('sdp.common.from')}
                </span>
            </div>
            <span class='disp-c fl vmiddle ml3 mr3'>:</span>
            <div class='disp-c text-overflow fl vmiddle w-110px'>
                <span rel='uitip' mode_ellipsis=true title='${input.row_data.from.display_value}'>
                    ${input.row_data.from.display_value}
                </span>
            </div>
        </div>
        <div class='disp-t mb5 tl-fixed'>
            <div class='disp-c text-color5 text-overflow fl vmiddle w-40px'>
                <span rel='uitip' mode_ellipsis=true title='${translate('sdp.admin.rule.addrule.criteria.recipient')}'>
                    ${translate('sdp.admin.rule.addrule.criteria.recipient')}
                </span>
            </div>
            <span class='disp-c fl vmiddle ml3 mr3'>:</span>
            <div class='disp-c text-overflow fl vmiddle w-110px'>
                <span rel='uitip' mode_ellipsis=true title='${input.row_data.to.display_value}'>
                    ${input.row_data.to.display_value}
                </span>
            </div>
        </div>`; // #101409
    },

    /*renders created by cell with the user who configured*/
    constCellCreatedBy(input) {
        return `<div class="pt5 pb10">
            <div class="bk-truncate fw mt10 mb5" rel="uitip" mode_ellipsis=true title="${e_attr(input.row_data.created_by.name)}">
                ${e_html(input.row_data.created_by.name)}
            </div>
            <div class="text-color5">
                ${input.row_data.created_time.display_value}
            </div>
        </div>`;
    },
    /*renders created by cell with the user who cancelled the configuration*/
    constCellCancelledBy(input) {
        if(input.row_data.cancelled_by && input.row_data.cancelled_by.name){
            return `<div class="pt5 pb10">
                <div class="bk-truncate fw mt10 mb5" rel="uitip" mode_ellipsis=true title="${e_attr(input.row_data.cancelled_by.name)}">
                    ${e_html(input.row_data.cancelled_by.name)}
                </div>
                <div class="text-color5">
                    ${input.row_data.cancelled_time.display_value}
                </div>
            </div>`;
        }
        return '-';

    },
    /*gets profile pic of the given user by appending the image token if any */
    getProfilePic(user, image_token) {
        // SD-133726: Defensive: handle null/undefined user or profile_pic
        if (!user || !user.profile_pic || !user.profile_pic["content-url"]) {
            return $backup_appr.defaltImagePath;
        }
        let profile_pic_url = user.profile_pic["content-url"]; // No I18N
        if (image_token !== undefined && profile_pic_url.indexOf("/api/v3") >= 0) { // No I18N
            profile_pic_url = `${profile_pic_url}?key=${image_token}`;
        }
        // SD-133726: If still null/empty after all, fallback to default
        if (!profile_pic_url) {
            return $backup_appr.defaltImagePath;
        }
        return profile_pic_url;
    },
    /*action performed once the filter view changed*/
    showApprListView(filter_name) {
        //show loader whenever the list view is switched. We need this because there is a delay in loading the default loader from tablecomponent because of which just a blank page exists for some time.
        jQ('#backup_approvers_scrollbardiv').scrollTop(0).hide();  // No I18N
        jQ('#backup_approvers_body').html("<div class='pos-abs z-ind10 fh fw freezelayerbg2'></div>" + ajaxBar()); // No I18N
         jQuery('.tablelist .loading1').css('top', '50%'); // No I18N

        const obj = { name: filter_name };
        $backup_appr.backappr_tbl.t_obj.table_info.list_info.start_index = 1;
        $backup_appr.backappr_tbl.t_obj.table_info.list_info.filter_by = obj;
        $backup_appr.setFilterViewType(filter_name);
        $backup_appr.filter_display_name = $backup_appr.allFilterViewsMap[filter_name];
        if($backup_appr.backappr_tbl.addPersonalizeData($backup_appr.backappr_tbl.t_obj.table_info)){
         /* everytime the filter view is changed, we are reconstructing the table since the columns change  */
            setTimeout(() => {
                $backup_appr.showBackApprListView("webc-backupApproversList"); // No I18N
            }, 100);
        }
    },
    /*get the existing backup approver configured or create a new configuration*/
    addBackupappr(rowId) {
        if (rowId !== undefined) {
            isEdit = true;
            sdpAjax({
                url: `/api/v3/backup_approvers/${rowId}`,
                success: (obj) => {
                    $backup_appr.handleBarsTemp(obj.backup_approver); /*UPDATE BACKUP APPROVER*/
                }
            });
        } else {
            isEdit = false;
            $backup_appr.handleBarsTemp({}); /*ADD BACKUP APPROVER*/
        }
    },
    /*renders cancel dialog*/
    cancelBackupApprover(rowId) {
        renderhbs("#cancelBackupAppr", 'backup-approver-cancel-dialog', {"id" : rowId}, false, 'backup-approver'); // NO I18N
        showModal("cancelBackupAppr",550,100.25,"none",false,true); // NO I18N
        $backup_appr.commentsCount();
    },
    /*performs cancel action*/
    processCancelApprover(ele) {
        const rowId = jQuery(ele).attr("data-entitycancel");
        if (rowId !== undefined) {
            const parentElement = jQuery("#cancelBackupAppr"); // NO I18N
            const comments = parentElement.find("#cancelComments").val();
            const input_object = { backup_approver: {} };
            input_object.backup_approver.cancel_comments = comments;
            const dataVal = sdpAjaxInputData(input_object);
            sdpAjax({
                url: `/api/v3/backup_approvers/${rowId}/_cancel`,
                data: dataVal,
                type: 'PUT', // No I18N
                success: (obj) => {
                    const msg = translate('backupapprover.cancel.success');
                    showalert('success', msg, "isAutoHide=true"); // No I18N
                    jQuery('#cancelBackupAppr').dialog('close'); // NO I18N
                    $backup_appr.backappr_tbl.refreshTable();
                }
            });
        }
    },
    /*renders add/edit form of the backup approver configuration*/
    handleBarsTemp(obj) {
        let popupTitle,mode;
        if(obj != undefined && !jQuery.isEmptyObject(obj)){
            popupTitle = translate('sdp.backupapprover.addnewform.edit.title')
            mode = "edit"; // NO I18N
        }else{
            popupTitle = translate('sdp.backupapprover.addnewform.title');
            mode = "new"; // NO I18N
        }
        jQuery("#backupApvr_AddNew").attr('title',popupTitle); // NO I18N
        renderhbs("#backupApvr_AddNew", 'backup-approver-config-form', obj, false, 'backup-approver'); // NO I18N
        showModal("backupApvr_AddNew",700,"auto","none",false,true); // NO I18N

        $backup_appr.backApprAjax(obj, "approverdd"); // No I18N
        $backup_appr.backApprAjax(obj, "backupapproverdd");   // No I18N
        if (!$backup_appr.hasAdminRole && (obj == undefined || jQuery.isEmptyObject(obj)) && $backup_appr.user != undefined && !jQuery.isEmptyObject($backup_appr.user)) {
            obj = {"user" : $backup_appr.user}; // No I18N
            if(obj.user.reporting_to != null && (obj.user.id != obj.user.reporting_to.id)){
                let reportingToObj = $backup_appr.isValidReportingTo(obj.user.reporting_to.id);
                if(reportingToObj != null){
                    obj.backup_user = reportingToObj;
                }
            }
        }
        $backup_appr.SetFormInputs(obj,mode);
        $backup_appr.commentsCount();
    },

    isValidReportingTo(reportingToId){
        let reportingToObj = null;
        sdpAjax({
            url: "/api/v3/backup_approvers/backup_user/" + reportingToId, // No I18N
            ignorefailuremessage: true,
            success(userObj) {
                reportingToObj = userObj.orguser;
            },
            async: false
        });
        return reportingToObj;
    },
    /* GET ALL USER AND BACKUP APPROVER LIST*/
    backApprAjax(val, id) {
        const listInfo = { "fields_required": ["name", "email_id", "profile_pic"], "search_criteria": { "field": "name", "condition": "contains", "value": "  ", "children": [{ "field": "email_id", "condition": "contains", "value": "", "logical_operator": "OR" }] }, "start_index": 1, "row_count": 25 }; // No I18N
        /* based on the loggedin user type, we use different urls for lising approvers and backup approvers */
        let usersAPIURI;
        if(id == "approverdd"){
            usersAPIURI = "/api/v3/backup_approvers/user";  // No I18N
        }else{
            usersAPIURI = "/api/v3/backup_approvers/backup_user";  // No I18N
        }
        if(window.isMSPOrSCP){
		    if(id=="approverdd"){
				$backup_appr.approverAccountId = val?val.user.account.id:0;
			}
			usersAPIURI = $backup_appr.urlCallBack(id);
        }
        select2Dropdown({
            elementId: id,
            dataType: "json", // No I18N
            formatResult: $backup_appr.backApprFormatState,
            formatSelection: $backup_appr.backApprFormatState,
            dropdownCssClass: "bk-sel-cust", // No I18N
            url: usersAPIURI,
            listInfo,
            OnChangeFunction: $backup_appr.selectReportingTo,
            select2Result: $backup_appr.select2Result,
            escapeInputData: true,
            placeHolder: translate("sdp.backupapprover.selectapprover")
        });
    },
    //the urlCallBack function is used only in MSP to append accountid param
    urlCallBack(id){
        if(id=="approverdd"){
            return "/api/v3/backup_approvers/user";//No I18N
        }
        else if(id=="backupapproverdd"){
            return "/api/v3/users?ACCOUNTID="+$backup_appr.approverAccountId;//No I18N
        }
    },
    /*set backup approver config's add/edit form values*/
    SetFormInputs(val,mode) {
        const parentElement = jQuery('#addBackupApvrForm'); // NO I18N
        if (val !== undefined && !jQuery.isEmptyObject(val)) {
            if (val.user) {
                parentElement.find("#approverdd").select2('data', val.user); // No I18N
            } else {
                parentElement.find("#approverdd").select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
            }

            if (val.backup_user) {
                parentElement.find("#backupapproverdd").select2('data', val.backup_user); // No I18N
            } else {
                parentElement.find("#backupapproverdd").select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
            }
            if (val.status == "progress" || val.status == "completed") {
                parentElement.find('#approverdd,#backupapproverdd').select2("enable", false).parent().find("#s2id_approverdd,#s2id_backupapproverdd").css("background-color", "#eeeeee").find(".select2-arrow").css("display", "none"); // No I18N
                parentElement.find('#input-bkupFromDate').removeAttr("onclick");  // No I18N
                parentElement.find('#approverdd').removeAttr("autofocus");  // No I18N
                parentElement.find('.select2-container-disabled').removeClass('select2-container-active'); // No I18N
                parentElement.find('#bkupFromDate_Display').prop("disabled", true).css("background-color", "#eeeeee"); // No I18N
                if (val.status == "completed") {
                    parentElement.find('#input-bkupToDate').removeAttr("onclick");  // No I18N
                    parentElement.find('#bkupToDate_Display').prop("disabled", true).css("background-color", "#eeeeee"); // No I18N
                    parentElement.find('#movePendAppr,#adNewComnts,#bkApvrAdnew_save,#bkApvrAdnew_Cancel').prop("disabled", true); // No I18N
                }
            }
        } else {
            /* APPROVER AND BACKUP APRROVER DEFAULT IMAGES */
            parentElement.find("#approverdd,#backupapproverdd").select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
        }
        /*not allow the user to edit the approver cell if he doesn't have an admin role.*/
        if (!$backup_appr.hasAdminRole) {
            parentElement.find('#approverdd').select2("enable", false).parent().find("#s2id_approverdd").css("background-color", "#eeeeee").find(".select2-arrow").css("display", "none"); // No I18N
            if(mode == "new" &&  parentElement.find('#backupapproverdd').val() === ''){ // No I18N
                parentElement.find('#backupapproverdd').select2('open'); // No I18N
            }
            parentElement.find('.select2-container-disabled').removeClass('select2-container-active'); // No I18N
        }
        jQuery("#backupApvr_AddNew").on('dialogclose', function (event) {
            parentElement.find('#adNewComnts').off('keyup'); // No I18N
        });
    },

    backApprFormatState(state) {
        /* CONSTRUCT APPROVER AND BACKUP APRROVER DEFAULT IMAGES */
        if (state.img) {
            const $state = `<div class="disp-t pt10 pb10">
                <div class="disp-c pr10">
                    <span class="prp opac5">
                        <img src="${state.img}">
                    </span>
                </div>
                <div class="disp-c fw vtop pt10">
                    <div class="mb5 sb bk-truncate text-muted" data-text="select-text" data-value="aprName">
                        ${e_html(state.val)}
                    </div>
                </div>
            </div>`;
            return jQuery('<span>').append($state);
        }
        /* SELECT2 CUSTOMIZE */
        else {
            let tech;
            state.name ? tech = state.name : tech = state.text;
            const appr_Email = state.email_id != null ? state.email_id : "";
            const position = state.email_id == null ? "mt10" : ""; // No I18N
            const marginPos = state.email_id != null ? "mt3;" : ""; // No I18N
            const profilePic = $backup_appr.getProfilePic(state, state.image_token);
            const $state = `<div class="disp-t pt10 pb10">
                <div class="disp-c pr10">
                    <span class="prp">
                        <img src="${profilePic}" onerror="this.src='${$backup_appr.defaltImagePath}'"/>
                    </span>
                </div>
                <div class="disp-c fw vtop pt10">
                    <div class="${position} ${marginPos} sb bk-truncate" data-text="select-text" data-value="aprName">
                        ${e_html(tech)}
                    </div>
                    <div class="bk-truncate mt5" data-value="aprEmail" data-ml="aprove-mail">
                        ${e_html(appr_Email)}
                    </div>
                </div>
            </div>`;
            return jQuery('<span>').append($state);
        }
    },
    /*rendering approver, backup approver in select2 of the backup approvers configuration form*/
    select2Result(p_t, page, params) {
        const has_more = p_t.list_info.has_more_rows;
        let o_result = null;
        const apprVAL = jQuery("#approverdd").val();
        const apprName = p_t.list_info.filter_by !== undefined ? p_t.list_info.filter_by.name : "";
        let usersData = (params.elementId == "backupapproverdd") ? p_t.backup_user : p_t.users; // No I18N
        if (usersData === undefined) {
            usersData = p_t.user;
        }
        if (usersData !== undefined) {
            p_t = jQuery.map(usersData, (data, index) => {
                data.text = data.name; /* Name changed to text because name is not searched in select2 */
                data.image_token = p_t.image_token;
                if (apprVAL == data.id && apprName != "approvers_list") {
                    o_result = { results: "" };
                } else {
                    delete data.name;
                    return data;
                }
            });
            o_result = { results: p_t };
        } else {
            o_result = { results: "" };
        }
        if (has_more) {
            o_result.more = has_more;
        }
        return o_result;
    },
    /*automatically choose the reporting_to of the approver if any*/
    selectReportingTo(e) {
        const apprId = e.added.id;
        const backappr = jQuery("#backupapproverdd");
        if(e.currentTarget.id != "backupapproverdd"){
            sdpAjax({
                    // url: orgAdmin == "true" && isMDHSetup == "true" ? "/api/v3/orgusers/"+apprId : "/api/v3/users/"+apprId, // No I18N
                    url: "/api/v3/backup_approvers/user/" + apprId, // No I18N
                    ignorefailuremessage: true,
                    success(obj) {
                        if(window.isMSPOrSCP && e.currentTarget.id=="approverdd"){
                            //In MSP only approvers from same account can be chosen as backup approver. Hence updating the accountID.
                            $backup_appr.approverAccountId = obj.user.account.id;
                        }
                        const reportingTo = obj.orguser.reporting_to;
                        if (reportingTo != null && apprId != reportingTo.id ) {
                            let reportingToObj = $backup_appr.isValidReportingTo(reportingTo.id);
                            if(reportingToObj != null){
                                backappr.select2("data", { id: reportingToObj.id, text: reportingToObj.name, profile_pic: reportingToObj.profile_pic }); // No I18N
                                backappr.parent().find("[data-value=aprEmail]").html(e_html(reportingToObj.email_id));
                            }else{
                               backappr.select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
                            }
                        } else {
                               backappr.select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
                        }
                    },
                    error(obj) {
                         backappr.select2('data', { img: "/images/default-profile-pic2.svg", val: translate('sdp.backupapprover.selectapprover') }); // No I18N
                    },
                });
        }

    },


    commentsCount() {
        jQuery('#adNewComnts,#cancelComments').each(
            function(){ jQuery(this).on('keyup', () => {
                const maxLength = 250;
                let comntLength = 0, currDialog;
                const backupApprFormEle = jQuery('#backupApvr_AddNew'), cancelBackupApprEle = jQuery('#cancelBackupAppr'); // No I18N
                if(backupApprFormEle.length > 0 &&  backupApprFormEle.hasClass("ui-dialog-content") && backupApprFormEle.dialog("isOpen")){ // No I18N
                    comntLength = jQuery('#adNewComnts').val().length;
                    currDialog = backupApprFormEle;
                }else if(cancelBackupApprEle.length > 0 && cancelBackupApprEle.hasClass("ui-dialog-content") && cancelBackupApprEle.dialog("isOpen")){ // No I18N
                    comntLength = jQuery('#cancelComments').val().length;
                    currDialog = cancelBackupApprEle;
                }
                const remainingLength = maxLength - comntLength;
                currDialog.find('#charCountRes').show().find('span').text(remainingLength);
            });
        });
    },
    /*backup approver add/edit configuration's save action*/
    backupApprSave() {
        const parentElement = jQuery('#addBackupApvrForm'); // No I18N
        const approveId = parentElement.find('#approverdd').val();
        const backupApproveId = parentElement.find('#backupapproverdd').val();
        const apprName = parentElement.find('#approverdd').select2('data'); // No I18N
        const backApprName = parentElement.find('#backupapproverdd').select2('data'); // No I18N
        const fromDate = parentElement.find('#bkupFromDate').val();
        const toDate = parentElement.find('#bkupToDate').val();
        const comments = parentElement.find('#adNewComnts').val();
        const movePendApprVal = parentElement.find('#movePendAppr').is(":checked"); // No I18N
        const input_object = { backup_approver: {} };
        input_object.backup_approver.to = { "value": toDate }; // No I18N
        input_object.backup_approver.from = { "value": fromDate }; // No I18N
        input_object.backup_approver.user = { "id": approveId }; // No I18N
        input_object.backup_approver.comments = comments;
        input_object.backup_approver.backup_user = { "id": backupApproveId }; // No I18N
        input_object.backup_approver.move_pending_approvals = movePendApprVal;
        const dataVal = sdpAjaxInputData(input_object);
        $backup_appr.backupApprValidation();
        const dateValRes = $backup_appr.dateValidation(fromDate, toDate);
        /*validate the form and save*/
        if (parentElement.valid() && dateValRes) {
            let url = '/api/v3/backup_approvers'; // No I18N
            let type = 'POST'; // No I18N
            let msg = translate('sdp.backupapprover.success');
            const backupUserId = parentElement.find('#backup_user_id').val();
            if (backupUserId) {
                url = `/api/v3/backup_approvers/${backupUserId}`;
                type = 'PUT'; // No I18N
                msg = translate('sdp.backupapprover.update');
            }
            sdpAjax({
                url: url,
                data: dataVal,
                type: type,
                success(obj) {
                    $backup_appr.backappr_tbl.refreshTable();
                    jQuery('#backupApvr_AddNew').dialog('close'); // NO I18N
                    showalert('success', msg, "isAutoHide=true"); // No I18N
                },
                error(err) {
                    const responseStatus = err.responseJSON.response_status.messages[0];
                    let errorMsg = "";
                    if (responseStatus.status_code == 4008 && responseStatus.fields.length == 1 && responseStatus.fields[0] == "user") {
                        errorMsg = translate("sdp.backupapprover.error.message1"); // No I18N
                    }
                    else if (responseStatus.status_code == 4008 && responseStatus.fields.length == 1 && responseStatus.fields[0] == "backup_user") {
                        const selectedbackAppr = e_html(backApprName.text || backApprName.name);
                        errorMsg = translate("sdp.backupapprover.error.message2", [selectedbackAppr]); // No I18N
                    }
                    else if (responseStatus.status_code == 4008 && responseStatus.fields.length == 2 && responseStatus.fields[0] == "user" && responseStatus.fields[1] == "backup_user") {
                        if(!$backup_appr.hasAdminRole && approveId == sdp_user.LOGGEDIN_USERID){
                            errorMsg = translate("sdp.backupapprover.error.message4", [translate('sdp.common.you')]); // No I18N
                        }else{
                            const selectedAppr = e_html(apprName.text || apprName.name);
                            errorMsg = translate("sdp.backupapprover.error.message3", [selectedAppr]); // No I18N
                        }
                    }
                    else if (responseStatus.field == "from") {
                        errorMsg = translate("sdp.backupapprover.greater.today.date"); // No I18N
                    }
                    else if (responseStatus.field == "to") {
                        errorMsg = translate("sdp.approval.to.date.error"); // No I18N
                    }
                    else {
                        errorMsg = translate("sdp.archive.adminSetup.saveErrorMsg"); // No I18N
                    }
                    showalert('failure', errorMsg, "isAutoHide=false");  //NO I18N
                }
            });
        }
        jQuery('#Calendar_small').hide();
        return false;
    },
    backupApprValidation() {
        jQuery('#addBackupApvrForm').validate({
            errorClass: 'text-danger',// No I18N
            errorPlacement(error, element) {
                const position = element.position();
                error.insertAfter(element);
                error.addClass('alert alert-danger alert-arrow  p5 left10').css({ 'position': 'absolute', 'bottom': '-48px' });// No I18N
            }
        });
    },
    dateValidation(fromDateVal, toDateVal) {
        let validate;
        if (fromDateVal && toDateVal !== "") {
            validate = fromDateVal > toDateVal ? (showalert('failure', translate("sdp.backupapprover.date.alert"), "isAutoHide=false"), false) : true; // No I18N
        }
        return validate;
    },
    /*SET TIME*/
    initBackApprCalender(element) {
        let setHrsMins;
        if ('bkupFromDate' === element) {
            setHrsMins = '00:00';
        } else if ('bkupToDate' === element) { // No I18N
            setHrsMins = '23:59';
        }
        initCalendar(element, null, null, null, null, null, null, null, false, setHrsMins, true);
    },
    /*backup approver config delete action*/
    backApprDeleteRow(rowId) {
        showconfirm(true, `title=${translate('sdp.admin.orgrole.association.confirmdelete')}, message=${translate('sdp.admin.change.commonlistview.deleteConform',[translate('sdp.api.backup.approver')])}, submitbutton=${translate('sdp.approval.delete')}, cancelbutton=No, closebutton=yes, closeOnEscKey=yes`, backApprDelete, true);
        function backApprDelete(response) {
            if (response === true) {
                sdpAjax({
                    url: `/api/v3/backup_approvers/${rowId}`,
                    method: 'DELETE', // No I18N
                    success(obj) {
                        $backup_appr.backappr_tbl.refreshTable();
                        showalert('success', translate('sdp.backupapprover.delete'), "isAutoHide=true");// No I18N
                    }
                });
            }
        }
    },
    hideError(input) {
        jQuery(input).parent().find('.alert-danger').hide();
    },
    closeCalender() {
        jQuery('#Calendar_small').hide();
    },

    /*sets table width*/
    setWidth() {
        const width = jQuery("#listview").width();// No I18N
        return width - 20;
    },
    /*sets table entity info as per the filter view*/
    tableEntityInfo(personalize_key) {
        let table_info = getPersonalizeData(personalize_key);
        if (jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)) {
            let t_info;
            const listInfo = {
                start_index: 1,
                row_count: 10,
                get_total_count: "true"// No I18N
            };
            if ($backup_appr.hasAdminRole) {
                listInfo.filter_by = { "name": "active_backup_approvers" }; // No I18N
                $backup_appr.filter_display_name = translate("backupapprover.active");
            } else {
                listInfo.filter_by = { "name": "myactive_backup_approvers" }; // No I18N
                $backup_appr.filter_display_name = translate("backupapprover.myactive");
            }
            t_info = {
                "list_info": listInfo //No i18N
            };
            table_info = t_info;
        }
        if ($backup_appr.filterViewType == "cancelledView") {
            table_info.fields_required = { "user": "", "backup_user": "", "from": "", "created_by": "", "cancel_comments": "", "to": "", "created_time": "", "cancelled_by": "","cancelled_time":""}; // No I18N
            table_info.column_order = ["user", "backup_user", "from", "created_by", "cancelled_by", "cancel_comments"]; // No I18N
        }else{
            table_info.fields_required = { "user": "", "backup_user": "", "from": "", "created_by": "", "comments": "", "to": "", "created_time": "" },// No I18N
            table_info.column_order = ["user", "backup_user", "from", "created_by", "comments"] // No I18N
        }
        return table_info;
    }
};
