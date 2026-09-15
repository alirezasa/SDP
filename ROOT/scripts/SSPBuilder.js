/* $Id$ */
//String.prototype.trim was overriden in TableHandling.js, Utils.js and newUtils.js which slows down loading the builder
String.prototype.trim = String.prototype.nativeTrim;

var isAssetEnabled = sdp_app.IS_ASSET_MODULE;
var isBuilderEnabled = true;
var fromHome = getSDPURLParams().from ? getSDPURLParams().from === "home" : false; //No I18N
var portalBuilder = {
  pageId: null,
  creatorDD: {},
  id: null,
  saveAsPageName: null,
  setHomePage: false,
  saveAndSetAsHomePage: false,
  newBuilder: false,
  jQueryGetDirection: null,
  customWidgetCallback: null,
  toUpdateWidget: null,
  customWidgets: null,
  currentPage: null,
  deletedSnippets: [],
  addedSnippets: [],
  panelTextTranslationKeys: {},
  usedImages:["changepassword.svg","dashboard-container-bg.jpg","rectangle.svg","Reportissue.svg","req-issue-card-ico.svg","req-new-card-ico.svg","req-solutions-card-ico.svg","requestservice.svg","request-widget-bg.svg","service-widget-bg.svg","solutions-widget-bg.svg","sspfacilitie-default-bg.jpg","ssp-facility-classic.jpg","ssp-facility-dark.jpg","ssp-facilitydesk.jpg","ssp-hr2-bg.png","ssp-hr-classic.jpg","ssp-hr-dark.jpg","ssphr-default-bg.jpg","ssp-hrtemp-Img1.png","ssp-hrtemp-Img2.png","ssp-hrtemp-Img3.png","ssp-hrtemp-Img4.png","ssp-hrtemp-Img5.png","ssp-incident-ico.svg","ssp-it-classic.jpg","ssp-it-dark.jpg","sspitdesk-default-bg.jpg","ssp-medtemp-bg.png","ssp-service-ico.svg","ssp-solutions-ico.svg","transparent-circle.svg","transperant_black.png","asset-booking-1.svg","asset-booking-2.svg","asset-booking-3.svg","asset-booking-4.svg","asset-booking-5.svg"], //NO I18N
  translationDeleteTriggered: false,

  creatorConfig: {
    nonce: sdpNonce,
    csspath: "/page/css", //NO I18N
    imagepath: "/page/images", //NO I18N
    jspath: "/page/js", //NO I18N
    jsppath: "/page/jsp", //NO I18N
    pageName: translate("zcpage.builder.newpage"),
    service: "sdpop", //NO I18N
    target: "#contentHolder", //NO I18N
    resizeBuilder: true,
    isTranslationRequired: true,
    supportedLanguagesList: [],
    saveTranslation: function (id, key, isresave) {
      // On trying to configure more than 5 languages, throws error & remove extra configuration
      if (id.length > 5 && portalBuilder.translationDeleteTriggered == false) {
        portalBuilder.translationDeleteTriggered = true;
        jQuery("span.zc-pb-paramcontainer-del").last().find(".zc-pb-qpdelete").click();
        showalert('failure', translate("api.max.limit.exceeded", ["5"]), 'isAutoHide=false,delay=3,width=auto'); // No I18N
        return;
      }

      if (id.length) {
        portalBuilder.panelTextTranslationKeys[key] = id;
      } else if (isresave) {
        portalBuilder.panelTextTranslationKeys[key] = undefined;
      }

      portalBuilder.translationDeleteTriggered = false;
    },
    getTranslation: function (key) {
      return portalBuilder.panelTextTranslationKeys[key] || [];
    },
    serviceObject: {
      pageId: this.pageId,
      pageName: translate("zcpage.builder.newpage"),
      thumbnailimage: undefined
    },
    widgetsArray: [
      {
        name: translate("sdp.home.approval.allmypendingapprovals"),
        uniqueId: "1096278446001", //NO I18N
        desc: translate("home.zc.approval.desc"),
        customHeight: "410px" // No I18N
      },
      {
        name: translate("sdp.home.global.mysummary"),
        uniqueId: "1096278446002", //NO I18N
        desc: translate("home.zc.reqSummary.desc"),
        customDeleteMessage: translate("api.approval.clarification.info.sspcustom.widgetremove"), // No I18N
        //previewURL: "/custom/widgets/SSP/search_widget/ssp-spearmint.png" //NO I18N
        customHeight: "410px" // No I18N
      },
      {
        name: translate("sdp.home.popularsolutions"),
        uniqueId: "1096278446003", //NO I18N
        desc: translate("home.zc.popularSol.desc"), //NO I18N
        //previewURL: "/custom/widgets/SSP/widgetsPreview/popular_solutions.png" //NO I18N
        customHeight: "620px" // No I18N
      },
      {
        name: translate("common.myassets"),
        uniqueId: "1096278446004", //NO I18N
        desc: translate("home.zc.assets.desc"),
        visibility: isAssetEnabled == true, // hide widget if there is no permission
        //previewURL: "/custom/widgets/SSP/widgetsPreview/my_assets.png" //NO I18N
        customHeight: "410px" // No I18N
      },
      {
        name: translate("sdp.home.announcement.label"),
        uniqueId: "1096278446005", //NO I18N
        desc: translate("home.zc.announcement.desc"),
        //previewURL: "/custom/widgets/SSP/widgetsPreview/announcements.png" //NO I18N
        customHeight: "410px" // No I18N
      },
      {
        name: translate("sdp.home.ssp.widget.portalusage.label"),
        uniqueId: "1096278446006",
        desc: translate("home.zc.portalusage.desc"),
        customHeight: "830px" // No I18N
      },
      {
        name: translate("common.tech.issuecatalog"),
        uniqueId: "1096278446007",
        desc: translate("home.zc.catalog.desc"),
        customHeight: "830px" // No I18N
      },
      {
        name: translate("common.servicecatalog"),
        uniqueId: "1096278446008",
        desc: translate("home.zc.catalog.desc"),
        visibility: sdp_app.IS_SERVICECATALOG_ENABLED == true, // hide widget if there is no permission
        customHeight: "830px" // No I18N
      },
      {
        name: translate("common.req.requestcatalog"),
        uniqueId: "1096278446009",
        desc: translate("home.zc.catalog.desc"),
        visibility: sdp_app.IS_SERVICECATALOG_ENABLED == true, // hide widget if there is no permission
        customHeight: "830px" // No I18N
      }
    ],

    widgetPreviews: {
      "1096278446001": "/custom/widgets/staticHtml/approvals.html", //NO I18N
      "1096278446002": "/custom/widgets/staticHtml/summary.html", //NO I18N
      "1096278446003": "/custom/widgets/staticHtml/solutions.html", //NO I18N
      "1096278446004": isAssetEnabled ? "/custom/widgets/staticHtml/assets.html" : "", //NO I18N
      "1096278446005": "/custom/widgets/staticHtml/announcements.html", //NO I18N
      "1096278446006": "/home/widgets/PortalUsageForRequester.jsp", //NO I18N
      "1096278446007": "/home/widgets/IncidentCatalogForRequester.jsp?widgetName=" + translate("common.tech.issuecatalog") + "&widgetID=107", //NO I18N
      "1096278446008": sdp_app.IS_SERVICECATALOG_ENABLED ? "/home/widgets/ServiceCatalogForRequester.jsp?widgetName=" + translate("common.servicecatalog") + "&widgetID=108" : "", //NO I18N
      "1096278446009": sdp_app.IS_SERVICECATALOG_ENABLED ? "/home/widgets/RequestCatalogForRequester.jsp?widgetName=" + translate("common.req.requestcatalog") + "&widgetID=109" : "", //NO I18N
      "custom": "/servlet/SDAjaxServlet?action=getWidgetContent&id=" //NO I18N
    },

    getServiceConfig: function (requestHeader, requestParams) {
      switch (requestHeader) {
        case "action": //No I18N
          var actions = [       //None & OpenURL are provided by default
            {
              "Id": "report_issue", //No I18N
              "DisplayName": translate("search_widget.help5"), //No I18N
              "DescText": translate("searchwidget.help.issue"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-report-issue" //No I18N
            },
            {
              "Id": "create_request", //No I18N
              "DisplayName": translate("search_widget.help6"), //No I18N
              "DescText": translate("searchwidget.help.service"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config acc-create-req" //No I18N
            },
            {
              "Id": "openPendingReq", //No I18N
              "DisplayName": translate("sdp.home.summary.openRequestsTitle"), //No I18N
              "DescText": translate("requests.desc.pending"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-pending-req" //No I18N
            },
            {
              "Id": "openOnHoldReq", //No I18N
              "DisplayName": translate("sdp.requests.viewrequest.requester.allonholdrequests"), //No I18N
              "DescText": translate("requests.desc.onhold"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-hold-req" //No I18N
            },
            {
              "Id": "openCompleteReq", //No I18N
              "DisplayName": translate("sdp.home.summary.closedRequestsTitle"), //No I18N
              "DescText": translate("requests.desc.completed"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-completed-req" //No I18N
            },
            {
              "Id": "openAwaitingReq", //No I18N
              "DisplayName": translate("sdp.requests.viewrequest.mypendingawaitingforapproval"), //No I18N
              "DescText": translate("requests.desc.awaiting"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-awaiting-req" //No I18N
            },
            {
              "Id": "openAwaitingUpdate", //No I18N
              "DisplayName": translate("sdp.requests.viewrequest.waitingupdate"), //No I18N
              "DescText": translate("requests.desc.awaiting.update"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-awaiting-req" //No I18N
            },
            {
              "Id": "goto_solutions", //No I18N
              "DisplayName": translate("search_widget.help7"), //No I18N
              "DescText": translate("searchwidget.help.solution"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-goto-sol" //No I18N
            }];
      if(!sdp_app.IS_SCP){
        actions.push({
              "Id": "add_booking", //No I18N
              "DisplayName": translate("sdp.common.book.assets"), //No I18N
              "DescText": translate("searchwidget.assetbooking"), //No I18N
              "Icon": "zc-pb zc-pb-btn-config act-goto-sol" //No I18N
            });
      }
          return new Promise((resolve) => { 
            resolve(actions);
          }); 
          break;
      
        default:
          break;
      }
    },

    pageElements: ["Panel", "Button", "Snippets", "Widgets"], //No I18N
    panelElements: ["Text", "Image", "Button", "Search"], //No I18N
    snippetElements: ["HTML", "Embed"], //No I18N
    pageSettings: {"pagebgcolor": true}, //No I18N

    createWidget: function (callback) {
      if (portalBuilder.isLicenseExpired) {
        showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
        return;
      }

      portalBuilder.customWidgetDialog(callback, null);
    },

    editWidget: function (arg, callback) {
      if (portalBuilder.isLicenseExpired) {
        showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
        return;
      }

      portalBuilder.customWidgetDialog(callback, arg);
    },

    // Fetches the contentc of the widgets
    getWidgetTemplate: function (widgetId) {
      return new Promise((resolve, reject) => {
        if (widgetId in portalBuilder.creatorConfig.widgetPreviews) {
          if (this.widgetPreviews[widgetId] == "") {
            jQuery(".column-container").find("span[widgetsid=" + widgetId + "]").siblings().text(translate("zcpage.widget.unavailable")); // No I18N
          } else {
            jQuery.get(this.widgetPreviews[widgetId], function (data) {
              resolve(data);
            });
          }
        } else {
          let widgetTitle = portalBuilder.customWidgets[widgetId].title || translate("sdp.home.ssp.customization.common.untitledwidget");
          var header = `<div class="widget-bg"><div class="widget-header"><h4 class="pos-rel font-normal" style="width: 351px;">` + e_html(widgetTitle) + `</h4><div class="widget-menu" style=""></div></div>`; // No I18N
          var htmlsrc = `
          <IFRAME frameborder="0" style="width: 100%; height: 100%; border: margin: 0px;" scrolling="yes" src="` + this.widgetPreviews["custom"] + parseInt(widgetId) + `"></IFRAME></div>`; // No I18N
          resolve(header + htmlsrc);
        }
      });
    },

    getHtmlEditorContent: function (config) {
      return new Promise((resolve, reject) => {
        jQuery.get("/servlet/SDAjaxServlet?action=getWidgetContent&id=" + parseInt(config.htmlbuilderId)).done(function (response) {
          resolve(response);
        });
      });
    },

    saveHtmlEditorContent: function (content, config) {
      return new Promise((resolve, reject) => {
        content = content.trim();
        if (!content) {
          return resolve({ status: "failure", message: translate('sdp.app.common.nocontent') }); //No I18N
        }
        var widgetId = -1;
        var url = "/SSCustomizeView.do?action=saveHTMlWidgetContent"; //No I18N
        if (config) {
          url = url + "&id=" + parseInt(config.htmlbuilderId); //No I18N
        }

        if (portalBuilder.isLicenseExpired) {
          return resolve({ status: "failure", message: translate('mdh.restricted.portals.cud.msg') }); //No I18N
        }

        sdpAjax({
          url: url,
          data: { html_content: content },
          type: "post", //No I18N
          success: function (response) {
            resolve({
              status: "success", //No I18N
              message: translate("sdp.admin.backup.settings.save.success.msg"), //No I18N
              config: {
                htmlbuilderId: response.widgetId,
                viewLinkName: "" //No I18N
              }
            });
            portalBuilder.addedSnippets[portalBuilder.addedSnippets.length] = response.widgetId;
          }
        });
      });
    },

    deleteHtmlSnippet: function (config) {
      portalBuilder.deletedSnippets[portalBuilder.deletedSnippets.length] = config.htmlbuilderId;
    },

    // Deletes default widget from builder
    deleteWidget: function (widgetId) {
      return new Promise((resolve, reject) => {
        if (portalBuilder.isLicenseExpired) {
          return resolve({
            status: "failure", //No I18N
            message: translate('mdh.restricted.portals.cud.msg'), //No I18N
            isReferenced: false,
          });
        }

        sdpAjax({
          url: "/SSCustomizeView.do", //No I18N
          data: { action: "removeHTMlWidgetContent", id: widgetId, verifyIsUsed: true }, //No I18N
          type: "post" //No I18N
        }).done(function (response) {
          if (response.isDeleted) {
            resolve({
              status: "success", //No I18N
              message: translate('sdp.admin.common.deletedsuccessfully'), //No I18N
              isReferenced: false,
            });
          } else {
            resolve({
              status: "failure", //No I18N
              message: translate('zc.settings.builder.widgets.used'), //No I18N
              isReferenced: true,
            });
          }
        })});
    },

    // Builder page save function
    saveFunction: function (structure, conf) {
      if (portalBuilder.isCreateNew && portalBuilder.pageNotNamed) {
        portalBuilder.saveAsPopup();
        return;
      }
      // Remove translation key for deleted elements, if any.
      var elemIds = [];
      jQuery(structure).find("[id]").each(function () { elemIds.push(this.id); });
      var transKeys = Object.keys(portalBuilder.panelTextTranslationKeys);
      for (let i = 0; i < transKeys.length; i++) {
        var key = transKeys[i];
        if (!elemIds.includes(key)) {
          delete portalBuilder.panelTextTranslationKeys[key];
        }
      }

      var callbackfn = function (previewFile, previewId) {
        conf.structure = structure;
        var pageId = portalBuilder.saveAsPageName ? null : portalBuilder.pageId;
        var name = portalBuilder.saveAsPageName ? portalBuilder.saveAsPageName : portalBuilder.creatorConfig.pageName;
        var url = pageId ? "/api/v3/creator_dashboard/" + parseInt(pageId) : "/api/v3/creator_dashboard";   //No I18N
        var type = pageId ? "PUT" : "POST"; //No I18N

        var input_data = sdpAjaxInputData({ creator_dashboard: { name: name, structure: structure, preview_file: null, is_selected: portalBuilder.setHomePage, helpdesk_id: sdp_app.PORTAL_ID, preview_icon: { id: previewId }, translation_keys: portalBuilder.panelTextTranslationKeys } });
        return sdpAjax({
          url: url,
          type: type,
          data: input_data,
          success: function (data) {
            portalBuilder.pageId = data.creator_dashboard.id;
            BuilderConstants.isSaved = true;

            if (pageId == null) {
              //Updating the URL, when a New page is Saved or Save as operation
              history.pushState({}, null, "/ui/ssp/" + parseInt(data.creator_dashboard.id) + (fromHome ? "?from=home" : ""));

              //Updating the page name after Save As operation
              if (portalBuilder.saveAsPageName) {
                portalBuilder.creatorConfig.pageName = portalBuilder.saveAsPageName;
                portalBuilder.saveAsPageName = null;
              }
              portalBuilder.isCreateNew = false;
              jQuery("#editheadertitle h4").text(portalBuilder.creatorConfig.pageName);
            }

            if (portalBuilder.setHomePage) {
              if(!portalBuilder.setHomePagePrevState) {
                //When a non selected page is saved and selected
                jQuery("#editheadertitle").find("[data-name='savePage']").text(translate("mdh.custom.saveandpub")); // No I18N
                jQuery("#editheadertitle").find("[data-name=saveAndSetHomepage]").closest("li").addClass("hide"); // No I18N
              }
            } else {
              jQuery("#editheadertitle").find("[data-name='savePage']").text(translate("common.save")); // No I18N
              jQuery("#editheadertitle").find("[data-name=saveAndSetHomepage]").closest("li").removeClass("hide"); // No I18N
            }

            jQuery('#alertbox').empty();
            showalert("success", translate("sdp.admin.dcconfig.settings.saved"), "isAutoHide=true"); //No I18N
            portalBuilder.addedSnippets = [];
            if (portalBuilder.deletedSnippets && portalBuilder.deletedSnippets.length) {
              portalBuilder.removeHtmlSnippets(portalBuilder.deletedSnippets);
            }
            portalBuilder.saveAndSetAsHomePage = false;
          },
          error: function (resp) {
            if (JSON.parse(resp.responseText).response_status.messages[0].status_code === '4018') { // No I18N
              showalert("failure", getMessageForKey("zcpage.template.limit.exceeded"), "isAutoHide=false,delay=3,width=auto"); // No I18N
            } else {
              showalert("failure", e_html(JSON.parse(resp.responseText).response_status.messages[0].message), "isAutoHide=false,delay=3,width=auto"); // No I18N
            }

            if (portalBuilder.isCreateNew) {
              portalBuilder.pageNotNamed = true;
            }

            if (portalBuilder.saveAsPageName) {
              portalBuilder.saveAsPageName = null;
            }
            portalBuilder.saveAndSetAsHomePage = false;
          }
        });
      }
      showalert("info", translate("sdp.admin.backup.settings.save.progress.msg"), "ajaxCall=true"); //No I18N
      portalBuilder.takeScreenShot(callbackfn);
      // callbackfn("defaultImage.png"); //No i18N
    },

    getImagesList: function getImageList() {
      var userImages = [];
      return new Promise((resolve, reject) => sdpAjax({
        url: "/servlet/SDAjaxServlet", //No i18N
        data: "action=GetSSPImagesList", //No i18N
        success: function (data) {
          if (data && data.ssp_images.length) {
            var i = 0;
            data.ssp_images.each(function (fileName) {
              filePath = "/custom/widgets/SSP/images/" + encodeURIComponent(fileName); // No I18N
              var toadd = { fileId: "user_" + i, filePath: fileName, imageUrl: filePath, default:  ((portalBuilder.usedImages.indexOf(fileName) > -1) ? true : false)}; // No I18N
              userImages.unshift(toadd);
              i++;
            });
          }
          portalBuilder.creatorDD.userImages = userImages;
          return resolve(JSON.stringify(userImages));
        }
      }));
    },

    uploadImageFunc: function (frame, callbackfn) {
      var filesList = frame.files;
      var keys = Object.keys(filesList);
      for (i = 0; i < keys.length; i++) {
        var file = filesList[keys[i]];
        var filename = new Date().getTime();
        var ext = ("." + file.name.split('.').pop()).toLowerCase();
        // After uploading image via media api, the uploaded image in moved to custom directory for panel images.
        portalBuilder.uploadFile("images", file, function (fileName, fileId) { //No I18N
          var file_for_pages = { fileId: filename + ext, fileName: filename + ext, imageUrl: "/custom/widgets/SSP/images/" + filename + ext, default: false }; //No I18N
          portalBuilder.creatorDD.userImages.push(file_for_pages);
          callbackfn.call(this, file_for_pages);
        }, filename);
      }
    },

    deleteImageFunc: function (imageData, callbackfn) {
      sdpAjax({
        url: "/servlet/SDAjaxServlet", //No i18N
        type: "post", //No I18N
        data: "action=RemoveSSPImage&imageName=" + encodeURIComponent(imageData.imageFileName), //No i18N
        success: function (data) {
          if (data.success) {
            callbackfn.call(this, imageData);
          } else if (data.failure) {
            showalert("failure", e_html(data.failure.message), "isAutoHide=false,delay=3,width=auto"); // No I18N
          }
        }
      });
    },

    // Function to load scripts after the builder is closed, (scripts required for page grid)
    afterBuilderClose: function () {
      if (portalBuilder.addedSnippets && portalBuilder.addedSnippets.length) {
        portalBuilder.removeHtmlSnippets(portalBuilder.addedSnippets);
      }
      ResourceLoader({
        js: ["/scripts/jquery.min.js"], // No I18N
        success: function () {
          jQuery.extend(portalBuilder.jqueyBackup);
        }
      });
      var spaObj = { id: "pages-grid", tabName: "portalBuilder", url: fromHome ? "/ui/ssp/pages?from=home" : "/ui/ssp/pages" }; //NO I18N
      $spa.doAjax(spaObj);
    },

    // i18n key support for creator builder keys
    i18nFunc: function (key) {
      var value = translate(i18nKeyMap[key] ? i18nKeyMap[key] : key);
      if (value == key) {
        return undefined;
      }
      return value;
    },
  },

  pagesTemplates: [
    { page_name: "IT 1", page_id: "ssp-itdesk", img: "1" },  //No i18N
    { page_name: "IT 2", page_id: "ssp-itdesk-classic", img: "2" }, //No i18N
    { page_name: "IT 3", page_id: "ssp-itdesk-whitetheme", img: "3" },  //No i18N
    { page_name: "IT 4", page_id: "ssp-itdesk-dark", img: "4" }, //No i18N
    { page_name: "Facility 1", page_id: "ssp-facilitydesk", img: "5" },  //No i18N
    { page_name: "Facility 2", page_id: "ssp-facilitydesk-dark", img: "6" },  //No i18N
    { page_name: "Facility 3", page_id: "ssp-facilitydesk-classic", img: "7" },  //No i18N
    { page_name: "HR 1", page_id: "ssp-hr1", img: "8" },  //No i18N
    { page_name: "HR 2", page_id: "ssp-hr2", img: "9" },  //No i18N
    { page_name: "HR 3", page_id: "ssp-hr3", img: "10" }, //No i18N
    { page_name: "HR 4", page_id: "ssp-hr4", img: "11" },  //No i18N
    { page_name: "HR 5", page_id: "ssp-hr5", img: "12" }  //No i18N
  ],

  // Throws alert on saving empty pages
  saveBuilderWrapper: function () {
    if (portalBuilder.isLicenseExpired) {
      showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
      return;
    }

    if (!document.querySelector('#zppages .zpelement-wrapper')) {
      showalert("failure", translate("zcpage.builder.empty.warning"), "isAutoHide=false"); // No I18N
      return;
    }

    $PBDashboard.save();
  },

  removeHtmlSnippets: function (snippets) {
    for (var i = 0; i < snippets.length; i++) {
      var htmlId = snippets[i];
      var url = "/SSCustomizeView.do?action=removeHTMlWidgetContent&verifyIsUsed=true&id=" + parseInt(htmlId); //No I18N
      sdpAjax({
        url: url,
        type: "post" //No I18N
      }).done(function (response) { });
    }

    portalBuilder.deletedSnippets = [];
  },

  // Function to open the selected page in editmode in builder
  buildPortal: function () {
    portalBuilder.jqueyBackup = jQuery;

    if (portalBuilder.newBuilder) {
      ZohoPages.show(portalBuilder.creatorConfig, portalBuilder.builderInitialized); //New Page
      portalBuilder.newBuilder = false;
      portalBuilder.isCreateNew = true;
      portalBuilder.pageNotNamed = true;
    }
    else if (portalBuilder.id) {
      portalBuilder.isCreateNew = false;
      portalBuilder.pageNotNamed = false;
      sdpAjax({
        url: "/api/v3/creator_dashboard/" + parseInt(portalBuilder.id), //NO I18N
        success: function (data) {
          portalBuilder.creatorConfig.pageContent = data.creator_dashboard.structure;
          portalBuilder.creatorConfig.pageName = data.creator_dashboard.name;
          portalBuilder.pageId = data.creator_dashboard.id;
          portalBuilder.setHomePagePrevState = portalBuilder.setHomePage = data.creator_dashboard.is_selected;
          portalBuilder.panelTextTranslationKeys = JSON.parse(data.creator_dashboard.translation_keys) || {};
          portalBuilder.creatorConfig.serviceObject = {
            pageId: portalBuilder.pageId,
            pageName: portalBuilder.creatorConfig.pageName
          }
          ZohoPages.show(portalBuilder.creatorConfig, portalBuilder.builderInitialized); //Edit Existing page
        }
      });
    }
  },

  getFonts: function () {
    var fonts = sdp_app.FONTS;
    var list = [];

    for (var key in fonts) {
      if (fonts[key] && fonts.hasOwnProperty(key)) {
        fonts[key].style = fonts[key].style.replaceAll("'", "\""); //NO I18N
        list.push({ Id: fonts[key].style, DisplayName: fonts[key].name });
      }
    }

    list = list.sort(function(a,b) {
      var x = a.DisplayName.toLowerCase();
      var y = b.DisplayName.toLowerCase();
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });

    list.unshift({Id: "default", DisplayName: "Default font"}); // No I18N

    return list;
  },

  // Builder handle for portalbuilder jsp file
  beginBuilder: function (page) {
    portalBuilder.id = page ? page : null;
    portalBuilder.getSelectedPageDetails();
    portalBuilder.initializeWidgets();
  },

  // Function to initialize, render header for the builder after load
  builderInitialized: function () {
    //Updating Panel Tile Json
    var keys = Object.keys(PanelTileJson);
    var keysCount = keys.length;
    for (var i = 0; i < keysCount; i++) {
      PanelTileJson[keys[i]].Header = "Add a header"; //No I18N
      PanelTileJson[keys[i]].Footer = "Add a footer"; //No I18N
      PanelTileJson[keys[i]].Text = "Click to Add Text"; //No I18N
    };

    //Updating Button Tile Json
    keys = Object.keys(ButtonTileJson);
    keysCount = keys.length;
    for (var j = 0; j < keysCount; j++) {
      ButtonTileJson[keys[j]].title = "Add a Label"; //No I18N
      ButtonTileJson[keys[j]].buttonText = "Click to Add Text"; //No I18N
    };

    portalBuilder.loadWidgetsContent(ZohoPages.afterServiceTemplateCall);
    portalBuilder.deletedSnippets = [];

    //Replacing creator header with new header
    var headerElem = jQuery(".appbuilder-popup-header-container");
    var newHeader = jQuery("#editheadertitle");
    if (portalBuilder.setHomePage) {
      if(isBuilderEnabled) {
        newHeader.find("[data-name='savePage']").text(translate("mdh.custom.saveandpub")); // No I18N
      }
      newHeader.find("[data-name=saveAndSetHomepage]").closest("li").addClass("hide"); // No I18N
    }
    headerElem.replaceWith(newHeader);
    newHeader.find("h4").text(portalBuilder.creatorConfig.pageName);
    newHeader.removeClass("hide"); // No I18N

    //Restore jQueryGetDirection function
    jQuery.fn.getDirection = portalBuilder.jqueyBackup.fn.getDirection;

    //Fixing static HTML style issues
    jQuery("#contentHolder").addClass("selfservice-portal");

    // add RTL classes for page-prop slider
    jQuery("[hcelemname=page-properties-popup]").addClass("pageprop-slide"); //No I18N

    // add box sizing to fix icon overlap issues
    jQuery("#zc-dem-container").addClass("innerborderbox"); //No I18N

    jQuery('#selectPageTemplate').off().on("click", function(event) { parent.portalBuilder.openSlideContent() }); // No I18N
    jQuery('#pageProperties').off().on("click", function(event) { pageSetting.showPageSetting(); }); // No I18N
    jQuery('#savePage').off().on("click", function(event) { parent.portalBuilder.saveBuilderWrapper() }); // No I18N
    jQuery('#saveAsNewPage').off().on("click", function(event) { parent.portalBuilder.saveAsPopup() }); // No I18N
    jQuery('#saveAndSetHomepage').off().on("click", function(event) { parent.portalBuilder.saveAndSetHomepage(); }); // No I18N
    jQuery('#closeBuilder').off().on("click", function(event) { $PBDashboard.closeBuilder(); }); // No I18N
    jQuery('#saveNewPage').off().on("click", function(event) { portalBuilder.saveAsSave() }); // No I18N
    jQuery('#cancelSave').off().on("click", function(event) { jQuery('#saveAsHTML').dialog('close') }); // No I18N
    jQuery('#freezSlidecontent').off().on("click", function(event) { parent.portalBuilder.closeSlideContent() }); // No I18N
    jQuery('#closeSelectTemplate').off().on("click", function (event) { parent.portalBuilder.closeSlideContent() }); // No I18N
  },

  // This function loads the contents of the widgets in the page
  loadWidgetsContent: function (callback) {
    // Empty temporary reserve for page templates if exists
    jQuery("#hbs-file-target").html(""); //No I18N
    var widgets = jQuery(".zpelement-wrapper.widgets[eltype='widgets']");
    var numWidgets = widgets.length;
    widgets.each(function (widget) {
      var widgetId = e_attr(jQuery(this).find("[widgetsId]").attr('widgetsId'));
      var _this = this;
      portalBuilder.creatorConfig.getWidgetTemplate(widgetId).then(function (elementTemplate) {
        jQuery(_this).find('.zc-pb-tile-card.zc-pb-reportelem-placeholder').html(elementTemplate);
        numWidgets--;
        if (numWidgets == 0) {
          callback();
        }
      });
    });
  },

  // Pop up for creating custom widget
  customWidgetDialog: function (callback, widId) {
    portalBuilder.customWidgetCallback = callback;
    portalBuilder.toUpdateWidget = widId;

    var boxHeading = widId ? translate("sdp.dashboard.common.editwidget") : translate("zc.page.builder.widgets.create");

    var dialogBox = "/home/CustomWidgetDialog.jsp"; //No I18N

    if (widId) {
      var widTitle = portalBuilder.customWidgets[widId].title;
      widTitle = (widTitle == translate("sdp.home.ssp.customization.common.untitledwidget")) ? "" : widTitle;
      var widfile = portalBuilder.customWidgets[widId].url;
      widfile = widfile.split("/").pop(); //No I18N
      dialogBox = dialogBox + "?title=" + encodeURIComponent(widTitle) + "&file=" + encodeURIComponent(widfile); //No I18N
    }

    jQuery("#newexternalWidgetsZC").closest(".ui-dialog").remove(); // No I18N
    //Using jquery ajax rather than sdpAjax - sdpAjax does not support response formats for jsp files.
    jQuery.ajax({
      url: dialogBox,
      type: 'GET',// No I18N
      async: false,
      success: function (data) {
        jQuery("#custom-widget-dialog").html(data);
        jQuery("#custom-widget-dialog > #newexternalWidgetsZC").dialog({
          modal: 'true',
          width: 600,
          top: 100,
          title: boxHeading,
          resizable: false,
          draggable: true,
          dialogClass: "sdp-dialog", // No I18N
          open: function () {
            jQuery("#newexternalWidgetsZC").parent(".sdp-dialog").css("z-index", "2000"); //No i18n
            jQuery('[data-name=sspattach]').on("change", function () { //No i18n
              var file = jQuery(this)[0].files[0];
              if (file) {
                jQuery(this).parent().find('.form-control').text(file.name).attr('title', file.name);
              }
            });
            jQuery('#SSPFormZC').off().on("keypress", function(event) { if (event.key === 'Enter') {event.preventDefault();} }); //No I18N
            jQuery('#addWidgetZC').off().on("click", function(event) { portalBuilder.widgetEntryZC(this.dataset.update === "true") }); //No I18N
            jQuery('#closeDialogZC').off().on("click", function(event) { jQuery('#newexternalWidgetsZC').dialog('close') }); //No I18N
          }
        });
      },
    });

    /* Remove background freeze */
    jQuery('.zcFreezeEditLayer').css('display', 'none'); //No I18N
  },

  takeScreenShot: function (callbackfn) {
    var contentDiv = document.querySelector("#zcpage-builder-editorarea"); //No I18N
    var selectedElem = jQuery(contentDiv).find('[selectedelem=true]');
    selectedElem.addClass("noborder");
    var canvasProp = {
      width: 1026,
      height: 600,
      allowTaint: true,
      useCORS: true,
      scale: 1,
      letterRendering: true,
      onclone: (doc) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(); //To avoid screenshot collapse
          }, 500);
        });
      }
    };
    html2canvas(contentDiv, canvasProp).then(function (canvas) {
      var blob = canvas.toBlob(function (blob) {
        var filename = new Date().getTime() + ".png"; //No I18N
        var file = new File([blob], filename, { type: "image/png" }); //No I18N
        portalBuilder.uploadFile("PreviewImages", file, function (fileName, fileId) { //No I18N
          callbackfn.call(this, fileName, fileId);
          selectedElem.removeClass("noborder");
        });
      }, "image/png");//No I18N
    });
  },

  uploadFile: function (view, file, callbackfn, panelimage) {
    var data = new FormData();

    data.append("input_image", file);  //No I18N
    if (panelimage) {
      data.append("panel_image_name", panelimage); //No i18N
    }
    sdpAjax({
      processData: false,
      contentType: false,
      type: "post", // No I18N
      url: "/api/v3/creator_dashboard/images", // No I18N
      data: data,
      success:function(response){
        if (response.response_status.status === "success") {
          callbackfn.call(this, file.name, response.image.id);
        } else {
          showalert('failure', response.response_status.messages[0].message, 'isAutoHide=true'); // No I18N
        }
      }
    });
  },

  // Function to upload HTML file for html widget
  uploadCallZC: function (data) {
    // var view = jQuery(".menu-tab.active").attr("data-view") // No I18N
    var module = jQuery("#SSPFormZC input[name=module]").val() // No I18N
    var result;
    sdpAjax({
      enctype: 'multipart/form-data',// No I18N
      url: "/api/v3/widgets/upload?for=dashboard", //No I18N
      type: 'POST',// No I18N
      data: data,
      processData: false,
      contentType: false,
      cache: false,
      async: false,
      timeout: 600000,
      success: function (data) {
        result = data;
      },
      error: function (data) {
        result = { errorResponse : data.responseJSON.response_status.messages[0].message };
      }
    });
    return result;
  },

  // Make entry in DB for html widget
  widgetEntryZC: function (toUpdate) {
    var titleElement = jQuery("#newexternalWidgetsZC .external-title-field"); // No I18N
    var widgetTitle = trim(titleElement.val());

    var isValid = true;
    if (widgetTitle.length > 100) {
      showalert("warning", translate("sdp.home.ssp.customization.msg.widgetnameinvalid"), "isAutoHide=true"); //No I18N
      isValid = false;
    }

    if (isValid) {
      var currFile = document.getElementById("AttachBtn").files[0];
      if (currFile) {
        if (currFile.size <= 10485760) {
          var form = jQuery('#SSPFormZC')[0];
          var data = new FormData(form);
          data = portalBuilder.uploadCallZC(data);
          var dummyWidgetID = data.attachment ? data.attachment.id : "";
          var errorResponse = data.errorResponse ? data.errorResponse : "";
          jQuery("#AttachBtn").val("");
          jQuery('.widgetaddfrm  .form-control').text("");
          if (errorResponse != "") {
            isValid = false;
            showalert("failure", e_html(errorResponse), "isAutoHide=false"); //No I18N
          }
          else if (dummyWidgetID == "" || dummyWidgetID == "ssp.widget.onAttachEmpty") {
            isValid = false;
            showalert("failure", translate("sdp.inventory.import.wsdata.provideFile"), "isAutoHide=false"); //No I18N
          }
        }
        else {
          isValid = false;
          showalert("failure", translate("ssp.widget.onAttachSizeExceed"), "isAutoHide=false"); //No I18N
        }
      }
      else if (toUpdate) {
        isValid = true;
      }
      else {
        isValid = false;
        showalert("failure", translate("sdp.inventory.import.wsdata.provideFile"), "isAutoHide=false"); //No I18N
      }
    }

    if (isValid) {
      var saveurl = "/SSCustomizeView.do?action=externalWidgetEntryZC" + (dummyWidgetID ? "&dummyId=" + encodeURIComponent(dummyWidgetID) : "") + "&title=" + widgetTitle; //No I18N
      if (toUpdate) {
        saveurl = saveurl + "&updateId=" + encodeURIComponent(portalBuilder.toUpdateWidget); //No I18N
        portalBuilder.toUpdateWidget = null;
      }

      sdpAjax({
        url: saveurl,
        type: "POST", //No I18N
        async: true,
        success: function (response) {
          response.widgetTitle = response.widgetTitle || titleElement.attr('data-onempty');;
          let widConf = { "uniqueId": response.widgetId, "name": response.widgetTitle, isDelete: true }; // No I18N

          if (portalBuilder.customWidgetCallback) {
            portalBuilder.customWidgets[response.widgetId] = { url: response.url, title: response.widgetTitle };

            if (toUpdate) {
              portalBuilder.creatorConfig.widgetsArray.find(w => w.uniqueId == response.widgetId).name = response.widgetTitle;
              portalBuilder.creatorConfig.widgetsList = JSON.parse(JSON.stringify(portalBuilder.creatorConfig.widgetsArray));
              portalBuilder.creatorConfig.getWidgetTemplate(response.widgetId).then(function (elementTemplate) {
                widConf.widgetId = response.widgetId;
                widConf.content = elementTemplate;
                portalBuilder.customWidgetCallback(widConf);
                portalBuilder.customWidgetCallback = null;
              });
            } else {
              portalBuilder.customWidgetCallback(widConf);
              portalBuilder.customWidgetCallback = null;

              BuilderConstants.widgetsArray.push({ name: response.widgetTitle, uniqueId: response.widgetId.toString(), desc: "", previewURL: "", defaultWidget: false, isDelete: true, customHeight: "830px" });
              BuilderConstants.widgetsList = BuilderConstants.widgetsArray;
              portalBuilder.creatorConfig.widgetsList = JSON.parse(JSON.stringify(portalBuilder.creatorConfig.widgetsArray));
            }
          }

          if (toUpdate) {
            var filepath = portalBuilder.customWidgets[response.widgetId].url;
            filepath = filepath.substr(0, filepath.lastIndexOf("/") + 1);
            portalBuilder.customWidgets[response.widgetId].url = filepath + response.url;
            portalBuilder.customWidgets[response.widgetId].title = response.widgetTitle;
          }
          showalert("success", translate("sdp.home.ssp.customization.msg.widgetaddsuccess"), "isAutoHide=true"); //No I18N
        }
      });

      titleElement.val(""); // No I18N
      jQuery("#closeDialogZC").trigger('click'); // No I18N
    }
  },

  saveAsPopup: function () {
    if (portalBuilder.isLicenseExpired) {
      showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
      return;
    }

    if (!document.querySelector('#zppages .zpelement-wrapper')) {
      showalert("failure", translate("zcpage.builder.empty.warning"), "isAutoHide=false"); // No I18N
      return;
    }

    jQuery("#saveAsHTML.ui-dialog-content").closest(".ui-dialog").remove(); // No I18N
    jQuery("#saveAsHTML").dialog({
      modal: 'true',
      width: 300,
      resizable: false,
      draggable: true,
      dialogClass: "sdp-dialog", // No I18N
      open: function () {
        jQuery("#saveaspage").val('').siblings("span[data-error]").addClass("hide"); // No I18N
      }
    });
    jQuery('#saveNewPage').off().on("click", function(event) { portalBuilder.saveAsSave() }); // No I18N
    jQuery('#cancelSave').off().on("click", function(event) { jQuery('#saveAsHTML').dialog('close') }); // No I18N
  },

  // save page from save as pop-up
  saveAsSave: function () {
    if (portalBuilder.isLicenseExpired) {
      showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
      return;
    }

    var jB = jQuery("body");
    var newName = jB.find("#saveaspage").val().trim();
    if (newName) {
      if (newName.length > 250) {
        showalert('failure', translate('sdp.api.security.exception.value.toolong'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
        return false;
      }
      jB.find("#saveaspage").siblings("span[data-error]").addClass("hide"); // No I18N
      jB.find("#saveAsHTML").dialog("close"); // No I18N
      if (portalBuilder.isCreateNew) {
        portalBuilder.creatorConfig.pageName = newName;
        portalBuilder.pageNotNamed = false;
      }
      else {
        portalBuilder.saveAsPageName = newName;
      }
      portalBuilder.setHomePage = portalBuilder.saveAndSetAsHomePage ? true : false;
      $PBDashboard.save();
    } else {
      jB.find("#saveaspage").siblings("span[data-error]").removeClass("hide"); // No I18N
      return false;
    }
  },

  saveAndSetHomepage: function () {
    if (portalBuilder.isLicenseExpired) {
      showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
      return;
    }

    if (!document.querySelector('#zppages .zpelement-wrapper')) {
      showalert("failure", translate("zcpage.builder.empty.warning"), "isAutoHide=false"); // No I18N
      return;
    }

    var callbackfn = function (proceed) {
      if (proceed) {
        portalBuilder.setHomePage = true;
        portalBuilder.saveAndSetAsHomePage = true;
        $PBDashboard.save();
      }
    }
    if (!isBuilderEnabled) {
      showconfirm(true, 'title=' + translate('home.zc.confirmSave') + ', message=' + translate('home.zc.newUISave.warning') + ', submitbutton=' + translate('common.save') + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', callbackfn); // No I18N
    }
    else {
      callbackfn(true);
    }
  },

  // Fn that constructs `select template` slide
  openSlideContent: function () {
    portalBuilder.needsOverwrite = Boolean(document.querySelector('#zppages .zpelement-wrapper')); // No I18N
    portalBuilder.currentPage = jQuery("#zcpage-builder-editorarea").children();
    portalBuilder.backupTranslationKeys = JSON.stringify(portalBuilder.panelTextTranslationKeys);
    if (!jQuery("#target-slider-list > li").length) { // No I18N
      renderhbs("#slide-template-your-content-card", "slide-template-your-content", {}, false, "home_builder"); // No I18N
      renderhbs("#slide-template-card", "slide-template", portalBuilder.pagesTemplates, false, "home_builder"); // No I18N

      jQuery("#slide-template-your-content-card > li").appendTo("#target-slider-list");  // No I18N
      jQuery("#slide-template-card").children().appendTo("#target-slider-list"); // No I18N
    }
    jQuery('input[type=radio][id=yourContent]').prop("checked", true); // No I18N
    portalBuilder.checkedTemplate = "yourContent"; // No I18N

    var jB = jQuery("body");
    jB.find("#freezSlidecontent").removeClass("hide");
    jB.find("#selectTempSlideContent").removeClass("hide");
    setTimeout(function () {
      jB.find("#selectTempSlideContent").addClass('translatex0');
    }, 1);
    jB.addClass("of-h");

    jQuery('input[type=radio][name=thmselect]').change(function (e) {
      e.stopImmediatePropagation();
      var templateId = this.id;
      var overwriteCallback = function (proceed) {
        if (proceed) {
          if (templateId == "yourContent") {
            portalBuilder.panelTextTranslationKeys = JSON.parse(portalBuilder.backupTranslationKeys);
            jQuery("#zcpage-builder-editorarea").html(portalBuilder.currentPage);
            var fieldContainer = jQuery("#fieldsContainer");
            var bgcolor = jQuery("#zppages").attr("bgcolor");
            fieldContainer.css("backgroundColor", bgcolor || "#f2f4f5"); //No I18N
            $PBU.defaultSelection();
          } else if (templateId) {
            portalBuilder.panelTextTranslationKeys = {};
            renderhbs("#hbs-file-target", templateId + "-template", null, false, "requestertemplate"); // NO I18N
            ZohoPages.loadTemplateContent(jQuery("#hbs-file-target").html(), portalBuilder.loadWidgetsContent); // NO I18N
            // Empty temporary reserve for page templates if exists
            jQuery("#hbs-file-target").html(""); //No I18N
          }
          BuilderConstants.isSaved = false;
          portalBuilder.needsOverwrite = true;
          portalBuilder.checkedTemplate = templateId;
        } else {
          jQuery('input[type=radio][id=' + portalBuilder.checkedTemplate + ']').prop("checked", true); // No I18N
        }
        jQuery('input[type=radio][name=thmselect]').prop("disabled", false); // No I18N
      }

      if (portalBuilder.needsOverwrite) {
        jQuery('input[type=radio][name=thmselect]').prop("disabled", true); // No I18N
        showconfirm(true, 'title=' + translate('home.zc.confirmOverwrite') + ', message=' + translate('home.zc.templateOverwrite.warning') + ', submitbutton=' + translate('sdp.common.ok') + ', cancelbutton=' + translate('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', overwriteCallback); // No I18N
      } else {
        overwriteCallback(true);
      }
    });
  },

  closeSlideContent: function () {
    var jB = jQuery("body"); // No I18N
    jB.find("#selectTempSlideContent").removeClass('translatex0');
    setTimeout(function () {
      jB.find("#freezSlidecontent").addClass("hide");
      jB.find("#selectTempSlideContent").addClass("hide");
    }, 400);
    jB.removeClass("of-h");
  },

  initializeWidgets: function () {
    if (typeof portalBuilder.creatorConfig.widgetsList == "undefined") {
      var url = "/SSCustomizeView.do?action=getAllwidgets"; // No I18N
      sdpAjax({
        url: url,
        type: "GET", //No I18N
        success: function (response) {
          portalBuilder.customWidgets = JSON.parse(JSON.stringify(response));
          for (var key in response) {
            portalBuilder.creatorConfig.widgetsArray.push({ name: response[key].title || translate("sdp.home.ssp.customization.common.untitledwidget"), uniqueId: key.toString(), desc: "", previewURL: "", defaultWidget: false, isDelete: true, customHeight: "830px" });
          }
          portalBuilder.creatorConfig.widgetsList = JSON.parse(JSON.stringify(portalBuilder.creatorConfig.widgetsArray));
          portalBuilder.buildPortal();
        }
      });
    }
    else {
      portalBuilder.buildPortal();
    }
  },

  getSelectedPageDetails: function () {
    if (!portalBuilder.id) {
      portalBuilder.newBuilder = true;
    }
  },

  initBuilder: function (options) {
    isBuilderEnabled = options.isBuilderEnabled;
    portalBuilder.creatorConfig.isTranslationRequired = options.isLocalizedSDP;
    sdpAjax({
      url: "/servlet/SDAjaxServlet?action=getLanguages", //No I18N
      async: false,
      success: function (response) {
        response.sortedKeys.forEach(function (k, i) {
          portalBuilder.creatorConfig.supportedLanguagesList.push({ "DisplayName": response.sortedValues[i], "Id": k }); //No I18N
        });
      }
    });

    sdpAjax({
      type:'GET',//NO I18N
      url:"/servlet/AJaxServlet?action=GetHeaderDetails",// No I18N 
      cache:false,
      success: function(data) {
        portalBuilder.isLicenseExpired = data.esm_details.current_portal.canAllowedDBOperation == false;
        portalBuilder.beginBuilder(options.page);
      }
    });
  }
}
portalBuilder.creatorConfig.FontFaceOptions = portalBuilder.getFonts();

