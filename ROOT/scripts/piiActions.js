/* $Id$ */

var privacysetting = {
	editusermap:function(a) {
		jQuery(a).closest('.right-col').find('input').prop('disabled', false).trigger('focus'); //No I18N
		jQuery(a).addClass('hide');
		jQuery(a).parent().find('.common-close-icon3').removeClass('hide');
		jQuery(a).closest('.right-col').find('input').addClass('editMode'); //No I18N
	},
	resetdeleteusermap: function(a) {
		jQuery(a).closest('.right-col').find('input').prop('disabled', true); //No I18N
		var resetValue = jQuery(a).closest('.right-col').find('input').attr('org_val'); //No I18N
		jQuery(a).closest('.right-col').find('input').val(resetValue); //No I18N
		jQuery(a).addClass('hide');
		jQuery(a).parent().find('.common-edit-icon1').removeClass('hide');
		jQuery(a).closest('.right-col').find('input').removeClass('editMode'); //No I18N
	}
}

function getPIIFieldInfo(piiFields){
	var piiFieldInfoTable = '';
	if(piiFields == null || '' == piiFields){
		piiFieldInfoTable = getMessageForKey('sdp.gdpr.pii.piiFieldsNone');
	}
	else{
		piiFieldInfoTable += '<table class=\'pii-tooltip\'>';
		for(var i=0; i<piiFields.length; i++){
			var curVal = piiFields[i];
			var moduleName = Object.keys(curVal)[0];
			var moduleObj = curVal[moduleName];
			var moduleDisplayName = encodeHTML(moduleObj.DISPLAY_NAME);
			var fieldsInfo = moduleObj.FIELD_INFO;
			var fieldStr = '';
			for(var j=0; j<fieldsInfo.length; j++){
				var curField = fieldsInfo[j];
				var fieldName = encodeHTML(curField.FIELD_NAME);
				fieldStr += fieldName;
				fieldStr += ',&nbsp;'; //No I18N
			}
			if(fieldStr != ''){
				fieldStr = fieldStr.substr(0, fieldStr.lastIndexOf(','));
				piiFieldInfoTable += '<tr>';
				piiFieldInfoTable += '<td style=\'width:25%\'><b>' + moduleDisplayName + '</b></td>';
				piiFieldInfoTable += '<td>' + fieldStr + '</td>';
				piiFieldInfoTable += '</tr>';
			}
		}
		piiFieldInfoTable += '</table>';
	}
	return piiFieldInfoTable;
}

function getModifiedAnonymousMap(){
	var nameMapping = jQuery('#anonymousNameMapping_DIALOG').find('.col-fields');
	var anonymousMap = {};
	for(var i=0; i<nameMapping.length; i++){
		var curElement = nameMapping[i];
		var userCiid = jQuery(curElement).find('label').attr('userciid');
		var anonymousName = jQuery(curElement).find('input')[0].value;
		if(anonymousName.trim() == ''){
			alert(getMessageForKey('sdp.gdpr.userdelete.validnamemsg'));
			jQuery(curElement).find('[title=Edit]')[0].click();
			return false;
		}
		anonymousMap[userCiid] = anonymousName;
	}
	return anonymousMap;
}

function showAnonymizationPopup(anonymousMap, piiFields, module){
	var clonedPopupElement = jQuery('#deleteuser').clone(true, true);
	jQuery(jQuery(clonedPopupElement).find('#anonymousNameMapping')[0]).attr('id', 'anonymousNameMapping_DIALOG');
	jQuery(jQuery(clonedPopupElement).find('#anonymousNameMapping_DIALOG').find('div')).empty();
	var piiFieldsTooltip = jQuery(clonedPopupElement).find('#piipopuptooltip');
	if(piiFieldsTooltip != null && piiFieldsTooltip != undefined && piiFieldsTooltip.length > 0){
		jQuery(jQuery(clonedPopupElement).find('#piipopuptooltip')[0]).attr('title', getPIIFieldInfo(piiFields));
        jQuery(jQuery(clonedPopupElement).find('#piipopuptooltip_del')[0]).attr('title', getPIIFieldInfo(piiFields));
	}
	var dialogTitle = getMessageForKey(isSCP && (forwardfrom === "ESM" || window.userList && !userList.isUser) ? "sdp.admin.technician.deletetechnician" : "ae.admin.user.delete");
	if (isSCP && window.userList.isAccountManager) {
		dialogTitle = getMessageForKey("scp.admin.delete.acc.managers");
	}
	if(module != null && "userAnonymizationHandler" == module){
		dialogTitle = isSCP && forwardfrom === "ESM" ? translate("scp.anonymize.reps") : getMessageForKey("sdp.gdpr.useranonymize.anonymize"); //No I18N
        jQuery(jQuery(clonedPopupElement).find('#deleteAndAnonymizeConfirm')[0]).attr('data-page-type', 'ANONYMIZATION_USER');
        jQuery(jQuery(clonedPopupElement).find('#deleteAndAnonymizeConfirm')[0]).text(dialogTitle);
        jQuery(jQuery(clonedPopupElement).find('#isAnonymizeUser')[0]).val(true);
        jQuery(jQuery(clonedPopupElement).find('#anonymizeOption')[0]).attr('class', 'show');
        jQuery(jQuery(clonedPopupElement).find('#deleteAndAnonymizeOption')[0]).remove();
    }
    else{
        jQuery(jQuery(clonedPopupElement).find('#anonymizeOption')[0]).remove();
        jQuery(jQuery(clonedPopupElement).find('#deleteAndAnonymizeOption')[0]).attr('class', 'show');
    }

	for(var i=0; i<anonymousMap.length; i++){
		var curMap = anonymousMap[i];
		var clonedElement = jQuery('#anonymousNameMapping div').children()[0].clone(true, true);
		jQuery(clonedElement).find('label').text(curMap.DISPLAY_NAME);
		jQuery(clonedElement).find('label').attr('userciid', (curMap.ANONYMOUS_NAME).split("ANONYMOUS_")[1]);
		//SD-89754 val() not setting value for cloned element so setAttribute used.
		jQuery(clonedElement).find('input')[0].setAttribute("value", curMap.ANONYMOUS_NAME); //No need to encode here as this value is system generated.
		jQuery(clonedElement).find('input').attr('org_val', curMap.ANONYMOUS_NAME); //No need to encode here as this value is system generated.
		jQuery(jQuery(clonedPopupElement).find('#anonymousNameMapping_DIALOG').children()[0]).append(clonedElement);
	}
	
	showDialog( jQuery(clonedPopupElement).html() ,'title=' + dialogTitle + ',width=600px,modal=yes,closeOnEscKey =yes,closeButton=yes,position=absmiddle',function(){   //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-1"]').off('click').on("click", function(event) { toggleAnonymousMapping(this); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-3"]').off('click').on("click", function(event) { toggleAnonymousMapping(this); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-4"]').off('click').on("click", function(event) { privacysetting.editusermap(this); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-5"]').off('click').on("click", function(event) { privacysetting.resetdeleteusermap(this); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-6"]').off('click').on("click", function(event) { const pagetType = this.getAttribute('data-page-type'); deleteUserHandler(this, pagetType); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-8"]').off('click').on("click", function(event) { deleteTechnician(this); }); //NO I18N
		jQuery('[sdpJs="js-event-UserDeletion-9"]').off('click').on("click", function(event) { closeDialog() }); //NO I18N
	});
	initTooltip('#_DIALOG_CONTENT'); //NO I18N
}

function toggleAnonymousMapping(ele){
	if(jQuery(ele).attr('id') == 'deleteWithAnonymization'){
		jQuery('#anonymousNameMapping_DIALOG').show();
		jQuery('#_DIALOG_CONTENT').find('hr').show();
	}
	else if(jQuery(ele).attr('id') == 'deleteWithoutAnonymization'){
		jQuery('#anonymousNameMapping_DIALOG').hide();
		jQuery('#_DIALOG_CONTENT').find('hr').hide();
	}
}
