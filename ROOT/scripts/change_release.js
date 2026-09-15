/* $Id$ */
/*  This file has utility functions required for displaying Change Release page.
 */
var change_release ={

    /**
     * Get pre schedule data to construct template
     */
    loadScheduleData: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var downtimeObj = {
            base_url: _self.base_url+ "/" +_self.id+ "/downtimes",
            entity_name: "downtime",// No I18N
            display_name: translate('sdp.change.deployment.details'),
            tableHolder: tabSetting && tabSetting.id ? tabSetting.id : "downtimes", // No I18N
            isNonLogin: _self.isNonLogin
        };
        !_self.isNonLogin && _self.getLinks(downtimeObj.base_url, downtimeObj);
        downtimeObj.stage=stageName;
        if(_self.isNonLogin)
         {//In non-login downtime won't be shown
          return downtimeObj;
         }
         downtimeObj.canEditSchedule = _self.stagePermissions[stageName].edit && !_self.printPreview;
        if(stageName === "Release"){
            downtimeObj.canAdd = false;
            downtimeObj.canEdit = (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.edit && downtimeObj._links.edit.hasOwnProperty("put") && (_self.activeStage == stageName)) && !_self.printPreview && _self.summary.releases.all === 0;
            downtimeObj.canCopy = $rc.activeStage === 'Release' && (downtimeObj._links && downtimeObj._links.copy_scheduled_to_actual && downtimeObj._links.copy_scheduled_to_actual.hasOwnProperty("put"));  // No I18N
            if(!(_self.summary.releases.all === 0))
            {
                downtimeObj.isReleaseAssociated=true;
            }
        }else if(stageName === "Planning"){ // No I18N

            downtimeObj.canAdd = ($rc.activeStage === 'Submission' || $rc.activeStage === 'Planning')&&(_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.add && downtimeObj._links.add.hasOwnProperty("post") && (_self.entity_data.workflow=== null ? true : (_self.stagesObject[stageName].state == "in_progress" || _self.stagesObject[stageName].state == "upcoming") ) && !_self.printPreview );// No I18N
            downtimeObj.canEdit = ($rc.activeStage === 'Submission' || $rc.activeStage === 'Planning')&&(_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.edit && downtimeObj._links.edit.hasOwnProperty("put") && (_self.entity_data.workflow=== null ? true : (_self.stagesObject[stageName].state == "in_progress" || _self.stagesObject[stageName].state == "upcoming") ) && !_self.printPreview );// No I18N
        }
        _self.downtime = downtimeObj;
        return downtimeObj;
    },
        getAllDowntimes: function(downtimeObj,callback){
            let downtimes = {};
            let _self = this;
            const inputObject = {"stage":downtimeObj.stage}; // No I18N
            const dataVal = sdpAjaxInputData(inputObject);
            sdpAjax({
                url: _self.base_url + "/" + _self.id + "/downtimes", // No I18N
                type: "GET", // No I18N
                data: dataVal,
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
     Loads Release details section
     */
    loadReleaseDetails: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var options =  {skipFields: ["release_scheduled_start", "release_scheduled_end","release_actual_start","release_actual_end","descriptive_fields","release_description","downtimes","release_issues","tasks"]}; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);

        _self.loadDescriptiveFieldSection(tabName, tabSetting, tabs_panel);
        !_self.isNonLogin && _self.loadAttachmentField(tabName, tabSetting, tabs_panel);
    },
    /**
     * release stage schedule constructor -release schedules & downtime schedules
     */
    loadReleaseSchedule:function (tabName,tabSetting,tabs_panel)
    {
        var options={};
        options.container = "Release_schedule"; // No I18N
        this.loadReleaseScheduleFields(tabName,tabSetting,tabs_panel,options);
        if(!this.isNonLogin){
            this.loadDownTimeSchedule(tabName,tabSetting,tabs_panel);
        }
    },

    /**
     Loads Release schedule
     */

    loadReleaseScheduleFields: function(tabName, tabSetting, tabs_panel, options){
        this.initSchedule = function(mode,tabName, tabSetting, tabs_panel, options){
            var _self = this;

            var options = options || {onlyUDFFieds: true};

            var stageName = (mode === "edit")?tabs_panel:tabs_panel.internal_name; // No I18N
        var canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;

            if(options === undefined || options.container === undefined) {
                options.container = stageName+"_schedule"; // No I18N
            }

            _self.getTemplateInfo(_self.entity_data.template.id);
            var requiredFields=["release_actual_start","release_actual_end","release_scheduled_start","release_scheduled_end"]; // No I18N
            var skipEditFields=[];
            if(!_self.stagePermissions.hasOwnProperty("Planning") || (_self.stagePermissions["Planning"] && !_self.stagePermissions["Planning"].edit)){
                skipEditFields= ["release_scheduled_start", "release_scheduled_end"];   // No I18N
            }
            var template = _self.constructTemplateInfo(stageName,requiredFields, 2);
            template.style_properties = {};

            /* Destroy the old instances */
            _self["$"+options.container] && _self["$"+options.container].destroy();

            //Edit icon is hidden in edit mode
            (mode === 'edit') ? jQuery('[data-id="blockEditEntityFields"]').addClass('hide') : jQuery('[data-id="blockEditEntityFields"]').removeClass('hide');

            var fcMode = mode ? mode : "view"; // No I18N
            /* Load FC for schedule sections*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true,{},_self.entity_data),
                metadata: jQuery.extend(true,{},_self.metainfo),
                container: options.container,
                formid: options.container+"_form",//NO I18N
                skipEditFields:skipEditFields,
                mode: fcMode,
                canEdit: canEdit,
                edit:{
                    onchange:{
                        release_scheduled_start:"$rc.ChangeFieldValidation",    //NO I18N
                        release_scheduled_end:"$rc.ChangeFieldValidation",    //NO I18N
                        release_actual_start:"$rc.ChangeFieldValidation",    //NO I18N
                        release_actual_end: "$rc.ChangeFieldValidation",    //NO I18N
                    }
                },
                linkedFields: [
                    {
                        fields : ["release_scheduled_start","release_scheduled_end"], //NO I18N
                        denote_field : ["release_scheduled_start"], //NO I18N
                        message : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("release_scheduled_start") &&  valueJson.release_scheduled_end && valueJson.release_scheduled_start > valueJson.release_scheduled_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["release_scheduled_start","release_scheduled_end"], //NO I18N
                        denote_field : ["release_scheduled_end"], //NO I18N
                        message : translate("sdp.schedule.validation.key4"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("release_scheduled_end") && valueJson.release_scheduled_end && valueJson.release_scheduled_start > valueJson.release_scheduled_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["release_actual_start","release_actual_end"], //NO I18N
                        denote_field : ["release_actual_start"], //NO I18N
                        message : translate("change.schedule.validation.actual1"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("release_actual_start") && valueJson.release_actual_end && valueJson.release_actual_start > valueJson.release_actual_end){
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields : ["release_actual_start","release_actual_end"], //NO I18N
                        denote_field : ["release_actual_end"], //NO I18N
                        message : translate("change.schedule.validation.actual2"), //NO I18N
                        validation: function(valueJson){
                            if(this.isValueChanged("release_actual_end") && valueJson.release_actual_end && valueJson.release_actual_start > valueJson.release_actual_end){
                                return false;
                            }
                            return true;
                        }
                    }],
                save:{
                    onsubmit:function(data,field,event,operation,callback)
                    {
                        if(field.current_value!=null){
                        //if release_scheduled_start or release_scheduled_end falls outside change schedule show warning
                        if((["release_scheduled_start","release_scheduled_end"].indexOf(field.name)>-1))
                        {
                            if((_self.entity_data.scheduled_start_time && field.current_value && field.current_value.value < _self.entity_data.scheduled_start_time.value) || (_self.entity_data.scheduled_end_time && field.current_value && field.current_value.value > _self.entity_data.scheduled_end_time.value)) {
                                $rc.confirmScheduleValue(callback, translate("change.stage.scheduletime.alert", [e_html(field.display_name), e_html(field.display_name)]));//NO I18N
                                return true;
                            }
                            //if release_actual_start or release_actual_end is inside of anyof deployment schedule configured show warning
                            _self.getDowntimes(function (data){
                                for(key in data)
                                {
                                    const deployment_scheduled_start_time=data[key].deployment_scheduled_start;
                                    const deployment_scheduled_end_time=data[key].deployment_scheduled_end;
                                    switch(field.name){
                                        case "release_scheduled_start":  //No I18N
                                            if((deployment_scheduled_start_time && deployment_scheduled_start_time.value<field.current_value.value)||(deployment_scheduled_end_time && deployment_scheduled_end_time.value<field.current_value.value))
                                            {
                                                $rc.confirmScheduleValue(callback,translate("change.stage.actualtime.alert",[e_html(field.display_name),e_html(field.display_name)]) );//NO I18N
                                                return;
                                            }
                                            break;

                                        case "release_scheduled_end":  //No I18N

                                            if((deployment_scheduled_start_time && deployment_scheduled_start_time.value>field.current_value.value)||(deployment_scheduled_end_time && deployment_scheduled_end_time.value>field.current_value.value))
                                            {
                                                $rc.confirmScheduleValue(callback,translate("change.stage.actualtime.alert",[e_html(field.display_name),e_html(field.display_name)]));//NO I18N
                                                return;
                                            }
                                            break;
                                    }

                                }
                                callback();
                            })
                            return true;
                        }
                        else if(["release_actual_start","release_actual_end"].indexOf(field.name)>-1)
                        {
                            //if release_actual_start or release_actual_end is inside of anyof downtime configured show warning
                            _self.getDowntimes(function (data){
                                for(key in data)
                                {
                                    const deployment_actual_start_time=data[key].deployment_actual_start;
                                    const deployment_actual_end_time=data[key].deployment_actual_end;
                                    switch(field.name){
                                        case "release_actual_start":  //No I18N
                                            if((deployment_actual_start_time && deployment_actual_start_time.value<field.current_value.value)||(deployment_actual_end_time && deployment_actual_end_time.value<field.current_value.value))
                                            {
                                                $rc.confirmScheduleValue(callback,translate("change.stage.actualtime.alert",[e_html(field.display_name),e_html(field.display_name)]) );//NO I18N
                                                return;
                                            }
                                            break;

                                        case "release_actual_end":  //No I18N

                                            if((deployment_actual_start_time && deployment_actual_start_time.value>field.current_value.value)||(deployment_actual_end_time && deployment_actual_end_time.value>field.current_value.value))
                                            {
                                                $rc.confirmScheduleValue(callback,translate("change.stage.actualtime.alert",[e_html(field.display_name),e_html(field.display_name)]));//NO I18N
                                                return;
                                            }
                                            break;
                                    }

                                }
                                callback();
                            })
                            return true;


                        }
                        else
                            return false;}

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

                        tabsPanel = {}
                        tabsPanel.internal_name = tabs_panel;
                        _self.initSchedule("view", tabName, tabSetting, tabsPanel, options);   // No I18N
                    }
                };
            }
            _self["$"+options.container] = _self.initFormComponent(configJSON);
        };
        var _self=this;
        _self.cancelScheduleForm = function(){
            _self.initSchedule('view',tabName, tabSetting, tabs_panel, options);   // No I18N
        };
        _self.initSchedule("view",tabName, tabSetting, tabs_panel, options);   // No I18N

    }
}