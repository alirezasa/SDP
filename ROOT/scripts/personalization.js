/* $Id$ */
function getPersonalizeData(key, options={}) { /*To GET Personalization*/
    let is_portalspecific = options.is_portalspecific;
    let getFromCache = options.ignoreCache==undefined || options.ignoreCache==false;
    if(getFromCache && typeof sdp_user == 'object' && typeof sdp_user.CLIENT_CONF == 'object') {
        if(sdp_user.CLIENT_CONF[key]) {
            if(typeof sdp_user.CLIENT_CONF[key]=='string') {
                try {
                    return JSON.parse(sdp_user.CLIENT_CONF[key]); 
                } catch(e) {}
            }
            return JSON.parse(sdpToJSON(sdp_user.CLIENT_CONF[key]));
        }
        else {
            return {};
        }
    }
    
    var inputObject = {};
    var personalize = {};
    personalize.key = key;

    personalize.is_portalspecific = "true";
    if (is_portalspecific != undefined) {
        personalize.is_portalspecific = is_portalspecific;
    }
    /** Check for Ember in esm page and ESM directory page personalization check*/
    else if (location.pathname === "/ESM.do" || (parent && parent.sdp_app && parent.sdp_app.IS_ESMDIR)) {
        personalize.is_portalspecific = "false";
    }

    inputObject.personalization = personalize;
    var dataVal = sdpAjaxInputData(inputObject);
    var output = {};
    sdpAjax({
        url: '/api/v3/personalizations?' + dataVal, // No I18N
        ignorefailuremessage: true,
        success: function (res) {
            if (res.response_status.status === 'success') {
                try {
                    output = JSON.parse(res.personalization.data);
                } catch (e) {
                    output = res.personalization.data;
                }
            }
        },
        async: false
    });
    return output;
}

function addPersonalization(key, input, is_userbased, options) { //To ADD personalization
    var inputObject = {}, personalize = {}, async = options && options.async ? !!options.async : false;
    personalize.key = key.replace(/\./g, '_');
    personalize.is_userbased = (is_userbased != undefined) ? is_userbased : "true";

    // Portal Specific Code personalization 
    personalize.is_portalspecific = "true";
    if (options != undefined && options.is_portalspecific != undefined) {
        personalize.is_portalspecific = options.is_portalspecific;
    }
    /** Check for Ember in esm page and ESM directory page personalization check*/
    else if (location.pathname === "/ESM.do" || (parent && parent.sdp_app && parent.sdp_app.IS_ESMDIR)) {
        personalize.is_portalspecific = "false";
    }
    // Portal Specific Code personalization

    personalize.data = sdpToJSON(input);
    inputObject.personalization = personalize;
    var dataVal = sdpAjaxInputData(inputObject);
    var isSuccess = false;
    sdpAjax({
        url: '/api/v3/personalizations', // No I18N
        type: 'POST', // No I18N
        data: dataVal,
        async: async,
        success: function (data) {
            sdp_user.CLIENT_CONF[key] = JSON.parse(data.personalization.data);

            //Updating this personalization in other tabs
            var message = {
              module: 'UserPersonalization', //NO I18N
              key: key,
              data: sdp_user.CLIENT_CONF[key]
            };
            if("channel" in window) {
                channel.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON(message) : JSON.stringify(message)); //NO I18N
            }

            if (options && typeof options.successCallback === "function") {
                options.successCallback(data);
            }
            if (data.response_status.status === 'success') {
                isSuccess = true;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (options && typeof options.errorCallback === "function") {
                options.errorCallback(jqXHR, textStatus, errorThrown);
            }
        }

    });
    return isSuccess;
}

var ClientUtil = {
    addUserPersonalization: function(key, input, options={}) {
        const internalKey = options.internalKey ? options.internalKey : key;
        let portalStatus = ClientUtil.getCurrentPortalStatus();
        if(portalStatus === "Retired" || portalStatus === "License expired") {
            sdp_user.CLIENT_CONF[internalKey] = input;
            return Promise.resolve(input);
        }

        let inputObject = {
            user_personalize: {
                key: internalKey,
                data: input
            }
        };
        return new Promise((resolve, reject) => {
            sdpAjax({
                url: '/api/v3/user_personalize/'+key, // No I18N
                type: 'POST', // No I18N
                data: sdpAjaxInputData(inputObject),
                success: function (data) {
                    sdp_user.CLIENT_CONF[internalKey] = JSON.parse(data.user_personalize.data);
                    resolve(sdp_user.CLIENT_CONF[internalKey]);

                    //Updating this personalization in other tabs
                    var message = {
                      module: 'UserPersonalization', //NO I18N
                      key: internalKey,
                      data: sdp_user.CLIENT_CONF[internalKey]
                    };
                    if("channel" in window) {
                        channel.postMessage((typeof sdpToJSON != 'undefined') ? sdpToJSON(message) : JSON.stringify(message)); //NO I18N
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(jqXHR, textStatus, errorThrown);
                }
            });
        });
    },

    getUserPersonalization: function(key, options={}) { /*To GET Personalization*/
        let getFromCache = options.ignoreCache==undefined || options.ignoreCache==false;
        if(getFromCache && typeof sdp_user == 'object' && typeof sdp_user.CLIENT_CONF == 'object') {
            if(sdp_user.CLIENT_CONF[key]) {
                if(typeof sdp_user.CLIENT_CONF[key]=='string') {
                    try {
                        return JSON.parse(sdp_user.CLIENT_CONF[key]); 
                    } catch(e) {}
                }
                return JSON.parse(sdpToJSON(sdp_user.CLIENT_CONF[key]));
            }
            else {
                return {};
            }
        }
        
        var output = {};
        sdpAjax({
            url:   `/api/v3/user_personalize/${key}`, // No I18N
            ignorefailuremessage: true,
            success: function (res) {
                if (res.response_status.status === 'success') {
                    try {
                        output = JSON.parse(res.user_personalize.data);
                    } catch (e) {
                        output = res.user_personalize.data;
                    }
                }
            },
            async: false
        });
        return output;
    },

    deleteUserPersonalization: function(key) {
        return new Promise((resolve, reject) => {
            sdpAjax({
                url: '/api/v3/user_personalize/'+key, // No I18N
                type: 'DELETE', // No I18N
                success: function (data) {
                    delete sdp_user.CLIENT_CONF[key];
                    resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    reject(jqXHR, textStatus, errorThrown);
                }
            });
        });
    },

    getCurrentPortalStatus: function() {
        let hasCurrentPortalDetails = window.hasOwnProperty("esm_details") && window.esm_details.hasOwnProperty("current_portal");
        let status = hasCurrentPortalDetails && window.esm_details.current_portal.status_name; //No I18N
        if(!hasCurrentPortalDetails) {
            let portals = loadAccessPortals().accessibleportal;
            let currentPortal = portals.filter(function(portal) { return portal.id == sdp_app.PORTAL_ID });
            status = currentPortal[0] && currentPortal[0].status || "-";
        }
        return status;
    }
};

/**
 * Adds/Updates the Global Personalization data (Admin operation)
 * For updating the personalization,
 * the id to save the personalization is necessary,
 * which will be automatically fetched only if the get personalization for the given key is already done in the page
 */
function setGlobalPersonalization(content) {
    if (!content || jQuery.isEmptyObject(content)) {
        return false;
    }
    var key = content.key;
    var data = content.data;
    var async = content.async;
    var successFunc = content.success;
    var errorFunc = content.error;
    if (!key || !data) {
        return false;
    }
    key = key.replace(/\./g, '-');  //No I18N
    var input_data = {
        "global_personalization": {   //No I18N
            "key": key, //No I18N
            "data": window.sdpToJSON(data)  //No I18N
        }
    };

    var id = null;
    if (window.global_personalization && window.global_personalization[key]) {
        id = window.global_personalization[key];
    }
    var url = id ? "/api/v3/global_personalization/" + id : "/api/v3/global_personalization";   //No I18N
    var type = id ? "PUT" : "POST"; //No I18N
    var async = async == false ? false : true;

    input_data = sdpAjaxInputData(input_data);
    return sdpAjax({
        url: url,
        type: type,
        data: input_data,
        ignorefailuremessage: true,
        async: async,
        success: function (data) {
            try {
                if (data && data.response_status && data.response_status.status === "success" && data.global_personalization) {
                    if (!window.global_personalization) {
                        window.global_personalization = {};
                    }
                    window.global_personalization[key] = data.global_personalization.id;
                    if (typeof successFunc === "function") {
                        successFunc();
                    }
                } else {
                    if (typeof errorFunc === "function") {
                        errorFunc();
                    }
                }
            } catch (exception) {
                if (typeof errorFunc === "function") {
                    errorFunc();
                }
                console.error(exception);
            }
        },
        error: function () {
            if (typeof errorFunc === "function") {
                errorFunc();
            }
        }
    });
}


/**
 * Gets the Global Personalization data (for all users)
 */
function getGlobalPersonalization(key) {
    if (!key) {
        return;
    }
    key = key.replace(/\./g, '-');
    //added for MSP
    if(sdp_app.IS_MSP && key=="theme_settings"){
        var accID="0";
        if(document.getElementById('persAccId')!=null){
            accID=document.getElementById('persAccId').value;
        }
        if(accID != 0){
            key+="__"+accID;
        }
    }
    var input_data = {
        "list_info": {  //No I18N
            "search_criteria":{"field":"key","value": key,"condition":"is","logical_operator":"and"} //No I18N
        }
    };
    input_data = sdpAjaxInputData(input_data);
    var pers_data = null;
    sdpAjax({
        url: "/api/v3/global_personalization",    //No I18N
        type: "GET",    //No I18N
        data: input_data,
        ignorefailuremessage: true,
        cache: false,
        async: false,
        success: function (data) {
            try {
                if (data && data.response_status && data.response_status.status === "success" && !jQuery.isEmptyObject(data.global_personalization)) {
                    pers_data = data.global_personalization;
                }
            } catch (exception) {
                console.error(exception);
            }
        }
    });
    if (!pers_data) {
        return null;
    }
    if (!window.global_personalization) {
        window.global_personalization = {};
    }
    window.global_personalization[key] = pers_data.id;
    return JSON.parse(pers_data.data);
}
