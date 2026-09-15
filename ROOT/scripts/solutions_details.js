/* $Id$ */

$sol.details = {
    //To initialize the solution details page

    init: function(options){

        var _self = this;
        $SolObj.fromPage = "details"; // No I18N
        _self.isTech=sdp_user.USERTYPE=="Requester"?false:true; // No I18N
        /* Set the basic properties required for all methods */
        _self.setProp(options);
         var isValidUrl = _self.getInitData();
         if(isValidUrl == false){
            $SolObj.redirectTo("solution","list",null,null,"entity_not_exists");// No I18N
            return false;
         }
        _self.moduleName = _self.entity_name.capitalize(); //Initialize the module name
        _self.externalframe = options.externalframe;
        _self.permissions = _self.getPermissions();
        _self.solutionOwner = _self.checkSolutionOwner();
        $sol.settings.getData();
        _self.commentFilter = false;
        _self.commentData = null;



        //To initialize the Solution allowed tabs details here
        var allowedTabObj = allowedTabObj = { "allowedTabs" : ["feedback","keywords", "associations", "history"] }; // No I18N
        var settings_common = {
            "keywords": { // No I18N
                show: true,
                display_name: translate("sdp.solutions.newsolution.keyword"), // No I18N
                template: "solution_details_template_keywords", // No I18N
                afterRenderfunction: this.afterTabRender
            },
            "associations":{ //No I18N
                    show: true,
                    display_name: translate("common.associations"), // No I18N
                    renderfunction: $sol.associations.loadAssociations,
                    template: "solution_details_template_assoc_request", // No I18N
                    afterRenderfunction: this.afterTabRender
                },
            }

        var settings_feedback = {
            "feedback": { // No I18N
                   show: true,
                   display_name: translate("sdp.feedback.title"), // No I18N
                   renderfunction: $sol.feedback.loadComments,
                   template: "solution_details_template_comments", // No I18N
                   afterRenderfunction: this.afterTabRender,
            }
        }

        if(_self.isTech){
            settings_tech = {
                "history":{ //No I18N
                    show: true,
                    display_name: translate("common.history"), // No I18N
                    template: "solution_details_template_history", // No I18N
                    href : "/common/ViewHistory.jsp?id="+_self.id+"&module=solutions&key=solution_history_sort_order&is_new_history=true", // No I18N
                    afterRenderfunction: this.afterTabRender
                }
            }
            settings_common = jQuery.extend(settings_common,settings_tech,settings_feedback);
        }
        else{
            settings_common = jQuery.extend(settings_common,settings_feedback);
        }


        //Constructed the options for solution details component
        var opt = {
            entity_id: _self.entity_data ? _self.entity_data.id : "", // No I18N
            module_options: options,
            printPreview: false,
            module: _self.entity_name,
            moduleName: _self.moduleName,
            $sol: _self,
            externalframe:_self.externalframe,
            isRequestAccessPermission :  sdp_user.ROLES.indexOf("ViewRequests") != -1,
            isProblemAssociationAllowed : sdp_app.IS_PROBLEM_MODULE && sdp_user.ROLES.indexOf("ViewProblems") != -1,
	        showAssociationsSection : true, // added for MSP and SCP
            PORTAL_ID : PORTALID,   //SD-115741
            data: {
                entity_data: _self.entity_data,
                tabData: _self.tabData,
                metainfo: _self.metainfo,
                permissions : _self.permissions,
                globalCommentScope : $sol.settings.globalCommentScope,
                requesterScope : $sol.settings.requesterCommentScope,
                isSolutionOwner : _self.solutionOwner,
                globalRatingScope :$sol.settings.globalRatingScope,
                requesterRatingScope :$sol.settings.requesterRatingScope,
                hideForwardOptionForRequester : $sol.settings.hideForwardOptionForRequester,
                isTech :_self.isTech,
                navigation : _self.getNavigation()
            },
            afterInitialRender : _self.afterInitialRender,
            container: "solution_detailview", //No I18N
            //To initialize the panel details here
            panel_details: {
                content_panel:{
                    //To initialize the action panel
                    actions_panel: {
                        show: !_self.externalframe,
                        template_namespace:"solutions",  // No I18N
                        left_panel: {
                            show: true,
                            template: "solution_details_actions", // No I18N
                            afterRenderfunction: _self.handleHeaderActions,
                            template_namespace:"solutions"  // No I18N
                        },
                        right_panel: {
                            show: true,
                            template: "solution_action_right", // No I18N
                            "class" : "noborder", // No I18N
                            template_namespace:"solutions"  // No I18N
                        }
                    },
                    //To initialize the header panel
                    header_panel : {
                        show : true, 
                        template: "solution_details_title_description_template", //No I18N
                        "class":"headerbar mb0", //No I18N
                        renderfunction: _self.loadSolutionDetails,
                        template_namespace:"solutions"  // No I18N
                    },
                    //To initialize the details panel here
                    details_panel : {show : true},
                    //To initialize the solution tabs panel here
                    tabs_panel: {
                        show: !_self.externalframe,
                        template_namespace:"solutions",  // No I18N
                        section_type :"sub", // No I18N
                        name: "keywords", // No I18N
                        tabs: allowedTabObj.allowedTabs,
                        active: $SolObj.getActiveTab(),
                        type: "tab", // No I18N
                        "class" : "sdtabs-ui2 sdtabs-primary mt-15", // No I18N
                        afterRenderfunction: _self.gotoActiveTab,
                        settings : settings_common,
                        template_namespace:"solutions"  // No I18N
                    },
                    template_namespace:"solutions",  // No I18N
                    //To initialize the solution details right panel here
                    right_panel : {
                        show : !_self.externalframe,
                        toggle : !_self.externalframe,
                        "sections" : ["properties", "informations"], // No I18N
                        "settings" : { // No I18N
                            "properties" : { // No I18N
                                show : true,
                                "class": "form-horizontal form-section inplace-edit pos-rel top0 right0", // No I18N
                                template : "solution_right_properties", // No I18N
                                template_namespace:"solutions"  // No I18N

                            },
                            "informations" : { // No I18N
                                show : true,
                                dataCallback: function(){
                                    var ownerStr = "";
                                    var userStr = "";
                                    var owners = [];
                                    if(_self.entity_data &&  _self.entity_data.owner && _self.entity_data.owner.length > 0 ){
                                        owners =  _self.entity_data.owner;
                                        var ln = owners.length < 3 ? owners.length : 3;
                                        for(var i= 0;i< ln; i++){
                                            ownerStr = ownerStr +( ownerStr != "" ? ", ":"")+ owners[i].name;
                                        }
                                    }
                                    var userGroup = [];
                                    if(_self.entity_data && _self.entity_data.user_group_mapping && _self.entity_data.user_group_mapping.length > 0){
                                        userGroup =  _self.entity_data.user_group_mapping;
                                        var ln2 = userGroup.length < 3 ? userGroup.length : 3;
                                        for(var i= 0;i< ln2; i++){
                                            userStr = userStr +( userStr != "" ? ", ":"")+ userGroup[i].name;
                                        }
                                    }
                                    return {owner:ownerStr, owner_count: owners.length,owner_more_count: owners.length > 3 ? owners.length - 3 : owners.length,
                                        user_group: userStr, user_group_count: userGroup.length, user_group_more_count: userGroup.length > 3 ? userGroup.length - 3 : userGroup.length
                                    }
                                },
                                "class": "form-horizontal form-section inplace-edit pl0 pr0 pb10 pos-rel top0 right0", // No I18N
                                template : "solution_right_informations",   // No I18N
                                template_namespace:"solutions"  // No I18N
                            }
                        }
                    }
                }
            }
        }
        if(isMSPOrSCP){
            $mspSolutionDetails.modifyOptionsForMSP(opt,_self);
        }
        _self.$detailsComp = new DetailsComponent(opt, this);
    },

    //To set a base properties
    setProp: function(options) {
        this.options = options;
        this.id = options.id || ''; 
        this.entity_name =options.entityName;
        this.display_name = translate("sdp.header.solutions"); // No I18N
        this.base_url = "/api/v3/solutions"; // No I18N
    },

    //To get a initialize data
    getInitData: function() {
        var _self = this;
        var dataval = ""; // No I18N
        var url = _self.base_url+ "/" +_self.id;
        var isValidUrl = _self.getMetaInfo(url,_self);
        if(!isValidUrl){
            return false;
        }
        _self.metainfo.display_name = _self.display_name;
        if (_self.id) {
            if(_self.fetchEntityData()==false){
                return false
            };
        }
    },

    //To fetch the entity data here
    fetchEntityData: function() {

        var _self = this;
        var respData = {};
        var inputObject = {
            "add_recent_item": true // No I18N
        }; 
        var dataval = sdpAjaxInputData(inputObject);
        var status;
        sdpAjax({
            url: _self.base_url + "/" + _self.id, // No I18N
            data: dataval,
            success: function(resp) {
                if (resp.response_status && resp.response_status.status == "success") {
                    _self.entity_data = respData = resp[_self.entity_name];
                     //To append image token in solution details page
                    resp.solution.description = appendImageToken(resp.solution.description, resp.solution.image_token);

                }
            },
            error:function(resp){
                  status="failed";

            },
            async: false
        });
        if(status=="failed"){
            return false
        }
        /* Requester summary call not needed for requestcount, only relationcount is enough */
        var requiredFieldsArray = ["relationcount"];
        if(_self.isTech){
            requiredFieldsArray.push("requestcount");
        }
        var input_data_summary = {"list_info": {"fields_required" : requiredFieldsArray}};  // No I18N
        sdpAjax({
            url: _self.base_url + "/" + _self.id + "/_summary", // No I18N
            data : sdpAjaxInputData(input_data_summary),
            success: function(resp) {
                respData.relationCount=resp.solution_summary.relationcount;
                respData.associatedRequestsCount=resp.solution_summary.requestcount;
            },
            async: false
        });
        
        //To construct a browser title here
        jQuery("#browserTitleInfo").find("#bt_id").text(respData.id).end().find("#bt_title").text(respData.title); // No I18N
        applyBrowserTitle();
        if(isMSPOrSCP){
            $mspSolutionDetails.initMSPData(_self,respData);
        }
        return respData;
    },

    //To get a metainfo data here
    getMetaInfo : function(base_url,dataObj){
        var isValidUrl = true;
        sdpAjax({
            url: base_url+ "/_metainfo", // No I18N
            success: function(resp) {
                dataObj.metainfo = resp.metainfo;
            },
            error: function(){
                showalert("failure", translate("admin.change.configuration.invalid")+" "+translate("sdp.solution.notificationfeilds.solutionid"), "isAutoHide=false"); //No I18N
                isValidUrl = false;
            },
            async:false
        });
        return isValidUrl;
    },

    //To redirect the active tab
    gotoActiveTab : function(tabName, tabSetting, tabObject){
        var _self = this;
       var tabName = tabObject.active;
       if(!tabName){
           tabName = _self.$detailsComp.options.panel_details.content_panel.tabs_panel.active || "details"; // No I18N
       }
       setTimeout(function(){
            jQuery("#"+ _self.$detailsComp.options.container).find("[role='tablist']").find("li.active").trigger("click");
       },1);
    },

    //Solution details page actions initiated here
    detailEvents:function(){
        var _self = this;
        jQuery(document).off("click.soldetailaction").on("click.soldetailaction", ".sol-detail-actions", function(event){ //No I18N
            var action = jQuery(this).attr("data-sol-detailaction");
            var sub_action = jQuery(this).attr("data-sol-subaction");
            var topicid = jQuery(this).attr("data-topic-id");
            var isTopicDeleted = jQuery(this).attr("data-topic-deleted");
            switch(action){
                 case "operation": //No I18N
                    _self.actions().operation(sub_action);
                    break;
                case "approve": //No I18N
                    _self.actions().approveOrReject(action,event);
                    break;
                case "reject": //No I18N
                    _self.actions().approveOrReject(action,event);
                    break;
                case "expiry": //No I18N
                    _self.actions().expiry(event);
                    break;
                case "active": //No I18N
                    _self.actions().expiry(event);
                    break;
                case "forward": //No I18N
                    _self.actions().forward();
                    break;
                case "submit_approval": //No I18N
                    _self.actions().submit_approval();
                    break;
                case "delete": //No I18N
                    _self.actions().operation_delete();
                    break;
                case "show_more_owners"://No I18N
                    _self.actions().showOwnerUsers("owner"); //No I18N
                break;
                case "show_more_users"://No I18N
                    _self.actions().showOwnerUsers("users"); //No I18N
                break;
                case "cancel": //No I18N
                    _self.actions().cancel(); 
                break;
                case "enable":// No I18N
                     _self.actions().enableComments(true);
                break;
                case "disable":// No I18N
                      _self.actions().enableComments(false);
                break;
                case "resetratings":// No I18N
                        _self.actions().resetRatings();
                break;
                case  "linkSolutions" : // No I18N
                    _self.actions().openLinkSolutionPreview(_self.entity_data.id);
                break;
                case  "delinkSolutions" : // No I18N
                    _self.actions().removeSolutionsLinks(_self);
                break;
                case "reactedUsers_likes" : // No I18N
                    _self.actions().reactedUsers(_self,'like'); // No I18N
                break;
                case "reactedUsers_dislikes" : // No I18N
                    _self.actions().reactedUsers(_self,'dislike'); // No I18N
                break;
                case "showAssociatedRequests" : // No I18N
                    _self.actions().associationsCountClickAction('associatedrequests_div'); // No I18N
                break;
                case "showAssociatedProblems" : // No I18N
                    _self.actions().associationsCountClickAction('associated_problem_div'); // No I18N
                break;
                case "showLinkedSolutions" : // No I18N
                    _self.actions().associationsCountClickAction('linked_solutions_div'); // No I18N
                break;
                case "likes_tab" : // No I18N
                    _self.actions().moveReactedUsersTab(_self,true);
                break;
                case "dislikes_tab" : // No I18N
                    _self.actions().moveReactedUsersTab(_self,false);
                break;
                case "restore" : // No I18N

                    $SolObj.restore_solutions(_self.id);
                break;
                case "showCreatedBySlider" : // No I18N
                    _self.actions().openUserDetailsSlider(_self.entity_data.created_by.id);
                    break;
                case "showUpdatedBySlider" : // No I18N
                    _self.actions().openUserDetailsSlider(_self.entity_data.last_updated_by.id);
                    break;
            }
        });
        /** Sort handling for list owner/user popup */
        jQuery(document).off("click.solactionsort").on("click.solactionsort", "#owner_user_sort", function(){ //No I18N
            var sort = jQuery(this).attr("data-sort");
            if(sort == "desc"){
                jQuery(this).attr("data-sort","asc").addClass('desc1').removeClass('asc').uitooltip({'content':translate('sdp.common.sort.ascending')}); //No I18N
            }else{
                jQuery(this).attr("data-sort","desc").addClass('asc').removeClass('desc1').uitooltip({'content':translate('sdp.common.sort.descending')}); //No I18N
            }
            var list = jQuery("#owner_user_list li"); //No I18N
            list.sort(function(a, b){
                var aText = jQuery(a).find('span').text();
                var bText = jQuery(b).find('span').text();
                if(sort == 'asc'){
                    return aText.localeCompare(bText);
                }else{
                    return bText.localeCompare(aText);
                }
            });
            jQuery("#owner_user_list").append(list);
        })
        if(isMSPOrSCP){
            $mspSolutionDetails.addMSPEvents(_self)
        }
    },

    //Solution details page actions
    actions:function(){
        var self = this;
        var act = {
            operation: function(operation){
                var opDetails = {
                    approve: {
                        title: translate("sdp.solution.approvals.approvecomments"),//No I18N
                        _i18n:translate("approval.approve") // No I18N
                    },
                    reject: {
                        title: translate("sdp.solution.approvals.rejectcomments"),//No I18N
                        _i18n:translate("common.reject") // No I18N
                    },
                    expiry: {
                        title: translate("sdp.solution.settings.mark.expired"), //No I18N
                        _i18n:translate("sdp.common.expire") // No I18N
                    },
                    active: {
                        title: translate("sdp.group.listview.markasactive"), //No I18N
                        _i18n:translate("sdp.contract.listViewI.active") // No I18N
                    }
                }
                // var _i18n = operation === 'approve' ? getMessageForKey("approval.approve") : getMessageForKey("common.reject"); //No I18N
                if(operation != "delete"){
                    var contextObj = {
                        operation_i18n: opDetails[operation]._i18n,
                        operation: operation,
                    }
                    var title = opDetails[operation].title;
                    var compiledHtml = renderhbs(null,"operation_dialog_details_page",contextObj,false,"solutions",null,"solutions",null,true);    //NO I18N
                    jQuery('#solution_details_action_popup').dialog({
                        title:title,
                        autoOpen : false,
                        modal : true,
                        position: { my: "center center", at: "center center", of: window }, //NO I18N
                        open: function(event, ui){
                            $sdEventListener(jQuery("#solution_details_action_popup"));
                        },
                        close: function(event,ui){
                            jQuery('#copy_operation_dialog_details_page').remove();
                            jQuery('#solution_details_action_popup').dialog("destroy"); // No I18N
                        },
                        width: 400,
                    }).html(compiledHtml).dialog("open"); // No I18N
                }
                else{
                    self.actions().operation_delete();
                }
            },
            //To approve or Reject a Solution
            approveOrReject: function(action,event){
                $SolObj.multipleClickAvoid(event,true);
                var _self = this;
                var url = "/api/v3/solutions/"+self.id+"/_"+action; //No I18N
                var comment = jQuery("#operation_comment").val().trim();
                var data = {
                    "solution":{ //No I18N
                        "operation_comment": comment //No I18N
                    }
                }
                sdpAjax({
                    url: url,
                    type: "PUT", //No I18N
                    data: sdpAjaxInputData(data),
                    success: function(){
                        var msg = action == "approve" ? translate('common.approved',[translate('sdp.header.newsolution')]) : translate('common.rejected',[translate('sdp.header.newsolution')]); //No I18N
                        showalert('success', msg, "isAutoHide=true"); // No I18N
                        jQuery('#solution_details_action_popup').dialog('close');   // No I18N
                        self.reInitDetailComponent()
                    }
                })
            },

            //To Expiry a solution
            expiry: function(event){
                $SolObj.multipleClickAvoid(event,true);
                var _self = this;
                var status = self.entity_data.approval_status && self.entity_data.approval_status.name;
                if(status){
                    var action = status == "Expired" ? "active" : "expire"; //No I18N
                    var comment = jQuery("#operation_comment").val().trim();
                    if(action == "expire"){
                        if(comment == ''){
                            if(event && event.target) {
                                submitBtn = event.target;
                                submitBtn.disabled = false;
                            }
                            jQuery('#operation_comment').trigger('focus');
                            return;
                        }
                    }
                    var url = "/api/v3/solutions/" + self.id + "/_"+action; //No I18N
                    var data = {
                        "solution":{ //No I18N
                            "operation_comment":comment //No I18N
                        }
                    }
                    sdpAjax({
                        url: url,
                        type: "PUT", //No I18N
                        data: sdpAjaxInputData(data),
                        success: function(){
                            var msg = status != "Expired" ? translate("sdp.solution.markas.expired") : translate("sdp.solution.markas.active"); //No I18N
                            showalert('success', msg, "isAutoHide=true"); // No I18N
                            jQuery('#solution_details_action_popup').dialog('close');   // No I18N
                            self.reInitDetailComponent()
                        }
                    })
                }
            },

            //To delete a solution
            operation_delete: function(){
                showconfirm(true,'title='+translate('sdp.solution.delete.popup.title')+', message='+translate("solution.delete.content")+', submitbutton='+translate("common.delete")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){    //No I18N
                    if(confirm){
                    if($sol.details.entity_data.deleted_time == null){
                        var url = "/api/v3/solutions/" + self.id + "/_move_to_trash"; //No I18N
                        var msg='api.trashed.success';// No I18N
                    }
                    else{
                         var url = "/api/v3/solutions/" + self.id; //No I18N
                         var msg='api.deleted.success';// No I18N
                    }

                        sdpAjax({
                            url: url,
                            type: "DELETE", //No I18N
                            success: function(resp){
                                showalert('success', translate(msg,[translate('sdp.header.newsolution')]), "isAutoHide=true"); // No I18N
                                $SolObj.redirectTo("solution","list",null,null,"entity_not_exists"); //No I18N
                            }
                        })
                    }
                },true);
            },

            //To forward a solution
            forward: function(){
                user_fetch = isSCP ? $mspSolutionList.getSCPUserFetchForForward() : {};
                $notification_popup.openNotificationForm({
                    template_type: "SOLFORWARD",   //No I18N
                    type: "SOLFORWARD",   //No I18N
                    module: self.entity_name, 
                    module_id: self.id, 
                    afterNotificationSent: function(){},
                    imgParameters: {module: self.entity_name +"_notification", withURL: false, noForm: true},  //No I18N
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

            //to submit for approval a solution
            submit_approval: function(){

                var user_fetch = {};
                user_fetch.url = self.base_url+ "/" +self.id + '/approver';    //No I18N
                user_fetch.lookup_field = 'approver';   //No I18N
                user_fetch.search_keys = ['name','email_id'];   //No I18N
                $notification_popup.openNotificationForm({
                    template_type: "Notify_ApproveSolution",   //No I18N
                    type: "Notify_ApproveSolution",   //No I18N
                    module: self.entity_name,
                    module_id: self.id,
                    has_cc:false,
                    afterNotificationSent: function(){
                        self.reInitDetailComponent();
                    },
                    user_fetch: user_fetch,
                    is_tagging: false,
                    imgParameters: {module: self.entity_name +"_notification", withURL: false, noForm: true},  //No I18N
                    popup_title:translate('sdp.purchase.addNew.view.submit'),    //No I18N
                    descriptionText : translate("common.message")   //No I18N
                });
            },

            //To fetch the solution owner data's
            showOwnerUsers: function(type){
                var data = type == 'owner' ? self.entity_data.owner : self.entity_data.user_group_mapping; //No I18N
                if(isMSPOrSCP){
                    data = $mspSolutionDetails.getDataForDialog(data,type,self);
                }
                var tempInfo = {type: type,data: data};
                var compiledHtml =  renderhbs(null,"owner_user_dialog",tempInfo,false,"solutions",null,"solutions",null,true);     //NO I18N
                var title = type == "owner" ?  translate("sdp.solution.owner") : translate("sdp.admin.usergroup"); //No I18N
                if(isMSPOrSCP){
                    title = $mspSolutionDetails.getTitleForDialog(title,type);
                }
                jQuery('#show_owners_users').dialog({
                    title:title,
                    autoOpen : false,
                    modal : true,
                    position: { my: "center center", at: "center center", of: window }, //NO I18N
                    open: function(event, ui){
                        jQuery('#owner_user_search').menuSearch({parent:'#owner_user'});    //NO I18N
                        initTooltip('#owner_user'); //No I18N
                        $sdEventListener(jQuery("#show_owners_users"));
                    },
                    close: function(event,ui){
                        jQuery('#owner_user').remove();
                        jQuery('#show_owners_users').dialog("destroy"); // No I18N
                    },
                    width: 400,
                }).html(compiledHtml).dialog("open"); // No I18N
            },
            enableComments: function(value){
                var _self = this;
                var url = "/api/v3/solutions/"+self.id+"/_enablecomment"; //No I18N

                var data = {
                    "solution":{ //No I18N
                        "comment_isenabled":ZSEC.Encoder.encodeForHTML(value) //No I18N
                    }
                }
                sdpAjax({
                    url: url,
                    type: "PUT", //No I18N
                    data: sdpAjaxInputData(data),
                    success: function(){
                         var displayValue = value ? translate("common.enabled") : translate("common.disabled");
                         showalert('success', translate("sdp.solution.comments")+" "+displayValue, "isAutoHide=true"); // No I18N
                        self.reInitDetailComponent()
                    }
                })
            },
            resetRatings:function(){
               showconfirm(true,'title='+translate("solution.reset.ratings")+', message='+translate("solution.reset.ratings.msg")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){    //No I18N
                    if(confirm){
                        var url = "/api/v3/solutions/" + self.id+"/_resetratings"; //No I18N
                        sdpAjax({
                            url: url,
                            type: "PUT", //No I18N
                            success: function(resp){
                                showalert('success', translate("solution.reset.ratings")+" "+translate("sdp.common.successfully"), "isAutoHide=true"); // No I18N
                                self.reInitDetailComponent()
                            }
                        })
                    }
                });
            },
            //To open a link solution preview list view here
            openLinkSolutionPreview : function(solId){
                $previewComponent.load('/ui/solutions?mode=list&isPreview=true&externalframe=true',translate('solution.link.solutions'),'75%',null,null,'sol_association');  // No I18N
            },
            //This method is used to remove the solutions link
            removeSolutionsLinks : function(_self){
                var selected_ids = $sol.associations.tableObjAssociatedSolution.bulkSelect.getSelectedIDs();
                if(!selected_ids || selected_ids.length===0){
                    showalert('info', translate("sdp.solution.listview.selectmessage"), "isAutoHide=true"); // No I18N
                }
                else{
                    showconfirm(true,'title='+translate('common.confirm')+', message='+translate("solution.removelink.popup.content")+', submitbutton='+translate("common.yes")+', cancelbutton='+translate("common.no")+'',function(confirm){    //No I18N
                        if(confirm){
                            var url = "/api/v3/solutions/"+_self.entity_data.id+"/solution_relations?ids=" + selected_ids.join(","); //No I18N
                            sdpAjax({
                                url: url,
                                type: "DELETE", //No I18N
                                success: function(resp){
                                    showalert('success', translate("solution.removelink.success.message"), "isAutoHide=true"); // No I18N
                                    $sol.associations.tableObjAssociatedSolution.refreshTable("refresh"); //No I18N
                                    $sol.associations.updateLinkedSolutionsCount(_self.entity_data.id);
                                }
                            });
                        }
                    });
                }
            },
            //To get a Reacted Users
            reactedUsers : function(_self,operationName){
                if(sdp_user.USERTYPE == "Requester"){
                    return;
                }
                var contextObj = {};
                var likesCount=$sol.feedback.getRatingCount("likes");// No I18N
                var dislikeCount=$sol.feedback.getRatingCount("dislikes");// No I18N
                contextObj.likes =likesCount;
                contextObj.dislikes = dislikeCount;
                var userHtml = renderhbs(null,"reacted-users-template",contextObj,false,"solutions",null,null,null,true);    //No I18N
                jQuery('#reacted_users_popup').dialog({
                    title:translate("solution.reactedUser.popup.title"),    //NO I18N
                    autoOpen : false,
                    modal : true,
                    resizable: false,
                    position: { my: "center center", at: "center center", of: window }, //NO I18N
                    open: function(event, ui){
                        var reactedUserJQ = jQuery('#userreaction');
                        if(operationName == "like"){
                            $sol.feedback.reactedUsersPopupUIActions("like",reactedUserJQ); //NO I18N
                            $sol.feedback.reactedUsersConstruction(_self.id,true);
                        }
                        else{
                            $sol.feedback.reactedUsersPopupUIActions("unlike",reactedUserJQ);   //NO I18N
                            $sol.feedback.reactedUsersConstruction(_self.id,false);
                        }
                    },
                    close: function(event,ui){
                        jQuery('#userreaction').remove();
                        jQuery('#reacted_users_popup').dialog("destroy"); // No I18N
                        if($sol.feedback.tableObjReactedUsersLike){
                            delete $sol.feedback.tableObjReactedUsersLike;
                        }
                        if($sol.feedback.tableObjReactedUsersDislike){
                            delete $sol.feedback.tableObjReactedUsersDislike;
                        }
                    },
                    width: 400,
                    height : 490,
                }).html(userHtml).dialog("open"); // No I18N
            },
            //Association right panel buttons click actions
            associationsCountClickAction : function(div_id){
                jQuery("[data-detail-tab=associations]").trigger('click');
                 jQuery("html, body").animate({
                    scrollTop: jQuery('#'+div_id).offset().top - 100,
                 }, "slow");//NO I18N
            },
            //Load a reacted users table when tab switching actions
            moveReactedUsersTab : function(_self,isLiked){
               if(isLiked){
                   if(!($sol.feedback.tableObjReactedUsersLike)){
                       $sol.feedback.reactedUsersConstruction(_self.entity_data.id,isLiked);
                   }
               }
               else{
                   if(!($sol.feedback.tableObjReactedUsersDislike)){
                       $sol.feedback.reactedUsersConstruction(_self.entity_data.id,isLiked);
                   }
               }
            },
            //To open the User Details via preview component
            openUserDetailsSlider : function(userId){
                $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userId+'&minContent=true&externalframe=true',translate('sdp.inventory.wsRtPanel.userDetails'),'600px');  //No I18N
            }
        }
        return act;
    },

    //To re initialize the details component
    reInitDetailComponent: function(){
        var _self = this;
        _self.init(_self.options)
    },

    //To load the solution details
    loadSolutionDetails: function(){
        var _self = this;
        _self.loadDescriptionSection()
        _self.loadEntityFields();
        _self.detailEvents();
    },
    /**
    * Loads description section in the solution details page
    */
    loadDescriptionSection: function(){
        var _self = this;
        //Description and attachments section displayed using Panel comp
        var opt = {};
        opt.id = _self.id;
        opt.name = _self.entity_name+"_description"; //No I18N
        opt.base_url = "/api/v3"; //No I18N
        opt.entity = _self.entity_name+ "s"; //No I18N
        opt.lookup_entity = _self.entity_name;
        opt.data = _self.entity_data;
        opt.metainfo = _self.metainfo;
        opt.showHeader = false;
        if(!_self.externalframe){
            opt.canEdit = (_self.permissions.edit && !($sol.details.entity_data.deleted_time || $sol.details.entity_data.approval_status.name == 'Expired')) ? true : false;
        }
        opt.expand = true;
        opt.display_name = _self.metainfo.fields.description.display_name;
        opt.container = _self.entity_name+"Description"; // No I18N
       opt.detailsHbsTemplate = {"template" : "entity_description_template","callBack" : _self.callBackAfterPanelComponentRender()};   //No I18N
        opt.editor ={insertVideo: true, showAsVideo: true};
        opt.enableShowmore = false; //109846 -- Panel component show more option hide
        opt.panel = {
            pre_edit: function(){
                _self.entityFields.initFC();
            }
        };
        opt.save = {
            postsuccess : function(data){
                _self.reInitDetailComponent()
                _self.entity_data = data;
            }
        };
        opt.attachment={
                        rerender: function(data){
                            _self.updateApprovalStatus();
                            _self.reInitDetailComponent();
                            _self.entity_data.attachments = data;
                        },
                        container: _self.entity_name+"Description_attachment" //No I18N
                    }


        setTimeout(function(){
            _self.$descriptionPC = new PanelComponent(opt);
            $sol.details.initPriviewAndDownloadAttachments();
        },100)
    },

    //This function is used to remove the extra space in solutions details preview
    callBackAfterPanelComponentRender : function(){
        if($sol.details.externalframe){
            jQuery("#solution_detailview").find("#content-panel").css('min-height','calc(100vh - 20px)');   //No I18N
        }
    },

    //To change the approval status to unApproved on adding or removing the attachments from solutions details page.
    updateApprovalStatus: function(){
       var _self = this;
       var url = "/api/v3/solutions/"+_self.id; //No I18N
       var data = {
           "solution":{ //No I18N
               "approval_status": {//No I18N
                   "name": "UnApproved" // No I18N
               }
           }
       }
       sdpAjax({
           url: url,
           type: "PUT", //No I18N
           data: sdpAjaxInputData(data),
           async:false
       })
    },

    //To load a entity fields
    loadEntityFields: function(){
        var _self = this;
        _self.entityFields = {  };
        var entityFields = _self.entityFields;
        entityFields.initFC = function(mode) {
             /* Destroy the old instances */
             _self.$entityFields_FC && _self.$entityFields_FC.destroy();
             var templateSol = $sol.constructTemplateInfo();
             //Remove color customization and label placement applied in template
            var configJSON = {
                template: templateSol,
                metadata: jQuery.extend(true, {}, _self.metainfo),
                entitydata: jQuery.extend(true,{},_self.entity_data),
                mode: _self.id ? "edit" : "new",// No I18N
                container: "sol-container",// No I18N
                afterRenderCallback: "$sol.form.afterrenderpage", //No I18N
                edit: {
                    fields: {
                        description:{
                            images_api:true,
                            images_url: "/api/v3/"+self.base_url+"/images"//NO I18N
                        },
                        status:{
                            allowClear: false
                        },
                        topic: {
                            processRemoteData: function(data){
                                var _topics = [];
                                for (var i = 0; i < data.topics.length; i++) {
                                    var tp = data.topics[i];
                                    var tpObj = {
                                        id: tp.id,
                                        text: tp.name,
                                        parent_id: tp.parent != null ? tp.parent.id : 0,
                                        isdeleted : tp.isdeleted
                                    };
                                    _topics.push(tpObj);
                                }
                               var topics = $sol.constructListToTree(_topics);
                               var _self = this;
                               return data.topics = _topics;
                            },
                            processResults: function(search_data, data){
                                if(data){
                                    search_data.push(data);
                                }
                            }
                        }
                    },
                    defaults: {
                        lookup:{
                             placeholder:translate('sdp.change.sla.select')
                        }
                    },
                    onchange:{
                        status: "$sol.form.onChangeStatus"    //NO I18N
                    }
                },
                save: {
                    url: self.editId ? "/api/v3/"+self.entityNamePl+"/"+self.editId+"" : "/api/v3/"+self.entityNamePl,//NO I18N
                    entity: self.entityName,
                    submit: true,
                    forcesave: false,
                    onsave: "$sol.form.modifySaveData",//NO I18N
                    serializer: "$sol.form.executeWhileSave",//NO I18N
                    submitbutton: {
                        add: window.translate("sdp.common.save"), //No I18N
                    },
                    postsuccess: function(data){
                        _self.entityFields.initFC("view");   // No I18N
                    }
                },
            }
            _self.$entityFields_FC = _self.initFormComponent(configJSON);
        }
        entityFields.cancelForm = function(){
            _self.entityFields.initFC('view');   // No I18N
        };
        applyBrowserTitle();
    },

    //To initialize a form component
    initFormComponent: function(configJSON) {
        var _self = this;
        var config = {
            name: _self.entity_name,
            entity: _self.entity_name,
            entityName: _self.display_name, //I18Ned value
            entitypath: _self.entity_name,
            entitydata: jQuery.extend(true, {}, _self.entity_data),
            metadata: jQuery.extend(true, {}, _self.metainfo),
            mode: "view", // No I18N
            formid: _self.entity_name,
            
        };

        jQuery.extend(true, config, configJSON);
        return new FC(config);
    },

    //To handle a header actions here
    handleHeaderActions: function(){
        var _self = this;
        var status = _self.entity_data.approval_status && _self.entity_data.approval_status.name;
        var comments = _self.entity_data.comment_isenabled
        if(status){
            if(status == "Approved"){ //No I18N
                jQuery('[data-sol-subaction="reject"]').show();
                jQuery('[data-expiry="expired"]').show();
            }else if(status == "Rejected"){ //No I18N
                jQuery('[data-sol-subaction="approve"]').show();
                jQuery('[data-expiry="expired"]').show();
            }else if(status == "Expired"){ //No I18N
                jQuery('[data-expiry="active"]').show();
                jQuery('[data-sol-subaction="approve"]').hide();
                jQuery('[data-sol-subaction="reject"]').hide();
            }else{
                jQuery('[data-expiry="expired"]').show();
                jQuery('[data-sol-subaction="approve"]').show();
                jQuery('[data-sol-subaction="reject"]').show();
            }
        }        

    if($sol.settings.globalCommentScope == "true")
    {
        if(comments==true)
        {
             jQuery('[data-sol-subaction="disable"]').show();
             jQuery('[data-sol-subaction="enable"]').hide();
        }
        else
        {
             jQuery('[data-sol-subaction="enable"]').show();
             jQuery('[data-sol-subaction="disable"]').hide();
        }
    }

    if($sol.settings.globalRatingScope == "false")
    {
         jQuery('[data-sol-subaction="resetratings"]').hide();
    }



    },

    /** details view  permissions */
    getPermissions: function(){
        var _self =  this;
        var links;
        sdpAjax({
            url: _self.base_url+'/'+_self.id+'/_links', // No I18N
            success: function(resp) {
               links  = resp._links.links;
            },
            async:false
        });
        var checkLinks = [links.length];
        for(i = 0;i<links.length;i++){
            checkLinks[i] = links[i].name;
        }
        var permissions = {};
        var roles = sdp_user.ROLES;
        permissions = {
            view: roles.indexOf("ViewSolutions") > -1, //No I18N
            add: roles.indexOf("CreateSolutions") > -1, //No I18N
            edit: roles.indexOf("ModifySolutions") > -1, //No I18N
            "delete": roles.indexOf("DeleteSolutions") > -1, //No I18N
            approve : checkLinks.indexOf("approve") > -1, //No I18N
            reject : checkLinks.indexOf("reject") > -1 , //No I18N
            enablecomments :checkLinks.indexOf("enablecomment") > -1 , //No I18N
        }
        return permissions;
    },


    /** to check whether the logged in user is solution owner */
        checkSolutionOwner: function(){
            var _self =  this;
            var links;

            var owners = [];
            var ownerIds = [];
            var logged_in_user = sdp_user.LOGGEDIN_USERID.toString();
            if(_self.entity_data &&  _self.entity_data.owner && _self.entity_data.owner.length > 0 ){

            owners =  _self.entity_data.owner;
            var ln = owners.length ;

            for(var i= 0;i< ln; i++){
                ownerIds.push(owners[i].id) ;
            }

            }

            var permissions = {};
            var roles = sdp_user.ROLES;
            permissions = {
                isowner: ownerIds.indexOf(logged_in_user) > -1,
                sdadmin: roles.indexOf("SDAdmin") > -1, //No I18N
            }

        return permissions;
    },
    //To initialize the Attachment part here
    initPriviewAndDownloadAttachments: function() {
        /** Solution Attachments (Rightside popUp) */
        this.attachRPPreview = new attachPreview("#attachmentDropdown",{ // No I18N
            "entity_id": $sol.details.entity_data.id, // No I18N
            "entity" : "solutions", // No I18N
            "api" : false, // NO I18N
            "layouts":false, //NO I18N
            popover:{
                enable:true,
                target:'#attachmentDropdownTarget' //NO I18N
            }
        });
    },

    afterTabRender : function(tabName, b, panelObj){
        $SolObj.pushingStateURL(panelObj.name, "detail", this.id, tabName, "null", "detail","");    //NO I18N
    },

    //To view a solution details page using preview component
    openSolutionDetailsPreview : function(solId){
        $previewComponent.load('/ui/solutions?entity_id='+solId+'&mode=detail&externalframe=true',"Solution Details",'75%',null,null,'sol_details_preview');  // No I18N
    },

    //This function is used to construct a navigation info
    getNavigation : function (){
        var _self = this
        var navigation = {};
        navigation.isAllowed = false;
        if(window.hasOwnProperty("$SolObj") && window.$SolObj.loadedRecords){
            var index = -1;
            //Find the next and prev solution id with the loaded data in listview
            index = window.$SolObj.loadedRecords.indexOf(_self.entity_data.id);
            if(index != -1){
                var nextIndex = index+1;
                var prevIndex = index-1;
                (nextIndex != window.$SolObj.loadedRecords.length) && (navigation.nextId = window.$SolObj.loadedRecords[nextIndex]);
                (prevIndex != -1) && (navigation.prevId = window.$SolObj.loadedRecords[prevIndex]);
                navigation.nextHref = navigation.nextId  ? "/ui/solutions?entity_id="+navigation.nextId+"&mode=detail&PORTALID="+PORTALID : "";    //NO I18N
                navigation.preHref = navigation.prevId ? "/ui/solutions?entity_id="+navigation.prevId+"&mode=detail&PORTALID="+PORTALID : "";      //NO I18N
            }
            //If the details page is refreshed or solution is newly added, not need show navigation
            if($SolObj.loadedRecords.length > 1 && index != -1){
                navigation.isAllowed = true;
            }
        }
        return navigation;
    }
}
