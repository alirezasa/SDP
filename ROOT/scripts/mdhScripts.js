/*$Id$ */
var mdh = (function() {
  var m_Obj = {};
  m_Obj.initMDH = function(page) { //ESM initialization
      if(page !== "portal"){
        jQuery("#esmDirectory").load('/mdh/ESMDirectory.jsp', function(){ // No I18N

          jQuery('.esm-links [data-name]').off('click').on('click', function(e) { // No I18N
            if(!jQuery(this).hasClass('active')){
              var tabName = jQuery(this).attr('data-name');
              m_Obj.mdhTabSwitch(tabName,true);
            }
          });
        });
      }
     m_Obj.mdhTabSwitch(page,true);
    },
    m_Obj.mdhTabSwitch = function(tabName,doPush,partialURL){ //Swithing to selected page
    	var tempTabName = tabName;
    	if(tabName.indexOf('#') > 0){
    		   tempTabName = tabName.split('#')[0];
        }
      jQuery("#mdhLoading").html(mdh.loaderHTML());
      var pathName = "",
        mdhCallback = "",
        destId = "mdhSection-content", isValidURL = false; // No I18N

      if(tabName === "portal"){ //ESM Portal Section
        jQuery("#esmDirectory,#esmportalbtn,#portalcustomization,#esmPortal").hide();
        jQuery("#esmDirectorybtn").show();
        jQuery("#esmPortalHome").html('').show();
        isValidURL = true;
      }
      else{ //ESM Directory Section
          jQuery("#customizeContentDiv").hide();
          jQuery("#esmDirectory,#esmportalbtn,#top-header").show();
          jQuery("#esmPortal,#esmDirectorybtn,#esmPortalHome").hide();
          jQuery('#esmDirectorybtn').closest('ul').css('width','20px'); // No I18N
          if(isSCP && tabName === "home")   // No I18N
          {
              tabName = "instances";  // No I18N
          }
          if (tabName === "home") { // No I18N
              pathName = '/mdh/ESMHome.jsp'; // No I18N
              isValidURL = true;
          }else if (tabName === "instances"){ // No I18N
            pathName = '/mdh/ESMInstances.jsp?_='+sdp_app.BUILD_NUMBER; // No I18N
            mdhCallback = this.portal.getAllInstances;
            destId = "mdhSection"; // No I18N
            isValidURL = true;
          } else if (tabName === "portal_customization") { // No I18N
            pathName = '/mdh/ESMPortalCustomization.jsp'; // No I18N
                mdhCallback = loadmeadmin;
            isValidURL = true;
          } else if (tabName === "organizationdetails") { // No I18N
            pathName = '/SetUpWizard.do?forwardTo=orgdetails'; // No I18N
            isValidURL = true;
          } else if (tabName === "users") { // No I18N
            var viewType = mdh.userObj.viewType || "list", // No I18N
                userId = mdh.userObj.userId;
                if(viewType == "edit"){ // No I18N
                    viewType = "add"; // No I18N
                }
            var appUrl = "&viewType="+viewType; // No I18N
			if(mdh.userObj.mobile){
				appUrl += "&mobile="+encodeURIComponent(mdh.userObj.mobile); // No I18N
			}
            if(userId){
              appUrl += "&userId="+userId; // No I18N
            }
            if(mdh.userObj.changeTo != ""){ // No I18N
              appUrl += "&changeTo="+mdh.userObj.changeTo; // No I18N
            }
            pathName = '/SetUpWizard.do?forwardTo=requester&from=mdh&tab=Admin'+appUrl; // No I18N
            isValidURL = true;
            mdh.userObj = {};
          }else if (tabName === "regions" && !isSCP) { // No I18N
            if(partialURL){
                pathName = partialURL;
                mdhCallback = callMe;
            }else{
              //pathName = '/SetUpWizard.do?forwardTo=location'; // No I18N
              pathName = '/app#/admin/modules/regions'; // No I18N
            }
            if(~location.search.indexOf("action=addnew")){
              mdhCallback = "swapLayerAndSetFocus"; //NO I18N
            }
            isValidURL = true;
          }else if (tabName === "sites" && !isSCP) { // No I18N
            if(partialURL){
                pathName = partialURL;
            }else{
              pathName = '/SetUpWizard.do?forwardTo=site'; // No I18N
            }
            if(~location.search.indexOf("action=addnew")){
              mdhCallback = "swapLayerAndSetFocus"; //NO I18N
            }
            isValidURL = true;
          }else if (tabName === "departments" && !isSCP) { // No I18N
            if(partialURL){
                pathName = partialURL;
            }else{
              pathName = '/app#/admin/modules/departments'; // No I18N
            }
            isValidURL = true;
          } else if (tabName === "activedirectory") { // No I18N
            pathName = '/SetUpWizard.do?forwardTo=activeDirectory'; // No I18N
            isValidURL = true;
          } else if (!isSCP && tabName === "ldap") { // No I18N
            pathName = '/SetUpWizard.do?forwardTo=LDAP'; // No I18N
            isValidURL = true;
          } else if (tabName === "azuread") { // No I18N
            pathName = '/app#/admin/azuread'; // No I18N
            isValidURL = true;
          } else if (tabName === "sso") { //No I18N
            pathName = 'SetUpWizard.do?forwardTo=sso'; //No I18N
            isValidURL = true;
          } else if (tabName === "oauth-providers") { //No I18N
            pathName = '/app#/admin/oauth-providers'; //No I18N
            isValidURL = true;
          } else if(tabName === "applicationsettings"){ // No I18N
            pathName = '/Settings.do?mode=viewESM'; // No I18N
            isValidURL = true;
          }else if(tabName === "users-udf") { // No I18N
            pathName = "/setup/ESMUserUDF.jsp"; // No I18N
            isValidURL = true;
          }else if(tabName === "departments-udf") { // No I18N
            pathName = "/setup/ESMDepartmentUDF.jsp"; // No I18N
            isValidURL = true;
          }else if(tabName === "ESMTwoFactorAuth"){ // No I18N
            pathName = "/SetUpWizard.do?forwardTo=ESMTwoFactorAuth"; // No I18N
            isValidURL = true;
          } else if(tabName === "ESMAU"){ // No I18N
            pathName = '/app#/admin/auto-update'; // No I18N
            isValidURL = true;
          }else if(tabName === "ESMTelephony"){ // No I18N
            pathName = "/app#/admin/telephony"; // No I18N
            isValidURL = true;
            mdhCallback = "loadTelephonyjsinESM"; //No I18N
          }
          else if(tabName === "attachmentSettings"){ // No I18N
              pathName = "/SetUpWizard.do?forwardTo=attachmentSettings"; // No I18N
              isValidURL = true;
          }else if(tabName === "backup-schedule"){ // No I18N
            pathName = "/SetUpWizard.do?forwardTo=backupschedule"; // No I18N
            isValidURL = true;
            mdhCallback = "loadMe";  // No I18N
          }else if(!isSCP && tabName === "orgroles"){ // No I18N
            pathName = "/SetUpWizard.do?forwardTo=orgroles"; // No I18N
            isValidURL = true;
          }else if(tabName === "securitysettings"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=securitysettings"; // No I18N
             isValidURL = true;
          }else if(tabName === "securitysettings#password-policy"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=securitysettings#password-policy"; // No I18N
             isValidURL = true;
          }else if(tabName === "securitysettings#advancedSettingsTab"){ // No I18N
               pathName = "/SetUpWizard.do?forwardTo=securitysettings#advancedSettingsTab"; // No I18N
               isValidURL = true;
          }else if(tabName === "securitysettings#contactCollectionTab"){ // No I18N
               pathName = "/SetUpWizard.do?forwardTo=securitysettings#contactCollectionTab"; // No I18N
               isValidURL = true;
          }else if(tabName === "securitysettings#mobileTab"){ // No I18N
              pathName = "/SetUpWizard.do?forwardTo=securitysettings#mobileTab"; // No I18N
              mdhCallback = "esmSecSettingsCallback"; // No I18N
              isValidURL = true;
         }else if(tabName === "importssl"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=importssl"; // No I18N
             isValidURL = true;
             mdhCallback = loadmeadmin;
          }else if(tabName === "proxysettings"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=ProxySettings"; // No I18N
             isValidURL = true;
          }else if(tabName === "currency"  && !isSCP){ // No I18N
            pathName = "/SetUpWizard.do?forwardTo=currencyConfig"; // No I18N
             isValidURL = true;
          }else if(tabName === "privacysettings"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=PrivacySettings"; // No I18N
             isValidURL = true;
          }else if(tabName === "translations"){ // No I18N
             pathName = "/SetUpWizard.do?forwardTo=translations"; // No I18N
             isValidURL = true;
          }else if(tabName === "notification-roles"){ // No I18N
             pathName = "/mdh/ESMNotificationRule.jsp"; // No I18N
             isValidURL = true;
          }
          else if(tabName === "accounts-udf") { // No I18N
        	  pathName = "/setup/ESMAccountUDF.jsp"; // No I18N
        	  isValidURL = true;
          }/*
          else if(tabName === "telephony") { // No I18N
				pathName = "/SetUpWizard.do?forwardTo=telephony"; // No I18N
				isValidURL = true;
		  }*/
		  else if(tabName === "google_analytics") { // No I18N
				pathName = "/SetUpWizard.do?forwardTo=google_analytics"; // No I18N
				isValidURL = true;
		  }
		  else if(tabName === "ZohoAssist") { // No I18N
				pathName = "/SetUpWizard.do?forwardTo=ZohoAssist"; // No I18N
				isValidURL = true;
      }
      else if(tabName === "Zoom") { // No I18N
        pathName = "/SetUpWizard.do?forwardTo=Zoom"; // No I18N
        isValidURL = true;
      }
		  else if(isSCP && tabName === "SalesforceCRM") { // No I18N
		        pathName = "/SetUpWizard.do?forwardTo=salesForceCRM&product=Salesforce%20CRM&productId=SalesForceCRM&isInvoiceProduct=false&isActive=false"; // No I18N
		        isValidURL = true;
		      }
		      else if(isSCP && tabName === "ZohoCRM") { // No I18N
		        pathName = "/SetUpWizard.do?forwardTo=zohoCRM&product=ZOHO%20CRM&productId=ZohoCRM&isInvoiceProduct=false&isActive=false"; // No I18N
		        isValidURL = true;
		      }
		  else if(tabName === "industry") { // No I18N
	            pathName = "SetUpWizard.do?forwardTo=industry"; // No I18N
	            isValidURL = true;
	          }
		  else if(tabName === "windowsdomainscan") { // No I18N
				var mode = mdh.domainObj.mode;
				if(mode == "edit"){
				var id = mdh.domainObj.id;
				  pathName = "/EditDomain.do?mode=edit&id="+id; // No I18N
				}
				else{
	              pathName = "SetUpWizard.do?forwardTo=domain"; // No I18N
				}
	            isValidURL = true;
				mdhCallback="callMe"; // No I18N
				mdh.domainObj = {};
	            }
        else if(isSCP && tabName == "customer_portal")
        {
          pathName = '/SetUpWizard.do?forwardTo=customerPortal'; // No I18N
          isValidURL = true;
        }
          else if (tabName === "fosconfiguration"){ // No I18N
            pathName="/SetUpWizard.do?forwardTo=fosconfiguration"; // No I18N
            isValidURL=true;
          }
          else if (tabName === "fosreplication"){ // No I18N
            pathName="/SetUpWizard.do?forwardTo=fosreplication"; // No I18N
            isValidURL=true;
          }
          else if(tabName === "esmEmail"){// No I18N
            pathName = "/EMailDef.do?mailType=outgoing&mode=view";// No I18N
            isValidURL = true;
          }
          else if(tabName === "userauditlog"){ // No I18N
            pathName = '/app#/admin/modules/userauditlog'; // No I18N
            isValidURL = true;
          }
          jQuery("#"+destId).html(''); // No I18N
      }
      //If Non-MDH setup, sholud not be redirected to otherthan home and instances tab
      if(isMDHSetup === "false" && tabName !== "home" && tabName !== "instances"){
         isValidURL =false;
      }
      // If tabName will not be a valid one , "isValidURL" will be false
      if(!isValidURL){
        window.location.href="/ESM.do";  //NO I18N
        return false;
      }
      //For Users Tab, history pushstate will be happened in userScripts.js
      if(doPush && tabName != "users"){
          window.history.pushState({'type':tabName}, '', 'ESM.do?type=' + tabName);
      }
      if(tabName === "portal"){
        jQuery("#prologodiv").show(); //Product Logo div in Header
        jQuery("#esmgobackHome").hide();
        this.portal.loadPortals();
        jQuery("#esmPortalHome").show();
        jQuery("#mdhLoading").html(''); //removing the loader
        return false;
      }
      setTimeout(function(){
        if(pathName.indexOf("app#/admin") != -1){
          jQuery("#" + destId).html("<iframe src='"+pathName+"' id='emberframe' style='width:100%;height:100vh;border:none;padding:10px'/>");
          /** handle the css issue in ESM directory in ember page */
          var emberFrame = jQuery('#emberframe').load(function () {
            emberFrame.contents().find('body').css({
              'font-family':'Roboto, Arial', //NO I18N
              'background': 'white' //NO I18N
            }).end()
            .find("#content").removeClass("bodypad mb30").end()
            .find("#adminmodule-container").css("padding","10px").end() //NO I18N
            .find("#content-inner").removeAttr("id");
          });
          m_Obj.callbackFn(tabName, mdhCallback, tempTabName);
        }else{
        // Loading right side div content under ESMDirectory
        // For "ESM Instances" tab, we are loading all the handlebars into "#mdhSection" div, so we are rendering the compiled HTML file into "#mdhSection-content" div => destId="mdhSection"
        // For other tabs, we are rendering the jsp files into "#mdhSection-content" div ,destId => "mdhSection-content"
        jQuery("#" + destId).load(pathName, function() {
          m_Obj.callbackFn(tabName, mdhCallback, tempTabName);
        });
      }
        //Setting the Active link on Leftside section
        jQuery('.esm-links [data-name]').removeClass('active');
        jQuery('.esm-links [data-name="'+tempTabName+'"]').addClass('active');
        scrollTo(0,0);
        //SDP-79791 press ESC button showDialog popup
        document.onkeydown = function(ev) {
      if (browser_ie) {
        var keyCode = window.event.keyCode;
      }
      else if (browser_nn4 || browser_nn6) {
        var keyCode = ev.which;
      }

      if (keyCode == 27 && calDialog != null && calDialog.style.visibility != "hidden") {
        closeCalDialog();
      }
      else if (keyCode == 27 && closeOnEscKey == true && oDialog != null && oDialog.style.visibility != "hidden") {
        closeDialog();
      } else if(keyCode == 27 && jQuery('#preview_div').is(":visible")) {//NO I18N/*ESM Demo Video popup close event call*/
        mdh.closeDiagramPopup(ev)
      }
        }
      },200);
    },
    m_Obj.callbackFn = function(tabName, mdhCallback, tempTabName){
      if(tabName !== "portal"){
          jQuery("#prologodiv").hide(); //Hiding ProductLogo under ESM-Directory
          jQuery("#esmgobackHome").show();
            if(tabName == 'instances' || tabName == 'jira') {
                var wizHeaderName = jQuery('.esm-links li[data-name="' + tempTabName + '"]').clone().children().remove().end().text();
            } else {
                var wizHeaderName = jQuery('.esm-links li[data-name="' + tempTabName + '"]').text();
            }

            if(wizHeaderName) {
                jQuery("#widget-header").text(wizHeaderName); // No I18N
            } else {
			  if(!isSCP){
            jQuery("#widget-header").html(translate("mdh.esm.title") + '<button id="view-demo-btn" class="btn btn-default vsub pos-rel top-4 ml10 fr" type="button" data-event="click" data-handler="mdh.showDiagramPopup();" nonce="'+sdpNonce+'"><span class="cspr icon-sm guided-tour vmiddle top-1 mr5"></span>'+translate("sdp.admin.service.catalog.video.text")+'</button><div id="preview_div" style="display: none;"><div class="freezeLayer pos-fix fh" style="z-index: 100;"></div><div class="pos-fix top0 rlc-diagram-anim"><div class="widget-bg" style="margin:8% auto; width: 700px;"><div class="widget-header p10"><span class="h3 m0">'+translate("mdh.esm.title")+'</span><button class="btn btn-link pos-abs right10 top10 flat" title="'+translate("common.close")+'" data-event="click" data-handler="mdh.closeDiagramPopup(event)" nonce="'+sdpNonce+'"><span class="cspr icon-xs close2"></span></button></div><div class="widget-panel p0 tc pos-rel"><div class="widget-panel p0"><iframe width="100%" height="580" src="about:blank" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div></div></div></div>'); // No I18N
              $sdEventListener(jQuery("#widget-header"));
              }

            if(isMDHSetup == "false" && !sdp_app.IS_REBRAND && !isSCP){
              setTimeout(function(){
                mdh.showDiagramPopup('init'); // No I18N
              },100);
            }
          }
          if(tabName == "home"){ // No I18N
            jQ('[data-name="home"]').hide(); // No I18N
          }else{
            jQ('[data-name="home"]').show(); // No I18N
          }
          if(tabName === 'portal_customization'){
            jQuery('#organize-instance-btn').off('click').on('click', function() {//NO I18N
              $header.initializeOrganizeInstancePopUp('esm');//NO I18N
            });
          }
        }
        //mdhCallback - Callback function, which will be called after rightside content render
        if (typeof mdhCallback === "function") {
          mdhCallback();
        }else if(typeof mdhCallback === "string" && mdhCallback != ""){ //NO I18N
          window[mdhCallback]();
        }
        jQuery("#mdhLoading").html(''); //removing the loader
    },
    m_Obj.loaderHTML = function(arg){ //Loader html
      var opstr = "";
      if(arg === "instancesave"){ //Page freezing on saving portal
        opstr = '<div data-id="cview-freeze" class="cview-freeze" style="z-index: 99;">'+ajaxBar("white")+'</div>';
      }else{
        opstr = ajaxBar();
      }
      return opstr;
    },
    m_Obj.createNewInstance = function(){
      jQuery('[data-name="instances"]').trigger('click');
      setTimeout(function(){
        mdh.portal.showHideNewInstance('new',true); // No I18N
        jQuery('html, body').animate({
              'scrollTop' : jQuery("#portals-list #instance_new").offset().top
          },1000);
      },500);
    },
    m_Obj.showDiagramPopup = function(arg) {
      const slide = [{
          link: "<iframe width='100%' height='100%' src='"+translate("admin.esm.video")+"' title=\"YouTube video player\" frameborder=\"0\" autoplay=true allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>", // No I18N
          id: 1,
          name: translate('mdh.esm.title'), // No I18N
          title: translate('mdh.esm.title'), // No I18N
          type: "embed", // No I18N
          description: translate("mdh.welcome.msg"), // No I18N
          alignment: "left" // No I18N
        }];
      this.hcInstance = new HelpTourComponent({
        data: slide,
        progressbar: false,
        arrows:true,
        sidebar: true,
        navigateIcons: true,
        title: translate("ssp.helptour.language.title"), // No I18N
        triggerButton: jQuery("#view-demo-btn")// NO I18N
      });
      this.hcInstance.open();
    },
    m_Obj.closeDiagramPopup = function(e) {
      e.preventDefault();
      e.stopPropagation();
      var data = jQuery('#preview_div');
      data.find('.rlc-diagram-anim').removeClass('rlc-diagram-anim1');
      data.find('.rlc-diagram-anim').css('transition', '');  // No I18N
      data.find('iframe').attr('src','about:blank');
      setTimeout(function() {
        data.hide();
      },900);
    },
    /*Instances related code starts*/
    m_Obj.portal = (function() {
        var port = {};
        port.gotoPortalInstance = function(pId){ //Updating currently seleted portal
             sdpAjax({
              type: 'PUT', //NO I18N
              url: '/api/v3/change_portal?portalid=' + pId+"&current_tab=ESM", //NO I18N
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
              }
            });
        },
        port.getAllInstances = function() { //Loading all the instances
          var accessiblePortals = [];
          sdpAjax({
            url: '/api/v3/accessibleportals', // No I18N
            success: function(resp) {
                accessiblePortals = jQuery.map(resp.accessibleportal, function(obj, index){
                  return obj.id + "";
                });
            },
            async:false
          });
          var htmlOutput = "",
            data = "",
            rowDiv = '<div class="row m0 fw">'; // No I18N
          var inputObject = {};
              inputObject.list_info = {"sort_field" : "id"}; // No I18N
             //SD-96248 changing the row_count to fetch all instances(more than 10)
              inputObject.list_info.row_count = sdp_app.MAX_HELPDESK_COUNT;
          var dataVal  = sdpAjaxInputData(inputObject);
          sdpAjax({
            url: '/api/v3/portals?'+dataVal, // No I18N
            success: function(resp) {
              data = resp.portals;
            },
            async: false
          });
          var isRowClosed = false;
          // SD-96248 passing helpdesk count to ember function to print the number of instances in ESMInstances.jsp
          var templateData = {"helpdeskCount": sdp_app.MAX_HELPDESK_COUNT, isNotSCP: !sdp_app.IS_SCP};// No I18N
          renderhbs("#mdhSection-content", "instance-header", templateData, false, "esm_instances"); // No I18N
          jQuery("#ESMRestartBanner_Container").append(jQuery("#ESMRestartBanner").html());
          var porLen = data.length;//portal length

          //List the Portals - Portal List HTML construction as String
          if (porLen > 0) {
            var d = new Date();
            for (var i = 0; i < data.length; i++) {
              if(accessiblePortals.indexOf(data[i].id) != -1){
                data[i].isAccessiblePortal = true;
              }
              if (i % 2 == 0) {
                htmlOutput += rowDiv;
                isRowClosed = false;
              }
              var ownList =data[i].owners;
              // Constructing Owners list to show in Instance Details view
              if(ownList){
                var ownersStr = "";
                for (var j = 0; j < ownList.length; j++) {
                    ownersStr += ownList[j].name;
                    if(j != ownList.length-1){
                      ownersStr += ", ";
                    }
                }
                data[i].ownerStr = ownersStr;
              }
              
	      // SD-112567 Alias URL Tool Tip modified
	      data[i].alias_url_link = 'portal/' + data[i].alias_url; 
        data[i].alias_url_tool_tip = window.location.origin +'/'+data[i].alias_url_link;
	      
	      data[i].accessible = accessiblePortals.contains(data[i].id);
              data[i].isNotSCP = !sdp_app.IS_SCP;
              data[i].isNotSCP_TechLicense = isNotSCP_TechLicense;
              htmlOutput += renderhbs(null,"instance-details",data[i],false,"esm_instances",null, null, null, true); //No I18N
              if (i % 2 == 1) {
                htmlOutput += "</div>"; // No I18N
                isRowClosed = true;
              }
            }
          }
          //After creating 10 Portals, we will hide the "Add new instance" section
          // SD-96248 After creating maximum helpdesk , we will hide the "Add new instance" section 
          if (porLen < sdp_app.MAX_HELPDESK_COUNT) {
            if (isRowClosed) {
              htmlOutput += rowDiv;
              isRowClosed = false;
            }
            htmlOutput += renderhbs(null,"instance-default",{},false,"esm_instances",null, null, null, true); //No I18N
          }else{
            //After creating 10 Portals, we will hide the "Create New Instance" in "View Demo" section
            jQuery("#widget-header").find("#newInstanceFromPop").hide();
          }
          if (!isRowClosed) {
            htmlOutput += "</div>"; // No I18N
          }
          jQuery("#portals-list").html(htmlOutput);
          $sdEventListener("#portals-list");// No I18N
          m_Obj.portal.equalheightinstances();
          jQuery(".editinst").on('click', function() { //Binding edit icon events
            var parId = jQuery(this).closest('form[data-id]').attr('data-id'); // No I18N
            m_Obj.portal.loadInstance(parId);
            var _self = this;
            setTimeout(function(){
              jQuery(_self).parents("[data-name='instances-block']").find("select[id^=instancetype]").select2(); //NO I18N
            },20);
          });
          jQuery('.deleteinst').on('click', function() { //Binding delete icon events
            var currElementId = jQuery(this).closest('form[data-id]').attr('data-id'); // No I18N
            showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate('mdh.portal.delete.confirm') + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', deleteCallback,true); // No I18N
            function deleteCallback (isdelete) { //Delete callback
              if (isdelete) {
                jQuery("#mdhLoading").html(mdh.loaderHTML('instancesave')); // No I18N
                mdh.portal.saveUpdateInstance("DELETE", currElementId); // No I18N
              }
            }
          });
          //To load helpcard
          loadmeadmin();
        },
        port.callUserSelect2 = function(fromAdmin,multipleV, id,ownerList){
          var url= "users",entity_name = "users" ;//NO I18N

          if(isSCP){
        	  url="technicians", entity_name="technicians";//NO I18N
          }
          if( !fromAdmin )
          {
            url = "portals/owners";//NO I18N
            entity_name = "owners";//NO I18N
          }

          //Initialization Select2APIComponent for Owner field
          var inputoptions = {
              data:ownerList,
              select2Id: 'instanceowner' + id, // No I18N
              allowClear: true,
              placeholder: translate("form.select.placeholder",[getMessageForKey("sdp.helpdesk.common.user")]), // No I18N
              callbackURL: "/"+url,
              multiple:multipleV,
              entity_name : entity_name,
              isTooltipEnabled : true,
              formatResult : port.formatUserDetail,
              formatSelection : port.formatUserDetail
          };
          new Select2APIComponent(inputoptions);
          setTimeout(function(){
            if(ownerList && ownerList.length == 1){
              jQ("#s2id_instanceowner" + id).find(".select2-search-choice-close").remove(); // No I18N
            }
          },1);
        },
        port.formatUserDetail = function(user){
          // Constructing Owner field with tooltip
          var titleStr = e_attr('<div><b>'+getMessageForKey('sdp.common.name.is')+' : </b><span>'+e_html(user.name)+'</span><br><b>'+getMessageForKey('sdp.common.email.is')+' : </b><span>'+(user.email_id ? e_html(user.email_id) : "N/A" )+'</span><br><b>'+getMessageForKey('sdp.common.empid.is')+' : </b><span>'+(user.employee_id ? e_html(user.employee_id) : 'N/A' )+'</span><br><b>'+getMessageForKey('sdp.common.dept.is')+' : </b><span>'+((user.department && user.department.name)? e_html(user.department.name) : 'N/A' )+'</span><br></div>'); // No I18N
          return '<div rel="uitip" title="'+titleStr+'">'+e_html(user.name)+'</div>'; // No I18N
        },
        port.loadInstance = function(id, fromAdmin) { //GET a instance
          var statusAllowedValues = ""; // No I18N
          sdpAjax({
            url: '/api/v3/portals/'+id+'/status', // No I18N
            success: function(resp) {
              statusAllowedValues = resp.status;
            },
            async: false
          });
          sdpAjax({
            url: '/api/v3/portals/' + id, // No I18N
            success: function(resp) {
                resp.portal.alias_url_tool_tip = window.location.origin +'/portal/' +resp.portal.alias_url;//NO I18N

              m_Obj.portal.showHideNewInstance(id,true);
              resp.portal.fromAdmin = fromAdmin;
              if(typeof resp.portal.license_details.edition != 'undefined')
               {
                  resp.portal.showLicensedetail = true;
               }
               if(statusAllowedValues){
                var allowedStatusValue = [], allowedStatusObject = [];
                //For "Production" status portal, only "Retired" status will be available
                if(resp.portal.status.internal_name == "Production"){
                  allowedStatusValue = ["Production", "Retired"]; // No I18N
                }
                else if(resp.portal.status.internal_name == "Pre-Production") // No I18N //For "Pre-Production" status portal, only "Production", "Retired" status will be available
                {
                  allowedStatusValue = ["Pre-Production", "Production", "Retired"]; // No I18N
                }
                for (var k = 0; k < statusAllowedValues.length; k++) {
                  if(allowedStatusValue.indexOf(statusAllowedValues[k].internal_name) > -1){
                    statusAllowedValues[k].text = statusAllowedValues[k].name;
                    allowedStatusObject.push(statusAllowedValues[k]);
                  }
                }
                resp.portal.statusAllowedValues = allowedStatusObject;
              }
              var d = new Date();
              resp.portal.isNotSCP = !sdp_app.IS_SCP;
              resp.portal.isNotSCP_TechLicense = isNotSCP_TechLicense;
              renderhbs("#instance_edit_" + id, "instance-new-template", resp.portal, false, 'esm_instances'); // No I18N
              jQuery("#instance_edit_" + id).find('form').removeClass('hide');
              var multipleV = true;

              var ownerList = resp.portal.owners;
              // We can associate muliple owners, only after applying license
              if((resp.portal.status.internal_name == "Pre-Production" && resp.portal.license_details.edition == undefined) || resp.portal.status.internal_name == "New"){
                 multipleV = false;
              }
              if(!multipleV){
                  ownerList = ownerList[0];
              }
              port.callUserSelect2(fromAdmin,multipleV, id, ownerList);
              if(jQuery("#instancestatus" + id).is(":visible")){
                jQuery("#instancestatus" + id).select2().on('change',function(){
                    port.portalStatusChange(id);
                });
              }
              jQuery("#instancename" + id).trigger('focus');

              //Form Validation section
              m_Obj.portal.initalizeFormValidation(jQuery("#instanceform" + id), id);
              if (resp.portal.status) {
                jQuery("#instancestatus" + id).select2('val', resp.portal.status.id); // No I18N
              }
              var selLicense = resp.portal.license_details.edition;
              if(orgAdmin == "true" && resp.portal.status.internal_name != "Retired"){
                mdh.portal.loadLicenseList(jQuery("#instancelicense"+ id),selLicense);
              }
              //License name will be like "Standard Edition unlimited Tech"
              if(typeof selLicense != 'undefined')
               {
                    if(orgAdmin == "true" && resp.portal.status.internal_name != "Retired"){
                      jQuery("#instancelicense"+ id).select2('data',{'id':resp.portal.license_details.name,'text':selLicense+" "+translate('license.edition.type')+" "+resp.portal.license_details.no_of_techs+" "+translate('license.tech.label')});// No I18N
                    }else{
                      jQuery("#instancelicense"+ id).val(resp.portal.license_details.name);
                      jQuery("#instanceLicenseName"+ id).text(selLicense+" "+translate('license.edition.type')+" "+resp.portal.license_details.no_of_techs+" "+translate('license.tech.label'));
                    }
               }else{
                  if(orgAdmin != "true"){
                    jQuery("#instancelicense"+ id).val("null"); //No I18N
                    jQuery("#instanceLicenseName"+ id).text(translate("license.no"));
                  }
               }
               //SD-103437 :: disabling associate license field for Demo setup
               if(sdp_app.IS_DEMO_BUILD)
               {
             	  jQuery('#instancelicense'+ id).select2('enable',false);//NO I18N
            	  jQuery('#s2id_instancelicense'+ id).attr('title',translate('sdp.demo.errormsg'));
               }
               if(fromAdmin){
                jQuery('#instancedetail #instanceform'+id).find('.form-footer').removeClass('pos-abs').attr('style','border:none').end()
                                                           .find('.form-group').attr('class','desc-row').end()
               }
               charCounter.init();
               
               jQuery("#alias_url"+id).val(resp.portal.alias_url);
            }
          });
        },
        //Portal Status change event - Status change to "Production" or "Retired" , we are showing some info/warning message to user
        port.portalStatusChange = function(id){
          var inst_name = jQuery("#instancename_hidden"+id).val();
          var seleStat = jQuery(jQuery("#instancestatus"+id).select2('data').element[0]).attr('internal_name'); // No I18N
          if(seleStat == "Production" || seleStat == "Retired"){
            var cnf_msg = ""; //No I18N
            if(seleStat == "Production"){
              cnf_msg = translate("mdh.status.change.active"); //No I18N
              if(orgAdmin != "true" && jQuery("#instancelicense"+ id).val() == "null"){
                  jQuery("#instancestatus"+id).select2('val',jQuery("#instancestatus_hidden"+id).val());
                  showalert('failure', translate("mdh.license.need.info"), "isAutoHide=true"); //No I18N
                 return false;
              }
            }else if(seleStat == "Retired"){ // No I18N
              cnf_msg = translate("mdh.status.change.retired",[e_html(inst_name)]); //No I18N
            }
            showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + cnf_msg + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', statusChangeCallback); // No I18N
            function statusChangeCallback(doChange){
              if(!doChange){
                jQuery("#instancestatus"+id).select2('val',jQuery("#instancestatus_hidden"+id).val());
              }
            }
          }
        },
        //Loading License list in Instance New/ Edit form
        port.loadLicenseList = function(ele, selLicense) {
            var availableLicenses = {};
              sdpAjax({
                  async:false,
                  url:"/servlet/AJaxServlet?action=getAvailMDHLicense", //NO I18N
                  type:"GET", //NO I18N
                  success:function(data)
                  {
                     availableLicenses = data.license_details;
                  }
              });
            var lic_Array = [];
              jQuery.each(availableLicenses[0],function(key,obj) {
                if(key !== "Portals"){
                  lic_Array.push({
                    "id" : key, //NO I18N
                    "text" : obj.Edition + " "+translate('license.edition.type')+" " + obj.NoOfUsers +" "+translate('license.tech.label') // No I18N
                  });
                }
              });
              if(isMDHSetup === "true" && typeof selLicense != 'undefined'){
                lic_Array.push({
                  "id":"No license",// No I18N
                  "text": translate("license.dissociate")// No I18N
                });
              }
              ele.select2({
                data : lic_Array,
                allowClear : true,
                placeholder : translate("mdh.license.placeholder"), // No I18N
              }).on('change',function(){
                  var sel_val = jQuery(this).val();
                  if(sel_val != ""){
                    jQuery(this).next().show();
                  }else{
                    jQuery(this).next().hide();
                  }
              });
        },
        //Getting License details
        port.getLicenseDetails = function(license_key,portalID){
          var resp  = {};
        var helpdeskID = portalID ? "&helpdeskID="+portalID:""; // NO I18N
          sdpAjax({
              async:false,
              url:"/servlet/AJaxServlet?action=getLicenseDetails&license_key="+license_key+helpdeskID, //NO I18N
              type:"GET", //NO I18N
              success:function(data)
              {
                resp = data;
              }
          });
          return resp;
        },
        port.equalheightinstances = function() { /*Set equal height widget instance*/
          var len = jQuery(document).find('[data-id=instances-head] [data-name=instances-block]');
          var i = 0;
          while (len.length > i) {
            var leftH = len.eq(i).outerHeight();
            var leftdiv = len.eq(i);
            i++;
            var rightH = len.eq(i).outerHeight();
            var rightdiv = len.eq(i);

            if (leftH >= rightH) {
              rightdiv.height(leftH);
              leftdiv.height(leftH);
            } else {
              leftdiv.height(rightH);
              rightdiv.height(rightH);
            }
            i++;
          }
        },
        port.instanceChange = function(ele) { //Portal image change while changing portal type dropdown
          var data = jQuery(ele).select2('data'); // No I18N
          var esmImages = {"Human Resources" : "esm-hr.png", "Facilities":"esm-facility.png", "Blank":"esm-blank.png"}; // No I18N
          var logoimg = esmImages[data.internal_name];
         
          sdpAjax({
          url: '/api/v3/portals/logo_url', // No I18N
          success: function(resp) 
          {
            var returnObj = resp.logo_url;
            for(var i=0; i<returnObj.length; i++ )
          	{
				if( returnObj[i].name === logoimg )
				{
					jQuery(ele).closest('form').find('img').attr('src', returnObj[i]['content-url']); // No I18N
					break;
				}
          	}
          },
          async:false
          });
        },
        port.licenseslidebar = function(ele,portalID) { //Open License Sidebar
            var data = {}, respObj = ""; // No I18N
            var licenseId = jQ(ele).prev().val();
            var PId =  portalID || jQ(ele).attr("data-portalid");
                if(PId){
                  sdpAjax({
                    url: '/api/v3/portals/' + PId, // No I18N
                    success: function(resp) {
                      respObj = resp;
                    },
                    async:false
                  });
                }
                data = mdh.portal.getLicenseDetails(licenseId,portalID);
                data.portalName = respObj.portal ? respObj.portal.name : ""; // No I18N
                data.isScpORAssetModuleEnabled = !sdp_app.IS_SCP || sdp_app.IS_ASSET_MODULE;
                renderhbs("#licensedetails", "licensedetail-template", data, false, "esm_instances"); // No I18N
                pinnableSidebar({
                  content: '#licensedeatils', // No I18N
                  pin: false,
                  overlap: false,
                  direction: 'right', // No I18N
                  maxWidth: 480,
                  removeclose: false,
                  closeOnEsc: true,
                  bgfreeze: false,
                  closeOnBodyclick: true,
                  animation: true
                });
                setTimeout(function(){
                  window.dispatchEvent(new Event('resize')); // No I18N
                  if(jQuery("#licese-addons div.form-group").length > 0){
                    jQuery("#addons-header").show();
                  }
                },100)
        },
        port.closeLicenseDet = function() { //Close License Sidebar
            jQuery("#licensedetails").html(""); // No I18N
        },
        port.saveUpdateInstance = function(type, inId, fromAdmin) { //Saving portal changes
          var dataVal = "" ,doReload = "false"; // No I18N; // No I18N
          if (inId) {
            dataVal = "/" + inId // No I18N
          }
          if (type !== "DELETE") {
              var portal = {}, inputObject = {};
              var form = jQuery("#instanceform" + inId);
              form.find("input[id='portalimage']").removeAttr("accept"); //SD-111894 
              var isValid = jQuery(form).valid();
              if (!isValid) {
                return false;
              } else {
                jQuery("#mdhLoading").html(mdh.loaderHTML('instancesave')); // No I18N
              }

              var inName = form.find("#instancename" + inId).val(); // No I18N
              var inDesc = form.find("#instancedesc" + inId).val(); // No I18N
              var inOwner = form.find("#instanceowner" + inId).select2('data');  // No I18N
              
              var alias_url = form.find("#alias_url" + inId).val();
              alias_url = jQuery.trim(alias_url);
              if(alias_url === ''){
            	  alias_url = null;
              }
             
              var statusObj = {};
              if(jQuery("#instancestatusName"+inId).length > 0){
                statusObj = {"id" : jQuery("#instancestatus"+inId).val(), "internal_name" : jQuery("#instancestatusName"+inId).val()}; // No I18N
              }else{
                statusObj = jQuery("#instancestatus"+inId).select2('data'); // No I18N
                if( typeof  statusObj.element != 'undefined')
                {
                  statusObj.internal_name =  jQuery(statusObj.element[0]).attr('internal_name');
                }
              }
              var inStatus = statusObj.internal_name;
              var inType = "";
              if (type === "POST") {
                inType = form.find("#instancetype" + inId).val();
                portal.type = { "id": inType }; // No I18N
                if(isSCP)
                {
                  inType="Blank";  // No I18N
                  portal.type = {"internal_name": inType }; // No I18N
                }
              }
              var licenseId = form.find("#instancelicense" + inId).val();
              if(licenseId != "" && !(isSCP && sdp_app.IS_SCP_GLOBAL_TECH_LICENSE)){
                if(licenseId == "No license")
                  {
                    portal.license_details = null;
                  }else{
                    portal.license_details = {"name" : licenseId}; //NO I18N
                  }
              }
              if (inStatus) {
                if(inStatus !== "License expired"){ // No I18N
                    portal.status = { "id": statusObj.id }; // No I18N
                }
                if((inStatus === "Production" || inStatus === "License expired") && licenseId == ""){
                    jQuery("#mdhLoading").html(''); // No I18N
                    showalert('failure', translate("mdh.license.mandate"), "isAutoHide=true"); //No I18N
                    return false;
                  }
              }

              portal.name = inName;
              portal.description = inDesc;
              portal.alias_url = alias_url;
              var ownIds = [];

              if(inOwner.constructor === Array){
                for(var i=0;i<inOwner.length;i++){
                  ownIds.push({"id":inOwner[i].id});
                }
              }else{
                if(inOwner.length != 0 && (typeof inOwner == "object" && !jQuery.isEmptyObject(inOwner))){
                  ownIds.push({'id':inOwner.id});
                }
              }
              if(ownIds.length > 0){
                portal.owners = ownIds;
              }

              if(isMDHSetup === "false" && type == "POST"){ // No I18N
                doReload = "true";
              }
            inputObject.portal = portal;
            dataVal += "?" + sdpAjaxInputData(inputObject);
          }else{
            //After creating first 'New' portal, will reload the page - to show the "ESM Portal" icon on Top-Right corner
            if(jQuery("#portals-list").find('[data-name="instances-block"]').length == 3){
               doReload = "true";
            }
            jQuery("#mdhLoading").html(mdh.loaderHTML('instancesave')); // No I18N
          }
          var helpdeskID = PORTALID;
          //API calss for ADD / EDIT/ DELETE
          sdpAjax({
            url: '/api/v3/portals' + dataVal, // No I18N
            type: type,
            ignorefailuremessage: true,
            success: function(resp) {
              let container;
              if(fromAdmin){
                if (type == "DELETE") { // No I18N
                  var exp = new Date();
                  exp.setTime (exp.getTime() - 1);
                  document.cookie =   "PORTALID= 0 ; expires=" + exp.toGMTString()+";path=/";// No I18N
                  location.href="/ui/home"; // No I18N
                }else{
                  jQuery("#mdhLoading").html(''); // No I18N
                  container = jQuery('#ESMRestartBanner_Container');
                  var displayValue = container.find("#restart_warning").css('display');//No I18N
                  var previousBannerMessage = container.find('#restart_warning .msg').text();
                  loadInstanceSettings(inId);
                  container = jQuery('#ESMRestartBanner_Container');
                    if(displayValue === 'inline-block'){
                      container.find('#restart_warning').css('display','block');//No I18N
                      container.find('#restart_warning').addClass('bs-noconflict');
                      container.find('#restart_warning .msg').text(previousBannerMessage);
                    }
                    if(resp.response_status[0] != null){
                      container.find('#restart_warning').css('display','block');//No I18N
                      container.find('#restart_warning').addClass('bs-noconflict');
                      container.find('#restart_warning .msg').text(resp.response_status[0].messages[1].message);
                      if(resp.response_status[0].messages.length > 1){
                        showalert('success', encodeHTML(resp.response_status[0].messages[1].message), 'isAutoHide=true');//NO I18N
                }
                    }
                }
              }else{
                if(type === "DELETE" && Math.abs(helpdeskID) == inId){//After deleting the portal, which is currently active in background - will redirect to ESM Portal page
                  location.href = "/ESM.do?type=portal";
                }else if(doReload === "true"){
                    location.reload();
                  }else{
                    container = jQuery('#ESMRestartBanner_Container');
                    var displayValue = container.find('#restart_warning').css('display');//No I18N
                    var previousBannerMessage = container.find('#restart_warning .msg').text();
                    m_Obj.portal.getAllInstances();
                    container = jQuery('#ESMRestartBanner_Container');
                    if(displayValue === 'inline-block'){
                          container.find('#restart_warning').css('display','block');//No I18N
                          container.find('#restart_warning').addClass('bs-noconflict');
                          container.find('#restart_warning .msg').text(previousBannerMessage);
                    }
                    if(resp.response_status[0] != null){
                      container.find('#restart_warning').css('display','block');//No I18N
                      container.find('#restart_warning').addClass('bs-noconflict');
                      container.find('#restart_warning .msg').text(resp.response_status[0].messages[0].message);
                      if(resp.response_status[0].messages.length > 1){
                        showalert('success', encodeHTML(resp.response_status[0].messages[1].message), 'isAutoHide=true');//NO I18N
                      }
                    }
                  }
                  jQuery("#mdhLoading").html(''); // No I18N
                }
            },
            failedCallBack: function(resp) {
              jQuery("#mdhLoading").html(''); // No I18N
              var res = resp.responseJSON;
              if (res.response_status.messages) {
                if(res.response_status.messages[0].status_code == 4008){
                  if(res.response_status.messages[0].field === 'alias_url'){
                	  showalert('failure', translate("mdh.instance.aliasurl.duplicate.key", [e_html(portal.alias_url)]), "isAutoHide=true"); //No I18N
                  }else{
                  showalert('failure', translate("mdh.instance.duplicate.key", [e_html(portal.name)]), "isAutoHide=true"); //No I18N
                }
                }
                else{
                  showalert('failure', e_html(res.response_status.messages[0].message), "isAutoHide=true"); //No I18N
                }
              }
            }
          });
        },
        /*Instance Form validation*/
        port.initalizeFormValidation = function(data, id) {
            jQuery.validator.addMethod(
            	      "empty_space", // No I18N
            	      function(value, element) {
            	    	  var valid = true;
            	          if(value == ''){
            	        	  return valid;
            	          }
            	          var tempvalue = jQuery.trim(value);
            	          if(tempvalue == ''){
            	            valid = false;
            	          }
            	          return valid;
            	       },
            	      window.translate("sdp.esm.portal.urlredirection.aliasurl.regex.err.msg")
            	    );
          var rules = {},
            messages = {};
          rules["instancename" + id] = { required: true , regex: /(?!^\d+$)^.+$/ };
          rules["instancetype" + id] = { required: true };
          rules["instanceowner" + id] = { required: true };
          rules["alias_url" + id]={ empty_space:true, regex: "^[a-zA-Z0-9-_]+$",max_length:50 };// No I18N

          messages["instancename" + id] = { required: translate("common.validation", [translate("mdh.instance.name")]), regex:translate("mdh.instance.name.numeric") }; // No I18N
          messages["instancetype" + id] = { required: translate("mdh.intance.type.mandatory") }; // No I18N
          messages["instanceowner" + id] = { required: translate("mdh.intance.owner.mandatory") }; // No I18N
          messages["alias_url" + id] = { regex : translate("sdp.esm.portal.urlredirection.aliasurl.regex.err.msg"),max_length:translate("sdp.esm.portal.urlredirection.aliasurlerror") }; // No I18N

          var errorFunc = function(error, element) {
            var eleHeight = element.height();
            if (element.parent().find('.select2-container').length > 0) {
              eleHeight = element.parent().find('.select2-container').height(); // No I18N
            }
            error.removeClass('p3 pl10 pr10 font-xsmall right0').removeAttr("style").addClass("alert alert-arrow p5 pos-abs left0").css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + eleHeight + 10) + 'px' }); // No I18N
          }
          //Initializing form validation
          initFormValidator("instanceform"+id,rules,messages,errorFunc); // No I18N
        },
        port.showHideNewInstance = function(arg, isEdit) { //Hide and show instance on Edit
          if(isEdit === true){
             jQuery('.instance-block').removeClass('editinstance').find('[id^="instance_edit_"],[id="instance_new"]').removeClass('show').addClass('hide').end().find(".detailform").removeClass('hide');
          }
          if (arg === "new" || arg === undefined) {
            jQuery("#instance_def,#instance_new").toggleClass('hide show'); // No I18N
            arg = "new"; // No I18N
            if (jQuery("#instance_new").hasClass("show")) {
              this.loadNewInstance();
            }
            jQuery("#instancename").trigger('focus');
          } else {
            if(isEdit === undefined){
               jQuery("#instance_" + arg).removeClass('hide'); // No I18N
               var imgEle = jQuery("#instance_" + arg).find(".esmlogo-img");
                  imgEle.attr('src',jQuery("#instance_edit_" + arg).find(".esmlogo-img").attr('src'));
               jQuery("#instance_edit_"+arg).removeClass('show').addClass('hide'); // No I18N
            }else{
              jQuery("#instance_" + arg).addClass('hide'); // No I18N
              jQuery("#instance_edit_" + arg).removeClass('hide').addClass('show'); // No I18N
            }
            arg = "edit_" + arg; // No I18N
          }
          var ele = jQuery("#instance_" + arg);
          if (ele.hasClass('show')) {
            ele.parents("[data-name='instances-block']").addClass('editinstance'); // No I18N
            charCounter.init();
          } else {
            ele.parents("[data-name='instances-block']").removeClass('editinstance'); // No I18N
          }
        },
        port.loadNewInstance = function(){
            let templateData = {isNotSCP :!sdp_app.IS_SCP, isNotSCP_TechLicense: isNotSCP_TechLicense };
            renderhbs("#instance_new", "instance-new-template", templateData, false, 'esm_instances'); // No I18N
            port.callUserSelect2(false,false,""); // No I18N
            m_Obj.portal.initalizeFormValidation(jQuery("#instanceform"), '');
            setTimeout(function(){
              if(orgAdmin == "true"){
            	  var instanceLicense = jQuery("#instance_new").find("#instancelicense");
            	  mdh.portal.loadLicenseList(instanceLicense);
            	  //SD-103437 :: disabling associate license field for Demo setup
            	  if(sdp_app.IS_DEMO_BUILD)
            	  {
        	        instanceLicense.select2('enable',false);//NO I18N
        	        jQuery("#instance_new").find('#s2id_instancelicense').attr('title',translate('sdp.demo.errormsg'));
            	  }
              }
              var inputoptions = {
                  select2Id: "instancetype", // No I18N
                  allowClear: true,
                  placeholder: translate("form.select.placeholder",[translate("mdh.type")]), // No I18N
                  callbackURL: "/portals/type", // No I18N
                  entity_name : "type", // No I18N
                  localsearch : true
              };
              new Select2APIComponent(inputoptions);
            },200);
        },
        port.instanceattachchange = function($this, id) { /*Instance attach input file change event*/
          var file = $this.files;
          if(file && file.length > 0){
            var portalid = id;
            var portalpic = jQuery($this)[0].files[0];
            var formdata = new FormData();
            formdata.append("input_image", portalpic);  //No I18N
            sdpAjax({
              processData: false,
              contentType: false,
              type: "PUT", // No I18N
              url: "/api/v3/portals/"+portalid+"/images", // No I18N
              data: formdata,
              success:function(response){
                if(response.response_status.status === "success"){
                      showalert('success', translate('portallogopic.uploadedMessage'), 'isAutoHide=true,delay=3'); // No I18N
                      var d = new Date();
                      if(!jQuery("form[data-id='"+portalid+"']").hasClass('hide')){
                        jQuery("form[data-id='"+portalid+"'] img").attr('src',response.media['content-url'] );
                      }else{
                        jQuery("#instanceform"+portalid+" img").attr('src',response.media['content-url'] );
                      }
                  }else{
                    showalert('failure', response.response_status.messages[0].message, 'isAutoHide=true'); // No I18N
                  }
              },
              async: false
            });
          }
        },
        port.loadPortals = function(url) { //Load portal list for Customization
          var _self = this, recursiveEnabled = false;
          //SD-81486 Showing all available portals in the ESM portal customization page.
          //Below code will load ESM portal page.
          var data = {"from_esm_portal":"true"}; // No I18N
          var portalHTML = mdh.portCustom.getPortalListHTML(data);
          sdpAjax({
            url: url || '/custom/esm/portalPublish.html', // No I18N
            async: false,
            dataType: 'html', //No I18N
            success: function(resp) {
              mdh.portCustom.compiledHTML = portalHTML;
              jQuery("#esmPortalHome").html(mdh.portCustom.getTempVarRepHTML(resp)); //NO I18N
              var fileName = "aesm_portal.css"; // No I18N
              if(sdp_user.DIRECTION === "RTL"){
                fileName = "aesm_portal_RTL.css"; // No I18N
              }
              var d = new Date();
              var url = "custom/style/"+fileName+"?"+d.getTime(); //NO I18N
              jQuery(document).find("head").append(jQuery("<link/>", { rel: "stylesheet", href: url, type: "text/css" }));
            },
            failedCallBack : function(){
              recursiveEnabled = true;
              _self.loadPortals('/custom/esm/portalDefault.html'); //NO I18N
            },
            ignorefailuremessage : true
          });
          if(recursiveEnabled){
            recursiveEnabled = false;
            return;
          }
          jQuery("#esmPortalHome .widget-panel").on('click', function() {
            var pId = jQuery(this).attr('data-id');
            port.gotoPortalInstance(pId);
          });
        /**Across Portal Search code*/
          across_search.initAcrossSearch();
          jQuery('#esmPortalHome #defaultHomeBtn').on('click', function() {
            var pId = jQuery(this).parents('.widget-panel').attr('data-id');//NO I18N
            port.toggleDefaultPortal(pId, this, jQuery(this).hasClass('home1'));//NO I18N
          });
        },
        port.toggleDefaultPortal = function(pId, element, isRemoved) { //To change the default instance
          event.stopPropagation();
          var inputObject = {'default_portal': {'id' : pId}};//NO I18N
          sdpAjax({
            type: 'PUT', //NO I18N
            url: '/api/v3/portals/toggle_default', // No I18N
            async: false,
            data: sdpAjaxInputData(inputObject),
            dataType: 'json', //NO I18N
            success: function(resp) {
              showalert('success', resp.response_status.messages[0].message, 'isAutoHide=true,delay=3'); // No I18N
              if(isRemoved){
                jQuery(element).removeClass('home1').addClass('home2').attr('title', translate("sdp.set.as.default.instance"));

              }else{
                jQuery('#esmPortalHome .widget-panel .home1').removeClass('home1').addClass('home2').attr('title', translate("sdp.set.as.default.instance"));
                jQuery(element).removeClass('home2').addClass('home1').attr('title', translate("sdp.default.instance"));
              }
            }
          });
        }
      return port;
    }()),
    /*Instances related code End*/

    /*Portal customization related code starts*/
    m_Obj.portCustom = (function() {
      var p_cust = {};
      p_cust.loadCustomization = function(){
        var opt= {};
            opt.module = "portal"; //NO I18N
            opt.getTemplateVariableReplacedHTML = p_cust.getTempVarRepHTML;
            opt.invlokeOnInit = p_cust.callOnPortalCustInit;
            opt.dynamicVariables = ["{{{company-name}}}","{{{portal-cards}}}","{{{footer}}}","{{{search-box}}}","{{{organization-name}}}","{{{user-name}}}"]; // No I18N
            opt.publishURL = "/custom/esm/portalPublish.html"; //NO I18N
            opt.draftsURL = "/custom/esm/portalDraft.html"; //NO I18N
            opt.defaultURL = "/custom/esm/portalDefault.html"; //NO I18N
            opt.renderOrder = ["/custom/esm/portalDraft.html", "/custom/esm/portalPublish.html", "/custom/esm/portalDefault.html"];//NO I18N
            new CustomizationComponent(opt);
      },
      p_cust.callOnPortalCustInit = function(){
        jQuery("#esmDirectory,#top-header").hide();
        p_cust.compiledHTML = p_cust.getPortalListHTML(true);
      },
      /* get the getPortalListHTML */
      p_cust.getPortalListHTML = function(fromHome){
      //SD-81486 Showing all available portals in the ESM portal customization page.
      var disPortals = {};
      var url ;
      // If portal customization page
      if( typeof fromHome == 'boolean' && fromHome )
      {
		  var inputObject = {};
		  inputObject.list_info = {'sort_field' : 'id' , "row_count": (sdp_app.MAX_HELPDESK_COUNT + sdp_app.MAX_CUSTOM_HELPDESK_COUNT)}; // No I18N
		  url =  '/api/v3/portals/_get_all_portals?' + sdpAjaxInputData(inputObject) ; // No I18N
	  }
	  //If esm portal page or cmEditor page .
	  else if( typeof fromHome == "object" && (fromHome.from_esm_portal || fromHome.cmEditor) )
	  {
		  var addparam = (fromHome.from_esm_portal || fromHome.cmEditor) ? "?fetch_large_size_logo=true": ""; // No I18N
		  url = '/api/v3/accessibleportals'+addparam; // No I18N
	  }
	  else
	  {
		   url = '/api/v3/accessibleportals'; // No I18N
	  }
      sdpAjax({
          url: url ,
          success: function(resp) {
            var accportObj = resp;
            accportObj.fromHome = fromHome;
            disPortals = p_cust.portalwidgetlist(accportObj);
            accportObj.newUI = true;
            mdh.portal.newUIHtml = p_cust.portalwidgetlist(accportObj);
            },
            async: false
          });
          return disPortals;
      },

      p_cust.portalwidgetlist = function(data) { //To construct portal widget list
        //Fn created to overcome the CodeCheck Error Rule:no-loop-func
        function getPortalImgSrc(logoUrlObject){
          return encodeHTMLAttribute(Object.keys(logoUrlObject).map(function(key) {
              return logoUrlObject[key];
          })[0]);
        }
        //SD-81486 Showing all available portals in the ESM portal customization page.
        var portals ={} ,portList = "", portHTML = "", cnt = 0; //NO I18N
        //ESM Customization page.
        if( typeof data.fromHome == 'boolean' && data.fromHome )
        {
          portals = data.portals ;
        }
        // From ESM portal page or cmEditor page.
        else if( typeof data.fromHome == "object" && (data.fromHome.from_esm_portal || data.fromHome.cmEditor) )
        {
          portals = portals = data.accessibleportal;
        }

          var portalLandingConfig = mdh.portCustom.getPortalLandingConfig().portal_landing_config;
          for (var i = 0; i < portals.length; i++) {
              var portal = portals[i];
              var idAttr = data.fromHome ? ' data-id="'+portal.id+'"' : ""; //NO I18N
              //SD-81486 Showing all available portals in the ESM portal customization page.
              // portal customization page
            if( typeof data.fromHome == 'boolean'  && data.fromHome)
              {
              if(data.newUI){
                  portHTML += '<div class="instance-panel widget-panel" '+idAttr+'><div class="inst-logo"><img src="'+getPortalImgSrc(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="inst-content">'; //NO I18N
                }else{
                  portHTML += '<div class="col-xs-4 instance-list"><div class="widget-panel cur-ptr" '+idAttr+'><div class="disp-c logo-img"><img src="'+getPortalImgSrc(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="disp-c pl15 pr10 pos-rel">'; //NO I18N
                }
             }
              // For ESM portal page and CM editor page
                else
                {
              if(data.newUI){
                    portHTML += '<div class="instance-panel widget-panel" '+idAttr+'><div class="inst-logo"><img src="'+encodeHTMLAttribute(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="inst-content">'; //NO I18N
                  }else{
                    portHTML += '<div class="col-xs-4 instance-list"><div class="widget-panel cur-ptr" '+idAttr+'><div class="disp-c logo-img"><img src="'+encodeHTMLAttribute(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="disp-c pl15 pr10 pos-rel">'; //NO I18N
                  }
            }
                  if((portalLandingConfig.type == 'org_default_portal' || (portalLandingConfig.type == 'esm_portal' && portalLandingConfig.is_allowed_preferred_portal_for_users)) && portal.type !== "Custom"){
                    if(portals.length > 1){
                      if(portal.is_default){
                        portHTML += '<span id="defaultHomeBtn" class="cspr icon-sm home1 right0 top4 pos-abs" title="'+translate("sdp.default.instance")+'" rel="uitip"/></span>'; //NO I18N
                      }else{
                        portHTML += '<span id="defaultHomeBtn" class="cspr icon-sm home2 right0 top4 pos-abs" title="'+translate("sdp.set.as.default.instance")+'" rel="uitip"/></span>'; //NO I18N
                      }
                    }
                  }
                   if(data.newUI){
                    portHTML += '<span class="inst-title"><span class="" title="'+e_html(portal.name)+'" rel="uitip">'+e_html(portal.name)+'</span></span><p class="inst-description" title="'+(encodeHTMLAttribute(portal.description) || "")+'" ><span>'+(e_html(portal.description) || "")+'</span></p></div></div>'; //NO I18N
                  }else{
                    portHTML += '<span class="truncate-ellipsis h4"><span class="truncate-wrapper" title="'+e_html(portal.name)+'" rel="uitip">'+e_html(portal.name)+'</span></span><p class="truncate-ellipsis mt10" title="'+(encodeHTMLAttribute(portal.description) || "")+'" ><span class="truncate-wrapper">'+(e_html(portal.description) || "")+'</span></p></div></div></div>'; //NO I18N
                  }
                  if(i === portals.length-1){
                   if(data.newUI){
                      portList ='<div class="instance-layout">' + portHTML + '</div>'; //NO I18N
                    }else{
                      portList = portList + '<div class="portal-widget"><div class="row justify-content-around">' + portHTML + '</div></div>'; //NO I18N
                    }
                    portHTML = ""; //NO I18N
                  }
          }
          return portList;
      },

      p_cust.getTempVarRepHTML = function(content){

          var portHTML = p_cust.compiledHTML;
          /* set the footer */
          if (content.indexOf("{{{footer}}}") !== -1) {
            content = content.replace(/{{{footer}}}/g, "Copyright © {{{company-name}}}. All rights reserved");
          }

          /* set the comapny name */
          if (content.indexOf("{{{company-name}}}") !== -1) {
            var companyName = sdp_app.PRODUCT_NAME;
            content = content.replace(/{{{company-name}}}/g, e_html(companyName));
          }

          if (content.indexOf("{{{user-name}}}") !== -1) {
            content = content.replace(/{{{user-name}}}/g, e_html(sdp_user.USERNAME));
          }
          
          /* set the Organization name  */
          if (content.indexOf("{{{organization-name}}}") !== -1) {
            var organizationName = sdp_app.ORG_NAME;
            content = content.replace(/{{{organization-name}}}/g, e_html(organizationName));
          }
        
          /* set the search input box */
          if (content.indexOf("{{{search-box}}}") != -1) {
           content = content.replace(/{{{search-box}}}/g, across_search.searchBoxHtml());
          } 

          if (content.indexOf("{{{portal-cards}}}") != -1) {
            portHTML = portHTML.replace("/* $Id:$ */", '');
            return content.replace(/{{{portal-cards}}}/g, portHTML);
          }else if(content.indexOf("{{{new-portal-cards}}}") != -1){
            portHTML = portHTML.replace("/* $Id:$ */", '');
            return content.replace(/{{{new-portal-cards}}}/g, mdh.portal.newUIHtml);
          } else {
            return content;
          }
      },
      p_cust.getPortalLandingConfig = function() {
        var returnObj = {};
        sdpAjax({
          url: '/api/v3/portals/get_landing_config', // No I18N
          success: function(resp) {
            returnObj.portal_landing_config = resp.portal_landing_config;
          },
          async:false
        });
        return returnObj;
      },
      p_cust.loadPortalLandingConfig = function() {
        var inputObject = {};
        inputObject.list_info = {'sort_field' : 'id','search_criteria':{'field':'status.name','condition':'is','value':'Production'}}; // No I18N
        //SD-111362 Unable to view more than 10 instance in license tab, Application Settings, ESM Portal Customization.
        inputObject.list_info = {'sort_field' : 'id' , "row_count": sdp_app.MAX_HELPDESK_COUNT , 'search_fields' : {'status.name' : 'Production'}}; // No I18N
        var dataVal  = sdpAjaxInputData(inputObject);
        sdpAjax({
          url: '/api/v3/portals?' + dataVal, // No I18N
          success: function(resp) {
              var portals = resp.portals;
              for( i = 0; i < portals.size(); i++ ) {
                jQuery('#portalList').append(jQuery('<option></option>').text(portals[i].name).val(portals[i].id));
              }
          },
          async: false
        });
        var portalLandingConfig = this.getPortalLandingConfig().portal_landing_config;
        if( portalLandingConfig.type == 'org_default_portal' ) {
          if( jQuery('#portalList option[value="'+portalLandingConfig.default_portal.id+'"]').length == 0 ) {
            jQuery('#portalList').append(jQuery('<option></option>').text(portalLandingConfig.default_portal.name).val(portalLandingConfig.default_portal.id).attr('isinvalid', 'true'));//NO I18N
          }
          jQuery('#org_default_portal').prop('checked', 'true');//NO I18N
          jQuery('#portalList').val(portalLandingConfig.default_portal.id);
          jQuery('#defaultPortalInfo').removeClass('hide');//NO I18N
        } else if( portalLandingConfig.type == 'esm_portal' ) {
          jQuery('#esm_portal').prop('checked', 'true');//NO I18N
          jQuery('#allowLandingPage').parent().parent().removeClass('hide');//NO I18N
          if( portalLandingConfig.is_allowed_preferred_portal_for_users ) {
            jQuery('#allowLandingPage').prop('checked', 'true');//NO I18N
          }
        }
        jQuery('#portalList').select2();
        jQuery('#portalList').change(function() {
          if( jQuery('#org_default_portal').is(':checked') ) {
            jQuery('#defaultPortalInfo').removeClass('hide');//NO I18N
            jQuery('#portalList option[isinvalid="true"]').remove();
          }
        });
        jQuery('input[name=landingType]').change(function() {
          if( this.id == 'esm_portal' ) {
            jQuery('#defaultPortalInfo').addClass('hide');//NO I18N
            jQuery('#allowLandingPage').parent().parent().removeClass('hide');//NO I18N
          } else if( this.id == 'org_default_portal' ) {
            jQuery('#defaultPortalInfo').removeClass('hide');//NO I18N
            jQuery('#allowLandingPage').parent().parent().addClass('hide');//NO I18N
          }
        });
      },
      p_cust.updateLandingPageConfig = function() {
        var inputObject = {};
        var landingType = jQuery('input[name=landingType]:checked').attr('id');//NO I18N
        inputObject.type = landingType;
        if( landingType == 'org_default_portal' ) {
          var defaultPortalID = jQuery('#portalList').val();
          if( defaultPortalID == -1 ) {
            showalert('failure', translate('sdp.default.instance.empty'), 'isAutoHide=true');//NO I18N
            return;
          }
          var defaultPortalObj = {'id': defaultPortalID};//NO I18N
          inputObject.default_portal =  defaultPortalObj;
          jQuery("#allowLandingPage").prop('checked', false);//NO I18N
        } else if( landingType == 'esm_portal' ) { //NO I18N
          inputObject.is_allowed_preferred_portal_for_users = jQuery('#allowLandingPage').is(':checked');//NO I18N
          jQuery('#portalList').select2('val', -1);//NO I18N
        }
        sdpAjax({
          type: 'PUT', //NO I18N
          url: '/api/v3/portals/update_landing_config', //NO I18N
          data: sdpAjaxInputData(inputObject),
          dataType: 'json', //NO I18N
          success: function(responseJson) {
            showalert('success', responseJson.response_status.messages[0].message, 'isAutoHide=true');//NO I18N
          }
        });
      }
      return p_cust;
    }()),
    
     m_Obj.portalurlredirection = (function() {
    	 
      var p_portalurlredirection = {};
      
      var urlredirection_portals=[];
      
      /*
       * showAliasURLPreview Method used to show alias url preview in instance card.
       */
      
      p_portalurlredirection.showAliasURLPreview = function($this, id){

    	  if(id != undefined){

    		  if($this.value.length == 50 ){

    			  jQuery("#showFullAliasUrlParagraph"+id).attr('class','wb-bw pt25 mb5');

    		  }else{

    			  jQuery("#showFullAliasUrlParagraph"+id).attr('class','wb-bw pt10 mb5');

    		  }

		  jQuery("#showFullAliasUrlSpan"+id).text(window.location.origin+'/portal/'+$this.value);//NO I18N
    	  
	  }else{

    		  if($this.value.length == 50){

    			  jQuery("#showFullAliasUrlParagraph").attr('class','wb-bw pt25 mb5');

    		  }else{
    			  jQuery("#showFullAliasUrlParagraph").attr('class','wb-bw pt10 mb5');

    		  }

                  jQuery("#showFullAliasUrlSpan").text(window.location.origin+'/portal/'+$this.value);//NO I18N

    	  }

      }

      /*
       *   getURLRedirectionEnabledInstances method is used to get all instances with alias url 
       */
      p_portalurlredirection.getURLRedirectionEnabledInstances = function(){
    	  
    	  var accessiblePortals = [];
    	  
    	  var allPortals = [];
    	  
          sdpAjax({
            url: '/api/v3/accessibleportals', // No I18N
            success: function(resp) {
                accessiblePortals = jQuery.map(resp.accessibleportal, function(obj, index){
                  return obj.id + "";
                });
            },
            async:false
          });

    	  var inputObject = {};

    	  var instanceWithAliasUrls = {};
    	  
    	  var instanceWithInstanceID = {};

    	  var search_criteria = {
    				  "field": "status.internal_name",// No I18N
    				  "condition": "is not",// No I18N
    				  "values": ["Retired","License expired"]// No I18N
    	  }
    	  inputObject.list_info = {'sort_field' : 'id','search_criteria':search_criteria, 'fields_required':['id','name','alias_url','status']}; // No I18N
        //SD-111362 Unable to view more than 10 instance in license tab, Application Settings, ESM Portal Customization.
    	  inputObject.list_info = {'sort_field' : 'id','search_criteria':search_criteria , 'row_count' : sdp_app.MAX_HELPDESK_COUNT }; // No I18N
    	  

    	  var dataVal  = sdpAjaxInputData(inputObject);

    	  sdpAjax({

    		  url: '/api/v3/portals?' + dataVal, // No I18N

    		  success: function(resp) {

    			  allPortals = resp.portals;
    			  
    			  var portalIndex = 0 ;
    			  
    			  urlredirection_portals = [];
    			  
    			  while( portalIndex < allPortals.length){
    				  
    				  if(accessiblePortals.contains(allPortals[portalIndex].id) || allPortals[portalIndex].status.internal_name == 'New'){
    					  
    					  urlredirection_portals.push(allPortals[portalIndex]);
    				  
    				  }
    				  
    				 portalIndex++;

    				  
    			  }

    			  for( var j = 0; j < urlredirection_portals.length; j++ ){

    				  // Filtering the instance having alias url
    				  

    				  if(urlredirection_portals[j].alias_url != null && urlredirection_portals[j].alias_url != ''){

    					  instanceWithAliasUrls[urlredirection_portals[j].id] = urlredirection_portals[j].alias_url;
    					  
    					  instanceWithInstanceID[urlredirection_portals[j].id] = urlredirection_portals[j].id;

    				  }

    			  }

    			  // populating the populateURLRedirectionInstances in ESM Portal Customization

    			  mdh.portalurlredirection.populateURLRedirectionInstances(urlredirection_portals,instanceWithAliasUrls,instanceWithInstanceID)

    		  },

    		  async: false

    	  });

      }
      
      /*
       *   deleteURLRedirectionForInstance method is used to delete selected url redirection for a instance.
       */
      p_portalurlredirection.deleteURLRedirectionForInstance = function(obj){

    	  var baseId = jQuery(obj).attr('id').split('_')[1];

    	  jQuery(document.getElementById("instanceWithAliasUrl_"+baseId)).remove();

    	  // If number of portals is equal to number of alias url configured portals then, while removing one instance alias url, we have to change the (-) icon to (+) icon 

    	  if( urlredirection_portals.length == (jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").length+1) ){

    		  var lastElementId = jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]:last").attr('id').split('_')[1];

    		  // Remove (-) sign and remove button tool tip and then add write on click atribute for (+) button

    		  jQuery(document.getElementById('rowBtn_'+lastElementId)).attr({'data-action': 'addNewURLRedirectionInstance', 'title': getMessageForKey('sdp.common.add')});//NO I18N

    		  jQuery(document.getElementById('rowBtn_'+lastElementId)).removeClass('removerowbtn').addClass('addrowbtn');//NO I18N

    		  jQuery(document.getElementById('rowBtnIcon_'+lastElementId)).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N

    		  // remove instance alias url tooltips

    		  jQuery('#instanceNameSelect_'+baseId).removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    		  jQuery('#instanceWithAliasUrl_'+baseId).removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    	  }

      }


      /* 
       * defaultURLRedirectionInstance Method to used create one url redirection instance with no instance choose and empty alias url value if none of the portals configured with alias url.
       * */
      p_portalurlredirection.defaultURLRedirectionInstance = function(urlredirection_portals){

    	  var newElement = jQuery("#cloneUrlRedirectionHeader").clone(true);

    	  newElement.attr('id', 'instanceWithAliasUrl_1');

    	  newElement.find('#rowBtn').removeClass('removerowbtn').addClass('addrowbtn');//NO I18N

    	  newElement.find('#rowBtn').attr({'title': getMessageForKey('sdp.common.add'), 'data-action': 'addNewURLRedirectionInstance', 'id': 'rowBtn_1'});//NO I18N

    	  newElement.find('#rowBtnIcon').removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N

    	  newElement.find('#rowBtnIcon').attr('id', 'rowBtnIcon_1');//NO I18N

    	  for( var i = 0; i < urlredirection_portals.length; i++ ){

    		  newElement.find("#instanceNameSelect").append(jQuery("<option></option>").text(urlredirection_portals[i].name).val(urlredirection_portals[i].id));

    	  }

    	  newElement.find('#instanceNameSelect').attr('id', 'instanceNameSelect_1');

    	  newElement.find("#instanceAliasUrlValue").attr("placeholder", "Example : IT, HR, Facility");

    	  newElement.find('#instanceAliasUrlValue').attr('id', 'instanceAliasUrlValue_1');

    	  newElement.removeAttr("style")

    	  jQuery("#urlRedirectionInstances").append(newElement);

      }

      /*
       * addNewURLRedirectionInstance Method to used add new url redirection instance
       */
      p_portalurlredirection.addNewURLRedirectionInstance = function(input){

    	  var baseId = jQuery(input).attr('id').split('_')[1];

    	  var baseElement = jQuery(document.getElementById('instanceWithAliasUrl_'+baseId));//NO I18N

    	  var newElement = baseElement.clone(true);

    	  jQuery(newElement).attr('id',"instanceWithAliasUrl_" + (Number(baseId)+1));

    	  jQuery(newElement).show().removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    	  // Adding remove button for previous element

    	  jQuery(document.getElementById("rowBtn_"+baseId)).attr({'data-action': 'deleteURLRedirectionForInstance', 'title': getMessageForKey('sdp.common.remove')});//NO I18N

    	  jQuery(document.getElementById("rowBtn_"+baseId)).removeClass('addrowbtn').addClass("removerowbtn");//NO I18N

    	  jQuery(document.getElementById("rowBtnIcon_"+baseId)).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N

    	  // setting id and atribute values for a new element

    	  jQuery(newElement).find("#instanceAliasUrlValue_"+baseId).val("").attr('data-action', 'validateURLRedirectionForInstance');

    	  jQuery(newElement).find("#instanceNameSelect_"+baseId).attr("id", "instanceNameSelect_"+(Number(baseId)+1));

    	  jQuery(newElement).find("#instanceAliasUrlValue_"+baseId).attr("id", "instanceAliasUrlValue_"+(Number(baseId)+1));

    	  jQuery(newElement).find("#rowBtn_"+baseId).attr("id", "rowBtn_"+(Number(baseId)+1));

    	  jQuery(newElement).find("#rowBtnIcon_"+baseId).attr("id", "rowBtnIcon_"+(Number(baseId)+1));

    	  jQuery("#urlRedirectionInstances").append(newElement);

    	  // if the newly added url redirection instance reaches the length of portals then move the (+) icon to (-) icon for new element.

    	  if( urlredirection_portals.length == jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").length ){

    		  jQuery(document.getElementById("rowBtn_"+(Number(baseId)+1))).attr({'data-action': 'deleteURLRedirectionForInstance', 'title': getMessageForKey('sdp.common.remove')});//NO I18N

    		  jQuery(document.getElementById("rowBtn_"+(Number(baseId)+1))).removeClass('addrowbtn').addClass('removerowbtn');//NO I18N

    		  jQuery(document.getElementById("rowBtnIcon_"+(Number(baseId)+1))).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N

    	  }

      }

      /*
       * populateURLRedirectionInstances Method to used populate the instance having alias url in ESM Portal Customization
       */
      p_portalurlredirection.populateURLRedirectionInstances = function(urlredirection_portals, instanceWithAliasUrls,instanceWithInstanceID){
    	  
    	  if( jQuery("#cloneUrlRedirectionHeader").length == 1 ){

    		  var baseElement = jQuery("#cloneUrlRedirectionHeader");

    		  // get all instance id's and stored in instanceWithAliasUrls_keys
    		  var instanceWithAliasUrls_keys = Object.keys(instanceWithAliasUrls);

    		  if( instanceWithAliasUrls_keys.length > 0 ){
    			  // iterate all instance id's and populate all url redirection instances
    			  for( var i = 0; i < instanceWithAliasUrls_keys.length; i++ ){
    				  
    				  var newElement = baseElement.clone(true);

    				  newElement.attr('id', 'instanceWithAliasUrl_' + (i+1));
    				  
    				  newElement.show();

    				  // populating url redirection instance name and alias url value.
    				  for( var j = 0; j < urlredirection_portals.length; j++ ){
    					  
    					  newElement.find('#instanceNameSelect').append(jQuery("<option></option>").text(urlredirection_portals[j].name).val(urlredirection_portals[j].id));

    					  if( instanceWithAliasUrls_keys[i] == urlredirection_portals[j].id ){
    						  
    						  newElement.find("#instanceNameSelect").val(urlredirection_portals[j].id);//NO I18N
    						  
    						  newElement.find("#instanceAliasUrlValue").val(instanceWithAliasUrls[instanceWithAliasUrls_keys[i]]);
    						  
    					  }
    					  
    				  }

    				  // Adding placeholder, ID and row button
    				  newElement.find("#instanceAliasUrlValue").attr("placeholder", "Example : IT, HR, Facility");

    				  newElement.find('#instanceNameSelect').attr("id", "instanceNameSelect_" + (i+1) );
    				 
    				  newElement.find("#instanceAliasUrlValue").attr("id", "instanceAliasUrlValue_" + (i+1));
    				  
    				  newElement.find("#rowBtn").attr("id", "rowBtn_" + (i+1));//NO I18N
    				  
    				  newElement.find("#rowBtnIcon").attr("id", "rowBtnIcon_" + (i+1));//NO I18N

    				  jQuery("#urlRedirectionInstances").append(newElement);

    				  // while populating last url redirection check the number of portals length. if both matches. Add (-) button at the last.
    				  if( urlredirection_portals.length == jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").length ){
    					  
    					  jQuery(document.getElementById("rowBtn_"+(i+1))).attr({'data-action': 'deleteURLRedirectionForInstance', 'title': getMessageForKey('sdp.common.remove')});//NO I18N
    					 
    					  jQuery(document.getElementById("rowBtn_"+(i+1))).removeClass('addrowbtn').addClass('removerowbtn');//NO I18N
    					  
    					  jQuery(document.getElementById("rowBtnIcon_"+(i+1))).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N
    				  
    				  }else if( i == (instanceWithAliasUrls_keys.length-1) ){ // while populating the last url redirection instance we have to add (+) button for the last

    					  jQuery(document.getElementById("rowBtn_"+(i+1))).attr({'data-action': 'addNewURLRedirectionInstance', 'title': getMessageForKey('sdp.common.add')});//NO I18N
     					 
    					  jQuery(document.getElementById("rowBtn_"+(i+1))).removeClass('removerowbtn').addClass('addrowbtn');//NO I18N
    					  
    					  jQuery(document.getElementById("rowBtnIcon_"+(i+1))).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N
    					  
    				  }
    			  
    			  }
    		  
    		  }else{ // If none of the instance having alias url then populate the defaultURLRedirectionInstance
    			  
    			  mdh.portalurlredirection.defaultURLRedirectionInstance(urlredirection_portals);
    		  
    		  }
    	  
    	  }	
      }

      /*
       * saveURLRedirectionConfig Method is used to save url redirection configuration in ESM Portal Customization
       */
      p_portalurlredirection.saveURLRedirectionConfig = function(){

    	  var inputObject = {};

    	  var portals = [];

    	  if(mdh.portalurlredirection.validateURLRedirectionConfigBeforeSave()){ // validating url redirection configuration

    		  // Iterating all url redirection instances to get the instance alias url values as jsonarray to save.
    		  jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").each(function(){

    			  var baseId = jQuery(this).attr('id').split('_')[1];

    			  if( jQuery(document.getElementById('instanceNameSelect_'+baseId)).find(':selected').val() != "-1" ){

    				  var instanceName = parseInt(jQuery(document.getElementById('instanceNameSelect_'+baseId)).find(':selected').val());//NO I18N

    				  var aliasUrlValue = jQuery(document.getElementById('instanceAliasUrlValue_'+baseId)).val();//NO I18N

    				  if( aliasUrlValue != "" ){ // if alias url value not equal to null

    					  var portal = {};

    					  portal["alias_url"] = aliasUrlValue;

    					  portal["id"] = instanceName;

    					  // storing details as jsonarray
    					  portals.push(portal);

    				  }

    			  }

    		  });

    		  // If already alias url configured instance removed then it will not be available in portals jsonarray
    		  // we have to remove that alias url configured for a instance
    		  for(var i = 0 ; i < urlredirection_portals.length; i++ ){

    			  var instanceFlag = false;

    			  for( var j = 0; j< portals.length; j++ ){

    				  if(urlredirection_portals[i].id == portals[j].id ){

    					  instanceFlag = true;

    				  }

    			  }

    			  if(!instanceFlag && urlredirection_portals[i].alias_url != null){ // pushing the removed already alias url configured instance.

    				  var portal = {};

    				  portal["alias_url"] = null;// No I18N

    				  portal["id"] = urlredirection_portals[i].id;

    				  portals.push(portal);

    			  }

    		  }

    		  inputObject.portals = portals;

    		  if(portals.length == 0){ // If alias not configured for any of the portals then throw error as no changes.

    			  showalert('failure', getMessageForKey('sdp.esm.portal.urlredirection.update.nochanges') , 'isAutoHide=true');//NO I18N

    		  }else{

    			  sdpAjax({

    				  type: 'PUT', //NO I18N

    				  url: '/api/v3/portals', //NO I18N

    				  data: sdpAjaxInputData(inputObject),

    				  dataType: 'json', //NO I18N

    				  success: function(responseJson) {

    					  // If update success
    					  showalert('success',getMessageForKey('sdp.esm.portal.urlredirection.update.successmsg') , 'isAutoHide=true');//NO I18N

    					  // removing empty url redirection instances
    					  mdh.portalurlredirection.removeEmptyURLRedirectionInstances();

    					  // updating alias url in urlredirection_portals variable
    					  if(!Array.isArray(responseJson.portals)){

    						  for(var i = 0 ; i < urlredirection_portals.length; i++){

    							  if(responseJson.portals.id == urlredirection_portals[i].id){

    								  urlredirection_portals[i].alias_url = responseJson.portals.alias_url;

    								  break;

    							  }

    						  }

    					  }else{

    						  for(var j=0 ; j < responseJson.portals.length ; j++){

    							  for(var i = 0 ; i < urlredirection_portals.length; i++){

    								  if(responseJson.portals[j].id == urlredirection_portals[i].id){

    									  urlredirection_portals[i].alias_url = responseJson.portals[j].alias_url;

    									  break;

    								  }

    							  }

    						  }

    					  }

    				  },
    				  error:function(error){
    					  
    					  for(var errorIndex =0 ; errorIndex < error.responseJSON.response_status.length; errorIndex++){
    						  
    						  if(error.responseJSON && error.responseJSON.response_status[errorIndex].status === 'failed'){
    							
    	    					  showalert('failure',error.responseJSON.response_status[errorIndex].messages[0].message , 'isAutoHide=true');//NO I18N
    							  
    							  break;
    							  
    						  }
    						  
    					  }

    				  }

    			  });

    		  }

    	  }

      }


      /*
       * resetInstanceAliasUrl Method to used reset the alias url value if instance changed in dropdown.
       */
      p_portalurlredirection.resetInstanceAliasURL = function(inp){

    	  var baseId = jQuery(inp).attr('id').split('_')[1];

    	  var instanceNameGlobal = jQuery(document.getElementById('instanceNameSelect_'+baseId)).find(':selected').text();

    	  // remove error tooltip already present as well as make the value of alias url value as empty.

    	  jQuery(document.getElementById('instanceAliasUrlValue_'+baseId)).val("");//NO I18N

    	  jQuery('#instanceNameSelect_'+baseId).removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    	  jQuery('#instanceWithAliasUrl_'+baseId).removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    	  var tempInstanceName = [];


    	  // while changing instance name in dropdown check the instance name already configured or not.
    	  jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").each(function() {

    		  var base_id = jQuery(this).attr('id').split('_')[1];

    		  if( jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').val() != -1 ){

    			  var instanceName = jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').text();//NO I18N

    			  if( tempInstanceName.indexOf(instanceName) == -1 ){
    				  
    				  if(instanceName == instanceNameGlobal){

    					  tempInstanceName.push(instanceName);
    				  
    				  }

    			  }else{

    				  showErrorInURLRedirection(jQuery('#instanceNameSelect_'+baseId), getMessageForKey('sdp.esm.portal.urlredirection.already.congfig.err.msg', [instanceName]));//NO I18N

    				  return false;

    			  }

    		  }

    	  });

      }

      /*
       * validateAliasURL Method used to validate instance alias url values.
       */
      p_portalurlredirection.validateAliasURL = function(inp){
      	
      	var tempInstanceName = [];
      	
      	var tempAliasUrlValue = [];
      	
      	var regex = new RegExp("^[a-zA-Z0-9-_]{0,50}$");
      	
      	var baseId = jQuery(inp).attr('id').split('_')[1];
      	
		var aliasUrlValueGlobal = jQuery(document.getElementById('instanceAliasUrlValue_'+baseId)).val().toLowerCase();//NO I18N

      	// remove the already present tooltip of alias url
    	jQuery('#instanceWithAliasUrl_'+baseId).removeClass('has-error').closest("div").find('div[id=normalbubbletooltip]').remove();//NO I18N

    	// iterating all url redirection instance
      	jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").each(function() {

      		var base_id = jQuery(this).attr('id').split('_')[1];

      		if( jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').val() != -1 ){
      			
      			// checking instance name first
      			var instanceName = jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').text();//NO I18N
      			
      			if( tempInstanceName.indexOf(instanceName) == -1 ){
      				
      				tempInstanceName.push(instanceName);
      				
      			}else{

      				if( baseId == base_id ){
      					
      					showErrorInURLRedirection(jQuery('#instanceNameSelect_'+baseId), getMessageForKey('sdp.esm.portal.urlredirection.already.congfig.err.msg', [instanceName]));//NO I18N
      					
      					return false;
      				
      				}
      				
      			}
      			
      			//checking alias url value
      			var aliasUrlValue = jQuery(document.getElementById('instanceAliasUrlValue_'+base_id)).val().toLowerCase();//NO I18N
      			
      			if(aliasUrlValue == ''){
      				
      				showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.empty.err.msg', [aliasUrlValue]));//NO I18N
      			
  					return false;
      				
      			}else if(aliasUrlValue.length > 50){
      				
      				showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurlerror'));//NO I18N
      				
  					return false;

      			}else if( aliasUrlValue.length <= 50 && aliasUrlValue != '' && tempAliasUrlValue.indexOf(aliasUrlValue) == -1  ){
      				
      				if(aliasUrlValueGlobal == aliasUrlValue){
      					
      					if(regex.test(aliasUrlValue)){
      					
      						tempAliasUrlValue.push(aliasUrlValue);
      					
      					}else{
      					
      						showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+baseId), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.regex.err.msg', [aliasUrlValue]));//NO I18N
      				
      						return false;

      					}
      				
      				}
      				
      			}else{

      				//if( baseId == base_id ){
      					
      					showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+baseId), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.already.congfig.err.msg', [aliasUrlValue]));//NO I18N
      					
      					return false;
      				
      				//}
      				
      			}
      			
      			
      		}else{
      			
      			showErrorInURLRedirection(jQuery('#instanceNameSelect_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.instancenotselected', [instanceName]));//NO I18N
      			
      			return false;
      		}
      		
      	});
      	
      }


      /*validateURLRedirectionConfigBeforeSave
      * Method used validate to the Url Redirection instance name and alias url values before save.
      */
      p_portalurlredirection.validateURLRedirectionConfigBeforeSave = function(){

    	  var tempInstanceName = [];

    	  var tempAliasUrlValue = [];

    	  var regex = new RegExp("^[a-zA-Z0-9-_]{0,50}$");

    	  var err = false;

    	  // iterating all url redirection instance
    	  jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").each(function() {

    		  var base_id = jQuery(this).attr('id').split('_')[1];

    		  // checking instance name
    		  if( jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').val() != -1 ){

    			  var instanceName = jQuery(document.getElementById('instanceNameSelect_'+base_id)).find(':selected').text();//NO I18N


    			  if( tempInstanceName.indexOf(instanceName) == -1 ){

    				  tempInstanceName.push(instanceName);

    			  }else{

    				  err = true;

    				  showErrorInURLRedirection(jQuery('#instanceNameSelect_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.already.congfig.err.msg', [instanceName]));//NO I18N

    			  }

    			  // checking alias url
    			  var aliasUrlValue = jQuery(document.getElementById('instanceAliasUrlValue_'+base_id)).val().toLowerCase();//NO I18N

    			  if( aliasUrlValue.length <= 50 && aliasUrlValue != '' && tempAliasUrlValue.indexOf(aliasUrlValue) == -1 ){

    				  if(regex.test(aliasUrlValue)){

    					  tempAliasUrlValue.push(aliasUrlValue);

    				  }else{

    					  err = true;

    					  showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.regex.err.msg', [aliasUrlValue]));//NO I18N

    				  }

    			  }else if(aliasUrlValue == ''){

    				  err = true;

    				  showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.empty.err.msg', [aliasUrlValue]));//NO I18N

    			  }else if(aliasUrlValue.length > 50){
    				  
    				  err = true;
    				  
    				  showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurlerror'));//NO I18N
      			
    			  }else{

    				  err = true;

    				  showErrorInURLRedirection(jQuery('#instanceAliasUrlValue_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.aliasurl.already.congfig.err.msg', [aliasUrlValue]));//NO I18N

    			  }

    			  jQuery(this).attr('isvalid', 'true');//NO I18N

    		  }else{ 

    			  var aliasUrlValue = jQuery(document.getElementById('instanceAliasUrlValue_'+base_id)).val().toLowerCase();//NO I18N

    			  if(aliasUrlValue != ''){ // instance not chosed but having alias url

    				  showErrorInURLRedirection(jQuery('#instanceNameSelect_'+base_id), getMessageForKey('sdp.esm.portal.urlredirection.instancenotselected', [instanceName]));//NO I18N

    				  err =  true;

    			  }else{

    				  jQuery(this).removeAttr('isvalid');//NO I18N

    			  }

    		  }

    	  });

    	  if(err){
    		  
    		  return false
    		  
    	  }

    	  return true;

      }

      /* removeEmptyURLRedirectionInstances 
       * Method to used remove unfilled instance name and values 
       * */
      p_portalurlredirection.removeEmptyURLRedirectionInstances = function(){

    	  var isConfigured = false;

    	  jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").each(function() {

    		  if( jQuery(this).attr('isvalid') == "true" ){

    			  isConfigured = true;

    		  }else{

    			  if(jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").length > 1){

    				  jQuery(this).remove();

    			  }

    		  }

    	  });

    	  // remove the empty url redirection instance and add (+) button to the previous url redirection instance
    	  if( isConfigured && urlredirection_portals.length > jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]").length ) {

    		  var lastElementId = jQuery("#urlRedirectionInstances div[id^=instanceWithAliasUrl_]:last").attr('id').split('_')[1];

    		  if( jQuery(document.getElementById('rowBtn_'+lastElementId)).hasClass('removerowbtn') ){

    			  jQuery(document.getElementById('rowBtn_'+lastElementId)).attr({'data-action': 'addNewURLRedirectionInstance', 'title': getMessageForKey('sdp.common.add')});//NO I18N

    			  jQuery(document.getElementById('rowBtn_'+lastElementId)).removeClass('removerowbtn').addClass('addrowbtn');//NO I18N

    			  jQuery(document.getElementById('rowBtnIcon_'+lastElementId)).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N

    		  }

    	  }

      }

      /*
       * showErrorInURLRedirection Method to used when validate the fields data if error occurs throw the custom error.
       */
      function showErrorInURLRedirection( errorElement, errMsg ){

    	  errorElement.parent().addClass('pos-rel');

    	  errorElement.parent().addClass('has-error');

    	  setTimeout(function(){

    		  showToolTipMessage(errorElement[0], errMsg, -1);

    		  jQuery("#normalbubbletooltip").addClass("top20"); // No I18N  // Avoid Error message Overlap

    	  }, 500);

    	  setTimeout(function(){errorElement.parent().removeClass('has-error');}, 4000);

      }
      
      return p_portalurlredirection;
      
     }())
  /*Portal customization related code end*/
  return m_Obj;
}());

/* ESM Helpers Start*/
//To check loogedin user is Portal Owner
Handlebars.registerHelper('isUserPortalOwner', function(ownerList){ // No I18N
  if(ownerList != undefined){
    for (var i = 0; i < ownerList.length; i++) {
      if(ownerList[i].id == sdp_user.LOGGEDIN_USERID){
        return true;
      }
    }
  }
    return false;
});
//To construct portal widget list
Handlebars.registerHelper('portalwidgetlist', function(data){ // No I18N
//SD-81486 Showing all available portals in the ESM portal customization page.
var portals ={} ,portList = "", portHTML = "", cnt = 0; //NO I18N
//ESM Customization page.
if( typeof data.fromHome == 'boolean' && data.fromHome )
{
	portals = data.portals ;
}
// From ESM portal page or cmEditor page.
else if( typeof data.fromHome == "object" && (data.fromHome.from_esm_portal || data.fromHome.cmEditor) )
{
	portals = portals = data.accessibleportal;
}

  var portalLandingConfig = mdh.portCustom.getPortalLandingConfig().portal_landing_config;
  for (var i = 0; i < portals.length; i++) {
      var portal = portals[i];
      var idAttr = data.fromHome ? ' data-id="'+portal.id+'"' : ""; //NO I18N
      //SD-81486 Showing all available portals in the ESM portal customization page.
      // portal customization page
	  if( typeof data.fromHome == 'boolean'  && data.fromHome)
      {
        if(data.newUI){
          portHTML += '<div class="instance-panel widget-panel" '+idAttr+'><div class="inst-logo"><img src="'+encodeHTMLAttribute(Object.keys(portal.logo_url).map(function(key){return portal.logo_url[key]})[0])+'" alt="" class="esmlogo-img"></div><div class="inst-content">'; //NO I18N
        }else{
          portHTML += '<div class="col-xs-4 instance-list"><div class="widget-panel cur-ptr" '+idAttr+'><div class="disp-c logo-img"><img src="'+encodeHTMLAttribute(Object.keys(portal.logo_url).map(function(key){return portal.logo_url[key]})[0])+'" alt="" class="esmlogo-img"></div><div class="disp-c pl15 pr10 pos-rel">'; //NO I18N
        }
	   }
	  	// For ESM portal page and CM editor page
        else
        {
          if(data.newUI){
            portHTML += '<div class="instance-panel widget-panel" '+idAttr+'><div class="inst-logo"><img src="'+encodeHTMLAttribute(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="inst-content">'; //NO I18N
          }else{
            portHTML += '<div class="col-xs-4 instance-list"><div class="widget-panel cur-ptr" '+idAttr+'><div class="disp-c logo-img"><img src="'+encodeHTMLAttribute(portal.logo_url)+'" alt="" class="esmlogo-img"></div><div class="disp-c pl15 pr10 pos-rel">'; //NO I18N
          }
        }
          if((portalLandingConfig.type == 'org_default_portal' || (portalLandingConfig.type == 'esm_portal' && portalLandingConfig.is_allowed_preferred_portal_for_users)) && portal.type !== "Custom"){
            if(portals.length > 1){
              if(portal.is_default){
                portHTML += '<span id="defaultHomeBtn" class="cspr icon-sm home1 right0 top4 pos-abs" title="'+translate("sdp.default.instance")+'" rel="uitip"/></span>'; //NO I18N
              }else{
                portHTML += '<span id="defaultHomeBtn" class="cspr icon-sm home2 right0 top4 pos-abs" title="'+translate("sdp.set.as.default.instance")+'" rel="uitip"/></span>'; //NO I18N
              }
            }
          }
          if(data.newUI){
            portHTML += '<span class="inst-title"><span class="" title="'+e_html(portal.name)+'" rel="uitip">'+e_html(portal.name)+'</span></span><p class="inst-description" title="'+(encodeHTMLAttribute(portal.description) || "")+'" ><span>'+(e_html(portal.description) || "")+'</span></p></div></div>'; //NO I18N
          }else{
            portHTML += '<span class="truncate-ellipsis h4"><span class="truncate-wrapper" title="'+e_html(portal.name)+'" rel="uitip">'+e_html(portal.name)+'</span></span><p class="truncate-ellipsis mt10" title="'+(encodeHTMLAttribute(portal.description) || "")+'" ><span class="truncate-wrapper">'+(e_html(portal.description) || "")+'</span></p></div></div></div>'; //NO I18N
          }
          if(i === portals.length-1){
            if(data.newUI){
              portList ='<div class="instance-layout">' + portHTML + '</div>'; //NO I18N
            }else{
              portList =  '<div class="portal-widget"><div class="row justify-content-around">' + portHTML + '</div></div>'; //NO I18N
            }
            portHTML = ""; //NO I18N
          }
  }
  return portList;
});


/* ESM Helpers End*/

/**
 * ESM Portal Across Search Starts
 */

var across_search = {
  initAcrossSearch: function () {
    this.loadEvents();
    if (acrossSearchOption.searchText != "null") {
      this.loadSearchResult(acrossSearchOption.searchText,acrossSearchOption.selModuels,acrossSearchOption.selPortal);
    }
  },
  loadEvents: function () {
    var _self = this;
    jQuery("#gs_portal_search").off().on("keydown.ac_gs_search_input", function (e) {
      var s_txt = encodeURIComponent(jQuery(this).val());
      if (e.keyCode == 13 && s_txt.trim() != "" && !jQuery(this).attr("data-triggered")) {
        _self.loadSearchResult(s_txt);
        // window.history.replaceState("globalsearch", {}, "/ESM.do?type=portal&searchText=" + jQuery(this).val()); //NO I18N
        jQuery(this).attr("data-triggered", true);
      }
    });
  },
  loadSearchResult: function (s_txt,s_mods,s_portal) {
    var inputTrigger = s_mods ? true : false;
    var mods = s_mods && s_mods != "null" ? s_mods : acrossSearchOption.accessableModules; //NO I18N
    var portal = s_portal && s_portal != "null" ? s_portal : ""; //NO I18N
    var searchOptions = {
      modules: acrossSearchOption.accessableModules, //NO I18N
      search_text: s_txt,
      selector: "across_search", //NO I18N
      list_info: { row_count: 5 },
      isPortal: true,
      isPopupRender: true,
      activeModule: mods,
      /* handling the onclose callback*/
      onCloseCallback: this.callbackOncloseSearch,
      /*prevent popupanimation when query params with popup rendering */
      isInputTriggered: inputTrigger
    }
    if (portal != "") {
      searchOptions.selectedPortal = portal;
    }
    $gsWebComponent.initSearchComponent(searchOptions);
  },
  callbackOncloseSearch: function () {
    jQuery("#gs_portal_search").val(jQuery("#globalsearch_input_gs").val())
    window.history.replaceState({}, "globalsearch", "/ESM.do?type=portal"); //NO I18N
    jQuery("#gs_portal_search").removeAttr("data-triggered");
  },
  searchBoxHtml:function(){
    var html = '<div class="pos-rel p0">'+
    '<div class="search-box pt10">'+
      '<span class="cspr search icon-sm opac5 mt2"></span>'+
      '<input id="gs_portal_search" type="text" placeholder="'+getMessageForKey("global.search.acrossplaceholder")+'" class="form-control mt20 pl30 portal-search" />'+
    '</div>'+
  '</div>';
    return html;
  }
}


 /** ESM Portal Across Search Ends */

