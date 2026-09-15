/* $Id$ */
var tfaAdminUserEnrollment = {

	/**
	* Method used to initialize enrollment dialog
	 */

	initEnrollment: function(resourceName) {
		sdpAjax({
			url: "/RestAPI/WC/TwoFactorAction?method=getSelfEnrollmentConfiguration", //NO I18N
			type: "POST", //NO I18N
			success: function(tfaSelfConfig) {

				var tfaArray = tfaSelfConfig.CONFIGURED_TFA_ARRAY;
				for (t = 0; t < tfaArray.length; t++) {
					if (tfaArray[t].PAM_MODULE_NAME == 'TFA_MAIL_AUTHENTICATOR') {
						tfaArray[t].MODE_ICON = 'outgoing-conv-off'; //NO I18N
					}
					else if (tfaArray[t].PAM_MODULE_NAME == 'TFA_GOOGLE_AUTHENTICATOR') {
						tfaArray[t].MODE_ICON = 'google-icon'; //NO I18N
					}
				}
				tfaSelfConfig.resourceName = resourceName;
				renderhbs('#user-enroll-container', 'tfa-top-menu-enrollment', tfaSelfConfig, false, 'admin_tfa'); // NO I18N
				tfaAdminUserEnrollment.bindEnrollmentEvents();
				tfaAdminUserEnrollment.selectMode();
				tfaAdminUserEnrollment.bindValidatefn();
				initTooltip("#user-enroll-container"); // NO I18N
			}
		});
	},


	/**
	* Method used to show info in enrollment process
	 */
	showEnrollmentStatus: function(data) {
		var isSuccess = true;
		var successMsg = data.sSTATUS || data.MESSAGE;
		var failureMsg = data.eSTATUS || data.ERROR_MESSAGE;
		if (failureMsg) {
			showalert('failure', translate(failureMsg), 'isAutoHide=false'); //NO I18N
			isSuccess = false;
		}
		else if (successMsg) {
			showalert('success', translate(successMsg), 'isAutoHide=true'); //NO I18N
		}
		else if (data.wSTATUS) {
			showalert('warning', translate(data.wSTATUS), 'isAutoHide=true'); //NO I18N
		}
		return isSuccess;
	},

	/**
	* Method used to select any one authentication mode in enrollment page
	 */
	selectMode: function(id) {
		jQuery("#changeAuthTypesList span[name=icon]").removeClass().addClass("check-circle bg-light mr10");
		if (id != undefined) {
			jQuery('#' + id + "_select").find("span[name=icon]").removeClass().addClass("cspr success icon-sm mr10");
		}

	},


	//Tablecomponent functions end

	bindEnrollmentEvents: function() {
		jQuery('#ViewNotes').on('click', function() {
			jQuery('#HelpingNotes').slideToggle();
		});


	},

	/**
	* Method used to show/hide elements in user enrollment dialog based on authentication modes.
	 */
	CommonShowandHidefn: function(addHideEle, removeHideEle) {
		for (i = 0; i < addHideEle.length; i++) {
			jQuery('#' + addHideEle[i]).addClass('hide');
		}
		for (j = 0; j < removeHideEle.length; j++) {
			jQuery('#' + removeHideEle[j] + '').fadeIn(1000).removeClass('hide');
		}
	},

	/**
	*  Method call while choosing any one of the authentication modes
	 */
	VerifyEmailORGoogle: function() {
		var SelectedElement = jQuery('#SelectAuthMode').find('span.success').next().data('value'); //NO I18N
		if (SelectedElement == 'TFA_MAIL_AUTHENTICATOR') {
			tfaAdminUserEnrollment.sendSelfEnrollmentSecretCode();
		}
		else if (SelectedElement == 'TFA_GOOGLE_AUTHENTICATOR') {
			tfaAdminUserEnrollment.getSelfEnrollmentDetails(SelectedElement);
		}
	},

	/**
	* Method used to verify the enrollment process.
	   */
	GoToAuthMode: function(Curelement, formID, resourceName) {
		if (jQuery('#' + formID).valid()) {
			var authMode = 'google';//NO I18N
			var verifyAuth = {
				AUTH_RULE: "TFA_GOOGLE_AUTHENTICATOR", //NO I18N
				TRUSTED_BROWSER: jQuery("#verifyGoogleTrustBrowser").is(":checked"), //NO I18N
				SECRET_KEY: jQuery("#VerifyGoogleAuthCode").val().trim()
			};
			if (Curelement == 'SendVerficationCode') {
				authMode = 'email';//NO I18N
				verifyAuth = {
					AUTH_RULE: "TFA_MAIL_AUTHENTICATOR", //NO I18N
					TRUSTED_BROWSER: jQuery("#verifyMailTrustBrowser").is(":checked"), //NO I18N
					SECRET_KEY: jQuery("#VerifyMailAuthCode").val().trim(),
					AUTH_SECRET_KEY: sdp_user.EMAILID
				};
			}
			tfaAdminConfiguration.toogleLoadingButton(authMode + 'Enroll', true);//NO I18N
			sdpAjax({
				type: "POST", //NO I18N
				url: "/RestAPI/WC/TwoFactorAction?method=verifySelfEnrollmentSecretCode", //NO I18N
				data: { VERIFY_AUTH: sdpToJSON(verifyAuth) },
				success: function(data) {
					tfaAdminConfiguration.toogleLoadingButton(authMode + 'Enroll', false);//NO I18N

					if (!(data.IS_VALID)) {
						showalert('failure', translate(data.ERROR_MESSAGE), 'isAutoHide=true'); //NO I18N

					} else {
						var actionName = resourceName;
						jQuery('#user-enroll-container').remove();//NO I18N
						tfaAdminConfiguration.doPreauth(actionName);
					}
				},

				error: function(response) {
					tfaAdminConfiguration.toogleLoadingButton(authMode + 'Enroll', false);//NO I18N

					showalert('failure', translate(response.ERROR_MESSAGE), 'isAutoHide=true'); //NO I18N

				}


			});
		}
	},

	/**
	* Method used to get google self enrollment details 
	 */
	getSelfEnrollmentDetails: function(authType) {
		var result;
		tfaAdminConfiguration.toogleLoadingButton('enrollSelection', true);//NO I18N
		sdpAjax({
			type: "POST", //NO I18N
			url: "/RestAPI/WC/TwoFactorAction?method=getSelfEnrollmentDetails", //NO I18N
			data: { AUTH_RULE: authType },
			async: true,
			success: function(data) {
				tfaAdminConfiguration.toogleLoadingButton('enrollSelection', false);//NO I18N
				result = data;
				jQuery("#GAUTH_SECRET_KEY").text(result.MODE_DETAILS.AUTH_SECRET_KEY);
				jQuery("#G_QRCODE").attr('src', result.MODE_DETAILS.PATH);
				tfaAdminUserEnrollment.CommonShowandHidefn(['TwoFacAuthPanel', 'SelectAuthMode'], ['VerifyGoogleAuth']); //NO I18N
				jQuery('#VerifyGoogleAuthCode').focus();

			},
			error: function() {
				tfaAdminConfiguration.toogleLoadingButton('enrollSelection', false);//NO I18N
			}
		});
	},

	/**
	* Method used to send secret code in case of email authenticator in enrollment process.
	 */
	sendSelfEnrollmentSecretCode: function(isResend) {
		if (!isResend) {
			tfaAdminConfiguration.toogleLoadingButton('enrollSelection', true);//NO I18N
		} else {
			jQuery('#resendCode').addClass('hide').next().removeClass('hide');
		}
		sdpAjax({
			type: "POST", //NO I18N
			url: "/RestAPI/WC/TwoFactorAction?method=sendSelfEnrollmentSecretCode", //NO I18N
			data: { AUTH_RULE: "TFA_MAIL_AUTHENTICATOR" }, //NO I18N
			success: function(data) {
				if (!isResend) {
					tfaAdminConfiguration.toogleLoadingButton('enrollSelection', false);//NO I18N
				} else {
					jQuery('#resendCode').removeClass('hide').next().addClass('hide');
				}
				tfaAdminUserEnrollment.showEnrollmentStatus(data);
				if (data.IS_SUCCESS) {
					tfaAdminUserEnrollment.CommonShowandHidefn(['TwoFacAuthPanel', 'SelectAuthMode'], []); //NO I18N
					jQuery('#SendVerficationCode').fadeIn(1000).removeClass('hide');
					jQuery('#VerifyMailAuthCode').focus();
				}
			},
			error: function() {
				if (!isResend) {
					tfaAdminConfiguration.toogleLoadingButton('enrollSelection', false);//NO I18N
				} else {
					jQuery('#resendCode').removeClass('hide').next().addClass('hide');
				}
			}
		});
	},

	bindValidatefn: function() {
		var validateJson = {
			rules: {
				verifyCode: {
					required: true
				}

			},
			messages: {
				verifyCode: {
					required: translate("ads.login.twofactor.invalid_secret_key")
				}

			},
			errorClass: 'text-danger', //NO I18N
			errorPlacement: function(error, element) {
				position = element.position();
				error.insertAfter(element);
				error.addClass('alert alert-danger alert-arrow p5 pos-abs').css({
					'overflow': 'visible', //NO I18N
					'top': (position.top + 50) + 'px', //NO I18N
					'z-index': '100', //NO I18N
					'left': '80px' //NO I18N
				});
				element.trigger('focus');
			}
		};
		jQuery('#GoogleAuthform').validate(validateJson);
		jQuery('#Verifycodeform').validate(validateJson);
	},

	submitEvent: function(form) {
		if (form.id == 'GoogleAuthform') {
			tfaAdminUserEnrollment.GoToAuthMode('VerifyGoogleAuth', 'GoogleAuthform'); //NO I18N
		}
		else if (form.id == 'Verifycodeform') {
			tfaAdminUserEnrollment.GoToAuthMode('SendVerficationCode', 'Verifycodeform');//NO I18N
		}

		return false;
	}


}