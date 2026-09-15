/* $Id$ */

var SCCMDetails = (function(){
	
	var SCCMDetails = {};
		 
	var setSCCMDetails = function(callback){
		// Adding PersistentAccountId in URL for SDP-MSP, to persist the account.
		var callUrl = "/SCCMScanSettings.do?action=getAll";//NO I18N
		if(isMSP)
        {
        	callUrl += "&persistentAccountId=" + getAccountId();//NO I18N
        }
		jQuery.get(callUrl, function(data){
			SCCMDetails = jQuery.parseJSON(data);
			if(callback != null){
				callback(SCCMDetails);
			}
		});
	}

	var getSCCMDetails = function(){
		return SCCMDetails;
	}

	return{
			setDetails: setSCCMDetails,
			getDetails: getSCCMDetails
		}

}());

// MSP Specific Code - Settings persistentAccountId to persist the account.
if(isMSP)
{
	var url = window.location.href;

	function ReloadOnAccountRefresh()
	{
		const urlParams = new URLSearchParams(window.location.search);
		if(urlParams.get('persistentAccountId'))
		{
			urlParams.set('persistentAccountId', getAccountId()); //NO I18N

			const newUrl = window.location.pathname + '?' + urlParams.toString();
			window.history.replaceState({}, '', newUrl);
			window.location.href = newUrl;
		}
		else
		{
			window.location.href=url+"&persistentAccountId="+ getAccountId();
		}
	}
}

var SCCMList = (function(){

	 	var clearList = function(){
		 jQuery('#SccmList').empty();
	 	}

	 	var loadList = function(details){
	 		clearList();
	 		if(details.LENGTH == 0){
	 			displayEmptyList();
	 		}

	 		for(i=0;i<details.LENGTH;++i){
	 			appendNodeToExistingList(details.SCCMDETAILS[i]);
	 		}
	 		return false;
	 	}

	 	var displayEmptyList = function(){
	 		var appendThis = '<tr id="emptyCustomList" style=""><td class="vtop" width="1%">';
	 		appendThis = appendThis + '<div class="p15 tc"> ' + translate('sdp.discovery.sccm.admin.noconfig') + ' <a href="/" id="configureSCCM" class="text-primary"> '+ getMessageForKey('sdp.discovery.sccm.admin.addconfig') +' </a></div></td></tr>';                                                                                                           //NO I18N
	 		jQuery("#SccmList").append(appendThis);
	 	}

		 var setMouseHoverAndMouseLeave = function(jQueryObject){
			jQueryObject.on("mouseover", function(event) {
			   showSccmToolTip(jQuery(this).parent());
		   }).on("mouseleave", function(event){
			   hideSccmToolTip();
		   });
		}

	 	function appendNodeToExistingList(node){

	 		if(node.NEWWS == ''){
	 			node.NEWWS = getMessageForKey('sdp.inventory.audit.nochanges');
	 		}

	 		if(node.REMOVEDWS == ''){
	 			node.REMOVEDWS = getMessageForKey('sdp.inventory.audit.nochanges');
	 		}
	 		var tableId = 'sccm_'+node.SCCMID;                        //NO I18N
	 		var newNode = jQuery('#sccmSCCMID').clone().attr('id', 'sccm_'+node.SCCMID).css('display','table-row'); //NO I18N

	 		var editId = 'edit_'+node.SCCMID;                      //NO I18N
			newNode.find('#editSCCMID').removeAttr('id').attr('id', editId);     //NO I18N

			var testId = 'check_'+node.SCCMID;                //NO I18N
			newNode.find('#checkSCCMID').removeAttr('id').attr('id', testId);                //NO I18N

			var deleteId = 'delete_'+node.SCCMID;                //NO I18N
			newNode.find('#deleteSCCMID').removeAttr('id').attr('id', deleteId);                //NO I18N

			var sccmNameId = 'sccmName_'+node.SCCMID;                //NO I18N
			newNode.find('#sccmNameSCCMID').removeAttr('id').attr('id', sccmNameId).html(encodeHTML(node.NAME));                //NO I18N

			var sccmDescId = 'sccmDesc_'+node.SCCMID;                //NO I18N
			if(node.DESCRIPTION != ""){
			newNode.find('#sccmDescSCCMID').removeAttr('id').attr('id', sccmDescId).html(encodeHTML(node.DESCRIPTION));                //NO I18N
			}else{
				newNode.find('#sccmDescSCCMID').remove();
			}

			var sccmHostId = 'sccmHost_'+node.SCCMID;                //NO I18N
			newNode.find('#sccmhostSCCMID').removeAttr('id').attr('id', sccmHostId).html(encodeHTML(node.HOSTNAME));                //NO I18N

			var sccmPortId = 'sccmPort_'+node.SCCMID;                //NO I18N
			newNode.find('#sccmportSCCMID').removeAttr('id').attr('id', sccmPortId).html(encodeHTML(node.PORT));                //NO I18N

			var sccmDBId = 'sccmDB_'+node.SCCMID;                //NO I18N
			newNode.find('#sccmdbSCCMID').removeAttr('id').attr('id', sccmDBId).html(encodeHTML(node.DBNAME));                //NO I18N

			var sccmSiteId = 'sccmSite_'+node.SCCMID;                //NO I18N
			newNode.find('#sccmsiteSCCMID').removeAttr('id').attr('id', sccmSiteId).html(encodeHTML(node.SITENAME));                //NO I18N

			var sccmStartId = 'sccmStart_'+node.SCCMID;                //NO I18N
			newNode.find('#startSCCMID').removeAttr('id').attr('id', sccmStartId).html(encodeHTML(node.STARTTIME));                //NO I18N

			var sccmNextTimeId = 'sccmNextTime_'+node.SCCMID;                //NO I18N
			newNode.find('#nextSCCMID').removeAttr('id').attr('id', sccmNextTimeId).html(encodeHTML(node.NEXTSCANTIME));                //NO I18N
            if(isMSP)
            {
            	var sccmAccountName = 'sccmName_'+node.ACCOUNTNAME;//NO I18N
            	newNode.find('#sccmAccountName').removeAttr('id').attr('id', sccmAccountName).html(encodeHTML(node.ACCOUNTNAME));//NO I18N
            }
			if(node.ISRUNNING == 'true'){
				var runningClone = jQuery('#sccmProgressSCCMID').clone().attr('id', 'sccmProgress_'+node.SCCMID).css('display','block'); //NO I18N
				newNode.find('#sccmstatusSCCMID').removeAttr('id').attr('id', 'sccmStatus_' + node.SCCMID).append(runningClone);                //NO I18N
			}else{
			if(node.SCANSTATUS == 'true'){
				var successClone = jQuery('#sccmSuccessSCCMID').clone().attr('id', 'sccmSuccess_'+node.SCCMID).css('display','block'); //NO I18N
				if(node.ISFIRSTSCAN == 'false'){
					successClone.find('#successNotifySCCMID').removeAttr('id').attr('id', 'successNotify_' + node.SCCMID).html('<div align="left"><strong>' + getMessageForKey('sdp.discovery.sccm.tooltip.lastscan') + '</strong><br><strong>' + getMessageForKey('sdp.discovery.sccm.tooltip.newlyadded') + '</strong>' + encodeHTML(node.NEWWS) + '<br><strong>' + getMessageForKey('sdp.discovery.sccm.tooltip.notinnetwork') + '</strong>' + encodeHTML(node.REMOVEDWS) + '</div>');                //NO I18N
				}else{
					successClone.find('#successNotifySCCMID').removeAttr('id').attr('id', 'successNotify_' + node.SCCMID).html('<div align="left"><Strong>' + getMessageForKey('sdp.discovery.sccm.tooltip.firstscansuccess') + '</Strong><br>' + getMessageForKey('sdp.discovery.sccm.tooltip.totalscanned') + ' ' + node.TOTALSCANNEDCOUNT);  //NO I18N
				}
				newNode.find('#sccmstatusSCCMID').removeAttr('id').attr('id', 'sccmStatus_' + node.SCCMID).append(successClone); //NO I18N

				setMouseHoverAndMouseLeave(successClone.find('[sdpJs="js-event-SCCMListViewRow-3"]'));//NO I18N
			//add tool tip here
			}else if(node.LASTSCANID == "0"){
				var noScanClone = jQuery('#sccmNoScanSCCMID').clone().attr('id', 'sccmNoScan_'+node.SCCMID).css('display','block'); //NO I18N
				newNode.find('#sccmstatusSCCMID').removeAttr('id').attr('id', 'sccmStatus_' + node.SCCMID).append(noScanClone);  //NO I18N

				setMouseHoverAndMouseLeave(noScanClone.find('[sdpJs="js-event-SCCMListViewRow-4"]'));//NO I18N

				setMouseHoverAndMouseLeave(noScanClone.find('[sdpJs="js-event-SCCMListViewRow-5"]'));//NO I18N

			}else{
				var failedClone = jQuery('#sccmFailedSCCMID').clone().attr('id', 'sccmFailed_'+node.SCCMID).css('display','block'); //NO I18N
				failedClone.find('#failedReasonSCCMID').removeAttr('id').attr('id', 'failedReason_' + node.SCCMID).show().html('<div align="left">' + getMessageForKey('sdp.discovery.sccm.failurereason') + ' ' + encodeHTML(node.SCANDESC) + '</div>').hide();                //NO I18N
				newNode.find('#sccmstatusSCCMID').removeAttr('id').attr('id', 'sccmStatus_' + node.SCCMID).append(failedClone); //NO I18N

				setMouseHoverAndMouseLeave(failedClone.find('[sdpJs="js-event-SCCMListViewRow-6"],[sdpJs="js-event-SCCMListViewRow-7"]'));//NO I18N
			}
			}
			
	 		jQuery('#SccmList').append(newNode);
	 		
	 		jQuery('#'+editId).on('click', function(){editSccmDetails(node.SCCMID)});
	 		jQuery('#'+testId).on('click', function(){SCCMOperations.checkSCCM(node.SCCMID)});
	 		jQuery('#'+deleteId).on('click', function(){SCCMOperations.deleteSCCM(node.SCCMID)});
	 	}
	 	
	 	
	 	return{
	 		empty: clearList,
	 		load: loadList
	 	}
	 
}());

var SCCMOperations = (function(){
	
	function addNewSccmConfig()
	{
		jQuery('#sccmId').val('0');
		showURLInDialog('SCCMScanSettings.do?action=showSCCMpopUp','modal=yes,title='+ getMessageForKey('sdp.common.new')+ ' '+ getMessageForKey('sdp.discovery.sccm.addedit.topbar') + ',closeButton=yes,width=630,position=absmiddle');  //NO I18N
	}
		
	function deleteSccmDetails(sccmId)
	{
		valid = confirm(getMessageForKey('sdp.discovery.sccm.confirmdelete'));
		if(valid)
			{	
					var params = "action=delete&sccmid="+sccmId;                          //NO I18N
					jQuery.post("/SCCMScanSettings.do?"+params, deleteSccmDetailsSuccess);                      //NO I18N
			}	
	}
	
	function deleteSccmDetailsSuccess(responseObj)
	{
		responseObj = jQuery.parseJSON(responseObj);
		if(responseObj.STATUS == "SUCCESS")
			{
				showalert('success',getMessageForKey('sdp.discovery.sccm.successdelete'),'isAutoHide=true,delay=3,width=auto');                     //NO I18N
				SCCMDetails.setDetails(SCCMList.load);
			}else{
				showalert('failure',getMessageForKey('sdp.discovery.sccm.failuredelete'),'isAutoHide=true,delay=5,width=auto');              //NO I18N
			}
	}
	
	function checkSCCMConnection(sccmId)
	{
		showalert('info',getMessageForKey('sdp.discovery.sccm.testconnection.wait'),'isAutoHide=true,delay=10,width=auto');            //NO I18N
		var params = "action=test&sccmid="+sccmId;            //NO I18N
		jQuery.get("/SCCMScanSettings.do?"+params, checkSccmConnSuccess);                  //NO I18N
	}

	function checkSccmConnSuccess(responseObj)
	{
		
		responseObj = jQuery.parseJSON(responseObj);
		jQuery('#alertbox').children().css('display', 'none');  //NO I18n
		if(responseObj.STATUS == 'SUCCESS')
			{
			showalert('success',getMessageForKey('sdp.discovery.sccm.activeconnection'),'isAutoHide=true,delay=5,width=auto');            //NO I18N
		}else{
			showalert('failure',getMessageForKey('sdp.discovery.sccm.inactiveconnection'),'isAutoHide=true,delay=5,width=auto');            //NO I18N
		}
	}
	
	function validateSCCMSettings(formObj, testNow)
	{
		var sccmName = formObj.sccmName.value.trim();
		var sccmDbName = formObj.sccmDbName.value.trim();
		var sccmHostName = formObj.sccmHostName.value.trim();
		var sccmPort = formObj.sccmPort.value.trim();
		var sccmDate = formObj.sccmStartDate.value.trim();
		var sccmRepeatFreq = formObj.repeatFrequency.value.trim();
		var sccmStartDate = formObj.sccmStartDate_Display.value.trim();
		if(sccmName.length == 0)
			{
			showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidsccmname'),'isAutoHide=true,delay=5,width=auto');             //NO I18N
			return;
			}
		if(sccmHostName.length == 0)
		{
		showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidsccmhostname'),'isAutoHide=true,delay=5,width=auto');       //NO I18N
		return;
		}
		if(sccmDbName.length == 0)
			{ 
			showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidsccmdbname'),'isAutoHide=true,delay=5,width=auto');             //NO I18N
			return;
			}
		if(!(/^[0-9]{1,5}$/.test(sccmPort)))
			{
			showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidsccmPort'),'isAutoHide=true,delay=5,width=auto');               //NO I18N
			return;
			}
		if(sccmPort > 65535)
		{
		showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidsccmPort'),'isAutoHide=true,delay=5,width=auto');               //NO I18N
		return;
		}
			
			if(sccmStartDate.length == 0)
			{
				showalert('failure',getMessageForKey('sdp.discovery.sccm.blankstartdate'),'isAutoHide=true,delay=5,width=auto');               //NO I18N
				return;
			}
			if(sccmRepeatFreq == '0' || !(/^[0-9]+$/.test(sccmRepeatFreq)))
			{
				showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidfrequency'),'isAutoHide=true,delay=5,width=auto');               //NO I18N
				return;
			}
		if(isMSP)
        {
        	var sccmSite = jQuery('#sccmSite').val().trim();
            if(sccmSite == -1)
        	{
        		showalert('failure',getMessageForKey('sdp.purchase.site.mandatory.jsPNameErr'),'isAutoHide=true,delay=5,width=auto');       //NO I18N
        		return;
        	}
        }
		SaveSCCMSettings(formObj, testNow);
	}

	function SaveSCCMSettings(formObj, testNow)
	{
		jQuery('#btnSCCM_Test').prop('disabled', true);  //NO I18N
 		jQuery('#btnSCCM_Save').prop('disabled', true);   //NO I18N
		var date = formObj.sccmStartDate.value;
		var elements_list = formObj.elements;
		var length = elements_list.length;
		var params = "action=save";          //NO I18N
		var sccmArray = jQuery('#sccmForm').serializeArray();
		sccmArray.push({
			'name': 'credId', //NO I18N
			'value': jQuery('#sccmCredential').val().trim() //NO I18N
		});
		sccmArray.push({
			'name': 'siteId', //NO I18N
			'value': jQuery('#sccmSite').val().trim() //NO I18N
		});
		var sccmConf = {sccmConf: sccmArray};
		params = params + "&sccmConf=" + encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(sccmConf) : JSON.stringify(sccmConf) );  //NO I18N
		if(testNow == true)
			{
			params = params + "&testNow=true";                 //NO I18N
			}
		if(document.getElementById('sccmId').value != 0)
		{
			params = params + "&sccmid=" + document.getElementById('sccmId').value;                   //NO I18N
		}
		var csrf_params = "&"+getCSRFParamName()+"="+getCSRFParamValue();
		params = params + csrf_params;
		document.getElementById('sccmId').value = 0;
		jQuery.post("/SCCMScanSettings.do", params, updateSCCMSuccess);              //NO I18N	
	}

	function updateSCCMSuccess(responseObj)
	{
		try{
		responseObj = jQuery.parseJSON(responseObj);
		if(responseObj.TESTNOW == 'SUCCESS' || responseObj.TESTNOW == 'FAILURE'){
			
			if( responseObj.status == 'SUCCESS'){
				if(responseObj.ACTION == 'ADD'){
					if(responseObj.TESTNOW == 'SUCCESS'){
						showalert('success',getMessageForKey('sdp.discovery.sccm.addandtestsuccess'),'isAutoHide=true,delay=3,width=auto');            //NO I18N
					}else{
						showalert('failure',getMessageForKey('sdp.discovery.sccm.addandtestfailure'),'isAutoHide=true,delay=3,width=auto');            //NO I18N
					}			
				}else if(responseObj.ACTION == 'UPDATE'){                                 //NO I18N
					if(responseObj.TESTNOW == 'SUCCESS'){
						showalert('success',getMessageForKey('sdp.discovery.sccm.updatedandtestsuccess'),'isAutoHide=true,delay=3,width=auto');         //NO I18N
					}else{
						showalert('failure',getMessageForKey('sdp.discovery.sccm.updatedandtestfailure'),'isAutoHide=true,delay=3,width=auto');         //NO I18N
					}	
				}
			closeDialog();
			SCCMDetails.setDetails(SCCMList.load);
			}else{
				if(responseObj.ACTION == 'ADD'){
				showalert('failure',getMessageForKey('sdp.discovery.sccm.sccmaddfailure'),'isAutoHide=true,delay=5,width=auto');          //NO I18N
				}else if(responseObj.ACTION == 'UPDATE'){                                            //NO I18N
				showalert('failure',getMessageForKey('sdp.discovery.sccm.sccmeditfailure'),'isAutoHide=true,delay=5,width=auto');            //NO I18N
				} 
			}
		}else{
			if( responseObj.status == 'SUCCESS'){
				if(responseObj.ACTION == 'ADD'){
				showalert('success',getMessageForKey('sdp.discovery.sccm.sccmaddsuccess'),'isAutoHide=true,delay=3,width=auto');            //NO I18N
				}else if(responseObj.ACTION == 'UPDATE'){                                 //NO I18N
				showalert('success',getMessageForKey('sdp.discovery.sccm.sccmeditsuccess'),'isAutoHide=true,delay=3,width=auto');         //NO I18N
				}
			closeDialog();
			SCCMDetails.setDetails(SCCMList.load);
			}else{
				if(responseObj.ACTION == 'ADD'){
				showalert('failure',getMessageForKey('sdp.discovery.sccm.sccmaddfailure'),'isAutoHide=true,delay=5,width=auto');          //NO I18N
				}else if(responseObj.ACTION == 'UPDATE'){                                            //NO I18N
				showalert('failure',getMessageForKey('sdp.discovery.sccm.sccmeditfailure'),'isAutoHide=true,delay=5,width=auto');            //NO I18N
				} 
				else if(responseObj.ISLINUX == 'TRUE'){
					showalert('failure',getMessageForKey('sdp.discovery.sccm.sccmeditfailure.islinux'),'isAutoHide=true,delay=5,width=auto');            //NO I18N
					closeDialog();
				}
			}
		}
		}catch(error){
			parent.window.open('/jsp/AuthError.jsp?module=Error', '_self');
		}
	}
	
	function editSCCMDetails(sccmId)
    {
    		var params = "action=get&sccmid="+sccmId;                      //NO I18N
    		jQuery.get("/SCCMScanSettings.do?"+params, updateFormForEdit);     //NO I18N	
    }

    function updateFormForEdit(responseObj)
    {
    	var sccmConfig = jQuery.parseJSON(responseObj);
    	jQuery('#sccmId').val(sccmConfig.SCCMID);
    	jQuery('#sccmName').val(sccmConfig.SCCMNAME);
    	document.getElementById('sccmDesc').innerHTML = sccmConfig.DESCRIPTION;
    	jQuery('#sccmHostName').val(sccmConfig.HOSTNAME);
    	jQuery('#sccmPort').val(sccmConfig.PORT);
    	jQuery('#sccmDbName').val(sccmConfig.DBNAME);
    	jQuery('#sccmId').val(sccmConfig.SCCMID);
    	jQuery('#sccmStartDate').val(sccmConfig.SCHTIME);
    	jQuery('#sccmStartDate_Display').val(sccmConfig.SCHTIMEDISPLAY);
    	jQuery('#repeatFrequency').val(sccmConfig.REPEATFREQ);
        jQuery("#sccmSite").select2('data', {id: sccmConfig.SITEID, text: sccmConfig.SITENAME}); //NO I18N
        jQuery("#sccmCredential").select2('data', {id: sccmConfig.CREDID, text: sccmConfig.CREDNAME}); //NO I18N
    }
    
    
	return{
			addSCCM: addNewSccmConfig,
			deleteSCCM: deleteSccmDetails,
			checkSCCM: checkSCCMConnection,
			saveSCCM: validateSCCMSettings,
			editSCCM: editSCCMDetails
		}
	
}());


function editSccmDetails(sccmId)
{
	showURLInDialog('SCCMScanSettings.do?action=showSCCMpopUp&editSCCM='+sccmId,'modal=yes,title='+ getMessageForKey('sdp.common.edit')+ ' '+ getMessageForKey('sdp.discovery.sccm.addedit.topbar') + ',closeButton=yes,width=630,position=absmiddle');    //NO I18N
}

function hideSccmToolTip(){
	jQuery('.req-global-tip').hide();
}

function showSccmToolTip(obj){
	
	var pos = jQuery(obj).offset();
	tip_text = '<span style="display: inline-block;transform: rotateY(180deg);" class="sccm-global-tip">';
	tip_text = tip_text + jQuery(obj).find('.sccm-tool-tip').html();
	tip_text = tip_text + '</span>';
	jQuery('.req-global-tip').show().html(tip_text).offset({ top: pos.top-7, left: pos.left-325 });
}
