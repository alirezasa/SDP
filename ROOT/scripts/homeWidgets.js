var $home_page = { ...$home_page,

  addCustomizationWidget: function(placeHolder) {
    if(jQuery("#headerbar").length>0 && !jQuery("#hpcustomgroup").hasClass("hide") && sdp_user.ROLES.includes("SDAdmin")) {
      let container = jQuery(placeHolder);
      container.find(".widget-header-icons").toggleClass("disp-flex hide"); //NO I18N
      container.find(".customizationIcons").prepend($dash.gridster.removeWidgetBtn);
      setTimeout(function() { initTooltip("#home-widgets") }, 100);  //NO I18N
      $home_page.addMovetoTabBtn();
    }
  },

  //This method is used to load the pending approvals widget in the home page.
    processApprovals: function(removeWidget, isCreatorDashboard) {
        ResourceLoader({
            js: [`/scripts/approval_scripts.js`, `/scripts/hbs-template-approval.js`],
            success: function() {
                //SD-113486 - To display total pending approvals count in the widget header we have included get_total_count in list_info.
                var approval_filters = ["my_request_pending_approvals"];
                if(sdp_app.IS_CHANGE_ENABLED){ approval_filters.push("my_change_pending_approvals");}
                if(sdp_app.IS_RELEASE_MODULE_ENABLED){ approval_filters.push("my_release_pending_approvals");}
                if(sdp_app.IS_PURCHASE_MODULE_ENABLED){ approval_filters.push("my_purchase_pending_approvals");}

                var approval_input_data = {"include": approval_filters}; //NO I18N
                var approval_input_items = sdpToJSON(approval_input_data);
                $home_page.currency_symbol = sdp_app.CURRENCY_SYMBOL;
                sdpAjax({
                    cache: false,
                    //async:false,
                    url: "/api/v3/approvals/_module_approval_count",//NO I18N
                    data: {"format": "json", "input_data": approval_input_items},//NO I18N
                    type: 'GET', //No I18N
                    success: function(response) {
                        var approvalResponse = {};
                        approvalResponse.totalPendingApprovalCount = sdp_user.pending_approvals_count;  //SD-113486 - Display total pending approvals count in the widget header.

                        if(approvalResponse.totalPendingApprovalCount <= 0){
                          if(sdp_user.ROLES.indexOf("SDAdmin")!=-1){
                            $home_page.isApproval=true;
                          } else if(removeWidget && jQuery("#zc-component").length==0) {
                            jQuery("#approval_widget").remove();
                            return;
                          }
                        }
                        
                        if (response.module_approval_count.my_request_pending_approvals && response.module_approval_count.my_request_pending_approvals > 0) {approvalResponse.requestPendingApprovalCount = response.module_approval_count.my_request_pending_approvals;}
                        if (response.module_approval_count.my_change_pending_approvals && response.module_approval_count.my_change_pending_approvals > 0) {approvalResponse.changePendingApprovalCount = response.module_approval_count.my_change_pending_approvals;}
                        if (response.module_approval_count.my_release_pending_approvals && response.module_approval_count.my_release_pending_approvals > 0) {approvalResponse.releasePendingApprovalCount = response.module_approval_count.my_release_pending_approvals;}
                        if (response.module_approval_count.my_purchase_pending_approvals && response.module_approval_count.my_purchase_pending_approvals > 0) {approvalResponse.purchasePendingApprovalCount = response.module_approval_count.my_purchase_pending_approvals;}

                        approvalResponse.isNotSingleWidget = !$home_page.options.isSingleWidget;
                        approvalResponse = $home_page.getUrlForApprovalsListView(approvalResponse);
                        jQuery('div.ds-container').addClass('adminhomepageapproval');
                        jQuery("#approval_widget").removeClass("hide");//NO I18N
                        !$home_page.options.isSingleWidget ? (approvalResponse.user_details = sdp_user) : "";
                        let placeHolder = "#sdphome-pendingApprovals-placeholder"; //NO I18N
                        renderhbs(placeHolder, "sdphome-pendingApprovals", approvalResponse, false, "home_common", false, false, function () {  // NO I18N
                          let container = jQuery(placeHolder);
                          container.find("#ShareWidget").off("click").on("click", function() { //NO I18N
                            $dash.common.openEmbedDialog(this);
                          });
                          container.find("#approval_widget_search").off("click").on("click", function() { //NO I18N
                            $home_page.toggleAppWidgetSearch(true);
                          });
                          const approvalList = ["request", "change", "release", "purchase"]; //NO I18N
                          approvalList.forEach(function (approval) {
                            let panelHeader = document.getElementById(approval + "_approvals_panel");
                            if (panelHeader != null && panelHeader != "undefined") {
                              panelHeader.onzpanelexpand = function () {
                                const $self = jQuery(this);
                                $self
                                  .find("span[data-actip]")
                                  .uitooltip({ content: translate("sdp.common.collapse") });
                                $self.attr("data-expanded", true);
                                $home_page.processModuleApprovals(
                                  "my_" + approval + "_pending_approvals", //NO I18N
                                  this
                                );
                              };
                              panelHeader.onzpanelcollapse = function () {
                                const $self = jQuery(this);
                                $self
                                  .find("span[data-actip]")
                                  .uitooltip({ content: translate("sdp.common.expand") });
                                $self.attr("data-expanded", false);
                              };
                            }
                          });
                          $home_page.addCustomizationWidget(placeHolder);
                        });
                        (!$header.data.isAssetBuild && !$home_page.options.isSingleWidget && ("Technician" == sdp_user.USERTYPE)) && jQuery("#approval_widget #ShareWidget").removeClass("hide");//NO I18N
                        $home_page.isApproval=true;

                        if (isCreatorDashboard) {
                            var container = jQuery("#sdphome-pendingApprovals-placeholder").parent("[at-name=widgetsContainer]");//NO I18N
                            container.find(".widget-panel").attr("style", "overflow-y:auto").height(container.height() - container.find(".widget-header").outerHeight() - 10);
                        }
                        setTimeout(function(){
                            initTooltip('#sdphome-pendingApprovals-placeholder');//NO I18N
                            $home_page.openApprovalPanelByDefault(); //To open the first available pending approvals section in the home page
                            widgetbgwdh();
                        }, 50);
                    }
                });
            }
        });
    },

    //This method is used to expand the first approval panel available in the home page approvals widget
    openApprovalPanelByDefault: function() {
      if(sdp_app.approval_slider_opened_from != null && jQuery("#" + sdp_app.approval_slider_opened_from + "_pending_approval_header").length > 0){
        jQuery("#" + sdp_app.approval_slider_opened_from + "_pending_approval_header").trigger('click');
      } else {
        const firstApprovalPanel = document.querySelector('.widget-panel z-collapsiblepanels z-cpheading:not([hidden])');
        if (firstApprovalPanel) {
          document.getElementById(firstApprovalPanel.parentElement.parentElement.getAttribute('id')).expandPanel();
        }
      }
    },

    //This method is used to load the module specific approvals in regard with the approval panel expanded
    processModuleApprovals: function(filterName, element) {
            var approval_input_data = { "list_info": { "row_count": "100", "sort_field":"sent_on","sort_order":"desc","fields_required" : ["approval_level.request.is_service_request", "approval_level.request.created_time", "approval_level.purchase_request.created_date", "approval_level.purchase_order.created_date", "approval_level.release.created_time", "approval_level.change.created_time"],"filter_by": { "name": filterName } } };// No I18N
            var approval_input_items = sdpToJSON(approval_input_data);
            $home_page.curr_filter = filterName;
            sdpAjax({
                cache: false,
                url: "/api/v3/approvals",//NO I18N
                data: {"format": "json", "input_data": approval_input_items},//NO I18N
                type: 'GET', //No I18N
                success: function(response) {
                    var approvalResponse = {};
                    if(response.response_status[0].status == "success"){
                        if (response.approvals.length > 0) {
                            var module_name = $home_page.getModuleForFilter($home_page.curr_filter);
                            approvalResponse.approvals = response.approvals;
                            $home_page.approvals[module_name] = response.approvals;
                            approvalResponse.currency_symbol = $home_page.currency_symbol;
                            var template = module_name + "-approvals-list"; //NO I18N
                            var container = "#" + module_name + "_approvals_list_container";  //NO I18N
                            if(jQuery("#" + module_name + "_approvals_panel").attr("data-expanded") == "true"){
                              jQuery(container).html("");
                              renderhbs(container, template, approvalResponse, true, "approval"); // NO I18N
                            }
                            initTooltip("#approval-widget-panel"); // No I18N
                        }
                    }
                }
            }).done(function() {
              /**
               * when we intially call 'setOptions' right after home page is loaded, approval wizard isn't completly rendered. so calling it once again after Approval wizard is properly loaded
               */
              setTimeout(function(){
                  $home_page.approvalsPanelSearch("#searchApprovalInp"); //NO I18N
                  $extFrame.setOptions();
              }, 400);
            })
    },

    //This method is used to get the module name based on the filter
    getModuleForFilter: function(filterName) {
        const filterMap = {
            "my_request_pending_approvals": "request", //NO I18N
            "my_change_pending_approvals": "change", //NO I18N
            "my_release_pending_approvals": "release", //NO I18N
            "my_purchase_pending_approvals": "purchase" //NO I18N
        };
        return filterMap[filterName];
    },

    getUrlForApprovalsListView: function(approvalResponse) {
      let url = "/ui/approvals?mode=get" + (window.location.href.includes("externalframe=true") ? "&externalframe=true" : ""); //NO I18N
      let filter_url = url + "&from_filter="; //NO I18N
      approvalResponse.url_json = {
          url : url,
          req_url : filter_url + "request", //NO I18N
          chg_url : filter_url + "change", //NO I18N
          rel_url : filter_url + "release", //NO I18N
          pur_url : filter_url + "purchase" //NO I18N
      }
      return approvalResponse;
    },
    
    //This method is used to show and hide the search bar in the approvals widget
    toggleAppWidgetSearch: function(open) {
      if(open && $home_page.initSearchErrMsg()) {
          jQuery("#searchApprvHeader").removeClass('hide');
          jQuery("#widgetHeader").addClass('hide');
          jQuery("#searchApprovalInp").trigger('focus');
      } else {
          jQuery("#searchApprvHeader").addClass('hide');
          jQuery("#widgetHeader").removeClass('hide');
          jQuery("#searchApprovalInp").val('').trigger('keyup');
      }
    },

    initSearchErrMsg: function() {
      var pendingApprovals = jQuery("#approval-widget-panel"), atLeastOneExpanded = false; // NO I18N
      pendingApprovals.find(".zcollapsiblepanel").each(function () {
        var approvalBox = jQuery(this), module = approvalBox[0].id.split('_')[0];
          if(jQuery("#" + module + "_approvals_panel").attr("aria-expanded") == "true"){
            atLeastOneExpanded = true;
          }
      });
      if (atLeastOneExpanded) {
          return true;
      } else {
          window.showalert("warning", translate("approvals.search.warning.msg"), "isAutoHide=true, delay=10");  // No I18N
          return false;
      }
    },

    approvalsPanelSearch: function (_this){
      var searchText = jQuery(_this).val().trim();
      searchText = searchText ? searchText.toLowerCase() : "";
      var pendingApprovals = jQuery("#approval-widget-panel"); // NO I18N

      pendingApprovals.find(".zcollapsiblepanel").each(function () {
          var approvalBox = jQuery(this), module = approvalBox[0].id.split('_')[0], cnt = 0;
          approvalBox.show();
          var entityNameText = approvalBox.find(".zcollapsiblepanel__heading").text();
          var entityName = entityNameText.trim().split(' ')[0];
          entityName = entityName ? entityName.toLowerCase() : "";
          //If entityName matches the searchText show all approvals in the entity
          //Or search each approval inside the module.
          if (entityName.indexOf(searchText) !== -1) {
              approvalBox.find(".widget-details-highlight").each(function (index, el) {
                  var card = jQuery(el);
                  card.removeClass("hide").addClass("show");
                  cnt += 1;
              });
          } else {
              approvalBox.find(".widget-details-highlight").each(function (index, el) {
                  var card = jQuery(el);
                  var nodeText = (card.text() || "").toLowerCase();
                  if(nodeText.indexOf(searchText) === -1){
                    card.addClass("hide"); //No I18N
                  } else {
                    card.removeClass("hide"); //No I18N
                    cnt += 1;
                  }
              });
          }

          var panel = jQuery("#" + module + "_approvals_panel"), srhCount = jQuery("#" + module + "_srh_count"), totalCount = jQuery("#" + module + "_total_count"), appnf = jQuery("#" + module + "_appnf");

          if (searchText.length > 0 && panel.attr("aria-expanded") == "true") {
              srhCount.text(cnt).removeClass('hide');
              totalCount.addClass('hide');
              appnf.toggleClass('hide', cnt !== 0); //NO I18N
          } else {
              srhCount.addClass('hide');
              totalCount.removeClass('hide');
              appnf.addClass('hide');
              if (searchText.length > 0) {
                  approvalBox[0].hide();
              } else {
                  approvalBox[0].show();
              }
          }
      });
    },

    processSummary: function(){
      $home_page.keyMap = {
        "My_Pending_Clarification": "sdp.approve.needclarification", //NO I18N
        "Overdue_User": "sdp.home.summary.overDueRequestsTitle", //NO I18N
        "Open_User": "sdp.requests.viewrequest.openrequests", //NO I18N
        "Due_Today_User": "sdp.home.summary.requestsDueTodayTitle", //NO I18N
        "Due_Tomorrow_User": "req.due.tom", //NO I18N
        "Closed_User": "sdp.requests.viewrequest.requester.allclosedrequests", //NO I18N
        "Resolved_User": "req.resolved", //NO I18N
        "Response_Due_User": "req.resp.due", //NO I18N
        "All_Pending_User": "sdp.home.summary.openRequestsTitle", //NO I18N
        "Unapproved_user": "req.unapproved", //NO I18N
        "Unassigned_System": "sdp.requests.viewrequest.unassignedrequests", //NO I18N 
        "my_approved_changes": "sdp.home.summary.apprchanges", //NO I18N
        "my_unapproved_changes": "sdp.home.summary.unapprchanges", //NO I18N
        "my_open_problems": "sdp.problem.listview.openproblems", //NO I18N
        "my_pending_problems": "sdp.problem.listview.pendingproblems", //NO I18N
        "unassigned_problems": "sdp.home.summary.unassignedproblems" //NO I18N
      }
      jQuery("#sdphome-summary-placeholder .widget-panel").html(ajaxBar());
      $home_page.summary_personalizeKey = "mysummary_"+$home_page.options.currentView;//NO I18N
      $home_page.summaryPersonalization = $home_page.getMySummaryPersonalization();
      $home_page.initMysummaryWidget();
    },
    
    initMysummaryWidget: function () {
      Handlebars.registerHelper('getURL', function (filter) { // No I18n
        var list_info = filter.criteria;
        return '/ui/load_list?module=requests&input_data=' + encodeURI(sdpToJSON({list_info})); // No I18n
      });

      sdpAjax({
        cache: false,
        url: "/servlet/SDAjaxServlet",//NO I18N
        data: {"format": "json", "action": "GetMySummary", personalize_key: $home_page.summary_personalizeKey},//NO I18N
        type: 'GET', //No I18N
        success: function(response)
        {
          if (response != null && response.status == "success" && response.userPermitted)
          {
            response = {...summaryWidgetParams, ...response};
            var countData = response.countData;
            for (var i = 0; i < countData.length; i++) {
              var data = countData[i];
              data.i18key = $home_page.getSummaryFilterI18nkey(data.id);
              data.name = translate(data.i18key);
            }

            response.withIcon = $home_page.summaryPersonalization.withIcon || true;
            response.showLines = $home_page.summaryPersonalization.showLines || true;
            response.appendAccount = sdp_app.IS_MSPOrSCP ? "&persistentAccountId=0" : ""; //NO I18N

            let placeHolder = "#sdphome-summary-placeholder"; //NO I18N
            renderhbs(placeHolder, "summary-widget", response, false, "home", false, false, function() { //NO I18N
              $home_page.addCustomizationWidget(placeHolder);
            });
            if ($home_page.viewRequests) {
              setTimeout(function() {
                if(typeof nmiPreview != 'undefined' && nmiPreview) {
                  jQuery('[data-id="My_Pending_Clarification"]').trigger('click');
                }
              },100);
            }

            jQuery("#sdphome-summary-placeholder .summaryCount").off(".summarycount").on("click.summarycount", function(event) { // No I18N
              if(jQuery(this).data("module")=="request") {
                if(jQuery(this).data("id")=="My_Pending_Clarification") {
                  let count = jQuery(this).data("count"); //NO I18N
                  $home_page.loadClarificationPopup(count);
                }
                else {
                  if(externalframe) {
                    window.open(jQuery(this).data("criteria"), '_blank', "noopener");
                  }
                  else {
                    listview_popup.render(jQuery(this).data("criteria"), jQuery(this).data("name")); //NO I18N
                  }
                  event.preventDefault();
                }
              }
            });

            $home_page.loadMysummaryFilters();
            initTooltip("#sdphome-summary-placeholder"); //NO I18N
          }
        }
      }).done(() => (setTimeout(function() { $extFrame.setOptions('#summary_widget'); }, 100)));
    },
    
    loadMysummaryFilters: function() {
      $home_page.summaryFilters = [
        ...(($home_page.viewRequests == true) ? ["My_Pending_Clarification", "Open_User", "Overdue_User", "Due_Today_User", "Due_Tomorrow_User", "Closed_User", "Resolved_User", "Response_Due_User", "All_Pending_User", "Unapproved_user", "Unassigned_System"] : []), //NO I18N
        ...(($home_page.viewChanges == true) ? ["my_approved_changes", "my_unapproved_changes"] : []), //NO I18N
        ...(($home_page.viewProblems == true) ? ["my_pending_problems", "my_open_problems", "unassigned_problems"] : []) //NO I18N
      ];

      var summaryFilters = $home_page.summaryFilters.slice();
      var filtersToChoose = [];
      var personalizedData = $home_page.summaryPersonalization.filters;
      for (var i = 0; i < personalizedData.length; i++) {
        var perfilter = personalizedData[i];
        var idx = summaryFilters.findIndex(f => f === perfilter);
        if (idx != -1) {
          filtersToChoose.push({ id: e_html(perfilter), name: e_html(translate($home_page.getSummaryFilterI18nkey(perfilter))), selected: true });
          summaryFilters.splice(idx, 1);
        }
      }

      for (var i = 0; i < summaryFilters.length; i++) {
        var filt = summaryFilters[i];
        filtersToChoose.push({id: e_html(filt), name: e_html(translate($home_page.getSummaryFilterI18nkey(filt)))});
      }

      if (filtersToChoose.length > 0) {
        $home_page.filtersToChoose = filtersToChoose;
        $home_page.initSummaryColumnChooser();
      }
    },
    
    initSummaryColumnChooser: function() {
      var columnData = $home_page.filtersToChoose;
      var customizeLink = `<span closeOnBodyClick=true class="btn-link cur-ptr sdmenu-toggle" data-column-chooser="" data-toggle="dropdown" id="columnsort_summary_customize" data-target-id="#showPopover_summary_customize" rel="uitip" title="` + e_attr(translate("column.chooser.title")) + `"><span class="lsprite icon-sm li-clmchooser1" aria-hidden="true"></span></span>`; // No I18n
      new SortableColumnChooser('summary_customize', { //NO I18N
        columns: columnData,
        callBackFunc: function (selectedFilters) {
          if (selectedFilters.length < 1 || selectedFilters.length > 10) {
            showalert("failure", e_html(translate("sdp.home.ssp.customization.msg.columnoutofrange", [10])), "isAutoHide=true"); // No I18n
            return;
          }
          selectedFilters = unescape(selectedFilters.toString()).split(",");
          selectedFilters = selectedFilters.filter(sl => $home_page.summaryFilters.includes(sl));
          ClientUtil.addUserPersonalization("mysummary", {filters: selectedFilters}, {internalKey: $home_page.summary_personalizeKey}).then((response) => { // No I18n
            $home_page.processSummary();
          });
        },
        isShowPopover: true,
        customizeLink: customizeLink,
        maxAllowedFields: 10
      });
      jQuery("#columnchooser_summary_customize").addClass("text-wrap"); //NO I18N
    },

    getMySummaryPersonalization: function() {
      var viewRequests = $home_page.viewRequests;
      var viewChanges = $home_page.viewChanges;
      var viewProblems = $home_page.viewProblems;
      if (sdp_user.CLIENT_CONF[$home_page.summary_personalizeKey]) {
        return sdp_user.CLIENT_CONF[$home_page.summary_personalizeKey];
      } else {
        return {
          filters:
            [
              ...((viewRequests==true) ? [
                "My_Pending_Clarification", //NO I18N
                "Overdue_User", //NO I18N
                "Due_Today_User", //NO I18N
                "All_Pending_User"] : []), //NO I18N
              ...((viewChanges==true) ? [
                "my_approved_changes", //NO I18N
                "my_unapproved_changes"] : []), //NO I18N
              ...((viewProblems==true) ? [
                "my_pending_problems", //NO I18N
                "unassigned_problems"] : []) //NO I18N
            ]
        }
      }
    },
    
    getSummaryFilterI18nkey: function(id) {
      return $home_page.keyMap[id];
    },

    refreshSummary : function() {
      $extFrame.getActiveWindow().nmiPreview = false;
      $home_page.processSummary();
    },

    loadClarificationPopup : function(count) {
    if(count && count > 0)
    {
      var title = '<div id="pending-request-title">' + translate("sdp.approve.needclarification")+" (" +count+ ")" + '</div>'; // No I18N
      $previewComponent.load('/approval/RequestClarifications.jsp?externalframe=true',title,"85%",null,null,'preview_approval_wrapper',false,null,'class:p0,scrolling:no,loaderClass:nmi-loading,closecallback:$home_page.refreshSummary'); //NO I18N
    }
  },

    processAnnouncements: function(){
    var announcementInput = {"list_info":{"filter_by":{"name":"currently_showing"},"row_count":25,"sort_field":"from_date","sort_order":"desc"}}//NO I18N

    // modifying object for msp
    if(isMSP && document.getElementById("fromAccTab") != null){
    var curraccid=document.getElementById("itemID").value;
    announcementInput.list_info.account_ids =[curraccid];
    }
    var announcementInputItems = sdpToJSON(announcementInput);
    sdpAjax({
      cache: false,
      async:false,
      url: "/api/v3/announcements",//NO I18N
      data: { "input_data": announcementInputItems},//NO I18N
      type: 'GET', //No I18N
      success: function(response) {
        if (response != null && response.announcements != undefined && response.announcements != null)
        {
            var noOfAnnouncements = response.announcements.length;
            var outputData = {};
            var announcements = [];
            var todaysDate = new Date();
            var todaysDatedd = todaysDate.getDate();
            var todaysDatemm = todaysDate.getMonth()+1;
            var todaysDateyyyy = todaysDate.getFullYear();
            if (noOfAnnouncements > 0)
            {
                for(var i=0; i<noOfAnnouncements; i++)
                {
                  var announcementDetailsFromResponse = response.announcements[i];
                  var annoucementDetails = announcementDetailsFromResponse;
                  var fromDate = new Date(parseInt(announcementDetailsFromResponse.from_date.value));
                  var fromDatedd = fromDate.getDate();
                  var fromDatemm = fromDate.getMonth() + 1;
                  var fromDateyyyy = fromDate.getFullYear();

          
                  if (todaysDatedd == fromDatedd && todaysDatemm == fromDatemm && todaysDateyyyy == fromDateyyyy)
                  {
                    annoucementDetails.isNew = true;
                  }
                  else
                  {
                    annoucementDetails.isNew = false;
                  }
                  announcements.push(annoucementDetails);
                }
                outputData.announcements = announcements;
            }
        outputData.user_details = sdp_user;
        outputData.permissions=$announcements.meta_information.permissions;
        outputData.isNotSingleWidget = !$home_page.options.isSingleWidget;
        jQuery('#announcement_widget').removeClass("hide");
        let placeHolder = "#sdphome-announcement-placeholder"; //No I18N
        renderhbs(placeHolder, 'sdphome-announcement', outputData,false,'home', true, false, function() { //No I18N
          let container = jQuery(placeHolder);
              container.find("#add-announcement").off("click").on("click", function() { //NO I18N
                $announcements.loadNewAnnounceForm();
              });
              container.find("#ShareWidget").off("click").on("click", function() { //NO I18N
                $dash.common.openEmbedDialog(this);
              });
              container.find("#all-announcements").off("click").on("click", function() { //NO I18N
                let showallURL = '/AnnounceShow.do?mode=view';  //NO I18N
                externalframe && (showallURL += "&externalframe=true");  //NO I18N
                sdp_user.USERTYPE == "Requester" ? window.open(showallURL,'_self', "noopener") : loadHomePageTabContent('allAnnouncement',true); //NO I18N
              });
              $home_page.addCustomizationWidget(placeHolder);
            });
        // MSP changes for showing announcements in Accounts Tab
        if(isMSP && document.getElementById("fromAccTab") != null && document.getElementById("fromAccTab").value=="true"){
          changeAnnouncementUrl();
        }
          }
      }
    });
    initTooltip('#sdphome-announcement-placeholder'); //No i18N
    },

    processTasks :  function(){
        taskcombinedViewObj.initCombinedView({
            isFilterEnabled : false,
            isColumnChooserEnabled : false,
            isSearchEnabled : false,
            isNavigationEnabled : false,
            isSortingEnabled : false,
            module : "home", //NO I18N
            from: "homeMyTasks" //NO I18N
        });
        jQuery("#task-comb-view").show();
        $extFrame.setOptions('#task_widget');//No I18N
    },

    processReminders: function(){
    let isDBOAllowed = sdpheader_data.esm_details && sdpheader_data.esm_details.current_portal.canAllowedDBOperation;
    jQuery("#reminder_widget").removeClass("hide");
    let placeHolder = "#sdphome-reminder-placeholder"; //NO I18N
    renderhbs(placeHolder, "sdphome-reminder", {"isDBOAllowed":isDBOAllowed}, false, "home", true, false, function() { //NO I18N
      let container = jQuery(placeHolder);
      container.find("#add_new_reminder").off("click").on("click", function() { //No I18N
        $header.invokeReminders({'mode':'add','entity':'home'}); //NO I18N
      });
      $home_page.addCustomizationWidget(placeHolder);
    });
    $extFrame.setOptions('#sdphome-reminder-placeholder');//No I18N
    setTimeout(function() {
      $header.invokeReminders({"mode":"list","entity":"home","container": document.getElementById("homereminder")});//No I18N
    },100);
    },

    processAssets:function(isCreatorDashboard) {
        sdpAjax({
          cache: false,
          //async: true,
          url: "/api/v3/users/"+sdp_user.LOGGEDIN_USERID+"/_associated_assets",//NO I18N
          data: {"input_data":'{"list_info":{"row_count":100}}'},//NO I18N
          type: 'GET', //No I18N
          success: function(response) {
              if (response != null)
              {
                  jQuery("#assets_widget").removeClass("hide");
                  renderhbs('#sdphome-Assets-placeholder', 'sdphome-assets',response, false, 'home_requester', true); // //NO I18N
                   //Added for booking asset section
                  $asset_booking_reschedule.loadBookedAssets();
                  if (isCreatorDashboard) {
                    var container = jQuery("#sdphome-Assets-placeholder").parent("[at-name=widgetsContainer]");//NO I18N
                    container.find(".widget-panel").attr("style", "overflow-y:auto").height(container.height() - container.find(".widget-header").outerHeight() - 10);
                  }
                  jQuery("#add_asset_booking").off("click").on("click", function(event) {  //NO I18N
                    window.open('/ui/assets/bookings?mode=add','_self', "noopener");  //No I18N
                  });
              }
          }
        });
    },

    reminderAction: function(url,action,method) {
    var successKey = "";
    var failureKey = "";
    if (action == "delete")
    {
      successKey = "api.deleted.success";//NO I18N
      failureKey = "api.deleted.failure";//NO I18N
    }
    else if (action == "statusupdate")
    {
      successKey = "api.updated.success";//NO I18N
      failureKey = "api.updated.failure";//NO I18N
    }
    sdpAjax({
      type: method,
      url: url,
      success: function(response) {
        var actionResult = jQuery(response).filter("#actionResult").html();//NO I18N
        if (actionResult != undefined && actionResult != null && actionResult === "Failure") { //NO I18N
            $remmodule.closeShowAlert("failure", translate(failureKey,[translate("sdp.events.newevent")]), 'isAutoHide=false');//NO I18N
        }
        else {
            $remmodule.closeShowAlert("success", translate(successKey,[translate("sdp.events.newevent")]), 'isAutoHide=true');//NO I18N
        }
        let tableObj = WebComponents.getInstance("webc-reminders");//NO I18N

        if(tableObj) {
            tableObj.t_obj.table_info.list_info.start_index = 1;
            tableObj.refreshTable();
        }
      },
      error: function(response) {
          $remmodule.closeShowAlert('failure', response.responseJSON.response_status.messages[0].message, 'isAutoHide=false'); // No I18N
      }
    });
    },

    delAnnouncement: function(id,fromViewAnn) {
        if(window.confirm(getMessageForKey('sdp.admin.change.commonlistview.deleteConform',[getMessageForKey("sdp.home.announcement.addnew.headTitle")]))) //NO I18N
        {
            sdpAjax({
                cache: false,
                async:false,
                url: "/api/v3/announcements/"+id, //NO I18N
                type: 'DELETE', //No I18N
                success: function(response) {
                    if(response.response_status.status == "success")
                    {
                       window.showalert("success", e_html(translate("api.deleted.success",[getMessageForKey("sdp.home.announcement.addnew.headTitle")])), 'isAutoHide=true');//NO I18N
                       $home_page.processAnnouncements(); 
                       if(fromViewAnn){
                         jQuery('#announceDialogDiv').dialog('close');//NO I18N
                       }
                    }
                }
            });
        }
        else
        {
          return;
        }
    },

    openNewWidgetSlide: function() {
        let isAdmin = sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 || sdp_user.ROLES.indexOf("SDAdmin") != -1; //NO I18N
        let templateData = { showAccessiblity: false, isHome: true, isAdmin: isAdmin, isEdit: false, title: "sdp.dashboard.common.newwidget", removedWidgets: undefined, isRemovedWidgetsAvailable: false }; // NO I18N
        newWidgetHTML = getCompiledTemplate('new-widget', templateData, "dashboard", true); //NO I18N
        jQuery(newWidgetHTML).show().panelSlider({
          width: 520,
          header: false,
          placement: sdp_user.DIRECTION === "RTL" ? "left" : "right", //NO I18N
          dialogClass: "tabui-rightpanel pos-fix", //NO I18N
          open: function(){
            zcomponent.collapsible_init("#ExistingWidgetsList"); //No I18n
            $header.searchCategories(jQuery("#ExistingWidgetsSearchBar"));
            initTooltip("#WidgetNewPanel"); //NO I18N
          }
        });
    },

    moveWidgetToTab: function(widget) {
        widget = jQuery(widget).closest("li").attr("id").replace("_widget", ""); //NO I18N
        var tab = $home_page.allowedTabs[widget];
        if (tab) {
          var inputData = {
            view_type: "WIDGET_TAB", //NO I18N
            name: widget,
            share_info: { view_option: 3, share_type: [] },
            widget_info: {
              diminfo: {},
              view_name: "tech_published" //NO I18N
            }
          };

          $home_page.invokeSaveApi(inputData);
        }
    },

    renderSingleWidget: function (singleWid) {
        var widget = jQuery(singleWid);
        jQuery("ul.gridsterul").css({ width: jQuery(window).width() - 1 }); //No I18N
        var container = jQuery("#spa-container");
        container.removeClass("bodypad"); //No I18N
        jQuery("[name=announcement_section]").length ? "" : container.before('<div name="announcement_section"></div>'); //No I18N
        jQuery("#home-widgets").height(window.innerHeight - 20); //No I18N
        jQuery("#home-widgets").width(window.innerWidth - 10); //No I18N
        widget.parents().find(".widgets-container").addClass("p0"); //No I18N
        widget.addClass("fh"); //No I18N
        widget.css({width: "100%"}); //No I18N
        jQuery("body").addClass("of-h"); //No I18N
        widget.find(".widget-panel").css({ height: "calc(100% - 46px)" }); //No I18N
    },

    openNewWidgetDialog: function() {
        jQuery(".action-customizehp").trigger("click"); //NO I18N
        setTimeout(function() {
          jQuery('#hpcustomgroup [data-name="addandremovewidgets"]').trigger('click'); //NO I18N
        }, 1);
    },

    headerBindEvents: function() {
      let header = jQuery("#headerbar");
      header.off(".headerbarns"); // No I18N
      header.on("click.headerbarns", "#homeHeaderNewTab", function(event) {
        $home_page.openTabConfigSlide({});
      });
      header.on("click.headerbarns", "#addNewWidget", function(event) {
        $dash.common.openSlider();
      });
      header.on("click.headerbarns", "#editHomeTab", function(event) {
        $home_page.editHomeTab(this);
      });
      header.on("click.headerbarns", "#deleteHomeTab", function(event) {
        $home_page.deleteHomeTab(this);
      });
      header.on("click.headerbarns", "#reorderHomeTab", function(event) {
        $home_page.reorderHomeTab(this);
      });
      header.on("click.headerbarns", "#techAvailability", function(event) {
        loadHomePageTabContent('schedular'); //NO I18N
      });
      header.on("click.headerbarns", "#backupTechChart", function(event) {
        showListForBackupTech();
      });
      header.on("click.headerbarns", "#scheduler_link", function(event) {
        loadHomePageTabContent('calendar'); //NO I18N
      });
      header.on("click.headerbarns", "#homeHeaderPublish,#homeHeaderCancel", function(event) {
        widgetbgwdh();
      });
      header.on('click.headerbarns', "#logged_in_tech_calendar", function(event) {
        showURLInDialog('/LoggedInTechs.do','position=relative,closeButton=no');  //No I18N
      });
      jQuery("#homeContent").off("click.movetotab").on("click.movetotab", "#moveToTabBtn", function(event) { //No I18N
        $home_page.moveWidgetToTab(this);
      });
    },

    addMovetoTabBtn: function() {
      let moveToTabBtn = `<button class="btn-link p0 mr5" id="moveToTabBtn" rel="uitip" title="${e_html(translate("sdp.reports.customreport.widget.tabinfo"))}"><span class="cspr icon-md flat vmiddle widget-tab"></span></button>`; //No I18N
      let allowedTabs = Object.values($home_page.allowedTabs).filter(function(tab) { 
          return (jQuery("#homeHeaderTabs>li."+tab.view+"-tab").length==0 && jQuery("#overflowingHomeTabs>li."+tab.view+"-tab").length==0);
      }).map(tab => tab.class).join(', ');

      let widgetsReady = jQuery("#home-widgets .widget-header:has(" + allowedTabs + ") .customizationIcons"); //No i18n
      widgetsReady.parents(".widget-bg:first").addClass("p-hidethis"); //No i18n
      widgetsReady = widgetsReady.filter(function(i, v) { return jQuery(v).find("#moveToTabBtn").length==0 });
      $home_page.isEnterpriseLicense && widgetsReady.prepend(moveToTabBtn);
      jQuery($home_page.tabDetails.filter(ele => ele.tabType === "WIDGET_TAB").map(tab => tab.class).join(', ')).siblings(".hidethis").find(".move-widget").attr("disabled", true); //No i18n
    }
};