"use strict";// No I18N
var assetDetailView = {
    /** Initiate detail view page
     * @param {object} options
      */
    init : function(options){
        
        const _self = this,
              getIndvAssetMetaObj = assetsObj.assetModTemplateData.metaDataWithId;

        let renderDetailsPage = (response,_self) => {
            _self._links = response._links;
            _self.tabs=response.tabs;
            _self.data = response[options.moduleType];
            _self.baseData = response[options.moduleType];
                assetDetailView.entity_name = _self.data.module.api_name;
                _self.render(options);
                /**For render association tab in details page */
                if(sdp_app.IS_SDP){
                    /**Function for getting total count for associations tab (requests,changes,releases,problems) */
                    const getAssocToggleNames = ["requests","problems","changes","releases"],// No I18N
                          rightSecDisplayKeys = ["sdp.requests.common.requests","sdp.admin.roles.addrole.problems","sdp.header.changes","admin.module.releases"],// No I18N
                          getDisplayKeys = ['sdp.project.associate.request.title','common.associated.problems','sdp.project.associate.change.title','sdp.cmdb.associated.releases'];// No I18N
                    /**Get total count for (releases/problems/requests/changes) by displaying associations count in right section */
                    assetDetailView.additonal_data = {};
                    for(let i=0;i<getAssocToggleNames.length;i++){
                        const url = getAssocToggleNames[i]+"/_total_count";
                        const getAssetName = getAssocToggleNames[i]=="problems" ? "associated_asset" : "assets";//NO I18N
                        const inputObject = {list_info:{search_criteria : {"field":getAssetName,"value":assetDetailView.asset_id,"condition":"is","logical_operator":"AND"}}}//NO I18N
    
                        assetsObj.commonAjaxFunction(url,null,inputObject,function(response){
                            if(response.hasOwnProperty("_total_count")){
                                _self.additonal_data[getAssocToggleNames[i]] = {
                                    "count" : response._total_count[getAssocToggleNames[i]],
                                    "display_key" : translate(getDisplayKeys[i]),
                                    "display_name" : translate(rightSecDisplayKeys[i]),
                                    "api_plural_name" : getAssocToggleNames[i],
                                    "name" : getAssocToggleNames[i]
                                };
                            }
                            
                        },"_total_count",true);// No I18N
                    }
                    if(Object.keys(_self.additonal_data).length==0){
                        _self.additonal_data = null;
                        /**Remove association tab from details page if user doesn't have persmissions for requests,problems,changes and releases */
                        _self.tabs.forEach(function(fldvalue,index){
                            if(fldvalue.name=="associations"){
                                _self.tabs.splice(index,1);
                            }
                        });
                       
                    }else {
                        _self.isEmptyAssociation = true;
                        Object.keys(_self.additonal_data).forEach(key => {
                            if(_self.additonal_data[key].count!=0){
                                _self.isEmptyAssociation = false;
                            }
                        });
                    }
                }
            }

        if(getIndvAssetMetaObj[options.id] && getIndvAssetMetaObj[options.id].hasOwnProperty(options.moduleType)){
            renderDetailsPage(getIndvAssetMetaObj[options.id],_self);
        }
        else{
            /** It only happens if data is not available*/
            const inputData = {"include":["links","tabs","meta_info"],"add_recent_item":true}  // No I18N
            sdpAjax({
                url: "/api/v3/"+ encodeHTMLAttribute(options.module) + "/" + options.id, // No I18N
                data: sdpAjaxInputData(inputData),
                success: function (response) {
                    getIndvAssetMetaObj[options.id] = response;
                    delete getIndvAssetMetaObj[options.id].response_status;
                    assetsObj.setLayoutDetails(options.module,options.id);
                    renderDetailsPage(response,_self);
                },
                failedCallBack: function() {
                    showalert("failure", translate("sdp.inventory.assetDefAction.noAsset"), "isAutoHide=false"); // No I18N
                    assetsObj.redirectToEntityList("asset_assets"); // No I18N
                },
                ignorefailuremessage: true
            });
        }   
        /**To set browser title for details page */
        jQuery("#browserTitleInfo").find("#bt_id").text(assetDetailView.asset_id).end().find("#bt_title").text(assetDetailView.data.name);// No I18N
        applyBrowserTitle();
    },
    /** Call render function from getting response from network call (from init function)  
     * @param {object} options
    */
    render: function(options) {
        const _self = this,
              promise = _self.getInitData(options);
        promise && promise.then(function (isValidEntity) {
            if (!isValidEntity) {
                jQuery("#asset_detailview").html(""); // No I18N
            } else {
                _self.renderDetails.call(_self, options);
            }
        });
    },
    /** Create json objects for all actions and right section - Functionality and related popup function initiate here 
     * @param {object} options
    */
    renderDetails: function (options) {
        const _self = this;
        _self.externalframe = (_self.externalframe==true) ? _self.externalframe : options.externalframe;
        // Under CMDB tab, '#cmdblistview' is being used in changeView function.
        // When we click go back from details page, to avoid loading ajax mode (URL has to be changed for listview from ViewCIDetails.do) we remove the following element
        const assetTab = sdp_user.CLIENT_CONF.active_asset_tab  || {};
        let tabName = options.tabName,
            allowedTabObj = _self.getAllowedTabs(),
            entitydata = _self.data;
        const isSoftwareTabAvail = assetDetailView.links_data.tabs.find(function (tab) {
            return tab.name === "softwares";
        });

        tabName = tabName && tabName !== "null" ? tabName : assetTab[_self.data.module.api_name];

            try {
                isSoftwareTabAvail && softwareListView.init({ id: _self.asset_id, links_data: _self.links_data });
            } catch (e) {
                clientErrorHandling.error(e);
            }
            entitydata.basicData = _self.basicData;
          
            if(!entitydata.asset_id){
                entitydata.asset_id = _self.asset_id;
            } else {
                entitydata.ciIdClient = entitydata.id; //view detail in new tab to avoid conflict with asset_id and ci.id.
            }
            options.meta_info = _self.meta_info.fields;
            let isComputerHierarchy = null;
            if(assetDetailView.metaData.hierarchy){
                isComputerHierarchy = (assetDetailView.data.module.internal_name === "Computer" || assetsObj.isComputerHierarchy(assetDetailView.metaData.hierarchy))// No I18N
            }
            /**For checking if we need to show virtual_machines tab in details page */
            let showVmTab = assetDetailView.data.vm_platform;
            if(!showVmTab){
                allowedTabObj.allowedTabs.remove(["virtual_machines"]);
                allowedTabObj.printpreviewTabs.remove(["virtual_machines"]);
            }
            
            let parentPath = assetsObj.getParentPath(assetsObj.assetModTemplateData.metaDataWithId[options.id].hierarchy);
            if(parentPath.length != 0){
            parentPath = parentPath.join(" / ") + " / "+assetDetailView.data.module.display_name;
            }
            else{
            parentPath = assetDetailView.data.module.display_name
            }
            entitydata.parentPath = parentPath;
            entitydata.links_data = _self.links_data;
            if(allowedTabObj.allowedTabs.indexOf(tabName) === -1 || _self.externalframe) {
                tabName = "assetinfo"; // No I18N
            }
        let opt = {
            module_options : options,
            entity_id : _self.asset_id,
            printPreview : options.printPreview,
            links_data : _self.links_data,
            associationsCount : _self.additonal_data,
            isEmptyAssociation : _self.isEmptyAssociation,
            module : "workstation", // No I18N
            data : { "workstation" : entitydata, tabData : _self.tabData}, // No I18N
            container : "asset_detailview", // No I18N
            afterInitialRender : _self.afterInitialRender,
            panel_details : {
                left_panel : {
                    show : _self.externalframe && _self.options.from != "showdetails" && _self.options.from != "view_user_assets",  // No I18N
                    renderfunction : _self.loadLeftpanel,
                    id :"leftpanel_container_kanban_div", // No I18N
                    "class" : "req-sdbar", // No I18N
                    top_panel : {
                        show : true,
                        HTML : `<div class="btn-group bs-noconflict mr10 fr"><button type="button" class="btn btn-default btn-sm list-icon-groups" id="refreshfreq" rel="uitip" title="${translate("sdp.admin.ad.ou.refresh")}"><span aria-hidden="true" class="rspr flat icon-sm rotate-right1"></span></button><div id="t_column_choos_leftpanel_container" class="fl"></div></div>`, // No I18N
                    }
                },
                content_panel : {
                    actions_panel : {
                        show : !options.printPreview && _self.options.from != "showdetails",  // No I18N
                        left_panel : {
                            show : true,
                            id : "asset_actions",  // No I18N
                            template: "asset-details-actionspanel-template",  // No I18N
                            template_namespace: "assets", // No I18N
                            afterRenderfunction : _self.externalframe ? undefined : this.initActions
                        },
                        right_panel : {
                            show : true,
                            template: "asset-details-actionspanel-right", // No I18N
                            template_namespace: "assets", // No I18N
                        },
                        template_namespace : "details"// No I18N
                    },
                    header_panel : {show : true, template: "asset-details-header-template", template_namespace : "assets", "class":"headerbar"}, // No I18N
                    details_panel : {show : true,template_namespace : "details"},// No I18N
                    tabs_panel : {
                        show : true,
                        name : "detail", // No I18N
                        tabs : allowedTabObj.allowedTabs,
                        active: tabName,
                        afterRenderfunction : _self.gotoActiveTab,
                        class: "",
                        settings : {
                            "assetinfo" : { // No I18N
                                show : true,
                                renderfunction : _self.gotoTab,
                                afterRenderfunction : _self.afterTabRender,
                                "id" : "workstation_detail_div" // No I18N
                            },
                            "hardwares" : { // No I18N
                                show : true,
                                //code included from asset over cm
                                "id" : "workstation_hwdetail_div", // No I18N
                                renderfunction : _self.gotoTab,
                                afterRenderfunction : _self.afterTabRender
                            },
                            "applications" : { // No I18N
                                show : true,
                                template : "asset-details-applications-template",// No I18N
                                renderfunction : _self.gotoTab,
                                afterRenderfunction : _self.afterTabRender
                            },
                            "virtual_machines" : { // No I18N
                                show : true,
                                template: "asset-details-virtualhost-template", // No I18N
                                renderfunction: _self.gotoTab,
                                afterRenderfunction: _self.afterTabRender
                            },
                            "softwares" : { // No I18N
                                id : "software_tab",// No I18N
                                show : true,
                                type : "tab",// No I18N
                                section_type : "sub",// No I18N
                                tabs : ["softwares","servicepacks"], // No I18N
                                afterRenderfunction : softwareListView.gotoSoftwareTab,
                                settings : {
                                    "softwares" : { // No I18N
                                        show: !options.printPreview,
                                        containerId : "software_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.wsDetailView.tabHeader.software"), // No I18N
                                        template : "asset-details-software-template",// No I18N
                                        renderfunction: softwareListView.initSoftwareListView,
                                        dataCallback: softwareListView.loadSoftwareTypes,
                                        template_namespace:"assets"   //No I18N
                                    },
                                    "servicepacks" : { // No I18N
                                        show: !options.printPreview,
                                        containerId : "software_tab_content",// No I18N
                                        display_name : translate("asset.sw.tabs.sp"), // No I18N
                                        template : "asset-details-software-servicepacks", // No I18N
                                        renderfunction: softwareListView.initServicePackList,
                                        template_namespace:"assets"   //No I18N
                                    }
                                }
                            },
                            "system" : { // No I18N
                                show : true,
                                //code included from asset over cm
                                "id" : "workstation_systemtab_div", // No I18N
                                renderfunction : _self.gotoTab,
                                afterRenderfunction : _self.afterTabRender
                            },
                            "relationship" : { // No I18N
                                show : true,
                                template : "asset-details-relationship-template", // No I18N
                                afterRenderfunction : _self.afterTabRender,
                                beforeRenderfunction : _self.getRelationshipChart
                            },
                            "contracts" : { // No I18N
                                show : true,
                                template : "asset-details-contracts-template", // No I18N
                                renderfunction : _self.gotoTab,
                                afterRenderfunction : _self.afterTabRender,
                                template_namespace:"assets"   //No I18N
                            },
                            "financials" : { // No I18N
                                show : true,
                                id : "financials_tab",// No I18N
                                type : "tab",// No I18N
                                section_type : "sub",// No I18N
                                tabs : ["cost","depreciation"], // No I18N
                                afterRenderfunction : _self.afterTabRender,
                                settings : {
                                    "cost" : { // No I18N
                                        show : true,
                                        containerId : "financials_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.detailAsset.Costs.title"), // No I18N
                                        template : "asset-details-financial-cost",// No I18N
                                        beforeRenderfunction : _self.costObj.initCostDetails,
                                        renderfunction : _self.costObj.loadCostDetails,
                                        template_namespace:"assets"   //No I18N
                                    },
                                    "depreciation" : { // No I18N
                                        show : true,
                                        containerId : "financials_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.detailAsset.Depreciation"), // No I18N
                                        template : "asset-details-financial-depreciation", // No I18N
                                        renderfunction : _self.costObj.initDepreciationList,
                                        template_namespace:"assets"   //No I18N
                                    }
                                }
                            },
                            "associations" : { // No I18N
                                show: true,
                                display_name: "Associations", // No I18N
                                style: { "min-height": jQuery(window).height() - 120 + 'px' }, // No I18N
                                template : "assets-association-template",    // No I18N
                                renderfunction: _self.associationTab.viewAssociation,
                                template_namespace:"assets",   //No I18N
                                beforeRenderfunction:function(tab_name,getFun,getData){
                                    if(typeof getData!='undefined'){
                                        getData.options.associationsCount = assetDetailView.additonal_data;
                                    }
                                }
                            },
                            "history" : { // No I18N
                                show : true,
                                id : "history_tab",// No I18N
                                type : "tab",// No I18N
                                section_type : "sub",// No I18N
                                tabs : ["scan","state","asset","remote_session","history_for_print"], // No I18N
                                "class" : "pt5",// No I18N
                                afterRenderfunction : function(){
                                    assetsObj.pushingStateURL("detail", assetDetailView.module, "", assetDetailView.id, "history"); // No I18N
                                    jQuery("#history_tab").find("[data-detail-tab='asset']").trigger("click"); // No I18N
                                },

                                settings : {
                                    "scan" : { // No I18N
                                        show : true,
                                        containerId : "history_tab_content",// No I18N
                                        display_name : translate("asset.details.scan.history"), // No I18N
                                        href : `/common/ViewHistory.jsp?module=asset_assets&sub_module=${e_param(_self.module)}&id=${_self.asset_id}&module_value=scan_history`,
                                        href_style : 'overflow-y:hidden' // No I18N
                                    },
                                    "state" : { // No I18N
                                        show : true,
                                        containerId : "history_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.ws.resourcehistory"), // No I18N
                                        href : `/common/ViewHistory.jsp?module=asset_assets&sub_module=${e_param(_self.module)}&id=${_self.asset_id}&module_value=state_history`,
                                        href_style : 'overflow-y:hidden' // No I18N
                                    },
                                    "asset" : { // No I18N
                                        show : true,
                                        containerId : "history_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.asset.history"), // No I18N
                                        href : `/common/ViewHistory.jsp?module=asset_assets&sub_module=${e_param(_self.module)}&id=${_self.asset_id}&module_value=asset_history`,
                                        href_style : 'overflow-y:hidden' // No I18N
                                    },
                                    "remote_session" : { // No I18N
                                        show : true,
                                        containerId : "history_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.remote.history"), // No I18N
                                        href : `/common/ViewHistory.jsp?module=asset_assets&sub_module=${e_param(_self.module)}&id=${_self.asset_id}&module_value=remote_session_history`,
                                        href_style : 'overflow-y:hidden', // No I18N
                                        afterRenderfunction : this.loadRemoteHistory
                                    },
                                    "history_for_print" : {// No I18N
                                        show : false,
                                        containerId : "history_tab_content",// No I18N
                                        display_name : translate("sdp.inventory.wsDetailView.tabHeader.history"), // No I18N
                                        href : `/common/ViewHistory.jsp?module=asset_assets&sub_module=${e_param(_self.module)}&id=${_self.asset_id}&module_value=print_history`,
                                        href_style : 'overflow-y:hidden' // No I18N
                                    }
                                }
                            },
                            "attach_asset" : { // No I18N
                                show : true,
                                display_name : translate("ae.assets.attached"),
                                id : "attached_assets", // No I18N
                                renderfunction : _self.associationObj.loadAssociatedAsset
                            },
                            "attach_component" : { // No I18N
                                show : true,
                                display_name : translate("ae.comp.attached"),
                                id : "attached_components", // No I18N
                                renderfunction : _self.associationObj.loadAssociatedComponent
                            }
                        },
                        template_namespace : "assets"// No I18N
                    },
                    right_panel : {
                        show : !_self.options.externalframe,
                        toggle : !_self.options.externalframe,
                        "sections" : ["linked-ci", "scandetails","properties","userdetails","associations"], // No I18N
                        "settings" : { // No I18N
                             "linked-ci" : { // No I18N
                                "id":"ci-info", // No I18N
                                 show : assetDetailView.links_data.permissions.view_associated_ci,
                                 "class": "form-horizontal inplace-edit pos-rel top0 right0", // No I18N
                                 "template" : "asset-details-rightpanel-linkedci", // No I18N
                                 template_namespace: "assets" // No I18N
                            },
                            "scandetails" : { // No I18N
                                 show : true,
                                 "id":"scan-info", // No I18N
                                 "class": "form-horizontal inplace-edit pos-rel top0 right0", // No I18N
                                 "template" : "asset-details-rightpanel-scan", // No I18N
                                 template_namespace: "assets" // No I18N
                             },
                            "properties" : { // No I18N
                                show : true,
                                "id":"state-info", // No I18N
                                "class": "form-horizontal inplace-edit pb10 pos-rel top0 right0", // No I18N
                                "template" : "asset-details-rightpanel-properties", // No I18N
                                template_namespace: "assets", // No I18N
                                "afterRenderfunction": _self.loadAttachments // No I18N
                            },
                            "associations": {  // No I18N
                                show: sdp_app.IS_SDP,
                                "id": "association-info", // No I18N
                                "class": "form-horizontal inplace-edit pb10 pos-rel top0 right0", // No I18N
                                "template": "asset-details-rightpanel-associations", // No I18N
                                template_namespace: "assets" // No I18N
                            },
                            "userdetails" : { // No I18N
                                show : true,
                                "id" : "requester-info", // No I18N
                                "class": _self.data.user ? "form-horizontal four-col p10" : "hide", // No I18N
                                "href" : _self.data.user ? `/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&apiModule=${_self.data.module.api_plural_name}&apiModuleId=${_self.data.id}&apiEntity=user&orguser=true&userId=${_self.data.user.id}&minContent=true&card=true` : null // No I18N
                            }
                        },
                        template_namespace : "details",// No I18N
                        afterRenderfunction : function(){

                            const summary = _self.additonal_data,
                                  pareEle = jQuery("#asset_detailview"),
                                  container = pareEle.find("#association_summary");
                            for(let key in summary){
                                const getDisClass = summary[key].count==0 ? "disableDiv" : "";// No I18N
                                const html = `<div class="disp-t mb10">
                                <div class="disp-c vmiddle" style="width: 130px;">
                                    <p class="text-color4 m0 vmiddle">`+summary[key].display_name+
                                    `</p>
                                </div>
                                <div class="disp-c">
                                    <span class="badge ui1 default-c cur-ptr ${getDisClass}" name="${key}_count" id="${key}_count";">${summary[key].count}</span>
                                </div>
                                </div>`;
                                container.append(html);
                                container.on("click","#"+key+"_count",function(){// No I18N
                                    const getTabPanel = assetDetailView.detComp.options.panel_details.content_panel.tabs_panel;
                                    if(getTabPanel && getTabPanel.active!="associations"){
                                        pareEle.find("[data-detail-tab=associations]").trigger("click");
                                    }
                                    pareEle.find("#"+key+"_toggle").trigger("click");
                                });
                            }
                        }
                    },
                    template_namespace : "details"// No I18N
                }
            }
        };
        let tabPanelSettings = opt.panel_details.content_panel.tabs_panel.settings;
        if(allowedTabObj.allowedTabsObjs){
            tabPanelSettings = jQuery.extend(true, tabPanelSettings, allowedTabObj.allowedTabsObjs);
        }
        if(!assetDetailView.data.last_scan_time){
            delete tabPanelSettings.history.settings.scan;
        }
        if(!isComputerHierarchy){
            delete tabPanelSettings.history.settings.remote_session;
        }
        if(!assetsObj.hasOwnProperty("operationSource")) {
            assetsObj.getOperationSourceIdForHistory();
        }
        if(options.printPreview){
            let print_details = {};
            tabPanelSettings.history.settings.history_for_print.show=true;
            print_details.print_sections = allowedTabObj.printpreviewTabs;
            print_details.print_metainfo = this.getPrintableSectionsMeta();
            opt.print_details = print_details;
        }else{
            delete tabPanelSettings.history.settings.history_for_print;
        }
		
        if(assetDetailView.detComp){
            assetDetailView.detComp.rerenderDetails(opt, this);
        }else{
            assetDetailView.detComp = new DetailsComponent(opt, this);
        }

        //open print preview window when shift + p is pressed.
        if(assetDetailView.links_data.permissions.modify_state) {
            jQuery(document).off('keydown.asset_print_preview').on('keydown.asset_print_preview',function(e){// No I18N
                /* assetDetailView.links_data.permissions.modify_state use the same condition for prevent working (shift+P) edit page navigate from details page */
                if(assetDetailView && assetDetailView.links_data && assetDetailView.links_data.permissions.modify_state){
                    if(e.shiftKey && e.which === 80) {
                        assetActions.loadAction('print_preview'); // No I18N
                    }
                }
            });
        }
    },
    /**Render function after loading details page from form component */
    afterInitialRender : function(){
        const _self = this;
        if(assetsObj.externalframe && assetDetailView.externalframe){
            this.initActions();
        }
        const parentElement = jQuery("#asset_detailview");
        //personalize tab
        if(!assetDetailView.externalframe) {
            parentElement.find("#tabs-panel-workstation_holder").on("click","[data-detail-tab]", function () {
                let tabs = sdp_user.CLIENT_CONF.active_asset_tab || {};
                tabs[_self.data.module.api_name] = jQuery(this).data("name");
                addPersonalization("active_asset_tab", tabs); // No I18N
            });
        }

        parentElement.off('click').on("click","#ws_backtolistview", function(){ // No I18N
			if(_self.options.from == "view_user_assets"){
				assetsObj.redirectTo("list","asset_attachments", "", "", "", "", "view_user_assets", "",  undefined, undefined ); // No I18N
				return;
			}
            const data = assetDetailView.data;
            let productType = data.module.internal_name, from = null;
        
            if(assetsObj.externalframe && assetDetailView.externalframe){
                from="dashboard";// No I18N
            }
            const isGroupListView = false;

                if(assetDetailView.externalframe){
                    /*When we opened listview from dashboard, then view any of the asset, typeID will be set.
                     So when we go back to listview, type ID also getting appended for criteria. So we are setting as empty

                     If list view shows all module(workstation, printer...) assets, then asset type id(i.e. printer type id, workstation type id)
                     needs to be reset to avoid loading that perticular module list alone instead of loading all modules assets
                     from currently loaded module in details page otherwise should load that module list alone.
                    */
                    if (!assetsObj.product_type_id) {
                        productType = ""; // No I18N
                    }

                }
                if(!assetsObj.externalframe){
                    const getSelFilterArr = assetsObj.filter_value; 
                    /**For trigger related module click in left section for modify type */
                    if(assetsObj.isModifyType){
                        const getLeftSecId = jQuery("#"+assetsObj.module);
                        if(getLeftSecId.length>0 && assetsObj.module!=="asset_assets"){
                            jQuery("#"+assetsObj.module+".jstree-node a").trigger('click');
                            delete assetsObj.isModifyType;
                            assetsObj.retainSelectedFilterValues(getSelFilterArr);
                            return true;
                        }else{
                            assetListView.filter_criteria = null;
                            Object.keys(assetListView.tableObject).length>0 && (assetListView.tableObject.t_obj.table_info.list_info.search_criteria = null);
                            delete assetsObj.isModifyType;
                        }
                    }
                /**End */
                !isGroupListView && assetsObj.redirectToEntityList(assetsObj.list_module?assetsObj.list_module:assetsObj.module, null, "", assetDetailView.options.from, productType, assetDetailView.externalframe); // No I18N
                assetsObj.retainSelectedFilterValues(getSelFilterArr);
            }
            else
                assetsObj.redirectTo("list",assetsObj.list_module,null,"","","",from);// No I18N
        
                if(assetDetailView && assetDetailView.links_data && assetDetailView.links_data.permissions){
                    assetDetailView.links_data.permissions.modify_state = false;
                }   
            });
            /**Onclick function for refresh icon in details page navigate from summary and dashboard listview */
            jQuery("#lefttop-panel-workstation").find("#refreshfreq").on("click",function(){
                assetListView.refreshTable();
            });
            if(sdp_app.IS_SDP){
                SdpWidgets.renderHelpers.renderModuleWidgets({
                        module:"asset",//No i18n
                        entity_id:assetDetailView.entity_id,
                        moduleAlias:"workstation",//No i18n
                        refreshPanel:()=>{
                            assetDetailView.detComp.refreshPanel("panel","content-right"); // NO I18N
                        },
                        default_icon:"cur-ptr cspr icon-md relationmap vmiddle " // NO I18N
                    });
                $CS.findElement("asset_detailview").trigger("page:load")  // No I18N
            }
    },
    /**Called from render function set module details to assetDetailView 
     * @param {object} options
    */
    getInitData : function(options){
        const _self = this;
        const productTypeObj = _self.data.module; 
        /**Getting asset template data */
        const getCurrentAssetMeta = jQuery.extend(true, {}, assetsObj.assetModTemplateData.metaDataWithId[options.id]);
        _self.meta_info = getCurrentAssetMeta.metainfo;
        _self.metaData = getCurrentAssetMeta;
        _self.layouts = {
            layouts: [getCurrentAssetMeta.layout]
        };
        _self.options = options;
        _self.externalframe = false;
        _self.printPreview = options.printPreview;
        _self.module_details = {
            module : options.module || _self.detComp && _self.detComp.options.module_options.module,
            moduleType : options.moduleType || assetDeta_selfilView.detComp && _self.detComp.options.module_options.moduleType
        };
        _self.productType = productTypeObj;
        if(options.id){
            _self.entity_id = _self.id = options.id;
            _self.asset_id = _self.data.id;

        }

        options.module = _self.module = productTypeObj.api_plural_name;///entity_name+"s"; // No I18N
        let getAllowedActionsList = () => {
            return assetsObj.getAllowedActions(_self.module, null, _self.getId, "", "", _self.data, _self._links, _self.tabs);
        }
        let linksPromise = getAllowedActionsList();
        
        _self.links_data = linksPromise;

        return jQuery.when(linksPromise);
    },
    assetinfo : {
        showCIInfoDdetails : function(){
            this.initFormComponent();
        },
        /** Init form component to render asset info 
         * @param {object} configJSONOpt
         * @param {object} options
         * 
        */
        initFormComponent : function(id, configJSONOpt, options){
            const _self = this,
                assetDetObj = assetDetailView;
            if(!options){
                options = {};
            }
            let wsTemplateLayout;
                wsTemplateLayout = jQuery.extend(true, {}, assetDetObj.layouts);
                wsTemplateLayout = assetDetObj.getSectionsForDetailsTab(wsTemplateLayout);

          

            const entitydata = assetDetObj.data;
          
            
            let configJSON = {
                name: "workstation",// No I18N
                entity: assetDetObj.entity_name,
                entitypath: assetDetObj.entity_name,
                entitydata: jQuery.extend(true, {}, entitydata),
                template: wsTemplateLayout,
                metadata: jQuery.extend(true, {}, assetDetObj.meta_info),
                mode: "view",// No I18N
                container: "workstation_detail_div",// No I18N
                formid: "workstation",// No I18N
                canEdit : false,
                loadInsideForm : true,
                showmore : assetsObj.printPreview ? false : true,
                view: {
                    custom_htmls: {
                        os_name: {
                            field_value:function () {
                                const osName = assetDetObj.data.os_name,
                                      icon = assetDetObj.data.icon,
                                      image = icon ? `<img src='${icon}' class='icon-md pos-abs mt3'/>` : "";

                                const nameHtml = `<span class="ml10 p5 pl0 mt0 disp-ib text-overflow fw ${(icon ? "ml25" : "")}" title="${e_attr(osName)}" rel="uitip">${e_html(osName)}
                                </span>`;

                                if (osName) {
                                    return image + nameHtml
                                }
                            }
                        },
                        purchase_order_no: {
                            field_value:function(){
                                const entitydata = assetDetObj.data;
                                if(entitydata.purchase_order_no && sdp_user.ROLES.indexOf("ViewPurchaseOrder") != -1) {
                                    return `<p  data-name="purchase_order_no" type="string" data-value="1" name="purchase_order_no" data-field="undefined" class="form-control-static"><a rel="noopener noreferrer" href="/PurchaseOrder.do?module=view&poID=${e_attr(entitydata.purchase_order.id)}&sectionLoad=false" class="ml5 text-primary" target="_blank">#${e_html(entitydata.purchase_order_no)}</a></p>`;
                                }
                            }
                        },
                        barcode: {
                            field_value: function() {
                                const entitydata = assetDetObj.data;
                                if(entitydata.barcode && !assetDetObj.externalframe && (assetDetObj.links_data.permissions.add || assetDetObj.links_data.permissions.edit)){
                                    return `<p data-name="barcode" data-barcode="${e_attr(entitydata.barcode)}" type="string" data-value="null" name="barcode" data-field="undefined" class="form-control-static">${e_html(entitydata.barcode)}<a title="${translate("ae.barcode.assetDetails.printBarcode")}" rel="noopener noreferrer" href="/" class="ml5" ><span class="cspr print icon-sm"></span></a></p>`;
                                }
                            }
                        }


                    }
                },
                afterRenderCallback: function () {
                    //adjust bulk edit dialog height when form fields rendered.
                    if (options.operation === "bulkedit") {
                        const getDetailsContainer = jQuery("#asset_detailview").find("#workstation_detail_div");
                        window.top.assetsObj.dialog.height() > getDetailsContainer.height() && window.top.assetsObj.dialog.dialog("option", "height", getDetailsContainer.height() + 100 );//NO I18N
                        jQuery('[data-name="form-footer"]').addClass("form-footer pos-fix bottom0 fw"); //set form footer at bottom
                    }
                    assetDetObj.links_data.permissions.attach_document && _self.loadAttachment("workstation_detail_div");//NO I18N
                    window.onFormRender && onFormRender();
                    /**Onclick function for barcode icon in details page */
                    if(!assetDetObj.externalframe && (assetDetObj.links_data.permissions.add || assetDetObj.links_data.permissions.edit)){
                        jQuery("#workstation_detail_div").find('[data-name="barcode"]').on('click',function(){
                            const getBarcodeValue = jQuery(this).attr("data-barcode");
                            if(getBarcodeValue) {
                                NewWindow('/BarcodeScanAction.do?method=print&barcode='+encodeURIComponent(getBarcodeValue),'addNewItem','900','550','yes','center', null, null, null, true);
                            }
                        });
                    }
                    /**VM host details need not be shown for VMs */
                    if(assetDetObj.detailFormComponent.entitydata.vm_host != null) {
                        const vmHostSection = jQuery('[data-section="Virtual Host Details"]'); //NO I18N
                        vmHostSection.hide();
                    }
                }
            }
            if(sdp_user.ROLES.indexOf("SDAdmin") === -1){ //NO I18N
                delete configJSON.view.custom_htmls.ci_type;
            }

            configJSON = jQuery.extend(true, configJSON, configJSONOpt);
            

            const ipAddresses = configJSON.entitydata.ip_addresses,
                  macAddress = configJSON.entitydata.mac_addresses;

            //show space between ip addresses/mac addresses in details page
            if (ipAddresses) {
                configJSON.entitydata.ip_addresses = ipAddresses.split(",").join(", ");
            }

            if (macAddress) {
                configJSON.entitydata.mac_address = macAddress.split(",").join(", ");
            }

            const fc = new FC(configJSON);
            
            assetDetObj.detailFormComponent = fc;
        },
        /** For Delete and Update attachments in detail view left section  
         * @param {object} response
         * @param {Boolean} isUpload
         * 
        */
        onFileAttachmentUploadOrDelete: function (response,ele,isUpload) {   
            /**Push attached values in global array to avoid additional network call */ 
            if(isUpload){
                if(response.response_status.status=="success"){
                    assetDetailView.data.attachments.push(response.attachment);
                    /**Render success alert if up-ld class is not available (specific for bulk attachments) */
                    if(jQuery('.up-ld').length==0){
                        showalert("success", translate("sdp.api.attachment.add.success"), "isAutoHide=true");//NO I18N
                    }
                }
            }else{
                /**For removing deleted data in global variable */
                let getAttachedElements = jQuery("#attachment-api").find('.btn-group').find("[data-attach-url]");
                let tempArrForAttach = [];
                const getLength = getAttachedElements.length;
                if(getLength>0){
                    for(let i=0;i<getLength;i++){
                        let getId = jQuery(getAttachedElements[i]).attr("data-attach-id");
                        let getArrayOfAttachments = assetDetailView.data.attachments;
                        getArrayOfAttachments.forEach(function(e,index){
                            if(parseInt(e.id)===parseInt(getId)){
                                tempArrForAttach.push(index);
                            }
                        });
                    }
                    let getSlicedArray = [];
                    jQuery.each(tempArrForAttach,function(currIndex,fieldVal){
                        getSlicedArray.push(assetDetailView.data.attachments[fieldVal]);
                    });
                    assetDetailView.data.attachments = getSlicedArray;
                }else{
                    assetDetailView.data.attachments = [];  
                    jQuery("#asset_detailview").find("#attachment-api").html("");
                }
            }
            assetDetailView.renderAttachmentPopover();
        },
       
        /**
         * Render attachments from right side of details page
         * @param {*} containerId 
         */
        renderAttachments: function (containerId) {
            const attachments = assetDetailView.data.attachments;
            const attachementsHTML = attachments.map(function (attachment) {
                let attachEle = "";
                if(attachment.attached_by && attachment.attached_on) {
                    attachEle = `<button type="button" class="preAttach" rel="noopener noreferrer" data-href="${attachment.content_url}" data-attach-size="${attachment.size.display_value}" data-attach-by="${e_attr(attachment.attached_by.name)}" data-attach-id="${attachment.id}" data-attach-on="${attachment.attached_on.display_value}">${e_html(attachment.name)}</button>`;//No I18N
                } else {
                    attachEle = `<button type="button" class="preAttach" rel="noopener noreferrer" data-attach-id="${attachment.id}" data-href="${attachment.content_url}" data-attach-size="${attachment.size.display_value}">${ e_html(attachment.name)}</button>`;//No I18N
                }
                return attachEle;
            });
            const id = "attachment-api";// No I18N

            jQuery("#file-browser-area, #attachment-api").remove();
            jQuery("#" + containerId).append("<div id='" + id + "'>");
            jQuery("#" + id).html(attachementsHTML);
        },
        /**
         * Execute to load attachment using attachment component
         * @param {*} containerId 
         */
        loadAttachment: function (containerId) {
            const _self = this, assetDetObj = assetDetailView;
            _self.renderAttachments(containerId);
            
            const attach_options = {
                "url": "/api/v3/asset_assets/"+_self.asset_id+"/attachments", // No I18N
                "entity": "asset_assets", // No I18N
                "api" : false, // No I18N
                targetId: "#attachment-api", // No I18N
                // "rerenderOnUpload": false,// No I18N
                "upload_api" : true, //No I18N
                "entity_id": assetDetObj.asset_id, // No I18N
                "upload" :  (assetDetObj.links_data.permissions.edit && !assetDetObj.printPreview && !assetDetObj.externalframe) , //No I18N
                "enable_delete" :  (assetDetObj.links_data.permissions.edit && !assetDetObj.printPreview && !assetDetObj.externalframe), //No I18N
                "is_odapi" : true, // No I18N
                "is_odapi_v2": true, //to support latest OD  API // No I18N
                "print_preview": assetDetObj.printPreview || assetDetObj.externalframe, //No I18N
                "drop_element" : "#workstation_detail_div", //No I18N
                "servlet_url": "/api/v3/asset_assets/" + assetDetObj.asset_id +"/_upload", // No I18N
                "servlet_cb": function(response,attachmentEle){  //No I18N
					assetDetObj.assetinfo.onFileAttachmentUploadOrDelete(response,attachmentEle,true)
				},
                "ondelete": ['assetDetailView.assetinfo.onFileAttachmentUploadOrDelete',window] // No I18N
            };

            try {
                _self.attachPreviewObj = new attachPreview('#attachment-api', attach_options); //No I18N
            } catch(e) {
                clientErrorHandling.error(e);
            }
        }
    },
    subforminfo : {
        /**Initiate subform in details page
         * @param {string} tabname
         * @param {*} container
         * @param {*} message
         */
        load : function(tabname, container, message){
            this.initFormComponent(tabname, container, message);
        },
        /**Initiate subform in details page
         * @param {string} tabname
         * @param {*} container
         * @param {*} message
         */
        initFormComponent : function(tabname, container, message){
            const _self = this, assetDetObj = assetDetailView;
            let wsTemplateLayout = jQuery.extend(true, {}, assetDetObj.layouts);
            let fields = [];
            assetDetObj.tabs.forEach(function(tab){
                if(tab.name===tabname){
                    fields=tab.fields;
                }
            })

            let sub_sections = [],
                layout = wsTemplateLayout.layouts[0],
                sections = layout.sections;
                sub_sections = sections.filter(function (section) {
                    return section.is_subform && fields.contains(section.referrer);
                });
                const fieldsList = {
                    "hard_disks" : ["disk_usage"], // No I18N
                    "logical_drives" : ["drive_usage"] // No I18N
                }
                sub_sections = assetDetObj.addFieldsToSubForm(sub_sections,fieldsList);
            layout.sections = sub_sections;
            wsTemplateLayout.layouts[0] = layout;

            const entitydata = assetDetObj.data;
            let subFormData = false;
            sub_sections.forEach(function(subform){
                if(assetDetObj.data[subform.referrer] && assetDetObj.data[subform.referrer].length>0){
                    subFormData = true;
                }
            });
            if(!subFormData){
                const msgContainer = `<div class="alert alert-info icon" role="alert"><span class="msg">${translate(message,[e_html(assetDetObj.metaData.module_details.display_name)])}</span></div>`;
                jQuery("#"+container).html(msgContainer);
            }
            else{
                const configJSON = {
                    name: "workstation",// No I18N
                    entity: assetDetObj.entity_name,
                    entitypath: assetDetObj.entity_name,
                    entitydata: jQuery.extend(true, {}, entitydata),
                    template: wsTemplateLayout,
                    metadata: jQuery.extend(true, {}, assetDetailView.meta_info),
                    mode: "view",// No I18N
                    container: container,
                    formid:"workstation" // No I18N
                }
                const tempFC = new FC(configJSON);
                assetDetObj.detailFormComponent = tempFC;
            }
        }
    },
    /*code included from asset over cm branch*/
    /**Render needed sections and skip other fields in details view
     * @param {*} template
     */
    getSectionsForDetailsTab: function (template){
        
        const _self = this;
        const layout = template.layouts[0];
        let sections = layout.sections;
        _self.tabs.forEach(function(tab){
            if(tab.fields){
                tab.fields.forEach(function (field){
                    sections = sections.filter(function (section) {
                        return !(section.referrer===field);
                    });
                })
            }
        });
        const fieldsList = {
            "product" : ["manufacturer", "part_no"], // No I18N
            "purchase_cost" : ["purchase_order", "purchase_order_no"], // No I18N
            "service_tag" : ["total_disk_space", "chassis_type", "logged_on_user"] // No I18N
        }
        sections = _self.addFieldsToSection(sections,fieldsList);
        sections = _self.addAgentDetailSection(sections);


        let getFieldName = [];
        let removedSection = [];
        const fields = assetDetailView.meta_info.fields;
        for(let j = 0, jLen = sections.length; j < jLen; j++) {
            let removedField = [];
            let section = sections[j];

            for (let k = 0; section.fields && k < section.fields.length;k++){
                if(getFieldName.length>0){
                    if(getFieldName.indexOf(section.fields[k].name)!=-1 && section.is_subform === false){
                        removedField.push(k);
                    }else if (section.is_subform === false && fields[section.fields[k].name] && fields[section.fields[k].name].for_detail_view == false ) {
                        removedField.push(k);
                    }
                }
                if(removedField.indexOf(k)==-1){
                    getFieldName.push(section.fields[k].name);
                }
            }
            _self.spliceArrFunction(removedField, section.fields);
            if(section.fields.length == 0 || section.referrer == 'virtual_machines') { //NO I18N
                removedSection.push(j);
            }
        }
        _self.spliceArrFunction(removedSection, sections);

        const reorder_subforms = assetsObj.globalConfigurations ? assetsObj.globalConfigurations.configurations.reorder_subforms : true;
        if(reorder_subforms){
            let sub_sections = sections.filter(function (section) {
                return section.is_subform;
            });
            sections = sections.filter(function (section) {
                return !section.is_subform;
            });
            sections = sections.concat(sub_sections);
        }
        let r = 0;
        sections.forEach(function(sec){
            sec.position.row = r+1;
            r++;
        });
        layout.sections = sections;
        return template;
    },
    spliceArrFunction: function(indexArr, dataArr){
        var reversed = indexArr.reverse();
            jQuery.each(reversed,function(currIndex,fieldVal){
                dataArr.splice(fieldVal,1);
            });
            return dataArr;
    },
    /**
     * construct template sections
     * @param {*} sections 
     * @param {*} fieldsList 
     * @returns 
     */
    addFieldsToSection: function (sections, fieldsList) {
        const _self = this,
              keys = Object.keys(fieldsList);
        keys.forEach(function(key){
            sections.forEach(function(section){
                const fields = section.fields;
                const list = fieldsList[key];
                fields.forEach(function(field,index){
                    if(field.name===key){
                        const last_field = fields[fields.length - 1],
                              col_count = section.column_count;
                        let last_col = last_field.position.col,
                            last_row = last_field.position.row,
                            pos = _self.getFieldPosition(last_col, last_row, col_count);
                        section.fields.push({name: list[0], position:pos});
                        for(let i=1;i<list.length;i++){
                            last_col = pos.col;
                            last_row = pos.row;
                            pos = _self.getFieldPosition(last_col, last_row, col_count);
                            section.fields.push({name: list[i], position:pos});
                        }
                    }
                    /**Add region in details page asset info after site field */
                    if(field.name==="site"){
                        const getIndex = fields.findIndex(obj => obj.name ==="region");
                        const regionObj = {
                            name : "region",//No I18N
                            position : {col: field.position.col, col_size: field.position.col_size}
                        }
                        const indexToInsert = parseInt(index)+parseInt(1);
                        (getIndex==-1) && fields.splice(indexToInsert,0,regionObj);
                    }
                    /**End */
                });
            });
        });
        return sections;
    },
    /**
     * construct agent details sections 
     * @param {*} sections 
     * @returns 
     */
    addAgentDetailSection: function (sections) {
        const _self = this;
        const list = ["agent_version", "agent_installed_time", "last_contact_time", "last_agent_scan_time", "last_boot_time", "remote_office"]; // No I18N
        let fieldsArr = [];
        for (let i=0;i<sections.length;i++){
            const section = sections[i],
                  fields = section.fields;
            fields.forEach(function(field){
                if(field.name==="service_tag"){
                    const agent_section = jQuery.extend(true, {}, section);
                    let pos = _self.getFieldPosition(0, 0, agent_section.column_count);
                    list.forEach(function(item){
                        const fieldObj = {
                            name : item,
                            position : pos
                        }
                        fieldsArr.push(fieldObj);
                        pos = _self.getFieldPosition(pos.col, pos.row, agent_section.column_count);
                    });
                    agent_section.name = "Agent Details"; // No I18N
                    agent_section.fields = fieldsArr;
                    sections.splice(i+1,0, agent_section);
                }
            });
        }
        return sections;
    },
    /**get column count
     * @param {integer} last_col
     * @param {integer} last_row
     * @param {integer} col_count
     * @returns
    */
    getFieldPosition: function (last_col, last_row, col_count) {
        col_count = parseInt(col_count);
        let row,col;
        if(last_col===col_count){
            row = last_row+1
            col = (last_col+1)%col_count;
        }else{
            row = last_row
            col = last_col+1;
        }
        return {col: col, row: row}
    },
    /**
     * construct template sections
     * @param {*} sections
     * @param {*} fieldsList
     * @returns
     */
    addFieldsToSubForm: function (sections, fieldsList) {
        const _self = this,
              keys = Object.keys(fieldsList);
        keys.forEach(function(key){
            sections.forEach(function(section){
                const fields = section.fields;
                const list = fieldsList[key];
                if(section.referrer===key){
                    const last_field = fields[fields.length - 1];
                    let last_col = last_field.position.col,
                        last_row = last_field.position.row,
                        pos = _self.getFieldPositionInSubForm(last_col, last_row);
                    section.column_count = parseInt(section.column_count) + 1;
                    section.fields.push({name: list[0], position:pos, context:key});
                    for(let i=1;i<list.length;i++){
                        last_col = pos.col;
                        last_row = pos.row;
                        pos = _self.getFieldPositionInSubForm(last_col, last_row);
                        section.column_count = parseInt(section.column_count) + 1;
                        section.fields.push({name: list[i], position:pos, context:key});
                    }
                }
            });
        });
        return sections;
    },
        /**get position
     * @param {integer} last_col
     * @param {integer} last_row
     * @returns
    */
    getFieldPositionInSubForm: function (last_col, last_row) {
        return {col: last_col + 1, row: last_row}
    },
    /**
     *
     * Moved extension file 
     */
    hashChange : function(){
        let hashURL = window.location.hash;
            if(hashURL != null && hashURL != "") {  // No I18N
                hashURL = hashURL.substr(1);
                this.gotoActiveTab("", "", {"active" : hashURL}); // No I18N
            }
    },
    /**Used for rendering detailview in popup eg: while clicking listview in dashboard page  
     * @param {integer} id
     * @param {Boolean} externalframe
     * @param {string} currentTab
    */
    gotoInit : function(id, externalframe, currentTab){
        const _self = this;
        let options = {
            id: id,
            externalframe : externalframe,
            tabName : currentTab || "assetinfo"// No I18N
        };
        options = jQuery.extend(true, _self.options, options);
        options.module = externalframe ? _self.module_details.module : options.module;
        options.moduleType = externalframe ? _self.module_details.moduleType : options.moduleType
        _self.init(options);
        if(externalframe){
            jQuery('#leftpanel_container_kanban_div').find('.tc-row[data-entityid]').removeClass("active").end().find('.tc-row[data-entityid="'+id+'"]').addClass("active");
        }
    },
    
    /**Render listview in dashboard detail view page  */
    loadLeftpanel : function(){
        assetListView.initListView(assetDetailView.module, assetDetailView.moduleType, "left_panel", assetDetailView.externalframe); // No I18N
    },
    /**Check current active tab and render ralated page in edtails view
     * @param {object} tabObject
     */
    gotoActiveTab : function(from, tabSettings, tabObject){
        const _self = this;
        let currentTabName = tabObject.active;
        if(typeof assetsObj.isNewAsset!="undefined" && assetsObj.isNewAsset){
            currentTabName = "assetinfo"; // No I18N
            assetsObj.isNewAsset = false;
            _self.detComp.options.panel_details.content_panel.tabs_panel.active = currentTabName;
        }
        if(!currentTabName){
            currentTabName = _self.detComp.options.panel_details.content_panel.tabs_panel.active || "assetinfo"; // No I18N
        }
        jQuery("#"+_self.detComp.options.container).find("#tabs-panel-workstation >ul li[data-detail-tab='"+currentTabName+"']").trigger("click"); // No I18N
    },
    /**Used for getting selected tab functionality function name in details page for all tabs
     * @param {string} tabName
     */
    gotoTab : function(tabName){
        const _self = this;
        if(!tabName){
            tabName = _self.detComp.options.panel_details.content_panel.tabs_panel.active || "assetinfo"; // No I18N
        }
        let data = _self.data;
            data.metainfo = _self.meta_info;

            switch(tabName){
                case "assetinfo"://No I18N
                    _self.assetinfo.showCIInfoDdetails();
                    break;
                case "hardwares"://No I18N
                    _self.subforminfo.load(tabName, "workstation_hwdetail_div", "asset.details.hardware.info"); // No I18N
                    break;
                case "softwares"://No I18N
                    _self.softwareView.init();
                    break;
                case "system"://No I18N
                    _self.subforminfo.load(tabName, "workstation_systemtab_div", "asset.details.system.info"); // No I18N
                    break;
                case "contracts"://No I18N
                    _self.loadContractDetails();
                    break;
                case "applications"://No I18N
                    _self.loadApplicationDetails();
                    break;
                case "financials"://No I18N
                    _self.costObj.loadCostDetails();
                    break;
                case "virtual_machines"://No I18N
                    _self.loadAssetAllocationinVm();
                    break;
                case "relationship"://No I18N
                    _self.getRelationshipChart();
                    break;
                default:
                    jQuery("#"+_self.detComp.options.container).find("#tabs-panel-workstation >ul li[data-detail-tab='"+tabName+"']").trigger("click"); // No I18N
                    break;
            }
    },
    /**Used for get needed data for relationship chart in details page  */
    getRelationshipChart : function(){
        const _self = this, 
            detView = _self.detComp.options,
            module = _self.module,
            input_data = {"list_info":{"row_count":"100","start_index":1, get_total_count: true}}; // No I18N

        detView.getAssetConnections = assetsObj.commonAjaxFunction(module+"/"+_self.entity_id+"/asset_connections/parent_asset",null,input_data,null,null);
        detView.getBSConnections = assetsObj.commonAjaxFunction(module+"/"+_self.entity_id+"/business_service_connections",null,input_data,null,null);
        detView.getCompAttachments = assetsObj.commonAjaxFunction(module+"/"+_self.entity_id+"/component_attachments/parent_asset",null,input_data,null,null);
        detView.getAssetAttachments = assetsObj.commonAjaxFunction(module+"/"+_self.entity_id+"/asset_attachments/parent_asset",null,input_data,null,null);
        const getModSpeData = assetsObj.assetModTemplateData.metaDataWithId;
        if(getModSpeData.hasOwnProperty(_self.entity_id) && getModSpeData[_self.entity_id].hasOwnProperty(_self.entity_name)){
            detView.getCurrAsset = getModSpeData[_self.entity_id][_self.entity_name];
        }else{
            detView.getCurrAsset = assetsObj.commonAjaxFunction(module+"/"+_self.entity_id,null,null,null,_self.entity_name);
        }
    },
    /**Rendering popup for clickable element in "Add Relationship" dropdown in relationship tab
     * @param {*} getFunName
     * @param {string} getEntityName
     * @param {string} placeHolderName
    */
    searchAssets : function(getFunName,getEntityName,popupName,placeHolderName){
        const _self = assetDetailView,
            parentElement = jQuery('#formCont');
        parentElement.find("#assetSearch").sdp_select2({
            value: "",//NO I18N
            cache:{},
            multiple:true,
            closeOnSelect:false,
            allowClear : true,
            width:"100%",
            height:100,
            placeholder: translate("form.select.placeholder",[translate(placeHolderName)]), // No I18N
            url:[{
                 url:"/api/v3/"+encodeHTMLAttribute(_self.module)+"/"+_self.entity_id+"/"+getFunName,//NO I18N
                 field:getEntityName
            }],
            dropdownCssClass: "text-wrap" // No I18N
         });
         parentElement.on("change","#assetSearch",function(){
            var getSelectedValList = jQuery("#assetSearch").select2("data"); // No I18N
            if(getSelectedValList.length>0){
                jQuery("#business_save_btn").removeAttr("disabled"); // No I18N
            }else{
                jQuery("#business_save_btn").attr("disabled",true)
            }
         });
    },
    /** Rendering popup while clicking options in "Add Relationship" dropdown in relationship tab 
     * @param {*} getFunName
     * @param {*} getEntityName
     * @param {*} popupName
     * @param {*} placeHolderName
    */
    assetConnectionsClickFun : function(getFunName,getEntityName,popupName,placeHolderName){
        const currObj = this;
        const parentElement = jQuery("#asset_detailview").find('#formCont')
        parentElement.attr("data-fun",getFunName.split("/")[0]);
        jQuery('#formCont').dialog({
            width     : 550,
            resizable : false,
            modal: true,
            focus: function () {
                jQuery('#assetSearch').closest('.ui-dialog').focus();
            },
            close:function(){
                jQuery(this).dialog("destroy");//No I18N
                jQuery("#assetSearch").select2('data', {}); //No I18N
                jQuery("#business_save_btn").attr("disabled",true);
            }
        });
        jQuery('.ui-dialog-title').html(translate(popupName));
        currObj.searchAssets(getFunName,getEntityName,popupName,placeHolderName)
    },
    /** Save function for attachments and connections popup in "Relationship tab" */
    saveAssetsForRelationship:function(){
        const _self = this,
            selAssets = jQuery('#assetSearch').val().includes(',') ? jQuery('#assetSearch').val().split(',') : [jQuery('#assetSearch').val()],
            currFunName = jQuery('#formCont').attr('data-fun');
        let tempArr = [],
            type = "POST";//No I18N
        if(selAssets.length>0){
            for(let i=0;i<selAssets.length;i++){
                let obj = {};
                if(currFunName=="business_service_connections"){
                    obj['asset'] = {
                        id : _self.entity_id
                    }
                    obj['service_category'] = {
                        id : selAssets[i]
                    }
                }else if(currFunName=="asset_connections"){//No I18N
                    obj['child_asset'] = {
                        id : selAssets[i]
                    }
                    obj['parent_asset'] = {
                        id : _self.entity_id
                    }
                }else{
                    type = "PUT";//No I18N
                    obj["state"] = {
                        name : "In Use"//No I18N
                    }
                    obj["used_by_asset"] = {
                        id : _self.entity_id
                    }
                    obj["id"] = selAssets[i]
                }
                tempArr.push(obj);
            }
        }

        let data = {},
            fieldName = (currFunName=="business_service_connections" || currFunName=="asset_connections") ? currFunName.slice(0, -1) : "asset_assets";//No I18N
        data[fieldName]=tempArr;
        saveFun(_self.module,_self.entity_id,data,currFunName,type)
        function saveFun(module,entity_id,data,currFunName,type){
            const url = (currFunName=="business_service_connections" || currFunName=="asset_connections") ? encodeHTMLAttribute(module)+"/"+entity_id+"/"+currFunName : "asset_assets"//No I18N
            sdpAjax({
                url: "/api/v3/"+url,//No I18N
                data: sdpAjaxInputData(data),type:type,
                success: function (response) {
                    if(currFunName=="business_service_connections" || currFunName=="asset_connections"){
                        showalert('success', translate('common.connected.success.msg'),"isAutoHide=true")//No I18N
                    } else {
                        showalert('success', translate('ae.attach.success'),"isAutoHide=true")//No I18N
                    }
                    _self.refreshRelationshipTab();
                    _self.cancelAssetsForRelationship();
                },
                //TODO failedCallBack - error handling
            });
        }
    },
    /** Cancel function for attachments and connections popup in "Relationship tab" */
    cancelAssetsForRelationship:function(){
        jQuery('.ui-dialog .ui-dialog-titlebar-close').trigger("click");
        jQuery('#formCont .select2-container').remove();
    },
    /**Delete function for added attachments and connections in "Relationship tab"
     * @param {*} getFunName
     * @param {*} childId
     * @param {*} fieldName
     * 
    */
    assetDeleteFun:function(getFunName,childId,fieldName){
        const _self = this;
        let obj = {},
            type = "DELETE",//No I18N
            url = "asset_assets/"+_self.entity_id+"/"+getFunName;//No I18N
        if(getFunName=="business_service_connections"){
            obj['asset'] = {
                id : _self.entity_id
            }
            obj['service_category'] = {
                id : childId
            }
        }else if(getFunName=="asset_connections"){//No I18N
            obj['child_asset'] = {
                id : childId
            }
            obj['parent_asset'] = {
                id : _self.entity_id
            }
        }else{
            url = "asset_assets?ids="+childId;//No I18N
            type = "PUT";//No I18N
            obj["state"] = {
                name : "In Store"//No I18N
            },
            obj["used_by_asset"]=null
        }
        let data = {};
        data[fieldName]=obj;
        sdpAjax({
            url: "/api/v3/"+url,//No I18N
            data: sdpAjaxInputData(data),type:type,
            success: function (response) {
                if(getFunName=="business_service_connections" || getFunName=="asset_connections") {
                    showalert('success', translate('sdp.common.disconnected.msg'),"isAutoHide=true")//No I18N
                }else {
                    showalert('success', translate('ae.detach.success'),"isAutoHide=true")//No I18N
                }
                _self.refreshRelationshipTab();
                _self.cancelAssetsForRelationship();
            },
             //TODO failedCallBack - error handling
        });
    },
    /**Render details page after getting current tab name 
     * @param {string} tabName
     * 
    */
    afterTabRender : function(tabName){
        const _self = this;
        if(!tabName){
            tabName = _self.detComp.options.panel_details.content_panel.tabs_panel.active || "assetinfo"; // No I18N
        }
        if(!_self.printPreview && assetsObj.doPush){
            assetsObj.pushingStateURL("detail", _self.module , "", this.options.id, tabName); // No I18N
        }else{
            assetsObj.doPush = true;
        }
        if(tabName=="financials"){
            if(assetDetailView.isDepreciationSaved){
                jQuery("#financials_tab").find("[data-detail-tab='depreciation']").trigger("click");
                delete assetDetailView.isDepreciationSaved;
            }else{
                jQuery("#financials_tab").find("[data-detail-tab='cost']").trigger("click"); // No I18N
            }
            
        }
    },
    /** Render remote session history in asset details page history tab */
    loadRemoteHistory : function(){
        let days ="";
        if(assetsObj && assetsObj.globalConfigurations)
        days = assetsObj.globalConfigurations.configurations.web_remote_cleanup_days;
        const alertStr = `<div><div class='pl10 pr10'><div class='alert alert-warning mb5 mt10' role='alert'><span aria-hidden='true' class='sdp-glyph sdp-glyph-status sdp-glyph-warning'><span class='path1'></span><span class='path2'></span></span><span class='msg'>${translate("sdp.inventory.remote.history.schedulewarning", new Array(days))}</span></div></div></div>`; //NO I18N
        jQuery("#history_tab_content").prepend(alertStr);//NO I18N
    },
    /** Get mata data and related function names for print preview page */
    getPrintableSectionsMeta : function(){
        const print_options = {
                "header_panel":{path : "content_panel.header_panel", // No I18N
                    "default" : true // No I18N
                },
                "assetinfo":{ path : "content_panel.tabs_panel.settings.assetinfo" // No I18N
                },
                "hardwares":{path : "content_panel.tabs_panel.settings.hardwares" // No I18N
                },
                "applications" : {path : "content_panel.tabs_panel.settings.applications"}, //No I18N
                "virtual_machines" : {path : "content_panel.tabs_panel.settings.virtual_machines"}, //No I18N
                "softwares":{path : "content_panel.tabs_panel.settings.softwares.settings.softwares" // No I18N
                },
                "servicepacks":{path : "content_panel.tabs_panel.settings.softwares.settings.servicepacks" // No I18N
                },
                "system":{path : "content_panel.tabs_panel.settings.system" // No I18N
                },
                "relationship":{path : "content_panel.tabs_panel.settings.relationship" // No I18N
                },
                "contracts":{path : "content_panel.tabs_panel.settings.contracts" // No I18N
                },
                "cost":{ path : "content_panel.tabs_panel.settings.financials.settings.cost" // No I18N
                },
                "depreciation":{path : "content_panel.tabs_panel.settings.financials.settings.depreciation" // No I18N
                },
                "attach_asset" : {path : "content_panel.tabs_panel.settings.attach_asset"}, // No I18N
                "attach_component" : {path : "content_panel.tabs_panel.settings.attach_component"}, // No I18N
                "history":{path : "content_panel.tabs_panel.settings.history.settings.history_for_print" // No I18N
                },
                "associations" : {path : "content_panel.tabs_panel.settings.associations"} // No I18N
            }
        return print_options;
    },
    //loads asset allocation cpu and memory list view under virtual memory tab under virtual host details page.
    loadAssetAllocationinVm: function() {
        const _self = this;
        const vm_servertype = _self.detComp.options.data.workstation.vm_platform && _self.detComp.options.data.workstation.vm_platform.name;
        const header = {
            "vm_name": {"default":true }, // No I18N
            "virtual_machine": {//NO I18N
                "default":true, // No I18N
                "text":"Name", // No I18N
                dataCelltransformer: function (table_info, ctrl, component) {
                    if(table_info.row_data.virtual_machine !== undefined && table_info.row_data.virtual_machine !== null) {
                        return `<a id="VMlink_${table_info.row_data.virtual_machine.id}" href="/" sdphrefJs="js-href-asset-details-1" data-id="${table_info.row_data.virtual_machine.id}" data-api-name="asset_computers" class="disp-ib truncate-ellipsis"><span rel="uitip" class="truncate-wrapper" title="${e_attr(table_info.row_data.virtual_machine.name)}">${e_html(table_info.row_data.virtual_machine.name)}</span></a>`; // No I18N;
                    }
                    return "-"; // No I18N
                }
            },
            "memory_reservation": { //NO I18N
                frommeta : true,
                dataCelltransformer: function (table_info) {
                    const memory_reservation = table_info.row_data.memory_reservation;
                    if(memory_reservation){
                        return `<span>${memory_reservation.value} ${memory_reservation.unit}</span>`;
                    }
                    return "-"; // No I18N
                }
            }
        };
        let cpuHeader, memoryHeader = null;
        if(vm_servertype  == "HyperV"){ // No I18N
            cpuHeader = {
                "ip_address": { "default":true }, // No I18N
                "cpu_reservation_percentage": { "default": true ,"width" : "250px"}, // No I18N
                "cpu_limit_percentage": { "default": true }, // No I18N
                "cpu_shares": { "default": true } // No I18N
            };

            memoryHeader = {
                "memory_shares": { "default": true ,"width" : "200px" }, // No I18N
                "memory_reservation": { "default": true, "width" : "250px" }, // No I18N
                "memory_limit": { "default": true } // No I18N
            };
        }else{
            cpuHeader = {
                "ip_address": { "default":true }, // No I18N
                "cpu_reservation": { "default": true ,"width" : "250px"}, // No I18N
                "cpu_limit": { "default": true }, // No I18N
                "cpu_shares": { "default": true }, // No I18N
                "cpu_sharelevel": { "default": true } // No I18N
            };

            memoryHeader = {
                "memory_sharelevel": { "default": true }, // No I18N
                "memory_reservation": { "default": true, "width" : "250px" }, // No I18N
                "memory_limit": { "default": true } // No I18N
            };
        }
        /**Rendering both Asset Allocation - CPU and Asset Allocation - Memory */
        _self.tableInit("virtual_machines", jQuery.extend(true, {}, header, cpuHeader), "", {tableHolder: "vm_cpu"});// No I18N
        _self.tableInit("virtual_machines", jQuery.extend(true, {}, header, memoryHeader), "", {tableHolder: "vm_memory"});// No I18N
    },
    /**Used for split tabs based on child tabs  */
    getAllowedTabs : function(){
        const _self = this;
        let default_tabsorder = [], allowedTabs = [], allowedTabsObjs = {}, printpreviewTabs = ["header_panel"]; // No I18N
        const printpreview_defaulttabs = ["header_panel", "assetinfo", "hardwares", "applications", "virtual_machines", "softwares", "servicepacks", "system", "contracts", "cost", "depreciation", "associations", "history"]; //NO I18N
            default_tabsorder = ["assetinfo","hardwares", "applications","virtual_machines", "softwares","system","relationship","contracts","financials","associations","history"]; // No I18N
            if(assetsObj.tabs){
              default_tabsorder  = assetsObj.tabs;
            }
            /**For removing relationship tab from edtail view if it execute from external frame */
            if(_self.externalframe){
                const relationIndex = default_tabsorder.indexOf("relationship");
                if(relationIndex != -1){
                    default_tabsorder.splice(relationIndex, 1);
                }
            }
        /**Get tabs from links  */
        let tabs = _self.links_data.tabs;
        if(tabs && tabs.length>0){
            for (let i = 0; i < tabs.length; i++) {
                if(tabs[i].name == "system"){
                    if(assetDetailView.baseData.os_name && (!assetDetailView.baseData.os_name.toLowerCase().includes("microsoft") && !assetDetailView.baseData.os_name.toLowerCase().includes("windows"))){
                        if(!assetDetailView.baseData.user_accounts || assetDetailView.baseData.user_accounts.length == 0){
                            continue;
                        }
                    }else if (!assetDetailView.baseData.os_name) {
                        if(!assetDetailView.baseData.user_accounts || assetDetailView.baseData.user_accounts.length == 0){
                            continue;
                        }
                    }
                }
                allowedTabsObjs[tabs[i].name] = tabs[i];
            }
            /**In allowedTabs array Push tab in default order if available in allowedTabsObjs */
            for (let i = 0; i < default_tabsorder.length; i++) {
                const defaultTabOrd = default_tabsorder[i];
                if(allowedTabsObjs[defaultTabOrd]){
                    allowedTabs.push(defaultTabOrd);
                }
            }
            for (let i = 0; i < printpreview_defaulttabs.length; i++) {
                const printPreviewTabOrd = printpreview_defaulttabs[i];
                    if((printPreviewTabOrd == "softwares" || printPreviewTabOrd == "servicepacks") && allowedTabsObjs.softwares){ //NO I18N
                        /**Render software and service packs under softwares tab */
                        printpreviewTabs.push(printPreviewTabOrd);
                    }else if((printPreviewTabOrd == "cost" || printPreviewTabOrd == "depreciation") && allowedTabsObjs.financials){ //NO I18N
                        /**Render cost and depreciation under financials tab */
                        printpreviewTabs.push(printPreviewTabOrd);
                    }else{
                        if(allowedTabsObjs[printPreviewTabOrd]){
                            printpreviewTabs.push(printPreviewTabOrd);
                        }
                    }
            }

        }
        if(_self.links_data.permissions.attach_asset){
            printpreviewTabs.push("attach_asset");
        }
        if(_self.links_data.permissions.attach_component){
            printpreviewTabs.push("attach_component");
        }
        return {allowedTabs : allowedTabs, allowedTabsObjs: allowedTabsObjs, printpreviewTabs : printpreviewTabs};
    },
    /**Call for getting purchase cost listview from initCostDetails function used in financials tab */
    getComponentCost : function(){
        let getResponse = [];
        let inputObject = {"list_info": {"search_criteria": {"field": "asset_type.name", "condition": "is", "values": ["Component"]}, "fields_required": ["name", "module", "total_cost"], "start_index": 1, "row_count": 100}}; // No I18N
        assetsObj.commonAjaxFunction(assetDetailView.module+"/" + assetDetailView.entity_id+"/child_assets",null,inputObject,function(data){
            getResponse = data.child_assets;
        })
        return getResponse;
    },
    /**Get cost data */
    getCostData : function(){
        let getResponse = [];
        let inputObject =  {"list_info": {"fields_required": ["id", "date", "amount", "cost_factor", "description"], "start_index": 1, "row_count": 100}}; // No I18N
        assetsObj.commonAjaxFunction(assetDetailView.module+"/" + assetDetailView.entity_id+"/costs",null,inputObject,function(data){
            getResponse = data.costs;
        })
        return getResponse;
    },
    /**For getting current asset id used in initActions
     * @param {*} action
     */
    getId : function (action) {
        const _self = this;
        return (action === "remote_control" || action === "assetid") ? _self.asset_id || _self.id : _self.id;// No I18N
    },
    /**Initiate actions in details page */
    initActions : function(){
        const _self = this,
              module = _self.module,
              moduleURL = module;// No I18N
        
        const options = {
            module: module,
            moduleType: _self.module_details.moduleType,
            moduleURL: encodeHTMLAttribute(moduleURL) + "/" + _self.asset_id || _self.id, //NO I18N
            containerId: "assetDetails_actions", //NO I18N
            actionBtnLinks : _self.links_data.actionBtnLinks,
            permissions : _self.links_data.permissions,
            _links : _self.links_data._links,
            getId: _self.getId,
            data : _self.data
        };
        try {
            assetActions.init(options);
        } catch (e) {
            clientErrorHandling.error(e);
        }
    },
     /**Loading contracts listview in contracts tab in detail view page 
      * @param {object} options
     */
    loadContractDetails : function(options){
        const _self = this, 
              header = {
                custom_contract_id: {
                    "default": true, // No I18N
                    "text": translate("sdp.contract.printView.conId")// No I18N
                },
                name: {
                    "default": true, // No I18N
                    dataCelltransformer: function (table_info) {
                        var id = table_info.row_data.id;
                        var name = table_info.row_data.name;

                        return '<a id="assetlink_' + id +'" rel="noopener noreferrer" href="/ContractDef.do?contractMode=viewContract&contractID='+ id +'" target="_blank" class="disp-ib truncate-ellipsis" ><span rel="uitip" class="truncate-wrapper" title="'+ e_attr(name) +'">'+ e_html(name) + '</span></a>'; // No I18N
                    }
                },
                vendor: {"default": true}, // No I18N
                from_date: {"default": true}, // No I18N
                to_date: {"default": true} // No I18N
            };
            _self.tableInit("contracts", header, null, options);// No I18N
    },
    /**Loading app details for mobile phones  
     * @param {object} options
    */
    loadApplicationDetails : function(options){
        const header = {
            name: {"default": true,"text": translate("common.application.name"), "value_path": "application.name"}, // No I18N
            app_version: {"default": true,"text": translate("asset.applications.version"), "value_path": "application.app_version"}, // No I18N
            identifier: {"default": true,"text": translate("asset.applications.identifier"), "value_path": "application.identifier"}, // No I18N
            bundle_size: {"default": true,"text": translate("asset.applications.bundle.size"), // No I18N
            dataCelltransformer: function (table_info) {
                const bundle_size = table_info.row_data.application.bundle_size;
                if(bundle_size){
                    return `<span>${bundle_size.value} ${bundle_size.unit}</span>`;
                }
            }},
            dynamic_size: {"default": true,"text": translate("mdm.detailsPage.dynamicSize"), "value_path": "dynamic_size.display_value"} // No I18N
        };
        this.tableInit("applications", header, null, options);// No I18N
    },

    costObj : {
        /**Render purchase and operational cost details in  financials tab*/
        initCostDetails : function(){
            const _self = assetDetailView;
            let costsObj = {
                    purchase_cost : [],
                    operational_cost : [],
                    disposal_cost : []
                };
                const costsArray = _self.getCostData();
                for (let i = 0; i < costsArray.length; i++) {
                    if(costsArray[i].cost_factor.name == "Purchase Cost"){// No I18N
                        costsObj.purchase_cost.push(costsArray[i]);
                    }else if(costsArray[i].cost_factor.name == "Disposal Cost"){// No I18N
                        costsObj.disposal_cost.push(costsArray[i]);
                    }else{
                        costsObj.operational_cost.push(costsArray[i]);
                    }
                }
                let component_cost = "";
                if(_self.data.asset_type.name !== "Component"){ // No I18N
                    component_cost = _self.getComponentCost();
                }
                costsObj.component_cost = component_cost || [];
                _self.costs_data = costsObj;
                /**Onclick function event for add/edit icon in cost under financial tab */
                jQuery("#financials_tab_content").on("click","#add_cost_btn,[name=cost_edit_btn]",function(e){
                    const getEditIconId = jQuery(this).attr("data-id");
                    _self.costObj.openAddCostPopup(getEditIconId,getEditIconId ? 'edit' : null);// No I18N
                });
                /**Onclick function event for delete icon in cost under financial tab */
                jQuery("#financials_tab_content").on("click","[name=cost_delete_btn]",function(e){
                    const getEditIconId = jQuery(this).attr("data-id");
                    _self.costObj.deleteCost(getEditIconId);
                });
        },
        /**Load cost list view in financials tab */
        loadCostDetails : function(){
            const _self = assetDetailView,
                getCostObj = _self.costObj;
            const costs = ["purchase_cost", "operational_cost", "disposal_cost", "component_cost"];// No I18N
            var isCostAvailable = false;
            getCostObj.isPurchaseCostAvailable = false;
            
                
                
                function getTotalCost(tableObj) {
                    return tableObj.visibleContents.reduce(function (total, data) {
                        return total + parseFloat(data.amount || data.total_cost);
                    }, 0);
                }

                for (let i = 0; i < costs.length; i++) {
                    if(_self.costs_data[costs[i]].length == 0){
                        jQ("[data-id='"+costs[i]+"_div']").hide(); // No I18N
                        continue;
                    }
                    
                    isCostAvailable = true;
                    jQ("[data-id='"+costs[i]+"_div']").show(); // No I18N
                    let header = {
                        edit :{"default": true , "type" : "icon" , "dataCelltransformer" :constructEditIcon}, // No I18N
                        delete_icon :{"default": true , "type" : "icon", "dataCelltransformer":constructDeleteIcon}, // No I18N
                        date: {"default": true}, // No I18N
                        cost_factor: {"default": true}, // No I18N
                        description: {"default": true}, // No I18N
                        amount: { "default": true, "display_type": "currency", "dataCelltransformer": function (data) {// No I18N
                            var amount = data.row_data.amount;
                            if (amount !== 0 && !amount) {
                                return "-";
                            }
    
                            //converting negative zero to zero if it is
                            return parseFloat(amount) === 0 ? "0.00" : amount;
                        }}
                    };
                    if (!_self.links_data.permissions.edit_cost || _self.printPreview || _self.externalframe){
                        delete header.edit;
                    }
                    if (!_self.links_data.permissions.delete_cost || _self.printPreview || _self.externalframe){
                        delete header.delete_icon;
                    }
                    let meta_data = header;
                    if(costs[i] == "purchase_cost"){ // No I18N
                        getCostObj.isPurchaseCostAvailable = true;
                        delete meta_data.delete_icon;
                        delete meta_data.description;
                        delete meta_data.date;
                    }
                    else if(costs[i] == "component_cost"){
                        meta_data = [{"id" : "name","text" :translate("sdp.inventory.detailAsset.componentName")}, {"id" : "module","text" :translate("sdp.header.depreciation.ComponentTypeName"),"value_path":"module.display_name"}, {"id" : "total_cost","text" :translate("sdp.inventory.detailAsset.Costs.title"), "display_type" : "currency"}] // No I18N
                    }
                    
                    const tableObj = _self.tableInit(costs[i],meta_data, _self.costs_data[costs[i]],{callbackAfterBodyRender:bindEvents});
                    const totalCost = getTotalCost(tableObj);
                    jQ('[data-id="' + costs[i] + '_total_div"]').show();// No I18N
                    jQ("#totalcostof_" + costs[i]).text(isNaN(totalCost) ? "-" : (totalCost).toFixed(2));// No I18N
                }
                if(isCostAvailable){
                    jQ("[data-id='total_cost_div']").show(); // No I18N
                }

                function constructEditIcon(tData){
                    return `<button class="btn btn-link p0" data-edit name="cost_edit_btn" data-id="${tData.row_data.id}"><span class="cspr icon-sm edit"></span></button>`;
                }
                function constructDeleteIcon(tData){
                    return `<button class="btn btn-link p0" data-delete data-id="${tData.row_data.id}"  name="cost_delete_btn"><span class="cspr icon-sm trash"></span></button>`;
                }
        },
        /** Open purchase cose popup while clicking edit icon in financials tab from details view 
         * @param {*} id
         * @param {string} mode
         * 
        */
        openAddCostPopup : function(id, mode){
            let costData = {}, costFactor = null;
            if(id){
                assetsObj.commonAjaxFunction(assetDetailView.module+"/" + assetDetailView.asset_id +"/costs/"+id,null,null,function(response){
                    costData = response.asset_sub_cost;
                    costFactor = costData.cost_factor;
                    costFactor.text = costFactor.name;
                });
            }
            costData.mode = mode;
            const costContainer = jQuery("#financials_tab_content").find("#addcost");
            costContainer.html(""); // No I18N
            renderhbs("#addcost", "asset-details-financial-costform", costData, false, "assets"); // No I18N
            costContainer.attr("title", translate(mode === "edit" ? "sdp.inventory.resources.editcost" : "sdp.inventory.resources.addcost"));
            /**Open dialog for add/edit cost in asset details page under financials tab */
            jQuery('#addcost').dialog({
                width     : 480,
                resizable : false,
                modal: true,
                close:function(){
                    jQuery('.ui-dialog #addcost').dialog('destroy');// No I18N
                    jQuery('body').removeClass('of-h');// No I18N
                    costContainer.html(""); // No I18N
                }
            });
            const parEle = jQuery('.ui-dialog #addcost');
            parEle.find("#addcost").html("");
        
            
                
                /** Check cost amount is greater than zero or not in edit popup of purchase cost */
                jQuery.validator.addMethod('isZero', function (value) {// No I18N
                    const getCostFactor = jQuery("#costFactor").select2("data");
                    const getSelCost = getCostFactor && getCostFactor.text; // No I18N
                    if(getSelCost !== "Purchase Cost"){
                        return parseFloat(value) !== 0;
                    }else{
                        return parseFloat(value) === 0 || parseFloat(value) >= 0;
                    }
                });

                const rules = {
                    costdate_IN_Display: {
                        required: true
                    },
                    costFactor: {
                        required: true
                    },
                    costamount: {
                        required: true,
                        min: 0,
                        isZero: true
                    }
                };

                const messages = {
                    costFactor: {
                        required: translate("sdp.inventory.resources.costjserror")//NO I18N
                    },
                    costdate_IN_Display: {
                        required: translate("sdp.common.reminder.nodatejserror")//NO I18N
                    },
                    costamount: {
                        required: translate("sdp.inventory.resources.amountjserror"),//NO I18N
                        min: translate("sdp.paymentdetails.addpayamount.jsErr"),//NO I18N
                        isZero: translate("sdp.inventory.resources.amountjserror2")//NO I18N
                    }
                };
                const form = parEle.find("#costform"); // No I18N
                assetActions.validateForm(form, rules, messages);
                charCounter.init();

                /**Render cost factor dropdown in edit popup of purchase cost */
                parEle.find("#costFactor").sdp_select2({
                    cache:{},
                    multiple:false,
                    placeholder: translate("form.select.placeholder",[translate("sdp.inventory.detailAsset.CostFactor")]), // No I18N
                    allowClear: true,
                    url:[{
                      url:"/api/v3/"+encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.id+"/costs/cost_factor",//NO I18N
                      field:'cost_factor'//NO I18N
                    }]
                  });
                  /** Cost factor select2 related code so moved here */
                  parEle.find("#costFactor").change(function (e) {
                      jQuery(this).valid();
                      var getSelVal = jQuery(this).select2("data").text; // No I18N
                      if(getSelVal=="Purchase Cost"){
                         parEle.find("#dateField").hide().end().find("#descriptionField").hide();
                         jQuery(this).select2("enable", false); // No I18N
                      }else{
                        parEle.find("#dateField").show().end().find("#descriptionField").show();
                      }
                  }).select2("data", costFactor);// No I18N
                  (mode=="edit") && parEle.find("#costFactor").trigger("change"); // No I18N
            
        },
        /** Used in WS_financials.jspf need to check 
         * @param {*} id
         * @param {*} amount
         * 
        */
        addCost : function(id,amount){
            const _self = this;
            const parEle = jQuery('.ui-dialog #addcost');
            const getSelCostValue = parEle.find("#costFactor").select2("data"); // No I18N
            const isValid = jQuery('.ui-dialog #costform').valid();
            let saveButton = _self.loadingtextfn();

            let saveBtnFun = (saveButton) => {
                let getSaveBtn = saveButton;
                if(!isValid){
                    getSaveBtn && getSaveBtn.button('reset'); //NO I18N
                    return false;
                }
                if(getSelCostValue.text == "Disposal Cost" && assetDetailView.data.state.name !== "Disposed"){ // No I18N
                    const confirmAdd = confirm(translate("sdp.inventory.resources.confirmtodisposal")); // No I18N
                    if(!confirmAdd){
                        getSaveBtn && getSaveBtn.button('reset'); //NO I18N
                        return false;
                    }
                }
                let inputObject = {}, putUrl = encodeHTMLAttribute(assetDetailView.module)+"/" + assetDetailView.asset_id;
                let method = "POST";// No I18N
                if(id){
                    id = "/"+id;
                    method = "PUT";// No I18N
                }else{
                    id = "";
                }
                if(getSelCostValue.text == "Purchase Cost"){
                    inputObject[assetDetailView.entity_name] = {purchase_cost : parEle.find("#costamount").val()};// No I18N
                    method = "PUT";// No I18N
                }else{
                    inputObject.asset_sub_cost = {"date" : {"value" : parEle.find("#costdate_IN").val()}, cost_factor : {"id" : parEle.find("#costFactor").val()},"amount" : parEle.find("#costamount").val(),description:parEle.find("#costAmountdesc").val()};// No I18N
                    putUrl += "/costs"+id;// No I18N
                }
                const dataval = sdpAjaxInputData(inputObject);
                sdpAjax({
                    url: "/api/v3/"+putUrl, //NO I18N
                    data : dataval,
                    method : method,
                    success: function() {
                        _self.getCostDetails();
                        jQuery( ".ui-dialog #addcost" ).dialog( "destroy" );// No I18N
                        jQuery("body").removeClass("of-h"); // No I18N
                        const successMsg = id ? translate("sdp.admin.setup.productyype.updatemsg") : translate("sdp.admin.setup.productyype.addedmsg");
                        showalert("success", successMsg, "isAutoHide=true");//NO I18N
                    },
                    complete: function() {
                        getSaveBtn && getSaveBtn.button('reset'); //NO I18N
                    },
                    async:false
                });
            };
            saveBtnFun(saveButton);
        },
            /**Display loading text in button */
        loadingtextfn : function() {
            const self = this;
            let btn = jQuery("#add_cost_save").button('loading');
            return btn;
        },
        /**get cost details for cost tab under financials tab in asset details page  */
        getCostDetails : function(){
            const assetDetObj = assetDetailView;
            assetsObj.commonAjaxFunction(assetDetObj.module+"/" + assetDetObj.entity_id,null,null,function(response){
                assetDetObj.data = jQuery.extend(true, assetDetObj.data, response[assetDetObj.entity_name]);
                assetDetObj.detComp.options.data.workstation = jQuery.extend(true, assetDetObj.detComp.options.data.workstation, response[assetDetObj.entity_name]);
                assetDetObj.gotoActiveTab("", "", {"active":  "financials"});// No I18N
            });
        },
        /**Delete cost in cost listview under financials tab 
         * @param {*} id
         * 
        */
        deleteCost : function(id){
            const _self = assetDetailView.costObj,
                  confirmDelete = confirm(translate("sdp.inventory.detailAsset.confirmdelete"));
            if(!confirmDelete){
                return;
            }
            sdpAjax({
                url : "/api/v3/"+encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.asset_id+"/costs?ids="+id, // No I18N
                method : "DELETE", // No I18N
                success : function(){
                    _self.getCostDetails();
                    showalert("success", translate("sdp.admin.backup.file.delete.success.msg"), "isAutoHide=true");//NO I18N
                }
            });
        },
        /** Render Depreciation details tab near cost tab under financial tab in details view */
        initDepreciationList : function(){
            const _self = assetDetailView.costObj;
            jQuery('#toggle_depre_duration').toggleSlider({slider:false,activeClass:'btn-info'});// No I18N
            /** Click function for rendering monthly and yearly view of depreciation listview */
            jQuery('[data-periodtype]').on("click", function(){
                _self.currentMonthId = "";// No I18N
                _self.loadDepreciationList(jQuery(this).attr('data-periodtype'));
            });
            /** Initial render of yearly listview as default */
            jQuery('[data-periodtype="yearly"]').trigger("click");// No I18N
        },
        /** Render depreciation listview using table Component 
         * @param {*} type
         */
        loadDepreciationList : function(type){
            if(!type){
                type = "yearly";// No I18N
            }
            const _self = assetDetailView.costObj;
            let table_content = {},
                tableInfo = { "list_info": { "row_count": 25 },// No I18N
                "fields_required":{// No I18N
                    "year":{},// No I18N
                    "depreciation_value":{},// No I18N
                    "total_depreciation":{},// No I18N
                    "book_value":{},// No I18N
                    "remaining_life":{}// No I18N
                } },
                tableInfoData = getPersonalizeData("financial_dep_type");// No I18N
            if (!jQuery.isEmptyObject(tableInfoData)) {
                tableInfo.list_info.row_count = tableInfoData.list_info.row_count;
            }

            if(type == "yearly"){
                tableInfo.list_info.filter_by = {"name":"annual_depreciation"};// No I18N
            }
            const entityURL = encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.asset_id+"/depreciation_values"; // No I18N
            const options = {
                personalize_key             : "financial_dep_type",// No I18N
                callbackURL                 : entityURL,
                metainfo_entity             : entityURL,
                entity_name                 : "depreciation_values", // No I18N
                paginationEnabled           : true,
                getmetaInfo                 : true,
                row_inputdata               : jQuery.extend({},tableInfo),
                discard_without_displayname : true,
                callbackAfterBodyRender     : _self.CBDepricatedList,
                default_sort_field : {"sort_field" : "id", "sort_order" : "asc"} // No I18N
            };
            table_content.header = _self.depreciationHeaderData(type);
            var _tableObject = new tableComponent(tableInfo, table_content, options, _self);
        },
        /** Constructing depreciation listview header for table Component 
         * @param {*} type
         */
        depreciationHeaderData : function(type){
            let meta_data = {
                year : {"default":true}, // No I18N
                depreciation_value : {"default":true, display_type : "currency"}, // No I18N
                total_depreciation : {"default":true, width: "250px", display_type : "currency"}, // No I18N
                book_value : {"default":true, display_type : "currency"}, // No I18N
                remaining_life : {"default":true} // No I18N
            };
            if(type == "monthly"){
                meta_data.year.text = translate("sdp.depreciation.year");// No I18N
                meta_data.year.dataCelltransformer = function(tData, _self){
                    if(tData.row_data.is_current_month){
                        _self.currentMonthId = tData.row_data.id;
                    }
                    return e_html(tData.row_data.month.display_value) +", "+e_html(tData.row_data.year);
                }
            }else{
                meta_data.year.dataCelltransformer = function(tData, _self){
                    if(tData.row_data.is_current_month){
                        _self.currentMonthId = tData.row_data.id;
                    }
                    return e_html(tData.row_data.year);
                }
            }
            return meta_data;
        },
        /** Call back function for highlight current month row in depreciation listview 
         * @param {object} _self
        */
        CBDepricatedList : function(arg, _self){
            if(_self.currentMonthId){
               jQ('#depreciation_values_body').find("tr[data-entityid='"+_self.currentMonthId+"']").addClass("modify-row");
           }
        }
    },
    /** Render attached assets popover While hovering attachments in right side of details page  */
    renderAttachmentPopover : function () {
        const attachments = assetDetailView.data.attachments,
            pareEle = jQuery("#content-right-panel-workstation");
        if (attachments.length > 0) {
            pareEle.find("#right-attachment").show().end()
                   .find("#asset_right_attachment").removeClass("got-data").end() //NO I18N
                   .find("#attachments_rightpanel_count").text(attachments.length); //NO I18N
            /**Only append element if attachments is greater than zero so move code here */
            const attachementsHTML = attachments.map(function (attachment, index) {
                return `<button type="button" data-href="${e_attr(attachment.content_url)}" data-index="${index}" data-attach-size="${attachment.size.display_value}">${e_html(attachment.name)}</button>`;//No I18N
            });
    
            jQuery(jQuery("#asset_right_attachment").data("target-id")).html(attachementsHTML);
        }else{
            pareEle.find("#right-attachment").hide();
        }
    },
    /** For loading current asset attachments in right section of detail view page */
    loadAttachments : function(){
        const _self = this;
        _self.renderAttachmentPopover();
        _self.initAttachments();
    },
    /** Initiate attachments (append attachment section in right section) popup in asset details view page*/
    initAttachments : function () {
        const attachComp = new attachPreview(jQuery("#asset_right_attachment"), {
            "url": "/api/v3/asset_assets/" + assetDetailView.asset_id +"/attachments", // No I18N
            "entity" : "asset_assets", // No I18N
            "entity_id": assetDetailView.asset_id, // No I18N
            api: false,
            layouts: false,
            is_odapi : true,
            "enable_delete" : false, //No I18N
            "popover": { // No I18N
                enable: true,
                target: jQuery("#asset_right_attachment").data("targetId") // No I18N
            }
        });
    },
    /**Render attached assets and attached components listview inside print preview window popup */
    associationObj : {
        loadAssociatedAsset : function(){
            assetListView.initListView("asset_attachments", assetDetailView.moduleType, "print"); // No I18N
        },
        loadAssociatedComponent : function(){
            assetListView.initListView("component_attachments", assetDetailView.moduleType, "print"); // No I18N
        }
    },
    /**Used to iniatiate table Component in common function for all listview under all tabs */
    tableInit : function(entity, header, data, options){
        let table_content = {};
            table_content.header = header;
        let tableInfo = {"list_info" : {"start_index" :1}}; // No I18N
        let metainfo_entity = undefined, getmetaInfo = true, callbackAfterBodyRender= undefined;

        if (entity === "virtual_machines") {// No I18N
            metainfo_entity = encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.entity_id+"/virtual_machines";// No I18N
            tableInfo.fields_required = Object.keys(header);
            callbackAfterBodyRender = function(){
                jQuery("#content-details-inner-workstation").find('[sdphrefJs="js-href-asset-details-1"]').off('click').on('click',function(event){// No I18N
                    const getId = jQuery(this).attr("data-id"),
                          getApiName = jQuery(this).attr("data-api-name");
                    assetsObj.loadAssetDetailPopup(getId, getApiName);
                });
            }
        } else if(entity.indexOf("cost") != -1){
            if(entity == "component_cost"){
                getmetaInfo = false;
            }else{
                metainfo_entity = encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.entity_id+"/costs";// No I18N
            }
            callbackAfterBodyRender = options.callbackAfterBodyRender;
        }else{
            metainfo_entity = encodeHTMLAttribute(assetDetailView.module)+"/"+assetDetailView.entity_id+"/"+entity;// No I18N
        }
        const metaData = options && options.metainfo && options.metainfo[entity] ? options.metainfo[entity].fields : null;
        let getOptions = {
            entity_name : entity,
            getmetaInfo : getmetaInfo,
            metainfo_entity : metainfo_entity,
            tableHolder: options && options.tableHolder || entity,
            height : 400,
            callbackAfterBodyRender : callbackAfterBodyRender,
            callbackDataGet : function(data, that, component){
                let entData = {};
                if(component.t_obj.options.entity_name.indexOf("cost") !=-1){
                    entData[component.t_obj.options.entity_name] = assetDetailView.costs_data[component.t_obj.options.entity_name] || [];
                }else{
                    entData[component.t_obj.options.entity_name] = assetDetailView.data[component.t_obj.options.entity_name] || [];
                }
                return entData;
            }
        };

        if(metaData) {
            getOptions.meta_data = metaData;
            getOptions.metainfo_entity = undefined;
        }

        if (entity === "virtual_machines" || entity === "contracts" || entity === "applications") {
            entity === "contracts" && (tableInfo.list_info.row_count = 100);//No I18N
            getOptions.callbackURL = metainfo_entity;
            getOptions.row_inputdata = jQuery.extend({}, tableInfo);
            entity !== "contracts" && (getOptions.paginationEnabled = true);//No I18N
            delete getOptions.callbackDataGet;
        }
        var _tableComp = new tableComponent(tableInfo, table_content, getOptions);
        return _tableComp;
    },
    /**For displaying reminder count of Ipaddress (+2 More) in header panel in details page */
    getRemaingIpCount : function() {
        if(assetDetailView.data.ip_addresses){
            const ipAddresses = assetDetailView.data.ip_addresses.split(",");
            if(assetDetailView.data.primary_ip != null && ipAddresses.indexOf(assetDetailView.data.primary_ip)==-1){
                return assetDetailView.data.ip_addresses.split(",").length;
            } else {
                return assetDetailView.data.ip_addresses.split(",").length - 1;
            }
        }
        return 0;
    },
    /**REnder popup for all Ip address while clicking  (+2 More)*/
    showMoreIpAddress : function() {
        const data = assetDetailView.data;
        assetsObj.openIPAddressPopup(data.ip_addresses, data.name);
    },
    /**Calling modifyState function availed in assetACtions.js */
    modifyState : function () {
        assetActions.modifyState(assetDetailView.data);
    },
    /**For relationship chart rerender While attached assets/components using actions meanwhile also reflected in relationship chart  */
    refreshRelationshipTab : function() {
        jQuery('#details-tabs-workstation [data-detail-tab="relationship"]').trigger('click');
    },
    associationTab : {
        selectedFilter: {},
        /**Association Tab code */
        viewAssociation: function(tab_name){
            this.associationTab.initAssociationList();
            assetsObj.pushingStateURL("detail", assetDetailView.module , "", this.options.id, tab_name); // No I18N
        
        },
        getRowInputData: function (table_info) {
            if (!table_info) {
                return {
                    list_info: {
                        row_count: "10",
                        start_index: "1"
                    },
                    fields_required: ["name"] // No I18N
                }
            }
            const inputObject = {
                fields_required: Object.keys(table_info.fields_required),
                list_info: table_info.list_info
            };
            return inputObject;
        },
        getTableDataForAssociation: function (personalize_key) {
            const self = this;
            let columnOrder;
            let associatedModulename = personalize_key.substring(0,personalize_key.indexOf('_assets_list'));
            let tableData = getPersonalizeData(personalize_key);
            let getAssetName = "assets";//NO I18N
            switch(personalize_key) {
                case "requests_assets_list": //NO I18N
                    columnOrder = ["id","subject","requester","status","created_time","technician","due_by_time","site","group","service_category","template"]; //NO I18N
                    break;
                case "problems_assets_list": //NO I18N
                    getAssetName = "associated_asset";//NO I18N
                    columnOrder = ["id", "title", "reported_by", "technician", "category", "priority", "status", "urgency"]; //NO I18N
                    break;
                case "changes_assets_list":  //NO I18N
                    columnOrder = ["id", "title", "change_type", "change_owner", "category", "priority", "status", "stage"]; //NO I18N
                    break;
                case "releases_assets_list": //NO I18N
                    columnOrder = ["id", "title", "release_type", "stage","status","priority","release_engineer", "scheduled_start_time","scheduled_end_time"]; //NO I18N
                    break;
            }
            if (!jQuery.isEmptyObject(tableData)){
                let filterId = tableData.list_info.filter_by && tableData.list_info.filter_by.id;
                this.selectedFilter[associatedModulename] = filterId;
                tableData.list_info.search_criteria = {
                    "field":getAssetName,//No I18N
                    "value":assetDetailView.asset_id,//No I18N
                    "condition":"is"//No I18N
                };
                return tableData;
            }
            /**Skip fields from columns order if it is not availed in metainfo */
            const getMetaInfo = this.metainfo;
            columnOrder.forEach(function(key,index){
                if(!getMetaInfo.hasOwnProperty(key)){
                    columnOrder.splice(index,1)
                }
            });
            /**End */
            let fields_required = {};
            columnOrder && columnOrder.forEach(function (field) {
                fields_required[field] = {};
            });
            const inputObject = {
                fields_required: fields_required,
                column_order: columnOrder,
                list_info: {
                    "sort_field": "name",   //No I18N
                    "sort_order": "asc",    //No I18N
                    "row_count": "25",  //No I18N
                    "search_criteria":{//No I18N
                        "field":getAssetName,//No I18N
                        "value":assetDetailView.asset_id,//No I18N
                        "condition":"is"//No I18N
                    }
                }
            };
            if(typeof filterId!=="undefined" && filterId){
                inputObject.list_info.filter_by = {          
                    "id": filterId      //No I18N
                }
            }
            return inputObject;
        },
        setHeight : function(){
            const getHeight = function () {
                function getHeightOf(ids) {
                    return ids.reduce(function (totalHeight, id) {
                        return totalHeight + (jQuery("#" + id).outerHeight() || 0)
                    }, 0);
                }
                return jQuery(window).height() - (120 + getHeightOf(["top-subheader", "topheader-fixed", "sdp-chat-bar", "securityrisk","content-actions-panel-holder-workstation","header-panel-workstation","tabs-panel-workstation"])); // No I18N
            };
            return getHeight();
        },
        getWidth: function(){
            return jQuery("[name=association_toggle]").width();
        },
        initAssociationList:function(){
            var _self = this;
            
            jQuery("[name=association_toggle").each(function (index, el) {
                let parent = jQuery(el).parent();
                parent.off('click.association_toggle').on("click.association_toggle", function () {//NO I18N
                    _self.renderAssociationListView(jQuery(el).data("module"),jQuery(el).data("api_plural_name"));  //NO I18N
                }); 
            });
            
            
        },
        /**Association filter list */
        filterAssociationList : function(id,module,getText,evt){
            const currentSelEle = jQuery(evt.target);
            let tObj = WebComponents.getInstance("webc-assets-"+module+"-list");    //NO I18N
            tObj.t_obj.table_info.list_info.filter_by = {"id":id}; //NO I18N
            tObj.refreshTable();
            jQuery("#"+module+"-filter-option").find("li").removeClass("active");
            currentSelEle.parent("li").addClass("active");//NO I18N
            jQuery("#"+module+"-filter").html(e_html(currentSelEle.html()));
        },
        /**
         * render list view
         * @param {*} api_name
         * @param {*} api_plural_name
         * @returns
         */
        renderAssociationListView : function(api_name,api_plural_name,tab_name){
            const assetDetObj = assetDetailView, _self = this;
            if (jQuery("#webc-assets-"+api_name+"-list").length) {
                return;
            }
            const data = {
                api_name : api_name,
                api_plural_name : api_plural_name
            };
            _self.getMetainfoAndRenderList(api_plural_name,function(){
                renderhbs("#assets-"+api_name+"-listview-container", "assets-association-listview-template", data, false, "assets", undefined, false); //No I18N
                WebComponents.instancePool["webc-assets-"+api_name+"-list"] = undefined; //remove reference to re render list. // No I18N
                WebComponents.render("webc-assets-"+api_name+"-list");
                WebComponents.getInstance("webc-assets-"+api_name+"-list"); // No I18N
                const getInputData = {"list_info":{"get_total_count":true,"search_criteria":{"field": ((api_name=="problems") ? "associated_asset" : "assets"),"value":assetDetailView.options.id,"condition":"is"}}}//NO I18N
                const getCount = assetsObj.commonAjaxFunction(api_name,false,getInputData).list_info.total_count;
                    const inputData = {
                        "requests":{"module":"request","list_info":{"search_criteria":{"field":"name","values":["All_Requests","All_Completed","All_Pending"],"condition":"is","logical_operator":"AND"}}},//No I18N
                        "releases":{"module":"release","list_info":{"search_criteria":{"field":"name","values":["all_releases","open_releases","closed_releases"],"condition":"is","logical_operator":"AND"}}},//No I18N
                        "problems":{"module":"problem","list_info":{"search_criteria":{"field":"name","values":["all_problems","open_problems","closed_problems"],"condition":"is","logical_operator":"AND"}}},//No I18N
                        "changes":{"module":"change","list_info":{"search_criteria":{"field":"name","values":["all_changes","open_changes","closed_changes"],"condition":"is","logical_operator":"AND"}}}//No I18N
                    }
                    let selectedFilter = _self.selectedFilter[api_name];
                    assetsObj.commonAjaxFunction("list_view_filters",null,inputData[api_name],function(response){
                    if(response.hasOwnProperty("list_view_filters") && response.list_view_filters && response.list_view_filters.length>0){
                        jQuery.each(response.list_view_filters, function(index, val) {
                            let activeClass = "";
                            if(val.module=="problem" && selectedFilter == undefined && index == 0){
                                jQuery('#'+api_name+'-filter').text(val.display_name);
                                activeClass = "active";//NO I18N
                            }else if (val.module!="problem" && selectedFilter == undefined && index == 1) {// No I18N
                                jQuery('#'+api_name+'-filter').text(val.display_name);
                                activeClass = "active";//NO I18N
                            }
                            if (selectedFilter == val.id) {
                                jQuery('#'+api_name+'-filter').text(val.display_name);
                            }
                            jQuery(`#${api_name}-filter-option`).append('<li class='+activeClass+'><a name="filter-menu"  href="/" data-filterid="'+val.id+'" data-apiname="'+api_name+'" data-displayname="'+e_html(val.name)+'">'+e_html(val.display_name)+'</a></li>');
                        });
                    }
                    jQuery('[name="'+api_name+'_count"]').html(getCount);
                    assetDetObj.additonal_data[api_name].count = getCount;
                    if(getCount>0){
                        jQuery("#association-info").find('[name="'+api_name+'_count"]').removeClass("disableDiv");
                    }else{
                        jQuery("#association-info").find('[name="'+api_name+'_count"]').addClass("disableDiv");
                    }
                    /**Trigger open release/request/change/problem for associations */
                    setTimeout(function(){
                        jQuery(`#${api_name}-filter-option`).find(".active").find("a").trigger("click");
                    },10);
                    /**End */
                },"list_view_filters",true);// No I18N
                
            });
        },
        /**
         * Get metainfo for requests/releases/changes/problems based on selected toggle
         * @param {String} module 
         * @param {Function} callback 
         */
        getMetainfoAndRenderList : function(module,callback){
            const _self = this;
            let neededFields = [];
            switch(module) {
                case 'requests':// No I18N
                    neededFields = ["id", "subject", "requester", "status", "created_time","created_by"];   //NO I18N
                    break;
                case 'releases':// No I18N
                    neededFields = ["closure_code","emergency","release_engineer","id","group","created_time","item","impact","release_type","priority","scheduled_end_time","subcategory","scheduled_start_time","status","template","title","urgency","release_manager","site","stage","risk","category"];// No I18N
                    break;
                case 'problems':// No I18N
                    neededFields = ["title","urgency","reported_by","technician","id","group","item","impact","closed_time","priority","site","reported_time","category","subcategory","status"];   //NO I18N
                    break;
                case 'changes':// No I18N
                    neededFields = ["closure_code","emergency","change_type","change_owner","id","group","created_time","item","workflow","approval_status","impact","priority","subcategory","status","problems","title","urgency","site","stage","completed_time","risk","category"];  //NO I18N
                    break;
                default:
                    neededFields = [];
            }
            sdpAjax({
                url : "/api/v3/"+encodeHTMLAttribute(module)+"/_metainfo", //NO I18N
                data: (module=="requests") ? sdpAjaxInputData({"for":"request_list_view"}) : sdpAjaxInputData({"for":"default_column_chooser"}),// No I18N
                success : function(response){
                    let skipFields = [];
                    if (module != 'requests'){
                        skipFields = ["configuration_items"]; //NO I18N
                    }
                    const meta_info = response.metainfo;
                    let fields = meta_info.fields;
                    for (let key in fields) {
                        if (!neededFields.includes(key) &&  fields[key].type != "udf") {
                            delete fields[key];
                        }
                    }
                    _self.metainfo = fields;
                    _self.associateMetaInfo = response.metainfo;
                    _self.discarded_fields = skipFields;
                    callback();
                }
            });
        },
        getMetaModuleFields : function(){
            return this.associateMetaInfo;
        },
        /**
         * construct columns for request list view
         * @returns
         */
        headerDataConstructForRequest: function () {
            const lookupFields = ["requester", "status", "created_by"]; //NO I18N
            let metaData = {
                "subject" : {dataCelltransformer:"assetDetailView.associationTab.constructRequestNameColumn"} //NO I18N
            };
            lookupFields.forEach(function (field) {
                metaData[field] = {
                    value_path: field + ".name" //No I18N
                };
            });
            return metaData;
        },
        /**
         * construct columns for problem list view
         * @returns
         */
        headerDataConstructForProblem: function () {
            const lookupFields = ["reported_by", "technician", "category", "priority", "status", "urgency"];  //NO I18N
            let metaData = {
                "title": { dataCelltransformer :"assetDetailView.associationTab.constructProblemNameColumn" } //NO I18N
            };
            lookupFields.forEach(function (field) {
                metaData[field] = {
                    value_path: field + ".name" //No I18N
                };
            });
            return metaData;
        },
        /**
         * construct columns for change list view
         * @returns
         */
        headerDataConstructForChange: function () {
            const lookupFields = ["change_type", "change_owner", "category", "priority", "status", "stage"];  //NO I18N
            let metaData = {
                "title": { dataCelltransformer :"assetDetailView.associationTab.constructChangeNameColumn" } //NO I18N
            };
            lookupFields.forEach(function (field) {
                metaData[field] = {
                    value_path: field + ".name" //No I18N
                };
            });
            return metaData;
        },
        /**
         * construct columns for release list view
         * @returns
         */
        headerDataConstructForRelease: function () {
            const lookupFields = ["release_type", "release_engineer", "priority", "status", "stage"]; //NO I18N
            let metaData = {
                "title": { dataCelltransformer :"assetDetailView.associationTab.constructReleaseNameColumn" } //NO I18N
            };
            lookupFields.forEach(function (field) {
                metaData[field] = {
                    value_path: field + ".name" //No I18N
                };
            });
            return metaData;
        },
        /**
         * For change name link switch to change module listview
         * @param {*} data 
         * @returns 
         */
        constructChangeNameColumn : function(data){
            return `<a target="_blank" rel="noopener noreferrer" href="/ui/changes?entity_id=${data.row_data.id}&mode=detail#Submission/details">${e_html(data.row_data.title)}</a>`;
         },
         /**
         * For request name link switch to request module listview
         * @param {*} data 
         * @returns 
         */
         constructRequestNameColumn : function(data){
            return `<a target="_blank" rel="noopener noreferrer" href="/WorkOrder.do?woMode=viewWO&woID=${data.row_data.id}">${e_html(data.row_data.subject)}</a>`;
         },
         /**
         * For problem name link switch to problem module listview
         * @param {*} data 
         * @returns 
         */
         constructProblemNameColumn : function(data){
            return `<a target="_blank" rel="noopener noreferrer" href="/ui/problems?mode=detail&entity_id=${data.row_data.id}#details">${e_html(data.row_data.title)}</a>`;
         },
         /**
         * For release name link switch to release module listview
         * @param {*} data 
         * @returns 
         */
         constructReleaseNameColumn : function(data){
            return `<a target="_blank" rel="noopener noreferrer" href="/ui/releases?entity_id=${data.row_data.id}&mode=detail#submission/details">${e_html(data.row_data.title)}</a>`;
         },
         /**get additional fields options in column chooser
         * @param {*} module
         * @param {*} neededFields
         * @param {*} skipFields
         */
        getOtherOptions : function(){
            return {
                meta_data: this.otherModuleFields,
                discarded_fields: this.discarded_fields
            }
        },
        callbackAfterBodyRender:function(){
            jQuery(".tablelist").css("max-height","400px");//No I18N
            jQuery("#content-details-inner-workstation").find('[name="filter-menu"]').off('click.filterAssociation').on('click.filterAssociation',function(event){//No I18N
                const getFilterId = jQuery(this).attr("data-filterid"),
                      getApiName = jQuery(this).attr("data-apiname"),
                      getDisplayName = jQuery(this).attr("data-displayname");
                assetDetailView.associationTab.filterAssociationList(getFilterId,getApiName,getDisplayName,event);
            });
        },
        /**
         * Get metainfo
         * @param {object} module 
         * @returns 
         */
        getModuleMetainfo : function(module){
            let metainfo = {};
            sdpAjax({
                async: false,
                url: "/api/v3/" + encodeHTMLAttribute(module) + "/_metainfo", //NO I18N
                success: function (response) {
                    metainfo = response.metainfo;
                }
            });
            return metainfo;
        },
        /**
         * Execute function to give additional options for associations
         * @param {object} table_info 
         * @returns 
         */
        otherOptions: function(table_info){
            let additionalOptions = {};
            switch(table_info.entity_name){
                case "requests":
                    additionalOptions = this.getOtherOptions();  //NO I18N
                case "releases":
                    additionalOptions = this.getOtherOptions();  //NO I18N
                case "problems":
                    additionalOptions = this.getOtherOptions();  //NO I18N
                case "changes":
                    additionalOptions = this.getOtherOptions();   //NO I18N
            }
            additionalOptions.callbackAfterBodyRender = assetDetailView.associationTab.callbackAfterBodyRender;
            additionalOptions.callbackSearchFunction = assetDetailView.associationTab.searchCallBack;
            return additionalOptions;
        },
        /**
         * Callback function for search in assocaitions tab toggles listview
         * @param {string} tabSearch 
         * @param {undefined} empty 
         * @param {object} table_info 
         */
        searchCallBack:function(tabSearch,empty,table_info){
            const tablecomp = WebComponents.getInstance("webc-assets-"+table_info.tableId+"-list"); // No I18N
            const getSearchCriteria = tablecomp && tablecomp.t_obj && Object.keys(tablecomp.t_obj).length>0 && tablecomp.t_obj.table_info.list_info.search_criteria;
            let criteriaArray = [{//No I18N
                "field":((tablecomp.tableId=="problems") ? "associated_asset" : "assets"),//No I18N
                "value":assetDetailView.asset_id,//No I18N
                "condition":"is",//No I18N
                "logical_operator":"AND"
            }];
            if(getSearchCriteria){
                criteriaArray.push(getSearchCriteria);
                tablecomp.t_obj.table_info.list_info.search_criteria = criteriaArray;
            }else{
                tablecomp.t_obj.table_info.list_info.search_criteria = criteriaArray;
            }
            tablecomp.refreshTable("search"); // No I18N
        }
        /**Association tab code ended */
    },
    /**Processing history data before template rendering elements it used in  ViewHistory.js
     * @param {object} options
     * @param {object} data
     * 
    */
    processHistory : function(options,data){
        const _self = this;
        $historyvar.meta_data[options.entity] = assetsObj.assetModTemplateData.metaDataWithId[_self.id].metainfo;
        if(data.state_history){
            data.history = data.state_history;
        }
        else if(options.module_value=="asset_history"){// No I18N
            for(let i =0; i<data.history.length;i++){
                if(data.history[i].operation==="modify_type"){
                    data.history[i].display_operation_name = translate("sdp.asset.ws.modifytype");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }else if (data.history[i].operation==="copy"){
                    data.history[i].display_operation_name = translate("sdp.common.copy");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }else if (data.history[i].operation==="assign_to_department"){
                    data.history[i].display_operation_name = translate("sdp.requests.history.updated");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }
            }
        }else if(options.module_value=="scan_history"){//No I18N
            for(let i =0; i<data.history.length;i++){
                const diffLength = data.history[i].diff.length;
                if(data.history[i].asset_operation_status){
                    if(diffLength==0){
                        data.history[i].diff.splice(0,0,{current_value:`<span>${translate("sdp.inventory.wsLastScan.scanStatus")}: </span><span class="sb">${data.history[i].asset_operation_status.display_name} (${translate("sdp.inventory.audit.nochanges")})</span>`});//No I18N
                    }
                    else{
                        data.history[i].diff.splice(0,0,{current_value:`<span>${translate("sdp.inventory.wsLastScan.scanStatus")}: </span><span class="sb">${data.history[i].asset_operation_status.display_name} (${diffLength} ${translate("common.changes")})</span>`});//No I18N
                    }
                }
            }
        }
        else if(options.module_value=="print_history"){// No I18N
            for(let i=0;i<data.history.length;i++){
                if(data.history[i].asset_operation_source && data.history[i].asset_operation_source.name=="SCAN" && data.history[i].asset_operation_status){
                    const diffLength = data.history[i].diff.length;
                    if(diffLength==0){
                        data.history[i].diff.splice(0,0,{current_value:`<span>${translate("sdp.inventory.wsLastScan.scanStatus")}: </span><span class="sb">${data.history[i].asset_operation_status.display_name} ( ${translate("sdp.inventory.audit.nochanges")} )</span>`});//No I18N
                    }
                    else{
                        data.history[i].diff.splice(0,0,{current_value:`<span>${translate("sdp.inventory.wsLastScan.scanStatus")}: </span><span class="sb">${data.history[i].asset_operation_status.display_name} (${diffLength} ${translate("common.changes")})</span>`});//No I18N
                    }
                }
                if(data.history[i].operation==="modify_type"){
                    data.history[i].display_operation_name = translate("sdp.asset.ws.modifytype");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }else if (data.history[i].operation==="copy"){
                    data.history[i].display_operation_name = translate("sdp.common.copy");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }else if (data.history[i].operation==="assign_to_department"){
                    data.history[i].display_operation_name = translate("sdp.requests.history.updated");
                    data.history[i].className = "sdp-glyph sdp-glyph-edit2";//No I18N
                }
            }
        }
        else if(data.remote_session_history){
            data.history = data.remote_session_history;
        }
        if (options.module_value=="asset_history" || options.module_value=="scan_history" || options.module_value=="print_history") {
            for(let i =0; i<data.history.length;i++){
                if(data.history[i].asset_operation_data_source_info && data.history[i].asset_operation_trigger){
                    if(data.history[i].asset_operation_data_source_info.is_delta){
                        data.history[i].diff.push({current_value:`<span>${translate("asset.history.performed.delta.desc", [e_html(data.history[i].asset_operation_trigger.display_name), data.history[i].asset_operation_data_source_info.middleware.display_name])}</span>`});//No I18N
                    }else{
                        data.history[i].diff.push({current_value:`<span>${translate("asset.history.performed.desc", [e_html(data.history[i].asset_operation_trigger.display_name), data.history[i].asset_operation_data_source_info.middleware.display_name])}</span>`});//No I18N
                    }
                } else if(data.history[i].asset_operation_data_source_info){
                    if(data.history[i].asset_operation_data_source_info.is_delta){
                        data.history[i].diff.push({current_value:`<span>${translate("asset.history.performed.using.delta", [e_html(data.history[i].asset_operation_data_source_info.middleware.display_name)])}</span>`});//No I18N
                    }else{
                        data.history[i].diff.push({current_value:`<span>${translate("asset.history.performed.using", [e_html(data.history[i].asset_operation_data_source_info.middleware.display_name)])}</span>`});//No I18N
                    }
                } else if(data.history[i].asset_operation_trigger){
                    data.history[i].diff.push({current_value:`<span>${translate("asset.history.performed.through", [e_html(data.history[i].asset_operation_trigger.display_name)])}</span>`});//No I18N
                }
            }
        }
        $history.processHistory(data.history, false);
    },
    // Used after scan to refresh asset details page
    refresh : function () {
        if(!window.assetRoute) {
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-route.js"] : ["/scripts/asset_module_min.js"], // No I18N
               success: function() {
                assetRoute.renderDetails(assetDetailView.data.id, "", assetDetailView.data.module.api_plural_name);
               }
            });
        }else{
            assetRoute.renderDetails(assetDetailView.data.id, "", assetDetailView.data.module.api_plural_name);
        }
    }
    /**End */
};
Handlebars.registerHelper("getLableName", function(field_name) {   // No I18N
    const fieldObj = table_comp.getFieldsRequiredByString(assetDetailView.meta_info.fields, field_name);
    return fieldObj.display_name;
});
Handlebars.registerHelper("getFieldData", function(field_name) {   // No I18N
    const fieldObj = table_comp.getFieldsRequiredByString(assetDetailView.data, field_name);
    return fieldObj;
});
Handlebars.registerHelper("getGigaBits", function (field_name) { // No I18N
    const value = table_comp.getFieldsRequiredByString(assetDetailView.data, field_name);
    return assetsObj.getGigaBits(value);
});
Handlebars.registerHelper("getIpAddresses", function (ip_addresses, limit) {   // No I18N
    return ip_addresses ? ip_addresses.split(",").splice(0, limit) : "";
});
Handlebars.registerHelper("getAssetIcon", function () {   // No I18N
    // return assetDetailView.data.icon || assetDetailView.metaData.module_details.icon['content-url'];
    if(assetDetailView.metaData.module_details.icon){
        return assetDetailView.metaData.module_details.icon['content-url'];// No I18N
    }
    else {
        return "/images/no-image-icon.svg"; // No I18N
    }
});
Handlebars.registerHelper("enableShowMoreIpAddress", function () {   // No I18N
    const length = assetDetailView.getRemaingIpCount();
    if(length==0 && assetDetailView.data.primary_ip!=null){
        return false;
    }
    return true;
});
