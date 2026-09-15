/* $Id$ */
$sol.list = {

    //Holds the view mode
    view_mode: "table", //No I18N
    //Hold the which page form is invoked
    from : null,
    //Holds the input data of a object
    input_data : null,
    //Holds the component object reference
    per_obj: null,
    //Holds the current view mode
    current_view_mode: "",

    //Holds the topic data list_info
    topics_info: {
        start_index: 1,
        has_more: false,
    },
    //Holds the topics details
    all_topics : [],
    selfApprove:[],

    filter_display_name:translate("solution.allactivesolution"),
    switchView:false,

    /** Intialize the solution list view */
    init: function(module, from, externalframe){
        //module null check
        if(module == "null"){  // No I18N
            module  = "";  // No I18N
        }
        //from null check
        if(from == "null"){  // No I18N
            from  = "";  // No I18N
        }
        //external frame related class addition
        if(externalframe){
          jQuery("body").addClass('of-h');  // No I18N
        }
        //This object helps to find from which page, form is invoked
        $SolObj.fromPage = "list"; // No I18N
        this.module = module + "s"; //No I18N
        if(from){
            this.from = from;
        }
        this.filter_view_internal_name = "AllSolutions"; //No I18N
        this.externalframe = externalframe;
        var current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
        var viewMode = "table",view = "table";// No I18N
        if(!$SolObj.isPreview){
            if(current_view.view == "classic"){
                viewMode = "linear";// No I18N
                view = "kanban";// No I18N
                this.view_mode = "classic";// No I18N
            }
        }

        if(sdp_user.ROLES.indexOf("SolutionsApprove") > -1){
            $sol.list.selfApprove=$SolObj.checkSelfApprovePermission();
        }
        if(!$SolObj.isPreview){
                this.setTopicTreeTemplate(externalframe);
                $sol.tree.initTopicTree();
                 if(getSDPURLParams().gsearch){
                     jQuery('#solution_tree').jstree(true).deselect_all(true);
                     jQuery('#all_solutions_id').addClass('text-primary');
                 }
        }
        var showTrashView=(!getSDPURLParams().gsearch) && (($SolObj.deletedTopicID!=null) || (current_view!=null && current_view.filter_by!=null && current_view.filter_by.name == "trash"))
        this.setTemplate(view, viewMode,showTrashView);

        this.listEvents();
        if($sol.list.table_comp_solution){           $SolGlobal.loadedRecords = $sol.list.table_comp_solution.loadedIDs;          }
        if($SolObj.isPreview){
            if(sdp_user.USERTYPE === "Technician"){
                this.constructTopicsForFilterOptions();
            }
        }
        // Initialize the helptour for the solutions module
        if(sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND ){
            if(sdp_user.USERTYPE === 'Technician' && sdp_user.ROLES.includes("ViewSolutions")){ //NO I18N
                HelpVideos.init('Solutions', '#spa-container'); //No I18N
            }
            if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("Solutions")){ // No I18N
                HelpVideos.open('Solutions',false); // No I18N
            }
        }
    },
    /** listview height width resize when window resize */
    resizeTable : function(){
        var resizeTimeoutWO;
       jQuery(window).off('resize.sol_resize').on('resize.sol_resize', function() {    //No I18N
           clearTimeout(resizeTimeoutWO);
           resizeTimeoutWO = setTimeout(function() {
               $sol.list && $sol.list.resizeTableHeightWidth();
           }, 400);
       });
    },
    /** render the listview template handling */
    setTemplate: function(view,viewMode,isTrash){

        if($sol.list && $sol.list.table_comp_solution && !jQuery.isEmptyObject($sol.list.table_comp_solution)){
            $sol.list.table_comp_solution.destroy();
        }
        var _self = this;
        _self.permissions = _self.getPermissions();
        var contextObj = Object.assign({}, _self.permissions);
        _self.view = contextObj.view = view;
        _self.viewMode = contextObj.viewMode = viewMode;
        _self.permissions = _self.getPermissions();
        contextObj.module = _self.module;
        contextObj.tech =sdp_user.USERTYPE!="Requester"; // No I18N
        contextObj.isPreview = $SolObj.isPreview;
        if(contextObj.tech){
            var days=$SolObj.getDeletionTimeLimit();
            contextObj.DeletionTimeLimit = days > 1 ? days : 30;
        }

        contextObj.isTrash = isTrash;
        contextObj.deleteMsg = isTrash ? 'common.trash.delete' : 'common.delete';//No I18N
        jQuery("body").removeClass('oyh');
        var compiledHtml =renderhbs(null,"listview-template",contextObj,false,"solutions",null,"solutions",null,true);    //No I18N
        jQuery("#listviewloader").html(compiledHtml);
        _self.loadListView(viewMode);

    },
    /** load listview handling */
    loadListView: function(viewMode){
        var _self = this;
        var listviewJQ=jQuery('#listcontrols');
        var componentName = "webc_solutions"; // No I18N
        delete WebComponents.instancePool[componentName];
        _self.current_view_mode = viewMode;
        WebComponents.render(componentName);
        $sol.list.table_comp_solution = WebComponents.getInstance(componentName);
        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
        if(!$SolObj.isPreview){
            var filter_internal_name="AllSolutions";// No I18N
             _self.filter_display_name=translate("solution.allactivesolution");
            if(current_view && current_view.filter_by && current_view.filter_by.id && !$SolObj.deletedTopicID){
                sdpAjax({
                                url:"/api/v3/list_view_filters/"+current_view.filter_by.id, //No I18N
                                type: "GET", //No I18N
                                async: false,
                                ignorefailuremessage:true,
                                success:function(resp){

                                      _self.filter_display_name = resp.list_view_filter.display_name;
                                      filter_internal_name= resp.list_view_filter.name;
                                },

                            })
            }
            if((current_view && current_view.filter_by && current_view.filter_by.name == 'trash') || ($SolObj.deletedTopicID)){
                _self.filter_display_name = translate("sdp.requests.trashrequest")//No I18N
                jQuery('#solutions-filters').attr("data-filter","trash");

            }

            jQuery('#solutions-filters').text(_self.filter_display_name);// No I18N
            jQuery('#solutions-filters').attr("data-filter","active");
            jQuery('#listview_btn').attr("title",_self.filter_display_name);// No I18N
            _self.expiredSolutionFilterAction(filter_internal_name);
        }
        if(sdp_user.USERTYPE == "Technician"){
        _self.initClassicFilter();
        }
        _self.filterByRenderAction();
        var listviewloaderJQ=jQuery('#listviewloader');

},
    /**List view events handlings */
    listEvents: function(){
        var _self = this;
        jQuery(document).off("click.sollistaction").on("click.sollistaction", ".sol-actions", function(event){ //No I18N
            var action = jQuery(this).attr("data-sol-listaction");
            var id = jQuery(this).attr("data-sol-id");
            var topicid = jQuery(this).attr("data-topic-id");
            var isTopicDeleted = jQuery(this).attr("data-topic-deleted");
            var hasBulk = jQuery(this).attr("data-bulk");
            var subOperation=jQuery(this).attr("data-sol-subaction");
            var isSolDeleted=jQuery(this).attr("data-sol-deleted");
            switch(action){
                case "edit": //No I18N
                    $sol.list.actions().edit(id);
                    break;
                case "forward": //No I18N
                    $sol.list.actions().forward(id);
                    break;
                case "submit_approval" :   // No I18N
                    $sol.list.actions().submit_approval(id);
                    break;
                case "operation": //No I18N
                    $sol.list.actions().operation(subOperation,id);
                    break;
                case "approve": //No I18N
                    $sol.list.actions().approveOrReject(id,action,event);
                    break;
                case "reject": //No I18N
                    $sol.list.actions().approveOrReject(id,action,event);
                    break;
                //To construct a settings popup here
                case "settings": //No I18N
                    var isPopup = jQuery(this).attr("data-popup");
                    $sol.settings.openPopup(isPopup);
                    break;
                //To construct a solution move popup here
                case "move": //No I18N
                    var isPopup = jQuery(this).attr("data-popup");
                    if(isPopup == "true"){
                        var settingHtml =  renderhbs(null,"sol_move_dialog",{},false,"solutions",null,"solutions",null,true);    //No I18N
                        jQuery('#solution_move_popup').dialog({
                            title:translate('solution.select.topic'),
                            autoOpen : false,
                            modal : true,
                            position: { my: "center center", at: "center center", of: window }, //NO I18N
                            open: function(event, ui){
                                _self.renderTreeForMove();
                                $sdEventListener(jQuery("#solution_move_popup"));
                            },
                            close: function(event,ui){
                                jQuery('#copy_sol_move_dialog').remove();
                                jQuery('#solution_move_popup').dialog("destroy"); // No I18N
                            },
                            width: 400,
                        }).html(settingHtml).dialog("open"); // No I18N
                        return;
                    }
                    $sol.list.actions().move_solutions();
                    break;
                case "all_solutions": //No I18N
                        if(jQuery(".viewFiltRight .cancel-filter:visible").length > 0 && viewFilterComponent){
                            $SolObj.isFilterCanceled = false;
                            viewFilterComponent.resetFilter();
                        }
                    if(isMSPOrSCP)
                    {
                        jQuery("#solutions_topic_group .text-primary").removeClass("text-primary"); // No I18N
                    }

                    var listviewJQ=jQuery('#listcontrols');
                    jQuery(this).addClass('text-primary');
                    jQuery('#solution_tree').find('.jstree-clicked').removeClass('jstree-clicked');

                    var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
                    if((!jQuery.isEmptyObject(personalize) && personalize.topicID)|| ($SolObj.deletedTopicID!=null) ){
                        delete personalize.topicID;
                        jQuery('#solution_tree').jstree(true).deselect_all(true);  //Deselect all topics when all topics is clicked
                    }
                    if(personalize){
                        addPersonalization('solutions_currentview', personalize);
                    }
					$SolObj.deletedTopicID = null;
                    $sol.list.filterByRenderAction();
                    $sol.list.refreshList(true);
                    break;
                case "delete" : //No I18N
                    var isPopup = jQuery(this).attr("data-popup");
                    if(isPopup == "true"){
                        showconfirm(true,'title='+translate('sdp.solution.delete.popup.title')+', message='+translate("sdp.solution.delete.confirm.message")+"?"+', submitbutton='+translate("common.delete")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){
                            if(confirm){
                                $sol.list.actions().operation_delete(id, hasBulk,isSolDeleted,false);
                            }
                        },true);
                    }
                    break;
                case "moveToTrash" : //No I18N
                    var isPopup = jQuery(this).attr("data-popup");
                    if(isPopup == "true"){
                        showconfirm(true,'title='+translate('sdp.solution.delete.popup.title')+', message='+translate("sdp.solution.delete.confirm.message")+"?"+', submitbutton='+translate("common.delete")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){
                            if(confirm){
                                $sol.list.actions().operation_delete(id, hasBulk,isSolDeleted,true);
                            }
                        },true);
                    }
                    break;
                case "solutions_link" :  //NO I18N
                    $sol.list.actions().linkSolutions(event);
                break;
                case "switchViewTable" : //NO I18N
                    $sol.list.actions().switchSolutionView('table'); //NO I18N
                break;
                case "switchViewClassic" : //NO I18N
                    /**
                     * To remove "url_search" from Url when navigate to classic view
                     */
                    const getTableInstance = $sol.list.table_comp_solution;
                    if(getTableInstance){
                        $sol.list.switchView=true
                        getTableInstance.changeFilterString("clearSearch"); //NO I18N
                    }
                    $sol.list.actions().switchSolutionView('classic'); //NO I18N
                break;
                case "restore" : //NO I18N
                    $SolObj.restore_solutions(id);
                 break;
                case "backToActiveSolutions" : //NO I18N
                    $sol.list.switchFilterView("AllSolutions","AllSolutions");//NO I18N
                    if($SolObj.deletedTopicID){
                        jQuery('#all_solutions_id').trigger( "click" );
                    }

                break;

                case "enablehelpfulness" :  //NO I18N
                    $sol.settings.actions("enablehelpfulness");   //NO I18N
                    break;
                case "enablecomments" : //NO I18N
                    $sol.settings.actions("enablecomments");  //NO I18N
                    break;
                case "topicfilter" : //NO I18N

                    $sol.list.switchTopicFilter(subOperation);
                    if(subOperation=='topic'){//set topic_filter in table_info when "Solution from this topic" filter is applied
                        $sol.list.table_comp_solution.t_obj.table_info["for"]="topic_filter";//NO I18N
                    }
                    //deleted topic_filter from table_info when "Solution from this subtopic" filter is applied
                    else{
                        delete $sol.list.table_comp_solution.t_obj.table_info["for"];
                    }

                    $sol.list.table_comp_solution.t_obj.table_info.list_info.start_index = 1;
                    $sol.list.table_comp_solution.refreshTable("refresh");//NO I18N
                    break;

            }
        });

        if(isSCP)
        {
            $mspSolutionList.registerTopicGroupEvents();
        }
    },

    /** list view premissions */
    getPermissions: function(){
        var permissions = {};
        var roles = sdp_user.ROLES;
        permissions = {
            view: roles.indexOf("ViewSolutions") > -1, //No I18N
            add: roles.indexOf("CreateSolutions") > -1, //No I18N
            edit: roles.indexOf("ModifySolutions") > -1, //No I18N
            "delete": roles.indexOf("DeleteSolutions") > -1, //No I18N
            approve : roles.indexOf("SolutionsApprove") > -1, //No I18N
            reject : roles.indexOf("SolutionsApprove") > -1 , //No I18N
            sdadmin : roles.indexOf("SDAdmin") > -1  //No I18N
        }
        return permissions;
    },
    /** table component options callbacks */
    listOptions: function(){
        var _self = this,
            options = {};
             if(!$SolObj.isPreview){
                options.listSettingEnabled = true;
                options.listSettingOptions = {
                    enableSettings: ["record_per_page"], //No I18N
                    disableSettings: ["display_density","text_wrapping","sorting"] //No I18N
                }
            }
            if(sdp_user.USERTYPE !== "Technician"){
                options.listSettingOptions.enableSettings = ["record_per_page"]; //No I18N
            }
            if(_self.view_mode == "classic"){
            //To set a solution classic view row and column alignment here
                options.listSettingOptions.enableSettings = ["record_per_page", "sorting"]; //No I18N
                options.column_settings = {
                    "default_position": 2, //No i18N
                    "assign_content_width": false, //No i18N
                    "assign_label_width": false, //No i18N
                    "columns": [{ //No i18N
                            "size": 1, //No i18N
                            "width": sdp_user.USERTYPE == "Technician" && (_self.getPermissions().edit || _self.getPermissions()["delete"] || _self.getPermissions().approve) ? '80px' : '0px', //No i18N
                            "row_count": 1 //No i18N
                        },
                        {
                         "size": 7, //No i18N
                         "row_count": 2, //No i18N
                         "default_position": 2, //No i18N
                         "pipe_separation": true //No i18N
                        },
                        {
                            "size": 1, //No i18N
                            "row_count": 1, //No i18N
                            "default_position": 1 //No i18N
                        },
                        {
                            "size": 1, //No i18N
                            "row_count": 1, //No i18N
                            "default_position": 1 //No i18N
                        },
                        {
                            "size": 1, //No i18N
                            "row_count": 1, //No i18N
                            "default_position": 1 //No i18N
                        },
                        {
                            "size": 1, //No i18N
                            "row_count": 1, //No i18N
                            "default_position": 1 //No i18N
                        }
                    ]
            }
            options.default_sort_field = {"sort_field" : "id","sort_order" : "desc"}//No i18N
        }

        var isTech = sdp_user.USERTYPE=="Requester"?false:true; // No I18N
        var comment="public_comment_count";//No I18N
        if(isTech)
        {
            comment = "total_comment_count";//No I18N
        }

        //Discarded fields initialized for advanced filter
        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
        var isTrashView=($SolObj.deletedTopicID!=null) || (current_view && current_view.filter_by && current_view.filter_by.name == "trash");
        options.discarded_fields = ["user_group_mapping", "keywords","description","owner","operation_comment"].concat(isTrashView?[]:["deleted_time"]);//No I18N
        if(isMSPOrSCP){
            $mspSolutionList.modifyOptionsForMSP(options);
        }
        options.reinitializeCalback = function(){
            var e = "webc_solutions";//No I18N
            var table_render_div = jQuery("#table_render_div");
            var webc_solutions = jQuery('#webc_solutions',table_render_div);
            table_render_div.append(webc_solutions);
            jQuery('div.component-placeholder',table_render_div).remove();
            delete WebComponents.instancePool[e];
            WebComponents.render(e);
            $sol.list.table_comp_solution = WebComponents.getInstance(e);
        }
        options.included_fields = ["has_attachments",comment]; //No I18N
        options.callbackOnAPIFailure=_self.apiFailuerCallback;
        options.trashEnabled = true
        options.callbackAfterRestore=$sol.tree.refreshTree;
        return options;
    },
    /** table component list_info callbacks */
    tableEntityInfo: function(personalize_key){
        var _self = this;
        var param = getSDPURLParams();
        var gsearch = param.gsearch;
        if(gsearch){
            this.tempGsearch = gsearch;
        }
        var table_info = getPersonalizeData(personalize_key);
        var filter_by,search_criteria;
        var current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);

        if(!$SolObj.deletedTopicID && current_view && current_view.filter_by && (current_view.filter_by.name || current_view.filter_by.id)){
            filter_by = current_view.filter_by;
        }

        else if($SolObj.deletedTopicID){
            filter_by = {name:"trash"};// No I18N
            search_criteria = {
             "field":"topic.id", // No I18N
             "condition":"eq", // No I18N
              "value":$SolObj.deletedTopicID // No I18N
             };

        }
        if(current_view && current_view.topicID && !$SolObj.deletedTopicID){
        	  search_criteria = {
                 "field":"topic.id", // No I18N
                 "condition":"eq", // No I18N
                  "value": current_view.topicID  // No I18N
                 };

        }
        if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            /**
             * To avoid object reference issue
             */
            table_info = JSON.parse(sdpToJSON(global_table_info.solutions));
        }
        if(sdp_user.USERTYPE == "Requester" && table_info.list_info.filter_by){
            delete table_info.list_info.filter_by;
        }
        if(filter_by && sdp_user.USERTYPE == "Technician"){
            table_info.list_info.filter_by = filter_by;
        }
        else if(sdp_user.USERTYPE == "Technician"){
            table_info.list_info.filter_by = {"name" : "AllSolutions"};  // No I18N
        }

        if(search_criteria){
            table_info.list_info.search_criteria = search_criteria;
        }
        else{
            if(table_info && table_info.list_info && table_info.list_info.search_criteria){
                delete table_info.list_info.search_criteria;
            }
        }
        if(this.tempGsearch){
            if(sdp_user.USERTYPE == "Technician"){
                table_info.list_info.filter_by = {"name" : "AllSolutionsWithoutExpired"};  // No I18N
            }
            if(table_info.list_info.search_criteria){
                delete table_info.list_info.search_criteria;
            }

        }
        $sol.list.switchTopicFilter($SolGlobal.topicview);
        if($SolGlobal.topicview == "topic"){//set topic_filter in table_info when "Solution from this topic" filter is applied
            table_info["for"]="topic_filter";//NO I18N
        }
        if(isMSPOrSCP){
                    $mspSolutionList.modifyTableInfoForMSP(table_info);
                }
        return table_info;
    },

    /** table component header(meta) data construct callbacks */
    headerDataConstruct: function(){
        var _self = this;
        //To construct a technicians headers here
        var techHeader={
          "solutions_head_chk": { //No i18N
                "column_settings": { "position": 1}, //No I18N
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "checkbox", //No i18N
                "dataCelltransformer": _self.constructChkboxCell // No I18N
            },
            "edit": { //No I18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructEdit, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            },
            "approval_status": { //No I18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 3, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "sortable": false, // No I18N
                "dataCelltransformer": $SolObj.constructStatus //No i18N
            },
            "is_public": { //No I18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 4, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": $SolObj.constructVisibility //No i18N
            },
            "review_date": { //No I18N
                "sortable": false // No I18N
            },
            "expiry_date": { //No I18N
                "sortable": false // No I18N
            },
        }
        var current_view=sdp_user.CLIENT_CONF.solutions_currentview

        //To construct a requesters headers here
        var reqheader = {
            "id": { //No I18N
                "sortingEnabled": true, // No I18N
                "display_name": translate("sdp.common.id") //No I18N
            },
            "title": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 2, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructTitle //No i18N
            },
            "topic": { //No I18N
                "sortable": false, // No I18N
                "value_path":"topic.name",// No I18N
                "dataCelltransformer": _self.constructTopic // No I18N

            },
            "no_of_hits": { //No I18N
                "sortable": false // No I18N
            },
            "last_updated_time": { //No I18N
                "sortable": false // No I18N
            },
            "created_time": { //No I18N
                //"sortable": false // No I18N
            },
            "created_by": { //No I18N
                "sortable": false // No I18N
            },
            "likes": { //No I18N
                "sortable": true, // No I18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "position": 5, //No I18N
                    "rowposition": 1 ,//No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructHelpfulness //No i18N
            },
            "dislikes": { //No I18N
                "sortable": true // No I18N
            }

        }

        var comment_settings = {
              "sortable": true, // No I18N
             "default": true, //No i18N
             "hide_label": true, //No i18N
               "display_name": translate("sdp.common.comments"), //No I18N
             "column_settings": { //No i18N
                 "position": 6, //No I18N
                 "rowposition": 1 ,//No i18N
                 "view_type": "row" //No i18N
             },
             "dataCelltransformer": _self.render_comment_count //No i18N
        }
        if(sdp_user.USERTYPE != "Technician"){
            reqheader.likes.column_settings.position = 3;
            comment_settings.column_settings.position = 4;
        }
        var techcommentheader = {
            "total_comment_count": comment_settings//No I18N
        }

         var reqcommentheader = {
             "public_comment_count": comment_settings//No I18N
        }

        header = sdp_user.USERTYPE == "Technician" ? jQuery.extend(techHeader, reqheader,techcommentheader) :  jQuery.extend(reqheader,reqcommentheader); //NO I18N
        if(_self.view_mode == "classic"){
            if(!(_self.getPermissions().edit || _self.getPermissions().approve || _self.getPermissions()["delete"])){
                delete header.solutions_head_chk;
                delete header.edit;
            }
        }

        if(($SolObj.deletedTopicID) || (current_view && current_view.filter_by && current_view.filter_by.name=='trash')){
            header.deleted_time = {
                "sortable": false,//No i18N
                "checkbox_disable":true//No i18N
            }

        }

        return header;
    },

    /** to render comment count */
    render_comment_count: function (table_data) {
        var _self = this;
        var current_view = sdp_user.CLIENT_CONF.solutions_currentview!=null?sdp_user.CLIENT_CONF.solutions_currentview.view:"table";//No I18N

        var public_count = table_data.row_data.public_comment_count;
        var total_count = table_data.row_data.total_comment_count;
        var display_count=0;

        if (sdp_user.USERTYPE == "Technician") {
        	display_count= total_count;
        }
        else
        {
            display_count = public_count;
        }

        if(current_view == 'classic')
        {
          title = translate("sdp.common.comments"); //No I18N
             return  '<div class="disp-flex valign-center">'+
                         '<span class="cspr icon-md comment mt-1" rel="uitip" title="'+e_attr(title)+'"></span>'+
                         '<span class="vmiddle disp-ib ml5 text-overflow maxw-40px">'+ ZSEC.Encoder.encodeForHTML(display_count)+'</span>'+
                     '</div>';
        }
        return display_count;


	},
    /** list view refrehs handling */
    refreshList: function(isAllSolution){
        var solutionsTable = WebComponents.instancePool["webc_solutions"];// No I18N
        if(isAllSolution){
            var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
            delete solutionsTable.t_obj.table_info.list_info.search_criteria;
            if($sol.list.tempGsearch){
                delete $sol.list.tempGsearch;
                delete solutionsTable.t_obj.table_info.list_info.gsearch;
                $SolObj.pushingStateURL("solutions", "list");   //No I18N
                $sol.list.filterByRenderAction();

            }
            if(current_view && current_view.filter_by){
                solutionsTable.t_obj.table_info.list_info.filter_by = current_view.filter_by;
            }
             var view='table',viewMode='table';// No I18N
                            if($sol.list.view_mode == "classic"){ // No I18N
                                viewMode = "linear"; // No I18N
                                view = 'kanban'; // No I18N
                         }

                         var filter_by=(current_view && current_view.filter_by) ? current_view.filter_by : {"name":"AllSolutions"};//No I18N
                         $sol.list.setTemplate(view,viewMode,(filter_by.name == 'trash')? true : false);
        }
        else{
            solutionsTable.refreshTable("refresh");// No I18N
        }


    },
    /** List view actions function */
    actions: function(){
        var _this = this
        var act = {
            operation: function(operation,id){
                var selected_ids=[];
                if(id){selected_ids.push(id)};
                selected_ids = $sol.list.table_comp_solution.bulkSelect.getSelectedIDs().length>0?$sol.list.table_comp_solution.bulkSelect.getSelectedIDs():selected_ids;
                if(selected_ids.length === 0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                    return;
                }
                var _i18n = operation === 'approve' ? translate("approval.approve") : translate("common.reject"); //No I18N
                var contextObj = {
                    operation_i18n: _i18n,
                    operation: operation,
                }
                if(id!=null){contextObj.operation_id=id}
                var title = operation === 'approve' ? translate("sdp.solution.approvals.approvecomments") : translate("sdp.solution.approvals.rejectcomments"); //No I18N
                var compiledHtml = renderhbs(null,"operation_dialog",contextObj,false,"solutions",null,"solutions",null,true);    //No I18N
                //To construct a list view actions popup here
                jQuery('#solution_list_action_popup').dialog({
                    title:title,
                    autoOpen : false,
                    modal : true,
                    position: { my: "center center", at: "center center", of: window }, //NO I18N
                    open: function(event, ui){
                        $sdEventListener(jQuery("#solution_list_action_popup"));
                    },
                    close: function(event,ui){
                        jQuery("#copy_operation_dialog").remove();
                        jQuery('#solution_list_action_popup').dialog("destroy"); // No I18N
                    },
                    width: 400,
                }).html(compiledHtml).dialog("open"); // No I18N
            },
            //Approve and Reject handled in same function for solution list view
            approveOrReject: function(id,action,event){
                $SolObj.multipleClickAvoid(event,true);
                var _self = this;
                var selected_ids=[];
                var failed_resp=[];
                if(id){
                  selected_ids.push(id)
                }else if($sol.list.table_comp_solution.bulkSelect.getSelectedIDs().length > 0){
                  selected_ids = $sol.list.table_comp_solution.bulkSelect.getSelectedIDs();
                }

                if(selected_ids.length === 0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                    return;
                }
                var url = "/api/v3/solutions/_"+action+"?ids=" + selected_ids.join(","); //No I18N
                var comment = jQuery("#operation_comment").val().trim();
                var data = {
                    "solution":{ //No I18N
                        "operation_comment":comment //No I18N
                    }
                }
                sdpAjax({
                    url: url,
                    type: "PUT", //No I18N
                    data: sdpAjaxInputData(data),
                     ignorefailuremessage: true,
                    success: function(){
                        var msg = action == "approve" ? translate('common.approved',[translate('sdp.header.newsolution')]) : translate('common.rejected',[translate('sdp.header.newsolution')]); //No I18N
                        showalert('success', msg, "isAutoHide=true"); // No I18N
                        _this.refreshList();
                        jQuery('#solution_list_action_popup').dialog('close'); // No I18N
                    },
                    error: function (resp) {
                        var resp = JSON.parse(resp.responseText);
                        var resp_status=resp.response_status
                        for (var i = 0; i < resp_status.length; i++){
                            resp_status[i].status != "success" ? failed_resp.push(resp_status[i].id) : "";
                        }
                        var action_msg = action == "approve" ? translate('sdp.approve.action') : translate('common.reject');//No I18N
                        failed_resp.length>0 && showconfirm(true, 'title=' + translate("sdp.common.failed") + ', message=' + translate("solution.bulk.action.errormsg",[action_msg,failed_resp.join("&#44 ")]) +', cancelbutton=' + translate("sdp.common.cancel")); //No I18N
                        _this.refreshList();
                        jQuery("#solution_list_action_popup").dialog("close")//No I18N
                    }
                })
            },
             /** To delete a solution */
           operation_delete: function(id, hasBulk,isSolDeleted,moveToTrash){
                var filter_by ={}
                var msg="";var url="";
                if(sdp_user.CLIENT_CONF.solutions_currentview && sdp_user.CLIENT_CONF.solutions_currentview.filter_by){
                    filter_by = sdp_user.CLIENT_CONF.solutions_currentview.filter_by
                }
                if(isSolDeleted!="null" && isSolDeleted!="undefined"){
                    url = "/api/v3/solutions/" + id ; //No I18N
                    msg='api.deleted.success';// No I18N
                }
                else{
                    url = "/api/v3/solutions/" + id + "/_move_to_trash"; //No I18N
                    msg='api.trashed.success';// No I18N
                }
                if(hasBulk){
                    id = $sol.list.table_comp_solution.bulkSelect.getSelectedIDs();
                   if(moveToTrash==false || $SolObj.deletedTopicID){
                        url = "/api/v3/solutions?ids=" + id.join(","); //No I18N
                        msg='api.deleted.success';// No I18N
                    }
                    else{
                         url = "/api/v3/solutions/_move_to_trash?ids=" + id.join(","); //No I18N
                         msg='api.trashed.success';// No I18N
                    }

                }
                if(!id || id.length===0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                    return;
                }
                sdpAjax({
                    url: url,
                    type: "DELETE", //No I18N
                    success: function(resp){
                        showalert('success', translate(msg,[translate('common.newsolution')]), "isAutoHide=true"); // No I18N
                        _this.refreshList();
                        $sol.tree.refreshTree();
                    }
                })
            },
             /** To construct forward solution popup */
            forward: function(id){
                user_fetch = isSCP ? $mspSolutionList.getSCPUserFetchForForward() : {};
                $notification_popup.openNotificationForm({
                    template_type: "SOLFORWARD",   //No I18N
                    type: "SOLFORWARD",   //No I18N
                    module: "solution",  //No I18N
                    module_id: id,
                    afterNotificationSent: function(){$sol.list.refreshList()},
                    imgParameters: {module: "solution" +"_notification", withURL: false, noForm: true},  //No I18N
                    input_data_Callback: function (url_options,input_data,ajaxOptions){
                        if(isMSPOrSCP){
                            input_data = $mspSolutionList.addMSPSearchCriteria(input_data);
                        }
                        return input_data;
                    },
                    user_fetch : user_fetch,
                    popup_title:translate('sdp.requests.viewrequest.forward'),  //No I18N
                    descriptionText : translate("common.message")   //No I18N
                });
            },
             /** To construct submit for approval popup */
            submit_approval: function(id){
                var user_fetch = {};
                user_fetch.url = "/api/v3/solutions"+ "/" +id + '/approver';   //No I18N
                user_fetch.lookup_field = 'approver';   //No I18N
                user_fetch.search_keys = ['name','email_id'];   //No I18N
                $notification_popup.openNotificationForm({
                    template_type: "Notify_ApproveSolution",   //No I18N
                    type: "Notify_ApproveSolution",   //No I18N
                    module: "solution", // No I18N
                    module_id: id,
                    has_cc:false,
                    afterNotificationSent: function(){$sol.list.refreshList()},
                    user_fetch: user_fetch,
                    is_tagging: false,
                    imgParameters: {module: "solution" +"_notification", withURL: false, noForm: true},  //No I18N
                    popup_title:translate('sdp.purchase.addNew.view.submit'),   //No I18N
                    descriptionText : translate("common.message")   //No I18N
                });
            },

            /** To construct move solution popup */
            move_solutions: function(){
                var selectTopic = jQuery("#sol_move_tree").jstree("get_selected"); //No I18N
                var selected_ids = $sol.list.table_comp_solution.bulkSelect.getSelectedIDs();
                if(selected_ids.length === 0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                    return;
                }
                if(selectTopic.length === 0){
                    showalert('warning', translate("sdp.solution.topic.move.warning.msg"), "isAutoHide=true"); // No I18N
                    return;
                }
                var input = {"solution": {"topic": { "id": selectTopic[0]}}}; //No I18N
                sdpAjax({
                    url: "/api/v3/solutions?ids="+selected_ids.toString(), //No I18N
                    type: "PUT", //No I18N
                    data: sdpAjaxInputData(input),
                    success: function(resp){
                        showalert('success', translate('api.updated.success',[[translate('sdp.header.newsolution')]+" "+[translate('sdp.solutions.search.fields.topic')]]), "isAutoHide=true"); // No I18N
                        _this.refreshList();
                        $sol.tree.refreshTree();
                        jQuery('#solution_move_popup').dialog('close'); // No I18N
                    }
                })
            },
            //This method is used to link the solution with another solution
            linkSolutions : function(event){
                $SolObj.multipleClickAvoid(event,true);
                var entity_id = window.top.$sol.details.id;
                var selected_ids = $sol.list.table_comp_solution.bulkSelect.getSelectedIDs();
                if(!selected_ids || selected_ids.length===0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                }
                else{
                    var solution_relation = [];
                    for(i =0;i<selected_ids.length;i++){
                        solution_relation.push({"relationid":{"id":selected_ids[i]}});
                    }
                    var inputData = {"solution_relation":solution_relation}; //No I18N
                    var url = "/api/v3/solutions/"+entity_id+"/solution_relations"; //No I18N
                    sdpAjax({
                        url: url,
                        type: "POST", //No I18N
                        data :  sdpAjaxInputData(inputData),
                        error:function(resp){
                            $SolObj.multipleClickAvoid(event,false)
                        },
                        success: function(resp){
                            showalert('success', translate("solution.linksoluiton.success.message"), "isAutoHide=true"); // No I18N
                            setTimeout(function() {
                                window.top.$sol.details.reInitDetailComponent();
                                window.top.$previewComponent.closePreview("sol_association"); //No I18N
                            },500);
                        }
                    });
                }
            },
            /** To handle solution both classic and table view changes here */
            switchSolutionView :function(view_mode) {
                var current_view = {};
                if(sdp_user.CLIENT_CONF.solutions_currentview){
                    current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
                }
                var viewMode;
                if(view_mode == "classic"){ // No I18N
                    $sol.list.view_mode = 'classic'; // No I18N
                    viewMode = "linear"; // No I18N
                    current_view.view = 'classic'; // No I18N
                }
                else if(view_mode == "table"){ // No I18N
                    $sol.list.view_mode = 'table'; // No I18N
                    viewMode = "table"; // No I18N
                    current_view.view = "table"; // No I18N
                }
                addPersonalization("solutions_currentview",current_view); // No I18N
                //pass view as kanban to settemplate for a classic view
                current_view.view = (current_view.view == "classic") ? "kanban" : current_view.view; // No I18N

                if(jQuery(".viewFiltRight .cancel-filter:visible").length > 0 && viewFilterComponent){
                    $SolObj.isFilterCanceled=false;
                    viewFilterComponent.resetFilter();
                    jQuery('#all_solutions_id').removeClass('text-primary');
                    jQuery('#solution_tree').jstree(true).select_node(current_view.topicID);
                }
                var showTrashView = (!$sol.list.tempGsearch) && (($SolObj.deletedTopicID!=null) || (current_view!=null && current_view.filter_by!=null && current_view.filter_by.name == "trash")) ? true : false;
                $sol.list.setTemplate(current_view.view,viewMode,showTrashView);







            },
        }
        return act;
    },

    //To construct a solutions row data
    rowdataConstruct: function (table_info, controller) {
        var _self = this;
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var isTech = sdp_user.USERTYPE=="Requester"?false:true; // No I18N
        var inputObject = {};
        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
        inputObject.list_info = table_info.list_info;
        var param = getSDPURLParams();
        var gsearch = param.gsearch;
         if(!gsearch && this.tempGsearch){
            gsearch = this.tempGsearch;
         }
         var isPopular = $SolObj.isPopular;
        if(gsearch != undefined){
            if(isPopular == "true"){
                inputObject.list_info["gsearch"] = gsearch;
                delete $SolObj.isPopular;
            }
            else if(sdp_user.CLIENT_CONF.sol_search){
                var gsearch_key = "";
                var search_col = sdp_user.CLIENT_CONF.sol_search.search_keyword;
                if(search_col != "default"){
                    gsearch_key = search_col + ":"
                }
                gsearch_key = gsearch_key + gsearch;
                inputObject.list_info["gsearch"] = gsearch_key;
            }
            else{
                inputObject.list_info["gsearch"] = gsearch;
            }
            if(inputObject.list_info.sort_field && inputObject.list_info.sort_order){   //SD-113003
                delete inputObject.list_info.sort_field;
                delete inputObject.list_info.sort_order;
            }
            // To retain a global search box value again the global search
            jQuery("#subheader_search_box").val(gsearch); // No I18N  //SD-111451
        }
        else{
            //To remove the global search input box value without global search time
            jQuery("#subheader_search_box").val("");
        	if(inputObject.list_info.hasOwnProperty("gsearch")){
        		delete inputObject.list_info ["gsearch"];
        	}
        	var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
            var isTrashView=($SolObj.deletedTopicID!=null) || (current_view && current_view.filter_by && current_view.filter_by.name == "trash");
        	if(!inputObject.list_info.sort_field || (inputObject.list_info.sort_field=="deleted_time" && !isTrashView)){     //SD-113003
                inputObject.list_info.sort_field = "created_time";  // No I18N
                inputObject.list_info.sort_order = "desc";   // No I18N
            }
        }
        var linkindex = fields_required_arr.indexOf("edit"); // No I18N
            linkindex > -1 && fields_required_arr.splice(linkindex, 1);
            fields_required_arr.push("has_attachments");// No I18N
        if(_self.view_mode == "classic"){
            fields_required_arr.push("short_description"); //No I18N
        }
        fields_required_arr.push("last_updated_time"); //No I18N
        fields_required_arr.push("approval_status"); //No I18N
        fields_required_arr.push("topic"); //No I18N
        fields_required_arr.push("description"); //No I18N
        fields_required_arr.push("likes"); //No I18N
        fields_required_arr.push("dislikes"); //No I18N
        fields_required_arr.push("deleted_time"); //No I18N
        if(isTech)
        {
            fields_required_arr.push("total_comment_count"); //No I18N


        }
        else
        {
            fields_required_arr.push("public_comment_count"); //No I18N
        }
        fields_required_arr.push("created_by"); //No I18N

        if(isTrashView){
          fields_required.deleted_time='';
        }



        inputObject.fields_required = fields_required_arr;
        return inputObject;
    },
     /** To construct a input data */
    row_inputdata: function (table_info) {
        var _self = this;
        return this.rowdataConstruct(table_info, _self);
    },
    /** listview call back initial render */
    callbackInitialRender: function(viewMode){
        var _self = this;
        jQuery("#listview_btn").on('click',function(){         // No I18N
            var filterList_obj = new filterListComp();
            filterList_obj.initComponent({
                element : "#ListViewFilterMenu",  // No I18N
                module : "solution",  // No I18N
                personalize_key :  "solution_filter_views",// No I18N
                filter_action : "$sol.list.switchFilterView", //No I18N
                processFilters : $sol.list.processListviewFilters,
                managefilter_url : "/ListViewFilter.do?module=solution&action=listview", //No I18N
                favoritable : $SolObj.isPreview ? false : true,
                custom_filters : true,
                skipPersonalization : true
            });
         });
         if($sol['list']['view_mode'] == 'table'){
            jQuery('#'+$sol.list.module+'_div table.tableComponent').css('border-top-width','0px'); //No I18N
        }
        setTimeout(function(){
            initTooltip('.listcontrols'); //No I18N
        },1000);
    },
    /** Method to set loaded record id's after body render which is used for navigations on details page **/
     callbackAfterBodyRender : function(){
        if($sol.list.table_comp_solution){
           $SolGlobal.loadedRecords = $sol.list.table_comp_solution.loadedIDs;
        }
     },
    /** tablecomponent cell construct start here */
    constructChkboxCell: function(table_data){
        var rd = table_data.row_data;
        return "<input type='checkbox' name='checkbox' class='pos-abs top20 mt-2' value=" + rd.id + " data-table-checkbox >"; //No I18N
    },

    /** To construct a solution edit actions */
    constructEdit: function(table_data, _self){
        var rd = table_data.row_data;
        var permission = $sol.list.getPermissions();
        var editHtml='<span class="menutoggle sdmenu bs-noconflict ml10 pos-abs">'+
        '<a class="cur-ptr cspr menulist icon-xs flat disp-ib" data-switch="sdmenu" title="'+translate("sdp.common.actions")+'" rel="uitip" mode_html="true"></a>'+
        '<ul class="sdmenu-dd" role="menu">';
        if(permission.edit && rd.approval_status.name != "Expired" && rd.deleted_time == null){editHtml=editHtml+'<li><a data-spa-module="solutions" data-spa-page="solution-edit" data-spa="true" href="/ui/solutions?mode=edit&entity_id='+rd.id+'" data-spa-page="solutions-edit" data-spa-module="solutions" data-spa="true" data-cs-field="listview_sol_inline_edit" data-i18n-key = "common.edit" rel="noopener">'+translate("common.edit")+'</a></li>'};
        if(rd.deleted_time == null){editHtml=editHtml+ '<li><a href="/" class="sol-actions" data-sol-listaction="forward" data-sol-id="'+rd.id+'" data-cs-field="listview_sol_inline_forward" data-i18n-key = "sdp.requests.viewrequest.forward">'+translate("sdp.requests.viewrequest.forward")+'</a></li>'};
        if( rd.approval_status.name != "Approved" && rd.approval_status.name != "Expired" && rd.deleted_time == null){editHtml=editHtml + '<li><a href="/" class="sol-actions" data-sol-listaction="submit_approval" data-sol-id="'+rd.id+'" data-cs-field="listview_sol_inline_submit_for_approval" data-i18n-key = "sdp.purchase.addNew.view.submit">'+translate("sdp.purchase.addNew.view.submit")+'</a></li>'}
        if(($sol.list.checkApprovePermission(rd.created_by.id)) && rd.approval_status.name != "Approved" && rd.approval_status.name != "Expired" && rd.deleted_time == null){ editHtml=editHtml+ '<li><a href="/" class="sol-actions" data-sol-listaction="operation" data-sol-subaction="approve" data-sol-id="'+rd.id+'" data-cs-field="listview_sol_inline_approve" data-i18n-key = "approval.approve">'+translate("approval.approve")+'</a></li>'}
        if(($sol.list.checkApprovePermission(rd.created_by.id)) && rd.approval_status.name != "Rejected" && rd.approval_status.name != "Expired" && rd.deleted_time == null){ editHtml=editHtml+ '<li><a href="/" class="sol-actions" data-sol-listaction="operation" data-sol-subaction="reject" data-sol-id="'+rd.id+'" data-cs-field="listview_sol_inline_reject" data-i18n-key = "common.reject">'+translate("common.reject")+'</a></li>'}
        if(permission["delete"]){editHtml=editHtml+ '<li><a href="/" class="sol-actions" data-popup="true" data-sol-listaction="delete" data-sol-id="'+rd.id+'" data-sol-deleted="'+rd.deleted_time+'" data-cs-field="listview_sol_inline_delete" data-i18n-key = "common.delete">'+translate("common.delete")+'</a></li>'}
        if(permission.edit && rd.deleted_time!=null){editHtml=editHtml+ '<li><a href="/" class="sol-actions" data-popup="true" data-sol-listaction="restore" data-sol-id="'+rd.id+'" data-topic-deleted="'+rd.topic.isdeleted+'" data-topic-id="'+rd.topic.id+'" data-cs-field="listview_sol_inline_restore" data-i18n-key = "sdp.requests.restorerequests">'+translate("sdp.requests.restorerequests")+'</a></li>'}
        return editHtml+
        '</ul>'+
      '</span>';
    },

    /** To construct a new tab */
    constructNewTab: function(table_data){
        var rd = table_data.row_data;
        return '<a href="/" class="disp-ib ml10"><span class="cspr flat icon-sm newtab m0 top0 cur-ptr" title="'+translate("common.viewdetails")+'" rel="uitip"></span></a>';//No I18N
    },

    /** To construct a solution title and it's tooltip */
    constructTitle: function(table_data){
        var rd = table_data.row_data;
        var attachmentIcon = "",
        titleClass = '';
            if (rd.has_attachments) {
                attachmentIcon = '<span><div class="hide" id="attach_popup_' + rd.id + '"></div><span id="solutions_attachments_' + rd.id + '" class="cur-ptr top0 icon-sm cspr paperclip mr5 opac5" data-entity="solution" data-entity_id="' + rd.id + '" data-target-id="#attach_popup_' + rd.id + '"></span></span>'; // No I18N
            }
            if($sol.list.current_view_mode == 'linear'){
                titleClass = 'uni-heading'; // No I18N
            }
            var title = "";
            var popup_border ="";
            if(rd.short_description.trim() != "" ){
                popup_border= '<hr class="mb10 mt10">';
            }
            title = '<div class="ui-tooltip-style-1"><span class="disp-t"> <span class="disp-c"><span class="hspr icon-md ri-solutn ml-5 mr5"></span></span> <span class="sb vmiddle disp-c text-color4">'+e_html(rd.title)+'</span></span>'+popup_border+'<p class="lh20 mb0 ml3 text-color1">'+rd.short_description+'</p>'+'</div>';
            return '<a data-spa-module="solutions" data-spa-page="solution-details" data-spa="true" href="/ui/solutions?entity_id='+rd.id+'&mode=detail&PORTALID='+PORTALID+'" class="'+titleClass+'" rel="uitip noopener" mode_html="true" title="'+e_attr(title)+'" ">'+ attachmentIcon +e_html(rd.title)+'</a>';//No I18N   //SD-115741
    },

    constructHelpfulness: function(table_data){
            var rd = table_data.row_data;
            var likesCount = rd.likes;
            title = translate("solution.helpful"); //No I18N
            return  '<div class="disp-flex valign-center">'+
                        '<span class="cspr icon-md like mt-1" rel="uitip" title="'+e_attr(title)+'"></span>'+
                        '<span class="vmiddle disp-ib ml5 text-overflow maxw-40px">'+ likesCount+'</span>'+
                    '</div>';
        },
    /** tablecomponent cell construct ends here */

    /** Switch the solution filter and handling the personlization*/
    switchFilterView :function(viewId,viewName){
        var _self = this;
        var current_view = {};
        var previous_view = {};
         var filter_internal_name="AllSolutions";// No I18N

        if(sdp_user.CLIENT_CONF.solutions_currentview){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
            previous_view = jQuery("#solutions-filters").attr('data-filter');
        }
        var personalize_key = "solutions_"+_self.view_mode; // No I18N
        if(sdp_user.CLIENT_CONF[personalize_key] && sdp_user.CLIENT_CONF[personalize_key].list_info){
            sdp_user.CLIENT_CONF[personalize_key].list_info.filter_by = {id:viewId};
            addPersonalization(personalize_key,sdp_user.CLIENT_CONF[personalize_key]);
        }else{
            var listInnfo = { list_info:{ filter_by: {id:viewId}}};
            addPersonalization(personalize_key,listInnfo);
        }

        const filterBy=(viewId == "trash" || viewId == "AllSolutions")?{ "name": viewId}:{id: viewId};// No I18N
        current_view.filter_by = filterBy;
        sdp_user.CLIENT_CONF[personalize_key].list_info.filter_by = filterBy;
        $sol.list.table_comp_solution.t_obj.table_info.list_info.filter_by = filterBy;
        if(!$SolObj.isPreview){
            addPersonalization("solutions_currentview", current_view); // No I18N
        }
        if(!$SolObj.isFilterSaved && viewId != "trash" && viewId != "AllSolutions"){
                 sdpAjax({
                     url: '/api/v3/list_view_filters/'+viewId, // No I18N
                     success: function(resp) {
                         filter_internal_name = resp.list_view_filter.name;
                     },
                     async: false
                 });
             }

        var table_info = $sol.list.table_comp_solution.t_obj.table_info;
        $sol.list.table_comp_solution.t_obj.table_info.list_info.start_index = 1;

        _self.expiredSolutionFilterAction(filter_internal_name);
        $sol.list.table_comp_solution.changeFilterString("clearOnly");// No I18N
        if(current_view && current_view.topicID && !$SolObj.isPreview){
             $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria = {
                            "field":"topic.id", // No I18N
                            "condition":"eq", // No I18N
                             "value": current_view.topicID,  // No I18N
                             "logical_operator":"AND"   // No I18N
             }
             jQuery('#all_solutions_id').removeClass('text-primary');
             jQuery('#solution_tree').find('#'+ current_view.topicID+'_anchor').addClass('jstree-clicked');
        }
        else if(!$SolObj.isPreview){
            delete $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria;
        }

         if(table_info.list_info && table_info.list_info.search_criteria && !$SolObj.isPreview){
            jQuery(".viewFiltRight .cancel-filter").trigger( "click" ); // No I18N
         }
         if(_self.tempGsearch){
             if( $sol.list.table_comp_solution.t_obj.table_info.list_info.gsearch){
                 delete $sol.list.table_comp_solution.t_obj.table_info.list_info.gsearch;
             }
             delete _self.tempGsearch;
             $SolObj.pushingStateURL("solutions", "list");   //No I18N
         }
          if((previous_view == "trash" && viewId!="trash") || ( viewId == "trash")){
                     var view='table',viewMode='table';//No I18N
                     if(_self.view_mode == "classic"){ // No I18N
                         viewMode = "linear"; // No I18N
                         view = 'kanban'; // No I18N
                     }
                      if(viewName=="AllSolutions" && viewId=="AllSolutions" && $SolObj.deletedTopicID!=null){
                           $sol.list.table_comp_solution.refreshTable("refresh");// No I18N
                        }
                        else{
                           _self.setTemplate(view,viewMode,(viewId=='trash') ? true : false);//No I18N
                        }
          }
          else{
             $sol.list.table_comp_solution.refreshTable("refresh");// No I18N
          }

        viewName = viewId == "AllSolutions" ? translate("solution.allactivesolution"): viewName;// No I18N
        _self.filter_display_name=viewName;
        _self.filterByRenderAction();
    },

    /** Set tablecomponent width */
    setWidth: function(){
        var width = jQuery("#listview").width(); // No I18N
        return width;
    },
    /** render the treeview for move the solutions to topics in the popup */
    renderTreeForMove: function(){
        var cloneTree = jQuery.extend(true, {}, $sol.tree);
        cloneTree.renderTopics({
            treeSelector: "sol_move_tree", //No I18N
            customizeNodeCB: {},
            actions: {},
            isClone: true
        })
        jQuery('#sol_move_tree').jstree(true).deselect_all(true);
        if(sdp_user.CLIENT_CONF.solutions_currentview){
            var topicId = sdp_user.CLIENT_CONF.solutions_currentview.topicID;
            if(topicId){
                jQuery('#sol_move_tree').jstree(true).select_node(topicId);
            }
        }
    },
    /** Initialize the advance filter component */
    initClassicFilter: function(){
        var _self =this;
        var solComponent = WebComponents.getInstance('webc_solutions'); // No I18N
        var filterOpt = {
            parentDiv: "solutions_filter_view", // No I18N
            entity: "solutions", // No I18N
            entityComponent: solComponent,
            enableSave: sdp_user.USERTYPE=="Requester"? false : true,// No I18N
            module:"solution",//No I18N
            metaParam: "advanced_search_filter",  //No I18N
            allowReadOnly: true,
            specialFormats: ["have_none"],
            ignoreNoneFields:['created_by','created_time','last_updated_by','last_updated_time','approval_status'], //No I18N
            chkMandatory:true,
            haveMultiString: true,
            maxinnerrows: 5,
            changeData : function(data,field){

            if(field=='is_public'){
                data[0].text=translate("sdp.dashboard.common.public");
                data[1].text=translate("sdp.dashboard.common.private");
            }
            else if(field == 'problem_resolution'){
                data[0].text=translate("sdp.admin.settings.yes");
                data[1].text=translate("sdp.admin.settings.no");
            }

                return data;
            },

            /** Handling the advance filter search criteria Note: topic filter when available also handled */
            applyFn: function(criteria){
                // temp_list_info for advance filter when the filter was cancel or reset it will be reused
                if(Object.keys($sol.list.temp_list_info).length == 0){
                    $sol.list.temp_list_info = jQuery.extend({},solComponent.t_obj.table_info.list_info);
                }
                $SolObj.isFilterCanceled = true;
                $SolObj.isFilterApplied = true;
                jQuery('#listview_btn').hide();
                jQuery('#solution_tree').jstree(true).deselect_all(true);
                jQuery('#all_solutions_id').addClass('text-primary');
                jQuery('#listcontrols').find('#TopicFilterMenu').toggle(false);
                if(!jQuery.isEmptyObject(solComponent.t_obj.table_info.list_info.search_fields) || !jQuery.isEmptyObject($sol.list.temp_list_info.search_fields)){
                    var search_fields = solComponent.t_obj.table_info.list_info.search_fields;
                    search_fields = search_fields ? search_fields : $sol.list.temp_list_info.search_fields;
                    jQuery.each(search_fields, function(i, v){
                        criteria.push({
                            condition: "is", //No I18N
                            field: i,
                            logical_operator: "and", //No I18N
                            values: [v]
                        })
                    })
                    delete solComponent.t_obj.table_info.list_info.search_fields;
                }
                $sol.list.table_comp_solution.changeFilterString("clearOnly");// No I18N
                solComponent.t_obj.table_info.list_info.search_criteria = criteria;
                solComponent.t_obj.table_info.list_info.filter_by = null;
                solComponent.t_obj.table_info["for"]="advanced_search_filter";// No I18N
                solComponent.refreshTable('refresh'); //No I18N
                $sol.list.advanced_search_criteria=criteria;
            },
            cancelFn: function(){
                // Reset the list_info for cancel the filter or reset the filter

                $sol.list.table_comp_solution.changeFilterString("clearOnly");// No I18N
                $SolObj.isFilterApplied=false
                jQuery('#listview_btn').show();
                if($SolObj.isFilterCanceled && (event && event.currentTarget && (jQuery(event.currentTarget).hasClass('cancel-filter') || jQuery(event.currentTarget).hasClass('reset-filter'))) ){
                    if($sol.list.temp_list_info)
                    {
                        solComponent.t_obj.table_info.list_info = $sol.list.temp_list_info;
                        delete $sol.list.temp_list_info;
                        if($SolGlobal.topicview == "topic"){
                            solComponent.t_obj.table_info["for"]="topic_filter";// No I18N
                        }
                        else{
                            delete solComponent.t_obj.table_info["for"];
                        }

                        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
                        if(current_view && current_view.topicID){
                            jQuery('#all_solutions_id').removeClass('text-primary');
                            jQuery('#solution_tree').jstree(true).select_node(current_view.topicID);
                        }
                        else{
                            if(!$sol.list.tempGsearch){
                                jQuery('#all_solutions_id').trigger( "click" );
                            }
                            else{
                                if(solComponent.t_obj.table_info.list_info.search_criteria){
                                    delete solComponent.t_obj.table_info.list_info.search_criteria;
                                }
                                solComponent.refreshTable('refresh'); //No I18N
                            }
                        }
                    }
                }
                else{
                    if(sdp_user.CLIENT_CONF.solutions_currentview && sdp_user.CLIENT_CONF.solutions_currentview.filter_by){
                        solComponent.t_obj.table_info.list_info.filter_by = sdp_user.CLIENT_CONF.solutions_currentview.filter_by;
                    }
                    else{
                        solComponent.t_obj.table_info.list_info.filter_by  = {"name" : "AllSolutions"}; //No I18N
                    }
                }
            },
            errFiltFn: function (resp) {
                if(resp.responseJSON.response_status.messages[0].status_code === 4008){
                    showalert("failure", translate("sdp.api.customfilter.name.exists"), "isAutoHide=true, delay=3") //No I18N
                }
                else if(resp.responseJSON.response_status.messages[0].status_code === 4001){
                    if(resp.responseJSON.response_status.messages[0].field == "display_name"){
                        showalert("failure", translate("sdp.customfilter.invalid.name"), "isAutoHide=true, delay=3") //No I18N
                    } else {
                       showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                    }
                }
                else{
                    showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                }
            },
            refFiltFn:function(resp){

                $SolObj.isFilterApplied=false;
                $SolObj.isFilterCanceled = false;
                 var filter = resp.list_view_filter;

                    var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
                    $SolObj.isFilterSaved = true;
                    if($SolGlobal.topicview == "topic"){
                        solComponent.t_obj.table_info["for"]="topic_filter";// No I18N
                    }
                    else{
                        delete solComponent.t_obj.table_info["for"];
                    }

                    if(current_view && current_view.topicID){
                        solComponent.t_obj.table_info.list_info.search_criteria={
                            "field":"topic.id", // No I18N
                            "condition":"eq", // No I18N
                             "value": current_view.topicID,  // No I18N
                             "logical_operator":"AND"   // No I18N
                        }
                        jQuery('[data-sol-listaction="all_solutions"]').removeClass('text-primary');
                        jQuery("#solution_tree").jstree('select_node',current_view.topicID);// No I18N

                    }
                    else{
                        delete solComponent.t_obj.table_info.list_info.search_criteria;
                    }

                 $sol.list.switchFilterView(filter.id,filter.display_name);
                 $SolObj.isFilterSaved = false;
                 jQuery('#listview_btn').show();
                 $sol.list.table_comp_solution.changeFilterString("clearOnly");// No I18N

            },
            metaOverride:  {
                "problem_resolution": {"display_name" : translate("solution.associated.problem"),"type" : "boolean"},// No I18N
                "is_public": {"display_name" : translate("ae.cmdb.relationshipmap.visibility")},//No I18N
                "last_updated_time": {"type" : "date"},//No I18N
                "created_time" : {"type" : "date"}//No I18N

            },
            skipFieldTypeConditions : {
                "created_time" : ["is_empty", "is_not_empty"], // No I18N
                "created_by": ["is_empty", "is_not_empty"], // No I18N
                "last_updated_by" : ["is_empty", "is_not_empty"], // No I18N
                "approval_status":["is_empty", "is_not_empty"], // No I18N
                "id":["is_empty", "is_not_empty"], // No I18N
            },
            skipFields : ["deleted_time"],
            enableDragHandle: true,
            innerCriteriaEnabled:true,
}
        //Removing 'mark as private/public' for restricted users.
                if(sdp_user.ROLES.indexOf("SDAdmin") == -1 ){ //No I18N
                  filterOpt.hideMarkPublic = true
                }
        viewFilterComponent.initComponent(filterOpt);
    },
    /** listview height width resize when window resize */
    resizeTableHeightWidth:function(){
        var _self = this;
        var tableObj = WebComponents.getInstance("webc_solutions"); // No I18N
        setTimeout(function(){
            var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0, // No I18N
                treeWidth = jQuery(window).width() - jQuery('.tree-ui-1').width() - 23,
                jqB = jQuery('body').attr('data-header-tabs'),
                jqSCWidth = jQuery('.sidebar-container').width(); //No I18N
            if(jqB == 'sidebar' || jqB == 'sidebarlite'){
                treeWidth = treeWidth - jqSCWidth;
            }
            tableObj.setTableHeight(jQuery('#header-placeholder').length == 0 ? (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height- 80) : (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - 80));
            tableObj.setTableWidth(treeWidth);
        }, 500);
    },

    /** Inline search Call back function to handle a api call - Every time api call happened via search box this function will be triggered */
    callbackSearchFunction : function(){

        var current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
        if($sol.list.table_comp_solution.t_obj.table_info.list_info.search_fields){
            var search_array = [];
            var topic_value=$SolObj.deletedTopicID ? $SolObj.deletedTopicID : (current_view && current_view.topicID ? current_view.topicID : null);
            if((!$sol.list.table_comp_solution.t_obj.table_info.list_info.gsearch) &&  topic_value!=null && !$SolObj.isFilterApplied){
                var search_criteria_topic = {
                        "field":"topic.id", // No I18N
                        "condition":"eq", // No I18N
                         "value": topic_value,  // No I18N
                         "logical_operator":"AND"   // No I18N
                };
                search_array.push(search_criteria_topic);
            }
            var search_field = $sol.list.table_comp_solution.t_obj.table_info.list_info.search_fields;
            var search_object = Object.keys(search_field);
            search_object.forEach(function(key) {
                var search_criteria_field;
                if(key == "no_of_hits" || key == "id" || key == "likes" || key == "dislikes" || key == "total_comment_count"){
                    search_criteria_field  = {
                        "field":key, // No I18N
                        "condition":"eq", // No I18N
                        "value": search_field[key],  // No I18N
                        "logical_operator":"AND"    // No I18N
                    };
                }
                else{
                    search_criteria_field  = {
                        "field":key, // No I18N
                        "condition":"like", // No I18N
                        "value": search_field[key],  // No I18N
                        "logical_operator":"AND"    // No I18N
                    };
                }
                search_array.push(search_criteria_field);
            });
           if($sol.list.advanced_search_criteria && Array.isArray($sol.list.advanced_search_criteria)){
                       search_array = search_array.concat($sol.list.advanced_search_criteria);
           }
            $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria = search_array;
            delete $sol.list.table_comp_solution.t_obj.table_info.list_info.search_fields;
        }
        else{
            delete $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria;
            var topic_value=$SolObj.deletedTopicID ? $SolObj.deletedTopicID : (current_view && current_view.topicID ? current_view.topicID : null);
            if((!$sol.list.table_comp_solution.t_obj.table_info.list_info.gsearch) && topic_value && !$SolObj.isFilterApplied){
                var search_criteria_topic1 = {
                    "field":"topic.id", // No I18N
                    "condition":"eq", // No I18N
                    "value": topic_value,  // No I18N
                };
             }

                if($SolObj.isFilterApplied){

                    $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria = $sol.list.advanced_search_criteria;
                }
                else{
                     $sol.list.table_comp_solution.t_obj.table_info.list_info.search_criteria = search_criteria_topic1;
                }


        }
        if(!$sol.list.switchView){
            $sol.list.table_comp_solution.refreshTable("search")
        }
        $sol.list.switchView=false
    },
    /** listview no data available message (No solution found in this view)*/
    setNoDataString : function(){
        if($sol.list.current_view_mode == "linear"){ // No I18N
            return '<div class="tc p15 mt50"><span>'+ translate("sdp.solution.listview.not.available")+'</span></div>';
        }
        else{
            return '<span>'+ translate("sdp.solution.listview.not.available") +'</span>';// No I18N
        }
    },

//This function is used to hide the approve, reject and move button when expired solution filter is applied
    expiredSolutionFilterAction : function(filter){
        var _self=this;

          var listviewJQ=jQuery('#listcontrols');
          var bulk_selection_fields = listviewJQ.find("[data-sol-view='bulkSelectionButton']");
          var expired_hidefields1 = listviewJQ.find("[data-sol-view='listview_sol_action']");
          if(filter == 'ExpiredSolutions'){
            bulk_selection_fields.hide();
            expired_hidefields1.hide();
          }
          else{
            bulk_selection_fields.show();
            expired_hidefields1.show();
          }

    },
     //Table list info construction for solution like preview component page
    tableEntityforAssoSolution : function(personalize_key){
        var entity_id = window.top.$sol.details.id;
        var ignoredSolutions = [];
        var input_data = {"list_info": {"fields_required" : ["IgnoreIds"]}}; // No I18N
        sdpAjax({
            url: "/api/v3/solutions/" + entity_id + "/_summary", // No I18N
            data : sdpAjaxInputData(input_data),
            success: function(resp) {
                ignoredSolutions = resp.solution_summary.IgnoreIds;
            },
            async: false
        });
        ignoredSolutions.push(entity_id);
        this.ignoredSolutions = ignoredSolutions;
        var table_info = getPersonalizeData(personalize_key);
        var search_criteria;
        var filter_by = {"name":"AllSolutions"}; //No I18N
        search_criteria = {
            "field":"id", // No I18N
            "condition":"neq", // No I18N
             "values": ignoredSolutions,  // No I18N
             "children": [// No I18N
                  {
                  "field": "approval_status.name",// No I18N
                  "value": "Expired",// No I18N
                  "condition": "neq",// No I18N
                  "logical_operator": "AND"// No I18N
                 }
             ]
        };
        if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            /**
             * To avoid object reference issue
             */
            table_info = JSON.parse(sdpToJSON(global_table_info.solutions));
        }
        if(search_criteria){
            table_info.list_info.search_criteria = search_criteria;
        }
        if(filter_by){
            table_info.list_info.filter_by = filter_by;
        }
        return table_info;
    },
    ////topic filter for solution listview preview component
    topicFilter : function(){
        var _self = this;
        var ignoredSolutions = _self.ignoredSolutions;
        var topicId = jQuery("#topicConstruct").val();
        var search_array = [];
        var solutionsTable = WebComponents.instancePool["webc_solutions"];// No I18N
        if(topicId){
            var search_criteria_topic = {
                "field":"topic.id", // No I18N
                "condition":"eq", // No I18N
                "value": topicId,  // No I18N
                "logical_operator":"AND"   // No I18N
            };
            search_array.push(search_criteria_topic);
        }
        var search_criteria_ignoredSolutions = {
            "field":"id", // No I18N
            "condition":"neq", // No I18N
             "values": ignoredSolutions,  // No I18N
             "logical_operator":"AND",   // No I18N
             "children": [// No I18N
                  {
                  "field": "approval_status.name",// No I18N
                  "value": "Expired",// No I18N
                  "condition": "neq",// No I18N
                  "logical_operator": "AND"// No I18N
                 }
             ]
        };
        search_array.push(search_criteria_ignoredSolutions);
        solutionsTable.t_obj.table_info.list_info.search_criteria = search_array;
        solutionsTable.refreshTable("refresh");// No I18N
    },
    //To construct a topic dropdown options for list view preview component
    constructTopicsForFilterOptions : function(){
        var _self = this;
        var input_data={"include_inactive_value" : false}//No I18N
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/topics/_get_topic_tree", //No I18N
            data: sdpAjaxInputData(input_data) ,
            async:false,
            success: function (resp) {
                var topics = resp.topics;
                 topics.forEach(function(topic){
                     var topicObj=$SolGlobal.constructSubTopicDropdown(topic);
                     _self.all_topics.push(topicObj);
                   })
            }
        });
        var topics = [];
        topics = _self.all_topics.slice();
        var tree_Data = topics;
        jQuery("#topicConstruct").select2({data:tree_Data,placeholder:translate("solution.select.topic"),allowClear:true,dropdownCssClass: 's2-hover-ui1'}); // No I18N
        jQuery("#topicConstruct").on("change", function(e) { $sol.list.topicFilter() }); // No I18N
    },
    //This function is used to remove the expired solution filter for preview component list view
    processListviewFilters : function (list_view_filters){
        var _self=this;
        var filterArray = list_view_filters;
            var show_all_length = filterArray.length;
            for(i = 0;i<show_all_length;i++){
                if(filterArray[i].name == "ExpiredSolutions"){
					var listviewJQ=jQuery('#listcontrols');
                    listviewJQ.find("#FilterExpiredSolutions").attr("data-id",filterArray[i].id);
                    filterArray.splice(i,1);                    break;
                }
            }
        return filterArray;
    },

    //This function is used to handle topic filter in solution list view
    switchTopicFilter : function(topic_view,topicid){

       var listviewJQ=jQuery('#listcontrols');
        var current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
        var topic_id=topicid ? topicid :  current_view.topicID;
        //set topic view based on the filter applied
            if(topic_view=="topic"){
                $SolGlobal.topicview="topic";//NO I18N
                listviewJQ.find('#TopicFilterButton').text(translate("solution.topic.show"));
                listviewJQ.find('#TopicFilterButton').attr('title',translate('solution.topic.show'));
            }
            else if(topic_view=="subtopic"){
                $SolGlobal.topicview="subtopic"; //NO I18N
                listviewJQ.find('#TopicFilterButton').text(translate("solution.subtopic.show"));
                listviewJQ.find('#TopicFilterButton').attr('title',translate('solution.subtopic.show'));
            }

    },
    filterByRenderAction : function(){

            var _self = this;
            var listviewJQ=jQuery('#listcontrols');
            var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
            var filter;
            var data_filter="active";
            if(!$SolObj.isPreview){
                if(_self.tempGsearch){
                     listviewJQ.find('#solutions-filters').text(translate('sdp.leftpanel.search.title'));// No I18N
                     listviewJQ.find('#listview_btn').attr("title",translate('sdp.leftpanel.search.title'));// No I18N
                     listviewJQ.find('#solutions-filters').attr("data-filter","active");
                }
                else{
                    if($SolObj.deletedTopicID){
                        filter = "trash"; // No I18N
                        data_filter="trash";
                    }
                    else if(current_view && current_view.filter_by && current_view.filter_by && filter!="trash"){
                        filter = current_view.filter_by.id ? current_view.filter_by.id : (current_view.filter_by.name) ?  current_view.filter_by.name : "AllSolutions";//No I18N
                        data_filter="trash";
                    }
                     listviewJQ.find('#solutions-filters').text(_self.filter_display_name);// No I18N
                     listviewJQ.find('#listview_btn').attr("title",translate(_self.filter_display_name));// No I18N
                     listviewJQ.find('#solutions-filters').attr("data-filter",data_filter);
                }
                  var showTopicFilterMenu = $SolObj.deletedTopicID === null && current_view!=null && current_view.topicID!=null && !_self.tempGsearch;
                  listviewJQ.find('#TopicFilterMenu').toggle(showTopicFilterMenu);

                listviewJQ.find("#ListViewFilterMenu").find("#listview_btn").prop("disabled",($SolObj.deletedTopicID)?true:false); //No I18N
            }else{
                listviewJQ.find('#solutions-filters').text(_self.filter_display_name);// No I18N
                listviewJQ.find('#listview_btn').attr("title",translate(_self.filter_display_name));// No I18N
            }

            return current_view;
       },

       constructTopic : function(table_data){
       var _self = this;

        var rd=table_data.row_data;
        var html_span='';
        if(rd.topic.isdeleted == true){
            html_span='<span class="warning2 cspr icon-sm mr3 tf0-8 top0 opac5" title="'+translate('topic.deleted')+'" rel="uitip"></span>'
        }
       return html_span+''+'<span title="'+e_attr(rd.topic.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.topic.name)+'</span>';




 },

    apiFailuerCallback : function(resp){
        var _self=this;
        var table_comp=resp[0]
        var response_status=resp[1].responseJSON.response_status;
        if(response_status[0].messages[0].field == 'list_info.filter_by'){
            if(sdp_user.CLIENT_CONF.solutions_currentview){
                  sdp_user.CLIENT_CONF.solutions_currentview.filter_by = { "name": "AllSolutions"}; //No I18N
                  if(!$SolObj.isPreview){
                      addPersonalization("solutions_currentview", sdp_user.CLIENT_CONF.solutions_currentview); // No I18N
                  }
            }
            table_comp.t_obj.table_info.list_info.filter_by = {"name":"AllSolutions"};//No i18n
            setTimeout(function(){
                table_comp.refreshTable('refresh');// No I18N
            },1000)
             jQuery('#solutions-filters').text(translate("solution.allactivesolution"));// No I18N
             jQuery('#listview_btn').attr("title",translate("solution.allactivesolution"));// No I18N

        }
    },
    checkApprovePermission : function(createdUser){
        var roles=sdp_user.ROLES;
        if(roles.indexOf("SolutionsApprove")>-1 && (($sol.list.selfApprove && $sol.list.selfApprove.length!=0) || ($sol.list.selfApprove && $sol.list.selfApprove.length==0 && createdUser!=sdp_user.LOGGEDIN_USERID) )){
            return true
        }
        else{
            return false;
        }
    },

    setTopicTreeTemplate:function(externalframe){
        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
        var contextObj={};
        contextObj.externalframe=externalframe;
        contextObj.isTech =sdp_user.USERTYPE!="Requester";// No I18N
        contextObj.hideTrashTopic=(current_view && current_view.includeTrashedTopic==false)?true:false;
        contextObj.edit=sdp_user.ROLES.indexOf("ModifySolutions") > -1
        contextObj.create=sdp_user.ROLES.indexOf("CreateSolutions") > -1
        contextObj.isScp=sdp_app.IS_SCP;
        var compiledHtml =renderhbs(null,"sol_topic_tree_template",contextObj,false,"solutions",null,"solutions",null,true);    //No I18N
        jQuery("#sol-topic-tree").html(compiledHtml);

    }
}
