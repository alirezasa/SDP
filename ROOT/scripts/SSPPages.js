/* $Id$ */
var portalPages = {
    pageTemplate: "pages-template", // No I18N
    target: "template-pages", // No I18N

    // list info for tablecomponent to fetch data from creator dashboard table.
    getTableInfo: function () {
        return {fields_required: ["id", "name", "preview_file", "is_selected", "preview_icon", "helpdesk_id"], list_info: {row_count: "100",start_index: "1", sort_fields: [{field:"last_updated_time",order:"desc"}]}}; // No I18N
    },

    // function to load the pages grid.
    getCreatorPages: function (isUserdefined, searchTxt) {
        var search_criteria = [];
        var sort_field = "last_updated_time"; // No I18N
        var sort_order = "desc"; // No I18N

        if (isUserdefined) {
            search_criteria.push({ field: "created_by", value: sdp_user.LOGGEDIN_USERID, condition: "is", logical_operator: "and" });
        }

        if (searchTxt && searchTxt != "") {
            search_criteria.push({ field: "name", value: searchTxt, condition: "contains", logical_operator: "and" });
        }

        if (!jQuery.isEmptyObject(WebComponents.instancePool)) {
            var tobj = WebComponents.instancePool["webc-galleryview"]; // No I18N
            tobj.t_obj.table_info.list_info = tobj.t_obj.options.row_inputdata.list_info;
            tobj.t_obj.table_info.list_info.search_criteria = search_criteria;
            tobj.t_obj.table_info.list_info.sort_field = sort_field;
            tobj.t_obj.table_info.list_info.sort_order = sort_order;
            tobj.refreshTable();
        } else {
            WebComponents.render("webc-galleryview");
        }

        // prevent appending new card in case of throttling. (Grid is not emptied in case of throttling. So create new card will already be present)
        if (!jQuery(".flex-card-item[data-templatepage=0]").length && !searchTxt) {
            renderhbs("#create-new-card", "create-new-card-template", {}, false, "home_builder"); // No I18N
            var cn = jQuery("#create-new-card .flex-card-item");
            jQuery("#gallery_gallery_div").prepend(cn);
            jQuery("#gallery_gallery_div").addClass("innerborderbox"); // No I18N
        }

        portalPages.init();
    },

    clickNew: function (fromHome) {
        window.open('/ui/ssp' + (fromHome ? '?from=home' :''), '_self');
    },

    // Function to initialize listeners  tooltip after page grid loading
    init: function () {
        // Render selected template at the begining of the Grid
        jQuery(".flex-card-item.active").insertAfter(".flex-card-item.whitebg"); // No I18N

        spInit();
        var jB = jQuery("body");

        // set overflow hidden to body to avoid extra scroll bar
        jB.addClass('of-h'); // No I18N

        // set height for the grid to enable scroll, only for the grid.
        var galleryView = jQuery("#gallery_div");
        if (galleryView.length) {
            viewHeightAllpage = 1 + window.innerHeight - jQuery("#gallery_div").offset().top - 30;
            jQuery("#gallery_div").removeClass();
            jQuery("#gallery_div").addClass("bgblue-eaf oya p20");
            jB.find("#gallery_div").css("height", viewHeightAllpage); // No I18N
            jB.find(".flex-card-item").on("mouseleave", function () {
                jB.find(".card-dotted-menu>.menutoggle").removeClass("open");
            });
        }

        // Event validate on keypress
        jB.find("#saveaspage, #renamePage").on("keyup", function () {
            var elem = jQuery(this);
            if (elem.val().trim()) {
                elem.siblings("span[data-error]").addClass("hide"); // No I18N
            } else {
                elem.siblings("span[data-error]").removeClass("hide"); // No I18N
            }
        });

        initTooltip("body"); // No I18N
    },

    // Function to set a particular page as requester homepage
    setAsRequesterPg: function (ele) {
        if (portalPages.isLicenseExpired) {
            showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
            return;
        }

        var callbackfn = function (proceed) {
            if (proceed) {
                var card = jQuery(ele), jB = jQuery("body");
                var cardId = card.closest("div[data-templatepage]").data("templatepage"); // No I18N
                var url = "/api/v3/creator_dashboard/" + parseInt(cardId) + "/_select_page"; // No I18N
                sdpAjax({
                    url: url,
                    type: "PUT", // No I18N
                    success: function (data) {
                        card.closest("#gallery_div").find("div[data-templatepage]").removeClass("active"); // No I18N
                        card.closest("div[data-templatepage]").addClass("active"); // No I18N
                        showalert('success', getMessageForKey("zcpage.requesterpage.updated"), 'isAutoHide=true,delay=3,width=auto'); // No I18N
                        isBuilderEnabled = true;
                    }
                });
            }
        }
        if (!isBuilderEnabled) {
            showconfirm(true, 'title=' + getMessageForKey('home.zc.confirmSave') + ', message=' + getMessageForKey('home.zc.newUISave.warning') + ', submitbutton=' + getMessageForKey('common.save') + ', cancelbutton=' + getMessageForKey('common.cancel') + ', closebutton=yes, closeOnEscKey=yes', callbackfn); // No I18N
        }
        else {
            callbackfn(true);
        }
    },

    // Deletes a page from the grid
    deleteTemplate: function (ele) {
        if (portalPages.isLicenseExpired) {
            showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
            return;
        }
        var card = jQuery(ele), jB = jQuery("body");
        showconfirm(true, 'title=' + getMessageForKey("sdp.dashboard.common.confirmdelete") + ', message=' + getMessageForKey("common.delete.confirm") + ', submitbutton=' + getMessageForKey("common.delete") + ', cancelbutton=' + getMessageForKey("common.cancel") + ', closebutton=yes, closeOnEscKey=yes', deleteCallback); // No I18N
        function deleteCallback(isDelete) {
            if (isDelete) {
                var cardId = card.closest("div[data-templatepage]").data("templatepage"); // No I18N
                var url = "/api/v3/creator_dashboard/" + parseInt(cardId); // No I18N
                sdpAjax({
                    url: url,
                    type: "DELETE", // No I18N
                    success: function (data) {
                        showalert('success', getMessageForKey("common.delete.success"), 'isAutoHide=true,delay=3,width=auto'); // No I18N
                        var isUserDefined = jQuery("#pageToggleTabs").find("li.active").data("userdef"); // No I18N
                        portalPages.getCreatorPages(isUserDefined);
                    }
                });
            } else {
                return false;
            }
        }
    },

    // Duplicates a template page in the grid
    duplicateTemplate: function (ele) {
        if (portalPages.isLicenseExpired) {
            showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
            return;
        }

        var card = jQuery(ele);
        var cardId = card.closest("div[data-templatepage]").data("templatepage"); // No I18N

        var url = "/api/v3/creator_dashboard/" + parseInt(cardId) + "/_duplicate"; // No I18N
        sdpAjax({
            url: url,
            type: "POST", // No I18N
            success: function (data) {
                showalert('success', getMessageForKey("zcpage.duplicate.template"), 'isAutoHide=true,delay=3,width=auto'); // No I18N
                var isUserDefined = jQuery("#pageToggleTabs").find("li.active").data("userdef"); // No I18N
                portalPages.getCreatorPages(isUserDefined);

                // highlight duplicated card
                var dupCard = jQuery(".flex-card-item[data-templatepage=" + data.creator_dashboard.id + "]");
                var offset = dupCard.offset().top - jQuery('#gallery_gallery_div').offset().top;
                jQuery("#gallery_div").animate({ scrollTop: offset }, 600).promise().done(function () {
                    dupCard.addClass("highlightbox");
                    setTimeout(function () {
                        dupCard.removeClass("highlightbox");
                        setTimeout(function () {
                            dupCard.addClass("highlightbox");
                            setTimeout(function () {
                                dupCard.removeClass("highlightbox");
                            }, 1000);
                        }, 500);
                    }, 1000);
                });
            },
            error: function (resp) {
                if (JSON.parse(resp.responseText).response_status.messages[0].status_code === '4018') { // No I18N
                    showalert("failure", getMessageForKey("zcpage.template.limit.exceeded"), "isAutoHide=false,delay=3,width=auto"); // No I18N
                } else {
                    showalert("failure", e_html(JSON.parse(resp.responseText).response_status.messages[0].message), "isAutoHide=false,delay=3,width=auto"); // No I18N
                }
            }
        });
    },

    // Closes the template page
    closeTemplate: function () {
        var jB = jQuery("body");
        jB.find("#loadTemplatePage").fadeOut("fast", function () { // No I18N
            jB.find("#templateListview").fadeIn("fast"); // No I18N
            jB.find("#loadTemplatePage").attr("src", "");
        });
    },

    // Function to open rename dialog
    renameTemplate: function (ele) {
        if (portalPages.isLicenseExpired) {
            showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
            return;
        }
        var card = jQuery(ele), name = card.closest("div[data-templatepage]").find("figcaption").text() || ''; // No I18N
        var pageId = card.closest("div[data-templatepage]").data("templatepage"); // No I18N
        jQuery("#renamePageHTML.ui-dialog-content").closest(".ui-dialog").remove(); // No I18N
        jQuery("#renamePageHTML").dialog({ // No I18N
            modal: 'true',
            width: 300,
            resizable: false,
            draggable: true,
            open: function () {
                jQuery("#renamePage").val('').siblings("span[data-error]").addClass("hide"); // No I18N
                jQuery("#renamePage").val(name);
                jQuery("#renamePage").data('pageid', pageId); // No I18N
            },
            close: function () {
                jQuery("body").addClass("of-h"); // No I18N
            }
        });
        jQuery('#renameSave').off().on("click", function(event) { portalPages.renamePageSave() }); //No I18N
        jQuery('#cancelRenaming').off().on("click", function(event) { jQuery('#renamePageHTML').dialog('close');jQuery('body').addClass('of-h'); }); //No I18N
    },

    // Saves the page with new name after renaming
    renamePageSave: function () {
        var jB = jQuery("body");
        var newName = jB.find("#renamePage").val().trim();
        if (newName) {
            if (newName.length > 250) {
                showalert('failure', translate('sdp.api.security.exception.value.toolong'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
                return false;
            }
            jB.find("#renamePage").siblings("span[data-error]").addClass("hide"); // No I18N
            jB.find("#renamePageHTML").dialog("close"); // No I18N

            var page = jQuery("#renamePage").data("pageid"); // No I18N
            var url = "/api/v3/creator_dashboard/" + parseInt(page) + "/_rename"; // No I18N
            var input_data = sdpAjaxInputData({ creator_dashboard: { name: newName } });
            sdpAjax({
                url: url,
                type: "PUT", // No I18N
                data: input_data,
                success: function (data) {
                    jQuery("div[data-templatepage=" + page + "] figcaption").text(data.creator_dashboard.name); // No I18N
                    showalert('success', getMessageForKey("zcpage.grid.renamepage"), 'isAutoHide=true,delay=3,width=auto'); // No I18N
                }
            });
        } else {
            jB.find("#renamePage").siblings("span[data-error]").removeClass("hide"); // No I18N
            return false;
        }
    },

    // To search the pages in the grid with page name as search key
    searchPages: function (eve) {
        if (eve.which == 13) {
            var searchTxt = e_attr(jQuery(".template-search input").val());
            var isUserDefined = jQuery("#pageToggleTabs").find("li.active").data("userdef"); // No I18N
            portalPages.getCreatorPages(isUserDefined, searchTxt);
        }
    },

    showpopoverCallback: function () {
        setTimeout(function () {
            initTooltip("#showPopover"); // No I18N
        }, 1);
    },

    // Function to determine weather header is needed or not for requester
    saveHeaderPreference: function (preferenceInput) {
        var needHeader = preferenceInput.checked;
        if (portalPages.isLicenseExpired) {
            jQuery(preferenceInput).prop('checked', (needHeader == false)); // No I18N
            showalert('failure', translate('mdh.restricted.portals.cud.msg'), 'isAutoHide=false,delay=3,width=auto'); // No I18N
            return;
        }
        var saveurl = "/SSCustomizeView.do?action=saveHeaderPreferenceZC" + "&needHeader=" +  encodeURIComponent(needHeader); //No I18N
        sdpAjax({
            url: saveurl,
            type: "POST", // No I18N
            success: function (data) {
                jQuery(preferenceInput).attr('checked', needHeader);
                showalert('success', getMessageForKey("sdp.admin.dcconfig.settings.saved"), 'isAutoHide=true,delay=3,width=auto'); // No I18N
            }
        });
    },

    ready: function () {
        if (WebComponents.instancePool["webc-galleryview"]) {
            delete WebComponents.instancePool["webc-galleryview"]; // No I18N
        }
        portalPages.getCreatorPages();
        var headerPref = isHeaderNeeded;
        var preferenceInput = jQuery("#headerPreference");
        preferenceInput.attr('checked', headerPref != undefined ? headerPref : true);

        //Bind events - csp avtivity
        jQuery('#headerPreference').off().on("change", function(event) { portalPages.saveHeaderPreference(this); }); //No I18N
        jQuery('#closeCustomization').off().on("click", function(event) { portalPages.close(); }); //No I18N
        jQuery('#allPagesTab').off().on("click", function(event) { portalPages.getCreatorPages(false);jQuery('#pagesSearchBar').val(''); }); //No I18N
        jQuery('#myPagesTab').off().on("click", function(event) { portalPages.getCreatorPages(true);jQuery('#pagesSearchBar').val(''); }); //No I18N
        jQuery('#templatePageSearch').off().on("keyup", function(event) { portalPages.searchPages(event) }); //No I18N
        jQuery('#renameSave').off().on("click", function(event) { portalPages.renamePageSave() }); //No I18N
        jQuery('#cancelRenaming').off().on("click", function(event) { jQuery('#renamePageHTML').dialog('close');jQuery('body').addClass('of-h'); }); //No I18N
    },

    close: function () {
        if (jQuery("#from").text() == 'home') {
            window.open('/ui/home?view_type=my_view', '_self', "noopener"); // No I18N
        }
        else {
            window.open('/SetUpWizard.do?forwardTo=settings#customize', '_self', "noopener"); // No I18N
        }
    },

    noDataBannerCallback: function(table_data)
    {
        var searchCriteria = table_data.t_obj.table_info.list_info.search_criteria;
        if (!searchCriteria.length) {
            return false;
        } else if (!searchCriteria.find(sc => sc.field === "name")) {
            return false;
        }
		return '<div class="nodata-section"> <span class="h3 text-muted">'+translate('sdp.listview.nodataavailble')+'</span> </div>';
	},
}

jQuery(window).resize(function () {
    setTimeout(function () {
        portalPages.init();
    }, 1);
});
