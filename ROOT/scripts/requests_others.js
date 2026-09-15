/* $Id$ */


/*
 * Setting values needed for the old JSP model and performing few required UI changes
 */
function setHTMLProperties() {
	/* Values needed for the old JSP model */
	if($req.details.request_info.status != null) {
		jQuery('#Inline_STATUSID').val($req.details.request_info.status.id);
	}
	if($req.details.request_info.technician) {
		jQuery('#OWNERID').val($req.details.request_info.technician.id);
	}
	parent.WOID = $req.details.request_info.id;
	if($req.details.request_info.site) {
		parent.SITEID = ''+$req.details.request_info.site.id	//No I18N
	} else {
		parent.SITEID = null;
	}
	if(jQuery('#toggleRHS').attr('togglestate') == "close") {
		if(!$req.details.request_info.approval_status ) {
			jQuery('#WOHeader .right').css('border', 'none');	//No I18N
		}
	} else {
		jQuery('#WOHeader .right').attr('style','border-color: #cbcbcb');	//No I18N
	}
	if(!$req.details.is_collab_initialized) {
		pagenotif.initialize(sdp_user.LOGGEDIN_USERID, "request", woID, handleWOPageMessages);  //NO I18N
		$req.header.loadCollabrationDetails();
		$req.details.is_collab_initialized = true;
	}
	else{
		var $collaborators = jQuery("#collaboration_details").find("#viewers_names");
		var users_len = $collaborators.find('ul li').length;
		if(users_len > 1){
			var content = $collaborators.html();
			setTimeout(function() {
				jQuery("#collaboration_details").find("#viewers_names").html(content); 
				pagenotif.refreshUI();
			}, 1000);
		}
	}
}

/*
 * Changes tab, when the hash value changed in the URL
 */
function hashchange(event) {
	var hashURL = window.location.hash;
	if(hashURL != null && hashURL != "") {	// No I18N
		hashURL = hashURL.substr(1);
		var options={};
		// Conversation is under the details tab
		if(hashURL === 'Conversation'){
			hashURL = undefined;
			options.tab_data = "Conversation"; // No I18N
		}
		$req.details.changeTab(hashURL, options, event);
	} else {
		$req.details.changeTab(undefined, undefined, event);
	}
}

/* When reply not allowed */
jQuery(".showdiv").on('mouseenter', function(){
	jQuery('.showhovrdiv').fadeToggle();
}).on('mouseleave', function(){
	jQuery('.showhovrdiv').fadeToggle();
});

/* Loads and prepends the corresponding resolution template content on changing the resolution template 
 -->SD-71148 issue fix.
*/
function resolutionTemplateChange() {
	var canChange=true;
	//SD-76153 Fix - change resolution popup will show only when resolution text is not empty
	if(!isWOResolutionEmpty()){
		canChange=confirm(getMessageForKey("sdp.resolutiontemplate.change.confirm"));
	}
  	if(canChange){
		if( parent.document.getElementById("woResolution_Id").value > 0 ){
			sdpAjax({
                url: "/api/v3/resolution_templates/"+parent.document.getElementById("woResolution_Id").value, //No i18N
                type: "GET", //No i18N
                success: function(response){
                    ZEditor.resolution_editor.setHTML(response.resolution_template.description);
                }
            });
		}
	}
	else{
		 jQuery("#woResolution_Id").select2('val','-1');//No i18N
	}
}



/** ------------------- MISCELLANEOUS FUNCTIONS ------------------- */


/** Adding request resolution via v3 api call. */
function addResolution(addbutton, addToSolution) {
    $req.prop.resol_update = true;
    var resolForm = jQuery('form[name="addResolutionForm"]');
    var validation = validateWOResSave();
    if(validation) {
    	/** save the worklog before the resolution information */
        if(document.addResolutionForm.timeSpent && document.addResolutionForm.timeSpent.checked && !$worklogForm.saveWorklog()) {
            return;
        }

        /** add resolution and properties with resolution information using v3 API */
        $req.prop.inlineSave(undefined, undefined, function() {
            /** forwarding the resolution content to the add solution form */
            if(addToSolution && ($req.prop.checkSubmitMsg === "success" || $req.prop.checkSubmitMsg === "warning")) {
				window.location.href = "/ui/solutions?mode=add&associateID="+$req.details.request_info.id+"&associateType=Resolution";
            }
            /** SD-77985 : scrolling back to the top of the Requset Details page, on saving the Ticket */
			jQuery("html, body").animate({
				scrollTop: 0
			}, 0);
        });
    }
}

/** Fetches PMP RDP accounts using CINAME and opens in new window */
function showPmpRdpOptions(resourceName, element, rdpName) {
	var el = jQuery(element).parent();
	var actionName = '';
  	if(el.find('ul').length > 0) {
  		return;
  	}
  	el.find("> a").removeAttr("onmouseover");
  	actionName = (rdpName ===  "PAM360") ? "GetPam360RdpAccounts" : "GetPmpRdpAccounts"; //NO I18N
  	jQuery.ajax({
	    url: '/servlet/SDAjaxServlet?action='+encodeURIComponent(actionName)+'&resource_name='+encodeURIComponent(resourceName),  //NO I18N
	    type: 'GET',    //NO I18N
	    cache:false,
	    beforeSend: function(){
			jQuery('#alertbox').remove(); //No I18N
	    	 $req.utils.alert("info", getMessageForKey("common.loading"), "isAutoHide=false"); // No I18N
	    },
	    success: function(response) {
	    	jQuery('#alertbox').remove();
	    	if(el.find('ul').length > 0) {
		  		return;
		  	}
	      	if(response.status === "success") {
	      		var options_el = "<ul class='sdmenu-dd sdmenu-dd2 sdmenu-submenu fw bs-noconflict m0 p0 disp-ib' style='border: none; box-shadow: none;'>"	//NO I18N
	        	jQuery.each(response.accounts, function(index, account) {
	        		var access_type = [];
	        		if(account.AUTOLOGONLIST.indexOf("SSH") > -1) {
            				access_type.push("SSH");	//NO I18N
        			}
        			if(account.AUTOLOGONLIST.indexOf("Telnet") > -1){
        				access_type.push("Telnet");	//NO I18N
        			}
        			if(account.AUTOLOGONLIST.indexOf("SQL") > -1){
        				access_type.push("SQL");	//NO I18N
        			}
        			if(account.AUTOLOGONLIST.indexOf("Windows Remote Desktop") > -1 || account.AUTOLOGONLIST.indexOf("RDP Console Session") > -1) {
        				access_type.push("RDP");	//NO I18N
        			}
        			if(access_type.length > 0){
        				options_el += "<li class='sdmenu bs-noconflict fw disp-ib'><a href='/' rel='noreferrer' class='pl20' data-switch='sdmenu' data-name='account' >"+e_html(account["ACCOUNT NAME"])+"<span class='caret fr top10 pos-rel'></span></a>";	//NO I18N
		        		options_el += "<ul class='sdmenu-dd sdmenu-dd2 sdmenu-submenu fw bs-noconflict m0 p0' style='border: none; box-shadow: none;'>"	//NO I18N
		        		for(var i=0; i<access_type.length; i++) {
		        			options_el += "<li><a href='/' class='bullet-arrow pl30' rel='noreferrer' data-name='remoteaccess' data-servername='"+e_attr(response.server_name)+"' data-accesstype='"+access_type[i]+"' data-resourceid='"+e_attr(response.resource_id)+"' data-accountid='"+e_attr(account["ACCOUNT ID"])+"' data-rdpname='"+rdpName+"' >"+e_html(access_type[i])+"</a></li>" //NO I18N
		        		}
		        		options_el += "</ul></li>"	//NO I18N
        			}
        			else{
        				options_el += "<li><a href='/' class='pl30'>"+getMessageForKey("pmp.msg.connection")+"</a></li>"	//NO I18N
        			}
	        	});
	        	options_el += "</ul>"	//NO I18N
	        	el.append(options_el);
	        	el.off('click').on('click','li a[data-name="account"]' , function(event){
	        		bsDropdown(this, event);
	        	});
	        	el.off('click').on('click', 'li a[data-name="remoteaccess"]', function(event){
	        		const serverName = this.getAttribute('data-servername');
	        		const accessType = this.getAttribute('data-accesstype');
	        		const resourceId = this.getAttribute('data-resourceid');
	        		const accountId = this.getAttribute('data-accountid');
	        		const rdpName = this.getAttribute('data-rdpname');
	        		openRemoteDialog(serverName,accessType,resourceId,accountId,rdpName);
	        	});
	      	} else {
	      		if(response.message) {
        			 $req.utils.alert("failure", response.message, "isAutoHide=false"); // No I18N
        		} else {
	        		 $req.utils.alert("failure", getMessageForKey("pam.fetch.remote.url.failure"), 'isAutoHide=true'); //NO I18N
	        	}
	        	el.addClass("disable-opacity3");
	      	}
	    }
	});
}

/** Opens remote reason dialog */
function openRemoteDialog(url, access_type, resourceId, accountId, rdpName) {
	if(jQuery("#rdp-reason-dialog").length === 0) {
		jQuery("body").append('<div id="rdp-reason-dialog" class="p15" style="display: none"><label for="remote-reason"><span class="text-mandatory mr3">*</span>'+getMessageForKey("pam.remote.reason.title")+'</label><textarea id="remote-reason" name="remote-reason" rows="5" class="form-control mt10"></textarea><div class="tc pt20"><button type="button" id="connectRDP" class="btn btn-primary">'+getMessageForKey("sdp.common.connect")+'</button></div></div>');	//No I18N
	}
	jQuery("#rdp-reason-dialog").dialog({	//No I18N
		title: "Reason for Remote Desktop",	//No I18N
		modal: true,
		height: 'auto',	//No I18N
		width: 500,
		close: closeRemoteDialog()
	});
	jQuery("#connectRDP").off("click").on("click", function(){	//No I18N
		openRemoteDesktop(url, access_type, resourceId, accountId, undefined, rdpName);
	});
}

/** Initiates the remote desktop in new tab using the given url */
function openRemoteDesktop(url, access_type, resourceId, accountId, dialog, rdpName) {
	if(!jQuery("#remote-reason").val()) {
		window.alert(getMessageForKey("pam.remote.reason.alert"));
		return;
	}
	var reason = encodeURI(jQuery("#remote-reason").val());
	var data = {resource_id: resourceId, account_id: accountId, reason: reason, ticket_id: WOID};
	var items =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
	var actionName = (rdpName === "PAM360") ? "GetPam360RemoteURL" :"GetPmpRemoteURL";//No I18N
	jQuery.ajax({
        url: "/servlet/SDAjaxServlet",	//No I18N
        data: {data: items, action: actionName},
        type: 'GET',	//No I18N
        cache:false,
        beforeSend: function(){
			jQuery('#alertbox').remove(); //No I18N
	    	 $req.utils.alert("info", getMessageForKey("pam.remote.connecting"), "isAutoHide=false"); // No I18N
	    },
        success:function(response){
        	jQuery('#alertbox').remove();
        	if(response.status == "success") {
        		var username =  parent.sdp_user.LOGINNAME
                if(parent.sdp_user.DOMAINNAME && parent.sdp_user.DOMAINNAME!=='-')
                {
                   username = parent.sdp_user.DOMAINNAME+ encodeURI("\\") +username;	//No I18N
                }
                var rdp_url = "https://"+url+"/login/AuthKeyLogin.jsp?APP_SCOPE=PMP_REMOTE_ACCESS&APP_NAME=SDP&RDPTOKEN="+response.remote_otp+"&APP_USERNAME="+username+"&APP_ACCESSTYPE="+access_type;	//No I18N
                window.open(rdp_url, "_blank");	//No I18N
				closeRemoteDialog(dialog);
				jQuery("#rdp-reason-dialog").dialog("destroy");	//No I18N
        	} else {
        		if(response.message) {
        			 $req.utils.alert("failure", response.message, "isAutoHide=false"); // No I18N
        		} else {
        			 $req.utils.alert("failure", getMessageForKey("pam.remote.connect.failed"), "isAutoHide=true"); // No I18N
        		}
        	}
        }
    });
}

/** closes the remote dialog when required */
function closeRemoteDialog() {
	jQuery("#remote-reason").val("");	//No I18N
}

/** DC Action menu invocation */
function initiateDCToolsAction(action, url, title) {
	jQuery("#toolsactions").val(action);	//No I18N
    showURLInDialog(url, "position=absmiddle, modal=yes, width=600, height=150, scrollbars=no, title="+title);//NO I18N
}

/** sdpdesign dropdown event not binding for the dynamic elements. So calling this function manually */
function bsDropdown(element, event) {
	event.preventDefault(); 
	event.stopImmediatePropagation(); 
	jQuery(element).parent().siblings().removeClass('open');	//No I18N
	jQuery(element).parent().toggleClass('open');	//No I18N
}

/** calculates the positiona and available space for the remote options dropdown and sets the left value */
function setRemotePosition(element) {
	var rpLeft = jQuery("#right-panel-info").offset().left;	//No I18N
	var remoteLeft = jQuery(element).offset().left;
	if(!b_prop.ltr) {
		rpLeft += jQuery("#right-panel").outerWidth(true, true);	//No I18N
		remoteLeft += 28;	/** Adding remote icon width */
	}
	var leftDiff = b_prop.ltr ? remoteLeft - rpLeft : rpLeft - remoteLeft;
	var leftVal = 0;
	if(leftDiff > 100 ) {
		if(leftDiff < 250) {
			leftVal = -100;
		} else {
			leftVal = -200;
		}
	}
	if(b_prop.ltr) {
		jQuery(element).siblings("ul:first").css("left", leftVal+"px");	//No I18N
	} else {
		jQuery(element).siblings("ul:first").css("right", leftVal+"px");	//No I18N
	}
}

// copy ticket - get  model data
function getModuleData(moduleName,holderData) {
    var data,copyData,isRequestDetailsPage = false;
	const getTableData = ()=>{
		const table = holderData.containerId && jQ('#'+holderData.containerId).get(0);//NO I18N
		let data = table && table.loadedRecords ? table.loadedRecords[holderData.id] : null;
		data = holderData.dataPath ? table_comp.getFieldsRequiredByString(data, holderData.dataPath) : data ;
		return data;
	};

    if (moduleName == 'requests' && holderData.viewType == 'details_page') {//NO I18N
        data = $req && $req.details && $req.details.request_info ? $req.details.request_info : null;
		isRequestDetailsPage = true;
    } else if (moduleName == 'requests' && holderData.viewType == 'table') { //NO I18N
        data = getTableData();
    } 

    if (data) {
        //default template data for copy
         copyData = {
            id: data.id,
            url: '#',
            subject: data.subject || '-'
        };

		const requestAllowedEntity = ['associated_requests','request','requests','associated_incidents','initiated_by_requests','initiated_requests','arc_initiated_by_requests','arc_initiated_requests']; //No I18N
		const getRequestURL = () => {
			return location.protocol + '//' + location.host + '/WorkOrder.do?woMode=viewWO&woID=' + data.id+'&PORTALID='+PORTALID
		}
        if (isRequestDetailsPage || requestAllowedEntity.includes(holderData.module)) {
			copyData.url = getRequestURL();
		} 

    }
    
    return copyData;
}


