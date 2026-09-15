/* $Id$ */
//Need to add to problem_scripts.js.txt for compiled format
var $PBForm = {
    /*Initialize new/edit form */
    CSI:["category","subcategory","item"],//No I18N
    SGT:["site","technician","group"],//No I18N
    initialize: function (options) {
        jQuery('body').removeClass('of-h');
        Handlebars.registerPartial("pb-tasks-template", renderhbs(null,'pb-tasks-template',null,null,'problems',null,true,null,true));	//No I18N
        renderhbs('#problem-section', 'problem_form_section', { id: options.entity_id }, false, 'problems');// No I18N
        var self = this;
        self.setProp(options);
        self.fromPage = $problemGlobal.fromPage;
        self.externalframe = options.externalframe;
        /*For executing when click preview from admin>>problem_template*/
        self.templatePreview = window.opener && window.opener.preview_json && window.opener.preview_json.problem_template;
        if (self.templatePreview && self.entityName == "problem") {
            self.loadTemplate(null, null, window.opener.preview_json.problem_template);
            jQuery("#header-placeholder").css("pointer-events", "none");  //NO I18N
            jQuery("#securityrisk, #top-subheader").addClass("hide");
        }
        else {
            self.entitydata = null;
            var templatePB = null;
            if (self.editId && self.editId != "null") {
                self.entitydata = self.getEntityAll(self.entityNamePl, self.editId, self.entityName)[0];
                self.entityRefData = jQuery.extend(true, {}, self.entitydata);
                templatePB = self.getEntityAll(self.base_url + '/template', self.entitydata.template.id, self.entityName + '_template')[0];//NO I18N
                self.template = jQuery.extend(true, {}, templatePB);
				if(window.checkIfMSP()){
					addAndSetAccountInCombo(self.entitydata.account.id, true, self.entitydata.account.name);
				}
            }
            else if (self.from && (self.operation == "associateto") && (self.overwrite_option == 3 || self.overwrite_option == 2)) { //NO I18N
                self.associatedSelOverwriteId = self.overwrite_option;
                var associatedEntityData = self.getEntityAll(self.from + (self.from != 'cmdb' ? "s" : ""), self.associatedEntityId, self.from)[0]; //NO I18N
                var keysToSync = [];
                if (self.from == "request") { //NO I18N
                    keysToSync = ["category", "subcategory", "item", "subject", "description", "priority", "urgency", "impact", "site", "service_category", "assets", "configuration_items"];//NO I18N
                }
                else if (self.from == "cmdb") {
                    keysToSync = ["configuration_items"];
                }
                self.overWriteEntitydata = {};
                for (var index = 0; index < keysToSync.length; index++) {
                    var key = keysToSync[index];
                    if (key == 'subject') {
                        self.overWriteEntitydata["title"] = associatedEntityData["subject"];
                    } else if (key == 'service_category' && associatedEntityData[key]!=null) {// No I18N
                        var arr = [];
                        arr.push(associatedEntityData[key]);
                        self.overWriteEntitydata["affected_service"] = arr;
                    } else if (key == 'assets') {// No I18N
                        self.overWriteEntitydata["associated_asset"] = associatedEntityData["assets"];
                    } else if (key == 'configuration_items' && self.from == 'cmdb') {// No I18N
                        var arr = [];
                        arr.push(associatedEntityData);
                        self.overWriteEntitydata["configuration_items"] = arr;
                    } else {
                        self.overWriteEntitydata[key] = associatedEntityData[key];
                    }
                }
            }

            templateId = options.templateId ? options.templateId : (self.entitydata ? self.entitydata.template.id : null);

            self.loadTemplate(templateId, self.editId, templatePB, self.entitydata, null, self.overWriteEntitydata ? self.overWriteEntitydata : null);
        }
        if(window.checkIfMSP()){
        	this.mspform.initialize();
        }
    },
    /*Load template*/
    loadTemplate: function (templateId, editId, templateProb, entityData, forcesave, overWriteEntitydata) {
        try {
            var self = this;
            var templatePB = templateProb ? templateProb : self.getEntityAll(templateId ? self.base_url + '/template/' + templateId : self.entityName + '_templates/_default', null, self.entityName + '_template')[0];//NO I18N
            self.templatePB = templatePB;
            if (self.editId && entityData) {
                self.metainfo = self.getEntityAll(self.base_url + '/' + entityData.id + '/_metainfo', null, 'metainfo')[0];//NO I18N
            }
            var formHeaderData = {};
            formHeaderData.editId = editId;
            formHeaderData.module = self.entityName;
            formHeaderData.from = self.from;
            formHeaderData.$problemGlobal = $problemGlobal;
            formHeaderData.entityNamePl = self.entityNamePl;
            formHeaderData.externalframe = self.externalframe;
            renderhbs('#pb-header', 'pb-header-template', formHeaderData, false, 'problems',true);//No I18N
            if(self.from == 'cmdb')
            {
                jQuery('#pb-header').addClass('disableDiv');
            }
            //Remove created and completed time while opening new page
            if (!self.editId) {
                delete self.metainfo.fields.closed_time;
                delete self.metainfo.fields.reported_time;
            }
            /* Modify metainfo to add some properties for component */
            self.constructMetaInfo(self.metainfo.fields);

            self.constructTemplateInfo(templatePB);
            self.initTemplateList(templatePB);
            templatePB[self.entityName].created_time = entityData && entityData.created_time;
            if (self.associatedSelOverwriteId && overWriteEntitydata) {
                templatePB[self.entityName] = self.currentTemplateContentFromAssociateEntity(templatePB[self.entityName], jQuery.extend(true, {}, overWriteEntitydata));
            }

            var oldProblemTasksTmplIds=entityData ? entityData.problem_template_task_ids : null;
            entityData = self.selOverwriteId ? self.currentTemplateContent(entityData, templatePB) : entityData;

			if(isMSP) {
				this.mspform.loadTemplateDetailsForMSP(templateId, editId, templateProb, templatePB);
			} else {
            if (self.editId && entityData) {
                entityData.site = entityData.site ? entityData.site : { "id": -1, "name": translate('common.site.nosite') };//NO I18N
            }
            if (!self.editId || (self.editId && !entityData && templateId)) {
                templatePB[self.entityName].site = templatePB[self.entityName].site ? templatePB[self.entityName].site : { "id": -1, "name": translate('common.site.nosite') };//NO I18N
            }
            }
            var entityDataforForm = entityData || templatePB[self.entityName];

            if(templatePB.task_templates && templatePB.task_templates.length>0){
                entityDataforForm.problem_template_task_ids=[];
                templatePB.task_templates.forEach(function(task){
                    if(!self.editId || Handlebars.helpers.containsObj(oldProblemTasksTmplIds,task.associated_task_template.id)){
                        entityDataforForm.problem_template_task_ids.push(task.associated_task_template);
                    }
                })
            }
            var configJSON = {
                name: "pbForm",// No I18N
                entity: self.entityName,
                entitypath: "/" + self.entityNamePl,// No I18N
                template: templatePB,
                metadata: jQuery.extend(true, {}, self.metainfo),
                entitydata: entityDataforForm,
                mode: self.editId ? "edit" : "new",// No I18N
                container: "pb-container",// No I18N
                formid: "pbForm",// No I18N
                inlineImagesEntity: self.entityName,
                customform: true,
                linkedFields: self.getLinkedFieldsForValidation(self.editId ? "edit" : "new"),
                allowedValuesCallback: "$PBForm.getAllowedValues",//No I18N
                edit: {
                    fields: {
                        associated_asset: {
                            selection_handler: (self.operation == "associateto") ? false : "$PBForm.showAssoicateAssetList",//NO I18N
                            selection_icon_class: "fl cspr asset1 icon-sm mr30 right0",//NO I18N
                            maxvalues: 100
                        },
                        configuration_items:{
                            selection_handler: "$PBForm.showAssociateCIList",//NO I18N
                            selection_icon_class:"fl cspr asset1 icon-sm mr30 right0",//NO I18N
                            maxvalues: 200
                        },
                        description: {
                            images_api: true,
                            images_url: "/api/v3/" + self.base_url + "/images"//NO I18N
                        },
                        status: {
                            allowClear: false
                        },
                        site: {
                                allowClear: false,
                                processResults:function(search_data, data, field, self) {

                                    if (search_data.length && self.settings && self.settings.default_option && self.settings.default_option.id == data.id) {
                                        //Option duplicated for NAS in search_data
                                        return;
                                    }
                                    search_data.push(data);
                                }
                        },
                        affected_service: {
                            selection_handler: "$PBForm.allowedValuesForServices", //No I18N
                            maxvalues: 100
                        }
                    },
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    }
                },
                dependentFields: [{
                    fields: ["category", "subcategory", "item"],    //No I18N
                    order: true
                },
                {
                    fields: ["site", "group", "technician"],    //No I18N
                    order: false
                }],
                fafrDynamic: ["site", "technician", "group"],	// No I18N
                save: {
                    url: self.editId ? "/api/v3/" + self.entityNamePl + "/" + self.editId + "" : "/api/v3/" + self.entityNamePl,//NO I18N
                    entity: self.entityName,
                    submit: true,
                    forcesave: forcesave,
                    serializer: "$PBForm.executeWhileSave",//NO I18N
                    cancel: "$PBForm.cancelForm",//No I18N
                    success: "$PBForm.postDataAdded",//No I18N
                    submitbutton: {
                        add: window.translate("problems.newproblem.addproblem"), //No I18N
                        edit: window.translate("problems.newproblem.update") //No I18N
                    },
                    reset: true,
                    exit_alert:false
                },
                entityName: translate('common.newproblem'),//No I18N
                afterRenderCallback: "$PBForm.afterrenderpage" //No I18N
            }
            if(sdp_user.ROLES ){
                if(!(sdp_user.ROLES.indexOf("Restrict site access") > -1) || (sdp_user.ROLES.indexOf("ViewRequestsNotInAnySite") > -1)){
                    configJSON.edit.defaults.site = {
                        id: "-1",    //No I18N
                        name: translate("common.site.nosite")   //No I18N
                    };
                }else if(configJSON.mode=='new'){ //No I18N
                    let input_data = {"list_info": { "row_count" : "1" } }; //No I18N
                    let response = this.getEntityAll(this.base_url + '/site', null, 'site', input_data); //No I18N
                    configJSON.edit.defaults.site = response[0];
                    configJSON.edit.fields.site.syncDefault = true;
                }

            }
            configJSON.edit.fields.reported_by = {
                selection_handler: "$PBForm.showProbUserSearchPopup",   //NO I18N
                selection_icon_class: "cspr contact opac7 icon-sm opac fl", //NO I18N
                selection_title: translate('sdp.admin.requesterList.searchWord')
            }
            isMSP && this.mspform.modifyConfigJSONForMSP(configJSON);

            if(self.from!='request'){
                configJSON.spa = {
                    "data-spa":true,//NO I18N
                    "data-spa-module":"problems",//NO I18N
                    "data-spa-page":self.fromPage=="detail"?"problem-detail":"problem-list",//NO I18N
                    "href":'/ui/problems?'+(self.fromPage=="detail"?('mode=detail&entity_id='+self.editId):"mode=list")//NO I18N
                }
            }
            window.$probform = new FC(configJSON);
            var headerParent = jQuery('#pb-header');

            headerParent.off('change').on('change', '#pb_template', function (event) {//NO I18N
                if (self.editId) {
                    self.changeTemplateConfirm(this.value, event)
                } else if (self.associatedSelOverwriteId && overWriteEntitydata) {
                    /** To retain the associating entity data after template change **/
                    $probform.destroy();
                    self.loadTemplate(this.value, self.editId, null, null, forcesave = true, overWriteEntitydata);
                }
                else {
                    $probform.destroy();
                    self.loadTemplate(this.value);
                }
            });
            /** for template preview, the save method should not do anything */
            if (this.templatePreview) {
                configJSON.save.controller = function (payload, form, event) {
                    event.stopPropagation();
                    event.target.disabled = false;
                };
                configJSON.save.cancel = function (form) {
                    event.stopPropagation();
                    window.close();
                }
                configJSON.save.exit_alert = false;
            }
            if (editId) {
                jQuery("#browserTitleInfo").find("#bt_id").text(entityData.id).end().find("#bt_title").text(entityData.title);// No I18N
            }
            applyBrowserTitle();

        } catch (e) {
            console.error(e);
        }
    },
    //Handling post success(When permission is not present sent to list view)
    postDataAdded: function (data, form) {
        var self = this;
        if (data && data.response_status && (data.response_status.status === "success" || data.response_status.status === "warning" || (jQuery.isArray(data.response_status) && data.response_status[0].status === "success"))) {
            form.entitydata = data[self.entityName];
            if (form.mode === "new") {
                var response = self.getEntityAll(self.entityNamePl, data[self.entityName].id);
                if (response.response_status && response.response_status.status == "failed" && response.response_status.messages && response.response_status.messages[0].status_code == 4002) {
                    window.top.showalert("success", translate("common.createandnoview.permission.message", [translate("sdp.common.success"), self.display_name, data[self.entityName].id, self.display_name]), "isAutoHide=false"); //No I18N
                    if (!(self.operation == "associateto")) {
                        $problemGlobal.redirectTo({ mode: "list" });//No I18N
                    } else {
                        $previewComponent.iframeActiveParent().window.$previewComponent && $previewComponent.iframeActiveParent().window.$previewComponent.closePreview("newproblem_popup");// No I18N
                    }
                } else {
                    if (self.operation == "associateto") {
                        self.associateTo(data[self.entityName].id);
                    } else {
                        window.showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
                        $problemGlobal.redirectTo({ mode: "detail", id: data[self.entityName].id });//No I18N
                    }
                }
            } else {
                window.showalert("success", translate("api.updated.success", [self.display_name]), "isAutoHide=true");   //No I18N
                $problemGlobal.redirectTo({ mode: "detail", id: data[self.entityName].id });//No I18N
            }
        }
    },
    //Associates to given entity post success
    associateTo: function (pb_id) {
        var self = this;
        if (self.entityNamePl == "problems" && self.from == "request") { // No I18N
            var data = sdpAjaxInputData({
                associated_incidents: [{ "request": { "id": self.associatedEntityId } }]// No I18N
            });
            const activeWindow = $extFrame.getActiveWindow(parent.location.href);
            //refer 'workLogForm.js' for usage of this function
            var sdpOptions = {
                url: "/api/v3/problems/" + pb_id + "/associated_incidents", // No I18N
                data: data,
                type: "POST",// No I18N
                success: function (resp) {
                    var showalert = activeWindow.showalert;
                    showalert("success", translate("api.associate.success.msg", [translate("sdp.problem.problemtab")]), "isAutoHide=true, delay=3"); //No I18N
                    activeWindow.$req.details.updateRequestTemplates('problem');// No I18N
                },
                async: false
            }
            sdpAjax(sdpOptions);
            activeWindow.$previewComponent.closePreview("newproblem_popup");// No I18N
        }
        else if (self.entityNamePl == "problems" && self.from == "cmdb") { // No I18N
            const activeWindow = $extFrame.getActiveWindow(parent.location.href);
            var showalert = activeWindow.showalert;
            window.top.$ciAssociation.handlePostProblemCreation();
            showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
            activeWindow.$previewComponent.closePreview("newproblem_popup");// No I18N
        }
    },
    /* Modify metainfo to add the missing properties required for components */
    constructMetaInfo: function (metaFields) {
        /*Code for removing multiselect icon for all multiselect roles and udf_multiseelct fields*/
        var metaKeys = Object.keys(metaFields);
        for (var i = 0; i < metaKeys.length; i++) {
            if (metaFields[metaKeys[i]].type == "lookup") {
                metaFields[metaKeys[i]].placeholder = translate("form.select.placeholder", [metaFields[metaKeys[i]].display_name]);
            }

        }
    },
    /*Before Rendering form constructing template field changes*/
    constructTemplateInfo: function (templatePB) {
        var self = this;
        !templatePB[self.entityName].site ? templatePB[self.entityName].site = null : null;
        var layouts = templatePB.layouts;
        self.rolesObjArr = [];
        var layout = {};
        //Attachment section is appended when template preview window is refreshed
        layout = layouts[0];
        var inputDataCallbackObj = self.getInputDataCallback();
        /* Add config input_data_Callback for status field */
        if (layout) {
            jQuery.each(layout.sections[0].fields, function (i, field) {
                if (inputDataCallbackObj.hasOwnProperty(field.name)) {
                    field.input_data_Callback = inputDataCallbackObj[field.name];
                }
                field.sort = false;
            });
        }
        self.modifyUDFFieldsProperty(layout, templatePB[self.entityName].udf_fields);


        /** adding Attachments inside layout */
        var attachLayout = {};
        attachLayout.title = window.translate("sdp.common.attachments"); //No I18N
        attachLayout.name = "attachment";
        attachLayout.sections = [{
            type: "attachments",    //No I18N
            id: "attachments",  //No I18N
            container_id: "pb-attachment", //No I18N
            options: {
                api: false,
                upload_api: true,
                upload: true,
                enable_delete: true,
                is_odapi: true,
                download: true,
                entity: self.entityNamePl,
                entity_id: self.editId,
                entity_upload: self.editId ? true : false,
                description:true
            }
        }];
        layouts.splice(1, 0, attachLayout);

        /** adding Tasks layout */
        if (templatePB.task_templates && templatePB.task_templates.length > 0) {
            var taskLayout = {};
            taskLayout.custom_layout = true;
            taskLayout.has_fields = true;
            taskLayout.partial = "pb-tasks-template",//No I18n
                taskLayout.sections = [{
                    has_fields: true,
                    collapsed_state: "expanded",	//No I18N
                    column_count: "1",	//No I18N
                    field_align: "left-right",	//No I18N
                    fields: [{
                        name: "problem_template_task_ids",//No I18n
                        title: translate("task.title"),//No I18n
                        position: {
                            col: 1,
                            col_size: 12,
                            row: 1,
                            row_size: 12
                        }
                    }]
                }]
            layouts.splice(2, 0, taskLayout);
        }


        return templatePB;
    },
    /* Closed time and due by time validations for Form and details page edit */
    getLinkedFieldsForValidation: function (mode) {
        let linkedFields =  [
            {
                fields: ["reported_time", "closed_time", "due_by_time"], //NO I18N
                denote_field: ["reported_time"],
                message: translate("api.validation.reportedtime"),
                validation: function (valueJson) {
                    if ((valueJson.due_by_time && valueJson.reported_time > valueJson.due_by_time ) || ( valueJson.closed_time && valueJson.reported_time > valueJson.closed_time))
                    {
                        return false;
                    }
                    return true;
                }
            },
            {
                fields: ["reported_time", "closed_time"], //NO I18N
                denote_field: ["closed_time"], //NO I18N
                message: translate("apicodes.80000"), //NO I18N
                validation: function (valueJson) {
                    if (valueJson.closed_time && valueJson.reported_time > valueJson.closed_time) {
                        return false;
                    }

                    return true;
                }
            },
            {
                fields: ["reported_time", "due_by_time"], //NO I18N
                denote_field: ["due_by_time"], //NO I18N
                message: translate("apicodes.80001"), //NO I18N
                validation: function (valueJson) {
                    if (valueJson.due_by_time && (valueJson.reported_time > valueJson.due_by_time || (mode=='new' && valueJson.due_by_time < new Date().getTime()))) {
                        return false;
                    }

                    return true;
                }
            }];
            return linkedFields;
    },
    /**
     * Construct input data to get fields allowed values
     */
    getInputDataCallback: function () {
        var obj = {
            group: function (urlOptions, input_data, searchText) {
                var fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                var siteId = (fieldsValue && fieldsValue.site && (fieldsValue.site != -1)) ? fieldsValue.site : null;
                var json = {
                    "field": "site", //No I18N
                    "condition": "is",       //No I18N
                    "value": siteId       //No I18N
                };
                if(searchText){
                    json.children = [];
                    json.children.push({
                        "field": "name",      //No I18N
                        "condition": "like",      //No I18N
                        "values": [      //No I18N
                            searchText
                        ],
                        "logical_operator": "and"      //No I18N
                    });
                }
                input_data.list_info.search_criteria = json;
                delete input_data.list_info.search_fields;
                return input_data;
            },
            technician: function (urlOptions, input_data, searchText) {
                var fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                var siteId = (fieldsValue && fieldsValue.site) ? fieldsValue.site : -1;
                var groupId = (fieldsValue && fieldsValue.group) ? fieldsValue.group : null;
                var groupJson = {};
                if (groupId) {
                    groupJson = { "field": "support_group", "condition": "=", "value": groupId, "logical_operator": "and" }; //No I18N
                }
                var json = {
                    "field": "associated_sites", "condition": "is", "value": siteId, //No I18N
                };
                if(searchText || groupId){
                    json.children = [];
                }
                if(searchText){
                    json.children.push({"field": "name", "condition": "like", "values": [searchText], "logical_operator": "and"}) //No I18N
                }
                if (groupId) {
                    json.children.push(groupJson);
                }

                input_data.list_info.search_criteria = json;
                delete input_data.list_info.search_fields;
                return input_data;
            },
            subcategory: function (urlOptions, input_data, searchText) {
                var json = getSearchCriteriaJson("category","is",urlOptions.formcomp.fields.values.category,getSearchCriteriaJson("name","like",[searchText],"and"));//No I18N
                input_data.list_info.search_criteria = json;
                delete input_data.list_info.search_fields;
                return input_data;
            },
            item: function (urlOptions, input_data, searchText) {
               var json = getSearchCriteriaJson("subcategory","is",urlOptions.formcomp.fields.values.subcategory,getSearchCriteriaJson("name","like",[searchText],"and"));//No I18N
               input_data.list_info.search_criteria = json;
               delete input_data.list_info.search_fields;
               return input_data;
            },
        }
        isMSP && this.mspform.modifyInputDataCallbackForMSP(obj);
        return obj;
    },
    /**
     * Adds context=udf_fields inside fields property
     * @layouts - [Object] layouts which contains fields
     * @udf_fields - [Object] to identify udf_fields in template layout fields, udf_fields is passed
     */
    modifyUDFFieldsProperty: function (layouts, udf_fields) {
        var self = this;
        /*as per component need to pass context = "udf_fields" then only udf_fields render in form*/
        var inputdataCB = self.getInputDataCallback();
        jQuery.each(layouts.sections, function (i, section) {
            jQuery.each(section.fields, function (j, field) {
                if (udf_fields && udf_fields.hasOwnProperty(field.name)) {
                    field.context = "udf_fields";      //No I18N
                }
                field.sort = false;
                if (inputdataCB.hasOwnProperty(field.name)) {
                    field.input_data_Callback = inputdataCB[field.name];
                }
            });
        });
    },
    /** Initiate template list in dropdown while new/edit page loading */
    initTemplateList: function (templatePB) {
        var listInfo = { "start_index": 1, "row_count": 100 }//No I18N
        var self = this;
        jQuery('#pb-header').find("#pb_template").sdp_select2({
            url:[{
                url:'/api/v3/'+self.base_url+'/template',//No I18N
                field: 'template',//No I18N
                list_info: listInfo
            }],
            value: {text: templatePB.name,id: templatePB.id},
            formatNoMatches: translate('ae.select2.no.message')
        });
    },
    /*Execute function while click save/update button*/
    executeWhileSave: function (payload, form, event) {
        var self = this;
        var obj = { "description": payload[self.entityName].images };//NO I18N
        payload[self.entityName].images && (payload[self.entityName].images = obj);
        var siteId = payload[self.entityName].site ? payload[self.entityName].site.id : null;
        if (siteId == "-1") { payload[self.entityName].site = null; }
        else if (siteId) { payload[self.entityName].site = { "id": siteId } };
        var templateId = jQuery('#pb-header').find("#pb_template")[0].value;//NO I18N
        payload[self.entityName].template = { id: templateId };
    },
    /*Function execute after rendering page*/
    afterrenderpage: function (form) {
        var self = this, parentElement = jQuery('#pb-container');

        /** For template preview, the attachment support should be disabled */
        if (self.templatePreview) {
            jQuery("#pb-attachment-container").removeAttr("data-drop-uuid").css("pointer-events", "none").parents('#content-panel').find('#probFormBack').css("pointer-events", "none").parent().find('#pb_template').select2("enable", false);//No I18N
        }
        //click function for asset/Cis popup
        jQuery('#associated_asset_actions').next().attr('title', translate('sdp.requests.assets.icon.addmore'));
        /*Disable assets when ViewInventoryWS is not present in roles*/
        if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.includes('ViewInventoryWS') == false) {
            form.fields.hasOwnProperty("associated_asset") && (form.fields.associated_asset.disabled = true);//No I18N
        }
        isMSP && self.mspform.afterPageRenderForMSP(form);
        /*Disable CI when ViewCI is not present in roles*/
        if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
            form.fields.hasOwnProperty("configuration_items") && (form.fields.configuration_items.disabled = true);//No I18N
        }
    },
    showAssociateCIList : function(){
        let jQBody = jQuery("body"); // NO I18N
    	if (!jQBody.find("#ci-association-container").length) {// NO I18N
    	    jQBody.append('<div id="ci-association-container"></div>'); // NO I18N
    	}
        assetsObj.loadAttachCIPopup('problems','configuration_items','ci-association-container');//No I18N
    },
    showAssoicateAssetList: function (form, field) {
        assetsObj.loadAttachAssetPopup('problem', "attach_asset", field);//NO I18N
    },

    allowedValuesForServices: function (formalias, fname, isEdit, event) {
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = { "list_info": { "start_index": 1, "row_count": 100, "sort_field": "id" } }; //No I18N
        if (!field.allowedValues) {
            var data = this.getEntityAll(this.base_url + '/affected_service', null, 'affected_service', input_data , true);//No I18N
            field.allowedValues = data;
        }
        FC.showBulkSelect(formalias, fname, isEdit, event, true);
    },

    /*Passed this for bulk select for services once handled in component need to remove*/
    getAllowedValues: function (callback, formcomp) {
        var self = this;
        formcomp.allowedValues.problem_template_task_ids = self.templatePB.task_templates.map(function (each) { return each.associated_task_template });
    },
    changeTemplateConfirm: function (templateID, event) {
        var self = this;
        jQuery('body').on('change', '[name=overwritetmp]', function () {
            self.selOverwriteId = jQuery("input[name='overwritetmp']:checked").val();
        });
        self.selOverwriteId = self.selOverwriteId?self.selOverwriteId:3;

        $problemGlobal.showOverwritePopup(null, null,self.selOverwriteId,function (didConfirm) {
            if (didConfirm) {
                if (self.editId) {
                    /** copies the "this.request_info" data to "this.entitydata" (resets it) */
                    self.entitydata = jQuery.extend(true, {}, self.entityRefData);
                    $probform.destroy();
                    self.loadTemplate(templateID, self.editId, null, self.entitydata, forcesave = true);
                    $probform.fields.changed.push('problem_template_task_ids');
                }
            } else {
                jQuery('#pb-header').find("#pb_template").select2('data', event.removed);//NO I18N
            }
        }
        );
    },
    currentTemplateContentFromAssociateEntity: function (templateData, associatedEntityData) {
        var self = this;

        /* For overwriting all fields*/
        if (self.associatedSelOverwriteId == 1) {
            return jQuery.extend(true,{},templateData);
        }
        /* For overwriting empty fields*/
        else if (self.associatedSelOverwriteId == 2) {
            return templateData = merge(templateData, associatedEntityData);
            function merge(obj1, obj2) {
                answer = jQuery.extend(true, {}, obj2);
                for (key in obj1) {
                    if(!obj2[key]){
                       if(self.CSI.indexOf(key)==-1 && self.SGT.indexOf(key)==-1){
                            answer[key] = obj1[key];
                        }
                    }
                    else if(Array.isArray(obj2[key]) && obj2[key].length==0){
                        answer[key] = obj1[key];
                    }
                }
                var i=0;
                var dependancies = [self.CSI,self.SGT];
                dependancies.forEach(function(each){
                    for(i=0;i<each.length;i++){
                        var parent = each[i-1];
                        var current = each[i];
                        var child = each[i+1];
                        if(!obj2[current] && (!parent || (answer[parent] && obj1[parent] && answer[parent].id==obj1[parent].id))){
                            answer[current]=obj1[current];
                            if(child){
                                delete obj2[child];
                            }
                        }
                    }
                })

                return answer;
            }
        }
        else if(self.associatedSelOverwriteId == 3){
            return jQuery.extend(true,{},associatedEntityData);
        }

    },
    /*While changing template for overwrite fields*/
    currentTemplateContent: function (entityData, templatePB) {
        var self = this;
        //Attachment is not included in Template's entity data in api
        templatePB[self.entityName].attachments = [];
        /* For overwriting all fields*/
        if (self.selOverwriteId == 1) {
            templatePB[self.entityName].reported_time = entityData.reported_time;
            return  entityData = null;
        }
        /* For overwriting empty fields*/
        else if (self.selOverwriteId == 2) {
            return entityData = merge(entityData, templatePB);
            function merge(obj1, templatePB) {
                var obj2 = templatePB[self.entityName];
                answer = jQuery.extend(true, {}, obj1);
                for (key in obj2) {
                    if (self.SGT.indexOf(key) == -1) {
                        if (!obj1[key] || (jQuery.isArray(obj1[key]) && obj1[key].length == 0)) {
                            if (self.CSI.indexOf(key) >= 0) {
                                //If there is no category in entity data, then copy template data for overwrite empty field values
                                if (obj1["category"] == null) {
                                    answer[key] = obj2[key];
                                }
                            } else {
                                //If there is new field in template or field is empty in entity data, then copy template data
                                answer[key] = obj2[key];
                            }
                        } else {
                            if (key == "udf_fields") {  //NO I18N
                                answer[key] = {};
                                for (var udfField in obj2[key]) {
                                    if (obj1[key][udfField] == null || (jQuery.isArray(obj1[key][udfField]) && obj1[key][udfField].length == 0)) {
                                        answer[key][udfField] = obj2[key][udfField];
                                    } else {
                                        answer[key][udfField] = obj1[key][udfField];
                                    }
                                }
                            } else {
                                //If there is value in entity data, then retain that data
                                answer[key] = obj1[key];
                            }
                        }
                    }
                }
                for(i=0;i<self.SGT.length;i++){
                    var parent = self.SGT[i-1];
                    var current = self.SGT[i];
                    var child = self.SGT[i+1];
                    if(!answer[current] && (!parent || (answer[parent] && obj2[parent] && answer[parent].id==obj2[parent].id))){
                        answer[current]=obj2[current];
                        if(child){
                            delete answer[child];
                        }
                    }
                }
                return answer;
            }
        }
        /* For do not overwrite*/
        else if (self.selOverwriteId == 3) {

            return entityData = merge(entityData, templatePB);
            function merge(obj1, templatePB) {
                var obj2 = templatePB[self.entityName];
                // Replace all the keys which is present in obj1(existing form data) in obj2(new template data)
                for (key in obj2) {
                    if (key in obj1) {
                        if (key == "udf_fields") {
                            for (var udfField in obj2[key]) {
                                if (udfField in obj1[key]) {
                                    obj2[key][udfField] = obj1[key][udfField];
                                }
                            }
                        }
                        else {
                            obj2[key] = obj1[key];
                        }
                    }
                }
                return obj2;
            }
        }
    },
    /*Click function for back/cancel button in new/edit page*/
    cancelForm: function () {
        if (this.from == "request" || this.from == "cmdb") {   //NO I18N
            $previewComponent.iframeActiveParent().window.$previewComponent && $previewComponent.iframeActiveParent().window.$previewComponent.closePreview("newproblem_popup");// No I18N
        }
    },
    /* Function for ajax call*/
    getEntityAll: function (moduleName, moduleid, entityName, inputData, getAllData) {
        var url = moduleid ? moduleName + '/' + moduleid : moduleName;
        var entityData = [], hasmorerows = false;
        do {
            try {
                var sdpOptions = {
                    url: '/api/v3/' + url,//NO I18N
                    cache: false,
                    async: false,
                    data: sdpAjaxInputData(inputData),
                    success: function (response) {
                        entityData = entityData.concat(entityName ? response[entityName] : response);
                        if (getAllData && response.list_info && response.list_info.has_more_rows) {
                            inputData.list_info.start_index = response.list_info.start_index + response.list_info.row_count;
                            hasmorerows = true;
                        } else {
                            hasmorerows = false;
                        }


                    },
                    error: function (response) {
                        entityData = response.responseJSON;
                        hasmorerows = false;
                    }
                };
                sdpAjax(sdpOptions);
            }
            catch (e) {
                console.error(e);
                hasmorerows = false;
            }
        } while (hasmorerows);

        return entityData;
    },
    /*Set properties while initialize*/
    setProp: function (options) {
        var self = this;
        self.editId = options.id && options.id != "null" ? options.id : null;//NO I18N
        self.entityName = "problem";// No I18N
        self.entityNamePl = self.entityName + "s";    //No I18N
        self.base_url = self.editId ? self.entityNamePl + "/" + self.editId : self.entityNamePl;   //NO I18N
        self.metainfo = self.getEntityAll(self.base_url + '/_metainfo', null, 'metainfo')[0];//NO I18N
        self.display_name = translate('common.newproblem'); // No I18N
        if (options.from) {
            self.from = options.from;
        }
        if (options.associatedEntityId) {
            self.associatedEntityId = options.associatedEntityId;
        }
        if (options.operation) {
            self.operation = options.operation;
        }
        if (options.overwrite_option) {
            self.overwrite_option = options.overwrite_option;
        }
    },
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelect: function (formalias, fname, isEdit, event) {
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = { "list_info": { "start_index": 1, "row_count": 100, "sort_field": "id" } }; //No I18N
        if (!field.allowedValues) {
            sdpAjax({
                url: "/api/v3" + field.href, //No I18N
                async: false,
                cache: false,
                data: { input_data: sdpToJSON(input_data) },
                success: function (data) {
                    field.allowedValues = data[lookup_entity];
                    FC.showBulkSelect(formalias, fname, isEdit, event, true);
                }
            });
        } else {
            FC.showBulkSelect(formalias, fname, isEdit, event, true);
        }
    },
    /* Function for clicking contact icon behind Problem Reporter*/
    showProbUserSearchPopup: function (form, field) {
        var searchText = jQuery('[name="' + field + '"]').select2('data') ? jQuery('[name="' + field + '"]').select2('data').name : null;//NO I18N
        showUserSearchPopup('Problem', true, searchText, 'problems', 'null', 'reported_by');//NO I18N
    },
    /**
     * Post user selection method is Userspopup window
     */
    setUsersPopupSelection: function (select2Userdetails) {
        var _self = this;
        jQuery('[name="reported_by"]').select2('data', select2Userdetails).trigger("change"); //NO I18N
    }
}
