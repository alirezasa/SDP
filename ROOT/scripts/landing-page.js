var $landing_page = (function() {
	var landing = {};
	var incident_templates;
	var service_templates;
	var st_count = '';
	var sub_modules = {'my_view': translate('sdp.home.dashboard'), 'scheduler': translate('sdp.actions.scheduler'), 'backup_approver': translate('sdp.api.backup.approver'), 'resource_management': translate('sdp.resource.management'), 'pending_approval': translate('sdp.home.approval.allmypendingapprovals')};//NO I18N
	landing.render = async function(from) {
		if(sdp_app.IS_SDP) {
			var templateData = {};
			var data;
			if(from === 'personalization') {
				data = getPersonalizeData('landingpage', {'is_portalspecific':true});//NO I18N
				templateData.technician = data;
			}
			if(from === 'customization' || data === undefined || Object.keys(data).length === 0) {
				data = getGlobalPersonalization('landing_page');//NO I18N
				if(data === null) {
					data = await landing.getDefaultData();
					templateData.technician = data;
					if(data.sub_module) {
						delete data.sub_module;
					}
					if(data.is_allowed_to_customize) {
						delete data.is_allowed_to_customize;
					}
					templateData.user = data;
				} else {
					templateData = data;
				}
			}
			templateData.from = from;
			Handlebars.registerPartial('landing-page-fields', renderhbs('', 'landing-page-fields', null, '', 'admin/landing', '', '', '', true));//NO I18N
			if(from === 'customization') {
				templateData.is_request_module_enabled = true;
				renderhbs('#landing_tab', 'landing-page-customization', templateData, false, 'admin/landing', true);//NO I18N
			} else if(from === 'personalization') {//NO I18N
				templateData.is_request_module_enabled = await landing.isRequestModuleEnabled();
				renderhbs('#landing-page-personalization', 'landing-page-personalization', templateData, false, 'admin/landing', true);//NO I18N
			}
			if(from === 'customization') {
				await landing.loadTemplates('incident');//NO I18N
				if(sdp_app.IS_SERVICECATALOG_ENABLED) {
					await landing.loadTemplates('service');//NO I18N
				}
				landing.init(from, 'user', templateData.user, templateData.is_request_module_enabled);//NO I18N
			}
			landing.init(from, 'technician', templateData.technician, templateData.is_request_module_enabled);//NO I18N
			landing.initFormValidation(from);
		}
	},
	landing.getDefaultData = async function() {
		var data = {};
		data.landing_type = 'tab';//NO I18N
		data.module = 'home';//NO I18N
		data.sub_module = 'my_view';//NO I18N
		data.is_allowed_to_customize = false;
		data.template = await landing.getDefaultTemplateObj();
		return data;
	},
	landing.getDefaultTemplateObj = async function() {
		var templateName = 'Default Request';//NO I18N
		var templateObj = {};
		templateObj.name = templateName;
		templateObj.type = 'incident';
		var list_info = {
			search_criteria: {
				field: 'name',//NO I18N
				condition: 'is',//NO I18N
				value: templateName
			}
		};
		var inputObject = {'list_info': list_info};//NO I18N
		await sdpAjax({
			type: 'GET',//NO I18N
			url: '/api/v3/requests/template',//NO I18N
			data: sdpAjaxInputData(inputObject),
			dataType: 'json',//NO I18N
			success: function(resp) {
				if(resp.template) {
					templateObj.id = parseInt(resp.template[0].id);
				}
			}
		});
		return templateObj;
	},
	landing.isRequestModuleEnabled = async function() {
		if(sdp_user.ROLES.includes('CreateRequests')) {
			var tabs = manage_Tabs.data;
			for(var i = 0; i < tabs.length; i++) {
				var tabObj = tabs[i];
				if(tabObj.id === 'requests') {
					return true;
				}
			}
		}
		return false;
	},
	landing.init = async function(from, user_type, data, is_request_module_enabled) {
		var container = (from === 'customization') ? jQuery('#landing_tab') : jQuery('#landing-page-personalization');//NO I18N
		container.off('.landing');//NO I18N
		var $landingType;
		var $moduleType;
		var $moduleTab;
		var $subModuleTab;
		var $templateType;
		var $templatetList;
		if(from === 'customization') {
			$landingType = (user_type === 'technician') ? container.find('input[name="customization-technician-landing-type"]') : container.find('input[name="customization-user-landing-type"]');//NO I18N
			$moduleType = (user_type === 'technician') ? container.find('#customization-technician-module-type') : container.find('#customization-user-module-type');//NO I18N
			$moduleTab = (user_type === 'technician') ? container.find('#customization-technician-module-tabs') : container.find('#customization-user-module-tabs');//NO I18N
			$subModuleTab = (user_type === 'technician') ? container.find('#customization-technician-sub-module-tabs') : null;//NO I18N
			$templateType = (user_type === 'technician') ? container.find('#customization-technician-template-type') : container.find('#customization-user-template-type');//NO I18N
			$templatetList = (user_type === 'technician') ? container.find('#customization-technician-template-list') : container.find('#customization-user-template-list');//NO I18N
		} else if(from === 'personalization') {//NO I18N
			$landingType = container.find('input[name="personalization-technician-landing-type"]');//NO I18N
			$moduleType = container.find('#personalization-technician-module-type');//NO I18N
			$moduleTab = container.find('#personalization-technician-module-tabs');//NO I18N
			$subModuleTab = container.find('#personalization-technician-sub-module-tabs');//NO I18N
			if(is_request_module_enabled) {
				$templateType = container.find('#personalization-technician-template-type');//NO I18N
				$templatetList = container.find('#personalization-technician-template-list');//NO I18N
			}
		}
		if(is_request_module_enabled) {
			$landingType.on('change.landing', function() {//NO I18N
				if($moduleType.is(':checked')) {
					$moduleTab.removeAttr('disabled');
					if(user_type === 'technician' && !$subModuleTab.hasClass('hide')) {
						$subModuleTab.removeAttr('disabled');
					}
					$templatetList.prop('disabled', true);//NO I18N
					setTimeout(function() {$moduleTab.select2('open');}, 1);//NO I18N
				} else if($templateType.is(':checked')) {//NO I18N
					$moduleTab.prop('disabled', true);//NO I18N
					if(user_type === 'technician' && !$subModuleTab.hasClass('hide')) {
						$subModuleTab.prop('disabled', true);//NO I18N
					}
					$templatetList.removeAttr('disabled');
					setTimeout(function() {$templatetList.filter(':visible').select2('open');}, 1);//NO I18N
				}
			});
		}
		if(user_type === 'technician') {
			$moduleTab.on('change.landing', function() {//NO I18N
				if($subModuleTab.children('option').length > 1) {
					var id = jQuery(this).val();
					if(id === 'home') {
						$subModuleTab.removeClass('hide').next('span').attr('title', translate('instance.landing.page.sub.module.tab.desc'));//NO I18N
					} else {
						$subModuleTab.addClass('hide').next('span').attr('title', translate('instance.landing.page.tech.module.tab.desc'));//NO I18N
					}
				}
			});
		}
		if(is_request_module_enabled) {
			if($moduleType.is(':checked')) {
				$moduleTab.removeAttr('disabled');
				if(user_type === 'technician' && data.module === 'home') {
					$subModuleTab.removeAttr('disabled');
				}
				$templatetList.prop('disabled', true);//NO I18N
			} else {
				$moduleTab.prop('disabled', true);//NO I18N
				if(user_type === 'technician' && data.module === 'home') {
					$subModuleTab.prop('disabled', true);//NO I18N
				}
				$templatetList.removeAttr('disabled');
			}
		}
		await landing.populateModuleTabs(from, user_type, data.module, data.sub_module);
		if(is_request_module_enabled) {
			var isExists = false;
			if(data.template && data.template.id !== undefined) {
				isExists = await landing.isTemplateExists(from, data.template.type, data.template.id, user_type);
			}
			if(!isExists) {
				data.template = await landing.getDefaultTemplateObj();
			}
			landing.initTemplateList(from, user_type, data.template.type, data.template.id, data.template.name);
		}
	},
	landing.populateModuleTabs = async function(from, user_type, module, sub_module) {
		var container = (from === 'customization') ? jQuery('#landing_tab') : jQuery('#landing-page-personalization');//NO I18N
		var e_landing_tab;
		if(from === 'customization') {
			e_landing_tab = (user_type === 'technician') ? container.find('#customization-technician-module-tabs') : container.find('#customization-user-module-tabs');//NO I18N
		} else if(from === 'personalization') {//NO I18N
			e_landing_tab = container.find('#personalization-technician-module-tabs');//NO I18N
		}
		if(e_landing_tab.length == 1) {
			var tabs = manage_Tabs.data;
			var includeTabs;
			if(user_type === 'user') {
				includeTabs = ['home', 'dashboard', 'requests', 'changes', 'projects', 'releases', 'solutions'];//NO I18N
			}
			var isModuleExists = false;
			for(var i = 0; i < tabs.length; i++) {
				var tabObj = tabs[i];
				if(includeTabs === undefined || (includeTabs.includes(tabObj.id) || tabObj.is_dynamic)) {
					var e_option = jQuery('<option></option>').text(translate(tabObj.i18n_key)).val(tabObj.id);
					if(tabObj.id === module) {
						e_option.attr('selected', 'true');
						isModuleExists = true;
					}
					e_landing_tab.append(e_option);
				}
			}
			e_landing_tab.select2();
			if(user_type === 'technician') {
				var sub_e = (from === 'customization') ? container.find('#customization-technician-sub-module-tabs') : container.find('#personalization-technician-sub-module-tabs');//NO I18N
				if(sub_e.length == 1) {
					await sdpAjax({
						type: 'GET',//NO I18N
						url: '/servlet/AJaxServlet?action=GetSubModuleDetails',//NO I18N
						dataType: 'json',//NO I18N
						success: function(resp) {
							if(resp.sub_modules) {
								var subTabs = resp.sub_modules;
								for(var i = 0; i < subTabs.length; i++) {
									var subTabObj = subTabs[i];
									var e_option = jQuery('<option></option>').text(translate(subTabObj.i18n_key)).val(subTabObj.id);
									if(subTabObj.id === sub_module) {
										e_option.attr('selected', 'true');
									}
									sub_e.append(e_option);
								}
								sub_e.select2();
								var title = translate('instance.landing.page.tech.module.tab.desc');
								if(subTabs.length > 1) {
									if(module === 'home' || !isModuleExists) {
										title = translate('instance.landing.page.sub.module.tab.desc');
										sub_e.removeClass('hide');
									}
								} else {
									title = translate('instance.landing.page.tech.module.tab.desc');
								}
								sub_e.next('span').attr({'title': title, 'rel': 'uitip'});//NO I18N
							}
						}
					});
				}
			}
		}
	},
	landing.isTemplateExists = async function(from, type, id, user_type) {
		var isExists = false;
		if(from === 'customization') {
			if(type === 'incident') {
				jQuery.each(incident_templates, function (i, templateObj) {
					if(id === parseInt(templateObj.id) && (user_type === 'technician' || (user_type === 'user' && templateObj.show_to_requester && templateObj.show_to_requester === true))) {
						isExists = true;
						return;
					}
				});
			} else if(type === 'service') {//NO I18N
				var key = 'templates';//NO I18N
				await jQuery.each(service_templates, function (i, templates) {
					jQuery.each(templates[key], function (i, templateObj) {
						if(id === templateObj.id) {
							isExists = true;
							return;
						}
					});
				});
			}
		} else if(from === 'personalization') {//NO I18N
			var key = 'templates';//NO I18N
			var templateList = template_obj.cloneCategories();
			await jQuery.each(templateList, function (i, templates) {
				jQuery.each(templates[key], function (i, templateObj) {
					if(id === templateObj.id) {
						isExists = true;
						return;
					}
				});
			});
		}
		return isExists;
	},
	landing.initTemplateList = function(from, user_type, type, id) {
		var key = 'templates';//NO I18N
		var container = (from === 'customization') ? jQuery('#landing_tab') : jQuery('#landing-page-personalization');//NO I18N
		var template_element;
		if(from === 'customization') {
			template_element = (user_type === 'technician') ? container.find('#customization-technician-template-list') : container.find('#customization-user-template-list');//NO I18N
		} else if(from === 'personalization') {//NO I18N
			template_element = container.find('#personalization-technician-template-list');//NO I18N
		}
		if(type === 'incident') {
			jQuery('<option>').appendTo(template_element);
			if(from === 'customization') {
				jQuery.each(incident_templates, function (i, templateObj) {
					if(!templateObj.is_service_template && (user_type === 'technician' || (user_type === 'user' && templateObj.show_to_requester && templateObj.show_to_requester === true))) {
						var option = jQuery('<option>').val(templateObj.id).text(templateObj.name);
						if(id === parseInt(templateObj.id)) {
							option.attr('selected', 'true');
						}
						option.appendTo(template_element);
					}
				});
			} else if(from === 'personalization') {//NO I18N
				var templateList = template_obj.cloneCategories();
				jQuery.each(templateList, function (i, templates) {
					jQuery.each(templates[key], function (i, templateObj) {
						if(!templateObj.is_service_template) {
							var option = jQuery('<option>').val(templateObj.id).text(templateObj.name);
							if(id === templateObj.id) {
								option.attr('selected', 'true');
							}
							option.appendTo(template_element);
						}
					});
				});
			}
		} else if( type === 'service' ) {//NO I18N
			$select_group = template_element;
			jQuery('<option>').appendTo(template_element);
			if(from === 'customization') {
				jQuery.each(service_templates, function (i, templates) {
					$select_group.append('<optgroup label=" ' + e_attr(templates.name) + '" id="' + templates.id + '"></optgroup>');//NO I18N
					htmlOpts = [];
					jQuery.each(templates[key], function (i, templateObj) {
						if(templateObj.inactive === false && templateObj.is_service_template === true && (user_type === 'technician' || (user_type === 'user' && templateObj.is_show_to_requester === true))) {
							var option;
							if(id === templateObj.id) {
								option = new Option(templateObj.name, templateObj.id, true, true);
							} else {
								option = new Option(templateObj.name, templateObj.id);
							}
							htmlOpts.push(jQuery(option));
						}
					});
					$select_group.find('optgroup:last').append(htmlOpts);//NO I18N
				});
			} else if(from === 'personalization') {//NO I18N
				var templateList = template_obj.cloneCategories();
				jQuery.each(templateList, function (i, templates) {
					$select_group.append('<optgroup label=" ' + e_attr(templates.name) + '" id="' + templates.id + '"></optgroup>');//NO I18N
					htmlOpts = [];
					jQuery.each(templates[key], function (i, templateObj) {
						if(templateObj.is_service_template) {
							var option;
							if(id === templateObj.id) {
								option = new Option(templateObj.name, templateObj.id, true, true);
							} else {
								option = new Option(templateObj.name, templateObj.id);
							}
							htmlOpts.push(jQuery(option));
						}
					});
					$select_group.find('optgroup:last').append(htmlOpts);//NO I18N
				});
			}
		}
		template_element.attr('template-type', type).select2({placeholder: translate('sdp.change.sla.select')});
		if(sdp_app.IS_SERVICECATALOG_ENABLED) {
			var e_parent;
			var e_incident;
			var e_service;
			if(from === 'customization') {
				e_parent = (user_type === 'technician') ? 'customization-technician-template-switch' : 'customization-user-template-switch';//NO I18N
				e_incident = (user_type === 'technician') ? 'customization-technician-incident-tab' : 'customization-user-incident-tab';//NO I18N
				e_service = (user_type === 'technician') ? 'customization-technician-service-tab' : 'customization-user-service-tab';//NO I18N
			} else if(from === 'personalization') {//NO I18N
				e_parent = 'personalization-technician-template-switch';//NO I18N
				e_incident = 'personalization-technician-incident-tab';//NO I18N
				e_service = 'personalization-technician-service-tab';//NO I18N
			}
			var listTabs = '<div class="sdtabs-ui2 mb10 template-tabs" id="' + e_parent + '"><ul class="nav nav-sdtabs req-template-type"><li class="' + (type === 'service' ? '' : 'active') + '"><a href="/" id="' + e_incident + '" title="' + translate('common.incident.template') + '" rel="uitip" mode_ellipsis="true">' + translate('common.incident.template') + '</a></li><li class="' + (type === 'service' ? 'active' : '') + '"><a href="/" id="' + e_service + '" title="' + translate('common.service.template') + '" rel="uitip" mode_ellipsis="true">' + translate('common.service.template') + '</a></li></ul></div>';
			template_element.on('select2-opening', function() {
				var dropdown = template_element.select2('dropdown');//NO I18N
				if(from === 'customization') {
					(user_type === 'technician') ? jQuery('#customization-technician-template-switch').remove() : jQuery('#customization-user-template-switch').remove();//NO I18N
				} else if(from === 'personalization') {//NO I18N
					jQuery('#personalization-technician-template-switch').remove()
				}
				dropdown.prepend(listTabs);
				if(from === 'customization') {
					if(type === 'service') {
						jQuery('#customization-technician-incident-tab, #customization-user-incident-tab').off('click').on('click', function() {//NO I18N
							landing.switchTemplateTab(from, user_type, 'incident', '');//NO I18N
							return false;
						});
					} else if(type === 'incident') {//NO I18N
						jQuery('#customization-technician-service-tab, #customization-user-service-tab').off('click').on('click', function() {//NO I18N
							landing.switchTemplateTab(from, user_type, 'service', '');//NO I18N
							return false;
						});
					}
				} else if(from === 'personalization') {//NO I18N
					if(type === 'service') {
						jQuery('#personalization-technician-incident-tab').off('click').on('click', function() {//NO I18N
							landing.switchTemplateTab(from, user_type, 'incident', '');//NO I18N
							return false;
						});
					} else if(type === 'incident') {//NO I18N
						jQuery('#personalization-technician-service-tab').off('click').on('click', function() {//NO I18N
							landing.switchTemplateTab(from, user_type, 'service', '');//NO I18N
							return false;
						});
					}
				}
			});
		}
	},
	landing.switchTemplateTab = function(from, user_type, type, preventOpening) {
		var container = (from === 'customization') ? jQuery('#landing_tab') : jQuery('#landing-page-personalization');//NO I18N
		var template_element;
		if(from === 'customization') {
			template_element = (user_type === 'technician') ? container.find('#customization-technician-template-list') : container.find('#customization-user-template-list');//NO I18N
		} else if(from === 'personalization') {//NO I18N
			template_element = container.find('#personalization-technician-template-list');//NO I18N
		}
		template_element.find('option,optgroup').remove().end();
		template_element.select2('data', null);//NO I18N
		var templateList = template_element.data('select2');//NO I18N
		if(type === 'service') {
			templateList.close();
			templateList.container && templateList.container.hide();
			landing.initTemplateList(from, user_type, 'service');//NO I18N
			!preventOpening && template_element.select2('open');//NO I18N
		} else if(type === 'incident') {//NO I18N
			templateList.close();
			templateList.container && templateList.container.hide();
			landing.initTemplateList(from, user_type, 'incident');//NO I18N
			!preventOpening && template_element.select2('open');//NO I18N
		}
	},
	landing.constructLandingPageData = async function(from, user_type) {
		var container = (from === 'customization') ? jQuery('#landing_tab') : jQuery('#landing-page-personalization');//NO I18N
		var is_request_module_enabled = true;
		var data = {};
		var landing_type;
		if(from === 'customization') {
			landing_type = (user_type === 'technician') ? container.find('input[name="customization-technician-landing-type"]:checked').val() : container.find('input[name="customization-user-landing-type"]:checked').val();//NO I18N
		} else if(from === 'personalization') {//NO I18N
			var is_request_module_enabled = await landing.isRequestModuleEnabled();
			if(is_request_module_enabled) {
				landing_type = container.find('input[name="personalization-technician-landing-type"]:checked').val();//NO I18N
			} else {
				landing_type = 'tab';//NO I18N
			}
		}
		data.landing_type = landing_type;
		if(data.landing_type === 'tab') {
			var module;
			var sub_module;
			if(from === 'customization') {
				module = (user_type === 'technician') ? container.find('#customization-technician-module-tabs').val() : container.find('#customization-user-module-tabs').val();//NO I18N
				if(user_type === 'technician' && module === 'home') {
					sub_module = container.find('#customization-technician-sub-module-tabs').val();
				}
			} else if(from === 'personalization') {//NO I18N
				module = container.find('#personalization-technician-module-tabs').val();//NO I18N
				if(module === 'home') {
					sub_module = container.find('#personalization-technician-sub-module-tabs').val();
				}
			}
			data.module = module;
			if(sub_module !== undefined) {
				data.sub_module = sub_module
			}
			if(is_request_module_enabled) {
				data.template = await landing.getDefaultTemplateObj();
			}
		} else if(data.landing_type === 'template') {//NO I18N
			var template_element;
			if(from === 'customization') {
				template_element = (user_type === 'technician') ? container.find('#customization-technician-template-list') : container.find('#customization-user-template-list');//NO I18N
			} else if(from === 'personalization') {//NO I18N
				template_element = container.find('#personalization-technician-template-list');//NO I18N
			}
			var templateObj = {};
			templateObj.type = template_element.attr('template-type');
			templateObj.id = parseInt(template_element.select2('data').id);
			templateObj.name = template_element.select2('data').text;
			data.template = templateObj;
			data.module = 'home';//NO I18N
			if(user_type === 'technician') {
				data.sub_module = 'my_view';//NO I18N
			}
		}
		if(from === 'customization' && user_type === 'technician') {
			data.is_allowed_to_customize = container.find('#tech-allow-customize').is(':checked');//NO I18N
		}
		return data;
	},
	landing.save = async function(from) {
		try {
			if(sdp_app.IS_DEMO_BUILD && sdp_user.LOGINNAME != "administrator") {
				disableForDemo();
				return;
			}
			if(sdpheader_data.esm_details.current_portal.canAllowedDBOperation == false) {
				showalert('failure', translate("mdh.restricted.portals.cud.msg"), 'isAutoHide = false');//NO I18N
				return;
			}
			var formObj;
			if(from === 'customization') {
				formObj = jQuery('#landing-customization-form');
			} else if(from === 'personalization') {//NO I18N
				formObj = jQuery('#landing-personalization-form');
			}
			if(formObj.valid()) {
				var techObj = await landing.constructLandingPageData(from, 'technician');//NO I18N
				if(from === 'customization') {
					jQuery('#customization-landing-page-loading-freeze').removeClass('hide');
					var data = {};
					data.technician = techObj;
					data.user = await landing.constructLandingPageData(from, 'user');//NO I18N
					var obj = {
						key: 'landing_page',//NO I18N
						data: data,
						success: function() {
							showalert('success', translate('api.saved.success', [translate('instance.landing.page.title')]), 'isAutoHide=true');//NO I18N
						}
					};
					setGlobalPersonalization(obj);
					setTimeout(function() {window.location.reload(true);}, 1000);
				} else if(from === 'personalization') {//NO I18N
					jQuery('#personalization-landing-page-loading-freeze').removeClass('hide');
					addPersonalization('landingpage', techObj, true, {'is_portal_specific': true});//NO I18N
					showalert('success', translate('api.saved.success', [translate('instance.landing.page.title')]), 'isAutoHide=true');//NO I18N
				}
			}
		} finally {
			if(from === 'customization') {
				jQuery('#customization-landing-page-loading-freeze').addClass('hide');
			} else if(from === 'personalization') {//NO I18N
				jQuery('#personalization-landing-page-loading-freeze').addClass('hide');
			}
		}
	},
	landing.openSlider = function(event, e) {
		event.stopImmediatePropagation();
		var $land_page_personalization = jQuery('#landing-page-personalization');//NO I18N
		if(jQuery(e).hasClass('active')) {
			$land_page_personalization.dialog('close');//NO I18N
			return;
		}
		jQuery(e).addClass('active');
		var target = jQuery('#profile-slider');
		var $close_profile_slider = jQuery('#close-profile-slider');//NO I18N
		$land_page_personalization.show().panelSlider({
			width: 650,
			header: false,
			placement: sdp_user.DIRECTION === 'RTL' ? 'left' : 'right',//NO I18N
			position: {
				my: sdp_user.DIRECTION === 'RTL' ? 'left' : 'right',//NO I18N
				at: sdp_user.DIRECTION === 'RTL' ? 'right' : 'left',//NO I18N
				of: target
			},
			dialogClass: 'tabui-rightpanel',//NO I18N
			modal: false,
			open: function() {
				landing.render('personalization');//NO I18N
				$close_profile_slider.hide();
				setTimeout(function() {
					var $templateType = jQuery('#personalization-technician-template-type');//NO I18N
					if($templateType.is(':checked')) {
						$templateType.focus();
					}
				}, 80);
			},
			close: function() {
				$land_page_personalization.html('');
				$close_profile_slider.show();
				jQuery(e).removeClass('active');
				jQuery(e).blur();
			}
		});
	},
	landing.closeSlider = function(e) {
		setTimeout(function() {
			jQuery(e).closest('.ui-dialog').find('.ui-widget-content').dialog('close');//NO I18N
		}, 80);
	},
	landing.processHistory = function(history) {
		$history.processHistory(history);
		for(var h = 0, hlen = history.length; h < hlen; h++) {
			var diff = history[h].diff;
			if(diff) {
				for(var d = 0; d < diff.length; d++) {
					if(diff[d].hasOwnProperty('previous_value') && diff[d].current_value) {
						if(!diff[d].field || diff[d].field.name !== 'data') {
							diff.splice(d, 1);
							d--;
							continue;
						}
						var prev_val = diff[d].previous_value && JSON.parse(diff[d].previous_value);
						var curr_val = JSON.parse(diff[d].current_value);
						if(prev_val==null) {
							prev_val = {};
						}
						var htmlCurrVal = '';
						var userObj = curr_val.user;
						if(userObj !== undefined && userObj.landing_type) {
							var type = userObj.landing_type;
							if(type === 'tab') {
								var tabs = manage_Tabs.data;
								jQuery.each(tabs, function (i, moduleObj) {
									if(moduleObj.id === userObj.module) {
										if(moduleObj.is_dynamic && moduleObj.is_dynamic === true) {
											value = e_html(moduleObj.i18n_key);
										} else {
											value = translate(moduleObj.i18n_key);
										}
									}
								});
							} else {
								value = e_html(userObj.template.name);
							}
							htmlCurrVal = htmlCurrVal + '<p>' + translate('sdp.admin.leftpanel.users') + '&nbsp:&nbsp<strong>' + value + '</strong>&nbsp' + type + '</p>';
						}
						var techObj = curr_val.technician;
						if(techObj !== undefined && techObj.landing_type) {
							var type = techObj.landing_type;
							if(type === 'tab') {
								var tabs = manage_Tabs.data;
								jQuery.each(tabs, function (i, moduleObj) {
									if(moduleObj.id === techObj.module) {
										if(moduleObj.is_dynamic && moduleObj.is_dynamic === true) {
											value = e_html(moduleObj.i18n_key);
										} else {
											value = translate(moduleObj.i18n_key);
										}
									}
								});
							} else {
								value = e_html(techObj.template.name);
							}
							value = '<strong>' + value + '</strong>';
							if(type === 'tab' && techObj.module === 'home' && techObj.sub_module) {
								value += '&nbsp' + translate('sdp.admin.common.and') + '&nbsp<strong>' + sub_modules[techObj.sub_module] + '</strong>';//NO I18N
							}
							htmlCurrVal = htmlCurrVal + '<p>' + translate('sdp.admin.leftpanel.users.technician') + '&nbsp:&nbsp' + value + '&nbsp' + type + '</p>';
							value = (techObj.is_allowed_to_customize == false ) ? translate('common.disabled') : translate('common.enabled');
							htmlCurrVal = htmlCurrVal + '<p>' + translate('instance.landing.page.customize.for.technician.title.prefix') + '&nbsp:&nbsp<strong>' + value + '</strong></p>';
						}
						if(htmlCurrVal == '') {
							htmlCurrVal = translate('sdp.inventory.audit.nochanges');
						}
						diff[d].current_value = htmlCurrVal;
					}
				}
			}
		}
	},
	landing.initFormValidation = function(from) {
		if(from === 'customization') {
			var rules = {
				'customization-user-template-list': {//NO I18N
					required: true
				},
				'customization-technician-template-list': {//NO I18N
					required: true
				}
			};
			var messages = {
				'customization-user-template-list': {//NO I18N
					required: translate('sdp.common.emptymessage', [translate('common.request.templates')])
				},
				'customization-technician-template-list': {//NO I18N
					required: translate('sdp.common.emptymessage', [translate('common.request.templates')])
				},
			};
			initFormValidator('landing-customization-form', rules, messages);//NO I18N
		} else if(from === 'personalization') {//NO I18N
			var rules = {
				'personalization-technician-template-list': {//NO I18N
					required: true
				}
			};
			var messages = {
				'personalization-technician-template-list': {//NO I18N
					required: translate('sdp.common.emptymessage', [translate('common.request.templates')])
				},
			};
			initFormValidator('landing-personalization-form', rules, messages);//NO I18N
		}
	},
	landing.loadTemplates = function(type) {
		st_count = (st_count == '') ? 1 : st_count;
		var inputData = {};
		var url;
		if(type === 'incident') {
			url = '/api/v3/request_templates';//NO I18N
			inputData.list_info = {'row_count':'100','start_index':st_count,'get_total_count':true,'search_fields':{'status':'active','is_service_category_required':false,'for':'lifecycle','is_service_template':false}};//NO I18N
		} else if(type === 'service') {//NO I18N
			url = '/api/v3/service_categories';//NO I18N
			inputData.list_info = {'row_count':'100','start_index':st_count,'filter_by':{'name':'has_active_service_templates'},'fields_required':['name','id','description','icon_name','sort_index','templates'],'get_total_count':true};//NO I18N
		}
		sdpAjax({
			type: 'GET',//NO I18N
			url: url,
			data: sdpAjaxInputData(inputData),
			async: false,
			success: function(resp) {
				if(type === 'incident') {
					if(resp.request_templates) {
						incident_templates = resp.request_templates;
						return;
					}
				} else if(type === 'service') {//NO I18N
					if(resp.service_categories) {
						service_templates = resp.service_categories;
						return;
					}
				}
			}
		});
	}
	return landing;
}());
