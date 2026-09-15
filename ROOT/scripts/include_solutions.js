/* $Id$ */
$includeSolution = {
    //To store a list_info details

    //To initialize the include solution popup
    init: function(){
        var _self = this
        setTimeout(function(){
            _self.getTopics();
        },100);
        _self.resizeTable();
    },
    //To set a popup template here
    setTemplate: function(allTopics){
        var _self =this;
        var tree_Data = allTopics.slice();
        tree_Data.unshift({ id : -1, name : "Choose Topic",text : translate("sdp.solutions.newsolution.choosetopic")}, {id : 0, name : "All Topics",text : translate("sdp.solutions.topics.alltopics")});   // No I18N
        /* For development mode remove the hbs-template-solutions-suggest.js entry in NotificationPopup.js file */
        renderhbs("#include_solution_section","include_solutions",{},false,"solutions/solutions_suggest","include_solution_section"); //No I18N
        jQuery("#topicConstruct").select2({data:tree_Data,placeholder:translate("solution.select.topic"),dropdownCssClass: 's2-hover-ui1'}); // No I18N
        jQuery("#topicConstruct").select2( "data",{ id: -1, text: translate("sdp.solutions.newsolution.choosetopic")});  //NO I18N
        _self.getSearchFieldPersonalization();
        _self.constructIncludeSolutionsDiv();
        _self.includeSolutionEvents();
    },
    /* This function used to get a topics data for dropdown */
    getTopics : function (){
        var _self = this;
        var input_data={"include_inactive_value" : false}//No I18N
        var treeData = [];
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/topics/_get_topic_tree", //No I18N
            data: sdpAjaxInputData(input_data),
            success: function (resp) {
                var topics = resp.topics;
                topics.forEach(function(topic){
                   var topicObj=$SolGlobal.constructSubTopicDropdown(topic);
                   treeData.push(topicObj);
                 })
               _self.setTemplate(treeData);

            }
        });
    },
    //Include solution related actions initialized here
    includeSolutionEvents : function(){
        var _self = this;
        jQuery(document).off("click.solincludeaction").on("click.solincludeaction", ".sol-include-actions", function(event){ //No I18N
            var action = jQuery(this).attr("data-sol-includeaction");
            switch(action){
                case "highlightAttachments" :   //No I18N
                    _self.highlightAttachments("#scrollAttach");   //No I18N
                    break;
                case "insertSolutionLink" :   //No I18N
                    _self.insertSolution("Link", event);
                    break;
                case "insertSolutionContent" :   //No I18N
                    _self.insertSolution("Content", event);
                    break;
                case "backToSendNotificationPage" :   //No I18N
                    _self.backToSendNotificationPage();
                    break;
                case "clickDropdownValues" :   //No I18N
                    _self.dropdownClickAction(this,event);
                    break;
            }
        });
        jQuery("#topicConstruct").off("change.solincludeaction").on("change.solincludeaction", function(event){ //No I18N
            _self.filterAndSearchSolutions('topic');    //No I18N
        });
        jQuery("#sol_searchtext").off("keyup.solincludeaction").on("keyup.solincludeaction", function(event){ //No I18N
            _self.filterAndSearchSolutions('search');   //No I18N
        });
    },

    //This function is return the single solution data
    getSolutionData : function(solId){
        var _self = this;
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/solutions/"+solId, //No I18N
            success: function (resp) {
                var sol_res = resp.solution;
                _self.entity_data = sol_res;
                _self.viewSolution(solId,sol_res);
            }
        });
    },

    //To view a solution in a ui
    viewSolution : function(solId, sol_res){
        if(sol_res.approval_status.name != "Approved"){
            window.showalert('failure', translate('sdp.api.solution.association.request.notpermittedsolution'), 'isAutoHide=false');    //No I18N
            return;
        }
        var _self = this;
        var inSolJQ = jQuery("#rtInSol");
        jQuery("#inSnodata").hide();

        //To highlighted a selected solution
        inSolJQ.find("#include_solutions_kanban_div")
            .find("[data-cs-field='kanban-card']")
                .removeClass("fw active")
                .end()
            .find("[data-entityid='"+solId+"']")
                .addClass("fw active")
                .end()
            .find("#solution_"+solId)
                .addClass("ptr-ev-none")
                .end()
            .find("#solution_"+_self.preSelectedId)
                .filter("#solution_"+_self.preSelectedId)   //No I18N
                .removeClass("ptr-ev-none")
                .end()

        _self.preSelectedId = solId;

        //set visibility
        var sol_status = "";
        var statusSymbolClass = "";
        var statussymbolTitle = "";
        if(sol_res.is_public){
            sol_status = translate("sdp.dashboard.common.public");
            statusSymbolClass = "cspr icon-sm public-filter top0";  //No I18N
            statussymbolTitle =  translate('sdp.solution.listview.publicsolutions');
        }
        else{
            sol_status = translate("sdp.dashboard.common.private"); //No I18N
            statusSymbolClass = "cspr icon-sm lock-line-clr top0";  //No I18N
            statussymbolTitle =  translate('sdp.solution.listview.privatesolutions');
        }
        sol_res.sol_status = sol_status;
        sol_res.statusSymbolClass = statusSymbolClass;
        sol_res.statussymbolTitle = statussymbolTitle;

        //Enable the Insert buttons
        inSolJQ.find("#insertSolasLink").prop('disabled', false); //No I18N
        //Only allow to insert the 50 attachments in Reply popup. In case the Reply popup attachment + current selected solution attachment count greater then 50 means the selected solution's (InsertSolutionContent) button is disabled
        const attachmentsCount = $notification_popup.notification.uploadedAttachments.length + _self.entity_data.attachments.length;
        const isDisabled = attachmentsCount > 50;
        inSolJQ.find("#insertSolasCont").prop('disabled', isDisabled);  //No I18N
        isDisabled ? inSolJQ.find("#insertAsContentTooltip").prop('title', translate('solution.insert.attachcount.info',[50])) : inSolJQ.find("#insertAsContentTooltip").removeAttr('title');

        renderhbs("#sol_detail_data","include-solutions-details-template",sol_res,false,"solutions/solutions_suggest","sol_detail_data"); //No I18N
        _self.loadDescriptionAndAttachmentSection();
        if(sol_res.attachments.length == 0){
            inSolJQ.find("#attachment_symbol").prop('class','hide');  //No I18N
        }
    },
    //To highlight the attachment when click
    highlightAttachments : function(container){
        var attachEle = jQuery('#include_solution_description_attach_api .attachdrop '),
        el_bg_color = attachEle.css('background-color');    //No I18N
        jQuery(container).animate({
            scrollTop: jQuery('#include_solution_description_attach_api').offset().top,
        }, 300, function(){
            attachEle.animate({
                backgroundColor: "#fff6ea"  //NO I18N
            }, 500, function(){
                attachEle.animate({
                    backgroundColor: el_bg_color
                }, 200);
            });
        });
    },
    openIncludeSolutionPage : function(){
        var _self = this;
        //To close the editor full screen during include solution popup open
        _self.isEditorFullScreenClosed = jQuery("#ze_notifDescText").find(".small-screen").length > 0 ? jQuery("#ze_notifDescText").find(".small-screen").trigger('click') && true : false;

        var includeSolJQ = jQuery('#notification-component-popup-wrapper');
        includeSolJQ.find('.zdialog__title').html('<a href="/" data-name="back_to_reply" data-id="back_to_reply" class="btn btn-default btn-xs mr10 sol-include-actions" data-sol-includeaction="backToSendNotificationPage" rel="uitip" title="'+translate("sdp.admin.back.reply")+'"> <span class="cspr icon-xs go-back top1"></span> </a><span class="disp-ib vmiddle">'+translate('solution.insert.include')+'</span>');
        includeSolJQ.find('#include_solution_section').parents('.zdialog__content').addClass('oh-i'); //NO I18N
        setTimeout(function(){
            includeSolJQ.find('#send-notification-section').addClass('hide').removeClass('fadeinleft');
            includeSolJQ.find('#include_solution_section').removeClass('hide').addClass('fadeinright');
            includeSolJQ.find('#scrollAttach,#inSnodata').css('height',jQuery(window).height() * 0.6 + 5); //NO I18N
        },10);
        setTimeout(function () {
            includeSolJQ.find('#include_solution_section').removeClass('fadeinright');
            initTooltip('.zdialog__title'); //NO I18N
        }, 15);
        _self.init();
    },
    backToSendNotificationPage : function(){
        var includeSolJQ = jQuery('#notification-component-popup-wrapper');
        includeSolJQ.find('.zdialog__title').html(translate('sdp.common.mail.title'));  //No I18N
        includeSolJQ.find('#include_solution_section').parents('.zdialog__content').removeClass('oh-i'); //NO I18N
        setTimeout(function(){
            includeSolJQ.find('#include_solution_section').addClass('hide').removeClass('fadeinright');
            includeSolJQ.find('#send-notification-section').removeClass('hide').addClass('fadeinleft');
        },10);
        setTimeout(function () {
            includeSolJQ.find('#send-notification-section').removeClass('fadeinleft');
        }, 1000);
        setTimeout(function(){
            jQuery('.ui-tooltip').remove();
        },1500);

        //Unused dirty data clean up during popup close
        delete $includeSolution.$descriptionPC;
        delete $includeSolution.tableObjIncludeSolutions;
        delete $includeSolution.entity_data;
        delete $includeSolution.preSelectedId;
        delete $includeSolution.isEditorFullScreenClosed;
        delete $includeSolution.searchText;
        delete $includeSolution.searchString;


        //Include Solution popup related events are closed during popup close
        jQuery(document).off('click.solincludeaction');     //No I18N
        jQuery("#topicConstruct").off('change.solincludeaction');    //No I18N
        jQuery("#sol_searchtext").off('keyup.solincludeaction');    //No I18N
        jQuery(window).off('resize.incTableResize');    //No I18N
    },
    constructIncludeSolutionsDiv : function(){
        var _self = this;
        var tableHolderDiv = "include_solutions";  //No I18N
        var table_info = {"list_info" : {"start_index" : "1", "row_count" : "20", "gsearch":_self.getSearchStringForSuggestSolutions() }}; //No I18N
        var header_metadata = {
            user_data: {
                "default": true, // No I18N
                "hide_label": true,// No I18N
                "column_settings": { "view_type": "row" ,"rowposition":1 }, // No I18N
                "dataCelltransformer": _self.constructIncludeSolutionRow, // No I18N
                "sortable": true, // No I18N
                "value_path" : "created_time" // No I18N
            }
        }
        var table_content = {"header" : header_metadata }; //No I18N
        var options = {
            entity_name      : "solutions", //No I18N
            callbackURL      : "solutions", //No I18N
            tableHolder      : tableHolderDiv,
            lazyloadingEnabled : true,
            row_inputdata : _self.rowDataConstructForIncludeSolutions(table_info),
            staticHeader: true,
            width : '100%',
            height : jQuery(window).height() - 160,
            paginationEnabled : true,
            sortingEnabled : true,
            callbackAfterBodyRender : $includeSolution.callbackAfterBodyRender,
            default_sort_field : {
                sort_order : "desc" //No I18N
            },
            nodataString : '<div class="tc p15"><span>'+translate("sdp.solutions.home.popularsolutions.nosolutions")+'</span></div>',  //No I18N
            isODAPI : true,
            view: "kanban", //No I18N
            view_mode: "linear" //No I18N
        }
        _self.tableObjIncludeSolutions = new tableComponent(table_info,table_content,options);
    },
    constructIncludeSolutionRow : function(table_data){
        var rd = table_data.row_data;
        var title = '<span class="wb-bw maxw-250px">'+e_html(rd.title)+'</span>';
        return '<div class="disp-t" id="solution_'+rd.id+'" data-event="click" data-handler="$includeSolution.getSolutionData('+rd.id+')" nonce='+sdpNonce+'><div class="disp-c"><span class="'+( rd.is_public ? "cspr icon-sm public-filter":"cspr icon-sm lock-line-clr" )+'" role="img" rel="uitip" title="'+( rd.is_public ? translate('sdp.solution.listview.publicsolutions'):translate('sdp.solution.listview.privatesolutions'))+'"></span></div><div class="disp-c"><div class="mt3 cur-ptr" title="'+e_attr(title)+'" rel="uitip" mode_html="true" mode_type="height">'+e_html(rd.title)+'</div><p class="mt5 text-overflow text-muted" title="'+e_attr(rd.topic.name)+'" rel="uitip" mode_ellipsis="true">'+e_html(rd.topic.name)+'</p></div></div>';
    },
    rowDataConstructForIncludeSolutions : function(table_info){
        var inputObject = {};
        table_info.list_info.filter_by = { "name":"ApprovedSolutions" } ;  //No I18N
        table_info.list_info.sort_field = "created_time";   //No I18N
        inputObject.list_info = table_info.list_info;
        return inputObject;
    },
    filterAndSearchSolutions : function(filterType){
        var _self = this;
        var inSolJQ = jQuery("#rtInSol");
        _self.tableObjIncludeSolutions.t_obj.table_info.list_info.start_index = 1; /* Every time we do search or topic sort, set a start_index as 1 because of lazyloading */
        var topicId = inSolJQ.find("#topicConstruct").val();
        var search_criteria = [];
        if(filterType == "topic"){
            if(_self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch){
                delete _self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch;
            }
            if(topicId && topicId > 0){
                search_criteria.push({ "field":"topic.id","condition":"eq", "value": topicId, "logical_operator":"and" });
                _self.tableObjIncludeSolutions.t_obj.table_info.list_info.search_criteria = search_criteria;
            }
            else{
                delete _self.tableObjIncludeSolutions.t_obj.table_info.list_info.search_criteria;
                 if(search_criteria.length > 0){
                     _self.tableObjIncludeSolutions.t_obj.table_info.list_info.search_criteria = search_criteria;
                 }
                 if(topicId == -1){
                     _self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch = _self.getSearchStringForSuggestSolutions();
                 }
            }
            _self.searchText = "";
            inSolJQ.find("#search_sol_text").html("");
            inSolJQ.find("#sol_searchtext").val("");
            _self.tableObjIncludeSolutions.refreshTable("refresh"); //No I18N
            _self.clearRightPanel();
        }

        if(filterType == "search"){
            var solDropJQ = jQuery('#inSlDropdown');
            var search_text = jQuery("#sol_searchtext").val().trim();
            if(event.keyCode == 13){
                if(search_text){
                    var gsearch_text = search_text;
                    var search_options = "";
                    if(! solDropJQ.find( '#solnsrch_Entire_Content' ).hasClass( 'checkmark' )){

                        if(solDropJQ.find( '#solnsrch_Title' ).hasClass( 'checkmark' )){
                            search_options = search_options + "title:"  //No I18N
                        }
                        if(solDropJQ.find( '#solnsrch_Description' ).hasClass( 'checkmark' )){
                            search_options = search_options + "description:"    //No I18N
                        }
                        if(solDropJQ.find( '#solnsrch_Topic' ).hasClass( 'checkmark' )){
                            search_options = search_options + "topic:"  //No I18N
                        }
                        if(solDropJQ.find( '#solnsrch_Keywords' ).hasClass( 'checkmark' )){
                            search_options = search_options + "keywords:"   //No I18N
                        }
                    }
                    gsearch_text = search_options+search_text;
                    _self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch = gsearch_text;
                }
                else{
                    if(_self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch){
                        delete _self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch;
                    }
                    if(topicId == -1){
                        _self.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch = _self.getSearchStringForSuggestSolutions();
                    }
                }
                _self.searchText = search_text;
                _self.tableObjIncludeSolutions.refreshTable("refresh"); //No I18N
                _self.clearRightPanel();
            }
        }
    },
    searchFieldUpdate : function(){
        var _self = this;
        var searchFields = _self.searchFieldItems();
        var search_data = {};
        search_data.search_keyword =  searchFields;
        _self.searchFieldsTextUpdate(searchFields);
        addPersonalization('include_sol_search', search_data ); //NO I18N
    },
    searchFieldItems : function(){
        var searchFields = null;
        jQuery('ul#inSlDropdown li').each(function() {
        if(jQuery( this ).hasClass( 'checkmark' )){
            var searchFieldId = jQuery( this ).attr('id');
            if(searchFields != null ) {
            searchFields = searchFields + searchFieldId.substring(9)+ ":" ;
            }else{
            searchFields = searchFieldId.substring(9) + ":" ;
            }
        }
        });
        return searchFields;
    },

    getSearchFieldPersonalization : function() {
        _self = this;
        var result = getPersonalizeData('include_sol_search');  //NO I18N
        var searchFields = result.search_keyword ? result.search_keyword : "";
        _self.searchFieldPersonalization(searchFields);
    },

    searchFieldPersonalization :function(searchFieldList) {
        var fromIndex=0;
        var endIndex=searchFieldList.indexOf(':');
        var solDropJQ = jQuery('#inSlDropdown');
        jQuery( 'ul#inSlDropdown li' ).removeClass( 'checkmark' );			// No I18N
        if(endIndex == -1){
            solDropJQ.find( "#solnsrch_Entire_Content").addClass( 'checkmark' );
        }else{
            while(endIndex!=-1) {
                var fieldname=searchFieldList.substring(fromIndex,endIndex);
                solDropJQ.find( "#solnsrch_"+fieldname).addClass( 'checkmark' );
                fromIndex=endIndex+1;
                endIndex=searchFieldList.indexOf(':',fromIndex);
            }
        }
        var search_fields = _self.searchFieldItems();
        _self.searchFieldsTextUpdate(search_fields);
    },
    insertSolution : function (insertType, event){
        $SolGlobal.multipleClickAvoid(event, true);
        var _self = this;
        var htmlContent = "";
        if(insertType == "Link"){
            var solutionLink = window.location.protocol+"//"+sdp_app.ALIAS_URL+"/ui/solutions?entity_id="+_self.entity_data.id+"&mode=detail&PORTALID="+PORTALID;   // No I18N
            htmlContent = '<div id="solution_'+_self.entity_data.id+'"><a href="'+solutionLink+'" target="_blank" class="mt20 disp-ib">'+solutionLink+'</a></div><div></div>';
            _self.callbackInsertSolution(htmlContent);
        }
        else if(insertType == "Content"){
            const attachmentCount = $notification_popup.notification.uploadedAttachments.length + _self.entity_data.attachments.length;
            if(attachmentCount > 50){
                return;
            }
            var input_data = { solution_include : {} };
            if($notification_popup.config.module == "request" && $notification_popup.config.custom_type == "reply"){
                input_data.solution_include.copy_to_notification = "RequestReply_E-Mail";   //No I18N
                input_data.solution_include.moduleId = $notification_popup.module_id;
            }
            sdpAjax({
                type: "POST", //No I18N
                url: "/api/v3/solutions/"+_self.entity_data.id+"/includedata", //No I18N
                data: sdpAjaxInputData(input_data),
                success: function (resp) {
                    htmlContent = '<div id="solution_'+resp.includedata.id+'">'+resp.includedata.description+'</div><div></div>';   	// No I18N
                    if(resp.includedata.attachments.length > 0){
                        $notification_popup.populateAttachments(resp.includedata.attachments, true);
                        $notification_popup.attachComponent.unloadElements();
                        $notification_popup.initialiseNotificationAttachPreview();
                    }
                    _self.callbackInsertSolution(htmlContent);
                }
            });
        }
    },
    /* This function is used to handle solutions fields search dropdown click events */
    dropdownClickAction : function(self,event){
        if( jQuery( self ).attr('id') == 'solnsrch_Entire_Content' ){
            jQuery( 'ul#inSlDropdown li' ).removeClass( 'checkmark' );
            jQuery( self ).addClass( 'checkmark' );
        }
        else{
            if(jQuery( self ).hasClass( 'checkmark' )){
                jQuery( self ).removeClass( 'checkmark' );
            }else{
                jQuery( self ).addClass( 'checkmark' );
            }
            if( jQuery( 'ul#inSlDropdown li:first-child' ).hasClass( 'checkmark' ) ){
                jQuery( 'ul#inSlDropdown li:first-child' ).removeClass( 'checkmark' );
            }
        }
        $includeSolution.searchFieldUpdate();
        event.stopPropagation();
    },
    /* Callback function for include solutions table */
    callbackAfterBodyRender : function (){
        var searchJQ = jQuery("#rtInSol").find("#search_sol_text");
        if($includeSolution.tableObjIncludeSolutions.t_obj.table_info.list_info.gsearch && $includeSolution.searchText && $includeSolution.searchText != ''){
            if($includeSolution.tableObjIncludeSolutions.t_obj.table_info.list_info.total_count > 0){
                searchJQ.html($includeSolution.tableObjIncludeSolutions.t_obj.table_info.list_info.total_count +" "+($includeSolution.tableObjIncludeSolutions.t_obj.table_info.list_info.total_count == 1 ? translate('common.lower.result') : translate('common.lower.results')));
            }else{
                searchJQ.html("");
            }
        }
        else{
            if(searchJQ.text() != ''){
                searchJQ.html("");
            }
        }
    },
    /* Include solution details view Description and Attachments sections are displayed using Panel Component */
    loadDescriptionAndAttachmentSection: function(){
        var _self = this;
        var opt = {};
        opt.id = _self.entity_data.id;
        opt.name = "include_solution_description"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity = "solutions"; //No I18N
        opt.lookup_entity = "solution";  //No I18N
        opt.data = _self.entity_data;
        opt.showHeader = false;
        opt.canEdit = false;
        opt.expand = true;
        opt.display_name = "Description";   //No I18N
        opt.container = "include_solution_description"; // No I18N
        opt.detailsHbsTemplate = "entity_description_template"; // No I18N
        opt.editor ={showAsVideo: true};
        opt.enableShowmore = false;
        opt.attachment={
            container: "incSolDescriptionAttachment", //No I18N
            showNoattachment : true,
            titleText : translate('sdp.common.attachments')
        }
        setTimeout(function(){
            _self.$descriptionPC = new PanelComponent(opt);
        },100)
    },
    //This function is used to clear the include solution popup's right panel solution details data
    clearRightPanel : function(){
        jQuery("#inSnodata").show();
        jQuery("#sol_detail_data").html("");
        jQuery("#insertSolasLink").prop('disabled', true); //No I18N
        jQuery("#insertSolasCont").prop('disabled', true); //No I18N
        jQuery("#insertAsContentTooltip").removeAttr('title');  //No I18N
    },
    //This function is used to highlighted and Focus the included solution in the reply editor box
    highlightAndFocusIncludedSolution : function (solutionId){
        setTimeout(function () {
            jQuery('#ze_notifDescText').find('.ze_area').contents().find('.ze_body').find('#solution_'+solutionId)[0].scrollIntoView();
        }, 100);
        var addedElementJQ = jQuery('#ze_notifDescText').find('.ze_area').contents().find('.ze_body').find('#solution_'+solutionId);
        addedElementJQ.addClass('hgh-ins-sol');
        setTimeout(function () {
           addedElementJQ.removeClass('hgh-ins-sol');
           addedElementJQ.removeAttr('id');
        }, 1000);
    },

    //This function is used to update a search fields name in ui
    searchFieldsTextUpdate : function (searchFields){
        var listPageJQ = jQuery("#rtInSol");
        if(searchFields != "" && searchFields != null && searchFields != "Entire_Content:"){
            var displayString = "";
            var displayArray = searchFields.split(":");
            displayArray.pop();
            if(displayArray.length > 0){
                for(i =0;i<displayArray.length;i++){
                    if(displayArray[i] == "Title"){
                        displayString = displayString + translate('sdp.solutions.search.fields.title') + ", ";
                    }
                    else if(displayArray[i] == "Description"){
                        displayString = displayString + translate('sdp.solutions.search.fields.description') + ", ";
                    }
                    else if(displayArray[i] == "Topic"){
                        displayString = displayString + translate('sdp.solutions.search.fields.topic') + ", ";
                    }
                    else if(displayArray[i] == "Keywords"){
                        displayString = displayString + translate('sdp.solutions.search.fields.keywords') + ", ";
                    }
                }
                listPageJQ.find("#search_field").text(displayString.substring(0, displayString.length - 2));
                listPageJQ.find("#search_field").prop("title",translate("sdp.leftpanel.search.searchmodule")+" "+ displayString.substring(0, displayString.length - 2));    //No I18N
            }
        }else{
            listPageJQ.find("#search_field").text(translate('sdp.requests.common.all'));
            listPageJQ.find( "#solnsrch_Entire_Content").addClass( 'checkmark' );
            listPageJQ.find("#search_field").prop("title",translate("common.search.all"));    //No I18N
        }
    },

    /* listview height dynamic handling when window resize */
    resizeTable : function(){
        var resizeTimeoutIncSol;
        //This jQuery block Triggered when resize event is happened
       jQuery(window).off('resize.incTableResize').on('resize.incTableResize', function() {   //No I18N
           clearTimeout(resizeTimeoutIncSol);
           resizeTimeoutIncSol = setTimeout(function() {
             $includeSolution && $includeSolution.resizeTableHeightWidth();
           }, 200);
       });
    },

    /* listview height dynamic handling when window resize */
    resizeTableHeightWidth:function(){
        if(jQuery("#include_solutions_kanban_div").is(":visible")){
            var _self = this;
            setTimeout(function (){
            if(_self.tableObjIncludeSolutions){
                _self.tableObjIncludeSolutions.setTableHeight( jQuery(window).height() - 160 );
            }
            }, 250);
        }
    },

    //This function is used to get a search string for suggest solution
    getSearchStringForSuggestSolutions : function (){
        var searchString = "";
        if($includeSolution.searchString && $includeSolution.searchString != ""){
            searchString = $includeSolution.searchString;
        }
        else if($req && $req.details && $req.details.request_info && $req.details.request_info.id == $notification_popup.module_id){
            searchString = $req.details.request_info.subject;
            searchString = $req.details.request_info.category ? searchString + " " + $req.details.request_info.category.name : searchString;
            searchString = $req.details.request_info.subcategory ? searchString + " " + $req.details.request_info.subcategory.name : searchString;
            searchString = $req.details.request_info.item ? searchString + " " + $req.details.request_info.item.name : searchString;
        }else{
            sdpAjax({
                type: "GET", //No I18N
                url: "/api/v3/requests/"+$notification_popup.module_id, //No I18N
                async : false,
                success: function (resp) {
                    searchString = resp.request.subject;
                    searchString = resp.request.category ? searchString + " " + resp.request.category.name : searchString;
                    searchString = resp.request.subcategory ? searchString + " " + resp.request.subcategory.name : searchString;
                    searchString = resp.request.item ? searchString + " " + resp.request.item.name : searchString;
                }
            });
        }
        $includeSolution.searchString = searchString;
        return searchString;
    },
    //This function is used to insert the html content in notification editor box and trigger some events after the solution inserted
    callbackInsertSolution : function (htmlContent){
        var _self = this;
        notificationDescEditor.insertHTML(htmlContent);
        var solutionId = _self.entity_data.id;
        if(_self.isEditorFullScreenClosed){
            jQuery('#ze_notifDescText').find('.full-screen').trigger('click');
        }
        _self.backToSendNotificationPage();
        _self.highlightAndFocusIncludedSolution(solutionId);
    }
}


