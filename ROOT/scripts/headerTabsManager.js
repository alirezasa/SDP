/* Manages the application's header tabs.
   => Admin >> Manage Tabs
   => MoreItems >> Manage Tabs
   => User Profile Right Panel >> Manage Tabs
   ** Allows creation, editing, deletion, enabling, disabling, and reordering of web tabs/tabs from a unified panel.
*/
var headerTabManager = {
    rmv_tab: ["admin"],
    items: sdpheader_data.modules.items,
    canAllowedDBOperation : sdpheader_data.esm_details.current_portal.canAllowedDBOperation,
    isFromHeader: false,
    isFilesLoaded: false,
    isHomeFiles: false,
    isTitleContent: false,
    isUserPersonalize : false,
    fetchMetaData: function (ele) {
        const eleId = jQuery(ele).attr("id");
        const eleDataId = jQuery(ele).attr("data-id");
        const target = jQuery('#profile-slider');
        const dataIds = {
            eleId,
            eleDataId,
            opener: eleDataId === "orgTabs", // NO I18N
            fromHeader: eleDataId === "manageTabs", // NO I18N
            target,
            isAdmin: eleDataId == "adminManageTabs",// NO I18N
            headerData: headerTabManager.headerData()
        };
        jQuery("body").trigger("click");
        jQuery("body").find("[data-id='" + dataIds.eleDataId + "']").addClass("active");

        return dataIds;
    },
    /*Admin page >> Manage Tabs method*/
    renderTabsHbs: function (isReload, isFromHeader, isTitleContent, sele_ctor) {
        if (this.isLoaded && !isReload) {
            return;
        }
        if (!headerTabManager.isFilesLoaded || headerTabManager.isHomeFiles) {
            headerTabManager.invokeLoader();
        }
        let savedData = sdp_app.themes.organize_tabs ? jQuery.extend({}, sdp_app.themes.organize_tabs) : null;
        if (savedData !== null) {
            savedData.selectedTabs = savedData.selectedTabs.filter(function (i, index) {
                return savedData.selectedTabs.indexOf(i) === index;
            });
        }
        const header_data = headerTabManager.headerData();
        const header_data_ids = headerTabManager.headerDataids();
        const defaultData = headerTabManager.defaultDataobj();
        let selector = sele_ctor; selID = "adminManageTabs"; // NO I18N
        let tabsPanel = jQuery(selector);
        const templateData = {
            modules: [],
            isUserPersonalize: false,
            isHidden: false,
            isTitleContent,
            isFromHeader ,
            licenseType: sdp_app.licenseType
        };
        /*  To check the data is not empty */
        if (savedData == null) {
            templateData.IS_USER_CUSTOMIZE_TABS_ENABLED = false;
            templateData.isHidden = true;
            templateData.modules = header_data.map(item => ({ ...item, enabled: true }));
            headerTabManager.isTitleContent = templateData.isTitleContent;
            renderhbs(selector, 'organize-tabs', templateData, false, 'tabs'); // NO I18N
            tabsPanel.find("#create-new-webtab").attr("data-id", selID); 
            tabsPanel.find(".newwebtabedit").attr("data-id",selID);
            tabsPanel.find("#create-new-webtab").toggleClass('hide', !headerTabManager.canAllowedDBOperation); // NO I18N
            if (sdp_app.IS_SDP) {
                headerTabManager.populateTabsList("#admin_tablisttype"); // NO I18N
                headerTabManager.init();
            }
            initTooltip(tabsPanel);
            return;
        }
        if ((defaultData.allow_user_toCustomizeTabs == true) || (sdpToJSON(savedData) !== sdpToJSON(defaultData))) {
            let selected_data = headerTabManager.getFormattedTabsData(savedData);
            let selected_dataids = selected_data.map(item => item.id);
            templateData.modules = selected_data;
            templateData.IS_USER_CUSTOMIZE_TABS_ENABLED = savedData.allow_user_toCustomizeTabs;
            if (sdpToJSON(header_data_ids) == sdpToJSON(selected_dataids)) {
                templateData.isHidden = true;
            }
            if (sdpToJSON(savedData.selectedTabs) !== sdpToJSON(header_data_ids)) {
                templateData.isHidden = false;
            }

            if (!savedData.hasOwnProperty('deSelectedTabs') && sdpToJSON(selected_dataids) == sdpToJSON(header_data_ids) ) {
               templateData.isHidden = true;
            }   
            
            renderhbs(selector, 'organize-tabs', templateData, false, 'tabs'); // NO I18N
        } else {
            templateData.IS_USER_CUSTOMIZE_TABS_ENABLED = false;
            templateData.isHidden = true;
            templateData.modules = header_data.map(item => ({ ...item, enabled: true }));
            renderhbs(selector, 'organize-tabs', templateData, false, 'tabs'); // NO I18N
        }
        /* Require to use globally */
        headerTabManager.isFromHeader = templateData.isFromHeader;
        headerTabManager.isTitleContent = templateData.isTitleContent;
        initTooltip(tabsPanel);
        tabsPanel.find("#create-new-webtab").attr("data-id", selID)
        tabsPanel.find(".newwebtabedit").attr("data-id",selID);
        tabsPanel.find("#create-new-webtab").toggleClass('hide', !headerTabManager.canAllowedDBOperation); // NO I18N
        if (sdp_app.IS_SDP) {
            headerTabManager.populateTabsList("#admin_tablisttype"); // NO I18N
            headerTabManager.init();
        }
    },
    /* Closes the currently open panel. */
    closePanel: function (tabsPanel, ele) {
        tabsPanel.dialog("close"); // No I18N
        jQuery(ele).removeClass('active');
        jQuery(window).off('resize.tabsPanel'); //NO I18N
    },
    /* To toggle the tabs list type dropdown visibility */
    togglePanel: function () {
        let listType = jQuery('#admin_tablisttype');
        if (listType.is(':visible')) {
            listType.slideUp();
        }
    },
    /**
     * Retrieves the current position of the panel.
     * @returns {Object} An object containing the x and y coordinates of the panel's position.
     */
    getPanelPosition: function (eleData) {
        return {
            my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
            of: eleData.target
        };
    },
    /*  * Sets up the panel.
        * This function initializes and configures the panel with the necessary
        * settings and data. **/
    setupPanel: function (panel, eleData, userTempData, ele, tabsPanel, tabselector, dataID) {
        panel.show().panelSlider({
            width: 550,
            header: false,
            placement: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            position: eleData.opener ? headerTabManager.getPanelPosition(eleData) : undefined,
            dialogClass: "tabui-rightpanel", // NO I18N
            modal: !eleData.opener,
            open: function () {
                renderhbs(tabselector, 'organize-tabs', userTempData, false, 'tabs'); // NO I18N
                tabsPanel.attr("data-id", eleData.eleDataId);
                tabsPanel.find("#create-new-webtab").attr("data-id", eleData.eleDataId);
                tabsPanel.find(".newwebtabedit").attr("data-id",eleData.eleDataId);
                if(eleData.isAdmin){
                    headerTabManager.populateTabsList("#admin_tablisttype"); // NO I18N
                }else{
                    headerTabManager.populateTabsList("#tablisttype"); // NO I18N
                }
                headerTabManager.init();
                tabsPanel.find("#create-new-webtab").toggleClass('hide', !headerTabManager.canAllowedDBOperation); // NO I18N
                setTimeout(() => jQuery("#close-profile-slider").hide(), 600);
                jQuery('body').addClass('oh-i'); // NO I18N
                initTooltip(panel);
                let selector = jQuery("#tabsList"); // NO I18N
                selector.css("max-height", selector.parent().innerHeight() + "px"); // NO I18N
                selector.removeClass("pro-sortlist"); // NO I18N
                headerTabManager.recalculateTabsHeightOnResize();
            },
            close: function () {
                tabsPanel.find(dataID).removeAttr("data-id"); // NO I18N
                tabsPanel.html("");
                setTimeout(() => jQuery("#close-profile-slider").show(), 300);
                jQuery(ele).removeClass("active");
                jQuery(ele).blur();
                jQuery('#tabsList').sortable('enable'); //NO I18N
                jQuery(this).dialog('destroy'); //NO I18N
                jQuery(window).off('resize.tabsPanel'); //NO I18N
                jQuery('body').removeClass('oh-i'); //NO I18N
            }
        });
    },
    /**
     * Attaches a resize listener to dynamically recalculate the max-height
     * of the #tabsList element whenever the window size changes,
     * such as when the DevTools are opened or the browser window is resized.
     */
    recalculateTabsHeightOnResize : function(){
        let prevHeight = jQuery(window).height();

        jQuery(window).off('resize.tabsPanel').on('resize.tabsPanel', function () { //NO I18N
            let newHeight = jQuery(window).height();
            if (newHeight !== prevHeight) {
                prevHeight = newHeight;
                let parentHeight = jQuery("#tabsList").parent().innerHeight();
                let finalHeight = parentHeight > 50 ? parentHeight : 100;
                jQuery("#tabsList").css("max-height", finalHeight + "px"); // NO I18N
            }
        });
    },
    /**
     * Prepares temporary data for the user.
     * This function is responsible for setting up any temporary data
     * that the user might need  **/
    prepareUserTempData: function (eleData) {
        return {
            modules: [],
            isUserPersonalize: true,
            isHidden: false,
            isTitleContent: !eleData.isAdmin
        };
    },
    /* Opens a panel in the user interface and Enable/disable Tabs in the panel */
    openPanel: function (event, ele,filterButtonText) {
        /* To prevent conflicts with other click event handlers on the same element */
        event.stopImmediatePropagation();
        let tabsPanel = jQuery("#customize_tabs");
        if (jQuery(ele).hasClass("active")) {
            headerTabManager.closePanel(tabsPanel, ele);
            return;
        }
        if (!headerTabManager.isFilesLoaded || headerTabManager.isHomeFiles) {
            headerTabManager.invokeLoader();
        }
        headerTabManager.togglePanel();
        let eleData = headerTabManager.fetchMetaData(ele);
        let userTempData = headerTabManager.prepareUserTempData(eleData, false);
        userTempData.licenseType= sdp_app.licenseType;
        let headerIds = headerTabManager.headerDataids(), techData;
        if( filterButtonText == undefined){
            filterButtonText = translate("webtab.tab.all");
        }
        if (eleData.fromHeader) {
            userTempData.isFromHeader = true;
            userTempData.isUserPersonalize = false;
            techData = sdp_app.themes.organize_tabs ? jQuery.extend({}, sdp_app.themes.organize_tabs) : null;
            if (techData == null) {
                userTempData.IS_USER_CUSTOMIZE_TABS_ENABLED = false;
                userTempData.modules = eleData.headerData;
                userTempData.modules.forEach(item => {
                    item.enabled = true;
                });
                userTempData.isHidden = true;
                headerTabManager.isTitleContent = userTempData.isTitleContent;
                headerTabManager.setupPanel(tabsPanel, eleData, userTempData, ele, tabsPanel, '#customize_tabs', "#manageTabs"); // NO I18N
                headerTabManager.filterTabs(filterButtonText,'#tabsList',"#filterBtn",'noMatchesMessage'); // NO I18N
                if (sdp_app.IS_SDP) {
                    headerTabManager.init();
                }
                initTooltip(tabsPanel);
                return;
            }
        }
        else {
            userTempData.isFromHeader = false;
            techData = headerTabManager.getUserPersonalizedOrganizeTabsData();
        }
        if(!eleData.fromHeader){
            eleData.fromHeader = eleData.isAdmin;
        }
        if (!jQuery.isEmptyObject(techData)) {
            userTempData.modules = headerTabManager.getFormattedTabsData(techData);
            let selected_dataids = userTempData.modules.map(item => item.id);
            let globalData = sdp_app.themes.organize_tabs;
            globalData = headerTabManager.fetchglobalData();
            if(techData.hasOwnProperty("allTabs")){
                delete techData.allTabs;
            }
           
            if (eleData.fromHeader && sdpToJSON(headerIds) == sdpToJSON(globalData.selectedTabs)) {
                userTempData.isHidden = true;
            }
            if (sdpToJSON(techData.selectedTabs) !== sdpToJSON(headerIds)) {
                userTempData.isHidden = false;
            }
            if (!techData.hasOwnProperty('deSelectedTabs') && sdpToJSON(selected_dataids) == sdpToJSON(headerIds)) {
               userTempData.isHidden = true;
            }  
            techData.allow_user_toCustomizeTabs = globalData.allow_user_toCustomizeTabs ;
            if ( !eleData.fromHeader &&  headerTabManager.sortObj(techData) == headerTabManager.sortObj(globalData)) {
                userTempData.isHidden = true
            }
         
        }
        else {
            let savedData = jQuery.extend({}, sdp_app.themes.organize_tabs);
            userTempData.modules = headerTabManager.getFormattedTabsData(savedData);
            userTempData.isHidden = true;
            userTempData.allow_user_toCustomizeTabs = jQuery("#header_allowCustomizeTabs").prop("checked") ? true : false; ///NO I18N
        }
        userTempData.IS_USER_CUSTOMIZE_TABS_ENABLED = sdp_app.themes.organize_tabs.allow_user_toCustomizeTabs;
        headerTabManager.isFromHeader = userTempData.isFromHeader;
        headerTabManager.isTitleContent = userTempData.isTitleContent;
        headerTabManager.isUserPersonalize =  userTempData.isUserPersonalize;
        headerTabManager.setupPanel(tabsPanel, eleData, userTempData, ele, tabsPanel, '#customize_tabs', "#manageTabs"); // NO I18N
        if( filterButtonText == undefined){
            filterButtonText = translate("webtab.tab.all");
        }    
        headerTabManager.filterTabs(filterButtonText,'#tabsList',"#filterBtn",'noMatchesMessage'); // NO I18N
        headerTabManager.opendialogCheck();
    },
    /* Invokes the loader to start loading process */
    invokeLoader: function () {
        let jsFiles = ["/scripts/manage_tabs_min.js", "/scripts/hbs-template-tabs.js"]; //NO I18N
        let homejsFiles = ["/scripts/home_scripts.js", "/scripts/hbs-template-home.js"]; //NO I18N
        let headerFiles;
        let toRemove = homejsFiles.concat("/scripts/hbs-template-tabs.js"); // NO I18N
        if (headerTabManager.isHomeFiles) {
            headerTabManager.isHomeFiles = false;
            headerFiles = homejsFiles;
        } else {
            headerFiles = jsFiles.concat(homejsFiles);
        }
        if (window.location.hash.includes("/manage-tabs")) {
            headerFiles = headerFiles.filter(jfile => !jsFiles.includes(jfile));
        }
        if (sdp_app.IS_DEVELOPMENT_MODE) {
            toRemove = ["/scripts/home.js", "/scripts/dashboard_common.js", "/scripts/SelfServiceCustomization_TechnicianScript.js"]; // NO I18N
            headerFiles = ["/scripts/headerTabsManager.js", ...toRemove]; // NO I18N
            if (window.location.hash.includes("/manage-tabs")) { // NO I18N
                headerFiles = headerFiles.filter(file => file !== "/scripts/headerTabsManager.js"); // NO I18N
            }
        }
        if (window.location.pathname == "/ui/home") { // NO I18N
            headerFiles = headerFiles.filter(item => !toRemove.includes(item));
        }
        ResourceLoader({
            js: headerFiles,
            success: function () {
                headerTabManager.isFilesLoaded = true;
                if(headerTabManager.isHomeFiles){
                    headerTabManager.getGlobalPersonalizationId("organize_tab");// NO I18N
                }
                headerTabManager.isHomeFiles = false;
            }
        });
    },
    /* Initialization */
    init: function () {
       let isUserPersonalize = headerTabManager.isUserPersonalize;
        jQuery("#admin_tabsList").sortable({
            placeholder: "ui-state-highlight",  //No I18N
            start: function (e, ui) {
                ui.placeholder.height(ui.item.height()); 
            },
            stop: function (e, ui) {
                headerTabManager.resetTabHandle("#admin_resetTabs",isUserPersonalize);  // NO I18N
            },
            scrollSpeed: 10
        });

        jQuery("#tabsList").sortable({
            placeholder: "ui-state-highlight",  //No I18N
            start: function (e, ui) {
                ui.placeholder.height(ui.item.height());
            },
            stop: function (e, ui) {
               headerTabManager.resetTabHandle("#resetTabs",isUserPersonalize); // NO I18N
            },
            scrollSpeed: 10
        });
        this.isLoaded = true;

        /* Initialize Bind events to the header tab manager  */
        headerTabManager.bindTabEvents("#customize_tabs", "#tablisttype", "#filterBtn", "#tabsList", "noMatchesMessage",isUserPersonalize); // No I18N
        headerTabManager.bindTabEvents("#manage_tab", "#admin_tablisttype", "#admin_filterBtn", "#admin_tabsList", "admin_noMatchesMessage",isUserPersonalize); // No I18N
    },
    /** Reinitializes sortable method */
    sortinit: function (tabListSelector) { 
        let isUserPersonalize = headerTabManager.isUserPersonalize;
        let resetTab = tabListSelector.includes("admin") ?"#admin_resetTabs" : "#resetTabs"; //No I18N
            jQuery(tabListSelector).sortable({
                placeholder: "ui-state-highlight",  //No I18N
                items: 'li:not([webtabval=true])', // No I18N
                start: function (e, ui) {
                    ui.placeholder.height(ui.item.height()); 
                },
                stop: function (e, ui) {
                   headerTabManager.resetTabHandle(resetTab,isUserPersonalize);
                },
                scrollSpeed: 10
            });
    },
    /* Binds events to the tab elements */
    bindTabEvents: function (tabSelector, listTypeSelector, dropdownBtnSelector, tabListSelector, msgselector,isUserPersonalize) {
        let tabElement = jQuery(tabSelector);
        tabElement.off("click.tabs").on("click.tabs", "#create-new-webtab", function (e) { // No I18N 
            let filter = jQuery("#filterBtn") ,filterButtonText;
            if(filter.length !== 0){
               filterButtonText = filter.contents().get(1).nodeValue.trim();
            }
            let dataID = jQuery(e.currentTarget).data('id');; // No I18N
            let isFromUser = dataID == "orgTabs"; // No I18N
            let isAdmin = dataID == "adminManageTabs"; // No I18N
            $home_page.openTabConfigSlide({ isWebTab: true,filterButtonText:filterButtonText,isFromUser: isFromUser,isAdmin:isAdmin,dataID:dataID });
        }).on("click.tabs", ".newwebtabedit", function () { // No I18N
            $home_page.editHomeTab(this, { isWebTab: true });
        }).on("click.tabs", ".newwebtabdelete", function () { // No I18N
            $home_page.deleteHomeTab(this, { isWebTab: true });
        }).on("click.tabs", "li > a", listTypeSelector, function (e) { // No I18N
            e.preventDefault();
            headerTabManager.filterTabs(this, tabListSelector,dropdownBtnSelector,msgselector);
        }).on("click.tabs", `${listTypeSelector} a`, function () { // No I18N
            jQuery(dropdownBtnSelector).contents().get(1).nodeValue = jQuery(this).text();
        }).on("click.tabs", ".toggle-button", function (e) { // No I18N
            headerTabManager.togglePreview(e, this,isUserPersonalize);
        });
    },
    /**
     * Toggles the preview state for a given element.
    */
    togglePreview : function(e,that,isUserPersonalize) {
        e.preventDefault();
        let container = jQuery(that).closest('.toggle-container'); // No I18N
        let button = jQuery(that);
        let span = container.find('span');
        let webtabIcons = container.siblings().find('.webtab-icons');
        let textOverflow = container.siblings().find('.disp-ib.max-w250px.pl10.text-overflow');
        
        let spanele = button.closest('li').attr("webtabVal") === 'false' ? span : (!sdp_user.ROLES.includes('SDAdmin') ? span : span.eq(2)); // No I18N
        let isPreview = button.attr('previewstatus') === 'true';
        
        container.addClass('hidethis'); // No I18N
        spanele.toggleClass('preview2-hide', isPreview).toggleClass('preview2', !isPreview).toggleClass('top0', !isPreview).uitooltip( // No I18N
            { content: translate("common.label.click", [translate(!isPreview ? "sdp.home.hide" : "sdp.common.navigation.show")]) }); // No I18N
        
        button.attr('previewstatus', isPreview ? 'false' : 'true'); 
        webtabIcons.toggleClass('opac6', isPreview); // No I18N
        webtabIcons.find('span').toggleClass("opac6", isPreview);// No I18N
        textOverflow.toggleClass('text-linethrough', isPreview); // No I18N
        let selector = jQuery(that).closest("div#customize_tabs").attr("data-id"); // No I18N
        let resetTab = selector !== undefined ? "#resetTabs" : "#admin_resetTabs"; // No I18N
        headerTabManager.resetTabHandle(resetTab,isUserPersonalize);
    },
    /* Filters the tabs based on certain criteria. */
    filterTabs: function (that, tabListSelector, dropdownBtnSelector,msgselector) {
        let selectedValue = jQuery(that).text().trim();
        if(selectedValue ==""){
            selectedValue = that;
            jQuery(dropdownBtnSelector).contents().get(1).nodeValue= that; 
        }
        let tabsEle = jQuery(tabListSelector);
        let reorderIcon = tabsEle.find(".reordericon");
        let  webtabIcon = tabsEle.find('.webtab-icons');
        let tabs = jQuery(tabListSelector + ' li');
        let filtername = translate("all.entity.templates", [translate("webtab.tab")]);
        let msgDiv = jQuery("#" + msgselector);
        const showTabs = {
            [filtername]: (tab) => tab.attr('id').startsWith('home-view'),  // No I18N
            'default': () => true  // No I18N
        };
        let condition = showTabs[selectedValue] || showTabs['default'];
        let count = 0;
        tabs.each(function () {
            let tab = jQuery(this);
            let shouldShow = condition(tab);
            tab.toggle(shouldShow);
            if (shouldShow) { count++; }
        });

        if (count === 0) {
            if (msgDiv.length === 0) {
                tabsEle.after('<div id="' + msgselector + '"><div class="tc m10 noitem"><span>' + translate("sdp.search.notfound") + '</span></div></div>');
            } else {
                msgDiv.show();
            }
        } else {
            msgDiv.hide();
            if (selectedValue === filtername ) {
                tabsEle.sortable("destroy"); //No I18N
                headerTabManager.sortinit(tabListSelector);
                reorderIcon.removeClass('show').addClass('hide'); // No I18N
                webtabIcon.removeClass('pl10'); // No I18N
                tabsEle.find('li').addClass("cur-def");  // No I18N
            } 
            else if (selectedValue === translate("webtab.tab.all")) {
                tabsEle.sortable("destroy"); //No I18N
                headerTabManager.init();
                reorderIcon.removeClass('hide').addClass('show'); // No I18N
                webtabIcon.addClass('pl10'); // No I18N
                tabsEle.find('li').removeClass("cur-def");  // No I18N
            }
        }
    },
    /* Populates the list of tabs */
    populateTabsList: function (tabselector) {
        const tabTypes = [
            { name: translate("webtab.tab.all") },
            { name: translate("all.entity.templates", [translate("webtab.tab")]) }
        ];
        let tabList = jQuery(tabselector);
        tabList.empty();

        let listItems = tabTypes.map(tab =>
            `<li><a href="/">${e_html(tab.name)}</a></li>`
        ).join("");
        tabList.append(listItems);
    },
    /* To get user personalized data*/
    getUserPersonalizedOrganizeTabsData: function () {
        let usertabsData = sdp_user.CLIENT_CONF.organizetabs;

        if (!jQuery.isEmptyObject(usertabsData)) {

            //  To remove duplicate tab names in header
            usertabsData.selectedTabs = usertabsData.selectedTabs.filter(function (k, index) {
                return usertabsData.selectedTabs.indexOf(k) === index;
            });
            usertabsData.deSelectedTabs = usertabsData.deSelectedTabs.filter(function (m, index) {
                return usertabsData.deSelectedTabs.indexOf(m) === index;
            });

            let hometab = "home"; // NO I18N
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
    headerData: function () {
        headerTabManager.items = manage_Tabs.data;
        let headerdata = headerTabManager.items.filter(function (item) {
            return headerTabManager.rmv_tab.indexOf(item.id) === -1;
        });
        return headerdata;
    },
    headerDataids: function () {
        let headerdata = headerTabManager.headerData();
        let headerids = [];
        headerdata.forEach(item => headerids.push(item.id));
        return headerids;
    },
    headerModlskeys: function () {
        let headerData = headerTabManager.headerData();
        let headerIds = headerTabManager.headerDataids();
        let headerKeys = [];
        headerData.forEach(item => headerKeys.push(item.i18n_key));
        let modlsKeys = {};
        headerIds.forEach(function (k, v) {
            { this[k] = headerKeys[v] };
        }, modlsKeys);
        return modlsKeys;
    },
    headerDispName() {
        const headerData = headerTabManager.headerData();
        return headerData.reduce((acc, item) => {
        acc[item.id] = item.disp_name ? item.disp_name : translate(item.i18n_key);
        return acc;
        }, {});
    },
    defaultDataobj: function () {
        let defaultfiltdata = headerTabManager.headerData();
        let default_data = defaultfiltdata.map(item => item.id);
        let savedData = { selectedTabs: [] };
        if (sdp_app.themes.hasOwnProperty('organize_tabs')) {
            savedData.allow_user_toCustomizeTabs = sdp_app.themes.organize_tabs.allow_user_toCustomizeTabs;
        }
        else {
            savedData.allow_user_toCustomizeTabs = jQuery("#allowCustomizeTabs").prop("checked") ? true : false; //NO I18N
        }
        default_data.forEach(id => savedData.selectedTabs.push(id));

        return savedData;
    },
    adminSettingsData: function () {
        let adminSettings = jQuery.extend({}, sdp_app.themes.organize_tabs);
        let selecData = headerTabManager.getFormattedTabsData(adminSettings);
        return selecData;
    },
    getGlobalPersonalizationId: function (key) {
        if ((typeof (global_personalization) == "undefined") || global_personalization[key] == undefined) {
            getGlobalPersonalization(key);
        }
        return (typeof (global_personalization) != "undefined") ? (global_personalization[key] ? global_personalization[key] : 0) : 0; //No I18N
    },
    /* To fetch [{i18n_key: 'sdp.header.home', id: 'home', url: '/ui/home?view_type=my_view',enabled: true}] formatted data to render */
    getFormattedTabsData: function (cloneData) {
        let EntitsData = headerTabManager.headerData();
        let EntitsIds = headerTabManager.headerDataids();
        let EntitsKeys = headerTabManager.headerModlskeys();
        let modlsDispName = headerTabManager.headerDispName();
        // Enable home tab if  home tab  is not present
        if (!cloneData.selectedTabs.includes("home")) {
            cloneData.selectedTabs.unshift("home"); // No I18N
        }
        let selectedEntis = cloneData.selectedTabs
            .filter(key => EntitsIds.includes(key))
            .map(key => ({ id: key, enabled: true, i18n_key: EntitsKeys[key] , disp_name: modlsDispName[key]}));

        let deselectedEntis = [];
        let newTabsIds = cloneData.selectedTabs;

        if (cloneData.hasOwnProperty('deSelectedTabs')) {
            if (cloneData.deSelectedTabs.includes('\"')) {
                cloneData.deSelectedTabs = JSON.parse(cloneData.deSelectedTabs);
            }
            deselectedEntis = cloneData.deSelectedTabs
                .filter(key => EntitsIds.includes(key))
                .map(key => ({ id: key, enabled: false, i18n_key: EntitsKeys[key] , disp_name: modlsDispName[key] }));

            newTabsIds = newTabsIds.concat(cloneData.deSelectedTabs);
        }

        let newEntits = EntitsData
            .filter(item => !newTabsIds.includes(item.id))
            .map(item => ({ id: item.id, enabled: true, i18n_key: EntitsKeys[item.id] , disp_name: modlsDispName[item]}));


        let selectedData = [];
        selectedData = selectedEntis.concat(newEntits)
        selectedData = cloneData.hasOwnProperty('deSelectedTabs') ? selectedData.concat(deselectedEntis) : selectedData; //NO I18N
        return selectedData;
    },
    /* To fetch modules as data Object */
    organizedTabsSavedData: function (userSavedData, cl_oneData) {

        delete cl_oneData.allTabs;
        let headData = headerTabManager.headerData();
        let headIds = headerTabManager.headerDataids();
        let EntisKeys = headerTabManager.headerModlskeys();
        let modlsDispName = headerTabManager.headerDispName();
        let selectedEntis = cl_oneData.selectedTabs
            .filter(key => headIds.includes(key))
            .map(key => ({ id: key, enabled: true, i18n_key: EntisKeys[key] , disp_name: modlsDispName[key]}));

        let deselctedEntis = [];

        if (cl_oneData.hasOwnProperty('deSelectedTabs')) {
            deselctedEntis = cl_oneData.deSelectedTabs
                .filter(key => headIds.includes(key))
                .map(key => ({ id: key, enabled: false, i18n_key: EntisKeys[key], disp_name: modlsDispName[key] }));
        }

        let newEntisIds = cl_oneData.selectedTabs;
        if (cl_oneData.hasOwnProperty('deSelectedTabs')) {
            newEntisIds = newEntisIds.concat(cl_oneData.deSelectedTabs);
        }

        let newEntisArr = headData
            .filter(item => !newEntisIds.includes(item.id))
            .map(item => ({ id: item.id, enabled: true, i18n_key: EntisKeys[item.id], disp_name: modlsDispName[item] }));

        let slctedData = selectedEntis.concat(newEntisArr);

        let EntisData = {
            selectedTabs: slctedData.map(item => item.id),
            deSelectedTabs: deselctedEntis.length > 0 ? deselctedEntis.map(item => item.id) : []
        };

        if (sdpToJSON(userSavedData) == sdpToJSON(EntisData)) {
            headerTabManager.nothingToSave();
            jQuery("#resetTabs").show();
            return;
        }
        else {
            return userSavedData;
        }
    },
    /**
     * Processes a sorted array of element IDs and updates user-saved data
     * based on the preview status of each element.
     *
     * @param sortedArray - An array of strings representing the IDs of elements to process.
     * @returns An object containing two arrays:
     *          - `selectedTabs`: IDs of elements marked with a preview status of 'true'.
     *          - `deSelectedTabs`: IDs of elements marked with a preview status of 'false'.
    */
     processSortedArray : function(selector) {
        const savedData = {
            selectedTabs: [],
            deSelectedTabs: []
        };
        let sorted_Array = [];
        jQuery("#" + selector).sortable();
        sorted_Array = jQuery("#" + selector).sortable("toArray"); //No I18N
        /** Handles actions triggered from the 'All WebTabs' filter */
        let filterSel = selector.includes("admin") ? "#admin_filterBtn" : "#filterBtn"; //No I18N
        if(jQuery(filterSel).length !== 0) {
            let filterButtonText = jQuery(filterSel).contents().get(1).nodeValue;
            if (filterButtonText === translate("all.entity.templates", [translate("webtab.tab")])) {
            sorted_Array = jQuery("#" + selector).find("[webtabval=true]").toArray().reduce((acc, el) => (acc.push(el.id), acc), sorted_Array);
            }   
        }
        sorted_Array.forEach(function (eleId) {
            let element = jQuery("#" + eleId);
            let dataId = element.data('id'); // No I18N

            let previewStatus = element.find('.toggle-button').attr('previewstatus');
            previewStatus = (dataId == 'home') ? 'true' : previewStatus; // No I18N
            if (previewStatus === 'true') {
                savedData.selectedTabs.push(dataId);
            } else if (previewStatus === 'false') {
                savedData.deSelectedTabs.push(dataId);
            }
        });
    
        return savedData;
    },
    /* Global settings save function*/
    globalsave: function (ele) { 
        if(sdp_app.IS_DEMO_BUILD && sdp_user.LOGINNAME != "administrator") { //No I18N
            disableForDemo();
            return;
        }
        if(headerTabManager.canAllowedDBOperation == false) {
            showalert('failure', translate("mdh.restricted.portals.cud.msg"),'isAutoHide = false');//No I18N
            return;
        } 
        let selector = jQuery(ele).data('name'); // No I18N
        let globalSavedData = headerTabManager.processSortedArray(selector);
       
        globalSavedData.selectedTabs = globalSavedData.selectedTabs.filter(function (item) {
            return item !== undefined;
        });
        globalSavedData.deSelectedTabs = globalSavedData.deSelectedTabs.filter(function (item) {
            return item !== undefined;
        });
        let cloneData = sdp_app.themes.organize_tabs ? jQuery.extend({}, sdp_app.themes.organize_tabs) : null;
        let data_obj = headerTabManager.defaultDataobj();
        
        let allowsel = jQuery(ele).closest('#customize_tabs').length >0? "header_allowCustomizeTabs":"allowCustomizeTabs"; // No I18N
        let allowuserTabs = jQuery("#"+allowsel);
        globalSavedData.allow_user_toCustomizeTabs = jQuery("#"+allowsel).prop("checked");

        if (jQuery.isEmptyObject(cloneData)) {
            if (globalSavedData.deSelectedTabs.length == 0) {
                delete globalSavedData.deSelectedTabs;
            }
            if (globalSavedData.allow_user_toCustomizeTabs == false) {
                if (globalSavedData.allow_user_toCustomizeTabs == false &&
                    headerTabManager.sortObj(globalSavedData) == headerTabManager.sortObj(data_obj)) {
                    headerTabManager.nothingToSave();
                    return;
                }
                else {
                    headerTabManager.personalize(globalSavedData);
                }
            }
            else {
                if (globalSavedData.allow_user_toCustomizeTabs == false &&
                    headerTabManager.sortObj(globalSavedData) == headerTabManager.sortObj(data_obj)) {
                    headerTabManager.nothingToSave();
                    return;
                }
                else {
                    headerTabManager.personalize(globalSavedData);
                }
            }
        }
        else if (!jQuery.isEmptyObject(cloneData) && cloneData.allow_user_toCustomizeTabs == globalSavedData.allow_user_toCustomizeTabs &&
            headerTabManager.sortObj(globalSavedData) == headerTabManager.sortObj(cloneData) && headerTabManager.sortObj(globalSavedData) == headerTabManager.sortObj(data_obj)) {
            headerTabManager.nothingToSave();
            jQuery("#resetTabs").hide();
            return;
        }
        else if (!jQuery.isEmptyObject(cloneData) && cloneData.allow_user_toCustomizeTabs == globalSavedData.allow_user_toCustomizeTabs &&
            headerTabManager.sortObj(globalSavedData) == headerTabManager.sortObj(cloneData)) {
            headerTabManager.nothingToSave();
            jQuery("#resetTabs").show();
            return;
        }
        else {
            let selectedData = headerTabManager.getFormattedTabsData(cloneData);
            let selectedDataIds = selectedData.map(item => item.id);
            let adminData = { selectedTabs: [] };
            adminData.allow_user_toCustomizeTabs = allowuserTabs.prop("checked") ? true : false;  //No I18N
            adminData.selectedTabs = selectedDataIds;
            if (cloneData.allow_user_toCustomizeTabs == globalSavedData.allow_user_toCustomizeTabs) {
                if (globalSavedData.deSelectedTabs.length == 0) {
                    delete globalSavedData.deSelectedTabs;
                }
                if ( headerTabManager.sortObj(globalSavedData) === headerTabManager.sortObj(cloneData) && headerTabManager.sortObj(adminData) === headerTabManager.sortObj(globalSavedData)) {
                    headerTabManager.nothingToSave();
                    return;
                }
                else if (headerTabManager.sortObj(globalSavedData) === headerTabManager.sortObj(cloneData)) {
                    headerTabManager.nothingToSave();
                    jQuery("#resetTabs").show();
                    return;
                }
                else {
                    headerTabManager.personalize(globalSavedData);
                }
            }
            else {
                headerTabManager.personalize(globalSavedData);
            }
        }
    },
    /* * Personalizes the global settings. */
    personalize: function (savedData) {
        let isUserPersonalize = false;
        let saveTab = headerTabManager.isTitleContent ? "#headertabs-save" : "#savetabs"; // No I18N
        jQuery(saveTab).prop("disabled", false).val(translate("sdp.admin.common.saving"));  //NO I18N
        let sdpData = headerTabManager.defaultDataobj();
        let getData = sdp_app.themes.organize_tabs ? jQuery.extend({}, sdp_app.themes.organize_tabs) : null;
        let pers_obj = {
            key: 'organize_tab', //No I18N
            data: savedData,
            success: function () {
                jQuery(saveTab ).prop("disabled", false).val(translate("sdp.common.save")); //No I18N
                if (!jQuery.isEmptyObject(getData) && (savedData.allow_user_toCustomizeTabs == getData.allow_user_toCustomizeTabs) && sdpToJSON(savedData) == sdpToJSON(sdpData)) {
                    window.showalert('success', translate("admin.organizetabs.restored"), 'isAutoHide=true');//No I18N
                }
                else {
                    showalert('success', translate("admin.organizetabs.save"), 'isAutoHide=true');//No I18N
                }
                let resetTab = headerTabManager.isTitleContent ? "#resetTabs" : "#admin_resetTabs"; // No I18N
                headerTabManager.resetTabHandle(resetTab,isUserPersonalize);
            }
        };
        setGlobalPersonalization(pers_obj);
        setTimeout(function () {
            window.location.reload(true);
        }, 1000);
    },
    /* User personalization Tabs UI Panel save function*/
    usersave: function (ele) {
        /*To get sorted li elements ids as an array */
        let selector = jQuery(ele).data('name'); // No I18N
        let userSavedData = headerTabManager.processSortedArray(selector);

        userSavedData.selectedTabs = userSavedData.selectedTabs.filter(function (item) {
            return item !== undefined;
        });
        userSavedData.deSelectedTabs = userSavedData.deSelectedTabs.filter(function (item) {
            return item !== undefined;
        });
        userSavedData.selectedTabs = userSavedData.selectedTabs.filter(itm => !userSavedData.deSelectedTabs.includes(itm));
        let cl_oneData = sdp_user.CLIENT_CONF.organizetabs;
        if (!jQuery.isEmptyObject(cl_oneData)) {
            delete cl_oneData.allTabs;
        }
        if (jQuery.isEmptyObject(cl_oneData) ||  userSavedData.hasOwnProperty('deSelectedTabs') && userSavedData.deSelectedTabs.length == 0) {
            if (jQuery.isEmptyObject(cl_oneData) && userSavedData.hasOwnProperty('deSelectedTabs') && userSavedData.deSelectedTabs.length == 0 && (sdpToJSON(userSavedData.selectedTabs) === sdpToJSON(sdp_app.themes.organize_tabs.selectedTabs))) {
                headerTabManager.nothingToSave();
                jQuery("#resetTabs").hide();
                return;

            }
            else if (!jQuery.isEmptyObject(cl_oneData)  && headerTabManager.sortObj(userSavedData) == headerTabManager.sortObj(cl_oneData)) {
                headerTabManager.nothingToSave();
                return;
            }
            else {
                ClientUtil.addUserPersonalization("organizetabs", userSavedData);//No I18N
                headerTabManager.saveData();
            }
        }
        else if (!jQuery.isEmptyObject(cl_oneData)  &&
            headerTabManager.sortObj(userSavedData) == headerTabManager.sortObj(cl_oneData)) {
            headerTabManager.nothingToSave();
            return;
        }
        else if (!jQuery.isEmptyObject(cl_oneData) && headerTabManager.sortObj(userSavedData) == headerTabManager.sortObj(cl_oneData)) {
            headerTabManager.nothingToSave();
            return
        }
        else {
            let user_SavedData = headerTabManager.organizedTabsSavedData(userSavedData, cl_oneData);
            if(user_SavedData !== undefined){
              ClientUtil.addUserPersonalization("organizetabs",user_SavedData);//No I18N
              headerTabManager.saveData();
            }
        }
    },
    /* user personalized alert */
    saveData: function () {
        let isUserPersonalize = true;
        let resetTab = "#resetTabs"; // NO I18N
        headerTabManager.resetTabHandle(resetTab,isUserPersonalize);
        window.showalert('success', translate("admin.organizetabs.save"), 'isAutoHide=true');//No I18N
        setTimeout(function () {
            window.location.reload(true);
        }, 1000);
        return;
    },
    /*User personalization Tabs UI Panel reset function*/
    userreset: function () {
        let userTempData = { modules: [] };
        showconfirm(true, 'title=' + translate("common.restore_default") + ', message=' + translate("admin.organizetabs.restore") + ', submitbutton=' + translate('sdp.admin.settings.yes') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
            if (proceed) {
                userTempData.isUserPersonalize = true;
                userTempData.isFromHeader = headerTabManager.isFromHeader;
                userTempData.isTitleContent = true;
                userTempData.modules = headerTabManager.adminSettingsData();
                userTempData.isHidden = true;
                userTempData.licenseType= sdp_app.licenseType;
                userTempData.IS_USER_CUSTOMIZE_TABS_ENABLED = sdp_app.themes.organize_tabs.allow_user_toCustomizeTabs;
                const selector = "#customize_tabs"; //NO I18N
                renderhbs(selector, 'organize-tabs', userTempData, false, 'tabs'); // NO I18N
                let saved_Data = {};
                ClientUtil.addUserPersonalization("organizetabs", saved_Data);//No I18N
                window.showalert('success', translate("admin.organizetabs.restored"), 'isAutoHide=true');//No I18N
                headerTabManager.init();
                setTimeout(function () {
                    window.location.reload(true);
                }, 1000);
            }
        });
    },
    /* Header Enable/Disable Tabs UI Panel reset function*/
    globalreset: function () {
        if (!headerTabManager.isFilesLoaded || headerTabManager.isHomeFiles) {
            headerTabManager.invokeLoader();
        }
        showconfirm(true, 'title=' + translate("common.restore_default") + ', message=' + translate("admin.organizetabs.restore") + ', submitbutton=' + translate('sdp.admin.settings.yes') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
            if (proceed) {
                let savedefaultData = headerTabManager.defaultDataobj();
                let { isFromHeader, isTitleContent, items, rmv_tab } = headerTabManager;

                let templateData = {
                    isUserPersonalize: false,
                    isFromHeader,
                    IS_USER_CUSTOMIZE_TABS_ENABLED: savedefaultData.allow_user_toCustomizeTabs,
                    isTitleContent,
                    modules: items.filter(item => !rmv_tab.includes(item.id))
                };
                templateData.licenseType= sdp_app.licenseType;

                templateData.modules.forEach(item => item.enabled = true);

                let selector =isTitleContent ? "#customize_tabs" : "#manage_tab"; // No I18N
                if (selector === "#manage_tab") { // No I18N
                    templateData.isFromHeader = true;
                }

                renderhbs(selector, 'organize-tabs', templateData, false, 'tabs'); // No I18N
                headerTabManager.personalize(savedefaultData);
                let resetTab = isTitleContent ? "#resetTabs" : "#admin_resetTabs"; // No I18N
               
                setTimeout(() => {
                    jQuery(resetTab).hide();
                    window.location.reload(true);
                }, 1000);

                headerTabManager.init();
                this.isLoaded = true;
            }
        });
    },
    nothingToSave: function () {
        window.showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true"); //No I18N
    },
    /* Handles the reset button of tabs */
    resetTabHandle: function (resetTab,param="") { 
        let ulid = resetTab.includes("admin") ? "admin_tabsList" : "tabsList"; // No I18N
        let sortedData = headerTabManager.processSortedArray(ulid);
        let headerIds = headerTabManager.headerDataids();
        resetTab = jQuery(resetTab);
        
        /** Reset button handling scenario specific changes */
        let data = headerTabManager.fetchglobalData();
        let sortedObj = headerTabManager.sortObj(sortedData);
        let dataObj = !jQuery.isEmptyObject(data) && headerTabManager.sortObj(data);

        let selectedTabsEqual = sdpToJSON(headerIds) === sdpToJSON(sortedData.selectedTabs);
        let sortObjEqual = sortedObj === dataObj;

        let shouldShow = false;

        shouldShow = param ? !sortObjEqual : !selectedTabsEqual;
        
        if (shouldShow) {
            resetTab.removeClass('hide').show();
        } else {
            resetTab.addClass('hide');
        }
    },
    /**
     * Fetches and prepares global tab configuration data based on current settings and user role.
     * 
     * @returns {Object|null} - Returns the processed tab data with selected and de-selected tabs.
     */
    fetchglobalData :  function(){
        let data = sdp_app.themes.organize_tabs ? jQuery.extend({}, sdp_app.themes.organize_tabs) : null;
        if(data !== null){
            let globalData;
            globalData = headerTabManager.getFormattedTabsData(data);
            let selectedTabIds = globalData.filter(tab => tab.enabled).map(tab => tab.id);
            let deselectedTabIds = globalData.filter(tab => !tab.enabled).map(tab => tab.id);
            data = {"selectedTabs": selectedTabIds, "deSelectedTabs": deselectedTabIds ? deselectedTabIds : []}; // No I18N
        }
        return data;
    },
    opendialogCheck: function () {
        if (jQuery("#notificationTones").hasClass("ui-dialog-content")) {
            jQuery("#notificationTones").dialog("close"); //No I18N
        }
        let $landding_page_personalization = jQuery('#landing-page-personalization');
		if($landding_page_personalization.hasClass('ui-dialog-content')) {
			$landding_page_personalization.dialog('close');//NO I18N
		}
    },
    /* Closes the slider element. */
    closeslider: function (e) {
        setTimeout(() => { jQuery(e).closest(".ui-dialog").find(".ui-widget-content").eq(0).dialog("close"); jQuery('body').find("[data-id='orgTabs']").removeClass('active'); }, 80);
        let dataID = jQuery(e).closest('div#customize_tabs').attr("data-id");
        if (dataID == 'manageTabs') { // No I18N
            jQuery("body").removeClass("subheader-of-h");
        }
        jQuery(window).off('resize.tabsPanel'); //NO I18N
    },
    /* Sorts an object based on its keys or values. */
    sortObj: function (obj) {
        let sortedObj = {};
        Object.keys(obj).sort().forEach(key => {
            sortedObj[key] = obj[key];
        });
        return sdpToJSON(sortedObj);
    },
    processHistory: function (history) {
        var header_items = headerTabManager.items;
        var modls_key = {};
        for (var i = 0; i < header_items.length; i++) {
            var key = header_items[i].id;
            modls_key[key] = header_items[i].i18n_key;
        }
        $history.processHistory(history);
        for (var h = 0, hlen = history.length; h < hlen; h++) {
            var diff = history[h].diff;
            if (diff) {
                for (var d = 0; d < diff.length; d++) {
                    if (diff[d].hasOwnProperty("previous_value") && diff[d].current_value) {
                        if (!diff[d].field || diff[d].field.name !== "data") {
                            diff.splice(d, 1);
                            d--;
                            continue;
                        }
                        var prev_val = diff[d].previous_value && JSON.parse(diff[d].previous_value);
                        var curr_val = JSON.parse(diff[d].current_value);
                        if (prev_val == null) {
                            prev_val = {};
                        }
                        var htmlCurrVal = "", reordered_html = "", sectionHtml = ""; deselected_html = "";
                        if ((prev_val.allow_user_toCustomizeTabs) !== (curr_val.allow_user_toCustomizeTabs)) {
                            var selectedtab = (curr_val.allow_user_toCustomizeTabs == false) ? false : true;
                            htmlCurrVal = htmlCurrVal + "<p>" + translate("admin.organizetabs.allowusers") + " : " + selectedtab + "</p>";
                        }
                        if (sdpToJSON(prev_val.selectedTabs) === sdpToJSON(curr_val.selectedTabs)) {
                            sectionHtml = "";
                        }
                        else {
                            if (Object.keys(curr_val).length == 1) {
                                sectionHtml = "";
                            }
                            else {
                                curr_val.selectedTabs.forEach(function(key) {
                                    if (modls_key[key]) {
                                        reordered_html += "<span class='pr5 disp-ib'>" + e_html(translate(modls_key[key])) + ",</span>";
                                    }
                                });
                                sectionHtml = "<p>" + translate("admin.organizetabs.reorder") + " : " + reordered_html + "</p>";
                                if (curr_val.deSelectedTabs && sdpToJSON(prev_val.deSelectedTabs) !== sdpToJSON(curr_val.deSelectedTabs)) {
                                    curr_val.deSelectedTabs.forEach(function(key) {
                                        if (modls_key[key]) {
                                            deselected_html += "<span class='pr5 disp-ib'>" + e_html(translate(modls_key[key])) + ",</span>";
                                        }
                                    });
                                    if (deselected_html) {
                                        sectionHtml += "<p>" + translate("admin.manage.tab.deselect") + " : " + deselected_html + "</p>";
                                    }
                                }
                            }
                        }
                        htmlCurrVal = htmlCurrVal + sectionHtml;
                        if (htmlCurrVal == "") {
                            htmlCurrVal = translate("sdp.inventory.audit.nochanges");
                        }
                        diff[d].current_value = htmlCurrVal;

                    }
                }
            }
        }
    }
};
