/* $Id$ */
var $releaseForm = jQuery.extend(true, window.ChangeReleaseForm, (function(){
    return {
        /*Initialize new/edit form */
        initialize: function (options) {
            jQuery('body').removeClass('of-h');
            let _self = this;
            $CRObj.isRMRE = sdp_user.ROLES.contains('SDReleaseManager');  //NO I18N
            _self.setProp(options);
            _self.fromPage = $CRObj.fromPage;
            Handlebars.registerPartial("rc-header-template", renderhbs(null, "release_form_header_template", null, false, "release", true, true, null, true));	//No I18N
            /*For executing when click preview from admin>>release_template*/
            _self.templatePreview = window.opener && window.opener.preview_json && window.opener.preview_json.release_template;
            if (_self.templatePreview && _self.entityName === "release") {
                _self.loadTemplate(null, null, window.opener.preview_json.release_template);
                jQuery("#header-placeholder").css("pointer-events", "none");  //NO I18N
                jQuery("#securityrisk, #top-subheader").addClass("hide");
            } else {
                _self.entitydata = null;
                let templateRC = null;
                if (_self.editId && _self.editId !== "null") {
                    _self.isEditForm = true;
                    _self.entitydata = _self.getEntityAll(_self.entityNamePl, _self.editId, _self.entityName)[0];
                    _self.entityRefData = jQuery.extend(true, {}, _self.entitydata);
                    templateRC = _self.getEntityAll(_self.base_url + '/template', _self.entitydata.template.id, _self.entityName + '_template')[0];//NO I18N
                    _self.template = jQuery.extend(true, {}, templateRC);
                    if (window.checkIfMSP()) {
                        addAndSetAccountInCombo(_self.entitydata.account.id, true, _self.entitydata.account.name);
                    }
                } else if (_self.from && (_self.operation === "associateto") && (_self.overwrite_option === "overwriteAll" || _self.overwrite_option === "overwriteEmpty")) { //NO I18N
                    _self.associatedSelOverwriteId = (_self.overwrite_option === "overwriteAll") ? "1" : "2"; //NO I18N
                    const associatedEntityData = _self.getEntityAll(_self.from + "s", _self.associatedEntityId, _self.from)[0];
                    let keysToSync = [];
                    if (_self.from === "change") { //NO I18N
                        keysToSync = ["change_type", "urgency", "group", "risk", "subcategory", "services", "title", "scheduled_start_time", "impact", "site", "priority", "category", "item", "assets", "description", "scheduled_end_time","configuration_items"];//NO I18N
                    } else if (_self.from === "project") { //NO I18N
                        keysToSync = ["title", "priority", "site", "description"]; //NO I18N
                    }
                    _self.overWriteEntitydata = {};
                    for (let index = 0; index < keysToSync.length; index++) {
                        const key = keysToSync[index];
                        _self.overWriteEntitydata[key] = associatedEntityData[key];
                    }
                    if (_self.overWriteEntitydata.assets && _self.from === "change") { //NO I18N
                        sdpAjax({
                            url: "/api/v3/" + _self.from + "s/" + _self.associatedEntityId + "/get_associated_assets", // No I18N
                            type: "GET",// No I18N
                            success: function (resp) {
                                _self.overWriteEntitydata.assets = resp.get_associated_assets.assets;
                            },
                            async: false
                        });
                    }
                }

                _self.loadTemplate(_self.entitydata ? _self.entitydata.template.id : null, _self.editId, templateRC, _self.entitydata, null, _self.overWriteEntitydata ? _self.overWriteEntitydata : null);
                //This object helps to find from which page, form is invoked
                $CRObj.fromPage = "";
            }
            isMSP &&  this.mspform.initialize();
        },
        /*Load template*/
        loadTemplate: function (templateId, editId, templateRel, entityData, forceSave, overWriteEntityData) {
            try {
                let self = this;
                let templateRC = templateRel ? templateRel : self.getEntityAll(templateId ? self.base_url + '/template/' + templateId : self.entityName + '_templates/_default', null, self.entityName + '_template')[0];//NO I18N
                self.modifyTemplateEntityData(templateRC);
                if (self.editId && entityData) {
                    self.metainfo = self.getEntityAll(self.base_url + '/' + entityData.id + '/metainfo', null, 'metainfo')[0];//NO I18N
                }
                //Remove created and completed time while opening new page
                let metainfoFields = self.metainfo.fields;
                if (!self.editId) {
                    delete metainfoFields.completed_time;
                    delete metainfoFields.created_time;
                } else {
                    sdpAjax({
                        url: '/api/v3/releases/' + entityData.id + '/get_properties', success: function (resp) { //NO I18N
                            getData = resp;
                        }, async: false
                    });
                    if (getData && getData.release && getData.release.submission_edit === true) {
                        self.canEdit = true;
                    }
                }
                /* Modify metainfo to add some properties for component */
                self.constructMetaInfo(metainfoFields);
                self.constructTemplateInfo(templateRC);
                templateRC[self.entityName].created_time = entityData && entityData.created_time;
                if (self.associatedSelOverwriteId && overWriteEntityData) {
                    templateRC[self.entityName] = self.currentTemplateContentFromAssociateEntity(templateRC[self.entityName], jQuery.extend(true, {}, overWriteEntityData));
                }
                entityData = self.selOverwriteId ? self.currentTemplateContent(entityData, templateRC) : entityData;
                //Roles format change
                self.getEditData = entityData ? Object.assign({}, entityData) : Object.assign({}, templateRC[self.entityName]);
                const getEditRoles = self.getEditData.roles;
                if (getEditRoles && getEditRoles.length > 0) {
                    let roleArrTemp = [];
                    for (let i = 0; i < getEditRoles.length; i++) {
                        const temp = getEditRoles[i], obj = {};
                        obj.role = {id: temp.role.id};
                        obj.user = {id: temp.user.id};
                        if (temp.id) {
                            obj.id = temp.id;
                        }
                        roleArrTemp.push(obj);
                    }
                    self.getEditData.roles = roleArrTemp;
                }

                let rolesData = entityData ? entityData.roles : (templateRC[self.entityName] && templateRC[self.entityName].roles);
                if (rolesData.length > 0) {
                    let rolesShowUI = self.serializeRolesDataForFC(rolesData, metainfoFields.roles.fields);
                    entityData ? entityData.roles = rolesShowUI : templateRC[self.entityName].roles = rolesShowUI;
                    //Append inactive roles by checking metainfo, to the roles template
                    if (entityData) {
                        let inactiveRoles = [], rolesLayout;
                        jQuery.each(templateRC.layouts, function (i, layout) {
                            if (layout.name === "role") {
                                rolesLayout = layout;
                                return false;
                            }
                        });
                        inactiveRoles = self.checkInactiveRoles(rolesShowUI, metainfoFields.roles.fields, rolesLayout);
                        inactiveRoles && rolesLayout.sections.push(inactiveRoles);
                    }
                }
                if (self.editId && entityData) {
                    entityData.site = entityData.site ? entityData.site : {
                        "id": -1, //NO I18N
                        "name": translate('common.site.nosite') //NO I18N
                    };
                    entityData.description = appendImageToken(entityData.description, entityData.image_token);
                } else if (templateId) {
                    templateRC[self.entityName].description = appendImageToken(templateRC[self.entityName].description, templateRC[self.entityName].image_token);
                }
                if (!window.checkIfMSP() && (!self.editId || (self.editId && !entityData && templateId))) {
                    templateRC[self.entityName].site = templateRC[self.entityName].site ? templateRC[self.entityName].site : {
                        "id": -1, //NO I18N
                        "name": translate('common.site.nosite') //NO I18N
                    };
                }
                isMSP && this.mspform.loadTemplateDetailsForMSP(templateId, editId, templateRel, templateRC);
                //Disable edit for site & group in requester login
                const skipEditFields = (sdp_user.USERTYPE === "Requester") ? ["site", "group"] : [];   // No I18N
                let configJSON = {
                    name: "rcForm",// No I18N
                    entity: self.entityName,
                    entitypath: "/" + self.entityNamePl,// No I18N
                    template: templateRC,
                    metadata: jQuery.extend(true, {}, self.metainfo),
                    skipEditFields: skipEditFields,
                    entitydata: entityData || templateRC[self.entityName],
                    mode: self.editId ? "edit" : "new",// No I18N
                    container: "rc-container",// No I18N
                    formid: "rcForm",// No I18N
                    inlineImagesEntity: self.entityName,
                    allowedValuesCallback: "$releaseForm.getAllowedValues",//NO I18N
                    customform: true,
                ffr:{
                    id:templateRC.id,
                    entity:self.entityName
                },
                    edit: {
                        fields: {
                            assets: {
                                selection_handler: "$releaseForm.showAssoiciateAssetList",//NO I18N
                                selection_icon_class: "fl cspr asset1 icon-sm mr30 right0"//NO I18N
                            },
                            configuration_items: {
                              selection_handler: "$releaseForm.showAssoicateCIList",//NO I18N
                              selection_icon_class: "fl cspr asset1 icon-sm mr30 right0"//NO I18N

                            },
                            description: {
                                images_api: true,
                                images_url: "/api/v3/" + self.entityNamePl + "/images"//NO I18N
                            },
                            stage: {
                                allowClear: false,
                                input_data_Callback: function (url_options, input_data) {
                                    if (url_options.formcomp.fields.values.workflow) {
                                        if (url_options.formcomp.fields.values.workflow.id) {
                                            input_data.workflow_id = url_options.formcomp.fields.values.workflow.id;
                                        } else {
                                            input_data.workflow_id = url_options.formcomp.fields.values.workflow;
                                        }
                                    }
                                    return input_data;
                                }
                            },
                            status: {
                                allowClear: false,
                                input_data_Callback: function (url_options, input_data) {
                                    let search_criteria = input_data.list_info.search_criteria;
                                    for (let i = 0; i < search_criteria.length; i++) {
                                        if (search_criteria[i].field === "stage.id") {
                                            search_criteria[i].field = "stage";
                                            search_criteria[i].value = url_options.formcomp.fields.values.stage.id ? url_options.formcomp.fields.values.stage.id : url_options.formcomp.fields.values.stage;
                                        }
                                        if (search_criteria[i].field === "name") {
                                            search_criteria[i].logical_operator = "and";
                                        }
                                    }
                                    input_data['for'] = "release_add_edit_form"; //No I18N
                                    if (url_options.formcomp.fields.values.workflow) {
                                        if (url_options.formcomp.fields.values.workflow.id) {
                                            input_data.workflow_id = url_options.formcomp.fields.values.workflow.id;
                                        } else {
                                            input_data.workflow_id = url_options.formcomp.fields.values.workflow;
                                        }
                                    }
                                    return input_data;
                                },
                                pre: function (field) {
                                    delete field.default_value;
                                }
                            },
                            site: {
                                allowClear: false,
                                selection_handler: false,
                                processResults:function(search_data, data, field, self) {
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
                            scheduled_end_time: {
                                custom_rules: [
                                    {"rule_name": "endCompare", "rule_value": "#scheduled_start_time_IN"}   //NO I18N
                                ]
                            },
                            completed_time: {
                                custom_rules: [
                                    {
                                        "rule_name": "endCompare", //NO I18N
                                        "rule_value": "#created_time_IN", //NO I18N
                                        "rule_msg": getMessageForKey("api.validation.completedtime.createdtime") //NO I18N
                                    }
                                ]
                            },
                            template: {
                                allowClear: false
                            },
                            workflow: {
                                post: "$releaseForm.setDefaultWorkflow"    //NO I18N
                            }
                        },
                        defaults: {
                            site:entityData?(entityData.site?entityData.site:{
                                "id": -1, //NO I18N
                                "name": translate('common.site.nosite') //NO I18N
                            }):(templateRC[self.entityName].site?templateRC[self.entityName].site:{
                                "id": -1, //NO I18N
                                "name": translate('common.site.nosite') //NO I18N
                            }),
                            lookup: {
                                placeholder: translate('sdp.change.sla.select')
                            }
                        },
                        onchange: {
                            site: "$releaseForm.onchangeSite",    //NO I18N
                            group: "$releaseForm.onchangeGroup",    //NO I18N
                            stage: "$releaseForm.onChangeStage",    //NO I18N
                            status: "$releaseForm.onChangeStatus",    //NO I18N
                            template: "$releaseForm.onChangeTemplate",    //NO I18N
                            workflow: "$releaseForm.onChangeWorkflow"    //NO I18N
                        }
                    },
                    dependentFields: [{
                        fields: ["category", "subcategory", "item"],    //No I18N
                        order: true
                    }, {
                        fields: ["stage", "status"],  //No I18N
                        order: true
                    }],
                    save: {
                        url: self.editId ? "/api/v3/" + self.entityNamePl + "/" + self.editId + "" : "/api/v3/" + self.entityNamePl,//NO I18N
                        entity: self.entityName,
                        submit: true,
                        forcesave: forceSave,
                        serializer: "$releaseForm.executeWhileSave",//NO I18N
                        cancel: "$releaseForm.cancelForm",//No I18N
                        success: "$releaseForm.postDataAdded",//No I18N
                        onsubmit: "$releaseForm.openRoleAccordion",//No I18N
                        submitbutton: {
                            add: window.getMessageForKey("sdp.common.save") //No I18N
                        }
                    },
                    entityName: (self.entityName === "release") ? translate('common.release') : translate('sdp.common.change'),//No I18N
                    afterRenderCallback: "$releaseForm.afterRenderPage" //No I18N
                };
                if (window.checkIfMSP()) {
                    this.mspform.modifyConfigJSONForMSP(configJSON);
                }

                //Add bulk select configs for udf fields
                jQuery.each(templateRC[self.entityName].udf_fields, function (fieldName, fieldVal) {
                    if (metainfoFields.udf_fields && (metainfoFields.udf_fields.fields[fieldName].display_type === "MultiSelect" || metainfoFields.udf_fields.fields[fieldName].display_type === "CheckBox")) {
                        configJSON.edit.fields["udf_fields." + fieldName] = {selection_handler: "$releaseForm.showBulkSelect"}; //No I18N
                    }
                });
                //Add user select configs for requester field
                jQuery.each(self.rolesObjArr, function (i, roleId) {
                    if (self.metainfo.fields.roles.fields ) {
                        if(self.metainfo.fields.roles.fields[roleId].internal_name === "release_requester"){
                            configJSON.edit.fields["roles." + roleId] = {
                                selection_handler: (sdp_user.USERTYPE === "Requester") ? false : "$releaseForm.showRelUserSearchPopup",   //NO I18N
                                selection_icon_class: "cspr contact opac7 icon-sm opac fl", //NO I18N
                                selection_title: getMessageForKey('sdp.admin.requesterList.searchWord'),
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                }
                            };
                        }
                        else{
                            configJSON.edit.fields["roles." + roleId] = {
                                search_keys: templateRC.UserSearchOption,
                                formatResult: function (item) { // Overriden formatResult method to display toolTip
                                    return ChangeReleaseDetails.formatResultForToolTip(item);
                                },
                                processResults: function (search_data, data, field) { // Overriden processResult to retrieve desired results in toolTip
                                    search_data.push(ChangeReleaseDetails.processResultsForToolTip(data));
                                }
                            };
                        }

                    }
                });

                window.$relform = new FC(configJSON);

                /** for template preview, the save method should not do anything */
                if (this.templatePreview) {
                    configJSON.save.controller = function (payload, form, event) {
                        event.stopPropagation();
                        event.target.disabled = false;
                    };
                    configJSON.save.cancel = function (form) {
                        event.stopPropagation();
                        window.close();
                    };
                    configJSON.save.exit_alert = false;
                }
                if (editId) {
                    if (entityData) {
                        jQuery("#browserTitleInfo").find("#bt_id").text(entityData.id).end().find("#bt_title").text(entityData.title);// No I18N
                    } else {
                        jQuery("#browserTitleInfo").find("#bt_id").text(templateRC[self.entityName].id).end().find("#bt_title").text(templateRC[self.entityName].title);// No I18N
                    }
                }
                applyBrowserTitle();
            } catch (e) {
            }
        },
        associateTo: function (rel_id) {
            let self = this;
            if (self.entityNamePl === "releases") { // No I18N
                let data = sdpAjaxInputData({
                    "releases": [ // No I18N
                        {
                            "release": { // No I18N
                                "id": rel_id // No I18N
                            }
                        }
                    ]
                });
                let sdpOptions = {
                    url: "/api/v3/" + self.from + "s/" + self.associatedEntityId + "/" + self.entityNamePl, // No I18N
                    data: data,
                    type: "POST",// No I18N
                    success: function (resp) {
                        let parent = window.top;
                        let showalert = parent.showalert;
                        showalert("success", getMessageForKey("sdp.project.history.releaseassociated"), "isAutoHide=true, delay=3"); //No I18N
                        parent.$previewComponent.closePreview("newrelease_popup");// No I18N
                        parent.$releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                        if ($releaseForm.from === "change") {   //NO I18N
                            parent.jQuery("#listviewloader").attr('style', 'height: 138px'); //NO I18N
                            parent.jQuery("#associated_release_count")[0].innerHTML = 1;
                            window.top.$rc.summary.releases.all = 1;
                            parent.jQuery('#changeReleaseAssocAction').addClass("hide");
                            parent.jQuery('#changeReleaseDissocAction').removeClass("hide");
                            parent.jQuery("#actions_list").removeClass("open");

                        } else if ($releaseForm.from === "project") {   //NO I18N
                            parent.jQuery("#listviewloader").attr('style', 'height: 113px'); //NO I18N
                            parent.loadProjectDetails("ViewProject");    // No I18N
                        }
                        parent.jQuery("#table_render_div").addClass("listview"); //NO I18N
                        parent.jQuery("#table_render_div").css("display", ""); //NO I18N
                    },
                    async: false
                };
                if (self.from === "project") {
                    sdpOptions.acceptODCompatible = true;
                }
                sdpAjax(sdpOptions);
            }
        },
        /**
         * Open Section Accordion for Roles.
         * @form - Form Reference
         */
        openRoleAccordion: function (form) {
            let rolesSections = document.querySelectorAll('[id^="rolessection_"]'); //No I18N
            for (let j = 0; j < rolesSections.length; j++) {
                let sectionName = rolesSections[j].id;
                let sectionId = sectionName.substring(sectionName.indexOf('_') + 1, sectionName.lastIndexOf('_'));
                ZComponents.collapsiblepanel(document.getElementById('rolessection_' + sectionId + '_collapse')).expandPanel(); //No I18N
            }
            return false;
        },
        /**
         * Construct input data to get fields allowed values
         * Eg, Dependent field-status, construct input data with stage id
         * Used in Form & Release Details page-stage/status change popup
         */
        getInputDataCallback: function () {
            let obj = {
                stage: function (urlOptions, input_data) {
                    if (urlOptions.formcomp.entitydata.workflow && urlOptions.formcomp.entitydata.workflow.id) {
                        input_data.workflow_id = urlOptions.formcomp.entitydata.workflow.id;
                    }
                    return input_data;
                },
                status: function (urlOptions, input_data, searchText) {
                    input_data.list_info.search_criteria = getSearchCriteriaJson("stage", "is", urlOptions.formcomp.fields.values.stage, (!searchText&&searchText!="")?[]:getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    input_data['for'] = "release_detail_status_form"; //No I18N
                    if (urlOptions.formcomp.entitydata.workflow && urlOptions.formcomp.entitydata.workflow.id) {
                        input_data.workflow_id = urlOptions.formcomp.entitydata.workflow.id;
                    }
                    return input_data;
                },
                group: function (urlOptions, input_data, searchText) {
                    const fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                    const siteId = (fieldsValue && fieldsValue.site && (fieldsValue.site !== -1)) ? fieldsValue.site : null;
                    input_data.list_info.search_criteria = getSearchCriteriaJson("site", "is", siteId, (!searchText&&searchText!="")?[]:getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    return input_data;
                },
                subcategory: function (urlOptions, input_data, searchText) {
                    if (urlOptions.formcomp.fields.values.category === "") {
                        input_data.list_info.search_criteria = getSearchCriteriaJson("category", "is", null, getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    } else {
                        input_data.list_info.search_criteria = getSearchCriteriaJson("category", "is", urlOptions.formcomp.fields.values.category, (!searchText&&searchText!="")?[]:getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    }
                    return input_data;
                },
                item: function (urlOptions, input_data, searchText) {
                    if (urlOptions.formcomp.fields.values.subcategory === "") {
                        input_data.list_info.search_criteria = getSearchCriteriaJson("subcategory", "is", null, getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    } else {
                        input_data.list_info.search_criteria = getSearchCriteriaJson("subcategory", "is", urlOptions.formcomp.fields.values.subcategory, (!searchText&&searchText!="")?[]:getSearchCriteriaJson("name", "like", [searchText], "and")); //No I18N
                    }
                    return input_data;
                }
            };
            // modifying for msp since we will be modifying for site and change manager
            isMSP && this.mspform.modifyInputDataCallbackForMSP(obj);
            return obj;
        },
        /* Function for clicking contact icon behind release requester*/
        showRelUserSearchPopup: function (form, field) {
            const searchText = jQuery('[name="' + field + '"]').select2('data') ? jQuery('[name="' + field + '"]').select2('data').name : null;//NO I18N
            //Need to know for which role, user popup is invoked
            this.rolesUsersPopup = field;
            showUserSearchPopup('Release', true, searchText, 'releases', 'null', 'release_requester');//NO I18N
        },
        /*Function execute after rendering page*/
        afterRenderPage: function (form) {
            let self = this, parentElement = jQuery('#rc-container');

            /** For template preview, the attachment support should be disabled */
            if (self.templatePreview) {
                jQuery("#rc-attachment-container").removeAttr("data-drop-uuid").css("pointer-events", "none"); //No I18N
                jQuery("#relFormBack").css("pointer-events", "none"); //No I18N
                jQuery('#rc_template').prop('disabled', true);//NO I18N
            }
            if (self.editId) {
                if (self.entitydata && self.entitydata.stage.internal_name !== "submission") {
                    form.fields.template.disabled = true;
                }
                if (!self.canEdit) {
                    form.fields.template.disabled = true;
                    form.fields.workflow.disabled = true;
                    form.fields.stage.disabled = true;
                }
                form.fields.comment.disabled = true;
            }
            //click function for asset/Cis popup
            jQuery('#configuration_items_actions').attr('title', getMessageForKey('sdp.requests.assets.icon.addmore'));
            jQuery('#assets_actions').next().attr('title', getMessageForKey('sdp.requests.assets.icon.addmore'));
            jQuery("<hr class='hr-medium mt5 mb15'>").insertAfter(jQuery('.main-pane').find('.form-wrapper')[0]);
            jQuery(jQuery('.main-pane').find('.form-wrapper')[0]).removeClass('pb25');
            /*Disable assets when ViewInventoryWS is not present in roles*/
            if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.includes('ViewInventoryWS') === false) {
                form.fields.hasOwnProperty("assets") && (form.fields.assets.disabled = true);//No I18N
            }
          if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
                form.fields.hasOwnProperty("configuration_items") && (form.fields.configuration_items.disabled = true);//No I18N
            }
            /*Roles expand/collapsed code and general section padding increased*/
            const element = jQuery('.main-pane').find('.form-wrapper')[3].getAttribute('id');

            const rolesLen = jQuery('#' + element).find('.section-title');
            for (let i = 0; i < rolesLen.length; i++) {
                let sectionTitleEle = parentElement.find('#' + element + ' .section-title')[i],
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
                ZComponents.collapsiblepanel(document.getElementById('rolesSection_' + i).classList.add('pb10')); //No I18N
            }
            isMSP && self.mspform.afterPageRenderForMSP(form);
            //To trigger page script
            $se.page_scripts.render("all_page");
        },
        /*Passed this for bulk select for services once handled in component need to remove*/
        getAllowedValues: function (callback, form) {
            let self = this, promiseFn = [];

            form.allowedValues.services = self.getEntityAll(self.base_url + '/services', null, 'services', { //NO I18N
                "list_info": { //NO I18N
                    "start_index": 1, //NO I18N
                    "row_count": 100 //NO I18N
                }
            }, true);
            let allowedValuesPr = sdpAjax({
                url: "/api/v3/" + self.base_url + "/allowed_values_for_fields", //No I18N
                cache: false,
                success: function (data) {
                    if (data && data.allowed_values) {
                        data.allowed_values.services = form.allowedValues.services;
                        form.allowedValues = data.allowed_values;
                        self.modifyAllowedValues(form.allowedValues, form);
                    }
                }
            });
            promiseFn.push(allowedValuesPr);
            callback && (callback[0] = jQuery.when.apply(this, promiseFn));

            isMSP && this.mspform.getAllowedValues(form);
        },
        currentTemplateContentFromAssociateEntity: function (templateData, associatedEntityData) {
            let self = this;

            /* For overwriting all fields*/
            if (self.associatedSelOverwriteId === "1") { //NO I18N
                return templateData = merge(templateData, associatedEntityData);

                function merge(obj1, obj2) {
                    let answer = jQuery.extend(true, {}, obj1);
                    for (let key in obj2) {
                        if (key === "change_type") { //NO I18N
                            answer.release_type = obj2[key];
                        } else {
                            answer[key] = obj2[key];
                        }
                    }
                    return answer;
                }
            }
            /* For overwriting empty fields*/
            else if (self.associatedSelOverwriteId === "2") { //NO I18N
                return templateData = merge(templateData, associatedEntityData);

                function merge(obj1, obj2) {
                    let answer = jQuery.extend(true, {}, obj1);
                    for (let key in obj2) {
                        if (!(obj1[(key === "change_type") ? "release_type" : key])) { //NO I18N
                            if (key === "subcategory" || key === "item" || key === "category") { //NO I18N
                                if ((obj1.category == null) || (obj1.category != null && key !== "subcategory" && key !== "item")) { //NO I18N
                                    answer[key] = obj2[key];
                                }
                            } else if (key === "change_type") { //NO I18N
                                answer.release_type = obj2[key];
                            } else {
                                answer[key] = obj2[key];
                            }
                        } else if (Array.isArray(obj1[key]) && obj1[key].length === 0) {
                            answer[key] = obj2[key];
                        }
                    }
                    return answer;
                }
            }

        },
        /**
         * Common for both form and details page
         */
        getRolesInputDataCallback: function (field, entityData, metainfo) {
            let _self = this;
            const id = field.name.split(".")[1];
            if (metainfo[id].user_type === "SGT") {
                return _self.getSGTInputDataCallback(entityData);
            } else if (metainfo[id].user_type === "ST") {
                return function (urlOptions, input_data, searchText) {
                    const fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                    const siteId = (entityData && (entityData.site ? entityData.site.id : -1)) || ((fieldsValue && fieldsValue.site) ? fieldsValue.site : -1);
                    input_data.list_info.search_criteria = {
                        "field": "associated_sites",      //No I18N
                        "condition": "is",      //No I18N
                        "value": {      //No I18N
                            "id": siteId      //No I18N
                        },
                        "children": [      //No I18N
                            {
                                "field": "name",      //No I18N
                                "condition": "like",      //No I18N
                                "values": [      //No I18N
                                    searchText
                                ],
                                "logical_operator": "and"      //No I18N
                            }
                        ]
                    };
                    input_data.list_info.row_count = 25;
                    return input_data;
                };
            } else if (metainfo[id].user_type === "SDRM" || metainfo[id].user_type === "ALL") {
                return _self.getAllInputDataCallback();
            }
        },
        getSGTInputDataCallback: function (entityData) {
            return function (urlOptions, input_data, searchText) {
                const fieldsValue = urlOptions.formcomp && urlOptions.formcomp.fields && urlOptions.formcomp.fields.values;
                const siteId = (entityData && (entityData.site ? entityData.site.id : -1)) || ((fieldsValue && fieldsValue.site) ? fieldsValue.site : -1);
                const groupId = (entityData && (entityData.group ? entityData.group.id : null)) || ((fieldsValue && fieldsValue.group) ? fieldsValue.group : null);
                input_data.list_info.search_criteria = {
                    "field": "associated_sites",      //No I18N
                    "condition": "is",      //No I18N
                    "value": {      //No I18N
                        "id": siteId      //No I18N
                    },
                    "children": [      //No I18N
                        {
                            "field": "support_group",      //No I18N
                            "condition": "is",      //No I18N
                            "value": {      //No I18N
                                "id": groupId      //No I18N
                            },
                            "logical_operator": "and"      //No I18N
                        },
                        {
                            "field": "name",      //No I18N
                            "condition": "like",      //No I18N
                            "values": [      //No I18N
                                searchText
                            ],
                            "logical_operator": "and"      //No I18N
                        }
                    ]
                };
                input_data.list_info.row_count = 25;
                return input_data;
            };
        },

    showAssoicateCIList : function(){
        let jQBody = jQuery("body"); // NO I18N
		if (!jQBody.find("#ci-association-container").length) {// NO I18N
			jQBody.append('<div id="ci-association-container"></div>'); // NO I18N
		}
        assetsObj.loadAttachCIPopup('releases','configuration_items','ci-association-container','500');//No I18N
    },
     showAssoiciateAssetList: function () {
        assetsObj.loadAttachAssetPopup('release', 'attach_asset', 'assets');//NO I18N
     },
        /**
         * To sort template and workflow values based on emergency type.
         */
        modifyAllowedValues: function (allowedValues, form) {
            //Group template data based on General/Emergency type
            let self = this, tempObj = [];
            jQuery.each(allowedValues.template, function (index, obj) {
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
            allowedValues.template = tempObj;

            //Group workflow data based on General/Emergency type
            let workObj = [], generalWf = null, emergencyWf = null;
            self.defaultWorkflow = null;
            jQuery.each(allowedValues.workflow, function (index, obj) {
                obj.is_default && (self.defaultWorkflow = obj);
                if (obj.type === "General") {
                    !generalWf && (generalWf = {children: []});
                    generalWf.children.push({
                        name: obj.name,
                        id: obj.id,
                        allowed_stages_config: obj.allowed_stages_config
                    });
                    generalWf.text = obj.type;

                } else if (obj.type === "Emergency") {
                    !emergencyWf && (emergencyWf = {children: []});
                    emergencyWf.children.push({
                        name: obj.name,
                        id: obj.id,
                        allowed_stages_config: obj.allowed_stages_config
                    });
                    emergencyWf.text = obj.type;
                }
            });
            if (form.template.is_emergency) {
                emergencyWf && workObj.push(emergencyWf);
            } else {
                generalWf ? (workObj.push(generalWf) && emergencyWf && workObj.push(emergencyWf)) : (emergencyWf && workObj.push(emergencyWf));
            }
            allowedValues.workflow = workObj;
        }
    };
}()));
