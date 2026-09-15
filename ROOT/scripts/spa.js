/* $Id$ */
/**
 * The following the file is used to handle all the ajax page navigation
 * This system can be splited into three part
 * Route Engine
 * Event Dispatcher
 * Core
 */
var $spa = {
    /** Custom event to listen while SPA route is Change */
    pageChange: "spa.pageChange", // NO I18N
    /** Jquery instance for chaining the body */
    $: jQuery("body"),
    /** Helper variable to find hash is change in url */
    isHashChange: false,
    /** Helper array to store the routed url, used to browser back functionality */
    historyRef: [],
    /** Route list populated from the DOM */
    routeList: {},
    /**
     * SD - 118632
     */
    showAlert : false,
    /**
     * SD - 118623
     * Define the retainQuery object, which holds various properties.
     */
    retainQuery : {
        /**
         * `pathname` property represents the path part of the URL.
         */
        pathname : "",
        /**
         * `search` property represents the query parameters part of the URL.
         */
        search : ""
    },

    /** SPA Container  */
    $container: function() {
        /**
         * If a sub-container has been previously set (i.e., if this.subContainer exists and contains an 'element' property), that element is returned. 
         * Otherwise, it falls back to selecting the element with the id "spa-container" from the DOM. 
         */
        return (this.subContainer && this.subContainer.element) || jQuery("#spa-container");
    },
    /** Init method : It was the initialize method for All SPA operation */
    init: function() {
        var self = this;
        self.bindSPA();
        setTimeout(function() {
            self.populateRouteData();
        }, 100);
    },
    //     /************** Route Engine  ********************/
    /** This is used to modify the input, before call the page via ajax **/
    beforeSend:function(item){
        /**
         * SD - 118623
         * Destructure the `pathname` and `search` properties from `this.retainQuery`.
         */
        const { pathname, search } = this.retainQuery;
        /**
         * Check if `item` is marked for retention and both `pathname` and `search` are truthy values.
         */
        if (item.retain && pathname && search) {
            /**
             * Concatenate `pathname` and `search` to form the URL and assign it to `item.url`.
             */
            item.url = this.addNoHeader(pathname + search);
        }
        /**
         * Url is also maintained in other modules, that's why if no details page, we don't maintain path name and search. 
         */
        if(item && `${item.tabName}-details` !== item.id){
             /**
             * Clear `pathname` and `search` to prevent duplicates.
             * This action is taken regardless of the condition's outcome.
             */
             this.retainQuery.pathname = this.retainQuery.search = "";
        }
        /**
         * Return the modified `item`.
         */
        return item;
    },
    /**
     * @usage : This function is called before every route transition
     */
    before: function(item) {
        var self = this;
        var currentPageId = this.getCurrentURLId();
        /** Before calling the requested url, we need to show the loader first */
        this.showLoader();
        /** since the request-listview disable the overflow  */
        jQuery("body").removeAttr("class").css("overflow", "auto").addClass("bodybg"); // NO I18N
        if(typeof $notification_popup == "object"){
            /** Closing Notification popup if opened */
            $notification_popup.checkForUnsentNotifications();
        }
        /** Render the Quick Create Request  */
        var cont = jQuery("#quick-create-container");
        if (cont.length && !cont.find("#qc_requesterID").length) {// NO I18N
            /** In new request page the quick-create part is hidden,
             * If the page is start from the new-request, then we don't have any quick create section in another page.
             * so we render the quick create section
             */
            window.renderhbs("#quick_create", "quick-create-request", { // NO I18N
                data: site_details
            }, false, "common", undefined, undefined, window.qcEventListener);    //No I18N
            /** After the template render, we init the quickcreate script */
            QuickCreateRequest.init(sdpheader_data.is_exclude_tech);
            cont.find(".qc-menu-cnt").removeAttr("style"); // NO I18N
        }
        /**
         * since the request details page code is loaded through out the application with req_details check
         * we need to remove the req_details page code
         */
        window.req_details = undefined;
        try {
            /** before leaving the details page, need to update collaboration */
            if(window.WOID){
                $req.details.updateCollaborationCount(window.WOID);
            }
            /** Unset the Fafr Details Page Key  */
            // $se.onDetailspage = undefined;
            $se.onDetailPage= undefined;
            $req.details.request_info = {};
            /** Un Bind the Request Listview's Resize Method */
            jQuery(window).off("resize.wol_resize"); // NO I18N
        } catch (error) {}        
        /**
         * SD - 118632
         * Remove all Alert Message before route Transition
         */
        if(!this.showAlert){
            /**
             * If showAlert is false, clear the content of the element with id "alertbox"
             */
            jQuery("#alertbox").html(""); // NO I18N
        }else {
            this.showAlert = false;
        }
        /**
         * SD - 118623
         * Destructure `pathname` and `search` properties from `window.location` object.
         * `pathname` represents the path part of the URL.
         * `search` represents the query parameters part of the URL.
         */
        const { pathname, search } = window.location;
        /**
         * Check if `item` exists and its tabName concatenated with '-details' matches item.id
         * Also, check if 'url_search' or 'gsearch' is included in search or pathname is "/SearchN.do"
         */
        if (item && `${item.tabName}-details` === item.id && (search.includes("url_search") || search.includes("gsearch") || pathname === "/SearchN.do")) {
            /**
             * Update `retainQuery` with the current `pathname` and `search` values
             */
            this.retainQuery.pathname = pathname;
            this.retainQuery.search = search;
        }
        // Close Translations 
        if(!jQuery("#cancel_translations").hasClass("hide")){
            closeTranslations();
        }
		/** Check color setting JSON data and keys present **/
		if(window["cs_id"] && window["cs_enabled"]) {
			delete window["cs_id"]; // NO I18N
			delete window["cs_enabled"]; // NO I18N
			color_setting.setting_permission.is_mypersonalizeEnable = false;
			color_setting.setting_permission.render_tabs = "global"; // NO I18N
			if(!jQuery.isEmptyObject(color_setting.color_settings_data)) {
				color_setting.color_settings_data = {};
			}
			if(!jQuery.isEmptyObject(color_settings_helper.color_settings)) {
				color_settings_helper.color_settings = {};
			}
		}
        /** page specific before scripts */
        if (currentPageId) {
            switch (currentPageId) {
                /** Service Catelogue Customization */
                case "scc":  // NO I18N
                    var sccEvents = [
                        "resize.scc_appendScroll", // NO I18N
                        "resize.scc_windowResize", // NO I18N
                        "scroll.scc_pageScroll", // NO I18N
                        "scroll.scc_goToTopScroll" // NO I18N
                    ];
                    /** disable the global events from the SCC */
                    jQuery(window).off(sccEvents.join(" "));
                    break;
                    /** Request list view page */
                case "requests-list": // NO I18N
                    /** clearing the existing refresh interval that is running already */
                    if (parent.refreshInterval !== undefined) {
                        parent.clearInterval(parent.refreshInterval);
                    }
                    /** Remove the unified/combined references */
                    window.current_req_mode = undefined;
                    /** Since request details page have also list_view_id,
                     * it might create conflict if the page have another mickey listview */
                    window.list_view_id = undefined;
                    /** since the left-panel and combined view is same, so need to remove viewMode */
                    requests_table.viewMode = "";
                    typeof $req !== undefined && $req.prop && ( $req.prop.fromListview = false );
                    /**table component url search handling */
                    var state = history.state;
                    if(state && state.mode === "url_search" && !state.listview_search){
                        state.listview_search = true;
                        history.replaceState(state, "", state.searchURL);
                        jQuery(window).off("popstate.tbstate_requests_list"); //No I18N
                    }else if(state){
                        state.listview_search = false;
                        history.replaceState(state, "", state.searchURL);
                    }
                    requestListViews.searchText = null;
                    /** clearing the existing refresh interval that is running already */
                    if (window.lp_refresh_interval) {
                        clearInterval(window.lp_refresh_interval);
                    }
                    break;
                    /**  Request details page */
                case "requests-details": // NO I18N
                    /** clearing the existing refresh interval that is running already */
                    if (window.lp_refresh_interval) {
                        clearInterval(window.lp_refresh_interval);
                    }
                    /** since the left-panel and combined view is same, so need to remove viewMode */
                    requests_table.viewMode = "";
                    var winEvents = [
                        "scroll.wod_lpanel_height", // NO I18N
                        "scroll.wod_stickbar", // NO I18N
                        "resize.wod_lpanel" // NO I18N
                    ];
                    /** request details page have the stickbar  */
                    jQuery(window).off(winEvents.join(" ")); // NO I18N
                    $req.details.destroy();
                    window.woID = undefined;
                    break;
                    /** Home Page */
                case "home": // NO I18N
                    /** unbind the resource management window events */
                    jQuery(window).off("resize.rmgmt"); // NO I18N
                    break;
                case "releases": // NO I18N
                    /** unbind the resource management window events */
                    jQuery(window).off("resize.rmgmt"); // NO I18N
                    break;
                case "solutions": // NO I18N
                    /** unbind the solutions window events */
                    jQuery(window).off("resize.sol_resize"); // NO I18N
                break;
                case "requests-new":  // NO I18N
                case "requests-edit":  // NO I18N
                    $req && $req.form && $req.form.destroyForm();
                    jQuery(window).off("scroll.cost_header");  // NO I18N
                    jQuery("#quick-create-container").length > 0 && jQuery("#quick-create-container").addClass("btn-group").show(); //No I18N
                    break;
                case "maintenances": // NO I18N
                    /** unbind the resource management window events */
                    jQuery(window).off("resize.rmgmt"); // NO I18N
                    break;
                case "maintenances-edit":  // NO I18N
                    $req && $req.form && $req.form.destroyForm();
                    break;
                case "spaces": // NO I18N
                    /** unbind the resource management window events */
                    jQuery(window).off("resize.rmgmt"); // NO I18N
                    break;    
                case "problems": // NO I18N
                    /** unbind the resource management window events */
                    jQuery(window).off("resize.rmgmt"); // NO I18N
                    break;
                default:
                    break;
            }
        }
        darkMode();
    },
    /** After route transition to another page */
    after: function() {
        /** Close all dialog */
        window.closeDialog();
        /** SD - 132732 Close all Jquery UI Dialog */
        jQuery(".ui-dialog-content").each(function(index, element) {
            if (jQuery(element).data("sdpDialog")) {
                jQuery(element).dialog("close"); // NO I18N
            }
        });
        /** Close all opened dropdown */
        jQuery(".btn-group").removeClass("open"); // NO I18N

        /** Ziz template/category prediction is need to close*/
        jQuery("#tech-notification-tm").remove(); //No I18N
        jQuery("#zia-notify-overlay").hide(); 

        var currentPageId = this.getCurrentURLId();
        
        if(typeof $se == "object"){
            /** In every route transition, we need to call the pageScripts */
            $se.page_scripts.render("all_page");    //No I18N
        }
        if (currentPageId) {
            switch (currentPageId) {
                /** Request Listview page */
                case "requests-list": // NO I18N
                    $se.page_scripts.render("rlv_page");    //No I18N
                    break;
                    /** Request Details Page */
                case "requests-details": // NO I18N
                    $se.page_scripts.render("rdp_page");
                    /** triggering onload handler for the request details page manually */
                    reqDetailsOnLoadHandler();
                    break;
                case "requests-new":   //No I18N
                case "requests-edit":  //No I18N
                    jQuery("#quick-create-container").length > 0 && jQuery("#quick-create-container").removeClass("btn-group").hide();  //No I18N
                    break;
            }
        }
        /** After route transition, need to get focus in body inorder to mouseout event for tooltips */
        jQuery("body").addClass("bodybg").trigger('focus').find("#spa-container .bodypad").removeClass("bodypad"); // NO I18N
        applyBrowserTitle();

         //whenever we click back page the chat notification function is not initialised notification var
         if(sdp_app.IS_SDP_CHAT_ENABLED && typeof notifications!="undefined"){
            notifications.subscribe('chat', processChatNotification); // NO I18N
         }
        /**
         * Need to Reinitialize the HTML 
         */
        sdpAjax({
            url:"/images/shadow/ui-common-shadow.html?"+sdp_app.BUILD_NUMBER,  // NO I18N
            dataType:"html", // NO I18N
            ignorefailuremessage:true,
            success:function(res){
                jQuery("#common-svg-code").html(res);
            }
        });
        setGSearchSelectedModuleOnSPA(currentPageId);
        /*Resize header in when spa triggered*/
        $header.resizeHeader();
    },

    /**
     * returns if the transition is allowed by current route as some routes restrict transtion when it contains unsaved data
     */
    canTransit: function() {
        var transit = true;
        // typeof FC !== "undefined" && FC && ( transit = FC.exitHandler() );
        // if(!transit) {
        //     return false;
        // }
        var currentPageId = this.getCurrentURLId();
        if(currentPageId) {
            switch(currentPageId) {
                case "requests-new":   //No I18N
                case "requests-edit":  //No I18N
                    return FC.exitHandler();
                case "requests-details":    //No I18N
                     return $req.details.checkResolutionChange();
                case "releases-add":   //fallthrough   //No I18N
                case "releases-edit":  //No I18N
                case "solutions-edit":  //No I18N
                case "assets-add":   //fallthrough   //No I18N
                case "assets-edit":  //No I18N
                case "assets-details":  //No I18N
                    return FC.exitHandler();
                case "maintenances-add":   //fallthrough   //No I18N
                case "maintenances-edit":  //No I18N
                    return FC.exitHandler();
                case "spaces-add":   //fallthrough   //No I18N
                case "spaces-edit":  //No I18N
                    return FC.exitHandler();    
                case "problems-add":   //fallthrough   //No I18N
                case "problems-edit":  //No I18N
                    return FC.exitHandler();
                case "problems-details": //No I18N
                    return $problemDetails.checkForActiveEditors();
                case "home": //No I18N
                    return sdp_app.IS_SDP ? $home_page.exitHandler() : true;
            }
        }
        return true;
    },

    /** Active the menu by using applyThemes method : header_common.js */
    activeMenu: function(tabName) {
        window.applyThemes(tabName.toLowerCase());
        jQuery("body").attr('tabindex', '-1').focus(); //Tab focus for Wcag 2.4.1 Bypass Blocks
    },
    /**
     * Route to another url
     * i.e populate the url
     * @param {string} url
     */
    route: function(url) {
        jQuery(window).trigger(this.pageChange);
        /**
         * If "subContainer" is enabled, restrict updating the URL in the browser.
         */
        if (!this.subContainer) {
            url = this.removeNoHeader(url);
            /** Push the history with data {spa:true} */
            history.pushState({
                spa: true
            }, null, url, "$1");
        }
        /** Scroll to Top */
        window.scrollTo(0, 0);
    },
    /**
     * Helper method to handle normal method to SPA navigation
     * @param {string} url
     * @param {string} module This is used to active the menu
     * @param {*} page This is used call the page's before/after callbacks
     * @param {boolean} [showAlert=false] - Whether to show an alert (optional, default is false).
     */
    navigate: function(url, module, page, showAlert, subContainer) {
        var item = {};
        /** Add no header to the url */
        url = this.addNoHeader(url);
        item.url = url;
        item.tabName = module;
        /** if the page is not available then take from tabName */
        item.id = page ? page : item.tabName;
        /**
         * SD - 118632
         * Determine whether to show an alert based on the showAlert parameter
         */
        this.showAlert = showAlert ? showAlert : false;
        this.subContainer = (subContainer && !jQuery.isEmptyObject(subContainer)) ? subContainer : false;
        this.doAjax(item);
    },
    /**
     * Populate the route data from the DOM
     * by iterate the [data-spa='true'] attribute
     */
    populateRouteData: function() {
        var routes = {};
        var self = this;
        var url;
        jQuery("[data-spa='true']").each(function() {
            url = jQuery(this).attr("href");
            var ele = jQuery(this);
            if (!routes[url]) {
                routes[url] = {
                    url: url,
                    tabName: ele.data("spaModule"), // NO I18N
                    /** if the data-spa-page is not given, then it take tabname as page  */
                    id: ele.data("spaPage") ? ele.data("spaPage") : this.tabName // NO I18N
                };
            }
        });
        /**
         * Add Request Details page if it not availble from the DOM
         */
        var currentPage = window.location.href.replace(window.location.origin, "");
        if (currentPage.indexOf("woMode=viewWO") !== -1) {
            routes["requests-details"] = {  // NO I18N
                url: currentPage,
                tabName: "requests", // NO I18N
                id: "requests-details" // NO I18N
            };
        }
        self.routeList = routes;
        /** This will call on initiaziation stage,
         * so we can directly add the current page url in the history pool
         */
        self.historyRef.push(currentPage);
    },
    history: function() {
        var self = this;
        /** Listen the hashchange event add notedown using isHashChange variable */
        jQuery(window).on("hashchange", function() {
            self.isHashChange = true;
        });
        /** If we want to listen on history pushstate, then https://stackoverflow.com/a/4585031/6335029  */
        jQuery(window).on("popstate", function(e) {
            var state = e.originalEvent ? e.originalEvent.state : null;
            /** if hashchange is true, then we don't need to handle it
             * @todo Need to remove window.location.href.indexOf("#") !== -1
             */
            if (self.isHashChange || window.location.href.indexOf("#") !== -1 || (state && state.spa_skipstate)) {
                self.isHashChange = false;
                return false;
            }
            /** Calculate the back history state */
            self.calculateBackHistory();
            var currentPage = window.location.href.replace(window.location.origin, "");
            /** during backbutton click, need to handle those url to */
            self.historyRef.push(currentPage);
            var items = self.routeList[currentPage];
            if(items==undefined && currentPage.startsWith("/WOListView.do")) {
                /*  Request list view from Dashboard, open in new tab contains search criteria in the URL
                Then browser back button to go back to list view with criteria handled here */
                items = self.routeList["/WOListView.do"];
                items.url = currentPage;
            }
            /** if it is home homepage  */
            if (currentPage.indexOf("/ui/home?view_type=") !== -1 && jQuery("#homeContent").length) {
                /** Get the data from url */
                var view_type = $spa.getSearchParam("view_type"); // NO I18N
                try {
                    /** When click the backbutton in homepage the SPA handle those operation  */
                    window.loadHomePageTabContent(view_type);
                } catch (error) {
                    /** If any error we catch, we reload the whole page */
                     window.top.location.replace(currentPage);
                }
                /** stop exection */
                return true;
                /** Details Page */
            } else if (currentPage.indexOf("WorkOrder.do?woMode=viewWO") !== -1) {
                /** If it is in details page  */
                if (jQuery("#detailview").length) {
                    try {
                        /** Navigate using the navigateWO navigate method */
                        window.$req.details.navigateWO($spa.getSearchParam("woID")); // NO I18N
                    } catch (e) {}
                } else {
                    /** Else navigate using SPA Navigate method */
                    self.navigate(currentPage, "requests", "requests-details"); // NO I18N
                }
                    /** stop exection */
                    return true; 
            } else if (currentPage.indexOf("/WOListView.do") !== -1) {
                /** If moving to Kanban page from the request details page, then request details page's popstate handler will take care of the transition  */
                if (state && state.mode === "kanban" && jQuery("#detailview").length > 0 && jQuery("#listview").length > 0) {
                    return;
                }
                /**
                 * If the navigate page is from homepage->rlv->rdp->rlv
                 * then state might have the listview_search or no data on state
                 * either case, we should navigate to the rlv page
                 * refer: https://sdp-issues/TaskDefAction.do?_=1628776460465&submitaction=viewTask&TASKID=74836&from=milestone&fromListView=true
                 */
                if(
                    (!items && state && state.listview_search)  ||
                    (!items && !state && currentPage.indexOf("globalViewName") !== -1)
                    ){
                    items = self.getDataByUrl(currentPage);
                    items.url = currentPage;
                    items.tabName = items.module;
                }

            }
            /** If SPA Data items  */
            if (items) {
                items.url = self.addNoHeader(items.url);
                /** Navigate via doAjax */
                self.doAjax(items);
                /** Else reload that page */
            } else if (currentPage.indexOf("WorkOrder.do?woMode=viewWO") === -1 && state && state.mode != "url_search") { //No I18N
                window.location.reload();
            }
            else if (currentPage.indexOf("Templates.do?module=mergedRequest") !== -1||currentPage.indexOf("Templates.do?module=incident") !== -1 || currentPage.indexOf("Templates.do?module=serviceRequest") !== -1) { //No I18N
                window.location.reload();
            }
            /** Safety check  */
            else if((currentPage.indexOf("WOListView") > -1 && currentPage.indexOf("url_search") > -1 && !state) || currentPage.indexOf("SearchN.do") > -1){
                window.location.reload();
            }
        });
    },
    /**
     * Calculate browser backhistory
     */
    calculateBackHistory: function() {
        var self = this;
        var historyRefLen = self.historyRef.length;
        /** If last two history is same, then page will goes in infinite loop */
        if (historyRefLen >= 2 && self.historyRef[historyRefLen - 2] === self.historyRef[historyRefLen - 1]) {
            window.history.go(-1);
            return true;
        }
        return false;
    },
    /************** Event Dispatcher  ********************/
    /** second core of the SPA
     * It is the responsible to dispatch event to each route transition
     */

    /**
     *  A helper method is used to dispatch events
     * @param {Object} item SPA Item
     */
    eventDispatcher: function(item) {
        /** Active the menu based tab Name */
        this.activeMenu(item.tabName);
        /** Get all the callbacks  */
        var pageCallbacks = this.pageCallbacks();
        /** If the current route have callback then call those callback */
        if (pageCallbacks[item.id]) {
            pageCallbacks[item.id].call();
        }
        /** Populate the history */
        this.route(item.url);
        /** Dispatch after callback */
        this.after();
    },
    /**
     * Bind the SPA onclick events to the every element
     */
    bindSPA: function() {
        var self = this;
        /** Listen onclick of element with [data-spa="true"] attribute  */
        /**
         * SD - 118007
         * Exclude elements that have the disabled attribute to prevent the event from firing when the button is disabled
         */
        jQuery(document).on("click", '[data-spa="true"]:not([disabled])', function(e) {
            /** Do ajax operation only user not click with ctrl/cmd key */
            if (!e.metaKey && !e.ctrlKey) {
                /** Prevent the default action */
                e.preventDefault();
                /** Construct the SPA Items */
                var item = {};
                item.url = jQuery(this).attr("href");
                var historyRefLen = $spa.historyRef;
                if(historyRefLen.length>1) {
                    if( (item.url === "/WOListView.do") && (e.target.id==="back_to_list" || e.target.parentElement.id==="back_to_list")) {
                        /*  Request list view from Dashboard, open in new tab contains search criteria in the URL
                            Then details page back button to go back to list view with criteria handled here */
                        for(let i=historyRefLen.length-2;i>=0;i--) {
                            if(historyRefLen[i].startsWith("/WOListView.do")) {
                                if(historyRefLen[i].indexOf("input_data=")!=-1) {
                                    item.url = historyRefLen[i];
                                }
                                break;
                            }
                        }
                    }
                }
                
                item.url = self.addNoHeader(item.url);
                /**
                 * SD - 118623
                 * Set the `retain` property of `item` based on the value of `spaRetain` data attribute of the jQuery element
                 * It is used to maintain inline and global search data
                 */
                item.retain = jQuery(this).data("spaRetainUrl"); // NO I18N
                item.tabName = jQuery(this).data("spaModule"); // NO I18N
                /**
                 * Supports subcontainer in SPA mode, preventing URL changes in the browser.
                 */
                const isSubcontainer = jQuery(this).data("spaSubcontainer"); // NO I18N
                self.subContainer = isSubcontainer ? {"element" : jQuery(this).closest('#spa-container[data-spa-subcontainer="true"]')} : false; // NO I18N
                if(item.tabName == 'requests' && jQuery(e.target).parents("ul").first().attr("id") == 'sdp-tabs') {
                    /* Resetting the search criteria when clicking the request tab in header after open list view in new tab from dashboard */
                    delete requestListViews.input_data;
                    delete requests_table.search_criteria;
                }
                /** If the page is not given, then take module as page id */
                item.id = jQuery(this).data("spaPage") ? jQuery(this).data("spaPage") : item.tabName;
                /** check the url is proper url */
                if (item.url && item.url.indexOf("javascript:void(0)") === -1) {// NO I18N
                    /** Call the page via SPA's doAjax method */
                    self.doAjax(item);
                }
            }
        });
        /** Bind the history based events */
        this.history();
    },
    /************** CORE  ********************/
    /** It is Main core section in the SPA
     * It was the responsible for the AJAX Based Operation
     */
    /**
     * @param {Object} item SPA Item 
     */
    doAjax: function(item) {
        var self = this;
        /** confirms if the transition is allowed by current route as some routes restrict transtion when it contains unsaved data */
        if(!this.canTransit()) {
            return false;
        }
        /** Get the full url without noheader=true params */
        var redirectUrl = self.removeNoHeader(item.url);
        const urlIsExternal = redirectUrl ? redirectUrl.includes('externalframe=true') : false;// NO I18N
        /** If the SPA container is not available, then it is non-spa related page, so need to reload   */
        if (!self.$container().length) {
            return (urlIsExternal ? window.location = redirectUrl : window.top.location = redirectUrl);
        }
        if(item.id === "scc") { // NO I18N
            window.location.assign( this.removeNoHeader(item.url));
            return false;
        }
        item = this.beforeSend(item);
        sdpAjax({
            url: item.url,
            cache: false,
            ignorefailuremessage: true,
            skipSUBREQUEST:true,
            dataType: "html", // NO I18N
            beforeSend: function() {
                /** Before make call to the server need to call Before callbacks */
                self.before(item);
            },
            success: function(res) {
                /** Get the SPA Container */
                var container = self.$container();
                /** If the response contains j_username && j_password, then it might be Authentication related
                 * So Need to reload the page
                 */
                if (!container.length || (res.indexOf("j_username") > 0 && res.indexOf("j_password") > 0) || res.indexOf("__SDP__LOGIN") > -1) {
                    return window.top.location.replace(redirectUrl);
                }
                /** Show the error page in full page */
                if (res.indexOf('class="error-content"') !== -1 && res.indexOf("messageHolder") !== -1) {
                    jQuery("body").addClass("bodybg error-page").html('<div class="pos-rel" style="top:50%;left:50%;transform:translate(-50%,-50%)">' + res + "</div>"); //NO I18N
                }
                try {
                    /** Put the HTML code in SPA-Container */
                    if (container && container.length) {
                        container.html(res);
                    /** Sometimes mickeylite remove the whole page contnent  */
                        (function(){
                            if(!jQuery("body #spa-container").length){
                                if(urlIsExternal) {
                                    // redirect within the iFrame if externalframe is present in url
                                    window.location.replace(redirectUrl);
                                }
                                else {
                                    window.top.location.replace(redirectUrl);
                                }
                             }
                        })();
                    }
                } catch (error) {
                    /** If any error catch, we need to hide the loader */
                    jQuery(".page-progressbar").fadeOut();
                    // Reload the page, if we catch any  errors
                    window.top.location.replace(redirectUrl);
                }
                try {
                    /** Dispatch SPA event like route,history, etc */
                    self.eventDispatcher(item);
                } catch (error) {
                    window.top.location.replace(redirectUrl);
                }
                /** Save this url to the SPA History pool */
                self.historyRef.push(redirectUrl);
            },
            error: function() {
                // Reload the page, if we catch any  errors
                window.location.href = redirectUrl;
            },
            complete: function() {
                /** Either success/error, need to hide loader */
                jQuery(".page-progressbar").fadeOut();
                /** If the response contains spa-container div, need to remove that div too  */
                setTimeout(function() {
                    self.$container().find("#spa-container").filter(function() {
                        /**
                         * Prevent removal of the "spa-container" ID if the "data-spa-subcontainer" attribute is set to "true" 
                         * during navigation from the request module to the home module.
                         */
                        return !jQuery(this).data("spaSubcontainer") || self.subContainer; // NO I18N
                    }).removeAttr("id"); // NO I18N
                }, 1);
            }
        });
    },
    pageCallbacks: function() {
        return {
            "home": function() { // NO I18N
                /** Homepage have gridster-customization class on body, need to remove it */
                jQuery("body").addClass("gridster-customization grid-customization"); // NO I18N
            },
            "requests-list": function() { // NO I18N
                /** Request Listview need to hide the overflow */
                jQuery("body").css("overflow", "hidden"); //NO I18N
            },
            "requests-new": function() { // NO I18N
                try {
                    /** initOtherScript is need to call on new/edit request page   */
                    initOtherScript();
                    /** Remove the Quick create section in the new/edit request page */
                    jQuery("#quick-create-container").find(".qc-menu-cnt").attr("style", "display:none !important").find("#quick_create").html(""); // NO I18N
                    /** Fix the form footer  */
                    fixedformfooter(document.querySelector(".form-template.detailview"), document.querySelector("[data-name=form-footer]"), "fixedbtnpbottom=false"); // No I18N
                } catch (error) {}
            },
            "requests-edit": function() { // NO I18N
                try {
                   /** initOtherScript is need to call on new/edit request page   */
                     initOtherScript();
                    /** Remove the Quick create section in the new/edit request page */
                    jQuery("#quick-create-container").find(".qc-menu-cnt").attr("style", "display:none !important").find("#quick_create").html(""); // NO I18N
                    /** Fix the form footer  */
                    fixedformfooter(document.querySelector(".form-template.detailview"), document.querySelector("[data-name=form-footer]"), "fixedbtnpbottom=false"); // No I18N
                } catch (error) {}
            },
            "requests-details": function() { // NO I18N
                try {
                    /** Reset the floating bar menu on details page  */
                    floatingmenubarscroll();
                    /** Set the flag for the request details page */
                    window.req_details = true;
                } catch (error) {}
            }
        };
    },
    /************** Helper  ********************/
    /**
     * Add noheader=true in given URI
     * @param {string} url
     */
    addNoHeader: function(url) {
        if (url.indexOf("noheader") === -1) {
            if (url.indexOf("?") === -1) {
                url = url + "?noheader=true"; // NO I18N
            } else {
                url = url + "&noheader=true"; // NO I18N
            }
        }
        return url;
    },
    /**
     * Remove noheader=true in given URI
     * @param {string} url
     */
    removeNoHeader: function(url) {
        /**
         * Remove the noheader=true from the url
         * split method is better than regex method : http://jsben.ch/ZU5k6
         */
        url = url.replace("?noheader=true", ""); // NO I18N
        url = url.replace("&noheader=true", ""); // NO I18N
        return url;
    },
    /**
     * Show the Page loader in the HTML
     */
    showLoader: function() {
        jQuery(".page-progressbar").show(); //No I18N
    },
    /**
     * Get the Search/ Query param from the URI by Name
     * @param {string} name - Name of the param
     */
    getSearchParam: function(name) {
        return (location.search.split(name + "=")[1] || "").split("&")[0];
    },
    /**
     * Populate the SPA Item, by using the Name
     * @param {*} url
     */
    getDataByUrl: function(url) {
        url = url || "";
        var str = url.replace(window.location.origin, "");
        /** Homepage  */
        if(str.indexOf("ui/home") !== -1){ //No I18N
            return {
                module: "home", //No I18N
                page: "home" //No I18N
            };
        /** Workorder Listview */
        }else if(str.indexOf("WOListView.do") !== -1){ //No I18N
            return {
                module: "requests", //No I18N
                page: "requests-list" //No I18N
            };
            /** Workorder Details Page */
        } else if (str.indexOf("WorkOrder.do?woMode=viewWO") !== -1) {  //No I18N
            return {
                module: "requests", //No I18N
                page: "requests-details" //No I18N
            };
        } else if (str.indexOf("WorkOrder.do?woMode=newWO") !== -1) {  //No I18N
            return {
                module: "requests", //No I18N
                page: "requests-new" //No I18N
            };
        } else if (str.indexOf("WorkOrder.do?woMode=editWO") !== -1) {  //No I18N
            return {
                module: "requests", //No I18N
                page: "requests-edit" //No I18N
            };
        } else if (str.indexOf("ui/maintenances") !== -1 && str.indexOf("mode=edit") !== -1) {  //No I18N
            return {
                module: "maintenances", //No I18N
                page: "maintenances-edit" //No I18N
            };
        } else if (str.indexOf("ui/space") !== -1 && str.indexOf("mode=edit") !== -1) {  //No I18N
            return {
                module: "spaces", //No I18N
                page: "spaces-edit" //No I18N
            };    
        } else if(str.indexOf("ui/releases") !== -1 && str.indexOf("mode=edit") !== -1){
            return {
                module: "releases", //No I18N
                page: "releases-edit" //No I18N
            }; 
        }else if(str.indexOf("ui/changes") !== -1 && str.indexOf("mode=edit") !== -1){
                              return {
                                  module: "changes", //No I18N
                                  page: "changes-edit" //No I18N
                              };
        }else if(str.indexOf("ui/problems") !== -1 && str.indexOf("mode=edit") !== -1){
            return {
                module: "problems", //No I18N
                page: "problems-edit" //No I18N
            };
        }else if(str.indexOf("ui/problems") !== -1 && str.indexOf("mode=add") !== -1){
            return {
                module: "problems", //No I18N
                page: "problems-add" //No I18N
            };
        }else if(str.indexOf("ui/problems") !== -1 && str.indexOf("mode=detail") !== -1){
            return {
                module: "problems", //No I18N
                page: "problems-details" //No I18N
            };
            /** Workorder Search list view */
        }else if(str.indexOf("ui/asset") !== -1 && str.indexOf("mode=edit") !== -1){
            return {
                module: "assets", //No I18N
                page: "assets-edit" //No I18N
            }; 
        }else if(str.indexOf("ui/asset") !== -1 && str.indexOf("mode=add") !== -1){
            return {
                module: "assets", //No I18N
                page: "assets-add" //No I18N
            }; 
        }else if(str.indexOf("ui/asset") !== -1 && str.indexOf("mode=details") !== -1){
            return {
                module: "assets", //No I18N
                page: "assets-details" //No I18N
            }; 
        } else if(str.indexOf("SearchN.do") !== -1){ //No I18N
            /**
             * Get the value of the "selectName" search parameter using $spa.getSearchParam
             */
            const module = $spa.getSearchParam("selectName"); // NO I18N
            /**
             * Return an object with properties "module" and "page"
             */
            return {
                /**
                 * If the module is not an empty string, assign its value to "module",
                 * otherwise, assign an empty string.
                 */
                module : module !== "" ? module : "",
                /**
                 * If the module is not an empty string, concatenate it with "-list" and assign it to "page",
                 * otherwise, assign an empty string.
                 */
                page : module !== "" ? `${module}-list` : ""
            };
        }
        /** Solutions form edit page */
        else if(str.indexOf("ui/solutions") !== -1 && str.indexOf("mode=edit") !== -1){
            return {
                module: "solutions", //No I18N
                page: "solutions-edit" //No I18N
            };
        }else if(str.indexOf("ui/projects") !== -1){
            return {
                module: "projects", //No I18N
                page: "projects" //No I18N
            };
        }
        else {
            /** orelse return empty data */
            return {
                module: "",
                page: ""
            };
        }
    },

    /**
     * returns current URL's SPA ID
     */
    getCurrentURLId: function() {
        /** get the current url without host  */
        var currentPage = window.location.href.replace(window.location.origin, "");
        /** get Current Page route data */
        var routeData = this.routeList[currentPage] ? this.routeList[currentPage] : null;
        if(routeData && routeData.id) {
            return routeData.id;
        }
        return this.getDataByUrl(window.location.href).page;
    }
};
/**
 * Register the SPA
 */
setTimeout(function() {
    /** We don't load SPA in external frame */
    if (window.location.href.indexOf("externalframe=true") === -1 && typeof Ember == 'undefined') {
        $spa.init();
    }
}, 100);
