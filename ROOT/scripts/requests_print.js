/* $Id$ */

$req.print = {
	/*
	 * Initializes the print mode of the request and fetches the required data alone
	 */
	init: function(woID) {
		if(typeof reqDataFromApprove !== 'undefined') {
	       if(reqDataFromApprove.response_status && reqDataFromApprove.response_status.status =='warning'){
	         /*
	         This $req.print.init() method will be called for both Approval take action page & Print preview page.
	         In printPreview flow, $req.details.req_warning page will be set while calling $req.details.getRequestInfo method, Where as in approval flow
	         Since the data is provided in reqDataFromApprove variable getRequestInfo method will not be called , Hence setting $req.details.req_warning variable manually here.
	         */
           	  $req.details.req_warning=reqDataFromApprove.response_status.messages && reqDataFromApprove.response_status.messages[0];
           	}
			$req.details.meta_info={ fields: reqDataFromApprove.request_detail.metainfo };
			$req.details.request_info = reqDataFromApprove.request_detail.request;
			$req.details.template_info = reqDataFromApprove.request_detail.request_template;
			if(reqDataFromApprove.is_non_login !== 'undefined' && reqDataFromApprove.is_non_login===true){
                $req.sdp_user.USERTYPE = "Requester"; //No I18N
                $req.sdp_user.ROLES = [];
                $req.details.request_info.description = appendImageToken($req.details.request_info.description, $req.details.request_info.image_token);
			}
			else{
            	$req.details.operational_data.links=$req.details.constructPermissionInfo(reqDataFromApprove.request_detail._links);
            	$req.details.request_metrics = reqDataFromApprove.request_detail.summary ? reqDataFromApprove.request_detail.summary : {};
            	$req.details.setTemplateModule();
            }
		} else {
			/** for non-login approval, approval_key needs to be sent for the authorization */
			if(typeof approval_key !== "undefined" && approval_key) {
				$req.details.getRequestInfo(woID, ["_links", "metainfo", "summary"].concat( window.isMSPOrSCP ? ["self_service_portal"] : [] ));	//No I18N
				$req.details.getTemplate();
			} else {
				$req.details.getRequestInfo(woID, ["_links", "metainfo", "request_template", "requester_detail"].concat( window.isMSPOrSCP ? ["self_service_portal"] : [] ));	//No I18N
			}
	    	$req.details.setTemplateModule();
	    }
    },

    /*
     * Renders the print preview of the request
     */
    render: function() {
    	var printFilterData = {
			"id": woID,	//No I18N
			"user_type": $req.sdp_user.USERTYPE,	//No I18N
			"cost_enabled": $req.details.request_info.total_cost ? true : false	//No I18N
		};
		if(window.isMSPOrSCP) {
			printFilterData.share_request_enabled = sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED;
			printFilterData.can_view_history = $req.details.self_service_portal_settings.can_view_request_history;
		}

		if(!$req.details.custom_variables.isPrintPreview && !$req.details.custom_variables.fromExportPDF && !$req.details.custom_variables.noNeedReqHeader)
		{
		    /* Print preview header */
            renderhbs("#print-header", 'print-preview-header', printFilterData, false, 'requests'); //No I18N

            /* Print preview footer */
            let footerContent = `<button class="btn btn-primary" id="print-footer-btn" >${translate("sdp.common.print")}</button><button class="btn btn-default" id="print-footer-close" >${translate("common.close")}</button>`;  //No I18N
            jQuery("#print-footer").html(footerContent);
			jQuery("#print-footer-btn").off("click").on("click",function(event){$req.print.print();}); // No I18N
			jQuery("#print-footer-close").off("click").on("click",function(event){window.close();}); // No I18N

		}
    },

    /*
     * Removes the unnecessary content from the print preview popup based on the template name passed as argument
     */
    update: function(template) {
    	switch(template) {
    		case 'init': 	// No I18N
    			var links = $req.details.operational_data.links;
    			var reqId = $req.details.request_info.id;
				var siteId = null;
				if($req.details.request_info.site) {
					siteId = $req.details.request_info.site.id;
				}
				var techId = null;
				if($req.details.request_info.technician) {
					techId = $req.details.request_info.technician.id;
				}
				$req.print.update("description");	//No I18N
				$req.print.update("requester_det");	//No I18N

				/* displays the worklog table for only Technician */
				if($req.sdp_user.USERTYPE === "Technician") {
					var worklogURL = "/workorder/RequestCost.jsp?woId="+reqId+"&siteId="+siteId;	//No I18N
					jQuery("#worklogDetails > table").load(worklogURL, function() {	//No I18N
						$req.print.update("worklog");	//No I18N
					});
				} else {
					jQuery("#worklogs-content").remove();	//No I18N
				}

				/* displays the resolution content */
				if(!$req.details.request_info.resolution || $req.details.request_info.resolution.content !== null) {
					var resolURL = "/AddResolution.do?mode=viewWOResolution&module=request&woID="+reqId+"&woMode=printWO";	//No I18N
					jQuery("#resol-content").load(resolURL, function() {
						$req.print.update("resolution");	//No I18N
						bindResolutionEvents(jQuery("#resol-content"));
					});
				}

				/* displays the History content */
				if(!window.isMSPOrSCP || $req.details.self_service_portal_settings.can_view_request_history) {
					// this block is always executed for SDP
				var historyURL = "/common/ViewHistory.jsp?id="+reqId+"&module=requests&key=req_history_sort_order&print_view=true";	//No I18N
				jQuery("#historyDetails").load(historyURL);
				}else{
					// history is hidden based on SSP configuration in MSP/SCP
					jQuery("#history-content").remove();	//No I18N
				}
				
				/* displays the checklists for only Technician */
				if($req.sdp_user.USERTYPE === "Technician") {
					/* displays the Checklists content */
					var checklistsURL = "/common/ChecklistPreview.jsp?id="+reqId+"&module=requests&submodule=checklists";	//No I18N
					jQuery("#checklistsDetails").load(checklistsURL, function() {	//No I18N
					$req.print.update("checklists");	//No I18N
				});
				} else {
					jQuery("#checklists-content").remove();	//No I18N
				}	

				/* displays the timeanalysis for only Technician */
				if(window.WOFrame && $req.sdp_user.USERTYPE === "Technician") {
					/* displays the time_analysis content */
					var time_analysisURL = "/WorkOrder.do?woMode=viewAssessmentHistory&woID="+ reqId;	// No I18N
					/** zohocharts js files are included for time analysis bar before the jsp is getting loaded */
					if(typeof $ZC == 'undefined') {
						ResourceLoader({js:["/scripts/zc_d3.min.js", "/scripts/zc.min.js"]});  // No I18N
					}
					//WOFrame to load time analysis tab will be present only in print preview page
					//SO below code will be need only when WOFrame is available
					if(window.WOFrame){
					window.WOFrame.location.href = time_analysisURL;
					/** JS in the loaded page will move the content to assessDetails element */
					    //SD-107079 : Loaded the TimeAnalysis on Request Print Preview
                        jQuery("#assessDetails").load(time_analysisURL,function(){
					$req.print.update("time_analysis");	//No I18N
                        })
					}
				} else {
					jQuery("#assess-content").remove();	//No I18N
				}				

				/* Binds the onchange event for the filter checkboxes */
				jQuery("#selection-container input[type='checkbox']").on("change", function() {	// No I18N
					$req.print.filter(this);
				});
				/** UI changes based on the request data */
				if($req.sdp_user.USERTYPE !== "Technician") {
					jQuery("#share-req-content").remove();	//No I18N
				} else {
					if(!$req.details.request_info.is_shared) {
						jQuery("#share-req-content .sub-heading").text(" - "+getMessageForKey("sdp.request.noshare.info")).removeClass('hide');
						jQuery("#share-details").remove();
					}
				}
				if(!$req.details.request_info.resolution || !$req.details.request_info.resolution.content) {
					jQuery("#resolution-content .sub-heading").text(" - "+getMessageForKey("request.resolution.notfound")).removeClass('hide');
					jQuery("#resolutionDetails").remove();
				}

				/** Linked Request information for approval page alone */
				if(typeof reqDataFromApprove !== 'undefined' || (typeof approval_key !== "undefined" && approval_key)) {
					if($req.details.request_info.has_linked_requests && links && links.link_requests && links.link_requests.get && $req.details.request_metrics && $req.details.request_metrics.link_request_count) {
						var html = '<span class="control-label">' + getMessageForKey("sdp.requests.view.linkedfrom.linked") + '</span> <a id="linked-req-count" class="ml5 ptr-ev-init" href="/">(' + $req.details.request_metrics.link_request_count + ')</a>'; //No I18N
						jQuery("#linked-request-info").removeClass("hide").html(html);
						jQuery("#linked-req-count").off("click").on("click", function(event){ // No I18N
							zcomponent.stopMethod(this,event);
							showURLInDialog('/RemoveRequestLink.do?removeLink=getLinkedRequests&parentId=' + $req.details.request_info.id + '&fromParent=true&actionFrom=requestapproval',' position=absmiddle, width=1000px, modal=yes, closeOnBodyClick=yes, title=' + getMessageForKey("sdp.requests.view.linkedfrom.linked"));
							return false;
						});
					}
					if($req.details.request_info.linked_to_request && $req.details.request_info.linked_to_request.request) {
						var html ='<span class="control-label">'+getMessageForKey("sdp.requests.view.linkedto.linked")+'</span> <a id="linked-to-req" class="ml5 ptr-ev-init" href="/" title="'+getMessageForKey("sdp.common.subject")+ ' : '+encodeHTMLAttribute( $req.details.request_info.linked_to_request.request.subject )+"\n"+getMessageForKey("sdp.requests.linkrequests.comments")+ ' : '+encodeHTMLAttribute( $req.details.request_info.linked_to_request.link_comments || "" )+'"> #'+$req.details.request_info.linked_to_request.request.id+' </a>'; //No I18N
						jQuery("#linked-request-info").removeClass("hide").html(html);
						jQuery("#linked-to-req").off("click").on("click", function(event){ // No I18N
							zcomponent.stopMethod(this,event);
							$req.details.navigateWO($req.details.request_info.linked_to_request.request.id); return false;
						});
					}
				}
    		break;

    		case 'description': 	// No I18N
    			if($req.details.request_info.is_service_request && ( ($req.resource.resource_info.sections && $req.resource.resource_info.sections.length > 0) || ($req.details.request_info.total_cost)) ) {
    				jQuery("#resource-section").removeClass("hide");
    				$CS.hideUnansweredFields(["resources"]);
    			}
    			zcomponent.collapsible_init('#zcollapse-wodesc'); //No I18N
				jQuery("#desc-header").parents('.zcollapsiblepanel__header').addClass("cur-def ptr-ev-none"); //No I18N
    			jQuery("#desc-actions").remove();
    		break;
    		
    		case 'conversation': 	// No I18N
				jQuery("#conversation-container .content-tabs strong").removeClass("mt1").addClass("mt4");
				jQuery("#conversation-container").find(".content-tabs, .label-primary").css("background", "#f5f5f5");	//No I18N
				jQuery('[data-id="toggle-conv"],[data-id="sort"]').addClass("hide");

				/** hiding conversations / notes based on trimmed details */
				if(trimmed_details) {
					if(trimmed_details.indexOf("conversations") === -1 && trimmed_details.indexOf("notes") === -1) {
						$req.print.filter(jQuery("input[name='conversations']"));
						$req.print.filter(jQuery("input[name='notes']"));
						jQuery("#conversation-container .panel-group > div.label").removeClass("pt5").addClass("print-subcontainer");
					} else if(trimmed_details.indexOf("conversations") === -1) {
						$req.print.filter(jQuery("input[name='conversations']"));
					} else if(trimmed_details.indexOf("notes") === -1) {
						$req.print.filter(jQuery("input[name='notes']"));
					}
				}
				jQuery('z-collapsiblepanel.conversation div.zcollapsiblepanel__header').addClass('ptr-ev-none');
    		break;
    		
    		case 'requester_det': // No I18N
    			var reqDetEle = jQuery("#udTabs ");	// No I18N
    			// reqDetEle.find("> ul > li").remove();
    			reqDetEle.find(".sdtab-content").css({"height": "auto", "overflow-y": "hidden"});	// No I18N
    		break;
    		
    		case 'worklog': // No I18N
    			$req.details.initWOTrash('worklog');	// No I18N
    			jQuery("#worklogDetails > table tr:first").remove();	// No I18N
    		break;

			case 'checklists': // No I18N
    			jQuery("#checklistsDetails div.form-inline:first").remove();	// No I18N
    		break;
			
			case 'time_analysis': // No I18N
    			jQuery("#assessDetails div.form-inline:first").remove();	// No I18N
    		break;
    		
    		case 'share_request': // No I18N
    			jQuery('#share-request .share-edit').remove();	// No I18N
    		break;
    		
    		case 'resolution':	//No I18N
    			if($req.sdp_user.USERTYPE === "Technician" && $req.details.request_info.resolution && $req.details.request_info.resolution.content) {
    				jQuery("#resolution-content").removeClass("print-subcontainer mt30").addClass(".mt10").find(".print-subtitle").remove();
    			}
    		break;
    	}
    },

    toggleConv: function(type) {
    	var not_found = getMessageForKey("sdp.requests.listview.notifications.noconv.title");
    	var has_conv = false;
    	if(type === "conversations") {	//No I18N
    		if(jQuery("#conversation-holder .conv-email, #conversation-holder .conv-system_notification").length > 0) {
    			has_conv = true;
    		}
    	} else if(type === "notes") {	//No I18N
    		if(jQuery("#conversation-holder .conv-notes").length > 0) {
    			has_conv = true;
    		}
    		not_found = getMessageForKey("conversations.nonotes");
    	} else {
    		if($req.details.request_info.has_conversation) {
    			has_conv = true;
    		}
    	}

    	if(!has_conv) {
    		jQuery("#conversation-holder").addClass("hide");
			var no_conv_msg = '<span class="sub-heading text-muted fl mt4 pl30"> - ' + not_found + '</span>';	//No I18N
			jQuery("#conversation-container .panel-group").addClass("print-subcontainer").addClass("hide").parent().removeClass("accordion-timeline");
			jQuery("#conversation-container .label-primary").css({"border": "none"});	//No I18N
			jQuery("#conversation-container .content-tabs").css({"border": "1px solid #d0d0d0"});	//No I18N
			if(jQuery("#conversation-container .content-tabs .sub-heading").length > 0) {
				jQuery("#conversation-container .content-tabs .sub-heading").remove();
			}
			jQuery("#conversation-container .content-tabs").append(no_conv_msg).addClass("font-base");
    	} else {
    		jQuery("#conversation-holder").removeClass("hide");
    		jQuery("#conversation-container .content-tabs").css({"border": "none"});	//No I18N
			jQuery("#conversation-container .label-primary").css({"border": "1px solid #d0d0d0"});	//No I18N
    		jQuery("#conversation-container .panel-group").removeClass("print-subcontainer").removeClass("hide").parent().addClass("accordion-timeline");
    		if(jQuery("#conversation-container .content-tabs .sub-heading").length > 0) {
				jQuery("#conversation-container .content-tabs .sub-heading").remove();
			}
    	}
    },

    /*
     * Applying the filters and show/hide the content based on the selected checkboxes
     */
    filter: function(chk_el) {
    	var chk_name = jQuery(chk_el).attr("name");	//No I18N
		var contentEl = jQuery("#"+chk_name+"-content");	//No I18N
		if(chk_name == "notes") {
			var convEl = jQuery("#conversations-content");	//No I18N
			convEl.finish();	/** To stop the animation before hide / unhide the notes based on filter */
			if(jQuery(chk_el).is(":checked")) {
				jQuery("#conversation-holder .conv-notes").removeClass("hide");
				if(!convEl.is(":visible")) {
					convEl.slideDown(500);
				}
				if(!jQuery("input[name='conversations']").is(":checked")) {
					this.toggleConv("notes");	//No I18N
					convEl.find(".content-tabs > strong").text(getMessageForKey("sdp.common.notes"));	// No I18N
				} else {
					this.toggleConv();
				}
			} else {
				jQuery("#conversation-holder .conv-notes").addClass("hide");
				if(!jQuery("input[name='conversations']").is(":checked")) {
					if(convEl.is(":visible")) {
						convEl.slideUp(500);
					}
				} else {
					this.toggleConv("conversations");	//No I18N
				}
			}
			return;
		}
		if(chk_name == "conversations") {
			var convEl = jQuery("#conversations-content");	//No I18N
			convEl.finish();	/** To stop the animation before hide / unhide the conversations based on filter */
			if(jQuery(chk_el).is(":checked")) {
				convEl.find(".content-tabs > strong").text(getMessageForKey("sdp.requests.viewrequest.conversations"));	// No I18N
				jQuery("#conversation-holder .conv-email, #conversation-holder .conv-system_notification").removeClass("hide");
				if(!convEl.is(":visible")){
					convEl.slideDown(500);
				}
				if(!jQuery("input[name='notes']").is(":checked")) {
					this.toggleConv('conversations');	//No I18N
			} else {
					this.toggleConv();
				}
			} else {
				jQuery("#conversation-holder .conv-email, #conversation-holder .conv-system_notification").addClass("hide");
				if(!jQuery("input[name='notes']").is(":checked")) {
					if(convEl.is(":visible")) {
						convEl.slideUp(500);
					}
				} else {
					this.toggleConv("notes");	//No I18N
					convEl.find(".content-tabs > strong").text(getMessageForKey("sdp.common.notes"));	// No I18N
				}
			}
			return;
		}
		if(jQuery(chk_el).is(":checked")) {
			if(!contentEl.is(":visible")) {
				contentEl.slideDown(500);
			}
		} else {
			if(contentEl.is(":visible")) {
				contentEl.slideUp(500);
			}
		}
    },

    /*
     * Invokes the browser print method to initialize the printing procedure of the current displayed window
     */
    print: function() {
    	jQuery(".non-printable").hide();	//No I18N
		jQuery("#preview-panel").css({"padding-top": "0px", "padding-bottom": "0px"});	//No I18N
		window.print();
		jQuery(".non-printable").show();	//No I18N
		jQuery("#preview-panel").css({"padding-top": "70px", "padding-bottom": "40px"});	//No I18N
    },

    /* hide the sections based the values from trimmed details variable */
    trimViews: function() {
    	var keys = ["request_details","requester_details","share_request","resolution","history","checklists","time_analysis","worklog","conversations","notes","approvals", "cost_details"]; //No I18N
	    var contentIds = ["request-det-content","requester-det-content","share-req-content","resolution-content","history-content","checklists-content","assess-content","worklogs-content","conversations-content","notes","approvals-content","cost-preview-content"]; //No I18N
	    var checkboxIds = ["request-det","requester-det","share-req","resolution","history","checklists","assess","worklogs","conversations","notes","approvals", "cost-preview"]; //No I18N
	    if(trimmed_details) {
	    	for(var k=0;k<keys.length;k++) {
				if(trimmed_details.indexOf(keys[k]) === -1) {
					jQuery("#selection-container input[name="+checkboxIds[k]+"]").prop('checked', false); //No I18N
					if(keys[k] === "conversations" || keys[k] === "notes") {
						continue;
					}
					jQuery("#"+contentIds[k]).hide();
				}
		    }
		    //reorder the sections
		    var selectedSections = trimmed_details.split(",").reverse(); 
			for(i=0;i<selectedSections.length;i++) { 
				contentId = contentIds[keys.indexOf(selectedSections[i])];
				if(contentId) {
					var div = jQ("#"+contentId);
					if(div.length && contentId!="cost-preview-content") {
						div.insertAfter(jQ("#reorderReferenceDiv")); //NO I18N
					}
					jQ("#"+contentId.split("-")[0]+"-checkbox").insertAfter(jQ("#checkboxReorderReferenceDiv"));
				}
			}
	    }
	    jQuery('#content-section').removeClass('hide');
    }
};
