/* $Id$ */

$req.share =  {
	sharedData: {},
	
	fromActionHeader : false,
	/*
	 * Fetches the share related information and initializes the rendering of the edit/view page
	 */
	init: function() {
		if(window.isMSPOrSCP && !sdp_app.IS_REQUEST_SHARING_MODULE_ENABLED) {
			// Request Sharing feature is license based in SCP
			return;
		}
		/* Get and Populate the shared details */
		jQuery('.page-progressbar').show();	//No I18N
		if($req.details.request_info.is_trashed || window.sdp_user.ROLES.indexOf('ShareRequest') === -1) {
			sdpAjax({
				url: '/api/v3/requests/'+woID+'/share',	//NO I18N
				type: 'GET',	//NO I18N
				async: false,
				cache: false,
				success: function(data) {
					$req.share.sharedData = data.share;
				}
			});
		} else {
			sdpAjax({
				url: '/servlet/HdClientUtilServlet?command=getShareDetails&woID='+woID,	//NO I18N
				type: 'GET',	//NO I18N
				async: false,
				cache: false,
				success: function(data) {
					$req.share.sharedData = data;
				}
			});
		}
		/*
		 * If the Share data is empty (i.e., not shared) and the ticket is not in trash and the mode is not print mode
		 * then, display the Share Edit page directly
		 * else, display the Share View page with edit options
		 */
		if(jQuery.isEmptyObject(this.sharedData) && !$req.details.request_info.is_trashed && !window.print_mode) {
			if($req.layout.show_rpanel){
				this.renderForm(true);
			}
			else{
				this.renderForm();
			}

		} else {
			jQuery("#not_shared").addClass("hide");
			this.render();
			if($req.details.request_info.is_trashed) {
				$req.details.initWOTrash('share_request');	// No I18N
			}
			if(window.print_mode) {
				$req.print.update('share_request');	// No I18N
			}
		}
		jQuery('.page-progressbar').hide();	//No I18N
	},

	renderInDetails : function(){
		jQuery("#share-section").addClass("section-padding").append('<div id="share-details" class="pl10 pr15"><div><strong id="shareDetailsHeader" data-i18n-key="sdp.request.share.details"></strong><hr class="mt10 mb15"></div><p class="text-color5 m0" id="not_shared"></p><div id="load-share"></div>');
		let shareLinkHtml = `<a href="/" id="sharelink" class="text-primary"> ${getMessageForKey("sdp.common.clickhere")} </a>`;
		jQuery("#not_shared").html(getMessageForKey("sdp.request.noshare.info") + getMessageForKey("sdp.request.toshare", [shareLinkHtml]));
		jQuery("#shareDetailsHeader").html(getMessageForKey('sdp.request.share.details'));
		jQuery("#not_shared #sharelink").on('click',function () {
			$req.share.renderForm(true);
		})
		//SD-98387 : Issue in share request popup of kanban view
		var html = "/workorder/ShareRequest.jsp?mode=edit"; //No I18N
		if(window.isMSP)
		{
			html= html+"&module=request&woID="+woID //No I18N
		}
		jQuery("#load-share").load(html);
	},

	/*
	 * Opens the Shared Details pop up
	 */
  	popup: function(isTechEdit) {
		if(isTechEdit == 'fromActionHeader' && !$req.layout.show_rpanel){
			$req.share.fromActionHeader = true;
			$req.share.renderShareInActions();
		}
		else{
			$req.share.fromActionHeader = false;
			jQuery("#share-request").remove();
			jQuery('.page-progressbar').show();	//No I18N
			var url = '/workorder/ShareRequest.jsp?mode=edit'; //No I18N
			if(window.isMSP)
			{
				url= url+"&module=request&woID="+woID //No I18N
			}
			  window.showURLInDialog(url,'modal=yes,closeOnEscKey=yes,closeButton=yes,width=560,position=absmiddle,title='+window.getMessageForKey("sdp.request.share.title"), function(){	//NO I18N
				  jQuery('.page-progressbar').hide();	//No I18N
			  });
		}
  	},
	renderShareInActions: function(){
		$req.share.init();
		jQuery("#share-req-form").html("");
		jQuery("#share-section-actions").dialog({
			width: 550,
			height:'auto', 	//No I18N
			title:window.getMessageForKey("sdp.request.share.title"),
			modal: true,
			resizable: false,
			position: { my: "top", at: "top", of: window }, //No I18N
			draggable: false,
			closeOnEscape: false,
			show: {
				effect: 'fadeIn', 	//No I18N
				duration: 500
			},
			open: function(event, ui) {
				jQuery(document).find('body').addClass('of-h'); //Remove Page scroll
			},
			beforeClose : function(){
				$req.share.fromActionHeader = false;
				if(!jQuery.isEmptyObject($req.share.sharedData)){
					$req.share.render();
				}
			},
			close : function(){
				jQuery(document).find('body').removeClass('of-h'); //Add page scroll
			}
		})
		window.populateShareDataForSelect2(this.sharedData);
	},

  	/*
  	 * Renders the View page of the Share content
  	 */
	render: function() {
		/* Removes the default value present in the response --- TODO: Need to check if this code is required any more */
		if(!jQuery.isEmptyObject(this.sharedData)) {
			if(this.sharedData.technicians) {
				jQuery.each(this.sharedData.technicians, function(index, tech){
					if(tech.id == 0) {
						$req.share.sharedData.technicians.splice(index, 1);
						return false;
					}
				});
			}
			if(this.sharedData.users) {
				jQuery.each(this.sharedData.users, function(index, user){
					if(user.id == 0) {
						$req.share.sharedData.users.splice(index, 1);
						return false;
					}
				});
			}
		}
		var isFromActions = ($req.share.fromActionHeader && !$req.layout.show_rpanel);
	  	if(!jQuery.isEmptyObject(this.sharedData)) {
			  if(isFromActions){
				  this.sharedData.show_rpanel = true;
			  }
			  else{
				  this.sharedData.show_rpanel = $req.layout.show_rpanel;
			  }
	  		this.sharedData.showRqstrBlock = true;
			this.sharedData.showTechBlock = true;
			if(isSCP) {
				this.sharedData.showRqstrBlock = $req.details.self_service_portal_settings.share_request_to_requester;
			}
			//if its print preview and not shared with technicians/requesters then will not shown in print preview
	  		if(window.print_mode) {
	  			if(!isSCP || $req.details.self_service_portal_settings.share_request_to_requester) {	// for SCP if sharing request to requester is not enabled do no show requester block
			  	this.sharedData.showRqstrBlock = this.sharedData.users.length > 0 || this.sharedData.departments.length > 0 || (this.sharedData.user_scope && this.sharedData.user_scope.indexOf("requester") > -1);
				}
				this.sharedData.showTechBlock = this.sharedData.technicians.length > 0 || this.sharedData.groups.length > 0 || (this.sharedData.user_scope && this.sharedData.user_scope.indexOf("technician") > -1);
			}
	  	} else {
			  jQuery('#share-section-actions').dialog().dialog("close"); //NO I18N
		  }
		  let dataToRender = this.sharedData ? this.sharedData : null;
		  let containerSelector = isFromActions ? '#share-section-actions' : '#share-request'; //No I18N
		  !isFromActions && (jQuery(containerSelector).removeClass("hide"));
		  renderhbs(containerSelector, 'share-req-view', dataToRender, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.share_req_view); //No I18N

	  	/* To hide site section if no site is configured in the application */
		if(parseInt(jQuery("#siteCount").val()) <= 0 ) {
		  jQuery("#siteShare").addClass('hide').removeClass('show');	//No I18N
		} else {
		  jQuery("#siteShare").addClass('show').removeClass('hide');	//No I18N
		}
	},

	/*
	 * Renders the Share Edit page
	 * @param techEdit - denotes whether to open Technician Share edit page or Requester Share edit page
	 */
	renderForm: function(techEdit) {
		var isTechEdit = (techEdit == true || techEdit == false);
		// piece of code moved out of if block by MSP devleoper, as the code for both if and else is common and so moving above the if-else block
			var shareEdit = {};
			jQuery("#share-req-form").removeClass("hide");
			// jQuery("#not_shared").addClass("hide");
			shareEdit.techEdit = (techEdit == undefined) ? true : techEdit;
  		if(isSCP) {
	  		shareEdit.shareRequestToRequester = $req.details.self_service_portal_settings.share_request_to_requester;
  		}
		if(!$req.layout.show_rpanel && isTechEdit){
		    renderhbs('#share-req-form', 'share-req-edit', shareEdit, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.share_req_edit); //No I18N

			  /* If there are no sites available, Sites input should be hidden */
			  if(parseInt(jQuery("#siteCount").val()) <= 0 ) {
				jQuery("#selectSite").parent('div').removeClass('show').addClass('hide');	//No I18N
			} else {
				jQuery("#selectSite").parent('div').removeClass('hide').addClass('show');	//No I18N
			}

			/* Populate all the selected values in all the fields (source: Request.js) */
			jQuery("#share-req-form").dialog({
				width: 560,
				height:'auto', 	//No I18N
				title:window.getMessageForKey("sdp.request.share.title"),
				modal: true,
				resizable: false,
				position: { my: "center", at: "center", of: window }, // NO I18N
				draggable: false,
				closeOnEscape: false,
				show: {
					effect: 'fadeIn', 	//No I18N
					duration: 500
				},
				open: function(event, ui) {
					jQuery(document).find('body').addClass('of-h'); //Remove Page scroll
				},
				close : function(){
					jQuery(document).find('body').removeClass('of-h'); //Add page scroll
				}
			})
			window.populateShareDataForSelect2(this.sharedData);
		}
		else if(isTechEdit || $req.share.fromActionHeader){
		
			// MSP developer commenting the piece of code below , as the code for both if and else is common and so moving above the if-else block
			/*var shareEdit = {};
			jQuery("#share-request").removeClass("hide");
			shareEdit.techEdit = (techEdit == undefined) ? true : techEdit;*/
			if($req.share.fromActionHeader && !$req.layout.show_rpanel){
		        renderhbs('#share-section-actions', 'share-req-edit', shareEdit, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.share_req_edit); //No I18N
			}
			else{
			    let shareEle = jQuery("#share-request");
				jQuery("#not_shared").addClass("hide");
				jQuery(shareEle).removeClass("hide");	//NO I18N
		        renderhbs(shareEle, 'share-req-edit', shareEdit, false, 'requests', undefined, undefined, $req.details.bindEvents.templates.share_req_edit); //No I18N
			}

			/* If there are no sites available, Sites input should be hidden */
			if(parseInt(jQuery("#siteCount").val()) <= 0 ) {
				jQuery("#selectSite").parent('div').removeClass('show').addClass('hide');	//No I18N
			}
			else {
				jQuery("#selectSite").parent('div').removeClass('hide').addClass('show');	//No I18N
			}

			/* Populate all the selected values in all the fields (source: Request.js) */
			window.populateShareDataForSelect2(this.sharedData);
		}
	},

	/*
	 * Update the shared information obtained from the user to Server and Rerender the shared details page
	 */
	update: function(){
		var jsonobj = {};
		var scopeArr = [];
		jsonobj.technicians=jQuery("#selectTech").select2("data");	//No I18N
		/* If the '$AllTechnician' is selected, then remove it from the array and update it in scope array */
		for(var i=0;i<jsonobj.technicians.length;i++) {
			if(jsonobj.technicians[i].id == 0) {
				jsonobj.technicians.splice(i,1);
				scopeArr.push("technician");	//NO I18N
				break;
			}
		}
		if(!isSCP || $req.details.self_service_portal_settings.share_request_to_requester) {
		jsonobj.users=jQuery("#selectUser").select2("data");	//No I18N
		/* If the '$AllRequester' is selected, then remove it from the array and update it in scope array */
		for(i=0;i<jsonobj.users.length;i++) {
			if(jsonobj.users[i].id == 0) {
				jsonobj.users.splice(i,1);
				scopeArr.push("requester");	//NO I18N
				break;
			}
		}
		}

		// Site and Department details not applicable for SCP
		if(!isSCP) {

		jsonobj.sites=jQuery("#selectSite").select2("data");	//No I18N
		/* for default 'Not associated to any site', input should be sent as null */
		for(i=0;i<jsonobj.sites.length;i++) {
		    //SD-106244 | for 'Not associated to any site' id will be -1 when fetched through api
		    if(jsonobj.sites[i].id == -1) {
		        jsonobj.sites.splice(i,1);
		    	jsonobj.sites.push(null);
		    	break;
		    }
		}

		jsonobj.departments=jQuery("#selectDept").select2("data");	//No I18N
		}

		jsonobj.groups=jQuery("#selectGrp").select2("data");	//No I18N
		jsonobj.technician_comments=jQuery("#techComment").val();	//NO I18N
		if(!isSCP || $req.details.self_service_portal_settings.share_request_to_requester) {
		jsonobj.user_comments=jQuery("#userComment").val();	//NO I18N
		}
		jsonobj.user_scope=scopeArr;

        //SD-106244 | keep only id field and remove all other fields are they are not necessary*/
        jsonobj.technicians = jsonobj.technicians.map($req.share.removeNonIdFields);
		if(!isSCP){
        jsonobj.users = jsonobj.users.map($req.share.removeNonIdFields);
		}

        jsonobj.groups = jsonobj.groups.map($req.share.removeNonIdFields);
		if(!isSCP){
        jsonobj.sites = jsonobj.sites.map($req.share.removeNonIdFields);
        jsonobj.departments = jsonobj.departments.map($req.share.removeNonIdFields);
		}

		var shareObj = {};
		var sharedData;
		shareObj.share=jsonobj;
		jQuery('.page-progressbar').show();	//No I18N
		sdpAjax({
			headers: { Accept: 'application/v3+json' }, //NO I18N
			url: '/api/v3/requests/'+woID+'/share',	//NO I18N
			type: 'PUT',	//NO I18N
			data: sdpAjaxInputData(shareObj),
			async: false,
			success: function(data){
				sharedData = data.share;
				$req.share.sharedData = data.share;
				if(data.response_status.status == 'success') {
					  $req.utils.alert('success', getMessageForKey('sdp.requests.share.history.update'), 'isAutoHide=true');	//NO I18N
					/* If the shared data is present, Rerender the share popup, else close the pop up*/
					if(!jQuery.isEmptyObject(data.share)) {
						$req.share.init();
					} else {
						window.closeDialog();
						jQuery('#share-section-actions').dialog().dialog('close'); //NO I18N
					}
					parent.$req.details.getRequestInfo(woID);
					parent.$req.rpanel.render();
					parent.$req.details.renderWOHeader();
				} else {
					$req.utils.alert('failure', getMessageForKey('request.share.details.update.failed'), 'isAutoHide=true');	//NO I18N
				}
			},
			error: function(json){
			    var data = json.responseJSON;
			    if(data.response_status && data.response_status.status != 'success') {
			        $req.utils.alert('failure', getMessageForKey('request.share.details.update.failed'), 'isAutoHide=true');	//NO I18N
			    }
			}
		});
		jQuery('.page-progressbar').hide();	//No I18N
		var showRPanel = $req.layout.show_rpanel;
		if(!showRPanel && jQuery.isEmptyObject(sharedData)){
			jQuery("#share-request").addClass("hide");
			jQuery("#not_shared").removeClass("hide");
		}

		jQuery('#share-req-form').dialog().dialog('close');  	//No I18N
	},

	/*
	 * On cancelling the Share Edit page, if shared data is present, render the View page or close the pop up
	 */
	cancel: function() {
		if(jQuery.isEmptyObject($req.share.sharedData)) {
			jQuery("#share-request").addClass("hide");
			jQuery("#not_shared").removeClass("hide");
			window.closeDialog();
		} else {
			$req.share.render();
		}
		$req.share.fromActionHeader = false;
		jQuery("#share-section-actions").find("#share-req-form").dialog().dialog('close'); //NO I18N
		jQuery('#share-req-form').dialog().dialog('close'); 	//No I18N
	},

    /*
     * This function is used to remove non-id fields from the passed object
     * obj - The object for which non-id fields needs to removed
     */
	removeNonIdFields: function(obj) {
        if(obj != null && obj.id) {
            return { 'id': obj.id }; 	//No I18N
        } else {
            return obj;
        }
	}

};
