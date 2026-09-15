// $Id$
"use strict"// No I18N
var assetRoute = {
    /**
     * Redirect to related pages (add/edit/details/listview) based on forwardto 
     * @param {string} forwardTo 
     * @param {string} module 
     * @param {Integer} id 
     * @param {string} tabName 
     * @param {string} moduleType 
     * @param {string} from 
     * @param {string} searchText 
     * @returns 
     */
    redirectToAssetPage : function (forwardTo, module, type_id, id, tabName, moduleType, from, searchText) {
        const parentObj = assetsObj, self = this;
        parentObj.module = module;
        const externalframe  = assetsObj.externalframe;
        jQuery("#asset-section").find('#spa-container').remove();
        (from!="bulkedit") && jQuery('#left-panel-section').hide();// No I18N

        jQuery("#asset-left-panel").toggle(forwardTo != "detail");
        jQuery("#browserTitleInfo").remove();
        jQuery("[asset-view]").hide();
        /**Get metadata  */
        if(module!=="asset_attachments" && module!== "asset_connections" && module!=="component_attachments" && module!=="attached_assets" && module!== "connected_assets" && module!=="attached_components" && from !== "purchase"){
            const getMetaObjWithId = parentObj.assetModTemplateData.metaDataWithId,
                  getMetaObjWithoutId = parentObj.assetModTemplateData.metaDataWithoutId,
                  dataStorageSize = 3,
                  getObjWithModule = getMetaObjWithoutId[module];

            if(!getMetaObjWithoutId.hasOwnProperty(module) || (!getMetaObjWithoutId === undefined || !getObjWithModule.module_details=== undefined)  || (getObjWithModule.module_details && getObjWithModule.module_details.api_plural_name !== parentObj.module) || (parentObj.module!==parentObj.list_module && getObjWithModule.module_details && getObjWithModule.module_details.api_plural_name !== parentObj.list_module)){
                const getObjAsArray =  Object.keys(getMetaObjWithoutId);
                if(getObjAsArray.length>=dataStorageSize){
                    delete getMetaObjWithoutId[getObjAsArray[0]];
                }
                !getMetaObjWithoutId.hasOwnProperty(module) && (getMetaObjWithoutId[module] = parentObj.getAssetMetaData(module));
            }
            if(id){
                /**Clear stored data from object */
                const getObjAsArray =  Object.keys(getMetaObjWithId);
                const dataStorageforInd = 0;
                if(getObjAsArray.length>=dataStorageforInd){
                    delete getMetaObjWithId[getObjAsArray[0]];
                }
                /**End */
                const getObjWithModule = getMetaObjWithId[id];
                if(!getMetaObjWithId.hasOwnProperty(id) || (!getMetaObjWithId === undefined || !getObjWithModule[module]=== undefined)  || (getObjWithModule[module] && getObjWithModule[module].id !== id)){
                    const getObjAsArray =  Object.keys(getMetaObjWithId);
                    const dataStorageforInd = 1;
                    if(getObjAsArray.length>=dataStorageforInd){
                        delete getMetaObjWithId[getObjAsArray[0]];
                    }
                    
                    if(!getMetaObjWithId.hasOwnProperty(id)){
                        const inputData = {"include":["links","tabs","meta_info"],"add_recent_item":true}  // No I18N
                        getMetaObjWithId[id] = parentObj.getAssetMetaData(module,id,inputData);
                        parentObj.setLayoutDetails(module,id);
                    }
                }
            }
            
        }
        
        /**For window browser back function */
        
            jQuery(window).on('popstate', function (event) { 
                const state = event.originalEvent.state;
                if (state){
                    if(state.forwardTo=="detail"){
                        assetsObj.doPush = false;
                        if(state.entity_id && (typeof assetDetailView != "undefined" && assetDetailView.detComp)){
                            if(state.entity_id == assetDetailView.id){
                                assetDetailView.hashChange();
                            }else{
                                assetDetailView.gotoInit(state.entity_id, externalframe);
                            }
                        }else{
                            assetsObj.redirectTo(state.forwardTo, state.module, state.TypeID, state.entity_id, state.tab, state.moduleType, state.from, state.searchText);
                        }
                        }
               }else {
                window.location.reload();
              }
            });
        

        if(forwardTo === "list"  || forwardTo === "") {
            assetsObj.canShowLeftPanel && !externalframe && jQuery('#left-panel-section').show();
            return self.renderList(module, from,moduleType,searchText,externalframe);
        } else if(forwardTo === "detail") { // No I18N
            return self.renderDetails(id, from,module);
        } else if(forwardTo === "form") { // No I18N
            const queryString = window.location.search, urlParams = new URLSearchParams(queryString);
            const getFromPage = urlParams.get("mode");
            return self.renderForm(id, module, getFromPage, from);
        }
    },
    /**
    * Redirect to asset list view page
    * @param {string} module 
    * @param {string} from 
    * @param {string} moduleType 
    * @param {string} searchText 
    * @param {Boolean} externalframe 
    */
    renderList: function (module, from, moduleType, searchText, externalframe) {
        jQuery("#asset-details, #asset-form,#asset-list").empty();
        const parentObj = assetsObj, container = jQuery("#asset-list");
        this.removeUnknownDevicesAlert();
        parentObj.previous_module = parentObj.list_module;
        parentObj.list_module = module;

        container.show();
        (from=="dashboard") && jQuery("#assets_common_loading").show().css({"top":"0px"});// No I18N
        
        if (!container.length || container.is(":empty") || from === "leftpanel" || from === "dashboard") {
            if(!container.length) {
                let displayUrl = "/ui/asset?module=" + e_param(module) + ((searchText && searchText!="null")?("&gsearch="+searchText):"") + ((from && from!="null")?("&from="+from):"");// No I18N
                (assetsObj.canShowLeftPanel!==undefined) && (displayUrl += "&canShowLeftPanel=" + assetsObj.canShowLeftPanel);// No I18N
                window.location.href = displayUrl;
            }
            else{
                container.find("#assetlistview_parent").hide().end()
                        .find("#assets_lview_loading").show();
                container.append(`<div class='disp-t fw'><div class='disp-c fw'><div id='asset-list-view'></div></div></div>`); //NO I18N
                this.loadListviewFileIfNotAvail(module,moduleType,from,externalframe,searchText);
            }
        } else if((module === assetsObj.previous_module) && !externalframe) {
            /** from new form to listview (clicking back button )*/
            (Object.keys(assetListView.tableObject).length > 0) && assetListView.tableObject.refreshTable && assetListView.tableObject.refreshTable("refresh"); // No I18N
            assetListView.initFilter(assetListView.module);
            assetListView.initActions(assetListView.module);
          } else if (module && !externalframe && (from===undefined || from!=="null")) {// No I18N
            this.loadListviewFileIfNotAvail(module,moduleType,from,externalframe,searchText);
          }
          else if(assetsObj.previous_module!==undefined && !externalframe){
            (Object.keys(assetListView.tableObject).length > 0) && assetListView.tableObject.refreshTable && assetListView.tableObject.refreshTable("refresh");// No I18N
          }
          else if(externalframe){
              externalframe=false;
              window.top.location.href = "/ui/asset?module=" + e_param(module);   // No I18N
          }

          assetsObj.pushingStateURL("list", module,null,null,null,null,null,null,searchText); // No I18N
        if(searchText){
            jQuery("#subheader_search_box").val(searchText);
        }
        (!from) && this.loadUnknownDevicesAlert();
    },
    /**
     * Execute function to render details page of asset
     * @param {Integer} id 
     * @param {string} from 
     * @param {string} module 
     * @param {string} moduleType 
     */
    renderDetails: function(id, from, module, moduleType) {
        const parentObj = assetsObj,
             printPreview = parentObj.printPreview,
             containerId = parentObj.printPreview ? "module-content" : "asset-details", // No I18N
             container = jQuery("#" + containerId);
            let getAssetFilterData = null;
            if(typeof assetFilter !== 'undefined') {
                getAssetFilterData = assetFilter;
            }
        jQuery("#asset-details, #asset-form,#asset-list").empty();
        container.show();
        jQuery('#'+containerId).append("<div id='asset_detailview' class='fh'></div>"); //NO I18N
        ResourceLoader({
            cache : !sdp_app.IS_DEVELOPMENT_MODE,
            js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/hbs-template-details.js", "/scripts/assets/asset-details.js","/scripts/assets/asset-list.js", "/scripts/assets/asset-actions.js","/scripts/assets/asset-filter.js", "/scripts/softwareList.js"] : ["/scripts/asset_module_min.js","/scripts/hbs-template-details.js","/scripts/hbs-template-assets.js"],  //No I18N
            success: function() {
                /**To append element for browser title  */
                jQuery("body").append('<span id="browserTitleInfo" data-module="assets" data-page="detailsPage" class="hide"> <span id="bt_id"></span><span id="bt_title"></span></span>');
                if(module===undefined){
                    module=assetsObj.list_module;
                }
                if(moduleType===undefined || moduleType==="null"){
                    moduleType = assetsObj.assetModTemplateData.metaDataWithId[id].module_details.name;
                    
                }
                const options = {
                    id: id,
                    printPreview: printPreview,
                    externalframe :externalframe,
                    module : assetsObj && assetsObj.productTypeObj && assetsObj.productTypeObj.api_plural_name || module,
                    moduleType : assetsObj && assetsObj.productTypeObj && assetsObj.productTypeObj.name || moduleType ,
                    from: from
                };
                assetDetailView.init(options);
                getAssetFilterData && (assetFilter = getAssetFilterData);
            }
        });
        /**For clear selected list from list view */
        jQuery("#bulk_unselect_assets_list").trigger("click");
        !printPreview && assetsObj.pushingStateURL("detail", module, "", id); // No I18N
    },
    /**
     * Execute function to render form add/edit page of asset
     * @param {Integer} id 
     * @param {string} module 
     * @param {string} getFromPage 
     * @param {string} from 
     */
    renderForm: function(id, module, getFromPage, from) {
        jQuery("#asset-section").append('<div id="spa-container"><div id="asset-form" asset-view></div></div>');
        let container = jQuery("#asset-form").length>0 ? jQuery("#asset-form") : jQuery("#asset-list");
        /**Append additional div to create dialog for bulk edit */
        if(from=="bulkedit"){
            jQuery("#asset-list").show();
            jQuery("#assignOwnerPopup").append("<div id='asset_bulk_edit_popup_form'></div>");
            container = jQuery("#asset_bulk_edit_popup_form"); 
        }
        /**End */
        container.show();
        const queryString = window.location.search, urlParams = new URLSearchParams(queryString);
        const fromPage = getFromPage || urlParams.get("mode");
        /**To append element for browser title  */
        if(id){
            jQuery("body").append('<span id="browserTitleInfo" data-module="assets" data-page="editPage" class="hide"> <span id="bt_id"></span><span id="bt_title"></span></span>');
        }
        if(container.is(":empty")) {
        
            renderhbs(container,"asset-form-template",{//NO I18N
                isFormBasicTemp : true,
            },null,'assets');//NO I18N
            const getId = id, 
                  getModule = module; 
            (!sdp_app.IS_DEVELOPMENT_MODE && assetsObj.bulkEditIds!=null && assetsObj.bulkEditIds!=="null") && (assetsObj.assetListView=window.top.assetListView);// No I18N
            ResourceLoader({
                cache : !sdp_app.IS_DEVELOPMENT_MODE,
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-form.js", "/scripts/validation.js", "/scripts/assets/asset-actions.js"] : ["/scripts/asset_module_min.js","/scripts/hbs-template-assets.js"],  //No I18N
                success :function() {
                    const module = (getModule && getModule!="null") ? getModule : getUrlParameterByName("module"); // No I18N
                    const id = (getId && getId!="null") ? getId :  getUrlParameterByName("entity_id"); // No I18N
            
                    const options = {
                        api_plural_name: module,
                        id :id === "null" ? "" : id, // No I18N
                        fromPage : fromPage
                    };
                    (!sdp_app.IS_DEVELOPMENT_MODE && assetsObj.bulkEditIds!=null && assetsObj.bulkEditIds!=="null") && (window.top.assetListView = assetsObj.assetListView);// No I18N
                    assetFormView.init(options);
                }
            });
        } else {
            assetFormView.init({
                api_plural_name: module,
                id: id,
                fromPage:getFromPage
            });
        }
        assetsObj.pushingStateURL("form", module, "", id); // No I18N
        /**Render form as a dialog for bulk edit functionality */
        (from=="bulkedit") && assetListView.createAssetBulkEditPopup();// No I18N
        jQuery("#asset-edit-container").hide();
    },
    loadListviewFileIfNotAvail:function(module, moduleType, from, externalframe, searchText){
        if(!window.assetListView) {
            ResourceLoader({
               cache : !sdp_app.IS_DEVELOPMENT_MODE,
               js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-list.js", "/scripts/assets/asset-filter.js", "/scripts/assets/asset-actions.js"] : ["/scripts/asset_module_min.js","/scripts/hbs-template-assets.js"], // No I18N
               success:function(){
                    assetListView.initListView(module, moduleType, from, externalframe, searchText);
               }
            });
        }else{
            assetListView.initListView(module, moduleType, from, externalframe, searchText);
        }
    },
    removeUnknownDevicesAlert : function(){
        jQuery("#asset_alert_header").html("").removeClass("pb10");
    },
    loadUnknownDevicesAlert : function(){
        const _self = this;
        sdpAjax({
            url: "/api/v3/asset_assets/_get_unknown_devices", //No I18N
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
                    jQuery("#asset_alert_header").addClass("pb10").html(alert);
                    initTooltip("#asset_alert_header");   //NO I18N
                }
            }
        });
    }
};
