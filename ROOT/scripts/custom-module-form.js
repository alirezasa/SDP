// $Id$
var $CMForm = {
  //Holds the entity id
  entity_id: null,
  //Holds the entity data
  entity_data: null,
  //Holds the form component object for reference
  cm_fc: null,
  /*
   * Modifies the layout object to render the form in details, add and edit modes.
   * For Details page, primary field and description not needed in layout. so they are removed.
   * For Add and Edit mode the fields are retained.
   * If the custom module supports attachments, Attachment component options are added in a section.
   */
  getFormLayoutconstruct: function(mode, options, type) {
    var moduleObj = options.module_details || options.additional_details || options.form_data;
    var layout = jQuery.extend(true, {}, options.layouts ? options.layouts[0] : options.form_data.layouts[0]);
    var layouts=[];
    //removing the default section for details page.
    if (mode == 'view' && !type) {
      var pi = moduleObj && moduleObj.primary_index ? moduleObj.primary_index : $CMCommon.module_details.primary_index;
      moduleObj = moduleObj ? moduleObj : $CMCommon.module_details;
      layout.sections[pi[0]] ? layout.sections[pi[0]].fields.splice(pi[1], 1) : layout.sections;
      if (moduleObj.desc_index) {
        var descIndex = moduleObj.desc_index[1];
        if (moduleObj.desc_index[0] == pi[0] && moduleObj.desc_index[1] > pi[1]) {
          descIndex--;
        }
        layout.sections[moduleObj.desc_index[0]].fields.splice(descIndex, 1);
      }
    }
      for(var i=0; i<layout.sections.length; i++){
      if(layout.sections[i].referrer && layout.sections[i].referrer=='attachments'){
        var entity_data = options.data ? options.data.entity_data : options.form_data ? options.form_data : options;
           layout.sections[i].title = translate("sdp.common.attachments"); //No I18N
           layout.sections[i].name = translate("sdp.common.attachments"); //No I18N
            layout.sections[i].type='attachments'; //No I18N
            layout.sections[i].id='attachments'; //No I18N
            layout.sections[i].container_id= 'cmattachment'; //No I18N
            layout.sections[i].wrapper= false;
            layout.sections[i].options= {
                title: true,
                layouts: true,
                api: false,
                upload_api: true,
                upload: (entity_data === null || !entity_data.is_trashed) && !moduleObj.is_active && (!!options.permissions && options.permissions.edit),
                is_odapi: true,
                download: true,
                enable_delete: !moduleObj.is_active && (entity_data === null || !entity_data.is_trashed),
                entity: moduleObj.api_plural_name,
                entity_id: this.entity_id!=null?this.entity_id: options.entity_id,
                entity_upload: this.entity_id ? true : (options.entity_id? true: false),
            };
            if(moduleObj && moduleObj.metadata && moduleObj.metadata.fields.attachments && moduleObj.metadata.fields.attachments.href) {
              var href = moduleObj.metadata.fields.attachments.href.replace("/attachments",""); //No I18N
              layout.sections[i].options.entity = href.slice(1);
            }
            if(options.is_trash) {
              layout.sections[i].options.upload = false;
              layout.sections[i].options.enable_delete = false;
            }
            layout.sections[i].fields= [];
            if ('view' === mode) {
              layout.sections[i].options.ondelete = [];
              layout.sections[i].options.is_odapi_v2 = true;
              if(entity_data.status && (entity_data.status.internal_name == "suspended" || entity_data.status.internal_name == "retired")) {
                layout.sections[i].options.enable_delete = false;
              }
              let mstatus = $CMCommon.module_details && $CMCommon.module_details.status;
              if(type == "subentity" && (mstatus && (mstatus.internal_name == "suspended" || mstatus.internal_name == "retired"))) {
                layout.sections[i].options.enable_delete = false;
              }
              layout.sections[i].name = "-1";
            }else {
              delete layout.sections[i].options.ondelete
              layout.sections[i].options.is_odapi_v2 = false;
              layout.sections[i].options.title = false;
            }
      }
    }
    layouts.push(layout);

    return layouts;
  },
  getFormwithoutsubform: function(mode, layout) {  
    for(let i=0; i<layout.length; i++) {
      var layoutObj=layout[i];
        var sectionArray=layoutObj.sections;
        let j=0;
        while(j<sectionArray.length){
          var sectionObj=sectionArray[j];
          if(sectionObj.is_subform){
            sectionArray.splice(j,1);
            j=(j==0)?0:(j-1);
          }
          else{
            j=j+1;
          }
        }
    }
    return layout;
  },
  getFormsubformalone: function(mode, layout) {
      for(let i=0; i<layout.length; i++){
        var layoutObj=layout[i];
          var sectionArray=layoutObj.sections;
          let j=0;
          while(j<sectionArray.length){
            var sectionObj=sectionArray[j];
            if(!sectionObj.is_subform){
              sectionArray.splice(j,1);
              j=(j==0)?0:(j-1);
            }
            else{
              j=j+1;
            }
          }
      }
      return layout;
  },
};
