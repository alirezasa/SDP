/* $Id$ */
if (typeof Ember !== "undefined" && (window.Handlebars && !window.Handlebars.compile)) {
	var preCompiledTemplates = Handlebars.templates;
	var oldHelpers = Handlebars.helpers;
	sdpAjax({
		url: "/scripts/handlebars.min.js",//No I18N
		dataType: 'script',//No I18N
		async: false
	});
	Handlebars.templates = preCompiledTemplates;
	Handlebars.helpers = oldHelpers;
}

var ziac = {
	loadResource: function (includeParser) {
		return new Promise(function (resolve, reject) {
		    var files = [];
		    var noOfFilesIncluded = 0;
		    var loadZiaBotAndNotifications = typeof (zia_list) == "undefined" || typeof (ziabot) == "undefined"; // No I18N
		    var loadParserAndNotifications = includeParser && typeof (zia_parser) == "undefined"; // No I18N

            //SD-125116 | Temporary fix until Lyte version is upgraded by Zia Skills Team
            if (loadZiaBotAndNotifications && (typeof(ZSEC) !== "undefined" && !ZSEC.util)) {
                ZSEC.util = { defineProperty: ZSEC.defineProperty };
            }

            if(sdp_app.IS_DEVELOPMENT_MODE){
		        if (loadZiaBotAndNotifications) {
		            noOfFilesIncluded = files.push("/scripts/zianotifications.js", "/scripts/ziabot.js"); //No I18N
		        }
		        if (loadParserAndNotifications) {
		            noOfFilesIncluded += files.push("/scripts/ziaparsernotifications.js"); //No I18N
		        }
		    } else {
		        if (loadZiaBotAndNotifications) {
                    noOfFilesIncluded = files.push("/scripts/zia-bot-notifications.min.js");
		        }
		        if (loadParserAndNotifications) {
		            noOfFilesIncluded += files.push("/scripts/zia-parser-notifications.min.js");
				}
		    }
		    if (noOfFilesIncluded) {
				ResourceLoader({
					js: files,
					success: function () {
						resolve(true);
					}
				});
			} else {
				resolve(true);
			}
		});
	},
	loadZiaAndMaximize: function (ziaDiv) {
		ziac.loadResource().then(function () {
			ziac.ziamaximizefn(ziaDiv);
		});
	},

	ziamaximizefn: function (a) {
		if (jQuery("#zia_bot_container").is(":visible")) {
			ziabot.zia_minimize_validation();
			return;
		} else if ((typeof zia != "undefined")) { //NO I18N
			//Hook given by Zia Skills team to reset the Reload state & select2 alignment when zia is maximized
			zia.updateBotStateMaximised();
		}
		jQuery(a).parents('.zia-chat').find('.zia-content').removeClass('hide'); //NO I18N
		if (sdp_app.IS_CHAT_ENABLED) {
			chtload.minimizeMainChatBar(jQuery('#sdp-chat-bar').find('#user_chats')); //No I18N
		} else {
			//fixing the z-index when chat is disable
			jQuery(".zia-chat .zia-content").css("z-index", "10"); //No I18N
		}
		if (is_external_chat || !sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT) {
			jQuery("#zia_approval").closest("li").addClass('hide'); //NO I18N
		}
		if (is_external_chat || !sdp_app.zia_info.REOPEN_NOTIFICATIONS_COUNT) {
			jQuery("#zia_reopen").closest("li").addClass('hide');   //NO I18N
		}
		if (!sdp_app.zia_info.IS_BOT_ENABLED) {
			jQuery("#zia_bot").closest("li").addClass('hide');  //NO I18N
		}
		jQuery("#zia-global-count").val("1");
		startIndex = 1;
		var canShowZiaIcon = false;
		if (!is_external_chat && !(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) && sdp_app.zia_info.CAN_SHOW_UNVERIFIED_NOTIFICATION) {
			ziac.updateUnverifiedCount();
			//If there is no global_count after updateUnverifiedCount then no need to do below operations
			var isBotEnabled = sdp_app.zia_info.IS_BOT_ENABLED;
			if (sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE || isBotEnabled) {
				canShowZiaIcon = true;
				//reset the table component object when maximize the global zia popup for new data
				//AND to change the predic_mode according to the count while showing global zia popup
				if (isBotEnabled) {
					zia_list.predic_mode = "bot";	//NO I18N
				} else {
					zia_list.predic_mode = sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT == 0 ? "reopen" : "approval"; //NO I18N
				}
				zia_list.globalTblObj = {};
				zia_list.clearTblCompDivs();
				zia_list.onLoadingEvents();
				if (isBotEnabled) {
					if (!ziabot.is_zia_bot_init) {
						ziabot.is_zia_bot_init = true;
						ziabot.init_zia_bot();
					}
				} else {
					zia_list.loadzianotifications();
				}

				jQuery("a#zia_" + zia_list.predic_mode).sdtab("show"); //No I18N
				ziac.hide_zia_tab();
			}
		} else if ((!is_external_chat && sdp_app.zia_info.IS_BOT_ENABLED) || (is_external_chat && sdp_app.zia_info.EMBED_ZIA_ENABLED)) {
			canShowZiaIcon = true;
			zia_list.predic_mode = "bot";	//NO I18N
			zia_list.globalTblObj = {};
			zia_list.clearTblCompDivs();
			zia_list.onLoadingEvents();
			if (!ziabot.is_zia_bot_init) {
				ziabot.is_zia_bot_init = true;
				ziabot.init_zia_bot();
			}
			jQuery("a#zia_" + zia_list.predic_mode).sdtab("show"); //No I18N
			ziac.hide_zia_tab();
		} else if (is_external_chat && sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
			jQuery('.zia-chat>.chat-mini-header').addClass('hide')
		}
		if (!is_external_chat && sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE) {
			jQuery("#global_ziaripple").hide();
		}
		//Condition to display the zia content msg when not yet enabled
		if (!is_external_chat && sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED) {
			!canShowZiaIcon ? jQuery("a#zia_content_approval").sdtab("show") : "";    //NO I18N
			canShowZiaIcon = true;
			jQuery("#zia_content_approval").closest("li").removeClass('hide');   //NO I18N
		}
		if (!is_external_chat && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) {
			!canShowZiaIcon ? jQuery("a#zia_content_reopen").sdtab("show") : "";  //NO I18N
			canShowZiaIcon = true;
			jQuery("#zia_content_reopen").closest("li").removeClass('hide');   //NO I18N
		}

		if (canShowZiaIcon) {
			if (sdp_app.IS_CHAT_ENABLED) {
				//hide channels icon when zia is opened in req login
				chtload.toggleChannelsMenu();

				chtload.chatpickalignmentfn();
			}
		} else {
			jQuery('.chatmain-column.zia-chat').addClass('hide');
		}
		if (is_external_chat) {
			if (!sdp_app.zia_info.EMBED_ZIA_ENABLED && sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_SDP_EXT_CHAT_ENABLED) {
				jQuery("#ziachatbotdiv_child, #zia-icon").addClass("hide")
				jQuery("#zia_bot_container, .chatmain-column, #zia_livechat_bridge").removeClass("hide")
				maximizeExternalIframe('zia_livechat_bridge'); //NO I18N
			} else {
				jQuery('.zia-chat>.chat-mini-header').addClass('hide')
				maximizeExternalIframe('zia'); //NO I18N
			}
		}

	},
	/**
	 *  For selecting the zia tab while opening the bot.(After enable and disable action in zia bot configuration page).
	 */
	hide_zia_tab: function () {
		var get_current_tab = jQuery("a#zia_" + zia_list.predic_mode).closest("li"); //NO I18N
		if (get_current_tab.hasClass("hide") && get_current_tab.hasClass("active")) {
			get_current_tab.removeClass("hide");
		}
	},
	/**
	 *  SD-104938 | For hiding approval and reopen tab based on count
	 */
	bypassAllNotificationCall: function (global_count, reopen_count) {

		var approval_count = global_count - reopen_count;

		if (global_count == 0) {
			sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE = false;
			jQuery("#zia_approval").closest("li").addClass('hide'); //NO I18N
			jQuery("#zia_reopen").closest("li").addClass('hide');   //NO I18N
			jQuery("#global_ziaripple").hide();
			if (sdp_app.zia_info.IS_BOT_ENABLED) {
				jQuery("a#zia_bot").sdtab("show");    //NO I18N
			} else if (sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED) {
				jQuery("a#zia_content_approval").sdtab("show");   //NO I18N
			} else if (sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) {
				jQuery("a#zia_content_reopen").sdtab("show"); //NO I18N
			} else {
				jQuery('.chatmain-column.zia-chat').addClass('hide');
			}
		}
		else {

			//The global notification shouldn't be shown when the Zia bot window is maximized
			if (!jQuery("#zia_bot_container").is(":visible")) {
				jQuery("#global_ziaripple").show();
			}

			//To hide the approval/reopen tab based on the count
			if (sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT == 0 && approval_count > 0) {
				jQuery("#zia_approval").closest("li").removeClass('hide');  //NO I18N
			} else if (sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT != 0 && approval_count == 0) {
				jQuery("#zia_approval").closest("li").addClass('hide'); //NO I18N
				sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("a#zia_bot").sdtab("show") : jQuery("a#zia_reopen").sdtab("show"); //NO I18N
			}

			if (sdp_app.zia_info.REOPEN_NOTIFICATIONS_COUNT == 0 && reopen_count > 0) {
				jQuery("#zia_reopen").closest("li").removeClass('hide');    //NO I18N
			} else if (sdp_app.zia_info.REOPEN_NOTIFICATIONS_COUNT != 0 && reopen_count == 0) {
				jQuery("#zia_reopen").closest("li").addClass('hide');   //NO I18N
				sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("a#zia_bot").sdtab("show") : jQuery("a#zia_approval").sdtab("show");   //NO I18N
			}

			jQuery("#zia_notify_approval_count").text(approval_count);
			jQuery("#zia_notify_reopen_count").text(reopen_count);
			setTimeout(function () {
				jQuery("#global_ziaripple .origin").text(global_count);
			}, 600);
			sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE = true;
		}
		// Notification count from 1 to 0 behaviour bug fix during SD-104938
		sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT = approval_count;
		sdp_app.zia_info.REOPEN_NOTIFICATIONS_COUNT = reopen_count;
		sdp_app.zia_info.TOTAL_NOTIFICATIONS_COUNT = global_count;

	},
	updateUnverifiedCount: function (isOnload) {
		if (!(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) && sdp_app.zia_info.CAN_SHOW_UNVERIFIED_NOTIFICATION && !is_external_chat) {
			if (isOnload) {
				if (sdp_app.zia_info.TOTAL_NOTIFICATIONS_COUNT) {
					setTimeout(function () {
						jQuery("#global_ziaripple").show();
						jQuery("#global_ziaripple .origin").text(sdp_app.zia_info.TOTAL_NOTIFICATIONS_COUNT);
					}, 600);
				}
			} else {
				sdpAjax({
					url: "/api/v3/zia_actions/_all_notifications", //NO I18N
					// data: data, //NO I18N
					async: false,
					type: 'GET', //No I18N
					success: function (response) {
						if (response != null) {
							//alert("gl::"+response.global_count+"::entity::"+response.entity_count)
							if (response.response_status.status == "success") {
								var zia_count = response.all_notifications;
								var approval_count = zia_count.approval_notification_count;
								var reopen_count = zia_count.reopen_notification_count;
								var global_count = approval_count + reopen_count;
								ziac.bypassAllNotificationCall(global_count, reopen_count);
							}
						}
					}
				});
			}
		}
		else {
			jQuery("#global_ziaripple").hide();
		}
	},
	translateZiaTemplate: function ($doc) {
		var key = null;
		// Translate alt
		$doc.find("[data-i18n-alt]").each(function () {
			key = jQuery(this).attr("data-i18n-alt");
			jQuery(this).attr("alt", translate(key));
		});

		// Translate title
		$doc.find("[data-i18n-title]").each(function () {
			key = jQuery(this).attr("data-i18n-title");
			jQuery(this).attr("title", translate(key));
		});

		// Translate text
		$doc.find("[data-i18n]").each(function () {
			key = jQuery(this).attr("data-i18n");
			jQuery(this).text(translate(key));
		});
	},
	/**
	 * All socket notifications related to Zia notifications and bot will be handled here
	 * @param {String} type notification type
	 * @param {Object} message notification message details
	 */
	handleSocketNotification: function (type, message) {
		var mess = JSON.parse(message.message);
		//The zia notification will be reflected only if the portal ID gets matched
		if (PORTALID == mess.portal_id) {
		    var action = mess.action;
		    var includeParser = "parser" == action; //No I18N
			ziac.loadResource(includeParser).then(function () {
				// Only zia_bot_msg related activity is needed in external chat
				if (!is_external_chat) {
					if (type == 'zia_action_verify') {
						zia_list.appendZiaActionVerifyMesg(mess);
					}
					else if (type == 'zia_action_performed') {

						zia_list.appendZiaActionRippleEffect(mess);
					}
					else if (type == 'zia_notifications_deleted') {
						zia_list.removeZiaNotifGlobal(mess);
					}
				}
				if (type === 'zia_bot_msg') {
					ziabot.zia_reinit_bot(mess);
				} else if (type === 'zia_bot_reload') { //NO I18N
					ziabot.zia_reload_chat(mess);
				}
			});
		}
	},
	/**
	 * This function is used to show the Zia chat when the requester login
	 * @param {boolean} canPopup - true if Zia chat should be popped up, false otherwise
	 * @param {number} timeOut - The time in milliseconds to wait before showing the Zia chat
	 */
	popupZiaChatOnRequesterLogin: function (canPopup, timeOut) {
		if(canPopup){
			setTimeout(function () {
				ziac.loadZiaAndMaximize(jQuery('#ziabot_icon'));
			}, timeOut);
		}
	}
};
/* $Id$ */
