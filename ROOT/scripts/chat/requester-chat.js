// This section contains code related to the requester chat.
var requester_chat = {

	/* Show notification to the Requester whose chat is transfered succefully. */
	myChatTransfered: function (response) {
		chat_actions.showChatNotice(response.id, translate("chat.transfered.to", [e_html(response.message)]), "transfer", response.time, false);  //No I18N
		jQuery("#sdp-chat-bar #" + response.id + " .chat-header1 .chatusrname").text(response.message);
		jQuery("#sdp-chat-bar #" + response.id).find(" .chat-mini-header .chatusrname").text(response.message);
		jQuery("#sdp-chat-bar #" + response.id).attr("data-title", e_attr(response.message));
	},

	/* Called when technician accepts a chat request. */
	chatMessageAccepted: function (response) {
		if (chtload.options.usertype == "Technician") {
			if (response.from != chtload.options.userid) {
				const $target = jQuery(".chatmain-column #chat-" + response.id);
				if ($target.length > 0) {
					requester_chat.removeActiveChatFromList(response.id);
					window.showalert('success', translate("chat.accepted.by", [e_html(response.message)]), "isAutoHide=true"); // No I18N
				}
			}
		} else {
			chat_box.openCloseChatButton(response.id);
			requester_chat.removeChatNotice(response.id, "welcome"); //No I18N
			chat_actions.showChatNotice(response.id, translate("chat.accepted.by", [e_html(response.message)]), "transfer", response.time, false);  //No I18N
			const $chatbox = jQuery("#sdp-chat-bar #" + response.id);
			$chatbox.find(" .chat-header1 .chatusrname").text(response.message)
			$chatbox.find(" .chat-mini-header .chatusrname").text(response.message)
			$chatbox.attr("data-title", e_attr(response.message));
			jQuery('.chatmain-column .chat-mini-header, .chat-header1').removeClass("backgroundOrange");
		}
	},
	/* When Tech clicks button to pickup a new chat */
	chatpickupfn: function (a) {
		if (chat_box.threeChatboxPresent()) {
			const $this_obj = jQuery(a);
			const chatID = $this_obj.attr("data-chatid");  //No I18N
			const portal_id = $this_obj.attr("data-portalid");  //No I18N
			let url = "/chats/" + chatID + "/_pickup" //No I18N
			url = chtload.appendPortalParam(url, portal_id);
			let ajax_data = chat_util.constructAjaxData({
				type: "PUT", //No I18N
				url: url
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					chat_util.updateChatInfo(chatID, "max", "pickup"); //No I18N
				}
			});
		}
	},
	/* Shows message when a chat is closed or on end session. Also called when a chat is missed on Requester side. */
	closeChat: function (response) {
		let msg = translate("chat.closed.by", [e_html(response.message)]);
		let type = "transfer"; //No I18N
		if (response.type == "chat_dropped") {
			msg = response.message;
			type = "welcome"; //No I18N
		}
		else if (response.type == "transfer_chat_accepted") {
			msg = translate("chat.transfer.accepted.by", [e_html(response.message)]); //No I18N
			// removing tranfer chat div if exists
			const $chatBox = jQuery("#sdp-chat-bar").find("#" + response.id);
			$chatBox.find('.chat-transferchat').addClass('hide'); //No I18N
			$chatBox.find('.chat-mndropdown').removeClass('hide'); //No I18N

		}
		else if (response.type == "chat_closed") {
			type = "chat_closed"; //No I18N
		}
		chat_box.removeActiveChat(response.id);
		chat_actions.showChatNotice(response.id, msg, type, response.time, false);
		chat_actions.removeActionsAndTextArea(response.id, true);
		chat_box.openCloseChatButton(response.id);
		requester_chat.removeFromRecentChats(response.id);
		chat_box.removeHighlightZone(response.id);
	},
	/* Close a chat or end a chat session. */
	chatclosefn: function (a) {
		const chatID = jQuery(a).parents(".chatbar-maincontent").attr("id"); //No I18N
		const $chatBar = jQuery("#sdp-chat-bar");
		if (is_external_chat) {
			$chatBar.find('div.chatmain-column').removeClass('hide');
			if (sdp_chat.active_chatids.length == 0) {
				minimizeExternalIframe("");
				$chatBar.find("div.chat-mini-header").removeClass("hide");
			}
		}
		requester_chat.openCloseChatPopUP(chatID, 'x-button'); //No I18N
	},
	/* Opening a pop up for requester chat --> Close chat action */
	openCloseChatPopUP: function (chatID, from) {
		function codeblock() {
			if (!is_external_chat) {
				jQuery('body').append('<div id="close-chat" data-chatid="' + chatID + '"></div>');
				renderhbs('#close-chat', 'close-create-request', { "chatID": chatID }, false, 'chat/Technician/ChatOperations'); // NO I18N
				var $template = jQuery("#close-chat");
				var workorder_id = jQuery("#sdp-chat-bar #" + chatID).find('.chatuserid').find('span').text();
				$template.remove();
				if (workorder_id !== "" || sdp_user.USERTYPE == "Requester") {
					function confirmClose(boo, btn) {
						if (boo) {
							if (btn == 'submitButton') {
								var $chatObj = jQuery("#sdp-chat-bar").find("#" + chatID);
								var chat_entity = $chatObj.attr("data-chat-entity");
								requester_chat.closeOngoingChat(chatID);
								if (!is_external_chat && sdp_user.USERTYPE == "Requester" && sdp_app.zia_info.IS_BOT_ENABLED && chat_entity == "requester_chat") {
									chat_util.showZiaBot();
								}
							}
						}
					}
					var message = translate("chat.close.chat.warning")
					showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("sdp.common.close") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', confirmClose); //No I18N
					return;
				}
				
				let is_role_exists = sdp_user.ROLES.indexOf("CreateRequests") > 1;
				const chat_portalid = jQuery("#sdp-chat-bar #" + chatID).attr("data-portalid");
				if (chat_portalid != PORTALID) {
					is_role_exists = requester_chat.getCreateReqRoleExistsInPortal(chatID, chat_portalid);
				}
				if (sdp_user.USERTYPE === 'Technician' && is_role_exists && workorder_id === "") {
					var templates_element;
					var key;
					var catalog_element = is_service_catalog_enabled;
					if (chat_portalid != PORTALID) {
						requester_chat.getPortalRequestTemplates(chatID, chat_portalid);
						templates_element = portal_template_obj.service_categories;
						catalog_element = is_portal_service_catalog_enabled;
						key = "request_templates";  //No I18N
					}
					else {
						templates_element = template_obj.cloneCategories();
						key = "templates";  //No I18N
					}
					$template.find("#select_chat_template,p").removeClass('hide');
					if (from === 'x-button') {
						$template.find("#close_create_request").removeClass('hide');
					}
				}
				if (from === 'x-button') {
					$template.find("#close_chat").removeClass('hide');
				}
				else {
					$template.find("#create_request").removeClass('hide');
				}
				// removing the radio buttions if the license is not enterprise edition
				if (!catalog_element) {
					$template.find("#incident_req,#service_req").parent('label').remove(); //No I18N
				}

				createRequestPopUp($template, templates_element, key);
				jQuery('input[name="chat_template"]').off('change.closeChat').on('change.closeChat', function () {// NO I18N
					onChangeTemplate(this, jQuery(this).val(), 'chat'); // NO I18N
				});
				jQuery("[aria-label=chatreqclosebtn]").off("click.closeChat").on("click.closeChat", function () {// NO I18N
					requester_chat.confirmCloseChat(this);
				});
				jQuery("#create_request").off("click.closeChat").on("click.closeChat", function () {// NO I18N
					requester_chat.createReqForChat(this);
				});
				jQuery("#close_create_request").off("click.closeChat").on("click.closeChat", function () {// NO I18N
					requester_chat.closeChatCreateRequest(this);
				});
				jQuery("#close-chat").find("[aria-label=chatreqclose2btn]").off("click.closeChat").on("click.closeChat", function () {// NO I18N
					closeDialog();
				});

			}
			else {
				if (confirm(translate("chat.close.chat.warning")) == true) {
					requester_chat.closeOngoingChat(chatID);
				}
			}
		}
		if (!sdp_chat.technician_chatops_hbs && !is_external_chat) {
			ResourceLoader({
				js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
				success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
			});
		}
		else { codeblock(); }
	},
	/* Changing button class based on the template selection */
	changeButtonClass: function (a) {
		const $parentObj = jQuery(a).parents("#close_create_req"); //No I18N
		const $close_create_obj = $parentObj.find("#close_create_request");
		const $close_obj = $parentObj.find("#close_chat");
		if (!$close_create_obj.hasClass('hide')) {
			const templateID = $parentObj.find("#temp_selection").val(); //NO I18N
			if (templateID !== '0') {
				$close_create_obj.removeClass().addClass('btn btn-primary ml10');
				$close_obj.removeClass().addClass('btn btn-default mr10');
			} else {
				$close_create_obj.removeClass().addClass('btn btn-default ml10');
				$close_obj.removeClass().addClass('btn btn-primary mr10');
			}
		}

	},

	/* Close chat confirmation */
	confirmCloseChat: function (a) {
		const $this_obj = jQuery(a);
		const chatID = $this_obj.attr('data-chatid');
		const $chatObj = jQuery("#sdp-chat-bar").find("#" + chatID);
		const chat_entity = $chatObj.attr("data-chat-entity");
		requester_chat.closeOngoingChat(chatID);
		if (!is_external_chat && sdp_user.USERTYPE == "Requester" && sdp_app.zia_info.IS_BOT_ENABLED && chat_entity == "requester_chat") {
			chat_util.showZiaBot();
		}
		jQuery("#close-chat").remove();
		closeDialog();
	},

	/* Closing a chat and creating a request */
	closeChatCreateRequest: function (a) {
		const $this_obj = jQuery(a);
		const chatID = $this_obj.attr('data-chatid');
		let ajax_data = chat_util.constructAjaxData({
			url: "/chats/" + chatID + "/_close_create_request", //No I18N
			type: "PUT" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				chat_util.updateChatInfo(chatID, "", "close");
				closeDialog();
				window.showalert('success', response.response_status.messages[0].message, "isAutoHide=true"); // No I18N
				// redirecting to add new request page
				var chat_portalid = jQuery("#sdp-chat-bar #" + chatID).attr("data-portalid");
				requester_chat.submitWOForm(a, chatID, chat_portalid);
			}
		});
	},

	/* Closing a chat */
	closeOngoingChat: function (chatID) {
		let ajax_data = chat_util.constructAjaxData({
			url: "/chats/" + chatID + "/_close", //No I18N
			type: "PUT" //No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				chat_util.updateChatInfo(chatID, "", "close");
				if (!is_external_chat) {
					window.showalert('success', response.response_status.messages[0].message, "isAutoHide=true"); // No I18N
				} else {
					alert(response.response_status.messages[0].message);
				}
			}
		});
	},

	/* Opens dialog for adding note for Tech */
	addNotes: function (a) {
		const chatID = jQuery(a).parents(".chatbar-maincontent").attr("id"); //No I18N
		jQuery('body').append('<div id="add-note"></div>');
		jQuery('#add-note').dialog({
			'modal': true,//NO I18N
			'title': translate("common.notes"),//NO I18N
			'width': 540,//NO I18N
			'height': 800,//NO I18N
			'position': { my: "center", at: "center", of: window },//NO I18N
			'resizable': false,//NO I18N
			'draggable': true,//NO I18N
			'closeOnEscape': true, //NO I18N
			open: function (event, ui) {
				var ele = jQuery(event.target);
				ele.css({ 'height': '100%' });// No I18N
				function codeblock() {
					const input_data = { "chatID": chatID } //No I18N
					renderhbs('.ui-widget #add-note', 'add-note-tab', input_data, false, 'chat/Technician/ChatOperations'); // NO I18N
				}
				if (!sdp_chat.technician_chatops_hbs) {
					ResourceLoader({
						js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
						success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
					});
				}
				else { codeblock(); }

			},
			close: function (event, ui) {
				jQuery('#add-note').remove();
			}
		});
	},

	/* Called when transfer action is clicked by Technician */
	transferchattech: function (a) {
		const $this_obj = jQuery(a);
		const tech_data = $this_obj.parents(".chat-transferchat").find(".intro-avatech").select2("data"); //No I18N
		if (tech_data == null) {
			window.showalert(translate("sdp.request.assignreq.title"));
			return false;
		}
		message = translate("chat.transfer.dialog"); //No I18N
		showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate("sdp.common.ok") + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', function (confirm) { //No I18N
			if (confirm) {
				const chatID = $this_obj.parents(".chatbar-maincontent").attr("id"); //No I18N
				const portalId = $this_obj.parents(".chatbar-maincontent").attr("data-portalid"); //No I18N
				let input_data = {
					"chat": { // No I18N
						"technician": { // No I18N
							"id": tech_data.id //No I18N
						}
					}
				};
				let url = "/chats/" + chatID + "/_transfer"; //No I18N
				url = chtload.appendPortalParam(url, portalId);
				let ajax_data = chat_util.constructAjaxData({
					url: url,
					type: "PUT", // No I18N
					input: input_data
				});
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						requester_chat.canceltransferchat(a);
					}
				}).fail(function (response) {
					chat_util.checkAjaxResponse(response.responseJSON);
				});
			}
		});
	},

	/* Called when accept transfer is clicked by Technician */
	acceptTransferedChat: function (a) {
		if (chat_box.threeChatboxPresent()) {
			const $this_obj = jQuery(a);
			const chatID = $this_obj.attr("data-chatid"); // No I18N
			const portalId = $this_obj.attr("data-portalid"); //No I18N
			let url = "/chats/" + chatID + "/_accept_transfer"; //No I18N
			url = chtload.appendPortalParam(url, portalId);
			let ajax_data = chat_util.constructAjaxData({
				url: url,
				type: "PUT" // No I18N
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					chat_util.updateChatInfo(chatID, "max", "pickup"); //No I18N
				}
			});
		}
	},

	/* Called when reject transfer is clicked by Tech */
	rejectTransferedChat: function (a) {
		const chatID = jQuery(a).attr("data-chatid"); // No I18N
		const portalId = jQuery(a).attr("data-portalid"); //No I18N
		let url = "/chats/" + chatID + "/_reject_transfer"; //No I18N
		url = chtload.appendPortalParam(url, portalId);
		let ajax_data = chat_util.constructAjaxData({
			url: url,
			type: "PUT" // No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if(chat_util.checkAjaxResponse(response)){
				window.showalert('success', response.response_status.messages[0].message, "isAutoHide=true"); // No I18N
			}
		});
	},

	/* Load list of online technicians. */
	transferChat: function (a) {
		const $chatmain = jQuery(a).parents('.chatbar-maincontent'); //No I18N
		$chatmain.find('.chat-transferchat').removeClass('hide'); //No I18N
		let $tech_selectbox = $chatmain.find('.intro-avatech'); //No I18N
		const chatId = $chatmain.attr("id");//No I18N
		const portalId = $chatmain.attr("data-portalid");//No I18N
		let url = "/chats/" + chatId + "/_get_techs_totransfer"; //No I18N
		url = chtload.appendPortalParam(url, portalId);
		let ajax_data = chat_util.constructAjaxData({
			url: url
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				if (response.chat.users) {
					$tech_selectbox.select2('destroy'); //No I18N
					$tech_selectbox.attr("placeholder", ""); //No I18N
					response.chat.users.forEach(function (item, index, arr) {
						item.text = item.name;
						delete item.name;
					});
					$tech_selectbox.select2({

						data: response.chat.users,
						placeholder: translate("common.select.tech") // No I18N
					}).removeClass("hide").prop("disabled", false);  //No I18N
					$chatmain.find('.chat-transferchat').find('button.btn-primary').prop("disabled", false); //No I18N
				} else {
					if ($tech_selectbox.hasClass("select2-container")) {
						$tech_selectbox.select2('destroy'); //No I18N
					}
					$tech_selectbox.prop("disabled", true).attr("placeholder", translate("common.no.online.tech.available")).removeClass("hide").val(""); // No I18N
					$chatmain.find('.chat-transferchat').find('button.btn-primary').prop("disabled", true); // No I18N
				}
			}
		});

	},

	/* Remove all the selected values in transfer chat. */
	canceltransferchat: function (a) {
		const $this_obj = jQuery(a);
		const $tech_selectbox = $this_obj.parents('.chat-transferchat').find('.intro-avatech'); //No I18N
		if ($tech_selectbox.hasClass("select2-container")) {
			$tech_selectbox.select2("val", ""); // No I18N
		} else {
			$tech_selectbox.val("");
		}
		$this_obj.parents('.chat-wrapper').find('.chat-transferchat').addClass('hide'); //No I18N
	},
	/* Remove the notification text in chatbox */
	removeChatNotice: function (id, type) {
		const $target = jQuery("#sdp-chat-bar #" + id);
		if (type == "welcome") { // No I18N
			$target.find(".chat-content-wrapper .chat-wrapcont .addnotice").parents(".chat-reqdetails").remove(); //No I18N
		}
	},

	/* New transfer chat notice */
	newTransferChat: function (response) {
		/* Check if chat is shown in the pick list already, avoid repeatation */
		if (jQuery(".chatmain-column #chat-" + response.id).length == 0) {
			var wait_time = Math.floor((response.expiry_time - response.server_current_time) / 1000);
			response.message = JSON.parse(response.message);
			function codeblock() {
				var input_data = { "response": response } //No I18N
				renderhbs('.chat-bar .chatmain-column .chat-wrapper #requester_chats', 'chat-transfer-request', input_data, true, 'chat/Technician/ChatOperations'); // NO I18N


				/* Start chat pickup countdown */
				var timer = "timer_" + response.id; //No I18N
				/* Store the time in an global object based on chat id so that the timer can be canceled after chat is picked up. */
				chtload.chatPickupTimer[timer] = setInterval(function () {
					jQuery("#chat-" + response.id + " .chatpickcont .adtim").text(wait_time);
					if (wait_time < 11) {
						jQuery("#chat-" + response.id + " .chatpickcont .chat-timer").addClass("chattimepickcount");
					}
					if (wait_time == 0) {
						requester_chat.removeActiveChatFromList(response.id);
					}
					wait_time--;
				}, 1000);

				/* Update the unpicked chat counter. Required to show the Number of new chats in header. */
				requester_chat.chatCounter("+");

				/* Open the chat main column if minified on getting a new chat request. */
				const $chats = jQuery(".chatmain-column #user_chats");
				if ($chats.parent('li').attr("class") !== "active") {
					$chats.trigger("click");
				}
				jQuery("#sdp-chat-bar").find("#req_chat_div").removeClass('hide');
			}
			if (!sdp_chat.technician_chatops_hbs) {
				ResourceLoader({
					js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
					success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
				});
			}
			else { codeblock(); }

		}
	},

	/* Show notice to Tranferer Tech if Transferee Tech has not picked up a transferred chat */
	transferChatDropped: function (response) {
		chat_actions.showChatNotice(response.id, translate("chat.transfer.requested.rejected", [e_html(response.message)]), "transfer", response.time, false); //No I18N
	},

	/* Initiates a new chat from a Open request. */
	openChatForRequest: function (a) {
		const $this_obj = jQuery(a);
		/* Currently only one ongoing chat is allowed per requester */
		let workorderID = $this_obj.attr("data-workorderid");
		workorderID = parseInt(workorderID);
		let input_data = {
			"chat": {// No I18N
				"message": $this_obj.text(), // No I18N
				"request_chat_association": {// No I18N
					"request": {// No I18N
						"id": workorderID // No I18N
					}
				}
			}
		};
		let ajax_data = chat_util.constructAjaxData({
			url: "/chats", //No I18N
			type: "POST", // No I18N
			input: input_data
		});
		sdpAjax(ajax_data).done(function (response) {

			if (chat_util.checkAjaxResponse(response)) {
				const chatID = response.chat.id;
				if (sdp_chat.active_chatids.indexOf(chatID) > -1) {
					chat_box.highlightChatPopUp(chatID);
					chat_box.focusChatTextArea(chatID);
					return;
				}
				else if (response.chat.welcome_message == undefined) {
					chat_box.loadUserNewChat(chatID);
				}
			}
			if (is_external_chat) {
				const $chatBar = jQuery("#sdp-chat-bar");
				$chatBar.find('div.chatmain-column').addClass('hide');
				$chatBar.find("div.chat-mini-header").addClass("hide");
				chtload.chatpickalignmentfn();
				maximizeExternalIframe(response.chat.id);
			}
		}).fail(function (response) {
			chat_util.checkAjaxResponse(response.responseJSON);
		});

	},

	openChatForRequesterOverRequest: function (workorderID) {
		let input_data = {
			"chat": {// No I18N
				"request_chat_association": {// No I18N
					"request": {// No I18N
						"id": workorderID // No I18N
					}
				}
			}
		};
		let ajax_data = chat_util.constructAjaxData({
			url: "/chats", //No I18N
			type: "POST", // No I18N
			input: input_data
		});

		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				const chatID = response.chat.id;
				if (sdp_chat.active_chatids.indexOf(chatID) > -1) {
					chat_box.highlightChatPopUp(chatID);
					chat_box.focusChatTextArea(chatID);
					return;
				}
			}
		});
	},
	/* Handles click event of open request or Enter hit for a new request from Requester side. This will initiate a new chat session. */
	newReqchat: function (e, a) {
		const $this_obj = jQuery(a);
		const keyunicode = chat_box.getKeycode(e);
		/* Enter key */
		if (keyunicode == 13 && !e.shiftKey) {
			/* Prevent default avoids return character. */
			e.preventDefault();
			let txt = $this_obj.val();
			/* If text is empty do not execute. */
			if (txt != '') {
				let $group_select = jQuery("#qc_grpSearch");
				let input_data = {
					"chat": {// No I18N
						"message": "", // No I18N
						"group": {// No I18N
							"id": "", // No I18N
							"name": "" // No I18N
						}
					}
				};
				var group = {};

				/* Currently only one ongoing chat is allowed per requester */
				input_data.chat.message = txt;
				group = $group_select.select2('data'); //No I18N
				if (group == null) {
					delete input_data.chat.group;
					if (sdp_app.IS_SUPPORT_GROUP_MANDATE) {
						chat_util.showChatAlert(translate("api.chat.support.group.mandate")); // No I18N
						return false;
					}
				} else {
					input_data.chat.group.id = group.id;
					input_data.chat.group.name = group.text;
				}



				let ajax_data = chat_util.constructAjaxData({
					url: "/chats", //No I18N
					type: "POST", // No I18N
					input: input_data
				});
				sdpAjax(ajax_data).done(function (response) {
					if (chat_util.checkAjaxResponse(response)) {
						$this_obj.val('');
						$group_select.select2("val", ""); //No I18N
						$this_obj.parents(".chatrow").find("#" + response.chat.id + ".failure").addClass("hide"); //No I18N
						if (!is_external_chat) {
							var obj = [];
							var details = {};
							details.id = response.chat.id;
							details.state = "max"; //No I18N
							obj.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));
							chat_util.setChatInfo(obj);
						} else {
							const $chatBar = jQuery("#sdp-chat-bar");
							$chatBar.find('div.chatmain-column').addClass('hide');//No I18N
							$chatBar.closest("div.chat-mini-header").addClass("hide"); //No I18N
							chtload.chatpickalignmentfn();
							maximizeExternalIframe(response.chat.id);
						}
					}
				}).fail(function (response) {
					chat_util.checkAjaxResponse(response.responseJSON);
				});

			}
		}
	},

	/* Handle return characters and prevents empty notes from submitting. */
	addnoteskeyup: function (a) {
		const $this_obj = jQuery(a);
		const $btn = $this_obj.parents('.chat-addnote').find('.btn-danger, .btn-primary'); //No I18N
		if ($this_obj.val().trim() == "") {
			$btn.prop('disabled', true); //No I18N
			$this_obj.val('');
		} else {
			$btn.prop('disabled', false); //No I18N
		}
	},


	/* Add note */
	addnotesclick: function (a) {
		const $this_obj = jQuery(a);
		let txt = $this_obj.parents('.chat-addnote').find('.descText').val(); //No I18N
		txt = txt.trim();
		const len = txt.length;
		if (txt != '' && len <= 2000) {
			const chatID = $this_obj.attr('data-chatid');
			let publicNote = "0";
			if (jQuery(".mark-note-public input").is(":checked")) {
				publicNote = "1";
			}
			let input_data = {
				"chat_info": { // No I18N
					"type": "note", // No I18N
					"chat_note": { // No I18N
						"is_shared": publicNote, // No I18N
						"note": txt // No I18N
					}
				}
			};

			let ajax_data = chat_util.constructAjaxData({
				url: "/chats/" + chatID + "/messages", //No I18N
				type: "POST", // No I18N
				input: input_data
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					$this_obj.val('');
					redirect.closehbsdialog(jQuery("#add-note"));
				}
				else {
					chat_actions.removeActionsAndTextArea(chatID);
				}
			}).fail(function (response) {
				chat_util.checkAjaxResponse(response.responseJSON);
			});
		} else if (txt != '' && len > 2000) {
			chat_util.showChatAlert(translate("api.chat.send.message.length.warning.message")); // No I18N
			return false;
		}
	},
	/* Remove active chats from list on pickup or on pickup time out */
	removeActiveChatFromList: function (id) {
		const $target = jQuery(".chatmain-column #chat-" + id);
		if ($target.length == 1) {
			$target.remove();

			/* Clear chat timer */
			var timer = "timer_" + id; //No I18N
			clearInterval(chtload.chatPickupTimer[timer]);
			delete chtload.chatPickupTimer[timer];

			/* Update the unpicked chat counter */
			requester_chat.chatCounter("-");
		}
	},
	/* Unpicked chat counter for Tech */
	chatCounter: function (operation) {
		const $obj = jQuery(".chatmain-column");
		const counter = jQuery("#sdp-chat-bar").find("#requester_chats").find(".chatrequest").length;
		if (counter > 0) {
			$obj.find('.chatusrname').attr("data-counter", counter).text(translate("chat.new.count", [counter]));
		}

		if (counter == 0) {
			$obj.find('.chatusrname').text(sdp_user.USERNAME);
			jQuery("#sdp-chat-bar").find("#req_chat_div").addClass('hide');
		}
		chtload.showHideNoChatNotifDiv();
	},
	/* Show unpicked chat for Tech when a new chat is initiated by Requester */
	chatPickupNotice: function (response) {
		/* Check if chat is shown in the pick list already, avoid repeatation */
		if (jQuery(".chatmain-column #chat-" + response.id).length == 0 && chat_box.getActiveChatIndex(response.id) < 0) {
			var wait_time = Math.floor((response.expiry_time - response.server_current_time) / 1000);
			response.message = jQuery.parseJSON(response.message);
			if (jQuery(".chatmain-column #user_chats").parent('li').attr("class") !== "active") {
				jQuery(".chatmain-column #user_chats").trigger("click");
			}
		}
	},
	/* Method for creating a new request for closed chat */
	createReqForClosedChat: function (a) {
		const chatId = jQuery(a).parents(".chatbar-maincontent").attr("id");//No I18N
		requester_chat.openCloseChatPopUP(chatId, 'link');	    //No I18N
	},
	/*Method for creating a request */
	createReqForChat: function (a) {
		const $this_obj = jQuery(a);
		const chatId = $this_obj.attr('data-chatid');
		const chat_portalid = jQuery("#sdp-chat-bar #" + chatId).attr("data-portalid");
		// redirecting to add new workorder page

		if (chat_portalid != PORTALID) {
			requester_chat.submitWOForm(a, chatId, chat_portalid);
		} else {
			requester_chat.submitWOForm(a, chatId);
		}
	},
	/* Method for getting the create new request URL based on the template selection */
	getCreateReqURL: function (a, chatID, chat_portalid) {
		const $this_obj = jQuery(a);
		const $parentObj = $this_obj.parents("#close_create_req"); //No I18N
		const templateID = $parentObj.find("#temp_selection").val(); //NO I18N
		const type = $parentObj.find('input[name=chat_template]:checked').val();
		let url = "/WorkOrder.do?"; //No I18N
		if (templateID !== '0') {
			url = url + "reqTemplate=" + templateID; //No I18N
		}

		if (templateID !== '0' && type === 'service') {
			var serviceId = $parentObj.find("#temp_selection option:selected").parent().attr('id');
			url = url + "&requestServiceId=" + serviceId; //No I18N
		}
		url = url + "&chatID=" + chatID;	//No I18N
		url = url + "&quick_chat_req=true"; //No I18N
		if (chat_portalid != undefined && chat_portalid != PORTALID) {
			url = url + "&PORTALID=" + chat_portalid;  //No I18N
		}
		url = url + "&woMode=quick_chat_req";//No I18N
		return url;
	},
	/* Method for submitting the workorder form */
	submitWOForm: function (a, chatID, chat_portalid) {
		var url = requester_chat.getCreateReqURL(a, chatID, chat_portalid);
		var form = document.createElement("form");
		document.body.appendChild(form);
		form.method = "POST"; //No I18N
		form.action = url;
		var element1 = document.createElement("input");
		element1.value = chatID;
		element1.name = "requestChatId"; //No I18N
		form.appendChild(element1);

		var element3 = document.createElement("input");
		element3.value = getCSRFParamValue();
		element3.name = getCSRFParamName();
		form.appendChild(element3);

		form.submit();

	},
	//render the new chat tab on clicking the new tab button
	openReqNewchatTab: function () {
		let ls = { "list_info": { "row_count": "100" } };//No I18N
		let isOperational = requester_chat.inOperationalHours();
		let input_data = { "list_info": ls, "isOperational": isOperational, "isColsedChatEnabled": sdp_app.IS_CLOSED_CHAT_ENABLED };//No I18N
		renderhbs('#unread_chats_div', 'requester-new-chat-tab', input_data, false, 'chat/Requester', true, false, function () {// NO I18N
			jQuery("#unread_chats_div").find("[data-name='newReqChatInput']").off('keypress.newReqChatInput').on('keypress.newReqChatInput', function (event) { //No I18N
				requester_chat.newReqchat(event, this);
			});
			requester_chat.loadExistReq();
		});
		if (sdp_app.IS_SUPPORT_GROUP_MANDATE) {
			jQuery("#unread_chats_div").find("#mandate_support_group").removeClass('hide');
		}
		chat_util.reqgroupsdropdown();
		if (!sdp_app.IS_NEW_REQ_CHAT_ENABLED) {
			let $doc = jQuery(document);
			$doc.find(".chat-newold-task .newchatreqtype").remove().end()
				.find(".chat-new-reqdetails .chat-quesarea").remove().end()
				.find("#exitreq").prop('checked', true).click(); //No I18N
		}
	},
	/*Method to append requester chat last message is the chat is picked by the user */

	appendReqChatLastMesg: function (chatId, title, userId, chat_entity, day_based_time, requester_status, last_chat_mesg, last_mesg_time, serviceName) {
		if (jQuery("#sdp-chat-bar").find("#user_chats").parent('li').attr('class') === 'active') {
			let user_status = "avaicon"; //No I18N
			if (requester_status == "offline") { //No I18N
				user_status = "waiticon"; //No I18N
			}
			const $recentObj = jQuery("#sdp-chat-bar #recent-chats");
			let content = ""
			if (serviceName == null) {
				content = `<div data-name="recentChat" class="chatrequest pb0 cur-ptr visi-parent" data-chatid="${chatId}" data-chatentity="${chat_entity}" data-time="${day_based_time}" data-userid="${userId}"><div class="disp-t fw"> <div class="chat-dp"> <div class="chat-no-dp"> <svg width="22" height="22" class="thmicon-fill"> <use href="#chat_requester"></use> </svg> <span class="${user_status} mr10 pos-abs top20 ml-5"></span> </div> </div> <div class="disp-c fw pb3 vtop chgrplist pl10"><p class="truncate-ellipsis"><span rel="uitip" id="chat_title" class="truncate-wrapper sb a-tag" title="">${e_html(title)}</span></p><p class='truncate-ellipsis'><span class='truncate-wrapper text-muted font-small maxw-200px'>${e_html(last_chat_mesg)}</span></p></div><div class='disp-c vtop visi-item text-nowrap'><span class='text-color3 font-xsmall'>${last_mesg_time}</span></div></div></div>`;
			}
			else {
				content = "<div data-name='recentChat' title='" + e_attr(title) + "' class='chatrequest pb0 cur-ptr visi-parent' data-chatid='" + chatId + "' data-userid='" + userId + "' data-chatentity='" + chat_entity + "' data-time='" + day_based_time + "'><div class='disp-t fw'><div style='width: 10px;' class='disp-c vtop'><span class='" + user_status + "'></span></div><div class='disp-c fw pb3 vtop'><p class='truncate-ellipsis'><img class='vtop pos-rel top1' src='/custom/customimages/integration/" + encodeURIComponent(serviceName) + ".svg' width='15' height='15'><span id='chat_title a-tag' class='truncate-wrapper sb pl20 fw'>" + e_html(title) + "</span></p><p class='truncate-ellipsis'><span class='truncate-wrapper text-muted font-small maxw-200px'>" + e_html(last_chat_mesg) + "</span></p></div><div class='disp-c vtop visi-item text-nowrap'><span class='text-color3 font-xsmall'>" + last_mesg_time + "</span></div></div></div>"
			}
			$recentObj.prepend(content);
			$recentObj.find("[data-name=recentChat]").off("click.recentChat").on("click.recentChat", function () {//NO I18N
				const chatid = this.dataset.chatid;
				chtload.openRecentChat(chatid);
			});
			chtload.showHideNoChatNotifDiv();
		}
	},
	/* Method to remove the chat from the recent chats section if the requester to tech chat is closed */

	removeFromRecentChats: function (chatId) {
		if (jQuery("#sdp-chat-bar").find("#user_chats").parent('li').attr('class') === 'active') {
			const $recentObj = jQuery("#sdp-chat-bar").find('#recent-chats');
			const $chat_obj = $recentObj.find('[data-chatid="' + chatId + '"]');
			const chat_len = $chat_obj.length;
			const chat_entity = $chat_obj.attr("data-chatentity");
			if (chat_len > 0 && chat_entity === 'requester_chat') {
				const data_time = $chat_obj.attr("data-time");
				$chat_obj.remove();
				const len = $recentObj.find('[data-time="' + data_time + '"]').length;
				if (len == 0) {
					$recentObj.find("span:contains('" + data_time + "')").parent('div').remove(); //No I18N
				}
				chtload.showHideNoChatNotifDiv();
			}
		}
	},
	/* Method for checking whether the chat initiated by the requester present or not in the user active_chats API response */

	checkRequesterChatPresent: function (active_chats) {
		const active_chats_len = active_chats.length;
		for (let i = 0; i < active_chats_len; i++) {
			const active_chats_obj = active_chats[i];
			const chat_entity = active_chats_obj.entity_str;
			if (chat_entity === "requester_chat") {
				return true;
			}
		}
		return false;
	},
	getPortalRequestTemplates: function (chatID, chat_portalid) {
		let url = "/chats/" + chatID + "/_get_templates"; //No I18N
		url = chtload.appendPortalParam(url, chat_portalid);
		let ajax_data = chat_util.constructAjaxData({
			url: url
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				var template_settings = response.chat;
				is_portal_service_catalog_enabled = template_settings.is_service_catalog_enabled;
				if (template_settings.mergedservice) {
					portal_template_obj = template_settings.mergedservice;
				} else if (template_settings.incidenttemplates) {
					portal_template_obj = template_settings.incidenttemplates;
					if (is_portal_service_catalog_enabled) {
						// merging incident templates and service templates if service catalog is enabled
						var service_templates = template_settings.servicetemplates;
						service_templates.service_categories.forEach(function (templates, index, arr) {
							portal_template_obj.service_categories.push(templates);
						});
					}
				}

			}
		});
	},
	getCreateReqRoleExistsInPortal: function (chatId, chat_portalid) {
		let is_role_exists = false;
		let url = "/chats/" + chatId + "/_check_create_req_role_exists"; //No I18N
		url = chtload.appendPortalParam(url, chat_portalid);
		let ajax_data = chat_util.constructAjaxData({
			url: url
		});
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				is_role_exists = response.chat.is_role_exists;
			}
		});
		return is_role_exists;
	},
	loadReqType() {
		let filters = [{ "id": "All_Pending_Requester", "text": translate("sdp.home.summary.openRequestsTitle") }, { "id": "Closed_Requester", "text": translate("sdp.requests.viewrequest.requester.allclosedrequests") }];  // No I18N
		jQuery("#unread_chats_div").find("#selectRequestType").select2({
			data: filters,
			value: "All_Pending_Requester" // No I18N
		}).on('change', function (e) { requester_chat.getRequesterRequests(e.val) }).select2("data", { // NO I18N
			id: "All_Pending_Requester", // No I18N
			text: translate("sdp.home.summary.openRequestsTitle")
		});
	},
	/* Method for loading the requests based on filter after rendering hbs*/
	loadExistReq: function () {
		if (sdp_app.IS_CLOSED_CHAT_ENABLED) {
			requester_chat.loadReqType();
		}
		requester_chat.getRequesterRequests("All_Pending_Requester"); // No I18N
	},
	/*Method for checking weather the user is in operational hours and with chat settings*/
	inOperationalHours: function () {
		return sdp_app.IS_CHAT_DURING_OP_HOURS_ENABLED && !sdp_user.isOperational ? false : true;
	},

	//loads the timer div for Requester chat pick up and transfer chat pickup in all-chats tab
	loadtimerdiv: function (response, type) {
		let wait_time = Math.floor((response.expiry_time - response.server_current_time) / 1000);
		/* Convert string with escape character to object */
		response.message = jQuery.parseJSON(response.message);


		function codeblock() {
			const input_data = { "response": response }// NO I18N
			if (type == "requester_chat") {
				renderhbs('#requester_chats', 'requester-chat-pickup', input_data, true, 'chat/Technician/ChatOperations'); // NO I18N
			}
			else if (type == "transfer_chat") {
				renderhbs('#requester_chats', 'chat-transfer-request', input_data, true, 'chat/Technician/ChatOperations'); // NO I18N
			}


			/* Start chat pickup countdown */
			let timer = "timer_" + response.id; //No I18N
			let id = response.id
			/* Store the time in an global object based on chat id so that the timer can be canceled after chat is picked up. */
			chtload.chatPickupTimer[timer] = setInterval(function () {
				var obj_id = "#chat-" + id + " .chatpickcont .adtim";// NO I18N	
				jQuery(obj_id).text(wait_time);
				if (wait_time < 11) {
					jQuery(obj_id).parent().addClass("chattimepickcount");
				}
				if (wait_time < 1) {
					requester_chat.removeActiveChatFromList(response.id);
				}
				wait_time--;
			}, 1000);

			/* Update the unpicked chat counter. Required to show the Number of new chats in header. */
			requester_chat.chatCounter("+");

			jQuery("#sdp-chat-bar #req_chat_div").removeClass('hide');
			// scrolling top for showing the requester chats
			jQuery("#adchatreqcount").scrollTop(0);

			if (response.message.serviceName) {
				jQuery("#requester_chats #chat-" + response.id + " #req_name").before("<img class='mr3 vtop pos-rel top1' title='" + response.message.serviceName + "' rel='uitip' alt='" + response.message.serviceName + "' src='/custom/customimages/integration/" + response.message.serviceName + ".svg' width='15' height='15'>");
			}
		}
		if (!sdp_chat.technician_chatops_hbs) {
			ResourceLoader({
				js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
				success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
			});
		}
		else { codeblock(); }
	},
	/* Method to filter the requests list based on the request Type in the requester chatbox*/
	getRequesterRequests(filter) {
		sdpAjax({
			url: '/api/v3/requests', // No I18N
			type: "GET",// No I18N
			data: { "input_data": sdpToJSON({ "list_info": { "row_count": 50, "start_index": 1, "filter_by": { "name": filter } } }) },// No I18N
			success: function (response) {
				if (response.response_status[0].status.toLowerCase() != "failed") { //No I18N
					const $sdpChatBar = jQuery('#sdp-chat-bar');
					const $existingRequests = $sdpChatBar.find('#reqListingDiv');
					const $open_req_list = $existingRequests.find("ul.p0");
					$open_req_list.empty();
					if (response.requests) {
						$existingRequests.find("ul.req-list-error").addClass('hide').end()
							.find('ul.req-list').removeClass('hide');
						response.requests.forEach(function (item) {
							$open_req_list.append("<li><span class='requesttype' role='button' data-name='requesterRequest' data-workorderid='" + item.id + "'> # " + item.id + " - " + e_html(item.subject) + " </span></li>");
						});
						$open_req_list.find("[data-name='requesterRequest']").on("click.requestContainer", function () {
							requester_chat.openChatForRequest(this);
						});

					} else {
						$existingRequests.find("ul.req-list").addClass("hide").end()
							.find("ul.req-list-error").text(response.response_status[0].status).end()
							.find("ul.req-list-error").removeClass('hide');
					}
				} else {
					chtload.showAjaxError(response.response_status[0].status);
				}
			}
		});
	}

};