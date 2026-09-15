var mobileAppConfig = {

	config_data : {},
	loadConfiguration : function(load) {
	    if(load) {
    		this.getConfigData();
	    }
		jQuery("#saving").hide(); //Hide the common save button
		renderhbs('#mobileAppConfig', 'mobile_app_security_config', this.config_data, false, 'admin');      // No I18N
		jQuery("#mobileAppLoadingDiv").hide(); // Hide the loading text
		this.afterLoad(); //init event listeners and modify view history button
		initTooltip("#mobileAppConfig");// No I18N
	},
	afterLoad: function() {
		var mobileAppForm = jQuery('#mobileAppConfig');
		var sessionTimeout = mobileAppForm.find('#allowMobileSessionTimeout');

        //Hide timeout in mins if the mobile session timeout is disabled
		if(!sessionTimeout.prop('checked')) {
			jQuery('#mobileSessionSubdiv').hide();
		}
		//Attach event listener for session timeout checkbox
		sessionTimeout.on('click', function(){      // No I18N
            var mobileSessionTimeoutEnabled = sessionTimeout.prop('checked');   // No I18N
            mobileAppForm.find('#mobileSessionSubdiv').toggle(mobileSessionTimeoutEnabled);
		});

		//Trigger on Save
		mobileAppForm.find('#saveMobileAppConfig').on('click', function(event) {
		    var ele = event.target;
		    mobileAppConfig.saveConfig(ele);
		});

		//Set value for session timeout in minutes
		mobileAppForm.find('#mobileSessionTimeout').val(this.config_data.session_timeout_in_mins);

		//Set the current tab's entity in "View history" button
		var sshistory = jQuery("#security_settings_history");
		sshistory.attr({
            "search-filter": "mobile_app_config",   // No I18N
            "data-id": "mobile_app_configs",    // No I18N
            "entity-key": translate("ae.cmdb.source.mobile"),   // No I18N
            "skip-filter-options": "entity,operationName"   // No I18N
        });

        jQuery("#securitysettings").removeData("validator").validate({      // No I18N
            errorClass: 'text-danger',      // No I18N
            errorPlacement: function(error, element) {
                position = element.position();
                error.insertAfter(element);
                var isMobileSessionTimeout = "mobileSessionTimeout" == element[0].id
                var top = (position.top + (isMobileSessionTimeout? 112 : 50)) + 'px';   // No I18N
                var left = isMobileSessionTimeout ? ((position.left + 20) + 'px') : '80px';      // No I18N
                error.addClass('alert alert-danger alert-arrow p5 pos-abs').css({
                    'overflow': 'visible',      // No I18N
                    'top': top,             // No I18N
                    'z-index': '100',       // No I18N
                    'left': left            // No I18N
                });
            },
			invalidHandler: function(event, validator) {
				if (validator.numberOfInvalids()) {
				  $(validator.errorList[0].element).focus();
				}
			},
            messages: {
                mobileSessionTimeout: {
                    required: translate("common.validation", [translate('ss.logout.inactive.app.session')]),
                    maxlength: translate('admin.mobile.session.timeout.info'),
                    min: translate('admin.mobile.session.timeout.info'),
                    max: translate('admin.mobile.session.timeout.info')
                }
            }
        });
	},
	getConfigData : function() {
		sdpAjax({
			url : '/api/v3/mobile_app_configs/_get_security_configuration',     // No I18N
			method: 'GET',  // No I18N
			async: false,
			complete: function(response) {
				var errorMsg = translate('sdp.common.error.unknown'), status = 'failure';   // No I18N
				var responseJson = response.responseJSON;
				if(responseJson) {
					var response_status = responseJson.response_status;
					if("success" == response_status.status) {
						status = "success";     // No I18N
						mobileAppConfig.config_data = responseJson.mobile_app_config;
						mobileAppConfig.config_data.IS_AE = sdp_app.IS_AE;
					}
					else {
						status = response_status.status;
						errorMsg = response_status.messages[0].message;
					}
				}
				if(status != "success") {
					showalert(status, errorMsg, 'isAutoHide=false');        // No I18N
				}
			}
		})
	},
	validate: function() {
        return jQuery("#securitysettings").valid();
	},
	saveConfig: function(ele) {
		if(!this.validate()) {
			return false;
		}
		jQuery("#alertbox").remove();
		var mobileApp = jQuery('#mobileAppConfig');
		setTimeout(function() {
			jQuery(ele).button('loading');
		}, 100);
		var input = {};
		if(!sdp_app.IS_AE) {
		    input.allow_paste_option = mobileApp.find('#allowPaste').prop('checked'); //No I18N
            input.allow_attachment_operations = mobileApp.find('#allowAttachmentOperations').prop('checked'); //No I18N
            input.allow_screen_captures = mobileApp.find('#allowScreenshots').prop('checked'); //No I18N
		}
		input.allow_session_timeout = mobileApp.find('#allowMobileSessionTimeout').prop('checked');     // No I18N
		if(input.allow_session_timeout) {
			input.session_timeout_in_mins = mobileApp.find('#mobileSessionTimeout').val();
		}
		if(!sdp_app.IS_AE) {
            // Azure PreAuth data
            input.pre_auth_enabled = mobileApp.find('#pre_auth_enabled').prop('checked');     // No I18N
            input.pre_auth_client_id = mobileApp.find('#pre_auth_client_id').val();
            input.pre_auth_client_secret = mobileApp.find('#pre_auth_client_secret').val();
            input.pre_auth_authorize_url = mobileApp.find('#pre_auth_authorize_url').val();
            input.pre_auth_token_url = mobileApp.find('#pre_auth_token_url').val();
        }

		input = {"mobile_app_security_config" : input};     // No I18N
		sdpAjax({
			url : '/api/v3/mobile_app_configs/_save_security_configuration',    // No I18N
			method: 'POST',     // No I18N
			data: sdpAjaxInputData(input),
			async: false,
			complete: function(resp) {
                var response_status = resp.responseJSON.response_status;
                var status = response_status.status;
				status = (status == "failed") ? "failure" : status;     // No I18N
                var message = status == "success" ? translate("mobileapp.session.saved.success") : response_status.messages[0].message;  // No I18N
				showalert(status, message, 'isAutoHide=' + ("failure" == status ? 'false' : 'true'));   // No I18N
				if(status == "success") {
                    mobileAppConfig.config_data = resp.responseJSON.mobile_app_config;
                    mobileAppConfig.config_data.IS_AE = sdp_app.IS_AE;
                    mobileAppConfig.loadConfiguration(false);
				} else {
            		setTimeout(function() {
                        jQuery(ele).button('reset');
            		}, 100);
				}
            }
		});
	},

    onChangePreAuth: function(e) {
        var checked = jQuery(e).prop('checked');        // No I18N
        var container = jQuery("#pre_auth_freeze");
        container.toggleClass("disableDiv", !checked);      // No I18N
        container.find("input").attr('disabled', !checked);     // No I18N
        container.find('.alert-danger').remove();
        jQuery("#pre_auth_form").toggleClass("cur-na", !checked);     // No I18N

        // revert values on disable
        if(!checked && !mobileAppConfig.isEmpty()) {
            mobileAppConfig.resetAll();
        }
    },

    copyRedirectUrl: function () {
        copyToClipboard("pre_auth_redirect_url");   // No I18N
    },

    isEmpty() {
        var container = jQuery("#pre_auth_freeze");
        return (container.find('#pre_auth_client_id').val() ||
            container.find('#pre_auth_client_secret').val() ||
            container.find('#pre_auth_authorize_url').val() ||
            container.find('#pre_auth_token_url').val()).empty()
    },

    clearAll: function () {
        var container = jQuery("#pre_auth_freeze");
        container.find('#pre_auth_client_id').val("");
        container.find('#pre_auth_client_secret').val("");
        container.find('#pre_auth_authorize_url').val("");
        container.find('#pre_auth_token_url').val("");

        showClientSecret('client_secret', true);        // No I18N
    },

    resetAll: function () {
        var container = jQuery("#pre_auth_freeze");
        container.find('#pre_auth_client_id').val(this.config_data.pre_auth_client_id);
        container.find('#pre_auth_client_secret').val(this.config_data.pre_auth_client_secret);
        container.find('#pre_auth_authorize_url').val(this.config_data.pre_auth_authorize_url);
        container.find('#pre_auth_token_url').val(this.config_data.pre_auth_token_url);

        mobileAppConfig.resetClientSecret();
    },

    resetClientSecret: function () {
        resetClientSecret('client_secret');   // No I18N
        jQuery("#pre_auth_client_secret").val('')
    }
}
