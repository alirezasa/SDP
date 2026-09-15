//$Id$
var $reorder_instances = (function() {
	var org_instance = {};
	var urlList = {};
	org_instance.init = function(from) {
		if( from === 'portal' ) {
			jQuery('#instance-reorder').off('click').on('click', function() {//NO I18N
				org_instance.openReorderInstanceFromPortal();
			});
			jQuery('#portal-save-instance-reorder').off('click').on('click', function() {//NO I18N
				org_instance.savePortalReorder();
			});
			jQuery('#portal-cancel-instance-reorder').off('click').on('click', function() {//NO I18N
				org_instance.backToInstanceList();
			});
			jQuery('#portal-instance-sort-order').sortable({
				placeholder: "ui-state-highlight",//NO I18N
				start: function(e, ui){
					ui.placeholder.height(ui.item.height());
				},
				scrollSpeed : 10,
			});
		} else if( from === 'esm' ) {//NO I18N
			org_instance.openOrganizeInstancePopUp();
			jQuery('#custom-instance-icon').off('change').on('change', function() {//NO I18N
				org_instance.uploadCustomInstanceIcon(this);
			});
			jQuery('#esm-save-instance-reorder').off('click').on('click', function() {//NO I18N
				org_instance.savePortalReorder();
			});
			jQuery('#esm-cancel-instance-reorder').off('click').on('click', function() {//NO I18N
				closeSecurityPopup(this);
			});
			jQuery('#back-custom-instance,#cancel-custom-instance').off('click').on('click', function() {//NO I18N
				org_instance.backToOrganizeInstance();
			});
			jQuery('#add-custom-instance,a[name=edit-custom-instance]').off('click').on('click', function() {//NO I18N
				org_instance.showCustomInstance(this);
			});
			jQuery('a[name=delete-custom-instance]').off('click').on('click', function() {//NO I18N
				org_instance.deleteCustomInstance(this);
			});
			jQuery('li a[name=scheme-type]').off('click').on('click', function() {//NO I18N
				jQuery('#scheme').text(jQuery(this).text());
			});
			jQuery('#save-custom-instance').off('click').on('click', function() {//NO I18N
				org_instance.saveCustomInstance();
			});
			jQuery('#update-custom-instance').off('click').on('click', function() {//NO I18N
				org_instance.updateCustomInstance(this);
			});
			jQuery('#esm-instance-sort-order').sortable({
				placeholder: "ui-state-highlight",//NO I18N
				start: function(e, ui){
					ui.placeholder.height(ui.item.height());
				},
				scrollSpeed : 10,
			});
			charCounter.init();
		}
	},
	org_instance.openOrganizeInstancePopUp = function() {
		var _self = this;
		if( jQuery('body').find('div[id=organize-instance]').length > 1 ) {
			jQuery('div[role=dialog] div[id=organize-instance]').remove();
		}
		sdpAjax({
			url: '/api/v3/portals/_get_all_portals',//NO I18N
			type: 'GET',//NO I18N
			async: false,
			success: function(respObj) {
				_self.urlList = {};
				var portalList = respObj.portals;
				for( var i = 0; i < portalList.length; i++ ) {
					var portalObj = portalList[i];
					if( portalObj.url != null ) {
						_self.urlList[portalObj.url] = portalObj.id;
					}
				}
				jQuery('#organize-instance').show().panelSlider({
					width: '480px',//NO I18N
					title: translate('esm.organize.instance'),
					placement: sdp_user.DIRECTION === 'RTL' ? 'left' : 'right',//NO I18N
					open: function() {
						renderhbs('#organize-instance-container', 'organize-instance', {'portals': respObj.portals, 'max_custom_helpdesk_count': sdp_app.MAX_CUSTOM_HELPDESK_COUNT}, false, 'esm', '', '', function() {// NO I18N
							initTooltip("#organize-instance-container");// NO I18N
						});
					},
					close: function() {
						jQuery('body').removeClass('subheader-of-h');
						jQuery('#organize-instance-container').html('');
					}
				});
			}
		});
	},
	org_instance.showCustomInstance = function(e) {
		var action = jQuery(e).attr('data-action');
		jQuery('#custom-instance-name-error, #custom-instance-link-error').remove();
		var e_name = jQuery('#custom-instance-name');
		var e_link = jQuery('#custom-instance-link');
		e_name.removeAttr('data-id');
		e_link.removeAttr('data-id');
		jQuery('#esm-organize-instance').addClass('hide');
		jQuery('#esm-custom-instance').removeClass('hide').fadeIn(150);
		jQuery('#custom-instance-icon').removeAttr('data-id');
		var e_title = jQuery('#organize-instance-title');
		var e_icon = jQuery('label[for=custom-instance-icon] img');
		var e_new_tab = jQuery('#new-tab');
		var e_add_btn = jQuery('#save-custom-instance');
		var e_update_btn = jQuery('#update-custom-instance')
		if( action === 'add') {
			e_title.text(translate('esm.new.custom.instance.link'));
			jQuery('#custom-instance-form')[0].reset();
			e_icon.attr('src', '/custom/esm/esm-blank.png');
			e_new_tab.prop('checked', true);//NO I18N
			e_add_btn.removeClass('hide');
			e_update_btn.addClass('hide');
		} else {
			var id = jQuery(e).attr('data-id');
			e_title.text(translate('esm.edit.custom.instance.link'));
			e_add_btn.addClass('hide');
			e_update_btn.removeClass('hide').attr('data-id', id);
			sdpAjax({
				url: '/api/v3/portals/' + id,//NO I18N
				type: 'GET',//NO I18N
				success: function(resp) {
					if( resp.response_status.status === 'success' ) {
						var portalObj = resp.portal;
						e_name.val(portalObj.name).attr('data-id', id);
						jQuery('#custom-instance-description').val(portalObj.description);
						var url = portalObj.url;
						var e_scheme = jQuery('#scheme');
						if( url.startsWith('https://') ) {
							e_scheme.text('https://');//NO I18N
							url = url.replaceAll('https://', '');//NO I18N
							e_link.val(url).attr('data-id', id);
						} else if ( url.startsWith('http://') ) {//NO I18N
						e_scheme.text('http://');//NO I18N
							url = url.replaceAll('http://', '');//NO I18N
							e_link.val(url).attr('data-id', id);
						}
						e_icon.attr('src', portalObj.logo_url['content-url']);
						if(portalObj.is_open_in_new_tab) {
							e_new_tab.prop('checked', true);//NO I18N
						} else {
							jQuery('#same-tab').prop('checked', true);//NO I18N
						}
					}
				}
			});
		}
		e_name.focus();
		org_instance.initCustomInstanceFormValidation();
	},
	org_instance.backToOrganizeInstance = function() {
		jQuery('#esm-custom-instance').addClass('hide');
		jQuery('#esm-organize-instance').removeClass('hide').fadeIn(150);
		jQuery('#custom-instance-form')[0].reset();
		jQuery('label[for=custom-instance-icon] img').attr('src', '/custom/esm/esm-blank.png');
		jQuery('#new-tab').prop('checked', true);//NO I18N
	},
	org_instance.uploadCustomInstanceIcon = function(e) {
		var files = e.files;
		if( files && files.length > 0 ) {
			var e_icon = jQuery('#custom-instance-form').find('input[id="custom-instance-icon"]');
			var accept_value = e_icon.attr("accept");
			e_icon.removeAttr("accept");
			var icon = jQuery(e)[0].files[0];
			var formdata = new FormData();
			formdata.append('input_image', icon);//NO I18N
			sdpAjax({
				processData: false,
				contentType: false,
				type: 'PUT',//NO I18N
				url: '/api/v3/portals/images',//NO I18N
				data: formdata,
				success:function(resp) {
					if( resp.response_status.status === 'success' ) {
						jQuery('label[for=custom-instance-icon] img').attr('src', resp.media['content-url']);
						jQuery('#custom-instance-icon').attr('data-id', resp.media.id);
						showalert('success', translate('portallogopic.uploadedMessage'), 'isAutoHide=true,delay=3');//NO I18N
					}
				},
				error: function() {
					jQuery('label[for=custom-instance-icon] img').attr('src', '/custom/esm/esm-blank.png');
					e_icon.removeAttr('data-id');
					jQuery(e).val('');
				}
			});
			e_icon.attr("accept", accept_value);
		}
	},
	org_instance.constructCustomInstanceInputData = function() {
		var customInstanceObj = {};
		customInstanceObj.name = jQuery('#custom-instance-name').val();
		customInstanceObj.description = jQuery('#custom-instance-description').val();
		var dataID = jQuery('#custom-instance-icon').attr('data-id');
		if( dataID !== '' && dataID !== undefined ) {
			var logoUrlObj = {};
			logoUrlObj.id = dataID;
			logoUrlObj['content-url'] = jQuery('label[for=custom-instance-icon] img').attr('src');//NO I18N
			customInstanceObj.logo_url = logoUrlObj;
		}
		customInstanceObj.url = jQuery('#scheme').text() + jQuery('#custom-instance-link').val();
		customInstanceObj.is_open_in_new_tab = jQuery('#new-tab').is(':checked');//NO I18N
		customInstanceObj.type = {'internal_name': 'Custom'};//NO I18N
		var inputData = {};
		inputData.portal = customInstanceObj;
		return inputData;
	},
	org_instance.initCustomInstanceFormValidation = function() {
		var _self = this;
		jQuery.validator.addMethod(
			'multiple_scheme',//NO I18N
			function(value, e) {
				var valid = true;
				if( /^http(s)?:\/\//.test(value) ) {
					valid = false;
				}
				return valid;
			},
			window.translate('esm.custom.instance.url.invalid.error.msg')
		);
		jQuery.validator.addMethod(
			'duplicate_name',//NO I18N
			function(value, e) {
				var id = jQuery(e).attr('data-id');
				var valid = true;
				jQuery("#esm-instance-sort-order li[data-id] span[data-id]").each(function() {
					if( id !== jQuery(this).attr('data-id') && jQuery(this).text().toLowerCase() === value.toLowerCase() ) {
						valid = false;
						return;
					}
				});
				return valid;
			},
			window.translate('esm.custom.instance.name.duplicate.error.msg')
		);
		jQuery.validator.addMethod(
			'duplicate_link',//NO I18N
			function(value, e) {
				value = jQuery('#scheme').text() + value;
				var id = jQuery(e).attr('data-id');
				var valid = true;
				if( Object.keys(_self.urlList).contains(value) && _self.urlList[value] !== id ) {
					valid = false;
					return;
				}
				return valid;
			},
			window.translate('esm.custom.instance.url.duplicate.error.msg')
		);
		jQuery.validator.addMethod(
			'max_len_check',//NO I18N
			function(value, e) {
				if((jQuery('#scheme').text()+value).length > 250) {
					return false;
				}
				return true;
			},
			window.translate('form.value.maximumvalue.alert')
		);
		var rules = {
			'custom-instance-name': {//NO I18N
				required: true,
				duplicate_name: true,
				max_length: 200,
				regex: /(?!^\d+$)^.+$/
			},
			'custom-instance-link': {//NO I18N
				required: true,
				multiple_scheme: true,
				duplicate_link: true,
				max_len_check: 250,
				regex: /^(http(s?)\:\/\/[-.\w]*)?(\/?)([a-zA-Z0-9\-\.\?\,\:\'\/\\\+=&amp;%\$;#_@]*)?$/
			}
		};
		var messages = {
			'custom-instance-name': {//NO I18N
				required: translate('esm.custom.instance.name.empty.error.msg'),
				max_length: translate('form.value.maximumvalue.alert'),
				regex: translate('mdh.instance.name.numeric')
			},
			'custom-instance-link': {//NO I18N
				required: translate('esm.custom.instance.url.empty.error.msg'),
				regex: translate('esm.custom.instance.url.invalid.error.msg')
			}
		};
		initFormValidator('custom-instance-form', rules, messages);//NO I18N
	},
	org_instance.saveCustomInstance = function() {
		var _self = this;
		var form = jQuery('#custom-instance-form');
		var e_icon = form.find('input[id="custom-instance-icon"]');
		var accept_value = e_icon.attr("accept");
		e_icon.removeAttr("accept");
		var isValid = jQuery(form).valid();
		if( isValid ) {
			if(jQuery('li[data-id] a[data-action=edit]').length >= sdp_app.MAX_CUSTOM_HELPDESK_COUNT) {
				showalert('failure', getMessageForKey('esm.custom.instance.limit.exceed', [sdp_app.MAX_CUSTOM_HELPDESK_COUNT]) , 'isAutoHide=true,delay=4');//NO I18N
				return;
			}
			var e_freeze_layer = jQuery('#organize-instance-loading-freeze');
			e_freeze_layer.removeClass('hide');
			var inputData = this.constructCustomInstanceInputData();
			sdpAjax({
				type: 'POST',//NO I18N
				url: '/api/v3/portals',//NO I18N
				data: sdpAjaxInputData(inputData),
				dataType: 'json',//NO I18N
				success: function(resp) {
					if( resp.response_status.status === 'success' ) {
						showalert('success', translate('api.added.success', [translate('esm.custom.instance')]), 'isAutoHide=true,delay=3');//NO I18N
						var portal = resp.portal;
						org_instance.backToOrganizeInstance();
						org_instance.appendNewInstanceBox(portal.id, portal.name, portal.logo_url['content-url'], true);//NO I18N
						initTooltip("#organize-instance-container");// NO I18N
						_self.urlList[portal.url] = portal.id;
					}
					e_freeze_layer.addClass('hide');
				},
				error: function(resp) {
					e_freeze_layer.addClass('hide');
				}
			});
		}
		e_icon.attr("accept", accept_value);
	},
	org_instance.updateCustomInstance = function(e) {
		var id = jQuery(e).attr('data-id');
		var form = jQuery('#custom-instance-form');
		var e_icon = form.find('input[id="custom-instance-icon"]');
		var accept_value = e_icon.attr("accept");
		e_icon.removeAttr("accept");
		var isValid = jQuery(form).valid();
		if( isValid ) {
			var e_freeze_layer = jQuery('#organize-instance-loading-freeze');
			e_freeze_layer.removeClass('hide');
			var inputData = this.constructCustomInstanceInputData();
			var _self = this;
			var old_url = Object.keys(_self.urlList).find(key => _self.urlList[key] === id);
			sdpAjax({
				type: 'PUT',//NO I18N
				url: '/api/v3/portals/' + id,//NO I18N
				data: sdpAjaxInputData(inputData),
				dataType: 'json',//NO I18N
				success: function(resp) {
					if( resp.response_status.status === 'success' ) {
						showalert('success', translate('api.updated.success', [translate('esm.custom.instance')]), 'isAutoHide=true,delay=3');//NO I18N
						var portalObj = resp.portal;
						jQuery('li[data-id='+id+'] span[data-id='+id+']').attr('title', portalObj.name).html(encodeHTML(portalObj.name));
						jQuery('li[data-id='+id+'] img').attr('src', portalObj.logo_url['content-url']);
						if( old_url !== portalObj.url ) {
							delete _self.urlList[old_url];
							_self.urlList[portalObj.url] = portalObj.id;
						}
						org_instance.backToOrganizeInstance();
					}
					e_freeze_layer.addClass('hide');
				},
				error: function(resp) {
					e_freeze_layer.addClass('hide');
				}
			});
		}
		e_icon.attr("accept", accept_value);
	},
	org_instance.deleteCustomInstance = function(e) {
		var _self = this;
		var id = jQuery(e).attr('data-id');
		if(id !== null && id !== undefined ) {
			var name = jQuery('li[data-id='+id+'] span[data-id='+id+']').text();
			showconfirm(true, 'title=' + translate('common.delete') + ', message=' + translate('esm.custom.instance.delete.confirm', [encodeHTML(name)]) + ', submitbutton=' + translate('common.delete') + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', deleteCallback, true);// NO I18N
			function deleteCallback(isdelete) {
				if(isdelete) {
					var old_url = Object.keys(_self.urlList).find(key => _self.urlList[key] === id);
					var e_freeze_layer = jQuery('#organize-instance-loading-freeze');
					e_freeze_layer.removeClass('hide');
					sdpAjax({
						url: '/api/v3/portals/' + id,//NO I18N
						type: 'DELETE',//NO I18N
						success: function(resp) {
							if(resp.response_status.status === 'success') {
								showalert('success', translate('api.deleted.success', [translate('esm.custom.instance')]), 'isAutoHide=true');//NO I18N
								jQuery('li[data-id='+id+']').fadeOut(300, function() {
									jQuery(this).remove();
								});
								delete _self.urlList[old_url];
							}
							e_freeze_layer.addClass('hide');
						},
						error: function(resp) {
							e_freeze_layer.addClass('hide');
						}
					});
				}
			}
		}
	},
	org_instance.appendNewInstanceBox = function(id, name, logo_url, isCustom) {
		var clone_element = jQuery('#portal-clone-instance-box');
		if( sdp_app.IS_ESMDIR ) {
			clone_element = jQuery('#esm-clone-instance-box');
		}
		if( clone_element.length == 1 ) {
			var e = clone_element.clone(true);
			e.attr('data-id', id).removeAttr('id').removeClass('hide');//NO I18N
			e.find('img[name=custom-instance-logo]').attr('src', logo_url);//NO I18N
			e.find('span[name=custom-instance-name]').attr('title', name).text(name).attr('data-id', id);//NO I18N
			if( !isCustom ) {
				e.find('span[name=custom-instance-link-icon]').remove();
			}
			if(sdp_app.IS_ESMDIR) {
				e.find('div[name=custom-instance-action]');//NO I18N
				e.find('a[name=edit-custom-instance]').attr('data-id', id);//NO I18N
				e.find('a[name=delete-custom-instance]').attr('data-id', id);//NO I18N
			}
			if( sdp_app.IS_ESMDIR ) {
				jQuery('#esm-instance-sort-order').append(e);
			} else {
				jQuery('#portal-instance-sort-order').append(e);
			}
		}
	},
	org_instance.savePortalReorder = function() {
		var ids = '';
		if( sdp_app.IS_ESMDIR ) {
			jQuery("#esm-instance-sort-order li[data-id]").each(function() {
				var element = jQuery(this);
				if(ids === '') {
					ids = element.attr('data-id');
				} else {
					ids += ',' + element.attr('data-id');
				}
			});
		} else {
			jQuery("#portal-instance-sort-order li[data-id]").each(function() {
				var element = jQuery(this);
				if(ids === '') {
					ids = element.attr('data-id');
				} else {
					ids += ',' + element.attr('data-id');
				}
			});
		}
		var params = '?ids=' + ids;//NO I18N
		if( sdp_app.IS_ESMDIR ) {
			var inputData = {'is_allowed':jQuery('#allow-user-reorder').is(':checked')};//NO I18N
			params += '&' + sdpAjaxInputData(inputData);
		}
		var e_freeze_layer = jQuery('#organize-instance-loading-freeze');
		e_freeze_layer.removeClass('hide');
		sdpAjax({
			url: '/api/v3/portals/_reorder' + params,//NO I18N
			type: 'put',//NO I18N
			dataType: 'json',//NO I18N
			success: function() {
				showalert('success', translate('esm.instance.reorder.updated'), 'isAutoHide=true');//NO I18N
				if( sdp_app.IS_ESMDIR ) {
					sdp_app.IS_USER_ALLOW_TO_REORDER_INSTANCE = jQuery('#allow-user-reorder').is(':checked');//NO I18N
					jQuery('#esm-cancel-instance-reorder').click();
				} else {
					var ids_list = ids.split(',');
					for( var i = 0; i < ids_list.length; i++ ) {
						jQuery('#instance-list a[data-id='+ids_list[i]+']').detach().appendTo('#instance-list');//NO I18N
					}
					org_instance.backToInstanceList();
				}
				e_freeze_layer.addClass('hide');
			},
			error: function() {
				e_freeze_layer.addClass('hide');
			}
		});
	},
	org_instance.backToInstanceList = function() {
		var jB = jQuery('body');
		jB.find('#instance-list').removeClass('hide');
		jB.find('#header-instance').removeClass('hide');
		jB.find('.esm-sidebar-footer').removeClass('hide').addClass('disp-flex');
		jB.find('#instance-reorder-list').addClass('hide');
		jB.find('#esm-sidebar .portal-content').removeAttr('style');//NO I18N
	},
	org_instance.openReorderInstanceFromPortal = function() {
		var jB = jQuery('body');
		jB.find('#instance-list, #header-instance').addClass('hide');
		jB.find('.esm-sidebar-footer').addClass('hide').removeClass('disp-flex');
		jB.find('#instance-reorder-list').removeClass('hide');
		jB.find('#esm-sidebar .portal-content').css('height', 'calc(100vh - 100px)');//NO I18N
		sdpAjax({
			url: '/api/v3/accessibleportals',//NO I18N
			type: 'GET',//NO I18N
			success: function(resp) {
				if( resp.response_status[0].status === 'success' ) {
					jQuery("#portal-instance-sort-order li[data-id]").each(function() {
						this.remove();
					});
					var portalList = resp.accessibleportal;
					for( var i = 0; i < portalList.length; i++ ) {
						var portal = portalList[i];
						var isCustom = ( portal.type === 'Custom' );
						org_instance.appendNewInstanceBox(portal.id, portal.name, portal.logo_url, isCustom);
					}
				}
			}
		});
	}
	return org_instance;
}());
