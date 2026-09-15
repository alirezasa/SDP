/* $Id$ */
"use strict";//NO I18N
var assetFormView  = {
    /** Initialize  form 
     * @param {Object} options
    */
    init : function(options) {
        const self = this;
        self.getSiteAllowedVal = [];
        /**While clicking edit - button By default we passed parameters id and module name */
        self.id = options.id;
        /**While bulk edit - Set key in assetsObj to find form need to opens in popup i.e bulk edit*/
        self.isBulkEdit = assetsObj.isPopup || false;
        self.fromPage = options.fromPage;
        if(!options.id && self.isBulkEdit){
            /**Get bulkedit ids in array*/
            const strArray = assetsObj.bulkEditIds.split(",");
            /**If array length is 1 we need to show selected asset in edit page with all data so we set this id in options.id*/
            if(strArray.length===1){
                options.id=strArray[0];
            }
        }
        let metaData = null;
        const getAssetModuleMeta = assetsObj.assetModTemplateData.metaDataWithoutId;
        if(options.id){
            const getCurrentAssetMeta = assetsObj.assetModTemplateData.metaDataWithId;
            if(getCurrentAssetMeta.hasOwnProperty(options.id)){
                metaData = jQuery.extend(true, {}, getCurrentAssetMeta[options.id]);
            }else{
                if(getAssetModuleMeta.hasOwnProperty(options.api_plural_name)){
                    const inputData = {"include":["links","tabs","meta_info"],"add_recent_item":true}  // No I18N
                    getCurrentAssetMeta[options.id] = assetsObj.getAssetMetaData(options.api_plural_name,options.id,inputData);
                    assetsObj.setLayoutDetails(options.api_plural_name,options.id);
                    metaData = jQuery.extend(true, {}, getCurrentAssetMeta[options.id]);
                }else{
                    metaData = assetsObj.getAssetMetaData(options.api_plural_name);
                }
                
            }
        }else{
            if(getAssetModuleMeta.hasOwnProperty(options.api_plural_name)){
                metaData = jQuery.extend(true, {}, getAssetModuleMeta[options.api_plural_name]);
            }else{
                metaData = assetsObj.getAssetMetaData(options.api_plural_name);
            }
        }

        if(!metaData.layout || Object.keys(metaData.layout).length==0){
            self.forEmptyLayoutInfo(metaData);
        }else{
            if(options.id) {
                /**Execute  this function for asset edit page */
                self.renderAssetEditForm(options,metaData);
            } else {
                 /**Execute  this function for asset add new page */
                 self.renderAssetNewForm(options,metaData);
            }
        }
        self.formPageHeaderSection(options.id);
        /**To set asset value for edit page in browser title  */
        jQuery("#browserTitleInfo").find("#bt_id").text(assetFormView.editId).end().find("#bt_title").text(assetFormView.data.name);// No I18N
        applyBrowserTitle();
    },
    /**
     * Render template by removing unwanted fields or (bulk edit - unique fields) 
     * @param {Object} options 
     * @param {Object} metaData 
     */
    renderAssetNewForm : function(options,metaData) {
        const self = this;
        /**If layout is empty it shows info message */
        self.productType = metaData.module_details;
        /**For bulk edit assets from listview */
        if(self.isBulkEdit){
            metaData = self.removeUniqueFieldsForBulkEdit(metaData);
        }
        options.metainfo = metaData.metainfo;
        options.layouts = [metaData.layout];
       
        options.entity_name = metaData ? (metaData.module_details ? metaData.module_details.api_name : '') : '';
        options.data = {};
        self.renderAssetTemplate(options);
    },
    /**
     * Render form for edit page by fetch data from server
     * @param {Object} options 
     * @param {Object} metaData 
     */
    renderAssetEditForm : function (options,metaData) {
        const self = this,
              assetMetaData = metaData,
              getAssetModuleName = assetMetaData.module_details.name;
              
        options.api_plural_name = options.api_plural_name || assetsObj.module;
        /**Common function to render template */
        const getDataForUpdate = (getAssetData) => {
            self.basicData = getAssetData[getAssetModuleName];
            self.productType = assetsObj.productType =  self.basicData.module;
    
            /**Set values in options */
            options.api_plural_name = self.productType.api_plural_name;
            options.typeid = self.productType.id;
            options.entity_name = self.productType.api_name;
            options.data = self.basicData;
            /**Construct loan start and end date in from and to range format */
            if(options.data.loan_start && assetsObj.isAssignOwnerPopup){
                const consLoanDateRange = [options.data.loan_start,options.data.loan_end];
                options.data.loan_period = consLoanDateRange;
            }
            
            options.metainfo = assetMetaData.metainfo;
            options.layouts = [assetMetaData.layout];
            self.renderAssetTemplate(options);
        }

        /**If data is already available in asset*/
        
        if(assetMetaData.hasOwnProperty(getAssetModuleName) && assetMetaData[getAssetModuleName] && assetMetaData[getAssetModuleName].hasOwnProperty("id")){
            getDataForUpdate(assetMetaData);
        }else{
            self.fetchBasicData(options).then(function (response) {
                getDataForUpdate(response);
            }, function (response) {
                /**For failure it throws error message and redirect to listview */
                let msg = "";
                try {
                    msg = response.responseJSON.response_status.messages[0].message;
                } catch(e) {}
                showalert("failure", msg || translate("sdp.inventory.assetDefAction.noAsset"), "isAutoHide=false"); // No I18N
                assetsObj.redirectToEntityList(assetsObj.module); 
            });
        }
       
        
    },
    /**
     * Render info message if layout is empty
     */
    forEmptyLayoutInfo : function(){
        const contentHeight = jQuery('#content').height(),
            parentEle = jQuery('#asset-form-container');
            /**Append info message */
            parentEle.append(`<div class="p20 pb0"><div class="alert alert-info icon" role="alert"><span class="msg">${translate("sdp.common.mail.contactAdmin")}</span></div></div>`).css("height",contentHeight+"px");//NO I18N
    },
    /**
     * Initiate asset form header panel - eg:Edit <module name>
     * @param {Integer} editId 
     */
    formPageHeaderSection : function(editId){
        const self = this,
              headerCondition = assetsObj.isAssignOwnerPopup ? !assetsObj.isAssignOwnerPopup : (!self.isBulkEdit) ? true : false;
        
        if(headerCondition){
            const getAssetModuleMeta = assetsObj.assetModTemplateData.metaDataWithoutId,
                  getCurrentAssetMeta = assetsObj.assetModTemplateData.metaDataWithId,
                  assetDisplayName = getCurrentAssetMeta.hasOwnProperty(self.id) ? getCurrentAssetMeta[self.id].module_details.display_name : getAssetModuleMeta[assetsObj.module].module_details.display_name;
            
            renderhbs("#asset-header","asset-form-template",{//NO I18N
                isEdit: !!editId,
                assetName: e_html(assetDisplayName),
                isFormHeader : true,
                getFromPage : this.fromPage,
                entityid : self.id,
                module : assetsObj.list_module ? assetsObj.list_module : assetsObj.module
            },false,"assets");//NO I18N
            jQuery("#asset-header").removeClass("hide");
        }else{
            jQuery("#asset-header").addClass("hide");
        }
        
    },
    /**
     * Remove unique fields from metainfo and layouts for bulk edit action 
     * @param {Object} metaData 
     * @returns 
     */
    removeUniqueFieldsForBulkEdit : function(metaData){
        const self = this;
        const metaInfo = metaData.metainfo.fields,
            storeLayoutIndex = [],
            storeLayoutReferrer = [];
            metaInfo.product && delete metaInfo.product;
            /**remove one to many sections from layouts for bulk edit  */
            const metaLayoutSections = metaData.layout.sections;
            metaLayoutSections.forEach(function(section,index) {
                if(section.is_subform){
                    storeLayoutIndex.push(index);
                    storeLayoutReferrer.push(section.attributes.referrer);
                }
            });
            /**For splice array used reverse function to reverse an array */
            const reversedLayoutArr = storeLayoutIndex.reverse();
            reversedLayoutArr.forEach(function(fieldIndex){
                metaLayoutSections.splice(fieldIndex,1);
            });
            metaLayoutSections.forEach(function(section,index) {
                self.removeUniqueField("unique",section.fields); // No I18N
            });
            self.removeField("unique",metaInfo);// No I18N
            self.removeAttribute("mandatory",metaInfo);// No I18N
            !assetsObj.isAssignOwnerPopup && self.removeAttribute("default_value",metaInfo);// No I18N
            delete metaInfo.is_remote_control_prompt_enabled;
            return metaData;
    },
    /**
     * Remove unique fields from metainfo for bulk edit
     * @param {string} attributeName 
     * @param {Object} fieldsObject 
     */
    removeUniqueField : function(attributeName, fieldsObject){
        var getIndex = [];
        jQuery.each(fieldsObject,function(fieldName, fieldValue){
            if(fieldValue.hasOwnProperty(attributeName) && fieldValue[attributeName]){
                getIndex.push(fieldName);
            }
        });
        getIndex = getIndex.reverse();
        getIndex.forEach(function(ind){
            fieldsObject.splice(ind,1);
        });
    },
    /**
     * Remove fields in which are unique key is available from metainfo and layouts sections
     * @param {string} attributeName 
     * @param {Object} fieldsObject 
     */
    removeField : function(attributeName, fieldsObject){
        const self = this;
        jQuery.each(fieldsObject,function(fieldName, fieldValue){
            if(fieldValue.hasOwnProperty(attributeName) && fieldValue[attributeName]){
                delete fieldsObject[fieldName];
            }
            else{
                if(fieldValue.hasOwnProperty('fields')){
                    self.removeField(attributeName, fieldValue.fields);
                }
            }
        });
    },
    /**
     * Remove fields in which are mandatory key is available from metainfo and layouts sections
     * @param {string} attributeName 
     * @param {Object} fieldsObject 
     */
    removeAttribute : function(attributeName, fieldsObject){
        const self = this;
        jQuery.each(fieldsObject,function(fieldName, fieldValue){
            if(fieldValue.hasOwnProperty(attributeName)){
                delete fieldValue[attributeName];
            }
            if(fieldValue.hasOwnProperty('fields')){
                self.removeAttribute(attributeName, fieldValue.fields);
            }
        });
    },
    /**
     * Fetch basic data for edit page
     * @param {Object} options 
     * @returns 
     */
    fetchBasicData : function (options) {
        return sdpAjax({
            url: "/api/v3/" + encodeHTMLAttribute(options.api_plural_name) + "/" + options.id// No I18N
        });
    },
    /**
     * Render header template in add/edit form and initiate template for fields
     * @param {Object} options 
     */
    renderAssetTemplate : function(options) {
        const self = this;
        self.metainfo = options.metainfo;
        self.data = options.data;
        
        /**Need to add from server side */
        if(assetsObj.isAssignOwnerPopup){
            const getMetainfoFlds =  self.metainfo.fields;
            getMetainfoFlds.loan_end.type="datetimerange";// No I18N
            getMetainfoFlds.loan_start.type="datetimerange";// No I18N
            getMetainfoFlds.loan_period = getMetainfoFlds.loan_start;
            getMetainfoFlds.loan_period.display_name = translate("common.loan.period");
            delete getMetainfoFlds.loan_start;
            delete getMetainfoFlds.loan_end;
        }
        self.metainfo.fields.is_loanable.help_text = translate('asset.assign.owner.isloanable.isfalse');
        /**Initialize form comonent data */
        self.initForm(options);
    },
    /**
     * Construct json for Loading template using form component
     * @param {Object} options 
     */
    initForm : function(options) {
        const self = this;
        self.editId = options.id && (options.id!="null") ? options.id : null;//NO I18N
        const getNewFormData = options.layouts,
              templateRC = self.constructTemplateInfo(getNewFormData),
              saveURL = self.isBulkEdit ? "/api/v3/"+encodeHTMLAttribute(options.api_plural_name)+"?ids="+assetsObj.bulkEditIds : "/api/v3/"+encodeHTMLAttribute(options.api_plural_name),// No I18N
              saveOrUpdateBtn = self.isBulkEdit ? "sdp.common.update" : "sdp.common.save";//NO I18N
        
        const memoryValidationRules = { //NO I18N
            custom_rules: [
                {"rule_name": "memoryLimitValidation", "rule_value": true}   //NO I18N
            ]
        };
        let configJSON = {
            name: "assetForm",// No I18N
            entity: options.entity_name,
            entitypath: self.editId ? "/"+ encodeHTMLAttribute(options.api_plural_name) + "/" + self.editId : "/" + encodeHTMLAttribute(options.api_plural_name),// No I18N
            template: templateRC,
            metadata: jQuery.extend(true, {}, self.metainfo),
            //skipEditFields: skipEditFields,
            entitydata: self.editId ? (options.data || templateRC) : null,
            mode:(self.editId || self.isBulkEdit) ? "edit" : "new",// No I18N
            container: "asset-form-container",// No I18N
            formid: "assetForm",// No I18N
            inlineImagesEntity: options.entity_name,
            customform: true,
            showLoader:true,
            noCacheFields: ["virtual_machines.virtual_machine"], //NO I18N
            edit: {
                fields: {
                    state:{
                        allowClear: self.isBulkEdit ? true : false,
                        processResults:function(search_data,data){  
                            search_data.push({
		                        id: data.id,
		                        name: data.name,
                                is_ownership_mandatory : data.is_ownership_mandatory,
                                is_ownership_allowed : data.is_ownership_allowed,
                                is_loanable_state : data.is_loanable_state,
                                is_attach_asset_allowed : data.is_attach_asset_allowed
		                    });   
                        }
                    },
                    used_by_asset:{
                        list_info:{fields_required:["id","name","site","department","user"]},// No I18N
                        processResults:function(search_data,data){  
                            search_data.push({
		                        id: data.id,
		                        name: data.name,
                                site : data.site,
                                department : data.department,
                                user : data.user
		                    });   
                        },
                        input_data_Callback:function(urlOptions,input_data){
                            var id = assetFormView.data.id;
                            var ids = id ? id.split("=")[1] : undefined;
                            var idArr = ids ? ids.split(",") : []; 
                            var searchCriteria =  !id  ? [] : (idArr.length == 0 ? 
                                [{
                                    field: "id",//NO I18N
                                    condition: "is not",//NO I18N
                                    value: id,
                                    logical_operator: "AND"//No I18N
                                }]      
                                : 
                               [{
                                    field: "id",//NO I18N
                                    condition: "not in",//NO I18N
                                    values: idArr,
                                    logical_operator: "AND"//No I18N
                                }]
                            );
                           
                            const isDepartmentInitialized = jQuery("#assetform-section").find('[name="department"]').select2("data");// No I18N
                            const isUserInitialized = jQuery("#assetform-section").find('[name="user"]').select2("data");// No I18N
                            
                            if(isDepartmentInitialized && isUserInitialized) {
                                const departmentCriteria = [{ field: "department", condition: "is", value: isDepartmentInitialized.id, "logical_operator": "AND" },{ field: "user", condition: "is", value: isUserInitialized.id, "logical_operator": "AND" }];// No I18N
                                searchCriteria.length>0 ? (searchCriteria = searchCriteria.concat(departmentCriteria)) : searchCriteria=departmentCriteria;
                            }else if(isUserInitialized) {
                                const userCriteria = { field: "user", condition: "is", value: isUserInitialized.id, "logical_operator": "AND" };// No I18N
                                searchCriteria.push(userCriteria);
                            }else if(isDepartmentInitialized) {
                                const departmentCriteria = { field: "department", condition: "is", value: isDepartmentInitialized.id, "logical_operator": "AND" };// No I18N
                                searchCriteria.push(departmentCriteria);
                            }
                            const listInfo = input_data.list_info;
                            if(listInfo.search_criteria && listInfo.search_criteria.length>0){
                                listInfo.search_criteria[0].logical_operator = "AND"
                                listInfo.search_criteria = listInfo.search_criteria.concat(searchCriteria);
                            }else{
                                listInfo.search_criteria = searchCriteria;
                            }
                          
                            return input_data;
                        }
                    },
                    department:{
                        input_data_Callback:function(urlOptions,input_data,searchText){
                            const listInfo = input_data.list_info;
                            if(listInfo && listInfo.search_criteria && listInfo.search_criteria.length>0){
                                listInfo.search_criteria.push(
                                    {"field":"site.name","condition":"like","values":[searchText],"logical_operator":"or"}// No I18N
                                )
                            }
                            return input_data;
                        },
                        processResults:function(search_data,data){  
                            search_data.push({
		                        id: data.id,
		                        name: data.name,
                                site : data.site
		                    });   
                        },
			            placeholder:translate("sdp.inventory.workstations.listview.nojustselectusermsg")
                    },
                    user:{
                        list_info:{fields_required:["id","name","site","department","email_id","employee_id"]},// No I18N
                        select2Type: "user",// No I18N
                        select2Opts: {
                            url:"/api/v3"+self.metainfo.fields.user.href, //No I18N
                            entity_name:"user", //No I18N
                            searchOptions: removeUserRestrictedFields(["name", "email_id","employee_id","login_name"]), // No I18N
                            placeHolder:translate("sdp.inventory.workstations.listview.nojustselectdepartmentmsg"),
                            tooltip: true,
                            showAll: ["email_id", "department", "employee_id", "name"], // No I18N
                            showNameOnly : false,
                            isAPI: true,
                            criteriaCallback:function(searchText, criteria){
                                const departmentElement = jQuery("#assetform-section").find('[name="department"]');
                                let department = null;
                                const isDepartmentInitialized = departmentElement.select2("data");// No I18N

                                if(isDepartmentInitialized) {
                                    department = departmentElement.select2("data");// No I18N
                                }

                                if((!$relform.fields.values.is_loanable  || !$relform.fields.state.current_value.is_loanable_state) && department) {
                                    let departmentCriteria = { field: "department", condition: "is", value: department.id, "logical_operator": "AND" };// No I18N
                                    if (criteria.children) {
                                        departmentCriteria.children = [];
                                        departmentCriteria.children = criteria.children || [];
                                        criteria.children = undefined;
                                        departmentCriteria.children.push(criteria);
                                        departmentCriteria.children[0].logical_operator = 'AND';
                                    }
                                    return departmentCriteria;
                                }

                                if(jQuery.isEmptyObject(criteria)) return;
                                return criteria;
                            },
                            getFormatResultFn:function(data){
                                const returnMail = data.email_id ? "<br>"+e_html(data.email_id) : "";
                                const returnDepart =  data.department ? "<br>"+e_html(data.department.name) : "";
                                const returnEmpId = data.employee_id ? e_html(data.employee_id) : translate("sdp.common.na");
                                const returnEmailForTitle = data.email_id ? e_html(data.email_id) : translate("sdp.common.na");
                                const returnDepartForTitle = data.department ? e_html(data.department.name) : translate("sdp.common.na");
                                const parentEle = jQuery(`<div class="fw"></div>`);
                                const renderTitle = `<b>${translate("sdp.common.name")} : </b><span>${e_html(data.name)}</span><br /><b>${translate("sdp.common.email")} : </b><span>${returnEmailForTitle}</span><br /><b>${translate("sdp.common.empid.is")} : </b><span>${returnEmpId}</span><br /><b>${translate("sdp.common.dept.is")} : </b><span>${returnDepartForTitle}</span>`;// No I18N

                                parentEle.attr("title",renderTitle).uitooltip({ // NO I18N
                                    content: function() {
                                        const element = jQuery(this);
                                        return element.attr("title"); //NO I18N
                                    },
                                    track: true,
                                    show: {
                                        delay: 250
                                    },
                                    tooltipClass: "uitip" //No I18N
                                });
                                parentEle.append(`<span class="bk-truncate">${e_html(data.name)} ${returnMail} ${returnDepart}</span>`);
                                return parentEle;
                            }
                        },
                        processResults:function(search_data,data){
                            const searchObj = {
		                        id: data.id,
		                        name: data.name,
                                department : data.department,
                                email_id : data.email_id
		                    };
                            search_data.push(searchObj);
                        },
                    },
                    space:{
                        input_data_Callback:function(urlOptions,input_data,searchText){
                            const listInfo = input_data.list_info;
                            let getSite = $relform.fields.values.site;
                            getSite = getSite ? getSite : null;
                            listInfo.search_criteria = [{
                                "field":"site","condition":"is","value":getSite,"logical_operator":"and"// No I18N
                            }];
                            if(listInfo && listInfo.search_criteria && listInfo.search_criteria.length>0){
                                listInfo.search_criteria.push(
                                    {"field":"name","condition":"like","values":[searchText],"logical_operator":"and"}// No I18N
                                )
                            }
                            return input_data;
                        }
                    },
                    site:{
                        hideDefaultSite: true
                    },
                    retain_user_site:{
                        hideLabel : assetsObj.isAssignOwnerPopup ? true : false
                    },
                    is_loanable:{
                        hideLabel : assetsObj.isAssignOwnerPopup ? true : false,
                        show_icon : true
                    },
                    "network_adapters.ip_address": { //NO I18N
                        custom_rules: [
                            {"rule_name": "ipv4andv6", "rule_value": true},   //NO I18N
                        ]
                    },
                    "memory.physical_memory":{ //NO I18N
                        custom_rules: [
                            {"rule_name": "regex", "rule_value": /^\d\d*(\.\d\d*)?$/}   //NO I18N
                        ]
                    },
                    "memory.virtual_memory": { //NO I18N
                        custom_rules: [
                            {"rule_name": "regex", "rule_value": /^\d\d*(\.\d\d*)?$/}   //NO I18N
                        ]
                    },
                    "hard_disks.free_space": memoryValidationRules,//NO I18N
                    "hard_disks.disk_capacity": memoryValidationRules,
                    "logical_drives.free_space": memoryValidationRules,
                    "logical_drives.drive_capacity": memoryValidationRules,
                    "netapp_physical_disks.used_size": memoryValidationRules,
                    "netapp_physical_disks.total_size": memoryValidationRules,
                    "loan_period": { //NO I18N
                        custom_rules: [
                            {"rule_name": "loanPeriodNotEmpty", "rule_value": true}   //NO I18N
                        ]
                    },
                    "loan_start": { //NO I18N
                        custom_rules: [
                            {"rule_name": "compareDate","rule_value": true,"rule_msg":translate("sdp.inventory.assignownertoWS.startgreater.error")} //NO I18N
                        ]
                    },
                    "loan_end": { //NO I18N
                        custom_rules: [
                            {"rule_name": "compareDate","rule_value": true,"rule_msg":translate("sdp.inventory.assignownertoWS.leaseend.error")} //NO I18N
                        ]
                    },
                    "virtual_machines.virtual_machine": { // No I18N
                        input_data_Callback: function (url_options, input_data) {
                            let chosenIds = $relform.fieldUniqueValues["virtual_machines.virtual_machine"] || [];  // No I18N

                            if ($relform.mode === "edit" && !chosenIds.includes($relform.entitydata.id)) {  // No I18N
                                chosenIds.push($relform.entitydata.id);
                            }

                            let search_criteria = chosenIds.length > 0 ? [{
                                field: "id", // No I18N
                                condition: "not in", // No I18N
                                values: chosenIds,
                                logical_operator: "AND" // No I18N
                            }] : [];

                            if (search_criteria.length > 0) {
                                input_data.list_info.search_criteria = (input_data.list_info.search_criteria || []).concat(search_criteria);
                            }
                            return input_data;
                        },
                        is_unique: true
                    }
                },
                defaults: {
                    lookup:{
                         placeholder:translate('sdp.change.sla.select')
                    }
                },
                onchange: {
                    vendor: "assetFormView.onProductOrVendorChange", // No I18N
                    product: "assetFormView.onProductOrVendorChange", // No I18N
                    state:"assetFormView.onChangeFunctionForState",// No I18N
                    used_by_asset:"assetFormView.onChangeFunctionForAsset",// No I18N
                    user:"assetFormView.onChangeFunctionForUser",// No I18N
                    department:"assetFormView.onChangeFunctionForDepartment",// No I18N
                    is_loanable:"assetFormView.onChangeFunctionForIsLoanable",// No I18N
                    retain_user_site:"assetFormView.onChangeFunctionForSiteRetained",// No I18N
                    loan_start:"assetFormView.onChangeFunctionForLoanPeriod",// No I18N
                    loan_end:"assetFormView.onChangeFunctionForLoanPeriod",// No I18N
                    vm_platform: "assetFormView.onChangeFunctionForVMPlatform"// No I18N
                }
            },
            save: {
                url: self.editId ? "/api/v3/"+options.api_plural_name+"/"+self.editId+"" : saveURL,//NO I18N
                entity: options.entity_name,
                submit: true,
                type: (self.editId || self.isBulkEdit) ? "put" : "post",// No I18N
                pre: "assetFormView.modifySaveData",//NO I18N
                cancel: "assetFormView.cancelForm",//No I18N
                success: "assetFormView.postDataAdded",//No I18N
                posterror:"assetFormView.errorAfterDataAdded",//No I18N
                errorinterrupt:"assetFormView.errorHandlingFunction",//NO I18N
                submitbutton: {
                    add: window.translate(saveOrUpdateBtn),
                }
            },
            afterRenderCallback: function (form) {
                const entityDataVal = self.data;
                /**Get permission from links for product and vendor add icon */
                if(assetsObj.links_data==undefined && !window.top.$groupObj){
                    const opt = {isListView : false},
                    getCurrentAssetMeta = assetsObj.assetModTemplateData.metaDataWithId,
                    getAssetModuleMeta = assetsObj.assetModTemplateData.metaDataWithoutId,
                    formLinks = getCurrentAssetMeta.hasOwnProperty(self.id) ? getCurrentAssetMeta[self.id]._links :  getAssetModuleMeta[assetsObj.module]._links;

                    assetsObj.setLinksData(opt,formLinks);
                }

                self.renderingFields();
                if (options.data) {
                    /**For set default value for asset state */
                    if(!self.isBulkEdit && typeof options.data.state=='undefined'){
                        const state ={id : configJSON.metadata.fields.state.default_value.id, name : configJSON.metadata.fields.state.default_value.name};
                        options.data.state = state;
                    }else{
                        options.data.id = options.data.id ? options.data.id : "?ids=" + top.assetListView.tableObject.bulkSelect.getSelectedIDs();//NO I18N
                    }
                }
                self.setValidationMethod();
                /**For setting characters count for state history commetns, description and system description */
                const getMetaFlds = form.metadata.fields;
                jQuery("#for_sys_description").attr({"maxlength": getMetaFlds.sys_description && getMetaFlds.sys_description.constraints.max_length, "charcount":"true"});//No I18N
                jQuery("#for_description").attr({"maxlength": getMetaFlds.description && getMetaFlds.description.constraints.max_length, "charcount":"true"});//No I18N
                jQuery("#for_state_history_comments").attr({"maxlength": getMetaFlds.state_history_comments && getMetaFlds.state_history_comments.constraints.max_length, "charcount":"true"});//No I18N
                charCounter.init();


               /**Set info message under department field */
                var infoMessage = `<div class="depart-info-msg"><div class="alert alert-info icon mb0 mt20 p3 disp-ib "role="alert"><span class="msg">${translate('asset.modify.state.list.alluser.info')}</span></div></div>`;
                    jQuery('#assetForm [data-fname="department"] .right-col').append(infoMessage);
                    jQuery(".depart-info-msg").hide();

                if(form.mode=="edit"){
                    const isOwnershipAllowed = (entityDataVal && entityDataVal.state && entityDataVal.state.is_ownership_allowed) ? false : true,
                    isOwnershipMandatory = (entityDataVal && entityDataVal.state && entityDataVal.state.is_ownership_mandatory);

                    /**Display all fields based on is_ownership_allowed */
                    if(assetsObj.isAssignOrState){
                        const currModule = assetsObj.list_module ? assetsObj.list_module : assetsObj.module,
                        forAssignFlds = ["department","user","used_by_asset","state_history_comments"],//No I18N
                        inUserData = {"list_info":{"start_index":1,"row_count":1,"search_criteria":{ "field": "name", "condition": "is", "value": "In Use" }}};//No I18N

                        /**Set In Use data as default for assign button */
                        self.hideOrShowFieldsBasedOnState(form,false,forAssignFlds);

                        /**Get current Id of In use state from current portal */
                        let getInUseData = null;
                        assetsObj.commonAjaxFunction(currModule+"/state",null,inUserData,function(response){
                            getInUseData = response.state.length>0 && response.state[0];
                        },"state");// No I18N
                        jQuery('[name="state"]').select2("data",getInUseData).trigger("change");//No I18N
                        form.fields.changed.splice("state",1);//No I18N
                        /**End */
                        self.hideOrShowFieldsBasedOnState(form,true,["state"]);
                    }else if(assetsObj.isAssignOwnerPopup){
                        self.hideOrShowFieldsBasedOnState(form,isOwnershipAllowed);
                        if(!isOwnershipAllowed){
                            if(!form.fields.state.current_value.is_loanable_state){
                                self.hideOrShowFieldsBasedOnState(form,true,["loan_start","loan_end","loan_period"]);   // No I18N
                            }
                            if(!form.fields.state.current_value.is_attach_asset_allowed){
                                self.hideOrShowFieldsBasedOnState(form,true,["used_by_asset"]);
                            }
                        }
                    }else{
                        self.enableORDisableFields(form,isOwnershipAllowed);
                        if(!isOwnershipAllowed){
                            if(!form.fields.state.current_value.is_loanable_state){
                                self.enableORDisableFields(form,true,["loan_start","loan_end","loan_period"]);  // No I18N
                            }
                            if(!form.fields.state.current_value.is_attach_asset_allowed){
                                self.enableORDisableFields(form,true,["used_by_asset"]);
                            }

                        }
                    }

                    if(isOwnershipMandatory){
                        /**Set mandatory fields */
                        const isDepartmentAvail = entityDataVal.department ? true : false,
                              isUserAvail = entityDataVal.user ? true : false,
                              isAssetAvail = entityDataVal.used_by_asset ? true : false;
                        self.getModifyStateUserMandatoryFields(form,isDepartmentAvail,isUserAvail,isAssetAvail);
                    }


                    /**Disable department and user based on asset */
                    const isAssetUserAvail = form.fields.used_by_asset && form.fields.used_by_asset.current_value && form.fields.used_by_asset.current_value.user;
                    const isUserAvail = (((isAssetUserAvail || (form.fields.user && form.fields.user.current_value)) && form.fields.values.is_loanable) && entityDataVal.state.is_ownership_allowed && form.fields.state.current_value.is_loanable_state) ? false : true;

                    /**Display loan fields based on user is available or not */
                    if(assetsObj.isAssignOwnerPopup){
                        self.hideOrShowFieldsBasedOnState(form,isUserAvail,["loan_period"]);// No I18N
                        self.setOrRemoveMandatoryFields(form,!isUserAvail,["loan_period"]);// No I18N
                        /**Comments in assign owner popup */
                        self.hideOrShowFieldsBasedOnState(form,true,["state_history_comments"]);
                    }else{
                        self.enableORDisableFields(form,isUserAvail,["loan_start","loan_end"]);// No I18N
                        self.setOrRemoveMandatoryFields(form,!isUserAvail,["loan_start","loan_end"]);// No I18N
                        /**Comments in assign owner popup */
                        self.enableORDisableFields(form,true,["state_history_comments"]);
                    }

                    const getCurrentState = form.fields.state && form.fields.state.current_value;
                    const isSiteRetaineOrNot = (form.fields.retain_user_site && form.fields.retain_user_site.current_value) && ((getCurrentState && getCurrentState.is_ownership_allowed) || ((getCurrentState && getCurrentState.name=="In Repair") && (form.fields.values.user || form.fields.values.department || form.fields.values.used_by_asset)));
                    self.enableORDisableFields(form,isSiteRetaineOrNot,["site"]);
                    if(getCurrentState && getCurrentState.name=="In Repair"){
                        form.unsetFieldValue("loan_period");// No I18N
                    }

                    entityDataVal.department ? jQuery(".depart-info-msg").show() : jQuery(".depart-info-msg").hide();
                    if(entityDataVal.is_loanable && form.fields.state.current_value.is_loanable_state){
                        self.enableORDisableFields(form,true,["department","used_by_asset"])// No I18N
                    }
                }else if(form.mode=="new"){// No I18N
                    if(assetsObj.isAssignOwnerPopup){
                        self.hideOrShowFieldsBasedOnState(form,true);
                    }else{
                        self.enableORDisableFields(form,true);
                        self.hideOrShowFieldsBasedOnState(form,false,["state_history_comments"]);
                    }
                }

                /**Remove skeleton loader once content is rendered for bulk edit form*/
                jQuery("#asset_form_skloader").remove();
                /**Hide default loading symbol in listview/details page once content get loaded */
                jQuery("#assets_common_loading").hide();
                jQuery("#asset-edit-container").show();
                /**Display assign owner popup once all contents are loaded */
                (assetsObj.isAssignOwnerPopup) && jQuery("#assign_owner_popup_form").show();

                /**For is_loanable */
                const getLonableInfoCont = jQuery("[data-fname='is_loanable'] .helpText");
                const getTitle = entityDataVal.is_loanable ? translate('asset.assign.owner.isloanable.istrue') : translate('asset.assign.owner.isloanable.isfalse');
                let getLoanInfoTxt ="<div>"+getTitle+"</div>";
                if(typeof self.loanableHelpText!="undefined" && self.loanableHelpText && self.loanableHelpText.length>0){
                    getLoanInfoTxt += "<hr class='mb0 mt5'><div class='sb mt5 lh20'>"+translate("common.help.text")+":</div><div>"+e_html(self.loanableHelpText)+"</div>";
                }
                getLonableInfoCont.attr("help-title","").attr("title","<div class='lh-normal'>"+getLoanInfoTxt+"</div>");
            /**End */

                jQuery("#asset-form-container").on("select2-selecting","[name=user],[name=department],[name=used_by_asset]", function(event) {	//No I18N
                    switch(event.currentTarget.name){
                        case "user"://No I18N
                            self.isUserchange = true;
                            break;
                        case "department"://No I18N
                            self.isDeptchange = true;
                            break;
                        case "used_by_asset"://No I18N
                            self.isAssetchange = true;
                            break;
                    }
                });
                /**Execute if one one site is available */
                if(!form.fields.values.site && form.fields.site && form.fields.site.mandatory){
                    self.setDefaultSiteIfOnlyOneAvail(options.api_plural_name,form);
                }
                self.getCurrentSite = form.fields.site && form.fields.site.current_value;
                if(assetsObj.isAssignOwnerPopup) {
                    jQuery("#asset-form-container").find(".main-pane .form-wrapper").removeClass("pb25").addClass("pt10 pb10");//No I18N
                    if(assetsObj.isAssignOrState) {
                        form.focusField("user"); //No I18N
                    } else {
                        form.focusField("state"); //No I18N
                    }
                }else{
                    form.focusField("name"); //No I18N
                }
                /**Disable isloanable for disposed state */
                if(form.fields.state.current_value && form.fields.state.current_value.name=="Disposed"){
                    self.enableORDisableFields(form,true,["is_loanable"]);
                }
                jQuery('#assetForm [name="site"]').on('change',function(){
                    self.clearSelect2Cache(["space"]);//No I18N
                    (jQuery("#assetForm [name='space']").length>0) && jQuery("#assetForm [name='space']").select2("data",null).trigger("change");//No I18N
                });
                initTooltip("#asset-edit-container");//NO I18N
            },
            entityName: !self.isBulkEdit ? options.entity_name : null
        }
        /**For save and add new button  */
        if(!self.editId && !self.isBulkEdit){
            configJSON.save.custom = [{
                "name":translate("sdp.common.saveandadd"),
                "type":"default",
                "action": "assetFormView.saveAndAddNewFunction",//NO I18N
            }];
        }
        //added
        const metaInfo = configJSON.metadata.fields;
        let skipFieldsArr = [];
        jQuery.each(metaInfo,function(field,fieldVal){
            if(fieldVal.read_only){
                skipFieldsArr.push(field)
            }
        });

        configJSON.skipEditFields = configJSON.skipFields = configJSON.skipEmptyFields = skipFieldsArr;

        //added - Need to check with gayathri
        if(configJSON.metadata.fields.vm_platform && self.isBulkEdit) {
            configJSON.metadata.fields.vm_platform.default_value = undefined;
        }
        window.$relform  = new FC(configJSON);
    },
    /**
     * Onchange function for loan period in assign owner popup
     * @param {Object} currMetaData
     */
    onChangeFunctionForLoanPeriod : function(currMetaData){
        const selectedDateVal = currMetaData.current_value;
        const getDomId = currMetaData.dom_id;

        if(getDomId==="loan_start" && selectedDateVal && selectedDateVal.value==''){
            jQuery("#loan_start_display").val(null);
        }else if(getDomId==="loan_end" && selectedDateVal && selectedDateVal.value==''){//No I18N
            jQuery("#loan_end_display").val(null);
        }
    },
    /**
     * On change function for asset state in both add/edit form and assign owner popup
     * @param {Object} currMetaData
     * @param {Object} form
     */
    onChangeFunctionForState : function(currMetaData,form){
        const self = this,
        dataValue = currMetaData.current_value,
        isHideOrShow = dataValue.is_ownership_allowed ? false : true,
        getRetainSite = form.fields.values.retain_user_site,
        getUser = form.fields.values.user ? true : false,
        getDepartment = form.fields.values.department ? true : false,
        getAsset = form.fields.values.used_by_asset ? true : false;
        /**For bulk edit */
        if(!dataValue && assetsObj.bulkEditIds.split(",").length>1 && self.isBulkEdit){
            for(var i=form.fields.changed.length;i>=0;i--){
                if(form.fields.changed[i]=="department" || form.fields.changed[i]=="user" || form.fields.changed[i]=="used_by_asset" || form.fields.changed[i]=="loan_start" || form.fields.changed[i]=="loan_end"){
                    form.fields.changed.splice(i,1);
                }
            }
        }
        /**End */
        let eleBasedOnOwned = ["department","user","used_by_asset"];//NO I18N
        /**Enable site and other fields based on ownership allowed */
        self.enableORDisableFields(form,false,["site"]);
        if(dataValue.is_ownership_allowed){
            self.setOrRemoveMandatoryFields(form,false);
        }
        /**To add mandatory for the fields which have ownership */
        if(dataValue.is_ownership_mandatory){
            if(getUser || getDepartment || (dataValue.is_attach_asset_allowed && getAsset)){
                self.setOrRemoveMandatoryFields(form,getUser,["user"]);
                self.setOrRemoveMandatoryFields(form,getDepartment,["department"]);
                if(dataValue.is_attach_asset_allowed){self.setOrRemoveMandatoryFields(form,getAsset,["used_by_asset"])};
            }else{
                self.setOrRemoveMandatoryFields(form,true);
                if(!dataValue.is_attach_asset_allowed){
                    self.setOrRemoveMandatoryFields(form,false,["used_by_asset"]);
                }
            }
            self.enableORDisableFields(form,getRetainSite,["site"]);
        }else{
            
            self.setOrRemoveMandatoryFields(form,false);
            if(dataValue.is_ownership_allowed){
                form.fields.values.is_loanable && self.setOrRemoveMandatoryFields(form,true,["user"]);
            }
            else if(!dataValue.is_ownership_allowed){
                if(dataValue.name=="In Repair"){
                    if((form.fields.department && form.fields.department.field_value && form.fields.department.field_value.id) || (form.fields.user && form.fields.user.field_value && form.fields.user.field_value.id) || (form.fields.used_by_asset && form.fields.used_by_asset.field_value && form.fields.used_by_asset.field_value.id)){
                        if(form.fields.retain_user_site.field_value){
                            self.enableORDisableFields(form,true,["site"]);
                        }else{
                            self.enableORDisableFields(form,false,["site"]);
                        }
                    }else{
                        self.enableORDisableFields(form,false,["site"]);
                    }
                }
                else if(dataValue.name!="In Repair" || (dataValue.name=="In Repair" && form.fields.values.is_loanable)){
                    self.clearOldDatasWhenChangeState(form);
                    self.enableORDisableFields(form,false,["site"]);
                    form.resetFieldValue("site");
                    (!assetsObj.isAssignOwnerPopup) ? jQuery(".depart-info-msg").hide() : jQuery(".depart-info-msg").show();
                }
            }
        }
        /**For assign owner popup */
        if(assetsObj.isAssignOwnerPopup){
            /*For elements need to show and hide*/
            eleBasedOnOwned = eleBasedOnOwned.concat(["is_loanable","retain_user_site"]);//No I18N
            self.hideOrShowFieldsBasedOnState(form,isHideOrShow,eleBasedOnOwned);
            if(!isHideOrShow && !dataValue.is_attach_asset_allowed){
                self.hideOrShowFieldsBasedOnState(form,true,["used_by_asset"]);
                form.unsetFieldValue("used_by_asset");  //No I18N
            }
            /**Hide loan details */
            self.hideOrShowFieldsBasedOnState(form,true,["loan_period"]);//No I18N
            self.setOrRemoveMandatoryFields(form,false,["loan_period"]);
            if(dataValue.is_ownership_allowed && dataValue.is_loanable_state){
                if(form.fields.values.is_loanable && form.fields.values.user){
                    self.hideOrShowFieldsBasedOnState(form,false,["loan_period"]);//No I18N
                    self.setOrRemoveMandatoryFields(form,true,["loan_period"]);
                    form.resetFieldValue("loan_period");   //No I18N
                }
            }
            if(dataValue.is_ownership_allowed && !dataValue.is_loanable_state){
                form.unsetFieldValue("loan_period");    //No I18N
            }
            /**Comments in assign owner popup */
            const getState = form.fields.state;
            if(getState && getState.field_value && getState.field_value.hasOwnProperty("id") && getState.field_value.id==dataValue.id){
                self.hideOrShowFieldsBasedOnState(form,true,["state_history_comments"]);
                form.fields.values.state_history_comments = null;
                const getStateHistoryIndex = form.fields.changed.indexOf("site");
                if(form.fields.changed && getStateHistoryIndex!=-1){
                    form.fields.changed = ["site"];
                }else{
                    form.fields.changed = [];
                }
            }else{
                self.hideOrShowFieldsBasedOnState(form,false,["state_history_comments"]);
            }
            /**End */
        }else{
            /*For elements need to disable and enable*/
            self.enableORDisableFields(form,isHideOrShow,eleBasedOnOwned);
            if(!isHideOrShow && !dataValue.is_attach_asset_allowed){
                self.enableORDisableFields(form,true,["used_by_asset"]);
                form.unsetFieldValue("used_by_asset");  //No I18N
            }
            /**Disable loan details */
            self.enableORDisableFields(form,true,["loan_start","loan_end"]);//No I18N
            self.setOrRemoveMandatoryFields(form,false,["loan_start","loan_end"]);//No I18N
            if(dataValue.is_ownership_allowed && dataValue.is_loanable_state){
                if(form.fields.values.is_loanable && form.fields.values.user){
                    self.enableORDisableFields(form,false,["loan_start","loan_end"]);//No I18N
                    self.setOrRemoveMandatoryFields(form,true,["loan_start","loan_end"]);//No I18N
                    form.resetFieldValue("loan_start");   //No I18N
                    form.resetFieldValue("loan_end");   //No I18N
                }
            }
            if(dataValue.is_ownership_allowed && !dataValue.is_loanable_state){
                form.unsetFieldValue("loan_start");   //No I18N
                form.unsetFieldValue("loan_end");   //No I18N
            }
            /**Comments in assign owner popup */
            const getState = form.fields.state;
            if(getState && getState.field_value && getState.field_value.hasOwnProperty("id") && getState.field_value.id==dataValue.id){
                self.enableORDisableFields(form,true,["state_history_comments"]);
                form.fields.values.state_history_comments = null;
            }else{
                self.enableORDisableFields(form,false,["state_history_comments"]);
            }
            /**End */
        }
        if(form.fields.values.is_loanable && dataValue.is_loanable_state){
            if(dataValue.is_ownership_allowed){
                form.unsetFieldValue("used_by_asset"); //No I18N
            }
            self.enableORDisableFields(form,true,["department","used_by_asset"])// No I18N
            self.setOrRemoveMandatoryFields(form,false,["department","used_by_asset"]);//No I18N
            if(form.fields.values.department && !form.fields.values.user){
                form.unsetFieldValue("department"); //No I18N
                self.setOrRemoveMandatoryFields(form,true,["user"]);//No I18N
            }   
        }
        if(form.fields.values.is_loanable && dataValue.is_ownership_allowed && !dataValue.is_loanable_state){
            self.enableORDisableFields(form,false,["department"])// No I18N
        }
        /**Disable isloanable field if selected state is disposed */
        if(dataValue.name=="Disposed"){
            self.enableORDisableFields(form,true,["is_loanable"]);
            form.resetFieldValue("is_loanable");//NO I18N
        }else{
            self.enableORDisableFields(form,false,["is_loanable"]);
        }

        if(dataValue.name=="In Repair"){
            jQuery('input[name="retain_user_site"]').prop('checked',form.fields.retain_user_site.field_value).trigger("change");
            form.resetFieldValue("user","safe");//NO I18N
            form.resetFieldValue("department","safe");//NO I18N
            form.resetFieldValue("used_by_asset");//NO I18N
            form.unsetFieldValue("loan_start");//NO I18N
            form.unsetFieldValue("loan_end");//NO I18N
            form.unsetFieldValue("loan_period");//NO I18N
            form.resetFieldValue("is_loanable");//NO I18N
            self.enableORDisableFields(form,true,["loan_start","loan_end","loan_period"]);//No I18N
            self.setOrRemoveMandatoryFields(form,false,["loan_start","loan_end","loan_period"]);//No I18N
            for(var i=form.fields.changed.length;i>=0;i--){
                if(form.fields.changed[i]=="department" || form.fields.changed[i]=="user" || form.fields.changed[i]=="used_by_asset"){
                    form.fields.changed.splice(i,1);
                }
            }
        }
        /**End */
    },
    /**
     * Clear selected data while changing state
     * @param {Object} form
     */
    clearOldDatasWhenChangeState : function(form){
        if(form.fields.changed.length>0){
            let formFields = form.fields.values;
            if(assetsObj.isAssignOwnerPopup){
                formFields.loan_period = null;
            }else{
                formFields.loan_end = null;
                formFields.loan_start = null;
            }
            formFields.used_by_asset = null;
            formFields.user = null;
            formFields.department = null;
            jQuery("#loan_start_IN_Display,#loan_end_IN_Display").val(null);
            /**Set changed values in field */
            if(form.fields.changed){
                form.fields.changed = (form.fields.changed.concat(["loan_start","loan_end","used_by_asset","user","department"]));// No I18N
            }
        }
    },
    /**
     * Set or remove mandatory fields for department/user/asset based on asset state selected by user
     * @param {Object} form
     * @param {Boolean} isMandatory
     * @param {Array} dynamicMandateFlds
     */
    setOrRemoveMandatoryFields : function(form,isMandatory,dynamicMandateFlds){
        const fieldsToBeMandate = dynamicMandateFlds || ["used_by_asset","department","user","loan_start","loan_end","loan_period"];// No I18N
        fieldsToBeMandate.forEach(function(ele){
            if(isMandatory) {
                form.addMandatoryField(ele);
            }else{
                form.removeMandatoryField(ele);
            }
        });
    },
    /**
     * Execute function to enable or disable elements in form
     * @param {Object} form
     * @param {Boolean} isEnableOrDisable
     * @param {Array} disableEle
     */
    enableORDisableFields : function(form,isEnableOrDisable,disableEle){
        const disableElements = disableEle || ["department","user","loan_start","loan_end","used_by_asset","loan_period"];// No I18N
        const fieldsToBeEnaOrDis = disableElements;
        fieldsToBeEnaOrDis.forEach(function(ele){
            form.disableFieldToggle(ele,isEnableOrDisable);
        });
    },
    /**
     * Execute function to hide or show elements in form
     * @param {Object} form
     * @param {Boolean} isHideOrShow
     * @param {Array} hideShowFlds
     */
    hideOrShowFieldsBasedOnState : function(form,isHideOrShow,hideShowFlds){
        const hideAndShowEle = hideShowFlds || ["department","user","loan_start","loan_end","used_by_asset","loan_period","is_loanable","retain_user_site"];// No I18N
        hideAndShowEle.forEach(function(ele){
            form.hideFieldToggle(ele,isHideOrShow);
        });
    },
    /**
     * On change function for associated asset in both add/edit form and assign owner popup
     * @param {Object} currMetaData
     * @param {Object} form
     */
    onChangeFunctionForAsset : function(currMetaData,form){
        const self = this,
            assetDataValue = currMetaData.current_value,
            getStateIsMandatory = form.fields.state.current_value.is_ownership_mandatory,
            departmentValue =  jQuery("#assetForm [name=department]").select2("data") && jQuery("#assetForm [name=department]").select2("data").id,// No I18N
            userValue = jQuery("#assetForm [name=user]").select2("data") && jQuery("#assetForm [name=user]").select2("data").id,// No I18N
            isDepartMan = ((assetDataValue && assetDataValue.department && assetDataValue.department.id) || departmentValue)  ? true  : false,
            isUserMan = ((assetDataValue && assetDataValue.user && assetDataValue.user.id) || userValue) ? true : false,
            isAssetManOrNot = currMetaData.current_value ? true : false;
            /**Disable department, user and loan details if we select asset*/
            self.clearSelect2Cache(["used_by_asset"]);

            /**Set Asset as mandatory while selecting assets */
            getStateIsMandatory && self.getModifyStateUserMandatoryFields(form,isDepartMan,isUserMan,isAssetManOrNot);
            !departmentValue  && assetDataValue && assetDataValue.department && !self.isDeptchange && jQuery("input[name=department]").select2("data",{id:assetDataValue.department.id,name:assetDataValue.department.name,site:assetDataValue.department.site}).trigger('change');// No I18N
            !userValue  && assetDataValue && assetDataValue.user && jQuery("input[name=user]").select2("data",{id:assetDataValue.user.id,name:assetDataValue.user.name,department:assetDataValue.user.department}).trigger('change');// No I18N


            /**Retain site while onchange asset if retained site is checked */
            const isRetainedOrNot = jQuery('input[name="retain_user_site"]').prop('checked');// No I18N
            isRetainedOrNot && self.setModifyStateForSiteField(currMetaData.current_value,"used_by_asset",form);// No I18N
            self.isAssetchange = false;
            /**Comments in assign owner popup */
            const getCurrentAsset = currMetaData.current_value && currMetaData.current_value.id;
            const getFieldVal = form.fields.used_by_asset && form.fields.used_by_asset.field_value && form.fields.used_by_asset.field_value.id;
            if(getCurrentAsset && getFieldVal && (getCurrentAsset==getFieldVal)){
                if(assetsObj.isAssignOwnerPopup){
                    self.hideOrShowFieldsBasedOnState(form,true,["state_history_comments"]);
                }else{
                    self.enableORDisableFields(form,true,["state_history_comments"]);
                }
            }else{
                if(assetsObj.isAssignOwnerPopup){
                    self.hideOrShowFieldsBasedOnState(form,false,["state_history_comments"]);
                }else{
                    self.enableORDisableFields(form,false,["state_history_comments"]);
                }
            }   
            /**End */
    },
    /**
     * On change function for user in both add/edit form and assign owner popup
     * @param {Object} currMetaData
     * @param {Object} form
     */
    onChangeFunctionForUser : function(currMetaData,form){
        const self = this,
            userDataValue = currMetaData.current_value,
            userId =  userDataValue && userDataValue.id,
            getStateIsMandatory = form.fields.state.current_value.is_ownership_mandatory,
            forUserMandate = (!userDataValue) ? false : true,
            assetData = form.fields.used_by_asset.current_value || jQuery("#assetForm [name=used_by_asset]").select2("data"),// No I18N
            assetDepartment = assetData ? assetData.department : null,
            getDepartment = (form.fields.department && form.fields.department.current_value) || jQuery("#assetForm [name=department]").select2("data"),// No I18N
            checkIsDepartmentAvail = getDepartment && getDepartment.id,
            forDepartMandate = ((!userDataValue || (userDataValue && !userDataValue.department)) && !checkIsDepartmentAvail) ? false : true;
            let forAssetMandate = (assetData && assetData.id) ? true : false,
            getStateData = form.fields.state.current_value;

            /**Execute if one one site is available */
            if(userDataValue && !userDataValue.department && form.fields.site && form.fields.site.mandatory && !form.fields.retain_user_site.current_value){
                self.setDefaultSiteIfOnlyOneAvail(form.metadata.plural_name,form);
            }else if(userDataValue && !userDataValue.department && form.fields.site && form.fields.site.mandatory && form.fields.retain_user_site.current_value){
                var confirmMessage = translate("asset.unselect.retainsite.error.msg");// No I18N
                if(confirm(confirmMessage))
                {
                    jQuery('input[name="retain_user_site"]').prop('checked',false).trigger("change");
                    self.setDefaultSiteIfOnlyOneAvail(form.metadata.plural_name,form);
                }else{
                    jQuery("input[name=user]").select2("data", null).trigger('change'); //NO I18N
                    self.clearSelect2Cache(["user"]);//No I18N
                    self.isUserchange = false;
                    return false;
                }
            }

            function isSameUser() {
                if(!userId && !getDepartment && (assetData && !assetData.department)){ return true};
                return ((assetData && assetData.user && assetData.user.id === userId));
            }

            if (!isSameUser()) {
                jQuery("input[name=used_by_asset]").select2("data", null).trigger('change'); //NO I18N
                forAssetMandate = false;
            }
            const isLoanableValue = form.fields.values.is_loanable;
            if(assetsObj.isAssignOwnerPopup){
                self.hideOrShowFieldsBasedOnState(form,((userDataValue && isLoanableValue && getStateData.is_loanable_state) ? false : true),["loan_period"]);//NO I18N
                self.setOrRemoveMandatoryFields(form,((userDataValue && isLoanableValue && getStateData.is_loanable_state) ? true : false),["loan_period"]);//NO I18N

            }else{
                self.enableORDisableFields(form,((userDataValue && isLoanableValue && getStateData.is_loanable_state) ? false : true),["loan_start","loan_end"]);//NO I18N
                self.setOrRemoveMandatoryFields(form,((userDataValue && isLoanableValue && getStateData.is_loanable_state) ? true : false),["loan_start","loan_end"]);//NO I18N
            }
            /**Set or remove manadatory field based on selected user has department */
            getStateIsMandatory && self.getModifyStateUserMandatoryFields(form,forDepartMandate,forUserMandate,forAssetMandate);
            /**Clear cache to reopen user  and used_by_asset dropdown with new data (using user criteria) */
            self.clearSelect2Cache(["used_by_asset","user"]);//No I18N


            if(!checkIsDepartmentAvail){
                userDataValue && jQuery("[name=department]").select2("data",userDataValue.department).trigger('change');// No I18N
            }
            /**Retain site while onchange user if retained site is checked */
            const isRetainedOrNot = jQuery('input[name="retain_user_site"]').prop('checked');// No I18N
            isRetainedOrNot && self.setModifyStateForSiteField(currMetaData.current_value,"user",form);// No I18N
            self.isUserchange = false;
            if(isLoanableValue){
                if(currMetaData.current_value){
                    jQuery("[name=department]").select2("data",userDataValue.department).trigger('change');// No I18N
                }
            }
            /**Comments in assign owner popup */ 
            const getCurrentUser = currMetaData.current_value && currMetaData.current_value.id;
            const getFieldVal = form.fields.user && form.fields.user.field_value && form.fields.user.field_value.id;
            if(getCurrentUser==getFieldVal){
                if(assetsObj.isAssignOwnerPopup){
                    self.hideOrShowFieldsBasedOnState(form,true,["state_history_comments"]);
                }else{
                    self.enableORDisableFields(form,true,["state_history_comments"]);
                }
            }else{
                if(assetsObj.isAssignOwnerPopup){
                    self.hideOrShowFieldsBasedOnState(form,false,["state_history_comments"]);
                }else{
                    self.enableORDisableFields(form,false,["state_history_comments"]);
                }
            }   
            /**End */
        },
        /**
         * On change function for department in both add/edit form and assign owner popup
         * @param {Object} currMetaData
         * @param {Object} form
         */
        onChangeFunctionForDepartment : function(currMetaData,form){
        const self = this,
          departDataValue = currMetaData.current_value,
          departmentId = departDataValue && departDataValue.id,
          user = jQuery("#assetForm input[name=user]"),
          getStateIsMandatory = form.fields.state.current_value.is_ownership_mandatory,
          userData = form.fields.user.current_value || user.select2("data"),//NO I18N
          assetData = form.fields.used_by_asset.current_value || jQuery("#assetForm input[name=used_by_asset]").select2("data"),// No I18N
          userDepartment = userData ? userData.department : null,
          assetDepartment = assetData ? assetData.department : null,
          isDepartMan = (!departDataValue) ? false : true;


        function isSameDepartment() {
            if(!departmentId && !userDepartment && !assetDepartment) {return true};
            return (userDepartment && userDepartment.id === departmentId) || (assetDepartment && assetDepartment.id === departmentId);
        }

        if (!isSameDepartment()) {
            user.select2("data", null).trigger('change'); //NO I18N
            jQuery("input[name=used_by_asset]").select2("data", null).trigger('change'); //NO I18N
        }

        self.clearSelect2Cache(["user","used_by_asset"]);//No I18N

        /**For set and remove mandatory fields */
        const checkIsUserAvail = (self.getSelect2EleData('user')) ? true : false,//NO I18N
              forAssetMandate = (form.fields.values.used_by_asset) ? true : false;

              getStateIsMandatory && self.getModifyStateUserMandatoryFields(form,isDepartMan,checkIsUserAvail,forAssetMandate);
        /**Retain site while onchange department if retained site is checked */
        const isRetainedOrNot = jQuery('input[name="retain_user_site"]').prop('checked');// No I18N

        isRetainedOrNot && self.setModifyStateForSiteField(currMetaData.current_value,"department",form);// No I18N
        departmentId ? jQuery(".depart-info-msg").show() : jQuery(".depart-info-msg").hide();
        self.isDeptchange = false;
        /**Comments in assign owner popup */ 
        const getCurrentDepart = currMetaData.current_value && currMetaData.current_value.id;
        const getFieldVal = form.fields.department && form.fields.department.field_value && form.fields.department.field_value.id;
        if(getCurrentDepart==getFieldVal){
            if(assetsObj.isAssignOwnerPopup){
                self.hideOrShowFieldsBasedOnState(form,true,["state_history_comments"]);
            }else{
                self.enableORDisableFields(form,true,["state_history_comments"]);
            }
        }else{
            if(assetsObj.isAssignOwnerPopup){
                self.hideOrShowFieldsBasedOnState(form,false,["state_history_comments"]);
            }else{
                self.enableORDisableFields(form,false,["state_history_comments"]);
            }
        }   
        /**End */
    },
    /**
     * On change function for Set retained site or default site value in both add/edit form and assign owner popup
     * @param {Object} currMetaData
     * @param {Object} form
     */
    onChangeFunctionForSiteRetained : function(currMetaData,form){
        const self = this,
           isRetainedOrNot = currMetaData.current_value,
           departmentValue = self.getSelect2EleData('department'),//NO I18N
           userValue = self.getSelect2EleData('user'),//NO I18N
           assetValue = self.getSelect2EleData('used_by_asset'),//NO I18N
           getStateOwnership = form.fields.state.current_value && form.fields.state.current_value.is_ownership_allowed;
        /**Site enabled and disabled only for state with ownership */
        if(getStateOwnership || form.fields.state.current_value.name=="In Repair"){
            /**Set site value based on modified values */
            if(isRetainedOrNot){
                const formField = form.fields;
                if(assetValue && formField.used_by_asset.current_value){
                    self.setModifyStateForSiteField(formField.used_by_asset.current_value,"used_by_asset",form,true);// No I18N
                }
                else if(departmentValue && formField.department.current_value){
                    self.setModifyStateForSiteField(formField.department.current_value,"department",form,true);// No I18N
                }
                else if(userValue && formField.user.current_value){
                    self.setModifyStateForSiteField(formField.user.current_value,"user",form,true);// No I18N
                }
                else{
                    if(!form.fields.state.current_value.is_ownership_mandatory){
                        self.enableORDisableFields(form,false,["site"]);
                    }else{
                        self.enableORDisableFields(form,true,["site"]);
                    }
                }
            }else{
                const isSiteAvail = self.getCurrentSite;
                if(isSiteAvail){
                    jQuery('[name="site"]').select2("data",isSiteAvail);// No I18N
                    form.fields.values.site = isSiteAvail;
                }else{
                    self.resetModifyStateSite(true);
                }
                self.enableORDisableFields(form,false,["site"]);
            }
        }
    },
    /**
     * On change function for VM platform in both add/edit form
     * @param {*} currMetaData
     * @param {*} form
     */
    onChangeFunctionForVMPlatform: function(currMetaData,form){
        const vmSection = jQuery('[data-section="Virtual Machines"]'); //NO I18N

        form.disableField("installed_vms"); //NO I18N
        form.disableField("allowed_vms"); //NO I18N
        vmSection.hide();

        if (currMetaData.current_value !== "") { //NO I18N
            form.enableField("installed_vms"); //NO I18N
            form.enableField("allowed_vms"); //NO I18N
            vmSection.show();
        }else{
            form.unsetFieldValue("allowed_vms", null); //NO I18N
            form.unsetFieldValue("installed_vms", null); //NO I18N
        }
    },
    /**
     * Execute funtion to get and return select2 current data based on element Id
     * @param {String} elementId
     * @returns
     */
    getSelect2EleData:function(elementId){
        const data = jQuery("[name="+elementId+"]").select2('data');
        return data && data.id;
    },
    /**
     * Set site value based on modified values
     * @param {string} dataValue
     * @param {string} changeFldsId
     * @param {Object} form
     * @param {Boolean} isFromRetainedCkh
     * @returns
     */
    setModifyStateForSiteField : function(dataValue,changeFldsId,form,isFromRetainedCkh){
        const self = this;
        /**Return if retained site checkbox is unchecked */

        if (!jQuery('input[name="retain_user_site"]').is(":checked")) return;
        let setSiteData = () => {

            /**Get site value based on user or department data */
            if(form.fields.retain_user_site.current_value && changeFldsId=="used_by_asset" && !dataValue){
                dataValue = form.fields.department.current_value || form.fields.user.current_value && form.fields.user.current_value;
            }
            const currFldAssoSite = (changeFldsId=="user") ? (dataValue ? dataValue.department : null) : dataValue,// No I18N
                 isRetainedOrNot = form.fields.retain_user_site.current_value,
                 siteData = currFldAssoSite ? currFldAssoSite.site : null,
                 getRetainIsAvail = form.fields.values.department || form.fields.values.user || form.fields.values.used_by_asset,
                 updateSite = !dataValue ? (getRetainIsAvail===null || getRetainIsAvail==="") : dataValue;

                 
            if(updateSite){
                jQuery('[name="site"]').select2("data", siteData).trigger('change');//NO I18N
            }
            self.enableORDisableFields(form,isRetainedOrNot,["site"]);
            if(!form.fields.state.current_value.is_ownership_mandatory && !getRetainIsAvail){
                self.enableORDisableFields(form,false,["site"]);
            }
            /**Execute if one one site is available */
            if(!siteData && form.fields.site && form.fields.site.mandatory && !isRetainedOrNot){
                self.setDefaultSiteIfOnlyOneAvail(form.metadata.plural_name,form);
            }
        }
        let clearSiteData = () => {jQuery('input[name="retain_user_site"]').prop('checked',false).trigger("change");};    
        if(isFromRetainedCkh){
            const currFldAssoSite = (changeFldsId=="user") ? (dataValue ? dataValue.department : null) : dataValue;// No I18N
            const getAssoSite = currFldAssoSite && currFldAssoSite.site ? currFldAssoSite.site.id : null;
            if((!assetFormView.checkedSiteId || (assetFormView.checkedSiteId!=getAssoSite)) && getAssoSite){
                assetFormView.getAllSiteDataFunction(getAssoSite);
            }
            let isSiteAvail =  assetFormView.getSiteAllowedVal.length>0 ? true :false;
            var confirmMessage = (changeFldsId=="used_by_asset") ? translate("sdp.asset.site.changed.warn.message2") : (changeFldsId=="user" ? translate("sdp.asset.user.site.changed.warn.message") : translate("sdp.asset.site.changed.warn.message"));// No I18N
            if(getAssoSite && !isSiteAvail){
                confirmMessage = translate("asset.unselect.retainsite.error.msg");
                if(confirm(confirmMessage)){
                    clearSiteData();
                }else{
                    clearSiteData();
                }
            }else{
                if(confirm(confirmMessage)){
                    setSiteData();
                }else{
                    self.enableORDisableFields(form,false,["site"]);
                    clearSiteData();
                }
            }
            
            
        }else{
            setSiteData();
        }
    },
    /**
     * Function to Set or Remove mandatory fields while changing dropdown values
     * @param {Object} form
     * @param {boolean} isDepartment
     * @param {boolean} isUser
     * @param {boolean} isAsset
     */
    getModifyStateUserMandatoryFields : function(form,isDepartment,isUser,isAsset) {
        const stateData = form.fields.state.current_value;
        const self = this,
              isUserSelected = !!jQuery("input[name='user']").select2("data"),// No I18N
              isDepartmentSelected = !!jQuery("input[name='department']").select2("data"),// No I18N
              isAssetIsSelected = !!jQuery("input[name='used_by_asset']").select2("data") && stateData.is_attach_asset_allowed ;// No I18N
        /**If all values are empty set all fielda are mandatory */
        if((isDepartment || isUser || isAsset)){
            self.setOrRemoveMandatoryFields(form,isDepartment,["department"]);
            self.setOrRemoveMandatoryFields(form,isUser,["user"]);
            self.setOrRemoveMandatoryFields(form,isAsset,["used_by_asset"]);
        }else if(!isUserSelected && !isDepartmentSelected && !isAssetIsSelected){
            /**Set mandatory based on selected values in fields */
            self.setOrRemoveMandatoryFields(form,true,["user","department"]);   // No I18N
            if(stateData.is_attach_asset_allowed){
                self.setOrRemoveMandatoryFields(form,true,["used_by_asset"]);   // No I18N
            }
        }
        if(form.fields.values.is_loanable && stateData.is_loanable_state){
            self.setOrRemoveMandatoryFields(form,false,["department","used_by_asset"]);// No I18N
            self.setOrRemoveMandatoryFields(form,true,["user"]);
        }
        /**End */
    },

    /**
     * Set site value as empty
     * @param {boolean} forceReset
     */
    resetModifyStateSite : function(forceReset) {
        if(jQuery('input[name="retain_user_site"]').is(":checked") || forceReset) {
            jQuery('[name="site"]').select2("data", null);//NO I18N
        }
    },
    /**
     * For append vendor and product new icon in add/edit page
     * @param {string} containerId
     * @param {string} iconId
     */
    appendFieldAddIcon : function(containerId, iconId) {
        const container = jQuery("#" + containerId);
        let title = "";
        
        if(containerId === "product_control"){
            title = translate("sdp.admin.product.listview.addproduct");
            container.append('<div id="product_element" style="display: none;"></div>');
        }else if(containerId ==="vendor_control"){// No I18N
            title = translate("sdp.admin.vendor.listview.addvendor");
        }
        if(iconId=="user-icon"){
            title = translate("ae.cmdb.inventory.addNewCI",[translate("sdp.inventory.workstation.listview.user")]);
            container.parent().append('<span data-name="user" rel="uitip" aria-hidden="true" title="'+e_attr(title)+'" class="cspr contact opac7 icon-sm opac pos-abs top10 flat cur-ptr right30"></span>');
            container.removeClass("fw").addClass("w-95per"); // No I18N
        }else if(iconId=="space-icon"){// No I18N
            title = translate("ae.cmdb.inventory.addNewCI",[translate("sdp.inventory.workstation.listview.user")]);
            container.parent().append(`<span class="aspr icon-sm opac5 cur-ptr pos-abs top10 mt1 ml10 template-sm" aria-hidden="true" data-name="multiselecttemplate" id="space-btn" title="${translate('search.prefix',[translate('space.field')])}" rel="uitip"></span>`);
            container.removeClass("fw").addClass("w-95per"); // No I18N
            jQuery("#space-btn").on("click",function(){
                openSpacePopup();
            });
        }else{
            container.parent().append('<span id="' + iconId + '" class="cspr add-items2 ml5 flat cur-ptr pos-abs top10 right30" rel="uitip" title="'+e_attr(title)+'"></span>');
            container.removeClass("fw").addClass("w-95per"); // No I18N
        }
    },
    /**Rendering fields after form component is constructing elements  */
    renderingFields : function() {
        const self = this, parentEle = jQuery("#assetform-section");
        const links_data = assetsObj.links_data;
        /**Add new product icon near product dropdown fields in add/edit page */
        if(links_data && links_data.permissions.add_new_product == true){
            self.appendFieldAddIcon("product_control", "new-product-icon"); // No I18N
            parentEle.on("click","#new-product-icon", function() { // No I18N
                assetsObj.openProductFormDialog();
            });
        }
        /**Add new product icon near vendor dropdown fields in add/edit page */
        if(links_data && links_data.permissions.add_new_vendor == true){
            self.appendFieldAddIcon("vendor_control", "new-vendor-icon"); // No I18N
            parentEle.on("click","#new-vendor-icon", function() { // No I18N
                $header.loadVendorPopup("asset", parentEle.find('[name="vendor"]')); //NO I18N
            });
        }
        self.appendFieldAddIcon("user_control", "user-icon"); // No I18N
        self.appendFieldAddIcon("space_control", "space-icon"); // No I18N

        /** */
        parentEle.on("click",'[data-name="user"]', function() { // No I18N
            const getUserEle =  jQuery('[name="user"]').select2('data');// No I18N
            const getSelUser = (getUserEle && getUserEle.id) ? getUserEle.name : null;
            showUserSearchPopup('Assets', true, getSelUser); // No I18N
            return false;
        });
        initTooltip("#asset-edit-container");//NO I18N
        /**VM checks */
        $relform.disableField("installed_vms"); //NO I18N
        $relform.disableField("allowed_vms"); //NO I18N
        const vmSection = jQuery('[data-section="Virtual Machines"]'); //NO I18N
        const vmHostSection = jQuery('[data-section="Virtual Host Details"]'); //NO I18N

        vmSection.hide();

        if ($relform.getFieldValue("vm_platform") !== '0') { //NO I18N
            vmSection.show();
            $relform.enableField("installed_vms"); //NO I18N
            $relform.enableField("allowed_vms"); //NO I18N
        }

        if ($relform.mode !== "new" && $relform.entitydata != null && $relform.entitydata.vm_host != null) {
            vmHostSection.hide();
            vmSection.hide();
        }
    },
    /**Validating rules for ipaddress and double (with decimal point) used for purchase cost */
    setValidationMethod : function() {
        /**To accept both ipv4 and ipv6 address */
        jQuery.validator.addMethod("ipv4andv6", function (value,element) {// No I18N
            if(value.includes(",")){
                let isValidIp = true;
                const getSplitedArray = value.split(",");
                for(let ind=0;ind<getSplitedArray.length;ind++){
                    let ipVal = getSplitedArray[ind].trim();
                    isValidIp = isValidIp && (isIpAddress(ipVal) || isIpV6Address(ipVal));
                }
                return isValidIp;
            }
            return isIpAddress(value) || isIpV6Address(value) || !value;
        }, translate("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message"));

        /**Validate if loan period value is empty in assign owner popup */
        jQuery.validator.addMethod("loanPeriodNotEmpty", function (value,element) {// No I18N
            const getFormValues = $relform.fields.values,
                  isLoanDateAvail = value.split(":")[0];
            if(getFormValues.is_loanable && $relform.fields.state.current_value.is_loanable_state && getFormValues.user && !isLoanDateAvail && $relform.fields.state.current_value.name!="In Repair"){
                return false;
            }
            return true;
        }, translate("sdp.common.error.empty",[translate("common.loan.period")]));

        /**Validate if loan period value is empty in assign owner popup */
        jQuery.validator.addMethod("compareDate", function (value,element) {// No I18N
            const getFormValues = $relform.fields.values,
                  getLoanStartValue = getFormValues.loan_start,
                  getLoanEndValue = getFormValues.loan_end;

            if(getLoanStartValue && getLoanEndValue && (getLoanEndValue<getLoanStartValue)){
                return false;
            }
            /**Remove error message from ui after getting validatio  success */
            if(jQuery("#loan_end_IN").next().hasClass("text-danger")){
                jQuery("#loan_end_IN").next().remove();
            }else if(jQuery("#loan_start_IN").next().hasClass("text-danger")){
                jQuery("#loan_start_IN").next().remove();
            }

            return true;
        });

        /**Compare and Validate memory fields in sub form (logival drive, hard disk and storage space)  */
        jQuery.validator.addMethod("memoryLimitValidation", function (value,element) {// No I18N
            var memoryFldObj = {
                "hard_disks" : {//No I18N
                    "greater" : {//No I18N
                        "field" : "disk_capacity"//No I18N
                    },
                    "lesser": {//No I18N
                        "field" : "free_space"//No I18N
                    },
                    "error-msg":{//No I18N
                        "disk_capacity": translate("time.greater.than.time",[translate("sdp.inventory.asset.printerinfo.capacity"),translate("sdp.inventory.wsDetailView.hw.hdFreeSpace")]), //No I18N
                        "free_space":translate("time.validation.common",[translate("sdp.inventory.wsDetailView.hw.hdFreeSpace"),translate("sdp.inventory.asset.printerinfo.capacity")])//No I18N
                    }
                },
                "logical_drives" : {//No I18N
                    "greater" : {//No I18N
                        "field" : "drive_capacity"//No I18N
                    },
                    "lesser": {//No I18N
                        "field" : "free_space"//No I18N
                    },
                    "error-msg":{//No I18N
                        "drive_capacity": translate("time.greater.than.time",[translate("sdp.inventory.asset.printerinfo.capacity"),translate("sdp.inventory.wsDetailView.hw.hdFreeSpace")]), //No I18N
                        "free_space":translate("time.validation.common",[translate("sdp.inventory.wsDetailView.hw.hdFreeSpace"),translate("sdp.inventory.asset.printerinfo.capacity")])//No I18N
                    }
                },
                "netapp_physical_disks":{//No I18N
                    "greater" : {//No I18N
                        "field" : "total_size"//No I18N
                    },
                    "lesser": {//No I18N
                        "field" : "used_size"//No I18N
                    },
                    "error-msg":{//No I18N
                        "used_size": translate("time.validation.common",[translate("sdp.asset.netapp.usedSize"),translate("sdp.asset.netapp.totalSize")]), //No I18N
                        "total_size":translate("time.greater.than.time",[translate("sdp.asset.netapp.totalSize"),translate("sdp.asset.netapp.usedSize")])//No I18N
                    }
                }
            }
            if(value){
                let greaterValFld, lesserValFld;
                const getCurrEleId = jQuery(element).attr("id"),
                      getCurrFldVal = getCurrEleId.split(".")[1].split("_tsb")[0],/**here we get field - freespace/capacity/used_size */
                      prefixVal = jQuery(element).parents(".form-section").attr("data-subform"),//No I18N /**here we get sub form field - hard_disks */
                      rowId = jQuery(element).parents("tr").attr("data-row"),//No I18N /**Get current row */
                      getCapacityVal = memoryFldObj[prefixVal].greater.field,
                      getUsedOrFreeSp = memoryFldObj[prefixVal].lesser.field;

                greaterValFld = prefixVal+"."+getCapacityVal+"_tsb"+rowId;
                lesserValFld = prefixVal+"."+getUsedOrFreeSp+"_tsb"+rowId;

                const getGreaterValue = jQuery('[name="'+greaterValFld+'"]').val(),
                        getLesserValue = jQuery('[name="'+lesserValFld+'"]').val(),
                        getGreaterBytesVal = jQuery('[name="'+greaterValFld+'_bytes"]').val(),
                        getLesserBytesVal = jQuery('[name="'+lesserValFld+'_bytes"]').val(),
                        getGreValIntoBytes = assetsObj.getBits(getGreaterValue,getGreaterBytesVal),
                        getLessValIntoBytes = assetsObj.getBits(getLesserValue,getLesserBytesVal),
                        validateRule = getGreValIntoBytes>=getLessValIntoBytes;

                /**Get error message based on subform and field name */
                const ruleMessage = memoryFldObj[prefixVal]["error-msg"][getCurrFldVal];// No I18N
                jQuery(element).attr("data-rule-message",ruleMessage);

                if(getGreValIntoBytes!=0){
                    return validateRule;
                }else{
                    return true;
                }

            }else{
                return true
            }
        },function(value,ele){
            return jQuery(ele).attr("data-rule-message");
        });

        jQuery.validator.addMethod("double", function (value) {// No I18N
            return isDouble(value) || !value;
        }, translate("sdp.inventory.contract.msg1"));
    },
    /**
     * Used to Reverse an array for easy splicing
     * @param {Array} indexArr
     * @param {Array} dataArr
     * @returns
     */
    spliceArrFunction : function(indexArr,dataArr){
        const reversed = indexArr.reverse();
            jQuery.each(reversed,function(currIndex,fieldVal){
                dataArr.splice(fieldVal,1);
            });
            return dataArr;
    },
    /**
     * changed as common function - Add new popup for both vendor and product in asset add/edit page
     * @param {string} currentAdModule
     */
    openNewVendorAndProductDialog : function (currentAdModule) {
        const self = this;
        const pareEle = jQuery("#popup_form_container");
        if(currentAdModule==="vendor"){
            renderhbs("#popup_form_container", "asset-form-template",{isVendorTemp:true},false,"assets"); // No I18N
            jQuery('#vendor_currency').sdp_select2({
                url: [{
                    url: "/api/v3/vendors/currency", //NO I18N
                    field: "currency",//NO I18N
                }]
            });
        }else{
            renderhbs("#popup_form_container", "asset-form-template",{isProductTemp:true},false,"assets"); // No I18N
        }
        /**Rules and messages for product validation inside form*/
        const productValidation = [{
            product_name: {
                required: true
            },
            product_cost: {
                number: true
            }
        },
        {
            product_name: {
                required: translate("sdp.common.error.empty", [translate("sdp.purchase.addNew.popUpProduct.PName")])
            },
            product_cost: {
                number: translate("common.numeric.value.error.msg", [translate("sdp.inventory.detailAsset.Cost")])
            }
        }]
        /**Rules and messages for vendor validation inside form*/
        const vendorValidation = [{
            name: {
                required: true
            },
            currency: {
                required: function (e) {
                    return jQuery(e).select2("data") === null; //No I18N
                }
            }
        },
        {
            name: {
                required: translate("sdp.common.error.empty", [translate("sdp.admin.productvendor.vendorname")])
            },
            currency: {
                required: translate("ae.admin.vendor.selectCurrency.alert")
            }
        }]
        const validationJsonObj = (currentAdModule=="product") ? productValidation : vendorValidation; //NO I18N
        /**Validator component function */
        initFormValidator(currentAdModule+"_new_form",validationJsonObj[0],validationJsonObj[1]);
        const titleMsg = (currentAdModule=="product") ? "sdp.admin.product.listview.addproduct" : "sdp.admin.vendor.listview.addvendor";// No I18N
        /**Open in jquery dialog  */
        pareEle.dialog({
            width: "460",
            modal: true,
            title: translate(titleMsg),
            close: function () {
                jQuery(this).dialog("destroy");// No I18N
            }
        });
        /**Onclick function for save button inside popup */
        pareEle.find("#"+currentAdModule+"_save_btn").on("click",function() {// No I18N
            self.saveFunForProductAndVendor(currentAdModule);
        });
        /**Onclick function for cancel button inside vendor/product popup */
        pareEle.find("#"+currentAdModule+"_cancel_btn").on("click",function() {// No I18N
            jQuery("#popup_form_container").dialog("close");
        });
        charCounter.init();
    },
    /**
     * changed as common function - Save function for both new product and vendor in asset add/edit page
     * @param {string} currentAdModule
     * @returns
     */
    saveFunForProductAndVendor : function(currentAdModule){
        if(!jQuery("#"+currentAdModule+"_new_form").valid()) return;
        let data = {}, entity_name = "";
        const button = jQuery(document.activeElement).button("loading");
        if(currentAdModule==="product"){
            data = {
                "product":  { // No I18N
                    "name": jQuery("#product_name").val(),// No I18N
                    "all_product_type": { "id": this.productType.id }, // No I18N
                    "cost": jQuery("#product_cost").val() || 0,  // No I18N
                    "manufacturer": jQuery("#model_manufacturer").val(), // No I18N
                }
            };
            entity_name = "products"; //NO I18N
        }else if(currentAdModule==="vendor"){ //NO I18N
            const description = jQuery("#vendor_description").val();
            const contactPerson = jQuery("#vendor_contact_person").val();
            data = {
                "vendor":  { // No I18N
                    "name": jQuery("#vendor_name").val(), // No I18N
                    "currency": { "id": jQuery("#vendor_currency").val() }, // No I18N
                    "description": description ? description : undefined, // No I18N
                    "contact_person": contactPerson ? contactPerson : undefined,  // No I18N
                }
            };
            entity_name = "vendors"; //NO I18N
        }

        sdpAjax({
            url: "/api/v3/"+entity_name,//NO I18N
            type: "post", // No I18N
            data: sdpAjaxInputData(data),
            success: function (response) {
                var getCurrentModCtrl = jQuery("#"+currentAdModule+"_control").find('[name="'+currentAdModule+'"]');
                showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
                jQuery("#popup_form_container").dialog("close"); // No I18N

                getCurrentModCtrl.data("sdp_select2").cache = {}; // No I18N
                getCurrentModCtrl.select2("data", response[currentAdModule]).trigger("change");// No I18N
            },
            complete: function() {
                button.button("reset"); // No I18N
            }
        });
    },
    /**
     * Construct layout for assign owner popup
     * @param {object} getEntityData
     * @returns
     */
	constructTemplateInfo : function(getEntityData) {
		const layouts = getEntityData, self = this;

		/* removing already available fields inside sections from the layout */
		for(let i = 0; i < layouts.length; i++) {
            let getFieldName = [];
            let removedSection = [];

            for(let j = 0, jLen = layouts[i].sections.length; j < jLen; j++) {
                let removedField = [];
                let section = layouts[i].sections[j];

                for (let k = 0; section.fields && k < section.fields.length;k++){
                    if(getFieldName.length>0){
                        if(getFieldName.indexOf(section.fields[k].name)!=-1 && section.is_subform === false){
                            removedField.push(k);
                        }
                    }
                    /**For getting loanable help text */
                    if(section.fields[k].name=="is_loanable" && section.fields[k].help_text){
                        self.loanableHelpText = section.fields[k].help_text;
                    }
                    /**End */
                    if(removedField.indexOf(k)==-1){
                        getFieldName.push(section.fields[k].name);
                    }
                    self.modifyFieldConfig(section.fields[k], section);
                }
                self.spliceArrFunction(removedField, section.fields);
                if(section.fields.length == 0) {
                    removedSection.push(j);
                }
            }
            self.spliceArrFunction(removedSection, layouts[i].sections);
        }
        const reorder_subforms = assetsObj.globalConfigurations ? assetsObj.globalConfigurations.configurations.reorder_subforms : true;
        if(reorder_subforms){
            for(let i = 0; i < layouts.length; i++) {
                let sub_sections = [];
                let layout = layouts[i];
                let sections = layout.sections;
                sub_sections = sections.filter(function (section) {
                    return section.is_subform;
                });
                sections = sections.filter(function (section) {
                    return !section.is_subform;
                });
                let r = 0;
                sections.forEach(function(sec){
                    sec.position.row = r+1;
                    r+=1;
                });
                sub_sections.forEach(function(sub_sec){
                    sub_sec.position.row = r+1;
                    r+=1;
                });
                sections = sections.concat(sub_sections);
                layout.sections = sections;
                layouts[i] = layout;
            }
        }
        /**For set default values for assign owner popup */
        if(assetsObj.isAssignOwnerPopup){
            let getStateSection = layouts[0].sections[1];
            let getStateFields = ['state',"user","department","used_by_asset","site","retain_user_site","is_loanable","loan_period","state_history_comments"];//NO I18N

            let getStateFldsObj = [];
            for(let i=0;i<getStateFields.length;i++){
                let getStateObj = {};
                /**To remove today button from calender for datetimerange type */
                if(getStateFields[i]=="loan_period"){
                    getStateObj.args = {
                        todayButton: false,
                        isPopupArea: true
                    };
                }
                /**End */
                getStateObj.name = getStateFields[i];
                getStateObj.position = {
                    "col_size" : 2,//NO I18N
                    "row_size" : 1,//NO I18N
                    "col" : 1,//NO I18N
                    "row" : i//NO I18N
                };
                getStateFldsObj.push(getStateObj)
            }
            layouts[0].sections[1].fields = getStateFldsObj;
            getStateSection.column_count = "1";
            getStateSection.style_properties = {section_style: {}, field_style: {field_align: "top"}} ;//NO I18N

            delete getStateSection.name;
            layouts[0].sections = [getStateSection];
        }
		return { layouts : layouts};
	},

	/**
	 * modifies the fields' default config in the template configuration object
     * @param {string} field
	 */
	modifyFieldConfig : function(field) {
		if(field && field.context === "udf_fields"){
			field.sort = false;
        }
	},

    /**
     * Remove empty keys while adding form
     * @param {Object} obj
     */
    removeEmptyKeys : function(obj){
        const self = this;
        for (let attribute in obj) {
            if(self.basicData && self.basicData[attribute] != obj[attribute]){
                continue;
            }

            if(obj[attribute] === false){
                continue;
            }

            if(!obj[attribute]){
                delete obj[attribute];
                continue;
            }

            if(Array.isArray(obj[attribute])){
                if(obj[attribute].length===0){
                    delete obj[attribute];
                    continue;
                }
            }

            if(typeof obj[attribute] === "object") {//No I18N
                this.removeEmptyKeys(obj[attribute]);
                if (Object.keys(obj[attribute]).length === 0) {
                    delete obj[attribute];
                    continue;
                }
            }

            if(typeof obj[attribute] === "string") {//No I18N
                if (obj[attribute]==="") {//No I18N
                    delete obj[attribute];
                    continue;
                  }
            }
        }
    },
    /**
     * Change empty data as null while field is empty for all memory fields based on metainfo type
     * * @param {Object} saveData
     * * @param {Object} form
     */
    removeEmptyValueFromMemoryFields : function(saveData,form){
        const metaData = form.metadata.fields;
        /**Get metada from template layout */
        jQuery.each(metaData,function(currIndex,fieldVal){
            if(fieldVal.fields){
                jQuery.each(fieldVal.fields,function(index,value){
                    if(value.type==="memory"){
                        if(saveData.hasOwnProperty(currIndex)){
                            if(Array.isArray(saveData[currIndex])){
                                for(var i=0;i<saveData[currIndex].length;i++){
                                    if(typeof saveData[currIndex][i][index] != 'undefined' && saveData[currIndex][i][index]===""){
                                        saveData[currIndex][i][index] = null;
                                    }
                                }
                            }else{
                                if(typeof saveData[currIndex][index] != 'undefined'
                                && saveData[currIndex][index]===""){
                                    saveData[currIndex][index] = null;
                                }
                            }
                        }
                    }

                });
            }else{
                if(fieldVal.type==="memory"){
                    if(typeof saveData[currIndex]!= 'undefined' && saveData[currIndex]===""){
                        saveData[currIndex] = null;
                    }
                }
            }
        });
        /**End */
    },
    /**
     * Append the fields value outside form, eg, workflow field in form
     * @param {object} data
     * @param {object} form
     * @returns
     */
    modifySaveData : function(data,form){
        const self = this;

        let saveData = data[self.productType.api_name] || data[self.data.module.api_name];

        self.removeEmptyValueFromMemoryFields(saveData,form);

        (!self.isBulkEdit) ? ((saveData.purchase_cost === null) ? saveData.purchase_cost = "0.00" : null) : null;
        (saveData && saveData.barcode == "") ? (saveData.barcode = null) : null;
        var getLoanData = "";
        /**Assign loan start and loan end value to saveData */
        if(assetsObj.isAssignOwnerPopup){
            /**In assign owner popup  */
            getLoanData = saveData.loan_period;
            delete saveData.loan_period;
            if(assetsObj.isAssignOrState && form.fields.state.field_value && form.fields.state.field_value.name!="In Use"){
                saveData.state = {name:"In Use"}//No I18N
            }
        }else {
            /**In form page */
            if(!saveData.loan_start && !saveData.loan_end){
                getLoanData = null;
            }else if(saveData.loan_start!="" || saveData.loan_start!=null && form.fields.values.loan_end){
                getLoanData = [saveData.loan_start,{"value":form.fields.values.loan_end}];//No I18N
            }else if(saveData.loan_end!="" || saveData.loan_end!=null && form.fields.values.loan_start){
                getLoanData = [{"value":form.fields.values.loan_start},saveData.loan_end];//No I18N
            }else if(saveData.loan_start && saveData.loan_end){
                getLoanData = [saveData.loan_start,saveData.loan_end];
            }


        }

        if(getLoanData){
            saveData.loan_start = getLoanData[0];
            saveData.loan_end = getLoanData[1];
            /**TEMP FIX FOR SAVE */
            if(saveData.loan_start && !saveData.loan_start.value){
                saveData.loan_start = null;
                saveData.loan_end = null;
            }
        }else{
            if(!form.fields.values.user && !self.isBulkEdit){
                saveData.loan_start = null;
                saveData.loan_end = null;
            }

        }

        (!self.isBulkEdit) && self.removeEmptyKeys(saveData);

        /**Clear loan_start, loan_end, is_loanable on clearing the loan in bulk edit. */
        /**As discussed, need to set value as null for loan start, loan end and is_loanable if state doesn't contain is_ownership_allowed, doesn't have user or is_loanable and except inrepair state */
        if(form.fields.changed.indexOf("state")!=-1 || (form.fields.state && form.fields.state.current_value && form.fields.state.current_value.hasOwnProperty("is_ownership_allowed") && form.fields.state.current_value.is_ownership_allowed)){
            if((form.fields.state.current_value && !form.fields.state.current_value.hasOwnProperty("is_ownership_allowed") && form.fields.state.current_value.name!="In Repair") || (!form.fields.user && !form.fields.is_loanable)){
                saveData.loan_start = null;
                saveData.loan_end = null;
            }
        }

        /**Removing Virtual Machines if the vm_platform is null or "" */
        if(form.entitydata){
            //update case
            //computer update
            if( (saveData.vm_platform === null || saveData.vm_platform === "") && form.entitydata.vm_platform !== null){
                saveData.virtual_machines = null;
                saveData.allowed_vms = null;
                saveData.installed_vms = null;
            }else if(form.entitydata.vm_platform === null && !saveData.hasOwnProperty('vm_platform')){ //no i18n
                delete saveData.virtual_machines;
                delete saveData.allowed_vms;
                delete saveData.installed_vms;
            }
        }else{
            //add case
            if(!saveData.vm_platform || (saveData.vm_platform && (saveData.vm_platform === null || saveData.vm_platform === ""))) {
                delete saveData.virtual_machines;
                delete saveData.allowed_vms;
                delete saveData.installed_vms;
            }
        }


        return saveData;
    },
    /**
     * Refresh Listview table after getting errr for some fields in bulkEdit
     * @param {object} data
     * @param {object} form
     */
    errorAfterDataAdded : function(data,form){
        jQuery(document.body).removeClass("of-h");
        if(window.top.assetListView){
            Object.keys(window.top.assetListView.tableObject).length>0 && window.top.assetListView.refreshTable();
        }
        if(assetsObj.isAssignOwnerPopup){
            jQuery("#assign_owner_popup_formclose").trigger("click");//NO I18N
        }

    },
    /**
     * Redirect to previous page after data is saved bulk edit - redirect to list view and edit - redirect to details page
     * @param {object} data
     * @param {object} form
     * @returns
     */
    postDataAdded : function(data, form){
        const self = this;
        jQuery('[name="save-form"]').removeAttr("disabled"); //NO I18N
        /**For assign owner change inside group  */
        if(window.top.$groupObj){
            window.top.$groupObj.afterUpdateassignOwnerInGroup(data[form.options.entity]);
            jQuery("#assign_owner_popup_form").find("#assign_owner_popup_formclose").trigger('click');
            return true;
        }

        let restoreUpdatedValueForSingle = () => {
            const getUpdatedDataId = data[form.options.entity].id,
                    getEntityName = data[form.options.entity].module.api_name;
            if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getUpdatedDataId) && assetsObj.assetModTemplateData.metaDataWithId[getUpdatedDataId].hasOwnProperty(getEntityName)){
                assetsObj.assetModTemplateData.metaDataWithId[getUpdatedDataId][getEntityName] = data[getEntityName];
            }else if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getUpdatedDataId)){
                delete assetsObj.assetModTemplateData.metaDataWithId[getUpdatedDataId];
            }

            if(form.fields.changed.indexOf("state")!==-1 || (form.fields.changed.indexOf("user")!==-1 || form.fields.changed.indexOf("department")!==-1 || form.fields.changed.indexOf("site")!==-1)){
                delete assetsObj.assetModTemplateData.metaDataWithId[getUpdatedDataId];
            }


        }

        let restoreUpdatedValForBulk = () => {
            const assetListObj = window.top.assetListView,
                  getSelectedIds = assetListObj && assetListObj.tableObject && assetListObj.tableObject.bulkSelect && assetListObj.tableObject.bulkSelect.getSelectedIDs(),
                  getUpdatedData = (getSelectedIds.length>1) ? data[form.options.metadata.plural_name] : (data[form.options.metadata.entity]);

                if(getSelectedIds.length>1 && (getUpdatedData && getUpdatedData.length>0)){
                    getUpdatedData.forEach(function(value,ind){
                        var getCurrAssetId = value.id;

                        if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getCurrAssetId) && assetsObj.assetModTemplateData.metaDataWithId[getCurrAssetId].hasOwnProperty(value.module.api_name)){
                            assetsObj.assetModTemplateData.metaDataWithId[getCurrAssetId][value.module.api_name] = value;
                        }else{
                            if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getCurrAssetId)){
                                delete assetsObj.assetModTemplateData.metaDataWithId[getCurrAssetId];
                            }
                        }
                    })
                }else if(getUpdatedData!==undefined && getUpdatedData.hasOwnProperty("id")){//NO I18N
                    assetsObj.assetModTemplateData.metaDataWithId[getUpdatedData.id][form.options.entity] = data[form.options.entity];
                }else if(!getUpdatedData || getUpdatedData === undefined){
                    if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getSelectedIds[0])){
                        delete assetsObj.assetModTemplateData.metaDataWithId[getSelectedIds[0]];
                    }
                }
        }
        if(form.mode=="new"){//NO I18N
            assetsObj.isNewAsset = true;
        }
        /**end */
        if(data && data.response_status && (data.response_status.status === "success" || data.response_status.status === "warning" || (jQuery.isArray(data.response_status) && data.response_status[0].status === "success"))) {
            /**Close dialog for assign owner popup */
            if(assetsObj.isAssignOwnerPopup){
                if(self.isBulkEdit){
                    restoreUpdatedValForBulk();
                }else{
                    restoreUpdatedValueForSingle();
                }
                jQuery("#assign_owner_popup_form").find("#assign_owner_popup_formclose").trigger('click');
                const getIdParam = new URLSearchParams(window.location.search).get("entity_id");
                if(window.top.assetDetailView && window.top.assetDetailView.module && window.top.assetDetailView.entity_id && getIdParam){
                    assetsObj.redirectTo("detail",assetDetailView.module,"",assetDetailView.entity_id);//NO I18N
                }else if(assetListView && assetListView.tableObject){
                    assetListView.tableObject && assetListView.tableObject.refreshTable();
                }
            }else if(self.isBulkEdit){
                /**Close dialog and refresh listview for bulk edit form popup */
                jQuery(document.body).removeClass("of-h");
                restoreUpdatedValForBulk();
                window.top.assetListView.refreshTable();
                /**For closing bulk edit popup */
                jQuery("#asset_bulk_edit_popup_form").find("#asset_bulk_edit_popup_formclose").trigger("click");
                assetsObj.isPopup = false;
            }else{
                const getUpdatedDataId = data[form.options.entity].id;
                restoreUpdatedValueForSingle();
                if(typeof form.cusBtnIndex == 'undefined'){
                    self.redirectToList(form,getUpdatedDataId);
                }
            }
            if(form.mode=="new" && !self.isBulkEdit){
                window.top.showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true");   //No I18N
            }else{
                window.top.showalert("success", translate("sdp.admin.common.updatedsuccessfully"), "isAutoHide=true");   //No I18N
            }
        }
        if(typeof form.cusBtnIndex!='undefined'){
            self.getStateDefaultValue && jQuery('[name="state"]').select2("data",self.getStateDefaultValue).trigger('change');//No I18N
            FC.resetForm("safe","form_assetForm");//No I18N
        }
    },
    /**
      * Replace asset name instead of id in error handling function
      * @param {object} response
      * @returns
      */
    errorHandlingFunction : function(response){
        if(assetsObj.isPopup){
            var getAssetData = window.top.assetListView.tableObject.visibleContents;
            var errorResponse = response.response_status;
            for(var i=0;i<errorResponse.length;i++){
                var getCurrErrorId = errorResponse[i].id;
                getAssetData.forEach(function(assetData) {
                    if(getCurrErrorId==assetData.id){
                       errorResponse[i].id = e_html(assetData.name);
                    }
                })
            }
            return true;
        }else{
            return true;
        }
    },
    /**
     * Redirect to asset list view page it is triggerd in cancel button
     * @param {object} form
     * @param {object} getAssetId
     */
    redirectToList : function (form,getAssetId,isCancelForm) {
        /**Change browser url based on entity id in browser history [if edit page then redirects  */
        let module = assetsObj.list_module ? assetsObj.list_module : assetsObj.module;
        const getFromPage = this.fromPage,
              getBrowserHistory = window.history.state,
              getForm  = form ? form : $relform,
              getSelFilterArr = assetsObj.filter_value;
        if(getFromPage=="details"){
            assetsObj.isModifyType && (module=assetsObj.module);
            assetsObj.redirectTo("detail",module,"",getBrowserHistory.entity_id);//NO I18N
        }else {
            if(isCancelForm){
                assetsObj.redirectTo("list",module);//NO I18N
                return;
            }
        }
        (getAssetId) && assetsObj.redirectTo("detail",module,"",getAssetId);//NO I18N
        assetsObj.retainSelectedFilterValues(getSelFilterArr);
    },
    /**
     * Execute while clicking cancel button in asset add/edit page
     */
    cancelForm : function(){
        const self = this;
        jQuery(document.body).removeClass("of-h");
        if(assetsObj.isAssignOwnerPopup){
            assetActions.closeDialogClearVariable();
        }else{
            if(self.isBulkEdit){
                if(jQuery('#asset_bulk_edit_popup_form')!==0){
                    jQuery('#asset_bulk_edit_popup_form').closest('.zdialog--overlay').remove();//NO I18N
                    assetsObj.isPopup = false;
                    assetActions = assetsObj.assetActions;
                    jQuery(window).off("beforeunload.form_assetForm");// No I18N
                }else {
                    jQuery(".zdialog--overlay").remove();
                }
            }else{
                self.redirectToList(null,self.id||self.editId,true);
            }
        }
        FC_Mapper && FC_Mapper.form_assetForm && FC_Mapper.form_assetForm.destroy();
    },
    /**
     * Change purchase cost value based on selecting options in product and vendor in asset add page
     * @returns
     */
    onProductOrVendorChange : function () {
        const productSelect2Data = jQuery("#product_control").find('[name="product"]').select2('data'),//No I18N
              vendorSelect2Data = jQuery("#vendor_control").find('[name="vendor"]').select2('data'),//No I18N
              getVendorId = vendorSelect2Data && vendorSelect2Data.id,
              getProductId = productSelect2Data && productSelect2Data.id;

        if (assetsObj.links_data.permissions.product_vendor_association && productSelect2Data != null && vendorSelect2Data != null && getProductId && getVendorId) {
            sdpAjax({
                url: "/api/v3/product_vendor_associations",// No I18N
                data: sdpAjaxInputData({
                    list_info: {
                        search_criteria: {
                            field: "vendor.id", // No I18N
                            condition: "is", // No I18N
                            value: getVendorId,
                            "children": [{ //No I18N
                                field: "product.id", //No I18N
                                condition: "is", //No I18N
                                value: getProductId,
                                logical_operator: "and" //No I18N
                            }]
                        }
                    }
                }),
            }).then(function (response) {
                var product_price = "0.00";
                var productVendorAssociation = response.product_vendor_associations[0];
                if (productVendorAssociation != null) {
                    product_price = productVendorAssociation.product_price;
                    var exchange_rate = productVendorAssociation.vendor.currency.exchange_rate;
                    product_price = (product_price / exchange_rate).toFixed(2);
                }
                FC_Mapper.form_assetForm.fields.values["purchase_cost"] = product_price;
            });
        } else {
            FC_Mapper.form_assetForm.resetFieldValue("purchase_cost", "0.00");//No I18N
        }
    },
    /**
     * On change function for is loanable checkbox in add/edit form and assign owner popup
     * @param {object} currMetaData
     * @param {object} form
     */
    onChangeFunctionForIsLoanable : function(currMetaData,form){
        const getStateVal = form.fields.state.current_value,
        self = this,
        isLoanTimeEnaOrDis = (currMetaData.current_value && form.fields.values.user && getStateVal.is_loanable_state) ? false : true;
        /** Info message for isloanable Note - once get content we need to change value of i18n key */
        const getLonableInfoCont = jQuery("[data-fname='is_loanable'] .helpText");
        const getTitle = currMetaData.current_value ? translate('asset.assign.owner.isloanable.istrue') : translate('asset.assign.owner.isloanable.isfalse');
        let getLoanInfoTxt ="<div>"+getTitle+"</div>";
        if(typeof self.loanableHelpText!="undefined" && self.loanableHelpText && self.loanableHelpText.length>0){
            getLoanInfoTxt += "<hr class='mb0 mt5'><div class='sb mt5 lh20'>"+translate("common.help.text")+":</div><div>"+e_html(self.loanableHelpText)+"</div>";
        }
        getLonableInfoCont.attr("help-title","").attr("title","<div class='lh-normal'>"+getLoanInfoTxt+"</div>");

        
        if(assetsObj.isAssignOwnerPopup){
            self.hideOrShowFieldsBasedOnState(form,isLoanTimeEnaOrDis,["loan_period"])// No I18N
            self.setOrRemoveMandatoryFields(form,!isLoanTimeEnaOrDis,["loan_period"])// No I18N
        }else{
            if(getStateVal.is_ownership_allowed){
                self.enableORDisableFields(form,isLoanTimeEnaOrDis,["loan_start","loan_end"])// No I18N
                self.setOrRemoveMandatoryFields(form,!isLoanTimeEnaOrDis,["loan_start","loan_end"])// No I18N
            }
        }
        /**To disable asset and department dropdown */
        if(getStateVal.is_ownership_allowed){
            if(getStateVal.is_loanable_state){
                if(currMetaData.current_value){
                    const getUserDepartValue = form.fields.user && form.fields.user.current_value && form.fields.user.current_value.department && form.fields.user.current_value.department.id;
                    const getDepartValue = form.fields.values.department;
                    let confirmMsgFun = function(){
                        self.enableORDisableFields(form,true,["department","used_by_asset"])// No I18N
                        if(form.fields.values.department){
                            !form.fields.values.user && form.unsetFieldValue("department");// No I18N
                            form.unsetFieldValue("used_by_asset");// No I18N
                            self.setOrRemoveMandatoryFields(form,false,["department","used_by_asset"])// No I18N

                            if(!getStateVal.is_ownership_mandatory){
                                self.setOrRemoveMandatoryFields(form,true,["user"]);// No I18N
                            }
                            currMetaData.current_value && form.unsetFieldValue("used_by_asset");// No I18N
                        }
                        const departValue = (form.fields.values.department && getStateVal.is_ownership_mandatory) ? true : false;
                        const userValue = (form.fields.values.user && getStateVal.is_ownership_mandatory) ? true : false;
                        self.getModifyStateUserMandatoryFields(form,departValue,userValue,false);
                        currMetaData.current_value && form.unsetFieldValue("used_by_asset");// No I18N
                    }
                    
                    
                    
                    if(form.fields.values.department || form.fields.values.used_by_asset){
                        var confirmMessage = translate("sdp.asset.isloanable.enabled.warn.message");// No I18N
                        if(getUserDepartValue && getDepartValue && (getUserDepartValue==getDepartValue) && !form.fields.values.used_by_asset){
                            confirmMsgFun();
                        }else{
                            if(confirm(confirmMessage))
                            {
                                confirmMsgFun();
                            }else{
                                self.isTriggerCancel = true;
                                jQuery('input[name="is_loanable"]').prop('checked',false).trigger("change");
    
                            }
                        }
                        
                    }else{
                        self.enableORDisableFields(form,true,["department","used_by_asset"])// No I18N
                        !form.fields.values.user && form.unsetFieldValue("department");// No I18N
                        form.unsetFieldValue("used_by_asset");// No I18N
                        self.setOrRemoveMandatoryFields(form,false,["department","used_by_asset"])// No I18N

                        if(!getStateVal.is_ownership_mandatory){
                            self.setOrRemoveMandatoryFields(form,true,["user"]);// No I18N
                        }
                        currMetaData.current_value && form.unsetFieldValue("used_by_asset");// No I18N
                    }
                }else if(!currMetaData.current_value){
                    const userValue = (form.fields.values.user && getStateVal.is_ownership_mandatory) ? true : false;
                    if(!self.isTriggerCancel){
                        form.unsetFieldValue("loan_start");// No I18N
                        form.unsetFieldValue("loan_end");// No I18N
                        form.unsetFieldValue("loan_period");// No I18N
                        self.enableORDisableFields(form,false,["department","used_by_asset"]);// No I18N


                        (!getStateVal.is_ownership_mandatory) && self.setOrRemoveMandatoryFields(form,false,["user"])// No I18N
                        if(userValue){
                            self.setOrRemoveMandatoryFields(form,false,["used_by_asset"]);// No I18N
                        }else{
                            getStateVal.is_ownership_mandatory && self.setOrRemoveMandatoryFields(form,true,["used_by_asset"]);// No I18N
                        }
                    } else{
                        self.isTriggerCancel = false;
                        const isAssetAvail = form.values.used_by_asset;
                        self.setOrRemoveMandatoryFields(form,isAssetAvail,["used_by_asset"]);// No I18N
                    }

                    const isUserValue = form.fields.user.current_value ? form.fields.user.current_value : (form.fields.values.department ? form.fields.user.field_value : null);
                    const departValue = ((getStateVal.is_ownership_mandatory && isUserValue && isUserValue.department && isUserValue.department.id) || form.fields.values.department) ? true : false;
                    getStateVal.is_ownership_mandatory && self.getModifyStateUserMandatoryFields(form,departValue,userValue);
                }
            }
            else{
                form.unsetFieldValue("loan_start");// No I18N
                form.unsetFieldValue("loan_end");// No I18N
                form.unsetFieldValue("loan_period");// No I18N
            }
        }
    },
    /**
     * Clear cache for select2 dropdown to rerender data again
     * @param {Array} eleId 
     */
    clearSelect2Cache : function(eleId){
        eleId.forEach(function(getEleId){
            const getAssetSdpSelect2 = jQuery('#assetForm input[name="'+getEleId+'"]').length>0 ? jQuery('#assetForm input[name="'+getEleId+'"]').data().sdp_select2 : null;
            (getAssetSdpSelect2!==undefined && getAssetSdpSelect2!==null) && (getAssetSdpSelect2.cache={});
        });
    },
    /**
     * Execute function for "save and add new" button in form
     * @param {Object} form 
     * @param {String} formContinerId 
     * @param {Integer} customBtnIndex 
     * @param {Object} element 
     */
    saveAndAddNewFunction:function(form,formContinerId,customBtnIndex,element){
        const self = this;
        self.getStateDefaultValue = form.fields.state.default_value;
        FC.submit(formContinerId, element, customBtnIndex);
    },
    setDefaultSiteIfOnlyOneAvail:function(assetName,form){
        const inputDataVal = {"list_info":{"start_index":1,"row_count":100,"sort_field":"name"}};//NO I18N
        assetsObj.commonAjaxFunction(assetName+"/site",null,inputDataVal,function(response){
            if(response && response.site && response.site.length==1){
                const getSite = response.site[0];
                jQuery("[name=site]").select2("data",{id: getSite.id, name: getSite.name}).trigger('change');//NO I18N
            }
        });
    },
    getAllSiteDataFunction:function(getSiteId){
        const self = this;
        let inputData = {"list_info":{"search_criteria":{"field":"id","condition":"is","value":getSiteId,"logical_operator":"and"}}}//NO I18N
        sdpAjax({
            url: "/api/v3"+$relform.fields.site.href,//NO I18N
            cache: false,
            async:false,
            data:sdpAjaxInputData(inputData),
            success: function(response)
            {
                assetFormView.checkedSiteId = getSiteId;
                self.getSiteAllowedVal = response.site;
            }
        });
    }
};