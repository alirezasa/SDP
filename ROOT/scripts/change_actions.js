
/* $Id$ */
/*  This file has utility functions required for displaying Change actions menu.
 */
var change_actions = {
    /**
     confirmation dialogue for SDCM when change has assigned CM
     */
    callChangeEditMode: function() {

        showconfirm(true,
            "title=" + translate("sdp.change.actions.edittext") + "," + //No I18N
            "message=" + translate("sdp.change.edit.sdchangemanager.confirm") + "," + //No I18N
            "submitbutton=" + translate("common.proceed") + "," + //No I18N
            "cancelbutton=" + translate("common.no") + "," + //No I18N
            "closebutton=yes," + //No I18N
            "closeOnEscKey=yes",//No I18N
            function(conf) {
                if(conf) {
                    window.history.replaceState({'forwardTo' : "detail","module" : "change","spa_skipstate" : true}, '', '/ui/changes?entity_id='+_self.entity_data.id+'&mode=detail#roles'); // No I18N
                    _self.$detailsComp.tabContentRender("roles", _self.$detailsComp.options.panel_details.content_panel.tabs_panel.settings.roles, _self.$detailsComp.options.panel_details.content_panel.tabs_panel); // No I18N
                }
            }
        );
    },
    /**
     * Delete an entity
     */
    deleteChange: function(){
        var _self = this;
        var move_to_trash = (_self._links.move_to_trash && _self._links.move_to_trash["delete"]) ? true : false;
        _self.fetchEntitySummary();
        var isChangeProjectAssociated = (_self._links.hasOwnProperty('projects') && _self._links.projects.hasOwnProperty('get') && _self.summary && _self.summary.projects && _self.summary.projects.initiated_by_change > 0) ? true : false; // No I18N
        var isCancelChecked = false;
        jQuery('body').on('change','[name=cancelProjectAsso]',function(){
            isCancelChecked = jQuery("#cancelProjectAsso").is(":checked");  // No I18N
        });
        var delete_Entity = function(confirm){
            if(confirm){
                var url = move_to_trash ? _self.base_url+ "/" +_self.id+ "/move_to_trash" : _self.base_url+ "/" +_self.id;
                var data = "";
                if(move_to_trash){
                    data = sdpAjaxInputData({
                        "cancel_associated_projects": isCancelChecked  // No I18N
                    })
                }
                sdpAjax({
                    url: url,
                    type: "DELETE",  // No I18N
                    data: data,
                    success: function(resp) {
                        if(resp.response_status && resp.response_status.status == "success"){
                            var successmsg = _self.isTrashed ? translate("api.deleted.success", [e_html(_self.display_name)]) : translate("api.trashed.success",[e_html(_self.display_name)]);
                            showalert("success", successmsg , "isAutoHide=true");  //No I18N
                            jQuery("#goback_changelist > span").trigger("click"); //No I18N
                        }
                    }
                });
            }
        };
        var title = _self.isTrashed ? translate("sdp.common.delete.permanent") : translate("sdp.project.change.association.deleteconfirmation");
        var message = _self.isTrashed ? translate("common.delete.permanent.confirm.message", [e_html(_self.display_name)]) : translate("sdp.change.error.trashchangeconfirm");
        var content = message+'<div class="disp-t text-color4 mt20 w-450px"><div class="disp-c pos-rel"> <label class="cur-ptr checkbox-inline disp-b ml0 mb10" for="cancelProjectAsso"> <input type="checkbox" value="1" id="cancelProjectAsso" name="cancelProjectAsso">'+translate("sdp.change.associate.project.delete")+'</label>  </div></div>';
        showconfirm(true,'title='+title+', message='+(isChangeProjectAssociated ? content : message)+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',delete_Entity, true); //No I18N

    },
    /**
     * Copy change dialog will be shown, contains help content
     */
    showCopyDialog: function(){
        var _self = this;
        var asset = (sdp_app.IS_ASSET_MODULE?translate("sdp.itil.common.asset")+",":"")
        var site = (sdp_app.IS_SITE_CONFIGURE?translate("sdp.helpdesk.common.site")+",":"");

        var templateData = [{stage: "Submission",content: translate("sdp.change.copy.fieldstobecopied.submissionfields", [site, asset])},  //NO I18N
            {stage: "Planning",content: translate("sdp.change.copy.fieldstobecopied.planningfields")},  //NO I18N
            {stage: "CAB Evaluation",content: translate("sdp.change.copy.fieldstobecopied.approvalfields")},  //NO I18N
            {stage: "Implementation",content: translate("sdp.change.copy.fieldstobecopied.implementationfields")},  //NO I18N
            {stage: "UAT",content: translate("sdp.change.copy.fieldstobecopied.uatfields")},  //NO I18N
            {stage: "Release",content: translate("sdp.change.copy.fieldstobecopied.releasefields")},  //NO I18N
            {stage: "Review",content: translate("sdp.change.copy.fieldstobecopied.reviewfields")},  //NO I18N
            {stage: "Close",content: translate("sdp.change.copy.fieldstobecopied.reviewfields")}];  //NO I18N
        let resultTemplateData = [];
        templateData.forEach(function(item,i){
            if(_self.stagesObject.hasOwnProperty(item.stage)){
                resultTemplateData.push(item);
            }
        });
        let helpContent = renderhbs(null,"copy_template", resultTemplateData, false, "change", true, true, null, true);  //NO I18N
        jQuery("#copyChangeForm").html(helpContent);
        jQuery("#copyChangeForm").dialog({  //No I18N
            modal: true,
            closeOnEscape: false,
            draggable: true,
            position: { my: 'center', at: 'center' }, //No I18N
            width: "650",   // No I18N

            close:function(){
                        jQuery("#copyChangeForm").empty();
                        jQuery("#copyChangeForm").dialog("destroy");//No I18N
            },
            title: translate("sdp.change.copy.dialogName") // No I18N
        });
    },
    /**
     * Copying a change
     */
    copyChange: function(ele){
        jQuery(ele).prop("disabled",true); // No I18N
        jQuery('#copy_change_load').show();
        var _self = this;
        sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/copy", // No I18N
            type: "POST", //No I18N
            //ignorefailuremessage: true,
            success: function(resp) {
                jQuery('#copy_change_load').hide();
                if(resp.response_status && resp.response_status.status && resp.response_status.status == "success"){
                    showalert("success", translate("sdp.copy.change.successmessage"), "isAutoHide=true"); //NO I18N
                    setTimeout(function(){ window.location.href= "/ui/changes?entity_id=" +resp.change.id+ "&mode=detail";},3000);
                }
            },
            error: function(resp){
                jQuery('#copy_change_load').hide();
                resp = resp.responseJSON;
                if(resp.response_status && resp.response_status.messages){
                    showalert("failure", resp.response_status.messages[0].message+":"+resp.response_status.messages[0].field, "isAutoHide=false"); //NO I18N
                }
            }
        });
    },
}