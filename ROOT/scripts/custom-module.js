// $Id$
var $CMCommon = {
  /*
   * Module details like name, help_text, layouts etc.,
   * This object should be populated on the page load.
   * This processed and vital info are saved while initiating.
   */
  module_details: null,
  /*
   * Layout information to render form - section, fields position
   * This object should be populated on the page load.
   */
  layout: null,
  /*
   * If details and edit pages are loaded, entity_id should be populated
   */
  entity_id: null,
  /*
   * Denotes the current page
   * value should be one of 'details', 'list', 'add', 'edit'
   * The value will be set when rendering a page. (renderPage funtion)
   */
  current_page: null,
  /*
   * Denotes the from which page, the current page is navigated
   * value should be one of 'details', 'list', 'add', 'edit'
   * Useful when supporting back button in details and edit page
   * The value will be set when redirected from a page
   */
  previous_page: null,
  /*
   * saves the permission object for a particular page.
   */
  permissions: {},
  /*
   * Contains of the ids loaded in list view
   * The list of ids will be used to construct navigation(Next & Previous IDs) in details page.
   */
  list_view_ids: [],
  /*
   * Contains of the Sub Entities rendered for this CM.
   */
  subEntities: [],
  /*
   * main function to be invoked when initiating the page
   * This will populate the module_details object
   * Based on the object, all pages are rendered.
   * The module object is processed and saved as mentioned above.
   * Following info are saved.
   * 1. is_desc_field_present - description panel is loaded based in this boolean
   * 2. help_text - Help card content is showed in the add/edit forms if present
   * 3. primary_field - field to hold link in list page and title in details page
   * Other than the above info, context is set as 'cm_fields' for all udf (client component req)
   */
  metadata: {},
  init: function(moduleId, module) {
    var moduleObj = null;
    var _self = this;
    if(this.module_details !== null && this.module_details.api_plural_name == module) {
      return;
    }
    sdpAjax({
      url: '/api/v3/custom_modules/' + moduleId, //No I18N
      success: function(resp) {
        moduleObj = resp.custom_module;
      },
      async: false
    });
    sdpAjax({
      url: "/api/v3/"+module +'/metadata', //No I18N
      success: function(resp) {
        _self.metadata = resp.metadata.metainfo;
      },
      async: false
    });

    if (moduleObj.layouts[0].help_text) {
      moduleObj.help_text = moduleObj.layouts[0].help_text;
    }
    moduleObj.is_desc_field_present = false;
    if (moduleObj.icon) {
      moduleObj.icon_50 = moduleObj.icon['content-url'] + '?res=50x50'; //No I18N
      moduleObj.icon_120 = moduleObj.icon['content-url'] + '?res=120x120'; //No I18N
      moduleObj.icon = moduleObj.icon['content-url']; //No I18N
    }

    /*
     * Module Object should always have layout array with one layout
     * otherwise it means, the module is not properly initialized.
     */
    var fields = [];
    moduleObj.layouts[0].sections.forEach( function(section, sectionIndex) {
      section.fields.forEach( function(field, fieldIndex) {
        if (field.primary_field) {
        if(section.referrer==null){
          moduleObj.primary_field = field.name;
          moduleObj.primary_index = [sectionIndex, fieldIndex];
          if (field.name.startsWith('sline_')) {
            moduleObj.primary_field_full_name = 'cm_fields.' + field.name; //No I18N
            moduleObj.primary_field_display_name = field.display_name;
          } else {
            moduleObj.primary_field_full_name = field.name;
          }
         }
        }
        else if (field.name === 'description') {
          moduleObj.is_desc_field_present = true;
          moduleObj.desc_index = [sectionIndex, fieldIndex];
        }
        else {
          fields.push(field.name);
        }
        if (field.name !== 'title' && field.name !== 'description') {
          field.context = 'cm_fields'; //No I18N
          //Do not apply Sorting for allowed values in form
          field.sort = false;
        }
      });
    });
    moduleObj.layouts[0].details_view_fields = fields;

    this.layout = moduleObj.layouts[0];
    var layoutent = "module_" + module + "_layout"; //No I18N
    moduleObj["layouts"] = [this.layout];
    MC_Mapper[layoutent] = {
      "url": "/api/v3/custom_modules/"+moduleId, //No I18N
      "layout": moduleObj //No I18N
    };

    //delete moduleObj.layouts;

    //readonly mode
    moduleObj.readonly_mode = moduleObj.status.internal_name == 'suspended' || moduleObj.status.internal_name == 'retired'; //No I18N

    this.module_details = moduleObj;
    this.subEntities = moduleObj.sub_entities.filter(se => !se.is_subform);
  },
  /*
   * Links API is called and Permission object is saved with URL as key
    {
      '/api/v3/cm_books/_links': {
        add: true,
        edit: true,
        get: true,
        move_to_trash: true,
        delete: true
      },
      '/api/v3/cm_books/1/_links': {
        edit: true,
        get: true,
        move_to_trash: true,
        delete: true
      }
    }
   */
  getPermissions: function(path, entity_id) {
    var linksPath = '/api/v3/' + path; //No I18N
    if (entity_id) {
      linksPath += '/' + entity_id; //No I18N
    }
    linksPath += '/_links'; //No I18N
    if (!this.permissions.hasOwnProperty(linksPath)) {
      var permissionsObj = {};
      sdpAjax({
        acceptODCompatible: true,
        url: linksPath,
        async: false,
        success: function(data) {
          var links = data._links.links ? data._links.links : data._links;
          for (var i = 0; i < links.length; i++) {
            permissionsObj[links[i].name] = window.printmode || is_from == "associations" ? false : true;
          }
        }
      });
      if(entity_id) {
        this.permissions[linksPath] = permissionsObj;
      } else {
        this.permissions = permissionsObj;
      }
    }
    return entity_id ? this.permissions[linksPath] : this.permissions;
  },
  //Reset the permissions when data is trashed, restored or deleted
  resetPermissions: function() {
    this.permissions = {};
  },
  /** MC component initalized **/
  loadMC: function(options) {
    var permissions = $CMCommon.getPermissions(options.module);
    var button_permission = $CMList.getButtonPermissions(permissions);

    var primaryfield = $CMCommon.module_details.primary_field;
    
    let custombutton = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[options.module+"_filter"] && sdp_user.CLIENT_CONF[options.module+"_filter"].is_trash || externalframe == "true") ? false : true;//No I18N
    if(!custombutton) {
      permissions.add = false;
      permissions.edit = false;
    }

    let dfield = ["description","deleted_time","module","is_trashed", "attachments"]; //No I18N
    let mfields = $CMCommon.metadata.fields
    if(options.additional_details && options.additional_details.sub_entities) {
      options.additional_details.sub_entities.forEach(field=>{
        dfield.push(field.name);
      });
    }
    permissions.print = true;
    var commonjson = {
      "container": document.getElementById("custom-module-content"), //No I18N
      "mode": options.mode,//List/Form(add/edit),Details page //No I18N
      "name": options.module, //No I18N
      "permissions": permissions,//Check for add/edit/delete action -- Object  //No I18N
      "base_path": printmode || is_from == "associations" ? false : "/ui/custom_module?",//URL for history push state //No I18N
      "is_active": false,//Module active or not //No I18N
      "is_trash": options.is_trash ? options.is_trash : false,//Trash view info message with common action //No I18N
      "display_name": options.additional_details.display_name,//Module name //No I18N
      "entity_name": options.additional_details.name, //No I18N
      "use_listviewdata_everywhere": true, //No I18N
      "kb_shortcuts": true, //No I18N
      "skip_entityid_tolayout_call": true, //No I18N
      "list": { //No I18N
        "meta": { //No I18N
          "header": {//No I18N
              "actions": { //No I18N
                "bulk_selection": { //No I18N
                  "enable": true //No I18N
                },
                "t_advfilter": {//No I18N
                  "enable": true,//No I18N
                  "custom_class": "fl mr10"//No I18N
                },
                "restore": {//No I18N
                  "enable": permissions.restore_from_trash, //No I18N
                  "custom_class": "fl mr10" //No I18N
                },
                "add": { //No I18N
                  "enable": permissions.add, //No I18N
                  "custom_attr": "data-uncheckedlistaction", //No I18N
                },
                "custom_action": { //No I18N
                  "enable": custombutton, //No I18N
                  "custom_class": "fl mr10", //No I18N
                  "partial": "$CMList.headerexporthtml", //No I18N
                },
                "t_searchicon": { //No I18N
                  "enable": true, //No I18N
                  "custom_class": "fl" //No I18N
                },
                "t_column_choos": { //No I18N
                  "enable": true, //No I18N
                  "custom_class": "fl" //No I18N
                },
                "deleteicon": {//No I18N
                  "enable": permissions.delete || permissions.move_to_trash,//(compare is_trash '&&' permissions.delete) '||' permissions.move_to_trash //No I18N
                  "custom_class": "fl ml10"//No I18N
                },
                "pagination_comp": {//No I18N
                  "enable": true,//No I18N
                  "custom_class": "btn-group"//No I18N
                },
                "t_list_settings": {//No I18N
                  "enable": false,//No I18N
                  "custom_class": "fr mr10", //No I18N
                }
              },
          },
          "view": "table",//Listview view type "table/classic" //No I18N
          "getmetainfo": false, //No I18N
          "additional_options": {//No I18N
              "personalize_key": options.module+ (options.mode == "list" ? "_table_listview" : "_classic_listview"), //No I18N
              "discarded_fields": dfield.toString(), //No I18N
              "nodatabanner_callback": "$CMList.noDataBannerHTML",//Function checked code changes updated  //No I18N
              "other-options": "$CMList.getTableOptions",//Function checked code changes updated //No I18N
              "handle-window-resize": true, //No I18N
              "entity_display_name": options.additional_details.display_plural_name, //No I18N
              "row_inputdata": "$CMList.rowDataConstruct", //No I18N
          },
          //Column list
          "cells": { //No I18N
            "static_cells": { //No I18N
              "checkbox": button_permission.checkbox || false, //No I18N
              "row_actions": { //No I18N
                "is_show": button_permission.actioncell || false, //No I18N
                "default": "true", //No I18N
                "type": "icon", //No I18N
                "data-celltransformer": "$MC.constructActionCell", //No I18N
                "class": "pos-rel", //No I18N
                "td_class": "pos-rel" //No I18N
              },
            },  
            "fields_required": { //No I18N
              "title": { //No I18N
                "default": "true", //No I18N
                "hide_label": "true", //No I18N
                "data-celltransformer": "$CMList.transformTitle", //No I18N
              },
              "created_by": { //No I18N
                "value_path": "created_by.name", //No I18N
                "data-celltransformer": "$CMList.transformCreatedBy" //No I18N
              },
              "created_time": { //No I18N
                "data-celltransformer": "$CMList.transformCreatedTime" //No I18N
              },
            },
          },
        },
        "options": { //No I18N
          "header": {//No I18N
              "logo": {//No I18N
                "enable": true,//No I18N
                "title": options.additional_details.display_name,//No I18N
                "icon": options.additional_details.icon,//No I18N
              },
              "back_button": {//No I18N
                  "enable": false,//No I18N
                  "link": "",//Back to URL //No I18N
                  "title": ""//No I18N
              },
              "filter": {//No I18N
                  "enable": true,//No I18N
                  "active": "all",//No I18N
                  "label": sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[options.module+"_filter"] && sdp_user.CLIENT_CONF[options.module+"_filter"].is_trash ? translate("sdp.requests.trashrequest") : translate("all.entity.templates",[options.additional_details.display_plural_name]),//Active text //No I18N
                  "trash": true, //No I18N
                  "options": { //No I18N
                      "all": { //No I18N
                          "label": translate("all.entity.templates",[options.additional_details.display_plural_name]),//Display value //No I18N
                          "type": "all_filter", //No I18N
                          "action_callback": function(opt) { //No I18N
                            permissions = $CMCommon.getPermissions(options.module);
                            opt.permissions = permissions;
                            opt.permissions.import = permissions.import || false;
                            let custom_action = opt.list.options.header.actions;
                            let metaaction = opt.list.meta.header.actions;
                            custom_action.filter(val => val["add"])[0].add.enable = permissions.add;//No I18N
                            custom_action.filter(val => val["custom_action"])[0].custom_action.enable = true;//No I18N
                            metaaction.filter(val => val["t_advfilter"])[0].t_advfilter.enable = true;//No I18N
                            ClientUtil.addUserPersonalization("custom_module_filter",{"is_trash": false},{internalKey: opt.name+"_filter"});//No I18N
                            sdp_user.CLIENT_CONF[opt.name+"_filter"] = {"is_trash": false};//No I18N
                            return opt; 
                          }
                      },
                      "trash": { //No I18N
                          "label": translate("sdp.requests.trashrequest"),//Display value //No I18N
                          "action_callback": function(opt) { //No I18N
                            opt.permissions.import = false;
                            let custom_action = opt.list.options.header.actions;
                            let metaaction = opt.list.meta.header.actions;
                            custom_action.filter(val => val["custom_action"])[0].custom_action.enable = false;//No I18N
                            metaaction.filter(val => val["t_advfilter"])[0].t_advfilter.enable = false;//No I18N
                            ClientUtil.addUserPersonalization("custom_module_filter",{"is_trash": true},{internalKey: opt.name+"_filter"});//No I18N
                            sdp_user.CLIENT_CONF[opt.name+"_filter"] = {"is_trash": true};//No I18N
                            return opt; 
                          }
                      },
                  }
              },
              "view": {//No I18N
                "enable": false,//No I18N
                "activemode": "table",//No I18N
                "options": {//No I18N
                  "table": {//No I18N
                    "title": translate("common.tableview"),//No I18N
                    "iconclass": "rspr icon-sm unified-gv",//No I18N
                  },
                  "classic": {//No I18N
                    "title": translate("common.classicview"),//No I18N
                    "iconclass": "rspr icon-sm menu-list",//No I18N
                  }
                }
              },
          },

          /** HBS file pre/post render functionality **/
          "hbs": {//No I18N
            "callback": {//No I18N
              "pre": function(options, $this) { //No I18N
                  options.additional_options.personalize_key = options.name + ($this.from == "details" ? "_classic_listview" : "_table_listview");//No I18N
                  options["add"] = !options.is_trash && permissions.add ? true : false;
                  if(primaryfield != "title") {
                    options.cells.fields_required["cm_fields."+primaryfield] = {
                      "data-celltransformer": "$CMList.transformPrimaryfield", //No I18N
                      "default": true, //No I18N
                      "hide_label": true //No I18N
                    };

                    delete options.cells.fields_required.title.default;
                  }
                  return options;
              },
              "post": function(parentDiv, opt) {//No I18N
                $CMList.tableAction(jQuery(parentDiv));
                return opt;
              },
            }
          },
          "component": {//No I18N
            "callback": {//No I18N
              "post": function(tableinfo) {//No I18N
                $CMList.callbackAfterBodyRender();
              },
            },
          },
        },
      },


      "form": { //No I18N
        "meta": {//No I18N
          "layout_entity": "custom_modules/"+options.moduleId, //No I18N
          "layout_name": "custom_module", //No I18N
          "entity_name": options.additional_details.name, //No I18N
          "additional_options": { //No I18N
            "includeSubFields": ["cm_fields"], //No I18N
            "exit_alert": false, //No I18N
          },
          ffr:{
            enable:true,
            entity:"CM"//No i18n
          },
        },
        "options": {//No I18N
          "hbs": {//No I18N
            "callback": {//No I18N
              "pre": function(opt, mode) { //No I18N
                opt = $MC.formconstruct(opt, mode);
                if(opt.mode == "details") {
                  opt.form_data["skipFields"] = [primaryfield != "title" ? "cm_fields."+primaryfield : primaryfield,"description"]; //No I18N
                }                
                return opt;
              },
            },
          },
          "component": {//No I18N
            "callback": {//No I18N
              "pre": function(opt, $this) {//No I18N
                var fields = opt.metadata.fields;
                $MC.fieldplacholder(fields);
                opt.metadata.fields = fields;
                opt.cloneSubForms = true; //To support clone in subforms
                return opt;
              }, 
              "post": function(opt, $this) {}, //No I18N
            },
          },
        },
      },


      "details": { //No I18N
        "meta": {//No I18N
          "layout_entity": "custom_modules/"+options.moduleId, //No I18N
          "layout_name": "custom_module", //No I18N
          "entity_name": options.additional_details.name, //No I18N
          "additional_options": { //No I18N
            "history": { //No I18N
              "module": "custom", //No I18N
              "entity": "custom_module", //No I18N
            },
            "tabs": is_from == "associations" ? ["details"] : ["details","history"], //No I18N
            "render_panel_component": options.additional_details.is_desc_field_present, //No I18N
            "render_attach_component": false, //No I18N
          },
          details_component:{
            afterInitialRender:function(){
              var self = this;
              SdpWidgets.renderHelpers.renderModuleWidgets({
                  module:self.entity_name,
                  moduleAlias:self.module,
                  entity_id: self.entity_id,
                  afterRender:(type)=>{
                    if(type=="rightpanel"){
                    $CS.hideElement("details-right-tab");//No I18N
                    jQuery('[data-type="custom_widget"][data-category="rightpanel"][data-id!="details"]').eq(0).click()
                    }
                },
              });
            },
            panel_details: {
              content_panel: {
                right_panel : {
                  show : false,
                  toggle :false,
                }
              }}
        },
        beforeConstructtabs: function(details_opt) {
            if(is_from == "associations") {
              details_opt.panel_details.content_panel.actions_panel.show = false;
              details_opt.panel_details.content_panel.tabs_panel.tabs = ["details"];
              details_opt.panel_details.left_panel.show = false;
            }
            if(printmode) {
              delete details_opt.panel_details.content_panel.tabs_panel.settings.details.dataCallback;
              details_opt["print_details"] = {
                "print_metainfo": { //No I18N
                  "header_panel": { //No I18N
                    "default": true, //No I18N
                    "path": "content_panel.header_panel", //No I18N
                  },
                  "details": { //No I18N
                    "default": true, //No I18N
                    "entity_name": this.entity_name, //No I18N
                    "path": "content_panel.tabs_panel.settings.details" //No I18N
                  }
                },
                "print_sections": ["header_panel","details"]//No I18N
              };
              let tabspaneltabs = details_opt.panel_details.content_panel.tabs_panel.tabs;

              for(var i=0;i<tabspaneltabs.length; i++) {
                if(tabspaneltabs[i] != "details" && tabspaneltabs[i] != "comments") {
                  details_opt.print_details.print_sections.push(tabspaneltabs[i]);
                  details_opt.print_details.print_metainfo[tabspaneltabs[i]] = {path: 'content_panel.tabs_panel.settings.'+tabspaneltabs[i]};//No I18N
                }
              }
              details_opt.printPreview = true;
            }
            return details_opt;
          },
        },
        "options": {//No I18N
          "header": { //No I18N
            "print": { //No I18N
              "pre": function(url, edata, emodule) { //No I18N
                url = `/ui/print/${edata}/${emodule.id}`;
                if(window.externalframe) {
                  url = url + "?externalframe=true";//No I18N
                }
                return url;
              }
            }
          },
          "hbs": {//No I18N
            "callback": {//No I18N
              "pre": function(opt) { //No I18N
                if(primaryfield != "title") {
                  opt.data.entity_data["custom_title"] = opt.data.entity_data[primaryfield] ? opt.data.entity_data[primaryfield] : opt.data.entity_data.cm_fields[primaryfield]
                }
                return opt;
              }
            },
          },
          "component": {//No I18N
            "callback": {//No I18N
              "pre": function(opt, $this) {
                if(SdpWidgets.renderHelpers.isWidgetPresent(`${options.additional_details.name}.detail.rightpanel`)){
                  opt.panel_details.content_panel.right_panel.show= true;
                  opt.panel_details.content_panel.right_panel.toggle = true;
                  };
                return opt;}, //No I18N
              //"post": function(opt, $this) {}, //No I18N
            },
          },
        },
      },
    };
    
    let tableview = sdp_user && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[options.module+"_view"];//No I18N
    if(tableview && tableview.mode == "classic") {//No I18N
      let metaaction = commonjson.list.meta.header.actions;
      metaaction.filter(val => val["t_searchicon"])[0].t_searchicon.enable = false;//No I18N
      commonjson.list.options.header.view.activemode = "classic";//No I18N
      commonjson.list.meta.cells.static_cells.checkbox = false;
      commonjson.list.meta.cells.static_cells.row_actions["callback-Columnoption"] = "fx:$CMList.transformActionfield";//No I18N
      commonjson.list.meta.cells.fields_required.title["callback-Columnoption"] = "fx:$CMList.transformRowfield";//No I18N
      if(primaryfield != "title") {//No I18N
        commonjson.list.meta.cells.fields_required["cm_fields."+primaryfield] = {//No I18N
          "data-celltransformer": "$CMList.transformPrimaryfield", //No I18N
          "default": true, //No I18N
          "hide_label": true, //No I18N
          "callback-Columnoption": "fx:$CMList.transformRowfield" //No I18N
        };
      }
    }

       if($subentity.showAssociationsTab(options.module, options.entity_id)){
          if(commonjson.details && commonjson.details.meta && commonjson.details.meta.details_component && commonjson.details.meta.details_component.panel_details && commonjson.details.meta.details_component.panel_details.content_panel && commonjson.details.meta.details_component.panel_details.content_panel.tabs_panel){
            var tabs_panel = commonjson.details.meta.details_component.panel_details.content_panel.tabs_panel;
            var tabSettings ={
            "associations" :{ // No I18N
              show: is_from == "associations" ? false : true, // No I18N
              display_name: translate('common.associations'), // No I18N
              renderfunction: $subentity.loadSubEntity,
              HTML: '<div id="Associations_DIV" class="mt10"></div>' //No I18N
            }};
            tabs_panel.tabs.splice(tabs_panel.tabs.length - 1);
            tabs_panel.tabs.push(translate("associations"));
            tabs_panel.tabs.push(translate("history"));
            tabs_panel.settings = jQuery.extend({},tabs_panel.settings,tabSettings);

          }else{
            commonjson.details.meta["details_component"] = {
              afterInitialRender:function(){
                var self = this;
                SdpWidgets.renderHelpers.renderModuleWidgets({
                    module:self.entity_name,
                    moduleAlias:self.module,
                    entity_id: self.entity_id,
                    afterRender:(type)=>{
                      if(type=="rightpanel"){
                      $CS.hideElement("details-right-tab");//No I18N
                      jQuery('[data-type="custom_widget"][data-category="rightpanel"][data-id!="details"]').eq(0).click()
                      }
                  }
                });
              },
              panel_details: {
                content_panel: {
                  tabs_panel: {
                    tabs: is_from == "associations" ? ["details"] : ["details","associations","history"], // No I18N
                    settings: {
                      associations: {
                        show: true,
                        display_name: translate('common.associations'), // No I18N
                        renderfunction: $subentity.loadSubEntity,
                        HTML: '<div id="Associations_DIV" class="mt10"></div>' //No I18N
                      }
                    }
                  },
                },
              }
            };
          }
        }

    options = jQuery.extend({},options,commonjson);
    cm = new MC(options);
  },
  /*
   * Fetches the metainfo for the entity id
   */
  getMetaInfo: function(entity_id) {
    if (!this.metainfo) {
      var meta_info = null;
      var plural_name = $CMCommon.module_details.api_plural_name;
      sdpAjax({
        url: '/api/v3/' + plural_name + ((entity_id && entity_id != 'null') ? '/' + entity_id : '') + '/_metainfo', //No I18N
        success: function(resp) {
          meta_info = resp.metainfo;
          var fields = meta_info.fields;
          for (var fname in fields) {
            if (fields.hasOwnProperty(fname)) {
              if (fields[fname].type === 'lookup') {
                fields[fname].placeholder = translate('form.select.placeholder', [e_html(fields[fname].display_name)]);
              } else if (fields[fname].type === 'udf') {
                var udf_fields = fields[fname].fields;
                for (var udf_name in udf_fields) {
                  if (udf_fields[udf_name].type === 'lookup') {
                    udf_fields[udf_name].placeholder = translate('form.select.placeholder', [e_html(udf_fields[udf_name].display_name)]);
                  }
                }
              }
              if(fields[fname].lookup_entity && fields[fname].fields){
              	var subFormFields = fields[fname].fields;
              	for (var subFormField in subFormFields) {
              		if (subFormFields[subFormField].type === 'lookup') {
              			subFormFields[subFormField].placeholder = translate('form.select.placeholder', [e_html(subFormFields[subFormField].display_name)]);
              		}
              		else if (subFormFields[subFormField].type === 'udf') {
              			var udf_fields = subFormFields[subFormField].fields;
              			for (var udf_name in udf_fields) {
              				if (udf_fields[udf_name].type === 'lookup') {
              					udf_fields[udf_name].placeholder = translate('form.select.placeholder', [e_html(udf_fields[udf_name].display_name)]);
              				}
              			}
              		}
                 }
              }
            }
          }
          meta_info.fields = fields;
        },
        async: false
      });
      this.metainfo = meta_info;
    }
    return this.metainfo;
  },
  
  /**
   * Adding the custom HTML field to the description array.
   * @param {string} entity
   * @param {array} descArray
   */
  appendFieldInHTML : (descArray, ent) => {
    let entmeta = MC_Mapper['module_'+ent+'_meta'] && MC_Mapper['module_'+ent+'_meta'].meta && MC_Mapper['module_'+ent+'_meta'].meta.fields; //NO I18N
    let fields = entmeta || $CMCommon.metadata && $CMCommon.metadata.fields;
    if(fields && fields.cm_fields && fields.cm_fields.fields) {
      Object.entries(fields.cm_fields.fields).forEach(([key, value]) => {
      /**
       * Allowed only HTML additional fields.
       */
        key.startsWith("html_") ? descArray.push(key) : null; //NO I18N
      });
    }
    return descArray;
  },
  appendFieldInDesc : (entity, entity_key) => {
    let getMetaInfo;
    let subform;
    sdpAjax({
      url: "/api/v3/"+(entity_key != "null" ? entity_key : entity)+"/_metadata", //NO I18N
      method: "GET", //No I18N
      async: false,
      ignorefailuremessage: true,
      success: function(response){
        getMetaInfo = response.metadata.metainfo.fields;
        subform = response.metadata.module_details.sub_entities;
      }
    });

    let staticsubformarr = ["task","comment","attachment"];//NO I18N
    let staticsubform = {
      "task": {//NO I18N
        "add": true,//NO I18N
        "delete": true//NO I18N
      },
      "comment":{//NO I18N
        "add": true,//NO I18N
        "edit": true,//NO I18N
        "delete": true//NO I18N
      },
      "attachment":{//NO I18N
        "add": true,//NO I18N
        "delete": true//NO I18N
      }
    };
    let subformarray = [];
    for(var i=0; i<subform.length; i++) {
      if(staticsubformarr.indexOf(subform[i].singular_name) == '-1') {//NO I18N
          staticsubformarr.push(subform[i].singular_name);
          let subformopera = {
            "add": true,//NO I18N
            "delete": true//NO I18N
          };
          if(subform[i].is_subform) {
            subformopera["edit"] = true;//NO I18N
          }
          staticsubform[subform[i].singular_name] = subformopera;
      }
        Object.entries(staticsubform[subform[i].singular_name]).forEach(([key, value]) => {
          let name = (subform[i].singular_name == "task") ? "cm_"+subform[i].singular_name : subform[i].singular_name;//NO I18N
          let i18nkey = key == "add" ? "custom.history.added" : key == "edit" ? "custom.history.updated" : "custom.history.deleted";//NO I18N
          subformarray.push({"id":name+"_"+key,"value": "operation", text: translate(i18nkey,[subform[i].display_name])})//NO I18N
        });
    }
    let skipduplicateentity = {};
    Object.entries(getMetaInfo).forEach(([key1, value]) => {
      if(value.type == "Association") {
        if(skipduplicateentity[value.lookup_entity]) {
          let asso_src = value.is_source ? value.display_name : skipduplicateentity[value.lookup_entity].display_name;
          let asso_desc = !value.is_source ? value.display_name : skipduplicateentity[value.lookup_entity].display_name;
          skipduplicateentity[value.lookup_entity].display_name = translate("association.history.source.destination",[asso_src, asso_desc]);
        } else if(!skipduplicateentity[value.lookup_entity]) {
          skipduplicateentity[value.lookup_entity] = value;
        }
      }
    });

    if(!jQuery.isEmptyObject(skipduplicateentity)) {
        let operations = {
          "add": true,//NO I18N
          "edit": true,//NO I18N
          "delete": true//NO I18N
        };
      Object.entries(skipduplicateentity).forEach(([key1, value]) => {
        Object.entries(operations).forEach(([key, val]) => {
          let i18nkey = key == "add" ? "association.history.added" : key == "edit" ? "association.history.updated" : "association.history.deleted";//NO I18N
          subformarray.push({"id":value.lookup_entity+"_"+key,"value": "operation", text: translate(i18nkey,[value.display_name])})//NO I18N
        });
      });
    }
    return subformarray;
  },
  userDetailspopup: function(userid) {
    //$previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId={{created_by.id}}&minContent=true&externalframe=true', getMessageForKey("sdp.inventory.wsRtPanel.userDetails"),'600px')
    $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId='+userid+'&minContent=true&externalframe=true', translate("sdp.inventory.wsRtPanel.userDetails"),'600px') //No I18N
  }
};


var $subentity = {
    showAssociationsTab: function(module, module_id){
      var showAssociations = false;
      sdpAjax({
        url: '/api/v3/' + module + ((module_id && module_id != "null") ? ('/' + module_id) : "") + "/association_summary", //No I18N
        success: function(resp) {
          showAssociations = (resp.association_summary && resp.association_summary.length > 0);
        },
        async: false
      });
      return showAssociations;
    },
    loadSubEntity: function(tabName, tabSetting, tabs_panel){
      let tpanel = tabs_panel || this;
      function associationsComp() {
        let trashmode = tpanel.options.data && tpanel.options.data.entity_data && tpanel.options.data.entity_data.is_trashed || tpanel.options.is_trash;
        $associations.init({"containerId" : "Associations_DIV", "module" : tpanel.options.module, "module_id" : tpanel.options.entity_id, "entity_name": (tpanel.options.entity_name  || MC_Mapper['module_'+ tpanel.options.module].entity_name), "display_name": tpanel.options.display_name, "is_trashed" : trashmode, "is_printmode": window.printmode || false}); //No I18N
      }
      if(tabName == "associations"){
        if(typeof $associations == "undefined") {
          ResourceLoader({
            js: ["/scripts/associationsComponent.js"],//No I18N
            success: function success(){
              associationsComp()
            }
          });
        } else {
          associationsComp()
        }
        return;
      }
    }
  };
