
/* $Id $ */

//$Id$
/*
  startIndex - offset value to fetch notification messages, starts with 1
  dataFetch - variable to stop send request to server when no more notification messages
  scrollAdded - variable to initialize scroll event not more than once
  rangeArray - array of startIndexTS values to avoid duplicate ajax request. Duplicate request only in IE.
*/
if(window.forwardfrom == undefined) {
  window.forwardfrom = '';
}

function loadCmdbMigrationFiles() {
  return new Promise((resolve) => {
  ResourceLoader({
      js: ["/scripts/cmdb-migration.js"],//No I18N
      success: resolve
    });
  });
}

async function showCMDBMigration(isModel) {
  await loadCmdbMigrationFiles();
  CMDBMigration.init(isModel === false ? false : true);
}

showCMDBMigration.init = async function(cmdbPostMigration) {
    await loadCmdbMigrationFiles();
    CMDBMigration.renderOnPageVisit(Object.keys(cmdbPostMigration).length ? cmdbPostMigration : undefined);
};



function redirectToV1APIFormPost(){
  window.open("/", "_blank","noopener"); //No I18N
}

var browser_agt = navigator.userAgent.toLowerCase();
var IS_IE = ((browser_agt.indexOf("msie") > 0) || (browser_agt.toLowerCase().indexOf("trident") > 0) || (browser_agt.toLowerCase().indexOf("edge") > 0)); // No I18N

startIndexTS=1;
dataFetch = true;
scrollAdded = false;
var rangeArray = [];
var notificationsArray=[];
var template_settings;
var is_service_catalog_enabled;
var s_b_id;
var jD = jQuery(document);
var subh_icon_collapsed = false;
var last_hdn_tab_width = 0;
var resizeTimeout;
var is_new_chats_exists = false;
var is_external_chat = false;
var external_chat_origin = null;
var is_chathgt = 32;
var is_chat_enabled = parent.sdp_app.IS_SDP_CHAT_ENABLED;
var can_show_zia_icon = parent.sdp_app.zia_info.CAN_SHOW_ICON;
var is_call_active = false;

if(is_chat_enabled && parent.sdp_user.USERTYPE == "Requester"){
  is_chat_enabled = parent.sdp_app.IS_CHAT_ENABLED_FOR_USER;
}
var notificationsCount = 0, browserTitleText = "";
/*
 * Function to redirect page when switch portal - test
 */
function redirectPage( responseJson  )
{
        responseJson = JSON.parse(responseJson);

        if( responseJson.redirect_url != undefined )
        {
            var redirect_URL = window.externalframe ? responseJson.redirect_url[0] + "?externalframe=true" : responseJson.redirect_url[0];  //NO I18N /* externalframe url added page redirect */
            var is_open_in_new_tab = false;
            if( responseJson.is_open_in_new_tab != undefined ) {
              is_open_in_new_tab = responseJson.is_open_in_new_tab[0];
            }
            if( is_open_in_new_tab ) {
              window.open(redirect_URL, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href= redirect_URL;
            }

            //When URL contains '#' and if we change href with hash contains URI, then page won't refresh.
            if( redirect_URL.indexOf('#') != -1 && window.location.pathname  == redirect_URL.split('#')[0] )
            {
              window.location.reload();
            }
        }
        else
        {
          showalert('failure', translate('changeportal.error'), 'isAutoHide=true'); //NO I18N
        }
}

// To arrage quickmenu data items in 3 columns.
// arg1: data from getHeader API [Object]
  function quickMenuDataProcessing(data) {
    data.quick_actions_menu.col = [];
    if(data.quick_actions_menu.isenabled){
      var col1 = [], col2 = [];
      jQuery.each(data.quick_actions_menu.items, function() {
        if(this.items.length) {
            if(this.id == "q_createnew" ||  this.id == "q_reply_template" || this.id=="q_scan_head") {
              // "Create New" goes in first column
              col1.push(this);
            } else  {
              // "Schedulers", "Tasks" , "Reminders" , "Communication" and "Reply Template" goes in second column
              col2.push(this);
            }
        }
      });
        data.quick_actions_menu.col.push({"items":col1}, {"items":col2});//NO I18N
        data.quick_actions_menu.items = {
          col1: col1,
          col2:col2
        }
    }
    return data;
  }

// To show ADMP/ADSSP/DC/MDM/ANALYTICS help menu when not integrated.
// arg1: Name of the product like ADSSP [String]
  function showHelpLayer(type) {
    var showDialog=true, fileName="";
    type = type.toLowerCase();

    if(jQuery('#_DIALOG_LAYER')!=null&&jQuery('#_DIALOG_LAYER').length&&jQuery('#_DIALOG_LAYER').css('visibility')!=='hidden'){
        closeDialog();
        var oldType="";
        if(jQuery('#_DIALOG_LAYER').find('#DC_DIALOG_LAYER').length){
            oldType="dc";//NO I18N
        }
        else if(jQuery('#_DIALOG_LAYER').find('#DC_MDM_DIALOG_LAYER').length){
            oldType="mdm";//NO I18N
        }
        else if(jQuery('#_DIALOG_LAYER').find('#ADSSP_DIALOG_LAYER').length){
            oldType="adssp";//NO I18N
        }
        showDialog=false;
        //Direct click on other
        if(type!==oldType){
            showDialog=true;
        }
    }
    var local =sdp_user.LOCALE=="en_US" ? "" : ("_"+sdp_user.LOCALE.split('_')[0]);//NO I18N
    if(showDialog){
        if(type == "adssp") {
          fileName="adssp_mktg"; //NO I18N
        }
        else if(type == "admp") {
            fileName="admp_mktg";//NO I18N
        }
        else if(type == "adv_analytics") {
            fileName="advanced_analytics_mktg";//NO I18N
        }
        else if(type == "mdm") {
          fileName="mdm_mktg";//NO I18N
        }
        else if(type == "dc") {
          fileName="desktop_central_mktg";//NO I18N
        }
        else if(type == "pmp") {
          fileName="pmp_mktg";//NO I18N
        }
        else if(type == "pam360") {
          fileName="pam360_mktg";//NO I18N
        }
        else if(type == "ela") {
          fileName="ela_mktg";//NO I18N
        }
        else if(type == "opm") {
          fileName="opm_mktg";//NO I18N
        }
        else if(type=="zc"){
            fileName="zcMkg";//NO I18N
        }
        else if(type.indexOf("_sms_ember")>-1){//to split if it contain _ember
          fileName = "sms_configure/"+ type.substr(0,type.indexOf(".html_sms_ember"))// NO I18N
        }
        else if(type == "site24x7") {
            fileName="site24x7_mktg" ;//NO I18N
        }
        else if(type == "kmp") {
            fileName="kmp_mktg";//NO I18N
        }
        jQuery.get('/html/common/'+fileName + local +".html" ).done(function() {
          showURLInDialog('/html/common/'+fileName + local +".html",'modal=no,closeOnEscKey=yes,closeButton=no,position=absolute');//NO I18N
      }).fail(function() {
            showURLInDialog('/html/common/'+fileName +".html",'modal=no,closeOnEscKey=yes,closeButton=no,position=absolute');//NO I18N
      });
    }
  }

//=============== SD-125250 : Skip Inline Validations for Mail Processing
function canShowSkipInlineValidationBanner(){
    if(!Store.getCookie("skip_inline_val_banner_"+sdp_user.LOGGEDIN_USERID)){
       return true;
    }
}

function getRecentItems(){
    sdpAjax({
        async: false,
        url: "/servlet/AJaxServlet?action=GetRecentItems",//NO I18N
        success: function(data) {
            processRecentItems(data);
        }
    });
}

// process recent item list for including icon classes
// arg1: data from getRecentItems function [JSON object]
function processRecentItems(data) {
  var moduleIconMap={
      "Request": {"css_class":"hspr icon-md ri-requ","module": translate('common.request')},//NO I18N
      "PurchaseOrder": {"css_class":"hspr icon-md ri-pureq","module": translate('sdp.header.newpo')},//NO I18N
      "PurchaseRequest": {"css_class":"hspr icon-md ri-puror","module": translate('common.purchase.request')},//NO I18N
      "Contract": {"css_class":"hspr icon-md ri-cont","module": translate('common.contracts')},//NO I18N
      "Asset": {"css_class":"hspr icon-md ri-asset","module": translate('common.asset')},//NO I18N
      "CI": {"css_class":"hspr icon-md ri-cmdb","module": translate('sdp.header.cmdb')},//NO I18N
      "Workstation": {"css_class":"hspr icon-md ri-asset","module": translate('common.workstation')},//NO I18N
      "Report": {"css_class":"hspr icon-md ri-req","module": translate('common.reports')},//NO I18N
      "Solution": {"css_class":"hspr icon-md ri-solutn","module": translate('sdp.header.solutions')},//NO I18N
      "Problem": {"css_class":"hspr icon-md ri-problem","module": translate('common.problems')},//NO I18N
      "Change": {"css_class":"hspr icon-md ri-change","module": translate('common.change')},//NO I18N
      "EmergencyChange": {"css_class":"hspr icon-md ri-change-emer","module": translate('sdp.change.emergencychange')},//NO I18N
      "Space": {"css_class":"sspr sm-space icon-md","module": translate('sdp.header.space')},//NO I18N
      "campus": {"css_class":"sspr sm-campus icon-md","module": translate('sdp.header.space')},//NO I18N
      "building": {"css_class":"sspr sm-structure icon-md","module": translate('sdp.header.space')},//NO I18N
      "nonbuilding": {"css_class":"sspr sm-structure icon-md","module": translate('sdp.header.space')},//NO I18N
      "floor": {"css_class":"sspr sm-floor icon-md","module": translate('sdp.header.space')},//NO I18N
      "room": {"css_class":"sspr sm-room icon-md","module": translate('sdp.header.space')},//NO I18N
      "roompartition": {"css_class":"sspr sm-room icon-md","module": translate('sdp.header.space')},//NO I18N
      "Project": {"css_class":"hspr icon-md ri-project","module": translate('common.project')},//NO I18N
      "Release": {"css_class":"hspr icon-md ri-release pos-rel vmiddle top4 flip-x","module": translate('common.release')},//NO I18N
      "EmergencyRelease": {"css_class":"hspr icon-md ri-release-emer pos-rel vmiddle top4 flip-x","module": translate('sdp.release.emergency')},//NO I18N
      "Maintenance": {"css_class":"hspr icon-md ri-maintenances pos-rel vmiddle top4 flip-x","module": translate('common.maintenance')}//NO I18N
  };
  if(checkIfMSPOrSCP())
	{
	  moduleIconMap.Account = {"css_class":"hspr icon-md ri-account ","module": translate('sdp.msp.common.account')};//NO I18N
	  moduleIconMap.AccountContract = {"css_class":"sdp-glyph sdp-glyph-contract icon-lg ","module": translate('common.newcontract')};//NO I18N
	}
  if(checkIfSCP())
	{
	  moduleIconMap.Products = {"css_class":"hspr icon-md ri-prod","module": translate('sdp.header.newproduct')};//NO I18N
	}
  var items=[];
  for(var i=0,len=data.length;i<len;i++){
      if(moduleIconMap[data[i].module]){
          var item={'class':moduleIconMap[data[i].module].css_class,'is_class':true,'text':data[i].text,'module_name':data[i].module,'title':data[i].title,'url':data[i].url,'module':moduleIconMap[data[i].module].module};//No I18N
          if(data[i].module&&data[i].module=="Space")
      {
        try{
        var spaceURL = data[i].url;
        if(spaceURL)
        {
          var moduleStartIndex=spaceURL.indexOf("module=");
          var moduleEndIndex=spaceURL.indexOf("&",moduleStartIndex);
          var spaceSubModule=spaceURL.substring(moduleStartIndex+7,moduleEndIndex);
          if(spaceSubModule&&moduleIconMap[spaceSubModule])
          {
            item['class']=moduleIconMap[spaceSubModule].css_class;
          }
        }
        }
			  catch(e){

			  }
		  }
      if(data[i].module&&data[i].module=="Change" && data[i].image)
		  {
        item['class']=data[i].image;
      }
      items.push(item);
      }
      else{
          var image='/images/project-icon-s-n.png';//NO I18N
          if(data[i].module==='CI' || data[i].module==='CMDBUser' || data[i].module==='AdminUser'){
              if(data[i].image){
                  image=data[i].image;
              }
              else{
                  image='/images/CItype_default.png';//NO I18N
              }
          }
          var item={
              image:image,
              is_class:false,
              text:data[i].text,
              title:data[i].title,
              url:data[i].url
          };
          items.push(item);
      }
  }
    // var theTemplate = Handlebars.templates["recent-items"]; //NO I18N
    // var theCompiledHtml = theTemplate({items:items});
    // jQuery('#recentitems').html(theCompiledHtml);
    renderhbs('#recentitems','recent-items',{items:items}, false, "common",'','',function(){ // NO I18N
      //Tooltip initalize for recent item
      initTooltip("#recentitems"); // NO I18N
    });


}
var manage_Tabs= {
  /* To get user personalized data*/
  getUserPersonalizedOrganizeTabsData : function() {
    var usertabsData = sdp_user.CLIENT_CONF.organizetabs;

    if (!jQuery.isEmptyObject(usertabsData)) {

      //  To remove duplicate tab names in header
      usertabsData.selectedTabs = usertabsData.selectedTabs.filter(function (k, index) {
        return usertabsData.selectedTabs.indexOf(k) === index;
      });
      usertabsData.deSelectedTabs = usertabsData.deSelectedTabs.filter(function (m, index) {
        return usertabsData.deSelectedTabs.indexOf(m) === index;
      });

      var hometab = "home"; // NO I18N
      // To remove home tab if deselected tabs array contains home tab
      usertabsData.deSelectedTabs = usertabsData.deSelectedTabs.filter(function (item) {
        return item != hometab;
      });

      // Enable home tab if  home tab  is not present
      if (!usertabsData.selectedTabs.includes(hometab)) {
        usertabsData.selectedTabs.unshift(hometab);
      }
    }
    return usertabsData;
  },
  /* To  customize header tabs */
  processCustomizeTabs : function(data) {
    if (sdp_app.IS_AE) {
      return;
    }
    var headerItems = data.modules.items;
    data.tabsSettings = {};
    var tabsData = jQuery.extend({}, sdp_app.themes.organize_tabs);
    var usertabsData = manage_Tabs.getUserPersonalizedOrganizeTabsData();

    if ((tabsData == null) || (tabsData == 'undefined') || (!Array.isArray(tabsData.selectedTabs))) {
      data.tabsSettings.IS_USER_CUSTOMIZE_TABS_ENABLED = false;
      return data;
    }
    //To remove admin settings duplicate data
    tabsData.selectedTabs = tabsData.selectedTabs.filter(function (i, index) {
      return tabsData.selectedTabs.indexOf(i) === index;
    });

    var settings = {};
    if (sdp_user.USERTYPE == 'Technician' && tabsData.allow_user_toCustomizeTabs == true && !jQuery.isEmptyObject(usertabsData) && Array.isArray(usertabsData.selectedTabs)) {
      usertabsData.allTabs = usertabsData.selectedTabs.concat(usertabsData.deSelectedTabs);
      settings = usertabsData;
    }
    else {
      tabsData.allTabs = tabsData.selectedTabs.concat(tabsData.deSelectedTabs);
      settings = tabsData;
    }

    var modlsKey = {}, modlsUrl = {}, modlsIsDynamic = {}, modlsIcon = {}, modlsDispName = {} , modlsIsnewWebtab = {};
    var headerItemsIds = [];
    var selectedtabs = [];
    var newTabs = [];
    for (var i = 0; i < headerItems.length; i++) {
      var key = headerItems[i]['id'];
      const disp_name = headerItems[i]['disp_name'] ? headerItems[i]['disp_name'] : translate(headerItems[i]['i18n_key']);
      headerItemsIds.push(key);
      modlsKey[key] = headerItems[i]['i18n_key'];
      modlsUrl[key] = headerItems[i]['url'];
      modlsIsDynamic[key] = headerItems[i]['is_dynamic'];
      modlsIcon[key] = headerItems[i]['icon'] ? headerItems[i]['icon'] : null;
      modlsDispName[key] = disp_name;
      modlsIsnewWebtab[key] = headerItems[i]['isNewWebTab'] ? headerItems[i]['isNewWebTab'] : null;

      if (settings.allTabs.indexOf(key) == -1) {
        newTabs.push({ id: key, enabled: true, i18n_key: headerItems[i]['i18n_key'], url: headerItems[i]['url'], is_dynamic: headerItems[i]['is_dynamic'], icon: modlsIcon[key], disp_name , isNewWebTab: modlsIsnewWebtab[key] });
      }
    }

    for (var i = 0; i < settings.selectedTabs.length; i++) {
      var key = settings.selectedTabs[i];
      const disp_name = modlsDispName[key];
      if (headerItemsIds.includes(key)) {
        selectedtabs.push({ id: key, enabled: true, i18n_key: modlsKey[key], url: modlsUrl[key], is_dynamic: modlsIsDynamic[key], icon: modlsIcon[key], disp_name , isNewWebTab: modlsIsnewWebtab[key] });
      }
    }
    data.tabsSettings.IS_USER_CUSTOMIZE_TABS_ENABLED = tabsData.allow_user_toCustomizeTabs;
    data.modules.items = selectedtabs.concat(newTabs);
    return data;
  }
};
         
function getThemeSettings() {
  var themeSettings;
  if(sdp_app.themes.theme_settings) {
    themeSettings = jQuery.extend({}, sdp_app.themes.theme_settings);
  }
  else {
    //Default values of theme settings
    themeSettings = {top_header_color : "rgb(37, 46, 53)", tab_selected_color : "rgb(0, 141, 221)", tab_selected_text : "rgb(255, 255, 255)", tab_normal_text : "rgb(255, 255, 255)", tab_hover_color : "rgba(59, 71, 81, 0.6)", primary_button_border : "rgb(0, 141, 221)", primary_button_text : "rgb(255, 255, 255)", primary_button_color : "rgb(0, 141, 221)", body_background_color : "rgb(243, 243, 243)", link_tab_line_color: "rgb(0, 141, 221)", font_family : "Roboto, Arial", allow_user_customization : true, css_type : "Blue",layout:"topbar"}; //NO I18N
  }

  if(!themeSettings.layout) {
    themeSettings.layout = "topbar"; //No I18N
  }
  /* Check global personalized font family not available in Application available font list, then set as "Roboto"  */
  var headerfontfamily = $fontapi.fontSelect2Opt(themeSettings);
    headerfontfamily = headerfontfamily ? headerfontfamily.style : "Roboto, Arial";//No I18N
  themeSettings.font_family = headerfontfamily;
  sdpheader_data.themeSettingsData = themeSettings;
  return jQuery.extend({}, themeSettings);
}

function applyThemes(tabName){
  if(tabName != undefined){
      var $jqBody = jQuery("body");
      $jqBody.find('ul.main-module li').removeClass('active');
      $jqBody.find('ul.main-module').find('#'+tabName+'').closest('li').addClass('active');
      $jqBody.find(".header-icon-list").find("li").removeClass('active');
      $jqBody.find(".header-icon-list").find("[data-tab-id='"+tabName+"']").addClass('active');
  }
}

/**
 *  Theme Customizer
 */
var ThemeCustomizer = {
  data: {},
  z_contrastColor: {},//118119 -- RTA section Zoho color contrast changes updated
  init: function() {
      var self = this;
      var config = self.data;
      var themeName = config.theme || config.css_type;
      var layout = config.layout;
      var jQBody = jQuery("body");
      var font = config.fontFamily;
      var nightMode = config.nightMode;
	  /***
		Check User personalized fonts available or not in global variable sdp_app.FONTS otherwise personalize to default font ("Roboto"), and configure font api call using sdp_select2 component in input element "#userCustomFont"
	  ***/
	  var personalizefont = {};
	  var defaultfont = {};
	  jQuery.each(sdp_app.FONTS, function( index, value ) {
		if("Roboto, Arial" == value.style || "Roboto" == value.name) {
			defaultfont = value;
			defaultfont["text"] = value.name;
		}
		if(font == value.style || font == value.name) {
			personalizefont = value;
			personalizefont["text"] = value.name;
		}
	  });
	  var datafont = (jQuery.isEmptyObject(personalizefont)) ? defaultfont : personalizefont;
      jQBody.find(".pro-theme li[data-theme] > span").addClass("vhide");
      jQBody.find(".pro-theme li[data-theme='" + themeName + "'] > span").removeClass("vhide");
    var fontdata = $fontapi.fontSelect2Opt();
      fontdata = $fontapi.fontSortOrder(fontdata);
    var options = {
    data: fontdata,
    formatResult: function(resdata, _self) {
      return '<span id='+resdata.id+' style="font-family: '+e_attr(resdata.style)+'" class="text-wrap">'+e_html(resdata.text)+'</span>';
    }
    };
    jQBody.find("#userCustomFont").select2(options).select2("data",datafont); //NO I18N
      jQBody.find("#layout-customizer").attr("data-layout", layout);
      jQBody.find('#nightmode input').prop('checked', nightMode); // NO I18N
  },
  //Change Layout in User Personalization
  changeLayout: function(layout) {
    var userTheme = {
        theme: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.theme : "",
        fontFamily: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.fontFamily : "",
        layout: layout,
        nightMode: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.nightMode : false
    };
    ThemeCustomizer.save(userTheme, true);
  },
  //Change mode in User Personalization
  nightMode: function(cur) {
      var nightModeN = jQuery(cur).is(':checked'); // NO I18N
      var userTheme = {
          theme: "",
          fontFamily: "",
          layout: "",
          nightMode: nightModeN
      };
    var themeObj = sdp_user.CLIENT_CONF.userTheme;
    if(themeObj){
      userTheme.theme = themeObj.theme;
      userTheme.fontFamily = themeObj.fontFamily;
      userTheme.layout = themeObj.layout;
    }
      this.save(userTheme).then(() => {
        darkMode();
        darkTriggerload();
        /**
         * To initialize dark mode in the editor
         */
        this.initDarkModeInEditor(nightModeN);
        //118119 -- RTA section Zoho color contrast changes updated
        this.zcontrastcolor(nightModeN);
        /** If ZohoTelephony is default service , toggle darkMode in ZT */
        if("ZohoTelephony" == sdp_app.TELEPHONY_SERVICE && typeof(PB) != undefined){
          PB.toggleTheme({darkmode:nightModeN});
        }
      });
  },
  zcontrastcolorinit: function(container) {
    if(sdp_app.themes.IS_USER_THEME_ENABLED && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.userTheme && sdp_user.CLIENT_CONF.userTheme.nightMode) {
      this.zcontrastcolor(true,container);
    }
  },
  zcontrastcolor: function(nightmode,container) {
      // Get all elements with  data-content="rta"
      container = container ? document.querySelector(container) : document;
      let panelbody = container.querySelectorAll('[data-content=rta]'); // NO I18N
      // Loop through each panel body element
      for(var i=0; i<panelbody.length; i++) {
          let ele = jQuery(container).find('[data-content=rta]')[i]; // NO I18N
          // Get the contrast color configuration object
          let z_contrastColor = ThemeCustomizer.z_contrastColor;

          // Revert color changes if the contrast color object is not empty and the element has a data-zcontrastcolor attribute
          if(!jQuery.isEmptyObject(z_contrastColor) && ele.dataset.zcontrastcolor) {
              revertColorChanges({ alteredElems: z_contrastColor[ele.dataset.zcontrastcolor], domNode: ele });
              delete z_contrastColor[ele.dataset.zcontrastcolor];
          }

          // Apply contrast color if night mode is enabled
          if(nightmode) {
              let eleid = ele.id;
              // Generate a random ID if the element doesn't have an ID
              if(!eleid) {
                  eleid = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
              }

              // Set the data-zcontrastColor attribute with the generated ID
              ele.setAttribute('data-zcontrastColor',eleid); // NO I18N

              // Change the element's color to contrast color with background color "#121212"
              z_contrastColor[eleid] = changeToContrastColor({ domNode: ele, bgColor: "#121212" }); // NO I18N
          }
      }
  },

  /**
   * Function to initialize dark mode in the editor
   * @param {boolean} value
   */
  initDarkModeInEditor : function(value){
    /**
     * Check if ZEditor.editor exists
     */
    if(ZEditor.editor){
      /**
       * If ZEditor.editor exists, trigger the night mode state with the given value
       */
      ZEditor.editor.triggerNightModeState(value)
    }else{
      /**
       * If ZEditor.editor doesn't exist, iterate through each property of ZEditor
       */
      for (let key in ZEditor) {
        /**
         * Ensure that the property belongs to ZEditor itself, not inherited
         */
        if (ZEditor.hasOwnProperty(key)) {
          /**
           * Trigger the night mode state for each property's value with the given value
           */
          ZEditor[key].triggerNightModeState(value)
        }
      }
    }
  },

  //Change font in User Personalization
  font: function() {
      var fontFamily = jQuery("#userCustomFont").select2("data").style; //NO I18N
      var userTheme = {
          theme: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.theme : "",
          fontFamily: fontFamily,
          layout: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.layout : "",
          nightMode: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.nightMode : false
      };
      if(fontFamily != "") {
        jQuery("body").css("font-family", fontFamily); // NO I18N
      this.save(userTheme);
      /** Some of the are in small size, so that need to resize the header again */
      setTimeout(function(){
        $header.initResizeHeader();
        $header.resizeHeader();
      },400);
        sdp_app.CLIENT_CONF.RTA.fontFamily = fontFamily;
      }
  },
  theme: function(themeName) {
      var userTheme = {
          theme: themeName,
          fontFamily: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.fontFamily : "",
          layout: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.layout : "",
          nightMode: sdp_user.CLIENT_CONF.userTheme ? sdp_user.CLIENT_CONF.userTheme.nightMode : false
      };
      jQuery(".pro-theme li[data-theme] > span").addClass("vhide");
      jQuery(".pro-theme li[data-theme='" + themeName + "'] > span").removeClass("vhide");
      this.includeCSS(themeName);
      this.save(userTheme);
  },
  /**
   * Include the theme related css dynamically
   */
  includeCSS: function(selectedTheme) {
      jQuery(".sdmenu-dd .thm-cmn span.active").removeClass("active");
      jQuery("#header" + selectedTheme + "Theme").addClass("active");
      if (selectedTheme != "") {
          selectedTheme = "_" + selectedTheme + ".css"; //NO I18N
      } else {
          var portalId = "";
          if (sdp_app.PORTAL_ID > 1) {
              portalId = "_" + sdp_app.PORTAL_ID;
          }
          selectedTheme = portalId + ".css?" + new Date().getTime(); // NO I18N
      }
      jQuery("body").append('<link rel="stylesheet" href="/custom/style/user_styles' + selectedTheme + '" type="text/css" />'); //No I18N
  },
  /**
   * Reset the User themes
   */
  reset: function() {
      var jQBody = jQuery("body");
      var userTheme = {
          theme: "",
          fontFamily: "",
          layout: "",
          nightMode: false
      };
      this.includeCSS("");
      this.save(userTheme, true);
      var themeSettings = getThemeSettings();
      jQuery('body').css('font-family', themeSettings.font_family); // NO I18N
    themeSettings.font_family = $fontapi.fontSelect2Opt(themeSettings);
      jQBody.find("#userCustomFont").select2("data",themeSettings.font_family); //NO I18N
      jQBody.find(".pro-theme li[data-theme] > span").addClass("vhide");
      jQBody.find(".pro-theme li[data-theme='" + themeSettings.css_type + "'] > span").removeClass("vhide");
      jQBody.find("#navigation-menu input[type='radio']").prop("checked", false); // NO I18N
      jQBody.find("#navigation-menu input[value=" + themeSettings.layout + "]").prop("checked", true); // NO I18N
      jQBody.find("#nightmode input").prop("checked", false); // NO I18N
  },
  /**
   * Save the Data to the Server
   */
  save: function(theme, reloadPage) {
      if(sdp_app.themes && sdp_app.themes.IS_USER_THEME_ENABLED) {
        return ClientUtil.addUserPersonalization("userTheme", theme).then((response) => { // NO I18N
          if(reloadPage) {
            window.location.reload();
          }
        });
      }
  },
};

function setIframeBodyFont(_this) {
  if(isEmpty(_this.contentDocument.body.style.fontFamily)) {
    _this.contentDocument.body.style.fontFamily = setBodyFont();
  }
}

function s_l_v(){
  if(sdp_app.LICENSE_INFO.LICENSE_VIOLATED){
    // term 'technician' changed as 'support rep' for SCP
    const dynTerm = typeof(isSCP) != "undefined" && isSCP ? "support rep" : "technician"; //NO I18N
    let htmlCont = '<div class="license-banner"><div class="lcb-header h2 m0">License Violation</div><div class="lcb-content"><div><span></span></div><div class="lh24 font-large"><div><p>You have created <span id="l_v_p_u" class="h2 sb">'+sdp_app.LICENSE_INFO.TECHNICIAN_LOGIN_COUNT+' '+dynTerm+' logins,</span> But your license can support only <span class="h2 sb">'+sdp_app.LICENSE_INFO.TECHNICIAN_ACTUAL_COUNT+' '+dynTerm+' logins.</span> Please perform one of the following for continued service.</p><p>Remove unwanted '+dynTerm+' logins and restart the application. </p><p>or</p><p>Upgrade your license by writing to '+ translate('sdp.robo.sales.email') +'. </p></div></div></div></div>';//NO I18N
    let l_len = jQuery('#l_v_p_u').length;
    if(l_len<1){jQuery(".page-progressbar").after(htmlCont);}
  }
}
let footerCount = true;
function processHeaderData(data) {
    var  clon_data = data.modules.items.slice(0).map((el) => {
      let disp_name = "";
      if(el.is_dynamic) {
        disp_name = el.i18n_key;
      }
      else {
        disp_name = translate(el.i18n_key);
      }
      el.disp_name = disp_name;
      return el;
    });

  if(data.showADScheduleUpdateBanner)
  {
    if(Store.getCookie("close_adschedule_update_banner_"+sdp_user.LOGGEDIN_USERID)) {
      data.showADScheduleUpdateBanner = false;
    }
    else
    {
      var showADScheduleUpdateBannerLink = '/SetUpWizard.do?forwardTo=activeDirectory'; // NO I18N
      if(isMDHSetup == 'true') {
        showADScheduleUpdateBannerLink = '/ESM.do?type=activedirectory'; // NO I18N
      }
      data.showADScheduleUpdateBanner= translate("sdp.ad.schedule.banner",[showADScheduleUpdateBannerLink]);
    }
  }
  if(data.showAdminScheduleBanner != undefined && data.showAdminScheduleBanner != -1) {
    if(Store.getCookie("close_admin_audit_history_schedule"+sdp_user.LOGGEDIN_USERID)) {
      data.showAdminScheduleBanner = -1;
    } else {
      var link = '/SetUpWizard.do?forwardTo=settings'; // NO I18N
      if(isMDHSetup == 'true') {
        link = '/ESM.do?type=applicationsettings'; // NO I18N
      }
      var adminLink = 'https://help.servicedeskplus.com/audit-history-backup'; // NO I18N
      data.showAdminScheduleBanner= translate("admin.history.banner",[data.adminAuditHistoryLimit, data.showAdminScheduleBanner, link, adminLink]);
    }
  } else {
    data.showAdminScheduleBanner = -1;
  }

  if(data.showUpdateDBStatisticsBanner) {
    if(Store.getCookie("close_optimize_performance_tips_"+sdp_user.LOGGEDIN_USERID)) {
      data.showUpdateDBStatisticsBanner = false;
    }
    else {
      var performancesettingsPageLink = '/SetUpWizard.do?forwardTo=PerformanceSettings'; // NO I18N

      data.showUpdateDBStatisticsBanner = translate("common.performanceOptimizeTip", ["<a href='"+performancesettingsPageLink+"' class='text-link'>"+translate("sdp.common.schedule")+"</a>"]);
    }
  }

  if(data.showTFABanner){
	if(Store.getCookie("disable_tfa_banner_"+sdp_user.LOGGEDIN_USERID)) {
      data.showTFABanner = false;
    }
  }
    //SD-125250 : Skip Inline Validations for Mail Processing
   if(data.skip_inline_validation && canShowSkipInlineValidationBanner()){
     data.showSkipInlineValidationBanner = true;
   }

   if(data.showRequestAABanner){
  	if(Store.getCookie("disable_Request_aplus_banner_"+sdp_user.LOGGEDIN_USERID)) {
        data.showRequestAABanner = false;
      }
    }
     if(data.showAssetAABanner){
      	if(Store.getCookie("disable_Asset_aplus_banner_"+sdp_user.LOGGEDIN_USERID)) {
            data.showAssetAABanner = false;
          }
        }

  if(data.showInvalidRulesRequestInfo){
    if(Store.getCookie("close_show_invalid_request_rules_"+sdp_user.LOGGEDIN_USERID)) {
      data.showInvalidRulesRequestInfo = false;
    }
    else {
      data.showInvalidRulesRequestInfo = translate("invalid.request.workflow.rules.info");
    }
  }

  if(data.showAAOAuthBanner)
  {
    if(Store.getCookie("close_AAOAuthBanner_"+sdp_user.LOGGEDIN_USERID)) {
      data.showAAOAuthBanner = false;
    }
    else {
        var oauthHelpcardLink = "https://help.servicedeskplus.com/configurations/general/zoho-reports-integration.html$oauth";//NO I18N
        data.showAAOAuthBanner = translate("common.oauthAAConfigureAlert", ["<a href='"+ oauthHelpcardLink + "' class='text-link' target='_blank' rel='noopener noreferrer'>"+translate("common.learnHow")+"</a>"]);
    }
  }
   /** If its rebrand and the showAntiVirusCustomizationBanner is avaiable need to hide the banner. */
    if(sdp_app.IS_REBRAND && data.showAntiVirusCustomizationBanner) { 
      delete data.showAntiVirusCustomizationBanner;
    }
    if(data.showAntiVirusCustomizationBanner) {
      if(Store.getCookie("close_antivirus_Customization_"+sdp_user.LOGGEDIN_USERID)) {
        data.showAntiVirusCustomizationBanner = false;
      }
      else{
      var antiviruscustomizationLink="https://help.servicedeskplus.com/introduction/service-desk-system-requirements.html$anti-virus";//NO I18N
      var messageForPGSQL="logs "+translate("common.admin.banner.antivirus.folder");//NO I18N
      var directory=translate("sdp.common.assetexplorer");
        if(data.isPGSQL)
        {
          messageForPGSQL=messageForPGSQL+", pgsql "+translate("common.admin.banner.antivirus.folder")+" and  postgres.exe  "+translate("common.admin.banner.process");//NO I18N
        }
        if(checkIfSCP()){
        	antiviruscustomizationLink="https://help.supportcenterplus.com/portal/en/kb/articles/system-requirements#PostgreSQL_Applicable_to_SupportCenter_Plus_version_100_and_earlier"//NO I18N
        }
        if(sdp_app.IS_MSP)
        {
        directory=translate("sdp.common.servicedeskmsp");
        antiviruscustomizationLink="https://www.manageengine.com/products/service-desk-msp/help/adminguide/introduction/service-desk-system-requirements.html";//NO I18N
        }else if(sdp_app.IS_SDP)
        {
        directory=translate("sdp.common.servicedesk");
        }
        data.showAntiVirusCustomizationBanner=translate("common.admin.banner.antivirus",[directory,messageForPGSQL,["<a href='"+antiviruscustomizationLink+"' class='text-link ml10'>&nbsp;"+translate("ae.admin.banner.dbperformance.knowmore")+"</a>"]]);
      }
    }

    if(data.showAUNotifyUserBanner)
       {
         if(Store.getCookie("close_AUNotifyUserBanner_"+sdp_user.LOGGEDIN_USERID)) {
           data.showAUNotifyUserBanner= false;
         }
         else {
             var aulink = "/app#/admin/auto-update";//NO I18N
             if(isMDHSetup == 'true') {
               aulink = "/ESM.do?type=ESMAU"; //NO I18N
             }
             data.showAUNotifyUserBanner = getMessageForKey("au.userBanner", ["<a href='"+ aulink + "' class='text-link' rel='noopener noreferrer'>"+getMessageForKey("sdp.common.clickhere")+"</a>"]);
         }
       }

       if(data.showAUNetworkBanner)
       {
         if(Store.getCookie("close_AUNetworkBanner_"+sdp_user.LOGGEDIN_USERID)) {
           data.showAUNetworkBanner= false;
         }
         else {
            var aulink = "/app#/admin/auto-update";//NO I18N
            if(isMDHSetup == 'true') {
                aulink = "/ESM.do?type=ESMAU"; //NO I18N
            }
             data.showAUNetworkBanner = getMessageForKey("au.connectivityBanner", ["<a href='"+ aulink + "' class='text-link' rel='noopener noreferrer'>"+getMessageForKey("sdp.common.clickhere")+"</a>"]);
         }
       }

       if(data.showAURestartBanner)
       {
            var clickhereMsg = "sdp.admin.dcserversettings.clickhere"; //NO I18N
            var aulink = "/app#/admin/auto-update";//NO I18N
            if(isMDHSetup == 'true') {
               aulink = "/ESM.do?type=ESMAU"; //NO I18N
            }
            // In linux setup, message content is different and know more link will be present
            if(data.AURestartBannerMsg == "au.versionAvailableBanner"){
                if(sdp_app.IS_AE){
                    aulink = "https://www.manageengine.com/products/asset-explorer/security-advisory.html"; //NO I18N
				}else if(sdp_app.IS_MSP){
                    aulink = "https://www.manageengine.com/products/service-desk-msp/security-advisory.html"; //NO I18N
				}else if(sdp_app.IS_SCP){
                    aulink = "https://www.manageengine.com/products/support-center/security-advisory.html"; //NO I18N
                }else{
                    aulink = "https://www.manageengine.com/products/service-desk/security-advisory.html"; //NO I18N
                }
                clickhereMsg = "sdp.admin.dcconfig.tools.knowmore"; //NO I18N
            }
            data.showAURestartBanner = getMessageForKey(data.AURestartBannerMsg, ["<a href='"+ aulink + "' class='text-link' rel='noopener noreferrer'>"+getMessageForKey(clickhereMsg)+"</a>"]);
       }

  if(data.dbperf)
    {
  if(Store.getItem("dbperformanceremainder",true) !== null){    //NO I18N
        data.dbperf.show_strip=false;
    }
    else{
        data.dbperf.show_strip=true;
    }
    }
  productName=document.title;
  if(productName == "" || typeof productName == "undefined"){
    productName = sdp_app.PRODUCT_NAME;
  }
  /* Global configurations are not applied to users with the 'SDGuest' role*/
  if(!(sdp_user.USERTYPE== "Requester")){
     manage_Tabs.processCustomizeTabs(data);
  }
  data = quickMenuDataProcessing(data);
  sdpheader_data = data;
  if(data.license)
  {
    if(data.license.eval_zone||data.license.license_alert||data.license.renew){
      if((data.license.eval_zone&&data.license.eval_zone.days>3||data.license.license_alert&&data.license.license_alert.days>3||data.license.renew&&data.license.renew.days>3)){
          if(Store.getItem("evaluationlicensedays",true) !== null ){    //NO I18N
              data.license.show_strip=false;
          }
          else{
              data.license.show_strip=true;
          }
      }
      else{
          data.license.show_strip=true;;
      }
  }
  if(data.license.amsrenew)
  {
      if(data.license.amsrenew.showUpdateStrip)
      {
        data.license.ams_show_strip = true;
      }
      else if(data.license.amsrenew.days >= 0)
      {
        if(Store.getItem("amsevaluationdays",true) !== null)
        {
          data.license.ams_show_strip = false;
        }
        else
        {
          data.license.ams_show_strip = true;
        }
      }
  }
  if(data.license.isFreeLicense)
  {
        data.license.show_strip=true;
  }
}

if(data.cmdbV1APIUsage){
    data.showCMDBV1APIUsage = true;
}
if(data.cmdbPostMigration && data.cmdbPostMigration.isShowRmdLtr && !data.cmdbPostMigration.isConfigured){
    data.showCMDBPostMigration = true;
}

  var tabs=data.modules.items;
  var href = window.location.href;
  var origin = window.location.origin;
  var url = href.replace(origin,'');
  var current_tab=selected_tab;
     for(var i=0,len=tabs.length;i<len;i++){
         tabs[i].is_selected=false;
         /* For Web Tabs i18n_key is WebTab name which is different with id , So that fetching id from url to match  */
         var i18n_key  =  tabs[i].id.startsWith("home-view") ? tabs[i].url !== undefined && tabs[i].url.split('view_type=')[1] : translate(tabs[i].i18n_key);
         if(selected_tab=== i18n_key){
             current_tab=tabs[i].id;
             /*  this is added to highlight custom widget when it is  webtab  and  widgets have  same name */
             if(tabs[i].id.startsWith("cw_")&&!tabs[i].id.endsWith(widg_id)){
              continue;
            }
             tabs[i].is_selected=true;
         }
      }
    /* To redirect to Home module when disabled selected module from the header for webtabs  */   
    var all_false = tabs.reduce((acc, item) => acc && !item.is_selected, true);
    if (selected_tab !== "" && selected_tab.startsWith("home-view") && all_false) {
      var home_item = tabs.find(item => item.id === "home");
      if (home_item) {
          home_item.is_selected = true;
          window.location.href = home_item.url;
      }
    }
  var search_items=data.search_items ? data.search_items.items : [];
  external_links=data.external_links;
  if(url.indexOf('/ui/asset')>-1){
    if(url.indexOf('module=asset_computers')> -1){
      current_tab='asset_computer';//NO I18N
    }else{
      current_tab='assets';//NO I18N
    } 
  }
  else if(url.indexOf('Software')>-1||url.indexOf('SW')>-1  ||url.indexOf('software')>-1  ){
      current_tab='software';//NO I18N
  }
  else if(url.indexOf('BusinessView')>-1||url.indexOf('CMDB')>-1 || current_tab == 'cmdb' ){
        current_tab='cis';//NO I18N
  }

  var selectedModuleName='', current_search='';
  searchItemLen = search_items.length;
  if(search_items && searchItemLen>0) {
    for(var i=0;i<searchItemLen;i++){
      // if the luence search disbled then, default search from request must be removed.
      if(search_items[i].id === "requests" && !data.is_lucene_search_enabled){
        var items = search_items[i].items;
        // SD-101993
        if(items && items.length){
          items = items.filter(function(item) {
            return item.data_skey !== "default" // NO I18N
          });
          search_items[i].items = items;
        }
      }
      if(search_items[i].id===current_tab){
        current_search=search_items[i].id;
        selectedModuleName = search_items[i].i18n_key;
        break;
      }
    }
  }

  if(current_search=='' && searchItemLen>0) {
    current_search = search_items[0].id;
    selectedModuleName = search_items[0].i18n_key;
  }

  data.current_tab=current_tab;
  data.current_search=current_search;
  data.search_text=search_text;
  if (selectedModuleName == "sdp.header.software")
  {
      data.search_text = window.localStorage.search_text;
  }
  data.selectedModuleName = selectedModuleName;

  if(location.pathname === "/ESM.do"){
    data.currentURL = location.pathname;
  }

  data.product_link=sdp_user.ROLES.indexOf("SDAdmin") > -1 ||sdp_user.ROLES.indexOf("SDSiteAdmin") > -1 ? true : false;//No i18n
  /*Sales IQ chat starts here
  if(data.salesIQ && data.salesIQ.isenabled){
    var s_d=document;
    var s_s=s_d.createElement("script");
    s_s.type="text/javascript";
    s_s.src="/scripts/zohoSalesIQ.js";
    var s_t=s_d.getElementsByTagName("script")[0];
    s_t.parentNode.insertBefore(s_s,s_t);
  }
  //Sales IQ chat ends here*/

  data.orgAdmin = orgAdmin;
  data.reportConfigAdmin = reportConfigAdmin;
  data.isMDHSetup = isMDHSetup;
  data.is_esm_viewed=sdp_user.CLIENT_CONF.is_esm_viewed;
  data.IS_SDP = sdp_app.IS_SDP;
  if( data.esm_details )
  {
    var d = new Date();
    esm_details = data.esm_details;
    if(location.pathname !== "/ESM.do"){
      if(data.esm_details.multiple_instances){
        data.portaldata = loadAccessPortals();
      }else{
        var portalData = data.esm_details.current_portal;
        portalData.logo_url = data.esm_details.current_portal.logo.tiny_url;
        data.portaldata = {
          accessibleportal: [portalData]
        }
      }
    }
  }

  // if(typeof Ember == "undefined") {
    if(data.show_api_key_gen) {
      data.show_api_key_gen = true;
    }
    else {
      data.show_api_key_gen = false;
    }

    var importsslLink = '<a class="btn-link" href="/SetUpWizard.do?forwardTo=importssl">';
    if(location.pathname == "/ESM.do") {
      importsslLink = '<a class="btn-link" href="/ESM.do?type=importssl">';
    }
    if(data.ssl!=undefined && sdp_user.ROLES.includes("SDAdmin")) {
      data.ssl.ssl_renewal_notif = translate('sslimport.ssl_renewal_notif', [data.ssl.days_left_for_expiry, importsslLink]);
      data.ssl.ssl_expired_notif = translate('sslimport.ssl_expired_notif', [importsslLink]);
    }
    //Populate last login time in header using hbs
    if(sdp_app.NOTIFY_LAST_LOGIN_TIME) {
      data.last_login_notify_enabled = true;
      data.notify_last_login_time = sdp_app.NOTIFY_LAST_LOGIN_TIME;
    } else {
      data.last_login_notify_enabled = false;
    }
    data = jQuery.extend({},$header.data,data);

    /**
     * SD-85577 - Issue - When Incident/Service template is submitted, the header is re-rendered and the search box UI is changed.
     */
    resetHeaderUserMenuFlags();
    themeSettings = getThemeSettings();
    if(sdp_app.themes && sdp_app.themes.IS_USER_THEME_ENABLED){
      data.themes_settings = jQuery.extend(true, {}, sdp_user.CLIENT_CONF.userTheme);
      if(jQuery.isEmptyObject(data.themes_settings)) {
        data.themes_settings = themeSettings;
      }

      if(!data.themes_settings.layout){
        data.themes_settings.layout=themeSettings.layout;
      }
      if(!data.themes_settings.theme){
        data.themes_settings.theme= themeSettings.css_type;
      }
      if(!data.themes_settings.fontFamily){
        data.themes_settings.fontFamily= themeSettings.font_family;
      }
    }else{
      data.themes_settings = themeSettings;
    }
    /** Set the Theme Settings to Data variable of themeCustomizer */
    ThemeCustomizer.data = data.themes_settings;
    manage_Tabs.data = clon_data;
    data.has_admin = false;
    if (data.modules && data.modules.items) {
      var items = data.modules.items;
      var item;
      for (var i = items.length - 1; i >= 0; i--) {
        item = items[i];
        if (item.id === "admin") {
          data.has_admin = true;
          data.admin_tab = item;
        }
      }
    }
    Handlebars.registerHelper('showQAtooltip', function (i18n_key) {//No I18N
      if(translate(i18n_key).length>28) {
        return true;
      }
      return false;
    });
    Handlebars.registerHelper('headerModName', function (module, encodeFunc) {//No I18N
      const disp_name = module.disp_name || translate(module.i18n_key);
      return new Handlebars.SafeString(encodeFunc === 'html' ? e_html(disp_name) : e_attr(disp_name));//No I18N
    });
    // assign header to window object to be accessible from other js files
    data.isExternalFrame = window.externalframe == true; // To find if application is loaded via externalframe
    window.headerData = data;
    if(data.isServiceDeskBuild){
      processJumpLinksData(data); //#SD-102666
    }
    //If what's new option is to be displayed
    data.whatsnew_required = sdp_user.IS_USER_TECH_INANYPORTAL && sdp_user.whatsnew_tours != undefined && sdp_user.whatsnew_tours.length > 0 ? true : false;
    Handlebars.registerPartial("header-section-loader", renderhbs("", "section-loader", "", "", "details", "", "", "", true));// NO I18N
    if(footerCount){
      renderhbs('#footer-placeholder','sdp-footer',data, false, "common",undefined,undefined,function(){   //NO I18N
        commonAccessibilities.initChatBar();
      });
      footerCount = false;
    }

    if(sdp_app.IS_MSPOrSCP)
    {
      // Selecting Requests => Request Id as default global search option (if no search option selected) until the Search across support in MSP/SCP
      renderhbs('#header-placeholder','sdp-header',data, false, "common",undefined,undefined,function() // NO I18N
      {
        if(data.themes_settings.layout == "topbar") {
          jQuery("#header-placeholder").addClass("pos-rel");
        }
        if(!jQuery("#globalSearchItems li[data-id].selected").length) // NO I18N
        {
          jQuery("#globalSearchItems li[data-id='requests'] >a").trigger("click"); // NO I18N
          jQuery("#globalSearchItems li[data-id='requests'] li[data-skey='requestid'] >a").trigger("click"); // NO I18N
        }
        jQuery('[data-security-alerts=true]').click(function(evt){// NO I18N
          showSecurityAlerts();
        })
      });
      //Banner Init
      $header.banner.initBanner(data);
    }
    else
    {
      renderhbs('#header-placeholder','sdp-header',data, false, "common", undefined, undefined, function(){   //NO I18N
        if(data.themes_settings.layout == "topbar") {
          jQuery("#header-placeholder").addClass("pos-rel");
        }
        if(jQuery("#impl_getting_started").length != 0){ 
          jQuery("#impl_getting_started").off('click').on('click',function(){window.location.href='/app#/admin-wizard/landing';});//No I18N
        }
      });
      //Banner Init
      $header.banner.initBanner(data);
    }
    setTimeout(function(){
      topSubHeadereventBindings();
    },1000);  
    data.modules.items=clon_data;

    if(!data.isServiceDeskBuild && data.scan.isscanenabled && window.innerWidth<=1280) {
      jQuery(".ae-scan-module").css('margin-left', "10px"); // NO I18N
    }

    //hiding broken image as src not available initially.
    jQuery("[user-profile-pic-img]").hide();
    var entityName = forwardfrom == "ESM" ? "orgusers" : "users"; // No I18N
    sdpAjax({
      url: "/api/v3/"+entityName+"/" + sdp_user.LOGGEDIN_USERID, // No I18N
      success: function (response) {
        var user = response[forwardfrom == "ESM" ? "orguser" : "user"]; // No I18N
        if (user.profile_pic) {
          jQuery("[user-profile-pic-img]").prop("src", user.profile_pic["content-url"]); // NO I18N
          //show img once src available
          jQuery("[user-profile-pic-img]").show(); // No I18N
        }
      }
    });
    if(!sdp_app.IS_REBRAND) {
        showODAD.init();
    }
    if(checkIfMSP()){
    	if(document.getElementById("mspHeaderInclhtml")!=null){
    		var html = jQuery('#mspHeaderInclhtml').html();
			document.getElementById("mspHeaderInclhtml").parentNode.removeChild(document.getElementById("mspHeaderInclhtml"));
    		jQuery('#mspHeader').html(html).show();
			html='';// NO I18N
    	}
    }
    otherUIChanges(data);
    setThemePersonalization();
    $header.bindEvents();

    if (sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes('WHATS_NEW')){
      loadwhatsnewtour();
    }
    //License Violation
    try{s_l_v();}catch(e){}
    // if(location.pathname !== "/ESM.do" && !data.esm_details.is_technician_any_portal && data.esm_details.multiple_instances){
    //     data.portaldata.current_portal = data.esm_details.current_portal;
    //     data.portaldata.isMDHSetup = isMDHSetup;
    //   renderhbs('#aesmSidebar','aesmSidebar-template',data.portaldata, false, "common") // NO I18N
    //     jQuery('#aesmSidebar').show();
    //     instancesidebar('#aesmSidebar', 85);  //NO I18N
    //   }

       // @todo
      setTimeout(function() {
        alignHeader();
      },100);
  // } else {
  //   data.recent_items = {"items": []};//NO I18N
  //   data.dynamic_notification = {"items": []};//NO I18N
  //   return data;
  // }

      const cmdbPostMigration = data.cmdbPostMigration;
      if(cmdbPostMigration && !cmdbPostMigration.isScheduleCompleted) {
        showCMDBMigration.init(cmdbPostMigration);

        jQuery(window).on("popstate.cmdb-post-migration-switch", function (event) {
          showCMDBMigration.init({});
        });
      }

      }
function topSubHeadereventBindings(){

  // Help layer event bindings & opm,mdmp onclick events
  let integ = jQuery(document).off("click.integrations"); //NO I18N
  integ.on("click.integrations","[data-id='data-integrations-close']", function(){
      closeDialog();
  }).on("click.integrations","[data-name='mdm-download']", function(){
      return appendDID('https://mdm.manageengine.com/free-trial.html?p=sdplus', true); //NO I18N
  }).on("click.integrations","[data-name='mdmconfiguration']", function(){
      return appendDID('/app#/admin/mobiledevicemanagerplus',true); //NO I18N
  }).on("click.integrations","[data-name='dc-download']", function(){
      return appendDID('http://www.manageengine.com/products/service-desk/desktop-central-plugin.html?sdp', true); //NO I18N
  }).on("click.integrations","[data-name='dc-configuration']", function(){
      return appendDID('/app#/admin/uemproducts',true); //NO I18N
  }).on("click.integrations","[data-id='admp-download']", function(){
    return appendDID('https://www.manageengine.com/products/ad-manager/download.html?SDPJumpTo',true); //NO I18N
  }).on("click.integrations","[data-id='adssp-download']", function(){
      return appendDID('http://www.manageengine.com/products/self-service-password/download.html?SDPJumpTo',true); //NO I18N
  }).on("click.integrations","[data-id='dc-guide']", function(){
    return appendDID('http://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/dc_sdp_integration.html?sdpi', true); //NO I18N
  }).on("click.integrations","[data-id='dc-video']", function(){
    return appendDID('http://www.manageengine.com/products/desktop-central/demo/desktop-management-videos.html?integration', true);//NO I18N
  }).on("click.integrations","[data-id='mdm-guide']", function(){
      return appendDID('http://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/dc_sdp_integration.html?sdpi', true);//NO I18N
  }).on("click.integrations","[data-id='mdm-video']", function(){
    return appendDID('http://www.manageengine.com/products/desktop-central/demo/desktop-management-videos.html?integration', true);//NO I18N
  }).on("click.integrations","[data-id='opm-integ']", function(){ //NO I18N
        appendDID('http://manageengine.com/products/service-desk/opmanager-sdp-integ.html',true);//NO I18N
  }).on("click.integrations","[data-id='mdmp-dowloadtrial']", function(){
      return appendDID('https://mdm.manageengine.com/free-trial.html?p=sdplus', true);//NO I18N
  }).on("click.integrations","[data-id='mdmp-integ']", function(){
      return appendDID('https://www.manageengine.com/mobile-device-management/help/integrations/mdm_and_servicedeskplus.html#ui_integ', true);  //NO I18N
  }).on("click.integrations","[data-id='mdmp-free']", function(){
      return appendDID('https://mdm.manageengine.com?p=sdplus', false);//NO I18N
  }).on("click.integrations","[data-id='mdmp-website']", function(){
      return appendDID('https://www.manageengine.com/mobile-device-management/help/integrations/mdm_and_servicedeskplus.html', false);//NO I18N
  });

  // Ela showHelpLayer event binding  & top header end point central and MDM event bindings
  jQuery("#top-subheader").off("click.integrations").on("click.integrations","[data-id='elahelplayer']", function(){ //No I18N
    showHelpLayer(this.dataset.type);
  }).on("click.integrations","[data-id='dcsubheadermenu']", function(){ //NO I18N
    dynamicDropdown(this,'/DCHomePage.do?operation=loadDCdropdown', '/DCHomePage.do?operation=feature&feature=');//NO I18N
  }).on("click.integrations","[data-id='mdmsubheadermenu']", function(){
    dynamicDropdown(this,'/mdmMenu.do?actionToCall=fetchMDMMenus', '/mdmpIframe.do?feature=');//NO I18N
  });
  // Event binding for SIEM server reachable banner
  jQuery("#topheader-fixed").off("click.integrations").on("click.integrations","[data-id='closeSIEMbanner']", function(){ //No I18N
      closeSIEMBanner();
  }).on("click.integrations","[data-id='siemtroubleshoot']", function(){
      openSIEMTroubleshoot();
  });
}    
function resetHeaderUserMenuFlags() {
    userIconsWidth =undefined;
    isGlobalSearchCollapsed = true;
    isGlobalSearchInitialized = false;
    isGlobalSearchAvailable = undefined;
    isHelpMenuAvailable = undefined;
    typeof headerTabs !== "undefined" && ( headerTabs = undefined ); // No I18N
}

function loadAccessPortals(){
  var op = {};
    sdpAjax({
      url: '/api/v3/accessibleportals', // No I18N
      success: function(resp) {

        op = resp;

      },
      async: false
    });
    return op;
}
function loadAllPortals(){
  var op = {};
    sdpAjax({
      url: '/api/v3/portals', // No I18N
      //SD-111362 Unable to view more than 10 instance in license tab, Application Settings, ESM Portal Customization.
      data: { input_data: sdpToJSON( {"list_info":{"sort_field":"id","row_count": sdp_app.MAX_HELPDESK_COUNT }} ) }, // No I18N
      success: function(resp) {

        op = resp;

      },
      async: false
    });
    return op;
}

function gotoESMDirectory(){
  //localStorage.setItem("_last_viewed_url_"+PORTALID, location.href.split(location.host)[1]); //No I18N
  if(isMDHSetup!="true" && sdp_user.CLIENT_CONF.is_esm_viewed!=true){
    ClientUtil.addUserPersonalization("is_esm_viewed", true); //NO I18N
  }
  let page = "home"; // No i18n
  if(reportConfigAdmin === "true" && orgAdmin === "false" ) {
		page = "performancesettings"; // No I18N
	}
  location.href = "/ESM.do?type="+page; //No I18N
}

function goBackToInstance(){
  // var backURL = localStorage.getItem("_last_viewed_url_"+PORTALID); //No I18N
  // if(document.referrer == "" || !backURL){ //No I18N
  //   backURL = "/HomePage.do"; //No I18N
  // }
  location.href="/ui/home";
}

var $fontapi = {
  fontSelect2Opt: function(opt) {//sdp_app.FONTS data converts in arrays
    var optdata = [];
    var optObj;
    jQuery.each(sdp_app.FONTS, function( index, value ) {
      if(opt) {
        if(value.name == opt.fontFamily || value.style == opt.fontFamily) {
          optObj = "fontFamily"; //No I18N
          opt[optObj] = value;
        } else if(value.style == opt.font_family || value.name == opt.font_family) {
          optObj = "font_family"; //No I18N
          opt[optObj] = value;
        }
      } else {
        optdata.push(value);
      }
    });
    return opt ? opt[optObj] : optdata;
  },
  fontSortOrder: function(data) {
    data = data.sort(function(a,b) {
      var x = a.name.toLowerCase();
      var y = b.name.toLowerCase();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    return data;
  }
};
function setThemePersonalization() {
  if(isMDHSetup && location.pathname=="/ESM.do") {
    jQuery(".themePersonalize").addClass("hide");
    return;
  }

  //Setting Admin set font family to User Personalize Default font family option name
  themeSettings = getThemeSettings();

  //header - theme settings
  var userTheme = sdp_user.CLIENT_CONF.userTheme;
  if(userTheme) {
    jQuery('#header'+userTheme.theme+'Theme').addClass('active');
    if(userTheme.fontFamily) {
    userTheme.fontFamily = $fontapi.fontSelect2Opt(userTheme);
    jQuery('#userCustomFont').select2("data",userTheme.fontFamily); //NO I18N
    userTheme.fontFamily = userTheme.fontFamily.style;
    }
  }
  if(themeSettings.allow_user_customization==false) {
    jQuery(".themePersonalize").addClass("hide");
    jQuery(".nightmodeSwitch").addClass("hide");
    jQuery('#LightnDarkModeSwitch').addClass('hide');
  }
  var layout = themeSettings.layout;
  if(sdp_app.themes && sdp_app.themes.IS_USER_THEME_ENABLED && userTheme) {
    if(userTheme.layout) {
      layout = userTheme.layout;
    }
  }

  var url = window.location.href;
  if(url.indexOf("/ESM.do") === -1 && !window.externalframe) {
		jQuery('body').attr('data-header-tabs',layout);
  }
  // Set the container width for overflow menu
  if(layout === "topbar" || layout === ""){
    jQuery("#sdp-tabs-topbar").attr("id","sdp-tabs");
    /**  
     * 130214 -- UI glitch under the header while loading the tabs in asset & CMDB modules
     * Fix: HeaderBar Module tab width was not set correctly before rendering. To handle this, we added the overflow-hidden class and removed it after the component was fully rendered.
    */
    if(jQuery("#headerlogoloadingbar").length == 1) { // NO I18N
      jQuery("#header-placeholder").addClass("oh-i");  // NO I18N
    }
  }else{
    jQuery("#sdp-tabs-sidebar").attr("id","sdp-tabs");
  }
}

function qcEventListener(){
    jQuery('#quickReqButton').off('click').on('click', (event) => { //No I18N
        return validatequickcreateform(event.currentTarget.form);
    });
    jQuery('[name="QuickCreateForm"] .close').off('click').on('click', () => { //No I18N
        hideQuickCreateMenu();
    });
    jQuery('#qc_userPopup').off('click').on('click', () => { //No I18N
        showUserSearchPopup('QuickReq', true, undefined, 'requests', null, 'requester'); //No I18N
    });
    jQuery('[name="QuickCreateForm"] .text-link').off('click').on('click', () => { //No I18N
        addMoreReqDetails();
        return false;
    })
};

function otherUIChanges(data) {
  jQuery('[name=loggedUserID]').val(data.user_details.LOGGEDIN_USERID);

  var IEver = detectIEVersion();
  if((IEver !== false)&&(IEver<=11)){
      if($header.banner.sdpBanner) {
        $header.banner.sdpBanner.addBanner({
          id: 'compatnote', // NO I18N
          content_i18n: 'common.upgradebrowser', // NO I18N
          type: 'warning', // NO I18N
          icon_class: 'sdp-glyph sdp-glyph-warning', // NO I18N
        })
      }
  }
  //To read cookie,if there is no cookie then display warning note.
  if(data.user_details.ISTECHONLINE == false && Store.getItem('techStatus',true)==null && $header.banner.sdpBanner){
    $header.banner.sdpBanner.addBanner({
      id: 'isTechAvailabilityEnabled',  // NO I18N
      type: 'info', // NO I18N
      icon_class: 'cspr info icon-sm', // NO I18N
      content_i18n: `${translate('sdp.techMarking.offlinenote')}`,
      buttons: [
        {
          btn_class: 'btn-link', // NO I18N
          content_i18n: e_html(translate('sdp.techMarking.goOnline', ['', ''])), // NO I18N
          type: 'button', // NO I18N
          action: '$header.banner.bannerCB.goOnline', // NO I18N
        },
        {
          btn_class: 'btn-link', // NO I18N
          content_i18n: 'common.close', // NO I18N
          type: 'button', // NO I18N
          action: 'close', // NO I18N
          store: { 
            key: 'techStatus', // NO I18N
            value: 'offline', // NO I18N
            days: 1,
            isCookie: true,
          }
        },
      ],
    })
  }


  if(data.is_quick_create_enabled&& typeof Ember == "undefined"){
        var url=window.location.href;
        if(url.indexOf('WorkOrder.do')===-1||url.indexOf('woMode=viewWO')!==-1){
            if(!site_details.quick_site_id) {
              //"0" represents "Not associated to anysite"
              //fix: when quick create with new requester, site is sent empty("")
              site_details.quick_site_id = "0";
            }
            // If the quick create container is present
            if(jQuery('#quick_create').length){
              renderhbs('#quick_create','quick-create-request',{ data:site_details }, false, "common", undefined, undefined, qcEventListener); // NO I18N
            }
            if(isMSPOrSCP){
            	QuickCreateRequest.initMSP();
            }
            QuickCreateRequest.init(data.is_exclude_tech);
        }
        else{
            jQuery('.qc-menu-cnt').attr('style','display:none !important');//NO I18N
        }
  }
  else{
        jQuery('.qc-menu-cnt').attr('style','display:none !important');//NO I18N
  }
  //For Dynamic Notifications
  //if(data.dynamic_notification_menu.isenabled){
  if(sdp_user.USERTYPE === 'Technician'){
      registerNotifications();
      jQuery('body').on('click', function(event) {
            if(jQuery(event.target).parents().index(jQuery('#noti-alert')) == -1) {
                if(jQuery('#notifList').is(":visible")) {
                    jQuery('#notifList').hide()
                }
                if(jQuery('#notification-wrapper').is(":visible")) {
                    jQuery('#notification-wrapper').hide()
                }
            }
      });
  }
  // For chats
  if(sdp_user.USERTYPE === 'Requester' && (data.chat_notification.isenabled || data.last_login_notify_enabled)){
  registerNotifications();
  }
  if(data.product_overview.isenabled){
      addOverviewEvents();
  }
  if(data.search_items && data.search_items.items && data.search_items.items.length){
      globalSearchItemsClickEvents();
  }

  if(sdp_user.pending_approvals_count){
    showPendingApprovalsCount(sdp_user.pending_approvals_count);
  }
  if(data.tech_notif_count){
  showDynamicNotifCount(data.tech_notif_count);
  }
  if(data.is_new_chats){
  is_new_chats_exists = true;
  }
  if(data.is_call_active){
    is_call_active = true;
  }
  initTooltip('#header-placeholder'); //NO I18N
  let is_impl_allowed = sdp_user.ROLES.includes("SDAdmin") && sdp_user.hasOwnProperty("has_impl_tour") && sdp_user.has_impl_tour && !window.location.pathname.startsWith("/ESM.do"); //No I18N
  if(jQuery(`#impl-bubble`).length == 0 && sdp_app.IS_SDP && is_impl_allowed){
    jQuery(document.body).append(`<div id="impl-bubble"></div>`);
    let $body = jQuery("#impl-bubble"); //No I18N
    $body.append(`<div id="implBubble"> <div class="adwiz-float-ic boxszbb rounded-circle icon-xl p15 cur-ptr" id="implementation_assistant" data-id="impl_bubble" title="${translate("sdp.implementation.assistant")}" rel="uitip"> <svg class="fw fh" fill="#fff"><use href="#adminwiz-float-ic"></use></svg> </div> </div>`);
    jQuery("#implementation_assistant").off("click.bubble").on("click.bubble",function(){loadImplTour();}) //NO I18N
    initTooltip("#implBubble");//NO I18N
  }

  //ESM bubble will not be loaded if there is a implementation assistant bubble;  
 if(orgAdmin=="true" && sdp_app.IS_SDP && !sdp_app.IS_MSPOrSCP && !is_impl_allowed) {  // Hinding this new feature overview section for MSP and SCP only for ESM feature as they are not applicable there
   //New Feature Overview
   init_feature_overview.init({
     title:{
       tip:translate("mdh.esm.title"),
       popup:translate("mdh.esm.title"),
        description: translate("mdh.welcome.msg")
       },
     src:translate("admin.esm.video"),//no i18n
     key:"is_esm_viewed"//No I18N
   });
 }
  if(orgAdmin=="true" && sdp_app.IS_SCP) {  // New feature overview section SCP Timesheet
    //New Feature Overview
    init_feature_overview.init({
      title:{
        tip:translate("scp.new.overview.title"),
        popup:translate("scp.new.overview.title"),
        },
      key:"is_timesheet_viewed",//No I18N
      url:"/SetUpWizard.do?forwardTo=TimesheetConfig",//No I18N
	  type:"redirect",//No I18N
	  html: function() {
    return '<div class="g-wrap g-move" id="esm-widget-videobtn" data-video-tip="open">'+
  '<div class="g-widget">'+
    '<div class="g-badge" data-message="new">'+ translate("common.new") +'</div>'+
    '<div class="g-star">'+
      '<span class="g-star1">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+ //no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
      '<span class="g-star2">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+//no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
      '<span class="g-star3">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+//no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
    '</div>'+
   '<div class="g-title"><svg x="0px" y="0px" viewBox="0 0 30 30" width="30" class="mt10">'+
		'<g>'+
		'<path style="fill:none;stroke:#FF8E00;stroke-width:1.6;stroke-miterlimit:10;" d="M15,24H3V3h18v9"></path>'+ //no i18n
		'<ellipse style="fill:none;stroke:#00B8BB;stroke-width:1.6;stroke-miterlimit:10;" cx="21" cy="19.9" rx="7.3" ry="7.2"></ellipse>'+ //no i18n
		'<path style="fill:none;stroke:#00B8BB;stroke-width:1.6;stroke-miterlimit:10;" d="M23.8,22.2L21,20.4V16"></path>'+ //no i18n
		'<line style="fill:none;stroke:#FF8E00;stroke-width:1.6;stroke-miterlimit:10;" x1="6" y1="12" x2="14" y2="12"></line>'+ //no i18n
		'<line style="fill:none;stroke:#FF8E00;stroke-width:1.6;stroke-miterlimit:10;" x1="6" y1="16" x2="12" y2="16"></line>'+ //no i18n
		'</g>'+
		'<line style="fill:#FCE9D4;stroke:#FF8E00;stroke-width:1.6;stroke-miterlimit:10;" x1="6" y1="8" x2="16" y2="8"></line>'+ //no i18n
		'</svg>'+
		'<span class="disp-ib fw">'+translate("scp.new.overview.title")+'</span>'+
	'</div>'+
  '</div>'+
'</div>'+
'<div id="preview_div" style="display: none;">'+
  '<div class="freezeLayer pos-fix fh" style="z-index: 100;"></div>'+
  '<div class="pos-fix top0 rlc-diagram-anim">'+
      '<div class="widget-bg" style="height: auto;">'+
          '<div class="widget-header p10">'+
            '<span class="h3 m0">'+translate("scp.new.overview.title")+'</span>'+
            '<button class="btn btn-link fr pos-rel top-5 ml10" id="digCloseBtn" title="'+translate("ae.loginpage.closeanddontshow.password")+'" data-video-tip="close">'+//no i18n
              '<span class="dig-close-btn right0"></span>'+
            '</button>'+
            //'<button type="button" class="btn btn-primary btn-sm fr pos-rel top-5" data-video-tip="configure">'+option.title.configure+'</button>'+//no i18n
          '</div>'+
          '<div class="widget-panel p0" style="height: auto;">'+
            '<iframe width="100%" height="520" src="about:blank" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'+
          '</div>'+
      '</div>'+
  '</div>'+
'</div>';}
    });
  }
  //Server Restart Notification
    if(sdp_user.ROLES.includes("SDAdmin")){
          if(data.ssl!=undefined && data.ssl.is_server_to_be_restarted)
          {
                jQuery('#serverRestartNotification').show();
          }
          else
          {
                jQuery('#serverRestartNotification').hide();
          }
          if(data.ssl!=undefined && data.ssl.is_renewal_message_to_be_displayed)
          {
                var importsslLink = '<a class="btn-link" href="/SetUpWizard.do?forwardTo=importssl">';
                if(location.pathname == "/ESM.do") {
                  importsslLink = '<a class="btn-link" href="/ESM.do?type=importssl">';
                }
                if(data.ssl.days_left_for_expiry <= 0)
                {
                  jQuery('#sslRenewalNotification .msg').html(translate('sslimport.ssl_expired_notif', [importsslLink]));
                }
                else
                {
                  jQuery('#sslRenewalNotification .msg').html(translate('sslimport.ssl_renewal_notif', [data.ssl.days_left_for_expiry, importsslLink]));
                }
                jQuery('#sslRenewalNotification').show();
          }
          else
          {
                jQuery('#sslRenewalNotification').hide();
          }
    }
    if(typeof Ember == "undefined" && sdp_app.IS_SDP){
     $se.page_scripts.render("all_page"); // Need to execute in last line
    }
}

function globalSearchItemsClickEvents() {
  //Code for Ember
  jQuery('#globalSearchItems li.search-menu-item>a').on('click', function(e) {
      selectedSearchItem(jQuery(this).attr('data-name'),jQuery(this).attr('data-id'));
  });
  //Code for Ember

  jQuery('#globalSearchItems .sdmenu-dd>li>a').on('click', function(e) {
    if(jQuery(this).parent().attr('id')!=='global_advsearch'){
      e.preventDefault();
      selectedSubModSearchItem(e.target.parentElement, false);
    }
  });
}

// Mark selected search item in the global search list
// arg1: Name of the list item [string]
function selectedSearchItem(name, id){
  jQuery('[name=selectName]').val(id);
  jQuery('#globalSearchItems>li, #globalSearchItems .sdmenu-dd>li').removeClass('selected');//NO I18N
  jQuery('[data-id="'+id+'"]').addClass('selected');//NO I18N

  if(id === "requests" || id === "arcrequests") {
    if(sdp_user.USERTYPE === 'Technician') {
      //107689 -- Static option("request id") personalized in search event, now check/change to option to personalized one or static
      var opt = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.req_search) ? "[data-skey='"+sdp_user.CLIENT_CONF.req_search.search_keyword+"']" : "[name='"+window.translate('sdp.requests.common.requestid')+"']";//NO I18N
      var default_subitem = jQuery('[data-id="'+id+'"]').find(opt)[0];
      selectedSubModSearchItem(default_subitem, !!(sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.req_search));
    }
  }
  else if(id === "solutions") {
      // Mark selected search item in the global search list for solution module
      var opt = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.sol_search) ? "[data-skey='"+sdp_user.CLIENT_CONF.sol_search.search_keyword+"']" : "[name='"+window.translate('sdp.admin.requestdefault.search')+"']";//NO I18N
      var default_subitem = jQuery('[data-id="'+id+'"]').find(opt)[0];
      selectedSubModSearchItem(default_subitem, !!(sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.sol_search));
  }
  jQuery("#SearchSelectedModule").text(name);
}

// Mark selected search sub item in the global search list
// arg1: Name of the list sub item [string]
function selectedSubModSearchItem(element, skip_personalization_call) {
  element = jQuery(element);
  var name = element.attr('name');
  var id = element.attr('data-i18');
  var key = element.attr('data-skey');

  jQuery('[name=subModSelText]').val(key);
  jQuery('#globalSearchItems>li .sdmenu-dd>li').removeClass('selected');//NO I18N
  element.addClass('selected');//NO I18N
  var parentName = element.parents('li').eq(0).attr('data-id');//NO I18N
  if(jQuery('[name=selectName]').val() !== parentName){
    jQuery('[name=selectName]').val(parentName);
    jQuery('#globalSearchItems>li').removeClass('selected');//NO I18N
    jQuery('[data-id="' + parentName + '"]').addClass('selected');//NO I18N
  }
  //Unwanted personalization calls are made, So skipping unless it is user action. Fixed as a part of SD-107674
  if(parentName === "requests" && !skip_personalization_call) {
    var s_data = {};
    s_data.search_keyword =  key;
    ClientUtil.addUserPersonalization('req_search', s_data)//NO I18N
  }
  else if(parentName === "solutions" && !skip_personalization_call) {
  // Mark selected search sub item in the global search list for solution module
    var s_data = {};
    s_data.search_keyword =  key;
    ClientUtil.addUserPersonalization('sol_search', s_data)//NO I18N
  }
  jQuery("#SearchSelectedModule").text(jQuery("li[data-id="+parentName+"]").attr('name'));
}

/*
  To set a selection of module on SPA for global search
*/
function setGSearchSelectedModuleOnSPA(currentPageId){
    var globalSearchSettings  = {
        "requests" : { // NO I18N
            "name" : translate('sdp.requests.common.requests'), // NO I18N
            "id" : "requests" // NO I18N
        },
        "releases":{ // NO I18N
            "name" : translate('admin.module.releases'), // NO I18N
            "id" : "releases" // NO I18N
        },
        "problems":{ // NO I18N
            "name" : translate('sdp.header.problems'), // NO I18N
            "id" : "problems" // NO I18N
        },
        "spaces":{ // NO I18N
            "name" : translate('sdp.header.spaces'), // NO I18N
            "id" : "spaces" // NO I18N
        },
        "maintenances":{ // NO I18N
            "name" : translate('common.maintenance'), // NO I18N
            "id" : "maintenances" // NO I18N
        },
        "solutions":{ // NO I18N
          "name" : translate("sdp.header.solutions"), // NO I18N
          "id" : "solutions" // NO I18N
        },
        "projects":{// NO I18N
          "name": translate("sdp.header.projects"),// NO I18N
          "id": "projects"// NO I18N
        },
        "support":{// NO I18N
          "name": translate("sdp.header.systemlog"),// NO I18N
          "id": "support"// NO I18N
        },
        "assets":{// NO I18N
          "name": translate("sdp.header.inventory"),// NO I18N
          "id": "assets"// NO I18N
        },
        "asset_computer":{// NO I18N
          "name": translate("sdp.admin.dcconfig.workstationtitle"),// NO I18N
          "id": "asset_computer"// NO I18N
        }
    }
    var gsetObject = "";
    if(currentPageId.indexOf("request") != -1){ // NO I18N
        gsetObject = globalSearchSettings.requests;
    }else if(currentPageId.indexOf("release") != -1){ // NO I18N
        gsetObject = globalSearchSettings.releases;
    }else if(currentPageId.indexOf("problem") != -1){ // NO I18N
      gsetObject = globalSearchSettings.problems;
    }else if(currentPageId.indexOf("space") != -1){ // NO I18N
        gsetObject = globalSearchSettings.spaces;
    }else if(currentPageId.indexOf("maintenance") != -1){ // NO I18N
        gsetObject = globalSearchSettings.maintenances;
    }else if(currentPageId.indexOf("solution") != -1){  // NO I18N
        gsetObject = globalSearchSettings.solutions;
    }else if(currentPageId.indexOf("projects") != -1){  // NO I18N
        gsetObject = globalSearchSettings.projects;
    }
    else if(currentPageId.indexOf("support") != -1){  // NO I18N
      gsetObject = globalSearchSettings.support;
    }
    else if(currentPageId.indexOf("assets") != -1 || window.location.href.indexOf("ui/asset")!=-1){  // NO I18N
      var url = window.location.href.replace(window.location.origin,'');
      var urlParams = new URLSearchParams(window.location.search);
      var getModuleName = urlParams.get("module");
      var getMetaData = assetsObj && assetsObj.assetModTemplateData && assetsObj.assetModTemplateData.metaDataWithoutId && assetsObj.assetModTemplateData.metaDataWithoutId[getModuleName];
      getMetaData = getMetaData ? getMetaData : null;
      var getHierarchy = getMetaData && assetsObj && assetsObj.isComputerHierarchy(getMetaData.hierarchy);
      var current_tab='assets';//NO I18N
      if(url.indexOf('/ui/asset')>-1){
        if(getHierarchy){
          current_tab='asset_computer';//NO I18N
        }
      }
      gsetObject = current_tab && globalSearchSettings[current_tab];
    }
    if(gsetObject){
        selectedSearchItem(gsetObject.name, gsetObject.id);
    }
}

function isEmptyArray(argArray){
  var array=argArray[0];
  if(array.length<=0){
    return true;
  }
  return false;
}


function preLogout() {
    Store.removeCookie("username"); // No I18N
    Store.removeCookie("password"); // No I18N
    Store.removeCookie('techStatus'); // No I18N
    window.location = window.externalframe ? "/jsp/Logout.jsp?externalframe=true" : "/jsp/Logout.jsp"; // No I18N
    }

function samlLogout()
{
  window.location.href="/SamlLogoutRequestServlet"; //NO I18N
}

function checkUserRole(role) {
  if(parent.sdp_user.ROLES.indexOf(role) > -1) {
    return true;
  } else {
    return false;
  }
}

// FROM validation.js
function trimAll(str)
{
  /*************************************************************
  Input Parameter :str
  Purpose         : remove all white spaces in front and back of string
  Return          : str without white spaces
  ***************************************************************/

  if(!str)
  {
    return "";
  }
  //check for all spaces
  var objRegExp =/^(\s*)$/;
  if (objRegExp.test(str))
  {
    str = str.replace(objRegExp,'');
    if (str.length == 0) {
      return str;
    }
  }

  // check for leading and trailling spaces
  objRegExp = /^(\s*)([\W\w]*)(\b\s*$)/;
  if(objRegExp.test(str))
  {
    str = str.replace(objRegExp, '$2');//No I18N
  }
  return str;
}

function isEmpty(str)
{
  /*************************************************************
  input    : str
  purpose  : To check if empty
  output   : if empty true or false
  ***************************************************************/

  var temp = trimAll(str);
  if (temp.length > 0 ) {
    return false;
  }
  return true;
}

// From FormValidation.js
function isNumeric(str, formElement){
    var objRegExp = /^[0-9]+$/;
    if(objRegExp.test(str)){
        return true;
    }
    return false;
}

// FROM SDPCalendar.js
function reloadTechCalendar() {
    var month = parent.TechCal_Month; // No I18N
    var year = parent.TechCal_Year; // No I18N
    window.frames.SDPHeaderFrame.location.href = "/calendar/TechCalendar.jsp?month=" + month + "&year=" + year ; // No I18N

    //As re-assigning of frame is happening we need to reassign the ajax.
    if(document.getElementById("SiteList1_siteSearch") != null) {
        // A time delay of 1 sec is given for the ajax assignation.
        setTimeout(function() {
          setAjaxWithTimeOut();
        }, 1000); // No I18N
    }
    //closeDialog();
}

// FROM Request.js
function validateGotoReqID()
{
  if(jQuery('#_DIALOG_CONTENT').find('#searchReq').val()!=null)
    {
      var searchReqid = trimAll(document.getElementById('searchReq').value);
    }
    else
    {
      var searchReqid = trimAll(document.getElementById('searchReqid').value);
    }
  if(isEmpty(searchReqid))
  {
    alert(translate('sdp.mobileclient.search.emptystr.error'));//NO I18N
    document.getElementById('searchReqid').trigger('focus');
    return false;
  }
  if(!isNumeric(searchReqid))
  {
    alert(translate('sdp.mobileclient.search.nonnumeric.error'));//NO I18N
    document.getElementById('searchReqid').trigger('focus');
    return false;
  }
  /*if(window.req_details) {
    $req.details.navigateWO(searchReqid);
  } else {*/
    window.location.href ="/WorkOrder.do?woMode=viewWO&woID="+searchReqid;
  //}
  return true;
}

function validateGotoReqIDonEnterKey(event)
{
  key = getEventKey(event);
  if(key == 13)
  {
    validateGotoReqID();
  }
  return false;
}
//this method has to be moved to eventhandling methods.
function getEventKey(evt) {
  if(window.event) { // IE
    getEventKey = function(evt) {
      return window.event.keyCode;
    }
  }
  else { // Mozilla
    getEventKey = function(evt) {
      return evt.which;
    }
  }
  return getEventKey(evt);
}

// FROM common.js
function getContentWidth(content){
  var width = (7*content.length)+50;
  if (width < 250){
    width = 250;
  } else if (width > 550){
    width = 550;
  }
  return width;
}

//cwf start
//showOperationStatus moved from OperationStatus.jspf
function showOperationalStatus(messageString, imageClass, imageSrc, styleClass, width, timeout){
                if(typeof Ember == "undefined") {
                  var holder = parent.jQuery('#alert-holder');

                  var B = parent.document.body;
                  var D = parent.document.documentElement;
                  var dheight;
                  var dwidth;

                  dheight = window.innerHeight || parent.document.body.clientHeight;

                  dwidth = window.innerWidth || parent.document.body.clientWidth;

                  parent.jQuery('#alert-container').find('#operationstatus-table').attr('class', '');
                  parent.jQuery('#alert-container').find('#statusimg').attr('class','');
                  parent.jQuery('#alert-container').find('#statusimg').attr('src','images/spacer.gif');
                  parent.jQuery('#alert-container').find('#infobboxmsg').empty();
                  parent.jQuery('#alert-holder').empty();

                  parent.jQuery('#operationstatus-table').attr('width',width);
                  parent.jQuery('#operationstatus-table').attr('class',styleClass);

                  if(imageClass != null && imageClass != undefined){      parent.jQuery('#statusimg').attr('class',imageClass);           }
      if(imageSrc != null && imageSrc != undefined){          parent.jQuery('#statusimg').attr('src',imageSrc);               }

                  parent.jQuery('#infobboxmsg').html(messageString);
                  parent.jQuery('#infobboxmsg').addClass('wrapcontent');

                  var leftPosition = (parseInt(dwidth/2)-80)+jQuery(document).find('body').scrollLeft();
                  var topPosition = (parseInt(dheight/2)-60)+jQuery(document).find('body').scrollTop();

                  holder.css({ position:'absolute', left: leftPosition+'px', top: topPosition+'px' });//No I18N

                  holder.html(parent.jQuery('#alert-container').html()).stop(true, true).show();  //NO I18N
                  holder.html(parent.jQuery('#alert-container').html()).stop(true, true); //NO I18N

                  if(timeout != null && timeout != undefined){            holder.fadeOut(timeout);                }
              } else {
                  var status = "info"; //NO I18N
                  if(styleClass == "successbox") { //NO I18N
                    status = "success"; //NO I18N
                  }
                  showalert(status, messageString, 'isAutoHide=true'); //NO I18N
              }
        }

function getTranslation(stringKey,argsArray) {
  if(typeof Ember == "undefined") {
    return translate(stringKey,argsArray);
  } else {
    return translate(stringKey,argsArray);
  }
}


function getUrlParameterByName(name, url) {
    if (!url) { url = window.location.href };
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) { return null };
    if (!results[2]) { return '' };
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function openUrlInParent(url) {
  if(!opener.window.location.origin) {
    opener.window.location.origin = opener.window.location.protocol + "//" + opener.window.location.hostname + (opener.window.location.port ? ':' + opener.window.location.port : '');
  }
  var link = opener.window.location.origin + url;
  opener.window.location.href = link;
  window.close();
}
function loadTaskDependency(module, stageId, entityid, isDependencyEditable, grandParentId,ownerId) {
  var url = "/tasks/TaskDependencyTreeView.jsp?mode=view&module=" + module //NO I18N
  if(entityid) {  url += '&entityid=' + entityid; }   //NO I18N
  if(stageId) { url += '&stageId=' + stageId; }   //NO I18N
  if(isDependencyEditable){ url += '&isEditable=' + isDependencyEditable; } //NO I18N
  if(grandParentId){  url += '&grandParentId=' + grandParentId; }    //NO I18N
  if(ownerId){    url += '&ownerId=' + ownerId; }   //NO I18N
  var html = "";
  sdpAjax({
    type: "GET",   // NO I18N
    url: url,
    async: false,
    dataType: "html", //No I18N
    success : function(res){
      html= res;
      jQuery('html, body').animate({scrollTop: 0}, 800);
    }
  });
  html = "<div class='td-tree-view pos-abs top0 fw left0' style='z-index:99'>"+html+"</div>";
  jQuery("body").append(html);
  jQuery("body").addClass("of-h");
  jQuery('#td-helpcard').load("/html/admin_helpcard_task_dependencies.html"); //No I18N
  setTimeout(function(){
    initTooltip("#tree-container"); //No I18N
  },1000)
}

function trimContent(str){
    if(str !==null && str.length > 50){
      str = str.substring(0, 49) + "...";
    }
    return str;
  }

//Code for Quick Create Menu starts here
QuickCreateRequest={
	initMSP: function(){
		setUpQuickCreateForMSP(site_details);
        return null;
    },
    init: function(is_exclude_tech) {
        var addLoggedInTech = true;
        if(isSCP && is_exclude_tech) {
          addLoggedInTech = false;
        }
        /**
        * This prevent Quick Section closes, when input focus
        */
        jQuery("#quick_create").closest(".showmenu").on("click",function (e) {  // NO I18N
          e.stopPropagation();
        });

        var allow_new_requester = false;
        if(sdp_user.ROLES.indexOf("CreateRequester") > -1){
          allow_new_requester = true;
        }

        //SD-108864: Initialised new ZEditor for Quick Create Request Description.
        zeditor({
          element: "qc_desc",//No i18n
          content: "",//No i18n
          toolbar: "toolbarOrderComments",//No i18n
          customName: "qc_desc_editor",//No i18n
          avoidMoreOption: true
        });

        jQuery('#ze_qc_desc .ze_area').css({"min-width":"220px","resize":"both","overflow":"hidden"}); // No I18N

        var parameter = {
            isAPI:true,
            tooltip:true,
            showAll: [ "email_id", "department","employee_id","name", "is_vipuser" ],   //No I18N
            url:"/api/v3/requests/requester", // NO I18N
            entity_name:"requester", // NO I18N
            criteriaCallback: $req.common.requesterCriteriaCallback,
            element:jQuery('#qc_reqSearch'), // no i18n
              placeHolder:translate("sdp.admin.requesterList.searchWord"),
            multiple : false,
            value : null,
            formatSearching: window.translate("ae.common.search.text"),
            taggingNeeded: allow_new_requester,
            excludeTech: is_exclude_tech,
              addLoggedInTech: addLoggedInTech,
            siteFilterBehaviour: "SDP_Request", //NO I18N
            searchOptions: $req.common.getRequesterSearchOptions(),
        };

        if (window.isMSP) {
            parameter.fromModule = "MSP_Request";	//No I18N
            parameter.showAll.push("account");
            var paramUrl = parameter.url;
            parameter.url = function(){ return paramUrl + "?ACCOUNTID=" + getQuickCreateAccountId(); };  // no i18n
        }
        if(window.isSCP) {
            parameter.showAll.push("account");
        }
        userSelect.initializeSelect2(parameter);
        //initializing site ajax select2 field if site field is made to load dynamically
        if(site_details.is_site_enabled){
        	var defaultTextKey = "sdp.admin.technician.addtechnician.nosite"; // no i18n
			if(isMSP){
				defaultTextKey = "common.site.placeholder"; // no i18n
			}
        	//SD-105342
			$req.common.initializeSiteSelect2({
				selector:'#qc_siteID_siteSearch', //No I18N
				url: '/api/v3/requests/site', //No I18N
				selectedData:{'id':-1, 'text':translate(defaultTextKey)},
				modifyResults:false,
				onChangeCallback : function(value){jQuery('#qc_siteID').val(value) }
			});

            jQuery('#qc_reqSearch').on('change', function() {
                var site_not_associated = -1 /* By default, -1 is the value for the option "Not associated to any site" */
                var selected_user = jQuery('#qc_reqSearch').select2('data');//No I18N
                if(selected_user == null) {
                    if(jQuery('#qc_siteID_siteSearch').length > 0) {
                    	if(isMSPOrSCP)
                    	{
                            clearQCAccountandSite();
                    	}
                    	else
                		{
							jQuery('#qc_siteID_siteSearch').select2('data',  {'id':site_not_associated, 'text':translate("sdp.admin.technician.addtechnician.nosite")});
						}
                    }
                    jQuery("#qc_requesterID").val("");
                    return;
                }
                var selected_username = selected_user.name;
                var selected_userid = selected_user.id;
                //SD-70255 when new requester name is typed, names comes in user id
                if(isNumeric(selected_userid)) {
                  jQuery("#qc_requesterID").val(selected_userid);
                }
                else {
                  jQuery("#qc_requesterID").val("");
                }

                sdpAjax({
                    url: '/api/v3/users/'+selected_userid, //No I18N
                    type: 'GET',//NO i18N
                    ignorefailuremessage: true,
                    success: function(res) {
                        var siteid, sitename;
                        data = res.user;
                        if(data && data.department && data.department.site) {
                            siteid = data.department.site.id;
                            sitename = data.department.site.name;
                        }
                        if(isMSPOrSCP && data.account.id!='null' && QuickCreateForm.qc_accountID.value!=data.account.id) //user belongs to a different account than the one already selected
						{
                      		jQuery('#qc_accountID').select2('data', {'id':data.account.id, 'text':data.account.name});//NO i18N
                            if (isMSP) {
                                $req.common.initializeSiteSelect2({
                                    selector: '#qc_siteID_siteSearch', //No I18N
                                    url: '/api/v3/requests/site?ACCOUNTID=' + data.account.id, //No I18N
                                    selectedData: { 'id': -1, 'text': translate(defaultTextKey) }, //No I18N
                                    modifyResults: false,
                                    onChangeCallback: function (value) { jQuery('#qc_siteID').val(value) }
                                });
                            }
						}
                        if(!siteid) {
                            siteid = site_not_associated;
                            sitename = translate("sdp.admin.technician.addtechnician.nosite");
                        }
                        if(jQuery('#qc_siteID_siteSearch').length > 0) {
                            jQuery('#qc_siteID_siteSearch').select2('data', {'id':siteid, 'text':sitename});//NO i18N
                            jQuery('#qc_siteID').val(siteid);
                        }
                    }
                });
            });
        } else {
            jQuery('#qc_reqSearch').on('change', function() {
                var selected_user = jQuery('#qc_reqSearch').select2('data');//No I18N
                if(selected_user) {
                  var selected_userid = selected_user.id;
                  var selected_username = selected_user.name;
                  //SD-70255 when new requester name is typed, names comes in user id
                  if(isNumeric(selected_userid)) {
                    jQuery("#qc_requesterID").val(selected_userid);
                  }
                  else {
                    jQuery("#qc_requesterID").val("");
                  }
                  if(isSCP){
                    var userDetailsUrl = '/servlet/AJaxServlet?action=getUserDetails&reqId='+selected_userid+'&search='+encodeURIComponent(selected_username); //No I18N
                    var accountId = 0;
                    if(jQuery("#qc_accountID").select2('data') != null) {
                        if(jQuery('#qc_accountID').select2('data').isTag != undefined && jQuery('#qc_accountID').select2('data').isTag) { // if new Account, accountId is sent as -1
                            accountId = "-1";
                        } else {
                            accountId = jQuery("#qc_accountID").select2('data').id;    //No i18N
                        }
                    }
                    userDetailsUrl = userDetailsUrl + "&accountId=" + accountId;  //No i18N
                  	sdpAjax({
                  		url: userDetailsUrl,
                      ignorefailuremessage: true,
                  		dataType: "text",   //No i18N
                  		type: 'GET',//NO i18N
                  		success: function(data) {
                  			data = data.replace(/(['"])?([a-z0-9A-Z_]+)\s?(['"])?:/g, '"$2": ');
                  			data = JSON.parse(data);
                  			if(QuickCreateForm.qc_accountID.value!=data.USER_ACCOUNTID) //user belongs to a different account than the one already selected
                  			{
                  				if(data.USER_ACCOUNTID!='null') {
                            jQuery('#qc_accountID').select2('data', {'id':data.USER_ACCOUNTID, 'text':data.USER_ACCOUNTNAME});  //NO i18N
                          } else if(data.USER_USERID && data.USER_USERID != null) { // when new Requester is selected, the Account field can still have the already selected value
                            jQuery('#qc_accountID').val("");
                            setNotInAccount('qc_accountID');  // no i18n
                          }
                  			}
                  		}
                  	});
                  }
                }
            });
        }
    },
    setField:function(id, name){
      jQuery('#qc_reqSearch').select2('data',{'id':id, 'name':name}).trigger('change');//NO i18N
    }
};

function hideQuickCreateMenu(){
    jQuery('.qc-menu-cnt').removeClass('open').attr('display','none');//NO I18N
}
// Used In : Request Quick Create
function addMoreReqDetails(optionalData) {
    var jqBody = jQuery("body"); 
    var requester = jqBody.find("#qc_reqSearch").select2("data");    //No I18N
    var site = jqBody.find("#qc_siteID_siteSearch").length ? jqBody.find("#qc_siteID_siteSearch").select2("data") : null; //No I18N
    var title = document.QuickCreateForm.qc_title.value;
    //SD-108864 : Description was loaded from the ZEditor.
    var description = parent.qc_desc_editor.getHTML();

    var quickCreateData = {};
    if(title) {
        quickCreateData.subject = title;
    }
    if(description) {
        quickCreateData.description = {
            content: description
        };
    }
    if(requester && requester.id && requester.name) {
        var req_obj = requester.name;
        //This is for New Requesters. For New Requesters, we need to pass as an object to form component.
        if( !parseInt(requester.id, 10) || requester.id === requester.name || window.isMSP ){
          // setting ID and name in requester details all the time for MSP as MSP doesn't use API based component in requester field of request and also can't search by name and identify user
          req_obj = {'id': requester.id + "",  'name': requester.name };  //No I18N
        }
        quickCreateData.requester =req_obj;
    }

    if(site) {
        quickCreateData.site = {
            id: site.id,
            name: site.text
        };
    }
  //passing space data to request form
  var templateid=undefined;
  var fromSpace=undefined;
  try{
    if(optionalData&&optionalData.space){
      quickCreateData.space=optionalData.space;
    }
    if(optionalData&&optionalData.cmdb){
      quickCreateData = optionalData.cmdb;
      $req.form.fromCMDB = true;
    }
    if(optionalData&&optionalData.template){
      templateid=optionalData.template;
    }
		if(optionalData&&optionalData.fromSpace){
			fromSpace="fromSpace="+optionalData.fromSpace;//No I18N
		}
	}
	catch(e){
  }
    const opts = {freeze_index: 90};//SD-115131 fix
    $RFPreview.show(undefined, true, undefined, quickCreateData,templateid,fromSpace, opts);
    /** Clear the qucik create form data */
    jqBody.find("#qc_reqSearch").val(null).trigger('change');
    if(jqBody.find("#qc_siteID_siteSearch").length){
      jqBody.find("#qc_siteID_siteSearch").val(null).trigger('change');
    }
    document.QuickCreateForm.qc_title.value ="";
    parent.qc_desc_editor.setHTML("");
    hideQuickCreateMenu();
}
function updateQCFormFieldNames(){
    //removing qc_ from all fields of QuickCreateForm to submit form since server side has same code for QuickCreateForm and WorkOrderForm
    jQuery(QuickCreateForm).find('[name^=qc_]').each(function(){
            var name=jQuery(this).attr('name');
            name=name.replace('qc_','');
            jQuery(this).attr('name',name);
    });
}
function validatequickcreateform(qcForm) {
    disableFormButton(qcForm);
    if(trim(qcForm.qc_reqName.value)==="") {
        alert(translate("sdp.leftpanel.quickcreate.askreqname"));
        enableFormButton(qcForm);
        qcForm.qc_reqName.focus();
        return false;
    }
    if(trim(qcForm.qc_title.value)=="") {
        alert(translate("sdp.leftpanel.quickcreate.askreqtitle"));
        enableFormButton(qcForm);
        qcForm.qc_title.focus();
        return false;
    }
    if(isMSP)
	{
		if(trim(qcForm.qc_siteID.value)==="0") {
			alert(translate("sdp.msp.selectSite.error"));
			enableFormButton(qcForm);
			qcForm.qc_siteID.focus();
			return false;
		}
		if(trim(qcForm.qc_accountID.value)==="-1") {
			alert(translate("sdp.msp.selectAccount.error"));
			enableFormButton(qcForm);
			qcForm.qc_siteID.focus();
			return false;
		}
	}
    //SD-108864 : Description was loaded from the ZEditor.
    var desc = parent.qc_desc_editor.getHTML();
    qcForm.qc_description.value = desc;
    document.getElementById('qc_reqSearch').value  = jQuery('#qc_reqSearch').select2('data').name;//NO I18N
    var str = document.getElementById('qc_reqSearch').value.trim();
    var requestFrom="Request";//No I18N
    var url="/servlet/AJaxServlet?action=checkUser&requestFrom="+requestFrom+"&search="+encodeURIComponent(str); //NO I18N
    if(isSCP){
    	accountId = 0;
      if(jQuery("#qc_accountID").select2('data') != null) {
          if(jQuery('#qc_accountID').select2('data').isTag != undefined && jQuery('#qc_accountID').select2('data').isTag) {
              accountId = "-1"; // if new Account, accountId is sent as -1
          } else {
              accountId = jQuery("#qc_accountID").select2('data').id; //No i18N
          }
      }
      url = url + '&accountId='+accountId;  // No i18n
    }else if(isMSP){
		url = url + "&siteId=" + qcForm.qc_siteID.value + '&persistentAccountId='+qcForm.qc_accountID.value + '&persistAccountID=' + false; //NO I18N
	}
    sdpAjax({
        type:"GET",//NO I18N
        async:false,
        url:url,
        success:function(response){
            var data = response;
            var inSite=null;
            if(data && data.USER_PRESENT == 'true') {
                /* ----Enabling Site Field in Request Template Form----- */
                /* ----Enabling Site Field code starts------ */
                //Technician can create a request on behalf of requester irrespective of his site
                var sitVal=null;
                if(trim(qcForm.qc_name) == "WorkOrderForm") {
                    sitVal = qcForm.qc_templateSite.value;
                }
                // data.IN_SITE check need not be done for SCP
                if(data.IN_SITE == 'true'|| (sitVal != null && sitVal != "null") || isSCP) { //No I18N
                    /* ----Enabling Site Field code ends------ */
                    //submit has been commented out because form submission happens without completing fieldcheck fully
                    //instead, a variable called inSite is defined and is set to true. Before submission, its value is checked to see if its true
                    inSite=true;
                }
                else {
                    alert(translate("sdp.request.add.error.notinsite"));
                    enableFormButton(qcForm);
                    qcForm.qc_reqName.focus();
                }
            }
            else {
                var checksDone = false; // boolean to indicate whether needed checks have already been done. Written for SCP
                if(isSCP) { // handling validation alerts for creating new Account in Request Quick Create
                    accountElement = jQuery("#qc_accountID");
                    if(accountElement.length > 0 && accountElement.select2('data') != null) {
                        // if account element exists and it being select2 and its value is not empty (not associated to any account)
                        var accountExists = true;
                        if(accountElement.select2('data').isTag != undefined && accountElement.select2('data').isTag) {
                            // to check whether an account is present in the name. Even when isTag is true i.e. for new option doing this check, as select2 doesn't trim and choose the option
                            var accountName = accountElement.select2('data').name.trim(); //No I18N
                            accountExists = accountExistsInName(accountName);
                        }
                        if(!accountExists) {
                            if(data.ADD_ACCOUNT == "true" && data.ADD_REQUESTER == 'true') {
                                qcForm.qc_accountID.value = ""; // for new account, when qc_accountID is passed as account name, it is stopped by security XML. (creation of new account in server code is still not done, to be done when moved to API based implementation)
                                if(confirmSubmit(translate("scp.alert.add.contact.and.account"))) {
                                    inSite = true;
                                } else {
                                    enableFormButton(qcForm);
                                    qcForm.qc_reqName.focus();
                                }
                                checksDone = true;
                            } else if(data.ADD_ACCOUNT != "true") {
                                alert(translate("scp.account.not.exist"));
                                enableFormButton(qcForm);
                                qcForm.qc_accountID.focus();
                                checksDone = true;
                            }
                        }
                    }
                }
                if(!(isSCP && checksDone)) {  // checks only for SCP and will always hold true for others.
                if(data.ADD_REQUESTER == 'true'){
                    var alertMsg = translate("sdp.leftpanel.quickcreate.askreqvalidname");
                    if(confirmSubmit(alertMsg)) {
                            //SD-58797 form gets submitted before description is set to the form
                            inSite=true;
                    }
                    else {
                        enableFormButton(qcForm);
                        qcForm.qc_reqName.focus();
                    }
                }
                else {
                    alert(translate("sdp.requests.requester.not.exist"));
                    enableFormButton(qcForm);
                    qcForm.qc_reqName.focus();
                }
            }
            }
            if(inSite){
                updateQCFormFieldNames();
                qcForm.submit();
            }
            return false;
        }
    });
}
//Code for Quick Create Menu ends here

//Global search submit
function submitGlobalSearch() {
  var searchText=jQuery("#subheader_search_box").val(); //No I18N
  var selectName = jQuery("input[name=selectName]").val();//No I18N
  var subModSelText = jQuery('[name=subModSelText]').val();//No I18N
  if(subModSelText=='') {

    if(sdp_app.IS_MSPOrSCP && !jQuery('[data-id="global_search"]').length) //No I18N
    {
      /* Since the searchacross option removed from global search for MSP/SCP , changing the subModSelText selector */

      if(jQuery('#globalSearchItems>li').eq(0).hasClass('selected')&&jQuery('#globalSearchItems>li').eq(0).find('ul').length) {
        subModSelText=jQuery('#globalSearchItems > li').eq(0).find('ul').find('li.selected').attr('data-skey');
      }
    }
    else
    {
      if(jQuery('#globalSearchItems>li').eq(1).hasClass('selected')&&jQuery('#globalSearchItems>li').eq(1).find('ul').length) {
        subModSelText=jQuery('#globalSearchItems > li').eq(1).find('ul').find('li.selected').attr('data-skey');
      }
    }
  }
  if(sdp_user.USERTYPE === 'Requester' && jQuery('#globalSearchItems > li.selected').attr("data-id") === "requests"){
    if(searchText.match(/^\d+$/)){
      window.location.href="/SearchN.do?searchText="+encodeURIComponent(searchText)+"&subModSelText="+encodeURIComponent(subModSelText)+"&selectName="+encodeURIComponent(selectName);
    }
    else {
      if(searchText === ""){
        alert(translate("sdp.common.header.searchvaluemsg")); //No I18N
      }
      else{
        alert(translate("sdp.mobileclient.search.nonnumeric.error"));
      }
      return false;
    }
  }
  if(searchText===''){
    alert(translate("sdp.common.header.searchvaluemsg"));//No I18N
    return false;
  }else if(selectName == "releases"){//No I18N
    window.location.href="/ui/releases?mode=get&gsearch="+encodeURIComponent(searchText);//No I18N
  }else if(selectName == "spaces"){//No I18N
    $spa.navigate('/ui/space?mode=list&module=space&gsearch='+encodeURIComponent(searchText),'spaces','spaces-list');//No I18N
    $header.searchBar('close'); //No I18N
  }else if(selectName == "problems" ){//No I18N
    $spa.navigate('/ui/problems?mode=list&gsearch='+encodeURIComponent(searchText),'problems');//No I18N
    $header.searchBar('close'); //No I18N
  }else if(selectName == "solutions"){//No I18N
    window.location.href="/ui/"+selectName+"?mode=list&gsearch="+encodeURIComponent(searchText);//No I18N
  }else if(selectName == "maintenances"){//No I18N
    $spa.navigate('/ui/maintenances?mode=list&gsearch='+encodeURIComponent(searchText),'maintenances','maintenances-list');//No I18N
    $header.searchBar('close'); //No I18N
  }
  else if(selectName == "assets"){//No I18N
    window.location.href="/ui/asset?module=asset_assets&gsearch="+encodeURIComponent(searchText);//No I18N
  }
  else if(selectName == "asset_computer"){
    window.location.href="/ui/asset?module=asset_computers&gsearch="+encodeURIComponent(searchText);//No I18N
  }
  else if(selectName == "purchase"){//No I18N
    window.location.href="/PurchaseOrderList.do?gsearch="+encodeURIComponent(searchText);//No I18N
  }else if(selectName == "projects"){//No I18N
      window.location.href="/ui/projects?mode=list&gsearch="+encodeURIComponent(searchText);//No I18N
  }
  else if(selectName =="support"){//No I18N
    window.location.href="/app#/support/systemlogs?gsearch="+encodeURIComponent(searchText);//No I18N
  }
  else if(selectName =="software"){//No I18N
      window.localStorage.search_text = searchText;
      window.location.href="/SoftwareListView.do?searchText="+encodeURIComponent(searchText);//No I18N
    }
  else if (selectName == "assets" || selectName == "workstation") {
    const module = selectName == "assets" ? "assets" : "workstations";     //No I18N
    window.location.href = "/Assets.do?module="+module+"&searchText="+encodeURIComponent(searchText)+"&mode=get";
  } else if(selectName == "cis"){//No I18N
      window.location.href="/ui/cmdb_module?ci_type=cmdb&mode=list&gsearch="+encodeURIComponent(searchText);//No I18N
  }
  else{
    window.location.href="/SearchN.do?searchText="+encodeURIComponent(searchText)+"&subModSelText="+encodeURIComponent(subModSelText)+"&selectName="+encodeURIComponent(selectName);
  }
  return false;
}

var $extFrame = {
  /**
   * // function name => setOptions
   * // to set externalframe url to an anchor tag
   * // for this to work custom data attribute 'data-externalframe' must be set to either 'true' or 'false'
   *
   * Example 1: <a href="/ui/home" data-externalframe="true"></a>  becomes <a href="/ui/home?externalframe=true" data-externalframe="true"></a>
   *
   * Example 2: <a href="/ui/home" data-externalframe="false"></a>  becomes <a href="/ui/home" data-externalframe="false" target="_blank"></a>
   *
   * @returns - void
  */
  setOptions: function(selector) {
    if(window.externalframe) {
      let $ele = selector ? jQuery(selector).find('[data-externalframe]') : jQuery('[data-externalframe]');
      $ele.each(function(e) {
        let $this = jQuery(this);
        const relAttr = $this.attr('rel');
        let relAttrVal = "";
        if($this.data("externalframe") && $this.attr('href')) {
          /****/
          let url = new URL(this.href);
          if(url.search && url.search != ""){
            if(url.search.indexOf("externalframe") == -1) {
              url.search += "&externalframe=true";//No I18N
            }
          } else {
            url.search += "?externalframe=true";//No I18N
          }
          this.href = url;
          //if anchor tag doesn't have 'rel' attribute and opens in same window, then append rel="noopener"
          relAttrVal = 'noopener';//No I18N
        } else {
          $this.attr("target", "_blank");
          //if anchor tag doesn't have 'rel' attribute and opens in new window, then append rel="noopener noreferrer"
          relAttrVal = 'noopener noreferrer';//No I18N
        }

        if((typeof relAttr == 'undefined' || relAttr === false) && relAttrVal != "") {
          $this.attr('rel', relAttrVal);
        }
      });
    }
  },
  /**
   * // function name => getActiveWindow
   * function to get the window object when sdp is loaded in iframe
   * this function can be used when we load sdp inside an iframe of another application
   *
   * @param {string} url
   * @returns window object
  */
  getActiveWindow: function(url, opt) {
    url = url ? url : parent.location.href;
    if(url) {
      if(!url.includes('externalframe=true')) return window.top;
    }
    let ele = window.frameElement;
    let doc = ele ? ele.ownerDocument : document;
    let win = doc.defaultView || doc.parentWindow;
    if(opt) {
      let parentEle = win.frameElement;
      if(opt.getParentFrame) {
        return parentEle;
      }
      if(opt.getParentWindow) {
        let parentDoc = parentEle.ownerDocument;
        return (parentDoc.defaultView || parentDoc.parentWindow);
      }
    }
    return win;
  }
};

jQuery(document).ready(function() {
  /**
   * SD - 110367
   * when enter key is clicked to select the options/suggestions displayed, it is directly initiating the search.
   * We have changed this to avoid that.
   */
  jQuery(document).on('keydown', "#subheader_search_box", function (e) { //No I18N
      if (e.keyCode === 13) {
          submitGlobalSearch();
      }
      else if(e.keyCode === 27) {
          $header.searchBar('close'); //No I18N
      }
  });
  if(!(isMDHSetup && location.pathname=="/ESM.do")) {
    applyBrowserTitle();
  }
  //Close side panel when click personalize, change password, etc..
  jQuery("#profile-slider a").on('click', function() {
    const targetId = jQuery(this).data('target-id'); //NO I18N
    if(typeof targetId == "undefined"){ //NO I18N
      jQuery("#close-profile-slider").click();
    }
    if(jQuery("#notificationTones").hasClass('ui-dialog-content'))
    {
    jQuery("#notificationTones").dialog("close");//No I18N
    // jQuery("#customize_tabs").dialog("close");//No I18N
    }
    if(jQuery("#customize_tabs").hasClass('ui-dialog-content'))
    {
    jQuery("#customize_tabs").dialog("close");//No I18N
    }
    $landing.closeDialogCheck();
  });

  //Show last login banner popup
  if (window.sdp_app) {
    showLastLoginBanner.init(sdp_app.NOTIFY_LAST_LOGIN_TIME, true);
    // SD-129312
    if(window.sdp_app.IS_SDP && window.sdp_app.zia_info.IS_BOT_ENABLED){
      if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.indexOf('SSP') != -1){
        setTimeout(function(){
          var selector = jQuery('.helptour');
          selector.find(".skip").off("click.popup_zia").on("click.popup_zia", function() { // No I18N
            // Since the tours popup loads only on first login (HomePage.do), use IS_REQR_ZIA_CHAT_POPUP_ENABLED instead of CAN_POPUP_ZIA_CHAT, which returns false in this case.
            ziac.popupZiaChatOnRequesterLogin(sdp_app.zia_info.IS_REQR_ZIA_CHAT_POPUP_ENABLED, 50);
          });
        },100);
      } else {
        ziac.popupZiaChatOnRequesterLogin(sdp_app.zia_info.CAN_POPUP_ZIA_CHAT, 1500);
      }
    }
  }
  commonAccessibilities.skipToMainContent();
});

function updateNotificationCountInBrowserTitle(count, title) {
  notificationsCount = count;
  if(title) {
    browserTitleText = title;
  }
  else if(browserTitleText!="") {
    title = browserTitleText;
  }
  else {
    title = sdp_app.PRODUCT_NAME;
  }
  if(count) {
    document.title = "("+count+") "+title;  //No I18N;
  }
  else {
    document.title=title;
  }
}

function applyBrowserTitle() {
  var selectedTab = jQuery("#sdp-tabs .active a").attr('id');
  if(!selectedTab && jQuery("#admin-hi").parent().hasClass("active")) {
    selectedTab = "admin"; //NO I18N
  }
  var pageType = jQuery("#browserTitleInfo").data("page"); //NO I18N
  var pageTitle="";
  var id="", subject="";
  var titleData = sdp_app.themes.browser_title ? jQuery.extend({}, sdp_app.themes.browser_title) : undefined;
  if(titleData && selectedTab) {

    if(titleData.selectedtab=='selected_module_name') {
      if(pageType=="createNewPage") {
        var newPageTitle = {"requests": "common.req.newrequest", "problems": "sdp.problem.listview.newproblem", "changes": "sdp.change.listview.newchange", "spaces":"common.space.new","projects": "sdp.project.form.newproject", "purchase": "admin.browsertitle.new.purchase", "cmdb": "admin.browsertitle.new.cmdb", "assets": "sdp.inventory.breadcrumb.newasset", "contracts": "sdp.contract.listView.addNew", "solutions": "sdp.solutions.newsolution.newsolution"};  //NO I18N
        if(checkIfMSPOrSCP()){
          newPageTitle["accounts"]="sdp.admin.account.listview.addAccount"; // NO I18N
        }
        pageTitle = translate(newPageTitle[selectedTab]);
      }
      else {
        var tabName = jQuery("#sdp-tabs .active a").attr("tab-name");
        if(!tabName) {
          tabName = jQuery("#admin-hi").attr("tab-name");
        }
        if(tabName) {
          pageTitle = tabName;
        }
      }
    }
    else {
      pageTitle = sdp_app.PRODUCT_NAME;
    }

    if(pageType=="detailsPage" || pageType=='editPage') {
      var detailsPageData = titleData.detailsPage[selectedTab];
      if(detailsPageData &&  detailsPageData.enabled) {
        pageTitle = detailsPageData.title;
        if(pageType=="detailsPage") {
          if(['problems', 'changes', 'assets', 'cmdb', 'contracts', 'solutions',"releases","spaces","maintenances"].indexOf(selectedTab)!=-1) {
            id = jQuery("#bt_id").text();
            subject = jQuery("#bt_title").text();
          }
          else if(selectedTab=='requests') {
            id = $req.details.request_info.id;
            subject = $req.details.request_info.subject;
            if('archive'==jQuery("#browserTitleInfo").data("submodule")) {
              id = jQuery("#bt_id").text();
              subject = jQuery("#bt_title").text();
            }
          }
          else if(selectedTab=='projects') {
            subject = jQuery('#tempDisp_title').text();
          }
          else if(selectedTab=='purchase') {
            id = jQuery("#PRID,#POID").text();
            subject = jQuery("#PRNAME,#PONAME").text();
          }
          else if(checkIfMSPOrSCP() && selectedTab=='accounts'){
            id = jQuery("#bt_id").text();
            subject = jQuery("#bt_accountname").text();
          }
        }
        else if(pageType=='editPage') {
          if(['problems', 'changes', 'assets', 'cmdb', 'solutions' ,'purchase','releases','spaces','maintenances'].indexOf(selectedTab)!=-1) {
            id = jQuery("#bt_id").text();
            subject = jQuery("#bt_title").text();
            if('PR'==jQuery("#browserTitleInfo").data("submodule")) {
              subject = jQuery("#subject").val();
            }
          }
          else if(selectedTab=='requests') {
            id = jQuery("input[name=workOrderID]").val();
            subject = jQuery("#subject").val();
          }
          else if(selectedTab=='contracts') {
            id = jQuery("#custContractID").val();
            subject = jQuery("#contractName").val();
          }
        }
      }
    }

    //replacing variables and setting the title
    if(pageTitle) {
      if(id && ['requests', 'problems', 'changes', 'contracts', 'purchase', 'solutions', 'releases', 'assets', 'cmdb','spaces','maintenances'].indexOf(selectedTab)!=-1) {
        pageTitle = pageTitle.replace("$id", id);
      }
      else if(id && checkIfMSPOrSCP() && selectedTab=='accounts'){
        pageTitle = pageTitle.replace("$id", id);
      }
      if(subject) {
        if(['requests', 'problems', 'changes', 'contracts', 'purchase'].indexOf(selectedTab)!=-1) {
          pageTitle = pageTitle.replace("$subject", subject);
        }
        if(selectedTab=='projects' || selectedTab=='solutions' || selectedTab == 'releases'|| selectedTab == 'spaces'|| selectedTab == 'maintenances') {
          pageTitle = pageTitle.replace("$title", subject);
        }
        else if(selectedTab=='assets') {
          pageTitle = pageTitle.replace("$assetname", subject);
        }
        else if(selectedTab=='cmdb') {
          pageTitle = pageTitle.replaceAll(/\$(assetname|ciname)/g, subject);
        }
        else if(checkIfMSPOrSCP() && selectedTab=='accounts'){
          pageTitle = pageTitle.replace("$accountname", subject);
        }
      }
      updateNotificationCountInBrowserTitle(notificationsCount, pageTitle);
    }
  }
}

function openDCTroubleshoot(isAssetBuild) {
  window.open("/app#/admin/uemproducts", "width=600,height=600,scrollbars=yes,resizable=no");
}

function openSIEMTroubleshoot() {
  window.open("/app#/admin/eventloganalyzer", "width=600,height=600,scrollbars=yes,resizable=no,'noopener'");
}

function closeSIEMBanner(){
  jQuery('#seim_down_msg').hide();
}

/* function copied from CRCCheck.js */
function trim(str)
{
  if(str!==undefined)
  {
    return str.replace(/^\s*|\s*$/g, "");
  }
}
//In tags request list view poup when try to view details page error is thrown. sdp_app is not loaded in that case. So added parent.sdp_app.isMSPOrSCP check.
if(((typeof sdp_app != "undefined" && sdp_app.IS_MSPOrSCP) || parent.sdp_app.IS_MSPOrSCP)) {
/*All Account select to*/
jQuery( document ).ready(function() {
	if(jQuery("#__persistentAccountId__select").is("select")){
		jQuery("#__persistentAccountId__select").select2({width:'200px'});//NO I18N
	}
	if(jQuery("#dummyChild")){
		jQuery("#dummyChild").select2({width:'200px'});//NO I18N
	}
});
}

function closeWindow(){
  window.close();
}
/* function copied from CRCCheck.js */

/* function to change unread status to read status for only account locked notification */
function markAsRead(moduleId){
   sdpAjax({
       type: 'PUT', //NO I18N
       url: '/api/v3/user_notifications/'+moduleId + '/_mark_as_read', //NO I18N
   });
}


/* function to change notification redirect url for only account locked notification */
function showAccountLockedDetails(is_account_locked, isread, moduleId, notifId){
   if( !is_account_locked ) {
        showURLInDialog('/jsp/lockeduserdetails.jsp?lockid='+moduleId, 'modal=yes, closeButton=no, width=900, closeOnBodyClick=yes', function() {//NO I18N
            if(typeof Ember != "undefined") {
                jQuery("#_DIALOG_LAYER").css("background", "none");//NO I18N
            }
        });//NO I18N

   }
   else {
      NewWindow('/jsp/lockeduserdetails.jsp?lockid='+moduleId, 'lockeduserdetails', '1200', '700', 'no', 'top');//NO I18N
   }
   if(!isread) {
      markAsRead(notifId);
   }
}

function showRestrictedNotificationAlert()
{
  showalert('warning', translate("mdh.bell.notification.other.than.production.mode.msg"), 'isAutoHide=false');//NO I18N
}

//functions for user profile picture

/*
  Function to toggle the (edit/delete) options on Profile Picture
*/
function showProfilePicOptions(){
  var ProImg = jQuery('.prp-circle-lx img.userPrImg').hasClass('hide');   //No I18N
  if (ProImg==false){
    toggleProfilePicOptions();
  }
}

function toggleProfilePicOptions(){
  jQuery("#editDelProPic, .prp-circle-lx span.fadeIcon").toggleClass('hide'); //No I18N
}

function openFilePic(){
 jQuery('#profilepic').trigger('click'); //No I18N
}

/*
  Function to add a new Profile Picture
*/
function saveProfilePic(){
  setTimeout(function(){
    jQuery('.uitooltip-track').remove();
  },1);
  var profilePic = jQuery('#profilepic').val();
  if(!profilePic){
    return false;
  }
  if(profilePic.indexOf('"')>0){
    showalert("failure", translate("profilepic.invalid.filename"), "isAutoHide=true"); // No I18N
    jQuery("#profilepic").val("");  // No I18N
    return false;
  }
  var profilepic_img = document.getElementById("profilepic").files[0];   // No I18N
  var validFormats = new Array("jpg", "jpeg", "png", "bmp"); //No I18N

  //Image file type validation
  var extension = profilePic.substring(profilePic.lastIndexOf('.') + 1).toLowerCase(); // No I18N
  var validFileBool = false;
  for(var i=0; i<validFormats.length; i++){
    if(validFormats[i] == extension){
      validFileBool = true;
      break;
    }
  }
  if(!validFileBool){ // No I18N
    showalert("failure", translate("profilepic.invalidImageFileType"), "isAutoHide=true");  // No I18N
    jQuery("#profilepic").val("");  // No I18N
    return false;
  }
  //image size validation
  if(profilepic_img.size > 5242880){
    showalert("failure", translate("profilepic.imageSizeExceed"), "isAutoHide=true"); // No I18N
    jQuery("#profilepic").val("");  // No I18N
    return false;
  }

  //to get userid -> sdp_user.LOGGEDIN_USERID
  var userId = sdp_user.LOGGEDIN_USERID;
  var formdata = new FormData();
  formdata.append("input_image", profilepic_img);  //No I18N
  var entityName = forwardfrom == "ESM" ? "orgusers" : "users"; // No I18N
  sdpAjax({
    processData: false,
    contentType: false,
    type: "put", // No I18N
    url: "/api/v3/" + entityName +"/" + userId + "/images", // No I18N
    data: formdata,
    beforeSend: function(){
      jQuery('#alertbox').remove(); //No I18N
      showalert("info", translate("profilepic.uploading"), "isAutoHide=false"); // No I18N
    },
    success:function(response){
      jQuery('#alertbox').remove();
      if(response.response_status.status === "success"){ // No I18N
        showalert("success", translate("profilepic.uploadedMessage"), "isAutoHide=true");   // No I18N

        jQuery('#prIconUpdated, .prp-circle-lx').removeClass('hide');  //No I18N
        jQuery('#prIcon, #uploadUserPrImg').addClass('hide'); //No I18N
        var d = new Date();
        var url = response.media["content-url"];// No I18N
        jQuery('#prIconUpdated > img').removeAttr("src").attr("src", url);// No I18N
        jQuery('#userPrImg').removeAttr("src").attr("src", url);// No I18N
          if(jQuery(".user-button").val()!=undefined){
            jQuery("#prOnlineStatus").addClass('btn-success'); //No I18N
          }else{
            jQuery("#prOnlineStatus").removeClass('btn-success'); //No I18N
          }
      } else {
        showalert("failure", translate("profilepic.errorOccurred"), "isAutoHide=true"); // No I18N
      }
      jQuery("#profilepic").val("");  // No I18N
    },
    error:function(errormessage){
      jQuery('#alertbox').remove();
      var errormsg=JSON.parse(errormessage.responseText).response_status.messages[0].message;
      if(errormsg === "INVALID_FILE_EXTENSION")
      {
        showalert("failure", translate("sdp.security.invalid.extension"), "isAutoHide=true"); // No I18N
      }
      else if(errormsg === "UNMATCHED_FILE_CONTENT_TYPE")
      {
        showalert("failure", translate("sdp.security.invalid.contenttype"), "isAutoHide=true"); // No I18N
      }
      else if(errormsg === "FILE_SIZE_MORE_THAN_ALLOWED_SIZE")
      {
        showalert("failure", translate("sdp.common.maxattach.message","5"), "isAutoHide=true"); // No I18N
      }
      else if(errormsg === "EMPTY_FILE_NOT_ALLOWED")
      {
        showalert("failure", translate("sdp.common.minattach.message"), "isAutoHide=true"); // No I18N
      }
      else
      {
        showalert("failure", errormsg, "isAutoHide=true"); //SD-76175 // No I18N
      }
    }
  });


  return true;
}

/*
  Function to delete the existing Profile Picture
*/
function deleteProfilePic(){
  setTimeout(function(){
    jQuery('.uitooltip-track').remove();
  },1);

  if(!window.confirm(window.translate("profilepic.delete.confirm"))){ //NO I18N
  return false;
  }
  var entityName = forwardfrom == "ESM" ? "orgusers" : "users"; // No I18N
  sdpAjax({
    type: 'DELETE',//NO I18N
//    url must be like /api/v3/users/(id)/profile_images for delete operation. Slicing url until api/v3/users/id/ and appending profile_images in url
    url: jQuery("[user-profile-pic-img]").prop("src").match(".+?\/[0-9]+\/")[0]+'_profile_images', // No I18N
    async: true,
    success: function(response){
      jQuery('#alertbox').remove();
      if(response.response_status.status === "success"){  // No I18N
        jQuery('#prIconUpdated, .prp-circle-lx').addClass('hide');  //No I18N
        jQuery('#prIcon, #uploadUserPrImg').removeClass('hide');  //No I18N
        showalert("success", translate("profilepic.deleteMessage"), "isAutoHide=true"); // No I18N
      }else {
          showalert("failure", translate("profilepic.deleteMessageError"), "isAutoHide=true"); // No I18N
      }
      jQuery("#profilepic").val("");  // No I18N
    },
    error: function(response) {
      showalert("failure", ZSEC.Encoder.encodeForHTML(response.responseJSON.response_status.messages[0].message), "isAutoHide=true"); // No I18N
    }
  });
}


/*
To set technician availability status.
*/
function setTechStatus(status) {
    var Url = appendTimestamp('/api/v3/availability_status'); //No I18N
    var tempAjax = sdpAjax({
        url: Url,
        type: 'put', //No I18N
        async: false,
        data: {'input_data': '{  "availability_status": {  "status": { "id": "' + status + '"  },  "comments": "default"  } }'}, //No i18n
        success: function (resp) {
        if(status==2){
        Store.setItem({key:"techStatus",value: "offline",days:1,isCookie:true}); // NO I18N
        }
        else{
          jQuery('#offlinenote').hide();
        }
        },
        error: function (xhr, ajaxOptions, thrownError) {
          alert('The status is not set properly');//No I18N
        }
    })
  }


function onOfflineChange()
{
  var checkvalue  = jQuery( 'input[name=userOnOffStatus]:checked' ).closest( 'label' ).text(),//No I18N
      onlinevalue = jQuery( '#userOnStatus' ).find( 'label:first' ).text();
  if( checkvalue == onlinevalue ){
      jQuery( '#prOnlineStatus' ).addClass( 'btn-success' ); //No I18N
  }
  else{
      jQuery( '#prOnlineStatus' ).removeClass( 'btn-success' ); //No I18N
  }

}

function updateTechStatus(event){
    var isOnlineChecked=jQuery('#online:checked').length;
    if(isOnlineChecked != undefined){
      if(event){
        if(isOnlineChecked == 0){
          setTechStatus(1); //To mark it online
        }else if(isOnlineChecked == 1){
          setTechStatus(2); //To mark it Offline
        }
      }
      else{ //This block is due to Difference in ui-component behavior in ember and non ember page
        if(isOnlineChecked == 0){
          setTechStatus(2); //To mark it offline
        }else if(isOnlineChecked == 1){
          setTechStatus(1); //To mark it Online
        }
      }
    }

    setTimeout(function(){
      onOfflineChange();
    },1);

    if(event){
      event.preventDefault();
    }

}
/**
   @description Appends the current timestamp to the url. Avoids GET url's from being cached .
 */
function appendTimestamp(url) {

       var tm=new Date().getTime();
       if(url.indexOf("?") > 0) {
           url = url + "&tm=";    // No i18n
       }
       else {
           url = url + "?tm=";    // No i18n
       }
       url = url + tm;
       return url;
}

/* Sticky Code Start */
var $sticky_notes = {
  sticky_editor: null,
  id: null,
  eventInitialized: false,

  loadEditor: function() {
    zeditor({
      element: "sticky_content",//No i18n
      content: "",//No i18n
      toolbar: "toolbarOrderNotes",//No i18n
      customName: "sticky_editor",//No i18n
      buttonsToHide: ["spellcheckwithoutdropdown"],//No i18n
      avoidMoreOption: true
    });
    jQuery(sticky_editor.outerdiv).css({"resize":"both","overflow":"hidden"}); // No I18N
  },

  load: function() {
    var obj = jQuery('#sticky_dialog');
    if(obj.is(":visible") && obj.hasClass("ui-dialog-content")) { //No I18N
      return;
    }
    obj.dialog({
      autoOpen: false,
      close: function() {
        /** Empties the content before destroying */
        jQuery(this).empty().html("<div id='sticky_content'></div>"); //No I18N
        /** Destroys the jQuery dialog on closing, as it could create problem when we try to destroy all the jQuery dialogs from elsewhere in the application  */
        jQuery(this).dialog().dialog("destroy");  //No I18N
      }
    });
    $sticky_notes.loadEditor();
    sdpAjax({
      url: "/api/v3/sticky_notes",//No i18N
      type: "GET", //No i18N
      cache: false,
      dataType: "json",//NO I18N
      async: false,
      success: function(data){
        var len = data.sticky_notes.length;
        var sticky_properties = {'height':'400','width':'500','left':'600','top':'190'}; //No i18N
        if(len > 0){
          var sticky = data.sticky_notes[0];
          $sticky_notes.id = sticky.id;
          sticky_properties = JSON.parse(sticky.properties);
          if(sticky_editor != null){
            sticky_editor.setContent(sticky.content||" ",true);
          }
        }
        obj.find('.ze_area').css({"height":sticky_properties.height+'px',"width":sticky_properties.width+'px',"min-width":"500px", "min-height": "400px" });//No i18N
        obj.dialog({minWidth: 500, minHeight: 400 ,"height": sticky_properties.height, "width": sticky_properties.width});//No i18N
        obj.dialog( "open" );//No i18N
        jQuery(obj[0].previousElementSibling).css({'padding':'5px',"border":"none"});//No i18N
        obj.parent().css({"margin-right":"auto","top":jQuery("#header-placeholder").height()+'px'}).end().css({"overflow":"hidden" ,"height":"auto"});  //No i18N
        obj.on("dialogbeforeclose", function( event, ui ) {
          $sticky_notes.update();
        });
        jQuery(".ui-resizable").resizable({
          alsoResize: "#sticky_dialog .ze_area"//No i18N
        });
        obj.find('.ze_area').resizable();
        if(!$sticky_notes.eventInitialized) {
          window.onbeforeunload = function(e){
            if(obj.hasClass("ui-dialog-content") && obj.dialog( "isOpen" )) {
              $sticky_notes.update();
            }
          }
          jQuery( window ).on('resize', function() {
            if(obj.hasClass("ui-dialog-content")) {
              obj.dialog("option","height","auto" );//No i18N
              obj.dialog("option","width",obj.find('.ze_area').css('width') );//No i18N
            }
          });
          $sticky_notes.eventInitialized = true;
        }
        obj.trigger('resize');
        if(sticky_editor.doc) {
          sticky_editor.doc.body.trigger('focus');
        }
      }
    });
  },
  update : function(){
    var content = ' ';
    if(sticky_editor.getContent().trim()){
      content = sticky_editor.getContent().trim();
    }
    var obj = jQuery('#sticky_dialog').parent();
    var top=this.getProperty(obj,'top');//No i18N
    if(top > 900){top= 900;}
    var left=this.getProperty(obj,'left'); //No i18N
    var height=parent.jQuery(sticky_editor.iframe).css('height').replace("px","");//No i18N
    var width=this.getProperty(obj,'width');//No i18N
    var propertyJSON={'top':top,'left':left,'height':height,'width':width};//No i18N
    var url = "/api/v3/sticky_notes"; //No i18N
    var type = "POST"; //No i18N
    if(this.id!=null){
      url = url + "/" + this.id;
      type = "PUT"; //No i18N
    }
    var inp_data = {"sticky_note":{"title":"default title","content":content,"properties":propertyJSON}};//No i18N
      sdpAjax({
          url: url,
          type: type,
          data : {"input_data" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(inp_data) : JSON.stringify(inp_data) }, //No i18N
          headers: {
              'Accept' : 'application/vnd.manageengine.v3+json'  // No I18N
          },
          success: function(data) {
             //showalert('success', translate("api.saved.success", [translate("notes.title")]), "isAutoHide=true"); // No I18N
          },
          error: function (request, textStatus, errorThrown){
              showalert('failure', JSON.parse(request.responseText).response_status.messages[0].message, "isAutoHide=true"); // No I18N
          }

      });
      jQuery('#sticky_dialog').off("dialogbeforeclose"); //No i18N
  },
  getProperty : function(obj,property){
    return obj.css(property).replace(/[^-\d\.]/g, '');
  }
};
/* Sticky Code Ends*/

// Below method is related to AMS renewal and update

function validateAMSCCEmail()
{
  if(jQuery('#company').val() == "" || jQuery('#mail').val() == "")
  {
    alert(translate("sdp.support.reportissue.mandatoryalert"));
    return false;
  }
  var valid;
  var mail = jQuery("#mail").val();
  var mailArr = mail.split(',');
  for(var k=0; k<mailArr.length; k++)
  {
    mailArr[k] = mailArr[k].trim();
    var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(mailArr[k].length > 0 )
    {
      valid = emailRegEx.test(mailArr[k]);
    }
    if(!valid)
    {
      alert(translate("sdp.ams.email.invalid"));
      return false;
    }
  }
  return true;
}

function sendMailForRenewal(btn,type)
{
  if(validateAMSCCEmail())
  {
    jQuery(btn).button('loading');
    jQuery("#amsrequestform").find("input, select, button, textarea").prop("disabled",true);//NO I18N
    var mail = document.getElementById("mail").value;
    var notes = encodeURIComponent(document.getElementById("notes").value);
    var success = false;
    jQuery.ajax({
      async: true,
      url: "/servlet/AJaxServlet?action=sendAMSRenewalMail&mail="+mail+"&notes="+notes+"&type="+type,//NO I18N
      type: "POST",//NO I18N
      success: function( data ) {
        amsResponseFn(data);
      }
    });
  }
}

function amsResponseFn(data) {
  closeDialog();
  var successmsg;
  if("success" == data)
  {
    successmsg = translate("sdp.ams.success");
    window.showalert('success',successmsg,'isAutoHide=true,delay=3,width=auto'); //NO I18N
    jQuery('#amsband').trigger('click');
  }
  else if("Not Authorized" == data)
  {
    successmsg = translate("sdp.common.operation.autherror");
    window.showalert('failure',successmsg,'isAutoHide=true,delay=3,width=auto'); //NO I18N
  }
  else
  {
    successmsg = translate("sdp.ams.failure");
    window.showalert('failure',successmsg,'isAutoHide=true,delay=3,width=auto'); //NO I18N
  }
}

/**
 * Aligns the header by making it responsive to the browser window
 */
function alignHeader() {
  var headerTabs;
  if(jQuery("#sdp-tabs").length > 0) {
    initHeaderResp();
    initSubHeaderResp();
  }
  jQuery(window).on('resize', function(event) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      /* Header Tabs Responsiveness */
      if(jQuery("#sdp-tabs").length > 0) {
        /* Subheader responsiveness */
        resizeSubHeader();
      }

      /* Request Details Tabs responsiveness */
      if(typeof woTabs !== "undefined") {
        woTabs.handleTabs();
      }
    }, 100);
  });
}

/**
 * Initializes the responsiveness for the Header
 */
 function initHeaderResp() {
    windowScrollResize("onpageload"); //No I18N
    // window.headerTabs = new ResponsiveTabs('#sdp-tabs');  //No I18N

    /* search collapsed button click fn */
    jD.find('#dd-searchbox button.sdmenu-toggle').off('click').on('click',function(){ //No I18N
        jD.find('.dd-searchanim').toggleClass('dd-searchanimation'); // No I18N
        setTimeout(function(){
            jD.find('.dd-searchanim input').trigger('focus'); // No I18N
        },20);
        if(jD.find('.dd-searchanim').hasClass('dd-searchanimation')){
            jD.find('body').append('<div id="FreezeLayer_search" class="FreezeLayer_search"></div>'); // No I18N
            jD.find('#FreezeLayer_search').css({'position':'fixed', 'top':'0px', 'width':'100%' ,'height':'100%', 'background-color':'#000000', 'opacity':'0.4', 'z-index':'99'}); // No I18N
        } else {
            jD.find('#FreezeLayer_search').remove();  // No I18N
        }
    });

    /* closes the search popup on clicking the freeze layer */
    jQuery(document).on( 'click' ,'#FreezeLayer_search' , function( event ){
        jD.find('.dd-searchanim').removeClass('dd-searchanimation'); // No I18N
        jD.find('#FreezeLayer_search').remove();  // No I18N
    });
 }

/*
 * Initializes the responsiveness for the sub header
 */
function initSubHeaderResp() {
    if(jQuery("#subHeaderEnd").length==0) {
        return;
    }
    var module_tabs = jD.find('#sdp-tabs'); // No I18N
    var jW = jQuery(window).width();
    if(module_tabs.length === 0) {
        return;
    }
    if((jW - jQuery("#subHeaderEnd").offset().left) < 1) {
        collapseSubHeader();
    }
}

/*
 * checks for the collapse / expand tabs inside the subheader
 */
function resizeSubHeader() {

    var module_tabs = jD.find('#sdp-tabs'); // No I18N
    var jW = jQuery(window).width();
    if(module_tabs.length === 0) {
        return;
    }
    var subheader_width = jD.find('#subheader-holder').width();  // No I18N
    if((jW - subheader_width) < 1) {
        collapseSubHeader();
    } else if ((jW - subheader_width) >150) {
        expandSubHeader();
    }
}

/*
 * collapses tabs one by one in subheader
 */
function collapseSubHeader() {
    if(!subh_icon_collapsed) {
        // Recent items changes
        var recent_items_el = jD.find('#subheader-recent-items');  // No I18N
        if(recent_items_el.length > 0) {
            recent_items_el.detach().appendTo('.group-menu'); // No I18N
            recent_items_el.find('> button').find('[data-name=recentItemclear]').hide(); // No I18N
            recent_items_el.find('> button').attr('title', translate("common.recentitems"));
        }

        // Sticky notes Btn changes
        var noti_alert_el = jD.find('#sticky-notes');  // No I18N
        if(noti_alert_el.length > 0) {
          noti_alert_el.detach().appendTo('.group-menu'); // No I18N
          noti_alert_el.find('> button').removeAttr('class').addClass('btn btn-sm btn-default pb1');  // No I18N
          noti_alert_el.find('> button > span:first').removeAttr('class').addClass('cspr scriblepad'); // No I18N
        }

        subh_icon_collapsed = true;
        jD.find('#subheader-group-menu').removeClass('headerbtn-hide');  // No I18N
    }
    // Tabs
    var subh_show_menu = jD.find('#subheader-show-menu');  // No I18N
    var subh_more_tabs = jD.find('#subheader-more-tabs');  // No I18N
    var subh_holder = jD.find('#subheader-holder');  // No I18N
    var jW = jQuery(window).width();
    /* Practically loopRestrictor variable is of no use. As the while loop depends on DOM operations, it is difficult to say whether the force reflow has happened already.
     * Hence the extra check is added to ensure it is never running in infinite loop
     */
    var loopRestrictor = 0;
    while((jW - subh_holder.width()) < 1) {
        if(subh_show_menu.find('> div.toggle-tab:visible:first').length > 0) {
            subh_more_tabs.prepend('<li>'+subh_show_menu.find('> div.toggle-tab:visible:last').find('div').html()+'</li>').find('li:first > a').removeAttr('class'); // No I18N
            subh_more_tabs.parent().removeClass('headerbtn-hide');  // No I18N
            subh_show_menu.find('> div.toggle-tab:visible:last').addClass('headerbtn-hide');
        } else {
            break;
        }
        if(loopRestrictor > 5) {  /* The number of tabs to be hidden won't be more than 5 */
          break;
        }
        loopRestrictor++;
    }
    if(subh_show_menu.find('> div.toggle-tab:visible').length == 0) {
        subh_show_menu.addClass('headerbtn-hide'); // No I18N
    }
}

/*
 * restores tabs one by one in subheader
 */
function expandSubHeader(expandAll) {
    var subh_holder = jD.find('#subheader-holder');  // No I18N
    var jW = jQuery(window).width();
    if(subh_holder.length === 0) {
        return;
    }
    var subh_more_tabs = jD.find('#subheader-more-tabs');  // No I18N
    /* Practically loopRestrictor variable is of no use. As the while loop depends on DOM operations, it is difficult to say whether the force reflow has happened already.
     * Hence the extra check is added to ensure it is never running in infinite loop
     */
    var loopRestrictor = 0;
    while(expandAll ||(jW - subh_holder.width()) > 150) {
        if(subh_more_tabs.find('> li:first').length > 0) {
            subh_more_tabs.find('> li:first').remove();  // No I18N
            subh_holder.find('#subheader-show-menu div:not(:visible):first').removeClass('headerbtn-hide');  // No I18N
            subh_holder.find('#subheader-show-menu').removeClass('headerbtn-hide'); // No I18N
        } else {
            break;
        }
        if(loopRestrictor > 5) {  /* The number of tabs to be hidden won't be more than 5 */
          break;
        }
        loopRestrictor++;
    }
    if(expandAll || subh_more_tabs.find('> li:first').length == 0) {
        subh_more_tabs.parent().addClass('headerbtn-hide');  // No I18N
    }

    if((((jW - subh_holder.width()) > 150) && subh_icon_collapsed) || expandAll) {
        // Recent items changes
        var recent_items_el = jD.find('#subheader-recent-items');  // No I18N
        if(recent_items_el.length > 0) {
            recent_items_el.detach().appendTo('.show-menu');  // No I18N
            recent_items_el.find('> button').find('[data-name=recentItemclear]').show(); // No I18N
            recent_items_el.find('> button').attr('title', '');
        }

        // Sticky notes Btn changes
        var noti_alert_el = jD.find('#sticky-notes');  // No I18N
        if(noti_alert_el.length > 0) {
            noti_alert_el.detach().appendTo('.show-menu');  // No I18N
            noti_alert_el.find('> button').removeAttr('class').addClass('btn btn-link');  // No I18N
            noti_alert_el.find('> button > span:first').removeAttr('class').addClass('cspr scriblepad icon-lg'); // No I18N
        }
        subh_icon_collapsed = false;
        jD.find('#subheader-group-menu').addClass('headerbtn-hide');  // No I18N
    }
}
function setMarkAssigntoggle(markAssignBtn){
    if(jQuery("#"+markAssignBtn+"Button").hasClass('toggle-btn1-off')){
        jQuery("#MarkButton,#AssignButton").toggleClass('toggle-btn1-off toggle-btn1-on'); //No I18N
        if(markAssignBtn === "Mark"){
            jQuery('.mark-icon-right').show();
        }else{
            jQuery('.mark-icon-right').hide();
        }
        jQuery("#MarkedStatus").val(markAssignBtn);
    }
    jQuery("#"+markAssignBtn+"Button").trigger('blur');
}






function showDynamicNotifCount(count) {
  var cnt = parseInt(count);
  if(cnt != 0)
  {
    jQuery('#notifCount').show().text(cnt); //No I18N
    jQuery('#notifList').hide(); //No I18N
  }
  else
  {
    jQuery('#notifCount').hide(); //No I18N
  }
  //To apply the 'mr5' class to the bell notification icon only when the count is displayed, ensuring it does not overlap with others and provides additional space.
  jQuery('#bellIconCountCheck').toggleClass('mr5', cnt !== 0); //NO I18N
  updateNotificationCountInBrowserTitle(cnt);
}

function showPendingApprovalsCount(count) {
    var cnt = parseInt(count);
    jQuery('#approvalsCount').toggle(cnt !== 0).text(cnt);
    //To apply the 'mr5' class to the pending approvals icon only when the count is displayed, ensuring it does not overlap with others and provides additional space.
    jQuery('#pendingApprovalsCountCheck').toggleClass('mr5', cnt !== 0); //NO I18N
}

/*
 * Returns the time difference in min(s) / hour(s) / day(s) for the given from_time.
 * If the to_time is not provided, then difference will be taken between the current time and the given from_time
 */
function getTimeDiff(from_time, to_time) {
  var diff_val;
  if(!to_time) {
    to_time = new Date().getTime();
  }
   from_time = parseInt(from_time);
   to_time = parseInt(to_time);
   var diff_time = from_time >= to_time ? from_time - to_time : to_time - from_time;
  diff_time = diff_time / 1000;
  if(diff_time < 60) {
    diff_val = translate('common.fewseconds');  //No I18N
  } else if(diff_time >= 60 && diff_time < 3600) {
    diff_time = Math.floor(diff_time / 60);
    diff_val = diff_time == 1 ? diff_time + ' ' +translate('sdp.requests.view.minute') : diff_time + ' ' + translate('sdp.requests.view.minutes'); //No I18N
  } else if(diff_time >= 3600 && diff_time < 86400) {
    diff_time = Math.floor(diff_time / 3600);
    diff_val = diff_time == 1 ? diff_time + ' ' +translate('sdp.requests.view.hour') : diff_time + ' ' + translate('sdp.requests.view.hours'); //No I18N
  } else {
    diff_time = Math.floor(diff_time / 86400);
    diff_val = diff_time == 1 ? diff_time + ' ' + translate('sdp.requests.view.day') : diff_time + ' ' + translate('sdp.requests.view.days'); //No I18N
  }
  return diff_val;
}

/**
 * Checks whether the given template id is available for the current user using the templates obtained in GetHeaderDetails AjaxServlet
 */
function isTemplateAvailable(template_id) {
  var clone_categories = template_obj.cloneCategories();
  if(clone_categories === undefined) {
    return false;
  }
  var templates = clone_categories;
  for(var i=0, service_len=templates.length; i<service_len; i++) {
    for(var j=0, temp_len=templates[i].templates.length; j<temp_len; j++) {
       /** SD-109942, removed the if block to check if the template is not default template incase default template is disabled for requester as, when it is disabled, the template will not be available in the API response itself */
        if(template_id == templates[i].templates[j].id) {
          return true;
        }

    }
  }
  return false;
}
/*Code Starts for Component to handle video for new features */
var init_feature_overview={
  init:function(options){
    if(sdp_user.CLIENT_CONF[options.key] == "true" || window.externalframe == true) {
      return;
    }
    this.element=jQuery("#new_overview");
    this.options=options;
    var html=options.html||this.html(options);
    this.element.html(html);
    this.popup = jQuery('#preview_div');
    this.element.on("click","[data-video-tip]",function(event){
		if (options.type == ("redirect")) {
			init_feature_overview.redirect(event);
		} else {
			init_feature_overview.render(event);
		}
    });
    jQuery(document).on('keydown', function(ev) {
      var keyCode = ev.which;
      if ( jQuery('#preview_div .rlc-diagram-anim1' ).is( ':visible' ) && keyCode == 27 ){
		  if (options.type == ("redirect")) {
			  init_feature_overview.redirect();
		  } else {
			  init_feature_overview.render();
		  }
      }
    });
  },
  redirect:function(event){
	  window.location.href=this.options.url;
	  ClientUtil.addUserPersonalization(this.options.key, true);
  },
  render:function(event){
      var origin = jQuery('.g-wrap').offset().left + 50;
      var height = jQuery('.g-wrap').offset().top + 50;
      var _self=this;
      if(this.popup.is(":visible")) {//Close Code for popup
        var show=event && event.currentTarget.dataset.videoTip;
        if(show=="close"){
          ClientUtil.addUserPersonalization(this.options.key, true);
        }
        this.popup.find('.rlc-diagram-anim').removeClass('rlc-diagram-anim1');
        setTimeout(function() {
          _self.popup.find('iframe').attr("src","about:blank");
          _self.popup.hide();
          if(show=="close") {
            _self.element.hide();
          }
        },900);
      } else {//Open Code for popup
        this.popup.find('iframe').attr("src",this.options.src);
        this.popup.find('.rlc-diagram-anim').css( 'transform-origin' , origin+'px '+height+'px 0px' );//No i18n
        this.popup.show();
        setTimeout(function() {
          _self.popup.find('.rlc-diagram-anim').addClass('rlc-diagram-anim1');
        },100);
      }
      this.options.callback && this.options.callback(event);
  },
  html:function(option) {
    return '<div class="g-wrap g-move" id="esm-widget-videobtn" data-video-tip="open">'+
  '<div class="g-widget">'+
    '<div class="g-badge" data-message="new">'+ translate("common.new") +'</div>'+
    '<div class="g-star">'+
      '<span class="g-star1">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+ //no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
      '<span class="g-star2">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+//no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
      '<span class="g-star3">'+
        '<svg viewBox="0 0 64.000000 63.000000">'+
          '<g transform="translate(0.000000,63.000000) scale(0.100000,-0.100000)" stroke="none">'+//no i18n
          '<path d="M290 480 c-16 -79 -28 -111 -39 -114 -9 -2 -52 -12 -96 -21 -100 -21 -118 -26 -112 -32 3 -2 45 -13 94 -24 48 -10 97 -21 109 -24 18 -4 24 -21 44 -115 13 -60 26 -110 30 -110 4 0 17 50 30 110 20 94 26 111 44 115 12 3 61 14 109 24 49 11 91 22 94 24 6 6 -12 11 -112 32 -44 9 -87 19 -96 21 -11 3 -23 35 -39 114 -13 61 -26 110 -30 110 -4 0 -17 -49 -30 -110z"/>'+//no i18n
          '</g>'+
        '</svg>'+
      '</span>'+
    '</div>'+
    '<div class="g-title">'+
      '<span class="disp-ib fw mt15" >'+option.title.tip+'</span>'+
	'</div>'+
  '</div>'+
'</div>'+
'<div id="preview_div" style="display: none;">'+
  '<div class="freezeLayer pos-fix fh" style="z-index: 100;"></div>'+
  '<div class="pos-fix top0 rlc-diagram-anim">'+
      '<div class="widget-bg" style="height: auto;">'+
          '<div class="widget-header p10">'+
            '<span class="h3 m0">'+option.title.popup+'</span>'+
            '<button class="btn btn-link fr pos-rel top-5 ml10" id="digCloseBtn" title="'+translate("ae.loginpage.closeanddontshow.password")+'" data-video-tip="close">'+//no i18n
              '<span class="dig-close-btn right0"></span>'+
            '</button>'+
            //'<button type="button" class="btn btn-primary btn-sm fr pos-rel top-5" data-video-tip="configure">'+option.title.configure+'</button>'+//no i18n
          '</div>'+
          '<div class="widget-panel p0" style="height: auto;">'+
            '<iframe width="100%" height="520" src="about:blank" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'+
          '</div>'+
      '</div>'+
  '</div>'+
'</div>';
  }
}
/*Code Ends for Component to handle video for new features */

//For Task Template form - TaskTemplate List select2 (Ember)
function initSelect2ForTaskTemplateList(cntl,templateObj,module){
  var t_obj = { "list_info":{start_index:1,sort_field:"name",row_count:25}};//NO I18N
  var url = "/api/v3/"; // NO I18N

  if(module === 'request_template') {
    url += 'request_templates/' + cntl.model.request_template.id + '/task_templates/task_template'; // NO I18N
  }
  if(module === 'problem_template') {
      url += 'problem_templates/' + cntl.model.problem_template.id + '/task_templates/task_template'; // NO I18N
  }
  if(module === 'project_template') {
    url += 'project_templates/' + cntl.model.project_template.id + '/task_templates/task_template'; // NO I18N
  }
  if(module === 'milestone_template') {
    url += 'project_templates/' + cntl.model.project_template.id + '/milestone_templates/' + cntl.model.milestone_template.id + '/task_templates/task_template'; // NO I18N
  }

  jQuery("input#use_task_template").val(""); //NO I18N

  jQuery("#use_task_template").select2({
      ajax: {
          url: url,
          dataType: 'json', // No I18N
          cache: false,
          data: function data(term, page) {
              var start_index = 10 * (page - 1) + 1;
              var enInputData;

              if(term.trim().length>0){
                if(!t_obj.list_info.search_fields){
                  t_obj.list_info.search_fields = {};
                }
                t_obj.list_info.search_fields.name= term;
              }
              else{
                delete t_obj.list_info.search_fields;
              }

              t_obj.list_info.start_index = start_index;
              enInputData = JSON.stringify(t_obj);
              return {
                  "input_data": enInputData //No I18N
              };
          },
          params: {
              contentType: "application/x-www-form-urlencoded" // No I18N
          },
          results: function results(data, params) {
              var resultArr = data.task_template;
              var has_more_rows = data.list_info.has_more_rows,
                  i;

              for (i = 0; i < resultArr.length; i++) {
                  resultArr[i].text = resultArr[i].name;
                  delete resultArr[i].name;
              }
              return {
                  results: resultArr,
                  more: has_more_rows
              };
          }
      },
      placeholder: translate('common.tasktemp.placeholder'),
      closeOnSelect: false,
      formatSelection: function formatSelection(item) {
          return e_html(item.text);
      }
  });
  jQuery("input#use_task_template").off('change').on('change',function(ele){//NO I18N
      cntl.send('taskChange', ele.val);//NO I18N
  });
  initTooltip("#taskEditForm");//NO I18N
}

function instancesidebar(content, wdh){
  var data = document.querySelector(content);//Get the mainview html dom
  data.style.width = wdh + 'px';
  var direction = jQuery.fn.getDirection();
  if(direction == 'rtl') {
    document.body.style.paddingRight = wdh + 'px'; //NO I18N
  } else {
    document.body.style.paddingLeft = wdh + 'px'; //NO I18N
  }
}

/*
  SDP Dropdown Component for integrating the menu links
*/
function dynamicDropdown(el, apiUrl, navigationURL) {
  var dropdownButton = jQuery(el),
  dropdownElements = "", // No I18N
  dropdownSubmenu = function(item){
    var menu = "", className = ""; // No I18N
    if(item.items){
      menu = dropdownMenu(item.id);
      className = "sdmenu-submenu"; // No I18N
    }
    return "<li id='"+item.id+"' class='"+className+"'><a href='"+navigationURL+item.id+"'>"+e_html(item.displayname)+"</a>"+menu; // No I18N
  },
  dropdownMenu = function(id){
    return "<ul id='menu_"+id+"' class='sdmenu-dd'>"; // No I18N
  },
  constructSubMenus = function(obj) {
    for(var j=0, len=obj.items.length; j<len; j++){
      dropdownElements += dropdownSubmenu(obj.items[j]);
      if(obj.items[j].items)
        constructSubMenus(obj.items[j]);
      else
        dropdownElements += "</li>"; // No I18N
    }
    dropdownElements += "</ul>"; // No I18N
  };
  // Check if there is a Dropdown menu element present to populate the items inside it.
  if(!dropdownButton.siblings('.sdmenu-dd').length) { // No I18N
    jQuery("<ul class='sdmenu-dd'></ul>").insertAfter(dropdownButton); // No I18N
  }
  // Populate the menu items only if sdmenu-dd element is empty
  if(dropdownButton.siblings('.sdmenu-dd').children().length){ // No I18N
    return;
  } else {
  dropdownButton.siblings('.sdmenu-dd').html(ajaxBar()).css("min-height","220px"); // No I18N
    jQuery.ajax({
      url: apiUrl,
      type: "GET", // No I18N
      success: function(data) {
      var menuData = JSON.parse(data);
      var status=menuData.response_status.status;
    dropdownButton.siblings('.sdmenu-dd').html("").css("min-height",""); // No I18N
      if(status.toLowerCase()=="success")
      {
       if(menuData.items){
          for (var len = menuData.items.length,i = 0; i < len; i++) {
            dropdownElements += dropdownSubmenu(menuData.items[i]);
            menuData.items[i].items && constructSubMenus(menuData.items[i]);
          }
          dropdownButton.siblings('.sdmenu-dd').empty().append(dropdownElements); // No I18N
        }
      }else{
    dropdownButton.parent().removeClass("open"); // No I18N
       if(apiUrl.startsWith("/DCHomePage") || apiUrl.startsWith("/mdmMenu") || apiUrl.startsWith("/mdmpIframe"))
      {
        showalert('failure',menuData.response_status.messages, 'isAutoHide=false'); // No I18N
        // MDM Invalid API key & Build in compatible alerts event bindings
        jQuery("#alertbox").off("click").on("click","[data-id=mdmpcomatibleFail]",function(e){ //NO I18N
          e.preventDefault();
          return appendDID("http://www.manageengine.com/mobile-device-management/service-packs.html?sdpi",true); //NO I18N
        }).on("click","[data-id='mdmAPIInvalid']",function(e){
          e.preventDefault();
          return appendDID('http://www.manageengine.com/products/desktop-central/desktop-central-api-key-invalid.html?sdpi',true); //NO I18N
        });
      } else {
        showalert('failure',e_html(menuData.response_status.messages), 'isAutoHide=false'); // No I18N
      }
      }
      },
      error: function(err) {
    dropdownButton.siblings('.sdmenu-dd').html("").css("min-height","").parent().removeClass("open"); // No I18N
        showalert('failure', e_html(err.statusText), 'isAutoHide=false'); // No I18N
      }
    })
  }
}
function getDynamicNotificationCount()
{
  sdpAjax({
  type : 'GET',//NO I18N
  dataType : 'json',//NO I18N
  async:false,
  url: '/api/v3/user_notifications/unread_count',//NO I18N
  success: function(data){
    var cnt = data.user_notification.unread_count;
    if(cnt!=0)
    {
      jQuery('#notifCount').show();
      jQuery('#notifList').hide();
      jQuery('#notifCount').text(cnt);
    }
    else
    {
      jQuery('#notifCount').hide();
    }
    updateNotificationCountInBrowserTitle(cnt);
  }
  });
}

// Dynamic Loading component has been moved to Form.js

//As the function "closeDialogWindow" is required for both ember and non ember pages which is being moved here.
/* this method to use close locked user list, dialog or window.*/
function closeDialogWindow(isAssetBuild)
{
    if( jQuery('#_DIALOG_LAYER').length > 0 )
    {
        closeDialog();
    }
    else
    {
        closeLockedAccountWindow(isAssetBuild);
    }
}

//As the function "closeLockedAccountWindow" is required for both ember and non ember pages which is being moved here.
/*
 * this methos to used close new window when locked account details page is open in new window or new tab redirect to home page.
 */
function closeLockedAccountWindow( isAssetBuild )
{
    if( window.name == "lockeduserdetails" )
    {
        window.close();
    }
    else
    {
        if( isAssetBuild == 'true' )
        {
            window.location.href = '/AssetHomePage.do';
        }
        else
        {
            window.location.href = '/ui/home?PORTALID='+PORTALID;
        }
    }
}

// This method is being used by MSP Team
function checkIfMSP() {
	return parent.sdp_app.IS_MSP;
}

// This method is being used by MSP Team
function featureStatus() {
	return parent.sdp_feature_status;
}

// This method is being used by MSP Team
function checkIfSCP(){
	return parent.sdp_app.IS_SCP;
}

// This method is being used by MSP Team
function checkIfMSPOrSCP(){
	return checkIfMSP()||checkIfSCP();
}

function invokeGoogleAnalytics(){
	try {
			if(PORTALID < 0){
				var url = "/GoogleAnalytics.do?action=get_ga_details_ESMDir";//No I18N
			}else{
				var url = "/GoogleAnalytics.do?action=get_ga_details";//No I18N
			}
            sdpAjax({type: "GET", url: url,//No I18N
            	ignorefailuremessage : true,
                success: function(data) {

                    if (data.is_enabled) {
                        var script_code = data.script_code;

                        if (script_code !== '') {
                            jQuery('head').append(script_code);
                        }
                    }
                }
            });
        } catch (e) { };
}

var template_obj = {
  st_count : "",
  data_obj : [],
  //Merging incident templates and service templates if service catalog is enabled.
  cloneCategories : function(){
    var current_data;
    if(template_settings.ismerged){
      var merged_data = this.availableCategories({key:"mergedservice",filter:"hasMergedTemplates"}); //No I18N
      if(merged_data != undefined && merged_data.service_categories.length){
         current_data = merged_data.service_categories;
      }
    }
    else{
      var incident_data = this.availableCategories({key:"incidenttemplates",filter:"hasIncidentTemplates"}); //No I18N
      if(incident_data != undefined && incident_data.service_categories.length){
        var data = incident_data.service_categories;
        current_data = JSON.parse(sdpToJSON(data));
        if(is_service_catalog_enabled){
          var service_data = this.availableCategories({key:"servicetemplates",filter:"hasServiceTemplates"}); //No I18N
          if(service_data != undefined && service_data.service_categories.length){
            var data = service_data.service_categories;
            jQuery.each(data, function(i, templates){
              current_data.push(templates);
            });
          }
        }
      }
    }
    return current_data;
  },

  // Get categories when categories is not available in template_settings.
  availableCategories : function(options){
    return (template_settings[options.key]) ? template_settings[options.key] : (this.getCategories(options),template_settings[options.key]);
  },

  // categories append in header tab.
  appendCategories : function(options){
        this.availableCategories(options);
        template_settings.tab = options.id;
        template_settings.user_type = sdp_user.USERTYPE;
        var container = jQuery("#"+options.id).parent().find('.temp-menu');
        if(options.header){
          if(options.id === "dd-service"){
            container = jQuery("#service-tab .zcomponents");
          }else{
            container = jQuery("#incident-tab .zcomponents");
          }
        }
        function raiseRequestEvents() {
            if(template_settings.tab==="dd-request"){ //No I18N
              jQuery('#HeaderRaiseTicket').off('click').on('click','[data-action-name="toggle-template"]', (event) => { //No I18N
                template_obj.toggleTooltip('#colExp'+jQuery(event.currentTarget).attr('data-id').replace('category-',''));  //No I18N
              });
            }
            else if(template_settings.tab==="dd-incident"){ //No I18N
              jQuery('#HeaderRaiseTicket').off('click').on('click','[data-action-name="toggle-template"]', (event) => { //No I18N
                template_obj.toggleTooltip('#colExpInc'+jQuery(event.currentTarget).attr('data-id').replace('category-','')); //No I18N
              });
            }
            else if(template_settings.tab==="dd-service"){ //No I18N
              jQuery('#HeaderRaiseTicket').off('click').on('click','[data-action-name="toggle-template"]', (event) => { //No I18N
                template_obj.toggleTooltip('#colExpSvc'+jQuery(event.currentTarget).attr('data-id').replace('category-','')); //No I18N
              });
            }
        }
        renderhbs(container, 'rasie-a-request', {template_settings:template_settings}, false, "common", undefined, undefined, raiseRequestEvents); // NO I18N
  },

  toggleTooltip: function(titleId) {
    if(jQuery(titleId).hasClass("collapse")) {
      jQuery(titleId).attr('title', translate('sdp.common.expand'));
      jQuery(titleId).removeClass('collapse');
    }
    else {
      jQuery(titleId).attr('title', translate('sdp.common.collapse'));
      jQuery(titleId).addClass('collapse');
    }
  },

  // Get categories.
  getCategories : function(options){
    var input_object = {},list_info = {},self = this;
    (this.st_count == "") ? this.st_count=1 : "";
    input_object.list_info = {"row_count" : "100","start_index": this.st_count,"filter_by": { "name": options.filter },"fields_required":[ "id", "name", "description","icon_name","sort_index", "templates" ]}; // No I18N
	  if (checkIfMSP()) {
		  mspCrit = [
			  {
				  "condition": "is",// No I18N
				  "logical_operator": "and",// No I18N
				  "field": "associated_account",// No I18N
				  "value": getAccountId()// No I18N
			  }
		  ]
		  input_object.list_info.search_criteria = mspCrit;
	  }
      sdpAjax({
      type:'GET',//NO I18N
      url:"/api/v3/requests/service_category",// No I18N
      data:sdpAjaxInputData(input_object),
      async:false,
      cache:false,
      success: function(resp) {
        if(resp.list_info.has_more_rows == true){
          self.data_obj = self.data_obj.concat(resp.service_category);
          self.st_count = self.st_count+100
          self.getCategories(options);
        }
        else{
          (resp.list_info.start_index == 1) ? self.data_obj=resp.service_category : self.data_obj = self.data_obj.concat(resp.service_category);
          template_settings[options.key] = {service_categories:self.data_obj};
          self.st_count = "";
          self.data_obj = [];
        }
      }
    });
  }
}


/**
 * Store
 * A unified method is used to handle all the operation
 * of localstroage and cookies based on browser support
 */
var Store = {
  /**
  * Test the browser have localstoarge or not.
  */
 hasLocalStorage : typeof localStorage !== "undefined", //No I18N
 /**
  * A helper method to set expiry date return as Date UTC string
  */
 expiryDate : function (days) {
     if (days) {
         var date = new Date();
         date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
         var expires = "; expires=" + date.toUTCString(); //No I18N
         return expires;
     }
     else {
         return "";
     }
 },
   /**
   * Unified method to Get the localStorage/Cookie
   * @param options {Object} Options for set Cookie / LocalStorage
   * @param options.key {string} - Name of cookie
   * @param options.value {string} - Value of the Key
   * @param [options.days=0] {number} - Expiry date for Cookie, if the browser does't support localStorage
   * @param [options.isCookie=false] {Boolean} -  Force to Save on Cookie rather than localstorage
   */
  setItem : function (options) {
      if (options.days === void 0) { options.days = 0; }
      if (options.isCookie === void 0) { options.isCookie = false; }
      if ( !options.isCookie && this.hasLocalStorage ) {
          window.localStorage.setItem(options.key, options.value);
      }
      else {
          var expires = this.expiryDate(options.days);
          document.cookie = encodeURIComponent(options.key) + "=" + options.value + expires + "; path=/"; //No I18N
      }
  },
 /**
  * Unified method to get the localStorage/Cookie
  * @param key {string} -  Name of the cookie
  * @param [isCookie=false] {Boolean} - Force to Get on Cookie rather than localstorage
  */
 getItem : function (key,isCookie) {
     if(isCookie === void 0){ isCookie = false }
     if (!isCookie && this.hasLocalStorage) {
         return window.localStorage.getItem(key);
     }
     else {
         return this.getCookie(key);
     }
 },
 /**
  * Unified method to remove the localStorage/Cookie
  * @param key {string} key of the storage
  * @param isCookie {boolean} Forced to remove cookie
  */
 removeItem : function (key, isCookie) {
     if (isCookie === void 0) { isCookie = false; }
     if (this.hasLocalStorage && !isCookie) {
         return window.localStorage.removeItem(key);
     }
     else {
         return this.removeCookie(key);
     }
 },
 /**
  * Get Cookie
  * @param key{string} Name of the cookie
  */
 getCookie : function (key) {
     var value = "; " + document.cookie;
     var parts = value.split("; " + key + "=");
     if (parts.length == 2) {
         var lastIndex = parts.pop();
         if (lastIndex) {
             return lastIndex.split(";").shift();
         }
     }
     return null;
 },
 /**
  * Delete Cookie
  * @param key{string} Name for delete cookie
  */
 removeCookie : function (key) {
     return (document.cookie = key + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;");
 },
};


  /*This will add dimensions to imageName*/
//param image- imageName
//param dimensionToAppend- 250*350,450*350
function appendDimensions(imageName,dimensionToAppend){
    if(imageName==undefined){
      return imageName;
    }
    if(imageName.startsWith("/api/v3")) {
      imageName = imageName + "?res="+dimensionToAppend;  // NO I18N
      return imageName;
  }
    var extPos=imageName.lastIndexOf('.');
    var extension='.'+imageName.substring(extPos+1);
    var imageName=imageName.substring(0,extPos);

    return imageName.concat('_',dimensionToAppend,extension);
}

//This will upload the xls file and returns back the parsed json from XLS file
//params
//ele- this needs to be input element of type file from which the chosen XLS file will be taken
//callback- method to call after the server response
//targetEle- container where the loader icon has to be shown
function importXLS(ele,callback,context,targetEle){
    var formData,files,_self=this,xls_json,fileName;
    jQuery(ele).on('change', function(){
        formData=new FormData();
        files=jQuery(this)[0].files;
        if(files.length>0){
            fileName=files[0].name;
            formData.append("excelfile",files[0],fileName);
            jQuery(targetEle).html(ajaxBar());//loading icon
            jQuery.ajax({
                contentType: false,
                processData: false,
                url:'servlet/AJaxServlet?action=convertExcelToJson',//NO I18N
                method:'POST',//NO I18N
                data:formData,
                success:function(resp){
                    if(resp && resp.sheets){
                        callback(resp.sheets,fileName,context);
                        jQuery(targetEle).html("");
                    }else{
                      showalert('failure',translate('import.xls.failure.msg'),'isAutoHide=true')//NO I18N
                      jQuery(targetEle).html("");
                    }
                },
                error:function(){
                  showalert('failure',translate('import.xls.failure.msg'),'isAutoHide=true')//NO I18N
                  jQuery(targetEle).html("");
                }
            })
            jQuery(ele).val('');
        }
    })
    return xls_json;
}

//If there are multiple forms in the popup, prevent tab moving from one form to another
//add data-tabMovement=false to last button in the form
function preventTabMovement(formEle){
    formEle.find("*[data-tabMovement=false]").on("keydown",function(e){
        if(e.keyCode==9){
            e.preventDefault();
            return false;
        }
    });
}

//add data-item="numeric" to the input field, this function would not allow typing alphabets
function checkNumericValue(){
      $('input[data-item=numeric]').off('keypress');
      $('input[data-item=numeric]').on('keypress', function(evt) {
          var charCode = (evt.which) ? evt.which : event.keyCode;

          var allcopyreloadpaste = ((evt.ctrlKey && charCode == 97) || (evt.ctrlKey && charCode == 114) || (evt.ctrlKey && charCode == 118) || (evt.ctrlKey && charCode == 99) || (evt.ctrlKey && charCode == 120));
          if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 82 && !allcopyreloadpaste){
              if(charCode==46||charCode==45){
                  return true;
              }
              return false;
          }
          return true;
      });
}

// Site24x7

function invokeSite24X7Link() {
    var code="";
    let prefix="";
    sdpAjax({
            type:'GET', //No I18N
            url: '/api/v3/integrations', // No I18N
            cache:false,
            success: function(json) {
             for (var i = 0; i < json.integrations.length; i++) {
                  if(json.integrations[i].name == "Site24x7 Integration"){
                     var action = json.integrations[i].actions[0];
                     var datacenterVal = action.request_configs.url_params.data_center;
                     switch(datacenterVal) {
                      case "IN" : // No I18N
                      code="in";// No I18N
                      break;
                      case "EU" : // No I18N
                      code="eu";// No I18N
                      break;
                      case "CN" : // No I18N
                      code="cn";// No I18N
                      break;
                      case "US" : // No I18N
                      code="com";// No I18N
                      break;
                      case "JP": // No I18N
                        prefix="app."; // No I18N
                        code="jp"; // No I18N
                        break;
                      case "AU": // No I18N
                        code="net.au" // No I18N
                        break;
                      case "SA": // No I18N
                        code = "sa"; // No I18N
                        break;
                     }
                    window.open(`https://${prefix}site24x7.`+code+"/login.html", '_blank');
                  }
             }
           }
    });
}

//gets all the templates
function getAllTemplates(){
      var i_templates,s_templates,template_list=[];
      var incidentjson=JSON.stringify({"list_info":{"search_fields":{"is_service_template":false,"is_service_category_required":true}}});//NO I18N
      var incidentdata={"input_data":incidentjson};//No I18N

      sdpAjax({
          async: false,
          cache:false,
          type: "GET", //NO I18N
          data:incidentdata,
          url: "/api/v3/request_templates"//No I18N
       }).done(function(data) {
             i_templates=data.service_categories;//No I18N
          }
       );

      var servicejson=JSON.stringify({"list_info":{"search_fields":{"is_service_template":true,"is_service_category_required":true}}});//NO I18N
      var servicedata={"input_data":servicejson};//No I18N
      sdpAjax({
          async: false,
          cache:false,
          type: "GET", //NO I18N
          data:servicedata,
          url: "/api/v3/request_templates"//No I18N
      }).done(function(data) {
              s_templates=data.service_categories;
          }
      );
      template_list.push(i_templates);

      if(s_templates.length>0){
        template_list.push(s_templates);
      }
      return template_list;
};
    var $header = {
      data: {
          isAssetBuild: false,
          isAdmin: false,
          isSDAdmin: false,
          reqdetails: false,
      },
      /**
       * Return the header icons for the respective id
       * @param {string} id
       */
      headerIconMapper: function(id) {
          var defaultIcons = {
            assets:'<svg class="header-menu-icons" viewBox="0 0 24 24"><path class="cls-1" style="fill: currentColor;"d="M20.75,5.31a.76.76,0,0,0-.16-.06.61.61,0,0,0-.26-.18L10.7,1.86l-.23-.05L.66,5.07a.71.71,0,0,0-.26.18l-.15.06a.62.62,0,0,0-.25.5v12a.62.62,0,0,0,.42.58l9.78,3.26a.58.58,0,0,0,.19,0l.11,0,.11,0a.58.58,0,0,0,.19,0l9.78-3.26A.62.62,0,0,0,21,17.8v-12A.62.62,0,0,0,20.75,5.31ZM10.37,2.85l8.38,2.79L10.14,8.38,2,5.65ZM1,6.35l9,3V20.52l-9-3ZM20,17.52l-9,3V9.35l9-3Z"></path></svg>', // NO I18N
            changes:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.1px;"d="M2,8.5H5.84a5,5,0,0,1,5,5h0a5,5,0,0,1-5,5H2"></path><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.1px;"d="M20,8.5H16.12a5,5,0,0,0-5,5h0a5,5,0,0,0,5,5H20"></path><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.1px;"points="18.55 6.18 20.8 8.42 18.55 10.67"></polyline><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.1px;"points="18.55 16.18 20.8 18.42 18.55 20.67"></polyline></g></svg>', // NO I18N
            cmdb:'<svg class="header-menu-icons" viewBox="0 0 24 24"><path class="cls-1" style="fill: currentColor;"d="M12,1.67c-4,0-8.36,1.08-8.36,3.1V19.54c0,2,4.31,3.13,8.36,3.13s8.37-1.1,8.37-3.13V4.77C20.39,2.75,16.08,1.67,12,1.67Zm0,1c4.57,0,7.37,1.25,7.37,2.15S16.59,7,12,7,4.65,5.71,4.65,4.82,7.46,2.67,12,2.67Zm0,19c-4.53,0-7.31-1.25-7.31-2.15v-3.7c1.47,1.05,4.45,1.6,7.31,1.6s5.85-.55,7.32-1.62v3.72C19.34,20.39,16.56,21.64,12,21.64Zm0-5.22c-4.53,0-7.31-1.25-7.31-2.15V11.09C6.18,12.14,9.16,12.7,12,12.7s5.85-.56,7.32-1.61v3.18C19.34,15.17,16.56,16.42,12,16.42Zm7.32-6.84c0,.9-2.78,2.15-7.32,2.15S4.71,10.48,4.71,9.58V6.31c1.47,1,4.45,1.6,7.31,1.6s5.85-.56,7.32-1.6V9.58Z"></path></svg>', // NO I18N
            contracts:'<svg class="header-menu-icons" viewBox="0 0 24 24"><path class="cls-1" style="fill: currentColor"d="M18.3,6.55V7.1l-1.49-.71a5.52,5.52,0,0,0-2.35-.53A7.39,7.39,0,0,0,9.82,7.55H5.3v-1H.3v12h5V17.43l4.39,3.18a3,3,0,0,0,1.59.47,2.82,2.82,0,0,0,1.54-.45l3.74-2a1.67,1.67,0,0,0,.79-1,.06.06,0,0,0,0,0h.94v1h5v-12Zm-14,11h-3v-10h3v10Zm12.09-.23a.67.67,0,0,1-.3.42l-3.77,2a1.86,1.86,0,0,1-2.06,0l-5-3.59V8.55H8.82L7.37,10a2.57,2.57,0,0,0-.71,1.8A2.42,2.42,0,0,0,8,14.05a1.91,1.91,0,0,0,2.08-.31l2-1.88,4,4.34.26.45A.91.91,0,0,1,16.39,17.32Zm1.34-.77-5.62-6.11L9.39,13a.89.89,0,0,1-1,.15,1.42,1.42,0,0,1-.74-1.32,1.55,1.55,0,0,1,.42-1.1l2.35-2.37a6.28,6.28,0,0,1,4-1.49,4.46,4.46,0,0,1,1.92.44l1.92.91v8.34Zm4.57,1h-3v-10h3Z"></path></svg>', // NO I18N
            dashboard:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><g><g><ellipse class="cls-1" style="fill: currentColor" cx="11.49" cy="18.67" rx="2.34" ry="2.37"></ellipse><polygon class="cls-1" style="fill: currentColor"points="13.63 17.78 11.75 16.34 14.71 14.33 14.72 14.33 13.63 17.78"></polygon></g><rect class="cls-1" style="fill: currentColor" x="17.54" y="19" width="2.83" height="1.43" rx="0.72"></rect><rect class="cls-1" style="fill: currentColor" x="2.68" y="19" width="2.83" height="1.43" rx="0.72"></rect><rect class="cls-1" style="fill: currentColor" x="2.68" y="19" width="2.83" height="1.43" rx="0.72"></rect><path class="cls-1" style="fill: currentColor"d="M6.27,14.61l-.92-1.09a.71.71,0,0,1,.07-1h0a.7.7,0,0,1,1,.08l.92,1.09a.71.71,0,0,1-.08,1h0A.69.69,0,0,1,6.27,14.61Z"></path><rect class="cls-1" style="fill: currentColor" x="10.5" y="10.61" width="2.87" height="1.42" rx="0.71"transform="translate(23.26 -0.61) rotate(90)"></rect><path class="cls-1" style="fill: currentColor"d="M16.21,13.51l1.07-.94a.7.7,0,0,1,1,.07h0a.73.73,0,0,1-.07,1l-1.07.94a.7.7,0,0,1-1-.07h0A.73.73,0,0,1,16.21,13.51Z"></path></g><path class="cls-2" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.2px;"d="M22.39,20.56a12,12,0,0,0,.14-1.81,11.17,11.17,0,0,0-11-11.34,11.17,11.17,0,0,0-11,11.34,13,13,0,0,0,.11,1.67"></path></g></svg>', // NO I18N
            home: '<svg class="header-menu-icons" viewBox="0 0 24 24"><g><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="18.5 10 18.5 22.5 4.5 22.5 4.5 10"></polyline><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="0.85 12.85 11.48 5.29 22.05 12.76"></polyline><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M9,22V16.76a2.5,2.5,0,0,1,2.5-2.5h0a2.5,2.5,0,0,1,2.5,2.5V22"></path></g></svg>', // NO I18N
            problems:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="2.51 15.02 5.14 12.88 7.27 13.52"></polyline><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="14.68 17.8 16.3 19.33 15.76 22.68"></polyline><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="8.28 10.47 6.31 9.34 6.47 6.64"></polyline><polyline class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"points="16.82 15.4 18.79 16.54 21.04 15.05"></polyline><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M17.7,13.88l-.88,1.52-.18.31a7,7,0,0,1-2,2.09C13,19,10.79,19.65,9.2,18.73S7.05,15.6,7.27,13.52a6.87,6.87,0,0,1,.83-2.74l.18-.31L9.16,9Z"></path><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M12.12,6.74a4,4,0,0,1,.19-4"></path><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M21.51,8a3.94,3.94,0,0,1-3.38,2.17"></path><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M16.27,6.49a4.21,4.21,0,0,0-4.15.25,5.29,5.29,0,0,0-2,1.9l-.35.61,7.32,4.23.35-.61a5.33,5.33,0,0,0,.66-2.66A4.19,4.19,0,0,0,16.27,6.49Z"></path></g></svg>', // NO I18N
            releases:'<svg class="header-menu-icons" style="fill: currentColor; stroke: none;" viewBox="0 0 24 24"> <g><path class="cls-1" d="M21.989,3.364a1.088,1.088,0,0,0-.322-.808,1.134,1.134,0,0,0-.806-.32c-5.1.195-8.841,1.686-11.737,4.685l-2.564-1L.989,11.49l5.032,1.677-.661,2.1,3.6,3.6,2.1-.661,1.678,5.032,5.571-5.572-1-2.564C20.3,12.2,21.794,8.463,21.989,3.364ZM13.2,21.246l-1.461-4.384-2.484.782L6.581,14.966l.782-2.484L2.979,11.02,6.824,7.176,9.413,8.187l.249-.27c2.724-2.954,6.3-4.418,11.253-4.594-.189,4.944-1.653,8.516-4.607,11.239l-.27.249,1.011,2.59Z"/><path class="cls-1" d="M15.965,8.292a2.611,2.611,0,1,0,0,3.694A2.615,2.615,0,0,0,15.965,8.292Zm-.76,2.934a1.577,1.577,0,0,1-2.175,0,1.538,1.538,0,1,1,2.175,0Z"/><path class="cls-1" d="M4.966,16.132a6.484,6.484,0,0,0-1.772,3.339l-.6,2.188,2.188-.6A6.48,6.48,0,0,0,8.124,19.29,3.158,3.158,0,0,1,4.966,16.132Z"/></g></svg>', // NO I18N
            projects:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><rect class="cls-1" style=" fill: none;stroke: currentColor; stroke-miterlimit: 10;" x="6.07" y="13.38"width="4.69" height="6.26" transform="translate(-9.2 10.76) rotate(-44.91)"></rect><path class="cls-1" style=" fill: none;stroke: currentColor; stroke-miterlimit: 10;"d="M20.12,9.23l-3.41,3.41L12.28,8.22l3.41-3.41a3,3,0,0,1,4.24,0l.19.18A3,3,0,0,1,20.12,9.23Z"></path><path class="cls-1" style=" fill: none;stroke: currentColor; stroke-miterlimit: 10;"d="M21.15,17.78,17.43,21.5a.5.5,0,0,1-.71,0L3.42,8.2a.51.51,0,0,1,0-.71L7.14,3.78a.48.48,0,0,1,.7,0l4.44,4.44,4.43,4.42,4.44,4.44A.5.5,0,0,1,21.15,17.78Z"></path><rect class="cls-2" style=" fill: currentColor;stroke: currentColor; stroke-miterlimit: 10;" x="6.45" y="6.8"width="2.09" height="2.09" rx="1" transform="translate(-3.35 7.6) rotate(-45)"></rect><line class="cls-2" style=" fill: currentColor;stroke: currentColor; stroke-miterlimit: 10;" x1="16.4" y1="16.75"x2="18.52" y2="14.63"></line><line class="cls-2" style=" fill: currentColor;stroke: currentColor; stroke-miterlimit: 10;" x1="13.45" y1="13.81"x2="15.57" y2="11.69"></line><line class="cls-2" style=" fill: currentColor;stroke: currentColor; stroke-miterlimit: 10;" x1="10.5" y1="10.86"x2="12.62" y2="8.74"></line><polygon class="cls-1" style=" fill: none;stroke: currentColor; stroke-miterlimit: 10;"points="8.96 20.38 4.54 15.96 3.81 16.69 3.81 21.12 8.23 21.12 8.96 20.38"></polygon></g></svg>', // NO I18N
            purchase:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><path class="cls-1" style="fill: currentColor" d="M2,3V23H20V3ZM19,22H3V4H19Z"></path><g><rect class="cls-1" style="fill: currentColor;" x="6.4" y="17.34" width="9" height="1"></rect><path class="cls-1" style="fill: currentColor;"d="M10.44,14v1h1V14a2.19,2.19,0,0,0,1.35-.62A1.92,1.92,0,0,0,13.3,12a2.09,2.09,0,0,0-.21-1,1.88,1.88,0,0,0-.66-.72,4.29,4.29,0,0,0-1.19-.55,3,3,0,0,1-1-.51.93.93,0,0,1-.29-.71,1,1,0,0,1,.27-.75,1.13,1.13,0,0,1,.8-.26,1,1,0,0,1,.79.36,1.59,1.59,0,0,1,.3,1V9h1.15V8.92a2.56,2.56,0,0,0-.49-1.66,2,2,0,0,0-1.25-.72V5.45h-1V6.54a2.06,2.06,0,0,0-1.25.63,2,2,0,0,0-.5,1.4A1.93,1.93,0,0,0,9.29,10a3.42,3.42,0,0,0,1.57.86,2.73,2.73,0,0,1,1,.53.88.88,0,0,1,.28.67.92.92,0,0,1-.32.74,1.38,1.38,0,0,1-.93.28A1.22,1.22,0,0,1,10,12.7a1.34,1.34,0,0,1-.32-1v-.12H8.51v.12a2.33,2.33,0,0,0,.54,1.62A2.19,2.19,0,0,0,10.44,14Z"></path></g></g></svg>', // NO I18N
            reports:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><rect class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;stroke-width: 1.2px;"x="3.5" y="2.5" width="17" height="19"></rect><g><rect class="cls-2" style="fill: currentColor;" x="8" y="10" width="2" height="6"></rect><rect class="cls-2" style="fill: currentColor;" x="11" y="12" width="2" height="4"></rect><rect class="cls-2" style="fill: currentColor;" x="14" y="8" width="2" height="8"></rect></g><line class="cls-3" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;" x1="7" y1="17.5" x2="17"y2="17.5"></line></g></svg>', // NO I18N
            requests:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;"d="M20,7.77a2.06,2.06,0,0,1-2.91-2.91L14.67,2.44,3,14.07,5.46,16.5a2.05,2.05,0,1,1,2.91,2.9l2.42,2.43L22.43,10.19Z"></path><line class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;" x1="11.1" y1="5.66"x2="19.21" y2="13.76"></line></g></svg>', // NO I18N
            solutions:'<svg class="header-menu-icons" viewBox="0 0 24 24"><g><g><line style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" x1="11.5" y1="2" x2="11.5" y2="4.1"/><line style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" x1="4.1" y1="3.9" x2="5.5" y2="5.3"/><line style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" x1="18.9" y1="3.9" x2="17.5" y2="5.3"/><line style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" x1="0.9" y1="10.5" x2="3" y2="10.5"/><line style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" x1="20" y1="10.5" x2="22.1" y2="10.5"/></g><path style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" d="M17.5,12.1c0-3.6-3.1-6.4-6.7-6c-2.6,0.3-4.8,2.4-5.2,5c-0.4,2.6,0.9,4.9,2.9,6.1v2.5c0,0.4,0.3,0.7,0.7,0.7h4.6c0.4,0,0.7-0.3,0.7-0.7v-2.5C16.3,16.2,17.5,14.3,17.5,12.1z"/><path style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;" d="M13.3,22.5c0,0-0.1,0-1.8,0s-1.8,0-1.8,0s0.1,0,1.8,0S13.3,22.5,13.3,22.5z"/></g></svg>', // NO I18N
            support:'<svg class="header-menu-icons" viewbox="0 0 24 24"><g data-name="Group 826" id="Group_826"><path class="cls-1" d="M4.11,11.21c0-4.73,3.57-8.63,7.89-8.63s7.89,3.9,7.89,8.63" data-name="Path 526" id="Path_526" style="stroke-width: 1.2px;fill: none;stroke-linejoin: round;stroke: currentColor"></path><path class="cls-2" d="M4.9,10.32h0A1.11,1.11,0,0,1,6,11.42H6v3.7a1.13,1.13,0,0,1-1.1,1.2h0A2.9,2.9,0,0,1,2,13.42H2v-.3a2.88,2.88,0,0,1,2.9-2.8Z" data-name="Rectangle 205" id="Rectangle_205" style="stroke: currentColor;fill: currentColor;"></path><path class="cls-2" d="M19.1,16.32h0a1.11,1.11,0,0,1-1.1-1.1h0v-3.8a1.11,1.11,0,0,1,1.1-1.1h0a2.9,2.9,0,0,1,2.9,2.9h0v.3a2.88,2.88,0,0,1-2.9,2.8Z" data-name="Rectangle 206" id="Rectangle_206" style="stroke: currentColor;    fill: currentColor;"></path><path class="cls-3" d="M19.37,15.32s-.42,4.53-7.26,5.16" data-name="Path 527" id="Path_527" style="stroke-width: 1.2px;fill: none;stroke-miterlimit: 10;stroke: currentColor;"></path><path class="cls-2" d="M10.44,19h1.09A1.47,1.47,0,0,1,13,20.47v.06A1.47,1.47,0,0,1,11.53,22H10.44A1.28,1.28,0,0,1,9,20.66v-.11A1.44,1.44,0,0,1,10.44,19Z" data-name="Rectangle 207" id="Rectangle_207" style="fill: currentColor;"></path></svg>', // NO I18N
            software: '<svg class="header-menu-icons" viewBox="0 0 24 24"><g><g><circle style="fill:none;stroke:currentColor;stroke-miterlimit:10;" cx="12.5" cy="10.9" r="3"/><path style="fill:none;stroke:currentColor;stroke-miterlimit:10;" d="M6.8,16.5c-2.9-3-3.1-7.7-0.3-10.9c2.9-3.3,8-3.6,11.3-0.7s3.6,8,0.7,11.3c-0.1,0.1-0.2,0.2-0.3,0.3"/></g><g><circle style="fill:currentColor;" cx="5.7" cy="19.5" r="1"/><path style="fill:none;stroke:currentColor;stroke-miterlimit:10;" d="M3.6,16.5h17.7c0.6,0,1.1,0.6,1.1,1.4v3.2c0,0.8-0.5,1.4-1.1,1.4H3.6c-0.6,0-1.1-0.6-1.1-1.4v-3.2C2.5,17.1,3,16.5,3.6,16.5z"/><line style="fill:none;stroke:currentColor;stroke-miterlimit:10;" x1="9" y1="19.5" x2="20" y2="19.5"/></g></g></svg>', //NO I18N
			spaces:'<svg version="1.1" class="header-menu-icons" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><g><rect x="2.5" y="3.5" style="fill:none;stroke:#FFFFFF;stroke-width:1.2;stroke-miterlimit:10;" width="11" height="18"></rect><rect x="13.5" y="7.5" style="fill:none;stroke:#FFFFFF;stroke-width:1.2;stroke-miterlimit:10;" width="7" height="13"></rect><g><rect x="5" y="7" style="fill:#FFFFFF;" width="2" height="2"></rect><rect x="9" y="7" style="fill:#FFFFFF;" width="2" height="2"></rect><rect x="5" y="11" style="fill:#FFFFFF;" width="2" height="2"></rect><rect x="9" y="11" style="fill:#FFFFFF;" width="2" height="2"></rect></g><rect x="16" y="11" style="fill:#FFFFFF;" width="2" height="2"></rect><rect x="16" y="15" style="fill:#FFFFFF;" width="2" height="2"></rect><path style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10;" d="M10.5,22v-3c0-1.4-1.1-2.5-2.5-2.5h0c-1.4,0-2.5,1.1-2.5,2.5v3"></path></g></svg>', // NO I18N
            maintenances: '<svg class="header-menu-icons" viewBox="0 0 24 24" style="fill: currentColor; stroke: none;"> <g> <path d="M18.3,21.2c-0.8,0-1.6-0.3-2.2-0.9l-5.2-5.2c-3.5,1.1-7.3-0.9-8.4-4.5C2.1,9.4,2.1,8,2.5,6.8 C2.5,6.6,2.7,6.4,3,6.3c0.2-0.1,0.5,0,0.7,0.2l3.4,3.4c0.2,0.2,0.4,0.2,0.5,0l2.5-2.5c0.2-0.2,0.2-0.4,0-0.5L6.7,3.4 C6.5,3.3,6.5,3,6.5,2.7C6.6,2.5,6.8,2.3,7,2.2c2.3-0.7,4.9,0,6.6,1.7l0,0c1.7,1.8,2.4,4.3,1.7,6.7l5.2,5.2c1.2,1.2,1.2,3.2,0,4.5 C19.9,20.9,19.1,21.2,18.3,21.2L18.3,21.2z M11.1,13.9l5.7,5.7c0.9,0.8,2.2,0.8,3.1,0c0.8-0.8,0.8-2.2,0-3.1c0,0,0,0,0,0l-5.7-5.7 l0.1-0.3c1.1-3-0.5-6.2-3.4-7.3c-1-0.3-2-0.4-3-0.2l3,3c0.5,0.5,0.5,1.4,0,2l-2.5,2.5c-0.5,0.5-1.4,0.5-2,0l-3-3 c-0.6,3.1,1.4,6.1,4.5,6.7c1,0.2,2.1,0.1,3-0.2L11.1,13.9z"></path> <circle cx="18.4" cy="18.2" r="1"></circle> </g> </svg>' //NO I18N
                  }
          if(sdp_app.IS_MSPOrSCP) {
            defaultIcons['map'] = '<svg class="header-menu-icons" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-miterlimit="10"><path d="M18.4 7.9c0-3.8-3.1-6.9-6.9-6.9S4.6 4.1 4.6 7.9c0 6.3 6.9 12.7 6.9 12.7 0 .1 6.9-6.4 6.9-12.7z"/><path d="M13.9 18.4c4.6.2 8 1.2 8 2.3 0 1.3-4.7 2.3-10.4 2.3S1.1 22 1.1 20.7c0-1.1 3.5-2 8.2-2.3"/><circle cx="11.5" cy="8.2" r="2.5"/></g></svg>'; // NO I18N
            defaultIcons['accounts'] = '<svg class="header-menu-icons" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M15.5 22.5h-14v-19h14z"/><path fill="currentColor" d="M12 9h-2V7h2zM7 9H5V7h2zM12 14h-2v-2h2zM7 14H5v-2h2z"/><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M15.5 22.5h7v-15h-7z"/><path fill="currentColor" d="M18 19v-2h2v2zM18 14v-2h2v2z"/><path fill="none" stroke="currentColor" stroke-miterlimit="10" d="M6.5 16.5h4v6h-4z"/></svg>'; // NO I18N
            defaultIcons['billing'] = '<svg class="header-menu-icons" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round"><path d="M20 2.5H4.7c-1.2 0-2.2 1.1-2.2 2.4v17.3L5 19.7l2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5V6M7 7.5h6"/><path d="M17.5 16.5h4v-12c0-1.1-.9-2-2-2h0c-1.1 0-2 .9-2 2v12zM5 10.5h10M7 13.5h6"/></g></svg>'; //NO I18N
            defaultIcons['timesheet'] = '<svg class="header-menu-icons" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-miterlimit="10"><path d="M11 20H2.5V2.5h15.3V10M5.2 5.8H14"/><circle cx="17.2" cy="16.8" r="5.2"/><path d="M19.5 18.3l-2.3-1.5v-3.1M5.2 9.1H14M5.2 12.2h5.5"/></g></svg>'; //NO I18N
            defaultIcons['products'] = '<svg class="header-menu-icons" viewBox="0 0 24 24" style="fill: currentColor;"><path d="M20.7,5.3c0,0-0.1,0-0.2-0.1c-0.1-0.1-0.2-0.1-0.3-0.2l-9.6-3.2l-0.2-0.1L0.7,5.1 c-0.1,0-0.2,0.1-0.3,0.2c0,0-0.1,0-0.1,0.1C0.1,5.4,0,5.6,0,5.8v12c0,0.3,0.2,0.5,0.4,0.6l9.8,3.3c0.1,0,0.1,0,0.2,0 c0,0,0.1,0,0.1,0c0,0,0.1,0,0.1,0c0.1,0,0.1,0,0.2,0l9.8-3.3c0.2-0.1,0.4-0.3,0.4-0.6v-12C21,5.6,20.9,5.4,20.7,5.3z M10.4,2.8 l8.4,2.8l-8.6,2.7L2,5.7L10.4,2.8z M1,6.3l9,3v11.2l-9-3V6.3z M20,17.5l-9,3V9.3l9-3V17.5z"/><g><line style="fill:none;stroke:currentColor;stroke-miterlimit:10;" x1="14.9" y1="3.8" x2="5.7" y2="7.4"/></g></svg>'; //NO I18N
            defaultIcons['contacts'] = '<svg class="header-menu-icons" viewBox="0 0 24 24" style="fill: currentColor;"><g><path style="fill:none;stroke:currentColor;stroke-miterlimit:10;" d="M13.3,12.5H9.7c-4.5,0-8.2,3.7-8.2,8.2v0c0,0.4,0.4,0.8,0.8,0.8 h18.4c0.4,0,0.8-0.4,0.8-0.8v0C21.5,16.2,17.8,12.5,13.3,12.5z"/><circle style="fill:none;stroke:currentColor;stroke-miterlimit:10;" cx="11.5" cy="6" r="4.5"/></g></svg>'; //NO I18N
          }
          if (defaultIcons[id]) {
              return defaultIcons[id];
          } else {
            return '';
          }
      },
      /* Header Icon mapper for manage tabs feature
        * Maps header icons to their corresponding tabs. */
      headerIconMapperTabs: function(id) {
        var defaultIcons = {
          assets:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:currentColor;stroke:currentColor;stroke-width:.5;stroke-miterlimit:10" d="M22.2 5.6s-.1 0-.2-.1-.2-.1-.3-.2l-9.6-3.2H12L2.2 5.3c-.1.1-.2.1-.3.2 0 0-.1 0-.1.1-.2.1-.3.3-.3.5v12c0 .3.2.5.4.6l9.8 3.3h.6l9.8-3.3c.2-.1.4-.3.4-.6v-12c0-.2-.1-.4-.3-.5zM11.9 3.1l8.4 2.8-8.6 2.7-8.2-2.7zM2.5 6.6l9 3v11.2l-9-3zm19 11.2-9 3V9.6l9-3z"/></svg>', // NO I18N
          changes:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M2 7.5h3.8c2.8 0 5 2.2 5 5s-2.2 5-5 5H2m18-10h-3.9c-2.8 0-5 2.2-5 5s2.2 5 5 5H20"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="m18.6 5.2 2.2 2.2-2.2 2.3m0 5.5 2.2 2.2-2.2 2.3"/></svg>', // NO I18N
          cmdb:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:currentColor;stroke:currentColor;stroke-width:.5;stroke-miterlimit:10" d="M12 1.7c-4 0-8.3 1.1-8.3 3.1v14.8c0 2 4.3 3.1 8.4 3.1s8.4-1.1 8.4-3.1V4.8c-.1-2-4.4-3.1-8.5-3.1zm0 1c4.6 0 7.4 1.2 7.4 2.1S16.6 7 12 7 4.7 5.7 4.7 4.8 7.5 2.7 12 2.7zm0 18.9c-4.5 0-7.3-1.3-7.3-2.2v-3.7c1.5 1.1 4.5 1.6 7.3 1.6s5.8-.6 7.3-1.6v3.7c0 1-2.7 2.2-7.3 2.2zm0-5.2c-4.5 0-7.3-1.3-7.3-2.2V11c1.5 1.1 4.5 1.6 7.3 1.6s5.8-.6 7.3-1.6v3.2c0 1-2.7 2.2-7.3 2.2zm7.3-6.8c0 .9-2.8 2.2-7.3 2.2s-7.3-1.3-7.3-2.2V6.3c1.5 1 4.5 1.6 7.3 1.6s5.8-.6 7.3-1.6z"/></svg>', // NO I18N
          contracts:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M17.3 7.3c-.7-.2-1.5-.5-2.3-.5-1.7 0-3.3.5-4.7 1.5l-2.6 2.3c-.3.2-.5.7-.5 1 0 .8.6 1.4 1.4 1.4.2 0 .6-.1.8-.2l3-2.4 6.1 5.6 1.1.2v-8z"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M10 8.5H4.5v7.4l5.6 3.4c.8.5 1.7.5 2.5 0l4.3-2c.3-.1 1.4-1.2.2-2.5M1.5 6.5h3v11h-3zm18 0h3v11h-3z"/></svg>', // NO I18N
          dashboard:'<svg class="icon-md opac7" viewBox="0 0 24 24"><g><g><g><ellipse style="fill:currentColor;" cx="12.2" cy="16.6" rx="2.3" ry="2.3"></ellipse><polygon style="fill:currentColor;" points="14.3,15.7 12.5,14.3 15.4,12.3 15.4,12.3"></polygon></g><path style="fill:currentColor;" d="M20.2,18.3h-1.4c-0.4,0-0.7-0.3-0.7-0.7l0,0c0-0.4,0.3-0.7,0.7-0.7h1.4c0.4,0,0.7,0.3,0.7,0.7l0,0C20.9,18,20.6,18.3,20.2,18.3z"></path><path style="fill:currentColor;" d="M5.7,18.3H4.3c-0.4,0-0.7-0.3-0.7-0.7l0,0c0-0.4,0.3-0.7,0.7-0.7h1.4c0.4,0,0.7,0.3,0.7,0.7l0,0C6.4,18,6.1,18.3,5.7,18.3z"></path><path style="fill:currentColor;" d="M5.7,18.3H4.3c-0.4,0-0.7-0.3-0.7-0.7l0,0c0-0.4,0.3-0.7,0.7-0.7h1.4c0.4,0,0.7,0.3,0.7,0.7l0,0C6.4,18,6.1,18.3,5.7,18.3z"></path><path style="fill:currentColor;" d="M7.1,12.6l-0.9-1.1c-0.2-0.3-0.2-0.7,0.1-1l0,0c0.3-0.3,0.7-0.2,1,0.1l0.9,1.1c0.2,0.3,0.2,0.7-0.1,1l0,0C7.8,12.9,7.4,12.9,7.1,12.6z"></path><path style="fill:currentColor;" d="M13.4,10.1V8.7C13.4,8.3,13,8,12.7,8h0C12.3,8,12,8.3,12,8.7v1.4c0,0.4,0.3,0.7,0.7,0.7h0C13,10.8,13.4,10.5,13.4,10.1z"></path><path style="fill:currentColor;" d="M16.8,11.5l1-0.9c0.3-0.3,0.7-0.2,1,0.1v0c0.3,0.3,0.2,0.7-0.1,1l-1,0.9c-0.3,0.3-0.7,0.2-1-0.1v0C16.5,12.2,16.5,11.8,16.8,11.5z"></path></g><path style="fill:none;stroke:currentColor;stroke-width:1.2;stroke-miterlimit:10;" d="M22.9,18.4c0.1-0.6,0.1-1.2,0.1-1.8c0-6.1-4.8-11.1-10.7-11.1s-10.7,5-10.7,11.1c0,0.6,0,1.1,0.1,1.6"></path></g></svg>', // NO I18N
          home: '<svg class="icon-md opac7" viewBox="0 0 24 24"><g><polyline style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10;" points="18.5,8 18.5,20.5 4.5,20.5 4.5,8 	"></polyline><polyline style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10;" points="0.8,10.8 11.5,3.3 22,10.8 	"></polyline><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10;" d="M9,20v-5.2c0-1.4,1.1-2.5,2.5-2.5h0c1.4,0,2.5,1.1,2.5,2.5V20"></path></g></svg>', // NO I18N
          problems:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="m2.5 15 2.6-2.1 2.2.6m7.4 4.3 1.6 1.5-.5 3.4M8.3 10.5l-2-1.2.2-2.7m10.3 8.8 2 1.1 2.2-1.4"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="m17.7 13.9-.9 1.5-.2.3c-.5.8-1.1 1.5-2 2.1-1.7 1.2-3.9 1.8-5.5.9s-2.2-3.1-1.9-5.2c.1-1 .4-2 .8-2.7l.2-.3 1-1.5zm-5.6-7.2c-.6-1.2-.7-2.5.2-4M21.5 8c-.9 1.5-2 2.1-3.4 2.2"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M16.3 6.5c-1.3-.7-2.9-.5-4.2.2-.8.5-1.5 1.1-2 1.9l-.3.6 7.3 4.2.3-.6c.4-.8.7-1.7.7-2.7 0-1.4-.6-2.9-1.8-3.6z"/></svg>', // NO I18N
          releases:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4" d="M3.5 17.7c-.6.5-1 1.3-1.1 2.1L2 21.1l1.3-.4c.8-.1 1.5-.5 2.1-1.1-1 .1-1.8-.8-1.9-1.9 0 .1 0 0 0 0zm11.9.1-.7-2.3c4-2.5 6.3-7.1 5.8-11.9 0-.4-.4-.8-.8-.8-4.7-.6-9.3 1.7-11.9 5.8l-2.3-.7c-.1 0-.2 0-.3.1l-3.7 4.4c-.1.1-.1.2 0 .4h.1l3.9 1c-.1.4-.3 1-.4 1.4l3.2 3.2c.6-.1 1-.3 1.4-.4l1 3.9c0 .1.1.3.3.1l4.4-3.7zm-2.7-7.4c-.8-.8-.8-2 0-2.8s2-.8 2.8 0 .8 2 0 2.8c-.7.8-1.8.8-2.6.2z"/></svg>', // NO I18N
          projects:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path transform="rotate(-44.911 8.416 16.513)" style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M6.1 13.4h4.7v6.3H6.1z"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="m20.1 9.2-3.4 3.4-4.4-4.4 3.4-3.4c1.2-1.2 3.1-1.2 4.2 0l.2.2c1.2 1.2 1.2 3.1 0 4.2zm1.1 8.6-3.7 3.7c-.2.2-.5.2-.7 0L3.4 8.2c-.2-.2-.2-.5 0-.7l3.7-3.7c.2-.2.5-.2.7 0l4.4 4.4 4.4 4.4L21 17c.3.3.3.6.2.8z"/><path style="fill:currentColor;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M6.8 7.1c-.5.4-.5 1.1-.1 1.5l.1.1c.4.4 1 .4 1.4 0l.1-.1c.4-.4.4-1 0-1.4l-.1-.1c-.4-.4-1-.4-1.4 0zm9.6 9.7 2.1-2.2m-5.1-.8 2.2-2.1m-5.1-.8 2.1-2.2"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M9 20.4 4.5 16l-.7.7v4.4h4.4z"/></svg>', // NO I18N
          purchase:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:currentColor;stroke:currentColor;stroke-width:.5;stroke-miterlimit:10" d="M11.5 13v1h1v-1c.6-.1 1-.3 1.4-.6.4-.4.5-.8.5-1.4 0-.4-.1-.7-.2-1s-.4-.5-.7-.7-.7-.4-1.2-.5c-.5-.2-.8-.3-1-.5s-.3-.4-.3-.7.1-.6.3-.7c.2-.2.4-.3.8-.3.3 0 .6.1.8.4.2.2.3.6.3 1h1.1v-.1c0-.7-.2-1.2-.5-1.7-.3-.4-.7-.6-1.2-.7v-1h-1v1.1q-.75.15-1.2.6c-.4.3-.5.8-.5 1.4s.2 1 .5 1.4.9.6 1.6.9c.5.2.8.3 1 .5s.3.4.3.7-.1.6-.3.7c-.3.1-.6.2-1 .2q-.6 0-.9-.3c-.2-.2-.3-.5-.3-1v-.1H9.6v.1c0 .7.2 1.2.5 1.6.4.4.9.7 1.4.7z"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M3.5 1.5h17v20h-17zm13.5 16H7"/></svg>', // NO I18N
          reports:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M3.5 2.5h17v19h-17z"/><path style="fill:currentColor" d="M8 10h2v6H8zm3 2h2v4h-2zm3-4h2v8h-2z"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M7 17.5h10"/></svg>', // NO I18N
          requests:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M20.3 8c-.1-.1-.4-.1-.5 0-.8.6-1.9.5-2.6-.2S16.4 6 17 5.2c0-.2 0-.4-.2-.6l-1.7-1.7c-.3-.3-.6-.3-.7-.1l-11.1 11q-.3.3 0 .6l1.9 1.9c.1.1.4.1.5 0 .8-.6 1.9-.5 2.6.2s.8 1.8.2 2.6c-.1.2-.1.4 0 .5l1.7 1.7c.3.3.6.3.7.1L22 10.3q.3-.3 0-.6zm-9.2-2.3 8.1 8.1"/></svg>', // NO I18N
          solutions:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round" d="M11.5 2.1v2.1M4.1 4l1.4 1.4M18.9 4l-1.4 1.4M.9 10.6H3m17 0h2.1m-4.6 1.6c0-3.6-3.1-6.4-6.7-6-2.6.3-4.8 2.4-5.2 5s.9 4.9 2.9 6.1v2.5c0 .4.3.7.7.7h4.6c.4 0 .7-.3.7-.7v-2.5c1.8-1 3-2.9 3-5.1m-4.2 10.4H9.7z"/></svg>', // NO I18N
          support:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round" d="M4.1 11.4c0-4.7 3.6-8.6 7.9-8.6s7.9 3.9 7.9 8.6" transform="translate(0 -.218)"/><path style="fill:currentColor" d="M4.9 10.5c.6 0 1.1.5 1.1 1.1v3.7c0 .7-.5 1.2-1.1 1.2-1.6 0-2.9-1.3-2.9-2.9v-.3c0-1.5 1.3-2.8 2.9-2.8m14.2 6c-.6 0-1.1-.5-1.1-1.1v-3.8c0-.6.5-1.1 1.1-1.1 1.6 0 2.9 1.3 2.9 2.9v.3c0 1.5-1.3 2.8-2.9 2.8" transform="translate(0 -.218)"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M19.4 15.5s-.4 4.5-7.3 5.2" transform="translate(0 -.218)"/><path style="fill:currentColor" d="M10.4 19.2h1.1c.8 0 1.5.7 1.5 1.5v.1c0 .8-.7 1.5-1.5 1.5h-1.1c-.8 0-1.4-.6-1.4-1.4v-.1c0-1 .6-1.6 1.4-1.6" transform="translate(0 -.218)"/></svg>', // NO I18N
          software: '<svg class="header-menu-icons" viewBox="0 0 24 24"><g><g><circle style="fill:none;stroke:currentColor;stroke-miterlimit:10;" cx="12.5" cy="10.9" r="3"/><path style="fill:none;stroke:currentColor;stroke-miterlimit:10;" d="M6.8,16.5c-2.9-3-3.1-7.7-0.3-10.9c2.9-3.3,8-3.6,11.3-0.7s3.6,8,0.7,11.3c-0.1,0.1-0.2,0.2-0.3,0.3"/></g><g><circle style="fill:currentColor;" cx="5.7" cy="19.5" r="1"/><path style="fill:none;stroke:currentColor;stroke-miterlimit:10;" d="M3.6,16.5h17.7c0.6,0,1.1,0.6,1.1,1.4v3.2c0,0.8-0.5,1.4-1.1,1.4H3.6c-0.6,0-1.1-0.6-1.1-1.4v-3.2C2.5,17.1,3,16.5,3.6,16.5z"/><line style="fill:none;stroke:currentColor;stroke-miterlimit:10;" x1="9" y1="19.5" x2="20" y2="19.5"/></g></g></svg>', //NO I18N
          spaces:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M3.5 3.5h11v18h-11zm11 4h7v13h-7z"/><path style="fill:currentColor" d="M6 7h2v2H6zm4 0h2v2h-2zm-4 4h2v2H6zm4 0h2v2h-2zm7 0h2v2h-2zm0 4h2v2h-2z"/><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M11.5 22v-2.8c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5V22"/></svg>', // NO I18N
          maintenances: '<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M13.3 3.8c-1.7-1.7-4.1-2.3-6.5-1.5-.1 0-.1.1-.1.3v.1l3.5 3.5c.4.4.4 1 0 1.3l-2.7 2.7c-.4.4-1 .4-1.3 0L2.8 6.7c-.1-.1-.3-.1-.4 0-1.1 3.4 1.1 7 4.5 8 1.3.4 2.7.4 3.9-.1l6.3 6.3c1.1 1.1 3 1.1 3.9 0 1.1-1.1 1.1-3 0-3.9l-6.3-6.3c1-2.5.6-5.2-1.4-6.9z"/><circle style="fill:currentColor" cx="18.8" cy="18.7" r=".9"/></svg>', //NO I18N
          webtabsIcon:'<svg class="icon-md opac7" viewBox="0 0 24 24"><path style="fill:none;stroke:currentColor;stroke-width:1.4;stroke-miterlimit:10" d="M21.5 19.5h-18c-.5 0-1-.4-1-1v-13c0-.5.4-1 1-1h18c.6 0 1 .5 1 1v13c0 .5-.4 1-1 1zM2 9.5h20"/><circle style="fill:currentColor" cx="11" cy="7" r=".8"/><circle style="fill:currentColor" cx="8" cy="7" r=".8"/><circle style="fill:currentColor" cx="5" cy="7" r=".8"/></svg>', // NO I18N
        }
       
        if (defaultIcons[id]) {
            return defaultIcons[id];
        } else {
          return '';
        }
     },
      openProfile: function() {
          setTimeout(function() {
              jQuery("#userOnStatus").toggleSlider({
                  slider: true,
                  activeClass: "btn-success", // NO I18N
              });
          }, 50);
          let pbiframe_zind = 0;
          let profileslider = jQuery("#profile-slider");// NO I18N
          profileslider.show().panelSlider({
              width: 400,
              header: false,
              dialogClass: "profile-tab",  // NO I18N
              placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
              dialogClass: "tabui-rightpanel", // NO I18N
              open: function() {
              //setting the z-index of PhoneBridge iframe to avoid overlapping 
                let $pb_iframe = jQuery("#zpbsdk");
                if($pb_iframe.length > 0){
                  pbiframe_zind = $pb_iframe.css('z-index');
                  $pb_iframe.css('z-index',1);
                }
                profileslider.find(".prp-circle-lx").off("mouseenter.profile-circle mouseleave.profile-circle").on("mouseenter.profile-circle",function(){// NO I18N
                  showProfilePicOptions();
                }).on("mouseleave",function(){// NO I18N
                  toggleProfilePicOptions();
                });
                profileslider.trigger('focus'); //SD-126029
              },
              close:function(){
                //resetting the iframe z-index PhoneBridge iframe
                let $pb_iframe = jQuery("#zpbsdk");
                if($pb_iframe.length > 0){
                  $pb_iframe.css('z-index',pbiframe_zind);
                }
                 /*If the dialog is not destroyed,duplicate elements with id="profile-slider" may accumulate which leads UI issues while opening panels for custom module(s) details page */ 
                jQuery(this).dialog('destroy'); //NO I18N
                jQuery('body').removeClass("subheader-of-h"); //NO I18N
              }, beforeClose: function() {
                let innerdialod = jQuery("[role=dialog]");// NO I18N
                if(innerdialod.length > 0) {
                  innerdialod.each(function() {
                      let uicontent = jQuery(this).find('.ui-dialog-content');// NO I18N
                      if (uicontent.attr('id') !== profileslider.attr('id') && uicontent.dialog("isOpen")) {// NO I18N
                          uicontent.dialog('close');// NO I18N
                      }
                  });
                }
              }
          });
      },
      ESM: function() {
          jQuery("#esm-sidebar").show().panelSlider({
              header: false,
              placement : sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
              width: 400,
              open: function() {
                  /** Change the z-index of the "Leave a Message" content div */
                  if (jQuery(".zls-small").length) {
                      jQuery(".zls-small,.zls-sptwndw").css("cssText", "z-index:100 !important;");  // NO I18N
                  }
                  jQuery("#helpdesksection li[data-id],#aesmSidebar li[data-id], #esm-sidebar .instance-box[data-id]").on('click', function(){
                    var pId = jQuery(this).attr('data-id');
                    /** SD-105953 Switch to portal from custom module navivate to home page **/
                    var c_tab = selected_tab
                    for(var i=0; i<sdpheader_data.modules.items.length; i++) {
                      if(sdpheader_data.modules.items[i].i18n_key == selected_tab) {
                        c_tab = sdpheader_data.modules.items[i].is_dynamic ? null : selected_tab;
                      }
                    }
                    sdpAjax({
                      type: 'PUT', //NO I18N
                      url: '/api/v3/change_portal?portalid=' + pId+"&current_tab="+c_tab, //NO I18N
                      data: null,
                      dataType: 'text', //NO I18N
                      success: function(responseJson) {
                        //added this check to avoid console error when header is not loaded on that page
                        if( typeof redirectPage == 'function' )
                        {
                          redirectPage(responseJson);
                        }else
                        {
                          window.location.href = '/ui/home'; // No I18N
                        }
                      },
                      error: function(responseJson) {
                        showalert('failure', 'Error while update helpdesk details', 'isAutoHide=true'); //NO I18N
                      }
                    });
                });
                if(isMDHSetup === 'true' && sdp_app.IS_USER_ALLOW_TO_REORDER_INSTANCE === true) {
                  jQuery('#instance-list, #header-instance').removeClass('hide');
                  jQuery('#instance-reorder-list').addClass('hide');
                  $header.initializeOrganizeInstancePopUp('portal');//NO I18N
                }
              },
              close: function() {
                  /** Change the z-index of the "Leave a Message" content div */
                  if (jQuery(".zls-small").length) {
                      jQuery(".zls-small,.zls-sptwndw").css("cssText", "z-index:1000000 !important;");  // NO I18N
                  }
              },
          });
      },
      QuickActions: function() {
          jQuery("#quick-action-section").show().panelSlider({
              header: false,
              width: 480,
              placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
              dialogClass: "tabui-rightpanel", // NO I18N
              open: function(){
                $header.quickActionsEvent(jQuery("#quick-action-section"));
              }
          });
      },
      quickActionsEvent: function(container) {
        container.find('#broadcast-msg-qa').off("click.broadcast").on("click.broadcast", function () { //NO I18N
          $broadcast_mesg.broadcastMessageDialog()
        });
      },
      openNewRequest: function() {
          if(!template_settings.hasOwnProperty('is_incident_templates_available') || !template_settings.hasOwnProperty('is_service_templates_available') || !template_settings.hasOwnProperty('not_redirect_to_new_request')){
              jQuery.ajax({
                cache: false,
                async: false,
                url: "/servlet/AJaxServlet?action=GetTemplateSettings",//NO I18N
                success: function (data) {
                    template_settings={ ...template_settings, ...data};
                }
              });
          }
          if(template_settings.not_redirect_to_new_request){
              jQuery("#rt-ldr").html(ajaxBar());
              let afterRenderCallBackFunc = function(){
                jQuery('#sdp-ticket-raise-close').off('click').on("click", function(event) {
                    $header.closeSlider(this);
                });
                jQuery('#sdp-ticket-raise-incident').off('click').on("click", function(event) {
                    if(template_settings.ismerged){
                        $header.raiseATicket('mergedservice');  // NO I18N
                    }
                    else{
                        $header.raiseATicket('incidenttemplates');  // NO I18N
                    }
                });
                jQuery('#sdp-ticket-raise-service').off('click').on("click", function(event) {
                    $header.raiseATicket('servicetemplates');  // NO I18N
                });
              }
              renderhbs("#ticket-raise",'sdp-ticket-raise',{'template_settings':template_settings},false,'common',null,null,afterRenderCallBackFunc); // NO I18N
              jQuery("#ticket-raise").show().panelSlider({
                  width: 480,
                  header: false,
                  placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                  dialogClass: "tabui-rightpanel", // NO I18N
                  open: function() {
                      var ticketRaise = jQuery("#ticket-raise ");
                      ticketRaise.find(".sdtabs-ui2").removeClass("hide");
                      ticketRaise.find("#rt-ldr").remove();
                      $header.raiseATicket(template_settings.ismerged ? "mergedservice" : "incidenttemplates");  // NO I18N
                      if(ticketRaise.find(".nav-sdtabs li").length === 1){
                        ticketRaise.find(".nav-sdtabs").hide();
                        ticketRaise.find(".sdtab-content").removeClass("mt20");
                      }
                      zcomponent.collapsible_destroy('#raiseticketSTZC'); // NO I18N
                      zcomponent.collapsible_init('#raiseticketSTZC'); // NO I18N
                      zcomponent.collapsible_destroy('#raiseticketITZC'); // NO I18N
                      zcomponent.collapsible_init('#raiseticketITZC'); // NO I18N
                  },
                  close:function() {
                    /* SD-127827 Issue fix starts */
                    setTimeout(function() {
                      jQuery("#ticket-raise").dialog("destroy"); // NO I18N
                      jQuery('body').removeClass("subheader-of-h"); // NO I18N
                    },10);
                    /* SD-127827 Issue fix ends */
                  }
              });
          }
          else if(template_settings.is_default_template_enabled){
            window.location.href='/WorkOrder.do?woMode=newWO';
          }
      },
      invokeNotifications: function() {
        if(!areBellNotificationFilesLoaded){
          ResourceLoader({
            js: ["/scripts/bell-notifications.js", "/scripts/hbs-template-bell-notifications.js"],  //NO I18N
            success: function() {
			  $bellNotifications.openNotifications();
              areBellNotificationFilesLoaded = true;
              }});
        }else{
          $bellNotifications.openNotifications();
        }
      },
      invokeNotificationtones: function(event, ele){
        jQuery('body').find("[data-id='orgTabs']").removeClass('active');
         if(!areNotificationTonesFilesLoaded){
           ResourceLoader({
             js: ["/scripts/notification-tones.js", "/scripts/hbs-template-notification-tones.js"],  //NO I18N
             success: function() {
               $notificationtone.openNotificationTones(event, ele);
               areNotificationTonesFilesLoaded = true;
               }});
         }else{
           $notificationtone.openNotificationTones(event, ele);
         }
       },
       invokeReminders: function(options) {
            if(typeof $remmodule == "undefined") {
                ResourceLoader({
                    js: ["/scripts/reminder-cm.js"],//No I18N
                    success: function() {
                        $remmodule.init(options);
                    }
                })
            }
            else {
                $remmodule.init(options);
            }
        },
      //searchCategories used in both Raise a ticket in header and in Exisitng Widgets Slider panel of Dashboard
      searchCategories: function($element) {
        $element.off("keyup").on("keyup", function() {  // NO I18N
          var searchQuery = jQuery(this).val();
          searchQuery = searchQuery ? searchQuery.toLowerCase() : "";
          var tabPane = jQuery(this).closest(".sdtab-pane");  // NO I18N
          tabPane.find(".noitem").addClass("hide");
          /** Go through the all search <li> and add "show" & "hide" class based on the text that have */
          tabPane.find("li").each(function(index, el) {
              var li = jQuery(el);
              var nodeText = li.text();
              nodeText = nodeText ? nodeText.toLowerCase() : "";
              if (nodeText.indexOf(searchQuery) !== -1) {
                  li.removeClass("hide").addClass("show");
              } else {
                  li.addClass("hide").removeClass("show");
              }
          });
          /** Go through all the panel, if any <li> have queryText, then show the panel */
          tabPane.find(".panel").each(function() {
              var panel = jQuery(this);
              if (panel.find("li.show").length) {
                  panel.show();
              } else {
                  panel.hide();
              }
          });
          /** If the Search Query contains the heading of the section then show the entire panel along with their <li> */
          if (searchQuery) {
              tabPane.find(".panel").each(function() {
                  var panel = jQuery(this);
                  var nodeText = panel.find(".panel-heading").text();
                  nodeText = nodeText ? nodeText.toLowerCase() : "";
                  if (nodeText.indexOf(searchQuery) !== -1) {
                      panel.show();
                      if (!panel.find("li.show").length) {
                          panel.find("li").removeClass("hide").addClass("show");
                      }
                  } else {
                      if (!panel.find("li.show").length) {
                          panel.hide();
                      }
                  }
              });
          }
          /** If none of the panel is visible, then show "No Result Found system" */
          if (tabPane.find(".panel:visible").length) {
              tabPane.find(".noitem").addClass("hide");
          } else {
              tabPane.find(".noitem").removeClass("hide");
          }
      });
      },
      closeSlider: function(e) {
          //adding timeout to resolve the Notification Panel Close Jerking issue
          //jQuery(e).closest(".ui-dialog").find(".ui-widget-content") length is 2 for profile slider
          setTimeout(function() {
         jQuery(e).closest(".ui-dialog").find(".ui-widget-content").eq(0).dialog("close");  // NO I18N
                    }, 200);
      },
      initResizeHeader:function(){
          var layout= jQuery('body').attr('data-header-tabs');
          jQuery("#sdp-tabs li[data-index]").each(function(){
          if(layout === "topbar") {
            if(!jQuery(this).parent().hasClass('overflow-menu-ul')) {
              jQuery(this).attr("data-width",jQuery(this).outerWidth()); // NO I18N
            }
          }
          else {
            if(!jQuery(this).parent().hasClass('overflow-menu-ul')) {
              jQuery(this).attr("data-height",jQuery(this).outerHeight()); // NO I18N
            }
          }
        });
      },
      /* Header webtab loader */
      loadHeaderTabsManager: function(event, that){
        /* To prevent conflicts with other click event handlers on the same element */
        event.stopImmediatePropagation();
        /* This check for user personalized Manage Tabs*/
        if (typeof headerTabManager ==  "undefined") {
          let jsFiles = ["/scripts/manage_tabs_min.js", "/scripts/hbs-template-tabs.js"]; //NO I18N
          let homejsFiles = ["/scripts/home_scripts.js", "/scripts/hbs-template-home.js"]; //NO I18N
          let headerFiles;
          let toRemove  = homejsFiles.concat("/scripts/hbs-template-tabs.js"); //NO I18N
          if(typeof headerTabManager !== "undefined" && headerTabManager.isHomeFiles){
              headerTabManager.isHomeFiles = false;
              headerFiles = homejsFiles;
          } else {
              headerFiles = jsFiles.concat(homejsFiles);
          }
          if(window.location.hash.includes("/manage-tabs")){
              headerFiles = headerFiles.filter(jfile => !jsFiles.includes(jfile));
          }
          if (sdp_app.IS_DEVELOPMENT_MODE) {
              toRemove  = ["/scripts/home.js", "/scripts/dashboard_common.js", "/scripts/SelfServiceCustomization_TechnicianScript.js"]; //NO I18N
              headerFiles = ["/scripts/headerTabsManager.js", ...toRemove]; //NO I18N
              if(window.location.hash.includes("/manage-tabs")){
                  headerFiles = headerFiles.filter(file => file !== "/scripts/headerTabsManager.js"); //NO I18N
              }
          }
          if(window.location.pathname  == "/ui/home"){
              headerFiles = headerFiles.filter(item => !toRemove.includes(item));
            }
           
          ResourceLoader({
              js: headerFiles,
              success: function () {
                headerTabManager.getGlobalPersonalizationId("organize_tab"); // NO I18N
                headerTabManager.isHomeFiles =false;
                headerTabManager.isFilesLoaded = true;
                headerTabManager.openPanel(event, that,undefined);              }
          });
        }else{
          headerTabManager.openPanel(event, that,undefined);
        }
      },
      resizeHeader: function(skipmultiplecall) {
        var layout = jQuery('body').attr('data-header-tabs'); // NO I18N
        var isTopbar = layout === 'topbar';// NO I18N
        var constrains = isTopbar ? 'width' : 'height'; // NO I18N
        var tolerance = typeof Ember !== "undefined" ? (isTopbar ? 100 : 50) : 0; // NO I18N
        var jQbody = jQuery("body"); // NO I18N
        var sbarMenu = layout === 'sidebarlite' ? 90 : (layout === 'sidebar' ? 80 : 0); // NO I18N
    
            // Calculate the available width or height for the tabs container
            var containerConstrains = isTopbar 
                ? jQuery(window).outerWidth() - (jQbody.find('.sdp-header-logo').outerWidth() + jQbody.find('.header-icon-list').parent().outerWidth() + 100) // NO I18N
                : jQuery(window).outerHeight() - ( (jQuery("#sidebarHamIcon").length === 0 ? 55 : jQuery("#sidebarHamIcon").outerHeight()) + is_chathgt + sbarMenu); // NO I18N
    
            // Ensure valid width/height is set for container constrains
            containerConstrains = Math.max(containerConstrains, 0);
    
            // Set the width or height of the tabs container
            var tabMenu = isTopbar ? jQbody.find("#sdp-tab-menu") : jQbody.find("#sdp-tab-menu-sidebar");
            tabMenu.removeClass("of-h").css(constrains, containerConstrains); // NO I18N
    
            // Move all tabs back to the main list before recalculating
            jQbody.find("#sdp-tabs ul.overflow-menu-ul li").each(function() {
                jQuery(this).insertBefore("#sdp-tabs .overflow-menu"); // NO I18N
            });
    
            var totalTabWidth = 0;
            var tabs = jQbody.find('#sdp-tabs li[data-index]'); // NO I18N
            tabs.each(function() { // Iterate over each tab
                totalTabWidth += jQuery(this).outerWidth(true);
            });
    
            var currentConstrains = 0;
            var lastOuterElement = null;
            var activeElement = "";
            var hasActive = false;
    
            // Iterate over each tab to adjust its position based on available space
            tabs.each(function(index) {
                var $this = jQuery(this);
                currentConstrains += $this.outerWidth(true);
                hasActive = $this.hasClass("active"); // NO I18N
                /* This 5-unit offset compensates for fixed positioning or reserved layout space in the topbar to maintain visual alignment and prevent layout overlap.*/
                currentConstrains += (isTopbar ? 5 : 0); 
    
                // Move tab to overflow menu if it doesn't fit and is not active
                if (containerConstrains < currentConstrains && !hasActive) {
                    $this.appendTo("#sdp-tabs ul.overflow-menu-ul"); // NO I18N
                    jQbody.find('#sdp-tabs .overflow-menu').addClass('disp-b'); // NO I18N
                } else {
                    $this.insertBefore("#sdp-tabs .overflow-menu"); // NO I18N
                    if (jQbody.find("#sdp-tabs ul.overflow-menu-ul li").length <= 0) {
                        jQbody.find('#sdp-tabs .overflow-menu').removeClass('disp-b'); // NO I18N
                    }
                    if (containerConstrains < currentConstrains && lastOuterElement) {
                        lastOuterElement.prependTo(jQbody.find("#sdp-tabs .overflow-menu-ul")); // NO I18N
                    }
                    lastOuterElement = $this;
                }
    
                // Check if the current tab is active
                if (hasActive) {
                    activeElement = $this.find("a").attr("id") === "home" ? "home" : ""; // NO I18N
                }
    
                // Ensure the active tab remains visible
                if (index === (tabs.length - 1) && hasActive && (containerConstrains < currentConstrains)) {
                    jQbody.find("#sdp-tabs > [data-index]:not(.active):last").prependTo(jQbody.find("#sdp-tabs .overflow-menu-ul")); // NO I18N
                    jQbody.find('#sdp-tabs .overflow-menu').addClass('disp-b'); // NO I18N
                }
            });

           /**  Appending New Web tab element to header tabs **/
           if(sdp_app.licenseType === "Enterprise"){
            var overflowMenuSel = jQuery('body').find("#sdp-tabs .overflow-menu-ul");
            var headerwebtab = jQuery("#header-webtab");
            var topheader = jQuery("#top-header");
            var webTabEle = '<li class="mb0 bg-managetab pos-sticky bottom0 " id="header-webtab"><hr class="m0 mb5 mt5 headermenu-sep" id="borderwebtab"><ul class="pb5 pl0 left0 pos-sticky"><li id="header-managetabs" data-id="manageTabs" class="webtab-menu m0 pt3 pb3"><a href="/" rel="noopener noreferrer" class="m0"><div class="disp-flex valign-center"><svg class="thmicon-fill disp-ib vsub" width="16" height="16"><use href="#MAN_webtab"></use></svg><span class="maxw-100px ml5 text-overflow lh-normal">' + translate("webtab.manage.tab") + '</span></div></a></li></ul></li>';
            if (headerwebtab.length != 0) {
              topheader.find("#header-webtab").remove();
              jQuery("#header-managetabs").remove();
              overflowMenuSel.append(webTabEle);
            }
            else if(sdp_user.ROLES.includes('SDAdmin')) {
              overflowMenuSel.append(webTabEle);
            }
            overflowMenuSel.addClass('pb0');
            if (typeof Ember == "undefined" && !$header.data.isSDAdmin || sdpheader_data.isSDAdmin !== undefined && !sdpheader_data.isSDAdmin) {
              headerwebtab.remove();
            }
            let parentele = overflowMenuSel.parent();
            if(!parentele.hasClass("disp-b")){
             parentele.toggleClass('disp-b', sdp_user.ROLES.includes("SDAdmin")); // NO I18N
            }
            if(layout == "sidebar"  || layout == "sidebarlite"){
              jQuery("#header-managetabs").removeClass("pt3 pb3");
            }
            topheader.find("#header-managetabs").on("click", function (event) {
              /* To prevent from navigating and refreshing the page. */
              event.preventDefault();
              /* To toggle the tabs list type dropdown visibility */
              let listType = jQuery('#admin_tablisttype');
              if (listType.is(':visible')) {
                listType.slideUp();
              }
              /* This check for header Manage Tabs*/
              if (typeof headerTabManager ==  "undefined") {
                $header.loadHeaderTabsManager(event, this);
              }
              else{
                headerTabManager.openPanel(event, this,undefined);
              }
            });
           }
          /**  End of appending New Web tab element to header tabs **/
    
            /** Logo icon link to Home tap **/
            var homeurlconnfig = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.home_view && sdp_user.CLIENT_CONF.home_view.view) ? sdp_user.CLIENT_CONF.home_view.view : "my_view";//No I18N
            var portaltitle = (esm_details && esm_details.mdh_setup && esm_details.current_portal && esm_details.current_portal.name) ? esm_details.current_portal.name : '';
            if(window.externalframe) {
              homeurlconnfig = "my_view&externalframe=true"; // NO I18N
            }
            var logolink = {
              "link": sdp_app.IS_AE ? "/AssetHomePage.do" : "/ui/home?view_type="+homeurlconnfig,  // NO I18N
            "title": (activeElement == "home") ? "" : translate("common.goto",[translate("ssp.customize.homepage",[e_attr(portaltitle)])])  // NO I18N
            };
          jQuery("[data-id=headinstanceicon_nav]").attr({"href":logolink.link,"class":"cur-ptr","title":logolink.title}).uitooltip({content:logolink.title}).removeAttr("target"); //NO I18N
            setTimeout(function(){
              initTooltip(".sdp-header-logo");  // NO I18N
            },100)
            if(jQbody.find('#sdp-tabs .overflow-menu li').length && !jQuery("#header-managetabs").length > 0 ){
              jQbody.find("#sdp-tabs > [data-index]:not(.active):last").prependTo(jQbody.find("#sdp-tabs .overflow-menu-ul"));
            }
            if(!skipmultiplecall && Math.ceil(jQbody.find('#sdp-tabs').width()) >= Math.ceil(containerConstrains)) {
              setTimeout(function() {
                $header.resizeHeader(true);
              }, 100);
            } else {
              if(jQuery("#headerlogoloadingbar").length == 1) {
                jQuery("#header-placeholder").removeClass("pos-rel oh-i").find("#headerlogoloadingbar").remove();  // NO I18N
              }
            }
            /** Removing hr when no webtabs */
            if(jQuery(".overflow-menu-ul >li").length <= 1){
             jQuery(".sdmenu-dd.overflow-menu-ul").find("#borderwebtab").remove();            
            }
    },
    

      triggerResize: function(){
        this.initResizeHeader();
        this.resizeHeader();
      },
      raiseATicket: function(tabName) {
          var container;
          if (tabName === "servicetemplates") {
              container = jQuery("#service-tab .zcomponents");
          } else {
              container = jQuery("#incident-tab .zcomponents");
          }
          container.html(ajaxBar());
          switch (tabName) {
              case "mergedservice":  // NO I18N
                  template_obj.appendCategories({
                      filter: "hasMergedTemplates",  // NO I18N
                      id: "dd-request",  // NO I18N
                      key: "mergedservice",  // NO I18N
                      header: true,
                  });
                  break;
              case "incidenttemplates":  // NO I18N
                  template_obj.appendCategories({
                      filter: "hasIncidentTemplates",  // NO I18N
                      id: "dd-incident",  // NO I18N
                      key: "incidenttemplates",  // NO I18N
                      header: true,
                  });
                  break;
              case "servicetemplates": // NO I18N
                  template_obj.appendCategories({
                      filter: "hasServiceTemplates",  // NO I18N
                      id: "dd-service",  // NO I18N
                      key: "servicetemplates",  // NO I18N
                      header: true,
                  });
                  break;
          }
          this.searchCategories(jQuery("#ticket-raise .sdtab-pane [type='search']"));
          jQuery(".sdtab-pane .noitem").addClass("hide");
          setTimeout(function() {
              jQuery(".sdtab-pane [type='search']").val("").trigger("keyup").trigger('focus');
          }, 300);

          //Close the sidebar clicking a template in quick create
          jQuery("#HeaderRaiseTicket a[data-spa-page='requests-new']").on('click', function() {
            jQuery("#TicketRaiseClose").click();
          });
      },
      /**
       * Used to Open the search container
       * @param {string} action - Posible options open | close
       */
      searchBar:function(action){
        var jQBody = jQuery("body");
        if (action == "open") {
            jQBody.find("#sdp-tab-menu").addClass("hide");
            jQBody.find(".search-container").addClass("active bg-highlight");
            jQBody.find("#dd-searchbox").addClass("hide");
            setTimeout(function() {
                //SD-114090 => Auto select the existing searched text on clicking the search bar
                jQBody.find("#subheader_search_box").trigger('focus').select();
            }, 150);
        } else {
            jQBody.find(".search-container").removeClass("active bg-highlight");
            jQBody.find("#sdp-tab-menu").removeClass("hide");
            jQBody.find("#dd-searchbox").removeClass("hide");
            $header.resizeHeader();
        }
      },
    init: function() {
      /**
      * Keyboard Shortcuts
      */
      if (sdp_user.KB_SHORTCUTS) {
          jQuery("[tab-name=Home]").parent().attr("title", translate("sdp.header.home") + " [g h]"); // NO I18N
          jQuery("#requests").attr("title", translate("sdp.header.requests") + " [g r]");
          jQuery("#subheader_search_box").attr("placeholder", function() {
              return jQuery(this).attr("placeholder") + " [ / ]";
          });
      }
      // ********* Dropdown Script Starts ***********
      jQuery(".temp-menu .dd-request").css("max-height", jQuery(window).innerHeight() - 200); // NO I18N
      //remove the keypress events
      jQuery(".temp-menu input[data-id=search-service]").on("keydown", function(e) {
          var key = e.which;
          if (key == 38 || key == 40) {
              //DOWN and UP key
              e.stopPropagation();
          }
      });
      jQuery(document).on("mouseover", ".temp-menu ul li ul", function() {
          jQuery(".temp-menu ul li ul").niceScroll({
              cursorcolor: "#ccc", // NO I18N
              cursorwidth: 7,
              autohidemode: false,
              horizrailenabled: false
          });
      });
      jQuery(document).on("mouseleave", ".temp-menu ul li ul", function() {
          jQuery(".temp-menu ul li ul").niceScroll().remove();
      });
      jQuery(document).on("mouseover", ".temp-menu li.sdmenu-submenu>a", function() {
          dropdownAlign(this);
      });
      /** User profile link is not opening inthe ember page */
      if(typeof Ember !== "undefined"){
          jQuery("#hdr-usermenu").on('click', function(e) {
            e.preventDefault();
              jQuery(this).parent().toggleClass("open"); // NO I18N
          });
         /* Prevent hiding Filtermenu on clicking over or inside it */
          jQuery('#top-header .showmenu').on('click',function (event) {//NO I18N
            var events = jQuery._data(document, 'events') || {};//NO I18N
            events = events.click || [];
            for(var i = 0; i < events.length; i++) {
              if(events[i].selector) {
                //Check if the clicked element matches the event selector
                if(jQuery(event.target).is(events[i].selector)) {
                  events[i].handler.call(event.target, event);
                }
                // Check if any of the clicked element parents matches the
                // delegated event selector (Emulating propagation)
                /* eslint-disable no-loop-func */
                jQuery(event.target).parents(events[i].selector).each(function(){
                  events[i].handler.call(this, event);
                });
                /* eslint-enable no-loop-func */

              }
            }
            event.stopPropagation(); //Always stop propagation
          });
      }
      /**
       * Initialize the theme
       */
      ThemeCustomizer.init();
      /** Initialize the Header more option codes */
      setTimeout(function(){
        $header.triggerResize();
        jQuery(window).trigger('resize');
        jQuery(window).off("resize.header-more-option").on("resize.header-more-option",function(){ // NO I18N
          $header.triggerResize();
        });
      },100);
  },
  openApprovalNotifications: function(from_header, associated_entity, entity_id, level_id, approval_id, stage_id, portal_id, fromShowAllListView) {
    var module_name = (associated_entity == 'purchase_request' || associated_entity == 'purchase_order') ? 'purchase' : associated_entity; //No I18N
    if(!fromShowAllListView && !from_header){
      sdp_app.approval_slider_opened_from = module_name;
    }
    // Getting the approval response from the show all approvals list view or home page widget
    var approval_response = (from_header) ? null : {'approvals' : (fromShowAllListView) ? $approvalsTable.tableInstance.visibleContents : $home_page.approvals[module_name]}; //No I18N
    if($header.areApprovalNotificationFilesLoaded != true){
      ResourceLoader({
        js: [`/scripts/approval_header.js`],
        success: function() {
          headerApprovals.processApprovals(from_header, associated_entity, entity_id, level_id, approval_id, stage_id, portal_id, approval_response);
          $header.areApprovalNotificationFilesLoaded = true;
        }
      });
    }else{
      headerApprovals.processApprovals(from_header, associated_entity, entity_id, level_id, approval_id, stage_id, portal_id, approval_response);
    }
  },
  bindEvents: function() {
    jQuery("#quick-action-section a").on('click', function() {
      jQuery("#closeQuickAction").click();
    });
  },
  addAssetQuickAction: function(){
    const options = {
      dialogTitle : translate("common.add.assetorcomponent"),
      module:"asset",//No I18N
      placeHolder:translate("sdp.admin.product.typejserror"),
      url:"/api/v3/asset_assets/module",//No I18N
      list_info:{"search_criteria":{"field":"internal_name","value":"Asset","condition":"is not","logical_operator":"AND"}}, //No I18N
      pageUrl:"/ui/asset?module",//No I18N
      labelText:translate("sdp.helpdesk.common.citype"),
      errorMsg:translate("ae.admin.asset.productType.select.mandatory")
    }
    this.renderQuickActionPopup(options);
   },
   renderQuickActionPopup:function(options){
    if(typeof $assetQuickAction == "undefined") {
      ResourceLoader({
       js: sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/asset_quick_action.js"] : ["/scripts/asset_quick_action_min.js","/scripts/hbs-template-asset-quick-actions.js"], // No I18N
        success: function(){
         $assetQuickAction.init(options);
       }
      });
     } else {
       $assetQuickAction.init(options);
     }
   },
   addCIQuickAction: function(){
    const options = {
      dialogTitle : translate("ae.cmdb.quick.action.title"),
      module:"cmdb",                                                //No I18N
      placeHolder:translate("ae.cmdb.selectcitype"),
      url:"/api/v3/cmdb/module",                                        //No I18N
      list_info:{"search_criteria":{"field":"name","value":"cmdb","condition":"is not","logical_operator":"AND"},"fields_required":["name","api_plural_name","parent","display_name"]}, //No I18N
      pageUrl:"/ui/cmdb_module?ci_type",                             //No I18N
      labelText:translate("ae.cmdb.admin.citype.citype"),
      errorMsg:translate("ae.cmdb.quick.action.mandatory.error.msg")
    }
    this.renderQuickActionPopup(options);
   },
             openNotificationTones:function(event,ele)
             {
                   event.stopImmediatePropagation();
                   if(jQuery(ele).hasClass("active"))
                   {
                     jQuery("#notificationTones").dialog("close");//No I18N
                     return;
                   }
                   jQuery(ele).addClass("active")
                    if(jQuery("#notificationTonesContent").length==0)
                    {
                      jQuery.ajax({
                           url: "/jsp/NotificationTones.jsp",// NO I18N
                           async: false,
                           success: function (resp) {
                                jQuery("#notificationTones").append(resp);// NO I18N
                           }
                       });
                   }
                   var target = jQuery('#profile-slider');
                   jQuery("#notificationTones").show().panelSlider({
                         width: 400,
                         header: false,
                         placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                         position:{
                                     my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                                     at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
                                      of : target
                                 },
                         dialogClass: "tabui-rightpanel", // NO I18N
                         modal: false,
                         open:function(){
                            var notificationTone = sdp_user.CLIENT_CONF.notificationTone;
                            var data =[{"id":"notifTonesAnnouncements" ,"key":"sdp.home.announcement.label"},{"id":"notifTonesBroadcast","key":"broadcast.msg.label",},{"id":"notifTonesChat","key":"sdp.dc.dcmenu.tools.chat"},{"id":"notifTonesTechnician","key":"sdp.admin.notificationrules.techNotifications",}];  // NO I18N
                            if(notificationTone)
                          {
                            data[0].tone = notificationTone.GeneralNotifications && notificationTone.GeneralNotifications.Announcement?notificationTone.GeneralNotifications.Announcement:"None"; // NO I18N
                            data[2].tone = notificationTone.chat?notificationTone.chat.new_chat_request:"None"; // NO I18N
                            data[3].tone = notificationTone.DynamicNotifications?notificationTone.DynamicNotifications.notifCount:"None"; // NO I18N
                            data[1].tone = notificationTone.GeneralNotifications && notificationTone.GeneralNotifications.broad_cast_mesg?notificationTone.GeneralNotifications.broad_cast_mesg:"None"; // NO I18N
                          }
                          else
                          {
                            data[0].tone =  data[1].tone =  data[2].tone = data[3].tone = "None";
                          }
                          var is_chat_enabled = sdp_app.IS_SDP_CHAT_ENABLED;
                            if (is_chat_enabled && sdp_user.USERTYPE == "Requester") {
                                is_chat_enabled = sdp_app.IS_CHAT_ENABLED_FOR_USER;
                            }
                            if(!is_chat_enabled)
                            {
                                    data[2]=data[3];
                                    data = data.slice(0,3);
                            }
                            if(sdp_user.ROLES.indexOf("ViewAnnouncements")==-1)
                            {
                                     data = data.slice(1);
                            }
                          renderhbs("#notificationTones","notificationTonesContent",data); // NO I18N
                         jQuery("#notificationTones").find(".form-control ").on("change",function(){
                           if(jQuery(this).val()!="None"){
                             jQuery("#"+jQuery(this).attr("id")+"Icon").show();
                           new Audio('/sounds/'+jQuery(this).val()+".mp3").play();// NO I18N
                           }
                            else
                            {
                              jQuery("#"+jQuery(this).attr("id")+"Icon").hide();
                            }
                           });
                            jQuery("#notificationTones").find(".play-normal ").on("click",function(){
                            var tone = jQuery("#"+jQuery(this).attr("for")).val();
                            if(tone!="None"){
                             new Audio('/sounds/'+tone+".mp3").play();// NO I18N
                             }
                             });
                             jQuery("#notificationTones span").hover(function(){
                                 jQuery(this).removeClass("play-normal");
                                 jQuery(this).addClass("play-selected");
                              },function(){
                                jQuery(this).removeClass("play-selected");
                                jQuery(this).addClass("play-normal");
                             }
                              )
                               jQuery("#close-profile-slider").hide();
                         },
                         close:function(){
                            //SD-104151 issuefix
                            jQuery(this).dialog('destroy'); // NO I18N
                            jQuery("#notificationTones").html("");
                            jQuery("#close-profile-slider").show();
                            jQuery(ele).removeClass("active");
                            jQuery(ele).blur();
                         }
                         });
                        $header.openDialogCheck();
            			},
                        openDialogCheck:function(){
                          if (jQuery("#customize_tabs").hasClass("ui-dialog-content")) {
                            jQuery("#customize_tabs").dialog("close");//No I18N
                          }
                          $landing.closeDialogCheck();
                        },
                           saveNotificationTones:function()
                           {
                               var chatTone= jQuery("#notifTonesChat").val();
                               var announcementTone =  jQuery("#notifTonesAnnouncements").val();
                               var broadcastTone = jQuery("#notifTonesBroadcast").val();
                               var dyanmicNotificationsTone = jQuery("#notifTonesTechnician").val();
                               var doNotDisturb = jQuery('#dnd:checked').val();
                               var data={};
                               if(chatTone!="None")
                               {
                                   data.chat={"new_chat_request":chatTone,"new_chat_message":chatTone}; //No I18N
                               }
                               if(announcementTone!="None" || broadcastTone!="None")
                               {
                                   data.GeneralNotifications={};
                                   if(announcementTone!="None")
                                   {
                                       data.GeneralNotifications.Announcement = announcementTone;
                                   }
                                   if(broadcastTone!="None")
                                   {
                                       data.GeneralNotifications.broad_cast_mesg=broadcastTone;
                                   }
                               }
                               if(dyanmicNotificationsTone!="None")
                               {
                                   data.DynamicNotifications={};
                                   data.DynamicNotifications.notifCount=dyanmicNotificationsTone;
                               }
                               options = {"is_portalspecific":false}; //No I18N
                               ClientUtil.addUserPersonalization("notificationTone",data);//No I18N
                               sdp_user.CLIENT_CONF.notificationTone = data;
                               window.showalert('success', translate("api.saved.success",[translate("sdp.notification.tones")]), "isAutoHide=true"); // No I18N
                           },
						   closeAccountPopup:function(e)
							{
								jQuery(e).closest(".ui-dialog").find(".ui-widget-content").dialog("close");//No I18N
								setTimeout(function () {jQuery('#accountInfo').removeClass('ui-dialog-content ui-widget-content');}, 500);
               },
  ADMPCreateUserhtmlRender : function(menuID,WOID){
    ResourceLoader({
      js: ["/integration/resources/admp/scripts/admp_create_user.js","/integration/resources/admp/scripts/admp_common.js"],//No I18N
      success :function() {
        CreateUser.initFunc(menuID,WOID);
      }
    });
  },
  initializeOrganizeInstancePopUp : function(from) {
    ResourceLoader({
      js: ["/scripts/organize-instance.js"],//No I18N
      success :function() {
        $reorder_instances.init(from);
      }
    });
  },
  //Add new vendor form
   loadVendorPopup:function(module,fieldData){
    if(typeof $vendorPopup == "undefined"){
        ResourceLoader({
            js: ["/scripts/vendorScript.js"],  //No I18N
            success: function() {
                $vendorPopup.open(module,fieldData);
            }
        });
    }else{
        $vendorPopup.open(module,fieldData);
    }
 }
};

//check duplicates in a json
function checkForDuplicates(json,name,curindex){
    var result;
    if(name){
        result=json.filter(function(item,index){
          if(index!=curindex){
              return (name.toUpperCase()==item.name.toUpperCase());
          }
          else{
             return false;
          }
      })
      return result.length>0;
    }
}

//cloning a json object. This is used in many places in ember
function cloneJson(json){
      var strJson=JSON.stringify(json);
      var dupJson=JSON.parse(strJson);
      return dupJson;
}

//convert JSONArray to Javascript Array
function convertToArrFormat(jsonArr,attrNames){
    var strArr=[],id;
    for(var i=0;i<jsonArr.length;i++){
        id=null;
        for(var j=0;j<attrNames.length;j++){
            attr=attrNames[j];
            id=id||jsonArr[i][attr];

            if(id){
              strArr.push(id);
              break;
            }
        }
    }
    return strArr;
}


// Load common svg icon code
jQuery(document).ready(function(){
  jQuery("#common-svg-code").load('/images/shadow/ui-common-shadow.html'); //NO I18N
});


/** show Desktop Central dependent component downalod and install dialog.
 *  @onDCInstalledCB: callback function to handle events after the Desktop Central 's dependent component has been installed.
 */
function showDCBundleDialog(onDCInstalledCB) {
	if(sdp_app.IS_MSPOrSCP && !featureStatus().is_dc_enabled){
		return;
	}
    if(showDCBundleDialog.isInitialized) {
        return installDC.init(onDCInstalledCB);
    }
    jQuery("body").append("<div id='_dc_install_container'></div>");
    jQuery("#_dc_install_container").load("/DCActions.do?action=show_dc_bundle_page", function (responseTxt, statusTxt) {//NO I18N
        if (statusTxt === "success") {//NO I18N
            showDCBundleDialog.isInitialized = true;
            jQuery("#_dc_install_container").html(responseTxt); //adding HTML for the required dialog boxes.
            installDC.init(onDCInstalledCB);
        } else if (statusTxt === "error") {//NO I18N
            showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"), 'isAutoHide=true'); //No i18N
        }
    });
}
//OD Banner Code
var showODAD = function() {
  return {
    isNotified: false,
    init: function() {
      if(!sdp_app.IS_MSPOrSCP && sdp_app.IS_SDP && sdp_user.ROLES.includes("SDAdmin") && jQuery("#sdp-tab-menu").length && !showODAD.isNotified && !(sdp_user.CLIENT_CONF.OD_AVAILABLE_BANNER && sdp_user.CLIENT_CONF.OD_AVAILABLE_BANNER.DONT_SHOW)) {
        showODAD.isNotified = true;
        jQuery.fn.notifyWidget({
          title:'',
          closeBtn: false,
          headericon: false,
          autoClose: false,
          custClass:'od-main', //NO I18N
          content:'<div><div class="fw disp-t od-ad-pro"><div class="disp-c"><div></div></div><div class="disp-c pos-rel"><div class="mb10 text-color8"><div class="od-txt tr">'+translate('support.ODBanner.alsoAvailable')+'<a class="pos-rel disp-ib od-adicons-white od-ad-anchor">'+translate('support.ODBanner.ontheCloud')+'</a></div><span class="cspr icon-md p-close cur-ptr pos-abs top5" style="right:5px;transform: scale(0.5);" title="'+translate('sdp.dashboard.common.messages.dontshowagain')+'" id="ad-close" data-id="showodadclose"></span></div><button class="btn-sm btn od-ad-white" data-id="showodadmore" rel="uitip" title="'+translate('ODBanner.more.tooltip')+'">'+translate('sdp.common.more')+'</button></div></div></div>',//No i18N
          callbackfn: function() {
            let container = jQuery('.od-ad-pro');//No i18N
            container.find('[data-id="showodadmore"]').off("click").on("click",function(event) {//No i18N
              showODAD.more();
            });
            container.find('[data-id="showodadclose"]').off("click").on("click",function(event) {//No i18N
              showODAD.close();
            });
          }
        }),
        jQuery('.od-main').parent().css('display','block'), //NO I18N
        initTooltip(".notify-ui-dialog-content"); //NO I18N
      }
    },
    //Help popup menu alert close prevention
    helpAlertInit: function() {
      jQuery(".helpalert").on('click', function(t) {
        if(jQuery("#helpclose").is(t.target)){
          jQuery("#helpalert-content").css("display", "none"); //NO I18N
          t.stopPropagation();
        }
        else{
          t.stopPropagation();
        }
      });
    },
    more: function(){
      var w = window.open('https://www.manageengine.com/products/service-desk/hosted-on-premise-vs-saas-cloud.html', "target=_blank");
      w.opener = null;
    },
    close: function(){
      jQuery('.od-main').remove(); //NO I18N
      ClientUtil.addUserPersonalization("OD_AVAILABLE_BANNER", {"DONT_SHOW": true}); //NO I18N
    }
  }
}();
//End OD Banner Code

//Start Last login date and time Banner Code
var showLastLoginBanner = function () {
  return {
    init: function (notify_last_login_time, isAutoHide) {
      if (notify_last_login_time != undefined && notify_last_login_time.SHOW) {
        var htmlContent = '';
        var customClass = '';
        if (isAutoHide) {
          customClass = 'login-notify login-notify-success';//NO I18N
          if (notify_last_login_time.SUCCESS && notify_last_login_time.FAILED) {
            var successContent = '',
            withsuccess = '';
            if (notify_last_login_time.SUCCESS != '-') {
              successContent = '<div class="m10 mt15 text-color6 disp-t"><div class="disp-c">' + translate('sdp.last.successful.login') + '</div><div class="pl3 pr3">:</div><div class="disp-c">' + notify_last_login_time.SUCCESS + '</div></div>';
              withsuccess = ''; //NO I18N
            }
            var failedContent = '';
            if (notify_last_login_time.FAILED != '-') {
              failedContent = '<div class="m10 mt15 text-color6 disp-t"><div class="disp-c '+withsuccess+'">' + translate('sdp.last.failed.login') + '</div><div class="pl3 pr3">:</div><div class="disp-c">' + notify_last_login_time.FAILED + '</div></div>';
            }
            if (successContent != '' || failedContent != '') {
              var classCheck = (successContent && failedContent) ? "vtop" : "";//NO I18N
              htmlContent = '<div class="disp-t mr20 logout-pop"><div class="disp-c '+classCheck+'"><img src="/images/logout.svg"/></div><div class="disp-c">' + successContent + failedContent + '</div></div>';
            }
            if((successContent != '' && failedContent == '') || (successContent == '' && failedContent != '')){
              customClass = 'login-notify login-notify-success only-success-fail';//NO I18N
            }
          }
        } else {
          var concurrentLoginTitle = '';
          var concurrentLoginDesc = '';
          customClass = 'login-notify login-notify-fail';//NO I18N
          if (notify_last_login_time.SUCCESS && notify_last_login_time.HOSTNAME) {
            concurrentLoginTitle = translate('sdp.success.concurrent.login.attempt.title');
            concurrentLoginDesc = translate('sdp.success.concurrent.login.attempt.desc', [notify_last_login_time.SUCCESS, notify_last_login_time.HOSTNAME,"<a  data-action='login-detector-banner' href='/'>"+translate('sdp.common.clickhere')+"</a>"]);
          } else if (notify_last_login_time.FAILED) {
            concurrentLoginTitle = translate('sdp.failed.concurrent.login.attempt.title');
            concurrentLoginDesc = translate('sdp.failed.concurrent.login.attempt.desc', [notify_last_login_time.FAILED]);
          }
          if (concurrentLoginTitle != '' && concurrentLoginDesc != '') {
            htmlContent = '<div class="loginnotify-alert"><div class="alert alert-warning icon mb0 m10" role="alert"><span class="msg">' + concurrentLoginTitle + '</span></div></div><div class="disp-t p10 mr30">' + concurrentLoginDesc + '</div>';
          }
        }
        if (htmlContent != '') {
          setTimeout(function () {
            jQuery.fn.notifyWidget({
              title: '',
              content: htmlContent,
              custClass: customClass,
              autoClose: isAutoHide,
              timeDelay: 5000,
              position: "BR", //NO I18N
              callbackfn: function()
              {
				 jQuery('[data-action="login-detector-banner"]').click(function(event){  //No I18N
				    event.preventDefault();
					NewWindow('/Language.do#password','preferences','950','650','yes','center',undefined,undefined,undefined,true);
				});
			  }
            });
          }, 1500);
        }
      }
    }
  }
}();
//End Last login date and time Banner Code

//Code moved to preview_component.js


function openSecurityPopup (fromSecuritySettings,fromAttachmentSettings)
{
  function initializePanelSlider() {
      jQuery('#securityBanner').show().panelSlider({
          width: 480,
          header: false,
          placement: sdp_user.DIRECTION === 'RTL' ? 'left' : 'right',// NO I18N
          dialogClass: 'tabui-rightpanel',// NO I18N
          open: function () {
            // fromSecuritySettings will be true if the security banner open from security settings.
              // fromSecuritySettings will be undefined if security banner open from banner notification.
              if (fromSecuritySettings !== undefined) {
                  sdpheader_data.security_banner[0].fromSecuritySettings = true;
              } else {
                  sdpheader_data.security_banner[0].fromSecuritySettings = false;
              }
              if (fromAttachmentSettings !== undefined) {
                  sdpheader_data.security_banner[0].fromAttachmentSettings = true;
              } else {
                  sdpheader_data.security_banner[0].fromAttachmentSettings = false;
              }
              // invoking securitybanner donut
              renderhbs('#securityContainer','security-banner',sdpheader_data,false,'security_banner',true,false,function(){// NO I18N
                   jQuery('[data-id="advanced-security-link"]').on("click", function() { jQuery('#securityBanner').dialog('close'); setTimeout(function() { window.location.reload();}, 1000); });// NO I18N
                   jQuery('[data-id="security-link"]').on("click", function() { setTimeout(function() {window.location.reload();}, 1000); });// NO I18N
              });

              jQuery('#donutSecurityBanner').progressDonutBar();
          },
          close: function () {
              jQuery('#securityContainer').html('');
          }
      });
      initTooltip('.sub-header-panel-title');// NO I18N
  }
  if (Handlebars.templates === undefined || Handlebars.templates['security-banner'] === undefined) {
      ResourceLoader({
          js: ['/scripts/hbs-template-security_banner.js'],
          success: function () {
              initializePanelSlider();
          }
      });
  } else {
      initializePanelSlider();
  }
}

function closeSecurityPopup(e)
{

	jQuery('body').removeClass("subheader-of-h");
     setTimeout(function() {
          jQuery(e).closest(".ui-dialog").find(".ui-widget-content").dialog("close");  // NO I18N
    }, 80);
}
/**
 * A funciton, to get URL params
 * @param {string} url
 * Function will return as key, value pair like {'name' : 'Test','id':1};
*/
function getSDPURLParams(url){
  var searchParams = new URLSearchParams(url || window.location.search);
  var paramObj = {};
      searchParams.forEach(function(value, key) {
        paramObj[key] = trim(value) || "";
      });
      return paramObj;
}

// Inline Translations Code Begins
function editTranslations(){
  jQuery("#cancel_translations").removeClass('hide');
  jQuery('[data-i18n-key]').each(function(e){
    var text = e_html(jQuery(this).text());
    var key = jQuery(this).attr('data-i18n-key');
    if(jQuery(this).find("span.translate-anim").length==0) {
        jQuery(this).html("<span class='translate-anim pos-rel' data-id='invokeTranslatePopup' data-i18njsp-key='"+key+"'>" + text + "</span>");
    }
  });
    if(!jQuery("#cancel_translations").hasClass('hide')) {
        jQuery(document).off("keydown").on("keydown", function(e) { //NO I18N
            if (e.keyCode == 27 && !jQuery("#cancel_translations").hasClass('hide') && jQuery("#cancel_translations").attr('data-popup') == 'false') {
                closeTranslations();
            }
        });
    }
    jQuery("#cancel_translations").draggable({
		containment: "parent", //No I18N
        handle: "span", //No I18N
        axis: "X" //No I18N
    });
    jQuery('[data-i18n-key]>span[data-id="invokeTranslatePopup"]').click(function(evt) {
      invokeTranslatePopup(evt, this.dataset.i18njspKey)
    });
}
//Closing the Translations View mode
function closeTranslations() {
    jQuery("#cancel_translations").addClass('hide');
    jQuery('[data-i18n-key]').each(function(){
        if(jQuery(this).find('span.translate-anim').length != 0) {
            var text = e_html(jQuery(this).find('span.translate-anim').text());
            jQuery(this).html(text);
        }
    });
}
// Inline Translation Popup
function translatevalidatefn(formobject) {
	jQuery.validator.addMethod("xsscodefn", function(value, element){ //No I18N
		if(value.indexOf("<") != -1 || value.indexOf(">") != -1) {
			return false;
		} else {
			return true;
		};
	});
	formobject.validate({
		rules: {
			inputkey: {
				required: true,
				xsscodefn: true
			}
		},
		errorClass: 'text-danger', //NO I18N
		messages: {
			inputkey: {
				required: translate("common.field.validation.check",[translate("common.values")]),
				xsscodefn: translate("apicodes.4001") + ': <strong> < > </strong>',
			}
		},
		errorPlacement: function (error, element) {
			var position = element.position();
			error.insertAfter(element);
			error.addClass('alert alert-danger alert-arrow p5 pos-abs left0').css({'z-index': '1','top':element.outerHeight()+'px'});//NO I18N
		}
	});
}
function invokeTranslatePopup(e,key){
    e.stopImmediatePropagation();
    e.preventDefault();
	if(jQuery('.btn-group.open,.sdmenu.open,.filter-menu.open').length != 0) {
		jQuery('.btn-group.open,.sdmenu.open,.filter-menu.open').removeClass("open");
	}
	if(jQuery('#RefreshRateMenu.RefreshRateMenu-active').length != 0) {//Task home page setting dropdown option in mouse over/out
		jQuery('#RefreshRateMenu.RefreshRateMenu-active').removeClass("RefreshRateMenu-active");
		jQuery('#RefreshRateMenu #reqRefreshMenu').hide();
	}
    var title= translate("common.translate");
    var url="/jsp/TranslationPopup.jsp?i18key="+key; //No I18N
    jQuery("#TranslationDiv").load(url, function(){
        var opt = {
          modal: true,
          width: 400,
          title: title,
          closeOnEsc:false,
          draggable: false,
          resizable: false,
          open: function(){
            jQuery('#cancel_translations').attr('data-popup','true');
			setTimeout(function() {
				translatevalidatefn(jQuery("#inlinetranslationfrm"));
			},100);
          },
          close: function(){
            setTimeout(function() {
                jQuery('#cancel_translations').attr('data-popup','false');
            },100);
            jQuery("#TranslationDiv").html("");
          }
        };
        jQuery("#TranslationDiv").dialog(opt); //No I18N
    });
}
function onTranslationModify(key,element){
	var keyval = document.getElementById(key).value;
	if(element) {
		var isvalid = jQuery("#inlinetranslationfrm").valid();
		if(keyval == undefined) {
			var formid = document.getElementById("inlinetranslationfrm");
				keyval = formid.inputkey.value;
		}
	} else {
		var keyanc = jQuery(document.getElementById(key + "_anchor")).get(0);
		var keyid = jQuery(keyanc).find("form");
		translatevalidatefn(jQuery(keyid));
		var isvalid = jQuery(keyid).valid();
	}
	if(!isvalid) {
		return false;
	}
    var data = {
        action: "modify",   // No I18n
        key: key,
        value: keyval,
        language: parent.TRANSLATION_LANGUAGE || sdp_user.LOCALE
    };
    sdpAjax({
        type: "POST", // NO I18N
        url: "/servlet/I18nServlet",  // NO I18N
        data: data,
        ignorefailuremessage: true,
        success:function (response) {
			var decodedText = jQuery("<p/>").html(response.result.new_value).text();
            if(element) {
				if(typeof Ember == "undefined") {
					if(window.base_prop != undefined && window.base_prop[key] != undefined) {
						window.base_prop[key] = decodedText;
					}
				}
                jQuery('[data-i18n-key="'+key+'"]').find('span.translate-anim').html(e_html(decodedText));
                jQuery("#TranslationDiv").dialog("close");// NO I18N
                showalert("success",translate("sdp.common.content") + ' ' + translate("common.ismodified"),"isAutoHide=true");  //No I18N
            } else {
                document.getElementById(key + "_value").innerText = decodedText;
                document.getElementById(key + "_anchor").innerHTML =
                    '<div class="pt15 ml20">' +   // No I18n
                    '<button id="' + key + '_a" data-id="editTranslation" data-i18njsp-key="' + key + '" class="btn-link btn-xs" ><span class="cspr edit2 flat icon-sm mr5 onhover top-2"></span>' + translate("sdp.admin.translation.modify") + '</button>' +   // No I18n
                    '&nbsp;&nbsp;&nbsp;' + '<button data-id="resetTranslation" data-i18njsp-key="' + key + '"class="btn-link btn-xs" ><span class="sdp-glyph sdp-glyph-rotate-left icon-sm mr5 flat"></span>' + translate("sdp.admin.translation.reset") + '</button>' +  // No I18n
                    '</div>';   // No I18n
                jQuery("#my-modif").text(response.result.my_modification_count);
            }
        },
        error: function (response) {
            if(response.responseJSON) {
                showalert('failure', e_html(response.responseJSON.response_status.messages[0].message.message), '');         // No I18n
            } else {
                showalert('failure', translate('sdp.common.error.unknown'), '');     // No I18n
            }
        }
    });
    return false;
}

/**
 * Removed the translation done already and sets the default value.
 */
function onTranslationReset(key,element) {
    var data = {action: "reset",        // No I18n
        key:key,
        language: parent.TRANSLATION_LANGUAGE || sdp_user.LOCALE
    };

    sdpAjax({
        type: "POST", // NO I18N
        url: "/servlet/I18nServlet",  // NO I18N
        data: data,
        ignorefailuremessage: true,
        success:function (response) {
            if(element) {
				if(typeof Ember == "undefined") {
					if(window.base_prop != undefined && window.base_prop[key] != undefined) {
						window.base_prop[key] = e_html(response.result.new_value);
					}
				}
                jQuery('[data-i18n-key="'+key+'"]').find('span.translate-anim').html(e_html(response.result.new_value));
                jQuery("#TranslationDiv").dialog("close");// NO I18N
                showalert("success",translate("sdp.requests.history.restored"),"isAutoHide=true");  //No I18N
            } else {
                document.getElementById(key + "_value").innerText = response.result.new_value;
                document.getElementById(key + "_anchor").innerHTML =
                    '<div class="pt15 ml20">' +   // No I18n
                        '<button id="' + key + '_a"  data-id="editTranslation" data-i18njsp-key="' + key + '" class="btn-link btn-xs" ><span class="cspr edit2 flat icon-sm mr5 onhover top-2"></span>' + translate("sdp.admin.translation.modify") + '</button>'+    // No I18n
                    '</div>';   // No I18n
                jQuery("#my-modif").text(response.result.my_modification_count);
            }
        },
        error: function (response) {
            if(response.responseJSON) {
                showalert('failure', response.responseJSON.response_status.messages[0].message.message, '');         // No I18n
            } else {
                showalert('failure', translate('sdp.common.error.unknown'), '');     // No I18n
            }
        }
    });
}

// Inline Transaltion Code ends


// *****************************************************************************
// Admin > Translations related scripts.
// *****************************************************************************
/**
 * The selected language in Admin > Translations section will be loaded.
 */
function selectLanguage(selObj) {
    jQuery("#I18NContent").load("/SetUpWizard.do?forwardTo=translations&contentOnly=true&language=" + selObj); // No I18N
    return false;
}
/**
 * Loads the form for editing a particular text. The text that is displayed will be populated by default.
 */
function loadTranslationEditForm(key) {
    var formCode =
        '<form data-id="onTranslationModify">' +      // No I18n
            '<div class="cmtboxptr mt4 ml20">' +    // No I18n
                '<div class="cmtbox p10">' +    // No I18n
                    '<span class="cspr edit2 flat icon-sm mr5 onhover top-2"></span>' +    // No I18n
                    '<div class="mr10 pos-rel disp-ib" for="' + key + '"><input type="text" name="inputkey" class="form-control disp-ib" id="' + key + '" value="" style="width: 500px;"></div>' +    // No I18n
                    '<button type="submit" title="'+translate("common.save")+'" rel="uitip" class="btn btn-xs btn-link"><span class="cspr icon-sm success vsub"></span></button>' +    // No I18n
                    '<button title="'+translate("common.cancel")+'" rel="uitip" class="btn btn-xs btn-link"><span class="cspr icon-sm danger vsub mr5" data-id="translationModifyCancel"  data-i18njsp-key="'+key+'"></span></button>' +    // No I18n
                '</div>' +    // No I18n
            '</div>' +   // No I18n
        '</form>';  // No I18n
    document.getElementById(key + "_bck").innerText = document.getElementById(key + "_anchor").innerHTML;
    document.getElementById(key + "_anchor").innerHTML = formCode;
    document.getElementById(key).value = document.getElementById(key + "_value").innerText;
    document.getElementById(key).focus();
    initTooltip('#I18NContent');        // No I18n

    jQuery('form[data-id=onTranslationModify]').submit(function(event) {
        onTranslationModify(key);
        return false;
    });
}

function onTranslationModifyCancel(key) {
    document.getElementById(key + "_anchor").innerHTML = document.getElementById(key + "_bck").innerText;
    document.getElementById(key + "_bck").innerHTML = "";
}

/**
 * Validates the search form. Checks for value in the searchFor field.
 */
function OnTranslationSearch(form) {
    var searchText = form.searchFor.value;
    if (isEmpty(searchText)) {
        showconfirm(true,'message='+translate("sdp.solution.searchsolution.emptysearchtext")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=no, closeOnEscKey=yes',function(){});// No I18n
        return false;
    }
    var data = {
        mode: 'search',       // No I18n
        searchFor: searchText,
        language: parent.TRANSLATION_LANGUAGE,
        contentOnly: true
    };
    jQuery.ajax({
        url: "/i18n/I18N.jsp",  // No I18N
        async: false,
        cache: false,
        type: 'GET',    // No I18N
        data: data,
        success: function (resp) {
            jQuery("#I18NContent").html(resp);
        },
        error: function (response) {
            showalert('failure', translate('sdp.api.unknown.error'), '');        // No I18n
        }
    });
    return false;
}

/**
 *
 */
function onTranslationReplace(form) {
    var searchText = form.searchFor.value;
    if (isEmpty(searchText)) {
        showconfirm(true,'message='+translate("sdp.solution.searchsolution.emptysearchtext")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=no, closeOnEscKey=yes',function(){});// No I18n
        return false;
    }
    var data = {
        mode: 'findAndReplace',   // No I18n
        searchFor: searchText,
        replaceWith: form.replaceWith.value,
        language: parent.TRANSLATION_LANGUAGE,
        contentOnly: true
    };

    jQuery.ajax({
        url: "/i18n/I18N.jsp",  //No I18N
        async: false,
        cache: false,
        type: 'GET', //No I18N
        data: data,
        success: function (resp) {
            jQuery("#I18NContent").html(resp);
        },
        error: function (response) {
            showalert('failure', translate('sdp.api.unknown.error'), '');    // No I18n
        }
    });
    closeDD();
    return false;
}

/**
 *
 */
function onTranslationReplaceSubmit(event, formObj) {
    event.preventDefault();
    var checkFields = formObj.elements;
    var present = false;
    for (var i = 0; i < checkFields.length; i++) {
        if (checkFields[i].type == "checkbox" && checkFields[i].checked) {
            present = true;
            break;
        }
    }
    if (!present) {
        showconfirm(true,'message='+translate("sdp.admin.translation.replace.noselection")+', cancelbutton='+translate("sdp.common.ok")+', closebutton=no, closeOnEscKey=yes',function(){});// No I18n
        return false;
    }
    jQuery.ajax({
        url: "/servlet/I18nServlet",  // No I18n
        async: false,
        cache: false,
        type: 'POST', //No I18N
        data: jQuery(formObj).serialize(),
        success: function (resp) {
            var myChangesUrl = "/i18n/I18N.jsp?mode=view&myChanges=true&contentOnly=true&language=" + parent.TRANSLATION_LANGUAGE;    // No I18n
            jQuery("#I18NContent").load(myChangesUrl);
        },
        error: function (response) {
            if(response.responseJSON) {
                showalert('failure', response.responseJSON.response_status.messages[0].message.message, '');         // No I18n
            } else {
                showalert('failure', translate('sdp.common.error.unknown'), '');     // No I18n
            }
        }
    });
    return false;
}

function onTranslationAnchorClicked(aelement) {
    jQuery("#I18NContent").load(jQuery(aelement).attr('href'));
    return false;
}

// ****************************************************************************
// End of methods for Admin > Translations
// ****************************************************************************

function darkTextEditor(){
  setTimeout(function(){ darkMode(); },200);
}

function darkTriggerload(){
    jQuery('body').hasClass('changelistview') ? changelistview.changeAjaxHandler("/Changes.cc") : ''; // NO I18N
    // Refresh table on toggle dark mode both listview and left panel
    if(jQuery('#requests_list_div').length > 0){
      if(jQuery('#requests_list_refreshfreq').length > 0){
        jQuery('#requests_list_refreshfreq').trigger('click');
      }
      // left panel refresh handling
      else{
        table_comp_request && table_comp_request.refreshTable();
      }
    }
    // Request combined view handling
    if(jQuery('#activities_div').length > 0){
      if(jQuery('#activities_div_refreshfreq').length > 0){
        jQuery('#activities_div_refreshfreq').trigger('click');
      }
      // left panel refresh handling
      else{
        table_combined_task && table_combined_task.refreshTable();
      }
    }
    jQuery('#releases_refreshfreq').length > 0 ? jQuery('#releases_refreshfreq').trigger('click') : '';
}
/* Method to get HTML template */
function getHTMLTemplate(elementID) {
  var $template = jQuery("#" + elementID).html();
  $template = jQuery($template);
  return $template;
}
 /* Changing incident/service templates for close chat option */
function createRequestPopUp($template,templates_element,key)
{
  jQuery('<option>').val('0').text(translate("common.select.templates")).appendTo($template.find("#temp_selection"));
  jQuery.each(templates_element, function (i, templates) {
    jQuery.each(templates[key], function (i, tempDet) {
      if (!tempDet.is_service_template) {
        jQuery('<option>').val(tempDet.id).text(tempDet.name).appendTo($template.find("#temp_selection"));
      }
    });
  });
  showDialog($template.prop('outerHTML'), 'modal=yes,closeOnEscKey=yes,title=' + translate("chat.create.request") + ',closeButton=yes,width=500,position=absmiddle'); //No I18N

  jQuery("#_DIALOG_CONTENT").find("#temp_selection").select2({

  });
  jQuery("#_DIALOG_CONTENT").find("#incident_req").prop('checked', true); //No I18N
}

/* Start - Methods for landing page personalization */
var $landing = {
	openPanel: function(event, e) {
		if(sdp_app.IS_SDP) {
			ResourceLoader({
				js:['/scripts/hbs-template-admin-landing.js', '/scripts/landing-page.js'],//NO I18N
				success: function() {
					$landing_page.openSlider(event, e);
					$landing.openDialogCheck();
				}
			});
		}
	},
	openDialogCheck: function() {
		var $customize_tab = jQuery('#customize_tabs');//NO I18N
		if($customize_tab.hasClass('ui-dialog-content')) {
			$customize_tab.dialog('close');//NO I18N
		}
		var $notification_tone = jQuery('#notificationTones');//NO I18N
		if($notification_tone.hasClass('ui-dialog-content')) {
			$notification_tone.dialog('close');//NO I18N
		}
	},
	closeDialogCheck: function() {
		var $landding_page_personalization = jQuery('#landing-page-personalization');
		if($landding_page_personalization.hasClass('ui-dialog-content')) {
			$landding_page_personalization.dialog('close');//NO I18N
		}
	}
};
/* End - Methods for landing page personalization */
 
/* Changing incident/service templates for close chat and telephony create request option */
function onChangeTemplate(a,type,name){
 
  var templates_element;
  var key;
  var $select_obj;
  if(name=="telephony")
  {
   $select_obj= jQuery(a).parents("#create_req").find("#temp_selection"); //NO I18N
   templates_element = template_obj.cloneCategories();
   key = "templates";  //No I18N
   var $select_group = $select_obj;

  }
  else if(name=="chat"){
    var templateObj=jQuery(a).parents("#close_create_req");//No I18N
    $select_obj = templateObj.find("#temp_selection"); //NO I18N
    var $close_create_obj = templateObj.find("#close_create_request");  //NO I18N
    var $close_obj = templateObj.find("#close_chat");  //NO I18N
    if (!$close_create_obj.hasClass('hide')) {
        $close_create_obj.removeClass().addClass('btn btn-default mr10'); //No I18N
        $close_obj.removeClass().addClass('btn btn-primary mr10'); //No I18N
    }
    var chatId = templateObj.find("#close_chat").attr("data-chatid");  //No I18N
    var chat_portalid = jQuery("#sdp-chat-bar #" + chatId).attr("data-portalid");
    if (chat_portalid != PORTALID) {
        templates_element = portal_template_obj.service_categories;
        key = "request_templates";  //No I18N
    }
    else{
        templates_element = template_obj.cloneCategories();
        key = "templates";  //No I18N
    }
    var $select_group = $select_obj;
   
  }
  $select_obj.find('option,optgroup').remove().end();
  $select_obj.select2('data', null); //No I18N
  jQuery('<option>').val('0').text(translate("common.select.templates")).appendTo($select_obj);
    
    if (type === 'incident') {
        jQuery.each(templates_element, function (i, templates) {
            jQuery.each(templates[key], function (i, tempDet) {
                if (!tempDet.is_service_template) {
                    jQuery('<option>').val(tempDet.id).text(tempDet.name).appendTo($select_obj);
                }
            });
        });

    } else if (type === 'service') { //NO I18N
        jQuery.each(templates_element, function (i, templates) {
            $select_group.append('<optgroup label="' + e_attr(templates.name) + '" id="' + templates.id + '"></optgroup>');//NO I18N
            htmlOpts = [];
            jQuery.each(templates[key], function (i, tempDet) {
                if (tempDet.is_service_template) {
                    htmlOpts.push(jQuery(new Option(tempDet.name, tempDet.id)));
                }
            });
            $select_group.find('optgroup:last').append(htmlOpts);//NO I18N
        });
    }
    $select_obj.select2('val', "0");


}
function processJumpLinksData(data){
    var JumpLinkData = data.jump_links;
      if(JumpLinkData.items){
        for( i=0; i<JumpLinkData.items.length; i++ ){
          JumpLinkData.items[i].IsIntegrated = false;
          if(JumpLinkData.items[i].url.startsWith("http")){
            JumpLinkData.items[i].IsIntegrated = true;
          }
        }
      }
  return JumpLinkData;
}

/**
 * Fix for URI malformed - if the input_data contain % in the text;
 * @param {JSON} input_data
 * @returns
 */
function decodeMalformedURI(input_data) {
  try {
    input_data = JSON.parse(decodeURIComponent(input_data));
  } catch (err) {
    input_data = JSON.parse(decodeURIComponent(encodeURIComponent(input_data)));
  }
  return input_data;
}

function ShowUserAssetsPopup(options){
  if(options.user_id){
    window.view_user_assets_options=options;
    assetsObj.loadAttachAssetPopup('view_user_assets', 'attach_asset', '',options); //No I18N
  }
}
/**
 * Calls preview component to display admin module history.
 * @param {*} element
 */
function viewModuleHistory(element){
  element = (Array.isArray(element) && element.length > 0) ? element[0] : element;
  /**
   * key is used for personalization purpose.
   * module is the entity name which is used to construct urls and add entity checks.
   * admin_entity key is used to check whether the module is admin entity or not.
   * is_date_filter key is used to add date filter and sort buttons in UI.
   * entity_key key is displayed in the UI as third filter option(entity).
   * search_filter is used to in list info when search the history filter {"field": options.search_filter ,"condition":"in","values":[2],"logical_operator":"and"}
   * skip_filter_options key is used to skip the filter options rendered in the history filter.
   * skip_operation_names key is used to skip the operation names rendered in the history filter.
   * module_value is used in list info {"module": options.module_value}
   * data-history-width -- customize width for history component(ex: reminder edit page)
   *
   */

  /**
   * Default options
   */
  var options = {
    "admin_entity": true, // No I18n
    "is_date_filter": true, // No I18n
  };

	// Close popover if in open state
	if(typeof closeDD === "function") {
		closeDD();
	}

  /**
   * This configuration is used for getting the attribute value.
   */
  var attrConfiguration = {
    "entity-key": "entity_key", // No I18n
    "search-filter": "search_filter", // No I18n
    "skip-filter-options": "skip_filter_options", // No I18n
    "skip-operation-names": "skip_operation_names", // No I18n
    "module-value": "module_value", // No I18n
    "entity-id": "id", // No I18n
    "data-id": "module", // No I18n
    "admin-entity": "admin_entity", // No I18n
    "is-date-filter": "is_date_filter", // No I18n
    "is-new-history": "is_new_history"// No I18N
  };

  var personalizeKey = element.getAttribute('key');
  var DataId = element.getAttribute('data-id');
  jQuery.each(element.attributes, function(index, ele){
    var attrKey = ele.name;
    var attrValue = ele.value;
    if((attrConfiguration[attrKey])){
      (attrValue && attrValue != "") ? options[attrConfiguration[attrKey]] = attrValue : "";
    }
  });
  let popupwidth = element.getAttribute('data-history-width') ? element.getAttribute('data-history-width') : '70%';// NO I18N
  (personalizeKey && personalizeKey != "") ? options["key"] = personalizeKey : (DataId && DataId != "" ) ? options["key"] = DataId + '_history': ""; //No I18N
  var queryParam = new URLSearchParams(options);
  $previewComponent.load("/common/ViewHistory.jsp?"+ queryParam, translate("common.history") + ' - ' + element.getAttribute('entity-key'), popupwidth, false, false, "admin_history", true, false, "custom_class:pl0 pr0 whitebg history-dig,isFullPage:true"); // NO I18N
}

//SD-106898 starts
function hideContactCollectionBanner()
{

      var date= new Date();
      var endtime = date.getTime();
      var expiry_days = sdpheader_data.contact_collection.expiry_days;
      endtime = endtime+86400000*expiry_days;
      var remindmeLaterObj = {"starttime":date.getTime(),"endtime":endtime}; //No I18n
      addPersonalization("CONTACTCOLLECTION_PREFERENCE", remindmeLaterObj, true, { 'is_portalspecific': false }); //NO I18N
      jQuery("#contactCollection").hide();

}

// Navigating to Security Alerts tab if the current page is Security Settings
function showSecurityAlerts()
{
  if(jQuery("#securityAlert").length)
  {
    jQuery("#contactCollectionTab > a").trigger("click");
  }
}
//SD-106898 ends
function redirectToOutgoingMailServer() {
    if(isMDHSetup == "false") {
        window.location.href = '/EMailDef.do?mailType=outgoing&mode=view';
    }
    else {
        window.location.href = '/ESM.do?type=esmEmail';
    }
}
var premiumSupport = {
  accordTip :function(element){
     var expandIcon = jQuery(element);
     if(expandIcon.attr("aria-expanded")=="true"){
      expandIcon.find("span[data-actip]").uitooltip({content:translate('sdp.common.expand')});
     }else{
      expandIcon.find("span[data-actip]").uitooltip({content:translate('sdp.common.collapse')});
     }
  },
};

 //Load whats_new.js
 function loadwhatsnewtour(){
   ResourceLoader({
     js: ["/scripts/whats_new.js"], // No I18N
     success: function(){$whats_new.init();}
   });
 }
/**
* Common method to get search_criteria json for provided field,value,condition and children
**/
function getSearchCriteriaJson(field, condition, value, children) {
    const valueKey = Array.isArray(value) ? "values" : "value";//No I18N
    const json = {
      "field":field,//No I18N
      "condition":condition,//No I18N
      [valueKey]: value,
    };
    if (Array.isArray(children)) {
      json.children = children;
    } else if (typeof children === "object") {//No I18N
      json.children = [children];
    } else if (typeof children === "string") {//No I18N
      json.logical_operator = children;
    }
    return json;
}
//load Telephony js into ember iframes in ESM Directory
function loadTelephonyjsinESM(){
  const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/Telephony.js"] : ["/scripts/telephony_min.js"] ; //NO I18N
  ResourceLoader({
    js:getScript
  });
}
function loadImplTour(){
  if(typeof $impl_asst == 'undefined'){
    let files = [`/scripts/implementation-wizard.js`,`/scripts/hbs-template-admin-wizard.js`];
    ResourceLoader({
      js:files,
      success: function() {
        $impl_asst.initImplTour();
      }
    });
  }
  else{
    $impl_asst.initImplTour();
  }
}
function configureCMDBMigrationLater() {
  const date = new Date();
  const endTime = date.getTime() + 864e5;
  addPersonalization("CMDB_POST_MIGRATION_REMINDER_LATER",{//No I18N
    "starttime": date.getTime(),//No I18N
    "endtime": endTime//No I18N
  });
  jQuery("#cmdb-post-migration").hide();
  if(jQuery('#cmdb-migration-dialog').length) {
    jQuery('#cmdb-migration-dialog').sdp_zcomponent_dialog("close"); //No I18N
  }
}
// Method moved from cmdb.js SD-130005
jQuery(document).ready(function(){
	// Trigger scroll event on resize
	jQuery(window).on('resize', function(){
		jQuery(document).trigger('scroll');
  	});
  
});
