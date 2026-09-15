var $ciList = {
    selectedView: 'active', //No I18N
    // *********** CMDB Left panel related methods starts ************
        /**
     * init JSTree in CMDB left panel
     * @param {*} entity
     */
    getAllCItypeList: function (entity) {
        const _self = this;
        _self.setHeight();
        sdpAjax({
            url: "/jstree/JSTreeServlet?entity=" + entity, //NO I18N
            success: function (data) {
                setTimeout(() => {
                    jQuery('#JSTree').jstree({
                        core: {
                            data: data,
                            force_text: true,
                            themes: { dots: false }
                        },
                        node_customize: {
                            default: function (el, node) {
                                _self.constructNodeHtml(el, node);
                            }
                        },
                        sort : function(a, b) {
                            return this.get_node(a).text.toLowerCase() < this.get_node(b).text.toLowerCase() ? -1 : 1;
                        },
                        plugins: ["node_customize","sort"] //NO I18N
                    });
                    _self.addJSTreeOnChangeEvent();
                }, 100);
            }
        });
    },
    /**
     * set height for the JSTree
     */
    setHeight: function () {
        const height = jQuery(window).height() - (jQuery("#header-placeholder").outerHeight() + is_chathgt + 170);
        jQuery('#JSTree').css('height', height); //NO I18N
    },
    /** construct the node in the tree tree */
    constructNodeHtml: function (el, node) {
        let html = "";
        if (node) {
            html = '<span><img src="' + e_attr(node.icon) + '" class="cmdb-citype-icon-treeview cmdb-icon-mono-color icon-md disp-ib pr10" style=""></span>' + e_html(node.text);
            jQuery(el).find("#" + node.a_attr.id).html(html);
        }
    },
    /**
     * add onchange event listener for the JSTree
     */
    addJSTreeOnChangeEvent: function () {
        const _self = this;
        jQuery('#JSTree').off("changed.jstree").on("changed.jstree", function (e, data) { //NO I18N
            if (data && data.node && data.node.original) {
                addPersonalization("cmdb_current_url", {    //No I18N
                    type: data.node.original.api_plural_name,
                    api_name: data.node.original.name,
                    type_id: data.node.id
                });
            }
            $ciCommon.removeSearchText();
            _self.loadRightPanel('cilist', data.instance.get_node(data.selected[0]).original.api_plural_name, data.instance.get_node(data.selected[0]).original.name, function () {
                $ciCommon.resizeWindows();
            });
        });
        $ciCommon.getAPIName() != "cmdb" && $ciCommon.getAPIName() != null && _self.makeNodeSelect($ciCommon.getModuleId());   //NO I18N
    },
    /**
     * expand or collapse all the nodes in the JSTree
     */
    expandOrCollapseAll: function () {
        event.stopPropagation();
        // at first time prop is not set for isToggle
        if (jQuery("#js-tree-ec").prop('isToggle') == undefined || jQuery("#js-tree-ec").prop('isToggle') == 'true') {
            jQuery("#js-tree-ec").prop('title', translate("sdp.common.collapseall")).uitooltip({
                content: translate("sdp.common.collapseall")
            });
            jQuery("#js-tree-ec").prop('class', 'fr cspr icon-sm collapse-arrow1'); //NO I18N
            jQuery("#JSTree").jstree("open_all"); //NO I18N
            jQuery("#js-tree-ec").prop('isToggle', 'false'); //NO I18N
        } else {
            jQuery("#js-tree-ec").prop('title', translate("sdp.requests.viewrequest.expandall")).uitooltip({
                content: translate("sdp.requests.viewrequest.expandall")
            });
            jQuery("#js-tree-ec").prop('class', 'fr cspr icon-sm expand-arrow1'); //NO I18N
            jQuery("#JSTree").jstree("close_all"); //NO I18N
            jQuery("#js-tree-ec").prop('isToggle', 'true'); //NO I18N
        }
    },
    /**
     * trigger the node in the JSTree to load the CI list
     * @param {*} id
     */
    triggerNode: function (id) {
        this.deselectNode();
        const parentIDs = jQuery("#JSTree").jstree().get_path(id, null, true);
        parentIDs.forEach(function (item) {
            jQuery("#JSTree").jstree("open_node", jQuery('#' + item)); //NO I18N
        });
        // scroll to the selected node
        jQuery('#JSTree').jstree(true).get_node(id, true).children('.jstree-anchor').focus();   //NO I18N
        jQuery("#JSTree").jstree("select_node", jQuery('#' + id)).trigger("select_node.jstree"); //NO I18N
    },
    /**
     * trigger the node in the JSTree to load the CI list
     * @param {*} id
     */
    makeNodeSelect: function (id) {
        this.deselectNode();
        const parentIDs = jQuery("#JSTree").jstree().get_path(id, null, true);
        parentIDs.forEach(function (item) {
            jQuery("#JSTree").jstree("open_node", jQuery('#' + item)); //NO I18N
        });
        jQuery("#JSTree").jstree("select_node", jQuery('#' + id),true); //NO I18N
    },
    /**
     * deselect the node in the JSTree
     */
    deselectNode: function () {
        if(jQuery("#JSTree").jstree(true)) {
            jQuery("#JSTree").jstree().deselect_all(true);
        }
    },
    /**
     * load business view or All CI list based on the view
     * @param {*} CurrentObj
     * @param {*} view
     */
    switchLeftPanelView(CurrentObj, view) {
        const _self = this;
        jQuery(CurrentObj).closest('.cmdb-hierarchy').find('.type-list .ci-type').removeClass('active'); //NO I18N
        jQuery(CurrentObj).find('.ci-type').addClass('active'); //NO I18N
        if (view === "businessview") {
            this.deselectNode();
            addPersonalization("cmdb_current_url", {    //No I18N
                type: "null"    //No I18N
            });
            _self.loadRightPanel('businessview'); //NO I18N
        } else {
            _self.loadAllCIList();
        }
    },
    /**
     * show or hide the left panel
     * @param {*} tab
     */
    showHideLeftPanel: function (tab) {
        const _self = this;
        jQuery("#ci-left-panel").toggleClass('slider-wrap-close');   //NO I18N
        jQuery("#JSTree").toggleClass('hide');   //NO I18N
        setTimeout(() => {
            _self.adjustCITableHeight();
        }, 500);
    },
    /**
     * init the left panel
     */
    initLeftPanel: function () {
        const _self = this;
        renderhbs("#cmdb-left-panel-div", "ci-left-panel", null, false, "cmdb", undefined, false,function(){    //No I18N
            jQuery("#cmdb-show-panel").off("click").on("click",function(){    //No I18N
                _self.showHideLeftPanel('show');   //No I18N
            });
            jQuery("#cmdb-hide-panel").off("click").on("click",function(){    //No I18N
                _self.showHideLeftPanel('hide');  //No I18N
            });
            jQuery("#ci-left-businessview").off("click").on("click",function(){    //No I18N
                $ciCommon.removeSearchText();
                _self.switchLeftPanelView(this, 'businessview'); //No I18N
            });
            jQuery("#ci-left-jstree").off("click").on("click",function(){    //No I18N
                $ciCommon.removeSearchText();
                _self.switchLeftPanelView(this, 'cilist');   //No I18N
            });
            jQuery("#js-tree-ec").off("click").on("click",function(){    //No I18N
                _self.expandOrCollapseAll();
            });
            jQuery("body").find("#cmdb-svg-code").load('/images/shadow/cmdb-shadow.html'); //NO I18N
            _self.initCITypeSearchForLeftPanel();
            jQuery("#divHolder").addClass('hide'); //NO I18N
            jQuery("#divHolder").prev().removeClass("pr5"); //NO I18N
        });
    },
    /**
     * init the CI type search with hierarchySelect2
     */
    initCITypeSearchForLeftPanel: function () {
        const _self = this;
        const options = {
            id: "search-ci-type", //No I18N
            return_value: "name", //No I18N
            entity: "module", //No I18N
            multiple: true,
            closeOnSelect : true,
            inputData: {
                list_info: {
                    "fields_required": ["parent", "name", "api_plural_name", "display_name"], //No I18N
                    "start_index": 1, //No I18N
                    "row_count": 100, //No I18N
                    "sort_field": "display_name", //No I18N
                    "sort_order": "asc", //No I18N
                    "search_criteria": {    //No I18N
                        "field": "name",    //No I18N
                        "value": "cmdb",    //No I18N
                        "condition": "is not"   //No I18N
                    }
                }
            },
            url: "/api/v3/cmdb/module", //No I18N
            placeHolder: translate("ae.cmdb.searchcitype"), //No I18N
            displayField: "display_name", //No I18N
        };
        hierarchySelect2.init(options);
        jQuery('#search-ci-type').off("change").on("change",function(e){ // No I18N
            const element = jQuery(this);
            _self.triggerNode(element.val());
            element.select2("data", "");// No I18N
            element.trigger("focusout");// No I18N
        });
    },
    /**
    * adjust the CI table height
    */
    adjustCITableHeight : function() {
        const list_view_id =  "cmdb_div";   //No I18N
        if(typeof list_view_id !== "undefined"){
            const tableclass = jQuery("#"+list_view_id);
            const table_w = jQuery(window).width() - jQuery("#cmdb-left-panel").width() - 23;
            tableclass.css({'width': ( table_w - 2) + 'px'});   //No I18N
            const parentDiv = jQuery("#ci-listview-container");
            parentDiv.css({'width': (table_w - 2)+'px'});   //No I18N
        }
    },
    // *********** CMDB Left panel related methods ends ************


    // *********** CMDB Right panel related methods starts ************

    tableObject: null,
    listInfo: null,
    /**
     * load the right panel based on the tab
     * if tab is businessview, load the business view
     * if tab is cilist, load the CI list
     * @param {*} tab
     * @param {*} api_plural_name
     * @param {*} api_name
     * @param {*} callback
     */
    loadRightPanel: function (tab, api_plural_name, api_name, callback) {
        if (tab === "businessview") {
            jQuery('#ci-Right-Section').html('');
            jQuery('#business-Right-Section').load("/cmdb/BusinessViewsListView.jsp"); //NO I18N
            $ciCommon.pushingStateURL('businessview'); //NO I18N
        } else if (tab === "cilist") {  //No I18N
            jQuery('#business-Right-Section').html('');
            jQuery('#ci-left-businessview').closest('.cmdb-hierarchy').find('.type-list .ci-type').removeClass('active'); //NO I18N
            jQuery('#ci-left-jstree').find('.ci-type').addClass('active'); //NO I18N
            const html = `
            <div class="tablelist">
                <div class="p10 mt1">
                    <div class="disp-flex valign-center flex-wrap pt5 pb5 mt2" id="ci-header-menu"></div>
                </div>
                <hr class="m0">
                <div>
                    <div id="ci-listview-container"></div>
                </div>
            </div>
            `;
            jQuery('#ci-Right-Section').html(html);
            $ciCommon.setMetadata(api_plural_name,function(){
                if (!$ciCommon.entityData.links){
                    $ciCommon.setLinks(api_plural_name,function(){
                        $ciList.init(api_plural_name, api_name, callback);
                    });
                }
                else{
                    $ciList.init(api_plural_name, api_name, callback);
                }
            });
        }
    },
    /**
     * load All CI list view
     */
    loadAllCIList: function () {
        $ciList.deselectNode();
        jQuery('#business-Right-Section').empty();
        addPersonalization("cmdb_current_url", {    //No I18N
            type: "cmdb"    //No I18N
        });
        const html = `
            <div class="tablelist">
                <div class="p10">
                    <div class="disp-flex valign-center flex-wrap pt5 pb5 mt2" id="ci-header-menu"></div>
                </div>
                <hr class="m0">
                <div>
                    <div id="ci-listview-container"></div>
                </div>
            </div>
            `;
        jQuery('#ci-Right-Section').html(html);
        $ciCommon.setMetadata("cmdb",function(){    //No I18N
            if (!$ciCommon.entityData.links){
                $ciCommon.setLinks("cmdb",function(){   //No I18N
                    $ciList.init("cmdb", "cmdb");
                });
            }
            else{
                $ciList.init("cmdb", "cmdb");
            }
        });
    },
    /**
     * render modify citype popup
     */
    modifyCIType: function () {
        const _self = this;
        jQuery("#popup_div").append('<div id="modify-citype-container"></div>');
        renderhbs("#modify-citype-container", "modify-citype-template", null, false, "cmdb", undefined, false, function(){  //No I18N
            _self.loadCITypesDropdownToModifyCIType();
            jQuery("#save_modify_ci_type").off("click").on("click",function(){  //NO I18N
                _self.saveModifyCIType();
            });
            jQuery("#modify_ci_type_cancel").off("click").on("click",function(){    //NO I18N
                _self.modifyCITypeDialog.sdp_zcomponent_dialog("close");    //No I18N
            });
            const element = jQuery("#modify_ci_type");
            const options = {
                draggable: true,
                title: translate("ae.cmdb.inventory.cmdblistView.modifyCIType"), //NO I18N
                height: "25%", //No I18N
                width: "420",
                className: 'sdpzcompdialog cust-width'  //No I18N
            };
            _self.modifyCITypeDialog = element.sdp_zcomponent_dialog(options);
        });
    },
    /**
     * load citypes dropdown in modify citype popup
     */
    loadCITypesDropdownToModifyCIType: function () {
        const options = {
            url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/_modify_ci_type", //No I18N
            entity: "ci_types", //No I18N
            id: "ci_type_filter_select2", //No I18N
            shouldSelectAnAllowedValue: true,
            displayField: "display_name" //NO I18N
        }
        hierarchySelect2.init(options);
    },
    /**
     * save event for modify citype
     * @returns
     */
    saveModifyCIType: function () {
        const _self = this;
        const selectedIds = $ciList.ciListTableObject.bulkSelect.getSelectedIDs();
        if (jQuery('#ci_type_filter_select2').select2('data') == null) {
            alert(translate("ae.cmdb.selectcitype"));
            jQuery('#ci_type_filter_select2').select2('open'); //NO I18N
            return false;
        }
        const toModifyCITypeID = jQuery('#ci_type_filter_select2').select2('data').id;    //No I18N
        sdpAjax({
            method: 'put', //NO I18N
            url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/_modify_ci_type?ids=" + selectedIds.join(','), //No I18N
            data : sdpAjaxInputData({ci_type : { id : toModifyCITypeID}}),
            success: function (data) {
                const result = data.response_status[0].status;
                _self.modifyCITypeDialog.sdp_zcomponent_dialog("close");    //No I18N
                if (result === "success") //NO I18N
                {
                    showalert("success", translate("sdp.cmdb.modify.citype.success"), "isAutoHide=true"); // No I18N
                    $ciList.refresh();
                } else {
                    showalert("failure", result, "isAutoHide=true"); // No I18N
                }
            },
            beforeSend: () => {
                jQuery("#save_modify_ci_type").button("loading"); //No I18N
            },
            complete: () => {
                jQuery("#save_modify_ci_type").button("reset"); //No I18N
            }
        });
    },
    /**
     * to render mark as CI popup
     */
    markAsCI: function () {
        const _self = this;
        renderhbs("#popup_div", "mark-as-ci-template", null, false, "cmdb", undefined, false, function(){   //No I18N
            jQuery("#mark_as_ci_next").off("click").on("click",function(){  //No I18N
                _self.markAsCIWizardFlow('step2');  //No I18N
            });
            jQuery("[name=mark_as_ci_cancel]").off("click").on("click",function(){  //No I18N
                _self.markAsCIDialog.sdp_zcomponent_dialog("close");    //No I18N
            });
            _self.loadSourceModuleForMarkAsCI($ciCommon.firstLinkedEntity);
            _self.loadDestinationModuleForMarkAsCI();
            const element = jQuery("#MarkAsCI-parent");
            const options = {
                modal: true,
                width: '50%',  //No I18N
                height: '85%', //No I18N
                position : "center",    //No I18N
                className: 'sdpzcompdialog cust-width cust-height', //No I18N
                title: translate("sdp.cmdb.mark.as.ci"), //NO I18N
                resizable: false,
                close : function(){
                    delete _self.listInfo;
                }
            };
            _self.markAsCIDialog = element.sdp_zcomponent_dialog(options);
        });
    },
    /**
     * load source module dropdown
     * by default select first value
     */
    loadSourceModuleForMarkAsCI: function (selectedValue) {
        jQuery("#source_module").sdp_select2({
            value: selectedValue,
            placeholder: translate("sdp.cmdb.markasci.source.module.select"), // No I18N
            url: [{
                url: "/api/v3/cmdb/linked_entity", //NO I18N
                field: 'linked_entity', //NO I18N
                list_info: {
                    search_criteria : [{
                        field : "name", //NO I18N
                        condition : "is not",   //NO I18N
                        value : "asset_sub_switch_port" //NO I18N
                    }]
                },
            }],
            formatResult: function (item) {
                return $ciCommon.getDisplayNameAsReturnField(item);
            },
            formatSelection: function (item) {
                return $ciCommon.getDisplayNameAsReturnField(item);
            },
            processResults: function (search_data, data, field) { // default process result
                search_data.push(data);
            }
        });
    },
    /**
     * load destination module dropdown
     */
    loadDestinationModuleForMarkAsCI: function () {
        const options = {
            url: "/api/v3/cmdb/module", //No I18N
            entity: "module", //No I18N
            return_value: "name", //No I18N
            id: "destination_module", //No I18N
            placeHolder: translate("ae.citype.select.placeholder"), // No I18N
            shouldSelectAnAllowedValue: true,
            displayField: "display_name", //NO I18N
            inputData: {
                list_info: {
                    "fields_required": ["parent", "name", "api_plural_name", "display_name"], //No I18N
                    "start_index": 1, //No I18N
                    "row_count": 100, //No I18N
                    "search_criteria": {    //No I18N
                        "field": "name",    //No I18N
                        "value": "cmdb",    //No I18N
                        "condition": "is not"   //No I18N
                    }
                }
            },
        }
        hierarchySelect2.init(options);

    },
    /**
     * step 1 -> source to destination mapping page
     * step 2 -> select items to mark as CI
     * step 3 -> summary page
     * @param {*} action
     * @returns
     */
    markAsCIWizardFlow: function (action) {
        const _self = this;
        if (action == 'step2') {
            if (jQuery('#source_module').val() == '') {
                jQuery('#ci-markaswiz-sourceModule-errormsg').text(translate("sdp.cmdb.markasci.source.value.provide"));
                return false;
            } else if (jQuery('#destination_module').val() == '') {
                jQuery('#ci-markaswiz-destinationModule-errormsg').text(translate("sdp.cmdb.markasci.destination.value.provide"));
                return false;
            }
        } else if (action == 'step3') { //No I18N
            if (_self.markAsCITableObject.bulkSelect.selectedRecordsCount == 0) {
                showalert("failure", translate("common.delete.atleastone"), "isAutoHide=true"); // NO I18N
                return false;
            }
        }
        if (action == 'step1') {
            _self.hideMarkAsCIList();
            jQuery('#SrcAndDest').show();
            jQuery('#MarkAsCI').find('ul.step-progress li:lt(1)').addClass('active');
        } else if (action == 'step2') { //No I18N
            _self.hideMarkAsCIList();
            jQuery('#ci-markaswiz-sourceModule-errormsg').text('');
            jQuery('#ci-markaswiz-destinationModule-errormsg').text('');
            jQuery('#SelctItems').show();
            jQuery('#MarkAsCI').find('ul.step-progress li:lt(2)').addClass('active');
            jQuery('#source_step2').text(jQuery('#source_module').select2('data').display_name); //NO I18N
            jQuery('#destination_step2').text(jQuery('#destination_module').select2('data').display_name); //NO I18N
            jQuery("#CIMarkTableListBtn").attr('data-link', jQuery('#source_module').select2('data').api_plural_name); //NO I18N
            jQuery("#mark_as_ci_previous").off("click").on("click",function(){  //No I18N
                delete _self.listInfo;
                _self.markAsCIWizardFlow('step1');  //No I18N
            });
            jQuery("#CIMarkTableListBtn").off("click").on("click",function(){   //No I18N
                _self.markAsCIWizardFlow('step3');  //No I18N
            });
            jQuery("[name=mark_as_ci_cancel").off("click").on("click",function(){   //No I18N
                _self.markAsCIDialog.sdp_zcomponent_dialog("close");    //No I18N
            });
            _self.loadListViewForMarkAsCI(jQuery('#source_module').select2('data').api_plural_name); //NO I18N
        } else {
            _self.addCI();
        }
    },
    hideMarkAsCIList: function () {
        jQuery('[name=current-tab]').hide();
        jQuery('#MarkAsCI').find('ul.step-progress li').removeClass('active');
    },
    /**
     * load list view for mark as CI
     * @param {source module list to be loaded} api_plural_name
     */
    loadListViewForMarkAsCI: function (api_plural_name) {
        const _self = this;
        const data = {
            key_name: $ciCommon.getCallBackName(api_plural_name),
            api_name: api_plural_name,
            isMarkAsCI: true
        };
        $ciCommon.otherModuleLoaded = api_plural_name;
        $ciCommon.setOtherModuleFields(api_plural_name,function(){
            renderhbs("#mark-as-ci-listview-container", "cmdb-other-module-listview", data, false, "cmdb", undefined, false,function(){  //No I18N
                $ciCommon.initSiteFilter(api_plural_name,null,"site-other-module-filter"); //No I18N
            });
            WebComponents.instancePool["webc-mark-as-ci-list"] = undefined; //remove reference to re render list. // No I18N
            WebComponents.render("webc-mark-as-ci-list");
            _self.markAsCITableObject = WebComponents.getInstance("webc-mark-as-ci-list"); // No I18N
        });
    },
    /**
     * after render mark as list view
     * @param {*} content
     */
    afterBodyRenderRightPanel: function (content) {
        const _self = this;
        jQuery("#site-other-module-filter").off("change").on("change", function () {    //No I18N
            _self.applySearchCriteriaBasedOnFilter(false);
        });
        jQuery("#product_type_select2").off("change").on("change", function () {    //No I18N
            _self.applySearchCriteriaBasedOnFilter(true);
        });
        const productTypeId = jQuery("#product_type_select2").data("id"); //No I18N
        const opts = {
            url : "/api/v3/cmdb/assets/module", //No I18N
            inputData: {
                list_info: {
                    start_index: 1,
                    row_count: 100,
                    fields_required: ["name", "parent", "display_name", "api_plural_name", "api_name"], //No I18N
                    search_criteria: {
                        "field": "parent",  //No I18N
                        "value": null,  //No I18N
                        "condition": "is not"   //No I18N
                    }
                }
            },
            entity: "module", //No I18N
            needOriginalData: true
        }
        hierarchySelect2.getChildrenTreeData(opts).then(function(response){
            _self.hierarchyData = response.originalData;
            const options = {
                id: "product_type_select2", //No I18N
                return_value: "api_name", //No I18N
                allowClear: true,
                placeHolder: translate("sdp.purchase.filter.producttype"), //No I18N
                displayField: "display_name", //No I18N
                promise: new Promise((resolve) => resolve({
                    originalData: response.originalData,
                    data : response.data
                }))
            }
            if (productTypeId && productTypeId != "") {
                options.selectedValue = {
                    id : productTypeId
                };
            }
            hierarchySelect2.init(options);
        });
        const tableDiv = jQuery("#"+WebComponents.instancePool["webc-mark-as-ci-list"].tableId+"_div");
        tableDiv.addClass("fw"); //No I18N
        tableDiv.height(jQuery("#MarkAsCI-parent").outerHeight() - (jQuery("#mark-as-ci-listview-container").offset().top + jQuery('#mark-as-ci-listview-container').find('.listcontrols').outerHeight() ));
    },
    /**
     * add select items to mark as CI
     */
    addCI: function () {
        const _self = this;
        const api_plural_name = jQuery('#destination_module').select2('data').api_plural_name; //NO I18N
        const source_module = jQuery('#source_module').select2('data'); //NO I18N
        const input_data = sdpAjaxInputData({
            [api_plural_name]: _self.getInputDataToAddCI(source_module)
        });
        sdpAjax({
            url: '/api/v3/' + api_plural_name, //NO I18N
            method: 'post', //No I18N
            data: input_data,
            ignorefailuremessage: true,
            success: function (res) {
                _self.hideMarkAsCIList();
                _self.constructMarkAsCISummary(res);
                if ($ciCommon.getAPIPluralName() == api_plural_name || $ciCommon.getAPIName() == "cmdb") {
                    $ciList.refresh();
                }
            },
            error: function (resp) {
                _self.hideMarkAsCIList();
                _self.constructMarkAsCISummary(resp);
            },
            beforeSend: () => {
                jQuery("#CIMarkTableListBtn").button("loading"); //No I18N
            },
            complete: () => {
                jQuery("#CIMarkTableListBtn").button("reset"); //No I18N
            }
        });
    },
    /**
     * construct input data to add CI as array
     * @param {*} source_module
     * @returns
     */
    getInputDataToAddCI: function (source_module) {
        const _self = this;
        const selectRecords = _self.markAsCITableObject.bulkSelect.selectedRecords;
        let bulkData = [];
        for (let record in selectRecords) {
            const data = selectRecords[record];
            const input = {};
            if (source_module.name === 'software_installation'){
                input.name = data.software.name + " (" + data.workstation.name + ")";
            }
            else{
                input.name = data.name;
            }
            input.linked_entity = {
                id: source_module.id
            };
            input.linked_instance = {
                id: data.id
            };
            bulkData.push(input);
        }
        return bulkData;
    },
    /**
     * construct mark as CI summary
     * @param {*} res
     */
    constructMarkAsCISummary: function (res) {
        const _self = this;
        let responseData;
        if (res.response_status !== undefined) {
            responseData = res.response_status;
        } else {
            responseData = res.responseJSON.response_status;
        }
        let successCount = 0;
        let failedCount = 0;
        jQuery('#source_summary').text(jQuery('#source_module').select2('data').display_name); //NO I18N
        jQuery('#destination_summary').text(jQuery('#destination_module').select2('data').display_name); //NO I18N
        jQuery('#total_items_selected').text(responseData.length);
        jQuery.each(responseData, function (index, data) {
            if (data.status == "failed") {
                failedCount++;
            } else {
                successCount++;
            }
        });
        jQuery('#total_items_marked').text(successCount);
        jQuery('#total_items_failed').text(failedCount);
        if (successCount == 0){
            jQuery("#mark-as-ci-success-icon").addClass("alert-danger"); //No I18N
        }
        else{
            jQuery("#mark-as-ci-success-icon").addClass("alert-success"); //No I18N
        }
        jQuery('#summary_msg').text(successCount + " " + (jQuery('#source_module').select2('data').display_name) + translate("sdp.cmdb.markasci.record.marked.as.ci"));
        jQuery('#Summary').show();
        jQuery('#MarkAsCI').find('ul.step-progress li:lt(3)').addClass('active');
        jQuery("[name=mark_as_ci_cancel").off("click").on("click",function(){   //No I18N
            _self.markAsCIDialog.sdp_zcomponent_dialog("close");    //No I18N
        });
    },
    /**
     * construct bulk select settings for mark as ci list view
     * @returns
     */
    getOtherOptionsRightPanel: function () {
        const _self = this;
        const bulkSelectionSetting = {
            enabeld: true,
        };
        if ($ciCommon.otherModuleLoaded !== 'software_installations'){
            bulkSelectionSetting.constructSelectedListCB =  $ciCommon.constructSelectedListCB;
        }
        else{
            bulkSelectionSetting.constructSelectedListCB =  $ciCommon.constructSelectedListCBSW;
        }
        bulkSelectionSetting.selectedRecords = _self.getSelectedRecordsForBulkSetting();
        bulkSelectionSetting.selectionLimit = 10;
        return {
            bulkSelectionSetting: bulkSelectionSetting
        };
    },
    /**
     * get selected records from tableobject
     * @returns
     */
    getSelectedRecordsForBulkSetting: function () {
        const _self = this;
        if (_self.tableObject != null && _self.tableObject.bulkSelect.getSelectedIDs().length > 0) {
            return _self.tableObject.bulkSelect.selectedRecords;
        }
        return {};
    },
    /**
     * construct the input data for mark as ci list view based on filter
     */
    applySearchCriteriaBasedOnFilter: function (isTypeChange) {
        const _self = this;
        let search_criteria = [];
        const siteId = jQuery("#site-other-module-filter").val(); //No I18N
        const productTypeId = jQuery("#product_type_select2").val(); //No I18N
        const siteData = jQuery("#site-other-module-filter").select2("data") //No I18N
        if (siteId){
            search_criteria.push({
                field: siteId == "-1" ? "site" : "site.id", //No I18N
                value: siteId == "-1" ? "null" : siteId,    //No I18N
                condition: "is", //No I18N
                logical_operator: "and" //No I18N
            });
        }
        if (productTypeId){
            // search id in self.hierarchyData
            const childIds = $ciCommon.getChildsId(productTypeId, _self.hierarchyData, [productTypeId]);
            search_criteria.push({
                field: "module", //No I18N
                values: childIds,
                condition: "in", //No I18N
                logical_operator: "and" //No I18N
            });
        }
        delete _self.markAsCITableObject.t_obj.table_info.list_info.filter_by;
        _self.markAsCITableObject.t_obj.table_info.list_info.search_criteria = search_criteria;
        if (isTypeChange) {
            _self.listInfo = _self.markAsCITableObject.t_obj.table_info.list_info;
            _self.reinitializeRightPanelList(siteData,productTypeId);
        } else {
            _self.markAsCITableObject.changeFilterString("clearSearch"); // No I18N
            _self.markAsCITableObject.refreshTable();
        }
    },
    /**
     * when product type filter applied, reinitialize the list to load the list based on the filter
     * @param {} forType
     */
    reinitializeRightPanelList: function (siteData,productTypeId) {
        const _self = this;
        const api_plural_name = jQuery('#source_module').select2("data").api_plural_name; //No I18N
        const data = {
            key_name: $ciCommon.getCallBackName(api_plural_name),
            api_name: api_plural_name,
            productTypeId: productTypeId,
            isMarkAsCI: true
        };
        $ciCommon.setOtherModuleFields(api_plural_name,function(){
            renderhbs("#mark-as-ci-listview-container", "cmdb-other-module-listview", data, false, "cmdb", undefined, false,function(){  //No I18N
                $ciCommon.initSiteFilter(api_plural_name,null,"site-other-module-filter",siteData); //No I18N
            });
            WebComponents.instancePool["webc-mark-as-ci-list"] = undefined; //remove reference to re render list. // No I18N
            WebComponents.render("webc-mark-as-ci-list");
            _self.markAsCITableObject = WebComponents.getInstance("webc-mark-as-ci-list"); // No I18N
        });
    },
    /**
     * construct inputdata for mark as ci list view
     * @param {*} table_info
     * @returns
     */
    getRowInputDataForRightPanel: function (table_info) {
        if (!table_info) {
            return {
                list_info: {
                    row_count: "10",
                    start_index: "1"
                },
                fields_required: ["name"] // No I18N
            }
        }
        let fields_required = Object.keys(table_info.fields_required);
        if ($ciCommon.otherModuleLoaded == "users") {
            if (fields_required.indexOf("site") != -1) {
                fields_required.splice(fields_required.indexOf("site"),1);
                fields_required.push("department");
            }
        }
        let inputObject = {
            fields_required: fields_required,
            list_info: table_info.list_info
        };
        if (this.listInfo) {
            inputObject.list_info.search_criteria = this.listInfo.search_criteria
        }
        return inputObject;
    },
    /**
     * set table width for mark as ci list view
     * @returns
     */
    setTableWidthForMarkAsCI: function () {
        return jQuery('#mark-as-ci-listview-container').width() - 50;
    },
    setTableHeightForLinkCI: function () {
        return jQuery(window).height() - 250;
    },
    callbackSearchFunctionForMarkAsCI : function(type){
        $ciCommon.callbackSearchFunctionForOtherModuleListView(type, $ciList.markAsCITableObject);
    },
    callbackSearchFunctionForLinkCI : function(type){
        $ciCommon.callbackSearchFunctionForOtherModuleListView(type, $ciForm.linkCITableObject);
    },
    // *********** CMDB Right panel related methods ends ************


    // *********** CMDB List view related methods ends ************

    /**
     * render ci list view based on the api_plural_name
     * @param {*} api_plural_name
     * @param {*} api_name
     * @param {*} callback
     */
    init: function (api_plural_name, api_name, callback) {
        const _self = this;
        const data = jQuery.extend({},{},$ciCommon.entityData.links);
        data.api_name = api_plural_name;
        data.show_mark_as_ci = $ciCommon.entityData.links.add && $ciCommon.canShowMarkasCIButton;
        renderhbs("#ci-listview-container", "ci-listview-template", data, false, "cmdb", undefined, false,function(){  //No I18N
            jQuery("#ci-header-menu").html($ciCommon.getHeadermenu());
            jQuery("[name=list_view_navigation]").off("click").on("click", function () {    //No I18N
                const id = jQuery(this).data("id");   //NO I18N
                const module = jQuery(this).data("module");   //NO I18N
                if (module == "cmdb") {
                    _self.loadAllCIList();
                }
                else {
                    _self.triggerNode(id);
                }
            });
            jQuery("#mark-as-ci").off("click").on("click", function () {    //No I18N
                _self.markAsCI();
            });
            if ($ciCommon.loadInactiveList){
                jQuery("#filterViewMenu").html("<span class=\"dd\"><b class=\"caret\"></b></span>" + translate("sdp.cmdb.listview.inactive.ci")); // NO I18N
                jQuery("#ci-list-actions, #ci-advance-filter, #mark-as-ci, #ci-import, #ci-list-border").hide();
            }
            $ciCommon.initSiteFilter(api_plural_name,null, "site_filter"); //No I18N
            // set href for ci import button
            let importUrl = "/servlet/ImportServlet?submitaction=loadImportTab&module=cmdb"; //No I18N
            if(api_name != "cmdb"){
                importUrl += "&entity=" + api_name; //No I18N
            }
            jQuery("#ci_import_btn").attr("href", importUrl); //No I18N
            _self.setOnClickForAdd(api_plural_name, api_name);
        });
        WebComponents.instancePool["webc-ci-list"] = undefined; //remove reference to re render list. // No I18N
        WebComponents.render("webc-ci-list");
        _self.ciListTableObject = WebComponents.getInstance("webc-ci-list"); // No I18N
        if (callback) {
            $ciCommon.loadInactiveList = undefined;
            callback();
        }
        $ciCommon.pushingStateURL(api_plural_name, 'list'); //NO I18N
    },
    /**
     * click event for add CI
     * @param {*} api_plural_name
     * @param {*} api_name
     */
    setOnClickForAdd: function (api_plural_name, api_name) {
        jQuery("#ci_add_form").click(function () {
            const dataObj = {
                mode: "add",    //No I18N
                module: api_plural_name,
                from: "list"    //No I18N
            };
            $ciCommon.renderPage(dataObj);
            $ciCommon.pushingStateURL(api_plural_name, "add"); //NO I18N
        });
    },
    /**
     * refresh the ci list view
     */
    refresh: function () {
        this.ciListTableObject.refreshTable();
    },
    /**
     * callback after initial render of ci list view
     * set events for actions
     * @param {*} a
     * @param {*} ctl
     * @param {*} comp
     */
    callbackAfterInitialRender: function (a, ctl, comp) {
        const _self = this;
        /**
         * if inactive list is loaded, hide the actions
         */
        const isInactiveList = _self.ciListTableObject.t_obj.table_info.list_info.filter_by != undefined;
        if (isInactiveList){
            jQuery("#filterViewMenu").html("<span class=\"dd\"><b class=\"caret\"></b></span>" + translate("sdp.cmdb.listview.inactive.ci")); // NO I18N
            jQuery("#ci-list-actions, #ci-advance-filter, #mark-as-ci, #ci-import, #ci-list-border").hide();
        }
        else{
            jQuery("#ci-list-actions, #ci-advance-filter, #mark-as-ci, #ci-import, #ci-list-border").show();
            jQuery("#filterViewMenu").html("<span class='dd'><b class='caret'></b></span>" + translate("sdp.cmdb.listview.active.ci")); // NO I18N
        }
        // to remove top border for table
        jQuery("#cmdb_div").removeClass("tablebrd1");
        jQuery("#modify_type_link").off("click").on("click", function () {  //No I18N
            _self.modifyCIType();
        });
        jQuery("#bulk-edit").off("click").on("click", function () { //NO I18N
            _self.ciBulkUpdate($ciCommon.getAPIPluralName());
        });
        if (jQuery.isEmptyObject(_self.ciListTableObject.bulkSelect.loadedRecords)) {
            jQuery("#export_container").addClass('cur-na').removeClass('cur-ptr');
            jQuery("#export_container").find("a").addClass('ptr-ev-none');
        } else {
            jQuery("#export_container").removeClass('cur-na').addClass('cur-ptr');
            jQuery("#export_container").find("a").removeClass('ptr-ev-none');
        }
        jQuery("#load_export_dialog").off("click").on("click", function () { //No I18N
            _self.exportListViews.render({
                title: translate('sdp.inventory.export.dataandpush.exportingData'), //No I18N
            });
        });
        jQuery("#list_inactive_filter").off("click").on("click", function () {
            _self.filterCI('inactive', $ciCommon.getAPIPluralName());  //No I18N
        });
        jQuery("#list_active_filter").off("click").on("click", function () {
            _self.filterCI('active', $ciCommon.getAPIPluralName());    //No I18N
        });
        jQuery("#site_filter").off("change").on("change", function () { //No I18N
            $ciCommon.applySiteFilter("site_filter",_self.ciListTableObject);   //No I18N
            _self.ciListTableObject.addPersonalizeData(_self.ciListTableObject.t_obj.table_info);
        });
        // get all attachments icon and initialize attachment component
        jQuery("[name=attachmentIcon]").each(function (index, el) {

            const _attachment = new attachPreview(jQuery(this), {
                entity_id: jQuery(this).data("id"), //No I18N
                entity: jQuery(this).data("module"), //No I18N
                api: true,
                is_odapi: true,
                layouts: false,
                attachWrap: true,
                popover: {
                    enable: true,
                    target: jQuery(this).data("targetId") //No I18N
                },
                type: "field", //NO I18N
                enable_delete: true,
                upload: true
            });
        });
        jQuery("[name=ci_details_link]").each(function (index, el) {
            jQuery(this).off("click").on("click", function (event) { //NO I18N
                //check if event is clicked with ctrl key for mac device it is metaKey
                if (!(event.ctrlKey || event.metaKey)) {
                    const rowData = _self.ciListTableObject.bulkSelect.loadedRecords[jQuery(this).data("id")];
                    const loadedFromdata = {
                        api_name : $ciCommon.getAPIName(),
                        type_id : $ciCommon.getModuleId(),
                        api_plural_name : $ciCommon.getAPIPluralName()
                    };
                    $ciForm.showDetailsPage(rowData.id, e_param(rowData.module.api_plural_name), loadedFromdata);
                    event.preventDefault();
                }
            });
        });
        jQuery("[name=edit_ci_link]").each(function (index, el) {
            jQuery(this).off("click").on("click", function () { //NO I18N
                const rowData = _self.ciListTableObject.bulkSelect.loadedRecords[jQuery(this).data("id")];
                const dataObj = {
                    from: "list",   //No I18N
                    mode: "edit",   //No I18N
                    entity_id: rowData.id,
                    module: rowData.module.api_plural_name
                };
                $ciCommon.loadedFrom = {
                    api_name : $ciCommon.getAPIName(),
                    type_id : $ciCommon.getModuleId(),
                    api_plural_name : $ciCommon.getAPIPluralName()
                };
                $ciCommon.renderPage(dataObj);
                $ciCommon.pushingStateURL(rowData.module.api_plural_name, "edit", rowData.id); //No I18N
            });
        });
        jQuery("[name=view_relationship]").each(function (index, el) {
            jQuery(this).off("click").on("click", function () { //NO I18N
                showMap('/RelationshipMapD3.do?operation=showRelD3&ciId=' + jQuery(this).data("id"), 'RelationshipMap_WS'); //No I18N
            });
        });
    },
    /**
     * render bulkupdate popup
     * @param {} api_plural_name
     */
    ciBulkUpdate: function (api_plural_name) {
        const _self = this;
        const selectedIds = _self.ciListTableObject.bulkSelect.getSelectedIDs();
        jQuery("#popup_div").append('<div id="cmdb_content_pannel_dialog"><div id="cmdb_bulk_edit_container" class="p10"></div></div>');
        const dataObj = {
            module: api_plural_name,
            mode: 'bulkEdit',   //No I18N
            entity_id: null,
            ids: selectedIds.join(',')
        };
        $ciCommon.renderPage(dataObj);
        const element = jQuery("#cmdb_content_pannel_dialog");
        const options = {
            width: "95%", //No I18N
            height: "95%",  //No I18N
            modal: true,
            title: translate("sdp.cmdb.bulk.update.title"), //NO I18N
            resizable: false,
            beforeclose : function(event,ui){
                // need to validate form
                if (event.key == 'Escape' || ui.closeButton){
                    const form = FC_Mapper.form_cmdb_form
                    if(form.hasUnsavedData()) {
                        event && event.preventDefault();
                        FC.cancel("form_cmdb_form");    //No I18N
                    }
                }
            }
        };
        _self.bulkUpdateDialog = element.sdp_zcomponent_dialog(options);
    },
    /**
     * filter active and inactive CI
     * @param {*} selectedView
     * @param {*} entity
     */
    filterCI: function (selectedView, entity) {
        const _self = this;
        _self.selectedView = selectedView;
        const isActiveList = selectedView === 'active'
        $ciCommon.loadInactiveList = !isActiveList;
        if (isActiveList) {
            delete _self.ciListTableObject.t_obj.table_info.list_info.filter_by;
        }
        else{
            _self.ciListTableObject.t_obj.table_info.list_info.filter_by = {
                name: "inactive"    //No I18N
            };
        }
        _self.refresh();
    },
    /**
     * width of ci list view
     * @returns
     */
    getWidth: function () {
        return widthTable = jQuery(window).width() - jQuery("#cmdb-left-panel").width() - 23; // No I18N
    },
    /**
     * height of ci list view
     * @returns
     */
    getHeight: function () {
        return jQuery(window).height() - ( jQuery('#header-placeholder').outerHeight() + is_chathgt + 175 ); // No I18N
    },
    /**
     * construct inputadata for ci list view
     * @param {*} table_info
     * @returns
     */
    getRowInputData: function (table_info) {

        if (!table_info) {
            return {
                list_info: {
                    row_count: "10",
                    start_index: "1",
                    sort_field: "created_time", //No I18N
                    sort_order: "asc"   //No I18N
                },
                fields_required: sdp_user.USERTYPE == 'Requester' ? ["name", "module", "site"] : ["name", "module", "site", "created_by", "created_time", "api_plural_name", "has_attachments"] // No I18N
            }
        }

        let inputObject = {
            fields_required: Object.keys(table_info.fields_required),
            list_info: table_info.list_info
        };
        if (inputObject.fields_required ) {
            if (inputObject.fields_required.indexOf("module") == -1) {
                inputObject.fields_required = inputObject.fields_required.concat(["module"]); //NO I18N
            }
            if (inputObject.fields_required.indexOf("has_attachments") == -1) {
                inputObject.fields_required = inputObject.fields_required.concat(["has_attachments"]); //NO I18N
            }
            if (inputObject.fields_required.indexOf("edit") != -1) {
                inputObject.fields_required.splice(inputObject.fields_required.indexOf("edit"),1);
            }
        }
        if (inputObject.list_info.filter_by) {
            $ciCommon.loadInactiveList = true;
        }
        if ($ciCommon.loadInactiveList) {
            inputObject.list_info.filter_by = {
                name: "inactive"    //No I18N
            };
        }
        if ($ciCommon.getSearchText()){
            inputObject.list_info.gsearch = $ciCommon.getSearchText();
        }
        return inputObject;
    },
    /**
     * get table width for ci list view
     * @returns
    */
    getTableInfo: function (personalize_key) {
        /* Getting  Personalized Table info object */
        let table_info = {};
        table_info = getPersonalizeData(personalize_key);
        let full_obj = {};
        const t_g_info = JSON.parse(sdpToJSON(global_table_info));
        if (jQ.isEmptyObject(table_info)) {
            if (!jQ.isEmptyObject(t_g_info)) {
                full_obj = table_comp.getFieldsRequiredByString(t_g_info, personalize_key || undefined);
            }
            if (full_obj) {
                table_info = full_obj;
            } else {
                const list_info = {
                    row_count: "10",    // No I18N
                    start_index: "1",
                };
                if (sdp_user.USERTYPE == 'Requester') {
                    table_info.fields_required = {"name" : {}, "module": {}, "site": {}};   // No I18N
                }
                else {
                    table_info.fields_required = {"name" : {}, "module": {}, "site": {}, "created_by": {}, "created_time": {}, "has_attachments": {}};   // No I18N
                }
                table_info.list_info = list_info;
            }
        } else {
            if (!jQ.isEmptyObject(t_g_info)) {
                full_obj = table_comp.getFieldsRequiredByString(t_g_info, personalize_key || undefined);
                if (full_obj) {
                    /*Since we are not personalized search_fields , we need to append it with list_info when page load*/
                    if (full_obj.isDefaultSearch) {
                        table_info.list_info.search_fields = full_obj.list_info.search_fields;
                    }
                }
                if(table_info.site_data && !jQuery.isEmptyObject(table_info.site_data)){
                    const siteCriteria = {
                        field: "site", //No I18N
                        value: table_info.site_data.id == "-1" ? null : table_info.site_data.id, //No I18N
                        condition: "is", //No I18N
                        logical_operator: "and" //No I18N
                    };
                    table_info.list_info.search_criteria = [siteCriteria];
                    jQuery("#site_filter").select2("data",table_info.site_data); //No I18N
                }
            }
        }
        if($ciCommon.getSearchText()){
            delete table_info.list_info.filter_by;
        }
        return table_info;
    },
    /**
     * lookup display name for citype field
     * @param {*} data
     * @returns
     */
    getModuleName: function (data) {
        const moduleName = data.row_data.module.display_name;
        return `<span rel="uitip" mode_ellipsis="true" title="${e_attr(moduleName)}">${e_html(moduleName)}</span>`;
    },
    /**
     * construct name column for ci list view
     * @param {*} data
     * @returns
     */
    getName: function (data) {
        const rowData = data.row_data;
        let html = '';
        if (rowData.has_attachments && !$ciCommon.loadInactiveList) {
            html = '<button type="button" ' + //No I18N
                        'name="attachmentIcon" ' + //No I18N
                        'data-id="' + rowData.id + '" ' + //No I18N
                        'data-module="' + rowData.module.api_plural_name + '" ' + //No I18N
                        'data-target-id="#attachmentDropdownTarget_' + rowData.id + '" ' + //No I18N
                        'id="attachmentDropdown_' + rowData.id + '" ' + //No I18N
                        'class="a-tag-btn-ovwrt" ' + //No I18N
                        'custom-class="attachPopup">' + //No I18N
                        '<span style="pointer-events:none" aria-hidden="true" ' + //No I18N
                        'class="cspr paperclip icon-sm opac5"></span>' + //No I18N
                    '</button>' + //No I18N
                    '<div id="attachmentDropdownTarget_' + rowData.id + '" class="hidden">'+'</div>'; //No I18N

        }
        return `${html} <a rel="uitip noopener" mode_ellipsis="true" href="/ui/cmdb_module?ci_type=${rowData.module.api_plural_name}&ciid=${rowData.id}&mode=details" name="ci_details_link" title="${e_attr(rowData.name)}" data-id="${rowData.id}" class="cur-ptr" style="hover {color:blue}"> ${e_html(rowData.name)} </a>`;

    },
    /**
     * lookup display name for citype field
     * @param {*} data
     * @returns
     */
    getLinkedEntityName: function (data) {
        const linkedEntityName = data.row_data.linked_entity ? data.row_data.linked_entity.display_name : "-";
        return `<span rel="uitip" mode_ellipsis="true" title="${e_attr(linkedEntityName)}">${e_html(linkedEntityName)}</span>`;
    },
    /**
     * constuct edit icon column for ci list view
     * @param {*} data
     * @returns
     */
    getEditIconHtml: function (data) {
        const rd = data.row_data;
        if (!$ciCommon.loadInactiveList){
            return `
                <div class="ml-5 tc">
                    <div class="btn-group tc-req-edit bs-noconflict pos-abs ml-5">
                        <a class="cur-ptr cspr menulist icon-xs flat sdmenu-toggle vmiddle" data-switch="sdmenu" rel="uitip" title="${translate("sdp.common.actions")}"></a>
                        <ul class="sdmenu-dd" role="menu">
                            ${$ciCommon.entityData.links.edit ? `<li><a href="/" name="edit_ci_link" data-id="${rd.id}">${translate("sdp.common.edit")}</a></li>` : ''}
                            <li><a href="/" name="view_relationship" data-id="${rd.id}">${translate("sdp.cmdb.listview.action.relationship.map")}</a></li>
                            <li></li>
                        </ul>
                    </div>
                </div>`;
        }
        else{
            return `
            <div class="ml-5 tc">
                <div class="btn-group tc-req-edit bs-noconflict pos-abs ml-5">
                    <a class="cur-na cspr menulist icon-xs sdmenu-toggle vmiddle" data-switch="sdmenu" rel="uitip" title="${translate("sdp.common.actions")}"></a>
                </div>
            </div>`;
        }
    },
    /**
     * bulk select settings for ci list view
     * advanced filter settings for ci list view
     */
    getOtherOptions: function () {
        const _self = this;
        const metaInfo = $ciCommon.getMetainfo();
        let fields = jQuery.extend(true,{}, metaInfo.fields);
        delete fields.linked_instance;
        const bulkSelectionSetting = {
            enabeld: true,
            constructSelectedListCB: $ciCommon.constructSelectedListCB
        };
        bulkSelectionSetting.selectedRecords = _self.getSelectedRecordsForBulkAction();
        bulkSelectionSetting.selectionLimit = _self.getSelectionLimitForBulkAction();
        const advFilterSettings = {
            options: {
                setNullSiteDef : true,
                metaInfoData: {
                    metainfo: $ciCommon.getMetainfoForAdvanceFilter()
                },
                haveMultiString: true,
                allowReadOnly: true,
                haveOtherUDF: true,
                ignoreTypes: ["Url", "Email", "Phone","CheckBox","MultiSelect"], //No I18N
                includeSubFields: ["udf_fields"],   //No I18N
                popupPosition: "center",    //No I18N
            }
        }
        const otherOptions = {
            bulkSelectionSetting: bulkSelectionSetting,
            max_allowed_fields : 97,
            bulk_action_summary: true,
            meta_data: fields,
            support_search_criteria: true,
            personalizeCallback: $ciList.personalizeCallback,
            cancelFilterTable : function(isManual){
                /**
                 * need to enable site filter when filter is removed
                 */
                jQuery("#site_filter").select2("data",null).select2('enable');  //No I18N
                delete _self.ciListTableObject.t_obj.table_info.list_info.search_criteria;
                _self.ciListTableObject.refreshTable("refresh");   //No i18n
            },
            applyFilterTable : function(search_criteria){
                /**
                 * need to disable site filter when filter is applied
                 */
                jQuery("#site_filter").select2("data",null).select2('disable'); //No I18N
                if (Array.isArray(search_criteria)){
                    search_criteria.forEach(function(sc){
                        if (sc.field == "linked_entity.name"){
                            sc.field = "linked_entity.display_name"; //No I18N
                        }
                    });
                }
                else{
                    if (search_criteria.field == "linked_entity.name"){
                        search_criteria.field = "linked_entity.display_name"; //No I18N
                    }
                }
                _self.ciListTableObject.t_obj.table_info.list_info.search_criteria = search_criteria;
                _self.ciListTableObject.refreshTable("refresh");   //No i18n
            },
            advFilterSettings: advFilterSettings,
            delete_entity_name: $ciCommon.getAPIName()
        };
        if($ciCommon.isListPopup){
            otherOptions.callbackSearchFunction = $ciList.callbackSearchFunctionForListPopup;
        }
        else{
            otherOptions.callbackSearchFunction = $ciList.callbackSearchFunctionForList;
        }
        return otherOptions;
    },
    exportListViews: {
        context: {},
        /**
         *
         * @param {object} options render the export popup
         */
        render: function (options) {
            const _self = this;
            const totalRecords = $ciList.ciListTableObject.visibleContents.length || 0;
            if (totalRecords > 0) {
                if ($ciList.ciListTableObject.t_obj.table_info.list_info) {
                    _self.init(options);
                    if (!jQuery("#exportlistview").length) { //No I18N
                        jQuery('body').append("<div id='exportlistview'></div>"); //NO I18N
                    }
                    const element = jQuery("#exportlistview");
                    renderhbs("#exportlistview", "ci-export-view", _self.context, false, "cmdb", undefined, false);  //No I18N
                    jQuery("#export_listview").off("click").on("click", function () {   //NO I18N
                        _self.initExport();
                    });
                    jQuery("#export_ci_cancel").off("click").on("click", function () {  //NO I18N
                        _self.exportDialog.sdp_zcomponent_dialog("close");    //No I18N
                    });
                    const title = $ciCommon.getDisplayName();
                    _self.exportDialog = element.sdp_zcomponent_dialog({
                        title: translate("ae.cmdb.relationshipmap.helpcontent.Exportas") + " " + title,
                        width: 500,
                        className: 'sdpzcompdialog cust-width', //No I18N
                        height: 385
                    })
                } else {
                    showalert('info', translate('ae.mc.export.invalidcolumns'), 'isAutoHide=true'); //NO I18N
                }
            }
        },
        init: function (options) {
            const _self = this;
            _self.constructFormats();
            _self.context.info = translate('ae.mc.export.info.rowlimit'); //NO I18N
        },
        constructFormats: function () {
            this.context.formats = [{
                key: 'HTML', //NO I18N
                name: translate('ae.export.format.html'), //NO I18N
                icon_class: 'attachment-sprite attach-ie', //NO I18N
                checked: true
            }, {
                key: 'XLS', //NO I18N
                name: translate('sdp.reports.customreport.xls'), //NO I18N
                icon_class: 'attachment-sprite attach-xls', //NO I18N
            }, {
                key: 'XLSX', //NO I18N
                name: translate('reports.customreport.xlsx'), //NO I18N
                icon_class: 'attachment-sprite attach-xls', //NO I18N
            }, {
                key: 'PDF', //NO I18N
                name: translate('sdp.reports.customreport.pdf'), //NO I18N
                icon_class: 'attachment-sprite attach-pdf', //NO I18N
            }, {
                key: 'CSV', //NO I18N
                name: translate('sdp.reports.customreport.csv'), //NO I18N
                icon_class: 'attachment-sprite attach-file', //NO I18N
            }];
        },
        /**
         * construct the input data for exporting the list view
         */
        initExport: function () {
            const _self = this;
            const type = jQuery('input[name="export-format"]:checked').val();
            const list_info = jQuery.extend({},{},$ciList.ciListTableObject.t_obj.table_info.list_info);
            list_info.has_more_rows = undefined;
            list_info.end_index = undefined;
            list_info.total_count = undefined;
            list_info.sort_valuepath = undefined;

            const options = {
                type: type,
                list_info: list_info,
                module: $ciCommon.getAPIPluralName(),
                title: e_html($ciCommon.getDisplayName()),
                is_file_protection_required : $ciCommon.isFileProtectionRequired
            }
            let columnOrder = $ciList.ciListTableObject.t_obj.table_info.column_order;
            let fieldRequired = Object.keys($ciList.ciListTableObject.t_obj.table_info.fields_required);
            /**
             * sort the fieldsRequired array based on columnOrder
             */
            fieldRequired.sort(function (a, b) {
                return columnOrder.indexOf(a) - columnOrder.indexOf(b);
            });
            /**
             * remove the fields that are not in the columnOrder
             */
            fieldRequired = fieldRequired.filter(function (field) {
                return columnOrder.indexOf(field) != -1;
            });
            options.list_info.fields_required = fieldRequired;

            try {
                if (typeof top.listview_popup !== undefined && top.listview_popup.title) {
                    options.title = top.listview_popup.title;
                }
            } catch (error) {}
            _self.exportView(options);
        },
        /**
         *
         * @param {object} options option for exporting the list view
         */
        exportView: function (options) {
            const list_info = jQuery.extend({}, options.list_info);
            const input_data = {
              'export': {//No I18N
                format: options.type
              },
              list_info: list_info
            };
            if(options.title){
              input_data['export'].title = options.title;
            }
            try {
              const link = document.createElement('a');
              const fileType = options.is_file_protection_required ? 'zip' : options.type.toLowerCase();//No I18N
              link.download = (options.title ? options.title : Date.now()) + '.'+fileType;
              link.href = '/api/v3/' + options.module + '/_export?' + sdpAjaxInputData(input_data);
              link.click();

              this.exportDialog.sdp_zcomponent_dialog('close'); //No I18N
            } catch (e) {}
        },
    },
    getSoftwareInputData : function(inputObject){
        if (inputObject && inputObject.fields_required){
            // add software and workstation field to fields_required
            if (!inputObject.fields_required.contains("workstation")){
                inputObject.fields_required.push("workstation")
            }
            if (!inputObject.fields_required.contains("software")){
                inputObject.fields_required.push("software")
            }
        }
        else{
            inputObject.list_info.fields_required = ["software","workstation"];
        }
        return inputObject;
    },
    callbackSearchFunctionForListPopup : function(type){
        $ciList.callbackSearchFunction(type, $ciList.popupTableObject);
    },
    callbackSearchFunctionForList : function(type){
        $ciList.callbackSearchFunction(type, $ciList.ciListTableObject);
    },
    /*
    *   When inline search is performed, need to merge the search criteria with the advanced filter criteria and site criteria if applicable
    */
    callbackSearchFunction : function(type,tableObject){
        const _self = $ciList;
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
         * If the advSearch have some criteria, then we need to merge it.
         */
        if(tableObject.advancedfilter_criteria && Array.isArray(tableObject.advancedfilter_criteria)){
            if(Array.isArray(searchCriterias)){
                searchCriterias = searchCriterias.concat(tableObject.advancedfilter_criteria);
            } else if(jQuery.isEmptyObject(searchCriterias)) {
                searchCriterias = tableObject.advancedfilter_criteria;
            }
        }
        /**
         * if site filter selected, need to apply site filter
         */
        const siteCriteria = $ciCommon.getSiteCriteria("site_filter");  //No I18N
        if (siteCriteria){
            if(searchCriterias){
                searchCriterias.push(siteCriteria);
            } else {
                searchCriterias = [siteCriteria];
            }
        }
        /**
         * when citype filter is applied, need to merge the citype filter with the search criteria
         */
        const citypeCriteria = _self.getCITypeCriteria();
        if (citypeCriteria){
            if(searchCriterias){
                searchCriterias.push(citypeCriteria);
            } else {
                searchCriterias = [citypeCriteria];
            }
        }

        tableObject.t_obj.table_info.list_info.search_criteria = searchCriterias;

        tableObject.refreshTable('search'); // No I18N
    },
    /**
     * get citype criteria
     */
    getCITypeCriteria : function(){
        const data = jQuery("#cmdb_entity").select2("data");    //NO I18N
        const typeId = data ? data.id : null;
        if (typeId && typeId != ""){
            return {
                field: "module", //No I18N
                value: typeId,
                condition: "is",    //No I18N
                logical_operator: "and" //No I18N
            }
        }
        return null;
    },
    /**
     * apply site filter in list view
     */
    applySiteFilterInList : function(){
        const _self = this;
        const tableObject = _self.ciListTableObject;
        let siteCriteria = $ciCommon.getSiteCriteria("site_filter");    //No I18N
        tableObject.t_obj.table_info.list_info.search_criteria = siteCriteria;
        /**
         * clear the inline search when site filter is applied, since we can't determine the site criteria is removed or not
         */
        tableObject.changeFilterString("clearSearch"); // No I18N
        tableObject.refreshTable("refresh");    // No I18N
    },
    /**
     * personalize Callback to add site criteria
     */
    personalizeCallback : function(tableInfo){
        const _self = $ciList;
        tableInfo.site_data = jQuery("#site_filter").select2('data');   //No I18N
        return tableInfo;
    },
    // *********** CMDB List view related methods ends ************


    // *********** CMDB Listview popup related methods starts ************
    /**
     * load attach ci popup based on the refEntity and refField
     * @param {*} refEntity example request
     * @param {*} refField example configuration_items
     * @param {*} for_field example configuration_items
     * @param {*} selectionLimit example 100
     */
    loadAttachCIPopup: function (refEntity, refField, for_field, selectionLimit) {
        const _self = this;
        _self.selectionLimit = selectionLimit == undefined ? 100 : selectionLimit;
        if(refEntity == 'problems'){
            _self.selectionLimit = 200;
        }
        if (_self.listPopupDialog) {
            jQuery("#" + for_field).empty();
        }
        if (jQuery("#ci_popup").length > 0) {
            jQuery("#ci_popup").remove();
        }
        jQuery("#" + for_field).append('<div id="ci_popup"><div id="Right-Section-popup" class="oya oxh" style="max-height: calc(100vh - 250px);"></div></div>'); //No I18N
        const dataObj = {
            module: "cmdb", //No I18N
            mode: "list_popup", //No I18N
            refEntity: refEntity,
            refField: refField
        }
        $ciCommon.renderPage(dataObj);
    },
    /**
     * render list view popup
     * @param {*} dataObj
     */
    initListPopup: function (dataObj) {
        const _self = this;
        renderhbs("#Right-Section-popup", "ci-listview-template", { //No I18N
            api_name: "cmdb", //No I18N
            isPopup: true,
            refEntity: dataObj.refEntity,
            refField: dataObj.refField
        }, false, "cmdb", undefined, false, function(){ //No I18N
            $ciCommon.initSiteFilter(dataObj.refEntity,dataObj.refField,"site_filter");    //No I18N
            _self.initCITypeSearchForListPopup();
        });
        WebComponents.instancePool["webc-ci-list"] = undefined; //remove reference to re render list. // No I18N
        WebComponents.render("webc-ci-list");
        _self.popupTableObject = WebComponents.getInstance("webc-ci-list"); // No I18N
    },
    /**
     * render citype dropdown in popup
     */
    initCITypeSearchForListPopup: function () {
        const _self = this;
        let url = "/api/v3/ci_types"; //No I18N
        let responseName = "ci_types"; //No I18N
        if ($ciCommon.isListPopup && $ciCommon.refEntity && $ciCommon.refField) {
            url = "/api/v3/" + $ciCommon.refEntity + "/" + $ciCommon.refField + "/module"; //No I18N
            responseName = "module"; //No I18N
        }
        const listInfo = {
            fields_required: ["name", "parent", "id", "api_plural_name", "display_name"], //No I18N
            start_index: 1,
            row_count: 100,
            search_criteria: {
                field: "name",  //No I18N
                condition: "is not",    //No I18N
                value: "cmdb",  //No I18N
                logical_operator: "and" //No I18N
            }
        };
        const options = {
            url: url,
            return_value: "api_plural_name", //No I18N
            displayField: "display_name", //No I18N
            entity: responseName,
            allowClear: true,
            placeholder: translate('ae.cmdb.cilistview.viewallciname'), // No I18N
            id: "cmdb_entity", //No I18N
            list_info: listInfo
        };
        const typeId = jQuery("#cmdb_entity").data("id"); //No I18N
        if (typeId && typeId != "") {
            options.selectedValue = {
                id : typeId
            };
        }
        hierarchySelect2.init(options);
    },
    /**
     * open list view in dialog after rendering
     * @param {*} content
     */
    afterBodyRenderForListPopup: function (content) {
        const _self = this;
        jQuery("#attach_cis").off("click").on("click", function () {    //NO I18N
            _self.attachCIs();
        });
        jQuery("#cmdb_entity").off("change").on("change", function () { //No I18N
            _self.applyFilter(true);
        });
        jQuery("#site_filter").off("change").on("change", function () { //No I18N
            _self.applyFilter(false);
        });
        if (_self.dialog == null) {
            const container = jQuery("#ci_popup"); //No I18N
            const options = {
                width: jQuery(window).width() * 95 / 100,
                maxHeight: jQuery(window).height() * 95 / 100,
                modal: true,
                title: translate("sdp.cmdb.listview.popup.title"), //NO I18N
                resizable: false,
                excludeFocus:'input[data-table-checkbox]' , //No I18N
                close: function () {
                    _self.listPopupDialog = undefined;
                    _self.listInfo = undefined;
                    _self.popupTableObject = undefined;
                }
            };
            _self.listPopupDialog = container.sdp_zcomponent_dialog(options);
        } else {
            _self.listPopupDialog.sdp_zcomponent_dialog("open"); //NO I18N
        }
        // setting listview height after dialog rendered
        jQuery("#cmdb_div").css("height", jQuery(".zdialog__content").height() - jQuery("#ci_list_header").height() - 15); //No I18N
    },
    /**
     * attach selected CIs to the parent window with refField
     */
    attachCIs: function () {
        const selectOptions = [];
        const _self = this;
        const valuesData = Object.values(_self.popupTableObject.bulkSelect.selectedRecords);
        if (valuesData && valuesData.length > 0) {
            for (let i = 0; i < valuesData.length; i++) {
                if (valuesData[i] && (valuesData[i].name || valuesData[i].text)) {
                    valuesData[i].text = (valuesData[i].name || valuesData[i].text);
                      selectOptions.push('<option value="'+ valuesData[i].id +'">'+ e_html(valuesData[i].text) +'</option>');
                }
            }
        }
          //handling done for change template select ci popup.
          // when adding options to dom, we need to encode the text , when setting data to select2 encoding not needed
          if(jQuery('[name="'+$ciCommon.refField+'"]').is("select")){
              jQuery('[name="'+$ciCommon.refField+'"]').html(selectOptions.join('')).trigger("change"); // No I18N
          }
          else if($ciCommon.refEntity === "changes" && $ciCommon.refField === "configuration_items"){
                FC_Mapper && FC_Mapper.form_change && FC_Mapper.form_change.grid.is(":visible")? //no i18n
                    FC_Mapper.form_change.setMultiSelect("configuration_items", valuesData) : //no i18n
                    FC_Mapper.form_rcForm.setMultiSelect("configuration_items", valuesData); // No I18N
          }
           else if($ciCommon.refEntity === "releases" && $ciCommon.refField === "configuration_items"){
                FC_Mapper && FC_Mapper.form_release && FC_Mapper.form_release.grid.is(":visible")? //no i18n
                    FC_Mapper.form_release.setMultiSelect("configuration_items", valuesData) : //no i18n
                    FC_Mapper.form_rcForm.setMultiSelect("configuration_items", valuesData); // No I18N
         }
          else{
            jQuery('[name="' + $ciCommon.refField + '"]').select2("data", valuesData).trigger("change"); // No I18N
        }
        _self.listPopupDialog.sdp_zcomponent_dialog("close"); //NO I18N
        _self.popupTableObject = undefined;
        _self.listInfo = undefined;
    },
    /**
     * width of the list view popup
     * @returns
     */
    getWidthForListPopup: function () {
        return (jQuery(window).width() * 95 / 100);
    },
    /**
     * construct search criteria for list view popup based on site and type
     */
    applyFilter: function (isTypeChange) {
        const _self = this;
        let search_criteria = [];
        const siteId = jQuery("#site_filter").val(); //No I18N
        const productTypeId = jQuery("#cmdb_entity").val(); //No I18N
        const siteData = jQuery("#site_filter").select2("data") //No I18N
        if (siteId){
            search_criteria.push({
                field: siteId == "-1" ? "site" : "site.id", //No I18N
                value: siteId == "-1" ? null : siteId,    //No I18N
                condition: "is", //No I18N
                logical_operator: "and" //No I18N
            });
        }
        if (productTypeId){
            search_criteria.push({
                field: productTypeId == "-1" ? "module" : "module.id", //No I18N
                value: productTypeId == "-1" ? null : productTypeId,  //No I18N
                condition: "is", //No I18N
                logical_operator: "and" //No I18N
            });
        }
        delete _self.popupTableObject.t_obj.table_info.list_info.filter_by;
        _self.popupTableObject.t_obj.table_info.list_info.search_criteria = search_criteria;
        if (isTypeChange) {
            _self.listInfo = _self.popupTableObject.t_obj.table_info.list_info;
            _self.reinitializeList(siteData,productTypeId);
        } else {
            _self.popupTableObject.refreshTable();
        }
    },
    /**
     * reinitialize list view popup when citype changed
     * @param {*} forType
     */
    reinitializeList: function (siteData,typeId) {
        const _self = this;
        renderhbs("#Right-Section-popup", "ci-listview-template", { // No I18N
            api_name: "cmdb", // No I18N
            isPopup: true,
            typeId: typeId,
            refEntity: $ciCommon.refEntity,
            refField: $ciCommon.refField
        }, false, "cmdb", undefined, false,function(){  //No I18N
            $ciCommon.initSiteFilter($ciCommon.refEntity,$ciCommon.refField,"site_filter",siteData);  //No I18N
            _self.initCITypeSearchForListPopup();
        });
        WebComponents.instancePool["webc-ci-list"] = undefined; //remove reference to re render list. // No I18N
        WebComponents.render("webc-ci-list");
        _self.popupTableObject = WebComponents.getInstance("webc-ci-list"); // No I18N
    },
    /**
     * construct input data for list view popup
     * @param {*} table_info
     * @returns
     */
    getRowInputDataForListPopup: function (table_info) {
        const _self = this;

        if (!table_info) {
            return {
                list_info: {
                    row_count: "10",
                    start_index: "1"
                },
                fields_required: ["name", "module", "site", "created_by", "created_time"] // No I18N
            }
        }

        let inputObject = {
            fields_required: Object.keys(table_info.fields_required),
            list_info: table_info.list_info
        };
        if (inputObject.fields_required && inputObject.fields_required.indexOf("module") == -1){
            inputObject.fields_required = inputObject.fields_required.concat(["module"]); //NO I18N
        }
        if (inputObject.list_info.filter_by) {
            delete inputObject.list_info.filter_by;
        }
        if (_self.listInfo) {
            inputObject.list_info.search_criteria = _self.listInfo.search_criteria;
        }
        return inputObject;
    },
    /**
     * get selected records for bulk action
     * @returns
     */
    getSelectedRecordsForBulkAction: function () {
        const _self = this;
        let data;
        let selected_data = {};
        if (_self.popupTableObject && _self.popupTableObject.bulkSelect && _self.popupTableObject.bulkSelect.selectedRecords) {
            selected_data = _self.popupTableObject.bulkSelect.selectedRecords;
        }
        else if ($ciCommon.isListPopup && $ciCommon.refEntity && $ciCommon.refField) {
             if (jQuery('[name="' + $ciCommon.refField + '"]').is("select") && jQuery('[data-template="from_change_template"]')) {
            const selectElements = jQuery('[id="CIID"]');
            let selectedData = {};
            selectElements.each(function() {
                const selectElement = jQuery(this);  // `this` refers to the current <select> element
                const selectHtml = selectElement.html();  // Get the HTML content of the <select> element
                const tempDiv = jQuery('<div>').html(selectHtml);
                const options = tempDiv.find('option');
                options.each(function() {
                    const option = jQuery(this);
                    const id = option.val();  // Get the value of the selected option
                    const text = option.text();  // Get the text of the selected option
                    selectedData[id] = { id: id, name: text };
                });
            });
            selected_data = selectedData;
        }
        else {
            data = jQuery('[name="' + $ciCommon.refField + '"]').select2("data"); // No I18N
            if($ciCommon.refEntity === "changes" && $ciCommon.refField === "configuration_items"){
                data = FC_Mapper && FC_Mapper.form_change && FC_Mapper.form_change.grid.is(":visible")? //no i18n
                     FC_Mapper.form_change.fields.configuration_items.current_value : FC_Mapper.form_rcForm.fields.configuration_items.current_value;
            }
            else if($ciCommon.refEntity === "releases" && $ciCommon.refField === "configuration_items"){
                data = FC_Mapper && FC_Mapper.form_release && FC_Mapper.form_release.grid.is(":visible")? //no i18n
                    FC_Mapper.form_release.fields.configuration_items.current_value:FC_Mapper.form_rcForm.fields.configuration_items.current_value;
            }
                                if(data){
                            data.forEach(function(key) {
                selected_data[key.id] = key;
                            });
                        }}
                        }
        return selected_data;
    },
    /**
     * get selection limit for bulk action
     * @returns
     */
    getSelectionLimitForBulkAction: function () {
        return this.selectionLimit != null ? this.selectionLimit : 100;
    }
    // *********** CMDB Listview popup related methods ends ************
};
