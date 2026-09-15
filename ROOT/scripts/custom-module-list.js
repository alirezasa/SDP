// $Id$
var $CMList = {
  /*
   * whether the list view renders trashed records or not
   */
  is_trash: false,
  //saves the options for list view
  options: {},
  //holds the table component object for reference
  table_comp: {},
  //Current mode of list view: classic or table
  current_view: null,

  /** 
   * Button Configuration permission
   * **/
  getButtonPermissions(permissions) {
    const module_details = $CMCommon.module_details;
    const button_permissions = {};
    const readonlyMode = module_details.readonly_mode;

    if ($CMList.is_trash) {
      button_permissions.actioncell = !readonlyMode && (permissions.restore_from_trash || permissions['delete']);
      button_permissions.checkbox = !readonlyMode && permissions['delete'];
    } else {
      button_permissions.actioncell = !readonlyMode && (permissions.move_to_trash || permissions.edit);
      button_permissions.checkbox = !readonlyMode && permissions.move_to_trash;
    }

    return button_permissions;
  },
  /**
   * Header section action button's "Import/Expert" option
   * **/
  headerexporthtml() {
    const permissions = $CMCommon.permissions;
    let importui = '';
    if (permissions.import) {
      importui = `<li data-cs-field="import">
        <a href="/servlet/ImportServlet?submitaction=loadImportTab&module=${$CMCommon.module_details.name}" data-cs-field="import" title="${translate("sdp.common.import")}" rel="noopener">
          <span class="cspr import icon-sm vsub mr3 opac5"></span>
          <span data-i18n-key="sdp.common.import">${translate("sdp.common.import")}</span>
        </a>
      </li>`;
    }
    const btn = '<button type="button" aria-label="Actions" class="btn btn-default btn-sm sdmenu-toggle btn-rad-lft btn-rad-rgt" data-switch="sdmenu" data-cs-field="actions" id="bulkactionsMenu" aria-expanded="false"><span data-i18n-key="sdp.common.actions">'+translate("sdp.common.actions")+'</span><span class="caret ml5"></span></button>'; //No I18N
    const xhtml = `<div class="fl btn-group bs-noconflict mr10">
      ${btn}
      <ul class="sdmenu-dd" aria-labelledby="bulkactionsMenu">
        ${importui}
        <li id="cmlist_actions_export" data-cs-field="export" class="disabled cur-ptr">
          <span class="a-tag-sdmenu" role="button" id="load_export_dialog">
            <span class="cspr export icon-sm vsub mr3 opac3"></span>
            <span data-i18n-key="sdp.export.pdf.button.value">${translate("sdp.export.pdf.button.value")}</span>
          </span>
        </li>
      </ul>
    </div>`; 
    
    return xhtml;
  },

  /*
   * Constructs the html of 'No Data Banner' when a listview has no records.
   */
  noDataBannerHTML(table_data) {
    const _module_details = $CMCommon.module_details;
    const permissions = $CMCommon.getPermissions(_module_details.api_plural_name);
    const listInfo = table_data.t_obj.table_info.list_info;
    const search_filter = listInfo && listInfo.search_criteria && (!jQuery.isEmptyObject(listInfo.search_criteria) || listInfo.search_criteria.length > 0);
    const display_name = e_attr(_module_details.display_name);
    if(MC_Mapper['module_'+_module_details.api_plural_name] && MC_Mapper['module_'+_module_details.api_plural_name].is_trash) {
        return false
    }
    if (!$CMList.is_trash && !search_filter) {
      // Constructing HTML for no data banner
      const icon = _module_details.icon ? _module_details.icon : '/images/no-image-icon.svg'; //No I18N
      let html = `<div data-style="height:${Number($CMList.getHeight())}px"><div class="lt-tp-md-abs mt-30">`;
      const margin = _module_details.icon ? 'mb20' : ''; //No I18N

      // Encoding display_name second time to avoid XSS issue while hovering over the image
      html += `<div class="disp-t fw tc"><img rel="uitip" alt="${_module_details.icon ? display_name : translate('common.no.record.found')}" title="${display_name}" src="${icon}" height="130" width="180" class="${margin}"></div>`;
      html += `<div class="disp-t fw tc m-center"><p class="font-medium2 lh24 mb20 ww-bw">${_module_details.description ? e_html(_module_details.description) : translate('common.no.record.found')}</p>`;

      if (permissions.add) {
        html += `<button class="btn btn-primary" data-id="emptylistview" class="emptylistview" data-ename="${_module_details.api_plural_name}">${translate('ae.cmdb.inventory.addNewCI', [e_html(_module_details.display_name)])}</button>`; //No I18N
      }

      html += `</div></div></div>`;
      return html;
    } else {
      return false;
    }
  },
  /**
     * This function constructs the row data object for a table based on the provided table_info. It retrieves the list information and sets the filter based on whether it is in the trash mode or not.
     * **/
    rowDataConstruct (table_info) {
        let opti = MC_LIST.options;
        let info = {
            list_info: table_info.list_info
        };
        if (opti.input_data && opti.input_data.list_info) {
            info.list_info = jQuery.extend({}, info.list_info, opti.input_data.list_info)
        }
        var mname = opti.name ? opti.name : opti.module_options.options.name;
        let mdata = MC_Mapper['module_'+mname+'_tabledata']; //No I18N
        let linfo = mdata && mdata.info && mdata.info.table_info && mdata.info.table_info.list_info
        if(linfo) {
          info.list_info.start_index = mdata.info.table_info.list_info.start_index;
          info.list_info.row_count = mdata.info.table_info.list_info.row_count;
        }
        if(opti.is_trash || sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[mname+"_filter"] && sdp_user.CLIENT_CONF[mname+"_filter"].is_trash) { //No I18N
          info.list_info.filter_by = {
            name: 'trash' //No I18N
          };
        }
        return info;
    },
  /*
   * Table view is loaded in the list page
   * This function returns the additional options needed for table list view.
   */
  getTableOptions() {
    const _self = this;
    const _module_details = $CMCommon.module_details;
    const mlist = MC_LIST.options && MC_LIST.options.module_options && MC_LIST.options.module_options.options.entity_id;
    const mapper = MC_Mapper['module_' + _module_details.api_plural_name];
    
    if(mlist && mlist.entity_id != mapper.entity_id) {
      mapper.entity_id = mlist.entity_id;
    }
    const options = {
      default_sort_field: {
        sort_field: _module_details.primary_field_full_name,
        sort_order: 'asc' //No I18N
      },
      width_settings: {
        reduceWidth: !window.externalframe && headerData && headerData.themes_settings.layout.includes('sidebar') ? jQuery('.sidebar-container').width() : 0 //No I18N
      },
      entity_display_name: _module_details.display_plural_name,
      advSrchFiltEnabled: true,
      callbackSearchFunction: _self.callbackSearchFunction,
      advFilterSettings: {
        options: {
          metaInfoData: {
            metainfo: $CMCommon.metainfo
          },
          haveMultiString: true,
          skipTypes: ["Association"], //No I18N
          childAsParentFields: ["cm_fields"],
          ignoreTypes: ["Color", "MultiSelect", "CheckBox", "Attachment", "Url", "Email", "Phone", "Html"] //No I18N
        }
      },
      bulkSelectionSetting: {
        enabled: true,
        constructSelectedListCB: function(data) {
          var module_details = $CMCommon.module_details;
          var str = e_html(data[module_details.primary_field] ? data[module_details.primary_field] : data.cm_fields[module_details.primary_field]);
          return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+e_attr(str)+'">#'+data.id+' '+(str ? str : null)+'</span>'; //No I18N
        },
      },
      trashEnabled: mapper.is_trash,
      discard_without_displayname: true,
      meta_data: $CMCommon.metadata,
    };
    if (!mapper.is_trash) {
      options.deleteURL = mapper.name + "/_move_to_trash"; //No I18N
    } else {
      options.restoreURL = mapper.name + '/_restore_from_trash'; //No I18N
    }
    if (jQuery('[data-id=pinnable-contentfixed]').length == 0) {/** Mode 'list' classic view changes options **/
      let tableview = sdp_user && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[mapper.name+"_view"];
      if(tableview && tableview.mode == "classic") {
        var classicview = {
          default_sort_field: {
            sort_field: _module_details.primary_field_full_name,
            sort_order: 'asc', //No I18N
            start_index: '1', //No I18N
          },
          column_settings: {
            default_position: 2,
            columns: [{
            row_count: 1,
            size: 1,
            width: "40px"//No I18N
            },{
            size: 11,
            row_count: 2,
            default_rowposition: 1,
            pipe_separation: true
            }],
            assign_content_width: false,
            assign_label_width: false
          },
          view: "kanban",//No I18N
          view_mode: "linear",//No I18N
        };

        jQuery.extend(true, options, classicview);
      }
    } else {
      if (mapper.list.view === "classic" || mapper.mode == "details") {
        const link = '/ui/custom_module?module=' + (mapper.name || mapper.entity_name) + '&mode=details&entity_id=${id}'; //No I18N
        var classicoptions = {
          default_sort_field: {
            sort_field: _module_details.primary_field_full_name,
            sort_order: 'asc', //No I18N
            start_index: '1', //No I18N
          },
          column_settings: {
            default_position: 1,
            columns: [{
              size: 12,
              row_count: 1,
              default_rowposition: 1
            }],
            assign_content_width: false,
            assign_label_width: false
          },
          newtab_settings: {
            enabled: true,
            link_string: link
          },
          searchEnabled: false,
          selectedId: mapper.entity_id,
          lazyloadingEnabled: true,
          isPersonalizePagination: false,
        };
        jQuery.extend(true, options, classicoptions);
      }
    }
    options["listSettingOptions"] = {
      disableSettings: ['text_wrapping'],
      enableSettings: ['record_per_page']
    };

    return options;
  },


  callbackAfterBodyRender() {
    const modulename = $CMCommon.module_details.api_plural_name;
    const mapper = MC_Mapper['module_' + modulename];
    var tablecontainer = jQuery('#' + modulename + '_list_div');
        tablecontainer.removeClass("tablebrd1"); //No I18N

    if (mapper.components.list.options.view === 'classic') {
      setTimeout(function() {
        jQuery(".req-column-choose #columnsort").html('<span class="cspr clmchooser icon-sm vsub top-1 mr5" aria-hidden="true"></span>' + translate("common.columnchooser")); //No I18N
      }, 100);

      const height = jQuery('#' + modulename + '_list_kanban_div').height() - 10; //No I18N
      mapper.components.list.tableComp.setTableHeight(height);
    } else {
      let tabledata = MC_Mapper['module_' + modulename+ "_tabledata"]; //No I18N
      let ids = tabledata && tabledata.ids ? tabledata.ids : mapper.components.list.tableComp && mapper.components.list.tableComp.loadedIDs;//118031 -- Custom module listview export option enabale/disabled based on list count
      if (ids && ids.length === 0) {
        jQuery('li#cmlist_actions_export').addClass('disabled');
        jQuery('#load_export_dialog span.icon-sm').removeClass('opac5').addClass('opac3');
      } else {
        jQuery('li#cmlist_actions_export').removeClass('disabled');
        jQuery('#load_export_dialog span.icon-sm').removeClass('opac3').addClass('opac5');
      }
    }

    this.exportfn();
    this.tableAction(tablecontainer);
    initTooltip('.listview'); //No I18N
  },
  tableAction(tablecontainer) {
    const container = tablecontainer.find("tbody");

    /** Empty lisview **/
    tablecontainer.parent().off("click.emptylistview").on("click.emptylistview", "[data-id=emptylistview]", function() { //No I18N
      const ename = jQuery(this).data("ename"); //No I18N
      MC.load({mode:'add'},ename); //No I18N
    });
  },
  exportfn() {
    // Export button click action - load export dialog box
    const modulename = MC_LIST.options.entity || $CMCommon.module_details.api_plural_name;
    const mapper = MC_Mapper['module_' + modulename];

    jQuery("#load_export_dialog").off("click").on("click", function(e) { //No I18N
      e.preventDefault();
      // Load the export dialog only if there is any data in the list
      if (mapper.components.list.tableComp.loadedIDs.length > 0) {
        exportDialog.render({
          title: translate('sdp.export.pdf.button.value')
        });
      }
    });
    //Clicking export button
    jQuery(document).off('click.exportlistview').on('click.exportlistview', '#export_listview', function() { //No I18N
      var type = jQuery('input[name="export-format"]:checked').val();
      let linfo = MC_Mapper['module_'+MC.options.name] && MC_Mapper['module_'+MC.options.name].components && MC_Mapper['module_'+MC.options.name].components.list && MC_Mapper['module_'+MC.options.name].components.list.tableComp && MC_Mapper['module_'+MC.options.name].components.list.tableComp.t_obj.table_info
      var list_info = linfo ? linfo.list_info : $CMList.table_comp.t_obj.table_info.list_info;
      delete list_info.has_more_rows;
      delete list_info.end_index;
      delete list_info.total_count;
      var opt = {
        type: type,
        list_info: list_info,
        module: $CMCommon.module_details.api_plural_name,
        //By default title of the export document will be module name
        title: $CMCommon.module_details.display_plural_name,
        //isFileProtectionRequired is defined in the jsp page
        is_file_protection_required: (isFileProtectionRequired && isFileProtectionRequired === 'true')
      }
      opt.list_info.fields_required = Object.keys(linfo.fields_required);
      /**
       * If the listview is open from the popup,
       * then the export document title is set to timestamp.
       * else the default title will be present
       */
      try {
        if (typeof top.listview_popup !== undefined && top.listview_popup.title) {
          opt.title = new Date().getTime().toString();
        }
      } catch (error) {}

      exportDialog.exportView(opt);
    });
  },

  /*
   * In the list view, sort_field for the refer entity fields are called based on the value_path.
   * Adding the value_path here to sort based in appropriate lookup_field like created_by.name
   * For udf, value_path cannot be added in hbs column, so added via call back function
   * TODO: This can be removed, once the client team handles lookup_field based on metainfo instead of value_path
   */
  additionalMetaInfo() {
    var addlInfo = {};
    var metaInfo = $CMCommon.getMetaInfo();
    var fields = metaInfo.fields.cm_fields.fields;

    for (var key in fields) {
      if (fields[key].type === 'lookup' && (fields[key].multiple == null || (!fields[key].multiple || fields[key].multiple !== 'true')) && (fields[key].display_type != null && (fields[key].display_type !== 'Html' && fields[key].display_type !== 'Attachment'))) { //No I18N
        addlInfo['cm_fields.' + key] = {
          value_path: 'cm_fields.' + key + '.' + fields[key].lookup_field //No I18N
        };
      }
    }

    return addlInfo;
  },
    // contructs Action field to classic view option
  transformActionfield: function(options) {
    options["column_settings"] = {"position": 1};//No I18N
    options["hide_label"] = true; //No I18N
    return options;
  },
    // contructs Title field to classic view option
  transformRowfield: function(options) {
    options["column_settings"] = {view_type: 'row', rowposition: 1};//No I18N
    return options;
  },
  // contructs the title or primary field with link to the details page
  transformPrimaryfield(table_data, data, tableinfo) {
    var module_details = $CMCommon.module_details;
    var mapper = MC_Mapper['module_' + module_details.api_plural_name];
    var data = table_data.row_data;

    var value = data[module_details.primary_field] ? data[module_details.primary_field] : data.cm_fields ? data.cm_fields[module_details.primary_field] : null;
    var aClass = module_details.readonly_mode ? 'p5' : 'vmiddle'; //No I18N
    var spanClass = mapper.list.view === 'classic' ? 'text-color4' : ''; //No I18N
    let externalurl = externalframe ? "&externalframe=true" : ""; //No I18N
    let hrefinnercontent = `<span rel="uitip" mode_html="true" mode_ellipsis="true" title="${e_html(e_attr(value))}" class="${spanClass}">${e_html(value)}</span>`;
    var href = `href="/ui/custom_module?module=${tableinfo.t_obj.options.entity_name}&mode=details&entity_id=${data.id}${externalurl}"`; //No I18N
    let hrefspa = `data-spa="true" data-spa-module="${tableinfo.t_obj.options.entity_name}" data-spa-page="${tableinfo.t_obj.options.entity_name}-list"`;//No I18N
    var ret_str = `<a ${hrefspa} ${href} class="${aClass} text-overflow disp-ib fw">${hrefinnercontent}</a>`;
    if(mapper.model && mapper.model.indexOf("details") != -1) {
      ret_str = `<span role="button" data-mcload="details" data-id=${data.id} class="${aClass}text-overflow disp-ib fw">${hrefinnercontent}</span>`;//No I18N
    }
    if (mapper.list.view === 'classic' || $CMList.current_view === 'classic') {
      ret_str = `<span class="truncate-ellipsis sb"><span class="truncate-wrapper cur-ptr">${ret_str}</span></span>`;
    }
    
    return ret_str;
  },
  transformTitle(table_data, data, tableinfo) {
    var module_details = $CMCommon.module_details;
    var mapper = MC_Mapper['module_' + module_details.api_plural_name];
    var data = table_data.row_data;

    var value = (module_details.primary_field === "title" || data.title) ? data.title : '-'; //No I18N
    var aClass = module_details.readonly_mode ? 'p5' : 'vmiddle'; //No I18N
    var spanClass = $CMList.current_view === 'classic' ? 'text-color4' : ''; //No I18N
    let externalurl = externalframe ? "&externalframe=true" : ""; //No I18N
    let hrefinnercontent = `<span rel="uitip" mode_html="true" mode_ellipsis="true" title="${e_html(e_attr(value))}" class="${spanClass}">${e_html(value)}</span>`;
    var href = `href="/ui/custom_module?module=${tableinfo.t_obj.options.entity_name}&mode=details&entity_id=${data.id}${externalurl}"`; //No I18N
    let hrefspa = `data-spa="true" data-spa-module="${tableinfo.t_obj.options.entity_name}" data-spa-page="${tableinfo.t_obj.options.entity_name}list"` //NO I18N
    var ret_str = `<a ${hrefspa} ${href} class="${aClass} text-overflow disp-ib fw">${hrefinnercontent}</a>`;
    if(mapper.model && mapper.model.indexOf("details") != -1) {
      ret_str = `<span role="button" data-mcload="details" data-id=${data.id} class="${aClass} a-tag text-overflow disp-ib fw">${hrefinnercontent}</span>`;
    }
    if(mapper.mode == "details" && jQuery('[data-id=pinnable-contentfixed]').length !== 0) {
      ret_str = `<span role="button" data-mcleftpanleclick="true" data-id=${data.id} class="${aClass} a-tag text-overflow disp-ib fw">${hrefinnercontent}</span>`;
    }

    if (mapper.list.view === 'classic' || $CMList.current_view === 'classic') {
      ret_str = `<span class="truncate-ellipsis sb"><span class="truncate-wrapper cur-ptr">${ret_str}</span></span>`;
    }

    return ret_str;
  },
  // contructs the Created By/Time field with link to the details page
  transformCreatedBy(table_data) {
    var createdBy = table_data.row_data.created_by.name;
    var tooltipTitle = e_attr(createdBy);
    var createdByHtml = e_html(createdBy);

    return '<span rel="uitip" mode_html="true" mode_ellipsis="true" title="' + e_html(tooltipTitle) + '">' + createdByHtml + '</span>';
  },
  transformCreatedTime(table_data) {
    if ($CMList.current_view == 'classic') {
      return '<span rel="uitip" mode_ellipsis="true" title="'+table_data.row_data.created_time.display_value+'">'+table_data.row_data.created_time.display_value+'</span>';
    } else {
      return '<span rel="uitip" mode_ellipsis="true" title="'+table_data.row_data.created_time.display_value+'">'+table_data.row_data.created_time.display_value+'</span>';
    }
  },
  //Get height of the no data banner
  getHeight() {
    var height,
    listview_height = 100,
    chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
    jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
    return height;
  },
  //Function to construct the selected records listed in the bulk selection mode.
  constructSelectedListCB: function(data) {
    var module_details = $CMCommon.module_details;
    var str = data[module_details.primary_field] ? data[module_details.primary_field] : data.cm_fields[module_details.primary_field];
    return '<span rel="uitip" mode_html="true" mode_ellipsis="true" title="'+e_attr(str)+'">#'+data.id+' '+e_html(str)+'</span>';
  }
};

