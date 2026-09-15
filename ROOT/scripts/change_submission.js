/* $Id$ */
/*  This file has utility functions required for displaying Change submission page.
 */
var change_submission = {

    /**
     Fetches data for details section in submission stage
     */
    loadChangeDetails : function(tabName, tabSetting, tabs_panel){
        var _self = this;
        _self.getTemplateInfo(_self.entity_data.template.id);
        /* Loads description panel section */
        _self.loadDescriptionSection(tabName, tabSetting, tabs_panel);
        /* Load Projects that initiated this Change section*/
        if( !_self.isNonLogin && _self._links && _self._links.projects && _self._links.projects.get){
            _self.checkProjectAssociation();
        }
        _self.loadEntityFields(tabName, tabSetting, tabs_panel);
    },

    /**
     * Loads change Details in submission details tab
     */
    loadEntityFields:function(tabName, tabSetting, tabs_panel){

        var _self = this;
        var skipFields = ["scheduled_start_time","scheduled_end_time","created_time","completed_time","change_requester", "change_owner", "change_manager", "stage", "status", "comment", "title", "description", "attachments"];  //No I18N
        var slaFields = ["impact", "risk", "category", "change_type", "status", "services", "template"];  //No I18N
        if(!sdp_app.IS_CMDB_ENABLED){
            skipFields.push("configuration_items");
        }
        /* entityFields is set in getEntityTemplateData*/
        var entityFields = _self.entityFields;
        entityFields.initFC = function(mode){

            /* Destroy the old instances */
            _self.$entityFields_FC && _self.$entityFields_FC.destroy();
            /* Hide other sections which is in edit mode */
            _self.hidePanelEditor();
            /* Show/hide block edit icon when mode is switched */
            var blockEditId = '[data-id="blockEditRolesFields"]';  //NO I18N
            if(mode == "edit"){
                jQuery(blockEditId).hide();
            }else{
                jQuery(blockEditId).show();
            }

            var stageName = tabs_panel.internal_name;
            var column_count = 2, attachmentSectionIndex = null;
            var options = {skipFields:skipFields};
            options.showRelationshipIcon =  (!_self.printPreview && mode == "view") ? true : false;   //NO I18N
            var template = _self.constructTemplateInfo(stageName, null, column_count, options,mode);
            /* Remove attachment section */
            jQuery.each(template.layouts[0].sections, function(i, section){
                jQuery.each(section.fields, function(j, field){
                    if(field.name === "attachments"){
                        attachmentSectionIndex = i;
                        return false;
                    }
                });
            });

            //Remove color customization and label placement applied in template
            template.style_properties = null;
            /* Add context=udf_fields for the udf fields to render udf field */
            ChangeReleaseForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);
            //Edit icon is hidden in edit mode
            (mode === 'edit') ? jQuery('[data-id="blockEditEntityFields"]').addClass('hide') : jQuery('[data-id="blockEditEntityFields"]').removeClass('hide');

            /* Transform site null from api to Not associated to any site */
            if(_self.entity_data.hasOwnProperty("site")){
                _self.entity_data.site = _self.entity_data.site ? _self.entity_data.site : {"id":-1,"name":translate('common.site.nosite')};//NO I18N
            }

            var skipEditFields = ["site", "group", "sla", "sla_violation"]; // No I18N
            if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewInventoryWS')==false){
                skipEditFields.push("assets");
            }
            if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
                skipEditFields.push("configuration_items");
            }
            //Flag icon to be shown in SLA_Violation when the SLA is violated.
            var template_fields = template.layouts[0].sections[0].fields;
            var hasEditableFields = false;
            for(var i=0; i<template_fields.length;i++){
                var field = template_fields[i];
                if(field.name === 'sla_violation'){
                    field.custom_render = function(){
                        return (_self.entity_data.sla_violation === null)? "-" : (_self.entity_data.sla_violation ? getMessageForKey('sdp.change.submission.yes') + '<img align="absmiddle" class="overdue-icon2 vtop ml5" src="/images/spacer.gif" hspace="2" title="SLA Violated">' : getMessageForKey('sdp.change.submission.no'));//No i18n
                    }
                }
                if(!hasEditableFields && skipEditFields.indexOf(field.name) == -1){
                    hasEditableFields = true;
                }
            }
            if(!hasEditableFields){
                jQuery('[data-id="blockEditEntityFields"]').addClass('hide');
            }

            var fcMode = mode ? mode : "view"; // No I18N
            $CRObj.isCMCO=ChangeReleaseDetails.isCMCO;
            template.layouts[0].sections[0].fields=template.layouts[0].sections[0].fields.filter(field => field.name !== "attachments");
            /* Load FC for details sections*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true,{},_self.entity_data),
                metadata: jQuery.extend(true,{},_self.metainfo),
                container: "changeDetails",// No I18N
                canEdit: entityFields.canEdit,
                editExceptions: ["site", "group", "sla", "sla_violation"], // No I18N
                skipEditFields: skipEditFields,
                skipFields: skipFields,
                mode: fcMode,
                allowedValuesCallback: "$rc.getAllowedValues",//NO I18N
                dependentFields: [{
                    fields: ["category", "subcategory", "item"], // No I18N
                    order: true
                }],
                ffr:{
                    id:template.id,
                    enable:true,
                    entity:"CHANGE",//No i18n
                    toggleMode:(form,event,mode)=>{
                        if(mode=="view"){
                            $rc.entityFields.initFC('edit');// No I18N
                            return false;
                        }
                    },
                    rerender:function(){
                        $rc.entityFields.initFC();
                    },
                    wizard:function(form){
                        if(form.mandatoryFields.length>0){
                            var change_fields={current_value:form.getChangedValues(),tracker:jQuery.extend(true,[],form.event_tracker)};
                            form.destroy();
                            $rc.entityFields.initFC('view');// No I18N
                            $rc.openWizard(change_fields);
                        }
                        else{
                            form.saveInlineEdit(form.form,field.name,event);
                        }
                    }
                },
                edit: {
                    fields: {
                        services:{
                            placeholder:translate('sdp.change.sla.select')
                        },
                        assets:{
                            selection_handler:  "$CRForm.showAssoicateAssetList",//NO I18N
                            selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30")//NO I18N
                        },
                        configuration_items:{
                            selection_handler: "$CRForm.showAssoicateCIList",//NO I18N
                            selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30")//NO I18N
                        }
                    },
                    inline: {
                        pre: _self.hidePanelEditor,
                        services: {
                            post: function() {
                                if(_self.$entityFields_FC) {
                                    _self.$entityFields_FC.fields.services.renderasHTML = false;
                                    _self.$entityFields_FC.fields.services.hideCheckbox = false;
                                    delete _self.$entityFields_FC.fields.services.renderField;
                                }
                            }
                        }
                    },
                    defaults: {
                        lookup:{
                            placeholder:translate('sdp.change.sla.select')
                        }
                    },
                    onchange:$CRObj&&$CRObj.fromPage=="details"?{   //NO I18N
                        status: function (field, form) {
                            form.addMandatoryField("comment");//NO I18N
                            form.fields.comment.disabled = (!(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1));
                        }
                    }:{
                    }
                },
                /*Inline save*/
                save: {
                    postsuccess: function (data,form, fieldName) {
                        //Fix - When release's priority is updated, then announcement priority shows old data only
                        jQuery("#announceDialogDiv").remove();

                        if(_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)){
                            _self.reinitDetailsComponent();
                        }else{
                            _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                            //If schedule end is updated, same should be changed in right panel schedule end
                            var options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                            options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                            _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);
                        }
                        if(fieldName == "services") {
                            form.fields.services.renderasHTML = true;
                            form.fields.services.hideCheckbox = true;
                            form.fields.services.renderField = _self.renderAssetCIShowMoreComponent;
                        }
                        if(slaFields.contains(fieldName)){
                            _self.loadEntityFields(tabName, tabSetting, tabs_panel);
                        }
                        //To reinitialize tooltips of all multiselect fields if any tooltips present after saving inline field edit.
                        initTooltip('p[type=multi_select]'); //No I18N
                    },
                    success: function() { // Upon saving each field in the submission stage, reload the details component so that changes (from custom triggers) are reflected immediately.
                        _self.reinitDetailsComponent();
                    },
                    cancel: function(form, fieldName) {
                        if(fieldName == "services") {
                            form.fields.services.renderasHTML = true;
                            form.fields.services.hideCheckbox = true;
                            form.fields.services.renderField = _self.renderAssetCIShowMoreComponent;
                        }
                        //To reinitialize tooltips of all multiselect fields if any tooltips present after canceling inline field edit.
                        initTooltip('p[type=multi_select]'); //No I18N
                    }
                },
                afterRenderCallback: function(form){    // Rls Detail view mt10 added for each property
                    if(form.mode === "edit"){
                        jQ("#changeDetails .form-footer").addClass("mb30");//No I18N
                    }
                    jQuery("#"+form.container).find(".section-title").addClass("pl0").end()
                        .find(".section-title").not(":first").addClass("mt10");     //NO I18N
                    jQuery("#"+form.container).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N
                }
            };

            if(fcMode === "view"){
                configJSON.linkedFields = configJSON.linkedFields?configJSON.linkedFields.concat(linkedFields):"";
            }
            else if(fcMode == "edit"){

                configJSON.save = {
                    url: _self.base_url+ "/" +_self.id,//NO I18N
                    entity: _self.entity_name,
                    submit: true,
                    cancel: "$rc.entityFields.cancelForm",   // No I18N
                    postserializer: function (data,form) {
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        form.entitydata = data[_self.entity_name];
                    },
                    postsuccess: function (data) {
                        if(_self.checkIfpageNeedsRefresh(data, _self.entity_data)){
                            _self.reinitDetailsComponent();
                        }
                        else{
                        //If schedule end is updated, same should be changed in right panel schedule end
                        var options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                        options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                        _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);

                        _self.entityFields.initFC("view");   // No I18N
                    }
                    }
                };
            }

            jQuery.each(template[_self.entity_name].udf_fields, function(fieldName, fieldVal){
                if(_self.metainfo.fields.udf_fields && (_self.metainfo.fields.udf_fields.fields[fieldName].display_type == "MultiSelect" || _self.metainfo.fields.udf_fields.fields[fieldName].display_type == "CheckBox")){
                    configJSON.edit.fields["udf_fields."+fieldName] = { selection_handler: "$CRForm.showBulkSelect"}; //No I18N
                }
            });
            if(_self.$entityFields_FC && _self.$entityFields_FC.form){
                _self.$entityFields_FC.destroy();
            }

            _self.$entityFields_FC = _self.initFormComponent(configJSON);
        };
        entityFields.cancelForm = function(){
            _self.entityFields.initFC('view');   // No I18N
        };

        _self.entityFields.initFC("view");   // No I18N
    },

    /**
     * Loads description section in the initial stage
     */
    loadDescriptionSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stagename = tabs_panel.internal_name;
        //Description and attachments section displayed using Panel comp
        var opt = {};
        opt.id = _self.id;
        opt.name = _self.entity_name+"_description"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity = _self.entity_name+ "s"; //No I18N
        opt.lookup_entity = _self.entity_name;
        opt.data = _self.entity_data;
        opt.metainfo = _self.metainfo;
        opt.canEdit = _self.stagePermissions[stagename] && _self.stagePermissions[stagename].edit && !_self.printPreview;
        opt.expand = true;
        opt.display_name = _self.metainfo.fields.description.display_name;
        opt.inlineImagesEntity = 'Change';//NO I18N
        opt.container = _self.entity_name+"Description"; // No I18N
        //SD-109502 fix
        opt.detailsHbsTemplate = {template: "entity_description_template", namespace: "panel-component", tooltip: true}; // No I18N
        opt.print_mode = _self.printPreview || false;
        opt.panel = {
            pre_edit: function(){
                _self.entityFields.initFC();
            }
        };
        opt.save = {
            serializer: function(payload){
                //removing image tokens if any, from description img src
                if(payload.description){
                    payload.description = _self.removeImageToken(payload.description);
                }
                return payload;
            },
            postsuccess : function(data){
                //appending the latest image token to img src since data is re-rendered
                if(data.image_token){
                    data.description = appendImageToken(data.description,data.image_token);
                }
                if(_self.checkIfpageNeedsRefresh(data, _self.entity_data)){
                    _self.reinitDetailsComponent();
                }else{
                    _self.entity_data = data;
                }
            }
        };
        opt.attachment={
            description: true,
            rerender: function(data){
                _self.entity_data.attachments = data;
            },
            container: _self.entity_name+"Description_attachment" //No I18N
        };
        if(_self.isNonLogin && opt.data.image_token){
            opt.data.description = appendImageToken(opt.data.description, opt.data.image_token);
        }
        _self.$descriptionPC = new PanelComponent(opt);
    },
    /**
     * submission stage schedule constructor
     */
    loadSubmissionSchedule:function(tabName,tabSetting,tabs_panel,options)
    {
        this.initSchedule = function(mode){
            var _self = this;
            var stageName = tabs_panel.internal_name;
        var canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;

            /* Destroy the old instances */
            _self.$submission_schedule && _self.$submission_schedule.destroy();

            _self.getTemplateInfo(_self.entity_data.template.id);
            var requiredFields=["scheduled_start_time","scheduled_end_time","created_time","completed_time"]; // No I18N
            let column_count="2";
            var template = _self.constructTemplate(requiredFields,column_count,{},mode);
            template.style_properties = {};

            /* Show/hide block edit icon when mode is switched */
            var blockEditId = '[data-id="blockEditRolesFields"]';  //NO I18N
            if(mode == "edit"){
                jQuery(blockEditId).hide();
            }else{
                jQuery(blockEditId).show();
            }

            //Edit icon is hidden in edit mode
            (mode === 'edit') ? jQuery('[data-id="blockEditEntityFields"]').addClass('hide') : jQuery('[data-id="blockEditEntityFields"]').removeClass('hide');

            var fcMode = mode ? mode : "view"; // No I18N
            $CRObj.isCMCO=ChangeReleaseDetails.isCMCO;

            /* Load FC for schedule sections*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true,{},_self.entity_data),
                metadata: jQuery.extend(true,{},_self.metainfo),
                container: "Submission_schedule",// No I18N
                formid:"Submission_schedule_form",// No I18N
                canEdit: canEdit,
                mode: fcMode,
                ffr:{
                    id:_self.entity_data.template.id,
                    enable:true,
                    entity:"CHANGE",//No i18n
                    toggleMode:function(){
                        if(mode=="view"){
                            $rc.initSchedule('edit');// No I18N
                        }
                    },
                    rerender:function(){
                        $rc.initSchedule('view');// No I18N
                     }
                },
                linkedFields : [
                    {
                        fields : ["scheduled_start_time","scheduled_end_time"], //NO I18N
                        denote_field : ["scheduled_end_time"], //NO I18N
                        message : translate("sdp.schedule.validation.key4"), //NO I18N
                        validation: function(valueJson)
                        {
                            if(this.isValueChanged("scheduled_end_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time)
                            {
                                return false;
                            }

                            return true;
                        }
                    },
                    {
                        fields : ["scheduled_start_time","scheduled_end_time"], //NO I18N
                        denote_field : ["scheduled_start_time"], //NO I18N
                        message : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                        validation: function(valueJson)
                        {
                            if(this.isValueChanged("scheduled_start_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time)
                            {
                                return false;
                            }

                        return true;
                    }
                },
                {
                    fields : ["created_time","completed_time"], //NO I18N
                    denote_field : ["created_time"], //NO I18N
                    message : translate("api.validation.createdtime.completedtime"), //NO I18N
                    validation: function(valueJson)
                    {
                        if(this.isValueChanged("created_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time)
                        {
                            return false;
                        }

                        return true;
                    }
                },
                {
                    fields : ["created_time","completed_time"], //NO I18N
                    denote_field : ["completed_time"], //NO I18N
                    message : translate("api.validation.completedtime.createdtime"), //NO I18N
                    validation: function(valueJson)
                    {
                        if(this.isValueChanged("completed_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time)
                        {
                            return false;
                        }

                            return true;
                        }
                    },
                ],
                edit: {
                    fields: {
                        created_time: {
                            allowClear: false
                        }
                    },
                    onchange:{
                        scheduled_start_time:"$rc.ChangeFieldValidation",    //NO I18N
                        scheduled_end_time:"$rc.ChangeFieldValidation",    //NO I18N
                        created_time:"$rc.ChangeFieldValidation",    //NO I18N
                        completed_time: "$rc.ChangeFieldValidation",    //NO I18N
                    }
                },
                save:{
                    postsuccess: function(data, form){
                        _self.reinitDetailsComponent();
                    }
                }
            };

            if(fcMode == "edit"){
                configJSON.ffr.hideFields=requiredFields;
                configJSON.ffr.hideReverse=true;
                configJSON.save = {
                    url: _self.base_url+ "/" +_self.id,//NO I18N
                    entity: _self.entity_name,
                    submit: true,
                    cancel: "$rc.cancelScheduleForm",   // No I18N
                    postserializer: function (data,form) {
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        form.entitydata = data[_self.entity_name];
                    },
                    postsuccess: function (data) {
                        //If schedule end is updated, same should be changed in right panel schedule end
                        var options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                        options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                        _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);

                        _self.initSchedule("view");   // No I18N
                    }
                };
            }
            _self.$submission_schedule = _self.initFormComponent(configJSON);
        };
        var _self=this;
        _self.cancelScheduleForm = function(){
            _self.initSchedule('view');   // No I18N
        };
        _self.initSchedule("view");   // No I18N
    },
}
