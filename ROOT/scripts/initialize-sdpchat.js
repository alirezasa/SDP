/* $Id$ */

function minimizeExternalIframe(chatId) {
	window.top.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON({ "type": "minimize_iframe", "id": chatId }) : JSON.stringify({ "type": "minimize_iframe", "id": chatId }), external_chat_origin); //No I18N
}

function maximizeExternalIframe(chatId) {
	window.top.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON({ "type": "maximize_iframe", "id": chatId }) : JSON.stringify({ "type": "maximize_iframe", "id": chatId }), external_chat_origin); //No I18N
}

jQuery(window).ready(function() {
    var is_chat_enabled = sdp_app.IS_SDP_CHAT_ENABLED;
    if(is_external_chat) {
        // We need chatbar if chat is enabled or zia is present in any other portal, as ziabot rests over chatbar.
        is_chat_enabled = (sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_SDP_EXT_CHAT_ENABLED) || sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0;
    }
    if (PORTALID > 0 && is_chat_enabled && !window.externalframe) { //chat functionality not supported in externalframe
        if (jQuery("#sdp-chat-bar-container").length <= 0) {//No I18N

            /**ResourceLoader is used instead of loading the scripts in callback using sdpAjax to reduce loading time to fox the zia breakage issue occurring specially in slow networks */

            let file = (!is_external_chat && sdp_user.USERTYPE == "Technician") ? "/scripts/hbs-template-technician-chat.js" : "/scripts/hbs-template-requester.js";//No I18N
            let filesToLoad;
            let processMode = 'parallel'; // No I18N
            if(sdp_app.IS_DEVELOPMENT_MODE){
                processMode = 'series'; // No I18N
                filesToLoad = [`/scripts/chat/chat-load.js`,`/scripts/chat/chat-box.js`,`/scripts/chat/chat-actions.js`,`/scripts/chat/requester-chat.js`,`/scripts/chat/chat-common.js`];
            }else{
                filesToLoad = [`/scripts/hbs-template-common-chat.js`, file, `/scripts/sdp-chat.js`];
            }
            ResourceLoader({
                process: processMode,
                js: filesToLoad,
                success: function() {
                    jQuery("#sdp-chat-bar").chatbarfn({ // No I18N
                        usertype: sdp_user.USERTYPE,
                        username: sdp_user.USERNAME,
                        userid: sdp_user.LOGGEDIN_USERID
                    });
                    //The Requester Live chat option will be hidden when Zia Bot is enabled
                    if (!is_external_chat && sdp_user.USERTYPE == "Requester" && sdp_app.zia_info.IS_BOT_ENABLED) {
                        jQuery('#open-requester-chat').addClass('hide');
                    }
                    if (!is_external_chat) {
                        initializeTelephony();
                    }
                    if(is_external_chat && sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
                        jQuery("#open-requester-chat").closest(".chat-mini-header").hide();     // No I18N
                        ResourceLoader({
                            js: ["/scripts/initialize-zianotifications.js"], // No I18N
                            success: function(){ ziacallchat(); }
                        });
                    }
                }
            });
        }
    }else if(PORTALID > 0 && !is_chat_enabled && !window.externalframe && !is_external_chat){
        if(jQuery("#telephony_icon").length == 0){ //NO I18N
            initializeTelephony();
        }
    }
});