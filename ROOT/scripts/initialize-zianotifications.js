/* $Id$ */
var is_zia_initialized = false;
var ziacallchat1;
function ziahtmlload() {
	var ziaBar = "/zia/ZiaNotifications.jsp"; //No I18N
	jQuery.ajax(ziaBar)
		.done(function (response) {
			is_zia_initialized = true;
			jQuery("#sdp-chat-bar > .chatrow").prepend(response);
            if(is_external_chat) {
                // When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
                if (sdp_app.IS_SDP_EXT_CHAT_ENABLED && sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE) {
                    jQuery('.zia-chat>.chat-mini-header').addClass('hide')
                } else if (sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
                    // Need to add 'external-zia' when zia is present and remove for livechat
                    jQuery('#sdp-chat-bar').addClass('external-zia');   //NO I18N
                    // Need to click Zia only when requester chat is inactive
                    if (typeof(is_initial_load) != 'undefined' && !is_initial_load) {
                        jQuery('.zia-chat>.chat-mini-header').trigger("click");
                    }
                }
            }
		}).fail(function () {
			showalert('failure', translate("zia.notification.loading.error"), "isAutoHide=true"); // No I18N
		});
	ziacallchatclear();
}
function ziacallchat() {
	if ((!is_external_chat && sdp_app.zia_info.CAN_SHOW_ICON && !sdp_app.IS_REBRAND && !window.externalframe) || (is_external_chat && sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0  && !window.externalframe)) { //zia not supported in externalframe
		if (!sdp_app.IS_CHAT_ENABLED) {
			jQuery('body').trigger("ziaload");//118056, 118084 -- custom action(ziaload) triggered
		}
		ziahtmlload();
	}
}
function ziacallchatclear() {
	clearInterval(ziacallchat1);
}
jQuery(window).ready(function () {
	// SD-111642 || If Zia is loaded already, then don't proceed
	if (!is_external_chat && !jQuery('#sdp-chat-bar').find('.zia-chat').length) {
		ziacallchat1 = setInterval(function(){ ziacallchat(); }, 1000);
		setTimeout(function () { ziacallchatclear() }, 10000);
	}
});

