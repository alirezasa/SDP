"use strict";// No I18N
var assetsObj = {
    assetModTemplateData : {
        metaDataWithId:{},
        metaDataWithoutId:{}
    },
    popup: {
        /**Execute function to Open asset list view in popup  
         * @param {string} forwardTo
         * @param {string} module
         * @param {*} id
         * @param {string} tabName
         * @param {string} moduleType
         * @param {string} from
         * @param {string} title
         * @returns
        */
        open: function (forwardTo, module, type_id, id, tabName, moduleType, from, title) {
            let addParam = (key, value) => {
                if(value && typeof value != "undefined"){// No I18N
                    params += (key + "=" + value) + "&";// No I18N
                }
            }


            let params = ""; // No I18N
                addParam("forwardTo", forwardTo);// No I18N
                addParam("module", module);// No I18N
                
                addParam("tabName", tabName);// No I18N
                addParam("moduleType", moduleType);// No I18N
                addParam("from", from);// No I18N
                    //To load asset details with ci details, getting ci_id using asset_id in asset tab.
                addParam("entity_id", id);// No I18N

            if (from == "showdetails") {// No I18N
                title = getMessageForKey("sdp.dashboard.view.All_Assets");// No I18N
            }

            this.openDialog("/asset/AssetPopup.jsp?" + params + "externalframe=true", title, this.getOptions(forwardTo));// No I18N
        },
        /**Execute function to get options  of dilaog box 
         * @param {string} forwardTo
         * @returns
        */
        getOptions: function (forwardTo) {
            const self = this;
            let options = {
                width: jQuery(window).width() * 95 / 100,
                height: jQuery(window).height() * 95 / 100,
                modal: true,
                resizable: false,
                close: function () {
                    self.dialog && self.dialog.remove();
                    if(jQuery('#request-form-dialog').length > 0) {
                        //SD-115131 fix => "of-h" class removed from body when dialog is closed thus making body scollable when we have preview component in background. So add "of-h" class to body again.
                        jQuery('body').addClass('of-h');
                    }
                }
            };

            if (forwardTo === "form") {
                const maxWidth = 1900;

                options.create = function () {
                    jQuery(this).css("maxWidth", maxWidth + "px"); //NO I18N
                }

                options.beforeClose = function () {
                    try {
                        return document.querySelector("#asset_dialog > iframe").contentWindow.window.FC.exitHandler(); // No I18N
                    } catch (e) {
                        clientErrorHandling.error(e);
                    }
                }

                if (options.width > maxWidth) {
                    options.width = maxWidth;
                }
            }

            return options;
        },
        /**Open asset listview popup
         * @param {*} url
         * @param {*} title
         * @param {*} dialogOptions
          */
        openDialog: function (url, title, dialogOptions) {
            const dialog = jQuery(
                `<div style="width: 100%;height:100%;overflow: hidden;" id="asset_dialog">\
                <iframe width="100%" height="100%" name="asset_popup" frameBorder="0" src=${url}>\
                </iframe>\
            </div>`);

            var options = typeof dialogOptions === "function" ? dialogOptions() : dialogOptions; // No I18N

            assetsObj.dialog = dialog.dialog(options);

            if(title){
                this.setDialogTitle(title);
            }
        },
        setDialogTitle: function (html) {
            const getTilteEle = (typeof $extFrame.getActiveWindow().assetsObj=='undefined' || typeof $extFrame.getActiveWindow().assetsObj.dialog=='undefined') ? (assetsObj ? assetsObj : window.top.assetsObj)  : $extFrame.getActiveWindow().assetsObj;// No I18N
            getTilteEle.dialog.prev('.ui-dialog-titlebar').find('.ui-dialog-title').html(html); // No I18N
        }
    },
    /**Call printpreview function
     *  @param {*} id
     *  @param {*} module
     */
    callPrintpreview : function(id,module){
        const self = this;
        self.printPreview = true;
        self.redirectToEntity("detail", id, null, null, module); // No I18N
    },
    /**
     * get basic details of asset 
     * @param {*} id 
     * @param {*} module 
     * @param {*} entity 
     * @returns 
     */
    getAssetBasicDetails: function (id, module, entity) {
       let basicData = {};
       const field = "asset";// No I18N
       let params = "";

        if (module === "basic_info") { //NO I18N
            params += "&entity=" + field; //NO I18N
        }
        if (id) {
            if(id == "search"){ //NO I18N
                params += "&search=" + encodeURIComponent(entity); //NO I18N
            }else{
               params += "&id=" + (id); //NO I18N
            }
        }

        sdpAjax({
            url: "/servlet/AssetApiServlet?module=" + module + params, //NO I18N
            success: function (data) {
            basicData = data.basic_info || data;
            },
            skipSUBREQUEST: true,
            async: false
        });
       return basicData;
    },
    /**
     * get current product type name 
     * @param {*} id 
     * @returns 
     */
    getProductTypeName: function (id) {
        let name = "";
        const entity_url = "all_product_types";//NO I18N
        sdpAjax({
            url: "/api/v3/" + entity_url + "/" + id, //NO I18N
            success: function (response) {
                name = response.all_product_type.name;
            },
            async: false,
            failedCallBack: function() {
                //TODO
            },
            ignorefailuremessage: true
        });
        return name;
    },
    /**
     * get product type display name for header in right section listview page
     * @param {*} pluralName 
     * @returns 
     */
    getProductTypeDisplayName: function (pluralName) {
        return new Promise(function (resolve, reject) {
            const leftNavContainer = jQuery("#asset_left_nav_container");
            if(leftNavContainer.length) {
                resolve(leftNavContainer.jstree("get_node", { id: assetListView.module }).text);//NO I18N
            } else {

                 const getDisplayName = assetsObj.assetModTemplateData.metaDataWithoutId.hasOwnProperty(assetListView.module) && assetsObj.assetModTemplateData.metaDataWithoutId[assetListView.module].module_details.display_plural_name;
                 resolve(getDisplayName);
            }
        });
    },
    /**
     * 
     * @param {*} forwardTo 
     * @param {*} id 
     * @param {*} tabName 
     * @param {*} type_id 
     * @param {*} module 
     * @param {*} moduleType 
     * @param {*} from 
     * @param {*} tabs 
     */
    redirectToEntity : function(forwardTo, id, tabName, type_id, module, moduleType, from, tabs){
    	const getModuleType = moduleType == "undefined" ? "" : moduleType; // No I18N
        if(assetsObj.doPush != false){
            assetsObj.doPush = true;
        }
        this.redirectTo(forwardTo, module, type_id , id, tabName, getModuleType, from, "", tabs);
    },
    /**
     * 
     * @param {*} module 
     * @param {*} type_id 
     * @param {*} moduleType 
     * @param {*} from 
     * @param {*} productType 
     * @param {*} externalframe 
     * @param {*} computer_group 
     */
    redirectToEntityList : function(module, type_id, moduleType, from, productType, externalframe, computer_group){
        assetsObj.productType = productType;
        assetsObj.externalframe = externalframe;
        this.redirectTo("list", module, type_id, "", "", moduleType, from, undefined, undefined, computer_group); // No I18N
    },
    /**
     * Load jsp file fot bulk edit
     * @param {*} container 
     * @param {*} url 
     */
    load: function(container, url) {
        jQuery("#asset-details, #asset-form").empty();
        url += "&externalframe=" + externalframe; // No I18N
        container.load(url, function (response, status) {
            if (status === "error") {
                container.html(response);
                return false;
            }
        });
        container.show();
    },
    /**
     * Redirect to related pages (add/edit/details/listview) based on forwardto 
     * @param {*} forwardTo 
     * @param {*} module 
     * @param {*} type_id 
     * @param {*} id 
     * @param {*} tabName 
     * @param {*} moduleType 
     * @param {*} from 
     * @param {*} searchText 
     * @returns 
     */
    redirectTo: function (forwardTo, module, type_id, id, tabName, moduleType, from, searchText) {
        if(!window.assetRoute) {
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-route.js"] : ["/scripts/asset_module_min.js", "/scripts/hbs-template-assets.js"], // No I18N
               success: function() {
                    assetRoute.redirectToAssetPage(forwardTo, module, type_id, id, tabName, moduleType, from, searchText)
                }
        });
                            }else{
            assetRoute.redirectToAssetPage(forwardTo, module, type_id, id, tabName, moduleType, from, searchText);
            }
    },
    /**
     * set layout details from module specific to current asset
     * @param {string} module
     * @param {*} id
     */
    setLayoutDetails:function(module,id){
        const self = this;
        let getMetaObjWithId = self.assetModTemplateData.metaDataWithId;
        const getMetaObjWithoutId = self.assetModTemplateData.metaDataWithoutId;
        let cloneCommonMetaObj = Object.assign({}, getMetaObjWithoutId[module]);
        delete cloneCommonMetaObj._links;
        delete cloneCommonMetaObj.metainfo;
        getMetaObjWithId[id] = jQuery.extend({},getMetaObjWithId[id],cloneCommonMetaObj);
        getMetaObjWithId[id].metainfo = getMetaObjWithId[id].meta_info;
        delete getMetaObjWithId[id].meta_info;
    },
    /**
     * Used to get computer hierarchy from
     * @param {*} module_data
     * @returns
    */
    isComputerHierarchy : function(module_data){
        if(module_data){
            if(module_data.child && module_data.child.internal_name=="Computer"){// No I18N
                return true
                    }
            else{
                return false
                }
            }
        return false
    },
    /**
     * Used to get workstation hierarchy from
     * @param {*} module_data
     * @returns
    */
    isWorkstationHierarchy : function(module_data){
        if(module_data){
            if(module_data.child && module_data.child.api_name=="asset_computer"){// No I18N
                if(module_data.child.child && module_data.child.child.api_name=="asset_workstation"){// No I18N
                    {
                return true
                    }
                }
            }
            else{
                return false
                }
            }
        return false
    },
    /**
     * Used to get current asset is IT or NOT from metadata
     * @param {*} module_data
     * @returns
     */
    isITAsset : function(module_data){
        if(module_data){
            if(module_data.asset_type && module_data.asset_category){
                if(module_data.asset_type.name==="Asset" && module_data.asset_category.name==="IT"){ // No I18N
                    return true
                }
            }
            }
        return false
    },
    /**
     * Execute function to get operation source for history
     */
    getOperationSourceIdForHistory : function(){
        assetsObj.operationSource = {};
        sdpAjax({
            url:"/api/v3/asset_operation_source", // No I18N
            success: function (response) {
                const sourceArr = response.asset_operation_source;
                sourceArr.forEach(function(obj){
                    assetsObj.operationSource[obj.name] = obj.id;
                });
            },
            ignorefailuremessage: true
        });
    },
    /**
     * Used in assetForm.js file to get parent asset
     * @param {*} module_data
     * */
    getParentPath : function (module_data){
        let parents = [];
        let getParent = (data) => {
            if(data){
                if(data.child){
                    parents.push(data.display_name);
                    getParent(data.child)
                }else{
                    parents.push(data.display_name);
                }
            }
        }
        getParent(module_data);
        return parents;
    },
    /**
     * Get browser url with adding all needed parameter based on add/edit/list/details page
     * @param {*} forwardTo
     * @param {*} module
     * @param {*} typeId
     * @param {*} id
     * @param {*} tabName
     * @param {*} moduleType
     * @param {*} from
     * @param {*} type
     * @param {*} searchText
     * @returns
     */
    pushingStateURL :function(forwardTo, module, typeId, id, tabName, moduleType, from, type, searchText){
        if(this.externalframe){
            return false;
        }
        let urlStr = "";  // No I18N

        let addParam = (param) => {
            urlStr += urlStr === "" ? "/ui/asset?" : "&"; // No I18N
            urlStr += param;
        }

        if (module) {
            addParam("module=" + module); // No I18N
        }

        if(id && id != "null"){
                addParam("entity_id=" + id); // No I18N
            }

        if (typeId && typeId !== "null") {
            addParam("TypeID=" + typeId); // No I18N
        }

        if(from && from !== "null" && from != "leftpanel") {
            addParam("from=" + from); // No I18N
        }

        if(searchText) {
            addParam("gsearch=" + searchText); // No I18N
        }

        if(forwardTo=="detail"){
            addParam("mode=details");// No I18N
        }else if(forwardTo=="form"){// No I18N
            id ? addParam("mode=edit") : addParam("mode=add");// No I18N
        }else{
        addParam("mode=get");// No I18N
        }
        if(tabName){
            urlStr += "#"+tabName;
        }
        if(assetsObj.doPush){
            window.history.pushState({'forwardTo' : forwardTo, 'module': module, "entity_id": id, "tab": tabName, "moduleType" : moduleType, "computer_group": assetsObj.computer_group, "TypeID" : typeId, "type" : type, from : from, searchText : searchText}, '', urlStr); // No I18N
        }else{
            assetsObj.doPush = true;
        }
    },
    /**Used in assetDetails,js for loading loadMemoryModules */
    getGigaBits: function (bits, n) {
        if(!bits) {
            return bits;
        }
        return (bits / assetsObj.getGBConversionValue()).toFixed(n !== undefined ? n : 2);
    },
    getGBConversionValue: function() {
        return 1073741824;
    },
    /**convertToBits function in assetList.js
     * @param {*} getval
     * @param {*} getCurrMemoryUnit
    */
    getBits: function (getval,getCurrMemoryUnit) {
        return Math.round(getval * assetsObj.getConversionValue(getCurrMemoryUnit));
    },
    /**
     * Convert into bytes based on memory unit while saving
     * @param {*} getCurrMemoryUnit
     * @returns
     */
    getConversionValue: function(getCurrMemoryUnit) {
        if(getCurrMemoryUnit==="B"){
            return 1;
        }else if(getCurrMemoryUnit==="KB"){//NO I18N
            return 1024
        }else if(getCurrMemoryUnit==="MB"){//NO I18N
            return 1048576
        }else if(getCurrMemoryUnit==="GB"){//NO I18N
            return 1073741824;
        }else if(getCurrMemoryUnit==="TB"){//NO I18N
            return 1099511627776
        }else if(getCurrMemoryUnit==="PB"){//NO I18N
            return 1125899906842624
        }
    },
    /**
     * Set links data for permissions
     * @param {*} options
     * @param {*} _links
     * @param {*} tabs
     * @param {*} assetLinks
     * @returns
     */
    setLinksData: function(options, _links,  tabs, assetLinks) {
        let links_data = {};
        let links = _links;
        let linksMap = {};
                links = links.links || links;
        links = assetLinks? links.concat(assetLinks) : links;
        let permissions = {
            multiDeleteEnabled : false,
            enable_new : false,
            edit : false,
            links_scan : false,
            scan_now : false,
            scan_info: false,
            tools : false,
            generate_barcodes: false,
            add_cost: false,
            edit_cost: false,
            delete_cost: false,
            configure_depreciation: false,
            assign_state: false,
            modify_state: false,
            add_relationship: false,
	        view_associated_ci: false,
            used_by_asset_details: false
        };
        let actionBtnLinks = [];
                links.forEach(function (link) {
            /**Gerneral basic permission for edit,delete of asset, product,vendor */
                    if (link.key) {
                        linksMap[link.key] = link;
                    } else if (link.name == "edit" && link.method == "put") {//NO I18N
                        link.actionKey = "edit";//NO I18N
                        link.name = translate("common.edit");//NO I18N
                        linksMap.edit = link;//NO I18N
                    } else if (link.name == "delete" && link.method == "delete") {
                        linksMap["delete"] = link;//NO I18N
                    } else if (link.name == "add" && link.method == "post") {//NO I18N
                        linksMap.add = link;//NO I18N
                    } else if (link.name == "links_scan" && link.method == "get") {//NO I18N
                        linksMap.links_scan = link;//NO I18N
            } else if (link.name == "scan_info" && link.method == "get") {//NO I18N
                linksMap.scan_info = link;
            } else if (link.name == "links_add_product" && link.method == "post") {//NO I18N
                linksMap.add_new_product = link;
            } else if (link.name == "links_add_vendor" && link.method == "post") {//NO I18N
                linksMap.add_new_vendor = link;
            } else if (link.name == "links_get_ci" && link.method == "get") {//NO I18N
                linksMap.links_get_ci = link;
                    }
            //self.links = links;
            /**Permissions for tools, scan and action menus */
            if (link.name === "generate_barcodes") {
                        permissions.generate_barcodes = true;
            }else if(link.method == "put" && link.actionKey == "edit") {// No I18N
                permissions.edit = true;
                    }else if(link.method == "post" && link.name == "add"){ //NO I18N
                        permissions.enable_new = true;
                    }else if(link.method == "delete" && link.name == "delete"){ //NO I18N
                        permissions.multiDeleteEnabled = true;
                    }else if(link.name == "links_scan"){ //NO I18N
                        permissions.links_scan = true;
            }else if(link.name == "scan_info"){ //NO I18N
                permissions.scan_info = true;
            }else if(link.display_key == "Tools"){ //NO I18N
                        permissions.tools = true;
            }else if(link.header === "actions"){ //NO I18N
                const display_name = link.display_name ? link.display_name : link.display_key;
                        actionBtnLinks.push({
                key : link.name,
                href : (link.name=="copy") ? "javascript: assetActions.assetCopyFormInitialization('"+encodeURI(link.href)+"','"+display_name+"')" : "javascript: assetActions.loadAction('" + link.name + "','"+display_name+"','"+link.method+"','"+encodeURI(link.href)+"', 500);", //NO I18N
                name : display_name
                        });

                switch(link.name){
                    case "attach_asset":
                            permissions.attach_asset = true;
                        break;
                    case  "attach_component":
                            permissions.attach_component = true;
                        break;
                    case "attach_document":
                            permissions.attach_document = true;
                        break;
                        }
                    }


            switch(link.name){
                case "links_add_product":
                    permissions.add_new_product =true;
                    break;
                case "links_add_vendor":
                    permissions.add_new_vendor = true;
                    break;
                case "links_add_product_type":
                    permissions.add_new_product_type = true;
                    break;
                case "links_product_vendor_association":
                    permissions.product_vendor_association = true;
                    break;
                case "add_cost":
                    permissions.add_cost = true;
                    break;
                case "edit_cost":
                    permissions.edit_cost = true;
                    break;
                case "delete_cost": //NO I18N
                    permissions.delete_cost = true;
                    break;
                case "configure_depreciation":
                    permissions.configure_depreciation = true;
                    break;
                case "scan_now":
                    permissions.scan_now = true;
                    break;
                case "assign_state":
                    permissions.assign_state = true;
                    break;
                case "modify_state":
                    permissions.modify_state = true;
                    break;
                case "connect_asset": //NO I18N
                    permissions.connect_asset = true;
                    break;
                case "connect_business_service": //NO I18N
                    permissions.connect_business_service = true;
                    break;
                case "links_get_ci":
                    permissions.view_associated_ci = true;
                    break;
                }
                if(typeof assetDetailView!='undefined' && assetDetailView.baseData && assetDetailView.baseData.used_by_asset){
                    if(link.name == 'asset_'+assetDetailView.baseData.used_by_asset.id){
                        permissions.used_by_asset_details = true;
                    }
                }
            });
        if(permissions.connect_asset || permissions.connect_business_service || permissions.attach_asset || permissions.attach_component) {
            permissions.add_relationship = true;
        }

        links_data.tabs = tabs;

        links_data.actionBtnLinks = actionBtnLinks;
        links_data.permissions = permissions;
        links_data._links = _links;
        assetsObj.links_data = links_data;
        return links_data;
    },
    /**
     * Initiate listview for dashboard page and details view of assets
     * @param {*} module
     * @param {*} moduleURL
     * @param {*} getId
     * @param {*} isListView
     * @param {*} type_id
     * @param {*} data
     * @param {*} _links
     * @param {*} tabs
     * @returns
     */
    getAllowedActions : function(module, moduleURL, getId, isListView, type_id, data, _links, tabs){
        const options = {
            module : module,
            typeId : type_id,
            getId  : getId,
            isListView :  isListView,
            data : data
        }

        if(isListView===true){
            return new Promise(function (resolve) {
                resolve(assetsObj.setLinksData(options, _links));
            });
        }else{
            return assetsObj.setLinksData(options, _links, tabs);
        }
    },
    /**
     * rendering popup while clicking ip address value in listview(Used in assetList.js)
     * @param {*} assetIPAddresses
     * @param {*} assetName
     */
    openIPAddressPopup: function (assetIPAddresses, assetName) {
        const ipAddresses = assetIPAddresses.split(",");
        const ipAddressesHTML = ipAddresses.map(function (ip) {
            return '<span class="ip-sec disp-ib mt5 mb5">' + e_html(ip) + '</span>';
        }).join("");

        const container = `<div class="p10"><p> ${getMessageForKey("sdp.reports.default.totalmsg")} :  ${ipAddresses.length}</p> <div class="disp-ib" style="max-height: 430px;overflow: auto;">${ipAddressesHTML}</div> </div>`;

        jQuery(container).dialog({
            width: '550',
            height: 'auto',// No I18N
            modal: true,
            resizable: false,
            show: {
                effect: 'fadeIn',// No I18N
                duration: 500
            },
            open: function () {
                jQuery(document).find('body').addClass('of-h'); //Remove Page scroll

                //adding dialog title here instead of using 'title' property in option, to display asset name as it is.
                jQuery(this).prev('.ui-dialog-titlebar').find('.ui-dialog-title').html(getMessageForKey("ae.asset.ip.addrs.popup.title", [e_html(assetName)]));
            },
            close: function () {
                jQuery(document).find('body').removeClass('of-h'); //Add page scroll
            }
        });
    },
    /**
     * Used in details and list view page for rendering page
     * @param {*} id
     * @param {*} module
     */
    loadAssetDetailPopup: function(id,module){
        $previewComponent.load('/ui/asset?entity_id='+id+'&module='+e_param(module)+'&mode=get&externalframe=true&noheader=true&from=showdetails',e_param(translate('sdp.inventory.ws.detail.resdetails')));  //No I18N
    },
    /**Used in ci_scripts.js file */
    loadDepartmentDetailsPopup: function(id){
        if(typeof $departmentPopup == "undefined" || typeof $vendorPopup == "undefined"){
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/department/department_popup.js"] : ["/scripts/department_popup_min.js"],  //No I18N
                success: function() {
                    $departmentPopup.openPopup(id);
                }
            });
        }else{
            $departmentPopup.openPopup(id);
        }
    },
    /**Used in ci_scripts.js file */
    loadSupportGroupDetailsPopup: function(id){
        if (typeof $supportGroupPopup == "undefined") {
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/support_group_popup.js"] : ["/scripts/support_group_popup_min.js"],  //No I18N
                success: function() {
                    $supportGroupPopup.openPopup(id);
                }
            });
        } else {
            $supportGroupPopup.openPopup(id);
        }
    },
    /**Used in ci_scripts.js file */
    loadSoftwareCIDetailsPopup: function(id){
        if(typeof $softwareCIPopup == "undefined"){
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/software_ci.js"] : ["/scripts/ci_scripts.js"],  //No I18N
                success: function() {
                    $softwareCIPopup.openPopup(id);
                }
            });
        }else{
            $softwareCIPopup.openPopup(id);
        }
    },
    /**
     * load attach asset popup from actions menu
     * @param {*} module
     * @param {*} action
     * @param {*} for_field
     * @param {*} custom_options
     */
    loadAttachAssetPopup: function(module, action, for_field,custom_options){
        if(for_field){
            assetsObj.associateForField = for_field;
        }
		assetsObj.custom_options=custom_options;
        if(typeof assetActions == "undefined"){  //No I18N
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-list.js", "/scripts/assets/asset-filter.js", "/scripts/assets/asset-actions.js"] : ["/scripts/asset_module_min.js","/scripts/hbs-template-assets.js"],//No I18N
                success: function () {
                    assetActions.options.from = module;
                    assetActions.loadAction(action);
                }
            });
        }else{
            assetActions.options.from = module;
            assetActions.loadAction(action);
        }
    },
    /**
     * Used in ember product type file
     * @param {*} options
     * */
    fetchAllApiData: function (options) {
        const url = options.url,
              entity = options.entity;
        let data = [],
            inputData = options.inputData || {
            list_info: { "start_index": 1, "row_count": 100 }//No I18N
         };
        let getData = () => {
              return sdpAjax({
                  url:url,
                  data: sdpAjaxInputData(inputData)
              });
          }
          let fetchAllData = (callback) => {
              getData().then(function (response) {
                  inputData.list_info.start_index += 100;
                  data = data.concat(response[entity]);
                  if (response.list_info.has_more_rows) {
                      fetchAllData(callback);
                  } else {
                      callback(data);
                }
            }).catch(function () {
                callback();
            });
        }
        return new Promise(function (resolve) {
            fetchAllData(resolve);
        });

    },
    /**
     * Common function to used for get call function
     * @param {string} url
     * @param {boolean} isServelet
     * @param {object} inputData
     * @param {*} callback
     * @param {string} entity
     * @param {boolean} ignoreFailureMsg
     * @returns
     */
    commonAjaxFunction:function(url,isServelet,inputData,callback,entity,ignoreFailureMsg){
        const getUrl = isServelet ? url : '/api/v3/'+url;//NO I18N
        let entityData = [];
        sdpAjax({
            url:getUrl,
			async:false,
            data: isServelet ? null : sdpAjaxInputData(inputData),
            dataType:'json',//NO I18N
            success: function(response){
                if(callback){
                    callback(response)
                }else if(entity){
                    entityData = response[entity];
                }else{
                    entityData = response;
			}
            },
            failedCallBack: function(response) {
                if(callback){
                    callback(response);
                }
            },
            ignorefailuremessage: ignoreFailureMsg ? true : false
		});
        if(!callback){
            return entityData;
    }
    },
    /**
     * Execute function to get metadata for add/edit/details/listview page
     * @param {*} module
     * @param {*} moduleId
     * @param {*} input_data
     * @returns
     */
    getAssetMetaData : function(module,moduleId,input_data){
        const self = this;
        let entityData = [];
        const url = moduleId ? encodeHTMLAttribute(module)+"/"+moduleId : encodeHTMLAttribute(module)+"/_metadata";
        sdpAjax({
            url: "/api/v3/"+url,// No I18N
            data: input_data ? sdpAjaxInputData(input_data) : null,
            success: function (response) {
                if(moduleId){
                    delete response.response_status;
                    entityData = response;
                }else{
                    entityData= response.metadata;
}

                if(entityData.module_details && entityData.module_details.inactive){
                    const pageUrl = "/ui/asset?module=asset_assets&mode=get";// No I18N
                    addPersonalization("assets_current_url", {// No I18N
                        url: pageUrl
                    });

                    jQuery('[tab-name="Assets"]').prop("href", pageUrl);// No I18N
                    window.location.href = pageUrl;
                }
            },
            async: false,
            failedCallBack: function(response) {
                var getResponseData = response.responseJSON.response_status && response.responseJSON.response_status.messages.length>0 && response.responseJSON.response_status.messages[0];
                if(getResponseData && getResponseData.status_code=="4007"){
                    showalert("failure", getMessageForKey("sdp.admin.producttype.deleteproducttype.failure.nodata"), "isAutoHide=false"); // No I18N
                    if(module=="asset_assets") {
                        if(sdp_app.IS_AE){
                            window.location.href = "/AssetHomePage.do" // No I18N
                        }else{
                            window.location.href = "/HomePage.do" // No I18N
                        }
                    }else {
                        window.location.href = "/ui/asset?module=asset_assets&mode=get" // No I18N
                    }
                } else if(getResponseData){
                    showalert("failure", e_html(getResponseData.message) , "isAutoHide=false"); // No I18N
                }
            },
            ignorefailuremessage:true
        });
        return entityData;
    },
    /**
     * Retain selected filter in dropdown and render listview based on that filter
     * @param {*} getSelFilterArr
     */
    retainSelectedFilterValues:function(getSelFilterArr){
        const self = this;
        /**For clear criteria while redirect */
        let getSelFilter = getSelFilterArr;

        /**For retain selected filter data in asset listview */
        if(getSelFilter && getSelFilter.length>0){
            for(var i=0;i<getSelFilter.length;i++){
                var getFldObjArr = Object.keys(getSelFilter[i]),
                    getFldName = getSelFilter[i][getFldObjArr[0]],
                    getFldValue = getSelFilter[i][getFldObjArr[1]];
                    /**Set data to relevant dropdown and trigger change  */
                    jQuery("#"+getFldName+"_select2").select2("data",getFldValue);
                    assetsObj.filter_value = getSelFilter;
            }
        }

        /**end */
    },
    /**
     * Render handlebar template for left panel and load left panel dependency script files
     */
    forAssetLeftPanel:function(){
        jQuery(document).ready(function(){
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/jstree.min.js", "/scripts/asset-leftpanel.js"] : ["/scripts/hbs-template-asset-leftpanel.js","/scripts/jstree.min.js", "/scripts/asset_left_panel_min.js"], // No I18N
                css: ["/style/style.min.css"], // No I18N
                success: function() {
                    renderhbs("#render_leftpanel_template","assets-leftpanel-template",null,null,'asset-leftpanel');// No I18N
                    assetsObj.left_nav_promise = assetLeftPanel.init();
                }
            });
        });
    },
    getCiTypeIdForAsset: function(ciTypeName){
        let result = null;
        sdpAjax({
			url: '/servlet/AJaxServlet?action=getCITypeIdsForAsset&citypename='+encodeURIComponent(ciTypeName), //NO I18N
			cache:false,
			async:false,
			success: function success(res) {
				result = res;
			}
		});
        return result && result[ciTypeName];
    },
    openProductFormDialog:function(){
        const self = this;
        let constructProductForm = () => {
            jQuery("#product_element").append("<div id='product_popup'></div>");
            let metainfo = null;
            renderhbs("#product_popup", "asset-form-template",{isProductTemp:true},false,"assets"); // No I18N
        self.commonAjaxFunction("products/_metainfo",null,null,function(response){
            metainfo = response.metainfo;
            metainfo.fields.cost.display_name += " ("+sdp_app.CURRENCY_SYMBOL+")";
        },"metainfo") // No I18N

        const getTitleText = translate("sdp.admin.product.listview.addproduct");
        const templateLayout = {
            layouts : [{
                sections:[{
                    "style_properties": { "field_style": { "field_align": "top" } }, // No I18N
                    "column_count": "1", // No I18N
                    fields:[{
                        name: 'name', // No I18N
                        position: {col: 1, row: 1}
                    },
                    {
                        name: 'manufacturer', // No I18N
                        position: {col: 1, row: 1}
                    },
                    {
                        name: 'cost', // No I18N
                        position: {col: 1, row: 1}
                    }]
                }]
            }]
        };
        const configProductJSON = {
            name: "product_new_form",// No I18N
            entity: "product", // No I18N
            template : templateLayout,
            metadata: metainfo,
            mode : "new", // No I18N
            customform: true,
            container: "product-form-container",// No I18N
            formid: "product_new_form",// No I18N
            save : {
                url: "/api/v3/products", // No I18N
                submit: true,
                entity: "product", // No I18N
                type: "POST", // No I18N
                submitbutton: {
                    add: translate("common.save")
                },
                success: "assetsObj.functionAfterSuccess",//No I18N
                pre: "assetsObj.productModifySaveData",//NO I18N
                cancel:function(){
                    jQuery("#product_popupclose").trigger('click');
                }
            },
            afterRenderCallback:function(){
                jQuery('#product_new_form').find("#for_name").focus(); // No I18N
            }
        }
        window.$relproductform  = new FC(configProductJSON);

        const zdialogOptions = {
            width: "400px", //No I18N
            draggable: true,
            closeOnEscKey: true,
            title : translate(getTitleText),
            open:function(dialog){
                jQuery(dialog.ui.container).find(".zdialog__content").css({"height":"auto","overflow":"visible"}); //No I18N
                jQuery(dialog.ui.container).css({"overflow":"visible"}); //No I18N
            }
        }

        jQuery("#product_popup").sdp_zcomponent_dialog(zdialogOptions);
        }
        if(typeof Handlebars.templates['asset-form-template'] == 'undefined'){
            ResourceLoader({
                js: ["/scripts/hbs-template-assets.js"],  //No I18N
                success:function(){
                    constructProductForm();
                }
            });
        }else{
            constructProductForm();
        }
    },
    functionAfterSuccess:function(response){
        showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
        jQuery("#product_popupclose").trigger('click');
        let getProductEle = jQuery("#assetForm").find('[name="product"]');
        let getProductVal = response.product;
        if(typeof assetFormView  != 'undefined' || typeof  window.top.assetFormView  != 'undefined'){
            getProductVal = {id:getProductVal.id,name:getProductVal.name};
        }else {
            getProductEle =  jQuery("#ownBarcodeForm").find('[name="product"]').length>0 ? jQuery("#ownBarcodeForm").find('[name="product"]') : jQuery("#venderBarcodeForm").find('[name="product"]');
            getProductVal = {id:getProductVal.id,text:getProductVal.name};
        }
        getProductEle.data("sdp_select2").cache = {}; // No I18N


        getProductEle.select2("data",getProductVal).trigger("change");// No I18N
    },
    productModifySaveData:function(data){
        const self = this;
        let productData = data.product;
        (!productData.cost)  && (productData.cost=0);
        productData.all_product_type = (typeof assetFormView  != 'undefined' || typeof  window.top.assetFormView  != 'undefined') ? { "id": assetFormView.productType.id } : { "id": (jQuery("#productType").select2("data") &&  jQuery("#productType").select2("data").id)};// No I18N
        return productData;
    },
    /*
    * Load CI details popup in slider
    */
    loadCIDetailsPopup : function(ciid,ci_type,options){
        let url = `/ui/cmdb_module?ciid=${ciid}&mode=popup&externalframe=true&noheader=true`;
        if (ci_type && ci_type != null){
            url += '&ci_type=' + e_param(ci_type);   //No I18N
        }
        if (options && options.defaultTab){
            url += "&defaultTab="+options.defaultTab;   //No I18N
        }
        if (options && options.defaultAssociatedModule){
            url += "&defaultAssociatedModule="+options.defaultAssociatedModule.toLocaleLowerCase();   //No I18N
        }
        $previewComponent.load(url,translate('ae.cmdb.importci.header.ciDetails'));  //No I18N
    },
    /*
    * Load CI details in new window
    */
    loadCIDetailsInNewWindow : function(ciid,ci_type,options){
        let url = `/ui/cmdb_module?ciid=${ciid}&mode=popup&externalframe=true&noheader=true`;
        if (ci_type && ci_type != null){
            url += '&ci_type=' + e_param(ci_type);   //No I18N
        }
        if (options && options.defaultTab){
            url += "&defaultTab="+options.defaultTab;   //No I18N
        }
        NewWindow(url, 'CI_Detail', '820','620','yes','center', null, null, null, true);//NO I18N
    },
    /**
     * Render handlebar template for left panel and load left panel dependency script files for CMDB
     */
    loadCMDBLeftPanel:function(){
        jQuery(document).ready(function(){
            assetsObj.loadCMDBRelatedFilesThenExecuteMethod("$ciList.initLeftPanel");       //No I18N
        });
    },
    /**
     * to load ci listview to in request/change/release/problem module, added this method in global include file
     */
    loadAttachCIPopup: function (refEntity, refField, for_field, selectionLimit) {
        assetsObj.loadCMDBRelatedFilesThenExecuteMethod("$ciList.loadAttachCIPopup", refEntity, refField, for_field, selectionLimit);       //No I18N
    },
    /**
     * load cmdb related files and execute method after loading
     */
    loadCMDBRelatedFilesThenExecuteMethod:function(method, ...args){
        if (!window.$ciCommon) {
            const jsFiles = sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/ci_common.js","/scripts/ci_list.js","/scripts/ci_form.js","/scripts/ci_relationship.js","/scripts/ci_association.js","/scripts/jstree-plugin.js"] : ["/scripts/ci_scripts.js", "/scripts/hbs-template-cmdb.js"];       //No I18N
            const cssFiles = ["/style/style.min.css"];      //No I18N
            ResourceLoader({
                js: jsFiles,
                css: cssFiles,
                success: function () {
                    execFuncByName(method,window,...args);
                }
            });
        }
        else {
            execFuncByName(method,window,...args);
        }
    },
    assetBrowserBackFn :function(){
        jQuery(window).on('popstate', function (event) { // No I18N
            var state = event.originalEvent.state;
            const getSearchText = assetsObj && assetsObj.assetListView && assetsObj.assetListView && assetsObj.assetListView.searchText;
            if (state && state.forwardTo && state.module){
                assetsObj.doPush = false;
                if(getSearchText){
                    assetsObj.doPush = true;
                    const getModule = (assetsObj && typeof assetsObj.assetListView!="undefined" && assetsObj.assetListView.module) || "asset_assets";// No I18N
                    assetsObj.redirectTo("list",getModule,null,null,null,null,null,getSearchText);// No I18N
                }else{
                    assetsObj.redirectTo(state.forwardTo, state.module, "", state.entity_id, state.tab, state.moduleType, state.from, state.searchText || getSearchText, state.tabs);
                }
            }else {
                assetsObj.redirectTo("list",assetsObj.assetListView.module||"asset_assets",null,null,null,null,null,getSearchText);// No I18N
            }
        });
    }
}

/** DC Action menu invocation */
function initiateDCToolsAction(action, url, title) {
    showURLInDialog(url, "position=absmiddle, modal=yes, width=600, height=150, scrollbars=no, title="+title);//NO I18N
  }
function openSpacePopup() {
    ResourceLoader({    
        js: ["/scripts/hbs-template-space.js"], // No I18N
        success:function(){
            var getSiteVal = jQuery('#assetForm [name="site"]').val();
            const getApiPluralName = assetsObj.module;
            var search_criteria_space={"field": "site", "condition": "is", "value":(getSiteVal=="") ? null : getSiteVal,"logical_operator":"and"};//No I18N
            $req.common.spacePopup.open({
                selected: (jQuery('#assetForm [name="space"]').select2("data")?[jQuery('#assetForm [name="space"]').select2("data")]:[]), //No i18n
                search_criteria: search_criteria_space,
                singleSelect:true,
                allowed_values_url: getApiPluralName+"/space", //No i18n
                onSelect: function(value1,value2){
                    try{
                        if(value1&&value2){
                            jQuery('#assetForm [name="space"]').select2("data", {"id":value1[0],"text":value2[0]}).trigger("change");	//No I18N
                        }
                    }catch (error) {
                        
                    }
                }
            });
        }
    });
}