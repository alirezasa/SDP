var $ciCommon = {
    originalMetadata: null,         // original metadata of the module
    entityData: {},               // holds CI data
    /*
    *  load page based on the mode
    */
    loadPage : async function (mode, ci_type, refEntity, refField, from, defaultTab, refInstanceId, ciid, data,gsearch,isFileProtectionRequired,defaultAssociatedModule) {
        if(!sdp_app.IS_CMDB_ENABLED){
          window.location.href = "/jsp/AuthError.jsp"; //No I18N
          return;
        }
        if (ci_type === "null" && data && data.type && data.type != "null") {
            var dataObj = {
                module: data.type,
                mode: 'list' //No I18N
            };
        } else {
            if (mode == 'popup' && ci_type == "null") {
                /*
                 * make a cmdb/id call to get citype name and proceed for popup alone if ci_type is not sent
                 */
                let responseName = null;
                const hasRequiredFieldForURL = $ciCommon.isNotNull(refEntity) && $ciCommon.isNotNull(refField) && $ciCommon.isNotNull(refInstanceId);
                const hasNonCMDBRole = !sdp_user.ROLES.contains('ViewCI') && !sdp_user.ROLES.contains('ViewAssociatedCI');    //NO I18N
                if (hasRequiredFieldForURL && hasNonCMDBRole) {
                    path = refEntity + "/" + refInstanceId + "/" + refField + "/" + ciid;
                    responseName = "ci"; //NO I18N
                } else {
                    path = "cmdb/" + ciid;  //NO I18N
                    responseName = "cmdb";  //NO I18N
                }
                const data = await $ciCommon.doSdpAjaxCall(path);
                ci_type = data[responseName].module.api_plural_name;
            }
            else if(ciid != null && ci_type != null && ci_type == "cmdb" && mode == "details"){
                path = ci_type + '/' + ciid; //No I18N
                const data = await $ciCommon.doSdpAjaxCall(path);
                ci_type = data[ci_type].module.api_plural_name;
            }
            var dataObj = {
                module: ci_type === "null" ? "cmdb" : ci_type,  //NO I18N
                mode: mode,
                entity_id: ciid,
                defaultTab: $ciCommon.isNotNull(defaultTab) ? defaultTab : undefined,
                defaultAssociatedModule: $ciCommon.isNotNull(defaultAssociatedModule) ? defaultAssociatedModule : undefined,
                refEntity: $ciCommon.isNotNull(refEntity) ? refEntity : undefined,
                refField: $ciCommon.isNotNull(refField) ? refField : undefined,
                from: $ciCommon.isNotNull(from) ? from : undefined,
                refInstanceId: $ciCommon.isNotNull(refInstanceId) ? refInstanceId : undefined
            };
        }
        if(gsearch && gsearch !== "null"){
            $ciCommon.setSearchText(gsearch);
        }
        $ciCommon.isFileProtectionRequired = (isFileProtectionRequired && isFileProtectionRequired === 'true');
        try {
            $ciCommon.renderPage(dataObj);
        } catch (e) {
            $ciCommon.renderPage({});
        }
    },
    /**
     * starting point to load cmdb tab pages
     * @param {object} dataObj
     */
    renderPage: function (dataObj) {
        const _self = this;
        // set first available site
        _self.removeUnknownDevicesAlert();
        _self.removeBrosewrTitle();
        if (dataObj.mode != null && dataObj.mode != "null") {
            _self.mode = dataObj.mode;
            if(dataObj.mode !== "popup" && dataObj.mode !== "list_popup"){
                _self.setFirstSite();
                _self.setCanShowMarkAsCIButton();
            }
            _self.getModel(dataObj,function(model){
                switch (dataObj.mode) {
                    case 'popup': //NO I18N
                        // in popup, remove pcpding for parent element
                        jQuery("#cmdb-parent").parent().removeClass("p10");
                        _self.isPopup = true;
                        _self.popupFrom = dataObj.from;
                        _self.defaultTab = dataObj.defaultTab;
                        if (dataObj.defaultAssociatedModule){
                            $ciAssociation.setListToRender(dataObj.defaultAssociatedModule);
                        }
                        dataObj.mode = 'details'; //NO I18N
                    case 'details': //No I18N
                        _self.hideHomePage();
                        _self.loadDetailsPage(model);
                        _self.setBroswerTitle("detailsPage");   //No I18N
                        break;
                    case 'add': //No I18N
                    case 'edit': //No I18N
                        _self.hideHomePage();
                        _self.loadFormPage(model, 'Right-Section', dataObj.mode);   //No I18N
                        if(dataObj.mode === 'edit'){
                            _self.setBroswerTitle("editPage");  //No I18N
                        }
                        break;
                    case 'bulkEdit': //NO I18N
                        _self.loadFormPage(model, 'cmdb_bulk_edit_container', dataObj.mode); //No I18N
                        break;
                    case 'list_popup': //No I18N
                        _self.isListPopup = true;
                        _self.refEntity = dataObj.refEntity;
                        _self.refField = dataObj.refField;
                        $ciList.initListPopup(dataObj);
                        break
                    case 'list': //NO I18N
                        _self.loadListView(dataObj);
                        _self.loadUnknownDevicesAlert();
                }
            });
        } else {
            _self.setFirstSite();
            _self.setCanShowMarkAsCIButton();
            addPersonalization("cmdb_current_url", {    //No I18N
                "type": "null"  //No I18N
            });
        jQuery('#Right-Section').html('<div id="listview" class="listview primary"><div id="OVerallBusinessView"><div id="business-Right-Section"></div></div><div id="AllCIView"><div id="ci-Right-Section" class="hr-light borBeded"></div></div></div>');
            $ciList.getAllCItypeList('ci_type'); //NO I18N
            $ciList.loadRightPanel('businessview'); //NO I18N
            _self.loadUnknownDevicesAlert();
        }
        jQuery(window).off("click").on('resize', function(){    //NO I18N
            _self.resizeWindows();
        });
    },
    /**
     * construct ciCommon datas
     * @param {*} dataObj
     * @returns
     */
    getModel: function (dataObj,callback) {
        const _self = this;
        _self.setMetadata(dataObj.module, function(){
            // set entity data
            _self.setEntityData(dataObj,function(){
                // set hierarchy path
                _self.originalMetadata.metadata.module_details.hierarchy = (_self.originalMetadata.metadata.hierarchy ? _self.getHierarchyPath(_self.originalMetadata.metadata.hierarchy, "") + " / " : "") + _self.getDisplayName();

                if (_self.mode !== 'list' && _self.mode !== "list_popup") {
                    const metadata_resp = jQuery.extend(true, {}, _self.originalMetadata.metadata);
                    metadata_resp.layouts = [metadata_resp.layout];

                    delete metadata_resp.layout;
                    if (metadata_resp.layouts[0].help_text) {
                        metadata_resp.help_text = metadata_resp.layouts[0].help_text;
                    }
                    for (let sectionIndex = 0; sectionIndex < metadata_resp.layouts[0].sections.length; sectionIndex++) {
                        let section = metadata_resp.layouts[0].sections[sectionIndex];
                        for (let fieldIndex = 0; fieldIndex < section.fields.length; fieldIndex++) {
                            let field = section.fields[fieldIndex];
                            if (field.name === "name") {
                                metadata_resp.module_details.primary_field_full_name = field.name;
                                metadata_resp.module_details.primary_index = [sectionIndex, fieldIndex];
                            }
                            if ((_self.mode === 'bulkEdit' || _self.mode === 'details' || _self.mode === 'popup') && field.name == 'name') {
                                metadata_resp.layouts[0].sections[sectionIndex].fields.splice(fieldIndex, 1);
                                fieldIndex--; // Adjust index after removal
                            }
                            //if mode is bulkEdit, remove the fields which are unique and mandatory
                            else if (_self.mode === 'bulkEdit' && (field.unique || field.mandatory)) {
                                metadata_resp.layouts[0].sections[sectionIndex].fields.splice(fieldIndex, 1);
                                fieldIndex--; // Adjust index after removal
                            }
                            if (field.name !== 'name' && field.name !== 'description' && field.name !== 'site' && field.name !== 'status') {
                                field.context = 'udf_fields'; //No I18N
                            }
                        }
                    }
                    _self.modifiedLayout = { layouts: metadata_resp.layouts };
                    const model = _self.returnModel(dataObj);
                    if(_self.mode == 'details' || _self.mode == 'popup'){
                        $ciAssociation.setAssociationSummary(model,callback);
                    }
                    else{
                        callback(model);
                    }
                }
                else {
                    callback();
                }
            });
        });
    },
    /**
     * construct model
     * @param {*} dataObj
     * @returns
     */
    returnModel: function (dataObj) {
        const _self = this;
        const data = _self.entityData;
        const model = {
            module: dataObj.module,
            mode: dataObj.mode,
            entity_id: dataObj.entity_id,
            ids: dataObj.ids ? dataObj.ids : null,
            permissions: data.links,
            data: {
                entity_data: data,
            },
            icon: (_self.originalMetadata.metadata.module_details.icon) ? _self.originalMetadata.metadata.module_details.icon['content-url'] : null, //No I18N
            module_details: jQuery.extend(true, {}, _self.originalMetadata.metadata.module_details)
        };
        return model;
    },
    /**
     * get metadata
     * @param {*} module
     * @returns
     */
    setMetadata: function (module,callback) {
        const _self = this;
        if (_self.originalMetadata != null &&_self.originalMetadata.metadata && _self.originalMetadata.metadata.module_details.api_plural_name === module) {
            if(callback){
                return callback();
            }
        }
        return sdpAjax({
            url: '/api/v3/' + module + '/_metadata', //No I18N
            ignorefailuremessage: true,
            success: function (response) {
                _self.originalMetadata = response;
                _self.modifiedMetainfo = undefined;
                if(callback){
                    return callback();
                }
            },
            error :function(resp){
                // when metadata call fails, we need to redirect to businessview list view. eg: when the deleted citype list view loaded from browser history
                showalert("failure",translate('cmdb.deleted.citype.warning'),'isAutoHide=true'); //No I18N
                $ciCommon.renderPage({});
                return;
            }
        });
    },
    /**
     * return
     * @param {object} object
     * @param {string} keys
     */
    hasValue(object, key) {
        return object[key] !== undefined && object[key] !== null && object[key] !== "null";
    },
    setEntityData: function (dataObj,callback) {
        const _self = this;
        let responseName = _self.getAPIName();
        let path = "";
        const hasRequiredFieldForURL = _self.hasValue(dataObj,'refEntity') && _self.hasValue(dataObj,'refInstanceId') && _self.hasValue(dataObj,'refField');
        const hasNonCMDBRole = !sdp_user.ROLES.contains('ViewCI') && !sdp_user.ROLES.contains('ViewAssociatedCI');
        if( hasRequiredFieldForURL && hasNonCMDBRole){
            path = dataObj.refEntity + "/" + dataObj.refInstanceId + "/" + dataObj.refField;
            responseName = "ci"; //NO I18N
        } else {
            path = _self.getAPIPluralName();
        }
        const canSetLinks = dataObj.mode === 'add' || dataObj.mode === 'list' || dataObj.mode === 'bulkEdit';   //NO I18N
        const canSetData = dataObj.mode === 'details' || dataObj.mode === 'edit' || dataObj.mode === 'popup';   //NO I18N
        if (canSetLinks){
            _self.setLinks(_self.getAPIPluralName(),callback)
        }
        else if (canSetData){
            _self.setAPIData(responseName, path, dataObj.entity_id,callback)
        }
        else{
            if(callback){
                callback();
            }
        }

    },
    /**
     * set first site for logged in tech
     * @returns
     */
    setFirstSite: async function () {
        const _self = this;
        if (_self.firstSite && jQuery.isEmptyObject(_self.firstSite) == false) {
            return;
        }
        const response = await _self.getFirstRow("/api/v3/cmdb/site");    //NO I18N
        _self.firstSite = response.site[0];
    },
    /**
     * returns only the first row for the url
     */
    getFirstRow : function(url,search_criteria){
        const input_data = {
             list_info: {
                 row_count: 1,
                 sort_field: "name", //No I18N
                 sort_order: "asc",   //No I18N
             }
         };
         if(search_criteria){
            input_data.list_info.search_criteria = search_criteria;
         }
        return sdpAjax({
            url: url,
            data: sdpAjaxInputData(input_data)
        });
    },
    /**
     * construct heirarchy path
     * @param {*} obj
     * @param {*} path
     * @returns string
     */
    getHierarchyPath: function (obj, path) {
        const _self = this;
        if (obj.child) {
            return _self.getHierarchyPath(obj.child, path + obj.display_name + ' / ');
        }
        return path + obj.display_name;
    },
    /**
     * set links for api_plural_name
     * @param {*} api_plural_name
     * @returns
     */
    setLinks: function (api_plural_name,callback) {
        const _self = this;
        sdpAjax({
            url: "/api/v3/" + api_plural_name + "/_links", // No I18N
            success: function (response) {
                const links = {};
                response._links.forEach(function (link) {
                    links[link.name] = link;
                });
                _self.entityData = jQuery.extend(true,{},{links:links});
                if(callback){
                    callback();
                }
            },
        });
    },
    /**
     * set entity data for module (path) and entity_id
     * @param {*} name
     * @param {*} path
     * @param {*} entity_id
     * @returns
     */
    setAPIData: function (name, path, entity_id,callback) {
        const _self = this;
        let entitydata = null;
        const input_data = {
            include: ["links"]
        };
        if (this.isPopup != 'popup') {
            input_data.add_recent_item = true;
        }
        sdpAjax({
            url: '/api/v3/' + path + '/' + entity_id, //No I18N
            data: sdpAjaxInputData(input_data),
            success: function (resp) {
                entitydata = resp[name];
                entitydata.links = {}
                if(resp._links){
                    resp._links.forEach(function (link) {
                        entitydata.links[link.name] = link;
                    });
                }
                _self.entityData = jQuery.extend(true,{},entitydata);
                if(callback){
                    callback();
                }
            },
        });
    },
    loadDetailsPage: function (model) {
        $ciForm.renderDetails(model);
    },
    loadListView: function (dataObj) {
        const _self = this;
        const listHTML = `
        <div id="listview" class="listview primary">
            <div id="OVerallBusinessView">
                <div id="business-Right-Section"></div>
            </div>
            <div id="AllCIView">
                <div id="ci-Right-Section"></div>
            </div>
        </div>`;
        jQuery('#Right-Section').html(listHTML);
        $ciList.getAllCItypeList('ci_type'); //NO I18N
        jQuery("#cmdb_content_pannel").hide();
        jQuery("#cmdb-left-panel").parent().removeClass("hide").addClass("disp-c");
        if (dataObj.module == 'cmdb') {
            $ciList.switchLeftPanelView(jQuery('#ci-left-jstree'), 'cilist') //NO I18N
        } else {
            $ciList.loadRightPanel('cilist', _self.getAPIPluralName(), _self.getAPIName()); //NO I18N
        }
    },
    loadFormPage: function (model, id, mode) {
        renderhbs('#' + id, 'cmdb-form', model, false, 'cmdb'); //No I18N
        jQuery("#previous-page-form").off('click').on('click', function () {    //No I18N
            FC.cancel("form_cmdb_form",event);  //No I18N
            return false;
        });
        $ciForm.renderForm(mode == 'bulkEdit' ? 'edit' : mode, model);  //No I18N
    },
    setCanShowMarkAsCIButton: async function () {
        const _self = this;

        if (_self.canShowMarkasCIButton != null) {
            return _self.canShowMarkasCIButton;
        }
        const isUserContainsEditRole = sdp_user.ROLES.contains('ModifyCI') || sdp_user.ROLES.contains('CreateCI');    //NO I18N
        if (!isUserContainsEditRole) {
            _self.canShowMarkasCIButton = false
            return;
        }
        const search_criteria = [{
            field : "name",
            condition : "is not",
            value : "asset_sub_switch_port"
        }];
        const response = await _self.getFirstRow("/api/v3/cmdb/linked_entity",search_criteria);    //NO I18N
        const data = response.linked_entity;
        if (data.length > 0) {
            _self.canShowMarkasCIButton = true;
            _self.firstLinkedEntity = data[0];
        } else {
            _self.canShowMarkasCIButton = false;
        }
    },
    pushingStateURL: function (citype, mode, entity_id, hash) {

        let urlStr = citype === 'businessview' ? "/BusinessView.do?operation=openBusinessView" : "/ui/cmdb_module?"; //NO I18N

        function addParam(param) {
            urlStr = urlStr + param;
        }

        if (citype != "businessview") {
            addParam("ci_type=" + citype); //NO I18N
        }

        if (mode) {
            addParam("&mode=" + mode); //NO I18N
        }

        if (entity_id) {
            addParam("&ciid=" + entity_id); //NO I18N
        }
        if(mode == 'list' && this.getSearchText()) {
            addParam("&gsearch=" + this.getSearchText())    //No I18N
        }
        if (hash && hash !== "null") {
            addParam("#" + hash);
        }

        const stateObj = {
            ci_type: citype,
            mode: mode,
            entity_id: entity_id,
            hash: hash
        }
        // When hash is appended, we need to replace the state instead of adding new state
        // since, tab switch history is not required
        if (hash) {
            window.history.replaceState(stateObj, '', urlStr); //NO I18N
        }
        else{
            window.history.pushState(stateObj, '', urlStr); //NO I18N
        }
    },
    /**
     * hide home page when opening form or details page
     */
    hideHomePage: function () {
        jQuery("#cmdb-left-panel").parent().addClass("hide").removeClass("disp-c");
        jQuery("#cmdb_content_pannel").show();
        jQuery('#business-Right-Section').empty();
        jQuery('#ci-Right-Section').empty();
    },
    /**
     * get callback nanme for linked_entity name
     * @param {*} entity
     * @returns
     */
    getCallBackName: function (entity) {
        switch(entity) {
            case "asset_assets":    //NO I18N
                return 'assets'; //NO I18N
            case "users":   //NO I18N
                return 'user'; //NO I18N
            case "departments": //NO I18N
                return 'department'; //NO I18N
            case "support_groups":  //NO I18N
                return 'groups'; //NO I18N
            case "service_categories":  //NO I18N
                return 'service_category'; //NO I18N
            default:
                return entity;
        }
    },
    /**
     * construct name for selected data in bulkselect dropdown
     * @param {*} audit
     * @returns
     */
    constructSelectedListCB: function (audit) {
        return e_html(audit.name);
    },
    constructSelectedListCBSW: function (audit) {
        return e_html(audit.software.name) + " (" + audit.workstation.name + ")";
    },
    /**
     * get links for the module
     * @param {*} api_plural_name
     * @param {*} callbak
     */
    getTemplateData: function (api_plural_name, callbak) {
        sdpAjax({
            url: "/api/v3/" + api_plural_name + "/_links", // No I18N
            success: function (response) {
                const links = {};

                response._links.forEach(function (link) {
                    links[link.name] = link;
                });
                callbak(links);
            }
        });
    },
    /**
     * init site filter for the module on element id
     * @param {*} api_plural_name
     * @param {*} elementId
     */
    initSiteFilter: function (api_plural_name, subField, elementId,selectedValue) {
        const options = {
            placeholder: translate("sdp.admin.org.technician.allsite"), // No I18N
            allowClear: true,
            url: [{
                url: "/api/v3/" + api_plural_name + (subField ? "/" + subField : "") + "/site", //NO I18N
                field: 'site' //NO I18N
            }],
        };
        if(selectedValue){
            options.value = selectedValue;
        }
        jQuery("#" + elementId).sdp_select2(options);
    },
    /**
     * apply site filter
     * @returns
     */
    applySiteFilter: function (elementId,tableObject) {
        let siteCriteria = $ciCommon.getSiteCriteria(elementId);
        tableObject.t_obj.table_info.list_info.search_criteria = siteCriteria;
        /**
         * clear the inline search when site filter is applied, since we can't determine the site criteria is removed or not
         */
        tableObject.changeFilterString("clearSearch"); // No I18N
    },
    /**
     * construct site criteria
     */
    getSiteCriteria : function(element){
        const siteId = jQuery("#"+element).val();
        if (siteId){
            return {
                field: (siteId == "-1" ? "site" : "site.id"), // NO I18N
                value: (siteId == "-1" ? null : siteId),
                condition: "is", // No I18N
                logical_operator: "and" // No I18N
            }
        }
        return undefined;
    },
    /**
     *  get product type filter
     */
    getProductTypeFilter : function(){
        const productTypeId = jQuery("#product_type_select2").val();
        if (productTypeId){
            const childIds = $ciCommon.getChildsId(productTypeId, $ciList.hierarchyData, [productTypeId]);
            return {
                field: "module",    // No I18N
                values: childIds,
                condition: "in", // No I18N
                logical_operator: "and" // No I18N
            }
        }
        return undefined;
    },
    callbackSearchFunctionForOtherModuleListView : function(type,tableObject){
        if(type !== "tableSearch"){ //No I18N
            return;
        }
        var searchCriterias = tableObject.t_obj.table_info.list_info.search_criteria;

        if(!Array.isArray(searchCriterias) && !jQuery.isEmptyObject(searchCriterias)){
            let childrenCriteria = searchCriterias.children;
            delete searchCriterias.children;
            searchCriterias = [searchCriterias];
            if (childrenCriteria && childrenCriteria.length > 0){
                searchCriterias = searchCriterias.concat(childrenCriteria);
            }
        }
        /**
         * if site filter selected, need to apply site filter
         */
        const siteCriteria = $ciCommon.getSiteCriteria("site-other-module-filter"); //No I18N
        if (siteCriteria){
            if(searchCriterias){
                searchCriterias.push(siteCriteria);
            } else {
                searchCriterias = [siteCriteria];
            }
        }
        /**
         * if product type filter selected, need to apply product type filter
         */
        const prodTypeCriteria = $ciCommon.getProductTypeFilter();
        if (prodTypeCriteria){
            if(searchCriterias){
                searchCriterias.push(prodTypeCriteria);
            } else {
                searchCriterias = [prodTypeCriteria];
            }
        }

        tableObject.t_obj.table_info.list_info.search_criteria = searchCriterias;

        tableObject.refreshTable('search'); // No I18N
    },
    /**
     * get api plural name for the module
     */
    getAPIPluralName: function () {
        return this.originalMetadata ? this.originalMetadata.metadata.module_details.api_plural_name : null;
    },
    /**
     * get api name for the module
     */
    getAPIName : function(){
        return this.originalMetadata ? this.originalMetadata.metadata.module_details.name : null;
    },
    /**
     * get display name for the module
     * @returns
     */
    getDisplayName : function(){
        return this.originalMetadata.metadata.module_details.display_name;
    },
    /**
     * get module id for the module
     */
    getModuleId : function(){
        return this.originalMetadata ? this.originalMetadata.metadata.module_details.id : null;
    },
    /**
     * get metainfo for the module
     */
    getOriginalMetainfo : function(){
        return this.originalMetadata.metadata.metainfo;
    },
    /**
     * remove association type field from metainfo and return
     */
    getMetainfo : function(){
        const _self = this;
        if(_self.modifiedMetainfo){
            return _self.modifiedMetainfo;
        }
        const metainfo = jQuery.extend(true, {}, _self.originalMetadata.metadata.metainfo);
        for (let key in metainfo.fields) {
            if (metainfo.fields[key].type === 'Association') {
                delete metainfo.fields[key];
            }
        }
        _self.modifiedMetainfo = metainfo;
        return metainfo;
    },
    /**
     * remove association type field from metainfo and return
     * Since metainfo sent in form component is modified in component, so having seperate method for advance filter
     */
    getMetainfoForAdvanceFilter : function(){
        const _self = this;
        if(_self.advanceFilterMetainfo){
            return _self.advanceFilterMetainfo;
        }
        const metainfo = jQuery.extend(true, {}, _self.originalMetadata.metadata.metainfo);
        for (let key in metainfo.fields) {
            if (metainfo.fields[key].type === 'Association') {
                delete metainfo.fields[key];
            }
        }
        _self.advanceFilterMetainfo = metainfo;
        return metainfo;
    },
    getCIID : function(){
        return this.entityData.id;
    },
    /**
     * get CIName for the module
     */
    getCIName : function(){
        return this.entityData.name;
    },
    isActiveCI : function(){
        return !this.entityData.inactive;
    },
    /**
     * get display name for the selected data in select2
     * @param {*} object
     */
    getDisplayNameAsReturnField : function(object){
        return e_html(object.display_name);
    },
    /**
     * construct header menu to navigate through parent in list view
     */
    getHeadermenu : function(){
        const _self = this;
        let path = _self.getChilds(_self.originalMetadata.metadata.hierarchy,[]);
        let headerMenu = '';
        path.map(function (obj) {
            headerMenu = headerMenu + `<a href="/" name="list_view_navigation" data-id="${obj.id}" data-module="${obj.name}" class="ml5 text-color5">${e_html(obj.display_name)} /</a>`;
        });
        headerMenu = headerMenu + '<span class="ml5 text-color5"> ' + e_html(_self.originalMetadata.metadata.module_details.display_name) + '</span>';
        return headerMenu;
    },
    /**
     * get array of childs for the module
     */
    getChilds : function(obj,array){
        if (obj && obj.id){
            array.push({
                id: obj.id,
                name: obj.name,
                display_name: obj.display_name
            });
            return this.getChilds(obj.child,array);
        }
        return array;
    },
    /**
     * get other module fields
     */
    getOtherModuleFields : function(){
        return this.otherModuleFields;
    },
    filterRequiredFields : function(fields,module){
        const _self = this;
        const userFields = ["email_id","extension","reporting_to","type","can_generate_authtoken","department","first_name","jobtitle","mobile","project_roles","last_name","middle_name","created_by","login_name","phone","sip_user","employee_id","domain","name","enable_telephony"];  //NO I18N
        const departmentFields = ["department_head","site","name","description","id"];  //NO I18N
        const serviceCategoryFields = ["name","description","id"];  //NO I18N
        const assetFields = ["name","total_cost","org_serial_number","state","barcode","loan_end","operational_cost","asset_tag","created_time","module","created_by","part_no","last_operation_triggered_by","purchase_order","acquisition_date","manufacturer","modified_time","current_cost","vendor","purchase_cost","department","loan_start","product","last_scan_status","expiry_date","used_by_asset","warranty_expiry","site","modified_by","location","is_loaned","last_scan_time","user"];   //NO I18N
        const supportGroupsFields = ['site','name','description','sender_name','id','sender_email_id']; //NO I18N
        let modifiedFields = {};
        switch(module){
            case "users":   //NO I18N
                _self.doFilter(fields,modifiedFields,userFields);
                break;
            case "departments": //NO I18N
                _self.doFilter(fields,modifiedFields,departmentFields);
                break;
            case "service_categories":  //NO I18N
                for (let key in fields) {
                    if (serviceCategoryFields.includes(key)) {
                        modifiedFields[key] = fields[key];
                    }
                    else if (fields[key].type === "udf") {
                        modifiedFields[key] = fields[key];
                    }
                }
                break;
            case "asset_assets":    //NO I18N
                _self.doFilter(fields,modifiedFields,assetFields);
                break;
            case "support_groups":  //NO I18N
                _self.doFilter(fields,modifiedFields,supportGroupsFields);
                break;
            default:
                modifiedFields = fields;
        }
        return modifiedFields;
    },
    doFilter : function(fields,modifiedFields,requiredFields){
        for (let key in fields) {
            if (requiredFields.includes(key)) {
                modifiedFields[key] = fields[key];
            }
            else if (fields[key].type === "udf") {
                modifiedFields[key] = fields[key];
            }
        }
    },
    isNotNull : function(data){
        return data !== undefined && data !== null && data !== "null";
    },
    doSdpAjaxCall : function(path){
        return sdpAjax({url : "/api/v3/" + path});
    },
    /*
    * resize window dynamically
    */
    resizeWindows: function (){
        const td_c_h = jQuery(window).height() - ( jQuery('#header-placeholder').outerHeight() + is_chathgt + 170 ); // No I18N
        const parentElement = jQuery("#cmdb-parent");
        if(parentElement.find('#JSTree').height() !== td_c_h) {
            parentElement.find('#JSTree').css({'height':td_c_h+'px'}); //NO I18N
        }
    },
    /*
    *  set other module fields and then render table for other module
    */
    setOtherModuleFields : function(module,callback){
        const _self = this;
        sdpAjax({
            url : "/api/v3/"+module+"/_metainfo", //NO I18N
            success : function(response){
                _self.otherModuleFields = _self.filterRequiredFields(response.metainfo.fields,module);
                callback();
            }
        });
    },
    /**
     * set search text for global search
     */
    setSearchText : function(searchText){
        this.searchText = searchText;
        jQuery("#subheader_search_box").val(searchText);
    },
    /**
     * remove search text for global search
     */
    removeSearchText : function(){
        this.searchText = null;
    },
    /**
     * get search text for global search
     */
    getSearchText : function(){
        return this.searchText;
    },
    /**
     * get all child id for the module
     */
    getChildsId : function(parentId,hierarchyData,childIds){
        const parentData = hierarchyData.find((data) => data.id == parentId);
        if (parentData && parentData.children){
            parentData.children.forEach((child) => {
                childIds.push(child.id);
                this.getChildsId(child.id,hierarchyData,childIds);
            });
        }
        return childIds;
    },
    /**
     * Method to get display name of field for api name
     */
    getDisplayNameOfField : function(apiName){
        const _self = this;
        const fields = _self.getMetainfo().fields;
        for (let key in fields) {
            if (key === apiName) {
                return fields[key].display_name;
            }
            if (fields[key].type === "udf") {
                if (fields[key].fields) {
                    for (let field in fields[key].fields) {
                        if (field === apiName) {
                            return fields[key].fields[field].display_name;
                        }
                    }
                }
            }
        }
        return apiName;
    },
    setBroswerTitle : function(type){
        jQuery("#browserTitleInfo").find("#bt_id").text(this.getCIID()).end().find("#bt_title").text(this.getCIName());// No I18N
        jQuery("#browserTitleInfo").data("page",type);  //No I18N
        applyBrowserTitle();
    },
    removeBrosewrTitle : function(){
        jQuery("#browserTitleInfo").find("#bt_id").text("").end().find("#bt_title").text("");// No I18N
        jQuery("#browserTitleInfo").data("page",'');    //No I18N
        applyBrowserTitle();
    },
    removeUnknownDevicesAlert : function(){
        jQuery("#cmdb_alert_header").html("").removeClass("pb10");
    },
    loadUnknownDevicesAlert : function(){
        const _self = this;
        sdpAjax({
            url: "/api/v3/cmdb/_get_unknown_devices", //No I18N
            success: function (response) {
                const isAPMDevice = response.get_unknown_devices.is_apm_device;
                const isOPMDevice = response.get_unknown_devices.is_opm_device;
                const isSDAdmin = sdp_user.ROLES.contains('SDAdmin');   //NO I18N
                if (isAPMDevice || isOPMDevice) {
                    const opmTitle = translate('meintegration.opmanager.title');
                    const apmTitle = translate('meintegration.apm.title');
                    const integrationName = isAPMDevice && isOPMDevice ? opmTitle +"/" + apmTitle : (isAPMDevice ? apmTitle : opmTitle);
                    const msg = translate('integration.module.alert.device.not.synced',[integrationName]);
                    const opmSettings = translate('integration.module.alert.opm.settings');
                    const apmSettings = translate('integration.module.alert.apm.settings');
                    const alert =
                    `<div class="disp-flex align-vh-center p0">
                        <div class="alert alert-warning icon m0" role="alert">
                                <div class="msg">
                                    <span> ${msg}</span>
                                    ${isOPMDevice && isSDAdmin ? '<a href="/app#/admin/opmanager" target="_blank" class="ml10 maxw-120px text-overflow" title="'+opmSettings+'" rel="uitip" mode_ellipsis="true" >'+opmSettings+'</a>' : ''}
                                    ${isAPMDevice && isSDAdmin? '<a href="/app#/admin/appmanager" target="_blank" class="ml10 maxw-120px text-overflow" title="'+apmSettings+'" rel="uitip" mode_ellipsis="true" >'+apmSettings+'</a>' : ''}
                                </div>
                        </div>
                    </div>`;
                    jQuery("#cmdb_alert_header").addClass("pb10").html(alert);
                    initTooltip("#cmdb_alert_header");   //NO I18N
                }
            }
        });
    }
};