"use strict";// No I18N
var assetFilter = {
    /**Basic Filter in Topmenu - for show and hide while clicking filters in asset list view page
     * @param {object} $this
     * @param {string} current
    */
    initFilter: function($this, current) {
        jQuery($this).toggleClass('btn-default btn-info'); //NO I18N
        if($this.classList.contains('btn-info')) {
            jQuery('[data-id='+current+']').slideDown();
            addPersonalization("asset_filter_toggle", true); //NO I18N
            assetListView.taskCompResize();
        } else {
            jQuery('[data-id='+current+']').slideUp();
            addPersonalization("asset_filter_toggle", false); //NO I18N
            assetListView.taskCompResize();
        }
    },
    /** cancel button actions - while clicking close button in asset list view page filters section 
     * @param {string} eleOneId
     * @param {string} eleTwoId
    */
    filtercancel: function(eleOneId,eleTwoId) {
        const filterBtn = document.querySelector('[data-id=' + eleTwoId + ']');//NO I18N
        jQuery('[data-id='+eleOneId+']').slideUp();
        if (filterBtn) {
            filterBtn.classList.remove('btn-info'); //NO I18N
            filterBtn.classList.add('btn-default'); //NO I18N
        }
    },
    /**Get what are the filters need to show based on module 
     * @param {string} module
     * @param {string} getCurrentModule
    */
    getFields: function (module,getCurrentModule) {
        const self = this;
        if(module == "modify_type") {
            return ["product_type_filter", "product_filter"];// No I18N
        }
        /**Only for request and maintenance modules */
        if (self.options && (self.options.for_request_maintenance || self.options.for_request)){
			var filtersToReturn=[];
			if(window.top.assetsObj.fiter_requester_id||window.top.assetsObj.fiter_department_id){
				filtersToReturn.push("owner_type_filter"); // No I18N
			}
			filtersToReturn.push("product_type_filter");
            /**Site filter camwe only site ias configured in admin page */
			if(sdp_app.IS_SITE_CONFIGURE){
				filtersToReturn.push("site_filter");
			}
			return filtersToReturn;
		}
        if (self.options && self.options.for_other_modules === true){
            return ["product_type_filter", "product_filter", "state_filter"]; // No I18N
        }
        
        const setModule = getCurrentModule ? getCurrentModule : module;
        const getHierarchyFromMeta = (module !== "asset_attachments" && module !== "asset_connections" && module !== "component_attachments" && assetsObj.assetModTemplateData.metaDataWithoutId[setModule].hasOwnProperty("hierarchy") && assetsObj.assetModTemplateData.metaDataWithoutId[setModule].hierarchy);// No I18N
        if (module == "asset_computers" || assetsObj.isComputerHierarchy(getHierarchyFromMeta)){
            return ["state_filter", "other_filter", "domain_filter"]; // No I18N
        }
        switch (module) {

            case "asset_attachments": // No I18N
            case "component_attachments": // No I18N
            case "asset_connections": // No I18N
                return ["product_type_filter", "product_filter", "state_filter"]; // No I18N
            case "modify_type":// No I18N
                return ["product_type_filter", "product_filter"];// No I18N
            default:
                return ["state_filter", "other_filter", "asset_product_filter"]; // No I18N
        }
    },
    /**Getting default value, url, field name and input data for filters based on module
     * @param {string} field
     * @returns
    */
    getSelect2Options: function (field) {
        const self = this;
        let options = {}, module = assetsObj.module || self.options.module,from;
        if(module=="asset_attachments" || module=="component_attachments" || module=="asset_connections" || module=="modify_type"){
            from = module;
            module = "asset_assets";// No I18N
        }
        switch (field) {
			case "owner_type_filter": // No I18N
				const owner_options = [
					{id: "1", text: translate("sdp.requests.selectasset.userasset.option.text")},
				];
				if(window.top.assetsObj.fiter_department_id){
					owner_options.push({id: "2",text: translate("sdp.requests.selectasset.deptasset.option.text")});
				}
			    options = {
                    placeholder: translate("sdp.common.search.allresources"), // No I18N
                    data: owner_options,
					allowClear: true,
					value : { id: "1", text: translate("sdp.requests.selectasset.userasset.option.text")}
                };
				break;
            case "site_filter":// No I18N
                options = {
                    placeholder: translate("sdp.admin.org.technician.allsite"),
                    urlToGet: encodeHTMLAttribute(module)+"/site" ,//NO I18N
                    field : "site"// No I18N
                };
                if(self.options.for_request_maintenance){
					options.urlToGet="request_maintenances/assets/site"; // No I18N
				}
				if(self.options.for_request){
					options.urlToGet="requests/assets/site"; // No I18N
				}
				options.options={};
                if(window.top.assetsObj.filter_site_id!='-1' && window.top.assetsObj.filter_site_id!='0' && window.top.assetsObj.filter_site_id!=null && window.top.assetsObj.filter_site_name){
					options.options.value={"id":window.top.assetsObj.filter_site_id,"text":window.top.assetsObj.filter_site_name}; // No I18N
				}
				if(sdp_user.USERTYPE=='Requester'){
					options.options.url=[{ "input_fields" : { "for":"assetpopup"}}]; // No I18N
				}
                break;
            case "product_filter":// No I18N
                options = {
                    placeholder: translate("common.newproduct"),
                    field : "product" //NO I18N
                };

                if(from == "modify_type" && !assetActions.options.isListView && jQuery("#product_type_filter_select2").select2("data")) {
                    let productId = assetDetailView.baseData.product.id;
                    let urlModule = jQuery("#product_type_filter_select2").select2("data").api_plural_name; // No I18N
                    options.urlToGet = encodeHTMLAttribute(urlModule)+'/product'; // No I18N
                    sdpAjax({
                        url: "/api/v3/"+options.urlToGet,// No I18N
                        async: false,
                        data: sdpAjaxInputData({
                            list_info: {
                                search_criteria: {
                                    "field" : "id",         // No I18N
                                    "condition" : "is",     // No I18N
                                    "value": productId             // No I18N
                                }
                            }
                        }),
                        success: function (response) {
                            var data = response.product[0];
                            if (data) {
                                options.options= {"value" : {"id": data.id, "text": data.name}}; // No I18N
                            }
                        },
                        ignorefailuremessage: true
                    });

                }else {
                    if(jQuery("#product_type_filter_select2").select2("data")){
                       let urlModule = jQuery("#product_type_filter_select2").select2("data").api_plural_name; // No I18N
                       options.urlToGet = encodeHTMLAttribute(urlModule)+"/product"; //NO I18N
                    }else{
                        options.urlToGet = encodeHTMLAttribute(module)+"/product"; //NO I18N
                        if(self.options.module == "component_attachments"){//NO I18N
                            options.list_info = {search_criteria : [{field: "asset_type.name" , condition: "is", value: "Component"}]}//NO I18N
                        }else if(self.options.module == "asset_attachments"){//NO I18N
                            options.list_info = {search_criteria : [{field: "asset_type.name" , condition: "is", value: "Asset"}]}//NO I18N
                        }
                    }
                }
                break;
            case "product_type_filter":// No I18N
                options = {
                    placeholder: translate("sdp.admin.product.listview.type"),
                    urlToGet: encodeHTMLAttribute(module)+"/module" ,//NO I18N
                    field : "module"// No I18N
                };
				if(self.options.for_request_maintenance){
					options.urlToGet="request_maintenances/assets/module"; // No I18N
				}
				if(self.options.for_request){
					options.urlToGet="requests/assets/module"; // No I18N
				}
                if(self.options.module == "component_attachments"){//NO I18N
                    options.list_info = {search_criteria : [{field: "asset_type.name" , condition: "is", value: "Component"}]}//NO I18N
                }else if(self.options.module == "asset_attachments"){//NO I18N
                    options.list_info = {search_criteria : [{field: "asset_type.name" , condition: "is", value: "Asset"}]}//NO I18N
                }
                break;
            case "other_filter": //NO I18N
                //below options will be appended to the state select2 options.
                const stateOptions = [
                    { text: translate("assetlistview.filter.allstates"), id: "all_states" },// No I18N
                    { text: translate("sdp.inventory.assetListViewAction.notInContractFilter"), id: "not_in_contract" },// No I18N
                    { text: translate("sdp.inventory.assetListViewAction.resourcesdisposed"), id: "disposed_assets" },// No I18N
                    { text: translate("sdp.inventory.assetListViewAction.leasedAssetsFilter"), id: "is_loaned" },// No I18N
                    { text: translate("sdp.inventory.assets.views.unassigned"), id: "unassigned" },// No I18N
                    {
                        text: translate("sdp.depreciation.Depreciation"), // No I18N
                        children : [
                            { text: translate("sdp.inventory.assetListViewAction.depreciationConfiguredAsset"), id: "depreciated_assets" },// No I18N
                            { text: translate("sdp.inventory.assetListViewAction.depreciationNotConfiguredAsset"), id: "unaccounted_assets" }// No I18N
                        ]
                    }
                ];
                options = {
                    placeholder: translate("sdp.common.search.allresources"), // No I18N
                    data: stateOptions,
                    allowClear: true
                };
                break;
            case "state_filter":// No I18N
                options = {
                    placeholder: translate("ae.wsListView.filter.allStates"), // No I18N
                    urlToGet: encodeHTMLAttribute(module)+"/state", //NO I18N
                    field: "state", // No I18N
                    list_info: { sort_field: "id", sort_order: "asc",search_criteria: [{ field: "name", condition: "is not", value: "Disposed" }] } // No I18N
                };
                break;
            case "domain_filter":// No I18N
               options = {
                    placeholder: translate("sdp.inventory.notindomain"),
                    urlToGet: encodeHTMLAttribute(module)+"/domain", //NO I18N
                    field: "domain"//No I18N
                };
                break;
            case "virtual_server_types":// No I18N
                options = {
                    placeholder: translate("sdp.inventory.asset.vmlistview.selecttype"),
                    urlToGet: "asset_computers/vm_platform", //NO I18N
                    field : "vm_platform" //NO I18N
                };
                break;
            case "asset_product_filter":// No I18N
                const typeId = assetsObj.type_id;
                //TODO:  store type id in assetsObj.
                const getCurrModMetaData = (module === "asset_attachments" || module === "asset_connections" || module === "component_attachments") ? assetsObj.assetModTemplateData.metaDataWithoutId["asset_assets"] : assetsObj.assetModTemplateData.metaDataWithoutId[module];// No I18N
                
                options = {
                    placeholder: translate("form.select.all.placeholder", [getCurrModMetaData && getCurrModMetaData.module_details.display_plural_name != "Assets" ? getCurrModMetaData.module_details.display_plural_name : translate("sdp.admin.productvendor.listview.products")]),
                    urlToGet: encodeHTMLAttribute(module)+"/product",// No I18N
                    field: 'product',// No I18N
                    //list_info: typeId ? { search_criteria: [{ field: "product_type.id", condition: "is", value: typeId } ]} : undefined// No I18N
                }
                break;
        }
        if(!options.width) {
            options.width = "250";
        }

        if (field !== "state_filter" && field !== "owner_type_filter" && field !== "site_filter" && (module === "asset_attachments" || module === "component_attachments")) {
            const type = module === "component_attachments" ? "component" : "asset";// No I18N

            options.list_info = { "search_criteria":// No I18N
                [{ "field": "asset_type.name", "condition": "is", "value": type }]// No I18N
             };
            if (field === "product_type_filter") {
                options.urlToGet = "asset_assets/product_type";// No I18N
                options.field = "product_type";// No I18N
				if(self.options.for_request_maintenance){
					options.urlToGet="request_maintenances/assets/product_type"; // No I18N
				}
				if(self.options.for_request){
					options.urlToGet="requests/assets/product_type"; // No I18N
				}
            } else if (field === "product_filter") {// No I18N
                options.urlToGet = "asset_assets/product";// No I18N
                options.field = "product";// No I18N
            }
        }

        return options;
    },
    /**Render select dropdown for filters
     * @param {object} fields
     * @param {string} id
     * @param {Boolean} hasClose
     */
    loadElements: function (fields, id, hasClose) {
        const container = jQuery("#" + id);
        let elements;
        const self = this.loadElements;

        if(self[id]) { //already loaded.
            return;
        }

        container.empty();

        self[id] = true;

        elements = fields.map(function (field) {
            return `<input class="form-control disp-ib mr20" id="${field}_select2"/>`;
        });

        container.append(elements);
        /**Append close button in filters section if asset listview page  */
        if(hasClose) {
            container.append(`<a class="btn btn-link btn-xs" id="asset-filter-clear-btn" href="/"><span class="cspr close2 icon-xs" title="${translate("sdp.common.close")}" data-id="linkover"></span></a>`);

            jQuery("#asset-filter-clear-btn").on("click", function (e) {
                addPersonalization("asset_filter_toggle", false);//No I18N
                assetFilter.cancelSearch();
                assetListView.taskCompResize();
            });
        }
    },
    /**Load by getting filter options based on module 
     * @param {object} options
    */
    loadFilter: function(options) {
        const self = this;
        const getCurrentModule = options.hasOwnProperty("currentModule") ? options.currentModule : null;//No I18N
        const fields = self.getFields(options.module,getCurrentModule);

        self.loadElements(fields, options.container, options.hasClose);

        fields.forEach(function (field) {
            self.loadSelect2(options, field);
        });
    },
    /**Construct all select2 dropdown options and pass it to select2 function availed in AssetActions.js to render jquery dropdown 
     * @param {object} options
     * @param {string} field
    */
    loadSelect2: function (options, field) {
        const getOptions = options.getSelect2Options ? options.getSelect2Options(field) : assetFilter.getSelect2Options(field);

        if(field == 'product_type_filter') {
            const hierarchyOptions = {
                url: "/api/v3/"+getOptions.urlToGet, //No I18N
                entity: "module", //No I18N
                id : field+"_select2", //No I18N
                allowClear: true,
                formatResult: function(data){
                    return e_html(data.display_name)
                },
                formatSelection: function(data){
                    return e_html(data.display_name)
                },
                events: {
                    change: function (e) {
                        self.filterData.product_type = e.id;
                        self.filter();
                        self.personalizeFilter();
                    }
                },
                dropdownCssClass: "s2-custom-p0 text-wrap" // No I18N
            }
            const allOptions = jQuery.extend(false, getOptions, hierarchyOptions);
            return hierarchySelect2.init(allOptions);
        }

        if(getOptions.urlToGet) {
            return assetActions.select2(getOptions, field, getOptions.field);
        }
        return jQuery("#" + field + "_select2").select2(getOptions);
    },
    /**Check field key value from selected options in Virtual hosts module from VM types 
     * @param {string} field
     * @returns
    */
    getValue: function (field) {
        const criteria = assetFilter.fieldsCriteria;
        for (let key in criteria) {
            var data = criteria[key];
            if (data.field === field) {
                return assetFilter.getFieldValue(key);
            }
        }
    },
    /**Get selected data in all filters and pass it in data eg:[dynamic: "disposed",state.id: "",vm_platform.id: "3"] */
    getFieldsData: function () {
        let criteria = assetFilter.fieldsCriteria, data = {};

        for (let key in criteria) {
            data[criteria[key].field] = assetFilter.getFieldValue(key);
        }

        return data;
    },
    /**Get selected filter value from dropdown 
     * @param {string} field
    */
    getFieldValue: function(field) {
        return jQuery("#" + field + "_select2").val();
    },
    /** Set selected value for all fields to render listview based on search criteria - passed selected fields with their values
     * @param {object} criteria
     * @param {Array} fieldIds
     * @returns
    */
    getData: function(criteria, fieldIds) {
        let values = {};

        //set value for the given field.
        let setValue = (id) => {
            const value = assetFilter.getFieldValue(id);

            if(value) {
				if(id=="owner_type_filter"){
					if(value=="1"){
						values["user.id"]= window.top.assetsObj.fiter_requester_id;
					}
					else if(value=="2"){
						values["department.id"]=window.top.assetsObj.fiter_department_id;
					}
				}
				else{
                values[criteria[id].field] = value;
				}
            }
        }

        fieldIds.forEach(function (key) {
            setValue(key);
        });
        return values;
    },
    /**Initiate while changing dropdown options 
     * @param {object} criteria
     * @param {Array} fieldIds
     * @param {Function} callback
     * @param {*} field
    */
    initSearch: function (criteria, fieldIds, callback, field) {
        const self = this,
              values = self.getData(criteria, fieldIds);

        if(callback) {
            callback(values, field);
        } else {
            self.search(values);
        }
    },
    /**Get field name for search_criteria for select2 
     * @param {object} options
    */
    initEvent: function(options) {
        const self = this,
              module = options.module;
        assetsObj.filter_value = [];
        const criteria = {
            product_type_filter: {
                field: "module.id" //NO I18N
            },
            product_filter: {
                field: "product.id" //NO I18N
            },
            state_filter: {
                field: "state.id" //NO I18N
            },
			owner_type_filter: {
                field: "user.id" //NO I18N
            },
			site_filter: {
                field: "site.id" //NO I18N
            },
            domain_filter: {
                field: "domain.id" //NO I18N
            },
            product_type_filter: {
                field: "module.id" //NO I18N
            },
            asset_product_filter: {
                field: "product.id"// No I18N
            },
            virtual_server_types: {
                field: "vm_platform.id"// No I18N
            },
            other_filter: {
                field: "dynamic"//NO I18N
            }
        }

        const fields = self.getFields(module,options.currentModule);
        let fieldsCriteria = {};

        fields.forEach(function (field) {
            fieldsCriteria[field] = criteria[field];
        });

        self.fieldsCriteria = fieldsCriteria;

        fields.forEach(function (field) {
            jQuery("#" + field + "_select2").off("change").on("change", function(e) {
                self.initSearch(fieldsCriteria, fields, options.callback, field);
                /**Store field name and value to retain asset filter after render from details page */
                if(self.options.container=="nf_container"){
                    let tempObj = {};
                    tempObj[field] = field;
                    tempObj[fieldsCriteria[field].field] = jQuery(this).select2("data");
                    assetsObj.filter_value && assetsObj.filter_value.push(tempObj);
                }
                /**End */
            });
        });

    },
    /**Initiate filter in listview 
     * @param {object} options
     * @param {object} listview
    */
    init: function(options,listview) {
        const self = this,
              filter_personalize = sdp_user.CLIENT_CONF.asset_filter_toggle;

        self.options = options;
        self.listview = listview;
        self.loadFilter(options);
        jQuery.ready(this.initEvent(options));
        if(filter_personalize === "false" || filter_personalize === false){
            const parentElement = jQuery("#asset-list-view");
            parentElement.find('[data-id=nrfilter]').removeClass('btn-info').end() //NO I18N
                         .find('[data-id=nrfilter]').addClass('btn-default').end() //NO I18N
                         .find('[data-id=normal-filter]').slideUp();
            assetListView.taskCompResize();
        }
    },
    /** Get additonal criteria for (Other assets dropdown) selected option in dropdown eg: If we selection unassigned option in dropdown need to give additional criteria with 'user,state.name,department and used_by_asset' 
     * @param {string} id
     * @return
    */
    getAdditionalOption: function(id) {
        let search_criteria;
        switch (id) {
            case "not_in_contract"://NO I18N
            case "disposed_assets"://NO I18N
            case "unaccounted_assets"://NO I18N
            case "depreciated_assets"://NO I18N
                return {
                    asset_filter_by: { name: id }
                }
            case "all_states"://NO I18N
                return {
                    asset_filter_by: {name :"all_states" } //NO I18N
                }
            case "is_loaned"://NO I18N
                search_criteria = {
                    "field": "loan_end",//NO I18N
                    "condition": "is not",//NO I18N
                    "value": null //NO I18N
                }
                break;
            case "unassigned"://NO I18N
                search_criteria = [
                    { "field": "user", condition: "is", value: null, "logical_operator": "and"},//NO I18N
                    {"field": "state.name",values: ["disposed", "expired"],condition: "is_not","logical_operator":"and"}, //NO I18N
                    {"field":"department","condition":"is","value":null,"logical_operator":"and"}, //NO I18N
                    {"field":"used_by_asset","condition":"is","value":null,"logical_operator":"and"}//NO I18N
                ]
                break;
            default:
                return {};
        }

        if(search_criteria) {
            if(!Array.isArray(search_criteria)){
                search_criteria.logical_operator = "AND";//NO I18N
            }
            return {
                "search_criteria": search_criteria//NO I18N
            }
        }
    },
    /**Criteria is available in assetlistvew page 
     * @param {object} criteria
     * @returns
    */
    getSearchCriteria: function(criteria) {
        let module = this.options ? this.options.module : assetListView.module;
    
        if(assetsObj.module === "asset_attachments" && !assetActions.attachment.isAttached) {
            module = assetsObj.module;
        }
        return assetFilter.listview.getsearchCriteria(module, criteria);
    },
    /**Execute function while removing selecting filter options
     * @param {object} list_info
     * @param {Function} callback
     * @returns
     */
    removeFilterBy: function (list_info, callback) {
        const self = this;

        if (!list_info.asset_filter_by) {
            return false;
        }
        
        let data = assetFilter.getFieldsData();

        if (data.hasOwnProperty("vm_platform.id") && callback(self.getValue("vm_platform.id"))) {
            delete list_info.asset_filter_by.id;
            delete list_info.asset_filter_by.name;
        }
        if (list_info.asset_filter_by.name === "all_states") {
            delete list_info.asset_filter_by.name;
        }
        return true;
    },
    /**Used to get addtional criteria by searching field value while selecting options in filters  
     * @param {object} search_object
    */
    search: function(search_object) {
        const self = this;
        (typeof assetFilter.listview=='undefined') && (assetFilter.listview=assetListView);
        /**Getiing current list_info */
        let list_info = assetFilter && assetFilter.listview && assetFilter.listview.tableObject && assetFilter.listview.tableObject.t_obj.table_info.list_info,
            criteria = [];

        delete list_info.search_fields;
        self.removeFilterBy(list_info, function (value) { return value === ""; });

        if (list_info.asset_filter_by && (list_info.asset_filter_by.name == "disposed_assets" || list_info.asset_filter_by.name === "not_in_contract")){//NO I18N
            if(list_info.asset_filter_by.id){
              delete list_info.asset_filter_by.name;
            }else{
              delete list_info.asset_filter_by;
            }
        }
        assetFilter.listview.filter_criteria = null;
        jQuery.each(search_object, function(search_field, value){
            if(value){
                /**Get additional criteria fornother assets only  */
                const option = assetFilter.getAdditionalOption(value);
                if (option.asset_filter_by) {
                    list_info.asset_filter_by = list_info.asset_filter_by || {};
                    list_info.asset_filter_by.name = option.asset_filter_by.name;
                } else if(option.search_criteria) {
                    /**concat critera already availed with additional criteria */
                    if(Array.isArray(option.search_criteria)){
                        criteria = criteria.concat(option.search_criteria);
                    }else{
                        criteria.push(option.search_criteria);
                    }
                    assetFilter.listview.filter_criteria = criteria;
                } 
                /**these are criteria for value as ids as per api so we used by using field name */
                else if (search_field == "vm_platform.id") {//NO I18N
                    if (assetsObj.module === "asset_computers") {
                        criteria.push({ field: "vm_platform.id", condition: "is", value: value });
                    } else {
                        if (list_info.asset_filter_by) {
                            list_info.asset_filter_by.name = "vm_server_type";//NO I18N
                            list_info.asset_filter_by.id = value;
                        } else {
                          list_info.asset_filter_by = { id: value, name: "vm_server_type" };//NO I18N
                        }
                    }
                } else if (search_field == "state.id" && value == "5"){//NO I18N
                    if(list_info.asset_filter_by){
                      list_info.asset_filter_by.name = "disposed_assets";//NO I18N
                    }else{
                      list_info.asset_filter_by = {"name":"disposed_assets"};//NO I18N
                    }
                }else if(search_field == "site.id" && value == "-1"){ // No I18N
                    criteria.push({"field": "site" ,"condition": "is" ,"value": null, "logical_operator": "AND"}); // No I18N
                    assetFilter.listview.filter_criteria = criteria;
                }else{
                    criteria.push({"field": search_field ,"condition": "is" ,"value": value, "logical_operator": "AND"}); // No I18N
                    assetFilter.listview.filter_criteria = criteria;
                }
                /**Added for calculated assets filter */
                if (!search_object.hasOwnProperty("dynamic") && !option.hasOwnProperty("asset_filter_by")) {
                    delete list_info.asset_filter_by;
                }
                 /**End */
            }
        });
        /**Added for calculated assets filter */
        if(Object.keys(search_object).length==0){
            delete assetFilter.listview.tableObject.t_obj.table_info.list_info.asset_filter_by;
        }
        /**End */
        const searchCriteriaLoc = assetFilter.getSearchCriteria(criteria);
        assetFilter.listview.tableObject.setDefaultSearchCriteria(searchCriteriaLoc);
        list_info.search_criteria = assetsObj.filter_criteria_data = searchCriteriaLoc;
        assetFilter.listview.tableObject.refreshTable("search"); // No I18N
        assetFilter.listview.tableObject.changeFilterString('clearOnly'); // No I18N
    },
    /**Selected data clear while clicking close button in filters section 
     * @param {string} action
    */
    cancelSearch: function(action) {
        const self = this;
        if(action != "clearfilter"){
            (typeof assetFilter.listview=='undefined') && (assetFilter.listview=assetListView);
            let listInfo = {};
            let list_info = listInfo = assetFilter.listview.tableObject.t_obj.table_info.list_info;
                if(list_info.asset_filter_by){
                    assetFilter.removeFilterBy(listInfo, function () { return true; });
                    if (list_info.asset_filter_by.name != "disposed_assets" && list_info.asset_filter_by.name !== "not_in_contract"){
                    listInfo.asset_filter_by = list_info.asset_filter_by;
                  }else{
                    delete list_info.asset_filter_by.name;
                    if(!jQuery.isEmptyObject(list_info.asset_filter_by)){
                        listInfo.asset_filter_by = list_info.asset_filter_by;
                    }
                  }
                }
            const searchCriteriaLoc = assetFilter.getSearchCriteria();
                listInfo.search_criteria = searchCriteriaLoc;
                assetListView.tableObject.t_obj.default_search_criteria = assetFilter.listview.filter_criteria = assetsObj.filter_value = null;
                assetListView.tableObject.t_obj.table_info.list_info = assetFilter.listview.tableObject.t_obj.table_info.list_info = listInfo;
                assetFilter.listview.tableObject.refreshTable("search"); // No I18N
                assetFilter.listview.tableObject.changeFilterString("clearOnly"); // No I18N
        }
        const fields = assetFilter.getFields(assetsObj.module);

        fields.forEach(function (field) {
            jQuery("#" + field + "_select2").select2("val", ""); //NO I18N
        });

        self.filtercancel('normal-filter','nrfilter'); //NO I18N
        self.options && self.options.resetCallback && self.options.resetCallback();
    }
};
