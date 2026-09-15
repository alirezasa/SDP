// This section contains code related to the chat box/popup functionality
var chat_box = {

	/* Alligning chat popups while new chat box is poping in or out*/
	alignChatPopups: function (chatId) {
		const isRequester = sdp_user.USERTYPE === "Requester"; //No I18N
		const direction = (sdp_user.DIRECTION === "RTL") ? (isRequester ? "left" : "right") : (isRequester ? "right" : "left"); //No I18N
		var pixel = jQuery('.chatmain-column:not(".zia-chat,.telephony-log")').width();
		/*Zia chat bar enable calculate width of zia chat*/
		let ziapixel = 0;
		if (isRequester) {
			if (jQuery('.chatmain-column.zia-chat').is(":visible")) {
				ziapixel = jQuery('.chatmain-column.zia-chat').width() + 15;
			}
		}
		pixel = pixel + ziapixel;
		var style = jQuery("#sdp-chat-bar").find("#" + chatId).parents('.chat-column').attr('style');
		var fit_chats_len = Math.floor(jQuery(document).width() / pixel) - 1;
		var $obj = jQuery("#minimize_chat_bar").closest('.chatmain-column').find('.chat-mini-header li.active a'); //No I18N
		if (sdp_user.USERTYPE == "Requester" && jQuery($obj).parent().hasClass('active') == false) {
			fit_chats_len = Math.floor(jQuery(document).width() / (jQuery('#sdp-chat-bar .chat-column').width())) - 1;
		}
		if (style != undefined && style.indexOf('none') > -1) {
			jQuery("#sdp-chat-bar").find("#" + chatId).parents('.chat-column').show().css(direction, pixel + 'px');
			var $doc = jQuery(document);
			var length = 0;
			pixel = pixel + 325;

			var length1 = jQuery('body').find('.chatrow .chat-column:not(".zia-chat"):visible').length;
			for (var i = length1 - 1; i >= 0; i--) {
				var $chat_obj = jQuery('body').find('.chatrow .chat-column:not(".zia-chat"):visible:eq(' + i + ')');
				var id = $chat_obj.find(".chatbar-maincontent").attr("id");
				if (id !== chatId.toString()) {
					if (length < (fit_chats_len - 1)) {
						$chat_obj.show().css(direction, pixel + 'px'); //No I18N
					}
					else {
						$chat_obj.hide().css(direction, pixel + 'px'); //No I18N
					}
					pixel = pixel + 325;
					length = length + 1;
				}
			}
		}
	},

	/* Check if 3 chat box is present. If more than 3 do not let technician to accept or pickup a new chat. */
	threeChatboxPresent: function () {
		const len = sdp_chat.active_chatids.length;
		let count = 0;
		for (let i = 0; i < len; i++) {
			const chatId = sdp_chat.active_chatids[i];
			const is_tech_chat = jQuery("#sdp-chat-bar").find("#" + chatId).find("#is_tech_chat").text();
			if (!is_tech_chat) {
				count++;
			}
		}
		if (count < 3) {
			return true;
		} else {
			chtload.showAjaxError(translate("chat.error1"));
			return false;
		}
	},
	/* Prevent parent page scrolling on scrolling inside chat box */
	bindMousewheel: function ($target) {
		/*** Bind mousewheel **/
		$target.off('mousewheel.chatBox').on('mousewheel.chatBox', function (e) { //No I18N
			var event = e.originalEvent,
				d = event.wheelDelta || -event.detail;
			this.scrollTop += (d < 0 ? 1 : -1) * 30;
			//zia scroll issue fix
			if (jQuery(e.target).closest(".chatmain-column").hasClass("zia-chat")) {
				return;
			}
			e.preventDefault();
		});
	},

	/* Load chat when scrolling up */
	bindInfiniteScroll: function (chatID, start_index, end_index, has_more_rows, is_from_history) {
		var $target = "";
		if (is_from_history) {
			$target = jQuery(".ui-dialog .chathistnav #chat_content_area");
		}
		else {
			$target = jQuery("#sdp-chat-bar #" + chatID + " .chat-content-wrapper .chat-wrapcont");
		}
		var input_data = {};
		if (has_more_rows) {
			$target.off('scroll');//No I18N
			$target.on('scroll', function () {
				if ($target.scrollTop() <= 25) {
					start_index = parseInt(start_index);
					end_index = parseInt(end_index);
					input_data = {
						"list_info": {//No I18N
							"start_index": end_index + 1, //No I18N
							"row_count": row_count_global //No I18N
						}
					};
					let url = "";
					input_data.list_info.sort_order = "desc";//No I18N
					input_data.list_info.sort_field = "time";//No I18N
					url = "/chats/" + chatID + "/messages"; //No I18N
					const ajax_data = chat_util.constructAjaxData({
						url: url,
						input: input_data
					});
					$target.off("scroll"); //No I18N
					sdpAjax(ajax_data).done(function (response) {
						if (chat_util.checkAjaxResponse(response)) {
							chat_util.processmessages(chatID, response.messages, true, is_from_history, true);

							if (response.list_info.has_more_rows) {
								const startIndex = response.list_info.start_index;
								const endIndex = startIndex + response.list_info.row_count - 1;
								chat_box.bindInfiniteScroll(chatID, startIndex, endIndex, response.list_info.has_more_rows, is_from_history);
								jQuery("#sdp-chat-bar #" + chatID).attr("msgEndIndex", endIndex);
							}
							chat_util.reinitateATP($target);
						}
					});
					return false;
				}
			});
		} else {
			$target.off("scroll"); //No I18N
		}
		/**
	 * Re-Initilize the attachment component
	 */
		chat_util.reinitateATP($target);
	},

	/* Open a new chat box */

	chatpickedfn: function (chatId, title, userId, woId, is_tech_chat, chat_type, portalId, response) {
		let allowactions = true;
		if (sdp_chat.active_chatids.indexOf(String(chatId)) < 1) {
			if (jQuery(".chatbar-maincontent").length > 0) {
				while (jQuery(".chatbar-maincontent").parent().find(`#${chatId}`).length > 0) {
					chat_box.closeChatBox(chatId)
				}
			}
		}
		if (!(chat_box.getActiveChatIndex(chatId) > -1)) {
			chat_box.addActiveChat(chatId);
			const $target = jQuery("#sdp-chat-bar .chatrow");
			if (typeof woId != "undefined" && woId != null) {
				var woURL = "/WorkOrder.do?woMode=viewWO&woID=" + woId; //No I18N
				if (portalId != PORTALID) {
					woURL = woURL + "&PORTALID=" + portalId; //No I18N
				}
			}
			var channelactions = {};
			let channel_status = "";
			let channel_type = "";
			let users_count = 0;
			if (chat_type === 'channel') {
				channelactions = response.channel_info.allowed_channel_actions;
				if (response.channel_info.hasOwnProperty("status")) {
					channel_status = response.channel_info.status.name;
				} else {
					channel_status = response.status.name;
				}
				if (channel_status !== "Running") {
					allowactions = false;
				}
				channel_type = response.channel_info.type;
			} else {
				users_count = response.members.length;
			}
			if ((chat_type === 'requester_chat' || chat_type === 'tech_req_chat') && sdp_user.USERTYPE == "Requester") {
				allowactions = false;
			}
			var actions = redirect.getactionsobj(chat_type, channelactions);
			if (response.sender.id == sdp_user.LOGGEDIN_USERID && actions.hasOwnProperty("leave_channel")) {
				delete actions.leave_channel;
			}
			var user_status = "";
			if (chat_type == "technician_chat" || chat_type == "tech_req_chat" || chat_type == "requester_chat") {
				const members = response.members;
				members.forEach(function (item, index, arr) {
					if (parseInt(item.member.id) !== sdp_user.LOGGEDIN_USERID) {
						user_status = item.status;
					}
				})
			}

			const actions_data = { "actions": actions, "chat_type": chat_type, "channelId": response.entity_id, "title": title };// NO I18N
			var input_data = { "chatId": chatId, "title": title, "userId": userId, "woId": woId, "woURL": woURL, "is_tech_chat": is_tech_chat, "chat_type": chat_type, "portalId": portalId, "actions": actions, "members": users_count, "response": response, "allowactions": allowactions, "sdp_user": sdp_user, "channel_type": channel_type, "user_status": user_status, "channel_status": channel_status };// NO I18N
			if (chat_type === 'channel') {
				sdp_chat.active_channelactions[chatId] = channelactions;
			}
			renderhbs('#sdp-chat-bar .chatrow', 'chat-box', input_data, true, 'chat/Common/Chat', true, false, function () { // NO I18N
				jQuery("#sdp-chat-bar .chatrow").find("[data-name=replyTo]").find("[data-name=replyToCancel]").off("click.chatBox").on("click.chatBox", function () { chat_actions.cancelReplyToMessage(this) });// NO I18N
				const $chat_txt_area = jQuery("#chat_input-" + response.id);
				$chat_txt_area.off("keypress.chatBox").on("keypress.chatBox", function (event) { //No I18N
					chat_box.chatentertxt(event, $chat_txt_area);
				});
				$chat_txt_area.on("paste.chatBox", function (event) {
					event.preventDefault();
					// Get the pasted content from the clipboard
					var clipboardData = (event.originalEvent || event).clipboardData || window.clipboardData;
					var pastedData = clipboardData.getData('text/plain');// NO I18N
					// Insert the pasted text into the contenteditable div
					document.execCommand('insertText', false, pastedData);// NO I18N
				});
				$chat_txt_area.on("focus.chatBox", function () {
					chat_box.highlightChatWindow($chat_txt_area)
				});
				$chat_txt_area.on("focusout.chatBox", function () {
					chat_box.unhighlightChatWindow($chat_txt_area)
				});
				if (chat_type == "support_group_chat" || chat_type == "collaborators_chat" || chat_type == "fluid_group_chat") {
					jQuery("#sdp-chat-bar").find("#" + chatId).find("#group_users_count").off("click.chatBox").on("click.chatBox", function () {
						chat_box.getChatMembers(this);
					});
				}
				if (jQuery("#sdp-chat-bar").find("#" + chatId).find("[data-name='editTitleInp']").length > 0) {
					const $titleEditDiv = jQuery("#sdp-chat-bar").find("#" + chatId).find("[data-name='editTitleInp']");
					$titleEditDiv.on("keypress.chatBox", function (event) {
						chat_box.chatusrname(event, this);
					});
					$titleEditDiv.on("focusout.chatBox", function () {
						chat_box.chateditFocusOut(this);
					});
				}

				// For handling the drag and drop operations on the chat box.
				let $chat_drag = jQuery(`#chat_drag_zone_${chatId}`);
				let $chat_drop = jQuery(`#chat_drop_zone_${chatId}`);
				// Helper function to prevent default behavior and stop propagation
				function preventDefaults(event) {
					event.preventDefault();
					event.stopPropagation();
				}
				// On Entering the chat box unhiding the droppable div for highlighting the droppable area
				$chat_drag.off().on('dragover dragenter', function (event) { // NO I18N
					preventDefaults(event);
					$chat_drop.removeClass('hide');
				});
				// On droping calling the handledrop function and adding hide class to chat_drop
				$chat_drop.off('drop').on('drop', function (event) { // NO I18N
					preventDefaults(event);
					$chat_drop.addClass('hide');
					chat_actions.handleDrop(event.originalEvent, jQuery(this));
				});
				// on leaving the chat drop area unhighlighting the chat box
				$chat_drop.off('dragleave').on('dragleave', function (event) { // NO I18N
					preventDefaults(event);
					if (event.target.id == `chat_drop_zone_${chatId}` || event.target.id == `chat_dropping_zone_${chatId}`) { $chat_drop.addClass('hide'); }
				});
				// to prevent the default events from happening 
				$chat_drop.off('dragover').on('dragover', function (event) { // NO I18N
					preventDefaults(event);
				})
				// from preventing the file drop over other area.
				jQuery("body").off("dragover").on("dragover", function (e) { // NO I18N
					e.preventDefault();
				}).on("drop", function (e) {
					e.preventDefault();
				});

			});

			const $div = "#actions-" + response.id; // NO I18N
			renderhbs($div, 'chatbox_actions', actions_data, false, 'chat/Common/Chat'); // NO I18N

			//disabling title for requesters
			if (sdp_user.USERTYPE == "Requester") {
				var $chatbox = jQuery("#sdp-chat-bar").find("#" + chatId);
				$chatbox.find("#edit_chat_title").off('click.sdevent');//No I18N
			}
			if (!chat_type == "channel") {
				if (response.status.name !== "Running" && response.status.name !== "New") {
					chat_box.disableChatTextArea(chatId);
				}
			}
			if (chat_type == "channel") {
				let archive_note;
				if (response.hasOwnProperty("channel_info")) {
					archive_note = response.channel_info.archive_note;
				}
				else {
					archive_note = response.archive_note;
				}
				if (channel_status == "Archived") {
					redirect.displayArchiveNoteinChatbox(chatId, response.channel_info.archive_note);
					chat_box.removeHighlightZone(chatId);

				}
				if (!channelactions.includes('post_message') || channel_status == "ReadOnly" || channel_status == "Trashed") {
					const $input = jQuery("#sdp-chat-bar").find("#" + chatId).find(".input-group");
					$input.find(".input-group-addon").remove();
					$input.find('textarea').attr('disabled', '').addClass("fw");
					$input.addClass("fw");
					chat_box.removeHighlightZone(chatId);
				}

			}
			chtload.chatpickalignmentfn();

			chat_box.bindMousewheel($target.find("#" + chatId + " .chat-wrapper .chat-wrapcont"));

			const $obj = jQuery("#sdp-chat-bar #" + chatId).find(".chat-mini-header");
			$obj.parents('.chatmain-column,.chat-column').find('#is_tech_chat').text(is_tech_chat); //No I18N
		}
	},
	/* Calls chatbox minimize function and stores the state in cookie for page reload */
	chatminimizefn: function (a) {
		chat_box.chatminimizefn1(a);
		const chatId = jQuery(a).parents('.chatbar-maincontent').attr("id");
		chat_util.updateChatInfo(chatId, "min", ""); //No I18N

		if (is_external_chat) {
			minimizeExternalIframe(chatId);
		}
	},

	/* Minimize the chatbox */
	chatminimizefn1: function (a) {
		const $this_obj = jQuery(a);
		const txt = $this_obj.parents('.chatbar-maincontent').find('.chat-header1 .chatusrnameact').text(); //No I18N
		$this_obj.parents('.chatmain-column,.chat-column').find('.chat-wrapper,.chat-header1').addClass('hide').end() //No I18N
			.find('.chat-mini-header').removeClass('hide').end() //No I18N
			.find('.active-assign-tech-icon').attr('class', '').end()
			.find('.chat-mini-header .chatusrnameact').text(txt); //No I18N

	},

	/* Maximize chatbox */
	chatmaximizefn: function (a) {
		const $this_obj = jQuery(a);
		const chatID = $this_obj.parents(".chatbar-maincontent").attr("id"); //No I18N

		$this_obj.parents('.chatmain-column,.chat-column').find('.chat-mini-header').addClass('hide').end() //No I18N
			.find('.chat-wrapper,.chat-header1,.chat-content-wrapper1').removeClass('hide').end() //No I18N
			.find('.chat-usernav').addClass('hide');

		if ($this_obj.attr("data-loadchat") == "true") { //No I18N
			let input_data = {};
			input_data.exclude_fields = ["members"];
			var ajax_data = chat_util.constructAjaxData({
				url: "/chats/" + chatID,//No I18N
				input: input_data
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					$this_obj.removeAttr("data-loadchat");
					sdp_channels.showpinmessages(chatID, response.chat.pin_messages);
					chat_util.processmessages(chatID, response.chat.messages, true);

					const chat_status = response.chat.status.name;
					if (chat_status !== 'Completed') {
						const startIndex = response.chat.messages_list_info.start_index;
						const endIndex = startIndex + response.chat.messages_list_info.row_count - 1;
						chat_box.bindInfiniteScroll(chatID, startIndex, endIndex, response.chat.messages_list_info.has_more_rows);
						jQuery("#sdp-chat-bar #" + chatID).attr("msgEndIndex", endIndex);
					}
					chat_util.updateChatInfo(chatID, "max", ""); //No I18N
					var chat_entity = response.chat.entity_str;

					if (chat_entity === 'requester_chat' || chat_entity === 'technician_chat' || chat_entity === 'tech_req_chat') {
						let otherUserName = response.chat.sender.name;
						let otherUserId = '';
						let otheruserStatus = response.chat.sender.status;
						let users = response.chat.members;
						if (users.length > 1) {
							users.forEach(function (item, index, arr) {
								const userid = item.member.id;
								if (userid != sdp_user.LOGGEDIN_USERID) {
									otherUserName = item.member.name;
									otheruserStatus = item.status;
									otherUserId = userid;
								}
							});
						}
						chat_box.setUserStatus(chatID, otheruserStatus);
						$this_obj.parents(".chatbar-maincontent").attr('data-userid', otherUserId); //No I18N
						$this_obj.parents(".chatbar-maincontent").attr("data-user", otherUserName); //No I18N
					}

					const $chatObj = jQuery("#sdp-chat-bar").find("#" + chatID);
					// disabling the text area section,If chat user tech is deleted or login removed or converted to other userType

					if (response.chat.is_user_converted || chat_status === 'Completed') {
						chat_actions.removeActionsAndTextArea(chatID, chat_status === 'Completed');//No I18N
						//Removing data-woid in case of collaborators chat and its completed
						jQuery("#sdp-chat-bar").find("#" + chatID).removeAttr('data-woid');
					}
					// Adding group members
					if (chat_entity != 'requester_chat' && chat_entity != 'technician_chat' && chat_entity != 'tech_req_chat' && chat_entity != 'channel') {
						chat_box.addActiveMembersCount(chatID);
					}
					else if (chat_entity == 'channel') {
						chat_box.setTotalChannelUsersCount(response.chat.channel_info.id, response.chat.portalid, chatID);
					}
					if (sdp_user.USERTYPE === 'Technician') {
						if (chat_entity != 'requester_chat' && chat_entity != 'tech_req_chat' && chat_entity != 'channel' && !sdp_app.IS_TECH_CHAT_ENABLED) {
							chat_box.disableChatTextArea(chatID);
						}
					}
					if (chat_entity === "channel" && (!response.chat.channel_info.allowed_channel_actions.includes('post_message') || response.chat.channel_info.status.name == "ReadOnly" || response.chat.channel_info.status.name == "Trashed")) {
						const $chat = jQuery("#sdp-chat-bar").find("#" + chatID);
						const $input = $chat.find(".input-group");
						$input.find(".input-group-addon").remove();
						$input.find('textarea').attr('disabled', '').addClass("fw");
						$input.addClass("fw");
						$chat.find("#actions_link").parent().remove();
					}

					//setting workorderId
					var woId = null;
					var portalId = null;
					if (chat_entity === 'collaborators_chat') {
						woId = response.chat.entity_id;
					}
					if (response.chat.request_chat_association) {
						woId = response.chat.request_chat_association.request.id;
					}
					if (response.chat.portalid) {
						portalId = response.chat.portalid;
						chat_util.setChatPortalId(chatID, portalId);
						if (response.chat.portal_status === 'Retired') {
							chat_box.disableChatTextArea(chatID);
						}
					}
					if (typeof woId != "undefined" && woId != null) {
						let woURL = "/WorkOrder.do?woMode=viewWO&woID=" + woId; //No I18N
						if (portalId != PORTALID) {
							woURL = woURL + "&PORTALID=" + portalId; //No I18N
						}
						let woLink = '<span class="text-link a-tag-link" data-id="woLink">#' + woId + '</span>';
						$chatObj.find(".chatuserid").html(woLink).ready(function () {
							$chatObj.find("[data-id=woLink]").on('click.chatBox', function () {
								window.open(woURL, '_blank', 'noopener,noreferrer');
							});
						});
					}
					if (response.chat.MISSED_CHAT_COUNT) {
						chtload.showUnreadCount(response.chat.MISSED_CHAT_COUNT);
					}
				}
			});

			//to scroll to the bottom of the chat bar
			let $target = jQuery("#sdp-chat-bar #" + chatID).find(".chat-content-wrapper .chat-wrapcont");
			if ($target != undefined && $target[0] != undefined) {
				$target.scrollTop($target[0].scrollHeight);
			}
		}
		//to scroll to the bottom of the chat bar
		if (chatID !== undefined) {
			let $target = jQuery("#sdp-chat-bar #" + chatID + " .chat-content-wrapper .chat-wrapcont");
			$target.scrollTop($target[0].scrollHeight);
		}

		if (is_external_chat) {
			maximizeExternalIframe(chatID);
			jQuery("#sdp-chat-bar").find("div.chat-mini-header").addClass("hide");
		}

	},
	/* Close a chatbox */
	closeChatBox: function (id) {
		const $chatObj = jQuery("#sdp-chat-bar").find("#" + id);
		const chat_entity = $chatObj.attr("data-chat-entity");
		$chatObj.parents('.chat-column').remove(); //No I18N
		chtload.chatpickalignmentfn();
		if (is_external_chat) {
			jQuery("#sdp-chat-bar").find("#open-requester-chat").removeClass("hide");
			if (sdp_app.zia_info.EMBED_ZIA_ENABLED) {
				jQuery('.zia-chat').removeClass('hide');
			}
			if (sdp_chat.active_chatids.length == 0) {
				var minimize_to_zia = sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0;
				sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE = false;
				minimizeExternalIframe(minimize_to_zia ? "zia" : "livechat");       // No I18N
				if (minimize_to_zia) {
					// Need to add 'external-zia' when zia is present and remove for livechat, SD-122566
					if (sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
						jQuery('#sdp-chat-bar').addClass('external-zia');   //NO I18N
					}
				}
				const $chatBar = jQuery("#sdp-chat-bar");
				$chatBar.find("div.chat-mini-header").removeClass("hide");
				$chatBar.find("div.chatmain-column").removeClass("hide");
				$chatBar.find("div.chatmain-column").find("div.chat-wrapper").addClass("hide");
				jQuery("#reqChat").removeClass("active");
			}
		}
		chat_box.removeActiveChat(id);

		if (!is_external_chat && sdp_user.USERTYPE == "Requester" && sdp_app.zia_info.IS_BOT_ENABLED && chat_entity == "requester_chat") {
			chat_util.showZiaBot();
		}
	},
	/* Show inline edit on click on Chat title. */
	chateditusrname: function (a) {
		const $this_obj = jQuery(a);
		let usrname = $this_obj.parents('.chatbar-maincontent').find('.chat-header1 .chatusrname:not("[data-id=zia-chatusrname]")').text(); //No I18N
		usrname = usrname.trim();
		const $chatmain = $this_obj.parents('.chatbar-maincontent'); //No I18N
		$chatmain.find('.chat-header1 .chatusrname:not("[data-id=zia-chatusrname]")').addClass('hide'); //No I18N
		$chatmain.find('.chat-header1 input.chatusrname-inp').removeClass('hide').val(usrname).trigger('focus').select(); //No I18N
	},
	chateditFocusOut: function (a) {
		const $this_obj = jQuery(a);
		const $chatmain = $this_obj.parents('.chatbar-maincontent'); //No I18N
		let usrname = $chatmain.find('.chat-header1 .chatusrname:not("[data-id=zia-chatusrname]")').text(); //No I18N
		usrname = usrname.trim();
		$chatmain.find('.chat-header1 .chatusrname:not("[data-id=zia-chatusrname]")').removeClass('hide'); //No I18N
		$chatmain.find('.chat-header1 input.chatusrname-inp').addClass('hide'); //No I18N
	},
	/* Handle chat title Escape and Enter hit event
	Arguments:
	e = event
	a = Input DOM
	*/
	chatusrname: function (e, a) {
		const $this_obj = jQuery(a);
		const keyunicode = chat_box.getKeycode(e);
		if (keyunicode == 13) {
			/* Prevent default avoids return character. */
			e.preventDefault();
			let txt = $this_obj.val();
			txt = txt.trim();
			/* If text is empty do not execute. */
			if (txt != "") {
				let input_data = {
					"chat": { //No I18N
						"title": "" //No I18N
					}
				};
				const chatID = $this_obj.attr("data-chat-id");
				input_data.chat.title = txt;
				let ajax_data = chat_util.constructAjaxData({
					url: "/chats/" + chatID + "/_update_title", //No I18N
					type: "PUT", //No I18N
					input: input_data
				});
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						$this_obj.addClass('hide').parent().find('.chatusrnameact').removeClass('hide').text(txt);
						jQuery('body').trigger('focus');
					}

				}).fail(function (response) {
					chat_util.checkAjaxResponse(response.responseJSON);
				});
			}
		}
	},
	/* Handle Chat textarea Enter event.
	Arguments:
	e = event
	a = Textarea DOM
	*/
	chatentertxt: function (e, a, flag) {
		const $this_obj = jQuery(a);
		const keyunicode = chat_box.getKeycode(e);
		/* Enter key */
		if (keyunicode == 13 && !e.shiftKey) {
			/* Prevent default avoids return character. */
			e.preventDefault();
			$this_obj.find('span[data-name="mentionedUser"]').each(function () {
				const $span = jQuery(this); // Current span element
				const userId = this.dataset.userid; // Get data-userId value
				const replacementText = `{@${userId}}`; // Format text as {@userId}

				// Replace the span with the replacement text
				$span.replaceWith(replacementText);
			});
			let txt = $this_obj.text();

			const len = txt.length;
			/* If text is empty do not execute. */
			if (txt != '' && len <= 2000) {
				const chatID = $this_obj.attr("data-chatid");
				const portalId = $this_obj.parents(".chatbar-maincontent").attr("data-portalid");//No I18N
				let input_data = {
					"chat_info": {// No I18N
						"text": txt, // No I18N
						"type": "text" // No I18N
					}
				};
				const $chatBox = $this_obj.parents(".chatbar-maincontent"); // NO I18N
				let isReplyToExists = $chatBox.find("[data-name=replyTo]").is(":visible"); // NO I18N
				if (isReplyToExists) {
					let parentMsgId = $chatBox.find("[data-name=replyTo]").attr("msg_id");

					let replyToJson = {
						id: parseInt(parentMsgId)
					};
					input_data.chat_info.reply_to = replyToJson;
				}
				let url = "/chats/" + chatID + "/messages";//No I18N
				url = chtload.appendPortalParam(url, portalId);
				let ajax_data = chat_util.constructAjaxData({
					url: url,
					type: "POST", // No I18N
					input: input_data
				});
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						$this_obj.html('');
						$chatBox.find("[data-name=replyToCancel]").trigger("click");
						chat_actions.removeChatmentionedUsers(chatID);
					}
					else {
						chat_actions.removeActionsAndTextArea(chatID);
					}

				}).fail(function (response) {
					chat_util.checkAjaxResponse(response.responseJSON);
				});
			}
			else if (txt != '' && len > 2000) {
				chat_util.showChatAlert(translate("api.chat.send.message.length.warning.message"));
				jQuery("#sdp-chat-bar").find("#" + chatID).find("textarea.chattxt").trigger('focus');
				return false;
			}
		}
	},
	/* Get keycode. Returns integer. */
	getKeycode: function (e) {
		var e = window.event || e;
		var keyunicode = e.charCode || e.keyCode;
		return keyunicode;
	},
	/* Show user is online or offline when page is loaded for Tech */
	setUserStatus: function (chatID, status) {
		const $chatbox = jQuery("#sdp-chat-bar").find("#" + chatID);
		if (status == "online" || status == 'user_login') { //No I18N
			$chatbox.find(".chat-mini-header").find('>span').removeClass().addClass("avaicon mr5");
			$chatbox.find(".chat-header1").find('>span').removeClass().addClass("avaicon mr5");
			$chatbox.find(".chat-header1").find('#user_status').text(translate("chat.user.available"));
		} else {
			$chatbox.find(".chat-mini-header").find('>span').removeClass().addClass("waiticon mr5");
			$chatbox.find(".chat-header1").find('>span').removeClass().addClass("waiticon mr5");
			$chatbox.find(".chat-header1").find('#user_status').text(translate("sdp.techMarking.offline"));
		}
	},
	/* Method for changing the doc title when new message arrives */
	changeDocTitle: function ($column, chatId, stopMesg) {
		if ($column.find('.chat-mini-header, .chat-header1').hasClass('backgroundOrange')) {
			$column.find('.chat-mini-header, .chat-header1').removeClass("backgroundOrange");
			if (stopMesg) {
				notifications.stopNewChatMessage(chatId);
			}
			if (is_external_chat) {
				stopTitleToggling();
			} else {
				clearInterval(sdp_chat.title_interval);
				sdp_chat.title_interval = null;
				document.title = browserTitleText;
			}
		}
	},
	/* Method for stopping the new chat message from the doc title */
	stopChatMessage: function (chatId) {
		if (is_external_chat) {
			stopTitleToggling();
		} else {
			clearInterval(sdp_chat.title_interval);
			sdp_chat.title_interval = null;
			document.title = browserTitleText;
		}
		if (chatId !== "") {
			jQuery("#sdp-chat-bar").find("#" + chatId).find('.chat-mini-header, .chat-header1').removeClass("backgroundOrange");
		}
		else {
			jQuery(".chatmain-column").find('.chat-mini-header, .chat-header1').removeClass("backgroundOrange");
		}
	},
	/* Method for loading user new chat */
	loadUserNewChat: function (chatId, append_last_mesg, portalId, from_recent) {
		requester_chat.removeActiveChatFromList(chatId);
		if (chat_box.getActiveChatIndex(chatId) < 0) {
			let url = "/chats/" + chatId; //No I18N
			let input_data = {};
			input_data.exclude_fields = ["members"];
			url = chtload.appendPortalParam(url, portalId);
			let ajax_data = chat_util.constructAjaxData({
				url: url,
				input: input_data
			});
			if (is_external_chat) {
				jQuery("#sdp-chat-bar").find("div.chat-column").find("#minimize_chat_bar").trigger("click");
			}
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					const chat_entity = response.chat.entity_str;
					const is_tech_chat = chat_util.isChatFortechnician(chat_entity);
					const is_chat_to_load = chat_box.checkChatToLoad(is_tech_chat, response.chat.sender.id, chat_entity);
					const $chatBar = jQuery("#sdp-chat-bar");
					if (is_chat_to_load) {
						let title = response.chat.title;

						const chat_portalId = response.chat.portalid;
						const chat_status = response.chat.status.name;
						chat_util.updateChatInfo(response.chat.id, "max", "pickup"); //No I18N
						let request_id = null;
						if (chat_entity === 'requester_chat' || chat_entity === 'tech_req_chat') {
							if (response.chat.entity_id && response.chat.entity_id !== null) {
								request_id = response.chat.entity_id;
							}
						}
						if (chat_entity === 'collaborators_chat') {
							request_id = response.chat.entity_id;
							if (jQuery("#start_quick_chat").length > 0 && woID == request_id && chat_status !== "Completed") {
								chat_box.changeQuickStartChatAction(chatId);
							}
						}
						if (chat_entity == 'channel') {
							title = response.chat.channel_info.name;
						}
						chat_box.chatpickedfn(response.chat.id, title, response.chat.sender.id, request_id, is_tech_chat, chat_entity, chat_portalId, response.chat);
						if (chat_status !== "Completed") {
							response.chat.messages = response.chat.messages.reverse();
						}
						if (response.chat.portalid) {
							chat_util.setChatPortalId(chatId, response.chat.portalid);
							if (response.chat.portal_status === 'Retired') {
								chat_box.disableChatTextArea(chatId);
							}
						}
						sdp_channels.showpinmessages(chatId, response.chat.pin_messages);
						chat_util.processmessages(chatId, response.chat.messages, false, false, false, from_recent);

						if (chat_status === "Running" || chat_entity == "channel") {
							let startIndex = response.chat.messages_list_info.start_index;
							let endIndex = startIndex + response.chat.messages_list_info.row_count - 1;
							chat_box.bindInfiniteScroll(chatId, startIndex, endIndex, response.chat.messages_list_info.has_more_rows, false);
							jQuery("#sdp-chat-bar #" + chatId).attr("msgEndIndex", endIndex);
						}

						if (chat_entity === 'technician_chat' || chat_entity === 'requester_chat' || chat_entity === 'tech_req_chat') {
							let otherUserName = response.chat.sender.name;
							let otheruserStatus = response.chat.sender.status;
							let otherUserId = sdp_user.LOGGEDIN_USERID;
							let users = response.chat.members;
							if (users.length > 1) {
								users.forEach(function (item, index, arr) {
									var userid = item.member.id;
									if (userid != sdp_user.LOGGEDIN_USERID) {
										otherUserName = item.member.name;
										otheruserStatus = item.status;
										otherUserId = userid;
									}
								});
							}
							chat_box.setUserStatus(chatId, otheruserStatus);
							const $chatBox = jQuery("#sdp-chat-bar").find("#" + chatId);
							$chatBox.attr("data-user", otherUserName).attr("data-userid", otherUserId);
						}
						if (chat_entity !== 'requester_chat' && chat_entity !== 'technician_chat' && chat_entity !== 'tech_req_chat' && chat_entity !== 'channel') {
							chat_box.addActiveMembersCount(chatId);
						}
						else if (chat_entity == 'channel') {
							chat_box.setTotalChannelUsersCount(response.chat.channel_info.id, response.chat.portalid, chatId);
						}

						//disabling the text area section,If chatusertech is deleted or login removed,chat is closed in case of requeter_chat
						if ((chat_entity === 'technician_chat' && !response.chat.is_tech_login_exists) || chat_status === 'Completed' || response.chat.is_user_converted) {
							chat_actions.removeActionsAndTextArea(chatId, chat_status === 'Completed');//No I18N
							// Removing data-woid in case of collaborators chat and the chat is closed
							jQuery("#sdp-chat-bar").find("#" + chatId).removeAttr('data-woid');

						}
						// disabling the chat text area in case of tech to tech chat is disabled for tech chats
						// chat_portalId and logged in portalId should be same for disabling the text area
						if (chat_entity !== 'requester_chat' && chat_entity !== "tech_req_chat" && chat_entity !== "channel" && chat_portalId == PORTALID && !sdp_app.IS_TECH_CHAT_ENABLED) {
							chat_box.disableChatTextArea(chatId);
						}
						if (chat_entity === "channel" && (!response.chat.channel_info.allowed_channel_actions.includes('post_message') || response.chat.channel_info.status.name == "ReadOnly" || response.chat.channel_info.status.name == "Trashed")) {
							const $input = jQuery("#sdp-chat-bar").find("#" + chatId).find(".input-group");
							$input.find(".input-group-addon").remove();
							$input.find('textarea').attr('disabled', '').addClass("fw");
							$input.addClass("fw");
						}
						if (chat_entity === 'technician_chat' || chat_entity === 'fluid_group_chat' || chat_entity === 'collaborators_chat' || (chat_entity === 'channel' && response.chat.channel_info.allowed_channel_actions.includes('add_member') && chat_status == "Running")) {
							setTimeout(function () {
								if (sdp_app.IS_TECH_CHAT_ENABLED && chat_portalId == PORTALID) {
									chat_actions.suggestAddMembers(chatId);
								}
								else {
									chat_actions.suggestAddMembers(chatId);
								}

							}, 100);
						}
						if (append_last_mesg && chat_portalId == PORTALID) {
							requester_chat.appendReqChatLastMesg(chatId, title, response.chat.sender.id, chat_entity, response.chat.last_mesg_time.display_value.split("||")[0], response.chat.sender.status, response.chat.last_chat_mesg_str, response.chat.last_mesg_time.formatted_value.split("||")[1], response.chat.serviceName);

						}
						if (chat_entity != 'requester_chat' && chat_entity != 'tech_req_chat') {
							chat_actions.suggestToMentionMembers(chatId);
						}

						sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE = true;
						if (is_external_chat) {
							setTimeout(function () {
								jQuery('#sdp-chat-bar').removeClass('external-zia');
								maximizeExternalIframe(chatId);
								$chatBar.find("#open-requester-chat").addClass("hide");
								$chatBar.find("div.chat-mini-header").addClass("hide");
							}, 100);
						}
					}

					if (response.chat.serviceName) {
						const serviceName = e_html(response.chat.serviceName);
						const $chatBox = jQuery("#sdp-chat-bar #" + chatId);
						$chatBox.find("#chat_title").before("<img class='mr3 vtop pos-rel top1' alt='" + serviceName + "' src='/custom/customimages/integration/" + serviceName + ".svg' width='15' height='15'>");
						$chatBox.find("#edit_chat_title").before("<img class='mr3 vtop pos-rel top1' alt='" + serviceName + "' src='/custom/customimages/integration/" + serviceName + ".svg' width='15' height='15'>");
					}
				}
			});
		}
	},
	loadUserNewChats: function () {
		let ajax_data = chat_util.constructAjaxData({
			url: "/chats/notified_chats" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				if (response.chat.chats.length) {
					response.chat.chats.forEach(function (item, index, arr) {
						const chat_type = item.chat_type;
						if (chat_type === 'new_chat_request') {
							if (sdp_user.USERTYPE === 'Technician') {
								requester_chat.chatPickupNotice(item);
							} else {
								chat_box.loadUserNewChat(item.id);
							}

						} else if (chat_type === 'new_transfer_chat') { //No I18N
							let message = { "requester": item.message.requester, "from_user": item.message.from_user, "requester_id": item.message.requester_id }; //No I18N
							let data = { "id": item.id, "module": "chat", "type": chat_type, "message": (typeof sdpToJSON != 'undefined') ? sdpToJSON(message) : JSON.stringify(message), "time": item.start_time.value, "time_str": item.start_time.formatted_value, "from": item.from, "server_current_time": item.server_current_time, "expiry_time": item.expiry_time }; //No I18N
							requester_chat.newTransferChat(data);
						}

					});
					chat_actions.notifyUser(jQuery(".chatmain-column"), false, "");
				}
			}
		});
	},
	/* Method for updating the chat title */
	updateChatTitle: function (response) {
		response.message = jQuery.parseJSON(response.message);
		const $chatBarId = jQuery("#sdp-chat-bar #" + response.id);
		$chatBarId.find(".chatusrnameact").text(response.message.title).attr("title",  e_attr(response.message.title)); //No I18N
		$chatBarId.attr("data-title", e_attr(response.message.title));
		//adding chat notice to chat pop up
		let mesg = translate("chat.update.member.title", [chat_actions.getUserHrefLink(response.message.userid, response.message.name)]);
		chat_actions.showChatNotice(response.id, mesg, "new_member", response.time, false);  //No I18N
		if (jQuery("#sdp-chat-bar").find("#user_chats").parent('li').attr('class') === 'active') {
			const $recentObj = jQuery("#sdp-chat-bar").find('#recent-chats').find('[data-chatid="' + response.id + '"]');
			let recent_len = $recentObj.length;
			if (recent_len > 0) {
				$recentObj.find("#chat_title").text(response.message.title);
				$recentObj.prop('title', response.message.title); //No I18N
			}

		}
	},
	/* Method for getting the chat index from active_chatids array */
	getActiveChatIndex: function (chatID) {
		return sdp_chat.active_chatids.indexOf(chatID);

	},
	/* Method for removing the chatID from the active_chatids array */
	removeActiveChat: function (chatID) {
		const index = sdp_chat.active_chatids.indexOf(chatID);
		if (index > -1) {
			sdp_chat.active_chatids.splice(index, 1);
		}
		if (sdp_chat.chatPinMessages.hasOwnProperty(chatID)) {
			delete sdp_chat.chatPinMessages[chatID];
		}
		if (sdp_chat.active_channelactions.hasOwnProperty(chatID)) {
			delete sdp_chat.active_channelactions[chatID];
		}

	},
	/* Method for adding a new chatID to active_chatids array */
	addActiveChat: function (chatID) {
		const index = sdp_chat.active_chatids.indexOf(chatID);
		if (index < 0) {
			sdp_chat.active_chatids.push(chatID);
		}

	},
	/* Method for starting a new tech to tech chat */
	startTechChat: function (techId) {
		chat_actions.startEntityChat("technician", techId); //No I18N
	},
	/* Method for highlighting a chat popup */
	highlightChatPopUp: function (chatID) {
		chat_box.alignChatPopups(chatID);
		let counter = 0;
		const $column = jQuery("#sdp-chat-bar").find("#" + chatID);
		const header_interval = setInterval(function () {
			$column.find('.chat-mini-header, .chat-header1').toggleClass("backgroundOrange"); //No I18N
			counter++;
			if (counter == 6) {
				clearInterval(header_interval);
			}
		}, 100);
		$column.find('.chat-mini-header, .chat-header1').removeClass("backgroundOrange");
		return;
	},
	/* Method for changing the chat pop up theme based on the header theme when focused */
	highlightChatWindow: function (a) {
		if (is_external_chat) {
			return false;
		}
		const $this_obj = jQuery(a);
		const chatID = $this_obj.parents(".chatbar-maincontent").attr("id"); //No I18N
		const $obj = $this_obj.parents(".chatrow").find("#" + chatID); //No I18N
		var tab_normal_text = jQuery(".navbar-default #hdr-usermenu").css('color'); //No I18N
		var header_bg_color = jQuery(".navbar-default").css('background-color'); //No I18N
		$obj.find(".chat-header1").css('background-color', header_bg_color).end() //No I18N
			.find(".chat-header1, .chatusrname:not('[data-id=zia-chatusrname]')").css('color', tab_normal_text).end() //No I18N
			.find(".chat-header1, #group_users_count, #user_status").css('color', tab_normal_text).end() //No I18N
			.find("#minimize_chat svg").css('fill', tab_normal_text).end() //No I18N
			.find("#closechat svg").css('fill', tab_normal_text).end() //No I18N
			.find(".chtgrp").css('fill', tab_normal_text); //No I18N
		$obj.find(".chat-wrapper").addClass("onfocus");
	},
	/* Method for changing the chat pop up theme based on the header theme when out of focused */
	unhighlightChatWindow: function (a) {
		if (is_external_chat) {
			return false;
		}
		const $this_obj = jQuery(a);
		const chatID = $this_obj.parents(".chatbar-maincontent").attr("id"); //No I18N
		let $obj = $this_obj.parents(".chatrow").find("#" + chatID); //No I18N
		$obj.find(" .chat-header1").css('background-color', "").end()
			.find(".chat-header1, .chatusrname:not('[data-id=zia-chatusrname]')").css('color', "").end()
			.find(".chat-header1, #group_users_count, #user_status").css('color', "").end()
			.find("#minimize_chat svg").css('fill', "").end()
			.find("#closechat svg").css('fill', "").end() //No I18N
			.find(".chtgrp").css('fill', ""); //No I18N
		$obj.find(".chat-wrapper").removeClass("onfocus");
	},
	/* Method for disablling the chat text area */
	disableChatTextArea: function (chatID) {
		$chatBox = jQuery("#sdp-chat-bar #" + chatID);
		$chatBox.find('.chattxt').prop('disabled', true).removeAttr("contenteditable").end()
			.find('.input-group-addon').remove().end()
			.find('.input-group').addClass('fw').end()
			.find('.chattxt').addClass('fw opac7 ptr-ev-none bg-light').end()
			.find('.bs-noconflict').remove();
		$chatBox.find('.chattxt').parent().addClass('cur-na');
		//To increase the chat box size to match with others
		if ($chatBox.find("#chat-pin-msg").children().length > 0) {
			$chatBox.find(".chat-wrapcont").addClass("cb-noaction");
		}
		else {
			$chatBox.find(".chat-wrapcont").addClass("cb-noaction wo-action-pin");
		}
		$chatBox.find("[data-name='replyToElem']").addClass("opac5 cur-na").off("click.chatBox");// NO I18N		
		chat_box.removeHighlightZone(chatID);

	},
	checkChatToLoad: function (is_tech_chat, fromUserId, chat_entity) {
		let is_check = false;
		if (is_tech_chat && sdp_user.USERTYPE === 'Technician') {
			is_check = true;
		} else if (!is_tech_chat && fromUserId != sdp_user.LOGGEDIN_USERID && sdp_user.USERTYPE === 'Technician') {//No I18N
			is_check = true;
		} else if (!is_tech_chat && fromUserId == sdp_user.LOGGEDIN_USERID && sdp_user.USERTYPE === 'Requester') {//No I18N
			is_check = true;
		}
		if (chat_entity === 'tech_req_chat') {
			is_check = true;
		}
		if (chat_entity === 'channel') {
			is_check = true;
		}
		return is_check;
	},
	/* Method for setting the group chat icon to the chat pop up */
	setChatGroupIcon: function (chatID) {
		const $chatbox = jQuery("#sdp-chat-bar").find("#" + chatID);
		//set mini-header icon
		if ($chatbox.find(".chat-mini-header").find('>svg').length == 0) {
			$chatbox.find(".chat-mini-header").find('>span').remove();
			$chatbox.find(".chat-mini-header").prepend(`<svg width="16" height="16" class="vmiddle default-fill"> <use href="#group_icon"></use> </svg>`);
		}
		//set header icon
		if ($chatbox.find(".chat-header1").find('>svg').length == 0) {
			$chatbox.find(".chat-header1").find('>span').remove();
			$chatbox.find(".chat-header1").prepend(`<svg width="18" height="18" class="vmiddle default-fill"> <use href="#group_icon"></use> </svg>`);
		}
	},
	/* Method for opening the chat related popups chat/technician/groups */
	openPopUp: function (a) {
		const $parentObj = jQuery(a).parent();
		if (jQuery("#zia_bot_container").is(":visible")) {
			ziabot.zia_trigger_close_icon();
		}
		if ($parentObj.hasClass('active')) {
			jQuery(a).closest('.chatmain-column').find('.chat-wrapper').addClass('hide'); //No I18N
			setTimeout(function () {
				jQuery(a).closest('li').removeClass('active'); //No I18N
			}, 100);
			return false;
		} else {
			jQuery(a).closest('.chatmain-column').find('.chat-wrapper').removeClass('hide'); //No I18N
			$parentObj.siblings().removeClass("active")
			$parentObj.addClass("active");
			return true;
		}
		return false;

	},
	/* Method for adding the logged in users count for the group chat */
	addActiveMembersCount: function (chatId) {
		let group_users = chat_box.getAllChatMembers(chatId);
		chat_box.appendGroupMembers(group_users, chatId);

	},
	/* Method for getting the group chat members */
	getChatMembers: function (a) {
		let $obj = jQuery(a).parents(".chatbar-maincontent"); //No I18N
		let chatID = $obj.attr("id"); //No I18N
		let allUsers = chat_box.getAllChatMembers(chatID);
		chat_box.appendGroupMembers(allUsers, chatID);
	},
	getAllChatMembers: function (chatId) {
		var users = [];
		var listInfo = { list_info: { start_index: 1, row_count: 100 } };
		var has_more_rows = false;

		// Function to process response and update state
		function processResponse(response) {
			if (chat_util.checkAjaxResponse(response)) {
				has_more_rows = response.list_info.has_more_rows;
				users = users.concat(response.members); // Add all members to the list
				if (has_more_rows) {
					listInfo.list_info.start_index += 100; // Move to the next batch
				}
			} else {
				has_more_rows = false; // End the loop on an invalid response
			}
		}

		// Function to handle AJAX failure
		function handleFailure(response) {
			chat_util.checkAjaxResponse(response.responseJSON);
			has_more_rows = false; // Stop on failure
		}

		do {
			var ajax_data = chat_util.constructAjaxData({
				input: listInfo,
				url: "/chats/" + chatId + "/members" // No I18N
			});

			sdpAjax(ajax_data)
				.done(processResponse)
				.fail(handleFailure);

		} while (has_more_rows);

		return users;
	},
	/* Method to appending the group chat members to the group chat */
	appendGroupMembers: function (users, chatID) {
		let count = 0;
		let total_count = 0;
		const $chatBox = jQuery("#sdp-chat-bar").find("#" + chatID);
		if ($chatBox.attr("data-chat-entity") == "channel") {
			const channelId = $chatBox.attr('data-channelid');
			const memberCountDiv = $chatBox.find("#viewmembers" + channelId);
			memberCountDiv.text(users.length);
			memberCountDiv.attr("title", users.length);
		}
		else {
			var $chat_obj = jQuery("#sdp-chat-bar").find("#" + chatID).find(".chat-header1");
			if ($chat_obj.find(".sdmenu-dd2").length !== 0) {
				$chat_obj.find(".sdmenu-dd2").empty();
			}
			else {
				$chat_obj.append(`<div class="bs-noconflict ml5 chatusrsts sdmenu"><span data-switch="sdmenu" id="group_users_count" class="text-link sdmenu-toggle a-tag" aria-label="groupuserscount" data-count="" data-total-users-count=""></span> <div aria-labelledby="replymenu" class="sdmenu-dd chat-moreinfobtn p0" style="width: 278px;"> <ul class="sdmenu-dd2 m0"></ul> </div> </div>`);
			}

			$chat_obj.find("#group_users_count").off("click.chatBox").on("click.chatBox", function () { //No I18N
				chat_box.getChatMembers(this);
			});

			users = users.sort(function (a, b) {
				var x = a.status.toLowerCase();
				var y = b.status.toLowerCase();
				return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			});
			users.forEach(function (item, index, arr) {
				var name = item.member.name;
				var user_status = 'waiticon mr5'; //No I18N
				var userid = item.member.id;
				var login_status = item.status;
				if (userid == sdp_user.LOGGEDIN_USERID && sdp_user.IS_TECH_ONLINE) {
					login_status = 'online'; //No I18N
				}
				if (login_status === 'online') {
					user_status = 'avaicon mr5'; //No I18N
					count++;
				}
				total_count++;
				$chat_obj.find(".sdmenu-dd2").append("<li data-userid='" + userid + "' data-name='groupUser'><div class='a-tag'><span class='" + user_status + "'></span>" + e_html(name) + "</div></li>");

			});
			$chat_obj.find(".sdmenu-dd2").off("click.userProfile").on("click.userProfile", "[data-name='groupUser']", function () {//No I18N
				let userIdForProfile = this.dataset.userid;
				$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userIdForProfile+'&minContent=true&externalframe=true', translate('sdp.inventory.wsRtPanel.userDetails'), '600px'); //No I18N
			});
			$chat_obj.find(".bs-noconflict").removeClass('hide');
			$chat_obj.find("#group_users_count").attr("data-count", count).html(translate("common.chat.users.active", [count]));
			$chat_obj.find("#group_users_count").attr("data-total-users-count", total_count);
		}

	},
	/* Method for continueing a chat from chat history */
	continueChat: function (chatId) {
		jQuery('body').removeClass('of-h'); // NO I18N
		jQuery('#common-chats').remove();
		jQuery('#chat-history1').remove();
		closeDialog();
		chtload.openRecentChat(chatId);
		chat_box.chatmaximizefn(jQuery("#sdp-chat-bar").find("#" + chatId).find(".chat-mini-header"));
		chat_box.focusChatTextArea(chatId);
	},
	/* Method for removing the close chat button from the chat popup */
	removeCloseChatButton: function (chatId) {
		const $chat_obj = jQuery("#sdp-chat-bar #" + chatId);
		$chat_obj.find(".chat-header1").find("#closechat").addClass("hide");
		$chat_obj.find(".chat-mini-header").find("#closechat").addClass("hide");
	},
	/* Method for showing the close chat button from the chat popup */
	openCloseChatButton: function (chatId) {
		const $chat_obj = jQuery("#sdp-chat-bar #" + chatId);
		$chat_obj.find(".chat-header1").find("#closechat").removeClass("hide");
		$chat_obj.find(".chat-mini-header").find("#closechat").removeClass("hide");
	},
	/* Method for changing the online users count for the group chat */
	changeGroupMembersCount: function (chatId, techId, type) {
		if (techId != sdp_user.LOGGEDIN_USERID) {
			let is_users_exists = false;
			let $obj = jQuery("#sdp-chat-bar").find("#" + chatId).find(".chat-header1");
			let $li_obj = $obj.find(".sdmenu-dd2").find('li');
			jQuery.each($li_obj, function () {
				let groupTechId = jQuery(this).attr("data-userid");
				if (groupTechId !== undefined && techId == groupTechId) {
					let status_cls = jQuery(this).find('span').attr('class');
					if (type === 'user_login' && status_cls.indexOf("waiticon") > -1) {
						is_users_exists = true;
						jQuery(this).find('span').removeClass('waiticon').addClass('avaicon');
					}
					else if (type === 'user_logout' && status_cls.indexOf("avaicon") > -1) {
						is_users_exists = true;
						jQuery(this).find('span').removeClass('avaicon').addClass('waiticon');
					}
					//break;
				}
			});

			if (is_users_exists) {
				var count = parseInt($obj.find("#group_users_count").attr("data-count"));
				if (count >= 0) {
					if (type === "user_login") {
						count = count + 1;
					}
					else {
						count = count - 1;
					}
					if (count >= 0) {
						$obj.find("#group_users_count").attr("data-count", count).html(translate("common.chat.users.active", [count]));
					}
				}
			}
		}

	},
	/* Method to get the add/remove member message */

	getAddRemoveMemberMesg: function (mesgObj, type) {
		let byUserId = mesgObj.by_user.id;
		let byUserName = mesgObj.by_user.name;
		if (sdp_user.LOGGEDIN_USERID === byUserId) {
			byUserName = translate('common.common.you');
		}
		if (sdp_user.USERTYPE !== "Requester") {
			var byUserMesg = chat_actions.getUserHrefLink(byUserId, byUserName);
		}
		else {
			var byUserMesg = e_html(byUserName);
		}

		const addedMembers = mesgObj.members_array;
		const len = addedMembers.length;
		let addedMemberMsg = "";
		for (var i = 0; i < len; i++) {
			let memberObj = addedMembers[i];
			let name = memberObj.name;
			let userId = memberObj.id;
			if (sdp_user.USERTYPE !== "Requester") {
				var userMesg = chat_actions.getUserHrefLink(userId, name);
			}
			else {
				var userMesg = e_html(name);
			}
			if (addedMemberMsg === '') {
				addedMemberMsg = userMesg;
			}
			else {
				addedMemberMsg = addedMemberMsg + " , " + userMesg;
			}


		}
		var mesg = translate("chat.new.member.added.by", [byUserMesg, addedMemberMsg]);
		if (type === 'member_removed') {
			mesg = translate("chat.new.member.removed.by", [byUserMesg, addedMemberMsg]);
		}
		if (type === 'member_left') {
			mesg = translate("chat.new.member.leftgroup", [byUserMesg]);
		}
		return mesg;
	},

	/* Method for showing the add/remove member notice from the chat */

	showAddRemoveMemberNotice: function (response, type) {
		response.message = jQuery.parseJSON(response.message);
		let addedOrRemoveUserMesg = chat_box.getAddRemoveMemberMesg(response.message, type, response);
		if (sdp_user.LOGGEDIN_USERID === response.message.by_user.id && type === "new_member_added") {
			jQuery("#view-members").remove();
			chat_box.focusChatTextArea(response.id);
		}
		chat_actions.showChatNotice(response.id, addedOrRemoveUserMesg, type, response.time, false);

		// Removing the add new member notice in case of collaborators chat
		const $chatObj = jQuery("#sdp-chat-bar #" + response.id);
		const chat_entity = $chatObj.attr("data-chat-entity");
		if (chat_entity === 'collaborators_chat' && type === 'new_member_added') {
			const userId = response.message.members_array[0].id;
			chat_box.removeAddTechNotice(response.id, userId);
		}
	},
	showUserLeftMessage: function (response) {
		response.message = jQuery.parseJSON(response.message);
		chat_box.removeActiveChat(response.id);
		let mesg = translate("chat.left.group");
		chat_actions.showChatNotice(response.id, mesg, "member_left", response.time, false);  //No I18N
		chat_actions.removeActionsAndTextArea(response.id, response.status === 'completed');//No I18N
		jQuery("#sdp-chat-bar #" + response.id).find("#group_users_count").remove();
		jQuery("#sdp-chat-bar #" + response.id).find("#usersCount").remove();
	},
	/* Method for showing the users when chat entity (support group/project) deleted */
	showChatEntityDeleted: function (response) {
		const chatId = response.id;
		response.message = jQuery.parseJSON(response.message);
		let mesg = translate("chat.group.deleted.by", [chat_actions.getUserHrefLink(response.message.by_user.id, response.message.by_user.name)]);
		chat_actions.showChatNotice(chatId, mesg, "group_removed", response.time, false);  //No I18N
		chat_actions.removeActionsAndTextArea(chatId, response.status === 'completed');//No I18N
		// removing close chat server call action as the chat is deleted
		const $chatObj = jQuery("#sdp-chat-bar #" + chatId);
		$chatObj.find(".chat-header1 #closechat").off('click.sdevent').on('click.chatBox', function () { chat_box.closeChatBox(chatId.toString()) });//No I18N
		$chatObj.find(".chat-mini-header #closechat").off('click.sdevent').on('click.chatBox', function () { chat_box.closeChatBox(chatId.toString()) });//No I18N
	},
	/* Method for focusing the chat text area */

	focusChatTextArea: function (chatId) {
		const $chat_obj = jQuery("#sdp-chat-bar").find("#" + chatId);
		const is_text_area_disabled = $chat_obj.find('#chat_input-' + chatId).attr('disabled');
		if (is_text_area_disabled == undefined && $chat_obj.find('.chat-mini-header').hasClass('hide')) {
			$chat_obj.find('#chat_input-' + chatId).trigger('focus');
		}
	},
	/* Method to add active class for the chat when load from chat history */

	addActiveChatClass: function (chatId) {
		const $target = jQuery(".ui-dialog #all_user_chats li");
		$target.each(function (idx, li) {
			var history_chatId = jQuery(this).attr("data-chatid");
			if (history_chatId == chatId) {
				jQuery(this).addClass("row m0 cur-ptr block-highlighted");
			}
			else {
				jQuery(this).removeClass("block-highlighted");
			}
		});

	},
	/*Method to remove the highlight div when chat is disabled.*/
	removeHighlightZone: function (chatId) {
		let $chat_drop = jQuery(`#chat_drop_zone_${chatId}`);
		$chat_drop.remove();
		let $chat_drag = jQuery(`#chat_drag_zone_${chatId}`);
		$chat_drag.off('dragover dragenter'); // NO I18N
	},
	/* Method for showing the existing chat users that new member is joined */

	showUserJoinedMesg: function (response) {
		response.message = jQuery.parseJSON(response.message);
		let mesg = translate("chat.new.member.joined", [chat_actions.getUserHrefLink(response.message.by_user.id, response.message.by_user.name)]);
		chat_actions.showChatNotice(response.id, mesg, "new_member", response.time, false);  //No I18N

		// Removing the add new tech message if exists
		chat_box.removeAddTechNotice(response.id, response.message.by_user.id);

	},
	/* Method for removing the add new tech message after user is added, this will happen in case of collaborators chat only */

	removeAddTechNotice: function (chatId, userId) {
		const $target = jQuery("#sdp-chat-bar #" + chatId);
		$target.find(".chat-addedtech #" + userId).parents(".chat-reqdetails").remove();//No I18N
	},
	/* Method for changing the Start Quick Chat action to 1 Active chat view model */

	changeQuickStartChatAction: function (chatId) {
		content = "<div class='chat-link text-dark'><span class='cspr flat icon-sm wechat opac5 mr5'></span>" + translate("chat.one.active.chat") + "<a href='/' class='fr' data-name='collabChatView' rel='noopener' >" + translate('sdp.common.view') + "</a></div>";
		jQuery("#start_quick_chat").html(content);
		jQuery("#start_quick_chat").find("[data-name='collabChatView']").on("click.collabContainer", function () { //NO I18N
			chtload.openRecentChat(chatId.toString());
		});
	},
	/* Method for checking whether to show the message received from other user in the external chat */

	checkChatMessageToBeShown: function (chatId) {
		if (sdp_chat.active_chatids.indexOf(chatId) > -1) {
			//Chat present in the active_chatids so message can be shown
			return true;
		}
		return false;
	},
	/**Method to get total number of channel users */
	setTotalChannelUsersCount(channelID, portal_id, chatID) {
		let url = "/channels/" + channelID + "/users/_total_count";// NO I18N
		url = chtload.appendPortalParam(url, portal_id);
		let count;
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "GET" // No I18N

		});
		sdpAjax(ajax_data).done(function (response) {
			count = response._total_count.users;
			const $chatBox = jQuery("#sdp-chat-bar").find("#" + chatID);
			const $viewMembersDiv = $chatBox.find("#viewmembers" + channelID);
			$viewMembersDiv.text(count);
			$viewMembersDiv.attr("title", count);
		});
	}

};