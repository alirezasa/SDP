/* $Id$ */

function associateUserToDept(form,checkBoxCompName,additionalParams){
	if(!checkForDelete(form,checkBoxCompName)){
		alert(getMessageForKey('sdp.admin.projectrole.selectuser'));// No I18N
	}else{
		var formelement = form.delUserList;
		var requesterView = form.requesterView1.value; 
		var params = 'requesterView='+encodeURIComponent(requesterView); // No I18N
		if(formelement.length){
			for(var i=0;i<formelement.length;i++){
				if(formelement[i].checked){
		  	 		params = params +"&tech_Id="+encodeURIComponent(formelement[i].value); // No I18N
				} 
			}
		}else{
			if(formelement.checked){
		  	 		params = params +"&tech_Id="+encodeURIComponent(formelement.value); // No I18N
				} 
		}
		// Cache issue in IE
		params = params + "&tm="+encodeURIComponent(new Date().getTime());  // No i18n
		showURLInDialog('/setup/RequesterListActions.jsp?'+params,'closeButton=yes,width=350,height=150,title=' + getMessageForKey("sdp.admin.requesters.assigntodepartment")); // No I18N
	}
}

function saveFormState(form)
{
    handleStateForForm(form);
}


function disableLoginForTech(thisForm) {
	disableLogin = true;
	if(thisForm.provideLogin!=null) {
		if(thisForm.provideLogin.checked) {
			disableLogin= false;
			if(thisForm.isAdmin != null){
				thisForm.isAdmin.disabled = disableLogin;
			}
			if(thisForm.userName != null){
				thisForm.userName.disabled = disableLogin;
			}
			if(thisForm.userPwd != null){
				thisForm.userPwd.disabled = disableLogin;
			}
			if(thisForm.confirmUserPwd != null){
				thisForm.confirmUserPwd.disabled = disableLogin;
			}
		}
		else {
			disableLogin= true;
			if(thisForm.isAdmin != null){
		 		thisForm.isAdmin.disabled = disableLogin;
			}
			if(thisForm.userName != null){
				thisForm.userName.disabled = disableLogin;
			}
			if(thisForm.userPwd != null){
				thisForm.userPwd.disabled = disableLogin;
			}
			if(thisForm.confirmUserPwd != null){
				thisForm.confirmUserPwd.disabled = disableLogin;
			}

		}
	}
	return disableLogin;
}
var siteAdmin = 'SDSiteAdmin';  // No i18n

function validateLimit(formObj)
{
if(document.getElementById('canApprovePOID') !=null && document.getElementById('canApprovePOID').checked == true)
{
	var radioLimit;
	if(formObj == undefined) {
		radioLimit = document.TechnicianDefForm.approveLimit;
	}
	else {
		radioLimit =formObj.approveLimit;
	}
	if(radioLimit) {
		var val = null
			for(i=0;i<radioLimit.length;i++)
			{
				if(radioLimit[i].checked)
				{
					val = radioLimit[i].value;
				}
			}

		if(val =="LIMITED" && !isDouble(document.getElementById('approveLimitValue').value)) {
			alert(document.getElementById("sdp.admin.technicianDef.invalid.approvallimitjserror").innerHTML);
			return false;
		}
	}
}
return true;
}

function ShowEMailTab(divIdToShow)
{
var idToShow = document.getElementById(divIdToShow);
idToShow.style.display = 'block'; // No I18N
if(divIdToShow=="incoming") {
	var mailOption = document.EMailDefForm.incomingMailOption.value;
	document.EMailDefForm.incomingHost.focus();
	var idToHide1 = document.getElementById("filter");
	idToHide1.style.display = 'none'; // No I18N
	var idToHide2 = document.getElementById("outgoing");
	idToHide2.style.display = 'none'; // No I18N
	var idToHide3 = document.getElementById("mailparser");
	idToHide3.style.display = 'none'; // No I18N
	document.EMailDefForm.mailType.value = 'incoming'; // No I18N
	var idToHide4 = document.getElementById("delimiter");
	idToHide4.style.display = 'none'; // No I18N
	if(mailOption == "ews")
    {
		jQuery('input[id=incoming-ewsAPI]').prop("checked",true); // No I18N
    	jQuery('input[id=incoming-ewsAPI]').trigger("click");
    	document.EMailDefForm.incomingEwsUrl.focus();
	}
	else if(mailOption === "javamail")
	{
		jQuery('input[id=incoming-mailAPI]').prop("checked",true); // No I18N
		jQuery('input[id=incoming-mailAPI]').trigger("click");
		document.EMailDefForm.incomingHost.focus();
	}
	else if(mailOption === "graph") {
		jQuery('input[id=incoming-graphAPI]').prop("checked", true); //NO I18N
		jQuery('input[id=incoming-graphAPI]').trigger("click");
		document.EMailDefForm.incGraphEmail.focus();
	}
}
else if(divIdToShow=="outgoing") {
	var mailOption = document.EMailDefForm.outgoingMailOption.value;
	if(!jQuery('#fromESM')) {
	    var idToHide1 = document.getElementById("incoming");
    	idToHide1.style.display = 'none'; // No I18N
    	var idToHide2 = document.getElementById("filter");
    	idToHide2.style.display = 'none'; // No I18N
    	var idToHide3 = document.getElementById("mailparser");
    	idToHide3.style.display = 'none'; // No I18N
    	document.EMailDefForm.mailType.value = 'outgoing'; // No I18N
    	var idToHide4 = document.getElementById("delimiter");
    	idToHide4.style.display = 'none'; // No I18N
	}
        //Focus shifts to Help card in Outgoing tab. Hence setting focus at end
    if(mailOption == "ews")
    {
    	jQuery('input[id=outgoing-ewsAPI]').prop("checked",true); // No I18N
    	jQuery('input[id=outgoing-ewsAPI]').trigger("click");
		document.EMailDefForm.outgoingEwsUrl.focus();
	}
	else if(mailOption === "javamail") {
		jQuery('input[id=outgoing-mailAPI]').prop("checked",true); // No I18N
		jQuery('input[id=outgoing-mailAPI]').trigger("click");
		document.EMailDefForm.outgoingHost.focus();
	}
	else if(mailOption === "graph") {
		jQuery('input[id=outgoing-graphAPI]').prop("checked", true); //NO I18N
		jQuery('input[id=outgoing-graphAPI]').trigger("click");
		document.EMailDefForm.outGraphEmail.focus();
	}
}
else if(divIdToShow=="filter") {
	var idToHide1 = document.getElementById("incoming");
	idToHide1.style.display = 'none'; // No I18N
	var idToHide2 = document.getElementById("outgoing");
	idToHide2.style.display = 'none'; // No I18N
	var idToHide3 = document.getElementById("mailparser");
	idToHide3.style.display = 'none'; // No I18N
	var idToHide4 = document.getElementById("delimiter");
	idToHide4.style.display = 'none'; // No I18N

}
else if(divIdToShow=="mailparser") {
	var idToHide1 = document.getElementById("incoming");
	idToHide1.style.display = 'none'; // No I18N
	var idToHide2 = document.getElementById("filter");
	idToHide2.style.display = 'none'; // No I18N
	var idToHide3 = document.getElementById("outgoing");
	idToHide3.style.display = 'none'; // No I18N
	var idToHide4 = document.getElementById("delimiter");
	idToHide4.style.display = 'none'; // No I18N
	document.EMailDefForm.mailType.value = 'mailparser'; // No I18N
	//ziaparser.js file required only in E-mail command tab. So loading it dynamically
	var files = [sdp_app.IS_DEVELOPMENT_MODE ? "/scripts/ziaparser.js" : "/scripts/zia-configurations.min.js"]; //No I18N
	ResourceLoader({
		js: files,
		success: function() {
			if (sdp_app.IS_REBRAND) {
				zia_parser_config.loadEmailCommand();
			}
			else {
				zia_parser_config.openConfig();
			}
		}
	});
	setTimeout(function() {
	fixedformfooter(document.querySelector('[name=EMailDefForm] [id=command-div]'),document.querySelector('[name=EMailDefForm] [data-id=form-footer]')); //No I18N
	}, 500);
	//Initialise validator for email parser
	initParserValidator();
}
else if(divIdToShow=="delimiter") {
	var idToHide1 = document.getElementById("incoming");
	idToHide1.style.display = 'none'; // No I18N
	var idToHide2 = document.getElementById("filter");
	idToHide2.style.display = 'none'; // No I18N
	var idToHide3 = document.getElementById("outgoing");
	idToHide3.style.display = 'none'; // No I18N
	var idToHide4 = document.getElementById("mailparser");
	idToHide4.style.display = 'none'; // No I18N

	document.EMailDefForm.mailType.value = 'delimiter'; // No I18N
}
}

function validateUsersImportForm(theForm) {
if(trimAll(theForm.firstName.value) == "-1") {
	alert(getMessageForKey("sdp.admin.requesterCSVImp.nofirstnameErrmsg"));
	return false;
}
if(trimAll(theForm.userName.value) == "-1") {
	alert(getMessageForKey("sdp.admin.requesterCSVImp.nologinnameErrmsg"));
	return false;
}
if(trimAll(theForm.password.value) == "-1") {
	alert(getMessageForKey("sdp.admin.requesterCSVImp.nopasswordErrmsg"));
	return false;
}
}

//CSI import scripts starts.
function validateImportFormCSI(theForm, event) {
if( (trimAll(theForm.categoryName.value) == "-1") && (trimAll(theForm.subCategoryName.value) == "-1") && (trimAll(theForm.itemName.value) == "-1") ) {
	alert(getMessageForKey("sdp.import.csv.csi.mandatory.nofieldsselected"));
	event.preventDefault();
	return;
}
if( (trimAll(theForm.categoryName.value) == "-1") && (trimAll(theForm.subCategoryName.value) != "-1") ) {
	alert(getMessageForKey("sdp.import.csv.csi.mandatory.fieldcheck1"));
	event.preventDefault();
	return;
}
if( (trimAll(theForm.subCategoryName.value) == "-1") && (trimAll(theForm.itemName.value) != "-1") ) {
	alert(getMessageForKey("sdp.import.csv.csi.mandatory.fieldcheck2"));
	event.preventDefault();
	return;
}
ShowProgressInScreenCSI(theForm);
}

function checkSCExistsCSI(theForm) {
if( trimAll(theForm.itemName.value) != "-1" ){
	jQuery('#scmandatory').removeClass('hide'); //No I18N
}
else {
	jQuery('#scmandatory').addClass('hide'); //No I18N
}
}

function ShowProgressInScreenCSI(form) {	
var msgTable = jQuery("#Mappingfields"); //No I18N
if(msgTable != null)
{
	msgTable.removeClass('disp-b').addClass('hide'); //No I18N
}
var progressTable = jQuery("#progressTable"); //No I18N
if(progressTable != null)
{
	progressTable.removeClass('hide').addClass('disp-b'); //No I18N
}
}

function checkFileNameEmptyCSI(adformVal)
{
if(adformVal == "")
{
	alert(getMessageForKey("sdp.import.csv.csi.choosefile"));
	return false;
}

var validat=adformVal.toString();
var len= validat.length;

var start= validat.lastIndexOf(".");
var substr = validat.substring(start,(len));

if((substr == ".csv") || (substr == ".CSV") )
{
	return true;
}
else
{
	alert(getMessageForKey("sdp.inventory.csvimport.error3"));
	return false;
}
}
// function overriden in MSP
function showVipIcon()
{
	
}
function blockRequesters(form,checkBoxCompName , blockConfirmString,selectRowString,additionalParams)
{	
		 if(confirmBlock(form, checkBoxCompName, blockConfirmString,selectRowString))
		{
			form.action = form.action + additionalParams;
			handleStateForForm(form);
			form.submit();
		}
}
function blockRequester(userID,confirmStr,msp)
{
	if(confirmSubmit(confirmStr))
	{
		var form = document.createElement("form");
		var actionString="/SearchRequester.do?blockButton=block&msp="+msp;// No I18N
		document.body.appendChild(form);
		form.setAttribute("method", "POST");
		form.setAttribute("action", actionString);
		var inputField = document.createElement("input");
		inputField.setAttribute("type", "hidden");
		inputField.setAttribute("name", "userCIID");
		inputField.setAttribute("value", userID);
		form.appendChild(inputField);
		form.submit();
	}
}

// JS methods for Unapproved User feature of MSP/SCP starts
/**
 * Requester approval js code prototype starts.
 * ******************************************************************************************************/

if(window.isMSPOrSCP && sdp_feature_status.is_unapproved_requester_enabled) {
if (!unapproved_user) {
	var unapproved_user = {};
}

unapproved_user.unapproved_req = function() {
    //you can define some global values here
    allSelectors = '';
}
unapproved_user.unapproved_req.prototype = {
	user_mode_url: 'RequesterDef.do?userViewType=unapprovedUsers&', // NO I18N
	init: function(json) {
		// If build is not MSP then avoid further code execution
		if (!isMSPOrSCP) {
			return;
		}

		json.view_name = 'unapprovedUsers'; // NO I18N
		json.face_name = translate('sdp.unappoved.requesters'); // NO I18N

		$unapproved_req.bindCoreElements(json);
      	$unapproved_req.renderMsg(json);

      	if (json.is_list || json.is_wo_view) {
      		jQuery('#unaprov-usr-slidecontent').css('display','none'); // NO I18N
      	}
  	},
  	bindCoreElements: function(json) {
		jQuery(document).off('click', '#approveUser').on('click', '#approveUser', function() { // NO I18N
          	$unapproved_req.approveUser(json);
      	}).off('click', '#rejectUser').on('click', '#rejectUser', function() { // NO I18N
          	$unapproved_req.reject(json);
        }).off('click', '#mergeUser').on('click', '#mergeUser', function() { // NO I18N
          	$unapproved_req.renderMerge(json);
        }).off('click', '#merge').on('click', '#merge', function() { // NO I18N
          	$unapproved_req.merge(json);
        }).off('click', '#markSpam').on('click', '#markSpam', function() { // NO I18N
          	$unapproved_req.markSpam(json);
        }).off('click', '#cancel').on('click', '#cancel', function() { // NO I18N
        	window.close();
       	}).off('click', '#filtersList li a').on('click', '#filtersList li a', function() { // NO I18N
        	$unapproved_req.reloadView({view_name: this.getAttribute('view_name'), face_name: this.innerHTML, is_list: true});
       	}).off('click', '[data_requester_id]').on('click', '[data_requester_id]', function() { // NO I18N
       		$unapproved_req.handleWOUserAction(this, json);
       	}).off('click', '#slide_cancel').on('click', '#slide_cancel', function() { // NO I18N
       		$unapproved_req.removeActive();
      	});
  	},
  	renderMsg: function(json) {
  		// List is being loaded after approval, merge and rejection
		var id = '', url = $unapproved_req.user_mode_url;

		if (json.is_approved) {
			id = 'approveMsg'; // NO I18N
		} else if (json.is_merged) {
			id = 'mergeMsg'; // NO I18N
			window.close();
		} else if (json.is_rejected) {
			id = 'rejectMsg'; // NO I18N
		} else if (json.is_marked_spam) {
			id = 'spamMsg'; // NO I18N
		}
		if (id !== '') {
			jQuery('#alertbox').remove();
			showalert('success', jQuery('#' + id).html(), 'isAutoHide=true'); // NO I18N

			if (json.is_wo) {
				url = '/WOListView.do'; // NO I18N
			}
			window.history.pushState('', '', url);
		}

		if (json.is_unapproved_list) {
			jQuery(document).find('#unapprovedActList').removeClass('hide').end().find('#actionList').addClass('hide');
		}
  	},
  	reloadView: function(json) {
  		if (!json.is_list) {
  			location.href = $unapproved_req.user_mode_url + json.success_param
  		} else {
	  		var th = jQuery(document), url = $unapproved_req.user_mode_url, view = 'RequesterView', viewName = json.view_name, params = '&userViewType=' + viewName; // NO I18N

	  		// When View Deleted Users link is being clicked from CMDB tab
	  		if (jQuery('#url_view').val() === 'inactiveUsers') {
	  			location.href = 'RequesterDef.do?' + params;
	  		}

			updateState(view, '_D_RP', params); // NO I18N
			refreshSubView(view);
			th.find('#filterFaceVal').html(json.face_name);

			if (viewName.indexOf('unapp') === 0) {
				th.find('#unapprovedActList').removeClass('hide').end().find('#actionList').addClass('hide');
			} else {
				th.find('#actionList').removeClass('hide').end().find('#unapprovedActList').addClass('hide');
				url = 'RequesterDef.do'; // NO I18N
			}
			window.history.pushState('', '', url); // NO I18N

			if (json.hasOwnProperty('msg')) {
				showalert(json.status, json.msg, 'isAutoHide=true'); // NO I18N
			}
		}
  	},
  	getRequestersInfo: function(json) {
  		var th = jQuery('#ciDetails'), ids;

  		if (json.is_list) {
  			th = jQuery(document.SearchUserForm);

  			var row = jQuery(th).find('[name=delUserList]:checked'), len = row.length, i, idArr = [], nameArr = [], rowObj = row,
      		allRowsLen = jQuery(th).find('[name=delUserList]').length;

	      	for (i = 0; i < len; i++) {
	        	idArr.push(row[i].value);
	        	nameArr.push(jQuery(row[i]).closest('tr').find('[href^=View] span span')[0].innerHTML);
	      	}
	      	json.ids = idArr;
	      	json.names = nameArr;
	      	json.is_all_selected = (len === allRowsLen);
	    } else if (json.is_wo) {
	    	var name, id;

	    	if (json.is_wo_view) {
	    		name = $req.details.request_info.requester.name;
	    		id = $req.details.request_info.requester.id;
	    	} else {
	    		id = jQuery('#unknownRequesterId').html();
	    		name = jQuery('#unknownUserName').html();
	    	}
	      	json.ids = [id];
	      	json.names = [name];
	      	json.is_all_selected = false;
		} else {
			json = {ids: [jQuery('#approveUser').attr('data-id')], is_list: false, is_msp: isMSP}; // Getting requester id from requester view page
		}
		json.len = json.ids.length;

      	return json;
  	},
  	approveUser: function(json) { // Function gets and renders account, site and department for pop up.
  		json = $unapproved_req.getRequestersInfo(json);

  		if(isSCP) {
  			var approveUserCallBack = function(returnBoolean, button) {
  				if(returnBoolean) {
	  				var operation = null;
  					if(button == 'submitButton') {
  						operation = "approve";	//No I18N
  					} else if( button == 'submitButton2') {	//No I18N
  						operation = "enable_login";	//No I18N
  					}
  					var operationInput = {operation: operation};
  					var inputData = {approve: operationInput};
  					sdpAjax({
				        url: "/api/v3/users/approve?ids=" + encodeURIComponent(json.ids.join(',')), //No I18N
				        type: 'PUT', // NO I18N
				        async:false,
						ignorefailuremessage: true,
				        data: {input_data : Object.toJSON(inputData)},
				        complete: function(data) {
				        	if(data) {
				        		var responseArr = data.responseJSON.response_status;
				        		var failedIDs = [];
				        		for (var i = responseArr.length - 1; i >= 0; i--) {
				        			if(responseArr[i].status !== 'success') {
				        				failedIDs.push(responseArr[i].id);
				        			}
				        		}
				        		if(failedIDs.length > 0) {
				        			var failureMessage = getMessageForKey('msp.user.approve.error', failedIDs.join(','));
				        			showalert("failure", failureMessage, 'isAutoHide=true'); // NO I18N
				        		} else {	//if success
				        			if(json.is_wo) {
					        			location.href = "/WOListView.do?isApproved=true";	//NO I18N
				        			}
				        		}
				        	}
				        }
				    });
  				} else {
  					return false;
  				}
  			}
  			showconfirm(true, 'title=' + getMessageForKey('sdp.approve.action') + ', message=' + getMessageForKey('msp.user.approval.confirmation.msg') + ', submitbutton=' + getMessageForKey('sdp.approve.action') + ', submitbutton2=' + getMessageForKey('msp.approve.action.approve.with.login') + ', cancelbutton=' + getMessageForKey('common.no') + ', closebutton=yes, closeOnEscKey=yes', approveUserCallBack);	//No I18N
  		} else {	//if MSP
  		if (json.is_list || json.is_wo) {
			$unapproved_req.renderACInfo(json);
		} else {
			jQuery.getJSON('root/servlet/MSPAjaxServlet?action=GetHeaderDetails', function(data) { // No I18N
				json = {ids: json.ids, is_msp: isMSP, is_list: false, names: [jQuery('#CIDet_CIName span').html()]};
				$unapproved_req.renderACInfo(json);
			});
		}
		}
  	},
  	renderACInfo: function(json) {
  		if (json.ids.length > 0) {
	      	if (json.is_wo && !json.is_wo_view) {
	      		th = jQuery(document);
		      	json.close_action = "$unapproved_req.removeActive()";	// action for close button 	// NO I18N
		     	renderhbs('#unaprov-usr-slidecontent',"approve_unknown_user_tmplt",json,false,'mspaccounts'); // NO I18N
		     	$unapproved_req.slideActive();
	      	}
	      	loadApproveMspUserPopup(json);
	    } else {
	      	showalert("failure", translate('sdp.requester.select'), 'isAutoHide=true'); // NO I18N
	    }
  	},
  	initACSiteDeptSel2: function() {
  		var json = { elementId : 'acList', placeHolder : translate("sdp.msp.selectAccount"), params: '{"module" : "account"}' }; // NO I18N

  		if (isMSPOrSCP) {
  			updateSelect2Dropdown(json);
	    }

  		json = { elementId: 'siteList', placeHolder : translate('sdp.inventory.detailAsset.sitedropdown.selectsitemsg'), params: '{"module": "site"}', account_id: 'acList'}; // NO I18N
		updateSelect2Dropdown(json);

  		json = { elementId: 'deptList', placeHolder: translate("sdp.inventory.selectdepartment"), params: '{"module": "department"}', site_id: 'siteList'}; // NO I18N
		updateSelect2Dropdown(json);
  	},
	reject: function(json) {
		json = $unapproved_req.getRequestersInfo(json);

	    if (json.len < 1) {
	    	showalert('failure', translate('sdp.requester.select'), 'isAutoHide=true'); // NO I18N
	    	return;
	    }

	    var msg = '<span class="pl30 ml30 mt-5 disp-b">' + translate('sdp.reject.warningmessage') + '</span>', // NO I18N
	    	rejectTxt = translate('common.reject'),
	    	param = 'title=' + rejectTxt + ', message=' + msg + ', submitbutton=' + rejectTxt + ', cancelbutton=' + translate('sdp.common.cancel') + ', closebutton=no, closeOnEscKey=yes'; // NO I18N

        showconfirm(true, param, reject);

        function reject(isAllowed) {
            if (isAllowed) {
            	var ids = json.ids;
            	var successCallBack = null;
            	if(json.is_wo) {
	            	var successCallBack = function(response) {
	            		location.href = '/WOListView.do?isRejected=true'; // NO I18N
	            	}
            	}
            	userList.rejectUserAction(ids, successCallBack);
	        }
        }
	},
	markSpam: function (json) {
		json = $unapproved_req.getRequestersInfo(json);

	    if (json.len < 1) {
	    	showalert('failure', translate('sdp.requester.select'), 'isAutoHide=true'); // NO I18N
	    	return;
	    }

        var msg = '<span class="pl30 ml30 mt-5 disp-b">'+ translate('sdp.spam.warningmessage') +'</span>', // NO I18N
	    	param = 'title=' + translate('sdp.reject.spam') + ', message=' + msg + ', submitbutton=' + translate('common.reject') + ', cancelbutton=' + translate('sdp.common.cancel') + ', closebutton=no, closeOnEscKey=yes'; // NO I18N

        showconfirm(true, param, rejectNMarkSpam);

        function rejectNMarkSpam(isAllowed) {
            if (isAllowed) {
            	var ids = json.ids;
            	var successCallBack = null;
            	if(json.is_wo) {
	            	var successCallBack = function(response) {
	            		location.href = '/WOListView.do?isRejected=true'; // NO I18N
	            	}
            	}
            	userList.markUserAsSpan(ids, successCallBack);
	        }
        }
	},
	renderMerge: function(json) {
		json = $unapproved_req.getRequestersInfo(json);

		if (json.ids.length > 0) {
			jQuery('#mergeViewData').data(json);
   			NewWindow('SearchRequester.do?fromModule=requester&=requester', 'selectuser', '1000', '550', 'yes', 'center'); // NO I18N
	    } else {
	      	showalert('failure', translate('sdp.requester.select'), 'isAutoHide=true'); // NO I18N
	    }
	},
	merge: function(json) {
		if (confirm(translate('sdp.merge.warningmessage'))) {
		var obj, sourceId = '#mergeViewData'; // NO I18N

		if (json.is_list) {
			sourceId = '#mergeListData'; // NO I18N
		}
		obj = opener.jQuery(sourceId).data();
			obj.parentid = jQuery('[name=parentUserList]:checked').val();
			obj.parent_user_id_type = jQuery('[name=parentUserList]:checked').attr("id_type");
			obj.childids = obj.ids;
			obj.is_ci_id = true;

			if (obj.parentid != undefined) {
			sdpAjax({
		        url: $unapproved_req.user_mode_url + 'mode=merge', //No I18N
		        type: 'POST', // NO I18N
		        async:false,
				ignorefailuremessage: true,
		        data: {input_data : Object.toJSON(obj)},
		        success: function(data) {
			        	if (data.status === 'failure') {
			        		showalert('failure', data.msg, 'isAutoHide=true'); // NO I18N
			        	} else {
		        	window.close();
					opener.location.href = $unapproved_req.user_mode_url + 'isMerged=true'; // NO I18N
		    	}
			    	}
		    });
		} else {
			showalert('failure', translate('sdp.merge.parent.select'), 'isAutoHide=true'); // NO I18N
		}  		
		} 		
  	},
  	handleWOUserAction: function(obj, json) {
  		var woId = obj.getAttribute('data_wo_id');

  		jQuery.getJSON('/api/v3/requests/' + woId, function(data) { // No I18N
  			var woJson = data.request, requesterJson = woJson.requester, th = jQuery(document), tempSource, dialogId = '#wo_unaprov_usr_ui', // NO I18N
  				popupCssJson = {title: translate('sdp.admin.user.userdetails.usersInfo'), css_class: 'un-appr-ui', freeze_background: false, // NO I18N
  				dialog_id: '#wo_unaprov_usr_ui', freeze_layer_id: '#unaprov-usr-freezlayer', slide_content_id: '#unaprov-usr-slidecontent', // NO I18N
  				width: 640, height: 440};

  			woJson.showReject = true;
  			if(isSCP) {
	  			woJson.showReject = false;
  			}
  			requesterJson.requester_id = obj.getAttribute('data_requester_id');

	  		renderhbs(dialogId, "wo_approval_popup", woJson, false, 'msprequest');	// No I18N

  			$unapproved_req.openPopup(popupCssJson);

  			// Binding action links/buttons from popup
       		$unapproved_req.bindCoreElements(json);
		});
  	},
    selectors: function(json) {	// Get & Return Required Selectors
    	var approveDialog = jQuery(json.dialog_id), resultJson = {approveDialog : approveDialog};

        if (json.freeze_layer_id !== undefined) {
        	resultJson.freezLayer = approveDialog.siblings(json.freeze_layer_id);
        }
        if (json.slide_content_id !== undefined) {
        	resultJson.slideContent = approveDialog.siblings(json.slide_content_id);
        }
        return resultJson;
    },
    openPopup: function(json) {	// User Approve Dialog Box
    	var obj = this;
        // Load HTML Content to this ID
        
        obj.allSelectors = obj.selectors(json);

        obj.allSelectors.approveDialog.dialog({
            title: json.title,
            dialogClass: json.css_class,
            draggable: true,
            modal: json.freeze_background,
            autoOpen: true,
            width: json.width,
            height: json.height,
            resizable: false,
            closeOnEscape: true,
            position: [ 'middle' ]
        });
        
        jQuery('.userfooter :button').blur();

        var slidec = obj.allSelectors.slideContent, freezele = obj.allSelectors.freezLayer;

        if (slidec !== undefined && freezele !== undefined) {
        	obj.allSelectors.approveDialog.after(slidec[0]).after(freezele[0]);

        	obj.allSelectors = obj.selectors(json);
        	obj.removeActive();
        }

        jQuery('select.select2fm').select2();
    },
    slideActive: function() {	// Show Approve Slide content
        this.allSelectors.freezLayer.show();
        this.allSelectors.slideContent.addClass("activeslide");
  	},
    removeActive: function() {	// Hide Approve Slide content
        this.allSelectors.freezLayer.hide();
        this.allSelectors.slideContent.removeClass("activeslide");
  	}
}
var $unapproved_req = new unapproved_user.unapproved_req();
}
// JS methods for Unapproved User feature of MSP/SCP ends