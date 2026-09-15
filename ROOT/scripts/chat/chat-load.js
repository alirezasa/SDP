/* $Id$ */

/* Dependencies:
chat.less
showDialog & closeDialog functions
updateSelect2Dropdown function
select2
*/

/**To reduce the chat loading time the sdp-chat-bar.js has been split and compressed to sdp-chat.js , sdp-chat-channels.js and sdp-chat-channels-config.js
 *
 * Along with the js HTML has been migrated to HBS and all the files are segregated and compressed to 6 js files namely 1)hbs-template-common-chat.js,2)hbs-template-common-channel.js,
 *
 * 3)hbs-template-requester.js,4)hbs-template-technician-chat.js,5)hbs-template-technician-channel.js,6)hbs-template-technician-chatoperations.js and are loaded whenever they are necessary.
 *
 * As Chat is loaded seperately (not with Homepage) converting the product to debveopment mode doesn't allow you to work on the chat scripts and HBS files .
*/




/** To convert the build into development mode for chat follow the instructions after converting the whole build into development mode
 *   1) In initialize-sdpchat.js ===> comment out the loading hbs files ( to work on hbs files ) and change the file sdp-chat.js to sdp-chat-bar.js (To load uncompressed versions of the files to worrk on js files and fixes)
 *
 * 	 2)In sdp-chat-bar.js ===> In the method Loadsdpchanneljs() change the filenames from sdp-chat-channels.js and sdp-chat-channels-config.js to sdp-channels.js & sdp-channels-config.js respectively to load the uncompressed js
 *
 *   3)In sdp-chat-bar.js ===> toggle the variables common_channel_hbs,technician_chatops_hbs & technician_channel_hbs to true from false inorder to load the hbs files other than compressed files (to work on hbs files)
 *
*/

var portal_template_obj = {};
var is_portal_service_catalog_enabled;
var row_count_global = 25;

var sdp_chat = {
	active_chatids: [],
	active_channelactions: {},
	title_interval: null,
	allTech: null,
	isDevMode: sdp_app.IS_DEVELOPMENT_MODE,

	chatPinMessages: {},
	common_channel_hbs: sdp_app.IS_DEVELOPMENT_MODE,
	technician_chatops_hbs: sdp_app.IS_DEVELOPMENT_MODE,
	technician_channel_hbs: sdp_app.IS_DEVELOPMENT_MODE,
	chatMentionUsers: new Map(),//used to store the mentioned users on client
	chataction_memberscount: 5,
	pinMessageDeniedEntities: ["requester_chat", "tech_req_chat", "collaborators_chat"]  // No I18N
};

var chtload = {
	/* Global chatbar options passed while initiating chatbar */
	options: {},
	/* Global variable for storing unpicked chat timer. Is used in Ember UI for admin chat settings. */
	chatPickupTimer: {},

	/* Align the Chat bar along with zia and other  */
	chatpickalignmentfn: function () {
		const $doc = jQuery(document);
		const $sdpChatBar = $doc.find('#sdp-chat-bar');
		const $chatColumn = $sdpChatBar.find('.chat-column');
		const count = $chatColumn.length;
		const isRequester = sdp_user.USERTYPE === "Requester"; //No I18N
		const direction = (sdp_user.DIRECTION === "RTL") ? (isRequester ? "left" : "right") : (isRequester ? "right" : "left"); //No I18N

		/*Zia chat bar enable calculate width of zia chat*/
		let pixel = 0;
		if (!isRequester) {
			pixel = jQuery(".chatmain-column.chatmain-column-left").width();
			if (jQuery("#zia_bot_container").is(":visible")) {
				pixel = jQuery("#zia_bot_container").width() - 80;
			}
		}
		/*Zia chat bar enable calculate width of zia chat*/
		let ziapixel = 10;
		const $ziaChatColumn = jQuery('.chatmain-column.zia-chat');
		if ($ziaChatColumn.is(":visible")) {
			ziapixel = $ziaChatColumn.width();
			if (jQuery("#zia_bot_container").is(":visible")) {
				ziapixel = jQuery("#zia_bot_container").width();
			}
		}
		let channelMenuPx = 0;
		if (isRequester && !jQuery('.chatmain-column #zia_bot_container').is(":visible")) {
			channelMenuPx = jQuery("#channels-bar").closest("li").width() + 5; //No I18N
			if (jQuery('.chatmain-column #chat-tab-content').is(":visible")) {
				channelMenuPx = jQuery('.chatmain-column #chat-tab-content').width() + 10;
			} else if ($doc.find("#reqChat").is(':visible')) { //No I18N
				channelMenuPx = channelMenuPx + $doc.find("#reqChat").width() + 5;
			}
		}
		pixel += isRequester ? (ziapixel + channelMenuPx) : 0;

		/*Calculate bottom bar width calculate includes telephony icon*/
		let bottomBarBtnWidth = 0;
		let bottomBarBtns = jQuery('.bottombar-btn').length;
		for (let i = 0; i < bottomBarBtns; i++) {
			bottomBarBtnWidth += jQuery('.bottombar-btn:eq(' + i + ')').outerWidth();
		}

		if (is_external_chat) {
			$doc.find('.chatrow .chat-column:eq(0)').show().css("right", '0px'); //No I18N
			return;
		}

		let fit_chats_len = isRequester ? Math.floor((jQuery(document).width()) / pixel) - 1 : Math.floor((jQuery(document).width() - ziapixel - bottomBarBtnWidth) / pixel) - 1;
		const $obj = jQuery("#minimize_chat_bar").closest('.chatmain-column').find('.chat-mini-header li.active a'); //No I18N
		if (isRequester && !jQuery($obj).parent().hasClass('active') && count) {
			fit_chats_len = Math.floor(jQuery(document).width() / (jQuery('#sdp-chat-bar .chat-column').width())) - 1;
		}
		const fit_no_chats_count = count > fit_chats_len ? count - fit_chats_len : 0;
		for (let i = 0; i < count; i++) {
			let pos = 0;
			/**
			 * For alignment the chat when open the zia bot
			 */
			if (isRequester && jQuery("#zia_bot_container").is(":visible")) {
				pos = 20;
			}
			let requesterCustomize = 0;
			if(isRequester){
				requesterCustomize = jQuery('#slideAccess').is(':visible') ? jQuery('#slideAccess > .bottombar-btn').outerWidth() : 0; //No I18N
				requesterCustomize =  jQuery('#LightnDarkModeSwitch').is(':visible') ? requesterCustomize + jQuery('#LightnDarkModeSwitch').outerWidth() : requesterCustomize; //No I18N
			}

			const chat_pixel = pixel + (count - 1 - i) * 325 + pos + requesterCustomize;
			const $chatColumn = $doc.find('.chatrow .chat-column:eq(' + i + ')'); //No I18N
			if (i <= (fit_no_chats_count - 1)) {
				$chatColumn.hide().css(direction, chat_pixel + 'px'); //No I18N
			}
			else {
				$chatColumn.show().css(direction, chat_pixel + 'px'); //No I18N
			}
			fit_chats_len = fit_chats_len--;
		}
	},

	//show or hide channels icon when zia is closed or open in requester login
	toggleChannelsMenu: function () {
		if (sdp_user.USERTYPE == "Requester") {
			const $channelsMenu = jQuery("#channels-bar").closest("li");//NO I18N
			$channelsMenu.toggleClass("hide");//NO I18N
			if ($channelsMenu.hasClass("active")) {
				jQuery("#neededchat").toggleClass("hide");//NO I18N
			}
		}
	},

	/* Minimize main chatbox */
	minimizeMainChatBar: function (a) {
		const $obj = jQuery(a).closest('.chatmain-column').find('.chat-mini-header li.active a'); //No I18N
		if (jQuery($obj).parent().hasClass('active')) {
			jQuery($obj).closest('.chatmain-column').css('width', '').find('.chat-wrapper').addClass('hide'); //No I18N
			setTimeout(function () {
				jQuery($obj).closest('li').removeClass('active'); //No I18N
				if (is_external_chat) {
					// If the current portal has only live chat, and other portal has Embed Zia, then need to minimize to zia in order to show the livechat_bridge to be able to switch to other portals
					var minimize_to_zia = sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0;
					minimizeExternalIframe(minimize_to_zia ? "zia" : "livechat");     // No I18N
					if (minimize_to_zia) {
						// Need to add 'external-zia' when zia is present and remove for livechat - zia_livechat_bridge case
						jQuery('#sdp-chat-bar').addClass('external-zia');       //NO I18N
					}
					jQuery("#sdp-chat-bar").find("div.chat-mini-header").removeClass("hide");
				}
				chtload.chatpickalignmentfn();
			}, 100);
			jQuery("#open-requester-chat").find("#missed-chat-count").removeClass("hide");
		} else if (is_external_chat) {
			minimizeExternalIframe("");
			jQuery("#sdp-chat-bar").find("div.chat-mini-header").removeClass("hide");
		}
	},

	/* Show ajax error messages on UI.
		Arguments:
		arr = Messages array.
		*/
	showAjaxError: function (arr) {
		if (typeof arr == "string") {
			chat_util.showChatAlert(arr);
		} else {
			let msg = "";
			arr.forEach(function (item, index, arr) {
				if (msg !== "") {
					msg = msg + "</br>" + item.message;
				}
				else {
					msg = item.message;
				}

			});
			chat_util.showChatAlert(msg);
		}
	},
	/* Common function for contructing portal param iff user is on other portal */
	appendPortalParam: function (url, portalid) {
		if (portalid !== undefined && portalid != PORTALID) {
			url = url + "?PORTALID=" + portalid; // No I18N
		}
		return url;
	},

	/* Method for removing a chat from the unread sections if user clicks the chat */
	removeChatFromSection: function (chatId) {
		const $unread_obj = jQuery("#sdp-chat-bar").find("#unread-chats");
		const $chat_obj = $unread_obj.find("[data-chatid='" + chatId + "']");
		if ($chat_obj.length > 0) {
			let data_time = $chat_obj.attr("data-time");
			let len = $unread_obj.find('[data-time="' + data_time + '"]').length;
			if (len == 0) {
				$unread_obj.find("span:contains('" + data_time + "')").parent('div').remove(); //No I18N
				let $zcp = $chat_obj.parents().closest("#unread-chats-zcp"); //No I18N
				$chat_obj.remove();
				if ($zcp.find("#unread-chats").length == 0 || $zcp.find("#unread-chats").children().length < 1) {
					$zcp.remove();
				}
			}
		}
	},
	/* Method for getting the technician list */
	getTechnicianList: function () {

		let users = [];

		var ajax_data = chat_util.constructAjaxData({
			url: "/chats/_technicians_list"//No I18N
		});
		sdpAjax(ajax_data).done(function (response) {
			if (response.response_status.status == 'success') {
				const userObj = response.chat.users;
				for (var i = 0; i < userObj.length; i++) {
					userObj[i].id = parseInt(userObj[i].id);
					users.push(userObj[i]);
				}
			}
		}).fail(function (response) {
			chat_util.checkAjaxResponse(response.responseJSON);
		});
		users = users.sort(function (a, b) {
			var x = a.status.toLowerCase();
			var y = b.status.toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		});

		let userslist = [];
		const len = users.length;
		for (var i = 0; i < len; i++) {
			var tech = {};
			tech.name = users[i].name;
			tech.id = parseInt(users[i].id);
			tech.status = users[i].status;
			userslist.push(tech);
		}
		sdp_chat.allTech = userslist;
		return users;
	},
	/* Method for arranging the technicians when a user is loggedin/logged out from the appliction */
	reArrange: function (techId, type) {
		let user_status = "online";//No I18N
		if (type === 'user_logout') {
			user_status = "offline";//No I18N
		}

		//changing user status in the technician tab, if technician tab is active
		if (jQuery("#sdp-chat-bar").find("#techs-nav").attr('class') === 'active') {
			let $techDiv = jQuery(".chat-bar .chatmain-column .chat-wrapper").find("#technican");
			$techDiv.find("#allTechList").empty();
			let onlineTechList = '';
			let offlineTechList = '';

			sdp_chat.allTech.forEach(function (item, index, arr) {
				const recent_chat_tech_len = jQuery('#recent_tech_chats').find("[data-techid='" + item.id + "']").length;
				if (recent_chat_tech_len == 0 && item.id != sdp_user.LOGGEDIN_USERID) {
					if (item.id == techId) {
						const $recentTechs = jQuery('#recent_tech_chats').find("[data-techid='" + techId + "']").find('span');
						if (user_status == "online") {
							if ($recentTechs.attr('class') != undefined) {
								$recentTechs.attr('class', 'avaicon mr5 vtop mt2');
							}
							item.status = "online";//No I18N
						}
						else {
							if ($recentTechs.attr('class') != undefined) {
								$recentTechs.attr('class', 'waiticon mr5 vtop mt2');
							}
							item.status = "offline";//No I18N
						}
					}
					if (item.status == "online") { //No I18N
						var onclickFn = 'chat_box.startTechChat(' + item.id + ')'; //NO I18N
						onlineTechList += "<li><div title='" + e_attr(item.name) + "' class='p10 a-tag' data-name='techRow' data-userid='" + item.id + "' ><span class='avaicon mr5 vtop mt2'></span>" + e_html(item.name) + "</a></li>";
					}

					else {
						var onclickFn = 'chat_box.startTechChat(' + item.id + ')'; //NO I18N
						offlineTechList += "<li><div title='" + e_attr(item.name) + "' class='p10 a-tag' data-name='techRow' data-userid='" + item.id + "'><span class='waiticon mr5 vtop mt2'></span>" + e_html(item.name) + "</a></li>";
					}
				}
			});
			$techDiv.find("#allTechList").append(onlineTechList + offlineTechList);
			jQuery("#allTechList").off("click.initNewTecChat").on("click.initNewTecChat", "[data-name='techRow']", function () { //No I18N
				let techId = this.dataset.userid;
				chat_box.startTechChat(techId);
			});
		}

		// changing the user status from other areas 1. from chats (tech chat, group chat users count) 2. from recent chats tab
		chtload.setUserOtherAreaStatus(techId, type);

		//Setting back to search value if user searched any technician
		var $tech_search = jQuery("#sdp-chat-bar #technicansearch")
		var search_val = $tech_search.val();
		if (search_val !== '') {
			$tech_search.val(search_val).trigger('keyup');
		}
	},
	/* Method for showing the missed chat count */
	showUnreadCount: function (count) {
		const unread_cnt = parseInt(count);
		if (unread_cnt > 0 && (!is_external_chat)) {
			if (sdp_user.USERTYPE == "Requester") {
				jQuery("#open-requester-chat").append('<span id="missed-chat-count" class="btn-danger live-cht-badge text-overflow"> ' + unread_cnt + '</span>').addClass('pos-rel');//NO I18N
				jQuery("#missed-chat-tab span").remove()
				jQuery("#missed-chat-tab ").append('<span class="text-danger"> (' + unread_cnt + ')</span>')
				jQuery("#missed-chat-count").html("<div class='origin'>" + unread_cnt + "</div>");
			}
			else {
				const unreadDiv = jQuery("#chatsli").find("#user_chats");
				unreadDiv.find("em").removeClass("hide").text(unread_cnt);
				unreadDiv.addClass("unread");
			}
		}
		else {
			if (sdp_user.USERTYPE == "Requester") {
				jQuery("#missed-chat-tab span").remove();
				jQuery("#open-requester-chat").find(".live-cht-badge").remove();
			}
			else {
				const unreadDiv = jQuery("#chatsli").find("#user_chats");
				unreadDiv.find("em").addClass("hide").text('');
				unreadDiv.removeClass("unread");
			}
		}
		chtload.showHideNoChatNotifDiv();
	},
	/* Method for opening a chat from recent chats section */
	openRecentChat: function (chatID) {
		if (sdp_chat.active_chatids.indexOf(String(chatID)) > -1) {
			chat_box.highlightChatPopUp(chatID);
			chat_box.focusChatTextArea(chatID);
			return;
		}
		chat_box.loadUserNewChat(chatID, false, PORTALID, true);
		chtload.removeChatFromSection(chatID);
		chat_box.focusChatTextArea(chatID);
		chat_util.reinitateATP();
	},
	/* Method for loading all technicians */
	loadAllTechnicians: function (a) {
		if (jQuery("#technican").length != 0 && jQuery("#all_chats").length != 0) {
			jQuery('#all_chats').addClass('hide');
			jQuery("#technican").removeClass('hide');
		}
		else {
			if (jQuery("#technican").length == 0 && chat_box.openPopUp(a)) {
				jQuery("#sdp-chat-bar").find("#technicansearch").val('').end()
					.find('.ch-clearbutton').hide();
				const technicianList = chtload.getTechnicianList();
				let is_empty = false;
				if (technicianList.length <= 1) {
					is_empty = true;
				}
				jQuery('#all_chats').addClass('hide');
				let input_data = { technicianList, sdp_user, is_empty }
				renderhbs('#chat-tab-content', 'technician-tab', input_data, false, 'chat/Technician/Chat', true, true, function () { //No I18N
					jQuery("#allTechList").off("click.initNewTecChat").on("click.initNewTecChat", "[data-name='techRow']", function () { //No I18N
						let techId = this.dataset.userid;
						chat_box.startTechChat(techId);
					});
				});

			}
		}
	},
	/* Method for loading the associated support groups */
	loadAssociatedGroups: function (a) {
		jQuery("#chat-options").addClass('hide');
		if (chat_box.openPopUp(a)) {
			chtload.clearSearchResults();
			jQuery("#sdp-chat-bar").find("#groupsearch").val('').end()
				.find('.ch-clearbutton').hide();
			const group_list = chtload.getAssociatedGroups();
			const group_len = group_list.length;
			const $group_div = jQuery(".chat-bar .chatmain-column .chat-wrapper").find("#groups");
			$group_div.find("#allGroupList").empty();
			let is_empty = false;
			if (group_list.length == 0) {
				is_empty = true
			}
			let input_data = { group_list, is_empty }
			renderhbs('#chat-tab-content', 'groups-tab', input_data, false, 'chat/Technician/Chat'); // NO I18N
			if (group_len == 0) {
				// means no groups exist
				jQuery("#sdp-chat-bar").find("#groups").find(".input-group-addon").addClass('hide').end()
					.find("#groupsearch").addClass('hide').end()
					.find("#no_group_found").removeClass("hide").text(translate("sdp.admin.groups.listview.nogroupavailble"));
			}
			jQuery("#chat_room").parent().removeClass("hide");
			jQuery("#chat_history").parent().removeClass("hide");
			jQuery("#archived_channels").parent().addClass("hide");
			jQuery("#deleted_channels").parent().addClass("hide");
			jQuery("#channel-slider").parent().addClass("hide");
		}
	},
	//load channels in the channel tab (or) channels-slider (common-method)
	loadAllChannels: function (a) {
		let filter_name;
		let appending_element;
		let hbs_file;
		let location;
		if (a.id == 'channels-bar') {
			if (chat_box.openPopUp(a)) {
				jQuery("#chat-options").addClass('hide');
				filter_name = 'my_channels';// NO I18N
				appending_element = '#chat-tab-content';// NO I18N
				hbs_file = 'channels-tab';// NO I18N
				location = 'chat/Common/Chat';// NO I18N
			}
			else {
				chtload.chatpickalignmentfn();
				return;
			}
		} else if (a.id = 'channel-slider') {
			filter_name = 'all_channels';// NO I18N
			appending_element = '#chat-slider-div';// NO I18N
			hbs_file = 'all-channels-slider';// NO I18N
			location = 'chat/Common/Channel';// NO I18N
		}

		let input_data = {
			"list_info": { //No I18N
				"row_count": row_count_global,//No I18N
				"sort_field": "updated_time",//No I18N
				"sort_order": "desc",//No I18N
				"filter_by": { // No I18N
					"name": filter_name //No I18N
				}
			}
		};
		let ajax_data = chat_util.constructAjaxData({
			input: input_data,
			url: "/channels" //No I18N
		});
		function codeblock() {
			if (sdp_user.USERTYPE == "Requester") {
				jQuery("#sdp-chat-bar #requester_nav").addClass("hide");
			}
			let input = {};
			renderhbs(appending_element, hbs_file, input, false, location);
			initTooltip("#add-channel-btn");// NO I18N
			if (sdp_user.USERTYPE == "Requester") {
				jQuery("#add-channel-btn,#new-channel-btn").remove();
				jQuery('#channel-slider').parent().removeClass("hide");
				chtload.chatpickalignmentfn();
			}
			chtload.appendUserChannels(ajax_data, input_data, a.id);
			jQuery("#chat_room,#chat_history").parent().addClass("hide");
			jQuery("#archived_channels,#channel-slider,#deleted_channels").parent().removeClass("hide");
		}

		if (location == 'chat/Common/Channel' && !sdp_chat.common_channel_hbs) {
			ResourceLoader({
				js: ["/scripts/hbs-template-common-channel.js"], // No I18N
				success: function () { common_channel_hbs = true; codeblock(); }
			});
		}
		else { codeblock(); }
	},
	//append the channels data after loading the channels-tab (or) channels-slider (common-method)
	appendUserChannels(ajax_data, input_data, from) {
		let appending_element;
		let hbs_file;
		let location;
		if (from == 'channels-bar') {
			appending_element = '#channellist';// NO I18N
			hbs_file = 'channels-tab-data';// NO I18N
			location = 'chat/Common/Chat';// NO I18N
		} else if (from == 'channel-slider') {// NO I18N
			appending_element = '#all-channels-data';// NO I18N
			hbs_file = 'all-channels-slider-data';// NO I18N
			location = 'chat/Common/Channel';// NO I18N
		}
		var start_index = 0, end_index = 0, has_more_rows = false, chats_len = 0;
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				var input = { "response": response, "userId": String(sdp_user.LOGGEDIN_USERID) };// NO I18N
				renderhbs(appending_element, hbs_file, input, true, location,true);
				start_index = response.list_info.start_index;
				end_index = start_index + response.list_info.row_count - 1;
				has_more_rows = response.list_info.has_more_rows;
				chats_len += response.list_info.row_count;

			}
		});
		var $channel_obj;
		if (from == 'channels-bar') {
			$channel_obj = jQuery(".chat-bar .chatmain-column .chat-wrapper").find("#channellist");
			if (jQuery("#channellist").find("li").length == 0) {
				jQuery("#nodata-channel").removeClass("hide");
				jQuery("#data-channel").addClass("hide");
			}
			else {
				jQuery("#channel-slider").parent().removeClass("hide");
			}
		} else if (from == 'channel-slider') {// NO I18N
			$channel_obj = jQuery("#chat-slider-div").find("#all-channels-data");
			if (jQuery("#all-channels-data").children().length == 0) {
				jQuery("#all-channels-data").append('<div class="pos-abs fw" style=" top: 38%; "> <div id="no_channels_found" class="text-muted tc pt20">' + translate("channel.no.channels") + '</div> </div>')
			}
		}
		chtload.bindInfiniteScrollForChannelsTab(start_index, end_index, has_more_rows, $channel_obj, from, input_data, false);
	},
	//modify the channels data based on the value searched (common-method for both channels-tab and slider)
	modifychannelsearch: function (a) {
		let from = a.id;
		let search_item;
		let from_token;
		if (from == "channel-search") {
			search_item = jQuery("#channel-search").val();
			from_token = "channels-bar";// NO I18N

		}
		else if (from == "channel-slider-search") {
			search_item = jQuery("#channel-slider-search").val();
			from_token = "channel-slider";// NO I18N
		}
		redirect.renderchannels(search_item, from_token);
	},
	/* Method for getting the user associated support groups */
	getAssociatedGroups: function () {
		let groupList = [];
		var ajax_data = chat_util.constructAjaxData({
			input: {
				"list_info": { //No I18N
					"row_count": "100" //No I18N
				}
			},
			url: "/chats/group" //No I18N
		});
		sdpAjax(ajax_data).done(function (data) {
			groupList = data.group;
			for (let i = 0; i < groupList.length; i++) {
				var sitename = ''
				if (groupList[i].site !== null) {
					sitename = groupList[i].site.name
				}
				delete groupList[i].site
				groupList[i].site = sitename
			}
		});
		return groupList;
	},
	openMissedChats: function () {
		chtload.getUserChats("unread-chats", "unread_chats"); // No I18N
	},
	/* Method for getting the user recent chats/missed chats */

	getUserChats: function (chat_type, include_type) {
		let ajax_data;
		if (include_type !== "notified_chats") {
			let input_data = {
				"list_info": { //No I18N
					"filter_by": { // No I18N
						"name": include_type //No I18N
					}
				}
			};
			if (include_type === "my_recent_chats" || include_type === "unread_chats") {
				input_data.list_info.sort_field = "last_mesg_time"; //No I18N
				input_data.list_info.sort_order = "desc"; //No I18N
			}
			input_data.list_info.row_count = row_count_global;
			ajax_data = chat_util.constructAjaxData({
				input: input_data,
				url: "/chats" //No I18N
			});
		}
		else {
			let input_data = {
				"list_info": { //No I18N
					"row_count": row_count_global //No I18N
				}
			};
			ajax_data = chat_util.constructAjaxData({
				input: input_data,
				url: "/chats/_notified_chats" //No I18N
			});
		}

		const $chat_obj = jQuery(".chat-bar .chatmain-column .chat-wrapper").find("#" + chat_type);
		$chat_obj.empty();
		if (include_type !== "notified_chats") {
			chtload.appendUserChats(ajax_data, chat_type, include_type, $chat_obj);
		}
		else {
			chtload.appendnotifiedchats(ajax_data);
		}

	},
	appendnotifiedchats: function (ajax_data) {
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				if (response.chat.chats.length !== 0) {
					response.chat.chats.forEach(function (item, index, arr) {
						const chat_type = item.chat_type;
						if (chat_type === 'new_chat_request') {
							if (jQuery(".chatmain-column #chat-" + item.id).length == 0 && chat_box.getActiveChatIndex(item.id) < 0) {
								requester_chat.loadtimerdiv(item, "requester_chat");// NO I18N
							}
						}
						else if (chat_type === 'new_transfer_chat') {
							if (jQuery(".chatmain-column #chat-" + item.id).length == 0 && chat_box.getActiveChatIndex(item.id) < 0) {
								requester_chat.loadtimerdiv(item, "transfer_chat");// NO I18N
							}
						}
					})
				}
			}
		});
	},
	/* Method for appending the user recent chats/missed chats */

	appendUserChats: function (ajax_data, chat_type, include_type, $chat_obj) {
		var start_index = 0, end_index = 0, has_more_rows = false, chats_len = 0;
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {

				if (sdp_user.USERTYPE == 'Technician') {
					if (response.chats.length > 0) {
						let input_data = { "response": response, "chat_type": chat_type, "include_type": include_type, "sdp_user": sdp_user };//No I18N
						if (include_type == "my_recent_chats") {
							renderhbs('#recent-chats', 'my_recent_chats', input_data, true, 'chat/Common/Chat', true); // NO I18N
						} else if (include_type == "unread_chats") {//No I18N
							jQuery("#unread-chats").removeClass("hide"); //No I18N
							renderhbs('#unread_chats_div', 'unread-chats', input_data, true, 'chat/Common/Chat'); // NO I18N
						}
					}
				}
				else {
					let input_data = { "response": response, "chat_type": chat_type, "include_type": include_type, "sdp_user": sdp_user };//No I18N
					renderhbs('#unread_chats_div', 'unread-chats', input_data, false, 'chat/Common/Chat'); // NO I18N
					jQuery("#unread_chats_div .zcollapsiblepanel__header").addClass('hide');
				}
				if (chat_type === 'recent-chats') {
					start_index = response.list_info.start_index;
					end_index = start_index + response.list_info.row_count - 1;
					has_more_rows = response.list_info.has_more_rows;
					chats_len += response.list_info.row_count;
				}
				if (chat_type === 'recent-chats') {

					var recent_chats_obj = jQuery("#recent-chats");// NO I18N
					var time_separator_obj = recent_chats_obj.find(".chat-msgdate");// NO I18N
					var len = time_separator_obj.length;
					var prev_date;
					if (len !== 0) {
						let firstTimeSeparator = time_separator_obj[0];
						prev_date = firstTimeSeparator.getElementsByClassName('text-muted')[0].innerHTML;
						if (prev_date == "Today") {
							firstTimeSeparator.classList.add('hide'); //No I18N
						}
					}
					for (i = 1; i < len; i++) {
						var curr_date = time_separator_obj[i].getElementsByClassName('text-muted')[0].innerHTML;
						if (curr_date == prev_date) {
							time_separator_obj[i].classList.add('hide');
						}
						else {
							prev_date = curr_date;
						}
					}
				}
			}
		});
		if (chats_len == 0) {
			$chat_obj.parent('div').addClass("hide");
		}

		if (chat_type === 'recent-chats') {
			chtload.bindInfiniteScrollRecentChatHistory(start_index, end_index, has_more_rows, chat_type, include_type, $chat_obj);
		}
		initTooltip("#sdp-chat-bar");  //No I18N
	},
	bindInfiniteScrollRecentChatHistory: function (start_index, end_index, has_more_rows, chat_type, include_type, $chat_obj) {
		const $target = jQuery(".chat-bar .chatmain-column .chat-wrapper").find("#adchatreqcount");
		if (has_more_rows) {
			var input_data = {};
			$target.off('scroll.chatHistory').on('scroll.chatHistory', function () {//No I18N

				if ((jQuery(this).scrollTop() + jQuery(this).innerHeight()) >= (jQuery(this)[0].scrollHeight - 1)) {
					start_index = parseInt(start_index);
					end_index = parseInt(end_index);
					input_data = {
						"list_info": { //No I18N
							"filter_by": { // No I18N
								"name": include_type //No I18N
							},
							"start_index": end_index + 1 //No I18N
						}
					};
					if (include_type === "my_recent_chats" || include_type === "unread_chats") {
						input_data.list_info.sort_field = "last_mesg_time"; //No I18N
						input_data.list_info.sort_order = "desc"; //No I18N
					}
					input_data.list_info.row_count = row_count_global;
					var ajax_data = chat_util.constructAjaxData({
						url: "/chats/", //No I18N
						input: input_data
					});
					$target.off("scroll"); //No I18N
					chtload.appendUserChats(ajax_data, chat_type, include_type, $chat_obj);
					return false;
				}

			});
		}
		else {
			$target.off("scroll"); //No I18N
		}
	},
	//supports Infinite scroll(Lazy loading for the channels-tab)
	bindInfiniteScrollForChannelsTab: function (start_index, end_index, has_more_rows, $channel_obj, from, input_data, forsearch) {
		let $target = $channel_obj;
		let filter_name;
		if (from == 'channels-bar') {
			filter_name = 'my_channels';// NO I18N
			$target = $channel_obj.parent();
		} else if (from == 'channel-slider') {// NO I18N
			filter_name = 'all_channels';// NO I18N
			$target = $channel_obj.parents().closest("#chat-slider-div");// NO I18N
		}
		if (has_more_rows) {
			$target.on('scroll', function () {
				if ((jQuery(this).scrollTop() + jQuery(this).innerHeight()) >= (jQuery(this)[0].scrollHeight - 1)) {
					start_index = parseInt(start_index);
					end_index = parseInt(end_index);
					input_data.list_info.start_index = end_index + 1;
					input_data.list_info.sort_field = "updated_time"; //No I18N
					input_data.list_info.sort_order = "desc"; //No I18N

					input_data.list_info.row_count = row_count_global;
					var ajax_data = chat_util.constructAjaxData({
						url: "/channels/", //No I18N
						input: input_data
					});
					$target.off("scroll"); //No I18N
					if (forsearch) {
						redirect.loadUserChannelsinSearch(ajax_data, input_data, from)
					}
					else {
						chtload.appendUserChannels(ajax_data, input_data, from);
					}

					return false;
				}

			});
		}
		else {
			$target.off("scroll"); //No I18N
		}
	},
	/* Method for loading user recent chats and un read chats */
	loadUserAllChats: function (a, from_chat_bar) {
		jQuery("#chat-options").removeClass('hide');
		jQuery("#techs-nav").removeClass('active');
		jQuery("#chats-nav").addClass('active');
		if (from_chat_bar) {
			if (chat_box.openPopUp(a)) {
				let input_data = {}
				if (sdp_user.USERTYPE == "Technician") {
					renderhbs('#chat-tab-content', 'all-chats', input_data, false, 'chat/Common/Chat'); // NO I18N
					// getting user recent chats
					chtload.getUserChats("recent-chats", "my_recent_chats"); //No I18N
				}
				// getting user un read chats
				chtload.getUserChats("unread-chats", "unread_chats"); //No I18N
				chtload.getUserChats("notified-chats", "notified_chats"); //No I18N
				chtload.showHideNoChatNotifDiv();
			}
		}
		else {
			var input_data = {}
			if (sdp_user.USERTYPE == "Technician") {
				renderhbs('#chat-tab-content', 'all-chats', input_data, false, 'chat/Common/Chat'); // NO I18N
				// getting user recent chats
				chtload.getUserChats("recent-chats", "my_recent_chats"); //No I18N
			}
			// getting user un read chats
			chtload.getUserChats("unread-chats", "unread_chats"); //No I18N
			chtload.getUserChats("notified-chats", "notified_chats"); //No I18N
			chtload.showHideNoChatNotifDiv();
		}

		//hiding chat from requesters section
		var counter = jQuery("#sdp-chat-bar").find("#requester_chats").find(".chatrequest").length;
		if (counter == 0) {
			jQuery("#sdp-chat-bar").find("#req_chat_div").addClass('hide');
		}
		jQuery("#chat_room").parent().removeClass("hide");
		jQuery("#chat_history").parent().removeClass("hide");
		jQuery("#archived_channels").parent().addClass("hide");
		jQuery("#deleted_channels").parent().addClass("hide");
		jQuery("#channel-slider").parent().addClass("hide");
	},
	/* Method for getting the user chat history */
	openChatHistoryTab: function () {
		var title = translate('chat.history');
		jQuery('body').append('<div id="chat-history1"></div>');
		jQuery('#chat-history1').dialog({
			'modal': true,//NO I18N
			'title': title,//NO I18N
			//'top':'20',//NO I18N
			'width': 800,//NO I18N
			'height': 800,//NO I18N
			'position': { my: "center", at: "center", of: window },//NO I18N
			'resizable': false,//NO I18N
			'draggable': true,//NO I18N
			'closeOnEscape': true, //NO I18N
			open: function (event, ui) {
				var ele = jQuery(event.target);
				ele.css({ 'height': '100%' });// No I18N
				function codeblock() {
					let input_data = {}
					renderhbs(event.target, 'chat-history', input_data, true, 'chat/Technician/ChatOperations'); // NO I18N
					chtload.openChatHistory();
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
				jQuery('#chat-history1').remove();
			}
		});
	},
	openChatHistory: function () {
		let common_chats_techId = '';
		if (document.getElementById('common-chats') != null) {
			common_chats_techId = document.getElementById('common-chats').getAttribute('is_from_common_chats');
		}
		let input_data = {};
		if (common_chats_techId !== '') {
			input_data = {
				"list_info": { //No I18N
					"filter_by": { // No I18N
						"name": "common_chats" //No I18N
					},
					"search_criteria": {//No I18N
						"field": "members.member.id",//No I18N
						"condition": "is",//No I18N
						"value": common_chats_techId //No I18N
					}
				}
			};

		}
		else {
			input_data = {
				"list_info": { //No I18N
					"filter_by": { // No I18N
						"name": "my_chats" //No I18N
					}
				}
			};
		}
		input_data.list_info.sort_field = "last_mesg_time"; //No I18N
		input_data.list_info.sort_order = "desc"; //No I18N
		input_data.list_info.row_count = row_count_global;
		let ajax_data = chat_util.constructAjaxData({
			input: input_data,
			url: "/chats" //No I18N
		});
		const $recent_obj = jQuery("#chathistnav").find("#all_user_chats");
		const $chathist = jQuery("#chathistnav");
		$chathist.find("#continue_chat").addClass('hide');
		$chathist.find(".chat-wrapcont").html('');

		$recent_obj.empty();
		chtload.appendChatHistory(ajax_data, false);
	},
	/* Method for appending the chats to the history div */
	appendChatHistory: function (ajax_data, from_scroll) {
		var start_index = 0, end_index = 0, has_more_rows = false;
		sdpAjax(ajax_data).done(function (response) {
			if (chat_util.checkAjaxResponse(response)) {
				let is_empty = true;
				if (response.chats.length !== 0) {
					is_empty = false;
				}
				function codeblock() {
					let input_data = { "response": response, "sdp_user": sdp_user, "is_empty": is_empty };//No I18N
					renderhbs('#chathistnav .disp-t ', 'chat-history-left', input_data, false, 'chat/Technician/ChatOperations'); // NO I18N
				}
				if (!sdp_chat.technician_chatops_hbs) {
					ResourceLoader({
						js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
						success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
					});
				}
				else { codeblock(); }
			}
		});
		if (!from_scroll) {

			jQuery(".ui-dialog").find("#all_user_chats").animate({ scrollTop: 0 }, "slow"); //No I18N
			jQuery(".ui-dialog").find(".chathistnav").find("#chat_transcript_mesg").removeClass("hide");
			jQuery(".ui-dialog").find(".chathistnav").find(".chat-wrapcont").html('');
		}
		chtload.bindInfiniteScrollChatHistory(start_index, end_index, has_more_rows);
	},
	/* Method for binding the infinite scroll to the chat history */
	bindInfiniteScrollChatHistory: function (start_index, end_index, has_more_rows) {
		const $target = jQuery(".ui-dialog").find(".chathistlistview").find(".admin-tbl");
		if (has_more_rows) {
			let input_data = {};
			$target.off('scroll.chatHistory').on('scroll.chatHistory', function () {//No I18N
				if ((jQuery(this).scrollTop() + jQuery(this).innerHeight()) >= (jQuery(this)[0].scrollHeight - 1)) {
					start_index = parseInt(start_index);
					end_index = parseInt(end_index);
					input_data = {
						"list_info": { //No I18N
							"filter_by": { // No I18N
								"name": "my_chats" //No I18N
							},
							"start_index": end_index + 1 //No I18N
						}
					};
					input_data.list_info.sort_field = "last_mesg_time"; //No I18N
					input_data.list_info.sort_order = "desc"; //No I18N
					input_data.list_info.row_count = row_count_global;
					var common_chats_techId = jQuery(".ui-dialog").find("#is_from_common_chats").text();
					if (common_chats_techId !== '') {
						input_data.list_info.filter_by.name = "common_chats";
						let tech_obj = {};
						tech_obj.user = { "id": common_chats_techId }; //No I18N
						tech_obj.condition = "is";//No I18N
						tech_obj.value = common_chats_techId;
						input_data.list_info.search_criteria = tech_obj;
					}

					var ajax_data = chat_util.constructAjaxData({
						url: "/chats", //No I18N
						input: input_data
					});
					$target.off("scroll"); //No I18N
					chtload.appendChatHistory(ajax_data, true);
					return false;
				}

			});
		}
		else {
			$target.off("scroll"); //No I18N
		}
	},
	/* Method for loading a chat from chat history */
	loadChatHistory: function (a) {
		function codeblock() {
			let input = {}
			renderhbs('#dummy-transcript', 'chat-history-right', input, false, 'chat/Technician/ChatOperations'); // NO I18N
			const $a = jQuery(a);
			let chatId = $a.attr("data-chatid");
			chat_box.addActiveChatClass(chatId);
			let ajax_data = chat_util.constructAjaxData({
				url: "/chats/" + chatId //No I18N
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					const chat_status = response.chat.status.name;
					const $obj = jQuery("#chathistnav").find(".chathistnav");
					const $chat_obj = $obj.find("#continue_chat");
					const $content_obj = $obj.find("#chat_content_area");
					const chat_entity = response.chat.entity_str;
					$obj.find("#chat_transcript_mesg").addClass("hide");
					if (chat_status === "Running" && ((chat_entity === 'requester_chat' && (sdp_app.IS_REQUESTER_CHAT_ENABLED_FOR_USER || sdp_user.USERTYPE == "Requester") || (chat_entity !== 'requester_chat' && sdp_app.IS_TECH_CHAT_ENABLED) || chat_entity == 'tech_req_chat'))) {
						$chat_obj.find('[data-name="continue_chat"]').off('click.chatBox').on('click.chatBox', function () { chat_box.continueChat(chatId) });//No I18N
						$chat_obj.removeClass("hide");
						$content_obj.attr("style", "height: 440px;");
					}
					else {
						$chat_obj.addClass("hide");
						$content_obj.removeAttr("style");
					}
					//assiging anchor tag if workorder id exists
					var request_id = null;
					if (chat_entity === 'collaborators_chat') {
						request_id = response.chat.entity_id;
					}
					if (response.chat.request_chat_association) {
						request_id = response.chat.request_chat_association.request.id;
					}
					if (request_id != null) {
						$chat_obj.find("#ticket_id").text("#" + request_id).attr("href", "/WorkOrder.do?woMode=viewWO&woID=" + request_id).removeClass("hide");
					}
					else {
						$chat_obj.find("#ticket_id").addClass("hide");
					}
					if (chat_status != "Completed") {
						response.chat.messages = response.chat.messages.reverse();
					}
					chat_util.processmessages(chatId, response.chat.messages, false, true);
					if (chat_status === "Running" || chat_entity == "channel") {
						let startIndex = response.chat.messages_list_info.start_index;
						let endIndex = startIndex + response.chat.messages_list_info.row_count - 1;
						chat_box.bindInfiniteScroll(chatId, startIndex, endIndex, response.chat.messages_list_info.has_more_rows, true);
						$a.attr("msgEndIndex", endIndex);
					}

					// scroll down
					const $target = jQuery("#chathistnav").find('.chathistnav').find("#chat_content_area");
					$target.scrollTop($target[0].scrollHeight);
					/**
					 * Reinitialize the Attachment preview
					 */
					chat_util.reinitateATP();

				}
			}).fail(function (response) {
				chat_util.checkAjaxResponse(response.responseJSON);
			});
		}
		if (!sdp_chat.technician_chatops_hbs) {
			ResourceLoader({
				js: ["/scripts/hbs-template-technician-chatoperations.js"], // No I18N
				success: function () { sdp_chat.technician_chatops_hbs = true; codeblock(); }
			});
		}
		else { codeblock(); }
	},
	/* Method for showing/hiding the no chat notification content div */
	showHideNoChatNotifDiv: function () {
		const $chatObj = jQuery("#sdp-chat-bar");
		const requesters_chat_len = $chatObj.find("#requester_chats").find(".chatrequest").length;
		const recent_chat_len = $chatObj.find("#recent-chats").find(".chatrequest").length;
		const unread_chat_len = $chatObj.find("#unread-chats").find(".chatrequest").length;
		if (unread_chat_len == 0) {
			$chatObj.find("#unread-chats").parent('div').addClass("hide");
		}
		else {
			$chatObj.find("#unread-chats").parent('div').removeClass("hide");
		}
		if (recent_chat_len == 0) {
			$chatObj.find("#recent-chats").parent('div').addClass("hide");
		}
		else {
			$chatObj.find("#recent-chats").parent('div').removeClass("hide");
		}
		if (requesters_chat_len + unread_chat_len + recent_chat_len == 0) {
			$chatObj.find("#no_chat_notif_div").removeClass('hide');
			$chatObj.find("#adchatreqcount").addClass('hide');
		}
		else {
			$chatObj.find("#no_chat_notif_div").addClass('hide');
			$chatObj.find("#adchatreqcount").removeClass('hide');
		}

	},
	/* Method for changing the user status from other areas when a user is logged in/logged out from the application */
	setUserOtherAreaStatus: function (techId, type) {
		let span_class = "avaicon mr5 pos-abs top20 ml-5"; //No I18N
		if (type === 'user_logout') {
			span_class = "waiticon mr5 pos-abs top20 ml-5";//No I18N
		}
		if (jQuery("#sdp-chat-bar").find("#user_chats , #missed-chat-tab").parent('li').attr('class') === 'active') {

			// changing user status from recent chats section
			const $recentObj = jQuery("#sdp-chat-bar").find('#recent-chats').find('[data-userid="' + techId + '"]');

			let recent_len = $recentObj.length;
			if (recent_len > 0) {
				$recentObj.find('.chat-dp').find('span').removeClass().addClass(span_class);

			}

			// changing user status from missed chats section

			const $missedObj = jQuery("#sdp-chat-bar").find('#unread-chats').find('[data-userid="' + techId + '"]');
			const missed_len = $missedObj.length;
			if (missed_len > 0) {
				$missedObj.find('.chat-dp').find('span').removeClass().addClass(span_class);
			}
		}

		// changing user status from group chat popup users
		var $chatObj = jQuery("#sdp-chat-bar").find(".chatbar-maincontent");
		jQuery.each($chatObj, function () {
			var chatTechId = jQuery(this).attr("data-userid");
			var chatId = jQuery(this).attr("id");
			if (techId !== undefined && techId == chatTechId) {
				chat_box.setUserStatus(chatId, type);
			}
			else {
				// check it in group chat
				chat_box.changeGroupMembersCount(chatId, techId, type);
			}

		});

		// changing user status in case if chat history is opened
		var chat_history_style = jQuery("#chathistnav").parents('#_DIALOG_LAYER').attr('style'); //No I18N
		if (chat_history_style != undefined && chat_history_style.indexOf('visible') > -1) {
			// means chathistory is opened
			var $historyObj = jQuery("#chathistnav").find('#all_user_chats').find('[data-userid="' + techId + '"]');
			var history_len = $historyObj.length;
			if (history_len > 0) {
				$historyObj.find('.mr10').removeClass().addClass(span_class);
			}

		}

	},
	/* Metho to get the last chat message for showing in recent chats section */

	getChatLastMesg: function (content, type, user, userId, chat_entity) {
		let mesg = "";
		if (type === 'attachment') {
			if (userId == sdp_user.LOGGEDIN_USERID) {
				mesg = translate("chat.attachment.added.by.me");
			}
			else {
				mesg = translate("chat.attachment.added.by.user", [user])
			}
			return mesg;

		}
		if ((chat_entity === "requester_chat" || chat_entity === "technician_chat") && userId != sdp_user.LOGGEDIN_USERID) {
			return content;
		}
		if (userId == sdp_user.LOGGEDIN_USERID) {
			user = translate("common.common.you");
		}
		mesg = user + " :" + content;
		return mesg;

	},
	/* Metho to append the last chat message in recent chats section */

	appendLastChatMesg: function (id, content, type, user, userid, time) {
		const chat_portalid = jQuery("#sdp-chat-bar #" + id).attr("data-portalid");
		if (chat_portalid == PORTALID && jQuery("#sdp-chat-bar #user_chats").parent('li').attr('class') === 'active' && content != undefined) {
			const $recentObj = jQuery("#sdp-chat-bar #recent-chats");
			const chat_len = $recentObj.find('[data-chatid="' + id + '"]').length;
			if (chat_len > 0) {
				const chat_entity = $recentObj.find('[data-chatid="' + id + '"]').attr("data-chatentity");
				const data_time = $recentObj.find('[data-chatid="' + id + '"]').attr("data-time");
				const last_chat_mesg = chtload.getChatLastMesg(content, type, user, userid, chat_entity);
				$recentObj.find('[data-chatid="' + id + '"] .text-muted').text(last_chat_mesg);
				$recentObj.find('[data-chatid="' + id + '"] .font-xsmall').text(time.split("||")[1]);
				$recentObj.find('[data-chatid="' + id + '"]').removeAttr('data-time').attr("data-time", time.split("||")[0]);
				var $recentObj_content = $recentObj.find('[data-chatid="' + id + '"]');
				$recentObj.find('[data-chatid="' + id + '"]').remove();
				$recentObj.prepend($recentObj_content);
				var len = $recentObj.find('[data-time="' + data_time + '"]').length;
				if (len == 0) {
					$recentObj.find("span:contains('" + data_time + "')").parent('div').remove(); //No I18N
				}
			}
			$recentObj.find('[data-chatid="' + id + '"]').off("click.recentChat").on("click.recentChat", function () {//NO I18N
				chtload.openRecentChat(id);
			});
		}
	},
	clearSearchResults: function () {
		//clearing search tech/group results
		const $chatBar = jQuery("#sdp-chat-bar");
		$chatBar.find(".ch-clearbutton").trigger('click');
		$chatBar.find('[data-name=searcharea]>p.text-muted').remove();
	},
	//method to toggle the bulk add chat action to expand or collapse
	expandaction(a) {
		const $element = jQuery(a);
		const $wrap = $element.closest(`[data-id='action_div']`);// NO I18N
		const $main = $wrap.find(`[data-id='main_action']`);
		const $sub = $wrap.find(`[data-id='sub_action']`);
		if ($main.hasClass("hide")) {
			$main.removeClass("hide");
			$sub.addClass("hide");
		}
		else if ($sub.hasClass("hide")) {
			$sub.removeClass("hide");
			$main.addClass("hide");
		}
	}


};

(function () {

	jQuery.fn.filtersearchwithev = function (options) {
		let data = jQuery("#sdp-chat-bar");
		let keycount = -1;
		let defhgt = data.find('[data-name=searcharea]').height();
		let additioalhgt = 0;
		function searchKeyup(a, event) {
			children = data.find('[data-name=searcharea] li');
			let search = a;
			children.show().filter(function () {
				return jQuery(this).text().toUpperCase().indexOf(search.toUpperCase()) < 0;
			}).hide();
			data.find('[data-name=searcharea] ul').each(function () {//ul heading hide show ---> isn't unifrom... might need to change structure of html

			});
			if (data.find('[data-name=searcharea] li:visible').length == 0) {//no data in th list hide show
				if (data.find('[data-name=searcharea]>p.text-muted').length <= 0) {
					data.find('[data-name=searcharea]').prepend('<p class="text-muted tc mt10">' + translate("common.no.match.found") + '</p>');
				}
			} else {
				data.find('[data-name=searcharea]>p.text-muted').remove();
			}
			if (search != '') {
				data.find('.ch-clearbutton').show();
			} else {
				data.find('.ch-clearbutton').hide();
			}
			/* arrow keyup */
			var datali = data.find('[data-name=searcharea] li');
			var datalivisible = data.find('[data-name=searcharea] li:visible');
			key = event.keyCode;
			if (key == 13) {//enter
				if (keycount != -1) {
					data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').find('a').trigger('click');
				}
			} else if (key == 38) {//up
				datali.removeClass('searchlight');
				if (keycount >= datalivisible.length) {
					keycount = datalivisible.length - 2;
				} else if (keycount <= 1) {
					keycount = 0;
					additioalhgt = 0;
				} else {
					keycount = keycount - 1;
				}
				data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').trigger('focus').addClass('searchlight');
				//Animation
				if (data.find('[data-name=searcharea]').offset().top + defhgt - 30 > data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').offset().top) {
					if (additioalhgt > 0) {
						additioalhgt -= data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').outerHeight(true);
					}
					data.find('[data-name=searcharea]').animate({
						scrollTop: additioalhgt + 5
					});
				}
			} else if (key == 40) {//down
				datali.removeClass('searchlight');
				if (keycount + 1 >= datalivisible.length) {
					keycount = datalivisible.length - 1;
				} else if (keycount < 0) {
					keycount = 0;
					additioalhgt = 0;
				} else {
					keycount = keycount + 1;
				}
				data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').trigger('focus').addClass('searchlight');
				//Animation
				if (data.find('[data-name=searcharea]').offset().top + defhgt - 30 < data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').offset().top) {
					if (!data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').is(':last-child')) {
						additioalhgt += data.find('[data-name=searcharea] li:visible:eq(' + (keycount) + ')').outerHeight(true);
					}
					data.find('[data-name=searcharea]').animate({
						scrollTop: additioalhgt + 5
					});
				}
			}
			else {
				datali.removeClass('searchlight');
				clearalldata();
			}
		}
		function clearalldata() {
			keycount = -1;
			additioalhgt = 0;
			data.find('[data-name=searcharea]').animate({
				scrollTop: 0
			});
		}
		function init() {
			data.off('keyup.chatBar').on('keyup.chatBar', '[data-name=inputsearch]', function (event) {//No I18N
				searchKeyup(jQuery(this).val(), event);
			});
			data.off('click.chatBar').on('click.chatBar', '.ch-clearbutton', function (event) {//No I18N
				jQuery(this).hide();
				data.find('[data-name=inputsearch]').val('').trigger('keyup').trigger('focus');
				clearalldata();
			});
			data.find('[data-name=searchhead]').each(function () {
				additioalhgt += jQuery(this).outerHeight(true);
			});
		}
		init();
	}

	jQuery.fn.chatbarfn = function (options) {
		let input_data = {}
		const $body = jQuery(document.body);
		var sdpChatBarDiv = jQuery("#sdp-chat-bar > .chatrow");// NO I18N
		if(is_external_chat){
			$body.append('<div id="sdp-chat-bar" class="chat-bar chat-bar1">');// NO I18N
			sdpChatBarDiv = jQuery("#sdp-chat-bar");// NO I18N
			sdpChatBarDiv.addClass("ext-chat-bar");// NO I18N
			$body.append('<div id="common-svg-code" class="hide"></div>');// NO I18N
		}else{
			sdpChatBarDiv.addClass("left0");// NO I18N
		}
		if (options.usertype == 'Requester') {
			if (!is_external_chat && sdp_app.zia_info.IS_BOT_ENABLED) {
				input_data.is_zia_enabled = true;
			}
			input_data.user_name = sdp_user.USERNAME;
			if (window.checkIfMSPOrSCP()) {
				input_data.isSCP = checkIfSCP();
			}
			if (is_external_chat) {
				renderhbs(sdpChatBarDiv, 'requester-external-chat', input_data, true, 'chat/Requester'); // NO I18N
			} else {
				renderhbs(sdpChatBarDiv, 'requester-chat-bar', input_data, true, 'chat/Requester'); // NO I18N
			}
			let isOperational=requester_chat.inOperationalHours();
			input_data.isOperational=isOperational;
			input_data.isColsedChatEnabled=sdp_app.IS_CLOSED_CHAT_ENABLED;
			renderhbs("#unread_chats_div", 'requester-new-chat-tab', input_data, true, 'chat/Requester', false, false,function(){ // NO I18N
                jQuery("#unread_chats_div").find("[data-name='newReqChatInput']").on('keypress.newReqChatInput', function(event){
					requester_chat.newReqchat(event,this);
				});
				requester_chat.loadExistReq();
            });
			if (sdp_app.IS_SUPPORT_GROUP_MANDATE) {
				jQuery("#unread_chats_div").find("#mandate_support_group").removeClass('hide');
			}
		} else {
			if (is_external_chat) {
				renderhbs(sdpChatBarDiv, 'requester-external-chat', input_data, true, 'chat/Requester'); // NO I18N
			} else {
				$body.append('<div class="p15" data-chatbar="true"></div>');// NO I18N
				renderhbs(sdpChatBarDiv, 'technician-chat-bar', input_data, true, 'chat/Technician/Chat'); // NO I18N
			}
			initTooltip("#sdp-chat-bar"); // NO I18N
		}
		if (window.Ember) {
			jQuery("[data-chatbar=true]").remove();
			setTimeout(function () {
				jQuery(".ember-view").eq(0).addClass("pb30");
			});
		}
		var _self = jQuery('#sdp-chat-bar');
		/* Load group dropdown for Requester */
		function loadGroupDropdown() {
			jQuery("#qc_grpSearch").sdp_select2({
				placeholder: translate("common.select.group"),
				allowClear: true,
				multiple: false,
				url: [{
					"url": "/api/v3/chats/group",//No I18N
					"field": "group",//No I18N
					"list_info": { "row_count": 100 }//No I18N
				}]
			});
		}
		if (!is_external_chat) {
			initTooltip(".chatmain-column");// NO I18N
		}
		/* Load open chats when page is reloaded */
		function loadActiveChats() {
			let ajax_data = chat_util.constructAjaxData({
				input: {
					"list_info": { //No I18N
						"filter_by": { // No I18N
							"name": "active_chats" //No I18N
						},
						"row_count": row_count_global //No I18N
					}
				},
				url: "/chats" //No I18N
			});
			sdpAjax(ajax_data).done(function (response) {
				if (chat_util.checkAjaxResponse(response)) {
					if (response.chats.length) {
						let open_chats = [];
						let details = {};
						var is_requester_chat_present = false;
						if (is_external_chat) {
							is_requester_chat_present = requester_chat.checkRequesterChatPresent(response.chats);
						}
						let $chat_bar_div = jQuery("#sdp-chat-bar");
						response.chats.forEach(function (item, index, arr) {


							details.id = item.id;
							details.state = "min"; //No I18N
							open_chats.push((typeof sdpToJSON != 'undefined') ? sdpToJSON(details) : JSON.stringify(details));
							var chat_entity = "", serviceName = null;
							var title = "", is_tech_chat = true, userId = "", user_status = "online";
							var chat_status = item.status.name;
							if (sdp_user.USERTYPE === 'Requester') {
								chat_entity = item.entity_str;
								userId = sdp_user.LOGGEDIN_USERID;

								if (chat_entity === "requester_chat") {
									is_tech_chat = false;
								}
								if (chat_entity === "channel") {
									title = item.title;
								}
								else {
									title = sdp_user.USERNAME;
								}
								if (item.members) {
									item.members.forEach(function (i, index, arr) {
										var memberId = i.member.id;
										if (memberId != sdp_user.LOGGEDIN_USERID) {
											userId = memberId;
											user_status = i.status;
											title = i.member.name;

										}
									});
								}
								if (chat_entity !== "requester_chat" && is_external_chat) {
									return;
								}
								if (is_requester_chat_present && is_external_chat && chat_entity !== "requester_chat") {
									//Means chat initiated by the requeter is present, so loading only that chat in external chat
									return;
								}
								if (!is_requester_chat_present && is_external_chat && active_chatids.length > 1) {
									//Means technician initiated chats present in the active chats, so loading only first chat
									return;
								}
							}
							else {
								title = item.title;

								if (item.members) {
									item.members.forEach(function (i, index, arr) {
										var memberId = i.member.id;
										if (memberId != sdp_user.LOGGEDIN_USERID) {
											userId = memberId;
											user_status = i.status;
											if (title == null) {
												title = i.member.name;
											}
										}
									});
								}

								chat_entity = item.entity_str;
							}
							if (item.serviceName) {
								serviceName = item.serviceName;
							}
							var request_id = null;
							var portalId = item.portalid;
							if (chat_entity === 'collaborators_chat') {
								request_id = item.entity_id;
							}
							if (item.request_chat_association) {
								request_id = item.request_chat_association.request.id;
							}
							if (chat_entity === "channel") {
								chat_box.chatpickedfn(item.id, item.title, userId, request_id, is_tech_chat, chat_entity, portalId, item);
							}
							else {
								chat_box.chatpickedfn(item.id, title, userId, request_id, is_tech_chat, chat_entity, portalId, item);
							}
							if (chat_entity === 'technician_chat' || chat_entity === 'fluid_group_chat' || chat_entity === 'collaborators_chat' || (chat_entity === 'channel' && item.channel_info.allowed_channel_actions.includes('add_member') && chat_status == "Running")) {
								chat_actions.suggestAddMembers(item.id);
							}
							chat_actions.suggestToMentionMembers(item.id);
							// Minimize chat box
							chat_box.chatminimizefn1($chat_bar_div.find("#" + item.id).find("#minimize_chat"));
							// Add parameters for loading the messages on opening the chat box
							$chat_bar_div.find("#" + item.id + " .chat-mini-header").attr("data-loadchat", "true");
							// Adding colors
							if (is_external_chat) {
								$chat_bar_div.find("div.chatmain-column").addClass('hide').end()
									.find("#open-requester-chat").addClass("hide");
								chtload.chatpickalignmentfn();
								$chat_bar_div.find("#" + item.id + " .chat-mini-header").trigger('click');
							}

							if (serviceName != null) {
								$chat_bar_div.find("#" + item.id + " #chat_title").before("<img class='mr3 vtop pos-rel top1' alt='" + serviceName + "' src='/custom/customimages/integration/" + serviceName + ".svg' width='15' height='15'>");
								$chat_bar_div.find("#" + item.id + " #edit_chat_title").before("<img class='mr3 vtop pos-rel top1' alt='" + serviceName + "' src='/custom/customimages/integration/" + serviceName + ".svg' width='15' height='15'>");
							}

						});
						if (!is_external_chat) {
							chat_util.setChatInfo(open_chats);
						}
					}
					else {
						if (!is_external_chat) {
							removeItem("sdp_open_chats"); //No I18N
						}

					}
				}
			});
		}

		/* Translate static strings in chat template */
		function translateTemplate($doc) {
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
				if (key === 'common.unread.chats' || key === 'common.recent.chats') {
					var text = jQuery(this).html();
					jQuery(this).html(text + translate(key));
				}
				else {
					jQuery(this).text(translate(key));
				}
			});
		}

		/* Initiate chat bar for Tech */
		function initTech($doc) {
			// Initiate chat counter as Zero.
			requester_chat.chatCounter();
			const $chat_obj = jQuery("#sdp-chat-bar .chatmain-column");

			let status = translate("chat.user.available");

			$chat_obj.find("#user_name").text(sdp_user.USERNAME).end()
				.find("#chat_room").text(translate("chat.room")).end()
				.find("#chat_history").text(translate("chat.history")).end()
				.find("#technicansearch").attr("placeholder", translate("common.search.technicians")).end()
				.find("#groupsearch").attr("placeholder", translate("common.search.groups"));


			if (!sdp_user.IS_TECH_ONLINE) {
				$chat_obj.find("#user_status_cls").removeClass().addClass('waiticon mr5');
				status = translate("sdp.techMarking.offline");
			}
			$chat_obj.find(".chatusrsts").text(status);

			if (sdp_user.ROLES.indexOf("SDAdmin") == -1) {
				$chat_obj.find("#chat_room").remove();
			}
		}

		/* Initiate chat bar for Requester */
		function initReq($doc) {
			// Set User name for main column of Requester
			$doc.find(".chatmain-column .chatusrname").text(options.username);
			$doc.find("#chat_history").text(translate("chat.history"));
			if (sdp_app.IS_SUPPORT_GROUP_MANDATE) {
				$doc.find("#mandate_support_group").removeClass('hide');
			}

			// Chat Requester Page Click
			_self.off('click.chatBarReq').on('click.chatBarReq', '#reqChat, #open_livechat', function (e) { // NO I18N
				e.preventDefault();
				chat_box.openPopUp(jQuery("#sdp-chat-bar").find("#open-requester-chat"));
				if (!sdp_app.IS_NEW_REQ_CHAT_ENABLED) {
					if (jQuery("#unread_chats_div").length == 0) {
						jQuery('#chat-tab-content  .chat-wrapcont').remove();
						jQuery('#chat-tab-content').append('<div id="unread_chats_div" class="sdtab-pane in active" data-id="unread-chat"></div>');
						jQuery('#chat-tab-content').append('<div id="new_chat_div" class="mb20"></div>');
						const $nav = jQuery("#sdp-chat-bar").find("#requester_nav");
						$nav.removeClass("hide")
							.find('li').removeClass("active")
						$nav.find("#req-new-chat").addClass("active")
						renderhbs("#unread_chats_div", 'requester-new-chat-tab', input_data, true, 'chat/Requester', false, false, function () { // NO I18N
							jQuery("#unread_chats_div").find("[data-name='newReqChatInput']").off('keypress.newReqChatInput').on('keypress.newReqChatInput', function (event) {// NO I18N
								requester_chat.newReqchat(event, this);
							});
						});
					}
					jQuery("#chat_history").parent().removeClass("hide");
					$doc.find(".chat-newold-task .newchatreqtype").remove().end()
						.find(".chat-new-reqdetails .chat-quesarea").remove().end()
						.find("#exitreq").prop('checked', true).click(); //No I18N

				}
				else {
					if (jQuery("#unread_chats_div").length == 0) {
						jQuery('#chat-tab-content  .chat-wrapcont').remove();
						jQuery('#chat-tab-content').append('<div id="unread_chats_div" class="sdtab-pane in active" data-id="unread-chat"></div>');
						jQuery('#chat-tab-content').append('<div id="new_chat_div" class="mb20"></div>');
						const $nav = jQuery("#sdp-chat-bar").find("#requester_nav");
						$nav.removeClass("hide")
							.find('li').removeClass("active")
						$nav.find("#req-new-chat").addClass("active")
						renderhbs("#unread_chats_div", 'requester-new-chat-tab', input_data, true, 'chat/Requester', true, false, function () { // NO I18N
							jQuery("#unread_chats_div").find("[data-name='newReqChatInput']").off('keypress.newReqChatInput').on('keypress.newReqChatInput', function (event) { // NO I18N
								requester_chat.newReqchat(event, this);
							});
						});
						if (sdp_app.IS_SUPPORT_GROUP_MANDATE) {
							jQuery("#unread_chats_div").find("#mandate_support_group").removeClass('hide');
						}
					}
					if (!$doc.find(".chat-new-reqdetails .select2-container").length) {
						loadGroupDropdown();
					}
					jQuery("#chat_history").parent().removeClass("hide");
				}
				jQuery("#sdp-chat-bar").find("#open-requester-chat").parent('li').addClass('active'); //No I18N
				chtload.chatpickalignmentfn();
				if (is_external_chat) {
					jQuery('.zia-chat>.chat-mini-header').addClass('hide')
					// Need to add 'external-zia' when zia is present and remove for livechat
					jQuery('#sdp-chat-bar').removeClass('external-zia');
					maximizeExternalIframe("");
					$doc.find("#req_chat_history").remove();
					$doc.find("#reqChat").closest("div.chat-mini-header").addClass("hide"); //No I18N
					$doc.find("div.chatmain-column").find("div.chat-wrapper").not('.chatbot-zia').removeClass("hide");
					$doc.find("#reqChat").addClass("active");
				}
				let $missed = jQuery("#missed-chat-count");
				if (!jQuery("#neededchat").hasClass("hide")) {
					$missed.addClass("hide");
				}
				else {
					$missed.removeClass("hide");
				}


			});
			// New Request tab for Requester
			_self.off('click.newreq').on('click.newreq', '#newreq', function () {// NO I18N
				$doc.find('.existingchatreqtype span').removeClass('active').end()
					.find('.newchatreqtype span').addClass('active').end()
					.find(".chat-old-reqdetails").addClass('hide').end()
					.find(".chatmain-column .chattxt").prop("disabled", false).end()  //No I18N
					.find(".chat-new-reqdetails, .chatmain-column .chat-quesarea").removeClass('hide').end()
					.find(".chat-req-wrapper").css('height', '241px'); //NO I18N


			});
			// Existing Request tab for Requester
			_self.off('click.exitreq').on('click.exitreq', '#exitreq', function () {// NO I18N
				getRequesterRequests($doc);
				jQuery('.newchatreqtype span').removeClass('active');
				jQuery('.existingchatreqtype span').addClass('active');
				jQuery(".chat-new-reqdetails").addClass('hide');
				jQuery(".chat-old-reqdetails").removeClass('hide');
				$doc.find(".chatmain-column .chattxt").prop("disabled", true); //No I18N

			});

		}

		function getRequesterRequests($doc) {
			sdpAjax({
				url: '/api/v3/requests', // No I18N
				type: "GET",// No I18N
				data: { "input_data": sdpToJSON({ "list_info": { "row_count": 50, "start_index": 1, "filter_by": { "name": "All_Pending_Requester" } } }) },// No I18N
				success: function (response) {
					if (response.response_status[0].status.toLowerCase() != "failed") { //No I18N
						var $open_req_list = $doc.find(".chatmain-column .chat-old-reqdetails ul.p0");
						$open_req_list.empty();
						var list_arr = [];
						if (response.requests) {
							$doc.find(".chatmain-column .chat-old-reqdetails ul.req-list-error").addClass('hide').end()
								.find(".chatmain-column .chat-old-reqdetails ul.req-list").removeClass('hide');
							response.requests.forEach(function (item, index, arr) {
								$open_req_list.append("<li><span class='requesttype' role='button' data-name='requesterRequest' data-workorderid='" + item.id + "'> # " + item.id + " - " + e_html(item.subject) + " </span></li>");
							});
							$open_req_list.find("[data-name='requesterRequest']").off("click.requestContainer").on("click.requestContainer", function () {// NO I18N
								requester_chat.openChatForRequest(this);
							});

						} else {
							$doc.find(".chatmain-column .chat-old-reqdetails ul.req-list").addClass("hide").end()
								.find(".chatmain-column .chat-old-reqdetails ul.req-list-error").text(response.response_status[0].status).end()
								.find(".chatmain-column .chat-old-reqdetails ul.req-list-error").removeClass('hide');
						}
					} else {
						chtload.showAjaxError(response.response_status[0].status);
					}

				}
			});
		}

		/* Chat bar initiate function. This function will be called first when sdp-chat-bar.js is loaded */
		function init() {
			chtload.options = options;
			var $doc = jQuery(document);
			/* Translate the template */
			translateTemplate($doc);
			if (options.usertype == "Technician") {
				initTech($doc);
				jQuery("[data-name=inputsearch]").filtersearchwithev();
			}
			else if (sdp_app.IS_CHAT_ENABLED) {
				initReq($doc);
			}
			else {
				if (options.usertype == "Technician") {
					jQuery("#sdp-chat-bar").addClass("hide");
				}

			}
			/* Load active chats */
			if (sdp_user.MISSED_CHAT_COUNT) {
				chtload.showUnreadCount(sdp_user.MISSED_CHAT_COUNT);
			}
			loadActiveChats();
			/*** Chat scroll bind ***/
			chat_box.bindMousewheel($doc.find('.chatmain-column .chat-wrapper .chat-wrapcont'));

			setTimeout(function () {
				chtload.chatpickalignmentfn();
			}, 100);
			//is external we are hiding missed chat and new chat tabs and displaying new chat as default
			if (is_external_chat) {
				jQuery("#sdp-chat-bar").find(".sdtabs-ui2").hide();
				jQuery("#requester1").find(".chat-wrapcont").attr("style", "height: 260px;");
			}

		}
		// zia
		// When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
		if (sdp_app.IS_SDP_CHAT_ENABLED && (!is_external_chat || (is_external_chat && sdp_app.IS_SDP_EXT_CHAT_ENABLED))) {
			init();
		}
		if (!sdp_app.IS_SDP_CHAT_ENABLED) {
			//SD-84148:Chat icon is displayed in requester login eventhough chat is disabled under chat settings .
			jQuery(".chatmain-column:not('.zia-chat'), .requester-chat-icon").hide();
		}
		if (sdp_app.IS_CHAT_ENABLED_FOR_USER !== undefined && !sdp_app.IS_CHAT_ENABLED_FOR_USER) {
			jQuery("#sdp-chat-bar").find("#reqChat").remove();
		}
		//zia
		return this;
	}
})(jQuery);