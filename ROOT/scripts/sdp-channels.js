/* $Id$ */

/*When the chat-bar is initialzed hbs-template-common-chat.js,hbs-template-technician-chat.js are the only pre-loaded hbs-templates all the other hbs-template-*.js are loaded dynamically to reduce the load when chatbar is initialized. */


/*codeblock() functions are used to make sure that a previously loaded hbs-template-*.js is not loaded again,Codeblock functions are used only to avoid duplication of code*/


var sdp_channels ={
    //switch from Technician-tab to chatstab in the all-chats
	switchtoChats:function(a) {
		if (jQuery(a).parent().siblings().hasClass("active")) {
			const $a = jQuery("#user_chats").get(0);
			chtload.loadUserAllChats($a, false);
		}
	},

	//renders channels tab with the input given
	renderchannels:function(val, from) {
		let filter_name;
		if (from == "channels-bar") {
			filter_name = "my_channels";// NO I18N	
		}
		else if (from == "channel-slider") {
			filter_name = "all_channels";// NO I18N	
		}
		let input_data = {
			"list_info": { //No I18N
				"row_count": row_count_global,//No I18N
				"sort_field":"updated_time",//No I18N
				"sort_order":"desc",//No I18N
				"filter_by": { // No I18N
					"name": filter_name //No I18N
				},
				"search_criteria": [{// NO I18N
					"field": "name",// NO I18N
					"value": val,// NO I18N
					"condition": "contains",// NO I18N
					"logical_operator": "and"// NO I18N
				},
				{
					"field": "description",// NO I18N
					"value": val,// NO I18N
					"condition": "contains",// NO I18N
					"logical_operator": "or"// NO I18N
				}]
			}
		};
		if(val === ""){
			delete input_data.list_info.search_criteria
		}
		let ajax_data = chat_util.constructAjaxData({
			input: input_data,
			url: "/channels" //No I18N
		});
		sdp_channels.loadUserChannelsinSearch(ajax_data, input_data, from);
		if(from == "channels-bar"){
			initTooltip("#channellist"); // NO I18N	
		}else if (from == "channel-slider"){ // NO I18N	
			initTooltip("#all-channels-data"); // NO I18N	
		}
	},

	//load channels data in inifinite scroll and search results
	loadUserChannelsinSearch:function(ajax_data, input_data, from) {
		let start_index = 0, end_index = 0, has_more_rows = false, chats_len = 0;
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				const is_empty = response.channels.length < 1;
				const input = { "response": response, "is_empty": is_empty };// NO I18N
				const targetSelector = from === "channels-bar" ? '#channellist' : '#all-channels-data';// NO I18N
            	const templateName = from === "channels-bar" ? 'channels-tab-data' : 'all-channels-slider-data';// NO I18N
            	const templatePath = from === "channels-bar" ? 'chat/Common/Chat' : 'chat/Common/Channel';// NO I18N	
				renderhbs(targetSelector, templateName, input, false, templatePath);
				start_index = response.list_info.start_index;
				end_index = start_index + response.list_info.row_count - 1;
				has_more_rows = response.list_info.has_more_rows;
				chats_len += response.list_info.row_count;
			}
		});
		let from_id = from === "channels-bar" ? '#channellist' : '#all-channels-data';// NO I18N
		let $channel_obj = jQuery(from_id);
		chtload.bindInfiniteScrollForChannelsTab(start_index, end_index, has_more_rows, $channel_obj, from, input_data, true);
		initTooltip("#all-channels-data");// NO I18N
	},


	//returns the actions to be rendered in the chat box based on the entity
	getactionsobj:function(chat_type, channelactions) {
		let actions = {};
		if(!sdp_chat.pinMessageDeniedEntities.includes(chat_type)){
                actions["pinned_messages"] = { "callback": "chat_actions.viewPinMessages(this);", "i18n": "channel.pinned.messages" };// NO I18N
            }
		if (sdp_user.USERTYPE !== "Requester") {
			if (chat_type === 'requester_chat') {
				actions["end_chat"] = { "callback": "requester_chat.chatclosefn(this)", "i18n": "common.end.session" };// NO I18N	
				actions["set_title"] = { "callback": "chat_box.chateditusrname(this)", "i18n": "chat.set.title" };// NO I18N	
				actions["transfer_chat"] = { "callback": "requester_chat.transferChat(this);", "i18n": "chat.transfer.chat" };// NO I18N	
				actions["add_note"] = { "callback": "requester_chat.addNotes(this)", "i18n": "common.add.notes" };// NO I18N	
				actions["common_chats"] = { "callback": "chat_actions.getCommonChats(this)", "i18n": "chat.common.chats" };// NO I18N	
			}
			else if (chat_type === 'tech_req_chat') {
				actions["end_chat"] = { "callback": "requester_chat.chatclosefn(this)", "i18n": "common.end.session" };// NO I18N	
				actions["common_chats"] = { "callback": "chat_actions.getCommonChats(this)", "i18n": "chat.common.chats" };// NO I18N	
			}
			else if (chat_type === 'fluid_group_chat' || chat_type === 'collaborators_chat') {
				actions["add_member"] = { "callback": "chat_actions.addNewMembers(this);", "i18n": "common.chat.add.member" };// NO I18N	
				actions["leave_group"] = { "callback": "chat_actions.leaveGroupConfirmation(this);", "i18n": "common.chat.leave.group" };// NO I18N	
			}
			else if (chat_type === 'technician_chat') {
				actions["add_member"] = { "callback": "chat_actions.addNewMembers(this);", "i18n": "common.chat.add.member" };// NO I18N	
				actions["common_chats"] = { "callback": "chat_actions.getCommonChats(this)", "i18n": "chat.common.chats" };// NO I18N	
			}
		}
		if (chat_type === 'channel') {
			actions["Copy Permalink"] = { "callback": "chat_actions.performchannelaction(this,'share_link');", "i18n": "channel.copy.permalink" };// NO I18N
			if (channelactions.includes('add_member') && sdp_user.USERTYPE !== "Requester") {
				actions["add_member"] = { "callback": "chat_actions.performchannelaction(this,'add_member');", "i18n": "common.chat.add.member" };// NO I18N	
			}
			actions["channel_info"] = { "callback": "chat_actions.performchannelaction(this,'channel_info');", "i18n": "channel.info" };// NO I18N	
			if (channelactions.includes('archive_channel')) {
				actions["archive_channel"] = { "callback": "chat_actions.performchannelaction(this,'archive_channel');", "i18n": "channel.archive" };// NO I18N	
			}
			if (channelactions.includes('delete_channel')) {
				actions["delete_channel"] = { "callback": "chat_actions.performchannelaction(this,'delete_channel');", "i18n": "channel.delete" };// NO I18N	
			}
			actions["leave_channel"] = { "callback": "chat_actions.performchannelaction(this,'leave_channel');", "i18n": "common.chat.leave" };// NO I18N	
		}
		return actions;
	},

	//close hbs modals
	closehbsdialog:function(a) {
		jQuery(a).offsetParent().remove();
		jQuery(a).remove();
		if(jQuery('.ui-dialog').length <1){
			jQuery('body').removeClass('of-h'); // NO I18N
			jQuery('body').removeClass('subheader-of-h'); // NO I18N
		}
	},

	//open all channels tab
	openAllChannels:function(a) {
		jQuery('body').append('<div id="chat-slider-div"></div>');
		jQuery("#chat-slider-div").show().panelSlider({
			width: 900,
			header: true,
			placement: chat_util.getChannelInfoPopupDirection(), 
			title: translate("channel.all.channels"),//No I18N
			dialogClass: "tabui-rightpanel channel-dialog", // NO I18N
			modal: true,
			open: function () {
				chtload.loadAllChannels(a);
			},
			close: function () {
				jQuery("#chat-slider-div").remove();
				if(jQuery('.ui-dialog').length <1){
					jQuery('body').removeClass('of-h'); // NO I18N
					jQuery('body').removeClass('subheader-of-h'); // NO I18N
				}
			}
		});
	},

	//method to join a channel (common method for all channels and channel details)
	joinChannel:function(a, from,event) {
		if(event !== undefined){event.stopPropagation();}
		const message = translate("channel.join.alert.message");
		showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("chat.join") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', join); //No I18N
		function join(boo, btn) {
			if (boo) {
				if (btn == 'submitButton') {
					let chatID;
					let channelId;
					if (from == 'slider') {
						const parent = jQuery(a).parent();
						chatID = a.getAttribute('data-chatid');
						channelId = a.getAttribute('data-channelid');	
					}
					else if (from == 'details') {
						const $det = jQuery(a).closest("#chat-cs-detail");//No I18N
						chatID = $det.attr("data-chat-id");//No I18N
						channelId = $det.attr("data-channelid");
					}
					const $li = jQuery("#all-channels-data").find(`li[data-chatid='${chatID}']`); 
					$li.find(".tr.vmiddle").empty();
					$li.find(".tr.vmiddle").append(`<button id="channel-leave-btn" class="btn btn-danger-ol" data-chatid="${chatID}" data-channelid="${channelId}">${translate("common.chat.leave")}</button>`);//No I18N
					$li.find(".tr.vmiddle").find("#channel-leave-btn").on("click.channelsList", function(){
						event.stopPropagation();
						sdp_channels.leaveChannel(this,'slider',event); //No I18N
					});
					$li.find(`#title-id-${channelId}`).find(`span[data-id="channels-green-tick"]`).remove();					
					$li.find(`#title-id-${channelId}`).append(`<span data-id="channels-green-tick" class="cspr icon-md success-green ml5 vbottom" title="${translate("channel.subscribed")}" rel="uitip"></span>`);
					var url = "/chats/" + chatID + "/_join";// NO I18N	
					var ajax_data = chat_util.constructAjaxData({
						url: url,
						type: "PUT", // No I18N
					});

					sdpAjax(ajax_data).done(function (response) {
						if (chat_util.checkAjaxResponse(response)) {
							window.showalert('success', translate("channel.join.success"), "isAutoHide=true"); // No I18N
							let $el;
							if (from == 'details') {
								$el = jQuery(a).closest("#chat-cs-detail")[0];
								const $details = jQuery($el).closest("#channel-details");//No I18N

								sdp_channels.closehbsdialog($details);
							}
							else{
								$el = $li;
							}
							sdp_channels.viewChannelDetails($el,true);
							}
					});
				}
			}
		}


	},

	//method to leave a channel (common method for all-channel , channel-details and actions)
	leaveChannel:function(a, from,event) {
		"use strict"; // NO I18N
		if(event !== undefined){event.stopPropagation();}
		const message = translate("channel.leave.alert.message");
		showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("common.chat.leave") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', leave,true); //No I18N
		function leave(boo, btn) {
			if (boo) {
				if (btn == 'submitButton') {
					let chatID ;
					let channelId ;
					const $a = jQuery(a);
					if (from == 'slider') {
						chatID = a.getAttribute('data-chatid');
						channelId = a.getAttribute('data-channelid');
					}
					else if (from == 'actions') {
						const $act = $a.parents().eq(1)[0]
						chatID = $act.getAttribute("data-chat-id");
						channelId = $act.getAttribute("data-channel-id");
					}
					else if (from == 'details') {
						const $det = $a.parents().find("#chat-cs-detail"); 
						chatID = $det.attr("data-chat-id");
						channelId = $det.attr("data-channelid");
						var $el = $a.closest("#chat-cs-detail")[0];
						var $details = jQuery($el).closest("#channel-details");//No I18N
					}
					var url = "/chats/" + chatID + "/_leave"// NO I18N
					var ajax_data = chat_util.constructAjaxData({
						url: url,
						type: "PUT", // No I18N
					});

					sdpAjax(ajax_data).done(function (response) {
						if (chat_util.checkAjaxResponse(response)) {
							window.showalert('success', translate("channel.leave.success"), "isAutoHide=true"); // No I18N
							$(jQuery(a).parent().parent()).find('[data-id="channels-green-tick"]').remove();
							const channelLi = jQuery("#all-channels-data").find(`li[data-chatid='${chatID}']`);
							const $li = channelLi.find(".tr.vmiddle"); 
							$li.empty();
							$li.append(`<span id="channel-join-btn" class="btn btn-link sb a-tag" data-chatid="${chatID}" data-channelid="${channelId}">${translate("chat.join")}</span>`);
							$li.find("#channel-join-btn").on("click.channelsList",function(){
								event.stopPropagation();
								sdp_channels.joinChannel(this,'slider',event); //No I18N
							});
							if(channelLi.length>0){
								let channel_visiblity = channelLi.attr("channel-public");
								if(channel_visiblity !== "true"){
									channelLi.remove();
								}
							}
							if (from == 'details') {
								const $channelel = $a.closest("#chat-cs-detail")[0];
								let is_public = jQuery($channelel).attr("channel-public");
								sdp_channels.closehbsdialog($details);
								if(is_public === "true"){
									sdp_channels.viewChannelDetails($el,true);
								}
							}
							jQuery("#channellist").find("li[data-chat-id='" + chatID + "']").remove();
							if(jQuery("#channellist").children().length < 1){
								jQuery("#sdp-chat-bar").find("#data-channel").addClass("hide");
								jQuery("#sdp-chat-bar").find("#nodata-channel").removeClass("hide");
							}
						}
					});
				}
			}
		}


	},

	//method to load channel members popup
	viewChannelMembers:function(a) {
		const wrapper_element = jQuery(a).parents().closest(".chatbar-maincontent");//No I18N
		const chatId = wrapper_element.attr('id');
		const channelId = wrapper_element.attr('data-channelid');
		const channelType = wrapper_element.attr("data-channel-type");
		const portal_id = wrapper_element.attr("data-portalid");
		let url = "/channels/" + channelId + "/users";//No I18N
		url = chtload.appendPortalParam(url, portal_id);
		let title = "#" + jQuery(a).parent().find('#chatbox-title').text();//No I18N
		let start_index = 1;
		let admins = [];
		let moderators = [];
		let members = [];
		let input = {
			"list_info": {//No I18N
				"start_index": start_index, //No I18N
				"row_count": 100, //No I18N
				"sort_field": "channel_role.id", //No I18N
				"sort_order": "asc" //No I18N
			}
		};
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "GET", // No I18N
			input: input
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				response.users.forEach(function (item, index, arr) {
					item.member.id = parseInt(item.member.id)
					switch(item.channel_role.name){
						case "Admin": // No I18N
							admins.push(item);
							break;
						case "Moderator": // No I18N
							moderators.push(item);
							break;
						case "Member": // No I18N
							members.push(item);
							break;	
					}

				});
			}
		});
		admins.sort((a, b) => b.status.localeCompare(a.status));
		moderators.sort((a, b) => b.status.localeCompare(a.status));
		members.sort((a, b) => b.status.localeCompare(a.status));
		jQuery('body').append('<div id="view-members"></div>');
		let $membersContainer = jQuery('#view-members');
		$membersContainer.dialog({
			'modal': true,//NO I18N
			'title': translate(title),//NO I18N
			'width': 450,//NO I18N
			'height': 800,//NO I18N
			'position': { my: "center", at: "center", of: window },//NO I18N
			'resizable': false,//NO I18N
			'draggable': true,//NO I18N
			'closeOnEscape': true, //NO I18N
			open: function (event, ui) {
				var ele = jQuery(event.target);
				ele.css({ 'height': '100%' });// No I18N
				const chatid = parseInt(chatId);
				let change_roles = sdp_chat.active_channelactions[chatid].includes("role_change");
				let remove_member = sdp_chat.active_channelactions[chatid].includes("remove_member");
				let add_member = sdp_user.USERTYPE !== "Requester" ? sdp_chat.active_channelactions[chatid].includes("add_member") : false; //NO I18N
				const channel_status = jQuery("#sdp-chat-bar").find("#" + chatId).attr("channel-status");
				if (channel_status !== "Running") {
					change_roles = false;
					remove_member = false;
					add_member = false;
				}

				function codeblock() {
					const roles = ["Admins","Moderators","Members"];//No I18N
					const input_data = { "Admins": admins, "Moderators": moderators, "Members": members, "channelId": channelId, "chatId": chatId, "portal_id": portal_id, "change_roles": change_roles, "remove_member": remove_member, "add_member": add_member, "sdp_user": sdp_user, "title": title, "channel_type": channelType }; //No I18N
					renderhbs('#view-members', 'viewChannelMembers', input_data, false, 'chat/Common/Channel'); // NO I18N
					const $members = $membersContainer.find("#memberdetail");
					roles.forEach(function (role, index, arr) {
						let users_list;
						let id ;
						switch(role){
							case "Admins"://No I18N
								users_list = admins;
								id = "channel-admin";//No I18N
								break;
							case "Moderators"://No I18N
								users_list = moderators;
								id = "channel-moderator";//No I18N
								break;
							case "Members"://No I18N
								users_list = members;
								id = "channel-member";//No I18N
								break;
						}
						const input_data = { "Users":users_list,"user_type":role,"id":id, "channelId": channelId, "chatId": chatId, "portal_id": portal_id, "change_roles": change_roles, "remove_member": remove_member, "add_member": add_member, "sdp_user": sdp_user, "title": title, "channel_type": channelType }; //No I18N
						renderhbs($members, 'ChannelMembersData', input_data, true, 'chat/Common/Channel'); // NO I18N
					});
					
					const $member_search = jQuery("#channel-member-search");


					//search functionality in the view members Popup
					$member_search.keyup(function (a) {
						const search_item = jQuery(a.target).val();
						let input = {
							"list_info": {//No I18N
								"start_index": start_index, //No I18N
								"row_count": 100, //No I18N
								"sort_field": "channel_role.id", //No I18N
								"sort_order": "asc", //No I18N
								"search_criteria": [{// NO I18N
									"field": "member.name",// NO I18N
									"condition": "contains",// NO I18N
									"value": search_item,// NO I18N
									"logical_operator": "or"// NO I18N
								},
								{
									"field": "member.email_id",// NO I18N
									"condition": "contains",// NO I18N
									"value": search_item,// NO I18N
									"logical_operator": "or"// NO I18N
								}]
							}
						};
						let ajax_data = chat_util.constructAjaxData({
							url: url,
							type: "GET", // No I18N
							input: input
						});
						sdpAjax(ajax_data).done(function (response) {
							if (chat_util.checkAjaxResponse(response)) {
								let ad = [];
								let mod = [];
								let mem = [];
								response.users.forEach(function (item, index, arr) {
									item.member.id = parseInt(item.member.id);
									switch(item.channel_role.name){
										case "Admin": // No I18N
											ad.push(item);
											break;
										case "Moderator": // No I18N
											mod.push(item);
											break;
										case "Member": // No I18N
											mem.push(item);
											break;	
									}
								});
								ad.sort((a, b) => b.status.localeCompare(a.status));
								mod.sort((a, b) => b.status.localeCompare(a.status));
								mem.sort((a, b) => b.status.localeCompare(a.status));
								const $members = $membersContainer.find("#memberdetail");
								$members.empty();
								roles.forEach(function (role, index, arr) {
									let users_list;
									let id ;
									switch(role){
										case "Admins"://No I18N
											users_list = ad;
											id = "channel-admin";//No I18N
											break;
										case "Moderators"://No I18N
											users_list = mod;
											id = "channel-moderator";//No I18N
											break;
										case "Members"://No I18N
											users_list = mem;
											id = "channel-member";//No I18N
											break;
									}
									const input_data = { "Users":users_list,"user_type":role,"id":id, "channelId": channelId, "chatId": chatId, "portal_id": portal_id, "change_roles": change_roles, "remove_member": remove_member, "add_member": add_member, "sdp_user": sdp_user, "title": title, "channel_type": channelType }; //No I18N
									renderhbs($members, 'ChannelMembersData', input_data, true, 'chat/Common/Channel'); // NO I18N
								});
								if (jQuery("#channel-admin").length < 1 && jQuery("#channel-moderator").length < 1 && jQuery("#channel-member").length < 1) {
									$members.append('<div class="pos-abs fw" style=" top: 38%; "> <div id="no_members_found" class="text-muted tc pt20">' + translate("sdp.members.not.available") + '</div> </div>');
								}
								initTooltip('#memberdetail');// NO I18N
							}
						});
					})
					if (jQuery("#channel-admin").length < 1 && jQuery("#channel-moderator").length < 1 && jQuery("#channel-member").length < 1) {
						$members.append('<div class="pos-abs fw" style=" top: 38%; "> <div id="no_members_found" class="text-muted tc pt20">' + translate("sdp.members.not.available") + '</div> </div>');
					}
					initTooltip('#memberdetail');// NO I18N
				}
				if (!sdp_chat.common_channel_hbs) {
					ResourceLoader({
						js: ["/scripts/hbs-template-common-channel.js"], // No I18N
						success: function () { sdp_chat.common_channel_hbs = true; codeblock(); }
					});
				}
				else { codeblock(); }

			},
			close: function (event, ui) {
				jQuery('#view-members').remove();
			}
		});

	},

	//method for assigning the role in view channel members popup
	assignRole:function(a) {
		const $el = jQuery(a).parentsUntil("ul.pl0").last();//No I18N
		const channelId = $el.attr('data-channelid');
		const userId = $el.attr('data-userid');
		const portal_id = $el.attr("data-portalid");
		let role = a.parentElement.getAttribute('data-cmember');
		let message = "";
		function addasadmin(boo, btn) {
			if (boo) {
				if (btn == 'submitButton') {
					sdp_channels.changeRoleinChannel(userId, channelId, role, portal_id)
				}
			}
		}
		if (role !== "member") {
			if (role == "admin") {
				message = translate("channel.assign.admin.message");//No I18N
			}
			else if (role == "moderator") {
				message = translate("channel.assign.moderator.message"); //No I18N
			}
			showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', addasadmin); //No I18N
		}
		else {
			sdp_channels.changeRoleinChannel(userId, channelId, role, portal_id);
		}

	},

	//method to change the role based on input sfrom AssignRole method
	changeRoleinChannel:function(userId, channelId, role, portal_id) {
		const roles = {
			"admin": 1, // No I18N
			"moderator": 2, // No I18N
			"member": 3 // No I18N
		};
		
		let input_data = { "channel_user": { "channel_role": { "id":  roles[role] } } }; //No I18N
		let url = "/channels/" + channelId + "/users/" + userId; //No I18N
		url = chtload.appendPortalParam(url, portal_id);
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "PUT",//No I18N
			input: input_data
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				sdp_channels.closehbsdialog(jQuery("#view-members"));
				jQuery("#view-members").remove();
				const id = "#viewmembers" + channelId;//No I18N
				sdp_channels.viewChannelMembers(jQuery(id).parents().closest("#usersCount"));//No I18N
			}
		});

	},

	//method too remove members from the channel from view members 
	removemember:function(a) {
		const $el = jQuery(a).parentsUntil("ul.pl0").last();//No I18N
		const channelId = $el.attr('data-channelid');
		const chatId = $el.attr('data-chatid');
		const userId = $el.attr('data-memberid');
		const portal_id = $el.attr("data-portalid");
		const message = translate("channel.remove.member.message");
		showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("sdp.common.remove") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', removeUser,true); //No I18N
		function removeUser(boo, btn) {
			if (boo) {
				if (btn == 'submitButton') {
					let input_data = { "chat": { "user": { "id": userId } } };//No I18N
					let url = "/chats/" + chatId + "/_remove_member";//No I18N
					url = chtload.appendPortalParam(url, portal_id);
					let ajax_data = chat_util.constructAjaxData({
						url: url,
						type: "PUT",//No I18N
						input: input_data
					});
					sdpAjax(ajax_data).done(function (response) {
						if (chat_util.checkAjaxResponse(response)) {
							window.showalert('success', e_html(response.response_status.status), "isAutoHide=true");//No I18N
							const role = $el.attr("data-role");
							let $h = $el.parent('ul').siblings(`h5:contains("${role}")`);//No I18N
							let $ul = $el.parent('ul');//No I18N
							$el.remove();
							if($ul.children().length == 0){
								$h.remove()
							}
						}
					});
				}
			}
		}

	},

	//method to open the channel details page (common method from all channels  and actions page)
	viewChannelDetails:function(a, showBackNav) {
		const channelId = jQuery(a).attr('data-channelid');
		if(showBackNav == undefined){
			showBackNav = true;
		}
		let portal_id = jQuery(a).parents().closest(".chatbar-maincontent").attr("data-portalid");//No I18N
		if(portal_id == undefined){
			const $a = jQuery(a) 
			if($a.attr("id") == "chat-cs-detail" || $a.attr("id") == "open_info"){
				portal_id = $a.attr("data-portalid");
			}
			else if ($a.parent().attr("id") == "all-channels-data"){
				portal_id = $a.parent().attr("data-portalid");
			}
		}
		let url = "/channels/" + channelId; //No I18N
		let input_data ={};
		input_data.exclude_fields=["users"];
		url = chtload.appendPortalParam(url, portal_id);
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "GET", //No I18N
			input: input_data
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				jQuery('body').append('<div id="channel-details"></div>');
				var input = { "response": response.channel, "userId": String(sdp_user.LOGGEDIN_USERID), "show_back_nav": showBackNav }//No I18N
				let $channelDetailsConaiter = jQuery("#channel-details");
				$channelDetailsConaiter.show().panelSlider({
					width: 900,
					header: false,
					placement: chat_util.getChannelInfoPopupDirection(),
					dialogClass: "tabui-rightpanel channel-dialog", // NO I18N
					modal: true,
					open: function () {
						function codeblock() {
							renderhbs('#channel-details', 'channel-details-slider', input, false, 'chat/Common/Channel'); // NO I18N
							initTooltip('#channel-details'); // NO I18N
							if (input.response.is_active_member) {
								// loadChatHistory
								sdp_channels.loadChatinChannelDetails($channelDetailsConaiter.find("#recentconv"));
							}
						}
						if (!sdp_chat.common_channel_hbs) {
							ResourceLoader({
								js: ["/scripts/hbs-template-common-channel.js"], // No I18N
								success: function () { sdp_chat.common_channel_hbs = true; codeblock(); }
							});
						}
						else { codeblock(); }
					},
					close: function () {
						$channelDetailsConaiter.remove();
						if(jQuery('.ui-dialog').length <1) {
							jQuery('body').removeClass('subheader-of-h'); // NO I18N
						}
					}
				});
			}
		});
	},

	//method to return to all-chanenls tab from channel details tab
	backtochannellist:function(a) {
		if (a.id == "chatcloseslider1") {
			sdp_channels.closehbsdialog(jQuery("#channel-details"));
			sdp_channels.closehbsdialog(jQuery("#chat-slider-div"));
		}
		else {
			sdp_channels.closehbsdialog(jQuery("#channel-details"));
		}
	},

	//render permissions of the channel (common method)
	loadpermissionspage:function(a) {
		const channelId = a.getAttribute("data-channelid");
		const portalid = jQuery(a).closest("#chat-cs-detail").attr("data-portalid");//No I18N
		let url = `/channels/${channelId}/permissions`;
		url = chtload.appendPortalParam(url,portalid);
		let ajax_data = chat_util.constructAjaxData({
			url: url, 
			type: "GET" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				renderhbs('#permissionconv', 'channel-details-permissions', response, false, 'chat/Common/Channel'); // NO I18N
				jQuery("#permissionstablediv").addClass("opac5 ptr-ev-none");
			}
		});
	},

	//continue chat option from channel details
	openChannelChat:function(a) {
		const chatID = a.getAttribute("data-chat-id");
		sdp_channels.closehbsdialog(jQuery("#channel-details"));
		sdp_channels.closehbsdialog(jQuery("#chat-slider-div"));
		chtload.openRecentChat(chatID);
		chat_box.focusChatTextArea(chatID);
	},

	//render the chat in the chanenl details page
	loadChatinChannelDetails:function(a) {
		const chatID = a[0].getAttribute("data-chat-id");
		let url = `/chats/${chatID}/messages`;
		var ajax_data = chat_util.constructAjaxData({
			url: url,
			type:"GET",//No I18N
			input:{"list_info":{"row_count":25,"sort_field":"time","sort_order":"desc","search_criteria": [{ "field": "type", "value": "action", "condition": "is not", "logical_operator": "and" }]}}//No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				if(response.messages.length >0){
					chat_util.processmessages(chatID, response.messages, true, false, false, false, true);
					chat_util.reinitateATP(jQuery("#chat-cs-detail").find("#recentconv"),"channel-details"); //No I18N
				}
				if(jQuery("#recentconv").find("#user_chat_mesg").length < 1){
					sdp_channels.addNoConversationDiv();
				}
			}
		});
	},

	//construct no conversation div 
	addNoConversationDiv : function(){
		let $chat_obj = jQuery("#chat-cs-detail").find("#recentconv");
		$chat_obj.html('<div class="align-vh-center"><p class="text-color3 mt-50">'+translate("sdp.requests.listview.notifications.noconv.title")+'</p></div>');
	},

	//add participants to channel 
	addParticipantsToChannel:function(a, from) {
		let chatID = null;
		let channel_type = null;
		let apiEntity = "add_users";//No I18N
		let isUser = true;
		if (from == "actions") {
			chatID = a.closest("ul").getAttribute("data-chat-id");//NO I18N
			channel_type = a.closest("div.chatbar-maincontent").getAttribute("data-channel-type");//NO I18N
		}
		if (from == "members_list") {
			chatID = a.getAttribute("data-chatid");
			channel_type = a.closest("div#memberstate").getAttribute("data-channel-type");//NO I18N
		}
		if (channel_type == "team") {
			apiEntity = "add_technicians" //No I18N
			isUser =false;
		}
		if (chatID != null && channel_type != null) {
			let options = {};
			options.popupfor = "searchuser";//No I18N
			options.module = "chat";//No I18N
			options.isUser = isUser;
			options.apiModule = "chats";//No I18N
			options.apiModuleId = chatID;
			options.apiEntity = apiEntity;
			let queryParam = new URLSearchParams(options);
			var newWindowMode = undefined;	// var introduced for MSP
			if(window.checkIfMSP()) {
				newWindowMode = "callback";	//No I18N
			}
			// parameters extended and opened window retrieved for MSP
			var addParticiapantsWin = NewWindow("/setup/UsersPopup.jsp?" + queryParam, 'selectuser', '1200', '600', 'yes', 'center', undefined, undefined, newWindowMode); // No I18N
			if(window.checkIfMSP()) {
				addParticiapantsWin.addEventListener("load", function(event) {
					addParticiapantsWin.getCustomAccID = function(url){
						return 0;	// get All Account users to add to chat
					}
				});
			}
		}
	},

	//archive channel 
	archiveChannel:function(a, from) {
		const channelID = jQuery(a).attr("data-channelid");
		const note = jQuery(a).parents().find("#notetext").val();
		const portal_id = jQuery(a).attr("data-portalid");
		sdp_channels.closehbsdialog(jQuery(a).closest("#archive-note"));//No I18N
		let input_data = { "archive_note": note }//No I18N

		let url = "/channels/" + channelID + "/_archive";// NO I18N	
		url = chtload.appendPortalParam(url, portal_id);
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "PUT", // No I18N
			input: input_data
		});

		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {

				window.showalert('success', e_html(response.response_status.messages[0].message), "isAutoHide=true"); // No I18N
				sdp_channels.closehbsdialog(jQuery("#channel-details"));
			}
		});
	},

	//opens the archive note dialog to get archieve note required to archive a channel(common method for actions and details page)
	getarchivenote:function(a, from) {
		let chatID;
		let channelId;
		let portal_id;
		if (from == 'details') {
			var $cs_detail = jQuery(a).closest("#chat-cs-detail");//No I18N
			chatID = $cs_detail.attr("data-chat-id");//No I18N
			channelId = $cs_detail.attr("data-channelid");//No I18N
			portal_id = $cs_detail.attr("data-portalid")
		}
		else if (from == 'actions') {

			chatID = jQuery(a).closest('ul').attr("data-chat-id");
			channelId = jQuery(a).closest('ul').attr("data-channel-id");
			portal_id = jQuery(a).parents().closest(".chatbar-maincontent").attr("data-portalid");//No I18N
		}
		jQuery('body').append('<div id="archive-note"></div>');
		let $archiveNoteContainer = jQuery('#archive-note');
		$archiveNoteContainer.dialog({
			'modal': true,//NO I18N
			'title': translate("channel.archive.note"),//NO I18N
			'top': '20',//NO I18N
			'width': 800,//NO I18N
			'height': 500,//NO I18N
			'position': { my: "center", at: "center", of: window },//NO I18N
			'resizable': false,//NO I18N
			'draggable': true,//NO I18N
			'closeOnEscape': true, //NO I18N
			open: function (event, ui) {

				let ele = jQuery(event.target);
				ele.css({ 'height': '100%' });// No I18N
				const input_data = { "chatID": chatID, "from": from, "channelId": channelId, "portal_id": portal_id };//No I18N
				if (!sdp_chat.common_channel_hbs) {
					ResourceLoader({
						js: ["/scripts/hbs-template-common-channel.js"], // No I18N
						success: function () {
							sdp_chat.common_channel_hbs = true;
							renderhbs('#archive-note', 'archive-note-tab', input_data, true, 'chat/Common/Channel'); // NO I18N
						}
					});
				}
				else {
					renderhbs('#archive-note', 'archive-note-tab', input_data, true, 'chat/Common/Channel'); // NO I18N 
				}

			},
			close: function (event, ui) {
				$archiveNoteContainer.remove();
				if(jQuery('.ui-dialog').length <1){
					jQuery('body').removeClass('of-h'); // NO I18N
				}
			}
		});

	},

	//delete a channel (common method from both details and actions page)
	deletechannel:function(a, from) {
		let channelID,title,portal_id;
		if (from == "details") {
			var $cs_detail = jQuery(a).closest("#chat-cs-detail");//No I18N
			channelID = $cs_detail.attr("data-channelid");//No I18N
			title = $cs_detail.attr("data-title");//No I18N
			portal_id = $cs_detail.attr("data-portalid");//No I18N
		}
		else if (from == "actions") {
			const $chatBox = jQuery(a).parents().closest(".chatbar-maincontent"); // NO I18N
			channelID = jQuery(a).closest('ul').attr("data-channel-id");
			var chatId = jQuery(a).closest('ul').attr("data-chat-id");
			title = $chatBox.find("#chatbox-title").text();
			portal_id = $chatBox.attr("data-portalid");//No I18N
		}
		var $details = jQuery("#channel-details");
		function confirmdelete(boo, btn) {
			if (boo) {
				if (btn == 'submitButton') {
					let url = "/channels/" + channelID + "/_trash";// NO I18N	
					url = chtload.appendPortalParam(url, portal_id);
					let ajax_data = chat_util.constructAjaxData({
						url: url,
						type: "PUT" // No I18N
					});

					sdpAjax(ajax_data).done(function (response) {
						if (chat_util.checkAjaxResponse(response)) {

							window.showalert('success', e_html(response.response_status.messages[0].message), "isAutoHide=true"); // No I18N
							if (from == "details") {
								sdp_channels.closehbsdialog($details);
							}
							else if (from == "actions") {
								chat_box.closeChatBox(chatId);
							}
						}
					});
				}
			}
		}
		let message = translate("channel.delete.message", [e_html(title)]);//No I18N
		// replacing the comma in the message with ASCII code since showconfirm method parse params based on comma separator.
		message = message.replaceAll(",","&#44;");//No I18N
		showconfirm(true, 'title=' + translate("channel.confirm.delete") + ',message=<div class="wb-bw max-w550px">'+ message +'</div> , submitbutton=' + translate("sdp.common.ok") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', confirmdelete,true);	//No I18N			

	},

	//Loads pin messages in the pinned messages tab
	loadPinMessages:function($target, messages,chatID) {

		messages.forEach(function(item, index, arr) {

			let day_based_time = item.pinned_time.display_value;
			let userId = item.message.user.id;
			let message = item.message;
			let username = item.message.user.name;
			let txt = message.text;
			let type = message.type;
			let chat_infoid = item.message.id;
			let timestamp = item.pinned_time.value;
			let pin_id = item.id;
			let fdate = sdp_channels.formatDate(day_based_time);
			let msg_time = fdate.split('||')[1];
			let day = fdate.split('||')[0];
			let msgtype = "received"; // NO I18N
			if (userId == sdp_user.LOGGEDIN_USERID) {
				username = translate("common.common.you");
				msgtype = "sent";// NO I18N
			}
			let can_pin = true;
			if(sdp_chat.active_channelactions.hasOwnProperty(parseInt(chatID))){
				can_pin = sdp_chat.active_channelactions[chatID].includes("pin_message");
			}
			const input_data = { "timestamp": timestamp, "chat_infoid": chat_infoid, "userid": userId, "cont": false, "new_time": msg_time, "type": "text", "sdp_user": sdp_user, "username": username, "need_pin": can_pin,"msgtype":msgtype };//No I18N
			renderhbs($target, 'message', input_data, true, 'chat/Common/Chat'); // NO I18N
			const $template = $target.children().last();
			$template.attr("from", "pinnedmessages");
			$template.find("[data-name=replyToIcon]").remove();
			$template.addClass("isPinned");
			const $unpinDiv = $template.find("[data-name=pinIcon]");
			$unpinDiv.attr("title", translate("sdp.common.unpin"));
			$unpinDiv.find("span").removeClass("cspr icon-sm pin-grey1").addClass("cspr icon-sm unpin-grey");
			$template.attr("data-pin-id", pin_id);

			var $time_separator = $target.find("span:contains('" + day + "')");
			var time_separator_html = '<div class="chat-msgdate mb15 mt15 tc"><span>' + day + '</span></div>';
			if ($time_separator.length < 1) {
				$target.append(time_separator_html);
			}
			$template.appendTo($target);
			if ($target != undefined) {
				$target.scrollTop($target.get(0).scrollHeight);
			}
			//For creating hyperlinks
			chat_util.createHyperlinks(txt, $template, type);
			//For creating mentions
            if(type == 'text' && message.mentions != null && message.mentions.length > 0) {
				chat_util.updateMentionsInMsg($template.find('[data-name="chat-reqques"] span'), message.mentions,"html"); //No I18N
            }
			$sdEventListener($template);
		});
		$target.find("[data-type=userProfile]").each(function () {
			if (sdp_user.USERTYPE !== "Requester") {
				const userId = this.dataset.userid;
				jQuery(this).off("click.userProfile").on("click.userProfile", function () { //No I18N
					$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userId+'&minContent=true&externalframe=true', translate('sdp.inventory.wsRtPanel.userDetails'), '600px'); //No I18N
				});
			} else {
				const $span = jQuery(this).find("span");
				$span.removeClass();
				$span.addClass("sb text-color1 p0 cur-def");
			}
		});
	},
	//exit from pinnedmessages tab and open the chat box 
	exitPinnedMessages:function(a) {

		const chatId = jQuery(a).closest("div.chatbar-maincontent")[0].getAttribute("id");//No I18N
		chat_box.closeChatBox(chatId);
		chtload.openRecentChat(chatId);
	},
	//methid to format the date based on the day
	formatDate:function(dateString) {
		let date = new Date(dateString);
		const tod = new Date();
		const yesterday = new Date(tod.setDate(tod.getDate() - 1));
		let options = { hour: 'numeric', minute: 'numeric' };//No I18N
		let today = new Date();

		if (date.toDateString() === today.toDateString()) {
			return translate("sdp.common.today") + '||' + date.toLocaleTimeString('en-US', options);//No I18N
		} else if (date.toDateString() === yesterday.toDateString()) {
			return translate("sdp.common.yesterday") + '||' + date.toLocaleTimeString('en-US', options);//No I18N
		} else {
			return dateString;
		}
	},

	//initiate table component for both archived and trashed channels(common method)
	listarchivedanddeletedChannels:function(type) {
		let title,$el,filter_name;
		if (type == 'archived') {
			title = translate("channel.archived.channels")
			jQuery('body').append('<div id="archived-channels"></div>');
			$el = "#archived-channels";//No I18N
			filter_name = "my_archived"//No I18N
		} else if (type == 'deleted') {//No I18N
			title = translate("channel.deleted.channels");
			jQuery('body').append('<div id="deleted-channels"></div>');
			$el = "#deleted-channels";//No I18N
			filter_name = "my_trashed";//No I18N
		}
		let $channelsContainer= jQuery($el);
		$channelsContainer.dialog({
			'modal': true,//NO I18N
			'title': title,//NO I18N
			'width': 1000,//NO I18N
			'height': 'auto',//NO I18N
			'position': { my: "center top+50", at: "center top+50", of: window },//NO I18N
			'resizable': false,//NO I18N
			'draggable': true,//NO I18N
			'closeOnEscape': true, //NO I18N
			open: function (event, ui) {
				const ele = jQuery(event.target);
				let actionButton ="";
				if (type == 'archived') {
					actionButton = '<button type="button" data-name="actionBtn" data-link="channels" class="btn btn-primary fl mr10 btn-sm" disabled >' + translate("channel.unarchive") + ' </button>'; //NO I18N
				}
				else if (type == "deleted") {
					actionButton= '<button type="button" data-name="actionBtn" data-link="channels" class="btn btn-primary fl mr10 btn-sm" disabled data-i18n="sdp.requests.restorerequests" >' + translate("sdp.requests.restorerequests") + '</button>';//NO I18N
				}
				ele.append('<div class="listview task-list-wrap fw" style="border:none;"> <div class="listcontrols pl10 pr10"> <div id="bulk_selection_channels"></div>'+actionButton+'<div id="t_searchicon_channels" class="fl"></div> <div id="pagination_comp_channels" class="fl"></div> </div> <div id="channels_div" class="tablelist"></div> </div>');
				ele.find("[data-name='actionBtn']").on("click.restoreChannel",function(){//NO I18N
					sdp_channels.restoreChannels(this);
				});
				var header_metadata = {
					"channels_head_chk": { //No I18N
						"type": "checkbox",//No I18N
						"default": true//No I18N
					},
					"name": { // No I18N
						"text": getMessageForKey("channel.name") // No I18N
					},
					...(type === "archived" ? {//No I18N
						"created_by": {//No I18N
							"name": "created_by",//No I18N
							"value_path": "created_by.name",//No I18N
							"text": getMessageForKey("common.createdby") //No I18N
						}
					}: {
						"created_by": {//No I18N
							"name": "created_by",//No I18N
							"value_path": "created_by.name",//No I18N
							"searchable": false,//No I18N
							"sortable": false,//No I18N
							"text": getMessageForKey("common.createdby") //No I18N
						}
					}),
					"created_time": {//No I18N
						"name": "created_time",//No I18N
						"type": "date-time",//No I18N
						"text": getMessageForKey("custom.created_time")//No I18N
					},
					...(type === "archived" ? {//No I18N
					        "archive_note": {//No I18N
					            "name": "archive_note",//No I18N
					            "value_path": "archive_note",//No I18N
					            "text": getMessageForKey("channel.archive.note")//No I18N
					        }
					    } : {})
				};
				
				let list_info = { "list_info": { "start_index": "1", "row_count": "10", "get_total_count": true, "filter_by": { "name": filter_name } }};//No I18N
				let table_info = JSON.parse(sdpToJSON(list_info));
				table_info.fields_required = { "name": "", "created_by": "", "created_time": "", ...(type === "archived" ? { "archive_note": "" } : {}) };//No I18N
				let row_data = JSON.parse(sdpToJSON(list_info));
				row_data.fields_required = (type === "archived")? ["name", "created_by", "created_time", "archive_note"]: ["name", "created_by", "created_time"]; //No I18N
				let table_content = { "header": header_metadata };//No I18N
				let options = {
					callbackURL: "channels",//No I18N
					entity_name: "channels",//No I18N
					tableHolder: "channels",//No I18N
					paginationEnabled: true,
					getmetaInfo: false,
					bulkSelectionSetting: true,
					isODAPI : true,
					searchEnabled: true,
					sortingEnabled: true,
					columnChooserEnabled: false,
					multiDeleteEnabled: true,
					staticHeader : true,
					height : 300,
					width : 995,
					listSettingOptions: {
						enableSettings: ["sorting", "record_per_page"]//No I18N
					},
					row_inputdata: row_data,
				}
				let usersTable = new tableComponent(table_info, table_content, options);
			},
			close: function (event, ui) {
				$channelsContainer.remove();
			}
		});
	},

	//method to restore channels from the table components specifically (not from details page)
	restoreChannels:function(a) {
		const $body = jQuery(a).parents().find("#channels_div").children().find("#channels_body");
		let ids = [];
		jQuery.each($body.children(), function () {
			let _this = jQuery(this);
			if (_this.hasClass('selected-row')) {
				ids.push(_this.attr('data-entityid'));
			}
		});

		///////////////////////////////////////BULK RESTORE CALL //////////////////////////////////

		let url = "/channels/_restore?ids=" + ids.join(',');// NO I18N	
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "PUT", // No I18N
			data: function () {
				return { "ids": ids };//No I18N
			},
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				window.showalert('success', translate("channel.restored.channels"), "isAutoHide=true"); // No I18N
				if (jQuery(a).parents().find("#archived-channels").length < 1) {
					sdp_channels.closehbsdialog(jQuery("#deleted-channels"));
				}
				else {
					sdp_channels.closehbsdialog(jQuery("#archived-channels"));
				}
			}
		});

		//////////////////////////////////////////////////////////////////////////////////////////////

	},

	//method to restore channel from details page specifically
	restoreChannel:function(a) {

		const channelId = jQuery(a).parents().closest("#chat-cs-detail").attr('data-channelid');//No I18N
		const $details = jQuery(a).parents().closest("#channel-details");//No I18N
		const url = "/channels/" + channelId + "/_restore";// NO I18N	
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "PUT"//No I18N
		});

		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {

				window.showalert('success', response.response_status.messages[0].message, "isAutoHide=true"); // No I18N
				sdp_channels.closehbsdialog($details);
			}
		});
	},

	//Pin or unpin a message from chatbox
	pinUnpinMessage:function(a, from_pinned) {
		if (!from_pinned) {
			const $msg = jQuery(a).closest("#user_chat_mesg");//No I18N
			const from = $msg.attr("from");
			const $maincont = $msg.closest("div.chatbar-maincontent");//No I18N
			const chatId = $maincont.attr("id");//No I18N
			const portalid = $maincont.attr("data-portalid");//No I18N
			const chat_infoid = $msg.attr("data-chat_infoid");
			const $pin_div = jQuery(a).closest("div.chat-wrapcont").siblings(".pin-msg");//No I18N
			
			if (!$msg.hasClass("isPinned")) {
				let input_data = {
					"pin_message": {// No I18N
						"message": {// No I18N
							"id": chat_infoid//No I18N
						}
					}
				};
				let url = `/chats/${chatId}/pin_messages`;
				url = chtload.appendPortalParam(url,portalid)
				let ajax_data = chat_util.constructAjaxData({
					url: url,
					type: "POST", // No I18N
					input: input_data
				});

				sdpAjax(ajax_data).done(function (response) {chat_util.checkAjaxResponse(response)});
			}
			else {
				var pin_id = $msg.attr('data-pin-id');
				let url = `/chats/${chatId}/pin_messages/${pin_id}`;
				url = chtload.appendPortalParam(url,portalid)
				var ajax_data = chat_util.constructAjaxData({
					url: url,
					type: "DELETE" // No I18N
				});
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						if(from == "pinnedmessages"){
							if ($msg.prev().hasClass('chat-msgdate') && $msg.next().hasClass('chat-msgdate')) {
								$msg.prev().remove();
							}
							$msg.remove();
							let remainMsgs = $maincont.find("#user_chat_mesg").length;
							if(remainMsgs == 0){
								sdp_channels.exitPinnedMessages($maincont.find(".chat-content-wrapper"));
							}
						}
					}
				});
			}
		}
		else {
			var $pin = jQuery(a).closest("div.alert");//No I18N
			var $pin_div = $pin.closest("#chat-pin-msg");//No I18N
			var pin_id = $pin.attr("data-pin-id");
			var chat_infoid = $pin.attr("data-chatinfo-id");
			var chatId = $pin.closest("div.chatbar-maincontent").attr("id");//No I18N
			var url = "/chats/" + chatId + "/pin_messages/" + pin_id;// NO I18N	
			var ajax_data = chat_util.constructAjaxData({
				url: url,
				type: "DELETE" // No I18N
			});
			sdpAjax(ajax_data).done(function (response) {chat_util.checkAjaxResponse(response)});
		}
		initTooltip('.pin-msg');//No I18N
	},

	//method to load the pin messages on top of messages in chat-box
	showpinmessages:function(chatID, messages) {
		let ids = []
		messages.forEach(function (item, index, arr) {
			ids.push({ "chatinfo_id": item.message.id, "pin_id": item.id })
		});
		if (!sdp_chat.chatPinMessages.hasOwnProperty(chatID)) {
			sdp_chat.chatPinMessages[chatID] = ids;
		}
		const chatbox = jQuery("#" + chatID + ".chatbar-maincontent")
		const $pin_div = chatbox.children().find(".pin-msg");
		messages.sort((a, b) => a.pinned_time.value - b.pinned_time.value);
		let len = 25;
		if (messages.length < 25) {
			len = messages.length;
		}
		for (let i = 0; i < len; i++) {
			let can_pin = true;
			if(sdp_chat.active_channelactions.hasOwnProperty(parseInt(chatID))){
				can_pin = sdp_chat.active_channelactions[chatID].includes("pin_message");
			}
			let msg = messages[i].message.text;
			input_data = { "message": msg, "chat_infoid": messages[i].message.id, "pin_id": messages[i].id, "start_time": messages[i].pinned_time.value, "by": messages[i].pinned_by,"can_pin":can_pin };// NO I18N
			renderhbs($pin_div, 'pin-message', input_data, true, 'chat/Common/Chat'); // NO I18N
			let $template = $pin_div.find("div[data-chatinfo-id=" + messages[i].message.id + "]").find("span.msg");
			if (messages[i].message.mentions && messages[i].message.mentions.length > 0) {
				chat_util.updateMentionsInMsg($template, messages[i].message.mentions, "text");
			}
			if(i>1){
				$pin_div.children().last().addClass("hide");
			}
		}
		if(messages.length >=1){
			$pin_div.removeClass("hide");
		}else{
			$pin_div.addClass("hide");
		}
		$pin_div.attr("pin-count", messages.length)
		sdp_channels.alignPinMessages($pin_div,"show"); //No I18N
	},

	//Handle websocket calls for pin messages
	handlePinMessages:function(message, type) {
		const msg_obj = JSON.parse(message.message);
		const chatID = message.id;
		let chat_infoid;
		const $pin_div = jQuery("#sdp-chat-bar").find("#" + chatID).find("div.pin-msg");
		const pin_id = msg_obj.id;
		if(msg_obj.message == undefined){chat_infoid = msg_obj.id}else{chat_infoid = msg_obj.message.id;}
		
		if (type == "new_pin") {

			if (sdp_chat.active_chatids.includes(chatID)) {

				const new_count = parseInt($pin_div.attr("pin-count"))+1;
				$pin_div.attr("pin-count", new_count);
				if(new_count >=1){
					$pin_div.removeClass("hide");
				}

				let can_pin = true;
				if(sdp_chat.active_channelactions.hasOwnProperty(parseInt(chatID))){
					can_pin = sdp_chat.active_channelactions[chatID].includes("pin_message");
				}
				let msgStr = msg_obj.message.text;
				input_data = { "message": msgStr , "chat_infoid": chat_infoid, "pin_id": pin_id, "start_time": msg_obj.pinned_time.value, "by": msg_obj.pinned_by,"can_pin":can_pin };//No I18N
				renderhbs($pin_div, 'pin-message', input_data, true, 'chat/Common/Chat'); // NO I18N
				if (msg_obj.message.mentions && msg_obj.message.mentions.length > 0) {
					chat_util.updateMentionsInMsg($pin_div.find("div[data-chatinfo-id=" + chat_infoid + "]").find("span.msg"), msg_obj.message.mentions, "text");//No I18N
				}
				initTooltip("#" + chatID);
				sdp_channels.alignPinMessages($pin_div, 'add');//No I18N
				const $chat_wrapper = jQuery("#sdp-chat-bar").find("#" + chatID).find("div.chat-wrapcont");
				const $msg = $chat_wrapper.find("[data-chat_infoid=" + chat_infoid + "]");
				$msg.attr("data-pin-id", pin_id);
				$msg.addClass("isPinned");
				const $unpinDiv = $msg.find("[data-name=pinIcon]");
				$unpinDiv.attr("title", translate("sdp.common.unpin"));
				$unpinDiv.find("span").removeClass("cspr icon-sm pin-grey1").addClass("cspr icon-sm unpin-grey");
				let ids = { "chatinfo_id": chat_infoid, "pin_id": pin_id};//No I18N
				sdp_chat.chatPinMessages[chatID].push(ids);
			}
		}
		else if (type == "deleted_pin") {
			if (sdp_chat.active_chatids.includes(chatID)) {
				let new_count = parseInt($pin_div.attr("pin-count")) - 1;
				jQuery.each($pin_div.children(), function () {
					if (this.getAttribute("data-chatinfo-id") == msg_obj.id) {
						this.remove();
					}
				});
				sdp_channels.alignPinMessages($pin_div, 'remove');//No I18N
				const $chat_wrapper = jQuery("#sdp-chat-bar").find("#" + chatID).find("div.chat-wrapcont");
				const $msg = $chat_wrapper.find("[data-chat_infoid=" + chat_infoid + "]");
				$msg.removeAttr("data-pin-id");
				$msg.removeClass("isPinned");
				const $pinDiv = $msg.find("[data-name=pinIcon]");
				$pinDiv.attr("title", translate("sdp.common.pin"));
				$pinDiv.find("span").removeClass("cspr icon-sm unpin-grey").addClass("cspr icon-sm pin-grey1");
				var ids = sdp_chat.chatPinMessages[chatID].find(x => x.pin_id == pin_id);
				sdp_chat.chatPinMessages[chatID].splice(ids, 1);
				new_count = parseInt(sdp_chat.chatPinMessages[chatID].length);
				$pin_div.attr("pin-count", new_count);
				if (new_count == 0) {
					$pin_div.addClass("hide");
				}
				else {
					$pin_div.removeClass("hide");
				}
			}
		}

	},

	//method to copy link to clipboard which opens channel-details
	copyLinktoclipboard:function(a) {
		const channelId = jQuery(a).closest('ul').attr("data-channel-id");
		const portalId = jQuery(a).closest('.chatbar-maincontent').attr("data-portalid");
		//Copy link has been changed from ${window.location.origin} to ALIAS_URL as a part of sdp-FOESM issue
        const link = `${window.location.protocol}//${sdp_app.ALIAS_URL}/ui/home?action=view_channel&channelId=${channelId}&portalId=${portalId}`;
		let temp = document.createElement("textarea");//No I18N
		temp.textContent = link;
		temp.style.position = "fixed";
		document.body.appendChild(temp);
		window.getSelection().selectAllChildren(temp);
		document.execCommand("copy"); //No I18N
		document.body.removeChild(temp);
		showalert('success', translate("msteams.copied"), 'isAutoHide=true');//No I18N
	},

	//methiod to align pin messages in the chatbox'
	alignPinMessages:function(a, type) {

		const $pin_div = jQuery(a);
		const chatId = $pin_div.attr("data-chat-id");
		const height = jQuery("#sdp-chat-bar").find("#" + chatId).find(".chat-wrapcont").height();
		let new_height;
		if (type == 'add') {
			new_height = height - 30;
		}
		else {
			new_height = height + 30;
		}
		jQuery("#sdp-chat-bar").find("#" + chatId).find(".chat-wrapcont").height(new_height);

		//display only 2 pins 
		let $children = $pin_div.children();
		$children.addClass("hide");
		$children.eq(0).removeClass("hide");
		$children.eq(1).removeClass("hide");


		//Align more tags
		const more_tag = `<span class="text-link text-overflow cur-ptr" role="button" data-name="morePinMsgs" data-pcount="pin"><span>${translate("sdp.common.more")}</span></span>`;
		const pins = $children.length;
		if(pins > 0){
			$children.find('.text-link').remove();
		}
		if(pins > 2){
			$children.eq(1).append(more_tag);
			$children.find("[data-name=morePinMsgs]").on("click.pinMsgs",function(){
				chat_actions.viewPinMessages(this);
			});
		}
	},

	//method to show a temporary chat action based on websockets
	showTemporaryChatAction:function(message, type) {
		const chatID = message.id;
		const timestamp = message.time;
		const msg = JSON.parse(message.message);
		var users;
		let txt;
		if (type == "archived_channel") {
			let messageBy = (message.from == sdp_user.LOGGEDIN_USERID)? translate("sdp.common.you") : msg.by;// No I18N
			messageBy = sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(parseInt(message.from), messageBy) : e_html(messageBy);// No I18N
			txt = translate("chat.action.channel.archive", [messageBy]);
		}
		else if (type == "trashed_channel") {
			let messageBy = (message.from == sdp_user.LOGGEDIN_USERID)? translate("sdp.common.you") : msg.by;// No I18N
			messageBy = sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(parseInt(message.from), messageBy) : e_html(messageBy);// No I18N
			txt = translate("chat.action.channel.trash", [messageBy]);
		}
		else if (type == "edited_channel"){
			let messageBy = (message.from == sdp_user.LOGGEDIN_USERID)? translate("sdp.common.you") : msg.by_user.name;// No I18N
			messageBy = sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(parseInt(message.from), messageBy) : e_html(messageBy);// No I18N
			txt = translate("chat.action.info.edited", [messageBy]);
		}
		else if (type == "bulk_add_members") {
			var text = [];
			users = msg.users;
			users.forEach(function(item, index, arr) {
				let username = item.name;
				const userid = item.id;
				username = username == sdp_user.USERNAME ? translate("sdp.common.you") : username;// No I18N
				sdp_user.USERTYPE !== "Requester" ? text.push(chat_actions.getUserHrefLink(userid, username)) : text.push(e_html(username));// No I18N
			});
			let action_by = msg.by == sdp_user.USERNAME ? translate("sdp.common.you") : msg.by;// No I18N
			var ByUser = sdp_user.USERTYPE !== "Requester" ? chat_actions.getUserHrefLink(parseInt(message.from), action_by) : e_html(action_by);// No I18N
			var addedUsers = text.join(",");
			txt = translate("chat.new.member.added.by", [ByUser, addedUsers]);
		}
		if (sdp_chat.active_chatids.includes(chatID)) {
			chat_actions.showChatNotice(chatID, txt, "archived_channel", timestamp, false);//No I18N
			if (type == "archived_channel") {
				sdp_channels.displayArchiveNoteinChatbox(chatID, msg.archive_note);
			}
			if (type == "bulk_add_members") {
				const channelId = msg.channel_id;
				const usercount = jQuery("#sdp-chat-bar").find("#" + chatID).find("#viewmembers" + channelId);
				const count = parseInt(usercount.text()) + users.length;
				usercount.text(count);
			}
			if (type == "trashed_channel") {
				chat_box.disableChatTextArea(chatID);
			}

		}

	},

	//update the channel details page when a channel info is edited (based on websocket calls)
	updatechanneldetailspage:function(message, type) {
		//update channel info in channel details page when channel info is updated
		const chatID = message.id;
		const msg = JSON.parse(message.message);
		const data = msg.ChannelObj.channel;
		const channel_name = data.name;
		const channelId = msg.channel_id;
		const desc = data.description;
		let mediaId = null;
		let icon = null;
		if (data.icon !== undefined) {
			mediaId = data.icon !== null ? data.icon.id : null;
			icon = mediaId !== null ? "/api/v3/channels/" + channelId + "/images/" + mediaId : "/images/1-5-req-crm-account-profile.svg"; //No I18N
		}
		let channel_type = JSON.parse(message.message).channel_type;
		let channel_hash = channel_type === "org" ? "channel_org" : "channel_team" ;// NO I18N
		var $channel_details = jQuery("#chat-cs-detail");
		if (parseInt($channel_details.attr('data-channelid')) == parseInt(channelId)) {
			jQuery("#cd-header-title").text(channel_name);
			$channel_details.attr('data-title', channel_name);
			var $display = jQuery("#cd-disp-title");
			$display.attr('title', e_attr(channel_name));
			$display.text("# " + channel_name);
			var $desc = jQuery("#cd-desc");
			$desc.attr('title', e_attr(desc));
			$desc.text(desc);
			const $icon =  $channel_details.find(`[data-name="details-img"]`);
			let $svg =  $channel_details.find(`[data-name="details-svg"]`);
			let $icon_html=null;
			let $icon_container = $icon.length == 0 ? $svg.parents().closest(`[data-name="icon-container"]`) : $icon.parents().closest(`[data-name="icon-container"]`);// NO I18N
			if(mediaId != null){
				$icon_html = `<img id="details_icon" src="${icon}" alt="Profile Picture" class="cht-img" data-name="details-img">`
			}
			else{
				$icon_html = `<div class="cht-img"> <svg width="50" height="50" class="default-fill p5 ml3 opac5" data-name="details-svg"> <use href="#${channel_hash}"></use> </svg> </div>`
			}
			$icon_container.empty();
			$icon_container.append($icon_html);
			if($channel_details.find("#permissionconv").hasClass("active")){
				$channel_details.find("ul.nav.nav-sdtabs").find("li.active").find("a").trigger("onclick");
			}
		}

		//update channel info in chatbox if chatbox is open
		if (sdp_chat.active_chatids.indexOf(String(msg.id)) > -1) {
			let $icon_html = null;
			let $mini_header_icon_html = null;
			let $chatbox = jQuery("#sdp-chat-bar").find("#" + msg.id);
			$chatbox.attr('data-title', e_html(channel_name));
			$chatbox.find("#chat_title").text(channel_name);
			$chatbox.find("#chatbox-title").attr('title', e_html(channel_name));
			$chatbox.find("#chatbox-title").text(channel_name);
			$chatbox.find("#viewmembers" + channelId).attr('title', e_html(channel_name));
			let $headr_icon_container = $chatbox.find(".chat-header1 .chat-dp");
			let $miniheadr_icon_container = $chatbox.find(".chat-mini-header .chat-dp");
			if(mediaId != null){
				$icon_html = `<img id="header_icon" src="${icon}" alt="Profile Picture"> <span class="chat-channel-hash"> <svg width="10" height="10" class="thmicon-fill"> <use href="#${channel_hash}"></use> </svg> </span> `;
				$mini_header_icon_html = `<img id="miniheader_icon" src="${icon}" alt="Profile Picture"> <span class="chat-channel-hash"> <svg width="8" height="7" class="thmicon-fill"> <use href="#${channel_hash}"></use> </svg> </span> `;
			}
			else{
				$icon_html =`<div class="chat-no-dp"> <svg width="20" height="20" class="thmicon-fill"> <use href="#${channel_hash}"></use> </svg> </div>`;
				$mini_header_icon_html =`<div class="chat-no-dp"> <svg width="12" height="12" class="thmicon-fill"> <use href="#${channel_hash}"></use> </svg> </div>`;
			}
			$headr_icon_container.empty();
			$headr_icon_container.append($icon_html);
			$miniheadr_icon_container.empty();
			$miniheadr_icon_container.append($mini_header_icon_html);
		}

		//update in the channels list if open 
		if (jQuery("#channels-bar").closest("li").hasClass("active")) {
			let $li = jQuery("#channellist").find("li[data-chat-id='" + chatID + "']");
			$li.remove();
			$list = jQuery("#channellist");
			let li_icon = { "content-url": icon }; //NO I18N
			if (mediaId == null) {
				li_icon = null;
			}
			var input_data = { "response": { "channels": [{ "chat": { "id": chatID }, "icon": li_icon, "description": desc, "name": channel_name, "type": msg.channel_type }] } };// No I18N
			renderhbs('#channellist', 'channels-tab-data', input_data, true, 'chat/Common/Chat');// NO I18N
			const $element = $list.children().last();
			$list.children().last().remove();
			$list.prepend($element);
			initTooltip('#channellist'); //NO I18N
		}
		//update in the all-channels-data if open
		if(jQuery("#chat-cs-list").length >0){
			let $li= jQuery("#all-channels-data").find(`li[data-channelid='${channelId}']`);
			let name_title = `<span class='maxw-250px wb-bw'>${e_html(channel_name)}</span>`;
			let dec_title = `<span class='maxw-250px wb-bw'>${e_html(desc)}</span>`;
			let $name = $li.find(`[data-name="name_tag"]`);
			let $desc = $li.find(`[data-name="desc_tag"]`);
			let $icon= $li.find(`[data-name="icon_tag"]`);
			let $svg = $li.find(`[data-name="svg_tag"]`);
			$name.attr("title",name_title);
			$name.text(channel_name);
			$desc.text(desc);
			$desc.attr("title",dec_title);
			let $icon_html=null;
			let $icon_container = $icon.length == 0 ? $svg.parents().closest(".chat-dp") : $icon.parents().closest(".chat-dp");// NO I18N
			let channel_type = JSON.parse(message.message).channel_type;
			let channel_hash = channel_type === "org" ? "channel_org" : "channel_team";// NO I18N
			if(mediaId != null){
				$icon_html = `<img src="${icon}" data-name="icon_tag" alt="Profile Picture"><span class="chat-channel-hash"> <svg width="10" height="10" class="thmicon-fill"> <use href="#${channel_hash}"></use> </svg> </span>`
			}
			else{
				$icon_html = `<div class="chat-no-dp"> <svg width="22" height="22" class="thmicon-fill ml1" data-name="svg_tag"> <use href="#${channel_hash}"></use> </svg> </div>`
			}
			$icon_container.empty();
			$icon_container.append($icon_html);
			
		}
	},

	//method to render chat actions again when necessary
	renderchatactions:function(msg, type) {
		const chatId = msg.id;

		if (sdp_chat.active_chatids.includes(chatId)) {
			var msgObj = JSON.parse(msg.message);
			const channelId = msgObj.channel_id;
			const $chatbox = jQuery("#sdp-chat-bar").find("#" + chatId);
			const title = msgObj.channel_name;
			if ($chatbox.find('.input-group').find('.input-group-addon').length < 1) {
				$chatbox.find('textarea').removeAttr('disabled');
				$chatbox.find('.input-group').prepend('<label class="input-group-addon m0 disp-c cur-ptr" data-i18n-title="common.add.attachment"> <span class="cspr paperclip icon-sm opac5"></span> <input type="file" class="chatattachimgid hide" data-name="chatattachimg" aria-label="chatattachimg"> </label>'); //No I18N
				$chatbox.find("[data-name=chatattachimg]").on("change.chatBox",function(event){// NO I18N
					chat_actions.chatattachimgfn(event,this);
				});
			}

			if (type == "restored_channel") {
				if ($chatbox.find("div.chattxt").attr("contenteditable") == undefined) {
					const $Textbox = '<div class="input-group date"> <label class="input-group-addon m0 disp-c cur-ptr" data-i18n-title="common.add.attachment"> <span class="cspr paperclip icon-sm opac5"></span> <input type="file" class="chatattachimgid hide" data-name="chatattachimg" aria-label="chatattachimg"> </label> <div id="chat_input-'+chatId+'" class="chattxt form-control oya" aria-label="chatentertext" data-name="input_chat_msg" contenteditable="true" data-chatid="' + chatId + '"></div> </div>';
					const $element = '<div class="sdmenu bs-noconflict sdmenuup fr mt-5 mb3 open"><div class="btn btn-xs sdmenu-toggle a-tag " id="actions_link" data-switch="sdmenu" aria-expanded="true"> <span data-i18n="sdp.common.actions">Actions</span><span class="caret ml5"></span> </div><ul id="actions-' + chatId + '" style="width: 260px;" class="sdmenu-dd sdmenu-dd-right" data-chat-id="' + chatId + '" data-channel-id="' + channelId + '" aria-labelledby="replymenu"> </ul> </div>';
					const $replyToElement = '<div class="chat-reply-panel hide" data-name="replyTo"><span class="cspr close3" title="'+translate("common.cancel")+'" data-name="replyToCancel" rel="uitip"></span><div class="crp-indicator"><p class="crp-user" data-name="cht-sender"></p><div data-name="cht-msg" class="cht-bw"></div></div></div>';
					$chatbox.find(".chat-quesarea").empty();
					$chatbox.find(".chat-quesarea").prepend($replyToElement);
					$chatbox.find(".chat-quesarea").prepend($element);
					$chatbox.find(".chat-quesarea").append($Textbox);
					$chatbox.find("[data-name=chatattachimg]").on("change.chatBox",function(event){// NO I18N
						chat_actions.chatattachimgfn(event,this);
					});
					$chatbox.find("[data-name=input_chat_msg]").on("focus.chatBox",function(){// NO I18N
						chat_box.highlightChatWindow(this);
					});
					$chatbox.find("[data-name=input_chat_msg]").on("keypress.chatBox",function(event){// NO I18N
						chat_box.chatentertxt(event,this);
					});
					$chatbox.find("[data-name=input_chat_msg]").on("blur.chatBox",function(){// NO I18N
						chat_box.unhighlightChatWindow(this);
					});
					chat_actions.suggestAddMembers(chatId, true);
					chat_actions.suggestToMentionMembers(chatId);
					$chatbox.find("[data-name='replyToElem']").removeClass("opac5 cur-na").off("click.chatBox").on("click.chatBox",function(){chat_actions.replyToMessage(this)});// NO I18N
					$chatbox.find("[data-name=replyToCancel]").off("click.chatBox").on("click.chatBox",function(){chat_actions.cancelReplyToMessage(this)});// NO I18N
				}
			}
			const channelactions = sdp_chat.active_channelactions[chatId];
			const chat_type = "channel";// NO I18N
			const actions = sdp_channels.getactionsobj(chat_type, channelactions);
			const actions_data = { "actions": actions, "chat_type": chat_type, "channelId": channelId, "title": title };// NO I18N
			const $div = "#actions-" + chatId; // NO I18N
			renderhbs($div, 'chatbox_actions', actions_data, false, 'chat/Common/Chat'); // NO I18N
			if (!channelactions.includes("post_message")) {
				const $input = jQuery("#sdp-chat-bar").find("#" + chatId).find(".input-group");
				$input.find(".input-group-addon").remove();
				$input.find('textarea').attr('disabled', '').addClass("fw");
				$input.addClass("fw");
			}
			jQuery($div).parent().removeClass("open");
		}
	},

	//display archive note for archived channels in chat box
	displayArchiveNoteinChatbox:function(chatID, note) {
		const $chatBox = jQuery("#sdp-chat-bar").find("#" + chatID);
		const $Textelement = $chatBox.find(".chat-quesarea");
		if ($chatBox.find(".chat-wrapcont").hasClass("cb-noaction")) {
			$chatBox.find(".chat-wrapcont").removeClass("cb-noaction");
		}
		let toolTip = "<span class='wb-bw maxw-250px'>"+ e_html(note) +"</span>";
		const $note_element = '<div id="chatboxnote" class="bg-warning pos-rel tc cht-bx-shadow"> <div class="sb pt5">' + translate("channel.channel.archived") + '</div> <div class="cht-arc-comment" rel="uitip" mode_ellipsis="true" mode_html="true" mode_type="height" title="'+e_attr(toolTip)+'" > <span class="ml5">' + translate("channel.archive.note") + ' :</span> <span class="text-color1">' + e_html(note) + '</span> </div> </div>';
		$Textelement.empty();
		$Textelement.append($note_element);
		initTooltip('.chat-quesarea'); //No I18N
		$chatBox.find("[data-name='replyToElem']").addClass("opac5 cur-na").off("click.chatBox");// NO I18N
	},

	//Handle new channel websocket calls by adding an entry in channel stab when channels tab is open 
	handlenewchannel:function(message, type) {
		const chatId = message.id;
		var msgObj = JSON.parse(message.message);
		const portalid = msgObj.portalid;
		if(portalid !== sdp_app.PORTAL_ID){
			return;
		}
		const channel_id = msgObj.channel_id;
		const channelName = msgObj.name;
		let desc = msgObj.hasOwnProperty("description") ? msgObj.description : null;// No I18N
		if(msgObj.hasOwnProperty("icon")){
			if(msgObj.icon !== null){
				mediaId = msgObj.icon.id;
			}
			else{
				mediaId = null;
			}
		}else{ mediaId = null;}
		const channel_type = msgObj.type;
		let contenturl = mediaId !== null ? "/api/v3/channels/" + channel_id + "/images/" + mediaId : null;// No I18N
		const icon = mediaId !== null ? { "content-url": contenturl } : null;// No I18N
		if (jQuery("#channels-bar").parent('li').hasClass("active")) {
			$list = jQuery("#channellist")
			var input_data = { "response": { "channels": [{ "chat": { "id": chatId }, "icon": icon, "description": desc, "name": channelName, "type": channel_type }] } };// No I18N
			renderhbs('#channellist', 'channels-tab-data', input_data, true, 'chat/Common/Chat');// NO I18N
			const $element = $list.children().last();
			$list.children().last().remove();
			$list.prepend($element);
			$element.off("click.channelsList").on("click.channelsList", function(){ // NO I18N
				chtload.openRecentChat(chatId);
			});
			if ($list.parents().closest("#data-channel").hasClass('hide')) {
				$list.parents().closest("#data-channel").removeClass("hide");// NO I18N
				jQuery("#nodata-channel").addClass('hide');
			}

		}

	}
}
