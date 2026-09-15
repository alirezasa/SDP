/* $Id$ */

_editor_url = "./"; // No I18N
_editor_lang = "en"; // No I18N
var agt = navigator.userAgent.toLowerCase();
var is_ie = ((agt.indexOf("msie") > 0) || !!navigator.userAgent.match(/Trident.*rv\:11\./)); // No I18N
var is_opera  = (agt.indexOf("opera") != -1); // No I18N
var is_mac	   = (agt.indexOf("mac") != -1); // No I18N
var is_mac_ie = (is_ie && is_mac);
var is_win_ie = (is_ie && !is_mac);
var is_gecko  = (navigator.product == "Gecko"); // No I18N


var buildNumber = '15140'; // No I18N

/**
 * 
 * @param {string} path 
 * @returns hash value attached to the path if exists in cache-busting-hash.js else returns buildNumber
 */

function getHashPath(path) {
	var pathArray = path.split("/");
    var baseName = pathArray[pathArray.length - 1];
    var hashFile = cacheBustingHash[baseName] ? "hash="+cacheBustingHash[baseName] : "build="+buildNumber; //No I18N
	return hashFile;
}

/**
 * Will return the script code that needs to be written in the document. The buildnumber will be added as a parameter to avoid caching.
 */
function getJsInc(path) {
	var i18nKeyStr = "";// No I18N
	if (path.indexOf("i18n") !== -1 && parent.sdp_app.I18nKey_Updated_Time) {
		i18nKeyStr = "&" + parent.sdp_app.I18nKey_Updated_Time;// No I18N
	}
	var hashPath = getHashPath(path);
    return "<script  nonce='"+sdpNonce+"' src='" + path + "?" + hashPath + i18nKeyStr + "' type='text/javascript'></script>"; // No I18N
}

/**
 * Will return the css code that needs to be written in the document. The buildnumber will be added as a parameter to avoid caching.
 */
function getCssInc(path) {
	var hashPath = getHashPath(path);
	return "<link type='text/css' rel='stylesheet' href='" + path + "?" + hashPath + "'>"; // No I18N
}
/**
 * Will return the less code that needs to be written in the document. The buildnumber will be added as a parameter to avoid caching.
 */
function getLessInc(path) {
	return "<link type='text/css' rel='stylesheet/less' href='" + path + "?" + buildNumber + "'>"; // No I18N
}

/**
 * Will load the files that are required for progressive rendering.
 *
 * @contextPath	indicates the contextPath of the current application
 * @htmlArea	indicates whether scripts related to HTMLArea should be added or not
 */
function includeSDPScripts(contextPath, htmlArea, number, locale, i18nInfo) {
	if(locale != null ) {
		_editor_lang=locale.toLowerCase();
	}
	var scriptsToInclude = "";
	// Common
	if(number != null ) {
		buildNumber = number;
	}
	if(fromIframe == null) {
		fromIframe = "false"; // No I18N
	}
	/** JS files are not getting loaded while invoking multiple catalog widget at the same time in the ssp page that's why we have Included this code
     * include_js_css is a counter variable. When multiple catalog widget is loaded, this variable is incremented accordingly and decremented after catalog is loaded.
     * When more than one catalog widget is present, its value can be greater than 1. After all catalogs are loaded, its value will be zero.
    **/
	if(parent.include_js_css > 0){
		parent.JS_INCLUDED = undefined;
	}
	if(parent["JS_INCLUDED"] != null && fromIframe =='false') {
		return;
	}

	scriptsToInclude += getJsInc("/scripts/i18n/i18n.js");//No I18N
	if(locale !== "en_US") {
		scriptsToInclude += getJsInc("/scripts/i18n/i18n_" + locale + ".js");   //No I18N
	}
	if (i18nInfo.esm_js) {
		scriptsToInclude += getJsInc("/scripts/i18n/i18n_" + locale + "_" + i18nInfo.esm_mod + ".js");    //No I18N
	}
	if (i18nInfo.portal_js) {
		scriptsToInclude += getJsInc("/scripts/i18n/i18n_" + locale + "_" + i18nInfo.esm_mod + "_" + i18nInfo.portal_id +".js");    //No I18N
	}

	// Module Specific Scripts
	/**
	 * Since Effects.js is a mickey file, we cannot add this file to thirdparty.js. Because we have moved this file to the client repo. So, we will load it here.
	 */
	scriptsToInclude += getJsInc("/components/javascript/Effects.js"); // No I18N
	scriptsToInclude += getJsInc("/scripts/thirdparty.js"); // No I18N
	scriptsToInclude += getJsInc("/zohocomponents/js/zohocomponents.min.js");//No I18N
	scriptsToInclude += getJsInc("/scripts/sdp_global.js"); // No I18N
    scriptsToInclude += getJsInc("/scripts/sdp_components.js");//No I18N
	scriptsToInclude += getJsInc("/scripts/hbs_template.js");//No I18N
	scriptsToInclude += getJsInc("/scripts/ae-sdp.js"); // No I18N
    scriptsToInclude += getJsInc("/scripts/servicedesk.js"); // No I18N
	scriptsToInclude += getJsInc("/scripts/sdp-requests.js"); // No I18N

    var path = window.location.pathname;

    if(path && !(path == "/ui/software/office365" || path=="/DashBoard.do" || path=="/CustomReportHandler.do" || (path=="/WorkOrder.do" && window.location.search.includes('woMode=viewAssessmentHistory')) || path=="/workorder/WOPrintPreview.jsp" || (path=="/SetUpWizard.do" && (window.location.search.includes("?forwardTo=surveyconfig") || window.location.search.includes("?forwardTo=surveyreports"))) || (path.indexOf("/ui/ssp") == 0) || path=="/SoftwareHome.do" || path == "/ui/api_documentation" || (path.indexOf("/ui/asset") == 0))) {
		scriptsToInclude += getJsInc("/scripts/prototype_component.js");//No I18N
	}
	/*
	 * The below code was given by Jeganathan.s during Mickey2Lite migration after the team found an issue with AjaxAPI.navigframename getting reset as null.
	 * This is because MC_JS_INCLUDED is set as false, so framework.js and components.js are getting reloaded, which resets the value set AJAXAPI.navigframename
	 */
	if(typeof parent.MC_JS_INCLUDED==="undefined" || parent.MC_JS_INCLUDED===null && parent.MC_JS_INCLUDED==="false") {
		scriptsToInclude += getJsInc("/framework/javascript/framework.js"); // No I18N
		scriptsToInclude += getJsInc("/components/javascript/components.js"); // No I18N
	}
	/**
	 * If we compress this file in "ae-sdp.js", issues occurs in column chooser.
	 * Because, Method in "components.js" file overrides method "SDPColumnChooser.js".
	 * So, we have loaded this file under "components.js".
	 */
	scriptsToInclude += getJsInc("/scripts/SDPColumnChooser.js"); // No I18N
	scriptsToInclude += getJsInc("/scripts/custom_widget.min.js"); // No I18N
	var zc_sdp_localemap = {'ar_AR':'ar-EG','ca_ES':'ca-ES','pt_BR':'pt-BR','bg_BG':'bg','zh_CN':'zh','hr_HR':'hr','cs_CZ':'cs','da_DA':'da','nl_NL':'nl','en_US':'en','fi_FI':'fi','fr_FR':'fr','de_DE':'de','el_GR':'el','iw_IW':'he-IL','hu_HU':'hu','it_IT':'it','ja_JP':'ja','ko_KO':'ko','lt_LT':'lt','pl_PL':'pl','pt_PT':'pt','ro_RO':'ro','ru_RU':'ru','sr_SR':'sr','es_ES':'es','sv_SE':'sv','th_TH':'th','zh_TW':'zh-TW','tr_TR':'tr','vi_VI':'vi'}; // No I18N
	// Languages Bosnian,Georgian,Icelandic,Macedonian,Norwegian,Slovene,Welsh take en as default as they are not suppoted by Zcomponent.
	scriptsToInclude += getJsInc("/zohocomponents/locale/js/" + (zc_sdp_localemap[locale] || "en") + ".js");

	if(parent.sdp_app.IS_MSPOrSCP) { // method written for appending MSP/SCP Scripts to load
        scriptsToInclude += getMSPSCPScripts();
    }

	document.writeln(scriptsToInclude);
	parent["JS_INCLUDED"] = "true"; // No I18N
	parent.MC_JS_INCLUDED = "true"; // No I18N
	fromIframe =='false'; // No I18N
}

/**
 * This is an include script which will load all the necessary css files for SDP
 * to run successfully.
 */
function includeSDPStyle(contextPath, locale, buildNum, direction) {

	// Common
	if(buildNum != null ) {
		buildNumber = buildNum;
	}


    if(locale != null ) {
        _editor_lang=locale.toLowerCase();
    }
    var cssToInclude = "<link rel='SHORTCUT ICON' href='/favicon.ico?"+buildNumber+"'/>"; // No I18N
    if(fromIframe == null) {
        fromIframe = "false"; // No I18N
    }
    /** CSS files are not getting loaded while invoking multiple catalog widget at the same time in the ssp page that's why we have Included this code
    * include_js_css is a counter variable. When multiple catalog widget is loaded, this variable is incremented accordingly and decremented after catalog is loaded.
     * When more than one catalog widget is present, its value can be greater than 1. After all catalogs are loaded, its value will be zero.
    **/
	if(parent.include_js_css > 0){
		parent.CSS_INCLUDED = undefined;
	}
	if(parent["CSS_INCLUDED"] != null && fromIframe =='false') {
		return;
	}

	cssToInclude += getCssInc("/style/jquery-ui.min.css");// No I18N

   var path = window.location.pathname;
   if(direction == "RTL"  && path && path != "/ui/api_documentation") {

		// OLD UI Files
		cssToInclude += getCssInc("/style/style_rtl.css"); // No I18N

		// COMMON Files
		cssToInclude += getCssInc("/style/jquery-ui-overwrite-rtl.css");// No I18N

		// NEW UI Files
		cssToInclude += getCssInc("/style/sdp-design-rtl.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-design-includes-rtl.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-style-new-rtl.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-style-new-ext-rtl.css");// No I18N

		// COMMON Files
		cssToInclude += getCssInc("/style/select2.css"); // No I18N
		cssToInclude += getCssInc("/style/select2-overwrite-rtl.css"); // No I18N
		cssToInclude += getCssInc("/style/select2-bootstrap.css"); // No I18N

		cssToInclude += getCssInc("/style/base-font.css"); // No I18N

		cssToInclude += getCssInc("/custom/style/custom_style_RTL.css"); // No I18N
		cssToInclude += getCssInc("/style/kanban_RTL.css"); // No I18N
		cssToInclude += getCssInc("/style/ui-fix_RTL.css"); // No I18N

		cssToInclude += getCssInc("/zohocomponents/css/zohocomponents-rtl.min.css"); // No I18N
		cssToInclude += getCssInc("/style/dark-mode-rtl.css"); // No I18N
	}
	else{

		// OLD UI Files
		cssToInclude += getCssInc("/style/style.css"); // No I18N

		// COMMON Files
		cssToInclude += getCssInc("/style/jquery-ui-overwrite.css");// No I18N

		// NEW UI Files
		cssToInclude += getCssInc("/style/sdp-design.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-design-includes.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-style-new.css");// No I18N
		cssToInclude += getCssInc("/style/sdp-style-new-ext.css");// No I18N

		// COMMON Files
		cssToInclude += getCssInc("/style/select2.css"); // No I18N
		cssToInclude += getCssInc("/style/select2-overwrite.css"); // No I18N
		cssToInclude += getCssInc("/style/select2-bootstrap.css"); // No I18N

		cssToInclude += getCssInc("/style/base-font.css"); // No I18N

		cssToInclude += getCssInc("/custom/style/custom_style.css"); // No I18N
		if(parent.sdp_app.IS_REBRAND) {
			cssToInclude += getCssInc("/custom/style/rebrand.css"); // No I18N
		}
		cssToInclude += getCssInc("/style/kanban.css"); // No I18N
		
		if(path && path != "/ui/api_documentation"){
			cssToInclude += getCssInc("/style/ui-fix.css"); // No I18N
		}

		cssToInclude += getCssInc("/zohocomponents/css/zohocomponents.min.css"); // No I18N
		cssToInclude += getCssInc("/style/dark-mode.css"); // No I18N
	}
	cssToInclude += getCssInc("/custom/style/style_template.css"); // No I18N
	// Including the user modified style
	var uiTimestamp=parseInt(parent.sdp_app.CLIENT_CONF.ui.timestamp)||parent.sdp_app.BUILD_NUMBER;
	if(parent.sdp_app.themes.IS_USER_THEME_ENABLED && parent.sdp_user.CLIENT_CONF && parent.sdp_user.CLIENT_CONF.userTheme && parent.sdp_user.CLIENT_CONF.userTheme.theme!='') {
		cssToInclude += getCssInc("/custom/style/user_styles_"+parent.sdp_user.CLIENT_CONF.userTheme.theme+".css"); // No I18N
	}
	else {
		var portalId = '';
		if(parent.sdp_app.IS_MDH_SETUP) {
			if(parent.sdp_app.PORTAL_ID<0) { //ESM Directory
				portalId = '_Blue'; //No I18N
			}
			else if(parent.sdp_app.PORTAL_ID!=1) {
				portalId = '_'+parent.sdp_app.PORTAL_ID;
			}
		}
		var defaultThemes = ["Blue", "Green", "Violet", "Red"]; //No I18N
		if(defaultThemes.indexOf(parent.sdp_app.themes.TYPE)!=-1) {
			portalId = '_'+parent.sdp_app.themes.TYPE;
		}
			if(parent.sdp_app.IS_MSP&&parent.sdp_app.PORTAL_ID>0){
                var accId = "0";
                if(parent.sdp_user.USERTYPE=="Technician"){
                    accId = $tabAccount.get() == null ? "0" : $tabAccount.get();
                }else if(document.cookie.indexOf("; cli=") > -1){
                    accId = document.cookie.split("; cli=").pop().split(";").shift();
                }
                if(accId!="0" && parent.sdp_app.AccountBasedthemes.hasOwnProperty(accId)){
                    portalId="__"+accId;
                }
			}
		var userStyleCss = "<link type='text/css' rel='stylesheet' href='/custom/style/user_styles"+portalId+".css?"+uiTimestamp+"'>"; // No I18N
		cssToInclude += userStyleCss;
	}
	var fontStyleCss = "<link type='text/css' rel='stylesheet' href='/custom/style/custom_font.css?"+uiTimestamp+"'>"; // No I18N
        cssToInclude += fontStyleCss;
	document.writeln(cssToInclude);
	parent["CSS_INCLUDED"] = "true"; // No I18N
	fromIframe =='false'; // No I18N
}

/**
 * Will load the js files that are not needed for progressive rendering.
 *
 * @contextPath	indicates the contextPath of the current application.
 */
function includeScripts(contextPath) {
	var scriptsToInclude = "";
	if(fromIframe == null) {
		fromIframe = "false"; // No I18N
	}
	if(parent["JS_END_INCLUDED"] != null && fromIframe =='false') {
		return;
	}
	document.writeln(scriptsToInclude);
	parent["JS_END_INCLUDED"] = "true"; // No I18N
	fromIframe =='false'; // No I18N
}

// method written for appending MSP/SCP Scripts to load
function getMSPSCPScripts() {
    var scriptsToInclude = '';
    scriptsToInclude += getJsInc("/scripts/MSPWOForm.js");  //No I18N
    scriptsToInclude += getJsInc("/scripts/msp-requests.js");  //No I18N
    scriptsToInclude += getJsInc("/scripts/MSPworklogForm.js");  //No I18N
	scriptsToInclude += getJsInc("/scripts/msp-announcements.js");  //No I18N
	scriptsToInclude += getJsInc("/scripts/msp_admin.js");  //No I18N
    if (parent.sdp_app.IS_SCP){
        scriptsToInclude += getJsInc("/scripts/SCPWOForm.js");  //No I18N
    }
    else{
        scriptsToInclude += getJsInc("/scripts/AGMultiBox.js");  //No I18N
        scriptsToInclude += getJsInc("/scripts/hbs-template-mspcomponents.js");  //No I18N
    }
    scriptsToInclude += getJsInc("/scripts/MSPTaskForm.js");  //No I18N
    return scriptsToInclude;
}
