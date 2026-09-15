var $ciAssociation = {
    selectedFilter: {},
    openStatusFilter: {
        "request": "All_Pending", //NO I18N
        "problem": "open_problems", //NO I18N
        "change": "open_changes", //NO I18N
        "release": "open_releases" //NO I18N
    },
    /**
     * set association summary
     * @returns
     */
    setAssociationSummary: function (model,callback) {
        const _self = this;
        if (!sdp_app.IS_SDP){
            _self.association_summary = [];
            callback(model);
        }
        else {
            sdpAjax({
                url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/" + $ciCommon.getCIID() + "/_ci_association_count", // No I18N
                success: function (response) {
                    _self.association_summary = response.ci_association_count;
                    callback(model);
                }
            });
        }
    },
    /**
     * get association summary
     * @returns
     */
    getAssociationSummary : function(){
        return this.association_summary;
    },
    /**
     * set list to render after loading association tab
     */
    setListToRender : function(module){
        this.listToRender = "#"+module+"_toggle"; //NO I18N
    },
    /**
     * load association tab
     */
    initAssociationList: function () {
        const _self = this;
        sdpAjax({
            url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/_association_filter", //NO I18N
            success: function (data) {
                if (data.association_filter != null) {
                    _self.association_filter = data.association_filter;
                }
                jQuery("[name=association_toggle").each(function (index, el) {
                    const parent = jQuery(el).parent();
                    parent.on("click", function () {   //NO I18N
                        _self.renderAssociationListView(jQuery(el).data("module"),jQuery(el).data("api_plural_name"));  //NO I18N
                    });
                });
                if (_self.listToRender) {
                    jQuery(_self.listToRender).trigger("click");
                    delete _self.listToRender;
                }
            }
        });
    },
    /**
     * render list view
     * @param {*} api_name
     * @param {*} api_plural_name
     * @returns
     */
    renderAssociationListView : function(api_name,api_plural_name){
        const _self = this;
        if (jQuery("#webc-ci-"+api_name+"-list").length) {
            return;
        }
        const data = {
            ciid : $ciCommon.getCIID(),
            api_name : api_name,
            api_plural_name : api_plural_name
        };
        _self.getMetainfoAndRenderList(api_plural_name,function(){
            renderhbs("#ci-"+api_name+"-listview-container", "ci-association-listview-template", data, false, "cmdb", undefined, false); //No I18N
            WebComponents.instancePool["webc-ci-"+api_name+"-list"] = undefined; //remove reference to re render list. // No I18N
            WebComponents.render("webc-ci-"+api_name+"-list");
            WebComponents.getInstance("webc-ci-"+api_name+"-list"); // No I18N
            let selectedFilter = _self.selectedFilter[api_name];
            let openStatus = _self.openStatusFilter[api_name];
            if (_self.association_filter[api_name] != null) {
                jQuery.each(_self.association_filter[api_name], function (index, val) {
                    if (selectedFilter == undefined && val.internal_name == openStatus) {
                        jQuery('#'+api_name+'-filter').text(val.name);
                    }
                    if (selectedFilter == val.id) {
                        jQuery('#'+api_name+'-filter').text(val.name);
                    }
                    jQuery(`#${api_name}-filter-option`).append(`<li><a href="/" name="apply-filter-btn" data-id=${val.id} data-api_name='${api_name}' data-value='${e_attr(val.name)}'>${e_html(val.name)}</a></li>`);
                });
            }
            jQuery("[name=apply-filter-btn]").off('click').on('click', function (e) {   //NO I18N
                e.preventDefault();
                const id = jQuery(this).data("id"); //NO I18N
                const module = jQuery(this).data("api_name");   //NO I18N
                const text = jQuery(this).data("value");    //NO I18N
                _self.filterAssociationList(id,module,text);
            });
            // setting min height to table
            jQuery("#"+api_name+"_div").addClass("minh-400px"); //NO I18N
        });
    },
    getMetainfoAndRenderList : function(module,callback){
        const _self = this;
        let neededFields = [];
        let for_key = "list_view"; //NO I18N
        switch(module) {
            case 'requests':
                neededFields = ["id", "subject", "requester", "status", "created_time","created_by"];   //NO I18N
                for_key = "request_list_view"; //NO I18N
                break;
            case 'releases':
                neededFields = ["closure_code","emergency","release_engineer","id","group","created_time","item","impact","release_type","priority","scheduled_end_time","subcategory","scheduled_start_time","status","template","title","urgency","release_manager","site","stage","risk","category"];
                break;
            case 'problems':
                neededFields = ["title","urgency","reported_by","technician","id","group","item","impact","closed_time","priority","site","reported_time","category","subcategory","status","due_by_time","template"];   //NO I18N
                break;
            case 'changes':
                neededFields = ["closure_code","emergency","change_type","change_manager","change_requester","scheduled_start_time","scheduled_end_time","template","change_owner","id","group","created_time","item","workflow","approval_status","impact","priority","subcategory","status","problems","title","urgency","site","stage","completed_time","risk","category"];  //NO I18N
                break;
            default:
                neededFields = [];
        }
        sdpAjax({
            url : "/api/v3/"+module+"/_metainfo", //NO I18N
            data : sdpAjaxInputData({for:for_key}),
            success : function(response){
                let skipFields = [];
                if (module != 'requests'){
                    skipFields = ["configuration_items"]; //NO I18N
                }
                const meta_info = response.metainfo;
                let fields = meta_info.fields;
                for (let key in fields) {
                    if (!neededFields.includes(key) && fields[key].type != "udf") {
                        delete fields[key];
                    }
                }
                _self.otherModuleFields = fields;
                _self.discarded_fields = skipFields;
                callback();
            }
        });
    },
    /**
     * apply filter for list view
     * @param {*} id
     * @param {*} module
     * @param {*} text
     */
    filterAssociationList : function(id,module,text){
        let tObj = WebComponents.getInstance("webc-ci-"+module+"-list");    //NO I18N
        tObj.t_obj.table_info.list_info.filter_by = {"id":id}; //NO I18N
        jQuery("#" + module +"-filter").text(text);
        tObj.refreshTable();
    },
    /**
     * construct table data for list view
     * @param {*} personalize_key
     * @returns
     */
    getTableDataForAssociation: function (personalize_key) {
        const _self = this;
        let columnOrder;
        let associatedModulename = personalize_key.substring(0,personalize_key.indexOf('_ci_list'));
        let tableData = getPersonalizeData(personalize_key);
        if (!jQuery.isEmptyObject(tableData)){
            let filterId = tableData.list_info.filter_by.id;
            tableData.list_info.default_search_criteria = {
                field: "configuration_items", //No I18N
                value: $ciCommon.getCIID(),
                condition: "is"   //No I18N
            };
            _self.selectedFilter[associatedModulename] = filterId;
            return tableData;
        }
        switch(associatedModulename) {
            case "request": //NO I18N
                columnOrder = ["id", "subject", "requester", "status", "created_time"]; //NO I18N
                break;
            case "problem": //NO I18N
                columnOrder = ["id", "title", "reported_by", "technician", "category", "priority", "status", "urgency"]; //NO I18N
                break;
            case "change":  //NO I18N
                columnOrder = ["id", "title", "change_type", "change_owner", "category", "priority", "status", "stage"]; //NO I18N
                break;
            case "release": //NO I18N
                columnOrder = ["id", "title", "release_type", "release_engineer","scheduled_start_time","scheduled_end_time", "priority", "status", "stage"]; //NO I18N
                break;
        }
        let filterId;
        if (_self.association_filter[associatedModulename] != null) {
            let openStatus = _self.openStatusFilter[associatedModulename];
            filterId = _self.association_filter[associatedModulename].find(obj => obj.internal_name == openStatus).id;
        }
        let fields_required = {};
        columnOrder && columnOrder.forEach(function (field) {
            fields_required[field] = {};
        });
        inputObject = {
            fields_required: fields_required,
            column_order: columnOrder,
            list_info: {
                "sort_field": "name",   //No I18N
                "sort_order": "asc",    //No I18N
                "row_count": "25",  //No I18N
                "filter_by": {          //No I18N
                    "id": filterId      //No I18N
                },
                "default_search_criteria": {    //No I18N
                    "field": "configuration_items", //No I18N
                    "value": $ciCommon.getCIID(),  //No I18N
                    "condition": "is"   //No I18N
                },
            }
        };
        return inputObject;
    },
    /**
     * get input data
     */
    getRowInputData : function(table_info){
        var inputObject = {};
        inputObject = jQuery.extend(true, {}, table_info);
        if (inputObject.list_info.default_search_criteria){
            delete inputObject.list_info.default_search_criteria;
        }
        if (inputObject.column_order){
            delete inputObject.column_order;
        }
        if (table_info.fields_required){
            inputObject.fields_required = Object.keys(table_info.fields_required)
        }
        return inputObject;
    },
    /**
     * construct columns for request list view
     * @returns
     */
    headerDataConstructForRequest: function () {
        let metaData = {
            subject : {
                dataCelltransformer : "$ciAssociation.constructRequestNameColumn"   //NO I18N
            }
        };
        const lookupFields = ["requester", "status", "created_by"]; //NO I18N
        return this.constructMetadata(lookupFields,metaData);
    },
    /**
     * construct columns for problem list view
     * @returns
     */
    headerDataConstructForProblem: function () {
        let metaData = {
            title : {
                dataCelltransformer : "$ciAssociation.constructProblemNameColumn"   //NO I18N
            }
        };
        const lookupFields = ["reported_by", "technician", "category", "priority", "status", "urgency"];  //NO I18N
        return this.constructMetadata(lookupFields,metaData);
    },
    /**
     * construct columns for change list view
     * @returns
     */
    headerDataConstructForChange: function () {
        let metaData = {
            title : {
                dataCelltransformer : "$ciAssociation.constructChangeNameColumn"    //NO I18N
            }
        };
        const lookupFields = ["change_type", "change_owner", "category", "priority", "status", "stage"];  //NO I18N
        return this.constructMetadata(lookupFields,metaData);
    },
    /**
     * construct columns for release list view
     * @returns
     */
    headerDataConstructForRelease: function () {
        let metaData = {
            title : {
                dataCelltransformer : "$ciAssociation.constructReleaseNameColumn"   //NO I18N
            }
        };
        const lookupFields = ["release_type", "release_engineer", "priority", "status", "stage"]; //NO I18N
        return this.constructMetadata(lookupFields,metaData);
    },
    /**
     * construct metadata for list view and return
     */
    constructMetadata: function (lookupFields,metaData) {
        lookupFields.forEach(function (field) {
            metaData[field] = {
                value_path: field + ".name" //No I18N
            };
        });
        return metaData
    },
    constructChangeNameColumn : function(data){
        return '<a target="_blank" rel="uitip noopener" mode_ellipsis="true" title="'+e_attr(data.row_data.title)+'" href="/ui/changes?entity_id='+data.row_data.id+'&mode=detail#Submission/details">'+e_html(data.row_data.title)+'</a>';
     },
     constructRequestNameColumn : function(data){
        return '<a target="_blank" rel="uitip noopener" mode_ellipsis="true" title="'+e_attr(data.row_data.subject)+'" href="/WorkOrder.do?woMode=viewWO&woID='+data.row_data.id+'">'+e_html(data.row_data.subject)+'</a>';
     },
     constructProblemNameColumn : function(data){
        return '<a target="_blank" rel="uitip noopener" mode_ellipsis="true" title="'+e_attr(data.row_data.title)+'" href="/ui/problems?mode=detail&entity_id='+data.row_data.id+'#details">'+e_html(data.row_data.title)+'</a>';
     },
     constructReleaseNameColumn : function(data){
        return '<a target="_blank" rel="uitip noopener" mode_ellipsis="true" title="'+e_attr(data.row_data.title)+'" href="/ui/releases?entity_id='+data.row_data.id+'&mode=detail#submission/details">'+e_html(data.row_data.title)+'</a>';
     },
    setHeight: function () {
        const getHeight = function () {
            function getHeightOf(ids) {
                return ids.reduce(function (totalHeight, id) {
                    return totalHeight + (jQuery("#" + id).outerHeight() || 0)
                }, 0);
            }
            return jQuery(window).height() - (120 + getHeightOf(["top-subheader", "topheader-fixed", "sdp-chat-bar", "securityrisk", "content-actions-panel-holder-" + $ciCommon.getAPIName(), "header-panel-" + $ciCommon.getAPIName(), "tabs-panel-" + $ciCommon.getAPIName()])); // No I18N
        };
        return getHeight();
    },
    getOtherOptions : function(){
        return {
            meta_data: this.otherModuleFields,
            discarded_fields: this.discarded_fields
        }
    },
    /**
     * render popup to select request template
     * @param {*} id
     * @param {*} name
     */
    openRequestForm: function (id, name) {
        const _self = this;
        jQuery("#create_request_container").html("<div id='create_request_holder'></div>");
        renderhbs("#create_request_holder", "ci-create-request-template", {}, false, "cmdb", undefined, false,function(){   //NO I18N
            jQuery("#createincidentsave").off("click").on("click", function () {    //NO I18N
                _self.handleCreateRequestDialog();
            });
            jQuery("#createincidentcancel").off("click").on("click", function () {  //NO I18N
                jQuery('#create_request_holder').sdp_zcomponent_dialog('close'); // No I18N
            });
        });
        _self.selectRequestTemplateDialog = jQuery('#create_request_holder').sdp_zcomponent_dialog({
            title: translate("create.request"),
            className: 'sdpzcompdialog cust-width', //NO I18N
            height:  jQuery(".zdialog__content").height() + 49,
            open: function (event, ui) {
                _self.initTemplateSelect2('incident'); //No I18N
                jQuery('input[name=ci_requesttype]').change(function () {
                    _self.initTemplateSelect2(jQuery("input[name='ci_requesttype']:checked").val());
                });
            },
            width: 500,
        });
    },
    /**
     * select selected ci by default in request form
     */
    handleCreateRequestDialog: function () {
        const id = $ciCommon.getCIID();
        const name = $ciCommon.getCIName();
        const template = jQuery('#selectincidenttemplate').select2('data'); //NO I18N
        if (template && template.id) {
            this.selectRequestTemplateDialog.sdp_zcomponent_dialog('close'); // No I18N
            addMoreReqDetails({
                cmdb: {
                    configuration_items: [{
                        id: id,
                        name: name
                    }]
                },
                template: template.id
            });
        } else {
            showalert("failure", translate('sdp.admin.requesttemplate.selecttemplate'), "isAutoHide=true"); //No I18N
        }
    },
    /**
     * init select2 for request template
     * @param {*} module
     * @param {*} destroySelect2
     */
    initTemplateSelect2: function (module) {
        // check if select2 is already initialized. if yes, destroy it and reinitialize
        if (jQuery('#selectincidenttemplate').hasClass('select2-hidden-accessible')) {
            jQuery('#selectincidenttemplate').val("").select2("destroy");
        }
        let is_service_template = true;
        if (module == 'incident') {
            is_service_template = false;
        }
        jQuery('#selectincidenttemplate').sdp_select2({
            closeOnSelect: false,
            allowClear: false,
            url: [{
                url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/_get_request_templates_with_ci_field", //NO I18N
                field: 'template', //NO I18N
                input_data_Callback: function (urlOptions, input_data, searchText) {
                    return {
                        is_service_template: is_service_template,
                        req_temp_search_name: searchText
                    };
                }
            }],
        });
    },
    /**
     * post request creation
     */
    handlePostRequestCreation: function () {
        const _self = this;
        _self.setListToRender('request');   //NO I18N
        jQuery("[data-detail-tab=association]").trigger("click");
        _self.association_summary = undefined;
        _self.setAssociationSummary(undefined,function(modal){
            let summary = _self.getAssociationSummary();
            const requestArray = summary.filter(obj => obj.name == 'request');
            if (requestArray.length > 0) {
                let count = requestArray[0].count;
                let elements = jQuery("#Right-Section").find('[name=request_count]');
                Array.from(elements).forEach((el) => {
                    jQuery(el).html(count);
                });
            }
        });
    },
     /**
     * post change creation
     */
    handlePostChangeCreation: function () {
        $extFrame.getActiveWindow().$previewComponent.closePreview("newchange_popup");  //NO I18N
        const parentWindow = window.top;
        const _self = parentWindow.$ciAssociation;
        _self.setListToRender('change');        //NO I18N
        parentWindow.jQuery("[data-detail-tab=association]").trigger("click");
        _self.association_summary = undefined;
        _self.setAssociationSummary(undefined,function(modal){
            let summary = _self.getAssociationSummary();
            const changeArray = summary.filter(obj => obj.name == 'change');
            if (changeArray.length > 0) {
                const count = changeArray[0].count;
                const elements = parentWindow.jQuery("#Right-Section").find('[name=change_count]');
                Array.from(elements).forEach((el) => {
                    jQuery(el).html(count);
                });
            }
        });
    },
    /**
     * post problem creation
     */
    handlePostProblemCreation: function () {
        const parentWindow = window.top;
        const _self = parentWindow.$ciAssociation;
        _self.setListToRender('problem');   //NO I18N
        parentWindow.jQuery("[data-detail-tab=association]").trigger("click");
        _self.association_summary = undefined;
        _self.setAssociationSummary(undefined,function(modal){
            let summary = _self.getAssociationSummary();
            const problemArray = summary.filter(obj => obj.name == 'problem');
            if (problemArray.length > 0) {
                const count = problemArray[0].count;
                const elements = parentWindow.jQuery("#Right-Section").find('[name=problem_count]');
                Array.from(elements).forEach((el) => {
                    jQuery(el).html(count);
                });
            }
        });
    },
    /**
     * open problem form
     */
    openProblemForm: function (id, name) {
        const _self = this;
        jQuery("#create_problem_container").html("<div id='create_problem_holder'></div>");
        renderhbs("#create_problem_holder", "ci-create-problem-template", {}, false, "cmdb", undefined, false,function(){   //NO I18N
            jQuery("#create-problem-save").off("click").on("click", function () {    //NO I18N
                _self.handleCreateProblemDialog();
            });
            jQuery("#create-problem-cancel").off("click").on("click", function () {  //NO I18N
                jQuery('#create_problem_holder').sdp_zcomponent_dialog('close'); // No I18N
            });
        });
        _self.selectProblemTemplateDialog = jQuery('#create_problem_holder').sdp_zcomponent_dialog({
            title: translate("common.create.problem"),
            className: 'sdpzcompdialog cust-width', //NO I18N
            height:  jQuery(".zdialog__content").height() + 49,
            open: function (event, ui) {
                jQuery('#select-problem-template').sdp_select2({
                    closeOnSelect: false,
                    allowClear: false,
                    url: [{
                        url: "/api/v3/" + $ciCommon.getAPIPluralName() + "/_get_problem_templates_with_ci_field", //NO I18N
                        field: 'template', //NO I18N
                    }],
                });
            },
            width: 500,
        });
    },
    /**
     * select selected ci by default in request form
     */
    handleCreateProblemDialog: function () {
        const id = $ciCommon.getCIID();
        const name = $ciCommon.getCIName();
        const template = jQuery('#select-problem-template').select2('data'); //NO I18N
        if (template && template.id) {
            this.selectProblemTemplateDialog.sdp_zcomponent_dialog('close'); // No I18N
            $problemGlobal.openProbAsscSlider(id,template.id);
        } else {
            showalert("failure", translate('sdp.admin.requesttemplate.selecttemplate'), "isAutoHide=true"); //No I18N
        }
    },

}
