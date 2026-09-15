/* $Id $ */

/** >>>>>>>>> HELPERS DEFINITIONS <<<<<<<<< */

/*
  Common i18n handlebar/htmlbar helper defination.
  arg1: translate key [String]
  arg2: optional array [Array]

  Usage:
  {{i18n "<key>"}}
  {{i18n model.key}}
*/
function i18nHelper(argArray) {
    stringKey = argArray[0] || '';
    return translate(stringKey, argArray.splice(1));
}

/**
 * Usage:
 * Default Equal To: {{#if (compare lvalue rvalue)}}
 * Other Operations: {{#if (compare lvalue "<" rvalue)}}
 */
function compareHelper(argArray) {
    if (argArray.length < 3 && typeof Ember == "undefined") {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //NO I18N
    } else if (argArray.length < 2 && typeof Ember != "undefined") { //NO I18N
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //NO I18N
    }

    var operators, result, lvalue = argArray[0],
        operator = argArray[1],
        rvalue = argArray[2],
        options = argArray[3];
    operators = {
        '==': function(l, r) { return l == r; },
        '===': function(l, r) { return l === r; },
        '!=': function(l, r) { return l != r; },
        '!==': function(l, r) { return l !== r; },
        '<': function(l, r) { return l < r; },
        '>': function(l, r) { return l > r; },
        '<=': function(l, r) { return l <= r; },
        '>=': function(l, r) { return l >= r; },
        'typeof': function(l, r) { return typeof l == r; }, //NO I18N
        '||': function(l, r) { return l || r; },
        '&&': function(l, r) { return l && r; },
        '-': function(l, r) { return l - r; },
        '+': function(l, r) { return l + r; }
    };
    if (typeof operators[operator] == "undefined") {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' does not know the operator " + operator); //NO I18N
    }
    result = operators[operator](lvalue, rvalue);
    return result;
}

/**
 * Usage: {{math lvalue "+" rvalue}}
 */
function mathHelper(argArray) {
    if (argArray.length < 4 && typeof Ember == "undefined") {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //NO I18N
    } else if (argArray.length < 3 && typeof Ember != "undefined") { //NO I18N
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //NO I18N
    }

    var operators, result, lvalue = argArray[0],
        operator = argArray[1],
        rvalue = argArray[2],
        options = argArray[3];
    operators = {
        '+': function(l, r) { return l + r; },
        '-': function(l, r) { return l - r; },
        '*': function(l, r) { return l * r; },
        '/': function(l, r) { return l / r; },
        '%': function(l, r) { return l % r; },
        '^': function(l, r) { return l ^ r; },
    };
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'math' - Unrecognized operator '" + operator + "' is provided."); //NO I18N
    }
    result = operators[operator](lvalue, rvalue);
    return result;
}

/** 
 * Tranlate function used for handlebar helper as well as for string localization in javascript functions.
 * arg1: translate key [String]
 * arg2: optional array [Array]
 */
function translate(stringKey, args) {
    return getMessageForKey(stringKey, args);
}

function getMessageForKey(key, args) {
    var messageValue = null;
    try {
        //External Chat WorkAround - this need to be modified later
        if (typeof (is_external_chat) != 'undefined' && is_external_chat) {
            if (typeof (i18n_prop) != 'undefined' && i18n_prop != null) {
                messageValue = i18n_prop[key];
            }
            if (messageValue == null && base_prop != null) {
                messageValue = base_prop[key];
            }
        }
        //External Chat WorkAround - this need to be modified later

        // In some cases where the page is loaded in iframe for processing, the variables will not be available. This will lead to a base_prop is undefined error. This can be avaoided only when all the content are moved to the jslist.properties. So, for now adding a try{} catch{} for the same.
        messageValue = getI18nKeyValue(false, messageValue, key, args)
    } catch (ex) {}
    return messageValue;
}

/**
 * 
 * @param {boolea} skipDomValue Skip value getting from the dom node
 * @param {string} messageValue message value
 * @param {string} key i18n key
 * @param {args} args arguments
 * @returns 
 */
function getI18nKeyValue(skipDomValue, messageValue, key ,args){
    try {
        if (messageValue == null && parent["i18n_prop"] != null) {
            messageValue = parent.i18n_prop[key];
        }
        if (messageValue == null) {
            if (parent["base_prop"] != null) {
                messageValue = parent.base_prop[key];
            }
        }
        if (messageValue != null && args != null) {
            for (i = 0; i < args.length; i++) {
                var dynText = "{" + i + "}"; // No I18N
                messageValue = messageValue.replace(dynText, args[i]);
            }
        }

        /** if skipValueDom is true return the key value */
        if(!messageValue && skipDomValue){
            messageValue = key
        }

        if (messageValue == null) {
            var divObj = document.getElementById(key);
            if (divObj != null) {
                messageValue = divObj.innerHTML;
                if (args != undefined) {
                    for (i = 0; i < args.length; i++) {
                        dynText = "{" + i + "}"; // No I18N
                        messageValue = messageValue.replace(dynText, args[i]);
                    }
                }
            } else {
                messageValue = key;
            }
        }
    } catch (error) {}
    return messageValue;
}

/** Subheader: processes the logic to select the appropriate search module in the search options */
function selectGlobalSearch(module, current_tab, options) {
    var reqSearchMods = ["home", "dashboard", "reports", "cmdb"];   //No I18N
    if(module === current_tab || module === "global_search" && reqSearchMods.indexOf(current_tab) > -1) {
        return true;
    }
    return false;
}

/** Subheader: processes the logic to set the appropriate search box placeholder */
function globalSearchPlaceholder(current_tab, items, options) {
    var searchReqId = false;
    var isReqSelected = Handlebars.helpers.selectSearch("requests", current_tab);   //No I18N
    if(isReqSelected) {
        for(var i=0; i<items.length; i++) {
            if(items[i].id === "requests") {
                if(items[i].configuration === "requestid") {
                    var searchReqId = true;
                }
                break; 
            }
        }
    }
    if(searchReqId) {
        return translate("request.requestid.search") + "...";   //No I18N
    } else {
        return translate("common.search.title") + "...";    //No I18N
    }
}