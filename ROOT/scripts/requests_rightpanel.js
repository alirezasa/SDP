
/* $Id$ */

$req.rpanel = {

	is_closed: false,	/** represents whether the right panel is closed or opened */

	actionable_props: ["status", "priority", "technician", "group", "site","category","subcategory","item"],	//No I18N

	/**
	 * Function to render the right panel whenever required
	 */
	techAssociations: function() {
		var reqInfo = $req.details.request_info;
		var technAssociateOperations = [];
	    if(($req.sdp_user.USERTYPE === 'Technician')) {
	    	if(!reqInfo.is_trashed ) {
	    		var links = $req.details.operational_data.links;
                if(reqInfo.has_linked_requests && links.link_requests && links.link_requests.get) {
                	technAssociateOperations.push('linked_requests');
                }
                if($req.details.request_info.linked_to_request) {
            		technAssociateOperations.push('linked_to_request');
            	}
                if(!reqInfo.is_service_request && (links.problem || links.request_problem_new || links.search_problem)) {
            	    technAssociateOperations.push('associate_problem');
                }
				if(links.request_caused_by_change || links.search_request_caused_by_change || links.request_initiated_change || links.request_initiated_change_new || links.search_request_initiated_change) {
					technAssociateOperations.push('associate_change');
				}
				if(links.project || links.project_new || links.search_project) {
					technAssociateOperations.push('associate_project');
				}

                //TODO: Need to check if the requester can also see the associated PRs and POs
                if(reqInfo.is_service_request && (links.purchase_request_new || links.purchase_request_search || ( $req.details.request_metrics.hasOwnProperty("purchase_request_count") && $req.details.request_metrics.purchase_request_count != "0"))) {
            	    technAssociateOperations.push('associate_purchase_request');
                }
                if(reqInfo.is_service_request && (links.purchase_order_search || ($req.details.request_metrics.hasOwnProperty("purchase_order_count") && $req.details.request_metrics.purchase_order_count != "0"))) {
            	    technAssociateOperations.push('associate_purchase_order');
                }
            }
		}
		return technAssociateOperations;
	},
	rlcTransitions : function(){
		$req.details.rlc = {
	    	isEnabled: false
		};
		if( (!window.isMSPOrSCP || sdp_app.IS_RLC_MODULE_ENABLED) && $req.details.request_info.lifecycle){
		    if(($req.sdp_user.USERTYPE === 'Technician') && $req.sdp_user.ROLES.contains('ModifyRequests')) {
	    	    $req.details.getRLCTransition(woID);
	    	}
		}
		$req.details.rlc.show_rpanel = $req.layout.show_rpanel
		$req.details.rlc.status = $req.details.request_info && $req.details.request_info.status && $req.details.request_info.status.name;
		return $req.details.rlc;
	},
	render: function(skipPageScript, showZiaNotifications) {
  	if($req.details.exceptions && $req.details.exceptions.rpanel === false && !window.externalframe) {
			return;
		}
		if($req.layout.rpanel.length === 0 || !$req.layout.show_rpanel) {
			jQuery("#right-panel, #toggleRHS").hide();
			// return;
		}
		this.setFieldsVisibility()
	    var reqInfo = $req.details.request_info;
	    var rpanelSections = $req.layout.rpanel.slice();
	
	    if(($req.sdp_user.USERTYPE === 'Technician')) {
	    	/* hide share for nonShareRequest Technician */
	    	if(reqInfo.is_trashed || (sdp_user.ROLES.indexOf('ShareRequest') === -1) || (window.isMSPOrSCP && !sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED) ) {
	    		if(!reqInfo.is_shared){
	    		    var index = rpanelSections.indexOf('share');
	    		    if(index !== -1) {
	    		    	rpanelSections.splice(index,1);	/** removing the share option from right panel sections array, if presents */
	    		    }
	    	    }
	    	}
	    }

		if($req.layout.rpanel.length === 0 || 
			($req.layout.rpanel.length === 1 && $req.layout.rpanel[0] === "rlc" && 
				(!$req.details.rlc || !$req.details.rlc.isEnabled || !$req.details.rlc.transitions || $req.details.rlc.transitions.length === 0))) {
			jQuery("#right-panel, #toggleRHS").hide();
			return;
		}

	  	var rpfieldDetails = {};
	  	rpfieldDetails.order = rpanelSections;
	  	rpfieldDetails.techStaticArray = $req.layout.properties;
  		rpfieldDetails.request_info = reqInfo;
		rpfieldDetails.is_trashed = $req.details.request_info.is_trashed;
		if(!$req.prop.fromListview && !window.externalframe){
			rpfieldDetails.technAssociateOperations = $req.rpanel.techAssociations();
			rpfieldDetails.rlc = $req.rpanel.rlcTransitions();
		}
		if(window.isMSPOrSCP) {
		  	rpfieldDetails.isSignoffEnabled = sdp_app.IS_SIGNOFF_ENABLED;	//signoff is enabled for MSP and disabled for SDP in ServiceDeskUtil
			if(!sdp_app.IS_ACC_INFO_ICON_ENABLED || jQuery.isEmptyObject($req.details.account_info) ){
				delete rpfieldDetails.account_properties;
				if(rpfieldDetails.order.indexOf("account") != -1){
					rpfieldDetails.order.splice(rpfieldDetails.order.indexOf("account"), 1);
				}
			} else {
				rpfieldDetails.account_properties = $req.msprpanel.rightPanelAccountSection();
			}
		}

	  	var rqstrSec = null;
	  	/** copying the Requester section so that we don't need to load it again after we render */
	  	if(jQuery("div#requester-info").length > 0 && !jQuery("div#requester-info").is(":empty")) {
	  		rqstrSec = jQuery("#requester-info").clone(true);
	  	}
        if(this.is_closed) {
        	jQuery("#right-panel").css("display", "none");	//No I18N
        	jQuery("#toggleRHS").attr( 'toggleState','close' ).find( '.caret' ).addClass( 'caret-left' ); //No I18N
        }
        let afterRenderCallback = function() {
            $req.details.bindEvents.templates.right_panel_template(rpfieldDetails);
        }
      	renderhbs('#right-panel-info', 'right-panel-template', rpfieldDetails, false, 'requests', true, null, afterRenderCallback); //No I18N

        if(!window.externalframe  && jQuery("#widget_tabs li").length==0) { // header is loaded once
			SdpWidgets.renderHelpers.renderWidgetHeader({
				location:"request.detail.rightpanel",//No i18n
				element:"#widget_tabs",//No i18n
				type:"rightpanel", //No i18n
				data:{
					module:"request",//No i18n
					containerId:"widget_content",//No i18n
					clearContainer:true,
					entity_id:$req.details.request_info.id
				},
				default_icon:   $req.details.template_module === "INCIDENT"?" rspr r-inci-h icon-xl tf0-7 top-5": " rspr r-ser-h  icon-xl tf0-7 top-5", // NO I18N
				pre:()=>{
					jQuery("#widget_content").addClass("hide");
					jQuery("#right-panel-container").removeClass("hide");
					stickyRightPanel(); //used to calculate width  and height properties of default rpanel  for StickyPanel to work properly
				},
				post:()=>{
					jQuery("#widget_content").removeClass("hide");
					jQuery("#right-panel-container").addClass("hide");
				}
			});
		}
        if($req.tags.renderedOnce) {
        	$req.tags.render();
        }

        setTimeout(function(){
        	if(rqstrSec) {
        		jQuery("div#requester-info").html(rqstrSec);
        	}
    		if(sdp_user.USERTYPE === 'Technician'){
	            $req.prop.addListener();
	            if (document.readyState === 'complete') {
	            	stickyRightPanel();
	            }
	        }

			$req.rpanel.initRPAttachments();
			//ZIA
			if(showZiaNotifications != false) {


			if(window.isAISetRemindLater){
			    //Remind Later should not be shown when request is submitted for approval or if it is moved to completed status
				var completedStatusIds = [];
				$req.prop.status.forEach(function (s) { if (!s.in_progress) { completedStatusIds.push(s.id); } });
				if(jQuery("#approvals-tab").is(":visible") || completedStatusIds.contains($req.rpanel.fieldsObj.status.FIELDVALUE)){
					isAISetRemindLater = false;
				} else {
					if(!jQuery('#Request_zia_remindLater').is(":visible")){
						zia_cat_temp_suggestion.showZiaSuggetionInRemindLater(woID, AISuggestedTemplate, AISuggestedTemplateName);
					}
				}
			}

            //Zia notifications are loaded after template suggestion details are loaded in the zia_cat_temp_suggestion object
			if (typeof ziaNotifLength !== "undefined" && ziaNotifLength > 0) {
				startIndex = 1;
				ziac.loadResource(true).then(function () {
					zia_list.loadZiaForEntity(null, "Request", woID); //No I18N
					jQuery("#Request_zia_notify").addClass("open");
				});
			}
			}
			//ZIA
			jQuery("#req_details_right_skloader").skLoader("hide"); //No I18N
        },100);
        if(skipPageScript!=true){
        	$se.page_scripts.render("rdp_page");	
        }
        if(window.isMSPOrSCP && jQuery('[data-cs-field="account-section"] .col-fields').length === 0){ // NO I18N
            // Hide the account section, if any properties are not visible
            jQuery('[data-cs-field="account-section"]').remove();
        }
	},

	initRPAttachments: function() {
		/** Request Attachments (Rightside popUp) */
		this.attachRPPreview = new attachPreview("#attachmentDropdown",{ // No I18N
			"entity_id": $req.details.request_info.id, // No I18N
			"entity" : "requests", // No I18N
			"api" : false, // NO I18N
			"layouts":false, //NO I18N
			popover:{
				enable:true,
				target:'#attachmentDropdownTarget' //NO I18N
			}
		});
	},

	/**
	 * sets view true for right panel fields based on the request's data
	 */
	setFieldsVisibility: function() {
		if($req.details.request_metrics) {
			var task_total_count = $req.details.request_metrics.task_total_count;
		    var task_completed_count = $req.details.request_metrics.task_completed_count;
		    if((task_total_count != '0' || task_completed_count != '0') && $req.details.operational_data.links.tasks && $req.details.operational_data.links.tasks.get){
		        this.fieldsObj.tasks = { "VIEW": true }; //NO I18N
		    } else {
		    	this.fieldsObj.tasks = {};
		    }
			var checklists_total_count = $req.details.request_metrics.checklists_total_count;
		    var checklists_completed_count = $req.details.request_metrics.checklists_completed_count;
		    if((checklists_total_count != '0' || checklists_completed_count != '0')&&!$req.details.request_info.is_trashed&&($req.sdp_user.USERTYPE === 'Technician')){
		        this.fieldsObj.checklists = { "VIEW": true }; //NO I18N
		    } else {
		    	this.fieldsObj.checklists = {};
		    }
		}
	    this.fieldsObj.attachments = { "VIEW": true }; //NO I18N
	    this.fieldsObj.share = { "VIEW": true }; //NO I18N
	},

  	/*
	 * show/hide the more assets list if the list exceeds the count 3
	 */
  	toggleAssets: function(showAsset) {
  		if(showAsset) {
  			jQuery('.more-asset').slideDown(function() {
  				jQuery(this).css("overflow","visible");	//No I18N
  				jQuery('#asset-hide-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#asset-show-more').addClass('hide');	//NO I18N
  		} else {
  			jQuery('.more-asset').slideUp(function() {
  				jQuery('#asset-show-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#asset-hide-more').addClass('hide');	//NO I18N
  		}
  	},
	
  	/*
	 * show/hide the more assets list if the list exceeds the count 3
	 */
  	toggleSpace: function(showSpace) {
  		if(showSpace) {
  			jQuery('.more-space').slideDown(function() {
  				jQuery(this).css("overflow","visible");	//No I18N
  				jQuery('#space-hide-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#space-show-more').addClass('hide');	//NO I18N
  		} else {
  			jQuery('.more-space').slideUp(function() {
  				jQuery('#space-show-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#space-hide-more').addClass('hide');	//NO I18N
  		}
  	},	

  	/*
	 * show/hide the more configuration items list if the list exceeds the count 3
	 */
  	toggleConfItems: function(showConfItems) {
  		if(showConfItems) {
  			jQuery('.more-configuration_items').slideDown(function() {
  				jQuery(this).css("overflow","visible");	//No I18N
  				jQuery('#configuration_items-hide-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#configuration_items-show-more').addClass('hide');	//NO I18N
  		} else {
  			jQuery('.more-configuration_items').slideUp(function() {
  				jQuery('#configuration_items-show-more').removeClass('hide');	//NO I18N
  			});
  			jQuery('#configuration_items-hide-more').addClass('hide');	//NO I18N
  		}
  	},
	
	/*
	 * Loads the requester information in right panel
	 */
	loadRequesterInfo: function() {
		var requester_id = $req.details.request_info.requester.id;
		if(requester_id !== '1'){
			    jQuery("#requester-info").load("/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&orguser=true&apiModule=requests&apiEntity=requester&apiModuleId="+$req.details.request_info.id+"&userId="+requester_id+"&key="+$req.details.request_info.image_token+"&minContent=true&card=true");	//No I18N
		}
	}
};


/*
 * Sticks the Right Panel at the top on vertical scroll only when the right panel reaches its bottom while scrolling
 * ----- NOT USED -----
 */
function stickyRightPanel() {
	if(jQuery('#toggleRHS').attr('togglestate') !== "open") {
		return;
	}
	var rightPanel = jQuery("#right-panel-content");	//No I18N
	var rightPanelHeight = rightPanel.outerHeight(true);
	var windowHeight = jQuery(window).height();
	var windowScrollTop = jQuery(window).scrollTop();
	var windowScrollLeft = jQuery(window).scrollLeft();
	var woHeaderHeight = jQuery("#WOHeader").height();	//No I18N
	var rPanelTop = jQuery("#right-panel-container").offset().top;	//No I18N
	var rPanelLeft = jQuery("#right-panel-container").offset().left;	//No I18N
	if(rightPanel.css("position") === "fixed") {
		if(rPanelTop + rightPanelHeight - windowScrollTop >= windowHeight) {
			rightPanel.css({"position": "relative", "top": "0px", "bottom": "", "left": "", "right": "0px"});	//No I18N
		} else {
			var rpL = rPanelLeft - windowScrollLeft + 1;
			rightPanel.css({"left":rpL+"px", "right": ""});	//No I18N
		}
		if(rPanelTop - woHeaderHeight >= windowScrollTop) {
			rightPanel.css({"position": "relative", "top": "0px", "bottom": "", "left": "", "right": "0px"});	//No I18N
		} else {
			if(rightPanel.css("position") == "fixed") {
				var rpL = rPanelLeft - windowScrollLeft + 1;
				rightPanel.css({"left":rpL+"px", "right": ""});	//No I18N
			} else {
				rightPanel.css({"left":"", "right": "0px"});	//No I18N
			}
		}
	} else {
		if(rightPanelHeight < windowHeight - woHeaderHeight) {
			if(rPanelTop - woHeaderHeight < windowScrollTop) {
				var rPanelWidth = jQuery('#WOHeader .right').outerWidth() - 1;	//No I18N
				var rpL = rPanelLeft - windowScrollLeft + 1;
				rightPanel.css({"position":"fixed", "top": woHeaderHeight+"px", "width":rPanelWidth+"px", "left":rpL+"px", "right": ""});	//No I18N
			} else {
				rightPanel.css({"position": "relative", "top": "0px", "bottom": "", "left": "", "right": "0px"});	//No I18N
				var rpH = jQuery("#right-panel-container").outerHeight();	//No I18N
				if(rpH < rightPanelHeight) {
					rpH = rightPanelHeight;
					jQuery("#right-panel-container").css("height", rpH+"px" );	//No I18N
				}
			}
		} else {
			if(rPanelTop + rightPanelHeight - windowScrollTop < windowHeight) {
				var rPanelWidth = jQuery('#WOHeader .right').outerWidth() - 1;	//No I18N
				var rpL = rPanelLeft - windowScrollLeft + 1;
				rightPanel.css({"position":"fixed", "top":"", "bottom":"20px", "width":rPanelWidth+"px", "left":rpL+"px", "right": ""});	//No I18N
				var rpH = jQuery("#right-panel-container").height();	//No I18N
				if(rpH < rightPanelHeight) {
					rpH = rightPanelHeight;
				}
				jQuery("#right-panel-container").css("height", rpH+"px" );	//No I18N
			}
		}
	}
}

/* Performs UI changes on toggling the Right Panel */
function toggleRightPanel() {
	if(jQuery('#toggleRHS').attr('togglestate') == "open") {	//No I18N
	  jQuery("#listcontrols").addClass("task-menu-wrap");
		$req.rpanel.is_closed = false;
		/* after opening the Right panel */
		setTimeout(function() {
			jQuery('#WOHeader .right').attr('style','border-color: #cbcbcb');	//No I18N
			stickyRightPanel();
		}, 600);
	} else {
	  jQuery("#listcontrols").removeClass("task-menu-wrap");
		$req.rpanel.is_closed = true;
		/* after closing the Right panel */
		jQuery("#right-panel-content").css({"position":"relative", "top":"0px", "bottom": "20px", "left": "", "right": "0px"});	//No I18N
		jQuery('#WOHeader .right').css('border', 'none');	//No I18N
	}
	setTimeout(function() {
		/* Realigning the WO Tabs */
		woTabs.handleTabs();
		/* changes the width of the fixed submit row of any form on toggling the Right panel */
		jQuery("[data-id='form-fixed-btn']").each(function(index, element) {
			var ele = jQuery(element);
			ele.css("width", ele.parent().width());	//No I18N
		});
		/* If the tab is time analysis, we need to calculate the width again. */
		if($req.details.tab_name === "time_analysis") { // NO I18N
			$req.details.changeTab("time_analysis"); //NO I18N
		}
	}, 600);
}

//Tag feature code end
$req.tags = {
	data: [],
	renderedOnce: false,

	init: function(){
		if(sdp_user.USERTYPE != "Technician"){
			return;
		}
		this.renderedOnce = false;
		this.data = $req.details.request_info.tags;
	},

	render: function(){
		if(sdp_user.USERTYPE != "Technician"){
			return;
		}
		if(($req.sdp_user.USERTYPE === 'Technician')) {
	        this.setTagSection("#request-tag-section"); //No I18N

			this.renderedOnce = true;
			jQuery("#tags_edit").addClass('hide'); //No i18n
			jQuery("#showLess").addClass('hide'); //No I18N
		}
		else{
			jQuery('#request-tag-section').hide();
		}
	},

	setTagSection: function(holder){
		var tagDetails = {};
	    tagDetails.tagsList = $req.tags.data;
		tagDetails.tagListCount = $req.tags.data.length-10;
		tagDetails.hasTags = $req.tags.data.length>0;
		tagDetails.limit = $req.tags.data.slice(0, 10);
		tagDetails.hasExedLimit = $req.tags.data.length > 10;
		tagDetails.isEditPermission = !$req.details.request_info.is_trashed && $req.sdp_user.ROLES.contains("ModifyRequests"); //No i18n

		var tagsEvent = () => {
		    $req.details.bindEvents.templates.tag_template("request-tag-section"); //No I18N
		}

	    return renderhbs(holder, 'tag-template', tagDetails, false, 'requests', null, null, tagsEvent); //No I18N
	},

	editMode: function(element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		var list_info = {}
        list_info.search_criteria = [{ "field": "module.name", "value": "request", "condition": "eq" }] //NO I18N
		var input_data={
            multiple: true,
            sort: true,
            closeOnSelect: false,
            cache:[],
            placeholder: getMessageForKey("sdp.tag.select"),
			//SD-91560: Unable to add a new tag when the it is shorter than the existing one
			createSearchChoicePosition: "top",	//NO I18N
			createSearchChoice: function (term, data) {
				//Search choice will skipped if the choice has case sensitive changes 
				var canTag = ! data || ! data.some(function (item) {
					return item.text.toLowerCase() === term.toLowerCase()
				}) 
				//Search choice will skipped if it is already tagged to the request 
				canTag =canTag &&! $req.tags.data.some(function (item) {
					return item.name.toLowerCase() === term.toLowerCase()
				});
				if (!canTag) {
					return null;
				}
				//"isTag" field is added to identify the option added using search choice and willl be deleted once the tag POSt call is made in $req.tags.addTag()
				return { id: term, text: term, isTag: true };
			},
			tags: true,
			url:[{
                url: "/api/v3/tags", //No I18N
                field: "tags", //No I18N
                list_info: list_info,
                processResults: function(search_data, data, field, settings) {
        			var isNotPresent = true;
        			$req.tags.data.forEach(function(tagObj){
					  if(tagObj.id == data.id){
					  	isNotPresent = false;
        			 	return;
					  }
					});
					if(isNotPresent){
	        			search_data.push({
	                        id: data.id,
	                        text: data.name || data.display_name||data.text
	                    });
	        		}
             	}
        	}]
    	};
        tagSection.find("#tags_select").sdp_select2(input_data)
        tagSection.find("#tags_select").on("change", function(){//NO I18N
        	var tagselect2Box = tagSection.find('#tagSel .tags-sel'),  tagselectChoices = tagselect2Box.find('.select2-choices .select2-search-choice');
  			if(tagSection.find("#tags_select").select2("data").length == 0){
  				tagSection.find("#tag_save").prop('disabled', true);//NO I18N
  			}
  			else{
  				tagSection.find("#tag_save").prop('disabled', false);//NO I18N
  			}

  			if(tagselectChoices.last().find('div')[0].scrollWidth > tagselect2Box.outerWidth()) {
  				tagselectChoices.last().css({
					width:tagselect2Box.find('.select2-choices').width() - 46
				}).find("div").attr("class", "text-overflow");
  			}
  		}).on("select2-selecting", function (e) {
			if (e.choice.isTag) {
				$req.tags.addTag(e);
			}
		});
  		var tagField = tagSection.find(".tags-sel").find(".select2-input");
  		tagField.addClass("fw");
  		tagField.on('keyup',function(event) {
  			if (event.keyCode === 13) {
  				$req.tags.addTag(element);
  			}
  			jQuery("#select2-drop").show();
  		});
  		tagSection.find("#no_tags").hide();
  		tagSection.find("#tagsAddNew").hide();
  		tagSection.find("#tags_edit").removeClass('hide'); //No i18n
	},

	save: function(element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		var selct2Tags = jQuery.map(tagSection.find("#tags_select").select2("data"), function(tag){return {"id": tag.id}});//NO I18N
		if(selct2Tags != null && selct2Tags.length > 0){
			var inputData = selct2Tags.concat($req.tags.data);
			this.associateTags(inputData, false, tagSection);
		}
	},

	remove: function(tagId, element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		var requestTags = this.data;
		for( var i = 0; i < requestTags.length; i++){ 
		   if ( requestTags[i].id === tagId.toString()) {
		     requestTags.splice(i, 1); 
		     break;
		   }
		}
		this.associateTags(requestTags, true, tagSection);
	},

	associateTags: function(inputData, isDelete, tagSection){
		sdpAjax({
			url: '/api/v3/requests/'+$req.details.request_info.id+'/_tag',	//NO I18N
			type: 'PUT',	//NO I18N
			data: sdpAjaxInputData({"tags": inputData}), //NO I18N
			success: function(data) {
				if(isDelete){
					showalert("success", getMessageForKey("sdp.tag.removed.success"), "isAutoHide=true"); //NO I18N
				}
				else{
			    	showalert("success", data.response_status[0].messages[0].message, "isAutoHide=true"); //NO I18N
			    }
			    $req.tags.data = data.tags;
			    if($req.layout.rpanel.indexOf("requester") > -1) {
			    	$req.tags.render();
			    }
			    if(jQuery("#tagPopup").is(":visible")){
			    	$req.tags.loadTagsInPopup();
			    }
			    tagSection.find("#tagsAddNew").show();
			    jQuery("#Req_Det_Tag").text($req.tags.data.length > 0 ? getMessageForKey("sdp.tag.view") : getMessageForKey("sdp.tag.add"));
			},
			error: function(data) { 
            	if(data.responseJSON.response_status.messages[0].message === "JSON_ARRAY_SIZE_OUT_OF_RANGE"){
            		showalert("failure", getMessageForKey("sdp.tag.limit.max"), 'isAutoHide=true');//No I18N
            	}
            	else{
            		showalert("failure", data.responseJSON.response_status.messages[0].message, 'isAutoHide=true');//No I18N
            	}
            } 
		});
	},

	showMoreTags: function(element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		tagSection.find('[data-id="hidden_tags"]').removeClass('hide');//No i18n
		tagSection.find("#showLess").removeClass('hide');//No i18n
		tagSection.find("#showMore").addClass('hide');//No i18n
	},

	showLessTags: function(element){
        var tagSection = jQuery(element).closest("#tagsSection");//No i18n
        tagSection.find('[data-id="hidden_tags"]').addClass('hide');//No i18n
        tagSection.find("#showLess").addClass('hide');//No i18n
        tagSection.find("#showMore").removeClass('hide');//No i18n
    },

	showTaggedRequests: function(tagId, span){
		NewWindow("/ListRequests.do?id="+$req.details.request_info.requester.id+"&popUserDetails=true&mode=edit&filterKey=tags&filterVal="+tagId+"&filterName="+encodeURIComponent(jQuery(span).text()),'ListRequests','975','620','yes','center');
	},

	cancel: function(element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		if(element == null){
			tagSection = jQuery("#request-tag-section").closest("#tagsSection");//No i18n
		}
		tagSection.find("#tag_save").prop('disabled', true);//NO I18N
		tagSection.find("#tags_select").select2("data", []);//NO I18N
		tagSection.find("#tags_edit").addClass('hide'); //No i18n
		tagSection.find("#no_tags").show(); //No i18n
		tagSection.find("#tagsAddNew").show();
	},

	addTag: function(element){
		var tagSection = jQuery(element).closest("#tagsSection");//No i18n
		if(tagSection.length == 0){
			if(jQuery('[aria-describedby="tagPopup"]').is(":visible")){
				tagSection = jQuery("#tagPopup").find("#tagsSection");
			}
			else{
				tagSection = jQuery("#request-tag-section").find("#tagsSection");
			}
		}
		var inputData = [], tagField = tagSection.find(".tags-sel").find(".select2-input");
		//if the value is empty API call will not be triggered
		if(!tagField.val()&&tagField.val().length<1)
		{
			return null;
		}
		//Confirmation alert for adding the new tag
		if(!confirmSubmit(getMessageForKey("sdp.select2.tag.nomatch"))) {
			element.preventDefault();
			return false;
		}
		inputData.push({"name": tagField.val(), "module": {"name": "request"}})
		sdpAjax({
			url: '/api/v3/tags',	//NO I18N
			type: 'POST',	//NO I18N
			data: sdpAjaxInputData({"tags": inputData}), //NO I18N
			success: function(data) {
				if(data.response_status.status == "failed"){
					showalert("failure", data.response_status.messages[0].message, 'isAutoHide=true');//No I18N
				}
				else{
					var tagObj = data.tags, select2Data = tagSection.find("#tags_select").select2("data");//No I18N
					select2Data.push({"text": tagObj.name, "id": tagObj.id});
					//selected search choice will removed as it is added with the id above 
					for (var i = 0; i < select2Data.length; i++) {
						if (select2Data[i].isTag) {
							select2Data.splice(i, 1);
						}
					}
	  				tagSection.find("#tags_select").select2("data", select2Data);//NO I18N
	  				jQuery("#tagNoMatch").remove();
	  				jQuery("#select2-drop").hide();
	  				tagSection.find("#tag_save").prop('disabled', false);//NO I18N
	  				var tagselect2Box = tagSection.find('#tagSel .tags-sel'),  tagselectChoices = tagselect2Box.find('.select2-choices .select2-search-choice');

	  				tagselectChoices.each(function() {
		  				if(jQuery(this).find('div')[0].scrollWidth > tagselect2Box.outerWidth()) {
	  						jQuery(this).css({
								width:tagselect2Box.find('.select2-choices').width() - 46
							}).find("div").attr("class", "text-overflow");
	  					}
	  				});
	  			}
			},
            error: function(data) { 
            	if(data.responseJSON.response_status[0] != null && data.responseJSON.response_status[0].messages[0].status_code == 4008){
            		showalert("failure", getMessageForKey("sdp.tag.already.exist"), 'isAutoHide=true');//No I18N
            	}
            	else{
            		showalert("failure", data.responseJSON.response_status.messages[0].message, 'isAutoHide=true');//No I18N
            	}
				//When a tag POST call is failed the selected option will be removed from the list
				select2Data = tagSection.find("#tags_select").select2("data");//No I18N
				for (var i = 0; i < select2Data.length; i++) {
					if (select2Data[i].isTag) {
						select2Data.splice(i, 1);
					}
				}
				tagSection.find("#tags_select").select2("data", select2Data);//NO I18N
            } 
		});
	},

	openPopup: function(isAddNew){
		jQuery('[aria-describedby="tagPopup"]').remove();
  		jQuery("#tagPopup").dialog({
                modal: true,
                closeOnEscape: true,
                open: function() { 
                	$req.tags.loadTagsInPopup()
                	if($req.tags.data.length == 0){
			  			jQuery("#tagPopup").find("#tagsAddNew").trigger('click');
			  		}
                },
                position: { my: "center center", at: "center center", of: window }, //NO I18N
                width: 500,
                title: getMessageForKey("sdp.header.tags")
            });
  		jQuery('[aria-describedby="tagPopup"]').find(".ui-dialog-titlebar-close").trigger('blur');
	},

	loadTagsInPopup: function(){
		var tagSection = jQuery("#request-tag-section"), tagPopup = jQuery("#tagPopup");
		tagSection.find("#tags_edit").addClass('hide'); //No i18n
		tagSection.find("#no_tags").show(); //No i18n
		tagSection.find("#tagsAddNew").show();
		tagSection.find("#s2id_tags_select").remove();
		var tagSectionHtml = tagSection.html();
        if(tagSectionHtml != null){
        	tagPopup.html(tagSectionHtml);
       	}
        else{
        	$req.tags.setTagSection("#tagPopup"); //No I18N
        }
        tagPopup.find("#tagsSection").attr("class", "form-section pt10 tag-section p10");
        tagPopup.find("#tagsAddNew").attr("style", "color: #1a6ebd;");
        tagPopup.find("#showMore").attr("style", "color: #1a6ebd;");
        tagPopup.find("#tag_save").attr("style", "color:#fff");
        tagPopup.find("#showLess").remove();
        tagPopup.find("#tag_heading").html('<div class="text-overflow w-260px">'+getMessageForKey("sdp.tag.add.info")+'</div>').attr("style", "font-weight: normal;padding-top:5px;");
        $req.details.bindEvents.templates.tag_template("tagPopup"); //No I18N
	}
};
//Tag feature code end