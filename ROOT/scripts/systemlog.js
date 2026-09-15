var $systemlog = {
  view: "table",//No I18N
  viewMode: "table",//No I18N
  table_comp_systemlog:{},
  module: "systemlogs",//No I18N
  init: function(options){
    renderhbs('#systemlog-section', 'systemlog-list-section', options, false, 'systemlogs');//No I18N
    /*To destroy previous instance of tablecomponent*/
    if($systemlog && $systemlog.table_comp_systemlog && !jQuery.isEmptyObject($systemlog.table_comp_systemlog)){
      $systemlog.table_comp_systemlog.destroy();
    }

    var _self = this;
    var params;
    if(options)
    {
      params=options
    }
    else{
      params= getSDPURLParams();
    }
    _self.search_text = params.gsearch;
    _self.permissions=_self.getPermissions();
    var contextObj = Object.assign({},_self.permissions);
    contextObj.checkbox = true;
    contextObj.actioncell = true;
    _self.show_icons = {"checkbox": true, "actioncell": true}; // No I18N
    //If no permissions to delete, hide the action cell
    if(!_self.permissions.delete){
        _self.show_icons.actioncell = contextObj.actioncell = false;
        _self.show_icons.checkbox = contextObj.checkbox = false;
    }
    contextObj.module = _self.module;
    contextObj.view = _self.view;
    contextObj.viewMode = _self.viewMode;
    contextObj.entityDisplayName =  translate("sdp.header.systemlog");//No I18N
    renderhbs('#systemlog_listviewloader','systemlog-listview',contextObj,false,'systemlogs',true,null,function(){//No I18N
      renderhbs('#systemlog_table_render_div','systemlog-web-component-template',contextObj,false,'systemlogs');//No I18N
    },null);

    $systemlog.loadSystemLogTableComponent();
  },
  deleteAllSystemLogs: function(){
    var _self = this;
    var delete_all_syslogs = function (confirm) {
        var url = "/api/v3/systemlogs/_purge";//No I18N
        if (confirm) {
            sdpAjax({
                url: url,
                type: "DELETE",  // No I18N
                success: function (resp) {
                    if (resp.response_status && resp.response_status.status == "success") {
                        showalert("success",translate('sdp.support.errorlog.listview.deleteall.success'), "isAutoHide=true");  //No I18N
                        setTimeout(function () {
                          jQ("#systemlogs_refreshfreq").trigger("click"); //No I18N
                        }, 1100);
                    }
                },
                error:function(resp){
                  showalert('failure', e_html(resp.messages[0].message));
                }
            });
        }
    };
    var title = translate("sdp.common.deleteall");
    var message = translate("sdp.support.errorlog.deleteall");
    showconfirm(true, 'title=' + title + ', message=' + message + ', submitbutton=' + translate("sdp.common.ok") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', delete_all_syslogs,true); //No I18N
  },
  getPermissions: function () {
    let _self = this;
    let permissions = {};
    let url = "/api/v3/" + _self.module + "/_links";//No I18N
    let sdpOptions = {
      url: url,
      success: function (response) {
        var links = response._links;
        links = links.links || links;
        links.forEach(function (link) {
          if (link.name) {
            permissions[link.name] = true;
          }
        });
      },
      async: false
    };
    sdpAjax(sdpOptions);
    return permissions;
  },
  loadSystemLogTableComponent: function () {
    _self = this;
    var componentName = ""; // No I18N
    componentName = "webc-systemlogs"; // No I18N
    delete WebComponents.instancePool[componentName];
    _self.current_view_mode = 'table';//No I18N
    WebComponents.render(componentName);
    $systemlog.table_comp_systemlog = WebComponents.getInstance(componentName);
  },

  //Action and Checkbox /Radio cell construction
  rowDataConstruct: function (tableInfo, args) {
    var inputObject = {};
    var fields_required = tableInfo.fields_required;
    var fields_required_arr = Object.keys(fields_required);
    //Forced addition of fields for tooltip construction
    if (fields_required_arr.indexOf("has_attachments") == -1) { // No I18N
      fields_required_arr.push("has_attachments"); // No I18N
    }
    inputObject.fields_required = fields_required_arr;
    inputObject.list_info = tableInfo.list_info;
    return inputObject;
  },
  callbackInitialRender: function (viewMode) {
  },
  callbackAfterTableRender: function () {
  },
  tableCompOptions: function () {
    var _self = this,
      options = {};
    options = {
      "column_settings": { //No i18N
        "default_position": 2, //No i18N
        "assign_content_width": false, //No i18N
        "assign_label_width": false, //No i18N
        "columns": [//No I18N
          {
            "size": 1, //No i18N
            "width": (_self.icon_count == 2 ? '70px' : (_self.icon_count == 1 ? '50px' : '80px')) //No i18N
          },
          {
            "size": 11, //No i18N
            "row_count": 2, //No i18N
            "pipe_separation": true, //No i18N
            "default_rowposition": 2//No I18N
          }
        ]
      },
      "icon_settings": {//No I18N
        "show_icons_Bottom": true, //No I18N
        "position": 2, //No I18N
        "isPrepend": true,  //No I18N
        "rowPosition": 2,  //No I18N
        "class": "req_icons disp-ib vmiddle" //No I18N
      },
      "default_sort_field": {//No I18N
        "sort_field": "id",//No I18N
        "sort_order": "desc"//No I18N
      },
      "listSettingOptions": {//No I18N
        "enableSettings": ["record_per_page", "refresh_frequency"], //No I18N
        "disableSettings": ["text_wrapping"] //No I18N
      },
      "reinitializeCalback": _self.reinitializeCallback //No I18N
    };
    return options;
  },
  tableEntityInfo: function (personalize_key) {
    var table_info = getPersonalizeData(personalize_key), _self = this;
    if (jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)) {
      var t_info, _self = this;
      var listInfo = {
        start_index: 1,
        row_count: 10
      };
      t_info = {
        "list_info": listInfo, //No i18N
        "fields_required": { "has_attachments": "", "id": "", "message": "", "module": "", "submodule": "", "action": "", "type": "", "occurred_time": "", "owner": "" },// No I18N
        "column_order": ["has_attachments", "id", "message", "module", "submodule", "action", "type", "occurred_time", "owner"]// No I18N
      };
      table_info = t_info;
    }
    if ($systemlog.search_text) {
      table_info.list_info.gsearch = $systemlog.search_text;
      delete table_info.list_info.filter_by;
      jQuery("#subheader_search_box").val($systemlog.search_text); // No I18N
    }
    else {
      jQuery("#subheader_search_box").val(""); // No I18N
    }

    return table_info;
  },
  setNoDataString: function () {
    let message = translate("sdp.listview.nodataavailble");
    return '<span>' + message + '</span>';// No I18N

  },
  constructCellData: function (table_data) {
    var hd = table_data.head_data;
    var rd = table_data.row_data;
    var field = hd.id;
    var val = rd[field];
    if (val == '' || val == null) {
      val = "-"
    }
    return val;
  },
  constructMessageCell: function (table_data) {
    var rd = table_data.row_data;
    var onclickHandler = "$systemlog.openErrorLog('/ErrorLogDetails.do?errorId=" + rd.id + "', '' , 'ErrorLogDetails','1000')"; //NO I18N
    var attachmentIcon = "";
    if (rd.has_attachments) {
      attachmentIcon = '<span class="cur-ptr top-1 icon-sm cspr paperclip mr5 opac5" role="img" aria-label="Attachments"></span>'; // No I18N
    }
    var content = '<a class ="truncate-wrapper cur-ptr" rel="uitip noopener" title="' + e_html(rd.message) + '" data-event="click" data-handler="' + onclickHandler + '" href="/">' + attachmentIcon + e_html(rd.message) + '</a>';
    return content;
  },
  reinitializeCallback: function () {
    $systemlog.loadSystemLogTableComponent();
  },
  setWidth: function () {
    return jQuery("#listview").width(); // No I18N
  },
  setHeight: function () {
    var height;
    var listview_height;
    listview_height = 110;
    var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
    jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
    return height;
  },
  openErrorLog: function (url, title, id, w) { //  Issue Fix - #103884
    var jB = jQuery('body');
    if (jB.find('#' + id).length == 1) {
      jB.find('#' + id).remove();
    }
    jB.append('<div id="' + id + '"></div>');
    jB.find('#' + id).dialog({  //create dialog, but keep it closed
      autoOpen: false,
      width: w,
      modal: true
    });
    jB.find('#' + id).load(url, function () {
      jB.find("div[aria-describedby=ErrorLogDetails]").find("span.ui-dialog-title").text(jB.find("#headerTitle").text());
      jB.find('#' + id).dialog("open"); // No I18N
    });
  }
};


