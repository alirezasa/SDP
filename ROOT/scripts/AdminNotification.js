/* $Id$ */
/* Admin->Notification Rules related scripts are in this file.
*/
function checkLength(event){
	var value = jQuery("#AutoSuggestTokenDef").val().replace(/((\r\n)|(\n)|(\r))/g,"<br>");
	if(value.length+1>500){
		if(event.keyCode==8 || event.keyCode==46 ||(event.keyCode>=37 && event.keyCode<=40)){
			return true;
		}
		return false;
	}
	return true;
}
function typeInTextarea(el, newText) {
  var start = el.prop("selectionStart");	//No I18N
  var end = el.prop("selectionEnd");		//No I18N
  var text = el.val();
  var before = text.substring(0, start);
  var after  = text.substring(end, text.length);
  el.val(before + newText + after)
  el[0].selectionStart = el[0].selectionEnd = start + newText.length
  el.focus()
  return false
}
function saveSuggestToken(){
		jQuery("#autovaluesave").prop("disabled", true);		//No I18N	
		jQuery("#lengtherror").hide();
		if((jQuery('#AutoSuggestTokenDef').val().indexOf("$AutoSuggestContent")==-1)){
			jQuery('#autosugerror').show();
			jQuery('#autosugnrm').hide();	
			jQuery("#autovaluesave").prop("disabled", false);	//No I18N	
		}
		else{
			jQuery("#autosugerror").hide();
			jQuery('#autosugnrm').show();
			saveTokenValue();
		}
	}

function saveTokenValue(){
	var tokenVal = jQuery("#AutoSuggestTokenDef").val();
	// tokenVal = tokenVal.replace(/((\r\n)|(\n)|(\r))/g,"<br>");
	// var percentEncodedTokenVal = tokenVal.replace(/%/g, "%25");
	if(tokenVal.length<=500){
		let data = {
			"module": "admin", "action": "saveAutoSuggestToken",		// No I18n
			"tokenValue": encodeURIComponent(tokenVal)	// No I18n
		};
		data[getCSRFParamName()]=getCSRFParamValue();
		jQuery.ajax({
			type: "POST", url: "/servlet/SDAjaxServlet", data: data, 		// No I18n
			contentType: "application/x-www-form-urlencoded; charset=UTF-8", async: false,		// No I18n
			complete: function (response) {
				closeDialog();
                if (response.status === 200 && response.responseText === "true") {		// No I18n
                    parent.suggestOnHover.innerHTML = encodeHTML(tokenVal);
                    showSuccessMessageAndClose(null, translate("common.statusupdated"), 2500);
                } else {
                    showFailureMessageAndClose(response.responseText, 2500);
                }
			}
		});
	}
	else{
		jQuery("#lengtherror").text(getMessageForKey("sdp.admin.notification.email.autosuggesttoken.edit.save.lengtherror"));
		jQuery("#lengtherror").show();
		jQuery("#autovaluesave").prop("disabled", false);	//No I18N
	}
}
