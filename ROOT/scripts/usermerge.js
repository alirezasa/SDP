/* Id */

var userMergeModalOn = false;
var showUserMergeDiagram = false;

function callRedirectCheck(requestId, from) {
    var params = "action=redirectCheck";  // No I18N
    if(from !== undefined) {
        params += "&from=" + from;      // No I18N
    }
    callAjaxRequest('/UserMerge.do', params, requestId);        // No I18N
}

function bulkUserMerge(){
  var techIds = userList.getTableObject().bulkSelect.getSelectedIDs();
	var params = "action=fetchUserMergeListView&from=requesterList";	// No I18N
	var checkedStatus = false;
	var singleCheckStatus = false;
	var selValues = {
	    sduserid : []
	};

    if(techIds==null){
	    alert(getMessageForKey("sdp.admin.usermerge.error.selecterror"));// No I18N
	    return;
	}
	if(techIds.length>=2){
		for(var i=0;i<techIds.length;i++){
	  	 	selValues.sduserid[selValues.sduserid.length] = techIds[i];
		}
		checkedStatus = true;
	}
	if (checkedStatus){
		if (window.Prototype) {
            delete Object.prototype.toJSON;
            delete Array.prototype.toJSON;
		}
        var params2 = (typeof sdpToJSON != 'undefined') ? sdpToJSON(selValues) : JSON.stringify(selValues) ; //NO I18N
        params += "&selValues=" + params2 ; //No I18N
		callAjaxRequest('/UserMerge.do',params,'fetchUserMergeListView'); // No I18N
		parent.invokeProgressIndicator(null, "sdp.admin.settings.technician.loading.message", 'progress');		//No I18N
	} else{
		alert(getMessageForKey("sdp.admin.usermerge.error.selecterror"));// No I18N
	}
}

function constructUserMergeListViewTableHeader(headers){
    var row;
    row = "<tr height=\"23\">";
    row += "<th class=\"tableHeader\"> " + getMessageForKey("sdp.admin.usermerge.display.markparent") + "</th>";
    for(var i=0; i<headers.length; i++){
        row += "<th class=\"tableHeader\">" + getMessageForKey(headers[i]) + "</th>";
    }
    row += "</tr>";
    return row;
}

function enableMergeButton(obj){
	if(jQuery("[id*='_DIALOG_LAYER']").find("#userMergeSubmit").length!=0 && jQuery("[id*='_DIALOG_LAYER']").find("#userMergeSubmit").prop('disabled')){
        jQuery("[id*='_DIALOG_LAYER']").find("#userMergeSubmit").prop('disabled', false); //No I18N
    }
    else if(jQuery("[id*='_DIALOG_LAYER']").find("#merge").length!=0 && jQuery("[id*='_DIALOG_LAYER']").find("#merge").prop('disabled')){
        jQuery("[id*='_DIALOG_LAYER']").find("#merge").prop('disabled',false); //No I18N
    }
}

function constructUserMergeListViewRows(userData, keys, colLen){
    var finalRow = "";
    var tdStyle = "text-overflow:ellipsis; white-space:nowrap; overflow:hidden;"; //No I18N
    if(userData.length==1){
		jQuery('#userMergeSubmit').hide();
		jQuery('#msg-info').hide();
		jQuery('#userMergeMessage').empty();
    }else{
		jQuery('#userMergeMessage').append('<br>');
	}
    for(var i=0; i<userData.length; i++){
        var curRow = "<tr class=\"normal usermerge usermerge-include\" data-value=\"" + userData[i][keys[keys.length-1]] + "\">";
                curRow += "<td class=\"headercheckbox tc\"><input type=\"radio\" name=\"radio\" nonce=\""+sdpNonce+"\">&nbsp;</td>";
        for(var j=0; j<keys.length; j++){
            var value = userData[i][keys[j]]; //No need to encode since it is already encoded
            var len = colLen[j];
            if(len!=-1 && value.length>len){
                curRow += "<td style=\"" + tdStyle + "\"><div rel=\"uitip\" title=\'" + value + "\'>" + value.substring(0, len) + " ...</div></td>"; //NO OUTPUTENCODING
            }
            else{
                curRow += "<td style=\"" + tdStyle + "\">" + value + "</td>"; //NO OUTPUTENCODING
            }
        }
        curRow += "</tr>";
        finalRow += curRow;
    }
    return finalRow;
}

function constructJSONToSubmitFromRequesterView(){
    var submitJSON = {
        parentid : null,
        childids : []
    };
    var selValues = jQuery("[id*='_DIALOG_LAYER'] .usermerge-include");
    var parentCounter = 0;
    var childCounter = 0;
    if (isMSP && window.userAdd && userAdd.isDetailForm) {
        submitJSON.parentid = userAddData.userMerge.parentId;
        submitJSON.childids.push(userAddData.userMerge.childId);
        submitJSON.unknown_user_merge=true;
        return submitJSON;
    }
    if(selValues.length>=2){
        for(var i=0; i<selValues.length; i++){
            var row = selValues[i];
            if(jQuery(row).find('td').eq(0).find('input').is(':checked')){
                submitJSON.parentid = jQuery(row).attr('data-value');
                parentCounter++;
            }
            else{
                submitJSON.childids[childCounter++] = jQuery(row).attr('data-value');
            }
        }
        if(parentCounter==0 || parentCounter>1 || childCounter<1){
            return null;
        }
        return submitJSON;
    }
    return null;
}

function handleUserMergeAjaxResponse(requestObj, module){

    var responseObj = JSON.parse(requestObj.responseText);
    if("success"==responseObj.result){
        if(module=='userMerge'){
            var dialogParams = 'width=450, position=absmiddle,modal=yes,closeButton=no'; //No I18N
            jQuery('#_DIALOG_LAYER').remove();
            showDialog(jQuery('#userMergeDomainChoose').html(), dialogParams); //No I18N
            jQuery( '#_DIALOG_LAYER' ).attr( 'class','parent-domain' );
            jQuery( '#FreezeLayer' ).attr( 'class','parent-domain freezeLayer' );

            document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-12"]').addEventListener("mousedown", function(event) { captureDialog(event) }); //No i18N
document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-13"]').addEventListener("click", function(event) { closeDialog() }); //No i18N
document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-14"]').addEventListener("click", function(event) { enableMergeButton(this) }); //No i18N
document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-15"]').addEventListener("click", function(event) { enableMergeButton(this) }); //No i18N
document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-16"]').addEventListener("click", function(event) { this.disabled=true; callRedirectCheck('userMergeSubmit'); }); //No i18N
document.querySelector('[id*="_DIALOG_CONTENT"] [sdpJs="js-event-UserMergeDef-17"]').addEventListener("click", function(event) { closeDialog() }); //No i18N
        }
        else if(module=='userMergeSubmit'){
            if (window.Prototype) {
                delete Object.prototype.toJSON;
                delete Array.prototype.toJSON;
            }
            var toSubmitJSON = constructJSONToSubmit();
            if(toSubmitJSON!=null){
                toSubmitJSON = encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(toSubmitJSON) : JSON.stringify(toSubmitJSON) ); //NO I18N
                callAjaxRequest('/UserMerge.do', 'action=submitUserData&from=mergeView&userData='+toSubmitJSON,'userMergeUserDataSubmit');
            }
        }
        else if(module=='userMergeUserDataSubmit' || module=='userMergeUserDataSubmitListView'){
            userMergeModalOn = true;
            var msg = responseObj.msg;
            jQuery('#usermergesummaryalertmsg').text(msg);
            jQuery('body').addClass('active');
            showDialog(jQuery('#usermergesummaryalert').html(),'modal=yes,closeButton=no,position=absmiddle,width=475');
            var redirection;
            if(isMDHSetup == 'false'){
                redirection = '/SetUpWizard.do?forwardTo=requester'; //No I18N
            }else{
                redirection = '/ESM.do?type=users'; //No I18N
            }
            if (isMSP && userList.forwardTo === "details") {
                userList.redirectTo("list");//No I18N
            } else {
                setInterval(function(){
                    window.location.href = redirection;
                }, 10000);
            }
            document.querySelector('[id*="_DIALOG_CONTENT"] #Mergeclose').addEventListener("click", function(event) { closeDialog(); window.location=redirection });
        }
        else if(module=='userMergeRedirect'){
            // SD-96645 : Hardcoding url to resolve stored xss issue.
            var redirectURL = '/UserMerge.do?action=selectFilter'; //No I18N
            if(isMDHSetup == 'true'){
                jQuery("#mdhSection-content").load(redirectURL+"&mdh=true"); //No I18N
            }else{
				window.location=redirectURL;
            }
        }
        else if(module=='fetchUserMergeListView'){
            //Populate the table
            var viewData = responseObj.listViewObject;
			var currMsg = jQuery('#userMergeMessage').html();
            jQuery('#userMergeListViewTable').empty();

            if(responseObj.msg == "show"){
                var uiData = viewData.uiData;
                var headers = uiData.userMergeHeaders;
                var keys = uiData.userMergeKeys;
                var colLen = uiData.userMergeLenList;
                var headerHTML = constructUserMergeListViewTableHeader(headers);
                var rowHTML = constructUserMergeListViewRows(viewData.userData, keys, colLen);
                jQuery('#userMergeListViewTable').append(headerHTML);
                jQuery('#userMergeListViewTable').append(rowHTML);
				if(responseObj.info != undefined){
				    var prevMsg = jQuery('#userMergeMessage').text();
				    jQuery('#userMergeMessage').text(prevMsg + responseObj.info);
				}
            }else{
				jQuery('#userMergeSubmit').hide();
				jQuery('#msg-info').hide();
				jQuery('#userMergeMessage').text(responseObj.info);
			}
            var dialogParams = 'modal=yes,closeButton=yes,width=1200,position=absmiddle,title=' + getMessageForKey("sdp.admin.usermerge.mergeuser"); //No I18N
            showDialog(jQuery('#userMergeListView').html(), dialogParams);
            // initTooltip(); // Not Needed
            jQuery('#userMergeListViewTable').empty();
			jQuery('#msg-info').show();
			jQuery('#userMergeSubmit').show();
			jQuery('#userMergeMessage').text(currMsg);
            document.querySelector('[id*="_DIALOG_CONTENT"] #userMergeSubmit').addEventListener("click", function(event) { this.disabled=true;userMergeSubmit('listView'); }); //No i18N
            document.querySelector('[id*="_DIALOG_CONTENT"] #userMergeClose').addEventListener("click", function(event) { closeDialog(); }); //No i18N
            jQ('[id*="_DIALOG_CONTENT"] #userMergeListViewTable [type="radio"]').on("click", function(event) { enableMergeButton(this); }); //No i18N
        }
        else if(module=='userMergeSubmitListView'){
            if (window.Prototype) {
                delete Object.prototype.toJSON;
                delete Array.prototype.toJSON;
            }
            var toSubmitJSON = constructJSONToSubmitFromRequesterView();

            if(toSubmitJSON!=null){
                toSubmitJSON = encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(toSubmitJSON) : JSON.stringify(toSubmitJSON) ); //NO I18N
                callAjaxRequest('/UserMerge.do', 'action=submitUserData&from=listView&userData='+toSubmitJSON,'userMergeUserDataSubmitListView');
            }
        }
    }
    else{
        userMergeModalOn = true;
        var msg = responseObj.msg;
		var msgtype = responseObj.msgtype;
        jQuery('#usermergemsgalertmsg').text(msg);
        jQuery('body').addClass('active');
        showDialog(jQuery('#usermergemsgalert').html(),'modal=yes,closeButton=no,position=absmiddle,width=475'); //No I18N
        var redirection;
            if(isMDHSetup == 'false'){
                redirection = '/SetUpWizard.do?forwardTo=requester'; //No I18N
            }else{
                redirection = '/ESM.do?type=users'; //No I18N
            }
        document.querySelector('[id*="_DIALOG_CONTENT"] #Mergeclose').addEventListener("click", function(event) { closeDialog();window.location.href = redirection; });
		if(msgtype != null && "warning" == msgtype){
			jQuery('#_DIALOG_LAYER #usermergemsgalertmsgicon').removeClass('sdp-glyph-failure').removeClass('text-danger').addClass('sdp-glyph-warning').addClass('text-warning');
			jQuery('#_DIALOG_LAYER #usermergemsgalerttitle').text(getMessageForKey('sdp.admin.usermerge.mergealert'));
		}
		//User merge page: By default animations are applied to dialog layer. Adding the additional classes to exclude animation for message.
		if(module=='userMerge'){
			jQuery('#_DIALOG_LAYER').attr('class','parent-domain');
			jQuery('#FreezeLayer').attr('class','parent-domain freezeLayer');
		}
    }
}

function userMergeSubmit(fromModule){
    if(fromModule!=null && "mergeView"==fromModule){
        var selValues = jQuery('.merge-list-selected');
        if(selValues!=null && selValues.length>0){
            if(selValues.length%2 && selValues[0].className!='merge-list-selected'){
                window.alert(getMessageForKey("sdp.common.unexpectederror")); //No I18N
            }
            else{
                callRedirectCheck('userMerge');         // No I18N
            }
        }
    }
    else if(fromModule!=null && "listView"==fromModule){
        if(jQuery("[id*='_DIALOG_LAYER'] .usermerge-include").length<2){
        alert(getMessageForKey("sdp.admin.usermerge.error.selecterror"));
        }
        else{
            callRedirectCheck('userMergeSubmitListView');   // No I18N
        }
    }
}

//Script moved to UserScripts.js to avoid conflicts
// function ajaxRequestOnSuccess( requestObj, module ){}

function updateButtonStatus(){
    //Apply filter button status handler
    var selDomains = jQuery('#selectdomain').select2('data');//No I18N

    if(selDomains==null || (selDomains!=null && selDomains.length!=2)){
        //disablesearch
        jQuery('#Search').prop('disabled',true); //No I18N
    }
    else{
        jQuery('#Search').prop('disabled', false);//No I18N
    }
}

function validateUserMergeFilters(el) {
    var selDomains = jQuery('#selectdomain').select2('data');//No I18N

    if(selDomains!=null && selDomains.length==2){
        //make ajax call
        var selOption = jQuery('#filter1').val();
        var params = {
            criteria : null,
            domainOptions : null
        };
        var domainOptions = {
            domain1 : null,
            domain2 : null
        };
        //Selected domains may be out of order. Have to reshuffle if required before submission.
        var commonNone = getMessageForKey("common.none");
        if(selDomains[0].text==commonNone){
            domainOptions.domain1 = selDomains[1].text;
            domainOptions.domain2 = "None";
        }
        else if(selDomains[1].text==commonNone){
            domainOptions.domain1 = selDomains[0].text;
            domainOptions.domain2 = "None";
        }
        else{
            //Ensure the selected domains are submitted in alpha order since they are rendered in alpha order only.
            if(selDomains[0].text < selDomains[1].text){
                domainOptions.domain1 = selDomains[0].text;
                domainOptions.domain2 = selDomains[1].text;
            }
            else{
                domainOptions.domain1 = selDomains[1].text;
                domainOptions.domain2 = selDomains[0].text;
            }
        }
        params.criteria = selOption;
        domainOptions.domain1 = encodeURIComponent(domainOptions.domain1);
        domainOptions.domain2 = encodeURIComponent(domainOptions.domain2);
        params.domainOptions = domainOptions;

        if (window.Prototype) {
            delete Object.prototype.toJSON;
            delete Array.prototype.toJSON;
        }
        var finalParams = (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) ; //NO I18N
        if (isMDHSetup === 'true') {
            var data = {
                'action': 'submitFilter',   //No I18N
                'selFilters': finalParams   //No I18N
            };
            jQuery("#mdhSection-content").load("/UserMerge.do", data); //No I18N
		}else{
			jQuery(document.body).append(
            '		<form id="toSubmitForm" action="/UserMerge.do" method="POST">' + 
                '	<input type="hidden" name="action" value="submitFilter">' +
                '	<input type="hidden" id="selFilters" name="selFilters">' +
                '	<input type="hidden" name="'+getCSRFParamName()+ '" value="'+getCSRFParamValue()+'">' +
            		'</form>');
        		jQuery('#selFilters').val(finalParams);
			jQuery('#toSubmitForm').trigger('submit');
		}
    }
    else{
        alert(getMessageForKey("sdp.admin.usermerge.error.domainerror"));
    }
}

 function updateMergeButtonStatus(element_name){
    element_name_jQuery = '#' + element_name;
    var selectedElement = jQuery(element_name_jQuery);

    var n = jQuery(selectedElement).attr('name'); //No I18N
    tr = jQuery(selectedElement).closest('tr'); //No I18N
    prevtr = tr.prev();
    if((prevtr==null || prevtr.length==0) && jQuery('tr td input[type="checkbox"]').length!=1){
        c = jQuery(selectedElement).is(':checked'); //NO I18N
        jQuery('tr td input[type="checkbox"]').prop('checked', c); //No I18N
        if(c){
            jQuery('tr td input[type="checkbox"]').closest('tr').addClass('merge-list-selected'); //No I18N
            jQuery(selectedElement).closest('tr').removeClass('merge-list-selected'); //No I18N
            if(jQuery('#merge-user').prop('disabled')==true){
                jQuery('#merge-user').prop('disabled', false); //No I18N
            }
        }
        else{
            jQuery('tr td input[type="checkbox"]').closest('tr').removeClass('merge-list-selected'); //No I18N
            if(jQuery('#merge-user').prop('disabled')==false){
                jQuery('#merge-user').prop('disabled', true); //No I18N
            }
        }
    }
    else if(jQuery('tr td input[type="checkbox"]').length!=1){
        prev = tr.prev('tr:not(".searchRow")').find('input[name="'+n+'"]'); //No I18N
        next = tr.next().find('input[name="'+n+'"]'); //No I18N
        inputN = prev.length > 0 ? prev : next;
        c = jQuery(selectedElement).is(':checked'); //NO I18N
        inputN.prop('checked',c); //NO I18N
        if(c){
            inputN.closest('tr').addClass('merge-list-selected'); //No I18N
            tr.addClass('merge-list-selected');
            if(jQuery('tr td input[type="checkbox"]').length-1 == jQuery('.merge-list-selected').length){
                jQuery('th input[type="checkbox"]').prop('checked', c); //No I18N
            }
            if(jQuery('#merge-user').prop('disabled')==true){
                jQuery('#merge-user').prop('disabled', false); //No I18N
            }
        }
        else{
            inputN.closest('tr').removeClass('merge-list-selected'); //No I18N
            tr.removeClass('merge-list-selected');
            jQuery('th input[type="checkbox"]').prop('checked', c); //No I18N
            if(jQuery('.merge-list-selected').length==0 && jQuery('#merge-user').prop('disabled')==false){
                jQuery('#merge-user').prop('disabled', true); //No I18N
            }
        }
    }
 }

function updateTotalDuplicateCount(totalCount){
    if(jQuery('#totalDuplicateCount')!=null){
        jQuery('#totalDuplicateCount').text(totalCount);
        submitRowFixed(); //To handle repositioning submit div when no data is available for search criteria and container height is reset.
    }
}

function updatePageLength(id){
    var uniqueId = getUniqueId(id);
    var pl = parseInt(stateData[uniqueId]._PL,10) * 2;
    updateState(uniqueId, "_PL", pl.toString());
}

function onHoverHighlight(tableName){
    var element = '#' + tableName + '_TABLE tr';
    jQuery(element).on('mouseover',
        function(e) {
            var n = jQuery(this).find('input:checkbox').attr('name');
            var inputElement = '#' + tableName + '_TABLE input[name="'+n+'"]'; //No I18N
            jQuery(inputElement).closest('tr').addClass('merge-listbg'); //No I18N
        }
    );
    jQuery(element).on('mouseout',
        function(e) {
            var inputElement = '#' + tableName + '_TABLE tr';
            jQuery(inputElement).removeClass('merge-listbg'); //No I18N
        }
    );
}

function usermergeClose(){
    closeDialog();
    var redirection;
    if(forwardfrom === "ESM"){ //No I18N
        redirection = '/ESM.do?type=users'; //No I18N
    }else{
        redirection = '/SetUpWizard.do?forwardTo=requester'; //No I18N
    }
    if (isMSP && userList.appliedFilter !== "unapproved") {
        window.location.href = redirection;
    }
}
