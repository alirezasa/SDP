/*$Id$ */

var tfaAdminConfiguration = {
	ajaxFormSubmit : ['/EMailDef.do'], //NO I18N
	/*
	* init is used to check whether a resource needs TFA or not.
	*/

	init: function(url, method, args, query, event) {

		var urls = url.split("?");

		var urlWithoutParams = urls[0];

		// Removing Extra Params in url and checking for TFA needed or not
		var resourceName = tfaAdminConfiguration.isTFANeededForResource(urlWithoutParams, method, args, query, event, url);

		if (resourceName != null) { // IF TFA needed for an operation

			// If its an form save then
			if (args.isForm) {

				event.preventDefault();

			}

			// Copying Resource Arguments for resave
			temp_args = args;

			temp_args.urlWithoutParams = urlWithoutParams;

			var reauthn_bypass_notenrolled = false;

			if (tfaEnabledResources[urlWithoutParams] === undefined) {

				for (var url in tfaEnabledResources) {

					var urlRegex = new RegExp("^"+url+"$");

					if (urlRegex.test(urlWithoutParams)) {

						reauthn_bypass_notenrolled = tfaEnabledResources[url][0].reauthn_bypass_notenrolled;

						break;

					}

				}

			} else {

				reauthn_bypass_notenrolled = tfaEnabledResources[urlWithoutParams][0].reauthn_bypass_notenrolled;

			}

			reauthn_bypass_notenrolled === 'true'? tfaAdminConfiguration.doPreauth(resourceName) : tfaAdminConfiguration.getSelfEnrollmentConfiguration(resourceName);


		} else { 

			if (args.isForm) {

				args.form.submit();

			} else {

				xmlSendOrig.apply(args.org, args.args);

			}

		}

	},
	
	/*
	* doPreauth method is used to do preauth check for a resource. If TFA configured for a resource then it will return transaction ID
	*/
	doPreauth: function(resourceName) {

		var params = {};
		params['module_name'] = 'SensitiveResources';//NO I18N
		params['resource'] = resourceName;
		sdpAjax({
			url: '/ids-authn/v1/wc/mfa/preauthn', //NO I18N
			type: 'POST',//No I18N
			async: true,
			data: params,
			success: function(response) {
				response.result.txn_id != undefined ? tfaAdminConfiguration.doAuthenticate(response) : (temp_args.is_authn_complete = response.result.preauthn_result != undefined ,  tfaAdminConfiguration.saveOperation());
			},
			error: function() { // try to save the operation if any error occurs in preauth
				//set authentication as incomplete.
				temp_args.is_authn_complete = false;

				tfaAdminConfiguration.saveOperation();
			}
		});
	},

	/*
	*doAuthenticate method is used to fetch an authenticator enrolled for an user
	*/

	doAuthenticate: function(response) {

		const transactionID = response.result.txn_id;
		sdpAjax({
			url: '/ids-authn/v1/wc/mfa/authenticate?txn_id=' + transactionID,//NO I18N
			type: 'get',//No I18N
			success: function(response) {

				var data = {};
				data.transactionID = transactionID;
				data.modeName = response.result.authn_factor_data.factor;

				if (data.modeName === 'GoogleAuthenticator') {
					tfaAdminConfiguration.openOTPDialog(data, translate("mfa.otpdialog.google.title"), 'viewGoogleOTPDialog');//NO I18N
				} else if (data.modeName === 'EmailAuthenticator') {//NO I18N
					data.emailAddress = response.result.authn_factor_data.input_email_id;
					tfaAdminConfiguration.openOTPDialog(data, translate("mfa.otpdialog.mail.title"), 'viewEmailOTPDialog');//NO I18N
				}

			},

			error: function(response) {

				temp_args.is_authn_complete = false;

				tfaAdminConfiguration.saveOperation();

				tfaAdminConfiguration.handleErrorMessage(response,'doAuthenticate');//NO I18N

			}

		});

	},


	
	/*
	* doVerify method is used verify email/google OTP
	*/
	doVerify: function(authenticatorType, transactionID) {

		var authMode;
		var params = {};

		const otpInput = authenticatorType === 'Google-Authenticator' ? document.getElementsByName('googleOTP')[0] : document.getElementsByName('emailOTP')[0]; //NO I18N
		const otp = otpInput.value.trim();

		var url = '/ids-authn/v1/wc/mfa/authenticate'; //NO I18N

		if (authenticatorType === 'Google-Authenticator') {
			authMode = 'google';//NO I18N
			params.totp = otp;

		} else {
			authMode = 'email';//NO I18N
			params.otp = otp;
		}

		params.txn_id = transactionID;
		params.trust_browser = true;

		if (otp.length > 6 || otp.match(/^[0-9]+$/) == null) {
			showalert('failure', translate('ids.authn.mfa.transaction.status_msg.invalid_otp'), 'isAutoHide=true'); //NO I18N
			return false;
		}

		tfaAdminConfiguration.toogleLoadingButton(authMode + 'Auth', true);//NO I18N

		sdpAjax({
			url: url,
			type: 'POST',//No I18N
			data: params,
			success: function(response) {

				tfaAdminConfiguration.toogleLoadingButton(authMode + 'Auth', false);//NO I18N

				if (response.result.status === 'success') {
					tfaAdminConfiguration.closeOTPDialog(true);

					// FInally saving the operation once OTP verified
					tfaAdminConfiguration.saveOperation();

				} else {

					showalert('failure', translate(response.result.status_msg), 'isAutoHide=true'); //NO I18N

				}

			},
			error: function(response) {

				tfaAdminConfiguration.toogleLoadingButton(authMode + 'Auth', false);//NO I18N

				tfaAdminConfiguration.handleErrorMessage(response,'doVerify');//NO I18N

			}

		});

	},
	
		
	handleErrorMessage: function(response,methodType) {
		
		
		let messageInfo = JSON.parse(response.responseText).response_status.messages[0];
		message = messageInfo.message.status_msg;

		if(messageInfo.status_code  == 4002 && methodType !== 'doAuthenticate'){
			temp_args.is_authn_complete = false;

			tfaAdminConfiguration.saveOperation();

			methodType !== 'cancelOTPTranscation' ? tfaAdminConfiguration.closeOTPDialog(true) : ''; //NO I18N
			
		}
		if (message === 'ids.authn.mfa.transaction.status_msg.email_sending_failed') {
			tfaAdminConfiguration.showEmailSendingFailedDialog();
		} else {
			showalert('failure', translate(message), 'isAutoHide=true'); //NO I18N
		}
		
	},
	
	/**
	 * Method used to resend code in case of email authenticator
	 */
	resendCode: function(txn_id) {
		var params = {};
		params['txn_id'] = txn_id;
		params['resend'] = true;
		sdpAjax({
			url: '/ids-authn/v1/wc/mfa/authenticate',//NO I18N
			type: 'POST',//No I18N
			data: params,
			success: function(response) {
				if (response.result.status === 'success') {
					message = response.result.status_msg;
					showalert('success', translate(message), 'isAutoHide=true'); //NO I18N
					tfaAdminConfiguration.resendOTPMailTimerStart();
				} else {
					showalert('failure', translate(response.result.status_msg), 'isAutoHide=true'); //NO I18N
				}
			},
			error: function(response) {

				tfaAdminConfiguration.handleErrorMessage(response,'resendCode'); //NO I18N

			}

		});


	},



	/**
	* Method used to cancel the transaction initiated for an admin operation
	 */
	cancelOTPTranscation: function(txn_id) {
		var params = {};
		params['txn_id'] = txn_id;
		params['cancel'] = true;
		sdpAjax({
			url: '/ids-authn/v1/wc/mfa/authenticate',//NO I18N
			type: 'POST',//No I18N
			data: params,
			success: function(response) {
			    if (response.result.status === 'success') {
					temp_args.is_authn_complete = false;
					tfaAdminConfiguration.closeOTPDialog();
					tfaAdminConfiguration.saveOperation();

				} else {
					showalert('failure', translate(response.result.status_msg), 'isAutoHide=true'); //NO I18N
				}
			},
			error: function(response) {
				tfaAdminConfiguration.handleErrorMessage(response,'cancelOTPTranscation'); //NO I18N

			}

		});
	},
	
	
	/*
	 * getSelfEnrollmentConfiguration method is used to get self configuration of a user.
	 */
	getSelfEnrollmentConfiguration: function(resourceName) {

		sdpAjax({
			url: "/RestAPI/WC/TwoFactorAction?method=getSelfEnrollmentConfiguration", //NO I18N
			type: "POST", //NO I18N
			success: function(tfaSelfConfig) {
				if ((tfaSelfConfig.TFA_USER_DETAILS.hasOwnProperty("PAMMODULE_NAME") && tfaSelfConfig.TFA_USER_DETAILS.PAMMODULE_NAME === 'TFA_MAIL_AUTHENTICATOR') || (tfaSelfConfig.TFA_USER_DETAILS.hasOwnProperty("PAMMODULE_NAME") && tfaSelfConfig.TFA_USER_DETAILS.PAMMODULE_NAME === 'TFA_GOOGLE_AUTHENTICATOR')) {
					tfaAdminConfiguration.doPreauth(resourceName);
				} else {
					if(tfaSelfConfig.CONFIGURED_TFA_ARRAY.length != 0){
						tfaAdminUserEnrollment.initEnrollment(resourceName);
						tfaAdminConfiguration.openUserEnrollDialog();
					}else{
						temp_args.is_authn_complete = false;
						tfaAdminConfiguration.saveOperation();
					}
				}
			}
		});
	},

	
	/*
	 * openUserEnrollDialog method is used to open user enrollment dialog.
	 */
	openUserEnrollDialog: function() {

		jQuery('#user-enroll-container').dialog({
			width: '700px',// NO I18N
			title: translate('mfa.otpdialog.userenroll.heading'), //NO I18N
			position: { my: "top+50", at: "top" }, //NO I18N
			modal: true,
			autoOpen: false,
			resizable: false,
			beforeClose: function() {
				temp_args.is_authn_complete = false;
				tfaAdminConfiguration.saveOperation();
			},
			close: function() {
				jQuery('#user-enroll-container').dialog('destroy');//No I18N
			}

		});
		jQuery('#user-enroll-container').dialog('open');//No I18N
	},
	

	/*
	* openOTPDialog method is used to open an OTP dialog to get OTP in case of email/google authenticator 
	*/
	openOTPDialog: function(data, dialogTitle, dialogType) {

		renderhbs('#otp-container', 'otp-dialog', data, false, 'admin_tfa'); // NO I18N

		jQuery('#otp-container').dialog({
			width: 500,
			title: dialogTitle,
			modal: true,
			resizable: false,
			open: function() {
				if (dialogType == 'viewEmailOTPDialog') {
					tfaAdminConfiguration.resendOTPMailTimerStart();
				}
			},
			close: function() {
				tfaAdminConfiguration.cancelOTPTranscation(data.transactionID);
				jQuery('#otp-container').dialog('destroy');//No I18N
				return false;
			}
		});

	},

	/**
	* Method used to restart Timer for resend code operation
	 */
	resendOTPMailTimerStart: function() {
		let countElem = jQuery('#secur-email-auth .count');
		countElem.parent().removeClass('disp-ib').addClass('hide');
		jQuery('#secur-email-auth #resendotp').addClass('hide');
		var count = 30;
		countElem.text(count);
		countElem.parent().addClass('disp-ib').removeClass('hide');
		tfaAdminConfiguration.countInterval = setInterval(() => {
			if (!count) {
				clearInterval(tfaAdminConfiguration.countInterval);
				jQuery('#secur-email-auth #resendotp').removeClass('hide');
				countElem.parent().removeClass('disp-ib').addClass('hide');
			}
			countElem.text(--count);
		}, 1000);
	},

	/*
	* isTFANeededForResource is used to fetch resource name for an url
	*/
	isTFANeededForResource: function(url, method, args, query, event, originalurl) {

		// check URL available in enabled resources or not.
		if (tfaEnabledResources == null) {

			return null;

		}

		if (tfaEnabledResources.hasOwnProperty(url)) {

			for (var i = 0; i < tfaEnabledResources[url].length; i++) {

				if (tfaEnabledResources[url][i].method.toLowerCase() == method.toLowerCase()) { // checking url method matches 

					if (tfaEnabledResources[url][i].hasOwnProperty('operation_param')) { // checking url having operation param

						if (args.isForm) { // In case of form

							return tfaEnabledResources[url][i].resourceName;

						} else {

							if (tfaAdminConfiguration.getOperationParamValue(args.args[0], tfaEnabledResources[url][i].operation_param, tfaEnabledResources[url][i].operation_value, originalurl)) { // checking operation value matches

								return tfaEnabledResources[url][i].resourceName;

							}

						}

					} else { // if url not having operation-param

						return tfaEnabledResources[url][i].resourceName;

					}

				}

			}

		} else { // If url having regex

			var urlPath = Object.keys(tfaEnabledResources);

			originalURL = url;

			for (i = 0; i < urlPath.length; i++) {

				url = urlPath[i];

				var urlRegex = new RegExp("^"+urlPath[i]+"$");

				if (urlRegex.test(originalURL)) { // check regex url matches with tfa enabled url

					for (var j = 0; j < tfaEnabledResources[url].length; j++) {

						if (tfaEnabledResources[url][j].method == method.toLowerCase()) { // checking method matches or not

							if (tfaEnabledResources[url][j].hasOwnProperty('operation_param')) {

								if (args.isForm) {

									return tfaEnabledResources[url][j].resourceName;

								} else {

									if (tfaAdminConfiguration.getOperationParamValue(args.args[0], tfaEnabledResources[url][j].operation_param, tfaEnabledResources[url][j].operation_value)) {

										return tfaEnabledResources[url][j].resourceName;

									}

								}

							} else {

								return tfaEnabledResources[url][j].resourceName;

							}
						}
					}
				}
			}
		}

		return null;

	},

	/**
	* Method used to check operation param and its value for TFA
	 */
	getOperationParamValue: function(queryString, operation_param_name, operation_param_value, originalurl, args) {
		// If Arguments passed directly in url's instead of data
		if (originalurl != undefined) {
			var originalurlarguments = originalurl.split("?");
			if (originalurlarguments.length > 1) {
				var urlarguments = originalurlarguments[1].split("&");
				for (var c = 0; c < urlarguments.length; c++) {
					var argNameVSValue = urlarguments[c].split("=");
					if (argNameVSValue.length > 1
						&& operation_param_name == argNameVSValue[0]) {
							
						var opValues = operation_param_value.split(",");
							
						if (opValues.length == 1 && operation_param_value == (argNameVSValue[1].split("#"))[0]) {
							return true;
						}else if(opValues.length > 1 && opValues.includes(argNameVSValue[1]) ){ //SD-124452
							return true;							
						}
					}
				}
				try {
    				if(args != undefined && args.isForm){
                        const inputValue = args.form.elements[operation_param_name].value;
                        return inputValue === operation_param_value || operation_param_value.split(",").includes(inputValue);
    				} else {
                        const inputValue = new URLSearchParams(queryString).get(operation_param_name);
                        return inputValue === operation_param_value || operation_param_value.split(",").includes(inputValue);
                    }
                } catch (e) {
                }
			}else{
				if(args != undefined && args.isForm){
                    const inputValue = args.form.elements[operation_param_name].value;
                    return inputValue === operation_param_value || operation_param_value.split(",").includes(inputValue);
				}
			}
		}else{
		    var tempArguments = arguments.split("&");
    		    for (var j = 0; j < tempArguments.length; j++) {
    			var input = tempArguments[j];
    			if (input.startsWith(operation_param_name + "=")
    				&& operation_param_value == input
    					.substring(operation_param_name.length + 1)) {
    				return true;
    			}
    		    }	
		}
		return false;
	},


	

	/**
	* toogleLoadingButton is used to toggle loading button while doing an operation
	 */
	toogleLoadingButton: function(id, load) {
		jQuery('#' + id + (load ? 'Submit' : 'Loading')).addClass('hide');
		jQuery('#' + id + (load ? 'Loading' : 'Submit')).removeClass('hide');
	},

	/** 
	* saveOperation is used to save the operation
	*/
	saveOperation: function() {
        /*SD-124153
         *Showing error instead of submitting the form in case of incomplete authentication as error responses cannot be handled for document submission.*/
   
            if (temp_args.isForm) {
            	     if(temp_args.is_authn_complete === false){
            			showalert('failure', translate('mfa.required'), 'isAutoHide=true'); //NO I18N
        			}else{
                 		temp_args.form.submit();
             		}
            } else {
            	if(tfaAdminConfiguration.ajaxFormSubmit.includes(temp_args.urlWithoutParams) && temp_args.is_authn_complete === false){
            			showalert('failure', translate('mfa.required'), 'isAutoHide=true'); //NO I18N
            	}else{
                	xmlSendOrig.apply(temp_args.org, temp_args.args);
            	}
            }
		
	},
	
	/**
	* Method used to throw error dialog
	 */
	showEmailSendingFailedDialog() {
		var res = `<div id="secur-email-notconfigured-auth"><div class="p20 pb0"><p>${translate('mfa.email.not.configured.label.info')} </p><br><p>${translate('mfa.email.not.configured.label.description')}</p><br><p>${translate('mfa.email.not.configured.label.description.more')}</p><br></div><div class="form-footer tl pt10 pb10 pl20 bgwhite"><button class="btn btn-primary sh-one" data-action="closeOtpTfa">${translate('sdp.common.ok')}</button></div></div>`;//No I18N
		jQuery('#otp-container').html(res);
		jQuery('[data-action="closeOtpTfa"]').off('click').on('click', function(event) { jQuery('#otp-container').dialog('close') });//No I18N
		jQuery('#otp-container').dialog({
			width: 500,
			title: translate('mfa.email.not.configured.title'),
			modal: true,
			resizable: false,
			close: function(e) {
				jQuery('#otp-container').dialog('destroy');//No I18N
				return false;
			}
		});
	},
	
	/*
	* closeOTPDialog method is used to close OTP Dialog 
	*/
	closeOTPDialog: function(cancelOTPTransaction) {
		if (tfaAdminConfiguration.countInterval !== undefined) {
			clearInterval(tfaAdminConfiguration.countInterval);
		}


		if (cancelOTPTransaction) {
			tfaAdminConfiguration.defaultClose('otp-container');//NO I18N
		}

		document.getElementById("otp-form-fields").remove();
		jQuery("#FreezeLayer").remove();
		jQuery('body').removeClass('of-h');
	},

	/**
	* Overriding default OTP dialog close for Admin configuration
	 */
	defaultClose: function(id) {
		let $dialogElement = jQuery('#' + id);//NO I18N
		var orgCloseFunction = $dialogElement.dialog('option').close //NO I18N
		$dialogElement.dialog({
			'close': e => {//NO I18N
			}
		});
		$dialogElement.dialog('close');//NO I18N
		$dialogElement.dialog('close', orgCloseFunction);//NO I18N
		$dialogElement.dialog('destroy');//NO I18N
	},


}


