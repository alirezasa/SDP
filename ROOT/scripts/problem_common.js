/* $Id$ */
/* $problemCommon obj is merged with prob obj in problem_details.js */
/* This obj property can be accessed using $problemDetails variable */
var $problemCommon = {
    headerFields : ["reported_by","due_by_time","reported_time"],// No I18N
    /**
     * Set the basic prop required for all methods
     */
    initialize: function (options) {
        Handlebars.registerPartial("actions",renderhbs(null,'actions_template',null,null,'problems',null,true,null,true)); //No I18N
        Handlebars.registerPartial("known_error_tooltip",renderhbs(null,'known_error_tooltip',null,null,'problems',null,true,null,true)); //No I18N
        this.options = options;
        this.id = options.id || '';
        this.entity_name = "problem";// No I18N
        this.display_name = translate('sdp.problem.problemtab'); // No I18N
        this.base_url = "/api/v3/" + this.entity_name + "s"; // No I18N
        this.entity_name_pl = this.entity_name + "s";    //No I18N
        this.hash_url = window.location.hash;
    },
    //Returns the currently active Tab using hash. Returns 'details' as default
    getActiveSubTab: function (default_tab) {
        var urlParams = this.getHashParams(window.location.hash), activeTab = "";
        var allowedTabs = this.getAllowedTabs().allowedTabs;
        if (allowedTabs.indexOf(urlParams) != -1) {
            activeTab = urlParams;
        } else {
            activeTab = default_tab || "details"; //No I18N
        }
        return activeTab;
    },
    getHashParams: function (hash) {
        var url = hash || this.hash_url;
        url = url.substring(1);
        return url;
    },
    getTabs: function () {
        var _self = this;
        var menus = ["details", "analysis", "solution", "tasks", "worklogs", "associations", "history"];    // No I18N
        if(!(_self._links.solutions && _self._links.solutions.get)){
            menus.splice(menus.indexOf('solution'), 1);
        }
        if(!(_self._links.associated_incidents && _self._links.associated_incidents.get)){
            menus.splice(menus.indexOf('associations'), 1);
        }
        if(self.externalframe){
            menus.splice(menus.indexOf('tasks'), 1);
            menus.splice(menus.indexOf('worklogs'), 1);
        }
        return menus;
    },
    /**
     * Initial data to be loaded for details page
     */
    getInitData: function () {
        var _self = this;
        var url = _self.base_url + "/" + _self.id;
        var isValidUrl = _self.getMetaInfo(url, _self);
        if (!isValidUrl) {
            return false;
        }
        $PBForm.constructMetaInfo(_self.metainfo.fields);
        _self.metainfo.display_name = _self.display_name;
        if (_self.id) {
            isValidUrl = _self.fetchEntityData();
            if (!isValidUrl) {
                return false;
            }
            _self.getLinks(_self.base_url + "/" + _self.id, _self);
            _self.canEdit = (_self._links.edit && _self._links.edit.put) ? true : false;
            if(_self.options.printPreview){
                _self.getEntitySummary();
            }
        }
        this.allowedTabs = this.getTabs();
    },
    /**
     * Get _links api info
     * @base_url - entity url to get links info
     * @dataObj - obj to which response will be added
     */
    getLinks: function (url, dataObj) {
        var _self = this;
        sdpAjax({
            url: url + "/_links", // No I18N
            success: function (resp) {
                dataObj._links = resp._links;

                resp._links = resp._links.links ? resp._links.links : resp._links;
                var clientLinks = _self.constructLinksInfo(resp._links);
                dataObj._links = clientLinks;
            },
            async: false
        });
    },
    /**
     * Convert links array to object type for ease access
     */
    constructLinksInfo: function (links) {
        var clientLinks = {}, name, method, href;
        var linksLen = links ? links.length : 0;
        if (linksLen) {
            for (var i = 0; i < linksLen; i++) {
                if (!links[i]) {
                    continue;
                }
                name = links[i].name;
                method = links[i].method;
                href = links[i].href;
                if (!clientLinks[name]) {
                    clientLinks[name] = {};
                }
                clientLinks[name][method] = {};
                clientLinks[name][method] = links[i];
                clientLinks[name][method].href = href ? href : "";
            }
        }
        return clientLinks;
    },
    /**
     * Get metainfo of entity
     */
    getEntitySummary: function (doCall) {
        var _self = this;
        var entitySummary = {};
        if (_self.summary && !doCall) {
            entitySummary.summary = _self.summary;
        } else {
            entitySummary = _self.fetchEntitySummary();
        }
        entitySummary.canViewAssociations = _self.hasAssociationsAccess();
        entitySummary.associations_summary = _self.getAssociationsAccessSummary();
        return entitySummary;
    },
    /**
     * returns weather user has access to associations
     */
    hasAssociationsAccess: function () {
        return !($problemDetails._links['associated_change'] == undefined && $problemDetails._links['associated_incidents'] == undefined);
    },
    /**
     * returns summary of associations access
     */
    getAssociationsAccessSummary: function () {
        var associations_summary = {};
        associations_summary.canViewChange = associations_summary.canEditChanges = !($problemDetails._links['associated_change'] == undefined);
        if (associations_summary.canViewChange) {
            associations_summary.canViewChange = !($problemDetails._links['associated_change']['get'] == undefined);
            associations_summary.canEditChange = !($problemDetails._links['associated_change']['post'] == undefined);
            associations_summary.canAddChange = !(($problemDetails._links.change && $problemDetails._links.change.post) == undefined);
        }

        associations_summary.canViewIncidents = associations_summary.canEditIncidents = !($problemDetails._links['associated_incidents'] == undefined);
        if (associations_summary.canViewIncidents) {
            associations_summary.canViewIncidents = !($problemDetails._links['associated_incidents']['get'] == undefined);
            associations_summary.canEditIncidents = !($problemDetails._links['associated_incidents']['post'] == undefined);
        }
        return associations_summary;
    },
    /**
     * Get metainfo of entity
     */
    fetchEntitySummary: function (required) {
        var _self = this;
        var entitySummary = {};
        if(required){
            var list_info = {list_info:{fields_required:required}}
        }
        sdpAjax({
            url: _self.base_url + "/" + _self.id + "/summary",   // No I18N
            type: "GET", // No I18N
            data:sdpAjaxInputData(list_info),
            success: function (resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    entitySummary.summary = _self.summary = jQuery.extend({}, _self.summary, resp.summary);
                    entitySummary.summary.total_incidents = parseInt(entitySummary.summary.associated_incidents) + parseInt(entitySummary.summary.associated_arcincidents)
                }
            },
            async: false
        });
        return entitySummary;
    },
    /**
     * Get metainfo of entity
     * @base_url - entity url to get metainfo
     * @dataObj - obj to which response will be added
     */
    getMetaInfo: function (base_url, dataObj) {
        var isValidUrl = true,_self=this;
        sdpAjax({
            url: base_url + "/_metainfo", // No I18N
            success: function (resp) {
                dataObj.metainfo = resp.metainfo;
            },
            error: function (resp) {
                if (resp.responseJSON && resp.responseJSON.response_status && resp.responseJSON.response_status.messages && jQuery.isArray(resp.responseJSON.response_status.messages) && resp.responseJSON.response_status.messages[0].status_code == 4002) {
                    showalert("failure", translate("common.updateandnoview.permission.message", [_self.display_name, _self.options.id]), "isAutoHide=false"); //No I18N
                    isValidUrl = false;
                }
                isValidUrl = false;
            },
            async: false
        });
        return isValidUrl;
    },
    /**
     * Get module data, if entity data is not available, fetch the data and load in _self
     */
    getEntityData: function (entity_id) {
        var _self = this;
        if (!_self.entity_data) {
            _self.fetchEntityData();
        }
    },
    /**
     * Fetch module data from api
     */
    fetchEntityData: function () {
        var _self = this;
        var respData = {};
        var inputObject = { "add_recent_item": true }; // No I18N
        var dataval = sdpAjaxInputData(inputObject), isValidUrl = true;
        sdpAjax({
            url: _self.base_url + "/" + _self.id, // No I18N
            data: dataval,
            success: function (resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    _self.entity_data = respData = resp[_self.entity_name];
                    _self.modifyDescriptionInlineImgSrc(_self.entity_data);
                    if(window.checkIfMSP()){
                    	window.addAndSetAccountInCombo(_self.entity_data.account.id, true, _self.entity_data.account.name);
                    }
                }
            },
            error: function (resp) {
                if (resp.responseJSON && resp.responseJSON.response_status && resp.responseJSON.response_status.messages && jQuery.isArray(resp.responseJSON.response_status.messages) && resp.responseJSON.response_status.messages[0].status_code == 4002) {
                    showalert("failure", translate("common.updateandnoview.permission.message", [_self.display_name, _self.options.id]), "isAutoHide=false"); //No I18N
                    isValidUrl = false;
                }
            },
            async: false
        });
        jQuery("#browserTitleInfo").find("#bt_id").text(respData.id).end().find("#bt_title").text(respData.title);// No I18N
        applyBrowserTitle();
        return isValidUrl;
    },
    modifyDescriptionInlineImgSrc: function(entity_data){
        var _self = this;
        if(entity_data.image_token){
            entity_data.description = appendImageToken(entity_data.description,entity_data.image_token);
        }
        var descriptiveFields = ["impact_details","symptoms","root_cause"]; //No I18N
        for(var i=0, len=descriptiveFields.length; i<len; i++){
            var fieldName = descriptiveFields[i];
            if(entity_data[fieldName] && entity_data[fieldName].image_token){
                entity_data[fieldName].description = appendImageToken(entity_data[fieldName].description,entity_data[fieldName].image_token);
            }
        }
    },
    /**
     * Delete an entity
     */
    deleteEntity: function () {
        var _self = this;
        var delete_Entity = function (confirm) {
            var url = _self.base_url + "/" + _self.id;
            if (confirm) {
                sdpAjax({
                    url: url,
                    type: "DELETE",  // No I18N
                    success: function (resp) {
                        if (resp.response_status && resp.response_status.status == "success") {
                            var successmsg = translate("api.deleted.success", [e_html(_self.display_name)]);
                            showalert("success", successmsg, "isAutoHide=true");  //No I18N
                            setTimeout(function () {
                                jQ("#goback_problem").trigger("click"); //No I18N
                            }, 1100);
                        }
                    }
                });
            }
        };
        var title = translate("sdp.common.delete");
        var message = translate("sdp.problem.error.deleteproblemconfirm");
        showconfirm(true, 'title=' + title + ', message=' + message + ', submitbutton=' + translate("sdp.common.ok") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', delete_Entity,true); //No I18N

    },
    //Switches UI to requested Tab
    gotoActiveTab: function (tabName, tabSetting, tabObject) {
        setTimeout(function () {
            jQuery("#details-tabs-problem").find("[role='tablist'] li[data-detail-tab='" + tabName + "']").trigger("click");
        }, 1);

    },
    /**
     * Initialize FC for details sections
     * @configJSON - entity specific configuration json
     */
    initFormComponent: function (configJSON) {
        var _self = this;
        var config = {
            name: _self.entity_name,
            entity: _self.entity_name,
            entityName: _self.display_name,
            entitypath: _self.entity_name,
            mode: "view",// No I18N
            formid: _self.entity_name,
            /*Inline save*/
            save: {
                url: _self.base_url + "/" + _self.id,//NO I18N
                entity: _self.entity_name
            }
        };

        jQuery.extend(true, config, configJSON);
        return new FC(config);
    },
    //Reinitialize Property form (Inline form details tab) after save.
    reinitFormComponent: function (form, options) {
        form.destroy();
        return this.initFormComponent(options);
    },
    //While editting a section / other panel, already existing panel in edit mode should be closed
    hidePanelEditor: function () {
        jQuery('[data-name="edit-template"]').find('[name="Cancel"]').trigger("click");
    },
    /**
     * Loads description section
     */
    loadDescriptionSection: function (tabName, tabSetting, tabs_panel) {
        var _self = this;
        var opt = {};
        opt.id = _self.id;
        opt.name = _self.entity_name + "_description"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity = _self.entity_name + "s"; //No I18N
        opt.lookup_entity = _self.entity_name;
        opt.data = _self.entity_data;
        opt.metainfo = _self.metainfo;
        opt.canEdit = _self.canEdit && !_self.printPreview;
        opt.expand = true;
        opt.description_toggle=true;
        opt.display_name = _self.metainfo.fields.description.display_name;
        opt.container = _self.entity_name + "Description"; // No I18N
        opt.detailsHbsTemplate = "entity_description_template"; // No I18N
        opt.panel = {
            pre_edit: function () {
                _self.entityFields.initFC();
            }
        };
        opt.save = {
            postsuccess: function (data) {
                //appending the latest image token to description since data is re-rendered
                data.description = appendImageToken(data.description,data.image_token);
                _self.entity_data = data;
            }
        };
        opt.attachment = {
            rerender: function (data) {
                _self.entity_data.attachments = data;
            },
            container: _self.entity_name + "Description_attachment", //No I18N
            description: true
        }
        opt.print_mode = _self.printPreview == 'true' ? true : _self.printPreview;
        _self.$descriptionPC = new PanelComponent(opt);
    },
    /**
     * Loads problem Details in submission details tab
     */
    loadEntityFields: function (tabName, tabSetting, tabs_panel) {

        var _self = this;
        /* entityFields is set in getEntityTemplateData*/
        var entityFields = _self.entityFields;
        entityFields.initFC = function (mode) {

            /* Destroy the old instances */
            _self.$entityFields_FC && _self.$entityFields_FC.destroy();
            /* Hide other sections which is in edit mode */
            _self.hidePanelEditor();
            /* Show/hide block edit icon when mode is switched */
            if (mode == "edit") {
                jQuery('[data-id="blockEditEntityFields"]').hide();
            } else {
                jQuery('[data-id="blockEditEntityFields"]').show();
            }
            var template = _self.constructTemplateInfo(null,2);
            template.style_properties = null;
            /* Add context=udf_fields for the udf fields to render udf field */
            $PBForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);
            /* Transform site null from api to Not associated to any site */
            var SGTFields = [];
            if (_self.entity_data.hasOwnProperty("site")) {
                SGTFields.push("site");
            }
            _self.resetSiteValue(_self.entity_data);
            if (_self.entity_data.hasOwnProperty("group")) {
                SGTFields.push("group");
            }
            SGTFields.push("technician");//if initiated dependancy occurs in order
            var skipEditFields = [];
            if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.includes('ViewInventoryWS') == false) {
                skipEditFields.push("associated_asset");
            }
            if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.includes('ViewCI') == false) {
                skipEditFields.push("configuration_items");
            }

            var skipFields = ["status", "title", "description"];  //No I18N

            var fcMode = mode ? mode : "view"; // No I18N
            /* Load FC for details sections*/
            var configJSON = {
                template: template,
                entitydata: jQuery.extend(true, {}, _self.entity_data),
                metadata: jQuery.extend(true, {}, _self.metainfo),
                container: "problemDetails",// No I18N
                canEdit: entityFields.canEdit,
                editExceptions: skipEditFields,
                skipEditFields: skipEditFields,
                skipFields: skipFields,
                mode: fcMode,
                allowedValuesCallback: "$problemDetails.getAllowedValues",//NO I18N
                view: {
                    defaults: {
                        site: {
                            text: translate('common.site.nosite')
                        }
                    }
                },
                dependentFields: [{
                    fields: ["category", "subcategory", "item"], // No I18N
                    order: true
                }, {
                    fields: SGTFields,
                    order: false
                }],
                linkedFields: $PBForm.getLinkedFieldsForValidation(),
                edit: {
                    fields: {
                        affected_service: {
                            placeholder: translate('sdp.change.sla.select'),
                            maxvalues: 100
                        },
                        associated_asset: {
                            selection_handler:  "$PBForm.showAssoicateAssetList",//NO I18N
                            selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30"),//NO I18N
                            maxvalues: 100
                        },
                        configuration_items:{
                            selection_handler: "$PBForm.showAssociateCIList",//NO I18N
                            selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30"),//NO I18N
                            maxvalues: 200
                        },
                        site: {
                            allowClear: false
                        }
                    },
                    inline: {
                        pre: _self.hidePanelEditor
                    },
                    defaults: {
                        lookup: {
                            placeholder: translate('sdp.change.sla.select')
                        }
                    },
                    onchange: {
                    }
                },

                /*Inline save*/
                save: {
                    postsuccess: function (data, form,fname) {
                        jQuery("#announceDialogDiv").remove();
                        _self.resetSiteValue(data[_self.entity_name]);
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        if (_self.$rightpropertyfields_FC) {
                        var options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                        options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                        _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);
                        }
                        if(fname && _self.headerFields.indexOf(fname)>=0){
                            _self.refreshHeader(data);
                        }
                    }
                },
                afterRenderCallback: function (form) {    // Prb Detail view mt10 added for each property
                    jQuery("#" + form.container).find(".section-title").addClass("pl0 ml10").end()
                        .find(".section-title").not(":first").addClass("mt10");     //NO I18N
                    jQuery("#" + form.container).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N
                }
            };
             if (fcMode == "edit") {

                configJSON.save = {
                    url: _self.base_url + "/" + _self.id,//NO I18N
                    entity: _self.entity_name,
                    submit: true,
                    cancel: "$problemDetails.entityFields.cancelForm",   // No I18N
                    postserializer: function (data, form) {
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        form.entitydata = data[_self.entity_name];
                    },
                    postsuccess: function (data,form,fieldName) {
                        _self.resetSiteValue(data[_self.entity_name]);
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                        if (_self.$rightpropertyfields_FC) {
                        var options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                        options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                        _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);
                        }
                        if(form.fields.changed.every(function(field){return _self.headerFields.includes(field)})){
                            _self.refreshHeader(data);
                        }
                        _self.entityFields.initFC("view");   // No I18N

                    }
                };
            }

            jQuery.each(template[_self.entity_name].udf_fields, function (fieldName, fieldVal) {
                if (_self.metainfo.fields.udf_fields && (_self.metainfo.fields.udf_fields.fields[fieldName].display_type == "MultiSelect" || _self.metainfo.fields.udf_fields.fields[fieldName].display_type == "CheckBox")) {
                    configJSON.edit.fields["udf_fields." + fieldName] = { selection_handler: "$PBForm.showBulkSelect" }; //No I18N
                }
            });

            _self.$entityFields_FC = _self.initFormComponent(configJSON);
        };
        entityFields.cancelForm = function () {
            _self.entityFields.initFC('view');   // No I18N
        };

        _self.entityFields.initFC("view");   // No I18N
    },
    /**
     * Get template data from api
     */
    getTemplateInfo: function (templateId) {
        var _self = this, respData = {};
        if (_self.template) {
            respData = _self.template;
        } else {
            sdpAjax({
                url: "/api/v3" + _self.metainfo.fields.template.href + "/" + templateId, // No I18N
                success: function (resp) {
                    _self.template = respData = resp[_self.metainfo.fields.template.lookup_entity];
                },
                async: false
            });
        }
        return respData;
    },
    /**
     * Constructs template with its fields from the template api data
     */
    constructTemplateInfo: function (fields, column_count) {
        var _self = this;
        var template = jQuery.extend(true, {}, _self.template);
        var layouts = template.layouts;
        template.layouts = [];
        template.layouts.push(layouts[0]);
        var requiredFields = [];
        var input_data_callbacks = $PBForm.getInputDataCallback();
        jQuery.each(template.layouts[0].sections, function (i, section) {
            // If column_count is given, then alter the cols properties in template layout json
            column_count && (section.column_count = column_count);
            jQuery.each(section.fields, function (j, field) {
                // Get only the given fields
                if (jQuery.isArray(fields) && fields.indexOf(field.name) > -1) {
                    requiredFields.push(field);
                }
                if (column_count) {
                    var colCount = (j + 1) % column_count;
                    var col = colCount ? colCount : column_count;
                    field.position.col = col;
                }
                if (input_data_callbacks.hasOwnProperty(field.name)) {
                    field.input_data_Callback = input_data_callbacks[field.name];
                }
                //Remove field's customization properties for details page
                field.style_properties = {};
            });
            //Append the required fields to its section
            fields && (section.fields = requiredFields);
            //Remove section customization properties for details page
            section.style_properties = {};
        });
        return template;
    },
    /**
     * Loads Analysis tab
     */
    loadAnalysisDetails: function () {
        var _self = this;
        var problem = _self.entity_data;
        // Order in which Descriptive fields panel will be shown
        var descriptiveFields = ["impact_details", "root_cause", "symptoms"]; //No I18N
        _self.descriptive_fields = {};
        for (var i = 0, len = descriptiveFields.length; i < len; i++) {
            var fieldName = descriptiveFields[i];

            //Options to initialize Panel Component
            var opt = {};
            opt.id = problem[fieldName] == null ? null : problem[fieldName].id;
            opt.name = fieldName;
            opt.display_name = _self.metainfo.fields[fieldName].display_name;
            opt.container = fieldName + "_container"; //No I18N
            opt.expand = (i == 0) ? true : (_self.printPreview) ? true : false; //Expand first panel by default
            opt.base_url = _self.base_url + "/" + _self.id; //No I18N
            opt.entity = fieldName;
            opt.lookup_entity = fieldName;
            opt.data = _self.entity_data[fieldName] == null ? " " : _self.entity_data[fieldName];
            opt.detailsHbsTemplate = "panel_template"; // No I18N
            opt.canEdit = (_self.canEdit && !_self.printPreview) || false;
            //opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";  //No I18N
            opt.print_mode = _self.printPreview || false;

            var instance = "$" + fieldName + "_PC";
            var attachObj = {
                container: fieldName + "_attachcontainer", //No I18N
                rerender: function (data, pc) {
                    pc.data.attachments = data;
                    _self.entity_data[pc.name] = pc.data;
                },
                in_form: "true",
                description : true
            };
            opt.attachment = attachObj;
            opt.panel = {
                /*pre_edit: function(){
                    _self.hidePanelEditor();
                },*/
                /*beforeopen: function(opt) {
                    if(opt.isOpen) {
                        return true;
                    } else {
                        return false;
                }
                    return _self[instance];
                }*/
            };
            opt.save = {
                postsuccess: function (data, pc) {
                    //appending the latest image token to description since data is re-rendered
                    data.description = appendImageToken(data.description,data.image_token);
                    _self.entity_data[pc.name] = data;
                }
            };

            _self[instance] = new PanelComponent(opt);
        }
    },
    /**
     * Loads Solution tab
     */
    loadSolutionDetails: function () {
        var _self = this;
        sdpAjax({
            acceptODCompatible: true,
            type: 'GET', //NO I18N
            url: '/api/v3/problems/' + _self.id + '/_solutions',//No I18N
            async: false,
            success: function (data) {
                _self.solutions = data.solutions;
            },
            error: function (responseJson) {
                var resp_status = responseJson.responseJSON.response_status;
                var respObj = Array.isArray(responseJson.responseJSON.response_status) ? resp_status[0] : resp_status;
                var errorMsg = respObj.messages[0].message;
                showalert('failure', errorMsg, 'isAutoHide=false');	// No I18N
            }
        });
    },
    //Renders the solution details to repective containers
    renderSolutionDetails: function () {
        var _self = this;
        _self.loadSolutionDetails();
        if (_self.solutions) {
            var _self = this, accessObj = this.getSolutionAccess();
            _self.solutions.forEach(function (sol, i) {
                var fieldName = sol.name;
                //Options to initialize Panel Component
                var soldata = {};
                var opt = {};
                if (sol["solution"]) {
                    soldata = {
                        attachments: sol.solution.attachments,
                        description: sol.solution.description,
                        id: sol.solution.id,
                        updated_by: sol.solution.last_updated_by,
                        updated_on: sol.solution.last_updated_time.value != -1 ? sol.solution.last_updated_time : sol.solution.created_time
                    };
                    opt.id = sol["solution"]["id"];
                    }



                opt.name = fieldName;
                opt.display_name = translate(sol.display_name);
                opt.container = fieldName + "_container"; //No I18N
                opt.expand = _self.solutions.length - 1 == i ? true : (_self.printPreview) ? true : false; //Expand first panel by default
                opt.entity = fieldName;
                opt.lookup_entity = fieldName;
                opt.data = sol["solution"] ? soldata : " ";//No I18N
                opt.canEdit = (_self.canEdit && (opt.id?accessObj.canEditSolution:accessObj.canAddSolution) && !_self.printPreview) || false;
                opt.detailsHbsTemplate = "panel_template"; // No I18N
                opt.accept_od_compatible = true;
                opt.editcustomize = function (editopt) {
                    var problemId = _self.id;
                    var solID = editopt.data.id;
                    var type = editopt.name.toUpperCase();
                    _self.solutionPopUp(type,problemId,solID);
                };
                if (accessObj.canViewSolution) {
                    var attachObj = {
                        container: fieldName + "_attachcontainer", //No I18N
                        rerender: function (data, pc) {
                            pc.data.attachments = data;
                            sol.solutions[pc.name] = pc.data;
                        },
                        in_form: "true",
                        upload: false,
                        enable_delete:false
                    };
                    if(sol.solution && sol.solution.attachments && sol.solution.attachments.length > 0)
                    {
                        attachObj.downloadall_url = "/api/v3/solutions/"+opt.id+"/attachments/_download"; //No I18N
                    }
                    opt.attachment = attachObj;
                }
                opt.print_mode = _self.printPreview == 'true' ? true : _self.printPreview;
                var instance = "$" + fieldName + "_PC";//
                _self[instance] = new PanelComponent(opt);
            })
        }
    },
    //Solution Permissions Object
    getSolutionAccess: function () {
        var _self = this, solutionAccess = {};
        if (_self._links.solutions) {
            solutionAccess.canViewSolution = _self._links.solutions.get;
            solutionAccess.canAddSolution = _self._links.solutions.post;
            solutionAccess.canEditSolution = _self._links.solutions.put;
        }
        return solutionAccess;
    },
    //New/ Edit Solution popup from Solution tab
    solutionPopUp: function (type, problemId, solID) {
        var title = 'common.newsolution',_self=this; //No I18N
        if (solID != 'null' && solID != null) {
            title = type == 'WORKAROUND'? 'sdp.problem.actions.editworkaroundtext':'sdp.solutions.newsolution.editsolution';
            var url = '/ui/solutions?entity_id=' + encodeURIComponent(solID) + '&mode=edit&externalframe=true'; // No I18N
        }
        else {
            title = type == 'WORKAROUND'? 'sdp.problem.actions.newworkaroundtext':'sdp.solutions.newsolution.newsolution';
            var url = '/ui/solutions?mode=add&associateID=' + encodeURIComponent(problemId) + '&associateType=PROBLEM_' + encodeURIComponent(type)+'&externalframe=true'; // No I18N
        }
        if(_self.externalframe){
            window.open(url.replace('externalframe=true','externalframe=false'), '_blank');
        }
        else{
        $previewComponent.load(url, translate(title), '75%', null, null, 'prob_sol_work'); //No I18N
        }
    },
    //This refreshes the Action drop down(Attach/Detach change, Add Solution)
    refreshActionsDropDown: function (fetchData) {
        var _self = this;
        if (fetchData) {
            _self.fetchEntityData();
        }
        jQuery.extend(true, _self.$detailsComp.options.data.entity_data, _self.entity_data);
        _self.$detailsComp.loadCActionsLeft();
    },

    refreshHeader: function(data){
        var _self = this;
        jQuery.extend(true, _self.$detailsComp.options.data.entity_data,data[_self.entity_name]);
        _self.$detailsComp.loadCHeaderPanel();
    },
    //Association Tab (Incident List view)
    loadAssociations: function (tabName, tabSetting, tabs_panel) {
        var _self = this;
        var associations_summary = this.getAssociationsAccessSummary();
        if (associations_summary.canViewIncidents) {
            var incidents_url = '/workorder/RequestListViewWeb.jsp?module=' + _self.entity_name + '&module_id=' + _self.id + '&view=associated&type=associated_incidents&externalframe=false&canAssociate=' + ((!_self.printPreview && associations_summary.canEditIncidents) ? true : false); // No I18N
            jQuery('#incident_associations').load(incidents_url); // No I18N
        }
    },
    /**
     * Renders Conversation sections
     */
    loadConversations: function (tabName, tabSetting, tabs_panel) {
        this.initConversations(false);
    },
    /**
     * Initializes the conversation component
     */
    initConversations: function (islite) {
        var _self = this;
        var url = _self.base_url + "/" + _self.id + "/notes";
        var notificationConfig = {
            module: _self.entity_name + "s",  //No I18N
            module_id: _self.id,
            container: "#conversation_section",  //No I18N
            system_notifications: true,
            expand: {
                expand_panel: _self.printPreview ? true : false
            },
            selected_filters: ["email", "notes"], //No I18N
            lazy_load: true,
            sort: {
                order: "desc",  //No I18N
                key: _self.printPreview ? "" : _self.entity_name + "_conv_sort" //No I18N
            },
            show_count: 10,
            notes_count: 25,
            row_count: 10,
            allowed_operations: {
                note: ["edit", "delete"],// No I18N
                email: []
            },
            "notes": {  //No I18N
                fields_required: ["added_by", "added_time", "last_updated_by", "last_updated_time", "has_attachments"]   //No I18N
            },
            imgParameters: { module: _self.entity_name + "_note", withURL: false, noForm: true },  //No I18N
            enable_mention: true,
            mention_options: { autoCheck: false, users: { show: true, href: "/api/v3/problems/technician", lookup_entity: "technician" } },//No I18N
            preview_mode: _self.printPreview,
            conv_title: translate("sdp.common.notifications") + " / " + translate("sdp.common.notes")

        };
        if (_self._links.notes.post) {
            notificationConfig.allowed_operations.note.push("add");
        }
        /* For quick actions add note */
        if (islite) {
            notificationConfig.lite = true;
            notificationConfig.afterNoteAdd = function () {
                $problemDetails.$detailsComp.gotoTabByPath($problemDetails.getTabPathHash("#details"));  // NO I18N
            };
            notificationConfig.afterLoad = function (instance) {
                instance.openNoteForm();
            };
        }
        if (_self.printPreview) {
            notificationConfig.afterLoadConversations = function () {
                jQuery(notificationConfig.container).find('[data-id="toggle-conv"],[data-id="sort"]').addClass("hide");
            }
        }
        _self.$convComp = new Conversation(notificationConfig);
    },
    //Initializes the conversation component for quick action Add Note
    initConversationForQuickAddNote: function () {
        var _self = this;
        _self.initConversations(true);
    },
    /**
     * Opens user details
     * @param {String} userId User id to show the details
     */
    openUserDetails: function (userId, event) {
        $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + userId + '&minContent=true&externalframe=true', translate("sdp.inventory.wsRtPanel.userDetails"), '600px');  // No I18N
    },
    /*Passed this for bulk select for services once handled in component need to remove*/
    getAllowedValues: function (callback, formcomp) {
        var _self = this;
        var base_url = _self.entity_name_pl + "/" + _self.id;
        var servicesMetaData = $PBForm.getEntityAll(base_url + '/affected_service', null, 'affected_service', { "list_info": { "start_index": 1, "row_count": 100 } },true);//No I18N
        formcomp.allowedValues.affected_service = servicesMetaData;
    },
    resetSiteValue: function (entity_data) {
        var _self = this;
        if (entity_data.hasOwnProperty('site')) {
            entity_data.site = entity_data.site ? entity_data.site : { "id": -1, "name": translate('common.site.nosite') };//NO I18N
        }
    },
    //Obtain the Id of closed status, used to compare when problem status is changed in Right Panel
    getClosedStatusId: function () {
        var _self = this;
        if (!_self.closedStatusID) {
            var data = sdpAjaxInputData({ list_info: { search_criteria: { field: "internal_name", condition: "is", value: "Closed" } } });// No I18N
            sdpAjax({
                url: '/api/v3/problems/status', //No I18N
                data: data,
                async: false,
                success: function (resp) {
                    _self.closedStatusID = resp.status[0].id;
                }
            })
        }
        return _self.closedStatusID;
    },
    checkForActiveEditors: function(event){
        var toRet = true;
        if (window.$pc) {
            jQuery.each($pc, function (org, val) {//Check all initalize panel component isit opened or not
                if (val.isOpen) {
                    toRet &= confirm(translate("form.leave.alert"));
                    toRet && $pc[org].cancelForm();
                }
            })
        }
        return toRet;
    },
    showCommentsInPopup:function(event){
        event.stopImmediatePropagation()
        var _self = this;
        var  tooltip = {
            meta: _self.metainfo.fields.known_error_details,
            value: _self.entity_data.known_error_details
        }
        jQuery('#known_error_comments_dialog').html(renderhbs(null,'known_error_tooltip',tooltip,null,'problems',null,null,null,true));//No I18N
        showModal('known_error_comments_dialog', 525, false, false, false, true);//No I18N
    },
    formatError : function(errObj,meta) {

        if(errObj.status_code === 4004) {
            return e_html(errObj.message);
        }
        else {
            var fields = errObj.fields;
            if(!fields && errObj.field) {
                fields = [errObj.field];
            }
            var fieldArr = [], fieldTitle;
            if(fields) {
                for(var i = 0, len = fields.length; i < len; i++) {
                    var fname = fields[i];
                    fieldTitle = fname;
                    if(meta.fields[fname]) {
                        fieldTitle = meta.fields[fname].display_name;
                    }
                    if(fname.indexOf("udf_") !== -1 && (meta.fields["udf_fields"].fields[fname])){
                        fieldTitle =meta.fields["udf_fields"].fields[fname].display_name;
                    }
                    if(fieldTitle) {
                        fieldArr.push(e_html(fieldTitle));
                    }
                }
            }
            if(errObj.message) {
                var errorMsg = e_html(errObj.message);
                if(fieldArr.length > 0) {
                    errorMsg += " : <strong>" + fieldArr.join(", ") + "</strong>";	//No I18N
                }
            } else {
                var errorMsg = translate("common.update.fields.failed");	//No I18N
                if(errObj.status_code === 4001) {
                    errorMsg = translate("common.fields.invalid");	//No I18N
                }
                if(fieldArr.length > 0) {
                    errorMsg += " : <strong>" + fieldArr.join(", ") + "</strong>";	//No I18N
                }
            }
            return errorMsg;
        }
    }
}
