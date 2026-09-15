/* $Id$ */

"use strict";//No I18N
var assetLeftPanel = {
    /**Initialization function for asset left panel and get left panel data from api*/
    init: function() {
        /**
        * jstree node customization addon plugin start here
        */
        const self = this;
        jQuery.jstree.defaults.node_customize = {
            "key": "type", //No I18N
            "switch": {}, //No I18N
            "default": null //No I18N
        };
        jQuery.jstree.defaults.dnd.is_draggable = false;
        jQuery.jstree.plugins.node_customize = function (options, parent) {
            this.redraw_node = function (obj) {
                const node_id = typeof obj === "object" ? obj.id: obj; //No I18N
                let el = parent.redraw_node.apply(this, arguments);
                if (el) {
                    const node = this._model.data[node_id],
                          cfg = this.settings.node_customize,
                          key = cfg.key,
                          type =  (node && node.original && node.original[key]),
                          customizer = (type && cfg["switch"][type]) || cfg["default"];
                    if(customizer)
                        customizer(el, node);
                    }
                return el;
            };
        }
        /** ends here */
        self.assetData = null;
        return new Promise((resolve) => {
            sdpAjax({
                url : "/servlet/AssetApiServlet?module=asset_left_nav",//NO I18N
                type : "GET",//NO I18N
                dataType : 'json',//NO I18N
                success : function(data)
                {
                    resolve(data);
                    self.assetData = data;
                    self.render();
                }
                //TODO failure - error handling
            });
        })

    },
    /** Render dropdowns based on data getting from api and also for "Search assets" dropdown*/
    render: function() {
        const self = this,
              container = jQuery("#asset_left_nav_container"),
              nodeData = self.assetData.data;
        encodeText(nodeData);
        function encodeText(childArr) {
            childArr.forEach(function(child){
                if(child.text){
                    child.text = e_html(child.text);
                }
                if(child.children){
                    encodeText(child.children);
                }
            });
        }
        container.jstree({
            'core': {  //NO I18N
                'data': self.assetData.data, //NO I18N
                // "check_callback": true           //NO I18N
                check_callback : function(operation, node, node_parent, node_position, more) {
                    if (operation === 'move_node') { //NO I18N
                        if(more &&  more.core){
                            //TODO get position of nodes after drag and drop
                        }
                        if (node.parent == node_parent.id){
                            return true
                        }
                        else {
                            return false
                        }
                    }
                }
            },
            "search": { //NO I18N
                "case_insensitive": true, //NO I18N
                "show_only_matches": true //NO I18N
            },
            node_customize: {
                default: function(el, node) {
                    let html = "", img = "";
                    if(node) {
                        if(node.original.icon) {
                            img = '<img src="'+encodeURI(node.original.icon)+'" class="cmdb-citype-icon-treeview cmdb-icon-mono-color icon-md disp-ib pr10">'
                        } else if(node.original.api_name) {
                            img = '<img src="/images/no-image-icon.svg" class="cmdb-citype-icon-treeview cmdb-icon-mono-color icon-md disp-ib pr10">'
                        }
                        html = '<span>' + img + '</span>'+ node.text;
                        jQuery(el).find("#"+node.a_attr.id).addClass("text-wrap");
                        jQuery(el).find("#"+node.a_attr.id).html(html);
                    }
                    if(node.parent=="#" && node.children.length == 0){
                        jQuery(el).addClass("jstree-no-child");// No I18N
                    }
                    if(node.parent=="#" && node.children.length>0 && node.children.length != node.children_d.length){
                        let elementHtml = jQuery(el).html();
                        elementHtml += '<span id="js-tree-ec" class="pos-abs top10 right10 cspr icon-sm expand-arrow1 cur-ptr" rel="uitip" title="'+translate("sdp.common.expandall")+'" data-node-id="'+node.id+'" nonce="'+sdpNonce+'"></span>';
                        jQuery(el).html(elementHtml);
                    }
                    if(node.parent=="#"){
                        jQuery(el).addClass("jstree-head-node");// No I18N  
                    }
                }
            },
            plugins: [
                "dnd", //NO I18N
                "search", //NO I18N
                "types",  //NO I18N
                "node_customize" //NO I18N
            ],
        });
        const assetSelectElement = jQuery('#search-product-type');
        let load_search = true;
        assetSelectElement.select2({
            placeholder : getMessageForKey('sdp.admin.settings.search.text'), // No I18N
            multiple:true,
            data: [],
            formatNoMatches: getMessageForKey('common.loading')// No I18N
        }).addClass("s2-custom-p0");
        assetSelectElement.on("select2-focus", function(){
            if(load_search){
                load_search = false;
                sdpAjax({
                    url : "/servlet/AssetApiServlet?module=asset_left_nav_search",//NO I18N
                    type : "GET",//NO I18N
                    dataType : 'json',//NO I18N
                    success : function(data)
                    {
                        assetSelectElement.select2({
                            cache: data.data,
                            closeOnSelect : true,
                            multiple:true,
                            allowClear: true,
                            placeholder : getMessageForKey('sdp.admin.settings.search.text'), // No I18N
                            minimumInputLength: 1,
                            data: data.data,
                            formatResult: self.formatResult,
                            dropdownCssClass: "s2-custom-p0 text-wrap" // No I18N
                        });
                        assetSelectElement.select2("open");// No I18N
                    },
                    failure : function(){
                        load_search = true;
                        //TODO error handling
                    }

                });
            }
        });
        assetSelectElement.on("select2-close",function(){// No I18N
            assetSelectElement.trigger("select2-blur");// No I18N
        });
        setTimeout(function() {
            let id = getUrlParameterByName("module");// No I18N
            if(!id){
                id = self.getObjectId(nodeData);
            }
            self.selectItem(id);
            self.initEvents();
            jQuery('#asset_left_nav_container').off('click','[data-node-id]').on('click','[data-node-id]',function(event){// No I18N
                const getNodeId = jQuery(this).attr("data-node-id");
                assetLeftPanel.expandOrCollapseAll(event,document.getElementById(getNodeId));
            });
        }, 1);
        const ht = jQuery(window).height() - ( jQuery('#header-placeholder').outerHeight() + is_chathgt + 70 );
        jQuery('#asset_left_nav_container').css('height',ht).children(".jstree-container-ul").addClass('jstree-container-ul jstree-children jstree-no-dots jstree-no-icons jstree-contextmenu');//NO I18N
    },
    /**
     * Execute function to expand and collapse functionality in asset left panel
     * @param {*} event 
     * @param {*} node 
     */
    expandOrCollapseAll: function (event, node) {
        event.stopPropagation();
        jQuery("#asset_left_nav_container").jstree().deselect_all(true);
        const nodeData = jQuery("#asset_left_nav_container").jstree()._model.data[node.id];
        const element = jQuery("#asset_left_nav_container").find("#"+node.id).find("#js-tree-ec");
        let toggleNode = (element, nodeData, isOpen) => {
            const action = isOpen ? "collapseall" : "expandall",//NO I18N
                  iconClass = isOpen ? "collapse-arrow1" : "expand-arrow1",//NO I18N
                  treeMethod = isOpen ? "open_node" : "close_node";//NO I18N
            element.prop('title', translate(`sdp.common.${action}`)).uitooltip({//NO I18N
                content: translate(`sdp.common.${action}`),
                track: true,
                tooltipClass: "uitip" //NO I18N
            });
            element.prop('class', `pos-abs top10 right10 cspr icon-sm ${iconClass} cur-ptr`); //NO I18N
           
            let node_arr = [nodeData.id].concat(nodeData.children_d);
            jQuery("#asset_left_nav_container").jstree(treeMethod, node_arr); //NO I18N
           
            element.prop('isToggle', isOpen ? 'false' : 'true'); //NO I18N
        }


        // at first time prop is not set for isToggle
        if (element.prop('isToggle') == undefined || element.prop('isToggle') == 'true') {
            toggleNode(element, nodeData, true);
        } else {
            toggleNode(element, nodeData, false);
        }
    },
    /**
     * Check and trigger related asset list view based on clicked asset in left panel
     * @param {*} data 
     * @returns 
     */
    getObjectId: function(data){
        const pathName = window.location.pathname + window.location.search;
        if(!sdp_app.IS_REMOTE_SERVER){
        for(let i = data.length-5;i<data.length;i++){
            if(data[i].children) {
                for(let j = 0;j<data[i].children.length;j++){
                    const child = data[i].children[j];
                    if(pathName == child.href){
                        return child.id;
                    }
                    if(child.children){
                        for(let k = 0;k<child.children.length;k++){
                            const grandchild = child.children[k];
                            const getCurrMod = this.getSelectedLink();
                            if(grandchild.id==(getCurrMod && getCurrMod.modules)){
                                const baseUrl = grandchild ? grandchild.href ? grandchild.href.split("?")[0] : '' : '';
                                if(getCurrMod && getCurrMod.baseUrl && baseUrl === getCurrMod.baseUrl){
                                    return grandchild.id;
                                }
                            }
                            else if(grandchild.href){
                                const grandchildlink = grandchild.href.split("#")[0];
                                if((pathName == grandchildlink)){
                                    return grandchild.id;
                                }
                            }
                        }
                    }
                }
                /* additional loop function used only url not matching in above condition (for rendering another page inside a page) */
                const getCurrMod = this.getSelectedLink();
                if(data[i].tabName==(getCurrMod && getCurrMod.modules)){
                    for(let j = 0;j<data[i].children.length;j++){
                        const child = data[i].children[j];
                        const baseUrl = child ? child.href ? child.href.split("?")[0] : '' : '';
                        if(getCurrMod && getCurrMod.baseUrl && baseUrl === getCurrMod.baseUrl){
                            return child.id;
                        }
                    }
                }
                /* end of the function */
            }
            else{
                if(pathName == data[i].href){
                    return data[i].id
                }
            }
        }
        }
    },
    /**
     * Giving baseUrl of array of objects with param key and values
     * @param {string} tabName 
     * @returns 
     */
    getSelectedLink: function() {
        const getWindowPath = window.location.pathname;
        const getOnlyString = getWindowPath.split(".")[0].split("/")[1];
        const getBaseLinks = {
            "BarcodeScanAction":{//NO I18N
                 baseUrl : "/BarcodeScanAction.do",//NO I18N
                 modules : "barcode"//NO I18N
             },
             "AssetLoanListView":{//NO I18N
                 modules : "asset_loan",//NO I18N
                 baseUrl : "/AssetLoanListView.do"//NO I18N
             },
             "AssetLoanDef":{//NO I18N
                 modules : "asset_loan",//NO I18N
                 baseUrl : "/AssetLoanListView.do"//NO I18N
             },
             "SWWorkstationListView":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/SoftwareListView.do"//NO I18N
             },
             "ViewWSDetails":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/SoftwareLicenseListView.do"//NO I18N
             },
             "HotfixDetailView":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/HotfixListView.do"//NO I18N
             },
             "AssetLoanDef":{//NO I18N
                 modules : "loan_registry",//NO I18N
                 baseUrl : "/AssetLoanListView.do"//NO I18N
             },
             "SoftwareListView":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/SoftwareListView.do"//NO I18N
             },
             "SoftwareListViewAction":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/SoftwareListView.do"//NO I18N
             },
             "LicenseAgreement":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/LicenseAgreement.do"//NO I18N
             },
             "SoftwareLicense":{//NO I18N
                 modules : "software",//NO I18N
                 baseUrl : "/SoftwareLicenseListView.do"//NO I18N
             }
        }
        return getBaseLinks[getOnlyString];
    },
    /* end of the function */
    /**
     * Add active class for selected item in left panel
     * @param {*} id 
     */
    selectItem: function(id) {
        jQuery('#search-product-type').select2("data",""); // No I18N
        const container = jQuery("#asset_left_nav_container"); // No I18N
        const jsTree = container.jstree();

        jsTree.deselect_all(true); //reset existing selection
        container.jstree("_open_to", { id: id }); // No I18N
        container.jstree("select_node", { id: id }); // No I18N
        
        let nodeData = jsTree._model.data[id];
        if(id && !nodeData) {
            window.location.reload();
        }
        let nodeId = id;
        for(let i=0;nodeData && nodeData.parents && i<nodeData.parents.length;i++){
            if(nodeData.parents[i]!="#"){
                nodeId = nodeData.parents[i];
            }else{
                break;
            }
        }
        jQuery("#"+nodeId).addClass("active");// No I18N
    },
    /**Initiate onclick events for items in left panel */
    initEvents: function() {
        const self = this;
        jQuery('#asset_left_nav_container').off("select_node.jstree").on("select_node.jstree",function(e,data){ // No I18N
            addPersonalization("assets_current_tab", {id:data.node.id});// No I18N
            assetLeftPanel.prev_href = window.location.href;
            const getSelFilterArr = assetsObj && assetsObj.filter_value;  
            assetsObj.assetListView = null;
            if(typeof assetFilter!='undefined') { assetFilter.listview= null};
            self.renderListView(data.node);
            if(data.node && data.node.original && data.node.original.id){
                const skeletonLoader = `<div id="asset_list_skloader" class="skeleton-container active"><div class="skeleton-loading mt0"><div class="row"> <div class="col-sm-12"><div id="skeleton_inner" class="skeleton text-loader" style="height:80vh;margin-left:10px"></div></div></div></div></div>`;
                jQuery("#asset-list-view").html(skeletonLoader);
            }
            if(sdp_app.IS_AE && !sdp_app.IS_REMOTE_SERVER){
                if(data.node && data.node.original && data.node.original.id && !data.node.original.id.includes("Software")){
                    self.personalize(data.node.original.href);
                }
            }else{
                data.node && data.node.original && self.personalize(data.node.original.href);
            }

            /**To retain selected filter value */
            if(data.node.hasOwnProperty("id") && assetsObj.previous_module!==undefined && (data.node.id == assetsObj.previous_module) && getSelFilterArr && getSelFilterArr.length>0){
                assetsObj.retainSelectedFilterValues(getSelFilterArr);
            }else{
                assetsObj.filter_value = [];
                assetsObj.filter_criteria_data = {};
            }
        });
        /**Trigger all assets click  */
        jQuery("#asset_assets_anchor,#asset_computers_anchor").off('click.asset_name_btn').on('click.asset_name_btn',function(){// No I18N
            var isGlobalSearch = typeof assetListView!='undefined' && assetListView.tableObject && assetListView.tableObject.t_obj && assetListView.tableObject.t_obj.table_info.list_info.gsearch;// No I18N
            if(isGlobalSearch){
                assetsObj.filter_value = [];
                assetsObj.filter_criteria_data = {};
                assetsObj.redirectToEntityList(assetsObj.module); 
            }
        });
        /**End */
        jQuery('#search-product-type').off("change.search_product").on("change.search_product",function(e){ // No I18N
            const element = jQuery(this);
            assetLeftPanel.selectItem(element.select2("close").val());// No I18N
            element.select2("data", "");// No I18N
            jQuery('#search-product-type').trigger("focusout");// No I18N
        });
        /**Expand groups while clicking group in listview */
        if(sdp_user.CLIENT_CONF.assets_current_tab && sdp_user.CLIENT_CONF.assets_current_tab.id=="groups"){      
            if(!jQuery("#groups").hasClass("jstree-open")){
                jQuery("#groups .jstree-icon").trigger('click');
            }  
        }
        /**End */
    },
    /**
     * Format text in left panel with image and display name
     * @param {*} data 
     * @returns 
     */
    formatResult: function(data){
        if(data.text!=""){
            if(data.path && data.path.length>0){
                let parentPath =""
                for(i=0;i<data.path.length-1;i++){
                    parentPath+=data.path[i]+" >> "
                }
                parentPath+=data.path[data.path.length-1]+" "
                return "<div>"+e_html(data.text)+"<span class='disp-b text-color5 font-xsmall disabled '>"+e_html(parentPath)+"</span></div>";
            }
            else{
                return e_html(data.text)
            }
        }
    },
    personalize: function(url) {
        addPersonalization("assets_current_url", {// No I18N
            url: url
        });

        jQuery('[tab-name="Assets"]').prop("href", url);// No I18N
    },
    prev_href: "",
    /**
     * Based on global search seleceted related asset in left panel
     */
    refreshGlobalSearchSelection: function(){
        const prevModule = getUrlParameterByName("module",assetLeftPanel.prev_href),//No I18N
              currentModule = getUrlParameterByName("module"),//No I18N
              getModuleDetails = assetsObj.assetModTemplateData.metaDataWithoutId[currentModule],
              getParentModule = getModuleDetails && assetsObj.isComputerHierarchy(getModuleDetails.hierarchy);
        if (currentModule !== prevModule) {
            if (getParentModule || currentModule === "asset_computers"){
                selectedSearchItem('Computer', 'asset_computer');//No I18N
            } else {
                selectedSearchItem('Assets', 'assets');//No I18N
            }
        }
    },
    /**
     * Render related asset list view
     * @param {*} node 
     * @returns 
     */
    renderListView: function(node) {
        let data;
        if(!node || !node.original) {
            return; //no need to render list from left panel on load.
        }
        data = node.original;
        this.displayName = e_html(data.text);
        if(data.id && data.api_name) {
            assetsObj.redirectTo("list", data.id); // No I18N
        } else  if(data.href){
            window.location.href = data.href;
        }
        jQuery('#asset_left_nav_container').jstree("toggle_node", jQuery("#" + node.id));//NO I18N
        assetLeftPanel.refreshGlobalSearchSelection();
    }
}
