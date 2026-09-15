var $ciForm = {
    // ********************* CI Details related Methods starts here ************************
    /**
     * starting point of the CI details
     * @param {object} model
     */
    renderDetails: function (model) {
        const _self = this;
        const module_details = model.module_details;
        const moduleName = module_details.name;
        let tabsToShow = ['details'];
        if ($ciCommon.isActiveCI()) {
            if (!$ciCommon.isPopup){
                tabsToShow.push('relationship');
            }
            tabsToShow.push('history');
        }
        const opt = {
            module: moduleName,
            container: 'Right-Section', // No I18N
            data: model.data,
            entity_id: model.entity_id,
            module_details: module_details,
            permissions: model.permissions,
            panel_details: {
                content_panel: {
                    class : $ciCommon.isPopup ? "no-border" : "", //No I18N
                    actions_panel: {
                        show: $ciCommon.isPopup ? false : true,
                        left_panel: {
                            template: 'cmdb-module-action-template', //No I18N
                            dataCallback: function(data){
                                const summary = $ciAssociation.getAssociationSummary();
                                let canShowAssociationHeader = sdp_user.ROLES.contains('CreateChanges') || sdp_user.ROLES.contains('CreateProblems') || sdp_user.ROLES.contains('CreateRequests'); //NO I18N
                                return {
                                    canShowAssociationHeader : canShowAssociationHeader,
                                    associations : summary.length != 0 ? summary : undefined
                                }
                            },
                            show: true,
                            template_namespace: "cmdb", //No I18N
                            afterRenderfunction: _self.afterRenderActionPanel,
                        },
                        right_panel: {
                            template: "right-action-panel", //NO I18N
                            show: true,
                            template_namespace: "cmdb" //No I18N
                        }
                    },
                    header_panel: {
                        show: true,
                        template: 'cmdb-module-header-template', // No I18N
                        template_namespace: "cmdb", //No I18N,
                        afterRenderfunction: _self.afterRenderHeaderPanel,
                    },
                    details_panel: {
                        show: true
                    },
                    tabs_panel: {
                        show: true,
                        name: 'cmdb-module-container', // No I18N
                        template_namespace: "cmdb", //No I18N
                        class: 'tabs-ui2 tabs-primary pl20 pr20', //No I18N
                        type: 'tab', //No I18N
                        tabs: tabsToShow,
                        active: window.location.hash ? window.location.hash.substring(1) : "details", // No I18N
                        active: window.location.hash ? window.location.hash.substring(1) : $ciCommon.defaultTab ? $ciCommon.defaultTab : "details", // No I18N
                        custom: true,
                        settings: {
                            details: {
                                show: true,
                                style: { "min-height": _self.getTabHeight() + 'px' }, // No I18N
                                display_name: translate('common.details'), // No I18N
                                renderfunction: _self.viewDetails,
                                HTML: '<div id="cmdb-container"><div class="accordion-log accordion-timeline"><div id="' + e_attr(moduleName) + '_description" class="mt20 mb10 panel hide"></div></div><div id="cmdb-module-container" class="form-template"></div></div>'
                            },
                            relationship: {
                                show: true,
                                style: { "min-height": _self.getTabHeight() + 'px' }, // No I18N
                                display_name: translate("ae.cmdb.admin.citype.relationships"), // No I18N
                                template: "cirelationship-tab", // No I18N
                                renderfunction: _self.viewRelationships,
                                template_namespace: "cmdb" //No I18N
                            },
                            history: {
                                show: true,
                                style: { "min-height": _self.getTabHeight() + 'px' }, // No I18N
                                display_name: translate('common.history'), // No I18N
                                afterRenderfunction: _self.afterRenderHistory,
                                href: '/common/ViewHistory.jsp?id=' + model.entity_id + '&module=cmdb&is_new_history=true&ci_type=' + e_param(module_details.api_plural_name) + '&is_date_filter=true&key=' + e_param(module_details.api_plural_name) + '_history_sort_order', //No I18N
                                HTML: '<div id="ui-framework-design1"><div id="' + e_attr(moduleName) + 'History_DIV"></div></div>' //No I18N
                            }
                        }
                    },
                    right_panel: {
                        show: $ciCommon.isPopup ? false : true,
                        toggle: $ciCommon.isPopup ? false : true,
                        template: 'cmdb-right-panel', // No I18N
                        template_namespace:"cmdb",   //No I18N
                        dataCallback: function(data){
                            const summary = $ciAssociation.getAssociationSummary();
                            return jQuery.isEmptyObject(summary)?undefined:summary;
                        },
                        afterRenderfunction : function(panelObj){
                            const summary = $ciAssociation.getAssociationSummary();
                            const container = jQuery("#association_summary");
                            for(let module_data of summary){
                                const html = `<div class="disp-t mb10">
                                <div class="disp-c vmiddle" style="width: 290px;">
                                    <p class="text-color4 m0 vmiddle">`+module_data.display_key+
                                    `</p>
                                </div>
                                <div class="disp-c">
                                    <span class="badge ui1 default-c cur-ptr" name="${module_data.name}_count" id="${module_data.name}_count";">${module_data.count}</span>
                                </div>
                                </div>`;
                                container.append(html);
                                jQuery("#"+module_data.name+"_count").off("click").on("click",function(){
                                    $ciAssociation.setListToRender(module_data.name);
                                    jQuery("[data-detail-tab=association]").trigger("click");
                                });
                            }
                            _self.setOnClickEvents();
                        }
                    }
                }
              }
            };
            this.opt = opt;
            if (sdp_app.IS_SDP){
                if($ciAssociation.getAssociationSummary().length != 0){
                    this.opt.panel_details.content_panel.tabs_panel.settings.association = {
                        show: true,
                        style: { "min-height": _self.getTabHeight() + 'px' }, // No I18N
                        display_name: translate('common.associations'), // No I18N
                        template : "ciassociation-template",    // No I18N
                        dataCallback: function(data){
                            const summary = $ciAssociation.getAssociationSummary();
                            return $ciAssociation.getAssociationSummary().length != 0 ? summary : undefined;
                        },
                        renderfunction: this.viewAssociation,
                        template_namespace:"cmdb"   //No I18N
                    };
                    //insert at second position
                    this.opt.panel_details.content_panel.tabs_panel.tabs.splice(1,0,'association');   //NO I18N
                }
            }
        this.detComp = new DetailsComponent(opt, this);
    },
    /**
     * set onclick events for right panel
     */
    setOnClickEvents : function(){
        const _self = this;
        const data = $ciCommon.entityData;
        /**
         * set onclick event for link ci button
         */

        if (data.links.edit && $ciCommon.canShowMarkasCIButton) {
            jQuery("#link_ci_btn").off("click").on("click", function () {
                _self.CIPanelSlider();
            });
        }
        if(data.linked_entity){
            /**
             * set onclick event for delete ci link
             */
            if (data.links.edit) {
                jQuery("#delete_link_btn").off("click").on("click", function () {
                    _self.removeLinkCI();
                });
            }
            const linked_entity = data.linked_entity.name;
            const linked_instance = data.linked_instance.id;
            const canViewInstance = data.linked_instance.can_view_associated_instance;
            /**
            * set onclick event for linked instance to view details in slider
            */
            if (linked_entity == "software_installation" && canViewInstance) {
                jQuery("#linked_instance").addClass("cur-ptr");
                jQuery("#linked_instance").off("click").on("click", function () {
                    assetsObj.loadSoftwareCIDetailsPopup(linked_instance);
                });
            }
            else if (linked_entity == "user" && canViewInstance) {
                jQuery("#linked_instance").addClass("cur-ptr");
                jQuery("#linked_instance").off("click").on("click", function () {
                    $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + linked_instance + '&minContent=true&externalframe=true', translate('sdp.inventory.wsRtPanel.userDetails'), '600px');
                });
            }
            else if (linked_entity == "department" && canViewInstance) {
                jQuery("#linked_instance").addClass("cur-ptr");
                jQuery("#linked_instance").off("click").on("click", function () {
                    assetsObj.loadDepartmentDetailsPopup(linked_instance);
                });
            }
            else if (linked_entity !== "asset_sub_switch_port" &&  (linked_entity.indexOf("asset_") == 0 || linked_entity.indexOf("custom_asset_") == 0) && canViewInstance) {
                const module = data.linked_instance.module.api_plural_name;
                jQuery("#linked_instance").addClass("cur-ptr");
                jQuery("#linked_instance").off("click").on("click", function () {
                    assetsObj.loadAssetDetailPopup(linked_instance, module);
                });
            }
            else if (linked_entity == "service_category" && canViewInstance) {
                jQuery("#linked_instance").addClass("cur-na");
            }
            else if (linked_entity == "support_group" && canViewInstance) {
                jQuery("#linked_instance").addClass("cur-ptr");
                jQuery("#linked_instance").off("click").on("click", function () { //No I18N
                    assetsObj.loadSupportGroupDetailsPopup(linked_instance);
                });
            }
            else{
                jQuery("#linked_instance").addClass("cur-na opac5");
            }
        }
        //init attachment component in right panel
        _self.initCIAttachments(data.id, data.module.api_plural_name);
    },
    /**
     * After render action panel, construct events for the action panel actions
     */
    afterRenderActionPanel: function () {
        jQuery("#previous_page").off("click").on("click", function () { //NO I18N
            $ciForm.previousPage();
        });
        jQuery("#edit_ci").off("click").on("click", function () {   //NO I18N
            $ciForm.editForm();
        });
        jQuery("#copy_ci_popup").off("click").on("click", function () { //NO I18N
            $ciForm.copyCi();
        });
        jQuery("#request_create_link").off("click").on("click", function () {   //No I18N
            $ciAssociation.openRequestForm();
        });
        jQuery("#change_create_link").off("click").on("click", function () {    //NO I18N
            openNewChangeslider("cmdb",$ciCommon.getCIID(),window); //No I18N
        });
        jQuery("#problem_create_link").off("click").on("click", function () {   //NO I18N
            $ciAssociation.openProblemForm();
        });
        jQuery("[name=clusterView]").off("click").on("click", function () { //No I18N
            popoutMap($ciCommon.getCIID(),true);
        });
        jQuery("[name=add_relationship]").off("click").on("click", function () {    //No I18N
            $ciRelationship.openRelationAddForm($ciCommon.getAPIPluralName(), $ciCommon.getAPIName(), $ciCommon.getDisplayName(), $ciCommon.getCIID(), $ciCommon.getCIName());
        });
    },
    /**
     * load details tab
     * @param {*} tabName
     * @param {*} tabSetting
     * @param {*} tabs_panel
     */
    viewDetails: function (tabName, tabSetting, tabs_panel) {
        $ciForm.renderForm('details', tabs_panel.options); //No I18N
        if (!$ciCommon.isPopup){
            $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(),"details",$ciCommon.getCIID(),"details");   //NO I18N
        }
    },
    /**
     * load association tab
     */
    viewAssociation: function () {
        $ciAssociation.initAssociationList();
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(),"details",$ciCommon.getCIID(),"association");   //NO I18N
    },
    /**
     * load relationship tab
     */
    viewRelationships: function (tabName, tabSetting, tabs_panel) {
        const _self = this;
        $ciRelationship.getDataAndConstructRelationship();
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(), "details", $ciCommon.getCIID(), "relationship"); //NO I18N
    },
    /**
     * load history tab
     */
    afterRenderHistory: function () {
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(), "details", $ciCommon.getCIID(), "history"); //NO I18N
    },
    /**
     * render copy CI popup
     */
    copyCi: function () {
        const _self = this;
        renderhbs("#popup_div", "copy-ci-template", {}, false, "cmdb", undefined, false, _self.afterRenderCopyCIPopup); //No I18N
        const options = {
            height: "30%",
            width: "25%",
            title: translate('sdp.cmdb.ciRtPanel.copyci'),
            draggable: true,
            className: 'sdpzcompdialog cust-width', //No I18N

        };
        _self.copyCIDialog = jQuery("#copy_CIDig").sdp_zcomponent_dialog(options);
    },
    /**
     * after render copy CI popup, set validation for copy CI and set events for copy CI
     */
    afterRenderCopyCIPopup: function () {
        const _self = this;
        initFormValidator("copy_ci_form", //NO I18N
            {
                copy_ci_input: {
                    min: 1,
                    max: 10,
                    number: true,
                    required: true
                }
            }, {
                copy_ci_input: {
                    max: translate("ae.asset.max.num.limit", [10]), //NO I18N
                    min: translate("ae.asset.min.num.limit", [1]),
                    required: translate("sdp.inventory.copyWS.invalidCountMsg")
                }
            },
            (error, elemet) => {
                error.addClass("left0 mt5");
            }
        );
        jQuery("#copy_ci_save").on("click", function () {
            window.top.$ciForm.copyCiSubmit($ciCommon.getCIID(), $ciCommon.getAPIPluralName());
        });
        jQuery("#copy_ci_cancel").on("click", function () {
            window.top.$ciForm.copyCIDialog.sdp_zcomponent_dialog("close"); //No I18N
        });
        jQuery("#copy_ci_form").on("submit", function (e) {
            e.preventDefault();
            if(jQuery(this).valid()){
                window.top.$ciForm.copyCiSubmit($ciCommon.getCIID(), $ciCommon.getAPIPluralName());
            }
            return false;
        });
        setTimeout(() => {
            jQuery("#copy_ci_input").focus();
        }, 100);
    },
    /**
     * save action for copy CI
     * @param {*} entity_id
     * @param {*} module
     * @returns
     */
    copyCiSubmit: function (entity_id, module) {
        const _self = this;
        if (jQuery("#copy_ci_input").valid()) {
            const noOfCopies = jQuery("#copy_ci_input").val();
            sdpAjax({
                method: 'post', //NO I18N
                url: "/api/v3/" + module + "/" + entity_id + "/_copy", //NO I18N
                data : sdpAjaxInputData({copy:{number_of_copies:noOfCopies}}),
                success: function (data) {
                    const result = data.response_status[0].status;
                    _self.copyCIDialog.sdp_zcomponent_dialog("close");    //No I18N
                    if (result === "success") //NO I18N
                    {
                        showalert("success", translate('ae.asset.copied.successmsg'), "isAutoHide=true"); // No I18N
                    } else {
                        showalert("failure", result, "isAutoHide=true"); // No I18N
                    }
                },
                ignorefailuremessage: true,
                error: (response) => {
                    let error;
                    if (response && response.responseJSON && response.responseJSON.response_status && response.responseJSON.response_status[0] && response.responseJSON.response_status[0].messages) {
                        error = response.responseJSON.response_status[0].messages[0];
                    } else {
                        error = undefined;
                    }

                    if(!error) {
                        showalert("failure", sdtranslate("sdp.api.unknown.error"), "isAutoHide=true"); //No I18N
                        return;
                    }

                    const field = $ciCommon.getDisplayNameOfField(error.field);
                    const message = error.message;

                    showalert("failure", e_html(message + (field ? " - " + field : "")), "isAutoHide=true"); //No I18N
                },
                beforeSend: () => {
                    jQuery("#copy_ci_save").button("loading"); //No I18N
                },
                complete: () => {
                    jQuery("#copy_ci_save").button("reset"); //No I18N
                }
            });
        }
    },
    /**
     * link CI slider
     */
    CIPanelSlider: function () {
        const _self = this;
        _self.renderLinkCI().then(function (selectedData) {
            const options = {
                title: translate("sdp.cmdb.link.this.ci"), // No I18N
                type: "modal", //No I18N
                width:'1000px', //No I18N
                height : jQuery(window).height(), //No I18N
                className: 'sdpzcompdialog cust-width', //No I18N
                modal: "true",
                position: {
                    right: "0px", //No I18N
                    top: "0px" //No I18N
                },
                draggable: false,
                resizable: {
                    directions: "w" ,//No I18N
                    minWidth: 920
                },
                focusOnOpen: false,
                animation: {
                    open: {
                        className:'zeffects--slideright', //No I18N
                        duration:300
                    }
                },
                closeOnEscKey: true
            };
            if(sdp_user.DIRECTION == "RTL") {
                options.position = {
                    left: "0px", //No I18N
                    top: "0px" //No I18N
                };
                options.resizable = {
                    directions: "e" , //No I18N
                    minWidth: 920
                };
                options.animation={
                    open:{
                        className:'zeffects--slideleft', //No I18N
                        duration: 300
                    },
                    close: {
                        className: "zeffects--slideleft--reverse", //No I18N
                        duration: 300
                    }
                }
            }
            _self.linkCIDialog = jQuery('#linkci_holder').sdp_zcomponent_dialog(options);
            _self.initModuleFilter(selectedData);

        });
    },
    /**
     * render link ci home template and set events for link CI
     * @returns
     */
    renderLinkCI: function () {
        const _self = this;
        const selectedData = $ciCommon.firstLinkedEntity;
        if (!jQuery.isEmptyObject(selectedData)) {
            return new Promise(function (resolve, reject) {
                jQuery("#linkci_container").append('<div id="linkci_holder"></div>');
                renderhbs("#linkci_holder", "linkci-home", null, false, "cmdb", undefined, false, function () {  //No I18N
                    jQuery("#source_module").off("change").on("change", function () {   //No I18N
                        _self.linkCITableObject.destroy();
                        _self.initLinkCI();
                    });
                    jQuery("#link_ci_submit").off("click").on("click", function () {    //No I18N
                        _self.linkCI($ciCommon.getAPIName(), $ciCommon.getAPIPluralName(), $ciCommon.getCIID());
                    });
                    jQuery("#link_ci_cancel").off("click").on("click", function () {    //No I18N
                        _self.closeLinkCISlider();
                    });
                    resolve(selectedData);
                });
            });
        }
    },
    /**
     * close panel slider
     */
    closeLinkCISlider: function () {
        this.linkCIDialog.sdp_zcomponent_dialog("close"); //No I18N
    },
    /**
     * init module dropdown for link CI with selected data
     * @param {*} selectedData
     */
    initModuleFilter: function (selectedData) {
        const _self = this;
        jQuery("#source_module").sdp_select2({
            value: selectedData,
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
        _self.initLinkCI();
    },
    /**
     * load list view for link CI
     */
    initLinkCI: function () {
        const _self = this;
        const linkedEntityName = jQuery('#source_module').select2('data').api_plural_name; //NO I18N
        const data = {
            key_name : $ciCommon.getCallBackName(linkedEntityName),
            api_name : linkedEntityName,
            isMarksAsCI : false
        };
        $ciCommon.otherModuleLoaded = linkedEntityName;
        $ciCommon.setOtherModuleFields(linkedEntityName, function(){
            renderhbs("#link-ci-listview-container", "cmdb-other-module-listview", data, false, "cmdb", undefined, false,function(){ //No I18N
                $ciCommon.initSiteFilter(linkedEntityName,null,"site-other-module-filter"); //No I18N
                jQuery("#site-other-module-filter").off("change").on("change", function () {    //NO I18N
                    $ciCommon.applySiteFilter("site-other-module-filter",_self.linkCITableObject);    //No I18N
                });
            });
            WebComponents.instancePool["webc-link-ci-list"] = undefined; //remove reference to re render list. // No I18N
            WebComponents.render("webc-link-ci-list");
            _self.linkCITableObject = WebComponents.getInstance("webc-link-ci-list"); // No I18N
        })
    },
    /**
     * get columns required for link CI based on the selected module
     * @param {*} personalize_key
     * @returns
     */
    getTableData: function (personalize_key) {
        const _self = this;
        const tableData = getPersonalizeData(personalize_key);
        if (!jQuery.isEmptyObject(tableData)) {
            return tableData;
        }
        const linked_entity_name = jQuery('#source_module').select2('data').api_plural_name || $ciCommon.firstLinkedEntity.api_plural_name; //NO I18N
        const listOptions = _self.getOptions(linked_entity_name);
        let columnOrder = listOptions.column_order;
        let fields_required = {};
        columnOrder && columnOrder.forEach(function (field) {
            fields_required[field] = {};
        });
        const list_info = listOptions.list_info;
        list_info.sort_field = "name"; //NO I18N
        list_info.sort_order = "asc"; //NO I18N
        list_info.row_count = "25";
        const inputObject = {
            fields_required: fields_required,
            column_order: columnOrder,
            list_info: list_info
        };
        return inputObject;
    },
    /**
     * construct input data for link CI
     * @param {*} table_info
     * @returns
     */
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
        let fields_required = Object.keys(table_info.fields_required);
        if ($ciCommon.otherModuleLoaded == "users") {
            if (fields_required.indexOf("site") != -1) {
                fields_required.splice(fields_required.indexOf("site"),1);
                fields_required.push("department");
            }
        }
        const inputObject = {
            fields_required: fields_required,
            list_info: table_info.list_info
        };
        return inputObject;
    },
    /**
     * get table width for link CI
     * @returns
     */
    setTableWidthForLinkCI: function () {
        return jQuery('#linkci_container').width() - 50;
    },
    headerDataConstructMarkAsCI : function(){
        return this.headerDataConstruct(false);
    },
    headerDataConstructForLinkCI : function(){
        return this.headerDataConstruct(true);
    },
    /**
     * construct header data for link CI
     * @returns
     */
    headerDataConstruct: function (isRadio) {
        const entity = jQuery('#source_module').select2('data').api_plural_name; //NO I18N
        const key_name = $ciCommon.getCallBackName(entity);
        let metaData = {};
        const iconField = isRadio ?{
            "type" : "radio", // No I18N
            "hide_label" :true, //NO I18N
            "td_class" : "headercheckbox", //NO I18N
            "default": true //NO I18N
        } : {
            "type" : "checkbox", // No I18N
            "hide_label" :true, //NO I18N
            "default": true //NO I18N
        };
        if ("asset_assets" == entity) {
            metaData = {
                [key_name+"_head_chk"]: iconField,
                "module": { //NO I18N
                    value_path: "module.display_name", //No I18N
                    dataCelltransformer:"$ciList.getModuleName"
                },
                "user": {   //No I18N
                    value_path: "user.name" //No I18N
                },
                "department": { //No I18N
                    value_path: "department.name"   //No I18N
                },
                "site": {   //No I18N
                    value_path: "site.name" //No I18N
                },
                "org_serial_number": {}, //NO I18N
                "purchase_cost": { //NO I18N

                    display_type: "currency" //NO I18N
                },
                "operational_cost": { //NO I18N

                    display_type: "currency" //NO I18N
                },
                "total_cost": { //NO I18N

                    display_type: "currency" //NO I18N
                },
                "vendor": {} //NO I18N
            };
        } else if ("users" == entity) { //No I18N
            metaData = {
                [key_name+"_head_chk"]: iconField,
                "department": { //No I18N
                    value_path: "department.name"   //No I18N
                },
                "site" : {  //No I18N
                    value_path: "department.site.name", //No I18N
                    dataCelltransformer: function(data){
                        return data.row_data.department && data.row_data.department.site && data.row_data.department.site != null ? e_html(data.row_data.department.site.name) : "-";
                    }
                },
                "type":{     //No I18N
                    type : "String",     //No I18N
                    value_path : "type", //Here 'type' is User module field name // No I18N
                    text : translate("ae.cmdb.admin.citype.type"),
                    disableSorting : true,
                    dataCelltransformer: function(data){
                        var rdata = data.row_data, userType = "sdp.header.user";     //No I18N
                        if(rdata.is_technician){
                            userType = "sdp.requests.common.technician";     //No I18N
                        }
                        return translate(userType);
                    }
                }
            };
        }
        else{
            metaData = {
                [key_name+"_head_chk"] : iconField,
            };
        }
        return metaData;
    },
    /**
     * get options for linked entity
     * @param {*} entity
     * @returns
     */
    getOptions: function (entity) {
        let options = {};
        switch(entity) {
            case "asset_assets":    //NO I18N
                options.column_order = ["name", "module", "product", "state", "department", "org_serial_number", "asset_tag", ]; //NO I18N
                break;
            case "sites":   //NO I18N
                options.column_order = ["name", "country"]; //NO I18N
                break;
            case "users":   //NO I18N
                options.column_order = ["name", "email_id", "department", "first_name", "middle_name", "last_name", "jobtitle", "mobile", "phone"]; //NO I18N
                break;
            case "software_installations":  //NO I18N
                options.column_order = ["name", "software", "workstation"]; //NO I18N
                break;
            default:
                options.column_order = ["name", "site"]; //NO I18N
        }
        options.fields_required = options.column_order;
        options.list_info = {
            "sort_field": "name",   //No I18N
            "sort_order": "asc",    //No I18N
            "row_count": "25"   //No I18N
        };
        return options;
    },
    getWidth: function () {
        return jQuery("[name=association_toggle]").width();
    },
    getHeight: function () {
        jQuery(window).height() - 120
    },
    /**
     * link ci submit action
     * @param {*} module
     * @param {*} path
     * @param {*} id
     */
    linkCI: function (module, path, id) {
        const _self = this;
        const data = jQuery('#source_module').select2('data'); //NO I18N
        const key_name = $ciCommon.getCallBackName(data.api_plural_name);
        const source_module = data.id;
        const linkedInstanceID = jQuery('[name="' + key_name + '_radio"]:checked').val(); //No I18N
        if (!linkedInstanceID) {
            showalert("failure", translate("common.delete.atleastone"), "isAutoHide=true"); // No I18N
            return;
        }
        const input_data = {
            [module] : {
                linked_entity : {
                    id : source_module
                },
                linked_instance : {
                    id : linkedInstanceID
                }
            }
        };
        sdpAjax({
            url: '/api/v3/' + path + '/' + id, //NO I18N
            method: 'put', //No I18N
            data: sdpAjaxInputData(input_data),
            success: function (res) {
                jQuery.extend($ciCommon.entityData,res[module]);
                _self.closeLinkCISlider();
                _self.renderLinkedInstance();
            },
            error: function (resp) {
                _self.closeLinkCISlider();
            },
            beforeSend: () => {
                jQuery("#link_ci_submit").button("loading"); //No I18N
            },
            complete: () => {
                jQuery("#link_ci_submit").button("reset"); //No I18N
            }
        });
    },
    /**
     * render linked instance
     */
    renderLinkedInstance: function () {
        const _self = this;
        if ($ciCommon.entityData) {
            jQuery('#link-ci').empty().append(_self.getHtmlForLinkCI(true, $ciCommon.entityData));
            _self.setOnClickEvents();
            showalert('success', translate("sdp.cmdb.linkci.success"), 'isAutoHide=true,delay=3,width=auto'); //NO I18N
        }
    },
    getHtmlForLinkCI: function (isLinked, data) {
        const canEdit = data.links.edit;
        if (isLinked) {
            const linkedInstanceHtml = this.getLinkedInstanceHtml(data);
            const linkedTo = translate("ae.cmdb.linked.to", [e_html(data.linked_entity.display_name)]);
            const deleteLinkHtml = canEdit
                ? `<div class="disp-c vmiddle pl10 visi-item brd-left-medium pr10 pl10">
                    <span class="cspr icon-md spad-delete cur-ptr flat" id="delete_link_btn" rel="uitip" title="${translate("sdp.cmdb.linkci.delete.ci.link")}"></span>
                   </div>`
                : '';
            return `<div class="block-bordered block-highlighted">
                        <div class="disp-t fw visi-parent ">
                            <div class="disp-c w-90per">
                                <div class="p10">
                                    <div class="mb5">
                                        <span class="cspr link icon-sm mr5 opac5 vmiddle top0"></span>
                                        <span class="disp-ib max-w250px text-overflow vmiddle" rel="uitip" title="${linkedTo}">${linkedTo}</span>
                                    </div>
                                    ${linkedInstanceHtml}
                                </div>
                            </div>
                            ${deleteLinkHtml}
                        </div>
                    </div>`;
        } else {
            return canEdit && $ciCommon.canShowMarkasCIButton ? `<div class="block-bordered block-highlighted p10">
                        <div>
                            <a href="/" id="link_ci_btn">
                                <span class="cspr link icon-sm mr10 opac5 vmiddle top0"></span>
                                ${translate("sdp.cmdb.linkci.link")}
                            </a>
                            <div id="linkci_container"></div>
                        </div>
                    </div>` : '';
        }
    },
    /**
     * construct html for link CI div
     */
    getLinkedInstanceHtml: function (data) {
        switch(data.linked_entity.name) {
            case "software_installation":   //NO I18N
                const softwareName = data.linked_instance.software.name + "(" +data.linked_instance.workstation.name + ")";
                return `<a id="linked_instance" class="pl25 text-overflow disp-ib maxw-250px"  rel="uitip" title="${e_attr(softwareName)}">${e_html(softwareName)}</a><div id="softwareCIPopup" class="disp-h p20" role="dialog"></div>`;
            case "user":    //NO I18N
                return `<a id="linked_instance" class="pl25 text-overflow disp-ib maxw-250px"  rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a>`;
            case "department":  //NO I18N
                return `<a id="linked_instance" class="pl25 text-overflow disp-ib maxw-250px"  rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a><div id="departmentPopup" class="disp-h p20" role="dialog"></div>`;
            case "service_category":    //NO I18N
                return `<a id="linked_instance" class="pl25 text-overflow disp-ib ptr-ev maxw-250px"  rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a>`;
            case "asset_sub_switch_port":
                const switchName = "Switch_Port_" + data.linked_instance.index;
                return `<span class="pl25 text-overflow disp-ib ptr-ev maxw-250px"  rel="uitip" title="${e_attr(switchName)}">${e_html(switchName)}</span>`;
            case "support_group":  //NO I18N
                return `<a id="linked_instance" class="pl25 text-overflow disp-ib maxw-250px"  rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a><div id="supportGroupPopup" class="disp-h p20" role="dialog"></div>`;
            default:
                if (data.linked_entity.name.indexOf("asset_") == 0 || data.linked_entity.name.indexOf("custom_asset_") == 0){
                    return `<a id="linked_instance" class="pl25 text-overflow disp-ib maxw-250px"  rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a><div id="departmentPopup" class="disp-h p20" role="dialog" ></div>`;
                }
                return `<a href="/" class="pl25 text-overflow disp-ib ptr-ev cur-na opac5 maxw-250px" rel="uitip" title="${e_attr(data.linked_instance.name)}">${e_html(data.linked_instance.name)}</a>`;
        }
    },
    /**
     * delink CI
     * @param {*} module
     * @param {*} id
     */
    removeLinkCI: function (module, id) {
        const _self = this;
        const input_data = {
            [$ciCommon.getAPIName()] : {
                linked_entity: null,
                linked_instance: null
            }
        };
        sdpAjax({
            url: '/api/v3/' + $ciCommon.getAPIPluralName() + '/' + $ciCommon.getCIID(), //NO I18N
            method: 'put', //No I18N
            data: sdpAjaxInputData(input_data),
            success: function (res) {
                res = res[$ciCommon.getAPIName()];
                jQuery.extend($ciCommon.entityData, res);
                jQuery('#link-ci').empty().append($ciForm.getHtmlForLinkCI(false, $ciCommon.entityData));
                _self.setOnClickEvents();
                showalert('success', translate("sdp.cmdb.lickci.delink"), 'isAutoHide=true,delay=3,width=auto'); //NO I18N
            },
            error: function (resp) {
                showalert("failure", resp.response_status[0].status, "isAutoHide=true"); // No I18N
            }
        });
    },
    /**
     * init attachment component for CI in right panel
     * @param {*} id
     * @param {*} module
     */
    initCIAttachments: function (id, module) {
        /** CI Attachments (Rightside popUp) */
        if ($ciCommon.isActiveCI()){
            this.attachRPPreview = new attachPreview("#attachmentDropdown", { // No I18N
                entity_id: id,
                entity: module,
                api: true,
                is_odapi: true,
                layouts: false,
                onupload: ['$ciForm.updateSuccessCallback', window], //No I18N
                ondelete: ['$ciForm.updateSuccessCallback', window], //No I18N
                popover: {
                    enable: true,
                    target: '#attachmentDropdownTarget' //NO I18N
                },
                type: "field", //NO I18N
                enable_delete: true,
                upload: true
            });
        }
    },
    updateSuccessCallback: function (obj) {
        data = window.top.$ciCommon.entityData;
        sdpAjax({
            url: "/api/v3/" + data.module.api_plural_name + "/" + data.id + "/attachments", //No I18N
            data: sdpAjaxInputData({
                list_info: {
                    row_count: 100
                }
            }),
            success: function (resp) {
                resp = resp.attachments;
                window.top.$ciCommon.entityData.attachments = resp;
                const html = '<span style="pointer-events:none" aria-hidden="true" class="cspr paperclip icon-sm opac5"></span>&nbsp;(' + resp.length + ')&nbsp;<span class="caret" style="pointer-events:none"></span'; //No I18N
                jQuery("#attachmentDropdown").html(html);
            }
        });
    },
    afterRenderHeaderPanel : function(){
        jQuery("[name=clusterView]").off("click").on("click", function () { //No I18N
            popoutMap($ciCommon.getCIID(),true);
        });
    },
    getTabHeight: function () {
        return jQuery(window).height() - (jQuery('#header-placeholder').outerHeight() + 260);
    },
    //************** CI Details Related methods ends **************//

    entity_id: null,
    model: null,
    isSaveAndAddNew: false,
    //Function to render the form
    renderForm: function (mode, model) {
        const entityId = model.entity_id ? model.entity_id : null;
        const module_details = model.module_details;
        const plural_name = module_details.api_plural_name;
        const api_name = module_details.name;
        mode = (mode !== 'details') ? (entityId === "null" || entityId === null) && (model.ids === "null" || model.ids === null) ? 'new' : 'edit' : 'view'; //No I18N
        const entity_data = entityId ? model.data.entity_data : null;
        const moduleLayout = $ciCommon.modifiedLayout;
        const permissions = model.permissions;
        /**
         * need to select first site by default for site field of CI.
         */
        $ciCommon.originalMetadata.metadata.metainfo.fields.site.default_value =  $ciCommon.firstSite
        if(entity_data && entity_data.site == null){
            entity_data.site = {id: 0, name: translate("common.site.nosite")}; //No I18N
        }
        const formoptions = {
            name: 'cmdb_form', //No I18N
            entity: plural_name,
            entitypath: '/' + plural_name,
            entityName: module_details.display_name,
            entitydata: entity_data,
            template: moduleLayout,
            metadata: $ciCommon.originalMetadata.metadata.metainfo,
            mode: mode,
            disableSort: true,
            container: (mode === 'view') ? 'cmdb-module-container' : 'cmdb-container', //No I18N
            formid: 'cmdb_form', //No I18N
            customform: (mode === 'view') ? false : true, //No I18N
            skipFields: ['created_time', 'created_by', 'updated_time', 'updated_by'], //No I18N
            canEdit: $ciCommon.isActiveCI() && (permissions.add || permissions.edit ? true : false) && !$ciCommon.isPopup,
            afterRenderCallback: function (formEle) {
                if ($ciCommon.mode == 'bulkEdit') {
                    $ciList.bulkUpdateDialog.sdp_zcomponent_dialog("option", "position", {    //No I18N
                        my: "center",   //No I18N
                        at: "center",   //No I18N
                        of: window
                    });
                }
                if (formEle.options.mode === 'new' || formEle.options.mode === 'edit') {
                    formEle.focusField("name"); //No I18N
                }
            },
            save: {
                url: '/api/v3/' + plural_name + (!(entityId === "null" || entityId === null) ? '/' + entityId : !(model.ids === null || model.ids === "null") ? '?ids=' + model.ids : ""), //No I18N
                entity: api_name,
                exit_alert: true,
                submit: true,
                custom: mode == 'new' ? [ //NO I18N
                    {
                        name: translate("sdp.common.saveandadd"), //NO I18N
                        type: "default", //NO I18N
                        action: "$ciForm.saveAndUpdate" //NO I18N
                    }
                ] : null,
                cancel: '$ciForm.cancelForm', //No I18N
                serializer: function (payload, form, event) {
                    // if (payload[api_name].status && payload[api_name].status !== "null") {
                    //     delete payload[api_name].status.name;
                    // }
                    if (payload[api_name].site && (payload[api_name].site.id == 0 || payload[api_name].site.id == -1)){
                        payload[api_name].site = null;
                    }
                    return payload;
                },
                postserializer: function (response, form) {
                    if ($ciCommon.mode != 'bulkEdit'){
                        if (response[api_name].site == null) {
                            response[api_name].site = {
                                id: 0,
                                name: translate("common.site.nosite")
                            }
                        }
                        form.entitydata = response[api_name]
                    }
                },
                postsuccess: '$ciForm.postUpdate' //NO I18N
            },
            edit: {
                fields: {
                    "site": { //NO I18N
                        allowClear: false,
                        processResults: function (search_data, data, field, self) {
                            // In Some case, the API have not specified id as "-1"
                            // but the form component handle not specified value as "0"
                            // For the uniformity, we changed the id from "-1" to "0"
                            // This will eleminate handle the cases in plenty of place
                            if (data.id == -1) {
                                data.id = 0;
                            }
                            if (search_data.length && self.settings && self.settings.default_option && self.settings.default_option.id == data.id) {
                                return;
                            }
                            search_data.push(data);
                        },
                    },
                },
                defaults: {
                    multi_select: {
                        placeholder: ""
                    },
                    lookup: {
                        clear: true
                    }
                }
            }
        };
        /* in bulkedit mode, initially site value is 0. When not associated to any site selected, the value will null.
        *  So, we need to handle this case to show the site field as changed. To update site as null
        */
        if($ciCommon.mode === 'bulkEdit'){
            formoptions.edit.fields.site.onchange = function(field,form,event){
                let isChanged = false;
                const fname = field.name;
                const beforeSiteVal = this.fields.values[fname];
                const siteVal = field.value;
                if (beforeSiteVal == "0" && siteVal == null){
                    isChanged = true;
                }
                var changeIndex = this.fields.changed.indexOf(fname);
                if(isChanged) {
                    field.isChanged = true;
                    changeIndex === -1 && this.fields.changed.push(fname);
                    this.fields[fname].current_value = siteVal !== undefined ?  siteVal : null;
                }
            }
        }
        new FC(formoptions);
    },
    /**
     * set isSaveAndAddNew to true and submit the form
     * @param {*} data
     */
    saveAndUpdate: function (data) {
        this.isSaveAndAddNew = true;
        FC.submit('form_cmdb_form'); //NO I18N
    },
    /**
     * post success of form submit
     * if it is bulkedit then show the summary of the bulk update
     * if it is save and add new then render the add new form
     * else render the details page
     * @param {*} data
     */
    postUpdate: function (data) {
        const _self = this;
        if ($ciCommon.mode === 'bulkEdit') {
            data.response_status.forEach(function (value) {
                if (value.status !== 'success') {
                    data.responseJSON = {};
                    data.responseJSON.response_status = data.response_status;
                    const options = {
                        response: data,
                        records: window.top.$ciList.ciListTableObject.bulkSelect.selectedRecords,
                        metainfo: window.top.$ciList.ciListTableObject.t_obj.meta_info
                    };
                    messageHandling.updateFailureSummary(options);
                }
            });
            //show bulk update failure summary.
            if (messageHandling.summary.failedRecords.length > 0) {
                const msg = {
                    noOfRecordsUpdatedMsg: translate("sdp.cmdb.bulkupdate.no.cis.updated"), //NO I18N
                    noOfRecordsFailedMsg: translate("sdp.cmdb.bulkupdate.no.cis.failed"), //NO I18N
                    entity: $ciCommon.getDisplayName()
                }
                window.top.$ciList.bulkUpdateDialog.sdp_zcomponent_dialog("close"); //NO I18N
                window.top.$ciList.ciListTableObject.refreshTable();
                const html = renderhbs(null, 'bulk-update-summary', {...msg, ...messageHandling.summary}, false, 'users', null, true, null, true); //No I18N
                window.top.jQuery(html).dialog({
                    width: 800,
                    height: 600,
                    modal: true,
                    title: translate("sdp.requests.viewrequest.summary")
                });
            } else {
                window.top.$ciList.ciListTableObject.refreshTable();
                window.top.$ciList.bulkUpdateDialog.sdp_zcomponent_dialog("close"); //NO I18N
            }
        } else if (_self.isSaveAndAddNew) {
            const dataObj = {
                mode: 'add',    //No I18N
                module: $ciCommon.getAPIPluralName()
            };
            $ciCommon.renderPage(dataObj);
            _self.isSaveAndAddNew = false;
        } else {
            const loadedFromdata = {
                api_name : $ciCommon.getAPIName(),
                type_id : $ciCommon.getModuleId(),
                api_plural_name : $ciCommon.getAPIPluralName()
            };
            if ($ciCommon.mode != "details") {
                $ciForm.showDetailsPage(data[$ciCommon.getAPIName()].id, $ciCommon.getAPIPluralName(), loadedFromdata);
            }
            else{
                $ciForm.detComp.options.data.entity_data = data[$ciCommon.getAPIName()];
            }
        }
    },
    /**
     * navigate to previous page
     */
    previousPage: function () {
        const _self = this;
        const dataObj = {
            mode: 'list'   //No I18N
        };
        if (_self.loadedFrom) {
            dataObj.module = _self.loadedFrom.api_plural_name;
        }
        else {
            dataObj.module = $ciCommon.getAPIPluralName()
        };
        /**
         * load inactive list if the current CI is inactive
         */
        $ciCommon.loadInactiveList = !$ciCommon.isActiveCI();

        if (this.entity_id != "null") {
            dataObj.entity_id = this.entity_id;
        }
        delete $ciAssociation.association_summary;
        $ciCommon.renderPage(dataObj);
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(), dataObj.mode, this.entity_id);
    },
    /**
     * cancel event for form
     * @returns
     */
    cancelForm: function () {
        if ($ciCommon.mode === 'bulkEdit') {
            window.top.$ciList.bulkUpdateDialog.sdp_zcomponent_dialog("close"); //NO I18N
            return;
        }
        // for inline edit, mode will be details
        if ($ciCommon.mode === 'details'){
            return;
        }
        const _self = this;
        const dataObj = {};
        if($ciCommon.loadedFrom){
            dataObj.mode = 'list';   //No I18N
            dataObj.module = $ciCommon.loadedFrom.api_plural_name;
            delete $ciCommon.loadedFrom;
        }
        else{
            dataObj.mode = $ciCommon.getCIID() ? 'details' : "list";   //No I18N
            dataObj.module = $ciCommon.getAPIPluralName();
            dataObj.entity_id = $ciCommon.getCIID();
        }
        $ciCommon.renderPage(dataObj);
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(), dataObj.mode, this.entity_id);
    },
    /**
     * edit form
     */
    editForm: function () {
        const dataObj = {
            mode: "edit",   //No I18N
            entity_id: this.entity_id ? this.entity_id : $ciCommon.getCIID(),
            module: $ciCommon.getAPIPluralName()
        };
        $ciCommon.renderPage(dataObj);
        $ciCommon.pushingStateURL($ciCommon.getAPIPluralName(), "edit", this.entity_id ? this.entity_id : $ciCommon.getCIID()); //NO I18N
    },
    /**
     * render details page from list view
     * @param {*} entity_id
     * @param {*} module
     * @param {*} api_name
     * @param {*} type_id
     * @param {*} fromAllCIsView
     */
    showDetailsPage: function (entity_id, module, loadedFrom) {
        this.loadedFrom = loadedFrom;
        const dataObj = {
            mode: 'details',    //No I18N
            entity_id: entity_id,
            module: module
        };
        $ciCommon.renderPage(dataObj);
        $ciCommon.pushingStateURL(module, "details", entity_id); //NO I18N
    }
};
Handlebars.registerHelper("setCIRightPanelValue", function (key) { //NO I18N
    let html = ""; //No I18N
    const data = $ciCommon.entityData;
    switch (key) {
        case 'attachments': //NO I18N
            let liHtml = '';
            let attachment = data.attachments;
            for (let i = 0, ilen = attachment.length; i < ilen; i++) {
                let obj = attachment[i];
                liHtml += '<button type="button" data-href="' + obj.content_url + '" data-index="' + i + '" data-attach-size="' + obj.size.display_value + '">' + e_html(obj.name) + '</button>'; //No I18N
            }
            html += '<div class="form-control-static colon" > <div class="btn-group bs-noconflict ' + ($ciCommon.isActiveCI() ? '' :' disable-opacity3') + '  "><button type="button" class="a-tag-btn-ovwrt" data-target-id="#attachmentDropdownTarget" id="attachmentDropdown" custom-class="attachPopup"><span style="pointer-events:none" aria-hidden="true" class="cspr paperclip icon-sm opac5"></span>&nbsp;(' + attachment.length + ')&nbsp;<span class="caret" style="pointer-events:none"></span></button></div></div><div id="attachmentDropdownTarget" class="hidden">' + liHtml + '</div> '; //No I18N
            break;
        case 'link-ci': //NO I18N
            if (data.linked_entity) {
                html += $ciForm.getHtmlForLinkCI(true, data);
            } else {
                html += $ciForm.getHtmlForLinkCI(false, data);
            }
            break;
    }
    return html;
});