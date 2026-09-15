/* $Id$ */
/*  This file has utility functions for change add/edit page.
    $CRForm.initialize is invoked from ChangeForm.jsp
 */
var $CRForm = jQuery.extend(true,window.ChangeReleaseForm, (function(){
    return {
        /*Initialize new/edit form */
        isChangeModule : true,
        initialize: function (options) {
            jQuery('body').removeClass('of-h');
            var self = this;
            options.module = 'change'; //No I18N
            self.setProp(options);
            self.fromPage = $CRObj.fromPage;
            Handlebars.registerPartial("rc-header-template", renderhbs(null, "changeform_header_template", null, false, "change", true, true, null, true));	//No I18N

            self.entitydata = null;
            var templateRC = null;
        if(self.editId && self.editId!="null"){
            self.isEditForm = true;
            self.entitydata = self.getEntityAll(self.entityNamePl,self.editId,self.entityName)[0];
            self.entityRefData = jQuery.extend(true, {}, self.entitydata);
            templateRC = self.getEntityAll(self.base_url+'/template', self.entitydata.template.id, self.entityName+'_template')[0];//NO I18N
            self.template = jQuery.extend(true, {}, templateRC);
            isMSP && addAndSetAccountInCombo(self.entitydata.account.id, true, self.entitydata.account.name);
        }
        else if(self.from === "copychange"){
            this.copyproperties = options.copyproperties;
            self.entitydata = options.entitydata;
        }
        else if(self.from){
            var associatedEntityData ;
            if(self.from == "problem") //NO I18N
                {
                        associatedEntityData=window.top.$problemDetails.entity_data;
                }
            else if(self.from == "cmdb"){
                associatedEntityData = self.getEntityAll(self.from, self.associatedEntityId, self.from)[0];
            }
            else if(this.from !== "copychange"){
            associatedEntityData= self.getEntityAll(self.from + "s", self.associatedEntityId, self.from)[0];
            }
            var keysToSync = [];
                if (self.from == "problem") { //NO I18N
                    keysToSync = ["impact", "category", "subcategory", "item", "title", "description", "priority", "urgency", "site", "associated_asset", "affected_service","configuration_items"];//NO I18N
                } else if (self.from == "request") { //NO I18N
                    keysToSync = ["impact", "category", "subcategory", "item", "subject", "description", "priority", "urgency", "site", "group", "assets", "service_category", "requester","configuration_items"];//NO I18N
                } else if (self.from == "project") { //NO I18N
                    keysToSync = ["title", "description"]; //NO I18N
                }
                else if (self.from == "cmdb") {
                 keysToSync = ["name"];
                }
                self.overWriteEntitydata = {};
                for (var index = 0; index < keysToSync.length; index++) {
                    var key = keysToSync[index];
                    if (key == "associated_asset") {  // Problem module
                        self.overWriteEntitydata["assets"] = associatedEntityData[key];
                    } else if (key == "affected_service") {  // Problem module   //NO I18N
                        self.overWriteEntitydata["services"] = associatedEntityData[key];
                    } else if (key == "service_category" && associatedEntityData[key] != null) {  // Request module
                        var data = [];
                        data.push(associatedEntityData[key]);
                        self.overWriteEntitydata["services"] = data;
                    } else if (key == "requester") { // Request module //NO I18N
                        self.overWriteEntitydata["change_requester"] = associatedEntityData[key];
                    } else if (key == "assets") {  // Request module   //NO I18N
                        //Todo for ci to asset conversion
                        self.overWriteEntitydata["assets"] = associatedEntityData[key];
                    } else if (self.from == "request" && key == "subject") {  // Request module  //NO I18N
                        self.overWriteEntitydata["title"] = associatedEntityData[key];
                    }
                     else if (self.from == "cmdb") {
                                         var ciArray = [];
                                         var ciObject = {
                                             "id": associatedEntityData["id"], //no i18n
                                             "name": associatedEntityData["name"] //no i18n
                                         };
                                         ciArray.push(ciObject);
                                         self.overWriteEntitydata["configuration_items"] = ciArray;
                                        if(!options.templateId){
                        var getData;
                        sdpAjax({
                            url: '/api/v3/changes/template/default_template_with_ci_field', //no i18n
                            success: (resp) => getData = resp,
                            async: false
                        });
                    if (getData && getData.template) {
                        options.templateId = getData.template.id;
                    } else if (!getData.template) {
                        window.showalert('warning', translate('sdp.change.nocifield.template'), "isAutoHide=false"); // No I18N
                    }
                }
                }
                else{
                self.overWriteEntitydata[key] = associatedEntityData[key];
            }
            }
            }
            //In case of associations page we need to load the template based on the templateid passed in options
            if (self.from) {
                self.loadTemplate(options.templateId ? options.templateId : null, self.editId, templateRC, self.entitydata, null, self.overWriteEntitydata ? self.overWriteEntitydata : null);
            } else {
                self.loadTemplate(self.entitydata ? self.entitydata.template.id : null, self.editId, templateRC, self.entitydata, null, self.overWriteEntitydata ? self.overWriteEntitydata : null);
            }
            //Only on edit we need to remove the modified roles
            if (self.editId) {
                self.checkChangeRoles();
            }
            $CRObj.fromPage = "";

            isMSP && self.mspform.initialize();
        },
        /*Load template*/
        loadTemplate: function (templateId, editId, templateRel, entityData, forcesave, overWriteEntitydata) {
            try {

                var self = this;
                if(this.from === "copychange"){
                    templateId = entityData.template.id;
                    var templateRC=self.getEntityAll( self.base_url+'/template/'+templateId,null,self.entityName+'_template')[0] ;//NO I18N
                    if(!templateRC)
                    {
                        showalert("failure", translate("change.copy.error.invalidTemplate") , "isAutoHide=false");//NO I18N
                        return;
                    }
                }
                if(this.from !== "copychange"){
                    var templateRC = templateRel ? templateRel : self.getEntityAll(templateId ? self.base_url + '/template/' + templateId : self.entityName + '_templates/_default', null, self.entityName + '_template')[0];//NO I18N
                }
                self.hasSite = templateRC[self.entityName].hasOwnProperty("site");
                self.modifyTemplateEntityData(templateRC);
                if (self.editId && entityData) {
                    self.metainfo = self.getEntityAll(self.base_url + '/metainfo', null, 'metainfo')[0];//NO I18N
                }
                //Remove created and completed time while opening new page
                var metainfoFields = self.metainfo.fields;
                if (!self.editId) {
                    delete metainfoFields.completed_time;
                    delete metainfoFields.created_time;
                } else {
                    sdpAjax({
                        url: '/api/v3/changes/' + self.editId + '/get_properties', success: function (resp) {  //NO I18N
                            getData = resp;
                        }, async: false
                    });
                    if (getData && getData.change && getData.change.hasRFCEdit == true) {
                        self.canEdit = true;
                        self.moduleConfigs = getData.moduleConfigs;
                    }
                }
                /* Modify metainfo to add some properties for component */
                self.constructMetaInfo(metainfoFields);

                self.constructTemplateInfo(templateRC);
                templateRC[self.entityName].created_time = entityData && entityData.created_time;
                if (overWriteEntitydata) {
                    templateRC[self.entityName] = self.currentTemplateContentFromAssociateEntity(templateRC[self.entityName], overWriteEntitydata)
                }
                entityData = self.selOverwriteId ? self.currentTemplateContent(entityData, templateRC) : entityData;
                //Roles format change
                self.getEditData = entityData ? Object.assign({}, entityData) : Object.assign({}, templateRC[self.entityName]);
                var getEditRoles = self.getEditData.roles;
                if (getEditRoles && getEditRoles.length > 0) {
                    var roleArrTemp = [];
                    for (var i = 0; i < getEditRoles.length; i++) {
                        var temp = getEditRoles[i], obj = {};
                        obj["role"] = {id: temp.role.id};
                        (temp.label_id && temp.label_id == "-1") ? (obj["label_id"] = temp.label_id) : temp.group ? (obj["group"] = {id: temp.group.id}) : (obj["user"] = {id: temp.user.id});//NO I18N
                        temp.id ? obj["id"] = temp.id : null;
                        roleArrTemp.push(obj);
                    }
                    self.getEditData.roles = roleArrTemp;
                }

                var rolesData = entityData ? entityData.roles : (templateRC[self.entityName] && templateRC[self.entityName].roles);
                if (rolesData.length > 0) {
                    var rolesShowUI = self.serializeRolesDataForFC(rolesData, metainfoFields.roles.fields);
                    entityData ? entityData.roles = rolesShowUI : templateRC[self.entityName].roles = rolesShowUI;
                    //Append inactive roles by checking metainfo, to the roles template
                    if (entityData) {
                        var inactiveRoles = [], rolesLayout;
                        jQuery.each(templateRC.layouts, function (i, layout) {
                            if (layout.name === "role") {
                                rolesLayout = layout;
                                return false;
                            }
                        });
                        if(this.from !== "copychange"){
                            inactiveRoles = self.checkInactiveRoles(rolesShowUI, metainfoFields.roles.fields, rolesLayout);
                            inactiveRoles && rolesLayout.sections.push(inactiveRoles);
                        }
                    }
                }
                if (self.editId && entityData) {
                    entityData.site = entityData.site ? entityData.site : {
                        "id": "0", //NO I18N
                        "name": translate('common.site.nosite') //NO I18N
                    };
                    entityData.description = appendImageToken(entityData.description, entityData.image_token);
                } else if (templateId) {
                    templateRC[self.entityName].description = appendImageToken(templateRC[self.entityName].description, templateRC[self.entityName].image_token);
                }
                if (!isMSP && (!self.editId || (self.editId && !entityData && templateId))) {
                    templateRC[self.entityName].site = templateRC[self.entityName].site ? templateRC[self.entityName].site : {
                        "id": "0", //NO I18N
                        "name": translate('common.site.nosite') //NO I18N
                    };
                }
                self.setFAFRkeyForRoles(self.metainfo.fields.roles.fields);
                self.modifyEntityData(entityData);
                isMSP && self.mspform.loadTemplateDetailsForMSP(templateId, editId, templateRel, templateRC);
                //Disable edit for site & group in requester login
                var skipEditFields = (sdp_user.USERTYPE === "Requester") ? ["site", "group"] : [];   // No I18N
                //To skip configuration items in change form when cmdb license is absent.
                var skipFields = ["attachments", "sla", "sla_violation"]; //No i18n
                if(!sdp_app.IS_CMDB_ENABLED){
                    skipFields.push("configuration_items");
                }
                //Issue fix, whenever stage is modified, status is resetting to default status provided in metainfo
                let metaData = jQuery.extend(true, {}, self.metainfo);
                metaData.fields.stage &&  delete metaData.fields.stage.default_value;
                metaData.fields.status &&  delete metaData.fields.status.default_value;
                $CRObj.isCMCO=self.options.isCMCO?self.options.isCMCO:ChangeReleaseForm.isCMCO;

                var configJSON = {
                    name: "rcForm",// No I18N
                    entity: self.entityName,
                    entitypath: "/" + self.entityNamePl,// No I18N
                    template: templateRC,
                    metadata: metaData,
                    skipEditFields: skipEditFields,
                    skipFields: skipFields,
                    entitydata: entityData || templateRC[self.entityName],
                    mode: self.editId ? "edit" : "new",// No I18N
                    container: "rc-container",// No I18N
                    formid: "rcForm",// No I18N
                    inlineImagesEntity: 'Change',//NO I18N
                    allowedValuesCallback: "$CRForm.getAllowedValues",//NO I18N
                    handleDynamicFAFR: true,
                    skipFafrDynamic: self.skipFAFR,
                ffr:{
                    id:templateRC.id,
                    enable:true,
                    entity:"CHANGE",//No i18n
                },
                    customform: true,
                    linkedFields: [
                        {
                            fields: ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                            denote_field: ["scheduled_end_time"], //NO I18N
                            message: translate("sdp.schedule.validation.key4"), //NO I18N
                            validation: function (valueJson) {

                                if (this.isValueChanged("scheduled_end_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time) {
                                    return false;
                                }

                                return true;
                            }
                        },
                        {
                            fields: ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                            denote_field: ["scheduled_start_time"], //NO I18N
                            message: translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                            validation: function (valueJson) {
                                if (this.isValueChanged("scheduled_start_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time) {
                                    return false;
                                }

                                return true;
                            }
                        },
                        {
                            fields: ["created_time", "completed_time"], //NO I18N
                            denote_field: ["created_time"], //NO I18N
                            message: translate("api.validation.createdtime.completedtime"), //NO I18N
                            validation: function (valueJson) {
                                if (this.isValueChanged("created_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time) {
                                    return false;
                                }

                                return true;
                            }
                        },
                        {
                            fields: ["created_time", "completed_time"], //NO I18N
                            denote_field: ["completed_time"], //NO I18N
                            message: translate("api.validation.completedtime.createdtime"), //NO I18N
                            validation: function (valueJson) {
                                if (this.isValueChanged("completed_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time) {
                                    return false;
                                }

                                return true;
                            }
                        },
                    ],
                    edit: {
                        fields: {
                            change_requester: {
                                selection_handler: (sdp_user.USERTYPE === "Requester") ? false : "$CRForm.showUserSearchPopup",   //NO I18N
                                selection_icon_class: "cspr contact opac7 icon-sm opac fl", //NO I18N
                                selection_title: getMessageForKey('change.form.requester.icon'),
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item,false,true);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                },
                            },
                            change_manager: {
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                },
                            },
                            change_owner: {
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                },
                            },
                            multi_select: {
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                },
                            },
                            services: {
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item, true);
                                },
                            },
                            assets: {
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item, true);
                                },
                                selection_handler:  "$CRForm.showAssoicateAssetList",//NO I18N
                                selection_icon_class: "fl cspr asset1 icon-sm mr30 right0"//NO I18N
                            },
                            configuration_items: {
                               selection_handler: "$CRForm.showAssoicateCIList",//NO I18N
                              selection_icon_class:"fl cspr asset1 icon-sm mr30 right0"//NO I18N
                              },
                            description: {
                                images_api: true,
                                images_url: "/api/v3/" + self.base_url + "/images"//NO I18N
                            },
                            stage: {
                                allowClear: false,
                                post: function (field, form) {
                                    if(self.from === "copychange" && !field.current_value){
                                        self.resetStageStatus(form, true);
                                    }
                                }
                            },
                            status: {
                                allowClear: false
                            },
                            site: {
                                allowClear: false,
                                processResults: function (search_data, data, field, self) {
                                    // In Some case, the API have not specified id as "-1"
                                    // but the form component handle not specified value as "0"
                                    // For the uniformity, we changed the id from "-1" to "0"
                                    if (data.id == -1) {
                                        data.id = 0;
                                    }
                                    if (search_data.length && self.settings && self.settings.default_option && self.settings.default_option.id == data.id) {
                                        return;
                                    }
                                    search_data.push(data);
                                }
                            },
                            created_time: {
                                allowClear: false,
                                custom_rules: [
                                    {"rule_name": "dateCurCompare", "rule_value": true} //NO I18N
                                ]
                            },
                            template: {
                                allowClear: false,
                                processData: function (search_data, data, field) {
                                    //Group template data based on General/Emergency type
                                    var self = this, tempObj = [];
                                    jQuery.each(search_data, function (index, obj) {
                                        if (!obj.is_emergency) {
                                            !tempObj[0] && (tempObj[0] = {children: []});
                                            tempObj[0].children.push({name: obj.name, id: obj.id});
                                            tempObj[0].text = translate('sdp.report.task.module.general');

                                        } else {
                                            !tempObj[1] && (tempObj[1] = {children: []});
                                            tempObj[1].children.push({name: obj.name, id: obj.id});
                                            tempObj[1].text = translate('sdp.change.rfc.emergency');
                                        }
                                    });
                                    return tempObj;
                                }
                            },
                            workflow: {
                                post: "$CRForm.postWorkflowAdded",    //NO I18N
                                processData: function (search_data, data, field) {
                                    //Group workflow data based on General/Emergency type
                                    var workObj = [], generalWf = null, emergencyWf = null;
                                    self.defaultWorkflow = null;
                                    jQuery.each(search_data, function (index, obj) {
                                        obj.is_default ? self.defaultWorkflow = obj : null;
                                        if (obj.type == "General") {
                                            !generalWf && (generalWf = {children: []});
                                            generalWf.children.push({
                                                name: obj.name,
                                                id: obj.id,
                                                allowed_stages_config: obj.allowed_stages_config
                                            });
                                            generalWf.text = obj.type;

                                        } else if (obj.type == "Emergency") {
                                            !emergencyWf && (emergencyWf = {children: []});
                                            emergencyWf.children.push({
                                                name: obj.name,
                                                id: obj.id,
                                                allowed_stages_config: obj.allowed_stages_config
                                            });
                                            emergencyWf.text = obj.type;
                                        }
                                    });
                                    if (field.template.is_emergency) {
                                        emergencyWf && workObj.push(emergencyWf);
                                    } else {
                                        generalWf ? (workObj.push(generalWf) && emergencyWf && workObj.push(emergencyWf)) : (emergencyWf && workObj.push(emergencyWf));
                                    }

                                    return workObj;
                                }
                            }
                        },
                        defaults: {
                            lookup: {
                                placeholder: translate('sdp.change.sla.select')
                            },
                            site: {
                                id: "0",    //No I18N
                                name: translate("common.site.nosite")   //No I18N
                            }
                        },
                        onchange: {
                            site: "$CRForm.onchangeSite",    //NO I18N
                            group: "$CRForm.onchangeGroup",    //NO I18N
                            stage: "$CRForm.onChangeStage",    //NO I18N
                            status: "$CRForm.onChangeStatus",    //NO I18N
                            template: "$CRForm.onChangeTemplate",    //NO I18N
                            workflow: "$CRForm.onChangeWorkflow",    //NO I18N
                            scheduled_start_time: "$CRForm.ChangeFieldValidation",    //NO I18N
                            scheduled_end_time: "$CRForm.ChangeFieldValidation",    //NO I18N
                            created_time: "$CRForm.ChangeFieldValidation",    //NO I18N
                            completed_time: "$CRForm.ChangeFieldValidation",    //NO I18N
                            category:"$CRForm.onChangeCategory",//NO I18N
                            change_manager:"$CRForm.onChangeManager"//NO I18N
                        }
                    },
                    dependentFields: [{
                        fields: ["category", "subcategory", "item"],    //No I18N
                        order: true
                    }, {
                        fields: ["stage", "status"],  //No I18N
                        order: true
                    }, {
                        fields: ["site", "group"],  //No I18N
                        order: false
                    }],
                    save: {
                        url: self.editId ? "/api/v3/" + self.entityNamePl + "/" + self.editId + "" : "/api/v3/" + self.entityNamePl,//NO I18N
                        entity: self.entityName,
                        submit: true,
                        onsubmit: "$CRForm.preSaveHandler",   //NO I18N
                        forcesave: forcesave,
                        // onsave: "$CRForm.modifySaveData",//NO I18N
                        pre: function(payload){
                            if($CRForm.from == "request" && $CRForm.associatedEntityId) {
                                payload.associate_to = {"entity": "request", "id": $CRForm.associatedEntityId};//NO I18N
                            }
                        },
                        serializer: "$CRForm.executeWhileSave",//NO I18N
                        cancel: "$CRForm.cancelForm",//No I18N
                        success: "$CRForm.postDataAdded",//No I18N
                        errorinterrupt:function(data, form){
                            if($CRForm.from === 'request' && $CRForm.entityName === 'change') {
                                if(!Array.isArray(data.response_status) || data.response_status.length <= 1) {
                                    return true;
                                }else {
                                    showalert("failure", getMessageForKey("api.added.success", [getMessageForKey("common.change")]) + ". " + data.response_status[0].messages[0].message, "isAutoHide=true"); //No I18N
                                    return false;
                                }
                            }
                            return true;
                        },
                        submitbutton: {
                            add: window.getMessageForKey("sdp.common.save"), //No I18N
                        }
                   },
                    entityName: translate('sdp.common.change'),//No I18N
                    afterRenderCallback: "$CRForm.afterrenderpage" //No I18N
                }
                if(self.from == "request") {
                    configJSON.save.url = "/api/v3/" + self.entityNamePl + "/_addandassociate";//NO I18N
                }
                isMSP && self.mspform.modifyConfigJSONForMSP(configJSON);
                //Add bulk select configs for udf fields
                jQuery.each(templateRC[self.entityName].udf_fields, function (fieldName, fieldVal) {
                    if (metainfoFields.udf_fields && (metainfoFields.udf_fields.fields[fieldName].display_type == "MultiSelect" || metainfoFields.udf_fields.fields[fieldName].display_type == "CheckBox")) {
                        configJSON.edit.fields["udf_fields." + fieldName] = {selection_handler: "$CRForm.showBulkSelect"}; //No I18N
                    }
                else if (metainfoFields.udf_fields && metainfoFields.udf_fields.fields[fieldName].display_type == 'Pick List') {
                    //field properties taken from edit in form.js
                    configJSON.edit.fields["udf_fields." + fieldName] = {
                        criteria_key: "name" //NO I18N
                    }
                }
                });
            if(this.from === "copychange"){
                configJSON.entitydata = entityData
                $CRForm.modifyConfigJSONForCopyChange(configJSON);
                configJSON.save = {
                        url: "/api/v3/changes/"+self.changeID+"/copy",//NO I18N
                        submit: true,
                        onsubmit: "$CRForm.preSaveHandler",   //NO I18N
                        forcesave: forcesave,
                        exit_alert: false,
                        serializer: "$CRForm.executeWhileSave",//NO I18N
                        cancel: "$CRForm.cancelForm",//No I18N
                        success: "$CRForm.postDataAdded",//No I18N
                        post:"$CRForm.disableCopyButton",//No I18N
                        submitbutton: {
                            add :  translate("sdp.common.copy"),//No I18N
                            cancel: translate("sdp.common.back")  //No I18N
                    },
                }
            }
                window.$relform = new FC(configJSON);

                jQuery("#rc-container").on("editLoaded", function () { //No I18N
                    if (isMSP) {
                        $CRForm.mspform.afterPageRenderForMSP($relform);
                    } else {
                        self.setFieldAndFormRules();
                    }
                });

                if (editId) {
                    jQuery("#browserTitleInfo").find("#bt_id").text(self.entitydata.id).end().find("#bt_title").text(self.entitydata.title);// No I18N
                }
                applyBrowserTitle();
            } catch (e) {
                console.error(e);
            }
    },
        disableCopyButton:function(_self){
            if(_self.hideCopyButton){
        //To disable copy change button after copy success
        _self.grid.find("button[name='save-form']")[0].disabled=true;
            }
        },


        setFAFRkeyForRoles: function (rolesMetaInfo) {
            for (var key in rolesMetaInfo) {
                if (rolesMetaInfo.hasOwnProperty(key)) {
                    rolesMetaInfo[key]['fafr_key'] = rolesMetaInfo[key]['display_name'];
                }
            }
        },
        /**
         * Associate created change with other modules - Problem, Request, Project
         */
        associateTo: function (changeId) {
            var self = this;
            var plurals = {"problem": "problems", "request": "requests", "project": "projects", "release": "releases"};//NO I18N
            if (self.from == "problem") {
                var moduleAssociationName = "associated_change"; //NO I18N
                var data = sdpAjaxInputData({"associated_change": {"change": {"id": changeId}}}); //NO I18N
            } else if (self.from == "project") { //NO I18N
                var moduleAssociationName = "changes"; //NO I18N
                var data = sdpAjaxInputData({"changes": [{"initiated_by": "project", "change": {"id": changeId}}]}); //NO I18N
            }
            var sdpOptions = {
                url: "/api/v3/" + plurals[self.from] + "/" + self.associatedEntityId + "/" + moduleAssociationName, // No I18N
                data: data,
                type: "POST",// No I18N
                success: function (resp) {
                    const parent = $extFrame.getActiveWindow();
                    if (self.from == "project" && resp.response_status && resp.response_status[0].status == "success") { //NO I18N
                        parent.showalert("success", translate("api.associate.success.msg", [translate("common.changes")]), "isAutoHide=true, delay=3"); //No I18N
                        parent.$previewComponent.closePreview("newchange_popup");// No I18N
                        parent.WebComponents.instancePool["webc-project_change"].refreshTable();//No I18N
                        return;
                    }
                    if (resp.response_status && resp.response_status.status == "success") {
                        parent.showalert("success", translate("sdp.project.executeaction.chgassociation.lvname"), "isAutoHide=true, delay=3"); //No I18N
                        parent.$previewComponent.closePreview("newchange_popup");// No I18N
                        parent.location.reload();
                   }
                },
                failedCallBack: function () {
                    setTimeout(function () {
                        window.top.$previewComponent.closePreview("newchange_popup");// No I18N
                    }, 1000);

                },
                async: false
            }
            sdpAjax(sdpOptions);

        },
        /**
         * Overwritten processSearchData in select2
         */
        processSearchData: function (data, _self) {
            var alltech = '$' + translate('sdp.request.share.alltechs');
            if (_self.term) {
                alltech.toLowerCase().includes(_self.term) && data.change_owner.unshift({id: "-1", name: alltech});
            } else if (!data.change_owner.some(function (val) {
                return val.id == "-1"
            })) {
                data.change_owner.unshift({id: "-1", name: alltech});
            }

            var search_data = [];
            if (typeof _self.url_options.processResults == "undefined") {
                _self.url_options.processResults = _self.settings.processResults;
            }
            for (var i = 0; i < data[_self.field].length; i++) {
                _self.url_options.processResults(search_data, data[_self.field][i], _self.field, _self, data[_self.field]);
            }
            return search_data;
        },
        /**
         * Construct input data to get fields allowed values
         * Eg, Dependent field-status, construct input data with stage id
         * Used in Form & Release Details page-stage/status change popup
         */
        getInputDataCallback: function () {
            var _self = this;
            var obj = {
                stage: function (urlOptions, input_data, searchText) {
                    let json = [];
                    if (searchText) {
                        json.push({
                            "field": "name", //NO I18N
                            "value": searchText, //NO I18N
                            "condition": "like", //NO I18N
                            "logical_operator": "AND" //NO I18N
                        });
                    }
                    if (input_data.list_info.search_fields) {
                        delete input_data.list_info.search_fields;
                    }
                    input_data.list_info.search_criteria = json;
                    if (urlOptions.formcomp.formid === "rcForm") {
                        if (urlOptions.formcomp.fields.values.workflow) {
                            input_data.workflow_id = typeof urlOptions.formcomp.fields.values.workflow === 'object' ? urlOptions.formcomp.fields.values.workflow.id : urlOptions.formcomp.fields.values.workflow; //No I18N
                            urlOptions.url = '/api/v3/changes/' + (_self.editId ? _self.editId + '/stage' : 'stage'); //No I18N
                        } else {
                            urlOptions.url = '/api/v3/changes/stage'; //No I18N
                        }
                    }
                    return input_data;
                },
                status: function (urlOptions, input_data, searchText) {
                    var json = [];
                    var stageVal = null;
                    stageVal = urlOptions.formcomp.fields.values.stage && urlOptions.formcomp.fields.values.stage.id ? urlOptions.formcomp.fields.values.stage.id : urlOptions.formcomp.fields.values.stage;
                    stageVal = stageVal === "" ? null : stageVal;
                    json.push({"field": "stage", "condition": "is", "value": stageVal, "logical_operator": "and"}); //No I18N
                    if (searchText) {
                        json.push({
                            "field": "name", //NO I18N
                            "value": searchText, //NO I18N
                            "condition": "like", //NO I18N
                            "logical_operator": "AND" //NO I18N
                        });
                    }
                    if (input_data.list_info.search_fields) {
                        delete input_data.list_info.search_fields;
                    }
                    input_data.list_info.search_criteria = json;
                    if (urlOptions.formcomp.formid === "rcForm") {
                        if (urlOptions.formcomp.fields.values.workflow) {
                            input_data.workflow_id = typeof urlOptions.formcomp.fields.values.workflow === 'object' ? urlOptions.formcomp.fields.values.workflow.id : urlOptions.formcomp.fields.values.workflow; //No I18N
                            urlOptions.url = '/api/v3/changes/' + (_self.editId ? _self.editId + '/status' : 'status'); //NO I18N
                        } else {
                            urlOptions.url = '/api/v3/changes/status'; //NO I18N
                        }
                    }
                    return input_data;
                },
                group: function (urlOptions, input_data, searchText) {
                    var json = [];
                    var siteVal = null;
                    var values = urlOptions.formcomp.fields.values;
                    var entityData = urlOptions.formcomp.entitydata;
                    if (values.site) {
                        siteVal = values.site && values.site.id ? values.site.id : values.site;
                    } else if (entityData) {
                        siteVal = entityData.site ? entityData.site.id : null;
                    }
                    siteVal = (siteVal === "" || siteVal == "-1" || siteVal == "0") ? null : siteVal;
                    json = {"field": "site", "condition": "is", "value": siteVal, "logical_operator": "and"}; //No I18N
                    if (searchText) {
                        json.children = [{
                            "field": "name", //NO I18N
                            "value": searchText, //NO I18N
                            "condition": "like", //NO I18N
                            "logical_operator": "AND" //NO I18N
                        }];
                    }
                    if (input_data.list_info.search_fields) {
                        delete input_data.list_info.search_fields;
                    }
                    input_data.list_info.sort_field = "name";  //NO I18N
                    input_data.list_info.sort_order = "asc";  //NO I18N
                    input_data.list_info.search_criteria = json;
                    return input_data;
                },
                subcategory: function (urlOptions, input_data, searchText) {
                    var json = [];
                    var catVal = null;
                    catVal = urlOptions.formcomp.fields.values.category && urlOptions.formcomp.fields.values.category.id ? urlOptions.formcomp.fields.values.category.id : urlOptions.formcomp.fields.values.category;
                    catVal = catVal === "" ? null : catVal;
                    json.push({"field": "category", "condition": "is", "value": catVal, "logical_operator": "and"}); //No I18N
                    if (searchText) {
                        json.push({
                            "field": "name", //NO I18N
                            "value": searchText, //NO I18N
                            "condition": "like", //NO I18N
                            "logical_operator": "AND" //NO I18N
                        });
                    }
                    if (input_data.list_info.search_fields) {
                        delete input_data.list_info.search_fields;
                    }
                    input_data.list_info.search_criteria = json;
                    return input_data;
                },
                item: function (urlOptions, input_data, searchText) {
                    var json = [];
                    var subVal = null;
                    subVal = urlOptions.formcomp.fields.values.subcategory && urlOptions.formcomp.fields.values.subcategory.id ? urlOptions.formcomp.fields.values.subcategory.id : urlOptions.formcomp.fields.values.subcategory;
                    subVal = subVal === "" ? null : subVal;
                    json.push({"field": "subcategory", "condition": "is", "value": subVal, "logical_operator": "and"}); //No I18N
                    if (searchText) {
                        json.push({
                            "field": "name", //NO I18N
                            "value": searchText, //NO I18N
                            "condition": "like", //NO I18N
                            "logical_operator": "AND" //NO I18N
                        });
                    }
                    if (input_data.list_info.search_fields) {
                        delete input_data.list_info.search_fields;
                    }
                    input_data.list_info.search_criteria = json;
                    return input_data;
                },
                change_owner: _self.getSGTInputDataCallback(),
            };
            isMSP && this.mspform.modifyInputDataCallbackForMSP(obj);
            return obj;
        },
        //Call field validation of respective field on field change
        ChangeFieldValidation: function (fieldName, formComp) {
            if (formComp.validateField(fieldName.name)) {
                const spanElement = document.querySelector('span[for="' + fieldName.name + '"]');//No I18N
                if (spanElement) {
                    spanElement.remove();
                }
            }
        },
        onChangeCategory: function (currField, formcomp, event, formPromise) {
            let self = this;

            if (self.managerUpdatedViaCategory) {
                formcomp.unsetFieldValue("change_manager"); // NO I18N
            }

            if (
                currField.current_value &&
                currField.current_value.id &&
                !formcomp.fields.change_manager.current_value
            ) {

                    let changeManager=null;
                  let sdpOptions = {
                    url:'/api/v3/changes/'+(self.editId ? self.editId+'/':'')+'get_cm_for_category?category_id=' + currField.current_value.id,//NO I18N
                    cache: false,
                    async: false,

                    success: function(response) {
                        changeManager=response.category && response.category.change_manager;

                    },
                    error: function(response){
                        changeManager=null;
                    }
                };

                sdpAjax(sdpOptions);

                if (changeManager != null) {
                    formcomp.safeSetFieldValue("change_manager", {// NO I18N
                        id: changeManager.id,
                        name: changeManager.name
                    });
                    self.managerUpdatedViaCategory = true;
                }
            }
        },

        onChangeManager: function () {
            this.managerUpdatedViaCategory = false;
        },

        resetSupportGroup: function (form, user_type) {
            var self = this, rolesObjArr = self.rolesObjArr;
            var rolesMetaInfo = form.metadata.fields.roles.fields;
            for (var i = 0; i < rolesObjArr.length; i++) {
                var roleId = rolesObjArr[i];
                var roleFullId = "roles." + roleId;//NO I18N
                if (rolesMetaInfo[roleId].user_type === user_type) {
                    // Clear data in the role
                    form.unsetFieldValue(roleFullId);
                    jQuery('[name="' + roleFullId + '"]').data("sdp_select2").cache = {};   //NO I18N
                }
            }
        },
        /**
         * Reset roles in submission layout when site/group is changed. This applies to Change Module alone
         * @form - form intance
         * @allowedUsers - already choosen users in that role field
         * @rolesArr - all roles in roles layout
         * @form - form instance
         * @rolesMetaInfo - metainfo of roles
         */
        resetRolesInOtherLayout: function (allowedUsers, rolesArr, form, rolesMetaInfo) {
            jQuery.each(rolesArr, function (i, roleFullId) {
                var selVal = form.fields[roleFullId].current_value;
                jQuery('[name="' + roleFullId + '"]').data("sdp_select2").cache = {};   //NO I18N
                if (selVal && !jQuery.isEmptyObject(selVal)) {
                    if (jQuery.inArray(selVal.id, allowedUsers) !== -1) {
                        form.safeSetFieldValue(roleFullId, {id: selVal.id, 'name': selVal.text || selVal.name});   //NO I18N
                    } else {
                        // Clear previous data in the role
                        form.unsetFieldValue(roleFullId);
                    }
                }
            });
        },
        /*Function execute after rendering page*/
        afterrenderpage: function (form) {
            var self = this, parentElement = jQuery('#rc-container');
            if (self.editId) {
                //Template and workflow can be edited in submission and planning stage by users with submission edit
                //Template and workflow can be by Change Governors at any stage.
                if (!(getData && getData.change && getData.change.Submission_edit == true)
                    && !(getData && getData.change && getData.change.hasRFCEdit == true)) {
                    form.fields.template.disabled = true;
                    form.fields.workflow.disabled = true;
                }
                if (!self.canEdit) {
                    form.fields.stage.disabled = true;
                }
                form.fields.comment.disabled = true;
                $CRForm.disableRoles(form);
            }
            //click function for asset/Cis popup
            jQuery('#configuration_items_actions').attr('title', getMessageForKey('sdp.requests.assets.icon.addmore'));
            jQuery('#assets_actions').next().attr('title', getMessageForKey('sdp.requests.assets.icon.addmore'));
            jQuery(jQuery('[data-cs-field="properties_grid"]').find('.form-wrapper')[0]).removeClass('pb25');
            /*Disable assets when ViewInventoryWS is not present in roles*/
            if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.includes('ViewInventoryWS') == false) {
                form.fields.hasOwnProperty("assets") && (form.fields.assets.disabled = true);//No I18N
            }
//Disable CIs when viewCI is not present in roles.
          if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
              form.fields.hasOwnProperty("configuration_items") && (form.fields.configuration_items.disabled = true);//No I18N
            }
            /*Roles expand/collapsed code and general section padding increased*/
            var element = jQuery('[data-cs-field="properties_grid"]').find('.form-wrapper')[2];

            var rolesLen = jQuery(element).find('.section-title');
            for (var i = 0; i < rolesLen.length; i++) {
                var sectionTitleEle = rolesLen[i];
                sectionTitleEleJQ = jQuery(sectionTitleEle);
                sectionTitleEleJQ.next().attr('id', 'rolesSection_' + i);
                sectionTitleEleJQ.parent().attr('id', 'rolessection_' + i + '_collapse');
                sectionTitleEleJQ.html(e_html(sectionTitleEle.innerText)).show();
                ZComponents.collapsiblepanel('#rolessection_' + i + '_collapse', { //NO I18N
                    toggleButton: true,
                    toggleButtonPosition: 'left', //NO I18N
                    toggleOnHeaderClick: true,
                    toggleOn: 'click', //NO I18N
                    isActive: true,
                    className: 'release-roles-zc' //NO I18N
                });
            }
        },
        /*Passed this for bulk select for services once handled in component need to remove*/
        getAllowedValues: function (formPromise, formcomp) {
            var self = this;
            formcomp.allowedValues.services = self.getEntityAll(self.base_url + '/services', null, 'services', { //NO I18N
                "list_info": { //NO I18N
                    "start_index": 1, //NO I18N
                    "row_count": 100 //NO I18N
                }
            }, true);

                        if(self.from == "cmdb"){
                            formcomp.allowedValues.template=self.getEntityAll(self.base_url+'/template/get_change_template_with_ci_field',null,'template',{"list_info":{"start_index":1,"row_count":100}}, true);//No I18N
                        }
                        else{
            formcomp.allowedValues.template = self.getEntityAll(self.base_url + '/template', null, 'template', { //NO I18N
                "list_info": { //NO I18N
                    "start_index": 1, //NO I18N
                    "row_count": 100 //NO I18N
                }
            }, true);}
            let input_data = {
                "list_info": { //NO I18N
                    "search_criteria": { //NO I18N
                        "field": "module.name", //NO I18N
                        "condition": "is", //NO I18N
                        "value": "change", //NO I18N
                        "logical_operator": "and", //NO I18N
                        "children": [{ //NO I18N
                            "field": "inactive", //NO I18N
                            "condition": "is", //NO I18N
                            "value": "false", //NO I18N
                            "logical_operator": "and" //NO I18N
                        }]
                    }, "fields_required": ["name", "type", "allowed_stages_config","is_default"], "start_index": 1, "row_count": 100 //NO I18N
                }
            };
            if (self.from == "problem" || self.from == "request") {
                input_data.for = self.from;
            }
            formcomp.allowedValues.workflow = self.getEntityAll('changes/workflow', null, 'workflow', input_data, true);//No I18N
            isMSP && $CRForm.mspform.getAllowedValues(formcomp);
        },
        serializeCSIForFC: function (allowedValues) {
            var _subcategory = {}, subcategoryCategoryRef = {};
            allowedValues.subcategory.forEach(function (subcategory) {
                if (!_subcategory.hasOwnProperty(subcategory.category.id)) {
                    _subcategory[subcategory.category.id] = [];
                }
                _subcategory[subcategory.category.id].push(subcategory);
                subcategoryCategoryRef[subcategory.id] = subcategory;
            });
            allowedValues.subcategory = _subcategory;

            var _item = {};
            allowedValues.item.forEach(function (item) {
                var categoryId = subcategoryCategoryRef[item.subcategory.id].category.id;
                if (!_item.hasOwnProperty(categoryId)) {
                    _item[categoryId] = {};
                    _item[categoryId][item.subcategory.id] = [];
                } else if (!_item[categoryId].hasOwnProperty(item.subcategory.id)) {
                    _item[categoryId][item.subcategory.id] = [];
                }
                _item[categoryId][item.subcategory.id].push(item);
            });
            allowedValues.item = _item;
        },
        serializeStatusForFC: function (allowedValues) {
            var _status = {};
            allowedValues.status.forEach(function (status) {
                if (!_status.hasOwnProperty(status.stage.id)) {
                    _status[status.stage.id] = [];
                }
                _status[status.stage.id].push(status);
            });
            allowedValues.status = _status;
        },
        currentTemplateContentFromAssociateEntity: function (templateData, associatedEntityData) {
            var self = this;
            var CSI = ["category", "subcategory", "item"];//NO I18N
            var SG = ["site", "group"];//NO I18N

            return templateData = merge(templateData, associatedEntityData);

            function merge(obj1, obj2) {
                if (self.options && self.options.from == "project") {
                    answer = jQuery.extend(true, {}, obj1);
                    for (key in obj2) {
                        answer[key] = obj2[key];
                    }
                    return answer;
                }
                answer = jQuery.extend(true, {}, obj2);
                for (key in obj1) {
                    if (!obj2[key]) {
                        if (CSI.indexOf(key) == -1 && SG.indexOf(key) == -1) {
                            answer[key] = obj1[key];
                        }
                    } else if (Array.isArray(obj2[key]) && obj2[key].length == 0) {
                        answer[key] = obj1[key];
                    }
                }

                var dependancies = [CSI];
                dependancies.forEach(function (each) {
                    for (var i = 0; i < each.length; i++) {
                        var parent = each[i - 1];
                        var current = each[i];
                        var child = each[i + 1];
                        if (!obj2[current] && (!parent || (answer[parent] && obj1[parent] && answer[parent].id == obj1[parent].id))) {
                            answer[current] = obj1[current];
                            if (child) {
                                delete obj2[child];
                            }
                        }
                    }
                })
                if (self.options && self.options.from == "request") {
                    if ((!obj1.site && !obj2.site) || (obj1.site && obj2.site && obj1.site.id === obj2.site.id)) {
                        answer.group = obj2.group || obj1.group;
                    } else {
                        answer.group = obj2.group;
                    }

                }
                if (self.options && self.options.from == "problem") {
                    if ((obj1.site == null && obj2.site && obj2.site.id == "-1") || (obj1.site && obj2.site && obj1.site.id === obj2.site.id)) {
                        answer.group = obj2.group || obj1.group;
                    } else if (obj1.site == null && !obj2.site) {
                        answer.group = obj1.group;
                    } else {
                        answer.group = obj2.group;
                    }

                }

                return answer;
            }

        },
        /**
         * Common for both form and details page
         */
        getRolesInputDataCallback: function (field, entityData, metainfo) {
            var _self = this;
            var id = field.name.includes(".") ? field.name.split(".")[1] : field.name;
            metainfo = metainfo.hasOwnProperty(field.name) ? metainfo : metainfo.roles.fields;
            if (metainfo[id].user_type == "COTECH") {
                var sgt = _self.getSGTInputDataCallback(entityData);
                return sgt;
            } else if (metainfo[id].user_type == "TECH") {
                var st = function (urlOptions, input_data, searchText) {
                    var fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                    var siteId = (entityData && (entityData.site ? entityData.site.id : "0")) || ((fieldsValue && fieldsValue.site) ? fieldsValue.site : "0");
                    siteId = (siteId == "0" || siteId === "-1") ? null : siteId;
                    var search_keys = urlOptions.search_keys;
                    if (Array.isArray(search_keys)) {
                        var modified_search_keys = [];
                        for (var key of search_keys) {
                            if (key !== "name") { //NO I18N
                                modified_search_keys.push(key);
                            }
                        }
                        search_keys = modified_search_keys;
                    } else {
                        search_keys.remove('name'); //No I18N
                    }
                    var childrenCriteria = [];
                    if (searchText) {
                        for (var i = 0; i < search_keys.length; i++) {
                            var tmp = {
                                "field": search_keys[i], //No I18N
                                "condition": "like", //No I18N
                                "values": [searchText], //No I18N
                                "logical_operator": "or" //No I18N
                            }
                            childrenCriteria[i] = tmp;
                        }
                    }
                    var json = [];
                    json.push({
                        "field": "associated_sites",      //No I18N
                        "condition": "is",      //No I18N
                        "logical_operator": "and", //No I18N
                        "value": {      //No I18N
                            "id": siteId == null ? -1 : siteId      //No I18N
                        }
                    });
                    if (searchText) {
                        json.push({
                            "field": "name",      //No I18N
                            "condition": "like",      //No I18N
                            "logical_operator": "and", //No I18N
                            "values": [      //No I18N
                                searchText
                            ]
                        });
                    }
                    json = json.concat(childrenCriteria);
                    input_data.list_info.search_criteria = json;
                    input_data.list_info.row_count = 25;
                    return input_data;
                };
                return st;
            } else if (metainfo[id].user_type == "ALL") {
                var callback = _self.getAllInputDataCallback();
                return callback;
            } else if (metainfo[id].user_type == "SUPGRP") {
                return _self.getInputDataCallback().group;
            } else if (isMSP && metainfo[id].user_type == "SDCM") {
                var input_data_cb = function (urlOptions, input_data, searchText) {
                    var fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                    var entityData = urlOptions.formcomp.entitydata;
                    var siteId = ((fieldsValue && fieldsValue.site) ? fieldsValue.site : (entityData && (entityData.site ? entityData.site.id : "-1")));

                    input_data.list_info.search_criteria = {
                        "field": "associated_sites", //NO I18N
                        "condition": "is", //NO I18N
                        "value": {"id": siteId} //NO I18N
                    };
                    input_data.list_info.search_fields && delete input_data.list_info.search_fields;
                    return input_data;
                }
                return input_data_cb;
            }
        },
        getSGTInputDataCallback: function (entityData) {
            var sgt = function (urlOptions, input_data, searchText) {
                var fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                var siteId = (entityData && (entityData.site ? entityData.site.id : "0")) || ((fieldsValue && fieldsValue.site) ? fieldsValue.site : "0");
                siteId = (siteId == "0" || siteId === "-1") ? null : siteId;
                var groupId = (entityData && (entityData.group ? entityData.group.id : null)) || ((fieldsValue && fieldsValue.group) ? fieldsValue.group : null);
                var search_keys = urlOptions.search_keys;
                //In FAFR case search_keys is not passed
                if (search_keys != undefined) {
                    search_keys.remove(['name']); //No I18N
                }
                if (change_helper.isRequester()) { // For requester login, login_name is excluded by default
                    search_keys.remove(['login_name']); //No I18N
                }
                var childrenCriteria = [];
                if (searchText && search_keys != undefined) {
                    for (var i = 0; i < search_keys.length; i++) {
                        var tmp = {
                            "field": search_keys[i], //No I18N
                            "condition": "like", //No I18N
                            "values": [searchText], //No I18N
                            "logical_operator": "or" //No I18N
                        }
                        childrenCriteria[i] = tmp;
                    }
                }
                var json = [];
                json.push({
                    "field": "associated_sites",      //No I18N
                    "condition": "is",      //No I18N
                    "logical_operator": "and",  //No I18N
                    "value": {id: siteId == null ? -1 : siteId}      //No I18N
                });
                json.push({
                    "field": "support_group",      //No I18N
                    "condition": "is",      //No I18N
                    "logical_operator": "and",  //No I18N
                    "value": {id: groupId}      //No I18N
                });
                if (searchText) {
                    json.push({
                        "field": "name",      //No I18N
                        "condition": "like",      //No I18N
                        "logical_operator": "and",  //No I18N
                        "values": [      //No I18N
                            searchText
                        ]
                    });
                }
                json = json.concat(childrenCriteria);
                input_data.list_info.search_criteria = json;
                input_data.list_info.row_count = 25;
                return input_data;
            };
            return sgt;
        },
        /**
         * Fetch and set FAFR
         */
        setFieldAndFormRules: function () {
            var self = this;
            var module = "CHANGE";   //NO I18N
            var mode = self.editId ? "edit" : "create";   //NO I18N
            var promisefn = [];
            var userType = sdp_user.USERTYPE;
            if (!self.options.isCMCO) {
                userType = "UserExceptCMCO";   //NO I18N
            }

            var fetchRuleURL = "/servlet/SDAjaxServlet?action=getTemplateRules&module=" + module + "&templateId=" + $relform.template.id + "&sdUserType=" + userType + "&mode=" + mode + "&rulesRequired=templateSpecific";  //NO I18N
            isMSP && (fetchRuleURL += "&ruleAccount=" + $CRForm.mspform.getAccountID());  //NO I18N

            var fetchRules = sdpAjax({
                url: fetchRuleURL,
                type: 'GET',  //NO I18N
                cache: false,
                success: function (data) {
                    self.fafr_rules = data;
                }
            });

            promisefn.push(fetchRules);

            var fetchFieldsJson = sdpAjax({
                url: "/servlet/SDAjaxServlet?action=getFieldsJson&module=" + module + "&templateId=" + $relform.template.id, //NO I18N
                type: 'GET',  //NO I18N
                cache: false,
                success: function (data) {
                    self.fafr_fieldsJson = data;
                }
            });

            promisefn.push(fetchFieldsJson);

            jQuery.when.apply(this, promisefn).then(function () {
                self.initFAFR();
            });
        },
        /**
         * FAFR initialization
         */
        initFAFR: function () {

            var self = this;
            $se.isCreateOperation = self.editId ? false : true;
            $se.formObject = jQuery("#rc-container");   //No I18N
            $se.module = "CHANGE";   //NO I18N

            $se.rules = self.fafr_rules;
            $se.fieldsJson = self.fafr_fieldsJson;

            /** removes special characters from field details object */
            $se.removeSpecialCharFromFields();
            $se.fieldsJson = fieldDetailsFunction($se.fieldsJson);

            $se.onDetailPage = false;
            $se.isInlineView = true;
            $se.isFormComponent = true;
            $se.form = $relform;
            if(self.from === 'copychange'){
            $se.skipRuleFields = ["TEMPLATE"];
            }
            $se.addRulesToForm();
        },
        preSaveHandler: function (form, field, event, editType, callback) {
            $se.checkOnSubmitCall();
            if ($se.stopFormSubmission) {
                jQuery("#" + form.container).find("button[name='save-form']").prop("disabled", false);
                return true;
            }
        },
        /**
         * incase of assets map its data to respective fields
         */
        modifyEntityData: function (entityData) {
            var self = this;
            if (entityData && entityData.assets) {
                entityData.assets = entityData.assets.map(function (asset) {
                    return {id: asset.id, name: asset.name}
                });
                }
        else if (entityData && entityData.configuration_items) {
            entityData.configuration_items = entityData.configuration_items.map(function(asset) {
                return {
                    id: asset.id,
                    name: asset.name
                }
            });
        }
    },
        postWorkflowAdded: function (field, formcomp) {
            let self = this;
            if (self.from == "problem" || self.from == "request") {
                if (formcomp.template.workflow && formcomp.template.workflow.id) {
                    //if new change association from other module, check workflow in template has specific stage permission, if no permisson then unset workflow value
                    let isPresent = $relform.allowedValues.workflow.find(wf => wf.id == formcomp.template.workflow.id);
                    if (!isPresent) {
                        formcomp.unsetFieldValue("workflow");   //NO I18N
                        self.tosetDefaultWorkflow = false;
                    }
                }
            }
            self.setDefaultWorkflow(field, formcomp);
    },
    /**
     * Check for updates in the change roles type in the admin section
     */
    checkChangeRoles: function(){
        var invalidRoles = (getData.change != null) ? getData.change.invalidRoles : null;
        if(invalidRoles != null) {
            invalidRolesMessage = ' ';
            for (var i = 0; i < invalidRoles.length; i++) {
                window.$relform.unsetFieldValue('roles.' + invalidRoles[i]);
                invalidRolesMessage += this.metainfo.fields.roles.fields[invalidRoles[i]].display_name + ' ';
            }
            if (invalidRoles.length > 0) {
                window.showalert("warning", translate("change.roles.invalid.values", [invalidRolesMessage]), "isAutoHide=false");   //No I18N
            }
        }
   },
   /**
   * Disables the change roles in the change form when the RolesEditConfig is enabled
   */
   disableRoles: function(form){
        var self = this;
        if($rc.isConfigEnabled("RoleEditConfig", "AllowOnlySuperUsersToEditChangeRoles", getData.change.moduleConfigs) && !self.canEdit) { //No I18N
            const criticalRoles = ["change_requester", "change_manager", "change_owner"]; //NO I18N
            for(let field in form.fields) {
                if(field.startsWith("role") || criticalRoles.includes(field)) {
                    form.fields[field].disabled = true;
                }
            }
        }
   },

    showAssoicateCIList : function(){
        let jQBody = jQuery("body"); // NO I18N
		if (!jQBody.find("#ci-association-container").length) {// NO I18N
			jQBody.append('<div id="ci-association-container"></div>'); // NO I18N
		}
        assetsObj.loadAttachCIPopup('changes','configuration_items','ci-association-container','500');//No I18N
        },
    showAssoicateAssetList: function () {
            assetsObj.loadAttachAssetPopup('change', 'attach_asset', 'assets');//NO I18N
    },
   modifyConfigJSONForCopyChange(configJSON){
    let arr = this.copyproperties["Submission"];
    let filteredArr = arr.map(field => field.id);

            //Remove unselected field values from the edit form
            if (!filteredArr.includes("change_roles")) {
                configJSON.entitydata["roles"] = [];
                configJSON.entitydata.change_manager = null;
                configJSON.entitydata.change_owner = null;
                configJSON.entitydata.change_requester = null;
                configJSON.template.change.roles=[];
                configJSON.template.change.change_manager = null;
                configJSON.template.change.change_owner = null;
                configJSON.template.change.change_requester = null;
            }
            if (!filteredArr.includes("submission.attachments")) {
                configJSON.entitydata["attachments"] = [];
            }
            if (!filteredArr.includes("udf_fields")) {
                configJSON.entitydata["udf_fields"] = {};
                configJSON.template.change.udf_fields = {};
            }
            configJSON.entitydata.stage = configJSON.template.change.stage;
            configJSON.entitydata.status = configJSON.template.change.status;
            configJSON.metadata.fields.template.disabled = true;
            configJSON["edit"].onchange = configJSON.edit.onchange;
        }

    };
}()));
