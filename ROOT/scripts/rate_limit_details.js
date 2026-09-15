var rateLimitDetails = {
	cancelOrEditLimit : function(isEdit)
	{
		if( isEdit )
		{
			jQuery('#rate_limit_info').addClass('hide');
			if( jQuery('#throttle_modified_on').text() != "" )
			{
				jQuery('#throttle_modified_info').addClass('hide');
			}
			jQuery('#edit_rate_limit').removeClass('hide');
		}
		else
		{
			jQuery('#edit_rate_limit').addClass('hide');
			jQuery('#rate_limit_info').removeClass('hide');
			if( jQuery('#throttle_modified_on').text() != "" )
			{
				jQuery('#throttle_modified_info').removeClass('hide');
			}
			jQuery('#url_threshold').val(jQuery('#url_threshold').attr('value'));
			jQuery('#integKeysDiv').parent().removeClass('has-error');
			rateLimitDetails.updateKeysIntoSelect2(false);
		}
	},
	updateKeysIntoSelect2 : function(isEdited, integ_keys) {
		if ( isEdited ) {
			let array = [];
			for (let json of integ_keys) {
				let obj = { "id": json.id, 'text': json.name };	//NO I18N
				array.push(obj);
			}
			jQuery('#listIntegKeys').data('integ-value', array); // No I18N
		}
		jQuery('#listIntegKeys').select2('data', jQuery('#listIntegKeys').data('integ-value')); // No I18N
	},
	initializeShowMore : function()
	{
		const showMoreOptions = {
			container : jQuery('#ThrottleIntegKeyConfig')
		};
		$showMore(showMoreOptions);
		if (jQuery('#ThrottleIntegKeyConfig').find('button').length > 0) {
			jQuery('#ThrottleIntegKeysList').addClass('disp-ib mt10');
		}
	},
	afterIntegrationKeyUpdate : function(keysArray) {
		jQuery('#ThrottleIntegKeyConfig').find('div').remove();
		jQuery('#ThrottleIntegKeysList').removeClass('disp-ib mt10');
		jQuery('#ThrottleIntegKeysList').css('height', ''); // No I18N
		jQuery('#ThrottleIntegKeysList').data("smInitialized", false); // No I18N
		let names = keysArray.map(user => user.name).join(', ');
		jQuery('#ThrottleIntegKeysList').removeClass('hidden');
		jQuery('#ThrottleIntegKeysList').text(names);
	},
	updateThrottleConfig : function( url_pattern_id, element, duration, helpdeskid)
	{
		url_config_id = jQuery(element).attr('url_config_id');
		
		let val = jQuery('#url_threshold').val().trim();
		
		if( !(Number(val) > 0) || !(Number(url_config_id) >= 0))
		{
			showalert('failure',translate('sdp.common.invalidnumber'), 'isAutoHide=false'); // No I18N	
			return;
		}
		
		var throttle_config = {};
		throttle_config.threshold = val;
		
		let appliesTo = jQuery('#throttleLimitTo').data('value').trim(); // No I18N
		
		if( appliesTo == 'limitToAllUsers' )
		{
			throttle_config.all_users = true;
		}
		else
		{
			let integKeys = jQuery('#listIntegKeys').select2('data');// No I18N	
			
			if( integKeys.length <= 0 )
			{
				showalert('failure',translate('sdp.api.security.exception.value.empty'), 'isAutoHide=false'); // No I18N	
				jQuery('#integKeysDiv').parent().addClass('has-error');
				return;
			}
			jQuery('#integKeysDiv').parent().removeClass('has-error');
			
			let keysArray = [];
			
			for( let i = 0 ; i < integKeys.length ; i ++ )
			{
				let obj = {};
				obj.name =  integKeys[i].text;
				keysArray[i] = obj;
			}
			
			throttle_config.all_users = false;
			throttle_config.integ_keys = keysArray;
		}
		
		throttle_config.url_pattern_id = url_pattern_id;
		
		if (url_config_id != "") {
			url_config_id = "/" + url_config_id;
		}
		
	   	sdpAjax(
	    {
	    	url: "/api/v3/throttle_configs"+url_config_id + ( (PORTALID && PORTALID>0) ? ("?esmDirectory=false" + (helpdeskid ? ("&PORTALID=" + helpdeskid) : "")) : ""),//NO I18N
	    	type: url_config_id == "" ? "POST" : "PUT", // No I18N
	    	data: sdpAjaxInputData({throttle_config}),
	    	success: function(resp)
			{
		    	if( resp.response_status.status.toLowerCase() == "success" )
		    	{
		      		showalert('success',translate('sdp.admin.setup.productyype.updatemsg'), 'isAutoHide=true,delay=4'); // No I18N
					jQuery('#throttle_modified_on').text(resp.throttle_config.modified_on.display_value);
					jQuery('#throttle_modified_by').text(resp.throttle_config.modified_by.name);
					jQuery(element).attr('url_config_id', resp.throttle_config.id);
					jQuery('#modifiedLimit').text(translate('modified.rate.limit.info',[jQuery('#url_threshold').val().trim(),duration]));
					jQuery('#url_threshold').attr('value', jQuery('#url_threshold').val().trim());
					if (!throttle_config.all_users) {
						rateLimitDetails.afterIntegrationKeyUpdate(throttle_config.integ_keys);
					}
					jQuery('#listIntegKeys').data('integ-value',jQuery('#listIntegKeys').select2('data')); // No I18N
					rateLimitDetails.cancelOrEditLimit(false);
					rateLimitDetails.initializeShowMore();
		    	}
		    	else
		    	{
		      		showalert('failure',e_html(resp.response_status.messages), 'isAutoHide=false'); // No I18N
		    	}
	    	},
	    	error: function(err) 
	    	{
	      		showalert('failure', e_html(err.responseJSON.response_status.messages[0].message) , 'isAutoHide=false'); // No I18N
	    	},
			complete: function() {
				if (!sdp_app.IS_AE) {
					setPORTALIDCookie();
				}
			}
		});
	},
	showSuspiciousNotificationAlert: function(moduleId, isread, id, helpdeskId, fromListView, fromSystemNotification) {
        sdpAjax({
            url: "/api/v3/throttle_exceeding_histories/" + moduleId + ( (PORTALID && PORTALID>0) ? ("?esmDirectory=false" + (helpdeskId ? ("&PORTALID=" + helpdeskId) : "")) : ""), //NO I18N
            type: "GET", // No I18N
            success: function(data) {
                const status = data.response_status.status;
                let throttle_history = data.throttle_exceeding_history;
                if (status.toLowerCase() == "success") {
					
					function updateThrottleConfigDetails(resp)
					{
						resp.throttleExceedDetails = [
							{key:translate('sdp.admin.url.access.violation.date'), value:resp.operation_time.display_value},
							{key:translate('sdp.admin.url.access.violation.url'), value:resp.url},
							{key:translate('sdp.admin.url.access.violation.ip'), value:resp.ip},
							{key:translate('sdp.admin.url.access.violation.user'), value:resp.user.name},
							{key:translate('sdp.requests.common.desc'), value:resp.description}
						];
						
						let violationDetailsHTML = renderhbs(jQuery(this), 'suspicious-activity', resp, false, "throttle", null, null, null, true); // NO I18N
						
						if (fromListView) {
							jQuery('#modify_access_content').html(violationDetailsHTML);
							$sdEventListener("#suspiciousActivityRender");	//NO I18N
							if ( resp.integration_key_present ) {
								jQuery('#ThrottleIntegKeysList').removeClass('hidden');
							}
							if( !resp.all_users )
							{
								jQuery('#listIntegKeys').sdp_select2({
									multiple: true,
									placeholder: translate("sdp.common.select"),//NO I18N
									allowClear: true,
									cache: {},
									url: [{
										url: "/api/v3/integration_keys?esmDirectory=false" + (resp.helpdesk_id ? ("&PORTALID=" + resp.helpdesk_id) : ""),//NO I18N
										list_info: { sort_field:"name", sort_order:"asc", start_index: 1, row_count: 25, search_fields:{"status":"active"} },//NO I18N
										field: 'integration_keys',//NO I18N
										complete:function(response) {
											if (!sdp_app.IS_AE) {
												setPORTALIDCookie();
											}
										}
									}],
									closeOnSelect: false
								});
							}
							if(sdp_user.DIRECTION == "LTR") {
				                jQuery('#modify_rate_limit_slider').removeClass('hide');
								jQuery('.formpopup-preview').animate({ right: "0px" }, 300);// NO I18N
				            } else {
				                jQuery('#modify_rate_limit_slider').removeClass('hide');
								jQuery('.formpopup-preview').animate({ left: "0px" }, 300);// NO I18N
				            }
							if (!resp.all_users) {
								rateLimitDetails.updateKeysIntoSelect2(true, resp.integ_keys);
							}
						}
						else {
							if (jQuery("#throttleHistoryBlock").children().length > 0) {
								jQuery("#throttleHistoryBlock").dialog("close");// NO I18N
							}
							if (jQuery("#suspicious-activities").children().length > 0) {
								jQuery("#suspicious-activities").dialog("close");// NO I18N
							}
							
							jQuery("#suspicious-activities").dialog({ //NO I18N
								modal: true,
								draggable: true,
								width: 700,
								title: resp.violation_type,
								closeOnEscape: false,
								position: { my: "center top", at: "center top+100", of: window },// No I18N
								open: function() {
									if (!fromSystemNotification && !fromListView) {
										$notifContainer.find('[data-id=' + id + ']').removeClass("highlight").addClass("active"); //NO I18N
										$notif.find("[data-action='close']").removeClass("disp-ib").addClass("vhide"); //NO I18N
									}
									else {
										markAsRead(id);
									}
									jQuery(this).html(violationDetailsHTML);
									$sdEventListener("#suspiciousActivityRender");	//NO I18N
									if ( resp.integration_key_present ) {
										jQuery('#ThrottleIntegKeysList').removeClass('hidden');
									}
									if( !resp.all_users )
									{
										jQuery('#listIntegKeys').sdp_select2({
											multiple: true,
											placeholder: translate("sdp.common.select"),//NO I18N
											allowClear: true,
											cache: {},
											url: [{
												url: "/api/v3/integration_keys?esmDirectory=false" + (resp.helpdesk_id ? ("&PORTALID=" + resp.helpdesk_id) : ""),//NO I18N
												list_info: { sort_field:"name", sort_order:"asc", start_index: 1, row_count: 25, search_fields:{"status":"active"} },//NO I18N
												field: 'integration_keys',//NO I18N
												complete:function(response) {
													if (!sdp_app.IS_AE) {
														setPORTALIDCookie();
													}
												}
											}],
											closeOnSelect: false
										});
									}
									if (!resp.all_users) {
										rateLimitDetails.updateKeysIntoSelect2(true, resp.integ_keys);
									}
								},
								close: function() {
									if (!fromSystemNotification && !fromListView) {
										$bellNotifications.handleTick(activeClassID);
										$notifContainer.find('[data-id=' + id + ']').removeClass("active"); //NO I18N
										$notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
									}
									else {
										markAsRead(id);
									}
									jQuery(this).dialog("destroy").empty(); //NO I18N
								}
							});

							if (!isread) {
								markAsRead(id);
							}
						}

						if (resp.modified_on != null) {
							jQuery('#throttle_modified_info').removeClass('hide');
						}
						
						if ( !resp.all_users && resp.url_config_id == null ) {
							sdpAjax({
 								url: "/api/v3/integration_keys?esmDirectory=false" + (resp.helpdesk_id ? ("&PORTALID=" + resp.helpdesk_id) : ""), //NO I18N
 								type: "GET", //NO I18N
 								success: function(response) {
 									for (const keys of response.integration_keys) {
 										if (resp.integ_key.name == keys.name && keys.status == "active") {
											rateLimitDetails.updateKeysIntoSelect2(true, [resp.integ_key]);
											break;
			 							}
			 						}
			 					}
			 				});
						}
												
						rateLimitDetails.initializeShowMore();
					}
					
					if( throttle_history.url_config_id == null)
					{
						throttle_history.modified_limit = throttle_history.threshold;

						throttle_history.modified_duration = Number(throttle_history.duration);

						throttle_history.all_users = throttle_history.integ_key == null;
								
						throttle_history.is_org_admin = sdp_app.IS_SDOrgAdmin ;
						
						throttle_history.integ_keys = [];
						
						throttle_history.integration_key_present = false;
						
						updateThrottleConfigDetails(throttle_history)
					}
					else
					{
						sdpAjax({
							url: "/api/v3/throttle_configs/" + throttle_history.url_config_id + ( (PORTALID && PORTALID>0) ? ("?esmDirectory=false" + (helpdeskId ? ("&PORTALID=" + helpdeskId) : "")) : ""), //NO I18N
							type: "GET", // No I18N
							success: function(resp) {
								if (resp.response_status.status.toLowerCase() == "success") {
									
									resp.throttle_config.duration = Number(throttle_history.duration); //Duration transformed in ThrottleTransformer
	
									throttle_history.modified_limit = resp.throttle_config.threshold;
	
									throttle_history.modified_duration = resp.throttle_config.duration;
	
									throttle_history.modified_on = resp.throttle_config.modified_on;
	
									throttle_history.modified_by = resp.throttle_config.modified_by;
		
									throttle_history.all_users = resp.throttle_config.all_users;
									
									throttle_history.is_org_admin = sdp_app.IS_SDOrgAdmin ;
									
									throttle_history.integ_keys = resp.throttle_config.integ_keys;
									
									throttle_history.integration_key_present = (resp.throttle_config.integ_keys.length>0 ? true : false);
									
									updateThrottleConfigDetails(throttle_history);
								}
								else {
									showalert('failure', e_html(resp.response_status.messages), 'isAutoHide=false'); // No I18N
								}
							},
							error: function(err) {
								showalert('failure', e_html(err.responseJSON.response_status.messages[0].message), 'isAutoHide=false'); // No I18N
							},
							complete: function() {
								if (!sdp_app.IS_AE) {
									setPORTALIDCookie();
								}
							}
						})
					}
                } else {
                    showalert('failure',e_html(data.response_status.messages), 'isAutoHide=false'); // No I18N
                }
            },
            error: function(err) {
                showalert('failure',e_html(err.responseJSON.response_status.messages[0].message), 'isAutoHide=false'); // No I18N
            },
			complete: function() {
				if (!sdp_app.IS_AE) {
					setPORTALIDCookie();
				}
			}
        })
    }
};
