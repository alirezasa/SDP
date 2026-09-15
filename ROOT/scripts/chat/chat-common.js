// This section contains code related to the other functions such as attachment component and store open chats info etc.
/**********************************************begin cookie storage**********************************************/

var chat_util = {
	// sdp_open_chats will be updated in local storage
	setChatInfo: function (obj) {
		var open_chats = getValue("sdp_open_chats");//No I18N 
		if (open_chats == null) {
			var value = "[" + obj + "]";
			var name = "sdp_open_chats"; //No I18N
			setValue(name, value);
		} else {
			var new_chatIds = new Array();
			var state = null;
			var id = null;
			var details = {};
			var open_chats = jQuery.parseJSON(open_chats);
			var new_open_chats = [];
			var len = open_chats.length;
			for (var i = 0; i < len; i++) {
				id = open_chats[i].id;
				if (chat_box.getActiveChatIndex(id) >= 0) {
					new_chatIds.push(id);
					state = open_chats[i].state;
					if (state === 'max') {
						jQuery("#sdp-chat-bar #" + open_chats[i].id).find(".chat-mini-header").trigger('click');
					}
					details.id = id;
					details.state = state;
					new_open_chats.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));
				}
			}
			var active_len = sdp_chat.active_chatids.length;
			for (var j = 0; j < active_len; j++) {
				if (new_chatIds.indexOf(sdp_chat.active_chatids[j]) < 0) {
					details.id = sdp_chat.active_chatids[j];
					details.state = "min"; //No I18N
					new_open_chats.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));

				}
			}
			var value = "[" + new_open_chats + "]";
			var name = "sdp_open_chats"; //No I18N
			setValue(name, value);
		}
	},
	updateChatInfo: function (chatId, new_state, type) {
		if (chatId != undefined && !is_external_chat) {
			var sdp_open_chats = getValue("sdp_open_chats"); //No I18N
			var state = null;
			var id = null;
			var details = {};
			if (sdp_open_chats !== null) {
				var open_chats = jQuery.parseJSON(sdp_open_chats);
				var len = open_chats.length;
				var new_chats = [];
				for (var i = 0; i < len; i++) {
					id = open_chats[i].id;
					if (chat_box.getActiveChatIndex(id) >= 0) {
						state = open_chats[i].state;
						if (id == chatId && type === 'close') {
							continue;
						} else if (id == chatId) {
							state = new_state;
						}
						details.id = id;
						details.state = state;
						new_chats.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));
					}

				}
				if (type === 'pickup') {
					details.id = chatId;
					details.state = new_state;
					new_chats.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));

				}
				len = new_chats.length;
				if (len > 0) {
					var value = "[" + new_chats + "]";
					var name = "sdp_open_chats"; //No I18N
					setValue(name, value);
				} else {
					removeItem("sdp_open_chats"); //No I18N
				}
			} else {
				var obj = [];
				details.id = chatId;
				details.state = new_state;
				obj.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));
				if (!is_external_chat) {
					chat_util.setChatInfo(obj);
				}
			}
		}
	},
	/**********************************************end of cookie storage**********************************************/
	/* initialize the Attachment Preview component*/
	initiateATP: function (container) {
		if (container === void 0) {
			container = ".chat-content-wrapper";  //No I18N
		}
		jQuery(container).each(function () {
			var atpI = new attachPreview(jQuery(this), {
				target: "button.attach-target", //No I18N
				enable_delete: false,
				title: false,
				attachWrap: true
			});
			jQuery(this).find("button.attach-target").removeClass("attach-target");
		});
	},
	/* Re-initialize the Attachment Preview component*/
	reinitateATP: function (target, from) {
		if (target === void 0) {
			target = ".chat-content-wrapper"; //No I18N
		}
		/**
		 * Add new index for attachments
		 */
		jQuery(target).each(function () {
			jQuery(this).find(".preAttach").each(function () {
				var pre = jQuery(this);
				pre
					.closest(".btn-group") //No I18N
					.replaceWith('<button type="button" class="attach-target" data-href="' + pre.attr('data-attach-url') + '">' + pre.attr('data-attach-name') + '</button>');//No I18N
			});
		});
		if (!is_external_chat) {
			from == "channel-details" ? chat_util.initiateATP("#recentconv") : chat_util.initiateATP(); //No I18N
			initTooltip('.chat-wrapper'); //No I18N
			initTooltip('.chat-mini-header');//No I18N
		}
	},
	showChatAlert: function (mesg) {
		if (!is_external_chat) {
			showalert('failure', e_html(mesg), "isAutoHide=true"); // No I18N
		} else {
			alert(mesg);
		}
	},
	showZiaBot: function () {
		if (is_zia_initialized) {
			jQuery('.zia-chat').removeClass('hide');
		} else {
			sdp_app.zia_info.CAN_SHOW_ICON = true;
			ziacallchat();
		}
		chtload.chatpickalignmentfn();
	},
	isChatFortechnician: function (entitystr) {
		if (entitystr == "technician_chat" || entitystr == "support_group_chat" || entitystr == "collaborators_chat" || entitystr == "fluid_group_chat" || entitystr == "channel" || entitystr == "change") {
			return true;
		} else {
			return false;
		}
	},
	//To show the messages for chat
	processmessages: function (chatID, messages, prepend, is_from_history, is_from_scroll, from_recent, from_channeldetails) {
		let last_userid = null;
		messages.forEach(function (item, index, arr) {
			let msgStr = "";
			let _self = item;
			if (_self.type === 'note') {
				msgStr = chat_util.unescapeForText(_self.chat_note.note);
			} else if (_self.type === 'attachment') {
				msgStr = _self.attachment.name;
			} else {
				msgStr = _self.text;
			}
			let attachment_url = null;
			let attachment_size = null;
			if (_self.type && _self.type == "attachment") { //No I18N
				attachment_url = _self.attachment.content_url;
				attachment_size = _self.attachment.size.value;
			}
			last_userid = _self.user.id;
			if (from_channeldetails) {
				if (_self.type !== 'action') {
					chat_actions.showChatMessage(chatID, _self.id, _self.user.name, _self.user.id, msgStr, _self.time.formatted_value, _self.time.value, _self.type, attachment_url, prepend, attachment_size, is_from_history, msgStr, is_from_scroll, from_recent, from_channeldetails, item);
				}
			}
			else {
				chat_actions.showChatMessage(chatID, _self.id, _self.user.name, _self.user.id, msgStr, _self.time.formatted_value, _self.time.value, _self.type, attachment_url, prepend, attachment_size, is_from_history, msgStr, is_from_scroll, from_recent, from_channeldetails, item);
			}
		});
		const $chatObj = jQuery("#sdp-chat-bar").find("#" + chatID);
		if (!$chatObj.find(".chattxt").attr("contenteditable")) {
			$chatObj.find("[data-name='replyToElem']").addClass("opac5 cur-na").off("click.chatBox");// NO I18N
		}
		return last_userid;
	},

	//converts input tag to dropdown in requester chat tab
	reqgroupsdropdown: function () {
		let ajax_data = chat_util.constructAjaxData({
			input: {
				"list_info": { //No I18N
					"row_count": "100" //No I18N
				}
			},
			url: "/chats/group" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				var select2_data = [];
				response.group.forEach(function (item, index, arr) {
					select2_data.push({ "id": item.id, "text": chat_util.unescapeForText(item.name) }); //No I18N
				})
				jQuery("#qc_grpSearch").select2({
					data: select2_data,
					placeholder: translate("common.select.group"), //No I18N
					allowClear: true,
					multiple: false,
					formatNoMatches: function (term) {
						if (term) {
							return translate("common.no.match.found"); //No I18N
						} else {
							return translate("common.no.record.found"); //No I18N
						}
					},
					formatSearching: function () {
						return translate("common.searching"); //No I18N
					},
					formatSelection: function (m) {
						m = m.text.replace(/\\\\/g, '\\'); //No I18N
						return chat_util.escapeForText(m);
					}
				});
			}
		});
	},
	//method to load sdp-channels.js or sdp-channels-config.js if it is not yet loaded
	Loadsdpchanneljs: function (type) {
		var res = false;
		let url = type == "config" ? `/scripts/sdp-chat-channels-config.js` : `/scripts/sdp-chat-channels.js`; //No I18N
		if (sdp_chat.isDevMode) {
			url = type == "config" ? `/scripts/sdp-channels-config.js` : `/scripts/sdp-channels.js`; //No I18N
		}
		if ((type == "ops" && typeof sdp_channels == "undefined") || (type == "config" && typeof channelConfig == "undefined")) {
			//Here sdpAjax is used instead of resourceloader due to the availability of async param in sdpAjax
			//As this method is used to load required js it cannot return true/false without actually loading the js asynchronously
			sdpAjax({
				url: url,
				dataType: "script", //No I18N
				cache: true,
				async: false,
				success: function (response) {
					res = true;
				}
			});
			if (window.checkIfMSPOrSCP() && (typeof AGBulkSelect == "undefined" || sdp_chat.isDevMode)) {
				ResourceLoader({
					js: ["/scripts/AGMultiBox.js"] // No I18N
				});
			}
		}
		else {
			return true;
		}
		return res;
	},
	//used to define the direction for channel info popup
	getChannelInfoPopupDirection: function () {
		let direction;
		if (sdp_user.USERTYPE === "Requester") {
			direction = sdp_user.DIRECTION === "RTL" ? "left" : "right";// NO I18N
		} else {
			direction = sdp_user.DIRECTION === "RTL" ? "right" : "left";// NO I18N
		}
		return direction;
	},
	/* Common function for contructing api data for ajax call */
	constructAjaxData: function (params) {
		var input = "";
		var ajax_data = {};
		ajax_data.url = params.url;
		ajax_data.type = "GET"; //No I18N
		ajax_data.method = "GET"; //No I18N
		ajax_data.cache = false;
		ajax_data.async = false;
		if (params.cache) {
			ajax_data.cache = params.cache;
		}
		if (params.type) {
			ajax_data.type = params.type;
			ajax_data.method = params.type;
		}
		ajax_data.url = "/api/v3" + ajax_data.url; //No I18N
		if (params.input) {
			if (typeof params.input == "string") {
				input = params.input;
			} else {
				input = (typeof sdpToJSON != 'undefined') ? sdpToJSON(params.input) : JSON.stringify(params.input); //NO I18N
			}
			input = { input_data: input };
			ajax_data.data = input;
		}
		if (params.ignorefailuremessage) {
			ajax_data.ignorefailuremessage = params.ignorefailuremessage;
		}

		return ajax_data;
	},
	/* Method for checking the API output response */
	checkAjaxResponse: function (response, api) {
		var status;

		if (response.response_status instanceof Array) {
			status = response.response_status[0].status.toLowerCase();
		} else {
			status = response.response_status.status.toLowerCase();
		}

		if (status != "failed") {
			return true;
		} else {
			chtload.showAjaxError(response.response_status.messages[0].message);
			return false;
		}
	},
	/*Method for unescaping a text */
	unescapeForText: function (a) {
		if (a != null) {
			a = a.replace(/&amp;/g, "&");
			a = a.replace(/&lt;/g, "<");
			a = a.replace(/&gt;/g, ">");
			a = a.replace(/&#34;/g, '"');
		}
		return a;
	},
	/*Method for escaping a text */
	escapeForText: function (a) {
		if (a != null) {
			a = a.replace(/&/g, "&amp;");
			a = a.replace(/</g, "&lt;");
			a = a.replace(/>/g, "&gt;");
			a = a.replace(/"/g, "&#34;");
		}
		return a;
	},
	setChatPortalId: function (chatId, portalId) {
		jQuery("#sdp-chat-bar #" + chatId).attr("data-portalid", portalId);
	},
	 // Utility function for hyperlink creation logic
	createHyperlinks: function (txt, $template, type) {
		if (type === 'attachment' || type === 'action') {
			return;
		}

		const replacePattern = /((?:https?|ssh|ftp|file|notes|ewb|Notes|mailto):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;()]*[-A-Z0-9+&@#\/%=~_|])/gim;
		const textArray = txt.split(replacePattern);
		const chat_class = type === 'note' ? 'addnotesattach' : 'chat-reqques'; //No I18N
		const count = type === 'note' ? 1 : 0; //No I18N

		textArray.forEach((text, i) => {
			const $target = jQuery($template.find(`[data-name="${chat_class}"] span`)[count]);

			if (i % 2 === 0) {
				if (text.length > 0) {
					$target.append(document.createTextNode(text));
				}
			} else {
				const anchor = document.createElement("a");
				anchor.setAttribute('href', text);
				anchor.setAttribute('target', '_blank');
				anchor.setAttribute('style', 'word-break:break-all;display:inline-block;');
				anchor.setAttribute('class', 'text-link');
				anchor.setAttribute('rel', 'noopener noreferrer');
				anchor.innerText = text;
				$target.append(anchor);
			}
		});
	},
	// Utility function to update mentions in specified div
    updateMentionsInMsg : function($div, mentions, type) {
		if (!mentions || mentions.length === 0) { return; }
		const replaceText = function(text, mentionId, mentionName, isHtml) {
			if (isHtml) {
				return text.replace(`{@${mentionId}}`, chat_actions.getUserHrefLink(mentionId, mentionName));
			}
			return text.replace(`{@${mentionId}}`, mentionName);
		};

		for (let i = 0; i < mentions.length; i++) {
			const mention = mentions[i];
			if (type === "html") {
				$div.html(replaceText($div.html(), mention.id, mention.name, true));
			} else if (type === "text") { //No I18N
				$div.text(replaceText($div.text(), mention.id, mention.name, false)).attr("title", e_attr($div.text()));
			}
		}
    }
};

function changeWindowTitle(title) {
	window.top.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON({ "type": "change_window_title", "title": title }) : JSON.stringify({ "type": "change_window_title", "title": title }), external_chat_origin); //No I18N
}

function stopTitleToggling() {
	window.top.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON({ "type": "stop_toggling" }) : JSON.stringify({ "type": "stop_toggling" }), external_chat_origin); //No I18N
}

jQuery(window).off('resize.chat').on('resize.chat', function () { //No I18N
	chtload.chatpickalignmentfn();
});


var redirect = {
	switchtoChats: function (a) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.switchtoChats(a);
		}
	},
	renderchannels: function (val, from) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.renderchannels(val, from);
		}
	},
	loadUserChannelsinSearch: function (ajax_data, input_data, from) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.loadUserChannelsinSearch(ajax_data, input_data, from);
		}
	},
	getactionsobj: function (chat_type, channelactions) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			const actions = sdp_channels.getactionsobj(chat_type, channelactions);
			return actions;
		}
	},
	closehbsdialog: function (a) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.closehbsdialog(a);
		}
	},
	openAllChannels: function (a) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.openAllChannels(a);
		}
	},
	viewChannelDetails: function (a, showBackNav) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.viewChannelDetails(a, showBackNav);
		}
	},
	listarchivedanddeletedChannels(type) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.listarchivedanddeletedChannels(type);
		}
	},
	handlePinMessages: function (message, type) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.handlePinMessages(message, type);
		}
	},
	showTemporaryChatAction: function (message, type) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.showTemporaryChatAction(message, type);
		}
	},
	displayArchiveNoteinChatbox: function (chatID, note) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.displayArchiveNoteinChatbox(chatID, note);
		}
	},
	handlenewchannel: function (message, type) {
		if (chat_util.Loadsdpchanneljs("ops")) {
			sdp_channels.handlenewchannel(message, type);
		}
	},
	createNewChannelPopup: function (from, response) {
		if (chat_util.Loadsdpchanneljs("config")) {
			channelConfig.createNewChannelPopup(from, response);
		}
	},
	updateChannelInfo: function (from, response) {
		if (chat_util.Loadsdpchanneljs("config")) {
			channelConfig.updateChannelInfo(from, response);
		}
	}
};
