/* $Id$ */
/*  This file has utility functions required for displaying change non-login page.
 */
var change_nonlogin ={

    /**
     Returns the metadata for non-login url to display in top as checkbox
     */
    getPrintableSectionsMetaForNonLogin : function(){
        var print_options = {
            "approval" : { // No I18N
                header_name : translate("sdp.approval.action"), // No I18N
                "default" : true, // No I18N
                renderfunction : this.loadnonLoginApprovalSection
            },
            "header_panel":{path : "content_panel.header_panel", // No I18N
                "default" : true // No I18N
            },
            "Submission":{ path : "content_panel.tabs_panel.settings.stages.settings.Submission" // No I18N
            },
            "Planning" : { path : "content_panel.tabs_panel.settings.stages.settings.Planning" // No I18N
            },
            "Approval" : { path : "content_panel.tabs_panel.settings.stages.settings.Approval" // No I18N
            },
            "Implementation" : { path : "content_panel.tabs_panel.settings.stages.settings.Implementation" // No I18N
            },
            "UAT":{ path : "content_panel.tabs_panel.settings.stages.settings.UAT" // No I18N
            },
            "Release" : { path : "content_panel.tabs_panel.settings.stages.settings.Release" // No I18N
            },
            "Review" : { path : "content_panel.tabs_panel.settings.stages.settings.Review" // No I18N
            },
            "Close" : { path : "content_panel.tabs_panel.settings.stages.settings.Close" // No I18N
            },
            "roles" : {path : "content_panel.tabs_panel.settings.roles"}, // No I18N

            "approvalsummary" : {path : "content_panel.tabs_panel.settings.approvalsummary"}, // No I18N
        }
        return print_options;
    },
    setNonLoginInitData:function(options){
        _self=this;
        _self.metainfo=options.metaInfo;
        $CRForm.constructMetaInfo(_self.metainfo.fields);
        _self.metainfo.display_name = _self.display_name;
        _self.entity_data =options.changeObject;
        _self.attToken = options.attachmentToken;
        _self.handleAttachmentDownloadUrl(_self.entity_data);
        _self.isTrashed = _self.entity_data.deleted_time ? true : false;
        _self.constructStage(options.approvalSummaryObject.approval_summary);
        _self.constructApprovalSummary(options.approvalSummaryObject.approval_summary);
        _self.permissionsArray = options.permissionObject;
        _self.stagePermissions = _self.constructPermissions(options.permissionObject);
        if(_self.stagesObject){
            jQuery.each(_self.stagePermissions,function(stage, stagePerm){
                if(_self.stagesObject[stage]){
                    _self.stagesObject[stage].canEdit = stagePerm.edit
                    _self.stagesObject[stage].canView = stagePerm.view
                    _self.stagesObject[stage].canApprove = stagePerm.approve
                }
            });
        }
        _self.template = options.templateObject;
        var layouts = _self.template.layouts;
        for(var i = 0; i < layouts.length; i++) {
            (layouts[i].name==="submission" || layouts[i].name==="Submission") && (_self.submissionLayout = layouts[i]);
            layouts[i].name==="role" && (_self.rolesLayout = layouts[i]);
        }
    },
    loadnonLoginApprovalSection : function(){
        var _self=this;
        var data={
            "from": "home",// No I18N
            "userId":_self.options.userId,// No I18N
            "changeId":_self.options.id,// No I18N
            "approvalId":_self.options.approvalId,// No I18N
            "approvalLevelId":_self.options.approvalLevelId,// No I18N
            "key":_self.options.nonLoginKey,// No I18N
            "portalId":_self.options.portalId,// No I18N
            "name":_self.options.approvalLevelName// No I18N
        };
        renderhbs("#approval_print_content", "appReject-template-nonlogin", data, false, "change", true);  //NO I18N
        jQuery("#appRejectPopup").addClass("fw");
        jQuery("#approval-section").show();

    },
    handleAttachmentDownloadUrl : function(changeObj) {

        if(this.attToken) {
            const fields = ["back_out_plan.attachments", "roll_out_plan.attachments", "impact_details.attachments", "checklist.attachments", "review_details.attachments", "close_details.attachments", "attachments"];

            fields.forEach(field => {
                const [first, second] = field.split('.');
                if(Object.hasOwn(changeObj, first)){
                    const attachments = (second?changeObj[first][second]:changeObj[first]);

                    attachments.forEach(attachment => {
                        attachment.content_url += ("?key=" + this.attToken); //NO I18N
                    });
                }
            });
        }
    }
}