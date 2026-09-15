/**
 * Table export
 * Used to export the listview
 */
function tableExport(_self,options,addonOptions){
  var Export = {
    context: {},
    init: function (tObj, options) {
      this.tObj = tObj;
      this.options = options;
      if(!addonOptions.customButton){
          var exportTitle = addonOptions.title ? addonOptions.title : translate('sdp.export.pdf.button.value');
          let btnTemplate = '<button type="button" data-list-export="'+tObj.tableId+'" class="btn btn-default btn-sm"><span class="cspr export icon-sm vsub mr3 opac5"></span> '+exportTitle+'</button>';
          var $container = jQuery('#exportlistview_btn_'+tObj.tableId);
          if($container.length) {
            $container.html(btnTemplate);
            this.holder = $container.get(0);
          } 
      } else {
        this.holder =  addonOptions.holder && addonOptions.holder();
      }
      this.bindEvent();
    },
    bindEvent: function(){
      var _self = this;
      var tableId = _self.tObj.tableId;
      var holder = _self.holder;
      jQuery(holder).off('click.'+tableId+'_export')
      .on('click.'+tableId+'_export', '[data-list-export="'+tableId+'"]', ()=>_self.render());
    },
    bindDialogEvents:function($dialogContainer) {
      var _self = this;
      var tableId = _self.tObj.tableId;
      $dialogContainer.off('click.export_view')
      .on('click.export_view', '[data-list-export="export_'+tableId+'"]',()=>_self.exportView())
      .on('click.export_view', '[data-list-export="cancel_export_'+tableId+'"]', function(){
        $dialogContainer.dialog('close');
      });
    },
    initDialog: function () {
      this.exportModal();
      this.context.info = this.options.info ? this.options.info : translate("ae.mc.export.info.rowlimit"); //NO I18N
      var excludedCols = this.options.excluded_columns;
      if (excludedCols && excludedCols.length > 0) {
        var info;
        for (var i = 0; i < excludedCols.length; i++) {
          info = info ? info + ", " + excludedCols[i] : excludedCols[i]; //NO I18N
        }
        info = translate("ae.mc.export.info.excludedcolumns", [info]); //NO I18N
        this.context.info = this.context.info ? this.context.info + "<br>" + info : info; //NO I18N
      }
    },
    /*
     * Renders the export dialog box when export button is clicked.
     * Shows the supported types as options for the user to select and submit.
     */
    render: function () {
      var _self = this;
      _self.initDialog();
      var exportElId = this.tObj.tableId + "_exportlistview"; //NO I18N
      _self.$dialogContainer = jQuery("#" + exportElId);
      if (!_self.$dialogContainer.length) {
        //No I18N
        _self.$dialogContainer = jQuery('<div id="' + exportElId + '"></div>');
        jQuery("body").append(_self.$dialogContainer); //NO I18N
      }
      _self.options.tableId = _self.tObj.tableId;
      _self.context = jQuery.extend(true, _self.context, _self.options);
      renderhbs("#" + exportElId, "table-export-view", _self.context, false, "components"); //No I18N
      
      var dialogConfig = {
        title: addonOptions.title || translate('sdp.export.pdf.button.value'),
        width: 500,
        close: function () {
          jQuery(this).dialog("close").remove(); //NO I18N
          delete _self.$dialogContainer;
        },
      };

      _self.$dialogContainer.dialog(dialogConfig);
      _self.$dialogContainer.find('input[value="HTML"]').prop('checked',true);
      _self.bindDialogEvents(_self.$dialogContainer);
    },
    /*
     * When export format is selected and submitted, the following function constructs input_data for export.
     * Export API is called for the module and file is downloaded.
     * If File protection is enabled in the product, the exported file is a password protected zip.
     */
    exportView: function () {
      var options = this.options;
      var tableInfo = jQuery.extend({},this.tObj.t_obj.table_info.list_info);
      var columnOrder = this.tObj.t_obj.table_info.column_order || [];
      var fieldsRequired = tableInfo.fields_required || [];

      delete tableInfo.has_more_rows;
      delete tableInfo.end_index;
      delete tableInfo.total_count;
      delete tableInfo.get_total_count;
      delete tableInfo.sort_valuepath;
      //Column order process
      if(columnOrder && fieldsRequired){
        tableInfo.fields_required = columnOrder.reduce((result, field) => {
          if (fieldsRequired.includes(field)) {
            result.push(field);
          }
          return result;
        }, []);
      }
  
      var type = jQuery('input[name="export-format"]:checked',_self.$dialogContainer).val();
      if(!type){
        return;
      }
      if(typeof this.options.cbListinfo === 'function'){
        tableInfo = this.options.cbListinfo(this);
      }
      var list_info = jQuery.extend({}, tableInfo);
      var input_data = {
        export: {
          //No I18N
          format: type,
        },
        list_info: list_info,
      };
      if (options.title) {
        input_data["export"].title = options.title || ''; //NO I18N
      }
      try {
        var link = document.createElement("a");
        var fileType = options.is_file_protection_required ? "zip" : type.toLowerCase(); //No I18N
        link.download = (options.title ? options.title : Date.now()) + "." + fileType;
        var entity = options.module || options.entity_name;
        link.href = "/api/v3/" + entity + "/_export?" + sdpAjaxInputData(input_data); //NO I18N
        link.click();
        jQuery("#"+this.tObj.tableId+"_exportlistview").dialog("close"); //No I18N
      } catch (e) {
        console.error(e);
      }
    },
    /**
     * Function used to construct the export types
     */
    exportModal: function () {
      this.context.formats = [
        {
          key: "HTML", //NO I18N
          name: translate("ae.export.format.html"), //NO I18N
          icon_class: "attachment-sprite attach-ie", //NO I18N
          checked: "checked", //NO I18N
        },
        {
          key: "XLS", //NO I18N
          name: translate("sdp.reports.customreport.xls"), //NO I18N
          icon_class: "attachment-sprite attach-xls", //NO I18N
          checked: "", //NO I18N
        },
        {
          key: "XLSX", //NO I18N
          name: translate("reports.customreport.xlsx"), //NO I18N
          icon_class: "attachment-sprite attach-xls", //NO I18N
          checked: "", //NO I18N
        },
        {
          key: "PDF", //NO I18N
          name: translate("sdp.reports.customreport.pdf"), //NO I18N
          icon_class: "attachment-sprite attach-pdf", //NO I18N
          checked: "", //NO I18N
        },
        {
          key: "CSV", //NO I18N
          name: translate("sdp.reports.customreport.csv"), //NO I18N
          icon_class: "attachment-sprite attach-file", //NO I18N
          checked: "", //NO I18N
        },
      ];
      var _self = this;
      if(this.options.allowedFormats && this.options.allowedFormats.length > 0){
        this.context.formats = this.context.formats.filter(function(format){
          return _self.options.allowedFormats.includes(format.key.toLowerCase())
        });
      }
    },
  };

  Export.init(_self,options);

}
