/* $Id$ */
/*  This file has utility functions required for displaying Change UAT page.
 */
var change_uat ={

    /**
     Loads UAT details section
     */
    loadUATDetails: function(tabName, tabSetting, tabs_panel){

       var _self=this;
        var options = {skipFields: ["uat_scheduled_start", "uat_scheduled_end", "uat_actual_start", "uat_actual_end","descriptive_fields","uat_description","uat_testplan","uat_issues","tasks"]}; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);
        _self.loadDescriptiveFieldSection(tabName, tabSetting, tabs_panel);
        !_self.isNonLogin && _self.loadAttachmentField(tabName, tabSetting, tabs_panel);
    },
    /**
     * UAT stage schedule constructor
     */
    loadUATSchedule:function(tabName, tabSetting, tabs_panel){
        this.initSchedule = function(mode){
            var _self = this;
            var stageName = tabs_panel.internal_name;
        var canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;
            /* Destroy the old instances */
            _self.$uat_schedule && _self.$uat_schedule.destroy();

            _self.getTemplateInfo(_self.entity_data.template.id);
            var requiredFields=["uat_actual_start","uat_actual_end"]; // No I18N
            if(_self.printPreview){
                (_self.entity_data.uat_scheduled_start!==null)?requiredFields.push("uat_scheduled_start"):"";
                (_self.entity_data.uat_scheduled_end!==null)?requiredFields.push("uat_scheduled_end"):"";
            } else {
                requiredFields.push("uat_scheduled_start");
                requiredFields.push("uat_scheduled_end");
            }
            var template = _self.constructTemplateInfo(stageName,requiredFields, 2);
            template.style_properties = {};

            //Edit icon is hidden in edit mode
            (mode === 'edit') ? jQuery('[data-id="blockEditEntityFields"]').addClass('hide') : jQuery('[data-id="blockEditEntityFields"]').removeClass('hide');

            var fcMode = mode ? mode : "view"; // No I18N
            /* Load FC for details sections*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true,{},_self.entity_data),
                metadata: jQuery.extend(true,{},_self.metainfo),
                container: "uat_schedule",// No I18N
                formid: "uat_schedule_form",// No I18N
                mode: fcMode,
                canEdit: canEdit,
                edit:{
                    onchange:{
                        uat_scheduled_start:"$rc.ChangeFieldValidation",    //NO I18N
                        uat_scheduled_end:"$rc.ChangeFieldValidation",    //NO I18N
                        uat_actual_start:"$rc.ChangeFieldValidation",    //NO I18N
                        uat_actual_end: "$rc.ChangeFieldValidation",    //NO I18N
                    }
                },
                linkedFields: [
                    {
                        fields : ["uat_scheduled_start","uat_scheduled_end"], //NO I18N
                        denote_field : ["uat_scheduled_start"], //NO I18N
                        message : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("uat_scheduled_start") && valueJson.uat_scheduled_end && valueJson.uat_scheduled_start > valueJson.uat_scheduled_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["uat_scheduled_start","uat_scheduled_end"], //NO I18N
                        denote_field : ["uat_scheduled_end"], //NO I18N
                        message : translate("sdp.schedule.validation.key4"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("uat_scheduled_end") && valueJson.uat_scheduled_end && valueJson.uat_scheduled_start > valueJson.uat_scheduled_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["uat_actual_start","uat_actual_end"], //NO I18N
                        denote_field : ["uat_actual_start"], //NO I18N
                        message : translate("change.schedule.validation.actual1"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("uat_actual_start") && valueJson.uat_actual_end && valueJson.uat_actual_start > valueJson.uat_actual_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["uat_actual_start","uat_actual_end"], //NO I18N
                        denote_field : ["uat_actual_end"], //NO I18N
                        message : translate("change.schedule.validation.actual2"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("uat_actual_end") && valueJson.uat_actual_end && valueJson.uat_actual_start > valueJson.uat_actual_end){
                                return false;
                            }
                            return true;
                        }
                    }],
                save: {
                    onsubmit: function (data, field, event, operation, callback) {
                        //if uat_scheduled_start or uat_scheduled_end falls outside change schedule show warning
                        if ((["uat_scheduled_start", "uat_scheduled_end"].indexOf(field.name) > -1) && ((_self.entity_data.scheduled_start_time && field.current_value.value < _self.entity_data.scheduled_start_time.value) || (_self.entity_data.scheduled_end_time && field.current_value.value > _self.entity_data.scheduled_end_time.value))) {
                            $rc.confirmScheduleValue(callback, translate("change.stage.scheduletime.alert",[e_html(field.display_name),e_html(field.display_name)]));//NO I18N
                            return true;
                        }
                        return false;
                    },
                    postsuccess: function(data, form){
                        if(_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)){
                            _self.reinitDetailsComponent();
                        }else{
                            _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        }
                    }
                }
            };

            if(fcMode == "edit"){

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
            _self.$uat_schedule = _self.initFormComponent(configJSON);
        };
        var _self=this;
        _self.cancelScheduleForm = function(){
            _self.initSchedule('view');   // No I18N
        };
        _self.initSchedule("view");   // No I18N
    },
}