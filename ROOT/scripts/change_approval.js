/* $Id$ */
/*  This file has utility functions required for displaying Change Approval page.
 */
var change_approval ={
    /**
     load MLA component
     */
    getApprovals : function(tab, tabObject, tabs_panel){
        var _self = this, key = undefined;
        var stageName = tabs_panel.internal_name;
        var stage = _self.stagesObject[stageName];
        var permissions = _self.stagePermissions[stageName];
        var stageIds = Object.keys(permissions);
        var isCrossedStage = (_self.entity_data.stage.stage_index > stage.stage_index) || (_self.entity_data.stage.internal_name == "close" && (_self.entity_data.status.internal_name ==  "completed" || _self.entity_data.status.internal_name ==  "cancelled")) || false;  //No I18N
        const canApprove = (_self.options.moduleConfigs && _self.options.moduleConfigs.allowUserAsApprover ? (permissions && (permissions.edit || permissions.approve)) : (permissions && permissions.approve));

        var user_fetch = {};
        user_fetch.url = _self.base_url+ "/" +_self.id + '/change_requester';    //No I18N
        user_fetch.lookup_field = 'change_requester';   //No I18N
        user_fetch.search_keys = ['email_id'];   //No I18N

        //SD-115137 - When change is 'Close - Completed' or 'Close - Canceled', the take action button in approval level is shown based on the show_all_approvals configuration.
        var to_show_action_button = true;
        if (_self.entity_data.stage.internal_name === 'Close' && (_self.entity_data.status.internal_name === 'Completed' || _self.entity_data.status.internal_name === 'Canceled')) {
            to_show_action_button = sdp_app.show_all_approvals;
        }

        var params = {
            "entity_name": _self.entity_name_pl,   //No I18N
            "changeId":_self.id,   //No I18N
            "stageId" : stage.id,  //No I18N
            "contentHolderId" : tabObject.containerId, //No I18N
            "isCurrentStage":(_self.activeStage == stageName), //No I18N
            "key":key,   // No I18N
            "edit": !_self.printPreview && permissions && permissions.edit,   //No I18N
            "approve" : !_self.printPreview && canApprove,   //No I18N
            "stageIds":_self.stagesObject, //No I18N
            "isCompletedStage" : isCrossedStage,  //No I18N
            "isNonLogin" : false, //No I18N
            "isAppend" : _self.printPreview,//No I18N
            "approvalRestricted" : (_self.entity_data.workflow || isCrossedStage)? true : false, //Restricting approval addition in case a workflow is configured   // No I18N
            "isWorkflowConfigured" : _self.entity_data.workflow ? true : false,//No I18N
            "isTrashed":_self.entity_data.deleted_time ? true : false ,//No I18N
            "postApprovalAction": function (resp){  //No I18N
                if(resp && ((resp.approval && resp.approval.workflow_update.status === "success") || (resp.approval_level && resp.approval_level.workflow_update.status === "success"))){
                    _self.isStageChanged = true;
                    _self.reinitDetailsComponent();
                }
                if(resp && ((resp.approval && resp.approval.workflow_update.status === "failure") || (resp.approval_level && resp.approval_level.workflow_update.status === "failure"))){
                    showalert("failure", resp.approval_level.workflow_update.msg, "isAutoHide=false"); //TODO  //No I18N
                }

            },
            "user_fetch": user_fetch,   //No I18N
            "to_show_action_button": to_show_action_button,   //No I18N
        };
        _self.$approvals = new MLAComponent(params);
    },
    /**
     Loads Approval details section
     */
    loadApprovalDetails: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var options = {skipFields: ["cab","tasks"]}; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);
    },
    /**
     * Check if pre-approved change and display pre-approved indication in Approval stage and remove all tabs inside Approval stage.
     */
    checkPreApprovedChange: function(opt){
        var _self = this;
        if(_self.entity_data.change_type && _self.entity_data.change_type.pre_approved && Object.hasOwn(_self.stagesObject, "Approval")){
            var settings = {
                header_name: opt.panel_details.content_panel.tabs_panel.settings.stages.settings["Approval"].header_name,
                renderfunction: _self.afterTabRender,
                HTML: '<div class="alert-nodata" role="alert"><span class="msg">'+translate("sdp.change.approvaltab.preapproved.nocontent.msg")+'</span></div>'
            };
            opt.panel_details.content_panel.tabs_panel.settings.stages.settings["Approval"] = settings;
        }
    },
}