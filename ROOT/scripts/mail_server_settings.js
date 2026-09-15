/* $Id$ */

function selectOutgoingConnectionProtocol(ele) {

    var selectedOption = jQuery(ele).attr('id');
    if(selectedOption == "outgoing-mailAPI") {
        showOutgoingSMTP();
    }
    else if(selectedOption == "outgoing-ewsAPI") {
        showOutgoingEWS();
    }
    else if(selectedOption == "outgoing-graphAPI"){
        showOutgoingGraph();
    }
    modifyHistoryElement(selectedOption);
}

function triggerOutgoingOption() {
    var outgoingMailOption = document.EMailDefForm.outgoingMailOption.value;
    if(outgoingMailOption === "ews") {
        jQuery('input[id=outgoing-ewsAPI]').prop("checked",true).trigger("click"); // No I18N
        document.EMailDefForm.outgoingEwsUrl.focus();
    }
    else if("javamail" === outgoingMailOption) {
        jQuery('input[id=outgoing-mailAPI]').prop("checked",true).trigger("click"); // No I18N
        document.EMailDefForm.outgoingHost.focus();
    }
    else if("graph" === outgoingMailOption) {
        jQuery('input[id=outgoing-graphAPI]').prop("checked",true).trigger("click"); // No I18N
        document.EMailDefForm.outGraphEmail.focus();
    }
    disableAuthFields();
}

function enableDisableAuthFields() {
    if ( document.EMailDefForm.requireAuthentication.checked == false) {
        document.EMailDefForm.smtpUserName.disabled = true;
        document.EMailDefForm.smtpUserName.className = 'form-control form-control-auto';
        document.EMailDefForm.smtpPassword.disabled = true;
        document.EMailDefForm.smtpPassword.className = 'form-control form-control-auto';
    }
    else {
        document.EMailDefForm.smtpUserName.disabled = false;
        document.EMailDefForm.smtpPassword.disabled = false;
        if(document.getElementById("oldSmtpPassword")!=null) {
            showSmtpPassword();
        }
        document.EMailDefForm.smtpUserName.focus();
    }
}

function disableAuthFields() {
    if (document.EMailDefForm.requireAuthentication.checked == false) {
        document.EMailDefForm.smtpUserName.disabled = true;
        document.EMailDefForm.smtpPassword.disabled = true;
    }
}

function showSmtpPassword() {
    document.getElementById("oldSmtpPassword").className = "hide";
    document.getElementById("newSmtpPassword").className = "show";
    document.getElementById("changePwdSmtp").value = "true";
    document.EMailDefForm.smtpPassword.focus();
}

function showResetSmtpPwd() {
    document.getElementById("oldSmtpPassword").className = "show";
    document.getElementById("newSmtpPassword").className = "hide";
    document.getElementById("changePwdSmtp").value = "false";
}

function showEwsSmtpPassword() {
    document.getElementById("oldSmtpPassword_ews").className = "hide";
    document.getElementById("newSmtpPassword_ews").className = "show";
    document.getElementById("changePwdSmtp").value = "true";
    document.EMailDefForm.outgoingEwsPassword.focus();
}

function showEwsResetSmtpPwd() {
    document.getElementById("oldSmtpPassword_ews").className = "show";
    document.getElementById("newSmtpPassword_ews").className = "hide";
    document.getElementById("changePwdSmtp").value = "false";
}

function copyToClipboard(selectorId) {
    var copyText = document.getElementById(selectorId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");   // No I18n
    showalert('success',getMessageForKey("auth.oauth.common.redirecturl.copied"),'isAutoHide=true,delay=1');    // No I18n
}

function validateEmailAddress(sEmail) {
    /*
        SD-89478 - Copied the implemenation from the AdminValidateAction.js -> emailCheck method which is being used to
        validate the replyto address. Need to use a single method for all email address validation ( incoming, outgoing,
        test mail ) during the UI revamp.
        */
    var str = sEmail;
    leadingremoved = str.replace(leading,"");
    str = leadingremoved.replace(trailing,"");

    if (str.length > 0)
    {
        var posadr1 = 0;
        var posdot = str.indexOf(".");
        var posadr = str.indexOf("@");
        posadr1=str.lastIndexOf("@");//No I18N
        if ( (posdot < 0) || (posadr < 0) || (posadr1 != posadr) )
        {
            return false;
        }
    }
    var j = str.length;
    var strobj = new String(str);
    if (strobj.charAt(j-1)=="." || strobj.charAt(0)=="@" || strobj.charAt(j-1)=="@" || strobj.charAt(0)=="." || strobj.charAt(0)=="-" ||  strobj.charAt(j-1)=="-" || strobj.charAt(j-1)=="_" || strobj.charAt(j-2)=="." || strobj.charAt(j-2)=="-" || strobj.charAt(j-2)=="_")
    {
        return false;
    }
    return true;
}

function triggerSampleMail(ele) {
    jQuery('#outgoingResult').hide();
    var emailInp = jQuery('#email-test');
    if(emailInp.val() !== '' && validateEmailAddress(emailInp.val())) {
        var authType = jQuery('#outAuthType').val();
        if(jQuery('#outgoing-mailAPI').prop('checked')) {
            mailServer = "javamail"; //No I18N
        }
        else if(jQuery('#outgoing-ewsAPI').prop('checked')) {
            mailServer = "ews"; //No I18N
        }
        else if(jQuery('#outgoing-graphAPI').prop('checked')) {
            mailServer = "graph"; //No I18N
            authType = 'oauth'; //NO I18N
        }
        var this_ = jQuery(ele);
        var msg = this_.button('loading');
        var toaddress = jQuery('#email-test').val();
        testmail('sendSampleMail', toaddress, this_, mailServer, authType); //No I18N
    }
    else if(jQuery.trim(emailInp.val()).length == 0) {
        showconfirm(true,'message='+getMessageForKey("sdp.scatalog.resource.example.ques2")+', cancelbutton=OK, closebutton=no, closeOnEscKey=yes', focusOutgoingTestMail); //No I18N
    }
    else {
        showconfirm(true,'message='+getMessageForKey("sdp.common.email.id.invalid")+', cancelbutton=OK, closebutton=no, closeOnEscKey=yes', focusOutgoingTestMail); //No I18N
    }
}

function focusOutgoingTestMail() {
    jQuery('#email-test').trigger('focus');
}

function submitESMOutgoingForm (form, operation) {
    var button;
    if(operation =="add") {
        button = document.getElementById('addEmailSetting');
    } else {
        button = document.getElementById('editEmailSetting');
    }
    if(!valOutgoingEmail(form)) {
        return;
    }
    if(form.enableDebug.checked) {
         if (form.mailDebugPeriodDays.value.includes(".") || !isInteger(form.mailDebugPeriodDays.value) || (form.mailDebugPeriodDays.value > 30 || form.mailDebugPeriodDays.value < 1)) {
            alert(getMessageForKey("sdp.admin.email.debug.period.days.range", ["1", "30"]));
            form.mailDebugPeriodDays.focus();
            return;
        }
    }
    if(!isEmailDebugEnabledOnLoad && form.enableDebug.checked) {
        showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("sdp.admin.email.debug.consent") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=no, closeOnEscKey=no', function(proceed) {//NO I18N
            if (proceed) {
                button.disabled = true;
                esmOutgoingAjaxSubmit(form);
            }
        });
    } else {
        button.disabled = true;
        esmOutgoingAjaxSubmit(form);
    }

}

function esmOutgoingAjaxSubmit(form) {
    sdpAjax({
        url: "/EMailDef.do",  //No I18N
        async:true,
        cache:false,
        type: 'POST', //No I18N
        data: jQuery(form).serialize(),
        ignorefailuremessage: true,
        complete: function (resp) {
            jQuery("#mdhSection-content").html(resp.responseText);
        }
    });
}

function esmMailChangeOutAuthType(ele) {
    var outval = jQuery(ele).val();
    var outidCheck = jQuery('[name=mailtype]:checked').attr('id');
    var outMail = jQuery('[data-change="outgoing-mailrow"]');
    var outEws = jQuery('[data-change="outgoing-ewsrow"]');
    var outconAuth = jQuery('[data-change="connect-outgoing-auth"]');
    var outconAuthEws = jQuery('[data-change="connect-outgoing-auth-ews"]');
    var outoAuth = jQuery('[data-hide="oauth"]');

    if(outval == "oauth") {
        if(outidCheck == "outgoing-mailAPI") {
            outMail.addClass('hide');
            outconAuth.removeClass('hide');
            outEws.addClass('hide');
            outconAuthEws.addClass('hide');
        } else {
            outMail.addClass('hide');
            outconAuth.addClass('hide');
            outEws.addClass('hide');
            outconAuthEws.removeClass('hide');
        }
        outoAuth.addClass('hide');
        loadProtocolDetails('outgoing', 'oauth'); //No I18N
    } else {
        if(outidCheck == "outgoing-mailAPI"){
            outMail.removeClass('hide');
            outconAuth.addClass('hide');
            outEws.addClass('hide');
            outconAuthEws.addClass('hide');
        } else {
            outMail.addClass('hide');
            outconAuth.addClass('hide');
            outEws.removeClass('hide');
            outconAuthEws.addClass('hide');
        }
        outoAuth.removeClass('hide');
        loadProtocolDetails('outgoing', 'basic'); //No I18N
    }
}

function initializeProxy(isProxyEnabled) {
    if(isProxyEnabled) {
        jQuery('#outJavaBasicProxyEnabled, #outJavaOauthProxyEnabled, #outEwsBasicProxyEnabled, #outEwsOauthProxyEnabled, #outGraphOauthProxyEnabled').removeAttr('disabled'); //No I18N
    }
    else {
        jQuery('#outJavaBasicProxyEnabled, #outJavaOauthProxyEnabled, #outEwsBasicProxyEnabled, #outEwsOauthProxyEnabled, #outGraphOauthProxyEnabled').attr('disabled', 'disabled');
    }
}

function initializeESMOutgoingForm(formValues) {
    if(formValues) {
        initializeProxy(formValues.isProxyConfigured);

        document.getElementsByName('outgoingMailOption')[0].value=formValues.javaOrEws;

        //common
        jQuery('#outAuthType').val(formValues.javaAuthType);
        if(formValues.enableDebug) {
            jQuery('#enableDebug').prop("checked", true); //NO I18N
        }
        jQuery('#mailDebugPeriodDays').val(formValues.mailDebugPeriodDays);

        //Javamail basic auth
        jQuery('#outgoingEmailType').val(formValues.javaBasicProtocol);
        jQuery(formValues.javaBasicTls).prop("checked", true); //No I18N
        if(formValues.smtpAuth) {
            jQuery('#reqAuth').prop("checked", true); //NO I18N
        }
        if(formValues.javaBasicProxy) {
            jQuery('#outJavaBasicProxyEnabled').prop("checked", true); //NO I18N
        }

        //Javamail oauth auth
        jQuery('#outJavaOauthProto').val(formValues.javaOauthProtocol);
        jQuery(formValues.oauthTlsRadioOption).prop("checked", true); //No I18N
        if(formValues.javaOauthProxy) {
            jQuery('#outJavaOauthProxyEnabled').prop("checked", true); //NO I18N
        }
        if(formValues.showOutJavaOauthClientSecret) {
            showClientSecret('outJavaOauthClientSecret'); //No I18N
        }

        //EWS basic auth
        if(formValues.ewsBasicProxy) {
            jQuery('#outEwsBasicProxyEnabled').prop("checked", true); //NO I18N
        }

        //EWS oauth auth
        if(formValues.ewsOauthProxy) {
            jQuery('#outEwsOauthProxyEnabled').prop("checked", true); //NO I18N
        }
        if(formValues.showOutEwsOauthClientSecret) {
            showClientSecret('outEwsOauthClientSecret'); //No I18N
        }

        //Graph Oauth auth
        if(formValues.graphOauthProxy) {
            jQuery('#outGraphOauthProxyEnabled').prop("checked", true); //NO I18N
        }
        if(formValues.showOutGraphOauthClientSecret) {
            showClientSecret('outGraphOauthClientSecret'); //No I18N
        }

        //oauth popup and alert message
        if(formValues.oauthInitUri != 'null') {
            setTimeout(function () {
                NewWindow(formValues.oauthInitUri, 'preferences', '750', '650', 'yes', 'center');        // No I18n
            }, 5000);
        }

        if(formValues.alertMessage) {
            var message = formValues.alertMessage;
            var type = message.type;
            var features = "failure" == type ? "isAutoHide=false" : "timeout=5"; // No I18n
            showalert(type, message.message, features);
        }

    }
}

function showOutgoingEWS() {
    hideOutgoingGraph();
    jQuery('[data-change=outgoing-ewsrow]').removeClass('hide');
    jQuery('.sdtab-pane').find('[data-error-name=errormsg]').remove();
    jQuery('[data-change=outgoing-mailrow]').addClass('hide');
    document.EMailDefForm.outgoingMailOption.value = "ews";//NO I18n
    jQuery('#outgoingResult').hide();
    if(jQuery('#outAuthType').val() == "basic") {
        jQuery('[data-change=connect-outgoing-auth], [data-change=connect-outgoing-auth-ews], [data-change=outgoing-mailrow]').addClass('hide');
        jQuery('[data-change=outgoing-ewsrow]').removeClass('hide');
    } else{
        jQuery('[data-change=connect-outgoing-auth], [data-change=outgoing-ewsrow], [data-change=outgoing-mailrow]').addClass('hide');
        jQuery('[data-change=connect-outgoing-auth-ews]').removeClass('hide');
    }
}

function showOutgoingSMTP() {
    hideOutgoingGraph();
    jQuery('[data-change=outgoing-mailrow]').removeClass('hide');
    jQuery('.sdtab-pane').find('[data-error-name=errormsg]').remove();
    jQuery('[data-change=outgoing-ewsrow]').addClass('hide');
    document.EMailDefForm.outgoingMailOption.value = "javamail";//NO I18n
    jQuery('#outgoingResult').hide();
    if(jQuery('#outAuthType').val() == "basic") {
        jQuery('[data-change=connect-outgoing-auth], [data-change=connect-outgoing-auth-ews], [data-change=outgoing-ewsrow]').addClass('hide');
        jQuery('[data-change=outgoing-mailrow]').removeClass('hide');
    } else {
        jQuery('[data-change=connect-outgoing-auth]').removeClass('hide');
        jQuery('[data-change=connect-outgoing-auth-ews], [data-change=outgoing-mailrow], [data-change=outgoing-ewsrow]').addClass('hide');
    }
    handleSMTPSForJavaOauth();
}

function setAdminGuideLinks() {
    var ele = jQuery('#adminguide-link');
    var link = ele.html();
    link = link.replaceAll('mail-server-configurations','outgoing-mail-server-settings-esm'); //No I18N
    ele.html(link);
}

function renderCustomTrustStoreWarning(mailConfig,mailOption,authType,enabledCustomTrustStoreModuleStr,mailOptionOnPageLoad,authTypeOnPageLoad,failedUrls){
    var customtruststore={};
    //hiding the custom trust store configured section
    var configuredDiv = jQuery('#'+mailConfig+'CustomTrustStoreConfiguredSection');
    configuredDiv.empty();
    configuredDiv.hide();
    //re-intitializing the alert div on authType or mailOption change
    var alertDiv=jQuery('#'+mailConfig+'CustomTrustStoreSection');
    alertDiv.empty();
    var customTrustStoreModule=mailConfig.toUpperCase()+"_"+mailOption.toUpperCase()+"_"+authType.toUpperCase()+"_MAIL_SERVER";//No I18n

    //When the custom truststore module is already enabled for the provided mail configuration, show configured warning.
    if(enabledCustomTrustStoreModuleStr.indexOf(customTrustStoreModule)!=-1)
    {
        customtruststore.status='configured';//No I18n
        customtruststore.module=customTrustStoreModule;
        renderhbs("#"+mailConfig+"CustomTrustStoreConfiguredSection", "customtruststore-template",customtruststore,false,'admin');// No I18N
        configuredDiv.show();
    }
    //When the mailOption and authType is same as that of page load and failedUrls are present, show the urls in warning.
    else if(mailOption==mailOptionOnPageLoad && authType==authTypeOnPageLoad && failedUrls!=null){
        customtruststore.status='warning';//No I18n
        customtruststore.failedUrls= failedUrls;
        customtruststore.module=mailConfig.substring(0,3).toLowerCase();
        renderhbs("#"+mailConfig+"CustomTrustStoreSection", "customtruststore-template",customtruststore,false,'admin');// No I18N
        alertDiv.show();
    }
}

/*
    SD-123443
    This method checks whether the EWS Oauth is currently configured in the mail server settings during page load.
    If so, shows a warning message div to switch to Graph
*/
function alertO365EWS() {
    let isIncoming = "incoming" === document.EMailDefForm.mailType.value; //No I18N
    let emailDefForm = document.EMailDefForm;
    let mailOption = isIncoming ? document.EMailDefForm.incomingMailOption.value : document.EMailDefForm.outgoingMailOption.value;
    let authType = isIncoming ? document.getElementById("incAuthType").value : document.getElementById("outAuthType").value;
    let errorDiv = "#" + (isIncoming ? "inc" : "out") + "_o365_ews_error"
    if(mailOption === 'ews' && isOffice365EWSConfigured(isIncoming, emailDefForm, authType)) {
        let ele = jQuery(errorDiv);
        if(!jQuery(ele.find('span.msg')).length > 0)
        {
            ele.append(jQuery('#errorMsgContent').html());
            ele.find('div.alert-danger').removeClass('alert-danger').addClass('alert-warning');
        }
        jQuery(ele.find('span.msg')).html(getMessageForKey('mail.save.o365.ews.error'));
        ele.removeClass('hide');
    }
}

function initParserValidator() {
    jQuery('form[name="EMailDefForm"]').removeData("validator").validate({ //No I18N
		rules : {
			titleString : {
				required : true,
				maxlength : 100,
				normalizer: (value) => { return jQuery.trim(value);}
			},
			parseDelimiter : {
				required : true,
				normalizer : (value) => {return jQuery.trim(value);}
			}
		},
		messages : {
			titleString: {
				required: translate("sdp.admin.email.mailparser.subjectError"),
				maxlength: translate("form.value.maximumvalue.alert", ["100"])
			},
			parseDelimiter : {
				required: translate("sdp.admin.email.mailparser.delimiterError")
			}
		},
		errorClass: 'text-danger',      // No I18N
		errorPlacement: function(error, element) {
			error.insertAfter(element);
			error.addClass('alert alert-danger p5 pos-abs').css({
				'overflow': 'visible',      // No I18N
				'width' : 'auto'            // No I18N
			});
		},
		invalidHandler: function(event, validator) {
			if (validator.numberOfInvalids()) {
				jQuery(validator.errorList[0].element).focus();
			}
		}
	});
}

function emailDebugToggleAction() {
    var checkbox = jQuery("#enableDebug").prop("checked"); // No I18N
    jQuery("#mailDebugPeriodDays").attr("disabled",!checkbox);
}