/*
 * $Id: TFAEnrollment.js,v 1.12.4.1 2018/12/03 16:35:40 kamalraj.d Exp $
 */
//ignorei18n_start
var TFAUserEnrollment = function(){
};
var currentFactor=null;
var resetRSA = false; 
var context = '';
var loginPageURL = 'AppsHome.do?LogoutFromSSO=true';//No I18N

TFAUserEnrollment.setLoginPageURL = function(url)
{
	loginPageURL = url;
}

TFAUserEnrollment.getCookieUsingName=function(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ')
		{
		    c = c.substring(1);
		}
		if (c.indexOf(name) != -1)
		{
		   return c.substring(name.length,c.length);
		}
	}
	return '';
}

TFAUserEnrollment.setCurrentAuthFactor=function(authFactor,isEnrolled)
{
	currentFactor=authFactor;
	if(isEnrolled ==false && (currentFactor=='TFA_SMS_AUTHENTICATOR' || currentFactor == 'TFA_MAIL_AUTHENTICATOR'))
	{
		TFAUserEnrollment.setCurrentView('ENROLL_AUTH',authFactor); //No I18N
	}
	else
	{
		TFAUserEnrollment.setCurrentView('VERIFY_AUTH',authFactor); //No I18N
	}
}

adsjQuery(document).ready(function(){ 
	adsjQuery('#SELECT_AUTH').find('input[type=radio]').click(function(){ //No I18N
		var name =  adsjQuery(this).attr('name'); //No I18N
		adsjQuery('.fw-iradio_minimal').removeClass('checked');  //No I18N
	    adsjQuery('#'+name).addClass('checked'); //No I18N
	});
	adsjQuery('input[type=checkbox]').click(function(){ //No I18N
		if(adsjQuery('#TRUST_BROWSER_CHECKBOX').hasClass('checked'))
		{
			adsjQuery('#TRUST_BROWSER_CHECKBOX').removeClass('checked'); //No I18N
			adsjQuery('#DUO_TRUST_BROWSER_CHECKBOX').removeClass('checked'); //No I18N
			adsjQuery('#RADIUS_TRUST_BROWSER_CHECKBOX').removeClass('checked'); //No I18N
			adsjQuery('#RSA_TRUST_BROWSER_CHECKBOX').removeClass('checked'); //No I18N
			adsjQuery('#enabledDuoCookie').val(false); //No I18N
		}
		else
		{
			adsjQuery('#TRUST_BROWSER_CHECKBOX').addClass('checked'); //No I18N
			adsjQuery('#DUO_TRUST_BROWSER_CHECKBOX').addClass('checked'); //No I18N
			adsjQuery('#RADIUS_TRUST_BROWSER_CHECKBOX').addClass('checked'); //No I18N
			adsjQuery('#RSA_TRUST_BROWSER_CHECKBOX').addClass('checked'); //No I18N
			adsjQuery('#enabledDuoCookie').val(true); //No I18N
		}
	}); 

});

TFAUserEnrollment.selectAuth = function(selectedAuth) {
	TFAUserEnrollment.resetRSAAuthenticator();
	if(selectedAuth==undefined)
	{
		selectedAuth = adsjQuery('.fw-iradio_minimal.checked').attr('id'); //No I18N
	}

	currentFactor = selectedAuth;
	if(selectedAuth=='TFA_RSA_AUTHENTICATOR')
	{
		resetRSA = true; 
		TFAUserEnrollment.setCurrentView('VERIFY_AUTH',selectedAuth); //No I18N
		document.getElementById("RSA_SECRET_KEY").focus();
		return;
	}
	else if(selectedAuth == 'TFA_DUO_AUTHENTICATOR')
	{
		/*We will reload the page as DUO Iframe use cookie which needs to be refreshed*/
		adsjQuery('#loading').css("display", "block");//No I18N
		adsjQuery('#AUTHRULE_NAME').val(selectedAuth); //No I18N
		adsjQuery('#RELOAD_DUO_REQUEST').val(true); //No I18N
		adsjQuery('form[name="TWO_FACTOR_VERIFICATION"]').submit(); //No I18N
	}
	else
	{
		adsjQuery('#loading').css("display", "block");//No I18N
		adsjQuery.ajax({
			url: ((context !== undefined)?context:"")+ '/RestAPI/TwoFactorAction?mTCall=getEnrollmentDetails', //No I18N
		    type: 'POST',
			cache: false,
			data: 'AUTH_RULE='+selectedAuth, //No I18N
			success: function(response)
			{
				var jsonObject = JSON.parse(response);
				/*Redirect to login page error status*/
				if(jsonObject.hasOwnProperty('eSTATUS') && jsonObject.eSTATUS == 'REDIRECT_TO_LOGIN_PAGE')
				{
					TFAUserEnrollment.cancel();
				}
				if(selectedAuth=='TFA_GOOGLE_AUTHENTICATOR' || selectedAuth=='TFA_MS_AUTHENTICATOR')
				{
					TFAUserEnrollment.setCurrentView('VERIFY_AUTH',selectedAuth); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#QR_CODE').attr('src',jsonObject.MODE_DETAILS.PATH); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#AUTH_SECRET_KEY').text(jsonObject.MODE_DETAILS.AUTH_SECRET_KEY); //No I18N
					document.getElementById(selectedAuth + "_SECRET_KEY").focus();
				}
				else if(selectedAuth=='TFA_MAIL_AUTHENTICATOR' || selectedAuth=='TFA_SMS_AUTHENTICATOR' )
				{
					TFAUserEnrollment.setCurrentView('ENROLL_AUTH',selectedAuth); //No I18N
					adsjQuery('#ENROLL_AUTH').find('#'+selectedAuth+'_ENROLLMENT_KEY').val(jsonObject.MODE_DETAILS.AUTH_SECRET_KEY); //No I18N
					document.getElementById(selectedAuth + "_SECRET_KEY").focus();
				}
				else if(selectedAuth=='TFA_RADIUS_AUTHENTICATOR')
				{
					TFAUserEnrollment.setCurrentView('VERIFY_AUTH',selectedAuth); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#AUTH_SECRET_KEY').val(jsonObject.MODE_DETAILS.AUTH_SECRET_KEY); //No I18N
					document.getElementById("TFA_RADIUS_AUTHENTICATOR_SECRET_KEY").focus();
				}
				else if(selectedAuth=='TFA_CUSTOM_TOTP_AUTHENTICATOR')
				{
					TFAUserEnrollment.setCurrentView('VERIFY_AUTH',selectedAuth); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_QR_CODE').attr('src',jsonObject.MODE_DETAILS.PATH); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_AUTH_SECRET_KEY').text(jsonObject.MODE_DETAILS.AUTH_SECRET_KEY); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_ACC_NAME').text(jsonObject.MODE_DETAILS.ACC_NAME_FORMAT); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_ALGORITHM').text(jsonObject.MODE_DETAILS.PASSCODE_HASH_ALGORITHM); //No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_EXP_TIME').text(jsonObject.MODE_DETAILS.PASSCODE_EXP_TIME); ///No I18N
					adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).find('#CUSTOM_TOTP_PASSCODE_LENGTH').text(jsonObject.MODE_DETAILS.PASSCODE_LENGTH); //No I18N
				}
				adsjQuery('#loading').css("display", "none");//No I18N
			}
		});
	}
}

TFAUserEnrollment.sendCode = function(resendCode)
{
	var enrollmentKey = '';
    if(!isEnrolled){
        enrollmentKey = adsjQuery('#ENROLL_AUTH').find('#'+currentFactor+'_ENROLLMENT_KEY').val().trim(); //No I18N
    }
    if( !isEnrolled && currentFactor=='TFA_MAIL_AUTHENTICATOR' && (enrollmentKey==undefined || enrollmentKey=='' || !TFAUserEnrollment.isValidEmail(enrollmentKey)))
	{
		TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_mail_address);
		return;
	}
	else if( !isEnrolled && currentFactor=='TFA_SMS_AUTHENTICATOR' && (enrollmentKey==undefined || enrollmentKey=='' || isNaN(enrollmentKey)))
	{
		TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_phone_number);
		return;
	}
	adsjQuery('#loading').css("display", "block");//No I18N
	adsjQuery.ajax({
		url: ((context !== undefined)?context:"") + '/RestAPI/TwoFactorAction?mTCall=sendSecretCode', //No I18N
		type: 'POST',
		cache: false,
		data: 'AUTH_RULE='+currentFactor+"&ENROLLMENT_KEY="+enrollmentKey.trim(), //No I18N
		success: function(response)
		{
			TFAUserEnrollment.hideStatusMessage();
			adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').val(''); //No I18N
			var jsonObject = JSON.parse(response);

			/*Redirect to login page error status*/
			if(jsonObject.hasOwnProperty('eSTATUS') && jsonObject.eSTATUS == 'REDIRECT_TO_LOGIN_PAGE')
			{
				TFAUserEnrollment.cancel();
			}
			if(jsonObject.hasOwnProperty('IS_SUCCESS') && jsonObject.IS_SUCCESS == true)
			{
				TFAUserEnrollment.setCurrentView('VERIFY_AUTH',currentFactor); //No I18N
				if(resendCode!=undefined && resendCode ==true) /*Show success alert during resend code alone*/
				{
					TFAUserEnrollment.setStatusMessage(true,jsonObject.MESSAGE);
				}		
			}
			else
			{
				TFAUserEnrollment.setStatusMessage(false,jsonObject.ERROR_MESSAGE);
			}	
			adsjQuery('#loading').css("display", "none");//No I18N
		}
	});
}

TFAUserEnrollment.setCurrentView = function(viewName,selectedAuth)
{
	adsjQuery('#SELECT_AUTH').css('display',(viewName == 'SELECT_AUTH') ?'block':'none'); //No I18N
	adsjQuery('#ENROLL_AUTH').css('display',(viewName == 'ENROLL_AUTH') ?'block':'none'); //No I18N
	adsjQuery('#VERIFY_AUTH').css('display',(viewName == 'VERIFY_AUTH') ?'block':'none'); //No I18N
	if(viewName=='ENROLL_AUTH')
	{
		adsjQuery('#ENROLL_AUTH').find('.enrollAuth').hide(); //No I18N
		adsjQuery('#ENROLL_AUTH').find('#'+selectedAuth).show(); //No I18N
	}
	else if(viewName=='VERIFY_AUTH')
	{
		adsjQuery('#VERIFY_AUTH').find('.verifyAuth').hide(); //No I18N
		adsjQuery('#VERIFY_AUTH').find('#'+selectedAuth).show(); //No I18N
	}
	else
	{
		adsjQuery('#ENROLL_AUTH').find('.enrollAuth').hide(); //No I18N
		adsjQuery('#VERIFY_AUTH').find('.verifyAuth').hide(); //No I18N
	}

	if(selectedAuth=='TFA_DUO_AUTHENTICATOR' || selectedAuth=='TFA_RSA_AUTHENTICATOR' || selectedAuth=='TFA_RADIUS_AUTHENTICATOR' )
	{
		adsjQuery('#VERIFY_AUTH_OPERATIONS').hide(); //No I18N
	}
	else if(selectedAuth=='TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR')
	{
		adsjQuery('#VERIFY_AUTH_OPERATIONS_BTN').hide();	//No I18N
		adsjQuery('#TFA_TRY_WITH_BACKUPCODES_INFO').hide(); //No I18N
		adsjQuery('#TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR_VERIFY_OPERATIONS_BTN').show();	//No I18N
		adsjQuery('#VERIFY_AUTH_OPERATIONS').show(); //No I18N
		document.getElementById("TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR_SECRET_KEY").focus();
	}
	else
	{
		adsjQuery('#VERIFY_AUTH_OPERATIONS').show(); //No I18N
		adsjQuery('#VERIFY_AUTH_OPERATIONS_BTN').show();	//No I18N
		adsjQuery('#TFA_TRY_WITH_BACKUPCODES_INFO').show(); //No I18N
	}
}
TFAUserEnrollment.showBackupVerificationCodeAuthenticator=function(){
	prevFactor=currentFactor;
	TFAUserEnrollment.setCurrentView('VERIFY_AUTH','TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR');	//No I18N
}
TFAUserEnrollment.backToCurrentFactor=function(isEnrolled){
	TFAUserEnrollment.setCurrentAuthFactor(prevFactor,isEnrolled);	
}
TFAUserEnrollment.verifyBackupVerificationCode=function(){
	TFAUserEnrollment.setCurrentAuthFactor('TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR',true);	//No I18N
	TFAUserEnrollment.verifyCode();
}
TFAUserEnrollment.back = function(viewName)
{
	adsjQuery('.fw-iradio_minimal.checked').removeClass('checked');  //No I18N
	adsjQuery("#"+currentFactor+".fw-iradio_minimal").addClass('checked');  //No I18N
	if(viewName == 'ENROLL_AUTH' && (currentFactor=='TFA_SMS_AUTHENTICATOR' || currentFactor == 'TFA_MAIL_AUTHENTICATOR'))
	{
		TFAUserEnrollment.setCurrentView('ENROLL_AUTH',currentFactor); //No I18N
	}
	else
	{
		TFAUserEnrollment.setCurrentView('SELECT_AUTH'); //No I18N
	}
	TFAUserEnrollment.hideStatusMessage();
	if(currentFactor=='TFA_RSA_AUTHENTICATOR')
	{
		TFAUserEnrollment.resetRSAAuthenticator();
	}
	TFAUserEnrollment.resetSecretkeyValue();
}

TFAUserEnrollment.cancel = function()
{
	var selectedAuth = adsjQuery('.fw-iradio_minimal.checked').attr('id'); //No I18N
	adsjQuery.ajax({
		url: ((context !== undefined)?context:"") + '/RestAPI/TwoFactorAction?mTCall=sessionInvalidate', //No I18N
		type: 'POST',
		cache: false,
		data: '', //No I18N
		success: function(response)
		{
			TFAUserEnrollment.logout();
		}
	});
}

TFAUserEnrollment.logout =function()
{
    window.location.href=loginPageURL;
}
TFAUserEnrollment.skipTfa = function() {
	document.TWO_FACTOR_VERIFICATION.isSkipTFAEnabled.value = 'true';
	TFAUserEnrollment.verifyCode();
}
TFAUserEnrollment.verifyCode = function(type) {
	var config = {};
	config.AUTH_RULE=(currentFactor!==undefined && currentFactor != null)?currentFactor:(adsjQuery('.fw-iradio_minimal.checked').attr('id')); //No I18N
	config.TRUSTED_BROWSER=adsjQuery('#TRUST_BROWSER_CHECKBOX').hasClass('checked'); //No I18N
	if(document.TWO_FACTOR_VERIFICATION.isSkipTFAEnabled.value === 'true') {
		document.TWO_FACTOR_VERIFICATION.AUTHRULE_NAME.value = config.AUTH_RULE;
		config.IS_SKIPPED = true;
	} 
	else if(currentFactor == 'TFA_GOOGLE_AUTHENTICATOR' || currentFactor == 'TFA_MS_AUTHENTICATOR' || currentFactor == 'TFA_CUSTOM_TOTP_AUTHENTICATOR')
	{
		config.SECRET_KEY = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').val().trim(); //No I18N
		if(config.SECRET_KEY==undefined || config.SECRET_KEY=='')
		{
			TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_secret_code);
			return;
		}
	}
	else if(currentFactor == 'TFA_MAIL_AUTHENTICATOR' || currentFactor =='TFA_SMS_AUTHENTICATOR')
	{
		config.SECRET_KEY = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').val().trim(); //No I18N
		config.AUTH_SECRET_KEY = adsjQuery('#ENROLL_AUTH').find('#'+currentFactor+'_ENROLLMENT_KEY').val(); //No I18N
		if(config.SECRET_KEY==undefined || config.SECRET_KEY=='')
		{
			TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_secret_code);
			return;
		}
	}
	else if(currentFactor == 'TFA_RADIUS_AUTHENTICATOR')
	{
		config.SECRET_KEY = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').val().trim(); //No I18N
		config.AUTH_SECRET_KEY = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#AUTH_SECRET_KEY').val().trim(); //No I18N
		if(config.SECRET_KEY==undefined || config.SECRET_KEY=='')
		{
			TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_secret_code);
			return;
		}
	}
	else if(currentFactor == 'TFA_RSA_AUTHENTICATOR')
	{
		config.TRUSTED_BROWSER=adsjQuery('#RSA_TRUST_BROWSER_CHECKBOX').hasClass('checked'); //No I18N
		var passCode = 0;
		/*RSA Passcode Verification or ODA Passcode Authentication*/
		if(adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_VERIFICATION').css('display')=='block')
		{
			if(adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_VERIFICATION').find('#RSA_PASSCODE').css('display')=='block')
			{
				passCode = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_VERIFICATION').find('#RSA_SECRET_KEY').val(); //No I18N
			}
			else
			{
				passCode = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_VERIFICATION').find('#RSA_NEXT_PASSCODE_KEY').val(); //No I18N
			}
			passCode = passCode.trim();
			if(passCode==undefined||passCode=='')
			{
				TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_secret_code);
				return;
			}
		}
		else if(adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').css('display')=='block')
		{
			passCode = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#RSA_NEW_PIN').val(); //No I18N
			var confirmCode = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#RSA_CONFIRM_PIN').val(); //No I18N
			var pattern = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#RSA_CONFIRM_PIN').attr('patternText'); //No I18N
			passCode = passCode.trim();
			confirmCode = confirmCode.trim();
			if( passCode == undefined || passCode=='')
			{
				TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_enter_valid_pin);
				return;
			}
			else if(passCode!=confirmCode)
			{
				TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_rsa_new_confirm_code_mismatch);
				return;
			}
			else if(passCode.search(new RegExp(pattern))<0)
			{
				TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_rsa_invalid_pattern);
				return;
			}			
		}
		config.PASS_CODE = passCode;
		config.RESET=resetRSA;
	}
	else if(currentFactor == 'TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR')
	{
		config.SECRET_KEY = adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').val().trim(); //No I18N
		if(config.SECRET_KEY==undefined || config.SECRET_KEY=='')
		{
			TFAUserEnrollment.setStatusMessage(false,jsRb.ads_login_twofactor_invalid_backup_code);
			return;
		}
	}
	adsjQuery('#loading').css("display", "block");//No I18N
	adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').attr('disabled','disabled');
	var params = {};
    params.VERIFY_AUTH=JSON.stringify(config);
    if(window.csrfCookieName !== undefined)
    {
        params[FormFields.getCsrfParamName()]=TFAUserEnrollment.getCookieUsingName(window.csrfCookieName);
    }
	adsjQuery.ajax({
		url: ((context !== undefined)?context:"") + '/RestAPI/TwoFactorAction?mTCall=verifySecretCode', //No I18N
		type: 'POST',
		cache: false,
        data:params,
		success: function(response)
		{
			TFAUserEnrollment.hideStatusMessage();
			TFAUserEnrollment.resetSecretkeyValue();
			var jsonObject = JSON.parse(response);
			
			/*Redirect to login page error status*/
			if(jsonObject.hasOwnProperty('eSTATUS') && jsonObject.eSTATUS == 'REDIRECT_TO_LOGIN_PAGE')
			{
				TFAUserEnrollment.cancel();
			}

			if(jsonObject.hasOwnProperty('IS_VALID') && jsonObject.IS_VALID == true)
			{
				if(currentFactor!=undefined)
				{
					adsjQuery('#AUTHRULE_NAME').val(currentFactor); //No I18N
				}
				adsjQuery('form[name="TWO_FACTOR_VERIFICATION"]').submit(); //No I18N
			}
			else
			{
				var errorMessage = jsRb.ads_login_twofactor_enter_valid_secret_code;
				if(jsonObject.hasOwnProperty('ERROR_MESSAGE'))
				{
					errorMessage= jsonObject.ERROR_MESSAGE;
				}
				;
				if(currentFactor=='TFA_RSA_AUTHENTICATOR')
				{
					var errorStatus = false;
					if(jsonObject.hasOwnProperty('ERROR_STATUS'))
					{
						errorStatus = jsonObject.ERROR_STATUS;
					}
					if(errorMessage=='ads_login_twofactor_rsa_new_pin_required')
					{
						resetRSA = false;
						var passCodePolicy = jsonObject.PASS_CODE_POLICY;
						var minLen = passCodePolicy.MIN_LEN;
						var maxLen = passCodePolicy.MAX_LEN;
						var isAlphaNumeric = passCodePolicy.IS_ALPHA_NUMERIC;
						var state = jsRb.ads_login_twofactor_rsa_new_pin_numeric;
						if(isAlphaNumeric)
						{
							state = jsRb.ads_login_twofactor_rsa_new_pin_alphanumeric;
						}
						var helpText = jsRb.ads_login_twofactor_rsa_new_pin_policy.replace("{0}",state);
						helpText = helpText.replace("{1}",minLen);
						helpText = helpText.replace("{2}",maxLen);
						adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#NOTE').text(helpText); //No I18N

						var pattern = ""; //No I18N
						if(isAlphaNumeric) 
						{
							pattern += "^([A-Za-z0-9]+)"; //NO I18N
						}
						else
						{	
							pattern += "^([0-9]+)";	//NO I18N
						}
						if(minLen!='' && maxLen!='')
						{	
							if(pattern=='')
							{
								pattern = "^."; //No I18N
							}
							pattern += "{"+ minLen + "," + maxLen +"}";				//NO I18N
						}
						if(pattern!='')
						{
							pattern += "$";	//NO I18N
						}
						adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#RSA_NEW_PIN').attr('patternText',pattern); //No I18N
						adsjQuery('#VERIFY_AUTH').find('#'+currentFactor).find('#RSA_PIN_CHANGE').find('#RSA_CONFIRM_PIN').attr('patternText',pattern); //No I18N
						TFAUserEnrollment.setStatusMessage(errorStatus,jsRb[errorMessage]);
						TFAUserEnrollment.changeRSAView('RSA_PIN_CHANGE'); //No I18N
						document.getElementById("RSA_NEW_PIN").focus();
					}
					else if(errorMessage == 'ads_login_twofacto_rsa_new_pin_accepted' || errorMessage == 'ads_login_twofactor_rsa_new_oda_pin_accepted')
					{
						resetRSA = false;
						TFAUserEnrollment.setStatusMessage(errorStatus,jsRb[errorMessage]);
						TFAUserEnrollment.changeRSAView('RSA_PASSCODE'); //No I18N
					}
					else if(errorMessage == 'ads_login_twofactor_rsa_next_code_required' )
					{
						resetRSA = false;
						TFAUserEnrollment.setStatusMessage(errorStatus,jsRb[errorMessage]);
						TFAUserEnrollment.changeRSAView('NEXT_PASSCODE'); //No I18N
						document.getElementById("RSA_NEXT_PASSCODE_KEY").focus();
					}
					else
					{
						resetRSA = true; 
						TFAUserEnrollment.setStatusMessage(errorStatus,jsRb[errorMessage]);
						TFAUserEnrollment.changeRSAView('RSA_PASSCODE'); //No I18N
					}
				}
				else
				{
					TFAUserEnrollment.setStatusMessage(false,errorMessage);
				}
				adsjQuery('#VERIFY_AUTH').find('#'+currentFactor+'_SECRET_KEY').removeAttr('disabled');
		        adsjQuery('#loading').css("display", "none");//No I18N
			}	
		}
	});
}

TFAUserEnrollment.cookieValidate=function(authFactor)
{
	adsjQuery('#AUTHRULE_NAME').val(authFactor);//No I18N
	adsjQuery('form[name="TWO_FACTOR_VERIFICATION"]').submit();//No I18N
}

TFAUserEnrollment.isValidEmail = function(str) {
	var regexVal =/^[A-Z0-9_'%=+!`#~$*?^{}&|-]+([\.][A-Z0-9_'%=+!`#~$*?^{}&|-]+)*@[A-Z0-9-]+(\.[A-Z0-9-]+)+$/i; //NO I18N 
	if(regexVal.test(str)||((((str.split('%').length)%2)==1)&&(str.indexOf('%')>-1)))
	{	
		return true;	
	}
	return false;
}

TFAUserEnrollment.hideStatusMessage=function()
{
	adsjQuery('#TFAStatusMessage').css('display','none'); //NO I18N
}
TFAUserEnrollment.resetSecretkeyValue=function()
{
	adsjQuery('.secretValue').val(''); //NO I18N
}
TFAUserEnrollment.setStatusMessage=function(statusType,message)
{
	if(statusType==false)
	{
		adsjQuery('#TFAStatusMessage').css('display','block'); //NO I18N
		adsjQuery('#TFAStatusMessage').removeClass('status-alert-success');  //NO I18N
		adsjQuery('#TFAStatusMessage').find('#ICON').removeClass('fw-icn-status-alert-success');  //NO I18N
		adsjQuery('#TFAStatusMessage').addClass('status-alert-danger'); //NO I18N
		adsjQuery('#TFAStatusMessage').find('#ICON').addClass('fw-icn-status-alert-danger');  //NO I18N
		adsjQuery('#TFAStatusMessage').find('.fw-text-md').text(message); //NO I18N
	}
	else
	{
		adsjQuery('#TFAStatusMessage').css('display','block'); //NO I18N
		adsjQuery('#TFAStatusMessage').removeClass('status-alert-danger'); //NO I18N
		adsjQuery('#TFAStatusMessage').find('#ICON').removeClass('fw-icn-status-alert-danger');  //NO I18N
		adsjQuery('#TFAStatusMessage').addClass('status-alert-success'); //NO I18N
		adsjQuery('#TFAStatusMessage').find('#ICON').addClass('fw-icn-status-alert-success');  //NO I18N
		adsjQuery('#TFAStatusMessage').find('.fw-text-md').text(message); //NO I18N
	}
}

TFAUserEnrollment.changeRSAView=function(viewName)
{
	if( viewName == 'RSA_PIN_CHANGE')
	{
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').hide(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_PIN_CHANGE').show(); //NO I18N
	}
	else if(viewName == 'NEXT_PASSCODE')
	{
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').show(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#NEXT_PASSCODE').show(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#RSA_PASSCODE').hide(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_PIN_CHANGE').hide(); //NO I18N
	}
	else if(viewName == 'RSA_PASSCODE')
	{
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').show(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#NEXT_PASSCODE').hide(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#RSA_PASSCODE').show(); //NO I18N
		adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_PIN_CHANGE').hide(); //NO I18N
	}
}

TFAUserEnrollment.resetRSAAuthenticator=function()
{
	adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').show(); //NO I18N
	adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#RSA_PASSCODE').show(); //NO I18N
	adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_VERIFICATION').find('#NEXT_PASSCODE').hide(); //NO I18N
	adsjQuery('#VERIFY_AUTH').find('#TFA_RSA_AUTHENTICATOR').find('#RSA_PIN_CHANGE').hide(); //NO I18N
}
//ignorei18n_end