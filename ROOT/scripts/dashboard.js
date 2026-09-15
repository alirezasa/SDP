/* $Id$ */
var SC_RESPONSE_STATUS = {
    SC_UNAUTHORIZED : 401,
    SC_OK : 200,
    SC_RESET_CONTENT : 205,
    SC_NOT_MODIFIED : 304
};

(function() {
    jQuery.fn.dashboardmenu = function(options) {
        var data = this;
        function dashboardRefreshfn(a) {
            if (a.attr('data-value') == '1') {
                a.closest('.btn-group').find('.sdmenu-toggle .sdp-glyph-rotate-left').attr('style', ''); //NO I18N
            } else {
                a.closest('.btn-group').find('.sdmenu-toggle .sdp-glyph-rotate-left').attr('style', 'color: #009adb;'); //NO I18N
            }
        }
        function boot() {
            /* 1.Refresh Icon Click ***/
            data.on('click', '.dashboard-refresh label', function(e) { //NO I18N
                dashboardRefreshfn(jQuery(this));
            });
            /* 1.Dashboard Name focusout in Add or Edit Popup */
            data.on('focusout', '.dashboarddes', function(e) { //NO I18N
                jQuery(this).css('height', '28'); //NO I18N
            });
            /* 1.Dashboard Name focus in Add or Edit Popup */
            data.on('focus', '.dashboarddes', function(e) { //NO I18N
                jQuery(this).css('height', 'auto'); //NO I18N
            });

            data.on('click', '.dsetnrml *', function(e) { //NO I18N
                data.find('.ui-tooltip').remove();
            });
            /*** Run time Script ***/
            if (jQuery('.dashboard-customization').length > 0) {
                jQuery('.gridsterul').css("min-height", jQuery(window).height() - (jQuery('#TopStrip').height() + jQuery('.topHeaderBG').height() + jQuery('.dashboard-customization .headerbar').height() + 43) + "px"); //No I18N
            }
        }
        boot();
        jQuery(window).on('resize', function(evt) {
            jQuery('.gridsterul').css("min-height", jQuery(window).height() - (jQuery('#TopStrip').height() + jQuery('.topHeaderBG').height() + jQuery('.dashboard-customization .headerbar').height() + 43) + "px"); //No I18N
            if(!jQuery("#customize-checkbox").prop("checked")) // No I18N
            {
                $dash.init.repaintTabs();
            }
        });
        jQuery("li.gs-w .widget-summaryrequests-list").on('mouseout', function(evt){ // No I18N
            jQuery(this).closest(".widget-bg").find(".widget-header .widget-menu-container .otheroptions").removeClass("open"); // No I18N
        });
        jQuery(".widget-header select.widget-select").on('change', function(evt) {
            var value = jQuery(this).val();
            var selectNumber = jQuery(this).attr("data-number");
            jQuery(this).closest(".widget-header").find("select.widget-select[data-number='" + selectNumber + "']").val(value).select2("val", value); //NO I18N
        });
        return this;
    }
})(jQuery);

/* Header bar related scripts starts */
jQuery.fn.OverflowingMenubar = function(menus, options) {
    if (!menus && !options) {
        return jQuery(this).data("menubar-interface"); // No I18N
    }
    options = jQuery.extend(true, {
        "tag": "li", // No I18N
        "$listContainer": "#view-listing", // No I18N
        "$elementTemplate": "", // No I18N
        "$ellipsisContainer": ".dashboardtabsshow", // No I18N
        "$ellipsisList": "ul", // No I18N
        "onPopulateCallback": null, // No I18N
        "getMenuItemProperties": function($template) { // No I18N
            return {
                "viewid": $template.closest(".dsetalgn").attr("id"), // No I18N
                "displayname": $template.data("displayname"), // No I18N
                "reporturl": $template.data("reporturl"), // No I18N
                "view": $template.data("viewtype"), // No I18N
                "is_selected": $template.prev().find("[name='selected-tabs']").attr("checked")=='checked', // No I18N
                "perm": $template.data("perm"), // No I18N
                "description" : $template.find(".dashboard-description").text(), // No I18N
                "dvdid": $template.parents("[data-dvdid]").data("dvdid") // No I18N
            };
        }
    }, options);
    this.setElementAttributes = function($elem, data) {
        jQuery.each(data, function(k, v) {
            $elem.attr("data-" + k, v);
        });
        return $elem;
    }
    var $menu = this;
    this.getMenus = function() {
        return menus;
    }
    this.constructElement = function(index, data) {
        var that = this;
        if (!data.is_selected) {
            return;
        }
        delete data.is_selected;

        var $elem;
        if (options.$elementTemplate && options.$elementTemplate.length) {
            $elem = $menu.parent().find(options.$elementTemplate).clone(true, true);
        } else {
            $elem = jQuery("<" + options.tag + " class='menu-tab'></" + options.tag + ">");
            $elem.append("<a href='/' data-switch='sdtab'></a>");
            $elem.find("> a").text(data.displayname);
            if(data.description.trim() != getMessageForKey("sdp.viewuserdetails.nodesc")){
                $elem.attr({title: data.description.trim(), rel: "uitip", "data-desc":data.description.trim()});
            }
            delete data.displayname;
            delete data.description;
        }
        $elem = that.setElementAttributes($elem, data);
        return $elem;
    }
    this.appendElementToEllipsis = function($elem) {
        var that = this;
        if ($elem) {
            $clone = $elem.clone(true, true);
            $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).append($clone);
            $elem.remove();
            that.isEllipsisEmpty = false;
        }
    }
    this.addElementToEllipsisAtIndex = function($elem, index) {
        var that = this;
        if ($elem) {
            $clone = $elem.clone(true, true);
            if (index - 1 < 0) {
                $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).prepend($clone);
            } else {
                $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).eq(index - 1).after($clone);
            }
            $elem.remove();
            that.isEllipsisEmpty = false;
        }
    }
    this.prependElementToEllipsis = function($elem) {
        var that = this;
        if ($elem) {
            $clone = $elem.clone(true, true);
            $clone.attr({title: $clone.text()});
            $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).prepend($clone);
            $elem.remove();
            that.isEllipsisEmpty = false;
        }
    }
    function getWidthOfVisibleTabs($menubar){
        var totalWidthOfTabs = 0;
        jQuery.each($menubar.find(" > "+options.tag),function(k,v){ // No I18N
            totalWidthOfTabs += jQuery(v).width();
        });
        return totalWidthOfTabs;
    }
    function adjustVisibleTabs($menubar, offsetFromLast, insertType) {
        if(getSDPURLParams().externalframe=='true') {
            return;
        }
        var that = $menu;
        var widthTillNow = getWidthOfVisibleTabs($menubar);
        while ($menubar[0].offsetWidth <= widthTillNow && $menubar.find("> " + options.tag).length) { // No I18N
            var nthElement = $menubar.find("> " + options.tag).length + offsetFromLast;
            widthTillNow -= $menubar.find("> " + options.tag).eq(nthElement).width();
            if (insertType == "stack") {
                that.prependElementToEllipsis($menubar.find("> " + options.tag).eq(nthElement));
            } else {
                that.appendElementToEllipsis($menubar.find("> " + options.tag).eq(nthElement));
            }
        }
    }
    this.appendToVisibleTabs = function($menuitem, offsetFromLast, insertType) {
        if ($menuitem) {
            (!insertType) && (insertType = "queue"); // No I18N
            var that = this;
            var $menubar = $menu.parent().find(options.$listContainer);
            let dashboardDesc = $menuitem.attr("data-desc")
            if(dashboardDesc==undefined) {
                dashboardDesc = "";
            }
            $menuitem.attr("title", dashboardDesc);
            $menubar.append($menuitem);
        }
    }
    this.appendElement = function($menuitem, offsetFromLast, insertType) {
        var that = this;
        if ($menuitem) {
            if (!$menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList + " > " + options.tag).length) {
                that.appendToVisibleTabs($menuitem, offsetFromLast, insertType);
            } else {
                that.appendElementToEllipsis($menuitem);
            }
        }
    }
    var getMenuItemProperties = options.getMenuItemProperties;
    this.populateUsingNormalArray = function(menus) {
        var that = this;
        var $menubar = jQuery(options.$listContainer);
        $menubar.empty();
        jQuery.each(menus, function(index, data) {
            var $menuitem = that.constructElement(index, data);
            that.appendElement($menuitem, -1);
        });
        return $menubar;
    }
    this.populateUsingJQueryArray = function(jqObjects, getDataFromEachJQObj) {
        var that = this;
        var $menubar = $menu.parent().find(options.$listContainer);
        $menubar.empty();
        jQuery.each(menus, function(index, data) {
            data = jQuery(data);
            data = getDataFromEachJQObj(data);
            var $menuitem = that.constructElement(index, data);
            that.appendElement($menuitem, -1);
        });
        return $menubar;
    }
    function calculateAvailableWidth(){
        var width = $menu.parent().width()-$menu.parent().find(options.$ellipsisContainer).width();
        return width;
    }
    function constructTabs() {
        var that = $menu;
        var width = calculateAvailableWidth();
        $menu.parent().find(options.$ellipsisContainer).addClass("hide");
        $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).empty();
        that.isEllipsisEmpty = true;
        var $menubar;
        $menu.css("width",width); // No I18N
        if (!menus.jquery) {
            $menubar = that.populateUsingNormalArray(menus);
        } else {
            $menubar = that.populateUsingJQueryArray(menus, getMenuItemProperties);
        }
        adjustVisibleTabs($menubar, -1,"stack"); // No I18N
        $menu.css("width","auto"); // No I18N
        $menu.parent().find(options.$ellipsisContainer).removeClass("bs-noconflict");
        if(!that.isEllipsisEmpty) {
            $menu.parent().find(options.$ellipsisContainer).removeClass("hide").addClass("bs-noconflict"); // No I18N
        }
        options.onPopulateCallback && options.onPopulateCallback(that.parent());
        $sdEventListener(jQuery("#dashboardTabsDiv"));
    }

    function setTabEvents() {
        $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList).find("> " + options.tag).on('click', function(evt) {
            $menu.replaceLast(jQuery(this)); //NO OUTPUTENCODING
        });
    }
    this.populate = function() {
        constructTabs();
        setTabEvents();
    }
    this.replaceLast = function($elem) { //NO OUTPUTENCODING
        var that = this;
        var indexOfElem = $elem.data("tabNo"); // No I18N
        constructTabs();

        $elem = $menu.parent().find(options.$ellipsisContainer).find(options.$ellipsisList + " > " + options.tag).filter(function(index, elem) {
            return (jQuery(elem).data("tabNo") == indexOfElem); // No I18N
        });
        if (!$elem.length) {
            var $tab = $menu.find(options.tag).filter(function(index, elem) {
                return (jQuery(elem).data("tabNo") == indexOfElem); // No I18N
            });
            $tab.addClass("active");
            setTabEvents();
            return;
        }
        $clone = $elem.clone(true, true);
        $elem.remove();
        $menu.parent().find(options.$listContainer + " > " + options.tag, options.$ellipsisContainer + " " + options.$ellipsisList + " > " + options.tag).removeClass("active");
        $clone.addClass("active");
        that.appendToVisibleTabs($clone, -2, "stack"); // No I18N
        var $menubar = $menu.parent().find(options.$listContainer);
        var width = calculateAvailableWidth();
        $menu.css("width",width); // No I18N
        adjustVisibleTabs($menubar, -2, "stack"); // No I18N
        setTabEvents();
        $menu.css("width","auto"); // No I18N
    }
    this.changeMenus = function(newMenus) {
        var that = this;
        menu = newMenus;
        that.populate();
    }
    jQuery(this).data("menubar-interface", this); // No I18N
    return this;
}

if(typeof $dash == 'undefined') {
    var $dash = {};
}
var $dash = {
    ...$dash,
    //Embed Dashboard/Widget code start here
    embed: {
        //Attach Site and support group params to embed URL
        attachSiteGroupinUrl: function(shareUrl, widgetDiv) {
            let siteId = jQuery("#siteSelection").val();
            let isSiteFilterAvailable = jQuery("#siteSelection").length>0 && !jQuery("#siteSelection").parents(".site-selection-container").hasClass("hide"); //NO I18N
            if(siteId && isSiteFilterAvailable) {
                shareUrl += "&site="+siteId; //No I18N
            }

            //Fetching Group Id's
            let isGroupFilterAvailable = jQuery("#groupSelection").length>0 && !jQuery("#groupSelection").parents(".group-selection-container").hasClass("hide"); //NO I18N
            if(widgetDiv && widgetDiv.data("module")=="problemchange") {
                isGroupFilterAvailable = false;
                shareUrl += "&group_disabled=true"; //No I18N
            }
            let groupIds = "";
            if(isGroupFilterAvailable) {
                let selectedGroups = jQuery("#groupSelection").select2("data"); //No I18N
                for(let group of selectedGroups) {
                    let groupId = group.id;
                    if(!isInteger(groupId) || group.id===group.text || group.id===group.name) {
                        if(group.text) {
                            groupId = dashboardComp.supportGroups[group.text];   
                        }
                        else {
                            groupId = dashboardComp.supportGroups[group.name];
                        }
                    }
                    if(groupId) {
                        groupIds += groupIds==""?groupId:(","+groupId);
                    }
                }
                shareUrl += "&groups="+(groupIds==""?"0":groupIds); //No I18N
            }
            return shareUrl;
        },
        //Enable/Disable Site and Support - toggle button
        toggleFilter: function(_this) {
            var widgetName = jQuery(_this).data("widgetname"); //No I18N
            var embedCode = jQuery(_this).parents("#ShareWidgetDig").find("#embedCode"); //No I18N
            var isChecked = jQuery(_this).is(":checked"); //No I18N
            var widgetDiv = jQuery("#widgetHeader_"+widgetName).parents("div.widget-bg"); //No I18N
            var updatedCode = $dash.common.constructEmbedUrl(widgetDiv, isChecked);
            embedCode.val(updatedCode);
            this.highlightEmbedCode(embedCode);
        },

        //Open Embed Dashboard dialog
        setEmbedDashboardCode: function(_this, highlight) {
            var shareUrl = window.location.protocol+"//"+sdp_app.ALIAS_URL+window.location.pathname+"?action=embeddashboard&externalframe=true&view="+e_attr(jQuery("#view-listing li.active").data("view")); //NO I18N
            if(!jQuery(_this).is(":checked")) {
                shareUrl = $dash.embed.attachSiteGroupinUrl(shareUrl);
            }
            shareUrl += "&PORTALID="+sdp_app.PORTAL_ID; //No I18N
            if(isMSP){
                shareUrl +="&persistentAccountId="+getAccountId()+"&ACCOUNTID="+getAccountId()+"&persistAccountID=true"; //No I18N
            }
            var embedCode = jQuery("#embedCodeDashboardDiv #embedCode");
            embedCode.val(shareUrl);
            if(highlight) {
                this.highlightEmbedCode(embedCode);
            } else {
                initTooltip("#share-dashboard-dialog"); //NO I18N
                jQuery("#embedCodeDashboardDiv").removeClass("hide");
                
                let isSiteFilterAvailable = jQuery("#siteSelection").length>0 && !jQuery("#siteSelection").parents(".site-selection-container").hasClass("hide"); //NO I18N
                let isGroupFilterAvailable = jQuery("#groupSelection").length>0 && !jQuery("#groupSelection").parents(".group-selection-container").hasClass("hide"); //NO I18N
                if(!isSiteFilterAvailable && !isGroupFilterAvailable) {
                    jQuery("#staticSiteGroupDiv").addClass("hide");
                }
                else if(isSiteFilterAvailable && !isGroupFilterAvailable) {
                    jQuery("#syncSiteGroupText").text(translate("dashboard.embed.syncSite"));
                }
                else if(!isSiteFilterAvailable && isGroupFilterAvailable) {
                    jQuery("#syncSiteGroupText").text(translate("dashboard.embed.syncGroup"));
                }
            }
        },
        //Highlight the url input when its changed
        highlightEmbedCode: function(embedCode) {
            embedCode.addClass('ip-highlight');
            setTimeout(function(){ 
                embedCode.removeClass('ip-highlight');            
            },350);
        },
        //Initialize Dashboard Sharing/Embed dialog
        ready: function(isNotStandAlone, dashboardName, viewId, share_info) {
            if(!isNotStandAlone)
            {       
                var $shareContainer = jQuery("#dashboardSharingConfig"); // No I18N
                var isExecutiveView = $shareContainer.attr("data-isexecutive"); // no I18N
                var $footer = $shareContainer.closest(".share-dialog-body").next(".share-dialog-footer");   //No I18n
                
                $footer.find("[action='save-share']").on('click', function(evt){
                    $dash.share.saveShareInfo($shareContainer,dashboardName,closeDialog);
                });
            }

            var $shareContainer = jQuery("#dashboardSharingConfig");
            var module = "technician";  //No I18n
            if($shareContainer.attr("data-isexecutive") == "true") {
                module = "user";    //No I18n
            }
            $dash.share.setInitialSharingOptions($shareContainer,module,share_info);    
            if(!isNotStandAlone) {
                $dash.embed.setEmbedDashboardCode(jQuery("#staticSiteGroupDiv .togglechk"), false);
                if(viewId==undefined) {
                    //for default dashboard share dialog
                    let container = jQuery("#share-dashboard-dialog");
                    container.find("div[data-name=dashboardviewshare] input,label.shareType").attr("disabled", true);
                    container.find("#footerDiv #SaveButton").attr("disabled", true);
                    container.find("#sharingOptionTooltip").attr("title", translate("sdp.dashboard.common.messages.limitedpermission"));
                    container.find("#shareDialogHeader").text(translate("sdp.dashboard.common.sharedashboard")+" - "+jQuery("#view-listing li.active").text());
                }
            }
            $dash.share.showCurrentShareOptionNote($shareContainer);
            initTooltip("#dashboardSharingConfig"); //NO I18N
        },

        //Embed dashboard UI changes like hiding the icons
        externalFrameHandler: function() {
            var params = getSDPURLParams();
            if(params.externalframe) {
                jQuery("#dashboardTabsDiv,#addNewDashboardWidget,#hamburgerIcon,#refreshTimeDiv").addClass("hide");
                jQuery("#instantRefreshDiv").removeClass('hide');
                jQuery("#activeDashId").text(jQuery("#view-listing li[data-view="+params.view+"] a").text());
            }
        },

        //Embeded widget page UI changes like moving the filters and removing the icons
        embededWidgetHandler: function() {
            if($dash.embed.isSingleWidget) {
                if($dash.embed.showFilters) {
                    var siteDiv = jQuery(".site-selection-container");
                    var groupDiv = jQuery(".group-selection-container");
                    siteDiv.toggleClass("fl fr"); //NO I18N
                    groupDiv.toggleClass("fl fr"); //NO I18N
                    jQuery(`#widgetHeader_${$dash.embed.singleWidgetName} .widgetMenuParent`).append(siteDiv);
                    if(!$dash.embed.group_disabled) {
                        jQuery(`#widgetHeader_${$dash.embed.singleWidgetName} .widgetMenuParent`).append(groupDiv);
                    }
                }
                jQuery("#headerbar").remove();
                let selector = $dash.embed.isTableGraphWidget ? $dash.embed.widgetId : $dash.embed.singleWidgetName;
                let widgetHeader = jQuery("#widgetHeader_"+selector);
                let maxIcon = widgetHeader.find("#maximizeWidget");
                dashboardComp.showInFullScreen(maxIcon.first());
                if(!$dash.embed.isTableGraphWidget) {
                    maxIcon.remove();
                }
                widgetHeader.find("#columnsort,#ShareWidget").remove();
                jQuery("#widget-menu .refreshreportgraph").removeClass("refreshreportgraph");
                $sdEventListener("#widgetHeader_"+selector); //NO I18N
            }
        }
    }, /*  Embed dialog script ends here */

    share: {
        showOptions: function(el,location) {
            var $el = jQuery(el);
            var $db = $el.closest(".dsetalgn"); // No I18N
            var view_id = $db.attr("id"); // No I18N
            if(location == "inline") {
                $db.closest(".wrapper").find(".cancel-share").trigger('click');// Close the previous share form // No I18N
                var $div = jQuery("<div data-name='settShare' />");
                $div.load("/DashBoardView.do?action=shareView&at=inline&viewId=" + encodeURIComponent(view_id),function(){ // No I18N
                    $db.find(".dsshare,.dsedit,.dsdelete").addClass("hide"); // no I18N
                    $db.find(".save-share").on('click', function(){
                        $dash.share.saveShareInfo($db.find("#dashboardSharingConfig"),$db.find(".dashboard-name").text(),function(){
                            var $clone = jQuery("#dashboard-settings-dialog").find(".dsetalgn#"+view_id);
                            $db.find(".dshddes").attr("data-perm",$clone.find(".dshddes").attr("data-perm"));
                            $db.find(".dsshare > span").removeAttr("class"); // No I18N
                            $db.find(".dsshare > span").addClass($clone.find(".dsshare > span").attr("class")); // No I18N
                            // $db.after($clone);
                            $db.find(".dsshare,.dsedit,.dsdelete").removeClass("hide"); // no I18N
                            $div.remove();
                        });
                    });
                    $db.find(".cancel-share").on('click', function(){
                        $db.closest(".wrapper").getNiceScroll().resize(); // No I18N
                        $db.find(".dsshare,.dsedit,.dsdelete").removeClass("hide"); // no I18N
                        $div.remove();
                    });
                    if($db.closest(".dsetnrml").find(".dsetalgn").length-1 == $db.index()){ // No I18N
                        // if this is the last element in the list, then scroll down to show that form has opened.
                        setTimeout(function(){
                            $dash.util.scrollTo($db.closest(".wrapper"),$db.find(".cancel-share"),$db.find(".cancel-share").height()); // No I18N
                        }, 1);
                    }
                });
                $db.append($div);
            }
            else {
                showURLInDialog("/DashBoardView.do?action=shareView&viewId=" + encodeURIComponent(view_id), 'modal=yes,closeOnEscKey=no,closeButton=no,width=600,position=absmiddle,emptyOnClose=true'); // No I18N
            }
        },

        setInitialSharingOptions: function($shareContainer, module, share_info) {
            $dash.share.dashboardMultiSelect = null;
            var isDeptHeadSelected = $dash.share.isDeptHeadSelected(share_info);
            var isShareOpt = $shareContainer.find(".share-shared input[name='share-opt']").prop("checked"); // No I18N
            let isExecutive = $shareContainer.attr("data-isexecutive") == "true";
            if (isShareOpt) {
                $dash.share.dashboardMultiSelect = $dash.common.initSharingField($shareContainer.find("#multiSelectDashboardShare"), {isExecutive:isExecutive, isDeptHeadSelected:isDeptHeadSelected, isDashboard: true}); // No I18N
                $shareContainer.find("#multiSelectDashboardShare").removeClass("hide"); // No I18N
            }
            $shareContainer.find(".share-shared").on('click', function(evt){ // No I18N
                if (!$dash.share.dashboardMultiSelect) {
                    let isExecutiveInEdit = jQuery("#createDBCPanel [name=is-executive]").prop("checked"); // No I18N
                    isExecutive = isExecutiveInEdit!=undefined ? isExecutiveInEdit : isExecutive;
                    $dash.share.dashboardMultiSelect = $dash.common.initSharingField($shareContainer.find("#multiSelectDashboardShare"), {isExecutive:isExecutive, isDeptHeadSelected:isDeptHeadSelected, isDashboard: true}); // No I18N
                }
                setTimeout(function(){
                    $shareContainer.find("#multiSelectDashboardShare").append("<input type='text' class='dummy' style='opacity:0;height:0;' />"); // No I18N
                    $shareContainer.find(".dummy").focus(); // No I18N
                    $shareContainer.find(".dummy").remove(); // No I18N
                }, 1);
            });
            share_info = $dash.share.toMultiSelectShareInfo(share_info);
            if (share_info && isShareOpt) {
                $dash.share.dashboardMultiSelect.setSelectedIds(share_info);
            }
        },

        toMultiSelectShareInfo: function(shareInfo) { //Conversion for Render
            var info = {};
            for (var i = 0; i < shareInfo.length; i++) {
                info[shareInfo[i].type] = shareInfo[i].details;
            }
            return info;
        },

        openShareDialogForCurrentView: function(el) {
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                var viewid = jQuery("#activeViewId").val(); //No I18N
                $dash.share.showOptions(jQuery("#dashboard-settings-dialog .dsetalgn#" + viewid + " .dsshare")[0]);//No I18N
            }
        },

        isDeptHeadSelected: function (shareData) {
            return shareData.find(e => e.type == 'orgrole' && (e.details.find(d => d.id == '1') != undefined)) != undefined; //No I18N
        },

        //Share Dashboard options onchange handling
        showCurrentShareOptionNote: function($shareContainer) {
            $shareContainer.find("input[type='radio'][name='share-opt']:enabled").on('change', function(evt) { // No I18N
                var shareOptChosen = jQuery(this).val();
                if (shareOptChosen == "-1") {
                    $shareContainer.find("#multiSelectDashboardShare").addClass("hide"); // No I18N
                } else if (shareOptChosen == "0") {
                    $shareContainer.find("#multiSelectDashboardShare").removeClass("hide"); // No I18N
                } else {
                    $shareContainer.find("#multiSelectDashboardShare").addClass("hide"); // No I18N
                }
                $shareContainer.find("label.btn-theme").removeClass("btn-theme"); // No I18N
                $shareContainer.find(this).parent().addClass("btn-theme"); // No I18N
            });
        },

        saveShareInfo: function($shareContainer,dashboardName,onsuccess) {
            var isExecutiveView = $shareContainer.attr("data-isexecutive"); // no I18N
            var share_mode = $shareContainer.find("input[name='share-opt']:checked").val();
            var shared_to_all_tech = false;
            var isShared = false;
            if(share_mode == "0") {
                isShared = true;
            }
            else if(share_mode == "1") {
                shared_to_all_tech = true;
            }
            var result_json = {
                "name" : dashboardName, //No I18n
                "is_executive_view" : isExecutiveView,  //No I18n
                "shared_to_all_tech" : shared_to_all_tech,  //No I18n
                "isshared" : isShared   //No I18n
            };
            if(isShared)
            {
                var dashboardViewId = $shareContainer.attr("data-dashboardviewid");  //No I18n
                result_json.share_info = $dash.share.fromMultiSelectShareInfo($dash.share.dashboardMultiSelect.getSelectedIds());
                if(!result_json.share_info.length) {
                    showalert("failure", e_html(translate("sdp.dashboard.common.messages.shareinfonotchosen")), 'isAutoHide=true,closeOnEscKey=yes,width=500,height=80'); // No I18N
                    return ;
                }
            }
            var url = "/DashBoardView.do?action=saveView";  //No I18n 
            var viewId = $shareContainer.attr("data-dashboardviewid");   //No I18n
            if(viewId && viewId.length)
            {
                url += "&viewId="+encodeURIComponent(viewId);   //No I18n
            }
            jQuery.ajax(url,{
                "type" : "POST",    //No I18n
                "data" : {  //No I18n
                    "input_data" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(result_json) : JSON.stringify(result_json)   //No I18n
                }
            }).done(function(response,data,stat){
                if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                    response = JSON.parse(response);
                    $dash.share.updateDashboardMetaData(response);
                    onsuccess && onsuccess();
                    showalert("success",getMessageForKey("sdp.dashboard.common.messages.shareinfoupdate"),'isAutoHide=true,delay=3,width=600'); // No I18N
                    $dash.newWidgets.shareType = shared_to_all_tech ? $dash.SHARE_TYPE.PUBLIC : $dash.SHARE_TYPE.PRIVATE;
                }
            });
        },

        fromMultiSelectShareInfo: function(shareInfo) { //Conversion for Save
            var info = [];
            jQuery.each(shareInfo, function (type, values) {
                info.push({type: type, details: values});
            });
            return info;
        },

        //Update Share info of a dashboard afte share details saved
        updateDashboardMetaData: function(dashboardData) {
            var $db = jQuery("#dashboard-settings-dialog [data-name='dsnrml'] div#" + dashboardData.id);
            var shareClass, status;
            if (dashboardData.isshared) {
                shareClass = "share2"; // No I18N
                status = getMessageForKey("sdp.dashboard.common.shared"); // No I18N
            } else if (dashboardData.shared_to_all_tech) {
                shareClass = "public-filter"; // No I18N
                status = getMessageForKey("sdp.dashboard.common.public"); // No I18N
            } else {
                shareClass = "private-filter"; // No I18N
                status = getMessageForKey("sdp.dashboard.common.private"); // No I18N
            }
            $db.find("li.dsshare").attr("title", status); // No I18N
            $db.find("li.dsshare > span").attr("class", "cspr icon-sm flat " + shareClass);
            $db.find("li.dshddes").attr("data-perm", DashboardPermission.encodePermission({
                "isOwnView": true, // No I18N
                "isDefaultView": false, // No I18N
                "isPrivate": (!dashboardData.shared_to_all_tech && !dashboardData.isshared), // No I18N
                "isPublic": dashboardData.shared_to_all_tech, // No I18N
                "isShared": dashboardData.isshared // No I18N
            }));
        }
    },

    //Site and Support Group Filters Code starts here
    filters: {
        //Dashboard site filter select2
        applySiteSelect2: function(defaultSite, selectedSite) {
            $dash.filters.defaultSite = defaultSite;
            if (!selectedSite) {
                selectedSite = defaultSite;
            }
            if (selectedSite.id) {
                jQuery("#siteSelection").val(selectedSite.id);
                $dash.filters.changeSelectedSiteLabel(selectedSite);

                if(selectedSite.id > 0 || selectedSite.id == -1) {
                    var input_data = {
                        list_info: {
                            fields_required:["id", "name"],  //No I18N
                            search_criteria:[
                                {field: "deleted",condition: "is", value: false, logical_operator:"AND"},  //No I18N
                                {field: "id", condition:"is", value: selectedSite.id, logical_operator:"AND"}  //No I18N
                            ]
                        }
                    };

                    if(selectedSite.id == -1) {
                        delete input_data.list_info.search_criteria;
                    }

                    sdpAjax({
                        url: "/api/v3/widgets/site", //No I18N
                        data: {input_data: sdpToJSON(input_data)},
                        cache: false,
                        success: function(response) {
                            let isValidSite = false;
                            for (const site of response.site) {
                                if(selectedSite.id === site.id) {
                                    isValidSite = true;
                                    break;
                                }
                            }

                            if(!isValidSite) {
                                $dash.filters.applySiteSelect2(defaultSite, defaultSite);
                                refreshWidgets({isSiteGroupUpdate: true});
                            }
                        }
                    });
                }
                else if(selectedSite.id == "0" && selectedSite.id!=defaultSite.id) {
                    $dash.filters.applySiteSelect2(defaultSite, defaultSite);
                    refreshWidgets({isSiteGroupUpdate: true});
                }
            }

            jQuery("#siteSelection").sdp_select2({
                multiple: false,
                default_option: defaultSite,
                url:[{
                    url:"/api/v3/widgets/site", //NO I18N
                    field:'site' //NO I18N
                }]
            });

            jQuery("#siteSelection").on('change', function() {
                $dash.filters.applyGroupSelect2();
            });

            jQuery("#siteSelection").on("select2-close", function (evt) { // No I18N
                jQuery(".site-selection-container").removeClass("open"); // No I18N
            });
        },

        processSupportGroupData: function(selectedGroups) {
            let selectedData = [], selectedGroupNames = [];
            if (selectedGroups && selectedGroups.length) {
                let urlParams = getSDPURLParams();
                let siteSelected = jQuery('#siteSelection').val();
                jQuery.each(selectedGroups, function (k, v) {
                    v.text = v.name||v.text;
                    if(urlParams.externalframe=="true" && (siteSelected=='0' || siteSelected=='-2' || siteSelected==undefined)) {
                        selectedData.push({id: v.name||v.text, text: v.name||v.text});
                    }
                    else {
                        selectedData.push({id: v.id, text: v.name||v.text});
                    }
                    selectedGroupNames.push(v.name||v.text);
                });
            }
            return {selectedData: selectedData, selectedGroupNames: selectedGroupNames};
        },

        //Support groups filter select2
        applyGroupSelect2: function(selectedGroups) {
            var siteSelected = jQuery('#siteSelection').val();
            let groupData = $dash.filters.processSupportGroupData(selectedGroups);
            var selectedData = groupData.selectedData, selectedGroupNames = groupData.selectedGroupNames;
            
            if(selectedGroupNames.length>0) {
                //Checking whether the Selected support groups are active.
                //If Inactive support groups found, Reset the support filter and refresh the widgets
                var input_data = {
                    list_info: {
                        row_count: 50,
                        group_by:["name"],  //No I18N
                        fields_required:["name"],  //No I18N
                        search_criteria:[
                            {field: "deleted",condition: "is", value: false, logical_operator:"AND"},  //No I18N
                            {field: "name", condition:"in", values: selectedGroupNames, logical_operator:"AND"}  //No I18N
                        ]
                    }
                };

                if(siteSelected != undefined && siteSelected != "0" && siteSelected != "-2") {
                    if(siteSelected=="-1") {
                        input_data.list_info.search_criteria.push({field: "site", condition: "is", value: null, logical_operator:"AND"});  //No I18N
                    }
                    else {
                        input_data.list_info.group_by = undefined;
                        input_data.list_info.search_criteria.push({field: "site.id", condition: "is", value: siteSelected, logical_operator:"AND"});  //No I18N
                    }
                }
                
                sdpAjax({
                    url: "/api/v3/widgets/support_group", //No I18N
                    data: {input_data: sdpToJSON(input_data)},
                    cache: false,
                    success: function(response) {
                        var activeSupportGroupNames = [];
                        jQuery.each(response.support_group, function (k, v) {
                            activeSupportGroupNames.push(v.name);
                        });

                        for(let i=0;i<selectedGroupNames.length;i++) {
                            if(activeSupportGroupNames.indexOf(selectedGroupNames[i])==-1) {
                                jQuery("#groupSelection").select2("data", []); //No I18N
                                $dash.filters.saveSupportGroup();
                            }
                        }
                    }
                });
            }

            $dash.filters.selectedGroups = selectedGroups;
            $dash.filters.changeSelectedGroupLabel(selectedGroups);
            
            let params = this.getSupportGroupSelect2Params({siteSelected: siteSelected, selectedData: selectedData, placeholder: translate("sdp.dashboard.view.AllSupportGroups")});
            jQuery("#groupSelection").sdp_select2(params);

            jQuery("#groupSelection").on("change", function() {
                jQuery("#groupSave").prop("disabled", false); // No I18N
            });
        },

        getSupportGroupSelect2Params: function(options) {
            let siteSelected = options.siteSelected;
            let params = {
                closeOnSelect: false,
                value: options.selectedData,
                multiple: true,
                placeholder: options.placeholder,
                url:[{
                    url:"/api/v3/widgets/support_group",//NO I18N
                    field:'support_group', //NO I18N
                    list_info: {
                        group_by: ["name"], //NO I18N
                        fields_required: ["name"], //NO I18N
                        search_criteria: [{field: "deleted", condition: "is", value: false}] //NO I18N
                    }
                }],
                separator: "&#44;"
            };
            if(siteSelected == undefined || siteSelected == "0" || siteSelected == "-2") {
                params.url[0].list_info = {group_by: ["name"], fields_required: ["name"], search_criteria: [{field: "deleted", condition: "is", value: false}]};  //NO I18N
            }
            else if(siteSelected=="-1") {
                params.url[0].list_info = {search_criteria: [{field: "site", condition: "is", value: null, logical_operator:"AND"}, {field: "deleted", condition: "is", value: false, logical_operator:"AND"}], fields_required: ["id","name"]};  //NO I18N
            }
            else {
                params.url[0].list_info = {search_criteria: [{field: "site.id", condition: "is", value: siteSelected, logical_operator:"AND"}, {field: "deleted", condition: "is", value: false, logical_operator:"AND"}], fields_required: ["id","name"]};  //NO I18N
            }
            return params;
        },

        //Support group filter save handling
        saveSupportGroup: function(evt) {
            var urlParams = getSDPURLParams();
            if($dash.embed.isSingleWidget || (urlParams.externalframe && urlParams.groups)) {
                $dash.filters.updateGroupFilter();
                return;
            }

            var dashboardPersonalization = sdp_user.CLIENT_CONF.Dashboard_Settings;
            if(dashboardPersonalization && dashboardPersonalization.siteGroupFilter=="dashboard_specific") {
                //Dashboard specific support group save
                var key = "group_selected_"+jQuery("#activeViewId").val(); //No I18n
                dashboardPersonalization[key] = jQuery("#groupSelection").select2("data"); //No I18n
                ClientUtil.addUserPersonalization("Dashboard_Settings", dashboardPersonalization).then((message) => { //No I18N
                    $dash.filters.updateGroupFilter();
                });
            }
            else {
                var selectedData = jQuery("#groupSelection").select2("data"); //No I18n
                var selectedIds = [];
                for(var i=0;i<selectedData.length;i++) {
                    selectedIds.push(selectedData[i].id);
                }
                //Apply to all dashboard - support group save
                jQuery.ajax("/DashBoard.do", { // No I18N
                    type: "POST", // No I18N
                    data: {
                        action: "saveSupportGroups", // No I18N
                        queueIds: sdpToJSON(selectedIds)
                    }
                }).done(function (response, data, stat) {
                    if (stat.status == SC_RESPONSE_STATUS.SC_OK) {
                        $dash.filters.updateGroupFilter();
                    }
                }).fail(function (stat, data, error) {
                    if (stat.status == SC_RESPONSE_STATUS.SC_UNAUTHORIZED) {
                        showalert("failure", getMessageForKey("sdp.robo.messages.accessdenied"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                    }
                });
            }
        },

        //Support group filter UI update
        updateGroupFilter: function() {
            var selectedGroups = jQuery("#groupSelection").select2("data"); // No I18N
            $dash.filters.selectedGroups = selectedGroups;
            $dash.filters.changeSelectedGroupLabel(selectedGroups);
            jQuery("#groupSave").prop("disabled", true); // No I18N
            refreshWidgets({isSiteGroupUpdate: true});
          },

          //Undo the Support UI selection when cancel the save
          groupSaveCancel: function(evt) {
            var selectedGroups = $dash.filters.selectedGroups;
            jQuery("#groupSave").prop("disabled", true); // No I18N
            if (!selectedGroups.length) {
                jQuery("#groupSelection").select2("val", ""); // No I18N
            } else {
                let groupData = $dash.filters.processSupportGroupData(selectedGroups);
                jQuery("#groupSelection").select2("data", groupData.selectedData); // No I18N
            }
        },

        //Site filter save handling
        saveSite: function(_this, evt) {
            var urlParams = getSDPURLParams();
            if($dash.embed.isSingleWidget || (urlParams.externalframe && urlParams.site)) {
                $dash.filters.updateSiteFilter();
                refreshWidgets({isSiteGroupUpdate: true});
                return;
            }

            var dashboardPersonalization = sdp_user.CLIENT_CONF.Dashboard_Settings;
            if(dashboardPersonalization && dashboardPersonalization.siteGroupFilter=="dashboard_specific") {
                //Dashboard specific site save
                var key = "site_selected_"+jQuery("#activeViewId").val(); //No I18n
                dashboardPersonalization[key] = jQuery(_this).select2('data');
                $dash.filters.updateSiteFilter();

                key = "group_selected_"+jQuery("#activeViewId").val(); //No I18n
                dashboardPersonalization[key] = [];
                ClientUtil.addUserPersonalization("Dashboard_Settings", dashboardPersonalization).then((message) => { //No I18N
                    $dash.filters.updateGroupFilter();    
                });
            }
            else {
                //Apply to all dashboard site save
                jQuery.ajax("/DashBoard.do", {// No I18N
                    type: "POST", // No I18N
                    cache: false,
                    data: {
                        action: "saveSite", // No I18N
                        siteId: jQuery(_this).val()
                    }
                }).done(function (response, data, stat) {
                    if (stat.status == SC_RESPONSE_STATUS.SC_OK) {
                        $dash.filters.updateSiteFilter();
                        refreshWidgets({isSiteGroupUpdate: true});
                    }
                }).fail(function (stat, data, error) {
                    if (stat.status == SC_RESPONSE_STATUS.SC_UNAUTHORIZED) {
                        showalert("failure", getMessageForKey("sdp.robo.messages.accessdenied"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                    }
                });
            }
        },

        //Site filter UI update
        updateSiteFilter: function() {
            var selectedSiteName = jQuery("#siteSelection").select2("data"); // No I18N
            $dash.filters.changeSelectedSiteLabel(selectedSiteName);
            jQuery("#groupSelection").select2("val", ""); // No I18N
            jQuery(".group-selection-container > label").removeAttr("title"); // No I18N
            jQuery(".group-selection-container [data-name='dashbdgroup']").text(getMessageForKey("sdp.admin.leftpanel.helpdesk.queues")); // NO I18N
        },

        changeSelectedSiteLabel: function(newSite) {
            if (!newSite) {
                newSite = jQuery("#siteSelection").select2("data"); // No I18N
            }
            jQuery("[data-name='dashbdsites']").text(newSite.text || newSite.name);
            if (jQuery("[data-name='dashbdsites']").hasClass("dashbdglobalopt")) { // No I18N
                var $el = jQuery("[data-name='dashbdsites']"); // No I18N
                if ($el.hasClass("dashbdglobalopt")) { // No I18N
                    $dash.util.tooltipOnEllipsis($el, $el.closest(".site-selection-container > label"), e_html(newSite.text || newSite.name)); // No I18N
                } else {
                    $el.closest(".site-selection-container > label").removeAttr("title"); // No I18N    
                }
            }
            $dash.filters.showSiteSelectionStatus();
        },

        changeSelectedGroupLabel: function(newSelectedGroup) {
            if (!newSelectedGroup) {
                newSelectedGroup = jQuery("#groupSelection").select2("data"); // No I18N
            }
            var supportGroup = getMessageForKey("sdp.admin.leftpanel.helpdesk.queues");
            var $el = jQuery("[data-name='dashbdgroup']"); // No I18N
            if (!newSelectedGroup.length) {
                $el.text(supportGroup);
                $el.closest('.btn-group').find('.sdmenu-toggle .sdp-glyph-community').attr('style', '');  //No I18n
                $el.closest(".group-selection-container > label").removeAttr("title"); // No I18N
            } else if (newSelectedGroup.length == 1) {
                $el.text(newSelectedGroup[0].text || newSelectedGroup[0].name);
                $el.closest('.btn-group').find('.sdmenu-toggle .sdp-glyph-community').attr('style', 'color: #009adb;');   //No I18n
                $dash.util.tooltipOnEllipsis($el, $el.closest(".group-selection-container > label"), newSelectedGroup.map(function (v, k, arr) {// No I18N
                    return v.name || v.text
                })); 
            } else {
                $el.text("(" + newSelectedGroup.length + ") " + supportGroup);
                $el.closest('.btn-group').find('.sdmenu-toggle .sdp-glyph-community').attr('style', 'color: #009adb;');   //No I18n
                $el.closest(".group-selection-container > label").attr("title", newSelectedGroup.map(function (v, k, arr) {// No I18N
                    return " " + (v.name || v.text)
                })); 
            }
        },

        showSiteSelectionStatus: function(){
            if(!jQuery("#siteSelection").val() || jQuery("#siteSelection").val() == -1){
                jQuery(".site-selection-container > label > span").eq(0).css("color",""); // No I18N
            }
            else
            {
                jQuery(".site-selection-container > label > span").eq(0).css("color","#009adb"); // No I18N
            }
        },

        //Dashboard On load - update the UI with dashboard specific site & group filters
        updateDashboardSepcificSiteGroup: function(dashboardId) {
            var urlParams = getSDPURLParams();
            if($dash.embed.isSingleWidget || (urlParams.externalframe && (urlParams.site || urlParams.groups))) {
                return;
            }
            var dashboardPersonalization = sdp_user.CLIENT_CONF.Dashboard_Settings;
            if(dashboardPersonalization && dashboardPersonalization.siteGroupFilter=="dashboard_specific") {
                var key = "site_selected_"+dashboardId; //No I18n
                var selectedSite = $dash.filters.defaultSite;
                if(dashboardPersonalization[key]) {
                    selectedSite = dashboardPersonalization[key];
                    if(selectedSite.id > 0) {
                        //Checking whether the Selected site in the filter is active.
                        //If the site is Inactive, Reset the filter and refresh the widget
                        var input_data = {
                            list_info: {
                                fields_required:["name"],  //No I18N
                                search_criteria:[
                                    {field: "deleted",condition: "is", value: false, logical_operator:"AND"},  //No I18N
                                    {field: "name", condition:"is", value: selectedSite.text||selectedSite.name, logical_operator:"AND"}  //No I18N
                                ]
                            }
                        };
                        
                        sdpAjax({
                            url: "/api/v3/widgets/site", //No I18N
                            data: {input_data: sdpToJSON(input_data)},
                            cache: false,
                            success: function(response) {
                                if(response.site.length==0) {
                                    jQuery("#siteSelection").select2("data", $dash.filters.defaultSite); //No I18N
                                    $dash.filters.saveSite(jQuery("#siteSelection")[0]);
                                }
                            }
                        });
                    }
                }
                
                jQuery("#siteSelection").val(selectedSite.id);
                $dash.filters.changeSelectedSiteLabel(selectedSite);

                key = "group_selected_"+dashboardId; //No I18n
                var selectedVals = dashboardPersonalization[key];
                if (selectedVals==undefined) {
                    selectedVals = [];
                }
                $dash.filters.applyGroupSelect2(selectedVals);
            }
        },
    }, //Dashboard Filters code Ends here

    header: {
        initEvents: function() {
            //File widget on change event
            jQuery('[data-name=sspattach],[data-name=sspattachupd]').on("change", function () { //No i18n
                var file = jQuery(this)[0].files[0];
                if (file) {
                    jQuery(this).parent().find('.form-control').text(file.name).attr('title',file.name);
                }
            });
        },

        refreshFrequencyonChange: function(refreshInterval) {
            jQuery(".dashboard-refresh input[type='radio']").on('click', function (evt) {
                var frequency = jQuery(evt.target).val();
                var data = {"refreshTime": frequency};  //No I18n
                jQuery.ajax("/DashBoard.do?action=saveRefreshTime", {"type": "POST", "data": data}).done(function (response, data, stat) {//No I18n 
                    if (stat.status == SC_RESPONSE_STATUS.SC_OK) {
                        clearInterval(refreshInterval);
                        if (frequency) {
                            refreshInterval = $dash.header.setRefreshAtInterval(parseInt(frequency));
                        }
                    }
                }).fail(function (stat, data, error) {
                    if (stat.status == SC_RESPONSE_STATUS.SC_UNAUTHORIZED) {
                        showalert("failure", getMessageForKey("sdp.robo.messages.accessdenied"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80');//No I18n 
                    } else {
                        showalert("failure", getMessageForKey("sdp.dashboard.common.messages.updaterefreshfailure"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80');//No I18n 
                    }
                });
            });
        },

        //Refresh interval in dashboard code starts here
        setRefreshAtInterval: function(refreshFrequency) {
            var refreshInterval = null;
            $dash.header.changeRefreshAdjusterDisplay(refreshFrequency);
            if (refreshFrequency && refreshFrequency != -1)
            {
                refreshFrequency *= 60000;
                refreshInterval = setInterval(function () {
                    refreshWidgets();
                }, refreshFrequency);
            }
            return refreshInterval;
        },

        changeRefreshAdjusterDisplay: function(frequency) {
            var text = frequency + " " + getMessageForKey("sdp.requests.viewrequest.minute");
            if (!frequency) {
                text = getMessageForKey("sdp.requests.viewrequest.noRefresh");
            }
            var $el = jQuery(".refresh-time-indicator"); // No I18N
            $el.closest("label").attr("title", getMessageForKey("sdp.dashboard.common.refreshinterval") + " : " + text); // No I18N
            if (!frequency || frequency == -1) {
                $el.prev(".sdp-glyph").css("color", ""); // No I18N
            } else {
                $el.prev(".sdp-glyph").css("color", "#009adb"); // No I18N
            }
        },

        //Dashboard header initializing
        ready: function(refreshFrequency) {
            var refreshInterval = $dash.header.setRefreshAtInterval(refreshFrequency);
            jQuery(".dashboard-refresh input[type='radio'][value='"+refreshFrequency+"']").prop("checked", true); //No I18n
            $dash.header.refreshFrequencyonChange(refreshInterval);

            var $portal_usage = jQuery("li[data-external=false][data-widgetid=6]"); // No I18N
            $portal_usage.find("iframe").prop("height", parseInt($portal_usage.find('.widget-panel').height() - $portal_usage.find('.widget-panel .widget-poratl-video').outerHeight() - parseInt($portal_usage.find('.widget-panel').css("padding-bottom"))) + "px"); // No I18N

            jQuery('.gridsterul li[data-external=false] div.widget-panel').niceScroll(); //No I18N
            jQuery('.gridsterul li[data-external=false] div.widget-portalrequests-list').getNiceScroll().hide(); //No I18N
            $dash.header.headerStickyPosition();

            var apprlistcntlngt = jQuery('.widget-helpservice-req .row .widget-apprlistcnt-col').length;
            jQuery('.widget-helpservice-req .row .widget-apprlistcnt-col').css({
                "width": (100 / apprlistcntlngt) + "%", //NO I18N
                "float": "left"  //NO I18N
            });
            jQuery("select.max-col-field").select2({
                width: "45px", // No I18N
                minimumResultsForSearch: -1
            });
        },

        //Handling dashboard header fix position
        headerStickyPosition: function() {
            var widgetsMargin = 5;
            jQuery('#headerbar').removeAttr('style'); //No I18N
            var top = jQuery('#headerbar').position().top; //No I18N
            function fixHeaderBar() {
                var width = jQuery('#headerbar').outerWidth(true); //No I18N
                var scrollPos = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                if (scrollPos > top) {
                    jQuery('#headerbar').addClass("headerbar-fixed"); //No I18N
                    jQuery('#headerbar').css({"width": width}); //No I18N
                    jQuery('.widgets-container').css({"marginTop": (jQuery('#headerbar').height() + widgetsMargin) + "px"}); //No I18N
                } else {
                    jQuery("#headerbar").removeClass("headerbar-fixed"); //No I18N
                    jQuery('#headerbar').removeAttr('style'); //No I18N
                    jQuery('.widgets-container').removeAttr('style');    //No I18N
                }
            }
            jQuery(window).on('scroll', fixHeaderBar);
            fixHeaderBar();
        }
    },

    delete: {
        //Remove the Dashboard name from UI
        removeDashboardFromOrganizeTabsList: function(dashboardId) {
            jQuery("#dashboard-settings-dialog [data-name='dsnrml']").find("div#" + dashboardId).remove();
        },

        deleteDashboard: function(viewid,elem,mode) {
            if(!$dash.util.isTheOnlySelectedTab()) {
                if(mode == "standalone") {
                    var $dialog = showDialog(jQuery("#delete-confirmation-template").html(),"modal=yes,width=330,position=absmiddle,closeButton=no"); //NO OUTPUTENCODING //No I18N
                    $dialog = jQuery($dialog);
                    $dialog.find(".confirm-delete").on('click', function(){
                        $dash.delete.sendDeleteRequest(viewid, elem, closeDialog);
                    });
                    $dialog.find(".cancel-delete, #digCloseBtn1").off('.dashdelete').on('click.dashdelete', closeDialog); //NO I18N
                }
                else if(mode == "inline") {
                    $elem = jQuery(elem).closest(".dsetalgn"); // No I18N
                    var $div = jQuery("<div class='inline-delete-confirmation' data-name='settDelete' />");
                    var $p = jQuery("<p/>");
                    var $b = jQuery("<b/>");
                    $b.append(getMessageForKey("sdp.dashboard.common.messages.confirmdelete"));
                    $p.append($b);
                    var $footer = jQuery("<div class='submit-btns p10'/>");
                    $footer.append("<button type='button' value='confirm' class='btn btn-danger confirm-delete mr10'>"+getMessageForKey("sdp.requests.config.delete")+"</button>"); // No I18N
                    $footer.append("<button type='button' value='cancel' class='btn btn-default cancel-delete'>"+getMessageForKey("sdp.common.cancel")+"</button>"); // No I18N
                    $footer.find(".confirm-delete").on('click', function(evt){
                        $dash.delete.sendDeleteRequest(viewid, elem);
                    });
                    $footer.find(".cancel-delete").on('click', function(){
                        jQuery(this).closest(".dsetalgn").find(".dsshare,.dsedit,.dsdelete").removeClass("hide"); // No I18N
                        jQuery(this).closest(".inline-delete-confirmation").remove(); // No I18N
                    });
                    var $dbwrapper = jQuery("<div class='dashboardwrapper pt10' />");
                    $dbwrapper.append($p);
                    $dbwrapper.append($footer);
                    $div.append($dbwrapper);
                    $elem.append($div);
                    $elem.find(".dsshare,.dsedit,.dsdelete").addClass("hide");
                    if($elem.closest(".dsetnrml").find(".dsetalgn").length-1 == $elem.index()){ // No I18N
                        // if this is the last element in the list, then scroll down to show that form has opened.
                        setTimeout(function(){
                            $dash.util.scrollTo($elem.closest(".wrapper"),$elem.find(".cancel-delete"),$elem.find(".cancel-delete").height()); // No I18N
                        }, 1);
                    }
                }
            }
            else {
                showalert("failure",getMessageForKey("sdp.dashboard.common.messages.deleteviewfailure.lastdashboard"),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
            }
        },
        
        deleteCurrentView: function(el){
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                var viewid = jQuery("#activeViewId").val(); // No I18N
                $dash.delete.deleteDashboard(viewid,null,"standalone"); // No I18N
            }
        },

        sendDeleteRequest: function(viewid, elem, onsuccess){
            var url = '/DashBoardView.do?action=deleteView&viewId=' + encodeURIComponent(viewid); //No I18n
            jQuery.post(url).done(function(response,data,stat) {
                if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                    if ($dash.util.isCurrentActiveTab(viewid)) {
                        $dash.init.selectAlternateDashboard(viewid);
                    }
                    setTimeout(function(){
                        if(elem)
                        {
                            jQuery(elem).closest(".dsetalgn").remove(); // No I18N
                            jQuery(elem).closest('.wrapper').getNiceScroll().resize(); // No I18N
                        }
                        $dash.delete.removeDashboardFromOrganizeTabsList(viewid);
                        $dash.init.repaintTabs(false);
                        if(onsuccess)
                        {
                            onsuccess();
                        }
                        showalert("success",getMessageForKey("sdp.dashboard.common.messages.deleteviewsuccess"),'isAutoHide=true,delay=3,width=600'); // No I18N
                    },1);
                }
            }).fail(function(stat,data,errorThrown) {
                if(stat.status == SC_RESPONSE_STATUS.SC_UNAUTHORIZED){ 
                    showalert("failure",getMessageForKey("sdp.robo.messages.accessdenied"),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                }
                else {
                    showalert("failure",getMessageForKey("sdp.dashboard.common.messages.deleteviewfailure"),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                }
            });
        },

        deleteView: function(elem) {
            var viewid = jQuery(elem).closest(".dsetalgn").attr('id'); //No I18n
            jQuery(elem).closest(".wrapper").find(".cancel-delete").trigger('click'); // close the previous delete form // No I18N
            $dash.delete.deleteDashboard(viewid,elem,"inline"); // No I18N
        }
    },

    customize: {
        showCustomizationOptions: function(el) {
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                let widgets = $dash.newWidgets;
                widgets.editMode = true;
                if(widgets.containsPermissionLessWidgets) {
                    widgets.renderTableGraphWidgets($dash.gridster.options.TableGraphWidgets);
                    widgets.containsPermissionLessWidgets = true;
                }
                widgets.editMode = false;

                jQuery("li.gs-w[data-widgettype='2']").find(".remove-custom-report , .edit-custom-report").css("visibility",""); //No I18N
                jQuery('#customize-checkbox').prop("checked", true).trigger('change'); //No I18n
                jQuery('.dashboardsiteoraganise,.dashboardtabsui li:not(.active)').addClass('hide');
                jQuery('.dashboardwidgetoraganise').removeClass('hide');
                jQuery(".dashboardtabsshow").addClass("hide");
                jQuery(".sdtabs-ui2").css({
                    "width": "auto" // No I18N
                });
                //Dashboard - customize - show header
                jQuery('.widget-header[style*="display: none"]').show().parent().find(".widget-panel").height('');
                let container = jQuery("#dboard-content");
                container.find(".refreshreportgraph").toggleClass('disp-flex hide'); // No I18N
                container.find("div.filter").addClass("hide");
                $sdEventListener(container);
            }
        },

        hideCustomizationOptions: function() {
            jQuery("li.gs-w[data-widgettype='2']").find(".remove-custom-report , .edit-custom-report").css("visibility","hidden"); //No I18N
            jQuery('#customize-checkbox').prop('checked', false).trigger('change'); // No I18N
            jQuery('.dashboardsiteoraganise,.dashboardtabsui li:not(.active).hide').removeClass('hide');
            jQuery('.dashboardwidgetoraganise').addClass('hide');
            if (jQuery(".dashboardtabsshow ul > li").length) {
                jQuery(".dashboardtabsshow").removeClass("hide");
            }
            jQuery(".sdtabs-ui2").css({
                "width": "" // No I18N
            });
            applySelect2ForAllVisibleWidgets();
            let container = jQuery("#dboard-content");
            container.find(".widget-header").each(function(i,v) {
                if(jQuery(v).find(".widgets-hdr-txt").text()=="") { 
                    //Dashboard - hide customize - hide header
                    jQuery(v).hide().parent().find(".widget-panel").height('100%');
                }
            });
            container.find(".refreshreportgraph").toggleClass("disp-flex hide"); // No I18N
            container.find("div.filter").removeClass("hide");
        },

        cancelConfig: function() {
            $dash.newWidgets.editMode = false;
            setTimeout(function(){$dash.customize.hideCustomizationOptions();}, 1);
        },

        openAddWidgetDialog: function(el) {
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                $dash.customize.showCustomizationOptions(el);
                setTimeout(function() {
                    jQuery('.dashboardwidgetoraganise [data-name="addandremovewidgets"]').trigger('click');
                }, 1);
            }
        },

        //Show Add external widget UI
        addExternalewidget: function() {
            jQuery('#new-dashboard-dialog .addExternalewidget').removeClass('hide');
            jQuery('#new-dashboard-dialog .addExternalewidget .external-title-field').trigger('focus');
        },

        //Save dashboard after organize
        saveSelectedWidgetsAndConfiguration: function(evt) {
            $dash.newWidgets.editMode = false;
            var numberOfWidgets = jQuery(".gridsterul > li.gs-w").length;
            var maxLimit = parseInt(jQuery("input[name='maxwc']").val());
            if (numberOfWidgets > maxLimit) {
                showalert("failure",getMessageForKey("sdp.dashboard.common.messages.widgetlimitexceeded", [maxLimit, numberOfWidgets, numberOfWidgets - maxLimit]),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                return;
            }
            var id = jQuery("#activeViewId").val();
            var $dashboard = jQuery("#dashboard-settings-dialog").find(".dsetalgn#" + id);
            var dashboardName = $dashboard.find("li.dshddes").attr("data-displayname").trim();
            var dashboardDesc = $dashboard.find("li.dshddes .dashboard-description").text().trim();
            if (!jQuery(".gridsterul > li.gs-w:not([data-module=custom_widget])").length) {
                showalert("failure", getMessageForKey("sdp.dashboard.common.messages.emptydashboardsavefailure"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                return;
            }
            if (!jQuery(".gridsterul > li.gs-w").length) {
                showalert("failure", getMessageForKey("sdp.dashboard.common.messages.emptydashboardsavefailure"), 'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                publishConfiguration(true);
                return;
            }
            var moduleBasedReportsMap = {};
            jQuery.each(jQuery(".gridsterul > li.gs-w"), function(k, widget) { // No I18N
                var $widget = jQuery(widget);
                var widgetName = $widget.attr("data-name");
                if(widgetName=="") {
                    //Dashboard save customize - hide header
                    $widget.find(".widget-header").hide().parent().find(".widget-panel").height('100%');
                }
                if (!$widget.attr("data-external") || $widget.attr("data-external") == "false") {
                    var module = $widget.find(".widget-bg").attr("data-belongsto");
                    if (!module || module == "null") {
                        module = "CustomReport"; // No I18N
                    }
                    var widgetId = $widget.attr("data-widgetid");
                    if (!moduleBasedReportsMap[module]) {
                        moduleBasedReportsMap[module] = [];
                    }
                    var temp = {
                        "name": widgetName, // No I18N
                        "widgetid": widgetId // No I18N
                    };
                    if ($widget.attr("data-widgettype") == "2") {
                        temp.reportid = temp.widgetid.split("_")[1];
                        temp.widgetid = temp.widgetid.split("_")[0];
                    }
                    moduleBasedReportsMap[module].push(temp);
                } else {
                    // external widget
                    var widgetUrl = $widget.find("iframe[name='extrnl-wgt']").attr("src");
                    var widgetType = $widget.find("iframe[name='extrnl-wgt']").attr("type");
                    var widgetid = $widget.find("iframe[name='extrnl-wgt']").attr("id");
                    if (!moduleBasedReportsMap.External) {
                        moduleBasedReportsMap.External = [];
                    }
                    var widgetData = {
                        "name": widgetName, // No I18N
                        "type":widgetType // No I18N
                    };
                    if(widgetType=="Editor") {
                        widgetData.content = jQuery(this).find("iframe[name=extrnl-wgt]")[0].contentDocument.getElementsByTagName("HTML")[0].outerHTML // No I18N
                    }
                    else if(widgetType=="Attach") {
                        if(widgetid.startsWith("dummy")) {
                            if(widgetUrl.startsWith("/servlet/SDAjaxServlet")) {
                                widgetData.id = widgetUrl.slice(widgetUrl.indexOf("id=")+3);
                            }
                        }
                    }
                    else {
                        widgetData.url = widgetUrl;
                    }
                    moduleBasedReportsMap.External.push(widgetData);
                }
            });
            var reportsArr = [];
            jQuery.each(moduleBasedReportsMap, function(k, v) {
                reportsArr.push({
                    "module": k, // No I18N
                    "report_details": v // No I18N
                });
            });
            var dashboardData = {
                "name": dashboardName, // No I18N
                "description": dashboardDesc, // No I18N
                "reports": reportsArr // No I18N
            };

            function publishConfiguration(shouldReload) {
                if (shouldReload) {
                    jQuery("#dashSaveSection [data-name=dashboardwidgetcancel]").trigger("click");
                } else {
                    jQuery(".action-publish").trigger('click');
                    var containsRequestWidgets = "false",
                        containsChangeWidgets = "false";
                    jQuery(".gridsterul > li.gs-w").filter(function(k, v) {
                        if (jQuery(v).find(".widget-bg").attr("data-belongsTo") == "Request") {
                            containsRequestWidgets = "true";
                        } else if (jQuery(v).find(".widget-bg").attr("data-belongsTo") == "Change") { // No I18N
                            containsChangeWidgets = "true";
                        }
                    });
                    configureSiteAndSupportGroupForView(containsRequestWidgets, containsChangeWidgets);
                }
                jQuery("#removedWidgets li[data-external=true]").remove();
                $dash.customize.cancelConfig();
            }
            publishConfiguration();

            //Show / Hide Site, group filter info for table graph widget
            let tableGraphWidgetsAvailable = jQuery("#dboard-content li.widgets[data-module='Graph']:not(.hide), li.widgets[data-module='Table']:not(.hide)").length > 0;
            let siteGroupFilterVisible = jQuery("#dashOrganizeSection #siteFilter,#groupFilter").not(".hide").length > 0; //NO I18N
            let filterInfo = jQuery("#dashOrganizeSection #siteGroupInfo");
            tableGraphWidgetsAvailable && siteGroupFilterVisible ? filterInfo.removeClass("hide") : filterInfo.addClass("hide");
        }
    },

    //Request by widget handling
    requestByWrapper: {
        statusTypes: [{ id: "$Overdue", name: translate("sdp.requests.overdue") }, { id: "$Pending", name: translate("sdp.requests.common.Pending") }, { id: "$Completed", name: translate("sdp.admin.statusDef.complete") }], // No I18n
        inputData: {},
        personalizeKey: "",
        /**
         * Initial function to load and render widget data into the widget
         * */
        init: function () {
            $dash.requestByWrapper.inputData = {};
            $dash.requestByWrapper.collectSiteAndGroups();
            $dash.requestByWrapper.getStatusPersonalizationData();
            var data = sdpAjaxInputData($dash.requestByWrapper.inputData);
            var url = "/api/v3/widgets/" + $dash.requestByWrapper.widgetId + "/_widget_data"; // No I18n
            sdpAjax({
                url: url,
                type: "GET", // No I18n
                data: data,
                success: function (response) {
                    response.widget.data_set = $dash.requestByWrapper.sanitizeWidgetData(response.widget.data_set);
                    $dash.requestByWrapper.latestData = response;
                    $dash.requestByWrapper.preparePopupFilters(response.widget.data_set);
                    $dash.requestByWrapper.renderData(JSON.parse(JSON.stringify(response)));
                    $dash.requestByWrapper.initStatusColumnChooser($dash.requestByWrapper.customizableStatusArr.slice());

                    // Bind events to unhide widget-menu on clicking column chooser
                    jQuery(document).off("click.menubar").on("click.menubar", "#columnsort_status_customize", function () { // No I18n
                        jQuery("#" + jQuery(this).attr("aria-describedby")).addClass("hide"); // No I18n
                        jQuery("[data-widgetname=RequestsBy] .refreshreportgraph").css("visibility", "visible"); // No I18n
                        jQuery("#showPopover .form-footer button, body").off("click.menubar").on("click.menubar", function () { // No I18n
                            jQuery("[data-widgetname=RequestsBy] .refreshreportgraph").css("visibility", ""); // No I18n
                        });
                    });
                    initTooltip("[data-widgetname=RequestsBy]"); // No I18n
                }
            });
            $dash.requestByWrapper.initEvents();
        },

        getPersonalizeKey: function() {
            let dashboardId = dashboardComp.getDashboardId();
            if(dashboardId == undefined) {
                let urlParams = getSDPURLParams();
                if(urlParams.externalframe=='true' && urlParams.view!=undefined) {
                    dashboardId = urlParams.view.replace("DashboardView_", "");
                }
            }
            return "WidgetFilter-"+dashboardId+"_RequestsBy"; // No I18n
        },

        initEvents: function() {
            /**
            * Event trigger that re-renders data when widget is resized & saved
            */
            jQuery(document).off("click.requestby", "button[data-name=dashboardwidgetsave]"); // No I18n
            if (!jQuery("#requestByTable").closest("li").hasClass("rmd-wgt")) { // No I18n
                jQuery(document).on("click.requestby", "button[data-name=dashboardwidgetsave]", function () { // No I18n
                    var newHeight = jQuery("#requestByTable").parent().parent().height(); // No I18n
                    if (newHeight != $dash.requestByWrapper.widHeight) {
                        $dash.requestByWrapper.widHeight = newHeight;
                        $dash.requestByWrapper.renderData(JSON.parse(JSON.stringify($dash.requestByWrapper.latestData)));
                    }
                });
            }

            /**
            * Helper function to construct URL for requests data in requestBy widget
            * @param {Object} req - Object containing criteria and filter by data to construct URL 
             */
            Handlebars.registerHelper('constructURL', function (req) { // No I18n
                var list_info = {};
                list_info.search_criteria = req.criteria;
                list_info.filter_by = req.filter_by;
                if($dash.requestByWrapper.isExternalFrame=='true')  {
                    url = "/WOListView.do?input_data="+ encodeURI(sdpToJSON({list_info: list_info})) +"&viewMode=table"; //NO I18N
                }
                else {
                    url = '/ui/load_list?module=requests&input_data=' + encodeURI(sdpToJSON({list_info})); // No I18n
                }
                return url;
            });
        },

        /** 
         * Functon to fetch all available active statuses
          * @param {Integer} startIndex -  start_index to fetch statuses recursively 
         */
        loadStatuses: function (startIndex) {
            $dash.requestByWrapper.personalizeKey = $dash.requestByWrapper.getPersonalizeKey();
            var inputData = { list_info: { start_index: startIndex, row_count: "100", fields_required: ["id", "name", "internal_name"], get_total_count: true }, for: "dashboard" }; // No I18n
            inputData.list_info.search_criteria = { field: "deleted", condition: "is", logical_operator: "and", value: false }; // No I18n
            inputData = sdpAjaxInputData(inputData);
            var allStatuses = [];
            sdpAjax({
                // api/v3/statuses is unavailable for requester login, Hence using this API to fetch status lists.
                url: "/api/v3/requests/status", // No I18n
                data: inputData,
                type: "GET", // No I18n
                async: false,
                success: function (response) {
                    var statusTypesLen = $dash.requestByWrapper.statusTypes.length;
                    var statuses = response.status;
                    if (response.list_info.has_more_rows) {
                        moreStatuses = $dash.requestByWrapper.loadStatuses(response.list_info.row_count + response.list_info.start_index);
                        statuses = statuses.concat(moreStatuses);
                    } else {
                        for (let i = 0; i < statusTypesLen; i++) {
                            statuses.push($dash.requestByWrapper.statusTypes[i]);
                        }
                    }
                    allStatuses = statuses;
                    if (response.list_info.start_index == 1) {
                        $dash.requestByWrapper.customizableStatusArr = allStatuses;

                        var selectedColumns = [];
                        for (var i = 0; i < allStatuses.length; i++) {
                            var status = allStatuses[i];
                            if (status.internal_name == "Open" || status.internal_name == "Onhold") { // No I18n
                                selectedColumns.push(status.id);
                            }
                        }
                        // For `statusTypes` like OverDue, Pending & Completed, respective IDs are assumed with $ as prefix.
                        selectedColumns.push("$Overdue");// No I18n
                        $dash.requestByWrapper.defaultColumns = selectedColumns;

                        if (!(sdp_user.CLIENT_CONF[$dash.requestByWrapper.personalizeKey] && sdp_user.CLIENT_CONF[$dash.requestByWrapper.personalizeKey].selectedColumns)) {
                            $dash.requestByWrapper.selectedColumns = selectedColumns;
                        } else {
                            $dash.requestByWrapper.selectedColumns = sdp_user.CLIENT_CONF[$dash.requestByWrapper.personalizeKey].selectedColumns;
                        }
                    }
                }
            });
            return allStatuses;
        },

        /** 
         * Functon to initialize column chooser icon and populate data
          * @param {StringArray} statuses - statuses to be shown in the column chooser 
         */
        initStatusColumnChooser: function (statuses) {
            var customizeLink = `<span closeOnBodyClick=true class="btn btn-default sdmenu-toggle" data-column-chooser="" data-switch="sdmenu" id="columnsort_status_customize" data-target-id="#showPopover_status_customize" rel="uitip" title="` + e_attr(translate("column.chooser.title")) + `"><span class="lsprite icon-sm li-clmchooser1" aria-hidden="true"></span></span>`; // No I18n
            var selectedColumns = $dash.requestByWrapper.selectedColumns;

            var statusChooserData = [];
            for (var i = 0; i < selectedColumns.length; i++) {
                var idx = statuses.findIndex(s => s.id == selectedColumns[i]);
                if (idx != -1) {
                    statusChooserData.push({ id: selectedColumns[i], name: e_html(statuses[idx].name), selected: true });
                    statuses.splice(idx, 1);
                }
            }
            for (var i = 0; i < statuses.length; i++) {
                statusChooserData.push({ id: statuses[i].id, name: e_html(statuses[i].name), selected: false });
            }

            jQuery(document).off('click', "#columnsort_status_customize"); // No I18n
            new SortableColumnChooser('status_customize', { // No I18n
                columns: statusChooserData, callBackFunc: function (selectedColumns) {
                    if (selectedColumns.length < 1 || selectedColumns.length > 8) {
                        showalert("failure", translate("sdp.home.ssp.customization.msg.columnoutofrange", [8]), "isAutoHide=true"); // No I18n
                        return;
                    }
                    selectedColumns = unescape(selectedColumns.toString()).split(",");
                    
                    let personalizeValue = {};
                    if(sdp_user.CLIENT_CONF[$dash.requestByWrapper.personalizeKey]) {
                        //Saving Filter and Status column choose in singe personalization
                        personalizeValue = sdp_user.CLIENT_CONF[$dash.requestByWrapper.personalizeKey];
                    }
                    personalizeValue.selectedColumns = selectedColumns;
                    $dash.requestByWrapper.selectedColumns = selectedColumns;

                    ClientUtil.addUserPersonalization("widgetFilter", personalizeValue, {internalKey: $dash.requestByWrapper.personalizeKey}); //No I18N
                    $dash.requestByWrapper.init();
                }, isShowPopover: true, customizeLink: customizeLink, maxAllowedFields: 8
            });
            jQuery("#columnchooser_status_customize").addClass("text-wrap");
        },

        /** 
         * Function to fetch site & group criteria for the widget 
         */
        collectSiteAndGroups: function () {
            var isGroupFilterAvailable = !jQuery("#groupSelection").parents(".group-selection-container").hasClass("hide"); //NO I18N
            var groupIds = [];

            if (isGroupFilterAvailable) {
                var selectedGroups = jQuery("#groupSelection").select2("data"); //No I18N
                for (var group of selectedGroups) {
                    var groupId = group.id;
                    if (!isInteger(groupId) || group.id===group.text || group.id===group.name) {
                        if (group.text) {
                            groupId = dashboardComp.supportGroups[group.text];
                        } else {
                            groupId = dashboardComp.supportGroups[group.name];
                        }
                    }
                    if (groupId) {
                        groupIds.push({ id: groupId });
                    }
                }
            }

            var siteId = jQuery("#siteSelection").val(); //No I18N
            if (siteId == "0") { //All Sites
                siteId = -2;
            }

            $dash.requestByWrapper.inputData = {
                group: groupIds.length == 0 ? undefined : groupIds,
                site: siteId == undefined ? undefined : [{ id: parseInt(siteId) }]
            };
        },

        /** 
         * Function to add user personalize for requestby widget if not present
         * Adds the personalized info to input_data for fetching widget data
         */
        getStatusPersonalizationData: function () {
            var statusPersonalize = $dash.requestByWrapper.selectedColumns;
            var keyLength = statusPersonalize.length;
            for (var i = 0; i < keyLength; i++) {
                var key = statusPersonalize[i];
                if ($dash.requestByWrapper.customizableStatusArr.findIndex(arr => arr.id == key) == -1) {
                    statusPersonalize[i] = undefined;
                }
            }
            statusPersonalize = statusPersonalize.filter(k => k);
            if (!statusPersonalize.length) {
                statusPersonalize = $dash.requestByWrapper.defaultColumns;
            }

            if (keyLength > statusPersonalize.length) {
                ClientUtil.addUserPersonalization("widgetFilter", { selectedColumns: statusPersonalize }, {internalKey: $dash.requestByWrapper.personalizeKey}); //No I18N
            }
            $dash.requestByWrapper.inputData.status = statusPersonalize;
        },

        /**
         * Function to render widget's data in the dashboard widget's area.
          * @param {Object} response - API response from widget_data api with required infos 
         */
        renderData: function (response) {
            var dataSet = response.widget.data_set;
            var availableRows = dataSet.length;
            var statusSet = response.widget.statuses;
            var totalData = dataSet.pop();
            var totalSet = totalData != undefined ? totalData : { series_name: translate("sdp.common.total"), data: new Array(statusSet.length).fill().map(o => ({ value: 0 })) };
            var otherSet;
            var unassignedIndex = dataSet.findIndex(s => s.series_name == translate("sdp.reports.reportHome.unassigned"));
            var unassignedSet = (unassignedIndex != -1) ? dataSet.splice(unassignedIndex, 1)[0] : undefined;

            var widgetHeight = jQuery("#requestByTable").parent().height(); //No I18N
            var perRowHeight = 36;
            var rowsInWidget = Math.floor((widgetHeight - 55 - 25) / perRowHeight); // 55px for table header column & 25px for viewAll button
            var extraRows = (availableRows > rowsInWidget) ? (availableRows - rowsInWidget) : 0;

            dataSet.sort(this.sortResultRequests);

            if (extraRows && !this.viewFullReport) {
                var extras = dataSet.splice(-extraRows);
                otherSet = {};
                otherSet.series_name = translate("sdp.inventory.assethome.others"); //No I18N
                otherSet.data = new Array(dataSet[0].data.length).fill(0);

                for (var i = 0; i < extras.length; i++) {
                    var set = extras[i];
                    for (var j = 0; j < set.data.length; j++) {
                        var datum = set.data[j];
                        otherSet.data[j] += datum.value;
                    }
                }
            }

            // Finding index of Overdue column. Remove &lrm &rlm bidirectional strings if present before comparing string.
            var overDueColumn = $dash.requestByWrapper.selectedColumns.findIndex(k => k == "$Overdue"); // No I18n
            renderhbs("#requestByTable tbody", "request_rows", { statusSet, dataSet, otherSet, unassignedSet, totalSet, overDueColumn }, false, 'dashboard'); // No I18n
            jQuery("#viewAllButton").remove(); // No I18n
            if (!this.viewFullReport && extraRows) {
                var viewAllButton = jQuery(`<div id="viewAllButton" class="pt5"><a class="txtlnk3 pl10" data-event="click" data-handler="jQuery(this).parents('.widget-bg').find('#maximizeWidget').click()" nonce="`+sdpNonce+`" href="/">`+translate("sdp.home.summary.viewall")+`</a></div>`);
                viewAllButton.insertAfter(jQuery("#requestByTable"));
                $sdEventListener(viewAllButton);
            }
        },

        /**
         * Function to remove groups from widgetData that is empty or has no requests.
          * @param {Object} widgetData - Information of all requests in the group selected (technician/category/level/mode etc..) 
         */
        sanitizeWidgetData: function (widgetData) {
            var sanitizedData = [];
            for (var i = 0; i < widgetData.length; i++) {
                var widget = widgetData[i];
                var isDataEmpty = true;
                for (var j = 0; j < widget.data.length; j++) {
                    if (widget.data[j].value) {
                        isDataEmpty = false;
                        break;
                    }
                }

                if (!isDataEmpty) {
                    sanitizedData.push(widget);
                }
            }

            return sanitizedData;
        },

        /**
         * Function to sort widget data in descending order of number of requests in first column. 
         */
        sortResultRequests: function (a, b) {
            return b.data[0].value - a.data[0].value;
        },

        /**
         * Function that makes data available for pop-up filters in rlv popup when widget data is clicked
          * @param {Object} seriesData - Data to be shown in the pop-up dropdown filter 
         */
        preparePopupFilters: function (seriesData) {
            var seriesFilter = [];
            var itemFilter = [];
            var seriesIndex = 0, itemIndex = 0, isSeriesFilterNeeded = true, isItemFilterNeeded = true;
            for (var i = 0; i < seriesData.length; i++) {
                var series = seriesData[i];
                series.index = i;
                seriesFilter.push({
                    index: i, text: series.series_name, id: sdpToJSON(series.data.map(function (dat, idx) {
                        dat.index = idx;
                        return { index: idx, text: dat.label, id: [dat.criteria, dat.filter_by] };
                    }))
                });
            }

            $dash.requestByWrapper.popupFiltersInfo = { seriesFilter, seriesIndex, isSeriesFilterNeeded, itemFilter, itemIndex, isItemFilterNeeded, titleInfo: dashboardComp.defaultWidgetTitleInfo.RequestsBy };
        },
        isExternalFrame: getSDPURLParams().externalframe
    },


    util: {
        isCurrentActiveTab: function(elemViewId) {
            var activeTab = jQuery("#view-listing > li.active").attr("data-viewid") || jQuery("#activeViewId").val();
            if (!activeTab) {
                return false;
            }
            return ((activeTab == elemViewId) || (activeTab.split("_")[1] == elemViewId));
        },

        isTheOnlySelectedTab: function() {
            var selectedTabs = jQuery("#dashboard-settings-dialog [data-name='dsnrml'] .selection-state [name='selected-tabs']").filter(function(k,v){ // No I18N
                return jQuery(v).attr("checked") == 'checked'; // No I18N
            });
            return selectedTabs.length == 1;
        },

        scrollTo: function($scrollElement,$focusElement,optionalOffset) {
            if($scrollElement && $focusElement && $focusElement.offset()){
                $scrollElement.scrollTop(0);
                var elOffset = $focusElement.offset().top;
                if(optionalOffset) {
                    elOffset += optionalOffset;
                }
                $scrollElement.scrollTop(elOffset);
                $scrollElement.getNiceScroll() && $scrollElement.getNiceScroll().resize();
            }
        },

        isOptionPermittedForUser: function($el) {
            return !$el.data("isNotPermitted"); // No I18N
        },

        tooltipOnEllipsis: function($el,$tooltipEl,tooltipText) {
            setTimeout(function(){
                var $cloneEl = $el.clone().css({"display":"inline","width":"auto","max-width":"","visibility":"hidden"}).appendTo("body"); // No I18N
                if($cloneEl.width() > $el.width() )
                {
                    $tooltipEl.attr("title",tooltipText); // No I18N
                }
                else{
                    $tooltipEl.removeAttr("title"); // No I18N  
                }
                $cloneEl.remove();
            },1);
        },

        showFullScreen: function(fullscreen) {
            const dashboardUrl=(fullscreen) ?'/DashBoard.do?noheader=true' : '/DashBoard.do';  //No I18n
            window.open(dashboardUrl,"_self","noopener,noreferrer");
        }
    },

    init: {
        orgRolesUrl: "/OrgRoles.do?action=searchOrgRoles&count=25&defaultRoles=true", // No I18N

        //Dashboard ready function
        ready: function(viewType) {
            var currentView = jQuery('#storagePoint').attr('data-view');
            var $menubar = $dash.init.renderDashboardViewTabs();
            $menubar.replaceLast(jQuery(".sdtabs-ui2").find("li[data-view='"+currentView+"'],li[data-view='DashboardView_"+currentView+"']"));
            jQuery('#view-listing').find('[data-view='+viewType+']').addClass('active'); // NO OUTPUTENCODING
            var dp = new DashboardPermission(sdp_user);
            dp.viewChangeEvent(jQuery("#view-listing li.active"));
            jQuery("#activeViewId").val(jQuery('#view-listing').find('[data-view='+viewType+']').attr("data-viewid"));  // NO OUTPUTENCODING
            $dash.init.updateActiveDashboardMetaData(jQuery("#activeViewId").val());
            $dash.filters.updateDashboardSepcificSiteGroup(jQuery("#activeViewId").val());
            $dash.embed.embededWidgetHandler();
            $dash.init.showWidgets();
            refreshWidgets({isTabSwitch: true});
            $dash.initFilterHandler();
            $dash.embed.externalFrameHandler();
            $sdEventListener("#dboard-content"); // No I18N

            //Site filter click handling
            jQuery(".site-selection-container .sdmenu-toggle").on('click', function(evt){ // No I18N
              var that = this;
              setTimeout(function(){
                  if(jQuery(that).parent().hasClass('open')) {
                    jQuery(that).parent().find("#siteSelection").select2("open"); // No I18N
                  }
              },1);
            });

            jQuery(".gridsterul li.gs-w[data-widgettype='2']").find(".widget-header").find(".edit-custom-report , .remove-custom-report").css("visibility","hidden"); // No I18N
            jQuery("body").removeClass("atp-open").find(".dashboard-ldr ").fadeOut();
        },

        repaintTabs: function(shouldSendRequest) {
            var activeTab = jQuery("#activeViewId").val();
            setTimeout(function() {
                $dash.init.renderDashboardViewTabs();
                if (!jQuery("#view-listing > li[data-viewid='" + activeTab + "']").length) {
                    if (shouldSendRequest) {
                        jQuery("#headerbar .dashboardtabsshow li[data-viewid='" + activeTab + "']").trigger('click');
                    } else {
                        var $menubar = jQuery("#view-listing").OverflowingMenubar();
                        $menubar && $menubar.replaceLast(jQuery("#headerbar .dashboardtabsshow li[data-viewid='" + activeTab + "']"));//NO OUTPUTENCODING
                    }
                    initTooltip("#headerbar"); //NO I18N
                    return;
                }
                jQuery("#view-listing > li[data-viewid='" + activeTab + "']").addClass("active");
                var dp = new DashboardPermission(sdp_user);
                dp.viewChangeEvent(jQuery("#view-listing li.active"));
                initTooltip("#headerbar"); //NO I18N
            }, 1);
        },

        renderDashboardViewTabs: function() {
            var $menubar = jQuery("#view-listing").OverflowingMenubar(jQuery('#dashboard-settings-dialog [data-name="dsnrml"] > .dsetalgn .dshddes'), {
                "$listContainer": "#view-listing", // No I18N
                "onPopulateCallback": function(that) { // No I18N
                    var tabIterator = 1;
                    jQuery.map(jQuery("#view-listing").parent().find("li"), function(elem, index) { // No I18N
                        elem = jQuery(elem);
                        elem.data("tabNo", tabIterator++); // No I18N
                    });
                    var lis = that.find(".dashboardtabsshow").find("li"); // No I18N
                    for(var i = 0 ; i < lis.length ; i++){
                        lis.eq(i).attr({title: lis.eq(i).find("a").text(), mode_elipsis: "true", rel: "uitip"}); //NO I18N
                    }
                    jQuery("#view-listing").parent().find("li").attr({"data-event": "click", "data-handler": "$dash.init.loadViewContent(this);", "nonce": sdpNonce});
                }
            });
            $menubar.populate();
            $sdEventListener(jQuery("#dashboardTabsDiv"));
            return $menubar;
        },

        isLoading: false,
        //Change dashboard tabs
        loadViewContent: function(elem) {
            let newWidgets = $dash.newWidgets
            newWidgets.widgetData = {};
            newWidgets.tableCompObj = {};
            if(this.isLoading) {
                return;
            }
            this.isLoading = true;
            if(!jQuery("#dboard-content").hasClass("gs-resize-disabled")) {
                return; //if the organize option is enabled then dashboard names click will do nothing
            }
            jQuery(document).off("click.requestby"); // No I18n
            var viewid = jQuery(elem).attr("data-viewid") // No I18N
            var dataUrl = jQuery(elem).attr('data-reporturl');
            if (!dataUrl) {
                var viewName = jQuery(elem).attr('data-view');
                if (viewName) {
                    dataUrl = 'DashBoard.do?action=getConfig&viewType=' + encodeURIComponent(viewName); //No I18n
                }
            }
            $dash.filters.updateDashboardSepcificSiteGroup(viewid);
            jQuery(".dashboardsiteoraganise #refreshTimeDiv,.dashboard-new-actions-dropdown,.dashboard-actions-dropdown").removeClass("hide");
            jQuery.ajax(dataUrl).done(function(response,data,stat){
                $dash.init.isLoading = false;
                if(stat.status == SC_RESPONSE_STATUS.SC_OK){
                    jQuery("#activeViewId").val(viewid); // No I18N
                    jQuery("#content-parent").find(" input , select ").select2("destroy"); // No I18N
                    jQuery("#content-parent").html(response); // No I18N NO OUTPUTENCODING
                    $dash.init.updateActiveDashboardMetaData(viewid);
                    $dash.init.showWidgets();        
                    refreshWidgets({isTabSwitch: true});
                    $dash.initFilterHandler();
                    jQuery(elem).closest('#view-listing').find('li').removeClass('active'); //No I18n
                    jQuery(elem).addClass('active');
                    var dp = new DashboardPermission(sdp_user);
                    dp.viewChangeEvent(jQuery(elem));
                    jQuery(".gridsterul li.gs-w[data-widgettype='2']").find(".widget-header").find(".edit-custom-report , .remove-custom-report").css("visibility","hidden"); // No I18N
                    initTooltip("#dboard-content"); //NO I18N
                    $sdEventListener("#dboard-content"); //NO I18N
                }
            });
        },

        //Loading all the widgets
        showWidgets: function() {
            let isSDAdmin = sdp_user.ROLES.indexOf("SDAdmin")!=-1;
            var hasReqModuleReports = jQuery('#storagePoint').attr('data-hasreqmodule');
            var hasChangeModuleReports = jQuery('#storagePoint').attr('data-haschangemodule');
            //TODO: show/hide Site & SupportGroup select component based on hasReqModuleReports & hasChangeModuleReports
            configureSiteAndSupportGroupForView(hasReqModuleReports,hasChangeModuleReports);
            let storagePoint = jQuery("#storagePoint");
            var viewName = storagePoint.attr('data-view');
            var configJsonStr = storagePoint.data('configjson'); //No I18n
            var basePublishUrl = storagePoint.attr('data-publishbaseurl');
            let allowedWidgets = storagePoint.data("allowedwidgets"); //No I18n
            var defaultWidDim = null, TableGraphWidgets = null, customWidDim = null, extWidDim=null, extUrlInfo = null, removedExtWid = [], removedDefWid=null, removedWid=null, maxCols=2, isWide=true, bgColor = 1;
            var getDefaultJSON = function(){}
            if(configJsonStr != ''){        
                var configJsonObj = (typeof configJsonStr == 'string') ? JSON.parse(configJsonStr) : configJsonStr; //No I18n
                var dimensionJson = configJsonObj.diminfo;
                var urlInfo = configJsonObj.urlinfo;
                var props = configJsonObj.properties;
                if(props.max_cols)
                {
                    maxCols = props.max_cols;
                }
                else
                {
                    maxCols = 2;
                }
                isWide = props.isWideLayout;
                bgColor = props.bgColor;
                if(configJsonObj.diminfo)   
                {
                    defaultWidDim = dimensionJson.DefaultWidgets;
                    
                    //Finding the shared table and graph widgets
                    TableGraphWidgets = dimensionJson.TableGraphWidgets;
                    if(TableGraphWidgets==undefined && $dash.newWidgets.TableGraphWidgets) {
                        TableGraphWidgets = {};
                        $dash.newWidgets.TableGraphWidgets.each(function(widget) {
                            TableGraphWidgets[widget] = [0,0,0,0];
                        });
                    }
                    let allowedTableGraphWidgets = {};
                    //Assign allowed table and graph widgets only if not sdAdmin and the dashboard is not private
                    if(!isSDAdmin && jQuery("#dashboard-settings-dialog #"+viewName+" .dsshare .private-filter").length==0) {
                        if(allowedWidgets) {
                            for(i=0;i<allowedWidgets.length;i++) {
                                let id = allowedWidgets[i];
                                allowedTableGraphWidgets["Graph_"+id]=TableGraphWidgets["Graph_"+id];
                                allowedTableGraphWidgets["Table_"+id]=TableGraphWidgets["Table_"+id];
                            }
                        }
                        TableGraphWidgets = allowedTableGraphWidgets;
                    }
                    
                    if(dimensionJson.CustomWidgets != null){
                        customWidDim = dimensionJson.CustomWidgets;
                    }
                    removedDefWid = dimensionJson.RemovedDefaultWidgets;
                    removedWid = dimensionJson.RemovedWidgets;

                    extWidDim = dimensionJson.ExternalWidgets;
                    extUrlInfo = urlInfo.ExtUrlInfo;
                    removedExtWid = urlInfo.RemovedExtUrlInfo;
                }
                getDefaultJSON = constructDefaultDimensions(configJsonObj);
            }
            else {
                getDefaultJSON = constructDefaultDimensions(null);
            }
            jQuery("select.max-col-field").select2("val",maxCols); // No I18N
            jQuery('#storagePoint').remove();
            if($dash.embed.isSingleWidget) {
                removedWid = null;
            }
            //MSP code to set widget height as 100 for kpi widgets
            var min_height = 300;
            var maxColumnsAllowed=4;
            if(jQuery("#activeViewId").val() == 'MSP_Executive') {
                min_height = 100;
            }
            if(isMSPOrSCP){
                maxColumnsAllowed=8;
            }
            if(isMSP && props.min_height){
                min_height = props.min_height;
            }
            test123 = jQuery(".ds-container .gridster").dashboard({
                "isDashboard" : true, // No I18N
                "autogenerateDataOnNull": getDefaultJSON,   //No I18n
                "defaultWidgets" : defaultWidDim,   //No I18n
                TableGraphWidgets: TableGraphWidgets,
                "customWidgets" : customWidDim, //No I18n
                "externalWidgets": extWidDim,   //No I18n
                "removedDefaultWidgets" : removedDefWid,    //No I18n
                "removedWidgets" : removedWid,  //No I18n
                "removedExternalWidgets" : removedExtWid,   //No I18n
                "extUrlInfo": extUrlInfo,   //No I18n
                "title" : "Dashboard Customization", //No I18N
                "widgetTitleMaxLength" : $dash.common.widgetNameMaxLength,    //No I18n
                "namespace": ".widgets-container", //No I18N
                "alwaysCustomize": false,   //No I18n
                "responsiveDashboard" : true,   //No I18n
                "bgColor" : bgColor,    //No I18n
                "isWideLayout" : isWide,    //No I18n
                "numberOfColumns" : maxCols,    //No I18n
                "maxColumnsAllowed" : maxColumnsAllowed,    //No I18n
                "numberOfRows": 25, //No I18N
                "buttons" : {          //No I18n
                   "discard":true,         //No I18n
                   "publish": {"url":basePublishUrl+"&view="+encodeURIComponent(viewName), "name":"Save"}   //NO OUTPUTENCODING //No I18n
               },
               "tooltips" : { // No I18N
                    "removeWidget" : getMessageForKey("sdp.home.ssp.customization.common.removewidget") // No I18N
               },
                "CONSTANTS" :{  //No I18n
                    "MIN_HEIGHT" : min_height, //No I18n
                    "MARGIN" : 4 //No I18N
                },
                "initMoreGridConfigParamFunc" : function(config){   //No I18n
                    config.CustomWidgets = {};
                },
                "saveConfigInterceptorFunc" : function(widget, config, get){    //No I18n
                    var widgetReportType = jQuery(widget).attr("data-widgetType");
                    if(typeof widgetReportType !== 'undefined' && widgetReportType == "2"){
                        config.CustomWidgets[get(widget, "id")] = ([get(widget, "row"), get(widget, "col"), get(widget, "sizex"), get(widget, "sizey")]); //No I18N
                    } else {
                        config.DefaultWidgets[get(widget, "id")] = ([get(widget, "row"), get(widget, "col"), get(widget, "sizex"), get(widget, "sizey")]); //No I18N                
                    }
                },
                "collectConfigurationCallback" : function(dashboard,config) {   //No I18n
                    config.RemovedCustomWidgets = {};
                    jQuery.each(dashboard.parent().find(".widget-restoremn .restore-default-widget").eq(1).find(".rmd-wgt"),function(k,v){ //No I18N
                        var data = jQuery(v).find(".rm-wdg-name").data("dim");  //No I18n
                        config.RemovedCustomWidgets[data.id] = [data.row,data.col,data.sizex,data.sizey];
                    });
                },
                "preRemoveWidgetHook" : function(widgetContainerElem){ // No I18N
                    jQuery(widgetContainerElem).find('.widget-select').select2("destroy"); // No I18N
                },
                "restoreWidgetHook" : function(widgetContainerElem){    //No I18n
                    var contentDivElem = jQuery(widgetContainerElem).find('.widget-summaryrequests-list > div');
                    if(jQuery(contentDivElem).find(':first').length == 0){
                        //Do the refresh functionality to do ajax & render the data.                
                        reloadDataForRestore(jQuery(widgetContainerElem));              
                    }
                },
                "messages" : { //No I18N
                    "onDiscardFail" : getMessageForKey("sdp.home.ssp.customization.msg.discardfail"), //No I18N
                    "onDiscardSuccess" : getMessageForKey("sdp.home.ssp.customization.msg.discardsuccess"), //No I18N
                    "onPublishSuccess" : getMessageForKey("sdp.home.ssp.customization.msg.savesuccess"), //No I18N
                    "onPublishFailure" : getMessageForKey("sdp.home.ssp.customization.msg.savefail"), //No I18N
                    "onNetworkFailure" : getMessageForKey("sdp.home.ssp.customization.msg.networkfail"), //No I18N
                    "onWidgetAddSuccess" : getMessageForKey("sdp.home.ssp.customization.msg.widgetaddsuccess"), //No I18N
                    "onWidgetNameInvalid" : getMessageForKey("sdp.home.ssp.customization.msg.widgetnameinvalid"), //No I18N
                    "onURLEmpty" : getMessageForKey("common.onempty",[getMessageForKey("common.url")]),//No I18N
                    "onInvalidURL" : getMessageForKey("sdp.home.ssp.customization.msg.urlinvalid"), //No I18N
                    "onNumberOfColumnsOutOfRange" : getMessageForKey("sdp.home.ssp.customization.msg.columnoutofrange", [4]), //No I18N
                    "onUnsupportedColumnValue" : getMessageForKey("sdp.home.ssp.customization.msg.columninvalid"), //No I18N
                    "onUpdateWidgetSuccess" : getMessageForKey("sdp.home.ssp.customization.msg.updatedwidgetsuccess"), //No I18N
                    "onUpdateWidgetFailure" : getMessageForKey("sdp.home.ssp.customization.msg.updatedwidgetfail") //No I18N
                }
            });
            test123._el.recalculateContainerWidthDefaults();
            if(!bgColor)
                bgColor = 1;
            if(isWide) {
                jQuery("#Boxed").removeAttr("selected"); // No I18N
                jQuery("#Wide").attr("selected",true); // No I18N
                test123._el.setWideLayout();
            }
            else {
                jQuery("#Boxed").attr("selected",true); //No I18n
                jQuery("#Wide").removeAttr("selected"); // No I18N
                test123._el.setBoxedLayout();
            }
            $dash.init.repaintTabs(false);
            test123._el.setBGColor(jQuery("#dashboard-settings-dialog .widget-layout-col .widget-clr"+bgColor));
            jQuery("#dashboard-settings-dialog #bgcolorMenu span.disp-ib").removeClass("widget-clr1 widget-clr2 widget-clr3 widget-clr4").addClass("widget-clr" + bgColor); // No I18N
            jQuery(".ds-container .gridster").data("dashboard",test123); // No I18N
            delete test123;
            setDefaultSelectForAllDropDowns();
            
            let dashId = isNumeric(viewName) ? viewName : "";
            let dashName = jQuery("#view-listing [data-viewid="+viewName+"]").text();
        },

        selectAlternateDashboard: function(viewid) {
            var $tab = jQuery("#dashboard-settings-dialog .dsetalgn#"+viewid); // No I18N
            var $selectedTabs = jQuery("#dashboard-settings-dialog .dsetalgn").filter(function(k,v){
                return jQuery(v).find(".selection-state input[name='selected-tabs']").attr("checked", "checked"); // No I18N
            });
            var $alternateTab = null;
            var i = 0;
            while($selectedTabs.eq(i).attr("id") == $tab.attr("id")) { // No I18N
                i++;
            }
            $alternateTab = $selectedTabs.eq(i);
            var alternateTabId = $alternateTab.attr("id"); // No I18N
            jQuery("#activeViewId").val(alternateTabId); // No I18N
            $dash.init.loadViewContent(jQuery(".sdtabs-ui2 .menu-tab[data-viewid='"+alternateTabId+"']"));
        },

        updateActiveDashboardMetaData: function(viewid) {
            jQuery("#dashboard-settings-dialog .dsetalgn").find(".selection-state").css("visibility",""); // No I18N
            if(viewid=="") {
                viewid = jQuery("#dashboard-settings-dialog .dsetalgn")[0].id;
                if(getSDPURLParams().action=='embeddashboard') {
                    window.open("/jsp/AuthError.jsp", "_self"); // No I18N
                }
            }
            if(viewid) {
                var $currentDashboardMetaData = jQuery("#dashboard-settings-dialog .dsetalgn#"+viewid); // No I18N
                $currentDashboardMetaData.find(".selection-state").css("visibility","hidden"); // No I18N
            }
        }
    },

    /* Create Dashboard scripts starts here */
    createEdit: {
        openAddNewDashboard: function(url) {
            this.closeAddDashboard();
            this.addDashboardContainer = jQuery("<div id='createDashContainer'></div>").show().panelSlider({
                width: 900,
                header: false,
                placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                dialogClass: "tabui-rightpanel pos-fix", // NO I18N
                open: function() {
                    sdpAjax({
                        url: url || "/DashBoardView.do?action=createView", // NO I18N
                        dataType: "HTML", // No I18N
                        success: function(response) {
                            jQuery("#createDashContainer").html(response);
                            $dash.createEdit.constructWidgetsList().then(function() {
                                $dash.createEdit.createDashboardInit();
                                initTooltip("#createDBCPanel"); //NO I18N
                            });
                        }
                    });
                },
            });
        },

        constructWidgetsList: async function() {
            let _this = this;

            function getExecutiveData(widget) {
                let isNonExecutiveWidget = $dash.newWidgets.isNonExecutiveModule(widget.module);
                let executiveOnly = "";
                if(widget.module=="request") {
                    if(widget.isExeWidget==undefined) {
                        widget.isExeWidget = JSON.parse(widget.properties).isExecutiveWidget;
                    }
                    isNonExecutiveWidget = !widget.isExeWidget;
                    executiveOnly = widget.isExeWidget ? "executiveOnly" : ""; //NO I18N
                }
                return {isNotExecutiveWidget: isNonExecutiveWidget, executiveOnly: executiveOnly};
            }

            let tableGraphWidgets = await $dash.newWidgets.loadTableGraphRemovedWidgets({addEditDash: true});
            //Not Available or removed Table graph widgets in the dashboard
            for(let module in tableGraphWidgets) { 
                let widgets = tableGraphWidgets[module];
                let widgetCount = widgets.length;
                for(i=0;i<widgetCount;i++) {
                    let widget = widgets[i];
                    let executiveData = getExecutiveData(widget);
                    _this.groupedReports[module].push({widgetid: widget.id, displayname: widget.name, name: widget.name, module: module, ...executiveData});
                }
            }

            if(templateData.isEdit) {
                //Available Table Graph widgets in the dashboard
                let widgets = $dash.createEdit.tableGraphWidgets;
                for(let id in widgets) {
                    let name = widgets[id];
                    let widgetId = id.replace("Table_", "").replace("Graph_", ""); //No I18n

                    let widgetData = await $dash.newWidgets.getWidgetData(widgetId);
                    let executiveData = getExecutiveData(widgetData);

                    let type = id.startsWith("Table_") ? "Table" : "Graph"; //No I18n
                    if(_this.groupedReports[type]==undefined) {
                        _this.groupedReports[type] = [];
                    }
                    _this.groupedReports[type].push({widgetid: widgetId, displayname: name, name: name, module: type, is_selected: true, ...executiveData});
                }
                
            }

            executiveModules = ["helpdesk", "Table", "Graph"]; //No I18n
            let exeModuleCount = executiveModules.length;
            for(let i=0;i<exeModuleCount;i++) {
                let moduleData = _this.groupedReports[executiveModules[i]];
                if(moduleData) {
                    moduleData.isExecutiveModule = true;
                }
            }

            for(let i=0;i<_this.allCheckedModules;i++) {
                let moduleData = _this.groupedReports[_this.allCheckedModules[i]];
                if(moduleData) {
                    moduleData.isAllChecked = true;
                }
            }

            moduleI18NKeys = {"helpdesk":"sdp.admin.leftpanel.helpdesk", "problemchange":"sdp.home.dashboard.problemchange", "problemchange":"sdp.header.newchange", "problemchange":"sdp.header.newproblem", "asset":"sdp.header.asset", "project":"sdp.header.projects", "custom_widget":"sdp.dashboard.customwidget.header.label", "custom_report":"sdp.reports.customReportFilter.topHead", "Table": "dashboard.table.widget", "Graph": "dashboard.graph.widget"}; //No I18n
            if(sdp_app.IS_MSP){
                moduleI18NKeys.mspexecutive="sdp.msp.dashboard"; // NO I18N
            }
            if(sdp_app.IS_SCP){
                moduleI18NKeys.customer="sdp.dashboard.common.customerwidgets"; // NO I18N
                moduleI18NKeys.AllBU="sdp.dashboard.common.allbuwidgets"; // NO I18N
            }
            for(let key in _this.groupedReports) {
                _this.groupedReports[key].moduleName = moduleI18NKeys[key];
                if(_this.groupedReports[key].length==0) {
                    delete _this.groupedReports[key];
                }
            }

            orderedGroupedReports = [];
            _this.moduleGroups.forEach(function(module) {
                if(_this.groupedReports[module]) {
                    _this.groupedReports[module].module = module;
                    orderedGroupedReports.push(_this.groupedReports[module]);
                }
            });
         
            templateData.groupedReports = orderedGroupedReports;
            templateData.externalReports = _this.externalReports;
            templateData.isMSPOrSCP = sdp_app.IS_MSPOrSCP;
            templateData.maxColumns = sdp_app.IS_MSPOrSCP?6:4;
            templateData.widgetNameLength = $dash.common.widgetNameMaxLength;
            renderhbs("#createNewDashboardHolder", 'add-new-dashboard', templateData, false, "dashboard"); // NO I18N

            if(sdp_user.ROLES.indexOf("SDAdmin")!=-1 || sdp_user.ROLES.indexOf("SDSiteAdmin")!=-1) {
                let viewId = jQuery("#new-dashboard-dialog").data("id"); // No I18N
                let url = "/dashboard/DashboardSharing.jsp?isNotStandAlone=true"; // No I18N
                if(viewId) {
                    url = url+"&viewId="+encodeURIComponent(viewId); // No I18N
                }
                sdpAjax({
                    url: url,
                    dataType: "HTML",// No I18N
                    success: function (resp) {
                        jQuery("#dashSharingHolder").html(resp);
                    }
                });
            }
            zcomponent.collapsible_init('#createDBCPanel'); //No I18n
            initTooltip("#createDBCPanel"); //No I18n
        },

        closeAddDashboard: function() {
            if(this.addDashboardContainer) {
                this.addDashboardContainer.dialog('close'); //NO I18N
                this.addDashboardContainer.dialog('destroy'); //NO I18N
                delete this.addDashboardContainer;
            }
            jQuery("#alertbox").remove();
        },

        editCurrentView: function(el) {
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                var $tab = jQuery("#view-listing").find("li.active");
                if ($tab.length) {
                    var viewname = $tab.attr("data-view");
                    var splitArr = viewname.split("_");
                    if (splitArr.length == 1) {
                        return;
                    }
                    jQuery("#share-dashboard-dialog").remove();
                    $dash.createEdit.showEditDialog(splitArr[1]);
                }
            }
        },

        editView: function(elem) {
            var viewid = jQuery(elem).closest(".dsetalgn").attr('id'); //No I18n
            $dash.createEdit.showEditDialog(viewid);
        },

        showEditDialog: function(viewid) {
            var url = '/DashBoardView.do?action=editView&viewId=' + encodeURIComponent(viewid); //No I18n
            $dash.createEdit.openAddNewDashboard(url);
        },

        showSettingsDialog: function(el) {
            if($dash.util.isOptionPermittedForUser(jQuery(el).find(">a"))) {
                var dialogContent = jQuery("#dashboard-settings-dialog").html();//NO OUTPUTENCODING
                // SD-108216
                var DigLeftPos = (jQuery(window).width() - 800) / 2;
                var $settingsBox = showDialog(dialogContent, "modal=yes,top=30,left="+DigLeftPos+",width=800,position=absolute,closeButton=no"); // No I18N
                jQuery("#_DIALOG_CONTENT #bulkactionsMenu span.disp-ib").text(jQuery("#_DIALOG_CONTENT a[name=layout-style][selected=selected]").text()); //NO I18N
                var dashboardPersonalization = sdp_user.CLIENT_CONF.Dashboard_Settings;
                var selectedOption = "all_dashboard"; // No I18N
                if(dashboardPersonalization && dashboardPersonalization.siteGroupFilter) {
                    selectedOption = dashboardPersonalization.siteGroupFilter;
                }
                jQuery("#_DIALOG_CONTENT #Support_Filter span.disp-ib").text(jQuery("#_DIALOG_CONTENT a[name=siteGroupFilterToggle][id="+selectedOption+"]").text()); //NO I18N
                $settingsBox = jQuery($settingsBox);
                initTooltip("#_DIALOG_CONTENT .dashboardwrapper"); // No I18N

                function setSettingsDialogBoxEvents() {
                    function saveDashboardGlobalProperties(data, onsuccess) {
                        if (!onsuccess) {
                            onsuccess = function() {}
                        }
                        jQuery.ajax("/DashBoardView.do", { // No I18N
                            "type": "POST", // No I18N
                            "data": { // No I18N
                                "action": "saveDashboardGlobalOptions", // No I18N
                                "input_data":  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data)  // No I18N
                            }
                        }).done(onsuccess);
                    }

                    function saveDashboardTabData(data, onsuccess) {
                        if (!onsuccess) {
                            onsuccess = function() {}
                        }
                        jQuery.ajax("/DashBoardView.do", { // No I18N
                            "type": "POST", // No I18N
                            "data": { // No I18N
                                "action": "saveDashboardTabOptions", // No I18N
                                "input_data":  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data)  // No I18N
                            }
                        }).done(onsuccess);
                    }
                    $settingsBox.find('.showmenu').on('click', function(e) {
                        e.stopPropagation();
                    });
                    $settingsBox.find("#Boxed").on('click', function(evt) {
                        $settingsBox.find("#bulkactionsMenu .disp-ib").text(jQuery(this).text());
                        saveDashboardGlobalProperties({
                            "wide_layout": false // No I18N
                        }, function(response,data,stat) {
                            if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                                jQuery(".content-panel-inner").css("width",""); // No I18N
                                jQuery(".ds-container .gridster").data("dashboard")._el.recalculateContainerWidthDefaults(); // No I18N
                                jQuery(".ds-container .gridster").data("dashboard")._el.setBoxedLayout(); // No I18N
                                jQuery("#dashboard-settings-dialog").find("#Boxed").attr("selected",true); // No I18N
                                jQuery("#dashboard-settings-dialog").find("#Wide").attr("selected", false); // No I18N
                                $dash.init.repaintTabs(false);
                            }
                        });
                    });
                    $settingsBox.find("#Wide").on('click', function(evt) {
                        $settingsBox.find("#bulkactionsMenu .disp-ib").text(jQuery(this).text());
                        saveDashboardGlobalProperties({
                            "wide_layout": true // No I18N
                        }, function(response,data,stat) {
                            if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                                jQuery(".content-panel-inner").css("width",""); // No I18N
                                jQuery(".ds-container .gridster").data("dashboard")._el.recalculateContainerWidthDefaults(); // No I18N
                                jQuery(".ds-container .gridster").data("dashboard")._el.setWideLayout(); // No I18N
                                jQuery("#dashboard-settings-dialog").find("#Wide").attr("selected",true); // No I18N
                                jQuery("#dashboard-settings-dialog").find("#Boxed").attr("selected", false); // No I18N
                                $dash.init.repaintTabs(false);
                            }
                        });
                    });
                    $settingsBox.find("#dashboard_specific,#all_dashboard").on('click', function(evt) {
                        jQuery(evt.target).closest("#container-template").find("#Support_Filter span.disp-ib").text(evt.target.text); //No I18N
                        ClientUtil.addUserPersonalization("Dashboard_Settings", {siteGroupFilter: evt.target.id}).then((message) => { // No I18N
                            showalert("success",getMessageForKey("sdp.admin.common.updatedsuccessfully"),'isAutoHide=true'); // No I18N
                        });
                    });
                    $settingsBox.find(".widget-layout-col li a").on('click', function() {
                        var colorIndex = jQuery(this).parent().index() + 1;
                        $elem = this;
                        saveDashboardGlobalProperties({
                            "bgcolor": colorIndex // No I18N
                        }, function(response,data,stat) {
                            if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                                $settingsBox.find(".widget-layout-col li a").removeClass('active');
                                jQuery("#dashboard-settings-dialog").find(".widget-layout-col > li a").removeClass('active'); // No I18N
                                jQuery(".ds-container .gridster").data("dashboard")._el.setBGColor($elem); // No I18N
                                jQuery("#dashboard-settings-dialog").find(".widget-layout-col > li").eq(colorIndex-1).find("a").addClass("active"); // No I18N
                                $settingsBox.find("#bgcolorMenu span.disp-ib").removeClass("widget-clr1 widget-clr2 widget-clr3 widget-clr4").addClass("widget-clr" + colorIndex); // No I18N
                                jQuery("#dashboard-settings-dialog #bgcolorMenu span.disp-ib").removeClass("widget-clr1 widget-clr2 widget-clr3 widget-clr4").addClass("widget-clr" + colorIndex); // No I18N
                            }
                        });
                        event.preventDefault();
                    });
                    $settingsBox.find("[data-name=dsreordersave]").on('click', function() {
                        var arrlistli = [];
                       
                        var neworder = $settingsBox.find('[data-name=dsreorder]').sortable("toArray"); // No I18N
                        saveDashboardTabData({
                            "ordered_views": neworder // No I18N
                        }, function(response,data,stat) {
                            if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                                for (var i = 0; i < neworder.length; i++) {
                                    var $clone = $settingsBox.find('[data-name=dsnrml]').find("#" + neworder[i]).clone(true, true);
                                    $settingsBox.find('[data-name=dsnrml]').append($clone);
                                    $settingsBox.find('[data-name=dsnrml]').find("#" + neworder[i]).first().remove();
                                }
                                $settingsBox.find('.reordersavebtns,[data-name=dsreorder]').addClass('hide');
                                $settingsBox.find('[data-name=dsnrml],[data-name=dshed]').removeClass('hide');
                                jQuery("#dashboard-settings-dialog [data-name=dsnrml]").html($settingsBox.find('[data-name=dsnrml]').html());//NO OUTPUTENCODING
                                $dash.init.repaintTabs(false);
                            }
                        });
                    });
                    $settingsBox.find("[data-name='dsnrml'] [name='selected-tabs']").parent().on('click', function(evt) {
                            function checkIfCurrentTabIsClicked($elem) {
                                var elemViewId = $elem.closest(".dsetalgn").attr("id"); // No I18N
                                return $dash.util.isCurrentActiveTab(elemViewId);
                            }
                            currentSelectedTab = checkIfCurrentTabIsClicked(jQuery(this));
                            if (!currentSelectedTab) {
                                if(!$dash.util.isTheOnlySelectedTab() || !(jQuery(this).attr("checked")=='checked')) {
                                    var $checkBox = jQuery(this).find("[name='selected-tabs']");
                                    var isChecked = $checkBox.attr("checked")=='checked'; // No I18N
                                    if (isChecked) {
                                        $checkBox.removeAttr("checked"); // No I18N
                                        jQuery("#dashboard-settings-dialog .dsetalgn#" + $checkBox.val()).find("[name='selected-tabs']").removeAttr("checked"); // No I18N
                                    } else {
                                        $checkBox.attr("checked", "checked"); // No I18N
                                        jQuery("#dashboard-settings-dialog .dsetalgn#" + $checkBox.val()).find("[name='selected-tabs']").attr("checked", "checked"); // No I18N
                                    }
                                    var ordered_views = [];
                                    var selectedOptions = jQuery.map($settingsBox.find("[data-name='dsnrml'] [name='selected-tabs']"), function(elem, index) {
                                        ordered_views.push(jQuery(elem).val());
                                        if (jQuery(elem).attr("checked")=='checked') {
                                            return jQuery(elem).val();
                                        }
                                    });
                                    var elem = this;
                                    saveDashboardTabData({
                                        "ordered_views" : ordered_views, // No I18N
                                        "selected_views": selectedOptions // No I18N
                                    }, function(response,data,stat) {
                                        if(stat.status == SC_RESPONSE_STATUS.SC_OK) {
                                           if (jQuery(elem).find("[name='selected-tabs']").attr("checked")=='checked') {
                                                jQuery("#dashboard-settings-dialog").find(".dsetnrml .dsetalgn#"+jQuery(elem).closest(".dsetalgn").attr("id")).find(".selection-state > span").removeClass("sdp-glyph-ban-circle").addClass("sdp-glyph-ok-circle"); // No I18N
                                                jQuery(elem).removeClass("sdp-glyph-ban-circle").addClass("sdp-glyph-ok-circle");
                                            } else {
                                                jQuery("#dashboard-settings-dialog").find(".dsetnrml .dsetalgn#"+jQuery(elem).closest(".dsetalgn").attr("id")).find(".selection-state > span").removeClass("sdp-glyph-ok-circle").addClass("sdp-glyph-ban-circle"); // No I18N
                                                jQuery(elem).removeClass("sdp-glyph-ok-circle").addClass("sdp-glyph-ban-circle");
                                            }
                                            $dash.init.repaintTabs(false);
                                        }
                                    }, function(response) {
                                        var $checkBox = jQuery(this).find("[name='selected-tabs']");
                                        var isChecked = $checkBox.attr("checked")=='checked'; // No I18N
                                        if (isChecked) {
                                            jQuery(elem).find("[name='selected-tabs']").removeAttr("checked"); // No I18N
                                        } else {
                                            jQuery(elem).find("[name='selected-tabs']").attr("checked", "checked"); // No I18N
                                        }
                                    });
                                }
                            } else {
                                showalert("failure",getMessageForKey("sdp.dashboard.common.messages.currentviewtabnohide"),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                            }
                    });
                    $settingsBox.find("[data-name=dsreorderclk]").on('click', function() {
                        $settingsBox.find('.reordersavebtns,[data-name=dsreorder]').removeClass('hide');
                        $settingsBox.find('[data-name=dsnrml],[data-name=dshed]').addClass('hide');
                        $settingsBox.find('[data-name=dsreorder]').html('');//NO OUTPUTENCODING
                        $settingsBox.find('[data-name=dsnrml] .dsetalgn').each(function(index, value) {
                            var $div = jQuery("<div class='dsetalgn'></div>");
                            $div.append('<ul><li class="dsmarkalign"><span class="sdp-glyph sdp-glyph-drag"></span></li></ul>');
                            $div.attr("id", jQuery(this).attr("id"));
                            var $li = jQuery("<li class='dsmarkalign dsshare'><span></span></li>"); // No I18N
                            $li.find("span").addClass(jQuery(this).find(".dsshare > span").attr('class') || "cspr icon-sm public-filter"); // No I18N
                            $li.find("span").attr("data-name", jQuery(this).find('.dsshare span').attr('data-name'));
                            $div.find("> ul").append($li);
                            $li = jQuery("<li class='dshddes'></li>");
                            $li.text(jQuery(this).find('.dshddes .dashboard-name').text());
                            $div.find("> ul").append($li);
                            $settingsBox.find('[data-name=dsreorder]').append($div);
                        });
                        $settingsBox.find('[data-name=dsreorder] .dsetalgn').each(function(index, value) {
                            jQuery(this).find('.form-control').val(index + 1);
                        });
                        $settingsBox.find('[data-name=dsreorder]').sortable({
                            update: function(evt) {
                                $settingsBox.find('[data-name=dsreorder] .dsetalgn').each(function(index, value) {
                                    jQuery(this).find('.form-control').val(index + 1);
                                });
                                $settingsBox.find('[data-name=dsreordersave]').prop('disabled', false); // No I18N
                            },
                            placeholder: 'ui-state-highlight', // No I18N
                            forcePlaceholderSize: true,
                            start: function( event, ui ) {
                                $settingsBox.find('[data-name=dsreorder] .tooltip').remove();
                            }
                        });
                    });
                    // Reorder
                    $settingsBox.on('keyup focusout blur', '[data-name=dsreorder] input', function(e) { // No I18N
                        if (e.which != 8 && e.which != 13 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                            return false;
                        } else {
                            if (e.which == 13) {
                                var parent = jQuery(this).closest('.dsetalgn'); // No I18N
                                if (this.value == parent.siblings().length + 2 || this.value > parent.siblings().length + 2) {
                                    var x = parent.siblings().length + 2;
                                    jQuery(parent.siblings()[x - 3]).after(parent).next();
                                    var focus_element = jQuery(parent.siblings()[x - 3]).after(parent).next();
                                } else {
                                    jQuery(parent.siblings()[this.value - 2]).after(parent).next();
                                    var focus_element = jQuery(parent.siblings()[this.value - 2]).after(parent).next();
                                }
                                $settingsBox.find('[data-name=dsreordersave]').prop('disabled', false); // No I18N
                                $settingsBox.find('[data-name=dsreorder] .dsetalgn').each(function(index, value) {
                                    jQuery(this).find('.form-control').val(index + 1);
                                });
                                $settingsBox.find('[data-name=dsreorder] .tooltip').remove();
                            }
                        }
                    });
                }
                setSettingsDialogBoxEvents();
                $settingsBox.find("#dashReorderCancel").off(".dashsettings").on("click.dashsettings", function(event) {  //NO I18N
                    jQuery('.reordersavebtns,[data-name=dsreorder]').addClass('hide');
                    jQuery('[data-name=dsnrml],[data-name=dshed]').removeClass('hide');
                });
                $settingsBox.find("#digCloseBtn").off(".dashsettings").on("click.dashsettings", function(event) { //NO I18N
                    closeDialog();
                });
                $settingsBox.find(".dsedit").off(".dashsettings").on("click.dashsettings", function(event) { //NO I18N
                    $dash.createEdit.editView(this);
                });
                $settingsBox.find(".dsdelete").off(".dashsettings").on("click.dashsettings", function(event) { //NO I18N
                    $dash.delete.deleteView(this);
                });
                $settingsBox.find("#dsShareElem").off(".dashsettings").on("click.dashsettings", function(event) { //NO I18N
                    $dash.share.showOptions(this, 'inline'); //NO I18N
                });
            }
        },

        toggleBulkSelectionByLable: function(label) {
            let input = label.firstChild.firstChild;
            jQuery(input).trigger("click");
        },

        //Add newly added dashboard name in UI
        addDashboardToOrganizeTabsList: function(newDashboardData, donotrepaint) {
            var $liClone = $dash.createEdit.createDashboardElementForOrganizeTabsList(newDashboardData);
            var $dashboardsListContainer = jQuery("[data-name='dsnrml']");
            if (!newDashboardData.is_selected) {
                $liClone.find(".selection-state > span").removeClass("sdp-glyph-ok-circle").addClass("sdp-glyph-ban-circle");
            } else {
                $liClone.find(".dsmarkalign [name='selected-tabs']").attr("checked", true); // No I18N
            }
            $dashboardsListContainer.append($liClone);
            if (!donotrepaint) {
                $dash.init.repaintTabs();
            }
        },

        //Update organize after Edit Dashboard
        editDashboardInfoInOrganizeTabsList: function(newDashboardData, donotrepaint) {
            var $liClone = $dash.createEdit.createDashboardElementForOrganizeTabsList(newDashboardData);
            var id = newDashboardData.id;
            jQuery("[data-name='dsnrml'] div#" + id).after($liClone);
            jQuery("[data-name='dsnrml'] div#" + id).eq(0).remove();
            if (!donotrepaint) {
                $dash.init.repaintTabs();
                setTimeout(function() {
                    var $menubar = jQuery("#view-listing").OverflowingMenubar();
                    $menubar.replaceLast(jQuery(".sdtabs-ui2 ul > li").filter(function(index, elem) { //NO OUTPUTENCODING
                        return (jQuery(elem).attr("data-view").split("_")[1] == id);
                    }));
                }, 1);
            }
        },

        //Create the list element for a dashboard
        createDashboardElementForOrganizeTabsList: function(newDashboardData) {
            var id = newDashboardData.id;
            var shared_to_all_tech = newDashboardData.shared_to_all_tech;
            var isshared = newDashboardData.isshared;
            var report_url = newDashboardData.report_url;
            var name = newDashboardData.name;
            var description = newDashboardData.description;
            var is_executive_view = newDashboardData.is_executive_view;
            var viewtype = newDashboardData.viewtype;
            var is_selected = newDashboardData.is_selected;

            var $liClone = jQuery("#dashboard-settings-dialog #reorganize-dashboard-item-template > div").clone(true, true);
            $liClone.attr("id", id);
            $liClone.find("input[name='selected-tabs']").val(id);
            /**
             * SD:92743 Custom dashboard hiding when reordering dashboard
             * Below input element's prop("checked") is lost when jQuery("#dashboard-settings-dialog").html() is used to render dialog box.
             * Using attr() help retain the property
             * Refer `showSettingsDialog()` function
             */
            $liClone.attr("data-dvdid", newDashboardData.dvdid);
            $liClone.find("input[name='selected-tabs']").attr("checked", is_selected); // No I18N
            $liClone.find(".dshddes").attr("data-viewtype", viewtype);
            $liClone.find(".dshddes").attr("data-displayname", name);
            $liClone.find(".dshddes").attr("data-reporturl", report_url);
            $liClone.find(".dshddes .dashboard-name").text(name);
            $liClone.find(".dshddes .dashboard-description").text(description);
            if(!is_executive_view) {
                $liClone.find(".executive-icon").remove(); // No I18N
            }
            return $liClone;
        },

        //Create new dashboard - External Widget section - Click plus icon to add a external widget
        addexternalwidget: function() {
            var dialogSelector = typeof $home_page != "undefined" ? "#homeNewTabSlide" : "#new-dashboard-dialog"; //No I18n
            if (jQuery(dialogSelector + ' .new-external-widget-input .external-url-field').val() != '') { //No I18n
                var $clone = jQuery("#new-external-widget-record-template > div").clone(true, true);
                var widgetNameField = jQuery(dialogSelector + " .new-external-widget-input input.external-title-field"); //No I18n
                var widgetUrlField = jQuery(dialogSelector + " .new-external-widget-input input.external-url-field"); //No I18n
                var widgetTypeField = jQuery(dialogSelector + " .new-external-widget-input input.external-type-field"); //No I18n
                $clone.find(".external-title-field").val(widgetNameField.val().trim());
                $clone.find(".external-url-field").val(widgetUrlField.val().trim());
                $clone.find(".external-type-field").val(widgetTypeField.val().trim());
                $clone.find(".addrowbtn").addClass("hide");
                $clone.find(".removerowbtn").removeClass("hide");
                widgetUrlField.siblings("#subject-error").insertAfter($clone.find(".external-url-field")); //No I18n
                jQuery(dialogSelector + " .addmodifyExternalwidget .new-external-widget-input").before($clone); //No I18n
                widgetNameField.val("");
                widgetUrlField.val("");
            } else {
                alert(getMessageForKey("sdp.home.ssp.customization.msg.urlinvalid")); //No I18n
                jQuery('.addExternalewidget .external-url-field').trigger('focus');
            }
        },

        createDashboardInit: function() {
            var $container = jQuery("#new-dashboard-dialog");
            var maxWidgetCount = parseInt($container.find(".dashboardwrapper").attr("data-maxwc") || "20");

            $container.find(".report-container input[type='checkbox'].dashboard-include-report").on('change', function(evt) {
                $dash.common.toggleBulkSelectionOnchange(evt);
            });
            $container.find("[action='delete-external-widget']").on('click', function(evt) {
                jQuery(evt.target).closest(".addexternalwidget").remove(); //No I18n
            });

            function applyExecutiveViewConfiguration(isExecutive) {
                function showHideSection(section) {
                    let sectionInputs = $container.find("input[data-module="+section+"]");
                    if(sectionInputs.parent(":not(.hide)").length==0) {
                        sectionInputs.parents("div.panel").addClass("hide").find("[data-name=selectAllReq]").removeAttr("checked"); //No I18n
                    }
                    else {
                        sectionInputs.parents("div.panel").removeClass("hide"); //No I18n
                    }
                }

                if (isExecutive) {
                    $container.find(".share-public").addClass("hide");


                    if(isMSPOrSCP){
                        $container.find("#TaskSummary").addClass("hide");
                    }
                    if(isSCP){
                        $container.find("#ORByAccount,#RequestsVsContracts,#RequestsVsProducts").addClass("hide");
                    }
                    $container.find(".report-container[group!='executive-widgets']").addClass("hide");
                    $container.find(".notExecutiveWidget").addClass("hide").find("input").removeAttr("checked");
                    $container.find(".executiveOnly").removeClass("hide");
                } else {
                    $container.find(".share-public").removeClass("hide");


                    if(isMSPOrSCP){
                        $container.find("#TaskSummary").removeClass("hide");
                    }
                    if(isSCP){
                        $container.find("#ORByAccount,#RequestsVsContracts,#RequestsVsProducts").addClass("hide");
                    }
                    $container.find(".report-container").removeClass("hide");
                    $container.find(".notExecutiveWidget").removeClass("hide");
                    $container.find(".executiveOnly").addClass("hide").find("input").removeAttr("checked");
                }
                showHideSection("Table");
                showHideSection("Graph");
            }

            function calculateWidgetDimensions(options) {
                let maxRow = 1,maxCol = 0,noOfRowsInGrid = 1;
                let diminfo = { ExternalWidgets:{}, DefaultWidgets:{}, RemovedWidgets:{}, NewExternalWidgets:{}, TableGraphWidgets: {}, RemovedCustomWidgets: {} };
                let chosenWidgets = $container.find("input:checked[data-widgetid]").map(function (i, e) {
                    let widModule = jQuery(e).data("module");
                    let widId = jQuery(e).data("widgetid");
                    if("Table"==widModule || "Graph"==widModule) {
                        return widModule+"_"+widId;
                    } else if ("CustomReport" == widModule) { //No I18N
                        return widId + "_" + jQuery(e).data("reportid");
                    } else if ("CustomWidget" == widModule) { //No I18N
                        return "custom_" + widId; //No I18N
                    }
                    return ""+widId;

                }).toArray();
                let _this = $dash.gridster;
                let widgets = jQuery(_this.db).find("> ul > li.gs-w[data-widgetid]"); //No I18N
                let widDims = {};
                jQuery.each(widgets, function (index, widget) {
                    let id = (""+jQuery(widget).data("widgetid"));
                    if(chosenWidgets.includes(id)) {
                      let dims = ([_this.get(widget, "row"), _this.get(widget, "col"), _this.get(widget, "sizex"), _this.get(widget, "sizey")]);
                      widDims[id]=dims;
                    }
                });

                let grid = [];
                function fillGrid(dim, widgetId) {
                    for(let x=0;x<dim[2];x++) {
                        for(let y=0;y<dim[3];y++) {
                            if(grid[dim[0]-1+y] == undefined) {
                                grid[dim[0]-1+y] = [0,0,0,0];
                            }
                            grid[dim[0]-1+y][dim[1]-1+x] = widgetId;
                        }
                    }
                    if (dim[0] >= maxRow) {
                      maxRow = dim[0];
                      maxCol = dim[3] > maxCol ? dim[3] : maxCol;
                    }
                }

                let keys = Object.keys(widDims);
                for(i=0;i<keys.length;i++) {
                    let dim = widDims[keys[i]];
                    fillGrid(dim, keys[i]);
                }

                var externalWidgets = $container.find(".addmodifyExternalwidget > .addexternalwidget").filter(function (index, value) { //NO I18N
                    return jQuery(value).find(".external-url-field").val().trim().length > 0; //NO I18N
                });

                externalWidgets.each((index, wid) => {
                    let id = jQuery(wid).find(".external-id-field").val();
                    if(id) {
                        let widget = jQuery(_this.db).find(`>ul >li[data-widgetid=${id}]`);
                        let dim = ([_this.get(widget, "row"), _this.get(widget, "col"), _this.get(widget, "sizex"), _this.get(widget, "sizey")]);
                        fillGrid(dim, parseInt(id));
                        diminfo.ExternalWidgets[id] = dim;
                    }
                });

                function movePosition(dims, rowsRemoved) {
                    let keys = Object.keys(dims);
                    for(let k=0;k<keys.length;k++) {
                        let id = keys[k];
                        let dim = dims[id];
                        let removedRowsCount = 0;
                        for(let r=0;r<rowsRemoved.length;r++) {
                            if(rowsRemoved[r]<dim[0]) {
                              removedRowsCount++;
                            }
                        }
                        if(removedRowsCount>0 && dim[0]-removedRowsCount>=1) {
                            dims[id] = [dim[0]-removedRowsCount, dim[1], dim[2], dim[3]];
                        }
                    }
                    return dims;
                }

                let rowsRemoved = [];
                for(let i=0,row=1;i<grid.length;i++,row++) {
                    if(!grid[i]) {
                        grid.splice(i,1);
                        rowsRemoved.push(row);
                        i--;
                    }
                } 
                if(rowsRemoved.length>0) {
                    widDims = movePosition(widDims, rowsRemoved);
                    diminfo.ExternalWidgets = movePosition(diminfo.ExternalWidgets, rowsRemoved);
                }

                function setDimension(key, dim) {
                    if(key.startsWith("Graph_") || key.startsWith("Table_")) {
                        diminfo.TableGraphWidgets[key] = dim;
                    }
                    else {
                        diminfo.DefaultWidgets[key] = dim;
                    }
                }

                let noOfCols = options.max_cols;
                let existingWidgetIds = keys;
                chosenWidgets.forEach(key => {
                  if(existingWidgetIds.includes(key)) {
                    setDimension(key, widDims[key]);
                  }
                  else {
                    let dim = [0, 0, 1, 1];
                    let removedWidget = $container.find("input:checked[data-widgetid="+key+"]");
                    if(removedWidget.data("module")=="Request" && removedWidget.data("widgetname")=="DrillDownAnalysis") {
                         dim = [0, 0, noOfCols, 2];
                    }
                    key.startsWith("Table_") && (dim[2] = noOfCols);
                    let occupied = false;
                      let newDim = [];
                      grid[grid.length]=[0,0,0,0];
                      grid[grid.length]=[0,0,0,0];
                      for(let row=0;row<grid.length && newDim.length==0;row++) {
                        for(let col=0;col<noOfCols;col++) {
                          let occupied = false, cellsCount = 0;
                          for(let x=row;x<grid.length && !occupied;x++) {
                            for(let y=col;y<noOfCols && y<col+dim[2];y++) {
                              if(grid[x][y]!=0) {
                                occupied = true;
                                break;
                              }
                              cellsCount++;
                            }
                            if(cellsCount<dim[2] || cellsCount==dim[2]*dim[3]) {
                              break;
                            }
                          }
                          if(!occupied && cellsCount==dim[2]*dim[3]) {
                            newDim = [row+1, col+1, dim[2], dim[3]];
                            setDimension(key, newDim);
                            fillGrid(newDim, key);
                            break;
                          }
                        }
                      }
                      for(let i=0;i<2;i++) {
                        if(grid[grid.length-1][0]==0) { 
                          grid.splice(grid.length-1,1);
                        }
                      }
                  }
                });

                noOfRowsInGrid = grid.length;
                let dummyId = 1;
                externalWidgets.each((_, wid) => {
                    var key = jQuery(wid).find(".external-id-field").val() || "dummy" + dummyId++; //NO I18N
                    if(diminfo.ExternalWidgets[key]==undefined) {
                        diminfo.ExternalWidgets[key] = [noOfRowsInGrid+1, 1, noOfCols, 2];
                        noOfRowsInGrid += 2;
                    }
                });

                let removedWidgets = jQuery.extend(true, {}, _this.removedWidgets.default);
                let removedKeys = Object.keys(removedWidgets);
                let maxrow = 1;
                for(let r=0;r<removedKeys.length;r++) {
                    let row = removedWidgets[removedKeys[r]][0];
                    (row > maxrow) && (maxrow = row);
                }

                let col = 1; maxrow++;
                $container.find("input[data-widgetid]").map(function (i, elem) {
                    elem = jQuery(elem);
                    let id = elem.data("widgetid");
                    let widModule = elem.data("module");
                    if((widModule!="Table" && widModule!="Graph")) {
                        if(elem.is(":checked")) {
                            if(removedWidgets[id]!=undefined) {
                                delete removedWidgets[id];
                            }
                        }
                        else {
                            if(removedWidgets[id]==undefined) {
                                removedWidgets[id] = [maxrow, col, 1, 1];
                                if(widModule == "Request" && elem.data("widgetname") == "DrillDownAnalysis") {
                                    if(col > 1) {
                                        maxrow++;
                                    }
                                    removedWidgets[id] = [maxrow, 1, noOfCols, 2];
                                    col = noOfCols;
                                    maxrow++;
                                }
                                if(col==noOfCols) {
                                    maxrow++;
                                    col = 0;
                                }
                                col++;
                            }
                        }
                    }
                });
                diminfo.RemovedWidgets = removedWidgets;
                return diminfo;
            }

            function addDashboard() {
                jQuery("#new-dashboard-dialog #createDashboardSave").addClass('disabled');
                var $wrapper = $container.find(".wrapper");
                $wrapper.closest('.dashboardwrapper').validate({ //No I18n
                    rules: {
                        dashboardname: {
                            required: true
                        }
                    },
                    messages: {
                        dashboardname: {
                            required: getMessageForKey("sdp.dashboard.common.messages.enterdashboardname") //No I18n
                        }
                    },
                    errorClass: 'text-danger', //No I18n
                    errorPlacement: function(error, element) {
                        position = element.position();
                        error.insertAfter(element)
                        error.addClass('alert alert-danger alert-arrow p5').css({
                            'position': 'absolute', // No I18N
                            'overflow': 'visible', // No I18N
                            'bottom': '-5px', // No I18N
                            'z-index': '100', // No I18N
                            'left': '0' // No I18N
                        });
                        element.focus();
                    }
                });

                function serialize() {
                    var dashboardName = $wrapper.find(".dashboardname").val().trim();
                    if (dashboardName.length == 0) {
                        $wrapper.closest('.dashboardwrapper').valid(); //No I18n
                        return null;
                    }
                    var dashboarddescription = $wrapper.find(".dashboarddes").val().trim();
                    var isExecutiveView = $wrapper.find("[name='is-executive']").prop("checked"); //No I18n
                    var reports = [];
                    var sharedToAllTech = null;
                    var isShared = false;
                    var modulesForExecutives;
                    
                    if (isExecutiveView) {
                        modulesForExecutives = $wrapper.find(".report-container[group='executive-widgets']");
                    } else {
                        modulesForExecutives = $wrapper.find(".report-container");
                        if ($container.find(".share-public input[name='share-opt']").length) {
                            sharedToAllTech = $container.find(".share-public input[name='share-opt']").prop("checked"); //No I18n
                        }
                    }
                    var totalWidgetsChosenInDashboard = 0;
                    if (isExecutiveView) {
                        totalWidgetsChosenInDashboard = $wrapper.find("[group='executive-widgets'] input[type='checkbox'].dashboard-include-report:checked").length;
                    } else {
                        totalWidgetsChosenInDashboard = $wrapper.find("input[type='checkbox'].dashboard-include-report:checked").length;
                        if(!$wrapper.find("input[type='checkbox'].dashboard-include-report:checked:not([data-module=CustomWidget])").length){
                            totalWidgetsChosenInDashboard=0;
                    }
                    }
                    totalWidgetsChosenInDashboard += $wrapper.find(".addmodifyExternalwidget > .addexternalwidget").filter(function(index, value) {
                        return jQuery(value).find(".external-url-field").val().trim().length > 0;
                    }).length;
                    if (totalWidgetsChosenInDashboard == 0) {
                        showalert("failure",translate("sdp.dashboard.common.messages.minimumonewidget", [translate("sdp.common.dashboard")]),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                        return null;
                    } else if (totalWidgetsChosenInDashboard > maxWidgetCount) {
                        showalert("failure",getMessageForKey("sdp.dashboard.common.messages.maximumwidget", [maxWidgetCount]),'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); // No I18N
                        return null;
                    }
                    var moduleVsWidgetsMap = {};
                    jQuery.each(modulesForExecutives, function(k, module) {
                        var selectedWidgets = jQuery(module).find("input[type='checkbox'].dashboard-include-report:checked");
                        jQuery.each(selectedWidgets, function(k, widget) {
                            var module = jQuery(widget).attr("data-module");
                            var wdg = {
                                "name": module=="CustomWidget"?jQuery(widget).attr("data-widgetname").substr(0,30):jQuery(widget).attr("data-widgetname"), //No I18n
                                "widgetid": parseInt(jQuery(widget).attr("data-widgetid")) //No I18n
                            }
                            if (jQuery(widget).attr("data-reportId") && jQuery(widget).attr("data-reportId").length) {
                                wdg.reportid = jQuery(widget).attr("data-reportId");
                            }
                            if (!moduleVsWidgetsMap[module]) {
                                moduleVsWidgetsMap[module] = [];
                            }
                            if(!isExecutiveView || notExecutiveWidgets.indexOf(wdg.name)==-1) {
                                moduleVsWidgetsMap[module].push(wdg);
                            }
                        });
                    });
                    jQuery.each(moduleVsWidgetsMap, function(k, v) {
                        var moduleObj = {
                            "module": k, //No I18n
                            "report_details": v //No I18n
                        }
                        if (moduleObj.report_details.length > 0) {
                            reports.push(moduleObj);
                        }
                    });
                    var $addedExternalWidgets = $wrapper.find(".addmodifyExternalwidget > .addexternalwidget");
                    var extWgtDetails = [];
                    var isValidUrls = true;
                    jQuery.each($addedExternalWidgets, function(k, externalWidget) {
                        var name = jQuery(externalWidget).find(".external-title-field").val().trim();
                        var url = jQuery(externalWidget).find(".external-url-field").val().trim();
                        var type = jQuery(externalWidget).find(".external-type-field").val().trim();
                        
                        if(type=="Editor")
                            {
                            var id = jQuery(externalWidget).find(".external-id-field").val();
                            if (url.length) {
                                extWgtDetails.push({
                                    "name": name, //No I18n
                                    "url": url, //No I18n
                                    "type":type,//No I18n
                                    "content":document.getElementById("iframe_widget_"+id).contentDocument.getElementsByTagName("HTML")[0].outerHTML // No I18N
                                    
                                });
                            }
                            }
                        else
                            {   
                            if (url.length) {
                                if (type === "Attach" || $dash.util.checkWidgetURL(jQuery(externalWidget).find(".external-url-field"))) {
                                    extWgtDetails.push({
                                        "name": name, //No I18n
                                        "url": url, //No I18n
                                        "type":type//No I18n
                                    });
                                } else {
                                    isValidUrls = false;
                                }
                            }
                            }
                    });
                    if (!isValidUrls) {
                        return;
                    }
                    reports.push({
                        "module": "External", //No I18n
                        "report_details": extWgtDetails //No I18n
                    });
                    var isShared = null;
                    if ($container.find(".share-shared input[name='share-opt']").length) {
                        isShared = $container.find(".share-shared input[name='share-opt']").prop("checked"); //No I18n
                    }
                    var shareInfo = null;
                    if (isShared) {

                        shareInfo = $dash.share.fromMultiSelectShareInfo($dash.share.dashboardMultiSelect.getSelectedIds());
                        if (!shareInfo.length) {
                            showalert("failure", e_html(translate("sdp.dashboard.common.messages.shareinfonotchosen")), 'isAutoHide=true,closeOnEscKey=yes,width=500,height=80'); // No I18N
                            return null;
                        }
                    }
                    var return_json = {
                        "name": dashboardName, //No I18n
                        "description": dashboarddescription, // No I18N
                        "is_executive_view": isExecutiveView, //No I18n
                        "max_cols" : $wrapper.find("#columnSelection [name='columns']:checked").val() , // No I18N
                        "shared_to_all_tech": sharedToAllTech, //No I18n
                        "isshared": isShared, //No I18n
                        "reports": reports, //No I18n
                        "share_info": shareInfo //No I18n
                    }
                    if(isMSPOrSCP){
                        return_json["min_height"]=$wrapper.find("#columnSelection [name='rows']:checked").val(); // No I18N
                    }
                    return return_json;
                }
                var newDashboardData = serialize();
                var url = "/DashBoardView.do?action=saveView"; //No I18n 
                var viewId = $container.attr("data-id");
                var isEditMode = false;
                let diminfo = {}, properties = {};
                let input_data = { input_data:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(newDashboardData) : JSON.stringify(newDashboardData) };  //No I18n
                if (viewId && viewId.length) {
                    isEditMode = true;
                    url += "&viewId=" + encodeURIComponent(viewId); //No I18n
                }
                
                if (newDashboardData) {
                    let _this = $dash.gridster;
                    //if no of columns is changed then no need to calculate widget dimensions
                    if(newDashboardData.max_cols == _this.options.numberOfColumns) {
                        diminfo = calculateWidgetDimensions(newDashboardData);
                        properties = {max_cols: newDashboardData.max_cols};
                        input_data.new_config = sdpToJSON({diminfo: diminfo, properties:  properties});
                    }

                    sdpAjax({
                        url: url, 
                        method: "POST", //No I18n
                        data: input_data,
                        success: function(response) {
                            jQuery("#new-dashboard-dialog #createDashboardSave").removeClass('disabled');
                            if (isEditMode) {
                                $dash.createEdit.editDashboardInfoInOrganizeTabsList(response, true);
                            } else {
                                $dash.createEdit.addDashboardToOrganizeTabsList(response, true);
                            }
                            response.id && jQuery("#activeViewId").val(response.id);
                            $dash.init.repaintTabs();
                            if (isEditMode) {
                                if(jQuery("#activeViewId").val() + "" == viewId + "") { // No I18N
                                    jQuery("#view-listing > li.active").trigger('click');
                                }
                            }
                            else
                            {
                                setTimeout(function(){
                                    jQuery("#view-listing >li[data-viewid='"+response.id+"']").trigger('click'); // No I18N
                                },1);
                            }
                            $dash.share.updateDashboardMetaData(response);
                            $dash.createEdit.closeAddDashboard();
                            (!isEditMode && !showalert("success", getMessageForKey("sdp.dashboard.common.messages.newdashboardcreationsuccess"), 'isAutoHide=true,delay=3,width=600')) || showalert("success", getMessageForKey("sdp.dashboard.common.messages.dashboardeditedsuccess"), 'isAutoHide=true,delay=3,width=600'); //No I18n
                        }
                    });
                }
                else {
                    jQuery("#new-dashboard-dialog #createDashboardSave").removeClass('disabled');
                }
            }

            function onExecutiveViewOptionChange(isChecked) {
                if($container.find("#dashboardSharingConfig input[name='share-opt']:checked").val()=="1") { //if public
                    $container.find("#dashboardSharingConfig #shareType_private").click();
                }
                if (isChecked) {
                    jQuery("#dashboardSharingConfig #sharingOptionTooltip").attr("title",translate("sdp.dashboard.common.sharing.note.executivedashboard").replaceAll("{0}", "<p>").replaceAll("{1}", "</p>")); //No I18n
                    jQuery("#dashboardSharingConfig").attr("data-isexecutive", "true");
                } else {
                    jQuery("#dashboardSharingConfig #sharingOptionTooltip").attr("title",translate("sdp.dashboard.common.sharing.note").replaceAll("{0}", "<p>").replaceAll("{1}", "</p>")); //No I18n
                    jQuery("#dashboardSharingConfig").attr("data-isexecutive", "false");
                }
                jQuery("#collaborating_users").select2("val", ""); //No I18n
                jQuery("#collaborating_users").select2("destroy"); //No I18n

                if ($dash.share.dashboardMultiSelect) {
                    $dash.share.dashboardMultiSelect.destroy();
                    $dash.share.dashboardMultiSelect = $dash.common.initSharingField(jQuery("#multiSelectDashboardShare"), {isExecutive: isChecked, isDashboard: true}); //No I18n
                }
            }
            $container.find("[action='toggle-executive-view'] input[name='is-executive']").on('change', function(evt) {
                var isChecked = jQuery(this).prop("checked"); //No I18n
                applyExecutiveViewConfiguration(isChecked);
                onExecutiveViewOptionChange(isChecked);
                if(isMSPOrSCP && isChecked){
                    jQuery("#TaskSummary").find('input[type=checkbox]').prop('checked',''); //No I18n
                }
                if(isSCP){
                    jQuery("#ORByAccount,#RequestsVsContracts,#RequestsVsProducts").find('input[type=checkbox]').prop('checked',''); //No I18n
                }
            });
            $container.find(".form-footer [action='add']").on('click', function() {
                addDashboard();
            });
            $container.find(".moduleHeader [action='selection-toggle']").on('click', function(evt) {
                evt.stopPropagation();
            });
            $container.on('keyup', '.dashboardname', function(e) { // No I18N
                jQuery('.dashboardnamelen').text(jQuery(this).val().length + '/50');
            });
            $container.on('keyup', '.dashboarddes', function(e) { // No I18N
                jQuery('.dashboarddeslen').text(jQuery(this).val().length + '/100');
            });

            function init() {
                applyExecutiveViewConfiguration($container.find("input[name='is-executive']").prop("checked")); //No I18n
                var $reportContainers = $container.find(".report-container");
                jQuery.each($reportContainers, function(k, $reportContainer) {
                    $reportContainer = jQuery($reportContainer);
                    var totalCheckBoxesCount = $reportContainer.find("input[type='checkbox'].dashboard-include-report").length;
                    var selectedCheckBoxesCount = $reportContainer.find("input[type='checkbox'].dashboard-include-report:checked").length;
                    $dash.common.toggleModuleBulkOperationButton($reportContainer, totalCheckBoxesCount, selectedCheckBoxesCount);
                });
            }
            init();
        }
    },
    /* Create/Edit Dashboard scripts ends here */

    SHARE_TYPE: {
        PRIVATE: 1,
        EXECUTIVE: 2,
        PUBLIC: 3,
        SHARED: 4
    },
    gridster: $dash.gridster,
    newWidgets: $dash.newWidgets
};
