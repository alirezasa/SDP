/* $Id$ */

function saveChanges(theForm)
{
	//Submit the form after enabling the orgID html component
	theForm.orgID.disabled=false;
	theForm.submit();
}

function validateHolidayForm(theForm)
{
	if(isEmpty(theForm.date.value))
	{
		alert("Please enter date");
		return false;
	}
	return true;
}

function v3ImageUpload(orgId){
		if(!validateforimage()){
			return false;
		}
		var formData = new FormData();
		var input_logo = jQuery("#organizationLogo").prop("files")[0];//No I18N
		formData.append("input_image", input_logo);  //No I18N

    sdpAjax({
		processData: false,
		contentType: false,
		type: "put", // No I18N
		url: "/api/v3/organization_details/"+orgId+"/images", // No I18N
		data: formData,
		success:function(response){
			var url = response.media["content-url"]; // No I18N
			jQuery('#companylogo').removeAttr("src").attr("src", url);// No I18N
			document.getElementById("organizationLogo").value = "";
		},
		error:function(errormessage){
            jQuery('#alertbox').remove();
            var errormsg=JSON.parse(errormessage.responseText).response_status.messages[0].message;
            if(errormsg === "INVALID_FILE_EXTENSION")
            {
              showalert("failure", translate("sdp.security.invalid.extension"), "isAutoHide=true"); // No I18N
            }
            else if(errormsg === "UNMATCHED_FILE_CONTENT_TYPE")
            {
              showalert("failure", translate("sdp.security.invalid.contenttype"), "isAutoHide=true"); // No I18N
            }
            else if(errormsg === "FILE_SIZE_MORE_THAN_ALLOWED_SIZE")
            {
              showalert("failure", translate("sdp.common.maxattach.message","5"), "isAutoHide=true"); // No I18N
            }
            else if(errormsg === "EMPTY_FILE_NOT_ALLOWED")
            {
              showalert("failure", translate("sdp.common.minattach.message"), "isAutoHide=true"); // No I18N
            }
            else
            {
             showalert("failure", errormsg, "isAutoHide=true");  // No I18N
            }
        }
		});
		return false;
}
