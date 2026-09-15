/* $Id$ */

/**
 * Define window.locale as an empty object to avoid script error when window.locale.translation is loaded.
 */
window.locale = {};

var External_Chat_Store = {
	/**
	 * Test the browser have localstoarge or not.
	 */
	hasLocalStorage : typeof localStorage !== "undefined", //No I18N
	/**
	 * Delete Cookie
	 * @param key{string} Name for delete cookie
	 */
	removeCookie : function (key) {
		return (document.cookie = key + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;");
	}
};

function openLogOutWindow(){
	var sdpLoginUrl = getLogOutURL(ssoStatusVal);
	window.open(sdpLoginUrl,'','width=800,height=600,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=0,left=0,top=0');
	return false;
}

function getLogOutURL (ssostatus){
    var logOutURL ="";
    External_Chat_Store.removeCookie("singlesignon"); // No I18N
    External_Chat_Store.removeCookie("username"); // No I18N
    External_Chat_Store.removeCookie("password"); // No I18N
    External_Chat_Store.removeCookie('techStatus'); // No I18N
    if(ssostatus){
        logOutURL="/jsp/Logout.jsp?ssostatus=true&is_from_external_chat=true&origin="+external_chat_origin; // No I18N
    }
    else{
        logOutURL="/jsp/Logout.jsp?is_from_external_chat=true&origin="+external_chat_origin;; // No I18N
    }
    return logOutURL;
}

function minimizeChatbar(){
	window.top.postMessage(sdpToJSON({"type" : "minimizeContent"}),external_chat_origin); // No I18N
}

function setContentWithMessage(message,isInfo){
    var actionLink = "";
    if(isInfo){
        actionLink = '<p style="font-weight:normal;text-decoration:none;color:#1a6ebd;margin-top:20px;margin-bottom:10px;font-size: 13px;font-family: Verdana;display: inline-block;cursor: default">'+encodeHTML(message)+'</p>'
    }else{
        actionLink = '<a data-name="extChatLogout" style="font-weight:normal;text-decoration:none;color:#1a6ebd;margin-top:20px;margin-bottom:10px;font-size: 13px;font-family: Verdana;display: inline-block;cursor:pointer">'+encodeHTML(message)+'</a>'
    }
    /**
     * Need to show directly and set the size with a small delay as it is postmessage
     */
    setTimeout(function() {
        jQuery("body").html('<div id="sdpExtChatDiv" style="position: fixed;bottom: 0;right: 0;top: 0;border: 1px solid #ccc;"><div style="position:absolute;top:0px;width: 100%;height: 40px;background-color: #F4F4F9;z-index: 99;box-shadow: 0px 2px 1px #ccc;text-align:right;"><a data-name="minimizeExtChat" title="'+encodeHTMLAttribute(sdp_app.minimize_mesg)+'" style="margin-right:15px;display:inline-block;font-size: 30px;color: #777;text-decoration:none">-</a></div><div style="background-color: #ffffff; position: relative !important;text-align: center;padding: 0px 20px;padding-top: 40px;">'+actionLink+'</div></div>');
        jQuery("#sdpExtChatDiv").find("[data-name=extChatLogout]").off("click.extChat").on("click.extChat",function(){// No I18N
        openLogOutWindow();
    });
    jQuery("#sdpExtChatDiv").find("[data-name=minimizeExtChat]").off("click.extChat").on("click.extChat",function(){// No I18N
        minimizeChatbar();
    });
    },  1000);
    window.top.postMessage(sdpToJSON({"type" : "setExternalIframe","height":"150px", "width":"250px"}),external_chat_origin);// No I18N
}

function reloadIframe(portalId) {
	window.top.postMessage(sdpToJSON({"type" : "change_portal","portal_id":portalId}), external_chat_origin);   // No I18N
}

function loadExternalchat(sdp_app, sdp_user, is_initial_load) {
    if(sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
        if(is_initial_load && !sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE && !sdp_app.zia_info.EMBED_ZIA_ENABLED) {
            reloadIframe(sdp_app.zia_info.EMBED_ZIA_PORTALS[0]);
            return;
        }
    } else {
        if (sdp_user.USERTYPE !== 'Requester') {    // No I18N
            // SD-121203: Known issue when external live chat is disabled.
            setContentWithMessage(getMessageForKey("chat.ext.login.requester"), false);
            // SD-121182: Popup is not closed in certain scenario.
            if(!window.location.href.includes("is_from_external_chat_login=true")) {
                var popupUrl = "/externalCommFrame.do?origin=" + external_chat_origin + "&is_from_external_chat_login=true&is_from_external_chat=true"      // No I18N
                window.history.pushState(null, null, popupUrl);
            }
        } else if (!(sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_SDP_EXT_CHAT_ENABLED)) {
            setContentWithMessage(getMessageForKey("chat.ext.chat.warning"),true);
        } else if (!sdp_app.IS_CHAT_ENABLED_FOR_USER) {
            setContentWithMessage(getMessageForKey("api.chat.disabled.message"),true);
        }
    }

    const sendData = {
        sdp_app : sdp_app,
        sdp_user : sdp_user,
        is_initial_load: is_initial_load
    };
    const sndD =  sdpToJSON(sendData) ;
    // To prevent live chat from opening when Zia is already opened.
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD && sdp_user.USERTYPE === 'Requester' && !is_initial_load && !sdp_app.zia_info.EMBED_ZIA_ENABLED) {
        setTimeout(function() {
            jQuery("#open-requester-chat").trigger("click");
        },  1000);
    }
    window.top.postMessage(sdpToJSON({"type" : "is_sdp_logged_in", "message" : sndD, "navigation_type" :performance.navigation.type}), external_chat_origin); //No I18N
}
