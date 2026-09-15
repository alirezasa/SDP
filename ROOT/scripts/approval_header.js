/* $Id$ */
var headerApprovals = {
    active_approval_id: null,
    is_action_taken: false,
    approval_comment_config:null,
    /**
    * To render pending approvals in the home page -> left slider
    * @param associated_entity -- Module/Entity which contains the approval
    * @param entity_id -- Associated Entity id
    * @param level_id -- Approval level id
    * @param approval_id -- Approval id
    * @param stage_id -- Approval Stage id (only to be passed for Change)
    * @param portal_id -- Portal id of the approval
    */
    processApprovals: function (from_header, associated_entity, entity_id, level_id, approval_id, stage_id, portal_id, approval_response) {
        headerApprovals.slider_filter_name = headerApprovals.getFilterNameForModule(associated_entity);
        headerApprovals.from_header = from_header; // This is a boolean value to indicate the slider is opened from the header icon
        headerApprovals.app_response_for_slider = approval_response; // This is the approval response that we pass as parameter here from the show all approvals list view and home page approvals widget, such that the sort order and paginationation functionalitites are maintained here as well
        jQuery("body").append('<div id="ApprovalContentFirstSlideContainer"></div>');
        jQuery("#ApprovalContentFirstSlide").show().css('visibility', 'visible').panelSlider({ // NO I18N
            width: 420,
            appendTo: "#ApprovalContentFirstSlideContainer", //NO I18N
            header: false,
            placement: (sdp_user.DIRECTION === "RTL") ? (headerApprovals.from_header ? "left" : "right") : (headerApprovals.from_header ? "right" : "left"), // NO I18N
            //dialogClass: "tabui-rightpanel", // NO I18N
            open: function () {
                if(!headerApprovals.from_header){
                    //If slider not opened from header, we will construct the pending approvals slider with the approval response from parameter.
                    headerApprovals.constructApprovalsForSlider(headerApprovals.app_response_for_slider, headerApprovals.from_header, headerApprovals.slider_filter_name);
                } else {
                    //If slider opened from header, we will call approvals api for first 100 pending approvals
                    var approval_input_data = {
                        "list_info": { //NO I18N
                            "filter_by": { //NO I18N
                                "name": "my_pending_approvals", //NO I18N
                            },
                            "get_total_count": true, //NO I18N
                            "row_count":"100", //NO I18N
                            "sort_field":"sent_on",//NO I18N
                            "sort_order":"desc",//NO I18N
                            "fields_required": ["approval_level.request.is_service_request", "approval_level.request.created_time", "approval_level.purchase_request.created_date", "approval_level.purchase_order.created_date", "approval_level.release.created_time", "approval_level.change.created_time"] //NO I18N
                        }
                    };
                    var approval_input_items = sdpAjaxInputData(approval_input_data);
                    sdpAjax({
                        url: "/api/v3/approvals", //NO I18N
                        data: approval_input_items,
                        type: 'GET', //No I18N
                        async: false,
                        success: function (response) {
                            headerApprovals.constructApprovalsForSlider(response, headerApprovals.from_header, headerApprovals.slider_filter_name);
                        }
                    });
                }
                setTimeout(function () {
                    jQuery("#ApprovalContentFirstSlide .panel-search [type='text']").val("").trigger('focus');
                    if(!headerApprovals.from_header){ //when accessed from Pending approvals Header icon, no need to sroll to any particular approval
                        if (window.location.pathname === "/ui/home") {
                            document.getElementById("card-view_"+ approval_id).scrollIntoView({ behavior:"smooth",block:"nearest" });//NO I18N
                        }
                        if (associated_entity) {
                            jQuery("#" + associated_entity + "_apprId_" + approval_id).trigger("click");
                        }
                    }
                }, 300);
                jQuery('#approval_slider_close').on('click', function (event) {
                    $previewComponent.closePreview('module_preview_' + approval_id); //NO I18N
                    $header.closeSlider(this);
                	jQuery('body').removeClass("subheader-of-h");
                    setTimeout(function () { $extFrame.setOptions(); }, 500);
                });
            },
            close: function () {
                var approval_input_data = {
                    "list_info": { //NO I18N
                        "filter_by": { //NO I18N
                            "name": "my_pending_approvals", //NO I18N
                        },
                        "get_total_count": true, //NO I18N
                        "row_count":"100", //NO I18N
                        "fields_required": ["approval_level.request.is_service_request", "approval_level.request.created_time", "approval_level.purchase_request.created_date", "approval_level.purchase_order.created_date", "approval_level.release.created_time", "approval_level.change.created_time"] //NO I18N
                    }
                };
                var approval_input_items = sdpAjaxInputData(approval_input_data);
                sdpAjax({
                    url: "/api/v3/approvals/_total_count", //NO I18N
                    data: approval_input_items,
                    type: 'GET', //No I18N
                    async: false,
                    success: function (response) {
                        sdp_user.pending_approvals_count = response._total_count.approvals;
                    }
                });
                showPendingApprovalsCount(sdp_user.pending_approvals_count);

                $previewComponent.closePreview('module_preview_' + approval_id); //NO I18N
                jQuery("#ApprovalContentFirstSlide").dialog('destroy').find("#header_approvals").html("");
                //SD-112918 - HomePage approvals should be refreshed only once on closing approval slider.
                headerApprovals.handleApprovalDialogClose();
            }
        });
    },
    //This method is used to construc the pending approvals slider with the approval response passed!
    constructApprovalsForSlider: function (response, from_header, slider_filter_name){
        var pendingApprovals = {
            approvals: [{
                list: [],
            }, {
                list: [],
            }, {
                list: [],
            }, {
                list: []
            }]
        };
        var entityArr = ["request", "change", "release", "purchase"]; //NO I18N
        var entityNameArr = ["sdp.header.requests", "sdp.header.changes", "admin.module.releases", "sdp.header.purchase"]; //NO I18N

        //If the slider is not opened from header, we will have passed the approval response through the parameter of the methods.
        if (!from_header || response.response_status[0].status == "success") {
            if (!response.hasOwnProperty('approvals') || response.approvals.length == 0) {
                var json = { slider_header_name : slider_filter_name };
                renderhbs('#header_approvals', 'approval-list-content', json, false, 'common'); // NO I18N
                jQuery("#panel_search").on('keyup', function(){ headerApprovals.approvalsPanelSearch(this) });
                jQuery("#ApprovalContentFirstSlide ").find(".panel-search").hide();
                return;
            }
            if (response.approvals.length > 0) {

                Handlebars.registerHelper('approvalIcon', function (associated_entity, approval) { //NO I18N
                    associated_entity = (approval.is_service_request === true) ? "service" : associated_entity; //NO I18N
                    associated_entity = (associated_entity === 'change' && approval.emergency === true)?'change-emer':associated_entity;//NO I18N
                    var entity = {
                        'purchase_request': 'hspr ri-pureq icon-md', //NO I18N
                        'purchase_order': 'hspr ri-puror icon-md', //NO I18N
                        'change': 'hspr ri-change icon-md vsub', //NO I18N
                        'change-emer': 'hspr ri-change-emer icon-md vsub', //NO I18N
                        'request': 'req-sprite incident-req-icon', //NO I18N
                        'service': 'req-sprite service-req-icon', //NO I18N
                        'release': 'hspr ri-release icon-md' //NO I18N
                    };
                    return entity[associated_entity] ? entity[associated_entity] : associated_entity;
                });

                jQuery("#ApprovalContentFirstSlide ").find(".panel-search").show();
                var all_portal_comments = headerApprovals.getApprovalCommentConfig();
                var approval_comment_config = {"request":{},"purchase_request":{},"purchase_order":{}}; //NO I18N

                for (i = 0; i < response.approvals.length; i++) {
                    var approvalDetails = {};
                    approvalDetails.associated_entity = response.approvals[i].associated_entity;
                    var associated_entity = approvalDetails.associated_entity;
                    approvalDetails.approval_id = response.approvals[i].id;
                    approvalDetails.sent_on = response.approvals[i].sent_on;
                    var approval_level = response.approvals[i].approval_level;
                    approvalDetails.level = {};
                    approvalDetails.level.id = approval_level.id;
                    approvalDetails.level.name = approval_level.name;
                    approvalDetails.level.stage_id = "0";
                    approvalDetails.portal_id = response.approvals[i].portal_id;

                    var entity_data = response.approvals[i].approval_level[associated_entity];
                    approvalDetails.entity_id = entity_data.id;
                    var current_portal_comments = all_portal_comments[approvalDetails.portal_id];
                    switch (associated_entity) {
                        case "request": //NO I18N
                            approvalDetails.i18nkey = "sdp.requests.common.requestid"; //NO I18N
                            approvalDetails.requesterName = entity_data.requester.name;
                            approvalDetails.is_service_request = entity_data.is_service_request;
                            approvalDetails.subject = entity_data.subject;
                            approvalDetails.created_time = entity_data.created_time;
                            var mandateComment = {};
                              mandateComment.mandateAcceptComment = current_portal_comments.MandateApprovalComments === 'true' ? (current_portal_comments.ActionNameForMandateComments === 'all') : false;  //NO I18N
                              mandateComment.mandateRejectComment = current_portal_comments.MandateApprovalComments === 'true';
                            approval_comment_config[associated_entity][approvalDetails.approval_id]=mandateComment;
                            approvalDetails = jQuery.extend(true,approvalDetails,mandateComment);
                            pendingApprovals.approvals[0].list.push(approvalDetails);
                            break;
                        case "change": //NO I18N
                            approvalDetails.i18nkey = "sdp.change.changeId"; //NO I18N
                            if (entity_data.change_requester !== null) {
                                approvalDetails.requesterName = entity_data.change_requester.name;
                            }
                            approvalDetails.subject = entity_data.title;
                            approvalDetails.emergency = entity_data.emergency;
                            approvalDetails.level.stage_id = approval_level.change_stage.id;
                            approvalDetails.created_time = entity_data.created_time;
                            approvalDetails.mandateAcceptComment = true;
                            approvalDetails.mandateRejectComment = true;
                            pendingApprovals.approvals[1].list.push(approvalDetails);
                            break;
                        case "release": //NO I18N
                            approvalDetails.i18nkey = "common.release.id"; //NO I18N
                            if (entity_data.release_requester !== null) {
                                approvalDetails.requesterName = entity_data.release_requester.name;
                            }
                            approvalDetails.subject = entity_data.title;
                            approvalDetails.created_time = entity_data.created_time;
                            approvalDetails.mandateAcceptComment = true;
                            approvalDetails.mandateRejectComment = true;
                            pendingApprovals.approvals[2].list.push(approvalDetails);
                            break;
                        case "purchase_request": //NO I18N
                            approvalDetails.i18nkey = "sdp.purchase.purchaseId"; //NO I18N
                            approvalDetails.subject = entity_data.title;
                            if (entity_data.requested_by !== null) {
                                approvalDetails.requesterName = entity_data.requested_by.name;
                            }
                            approvalDetails.created_time = entity_data.created_date;
                            var mandateComment = {};
                            mandateComment.mandateAcceptComment = (current_portal_comments.MandatePurchaseApprovalComments === 'true');
                            mandateComment.mandateRejectComment = true;
                            approval_comment_config[associated_entity][approvalDetails.approval_id]=mandateComment;
                            approvalDetails = jQuery.extend(true,approvalDetails,mandateComment);
                            pendingApprovals.approvals[3].list.push(approvalDetails);
                            break;
                        case "purchase_order": //NO I18N
                            approvalDetails.i18nkey = "sdp.purchase.purchaseOrderId"; //NO I18N
                            approvalDetails.custom_po_id = entity_data.custom_po_id;
                            approvalDetails.subject = entity_data.name;
                            if (entity_data.requested_by !== null) {
                                approvalDetails.requesterName = entity_data.requested_by.name;
                            }
                            approvalDetails.created_time = entity_data.created_date;
                            var mandateComment = {};
                            mandateComment.mandateAcceptComment = (current_portal_comments.MandatePurchaseApprovalComments == 'true');
                            mandateComment.mandateRejectComment = true;
                            approval_comment_config[associated_entity][approvalDetails.approval_id]=mandateComment;
                            approvalDetails = jQuery.extend(true,approvalDetails,mandateComment);
                            pendingApprovals.approvals[3].list.push(approvalDetails);
                    }
                }
                headerApprovals.approval_comment_config = approval_comment_config;
            }
        }
        var myPendingApprovals = {
            approvals: []
        };
        var pendingApprovalsCount = 0;
        for (var i = 0; i < pendingApprovals.approvals.length; i++) {
            if (pendingApprovals.approvals[i].list.length > 0) {
                pendingApprovals.approvals[i].entityName = entityNameArr[i];
                pendingApprovals.approvals[i].entity = entityArr[i];
                pendingApprovals.approvals[i].count = pendingApprovals.approvals[i].list.length;
                myPendingApprovals.approvals.push(pendingApprovals.approvals[i]);
            }
        }
        myPendingApprovals.slider_header_name = slider_filter_name;
        renderhbs('#header_approvals', 'approval-list-content', myPendingApprovals, false, 'common'); // NO I18N
    },
    //This method is used to get the filter name based on the module
    getFilterNameForModule: function(module) {
        const filterKeyMap = {
            "request": "approvals.filter.requestpendingapprovals", //NO I18N
            "change": "approvals.filter.changependingapprovals", //NO I18N
            "release": "approvals.filter.releasependingapprovals" , //NO I18N
            "purchase_request": "approvals.filter.purchasependingapprovals",  //NO I18N
            "purchase_order": "approvals.filter.purchasependingapprovals"  //NO I18N
        };
         if(module !== undefined){
            return translate(filterKeyMap[module]);
         } else{
            return translate("sdp.approvals.filter.mypendingapprovals"); //NO I18N
         }
    },
    approvalsPanelSearch: function (_this){
        var searchText = jQuery(_this).val();
        searchText = searchText ? searchText.toLowerCase() : "";
        var pendingApprovals = jQuery(_this).closest("#ApprovalContentFirstSlide"); // NO I18N

        pendingApprovals.find(".approval-box").each(function () {
            var approvalBox = jQuery(this);
            approvalBox.show();
            var entityName = approvalBox.find(".appr-type").text();
            entityName = entityName ? entityName.toLowerCase() : "";
            //If entityName matches the searchText show all approvals in the entity
            //Or search each approval inside the module.
            if (entityName.indexOf(searchText) !== -1) {
                approvalBox.find(".card-view").each(function (index, el) {
                    var card = jQuery(el);
                    card.removeClass("hide").addClass("show");
                });
            } else {
                approvalBox.find(".card-view").each(function (index, el) {
                    var card = jQuery(el);
                    var nodeText = card.text();
                    nodeText = nodeText ? nodeText.toLowerCase() : "";
                    if (nodeText.indexOf(searchText) !== -1) {
                        card.removeClass("hide").addClass("show");
                    } else {
                        card.addClass("hide").removeClass("show");
                    }
                });
            }

            if (approvalBox.find("div.card-view.show").length) {
                approvalBox.show();
                approvalBox.find(".notify-count").text(approvalBox.find("div.card-view.show").length); //NO I18N
            } else {
                approvalBox.hide();
            }

        });

        if (pendingApprovals.find(".approval-box:visible").length) {
            pendingApprovals.find(".noitem").addClass("hide");
        }else {
            pendingApprovals.find(".noitem").removeClass("hide").addClass("show");
        }
    },

    /**
    * Execute the approval action and display appropriate message based on success/failure
    * @param _this -- current element
    * @param associated_entity -- Module/Entity which contains the approval
    * @param id -- Associated Entity id
    * @param level_number -- Approval level id
    * @param approval_id -- Approval id
    * @param from -- "allApprovals"{left panel of home page} (or) "takeAction"{left panel take action} (or) "pendingApprovalsList"{Pending approval filter in show all}
    */
    approvalsAction: function (_this, associated_entity, id, level_number, approval_id, from, portal_id) {
        var approval_action = jQuery(_this).attr('data-id');
        headerApprovals.current_approval_action = approval_action;
        headerApprovals.associated_entity = associated_entity;
        var approval_comment = (from == "allApprovals") ? jQuery("#ActionCmnt").val() : jQuery(_this).closest('#approval_action').find('textarea').val(); //NO I18N
        if (!approval_comment || approval_comment === "") {
            if(associated_entity == "request" || associated_entity == "purchase_order" || associated_entity == "purchase_request"){ //NO I18N
                var comment_config = null;
                if(from == "allApprovals"){          //NO I18N
                    comment_config = $extFrame.getActiveWindow().headerApprovals.approval_comment_config[associated_entity];
                }else if(from == "pendingApprovalsList"){ //NO I18N
                    comment_config = $extFrame.getActiveWindow().$approvalsTable.approval_comment_config[associated_entity];
                }else{
                    comment_config = headerApprovals.approval_comment_config[associated_entity];
                }
                if(comment_config && comment_config[approval_id]){
                    if((approval_action == "accept" && comment_config[approval_id].mandateAcceptComment)||(approval_action == "reject" && comment_config[approval_id].mandateRejectComment)){  //NO I18N
                        showalert('failure', translate("sdp.changedetails.comments.emptyalert"), 'isAutoHide=false'); //NO I18N
                        if (from != "allApprovals") {
                            jQuery(_this).closest("#approval_action").find(".comment").focus(); //NO I18N
                        }
                        return;
                    }
                }
            }
        }

        var data = {
            "approval": { //NO I18N
                "comments": approval_comment //NO I18N
            }
        };
        var inputData = sdpAjaxInputData(data);
        // passing portal id for other portal approvals action
        if(portal_id){
            inputData = appendParameter(inputData,"PORTALID",portal_id); //NO I18N
        }

        sdpAjax({
            url: "/api/v3/" + associated_entity + "s/" + id + "/approval_levels/" + level_number + "/approvals/" + approval_id + "/_" + approval_action, //NO I18N
            data: inputData,
            cache: false,
            type: 'PUT', //No I18N
            success: function (response) {
                var response_status = response.response_status, status;
                if(Array.isArray(response_status)){
                    for(var res=0; res<response_status.length; res++){
                        if(response_status[res].status){
                            status = response_status[res].status;
                            break;
                        }
                    }
                }else{
                    status = response_status.status;
                }
                if (status == "success") {
                    if (from == "allApprovals") {
                        var parentWindow = $extFrame.getActiveWindow();
                        parentWindow.headerApprovals.is_action_taken = true;
                        parentWindow.showalert('success', translate("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                        if (parentWindow.headerApprovals.active_approval_id == approval_id) {
                            if(headerApprovals.associated_entity === 'purchase_order'){
                                var banner_element = window.jQuery(".approval-footer").parent();
                                headerApprovals.renderApprovalStatusBanner(headerApprovals.associated_entity, (headerApprovals.current_approval_action === 'approve') ? "Approved" : "Denied", banner_element, true); //NO I18N
                            } else {
                                headerApprovals.renderApprovalStatusBanner(headerApprovals.associated_entity, (headerApprovals.current_approval_action === 'approve') ? "Approved" : "Denied", '.approval-ui'); //NO I18N
                            }
                        }

                        var card_element_id = "card-view_" + approval_id; //NO I18N
                        parentWindow.jQuery("#" + card_element_id).animate({ //NO I18N
                            opacity: 0
                        }, 100).animate({ "height": "0" }, 300).delay(300); //NO I18N
                        setTimeout(function () {
                            parentWindow.jQuery("#" + card_element_id).remove(); //NO I18N
                        }, 500);
                        var entity = (associated_entity == "purchase_order" || associated_entity == "purchase_request") ? "purchase" : associated_entity; //NO I18N
                        var thisAppr = parentWindow.jQuery("#" + entity + "_appr");
                        var appr_len = (thisAppr.find(".card-view.show").length) - 1;
                        if (appr_len) {
                            thisAppr.find(".notify-count").text(appr_len); //NO I18N
                        } else {
                            parentWindow.jQuery("#card-view_"+approval_id).removeClass("show").addClass("hide"); //NO I18N
                            thisAppr.closest('.approval-box').hide(400); //NO I18N
                            thisAppr.removeClass("show").addClass("hide"); //NO I18N
                            if (thisAppr.closest("#ApprovalContentFirstSlide").find(".card-view.show").length == 0) {
                                thisAppr.closest('.approval').hide(400); //NO I18N
                                thisAppr.closest("#ApprovalContentFirstSlide").find(".panel-search").hide(400); //NO I18N
                                thisAppr.closest("#ApprovalContentFirstSlide").find(".sub-header-panel-content").removeClass("hide").addClass("show"); //NO I18N
                            }
                        }
                    } else {
                        headerApprovals.is_action_taken = true;
                        showalert('success', translate("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                        setTimeout(function () {
                            headerApprovals.getModuleApprLen(_this);
                        }, 400);
                        headerApprovals.approvalActionResponse(_this);
                        if (headerApprovals.active_approval_id == approval_id) {
                            headerApprovals.renderApprovalStatusBanner(headerApprovals.associated_entity, (headerApprovals.current_approval_action === 'approve') ? "Approved" : "Denied"); //NO I18N
                        }
                    }
                } else {
                    if (from != "allApprovals") {
                        jQuery(_this).closest("#approval_action").find(".comment").focus(); //NO I18N
                        jQuery('[data-id="closeAction" ]').trigger("click");
                        showalert('failure', status, 'isAutoHide=false'); //NO I18N
                    } else {
                        $extFrame.getActiveWindow().showalert('failure', status, 'isAutoHide=false'); //NO I18N
                    }
                }
            }
        });
    },
    /**
    * To calculate number of pending approvals left
    * @param _this -- Current element
    */
    getModuleApprLen: function (_this) {
        var $this = jQuery(_this);
        var approval_box = $this.closest(".approval-box"); //NO I18N
        var appr_len = approval_box.find(".card-view.show").length - 1; //NO I18N
        if (appr_len) {
            approval_box.find(".notify-count").text(appr_len); //NO I18N
        }
    },
    /**
    * UI actions after an approval action is taken from take action in left slider
    * @param _this -- Current element
    */
    approvalActionResponse: function (_this) {
        var $this = jQuery(_this);
        var apprLen = $this.closest(".approval-box").find(".card-view.show").length; //NO I18N
        $this.closest('.card-view').animate({ //NO I18N
            opacity: 0
        }, 100).animate({
            "height": "0" //NO I18N
        }, 300).delay(300);
        setTimeout(function () {
            if (apprLen !== 1) {
                $this.parents(".card-view").remove(); //NO I18N
            } else if (apprLen == 1) {
                $this.closest('.approval-box').hide(400); //NO I18N
                $this.parents(".card-view").removeClass("show").addClass("hide"); //NO I18N
                if ($this.closest("#ApprovalContentFirstSlide").find(".card-view.show").length == 0) {
                    $this.closest('.approval').hide(400); //NO I18N
                    $this.closest("#ApprovalContentFirstSlide").find(".panel-search").hide(400); //NO I18N
                    $this.closest("#ApprovalContentFirstSlide").find(".sub-header-panel-content").removeClass("hide").addClass("show"); //NO I18N
                }
                $this.parents(".card-view").remove(); //NO I18N
            }
        }, 500);
    },
    /**
    * UI actions to show approval buttons when take action button is clicked
    * @param _this -- Current element
    */
    takeAction: function (_this) {
        jQuery(_this).hide(400, function () {
            jQuery(_this).closest('#card_content').find('.approval-action').show(400); //NO I18N
        setTimeout(function () {
            var commentSelector = jQuery(_this).closest('#card_content').find(".comment");
            commentSelector.trigger("focus");  //NO I18N
            headerApprovals.commentBindMaxLen(commentSelector,"takeAction"); // No I18N
        }, 300);
        });
    },
    /**
    * To check and alert when the approval comment exceeds the max limit
    * @param commentSelector -- Current comment element
    * @param from -- "takeAction" or "allApprovals"
    */
    commentBindMaxLen: function (commentSelector,from){
        commentSelector.off('input').on('input',function(e) // No I18N
        {
            toggleInfoAlert();
            var len = e.target.value.length;
            if(from == "takeAction"){ // No I18N
                if(len>=2000){
                    showalert('failure', translate("form.character.maximumlength.alert",['2000']), 'isAutoHide=false'); //NO I18N
                }
            }else{
                if(len>=2000){
                    jQuery("#maxlen-error").removeClass("hide");// No I18N
                }
                else{
                    jQuery("#maxlen-error").addClass("hide");// No I18N
                }
            }
        });
    },
    /**
    * UI actions to hide approval buttons in takeAction when cancel button is clicked
    * @param _this -- Current element
    */
    closeAction: function (_this,entity,approval_id) {
        jQuery(_this).closest('#approval_action').hide(400, function () { //NO I18N
            jQuery(_this).closest('#card_content').find('[data-id=takeAction]').show(100); //NO I18N
            var approvalActionSelector = jQuery(_this).closest("#approval_action"); //NO I18N
            approvalActionSelector.find(".comment").val(''); //NO I18N

            var approvalsSelector = headerApprovals.approval_comment_config[entity];
            if(entity == "request" || entity == "purchase_request" || entity == "purchase_order"){ //NO I18N
                if(approvalsSelector && approvalsSelector[approval_id]&&approvalsSelector[approval_id].mandateAcceptComment){
                    approvalActionSelector.find("[data-id='approve']").attr("disabled", true); //NO I18N
                }
                if(approvalsSelector && approvalsSelector[approval_id]&&approvalsSelector[approval_id].mandateRejectComment){
                    approvalActionSelector.find("[data-id='reject']").attr("disabled", true); //NO I18N
                }
            }else{
                //Disable the TextBox when TextBox is empty.
                approvalActionSelector.find("[data-id='approve']").attr("disabled", true); //NO I18N
                approvalActionSelector.find("[data-id='reject']").attr("disabled", true); //NO I18N
            }
        });
    },
    /**
    * Mark the current choosen approval and open the approval details in preview component
    * @param _this -- Current element
    * @param associated_entity -- Module/Entity which contains the approval
    * @param entity_id -- Associated Entity id
    * @param level_id -- Approval level id
    * @param approval_id -- Approval id
    * @param stage_id -- Approval Stage id (only to be passed for Change)
    * @param portal_id -- Portal id of the approval
    */
    activeAction: function (_this, associated_entity, entity_id, level_id, approval_id, stage_id, portal_id) {
        jQuery(".banner-footer").hide();
        if (headerApprovals.active_approval_id) {
            jQuery("#card-view_" + headerApprovals.active_approval_id).removeClass("active");
        }
        var frameopt = 'isFullPage:true,position:420px,loaderClass:pos-fix,freeze_index:100,'+( sdp_user.DIRECTION == 'LTR' ?  (headerApprovals.from_header ? "direction:right" : "direction:left") : (headerApprovals.from_header ? "direction:left" : "direction:right"))+',scrolling:no,preview_ovr:box-shd-left,closecallback:headerApprovals.makeApprovalCardInactive'; //NO I18N
        if (Object.keys($previewComponent.options).length !== 0) {
            var cid = $previewComponent.options[Object.keys($previewComponent.options)[0]].containerId
            //$previewComponent.closePreview(cid);
            frameopt += ',renderin_prev_frame:true'; //NO I18N
        }
        headerApprovals.active_approval_id = approval_id;
        jQuery("#card-view_" + headerApprovals.active_approval_id).addClass("active");
        var level_number = level_id;
        var approvals_info = headerApprovals.getApprovalsUrlTitle(associated_entity,approval_id,level_id,portal_id,entity_id,stage_id,"allApprovals","pending"); //NO I18N
        $previewComponent.load(approvals_info.approval_page_url, translate(approvals_info.module_preview_title), '60%', '', '', 'module_preview_' + approval_id, '', '99', frameopt);
        jQuery('body').find("#freeze-layer").on("click", function () {
            $previewComponent.closePreview('module_preview_' + approval_id); //NO I18N
            $header.closeSlider(this);
            jQuery("#ApprovalContentFirstSlide").dialog("close"); //NO I18N
        });
    },
    close: function () {
        jQuery("#ApprovalContentFirstSlide").dialog("close"); //NO I18N
    },
    /**
    * To enable/disable approve/reject button based on the comments configuration for every module
    * @param comment -- Typed approval comment
    * @param from -- "takeAction" or "allApprovals"
    * @param entity -- Module/Entity which contains the approval
    * @param approval_id -- Approval id
    */
    EnableDisable: function(comment,from,entity,approval_id) {
        //Verify the TextBox value.
        var approveSelector = (from == "takeAction") ? jQuery(comment).closest("#approval_action").find("[data-id='approve']") : jQuery("[data-id='approve']");  //NO I18N
        var rejectSelector = (from == "takeAction") ? jQuery(comment).closest("#approval_action").find("[data-id='reject']") : jQuery("[data-id='reject']");  //NO I18N

        if (comment.value.trim() != "") {
            //Enable the TextBox when TextBox has value.
            approveSelector.attr("disabled", false); //NO I18N
            rejectSelector.attr("disabled", false); //NO I18N

        } else {
            var approvalsSelector;
            if(from == "takeAction"){ //NO I18N
                approvalsSelector = headerApprovals.approval_comment_config[entity];
            }else if(from == "allApprovals"){ //NO I18N
                approvalsSelector = $extFrame.getActiveWindow().headerApprovals.approval_comment_config[entity];
            }else if(from == "pendingApprovalsList"){ //NO I18N
                approvalsSelector = $extFrame.getActiveWindow().$approvalsTable.approval_comment_config[entity];
            }
            if(entity == "request" || entity == "purchase_request" || entity == "purchase_order"){ //NO I18N
                if(approvalsSelector && approvalsSelector[approval_id]&&approvalsSelector[approval_id].mandateAcceptComment){
                    approveSelector.attr("disabled", true); //NO I18N
                }
                if(approvalsSelector && approvalsSelector[approval_id]&&approvalsSelector[approval_id].mandateRejectComment){
                    rejectSelector.attr("disabled", true); //NO I18N
                }
            }else{
                //Disable the TextBox when TextBox is empty.
                approveSelector.attr("disabled", true); //NO I18N
                rejectSelector.attr("disabled", true); //NO I18N
            }
        }
    },
    renderApprovalStatusBanner: function(module, action_status, banner_element, fromPO, fromRequestJsp, isNonLogin) {
        if(action_status == "Approved" || action_status == "Denied"){

            var iframes = $extFrame.getActiveWindow();
            for (var i = 0; i < iframes.length; i++) {
                if (typeof iframes[i].jQuery === 'function') {
                    iframes[i].jQuery(".approval-footer, .nminfo-footer").addClass('hide');
                }
            }

            let module_name = null, banner_value = null, json = null;
            if(fromRequestJsp){
                json = {
                    banner_title : translate("sdp.common.thankyou"), // NO I18N
                    banner_reference_msg : translate("sdp.approval.banner.sucess.msg"), // NO I18N
                    home_page_msg : translate("sdp.home.page.btn"), // NO I18N
                    show_home_btn : true,
                    isNonLogin: isNonLogin
                };
            } else {
                module_name = module.charAt(0).toUpperCase() + (module.includes('_') ? module.split('_')[0].slice(1) : module.slice(1));
                banner_value = (action_status === "Approved") ? translate("common.approved", [module_name]) : translate("common.rejected", [module_name]); // NO I18N
                json = {
                    banner_title: banner_value,
                    banner_reference_msg: translate('approvals.banner.reference')
                };
            }
            var compiledHtml = renderhbs(null, "approval-status-banner", json, false, "approval", false, false, null, true); // NO I18N
            if(banner_element){
                if(fromPO){
                    banner_element.append(compiledHtml);
                    jQuery('#approval_banner_footer').removeAttr('class'); //NO I18N
                    jQuery('#approval_banner_footer').addClass('approval-footer whitebg pos-fix p10 scroll-shadow-top fw bottom0'); //NO I18N
                } else {
                    window.jQuery(banner_element).append(compiledHtml);
                }
            }else if(fromRequestJsp){
                $extFrame.getActiveWindow().jQuery('#nminfo_footer').append(compiledHtml);
            }else {
                $extFrame.getActiveWindow().jQuery('div[id*="module_preview"]').find('.bodybg').append(compiledHtml);
            }
            const toggleHide = (selector, condition) => {
                const $element = jQuery(selector), $topElement = $extFrame.getActiveWindow().jQuery(selector);
                ($element.length === 0) ? $topElement.toggleClass('hide', condition) : $element.toggleClass('hide', condition);// NO I18N
            };
            toggleHide('.approve-image', action_status !== "Approved");// NO I18N
            toggleHide('.reject-image', action_status === "Approved");// NO I18N
        }
    },
    /**
    * Render chosen approval details in preview component
    * @param module -- Module/Entity which contains the approval
    * @param entity_id -- Associated Entity id
    * @param approval_level_id -- Approval level id
    * @param approval_id -- Approval id
    * @param stage_id -- Approval Stage id (only to be passed for Change)
    * @param portal_id -- Portal id of the approval
    * @param FROM -- "allApprovals"/"pendingApprovalsList"
    */
    renderEntityApproval: function(module,FROM,entity_id,approval_level_id,approval_id,portal_id,stageId, action_status){
        var url;
        headerApprovals.current_action_status = action_status;
        switch (module){
            case "change":  //NO I18N
                url = '/ui/print?entity_id=' + entity_id + '&module=change&externalframe=true&approvals_level=' + approval_level_id + '&approval=' + approval_id;// NO I18N
                break;
            case "release":  //NO I18N
                url = '/ui/print?entity_id='+ entity_id +'&module=release&approval='+approval_id + '&approvals_level='+approval_level_id+'&externalframe=true&PORTALID='+portal_id ; //NO I18N
                break;
            case "purchase_request":  //NO I18N
                url = '/PRApproval?operation=get&FROM='+e_param(FROM)+'&approval_id='+approval_id+'&approval_level_id='+approval_level_id+'&id='+entity_id+'&externalframe=true&PORTALID='+ portal_id; //NO I18N
                break;
        }
			if(module == "purchase_request") {
				var iframe = document.createElement('iframe');
				iframe.id = 'common_iframe'; 
				iframe.src = url;
				iframe.style.width = '100%'; 
				iframe.style.height = 'calc(100vh - 150px)';
				iframe.style.border = 'none';
				document.getElementById("approval-container").appendChild(iframe);
			}
			else {
				jQuery("#approval-container").load(url);
			}
			
        setTimeout(function () {
                var commentSelector = jQuery('.approval-footer').find('textarea');
                commentSelector.trigger("focus"); //NO I18N
                headerApprovals.commentBindMaxLen(commentSelector);
                if(module == "purchase_request"){ //NO I18N
                    const activeWindow = $extFrame.getActiveWindow();
                    var comment_config = (FROM == "allApprovals") ? activeWindow.headerApprovals.approval_comment_config[module] : ((FROM == "pendingApprovalsList") ? activeWindow.$approvalsTable.approval_comment_config[module] : null);
                    if(comment_config && comment_config[approval_id] && !comment_config[approval_id].mandateAcceptComment){
                        jQuery('.approval-footer [data-id="approve"]').attr("disabled", false); //NO I18N
                    }
                }
                if(headerApprovals.current_action_status){
                    headerApprovals.renderApprovalStatusBanner(module, headerApprovals.current_action_status);
                }
        }, 300);
    },
    /**
    * UI actions after an approval action is taken from request approval preview
    * @param approval_id -- Approval id
    * @param isApproved -- request approved or not
    * @param from -- "allApprovals"/"pendingApprovalsList"
    */
    afterRequestApprovalAction: function(request_id, approval_id,isApproved,from){
        var parentWindow = $extFrame.getActiveWindow();
        if (isApproved) {
            if(from == "allApprovals"){ //NO I18N
                parentWindow.headerApprovals.is_action_taken = true;
                if (parentWindow.headerApprovals.active_approval_id == approval_id) {
                    var action_status = (isApproved) ? "Approved" : "Denied"; //NO I18N
                    var approvals_info = headerApprovals.getApprovalsUrlTitle("request",approval_id,null,null,request_id,null,"approvalsList",action_status);
                    $previewComponent.load(approvals_info.approval_page_url,translate(approvals_info.module_preview_title),'60%','','','module_preview','','','scrolling:no,closecallback:$approvalsTable.reloadList,renderin_prev_frame:true');
                }

                parentWindow.showalert('success', parentWindow.getMessageForKey("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                var card_element_id = "card-view_" + approval_id; //NO I18N
                parentWindow.jQuery("#" + card_element_id).animate({ //NO I18N
                    opacity: 0
                }, 100).animate({ "height": "0" }, 300).delay(300); //NO I18N
                setTimeout(function () {
                    parentWindow.jQuery("#" + card_element_id).remove(); //NO I18N
                }, 500);
                var thisAppr = parentWindow.jQuery("#request_appr"); //No I18N
                var appr_len = (thisAppr.find(".card-view.show").length) - 1;
                if (appr_len) {
                    thisAppr.find(".notify-count").text(appr_len); //NO I18N
                } else {
                    parentWindow.jQuery("#card-view_"+approval_id).removeClass("show").addClass("hide"); //NO I18N
                    thisAppr.closest('.approval-box').hide(400); //NO I18N
                    thisAppr.removeClass("show").addClass("hide"); //NO I18N
                    if (thisAppr.closest("#ApprovalContentFirstSlide").find(".card-view.show").length == 0) {
                        thisAppr.closest('.approval').hide(400); //NO I18N
                        thisAppr.closest("#ApprovalContentFirstSlide").find(".panel-search").hide(400); //NO I18N
                        thisAppr.closest("#ApprovalContentFirstSlide").find(".sub-header-panel-content").removeClass("hide").addClass("show"); //NO I18N
                    }
                }
            }else if(from == "pendingApprovalsList"){ //NO I18N
                parentWindow.showalert('success', parentWindow.getMessageForKey("sdp.approval.action.sucess.msg"), 'isAutoHide=true'); //NO I18N
                var action_status = (isApproved) ? "Approved" : "Denied"; //NO I18N
                $extFrame.getActiveWindow().jQuery(".approval-footer").addClass('hide');
                var approvals_info = headerApprovals.getApprovalsUrlTitle("request",approval_id,null,null,request_id,null,"approvalsList",action_status);
                $previewComponent.load(approvals_info.approval_page_url,translate(approvals_info.module_preview_title),'60%','','','module_preview','','','scrolling:no,closecallback:$approvalsTable.reloadList,renderin_prev_frame:true');
            }
        } else {
            parentWindow.showalert('success', parentWindow.getMessageForKey("sdp.approval.wrongkey"), 'isAutoHide=true'); //NO I18N
        }
    },
    makeApprovalCardInactive: function(){
        if (headerApprovals.active_approval_id) {
            jQuery("#card-view_" + headerApprovals.active_approval_id).removeClass("active");
            headerApprovals.active_approval_id = null;
        }
    },
    getApprovalsUrlTitle: function(associated_entity, approval_id, level_id, portal_id, entity_id, stage_id, from, approval_status) {
        const entityTitleMap = {
            "purchase_request": "sdp.purchase.servicerequest.purchase.details", //NO I18N
            "change": "sdp.change.details", //NO I18N
            "request": "sdp.requests.viewrequest.tabtitle1", //NO I18N
            "release": "sdp.release.details", //NO I18N
            "purchase_order": "sdp.purchase.servicerequest.purchase.details" //NO I18N
        };
        let module_preview_title = entityTitleMap[associated_entity], approval_page_url;
        const baseParams = `FROM=${from}&approval_id=${approval_id}&externalframe=true`;

        if (associated_entity === "purchase_order") {
            approval_page_url = `/POApproval?module=get&${baseParams}&approval_level_id=${level_id}&id=${entity_id}&PORTALID=${portal_id}`;
        } else if (associated_entity === "request") { //NO I18N
            approval_page_url = `/approval/Approve.jsp?MODULE=Request&woID=${entity_id}&${baseParams}`;
            if (level_id || portal_id) {
                approval_page_url += `&approval_level_id=${level_id}&PORTALID=${portal_id}`;
            }
        } else {
            approval_page_url = `/approval/MyApproval.jsp?module=${associated_entity}&entity_id=${entity_id}&approval_level_id=${level_id}&PORTALID=${portal_id}${stage_id ? `&stageId=${stage_id}` : ''}&${baseParams}`;
        }
        if (approval_status === "Approved" || approval_status === "Denied") {
            if(associated_entity !== "request" || (associated_entity === "request" && (level_id || portal_id))){
                approval_page_url += `&approval_status=${approval_status}`;
            }
        }
        return { "approval_page_url": approval_page_url, "module_preview_title": module_preview_title }; //NO I18N
    },
    handleApprovalDialogClose: function() {
        if (window.location.pathname === "/ui/approvals" || (window.location.pathname === "/ui/home" && jQuery(".approvals-tab.active").length>0)) { //NO I18N
            jQuery('body').addClass('subheader-of-h of-h');
            $extFrame.getActiveWindow().$approvalsTable.tableInstance.refreshTable("refresh") ;// No I18N
            jQuery("#approvals_action_panel").addClass('hide');
        }
        else if (window.location.pathname === "/ui/home") {
            $home_page.processApprovals();
        }
    },
    getApprovalCommentConfig: function(){
        var comment_config = null;
        sdpAjax({
            url: "/servlet/HdClientUtilServlet?command=get_approval_comment_config", //NO I18N
            async: false,
            success: function (response) {
                comment_config = response;
            }
        });
        return comment_config;
    },



};


/* $Id$ */
