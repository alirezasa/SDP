/* $Id$ */
/*  This file has utility functions for change copy page.
    CopyChange.initialize is invoked from change_form.jsp
 */
    (function() {class CopyChange{
  constructor(options){
      let self = this;
      self.changeID = options.Change_ID;
      self.entityName = "change";   //No I18N
      self.entityNamePl = self.entityName +"s";    //No I18N
      self.options = options;
      self.base_url = self.entityNamePl +"/"+ self.changeID;   //NO I18N
      self.metainfo = $CRForm.getEntityAll(self.base_url+'/metainfo',null,'metainfo')[0];//NO I18N
      self.stageData=$CRForm.getEntityAll(self.base_url+'/stage',null,'stage');//No I18N
      self.stageNames=self.stageData.map(item => item.internal_name);
  }

  initialize(){
    let options = this.options;
    this.initializeForm(options)
  }

    /*Render the Copychangeform*/
  initializeForm(options){
    let self = this;
    let metadata = self.constructMetaInfo();
    let templates = self.constructTemplateInfo();

    self.entitydata = $CRForm.getEntityAll(self.entityNamePl,self.changeID,self.entityName)[0];


    let configJSON = {
       name: "rcForm", //NO I18N
       title: "CopyChange", //NO I18N
       entity: self.entityName, //NO I18N
       entitypath: "/" + self.entityNamePl,//NO I18N
       template: templates,
       metadata: metadata,
       mode: "new", //NO I18N
       container: "rc-container", //NO I18N
       formid: "rcForm", //NO I18N
       customform: true,
       disableSort: true,
       save: {
              entity: self.entityName, //NO I18N
              submit: true,
              onsubmit: function(){self.showNext(this)},
              cancel: function(){self.cancelForm()},
              exit_alert: false,
              submitbutton: {
                add: translate("sdp.common.next"), //NO I18N
              }

            },
            entityName: translate('sdp.common.change'), //NO I18N
            allowedValues: self.constructAllowedValues(),
          }
          if(!options.from){
  configJSON.defaultValues = configJSON.allowedValues
          }
          else{
            configJSON.defaultValues = options.copyproperties;
          }
  self.getStageName(configJSON.metadata);
  window.$copyForm  = new FC(configJSON);
  jQuery("#rcForm").on("editLoaded", function() {	//No I18N
    self.afterrenderpage();
  });
  }

  afterrenderpage(){
    jQuery("#headerstuffbody").removeClass("bodybg"); //NO I18N
    jQuery('#rcForm input[type="checkbox"]').addClass('top2'); //NO I18N
  }

  /* Redirect the copychange form to change edit form */
  showNext(form){
        let self = this;
    self.copyproperties = {};
    self.entitydata.scheduled_start_time = null;
    self.entitydata.scheduled_end_time = null;
    let udfFields=self.entitydata.udf_fields
    for (let key in udfFields) {
                    if (udfFields.hasOwnProperty(key) && key.startsWith('udf_date')) {
                        udfFields[key] = null;
                    }
                }
        for (let i = 0; i < self.stageNames.length; i++) {
        self.copyproperties[self.stageNames[i]] = form.fields[self.stageNames[i]].current_value;
    }
    let options = {
      changeID: self.changeID,
      from: "copychange", //NO I18N
      isCMCO: self.options.isCMCO
    }
    options.entitydata = self.entitydata;
    options.copyproperties = self.copyproperties;
    $CRForm.initialize(options);
 }
  cancelForm(){
    const parent = $extFrame.getActiveWindow();
    parent.$previewComponent.closePreview("copy_change"); //NO I18N
 }
constructAllowedValues(){
  let self = this;
  let allowedValuesObject = {
    "Submission": [ //NO I18N
      { id: "changefields", name: translate("sdp.change.changefields"), disabled:true}, //NO I18N
      {  id: "change_roles",  name: translate("sdp.admin.change.changeroles")}, //NO I18N
      {  id: "submission.attachments",  name: translate("sdp.common.attachments")}, //NO I18N
    ],
    "Planning": [ //NO I18N
      {  id: "impact_details",  name: translate("sdp.change.impactdetails")}, //NO I18N
      {  id: "roll_out_plan",  name: translate("sdp.change.rollout")}, //NO I18N
      {  id: "back_out_plan",  name: translate("sdp.change.backout")}, //NO I18N
      {  id: "checklist",  name: translate("sdp.change.checklist")}, //NO I18N
      {  id: "downtime",  name: translate("sdp.change.deployment.details")} //NO I18N
    ],
    "Approval": [], //NO I18N
    "Implementation": [], //NO I18N
    "UAT": [ //NO I18N
      {  id: "uat_description",  name: translate("sdp.common.description")}, //NO I18N
      {  id: "uat_testplan",  name: translate("sdp.change.uat_testplan")}, //NO I18N
    ],
    "Release": [ //NO I18N
      {  id: "release_description",  name: translate("sdp.common.description")}, //NO I18N
    ],
    "Review": [ //NO I18N

      {  id: "review_details.description",  name: translate("sdp.common.description")}, //NO I18N
      {  id: "review_details.attachments",  name: translate("sdp.common.attachments")}, //NO I18N
    ],
    "Close": [ //NO I18N
      {  id: "close_details.description",  name: translate("sdp.common.description")}, //NO I18N
      {  id: "close_details.attachments",  name: translate("sdp.common.attachments")}, //NO I18N
    ],
  }
  let commonfields = [
    {  id: "udf_fields",  name: translate("sdp.admin.leftpanel.customfields.home")}, //NO I18N
    {  id: "approval_level",  name: translate("sdp.approve.approvals")}, //NO I18N
    {  id: "tasks",  name: translate("task.title")}, //NO I18N
]
  for (let key in allowedValuesObject) {
    for (let i = 0; i < allowedValuesObject[key].length; i++) {
      let fieldId = allowedValuesObject[key][i].id;
      if (self.metainfo.fields.hasOwnProperty(fieldId) && self.metainfo.fields[fieldId]) {
        allowedValuesObject[key][i].name = self.metainfo.fields[fieldId].display_name;
      }
    }
  }

    if (self.entitydata.workflow != null) {
        commonfields = commonfields.filter(field => field.id !== "approval_level");
    }
    for(let key in allowedValuesObject){
        allowedValuesObject[key] = allowedValuesObject[key].concat(commonfields);
    }
    return allowedValuesObject;
    }

constructMetaInfo(){
  let self = this;
  let metadata = {
    "display_key": "sdp.common.change", //NO I18N
           "is_dynamic": true, //NO I18N
           "plural_name": self.entityNamePl, //NO I18N
           "relationship": false, //NO I18N
           "display_name": self.entityName, //NO I18N
           "fields": {},//NO I18N
           "entity": self.entityName //NO I18N
  }

         for(let i=0; i<self.stageNames.length; i++){
          metadata.fields[self.stageNames[i]] = {type: "lookup",display_type: "CheckBox",display_name: self.stageNames[i]}
     }
     return metadata;
}
constructTemplateInfo(){
  let self = this;
  let templates = {
     UserSearchOption: "name", //NO I18N
     id: "", //NO I18N
     inactive: false,
     is_default: true,
     is_emergency: false,
     title: "CopyChange", //NO I18N
     layouts:[]
  }

  let fields = [];
    for(let i=0; i<self.stageNames.length; i++){
      fields.push({
              "name": self.stageNames[i], //NO I18N
          "position": {  //NO I18N
              "col": 1, //NO I18N
              "row": 1 //NO I18N
          }
      });
  }
  templates.layouts[0] = {
      sections: [{
             "collapsed_state": "expanded", //NO I18N
             "column_count": "1", //NO I18N
          "style_properties": { //NO I18N
               field_style: {
                 field_align: "top", //NO I18N
                 font_weight: "bolder" //NO I18N
               }
             },
          "fields": fields //NO I18N
      }]
  };
return templates;
}
getStageName(metadata){
      let self = this;
    for (let i = 0; i < self.stageNames.length; i++) {
      let currentField = metadata.fields[self.stageNames[i]];
      let matchingStage = self.stageData.find(stage => stage.internal_name === currentField.display_name);
  if (matchingStage) {
    currentField.display_name = matchingStage.name;
  }
}

}
}
window.CopyChange = CopyChange;
    })();



