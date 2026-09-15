/* $Id$ */
var tfa = {

	configData: {},
	modes: {},
	displayNames: {},
	table_comp: {},
	isLoginTFAenabled: false,
	isAdminTFAenabled: false,
	macroAttributes: "",
	tfaLoginRulesUserBulkCurrentSelect: [],
	tfaLoginRulesCurrentAdvFilterData: [],
	tfaLoginRulesUsersSelectionLimit: 0,
	currentTFALoginRules: [],
	tfaLoginRulesInactiveUsers: [],

	/*
	* Method used to intialize TFA page
	*/
	init: function () {
		tfa.tfaLoginRulesAdvFilConfigInitData = {
			metainfo: {
				"user_type": { //NO I18N
					"display_type": "Pick List", //NO I18N
					"sortable": false, //NO I18N
					"type": "string", //NO I18N
					"partial_field": false, //NO I18N
					"display_name": translate('mdm.user_type'), //NO I18N
					"searchable": false, //NO I18N
					"values": [{ "id": "all_users", "text": translate('ae.software.all.users') }, { "id": "technician", "text": translate('common.technician') }, { "id": "requester", "text": translate('common.requester') }], //NO I18N
					"multiple": false //NO I18N
				},
				"user": { //NO I18N
					"display_type": "Pick List", //NO I18N
					"lookup_entity": "orguser", //NO I18N
					"lookup_field": "name", //NO I18N
					"sortable": false, //NO I18N
					"href": "/tfa/user", //NO I18N
					"type": "lookup", //NO I18N
					"partial_field": false, //NO I18N
					"display_name": translate('sdp.header.user'), //NO I18N
					"searchable": false //NO I18N
				}
			},
			bulkSelect: {
				"user": { //NO I18N
					"selection_handler": function (currentSelect) { //NO I18N
						tfa.tfaLoginRulesUserBulkCurrentSelect = currentSelect;
						window.open('/setup/UsersPopup.jsp?popupfor=searchuser&module=tfa&isUser=true', 'tfaUserSelectWindow', 'width=1200,height=800,scrollbars=yes');
					}
				}
			},
			changeURLData: tfa.changeURLData,
			notMandatory: true,
			maxrows: 2,
			fieldTypeConditions: {
				"user_type": ["is"], //NO I18N
				"user": ["is", "is_not"] //NO I18N
			},
			haveRepeatedValues: false,
			isSortable: false
		};

		if (sdp_app.IS_AE) {
			delete tfa.tfaLoginRulesAdvFilConfigInitData.metainfo.user_type;
			delete tfa.tfaLoginRulesAdvFilConfigInitData.fieldTypeConditions.user_type;
			tfa.tfaLoginRulesAdvFilConfigInitData.maxrows = 1;
		}

		if ((sdp_app.IS_MDH_SETUP && sdp_app.IS_ESMDIR) || !sdp_app.IS_MDH_SETUP) {
			// call Login Two Factor Authentication Details and it's authenticators details
			sdpAjax({
				url: "/RestAPI/WC/TwoFactorAction?method=getTwoFactorAuthConfig", //NO I18N
				type: "POST", //NO I18N
				success: function(data) {
					tfa.fetchAdminConfigurationDetails(data);
				}
			});
		}else {
			this.fetchInstanceLevelAdminConfigDetails();
		}
		/**
		 * On the esm page, "two factory authentication" is implemented in ember. In this case, this file (includeEmber.js) will be loaded
		 * On the non-esm page, this is implemented in a non-ember way, that's why we load the file here.
		 **/
		if (sdp_app.IS_ESMDIR) {
			/**
			 * Determine the set of scripts based on the development mode
			 **/
			const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/admin_common.js", "/scripts/tfaAdminOperation.js", "/scripts/tfaAdminUserEnrollment.js"] : ["/scripts/ember_common.js"]; //NO I18N
			ResourceLoader({
				js: getScript,
			});
		}

	},
	
	fetchInstanceLevelAdminConfigDetails: function() {

		sdpAjax({
			url: "/ids-authn/v1/wc/accessrules", //NO I18N
			type: "GET", //NO I18N
			success: function(response) {
				var data = {};
				data.instanceLevelTFA = true;
				
				if (response.data.length != 0) {

					const authnSettings = response.data[0].attributes.authnsettings;


					// TFA for Admin Configurations enabled/disabled (whole)
					data.is_portal_mfa_enabled = authnSettings.is_mfa_enabled;

					// TFA Admin Configurations enabled details 
					if (authnSettings.resources) {
						const resources = authnSettings.resources.actions;
						resources.forEach((resource) => {
							tfa.displayNames[resource.action_name] = resource.display_name;
						});
						data.RESOURCES = resources;
					}
					
					// TFA Trust Details
					data.is_mfa_trust_allowed = data.is_portal_mfa_enabled && authnSettings.is_mfa_trust_allowed;
					data.mfa_trust_period = authnSettings.mfa_trust_period;
					data.mfa_trust_period_unit_type = authnSettings.mfa_trust_period_unit_type;

				}
				
				var authenticatorList = [];
				if(response.authenticatorList != undefined){
					for(var i = 0 ; i<response.authenticatorList.length;i++){
						authenticatorList[i] = translate(response.authenticatorList[i]);
					}
					data.authenticatorList = authenticatorList;
					data.noAuthenticatorsConfigured = false;
				}else{
					
					data.noAuthenticatorsConfigured = true;
					
				}		
				
				if(sdp_app.IS_SDOrgAdmin){
					data.isOrgAdmin = sdp_app.IS_SDOrgAdmin;
				}

				// Boolean value "is_demo_build" is set to disable TFA the configuration if it is a demo build
				data.is_demo_build = response.is_demo_build;

				renderhbs('#tfaContentHolder', 'twoFactorAuth', data, false, 'admin_tfa'); // NO I18N
								
				tfa.renderAdminConfigurationDetailsAndEvents(data,true);

			}
		});

	},

	/*
	* Method used to bind all the events for TFA Page
	 */
	bindEvents: function() {
		
		const $twoFactorAuthContainer = jQuery('#tfaContentHolder');
		
		$twoFactorAuthContainer.off('.authentication');//NO I18N
		
		$twoFactorAuthContainer.on('change.authentication','input.togglechk',function(){//NO I18N
			tfa.toggleSwitchAction(this);
		});
		

		const $tfaOperations = $twoFactorAuthContainer.find('#tfaOperations');
		const $adminConfigSelectAll = $twoFactorAuthContainer.find('#adminConfigSelectAll');
		const $checkboxes = $tfaOperations.find('input[type="checkbox"]');

		$adminConfigSelectAll.on('click.authentication', function() {//NO I18N
			$checkboxes.prop('checked', function() {//NO I18N
				return $adminConfigSelectAll.prop('checked');//NO I18N
			});
		});

		$twoFactorAuthContainer.find('#enableTFATrust').on('click.authentication', function() {
			$twoFactorAuthContainer.find('#sessionSettings').toggleClass('hide', !this.checked);//NO I18N
		});


		$checkboxes.on('change.authentication', () => {
			$adminConfigSelectAll.prop('checked', $checkboxes.length === $checkboxes.filter(':checked').length);//NO I18N
		});
		
		$adminConfigSelectAll.prop('checked', $checkboxes.length === $checkboxes.filter(':checked').length);//NO I18N

	},

	/*
	* Method used to fetch Admin configuration details
	*/
	fetchAdminConfigurationDetails: function(data) {

		// Fetching TFA Admin Configuration details
		sdpAjax({
			url: "/ids-authn/v1/wc/accessrules", //NO I18N
			type: "GET", //NO I18N
			success: function(response) {

				tfa.addTFAAdminConfigurationDisplayNames(response);

				tfa.appendingAdminConfigResponseWithLoginResponse(data, response);

				tfa.constructAuthenticationConfigurationList(data);
				
				tfa.renderTwoFactorAuthUI(data);

			}
		});
	},

	/*
	* Method used to add display names for Admin Configurations to process in history
	*/
	addTFAAdminConfigurationDisplayNames: function( response) {

		Object.assign(tfa.displayNames, response.fieldDisplayNames);


	},

	/**
	* Method used to append Admin config response with login config response
	 */
	appendingAdminConfigResponseWithLoginResponse: function(data, response) {

		const authnSettings = response.data[0].attributes.authnsettings;
		
		// Assigning configuration details to global variables
		tfa.isAdminTFAenabled = authnSettings.is_mfa_enabled;
		tfa.isLoginTFAenabled = data.IS_ENABLED;

		// TFA for Admin Configurations enabled/disabled (whole)
		data.is_mfa_enabled = authnSettings.is_mfa_enabled;

		// TFA Admin Configurations enabled details 
		if (authnSettings.resources) {
			const resources = authnSettings.resources.actions;
			resources.forEach((resource) => {
				tfa.displayNames[resource.action_name] = resource.display_name;
			});
			data.RESOURCES = resources;
		}

		// Boolean value "is_demo_build" is set to disable TFA the configuration if it is a demo build
		data.is_demo_build = response.is_demo_build;

		// TFA Trust Details
		data.is_mfa_trust_allowed = data.is_mfa_enabled && authnSettings.is_mfa_trust_allowed;
		data.mfa_trust_period = authnSettings.mfa_trust_period;
		data.mfa_trust_period_unit_type = authnSettings.mfa_trust_period_unit_type;
	},

	constructAuthenticationConfigurationList: function(data) {

		// Constructing Authenticator configuration list in data to render it in UI.
		var tfaConfigList = [];
		// Iterating authenticator configuration list
		for (x = 0; x < data.TFA_CONFIG_LIST.length; x++) {
			const config = data.TFA_CONFIG_LIST[x];
			const { MODE_NAME, IS_ENABLED, MACRO_ATTRIBUTES, MODE_DISPLAY_NAME } = config;

			var modeName = MODE_NAME;
			if (modeName == 'TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR') {
				data.isBackupEnabled = IS_ENABLED;
				data.BACKUP_MODE_NAME = modeName;
			}
			else if (modeName == 'TFA_MAIL_AUTHENTICATOR') {
				tfa.macroAttributes = MACRO_ATTRIBUTES;
				isEmailVerificationEnabled = IS_ENABLED;
			}
			tfaConfigList.push(config);
			tfaConfigList[x].HASH_MODE_NAME = "#" + modeName;
			tfaConfigList[x].is_demo_build = data.is_demo_build;
			tfa.displayNames[modeName] = MODE_DISPLAY_NAME;
		}
		data.TFA_CONFIG_LIST = tfaConfigList;


		var modeOptions = "";
		for (i = 0; i < data.MODE_OPTIONS.length; i++) {
			var mode = data.MODE_OPTIONS[i];
			tfa.modes[mode.SERVER_VALUE] = mode.CLIENT_VALUE;
			if (mode.SERVER_VALUE != 'none') {
				modeOptions = modeOptions + "<option value='" + mode.SERVER_VALUE + "'>" + e_html(mode.CLIENT_VALUE) + "</option>";
			}
		}

		tfa.configData = data;

		data.modeOptions = modeOptions;

		data.IS_ESMDIR = sdp_app.IS_ESMDIR;
		
	},

	/**
	* renderTwoFactorAuthUI used to render two factor auth UI
	 */
	renderTwoFactorAuthUI: function(data) {
		
	     renderhbs('#tfaContentHolder', 'twoFactorAuth', data, false, 'admin_tfa',false, false, function() { //No I18N
                       jQuery('[data-id="TFA_GAuth"],[data-id="TFA_EmailVerif"]').off('click').on('click', function(event) { event.stopPropagation(); } );//No I18N
          });

		tfa.renderAdminConfigurationDetailsAndEvents(data);

		// Check Backup Code need to be shown or not
		tfa.checkBackupCode();

		// User Enrollment Table component functions		
		tfa.initializeTC();
		jQuery("#filterTypes").select2();
		tfa.showAndHideUserEnrollTab();

				tfa.showOrHideEmailOTPWarning(isEmailVerificationEnabled);
		tfa.enableOrDisableEmailMessageCustomization(isEmailVerificationEnabled);
		tfa.fetchTFALoginRules();
		initTooltip("#tfaContentHolder"); // NO I18N
		if(isEmailVerificationEnabled && tfa.isLoginTFAenabled) {
			document.getElementById("infoWarning_TFA").classList.remove("hide");
		}
	},

	/**
	*  renderAdminConfigurationDetailsAndEvents used to update admin configuration UI based on data
	 */
	renderAdminConfigurationDetailsAndEvents: function(data,isPortalSpecific) {
		//Render Trust Details configuration
		jQuery('#sessionSettings').toggleClass('hide', !data.is_mfa_trust_allowed);//NO I18N
		jQuery('#mfaTrustPeriod').val(data.mfa_trust_period);
		jQuery('#mfaTrustPeriodUnit').val(data.mfa_trust_period_unit_type);
		jQuery('#mfaTrustPeriodUnit').select2({ minimumResultsForSearch: -1 });

		// Show All Admin configurations only if Admin TFA enabled
		tfa.showHideAdminConfigurations(isPortalSpecific ?  data.is_portal_mfa_enabled : tfa.isAdminTFAenabled , isPortalSpecific);
		
		// Events for Select all configurations and session settings
		tfa.bindEvents();
	},
	
	/*
	* Method used to construct data to enable/disable authentication factors
	*/
	fetchAndSaveTwoFactorModeConfigData: function(modeName, isEnabled,toggleElement) {
		var data = tfa.configData;
		var modeConfig = {},  fromCustomizeDialog = false;
		for (x = 0; x < data.TFA_CONFIG_LIST.length; x++) {
			if (data.TFA_CONFIG_LIST[x].MODE_NAME == modeName) {
				if (modeName == 'TFA_MAIL_AUTHENTICATOR') {
					
					if (isEnabled === undefined) {
						isEnabled = jQuery("#TFA_EmailVerification").prop('checked'); //NO I18N
						fromCustomizeDialog = true;
					}
					if (ZEditor.editor != undefined) {
						if (ZEditor.editor.getHTML().indexOf('$secretCode') != -1) {
							if (document.getElementById('templateMsg').value == 1) {
								jQuery('#loginTFAEmailDescription').text(ZEditor.editor.getHTML());
								data.TFA_CONFIG_LIST[x].PARAMS.MESSAGE = ZEditor.editor.getHTML();
								data.TFA_CONFIG_LIST[x].PARAMS.SUBJECT = jQuery("#loginTFAEmailSubject").val();
							} else {
								jQuery('#adminTFAEmailDescription').text(ZEditor.editor.getHTML());
								data.TFA_CONFIG_LIST[x].PARAMS.SUBJECT_SENSITIVE_RESOURCES = jQuery("#adminTFAEmailSubject").val();
								data.TFA_CONFIG_LIST[x].PARAMS.MESSAGE_SENSITIVE_RESOURCES = ZEditor.editor.getHTML();
							}
						} else {
							showalert('failure', translate('tfa.mail.tfa_settings.alert_mail_confirm_code_ismandatory'), 'isAutoHide=false'); //NO I18N
							return false;
						}
					}
					tfa.showOrHideEmailOTPWarning(isEnabled);
				}
				data.TFA_CONFIG_LIST[x].IS_ENABLED = isEnabled;

				//cloning the data object
				data = jQuery.extend(true, {}, data);

				delete data.TFA_CONFIG_LIST[x].is_demo_build;
				modeConfig.TFA_MODE_CONFIG = JSON.stringify(data.TFA_CONFIG_LIST[x]);
				modeConfig.TFA_MODE_NAME = data.TFA_CONFIG_LIST[x].MODE_NAME;
				break;
			}
		}
		tfa.enableOrDisableTwoFactorModeConfig(modeConfig,fromCustomizeDialog,modeName,isEnabled,toggleElement);
	},
	
	/*
	* Method used to enable/disable authentication factors
	*/
	enableOrDisableTwoFactorModeConfig: function(modeConfig,fromCustomizeDialog,modeName,isEnabled,toggleElement) {
		var isSuccess = false;
		sdpAjax({
			url: '/RestAPI/WC/TwoFactorAction?method=saveTwoFactorModeConfig', //NO I18N
			data: modeConfig,
			async: false,
			type: "POST", //NO I18N
			success: function(data) {
				isSuccess = tfa.showStatus(data, fromCustomizeDialog, modeName, isEnabled);
				if(data.wSTATUS === "sdp.setup.orgdef.demoonline.jserror") {
                    isSuccess = false;
                }
				if(isSuccess && modeName == 'TFA_MAIL_AUTHENTICATOR') {
					isEmailVerificationEnabled = isEnabled;
					if(isEmailVerificationEnabled && tfa.isLoginTFAenabled) {
						document.getElementById("infoWarning_TFA").classList.remove("hide");
					} else if (!isEmailVerificationEnabled) {
						document.getElementById("infoWarning_TFA").classList.add("hide");
					}
				}
				tfa.handleToggleSwitchActionSucessOrFailure(isSuccess, toggleElement, modeName, isEnabled);
			},
			error: function(response){
				!fromCustomizeDialog ? toggleElement.checked = !toggleElement.checked : '';
				tfa.handleTFAError(response.responseJSON);
			}
		});
	},

	/*
	* Method used to disable message customisation if email authenticator disabled
	*/
	enableOrDisableEmailMessageCustomization: function(isEnabled) {

		const elements = [
			"#EmailSubjectDescDiv",//NO I18N
			"#EmailSubjectDescDivOperation",//NO I18N
			"#saveMailContentDiv"//NO I18N
		];

		const opacValue = isEnabled ? 'auto' : 'none'; //NO I18N

		elements.forEach((element) => {
			jQuery(element).toggleClass('opac5', !isEnabled).css('pointer-events', opacValue); //NO I18N
		});

	},

	/**
	* showStatus is used to alert the user with a message
	 */
	showStatus: function(data, fromCustomDialog, modeName, isEnabled,hideSuccessMessage) {
		var isSuccess = true;
		if (data.eSTATUS) {
			showalert('failure', translate(data.eSTATUS), 'isAutoHide=true'); //NO I18N
			isSuccess = false;
		}
		else if (data.sSTATUS) {
			if (fromCustomDialog) {
				showalert('success', translate('mfa.config.authenticator.email.message.update.alert'), 'isAutoHide=true'); //NO I18N
				jQuery('.ui-sliderdialog button.ui-dialog-titlebar-close').trigger('click');
			} else {

				const messageKey = isEnabled ? 'common.action.enabled' : 'common.action.disabled';//NO I18N
				const modeNameVsKeys = {
					'TFA_MAIL_AUTHENTICATOR' : 'ads.admin.logon_settings.tfa.email_verification',//NO I18N
					'TFA_GOOGLE_AUTHENTICATOR':'ads.admin.logon_settings.tfa.google_authenticator',//NO I18N
					'TFA_BACKUP_VERIFICATION_CODE_AUTHENTICATOR':'ads.admin.logon_settings.tfa.backup_verification_code',//NO I18N
					'TWO_FACTOR_AUTHENTICATION':'ads.admin.logon_settings.tfa_settings.login'//NO I18N
				}
				
				const keyValue = modeNameVsKeys[modeName]? translate(messageKey,[translate(modeNameVsKeys[modeName])]) : translate(data.sSTATUS);
				
				!hideSuccessMessage ? showalert('success', keyValue , 'isAutoHide=true') : ''; //NO I18N
			}
		}
		else if (data.wSTATUS) {
			
			if(data.wSTATUS === "ads.admin.logon_settings.tfa_settings.enable_atleast_one_config"){
				jQuery("#TFA_OnOff").prop('checked',false);//NO I18N
			}
			
			showalert('warning', translate(data.wSTATUS), 'isAutoHide=false'); //NO I18N
			tfa.isLoginTFAenabled = false;
			tfa.toggleUserMenu();
		}
		else if (data.DISABLE_TFA) {
			showalert('success', translate(data.DISABLE_TFA), 'isAutoHide=true'); //NO I18N
			tfa.isLoginTFAenabled = false;
			tfa.showAndHideUserEnrollTab();
			if (isSuccess) {
				jQuery("#TFA_OnOff").prop('checked', false);//NO I18N
			}
			tfa.toggleUserMenu();
		}
		return isSuccess;
	},

	/*
	* showAndHideUserEnrollTab is used to hide user enroll tab if tfa for login and admin configuration disabled
	*/
	showAndHideUserEnrollTab: function() {

		const $enrollUserElements = jQuery('#EnrollUserContent, #EnrollUserTab');
		const shouldEnable = tfa.isLoginTFAenabled || tfa.isAdminTFAenabled;

		$enrollUserElements.toggleClass('opac5', !shouldEnable).css('pointer-events', shouldEnable ? 'auto' : 'none'); //NO I18N

	},
	
	/*
	* enableOrDisableLoginTFA is used to enable or diable the login TFA configuration
	*/
	enableOrDisableLoginTFA: function(isEnabled, toggleElement, modeName,hideSuccessMessage) {
		var isSuccess = false;

		sdpAjax({
			url: "/RestAPI/WC/TwoFactorAction?method=enableDisableTwoFactorAuthConfig", //NO I18N
			data: { IS_ENABLED: isEnabled },
			async: true,
			type: "POST", //NO I18N
			success: function(data) {
				isSuccess = tfa.showStatus(data,false,modeName,isEnabled,hideSuccessMessage);
				if(data.wSTATUS === "sdp.setup.orgdef.demoonline.jserror") {
                    toggleElement.checked = !toggleElement.checked;
                }
				if(!data.wSTATUS){
					tfa.isLoginTFAenabled = isEnabled;
					tfa.handleToggleSwitchActionSucessOrFailure(isSuccess, toggleElement, modeName, isEnabled);
				}
				if(data.sSTATUS) {
					if(isEnabled) {
						jQuery('#tfaLoginConfigBlock').removeClass('hide');
						tfa.fetchTFALoginRules();
						if(isEmailVerificationEnabled) {
							document.getElementById("infoWarning_TFA").classList.remove("hide");
						}
					} else {
						jQuery('#tfaLoginConfigBlock').addClass('hide');
						jQuery("#loginTFACancelBtn").click();
						document.getElementById("infoWarning_TFA").classList.add("hide");
					}
                }
			}
		});
	},

    /*
    * Method used to fetch the login TFA configuration
    */
	fetchTFALoginRules: function() {
	    if(tfa.isLoginTFAenabled) {
			sdpAjax({
				url: "/RestAPI/WC/TwoFactorAction?method=getTFALoginRules", //NO I18N
				type: "GET", //NO I18N
				success: function(response) {
					tfa.currentTFALoginRules = response.tfa_login_rules;
					tfa.tfaLoginRulesUsersSelectionLimit = response.tfa_login_rules_users_selection_limit;
					tfa.tfaLoginRulesAdvFilConfigInitData.metainfo.user.constraints = {max_length: tfa.tfaLoginRulesUsersSelectionLimit};
					tfa.tfaLoginRulesInactiveUsers = response.tfa_login_rules_inactive_users;
                    jQuery("#tfaLoginConfigSection").custom_filter(tfa.tfaLoginRulesAdvFilConfigInitData);
					jQuery("#tfaLoginConfigSection").custom_filter('update',tfa.currentTFALoginRules); //NO I18N
					tfa.tfaLoginRulesCurrentAdvFilterData = jQuery('#tfaLoginConfigSection').custom_filter('getDataWithID');
					if(tfa.currentTFALoginRules == null || tfa.currentTFALoginRules.length == 0) {
						jQuery("#loginTFAClearAndSave").hide();
					}
				}
			});
		} else {
			jQuery('#tfaLoginConfigBlock').addClass('hide');
		}
    },

	enableOrDisableAdminConfigTFA: function(isEnabled, toggleElement, modeName, hideSuccessMessage) {
		var isSuccess = false;



		// EndPoints Input Data construction to enable MFA
		var data = { "type": "authnsettings", "attributes": { "is_mfa_enabled": isEnabled } };//NO I18N
		if (isEnabled) {
			data.attributes.action_not_enrolled = 1;
		}
		var input_data = {};
		input_data.data = data;

		// Saving Configuration
		sdpAjax({
			url: "/ids-authn/v1/wc/accessrules", //NO I18N
			data: sdpToJSON(input_data),
			async: false,
			contentType: 'application/json;charset=utf-8', //NO I18N
			dataType: 'json',//NO I18N
			type: "PUT", //NO I18N
			success: function(data) {
				if (data.status == 'failure') {
					showalert('warning', translate(data.status_msg), 'isAutoHide=false'); //NO I18N
					isSuccess = false;
				} else {
					// Once TFA for Admin Logon updated


					modeName === 'ADMIN_PORTAL_TWO_FACTOR_AUTHENTICATION' ? isPortalSpecific = true : isPortalSpecific = false;//NO I18N
					!isPortalSpecific ? tfa.isAdminTFAenabled = isEnabled : '';

					const messageKey = isEnabled ? 'common.action.enabled' : 'common.action.disabled';//NO I18N
					!hideSuccessMessage ? showalert('success', translate(messageKey, [translate('ads.common.text.tfa.admin.config')]), 'isAutoHide=true') : ''; //NO I18N

					isSuccess = true;

					if(sdp_app.IS_MDH_SETUP && !sdp_app.IS_ESMDIR){
						setTimeout(() => {
							window.location.reload();
						}, 400);

					}else{
						tfa.showHideAdminConfigurations(isEnabled, isPortalSpecific);
                        if (!isPortalSpecific && !isEnabled) {
                            jQuery("#adminTFACancelBtn").click();
                        }
					}
				}
				tfa.handleToggleSwitchActionSucessOrFailure(isSuccess, toggleElement, modeName, isEnabled);

			}, error: function(response) {
				toggleElement.checked = !toggleElement.checked;
				tfa.handleTFAError(response.responseJSON);

			}
		});
	},


	/**
	 *	toggleSwitchAction is used to enable/disable authenticator such as email/google/backup code as well as login and admin TFA
	 */
	toggleSwitchAction: function(toggleElement,hideSuccessMessage) {

		var cur = jQuery(toggleElement);
		var isEnabled = toggleElement.checked;
		var modeName = cur.attr('data-value');

		if (modeName == 'TWO_FACTOR_AUTHENTICATION') {

			tfa.enableOrDisableLoginTFA(isEnabled,toggleElement,modeName,hideSuccessMessage);

		} else if (modeName == 'ADMIN_TWO_FACTOR_AUTHENTICATION' || modeName == 'ADMIN_PORTAL_TWO_FACTOR_AUTHENTICATION') {//NO I18N
		
			tfa.enableOrDisableAdminConfigTFA(isEnabled, toggleElement, modeName,hideSuccessMessage);
			
		}else {
			var confirmMsg; 
			if (modeName == 'TFA_MAIL_AUTHENTICATOR' || modeName == 'TFA_GOOGLE_AUTHENTICATOR') {
				var isMailAuth = modeName == 'TFA_MAIL_AUTHENTICATOR';//NO I18N
				if (isEnabled && isMailAuth) {
					confirmMsg = translate('mfa.config.enroll.email.enable.confirm.msg');
				}
				else if(!isEnabled){
					var isBothDisabledAndTfaAdminEnabled = !(jQuery('#TFA_EmailVerification').prop('checked')) && !(jQuery('#TFA_GoogleAuth').prop('checked')) && (jQuery('#TFA_Admin_OnOff').prop('checked') || jQuery('#TFA_OnOff').prop('checked'));//NO I18N
					var enrollDisplayMsg = translate(isMailAuth ? 'ads.admin.logon_settings.tfa.email_verification' : 'ads.admin.logon_settings.tfa.google_authenticator');
					
					if(sdp_app.IS_ESMDIR){
						confirmMsg = translate('mfa.config.enroll.disable.confirm.msg', [enrollDisplayMsg, enrollDisplayMsg, isBothDisabledAndTfaAdminEnabled ? translate('mfa.config.enroll.disable.admin.tfa.confirm.msg.esmdirectory.portals') : '']);
					}else{
						confirmMsg = translate('mfa.config.enroll.disable.confirm.msg', [enrollDisplayMsg, enrollDisplayMsg, isBothDisabledAndTfaAdminEnabled ? translate('mfa.config.enroll.disable.admin.tfa.confirm.msg') : '']);
					}
				}

			}

			if (confirmMsg) {
				showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + confirmMsg + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed) {//NO I18N
					if (proceed) {
						tfa.fetchAndSaveTwoFactorModeConfigData(modeName, isEnabled, toggleElement);
					} else {
						toggleElement.checked = !toggleElement.checked;
					}

				}, !isEnabled);
			}
			else {
				tfa.fetchAndSaveTwoFactorModeConfigData(modeName, isEnabled, toggleElement);
			}


		}
		
	},
	
	/**
	* handleToggleSwitchActionSucessOrFailure is used to handle toggle switch success/failure
	 */
	handleToggleSwitchActionSucessOrFailure: function(isSuccess, toggleElement, modeName, isEnabled) {
		if (isSuccess) {
			if (modeName == 'TFA_MAIL_AUTHENTICATOR' || modeName == 'TFA_GOOGLE_AUTHENTICATOR') {
				if (!isEnabled) {
					tfa.refreshTable();
				}
				
				modeName == 'TFA_MAIL_AUTHENTICATOR' ? tfa.enableOrDisableEmailMessageCustomization(isEnabled) : '';//NO I18N

				jQuery(toggleElement).parents('z-collapsiblepanel').attr('is-active', isEnabled);//NO I18N
			}
			if (modeName == 'TWO_FACTOR_AUTHENTICATION' || modeName == 'ADMIN_TWO_FACTOR_AUTHENTICATION') {
				tfa.showAndHideUserEnrollTab();
				tfa.toggleUserMenu();
			}
			tfa.checkBackupCode();
		}
		else {
			toggleElement.checked = !toggleElement.checked;
		}
	},

	/**
	* Method used to show TFA user enrollments in user personalization tab.
	 */
	toggleUserMenu: function() {
		isEnabled = tfa.isLoginTFAenabled || tfa.isAdminTFAenabled;
		jQuery("#TFAUserMenu").toggleClass("hide", !isEnabled); //NO I18N
	},

	//fn to select Authtype dropdown options
	ChooseAuthType: function($this) {
		var SelectedVal = jQuery($this).find('a').text();
		jQuery($this).closest('.btn-group').find('span:first').text(SelectedVal); //NO I18N
	},


	/*
	* Method used to check backup code need to be shown or not.
	*/
	checkBackupCode: function() {
		const emailVerification = jQuery('#TFA_EmailVerification');
		const googleAuth = jQuery('#TFA_GoogleAuth');
		const backupVerificationCode = jQuery('#backUpVerificationCode');
		const adminOnOff = jQuery('#TFA_Admin_OnOff');
		const loginOnOff = jQuery('#TFA_OnOff');


		if (!emailVerification.prop('checked') && !googleAuth.prop('checked')) {
			backupVerificationCode.addClass('hide');
			// Disable Admin TFA if both authenticators disabled
			if (adminOnOff.prop('checked')) {
				adminOnOff.prop('checked', false);//NO I18N
				tfa.toggleSwitchAction(adminOnOff[0],true);
			}
			if (loginOnOff.prop('checked')) {
				loginOnOff.prop('checked', false);//NO I18N
				tfa.toggleSwitchAction(loginOnOff[0],true);
			}


		} else {
			const isLoginTFAenabled = tfa.isLoginTFAenabled;
			backupVerificationCode.toggleClass('hide', !isLoginTFAenabled);//NO I18N
		}

	},


	/*
	* Method used to user enrollment table component
	*/
	initializeTC: function() {
		var table_content = {};
		table_content.header = tfa.headerdataConstruct();
		var options = {};
		options.paginationEnabled = true;
		options.searchEnabled = true;
		options.callbackRowfunction = tfa.rowdataConstruct;
		options.row_inputdata = tfa.rowdataConstruct();
		options.callbackDataGet = tfa.callbackDataGet;
		options.entity_name = "TFA_ENROLLED_USERS"; //NO I18N
		tfa.table_comp = new tableComponent(table_comp.getTableInfo(), table_content, options);
	},

	/*
	* Method used to user enrollment table row construction
	*/
	rowdataConstruct: function() {
		var inputObject = { "list_info": { "sort_field": "order", "sort_order": "asc" } }; //No I18N
		return inputObject;
	},

	/**
	*Method used for callback functions in user enrollment
	 */
	callbackDataGet: function() {
		var data = {};
		data.RECORDS_PER_PAGE = 10;
		data.PAGE = 1;

		if (tfa.table_comp.t_obj) {
			var rowListInfo = tfa.table_comp.t_obj.options.row_inputdata.list_info;
			var tableListInfo = tfa.table_comp.t_obj.table_info.list_info;
			if (rowListInfo && tableListInfo) {
				if (rowListInfo.start_index && rowListInfo.row_count) {
					data.RECORDS_PER_PAGE = tableListInfo.row_count;
					data.PAGE = 1 + Math.round(rowListInfo.start_index / parseInt(rowListInfo.row_count));
				}
				if (tableListInfo.search_fields) {
					var searchFields = tableListInfo.search_fields;
					data.SEARCH_USER_NAME = searchFields.USER_NAME;
					data.SEARCH_DOMAIN_NAME = searchFields.DOMAIN_NAME;
				}
			}
		}
		var modeId = jQuery("#filterTypes").val();
		if (modeId) {
			data.SEARCH_MODE_OPTION = modeId;
		}
		var responseData = {};
		sdpAjax({
			async: false,
			data: data,
			type: "POST", //NO I18N
			url: "/RestAPI/WC/TwoFactorAction?method=getUserEnrollmentConfig", //NO I18N
			success: function(data) {
				responseData = data;
				var usersList = responseData.TFA_ENROLLED_USERS;
				for (i = 0; i < usersList.length; i++) {
					usersList[i].id = usersList[i].USER_ID;
				}
			}
		});
		responseData.list_info = { "sort_field": "order", "sort_order": "asc", "start_index": 1 }; //NO I18N
		responseData.list_info.row_count = responseData.TFA_ENROLLED_USERS.length;
		responseData.list_info.total_count = responseData.TFA_ENROLLED_USERS_COUNT;
		responseData.list_info.has_more_rows = data.PAGE * parseInt(data.RECORDS_PER_PAGE) < responseData.TFA_ENROLLED_USERS_COUNT;
		if (tfa.table_comp.t_obj) {
			if (!tfa.isFilterChange) {
				responseData.list_info.start_index = tfa.table_comp.t_obj.options.row_inputdata.list_info.start_index;
			}
			tfa.isFilterChange = false;
		}
		return responseData;
	},

	refreshTable: function() {
		tfa.isFilterChange = true;
		tfa.table_comp.refreshTable();
	},

	headerdataConstruct: function() {
		var meta_data = {
			TFA_ENROLLED_USERS_head_chk: {
				type: "checkbox", // No I18N
				default: true
			},
			USER_NAME: {
				text: "sdp.common.loginname" // No I18N
			},
			DOMAIN_NAME: {
				text: "sdp.admin.user.domainname" //NO I18N
			},
			MODE_ID: {
				text: "auth.oauth.common.authtype", //NO I18N
				disableSearching: true,
				dataCelltransformer: function(table_data) {
					return e_html(tfa.modes[table_data.row_data.MODE_ID]);
				}
			}
		};
		return meta_data;
	},

	bulkDeleteUsers: function() {
		var selectedUsers = jQuery("#TFA_ENROLLED_USERS_body input[type=checkbox]:checked");
		if (selectedUsers.length) {
			showconfirm(true, 'title=' + translate("sdp.dashboard.common.confirmdelete") + ', message=' + translate("tfa.enrolledUsers.confirmDelete") + ', submitbutton=' + translate('common.delete') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed) { //NO I18N
				if (proceed) {
					var userIds = [];
					selectedUsers.each(function(i, v) {
						userIds.push(v.value);
					});
					var delUser = { DELETE_USER_IDS: "[" + userIds.toString() + "]" };
					sdpAjax({
						data: delUser,
						url: "/RestAPI/WC/TwoFactorAction?method=deleteEnrolledUsers", //NO I18N
						type: "POST", //NO I18N
						async : false,
						success: function(data) {
							tfa.table_comp.refreshTable();
							tfa.showStatus(data);
						},
						error:function(response){
							tfa.handleTFAError(response.responseJSON);
							showalert('failure', message, 'isAutoHide=true');//NO I18N
						}
					});
				}
			}, true);
		}
		else {
			showalert("failure", translate("tfa.enrolledUsers.selectUsers"), "isAutoHide=true"); //NO I18N
		}
	},

	/*
	* processHistory is used to process history for login and admin TFA configurations
	*/
	processHistory: function(history) {
		$history.processHistory(history);
		
	},

	/*
	* Method used to provide auto suggestion in zeditor
	*/
	initZE: function(macroAttributes, id) {

		var $editor = jQuery(id).contents().find('body');
		var contentVar = [];
		var regexp = "\\\$([\\\S]*)$"; // NO I18N

		for (m = 0; m < macroAttributes.length; m++) {
			contentVar.push({ text: macroAttributes[m].CLIENT_VALUE, value: "$" + macroAttributes[m].SERVER_VALUE });
		}

		$editor.attr({ contentEditable: 'true' });
		autoSuggestion($editor, contentVar, regexp);
	},

    showOrHideEmailOTPWarning : function(isEmailVerificationEnabled)
    {
    	if(sdp_app.IS_MSPOrSCP && isEmailVerificationEnabled)//For other than SCP/MSP builds, the warning will always be hidden.
    	{
    		sdpAjax({
				url: "/servlet/AJaxServlet?action=is_mail_otp_login_enabled", //NO I18N
				type: "GET", //NO I18N
				success: function(data)
				{
					jQuery("#tfa_mail_otp_msg").toggle(data.is_mail_otp_login_enabled);
				}
			});
    	}
    	else{
    		jQuery("#tfa_mail_otp_msg").hide();
    	}
    },
	/*
	* Method used to render message customization slider for email configuration
	*/
	RevampSliderDig: function(DigId, DigWidth, tfaConfigType) {

		const elementId = tfaConfigType === 'app' ? 'loginTFAEmailDescription' : 'adminTFAEmailDescription';//NO I18N
		const iframeSelector = tfaConfigType === 'app' ? '#ze_loginTFAEmailDescription iframe' : '#ze_adminTFAEmailDescription iframe';//NO I18N

		zeditor({ element: elementId, buttonsToHide: ['image'], avoidMoreOption: true, isEnterKeyHandler: true, edithtml: true }); //NO I18N
		setTimeout(() => {
			tfa.initZE(tfa.macroAttributes, iframeSelector);
		}, 400);

		const browserDir = jQuery(document).find("body").css("direction").toLowerCase(); //NO I18N
		const DialogDir = (browserDir === 'rtl') ? 'left' : 'right'; //NO I18N


		jQuery("#" + DigId + "").dialog({
			modal: true,
			draggable: false,
			resizable: false,
			show: {
				effect: "slide",//NO I18N
				direction: DialogDir,
				duration: 500,
			},
			hide: {
				effect: "slide",//NO I18N
				direction: DialogDir,
				duration: 500,
			},
			position: {
				my: "" + DialogDir + " top",
				at: "" + DialogDir + " top",
				of: window
			},
			width: DigWidth,
			height: jQuery(window).outerHeight(),
			dialogClass: 'ui-sliderdialog',//NO I18N
			open: function() {
				jQuery('body').addClass('subheader-of-h');

				var tfaConfigValue = tfaConfigType == 'app' ? 1 : 2;//NO I18N
				jQuery('#templateMsg').val(tfaConfigValue).select2({ minimumResultsForSearch: -1 });

				const isAppConfig = tfaConfigType === 'app'; // Determine if it's an 'app' configuration //NO I18N

				jQuery('#EmailSubjectDescDiv').toggleClass('hide', !isAppConfig);//NO I18N
				jQuery('#EmailSubjectDescDivOperation').toggleClass('hide', isAppConfig);//NO I18N
				jQuery("div[aria-describedby=ApplicationConfig]").find(".ui-dialog-titlebar-close").attr("rel","uitip").attr("title",translate('sdp.common.close'));
				initTooltip(".ui-dialog");//NO I18N

			},
			close: function() {
				jQuery('body').removeClass('subheader-of-h');
				jQuery("#" + DigId + "").dialog('destroy');

			}
		});
		jQuery('#templateMsg').select2({ minimumResultsForSearch: -1 });
	},

	/*
	* changeConfiguration is used to switch between template option for message customization in email configuration
	*/
	changeConfiguration: function() {
		const templateMsgValue = document.getElementById('templateMsg').value;
		const elementId = templateMsgValue=== '1' ? 'loginTFAEmailDescription' : 'adminTFAEmailDescription';//NO I18N
		const iframeSelector = templateMsgValue === '1' ? '#ze_loginTFAEmailDescription iframe' : '#ze_adminTFAEmailDescription iframe';//NO I18N

		jQuery('#EmailSubjectDescDiv').toggleClass('hide', templateMsgValue !== '1');//NO I18N
		jQuery('#EmailSubjectDescDivOperation').toggleClass('hide', templateMsgValue === '1');//NO I18N

		zeditor({ element: elementId, buttonsToHide: ['image'], avoidMoreOption: true, isEnterKeyHandler: true, edithtml: true }); //NO I18N
		setTimeout(function() { tfa.initZE(tfa.macroAttributes, iframeSelector); }, 400);

	},

	/*
	*submitAdminConfigurations is used to save admin configuration TFA resources and it's other configurations
	*/
	submitAdminConfigurations: function() {
		// validating trust period
		if (jQuery('#enableTFATrust').is(':checked') && !(tfa.validateTrustPeriod())) {
			return false;
		}

		var input_data = { "data": {  "type": "authnsettings", "attributes": { "is_mfa_enabled": true, "action_not_enrolled": 1 } } };//NO I18N
		input_data.data.attributes.resources = tfa.getAdminTFAResources();

		// validating resources
		if (input_data.data.attributes.resources.length == 0) {
			showalert('failure', translate('mfa.config.status.msg.invalid.resources'), 'isAutoHide=false'); //NO I18N
			return false;
		}

		tfa.getTrustSettings(input_data);
	
		if(sdp_app.IS_SDP &&  input_data.data.attributes.is_mfa_trust_allowed){
			showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate('mfa.config.trust.warning') + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed) {//NO I18N
				if(proceed){
					tfa.updateTFAConfiguration(input_data);
				}
			});
		}else{
			tfa.updateTFAConfiguration(input_data);
		}

	
	},
	
	updateTFAConfiguration:function(input_data){
			sdpAjax({
			url: "/ids-authn/v1/wc/accessrules", //NO I18N
			data: sdpToJSON(input_data),
			async: false,
			contentType: 'application/json;charset=utf-8', //NO I18N
			dataType: 'json',//NO I18N
			type: "PUT", //NO I18N
			success: function(data) {
				if (data.status === "failure" || data.status === 'error') {
					showalert('failure', translate(data.status_msg), 'isAutoHide=false'); //NO I18N
				} else {
					showalert('success', translate('api.saved.success',[translate('mfa.config.admintfa.dialog.heading')]), 'isAutoHide=true'); //NO I18N
					setTimeout(() => {
							window.location.reload();
						}, 400);
				}
			},error: function(response){
				tfa.handleTFAError(response.responseJSON);
			}
		});
	},

	handleTFAError:function(errorResponse){
		var message = '';
		message = errorResponse.status ?  (errorResponse.status === 'mfa_required' ? translate('mfa.required') : '') : '';//NO I18N
		message ? showalert('failure', translate(message), 'isAutoHide=false') : ''; //NO I18N

	},

	/*
	*  Method used to get trust configurations for Admin TFA
	*/
	getTrustSettings: function(input_data) {
		input_data.data.attributes.is_mfa_trust_allowed = jQuery('#enableTFATrust').is(':checked');//NO I18N
		if (jQuery('#enableTFATrust').is(':checked')) {
			input_data.data.attributes.mfa_trust_period = jQuery("#mfaTrustPeriod").val();
			input_data.data.attributes.mfa_trust_period_unit_type = jQuery("#mfaTrustPeriodUnit").val();
		}
		return input_data;

	},

	/*
	*  Method used to get Admin TFA resources
	*/
	getAdminTFAResources: function() {

		var tfaOperations = document.getElementById("tfaOperations");
		var resources = [];

		for (var i = 0; i < tfaOperations.children.length; i++) {
			var operation = tfaOperations.children[i];
			if (operation.nodeName == "LI") {
				if (operation.children[0].children[0].checked) {
					resources.push(operation.children[0].children[0].value);
				}
			}
		}

		return resources;
	},

	/*
	*  Method used to show/hide Admin configurations
	*/
	showHideAdminConfigurations: function(isEnabled,isPortalSpecific) {
		if(isPortalSpecific){
			isEnabled ? jQuery('#operationDivPortal').fadeIn(500) : jQuery('#operationDivPortal').hide();
		}else{
			isEnabled ? jQuery('#operationDiv, div[data-tfahovedit]').fadeIn(500) : jQuery('#operationDiv, div[data-tfahovedit]').hide();
		}

	},

	/*
	*	loadHistory used to load TFA History
	*/
	loadHistory: function() {
		$previewComponent.load("/common/ViewHistory.jsp?id=0&module=tfa&key=twoFactorAuth", translate('ads.login.twofactor.two_factor_authentication_heading'), "70%", false, false, "admin_history", true, false, "custom_class:pl0 pr0 whitebg history-dig,isFullPage:true");//NO I18N
	},

	/*
	*	validateTrustPeriod used to validate trust configuration values before saving admin configurations
	*/
	validateTrustPeriod: function() {

		var mfaTrustPeriodElem = jQuery('#mfaTrustPeriod');

		var trustPeriod = mfaTrustPeriodElem.val();

		var trustPeriodUnit = jQuery("#mfaTrustPeriodUnit").val();

		const unitToRange = {
			4: 30, // Days
			3: 24, // Hours
			2: 60, // Minutes
		};

		const range = unitToRange[trustPeriodUnit] || 0;


		if (trustPeriod > range || trustPeriod < 1) {
			mfaTrustPeriodElem.parent().addClass('has-error');
			tfa.showToolTipMessage(mfaTrustPeriodElem[0], translate('enter.valid.number.range', [1, range]), -1);
			return false;
		}
		else {
			mfaTrustPeriodElem.parent().removeClass('has-error');
			tfa.hideBaloonToolTip('normalbubbletooltip');//NO I18N
			tfa.removeFrame();
			return true;
		}

	},


	showToolTipMessage: function(inputElementObj, message, timeOut) {
		var mydiv = document.getElementById('normalbubbletooltip');//No I18N
		var tooltipTimer, tooltipTimerRemove;
		if (mydiv != undefined) {
			mydiv.parentNode.removeChild(mydiv);
			mydiv = null;
		}
		if (mydiv == undefined) {
			mydiv = document.createElement('DIV');//No I18N
			inputElementObj.parentNode.appendChild(mydiv);
		}

		mydiv.style.zIndex = '300';
		mydiv.style.position = 'absolute';
		mydiv.style.marginTop = '0';

		mydiv.id = 'normalbubbletooltip';//No I18N
		mydiv.className = 'bubbletooltip';//No I18N
		mydiv.style.display = 'block';

		var left = tfa.getX(inputElementObj);
		var top = tfa.getY(inputElementObj) + inputElementObj.offsetHeight;

		//If the input field is in micket client dialog box then we need to re calculate position (Fix only for IE)
		if (document.getElementById('_DIALOG_LAYER') != undefined && document.getElementById('_DIALOG_LAYER').style.visibility == 'visible') {
			top = getY(inputElementObj);

			if (navigator.appName != "Netscape") {
				left = left - tfa.getX(document.getElementById('_DIALOG_LAYER')) - 24;//No I18N
				top = top - tfa.getY(document.getElementById('_DIALOG_LAYER')) - 24;//No I18N
			}
			else {
				left = left - tfa.getX(document.getElementById('_DIALOG_LAYER'));//No I18N
				top = top - tfa.getY(document.getElementById('_DIALOG_LAYER')) + inputElementObj.offsetHeight;//No I18N
			}
		}

		mydiv.style.left = left;
		mydiv.style.top = top;

		mydiv.innerHTML = "<div class='text-danger regions_form-jv-error alert-danger p3 pl10 font-xsmall'>" + e_html(message) + "</div>";//No I18N


		// In dialog window, the position is wrongly shown in IE
		if ((document.getElementById("_DIALOG_LAYER") != null) && (document.getElementById("_DIALOG_LAYER").style.visibility != 'hidden')) {
			if (document.all) {
				mydiv.style.left = left + 20 + "px";//No I18N
				mydiv.style.top = top + 40 + "px";//No I18N
			}
		}


		if (document.all && !browser_opera_ae) {
			iframeIEHackForSW = document.createElement("IFRAME");//No I18N
			iframeIEHackForSW.scrolling = "no";//No I18N
			iframeIEHackForSW.frameBorder = 0;
			if (window["CONTEXT_PATH"] != null) {
				iframeIEHackForSW.src = CONTEXT_PATH + "/framework/html/blank.html";//No I18N
			}
			iframeIEHackForSW.style.position = "absolute";//No I18N
			iframeIEHackForSW.style.zIndex = "200";//No I18N
			iframeIEHackForSW.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';//No I18N

			iframeIEHackForSW.style.width = mydiv.offsetWidth + "px";//No I18N
			iframeIEHackForSW.style.height = mydiv.offsetHeight + "px";//No I18N
			iframeIEHackForSW.style.top = parseInt(top) + "px";//No I18N
			iframeIEHackForSW.style.left = parseInt(left) + "px";//No I18N

			document.body.appendChild(iframeIEHackForSW);
		}

		if (timeOut == undefined || timeOut == null) {
			timeOut = 4000;
		}
		if (timeOut > -1) {
			clearTimeout(tooltipTimer, tooltipTimerRemove);
			tooltipTimer = setTimeout(function() { tfa.hideBaloonToolTip('normalbubbletooltip'); }, timeOut); //NO I18N
			tooltipTimerRemove = setTimeout(function() { tfa.removeFrame(); }, timeOut);
		}

		try {
			inputElementObj.focus();
		}
		catch (e) { }
	},

	getX: function(oElement) {
		var iReturnValue = 0;
		while (oElement != null) {
			iReturnValue += oElement.offsetLeft;
			oElement = oElement.offsetParent;
		}
		return iReturnValue;
	},

	getY: function(oElement) {
		var iReturnValue = 0;
		while (oElement != null) {
			iReturnValue += oElement.offsetTop;
			oElement = oElement.offsetParent;
		}
		return iReturnValue;
	},

	hideBaloonToolTip: function(divId) {
		var id = document.getElementById(divId);
		if (!id) {
			return false;
		}
		id.style.display = 'none'; //No I18N
	},

	removeFrame: function() {
		if (document.all && !browser_opera_ae && iframeIEHackForSW != undefined) {
			document.body.removeChild(iframeIEHackForSW);
			iframeIEHackForSW = null;
		}
	},

	tfaEdit : function(cur) {
        const parent = jQuery(cur).parents('div.freezelayer-wrapper'); //NO I18N
        parent.find('div[data-freeze="modal"]').addClass('hide');
        parent.find('div[data-freeze="submit"]').removeClass('hide');
    },

    validateAndSaveTFALoginRules: function(cur,reset) {
        const tfaLoginSection = jQuery('#tfaLoginConfigSection');
        if(reset) {
            tfaLoginSection.custom_filter('reintialize'); //NO I18N
        }
        const tfaLoginRules = tfaLoginSection.custom_filter('getDataWithID'); //NO I18N
        if (JSON.stringify(tfa.tfaLoginRulesCurrentAdvFilterData) == JSON.stringify(tfaLoginRules)) {
            showalert('info', translate('common.nothing.to.save'), 'isAutoHide=true'); //NO I18N
            return;
        } else if (tfaLoginRules == false) {
			return;
		}
		var showInactiveUsersPopup = false;
		if(tfaLoginRules != null && tfaLoginRules.length != 0 && tfa.tfaLoginRulesInactiveUsers.length != 0) {
            for (const jsonObject of tfaLoginRules) {
                if (jsonObject.field === 'user') {
                    for (const userID of tfa.tfaLoginRulesInactiveUsers) {
                        if(jsonObject.values.includes(userID)) {
                            showInactiveUsersPopup = true;
                            break;
                        }
                    }
                }
            }
        }
		if(showInactiveUsersPopup) {
			showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("tfa.login.rules.inactive.users.confirm.message") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed) {//NO I18N
				if (proceed) {
					tfa.saveTFALoginRules(tfaLoginRules,cur);
				}
			});
		} else {
            tfa.saveTFALoginRules(tfaLoginRules,cur);
        }
    },

	saveTFALoginRules:function(tfaLoginRules,cur) {
		var input_data = { tfa_login_rules : tfaLoginRules };
		sdpAjax({
			url: "/RestAPI/WC/TwoFactorAction?method=saveTFALoginRules", //NO I18N
			data: sdpAjaxInputData(input_data),
			async: true,
			type: "POST", //NO I18N
			success: function(data) {
				if(data.sSTATUS) {
					showalert('success', translate('custom.history.updated',[translate('tfa.login.rules.history')]), 'isAutoHide=true'); //NO I18N
					tfa.tfaCancel(cur);
					tfa.tfaLoginRulesInactiveUsers = [];
					tfa.currentTFALoginRules = data.currentTFALoginRules;
					jQuery("#tfaLoginConfigSection").custom_filter('update',tfa.currentTFALoginRules); //NO I18N
					tfa.tfaLoginRulesCurrentAdvFilterData = tfaLoginRules;
				} else if(data.eSTATUS) {
					showalert('failure', translate(data.eSTATUS), 'isAutoHide=false'); //NO I18N
				}
				if(tfa.currentTFALoginRules == null || tfa.currentTFALoginRules.length == 0) {
					jQuery("#loginTFAClearAndSave").hide();
				} else {
					jQuery("#loginTFAClearAndSave").show();
				}
			},
            error: function(data) {
                showalert('failure', translate(data.responseJSON.eSTATUS), 'isAutoHide=false'); //NO I18N
            }
		});
	},

    tfaCancel : function(cur) {
        const parent = jQuery(cur).parents('div.freezelayer-wrapper'); //NO I18N
        parent.find('div[data-freeze="modal"]').removeClass('hide');
        parent.find('div[data-freeze="submit"]').addClass('hide');
        if(cur.id == "loginTFACancelBtn") {
            jQuery("#tfaLoginConfigSection").custom_filter('update',tfa.currentTFALoginRules); //NO I18N
        }else if (cur.id == "adminTFACancelBtn") {
            tfa.init();
        }
    },

    changeURLData: function (field, url) {
    if (field == 'user') {
            var data = {};
            data.list_info = { "search_criteria": [{ "field": "login_name", "value": null, "condition": "is not", "logical_operator": "AND" }] };// No I18N
            return { "url": "api/v3" + url, "data": data, "field": field };// No I18N
        }
    }

}
