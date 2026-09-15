/* $Id$ */
var $SolPublic = {

    //This is used to store a solution metainfo details
    metadata: {},

    //Non-login solution default api url path
    defaultSolutionPath : "/sd/api/v3/solutions/",      //No I18N

    //To initialize solution list or details page
    init: function(options) {
        var _self = this;
        _self.externalframe = options.externalframe == "true" ? true : false;
        switch (options.mode) {
            case 'detail':     //No I18N
                _self.loadDetails(options);
                var detailsPageUrl = '/sd/ui/solutions?entity_id='+options.entity_id+'&mode=detail&PORTALID='+PORTALID; // No I18N
                if(_self.externalframe){
                    detailsPageUrl += "&externalframe=true";    // No I18N
                }
                window.history.pushState({'forwardTo' : "detail","module" : "solution","spa_skipstate" : true},'', detailsPageUrl);      // No I18N
                break;
            case 'list':     //No I18N
                sdpAjax({
                    url:  _self.defaultSolutionPath + "_metainfo",  //No I18N
                    success: function(resp) {
                        resp.metainfo.fields.id.display_name = translate("sdp.common.id");
                        var current_view = _self.getSolutionCurrentView();
                        _self.metadata = resp.metainfo.fields;
                        if(current_view != null && PORTALID != current_view.PORTALID){
                            current_view = null;
                        }
                        if(current_view == null){
                            current_view = {};
                            current_view.viewMode = "kanban";    //No I18N
                            current_view.viewType= "linear";     //No I18N
                            current_view.PORTALID = PORTALID;
                            _self.setSolutionCurrentView(current_view);
                        }
                        _self.viewMode = current_view.viewMode;
                        _self.setTemplate(current_view.viewMode,current_view.viewType);
                    }
                });
                break;
        }
    },

    //To initialize the solution div section
    setTemplate : function (viewMode, viewType){
        var _self = this;
        setTimeout(function() {
            renderhbs('#solution-section', 'nonlogin-listview-template', {"viewMode":viewType}, false, 'solutions'); // No I18N
            _self.constructTopicsForFilterOptions(function() { _self.loadListView(viewMode, viewType) });
            _self.handleListEvents();
        }, 100);
        _self.resizeTable();
    },

    //To initialize the events here
    handleListEvents : function (){
        //Solution search fields drop down open and close event
        jQuery('#sol_dorpdown_btn').off('click').on('click', function(e){   // No I18N
            if(jQuery(this).hasClass('active')){
                jQuery('.sug-serch-menu').hide();
                jQuery(this).removeClass('active');
            }
            else{
                jQuery('.sug-serch-menu').show();
                jQuery(this).addClass('active');
                e.stopPropagation();
            }
        });

        //Search fields drop down fields click event
        jQuery( '.sug-serch-menu li' ).off('click').on('click', function(e){    // No I18N
            e.preventDefault();
            if( jQuery( this ).attr("id") === 'solnsrch_Entire_Content' ){
              jQuery( '.sug-serch-menu li' ).removeClass( 'checkmark' );
              jQuery( this ).addClass( 'checkmark' );
            }
            else{
                jQuery(this).toggleClass('checkmark');  // No I18N
                if( jQuery( '.sug-serch-menu li:first-child' ).hasClass( 'checkmark' ) ){
                  jQuery( '.sug-serch-menu li:first-child' ).removeClass( 'checkmark' );
                }
            }
            $SolPublic.searchFieldTextUpdate();
            e.stopPropagation();
        });

        //View change event classic and table
        jQuery(document).off("click.sollistaction").on("click.sollistaction", ".sol-actions", function(event){ //No I18N
            var action = jQuery(this).attr("data-sol-listaction");
            switch(action){
                case "switchViewTable" : //NO I18N
                    $SolPublic.switchSolutionView('table'); //NO I18N
                    break;
                case "switchViewClassic" : //NO I18N
                    $SolPublic.switchSolutionView('classic'); //NO I18N
                    break;
            }
        });

        jQuery('#nonloginTopicConstruct').off('change').on('change', function(event){   // No I18N
            $SolPublic.topicFilter();
        });

        jQuery('#sol_searchtext').off('keyup').on('keyup', function(event){ // No I18N
            $SolPublic.searchSolutions(event)
        });
    },

    //To initialize the table component for list view
    loadListView: function(viewMode, viewType) {
        if($SolPublic.tableObjNonloginSolution && !jQuery.isEmptyObject($SolPublic.tableObjNonloginSolution)){
            $SolPublic.tableObjNonloginSolution.destroy();
        }
        var _self = this;
        var table_info = {
            "list_info": {     //No I18N
                "start_index": "1",     //No I18N
                "row_count": "10"     //No I18N
            }
        };
        table_info.fields_required = {
            "id": "",     //No I18N
            "title": "",     //No I18N
            "topic": "",    //No I18N
            "no_of_hits": "",     //No I18N
            "created_time": "",     //No I18N
            "created_by": "",     //No I18N
            "has_attachments" : "",      //No I18N
            "description" : "",      //No I18N
            "short_description" : ""     //No I18N
        };
        if(viewMode == "kanban") {   //No I18N
            table_info.fields_required.likes = "";
        }
        var header_metadata = _self.constructHeaderData(viewMode);
        var table_content = {
            "header": header_metadata     //No I18N
        };
        var options = {
            entity_name: "solutions", //No I18N
            tableHolder: "nonlogin_solutions", //No I18N
            callbackURL: "solutions", //No I18N
            defaultpath: "/sd/api/v3/",     //No I18N
            sortingEnabled: true,
            listSettingEnabled : true,
            isFR_ListInfo_Support : true,
            listSettingOptions : _self.getListSettings(viewMode),
            callbackRowfunction: _self.rowDataConstruct,
            row_inputdata: _self.rowDataConstruct(table_info),
            columnChooserEnabled: true,
            searchEnabled: true,
            staticHeader: true,
            width: _self.setWidth(),
            height: _self.setHeight(viewMode),
            callbackSearchFunction: _self.callbackSearchFunction,
            callbackAfterBodyRender : _self.callbackAfterBodyRender,
            default_sort_field: {
                sort_order: "asc" //No I18N
            },
            isODAPI: true,
            view: viewMode,
            view_mode: viewType,
            paginationEnabled: true,
            nodataString: '<div class="tc p15 mt10"><span>' + translate("sdp.solution.listview.not.available") + '</span></div>', //No I18N
            meta_data : _self.metadata,
            discarded_fields : ["has_attachments","short_description", "description", "keywords", "deleted_time"]   //No I18N
        }
        if(viewMode == "kanban"){   //No I18N
            options.column_settings = _self.getColumnSettings();
            options.searchEnabled = false;
        }
        _self.tableObjNonloginSolution = new tableComponent(table_info, table_content, options);
    },

    //Row data construct for list view api call
    rowDataConstruct: function(table_info) {
        var inputObject = {};
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
        inputObject.list_info.sort_field = inputObject.list_info.sort_field ? inputObject.list_info.sort_field : "id"; //No I18N
        inputObject.list_info.sort_order = inputObject.list_info.sort_order ? inputObject.list_info.sort_order : "desc"; //No I18N
        var current_view = $SolPublic.getSolutionCurrentView();
        if(current_view.topicId && current_view.topicId > 0){
            inputObject.list_info.search_criteria = {
                "field": "topic.id", // No I18N
                "condition": "eq", // No I18N
                "value": current_view.topicId, // No I18N
                "logical_operator": "AND" // No I18N
            };
        }
        return inputObject;
    },

    //To construct a list view header data
    constructHeaderData : function(viewMode) {
        var _self = this;
        var header_metadata = {
            "id": { //No I18N
                "sortable": true, // No I18N
                "display_name": translate("sdp.common.id"), //No I18N
                "width": "60px" // No I18N
            },
            "title": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "width": "200px", // No I18N
                "column_settings": { //No i18N
                    "position": 2, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructTitle //No i18N
            },
            "topic": { //No I18N
                "sortable": true, // No I18N
                "value_path":"topic.name",// No I18N
                "width": "150px" // No I18N
            },
            "no_of_hits": { //No I18N
                "sortable": true, // No I18N
                "width": "130px" // No I18N
            },
            "created_time": { //No I18N
                "sortable": true, // No I18N
                "searchable" : false, // No I18N
                "value_path": "created_time.display_value"     //No I18N
            },
            "created_by": { //No I18N
                "sortable": true, // No I18N
                "value_path": "created_by.name" //No I18N
            },
            "last_updated_time": { //No I18N
                "sortable": true, // No I18N
                "searchable" : false, // No I18N
                "value_path": "last_updated_time.display_value"     //No I18N
            },
            "last_updated_by": { //No I18N
                "sortable": true, // No I18N
                "value_path": "last_updated_by.name" //No I18N
            },
            "type": {     //No I18N
                "sortable": true, // No I18N
                "width": "80px" // No I18N
            },
            "likes": { //No I18N
                "sortable": true, // No I18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 3, //No I18N
                    "rowposition": 1 ,//No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructHelpfulness, //No i18N
                "width": "80px" // No I18N
            },
            "dislikes": { //No I18N
                "sortable": true, // No I18N
                "width": "80px" // No I18N
            }
        };
        if(viewMode == "table"){    // No I18N
            delete header_metadata.likes.default;
            delete header_metadata.likes.dataCelltransformer;
            header_metadata.id.default = true;
        }
        return header_metadata;
    },

    //Resize the table based on window size
    resizeTable: function() {
        var resizeTimeoutNonloginSol;
        //This jQuery block Triggered when resize event is happened
        jQuery(window).off('resize.nonloginSolResize').on('resize.nonloginSolResize', function() { //No I18N
            clearTimeout(resizeTimeoutNonloginSol);
            resizeTimeoutNonloginSol = setTimeout(function() {
                $SolPublic && $SolPublic.resizeTableHeightWidth();
            }, 200);
        });
    },

    //Resize the table width and height based on the window width and height
    resizeTableHeightWidth: function() {
        if (jQuery("#nonlogin_solutions_div").is(":visible")) {
            var _self = this;
            setTimeout(function() {
                if (_self.tableObjNonloginSolution) {
                    var tableHeight = jQuery(window).height() - jQuery('#top-header').height();
                    _self.tableObjNonloginSolution.setTableHeight($SolPublic.viewMode == "table" ? tableHeight - 120 : tableHeight - 80);   //No I18N
                    _self.tableObjNonloginSolution.setTableWidth(jQuery(window).width() - 24);
                }
            }, 250);
        }
    },

    //To construct the solution title for list view
    constructTitle: function(table_data) {
        var rd = table_data.row_data;
        var attachmentIcon = "";
        if (rd.has_attachments) {
            attachmentIcon = '<span><div class="hide" id="attach_popup_' + rd.id + '"></div><span id="solutions_attachments_' + rd.id + '" class="cur-ptr top0 icon-sm cspr paperclip mr5 opac5" data-entity="solution" data-entity_id="' + rd.id + '" data-target-id="#attach_popup_' + rd.id + '"></span></span>'; // No I18N
        }
        var title = "";
        var popup_border = "";
        if (rd.short_description.trim() != "") {
            popup_border = '<hr class="mb10 mt10">';
        }
        var externalFrame = $SolPublic.externalframe ? "&externalframe=true" : "";     //No I18N
        var detailsUrl = "/sd/ui/solutions?entity_id=" + rd.id + externalFrame + "&mode=detail&PORTALID="+PORTALID;     //No I18N
        title = '<div class="ui-tooltip-style-1"><span class="disp-t wb-bw"> <span class="disp-c"><span class="hspr icon-md ri-solutn ml-5 mr5"></span></span> <span class="sb vmiddle disp-c text-color4">' + e_html(rd.title) + '</span></span>' + popup_border + '<p class="lh20 mb0 ml3 text-color1">' + rd.short_description + '</p>' + '</div>';
        return '<a data-spa-module="solutions" data-spa-page="solution-details" data-spa="true" href="' + detailsUrl + '" class="uni-heading" rel="uitip noopener noreferrer" mode_html="true" title="' + e_attr(title) + '" ">' + attachmentIcon + e_html(rd.title) + '</a>'; //No I18N
    },

    //To construct a helpful count with icon for list view
    constructHelpfulness: function(table_data){
        var rd = table_data.row_data;
        var likesCount = rd.likes;
        title = translate("solution.helpful"); //No I18N
        return  '<div class="disp-flex valign-center">'+
                    '<span class="cspr icon-md like mt-1" rel="uitip" title="'+e_attr(title)+'"></span>'+
                    '<span class="vmiddle disp-ib ml5 text-overflow" style="max-width: 40px;">'+ likesCount+'</span>'+
                '</div>';
    },

    //Set table component height
    setHeight: function(viewMode) {
        var tableHeight = jQuery(window).height() - jQuery('#top-header').height();
        return viewMode == "table" ? tableHeight - 120 : tableHeight - 80;  //No I18N
    },

    //Set table component width
    setWidth: function() {
        var width = jQuery(window).width();
        return width - 29;
    },

    //To construct a topic filter
    constructTopicsForFilterOptions: function(callbackLoadListView) {
        var _self = this;
        if(!$SolPublic.tree_Data){
            sdpAjax({
                type: "GET", //No I18N
                url: "/sd/api/v3/topics/_get_topic_tree", //No I18N
                success: function (resp) {
                    var topics = resp.topics;
                    var allTopics = topics.map(function(topic) {
                        return _self.constructSubTopicData(topic);
                    });
                    var tree_Data = allTopics.slice();
                     _self.initTopicOptions(tree_Data);
                     callbackLoadListView();
                }
            });
        } else{
            _self.initTopicOptions($SolPublic.tree_Data);
            callbackLoadListView();
        }
    },

     //To initialize the topic data to select2 options here
     initTopicOptions : function (tree_Data){
        var _self = this;
        tree_Data.unshift({id : 0, name : "All Topics",text : translate("sdp.solutions.topics.alltopics")});   // No I18N
        jQuery("#nonloginTopicConstruct").select2({
            data: tree_Data,
            dropdownCssClass: 's2-hover-ui1'     //No I18N
        });
        var current_view = _self.getSolutionCurrentView();
        if(current_view.topicId == null || current_view.topicId == 0){
            current_view.topicId = 0;
        } else {
            var topicNode = _self.searchTopicNode(tree_Data, current_view.topicId);
            if(topicNode == null){
                current_view.topicId = 0;
            }
            _self.setSolutionCurrentView(current_view);
        }
        jQuery("#nonloginTopicConstruct").select2('val', current_view.topicId);  //NO I18N
    },

    //This function is used to apply the topic filter during onchange event of the topic filter
    topicFilter: function() {
        var _self = this;
        var headerJquery = jQuery("#solution-section");
        var topicData =  headerJquery.find("#nonloginTopicConstruct").select2('data');     //NO I18N
        var topicId = topicData.id;
        var tableObjNonloginSolution = _self.tableObjNonloginSolution;
        var search_array = [];
        if (topicId) {
            var search_criteria_topic = {
                "field": "topic.id", // No I18N
                "condition": "eq", // No I18N
                "value": topicId, // No I18N
                "logical_operator": "AND" // No I18N
            };
            search_array.push(search_criteria_topic);
        }
        var current_view = _self.getSolutionCurrentView();
        current_view.topicId = topicId;
        _self.setSolutionCurrentView(current_view);
        search_array.length > 0 ? (tableObjNonloginSolution.t_obj.table_info.list_info.search_criteria = search_array) : delete tableObjNonloginSolution.t_obj.table_info.list_info.search_criteria;
        delete tableObjNonloginSolution.t_obj.table_info.list_info.gsearch;
        headerJquery.find("#sol_searchtext").val("");
        if (headerJquery.find("#nonlogin_solutions_head").find(".searchRow").is(":visible")) {
            tableObjNonloginSolution.toggleSearchRow();
        }
        tableObjNonloginSolution.refreshTable("search"); // No I18N
    },

    //Callback function for solution table view inline search
    callbackSearchFunction: function() {
        var topicData =  jQuery("#nonloginTopicConstruct").select2('data');     //NO I18N
        var topicId = topicData.id;
        if ($SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_fields) {
            var search_array = [];
            if (topicId && topicId > 0) {
                var search_criteria_topic = {
                    "field": "topic.id", // No I18N
                    "condition": "eq", // No I18N
                    "value": topicId, // No I18N
                    "logical_operator": "AND" // No I18N
                };
                search_array.push(search_criteria_topic);
            }
            var search_field = $SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_fields;
            var search_object = Object.keys(search_field);
            search_object.forEach(function(key) {
                var search_criteria_field;
                if (["no_of_hits", "id", "likes", "dislikes", "total_comment_count"].includes(key)) {
                    search_criteria_field = {
                        "field": key, // No I18N
                        "condition": "eq", // No I18N
                        "value": search_field[key], // No I18N
                        "logical_operator": "AND" // No I18N
                    };
                } else {
                    search_criteria_field = {
                        "field": key, // No I18N
                        "condition": "like", // No I18N
                        "value": search_field[key], // No I18N
                        "logical_operator": "AND" // No I18N
                    };
                }
                search_array.push(search_criteria_field);
            });
            $SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_criteria = search_array;
            delete $SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_fields;
        } else {
            delete $SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_criteria;
            if (topicId && topicId > 0) {
                var search_criteria_topic1 = {
                    "field": "topic.id", // No I18N
                    "condition": "eq", // No I18N
                    "value": topicId, // No I18N
                };
                $SolPublic.tableObjNonloginSolution.t_obj.table_info.list_info.search_criteria = search_criteria_topic1;
            }
        }
        $SolPublic.tableObjNonloginSolution.refreshTable("search"); // No I18N
    },

    //Callback after table component init
     callbackAfterBodyRender : function (){
        $SolGlobal.loadedRecords = $SolPublic.tableObjNonloginSolution.loadedIDs;
        initTooltip("#solution-section");   // No I18N
     },

    //This function is used to load the solution details data
    loadDetails: function(options) {
        var _self = this;
        sdpAjax({
            url: _self.defaultSolutionPath + options.entity_id,
            success: function(resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    _self.entity_data = respData = resp["solution"];
                    resp.solution.description = appendImageToken(resp.solution.description, resp.solution.image_token);
                    if(resp.solution.attachments.length > 0){
                        resp.solution.attachments = _self.getAttachmentArray(resp.solution.attachments, resp.solution.image_token);
                    }
                    _self.callbackLoadDetails(options);
                }
            },
            error: function(){
                showalert("failure", translate("admin.change.configuration.invalid")+" "+translate("sdp.solution.notificationfeilds.solutionid"), "isAutoHide=false"); //No I18N
                $SolPublic.init({externalframe:_self.externalframe, mode:"list"});  //No I18N
                window.history.pushState({}, '', "/sd/ui/solutions?mode=list");
            }
        });
    },

    //This function is used to append the image token in attachment content url
    getAttachmentArray : function (attachmentArray, authToken){
        var attachmentArrayLength = attachmentArray.length;
        for(i = 0;i<attachmentArrayLength;i++){
            var contentUrl = attachmentArray[i].content_url + "?key=" + authToken; // No I18N
            attachmentArray[i].content_url = contentUrl;
        }
        return attachmentArray;
    },

    //Callback details for api call success
    callbackLoadDetails: function(options) {
        var _self = this;
        var allowedTabObj = allowedTabObj = {
            "allowedTabs": ["keywords"]     //No I18N
        };
        var settings_common = {
            "keywords": { // No I18N
                show: true,
                display_name: translate("sdp.solutions.newsolution.keyword"), // No I18N
                template: "solution_details_template_keywords" // No I18N
            }
        }
        var opt = {
            entity_id: _self.entity_data ? _self.entity_data.id : "", // No I18N
            module: "solution",     //No I18N
            moduleName: "solutions",     //No I18N
            showAssociationsSection: false,
            externalframe: _self.externalframe,
            IS_NONLOGIN_PAGE : sdp_app.IS_NONLOGIN_PAGE,
            isAvailLikeDislikeInRightPanel : true,
            data: {
                entity_data: _self.entity_data,
                tabData: _self.tabData,
                metainfo: _self.metadata,
                navigation : _self.getNavigation()
            },
            afterInitialRender: _self.afterInitialRender,
            container: "solution-section", //No I18N
            //To initialize the panel details here
            panel_details: {
                content_panel: {
                    //To initialize the action panel
                    actions_panel: {
                        show: true,
                        template_namespace: "solutions", // No I18N
                        left_panel: {
                            show: true,
                            template: "solution_details_actions", // No I18N
                            afterRenderfunction: _self.handleHeaderActions,
                            template_namespace: "solutions" // No I18N
                        },
                        right_panel: {
                            show: true,
                            template: "solution_action_right", // No I18N
                            "class": "noborder", // No I18N
                            template_namespace: "solutions" // No I18N
                        }
                    },
                    //To initialize the header panel
                    header_panel: {
                        show: true,
                        template: "solution_details_title_description_template", //No I18N
                        "class": "headerbar mb0", //No I18N
                        renderfunction: _self.loadDescriptionAndAttachment,
                        template_namespace: "solutions" // No I18N
                    },
                    //To initialize the details panel here
                    details_panel: {
                        show: true
                    },
                    //To initialize the solution tabs panel here
                    tabs_panel: {
                        show: true,
                        template_namespace: "solutions", // No I18N
                        section_type: "sub", // No I18N
                        name: "keywords", // No I18N
                        tabs: allowedTabObj.allowedTabs,
                        active: "keywords",     //No I18N
                        type: "tab", // No I18N
                        "class": "tabs-ui2 tabs-primary mt-15", // No I18N
                        afterRenderfunction: _self.gotoActiveTab,
                        settings: settings_common
                    },
                    template_namespace: "solutions", // No I18N
                    //To initialize the solution details right panel here
                    right_panel: {
                        show: true,
                        toggle: true,
                        "sections": ["properties", "informations"], // No I18N
                        "settings": { // No I18N
                            "properties": { // No I18N
                                show: true,
                                "class": "form-horizontal form-section inplace-edit pos-rel top0 right0", // No I18N
                                template: "solution_right_properties", // No I18N
                                template_namespace: "solutions" // No I18N

                            },
                            "informations": { // No I18N
                                show: true,
                                "class": "form-horizontal form-section inplace-edit pl0 pr0 pb10 pos-rel top0 right0", // No I18N
                                template: "solution_right_informations", // No I18N
                                template_namespace: "solutions" // No I18N
                            }
                        }
                    }
                }
            }
        }
        _self.$detailsComp = new DetailsComponent(opt, this);
    },

    //This function is used to load the description and attachment section
    loadDescriptionAndAttachment: function() {
        var _self = this;
        var opt = {
            id :  _self.entity_data.id,
            name : "solution_description", //No I18N
            base_url : "/api/v3", //No I18N
            entity : "solutions", //No I18N
            lookup_entity : "solution",  // No I18N
            data : _self.entity_data,
            showHeader : false,
            canEdit :  false,
            expand : true,
            display_name : "Description",  // No I18N
            container : "solutionDescription", // No I18N
            enableShowmore : false,
            detailsHbsTemplate : {
                "template" : "entity_description_template",   //No I18N
                "callBack" : _self.callBackAfterPanelComponentRender()   //No I18N
            },
            attachment : {
                container: "solutionDescription_attachment", //No I18N
            }
        };
        if(_self.entity_data.attachments.length > 0){
            opt.attachment.downloadall_url = _self.defaultSolutionPath + _self.entity_data.id+"/attachments/_download"  //No I18N
        }
        setTimeout(function() {
            _self.$descriptionPC = new PanelComponent(opt);
            $SolPublic.initPreviewAndDownloadAttachments();
        }, 100)
    },
    //This function is used to remove the extra space in solutions details preview
    callBackAfterPanelComponentRender: function() {
        var contentObj = jQuery("#solution-section").find("#content-panel");
        contentObj.css('min-height', 'calc(100vh - 20px)');     //No I18N
        contentObj.find("#content-right-panel-inner-solution").css('min-height', 'calc(100vh - 20px)');     //No I18N
    },
    //To initialize the Attachment part here
    initPreviewAndDownloadAttachments: function() {
        /** Solution Attachments (Rightside popUp) */
        this.attachRPPreview = new attachPreview("#attachmentDropdown", { // No I18N
            "entity_id": $SolPublic.entity_data.id, // No I18N
            "entity": "solutions", // No I18N
            "api": false,     //No I18N
            "layouts": false, //NO I18N
            popover: {
                enable: true,
                target: '#attachmentDropdownTarget' //NO I18N
            },
            downloadall_url : $SolPublic.defaultSolutionPath + $SolPublic.entity_data.id + "/attachments/_download"    //NO I18N
        });
    },

    //To redirect the active tab
    gotoActiveTab: function(tabName, tabSetting, tabObject) {
        var _self = this;
        var tabName = tabObject.active;
        if (!tabName) {
            tabName = _self.$detailsComp.options.panel_details.content_panel.tabs_panel.active || "details"; // No I18N
        }
        setTimeout(function() {
            jQuery("#" + _self.$detailsComp.options.container).find("[role='tablist']").find("li.active").trigger("click");
        }, 1);
    },

    //This function is used to append the list view page url in back button
    handleHeaderActions: function() {
        var _self = this;
        var listPageUrl = "/sd/ui/solutions?mode=list"; //No I18N
        if(_self.externalframe){
            listPageUrl += "&externalframe=true"; //No I18N
        }
        jQuery("#backtoListview").attr("href", listPageUrl);
    },

    //This function is used to handle the solution gsearch
    searchSolutions : function (event) {
        var _self = this;
        var search_text = jQuery("#sol_searchtext").val().trim();
        if(search_text == "" || event.key === 'Enter'){
            if(search_text){
                var gsearch_text = search_text;
                var search_options = _self.getSearchItems();
                gsearch_text = search_options+search_text;
                _self.tableObjNonloginSolution.t_obj.table_info.list_info.gsearch = gsearch_text;
            }
            else{
                if(_self.tableObjNonloginSolution.t_obj.table_info.list_info.gsearch){
                    delete _self.tableObjNonloginSolution.t_obj.table_info.list_info.gsearch;
                }
            }
            _self.tableObjNonloginSolution.refreshTable("search"); //No I18N
        }
    },

    //This function is used to update the search fields in solution search input field
    searchFieldTextUpdate : function (){
        var _self = this;
        var searchFields = _self.getSearchItems();
        var listPageJQ = jQuery("#nonlogin_listcontrol");
        var displayString = "";
        if (searchFields) {
            var translationMap = {
                title: 'sdp.solutions.search.fields.title', //No I18N
                description: 'sdp.solutions.search.fields.description', //No I18N
                topic: 'sdp.solutions.search.fields.topic',  //No I18N
                keywords: 'sdp.solutions.search.fields.keywords'  //No I18N
            };
            /* To Construct a search fields display text */
            displayString = searchFields.split(":")
                .filter(field => translationMap[field])
                .map(field => translate(translationMap[field]))
                .join(", ");

            listPageJQ.find("#search_field").text(displayString);
            listPageJQ.find("#search_field").prop("title",translate("sdp.leftpanel.search.searchmodule")+" "+ displayString);    //No I18N
        }else{
            listPageJQ.find("#search_field").text(translate('sdp.requests.common.all'));
            listPageJQ.find( "#solnsrch_Entire_Content").addClass( 'checkmark' );
            listPageJQ.find("#search_field").prop("title",translate("common.search.all"));    //No I18N
        }
    },

    //This function is return the search fields of the solution
    getSearchItems : function (){
        var searchFields = "";
        jQuery('ul#nonlogin_sol_dropdown li.checkmark').each(function() {
            var searchFieldId = jQuery( this ).attr('id');
            if(searchFieldId != "solnsrch_Entire_Content"){
                searchFields != "" ? searchFields = searchFields + searchFieldId.substring(9)+ ":" :  searchFields = searchFieldId.substring(9) + ":" ;
            }
        });
        return searchFields;
    },

    //This function is used to append the next and previous page urls in next and previous button
    getNavigation : function (){
        var _self = this
        var navigation = {};
        navigation.isAllowed = false;
        if(window.hasOwnProperty("$SolGlobal") && $SolGlobal.loadedRecords){
            var index = -1;
            //Find the next and prev solution id with the loaded data in listview
            index = $SolGlobal.loadedRecords.indexOf(_self.entity_data.id);
            if(index != -1){
                var nextIndex = index+1;
                var prevIndex = index-1;
                (nextIndex != $SolGlobal.loadedRecords.length) && (navigation.nextId = $SolGlobal.loadedRecords[nextIndex]);
                (prevIndex != -1) && (navigation.prevId = $SolGlobal.loadedRecords[prevIndex]);
                navigation.nextHref = navigation.nextId ? "/sd/ui/solutions?entity_id="+navigation.nextId+"&mode=detail&PORTALID="+PORTALID : "";  //NO I18N
                navigation.preHref  = navigation.prevId ? "/sd/ui/solutions?entity_id="+navigation.prevId+"&mode=detail&PORTALID="+PORTALID : "";   //NO I18N
            }
            //If the details page is refreshed or solution is newly added, not need show navigation
            if($SolGlobal.loadedRecords.length > 1 && index != -1){
                navigation.isAllowed = true;
            }
        }
        return navigation;
    },

    //This function is used to from a child and parent topic data for select2
    constructSubTopicData : function(topic){
        var _self= this;
        if(topic.children == null){
            return _self.constructTopicData(topic);
        }
        topic = _self.constructTopicData(topic);
        for (var i = 0; i < topic.children.length; i++) {
            topic.children[i] = _self.constructSubTopicData(topic.children[i]);
        }
        return topic;
    },

    //To form a topic data here
    constructTopicData : function(tp){
        return {
            id: tp.id,
            text: tp.name,
            children:tp.children!=null ? tp.children : []
        };
    },

    //To construct a list settings for list settings button in list view page
    getListSettings : function (view){
        var listSettingOptions = {
            enableSettings: ["record_per_page"], //No I18N
            disableSettings: ["sorting","display_density","text_wrapping","reset_column_width", "reset_personalization"] //No I18N
        }
        if(view == "kanban"){
            listSettingOptions.enableSettings.push("sorting");
            listSettingOptions.disableSettings.shift();
        }
        return listSettingOptions;
    },

    //To construct a column settings for solution classic view
    getColumnSettings : function (){
        return {
            "default_position": 2, //No i18N
            "assign_content_width": false, //No i18N
            "assign_label_width": false, //No i18N
            "columns": [{ //No i18N
                    "size": 1, //No i18N
                    "width": '0px', //No i18N
                    "row_count": 1 //No i18N
                },
                {
                    "size": 10, //No i18N
                    "row_count": 2, //No i18N
                    "default_position": 2, //No i18N
                    "pipe_separation": true //No i18N
                },
                {
                    "size": 1, //No i18N
                    "row_count": 1, //No i18N
                    "default_position": 1 //No i18N
                }
            ]
        }
    },

    //This function is used to switch the solution view classic to table and table to classic
    switchSolutionView :function(view_mode) {
        var _self = this;
        var current_view = _self.getSolutionCurrentView() || {};
        current_view.viewMode = view_mode === "classic" ? "kanban" : "table";   //No I18N
        current_view.viewType = view_mode === "classic" ? "linear" : "table";   //No I18N
        _self.setSolutionCurrentView(current_view);
        _self.setTemplate(current_view.viewMode, current_view.viewType);
    },

    //This function is used to get a solution current view object from the local storage
    getSolutionCurrentView : function (){
        return JSON.parse(Store.getItem("solution_nonlogin_view_"+PORTALID)); //No I18N
    },

    //This function is used to set a solution current view object in local storage
    setSolutionCurrentView : function (current_view){
        if(current_view != null && current_view != "" && typeof current_view == 'object'){
            Store.setItem({
                key : "solution_nonlogin_view_"+PORTALID, // NO I18N
                value: sdpToJSON(current_view)
            });
        }
    },

    //This function is used to get a topic node of a specific topic id
    searchTopicNode : function(topicNodes, id) {
        for (var topicNode of topicNodes) {
            if (topicNode.id === id) {
                return topicNode;
            }
            if (topicNode.children) {
                var result = $SolPublic.searchTopicNode(topicNode.children, id);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
}
