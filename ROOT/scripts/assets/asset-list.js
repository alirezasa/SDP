"use strict";//NO I18N
var assetListView = {
    tableObject: {},
    defaultColumns: {
        "asset_assets" : ["name", "module", "product", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor", "loan_end"], //NO I18N
        "asset_computers" : ["name", "module", "product", "vm_host", "os_name", "primary_ip", "service_tag", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor", "loan_end"], //NO I18N
        "asset_mobile_devices" : ["name", "module", "product", "mobile_os_type", "os_version", "imei","primary_ip", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor", "loan_end"], //NO I18N
        "asset_printers": ["name", "module", "product", "printer_serial_number", "primary_ip", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor", "loan_end"], //NO I18N
        "asset_routers": ["name", "module", "product", "os_type", "firmware_revision", "primary_ip", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor", "loan_end"], //NO I18N
    },
    /**
         * execute this function for rendering using search criteria in dashboard, summary page
         * @param {*} value
         * @param {*} additional_criteria
         * @returns
    */
    getsearchCriteria: function (value, additional_criteria) {
        const self = this;
        let searchCriteria = null;
        if(assetsObj.criteriafor !== "allworkstations"){
            
        switch (value) {
        case "asset_connections"://NO I18N
                if (self.from === "purchase" || self.from === "release" || self.from === "change" || self.from === "request_maintenance" || self.from === "request" || self.from === "view_user_assets") break;
                const data = window.top.assetDetailView.data;
                searchCriteria = {
                     "field": "id",//NO I18N
                     "condition": "is_not",//NO I18N
                     "value": data.asset_id || data.id //NO I18N
                }
                break;
        case "asset_attachments"://NO I18N
            if (self.from === "purchase" || self.from === "release" ||self.from === "change" || self.from === "request_maintenance" || self.from === "request" || self.from === "view_user_assets" || self.from === "problem" || self.from === "contracts") break;

            if(self.from === "user") {
                const result = window.top.getUrlParameterByName("userId");// No I18N
                if(assetActions.attachment.isAttached){
                    searchCriteria = {
                        "field": "user",//NO I18N
                        "condition": "is",//NO I18N
                        "values": [{"id":result}]//NO I18N
                    }
                }
                else{
                    searchCriteria=null;
                }

            } else {
                const data = window.top.assetDetailView.data;
                searchCriteria = {
                    "field": "id",//NO I18N
                    "condition": "is_not",//NO I18N
                    "value": data.asset_id || data.id //NO I18N
                }
            }
        break;

        case "product_type": //NO I18N
        case "assets": //NO I18N
            if(assetsObj.type_id){
                searchCriteria = {
                    "field": "module.id", //NO I18N
                    "condition": "is", //NO I18N
                    "value": assetsObj.type_id //NO I18N
                }
            }
            break;
        }
        }
        if(additional_criteria){
            if(additional_criteria.constructor !== Array){
                additional_criteria = [additional_criteria];
            }
        }else{
            additional_criteria = [];
        }
		if(self.from=="view_user_assets"&&((window.top.assetsObj.custom_options&&window.top.assetsObj.custom_options.user_id) || window.top.assetsObj.userId)){
			additional_criteria.push({"field": "user.id", "condition": "is", "value": window.top.assetsObj.userId || window.top.assetsObj.custom_options.user_id,"logical_operator":"AND"}); //NO I18N
		}
        /* execute in summary page */
        if(assetsObj.criteriafor == "inventoried"){ //NO I18N
            const criteria = {field:"last_scan_success_time",condition:"is not",value: null, logical_operator : "AND"};//NO I18N
            searchCriteria = ""; //NO I18N
            additional_criteria.push(criteria);
        }else if(assetsObj.criteriafor == "unassigned"){ //NO I18N
            const criteria = [
                {field:"user",condition:"is",values:[null], logical_operator : "AND"},//NO I18N
                {field:"state.name",condition:"notlike",value:"Expired" , logical_operator : "AND"},{"field":"department","condition":"is","value":null,"logical_operator":"and"},{"field":"used_by_asset","condition":"is","value":null,"logical_operator":"and"}//NO I18N
            ]
            additional_criteria = additional_criteria.concat(criteria);
        }else if(assetsObj.criteriafor == "instore" || assetsObj.criteriafor == "inuse" || assetsObj.criteriafor == "inrepair"){ //NO I18N
            const diffValueForCriteria = (assetsObj.criteriafor == "instore") ? "1" : ((assetsObj.criteriafor == "inuse") ? "2" : "3");//NO I18N
            const criteria = {field:"state.id",condition:"is",values:[diffValueForCriteria], logical_operator : "AND"};//NO I18N
            additional_criteria.push(criteria);
        }
        if(assetsObj.input_data && assetsObj.input_data.list_info.search_criteria){
            if(searchCriteria){
                if(assetsObj.input_data.list_info.search_criteria.children){
                    const tempCriteria = jQuery.extend(true, {}, assetsObj.input_data.list_info.search_criteria);
                    additional_criteria.concat(tempCriteria.children);
                    delete tempCriteria.children;
                    additional_criteria.push(tempCriteria);
                }else{
                    additional_criteria.push(assetsObj.input_data.list_info.search_criteria);
                }
            }else{
                searchCriteria = jQuery.extend(true, {}, assetsObj.input_data.list_info.search_criteria);
            }
        }
        if(additional_criteria){
            /** for concat all additional criteria as children inside seaerchCriteria if searchCriteria is available */
            if(searchCriteria){
                if(additional_criteria.length > 0){
                    if(searchCriteria.children){
                        searchCriteria.children = searchCriteria.children.concat(additional_criteria);
                    }else{
                        searchCriteria.children = additional_criteria;
                    }
                }
            }else{
                /** for concat all additional criteria as children except first criteria */
                if(additional_criteria.length > 0){
                    searchCriteria = additional_criteria[0];
                    if(additional_criteria.length > 1){
                        if(searchCriteria){
                            additional_criteria.splice(0, 1);
                            searchCriteria.children = additional_criteria;
                        }else{
                            searchCriteria = additional_criteria;
                        }
                    }
                }
            }
        }
        return searchCriteria;
    },
    /**
         * execute this function for concat all additional criteria as children except first criteria
         * @param {*} module
         * @param {*} moduleType
         * @param {*} from
         * @returns 
    */
    getOptions: function (module, moduleType, from) {
        const self = this;
        let options = {
            discarded_fields: []
        };
        options.multiDeleteEnabled = !self.externalframe;
        if(options.multiDeleteEnabled && self.from === "dashboard"){
            options.multiDeleteEnabled = false;
        }
        if(module === "asset_attachments" || module === "asset_connections" || module === "component_attachments") {//NO I18N
            const actionOptions = assetActions.options;
            const isAttached = (from === "print") || assetActions.attachment.isAttached;//NO I18N
            let url;
            switch(self.from){
                case "release"://NO I18N
                    if(window.top.assetsObj.associateForField == "configuration_items"){//NO I18N
                        options.entity_name = "configuration_items";//NO I18N
                        url = "releases/configuration_items";//NO I18N
                    }else{
                        options.entity_name = "assets";//NO I18N
                        url = "releases/assets";//NO I18N
                    }
                    break;
                case "change"://NO I18N
                    options.entity_name = "assets";//NO I18N
                    url = "changes/assets";//NO I18N
                    break;
                case "request_maintenance"://NO I18N
                    options.entity_name = "assets";//NO I18N
                    url = "request_maintenances/assets";//NO I18N
                    break;
                case "request"://NO I18N
                    options.entity_name = "assets";//NO I18N
                    url = "requests/assets";//NO I18N
                    break;
                case "view_user_assets"://NO I18N
                case "contracts"://NO I18N
                    options.entity_name = "asset_assets";//NO I18N
				    url = "asset_assets";//NO I18N
                    break;
                case "purchase"://NO I18N
                    const poID = window.top.assetActions.options.purchase_order_id;  
                    options.entity_name="assets";// No I18N
                    url = `purchase_orders/${poID}/assets`
                    break;
                case "problem"://NO I18N
                    options.entity_name = "associated_asset";//NO I18N
                    url = "problems/associated_asset";//NO I18N
                    break;
                default:
                    url = (from === "print" ? ("asset_assets/"+assetDetailView.asset_id) : actionOptions.moduleURL) + "/" + encodeHTMLAttribute(module) + (isAttached ? "/parent_asset" : "/child_asset");//NO I18N
                    options.entity_name = (from === "print" ? "parent_asset" : (isAttached ? module : "child_asset")); //NO I18N
                    break;
            }
            options.support_old_get_total_count = true;
            options.advSrchFiltEnabled = false;
            options.metainfo_entity = url;
            options.multiDeleteEnabled = false;
            options.callbackURL = url;
            options.skipSUBREQUEST = true;
            options.column_order = ["name", "module", "product", "primary_ip", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor"];// No I18N
        }  else {
            const actionOptions = assetActions.options;
            const moduleList = ["attached_assets", "connected_assets", "attached_components"];//NO I18N
            if(moduleList.includes(module)){
                options.support_old_get_total_count = true;
                const basePath = {
                    "attached_assets": "/asset_attachments/parent_asset",//NO I18N
                    "connected_assets": "/asset_connections/parent_asset",//NO I18N
                    "attached_components": "/component_attachments/parent_asset"//NO I18N
                };
                options.advSrchFiltEnabled = false;
                options.callbackURL = options.metainfo_entity = actionOptions.moduleURL + basePath[module];
                options.entity_name = "parent_asset"; //NO I18N
                options.column_order = ["name", "module", "product", "primary_ip", "state", "barcode", "user", "department", "used_by_asset", "site", "purchase_cost", "vendor"]; // No I18N
            }
            else {
                options.callbackURL = options.entity_name = module;
            }
        }

        if(from === "purchase") {//NO I18N
            options.callbackURL = `purchase_orders/${assetsObj.entity_id}/assets`;
            options.entity_name = "assets";//No I18N
            options.advSrchFiltEnabled = false;
            options.metainfo_entity = "purchase_orders/assets"; //No I18N
        }

        const templateId = assetsObj.type_id;
        const typeId = assetsObj.ciTypeId || templateId || "";
            if(!self.searchText && templateId){
                assetsObj.product_type_id = templateId;
                options.metaInfo_input = { };
            }
            if(self.searchText){
                options.advSrchFiltEnabled = false;
            }

        options.personalize_key = self.getPersonalizeKey(module, typeId, moduleType, from); 
        options.discarded_fields.push("space");
        return options;
    },
    /**
         * execute this function for personalize listview
         * @param {*} module
         * @param {*} from
         * @returns 
    */
    getPersonalizeKey: function (module, typeId, moduleType, from) {
        const moduleTab = module;

        if (["purchase","release","request_maintenance","request","problem","change"].indexOf(from) !== -1) {
            from = "association";//NO I18N
        }

        function getKey(key) { return key ? "-" + key : ""; }//to distinct with user_id which is replaced in CLIENT_CONF server side.
       
        /**Change for personalization issue */
        return moduleTab + getKey("list") + getKey(module) + getKey(from);// No I18N
    },
    /** Display Loading symbol  */
    showLoading: function() {
        jQuery("#Right-Section").find("#assets_common_loading").show();
    },
    /** Hiding Loading symbol  */
    hideLoading: function () {
        jQuery("#Right-Section").find("#assets_common_loading").hide().css({"top":"120px"});// No I18N
    },
    /**
         * execute this function for getting additional data as options to render listview
         * @param {object} options
         * @param {string} module
         * @param {string} from
         * @returns 
    */
    getTemplateInputData: function(options, module, moduleType, from) {
        const self = this;
        let data = {
            module: module,
            enable_normal_filter: true,
            enable_new: true,
            enable_action_menu: true,
            from: from
        };
        
        let permissions = self.links_data.permissions || {};
        const isExternalFrame = self.externalframe,
              externalFramePermissions = isExternalFrame ? permissions : {};

        permissions = isExternalFrame ? {} : permissions; //disable all permission for external frame.

        data.enable_action_menu = !self.externalframe;
        data.enable_normal_filter = !self.externalframe;
        data.enable_new = !self.externalframe;
        data.links_scan = !self.externalframe && permissions.links_scan;
        data.generate_barcodes = permissions.generate_barcodes;
        data.enable_edit = permissions.edit;

        if(data.enable_new){
            data.enable_new = self.links_data.permissions && self.links_data.permissions.enable_new;
        }
        
        const getmodDetOnly = assetsObj.assetModTemplateData.metaDataWithoutId[module];
        
        if (sdp_app.IS_REMOTE_SERVER && (getmodDetOnly && assetsObj.isComputerHierarchy(getmodDetOnly.hierarchy))) {
            data.enable_new = false;
        }

        if (module === "asset_computers" || (getmodDetOnly && assetsObj.isComputerHierarchy(getmodDetOnly.hierarchy))) {
            data.isComputerHierarchy = true;
        } else {
            data.isComputerHierarchy = false;
        }
        if (module === "asset_workstations" || (getmodDetOnly && assetsObj.isWorkstationHierarchy(getmodDetOnly.hierarchy))) {
                    data.isWorkstationHierarchy = true;
                } else {
                    data.isWorkstationHierarchy = false;
                }
        if(module === "component_attachments" || module === "asset_attachments" || module === "asset_connections") {
            data.enable_new = false;
            data.enable_action_menu = false;
            data.enable_normal_filter = true;
        } else if(module === "attached_assets" || module === "attached_components" || module === "connected_assets") {//NO I18N
            data.enable_new = false;
            data.enable_action_menu = false;
            data.enable_normal_filter = false;
        } else {
            data.enable_header_menu = true;
        }

        if(from=="space"){
            data.enable_normal_filter = true;
        }
        
        if(self.enableFilter) {
            data.enable_normal_filter = true;
        }
        data.api_name = getmodDetOnly && getmodDetOnly.module_details.api_name;
        data.display_type = !self.externalframe ? getmodDetOnly && getmodDetOnly.module_details && getmodDetOnly.module_details.display_plural_name : "";//NO I18N
        if(self.searchText){
            data.is_globalsearch = true;
        }
        if(data.api_name && data.api_name === "asset_computer" && !data.is_globalsearch && from !== "dashboard") {
            var listInfoObj = sdp_user.CLIENT_CONF["asset_computers-list-asset_computers"] && sdp_user.CLIENT_CONF["asset_computers-list-asset_computers"].list_info; // No I18N
            if(listInfoObj && !listInfoObj.filter_by) {
                listInfoObj = sdp_user.CLIENT_CONF.asset_computers_list_view_filter && sdp_user.CLIENT_CONF.asset_computers_list_view_filter.list_info;
            }
            var filterByObj = listInfoObj && listInfoObj.filter_by;
            if(filterByObj) {
                data.display_type = filterByObj.name;
            }
        }

        /** set permissions for externalframe(popup). */
        if(!jQuery.isEmptyObject(externalFramePermissions)) {
            data.multiDeleteEnabled = externalFramePermissions.multiDeleteEnabled;
        }
        if(from === "dashboard"){
            data.multiDeleteEnabled = false;
        }
        /** get entity name for import url */
        if(getmodDetOnly && getmodDetOnly.module_details) {
            data.entity = getmodDetOnly.module_details.name;
        }

        return jQuery.extend(true, options, data);
    },
    /**
         * Initiate table component listview for asset
         * @param {string} moduleType
         * @param {string} module
         * @param {string} from
         * @param {boolean} externalframe
         * @param {boolean} searchText
    */
    initListView: function (module, moduleType, from, externalframe, searchText) {
        const self = this;
        self.module = module;
        self.moduleType = moduleType;
        self.input_data = assetsObj.input_data;
        self.externalframe = externalframe || false;
        self.from = from;
        self.searchText = typeof searchText === "string" ? searchText.trim() : searchText;// No I18N

        const moduleURL = module;
            /** enable permissions for externalframe in dashboard */
            if ((externalframe && from !== "dashboard") || from == "print") {
                self.links_data = { permissions: {} };
                self.loadListView(module, moduleType, from);
            } else {
                const _links = assetsObj.assetModTemplateData.metaDataWithoutId[module]._links;
                jQuery.when(
                    assetsObj.getProductTypeDisplayName(module).then(function (name) {
                        self.productTypeName = name;
                    }),
                    assetsObj.getAllowedActions(
                        module,
                        moduleURL,
                        "",
                        true,
                        assetsObj.type_id,
                        null,
                        _links

                    ).then(function(data) {
                        self.links_data = data;
                    })
                ).then(function() {
                    self.loadListView.call(self, module, moduleType, from);
                });
            }
    },
    /**
         * execute this function to get column order for asset listview
         * @param {string} module
         * @returns
    */
    getColumnOrder: function (module) {
        const self = this,
              getMetaData = assetsObj.assetModTemplateData.metaDataWithoutId[module],
              getParentAssets = getMetaData && self.getParentPath(getMetaData.hierarchy);
        let column_order = self.defaultColumns[module],index=0;
        while(!column_order && getMetaData) {
            const key = self.getPersonalizeKey(getParentAssets[index]);
            column_order = getPersonalizeData(key).column_order;
            column_order = column_order && !Array.isArray(column_order) ? JSON.parse(column_order) : column_order;
            if(!column_order) {
                column_order = self.defaultColumns[getParentAssets[index]];
                if(getParentAssets[index]==="asset_assets" && assetsObj.isITAsset(getMetaData.module_details)){
                    column_order.splice(3,0,"primary_ip"); // No I18N
                }
            }
            index++;
        }
        return column_order
    },
    /**
         * get parent metadata for asset listview
         * @param {object} module_data
         * @returns
    */
    getParentPath : function (module_data){
        let getParentAssets = [];
        let getParent = (data) => {
            if(data){
                if(data.child){
                    getParentAssets.push(data.api_plural_name);
                    getParent(data.child)
                }else{
                    getParentAssets.push(data.api_plural_name);
                }
            }
        }
        getParent(module_data);
        getParentAssets.reverse();
        return getParentAssets;
    },
    /**
         * execute this function to load asset listview
         * @param {string} module
         * @param {string} moduleType
         * @param {string} from
         * @returns
    */
    loadListView: function (module, moduleType, from) {
        const self = this;
        const getmodDetOnly = assetsObj.assetModTemplateData.metaDataWithoutId[module];
        if (module === "asset_attachments" || module === "asset_connections" || module === "component_attachments" || module === "attached_assets" || module === "attached_components" || module === "connected_assets") {
            const parentAssetActions = (window.top.assetActions) ? window.top.assetActions : window.assetActions;
            window.assetActions.options = parentAssetActions.options;
            window.assetActions.attachment = parentAssetActions.attachment;
        }
        
        let metaInfo = {};
        if(getmodDetOnly){
            metaInfo = jQuery.extend(true, {}, getmodDetOnly.metainfo);
        }
        if (!getmodDetOnly && from == null){
            const moduleList = [ "asset_attachments", "asset_connections", "component_attachments", "attached_assets", "attached_components", "connected_assets" ]; //NO I18N
            if(moduleList.includes(module)){
                assetsObj.assetModTemplateData.metaDataWithoutId["asset_assets"]=assetsObj.getAssetMetaData("asset_assets");  // No I18N
                metaInfo = jQuery.extend(true, {}, assetsObj.assetModTemplateData.metaDataWithoutId["asset_assets"].metainfo);
            }else{
                assetsObj.assetModTemplateData.metaDataWithoutId[module]=assetsObj.getAssetMetaData(module);
                metaInfo = jQuery.extend(true, {}, assetsObj.assetModTemplateData.metaDataWithoutId[module].metainfo);
            }
        }

        const keys = Object.keys(metaInfo.fields);
        self.skipFieldTypeConditions = [];
        keys.forEach(function(key){
            if(metaInfo.fields[key].fields && ((metaInfo.fields[key].fields.name && !metaInfo.fields[key].fields.name.mandatory) || (!metaInfo.fields[key].fields.name))){
                self.skipFieldTypeConditions.push(key);
            }
            if(metaInfo.fields[key].for_list_view === false){
                delete metaInfo.fields[key];
            }
        });


        const listOptions = self.getOptions(module, moduleType, from);

        self.ignoreSubFields = ["department","site","state","used_by_asset","user","vendor","created_by","last_operation_data_source_info","last_operation_status","last_operation_status_code","last_operation_triggered_by","last_scan_status","last_scan_status_code","last_scan_datasource_info","last_scan_triggered_by","last_scan_success_datasource_info","last_scan_success_triggered_by","modified_by","purchase_order","space","chassis_type","assigned_to","product_type","domain","mobile_os_type","vm_platform","vm_host","storage_device_type","linked_entity","linked_instance","device_type","region"]; //NO I18N

        let tableInfo = listOptions.personalize_key ? getPersonalizeData(listOptions.personalize_key) : {};

        if(jQuery.isEmptyObject(tableInfo)){
            let fields_required = {};
            const columnOrder = listOptions.column_order ? listOptions.column_order : self.getColumnOrder(module);
            tableInfo.column_order = columnOrder;

            columnOrder && columnOrder.forEach(function(field) {
                fields_required[field] = {};
            });

            const list_info =  { "sort_field": "name", "sort_order": "asc", "row_count": "25"};  // No I18N
                tableInfo.fields_required = fields_required;
                tableInfo.list_info = list_info;
        }else{
            if(tableInfo.column_order){
                tableInfo.column_order = !Array.isArray(tableInfo.column_order) ? JSON.parse(tableInfo.column_order) : tableInfo.column_order;
            }
        }
        
        if(assetsObj.criteriafor && assetsObj.criteriafor!=""){
            tableInfo.list_info.search_criteria = self.getsearchCriteria();
        }else if(assetsObj.filter_criteria_data && assetsObj.filter_value && assetsObj.filter_value.length>0){
            tableInfo.list_info.search_criteria = assetsObj.filter_criteria_data;
        }
        if (self.searchText) {
            tableInfo.list_info.gsearch = self.searchText;
            tableInfo.list_info.get_total_count = true;
        }

        let table_content = {},
            discardedFields = listOptions.discarded_fields || [], 
            options = {
            callbackURL                 : listOptions.callbackURL, 
            entity_name                 : listOptions.entity_name, 
            paginationEnabled           : true,
            searchEnabled               : true,
            sortingEnabled              : true,
            multiDeleteEnabled          : true,
            refreshEnabled              : true,
            columnChooserEnabled        : true,
            getmetaInfo                 : true,
            staticHeader                : !((module === "asset_attachments" || module === "asset_connections" || module === "component_attachments" || module === "attached_assets" || module === "attached_components" || module === "connected_assets") && from == "print"), //NO I18N
            callbackRowfunction         : self.rowDataConstruct,
            row_inputdata               : self.rowDataConstruct(tableInfo, {}),
            personalize_key             : listOptions.personalize_key, 
            discard_without_displayname : true,
            discarded_fields            : discardedFields,
            isFR_ListInfo_Support       : true,
            width                       : jQuery(window).width() - (self.externalframe ? 40 : (jQuery("#left-panel-section").outerWidth() - 60)), 
            callbackAfterBodyRender     : self.callbackTableRender,
            advSrchFiltEnabled          : listOptions.advSrchFiltEnabled || true,
            advFilterSettings : {
                options : {
                    metaInfo_input : jQuery.extend({}, listOptions.metaInfo_input || {}, {"for":"advanced_filter" }),//NO I18N
                    metainfo_entity : listOptions.metainfo_entity || listOptions.entity_name,
                    metaOverride : {
                        "udf_fields": {"display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields")},//No i18n
                        "product" : assetsObj.product_type_id ? {//No i18n
                            "list_info" : {//No i18n
                                "search_criteria": [{"field": "product_type.id", "condition": "is", "value": assetsObj.product_type_id}]//NO I18N
                            }
                        } : {},
                        total_cost : {
                            display_type : "currency"//No i18n
                        },
                        purchase_cost : {
                            display_type : "currency"//No i18n
                        }
                    },
                    allowReadOnly : true,
                    haveOtherUDF : true,
                    skipdiscarded_fields : ["contracts", "device_type", "sys_location", "loan_start","loan_end", "agent_version","used_by_asset"],//NO I18N
                    skipFieldTypeConditions: { },
                    ignoreSubFields : self.ignoreSubFields,
                    popupPosition: "center" //NO I18N
                }
            },
            tableHolder                 : "assets_list", //NO I18N
            bulkSelectionSetting : {
                enabled: true,
                constructSelectedListCB : self.constructSelectedListCB,
                unSelectionCallback: function (elm) {
                    self.toggleCheckbox(elm);
                },
                selectionCallback: function (elm) {
                    self.toggleCheckbox(elm);
                },
                selectedRecords: self.getDefaultSelectedRecords(),
                selectionLimit: (from === "purchase" || from === "release" || from === "change") ? -1 : ((from === "request" || from === "request_maintenance" ? window.top.maxCICount :  100))//NO I18N
            },
            isODAPI : true,
            callbackAfterInitialRender : this.callbackAfterInitialRender,
            callbackSearchFunction : this.callbackSearchFunction,
            support_search_criteria:true,
            default_sort_field: { "sort_field": "name", "sort_order": "asc" }, //No I18N
            meta_data: metaInfo,
            max_allowed_fields: 50
        };

        self.skipFieldTypeConditions.forEach(function(key){
            options.advFilterSettings.options.skipFieldTypeConditions[key] = ["is", "is_not"];
        });
        const bulkSelectDisabled = !self.links_data.permissions.multiDeleteEnabled && self.links_data.actionBtnLinks && self.links_data.actionBtnLinks.length == 0;
        if(bulkSelectDisabled){
            options.bulkSelectionSetting=false;
        }

		if(from=="view_user_assets"){
			options.bulkSelectionSetting=false;
		}

        if(jQuery.isEmptyObject(metaInfo)) {
            delete options.meta_data;
            const url = options.callbackURL+"/_metainfo"; //NO I18N
            sdpAjax({
                url: "/api/v3/"+url,// No I18N
                success: function (response) {
                    metaInfo = response.metainfo;
                    const metakeys = Object.keys(metaInfo.fields);
                    metakeys.forEach(function(key){
                        if(metaInfo.fields[key].for_list_view === false){
                            delete metaInfo.fields[key];
                        }
                    });
                    options.meta_data = metaInfo;
                },
                async: false,
                ignorefailuremessage:true
            });
        }

        options.cancelFilterTable = options.applyFilterTable = function (search_criteria) {
            let disableNormalFilter = (disable) => {
                const button = jQuery("#asset-list-view").find('#nr_filtr'); //No I18N
                if(button) {
                    if(search_criteria){
                        button.attr("disabled",true);
                    }else if(!search_criteria || typeof search_criteria=='undefined'){//No I18N
                        button.attr("disabled",false);
                    }
                }
            }
            if(search_criteria){
                disableNormalFilter(true);
            }else{
                disableNormalFilter(false);
            }
            self.filter_criteria = null; //Resetting the select2 filter criteria available in listview
            assetFilter.cancelSearch('clearfilter');//NO I18N
            let searchCriteriaLoc = self.getsearchCriteria(assetsObj.moduleType, search_criteria);
            
            if((getmodDetOnly && getmodDetOnly.module_details && getmodDetOnly.module_details.internal_name==="asset_computer") || assetsObj.isComputerHierarchy(getmodDetOnly.hierarchy)){
                searchCriteriaLoc = self.convertToBits(searchCriteriaLoc);
            }
            let getAssetTableListInfo = self.tableObject.t_obj.table_info.list_info;
            if(searchCriteriaLoc){
                self.tableObject.advancedfilter_criteria = searchCriteriaLoc;
                getAssetTableListInfo.search_criteria = searchCriteriaLoc;
            }else{
                self.tableObject.advancedfilter_criteria = {};
                delete getAssetTableListInfo.search_criteria;
            }
            self.tableObject.t_obj.options.row_inputdata.fields_required = self.processFieldsRequired(searchCriteriaLoc, getAssetTableListInfo.fields_required, !!search_criteria);
            self.tableObject.refreshTable("refresh");//NO I18N
        };
        
        if(from == "left_panel"){ // No I18N
            options.advSrchFiltEnabled = false;
            options.view = "kanban"; // No I18N
            options.lazyloadingEnabled = true; 
            options.column_settings = {
                "default_position": 2,//No I18N
                "assign_label_width": false,//No I18N
                "assign_content_width":false,//No I18N
                "columns": [{//No I18N
                    "size": 1,//No I18N
                    width : "31px"//No I18N
                },{
                    "size": 11,//No I18N
                    "pipe_separation": true, //No I18N
                    "row_count": 2, //No I18N
                    "default_rowposition": 2//No I18N
                }]
            };
            
            options.width = "190px"; // No I18N
            options.tableHolder = "leftpanel_container"; // No I18N
            options.selectedId = typeof assetDetailView != "undefined" && assetDetailView.id; // No I18N
            options.newtab_settings = {enabled : true, link_string : "/ui/asset?entity_id=${id}&module=${module.api_plural_name}&tab=assetinfo&mode=get"}; // No I18N
            options.height = jQuery(window).height() - 300;
        }else if(assetsObj.isPopup){
            options.width = jQuery(window).width() - 20;
            options.height = jQuery(window).height() - (from === "purchase" ? 120 : 165);
        }else{
            if(assetListView.externalframe){
                options.width = jQuery(window).width() - 20;
                options.height = jQuery(window).height() - 120;
            }else{
                let paddingVal = jQuery("body").css("padding-left"); // No I18N
                if(jQuery( 'body' ).css( 'direction' ) == 'rtl') {
                    paddingVal = jQuery("body").css("padding-right"); // No I18N
                }
                const leftBarWidth = jQuery('#asset_left_nav_container').width(),
                listViewWidth = parseInt(paddingVal) + leftBarWidth + 20;
               
                options.width = jQuery(window).width() - listViewWidth;
                var paddingBottom = window.externalframe ? 0 : 20;
                var filterVal = jQuery("#nr_filtr").hasClass("btn-info") ? 46 : 0; //No I18N
                var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
                var adjustVal = sdp_app.IS_AE ? 110 : 0;
                options.height = jQuery(window).height() - jQuery('#header-placeholder').height() - paddingBottom - chatbar_height - filterVal + 60 - adjustVal;
            }
        }
        table_content.header = self.headerDataConstruct(from,module);
        options = jQuery.extend(true, options, listOptions);
        const isAttachAsset = module === "asset_connections" || module === "asset_attachments" || module === "component_attachments" || module === "attached_assets" || module === "attached_components" || module === "connected_assets";// No I18N
        if(from != "left_panel"){
            const templateData = self.templateData = self.getTemplateInputData(options, module, moduleType, from);
            if(assetListView.from=="release" || assetListView.from=="request_maintenance" || assetListView.from=="request" || assetListView.from=="change" || assetListView.from=="problem" || assetListView.from=="contracts"){
                templateData.isFromOtherModule = true;
            }else{
                templateData.isFromOtherModule = false;
            }
            let holderId;
            if(from == "print"){ // No I18N
                if(module === "asset_attachments"){ // No I18N
                    options.tableHolder = "asset_attachments"; // No I18N
                    holderId = "attached_assets"; // No I18N
                }else if(module === "component_attachments"){ // No I18N
                    options.tableHolder = "component_attachments"; // No I18N
                    holderId = "attached_components"; // No I18N
                }
            }else{
                holderId = "asset-list-view"; // No I18N
            }
            renderhbs("#" + holderId, "assets-listview-template", templateData, false, "assets"); // No I18N

             //Loading Help Card for the module in List view pages.
            if((sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND ) && (sdp_user.ROLES.indexOf("SDAdmin") !== -1 || sdp_user.ROLES.indexOf("Scan Now") !== -1 || sdp_user.ROLES.indexOf("CreateInventoryWS") !== -1)){
                if(sdp_user.USERTYPE === 'Technician'){ // No I18N
                    HelpVideos.init("assets", "#"+holderId);//No I18N
                }
                if(sdp_app.IS_SDP && sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("Assets")){ // No I18N
                    HelpVideos.open('Assets',false); // No I18N
                }
            }

        }
        let searchCriteria = null;
            if(assetsObj.input_data && assetsObj.input_data.list_info){
            /** This function is triggered in dashboard page while changing filters */
                searchCriteria = self.getsearchCriteria();
                /*filter_by is for Not known Processor from dashboard*/
                
                if(assetsObj.input_data.list_info.filter_by){
                    tableInfo.list_info.asset_filter_by = assetsObj.input_data.list_info.filter_by;
                }
            }else if (module==="asset_computers") { // No I18N
                searchCriteria = self.getsearchCriteria(moduleType, searchCriteria);
            }else if(isAttachAsset){
                searchCriteria = self.getsearchCriteria(module, searchCriteria);
            }else if(module==="asset_assets"){//NO I18N
                /**Getting issue from details */
            }
            if(searchCriteria){
                tableInfo.list_info.search_criteria = searchCriteria;
            }
            /**To retain asset_filter_by while navigate to edit and details page */
            if(assetsObj.assetListView && assetsObj.assetListView.tableObject && assetsObj.assetListView.tableObject.t_obj && assetsObj.assetListView.tableObject.t_obj.table_info.list_info.asset_filter_by){
                tableInfo.list_info.asset_filter_by=assetsObj.assetListView.tableObject.t_obj.table_info.list_info.asset_filter_by;
            }
            /**End */
          
            options.personalizeCallback = function(tableInfo){
                delete tableInfo.list_info.filter_by;
                return tableInfo;
            }
            options.get_total_count = false;
            options.multiDeleteEnabled = false; //disable default delete option.
            if(assetsObj.criteriafor == "inventoried"){ //NO I18N
                options.include_fieldsreq_gettotal = true;
            }
            options.callbackInputdata = function(inputObj,_self, t_comp){
                return inputObj;
            }
            if(options.api_name === "asset_computer" && !tableInfo.list_info.filter_by) {
                var listViewFilterObj = sdp_user.CLIENT_CONF.asset_computers_list_view_filter;
                tableInfo.list_info.filter_by = listViewFilterObj && listViewFilterObj.list_info && listViewFilterObj.list_info.filter_by;
            }
            if((self.searchText && options.api_name === "asset_computer")  || from === "dashboard") {
                delete tableInfo.list_info.filter_by;
            }
            self.tableObject = new tableComponent(tableInfo, table_content, options, self);
            self.initDelete();
    },
    /** callback function for toggle checkbox to hide and show edit button*/
    toggleCheckbox:function(){
        const selectedIds = assetListView.tableObject.bulkSelect && assetListView.tableObject.bulkSelect.getSelectedIDs().length;
        if (selectedIds > 0 && !assetListView.externalframe) {
            jQuery("#asset-list-view").find("#bulk_edit_icon").removeClass("hide");
        } else {
            jQuery("#asset-list-view").find("#bulk_edit_icon").addClass("hide");
        }
    },
    /**get default selected records*/
    getDefaultSelectedRecords: function() {
        let ele = '[name="assets"]',//NO I18N
            selectedAssets = {};

        if(assetListView.from=="problem"){
            ele = '[name="associated_asset"]';//NO I18N
            // for problem template
            ele += ', #associated_asset';//NO I18N
        }
        else if(assetListView.from == 'release') {
            // for release template
            ele += ', #assets';//NO I18N
        }
        if (window.top.jQuery('[data-template="from_change_template"]') && window.top.jQuery('[name="ASSETID"]').is("select")) {
            const selectElements = window.top.jQuery('[id="ASSETID"]'); //no i18n
            let selectedData = {};
            selectElements.each(function() {
                const selectElement = jQuery(this);
                const options = selectElement.find('option');
                options.each(function() {
                    const option = jQuery(this);
                    const id = option.val();
                    const text = option.text(); 
                    selectedData[id] = { id: id, name: text };
                });
            });
            selectedAssets = selectedData;
        }
        else{
            const mainParentWindow = window.top; // Store the original parent window
            const getMapper= (typeof $extFrame.getActiveWindow()!='undefined' && typeof $extFrame.getActiveWindow().FC_Mapper=='undefined')?mainParentWindow:$extFrame.getActiveWindow();// No I18N
            let parentWindow = getMapper;
            if(assetListView.from == "change" || assetListView.from == "release"){
            let tempWindow= mainParentWindow;
            while (!jQuery.isEmptyObject(tempWindow.$previewComponent.options)) {
                parentWindow = tempWindow.document
                    .querySelector("#" + tempWindow.$previewComponent.options[1].containerId + " iframe")
                    .contentWindow;
                tempWindow=parentWindow;
            }
            }
        var assets =   parentWindow.jQuery(ele).select2("data"); //NO I18N
        if(assetListView.from === "change" ){
            if(parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_change && parentWindow.FC_Mapper.form_change.grid.is(":visible")){
                assets = parentWindow.FC_Mapper.form_change.fields.assets.current_value;
            }else{
                assets = parentWindow.FC_Mapper.form_rcForm.fields.assets.current_value;
            }
                }
        else if(assetListView.from === "release" ){
                let val; //release template
                if(parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_release && parentWindow.FC_Mapper.form_release.grid.is(":visible")) {
                    val = parentWindow.FC_Mapper.form_release.fields.assets.current_value
                }
                else if(parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_rcForm && parentWindow.FC_Mapper.form_rcForm.fields) {
                    val = parentWindow.FC_Mapper.form_rcForm.fields.assets.current_value;
                }
                val && (assets = val);
        }
        assetListView.from && assetListView.from !="print" && assets.length > 0 && assets.forEach(function (asset) { //NO I18N
            selectedAssets[asset.id] = asset;
        });
        }
        return selectedAssets;
    },
    /**
         * execute this function to construct edit icon
         * @param {object} table
         * @returns
    */
    getEditIconHtml: function (table) {
        const data = table.row_data,
              id = data.id, 
              module = data.module ? data.module.api_plural_name : assetsObj.module;
        return `<a href="/ui/asset?module=${module}&entity_id=${id}&mode=edit" data-spa-module="assets" rel="noopener"  data-spa-page="assets-list" data-spa="true"><span data-id="${id}" data-module="${module}" list-edit-icon class="cur-ptr tc-edit" title="${translate("sdp.common.edit")}" rel="uitip">\
            </span></a>`;
    },
    /**execute this function to construct delete button */
    constructDeleteIcon: function () {
        const self = this,
              tableHolder = self.tableObject.tableId;
        let delete_icon = `<button id="${tableHolder}_btn_delete" type="button" class="btn btn-default btn-sm pt-delete-btn" title="${translate('common.delete')}" data-link="tablelist" disabled><span class="sdp-glyph glyph-color1 sdp-glyph-trash-fill"></span></button>`;

        jQuery("#asset-list-view").find("#deleteicon_" + tableHolder).html(delete_icon); // No I18N
    },
    /**execute this function to initiate delete functionality after render table component */
    initDelete: function() {
        const self = this;

        if(!self.links_data.permissions.multiDeleteEnabled) {
            return;
        }

        self.constructDeleteIcon();

        jQuery("#assetlistview_parent").find("#assets_list_btn_delete").on("click", function () {
            self.deleteAssets();
        });
    },
    /** Function triggered by clicking delete icon */
    deleteAssets: function () {
        const self = this,
              getSelectedIds = self.tableObject.bulkSelect.getSelectedIDs(),
              deleteIds = getSelectedIds.join(',');
        let deleteUrl;
        if(getSelectedIds.length>1){
            deleteUrl = `/${self.tableObject.t_obj.options.entity_name}?ids=${deleteIds}`;
        }else{
            deleteUrl = `/${self.tableObject.t_obj.options.entity_name}/${deleteIds}`;
        }
        const confirmMsg = "sdp.inventory.viewAssets.detailView.confirmMsg";// No I18N

        if (!confirm(translate(confirmMsg))) {
                     return false;
        }
        jQuery("#asset-list").find("#assets_lview_loading").show();
        sdpAjax({
             url: "/api/v3"+deleteUrl,// No I18N
             type: "delete",// No I18N
             success: function () {
                assetsObj.assetModTemplateData.metaDataWithId = {};
                jQuery("#asset-list").find("#assets_lview_loading").hide();
                 showalert('success', translate("common.delete.success"), "isAutoHide=true"); // No I18N
                 self.tableObject.refreshTable();
             },
             error: function (response) {
                jQuery("#asset-list").find("#assets_lview_loading").hide();
                const status = response && response.responseJSON ? response.responseJSON.response_status : {};
                if(status && status.message){
                    self.tableObject.handleErrorMsg(response);
                }else{
                    showalert('failure', translate("sdp.vulnerability.error.unknownexception.msg"), "isAutoHide=true"); // No I18N
                }
                self.tableObject.refreshTable();
             }
        });
    },
    /** Execute while apply advanced filter in listview
     * @param {object} search_criteria
     * @returns
    */
    convertToBits: function ( search_criteria ) {
        const tempChildrenObj = search_criteria && search_criteria.children,
              fieldsToConvert = ["memory.physical_memory", "memory.virtual_memory", "memory_modules.capacity", "logical_drives.capacity", "logical_drives.free_space", "hard_disks.capacity", "hard_disks.free_space"];//NO I18N
        /**Convert values for memory as per demo line values:[val1,val2] as discussed with server team */
        let getValuesArr = [],
            getCurrMemoryUnit  = "";
        let convertValuesToArray = (search_criteria) => {
            if(search_criteria && search_criteria.values && search_criteria.values.length>0){
                search_criteria.values.forEach(function (criteria) {
                    getValuesArr.push(criteria.value);
                });
                getCurrMemoryUnit = search_criteria.values[0].unit;
                search_criteria.values = getValuesArr;
            }
        }
        /*end*/
        let convertValues = (values,getCurrMemoryUnit) => {
            return values.map(function (value) {
                return assetsObj.getBits(value,getCurrMemoryUnit);
            });
        }

        if(search_criteria && fieldsToConvert.indexOf(search_criteria.field) != -1){
            convertValuesToArray(search_criteria);
            if(search_criteria.values){
                search_criteria.values = convertValues(search_criteria.values,getCurrMemoryUnit);
            }else{
                search_criteria.value = assetsObj.getBits(search_criteria.value,getCurrMemoryUnit);
            }
        }
        if(tempChildrenObj){
            tempChildrenObj.forEach(function (criteria) {
                if (fieldsToConvert.indexOf(criteria.field) != -1) {
                    convertValuesToArray(criteria);
                    if(criteria.values){
                        criteria.values = convertValues(criteria.values,getCurrMemoryUnit);
                    }else{
                        criteria.value = assetsObj.getBits(criteria.value,getCurrMemoryUnit);
                    }
                }
            });
        }
        search_criteria && (search_criteria.children = tempChildrenObj);
        return search_criteria;
    },
    /** function for rendering icon near asset name by clicking listview in dashboard page 
     * @param {object} data 
    */
    constructSelectedListCB : function(data){
        if(data.icon)
            var bg = (data.os_name != null) ? `<span class="icon-sd vmiddle disp-ib" style="background: url('${e_attr(data.icon)}') no-repeat"></span>` : `<span class="icon-md vmiddle disp-ib" style="background: url('${e_attr(data.icon)}') no-repeat"></span>`; // No I18N
        return (bg ? bg : "")+ ` <span title='${e_attr(data.name)}' rel='uitip'> ${e_html(data.name)}</span>`; // No I18N
    },
    /** callback function after basic render asset listview 
     * @param {object} ctl 
    */
    callbackAfterInitialRender : function(param, ctl, comp){
        let module = ctl.module, getSelFilterArr = assetsObj.filter_value,
            currentModule = null;
        if(ctl.from != "left_panel"){ // No I18N
            let templateData = ctl.templateData;
            if(!assetListView.externalframe) { 
                if(templateData.enable_action_menu && !assetsObj.isPopup) {
                    ctl.initActions(ctl.module);
                }
            }
            /**Getting parrent asset for the child to render*/
            let checkWithLastChild = (parentObj) => {
                if(parentObj.hasOwnProperty("child")){
                    checkWithLastChild(parentObj.child);
                }else{
                    module = parentObj.api_plural_name;
                    return true;
                }
            }
            if(templateData.enable_normal_filter) {
                if(module.startsWith("custom_")){// No I18N
                    currentModule = module;
                    if(templateData.meta_data && templateData.meta_data.hasOwnProperty("parents")){
                        checkWithLastChild(templateData.meta_data.parents);
                    }
                }
                ctl.initFilter(module,currentModule ? currentModule : null);
            }
        }

        !jQuery("#header_action_dropdown").length && jQuery("#asset-list-view").find("#bulkactionsMenu").hide(); //hide additional action menu when no option available.
        jQuery("#asset-list-view").find("#load_export_dialog").on("click", function () { //No I18N
            exportListViews.render({
                title: translate('sdp.inventory.export.dataandpush.exportingData'), //No I18N
            });
        });
        /**Included for assets from purchase page */
        jQuery('#assets_list_div').off('click','[sdphrefJs="js-href-asset-list-1"]').on("click",'[sdphrefJs="js-href-asset-list-1"]', function () { //No I18N
            const getId = jQuery(this).attr("data-id"),
                getApiName = jQuery(this).attr("data-api-name");
            assetsObj.loadAssetDetailPopup(getId, getApiName);
        });
        /**End */
        jQuery("#asset-list-view").find("#assetlistview_parent").show();
        ctl.hideLoading();
        applyBrowserTitle();
        if(getSelFilterArr && getSelFilterArr.length>0){
            assetsObj.retainSelectedFilterValues(getSelFilterArr);
        }
        /**Agent status on click function */
        jQuery(document).on("click", "[data-id=showAgentStatus]", function() { //No I18N
            var wsId = jQuery(this).data("wsid");//No I18N
            assetListView.loadAgentStatus(wsId);
        });
        /**End */
    },
     /** Initiate filters for asset listview 
     * @param {string} module 
     * @param {string} currentModule 
    */
    initFilter: function (module,currentModule) {
        const self = this,
              assetFilterContId = "nf_container",//No I18N
              isAttachAsset = module === "asset_connections" || module === "asset_attachments" || module === "component_attachments",//No I18N
              hasCloseButton = !isAttachAsset;
        let options = {
            module: module,
            container: assetFilterContId,
            hasClose: hasCloseButton,
        };

        assetFilter.loadElements[assetFilterContId] = false;

        if(isAttachAsset) {
            options.callback = assetActions.setModifyType;
            options.resetCallback = function () {
                assetActions.setModifyType({}, "product_type_filter", false);//NO I18N
            };
        }
        /**set false by default  */
        options.for_request_maintenance=false;
        options.for_request=false;
        
		if(self.from === "request_maintenance"){
			options.for_request_maintenance=true;
		}
		else if(self.from === "request"){
			options.for_request=true;
		}
        currentModule && (options.currentModule = currentModule);
        assetFilter.init(options,self);
    },
    /** callback function after basic render asset listview 
     * @param {object} self
     * @param {object} component  
    */
    callbackTableRender : function(data, self, component){
        const parentElement = jQuery("#asset-list-view");
        //disable delete for demo.
        sdp_app.IS_DEMO_BUILD && jQuery("#assets_list_btn_delete").unbind().click(function () {
            disableForDemo();
        });

        if(self.from == "left_panel"){
            jQuery(".cview").off("click").on("click", ".cv-task-item", function(event){ //No I18N
                event.preventDefault();
                const entityid = jQuery(this).attr("data-entityid");
                assetListView.tableObject.selectedId = assetListView.tableObject.t_obj.options.selectedId = entityid;
                jQuery("#leftpanel_container_kanban_div").find(".tc-row.cv-task-item").removeClass("active"); // No I18N
                jQuery("#leftpanel_container_kanban_div").find('[data-entityid="'+entityid+'"]').addClass("active"); // No I18N
                assetDetailView.gotoInit(entityid,self.externalframe); 
            });
        }else{
            parentElement.off("click").on("click","[id^='assetlink']",function(evt){ // No I18N
                if(evt.ctrlKey) {
                    return;
                }
                evt.preventDefault();

                const getAssetId = jQuery(this).data("id");// No I18N

                if (component.t_obj.options.view == "kanban" || self.from == "left_panel") {
                    assetDetailView.gotoInit(getAssetId, self.externalframe);
                } else {
                    const module = getUrlParameterByName("module",this.href);// No I18N
                    if(!module){
                        module = assetsObj.module;
                    }
                    assetsObj.redirectToEntity('detail', getAssetId, 'assetinfo',assetsObj.product_type_id, module);// No I18N
                }
            });
        }

        parentElement.off('click').on("click",'[data-li-ipaddress]', function(e) {
            self.showMoreIpAddress(this.getAttribute("data-li-ipaddress"));
            e.stopPropagation();
        });


        if(self.externalframe === true){
            parentElement.find("#assets_import").hide();
        }
        else{
            parentElement.find("#assets_import").show();
        }
        if (self.tableObject.hasOwnProperty("visibleContents") && self.tableObject.visibleContents.length < 1) {
            parentElement.find("#assets_export").addClass('disabled').end()
                         .find("#listview_export_icon").removeClass('opac5').addClass('opac3');
        }
        else {
            parentElement.find("#assets_export").removeClass('disabled').end()
                         .find("#listview_export_icon").removeClass('opac3').addClass('opac5');
        }
        jQuery(window).on('resize', function(){
            self.taskCompResize();
        });
        self.taskCompResize();
        if(self.module == "asset_assets" && self.from != "dashboard") {
            assetsObj.left_nav_promise && assetsObj.left_nav_promise.then(function(assetData){
                const productTypes = assetData && assetData.data;
                let noProductType = true;
                productTypes.forEach(function(data){
                    if(data.id == "asset_assets"){
                        if(data.children && data.children.length > 0){
                            noProductType = false;
                        }
                    }
                });
                if(noProductType && self.links_data.permissions.add_new_product_type){
                    const nodatastring = `<div class='ui-tablelist-nodata'>" ${translate("sdp.admin.producttype.listview.noproducttype")}" <a rel="noopener noreferrer" href='/app#/admin/all_product_types/new'> " ${translate("sdp.admin.producttype.listview.addproducttype") } "</a></div>`;
                    jQuery("#"+component.tableId+"_norecordsdiv").html(nodatastring);
                }
            })

        }
       
        /**Onclick function for view user assets from other modules requests,release etc.*/
        parentElement.find("[data-id='view_user_assets']").click(function(){
            const getEntityId = jQuery(this).attr("data-entityid");
            assetListView.loadDetailsPageofAsset(getEntityId);
        });
        /**Onclick function for modify state from asset listview rows.*/
        parentElement.off("click.modify_state").on("click.modify_state","[data-id='modify_state']",function(){// No I18N
            const getEntityId = jQuery(this).attr("data-entityid"),
                  getModule = jQuery(this).attr("data-module");
            assetActions.openAssignOwnerPopup(getEntityId,getModule);
        });
        /**Construct list view width based on left panel and sidebar */
        const getWinWid = jQuery(window).width();
        const getLeftPanelWidth = jQuery("#left-panel-section").outerWidth();
        const getSidebarWidth = jQuery(".sidebar-container").outerWidth();
        const constructWidth = Number(getLeftPanelWidth) + Number(getSidebarWidth);
        !self.externalframe && jQuery("#assets_list_div").css("width",getWinWid-constructWidth+"px");// No I18N
    },
    /**
     * Execute function to resize listview
     */
    taskCompResize: function (){
        let td_c_w = 0;
        let paddingVal = jQuery("body").css("padding-left"); // No I18N
        if(jQuery( 'body' ).css( 'direction' ) == 'rtl') {
            paddingVal = jQuery("body").css("padding-right"); // No I18N
        }
        let leftBarWidth = jQuery('#asset_left_nav_container').width(),
        listViewWidth = parseInt(paddingVal) + leftBarWidth + 20;
        td_c_w = jQuery(window).width() - listViewWidth;
        const parentElement = jQuery("#asset-list");

        if(parentElement.find('#assets_list_div').width() !== td_c_w) {
            parentElement.find('#assets_list_div').css({'width':td_c_w+'px'}); //NO I18N
        }

        let td_c_h = 0;
        var paddingBottom = window.externalframe ? 0 : 20;
        var filterVal = jQuery("#nr_filtr").hasClass("btn-info") ? 46 : 0; //No I18N
        var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        var adjustVal = sdp_app.IS_AE ? 110 : 0;
        td_c_h = jQuery(window).height() - jQuery('#header-placeholder').height() - paddingBottom - chatbar_height - filterVal + 60 - adjustVal;
        if(parentElement.find('#assets_list_div').height() !== td_c_h) {
            parentElement.find('#assets_list_div').css({'height':td_c_h+'px'}); //NO I18N
        }
        const leftnavtemplate = jQuery("#render_leftpanel_template");
        if(leftnavtemplate.find('#asset_left_nav_container').height() !== td_c_h){
            leftnavtemplate.find('#asset_left_nav_container').css({'height':td_c_h+'px'}); // No I18N
        }
    },
    /**Execute while clicking new button and redirect to new page*/
    addNewAsset: function() {
        assetsObj.redirectTo("form", assetsObj.module); // No I18N
    },
    /** callback function execute while search text in listview
     * @param {object} ctrl
    */
    callbackSearchFunction : function(param, ctrl){
        let crit_Obj = {}, critChildArray = [];
        const self = ctrl,
              listInfo = self.tableObject.t_obj.table_info.list_info,
              searchCriteriaObj = listInfo.search_criteria;
            if(searchCriteriaObj && searchCriteriaObj.children && searchCriteriaObj.children.length>0){
                critChildArray = searchCriteriaObj.children;
                delete searchCriteriaObj.children;
            }
            /**Concat selected filter criteria value to tableinfo criteria */
            /**Concat selected filter criteria value to tableinfo criteria */
            if(self.filter_criteria){
				const getSpliceInd = [];
				const getSpliceFld = [];
				self.filter_criteria.forEach(function(fld,index){
					getSpliceFld.push(fld.field);
					getSpliceInd.push(index);
				});
                let filterCriteriaCopy = (self.filter_criteria && self.filter_criteria.length>0) ? self.filter_criteria.slice() : self.filter_criteria;
                if(critChildArray && critChildArray.length>0){
                    for(i=critChildArray.length-1;i>=0;i--){
                        if(getSpliceFld.indexOf(critChildArray[i].field)!=-1){
                            const getInd = getSpliceFld.indexOf(critChildArray[i].field);
                            filterCriteriaCopy.splice(getSpliceInd[getInd], 1);
                        }
                    }
                }
				self.filter_criteria = filterCriteriaCopy;
                critChildArray = critChildArray.concat(self.filter_criteria);
            }
			/*
			When Site filter has default value, and if no other filter is selected or site filter is not changed
			then filter criteria will be null, In this case if any search is done
			we are adding site criteria by ourselves
			*/
			else {
                /**Remove -1 and set site as null for Not associated site field in request maintenance */
				if((self.from === "request_maintenance"||self.from === "request")&&sdp_app.IS_SITE_CONFIGURE){
					let stVal = assetFilter.getFieldValue("site_filter"); //NO I18N
					if(stVal!=""&&stVal!=''){
                        let stField="site.id"; //NO I18N
                        if(stVal==-1||stVal==0||stVal=="0"){
                            stVal=null;
                            stField="site"; //NO I18N
                        }
                        critChildArray.push({"field": stField, "condition": "is", "value": stVal,"logical_operator":"AND"});
					}
				}
			}
            let modValue = "";
            if(!modValue){
                modValue = assetsObj.module == "asset_assets" ? "product_type" : assetsObj.module;//NO I18N
            }
            /**Added advance filter criteria also in tableinfo criteria list */
            if(self.tableObject.isAdvFilterApplied){
                crit_Obj = jQuery.extend(true, {}, self.tableObject.advancedfilter_criteria);
                /**Search crtieria added with advance filter */
                if(searchCriteriaObj && !searchCriteriaObj.children){
                    if(crit_Obj.children && crit_Obj.children.length>0){
                        crit_Obj.children.push(searchCriteriaObj);
                    }else{
                        crit_Obj.children = [searchCriteriaObj];
                    }
                }
                /**End */
                if(critChildArray.length != 0) {
                    if(crit_Obj.children){
                        crit_Obj.children = crit_Obj.children.concat(critChildArray);
                    } else {
                        crit_Obj.children = critChildArray;
                    }
                }
            }else{
                if(critChildArray.length>0){
                    let checkIsFieldAvail = false;
                    critChildArray.forEach(function(value){
                        if(searchCriteriaObj.field==value.field){
                            checkIsFieldAvail = true;
                        }
                    });
                    if(!checkIsFieldAvail && searchCriteriaObj.field!="id"){
                        critChildArray.push(searchCriteriaObj);
                    }
                }
                crit_Obj = self.getsearchCriteria(modValue, critChildArray.length>0 ? critChildArray : searchCriteriaObj);
            }

            const isCObjEmpty = jQuery.isEmptyObject(crit_Obj);
            if(isCObjEmpty){
                delete self.tableObject.t_obj.table_info.list_info.search_criteria;
            }else{
                crit_Obj = self.convertToBits(crit_Obj);
                delete self.tableObject.t_obj.table_info.list_info.search_fields;
                self.tableObject.t_obj.table_info.list_info.search_criteria = crit_Obj;
            }
           
            delete self.tableObject.t_obj.table_info.ci_attributes;
            self.tableObject.refreshTable('search'); // No I18N
    },
    /**Refresh asset list view if any changes made */
    refreshTable : function(){
        assetListView.tableObject.refreshTable("refresh"); // No I18N
    },
    /**Initiate actions in asset listview page
     * @param {string} module
     */
    initActions: function (module) {
        const self = this,
        options = {
            module: module,
            moduleType: self.moduleType =="" || self.moduleType===undefined ? assetsObj.assetModTemplateData.metaDataWithoutId[module].module_details.name : self.moduleType,
            typeId: assetsObj.type_id,
            moduleURL: module,
            containerId: "assets_list_actions",  // No I18N
            isListView: true,
            actionBtnLinks : self.links_data && self.links_data.actionBtnLinks,
            getId: function () {
                const assets = self.tableObject.bulkSelect.selectedRecords;
                return Object.keys(assets);
            },
            success: function () {
                self.tableObject.refreshTable();
            }
        };
        try {
            assetActions.init(options);
        } catch (e) {
            clientErrorHandling.error(e);
        }
    },
     /**Construct header data in asset listview page
     * @param {string} module
     * @param {string} from
     */
    headerDataConstruct: function (from, module) {
        const self = this;
        let metaData = {};
        if ((from === "dashboard" || !self.externalframe || module === "asset_connections" || module === "asset_attachments" || module === "component_attachments" || from=="space") && from != "print" && self.from!="view_user_assets"){ // No I18N
                metaData.assets_list_head_chk = { 
                    "type" : "icon", // No I18N
                    "default" : true, // No I18N
                    headCellTransformer : function(){
                        return `<input type="checkbox" id="assets_list_head_chk" class="ml5">`; // No I18N
                    },
                    dataCelltransformer: function (table_info) {
                        var ci_id = table_info.row_data.ci ? table_info.row_data.ci.id : "";
                        return `<span class="pull-left ml5">
                            <input type="checkbox" name="checkbox" value="${table_info.row_data.id}" data-table-checkbox data-ciid="${ci_id}"> </span>`;
                    }
                };
            }
            var getMetaData = assetsObj && assetsObj.assetModTemplateData && assetsObj.assetModTemplateData.metaDataWithoutId && assetsObj.assetModTemplateData.metaDataWithoutId[module];
        getMetaData = getMetaData ? getMetaData : null;
        var getHierarchy = getMetaData && assetsObj && assetsObj.isComputerHierarchy(getMetaData.hierarchy);
        let meta_data_add;
        switch (module) {
            case "component_attachments"://NO I18N
            case "asset_connections"://NO I18N
            case "asset_attachments"://NO I18N
            case "attached_assets"://NO I18N
            case "attached_components"://NO I18N
            case "connected_assets"://NO I18N
                meta_data_add = {
                    name: {frommeta : true, "checkbox_disable": true},// No I18N
                    type: {frommeta : true},
                    state: {frommeta : true},
                    department: { frommeta: true },
                    user: { frommeta: true },
                    site: { frommeta: true },
                    purchase_cost: { 
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    operational_cost: { 
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    total_cost: { 
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    is_loaned: { 
                        frommeta: true,
                        dataCelltransformer: function (table_info) {
                            return table_info.row_data.is_loaned ? translate("common.yes") : translate("common.no"); //No I18N
                        }
                    },
                    "module": { //NO I18N
                        frommeta: true
                    }
                };
                break;
            default:
                meta_data_add = {
                    iconcell: {
                        type: "icon", // No I18N
                        hide_label: true,
                        "default": true, //NO I18N
                        "column_settings": {"position": 1}, // No I18N
                        dataCelltransformer: function (table_info) {
                            return `<span class="icon-sm disp-ib" style="background: url(${e_attr(table_info.row_data.icon)})"></span>`;
                        }
                    },
                    "editIcon": {// No I18N
                        "type": "icon", // No I18N
                        "hide_label": true,// No I18N
                        "default": true, //NO I18N
                        "column_settings": { "position": 2 }, // No I18N
                        "dataCelltransformer": self.getEditIconHtml// No I18N
                    },
                    name: {
                        "default": true, // No I18N
                        "column_settings": {"view_type": "row"}, // No I18N
                        "checkbox_disable": true,// No I18N
                        dataCelltransformer: self.constructAssetName
                    },
                    agentStatus : {
                        "default": true, // No I18N
                        "display_name": translate("inventory.assetListView.agentstatus"),// No I18N
                        dataCelltransformer: this.constructAgentStatus
                    },
                    "os_name": {frommeta : true}, //NO I18N
                    "service_tag": {frommeta : true}, //NO I18N
                    "user": { frommeta: true }, //NO I18N
                    "model": {frommeta : true}, //NO I18N
                    "department": { frommeta: true }, //NO I18N
                    "site": { frommeta: true },//NO I18N
                    "org_serial_number": {frommeta : true}, //NO I18N
                    "purchase_cost": { //NO I18N
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    "product_type": { //NO I18N
                        frommeta: true
                    },
                    "module": { //NO I18N
                        frommeta: true
                    },
                    "is_loaned": { //NO I18N
                        frommeta: true,
                        dataCelltransformer: function (table_info) {
                            return table_info.row_data.is_loaned ? translate("common.yes") : translate("common.no"); //No I18N
                        }
                    },
                    "operational_cost": { //NO I18N
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    "total_cost": { //NO I18N
                        frommeta: true,
                        display_type : "currency" //NO I18N
                    },
                    "vendor": {frommeta : true}, //NO I18N
                    state: {
                        frommeta : true,
                        dataCelltransformer: (!self.links_data.permissions.modify_state || self.externalframe || from == "left_panel") ? undefined : function (table_info) {//NO I18N
                            const state = e_html(table_info.row_data.state.name),
                                  id = table_info.row_data.id,
                                  currentModule = module;
                            if (sdp_app.IS_REMOTE_SERVER) {
                                return state;
                            }
                            return `<a data-id="modify_state" id="state_${id}" data-cs-field="modify_state_${id}" data-entityid=${id} data-module="${currentModule}" rel="uitip" title="${state}" href="/">${state}</a>`; // No I18N
                        }
                    },
                    current_cost : {
                        display_type : "currency"//NO I18N
                    },
                    "vm_host" : { //NO I18N
                        frommeta : true,
                        dataCelltransformer : self.constructHostName
                    }
                };
                /**For agent status */
                if(!getHierarchy && module!="asset_computers"){
                    delete meta_data_add.agentStatus;
                }
                /**End */
                if(sdp_app.IS_REMOTE_SERVER) {
                    delete meta_data_add.relationshipicon;
                }
                if(!self.links_data.permissions.edit || self.externalframe){
                    delete meta_data_add.editIcon;
                }
                const getModuleDetails = (typeof assetDetailView!=='undefined') ?  (assetDetailView.metaData && ((assetDetailView.metaData.hierarchy && assetsObj.isComputerHierarchy(assetDetailView.metaData.hierarchy)) || (assetDetailView.metaData.module_details && assetDetailView.metaData.module_details.name == "asset_computer"))) : null;// No I18N
                if(!getModuleDetails){
                    delete meta_data_add.iconcell;
                }
                if(from === "purchase") {
                    delete meta_data_add.editIcon;
                    meta_data_add.name.dataCelltransformer = function(table_info){
                        return `<a id="asst_lnk__${table_info.row_data.id}" href="/" sdphrefJs="js-href-asset-list-1" data-id="${table_info.row_data.id}" data-api-name="${table_info.row_data.module.api_plural_name}" class="disp-ib truncate-ellipsis"><span rel="uitip" class="truncate-wrapper" title="${e_attr(table_info.row_data.name)}">${e_html(table_info.row_data.name)}</span></a>`; // No I18N;
                    };
                }
                if(from === "dashboard") {
                    delete meta_data_add.editIcon;
                }
                break;
        }
        jQuery.extend(metaData,meta_data_add);

        if(!self.links_data.permissions.multiDeleteEnabled && self.links_data.actionBtnLinks && self.links_data.actionBtnLinks.length == 0){
            delete metaData.assets_list_head_chk;
        }
        metaData.ip_addresses = {
            frommeta: true,
            dataCelltransformer: function (table_info) {
                const getIpAddressFromData = table_info.row_data.ip_addresses,
                      ip_addresses = getIpAddressFromData ? getIpAddressFromData : "-",
                      cursor = getIpAddressFromData ? "cur-ptr" : "";//NO I18N

                return `<div style="max-width: 300px;" data-li-ipaddress='${table_info.row_data.id}' class="text-overflow disp-ib fw ${cursor}">\
                        <a rel-class="fw" rel="uitip" class="ml5" >${e_html(ip_addresses)}</a>\
                </div>`;
            }
        }

        if (metaData.user) {
            metaData.user.dataCelltransformer = function (data) {
                const user = data.row_data.user;
                let vipIcon = "";
                let checkVipUser = (user) => {
                    if(user.is_vipuser){
                        return true
                    }
                    return false
                }
                if (!user) {
                    return "-";
                }
                if (checkVipUser(user)) {
                    vipIcon += `<span class="cspr vip icon-sm ml5 fr right0 top0" rel="uitip" title="${translate("sdp.admin.requesterDef.vipuser")}"></span>`; // No I18N
                }
                return `<span style="max-width: CALC(100% - 25px)" class="text-overflow disp-ib" rel="uitip" title="${e_attr(user.name)}">${e_html(user.name)}</span>` + vipIcon; // No I18N;
            }
        }
        
        if(from=="left_panel"){
            metaData.name.hide_label = true;
            delete metaData.assets_list_head_chk;
            delete metaData.ip_addresses.dataCelltransformer;
        }else{
            delete metaData.iconcell;
        }

		if(self.from=="view_user_assets"){
			metaData.name.dataCelltransformer =  self.constructAssetName
		}
        if(self.from=="purchase"){
            if(sdp_user.ROLES.indexOf("ViewInventoryWS") == -1) {
               delete metaData.name.dataCelltransformer;
            }
		}
        /**For agent status */
        if(self.externalframe || !self.links_data.permissions.links_scan || !assetsObj.isDCIntegrated){
            delete metaData.agentStatus;
        }
        /**End */
        return metaData;
    },
    /**Construct asset name with hyperlink to show details page data in asset listview page
     * @param {object} table_info
     * @param {object} ctrl
     * @param {object} component
     */
    constructAssetName: function(table_info, ctrl, component) {
        const assetId = table_info.row_data.id,
            getModuleName = table_info.row_data.module ? table_info.row_data.module.api_plural_name : assetsObj.module;
            
        let iconStr = "", // No I18N
            html = "";
		if(ctrl.from=="view_user_assets"){
			return `<a class="" data-id="view_user_assets" data-entityid="${assetId}" href="/" rel="uitip" title="${e_attr(table_info.row_data.name)}">${e_html(table_info.row_data.name)}</a>`;
		}
        if(ctrl.externalframe && ctrl.from == "left_panel"){ // No I18N
            html = `<span class="disp-ib p3 truncate-ellipsis" style="background-color:transparent"><span class="truncate-wrapper cur-ptr uni-heading sb bold" rel="uitip" title="${e_attr(table_info.row_data.name)}">${e_html(table_info.row_data.name)}</span></span>`;
        }else{
            if(component.t_obj.options.view == "kanban" || ctrl.from == "left_panel"){
                iconStr = '#'+assetId +" "; // No I18N
            }else{
                if(table_info.row_data.icon){
                    iconStr = table_info.row_data.os_name != null ? `<span class="icon-sd vmiddle disp-ib" style="background: url(${e_attr(table_info.row_data.icon)}) no-repeat"></span>` : `<span class="icon-md vmiddle disp-ib" style="background: url(${e_attr(table_info.row_data.icon)}) no-repeat"></span>`;
                }
                else{
                    iconStr = "";
                }
            }
            if(ctrl.externalframe){
                html = `<a data-cs-field="asset_${assetId}" data-handler="assetsObj.redirectTo('detail','${getModuleName}',null,${assetId})" data-event="click" nonce="${sdpNonce}" id="assetlink_${assetId}" name="asset_name"  class="disp-ib truncate-ellipsis cur-ptr" ><span rel="uitip" class="truncate-wrapper" title="${e_attr(table_info.row_data.name)}"> ${iconStr} ${e_html(table_info.row_data.name)} </span></a>`; // No I18N
                parent.$sdEventListener("#assetlink_"+assetId); // No I18N
            }else{
                html = `<a data-cs-field="asset_${assetId}" data-spa-module="assets" data-spa-page="assets-details" data-spa="true" rel="noopener" href="/ui/asset?module=${getModuleName}&entity_id=${assetId}&mode=details" nonce="${sdpNonce}" id="assetlink_${assetId}" name="asset_name"  class="disp-ib truncate-ellipsis cur-ptr" ><span rel="uitip" class="truncate-wrapper" title="${e_attr(table_info.row_data.name)}"> ${iconStr} ${e_html(table_info.row_data.name)} </span></a>`; // No I18N
            }
        }
        return html;
    },
    /**Construct host name with hyperlink to show details page data in asset listview page
     * @param {object} table_info
     * @param {object} ctrl
     * @param {object} component
     */
    constructHostName : function(table_info, ctrl, component){
        if(table_info.row_data.vm_host){
            const vmHostId = table_info.row_data.vm_host.id;
            const HostModuleName = table_info.row_data.vm_host.module.api_plural_name;
            return `<a rel="noopener" href="/ui/asset?module=${HostModuleName}&entity_id=${vmHostId}&mode=details" nonce="${sdpNonce}" name="vm_host"  class="disp-ib truncate-ellipsis cur-ptr" ><span rel="uitip" class="truncate-wrapper" title="${e_attr(table_info.row_data.vm_host.name)}"> ${e_html(table_info.row_data.vm_host.name)} </span></a>`; // No I18N
        }

        return '<div class="d_w" data-field-display-type="PickList" rel="uitip" mode_ellipsis="true" title="" style="width: 150px;">-</div>'; // No I18N
    },
     /**load details page in new tab while clicking particular asset name in table
     * @param {integer} id
        @returns
     */
	loadDetailsPageofAsset:function(id){
		assetsObj.redirectTo("detail","asset_assets", "", id, "", "", "view_user_assets", "",  undefined, undefined ); // No I18N
	},
    /**display ip address list in a popup
     * @param {integer} assetId
        @returns
     */
    showMoreIpAddress: function (assetId) {
        const asset = assetListView.tableObject.bulkSelect.loadedRecords[assetId];
        assetsObj.openIPAddressPopup(asset.ip_addresses, asset.name);
    },
    /** construct row for asset listview
     * @param {object} table_info
        @returns
     */
    rowDataConstruct: function(table_info) {
        const self = this;
        let inputObject = {},
            fields_required = table_info.fields_required;
            delete fields_required.editIcon;
            delete fields_required.iconcell;
            delete fields_required.relationshipicon;
        let fields_required_arr = Object.keys(fields_required);
        const addlFldsRequired = ["icon","os_name","type","last_success_audit","module"];//NO I18N
        fields_required_arr = fields_required_arr.concat(addlFldsRequired);
            inputObject.fields_required = fields_required_arr;
            let list_info = table_info.list_info;
            let sort_field = list_info.sort_field;
            if(sort_field != null) {
                sort_field = sort_field.split(".")[0];
                if(!fields_required_arr.contains(sort_field)){
                    delete list_info.sort_field;
                    delete list_info.sort_order;
                }
            }
            inputObject.list_info = table_info.list_info;
			try{
				/* FOr Site filter request/maintenance form value will set as default value
				so we are passing it in in input data
				*/
				if(assetListView.from === "request_maintenance"||assetListView.from === "request"){
					/* When new columns are columns are chosen after table render then also
					rowDataConstruct gets called and we don't need to apply criteria at that time
					so adding if check to ensure that it works in first load
					*/
					if(jQuery('#site_filter_select2').length==0&&window.top.assetsObj&&window.top.assetsObj.filter_site_id){
						let critTopush={};
						if(window.top.assetsObj.filter_site_id!='-1' && window.top.assetsObj.filter_site_id!='0' && window.top.assetsObj.filter_site_id!=null){
							critTopush={"field": "site.id", "condition": "is", "value": window.top.assetsObj.filter_site_id,"logical_operator":"AND"}; //NO I18N
                            if(!inputObject.list_info.search_criteria){
                                inputObject.list_info.search_criteria=critTopush;
                            }
                            else if(inputObject.list_info.search_criteria && (!inputObject.list_info.search_criteria.children || inputObject.list_info.search_criteria.children.length==0)){
                                inputObject.list_info.search_criteria.children=[critTopush];
                            }
                            else{
                                inputObject.list_info.search_criteria.children.push(critTopush);
                            }
                        }
					}
				}
			}
			catch(e){
			}
            return inputObject;
    },
    /** This function used in AssetActions.js for save function */
    getSelectedIDs : function(){
        return window.top.assetListView.tableObject.bulkSelect.getSelectedIDs();
    },
    /**Execute to get requeried fields based on where asset listview need to render
     * @param {object} searchCriteria
     * @param {Array} fields_required
     * @param {Boolean} doInclude
     */
    processFieldsRequired : function(searchCriteria, fields_required, doInclude){
        const criteria = searchCriteria,
              processFields = ["keyboard.keyboard_manufacturer","keyboard.keyboard_serial_number","keyboard.keyboard_type","sys_uptime","sys_name","sys_location","loan_start","device_type", "device_type.name","contracts.name","last_audit","is_remote_control_prompt_enabled","agent_version","sound_card.sound_card_name","memory.virtual_memory","memory.physical_memory"];  //NO I18N
        if(doInclude){
            if(processFields.indexOf(criteria.field) != -1){
                fields_required.push(criteria.field);
            }
            if(criteria.children){
                const childCrit = criteria.children;
                for (let i = 0; i < childCrit.length; i++) {
                    if(processFields.indexOf(childCrit[i].field) != -1){
                        fields_required.push(childCrit[i].field);
                    }
                }
            }
        }else{
            for (let i = 0; i < fields_required.length; i++) {
                const fldIndex = processFields.indexOf(fields_required[i]);
                if(fldIndex != -1){
                    fields_required.splice(i, 1);
                }
            }

        }
        return fields_required;
    },
    modifyState: function (id) {
        let responseData = null,
            data = {
            "fields_required": ["name", "module", "product", "department", "used_by_asset", "state", "user"]//NO I18N
        };
        sdpAjax({
            url: "/api/v3/asset_assets/" + id,//NO I18N
            data: sdpAjaxInputData(data),
            async: false,
            success: function (response) {
                responseData = response['asset_asset'];
            }
        });
        assetActions.modifyState(responseData);
    },
    /**Bulk edit popup initiation
     * @param {string} module
     */
    openBulkEditPopup:function(module){
        const self = this;
        if('undefined'!== typeof self && self && self.tableObject.bulkSelect){
            const getBulkIds = self.tableObject.bulkSelect.getSelectedIDs().join();
            const path = `/asset/AssetPopup.jsp?forwardTo=form&module=${e_param(module)}&bulkIds=${getBulkIds}&from=bulkedit`;
            assetsObj.load(jQuery("#assignOwnerPopup"), path);
        }
    },
    /**Create dialog using  sdp_zcomponent_dialog for asset bulk edit*/
    createAssetBulkEditPopup:function(){
        jQuery("#Right-Section").find("#assets_common_loading").show();
        assetsObj.assetActions = assetActions;
        /**Need to fix width size by client side in sdp_zcomponent_dialog component */
        var zdialogOptions = {
            width: jQuery(window).width() * 95 / 100, 
            height: jQuery(window).height() * 95 / 100,
            draggable: true,
            closeOnEscKey: true,
            position: {
                top: "0px" //No I18N
            },
            title : translate("ae.cmdb.inventory.editNewCI",[assetListView.tableObject.metaInfo.display_name_plural || translate("sdp.header.inventory")]),
            beforeclose:function(e){
                e.preventDefault();
                jQuery('[name="cancel-form"]').trigger('click');
            }
        }
        jQuery("#assignOwnerPopup").find("#asset_bulk_edit_popup_form").sdp_zcomponent_dialog(zdialogOptions);
    },
    /**Construct agent status column in listview */
    constructAgentStatus : function (table_info) {
        var id = table_info.row_data.asset_id?table_info.row_data.asset_id : table_info.row_data.id;
        return '<span id="agentstatus_'+ZSEC.Encoder.encodeForHTMLAttribute(id)+'"><button type="button" class="btn btn-sm btn-default" data-id="showAgentStatus" data-wsid="'+ZSEC.Encoder.encodeForHTMLAttribute(id)+'">'+getMessageForKey('admin.sms_conf.custom.get')+'</button></span>' //No I18N
    },
    /**Onclick function execute while clicking agent status */
    loadAgentStatus : function(resourceId){
        var agentstatusId = '#agentstatus_'+resourceId;// No I18N
        var getAgentStatusBT = jQuery(agentstatusId).html();
        jQuery(agentstatusId).empty();
        jQuery(agentstatusId).append('<span class="cspr icon-md time-log flat" role="img" rel="uitip" ></span>');
        var data = {
            action: "getAgentStatus",// No I18N
            resourceId: resourceId
        };
        var items = sdpToJSON(data);
        sdpAjax({
            type: "POST", // No I18N
            url: "/DCToolsActions.do?operation=AssetAction_Post",// No I18N
            data: {
                data: items
            },
            dataType: "json", // No I18N
            success: function (data) {
                var agentStatus;
                if("agentStatus" in data){
                    agentStatus = data.agentStatus.liveStatus;
                    if(agentStatus == 'Live'){
                        jQuery(agentstatusId).empty();
                        jQuery(agentstatusId).append('<span class="astspr icon-md ag-st-live" role="img" rel="uitip" title="'+getMessageForKey('inventory.assetListView.agentlive')+'" ></span>');

                    }
                    else if(agentStatus == 'Down'){
                        jQuery(agentstatusId).empty();
                        jQuery(agentstatusId).append('<span class="astspr icon-md ag-st-down" role="img" rel="uitip" title="'+getMessageForKey('inventory.assetListView.agentnotlive')+'"></span>');

                    }
                    else{
                        jQuery(agentstatusId).empty();
                        jQuery(agentstatusId).append('<span class="cspr req-requesting-cancel icon-md" role="img" rel="uitip" title="'+getMessageForKey('inventory.assetListView.agentlessmachine')+'" ></span>');
                    }

                }
                else if("sdp_status" in data && (data.sdp_status == 'admin_server_down' || data.sdp_status == 'server_down')){
                    showalert("failure", getMessageForKey("sdp.asset.scan.inventory.troubleshoot.notreachable",[getMessageForKey("me.endpoint.central")]), "isAutoHide=false"); //NO I18N
                }
                else{
                    jQuery(agentstatusId).empty();
                    jQuery(agentstatusId).append('<span class="cspr req-requesting-cancel icon-md" role="img" rel="uitip" title="'+getMessageForKey('inventory.assetListView.agentlessmachine')+'" ></span>');
                }



            }
        });
    },

    openCompListView: function () {
        var tableComp = assetListView.tableObject;
        delete tableComp.t_obj.table_info.list_info.filter_by;
        tableComp.refreshTable();
        var listviewFilterMenu = jQuery('#ListViewFilterMenu');
        listviewFilterMenu && listviewFilterMenu.removeClass('open');
        var filterName = jQuery('#listview_filter_name');
        var self = this;
        var productTypeName = self.productTypeName !== undefined ? self.productTypeName : translate("sdp.inventory.computers"); // No I18N
        filterName && filterName.text(productTypeName);
        var personalizationArray = sdp_user.CLIENT_CONF["asset_computers-list-asset_computers"]; // No I18N
        if (personalizationArray) {
            var listInfoObj = sdp_user.CLIENT_CONF["asset_computers-list-asset_computers"].list_info; // No I18N
            var filterByObj = listInfoObj.filter_by;
            if(filterByObj) {
                delete sdp_user.CLIENT_CONF["asset_computers-list-asset_computers"].list_info.filter_by; // No I18N
            }
        }
        var personalizationKey = "asset_computers-list-asset_computers"; // No I18N
        var applyPersonalization = function () {
            var pArray = sdp_user.CLIENT_CONF[personalizationKey];
            if (pArray) {
                addPersonalization(personalizationKey, pArray);
                addPersonalization("asset_computers_list_view_filter", pArray); // No I18N
            }
        };
        setTimeout(applyPersonalization, 2);
    },

    openAssetComputerListView: function () {
        var filterList_obj = new filterListComp();
        filterList_obj.initComponent({
            triggerElement: "#asset_computer_listview_btn", //No i18n
            element : "#ListViewFilterMenu",  // No I18N
            module : "asset_computer",  // No I18N
            personalize_key : "asset_computer_filter_views",// No I18N
            filter_action : "assetListView.switchFilterView", //No I18N
            isTrashEnabled: false,
            favoritable : false,
            custom_filters : false,
            skipPersonalization : true
        });
        var filterIdList = jQuery('#filtersortlist');
        var self = this;
        var productTypeName = self.productTypeName !== undefined ? self.productTypeName : translate("sdp.inventory.computers"); // No I18N
        filterIdList && filterIdList.append(`<li class="unfavourite"><span class="disp-c"><button type="button" class="wb-bw a-tag-btn-ovwrt tl wspace-normal pl10" data-event="click" data-handler="assetListView.openCompListView()" data-is-c-view="" data-filter-content="item">${productTypeName}</button></span></li>`);
        filterIdList && filterIdList.on('click', 'button[data-handler="assetListView.openCompListView()"]', function() {
            assetListView.openCompListView();
        });
    },

    switchFilterView: function (viewId, viewName) {
        var tableComp = assetListView.tableObject;
        tableComp.t_obj.table_info.list_info.filter_by = { "id": viewId }; // No I18N
        tableComp.refreshTable();
        var filterNameElem = jQuery('#listview_filter_name');
        if (filterNameElem) {
            filterNameElem.text(viewName);
        }
        var personalizationKey = "asset_computers-list-asset_computers"; // No I18N
        var personalizationArray = sdp_user.CLIENT_CONF[personalizationKey];
        personalizationArray = undefined;
        var applyPersonalization = function () {
            var pArray = sdp_user.CLIENT_CONF[personalizationKey];
            if (pArray) {
                var listInfoObj = pArray.list_info;
                listInfoObj.filter_by = {
                    "id": viewId, // No I18N
                    "name": viewName // No I18N
                };
                pArray.list_info = listInfoObj;

                addPersonalization(personalizationKey, pArray);
                addPersonalization("asset_computers_list_view_filter", pArray); // No I18N
            }
        };
        setTimeout(applyPersonalization, personalizationArray ? 5 : 50);
    }
}

//old non-API functions. - removed since it is not used anywhere
/**For currently it is used for getting scan now and change credential to check selected list length greater than zero - doubt */
function checkForDelete() {
    return assetListView.tableObject.bulkSelect.getSelectedIDs().length > 0;
}

/**For group popup from actions in listview */
function confirmAddToGroupAction()
{
    const valid = assetListView.tableObject.bulkSelect.getSelectedIDs().length > 0; 
    if(valid)
    {
        const title= translate("sdp.inventory.addtogroup.addresource");
        showURLInDialog('/GroupListView.do?mode=addpage&addToGroup=true', 'closeButton=yes,method=get,title=' + title); //NO I18N
    }
    else
    {
        showalert('failure',translate("sdp.asset.listview.excludedevice.selectdevice"),"isAutoHide=false");//NO I18N
    }
}

/**For remote agent control actions */
function changeRDSSettings()
{
    const valid = true;//checkForDelete(form,"checkbox");//NO I18N
    if(valid)
    {
        NewWindow('ChangeRDSSettings.do?action=getstatus', 'ChangeRDSSettings', '650', '180','yes','center', null, null, null, true);
    }
    else
    {
        showalert('failure',translate("sdp.inventory.listviewWS.jsmessage6"),"isAutoHide=false");//NO I18N
    }
}


function getSelectedResources()
{
    if(assetsObj.isCMDB) {
        const ids = assetListView.tableObject.bulkSelect.getSelectedIDs();
        return ids.map(function (id) { return id; }).join(";");
    } else {
        let ids = "";
        const assets = assetListView.tableObject.bulkSelect.selectedRecords;
        for (let id in assets) {
            ids += id + ";";
        }
        return ids;
    }
}

/**On click function for export assets in dropdown from listview */
jQuery(document).off("click.exportlistview").on("click.exportlistview", "#export_listview", function () { //No I18N
    const type = jQuery('input[name="export-format"]:checked').val();
    const list_info = assetListView.tableObject.t_obj.table_info.list_info;
    delete list_info.has_more_rows;
    delete list_info.end_index;
    delete list_info.total_count;
    delete list_info.sort_valuepath;

    let options = {
        type: type,
        list_info: assetListView.tableObject.t_obj.table_info.list_info,
        module: assetListView.module ,
        title: assetListView.productTypeName!==undefined?assetListView.productTypeName:"Assets"//No I18N
    }
    if(assetListView.from == "purchase"){
        const poId = getUrlParameterByName("poID",window.top.location.href);//No I18N
        options.module = "purchase_orders/" + poId + "/assets"; //No I18N
        options.title = translate('sdp.purchase.addNew.view.Assets.title')
    }
    options.list_info.fields_required = Object.keys(assetListView.tableObject.t_obj.table_info.fields_required);

    try {
        if( typeof top.listview_popup !== undefined && top.listview_popup.title ) {
            options.title = top.listview_popup.title;
        }
    } catch (error) {}
    exportListViews.exportView(options);
});

var exportListViews = {
    context: {},
    exportModal: function() {
        this.context.formats = [{
            key: 'HTML',    //NO I18N
            name: translate('ae.export.format.html'),   //NO I18N
            icon_class: 'attachment-sprite attach-ie',       //NO I18N
            checked: "checked"  //NO I18N
        }, {
            key: 'XLS', //NO I18N
            name: translate('sdp.reports.customreport.xls'),    //NO I18N
            icon_class: 'attachment-sprite attach-xls',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'XLSX', //NO I18N
            name: translate('reports.customreport.xlsx'),    //NO I18N
            icon_class: 'attachment-sprite attach-xls',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'PDF', //NO I18N
            name: translate('sdp.reports.customreport.pdf'),    //NO I18N
            icon_class: 'attachment-sprite attach-pdf',  //NO I18N
            checked: ""  //NO I18N
        }, {
            key: 'CSV', //NO I18N
            name: translate('sdp.reports.customreport.csv'),    //NO I18N
            icon_class: 'attachment-sprite attach-file', //NO I18N
            checked: ""  //NO I18N
        }];
    },
    /**
     * Initiate export assets function
     * @param {*} options 
     */
    init: function (options) {
        const self = this;
        self.exportModal();
        self.context.info = translate('ae.mc.export.info.rowlimit');    //NO I18N
    },
    /**
     *
     * @param {object} options render the export popup
     */
    render: function (options) {
        const self = this,
              totalRecords = assetListView.tableObject.visibleContents.length || 0;
        if (totalRecords > 0) {
            if (assetListView.tableObject.t_obj.table_info.list_info.fields_required) {
                self.init(options);
                if (!jQuery("#exportlistview").length) { //No I18N
                    jQuery('body').append("<div id='exportlistview'></div>"); //NO I18N
                }
                self.context = jQuery.extend(true, self.context, options);
                const title = assetsObj.assetModTemplateData.metaDataWithoutId[assetsObj.module
                ].module_details ? assetsObj.assetModTemplateData.metaDataWithoutId[assetsObj.module].module_details.display_plural_name : translate("sdp.header.resources"); //NO I18N
                renderhbs('#exportlistview', 'export-view', this.context, false, 'common'); //No I18N
                jQuery("#export_listview").parent().next().attr("data-handler","exportListViews.closedialog()");
                jQuery("#exportlistview").dialog({ //No I18N
                    width: 500,
                    open: function () {
                        //adding dialog title here instead of using 'title' property in option, to display product type name as it is.
                        jQuery(this).prev('.ui-dialog-titlebar').find('.ui-dialog-title').html(translate("ae.cmdb.relationshipmap.helpcontent.Exportas")+" "+e_html(title));
                    },
                    close: function () {
                        jQuery(this).dialog("close").remove(); //NO I18N
                    }
                })
            }else {
                showalert('info',translate('ae.mc.export.invalidcolumns'), 'isAutoHide=true');   //NO I18N
            }
        }
    },
    /**
     *
     * @param {object} options option for exporting the list view
     */
    exportView: function (options) {
        const input_data = {
            "export": { //No I18N
                "format": options.type, //No I18N
            },
            "list_info": options.list_info //No I18N
        }
        if(options.title){
            input_data["export"]["title"] = options.title;
        }
        try {
            const link = document.createElement("a");
            const fileType = options.type.toLowerCase();
            link.download = (options.title ? options.title : Date.now()) + "."+fileType;
            link.href = "/api/v3/" + encodeHTMLAttribute(options.module) + "/export?" + sdpAjaxInputData(input_data);
            link.click();
            jQuery('#exportlistview').dialog('close'); //No I18N
        } catch (e) { }
    },
    closedialog: function() {
        jQuery('#exportlistview').dialog('close').remove(); //No I18N
    }
}
