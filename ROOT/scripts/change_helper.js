/* $Id$ */
/*  This file has utility functions required for displaying Change details page.
 */
var change_helper = {

      // This method returns whether logged in user is requester or not.
    isRequester: function() {
        return (parent.sdp_user.USERTYPE==='Requester');//No I18N
    },
    /**
     Renders additional fields section FC for stages
     */
    loadAdditionalFieldsSection: function(tabName, tabSetting, tabs_panel, options, configObj){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var stageDisplayName = tabs_panel.header_name;
        var column_count = 2;
        var template = _self.constructTemplateInfo(stageName, null, column_count, options);
        var isAdditionalFieldsPresent = template.layouts[0].sections[0].fields.length > 0 ? true : false;
        let canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;

        if(isAdditionalFieldsPresent){
            var configJSON = {
                entitydata: _self.entity_data,
                template: template,
                metadata: _self.metainfo,
                entityName: translate("sdp.app.asset.details",[e_html(stageDisplayName)]),
                container: options.container ? options.container : stageName+"_additionalfields",   // No I18N
                canEdit: canEdit,
                skipEditFields: options.skipEditFields,
                mode: "view",  // No I18N
                formid: stageName+"_formid",   // No I18N
                edit: {
                    defaults: {
                        lookup:{
                            placeholder:translate('sdp.change.sla.select')
                        }
                    },
                },
                save: {
                    postsuccess: function (data,form) {

                        if(_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)){
                            _self.reinitDetailsComponent();
                        }else{
                            _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        }
                    }
                }
            };
            configObj && (jQuery.extend(true, configJSON, configObj));
            var instance = "$"+stageName+"_additionalfields_FC";
            _self[instance] = _self.initFormComponent(configJSON);
        }else{
            jQuery("#"+stageName+"_additionalfields").html('<div id="no_additional_fields" class="alert-nodata mb20" role="alert"><span class="msg">'+translate('sdp.change.noadditionalfields')+'</span></div>');
        }
    },

    //Call field validation of respective field on field change
    ChangeFieldValidation:function(fieldName,formComp){
        if(formComp.validateField(fieldName.name))
        {
            const spanElement=document.querySelector('span[for="'+fieldName.name+'"]');//No I18N
                if (spanElement) {
                    spanElement.remove();
                }
        }
    },
    /**
     * Modify stage config for details component, if user dont have stage view permission
     */
    modifyStageConfig: function(opt){
        var _self = this;
        jQuery.each(_self.stagePermissions, function(stageName, stageObj){
            if(stageName != "global" && !stageObj.view){
                var settings = {
                    header_name: opt.panel_details.content_panel.tabs_panel.settings.stages.settings[stageName].header_name,
                    renderfunction: _self.afterTabRender,
                    HTML: '<div class="alert-nodata" role="alert"><span class="msg">'+translate("sdp.change.stage.nopermissionmsg")+'</span></div>',
                    show: true
                };
                opt.panel_details.content_panel.tabs_panel.settings.stages.settings[stageName] = settings;
            }
        });
    },

    /**
     Returns the tabs for respective stages to be shown under details panel of Details Component
     */
    getAllowedTabs : function(stage){
        var _self = this;
        var allowedTabs = [], stageTabs = {};
        let allowed_stages = Object.keys(_self.stagesObject);
        if(allowed_stages.indexOf(stage) >-1){
            stageTabs = {
                "Submission" : ["details","schedule","tasks","notes",  "status_comments"], // No I18N
                "Planning" : ["details","schedule", "tasks","notes",  "associations", "status_comments"], // No I18N
                "Approval" : ["details", "tasks","notes", "status_comments"], // No I18N
                "Implementation" : ["details", "tasks","notes","associations", "status_comments"], // No I18N
                "UAT" : ["details","schedule", "tasks","notes",  "status_comments"], // No I18N
                "Release" : ["details", "schedule", "tasks","notes","associations","status_comments"], // No I18N
                "Review" : ["details", "schedule","tasks", "notes", "status_comments"], // No I18N
                "Close" : ["details", "tasks", "notes", "status_comments"] // No I18N
            };
            var stageId=this.stagesObject[stage].id;
            var permission = _self.getAssociationPermission();

            if(_self.printPreview){
                allowedTabs.push(stageTabs[stage][0]);
                var scheduleTabs=["Submission","Planning","UAT", "Release", "Review"];// No I18N
                if(scheduleTabs.indexOf(stage)>-1){
                    allowedTabs.push("schedule");
                }
                if((stage == "Planning" && (permission.canViewProblem || permission.canViewinitiated_by_requests || permission.canViewinitiated_requests)) || (stage == "Implementation" && permission.canViewProject) || (stage == "Release" && permission.canViewRelease)){
                    allowedTabs.push("associations");
                }
                if(stage == "Approval" && !_self.isNonLogin){ // No I18N
                    allowedTabs.push("approvals");
                }

            }else{
                if(this.stagesWithApprovals.contains(stageId) || 'Approval'==stage ||!_self.entity_data.workflow)
                {
                    // Inorder to maintain order following stages have associations coming after approvals tab
                    if(stage === 'Planning' || stage === 'Implementation' || stage === 'Release'){
                        stageTabs[stage].splice(stageTabs[stage].length-2,0,'approvals');
                    }
                    else{
                    stageTabs[stage].splice(stageTabs[stage].length-1,0,'approvals');
                }
                }
                //Remove association tab if there is no permission for module
                if((stage == "Planning" && !permission.canViewProblem && !permission.canViewinitiated_by_requests && !permission.canViewinitiated_requests) || (stage == "Implementation" && !permission.canViewProject) || (stage == "Release" && !permission.canViewRelease)){
                    var index = stageTabs[stage].indexOf("associations");
                    stageTabs[stage].splice(index,1);
                }
                allowedTabs = stageTabs[stage];
            }
        }else if(stage == "history"){ // No I18N
            allowedTabs = ["history", "status_comments", "approval_history"]; // No I18N
        }
        return {allowedTabs : allowedTabs};
    },
    /**
     Returns the path for respective # sections used in history
     */
    getTabPathHash : function(hash){
        var params = this.getHashParams(hash), objectPath = "content_panel.tabs_panel.settings"; // No I18N
        if(params.length > 1){
            if(params[0] != "history"){
                objectPath += ".stages.settings"; // No I18N
            }
            objectPath += "."+params[0]+".settings."+params[1];
        }else{
            objectPath += "."+params[0];
        }
        return objectPath;
    },
    /**
     * On click handling for all Actions
     */
    invokeActions: function(actionName){
        var _self = this;
        switch(actionName){
            case "send_notification" :    // No I18N
                var user_fetch = {};
                user_fetch.url = _self.base_url+ "/" +_self.id + '/change_requester';    //No I18N
                user_fetch.lookup_field = 'change_requester';   //No I18N
                user_fetch.search_keys = ['email_id'];   //No I18N
                $notification_popup.openNotificationForm({
                    template_type: "Notify_Change",   //No I18N
                    type: "notify_change",   //No I18N
                    module: _self.entity_name,
                    module_id: _self.id,
                    afterNotificationSent: function(){$rc.$convComp && $rc.$convComp.reinitialize();},
                    user_fetch: user_fetch,
                    imgParameters: {module: _self.entity_name +"_notification", withURL: false, noForm: true}  //No I18N
                });
                break;
            case "downtime" :   // No I18N
                if ($rc.activeStage === 'Release') { // No I18N
                    $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Release/schedule"), function() { // No I18N
                        setTimeout(function() {
                            $rc.downtime.showDowntimeForm();
                        }, 100);
                    });
                } else {
                    $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/schedule"), function() { // No I18N
                        setTimeout(function() {
                            $rc.downtime.showDowntimeForm();
                        }, 100);
                    });
                }
                break;
            case "note" :   // No I18N
                _self.initConversationForQuickAddNote();
                break;
            case "impact_details":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/details"),function(){   // No I18N
                    setTimeout(function(){
                        $rc.$impact_details_PC.showEditTemplate();
                    },100);
                });
                break;
            case "roll_out_plan":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/details"),function(){   // No I18N
                    setTimeout(function(){
                        $rc.$roll_out_plan_PC.showEditTemplate();
                    },100);
                });
                break;
            case "back_out_plan":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/details"),function(){   // No I18N
                    setTimeout(function(){
                        $rc.$back_out_plan_PC.showEditTemplate();
                    },100);
                });
                break;
            case "checklist":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/details"),function(){   // No I18N
                    setTimeout(function(){
                        $rc.$checklist_PC.showEditTemplate();
                    },100);
                });
                break;
            case "review":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Review/details"),function(){   // No I18N
                    setTimeout(function(){
                        $rc.$review_details_PC.showEditTemplate();
                    },100);
                });
                break;
            case "request_association":   // No I18N
            case "problem_association":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Planning/associations"));  // No I18N
                break;
            case "project_association":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Implementation/associations"));  // No I18N
                break;
            case "release_association":   // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Release/associations"));  // No I18N
                break;
            case "reminders": // No I18N
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#reminders"));  // No I18N
                break;
            case "worklogs": // No I18N
                jQuery('[aria-label="Actions"]').parent().removeClass("open");
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#worklogs"),function(){   // No I18N
                        setTimeout(function(){
                $tasks.loadWorkLog('form', 'change', _self.id); //NO I18N
                        },100);
                });
                break;
            case "addtask":// No I18N
                jQuery('[aria-label="Actions"]').parent().removeClass("open");
                $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#tasks"),function(){   // No I18N
                    setTimeout(function(){
                        $tasks.loadTasks('form', 'change', _self.id); //NO I18N
                    },100);
                });
                break;
        }
    },
    /**
     * Get Attachment fields in a stage
     * Return Promise
     */
    getAttachmentFields: function(stageId){
        var _self = this;
        var stageData = {};
        var inputObject = {"list_info":{"search_criteria":{"field": "stage", "condition": "is","value": stageId,}}}; // No I18N
        var dataval = sdpAjaxInputData(inputObject);
        return new Promise(function(resolve, reject){
            sdpAjax({
                url: _self.base_url+ "/" +_self.id+ "/attachment_fields", // No I18N
                data: dataval
            }).then(function(resp){
                if(resp.response_status && resp.response_status[0].status === "success"){
                    resolve(resp.attachment_fields);
                }
            });
        });
    },

    /**
     *Get all downtimes for the change
     *@param:callback
     */
    getDowntimes: function(callback){
        var downtimes={};
        var inputData = {"stage":$rc.getActiveStageTab()};   //No I18N
        sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/downtimes", // No I18N
            type: "GET", // No I18N
            data: sdpAjaxInputData(inputData),
            success: function(resp){
                if(resp.response_status && resp.response_status[0].status == "success"){
                    callback(resp.downtimes);
                }
            },
            async: false
        });
        return downtimes;
    },

    /**
     Fetches stage names which has approval levels configured in workflow
     */
    getStagesWithApprovals : function(){ //Fetches stages with approval levels

        var wfId=this.entity_data.workflow?this.entity_data.workflow.id:undefined;
        var stages=[];
        if(wfId)
        {
            sdpAjax({
                url: "/api/v3/workflows"+ "/" +wfId+"/"+"stages_with_approvals", //No I18N
                type: "GET", // No I18N
                success: function(resp){
                    if(resp.response_status && resp.response_status.status == "success"){
                        stages = resp.stages_with_approvals.stages;
                    }
                },
                async: false
            });
        }

        return stages;
    },

    /**
     * Renders status change comment dialog box
     */
    showStatusChangeCommentDialog: function(statusId, status, actionName){
        var _self = this;
        status && (status = escape(window.decodeURIComponent(status)));
        actionName && (actionName = window.decodeURIComponent(actionName));
        var templateData = {id: statusId, name: status, action_name: actionName};
        var html = renderhbs(null,"statuschangecomment_template", templateData, false, "change", true, true, null, true);  //NO I18N
        _self.statusCommentDialog(html);
        if(!_self.isCommentsMandatory(_self.template)){
            jQ('#CloseEntity .mandatory.ml4').addClass('hide');//NO I18N
        }
    },


    afterHeaderPanelRender: function(){
        if(this.printPreview)
        {
            jQ("#header_panel_printcontainer div.print-subtitle").remove();//NO I18N
        }
        let activewindow = $extFrame.getActiveWindow() || window.top;
        if(this.printPreview && activewindow.jQuery("#_DIALOG_CONTENT").find("#OperationStatus").is(":visible")){
            activewindow.closeProgressIndicator(translate("sdp.common.processcomp"));  //NO I18N
        }
    },
    /**
     * Actions - close(complete/cancel) release
     * @status - values can be completed/cancelled
     */
    changeStatus: function (status, statusId, action) {
        var _self = this;
        status = unescape(status);
        var comment = jQuery("#closercomment").val();
        var mandatory = _self.isCommentsMandatory(_self.template);
        if(comment.trim() === "" && mandatory){
            //Used to show error message at the bottom of the text-area. Similar to schedule data error messages.
            jQuery(document.getElementById("bottom-error-message")).removeClass('hide');
            jQuery("#closercomment").focus();
            return;
        }
        jQuery("#close_save").prop("disabled",true);  //No I18N
        if(action == "close"){
            var url = _self.base_url+ "/" +_self.id+ (_self.isChangeModule ? "/close_change" : "/close"); //TODO
            var data = { status: status, comment: comment };

        }else{
            var url = _self.base_url+ "/" +_self.id;
            var data = {};
            data[_self.entity_name] = {
                status: {id: statusId},
                comment: comment
            };
        }

        var inputData = sdpAjaxInputData(data);
        sdpAjax({
            url: url,
            type: "PUT",  // No I18N
            data: inputData,
            success: function(resp){
                if(resp.response_status && resp.response_status.status === "success" || (jQuery.isArray(resp.response_status) && resp.response_status[0].status === "success")){
                    showalert("success", translate("api.updated.success", [e_html(_self.display_name)]), "isAutoHide=true");  //No I18N
                    jQuery('#CloseEntity').dialog('close'); // No I18N
                    _self.isStageChanged = true;
                    _self.reinitDetailsComponent();
                }
            },
            error: function(){
                jQuery("#close_save").prop("disabled",false);  //No I18N
            },
            failedCallBack: function(jqXHR, status){
                var resp = jqXHR.responseJSON;
                if(resp.response_status && resp.response_status.messages){
                    if(resp.response_status.messages[0].field && typeof resp.response_status.messages[0].field === 'string') {
                        var errmsg = e_html(resp.response_status.messages[0].message) + " : <strong>" + e_html(jqXHR.responseJSON.response_status.messages[0].field) + "</strong>";	//No I18N;
                        window.showalert("failure", errmsg, "isAutoHide=false");	//No I18N
                    }else{
                        window.showalert("failure", e_html(resp.response_status.messages[0].message), "isAutoHide=false");	//No I18N
                    }
                }
            },
            ignorefailuremessage: true
        });
    },

    // This method returns whether comments are mandatory or not.
    isCommentsMandatory: function(template) {
        var fields = template.layouts[0].sections[0].fields;
        for(var i=0;i<fields.length;i++){
            if(fields[i].name === 'comment'){
                return fields[i].mandatory;
            }
        }
    },

    // This method is used to get_properties of a change.
    getPropertiesOfChange: function() {
        var self = this;
        sdpAjax({
            url: self.base_url+ "/" +self.id+ "/get_properties", // No I18N
            success: function(resp) {
                self.changeProperties = resp.change;
                self.changeConfigurations = resp.change.moduleConfigs;
            },
            async:false
        });
    },

    isConfigEnabled: function(category, parameter, configs) {
        var self = this;
        if(self.changeConfigurations) {
            return $rc.changeConfigurations[category][parameter] === "true";
        }
        if(configs) {
            return configs[category][parameter] === "true";
        }
        return false;

    },
}
