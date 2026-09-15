/* $Id$ */
$req.lpanel = {
  request: [],
  list_info: {},
  personalize_key: 'request_details_page',//No I18N
  is_pinned: true,
  is_pers_pinned: true,
  max_req_count: 250,
  load_count: 25,
  loaded_req_count: 0,
  load_more: true,
  total_list_count: 0,
  current_viewname: null,
  /**
   * Initializes the left panel, binds the list navigation event
   */
  initialize: function() {
    /** Request navigation on clicking item */
      jQuery(".cview").on("click", ".cv-task-item", function(event){ //No I18N
        var reqIcons = jQuery(event.target).closest(".req_icons");//No I18N
        if (reqIcons.length > 0) { return false; }
        event.preventDefault();
        var reqId = jQuery(this).attr("data-entityid");
        var module = jQuery(this).attr("data-module");
        /** opening ticket in new tab, if cntrl/cmd key is pressed while opening the ticket */
        if(event.ctrlKey || event.metaKey) {
          window.open("/WorkOrder.do?woMode=viewWO&woID=" + reqId, "_blank");
          return false;
        }
        if (module == "task") {
          if($req.details.tab_name === "tasks") {//No I18N
            $req.details.changeTab();
          }
          return;
        }
        /* prevent the click event on icons in list card   */
        var accountId = isMSP ? jQuery(this).find("[req-account-id]").attr('req-account-id') : undefined;
        var didNavigate = $req.details.navigateWO(reqId, undefined, event, undefined, undefined, accountId);
         
          if (!didNavigate) {
            return;
        }
      });
    
    /**For hiding when column chooser gonna be save to hide the dropw down of the gear icon */
    jQuery(document).on("click", ".left-panel-settings .col-save-btn", function () {
      jQuery(this).closest('.left-panel-settings').find(".btn-group").removeClass("open");
    })
    jQuery(".left-setting-btn").on("click", function () {
      jQuery("#columnsort").show();
    })
    jQuery(document).on("click", ".left-panel-settings #columnsort", function () {
      jQuery(this).hide().closest('.left-panel-settings').find(".btn-group").addClass("open");
      
    })
    jQuery("#request-left-panel").on("click", ".show-sidebar-btn", function() { //No I18N
      $req.lpanel.initRender();
    });
    var pinkey = getPersonalizeData(this.personalize_key);
    if(pinkey.pinview === undefined) {
      this.is_pinned = this.is_pers_pinned = true;
      pinkey.overlap = pinkey.pin = false;
    } else {
      this.is_pinned = this.is_pers_pinned = pinkey.pinview;
      pinkey.overlap = pinkey.pin = !pinkey.pinview;
    }
    if(jW.width() <= $req.winsize_sm) {
      this.is_pinned = false;
      pinkey.overlap = pinkey.pin = true;
    }
    pinnableSidebar({
      content: '#request-left-panel',//No i18n
      overlaphtml: '<span class="sdp-glyph sdp-glyph-chevron-right"></span>',//No i18n
      pin:pinkey.pin,
      overlap:pinkey.overlap,
      bgfreeze: false,
      maxWidth: 280,
      animation: false,
      direction: 'left',//No i18n
      pinhtml: '<span class="cspr unpin icon-sm left1 top2"></span> <span>'+getMessageForKey("sdp.common.unpin")+'</span>',//No i18n
      unpinhtml: '<span class="cspr pin icon-sm left1 top2"></span> <span>'+getMessageForKey("sdp.common.pin")+'</span>',//No i18n
      removepin: false,
      closeOnEsc: false
    });
    initTooltip("#ListViewFilterMenu"); //No I18N
    },

    /**
     * Toggles the Left Panel based on the personalization or window size
     */
    toggle: function(personalize){
      var pinElement = jQuery("[data-id='pin']");
      var _self = this;
      if(personalize === false) {
        var lPanel = jQuery("#request-left-panel");
        if(jW.width() <= $req.winsize_sm) {
          if(this.is_pinned) {
            pinElement.html('<span class="cspr pin icon-sm left1 top2"></span> <span>'+getMessageForKey("sdp.common.unpin")+'</span>');  //No I18N
            lPanel.addClass('overlapcview pinmaincview').removeClass("vtop");
            lPanel.parent().removeClass('disp-t');
            this.is_pinned = false;
          }
          pinElement.addClass("hide");
        } else {
          if(!this.is_pinned && this.is_pers_pinned) {
            if(!lPanel) {
              jQuery("[data-id='pinnable-pin']").trigger("click");
            }
            pinElement.html('<span class="cspr unpin icon-sm left1 top2"></span> <span>'+getMessageForKey("sdp.common.pin")+'</span>');  //No I18N
            lPanel.removeClass('overlapcview pinmaincview').addClass("vtop").css("top", "");  //No I18N
            lPanel.parent().addClass('disp-t');
            this.is_pinned = true;
            // this.loadPanel(viewName);
            requestListViews.viewName = viewName;
            requestListViews.initRequestListView();
          }
          pinElement.removeClass("hide");
        }
        pinElement.attr('title', this.is_pinned?getMessageForKey('sdp.common.unpin'):getMessageForKey('sdp.common.pin'));
      } else {
        /** wait for the pinning / unpinning to get finished and personalize the status */
        setTimeout(function() {
          _self.is_pinned = _self.is_pers_pinned = jQuery("[data-id='pin'] .pin").length == 0;
          addPersonalization(_self.personalize_key, {pinview: _self.is_pinned});
          pinElement.attr('title', _self.is_pinned?getMessageForKey('sdp.common.unpin'):getMessageForKey('sdp.common.pin'));
        }, 100);
      }
      initTooltip("#ListViewFilterMenu"); //No I18N
    },

  /**
   * Selects the current Request and scroll to the item's position in the listview
   */
  selectItem : function(id, scrollToItem){
    jQuery("#request-left-panel .cv-task-item").removeClass('active').find('.truncate-wrapper').removeClass('sb');  //No I18N
    var selected_item = requestListViews.isUnified ? document.querySelector("#request-left-panel .cv-task-item[data-entityid='"+id+"'][data-module='request']") : document.querySelector("#request-left-panel .cv-task-item[data-entityid='"+id+"']");  //No I18N
      if(selected_item !== null) {
        jQuery(selected_item).addClass('active').find('.truncate-wrapper').addClass('sb');  //No I18N
      }
    var selector = requestListViews.isUnified ? "#activities_kanban_div" : "#requests_list_kanban_div" ; //No I18N
    if(scrollToItem && selector.length && selected_item) {
      jQuery(selector).animate({
        scrollTop: selected_item.offsetTop
      });
    }
  },

  /**
   * Function to render the Left panel whenever required
   */
  initRender: function() {
    var _self = this;
    this.loaded_req_count = 0;
    this.load_more = true;
    //passing the viewmode to initializaing 
    requestListViews.viewMode = "rq_leftpanel"; //No I18N
    if(window.current_req_mode == "combined"){
        requestListViews.isUnified = true;
    }
    function renderPanel() {
      if($req.details.request_info.is_trashed) {
        requestListViews.viewName = "TRASH"; //No I18N
        requestListViews.filter_by = {"name":"TRASH"}; //No I18N
        requestListViews.filter_i18n = getMessageForKey("sdp.requests.trashrequest");  //No I18N
      } else if(window.isMSPOrSCP && window.sdp_feature_status.is_unapproved_requester_enabled && $req.details.request_info.is_unknown) {
        requestListViews.viewName = "UNAPPROVED"; //No I18N
      } else {
        requestListViews.viewName = viewName; //No I18N
      }
      if(window.cs_enabled){
        color_settings_helper.callApi("request",function(csObj){ //No I18N
            color_settings_helper.color_settings = csObj;
            requestListViews.initRequestListView();
        });
      }else{
          requestListViews.initRequestListView();
      }
    }
    if(!jQuery("#request-left-panel").hasClass("pinmaincview")) { //No I18N
      renderPanel();
    }

    /** Refreshes the left panel list view based on the personalized time interval */
    if($req.details.refresh_frequency && !isNaN(parseInt($req.details.refresh_frequency)) && parseInt($req.details.refresh_frequency) > 0) {
      if(window.lp_refresh_interval) {
        clearInterval(window.lp_refresh_interval);
      }
      window.lp_refresh_interval = setInterval(function() {
        if($req.lpanel.is_pinned) {
          var tbObj = window.current_req_mode == "combined" ? table_combined_task : table_comp_request; //No I18N
          tbObj.isRefresh = true;
          tbObj.t_obj.table_info.list_info.start_index = 1;
          tbObj.refreshTable('refresh');//No I18N
          // renderPanel();
        }
      }, parseInt($req.details.refresh_frequency) * 1000 * 60);
    }
    setTimeout(function () {
      _self.selectItem(woID, jQuery('[data-entityid="' + woID + '"]'));
    }, 500)
  }
};
