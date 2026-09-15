/* $Id$ */
/*  This file has utility functions required for panel component in change details page.
 */
var change_panelcomponent_helper ={
    /**
     * Render attachment field section
     */
    loadAttachmentField: function(tabName, tabSetting, tabs_panel) {
        var _self = this;
        var stageId = _self.stagesObject[tabs_panel.internal_name].id;
        var stageName = tabs_panel.internal_name;
        //Check if user has permission to add attachments in attachement field section
        var canEdit = (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview) || false;
        /* Load attachment fields section */
        var renderAttachment = function(field){
            var option ={
                id: field.id,
                name: field.internal_name,
                data: field,
                canEdit : canEdit,
                attachment : {
                    description: true,
                    titleText: field.name ? field.name : translate("sdp.common.attachments"),
                    container: field.internal_name,
                    showNoattachment: _self.isTrashed || !canEdit ? true : false
                }
            };
            _self.$attachmentFieldPC = _self.initAttachmentField(option,stageId);
        };

        _self.getAttachmentFields(stageId)
            .then(function (data) {
                jQuery.each(data,function(i, field){
                    jQuery("#"+stageName+"_attachmentfields").append('<div id='+field.internal_name+' class="mb30"></div>');

                    if(field.has_attachments){
                        sdpAjax({
                            url: _self.base_url+ "/" +_self.id+ "/attachment_fields/" + field.id // No I18N
                        }).then(function(data){
                            if(data.response_status && data.response_status.status == "success"){
                                renderAttachment(data.attachment_field);
                            }
                        });
                    }
                    else{
                        /* Hide Attachment fields if not attachments in print preview*/
                        if(!_self.printPreview){
                            field.attachments = [];
                            renderAttachment(field);
                        }
                    }

                });
            });
    },

    /**
     * Initialises the Panel component for rendering attachment fields sections
     */
    initAttachmentField: function(option,stageId){
        var _self = this;
        var opt = {};
        opt.name = "attachmentFields"; //No I18N
        opt.base_url = _self.base_url+ "/" +_self.id; //No I18N
        opt.entity = "attachment_fields"; //No I18N
        opt.lookup_entity = "attachment_field";    //No I18N
        opt.canEdit = false;
        opt.description = false;
        opt.save = {
            serializer: function(payload, pc){
                payload.stage = {id: stageId};
            },
            postsuccess:function(data, pc){
            }
        };
        jQuery.extend(true, opt, option);
        return new PanelComponent(opt);
    },

    /**
     * Get descriptive field for loading section
     */
    getDescriptiveField: function(stageId){
        var _self = this;
        var inputObject = {"list_info":{"search_criteria":{"field": "stage", "condition": "is","value": stageId,}},include : ["image_token"]}; // No I18N
        var dataval = sdpAjaxInputData(inputObject);
        if(_self.isNonLogin){
            var descriptive_field = (stageId === _self.options.changeObject.uat_description.stage.id) ? [_self.options.changeObject.uat_description] : [_self.options.changeObject.release_description];
            var resp = {
                descriptive_fields: descriptive_field,
            }
            return resp;
        }
        return sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/descriptive_fields", // No I18N
            data: dataval,
        });
    },
    /**
     * Load descriptive field section in uat & release stage
     */
    loadDescriptiveFieldSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageId = _self.stagesObject[tabs_panel.internal_name].id;
        var stageName = tabs_panel.internal_name;
        var canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit  && !_self.printPreview && !_self.isTrashed;

        var renderDescriptiveSection = function(fieldData){
            var opt = {};
            opt.id = fieldData.id;
            opt.base_url = _self.base_url+ "/" +_self.id; //No I18N
            opt.name = opt.entity = "descriptive_fields"; //No I18N
            opt.lookup_entity = "descriptive_field";  //No I18N
            opt.data = fieldData;
            opt.canEdit = canEdit;
            opt.expand = true;
            opt.display_name = _self.metainfo.fields.description.display_name;
            opt.metainfo = _self.metainfo;
            opt.container = stageName+"_descriptivefield"; // No I18N
            opt.detailsHbsTemplate = {template: "panel_template", namespace: "panel-component", tooltip: true}; // No I18N
            opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";   // No I18N
            opt.print_mode = _self.printPreview || false;
            opt.attachment = false;
            opt.save = {
                serializer: function(payload, pc){
                    //removing image tokens if any, from description img src
                    if(payload.description){
                        payload.description = _self.removeImageToken(payload.description);
                    }
                    return payload;
                },
                postsuccess:function(data, pc){
                    if(data.image_token){
                        data.description = appendImageToken(data.description,data.image_token);
                    }
                    //re-render details page inorder to see the workflow execution on condition node with descriptive fields.
                    _self.reinitDetailsComponent();
                }
            };
            var instance = "$"+stageName+"_descriptivefield_PC";
            _self[instance] = new PanelComponent(opt);
        }
        if(_self.isNonLogin){
            var descriptiveField = {};
            var resp = _self.getDescriptiveField(stageId);
            resp.descriptive_fields.length == 1 && (descriptiveField = resp.descriptive_fields[0]);
            if(descriptiveField && descriptiveField.image_token){
                descriptiveField.description = appendImageToken(descriptiveField.description,descriptiveField.image_token);
            }
            renderDescriptiveSection(descriptiveField);
        } else {
            _self.getDescriptiveField(stageId).then(function (resp) {
                var descriptiveField = {};
                resp.descriptive_fields.length == 1 && (descriptiveField = resp.descriptive_fields[0]);
                if (descriptiveField && descriptiveField.image_token) {
                    descriptiveField.description = appendImageToken(descriptiveField.description, descriptiveField.image_token);
                }
                renderDescriptiveSection(descriptiveField);
            });
        }
    },
}