/* $Id:$ */
// To load i18n js based on the user preferred language code.
// arg1: lang and country code [string]
function getI18NScript(lang, i18nInfo) {
	/* Define window.locale as an empty object to avoid script error when window.locale.translation is loaded. */
	window.locale = {};
	if (typeof lang == "undefined") {
		lang = sdp_user.LOCALE;
	}
	if (lang == 'default') {
		var browserLang = navigator.language || navigator.userLanguage;
		/* Navigator language is coded as en-US, en-IN */
		lang = browserLang.split('-')[0] === 'en' ? 'en_US' : browserLang;	//No I18n
	}
    window.zclocale = lang;
    var scriptUrl = '';
    scriptUrl += getScriptTag("/scripts/i18n/i18n.js");//No I18N
    if(lang !== "en_US") {
        scriptUrl += getScriptTag("/scripts/i18n/i18n_" + lang + ".js");   //No I18N
    }
    if (i18nInfo.esm_js) {
        scriptUrl += getScriptTag("/scripts/i18n/i18n_" + lang + "_" + i18nInfo.esm_mod + ".js");    //No I18N
    }
    if (i18nInfo.portal_js) {
        scriptUrl += getScriptTag("/scripts/i18n/i18n_" + lang + "_" + i18nInfo.esm_mod + "_" + i18nInfo.portal_id +".js");    //No I18N
    }
	return scriptUrl;
}

function includeEmberStyles(direction) {
	var default_styles = ["/ember/dist/assets/vendor.css","/components/codemirror/lib/codemirror.css","/components/codemirror/addon/hint/show-hint.css","/components/codemirror/addon/lint/lint.css","/ember/dist/assets/sdp.css","/style/joint.css","/style/joint-overwrite.css"]; // No I18N
	var dir_styles=[];
	if(direction == "LTR") {
		dir_styles = ["/style/jquery-ui-overwrite.css","/style/sdp-design.css","/style/sdp-ember-design-includes.css","/style/sdp-ember-style-new.css","/style/select2-styles.css","/style/old-classes.css","/style/cal_style.css","/style/error-style.css","/style/select-template.css","/style/base-font.css","/custom/style/custom_style.css", "/zohocomponents/css/zohocomponents.min.css","/style/dark-mode.css"]; // No I18N
        if(parent.sdp_app.IS_REBRAND) {
            dir_styles.push("/custom/style/rebrand.css"); //No I18N
        }
	} else {
		dir_styles = ["/style/jquery-ui-overwrite-rtl.css","/style/sdp-design-rtl.css","/style/sdp-ember-design-includes-rtl.css","/style/sdp-ember-style-new-rtl.css","/style/select2-styles-rtl.css","/style/old-classes-rtl.css","/style/cal_style_RTL.css","/style/error-style-rtl.css","/style/select-template-rtl.css","/style/base-font.css","/custom/style/custom_style_RTL.css", "/zohocomponents/css/zohocomponents-rtl.min.css","/style/dark-mode-rtl.css"]; // No I18N
	}
	if (parent.sdp_app.IS_MSPOrSCP == true) {
	if(parent.sdp_app.IS_MSP == true){
	  if(direction == "LTR") {
		dir_styles.push("/style/sdmspstyle.css");
	  } else {
		dir_styles.push("/style/sdmspstyle-rtl.css");
	  }
	}else if(parent.sdp_app.IS_SCP == true) {
	  if(direction == "LTR") {
		dir_styles.push("/style/scpstyle.css");
	  } else {
		dir_styles.push("/style/scpstyle-rtl.css");
	  }
	}
  }
	var styles = default_styles.concat(dir_styles);
    styles.push("/custom/style/style_template.css");

    	var uiTimestamp=parseInt(parent.sdp_app.CLIENT_CONF.ui.timestamp)||parent.sdp_app.BUILD_NUMBER;
    	if(parent.sdp_app.themes.IS_USER_THEME_ENABLED && parent.sdp_user.CLIENT_CONF && parent.sdp_user.CLIENT_CONF.userTheme && parent.sdp_user.CLIENT_CONF.userTheme.theme!='') {
            styles.push("/custom/style/user_styles_"+parent.sdp_user.CLIENT_CONF.userTheme.theme+".css");
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
            styles.push("/custom/style/user_styles"+portalId+".css?"+uiTimestamp);
        }
    styles.push("/custom/style/custom_font.css?"+uiTimestamp);
	var e_styles = "";
	for(var i=0; i<styles.length; i++){
		e_styles += getStyleTag(styles[i]);
	}
	document.writeln(e_styles);
}

function includeEmberScripts(i18nInfo) {
    var scripts = [
        "/ember/dist/assets/vendor.js", // NO I18N
        "/ember/dist/assets/sdp.js", // NO I18N
        "/zohocomponents/js/zohocomponents.min.js",// NO I18N
        "/scripts/sdp_global.js", // NO I18N
        "/scripts/notifications.js", // NO I18N
        "/scripts/sdp_components.js", // NO I18N
        "/scripts/hbs_template.js", // NO I18N
    "/scripts/servicedesk_ember.js", // NO I18N
        "/scripts/ember_common.js" //NO I18N

  ]; // No I18N

	if (parent.sdp_app.IS_MSP == true) {
		scripts[scripts.length] = "/scripts/msputils.js";
		scripts[scripts.length] = "/scripts/AGMultiBox.js";
		scripts[scripts.length] = "/scripts/hbs-template-mspcomponents.js";
	}
  	if (parent.sdp_app.IS_MSPOrSCP == true) {
		scripts[scripts.length] = "/scripts/MSPTaskForm.js";
		scripts[scripts.length] = "/scripts/msp_admin.js";
	}
  var e_scripts = "";
	e_scripts += getI18NScript(undefined, i18nInfo);
  for (var i = 0; i < scripts.length; i++) {
    e_scripts += getScriptTag(scripts[i]);
  }

  var zc_sdp_localemap = {'ar_AR':'ar-EG','ca_ES':'ca-ES','pt_BR':'pt-BR','bg_BG':'bg','zh_CN':'zh','hr_HR':'hr','cs_CZ':'cs','da_DA':'da','nl_NL':'nl','en_US':'en','fi_FI':'fi','fr_FR':'fr','de_DE':'de','el_GR':'el','iw_IW':'he-IL','hu_HU':'hu','it_IT':'it','ja_JP':'ja','ko_KO':'ko','lt_LT':'lt','pl_PL':'pl','pt_PT':'pt','ro_RO':'ro','ru_RU':'ru','sr_SR':'sr','es_ES':'es','sv_SE':'sv','th_TH':'th','zh_TW':'zh-TW','tr_TR':'tr','vi_VI':'vi'}; //No I18N
  // Languages bs_BA(Bosnian),ka_GE(Georgian),is_IS(Icelandic),mk_MK(Macedonian),no_NO(Norwegian),sl_SI(Slovene),cy_GB(Welsh) take en as default as they are not suppoted by Zcomponent.
  e_scripts += getScriptTag("/zohocomponents/locale/js/" + (zc_sdp_localemap[window.zclocale] || "en") + ".js"); //No I18N
  
  document.writeln(e_scripts);
}

/**
 * 
 * @param {string} path 
 * @returns hash value attached to the path if exists in cache-busting-hash.js else returns buildNumber
 */

function getHashPath(path) {
	var pathArray = path.split("/");
    var baseName = pathArray[pathArray.length - 1];
    var hashFile = cacheBustingHash[baseName] ? "hash="+cacheBustingHash[baseName] : "build="+sdp_app.BUILD_NUMBER; //No I18N
	return hashFile;
}

function getScriptTag(url) {
    var i18nKeyStr = "";// No I18N
	if (url.indexOf("i18n") !== -1 && sdp_app.I18nKey_Updated_Time) {
        i18nKeyStr = "&" + sdp_app.I18nKey_Updated_Time;// No I18N
    }
    return "<script nonce=\""+sdpNonce+"\" type='text/javascript' src='" + url + "?" + getHashPath(url) + i18nKeyStr + "'></script>"; // No I18N
}

function getStyleTag(url) {
	var r_style;
	if(url.indexOf('.less') != -1){
		r_style = "<link href='"+ url + "?" + getHashPath(url) +"' type='text/css' rel='stylesheet/less' />"; // No I18N
	}else{
        if(url.indexOf("?")==-1) {
          r_style = "<link href='"+ url + "?" + getHashPath(url) +"' type='text/css' rel='stylesheet' />"; // No I18N
        }
        else {
          r_style = "<link href='"+ url +"' type='text/css' rel='stylesheet' />"; // No I18N
        }
	}
	return r_style
}


