//$Id$
var integKey = (function() {
	var integKeyObj = {};
	var table_integkey = {};
	integKeyObj.initIntegKeyListViewOnLoadEvents = function() {
		jQuery('#add-new-integ-key').on('click', function() {
			integKey.initPopUp(translate('sdp.admin.generate.integration.key.title'), 'action=add_key', '600px');//NO I18N
		});
		jQuery('a[name=integ-key-filter]').on('click', function() {
			var filterType = jQuery(this).attr('data-val');
			var filterTypeText = jQuery(this).text();
			if(jQuery('#filter-view-menu').attr('data-val').trim() == filterType) {
				return;
			}
			var type = filterType.toLowerCase();
			var tableInfo = table_integkey.t_obj.table_info;
			if(type === 'active' || type === 'inactive') {
				tableInfo.list_info.search_criteria = {'field': 'status', 'value': type, 'condition': 'is', 'logical_operator': 'AND', 'children': [{'field': 'validity', 'value': 0, 'condition': 'GT', 'logical_operator': 'AND'}, {'field': 'validity', 'value': new Date().getTime(), 'condition': 'GT', 'logical_operator': 'AND'}, {'field': 'validity', 'value': 0, 'condition': 'EQ', 'logical_operator': 'OR'}]};//NO I18N
			} else if(type === 'expired') {//NO I18N
				tableInfo.list_info.search_criteria = {'field': 'validity', 'value': 0, 'condition': 'GT', 'logical_operator': 'AND', 'children': [{'field': 'validity', 'value': new Date().getTime(), 'condition': 'LT', 'logical_operator': 'AND'}]};//NO I18N
			} else if(type === 'all') {//NO I18N
				delete tableInfo.list_info.search_criteria;
			} else if(type === 'deleted') {//NO I18N
				tableInfo.list_info.search_criteria = {'field': 'status', 'value': type, 'condition': 'is', 'logical_operator': 'AND'};//NO I18N
			}
			table_integkey.refreshTable('refresh');//NO I18N
			var filterName = jQuery('#filter-view-menu').html().trim();
			jQuery('#filter-view-menu').html(filterName.substring(0, filterName.lastIndexOf('>')+1) + filterTypeText);
			jQuery('#filter-view-menu').attr('data-val', filterType);
		});
		jQuery('#reassign-integ-key').on('click', function(){
			integKey.initPopUp(translate('sdp.admin.reassign.integration.key.title'), 'action=reassign_key', '400px');//NO I18N
		});

		integKey.initIntegKeyListView();

	},
	integKeyObj.initIntegKeyListView = function() {
		var tableInfo = table_comp.getTableInfo('integration_key');//NO I18N
		var _self = this;
		var tableContent = {};
		tableContent.header = this.integKeyHeaderDataConstruct();
		var options = {};
		options.paginationEnabled   = true;
		options.searchEnabled       = true;
		options.sortingEnabled      = true;
		options.multiDeleteEnabled  = true;
		options.personalize_key     = 'integration_key';//NO I18N
		options.row_inputdata       = _self.integKeyRowDataConstruct(tableInfo);
		options.callbackURL         = 'integration_keys';//NO I18N
		options.entity_name         = 'integration_keys';//NO I18N
		options.csrf_needed         = true;
		options.isODAPI             = true;
		options.bulkSelectionSetting= true;
		options.staticHeader= true;
		options.height_settings = {"isAdmin": true, reduceHeight: 55};  //NO I18N
		options.width_settings = {"isAdmin": true, reduceWidth: 40};    //NO I18N
		table_integkey = new tableComponent(tableInfo,tableContent,options);
	},
	integKeyObj.getTableObj = function() {
		return table_integkey;
	},
	integKeyObj.integKeyHeaderDataConstruct = function() {
		var _self = this;
		var header = {
			'integration_keys_head_chk': {//NO I18N
				type: 'checkbox',//NO I18N
				'default': true,//NO I18N
				'dataCelltransformer': this.integKeyConstructCheckBoxCell//NO I18N
			},
			'integration_keys_head_menu': {//NO I18N
				'type': 'icon',//NO I18N
				'default': true,//NO I18N
				'dataCelltransformer': this.integKeyConstructMenuCell, //NO I18N
				'td_class': 'pos-rel' //No I18N
			},
			'name': {//NO I18N
				'text': getMessageForKey('sdp.common.name'),//NO I18N
				'dataCelltransformer': this.integKeyConstructIntegKeyName//NO I18N
			},
			'key': {//NO I18N
				'text': getMessageForKey('sdp.common.key'),//NO I18N
				'disableSearching': true,//NO I18N
				'disableSorting': true,//NO I18N
				'dataCelltransformer': this.integKeyConstructTechKey//NO I18N
			},
			'owned_by': {//NO I18N
				'text': getMessageForKey('ae.cmdb.datacentr.ownedBy'),//NO I18N
				'type': 'lookup',//NO I18N
				'lookup_field': 'name'//NO I18N
			},
			'validity': {//NO I18N
				'text': getMessageForKey('common.validity'),//NO I18N
				'disableSearching': true,//NO I18N
				'dataCelltransformer': this.integKeyConstructValidityCell//NO I18N
			},
			'status': {//NO I18N
				'text': getMessageForKey('common.status'),//NO I18N
				'dataCelltransformer': this.integKeyConstructStatusCell//NO I18N
			},
			'created_time': {//NO I18N
				'text': getMessageForKey('sdp.change.createdtime'),//NO I18N
				'disableSearching': true,//NO I18N
				'dataCelltransformer': this.integKeyConstructCreatedTimeCell//NO I18N
			},
			'description': {//NO I18N
				'text': getMessageForKey('sdp.common.description'),//NO I18N
				'disableSearching': true,//NO I18N
      	'disableSorting': true//NO I18N
			}
		}
		return header;
	},
	integKeyObj.integKeyRowDataConstruct = function(tableInfo) {
		var inputObject = {};
		var list_info = tableInfo.list_info;
		inputObject.list_info = list_info;
		return inputObject;
	},
	integKeyObj.integKeyConstructCheckBoxCell = function(tableData) {
		var rData = tableData.row_data;
		if(rData.owned_by && sdp_user.LOGGEDIN_USERID == rData.owned_by.id && rData.status !== 'deleted') {
			return '<input type=\'checkbox\' value=\''+ rData.id + '\' data-table-checkbox>';
		}
	},
	integKeyObj.integKeyConstructMenuCell = function(tableData) {
		var rData = tableData.row_data;
		if(rData.owned_by && sdp_user.LOGGEDIN_USERID == rData.owned_by.id && rData.status !== 'deleted') {
		return '<span class=\'btn-group bs-noconflict pos-abs\'>' +
            '<button title=\'' + translate('sdp.common.actions') + '\' data-switch=\'sdmenu\' class=\'pr5 pl5 glyph-buttonbg\'>' + //NO I18N
            '<span class=\'cspr menulist icon-xs sdmenu-toggle vtop pos-rel mt1\'></span></button>' +
            '<ul class=\'sdmenu-dd showmenu p0\' style=\'z-index:1;\'>' +
            '<li><a href=\'/\' sdphrefJs=\'js-href-integrationkey-1\' editIntegKeyConfig=\'' + rData.id + '\'>' + translate('sdp.common.edit') + '</a></li>' +
            '<li><a href=\'/\' sdphrefJs=\'js-href-integrationkey-2\' reassignIntegKeyConfig=\'' + rData.id + '\'>' + translate('sdp.common.reassign') + '</a></li>' +
            '<hr class=\'m3\'>' +
            '<li><a href=\'/\' sdphrefJs=\'js-href-integrationkey-3\' deleteIntegKeyConfig=\'' + rData.id + '\'>' + translate('sdp.common.delete') + '</a></li>' +
            '</ul>' +
        '</span>';
		}
	},
	integKeyObj.integKeyConstructValidityCell = function(tableData) {
		var rData = tableData.row_data;
		if(rData.validity && rData.validity.value && rData.validity.value > 0 && rData.validity.display_value) {
			return rData.validity.display_value;
		} else {
			return '-';
		}
	},
	integKeyObj.integKeyConstructCreatedTimeCell = function(tableData) {
		var rData = tableData.row_data;
		if(rData.created_time && rData.created_time.display_value) {
			return rData.created_time.display_value;
		}
	},
	integKeyObj.integKeyConstructIntegKeyName = function(tableData) {
		var rData = tableData.row_data;
		if(rData.name && rData.owned_by && sdp_user.LOGGEDIN_USERID == rData.owned_by.id && rData.status !== 'deleted') {
			if(rData.name.length > 24) {
				return '<a href=\'/\' sdphrefJs=\'js-href-integrationkey-4\' rel=\'uitip noopener\' title=\'' + encodeHTMLAttribute(rData.name) + '\' editIntegKeyConfig=\'' + encodeHTMLAttribute(rData.id) + '\'>' + encodeHTML(rData.name.substring(0, 24)) + '...</a>';
			} else {
				return '<a href=\'/\' sdphrefJs="js-href-integrationkey-5" rel=\'uitip noopener\' editIntegKeyConfig=\'' + encodeHTMLAttribute(rData.id) + '\'>' + encodeHTML(rData.name) + '</a>';
			}
		} else {
			return encodeHTML(rData.name);
		}
	},
	integKeyObj.integKeyConstructTechKey = function(tableData) {
		var rData = tableData.row_data;
		if(rData.status === 'deleted') {
			return '*********';
		} else if(rData.key) {
			return '<a href=\'/\' sdphrefJs="js-href-integrationkey-6" rel=\'uitip\' title=\'' + translate('sdp.admin.view.integration.key.title') + '\' viewIntegKey=\''+ rData.id + '\'>' + '*********' + '</a>';
		}
	},
	integKeyObj.integKeyConstructStatusCell = function(tableData) {
		var rData = tableData.row_data;
		if(rData.status === 'deleted') { //NO I18N
			return '<span class=\'sb text-danger\'>' + translate('sdp.settings.user.restriction.deleted.fields') + '</a>';
		} else if(rData.validity && rData.validity.value > 0 && rData.validity.value < new Date().getTime()) {
			return '<span class=\'sb text-danger\'>' + translate('sdp.asset.loan.status.expired') + '</a>';
		} else if(rData.status == 'active') { //NO I18N
			return '<span class=\'sb text-success\'>' + translate('sdp.contract.listViewI.active') + '</a>';
		} else if(rData.status == 'inactive') { //NO I18N
			return '<span class=\'sb text-danger\'>' + translate('sdp.project.projectstatusattribute.isdeleted') + '</a>';
		}
	},
	integKeyObj.onClickRadioText = function() {
		jQuery('#expiry-on').prop('checked', true);//NO I18N
		showCalendar('expiry-time-val-display', false, '%Y-%m-%d');//NO I18N
	},
	integKeyObj.initIntegKeyRoles = function(selectedObj) {
		if(selectedObj == null) {
			selectedObj = [];
		}
		var inputOptions = {
			data: selectedObj,
			select2Id: 'integ-key-roles',//NO I18N
			allowClear: false,
			placeholder: '-- ' + translate('common.select.roles') + ' --',
			callbackURL: '/technicians/associated_roles',//NO I18N
			multiple: true,
			entity_name: 'associated_roles',//NO I18N
			results: function(data) {
				var discardRoles = ['DCAdmin', 'DCGuest', 'MDMPAdmin', 'MDMPGuest', 'ViewRequestsNotInAnySite', 'Resources not in any site','ZiaVerifier'];//NO I18N
				var retdata = [];
				for (var i = 0; i < data.length; i++) {
					var disp_obj = data[i];
					if(!(~discardRoles.indexOf(trim(disp_obj.name)))) {
						disp_obj.text = disp_obj.name;
						retdata.push(disp_obj);
					}
				}
				return retdata;
			}
		};
		var rolesSelect2 = new Select2APIComponent(inputOptions);
	},
	integKeyObj.initReassignTechnicians = function() {
		var inputOptions = {
			select2Id: 'reassign-technician',//NO I18N
			placeholder: '-- ' + translate('sdp.requests.common.select.technician') + ' --',//NO I18N
			callbackURL: '/technicians',//NO I18N
			entity_name: 'technicians',//NO I18N
			listinfoCallback: this.customListInfoForReassignTech,
			results: function(data) {
				var rData = [];
				for(var i = 0; i < data.length; i++) {
					if(data[i].id != sdp_user.LOGGEDIN_USERID) {
						rData.push({'id': data[i].id, 'name': data[i].name, 'text': data[i].name});//NO I18N
					}
				}
				return rData;
			}
		};
		var ReassignTechniciansSelect2 = new Select2APIComponent(inputOptions);
	},
	integKeyObj.customListInfoForReassignTech = function(listInfo, searchText) {
		var listInfo = listInfo ? listInfo : {};
		listInfo.sort_order = 'asc';//NO I18N
		listInfo.sort_field = 'name';//NO I18N
		var search_criteria = {'field': 'associated_roles.name', 'value': 'SDAdmin', 'condition': 'contains', 'logical_operator': 'AND'};//NO I18N
		if(searchText) {
			var search_criteria_child = [];
			search_criteria_child.push({'field': 'name', 'value': searchText, 'condition': 'like', 'logical_operator': 'AND'});//NO I18N
			search_criteria.children = search_criteria_child;
		}
		listInfo.search_criteria = search_criteria;
		return listInfo;
	},
	integKeyObj.generateIntegKeyConfig = function() {
		jQuery('#integKeyView').addClass('hide');
		if(this.validateIntegKeyConfig()) {
			var inputObject = this.constructIntegKeyConfigObj();
			sdpAjax({
				type: 'POST',//NO I18N
				url: '/api/v3/integration_keys',//NO I18N
				async: false,
				data: sdpAjaxInputData(inputObject),
				dataType: 'json',//NO I18N
				success: function(resp) {
					if(resp.response_status.status === 'success') {
						table_integkey.refreshTable();
						if(resp.integration_key && resp.integration_key.key) {
							jQuery('#integ-key-form-fields').remove();
							jQuery('#integ-key-view-section').removeClass('hide');
							jQuery('#integ-key-value').val(resp.integration_key.key);
							jQuery('#integ-key-value-disp').attr('int-key', resp.integration_key.key);
							jQuery('#generate-btn').parent('.form-footer').remove();//NO I18N
						}
					}
				},
				error: function(resp) {
					if(resp.responseJSON.response_status.messages[0].status_code === 4008 && resp.responseJSON.response_status.messages[0].field === 'name') {
						showalert('failure', translate('sdp.admin.integration.key.name.already.exists.msg'), 'isAutoHide=true');//NO I18N
					}
				}
			});
		}
	},
	integKeyObj.editIntegKeyConfig = function(integKeyID) {
		var isExpired = false;
		var integraionName = '';
		if(table_integkey.loadedRecords) {
			var records = table_integkey.loadedRecords;
			for(var id in  records) {
				if(integKeyID == id) {
					integrationName = records[id].name;
					if(records[id].validity && records[id].validity.value > 0 && records[id].validity.value < new Date().getTime()) {
						isExpired = true;
					}
					break;
				}
			}
		}
		var param = 'action=edit_key&id=' + integKeyID;//NO I18N
		if(isExpired) {
			param += '&status=expired';//NO I18N
		}
		integKey.initPopUp(integrationName + ' - ' + translate('sdp.admin.update.integration.key.title'), param, '600px');//NO I18N
	},
	integKeyObj.deleteIntegKeyConfig = function(integKeyID) {
		var integraionName = '';
		if(table_integkey.loadedRecords) {
			var records = table_integkey.loadedRecords;
			for(var id in  records) {
				if(integKeyID == id) {
					if(records[id].owned_by.id != sdp_user.LOGGEDIN_USERID) {
						showalert('failure', translate('api.validation.unauthorised'), 'isAutoHide=true');//NO I18N
						return;
					}
					break;
				}
			}
		}
		if(confirm(translate('common.delete.confirm'))) {
			sdpAjax({
				type: 'DELETE',//NO I18N
				url: '/api/v3/integration_keys/' + integKeyID,//NO I18N
				async: false,
				dataType: 'json',//NO I18N
				success: function(resp) {
					if(resp.response_status.status === 'success') {
						showalert('success', translate('common.delete.success'), 'isAutoHide=true');//NO I18N
						table_integkey.refreshTable();
					}
				}
			});
		}
	},
	integKeyObj.reassignIntegKeyConfig = function(integKeyID) {
		integKey.initPopUp(translate('sdp.admin.reassign.integration.key.title'), 'action=reassign_key&id=' + integKeyID, '400px');//NO I18N
	},
	integKeyObj.viewIntegKey = function(integKeyID) {
		var integraionName = '';
		var isExpired = false;
		if(table_integkey.loadedRecords) {
			var records = table_integkey.loadedRecords;
			for(var id in  records) {
				if(integKeyID == id) {
					integrationName = records[id].name;
					if(records[id].validity && records[id].validity.value > 0 && records[id].validity.value < new Date().getTime()) {
						isExpired = true;
						break;
					}
				}
			}
		}
		var param = 'action=view_key&id=' + integKeyID;//NO I18N
		if(isExpired) {
			param += '&status=expired';//NO I18N
		}
		integKey.initPopUp(integrationName + ' - ' + translate('sdp.admin.view.integration.key.title'), param, '610px');//NO I18N
	},
	integKeyObj.populateIntegKeyConfig = function(integKeyID) {
		sdpAjax({
			type: 'GET',//NO I18N
			url: '/api/v3/integration_keys/' + integKeyID,//NO I18N
			async: false,
			dataType: 'json',//NO I18N
			success: function(resp) {
				if(resp.response_status.status === 'success') {
					var integObj = resp.integration_key;
					jQuery('#integ-key-name').val(integObj.name);
					var rolesObj = [];
					for(i = 0; i < integObj.roles.length; i++) {
						var roleObj = integObj.roles[i];
						roleObj.text = roleObj.name;
						rolesObj.push(roleObj);
					}
					integKey.initIntegKeyRoles(rolesObj);
					var isExpired = false;
					if(integObj.validity) {
						var validity = parseInt(integObj.validity.value);
						if(validity > 0) {
							jQuery('#expiry-on').prop('checked', true);//NO I18N
							validity = new Date(validity);
							jQuery('#expiry-time-val-display').val(validity.getFullYear() + '-' + ( validity.getMonth() > 9 ? (validity.getMonth() + 1) : '0' + (validity.getMonth() + 1)) + '-' + ( validity.getDate() > 9 ? validity.getDate() : '0' + validity.getDate()));
							if(validity > 0 && validity < new Date().getTime()) {
								isExpired = true;
							}
						}
					} else {
						jQuery('#never').prop('checked', true);//NO I18N
					}
					if(isExpired) {
						jQuery('#integ-key-status').prop('checked', false);//NO I18N
						jQuery('#integ-key-status-text').text(translate('sdp.asset.loan.status.expired')).removeClass('text-success').addClass('text-danger');
					} else {
						var status = integObj.status;
						if(status == 'inactive') {
							jQuery('#integ-key-status').prop('checked', false);//NO I18N
							jQuery('#integ-key-status-text').text(translate('sdp.project.projectstatusattribute.isdeleted')).removeClass('text-success').addClass('text-danger');
						}
					}
					if(integObj.description && integObj.description != null) {
						var description = integObj.description;
						jQuery('#integ-key-description').val(description);
						if(description.length < 250) {
							jQuery('#integ-key-description').next('span').children('strong').html(250-description.length);//NO I18N
						} else {
							jQuery('#integ-key-description').next('span').children('strong').html(250-description.length).addClass('text-danger');//NO I18N
						}
					}
				}
			}
		});
	},
	integKeyObj.updateIntegKeyConfig = function(integKeyID) {
		if(this.validateIntegKeyConfig()) {
			var inputObject = this.constructIntegKeyConfigObj();
			sdpAjax({
				type: 'PUT',//NO I18N
				url: '/api/v3/integration_keys/' + integKeyID,//NO I18N
				async: false,
				data: sdpAjaxInputData(inputObject),
				dataType: 'json',//NO I18N
				success: function(resp) {
					if(resp.response_status.status === 'success') {
						table_integkey.refreshTable();
						jQuery('#cancel-btn').trigger('click');
						showalert('success', translate('api.updated.success', [translate('sdp.admin.integration.name.key')]), 'isAutoHide=true');//NO I18N
					}
				}
			});
		}
	},
	integKeyObj.getDecryptedTechKey = function(integKeyID) {
		sdpAjax({
			type: 'POST',//NO I18N
			url: 'api/v3/integration_keys/' + integKeyID + '/decrypt',//NO I18N
			async: false,
			dataType: 'json',//NO I18N
			success: function(resp) {
				if(resp.response_status.status === 'success') {
					if(resp.decrypt && resp.decrypt.key) {
						jQuery('#integ-key-form-fields').remove();
						jQuery('#integ-key-view-section').removeClass('hide');
						jQuery('#integ-key-value').val(resp.decrypt.key);
						jQuery('#integ-key-value-disp').attr('int-key', resp.decrypt.key);
						jQuery('#view-btn').parent('.form-footer').remove();//NO I18N
					}
				}
			},
			error: function(resp) {
				var msgObj = resp.responseJSON.response_status.messages[0];
				if(msgObj.field == 'login_password' && msgObj.status_code == 4001) {
					showalert('failure', translate('sslimport.error.pfx.certificate.failed'), 'isAutoHide=true');//NO I18N
				} else {
					showalert('failure', msgObj.message, 'isAutoHide=true');//NO I18N
				}
			}
		});
		jQuery('#login-password').val('');
	},
	integKeyObj.changeOwnershipToIntegKey = function(integKeyID) {
		var ownedBy = jQuery('#reassign-technician').select2('val');//NO I18N
		var comments = jQuery('#reassign-comments').val();
		if(ownedBy == null || ownedBy == '' || ownedBy == undefined) {
			this.showValidationErrorMsg(jQuery('#reassign-technician'), translate('sdp.admin.integration.key.reassign.technician.empty.error.msg'));
			return;
		} else if(comments.length > 250) {
			this.showValidationErrorMsg(jQuery('#reassign-comments'), translate('common.comments.maxlength'));
			return;
		}
		showconfirm(true, 'title=' + translate("sdp.admin.confirm.reassign.integration.key.title") + ', message=' + translate("sdp.admin.confirm.reassign.integration.key.msg", [encodeHTML(jQuery('#reassign-technician').select2('data').text)]) + ', submitbutton=' + translate('common.yes') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed){//NO I18N
			if(proceed) {
				var selectedObj = null;
				if(integKeyID == null) {
					selectedObj = table_integkey.bulkSelect.getSelectedIDs();
				} else {
					selectedObj = integKeyID;
				}
				var inputObject = {'owned_by': {'id': ownedBy}, 'comments': comments};//NO I18N
				sdpAjax({
					type: 'PUT',//NO I18N
					url: 'api/v3/integration_keys/reassign?ids=' + selectedObj,//NO I18N
					async: false,
					data: sdpAjaxInputData(inputObject),
					dataType: 'json',//NO I18N
					success: function(resp) {
						if(resp.response_status.status === 'success') {
							table_integkey.refreshTable();
							jQuery('#cancel-btn').trigger('click');
							showalert('success', translate('api.updated.success', [translate('sdp.admin.integration.name.key')]), 'isAutoHide=true');//NO I18N
						}
					}
				});
			}
		});
	},
	integKeyObj.validateIntegKeyConfig = function() {
		var isUpdateOperation = false;
		if(jQuery('#update-btn').length > 0) {
			isUpdateOperation = true;
		}
		var isError = false;
		var name = jQuery('#integ-key-name').val();
		if(name == undefined || name == '') {
			this.showValidationErrorMsg(jQuery('#integ-key-name'), translate('sdp.admin.integration.key.name.empty.error.msg'));
			isError = true;
		} else if(name.length > 50) {
			this.showValidationErrorMsg(jQuery('#integ-key-name'), translate('sdp.admin.integration.key.name.length.error.msg'));
			isError = true;
		} else {
			if(!isUpdateOperation && table_integkey.loadedRecords) {
				var records = table_integkey.loadedRecords;
				for(var id in  records) {
					if(name === records[id].name) {
						this.showValidationErrorMsg(jQuery('#integ-key-name'), translate('sdp.admin.integration.key.name.already.exists.msg'));
						isError = true;
						break;
					}
				}
			}
		}
		var roles = jQuery('#integ-key-roles').select2('data');//NO I18N
		if(roles.length == 0) {
			this.showValidationErrorMsg(jQuery('#integ-key-roles'), translate('sdp.admin.integration.key.roles.empty.error.msg'));
			isError = true;
		} else {
			var restrictedRoles = [];
			var isSDAdmin = false;
			var isSDSiteAdmin = false;
			for(i = 0; i < roles.length; i++) {
				if(roles[i].name === 'SDAdmin') {
					isSDAdmin = true;
				} else if(roles[i].name === 'SDSiteAdmin') {
					isSDSiteAdmin = true;
				} else if(roles[i].name === 'SDReport' || roles[i].name === 'AERemoteControl') {
					restrictedRoles.push(roles[i].id);
				}
			}
			if(isSDAdmin && isSDSiteAdmin) {
				this.showValidationErrorMsg(jQuery('#integ-key-roles'), translate('sdp.admin.integration.key.roles.multiple.admin.role.error.msg'));
				isError = true;
			} else if(restrictedRoles.length == roles.length) {
				this.showValidationErrorMsg(jQuery('#integ-key-roles'), translate('sdp.api.technician.roles.module.depedent'));
				isError = true;
			}
		}
		if(jQuery('#expiry-on').is(':checked')) {
			var expiryOn = jQuery('#expiry-time-val-display').val();
			if(expiryOn == undefined || expiryOn == '') {
				this.showValidationErrorMsg(jQuery('#expiry-time-val-display'), translate('sdp.contract.import.toEmpty'));
				isError = true;
			}
			expiryOn = getLongDate(expiryOn, 23, 59);
			var currentTime = Date.parse(new Date());
			if(expiryOn < currentTime) {
				this.showValidationErrorMsg(jQuery('#expiry-time-val-display'), translate('sdp.solution.currentdate.expiry.date.mismatch'));
				isError = true;
			}
		}
		var description = jQuery('#integ-key-description').val().trim();
		if(description != '' && description.length > 250) {
			this.showValidationErrorMsg(jQuery('#integ-key-description'), translate('common.comments.maxlength'));
			isError = true;
		}
		if(isError) {
			return false;
		}
		return true;
	},
	integKeyObj.showValidationErrorMsg = function(element, errMsg) {
		var elementID = element.attr('id');
		var errElement = element;
		if(elementID == 'integ-key-name' || elementID == 'integ-key-roles' || elementID == 'login-password' || elementID == 'reassign-technician') {
			if(element.next('#error-element').length > 0) {
				return;
			}
		} else if(elementID == 'expiry-time-val-display') {//NO I18N
			errElement = element.parent();
			if(element.parent().parent().find('#error-element').length > 0) {
				return;
			}
		}
		var error = jQuery('<div></div>');
		error.insertAfter(errElement);//.text(errMsg);
		error.append(jQuery('<span></span>').text(errMsg)).attr('id', 'error-element');
		var eleHeight = errElement.height();
		if(element.parent().find('.select2-container').length > 0) {
			eleHeight = element.parent().find('.select2-container').height();
		}
		error.find('span').addClass('text-danger alert alert-danger p5 fr m0').css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + eleHeight + 10) + 'px' });//NO I18N
	},
	integKeyObj.constructIntegKeyConfigObj = function() {
		var validityObj = {};
		if(jQuery('#expiry-on').is(':checked')) {
			validityObj.value = getLongDate(jQuery('#expiry-time-val-display').val(), 23, 59);
		} else {
			validityObj.value = 0;
		}
		var rolesObj = [];
		var roles = jQuery('#integ-key-roles').select2('data');//NO I18N
		for(i = 0; i < roles.length; i++) {
			rolesObj.push({'id': roles[i].id, 'name': roles[i].name});
		}
		var integKeyObj = {};
		integKeyObj.name = jQuery('#integ-key-name').val();
		integKeyObj.validity = validityObj;
		integKeyObj.roles = rolesObj;
		var isUpdateOperation = false;
		integKeyObj.status = 'active';//NO I18N
		if(jQuery('#update-btn').length > 0) {
			isUpdateOperation = true;
		}
		if(isUpdateOperation && !jQuery('#integ-key-status').is(':checked')) {
			integKeyObj.status = 'inactive';//NO I18N
		}
		integKeyObj.description = jQuery('#integ-key-description').val().trim();
		var inputData = {};
		inputData.integration_key = integKeyObj;
		return inputData;
	},
	integKeyObj.initPopUp = function(title, param, width) {
		if(title != null && title != undefined && param != null && param != undefined) {
			sdpAjax({
				ignorefailuremessage: true,
				dataType: 'html',// NO I18N
				url: '/setup/integrationkeyForm.jsp?' + param,//NO I18N
				success: function(res){
					jQuery('#form-field-container').html(res);
					jQuery('#form-field-container').dialog({
						width: width,
						title: title,
						modal: true,
						close: function() {
							jQuery(this).dialog('destroy');//NO I18N
						}
					});
				}
			});
		}
	},
	integKeyObj.openNotificationSettingsPopup = function() {
		integKey.initPopUp(translate('sdp.admin.integration.key.expiry.notification.title'), 'action=notification_settings', '550px');//NO I18N
	},
	integKeyObj.getNotificationSettingsData = async function() {
		var data;
		await sdpAjax({
			type: 'GET',//NO I18N
			url: '/api/v3/integration_keys/_get_notification_settings',//NO I18N
			async: false,
			success: function(resp) {
				if(resp.response_status.status === 'success' && resp.get_notification_settings) {
					data = resp.get_notification_settings;
				}
			}
		});
		return data;
	},
	integKeyObj.initNotificationSettings = async function() {
		var settings = await integKey.getNotificationSettingsData();
		jQuery('#is-notification-enabled').prop('checked', settings.is_enabled);//NO I18N
		if(settings.is_enabled) {
			jQuery('#expiry-days').prop('disabled', false);//NO I18N
			jQuery('#notify-technicians').prop('disabled', false);//NO I18N
		} else {
			jQuery('#expiry-days').prop('disabled', true);//NO I18N
			jQuery('#notify-technicians').prop('disabled', true);//NO I18N
			if(jQuery('#notification-settings-mail-warning').length > 0) {
				jQuery('#save-notification-btn').prop('disabled', false);//NO I18N
			}
		}
		jQuery('#expiry-days').val(settings.no_of_days);
		var technicianList = [];
		if(settings.is_notify_to_owner) {
			technicianList.push({'id':0,'name':'integration-key-owner','text':'$IntegrationKeyOwner'});
		}
		for(i = 0; i < settings.notify_technicians.length; i++) {
			var techObj = settings.notify_technicians[i];
			technicianList.push({'id': techObj.id,'name': techObj.name, 'text': techObj.name});
		}
		integKey.initNotifyTechnicians(technicianList);
		integKey.initNotificationSettingsFormValidation();
	},
	integKeyObj.initNotifyTechnicians = function(selectedObj) {
		var inputOptions = {
			data: selectedObj,
			select2Id: 'notify-technicians',//NO I18N
			placeholder: '-- ' + translate('sdp.requests.common.select.technician') + ' --',//NO I18N
			callbackURL: '/technicians',//NO I18N
			entity_name: 'technicians',//NO I18N
			multiple: true,
			listinfoCallback: this.customListInfoForNotifyTech,
			results: function(data) {
				var unselectedObj = [];
				jQuery('#select2-drop ul li div').each(function(i, e) {
					unselectedObj.push(jQuery(e).text())
				});
				var rData = [];
				if(!unselectedObj.includes('$IntegrationKeyOwner') && !jQuery('#notify-technicians').select2('val').include('0')) {
					rData.push({'id':0,'name':'integration-key-owner','text':'$IntegrationKeyOwner'});//NO I18N
				}
				for(var i = 0; i < data.length; i++) {
					rData.push({'id': data[i].id, 'name': data[i].name, 'text': data[i].name});//NO I18N
				}
				return rData;
			}
		};
		var NotifyTechniciansSelect2 = new Select2APIComponent(inputOptions);
	},
	integKeyObj.customListInfoForNotifyTech = function(listInfo, searchText) {
		var listInfo = listInfo ? listInfo : {};
		listInfo.sort_order = 'asc';//NO I18N
		listInfo.sort_field = 'name';//NO I18N
		var search_criteria = {'field': 'associated_roles.name', 'value': 'SDAdmin', 'condition': 'contains', 'logical_operator': 'AND', 'children': [{'field': 'email_id', 'value': null, 'condition': 'NEQ', 'logical_operator': 'AND'}]};//NO I18N
		if(searchText) {
			var search_criteria_child = search_criteria.children;
			search_criteria_child.push({'field': 'name', 'value': searchText, 'condition': 'like', 'logical_operator': 'AND'});//NO I18N
			search_criteria.children = search_criteria_child;
		}
		listInfo.search_criteria = search_criteria;
		return listInfo;
	}
	integKeyObj.initNotificationSettingsFormValidation = function() {
		var rules = {
			'notify-technicians': {//NO I18N
				required: true
			}
		};
		var messages = {
			'notify-technicians': {//NO I18N
				required: translate('sdp.common.emptymessage', [translate('sdp.common.technician')])
			}
		};
		initFormValidator('notification-settings-form', rules, messages);//NO I18N
	},
	integKeyObj.updateNotificationSettings = async function() {
		if(jQuery('#notification-settings-form').valid()) {
			var inputData = await this.constructNotificationSettingsInputData();
			sdpAjax({
				type: 'PUT',//NO I18N
				url: '/api/v3/integration_keys/_update_notification_settings',//NO I18N
				data: sdpAjaxInputData(inputData),
				dataType: 'json',//NO I18N
				success: function(resp) {
					if( resp.response_status.status === 'success' ) {
						showalert('success', translate('api.updated.success', [translate('sdp.admin.integration.key.expiry.notification.title')]), 'isAutoHide=true');//NO I18N
						jQuery('#cancel-btn').trigger('click');
					}
				}
			});
		}
	},
	integKeyObj.constructNotificationSettingsInputData = async function() {
		var inputData = {};
		if(jQuery('#is-notification-enabled').is(':checked')) {
			inputData.is_enabled = true;
			inputData.no_of_days = parseInt(jQuery('#expiry-days').val());
			var techinicians = [];
			var isNotifyToOwner = false;
			var selectedObj = jQuery('#notify-technicians').select2('data');//NO I18N
			for(i = 0; i < selectedObj.length; i++) {
				if(selectedObj[i].id === 0) {
					isNotifyToOwner = true;
				} else {
					techinicians.push({'id':selectedObj[i].id,'name':selectedObj[i].name});
				}
			}
			inputData.is_notify_to_owner = isNotifyToOwner;
			inputData.notify_technicians = techinicians;
		} else {
			inputData = await integKey.getNotificationSettingsData();
			inputData.is_enabled = false;
		}
		return inputData;
	}
	return integKeyObj;
}());
