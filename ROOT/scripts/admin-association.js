/* $Id$ */
var $association = {
    cardinalityDefaultValue: "many_to_many", //No I18N
    cardinalityAllowedValues: [
        {
            id: "one_to_one", //No I18N
            text: "One to One" //No I18N
        },
        {
            id: "one_to_many", //No I18N
            text: "One to Many" //No I18N
        },
        {
            id: "many_to_one", //No I18N
            text: "Many to One" //No I18N
        },
        {
            id: "many_to_many", //No I18N
            text: "Many to Many" //No I18N
        }
    ],
    apiFieldNames: ["source_api_name", "destination_api_name", "source_api_plural_name", "destination_api_plural_name"], //No I18N
    canCloseDialog: false,
    shouldFocusDestinationModule: false,
    sourceCriteriaOptions: {},
    destinationCriteriaOptions: {},
    sourceModuleFilterFieldOptions: [],
    destinationModuleFilterFieldOptions: [],
    //initialize the association or relationship form from the association list or relationship list of ci type respectively
    init(options) {
        this.options = options;
        this.data = options.association;
        this.isEdit = this.data.id ? true : false;
        jQuery(window).resize(function () {
            jQuery("#relationship-association-container .zdialog__content").height(jQuery(window).height()); //No I18N
        });
        this.setup();
    },
    //fetch association data of the source module
    fetchData() {
        return sdpAjax({
            url: this.options.url + "/" + this.data.id,
        }).then((response) => {
            const data = response[this.options.entity];
            const assocKeyFields = this.apiFieldNames;

            assocKeyFields.forEach((key) => {
                data[key] = data[key].replace("assoc_", ""); //No I18N
            });

            this.data = data;
            this.setFilterData();
        });
    },
    //set display name for each form field
    setLabel() {
        const metaInfoFor = this.options.for;
        let data;

        if(metaInfoFor) {
            data = sdpAjaxInputData({ for: metaInfoFor });
        }

        return sdpAjax({
            url: this.options.url + "/_metainfo", //No I18N
            data: data
        }).then((response) => {
            let label = {};
            const metaInfo = response.metainfo.fields;
            for(let key in metaInfo) {
                label[key] = metaInfo[key].display_name;
            }

            this.label = label;
            this.displayName = response.metainfo.display_name;
            this.metaInfo = metaInfo;
        });
    },
    setSourceModuleFilterAllowedValues() {
        this.initFilterField(this.data.source_module.api_plural_name, "source_filter"); //No I18N
    },
    setDestinationModuleFilterAllowedValues() {
        this.initFilterField(jQuery("#destination_module").select2("data")?.api_plural_name, "destination_filter"); //No I18N
    },
    //reset and focus the dependent field on destination module change
    didDestinationModuleChange() {
        this.resetDestinationModuleDependents();
        this.setDestinationModuleFilterAllowedValues();
        this.setDestinationCriteria();

        if(this.data.id) {
            return;
        }

        this.destinationModuleCallback && this.destinationModuleCallback();
        setTimeout(() => {
            this.destinationModuleCallback = undefined;
        });

        setTimeout(() => {
            jQuery("#destination_module").valid(); //No I18N
        });
    },
    fetchMetaInfo(api) {
        this.metaInfoCache = this.metaInfoCache || {};

        if (this.metaInfoCache[api]) {
            return this.metaInfoCache[api];
        }

        return sdpAjax({
            url: "/api/v3/" + api + "/_metainfo", //No I18N
        })
    },
    //initialize source filter and destination filter
    initFilterField(api_plural_name, id) {
        if (api_plural_name) {
            this.fetchMetaInfo(api_plural_name).then((response) => {
                this.renderFilterField(id, this.filterAllowedValues(response));
            });
        } else {
            //render with empty allowed values if module filter is not filled yet.
            this.renderFilterField(id, []);
        }
    },
    //render source and destination filter
    renderFilterField(id, allowedValues) {
        const filter = jQuery("#" + id); //No I18N

        allowedValues.forEach((data) => {
            data.text = data.display_name;
        });

        const formatResult = (data) => e_html(data.display_name || data.text);
        filter.select2({
            data: allowedValues,
            formatSelection: formatResult,
            formatResult: formatResult,
            multiple: true,
            maximumSelectionSize: 3,
            closeOnSelect: false,
            placeholder: translate("sdp.change.sla.select") //No I18N
        });

        const data = this.data[id] || [];
        filter.select2("data", data); //No I18N
    },
    //skip or filter out allowed values which is not required from the metainfo
    filterAllowedValues(response) {
        const metaInfo = response.metainfo.fields;
        let fields = [];

        function getField(fields, key) {
            const field = fields[key];
            field.id = key;
            return field;
        }

        for (let key in metaInfo) {
            if (metaInfo[key].type === "group" || metaInfo[key].type === "udf") { //No I18N
                const subFields = metaInfo[key].fields;
                const values = Object.keys(subFields).map((key) => getField(subFields, key));
                fields = fields.concat(values);
            } else {
                fields.push(getField(metaInfo, key));
            }
        }

        const allowedEntities = new Set(["user", "technician", "status", "site", "department", "vendor","asset"]); //No I18N

        fields = fields.filter((field) => {
            return field.display_name &&
                field.display_type === "Pick List" && //No I18N
                field.multiple !== "true" && //No I18N
                allowedEntities.has(field.lookup_entity)
        });

        return fields.map((field) => {
            return {
                name: field.id,
                display_name: field.display_name,
                id: field.id,
            }
        });
    },
    //should reset destination module if the selected destination module
    //is not available for the selected association type
    shouldResetAssociatedModule() {
        const destinationModuleId = jQuery("#destination_module").val(); //No I18N

        if(!destinationModuleId) {
            return new Promise((resolve) => {
                resolve(false);
            });
        }

        return sdpAjax({
            url: "/api/v3/module_relationships/destination_module", //No I18N
            data: sdpAjaxInputData({
                list_info: {
                    filter: {
                        association_type: jQuery("#association_type").val(), //No I18N
                        source_module: this.data.source_module.id
                    },
                    search_criteria: {
                        field: "id", //No I18N
                        value: destinationModuleId,
                        condition: "is" //No I18N
                    }
                }
            })
        }).then((response) => {
            return !response.destination_module.length;
        });
    },
    async setup () {
        if(this.isEdit) {
            await Promise.all([this.fetchData(), this.setLabel()]).then(() => {
                this.openSlider();
                this.initCriteria();
            });

        } else {
            await this.setLabel();
            this.openSlider();
        }

        this.setValidation();
        initTooltip("#new_relationship_form"); //No I18N
    },
    //check if there is unsaved changes in the current tab before switching the tab
    initTabSwitchEvent() {
        jQuery("#additional-fields-tab, #available-fields-tab").on("click", (e) => { //No I18N
            const tab = jQuery(e.target);
            if(jQuery("#new_relationship_form").is(":visible") && this.hasUnsavedChanges()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.confirmDiscardingChanges((canSwitchTab) => {
                    if(canSwitchTab) {
                        setTimeout(() => {
                            tab.trigger("click"); //No I18N
                        }, 1);

                        this.resetForm();
                    }
                });
            } else {
                this.switchTab(tab.data("tab")); //No I18N
            }
        });
    },
    //clear the criteria changes and reset with the original data
    resetCriteria() {
        const data = this.data;

        jQuery("#source_criteria").custom_filter("update", data.source_criteria); //No I18N
        jQuery("#destination_criteria").custom_filter("update", data.destination_criteria); //No I18N
    },
    //set select2 format for the filter fields
    setFilterData() {
        let { source_filter, destination_filter } = this.data;
        const setId = (filter) => filter.id = filter.name;

        source_filter = source_filter || [];
        destination_filter = destination_filter || [];

        source_filter.forEach(setId);
        destination_filter.forEach(setId);
    },
    //reset filter fields with original data
    resetFilterFields() {
        this.setFilter("source_filter"); //No I18N
        this.setFilter("destination_filter"); //No I18N
    },
    //set data for the fields fields
    setFilter(id) {
        const filter = jQuery("#" + id); //No I18N
        filter.select2("data", this.data[id]); //No I18N
    },
    //show/hide criteria in edit by criteria data
    toggleCriteria() {
        const hasSourceCriteria = this.data.source_criteria?.length > 0;
        const hasDestinationCriteria = this.data.destination_criteria?.length > 0 || jQuery("#destination_module").select2("data")?.length > 0; //No I18N

        jQuery("#source_criteria_checkbox").prop("checked", hasSourceCriteria); //No I18N
        jQuery("#source_criteria_container").toggle(hasSourceCriteria); //No I18N

        this.toggleDestinationCriteria(hasDestinationCriteria);
    },
    toggleDestinationCriteria(canShow) {
        jQuery("#destination_criteria_checkbox").prop("checked", canShow); //No I18N
        jQuery("#destination_criteria_container").toggle(canShow); //No I18N
    },
    initCriteria() {
        this.toggleCriteria();
        this.setSourceCriteria();
        this.setDestinationCriteria();
    },
    //set source criteria with source module url
    setSourceCriteria() {
        this.setCriteria(this.data.source_module.api_plural_name, "source_criteria"); //No I18N
    },
    //set destination criteria if destination module is selected
    setDestinationCriteria() {
        const entity = jQuery("#destination_module").select2("data")?.api_plural_name; //No I18N
        if (!entity) {
            return false;
        }

        this.setCriteria(entity, "destination_criteria"); //No I18N
        return true;
    },
    //initialize source and destination criteria
    setCriteria(entity, criteria) {
        const options = {
            entity,
            includeSubFields: ["cm_fields", "udf_fields"],//No i18n
            conditions: this.data[criteria] || [],
            input_data: {
                for: "associations" //No I18N
            },
            maxrows: 10
        };

        this.initCustomFilter(criteria, options);
    },
    switchTab(tab) {
        this.isChangeSaved = false;
        if(tab === "associated_fields") { //No I18N
            this.renderAssociatedFieldList();
        } else {
            this.renderAvailableFieldList();
        }
    },
    //clear modified form changes
    resetForm() {
        this.toggleCriteria();
        this.resetCriteria();
        this.resetFilterFields();
        jQuery("#new_relationship_form").find("input[name]").each(function () { //NO I18N
            jQuery(this).val(this.defaultValue);
        });
    },
    //set api name field values with source module, cardinality and destination module value when changes
    autoPopulateApiNames() {
        if(this.isEdit) {
            return;
        }
        const sourceModule = this.data.source_module;
        const sourceModuleApiPluralName = sourceModule.api_plural_name;
        const sourceModuleName = sourceModule.name;

        const destinationModule = jQuery("#destination_module").select2("data"); //No I18N
        const destinationModuleName = destinationModule?.name;
        const destinationModuleApiPluralName = destinationModule?.api_plural_name;

        const associationType = jQuery("#association_type").select2("data"); //No I18N
        const associationTypeName = associationType?.name;
        const associationTypeInverseName = associationType?.inverse_name;

        const destinationApiName = [destinationModuleName, associationTypeInverseName, sourceModuleName];
        const sourceApiName = [sourceModuleName, associationTypeName, destinationModuleName];

        const sourceApiPluralName = [sourceModuleApiPluralName, associationTypeName, destinationModuleApiPluralName];
        const destinationApiPluralName = [destinationModuleApiPluralName, associationTypeInverseName, sourceModuleApiPluralName];

        //remove api name's prefix
        //e.g cm_api_name => api_name
        const removePrefix = (value) => {
            if(!value) {
                return value;
            }
            return value.substr(value.indexOf("_") + 1); //No I18N
        }
        const getApiName = (values) => {
            values[0] = removePrefix(values[0]);
            values[2] = removePrefix(values[2]);

            return values.join("_").replace(/[^A-Z0-9]+/gi, "_").toLowerCase(); //No I18N
        };

        this.populateFieldValue("source_api_name", getApiName(sourceApiName)); //No I18N
        this.populateFieldValue("destination_api_name", getApiName(destinationApiName)); //No I18N
        this.populateFieldValue("source_api_plural_name", getApiName(sourceApiPluralName)); //No I18N
        this.populateFieldValue("destination_api_plural_name", getApiName(destinationApiPluralName)); //No I18N
    },
    //set api name fields and highlight the changes
    populateFieldValue(field, value) {
        const element = jQuery("#" + field); //No I18N

        element.val(value);
        setTimeout(() => {
            element.valid();
        });

        element.addClass("highlight-anim"); //No I18N

        setTimeout(() => {
            element.removeClass("highlight-anim"); //No I18N
        }, 1000);
    },
    didRender() {
        this.renderAssociationType();
        this.renderDestinationModule();
        this.renderCardinality();

        this.setSourceModuleFilterAllowedValues();
        this.setDestinationModuleFilterAllowedValues();
        this.setEvents();

        if(!this.isEdit) {
            this.toggleCriteria();
        }

        this.preventTransition();
    },
    shouldConfirm() {
        return !this.canCloseDialog && this.hasUnsavedChanges() && jQuery("#new_relationship_form").is(":visible"); //No I18N
    },
    preventTransition() {
        window.addEventListener("beforeunload", function (e) {
            let confirmationMessage = translate("form.leave.alert");

            if($association.shouldConfirm()) {
                e.preventDefault();
                e.returnValue = true;
            }
            return confirmationMessage;
        });
    },
    setEvents() {
        jQuery(document).off("change.destination_module").on("change.destination_module", "#destination_module", () => { //No I18N
            this.didDestinationModuleChange();
            this.autoPopulateApiNames();
        });

        jQuery("#association_type").on("change", (element) => { //No I18N
            this.setDestinationModule(element.target.value);
            this.autoPopulateApiNames();
        });

        jQuery("#cardinality").on("change", () => { //No I18N
            this.setCardinalitySvg();
        });

        jQuery("#source_criteria_checkbox").on("change", (e) => { //No I18N
            const isChecked = e.target.checked;
            if (isChecked) {
                this.setSourceCriteria();
            }
            jQuery("#source_criteria_container").toggle(e.target.checked); //No I18N
        });

        jQuery("#destination_criteria_checkbox").on("change", (e) => { //No I18N
            const isChecked = e.target.checked;
            if (isChecked) {
                this.setDestinationCriteria();
            }
            if(jQuery("#destination_module").val()) {
                jQuery("#destination_criteria_container").toggle(e.target.checked); //No I18N
            }
        });

        const enableDestinationCriteria = jQuery("#destination_criteria_checkbox"); //No I18N

        enableDestinationCriteria.on("change", (evt) => { //No I18N
            if (!evt.target.checked) {
                return;
            }
            const canEnable = this.validateDependeeFields(["#association_type", "#destination_module"], evt); //No I18N

            //if destination module is not selected, prevent checkbox from being checked and ask user to select destination module
            if (canEnable) {
                jQuery("#destination_criteria_container").toggle(true); //No I18N
                this.setDestinationCriteria();
                return;
            }

            enableDestinationCriteria.prop("checked", false); //No I18N
            this.shouldFocusDestinationModule = true;
            this.shouldEnableDestinationCriteria = true;

            this.destinationModuleCallback = () => {
                if (this.shouldEnableDestinationCriteria) {
                    enableDestinationCriteria.prop("checked", true); //No I18N
                    jQuery("#destination_criteria_container").toggle(true); //No I18N
                    this.setDestinationCriteria();
                    this.shouldEnableDestinationCriteria = false;
                }
            }
        });

        let destinationDependentFields = this.apiFieldNames.map((name) => "#" + name).join(",");

        destinationDependentFields += ",#destination_display_name"; //No I18N

        jQuery(destinationDependentFields).on("focus", (evt) => { //No I18N
            const canModify = this.validateDependeeFields(["#association_type", "#destination_module"], evt); //No I18N
            if (canModify) {
                return;
            }

            this.destinationModuleCallback = () => {
                if (this.shouldEnableDestinationCriteria) {
                    jQuery(evt.target).focus();
                    this.shouldEnableDestinationCriteria = false;
                }
            }
        });


        jQuery("#save-btn").on("click", () => this.save()); //No I18N
        jQuery("#cancel-btn").on("click", () => this.cancel()); //No I18N

        this.initTabSwitchEvent();
    },
    renderCardinality() {
        const cardinality = this.data?.cardinality || this.cardinalityDefaultValue;

        jQuery("#cardinality").select2({ //No I18N
            data: this.cardinalityAllowedValues
        });

        this.setCardinalityValue(cardinality);
    },
    renderAssociationType() {
        ResourceLoader({
            js: ["/scripts/admin-association-type.js"], //No I18N
            success: () => {
                new $associationType().init({
                    ...{
                        entity_name: "association_type", //No I18N
                        value: this?.data?.association_type,
                        url: this.metaInfo.association_type.href,
                    },
                    ...this.options.association_type || {}
                });
            }
        });
    },
    render() {
        this.isChangeSaved = false;
        const data = {
            ...this.data,
            label: this.label,
            options: this.options
        }
        renderhbs(this.options.attachTo, "association", data, false, "admin"); //No I18N
    },
    openSlider() {
        this.render();

        var options = {
            title: this.getTitle(),
            type: "modal", //No I18N
            width:'1000px', //No I18N
            height: jQuery(window).height(),
            position: {
                right: "0px", //No I18N
                top: "0px" //No I18N
            },
            draggable: false,
            resizable: {
                directions: "w" ,//No I18N
                minWidth: 920
            },
            focusOnOpen: false,
            animation: {
                open: {
                    className:'zeffects--slideright', //No I18N
                    duration:300
                }
            },
            closeOnEscKey: true,
            beforeclose: () => {
                const shouldConfirm = this.shouldConfirm();

                if(shouldConfirm) {
                    this.confirmDiscardingChanges((canClose) => {
                        this.canCloseDialog = canClose;
                        if (canClose) {
                            jQuery("#relationship-association-container").sdp_zcomponent_dialog("close"); //No I18N
                        } else {
                            jQuery("#relationship-association-container").focus(); //No I18N
                        }
                    });
                }

                //don't close association dialog if additional field or history dialog is visible
                if(jQuery("#admin_history-frame").is(":visible")) { //No I18N
                    if(jQuery("#fieldPopup").not(":visible")) { //No I18N
                        $previewComponent.closePreview('admin_history'); //No I18N
                    }
                    return false;
                }
                if(jQuery("#fieldPopup").is(":visible")) { //No I18N
                    return false;
                }

                return this.canCloseDialog || !shouldConfirm;
            },
            close: () => {
                jQuery("#relationship-association-container").remove(); //No I18N
                this.canCloseDialog = false;
            }
        };

        if(sdp_user.DIRECTION == "RTL") {
            options.position = {
                left: "0px", //No I18N
                top: "0px" //No I18N
            };
            options.resizable = {
                directions: "e" , //No I18N
                minWidth: 920
            };
            options.animation={
                open:{
                    className:'zeffects--slideleft', //No I18N
                    duration: 300
                },
                close: {
                    className: "zeffects--slideleft--reverse", //No I18N
                    duration: 300
                }
            }
        }

        jQuery("#relationship-association-container").sdp_zcomponent_dialog(options); //No I18N
        this.didRender();
    },
    confirmDiscardingChanges(callback) {
        this.confirm(translate("form.leave.alert"), callback);
    },
    confirm: function(message, callback) {
        showconfirm(true, `
            title=${translate("common.confirm")},  //No I18N
            message=${message},
            submitbutton=${translate("common.proceed")},  //No I18N
            cancelbutton=${translate("common.cancel")},  //No I18N
            closebutton=yes,
            closeOnEscKey=yes`,
            callback
        );
    },
    hasUnsavedChanges() {
        if(this.isChangeSaved) {
            return false;
        }

        if(!jQuery("#configuration-tab").parent("li").hasClass("active")) {
            return false;
        }

        const isSourceCriteriaChanged = this.isCriteriaChanged("source_criteria", this.data.source_criteria); //No I18N

        if(isSourceCriteriaChanged) {
            return true;
        }

        const isDestinationCriteriaChanged = this.isCriteriaChanged("destination_criteria", this.data.destination_criteria); //No I18N

        if(isDestinationCriteriaChanged) {
            return true;
        }

        let isChanged = false;
        const self = this;

        jQuery("#new_relationship_form").find("input[name]").toArray().some(function (element) { //NO I18N
            isChanged = element.value !== element.defaultValue;
            if(jQuery(element).data("select2")) { //No I18N
                isChanged = self.isFilterChanged(element.id);
            }
            return isChanged; // return if at least one element value has changed
        });

        return isChanged;
    },
    //check if filter field is changed by comparing with original value which is initialized on form load
    isFilterChanged(id) {
        const filter = jQuery("#" + id); //No I18N
        const data = filter.select2("data"); //No I18N
        const originalData = this.data[id];

        if(!data && !originalData) {
            return false;
        }

        if(jQuery.isPlainObject(originalData) || jQuery.isPlainObject(data)) {
            return data?.id !== originalData?.id;
        }

        if(!Array.isArray(data)) {
            return !data === !originalData;
        }

        if(data?.length === 0 && !originalData?.length) {
            return false;
        }

        if(data?.length !== originalData?.length) {
            return true;
        }

        for(let i = 0; i < data.length; i++) {
            if(data[i].id !== originalData[i].id) {
                return true;
            }
        }

        return false;
    },
    getCriteriaValues(id) {
        const filter = jQuery("#" + id); //No I18N
        const data = filter.data("plugin_custom_filter"); //No I18N

        if(!data) {
            return;
        }

        //don't show error message while checking criteria change to show confirmation dialog
        data.settings.showNoError = true;
        const condition = filter.custom_filter("getFilterData"); //No I18N
        data.settings.showNoError = false;

        return condition;
    },
    isCriteriaChanged(id, originalValue) {
        const container = jQuery("#" + id); //No I18N

        if(!container.is(":visible")) { //No I18N
            if(this.isEdit) {
                //return true, if criteria removed
                return originalValue ? originalValue.length > 0 : false;
            }

            return false;
        }

        //empty criteria, not changed in new association as there is no previous value
        if(!this.isEdit && !jQuery("#" + id).data("plugin_custom_filter")) { //No I18N
            return false;
        }

        const conditions = this.getCriteriaValues(id);

        if(this.isEdit) {
            if(Array.isArray(conditions)) {
                return sdpToJSON(conditions) !== sdpToJSON(originalValue);
            }

            //criteria is invalid when it is enabled but filled
            if(conditions === false) {
                return true;
            }
            return !conditions !== !originalValue;
        }

        if(typeof conditions === "object") { //No I18N
            if(Array.isArray(conditions)) {
                return true;
            }
            return false;
        }

        return typeof conditions === "boolean"; //No I18N
    },
    async setDestinationModule () {
        const canReset = await this.shouldResetAssociatedModule();

        const element = jQuery("#destination_module"); //No I18N
        let data;

        if(canReset) {
            element.select2("val", ""); //No I18N
            this.resetDestinationModuleDependents();
            this.autoPopulateApiNames();
        } else {
            data = element.select2("data"); //No I18N
        }

        this.renderDestinationModule(data);
        const destinationModule = jQuery("#destination_module"); //No I18N

        if (this.shouldFocusDestinationModule && !destinationModule.val()) {
            destinationModule.select2("focus"); //No I18N
        }
    },
    resetDestinationModuleDependents() {
        jQuery("#destination_filter").select2("val", ""); //No I18N
        jQuery("#destination_criteria").custom_filter("update", []); //No I18N
        this.toggleDestinationCriteria(false);
        jQuery("#destination_display_name").val("");
        this.setDestinationCriteria();
    },
    disableEditFields() {
        jQuery("#association_type").select2("enable", false); //No I18N
        jQuery("#destination_module").select2("enable", false); //No I18N
        jQuery("#source_api_name").prop("disabled", true); //No I18N
        jQuery("#destination_api_name").prop("disabled", true); //No I18N
        jQuery("#source_api_plural_name").prop("disabled", true); //No I18N
        jQuery("#destination_api_plural_name").prop("disabled", true); //No I18N
        jQuery("#cardinality").prop("disabled", true); //No I18N
    },
    renderDestinationModule(value) {
        const isInitialized = !jQuery.isEmptyObject(jQuery("#destination_module").data("select2")); //No I18N
        if(this.isEdit || !isInitialized) {
            jQuery("#destination_module").select2({ //No I18N
                data: [],
                placeholder: translate("sdp.change.sla.select") //No I18N
            });
            const data = this.data.destination_module;
            if(data) {
                data.text = data.display_name;
                jQuery("#destination_module").select2("data", data); //No I18N
            }
        } else {
            this.options.renderDestinationModule(value);
        }
    },
    setValidation() {
        const select2Msg = {
            required: translate("ae.config.depreciation.option.required") //No I18N
        }
        const rule = {
            required: true
        }
        const apiNameMsg = {
            required: translate("sdp.common.error.empty", [translate("admin.common.apiname")]), //No I18N
        }
        const apiPluralNameMsg = {
            required: translate("sdp.common.error.empty", [translate("custom.api_plural_name")]), //No I18N
        }
        const displayNameMsg = {
            required: translate("sdp.common.error.empty", [translate("custom.displayName")]), //No I18N
        }

        const apiNameRule = {
            required: true,
            apiName: true,
            uniqueApiName: true,
            endsWith: true,
            consecutiveUnderscore: true
        }

        const apiFields = this.apiFieldNames;

        jQuery.validator.addMethod("apiName", (value) => { //No I18N
            return /^[a-z0-9_]+$/.test(value);
        }, translate("api.name.msg")); //No I18N

        jQuery.validator.addMethod("endsWith", (value) => { //No I18N
            //ignore if destination module is not selected yet.
            return !jQuery("#destination_module").val() || /[a-z0-9]$/.test(value);
        }, translate("api.name.underscore.end.msg")); //No I18N

        jQuery.validator.addMethod("consecutiveUnderscore", (value) => { //No I18N
            //can not have consecutive underscore
            return !jQuery("#destination_module").val() || value.indexOf("__") === -1;
        }, translate("api.name.underscore.consecutive.msg")); //No I18N

        const getDuplicateApiName = (element) => {
            const currentField = jQuery(element);
            const fields = apiFields.filter((field) => currentField.prop("name") !== field) //No I18N

            return fields.find((field) => {
                return currentField.val() === jQuery(`[name="${field}"]`).val(); //No I18N
            });
        };

        //check if same api name is used in other api fields
        jQuery.validator.addMethod("uniqueApiName", (value, element) => { //No I18N
            return !jQuery("#destination_module").val() || getDuplicateApiName(element) === undefined;
        }, function (params, element) {
            const duplicateField = getDuplicateApiName(element);
            const getApiDisplayName = (name) => translate(name.replaceAll("_", ".")); //No I18N

            return translate("api.name.unique.msg", [getApiDisplayName(jQuery(element).prop("name")), getApiDisplayName(duplicateField)]); //No I18N
        });

        apiFields.forEach((field) => {
            jQuery(`[name="${field}"]`).on("keyup", function () { //No I18N
                //validate if api fields have the same value
                apiFields.filter((apiField) => apiField !== field).forEach((apiField) => {
                    const field = jQuery(`[name="${apiField}"]`); //No I18N
                    if(field.val() !== "") { //No I18N
                        field.valid();
                    }
                });
            });
        });

        initFormValidator("new_relationship_form", //No I18N
            {
                association_type: rule,
                destination_module: rule,
                destination_display_name: rule,
                source_display_name: rule,
                destination_api_name: apiNameRule,
                source_api_name: apiNameRule,
                destination_api_plural_name: apiNameRule,
                source_api_plural_name: apiNameRule
            },
            {
                association_type: select2Msg,
                destination_module: select2Msg,
                destination_display_name: displayNameMsg,
                source_display_name: displayNameMsg,
                destination_api_name: apiNameMsg,
                source_api_name: apiNameMsg,
                destination_api_plural_name: apiPluralNameMsg,
                source_api_plural_name: apiPluralNameMsg
            }
        );

        const destinationModuleFilter = jQuery("#destination_filter"); //No I18N

        destinationModuleFilter.on("select2-opening", (evt) => { //No I18N
            this.shouldFocusDestinationModule = true;

            if(!jQuery("#association_type").val()) { //No I18N
                this.destinationModuleCallback = () => {
                    setTimeout(() => {
                        destinationModuleFilter.select2("focus"); //No I18N
                    }, 100);
                }
            }
            return this.validateDependeeFields(["#association_type", "#destination_module"], evt); //No I18N
        });

        jQuery("#destination_module").on("select2-opening", (evt) => { //No I18N
            return this.validateDependeeFields(["#association_type"], evt); //No I18N
        });
    },
    validateDependeeFields(dependeeFields, evt) {
        const isValid = dependeeFields.every((field) => {
            const element = jQuery(field);
            if(element.length === 0) {
                return true;
            }
            const isValid = element.valid();
            if (!isValid) {
                setTimeout(() => {
                    element.select2("focus"); // Focus on element if not valid //No I18N
                    element.one("change", () => { //No I18N
                        this.shouldFocusDestinationModule = true;
                    });
                }, 100);
            }
            return isValid;
        });

        if (isValid) {
            return true; // Return true if all fields are valid
        }

        evt.preventDefault();
        return false;
    },
    setSourceFieldsValue() {
        this.setCardinalityValue(this.data?.cardinality || this.cardinalityDefaultValue);
        this.setSourceModuleFilterAllowedValues();
    },
    initCustomFilter(id, options) {
        sdpAjax({
            url: "/api/v3/" + options.entity + "/_metainfo", //No I18N
            data: sdpAjaxInputData(options.input_data),
        }).then((response) => {
            const metaInfo = response.metainfo.fields;
            const element = jQuery("#" + id); //No I18N

            options.metainfo = jQuery.extend(metaInfo, metaInfo.udf_field ? metaInfo.udf_field.fields : {});
            options.setNullSiteDef = true;
            element.custom_filter(options);
            if(Array.isArray(this.data[id])) {
                this.setCustomModuleValuesFormat(this.data[id]);
                element.custom_filter("update", this.data[id]); //No I18N
            }
            this.data[id] = this.getCriteriaValues(id) || this.data[id];
        });
    },
    setCustomModuleValuesFormat(data) {
        return data.forEach((criteria) => {
            if(criteria.values) {
                criteria.values = criteria.values.map((value) => {
                    if(value && typeof value === "object") {
                        return {
                            id: value.id,
                            name: value.display_name || value.name
                        }
                    }
                    return value;
                })
            }
        });
    },
    setCardinalityValue(cardinality) {
        jQuery("#cardinality").select2("val", cardinality); //No I18N
        this.setCardinalitySvg();
    },
    setCardinalitySvg() {
        const data = { ...jQuery("#cardinality").select2("data"), ... { label: this.label } }; //No I18N
        const html = renderhbs(null,'cardinality-svg', data, false,'admin',null,true,null,true); //No I18N

        jQuery("#cardinality-svg-info").prop("title", html); //No I18N
        setTimeout(() => initTooltip("#cmdb-relationships-popup")); //No I18N
    },
    getAssociatedFieldIds(callback) {
        return sdpAjax({
            url: "/api/v3/udf_fields", //No I18N
            data: sdpAjaxInputData({
                module:{ name: this.data.name },
                list_info: { row_count: 90 }
            })
        }).then(function (response) {
            callback(response.udf_fields.map((field) => field.id));
        });
    },
    renderAdditionalFieldList(module, options) {
        if(!this.options.includeAvailableFieldsTab) {
            delete options.actionName;
        }

        ResourceLoader({
            js: ["/scripts/additional-fields.js"], //No I18N
            success: () => {
                options.didRender = () => {
                    this.setAdditionalFieldsEvents();
                };

                $udfcommon.init(module, false, true, {
                    udfOptions: options
                });
            }
        });
    },
    getSelectedIds() {
        return jQuery(".selected-row").find("[value]").map((index, data) => data.value).toArray(); //No I18N
    },
    associateFields(availableFields, callback) {
        this.getAssociatedFieldIds((associatedFieldIds) => {
            const ids = [...availableFields, ...associatedFieldIds];

            //remove duplicate ids
            const fields = {};
            ids.forEach((id) => {
                fields[id] = true;
            });

            const associateIds = Object.keys(fields);

            this.updateAdditionalFields(associateIds).then(() => callback(associateIds));
        });
    },
    setAdditionalFieldsEvents() {
        jQuery("#associate-additional-fields").off("click").on("click", () => { //No I18N
            const ids = this.getSelectedIds();
            this.associateFields(ids, (associatedIds) => {
                $udfcommon.$udflview.table_compreq.t_obj.table_info.list_info.search_criteria.values = associatedIds;
                showalert("success", translate("sdp.checklist.associated"), "isAutoHide=true"); //No I18N
            });
        });
        jQuery("#dissociate-additional-fields").off("click").on("click", () => { //No I18N
            const message = translate("ae.cmdb.relationships.dissociate.confirm.msg"); //No I18N
            this.confirm(message, (canDissociate) => {
                if(canDissociate) {
                    this.dissociateAdditionalFields();
                }
            });
        });
    },
    dissociateAdditionalFields() {
        this.getAssociatedFieldIds((associatedFieldIds) => {
            const selectedIds = this.getSelectedIds().reduce((obj, id) => {
                obj[id] = true;
                return obj;
            }, {});

            const ids = associatedFieldIds.filter((id) => !selectedIds[id]);
            this.updateAdditionalFields(ids).then(() => {
                showalert("success", translate("sdp.checklist.dissociated"), "isAutoHide=true"); //No I18N
            });
        });
    },
    updateAdditionalFields(ids) {
        if(ids.length > 100) {
            showalert("warning", translate("relationship.max.fields.warn", [ids.length - 100]), "isAutoHide=true"); //No I18N
            return;
        }
        return sdpAjax({
            url: this.options.url + "/" + this.data.id, //No I18N
            type: "PUT", //No I18N
            data: sdpAjaxInputData({
                [this.options.entity]: { //No I18N
                    fields: ids.map((id) => { return { id } })
                }
            })
        }).then(() => {
            setTimeout(() => {
                this.refreshUdfList();
            }, 1);
        });
    },
    refreshUdfList() {
        $udfcommon.$udflview.table_compreq.refreshTable("refresh"); //No I18N
    },
    getTitle() {
        const title = this.isEdit ? "common.edit.label" : "common.new.label"; //No I18N
        return translate(title, [this.displayName]);
    },
    //render associated additional field list
    renderAssociatedFieldList() {
        this.tabId = "additional-fields-tab"; //No I18N
        this.showAssociatedList = true;

        this.renderAdditionalFieldList("associations", { //No I18N
            entity_id: this.data.name,
            hideDelete: true,
            add_name: "ci_type_association",//No I18N
            add_type: this.options.add_type,
            isAssociatedList: true,
            saveCallback: (response, method) => {
                if(method === "POST" && this.options.add_type) {
                    this.associateFields([response.udf_field.id]);
                } else {
                    this.refreshUdfList();
                }
            },
            callbackAfterInitialRender: () => {
                if(this.options.hideAssociatedListHistory) {
                    jQuery('[data-history="udf_fields"]').hide();
                }
            },
            addNewButtonId: "dissociate-additional-fields", //No I18N
            actionName: "sdp.common.dissociate" //No I18N
        });
    },
    //available field list to be associated with loaded source module.
    renderAvailableFieldList() {
        this.tabId = "available-fields-tab"; //No I18N
        this.showAssociatedList = false;

        this.getAssociatedFieldIds((associatedFieldIds) => {
            this.renderAdditionalFieldList("associations", { //No I18N
                entity_id: this.data.name,
                addNew: false,
                addNewButtonId: "associate-additional-fields", //No I18N
                actionName: "sdp.change.associate", //No I18N
                moduleName: "ci_type_association",//No I18N
                type: "category",//No I18N
                add_name: "ci_type_association",//No I18N
                add_type: this.options.add_type,
                personalize_key: "association_available_fields",//No I18N
                row_inputdata: {
                    category: { name: "ci_type_association" },//No I18N
                },
                default_search_criteria: {
                    field: "id",//No I18N
                    condition: "not in",//No I18N
                    values: associatedFieldIds
                }
            });
        });
    },
    save() {
        const id = this.data.id || ""; //No I18N
        const entity = this.options.entity;
        const isEdit = id ? true : false;

        if (!$("#new_relationship_form").valid()) { //No I18N
            return;
        }
        if(!this.hasUnsavedChanges()) {
            showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true"); //No I18N
            return;
        }

        let data = {};

        if (!isEdit) {
            data = {
                source_api_name: "assoc_" + jQuery("#source_api_name").val(), //No I18N
                destination_api_name: "assoc_" + jQuery("#destination_api_name").val(), //No I18N

                "cardinality": jQuery("#cardinality").val(), //No I18N
                "association_type": { //No I18N
                    "id": jQuery("#association_type").val() //No I18N
                },
                "source_module": { //No I18N
                    "id": this.data.source_module.id //No I18N
                },
                "destination_module": { //No I18N
                    "id": jQuery("#destination_module").val() //No I18N
                },
                "is_inverse": jQuery("#association_type").select2("data").is_inverse, //No I18N
                "category": { //No I18N
                    "name": this.options.category || "association" //No I18N
                },
                "source_api_plural_name": "assoc_" + jQuery("#source_api_plural_name").val(), //No I18N
                "destination_api_plural_name": "assoc_" + jQuery("#destination_api_plural_name").val() //No I18N
            }
        }

        const sourceFilter = jQuery("#source_filter").select2("data"); //No I18N
        const destinationFilter = jQuery("#destination_filter").select2("data"); //No I18N

        const formatCriteria = (criteria) => {
            if(!criteria) {
                return criteria;
            }
            criteria = cloneJson(criteria); //cloning it to avoid modifying original data and check if criteria is changed
            return criteria.map((condition) => {
                if(condition.values) {
                    condition.values = condition.values.map((value) => value?.id || value)
                }

                return condition;
            });
        }

        const mapFilterFields = (filter) => {
            return filter.map((field) => {
                return {
                    name: field.name,
                    display_name: field.display_name
                }
            });
        }
        data.source_display_name = jQuery("#source_display_name").val(); //No I18N
        data.destination_display_name = jQuery("#destination_display_name").val(); //No I18N

        data.source_filter = mapFilterFields(sourceFilter);
        data.destination_filter = mapFilterFields(destinationFilter);

        const source_criteria = jQuery("#source_criteria_checkbox").is(":checked") ? jQuery("#source_criteria").custom_filter("getFilterData") : null; //No I18N
        const destination_criteria = jQuery("#destination_criteria_checkbox").is(":checked") ? jQuery("#destination_criteria").custom_filter("getFilterData") : null; //No I18N

        data.source_criteria = formatCriteria(source_criteria);
        data.destination_criteria = formatCriteria(destination_criteria);

        //don't save, if criteria is not valid
        if(data.source_criteria === false || data.destination_criteria === false) {
            return;
        }

        sdpAjax({
            url: this.options.url + "/" + (id || ""), //No I18N
            type: isEdit ? "put" : "post", //No I18N
            data: sdpAjaxInputData({
                [entity]: data
            }),
            success: (response) => {
                showalert("success", translate("sdp.admin.backup.settings.save.success.msg"), "isAutoHide=true"); //No I18N
                this.data = response[entity];
                this.isEdit = true;

                this.data.source_criteria = source_criteria;
                this.data.destination_criteria = destination_criteria;

                this.setFilterData();
                this.resetFilterFields();

                this.options.refreshList?.(response, isEdit);

                this.updateDefaultValue();
                this.isChangeSaved = true;
                this.disableEditFields();

                jQuery("#relationship-association-container").find("[role=heading]").text(this.getTitle()); //No I18N
                this.redirectToAdditionalFieldTab();
            },
            ignorefailuremessage: true,
            error: (response) => {
                const error = response?.responseJSON?.response_status?.messages[0];

                if(!error) {
                    showalert("failure", sdtranslate("sdp.api.unknown.error"), "isAutoHide=true"); //No I18N
                    return;
                }

                const field = $association.label[error.field];
                const message = error.message;
                const element = jQuery("#" + error.field);

                showalert("failure", message + (field ? " - " + field : ""), "isAutoHide=true"); //No I18N

                if(element.data("select2")) {
                    element.select2("focus"); //No I18N
                } else {
                    element.focus();
                }
            },
            beforeSend: () => {
                jQuery("#save-btn").button("loading"); //No I18N
            },
            complete: () => {
                jQuery("#save-btn").button("reset"); //No I18N
            }
        });
    },
    redirectToAdditionalFieldTab() {
        const additionalFieldsTab = jQuery("#additional-fields-tab"); //No I18N
        additionalFieldsTab.trigger("click"); //No I18N
        additionalFieldsTab.focus(); //to close dialog on esc key press
        additionalFieldsTab.removeClass("disableDiv"); //No I18N
        jQuery("#available-fields-tab").removeClass("disableDiv"); //No I18N
    },
    //set saved fields value as the default value to check form changes
    updateDefaultValue() {
        jQuery("#new_relationship_form").find("input[name]").each(function () { //NO I18N
            this.defaultValue = jQuery(this).val();
        });
    },
    cancel() {
        const container = jQuery("#relationship-association-container");
        if(container.length) {
            container.sdp_zcomponent_dialog("close");//No I18N
        }
    }
}
