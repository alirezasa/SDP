/*
    todo:
    1. need to remove ci.id for all actions
    2. modify state user search not working
*/
"use strict";//NO I18N
var assetActions = {
    options: {},
    links: {},
    attachment: {},
    attachmentMultiselect: {},
    currentAction: "",
    isDepreciationConfigured: false,
    userMetaInfoOptions: [], // this variable is used as cache for user search fields temporarily
    /**Initiate actions 
     * @param {object} options
     */
    init: function (options) {
        const self = this;
        self.options = options;
        const getModuleSpeMeta = assetsObj.assetModTemplateData.metaDataWithoutId[options.module];
        self.getmodDetOnly = getModuleSpeMeta && getModuleSpeMeta.module_details;
        if(assetActions.options.isListView){
            self.constructActionMenu(options.containerId);
        } else {
            self.initEvents();
        }
    },
    /**Load details page */
    reloadDetailsView: function() {
        assetDetailView.gotoInit(assetDetailView.data.id);
    },
    refreshCiInfo: function() {
        const ciInfoTab = jQuery('[data-name="assetinfo"]');
        const self = assetActions.refreshCiInfo;

        let refresh = () => {
            assetDetailView.gotoInit(assetActions.options.data.id, false);
        }

        if(ciInfoTab.hasClass("active")) {
            return refresh();
        }

        if(self.isRefreshInitiated) {
            return;
        }

        self.isRefreshInitiated = true;

        jQuery('[data-name="assetinfo"]').one("click", function(){//NO I18N
            refresh();
            self.isRefreshInitiated = false;
        });
    },
    /** Execute to construct scan menu */
    constructScanInfoMenu: function () {
        const self = this;
        let links = [],
            scanActionLinks = [],
            scanLinksHTML = [],
            remoteCtrlLinks = [],
            remoteLinksHTML = [];
        sdpAjax({
            url:"/api/v3/" + encodeHTMLAttribute(assetDetailView.module) + "/" + assetDetailView.id + "/_scan_info", //NO I18N
            success: function(response){
                links = response._links;
                for (let i = 0; i < links.length; i++) {
                    if(links[i].header==="tools"){
                        scanActionLinks.push(links[i]);
                    }else if(links[i].header==="remote_control"){
                        remoteCtrlLinks.push(links[i]);
                    }
                }
                scanLinksHTML = self.constructToolsActionMenu(scanActionLinks);

                remoteLinksHTML = self.constructRemoteActionMenu(remoteCtrlLinks);

                if(scanActionLinks.length > 0){
                    jQuery("#scan_info").html(scanLinksHTML.join(""));
                    jQuery("#scan_info_btn").removeClass('hide');
                }

                if(remoteCtrlLinks.length > 0){
                    jQuery("#remote_controls_links").html(remoteLinksHTML.join(""));
                    jQuery("#remote_controls_btn").removeClass('hide');
                    const link_remote = document.getElementById('agent_remote_setting_link'); //NO I18N
                    if (link_remote) {
                        const assetName =link_remote.dataset['asset'] //NO I18N
                        if(assetName !== undefined){
                            link_remote.addEventListener('click', function (e) { //NO I18N
                                e.preventDefault();
                                assetActions.loadUEMRemoteFunction(assetName);
                            });
                        }

                    }
                    const link_creds = document.getElementById('change_credential_link'); //NO I18N
                    if (link_creds) {
                        const assetId =link_creds.dataset['asset'] //NO I18N
                        link_creds.addEventListener('click', function (e) { //NO I18N
                            e.preventDefault();
                            assetActions.loadChangeRemoteCredsFunction(assetId);
                        });
                    }
                }

                jQuery("#actionsBar").find("[name='tools_menu']").on('click',function(){
                    const getTitle = jQuery(this).attr("data-title"),
                          getUrl = jQuery(this).attr("data-url");
                    showURLInDialog(getUrl, "position=absmiddle, modal=yes, width=600, height=150, scrollbars=no, title="+getTitle+"")//NO I18N
                });
            },
            failedCallBack: function (response) {
                console.error("Scan Info API call failed"); //NO I18N
                if(response.responseJSON && response.responseJSON.response_status){
                    console.error(response.responseJSON.response_status)
                }
                jQuery("#scan_info").closest(".btn-group").attr('style', 'display: none !important'); //NO I18N
                jQuery("#remote_controls_links").closest(".btn-group").attr('style', 'display: none !important'); //NO I18N
            },
            ignorefailuremessage: true
        });
    },
    /**
     * Construct Tools action menu in details page 
     * @param {Array} scanActionLinks 
     * @returns 
     */
    constructToolsActionMenu: function (scanActionLinks) {
        let scanLinksHTML = [];
        scanActionLinks.forEach(function(link){
            const name = link.name,
                  url = link.href,
                  title = link.display_name;
                  scanLinksHTML.push(`<li><a data-cs-field="${name}" id="${name}_link" name="tools_menu" href="/" nonce="${sdpNonce}" data-title="${title}" data-url="${url}">${e_html(title)}</a></li>`);
        });
        return scanLinksHTML;
    },
     /**Construct Remote action menu in details page 
      * @param {object} remoteCtrlLinks
      * @returns
     */
    constructRemoteActionMenu: function (remoteCtrlLinks) {
        let remoteLinksHTML = [];
        const isDemoBuild = sdp_app.IS_DEMO_BUILD;
        const demoLink = "javascript: disableForDemo()";//NO I18N
        remoteCtrlLinks.forEach(function(link){
            const name = link.name,
                  url = isDemoBuild ? demoLink : link.href,
                  title = link.display_name;
                  if(name == "web_rdp") {
                    remoteLinksHTML.push('<li><a data-cs-field="' + name + '" id="' + name + '_link" href="'+url+'" target="_blank" rel="noopener noreferrer">'+ e_html(title) + '</a></li>');
                  }
                  else if(name == "change_credential") {
                    const assetId = link.asset
                    remoteLinksHTML.push('<li class="cur-ptr"><a data-cs-field="' + name + '" id="' + name + '_link" href="#" data-asset='+assetId+' rel="noopener noreferrer" nonce="'+sdpNonce+'" >'+ e_html(title) + '</a></li>');
                  }else{
                    if (link.asset !== undefined){
                        const assetName = link.asset
                        remoteLinksHTML.push('<li class="cur-ptr"><a data-cs-field="' + name + '" id="' + name + '_link" href="#" data-asset='+assetName+' rel="noopener noreferrer" nonce="'+sdpNonce+'" >'+ e_html(title) + '</a></li>');
                    } else{
                        remoteLinksHTML.push('<li class="cur-ptr"><a data-cs-field="' + name + '" id="' + name + '_link" href="'+url+'" rel="noopener noreferrer" target="_blank" nonce="'+sdpNonce+'" >'+ e_html(title) + '</a></li>');
                    }
                  }
        });
        return remoteLinksHTML;
    },
    /**Construct Action menu for both listview and details page  
     * @param {string} containerId
    */
    constructActionMenu: function (containerId) {
        const self = this;
        let linksHTML = [];
        const actions = self.options.actionBtnLinks;
        const excludedActions = { 
            modify_state: !this.options.isListView
        };

            for (let i = 0; i < actions.length; i++) {
                const key = actions[i].key,
                      href = actions[i].href,
                      name = actions[i].name;
                    if(!excludedActions[key]) {
                        linksHTML.push(`<li class="cur-ptr"><a data-cs-field="${key}" rel="noopener noreferrer" id="${key}_link" data-event="click" nonce="${sdpNonce}" data-handler="${href}">${e_html(name)}</a></li>`);
                        setTimeout(function(){
                            parent.$sdEventListener("#"+key+"_link");
                        },500);
                    }
            }

            if(linksHTML.length > 0){
                jQuery("#" + containerId).html(linksHTML.join(""));
            }else{
                jQuery("#" + containerId).closest(".btn-group").attr('style', 'display: none !important'); //NO I18N
            }
            self.initEvents();
    },
    /**Used to initiate buttons Edit, Assign and Scan now in details page header panel */
    initEvents: function () {
        const self = this;
        let options = self.options;
        const assetListView = window.assetListView || {};
        const permissions = self.options.permissions;
        if(assetActions.options.isListView){
            if (jQuery("#assets_list_actions").html() === "") {//NO I18N
                jQ("#asst_actins").closest(".btn-group").remove(); //NO I18N
            }
        }else{
            const id = options.data.asset_id,
                  data = this.options.data,
                  isDemoBuild = sdp_app.IS_DEMO_BUILD;
                if(permissions.scan_now){
                    let productType = assetDetailView.data.module.internal_name;
                    let type = productType ? "&type=" + productType : "";//NO I18N
                    jQuery("#ws_scan_now").attr("href", "javascript:void(0)");

                    jQuery("#ws_scan_now").on("click", function () {
                        if (isDemoBuild) {
                            disableForDemo();
                        } else {
                            NewWindow('/WSInvokeScan.do?wsId=' + id + type + '&action=scan&wsName="' + encodeURIComponent(data.name) + '"', 'Scan_WS', '600', '360', 'yes', 'center');
                        }
                    });
                }
                if(permissions.assign_state){
                    jQuery("#ws_assign_associate").on("click", function () {
                        self.openAssignOwnerPopup(id,options.module,true);
                    });
                }
                /** "Edit" button in header panel */
                if(permissions.edit){
                    jQuery("#ws_edit").on("click", function () {
                        /* change modify state as false while entering into edit page */
                        if(assetDetailView && assetDetailView.links_data && assetDetailView.links_data.permissions){
                            assetDetailView.links_data.permissions.modify_state = false;
                        } 
                        assetsObj.redirectTo("form", assetsObj.module, "", id); // No I18N
                    });
                }
                if(permissions.scan_info){
                    self.constructScanInfoMenu();
                }
        }
    },
    /** Trigger Attach and detach function for asset and component attachments from loading
     * @param {*} key
    */
    initActionEvent: function(key) {
        const self = this;
        switch (key) {
            case "attach_asset"://NO I18N
            case "attach_component"://NO I18N
            case "attach_component"://NO I18N
                const attachmentBtn = jQuery("#attach_cmp_asst");
                
                attachmentBtn.click(function() { self.updateAction(self.currentAction); });
                jQuery("#detach_cmp_asst").click(function () { self.updateAction(self.currentAction); });
                break;
        }

    },
    /**Validation for "Copy asset" action */
    loadCopyAsset : function(){
        const self = assetActions;
        const form = jQuery("#copy_form");
        const rules = {
            copy_input: {
                min: 1,
                max: 10,
                required: true
            }
        }

        const messages = {
            copy_input: {
                max: translate("ae.asset.max.num.limit", [10]),//NO I18N
                min: translate("ae.asset.min.num.limit", [1]),
                required: translate("sdp.inventory.copyWS.invalidCountMsg")
            }
        }

        self.validateForm(form, rules, messages);
    },
    /**
     * Execute function to load depreciation data in details page
     */
    loadDepreciation:function(){
        const self = this,
            isDetailView = self.options.isListView !== true;
        let getDepBase, getDepVal = "";
        
            if(self.options.fromAdminEdit && self.options.moduleURL){
                assetsObj.commonAjaxFunction(self.options.moduleURL,null,null,function(response){
                    self.options.data = response.product;
                });
                self.displayElement("list_view_fields", !isDetailView);//NO I18N
            }
            
        self.displayElement("details_view_fields", isDetailView);//NO I18N
        let data = self.options.data;
        /**Available section only in asset details page for configuration */
        if(isDetailView || self.options.fromAdminEdit){
            if(isDetailView){
                jQuery("#productLevelLabel").html(translate("sdp.deprciation.configuration.forProduct", [e_html(data && data.product.name)]));
                if(!data.product_depreciation){
                    jQuery("#labelProductLevel").hide();
                }else{
                    jQuery("#labelProductLevel").show();
                }
                getDepBase =  data.is_asset_depreciation ? data.depreciation_detail : data.product_depreciation;
            }else{
                getDepBase =  data.depreciation_detail;
            }

            getDepVal = getDepBase && getDepBase.depreciation_type;
        } 
        
        
        jQuery("#add_depreciation").prop("title", translate("sdp.asset.ws.adddepreciation"));//NO I18N
        showModal("add_depreciation", isDetailView ? 640 : 580, 480, 840,false, true);//NO I18N
        /**Initiate validation function for depreciation */
        self.depreciationVaidationFun();
        /**Render depreciation types dropdown */
        self.renderDepreciationTypes(getDepVal,getDepBase)
        //onchange function for depreciation useful life and decline/depreciation percent radio button
        const selDepType = jQuery("[name=depreciationTypeRadio]");
        jQuery(selDepType).on("change",function(e){
            self.changeHandler(e,self)
        });

        /**Function for set values for depreciation fields */
        let setValueForDepreciationFields = (data,radEle) => {
            jQuery('[name="salvageValue"]').val(data.salvage_value);
            var setCurrVal = data.depreciation_percent || data.decline_percent || data.useful_life; 
            jQuery('[name="depreciationTime"]').val(setCurrVal);
            jQuery("#"+radEle).prop("checked",true);
        }  
        
             
        /**Enable or Disable depreciation section  based on configuration type*/
        let disableProductFields = (isDisabled) => {
            var containerId = "list_view_fields",//NO I18N
                select2Id = "add_depreciation_select2",//NO I18N
                inputElements = jQuery("#" + containerId + " :input");
                jQuery("#"+select2Id).select2('readonly',false).select2('enable');
                if(isDisabled){
                    inputElements.attr("readonly",true);
                    jQuery("#"+select2Id).select2('disable');//NO I18N
                    jQuery('[name="depreciationTypeRadio"]').prop("disabled",true);//NO I18N
                }else{
                    inputElements.attr("readonly",false);//NO I18N
                    jQuery("#"+select2Id).select2('enable');//NO I18N
                    jQuery('[name="depreciationTypeRadio"]').prop("disabled",false);//NO I18N
                }
        }   
        //onclick function for radio button in depreciation popup
        jQuery('[name="configureDepreciation"]').change(function (e) {
            const isAsset = e.target.value === "asset"; // No I18N
            const getCurrDepData = isAsset ? assetDetailView.data.depreciation_detail : assetDetailView.data.product_depreciation;
            disableProductFields(isAsset ? null : true);
            self.renderDepreciationTypes(getCurrDepData && getCurrDepData.depreciation_type,getCurrDepData);
            getCurrDepData && setValueForDepreciationFields(getCurrDepData,isAsset ? "assetLevel" : "productLevel");//NO I18N
      
        });
        
        /**Set values based on product depreciation or asset depreciation using asset data */
        if(data && data.is_asset_depreciation){
            /**Enable configure data if for the asset is selected   */
            setValueForDepreciationFields(data.depreciation_detail,"assetLevel");//NO I18N
            disableProductFields();
        }else if(data && data.product_depreciation){
            /**Disable configure data if already availaed in admin product  */
            setValueForDepreciationFields(data.product_depreciation,"productLevel");//NO I18N
            disableProductFields(true);
        }else{
            jQuery("#assetLevel").prop("checked",true);//NO I18N
            jQuery("#add_depreciation_select2").select2('readonly',false).select2('enable');//NO I18N
        }
        if(self.options.fromAdmin && data && data.depreciation_detail){
            setValueForDepreciationFields(data.depreciation_detail);
        }
        /**Hide purchase and acquisation date if not details page */
        if(!self.options.fromAdmin && !self.options.isListView){
            let date = data.acquisition_date ? data.acquisition_date.value : null;
            if(date) {
                date = new Date(parseInt(date));
                var value = getFormattedDateTime(date, false);
                jQuery("[name=acquisitionDate]").val(value);
            }
            jQuery("#purchase_cost_cnfg_dprn").val(data.purchase_cost);
        }
    },
    /**
     * on change handler function for configuration types radio button
     * @param {string} elementSel 
     * @param {object} self 
     */
    changeHandler:function(elementSel,self){
        const selectedIndex = elementSel.target ? elementSel.target.value : elementSel.val()  ;
        const hideEleArr = ["declinePercentage","depreciationPercentage","usefulLifeMonth","usefulLifeYear"];//NO I18N    
        self.getDisplayedElement(hideEleArr);
        jQuery("#"+selectedIndex).show();
    },
    /**
     * Render dropdown for depreciation types
     * @param {object} getDepVal 
     * @param {object} data 
     */
    renderDepreciationTypes:function(getDepVal,data){
        const self = this,
              depreciationSelect2 = jQuery("#add_depreciation_select2"),
              getDepTypeVal = getDepVal ? {id:getDepVal.id,text:getDepVal.name} : {};
        
        depreciationSelect2.sdp_select2({
            value: getDepTypeVal,
            cache:{},
            multiple:false,
            width :280,
            allowClear : true,
            placeholder: translate("sdp.admin.product.addproduct.type.choosedepreciationtype"), // No I18N
            url:[{
                url:"/api/v3/depreciation_types",//NO I18N
                field:'depreciation_types'//NO I18N
            }]
        });
        /**Empty dropdown value if values is null or {} */
        if(Object.keys(getDepTypeVal).length==0){
            depreciationSelect2.select2("data","");//NO I18N
        }
        //onchange function for depreciation types
        jQuery("#add_depreciation_select2").on("change", function (e,isPopOpen) {
            jQuery(e.target).valid();
            const getSelVal = jQuery(this).select2("data") ? parseInt(jQuery(this).select2("data").id) : -1;//NO I18N
            if(getSelVal==-1){
                jQuery("#depreciationFields").hide();
            }else{
                jQuery("#depreciationFields").show();
                const hideEleArr = ["declinePercentRadio","usefulLifeContainer","depreciationPercentRadio","usefulLifeYear","depreciationPercentage","declinePercentage","usefulLifeMonth"];//NO I18N
                self.getDisplayedElement(hideEleArr);
                switch(getSelVal){
                    case 1:
                    case 2:
                        const showEleArr = ["usefulLifeContainer","usefulLifeMonth"];//NO I18N
                        self.getDisplayedElement(showEleArr,true);
                        if(getSelVal==2){
                            self.displayElement("declinePercentRadio", true);//NO I18N
                        }else{
                            self.displayElement("depreciationPercentRadio", true);//NO I18N
                        }
                        const hideEleArr = ["depreciationPercentage","declinePercentage"];//NO I18N
                        self.getDisplayedElement(hideEleArr);
                        jQuery("#usefulLifeRadio").prop("checked",true);//NO I18N
                        
                        if(isPopOpen){
                            
                            if(data && data.depreciation_percent){
                                var eleId = getSelVal==2 ? "DeclinePercent" : "DepreciationPercent";//NO I18N
                                jQuery("#"+eleId).prop('checked',true);
                                self.changeHandler(jQuery("#"+eleId),self);
                            }else{
                                jQuery("#usefulLifeRadio").prop("checked",true);//NO I18N
                                self.changeHandler(jQuery("#usefulLifeRadio"),self);
                            }
                        }
                        break;
                    case 3:
                        jQuery("#usefulLifeRadio").prop("checked",true);//NO I18N
                        self.displayElement("usefulLifeYear", true);//NO I18N
                        self.displayElement("usefulLifeMonth");//NO I18N
                        break;
                    default:
                        jQuery("#usefulLifeRadio").prop("checked",true);//NO I18N
                        self.displayElement("usefulLifeMonth",true);//NO I18N
                        self.displayElement("usefulLifeYear");//NO I18N
                        break;
                }
            }
        });
        /**Trigger onchange function initially */
        jQuery("#add_depreciation_select2").trigger("change",true);
        jQuery(".alert-danger").remove();
    },
    /**Used for hide and show multiple elements usng array 
     * @param {Array} types
     * @param {Boolean} isDisplay
    */
    getDisplayedElement:function(types,isDisplay){
        const self = this;
        types.forEach(function (elementId) {
            self.displayElement(elementId, isDisplay);//display the element which matches the given depreciation type and hide others.
        });
    },
    /**Depreciation validation function */
    depreciationVaidationFun:function(){
        const self = this;
        jQuery.validator.addMethod('lessThan', function (value, el, param) {// No I18N
            //no need to check if salvage value less than purchase cost if salvage value is zero(where purchase cost can be zero).
            if (parseFloat(value) === 0) {
                return true;
            }
            return !value || value < parseFloat(param);
        });

        //check if depreciation time type is percentage.
        let isPercentage = () => {
            const typeElement = jQuery("[name=depreciationTypeRadio]:checked");
            const type = typeElement.val();

            return typeElement.is(":visible") && (type === "depreciationPercentage" || type === "declinePercentage");// No I18N
        }

        let rules = {
            depreciationTime: {
                required: function (e) {
                    return jQuery(e).is(":visible");// No I18N
                },
                number: true,
                digits: {
                    depends: function () {
                        return !isPercentage() && Number.isInteger(parseInt(jQuery("[name=depreciationTime]").val()));
                    }
                },
                range: function() {
                    return isPercentage() ? [1, 100] : [1, 999];
                }
            },
            salvageValue: {
                number: true,
                min: 0
            },
            depreciation_type: {
                required: function (e) {
                    const method = jQuery("#add_depreciation_select2").select2("data") && jQuery("#add_depreciation_select2").select2("data").id;//NO I18N
                    return jQuery(e).is(":visible") && (!method || method === "-1");// No I18N
                }
            }
        };

        let messages = {
            purchase_cost: {
                required: translate("sdp.admin.product.cost"),
                number: validNumberMsg,
                min: translate("sdp.paymentdetails.addpayamount.jsErr"),//NO I18N
            },
            acquisitionDate: {
                required: translate("sdp.admin.product.acquisitionDate")
            },
            configureDepreciation: {
                required: translate("ae.config.depreciation.option.required")
            },
            depreciation_type: {
                required: translate("ae.config.depreciation.choose.opt")
            },
            depreciationTime: {
                required: function () {
                    const type = jQuery("[name=depreciationTypeRadio]:checked").val();
                    switch(type) {
                        case "depreciationPercentage"://NO I18N
                            return translate("sdp.admin.product.deppercent");
                        case "declinePercentage"://NO I18N
                            return translate("sdp.admin.product.choosedecpercent");
                        default:
                            return translate("sdp.admin.product.chooseusefullife")
                    }
                },
                number: validNumberMsg,
                range: function() {
                    const type = jQuery("[name=depreciationTypeRadio]:checked").val();

                    switch(type) {
                        case "depreciationPercentage"://NO I18N
                            return translate("ae.depreciation.percentage.invalid");
                        case "declinePercentage"://NO I18N
                            return translate("ae.decline.percentage.invalid");
                        default:
                            return translate("ae.usefullife.invalid");
                    }
                },
                digits: translate("sdp.admin.product.chooseusefullife.positiveInteger")
            },
            salvageValue: {
                lessThan: translate("sdp.assetAddForm.compare.salvageAndcost"),
                number: validNumberMsg,
                min: translate("ae.asset.min.num.limit", [0])
            }
        };

        if(self.options.isListView){
            /**For checking any of the assets had less purchase cost than salvage value in bulk selected asset */
            const getSelectedIds = assetListView.tableObject.bulkSelect.getSelectedIDs();
            if(getSelectedIds.length>0){
                let getLoadedRecords = null;
                if(assetListView.tableObject && assetListView.tableObject.t_obj.table_info.fields_required.hasOwnProperty("purchase_cost")){
                    getLoadedRecords = assetListView.tableObject.loadedRecords;
                }else{
                    const data = {"list_info":{"fields_required":["purchase_cost","name"],"search_criteria":[{"field":"id","condition":"is","values":getSelectedIds,"logical_operator":"AND"}]}};//NO I18N
                    assetsObj.commonAjaxFunction(self.options.module,null,data,function(response){
                        getLoadedRecords = response[self.options.module];
                    });
                }
                
                self.getPurCostForSelIds = [];
                getSelectedIds.forEach(function (elementId,index) {
                    let obj = {};
                    if(assetListView.tableObject && assetListView.tableObject.t_obj.table_info.fields_required.hasOwnProperty("purchase_cost")){
                        obj["purchase_cost"] = getLoadedRecords[elementId].purchase_cost;
                        obj["name"] = getLoadedRecords[elementId].name;
                    }else{
                        obj["purchase_cost"] = getLoadedRecords[index].purchase_cost;
                        obj["name"] = getLoadedRecords[index].name;
                    }
                    if(assetActions.getPurCostForSelIds.indexOf(obj)===-1){
                        assetActions.getPurCostForSelIds.push(obj); 
                    }
                       
                });
                var getSelectedAssetNames = "";
                var count = 0;
                rules.salvageValue.lessThan = function (e) {
                    getSelectedAssetNames = "";
                    count = 0;
                    if(assetActions.getPurCostForSelIds && assetActions.getPurCostForSelIds.length>0){
                        const salvageValue = parseFloat(e.value);
                        let isGreaterPurchase = parseFloat(assetActions.getPurCostForSelIds[0].purchase_cost);
                        jQuery.each(assetActions.getPurCostForSelIds,function(index,fieldVal){
                            var currentPurchaseCost = parseFloat(fieldVal.purchase_cost);
                            if(salvageValue>currentPurchaseCost){
                                isGreaterPurchase = parseFloat(fieldVal.purchase_cost);
                                if(count<3){
                                    getSelectedAssetNames+= (!getSelectedAssetNames) ? fieldVal.name : ", "+fieldVal.name;
                                }
                                count += 1;
                            }
                        });
                        return isGreaterPurchase;
                    }
                    
                };
                messages.salvageValue.lessThan = function(e){
                    const getSelAssetIdsLen = window.top.assetListView && window.top.assetListView.tableObject && window.top.assetListView.tableObject.bulkSelect.getSelectedIDs()
                    if(getSelAssetIdsLen.length>0){
                        if(count > 3) {
                            return translate("asset.listview.salvage.value.greater.error.msg.count",[e_html(getSelectedAssetNames),count-3]);
                        }else{
                            return translate("asset.listview.salvage.value.greater.error.msg",[e_html(getSelectedAssetNames)]);
                        }
                    }else{
                        return translate("sdp.assetAddForm.compare.salvageAndcost");
                    }
                    
                }
            }

        }else if(!self.options.isListView) {
            rules.salvageValue.lessThan = function (e) {
                return jQuery("#purchase_cost_cnfg_dprn").val();
            };

            rules.purchase_cost = {
                required: true,
                number: true,
                min: 0
            };

            rules.acquisitionDate = {
                required: true
            };

            rules.configureDepreciation = {
                required: true
            };
        }
        
        var validNumberMsg = translate("ae.admin.webrdpsettings.validdays");

        if(self.options.nopopup){
            rules.depreciation_type = false;
        }

        const getForm = jQuery("#add_depreciation_form");
        self.validateForm(getForm, rules, messages);
    },
    /** Save function for depreciation
        * @param {Boolean} removeAlert
     */
    saveDepreciationData:function(removeAlert){
        const self = this;
        let options = self.options;
        const data = self.getDepreciationData("#add_depreciation_select2");//NO I18N
        const isValid = data.isValid === false ? false : jQuery("#add_depreciation_form").valid();
        const ids = (!self.options.fromAdmin && options.isListView) && assetListView.getSelectedIDs(); 
        const module = options.module;
        let saveButton = "",urlToSave = "";
        options.dialogId = "#add_depreciation";//NO I18N
        if(!isValid) {
            return;
        }
        
       
        urlToSave = options.isListView ? module+"?ids="+ids : module+"/" + self.options.data.asset_id;//NO I18N
        options.message = "sdp.admin.setup.productyype.updatemsg";//NO I18N
        
        if(!self.options.fromAdmin) {
            saveButton = self.loadingtextfn();
        }
        
        
        let saveBtnFun = () => {
            sdpAjax({
                url: "/api/v3/"+urlToSave, //NO I18N
                data: sdpAjaxInputData(data),
                type: "PUT", //NO I18N
                success: function(resp) {
                    !removeAlert && showalert("success", translate(options.message),"isAutoHide=true"); //NO I18N
                    if(typeof self.options.success === "function") {
                    self.options.success(resp);
                    }
                    if(typeof options.success === "function") {
                        options.success(resp);
                    }
                    
                    if(options.data && assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(options.data.asset_id)){
                        assetsObj.assetModTemplateData.metaDataWithId[options.data.asset_id][options.moduleType] = resp[options.moduleType];
                    }
                    if(!self.options.isListView){
                        assetDetailView.gotoInit(assetDetailView.id, false, "financials");//NO I18N
                        assetDetailView.isDepreciationSaved = true;
                    }
                    
                    
                },
                complete: function() {
                    
                    if(options.hasOwnProperty("select2")) { options.select2.select2("val", ""); }
                    saveButton && saveButton.button('reset'); //NO I18N
                    jQuery(options.dialogId).dialog('close'); //NO I18N
                },
                error:function(response){
                    if(self.options.fromAdmin && assetActions.options.tableObjects){
                        assetActions.options.tableObjects.products.handleErrorMsg(response);
                    }
                },
                failedCallBack: options.failedCallBack,
                ignorefailuremessage: options.ignorefailuremessage
            });
        }

        if(self.options.fromAdmin && !self.options.nopopup){
            const confirmPop = confirm(translate('sdp.asset.depreciationDetailsPopUp.forProductLevelConfirmation'));
            if(typeof confirmPop=="undefined" || confirmPop == true) {
                saveBtnFun();
            }else{
                return false;
            }
        }else{
            saveBtnFun();
        }
    },
    /**Validate function with error message
     * @param {*} form
     * @param {object} rules
     * @param {object} messages
     * 
     */
    validateForm: function(form, rules, messages) {
        const self = this;
        form[0] && form[0].reset(); //reset form values.

        const validator = form.validate({
            rules: rules,
            messages: messages,
            ignore: (form[0] && form[0].id==='costform') ? ":hidden" : [],
            errorClass: 'text-danger', //No I18N
            errorElement: 'span', //No i18N
            errorPlacement: function(error, element) {
                if (element.parents(".input-group").length > 0) {
                  element = element.parents(".input-group"); //No I18N
                } else if ((element.attr("type") === "checkbox" || element.attr("type") === "radio" ) && element.parent("label").length > 0) { //NO I18N
                  element = element.parent("label"); //NO I18N
                }
                error.insertAfter(element);
                error.addClass("alert alert-danger p5 fl m0");
                error.css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + element.height() + 10) + 'px' }); //No i18N
            }
        });
        validator && validator.resetForm();//reset validation.
    },
    /**Listview url for "View attached assets" based on click triggered from user or asset actions
     *  @param {string} attachments
     * @param {Boolean} isAttached
     */
    updateAttachmentURL: function(attachments, isAttached) {
        const self = this,
              url =  self.options.moduleURL + "/", //NO I18N
              t_obj = assetListView.tableObject.t_obj;
        let listInfo = t_obj.table_info.list_info,
            options = t_obj.options;

        if(attachments === "asset_attachments" || attachments === "component_attachments" || attachments === "asset_connections") {
            listInfo.search_criteria = assetListView.getsearchCriteria(attachments);
        }
        else {
            delete listInfo.search_criteria;
        }

        delete listInfo.search_fields;

        // loadAttachment
        options.callbackURL = url + attachments + (isAttached ? "/parent_asset" : "/child_asset");//NO I18N
        options.entity_name = isAttached ? "parent_asset" : "child_asset";//NO I18N

        assetFilter.cancelSearch();


    },
    /**Set attachment popup title for "Attached assets" and "Attached Components" 
     *  @param {string} attachment
     * @param {boolean} isAttached
    */
    setAttachTitle: function (attachment, isAttached) {
        let title, titleBar;
        /**If attached is true (Renders in View attached assets) */
        if(isAttached) {
            switch(attachment) {
                case "asset_attachments":// No I18N
                case "attached_assets":// No I18N
                    title = "ae.assets.attached";// No I18N
                    break;
                case "asset_connections":// No I18N
                case "connected_assets":// No I18N
                    title = "sdp.inventory.resourcesconn.connectedasset";// No I18N
                    break;
                default:
                    title = "ae.comp.attached";// No I18N
                    break;
            }
        } else {
            switch(attachment) {
                case "asset_attachments":// No I18N
                    title = "ae.asset.attach";// No I18N
                    break;
                case "asset_connections":// No I18N
                    title = "relationship.assets.attach.popup";// No I18N
                    break;
                default:
                    title = "ae.comp.attach";// No I18N
                    break;
            }
        }

        title = translate(title);

		if(assetActions.options.from=="view_user_assets" && window.top.assetsObj.custom_options&&window.top.assetsObj.custom_options.user_name){
			title = translate("sdp.requests.viewrequest.userasset",[e_html(window.top.assetsObj.custom_options.user_name)]);
		}
        /**For back button in View attached assets popup */
        if (attachment == "attached_assets" || attachment == "attached_components" || attachment == "connected_assets") {
            titleBar = title;
        } else if(isAttached) {
            titleBar = `<a id="connected_asset_backbtn" class="btn btn-default btn-xs fl mr10" rel="uitip">\<span class="common-sprite icon-sm common-go-back-icon1 mt4"></span></a>\<div class="p5" style="display: inline-block;">${title}</div>`;
        } else {
            titleBar = title;
        }

        assetsObj.popup.setDialogTitle(titleBar);
    },
    /**Set assets attachments url, title and display button in listview popup 
     * @param {StreamPipeOptions} attachment
     * @param {boolean} isAttached
     * 
    */
    setAssetsAttachment: function (attachment, isAttached) {
        const self = this;
        let text = "";
        if(attachment==="asset_connections"){
            text = !isAttached ? translate("sdp.common.connect") : translate("sdp.common.disconnect");
        }
        else{
            text = !isAttached ? translate("ae.common.attach") : translate("sdp.inventory.addAssetsToWS.deassign.attachedAssets");
        }

        self.attachment.isAttached = isAttached === true;
        self.updateAttachmentURL(attachment, isAttached);

        self.displayElement("view_attached_asst_comp", !isAttached);//NO I18N

        self.setAttachTitle(attachment, isAttached);

        jQuery("#asset-list-view").find("#attach_cmp_asst").text(text);
        Object.keys(assetListView.tableObject.length>0) && assetListView.tableObject.bulkSelect.unselectBulkRecords();
        const getBackBtn = window.top.jQuery("#connected_asset_backbtn");
        getBackBtn.on('click',function(){
            assetActions.loadNonAttachedAsset();
        });
    },
    /**Render while clicking on "View Attached Assets" in Popup */
    loadAttachedAsset: function () {
        assetActions.setAssetsAttachment(assetActions.attachment.type, true);
    },
    /**Load normal assets which is not attached - While clicking back button from "View attached assets" */
    loadNonAttachedAsset: function () {
        const actions = window.top.jQuery('[name="asset_popup"]')[0].contentWindow.assetActions;
        actions.setAssetsAttachment(assetActions.attachment.type, false);
    },
    /**TODO: personalization, refresh when done. 
     * @param {*} attachment
    */
    loadAttachment: function (attachment, isAttached) {
        const self = assetActions;

        self.attachment.type = attachment; //asset or component
        self.attachment.isAttached = isAttached ? isAttached : false;
        /**Open asset attachments and component attachments popup */
        assetsObj.popup.open("list", attachment, undefined, undefined, undefined, undefined, assetActions.options.from);//NO I18N
       
        self.setAttachTitle(attachment, isAttached);
        /**Remove jquery dialog destroyed while click close button */
        assetsObj.dialog.on('dialogclose', function (event) {
            assetsObj.dialog.dialog("destroy");//NO I18N
        });
    },
    /** opens the dialog/popup of the given actionsKey such as "assign_to_department", "modify_type" and initialize the select2. - code from asset over cm
     * @param {string} actionKey
     * @param {string} display_name
     * @param {string} method
     * @param {string} href
     * @param {integer} width
     * @param {integer} minHeight
    */
    loadAction: function(actionKey, display_name, method, href,width, minHeight) {
        const self = this;
        self.action_obj = {key : {"display_name" : display_name,"method":method,"href":href}} //NO I18N
        let options = self.getAction(actionKey);
        let dialogId;
        
        const module = (assetListView && assetListView.hasOwnProperty("module")) ? assetListView.module : self.options.module;//NO I18N

        const isWorkstation = (self.getmodDetOnly && self.getmodDetOnly.name === "asset_computer") || (assetsObj.assetModTemplateData.metaDataWithoutId[module] && assetsObj.isComputerHierarchy(assetsObj.assetModTemplateData.metaDataWithoutId[module].hierarchy));
        const isListView = self.options.isListView;

        self.currentAction = actionKey;

        switch(actionKey) {
            case "print_preview":// No I18N
                let isComputerHierarchy = null;
                if(assetDetailView.metaData.hierarchy){
                    isComputerHierarchy = (assetDetailView.data.module.internal_name === "Computer" || assetsObj.isComputerHierarchy(assetDetailView.metaData.hierarchy))// No I18N
                    assetActions.getSoftwareData = [];
                    isComputerHierarchy && assetActions.loadAllSoftwareInPrintPreview(1);
                }
                NewWindowP('/ui/print?entity_id='+ assetDetailView.id +'&module=assets&apiModule='+assetDetailView.module+'&externalframe=true','','1100','700','yes','center','yes','yes');// No I18N
                return;
            case "modify_state":// No I18N
            if(isListView)

                assetActions.openAssignOwnerPopup();
            else
            assetActions.openAssignOwnerPopup(assetDetailView.id,assetDetailView.module);
            break;
            case "attached_assets"://NO I18N
            case "attached_components"://NO I18N
            case "connected_assets"://NO I18N
                self.loadAttachment(actionKey, true);
                break;
            case "attach_asset"://NO I18N
            case "attach_component"://NO I18N
                const attachments = "attach_asset" === actionKey ? "asset_attachments" : "component_attachments";//NO I18N
                self.loadAttachment(attachments);
                break;
            case "asset_connections"://NO I18N
                self.loadAttachment("asset_connections");// No I18N
                break;
            case "modify_type":// No I18N
                dialogId = actionKey;
                jQuery("#" + actionKey).prop("title", display_name);// No I18N
                const container = "modify_type_nf";// No I18N
                assetFilter.loadElements[container] = true; //html preloaded.
                assetFilter.init({
                    module: actionKey,
                    container: container,
                    callback: function(data) {
                        jQuery("#product_filter_select2").select2("enable", !jQuery.isEmptyObject(data)); //enable only if product type selected. // No I18N
                        self.setModifyType.apply(self, arguments);
                    },
                    hasSearch: false,
                    getSelect2Options: function (field) {
                        return assetActions.getSelect2Options(field, actionKey);
                    }
                });
                
                jQuery("#product_filter_select2").select2("enable", false); // No I18N
                /*code from asset over cm branch*/
                const form = jQuery("#modify_type_form");
                const rules = {
                    product_type: {
                        required: true
                    },
                    product:{
                        required : true
                    }
                }
                const messages = {
                    product_type: {
                        required: translate("ae.barcode.formValidation.productType")
                    },
                    product: {
                        required: translate("sdp.inventory.ModifyDeviceType.chooseProductName")
                    }
                }
                self.validateForm(form, rules, messages);
                form.find("[name='product_type']").on("change", function () {// No I18N
                    jQuery(this).valid();
                });
                form.find("[name='product']").on("change", function () {// No I18N
                    jQuery(this).valid();
                });
                break;
            case "add_software": //NO I18N
                assetsObj.popup.openDialog("/asset/WS_softwares.jsp?externalframe=true&id="+ assetDetailView.asset_id,translate("sdp.inventory.breadcrumb.addSW"),assetActions.getAddSoftwareDialogOptions); //NO I18N
                break;
            case "change_scan_credential":// No I18N
                if(isListView)
                confirmChangeCredentials(document.WorkstationListViewAction,isWorkstation,isCMDB,translate('sdp.inventory.listviewWS.jsmessage7'),assetsObj.getProductTypeName(assetsObj.type_id));
                else
                self.loadChangeScanCrential();
                break;
            case "scan_now": //NO I18N
                confirmToScan(document.WorkstationListViewAction , self.getProductType() , isCMDB , translate('sdp.asset.listview.action.selectforscan'))
                break;
            case "excluded_from_scan": //NO I18N
                jQuery("#excludescan").prop("title", display_name); //NO I18N
                showModal('excludescan',620,420,false); //NO I18N
                break;
            case "agent_remote_setting": //NO I18N
                changeRDSSettings();
                break;
            case "attach_document": //NO I18N
                self.uploadFiles();
                break;
            case "configure_depreciation": //NO I18N
                self.loadDepreciation(display_name,method,href);
                break;
            case "add_to_group": //NO I18N
                confirmAddToGroupAction()
                break;
            case "reconcile": //NO I18N
                self.reconcile();
                break;
            case "copy":// No I18N
                dialogId = actionKey;
                jQuery("#" + actionKey).prop("title", display_name);// No I18N
                self.displayElement("cpy_asset_info", true);// No I18N
            case "assign_to_department"://NO I18N
                self.validateSelect2("department", translate("sdp.esm.dept.move.assets.invaliddept"), jQuery("#assign_to_department_form"));//NO I18N
            case "assign_to_site": //NO I18N
                jQuery("#" + actionKey).prop("title", display_name);// No I18N
            default:
                self.select2(options, actionKey);
                dialogId = actionKey;
                break;
        }

        if(dialogId) {
            minHeight = minHeight || 480;
            width = width || 420;

            showModal(dialogId, width, minHeight, 840,false, true); 
        }

        self.initActionEvent(actionKey);
        if(typeof options.onLoad === "function") {//NO I18N
            options.onLoad();
        }
    },
    /**Get select2 options from assetFilter.js for "Modify type" action 
     * @param {string} field
     * @param {string} action
     * @returns
    */
    getSelect2Options: function (field, action) {
        let options = assetFilter.getSelect2Options(field);
        const module = assetsObj.module;
        const isAttachAsset = module === "asset_attachments" || module === "asset_connections" || module === "component_attachments";//NO I18N

        if (!isAttachAsset && action === "modify_type" && assetFilter.options.for_other_modules !==true) {
            options.width = undefined;
        }
        return options;
    },
    /** set product "select2" options for the selected "product type" 
     * @param {object} data
     * @param {integer} id
     * @param {string} search
     * 
    */
    setModifyType: function (data, id, search) {
        const self = assetActions;
        const fieldToLoad = "product_filter";// No I18N
        let options = self.getSelect2Options(fieldToLoad, "modify_type");// No I18N
        const field = "module.id";// No I18N

            const module = assetsObj.module;
            const isAttachAsset = module === "asset_attachments" || module === "asset_connections" || module === "component_attachments" || assetFilter.options.for_other_modules === true;//NO I18N

        function initSearch() {

            search !== false && isAttachAsset && assetFilter.initSearch(assetFilter.fieldsCriteria, assetFilter.getFields(module), null, id);
        }

        //update "product" select2 options only if "product type" is changed.
        if (id !== "product_type_filter") {
            initSearch();
            return;
        }

        !options.list_info && (options.list_info = {});

        if(!isAttachAsset){
            if(jQuery("#product_type_filter_select2").select2("data")){
                let urlModule = jQuery("#product_type_filter_select2").select2("data").api_plural_name; // No I18N
                options.urlToGet = encodeHTMLAttribute(urlModule)+'/product'; // No I18N
            }else{
                jQuery("#product_filter_select2").select2("disable"); // No I18N
            }
        }

        options.list_info.fields_required = ["name", "id"];// No I18N

        jQuery("#" + fieldToLoad + "_select2").select2("destroy").val("");

        self.select2(options, fieldToLoad, options.field);

        initSearch();
    },
    /**Validation function for assign to department 
     * @param {string} name
     * @param {string} msg
     * @param {*} form
     * 
     */
    validateSelect2: function (name, msg, form) {
        const self = this;
        let rules = {}, messages = {};

        rules[name] = {
            required: function (e) {
                const product = form.find("[name='" + name + "']").val();
                return jQuery(e).is(":visible") && (product === "" || product === "-1");// No I18N
            }
        }

        form.find("[name='" + name + "']").on("change", function () {// No I18N
            jQuery(this).valid();
        });

        messages[name] = {
            required: msg
        }

        const getForm = form;
        self.validateForm(getForm, rules, messages);
    },
    /**Common sdp_select function 
     * @param {object} options
     * @param {*} id
     * @param {string} field
     * 
    */
    select2: function (options, id, field) {
        const select2 = jQuery("#" + id + "_select2"), 
          placeholder = options.placeholder,
          href = options.urlToGet,
          select2_custom = options.options;
        if (select2.hasClass("select2-offscreen")) {
            select2.select2("val", ""); //NO I18N
            return;
        }
        let select2Options = {
            allowClear: true,
            width: options.width || "100%", // No I18N
            url: [{
                url:"/api/v3/" + href,//NO I18N
                field: options.entity_name || field || href
            }],
            dropdownCssClass: "text-wrap" //NO I18N
        };
        if(select2_custom){
            select2Options = jQuery.extend(true, select2_custom, select2Options);
        }
        if(placeholder) {
            select2Options.placeholder = placeholder;
            select2Options.allow_clear=true;
        }

        if(options.list_info) {
            select2Options.url[0].list_info = options.list_info;
        }

        select2.sdp_select2(select2Options);
    },
    /**get data based on action key
     * @param {object} options
     * @param {string} key
     * 
     * @returns
     */
    getData: function (options, key) {
        const self = this, isListView = self.options.isListView, field = options.field;
        let data = {}, isValid = true,
            elementId = "#" + key,
            elementValue;
        
        if(key === "modify_type") {
            elementId = "#product_filter";// No I18N
        }

        switch (options.elementType) {
            case "input"://NO I18N
                elementId += "_input";//NO I18N
                break;
            case "select2"://NO I18N
                elementId += "_select2";//NO I18N
                break;
        }

        elementValue  = jQuery(elementId).val();

        switch (key) {
            case "attach_asset"://NO I18N
            case "attach_component"://NO I18N
            var id = self.options.data.asset_id;
                if(self.attachment.isAttached) {
                    data.asset_asset = assetListView.tableObject.bulkSelect.getSelectedIDs().map(function (assetId) {
                        return {
                            state: { name: "In Store" },//NO I18N
                            id: assetId
                        }
                    });
                } else {
                    data.asset_asset = assetListView.tableObject.bulkSelect.getSelectedIDs().map(function (assetId) {
                        return {
                            state: { name: "In Use" },//NO I18N
                                used_by_asset: { id: id },
                                user: assetActions.options.data.user,
                                department: assetActions.options.data.department,
                                id: assetId
                        }
                    });
                }

                isValid = true;
                break;
            case "asset_connections"://NO I18N
                data.asset_connection = assetListView.tableObject.bulkSelect.getSelectedIDs().map(function (assetId) {
                    return {
                        child_asset: { id: assetId }
                    }
                });

                isValid = true;
                break;
            case "copy"://NO I18N
                isValid = jQuery("#copy_form").valid();
                data[field] = {};
                data[field][options.dataField] = elementValue;
                break;
            case "assign_to_department"://NO I18N
                isValid = jQuery("#assign_to_department_form").valid();
                data[field] = {};
                data[field]["state"] = { name: "In Use" };
                data[field][options.dataField] = {id: elementValue};
                break;
            case "assign_to_site"://NO I18N
                data[field] = {};
                if (elementValue == "-1" || elementValue === ""){//NO I18N
                    data[field][options.dataField] = null;
                }else{
                    data[field][options.dataField] = {id: elementValue};
                }
                break;
            case "modify_type"://NO I18N

                isValid = jQuery("#modify_type_form").valid();
                let value = {}, productTypeId = jQuery("#product_type_filter_select2").val();
                
                if(isListView){
                    value[options.dataField] = {id: elementValue};
                    data[assetListView.tableObject.metaInfo.entity] = value;
                    data[assetListView.tableObject.metaInfo.entity]["module"] = {id : productTypeId};

                }else{
                    value[options.dataField] = {id: elementValue};
                    data[assetDetailView.data.module.api_name] = value;
                    data[assetDetailView.data.module.api_name]["module"] = {id : productTypeId};
                }
                break;

        }

        if(!isValid) {
            data.hasError = true;
        }

        return data;
    },
    /**Get success msg while saving  
     * @param {string} key
     * @returns
    */
    getSuccessMsg: function (key) {
        let id;
        if(key === "modify_type") {
            id = key === "modify_type" ? "product_filter" : key;// No I18N
            return translate("ae.asset.modifytype.bulksuccess", [jQuery("#" + id + "_select2").select2("data").text]);
        }
    },
    /**Get urls of actions while saving  
     * @param {string} module
     * @returns
    */
    getURLToSave: function (module) {
        let url = "";
        switch (module) {
            case "attach_asset"://NO I18N
            case "attach_component"://NO I18N
                url = module + "?ids=" + assetListView.tableObject.bulkSelect.getSelectedIDs().toString(); // No I18N
        }
        return url;
    },
    /** Set associated assets function */
    setAssociateAsset: function() {
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
        let selectOptions = [];
		let valuesData = Object.values(assetListView.tableObject.bulkSelect.selectedRecords);
		if(valuesData&&valuesData.length>0){
            for(let i=0;i<valuesData.length;i++){
                if(valuesData[i] && (valuesData[i].name || valuesData[i].text)){
                    valuesData[i].text=(valuesData[i].name) || (valuesData[i].text);
                    selectOptions.push('<option value="'+ valuesData[i].id +'">'+ e_html(valuesData[i].text) +'</option>');

                }
            }
        }
        //SDF-128056
        const dataTransform = MC.dotObjgetval(parentWindow, 'assetsObj.custom_options.dataTransform'); //No I18N
        if(typeof dataTransform === 'function') { // This Callback is used to transform the data before setting it to select2
            valuesData = dataTransform(valuesData);
        }
        const fromPage = assetListView.from;
		if (["request"].indexOf(fromPage) !== -1) { // No I18N
            parentWindow.jQuery('[name="assets"]').select2("data", valuesData).trigger("change"); // No I18N
		}
        if (["request_maintenance"].indexOf(fromPage) !== -1) { // No I18N
            parentWindow.jQuery('[name="assets"]').select2("data", valuesData).trigger("change"); // No I18N
		}
		if (["problem"].indexOf(fromPage) !== -1) { // No I18N
            parentWindow.jQuery('[name="associated_asset"], #associated_asset').select2("data", valuesData).trigger("change"); // No I18N
		}
        
        if (["release"].indexOf(fromPage) !== -1) { // No I18N
            if (parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_release && parentWindow.FC_Mapper.form_release.grid.is(":visible")) { //no i18n
                parentWindow.FC_Mapper.form_release.setMultiSelect("assets", valuesData); // No I18N
            }
            else if (parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_rcForm) {
                parentWindow.FC_Mapper.form_rcForm.setMultiSelect("assets", valuesData); // No I18N
            }
            else { //release template
                parentWindow.jQuery('form #assets').select2('data', valuesData).trigger('change'); // No I18N
            }
        }
       if (["change"].indexOf(fromPage) !== -1) { // No I18N
            if(parentWindow.jQuery('[name="ASSETID"]').is("select")){
                parentWindow.jQuery('[name="ASSETID"]').html(selectOptions.join('')).trigger("change"); // No I18N
            }
            else{
                parentWindow.FC_Mapper && parentWindow.FC_Mapper.form_change && parentWindow.FC_Mapper.form_change.grid.is(":visible")//no i18n
                            ? parentWindow.FC_Mapper.form_change.setMultiSelect("assets", valuesData) : //no i18n
                             parentWindow.FC_Mapper.form_rcForm.setMultiSelect("assets", valuesData); // No I18N
            }
       }
        if (["contracts"].indexOf(fromPage) !== -1) { // No I18N
            if(parentWindow.ContractDefForm.assetList){
                const count = parentWindow.ContractDefForm.assetList.options.length;
                let num = count;
                let present = false;
                for(n=0;n<valuesData.length;n++){
                    var value = valuesData[n].id;
                    var text = valuesData[n].text;
                    for(i=0; i<count; i++) {
                        if(parentWindow.ContractDefForm.assetList.options[i].value == value) {
                        present=true;
                        break;
                        }
                    }
                    if(!present) {
                        parentWindow.ContractDefForm.assetList.options[num++]=new Option(text,value);
                        assetlistchanged = true;
                    }
                }
            }
            else{
                resourceIDs = assetListView.tableObject.bulkSelect.getSelectedIDs().toString();
                if (resourceIDs != ''){
                    contractID = getUrlParameterByName("contractID",parentWindow.location.href);// No I18N
                    if(contractID != null && contractID != "")
                    {
                        sdpAjax({
                            url: "/ContractResourcesDef.do?mode=associateAssets&resourceIDs="+resourceIDs+"&contractID="+contractID, //NO I18N
                            type: "post"// No I18N
                        });
                        parentWindow.location.href = '/ContractDef.do?contractMode=viewContract&contractID=' + contractID;
                    }
          }
          // code from asset over cm branch - (Two I-frames) window.parent is not accessable right now, hence we getting the options from window.top.preview component checking whether the preview component is present or not. If present, we are changing the parent window.
          if(!jQuery.isEmptyObject(parentWindow.$previewComponent.options)){
               parentWindow = parentWindow.document.querySelector("#"+parentWindow.$previewComponent.options[1].containerId+" iframe").contentWindow;
          }
            }
        }
        parentWindow.assetsObj.dialog.dialog("close");//NO I18N
    },
    /**Attach assets save function */
    saveAttachAssets: function(key) {
        const self = this;
        if((self.attachment.type==="component_attachments" || (self.attachment.type==="asset_attachments" && ["release","request_maintenance","request","contracts","change","problem"].indexOf(assetListView.from) === -1)) && !self.attachment.isAttached){
        const message = translate('ae.attach.comp.helpTxt');

        const title = self.attachment.type==="component_attachments" ? translate("sdp.inventory.wsRtPanel.attachcomp.title") : translate("sdp.inventory.wsRtPanel.attachAsset"); // No I18N
        
        showconfirm(true,'title=' + title + ', message=' + message + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("sdp.common.back") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
            if(save) {
                if (["release","change","request_maintenance","request","problem","contracts"].indexOf(assetListView.from) !== -1) { // No I18N
                    self.setAssociateAsset();
                    return;
                }

                assetListView.showLoading();
                self.updateAction(key);

            }
        });

        }
        else{
            if (["release","change","request_maintenance","request","contracts","problem"].indexOf(assetListView.from) !== -1) { // No I18N
                self.setAssociateAsset();
                return;
            }

            assetListView.showLoading();
            self.updateAction(key);
        }

    },
    /**Execute function while update data
     * @param {*} key
     * @param {Boolean} removeAlert
     */
    updateAction: function (key,removeAlert) {
        const self = this,
              options = self.getAction(key),
              data = self.getData(options, key);

        if(data.hasError) {
            return;
        }

        const actionData = {
            dialogId: "#" + key, //NO I18N
            data: data,
            message: options.successMsg ? translate(options.successMsg) : self.getSuccessMsg(key),
            href: options.urlToSave || self.getURLToSave(key),
            type: options.type || "PUT",//NO I18N
            key: key
        };
        self.saveAction(jQuery.extend(true, options, actionData),removeAlert);
    },
    /**Execute function while update data
     * @param {object} options
     * @param {Boolean} removeAlert
     */
    saveAction: function(options,removeAlert) {
        const self = this;
        let saveButton, 
            url = options.href, 
            ids = (self.options.getId() && self.options.getId().length>0) ? self.options.getId() :  self.options.data.asset_id;
        
        const isBulkUpdate = Array.isArray(ids) && !options.isSingleAsset;

        if(isBulkUpdate) {
            ids = ids.toString();
            url = url + "?ids=" + ids;//NO I18N
        }

        if(isBulkUpdate && ids.length === 0) {
            showalert("failure", translate("asset.bulk.not.selected.message"), "isAutoHide=true");//NO I18N
            return false;
        }

        saveButton = self.loadingtextfn(ids);
        let saveBtnFun = (saveButton) => {
            let getSaveBtn = saveButton;
            sdpAjax({
                url: "/api/v3/" + url, //NO I18N
                data: sdpAjaxInputData(options.data),
                type: options.type, 
                success: function(resp) {
                    !removeAlert && showalert("success", e_html(options.message),"isAutoHide=true"); //NO I18N
                    if(typeof self.options.success === "function") {
                       self.options.success(resp);
                    }
                    if(typeof options.success === "function") {
                        options.success(resp);
                    }
                    if(options.key=="assign_to_site" || options.key=="assign_to_department"){
                        const getResponseArray = resp[options.responseEntity];
                        if(typeof getResponseArray!='undefined' && getResponseArray && getResponseArray.length>0){
                            getResponseArray.forEach(function(fld,index){
                                if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(fld.id)){
                                    const getEntity = assetsObj.assetModTemplateData.metaDataWithId[fld.id].metainfo.entity;
                                    assetsObj.assetModTemplateData.metaDataWithId[fld.id][getEntity] = fld;
                                }
                            });
                        }else{
                            if(assetsObj.assetModTemplateData.metaDataWithId.hasOwnProperty(getResponseArray.id)){
                                const getEntity = assetsObj.assetModTemplateData.metaDataWithId[getResponseArray.id].metainfo.entity;
                                assetsObj.assetModTemplateData.metaDataWithId[getResponseArray.id][getEntity] = getResponseArray;  
                            }
                        }
                    }
                },
                complete: function() {
                    jQuery("#attach_cmp_asst").button('reset');
                    if(options.hasOwnProperty("select2")) { options.select2.select2("val", ""); }
                    getSaveBtn && getSaveBtn.button('reset'); //NO I18N
                    jQuery(options.dialogId).dialog('close'); //NO I18N
                    if(assetActions.options.isListView){
                        assetListView.tableObject.refreshTable("refresh"); //NO I18N
                    }
                },
                error:function(response){
                    if(self.options.fromAdmin && assetActions.options.tableObjects){
                        assetActions.options.tableObjects.products.handleErrorMsg(response);
                    }else if(assetActions.options.isListView){
                        assetListView.tableObject.handleErrorMsg(response);
                    }
                },
                failedCallBack: (!options.failedCallBack && assetActions.options.isListView) ? assetActions.commonFailedCallBack : options.failedCallBack,
                ignorefailuremessage: options.ignorefailuremessage
            });
        }

        if(self.options.fromAdmin && !self.options.nopopup){
            const confirmPop = confirm(translate('sdp.asset.depreciationDetailsPopUp.forProductLevelConfirmation'));
            if(typeof confirmPop=="undefined" || confirmPop == true) {
                saveBtnFun(saveButton);
            }else{
                return false;
            }
        }else{
            saveBtnFun(saveButton);
        }
    },
    /**Error handling for bulk actions
    */
    commonFailedCallBack: function (response) {
        const list = assetListView.tableObject;
        const options = {
            response: response,
            records:  list.bulkSelect.selectedRecords,
            metainfo: list.t_obj.meta_info
        };

        messageHandling.updateFailureSummary(options, assetListView.tableObject.bulkSelect.getSelectedIDs());

        const msg = {
            noOfRecordsUpdatedMsg: translate("asset.bulk.update.success.message"),
            noOfRecordsFailedMsg: translate("asset.bulk.update.failure.message"),
            entity: translate("sdp.header.asset")
        }
        if(assetActions.options.hasOwnProperty("select2")) { assetActions.options.select2.select2("val", ""); }
        jQuery("#"+assetActions.currentAction).find(".btn-primary").button('reset'); //NO I18N
        jQuery("#"+assetActions.currentAction).dialog('close'); //NO I18N
        assetListView.tableObject.refreshTable("refresh"); //NO I18N
        const html = renderhbs(null, 'bulk-update-summary', {...msg, ...messageHandling.summary}, false, 'users', null, true, null, true);// No I18N
        messageHandling.summary.reset();
        jQuery(html).dialog({ width: 800, height: 600, modal: true, title: translate("update.summary") });
    },
    /**Display loading text in button
     * @param {integer} id
    */
    loadingtextfn : function(id) {
        const self = this;
        let btn = "";
        if(self.attachment.type==="component_attachments" || self.attachment.type==="asset_attachments"){
            btn = jQuery("#attach_cmp_asst").button('loading');
        }
        else{
            btn = jQuery(document.activeElement).button('loading');
        }
        return btn;
    },
    /**Hide "view_attached_asst_comp" button element while clicking "View attached assets"
     * @param {string} elementId
     * @param {Boolean} display
     * 
    */
    displayElement: function (elementId, display) {
        jQuery("#" + elementId).css("display", display ? "" : "none");
    },
    /**Get depreciation data for saving 
     * @param {*} select2Id
     * @returns
    */
    getDepreciationData: function (select2Id) {
        const self = this, 
              parentElement = jQuery("#add_depreciation"),
              depreciationType = parentElement.find("[name=depreciationTypeRadio]:checked").val();
        let data ={}, depreciationData = {};
        const salvageValue = jQuery("[name=salvageValue]").val(),
             depreciationSelect2 = parentElement.find(select2Id).select2("data"), //NO I18N
             depreciationValue = parentElement.find("[name=depreciationTime]").val(),
             type = parentElement.find('[name="configureDepreciation"]:checked').val() || "asset",//NO I18N
             productConfigMsg = parentElement.find("#product_dep_not_config_msg");
        let date, purchaseCost, input_data = {};

        if(productConfigMsg.is(":visible")) {//NO I18N
            productConfigMsg.animate({
                backgroundColor: "#fff1db",//NO I18N
                transition: "background-color .5s ease-in-out"//NO I18N
            }, 0);
            setTimeout(function () {
                productConfigMsg.css({'background': '', transition: "1s"});//NO I18N
            }, 700);
            data.isValid = false;
            return data;
        }

        if (salvageValue !== "") {
            depreciationData.salvage_value = salvageValue;
        }

        if (depreciationType === "depreciationPercentage" || depreciationType === "declinePercentage") {
            depreciationData.depreciation_percent = depreciationValue;
            delete depreciationData.useful_life;
        } else {
            delete depreciationData.depreciation_percent;
            depreciationData.useful_life = depreciationValue;
        }
        if(self.options.fromAdmin){
            if (depreciationType === "depreciationPercentage" || depreciationType === "declinePercentage") {
                (depreciationType === "depreciationPercentage") ? (depreciationData.depreciation_percent = depreciationValue) : (depreciationData.decline_percent = depreciationValue);// No I18N
                delete depreciationData.useful_life;
            } else {
                delete depreciationData.depreciation_percent;
                depreciationData.useful_life = depreciationValue;
            }
            type = "product";// No I18N
        }

        if(depreciationSelect2 !== null) {
            depreciationData.depreciation_type = {
                name: depreciationSelect2.text,
                id: depreciationSelect2.id
            };
        }

        if(!self.options.isListView) {
            date = jQuery("#acquisitionDate").val();//NO I18N
            purchaseCost = jQuery("#purchase_cost_cnfg_dprn").val();//NO I18N

            //As we don't have negative value for 'amount' related fields converting negative zero(if it is) zero.
            if(parseFloat(purchaseCost) === 0) {
                purchaseCost = 0;
            }

        }

        if(type==="product" && this.options.fromAdmin){ //NO I18N
            input_data["product"] = {};
            input_data["product"].depreciation_detail = depreciationData
        }
        else{
            if(type==="product"){
                input_data[self.options.moduleType]={is_asset_depreciation : false}
            }
            else{
                input_data[self.options.moduleType]={is_asset_depreciation: true, depreciation_detail : depreciationData }
            }
            if(!self.options.isListView){
                input_data[self.options.moduleType].purchase_cost = purchaseCost;
                input_data[self.options.moduleType].acquisition_date = {
                    value: new Date(getDateFromString(date)).getTime(),
                    display_value: date
                }
            }
        }
        return input_data;
    },
    /**Clear depreciation fields while loading */
    clearDepreciationInput: function () {
        const parentElement = jQuery("#add_depreciation");
        parentElement.find("[name=depreciationTime]").val("").end()
                     .find("[name=salvageValue]").val("");
        assetActions.setDepreciationInputFields(-1);
    },
    /**For reconcile popup from asset list view page */
    reconcile: function () {
        const ids = assetListView.tableObject.bulkSelect.getSelectedIDs();

        let assetType = (this.getmodDetOnly && this.getmodDetOnly.hierarchy && this.getmodDetOnly.hierarchy.child!==undefined && this.getmodDetOnly.hierarchy.child.internal_name==="Computer") ? "Workstation" : "Asset";//No I18N
        const type = assetsObj.getProductTypeName(assetsObj.assetModTemplateData.metaDataWithoutId[this.options.module].module_details.id);

        assetType = type ? type : assetType;
        if (ids.length === 2) {
            showURLInDialog(`/purchase/POReconcileConfirm.jsp?resource1=${ids[0]}&resource2=${ids[1]}&assetType=${assetType}`,`closeButton=yes,position=absmiddle,method=get,title=${translate("sdp.purchase.reconcile.confirm.header")}`);
        } else {
            showalert('failure', translate('sdp.purchase.reconcile.list.resources.select.msg'), 'isAutoHide=false'); //NO I18N
        }
    },
    
    /**Get product type  */
    getProductType: function () {
        let productType;
        if (assetsObj.isCMDB) {
            productType = assetsObj.productType
        } else {
            productType = "Workstation";// No I18N
        }

        return productType;
    },
    /**For setting width and height for popup in "Add software" action removed and added in initialization */
    getAddSoftwareDialogOptions: function () {
        return { width: 850, height: 790, modal: true };
    },
    /**For "Attach documents" action open file to upload in detail view page */
    uploadFiles: function () {
        jQuery('[data-name=assetinfo]').trigger('click');//goto details tab.
        setTimeout(function () { jQuery('#file-browser-area .ip-drag').click(); }, 500);
    },
    /**Open popup for "Change scan credential" action in listview and detail view page */
    loadChangeScanCrential: function () {
        const options = assetActions.options;
        const isListView = options.isListView;

        let url = "/WsScanSettings.do?operation=changeforsingle";// No I18N

        url += "&wsId=" + options.data.asset_id + "&action=scan";// No I18N

        if (!(self.getmodDetOnly && self.getmodDetOnly.hierarchy && self.getmodDetOnly.hierarchy.child!==undefined && self.getmodDetOnly.hierarchy.child.internal_name==="Computer")) {
            url += isListView ? "&isBulk=true" : "";// No I18N
            url += "&isWorkstation=false";// No I18N
            url += "&type=" + assetsObj.getProductTypeName(assetDetailView.data.module.id)// No I18N
        } else {
            url += "&changecred=true";// No I18N
        }

        NewWindow(url,'Scan_WS','640','260','yes','center', null, null, null, false);
    },
    /**Construct department name with site name if site is available for department */
    constructDepartmentData: function(department) {
        return e_html(department.name) + ( department.site ? ", " + e_html(department.site.name) : "" );// No I18N
    },
    /**Get current active tab in asset detail view page */
    getActiveTab: function () {
        return window.top.assetDetailView.detComp.options.panel_details.content_panel.tabs_panel.active;
    },
    /**Get url,data, field name for all actions while post opertaion 
     * @param {string} key
     * @returns
    */
    getAction: function (key) {
        const self = this,
              module = self.options.module,
              moduleApi = self.options.moduleType,
              field = moduleApi, 
              isListView = self.options.isListView;
    
        if(self.options.from === "purchase"){// No I18N
            const regex1 = RegExp('&poID=(\\d+)&?', 'g');// No I18N
            const valueArray = regex1.exec(window.location.href);
            if(valueArray.length === 2) {
                self.options.purchase_order_id = valueArray[1]
            }
        }
        switch (key) {
            case "modify_state"://NO I18N
                return {type:self.action_obj.key.method};

            case "assign_to_department"://NO I18N
                return {
                    placeholder: "-- " + translate("admp.select.dept") + " --",
                    successMsg: "sdp.inventory.assign.resources.department&site",//NO I18N
                    urlToGet: module+"/department", //NO I18N
                    entity_name: "department", //NO I18N
                    urlToSave: assetListView.tableObject.metaInfo.plural_name+"/_assign_to_department",//NO I18N
                    responseEntity: module,
                    field: field,
                    dataField: "department",//NO I18N
                    elementType: "select2",//NO I18N
                    options: {
                        formatResult : self.constructDepartmentData,
                        formatSelection : self.constructDepartmentData,
                        processResults:function(search_data,data,field){// default process result
                            search_data.push(data);
                        },
                        criteriaCallback : function(searchText){
                            let critObj = [];
                                if(searchText){
                                    critObj.push({"field":"name","condition":"like","value": searchText,"logical_operator" : "OR"}); // No I18N
                                    critObj.push({"field":"site.name","condition":"like","value": searchText,"logical_operator" : "OR"}); // No I18N
                                }
                                return critObj;
                        }
                    }
                };
            case "assign_to_site"://NO I18N
                return {
                    placeholder: translate("common.site.placeholder"),
                    successMsg: "sdp.inventory.assign.resources.site",//NO I18N
                    urlToGet: module+"/site", //NO I18N
                    entity_name: "site", //NO I18N
                    field: field,
                    urlToSave: module,
                    responseEntity: module,
                    dataField: "site",//NO I18N
                    elementType: "select2"//NO I18N
                };
            case "modify_type"://NO I18N
                return {
                    urlToGet: "products", //NO I18N
                    urlToSave: isListView ? assetListView.tableObject.metaInfo.plural_name+"/_modify_type" : assetDetailView.options.module+"/"+assetDetailView.data.id+"/_modify_type",//NO I18N
                    placeholder: "-- " + translate("sdp.inventory.resourcesconn.chooseproduct") + " --", //NO I18N
                    field: "asset_asset", //NO I18N
                    dataField: "product",//NO I18N
                    elementType: "select2",//NO I18N
                    success: function(resp) {
                        if(!isListView) {
                            if(assetDetailView.options.module != resp[assetDetailView.options.moduleType].module.api_plural_name){
                                assetsObj.module = resp[assetDetailView.options.moduleType].module.api_plural_name;
                                assetDetailView.options.module = resp[assetDetailView.options.moduleType].module.api_plural_name;
                                assetDetailView.options.moduleType = resp[assetDetailView.options.moduleType].module.api_name;
                                assetsObj.assetModTemplateData.metaDataWithoutId[assetDetailView.options.module] = assetsObj.getAssetMetaData(assetDetailView.options.module);
                            }

                            /**Remove old metadata redirect product type related detail page and trigger related left panel */
                            delete assetsObj.assetModTemplateData.metaDataWithId[assetDetailView.options.id];
                            assetsObj.isModifyType = true;
                            
                            assetsObj.redirectTo("detail",assetDetailView.options.module,"",assetDetailView.options.id);//NO I18N
                        }else{
                            const getModuleData = resp[assetListView.module];
                            if(Array.isArray(getModuleData)){
                                const getCurrentMetaData = assetsObj.assetModTemplateData.metaDataWithId;
                                getModuleData.forEach(function(){
                                    if(getCurrentMetaData.hasOwnProperty(getModuleData.id)){
                                        delete assetsObj.assetModTemplateData.metaDataWithId[assetDetailView.options.id];
                                    }
                                });
                            }else{
                                delete assetsObj.assetModTemplateData.metaDataWithId[getModuleData.id];
                            } 
                        }
                    }
                };
            case "copy"://NO I18N
                return {
                    successMsg: "ae.asset.copied.successmsg",//NO I18N
                    urlToSave: module+"/"+ self.options.data.asset_id + "/_copy",//NO I18N
                    field: "copy",//NO I18N
                    dataField: "number_copies",//NO I18N
                    elementType: "input",//NO I18N
                    type: self.action_obj.key.method,
                    onLoad: self.loadCopyAsset
                };
            case "attachment"://NO I18N
            case "attach_asset"://NO I18N
            case "attach_component"://NO I18N
            case "asset_connections"://NO I18N
                const isAssetConnection = key === "asset_connections";//NO I18N
                const isAttached = assetActions.attachment.isAttached;
                let options = {
                    type: isAssetConnection ? (isAttached ? "DELETE" : "POST") : "PUT",//NO I18N
                    urlToSave: isAssetConnection ? window.top.assetDetailView.module + "/" + window.top.assetDetailView.id + "/asset_connections" : "asset_assets",  //NO I18N
                    success: function () {
                        const assetDetView = window.top.assetDetailView;
                        assetListView.hideLoading();
                        assetListView.tableObject.refreshTable();

                        if (assetDetView && assetDetView.detComp.options.panel_details.content_panel.tabs_panel.active === "relationship") {
                            assetDetView.refreshRelationshipTab();
                        }
                    },
                    //TODO: handle bulk error message.
                    failedCallBack: function (response) {
                        const list = assetListView.tableObject;
                        const options = {
                            response: response,
                            records:  list.bulkSelect.selectedRecords,
                            metainfo: list.t_obj.meta_info
                        };

                        assetListView.hideLoading();
                        messageHandling.updateFailureSummary(options, assetListView.tableObject.bulkSelect.getSelectedIDs());

                        const isAsset = key === "attach_asset"; // No I18N
                        let updatedText, failedText, entityText;
                     

                        if(isAsset) {
                            updatedText = "ae.noOf.assets.updated"; // No I18N
                            failedText = "ae.noOf.assets.failed"; // No I18N
                            entityText = "sdp.header.asset"; // No I18N
                        } else {
                            updatedText = "ae.noOf.components.updated"; // No I18N
                            failedText = "ae.noOf.components.failed"; // No I18N
                            entityText = "ae.cmdb.newCIType.component"; // No I18N
                        }


                        const msg = {
                            noOfRecordsUpdatedMsg: translate(updatedText),
                            noOfRecordsFailedMsg: translate(failedText),
                            entity: translate(entityText)
                        }

                        jQuery("#attach_cmp_asst").button('reset');

                        assetListView.refreshTable();
                        /**TO REFRESH RELATIONSHIP TAB FOR SUCCESS */
                        const assetDetView = window.top.assetDetailView;
                        if (messageHandling && messageHandling.summary && messageHandling.summary.noOfRecordsUpdated>0 && assetDetView && assetDetView.detComp.options.panel_details.content_panel.tabs_panel.active === "relationship") {
                            assetDetView.refreshRelationshipTab();
                        }
                        /**END */
                        const html = renderhbs(null, 'bulk-update-summary', {...msg, ...messageHandling.summary}, false, 'users', null, true, null, true);// No I18N
                        messageHandling.summary.reset();
                        jQuery(html).dialog({ width: 800, height: 600, modal: true, title: translate("update.summary") });
                    },
                    ignorefailuremessage: true
                }

                if(self.attachment.isAttached && !jQuery.isEmptyObject(assetListView.tableObject)) {
                    options.successMsg = translate("ae.detach.success");
                } else {
                    options.successMsg = translate("ae.attach.success");
                }

                if(isAssetConnection && !self.attachment.isAttached) {
                    options.successMsg = translate("common.connected.success.msg");
                }
                else if(isAssetConnection){
                    options.successMsg = translate("sdp.common.disconnected.msg")
                }

                return options;
            default:
                return {}
        }
    },
    /** Refresh financial tab */
    refreshFinancialTab: function () {
        const detailView = window.top.assetDetailView;
        detailView.costObj.gotoFinancialTab();
    },
    /**Execute function while open assign owner popup
     * @param {*} assetId
     * @param {string} module
     * @param {Boolean} isAssign
     */
    openAssignOwnerPopup:function(assetId,module,isAssign){ 
        const self = this, parentElement = jQuery("#Right-Section");
        parentElement.find("#assets_common_loading").show();
        assetsObj.assetActions = assetActions;
        assetsObj.bulkEditIds = [];
        if(assetId){
            assetsObj.bulkEditIds = assetId;
        }
        else if(typeof assetListView!== 'undefined' && assetListView && assetListView.tableObject.bulkSelect && assetListView.tableObject.bulkSelect.getSelectedIDs().length>0){
            assetsObj.bulkEditIds = assetListView.tableObject.bulkSelect.getSelectedIDs().join();
            assetsObj.isPopup = true;
        }else{
            assetsObj.bulkEditIds.push(self.options && self.options.data && self.options.data.asset_id);
        }
        assetsObj.isAssignOwnerPopup = true; 
        assetsObj.isAssignOrState = isAssign;
        
        parentElement.find("#asset-form").empty();
        jQuery("#assignOwnerPopup").append("<div id='assign_owner_popup_form'></div>");
        renderhbs("#assign_owner_popup_form","asset-form-template",{//NO I18N
            isFormBasicTemp : true,
        },null,'assets');//NO I18N
        let renderAssetForm = () => {
            const options = {
                api_plural_name: module || assetsObj.module,
                id :assetId,
            
            };
            assetFormView.init(options);
        }
        if(!window.assetFormView) {
            ResourceLoader({
                js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/assets/asset-form.js"] : ["/scripts/asset_module_min.js"],//No I18N
                success :function() {
                    renderAssetForm();
                }
            });
        }else{
            renderAssetForm();
        }
        
        /**Need to fix width size by client side in sdp_zcomponent_dialog component */
        self.zcompDialogRenderFunction("assign_owner_popup_form",{
            width: "500px",//No I18N
            title : translate("sdp.inventory.assignWSToUser.assign.title"),
            position: {
                top: "50px" //No I18N
            },
            close : function() {
                self.closeDialogClearVariable();
                jQuery(window).off("beforeunload.form_assetForm");// No I18N
                assetActions = assetsObj.assetActions;
            }
        });
        jQuery("#assign_owner_popup_form").hide();
    },
    /**Execute function while closing assign owner popup */
    closeDialogClearVariable:function(){
        assetsObj.isAssignOwnerPopup = false;
        assetsObj.isPopup = false;
        assetsObj.isAssignOrState = false;
        jQuery("#assign_owner_popup_formclose").trigger('click');
        jQuery(document).find('body').removeClass('of-h');
    },
    assetCopyFormInitialization: function(linkHref,title){
        const self = this;
        const module = self.options.module;
        const isWorkstation = (self.getmodDetOnly && self.getmodDetOnly.name === "asset_computer") || (assetsObj.assetModTemplateData.metaDataWithoutId[module] && assetsObj.isComputerHierarchy(assetsObj.assetModTemplateData.metaDataWithoutId[module].hierarchy));
        jQuery("#copy").append("<div id='copy_popup'></div>");
        renderhbs("#copy_popup","asset-action-copy-template",null,null,'assets');//NO I18N
        const metainfo = {
            entity:"copy",//No I18N
            fields:{
                number_copies:{
                    type : "long",//No I18N
                    display_type : "Numeric",//No I18N
                    display_name : translate("sdp.admin.servicecatalog.copyTemplate.noOfCopies"),
                    constraints: {num_range: '1:10'},
                    mandatory : true
                }
            }
        };
        const getTitleText = translate("sdp.inventory.assets.copyassets.description");
        const templateLayout = { 
            layouts : [{
                "sections": [{//No I18N
                        custom_section: true,
                        name: "Info message",//No I18N
                        partial: () => `<div class="p10 pb0"><div class="alert alert-info icon m0" role="alert"><span class="msg"><span id="cpy_asset_info">${getTitleText}</span></span></div></div>`
                }]
                
            },
            {
                sections:[{
                    "column_count": "1",//No I18N
                    fields:[{
                        name: 'number_copies',//No I18N
                        position: {col: 1, row: 1}
                    }]
                }]
            }]
        };
        const configCopyJSON = {
            name: "copyForm",// No I18N
            entity: "copy",//No I18N
            template : templateLayout,
            metadata: metainfo,
            mode : "new",//No I18N
            customform: true,
            container: "copy-form-container",// No I18N
            formid: "copyForm",// No I18N
            save : {
                url: "/api/v3"+linkHref,//No I18N
                submit: true,
                entity: "copy",//No I18N
                type: "POST",//No I18N
                submitbutton: {
                    add: translate("sdp.common.copy")
                },
                success: "assetActions.postDataAdded",//No I18N
                cancel:function(){
                    jQuery("#copy_popupclose").trigger('click');
                },
                errorinterrupt:"assetActions.errorHandlingFunction",//NO I18N
            },
            afterRenderCallback:function(){
                jQuery('[data-fname="number_copies"]').find("label").css("width","30%");//No I18N
            }
        }
        window.$relcopyform  = new FC(configCopyJSON);
        self.zcompDialogRenderFunction("copy_popup",{width: "600px",title : translate(title)});
    },
     /**
      * Replace display name instead of field name in error handling function
      */
     errorHandlingFunction : function(response){
        var getAssetMetaData = assetsObj.assetModTemplateData && assetsObj.assetModTemplateData.metaDataWithId && assetsObj.assetModTemplateData.metaDataWithId[assetDetailView.asset_id]
        var metainfoFields = getAssetMetaData && getAssetMetaData.metainfo && getAssetMetaData.metainfo.fields
        var errorResponse = response.response_status;
        for(var i=0;i<errorResponse.length;i++){
            var errorResponseMsg = errorResponse[i].messages[0];
            var errorFieldName = errorResponseMsg.field;
            var errorField = metainfoFields && metainfoFields[errorFieldName];
            if(!errorField){
                var udfFields = metainfoFields && metainfoFields.udf_fields && metainfoFields.udf_fields.fields
                errorField =  udfFields && udfFields[errorFieldName]
            }
            var errorFieldDisplayName = errorField && errorField.display_name;
            errorResponse[i].messages[0].field = errorFieldDisplayName;
        }
        return true;
    },
    postDataAdded:function(data, form){
        showalert('success',translate('ae.asset.copied.successmsg'),'isAutoHide=true');//No I18N
        jQuery("#copy_popupclose").trigger('click');
    },
    zcompDialogRenderFunction:function(ele,options){
        const zdialogOptions = {
            width: options.width, 
            draggable: true,
            closeOnEscKey: true,
            title : options.title,
            open:function(dialog){
                jQuery(dialog.ui.container).find(".zdialog__content").css({"height":"auto","overflow-y":"auto"}); //No I18N
                jQuery(dialog.ui.container).css({"overflow":"visible","max-height":"750px"}); //No I18N
            }
        }
        options.position && (zdialogOptions.position = options.position);
         
        if(options.position){
            zdialogOptions.close = options.close;
        }
        jQuery("#"+ele).sdp_zcomponent_dialog(zdialogOptions);
    },
    loadUEMRemoteFunction : function(assetName){

        let url = "/DCToolsActions.do?operation=AssetAction&dcaction=remotecontrol";// No I18N

        url += "&wsName=" + assetName;// No I18N

        NewWindow(url,'Remote_Control', '1100', '650', 'no', 'center', null, null, null, false); // No I18N
    },
    loadChangeRemoteCredsFunction : function(assetId){

        let url = "/ConnectRemoteHost.do?action=changeCred";// No I18N

        url += "&wsId=" + assetId;// No I18N

        NewWindow(url,'Remote_Control', '400', '250', 'no', 'center', null, null, null, false); // No I18N
    },
    loadAllSoftwareInPrintPreview:function(startIndex){
        const self = this;
        let inputData = {"list_info":{"sort_order":"asc","sort_field":"software.name","row_count":100,"fields_required":["software","version","software_type","software_category","product_key","installed_on","software_usage"]}};//NO I18N
        if(inputData && inputData.list_info){
            inputData.list_info.start_index = startIndex;
        }
        sdpAjax({
            url:'/api/v3/'+self.options.module+'/'+self.options.data.asset_id+'/softwares',//NO I18N
            cache: false,
            async:false,
            data:sdpAjaxInputData(inputData),
            success: function(response)
            {
                assetActions.getSoftwareData = assetActions.getSoftwareData.concat(response.softwares);
                if(response.list_info && response.list_info.has_more_rows == true){
                    inputData.list_info.start_index = assetActions.getSoftwareData.length + 1;
                    self.loadAllSoftwareInPrintPreview(inputData.list_info.start_index);
                }
            }
        });
    }
};
