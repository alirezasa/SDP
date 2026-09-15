/* $Id$ */
//String.prototype.trim was overriden in TableHandling.js, Utils.js and newUtils.js which slows down loading the builder
String.prototype.trim = String.prototype.nativeTrim;

var portalLive = {
    creatorDD: {},
    pageId: null,
    defaultPage: 1,
    portalDetails: {},
    externalURL : window.externalframe ? "&externalframe=true" : "", //NO I18N
    // option to append 'externalframe=true' to url in required places
    creatorConfig: {
        nonce: sdpNonce,
        csspath: "/page/css", //NO I18N
        imagepath: "/page/images", //NO I18N
        jspath: "/page/js", //NO I18N
        jsppath: "/page/jsp", //NO I18N
        service: "sdpop", //NO I18N
        target: "#contentHolder", //NO I18N
        HTMLSanitizationNeeded: false, //for HTML Snippet - allowing iframe tag
        loadWidgets: function (container, config, callback) {
            if (config.widgetsId in portalLive.creatorConfig.widgetsList) {
                let iswidgetIdValid = (portalLive.creatorConfig.widgetsList[config.widgetsId] == "");
                if (iswidgetIdValid || (window.externalframe && portalLive.creatorConfig.externalFrameRestrictedWidgets[parseInt(config.widgetsId)])) {
                    let widgetObj = iswidgetIdValid ? portalLive.creatorConfig.restrictedWidgets : portalLive.creatorConfig.externalFrameRestrictedWidgets;
                    let widgetConstruct = `<div class="zc-pb-report-container"><div class="zc-pb-embed-placeholder"><div class="zc-pb-embed-cnt-holder"><img src="/zcp-embed-widget.svg" title="" alt="" size="NONE" class="zcp-embed-widget-icon"><div class="zc-pb-embed-formreport-plceholder"><span class="zc-pb-snippet-name" at-name="name" widgetsid="` + parseInt(config.widgetsId) + `">` + widgetObj[parseInt(config.widgetsId)] + `</span><span class="zc-pb-snippet-desc" at-name="index">` + translate("zcpage.widget.unavailable") + `</span></div></div></div></div>`;
                    container.html(widgetConstruct);
                    callback();
                } else {
                    sdpAjax({
                        url: portalLive.creatorConfig.widgetsList[config.widgetsId],
                        skipSUBREQUEST : true,
                        dataType: "html", //NO I18N
                        async: false,
                        success: function(data) {
                            container.html(data);
                            if (container.find(".widget-panel").length == 1) {
                                if (config.widgetsId != "1096278446006") {
                                    container.find(".widget-panel").attr("style", "overflow-y:auto!important").height(container.height() - container.find(".widget-header").outerHeight() - 10);
                                }
                            }
                            callback();

                        }
                    });
                }
            } else {
                var name = JSON.parse(container.closest("[eltype=widgets]").find(".zpAlignPos").attr("config")).name; //NO I18N
                sdpAjax({
                    url: "/servlet/SDAjaxServlet?action=getSSPWidgetName&id="+config.widgetsId, //NO I18N
                    async: false,
                    success: function (data) {
                        name = data.title;
                    }
                });
                var header = (name!=='' && name !== translate("sdp.home.ssp.customization.common.untitledwidget")) ? `<div class="widget-bg"><div class="widget-header"><h4 class="pos-rel font-normal" style="width: 351px;">` + e_html(name) + `</h4><div class="widget-menu" style=""></div></div>` : ""; // No I18N
                var htmlsrc = `
                <IFRAME frameborder="0" style="width: 100%; height: 100%; border: margin: 0px;" scrolling="yes" src="` + portalLive.creatorConfig.widgetsList["custom"] + parseInt(config.widgetsId) + `"></IFRAME>`; // No I18N
                container.html(header + htmlsrc);
                callback();
            }

            parent.darkMode();
        },
        widgetsList: typeof previewWidgets === 'undefined' ? { //NO I18N
            "1096278446001": "/home/widgets/PendingApprovalForRequester.jsp?widgetName=" + translate("sdp.home.approval.allmypendingapprovals") + "&widgetID=101", //NO I18N
            "1096278446002": "/home/widgets/SummaryForRequester.jsp", //NO I18N
            "1096278446003": isSolutionModuleEnabled ? "/home/widgets/PopularSolutions.jsp"+(window.externalframe?"?externalframe=true":"") : "", //NO I18N
            "1096278446004": isAssetModuleEnabled ? "/home/widgets/HomePageAssetsForRequester.jsp" : "", //NO I18N
            "1096278446005": "/home/widgets/AnnouncementViewForRequester.jsp", //NO I18N
            "1096278446006": "/home/widgets/PortalUsageForRequester.jsp", //NO I18N
            "1096278446007": "/home/widgets/IncidentCatalogForRequester.jsp?widgetName=" + translate("common.tech.issuecatalog") + "&widgetID=107", //NO I18N
            "1096278446008": sdp_app.IS_SERVICECATALOG_ENABLED ? "/home/widgets/ServiceCatalogForRequester.jsp?widgetName=" + translate("common.servicecatalog") + "&widgetID=108" : "", //NO I18N
            "1096278446009": sdp_app.IS_SERVICECATALOG_ENABLED ? "/home/widgets/RequestCatalogForRequester.jsp?widgetName=" + translate("common.req.requestcatalog") + "&widgetID=109" : "", //NO I18N
            "custom": "/servlet/SDAjaxServlet?action=getWidgetContent&id=" //NO I18N
        } : previewWidgets,

        restrictedWidgets: {
            "1096278446003": translate("sdp.home.popularsolutions"), //NO I18N
            "1096278446004": translate("common.myassets"), //NO I18N
            "1096278446008": translate("common.servicecatalog"), //NO I18N
            "1096278446009": translate("common.req.requestcatalog") //NO I18N
        },

        externalFrameRestrictedWidgets: {
            // incident catalog
            "1096278446007": translate("common.tech.issuecatalog"), //NO I18N 
            // service catalog wizard
            "1096278446008": translate("common.servicecatalog"), //NO I18N 
            // service categories (or) request catalog wizard
            "1096278446009": translate("sdp.cpl.service.catagories"), //NO I18N 
        },

        actions: {
            report_issue: function () {
                window.open("/Templates.do?module=incident"+portalLive.externalURL, "_self", 'noopener'); //No i18N
            },
            create_request: function () {
                window.open("/Templates.do?module=serviceRequest"+portalLive.externalURL, "_self", 'noopener');//No i18N
            },
            goto_solutions: function () {
                const actionUrl = window.externalframe ? "_blank" : "_self"; //NO I18N
                //incease of externalframe open in new tab since solution isn't supported in externalframe
                const windowFeatures = actionUrl == '_blank' ?  'noopener,noreferrer' : 'noopener'; //NO I18N
                window.open("/ui/solutions?mode=list", actionUrl, windowFeatures); //No i18N
            },
            openPendingReq: function () {
                var url = "/ui/load_list?module=requests&input_data=" + encodeURI(sdpToJSON({list_info: {filter_by: {name: "All_Pending_Requester"}, search_criteria: []}})); //No i18N
                listview_popup.render(url, translate("sdp.home.summary.openRequestsTitle")); //No i18N
            },
            openOnHoldReq: function () {
                var url = "/ui/load_list?module=requests&input_data=" + encodeURI(sdpToJSON({list_info: {filter_by: {name: "Onhold_Requester"}, search_criteria: []}})); //No i18N
                listview_popup.render(url, translate("sdp.requests.viewrequest.requester.allonholdrequests")); //No i18N
            },
            openCompleteReq: function () {
                var url = "/ui/load_list?module=requests&input_data=" + encodeURI(sdpToJSON({list_info: {filter_by: {name: "All_Completed_Requester"}, search_criteria: []}})); //No i18N
                listview_popup.render(url, translate("sdp.requests.viewrequest.allcompletedrequests")); //No i18N
            },
            openAwaitingReq: function () {
                var url = "/ui/load_list?module=requests&input_data=" + encodeURI(sdpToJSON({list_info: {filter_by: {name: "My_Pending_Request_Awaiting_approval"}, search_criteria: []}})); //No i18N
                listview_popup.render(url, translate("sdp.requests.viewrequest.mypendingawaitingforapproval")); //No i18N
            },
            openAwaitingUpdate: function () {
                var url = "/ui/load_list?module=requests&input_data=" + encodeURI(sdpToJSON({list_info: {filter_by: {name: "Waiting_Update"}, search_criteria: []}})); //No i18N
                listview_popup.render(url, translate("sdp.requests.viewrequest.waitingupdate")); //No i18N
            },
            add_booking: function () {
                const actionUrl = window.externalframe ? "_blank" : "_self"; //NO I18N
                // incease of externalframe open in new tab since booking isn't supported in externalframe
                const windowFeatures = actionUrl == '_blank' ?  'noopener,noreferrer' : 'noopener'; //NO I18N
                window.open("/ui/assets/bookings?mode=add", actionUrl, windowFeatures); //No i18N
            },
            show_searchResult: function (string) {
                if ($home_page.ssp.live.searchInitiated) {
                    return;
                }
                $home_page.ssp.live.searchInitiated = true;
                $home_page.ssp.live.loadSearchResult(string);
            }
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

    beginLive: function (page) {
        // Maintain the bodypad space for new template
        jQuery("body").addClass("cust-req-page");   //NO I18N
        jQuery("#zc-component").addClass("p5");   //NO I18N

        portalLive.pageId = page ? page : null;
        portalLive.getSelectedPageDetails();
        jQuery('#my_view_link').off().on("click", function (event) { 
            ClientUtil.addUserPersonalization("home_view", {"view": "my_view"}).then(function() { //No I18N
                window.location.href = window.location.href.replace(/view_type=[a-z_]+/, 'view_type=my_view'); //No I18N
            });
        });
        jQuery('#bakcup_approver_btn_link').off().on("click", function (event) { loadHomePageTabContent('backupapprover'); }); //No I18N
    },

    // Load the selected page. Fetches page content from server
    getSelectedPageDetails: function () {
        sdpAjax({
            url: sdp_user.USERTYPE == "Technician" ? "/api/v3/creator_dashboard/" + parseInt(portalLive.pageId) + "/_preview" : "/api/v3/creator_dashboard/_requester_home", //NO I18N
            success: function (data) {
                portalLive.creatorConfig.content = data.creator_dashboard.structure;
                ZohoPages.live(portalLive.creatorConfig, function (opt) {
                    jQuery(".zc-pb-search-inputfld").attr("id", "search-input");
                    search_widget.init("");
                    jQuery(".zc-pb-search-btn").addClass("cur-ptr").find(".zc-pb-tbsearch").removeClass().addClass('rspr flat icon-sm search-plus1').attr({"title": translate("common.advance.search"), "rel": "uitip"}); //No I18N
                    initTooltip(".zc-pb-search-btn"); //No I18N
                    // hide preview message from header's jspf
                    jQuery("#TopStrip .preview-tip").hide(); //No I18N
                    jQuery("#TopStrip").parent().hide(); //No I18N
                });
            }
        });

        // Disable click events for preview page
        if (sdp_user.USERTYPE == "Technician") { //NO I18N
            jQuery("body").css("pointer-events", "none"); //NO I18N
        }
    }
}

