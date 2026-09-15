//# sourceURL=admin-integration-rule-form.js
var $integrationSyncRuleForm = {
    select2ErrorMsg: getMessageForKey("ae.config.depreciation.option.required"), //No I18N
    subModuleListInfo: {
        filter_by: { "id": "" }, //No I18N
        fields_required: ["parent", "display_name", "api_plural_name"] //No I18N
    },
    fetchData() {
        return sdpAjax({
            url: "/api/v3/integration_sync_rules/" + this.options.id, //No I18N
        }).then((response) => {
            this.data = response.integration_sync_rule;
        });
    },
    async init (options = {}) {
        this.options = options;
        this.model = options.model;

        this.isAsset = options.isAsset;
        this.resetActions(); //reset previous form data

        if(options.id) {
            await this.fetchData(options.id);
        } else {
            this.data = undefined;
        }

        this.render(options);
        this.rendering();
    },
    //set data for sync rule actions in edit
    async setActionsData(data) {
        await this.fetchSourceModuleMetaInfo(this.data ? this.data.source_module.id : undefined);

        if(data.identifier_rule.length) {
            this.renderIdentifierRule(data.identifier_rule);
        }

        if (data.field_mapping.length) {
            this.renderFieldsMapping(data.field_mapping.map((field) => {
                return {
                    source_field: {
                        id: field.source_field.name,
                        name: field.source_field.display_name,
                    },
                    destination_field: {
                        id: field.destination_field.name,
                        name: field.destination_field.display_name
                    }
                }
            }));
        }

        if (data.condition && data.condition.length) {
            this.renderFilter();
            jQuery("#condition").custom_filter("update", data.condition); //No I18N
        }
    },
    async getSourceModule() {
        let source_module;
        await sdpAjax({
            url: "/api/v3/integration_sync_rules/source_module", //No I18N
            data: sdpAjaxInputData({
                list_info: {
                    row_count: 1
                },
                service : {
                    id : this.model.id
                }
            })
        }).then((response) => {
            source_module = response.source_module[0];
        });
        return source_module;
    },
    toggle(isList) {
        if(this.options && this.options.container) {
            jQuery("#" + this.options.container + ",#unknown-device-type-info").toggle(isList); //No I18N
            jQuery("[integration-rule-form]").toggle(!isList); //No I18N
        }
    },
    async render(options) {
        const isAsset = this.isAsset;
        const data = this.data || {};

        data.label = {
            typeName: translate(isAsset ? "sdp.helpdesk.common.citype" : "ae.cmdb.admin.citype.citype"), //No I18N
            entityName: translate(isAsset ? "sdp.header.asset" : "ae.cmdb.admin.citype.citype"), //No I18N
            entityPluralName: translate(isAsset ? "sdp.header.inventory" : "ae.cmdb.citypes.label"), //No I18N
            entityFieldId: translate(isAsset ? "integration.asset.id" : "integration.ci.id"), //No I18N
        };

        jQuery("[integration-rule-form]").empty(); //No I18N
        this.clearCache();
        this.toggle(false);
        this.resetFields();

        renderhbs(jQuery(".active").find("[integration-rule-form]"), "integration-rule", data, false, "admin"); //No I18N

        if(this.data) {
            this.setActionsData(this.data);
            if(!this.data.field_mapping.length) {
                this.populateMandatoryFieldMapping();
            }
            return;
        }

        sourceModule = options.source_module || await this.getSourceModule();

        this.renderSourceModule(sourceModule);
        this.renderDestinationModule(sourceModule);
        this.fetchSourceModuleMetaInfo(sourceModule.id);
    },
    rendering () {
        initTooltip("#sync-rule-form"); //No I18N
        initFormValidator("sync-rule-form", { //No I18N
            source_module: {
                required: true
            },
            destination_module: {
                required: true
            }
        },
        {
            destination_module: {
                required: this.select2ErrorMsg
            },
            source_module: {
                required: this.select2ErrorMsg
            }
        });

        this.initEvents();

        jQuery("#actions-container").find("[type=checkbox]").on("click", function (evt) {
            const subModule = jQuery("#sub_module");
            const isEnabled = subModule.length ? jQuery("#sub_module").valid() && jQuery("#destination_module").valid() : jQuery("#destination_module").valid();

            if(!isEnabled) {
                evt.preventDefault();
            }
        });
    },
    resetFields() {
        this.sourceMapRows = undefined;

        //reset actions only if source module or destinaton module is changed
        if(jQuery("#source_module").data("select2") && jQuery("#destination_module").data("select2")) { //No I18N
            this.renderIdentifierRule();
            this.populateMandatoryFieldMapping();
            this.renderFilter();
        }
    },
    formatResult(result) {
        let text;
        let value = result.value || result;
        if(value) {
            text = value.display_name || value.name; //clone rows component format
        } else {
            text = result.display_name || result.text;
        }
        return e_html(text);
    },
    renderSourceModule(value) {
        const _self = this;
        const formatResult = (data) => e_html(data.name || data.text);

        jQuery("#source_module").sdp_select2({ //No I18N
            url: [{
                url: "/api/v3/integration_sync_rules/source_module", //No I18N
                field: "source_module", //No I18N
                sort_field: "name", //No I18N
                sort_order: "A", //No I18N
                input_data_Callback : (url_options,input_data,term) => {
                    input_data.service = { id : _self.model.id }
                    return input_data;
                }
            }],
            value,
            formatSelection: formatResult,
            formatResult: formatResult,
        });
    },
    async fetchSourceModuleMetaInfo(sourceModuleId) {
        const id = sourceModuleId || jQuery("#source_module").val(); //No I18N
        const response = await sdpAjax({
            url: "/api/v3/integration_device_types/" + id, //No I18N
        });

        this.sourceModuleMetainfo = response.integration_device_type.meta_info.fields;
    },
    initEvents () {
        jQuery("#back-to-integration-rules").on("click", () => { //No I18N
            this.back();
        });

        jQuery("#source_module").on("change", async (e) => { //No I18N
            await this.fetchSourceModuleMetaInfo();
            this.renderDestinationModule();
            this.resetActions();
        });

        jQuery("#destination_module").on("change", (e) => { //No I18N
            this.resetActions();
            this.populateMandatoryFieldMapping();
        });

        jQuery("#can_show_indentification_rules").on("change", (e) => { //No I18N
            const canShow = jQuery("#can_show_indentification_rules").is(":checked"); //No I18N
            jQuery("#identifier_rule_container").toggle(canShow); //No I18N

            if(canShow) {
                this.renderIdentifierRule();
            }
        });

        jQuery("#can_show_filter").on("change", (e) => { //No I18N
            const canShow = jQuery("#can_show_filter").is(":checked"); //No I18N
            jQuery("#condition_container").toggle(canShow); //No I18N

            if(canShow) {
                this.renderFilter();
            }
        });

        jQuery("#can_show_map").on("change", (e) => { //No I18N
            this.renderFieldsMapping();
            if(e.target.checked) {
                this.setCreateDropdownOption();
            } else {
                this.enableCreateDropdownOption(false);
            }
        });

        jQuery("#integration-rule-save-btn").on("click", (e) => { //No I18N
            this.save();
        });

        jQuery("#integration-rule-cancel-btn").on("click", (e) => { //No I18N
            this.back();
        });
    },
    resetActions() {
        jQuery("#can_show_map").prop("checked", false); //No I18N
        jQuery("#can_add_refer_entity").prop("checked", false); //No I18N
        jQuery("#can_show_indentification_rules").prop("checked", false); //No I18N
        jQuery("#can_show_filter").prop("checked", false); //No I18N
        jQuery("#integration-field-map-container, #identifier_rule_container, #condition_container").hide(); //No I18N
        jQuery("#condition, #identifier_rule").empty();
        this.clearCache();
    },
    clearCache() {
        this.resetMap();
        this.destinationModulePromise = undefined;
        this.destinationModuleMetaPromise = undefined;
    },
    resetMap() {
        this.sourceMapRows = undefined;
        this.renderFieldsMapping();
    },
    back() {
        const self = $integrationSyncRuleForm;
        self.toggle(true);
        self.options.redirectToList();
    },
    getFieldById(allowedValues, id) {
        return allowedValues.findBy("id", id); //No I18N
    },
    async getDestinationFeildAllowedValues() {
        const destinationModuleResponse = await this.fetchDestinationModuleMetaInfo();
        return this.getAllowedValues(destinationModuleResponse.metainfo.fields);
    },
    async renderIdentifierRule(data) {
        const sourceFieldMetaInfo = cloneJson(this.sourceModuleMetainfo);
        const destinationModuleResponse = await this.fetchDestinationModuleMetaInfo();

        const destinationModuleAllowedValues = this.getAllowedValues(destinationModuleResponse.metainfo.fields);
        const singleLineFields = this.getIndentifierFields(destinationModuleAllowedValues, "Single Line"); //No I18N
        const multiLineFields = this.getIndentifierFields(destinationModuleAllowedValues, "Multi Line"); //No I18N

        //set destination module fields as allowed values for source field by field type
        Object.keys(sourceFieldMetaInfo).forEach((key) => {
            const sourceField = sourceFieldMetaInfo[key];
            const values = sourceField.display_type === "Single Line" ? singleLineFields : multiLineFields;//No I18N
            sourceField.allowed_conditions = [
                {
                    "name": "is",                   //No I18N
                    "display_name": "is"            //No I18N
                },
                {
                    "name": "starts with",          //No I18N
                    "display_name": "begins with"   //No I18N
                },
                {
                    "name": "ends with",            //No I18N
                    "display_name": "ends with"     //No I18N
                },
                {
                    "name": "contains",            //No I18N
                    "display_name": "contains"     //No I18N
                }
            ];
            sourceField.display_type = "Pick List"; //No I18N
            sourceField.type = "lookup"; ; //No I18N
            sourceField.values = values;
            sourceField.multiple = false;
        });

        jQuery("#identifier_rule_container").show(); //No I18N

        const metainfo = sourceFieldMetaInfo;
        let skipFieldTypeConditions = {};

        const conditions = ["contains","not_contains", "is_not", "is_not_empty", "is_empty"]; //No I18N

        for(const field in metainfo) {
            skipFieldTypeConditions[field] = conditions;
        }

        this.renderCustomFilter({
            containerId: "identifier_rule", //No I18N
            metainfo,
            skipFieldTypeConditions,
            enableDragHandle: true,
            haveNestedColumns: false,
            haveDependentRules: true,
            innerCriteriaClass: "innerCriteriaRule", //No I18N
            innerCriteriaEnabled:true,
            maxrows: 5
        });

        if(data) {
            constructData = (rule) => {
                const value = this.getFieldById(destinationModuleAllowedValues, rule.destination_field)
                value.name = value.display_name;
                const data = {
                    field: rule.source_field,
                    condition: rule.condition,
                    values: [value],
                    logical_operator: rule.logical_operator
                }
                if (rule.children){
                    data.children = rule.children.map((rule) => {
                        return constructData(rule);
                    });
                }
                return data;
            }
            data = data.map((rule) => {
                return constructData(rule);
            });
            jQuery("#identifier_rule").custom_filter("update", data); //No I18N
        }
    },
    //get fields for the given type
    getIndentifierFields(fields, fieldType) {
        const allowedValues = [];

        for(let key in fields) {
            const field = fields[key];
            if(field.display_type === fieldType) {
                field.text = field.display_name;
                allowedValues.push(field);
            }
        }

        return allowedValues;
    },
    renderFilter() {
        jQuery("#condition_container").show(); //No I18N

        this.renderCustomFilter({
            containerId: "condition", //No I18N
            metainfo: this.sourceModuleMetainfo
        });
    },
    renderCustomFilter(options) {
        options.customView = {
            "title_btn_style": "background-color: #eeeeee; border:1px solid; box-shadow: none; border-color: #cfcfcf; box-sizing: border-box; padding: 1px 10px;" //NO I18N
        };

        options.entity = "integration_device_type"; //No I18N

        if(jQuery("#" + options.containerId).is(":empty")) {
            jQuery("#" + options.containerId).custom_filter(options);
        }
    },
    getFields (fields) {
        let allowedValues = [];
        function getField(fields, key) {
            const field = fields[key];
            field.id = key;
            return { ...field, ...{ key } };
        }

        for (let key in fields) {
            if (fields[key].type === "group" || fields[key].type === "udf") { //No I18N
                const subFields = fields[key].fields;
                const values = Object.keys(subFields).map(function (key) {
                    return getField(subFields, key);
                });
                allowedValues = allowedValues.concat(values);
            } else {
                allowedValues.push(getField(fields, key));
            }
        }

        return allowedValues;
    },
    getAllowedValues (metainfo) {
        const fields = metainfo;
        let allowedValues = this.getFields(fields);

        return allowedValues.filter(function (field) {
            return field.hasOwnProperty("display_name"); //No I18N
        }).sort(
            (a, b) => a.display_name.localeCompare(b.display_name, sdp_user.LOCALE.replace("_", "-"), { sensitivity: "base" })
        );
    },
    fetchDestinationModuleMetaInfo() {
        const { api_plural_name } = this.data ? this.data.destination_module : jQuery("#destination_module").select2("data");//No I18N

        if(this.destinationModulePromise) {
            return this.destinationModulePromise;
        }

        if(!api_plural_name) {
            return;
        }

        this.destinationModulePromise = sdpAjax({
            url: `/api/v3/${api_plural_name}/_metainfo`,
            data: sdpAjaxInputData({ for: "sync_rule" }) //No I18N
        });

        return this.destinationModulePromise;
    },
    fetchDestinationModuleMetaData() {
        const { api_plural_name } = this.data ? this.data.destination_module : jQuery("#destination_module").select2("data");//No I18N

        if(this.destinationModuleMetaPromise) {
            return this.destinationModuleMetaPromise;
        }

        if(!api_plural_name) {
            return;
        }

        this.destinationModuleMetaPromise = sdpAjax({
            url: `/api/v3/${api_plural_name}/_metadata`,
        });

        return this.destinationModuleMetaPromise;
    },
    getMandatoryFields(destinationModuleResponse) {
        const layouts = destinationModuleResponse.metadata.layout;
        let sections = layouts.sections || [];

        return sections.reduce((fields, section) => {
            const sectionFields = section.fields;

            let fieldMeta = sectionFields.map((field) => {
                const metainfo = this.getFieldMetaInfo(destinationModuleResponse, field.name, field.context);
                const name = field.name;

                if(!metainfo || field.context && field.context !== "udf_fields") {
                    return {};
                }

                return {
                    id: name,
                    name: name,
                    context: field.context,
                    type: metainfo.type,
                    display_type: metainfo.display_type,
                    mandatory: metainfo.mandatory
                }
            });

            fieldMeta = fieldMeta.filter((field) => {
                return field.mandatory && field.name !== "name"; //No I18N
            });

            return fields.concat(fieldMeta);
        }, []);
    },
    getFieldMetaInfo(response, name, context) {
        const meta = response.metadata || response;
        const metainfo = meta.metainfo.fields;

        if(metainfo[name]) {
            return metainfo[name];
        }

        if(context) {
            return metainfo[context].fields[name];
        }

        return metainfo[name] || {};
    },
    getFieldMappingData (data, mandatoryFields, destinationModuleResponse) {
        data = data || [];
        const destinationFields = data.reduce((fields, row) => {
            fields[row.destination_field.id] = true;
            return fields;
        }, {});

        mandatoryFields.forEach((field) => {
            if(!destinationFields[field.id]) {
                let destination_field = this.getFieldMetaInfo(destinationModuleResponse, field.name, field.context);

                destination_field.id = field.name;
                destination_field.name = destination_field.display_name;

                data.push({
                    destination_field,
                });
            }
        });

        return data;
    },
    getMaxRow (source, destination) {
        const sourceMap = source.reduce((map, value) => {
            map[value.id] = value;
            return map;
        }, {});

        const destinationMap = destination.reduce((map, value) => {
            map[value.id] = value;
            return map;
        }, {});

        let count = 0;

        for (var sourceId in sourceMap) {
            for (var destinationId in destinationMap) {
                if (this.isTypeSame(sourceMap[sourceId], destinationMap[destinationId])) {
                    sourceMap[sourceId] = undefined;
                    destinationMap[destinationId] = undefined;
                    count++;
                }
            }
        }

        return count;
    },
    //only product and ci_status is lookup entity in integration rule
    isLookupEntity(field) {
        const singleLineLookupFields = ["product", "ci_status"];//No I18N

        return singleLineLookupFields.includes(field.lookup_entity);
    },
    isTypeSame (source, destination) {
        if(!source || !destination) {
            return false;
        }

        if(this.isLookupEntity(destination)) {
            return source.display_type === "Single Line"; //No I18N
        }

        const key = source.display_type ? "display_type" : "type";

        return source[key] === destination[key];
    },
    async renderFieldsMapping (data) {
        const self = this;
        const formatResult = this.formatResult;
        const errorMsg = {
            data_msg_required : getMessageForKey("ae.config.depreciation.option.required")
        };

        const canShow = jQuery("#can_show_map").is(":checked"); //No I18N
        jQuery("#integration-field-map-container").toggle(canShow); //No I18N

        if(!canShow || this.sourceMapRows) {
            return;
        }

        const destinationModuleResponse = await this.fetchDestinationModuleMetaInfo();
        const isEdit = data !== undefined;

        const mandatoryFields = this.getMandatoryFields(await this.fetchDestinationModuleMetaData());
        const hasMandatoryFields = mandatoryFields.length > 0;

        if(hasMandatoryFields) {
            data = this.getFieldMappingData(data, mandatoryFields, destinationModuleResponse);
        }

        //disable check box if mandatory fields are found
        jQuery("#can_show_map").prop("disabled", hasMandatoryFields); //No I18N

        const destinationModuleMetaInfo = destinationModuleResponse.metainfo.fields;
        const destinationAllowedValues = self.getAllowedValues(destinationModuleMetaInfo);
        const sourceAllowedValues = self.getAllowedValues(self.sourceModuleMetainfo);
        const max_rows = this.getMaxRow(sourceAllowedValues, destinationAllowedValues) - 1; //excluding name field count

        jQuery("#integration-field-map").empty(); //No I18N
        this.sourceMapRows = new cloneRows({
            mode: data ? "edit" : "new", //No I18N
            data,
            skip_addrow_validation: true,
            selector: "integration-field-map", //No I18N
            min_rows: 1,
            max_rows,
            meta_info: {
                destination_field: {
                    type: "select2", //No I18N
                    place_holder: "sdp.change.sla.select", //No I18N
                    select2: {
                        data: [],
                        formatResult,
                        formatSelection: formatResult,
                        processResults: function(search_data,data,field) {
                            search_data.push(data);
                        },
                        query: function (query) {
                            const data = self.sourceMapRows.getValues(true);
                            const currentRow = data.findBy("destination_field", query.element.val()) || {}; //No I18N
                            const { destination_field } = currentRow;

                            const excludedIds = data.reduce((ids, row) => {
                                if (row.destination_field !== destination_field) {
                                    ids[row.destination_field] = true;
                                }
                                return ids;
                            }, {});

                            excludedIds.name = true; //name is mapped internally by default

                            const matcher = this.matcher;

                            query.callback({
                                results: destinationAllowedValues.filter((field) => {
                                    return !excludedIds.hasOwnProperty(field.id) && matcher(query.term, field.display_name);
                                })
                            });
                        }
                    },
                    events: {
                        change: function (sourceField) {
                            const element = jQuery(sourceField).closest('[data-attr="clonerows"]').find('[data-name=source_field]'); //No I18N
                            element.select2("enable", true);  //No I18N
                            element.select2("open"); //No I18N
                            element.select2("val", ""); //No I18N
                        }
                    },
                    error_messages: errorMsg
                },
                source_field: {
                    type: "select2", //No I18N
                    place_holder: "sdp.change.sla.select", //No I18N
                    select2: {
                        formatResult: formatResult,
                        formatSelection: formatResult,
                        query: function (query) {
                            const matcher = this.matcher;
                            const data = self.sourceMapRows.getValues(true);
                            const currentRow = jQuery(query.element).closest('[data-attr="clonerows"]').data("row-id"); //No I18N
                            const { source_field } = data.findBy("source_field", query.element.val()) || {}; //No I18N
                            const excludedIds = data.reduce((ids, row) => {
                                if (row.source_field !== source_field) {
                                    ids[row.source_field] = true;
                                }
                                return ids;
                            }, {});

                            excludedIds.name = true; //name is mapped internally by default

                            const destination = jQuery(`#integration-field-map > [data-row-id="${currentRow}"]`).find('[data-name=destination_field]').select2("data");  //No I18N
                            const destinationFieldValue = self.getFieldById(destinationAllowedValues, destination.id);

                            query.callback({
                                results: sourceAllowedValues.filter((source) => {
                                    if(!matcher(query.term, source.display_name) || excludedIds[source.id]) {
                                        return false;
                                    }

                                    return self.isTypeSame(source, destinationFieldValue);
                                })
                            });
                        }
                    },
                    error_messages: errorMsg
                },
            },
            callbackRowAdd: function (options, evt) {
                jQuery(`#integration-field-map > [data-row-id="${self.getNextRowId(evt.target)}"]`).find('[data-name=source_field]').select2("enable", false); //No I18N
            },
            callbackRowDelete: () => {
                this.setCreateDropdownOption();
            }
        });

        if (!isEdit && (!data || !data.length )) {
            jQuery('#integration-field-map').find('[data-name=source_field]').last().select2("enable", false); //No I18N
        }

        if(mandatoryFields.length) {
            const fields = mandatoryFields.reduce((fields, field) => {
                fields[field.id] = true;
                return fields;
            }, {});

            data.forEach((row, index) => {
                if(fields[row.destination_field.id]) {
                    const rowId = index + 1;
                    jQuery(`[name=destination_field_integration-field-map_${rowId}]`).select2("enable", false); //No I18N
                    jQuery(`#integration-field-map > [data-row-id=${rowId}]`).find("[data-action=removerow]").addClass("ptr-ev-none"); //No I18N
                }
            });
        }

        if(data && data.length || mandatoryFields.length) {
            this.setCreateDropdownOption();
        }

        jQuery("#integration-field-map").on("change", "[name^=destination_field_integration-field]", () => {
            this.setCreateDropdownOption();
        });
    },
    async setCreateDropdownOption() {
        const allowedValues = await this.getDestinationFeildAllowedValues();
        const isLookupSelected = Array.from(document.querySelectorAll("[name^=destination_field_integration-field]")).some((element) => {//No I18N
            const data = jQuery(element).select2("data"); //No I18N

            if(data) {
                return this.isLookupEntity(this.getFieldById(allowedValues, data.id));
            }
        });

        this.enableCreateDropdownOption(isLookupSelected);
    },
    enableCreateDropdownOption(enable) {
        const canCheck = enable ? jQuery("#can_add_refer_entity").prop("checked") : false;//No I18N
        jQuery("#can_add_refer_entity").prop("checked", canCheck);//No I18N
        jQuery("#can_add_refer_entity").closest(".form-group").toggleClass("disableDiv", !enable);//No I18N
    },
    async populateMandatoryFieldMapping () {
        const destinationModuleResponse = await this.fetchDestinationModuleMetaData();
        const mandatoryFields = this.getMandatoryFields(destinationModuleResponse);
        const hasMandatoryFields = mandatoryFields.length > 0;
        jQuery("#can_show_map").prop("checked", hasMandatoryFields); //No I18N

        if(hasMandatoryFields) {
            this.renderFieldsMapping();
        } else {
            jQuery("#can_show_map").prop("disabled", false); //No I18N
        }
    },
    validate() {
        if (!jQuery("#sync-rule-form").find("input:visible:not(:disabled)").valid()) { //No I18N
            return false;
        }

        if (jQuery("#can_show_indentification_rules").is(":checked") && jQuery("#identifier_rule").custom_filter("getFilterData") === false) { //No I18N
            return false;
        }

        if (jQuery("#can_show_filter").is(":checked") && jQuery("#condition").custom_filter("getFilterData") === false) { //No I18N
            return false;
        }

        return true;
    },
    renderDestinationModule () {
        const isAsset = this.isAsset;
        const api = isAsset ? "asset_modules" : "ci_types"; //No I18N

        let ciTypes, destinationModules;
        const ciTypePromise = hierarchySelect2.getChildrenTreeData({
            url: "/api/v3/" + api, //No I18N
            inputData: {
                list_info: {
                    "fields_required": ["parent", "display_name", "api_plural_name", "name"],//No I18N
                    "row_count": 100, //No I18N
                    "start_index": 1, //No I18N
                    "search_criteria": { //No I18N
                        "field" : "name", //No I18N
                        "condition" : "is not", //No I18N
                        "value" : "cmdb", //No I18N
                        "logical_operator" : "AND" //No I18N
                    }
                }
            },
            entity: isAsset ? "asset_modules" : "ci_types", //No I18N
        }).then((data) => {
            ciTypes = data;
        });

        const destinationModuleAllowedIds = hierarchySelect2.fetchAllApiData({
            url: `/api/v3/integration_sync_rules/destination_module`,
            inputData: {
                list_info: {
                    fields_required: ["id"],//No I18N
                    row_count: 100,
                    start_index: 1,
                    filter_by: {
                        id: this.data ? this.data.source_module.id : jQuery("#source_module").val() //No I18N
                    }
                },
                service: {
                    id : this.model.id
                }
            },
            entity: "destination_module" //No I18N
        }).then((data) => {
            destinationModules = data;
        });

        Promise.all([ciTypePromise, destinationModuleAllowedIds]).then(() => {
            const data = hierarchySelect2.disableDisallowedValues(ciTypes, destinationModules);
            const selectedValue = this.getSelectedDestinationModule(data);

            hierarchySelect2.init({
                id: "destination_module", //No I18N
                displayField: true,
                placeholder: translate("sdp.change.sla.select"), //No I18N
                promise: new Promise((resolve) => resolve({
                    originalData:  ciTypes,
                    data
                })),
                selectedValue
            });

            this.resetMap();
            setTimeout(() => {
                if(selectedValue) {
                    this.populateMandatoryFieldMapping();
                }
            });
        });
    },
    getSelectedDestinationModule(data) {
        let option = data.find((option) => {
            return option.disabledOption !== true;
        });

        if(!option) {
            data.find((module) => {
                if(module.children) {
                    option = this.getSelectedDestinationModule(module.children);
                    return true;
                }
                return false;
            });
            return option;
        }

        return option;
    },
    setAssociationType(evt, data) {
        this.send("selectingSelect2", { element: { id: evt.target.id } }, data); //No I18N
    },
    getElementRowId(element) {
        return jQuery(element).closest('[data-attr="clonerows"]').data("row-id"); //No I18N
    },
    getNextRowId(element) {
        return jQuery(element).closest('[data-attr="clonerows"]').next().data("row-id"); //No I18N
    },
    save() {
        let url = `/api/v3/integration_sync_rules/`;
        const isEdit = this.data !== undefined;

        if (!this.validate()) {
            return false;
        }

        let field_mapping;

        if(jQuery("#can_show_map").is(":checked")) { //No I18N
            field_mapping = this.sourceMapRows.getValues().map((field) => {
                return {
                    source_field: {
                        name: field.source_field
                    },
                    destination_field: {
                        name: field.destination_field
                    }
                }
            });
        }

        let identifier_rule = jQuery("#can_show_indentification_rules").is(":checked") ? jQuery("#identifier_rule").custom_filter("getFilterData") : []; //No I18N

        getRule = (rule) => {
           const result = {
                source_field: rule.field,
                destination_field: rule && rule.values.length && typeof rule.values[0] === "object" ? rule.values[0].id : undefined,
                condition: rule.condition,
                logical_operator: rule.logical_operator
            }

            if(rule.children) {
                result.children = rule.children.map((rule) => {
                    return getRule(rule);
                });
            }

            return result;
        }
        identifier_rule = identifier_rule.map((rule) => {
            return getRule(rule);
        });

        let data = {
            description: jQuery("#description").val(), //No I18N
            is_enabled: jQuery("[name=sync_status]:checked").val(), //No I18N
            condition: jQuery("#can_show_filter").is(":checked") ? jQuery("#condition").custom_filter("getFilterData") : [], //No I18N
            field_mapping: jQuery("#can_show_map").is(":checked") ? field_mapping : [], //No I18N
            can_add_refer_entity: jQuery("#can_add_refer_entity").is(":checked"), //No I18N
            identifier_rule
        };

        if (isEdit) {
            url += this.data.id;
        } else {
            data = {
                ...data,
                ...{
                    source_module: { "id": jQuery("#source_module").val() }, //No I18N
                    destination_module: { "id": jQuery("#destination_module").val() } //No I18N
                }
            }
        }

        const saveButton = jQuery("#saveBtn");

        saveButton.button("loading"); //No I18N

        sdpAjax({
            url,
            type: isEdit ? "PUT" : "POST", //No I18N
            data: sdpAjaxInputData({
                integration_sync_rule: data
            }),
            success: () => {
                showalert("success", getMessageForKey("sdp.admin.backup.settings.save.success.msg"), "isAutoHide=true"); //NO I18N
                this.back();
            },
            complete: () => {
                saveButton.button("reset"); //No I18N
            }
        });
    }
};
