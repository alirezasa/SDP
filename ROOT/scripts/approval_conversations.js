/* $Id$ */

if(typeof $req === "undefined" || !$req) {
	var $req = {};
	/** when loading th request preview inside iframe, the sdp_user has to be fetched from parent scope */
	if(!window.sdp_user) {
		var sdp_user = parent.sdp_user;
	}
	$req.sdp_user = parent.sdp_user;
	$req.winsize_sm = 1420;	/** Minimum window width limit, upto which the left panel will be hidden by default */
}

$req.appr_convos =  {

	conv_reply_data : {},
	clarification_maxlen : 2000,
	reply_maxlen : 500,
	conv_data : {},

	init: function(level,wrapper,isLoadMoreConv) 
	{
		/* Initialize and showing the conversations data .if level id passed this will show the particular level's conversation . else the current levels conversation */

		var self = this;

        var level_index = level? level : approval_level_num ;
        if(!wrapper || wrapper.startsWith("#approval_conversations_"))
        {
        	/* wrapper starting with #approval_conversations_   means it is initing  the conversations from mlacomponent */
        	wrapper = wrapper ? wrapper : '#approval-conversations-wrap'; // No I18N

        	//resetting conversation,replies load more cache data while full re render
        	self.conv_reply_data = {};
        	self.conv_data = {};
        }


        var id = (typeof level_ids != 'undefined' && level_ids ) ? level_ids[level_index-1] ? level_ids[level_index-1] : level : level;  // No I18N

        var nmi_fetch_url = "/api/v3/approval_clarifications"; // No I18N
        var filterData = jQuery("#approverFilter").select2("data"); // No I18N

        if(typeof auth_key != 'undefined')
        {
        	nmi_fetch_url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=clarification_entity_get&key="+auth_key; // No I18N
        	if(!filterData || !filterData.length)
			{
				nmi_fetch_url += "&approval_level_id="+id; // No I18N
			}
        }

        var lInfo = self.constructListInfo(filterData);

        if(isLoadMoreConv && !filterData.length)
        {
        	//for loading more conversation from the previous loaded conversations index
        	var obj = $req.appr_convos.conv_data[level_index];
	    	if(!obj)
	    	{
	    		$req.appr_convos.conv_data[level_index] ={"index":0};
	    		obj = $req.appr_convos.conv_data[level_index];
	    	}
	    	var start_index = !obj.index ? 0 : parseInt(obj.index) + 1 ;
	    	lInfo.start_index = start_index;
        }	

        var data = {"list_info":lInfo}; // No I18N

        if(typeof auth_key == "undefined")
        {
        	data = {"for":"entity_clarifications","list_info":lInfo,"entity":{"request":{"id":request_id}},"approval_level":{"id":id},"include":["image_token"]}; // No I18N
        }
        else
        {
        	/* for fetchinng non-login profiles image-token in clarification */
        	data.include=['image_token']; // No I18N	
        }

        var  filterLength = lInfo.search_criteria.length;
        if(filterLength)
        {
        	//deleteing the approvel level filter if any search criteria applied
        	delete data.approval_level;
        }

        sdpAjax({
            url : nmi_fetch_url,
            data : sdpAjaxInputData(data),
            beforeSend : function()
            {	
            	if(!isLoadMoreConv)
            	{
            		jQuery("#conv-content").val("");
					jQuery('[name="COMMENTS"]').val("");

	            	if(!level)
	            	{
	            		//removing the loaded previous conversations if any filters applied
	            		jQuery("[prev-con-elem]").remove();
	            	}

	            	jQuery(wrapper).fadeOut();
	            	// jQuery(wrapper).html("");

            	}
            },
            success : function(resp)
            {			  	
            	jQuery("[approval-act-btn=true]").attr("disabled",true);
			  	resp.clarifications = resp.clarifications ? resp.clarifications : resp.approval_clarifications;
			  	var index = resp.clarifications.length;
			  	if(index > 0)
			  	{
			  		var clarification1 = resp.clarifications[0];
			  		if(clarification1 && clarification1.approval && clarification1.approval.approval_level && clarification1.approval.approval_level.request && clarification1.approval.approval_level.request.approval_status) 
			  		{	
			  			var currentStatus = clarification1.approval.approval_level.request.approval_status.id;
			  			var existingStatus = $req.details.request_info.approval_status.id;
			  			if(currentStatus != existingStatus)
			  			{
			  				var iFrame = $extFrame.getActiveWindow(false, {getParentFrame: true});
			  				if(iFrame && iFrame.src)
			  				{
			  					iFrame.src = iFrame.src;
			  				}
			  				else
			  				{
			  					// for reloading page when status changee happened in a browser popup 
			  					window.location.reload();
			  				}
			  				
			  			}
			  		}
			  	}

			  	if(!$req.appr_convos.conv_data[level_index])
	        	{
	        		$req.appr_convos.conv_data[level_index] = {"index" : 0};
	        	}
	        	
	        	if(!level && index > 0 && !filterData.length)
	        	{
	        		//means the current/final level clarifications 
	        		jQuery("#clarification-banner").fadeIn();
	        		//to set the approval footer height
					var height = jQuery("#right-scroll-content").height();
					jQuery("#right-scroll-content").height((height - 30) + "px"); // No I18N
	        	}

	        	//for caching the pagination conversations loaded in level 
	        	if(isLoadMoreConv && level)
	        	{
	        		index = $req.appr_convos.conv_data[level_index].index + resp.clarifications.length;
	        	}
	        	$req.appr_convos.conv_data[level_index].index = index;

			  	if(!isLoadMoreConv)
			  	{
			  		if(level)
				  	{
				  		resp.clarifications.prev_app_level = level_index;	
				  		if(self.clarifications)
				  		{
				  			resp.clarifications.approval_level_num = self.clarifications.approval_level_num;			  		
				  			self.clarifications.prev_app_level = level_index;				  		
				  		}			  		
				  	}
				  	else
				  	{
				  		self.clarifications = resp.clarifications;
				  		self.clarifications.request_id = request_id;
				  		if(typeof approval_level_num != "undefined")
				  		{
				  			self.clarifications.approval_level_num = approval_level_num;
				  		}
				  		self.clarifications.prev_app_level = level_index;
				  	}
			  	}
			  	

			  	var groupedData = self.groupByLevel(resp.clarifications);
			  	var json = {};
			  	json.list_info = resp.list_info;
			  	json.conversations = groupedData;
			  	json.level_index = level_index;
			  	var levelDetails = (typeof level_names != 'undefined' && level_index ) ? level_names[level_index-1] : {};  // No I18N
			  	json.level_name=(levelDetails == null) ? '' : levelDetails.name;
			  	json.filterLength =  filterLength;			  	
			  	
			  	json.hide_prev_approval = (!self.clarifications || self.clarifications.prev_app_level) == 1 ? true : false ;
			  	json.loggedin_user = typeof approverId != "undefined" ? approverId : sdp_user.LOGGEDIN_USERID+""; // NO I18N
			  	json.authKeyPresent = typeof auth_key  != "undefined" ; // No I18N
				json.hide_new_clarification = ($req.details.request_info.approval_status.name == "Pending Approval") ? false : true ; // No I18N
				json.is_readonly = (typeof readOnlyMode != "undefined" && readOnlyMode) ? true : false; // NO I18N

				//Getting approval configurations
                const default_approval_configurations = { "approval_configurations": { "approval_clarification": { "enable_resolved": "false" } } };// No I18N
                self.approval_configurations = default_approval_configurations;
                //SD-117777, getting approval_configuration when LOGGEDIN_USERID is available.
                if(sdp_user.LOGGEDIN_USERID != undefined) {
                    sdpAjax({
                        url: "/api/v3/approval_configurations", //NO I18N
                        data: sdpAjaxInputData({ list_info: { row_count: 25 } }),
                        success: function (response) {
                            const { approval_configurations } = response;
                            self.approval_configurations = approval_configurations;
                        }
                    });
                }

				if(typeof requester_id != "undefined")
			  	{
			  		json.requester_id = requester_id;
			  	}

			  	if(typeof isApprover != "undefined")
			  	{
			  		json.isApprover = isApprover;
			  	}

			  	if(typeof approval_level_num != "undefined")
			  	{
			  		json.approval_level_num = approval_level_num;	
			  	}

			  	if(isLoadMoreConv)
			  	{
					renderhbs(wrapper,"approval-clarifications",json,true,"approval",false, false); // NO I18N
			        setTimeout(function()
			        {
			        	var last_reply=jQuery(wrapper).children().last()[0];
			        	if(last_reply)
			        	{
			        		last_reply.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // NO I18N
			        	}
			        },100);
			  	}
			  	else
			  	{
			  		if(typeof approval_level_num != "undefined" || resp.clarifications.length)
			  		{
			  			renderhbs( wrapper,'approval-stage-conversations', json,false,'approval',null,null,function()  // NO I18N	
			  			{
			  				if(self.clarifications && self.clarifications.prev_app_level <= 1)
			  				{
			  					//removing if all the previous conversation section has been rendered

			  					jQuery("[is-prev-conv]").remove();
			  				}

			  				// animating based on the previous conversatio actions
			  				if(wrapper == '#approval-conversations-wrap')
			  				{
			  					jQuery(wrapper).fadeIn();
			  				}
			  				else
			  				{
			  					jQuery(wrapper).slideDown();
			  				}

			  				// initializing jquery tool tip for the conversation section
			  				initTooltip("#approval-conversations-wrap"); // NO I18N	
			  				
			  			});

			  			var url = typeof auth_key != "undefined" ?  "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=get_approvers_having_clarifications&key="+auth_key : "/api/v3/approval_clarifications/_get_approvers_having_clarifications" ; //NO I18N
			      		var select2_attr = {
		                    url:url,
		                    field:'approver',//NO I18N
		                    search_field : "approval.approver.name",//NO I18N
		                    input_fields: {"entity" : { "request": { "id": request_id }} }, // No I18N
		                    processResults: function(search_data, data, field,settings) {

			                    search_data.push({
			                        id: data.id,
			                        text: data.text ? data.text : data.name
			                    });    
			              	}
		                }

		                if(typeof auth_key != "undefined")
		                {
		                	delete select2_attr.input_fields;
		                }

					  	jQuery("#approverFilter").sdp_select2({
		                  cache:false,
		                  multiple:true,
		                  width : 250,
		                  placeholder: translate("sdp.common.select") + " " + translate("approval.approvers"),  // No I18N
		                  allowClear: true,
		                  formatResult : function(obj){
			      			return e_html(obj.text);
			      		  },
		                  url:[select2_attr]
		                });

		                if(filterData && filterData.length)
		                {
		                	setTimeout(function()
		                	{
		                		$req.appr_convos.applied_filter = filterData;
		                		jQuery("#approverFilter").select2("data",filterData); // No I18N
		                	},1);
		                }
		                else
		                {
		                	delete $req.appr_convos.applied_filter;
		                }
			  		}
			  	}

            }
                
        });
	},
	toggleNewNMC : function(close,e)
	{			
		if(e){
			e.stopPropagation();
		}
		/* Show/Hide the conversation input box */

		var level_num = $req.appr_convos.clarifications ? $req.appr_convos.clarifications.approval_level_num : 0;
		var conversations = jQuery("#stage"+level_num+" #req-tech-conversations-"+level_num);
		var elem = conversations.children().first();
		
		var self = this;

		jQuery("#clarification-resolve-wrapper").hide();
		if(close)
		{	
			jQuery("#new-clarification-wrap").slideUp(100, function() {
			    jQuery("#new-clarification-wrap").insertBefore(elem);

				var data = jQuery("#conv-action").data();
				if(data.action == "edit")
				{	
					var attr = "approval-comment-id"; // No I18N
					var selector_id = self.current_reply_comment;
					if(data.action_module == "reply")
					{
						attr = "approval-reply-id"; // No I18N
						selector_id = self.current_reply_id;
					}

					 jQuery('['+attr+'='+selector_id+']').slideDown();
				}
			}); 

			jQuery("[action-btn]").show();
		}
		else
		{
			jQuery("#new-clarification-wrap").insertBefore(elem);
			jQuery("#new-clarification-wrap").slideDown(100 , function()
			{
				jQuery("#conv-content").focus();
				jQuery("#new-clarification-wrap")[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // No I18N
			});	

			var btn = jQuery("#conv-action");
			jQuery(btn).text(translate('api.approval.add.clarification')); // No I18N
			jQuery("#conv-content").attr("placeholder",translate('api.approval.add.clarification')); // No I18N
			//Modifying maxlength value to 2000 while adding new clarification.
			jQuery("#conv-content").attr("maxlength", $req.appr_convos.clarification_maxlen);
			jQuery('#maxlen-comp-error').text(translate('form.character.maximumlength.alert', [$req.appr_convos.clarification_maxlen]));
			jQuery(btn).attr("disabled",true); // No I18N
			jQuery("#conv-content").off('input').on('input',function(e) // No I18N
			{
			  var len = e.target.value.length;
			  var isDisable = len ? false : true;
			  jQuery(btn).attr("disabled",isDisable)
			  if(len>=$req.appr_convos.clarification_maxlen){
					jQuery("#maxlen-comp-error").removeClass("hide");// No I18N
			  }
			  else{
					jQuery("#maxlen-comp-error").addClass("hide");// No I18N
			  }
			});

			jQuery("#is-clarification-resolved").off("change").on("change",function(){ // No I18N
				jQuery(btn).removeAttr("disabled")
			});
		}
		var accordion = jQuery('[data-target="#stage'+level_num+'"]')
		if(accordion.hasClass("collapsed"))
		{
			accordion.click();
		}

		setTimeout(function()
		{
			self.current_reply_comment && delete self.current_reply_comment;
			self.current_reply_approval_id && delete self.current_reply_approval_id;
			self.current_reply_id && delete self.current_reply_id;
			self.resetBtn();

		},200)
	},

	editClarification : function(comment_id,apprvl_id)
	{
		/* Show/Hide the particular conversation edit input box */

		var attr = 'approval-comment-id'; // No I18N
		var value = jQuery('['+attr+'='+comment_id+'] [comment-disp]').attr("comment-value");
		jQuery('['+attr+'='+comment_id+']').slideUp();
		jQuery("#clarification-resolve-wrapper").hide();
		jQuery("[action-btn]").hide();
		//Modifying maxlength value to 2000 while editing a clarification.
		jQuery("#conv-content").attr("maxlength", $req.appr_convos.clarification_maxlen);
		jQuery('#maxlen-comp-error').text(translate('form.character.maximumlength.alert', [$req.appr_convos.clarification_maxlen]));
		this.openReplyComment(comment_id,apprvl_id,true,false,null,value+"");
	},

	editReply : function(comment_id,apprvl_id,reply_id)
	{
		/* Show/Hide the particular reply edit input box */

		var attr = 'approval-reply-id'; // No I18N
		var value = jQuery('['+attr+'='+reply_id+'] [reply-disp]').attr("reply-value");
		jQuery('['+attr+'='+reply_id+']').slideUp();
		jQuery("#clarification-resolve-wrapper").show();
		jQuery("[action-btn]").hide();
		//Modifying maxlength value to 500 while editing a reply.
		jQuery("#conv-content").attr("maxlength", $req.appr_convos.reply_maxlen);
		jQuery('#maxlen-comp-error').text(translate('form.character.maximumlength.alert', [$req.appr_convos.reply_maxlen]));
		this.openReplyComment(comment_id,apprvl_id,true,true,reply_id,value+"");
	},

	resetBtn : function()
	{
		/* resetting the actions on the input */

		jQuery("#conv-action").removeData("action"); // No I18N
		jQuery("#conv-action").removeData("action_module"); // No I18N
		jQuery("#conv-content").val("");
		//hiding the error info
		jQuery("#maxlen-comp-error").addClass("hide");//No I18N
	},

	openReplyComment : function(comment_id,apprvl_id,isEditMode,isReplyEdit,reply_id,valueEdited)
	{
		/* Open the paritcular comment's reply widget */

		var attr = 'approval-comment-id'; // No I18N
		var selector_id = comment_id;
		if(isReplyEdit && reply_id)
		{
			attr = 'approval-reply-id'; // No I18N
			selector_id = reply_id;
			$req.appr_convos.current_reply_id = reply_id;
		}

		$req.appr_convos.isEditMode = isEditMode;
		$req.appr_convos.isReplyEdit = isReplyEdit;

		this.resetBtn();

		if(comment_id && apprvl_id)
		{
			$req.appr_convos.current_reply_comment = comment_id;
			$req.appr_convos.current_reply_approval_id = apprvl_id;
			var elem = jQuery('['+attr+'='+selector_id+']');
			jQuery("#new-clarification-wrap").insertAfter(elem);
			jQuery("#new-clarification-wrap").slideDown(100 , function()
			{
				jQuery("#new-clarification-wrap")[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // NO I18N		
			});			

			var btn = jQuery("#conv-action");

			var  buttonText = translate('common.add') + " " + translate('sdp.requests.viewrequest.emailrequester'); // No I18N
			var action = "add"; // No I18N
			if(isEditMode)
			{
				buttonText = translate("api.approval.clarification.edit"); // No I18N	
				// action module denotes the editing action whether on clarification or reply
				var action_module = "clarification"; // No I18N
				if(isReplyEdit)
				{
					buttonText =  translate("api.approval.clarification.reply.edit"); // No I18N	
					action_module = "reply"; // No I18N	
				}

				jQuery(btn).data("action_module",action_module); // No I18N

				action = "edit"; // No I18N
				if(valueEdited && valueEdited.length)
				{
					jQuery("#conv-content").val(valueEdited);
					if((isReplyEdit && valueEdited.length>=$req.appr_convos.reply_maxlen) || valueEdited.length>=$req.appr_convos.clarification_maxlen){
						jQuery("#maxlen-comp-error").removeClass("hide");//No I18N
					}
				}
				
			}
			else
			{
				jQuery("#clarification-resolve-wrapper").show();
				//Modifying maxlength value to 500 while adding a reply.
				jQuery("#conv-content").attr("maxlength", $req.appr_convos.reply_maxlen);
				jQuery('#maxlen-comp-error').text(translate('form.character.maximumlength.alert', [$req.appr_convos.reply_maxlen]));
			}


			var checked = false;
			if(jQuery("[resolved-comment="+comment_id+"]").length)
			{
				checked = true;
			}
			jQuery("#is-clarification-resolved").prop("checked", checked); // No I18N	

			jQuery(btn).data("action",action); // No I18N
			jQuery(btn).text(buttonText);
			jQuery("#conv-content").attr("placeholder",buttonText); // No I18N
			jQuery(btn).attr("disabled",true); // No I18N
			
			var old_val = jQuery("#conv-content").val();
			jQuery("#conv-content").off('input').on('input',function(e) // No I18N
			{
			  var len = e.target.value.length;
			  var isDisable = len ? false : true;
			  if(old_val != jQuery("#conv-content").val().trim())
			  {
			  		jQuery(btn).attr("disabled",isDisable);
			  }
			  else
			  {
			  		jQuery(btn).attr("disabled",true);	
			  }
			  var maxlen = $req.appr_convos.reply_maxlen;
			  if($req.appr_convos.isEditMode && !$req.appr_convos.isReplyEdit){
			  		maxlen = $req.appr_convos.clarification_maxlen;
			  }
			  if(len>=maxlen){
					jQuery("#maxlen-comp-error").removeClass("hide");// No I18N
			  }
			  else{
					jQuery("#maxlen-comp-error").addClass("hide");// No I18N
			  }
			});

			jQuery("#is-clarification-resolved").off("change").on("change",function(){ // No I18N
				if(old_val != jQuery("#conv-content").val().trim())
				{
					jQuery(btn).removeAttr("disabled")	
				}
				else
				{
					jQuery(btn).attr("disabled",true);	
				}
				
			});
			setTimeout(function() {
			    jQuery("#conv-content").focus();
			}, 0);

		}

		//For approval_configuration to resolve clarifications by default
		var default_clar_resolved = window.$req.appr_convos.approval_configurations.approval_clarification.enable_resolved;
		var clarifications = window.$req.appr_convos.clarifications;
		const clarOwner = clarifications.find(function(clarification) {
			return clarification.id === comment_id.toString();
		}) || {};
		const clar_owner_id = clarOwner.created_by && clarOwner.created_by.id;

		if(clar_owner_id !== sdp_user.LOGGEDIN_USERID.toString()){ //This approval configuration is not applied for the owner of the clarification
			var isClarResolved = default_clar_resolved === "true";
			jQuery("#is-clarification-resolved").prop('checked', isClarResolved); //No I18N
		}

	},

	addOrReplyClarification : function()
	{
		/* adding or replying the conversation based on the user action */

		var self = this;
		var comment_id = self.current_reply_comment;
		var appr_id = self.current_reply_approval_id;

		var data = jQuery("#conv-action").data();
		if(data.action == "edit")
		{
			var reply_id = self.current_reply_id;
			if(data.action_module == "clarification")
			{
				self.addOrEditClarification(true);
			}
			else if(data.action_module == "reply")
			{
				self.addOrEditReply(comment_id,appr_id,true);
			}
		}
		else
		{
			if(comment_id)
			{
				self.addOrEditReply(comment_id,appr_id);
			}
			else
			{
				self.addOrEditClarification();
			}
		}
	},


	resolveClarification : function(comment_id,appr_id,mark_as_unresolved)
	{
		/* move status to resolve/unresolve for clarification  */

		var self = this;		
		var operation = mark_as_unresolved ? "clarification_mark_as_pending" : "clarification_mark_as_resolved"; // No I18N
		if(typeof auth_key == "undefined")
		{
			var url = "/api/v3/requests/"+request_id+"/approval_levels/"+approval_level_id+"/approvals/"+appr_id+"/clarifications/"+comment_id; // No I18N
			url = mark_as_unresolved ? url + "/_mark_as_pending" : url + "/_mark_as_resolved"; // No I18N
		}
		else
		{
			var url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation="+operation+"&approval_clarification_id="+comment_id+"&key="+auth_key; // No I18N
		}
		
        sdpAjax({
            url : url,
            type : "PUT", // No I18N
            success : function(resp)
            {
                self.init();
                self.updateBannerCount(approval_level_id);
            }
        });

	},

	renderReplies : function(comment_id,resp,scrollToLatest)
	{
		/* rendering the replies based on the clarificatiton */

		jQuery("#conv-content").val("");
		jQuery('[name="COMMENTS"]').val("");

		var wrapper = "#approval-clarification-"+comment_id; // No I18N
		var html = renderhbs(wrapper, "approval-conversation-replies", resp, false, "approval",false, false, null, true); //NO I18N
		if(resp.isLatestReply)
		{
			jQuery(wrapper).prepend(html);
		}
		else
		{
			jQuery(wrapper).append(html);
		}
		$sdEventListener(jQuery(wrapper));
        jQuery(wrapper).slideDown(200);	

        this.toggleNewNMC(true);

        setTimeout(function()
        {
        	if(!$req.appr_convos.conv_reply_data[comment_id])
        	{
        		$req.appr_convos.conv_reply_data[comment_id] = {"index" : 0};
        	}

        	$req.appr_convos.conv_reply_data[comment_id].index += resp.replies.length;

        	var recent_reply=scrollToLatest ? jQuery(wrapper).children().first()[0] : jQuery(wrapper).children().last()[0];
        	if(recent_reply)
        	{
        		setTimeout(function()
        		{
        			recent_reply.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // NO I18N
        		},1);
        		
        	}
        },100);
	},

	addOrEditReply : function(comment_id,appr_id,isEditMode)
	{
		/* add or edit the conversation's reply */

		var self = this;

		var resolveStatusChanged = jQuery("#is-clarification-resolved").is(":checked"); // No I18N

		var mark_as_unresolved = false;
		if(jQuery("[resolved-comment="+comment_id+"]").length)
		{
			mark_as_unresolved = true;
			resolveStatusChanged = !jQuery("#is-clarification-resolved").is(":checked"); // No I18N
		}

		var conv_content = jQuery("#conv-content") .val();

		conv_content = conv_content ? conv_content.trim() : "" ;

		var execute = function()
		{
	        if(conv_content && conv_content.length)
	        {
	        	if(conv_content.length > 500)
	        	{
	        		showalert('failure', translate('api.approval.clarification.info.lengthexceed'),'isAutoHide=true,closeOnEscKey=yes,width=450,height=80');// No I18N
	        	}

	        	if(typeof auth_key == "undefined")
	        	{
	        		var nmi_url = "/api/v3/requests/"+request_id+"/approval_levels/"+approval_level_id+"/approvals/"+appr_id+"/clarifications/"+comment_id+"/_reply"; // No I18N
	        	}
	        	else
	        	{
	        		var nmi_url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=clarification_reply&key="+auth_key+"&approval_clarification_id="+comment_id; // No I18N
	        	}
	            

	            if(isEditMode)
	            {
	            	if(self.current_reply_comment)
	            	{
	            		if(typeof auth_key == "undefined")
	            		{
	            			nmi_url = "/api/v3/requests/"+request_id+"/approval_levels/"+approval_level_id+"/approvals/"+appr_id+"/clarifications/"+self.current_reply_id; // No I18N
	            		}
	            		else
	            		{
	            			nmi_url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=clarification_update&approval_clarification_id="+self.current_reply_id+"&key="+auth_key; // No I18N
	            		}
	            	}
	            	
	            }

	            var data_input = { "clarification": { "content": conv_content } } // No I18N

	            sdpAjax({
	                url : nmi_url,
	                type : (isEditMode ? "PUT" : "POST"), // No I18N
	                data : sdpAjaxInputData(data_input),
	                beforeSend : function()
	                {
	                	jQuery("#conv-action").attr("disabled",true); // No I18N
	                },
	                success : function(resp)
	                {
	                	jQuery("#conv-action").removeAttr("disabled");

	                    showalert('success',''+translate('api.approval.clarification.reply.'+ (isEditMode ? 'update' : 'add'))+'','isAutoHide=true,width:auto,delay=3'); // No I18N

	                    //removing clarification edit whenever a reply presents for clarification
	                    jQuery('[edit-comment='+comment_id+']').remove();

	                    if(resolveStatusChanged)
	                    {
	                    	self.resolveClarification(comment_id,appr_id,mark_as_unresolved);
	                    }
	                    else
	                    {
	                    	// self.init();
	                    	var json = {};
	                    	json.replies = [resp.clarification];
	                    	json.loggedin_user = typeof approverId != "undefined" ? approverId : sdp_user.LOGGEDIN_USERID+""; // NO I18N
	                    	json.comment_id = comment_id;
			                json.approval_id = appr_id;
			                json.approval_level_id = approval_level_id;
			                if(typeof approval_level_num == "undefined" || (typeof readOnlyMode != "undefined" && readOnlyMode) )
			                {
			                	resp.is_readonly = true;
			                }
			                json.isLatestReply = true;
			                //removing old latest reply edit buttons
			                jQuery('[approval-comment-id="'+comment_id+'"] [edit-reply]').remove();	
			                if(isEditMode)
			                {
			                	jQuery('[approval-reply-id="'+self.current_reply_id+'"]').remove();
			                }
			                
	                    	self.renderReplies(comment_id,json,true);
	                    }
	                }
	            });
	        } 
	        else
	        {
	            showalert('failure', translate('sdp.project.gantt.actionattribute.addcomments'),'isAutoHide=true,closeOnEscKey=yes,width=450,height=80');// No I18N
	        }  
		}

		if(resolveStatusChanged)
		{
			var title = 'common.confirm'; //NO I18N
			title = translate(title);

			var message = mark_as_unresolved ? 'api.approval.clarification.confirm.pending' : 'api.approval.clarification.confirm.resolved'; //NO I18N
			message = translate(message);

			$req.appr_convos.showClarificationAlert(title,message,execute);
		}
		else
		{
			execute();
		}
		
	},

	showClarificationAlert : function(title,message,callback)
	{
		/* showing freeze alet confirmation box */

		var self = this;
		var json = {title : title , message : message};
		var html = renderhbs(null, "clarification-confirm-alert", json, false, "approval", false, false, null, true); //NO I18N

		var blurSection = document.getElementById("conversation-dialog");
		var doc = document;
		if(!blurSection)
		{
			var iFrame = $extFrame.getActiveWindow(false, {getParentFrame: true});
			var iWindow = iFrame.contentWindow;
			doc = iWindow.document;
			blurSection = doc.getElementById("conversation-dialog");
		}
		
		jQuery(html).insertBefore(blurSection);

		var confirmBtn = doc.getElementById("btn-clarification-confirm");
		var cancelBtn = doc.getElementById("btn-clarification-cancel");

		jQuery(confirmBtn).focus();
		jQuery(confirmBtn).off("click").on("click",function() // NO I18N
		{
			if(callback)
			{
				callback();
			}
			setTimeout(function()
			{
				jQuery(doc.getElementById("clarification-alert")).remove();
				jQuery(blurSection).removeClass('ptr-ev-none blur-5');
			},1);
		});

		jQuery(cancelBtn).off("click").on("click",function() // NO I18N
		{
			jQuery(doc.getElementById("clarification-alert")).remove();
			jQuery(blurSection).removeClass('ptr-ev-none blur-5');
		});

		jQuery(blurSection).addClass('ptr-ev-none blur-5');
	},

	cancelClarficationAlert:function()
	{
		/* hiding freeze alet confirmation box */

		jQuery('#freeze-dialog-blur').removeClass('ptr-ev-none blur-5');
		// this.confirmClarficationCallback=callback;
	},

	updateBannerCount : function(approval_level_id)
	{	
		/* updates the count for the clarificatios pending/approved in the top of the approval page */

		if(typeof auth_key != "undefined")
		{
			var url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=clarification_entity_total_count&approval_level_id="+approval_level_id+"&key="+auth_key; // No I18N
			var data = {"list_info": {"search_criteria": [{'field': 'is_resolved', 'value': false, 'condition': 'is'} ]}}; // No I18N
		}
		else
		{
			var url = "/api/v3/approval_clarifications/_total_count"; // No I18N
			var data = {"for": "entity_clarifications","entity": {"request": {"id": request_id}},"approval_level": {"id": approval_level_id},"list_info": {"get_total_count": true, "search_criteria": [{'field': 'is_resolved', 'value': false, 'condition': 'is'} ]}};  // No I18N
		}

		
		sdpAjax({
	        url : url,
	        type : "GET", // No I18N
	        data : sdpAjaxInputData(data),
	        success : function(resp)
	        {
	        	if(resp && resp._total_count)
	        	{
	        		var count  = resp._total_count.approval_clarifications ? resp._total_count.approval_clarifications : 0;
	        		if(count)
	        		{
	        			if(typeof auth_key != "undefined")
						{
							//updating the pending count in approver page
							jQuery("#pending-banner").text(count + " " + translate("api.approval.clarification.status.name.plural"));
						}
						else
						{
							//updating the pending count in requester page
							var iFrame = $extFrame.getActiveWindow(false, {getParentFrame: true});
							var iWindow = iFrame && iFrame.contentWindow;
							var doc = iWindow && iWindow.document;
							var elem = doc && doc.getElementById("requester-pending-cl-count-"+request_id)
							if(elem)
							{
								elem.textContent = count +" " + translate("api.approval.clarification.needed")
							}
						}	        			
	        		}
	        	}
	        }
	    });	
	},

	addOrEditClarification:function(isEditMode,formObj) 
	{
		/* add/edit the users clarification */

		var self = this;
		var conv_content = jQuery("#conv-content") .val();

		if(formObj)
		{
			//passed from Approve page
			conv_content = formObj.COMMENTS.value ;
		}

		conv_content = conv_content ? conv_content.trim() : "" ;

        if(conv_content && conv_content.length)
        {
        	if(conv_content.length > $req.appr_convos.clarification_maxlen)
	        {
	        	var args = [];
				args[0] = getMessageForKey('common.comments'); //No I18N
				args[1] = $req.appr_convos.clarification_maxlen;
				var infoToBeShown = translate('sdp.app.common.maxlength.characters',args);
				showalert('failure','<b>'+infoToBeShown+'</b>','width:auto,delay=3'); // No I18N
	            return;
	        }

            var operation = isEditMode ? "clarification_update" : "clarification_add"; // No I18N
            var nmi_url = '/servlets/ApprovalServlet?module=request&module_id='+request_id+'&operation='+operation+'&key='+auth_key; // No I18N

            var addNMI = function()
        	{
        		var data_input = { "clarification": { "content": conv_content, "users": [ { "id": requester_id } ] } } // No I18N

	            sdpAjax({
	                url : nmi_url,
	                type : (isEditMode ? "PUT" : "POST"), // No I18N
	                data : sdpAjaxInputData(data_input),
	                beforeSend:function()
	                {
	                	jQuery("#conv-action,#nmi-submit").attr("disabled",true); // No I18N
	                },
	                success : function(resp)
	                {
	                	jQuery("#conv-action,#nmi-submit").attr("disabled",false); // No I18N 

	                    if(isEditMode)
	                    {
	                    	var updated_value = resp && resp.clarification ? resp.clarification.content : "" ; // No I18N
	                    	jQuery('[approval-comment-id='+self.current_reply_comment+'] [comment-disp]').text(updated_value); // No I18N
	                    	jQuery('[approval-comment-id='+self.current_reply_comment+'] [comment-disp]').attr('comment-value',updated_value); // No I18N
	                    	self.toggleNewNMC(true);

	                    	showalert('success',''+translate('api.approval.clarification.operation.update')+'','isAutoHide=true,width:auto,delay=3'); // No I18N
	                    }
	                    else
	                    {
	                    	showalert('success',''+translate('api.approval.clarification.operation.add')+'','isAutoHide=true,width:auto,delay=3'); // No I18N
	                    	self.init();
	                    	self.updateBannerCount(approval_level_id);	
	                    }
	                    
	                    // window.top.$previewComponent.closePreview("preview_approval_wrapper");// No I18N
	                }
	            });
        	}

            if(isEditMode)
            {
            	if(self.current_reply_comment)
            	{
            		nmi_url += "&approval_clarification_id="+self.current_reply_comment; // No I18N
            	}
            	
            	addNMI();
            }
            else
            {
            	if($req.details.request_info.approval_status.name == "Pending Approval")
		        {
		            var message = translate('api.approval.clarification.warn.firstclarification'); // No I18N
		            var title = translate("sdp.approve.needclarification");
		            showconfirm(true,'title=' + title + ', message=' + message + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("sdp.common.back") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
		                if(save) {
		                    addNMI();
		                }
		            });
		        }
		        else
		        {
		            addNMI();
		        }
            }
        } 
        else
        {
        	if(formObj)
        	{
        		var infoToBeShown = translate('sdp.project.gantt.actionattribute.addcomments');
				toggleInfoAlert(infoToBeShown,formObj.COMMENTS,true);
				formObj.COMMENTS.value = '';
				formObj.COMMENTS.focus();
        	}
        	else
        	{
            	showalert('failure', translate('sdp.project.gantt.actionattribute.addcomments'),'isAutoHide=true,closeOnEscKey=yes,width=450,height=80');// No I18N
            }
        }
        jQuery("#maxlen-error").addClass("hide");// No I18N
    },

    loadPreviousConversations : function()
    {
    	/* Load the current stage's previous stage conversations */

    	var self = this;

    	var current_level = 1;
    	var previous_level = 0;

    	if(self.clarifications && self.clarifications.prev_app_level && self.clarifications.prev_app_level > 1 )
		{
			current_level = self.clarifications.prev_app_level;
			previous_level = self.clarifications.prev_app_level - 1;
		}

    	if(previous_level)
    	{
    		var wrapper = 'approval-conversations-wrap-'+previous_level; // No I18N
    		// var elem = jQuery("#approval-conversations-wrap-"+current_level).length ? jQuery("#approval-conversations-wrap-"+current_level) : jQuery("#approval-conversations-wrap");

    		jQuery("#approval-conv-details").prepend('<div id="'+wrapper+'" class="pos-rel disp-h" prev-con-elem=true></div>');
    		// jQuery('<div id="'+wrapper+'" class="pos-rel" prev-con-elem=true></div>').insertAfter(jQuery("[is-prev-conv]"));
    		// jQuery("[is-conv-filter]").remove();
    		// jQuery("[is-prev-conv]").remove();
    		self.init(previous_level,"#"+wrapper);
    	}
    },

    loadMoreReplies : function(approval_level_id,comment_id,approval_id)
    {
    	/* For the first set we have loaded 5 replies . loading more replies based on the user enquiry */

    	var self = this;
    	var obj = $req.appr_convos.conv_reply_data[comment_id];
    	if(!obj)
    	{
    		$req.appr_convos.conv_reply_data[comment_id] ={"index":0};
    		obj = $req.appr_convos.conv_reply_data[comment_id];
    	}
    	var start_index = !obj.index ? 0 : parseInt(obj.index) + 1 ;
    	var end_index = parseInt(obj.index) + 5;

    	var listInfo = {
		    "get_total_count": true, // No I18N
		    "start_index": start_index , // No I18N
		    "sort_field": "created_time", // No I18N
		    "row_count" : 5, // No I18N
		    "sort_order": "desc", // No I18N
		}
    	
    	var data = {"list_info":listInfo}; // No I18N
    	var wrapper = "#approval-clarification-"+comment_id; // No I18N
    	if(typeof auth_key != "undefined")
    	{
    		/* for fetchinng non-login profiles image-token in clarification */
        	data.include=['image_token']; // No I18N
    		var url = "/servlets/ApprovalServlet?module=request&module_id="+request_id+"&operation=clarification_get_replies&approval_clarification_id="+comment_id+"&key="+auth_key; // No I18N
    	}
    	else
    	{
        	data.include=['image_token']; // No I18N
    		var url = "/api/v3/requests/"+request_id+"/approval_levels/"+approval_level_id+"/approvals/"+approval_id+"/clarifications/"+comment_id+"/replies"; // No I18N
    	}
		
        sdpAjax({
            url : url,
            data : sdpAjaxInputData(data),
            type : "GET", // No I18N
            success : function(resp)
            {
            	if(resp && resp.replies)
            	{
				    resp.comment_id = comment_id;
	                resp.approval_id = approval_id;
	                resp.approval_level_id = approval_level_id;
	                resp.loggedin_user = typeof approverId != "undefined" ? approverId : sdp_user.LOGGEDIN_USERID+""; // NO I18N
	                if(typeof approval_level_num == "undefined" || (typeof readOnlyMode != "undefined" && readOnlyMode))
	                {
	                	resp.is_readonly = true;
	                }
	                else
	                {
	                	var current_stage_id = (typeof level_ids != 'undefined' && level_ids ) ? level_ids[approval_level_num-1] : null;  // No I18N
	                	if(current_stage_id != approval_level_id || (typeof readOnlyMode != "undefined" && readOnlyMode))
	                	{
	                		resp.is_readonly = true;
	                	}

	                }
	                self.renderReplies(comment_id,resp);
            	}
			  	
            }
        });
    },

    loadMoreConversations:function(level_id,level_num,elem)
	{
		/* For the first set we have loaded 5 conversations . loading more conversations based on the user enquiry */
		var self = this;
		// var data = level_id;

		// if(!jQuery("#req-tech-conversations-"+level_id).length)
		// {
		// 	data = level_num;	
		// }
		var wrapper = "#req-tech-conversations-"+level_num ; // No I18N

		self.init(level_num,wrapper,true);
	},

    constructListInfo : function(data)
    {
    	/* util method : constructs the list info for the clarifications get api */

    	var search_criteria = [];
    	var row_count = 5;
    	if(data && Array.isArray(data))
    	{
    		data.forEach(function(approver)
    		{
    			search_criteria.push({'field': 'approval.approver.id', 'value': approver.id, 'condition': 'is', 'logical_operator': 'or'}); // No I18N
    		});

    		if(data.length)
    		{
    			row_count = 100;	
    		}
    		
    	}

    	var listInfo = {
		    "get_total_count": true, // No I18N
		    "start_index": 1, // No I18N
		    "row_count" : row_count, // No I18N
		    "sort_field": "created_time", // No I18N
		    "sort_order": "desc", // No I18N
		    "search_criteria": search_criteria, // No I18N
		    "fields_required": ['parent', 'content', 'created_time', 'replies' , 'is_resolved', 'created_by', 'approval.approval_level','approval.approval_level.level', 'approval.approval_level.display_name','approval.approval_level.name' ,'approval.approval_level.is_current' ,'approval.approver', 'approval.status', 'approval.approval_level.request','approval.approval_level.request.approval_status' ,'reply_count'] // No I18N
		}

		return listInfo;
    },

    applyFilter : function()
    {
    	var self = this;
    	var filterData = jQuery("#approverFilter").select2("data"); // No I18N
    	if(filterData.length)
    	{
    		self.init();
    	}
    	else
    	{
    		showalert('failure', translate('api.approval.clarification.info.emptyfilter'),'isAutoHide=true,closeOnEscKey=yes,width=450,height=80');// No I18N
    	}
    	
    },

    cancelFilter : function()
    {
    	jQuery("#approverFilter").select2("data",null); // No I18N
    	this.clarifications.prev_app_level = approval_level_id;
    	this.init();
    },

    toggleFilter : function(isReset)
    {
    	jQuery("#filter-wrapper").toggleClass("open"); // No I18N

    	if($req.appr_convos.applied_filter)
    	{
    		jQuery("#approverFilter").select2("data",$req.appr_convos.applied_filter); // No I18N	
    	}
    	else
    	{
    		jQuery("#approverFilter").select2("data",null); // No I18N
    	}
    	// if(isReset)
    	// {
    	// 	jQuery("#approverFilter").select2("data",null); // No I18N
    	// }
    },

   groupByLevel : function(clarifications) 
   {
   		// grouping the json based on the approvel level 
   		if(clarifications && Array.isArray(clarifications))
   		{
   			return clarifications.reduce(function(rv, x , index) {
				if(x && x.approval && x.approval.approval_level && x.approval.approval_level.level)
				{
					rv[x.approval.approval_level.level] = rv[x.approval.approval_level.level] || {};
					rv[x.approval.approval_level.level].data = rv[x.approval.approval_level.level].data || [];
					rv[x.approval.approval_level.level].levelname = x.approval.approval_level.name;
					rv[x.approval.approval_level.level].data.push(x);
				}
				return rv;
			}, {});
   		}
   		else
   		{
   			return {};
   		}
		
	}	
};
