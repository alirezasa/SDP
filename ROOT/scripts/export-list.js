// Export list view options with API implementation
var exportDialog = {
  context: {},
  exportModal: function() {
    this.context.formats = [{
      key: 'HTML',    //NO I18N
      name: translate('ae.export.format.html'),   //NO I18N
      icon_class: 'attachment-sprite attach-ie',       //NO I18N
      checked: 'checked'  //NO I18N
    }, {
      key: 'XLS', //NO I18N
      name: translate('sdp.reports.customreport.xls'),    //NO I18N
      icon_class: 'attachment-sprite attach-xls',  //NO I18N
      checked: ''  //NO I18N
    }, {
      key: 'XLSX', //NO I18N
      name: translate('reports.customreport.xlsx'),    //NO I18N
      icon_class: 'attachment-sprite attach-xls',  //NO I18N
      checked: ''  //NO I18N
    }, {
      key: 'PDF', //NO I18N
      name: translate('sdp.reports.customreport.pdf'),    //NO I18N
      icon_class: 'attachment-sprite attach-pdf',  //NO I18N
      checked: ''  //NO I18N
    }, {
      key: 'CSV', //NO I18N
      name: translate('sdp.reports.customreport.csv'),    //NO I18N
      icon_class: 'attachment-sprite attach-file', //NO I18N
      checked: ''  //NO I18N
    }];
  },
  init: function (options, exportInfo) {
    this.exportModal();
    this.context.info = translate('ae.mc.export.info.rowlimit');    //NO I18N
    var excludedCols = exportInfo.excluded_columns;
    if (excludedCols && excludedCols.length > 0) {
      var info;
      for (var i = 0; i < excludedCols.length; i++) {
        info = info ? info + ', ' + excludedCols[i] : excludedCols[i];  //NO I18N
      }
      info = translate('ae.mc.export.info.excludedcolumns', [info]);   //NO I18N
      this.context.info = this.context.info ? this.context.info + '<br>' + info : info;  //NO I18N
    }
  },
  /*
   * Renders the export dialog box when export button is clicked.
   * Shows the supported types as options for the user to select and submit.
   */
  render: function (options) {
    var _self = this;

    _self.init(options, {});
    if (!jQuery('#exportlistview').length) { //No I18N
      jQuery('body').append('<div id="exportlistview"></div>'); //NO I18N
    }
    _self.context = jQuery.extend(true, _self.context, options);
    //TODO: Need to handle the hbs when moving as component
    renderhbs('#exportlistview', 'export-view', _self.context, false, 'components'); //No I18N

    jQuery('#exportlistview').dialog({ //No I18N
      title: options.title,
      width: 500,
      close: function () {
        jQuery(this).dialog('close').remove(); //NO I18N
      }
    })
  },
  /*
   * When export format is selected and submitted, the following function constructs input_data for export.
   * Export API is called for the module and file is downloaded.
   * If File protection is enabled in the product, the exported file is a password protected zip.
   */
  exportView: function (options) {
    var list_info = jQuery.extend({}, options.list_info);
     if(list_info.sort_valuepath) {
          delete list_info.sort_valuepath;
    }
    var input_data = {
      'export': {//No I18N
        format: options.type
      },
      list_info: list_info
    };
    if(options.title){
      input_data['export'].title = options.title;   //No I18N
    }
    if(!options.type) {
      showalert('failure', translate('sdp.reports.errmsg.selectvalue'), 'isAutoHide=true'); // No I18N
      return false;
    }
    jQuery('#export_listview').button('loading');   //No I18N
    try {
      var fileType = options.is_file_protection_required ? 'zip' : options.type.toLowerCase();//No I18N
      let apass = {
          url: "/api/v3/" + options.module + "/_export",   //No I18N
          list_info: input_data,
          fileType: fileType,
          filename: (options.title ? options.title : Date.now()) + '.'+fileType
      }
      cl_attach.blobdownload(apass, function(xhr, status, error) {
          jQuery('#export_listview').button('reset'); //No I18N
          if(status == "parsererror") {
            return;
          }
          jQuery('#exportlistview').dialog('close'); //No I18N
      });
    } catch (e) {
      jQuery('#export_listview').button('reset'); //No I18N
      console.error(e);
    }
  },
  closedialog: function() {
    jQuery('#exportlistview').dialog('close'); //No I18N
  }
};