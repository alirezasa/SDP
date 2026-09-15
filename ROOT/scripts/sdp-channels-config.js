/* $Id$ */

/* This file consists of the methods used for channel creation popup and channel edit popup (channel config methods) */ 

var channelConfig = {
	channelMetaFields: null, //used to provide meta info for criteria, fetch from once for the session
	default_permissions: null, // load from server once and used when required.
	// this method is used to initiate the create and edit channel popup.
	createNewChannelPopup: function (from, response) {
		"use strict";// NO I18N
		jQuery('body').append("<div id='channelform-content'></div>");
		let $channelFormContent = jQuery("#channelform-content");
		let title = translate("channel.new.channel"); // NO I18N
		if (from === "update") {
			title = translate("channel.update.channel"); // NO I18N
		}
		//opening the slider popup
		$channelFormContent.show().panelSlider({
			width: 900,
			//header: true,
			placement: chat_util.getChannelInfoPopupDirection(),
			title: title,
			dialogClass: "tabui-rightpanel channel-dialog", // NO I18N
			modal: true,
			open: function () {
				const is_sdAdmin = sdp_user.ROLES.includes("SDAdmin");//No I18N
				const userType = sdp_user.USERTYPE;
				const input = { is_sdAdmin,userType };
				input.from_update = from === "update" ? true : false ;//No I18N
				if(input.from_update){
					input.channelType = response.channel.type;
				}
				if(window.checkIfMSPOrSCP()) {
					input.isMSP = checkIfMSP();
					input.isSCP = checkIfSCP();
				}
				if (!sdp_chat.technician_channel_hbs) {
					ResourceLoader({
						js: ["/scripts/hbs-template-technician-channel.js"], // No I18N
						success: function () {
							sdp_chat.technician_channel_hbs = true;
							renderhbs('#channelform-content', 'add-channel', input, false, 'chat/Technician/Channel'); // NO I18N
							initTooltip("#chat-general-form"); // NO I18N
						}
					});
				}
				else {
					renderhbs('#channelform-content', 'add-channel', input, false, 'chat/Technician/Channel'); // NO I18N
					initTooltip("#chat-general-form"); // NO I18N
				}
				if(window.checkIfMSP()) {
					jQuery("#channelCritDiv, #userSelectionDiv").hide();
				}
			},
			close: function () {
				$channelFormContent.remove();
				jQuery('body').removeClass('of-h'); // NO I18N
				jQuery('body').removeClass('subheader-of-h'); // NO I18N
			}

		});
		setTimeout(function () {
			channelConfig.initCreateChannelPopup(from, response);
			if (from === "update") { //filling the channel info on update popup
				let channelFormDiv = jQuery("#channelform-content");
				channelFormDiv.find('#editchannel-footer').removeClass('hide');
				channelFormDiv.find('#channelCritDiv').addClass("opac5 ptr-ev-none");
				channelFormDiv.find('#channelTypeUl').addClass("opac5 ptr-ev-none");
				channelFormDiv.attr("channel-id", response.channel.id);
				channelFormDiv.find("input[name=channel-name]").val(response.channel.name);
				channelFormDiv.find("textarea[name=channelDesc]").val(response.channel.description);
				if (response.channel.type == "team") {
					let channelTypeUl = channelFormDiv.find('#channelTypeUl');
					channelTypeUl.find("li[data-val=team]").trigger("click");
				}
				const isPublic = response.channel.is_public;
				channelFormDiv.find(`input#${isPublic ? "channnelpublic" :"channelprivate"}`).prop("checked", true); // NO I18N

				if (response.channel.icon && response.channel.icon != null) {
					const iconDiv = channelFormDiv.find('[data-id="custom-profile"] img[data-id="default-profile"]');
					iconDiv.attr("src", response.channel.icon["content-url"]);
					iconDiv.attr("media_id", response.channel.icon["id"]);
					channelFormDiv.find('[data-id="custom-profile"] [data-id="config_layer"]').css('display', ''); // NO I18N
					iconDiv.removeClass("hide");
					channelFormDiv.find('[data-id="custom-profile"] svg').addClass("hide");
				}
				if (response.channel.criteria && response.channel.criteria != null) {
					jQuery("#chanelCriteria").custom_filter('update', response.channel.criteria);// NO I18N
				}
			} else {
				if( (sdp_user.USERTYPE === "Technician" && !sdp_user.ROLES.includes("SDAdmin")) || window.checkIfSCP() ){
				    // for SCP, only Team chat is supported
					let channelTypeUl = jQuery("#channelform-content").find('#channelTypeUl');
					channelTypeUl.find("li[data-val=team]").trigger("click");
				}
				jQuery('#addchannel-footer').removeClass('hide');
			}
		}, 500);

	},
	//updating the channel properties
	updateChannelInfo: function (element) {
		let channelDetailsElem = jQuery(element).parents().closest("div#chat-cs-detail");//No I18N
		const channelId = channelDetailsElem.attr("data-channelid");
		const portalId = channelDetailsElem.attr('data-portalid');
		let url = "/channels/" + channelId;// NO I18N	
		url = chtload.appendPortalParam(url, portalId)
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "GET", // No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				channelConfig.createNewChannelPopup("update", response);// NO I18N
			}
		});
	},
	//constructing the channel creation popup
	initCreateChannelPopup: function (from, channelResponse) {
		let $channelFormContent = jQuery("#channelform-content");
		let channelTreeJq = $channelFormContent.find('ul[data-radio="channel-tree"]');
		const portalid = channelResponse == undefined ?sdp_app.PORTAL_ID:channelResponse.channel.portalid;
		channelTreeJq.on('click', 'li[data-radio="click"]', function () {
			let curEleJq = jQuery(this);
			if (!curEleJq.hasClass("active")) {
				channelTreeJqLi = channelTreeJq.find('li[data-radio="click"]');
				channelTreeJqLi.removeClass('active');
				curEleJq.addClass('active');
				let checkedVal = channelTreeJq.find('li[data-radio="click"].active').attr('data-val'),
					chnPrvTxt = $channelFormContent.find('#channel-prv-desc');
				let channelSvg = $channelFormContent.find('[data-id="custom-profile"] svg');
				if (checkedVal == 'org') {
					chnPrvTxt.text(translate("channel.add.visibility.message"));
					channelSvg.find("use").attr("href", "#channel_org");
				}
				else {
					chnPrvTxt.text(translate("channel.team.channel.description"));
					channelSvg.find("use").attr("href", "#channel_team");
				}
				channelConfig.initializeCriteriaComponent();
				if(window.checkIfMSP()) {
					if(checkedVal == 'org') {
						jQuery("#channelCritDiv, #userSelectionDiv").hide();
						jQuery("#account_association_section").show();
					} else {
						jQuery("#account_association_section").hide();
						jQuery("#channelCritDiv, #userSelectionDiv").show();
					}
					if(from == "update") {
						jQuery("account_association_section").addClass("opac5 ptr-ev-none");
					}
				}
			}
		});
		//For icon upload
		$channelFormContent.find('[data-id="custom-profile"] .ip-drag').off().on('change', function (event) {
			let file = event.target.files[0];
			let reader = new FileReader();
			if (file) {
				if (!chat_actions.checkFileSize(file)) {
					var ajax_data = new FormData();
					current_time = Date.now();
					ajax_data.append('input_image', file, file.name); // NO I18N
					let uploadURL = "/api/v3/channels/images"; //No I18N
					uploadURL = chtload.appendPortalParam(uploadURL,portalid);
					sdpAjax({
						url: uploadURL,
						type: "POST", //No I18N
						method: "POST", //No I18N
						processData: false,
						contentType: false,
						data: ajax_data
					}).done(function (response) {
						const iconDiv = $channelFormContent.find('[data-id="custom-profile"] img[data-id="default-profile"]');
						iconDiv.attr("src", response.media["content-url"]);
						iconDiv.attr("media_id", response.media["id"]);
						$channelFormContent.find('[data-id="custom-profile"] [data-id="config_layer"]').css('display', ''); // NO I18N
						iconDiv.removeClass("hide");
						$channelFormContent.find('[data-id="custom-profile"] svg').addClass("hide");
					});
				}
				reader.readAsDataURL(file);
			}
			initTooltip('.custom-prof'); // NO I18N
		});
		//to load permissions
		let permissions = [];
		if (from === "update") {
			let URL = `/channels/${channelResponse.channel.id}/permissions`;
			URL = chtload.appendPortalParam(URL,portalid)
			let ajax_data = chat_util.constructAjaxData({
				url: URL, 
				type: "GET" //No I18N
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					permissions = response.permissions;

				}
			});
		} else {
			if (channelConfig.default_permissions == undefined || channelConfig.default_permissions == null) {
				channelConfig.getDefaultPermissions();
			}
			permissions = channelConfig.default_permissions;
		}
		if (!sdp_chat.common_channel_hbs) {
			ResourceLoader({
				js: ["/scripts/hbs-template-common-channel.js"], // No I18N
				success: function () {
					sdp_chat.common_channel_hbs = true;
					renderhbs('#permissions', 'channel-details-permissions', { "permissions": permissions }, false, 'chat/Common/Channel'); // NO I18N
				}
			});
		}
		else {
			renderhbs('#permissions', 'channel-details-permissions', { "permissions": permissions }, false, 'chat/Common/Channel'); // NO I18N
		}
		channelConfig.initializeCriteriaComponent();
		jQuery('#add-chat-participants').select2({
			placeholder: '-- Select Participants --' // NO I18N
		});
		if(window.checkIfMSP()) {
			const type = jQuery("#channelTypeUl").find("li.active").attr("data-val");
			if("org" == type) {
				var agb_inp_data = {associated_accounts : channelResponse && channelResponse.channel ? channelResponse.channel.associated_accounts : []};
				let options = {
		            container: "account_association_section",  //No I18N
		            url : {"accounts":"/api/v3/accounts/get_all_accounts","account_groups":""}, //No I18N
		            instance_id: "account_association_for_channel",  //No I18N
		            default_field: from == "update" ? (channelResponse && channelResponse.channel && channelResponse.channel.all_accounts ?  "all" : "acc" ) : "all",  //No I18N
		            is_disabled : from == "update", //No I18N
		            is_acc_grp_field_needed: false,
		            input_data : agb_inp_data,
		            hide_label : true
	        	}

	        	channelConfig.agb_comp = new AGBulkSelect(options);

				jQuery("#channelCritDiv, #userSelectionDiv").hide();
				jQuery("#account_association_section").show();
			} else {
				jQuery("#account_association_section").hide();
				jQuery("#channelCritDiv, #userSelectionDiv").show();
			}
		}
		//creating or updating the channel from the popup button click
		$channelFormContent.on('click', '#createchannel, #updatechannel', function () {
			let operation = jQuery(this).attr("id") === "updatechannel" ? "update" : "add"; // NO I18N
			var channelName = $channelFormContent.find('#channel-name'),
				addParticipants = $channelFormContent.find('#add-chat-participants'),
				aGeneral = $channelFormContent.find('a[href="#general"]')
			//getting criteria value
			var criteria = $channelFormContent.find("#chanelCriteria").custom_filter('getFilterData'); // NO I18N
			if (channelName.val().trim().length === 0) { //showing error for empty channel name
				channelName.parent().addClass('has-error');
				showalert('failure', translate("channel.name.error"), 'isAutoHide=true,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
				if (!aGeneral.parent().hasClass('active')) {
					aGeneral.trigger('click');
				}
			} else if (criteria != null && !criteria && operation === "add") { // NO I18N
				return;
			}
			else {
				channelName.parent().removeClass('has-error');
				addParticipants.parent().removeClass('has-error');
				let input_data = {
					"channel": {// No I18N
						"name": "" // No I18N
					}
				};

				let description = $channelFormContent.find('#channelDesc').val();
				if (description != "") {
					input_data.channel.description = description;
				}
				input_data.channel.name = channelName.val();

				let visibility = $channelFormContent.find("[name=visibilty]:checked").val();
				let isPublic = true;
				if (visibility == "private") {
					isPublic = false;
				}
				input_data.channel.is_public = isPublic;
				//fetching permissions to pass as input while creating/updating
				const permissionTable = document.querySelector("#permissions");// NO I18N
				const rows = permissionTable.querySelectorAll('tr');// NO I18N
				let permissions = [];
				for (let i = 1; i < rows.length; i++) {
					let row = rows[i];
					let permissionObj = {};
					let actionObj = {};
					actionObj.id = row.getAttribute("action_id");
					permissionObj.action = actionObj;
					const cells = row.querySelectorAll('td');// NO I18N
					cells.forEach(function (cell) {
						let role = cell.getAttribute("elname");
						const checkbox = cell.querySelector('input');// NO I18N
						switch(role){
							case "admin": // No I18N
								permissionObj.is_admin_allowed = checkbox.checked;
								break;
							case "moderator": // No I18N
								permissionObj.is_moderator_allowed = checkbox.checked;
								break;
							case "member": // No I18N
								permissionObj.is_member_allowed = checkbox.checked;
								break;
						}
					});
					permissions.push(permissionObj);
				}
				if (permissions.length > 0) {
					input_data.channel.permissions = permissions;
				}
				const iconDiv = $channelFormContent.find('[data-id="custom-profile"] img[data-id="default-profile"]');
				let media_id = iconDiv.attr("media_id");
				if (media_id != undefined || media_id != null) {
					input_data.channel.icon = { "id": media_id }; // NO I18N
				}
				else {
					input_data.channel.icon = null;
				}
				if (operation === "add") {
					var channelType = $channelFormContent.find("ul[data-radio='channel-tree'] li.active").attr("data-val");
					input_data.channel.type = channelType;
					let channel_users = [];
					//fetching selected user to pass as input while creating the channel
					var users = $channelFormContent.find("#selectUsers").select2("data");// NO I18N
					if (users != '') {
						let channelUsers = [];
						if (Array.isArray(users)) {
							users.forEach(function (obj) {
								channel_users.push(obj.id);
							});
						}
					}
					if (channel_users.length > 0) {
						input_data.channel.channel_users = channel_users;
					}
					if (criteria != null) {
						input_data.channel.criteria = criteria;
					}
					if(window.checkIfMSPOrSCP()) {
						if(window.checkIfMSP()) {
							if("org" == channelType) {

								if(channelConfig.agb_comp.validate())
								{
									return;
								}

								input_data.channel.all_accounts = channelConfig.agb_comp.getSelectedRadioVal("account_association_for_channel") == 'all'; // NO I18N
								input_data.channel.associated_accounts = channelConfig.agb_comp.getSelectedAccounts("account_association_for_channel"); // NO I18N

								for (var index = 0; index < input_data.channel.associated_accounts.length; index++) {
									// NOTE : this iteration can be avoided if sever supports to allow text attr for associated_accounts
								  delete input_data.channel.associated_accounts[index].text;
								}
							}
						} else {
							// for SCP
							input_data.channel.type = "team";
						}
					}
					var ajax_data = chat_util.constructAjaxData({
						url: "/channels", //No I18N
						type: "POST", // No I18N
						input: input_data
					});
				} else {
					let url = "/channels/" + channelResponse.channel.id; //No I18N
					url = chtload.appendPortalParam(url, portalid);
					var ajax_data = chat_util.constructAjaxData({
						url: url,
						type: "PUT", // No I18N
						input: input_data
					});
				}
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						if(operation === "add"){
							window.showalert('success', translate("channel.created.success"), "isAutoHide=true"); // No I18N
						}
						else{
							window.showalert('success', translate("channel.edited"), "isAutoHide=true"); // No I18N
						}
						redirect.closehbsdialog($channelFormContent);
					}
				});
			}
		});
		//focusing channel name input on opening the popup
		$channelFormContent.on('click', 'a[href="#general"]', function () {
			$channelFormContent.find('#chat-slider1 #channel-name').trigger('focus');
		});

	},
	//fetching default permissions from server
	getDefaultPermissions: function () {
		let ajax_data = chat_util.constructAjaxData({
			url: "/channels/_default_permissions", //No I18N
			type: "GET" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				channelConfig.default_permissions = response.channel_permissions;

			}
		});
	},
	//method to open explorer
	openUpload: function () {
		const fileInp = jQuery("#channelform-content [data-id='custom-profile'] .ip-drag");
		fileInp.trigger('click');
	},
	//to delete channel profile icon.
	deleteIcon: function () {
		let $channelFormContent = jQuery("#channelform-content");
		const iconDiv = $channelFormContent.find('[data-id="custom-profile"] img[data-id="default-profile"]');
		iconDiv.attr("src", "");
		iconDiv.removeAttr("media_id");
		$channelFormContent.find('[data-id="custom-profile"] [data-id="config_layer"]').css('display', 'none'); // NO I18N
		iconDiv.addClass("hide");
		$channelFormContent.find('[data-id="custom-profile"] svg').removeClass("hide");
		$channelFormContent.find('[data-id="custom-profile"] input[type="file"]').val("");
	},
	// to initialize the user select dropdown based on the criteria
	initializeUserSelect: function () {
		var criteria = jQuery("#chanelCriteria").custom_filter('getFilterData'); // NO I18N
		const type = jQuery("#channelTypeUl").find("li.active").attr("data-val");
		let url = "/api/v3/channels/get_users"; // NO I18N
		let field = "get_users"; // NO I18N
		if (type == "team") {
			url = "/api/v3/channels/technicians"; // NO I18N
			field = "technicians"; // NO I18N
		}
		//adding additional params as fetch only login-exists users and not current user.
		var usersCrit = [{
			"field": "login_name",// NO I18N
			"value": null,// NO I18N
			"condition": "is not",// NO I18N
			"logical_operator": "and"// NO I18N
		},
		{
			"field": "id",// NO I18N
			"value": sdp_user.LOGGEDIN_USERID,// NO I18N
			"condition": "is not",// NO I18N
			"logical_operator": "and"// NO I18N
		}];
		if (criteria != null) {
			criteria = criteria.concat(usersCrit);
		}else{
			criteria = usersCrit;
		}
		var li = { "search_criteria": criteria };//NO I18N

		var urlForUserSelect2 = [{
			url: url,
			field: field,
			list_info: li
		}];
		//fetching users to select while creating channel
		var options = {
			"criteriaCallback" : function(data,search_criteria){ //NO I18N
				var crit = [...usersCrit];
				jQuery.merge(crit,[{"field":"name","condition":"like","values":[data],"logical_operator":"and", "children":[{"field":"email_id","condition":"like","values":[data],"logical_operator":"or"}]}]); //NO I18N
				return crit;
			},
			"url": urlForUserSelect2, // NO I18N
			multiple: true,
			closeOnSelect: false,
			formatResult: function (data) {
				let name = e_html(data.name);
				let email = (data.email_id==null ||data.email_id =="")? getMessageForKey("sdp.common.na") : e_html(data.email_id);
				let employeeId = (data.employee_id==null ||data.employee_id =="")? getMessageForKey("sdp.common.na") : e_html(data.employee_id);
				let toolTip = "";
				toolTip += `<b>${getMessageForKey("sdp.common.name")} : </b><span>${name}</span><br /> <b>${getMessageForKey("sdp.common.email")} : </b><span>${email}</span><br /> <b>${getMessageForKey("sdp.common.empid.is")} : </b><span>${employeeId}</span>`; // NO I18N
				let option = '<span title="'+e_html(toolTip) +'" mode_html="true" rel="uitip">' + name + '</span>';
				//used to show the user details email,emp id on tooltip of user option in sdp_select2. intialising tooltip for each option while formating.
				option = jQuery(option).uitooltip({ 
					content: function() {
						var element = jQuery(this);
						return element.attr("title"); //NO I18N
					},
					track: true,
					show: {
						delay: 250
					},
					tooltipClass: "uitooltip-track uitip" //No I18N
				});
				return option;
			},
			//formating the user properties on dropdown list
			formatSelection: function (data) {
				let option = "";
				if (data.email_id === "" || data.email_id === null) {
					option = '<span>' + e_html(data.name) + '</span>';
				} else {
					option = '<span>' + e_html(data.name) + ' - ' + e_html(data.email_id) + '</span>';
				}
				return option;
			},
			//formating the user properties after selection
			processResults: function (search_data, data, field) {
				var processedResult = {
					id: data.id,
					name: data.name,
					email_id: data.email_id,
					employee_id: data.employee_id
				};
				search_data.push(processedResult);
			}
		};
		options.maximumSelectionSize = 100;
		jQuery("#selectUsers").val('').sdp_select2(options);
	},
	// initializing criteria component to set criteria for channel
	initializeCriteriaComponent: function () {
		let adv_options = {
			changeURLData: channelConfig.changeURLData
		};
		var type = jQuery("#channelTypeUl").find("li.active").attr("data-val");
		if (channelConfig.channelMetaFields == undefined || channelConfig.channelMetaFields == null) {
			var ajax_data = chat_util.constructAjaxData({
				url: "/channels/_metainfo"//No I18N
			});
			sdpAjax(ajax_data).done(function (response) {
				if (response.response_status.status == 'success') {
					channelConfig.channelMetaFields = response.metainfo.fields;
				}
			}).fail(function (response) {
				chat_util.checkAjaxResponse(response.responseJSON);
			});
		}
		var modifieldMeta = JSON.parse(sdpToJSON(channelConfig.channelMetaFields));
		if (type == "org") {
			delete modifieldMeta["support_group"];
		}
		adv_options.metainfo = modifieldMeta;
		adv_options.notMandatory = true;
		jQuery("#chanelCriteria").custom_filter(adv_options);
		channelConfig.initializeUserSelect();
	},
	// chnging the url based on the selected criteria param
	changeURLData:function(field,url){
		modifiedUrl = {};	// var introduced for MSP
		if(field == "site"){
			modifiedUrl = {"field":"site_sys_attribute"}; // NO I18N
		}
		if(window.checkIfMSP()) {
			if("team" == jQuery("#channelTypeUl").find("li.active").attr("data-val")) {
				if(field == "site" || field == "department") {
					if(sdp_app) {
						modifiedUrl.url = "/api/v3" + url + "?ACCOUNTID=" + sdp_app.MSP_ORG;    // NO I18N
					}
				} else if(field == "support_group") {   // NO I18N
					modifiedUrl.url = "/api/v3" + url + "?ACCOUNTID=0"; // NO I18N
				}
			}
		}
		return modifiedUrl;
	},
	//used to lock the criteria modifications while selecting the users
	edituserSelect: function () {
		const channelForm = jQuery("#channelform-content");
		if (channelForm.find("#chanelCriteria").custom_filter('getFilterData') !== false) {
			channelConfig.initializeUserSelect();
			channelForm.find("#channelUsersFreeze").addClass("hide");
			channelForm.find("#channelUsersEdit").addClass("hide");
			channelForm.find("#channelCriteriaFreeze").removeClass("hide");
			channelForm.find("#channelCriteriaEdit").removeClass("hide");
		}
	},
	//used to lock the users selection, while defining the criteria
	editChannelCriteria: function () {
		const channelForm = jQuery("#channelform-content");
		channelForm.find("#channelCriteriaFreeze").addClass("hide");
		channelForm.find("#channelCriteriaEdit").addClass("hide");
		channelForm.find("#channelUsersFreeze").removeClass("hide");
		channelForm.find("#channelUsersEdit").removeClass("hide");
		channelForm.find("#selectUsers").select2("data", '');// NO I18N
	},
	//used to close the channel creation/update popup.
	closeChannelCreationDialog: function () {
		redirect.closehbsdialog(jQuery("#channelform-content"));
	}
};
