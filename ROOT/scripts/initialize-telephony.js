/* $Id$ */
function initializeTelephony() {
    const is_telephony_loaded = typeof (telephonic_data) != 'undefined'; //No I18N
    const is_zoho_telephony_default = sdp_app.IS_ZOHOTELEPHONY_ENABLED && sdp_app.TELEPHONY_SERVICE == "ZohoTelephony" ; //No I18N
    let load_telephony = false;
    //If ZohoTelephony is default , enable telephony for all techs
    if (is_zoho_telephony_default) {
        if(sdp_user.ZohoTelephony.isUserTechinIT && sdp_user.USERTYPE == "Technician" && sdp_app.isCTIEnabled && sdp_app.IS_TELEPHONY_ENABLED){
            load_telephony = true;
        }
    }
    // If default services are integrated , check if User has telephony enabled
    else if(sdp_app.IS_TELEPHONY_ENABLED){
        if (sdp_user.USERTYPE == "Technician" && sdp_app.IS_TELEPHONY_ENABLED){
            load_telephony = true;
        }        
    }
    if (sdp_app.IS_SDP && !is_telephony_loaded && load_telephony) {
        const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/Telephony.js"] : ["/scripts/telephony_min.js"] ; //NO I18N
        ResourceLoader({
            js: getScript,
            success: function () {
                if (sdp_user.USERTYPE == "Technician") {
                    let $template = jQuery(renderhbs(null,"telephony_history_popup_template",{},false,"admin",false,false,false,true)); //No I18N
                    if (!sdp_app.IS_CHAT_ENABLED) {
                        if (jQuery('body').find("#sdp-chat-bar").length == 0) {
                        jQuery('body').append('<div class="chat-bar chat-bar1 chat-zia1" id="sdp-chat-bar"><div class="chatrow"></div></div>');
                        }
                    }
                    //check if Zia is loaded , if yes load telephony_icon before Zia
                    const zia_icon = jQuery(".chatrow").find("#zia-chat-bot-btn");
                    if(zia_icon.length > 0){
                        zia_icon.after($template);

                    }else{
                        jQuery(".chatrow").append($template);
                    }
                    jQuery("#telephony_icon").off('click').on('click', function () { //No i18N
                        telephony_history.ShowCallLogPreview(this);
                    });

                    /** Load scripts necessary for ZohoTelephony */ 
                    if (sdp_app.TELEPHONY_SERVICE == "ZohoTelephony") {
                        zoho_telephony.initpage();
                    }
                }

                if (is_call_active) {
                    var fetchCallDetails = "/TelephonyDef.do?action=fetchActiveCall"; //NO I18N
                    sdpAjax(fetchCallDetails).done(function (response) {
                        processTelephonyNotification(JSON.parse(response));
                    });
                }
            }
            });
    }
}