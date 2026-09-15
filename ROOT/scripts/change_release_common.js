/* $Id$ */
/* ChangeReleaseDetails obj is merged with release obj in release_details.js */
/* This obj property can be accessed using $rc variable */
var ChangeReleaseDetails = {
	/**
     * Set the basic prop required for all methods
     */
    setProp: function(options){
        this.options = options;
        this.id= options.id || '';
        this.entity_name = options.module; // No I18N
        this.isChangeModule = (this.entity_name === "change");   //No I18N
        this.display_name = this.isChangeModule ? translate('sdp.common.change') : translate('common.release'); // No I18N
        this.base_url = "/api/v3/"+ this.entity_name +"s"; // No I18N
        this.entity_name_pl = this.entity_name +"s";    //No I18N
        this.hash_url = window.location.hash;
        this.isCMCO=options.isCMCO;
    },
    getActiveStageTab : function(){
        let _self = this;
        let tabNameInHash = window.location.hash && window.location.hash.split('/')[0].substring(1);
        const allAvailableStages = _self.isChangeModule ? ["Submission", "Planning", "Approval", "Implementation", "UAT", "Release", "Review", "Close"] : ["submission", "planning", "implementation", "testing", "UAT", "deployment", "training", "review", "close"]; // No I18N
        //If stage is not participating then redirect url to active tab
        if(allAvailableStages.includes(tabNameInHash) && !_self.stagesObject.hasOwnProperty(tabNameInHash)){
            tabNameInHash = "";
        }
        if(this.isStageChanged !== true && tabNameInHash){
            return tabNameInHash;
        }
        const activeStage = (this.entity_data && this.entity_data.stage && this.entity_data.stage.internal_name) || (_self.isChangeModule ? "Submission" : "submission"); // No I18N
        let tabName= (_self.isChangeModule ? "Submission" : "submission"); //No I18N
        const stageTabs = this.getAllowedTabs(activeStage).allowedTabs;
        if(stageTabs.length > 0){
            tabName = activeStage;
        }
        this.isStageChanged = false;
        return tabName;
    },
    getActiveSubTab : function(tab, default_tab){
        let urlParams = this.getHashParams(), activeTab= "";
        if(this.getAllowedTabs(urlParams[0]).allowedTabs && urlParams[0] === tab) {
          const stageTabs = this.getAllowedTabs(urlParams[0]).allowedTabs;
              if(stageTabs.indexOf(urlParams[1]) !== -1){
                activeTab = urlParams[1];
              }else{
                activeTab = default_tab || "details"; //No I18N
              }
        }
        return activeTab;
    },
    getHashParams : function(hash){
        let url = hash || this.hash_url;
            url = url.substring(1);
        return url.split("/");
    },
    getParentTab : function(){
        let tabObject = this.getHashParams(), baseTabName;
        if(this.allowedLeftTabs.indexOf(tabObject[0]) !== -1){
            baseTabName = tabObject[0];
        }else{
            baseTabName = "stages"; //No I18N
        }
        this.parentTab = baseTabName;
        return baseTabName;
    },
    stageTabAfterRender : function(){
        jQuery("#stage_tabs").next().find("li.active").removeClass("active"); //No I18N
        if(this.moduleName == 'Change'){
        document.querySelectorAll('.stage-status-info').forEach(function(element) {//No I18N
            element.addEventListener('mouseout', hideStageMsg);
        });
        }
    },
    /**
     * Initial data to be loaded for details page
     */
    getInitData : function(){
    	let _self = this;
        const url = _self.base_url+ "/" +_self.id;
        let isValidUrl = _self.getMetaInfo(url, _self);
        if(!isValidUrl){
            return false;
        }
        ChangeReleaseForm.constructMetaInfo(_self.metainfo.fields);
        _self.metainfo.display_name = _self.display_name;
        if(_self.id){
            isValidUrl = _self.fetchEntityData();
            if(!isValidUrl){
                return false;
            }
            _self.approvalSummary = _self.getApprovalSummary();
            _self.getLinks(_self.base_url+ "/" +_self.id,_self);
            if(_self.isChangeModule){
                _self.getPropertiesOfChange();
                _self.getTemplateInfo(_self.entity_data.template.id);
                _self.getStatus(_self.entity_data.stage.id);

            }
        }
        this.allowedLeftTabs = this.getLeftMenus();
    },
    /**
     * Get _links api info
     * @base_url - entity url to get links info
     * @dataObj - obj to which response will be added
     */
    getLinks: function(url,dataObj){
        let _self = this;
        sdpAjax({
            url: url+ "/_links", // No I18N
            success: function(resp) {
                dataObj._links = resp._links;
                // var permissions = _self.constructPermissions(resp._links.permissions);
                // dataObj._links.permissions = permissions;

                resp._links = resp._links.links ? resp._links.links : resp._links;
                dataObj._links = _self.constructLinksInfo(resp._links);
            },
            async:false
        });
    },
    /**
     * Get stage permission and add it to stagesObject
     */
    getStagePermissions : function(){
        let _self = this;
        sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/_get_permissions", // No I18N
            success: function(resp) {
                _self.permissionsArray = resp.get_permissions;
                _self.stagePermissions = _self.constructPermissions(resp.get_permissions);
                // _self.stagePermissions = data.get_permissions;
                if(_self.stagesObject){
                    jQuery.each(_self.stagePermissions,function(stage, stagePerm){
                        if(_self.stagesObject[stage]){
                            _self.stagesObject[stage].canEdit = stagePerm.edit;
                            _self.stagesObject[stage].canView = stagePerm.view;
                            _self.stagesObject[stage].canApprove = stagePerm.approve;
                        }
                    });
                }
            },
            async:false
        });
    },
    /**
     * Permission object returned from API, contains id and stageinfo as key value pair.
     * So for convenient, stagename and its info is added as key-value pair.
     */
    constructPermissions: function(permissions){
        let _self = this;
        let stagePermission = {};
        // var permissionCopy = jQuery.extend(true,{},permissions);
        for(let stageName in _self.stagesObject){
            let stageId = _self.stagesObject[stageName].id;
            stagePermission[stageName] = permissions[stageId];
            // var stageName = _self.stagesObject[stageId].internal_name;
            // stagePermission[stageName] = permissions[stageId];
        }
        /* Permissions available in any of the stages is given as -1 in permission api, which is changed to global*/
        stagePermission["global"] = permissions["-1"];   // No I18N
        return stagePermission;
    },
    /**
     * Convert links array to object type for ease access
     */
    constructLinksInfo: function(links) {
        let clientLinks = {}, name, method, href;
        let linksLen = links ? links.length : 0;
        if(linksLen) {
            for(let i=0; i<linksLen; i++) {
                if(!links[i]) {
                    continue;
                }
                name = links[i].name;
                method = links[i].method;
                href = links[i].href;
                if(!clientLinks[name]) {
                    clientLinks[name] = {};
                }
                clientLinks[name][method] = {};
                clientLinks[name][method] = links[i];
                clientLinks[name][method].href = href ? href : "";
            }
        }
        return clientLinks;
    },
    /**
     * Get metainfo of entity
     */
    getEntitySummary: function(){
        let _self = this;
        let entitySummary = {};
        if(_self.summary){
            entitySummary.summary = _self.summary;
        }else{
            entitySummary = _self.fetchEntitySummary();
        }
        if(_self.isChangeModule)
        {
        _self.summary.isRequester = _self.isRequester();
        }
        entitySummary.canViewAssociations = $rc.hasAssociationsAccess();
        entitySummary.associations_summary = $rc.getAssociationsAccessSummary();
        return entitySummary;
    },
    /**
     * Get metainfo of entity
     */
    fetchEntitySummary: function(){
        let _self = this;
        let entitySummary = {};
        sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/summary",   // No I18N
            type: "GET", // No I18N
            success: function(resp){
                if(resp.response_status && resp.response_status.status === "success"){
                    entitySummary.summary = _self.summary = resp.summary || resp.change_summary;
                    if(entitySummary.summary.tasks){
                        if(entitySummary.summary.tasks.hasOwnProperty("closed")){
                            entitySummary.summary.tasks.closed = entitySummary.summary.tasks.closed.toString();
                        }else if(entitySummary.summary.tasks.hasOwnProperty("task_completed_count")){  // No I18N
                            entitySummary.summary.tasks.task_completed_count = entitySummary.summary.tasks.task_completed_count.toString();
                        }
                    }
                }
            },
            async: false
        });
        return entitySummary;
    },
    /**
     * Get metainfo of entity
     * @base_url - entity url to get metainfo
     * @dataObj - obj to which response will be added
     */
    getMetaInfo : function(base_url, dataObj){
        let isValidUrl = true;
        sdpAjax({
            url: base_url+ "/_metainfo", // No I18N
            success: function(resp) {
                dataObj.metainfo = resp.metainfo;
            },
            error: function(){
                isValidUrl = false;
            },
            async:false
        });
        if(!isValidUrl)
        {
            showalert("failure", translate("api.common.invalid_url") , "isAutoHide=false");
        }
        return isValidUrl;
    },
    /**
     * Get module data, if entity data is not available, fetch the data and load in _self
     */
    getEntityData : function(entity_id){
        let _self = this;
        if(!_self.entity_data){
            _self.fetchEntityData();
        }
    },
    /**
     * Fetch module data from api
     */
    fetchEntityData: function(){
        let _self = this;
        let respData = {};
        let inputObject = { "add_recent_item": true}; // No I18N
        let dataVal = sdpAjaxInputData(inputObject), isValidUrl = true;
        sdpAjax({
            url: _self.base_url+ "/" +_self.id, // No I18N
            data: dataVal,
            success: function(resp) {
                if(resp.response_status && resp.response_status.status === "success"){
                    _self.entity_data = respData = resp[_self.entity_name];
                    _self.modifyDescriptionInlineImgSrc(_self.entity_data);
                    _self.isTrashed = !!_self.entity_data.deleted_time;
                    /** Issue : Take action button for an approver was not available if an approval level is configured to invoke after success status of a stage in a workflow.
                     *  Cause : Previously we have fetched activeStage data from approval_summary. So if a stage is in accepted status then it will be assigned false.
                     *  Fix   : So now we have fetched activeStage data from entity_data to resolve this.
                     */
                    _self.activeStage = _self.entity_data.stage.internal_name;
                    if(window.checkIfMSP()){
                    	window.addAndSetAccountInCombo(_self.entity_data.account.id, true, _self.entity_data.account.name);
                    }
                }
            },
            error: function(resp){
                if(resp.responseJSON && resp.responseJSON.response_status && resp.responseJSON.response_status.messages && jQuery.isArray(resp.responseJSON.response_status.messages)&& resp.responseJSON.response_status.messages[0].status_code === 4002){

                    // When the change view permission for the user is removed in their login, we must redirect to the list view page.
                    window.location.href=_self.entity_name === 'change'?"/Changes.cc":"/ui/releases?mode=get"; // No I18N
                    showalert("failure", translate("common.updateandnoview.permission.message",[e_html(_self.display_name), _self.options.id]),  "isAutoHide=false"); //No I18N
                    isValidUrl = false;
                }
            },
            async: false
        });
        jQuery("#browserTitleInfo").find("#bt_id").text(respData.id).end().find("#bt_title").text(respData.title);// No I18N
        applyBrowserTitle();
        return isValidUrl;
    },
    modifyDescriptionInlineImgSrc: function(entity_data){
        let _self = this;
        if(entity_data.image_token){
            entity_data.description = appendImageToken(entity_data.description,entity_data.image_token);
        }
        const descriptiveFields = ["impact_details","roll_out_plan","back_out_plan","checklist","close_details"]; //No I18N
        if (_self.entity_name === "change") { //No I18N
            descriptiveFields.push("review_details"); //No I18N
        }
        for (let i=0, len=descriptiveFields.length; i<len; i++) {
            const fieldName = descriptiveFields[i];
            if(entity_data[fieldName] && entity_data[fieldName].image_token){
                entity_data[fieldName].description = appendImageToken(entity_data[fieldName].description,entity_data[fieldName].image_token);
            }
        }
    },
    /**
     * Delete an entity
     */
    deleteEntity: function(){
        let _self = this;
        let delete_Entity = function(confirm){
            let url = _self.isTrashed ? _self.base_url+ "/" +_self.id : _self.base_url+ "/" +_self.id+ "/_move_to_trash";
            if(confirm){
               sdpAjax({
                    url: url, // No I18N
                    type: "DELETE",  // No I18N
                    success: function(resp) {
                        if(resp.response_status && resp.response_status.status === "success"){
                            const successMsg = _self.isTrashed ? translate("api.deleted.success", [e_html(_self.display_name)]) : translate("api.trashed.success",[e_html(_self.display_name)]);
                            showalert("success", successMsg , "isAutoHide=true");  //No I18N
                            jQ("#goback_release").trigger("click"); //No I18N
                        }
                    }
                });
           }
        };
        const title = _self.isTrashed ? translate("sdp.common.delete.permanent") : translate("sdp.common.delete");
        const message = _self.isTrashed ? translate("common.delete.permanent.confirm.message", [e_html(_self.display_name)]) : translate("sdp.admin.change.commonlistview.deleteConform", [e_html(_self.display_name)]);
        showconfirm(true,'title='+title+', message='+message+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',delete_Entity); //No I18N

    },
    afterInitialRender : function(param){
        let _self = this;
        $CRObj.doPush = true;
        if(this.parentTab !== "stages"){// No I18N
            setTimeout(function(){
                jQuery("#release_stage").find("#stages_tabs [data-detail-tab='stages']").trigger("click",{"skipSettingPath" : true});// No I18N
                jQuery("#stageMenu ul[role='tablist'] li a[data-detail-tab='"+_self.parentTab+"']").parent().addClass("active");
            },50);
        }
        SdpWidgets.renderHelpers.renderModuleWidgets({
            module: $rc.isChangeModule ? "change" : "release",
            stage: _self.getActiveStageTab(),
            containerId: _self.getActiveStageTab() + "-tabs-panel_content",
            entity_id: _self.id,
            refreshPanel: () => {
              $rc.$detailsComp.refreshPanel("panel", "content-right");
            },
            default_icon: !$rc.isChangeModule ? "crspr icon-md flip-x rls-rocket1  vmiddle" : "crspr chn-module1 icon-md  flip-x", //NO I18N
          });
          _self.constructTabCustomWidgetsTabs();
    },
    constructTabCustomWidgetsTabs : function(){
        let _self = this;
        jQuery("#stagesList").find("[data-detail-tab]").on("click", function(){
            SdpWidgets.renderHelpers.renderModuleWidgets({
                loadRightPanel:false,
                module:"release",//No i18n
                stage:this.getAttribute("data-detail-tab"),//No i18n
                containerId:this.getAttribute("data-detail-tab")+"-tabs-panel_content",//No i18n
                entity_id:_self.id,
                refreshPanel:()=>{
                    $rc.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
                }
            });
        });
    },
    gotoActiveTab : function(tabName, tabSetting, tabObject){
        let _self = this;
        if(_self.printPreview){
            return;
        }
        tabName = tabObject.active;
        if(!tabName){
            tabName = _self.$detailsComp.options.panel_details.content_panel.tabs_panel.active || "details"; // No I18N
        }
        setTimeout(function(){
            //$CRObj.doPush = false;
            if(tabName === "stages") { // No I18N
            	jQuery("#"+tabObject.containerId || _self.$detailsComp.options.container).find("#stages_tabs [data-detail-tab='stages']").trigger("click").off("click"); // No I18N
            }
            else if (tabName === "history" || (tabObject.tabs && tabObject.tabs.indexOf(tabName) !== -1)) { // No I18N
                jQuery("#"+tabObject.containerId || _self.$detailsComp.options.container).find("[role='tablist']").find("li a[data-detail-tab='"+tabName+"'], li[data-detail-tab='"+tabName+"']").trigger("click");
            }
            else {
	            jQuery("#"+tabObject.containerId || _self.$detailsComp.options.container).find("[role='tablist'] li a[data-detail-tab='"+(tabName || _self.activeStage)+"']").trigger("click"); // No I18N
	        }
        },1);
    },
    getStages : function(base_url){
        return new Promise(function(resolve, reject){
                sdpAjax({
                    url: base_url+ "/stage" // No I18N
                }).then(function(resp){
                    if(resp.response_status && resp.response_status.status === "success"){
                        resolve(resp.stage);
                    }
                });
        });
    },
    /**
     * Initialize FC for details sections
     * @configJSON - entity specific configuration json
     */
    initFormComponent: function(configJSON){
        let _self = this;
        let config = {
            name: _self.entity_name,
            entity: _self.entity_name,
            entityName: _self.display_name,
            entitypath: _self.entity_name,
            mode: "view",// No I18N
            formid: _self.entity_name,
            /*Inline save*/
            save: {
                url: _self.base_url+ "/" +_self.id,//NO I18N
                entity: _self.entity_name
            }
        };

        jQuery.extend(true, config, configJSON);
        config.template.layouts[0].sections[0].fields=config.template.layouts[0].sections[0].fields.filter(field => field.name !== "attachments");
        if(config.ffr){
             if(config.skipFields && config.mode=="edit" ){
              config.ffr.hideFields=config.skipFields; config.skipFields=[];
             }
             config.ffr.wizard=function(form){
                if(form.mandatoryFields.length>0){
                    var change_fields={current_value:jQuery.extend(true,[],form.getChangedValues()),tracker:jQuery.extend(true,[],form.event_tracker)};
                    let form_selector=form.form;
                    let rerender = form.options.ffr.rerender;
                    form.destroy();
                    if(rerender){
                        rerender(form);
                    }
                    $rc.openWizard(change_fields,rerender);
                }
                else{
                    form.saveInlineEdit(form.form,field.name,event);
                }
            }
        }
        return new FC(config);
    },
    constructGeneralTemplate: function() {
         var self = this;
         entityName=self.isChangeModule?"change":"release";// No I18N
         templateRC=jQuery.extend(true,{},self.template);
         !templateRC[entityName].site ? templateRC[entityName].site=null : null;
         var layouts = templateRC.layouts;
         var submissionLayout = {};
         var rolesLayout = {}, generalLayout = {};
         //Attachment section is appended when template preview window is refreshed
         var isAttachmentLayoutPresent = false;
         for(var i = 0; i < layouts.length; i++) {
             (layouts[i].name==="submission" || layouts[i].name==="Submission") && (submissionLayout = layouts[i]);
             layouts[i].name==="role" && (rolesLayout = layouts[i]);
             layouts[i].name==="general" && (generalLayout = layouts[i]);
             layouts[i].name==="attachment" && (isAttachmentLayoutPresent = true);
         }
         /** set extra fields to the property */
         if(rolesLayout&&self.isChangeModule){
             rolesLayout.sections=rolesLayout.sections.slice(1);
             rolesLayout.sections.forEach(function(section,i){
                section.fields.forEach(function(field,j){
                     var roleId = field.name.split('.')[1];
                     field.sort = false;
                     field.input_data_Callback = $CRForm.getRolesInputDataCallback(field, null ,self.metainfo.fields);
                     if(roleId && self.metainfo.fields.roles.fields[roleId].internal_name == 'SDSharedRole'){
                         field.processSearchData = self.processSearchData;
                         field.help_text = translate("sdp.change.sharedrole.info");
                     }
                 });
                 section.fields = $CRForm.templateFieldSortUtil(section.fields, false);
                 section.fields = $CRForm.templateFieldSortUtil(section.fields, true);
             });
         }
         ChangeReleaseForm.modifyUDFFieldsProperty(submissionLayout, templateRC[entityName].udf_fields);
         let layout=[];
         layout.push(submissionLayout);
         layout.push(rolesLayout);
         templateRC.layouts=layout;
         return templateRC;
    },
    openWizard:function(change_fields){
         var _self = this;
         var template = jQuery.extend(true,{},_self.constructGeneralTemplate());
         var fields=[];template.layouts[0].sections.forEach((val)=>{val.fields.forEach(val=>{fields.push(val.name)})});
         if(_self.entity_data.hasOwnProperty("site")){
                 _self.entity_data.site = _self.entity_data.site ? _self.entity_data.site : {"id":-1,"name":translate('common.site.nosite')};//NO I18N
             }
             var skipEditFields = ["site", "group", "sla", "sla_violation","stage","status"]; // No I18N
         if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.contains('ViewInventoryWS')==false){
                 skipEditFields.push("assets");
             }
         ChangeReleaseForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);
         var template_fields = template.layouts[0].sections[0].fields;
         if(template.layouts&&template.layouts.length==2&&template.layouts[1].name=="role"){
            template.layouts.pop();
         }
             for(var i=0; i<template_fields.length;i++){
                 var field = template_fields[i];
                 if(field.name === 'sla_violation'){
                     field.custom_render = function(){
                         return (_self.entity_data.sla_violation === null)? "-" : (_self.entity_data.sla_violation ? getMessageForKey('sdp.change.submission.yes') + '<img align="absmiddle" class="overdue-icon2 vtop ml5" src="/images/spacer.gif" hspace="2" title="'+e_attr(translate(sdp.dashboard.slaviolated))+'">' : e_html(translate('sdp.change.submission.no')));//No i18n
                     }
                 }
                 if(field.name === 'comment'){
                     field.mandatory=false;
                 }
                 if(field.name=="change_owner"){
                    field.input_data_Callback = $CRForm.getRolesInputDataCallback({name: "change_owner"}, _self.entity_data ,_self.metainfo.fields);   // No I18N
                 }
             }

             $CRObj.isCMCO=ChangeReleaseForm.isCMCO;
             template.layouts[0].sections[0].fields=template.layouts[0].sections[0].fields.filter(field => field.name !== "attachments"&&field.name!=="site"&&field.name!=="group");
            if($rc&&$rc._links.edit && $rc._links.edit.put && !$rc._links.edit.put.non_editable_fields.includes("stage") ){
                skipEditFields=skipEditFields.filter(item => item !== "stage");  //No I18N
            }
            if($rc&&$rc._links.edit && $rc._links.edit.put && !$rc._links.edit.put.non_editable_fields.includes("status") && ($rc.stagePermissions[$rc.activeStage].edit || $rc.stagePermissions[$rc.activeStage].approve)){
                skipEditFields=skipEditFields.filter(item => item !== "status");  //No I18N
            }

            jQuery("body").append(`<div id="change_wizard"></div>`);
         var configJSON = {
                 template: template,
                 entitydata: jQuery.extend(true,{},_self.entity_data),
                 metadata: jQuery.extend(true,{},_self.metainfo),
                 container: "change_wizard",// No I18N
                 formid:"change_popup_wizard",// No I18N
                 //canEdit: entityFields.canEdit,
                 editExceptions: ["site", "group","title"], // No I18N
                 skipEditFields: skipEditFields,
                 skipFields: ["attachments","sla_violation"],// No I18N
                 mode: "edit",// No I18N
                 allowedValuesCallback: "$rc.getAllowedValues",//NO I18N
                 ffr:{
                    hideFields:["site","group"],        //NO I18N
                   id:template.id,
                   enable:true,
                   skipOnload:true,
                   afterOnLoad:function(form){
                     for(let i=0,n=change_fields.tracker.length;i<n;i++){
                            $se.form[change_fields.tracker[i].event].apply($se.form,change_fields.tracker[i].param);
                     };
                     for (field in change_fields.current_value){
                        if((field.indexOf("udf_")!=-1&&$se.form.metadata.fields.udf_fields.fields[field.split(".")[1]]&&$se.form.metadata.fields.udf_fields.fields[field.split(".")[1]].type=="datetime")||($se.form.metadata.fields[field]&&$se.form.metadata.fields[field].type=="datetime")){
                            change_fields.current_value[field]=change_fields.current_value[field]&&change_fields.current_value[field].value?change_fields.current_value[field].value:change_fields.current_value[field];
                        }
                        $se.form.setFieldValue(field,change_fields.current_value[field]);
                    };

                    form.fields.comment.disabled=!(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1);
                   },
                   entity:"CHANGE",//No i18n
                   toggleMode:(form,event,mode)=>{
                     if(mode=="view"){
                        $rc.entityFields.initFC('edit');// No I18N
                        return false;
                     }
                  }
                 },
                 dependentFields: [{
                     fields: ["category", "subcategory", "item"],    //No I18N
                     order: true
                 }, {
                     fields: ["stage", "status"],  //No I18N
                     order: true
                 }],
                 linkedFields : [
                     {
                         fields : ["scheduled_start_time","scheduled_end_time"], //NO I18N
                         denote_field : ["scheduled_end_time"], //NO I18N
                         message : translate("sdp.schedule.validation.key4"), //NO I18N
                         validation: function(valueJson)
                         {
                             if(this.isValueChanged("scheduled_end_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time)
                             {
                                 return false;
                             }

                             return true;
                         }
                     },
                     {
                         fields : ["scheduled_start_time","scheduled_end_time"], //NO I18N
                         denote_field : ["scheduled_start_time"], //NO I18N
                         message : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                         validation: function(valueJson)
                         {
                             if(this.isValueChanged("scheduled_start_time") && valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time)
                             {
                                 return false;
                             }

                         return true;
                     }
                 },
                 {
                     fields : ["created_time","completed_time"], //NO I18N
                     denote_field : ["created_time"], //NO I18N
                     message : translate("api.validation.createdtime.completedtime"), //NO I18N
                     validation: function(valueJson)
                     {
                         if(this.isValueChanged("created_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time)
                         {
                             return false;
                         }

                         return true;
                     }
                 },
                 {
                     fields : ["created_time","completed_time"], //NO I18N
                     denote_field : ["completed_time"], //NO I18N
                     message : translate("api.validation.completedtime.createdtime"), //NO I18N
                     validation: function(valueJson)
                     {
                         if(this.isValueChanged("completed_time") && valueJson.completed_time && valueJson.created_time >= valueJson.completed_time)
                         {
                             return false;
                         }

                             return true;
                         }
                     }
                 ],
                 edit: {
                    onchange:{
                        stage: "ChangeReleaseForm.onChangeStage",//NO I18N
                        status:function(field, form)
                        {
                            form.addMandatoryField("comment");//NO I18N
                          form.fields.comment.disabled = !(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1);
                        },
                        scheduled_start_time:"$rc.ChangeFieldValidation",    //NO I18N
                        scheduled_end_time:"$rc.ChangeFieldValidation",    //NO I18N
                        created_time:"$rc.ChangeFieldValidation",    //NO I18N
                        completed_time: "$rc.ChangeFieldValidation"    //NO I18N
                    },
                     fields: {
                         services:{
                             placeholder:translate('sdp.change.sla.select')
                         },
                         assets:{
                             selection_icon_class:"hide"//NO I18N
                         },
                         configuration_items:{
                             selection_icon_class:"hide"//NO I18N
                         },
                         stage:{
                            allowClear:false
                         },
                         status:{
                            allowClear:false
                         },
                         description: {
                            images_api: true,
                            images_url: "/api/v3/" + _self.metainfo.plural_name+"/"+$rc.entity_data.id+ "/images"//NO I18N
                         }
                     },
                     inline: {
                         pre: _self.hidePanelEditor,
                         services: {
                             post: function() {
                                 if(_self.$entityFields_FC) {
                                     _self.$entityFields_FC.fields.services.renderasHTML = false;
                                     _self.$entityFields_FC.fields.services.hideCheckbox = false;
                                     delete _self.$entityFields_FC.fields.services.renderField;
                                 }
                             }
                         }
                     },
                     defaults: {
                         lookup:{
                             placeholder:translate('sdp.change.sla.select')
                         }
                     }
                 },
                 save: {
                     submit: true,
                     serializer: "$rc.roles.serializeRolesDataForAPI", //No I18N
                     postsuccess:function(){
                         jQuery("#change_wizard").dialog("close");// No I18N
                         $rc.reinitDetailsComponent();
                     },
                     cancel: function(fc){
                       jQuery("#change_wizard").dialog("close");// No I18N
                     },
                 },

             };
             if(($rc.isConfigEnabled("RoleEditConfig", "AllowOnlySuperUsersToEditChangeRoles")&&!$rc.changeProperties.hasRFCEdit)){
                 configJSON.edit.fields.change_requester={disabled:true};
                 configJSON.edit.fields.change_owner={disabled:true};
                 configJSON.edit.fields.change_manager={disabled:true};
             }
             _self.wizardFC = _self.initFormComponent(configJSON);
             jQuery("#change_wizard").dialog({
                 width:1100,
                 height: 700,
                 position:  { my: "top", at: "top", of: window },//No i18n
                 modal: true,
                 top:100,
                 title:"#"+$rc.entity_data.id+" Edit",
                 resizable: true,
                 closeOnEscape: true,
                 close:function() {
                         $rc.wizardFC.destroy();
                 }});
    },
    reinitFormComponent: function(form, options){
        form.destroy();
        return this.initFormComponent(options);
    },
    hidePanelEditor: function(){
        jQuery('[data-name="edit-template"]').find('[name="Cancel"]').trigger("click");
    },
    /**

     * Get template data from api
     */
    getTemplateInfo: function(templateId){
        let _self = this, respData = {};
        if(_self.template) {
            respData = _self.template;
        }
        else {
            let inputObject = {"include":["all_stages"]}; // No I18N
            let dataVal = sdpAjaxInputData(inputObject);
            sdpAjax({
                url: "/api/v3" +_self.metainfo.fields.template.href+ "/" +templateId, // No I18N
                data: dataVal,
                success: function(resp) {
                    _self.template = respData = resp[_self.metainfo.fields.template.lookup_entity];
                    const layouts = _self.template.layouts;
                    for (let i = 0; i < layouts.length; i++) {
                        (layouts[i].name==="submission" || layouts[i].name==="Submission") && (_self.submissionLayout = layouts[i]);
                        layouts[i].name==="role" && (_self.rolesLayout = layouts[i]);
                    }
                },
                async: false
            });
        }
        return respData;
    },
    /**
     * Constructs template with given stage's layout and its fields from the template api data
     * @stageName - stage name
     * @fields
     */
    constructTemplateInfo: function(stageName, fields, column_count, options,mode){
        let _self = this;
        let template = jQuery.extend(true,{},_self.template);
        let layouts = template.layouts;
        let col_count_placeholder=0;
        template.layouts = [];
        for(let i=0,len=layouts.length; i<len; i++){
            if(layouts[i].stage && layouts[i].stage.internal_name === stageName){
                template.layouts.push(layouts[i]);
                break;
            }else if(layouts[i].name === stageName){
                template.layouts.push(layouts[i]);
                break;
            }
        }
        let requiredFields = [];
        jQuery.each(template.layouts[0].sections, function(i, section){
            let row = 1;
            let fieldCount = 0;
            // If column_count is given, then alter the cols properties in template layout json
            column_count && (section.column_count = column_count);
            if($rc.isChangeModule) {
                section.fields = $CRForm.templateFieldSortUtil(section.fields, false);
                section.fields = $CRForm.templateFieldSortUtil(section.fields, true);
            }
            jQuery.each(section.fields, function(j, field){

                if(mode!="edit"  && options && options.skipFields && options.skipFields.includes(field.name)){
                    return;
                }
                if(mode!="edit" && fields!=null && !fields.includes(field.name))
                {
                    return;
                }

                if(field.name.startsWith("udf") && options && options.skipUDF) {
                    return;
                }

                // Get only the given fields
                if(jQuery.isArray(fields) && fields.indexOf(field.name) > -1){
                    requiredFields.push(field);
                }
                if(column_count){
                    //For change module other than role separate ordering is followed
                    let colCount = ($rc.isChangeModule && stageName !== 'role')?((col_count_placeholder+1)%column_count):((j+1)%column_count);//No I18N
                    field.position.col = colCount ? colCount : column_count;
                    col_count_placeholder=col_count_placeholder+1;
                }
                if(options && options.setRolesInputDataCallback&&field.name&&field.name.indexOf("udf") == -1){
                    field.input_data_Callback = _self.isChangeModule ? $CRForm.getRolesInputDataCallback(field, _self.entity_data ,options.metainfo) : $releaseForm.getRolesInputDataCallback(field, _self.entity_data ,options.metainfo);
                }
                //Get only UDF fields in template layout
                if(((options && options.skipFields && options.skipFields.length > 0) || fields==null) || (options && options.onlyUDFFieds && field.name.indexOf("udf") != -1)){
                    ++fieldCount;
                    /* Add context=udf_fields for the udf fields to render udf field */
                    (field.name.indexOf("udf") !== -1) && (field.context = "udf_fields");      //No I18N
                    requiredFields.push(field);
                    field.position.row = row.toString();
                    (fieldCount%2 === 0) && ++row;
                }
                //Remove field's customization properties for details page
                field.style_properties = {};
                //Rendering custom html for CIs Involved, Services Affected and Assets Involved field in release details page spot edit alone.
                if( ((options && options.showRelationshipIcon) || (mode === 'view' && !_self.printPreview)) && (field.name === 'configuration_items' || field.name === 'services' || field.name === 'assets') ) {
                    field.custom_render = _self.renderAssetCIField;
                    field.renderField = _self.renderAssetCIShowMoreComponent;
                    field.renderasHTML = true;
                    field.hideCheckbox = true;
                    _self.setupCMDBClickEvents(field);
                }
                if(stageName === "role"){
                    let roleId = field.name.split('.')[1];
                    if(roleId && _self.metainfo.fields.roles.fields[roleId].internal_name === 'SDSharedRole'){
                        field.processSearchData = $CRForm.processSearchData;
                        field.help_text = translate("sdp.change.sharedrole.info");
                    }
                }

            });
            //Append the required fields to its section
            ((mode!="edit" && fields) || (options && (options.skipFields || options.onlyUDFFieds))) && (section.fields = requiredFields);// No I18N
            //Remove section customization properties for details page
            section.style_properties = {};
        });
        return template;
    },
    /**
     * Constructs HTML content for showMore component of 'CIs Involved', 'Service Affected and 'Assets Involved' field in Release Details Page.
     */
     renderAssetCIShowMoreComponent: function(value, fieldName) {
        let obj = {};
        obj.field = value;//value has {id,name}
        obj.entity_name = fieldName;//fieldName denotes configuration_items or assets or services
// Check if ChangeReleaseDetails and stagePermissions exist
if (ChangeReleaseDetails && ChangeReleaseDetails.stagePermissions) {
    const submissionPermissions = ChangeReleaseDetails.stagePermissions;

    // Check if either Submission or submission has the edit permission
    if ((submissionPermissions.Submission && submissionPermissions.Submission.edit) ||
        (submissionPermissions.submission && submissionPermissions.submission.edit)) {
        obj.canEdit = true;
    } else {
        obj.canEdit = false;
    }
}

        if(sdp_user.ROLES && sdp_user.ROLES.length > 0) {
            //Asset Field Permission --> Asset Module Enabled and "ViewInventoryWS" System Role should be present
            obj.hasAssetAccess = (fieldName === 'assets') && sdp_app.IS_ASSET_MODULE && sdp_user.ROLES.contains('ViewInventoryWS'); //No I18N
            //CI and Service Field Permission --> CMDB Module Enabled and "EnableCMDB" System Role should be present
              obj.hasCMDBAccess = sdp_app.IS_CMDB_ENABLED && sdp_user.ROLES.contains('ViewCI'); //No I18N
        }
        if(fieldName == 'assets') {
            obj.details_url = "assetsObj.popup.open('detail','assets',''," + value.id + ",'','','showdetails')"; //No I18N
            obj.display_name = translate("common.asset");
        }
        else if(fieldName == 'services') {
            obj.details_url = "javascript:assetsObj.loadCIDetailsInNewWindow("+value.id+");"
            obj.display_name = translate("sdp.itil.common.service");
            obj.ciID = value.id;
        }
        else {
            obj.details_url = "javascript:assetsObj.loadCIDetailsInNewWindow("+value.id+");"
            obj.display_name = translate("ae.cmdb.quicllicks.createnew.ci");
            obj.ciID = value.id;
        }
        obj.display_name = (fieldName === 'assets') ? translate("common.asset") : (fieldName === 'services') ? translate("sdp.itil.common.service") : translate("ae.cmdb.quicllicks.createnew.ci");
        //Field Width handling
        obj.field_width = 0;
        if(obj.hasAssetAccess) {
            obj.field_width = 40;
        }
        if((obj.hasCMDBAccess && !obj.canEdit) || (obj.hasAssetAccess && obj.canEdit)) {
            obj.field_width = 105;
        }
        if(obj.hasCMDBAccess && obj.canEdit) {
            obj.field_width = 135;  // Issue fix - 108014
        }
        ChangeReleaseDetails.setupCMDBButtonsEventBindings(obj, 'ci-showMore', 'bulk_select_grid'); //No I18N
        const templateName = $rc.isChangeModule ? "change_cmdb_show_more_template" : "release_cmdb_show_more_template"; //No I18N
        return renderhbs(null, templateName, obj, false, $rc.isChangeModule ? "change" : "release", true, true, null, true);  //NO I18N
    },
    /**
     * Constructs HTML content for 'CIs Involved', 'Service Affected and 'Assets Involved' field in Release Details Page.
     */
    renderAssetCIField: function() {
        let _self = this;
        let defaultCount = 3; //Default visible count for CMDB fields are 3 as per old behaviour
        let obj = {};
        obj.field = _self.field_value;//field data
        obj.entity_name = _self.name;//fieldName denotes configuration_items or assets or services
        obj.ids = _self.value;//field ids
        obj.canEdit = _self.edit;
        obj.defaultCount = defaultCount;
        obj.showMoreCount = _self.value.length - defaultCount;
        obj.display_name = (_self.name === 'assets') ? translate("common.asset") : (_self.name === 'services') ? translate("sdp.itil.common.service") : translate("ae.cmdb.quicllicks.createnew.ci");
        //roles check for Asset and CMDB
        if(sdp_user.ROLES && sdp_user.ROLES.length > 0) {
            //Asset Field Permission --> Asset Module Enabled and "ViewInventoryWS" System Role should be present
            obj.hasAssetAccess = (_self.name === 'assets') && sdp_app.IS_ASSET_MODULE && sdp_user.ROLES.contains('ViewInventoryWS'); //No I18N
            //CI and Service Field Permission --> CMDB Module Enabled and "EnableCMDB" System Role should be present
              obj.hasCMDBAccess = sdp_app.IS_CMDB_ENABLED && sdp_user.ROLES.contains('ViewCI'); //No I18N
        }
        //Field Width handling
        obj.field_width = 30;
        obj.sm_field_width = 45;
        if(obj.hasAssetAccess) {
            obj.field_width = 95;
            obj.sm_field_width = 105;
        }
        else if(obj.entity_name == 'services'){
            obj.field_width = 30;
            obj.sm_field_width = 45;
        }
        else if((obj.hasCMDBAccess && !obj.canEdit) || (obj.hasAssetAccess && obj.canEdit)) {
            obj.field_width = 95;
            obj.sm_field_width = 105;
        }
        else if(obj.hasCMDBAccess && obj.canEdit) {
            obj.field_width = 120;
            obj.sm_field_width = 135;
        }
        ChangeReleaseDetails.setupCMDBButtonsEventBindings(obj, 'ci-details', 'changeDetails'); //No I18N
        const templateName = $rc.isChangeModule ? "change_cmdb_field_template" : "release_cmdb_field_template"; //No I18N
        return renderhbs(null, templateName, obj, false, $rc.isChangeModule ? "change" : "release", true, true, null, true);  //NO I18N
    },
    /**
     * This method is used to dissociate a CI or Asset from release.
     * @param fieldName -- configuration_items or assets
     * @param id -- ciId or assetId
     * @param name -- Display name of CI or Asset
     */
    dissociateCMDB: function(fieldName, id, name, from) {
        let _self = this;
        let disassociate = function (confirm) {
            const fieldData = _self.entity_data[fieldName];
            const url = _self.base_url + "/" + _self.id;
            let obj = {}, input_data = {};
            obj[fieldName] = fieldData.filter(x => x.id != id).map(({ id, name }) => ({ id, name }));
            input_data[_self.entity_name] = obj;
            if (confirm) {
                sdpAjax({
                    url: url,
                    data: sdpAjaxInputData(input_data),
                    type: "PUT",  // No I18N
                    success: function (resp) {
                        if (resp.response_status && resp.response_status.status === "success") {
                            const successMsg = translate("api.dissociate.success.msg", [(fieldName === 'assets') ? translate("common.asset") : (fieldName === 'services') ? translate("sdp.itil.common.service") : translate("ae.cmdb.quicllicks.createnew.ci")]);
                            showalert("success", successMsg, "isAutoHide=true");  //No I18N
                            //To close bulk select show more component after dissociate.
                            if (from === "showMore") {
                                jQuery("#bulk_select_grid").dialog("close"); //No I18N
                            }
                            if (_self.entity_name === 'release') {
                              _self.entity_data[fieldName] = jQuery.extend(true, [], resp.release[fieldName]);
                              _self.$entityFields_FC.entitydata[fieldName] = jQuery.extend(true, [], resp.release[fieldName]);
                            _self.$entityFields_FC.renderField(fieldName, true);
                            //To reopen bulk select show more component after dissociate for easy user access.
                            if (from === "showMore" && fieldData.length > 1) {
                                FC.showBulkSelect('form_release', fieldName, false); //No I18N
                            }
                        }
                        else {
                            _self.entity_data[fieldName] = jQuery.extend(true, [], resp.change[fieldName]);
                            _self.$entityFields_FC.entitydata[fieldName] = jQuery.extend(true, [], resp.change[fieldName]);
                            _self.$entityFields_FC.renderField(fieldName,true);
                           //To reopen bulk select show more component after dissociate for easy user access.
                            if (from == "showMore" && fieldData.length > 1) {
                                FC.showBulkSelect('form_change', fieldName, false); //No I18N
                            }
                        }
                        }
                        //To reinitialize tooltips of all multiselect fields if any tooltips present after dissociating CMDB.
                        initTooltip('p[type=multi_select]'); //No I18N
                    }
                });
            }
        };
        const title = translate("common.confirm");
        const message = translate("sdp.release.cmdb.dissociate.msg", [name]);
        showconfirm(true,'title=' + title + ', message=' + e_attr(message) + ', submitbutton=' + translate("sdp.project.request.disassociate") + ', cancelbutton=' + translate("sdp.common.cancel") +', closebutton=yes, closeOnEscKey=yes', disassociate); //No I18N
    },
    setupCMDBClickEvents: function(field) {
        let _self = this;
        let selectorBase = "#changeDetails"; //No I18N
        // Event handling for inline edit button
        jQuery(selectorBase).off("click.edit", `[data-id='${field.name}']`).on("click.edit", `[data-id='${field.name}']`, function(entity_name,event) { //No I18N
            event.preventDefault();
            FC.setInlineEdit(field.name, 'form_'+entity_name, event); //No I18N
        }.bind(null,_self.entity_name));
        // Event handling for save button
        jQuery(selectorBase).off("click.save", `[data-id='${field.name}_save']`).on("click.save", `[data-id='${field.name}_save']`, function(entity_name,event) { //No I18N
            event.preventDefault();
            FC.saveInlineEdit('form_'+entity_name, field.name, event); //No I18N
        }.bind(null,_self.entity_name));
        // Event handling for cancel button
        jQuery(selectorBase).off("click.cancel", `[data-id='${field.name}_cancel']`).on("click.cancel", `[data-id='${field.name}_cancel']`, function(entity_name,event) { //No I18N
            event.preventDefault();
            FC.cancelInlineEdit('form_'+entity_name, field.name, event); //No I18N
        }.bind(null,_self.entity_name));
        // Event handling for show more button
        jQuery(selectorBase).off("click.showMore", `[data-id='${field.name}_showMore']`).on("click.showMore", `[data-id='${field.name}_showMore']`, function(entity_name,event) { //No I18N
            event.preventDefault();
            FC.showBulkSelect('form_'+entity_name, field.name, false, event); //No I18N
        }.bind(null,_self.entity_name));
    },
    setupCMDBButtonsEventBindings: function (obj, element, containerId) {
        let fields = Array.isArray(obj.field) ? obj.field : [obj.field];
        let selectorBase = "#" + containerId; //No I18N
        fields.forEach(value => {
            const entity = obj.entity_name;
            const id = value.id;

            // Event handling for details button
            jQuery(selectorBase).off('click.details_' + id).on('click.details_' + id , `[data-${element}='details_${entity}_${id}']`, function(event) { //No I18N
                event.preventDefault();
                if (obj.hasAssetAccess) {
                     assetsObj.popup.open('detail','asset_assets','',id,'','','showdetails');
                    event.stopPropagation();
                } else if (obj.hasCMDBAccess) {
                     assetsObj.loadCIDetailsInNewWindow(id);
                    event.stopPropagation();
                }
            });

            // Event handling for relationship map button
            jQuery(selectorBase).off('click.relmap_' + id).on('click.relmap_' + id , `[data-${element}='relmap_${entity}_${id}']`, function(event) { //No I18N
                event.preventDefault();
                if (obj.hasCMDBAccess) {
                    showMap(`/RelationshipMapD3.do?operation=showRelD3&ciId=${entity === 'assets' ? value.ci.id : entity === 'services' ? value.ciid : id}`, 'RelationshipMap_W'); //No I18N
                    event.stopPropagation();
                }
            });

            // Event handling for dissociate button
            jQuery(selectorBase).off('click.dissociate_' + id).on('click.dissociate_' + id , `[data-${element}='dissociate_${entity}_${id}']`, function(event) { //No I18N
                event.preventDefault();
                if ((obj.hasAssetAccess || obj.hasCMDBAccess) && obj.canEdit) {
                    $rc.dissociateCMDB(entity, id, value.name, element == 'ci-showMore'?'showMore' : 'detailsPage'); //No I18N
                    event.stopPropagation();
                }
            });
        });
    },
    loadStatusComments: function(tabName, tabSetting, tabs_panel){
        let _self = this;
        const sc = _self.status_comments ? _self.status_comments : (_self.status_comments = {});
        const stage = tabs_panel && tabs_panel.internal_name && _self.stagesObject[tabs_panel.internal_name];
        const stageId = stage && stage.id ? stage.id : null;
        sc.row_inputdata = function(){
            let rowInputData;
            if(stageId){
                rowInputData = {"list_info":{"sort_field": "commented_on", "sort_order": "desc", "start_index": 1, "search_criteria":{'field': 'stage.id', 'value': stageId, 'condition': 'is'}}}; // No I18N
            }else{
                rowInputData = {"list_info":{"sort_field": "commented_on", "sort_order": "desc", "start_index": 1}}; // No I18N
            }
            return rowInputData;
        };

        sc.constructComments = function(tableData){
            let rowData = tableData.row_data;
            if(!stageId){
                rowData.renderStage = true;
            }
            rowData.system_userid = sdp_user.SYSTEM_USERID.toString();
            const templateName = _self.isChangeModule ? "change_status_comment" : "release_status_comment"; //No I18N
            return renderhbs(null, templateName, rowData, false, _self.entity_name, true, true, null, true);
        };
        sc.nodatabanner_callback = function(){
            return true;
        };
        sc.callbackAfterInitialRender = function(){
            jQuery("#pagination_comp_status_comments").find(".btn-group:first").removeClass("ml10");
        };
        _self.initWebComponent("status_comments"); // No I18N
    },
    getStatusComments: function(){
        let _self = this;
        _self.status_comments = {
            url: _self.base_url+ "/" +_self.id+ "/", // No I18N
            entity_name: "status_comments"  // No I18N
        };
        return _self.status_comments;
    },
    /**
     * Get Status comments for every stage
     */
    initWebComponent: function(entity){
        if (WebComponents) {
            const instanceKey = "webc_" + entity; // NO I18N
            if (WebComponents.instancePool[instanceKey]) {
                delete WebComponents.instancePool[instanceKey];
            }
            WebComponents.render(instanceKey);
            this[instanceKey] = WebComponents.getInstance(instanceKey);
        }
    },
    loadApprovalHistory: function(){
        let _self = this;
        let approvalHistory = _self.approval_history ? _self.approval_history : (_self.approval_history = {});
        approvalHistory.row_inputdata = function(){
            return {
                "list_info": {"sort_field": "action_date", "sort_order": "desc", "start_index": 1}, //NO I18N
                "entity": _self.entity_name, //NO I18N
                "entity_id": _self.id //NO I18N
            };
        };
        approvalHistory.constructComments = function(tableData){
            let rdata = tableData.row_data;
            rdata.system_userid = sdp_user.SYSTEM_USERID.toString();
            const templateName = _self.isChangeModule ? "change_approval_history_comments" : "release_approval_history_comments"; //No I18N
            return renderhbs(null, templateName, rdata, false, _self.entity_name, true, true, null, true);
        };
        approvalHistory.nodatabanner_callback = function(){
            return true;
        };
        approvalHistory.callbackAfterInitialRender = function(){
            jQuery("#pagination_comp_approval_history").find(".btn-group:first").removeClass("ml10");
        };
        _self.initWebComponent("approval_history"); // No I18N
    },
    getApprovalHistory: function(){
        let _self = this;
        _self.approval_history = {
            url: "/api/v3/", // No I18N
            entity_name: "approval_history"  // No I18N
        };
        return _self.approval_history;
    },
    /**
     * Loads planning details tab
     */
    loadPlanningDetail: function(){
        let _self = this;
        const change = _self.entity_data;
        const stagePermission = _self.stagePermissions && (_self.stagePermissions.Planning ? _self.stagePermissions.Planning : _self.stagePermissions.planning);
        // Order in which Descriptive fields panel will be shown
        const descriptiveFields = ["impact_details","roll_out_plan","back_out_plan","checklist"]; //No I18N
         _self.descriptive_fields = {};

        for(let i = 0, len = descriptiveFields.length; i < len; i++){
            const fieldName = descriptiveFields[i];

            //Options to initialize Panel Component
            let opt = {};
            opt.id = change[fieldName].id;
            opt.name = fieldName;
            opt.display_name = _self.metainfo.fields[fieldName].display_name;
            opt.container = fieldName+ "_container"; //No I18N
            opt.expand = (i === 0) ? true : !!(_self.printPreview); //Expand first panel by default
            opt.base_url = _self.base_url+ "/" +_self.id; //No I18N
            opt.entity = "descriptive_fields"; //No I18N
            opt.lookup_entity = "descriptive_field"; //No I18N
            opt.data = _self.entity_data[fieldName];
            opt.detailsHbsTemplate = "panel_template"; // No I18N
            opt.canEdit = (stagePermission.edit && !_self.printPreview) || false;
            opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";  //No I18N
            opt.print_mode = _self.printPreview || false;
            opt.panel = {
                pre_edit: function(){
                    _self.hidePanelEditor();
                }
            };
            opt.save = {
                   postsuccess : function(data,pc){
                    //appending the latest image token to img src since data is re-rendered
                    data.description = appendImageToken(data.description,data.image_token);
                    _self.entity_data[pc.name] = data;
                    //re-render details page inorder to see the workflow execution on condition node with descriptive fields.
                    _self.reinitDetailsComponent();
                }
            };
            opt.attachment ={
                description: true,
                container: fieldName+"_attachcontainer", //No I18N
                rerender: function(data, pc){
                    pc.data.attachments = data;
                    _self.entity_data[pc.name] = pc.data;
                }
            };
            if(_self.isNonLogin && opt.data.image_token){
                opt.data.description = appendImageToken(opt.data.description, opt.data.image_token);
            }
            const instance = "$" + fieldName + "_PC";
            _self[instance] = new PanelComponent(opt);
        }
    },

    loadAssociations: function(tabName, tabSetting, tabs_panel){
        let associations_summary = this.getAssociationsAccessSummary();
        if(associations_summary.canViewChanges){
            const changes_url = '/change/ChangeListViewWeb.jsp?module=' + this.entity_name + '&canmanageassociation=' + ($rc.isTrashed || (externalframe === 'true') || $rc.printPreview || !associations_summary.canEditChanges)  + '&module_id=' + this.id; // No I18N
            jQuery('#change_associations').load(changes_url); // No I18N
        }
        if(associations_summary.canViewProjects){
            const project_url = '/project/ProjectListViewWeb.jsp?module=' + this.entity_name + '&canmanageassociation=' + ($rc.isTrashed || (externalframe === 'true') || $rc.printPreview || !associations_summary.canEditProjects) + '&module_id=' + this.id; // No I18N
            jQuery('#project_associations').load(project_url); // No I18N
        }
    },


    /*
     * After render function for Approval Summary
     */
    afterApprovalSummaryRender: function(tabName, settings, panelObj){
        let _self = this, level_id,approval_get_url;
        let summaryArray = (this.approval_summary && this.approval_summary.approval_summary) ? this.approval_summary.approval_summary : this.options.approvalSummaryObject;
        this.tableObjects = {};

        if(!$rc.isNonLogin){
            summaryArray.forEach(function(summary){
                var levels = summary.approval_levels;
                levels.forEach(function(level){
                    level_id = level.id;
                    approval_get_url = level.associated_entity + "s/" + level[level.associated_entity].id + "/approval_levels/" + level.id + "/approvals"; // No I18N
                    _self.constructTableViewForApprovalSummary(level_id,approval_get_url);
                });
            });
        }
        let expColpSpan = '<span id="ExpColpSpan" class="a-tag-link fr">Expand all</span>';
        jQuery('#content-details-inner-change').find('h3').addClass('disp-ib')
        if(summaryArray.length > 0){
            jQuery('#content-details-inner-change h3:first').after(expColpSpan);
            jQuery('#content-details-inner-change #ExpColpSpan').on('click', function(){ $rc.toggleApprovalSummary() });
        }
        this.summaryPanelEventBindings(jQuery('#content-details-inner-change #ExpColpSpan'));
        setTimeout(function(){
            if($rc.printPreview){
                jQuery(' [data-name="user_link"]').addClass("ptr-ev-none"); // No I18N
                jQuery('[data-name="approvalPanel"] [data-name="approvalPanelHeader"]').removeClass('ptr-ev-none'); // No I18N
                jQuery('[data-name="approvalPanel"]').find('.zcollapsiblepanel__header').removeClass('ptr-ev-none'); // No I18N
            }
        },1000);
        this.afterTabRender(tabName, settings, panelObj);
    },

    toggleApprovalSummary: function(){
        var allExpanded = jQuery('z-collapsiblepanel[data-name="approvalPanel"][aria-expanded="true"]').length == jQuery('z-collapsiblepanel[data-name="approvalPanel"]').length;
        jQuery('z-collapsiblepanel[data-name="approvalPanel"]').each(function() {
            jQuery(this).attr("is-active", !allExpanded);
        });
        jQuery('#content-details-inner-change #ExpColpSpan').html(translate((!allExpanded) ? 'sdp.common.collapseall' : 'sdp.common.expandall')); //No I18N
    },

    summaryPanelEventBindings: function(element){
        jQuery('z-collapsiblepanel').off('click.approvalSummaryEvent').on('click.approvalSummaryEvent', function() { //No I18N
            setTimeout(function() {
                var allExpanded = jQuery('z-collapsiblepanel[data-name="approvalPanel"][aria-expanded="true"]').length == jQuery('z-collapsiblepanel[data-name="approvalPanel"]').length;
                jQuery(element).html(translate((allExpanded) ? 'sdp.common.collapseall' : 'sdp.common.expandall')); //No I18N
            }, 500);
        });
    },

    /*
     * Construct level table view for Approval Summary
     */
    constructTableViewForApprovalSummary: function(level_id,approval_get_url){
        let table_content = {}, options = {}, _self = this;
        let table_info = {
            "list_info": { //No I18N
                "start_index": 1, //No I18N
                "row_count": 100, //No I18N
                'sort_order': 'asc', //No I18N
                'sort_field': 'approver.name', //No I18N
                'search_criteria' : '[{"field":"status.name","value":"Approved","condition":"contains","logical_operator":"AND"}]' //No I18N
            }
        };

        table_content.header = _self.headerdataConstruct(_self, level_id);
        options.callbackHeaderfunction = _self.headerdataConstruct;
        options.row_inputdata = table_info;
        options.callbackURL = approval_get_url;
        options.entity_name = "approvals"; // No I18N
        options.tableHolder = "approval_summary_" + level_id; // No I18N
        this.tableObjects[level_id] = new tableComponent({
            "list_info": { //No I18N
                "row_count": 100, //No I18N
                "start_index": 1, //No I18N
                'sort_order': 'asc', //No I18N
                'sort_field': 'approver.name' //No I18N
            }
        }, table_content, options, _self);

    },
    headerdataConstruct: function(_self, level_id) {
        var meta_data = {};
        meta_data = {
            "status": { // No I18N
                "dataCelltransformer": _self.constructTableCells, // No I18N
                "text": getMessageForKey('common.status') // No I18N
            },
            "approver": { // No I18N
                "dataCelltransformer": _self.constructTableCells, // No I18N
                "text": getMessageForKey("approval.approvers"), // No I18N
                "wrapped": true // No I18N
            },
            "sent_on": { // No I18N
                "dataCelltransformer": _self.constructTableCells, // No I18N
                "text": getMessageForKey("approval.senton"), // No I18N
                "type": "date-time" // No I18N
            },
            "action_taken_on": { // No I18N
                "text": getMessageForKey("approval.actedon"), // No I18N
                "dataCelltransformer": _self.constructTableCells, // No I18N
                "type": "date-time" // No I18N
            },
            "comments": { // No I18N
                "text": getMessageForKey("common.comments"), // No I18N
                "dataCelltransformer": _self.constructTableCells, // No I18N
                "width": "250px" // No I18N
            }
        };
        return meta_data;
    },
    constructTableCells: function(td) {
        let rd = td.row_data;
        let column_name = td.head_data.id;
        if (rd[column_name] != null) {
            switch(column_name){
                case "comments" : return '<div class="text-ellipsis maxw-350px vmiddle" rel="uitip" title="' + encodeHTML(rd.comments) + '">' + encodeHTML(rd.comments) + '</div>'; // No I18N
                case "status" : { // No I18N
                     return`<div class="minw-110px pr10 pt5">
                        <span class="cspr success icon-sm top0" rel="uitip" title="` + rd[column_name].name + `"></span>
                        <span class="sb">` + rd[column_name].name + `</span>
                    </div>`;
                }
                case "approver" : return '<div rel="uitip" title="' + encodeHTML(rd[column_name].name) + '">' + encodeHTML(rd[column_name].name) + '</div>';// No I18N
                case "sent_on" :// No I18N
                case "action_taken_on" : return '<div>' + rd[column_name].display_value + '</div>';// No I18N
                default : return '-';
            }
        } else {
            return '-';
        }
    },
    /**
            container: "close_details_attachment" //No I18N
     * Get approval summary data
     */
    getApprovalSummary: function(){
        let _self = this, summary={};
        if(_self.isNonLogin){
            _self.constructStage(_self.options.approvalSummaryObject.approval_summary);
            summary.approval_summary = _self.constructApprovalSummary(_self.options.approvalSummaryObject.approval_summary);
            return summary;
        }

        sdpAjax({
            url: _self.base_url+ "/" +_self.id+ "/approval_levels/_approval_summary", // No I18N
            type: "GET", // No I18N
            success: function(resp){
                if(resp.response_status && resp.response_status[0].status === "success"){
                    /* Construct stage object and array from approval summary*/
                    _self.constructStage(resp.approval_summary);
                    /* Approval summary api has all stages data, so show only completed|cancelled|in_progress state summary*/
                    summary.approval_summary = _self.constructApprovalSummary(resp.approval_summary);
                    //When approval summary is fetched, stage permission also to be fetched
                    _self.getStagePermissions();
                }
            },
            async: false
        });
        this.approval_summary = summary;
        return summary;
    },
    /**
     * Construct approval summary array, since approval_summary api provides all state level stages
     * @approval_summary - [Array] approval summary data from api
     */
    constructApprovalSummary: function(approval_summary){
        let _self = this;
        let approvalSummary = [];
        _self.stagesWithApprovals = [];

        jQuery.each(approval_summary,function(i, summary){
            if(summary.comment === '') {
               summary.comment = '-';
            }
            if(summary.state === "completed" || summary.state === "cancelled" || (summary.state === "in_progress" && summary.approval_levels.length > 0 )){
                approvalSummary.push(summary);
            }
            if(summary.has_approvals) { //If stage has existing approvals
                _self.stagesWithApprovals.push(summary.stage.id);
            }
        });
        return approvalSummary;
    },
    /**
     * Construct stage data object, array and active stage from approval summary api
     * @approval_summary - [Array] approval summary data from api
     */
    constructStage: function(approval_summary){
        var _self = this;
        var stageObj = {},stageArr = [];
        if(approval_summary){
            jQuery.each(approval_summary,function(i, summary){
                stageObj[summary.stage.internal_name] = summary.stage;
                stageObj[summary.stage.internal_name].state = summary.state;
                stageArr.push(summary.stage);
            });
        }
        stageArr.sort((a, b) => a.stage_index - b.stage_index);
        _self.stagesObject = stageObj;
        _self.stagesArray = stageArr;
    },
    roles : {
        /**
         * In form component, default inline save is rejected with promise in 2 cases,
         * 1. When role in unassigned (Not assigned), only delete role api should be called, post call should not be made
         * 2. For multi_select field, when no new user is associated, post call should not be made
         */
         promisereject: function(form, event){
             const formContainer = event ? jQuery(event.target).parents(".col-fields").eq(0) : null;  //No I18N
             if(formContainer && formContainer.length > 0) {
                 const fName = formContainer.attr("data-fname");  //No I18N
                 form.renderField(fName, true);
             } else {
                 form.renderForm(true);
             }
             window.showalert("success", translate("api.updated.success", [ form.options.entityName ]), "isAutoHide=true"); //No I18N
             $rc.reinitDetailsComponent();
         },
        /**
         * Delete the role. Used to delete the role, when role it assigned
         */
        // deleteRole : function(payload, form, event, promise){
        //     var _self = this;
        //     var roleObj = payload.roles.roles;
        //     var roles = Object.keys(roleObj);
        //     var roleId = roles.length ? "roles."+roles[0] : "";   // No I18N
        //     var roleData = roleObj[roles[0]];
        //     var newUserInRole = [];
        //     var associationId = [];

        //     if(roleData && !jQuery.isArray(roleData)){
        //         roleData = [];
        //         roleData.push(roleData);
        //     }
        //     if(form.fields[roleId] && form.fields[roleId].display_type == "multi_select"){
        //        if(form.fields[roleId] && form.fields[roleId].field_value){
        //             var field_value = form.fields[roleId].field_value;
        //             var currentValue = form.fields[roleId].current_value;
        //             if(jQuery.isArray(field_value) && field_value.length){
        //                 jQuery.each(field_value,function(i,value){
        //                     var removedUser = true;
        //                     jQuery.each(currentValue, function(j,cValue){
        //                         if(value.id == cValue.id){ removedUser = false; }
        //                     });
        //                     if(removedUser){
        //                         associationId.push(value.association_id);
        //                     }
        //                 });
        //             }else if(field_value.association_id){
        //                 associationId.push(field_value.association_id);
        //             }
        //         }
        //         if(roleData && roleData.length){
        //             var field_value = form.fields[roleId].field_value;
        //             jQuery.each(roleData,function(i,value){
        //                 var newUser = true;
        //                 jQuery.each(field_value, function(j,fValue){
        //                     if(value.id == fValue.id){ newUser = false; }
        //                 });
        //                 if(newUser){
        //                     newUserInRole.push(value);
        //                 }
        //             });
        //         }
        //         // if(newUserInRole.length == 0){
        //         //     promise.push(Promise.reject());
        //         // }else{
        //         payload.roles.roles[roles[0]] = newUserInRole;
        //         // }
        //     }else if(form.fields[roleId] && form.fields[roleId].display_type == "pick_list"){
        //         if(form.fields[roleId] && form.fields[roleId].field_value){
        //             var field_value = form.fields[roleId].field_value;
        //             field_value.association_id && associationId.push(field_value.association_id);
        //         }
        //     }

        //     if(associationId.length){
        //         var url = associationId.length === 1 ? $rc.base_url+ "/" +$rc.id+ "/roles/" +associationId : $rc.base_url+ "/" +$rc.id+ "/roles?ids=" +associationId;
        //         var p = new Promise(function(resolve,reject){
        //             sdpAjax({
        //                 url: url,
        //                 type: "DELETE"   // No I18N
        //              }).then(function(response){
        //                 if(form.fields[roleId].current_value == ""){
        //                     reject();
        //                 }
        //                 else{
        //                     resolve();
        //                 }
        //              });
        //         });
        //         promise.push(p);
        //     }
        // },
    },
    /**
     * Pre-data to construct note's template
     */
    getNotesTemplateData: function(tabName, tabSetting, tabs_panel){
        let _self = this;
        let obj = {};
        const stageName = tabs_panel.internal_name;
        obj.canAddNote = !_self.isTrashed && !_self.printPreview && (_self.stagePermissions["global"].view || !stageName); //common notes can be added without common edit perm
        obj.stage = stageName;
        return obj;
    },
    /**
     * Renders Notes sections
     */
    loadNotes: function(tabName, tabSetting, tabs_panel){
        let _self = this;
        const selectedStage = _self.stagesObject[tabs_panel.internal_name];
        const notesConfigFn = function(allowedStages){
            //Notes addition should be possible only if the user has view permission on that stage
            let stagesWithView=[];
            allowedStages.forEach(function(stage){
                if(_self.stagePermissions[stage.internal_name] && (_self.stagePermissions[stage.internal_name].view === true)){
                stagesWithView.push(stage);
                }
            });
            const notesConfig = {
                module: _self.entity_name+ "s",  //No I18N
                module_id: _self.id,
                container: "#"+(tabs_panel.internal_name ? tabs_panel.internal_name : '')+"_notes_section",  //No I18N
                only_notes: true,
                lazy_load: true,
                row_count: 10,
                show_count: 10,
                sort: {
                    order: "desc",  //No I18N
                    key: _self.printPreview ? "" : _self.entity_name+"_note_sort" //No I18N
                },
                expand: {
                    expand_panel: !!_self.printPreview
                },
                disable_header: true,
                notes: {
                    fields_required : ["added_by","added_time","last_updated_by","last_updated_time","stage","has_attachments"]  //No I18N
                },
                // metainfo: { "notes": _self.metainfo.fields.notes }, //No I18N
                selectedStage:selectedStage,
                stages:  stagesWithView,
                disableStage: !_self.stagePermissions.global.view,//when no common edit perm, only common notes can be added

                enable_mention: sdp_user.USERTYPE !== "Requester",    //No I18N
                mention_options: {autoCheck: false, users: {show: true, href: _self.base_url+"/"+_self.entity_name+"_requester", lookup_entity: _self.entity_name+"_requester"}},
                preview_mode: _self.printPreview || _self.isTrashed,
                showStageInPanel: !selectedStage,//showing stage name in common notes tab
                imgParameters: {module: _self.entity_name +"_note", withURL: false, noForm: true},  //No I18N
                afterLoadConversations: function(){
                    const hasNote = !!(this.complete_conversations && this.complete_conversations.length > 0);
                    if(!hasNote){
                        jQuery("#notes_section").hide();
                        jQuery("#no_note_template").removeClass("hide").addClass("show");
                    }
                    else{
                        jQuery("#content-details-inner-change").removeClass("oxa");
                    }
                },
                afterNoteAdd: function(){
                    if(jQuery("#notes_section").is(":hidden")){
                        jQuery("#notes_section").show();
                        jQuery("#no_note_template").removeClass("show").addClass("hide");
                    }
                }
            };
            _self.$notes_convComp = new Conversation(notesConfig);
        };
        //Added module check, as there is issue in api/v3/releases/1/notes/stage, stages not restricted based on wf setting
        if(_self.isChangeModule){
            let url = _self.base_url+"/"+_self.id+"/notes";
            _self.getStages(url).then(function(allowedStages){
                notesConfigFn(allowedStages);
            });
        }else{
            notesConfigFn(_self.stagesArray);
        }

        $CS.findElement("#change_notes_container").trigger("page:load"); //No I18N
    },
    /**
     * Renders Conversation sections
     */
    loadConversations: function(tabName, tabSetting, tabs_panel){
        this.initConversations(false);
    },
    /**
     * Initializes the conversation component
     */
    initConversations: function(isLite){
        let _self = this;
        const notificationConfigFn = function(allowedStages){
            let notificationConfig = {
                module: _self.entity_name +"s",  //No I18N
                module_id: _self.id,
                container: "#conversation_section",  //No I18N
                system_notifications: true,
                expand: {
                    expand_panel: !!_self.printPreview
                },
                selected_filters: ["email", "notes"], //No I18N
                lazy_load: true,
                sort: {
                    order: "desc",  //No I18N
                    key: _self.printPreview ? "" : _self.entity_name+"_conv_sort" //No I18N
                },
                show_count: 10,
                notes_count: 25,
                row_count: 10,
                allowed_operations: {
                    note: [],
                    email: ["reply","forward"]  //No I18N
                },
                "notes": {  //No I18N
                    fields_required : ["added_by","added_time","last_updated_by","last_updated_time","stage","has_attachments"]   //No I18N
                },
                imgParameters: {module: _self.entity_name +"_note", withURL: false, noForm: true},  //No I18N
                emailReply: function(data){

                    let mailConfig = {type: "reply", module: _self.entity_name, module_id: _self.id, sub_module_id: data.conv_id};  // NO I18N
                    mailConfig.afterNotificationSent = function(){
                        $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#conversations"));  // NO I18N
                        _self.$convComp.reinitialize();
                    };
                    mailConfig.imgParameters = {module: _self.entity_name +"_notification", withURL: false, noForm: true};  //No I18N
                    // To be handled commonly when change UI is implemented
                    mailConfig.user_fetch = {url: _self.base_url+ "/" +_self.id + '/release_requester', lookup_field: 'release_requester', search_keys: ['email_id']}; //No I18N
                    $notification_popup.openNotificationForm(mailConfig);
    //                    NewWindow('change/SendNotificationPopUp.jsp?module=changes&moduleId=' + _self.id + '&type=reply&notificationId=' + data.conv_id + '&to=' + data.conv_to + '&cc=' + data.conv_cc,'NotifyChange','950','550','yes','center');
                },
                emailForward: function(data){
                    var mailConfig = {type: "forward", module: _self.entity_name, module_id: _self.id, sub_module_id: data.conv_id};    // NO I18N
                    mailConfig.afterNotificationSent = function(){
                        $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#conversations"));  // NO I18N
                        _self.$convComp.reinitialize();
                    };
                    mailConfig.imgParameters = {module: _self.entity_name +"_notification", withURL: false, noForm: true};  //No I18N
                    // To be handled commonly when change UI is implemented
                    mailConfig.user_fetch = {url: _self.base_url+ "/" +_self.id + '/release_requester', lookup_field: 'release_requester', search_keys: ['email_id']}; //No I18N

                    $notification_popup.openNotificationForm(mailConfig);
    //                    NewWindow('change/SendNotificationPopUp.jsp?module=changes&moduleId=' + _self.id + '&type=forward&notificationId=' + data.conv_id,'NotifyChange','950','550','yes','center');
                },
                stages: allowedStages,
                disableStage: !_self.stagePermissions.global.view,
                enable_mention: sdp_user.USERTYPE !== "Requester",    //No I18N
                mention_options: {autoCheck: false, users: {show: true, href: _self.base_url+"/"+_self.entity_name+"_requester", lookup_entity: _self.entity_name+"_requester"}},
                preview_mode: _self.printPreview || _self.isTrashed,
                showStageInPanel: true,
                afterLoadConversations: function(){
                    jQuery(this.container).find('#conv_title').html(translate("common.filter"));
                }
            };
            if(_self._links.notes.post){
                notificationConfig.allowed_operations.note.push("add");
            }
            /* For quick actions add note */
            if(isLite){
                notificationConfig.lite = true;
                notificationConfig.afterNoteAdd = function(){
                    //After adding notes from action menu, page redirects to notes tab if it's change entity and conversations tab if the entity is release
                    var tabName = $rc.entity_name === "change" ? "#notes" : "#conversations"; // No I18N
                    $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash(tabName));
                };
                notificationConfig.afterLoad =function(instance){
                    instance.openNoteForm();
                };
            }
            if(_self.printPreview){
                notificationConfig.afterLoadConversations = function(){
                    jQuery(notificationConfig.container).find('[data-id="toggle-conv"],[data-id="sort"]').addClass("hide");
                }
            }
            _self.$convComp = new Conversation(notificationConfig);
        };
        //Added module check, as there is issue in api/v3/releases/1/notes/stage, stages not restricted based on wf setting
        if(_self.isChangeModule){
            let url = _self.base_url+"/"+_self.id+"/notes";
            _self.getStages(url).then(function(allowedStages){
                notificationConfigFn(allowedStages);
            });
        }else{
            notificationConfigFn(_self.stagesArray);
        }

    },
    /**
     * Initializes the conversation component for quick action Add Note
     */
    initConversationForQuickAddNote: function(){
        this.initConversations(true);
    },
    restoreEntity: function(){
        let _self = this;
        let restore_Entity = function (confirm) {
            const url = _self.base_url + "/" + _self.id + "/_restore_from_trash";
            if (confirm) {
                sdpAjax({
                    url: url, // No I18N
                    type: "PUT",  // No I18N
                    success: function (resp) {
                        if (resp.response_status && resp.response_status.status === "success") {
                            showalert("success", translate("common.restored", [e_html(_self.display_name)]), "isAutoHide=true");  //No I18N
                            $rc.reinitDetailsComponent();
                        }
                    }
                });
            }
        };
        showconfirm(true,'title='+translate("sdp.requests.restorerequests")+', message='+translate("common.restore.confirm", [e_html(_self.display_name)])+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',restore_Entity); //No I18N
    },
    loadZiaActions: function () {
        let _self = this;
        ziac.loadResource().then(function () {
            zia_list.moduleTblObj = {};
            zia_list.loadZiaForEntity(null, _self.moduleName, _self.id);
            setTimeout(function () {
                jQuery("#"+_self.moduleName+"_zia_notify").addClass("open") // No I18N
                .find('button').off('click.zia-icon').on('click.zia-icon', function () {    // No I18N
                    zia_list.loadZiaForEntity(this, this.getAttribute('data-module'), this.getAttribute('data-entity-id'));
                });
                jQuery("#"+_self.moduleName+"_zia_section").show().addClass("disp-ib"); // No I18N
            }, 500);
        });
    },
    /**
     * If status is changed during workflow, then need to refresh the page
     */
    checkIfpageNeedsRefresh: function(newData, oldData){
        return !!(newData.status === undefined || newData.status.id !== oldData.status.id || (newData.change_type && oldData.change_type && newData.change_type.pre_approved !== oldData.change_type.pre_approved));
    },
    /**
     * Opens user details
     * @param {String} userId User id to show the details
     */
    openUserDetails: function(userId) {
        $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + userId + '&minContent=true&externalframe=true', translate("sdp.inventory.wsRtPanel.userDetails"),'600px');  // No I18N
    },
    /*Passed this for bulk select for services once handled in component need to remove*/
    getAllowedValues: function(callback, form) {
        let _self = this;
        const base_url = _self.entity_name_pl + "/" + _self.id;
         form.allowedValues.services = ChangeReleaseForm.getEntityAll(base_url + '/services', null, 'services', {  //NO I18N
            "list_info": { //NO I18N
                "start_index": 1, //NO I18N
                "row_count": 100 //NO I18N
            }
        }, true);
    },
    //WorkFlow allowed values handling
    getWFAllowedValues: function(callback, form) {
        let _self = this;
        const base_url = _self.entity_name_pl + "/" + _self.id;
        form.allowedValues.workflow = ChangeReleaseForm.getEntityAll(base_url + '/workflow', null, 'workflow', { //NO I18N
            "list_info": { //NO I18N
                "start_index": 1, //NO I18N
                "row_count": 100 //NO I18N
            }
        }, true);
    },
    // Moved closeStatusForm & loadStatusForm from release_details.js to change_release_common.js to use in change
    closeStatusForm : function(form){
        if(form){
            form.destroy();
        }
        jQuery('#status_change_form').dialog('close'); // No I18N
    },
    /**
     * Stage/status change comment dialog
     */
    loadStatusForm: function(mode="edit"){
        let _self = this;
        //Destroy the old instance
        _self.$status_stage_FC && _self.$status_stage_FC.destroy();
        const requiredFields = ["stage","status","comment"];   // No I18N
        let mandatory = false;
        //Get mandatory value for the comment field
        _self.getTemplateInfo(_self.entity_data.template.id);
        _self.template.layouts[0].sections[0].fields.forEach(function(field){
          if(field.name === "comment"){
            mandatory = field.mandatory;
          }
        });
        const column_count = "1";

        const callbackFields = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
        const fieldsProperty = {
            stage : {
              mandatory : true,
              input_data_Callback: callbackFields.stage,
              sort: false,
                disabled:!_self.stagePermissions.global.approve
            },
            status : {
              mandatory : true,
              input_data_Callback: callbackFields.status,
              sort: false
            },
            comment : {
              mandatory : false,
              disabled : true
            }
        };
        const template = jQuery.extend(true,{},_self.constructTemplate(requiredFields,column_count,fieldsProperty,mode));
        template.layouts[0].sections[0].fields=template.layouts[0].sections[0].fields.filter(field => field.name !== "attachments"&&field.name!=="site"&&field.name!=="group");
        const form = "status_change_form"; // No I18N
        const title = translate("sdp.release.change.status"); // No I18N
        jQuery("#"+form).attr("title",title); // No I18N
        $CRObj.isCMCO=ChangeReleaseDetails.isCMCO;
        const skipEditFields = (_self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields) ? _self._links.edit.put.non_editable_fields : [];
        /* Load FC for editing status*/
        const configJSON = {
            template: template,
            entitydata: jQuery.extend(true,{},_self.entity_data),
            metadata: jQuery.extend(true,{},_self.metainfo),
            container: form,
            skipEditFields : skipEditFields,
            canEdit: !_self.isTrashed,
            mode : "edit", // No I18N
            formid: form+"_wrapper",   // No I18N
            dependentFields: [{
                fields: ["stage", "status"],  //No I18N
                order: true
            }],
            ffr:{
                hideFields:requiredFields,
                hideReverse:true,
                id:_self.entity_data.template.id,
                enable:true,
                entity:_self.moduleName.toUpperCase(),
                rerender:function(form){
                    $rc.closeStatusForm(form);
                },
                toggleMode:(form,event,mode)=>{
                    if(mode=="view"){
                        return false;
                    }
                }
            },
            edit: {
              onchange:{
                  stage: "ChangeReleaseForm.onChangeStage",//NO I18N
                  status:function(field, form)
                  {
                    if(mandatory){
                      form.addMandatoryField("comment");//NO I18N
                    }
                    form.fields.comment.disabled = !(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1);
                  }
              },
              fields:{
                status:{
                    pre: function(field, form){
                        delete field.default_value;
                    }
                }
                }
            },
            save: {
                submit: true,
                exit_alert: false,
                onsubmit: function(form){
                  const changedValues = form.getChangedValues();
                  if(jQuery.isEmptyObject(changedValues)){
                    _self.closeStatusForm(form);
                    return true;
                  }else{
                      //Focus comment box if field is empty
                      jQuery("#for_comment").focus();
                    return false;
                  }
                },
                cancel: function(fc)
                {
                  $rc.closeStatusForm(fc);
                },
                postsuccess: function (data, form){
                    _self.closeStatusForm();
                    if((form.fields.stage && form.fields.stage.isChanged) || (form.fields.status && form.fields.status.isChanged)){
                      _self.isStageChanged = true;
                    }
                    _self.reinitDetailsComponent();
                },
                serializer: "$rc.executeWhileSave",//NO I18N
            },
            afterRenderCallback: function(form){
              jQuery("#"+form.container).find('[data-id="form-fixed-wrapper"]').find(".form-wrapper").removeClass("p0 pb25").addClass("p15 pb10");
              $rc.$status_stage_FC.hideFieldToggle("sla_violation",true);// No I18N
              $rc.$status_stage_FC.hideFieldToggle("sla",true);// No I18N
            }
        };
        _self.$status_stage_FC=_self.initFormComponent(configJSON);
        setTimeout(function(){ showModal(form,525,false,false,false,true,280); jQuery('#status_change_form_wrapper [data-name="stage"]').append('<span class="ml5 cspr info icon-sm cur-ptr" rel="uitip" title="'+(_self.isChangeModule?translate('sdp.change.stage.edit.tooltip'):translate('sdp.release.stageandstatus.tooltip'))+'"></span>');initTooltip("#status_change_form_wrapper");},1); // No I18N
      },

    /**
   * Constructs template with given fields, if the template is not available in api for form component
   * @requiredfields - fields with which layout will be constructed
   * @column_count - no. of columns
   * @fieldsProperty - obj for specifying field extra property
   */
        constructTemplate : function(requiredFields,column_count,fieldsProperty,mode){
          let _self = this;
          let layouts = _self.template.layouts;
          let udf_fields=_self.template[this.moduleName.toLowerCase()].udf_fields;
          let stageName="Submission";// No I18N
          let template= {layouts:[]};
          let fields=[],lastIndex;
      let fieldsLayout = [];
          if(mode=="edit"){
            for(var i=0,len=layouts.length; i<len; i++){
                if(layouts[i].stage && layouts[i].stage.name === stageName){
                    template.layouts.push(layouts[i]);
                    break;
                }else if(layouts[i].name === stageName){
                    template.layouts.push(layouts[i]);
                    break;
                }
            }
            let inputDataCallbackObj = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
            template.layouts[0].sections.forEach(function(section,i){
                section.fields.forEach(function(field,j){
                    if (inputDataCallbackObj.hasOwnProperty(field.name)) {
                        field.input_data_Callback = inputDataCallbackObj[field.name];
                    }
                    if(udf_fields&&udf_fields.hasOwnProperty(field.name)){
                        field.context="udf_fields";// No I18N
                        fields.push(field);
                    }
                    else{
                        fields.push(field);
                    }
                    if (field.name === "comment") {
                        _self.isCommentMandatory = field.mandatory;
                        if (_self.editId) {
                            field.mandatory = false;
                        }
                    }
                });
            });
          }
      jQuery.each(requiredFields,function(i,field){
        let obj = {};
        obj.name = field;

        const colCount = (i+1)%column_count;
        const col = colCount ? colCount : column_count;
        obj.position = {"col": col,"col_size": 1,"row": i+1,"row_size": 1};

        if(fieldsProperty && fieldsProperty.hasOwnProperty(field)){
          jQuery.extend(true,obj,fieldsProperty[field]);
        }
            lastIndex= i;
            fieldsLayout.push(obj);
          });
          fields.forEach(function(field,i){
            if(requiredFields.indexOf(field.name)!=-1){
                return;
            }
            var obj = {};
            obj.name = field.name;

            var colCount = (lastIndex+1)%column_count;
            var col = colCount ? colCount : column_count;
            obj.position = {"col": col,"col_size": 1,"row": lastIndex++,"row_size": 1};
            if(!(fieldsProperty && fieldsProperty.hasOwnProperty(field))){
                jQuery.extend(true,obj,fieldsProperty[field]);
            }
            if(field.context&&field.context=="udf_fields"){
                obj.context=field.context;
            }
            if(field.mandatory){
                obj.mandatory=field.mandatory;
            }
        fieldsLayout.push(obj);
      });
      return {
        "layouts": [{ //NO I18N
            "column_count": 1, //NO I18N
            "sections": [{"column_count": column_count, "fields": fieldsLayout}] //NO I18N
        }]
      };
    },
    reinitDetailsComponent: function(entity_id){
          //When details component is re-rendered, all form component instance should be destroyed, otherwise form instance conflict will occur
          if(FC_Mapper && FC_Mapper.count > 0){
            let forms = Object.keys(FC_Mapper);
            forms.splice(forms.indexOf("count"),1);
            jQuery.each(forms, function(i, form){
              FC_Mapper[form].destroy();
            });
          }

          let opt = $rc.options;
          entity_id && (opt.id = entity_id);
          $rc.$detailsComp = null;
          $rc.init(opt);
    },
    onWorkFlowChange: function(field, form, event){
      let _self = this;
      //Don't show workflow change warning popup, if the workflow is changed from Not assigned.
      $rc.right_changed_values = form.getChangedValues();
      if(event.added) {
        $releaseForm.showWfChangeConfirmDialog(_self, form, event, function(){
            FC.submit(form.form);
        });
      }
      else {
        FC.submit(form.form);
      }
    },
    confirmScheduleValue:function(callback,message){
        showconfirm(true,'title='+translate("sdp.common.warning")+', message=' + message + ', submitbutton=' + translate("sdp.common.ok") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', callback);   // No I18N
    },
    getTabPathHash : function(hash){
        let params = this.getHashParams(hash), objectPath = "content_panel.tabs_panel.settings"; // No I18N
        if(params.length > 1){
          if(params[0] !== "history"){
            objectPath += ".stages.settings"; // No I18N
          }
          objectPath += "."+params[0]+".settings."+params[1];
        }else{
          objectPath += "."+params[0];
        }
        return objectPath;
    },
    afterTabRender : function(tabName, settings, panelObj){
        const _self = this;
        if(this.moduleName === 'Change'){
            if(!this.printPreview) {
                if ($rc.entity_data.stage.internal_name !== panelObj.internal_name) {
                    jQ("#statusActionBtn").attr('disabled', 'true');// No I18N
                } else {
                    jQ("#statusActionBtn").removeAttr('disabled');// No I18N
                }
            }
            if(this.printPreview && tabName==="associations" && panelObj.internal_name === 'Planning'){
                jQ("#Planning_print_content_associations").addClass("mt30");// No I18N
            }
        }
        if(this.printPreview || !$CRObj.doPush){
            //Remove height for worklogs in case of print preview
            if(this.moduleName === 'Change' && tabName==="worklogs")
            {
                jQ("#worklog_listview").removeAttr('style'); //No I18N
            }
          return;
        }
        let hashURL = panelObj.internal_name || "";
        hashURL = hashURL ? (hashURL + "/" + panelObj.active) : panelObj.active;
        if(this.moduleName === 'Change'){
        jQuery('[data-detail-tab="stages"]').trigger("click");
        }
        this.pushingStateURL("detail", this.id , panelObj.internal_name, hashURL); //No I18N


    },
    pushingStateURL :function(forwardTo, id, tabName, hashURL){
        let _self = this;
        let urlStr = "";  // No I18N
        function addParam(param) {
            urlStr += urlStr === "" ? _self.entity_name_pl+"?" : "&"; // No I18N
            urlStr += param;
        }

        if(id && id !== "null"){
            addParam("entity_id=" + id); // No I18N
        }

        if(forwardTo){
            addParam("mode=" + forwardTo); // No I18N
        }else{
          addParam("mode=get");// No I18N
        }
        if(hashURL){
            urlStr += "#"+hashURL;
        }
       window.history.pushState({'forwardTo' : forwardTo, module: this.entity_name, "entity_id": id, "tab": tabName, "hash" : hashURL, "spa_skipstate":true}, '', urlStr); // No I18N

    },
    /**
     * Actions - close dialog
     * @status - values can be completed/cancelled
     */
    showCloseDialog: function(status){
        let _self = this;
        let display_value;
        if(_self.isChangeModule){
            display_value = (status === "completed") ? _self._links.Close_completed.put.display_name : _self._links.Close_cancelled.put.display_name;  // No I18N
        }else{
            display_value = (status === "completed") ? _self._links.close_completed.put.display_name : _self._links.close_cancelled.put.display_name;  // No I18N
        }
        const templateData = {status: status, display_value: display_value, $rc: _self};
        const templateName = _self.isChangeModule ? "change_close_template" : "release_close_template"; // No I18N
        let html = renderhbs(null, templateName, templateData, false, _self.entity_name, true, true, null, true);
        _self.statusCommentDialog(html);
        if(_self.isChangeModule && !_self.isCommentsMandatory(_self.template)){
            jQ('#CloseEntity .mandatory.ml4').addClass('hide');// No I18N
        }
    },
    statusCommentDialog: function(html){
        jQuery(html).dialog({
            'width':'400',   // No I18N
            'modal':'true',    // No I18N
            'resize':'false',   // No I18N
            'close': function (e) {   // No I18N
                jQuery(this).empty();
                jQuery(this).dialog('destroy');   // No I18N
            }
        });
    },
    getStatus: function(stageId){
        let _self = this;
        const inputObject = {"list_info":{"search_criteria":{"field": "stage", "value": stageId, "condition": "is"}}}; // No I18N
        const dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
            url: _self.base_url + "/" + _self.id + "/status" , // No I18N
            data: dataVal,
            success: function(resp) {

                if(resp.response_status && resp.response_status[0].status === "success"){
                    _self.status  = resp.status;
                }
            },
            async: false
        });
    },
    afterQuickActionsRender: function(){
        jQuery("#actions_list").find(".sublist:not(:has(*))").parent().remove();
    },
    /**
     * Refreshes counts in left panel sections - tasks/worklogs/reminders
     * @entity - entity for which count should be shown
     */
    refreshLeftPanelCount: function(entity){
        let _self = this;
        if(_self.printPreview){
            return;
        }
        const entitySummary = _self.fetchEntitySummary();
        switch(entity){
        case 'task':  // No I18N
            renderhbs("#task_summary_count", _self.isChangeModule ? "change_task_summary_template" : "release_task_summary_template", entitySummary, false, _self.entity_name, true);  //NO I18N
        case 'worklog':  // No I18N
            renderhbs("#worklog_summary_count", _self.isChangeModule ? "change_worklog_summary_template" : "release_worklog_summary_template", entitySummary, false, _self.entity_name, true);  //NO I18N
        case 'reminder':  // No I18N
            renderhbs("#reminder_summary_count", _self.isChangeModule ? "change_reminder_summary_template" : "release_reminder_summary_template", entitySummary, false, _self.entity_name, true);  //NO I18N
        default:
            return;
        }
    },
    removeImageToken: function(description){
        if(description && description !== ""){
            description = description.replace(/src="(.*?)"/g, function(match1, match2){
                return "src="+"\""+match2.match(/^[^?]*/)[0]+"\""; //NO I18N
            });
        }
        return description;
    },
    loadApprovalSection : function(){
        const urlParams = $CRObj.urlParams;
        let _self = this;
        jQuery("#approval_print_content").append("<input type='hidden' id='approvalLevelId' value='"+e_attr(urlParams.approvals_level)+"'/><input type='hidden' id='approvalId' value='"+e_attr(urlParams.approval)+"'/><input type='hidden' id='currentTask' value='AppApprove'/>"); // No I18N
        MLAComponent.prototype.approveRejectPopup("home",e_param(urlParams.approvals_level), "",e_param(urlParams.approval), this.entity_name+"s" ,this.id, function(){ // No I18N
          window.top.$previewComponent.closePreview(_self.entity_name+"_approval"); // No I18N
          window.top.showalert("success", translate("sdp.approval.action.sucess.msg"),"isAutoHide=true");// No I18N
          window.top.$home_page.processApprovals();
        });
        jQuery("#approve_level_cancel").on("click", function(){ // No I18N
          window.top.$previewComponent.closePreview(_self.entity_name+"_approval"); // No I18N
        });
    },
    /*Execute function while click save/update button*/
    executeWhileSave: function(payload, form, event) {
        let _self = this;
        //Append status if there is no status value while comment has value in payload
        if(payload[_self.entity_name].hasOwnProperty("comment") && !payload[_self.entity_name].hasOwnProperty("status")){
            payload[_self.entity_name].status = {"id" : form.fields.status.current_value.id};
        }
    },
    formatResultForToolTip: function(item, tooltipNotRequired,showMailIdInDropdown) { // Override formatResult method to display toolTip
        let email_id = item.email_id;
        let employee_id = item.employee_id;
        if (!item.email_id) {
            email_id = '-';
        }
        if (!item.employee_id) {
            employee_id = '-';
        }
        let text;
        if (item.id) {
            text = "<div><b>Name : </b><span>" + e_attr(item.name) +"</span><br><b>Email : </b><span>" + e_attr(email_id) +"</span><br><b>Employee Id : </b><span>" + e_attr(employee_id) + "</span><br></div>"; //NO I18N
        }
        //Adding tooltip for selected value
        let $span = jQuery("<span>", { "html": e_html(item.name) }); //NO I18N
        if(!tooltipNotRequired){
          $span = jQuery("<span>", { "title": text, "html": '<div class="disp-c pr10 vmiddle fw"><div class="bk-truncate">'+e_html(item.name)+'</div>'+(showMailIdInDropdown && item.email_id?'<div class=" bk-truncate">'+e_html(item.email_id)+'</div>':'') }); //NO I18N
        }
        $span.uitooltip({
            content: function() {
                let element = jQuery(this);
                return element.attr('title'); //NO I18N
            },
            track: true,
            show: {
                delay: 250
            },
            tooltipClass: 'uitip' //NO I18N
        });
        return $span;
    },
    processResultsForToolTip: function(data) { // Override processResult to retrieve desired results in toolTip
        const name = data.name || data.display_name || data.text || data.value;
        return {
            id: data.id || name,
            name: name,
            email_id: data.email_id || null,
            employee_id: data.employee_id
        };
    },

    loadDownTimeSchedule: function(tabName, tabSetting, tabs_panel){
    let _self = this;
    /* Downtime data will be fetched already in fn loadScheduleData */
    let downtimeObj = _self.downtime;
    let stageName = tabs_panel && tabs_panel.internal_name;
    let isImplementation = (stageName === "Implementation"); // No I18N
    let isReleaseOrDeployment = stageName.toLowerCase() === "release" || stageName.toLowerCase() === "deployment"; // No I18N
    let canEdit = downtimeObj.canEdit;
    //Setting is_downtime attribute to decide to display the downtime schedules in the list view. Downtime schedules will be displayed in the listview only if is_downtime is true.
    this.getAllDowntimes(downtimeObj,function (data){
    for(key in data)
    {
    var is_downtime =data[key].is_downtime;
    if(is_downtime === true){
    downtimeObj.isDowntime = true;
    break;
    }
    }
    });
    downtimeObj.initTableComponent = function(){
    let table_content = {};
    let t_info ={};
    if(isReleaseOrDeployment){
    t_info = getPersonalizeData("release_stage_downtimes")? getPersonalizeData("release_stage_downtimes") : {};
    }
    else{
        t_info = getPersonalizeData("planning_stage_downtimes")? getPersonalizeData("planning_stage_downtimes") : {};
    }
    if(jQuery.isEmptyObject(t_info)){
    t_info = {
    "list_info" : { //No I18N
    "row_count" : "10",  //NO I18N
    "start_index": 1, // No I18N
    "get_total_count":"true", // No I18N
    "sort_field":"id", // No I18N
    "sort_order":"desc" // No I18N
    },
    fields_required : {"description" : "", "downtime_type" : "","is_downtime":"","patch_version":"","service_to_be_down":"","configuration_items":"","downtime_scheduled_start":"","downtime_scheduled_end":""},  //No I18N
    column_order : ["configuration_items","service_to_be_down","downtime_type","patch_version","description","is_downtime","downtime_scheduled_start","downtime_scheduled_end"]  //No I18N
    }
    if(isReleaseOrDeployment){
    t_info.fields_required = {"description" : "", "downtime_type" : "","is_downtime":"","downtime_scheduled_start":"","downtime_scheduled_end":"","patch_version":"","downtime_actual_start":"","downtime_actual_end":"","service_to_be_down":"","configuration_items":""},  //No I18N
    t_info.column_order = ["configuration_items","service_to_be_down","downtime_type","patch_version","description","is_downtime","downtime_scheduled_start","downtime_scheduled_end","downtime_actual_start","downtime_actual_end"];  //No I18N
    }
    }
    if(!sdp_app.IS_CMDB_ENABLED){
            delete t_info.fields_required.configuration_items;
            const index = t_info.column_order.indexOf("configuration_items");
            if (index !== -1) {
              t_info.column_order.splice(index, 1);
            }
    }
    t_info.stage = stageName;
    table_content.header = this.headerdataConstruct();
    let options = {};
    options.isODAPI = true;
    options.tableHolder = tabSetting && tabSetting.id ? tabSetting.id : "downtimes"; //No I18N
    options.getmetaInfo = true;
    options.metainfo_entity = _self.entity_name+"s/" +_self.id+ "/downtimes";  //No I18N
    options.paginationEnabled = true;
    options.sortingEnabled = true;
    options.personalize_key = isReleaseOrDeployment ? "release_stage_downtimes" : "planning_stage_downtimes"; //No I18N
    options.columnChooserEnabled = true;
    options.searchEnabled = true;
    options.callbackRowfunction = this.rowDataConstruct;
    options.defaultpath = _self.base_url+ "/" +_self.id+ "/"; // No I18N
    options.deleteURL = options.callbackURL = options.entity_name = "downtimes"; // No I18N
    options.row_inputdata = this.rowDataConstruct(t_info);
    options.isFR_ListInfo_Support = true;
    options.callbackAfterInitialRender = function(){
    jQuery("#pagination_comp_downtimes").find(".btn-group:first").addClass("fl mr10");
    jQuery("#deleteicon_downtimes").addClass("mr10");
    jQuery("#downtimes_div").css({"padding-bottom":"130px"}); // No I18N
    };
    //Permission based configs
    options.multiDeleteEnabled = canEdit;
    options.nodatabanner_callback = function(){
    if($rc.printPreview){
    return '<div class="alert-nodata"><div class="msg">' + translate('sdp.changedetails.nodowntime.msg') + '&nbsp;</div></div>';
    }
    return true;
    }
    this.$downtime_tableComp = new tableComponent(t_info, table_content, options);
    },
    downtimeObj.rowDataConstruct = function(tableinfo){
    let inputObject = {};
    let fields_required_array = Object.keys(tableinfo.fields_required);
    inputObject.list_info = tableinfo.list_info;
    inputObject.fields_required = fields_required_array;
    inputObject.stage = tableinfo.stage;
    return inputObject;
    },
    downtimeObj.headerdataConstruct = function() {
    let meta_data = {
    "downtimes_head_chk": { // No I18N
    "type": 'checkbox', // No I18N
    "default": true, // No I18N
    "dataCelltransformer": this.constructCheckbox //No I18N
    },
    "actioncell": { //No i18N
    "default": true, // No I18N
    "column_settings": {"position": 1}, // No I18N
    "dataCelltransformer": this.constructActionCell, // No I18N
    "type": "icon", // No I18N
    "hide_label": true,  //No I18N
    "text": translate("common.edit") // No I18N
    },
    "description": { // No I18N
    "frommeta" : true, //NO I18N
    "width": "200px" //NO I18N
    },
    "is_downtime": { // No I18N
    "frommeta" : true, //NO I18N
    "width": "100px" //NO I18N
    },
    "patch_version": { // No I18N
    "frommeta" : true, //NO I18N
    "width": "150px" //NO I18N
    },
    "downtime_type" : { // No I18N
    "frommeta" : true, //NO I18N
    "width": "200px" //NO I18N
    },
    "deployment_scheduled_start": { // No I18N
    "frommeta" : true, //NO I18N
    "td_class" : "pos-rel",//NO I18N
    "width": "200px" //NO I18N
    },
    "deployment_scheduled_end": { // No I18N
    "frommeta" : true, //NO I18N
    "td_class" : "pos-rel",//NO I18N
    "width": "200px" //NO I18N
    },
    "downtime_scheduled_start": { // No I18N
    "frommeta" : true, //NO I18N
    "td_class" : "pos-rel",//NO I18N
    "width": "200px" //NO I18N
    },
    "downtime_scheduled_end": { // No I18N
    "frommeta" : true, //NO I18N
    "td_class" : "pos-rel",//NO I18N
    "width": "200px" //NO I18N
    },
    "service_to_be_down":{//no i18n
    "frommeta" : true, //NO I18N
    "width": "200px",                         //NO I18N
    "dataCelltransformer": this.constructServiceAffected, //No I18N
    "sortable":false //no i18n

    },
    "configuration_items":{//no i18n
    "frommeta":true, //NO I18N
    "width":"200px", //NO I18N
    "dataCelltransformer":this.constructConfigurationItems, //No I18N
    "sortable":false //no i18n
    }
    };
    if (isReleaseOrDeployment) {
    Object.assign(meta_data, {
    "deployment_actual_start": { // No I18N
    "frommeta": true, // No I18N
    "td_class": "pos-rel", // No I18N
    "width": "200px" // No I18N
    },
    "deployment_actual_end": { // No I18N
    "frommeta": true, // No I18N
    "td_class": "pos-rel", // No I18N
    "width": "200px" // No I18N
    },
    "downtime_actual_start": { // No I18N
    "frommeta": true, // No I18N
    "td_class": "pos-rel", // No I18N
    "width": "200px" // No I18N
    },
    "downtime_actual_end": { // No I18N
    "frommeta": true, // No I18N
    "td_class": "pos-rel", // No I18N
    "width": "200px" // No I18N
    }
    });
    }
    /* Handling for both change & release*/
    if(!canEdit || isImplementation || (isReleaseOrDeployment && _self.activeStage != stageName)){
    delete meta_data.downtimes_head_chk;
    delete meta_data.actioncell;
    }
    return meta_data;
    },
    downtimeObj.constructCheckbox = function(tdata){
    let rdata = tdata.row_data;
    return '<label class="clcheckbox vmiddle"> <input type="checkbox" value=' + e_attr(rdata.id) + ' data-table-checkbox></label>';
    },
    //method to construct data for Service affected column as comma separated values.
    downtimeObj.constructServiceAffected = function(tdata) {
    let rdata = tdata.row_data.service_to_be_down;
    let concatenatedString = rdata.map(function(item) {
        return item.name;
        }).join(', ');
    // Check if concatenatedString is empty
    if (!concatenatedString) {
    concatenatedString =  translate("sdp.request.common.notassigned");
    }
    const tooltipString = e_attr(concatenatedString); // The tooltip will show the full concatenated string
    const displayString = e_html(concatenatedString);
    // Creating a span element with a tooltip
    const spanElement ='<span rel="uitip" title="'+ tooltipString + '">' + displayString + '</span>';
    return spanElement;
    },
    //method to construct data for configuration items column as comma separated values.
    downtimeObj.constructConfigurationItems = function(tdata) {
    let rdata = tdata.row_data.configuration_items;
    let concatenatedString = rdata.map(function(item) {
        return item.name;
    }).join(', ');
    // Check if concatenatedString is empty
    if (!concatenatedString) {
    concatenatedString = translate("sdp.request.common.notassigned");
    }
    const tooltipString = e_attr(concatenatedString); // The tooltip will show the full concatenated string
    const displayString = e_html(concatenatedString);
    // Creating a span element with a tooltip
    const spanElement ='<span rel="uitip" title="'+ tooltipString + '">' + displayString + '</span>';
    return spanElement;
    },
    downtimeObj.constructActionCell = function(table_data){
    var rd = table_data.row_data;
    var onClickEdit = "$rc.downtime.showDowntimeForm("+ rd.id +")"; // No I18N
    var col_str = '<div class="btn-group tc-req-edit bs-noconflict top1 cur-ptr"> <a class="cspr menulist icon-xs sdmenu-toggle vtop pos-rel" data-switch="sdmenu" title="' + translate("sdp.common.actions") + '" ></a>' +
    '<ul class="sdmenu-dd" role="menu">'; // No I18N
    col_str += '<li><a data-event="click" data-handler='+onClickEdit+' nonce="' + sdpNonce + '" data-release data-cs-field="edit_downtime_release" data-i18n-key="sdp.common.edit">' + translate("sdp.common.edit") + ' </a></li>';// No I18N
    if(downtimeObj.stage.toLowerCase()!=="release" && downtimeObj.stage.toLowerCase()!== "deployment"){
    col_str += '<li><a href="/" data-cs-field="delete_downtime"  data-i18n-key="sdp.common.delete" data-entityid='+ rd.id +' data-table-delete>' + translate("sdp.common.delete") + '</a></li>';// No I18N
    }
    col_str +='</ul></div>';// No I18N
    return col_str;
    },
    downtimeObj.showDowntimeForm = function(id){
    downtimeObj.initFC(id);
    jQuery("#downtimeform").dialog({  //No I18N
    modal: true,
    closeOnEscape: false,
    draggable: true,
    position: { my: 'center', at: 'center' }, //No I18N
    width: "600",   // No I18N
    appendTo: "#downtime_details",  // No I18N
    close:function(){
    _self.$downtimeFC &&  _self.$downtimeFC.destroy();
    jQuery("#downtimeform").dialog("destroy"); // No I18N
    },
    title: id ? translate("sdp.change.editdowntime") : translate("sdp.change.adddowntime") // No I18N
    });
    },
    downtimeObj.updateActualDowntime = function(){
    let isValidDowntime = false;
    let isValidDeployment = false;
    let self = this;
    let tableComp = self.$downtime_tableComp;
    let selectedIds = jQ("#downtimes_body input[type='checkbox'][data-table-checkbox]:checked").map(function() {  // No I18N
    let val = this.value;
    if(tableComp.loadedRecords[val].deployment_scheduled_start&& tableComp.loadedRecords[val].deployment_scheduled_end){
    isValidDeployment = true;
    }
    if(tableComp.loadedRecords[val].downtime_scheduled_start && tableComp.loadedRecords[val].downtime_scheduled_end){
    isValidDowntime = true;
    }
    return this.value;
    }).get();
    let updateActual = function(confirm){
    if(confirm){
    let getSuccessCount = function(resp){
    let count = 0;
    jQuery.each(resp, function(i, response){
    if(response.status === "success"){
    count++;
    }
    });
    return count;
    };
    sdpAjax({
    url: downtimeObj.base_url+ "/_copy_scheduled_to_actual?ids="+selectedIds,  // No I18N
    type: 'PUT',  // No I18N
    success: function(resp){
    let response_status = resp.response_status;
    let count = getSuccessCount(response_status);
    showalert("success", getMessageForKey("sdp.release.downtime.copy.scheduletoactual", [count]), "isAutoHide=true"); //TODO  //No I18N
    downtimeObj.$downtime_tableComp.refreshTable(); //refresh table component
    },
    ignorefailuremessage: true,
    failedCallBack: function(jqXHR, status){
    let resp = jqXHR.responseJSON.response_status;
    let count = getSuccessCount(resp);
    if(count>=1){
    showalert("success", getMessageForKey("sdp.release.downtime.copy.scheduletoactual", [count]), "isAutoHide=true"); //TODO  //No I18N
    }else{
    showalert("failure", translate("sdp.release.downtime.copy.scheduletoactual.noupdate"), "isAutoHide=true"); //No I18N
    }
    downtimeObj.$downtime_tableComp.refreshTable(); //refresh table component
    }
    });
    }
    };
    if(isValidDowntime || isValidDeployment){
    showconfirm(true,'title='+getMessageForKey("common.confirm")+', message='+getMessageForKey("release.downtime.confirm.copyscheduletime")+', submitbutton='+getMessageForKey("sdp.common.ok")+', cancelbutton='+getMessageForKey("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',updateActual); //No I18N
    }else if(!isValidDeployment && !isValidDowntime){
    showconfirm(true,'message='+getMessageForKey("api.downtime.copy.errormsg")+', cancelbutton='+getMessageForKey("sdp.common.ok")+', closebutton=no, closeOnEscKey=yes', function(){return;}); //No I18N
    }
    },
    jQuery.validator.addMethod(
        "startCompare",   // No I18N
        function (value, element, param) {
            var endVal = jQuery(param).val();
            if (!endVal) {
                return true; // If end value is not present, skip validation
            }
            return parseFloat(value) < parseFloat(endVal);
        },
        translate("api.validation.scheduledstart.scheduledend") // No I18N
    ),
    /** Downtime scheduled start should be within deployment start and end - validator */
jQuery.validator.addMethod(
"downtimeWithinDeployment",   // No I18N
function (value, element, params) {
var deploymentStart = jQuery(params[0]).val(); // Deployment Scheduled Start
var deploymentEnd = jQuery(params[1]).val();   // Deployment Scheduled End

if (!deploymentStart || !deploymentEnd || !value) {
return true; // Skip validation if deployment times are not available
}

var downtimeStart = parseFloat(value);
deploymentStart = parseFloat(deploymentStart);
deploymentEnd = parseFloat(deploymentEnd);

return downtimeStart >= deploymentStart && downtimeStart <= deploymentEnd;
},
translate("change.release.downtime.deployment.validation",["Downtime","Deployment"]) // No I18N
),
jQuery.validator.addMethod(
"downtimeEndWithinDeployment",   // No I18N
function (value, element, params) {
var deploymentStart = jQuery(params[0]).val(); // Deployment Scheduled Start
var deploymentEnd = jQuery(params[1]).val();   // Deployment Scheduled End

if (!deploymentStart || !deploymentEnd || !value) {
return true; // Skip validation if deployment times are not available
}

var downtimeEnd = parseFloat(value);
deploymentStart = parseFloat(deploymentStart);
deploymentEnd = parseFloat(deploymentEnd);

return downtimeEnd >= deploymentStart && downtimeEnd <= deploymentEnd;
},
translate("change.release.downtime.deployment.validation",["Downtime","Deployment"]) // No I18N
),
/** Ensure Deployment Scheduled Start is before both Downtime Scheduled Start and End */
jQuery.validator.addMethod(
"deploymentStartBeforeDowntime",  // No I18N
function (value, element, params) {
var downtimeStart = jQuery(params[0]).val();   // Downtime Scheduled Start
var downtimeEnd = jQuery(params[1]).val();     // Downtime Scheduled End

if (!downtimeStart || !downtimeEnd || !value) {
return true; // Skip validation if any required values are missing
}

deploymentStart = parseFloat(value);
downtimeStart = parseFloat(downtimeStart);
downtimeEnd = parseFloat(downtimeEnd);

return deploymentStart <= downtimeStart && deploymentStart <= downtimeEnd;
},
translate("change.release.downtime.deployment.validation",["Downtime","Deployment"]) // No I18N
),

/** Ensure Deployment Scheduled End is after both Downtime Scheduled Start and End */
jQuery.validator.addMethod(
"deploymentEndAfterDowntime",  // No I18N
function (value, element, params) {
var downtimeStart = jQuery(params[0]).val();   // Downtime Scheduled Start
var downtimeEnd = jQuery(params[1]).val();     // Downtime Scheduled End

if (!downtimeStart || !downtimeEnd || !value) {
return true; // Skip validation if any required values are missing
}

deploymentEnd = parseFloat(value);
downtimeStart = parseFloat(downtimeStart);
downtimeEnd = parseFloat(downtimeEnd);

return deploymentEnd >= downtimeStart && deploymentEnd >= downtimeEnd;
},
translate("change.release.downtime.deployment.validation",["Downtime","Deployment"]) // No I18N
),


    downtimeObj.initFC = function(id){
    /* Destroy the old instance*/
    _self.$downtimeFC &&  _self.$downtimeFC.destroy();
    let template = downtimeObj.constructDowntimeTemplate();
    let url = id ? downtimeObj.base_url+ "/" +id : downtimeObj.base_url;//NO I18N
    _self.getMetaInfo(url, downtimeObj);
    let downtimeLinks = {};
    let disableFields = [];
    if(!_self.isNonLogin && id){
    _self.getLinks(url, downtimeLinks);
    }
    /* downtimeObj._links has links data related to downtime links */
    /* downtimeLinks._links has links data related to specific downtime id */
    let skipFields = (downtimeObj._links && downtimeObj._links.add && downtimeObj._links.add.post && downtimeObj._links.add.post.non_editable_fields) || [];
    disableFields = (downtimeLinks._links && downtimeLinks._links.edit && downtimeLinks._links.edit.put && downtimeLinks._links.edit.put.non_editable_fields) || [];
    if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
    !disableFields.includes("configuration_items") && disableFields.push("configuration_items");   // No I18N
    }
    if(!sdp_app.IS_CMDB_ENABLED){
        skipFields.push("configuration_items");
    }
    let downtime = id ? downtimeObj.getDowntime(id) : null;
    let configJSON = {
    entitydata: downtime,
    template: template,
    metadata: downtimeObj.metainfo,
    entityName: downtimeObj.display_name,
    container: "downtimeform",   // No I18N
    canEdit: _self.downtime.canEdit,
    mode: id ? "edit" : "new",  // No I18N
    formid: downtimeObj.entity_name,
    skipFields : skipFields,
    edit: {
    onchange:{
    //handling done to hide downtime schedules if is_downtime is false
    is_downtime: function(downtimeObj) {
    const elements = [
    'downtime_scheduled_start', //no i18n
    'downtime_scheduled_end', //no i18n
    'downtime_actual_start',//no i18n
    'downtime_actual_end'//no i18n
    ];
    elements.forEach(function(fname) {
    const action = downtimeObj.current_value ? 'removeClass' : 'addClass';//no i18n
    jQuery(`[data-fname="${fname}"]`)[action]('hide');//no i18n
    });
    }
    },
    defaults: {
    lookup: {
    placeholder:translate('sdp.change.sla.select')
    }
    },
    fields: {
    service_to_be_down:{
    selection_icon_class:"hide",//NO I18N
    help_text: translate("change.downtime.helptext",["Services",_self.entity_name === 'change'?"Change":"Release"])
    },
    configuration_items:{
    selection_icon_class:"hide",//NO I18N
    help_text: translate("change.downtime.helptext",["CIs",_self.entity_name === 'change'?"Change":"Release"])
    },
 deployment_scheduled_end:{
        custom_rules: [
            {"rule_name": "endCompare", "rule_value": "#deployment_scheduled_start_IN","rule_msg": translate("api.validation.scheduledend.scheduledstart") //NO I18N
        }
        ]
    },
    downtime_scheduled_start:{
        custom_rules:[
            {
                "rule_name":"downtimeWithinDeployment","rule_value":["#deployment_scheduled_start_IN","#deployment_scheduled_end_IN"] //no i18n
            }
        ]
    },
    downtime_scheduled_end:{
        custom_rules:[
            {
                "rule_name":"downtimeEndWithinDeployment","rule_value":["#deployment_scheduled_start_IN","#deployment_scheduled_end_IN"]//no i18n
            },
            {
                "rule_name": "endCompare", "rule_value": "#downtime_scheduled_start_IN","rule_msg": translate("api.validation.scheduledend.scheduledstart")  //NO I18N
            }
        ]
    },
    deployment_actual_end:{
        custom_rules: [
            {"rule_name": "endCompare", "rule_value": "#deployment_actual_start_IN","rule_msg": translate("api.validation.scheduledend.scheduledstart")}   //NO I18N
        ]
    },
    downtime_actual_start:{
        custom_rules:[
            {
                "rule_name":"downtimeWithinDeployment","rule_value":["#deployment_actual_start_IN","#deployment_actual_end_IN"]//no i18n
            }
        ]
    },
    downtime_actual_end:{
        custom_rules:[
            {
                "rule_name":"downtimeEndWithinDeployment","rule_value":["#deployment_actual_start_IN","#deployment_actual_end_IN"]//no i18n
            },
            {
                "rule_name": "endCompare", "rule_value": "#downtime_actual_start_IN","rule_msg": translate("api.validation.scheduledend.scheduledstart")  //NO I18N
            }
        ]
    }
    }
    },
    save: {
    url: url,
    entity: downtimeObj.entity_name,
    exit_alert: false,
    submit: true,
    submitbutton:{
    add: getMessageForKey('sdp.common.save')
    },
    onsubmit: function(form){
    if(form.getFieldValue('description') === ''){
    jQuery('#for_description').focus()
    }
    if(form.getFieldValue('is_downtime') == false){
    if(form.getFieldValue('downtime_scheduled_start')!== "" && form.getFieldValue('downtime_scheduled_start')!== null){
    form.setFieldValue("downtime_scheduled_start","");//no i18n
    }
    if(form.getFieldValue('downtime_scheduled_end')!== "" && form.getFieldValue('downtime_scheduled_end')!== null){
        form.setFieldValue("downtime_scheduled_end","");//no i18n
    }
    }
    },
    postsuccess: function(){
    downtimeObj.closeForm();
    _self.reinitDetailsComponent();
    },
    cancel: "$rc.downtime.closeForm"  // No I18N
    },
    afterRenderCallback: function(form){
    jQuery.each(disableFields, function(i, field){
    form.fields[field] && (form.fields[field].disabled = true);
    });
    const isDowntime = document.querySelector('p[data-name="is_downtime"]').getAttribute('data-value') === "true"; //no i18n
    const elements = [
    '[data-fname="downtime_scheduled_start"]', //no i18n
    '[data-fname="downtime_scheduled_end"]',//no i18n
    '[data-fname="downtime_actual_start"]',//no i18n
    '[data-fname="downtime_actual_end"]'//no i18n
    ];
    elements.forEach(function(selector) {
    jQuery(selector).toggleClass('hide', !isDowntime);//no i18n
    });
    _self.$downtimeFC.focusField("description");//No I18N
    jQuery('[data-id="form-fixed-wrapper"]').addClass("pb0"); //No I18N
    jQuery('input[name="is_downtime"]').css('margin-top', '-5px');//no i18n
    jQuery("#downtimeform").find(".main-pane").addClass("pr30 oya").removeClass("disp-c").css("max-height","465px").end().find("div[data-name=form-footer]").addClass("sticky-form-footer");  //No I18N
    }
    };
    _self.$downtimeFC = _self.initFormComponent(configJSON);
    },
    downtimeObj.constructDowntimeTemplate = function(){
    let requiredfields = ["description","configuration_items","service_to_be_down","patch_version","downtime_type","deployment_scheduled_start","deployment_scheduled_end","is_downtime","downtime_scheduled_start","downtime_scheduled_end","deployment_actual_start","deployment_actual_end","downtime_actual_start","downtime_actual_end"];   // No I18N
    let column_count = "1";
    let fieldsProperty = {
    downtime_type : {
    sort: false
    },
    configuration_items : {
    sort: false
    },
    service_to_be_down : {
    sort: false
    }
    };
    let template = _self.constructTemplate(requiredfields, column_count, fieldsProperty);
    return template;
    },
    downtimeObj.getDowntime = function(id){
    let downtime;
    sdpAjax({
    url: downtimeObj.base_url+ "/" +id,
    type: "GET", // No I18N
    success: function(resp){
    if(resp.response_status && resp.response_status.status == "success"){
    downtime = resp.downtime;
    }
    },
    async: false
    });
    return downtime;
    },
    downtimeObj.closeForm = function(){
    jQuery("#downtimeform").dialog("close");  //No I18N
    };
    //Intialize the downtime table component
    downtimeObj.initTableComponent();
    }
};

var ChangeReleaseForm = {
    postDataAdded: function (data, form) {
        let _self = this;
        if (data && data.response_status && (data.response_status.status === "success" || data.response_status.status === "warning" || (jQuery.isArray(data.response_status) && data.response_status[0].status === "success"))) {
            if(_self.entityName === 'change' && _self.from == "request" && form.mode === "new") {
                const parent = $extFrame.getActiveWindow();
                parent.showalert("success", translate("sdp.project.executeaction.chgassociation.lvname"), "isAutoHide=true, delay=3"); //No I18N
                parent.$previewComponent.closePreview("newchange_popup");// No I18N
                if(_self.from == "request") {
                    parent.req_details && parent.$req.details.updateRequestTemplates('change');	//No I18N
                    parent.jQuery('#notassociate_newchange').is(":visible") && parent.showChangeDialog(parent.WOID); //NO I18N
                }
                return;
            }
            form.entitydata = data[_self.entityName];
            if(_self.from === "copychange"){
                showalert("success", translate("sdp.copy.change.successmessage"), "isAutoHide=true"); //NO I18N
                form.hideCopyButton=true;
                setTimeout(function(){window.top.location.href= "/ui/changes?entity_id=" +data.change.id+ "&mode=detail";},3000);
            }
            else{
                if (form.mode === "new") {
                    let response = _self.getEntityAll(_self.entityNamePl, data[_self.entityName].id);
                    if (response.response_status && response.response_status.status === "failed" && response.response_status.messages && response.response_status.messages[0].status_code === 4002) {
                        showalert("success", getMessageForKey("common.createandnoview.permission.message", [getMessageForKey("sdp.common.success"), _self.display_name, Number(data[_self.entityName].id), _self.display_name]), "isAutoHide=false"); //No I18N
                        if (_self.isChangeModule) {
                            window.history.pushState({"spa_skipstate": true}, "", "/Changes.cc"); // No I18N
                            $CRObj.redirectTo(_self.entityName, "list");//No I18N
                        } else {
                            $CRObj.redirectTo(_self.entityName, "list", null, null, "entity_not_exists");//No I18N
                        }
                    } else {
                        if ((_self.entityName === 'change' && (_self.from === "problem" || _self.from === "project")) || (_self.entityName === 'release' && _self.operation === "associateto")) {      //NO I18N
                            _self.isChangeModule ? $CRForm.associateTo(data[_self.entityName].id) : $releaseForm.associateTo(data[_self.entityName].id);
                        }
                                            //could add callback method for cmdb here.
                                            else if(_self.from == "cmdb" && _self.isChangeModule){
                                                assetsObj.loadCMDBRelatedFilesThenExecuteMethod("$ciAssociation.handlePostChangeCreation"); //No I18N
                                            }
                        else {
                            window.showalert("success", translate("api.added.success", [e_html(_self.display_name)]), "isAutoHide=true"); //No I18N
                            $CRObj.redirectTo(_self.entityName, "detail", data[_self.entityName].id);//No I18N
                        }
                    }
                } else {
                    window.showalert("success", translate("api.updated.success", [e_html(_self.display_name)]), "isAutoHide=true");   //No I18N
                    $CRObj.redirectTo(_self.entityName, "detail", data[_self.entityName].id);//No I18N
                }
                //SDP case only. Temporarily fixing for MSP and needs to be removed once fixed by SDP
                !_self.isChangeModule && isMSP && $relform.destroy();
            }
        }
    },
    /**
     * Check if inactive roles present in entity or removed roles present in template and append that role to template.
     * By default, inactive roles won't be available in template api
     */
    checkInactiveRoles: function (roles, metainfo, layout) {
        let _self = this;
        let column_count = 2;
        let i = 0;
        layout = Object.assign({}, layout);
        let sectionProp = {};
        sectionProp.column_count = column_count;
        sectionProp.fields = [];
        sectionProp.name = "-1";
        let roleId = Object.keys(roles);
        let roleFieldsInTemplate = _self.getAllFieldsInTemplateLayout(layout);
        roleId.forEach(function (id) {
            if (metainfo[id].inactive || !roleFieldsInTemplate.includes("roles." + id)) {
                const colCount = (i + 1) % column_count;
                const col = colCount ? colCount : column_count;
                sectionProp.fields.push({
                    id: id,
                    name: "roles." + id,   //NO I18N
                    position: {"col": col, "col_size": 1, "row": i + 1, "row_size": 1}   //NO I18N
                });
                ++i;
            }
        });
        return sectionProp.fields.length > 0 ? sectionProp : null;
    },
    showUserSearchPopup:function(form, field)
    {
        const searchText = jQuery('[name="' + field + '"]').select2('data') ? jQuery('[name="' + field + '"]').select2('data').name : null;//NO I18N
        //Need to know for which role, user popup is invoked
        this.rolesUsersPopup = field;
        showUserSearchPopup(field === 'change_requester'?'Change':'Release', true, searchText, field === 'change_requester'?'changes':'releases', 'null', field);//NO I18N
    },
    /**
     * Get all fields in a layout in template, say role layout
     * @layout - specific layout from template should be passed
     */
    getAllFieldsInTemplateLayout: function (layout) {
        let roleFields = [];
        jQuery.each(layout.sections, function (i, section) {
            jQuery.each(section.fields, function (j, field) {
                roleFields.push(field.name);
            });
        });
        return roleFields;
    },
    /* Modify metainfo to add the missing properties required for components */
    constructMetaInfo: function (metaFields) {
        /*Code for removing multiselect icon for all multiselect roles and udf_multi-select fields*/
        const metaKeys = Object.keys(metaFields);
        for (let i = 0; i < metaKeys.length; i++) {
            if (metaFields[metaKeys[i]].type === "lookup") {
                metaFields[metaKeys[i]].placeholder = getMessageForKey("form.select.placeholder", [metaFields[metaKeys[i]].display_name]);
                if (metaKeys[i] === "release_manager" || metaKeys[i] === "release_engineer") {
                    //Used in Details right property to enable edit
                    metaFields[metaKeys[i]].read_only = false;
                }
            } else if (metaKeys[i] === "roles") {
                let rolesFields = metaFields[metaKeys[i]].fields;
                let rolesFieldsObj = Object.keys(rolesFields);
                rolesFieldsObj.forEach(item => {
                    rolesFields[item].selection_handler = false;
                    rolesFields[item].maxvalues=250;
                });
            } else if (metaKeys[i] === "udf_fields") {
                let udfFields = metaFields[metaKeys[i]].fields;
                let udfFieldsObj = Object.keys(udfFields);
                udfFieldsObj.forEach(item => {
                    //Max allowed values for multi select and check box field is 25, this value is not provided in metainfo, so for temporary purpose hardcoding it.
                    if (udfFields[item].display_type === "MultiSelect" || udfFields[item].display_type === "CheckBox") {
                        udfFields[item].maxvalues = 25;
                    }
                });
            }
        }
    },
    /*Before Rendering form constructing template field changes*/
    constructTemplateInfo: function (templateRC) {
        let _self = this;
        templateRC[_self.entityName].site = templateRC[_self.entityName].site || null;
        let layouts = templateRC.layouts;
        let submissionLayout = {};
        let rolesLayout = {};
        let generalLayout = {};
        //Attachment section is appended when template preview window is refreshed
        let isAttachmentLayoutPresent = false;
        _self.rolesObjArr = [];
        _self.skipFAFR = ["services", "template", "workflow"];  //No I18N
        for (let i = 0; i < layouts.length; i++) {
            (layouts[i].name === "submission" || layouts[i].name === "Submission") && (submissionLayout = layouts[i]);
            layouts[i].name === "role" && (rolesLayout = layouts[i]);
            layouts[i].name === "general" && (generalLayout = layouts[i]);
            layouts[i].name === "attachment" && (isAttachmentLayoutPresent = true);
        }
        let inputDataCallbackObj = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
        /* Add config input_data_Callback for status field */
        if (generalLayout && generalLayout.sections) {
            jQuery.each(generalLayout.sections[0].fields, function (i, field) {
                if (inputDataCallbackObj.hasOwnProperty(field.name)) {
                    field.input_data_Callback = inputDataCallbackObj[field.name];
                }
                field.sort = false;
                if (field.name === "comment") {
                    _self.isCommentMandatory = field.mandatory;
                    if (_self.editId) {
                        field.mandatory = false;
                    }
                }
            });
        }

        /** set extra fields to the property */
        if (rolesLayout) {
            rolesLayout.sections[0].name = (rolesLayout.sections[0].name !== "-1") ? rolesLayout.sections[0].name : translate('common.roles');
            jQuery.each(rolesLayout.sections, function (i, section) {
                jQuery.each(section.fields, function (j, field) {
                    const roleId = field.name.split('.')[1];
                    _self.rolesObjArr.push(roleId);
                    field.sort = false;
                    field.input_data_Callback = _self.isChangeModule ? $CRForm.getRolesInputDataCallback(field, null, _self.metainfo.fields) : $releaseForm.getRolesInputDataCallback(field, null, _self.metainfo.fields.roles.fields);
                    if (_self.isChangeModule && _self.metainfo.fields.roles.fields[roleId].internal_name === 'SDSharedRole') {
                        field.processSearchData = _self.processSearchData;
                        field.help_text = translate("sdp.change.sharedrole.info");
                    }
                });
                if (_self.isChangeModule) {
                    section.fields = _self.templateFieldSortUtil(section.fields, false);
                    section.fields = _self.templateFieldSortUtil(section.fields, true);
                }
            });
        }
        _self.modifyUDFFieldsProperty(submissionLayout, templateRC[_self.entityName].udf_fields);

        if (!isAttachmentLayoutPresent) {
            /** adding Attachments inside layout */
            let attachLayout = {};
            attachLayout.title = window.getMessageForKey("sdp.common.attachments"); //No I18N
            attachLayout.name = "attachment";
            attachLayout.sections = [{
                type: "attachments",    //No I18N
                id: "attachments",  //No I18N
                container_id: "rc-attachment", //No I18N
                options: {
                    api: false,
                    upload_api: true,
                    upload: true,
                    enable_delete: true,
                    is_odapi: true,
                    download: true,
                    description: true,
                    entity: _self.entityNamePl,
                    entity_id: _self.editId,
                    entity_upload: !!_self.editId
                }
            }];
            //Attachment layout should be inserted after submission layout for change module
            _self.isChangeModule ? layouts.splice(1, 0, attachLayout) : layouts.splice(2, 0, attachLayout);

            //Adding a custom section for template and workflow fields in release add/edit form to configure within form component.
            let requiredFields = ["template", "workflow"]; //No I18N
            let fieldsProperty = {
                template: {
                    mandatory: true
                }
            };
            let fields = _self.constructFieldsSection(requiredFields, 2, fieldsProperty);
            let section = {
                fields: fields,
                custom_section: true,
                has_fields: true,
                partial: "rc-header-template", //No I18N
                column_count: "2",
                position: {col: '1', row: '1'},
                custom_data: {
                    from: _self.from,
                    $CRObj: Object.assign({}, $CRObj),
                    editId: _self.editId,
                    module: _self.entityName,
                    fromPage: _self.fromPage
                }
            };
            //Add form header section to submission layout
            const layout = _self.isChangeModule ? submissionLayout : generalLayout;
            layout.sections.unshift(section);
            layout.sections[1].position.row = "2"; // No I18N
        }
        return templateRC;
    },
    templateFieldSortUtil: function (fields, sortByRow) {
        fields.sort(function (field1, field2) {
            let keyA = (sortByRow ? parseInt(field1.position.row) : parseInt(field1.position.col)),
                keyB = (sortByRow ? parseInt(field2.position.row) : parseInt(field2.position.col));
            if (keyA === 0) return 1;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        return fields;
    },
    /**
     * Adds context=udf_fields inside fields property
     * @layouts - [Object] layouts which contains fields
     * @udf_fields - [Object] to identify udf_fields in template layout fields, udf_fields is passed
     */
    modifyUDFFieldsProperty: function (layouts, udf_fields) {
        let _self = this;
        /*as per component need to pass context = "udf_fields" then only udf_fields render in form*/
        const inputDataCB = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
        jQuery.each(layouts.sections, function (i, section) {
            jQuery.each(section.fields, function (j, field) {
                if (udf_fields && udf_fields.hasOwnProperty(field.name)) {
                    field.context = "udf_fields";      //No I18N
                }
                field.sort = false;
                if (inputDataCB.hasOwnProperty(field.name)) {
                    field.input_data_Callback = inputDataCB[field.name];
                }
                if (_self.isChangeModule) {
                    if (field.name === "comment") {
                        _self.isCommentMandatory = field.mandatory;
                        if (_self.editId) {
                            field.mandatory = false;
                        }
                    } else if (field.name === "stage") {
                        field.disableSort = true;
                    }
                }
            });
        });
    },
    /* Common for both new/edit form and details page - Change format of roles based on API format to dropdown while load new/edit page*/
    serializeRolesDataForFC: function (rolesData, rolesMeta) {
        let _self = this;
        let rolesShowUI = {};
        const rolesMetaInfo = rolesMeta;
        // In rolesUserAssociation, association id is stored in {roleId : {userid : associationId }} format for easy access
        _self.rolesUserAssociation = {};
        if (rolesData) {
            if (jQuery.isArray(rolesData)) {
                for (let i = 0; i < rolesData.length; i++) {
                    const roleId = rolesData[i].role.id;
                    const userOrGroupId = !_self.isChangeModule ? rolesData[i].user.id : rolesData[i].group ? rolesData[i].group.id : rolesData[i].user ? rolesData[i].user.id : "-1";
                    const userOrGroupName = !_self.isChangeModule ? rolesData[i].user.name : rolesData[i].group ? rolesData[i].group.name : rolesData[i].user ? rolesData[i].user.name : '$' + translate('sdp.request.share.alltechs');
                    const associationId = rolesData[i].id;

                    const userOrGroupInfo = {
                        "id": userOrGroupId, //NO I18N
                        "name": userOrGroupName, //NO I18N
                        "association_id": associationId //NO I18N
                    };
                    if (rolesMetaInfo[roleId].multiple === true) {
                        if (rolesShowUI[roleId]) {
                            rolesShowUI[roleId].push(userOrGroupInfo);
                            _self.rolesUserAssociation[roleId][userOrGroupId] = associationId;
                        } else {
                            rolesShowUI[roleId] = [userOrGroupInfo];
                            _self.rolesUserAssociation[roleId] = {};
                            _self.rolesUserAssociation[roleId][userOrGroupId] = associationId;
                        }
                    } else {
                        rolesShowUI[roleId] = userOrGroupInfo;
                        _self.rolesUserAssociation[roleId] = {};
                        _self.rolesUserAssociation[roleId][userOrGroupId] = associationId;
                    }
                }
            } else {
                rolesShowUI[rolesData.role.id] = {
                    "id": rolesData.user.id, //NO I18N
                    "name": rolesData.user.name, //NO I18N
                    "association_id": rolesData.id //NO I18N
                };
            }
        }
        return rolesShowUI;
    },
    /*Execute function while click save/update button*/
    executeWhileSave: function (payload, form, event) {
        if(this.from === "copychange"){ //NO I18N
            var actualproperties = this.copyproperties;
            if(payload.change.workflow){
                Object.keys(actualproperties).forEach(key => {
                    actualproperties[key] = actualproperties[key]
                        .filter(item => item.id !== 'approval_level');//NO I18N
                });
            }
            let fields = {
                "Submission": [], //NO I18N
                "Planning": [], //NO I18N
                "Approval": [], //NO I18N
                "UAT": [], //NO I18N
                "Implementation": [], //NO I18N
                "Review": [], //NO I18N
                "Release": [], //NO I18N
                "Close": [], //NO I18N
            }
            let names = Object.keys(actualproperties);
            for (let key of names) {
                if(actualproperties[key] != null){
                    fields[key] = actualproperties[key].map(item => item.id);
                }
            }
            fields.change = payload["change"];
            payload["copy_fields"] = fields;
        }
        let _self = this, roleArr = [];
        const obj = {"description": payload[_self.entityName].images};//NO I18N
        payload[_self.entityName].images && (payload[_self.entityName].images = obj);
        const siteId = payload[_self.entityName].site ? Number(payload[_self.entityName].site.id) : null;
        if (_self.isChangeModule) {
            if (siteId === -1 || siteId === 0) {
                payload[_self.entityName].site = null;
            }
        }
        else {
            if (siteId === -1) {
                payload[_self.entityName].site = null;
            } else if (siteId) {
                payload[_self.entityName].site = {"id": siteId};
            }
        }
        /*Serialize role input data*/
        const entityRefData = this.editId ? this.getEditData : null;
        roleArr = _self.serializeRolesDataForAPI(payload[_self.entityName].roles, entityRefData, form);
        payload[_self.entityName].roles = roleArr;

        if (_self.isChangeModule) {
            if(_self.from !== "copychange"){
                if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.contains('ViewInventoryWS') === false) {
                    delete payload[_self.entityName].assets;
                }
                if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.includes('ViewCI')==false){
                    delete payload[self.entityName].configuration_items;
                }
            }
            //Append status if there is no status value while comment has value in payload
            if (payload[_self.entityName].hasOwnProperty("comment") && !payload[_self.entityName].hasOwnProperty("status")) {
                payload[_self.entityName].status = {"id": form.fields.status.current_value.id};
            }
            _self.from === "copychange" && delete payload.change; //NO I18N
        }
    },
    /* Common for both new/edit form and details page - Change format of roles based on dropdown format to API while save/update */
    serializeRolesDataForAPI: function (roles, entityRefData, form) {
        // Convert roles object to array for api
        // In rolesUserAssociation, association id is stored in {roleId : {userid : associationId }} format for easy access
        let _self = this;
        let roleArr = [];
        const rolesId = Object.keys(roles);
        const rolesUserAssociation = (_self.rolesUserAssociationIds && !jQuery.isEmptyObject(_self.rolesUserAssociationIds)) ? _self.rolesUserAssociationIds : _self.rolesUserAssociation;
        const rolesMeta = form && form.metadata.fields.roles.fields;
        jQuery.each(roles, function (roleId, roleValue) {
            if (jQuery.isArray(roleValue)) {
                jQuery.each(roleValue, function (i, val) {
                    _self.constructRolesArray(val, roleId, rolesMeta, rolesUserAssociation, roleArr);
                });
            } else if (roleValue) {
                _self.constructRolesArray(roleValue, roleId, rolesMeta, rolesUserAssociation, roleArr);
            }
        });
        if (entityRefData && rolesId) {
            for (let i = 0; i < rolesId.length; i++) {
                let objKeys = entityRefData.roles;
                for (let j = 0; j < objKeys.length; j++) {
                    //roles[rolesId[i]] --> if same value is given component created diff with object as undefined
                    if (_self.isChangeModule) {
                        if (roles[rolesId[i]] && objKeys[j].role.id === rolesId[i]) {
                            objKeys.splice(j, 1);
                            j = j - 1;
                        }
                    }
                    else if (objKeys[j].role.id === rolesId[i]) {
                        objKeys.splice(j, 1);
                        j = j - 1;
                    }
                }
            }
            roleArr = roleArr.concat(entityRefData.roles);
        }
        return roleArr;
    },
    constructRolesArray: function (val, roleId, rolesMeta, rolesUserAssociation, roleArr) {
        let _self = this;
        let obj = {};
        obj.role = {"id": roleId};   //NO I18N
        if (_self.isChangeModule) {
            val.id === "-1" ? (obj.label_id = "-1") : rolesMeta[roleId].user_type === "SUPGRP" ? (obj.group = {"id": val.id}) : (obj.user = {"id": val.id});    //NO I18N
        }
        else {
            obj.user = {"id": val.id};    //NO I18N
        }
        rolesUserAssociation && rolesUserAssociation[roleId] && rolesUserAssociation[roleId][val.id] && (obj.id = rolesUserAssociation[roleId][val.id]);
        roleArr.push(obj);
    },
    onchangeGroup: function (currField, form) {
        let _self = this;
        _self.groupChanged = true;
        if (_self.editId) {
            window.showalert('warning', form.fields.changed.includes('site') ? translate('sdp.change.site.overwrite') : translate('sdp.release.site.and.group.overwrite'), "isAutoHide=true"); // No I18N
        }
        _self.resetSGTRoles(currField, form);
    },
    onchangeSite: function (currField, form, event) {
        let _self = this;
        if (_self.editId && !_self.groupChanged) {
            window.showalert('warning', translate('sdp.change.site.overwrite'), "isAutoHide=true"); // No I18N
        }
        _self.groupChanged = false;
        _self.resetSTRoles(currField, form);
        _self.resetSGTRoles(currField, form);
        //Reset support group role if site is changed
        if (_self.isChangeModule) {
            if (currField != null) {
                $CRForm.resetSupportGroup(form, "SUPGRP");    //NO I18N
            }
        }
        else {
            form.unsetFieldValue("group");      //No I18N
            jQuery('[name="group"]').data("sdp_select2") && (jQuery('[name="group"]').data("sdp_select2").cache = {});      //No I18N
        }
        isMSP && _self.mspform.onchangeSite(currField, form, event);
    },
    getUsersInForm: function (form, user_type) {
        let _self = this;
        const rolesObjArr = _self.rolesObjArr;
        const rolesMetaInfo = form.metadata.fields.roles.fields;
        let usersInForm = [];
        jQuery.each(rolesObjArr, function (i, roleId) {
            if (rolesMetaInfo[roleId].user_type === user_type) {
                const roleCurrentValue = form.fields["roles." + roleId].current_value;
                if (roleCurrentValue) {
                    if (jQuery.isArray(roleCurrentValue)) {
                        jQuery.each(roleCurrentValue, function (j, val) {
                            jQuery.inArray(val.id, usersInForm) === -1 && usersInForm.push(val.id);
                        });
                    } else {
                        jQuery.inArray(roleCurrentValue.id, usersInForm) === -1 && usersInForm.push(roleCurrentValue.id);
                    }
                }
            }
        });
        _self.isChangeModule && _self.getUsersInOtherLayout(form, usersInForm);
        return usersInForm;
    },
    /**
     * Get users of others roles in submission layout
     * This applies to Change Module alone
     * @form - form intance
     * @usersInForm - already choosen users in that role field, in order to main those users if its dependant field site/group is changed
     */
    getUsersInOtherLayout: function (form, usersInForm) {
        const rolesObjArr = ["change_owner"];
        isMSP && rolesObjArr.push("change_manager");
        jQuery.each(rolesObjArr, function (i, roleId) {
            const roleCurrentValue = form.fields[roleId].current_value;
            if (roleCurrentValue) {
                jQuery.inArray(roleCurrentValue.id, usersInForm) === -1 && usersInForm.push(roleCurrentValue.id);
            }
        });
    },
    /*For update roles (user type = ST) while changing site*/
    resetSTRoles: function (currField, form) {
        let _self = this;
        let site = form.fields.site;
        const defaultSiteId = _self.isChangeModule ? "0" : -1;
        let siteId = "site" in form.fields ? (site && site.current_value) ? site.current_value.id : defaultSiteId : null; //NO I18N
        if (_self.isChangeModule) {
            siteId = siteId === "0" || siteId === -1 ? null : siteId;
        }
        let user_type = _self.isChangeModule ? "TECH" : "ST"; //NO I18N
        _self.resetRoles(form, siteId, null, user_type);
    },
    /*For update roles (user type = SGT) while changing both group and site*/
    resetSGTRoles: function (currField, form) {
        let _self = this;
        let siteObj = form.fields.site;
        let groupObj = form.fields.group;
        const defaultSiteId = _self.isChangeModule ? "0" : -1;
        let siteId = "site" in form.fields ? (siteObj && siteObj.current_value) ? siteObj.current_value.id : defaultSiteId : defaultSiteId; //NO I18N
        if (_self.isChangeModule) {
            siteId = siteId === "0" || siteId === -1 ? null : siteId;
        }
        let groupId = (groupObj && groupObj.current_value) ? groupObj.current_value.id : null;
        let user_type = _self.isChangeModule ? "COTECH" : "SGT"; //NO I18N
        _self.resetRoles(form, siteId, groupId, user_type);
    },
    resetRoles: function (form, siteId, groupId, user_type) {
        let _self = this;
        let rolesObjArr = _self.rolesObjArr;
        let rolesMetaInfo = form.metadata.fields.roles.fields;
        let usersInForm = _self.getUsersInForm(form, user_type);
        let allowedUsers = [];

        // Include change_owner for change module
        if (_self.isChangeModule && form.fields.change_owner.current_value) {
            usersInForm.push(form.fields.change_owner.current_value.id);
        }

        // Get the allowed users in the site/group
        for (let i = 0; i < usersInForm.length; i += 10) {
            let users = usersInForm.slice(i, i + 10);
            let input_data = {};

            if (user_type === "COTECH" || user_type === "SGT") {
                input_data = {
                    "list_info": { //NO I18N
                        "start_index": 1, //NO I18N
                        "row_count": 100, //NO I18N
                        "search_criteria": { //NO I18N
                            "field": "associated_sites", //NO I18N
                            "condition": "is", //NO I18N
                            "value": siteId == null ? -1 : siteId, //NO I18N
                            "children": [{ //NO I18N
                                "field": "support_group", //NO I18N
                                "condition": "is", //NO I18N
                                "value": {"id": groupId}, //NO I18N
                                "logical_operator": "and" //NO I18N
                            }, {
                                "field": "id", //NO I18N
                                "condition": "in", //NO I18N
                                "values": users, //NO I18N
                                "logical_operator": "and" //NO I18N
                            }]
                        }
                    }
                };
            } else if (user_type === "TECH" || user_type === "ST") { //NO I18N
                input_data = {
                    "list_info": { //NO I18N
                        "start_index": 1, //NO I18N
                        "row_count": 100, //NO I18N
                        "search_criteria": { //NO I18N
                            "field": "associated_sites", //NO I18N
                            "condition": "is", //NO I18N
                            "value": {"id": siteId == null ? -1 : siteId}, //NO I18N
                            "children": [{ //NO I18N
                                "field": "id", //NO I18N
                                "condition": "in", //NO I18N
                                "values": users, //NO I18N
                                "logical_operator": "and" //NO I18N
                            }]
                        }
                    }
                };
            }

            if ((isMSP && (user_type === "SDCM" || user_type === "SDRM" || user_type === "ALL"))) {
                allowedUsers = allowedUsers.concat(_self.mspform.getAllowedUsersForRole(user_type, users));
            } else {
                allowedUsers = allowedUsers.concat(_self.getTechData(input_data));
            }
        }

        // Remove the users not allowed in the site/group
        for (let i = 0; i < rolesObjArr.length; i++) {
            let roleId = rolesObjArr[i];
            if (rolesMetaInfo[roleId].user_type === user_type) {
                let roleFullId = "roles." + roleId; //NO I18N
                let selVal = form.fields[roleFullId].current_value;

                jQuery('[name="' + roleFullId + '"]').data("sdp_select2").cache = {}; // NO I18N

                if (selVal && ((Array.isArray(selVal) && selVal.length > 0) || (typeof selVal === 'object' && !jQuery.isEmptyObject(selVal)))) {
                    if (!rolesMetaInfo[roleId].multiple) {
                        if (jQuery.inArray(selVal.id, allowedUsers) !== -1) {
                            form.safeSetFieldValue(roleFullId, {
                                id: selVal.id,
                                name: selVal.text || selVal.name,
                                association_id: selVal.association_id
                            });
                        } else {
                            form.unsetFieldValue(roleFullId);
                        }
                    } else {
                        let mulRole = [];
                        jQuery.each(selVal, function (i, val) {
                            if ((_self.isChangeModule && rolesMetaInfo[roleId].internal_name === 'SDSharedRole' && val.id === '-1') || jQuery.inArray(val.id, allowedUsers) !== -1) {
                                mulRole.push({
                                    id: val.id,
                                    name: val.text || val.name,
                                    association_id: val.association_id
                                });
                            }
                        });
                        mulRole.length ? form.safeSetFieldValue(roleFullId, mulRole) : form.unsetFieldValue(roleFullId);
                    }
                }
            }
        }

        if (_self.isChangeModule && (!isMSP || user_type === "COTECH")) {
            let otherLayoutRolesArr = ["change_owner"];
            isMSP && otherLayoutRolesArr.push("change_manager");
            $CRForm.resetRolesInOtherLayout(allowedUsers, otherLayoutRolesArr, form, rolesMetaInfo);
        }
    },
    onChangeStatus: function (field, form) {
        let _self = this;
        if (_self.isCommentMandatory) {
            form.addMandatoryField("comment");//NO I18N
        }
        form.fields.comment.disabled = (!(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1));
    },
    showAssociatedAssetList: function (form, field) {
        assetsObj.loadAttachAssetPopup(this.entityName, "attach_asset", field);//NO I18N
    },
    getTechData: function (inputData) {
        let _self = this;
        const techEntity = _self.isChangeModule ? "change_owner" : "release_engineer";  //NO I18N
        const userResponse = this.getEntityAll(_self.base_url + '/' + techEntity, null, techEntity, inputData);//NO I18N
        let users = [];
        for (let i = 0; i < userResponse.length; i++) {
            users.push(userResponse[i].id);
        }
        return users;
    },
    /*While changing template for overwrite fields*/
    currentTemplateContent: function (entityData, templateRC) {
        let _self = this;
        //Attachment is not included in Template's entity data in api
        templateRC[_self.entityName].attachments = [];
        const isEmergencyTemplate = templateRC.is_emergency;
        /* For overwriting all fields*/
        if (_self.selOverwriteId === "1") {
            return entityData = null;
        }
        /* For overwriting empty fields*/
        else if (_self.selOverwriteId === "2") {
            return entityData = merge(entityData, templateRC[_self.entityName]);

            function merge(existingData, newData) {
                let answer = {};
                answer.workflow = existingData.workflow;
                for (let field in newData) {
                    if (existingData[field] === undefined || existingData[field] === null || (jQuery.isArray(existingData[field]) && existingData[field].length === 0)) {
                        if (field === "subcategory" || field === "item" || field === "category") {
                            //If there is no category in entity data, then copy template data for overwrite empty field values
                            if (existingData["category"] == null) {
                                answer[field] = newData[field];
                            }
                        } else {
                            //If there is new field in template or field is empty in entity data, then copy template data
                            answer[field] = newData[field];
                        }
                    } else {
                        if (field === "roles") {
                            answer[field] = jQuery.extend(existingData[field], newData[field]);
                        } else if (field === "udf_fields") {  //NO I18N
                            answer[field] = {};
                            for (let udfField in newData[field]) {
                                if (existingData[field][udfField] === null || (jQuery.isArray(existingData[field][udfField]) && existingData[field][udfField].length === 0)) {
                                    answer[field][udfField] = newData[field][udfField];
                                } else {
                                    answer[field][udfField] = existingData[field][udfField];
                                }
                            }
                        } else if (field === "template") { //No I18N
                            answer[field] = newData[field];
                        } else if (field === "workflow") { //NO I18N
                            //if the selected template is of type general or if both the current template and the selected template are of type emergency, workflow is retained. Else it will be made empty.
                            if (isEmergencyTemplate && existingData.workflow && existingData.workflow.type === "General") {
                                answer[field] = null;
                            } else {
                                answer[field] = existingData[field];
                            }
                        } else {
                            //If there is value in entity data, then retain that data
                            answer[field] = existingData[field];
                        }
                    }
                }
                return answer;
            }
        }
        /* For do not overwrite*/
        else if (_self.selOverwriteId === "3") {
            return entityData = merge(entityData, templateRC[_self.entityName]);

            function merge(existingData, newData) {
                newData.workflow = existingData.workflow;
                // Replace all the fields which is present in existingData(existing form data) in obj2(new template data)
                for (let field in newData) {
                    if (field in existingData) {
                        if (field === "udf_fields") {
                            for (let udfField in newData[field]) {
                                if (udfField in existingData[field]) {
                                    newData[field][udfField] = existingData[field][udfField];
                                }
                            }
                        } else if (field === "template") { //NO I18N
                            continue;
                        } else if (field === "workflow") { //NO I18N
                            //if the selected template is of type general or if both the current template and the selected template are of type emergency, workflow is retained. Else it will be made empty.
                            if (isEmergencyTemplate && existingData.workflow && existingData.workflow.type === "General") {
                                newData[field] = null;
                            } else {
                                newData[field] = existingData[field];
                            }
                        } else {
                            newData[field] = existingData[field];
                        }
                    }
                }
                return newData;
            }
        }
    },
    /*Click function for back/cancel button in new/edit page*/
    cancelForm: function () {
        // SDP case only. Temporarily fixing for MSP and needs to be removed once fixed by SDP
        let _self = this;
        !_self.isChangeModule && isMSP && $relform.destroy();
        let parent = _self.entityName === 'release' ? window.top : $extFrame.getActiveWindow(); //NO I18N

        if (_self.from === "change" || _self.from === "project" || _self.from === 'request' || _self.from === 'problem') {  // NO I18N
            parent.$previewComponent.closePreview("newrelease_popup");  // No I18N
        } else if(_self.from === "copychange"){
            let options = {
                Change_ID: this.changeID,
                from : this.from,
                copyproperties : this.copyproperties
            }
            new CopyChange(options).initialize();
        }
        else if(_self.from === "cmdb"){
            parent.$previewComponent.closePreview("newchange_popup");  // No I18N
        }
         else {
            if (_self.fromPage === "details" && this.editId) {
                $CRObj.redirectTo(_self.entityName, 'detail', this.editId);  // NO I18N
            } else {
                if (_self.entityName === 'release') {
                    $CRObj.redirectTo(_self.entityName, 'list', '', '', 'cancelForm', 'null', 'get');  // NO I18N
                } else {
                    window.location.href = "/Changes.cc";
                }
            }
        }
    },
    /*Set properties while initialize for form component*/
    setProp: function (options) {
        let _self = this;
        _self.changeID = options.changeID;
        _self.editId = options.id && options.id !== "null" ? options.id : null;//NO I18N
        _self.entityName = options.module;
        _self.entityNamePl = _self.entityName + "s";    //No I18N
        _self.base_url = _self.editId ? _self.entityNamePl + "/" + _self.editId : _self.entityNamePl;   //NO I18N
        _self.metainfo = _self.getEntityAll(_self.base_url + '/metainfo', null, 'metainfo')[0];//NO I18N
        _self.isChangeModule = (_self.entityName === "change");   //No I18N
        _self.display_name = _self.isChangeModule ? getMessageForKey('sdp.common.change') : getMessageForKey('common.release'); // No I18N
        if (options.from) {
            _self.from = options.from;
        }
        if (options.associatedEntityId) {
            _self.associatedEntityId = options.associatedEntityId;
        }
        if (options.operation) {
            _self.operation = options.operation;
        }
        if (options.overwrite_option) {
            _self.overwrite_option = options.overwrite_option;
        }
        if( _self.isChangeModule)
        {
        self.managerUpdatedViaCategory=false;
        }
        _self.options = options;
    },
    /**
     * For userType - SDRM, ALL row_count should be 25. Limit is set because in server side, data will be processed and then returned.
     */
    getAllInputDataCallback: function () {
        return function (urlOptions, input_data, searchText) {
            if (self.isChangeModule && isMSP && urlOptions.url.startsWith('/api/v3/changes/change_requester')) { //No I18N
                // once the url params changed for a field it retains in FC till refresh so that reconstructing everytime
                urlOptions.url = '/api/v3' + urlOptions.formcomp.fields[urlOptions.field].href + "?ACCOUNTID=" + $CRForm.mspform.getAccountID(); //No I18N
            }
            input_data.list_info.row_count = 250;
            return input_data;
        };
    },
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelect: function (formAlias, formName, isEdit, event) {
        const field = FC_Mapper[formAlias].fields[formName];
        const lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        let input_data = {"list_info": {"start_index": 1, "row_count": 100, "sort_field": "id"}}; //No I18N
        if (!field.allowedValues) {
            sdpAjax({
                url: "/api/v3" + field.href, //No I18N
                async: false,
                cache: false,
                data: {input_data: sdpToJSON(input_data)},
                success: function (data) {
                    field.allowedValues = data[lookup_entity];
                    FC.showBulkSelect(formAlias, formName, isEdit, event, true);
                }
            });
        } else {
            FC.showBulkSelect(formAlias, formName, isEdit, event, true);
        }
    },
    /**
     * Post user selection method is Users popup window
     */
    setUsersPopupSelection: function (select2UserDetails) {
        let _self = this;
        jQuery('[name="' + _self.rolesUsersPopup + '"]').select2('data', select2UserDetails).trigger("change"); //NO I18N
    },
    /**
     * Construct fields from template layout
     */
    constructFieldsSection: function (requiredFields, column_count, fieldsProperty) {
        let fieldsLayout = [];
        jQuery.each(requiredFields, function (i, field) {
            let obj = {};
            obj.name = field;

            let colCount = (i + 1) % column_count;
            let col = colCount ? colCount : column_count;
            obj.position = {"col": col, "col_size": 1, "row": i + 1, "row_size": 1};

            if (fieldsProperty && fieldsProperty.hasOwnProperty(field)) {
                jQuery.extend(true, obj, fieldsProperty[field]);
            }
            fieldsLayout.push(obj);
        });
        return fieldsLayout;
    },
    /**
     * Set default workflow in form
     */
    setDefaultWorkflow: function (field, form) {
        let _self = this;
        if (_self.tosetDefaultWorkflow) {
            _self.tosetDefaultWorkflow = false;

            // Check if admin-default workflow can be set if change template workflow is empty
            if (_self.entityName === "change" && (_self.from === "problem" || _self.from === "request")) {
                let isPresent = $relform.allowedValues.workflow.find(wf => wf.id === _self.defaultWorkflow.id);
                if (!isPresent) {
                    return;
                }
            }

            if ((form.template.is_emergency && _self.defaultWorkflow.type === "Emergency") || !form.template.is_emergency) {
                form.safeSetFieldValue("workflow", { //NO I18N
                    id: _self.defaultWorkflow.id,
                    name: _self.defaultWorkflow.name
                });
                form.fields.changed = [];
                if ( _self.defaultWorkflow && _self.defaultWorkflow.allowed_stages_config === "ONLY_WF_STAGES") {
                    let stageId = form.entitydata.stage.id;
                    let statusId = form.entitydata.status.id;
                    let workflowId = _self.defaultWorkflow.id;

                    if (!_self.checkStageInWorkflow(stageId, workflowId)) {
                        _self.resetStageStatusDefaultValue(form);
                        _self.markCommentMandatory(form);
                    } else if (!_self.checkStatusInWorkflow(statusId, workflowId)) {
                        form.unsetFieldValue("status");   //NO I18N
                        _self.markCommentMandatory(form);
                    }
                }
            }
        }
    },
    /* Function for ajax call*/
    getEntityAll: function(moduleName, moduleId, entityName, inputData, getAllData){
        let _self = this;
        const url = moduleId ? moduleName + '/' + moduleId : moduleName;
        let entityData = [], hasMoreRows = false;
        do{
            try{
                let sdpOptions = {
                    url:'/api/v3/' + url,//NO I18N
                    cache: false,
                    async: false,
                    data:sdpAjaxInputData(inputData),
                    success: function(response) {
                        entityData = entityData.concat(entityName ? response[entityName] : response);
                        if(getAllData && response.list_info && response.list_info.has_more_rows){
                            inputData.list_info.start_index = response.list_info.start_index + response.list_info.row_count;
                            hasMoreRows = true;
                        }else{
                            hasMoreRows = false;
                        }
                    },
                    error: function(response){
                        entityData = response.responseJSON;
                        hasMoreRows = false;
                    }
                };
                const fromProject = (_self.entityName === 'change' && _self.from === "project") || (_self.entityName === 'release' && _self.operation === "associateto" && _self.from === "project"); //NO I18N
                if (fromProject) {
                    sdpOptions.acceptODCompatible = true;
                }
                sdpAjax(sdpOptions);
            }
            catch(e){
                console.error(e);
                hasMoreRows = false;
            }
        } while(hasMoreRows);

        return entityData;
    },
    onChangeStage: function(currField, form) {
        form.fields.comment.disabled = false;
    },
    /**
     * On template change show confirm and load the new template
     */
    onChangeTemplate: function (currField, formcomp, event, formPromise) {
        let _self = this;
        if(_self.from === 'copychange'){
            //FAFR should not apply for copy change form template field
            formcomp.safeSetFieldValue("template",_self.entitydata.template)//NO I18N
            return;
        }
        let templateId = currField.current_value.id;
        if(templateId!=currField.field_value.id){
            $se.ffr.didFetchRules=false;
        }
        if (_self.editId) {
            _self.changeTemplateConfirm(templateId, event, currField, formcomp);
        }
        else if (_self.entityName === 'change' && _self.from) {
            //SD-114073
            //In case of associations need to pass chosen templateId in options on template change
            let options = _self.options;
            options.templateId = templateId;
            formcomp.destroy();
            $CRForm.initialize(options);
        }
        else if (_self.entityName === 'release' && _self.associatedSelOverwriteId && _self.overWriteEntitydata) {
            /** To retain the associating entity data after template change **/
            formcomp.destroy();
            $releaseForm.loadTemplate(templateId, _self.editId, null, null, forcesave = true, _self.overWriteEntitydata);
        }
        else {
            formcomp.destroy();
            _self.isChangeModule ? $CRForm.loadTemplate(templateId) : $releaseForm.loadTemplate(templateId);
        }
    },
    findTemplateTypeFromID : (id) => {
        const data = window.$relform.allowedValues.template;
        const child = data.find(child => child.id === id);
        if (child) {
            return data.text;
        }
        return null;
    },
    changeTemplateConfirm: function(templateID, event, currField, form) {
        let _self = this;
        const newTemplateIsEmergency = _self.findTemplateTypeFromID(templateID)===`Emergency`;
        const toShowWorkflowChangeAlert = newTemplateIsEmergency || _self.entitydata.template.is_emergency;
        let alertMessage = (toShowWorkflowChangeAlert ? (`<div class="alert alert-info icon" role="alert"><span class="msg">` + translate("sdp.change.form.workflow.autochange.alert") + `</span></div>`) : "") + getMessageForKey("sdp.change.release.modify.template.alert.message", [_self.entityName]);  //No I18N
        let content = '<div class="disp-t text-color4 mt20 w-450px"><div class="disp-c pos-rel"> ' +
            '<label class="cur-ptr radio-inline disp-b ml0 mb10" for="overwriteAll"> <input type="radio" value="1" id="overwriteAll" name="overwritetmp">'+translate('sdp.release.overwrite.existing.values')+'</label> ' +
            '<label class="cur-ptr radio-inline disp-b mb10 ml0" for="overwriteEmpty"> <input type="radio" value="2" id="overwriteEmpty" name="overwritetmp">'+translate('sdp.release.overwrite.empty.values')+'</label> ' +
            '<label class="cur-ptr radio-inline disp-b mb10 ml0" for="overwriteNo"> <input type="radio" value="3" id="overwriteNo" checked name="overwritetmp">'+translate('sdp.release.do.not.overwrite')+'</label>' +
            '</div></div>';
        jQuery('body').off('change','[name=overwritetmp]').on('change','[name=overwritetmp]',function(){  //NO I18N
            _self.selOverwriteId = jQuery("input[name='overwritetmp']:checked").val();
        });
        _self.selOverwriteId = "3";
        showconfirm(true,
            "title=" + getMessageForKey("sdp.change.modify.template.title") + "," + //No I18N
            "message=" + alertMessage + content + "," +   //No I18N
            "submitbutton=" + translate("sdp.license.upgrade") + "," +    //No I18N
            "cancelbutton=" + translate("common.cancel") + "," + //No I18N
            "closebutton=yes," +    //No I18N
            "closeOnEscKey=yes", function(didConfirm) { //No I18N
                if(didConfirm) {
                    if(_self.editId) {
                        /** copies the "this.request_info" data to "this.entitydata" (resets it) */
                        _self.entitydata = jQuery.extend(true, {}, _self.entityRefData);
                        /** Before change template, backup the user's association id */
                        _self.rolesUserAssociationIds = _self.rolesUserAssociation;
                        $relform.destroy();
                        _self.isChangeModule ? $CRForm.loadTemplate(templateID,_self.editId,null,_self.entitydata, forcesave=true) : $releaseForm.loadTemplate(templateID,_self.editId,null,_self.entitydata, forcesave=true);
                        /* When template is changed, workflow should be set as changed only then, workflow data will be send in inputdata*/
                        _self.isWorkflowChanged = true;
                    }
                }else{
                    form.safeSetFieldValue("template", {id: event.removed.id, name: event.removed.text || event.removed.name});   //NO I18N
                }
            }
        );
    },
    /**
     * load data for release template
     */
    modifyTemplateEntityData: function(templateRC){
        let _self = this;
        if (!templateRC[_self.entityName].template) {
            templateRC[_self.entityName].template = {name: templateRC.name, id: templateRC.id};
        }
        if (!templateRC[_self.entityName].workflow) {
            if (templateRC.workflow) {
                templateRC[_self.entityName].workflow = {name: templateRC.workflow.name, id: templateRC.workflow.id};
            } else if (!_self.isEditForm && _self.from !== "copychange") {  //NO I18N
                _self.tosetDefaultWorkflow = true;
            }
        }
    },
    /**
     * function to confirm workflow change
     */
    onChangeWorkflow: function(currField, form, event){
        let _self = this;
        if (_self.editId || _self.from === "copychange") {
            _self.showWfChangeConfirmDialog(_self, form, event);
        }
        else {
            //Clear allowed values data in stage/status field when workflow field is cleared(No workflow), inorder to get all stages/status
            jQuery('[name="stage"]').data("sdp_select2") && (jQuery('[name="stage"]').data("sdp_select2").cache = {});   //NO I18N
            jQuery('[name="status"]').data("sdp_select2") && (jQuery('[name="status"]').data("sdp_select2").cache = {});   //NO I18N
            //Reset stage & status field only when workflow is changed. Reset stage/status is not required when workflow field is cleared(No workflow).
            if(event.added){
                _self.resetStageStatus(form);
            }
        }
    },
    showWfChangeConfirmDialog: function(_self, form, wfEvent, callback = null){
        let isSameWf = wfEvent.added && _self.entitydata && _self.entitydata.workflow ? wfEvent.added.id === _self.entitydata.workflow.id : false;
        if (isSameWf) {
            //Clear the allowed values if the same workflow is selected to reinit the allowed values
            jQuery('[name="stage"]').data("sdp_select2") && (jQuery('[name="stage"]').data("sdp_select2").cache = {});   //NO I18N
            jQuery('[name="status"]').data("sdp_select2") && (jQuery('[name="status"]').data("sdp_select2").cache = {});   //NO I18N
            if(_self.from != "copychange"){
                let stageReset = false;
                if (form.fields.values.stage && form.fields.values.stage.id !== form.entitydata.stage.id || !form.fields.values.stage && form.entitydata.stage) {
                    form.safeSetFieldValue("stage", {id: form.entitydata.stage.id, "name": form.entitydata.stage.name});   //NO I18N
                    stageReset = true;
                }
                if (form.fields.values.status && form.fields.values.status.id !== form.entitydata.status.id || !form.fields.values.status && form.entitydata.status) {
                    form.safeSetFieldValue("status", {id: form.entitydata.status.id, "name": form.entitydata.status.name});   //NO I18N
                    form.validateField('status');   //NO I18N
                    stageReset = true;
                }
                if (stageReset) {
                    form.removeMandatoryField("comment");   //NO I18N
                    form.unsetFieldValue("comment");   //NO I18N
                    form.fields.comment.disabled = true;
                }
            }else{
                _self.resetStageStatus(form);
            }
            return;
        }
        let hasImpact = wfEvent.added ? wfEvent.added.allowed_stages_config === "ONLY_WF_STAGES": false;  //NO I18N
        if(_self.from != "copychange" || (_self.from == "copychange" && hasImpact)){
            let defaultStage = _self.metainfo ? _self.metainfo.fields.stage.default_value.name : "";
            let defaultStatus = _self.metainfo ? _self.metainfo.fields.status.default_value.name : "";
            renderhbs("#workflow-dialog-container","workflow_change_dialog_template", {hasImpact: hasImpact, module: _self.entityName || _self.entity_name, defaultStage: defaultStage, defaultStatus: defaultStatus, from: _self.from}, false, "common");  //NO I18N
            let dialogOptions = {
                resizable: false,
                height: 'auto',    //No I18N
                width: '460px',  //NO I18N
                title: translate("sdp.common.warning"),
                type: "modal", //No I18N
                open: function(event){
                    jQuery("[data-id='impacted_action_dialog_proceed']").focus();
                },
                close: function(closeEvent){
                    if (closeEvent.ui.closeButton) {
                        callback ? jQuery("#impacted_action_dialog").sdp_zcomponent_dialog("close") : _self.cancelWorkflowChange(form, wfEvent); //No I18N
                    }
                }
            };
            jQuery("#impacted_action_dialog").sdp_zcomponent_dialog(dialogOptions); //No I18N

            jQuery("#impacted_action_dialog").off("click").on("click", function(event) { //No I18N
                if (event.target.dataset.id === "impacted_action_dialog_proceed") {
                    if (callback) {
                        callback();
                        jQuery("#impacted_action_dialog").sdp_zcomponent_dialog("close"); //No I18N
                    }
                    else {
                        _self.confirmWorkflowChange(form, wfEvent);
                    }
                }
                else if (event.target.dataset.id === "impacted_action_dialog_cancel") {
                    if (callback) {
                        jQuery("#impacted_action_dialog").sdp_zcomponent_dialog("close"); //No I18N
                        //If not confirm, close inline edit
                        jQuery("#workflow_actions").find(".spot-icon.failure").trigger("click");
                    } else {
                        _self.cancelWorkflowChange(form, wfEvent);
                    }
                }
            });
        }
    },
    confirmWorkflowChange: function(formComp, event){
        this.resetStageStatus(formComp);
        jQuery("#impacted_action_dialog").sdp_zcomponent_dialog("close");//No I18N
    },
    cancelWorkflowChange: function(formComp, wfEvent){
        let value = wfEvent.removed ? {id: wfEvent.removed.id, name: wfEvent.removed.text || wfEvent.removed.name} : null;
        formComp.safeSetFieldValue("workflow", value);   //NO I18N
        jQuery("#impacted_action_dialog").sdp_zcomponent_dialog("close");//No I18N
    },
    /**
     * Reset stage/status if workflow is changed
     */
    resetStageStatus: function(form, forceReset){
        let _self = this;
        let wfObj = form.fields.workflow;
        let workflowId = (wfObj && wfObj.current_value) ? wfObj.current_value.id : null;
        let stageId = (form.fields.stage && form.fields.stage.current_value) ? form.fields.stage.current_value.id : null;
        let statusId = (form.fields.status && form.fields.status.current_value) ? form.fields.status.current_value.id : null;
        //Clear allowed values as the stage allowed values should be fetched based on the new workflow chosen in workflow field
        jQuery('[name="stage"]').data("sdp_select2") && (jQuery('[name="stage"]').data("sdp_select2").cache = {});   //NO I18N
        jQuery('[name="status"]').data("sdp_select2") && (jQuery('[name="status"]').data("sdp_select2").cache = {});   //NO I18N
        if (forceReset || (workflowId && !_self.checkStageInWorkflow(stageId, workflowId))){
            _self.resetStageStatusDefaultValue(form, forceReset);
            _self.markCommentMandatory(form);
        }else if (workflowId && !_self.checkStatusInWorkflow(statusId, workflowId)){
            form.unsetFieldValue("status");   //NO I18N
            _self.markCommentMandatory(form);
        }
    },
    /**
     * checks whether stage present in workflow
     * return boolean
     */
    checkStageInWorkflow: function(stageId, workflowId, base_url) {
        let _self = this;
        let input_data = {"list_info":{"start_index":1,"row_count":10,"search_criteria":{"field":"id","condition":"in","values": [stageId]}},"workflow_id": workflowId}; //NO I18N
        let response = _self.getEntityAll(((base_url) ? base_url : _self.base_url) + '/stage', null, null, input_data)[0];
        return response.list_info.row_count === 1;
    },
    /**
     * checks whether status present in workflow
     * return boolean
     */
    checkStatusInWorkflow: function(statusId, workflowId, base_url) {
        let _self = this;
        let input_data = {"list_info":{"start_index":1,"row_count":10,"search_criteria":{"field":"id","condition":"in","values": [statusId]}},"workflow_id": workflowId}; //NO I18N
        let response = _self.getEntityAll(((base_url) ? base_url : _self.base_url) + '/status', null, null, input_data)[0];
        return response.list_info.row_count === 1;
    },
    /**
     * Reset stage/status field to default values
     */
    resetStageStatusDefaultValue: function(form, forceReset){
        let _self = this;
        form.safeSetFieldValue("stage", {id: _self.metainfo.fields.stage.default_value.id, "name": _self.metainfo.fields.stage.default_value.name});   //NO I18N
        forceReset && form.reformDependentFields("stage", form.getDependentFields("stage").fields); // NO I18N
        form.safeSetFieldValue("status", {id: _self.metainfo.fields.status.default_value.id, "name": _self.metainfo.fields.status.default_value.name});   //NO I18N
    },
    /**
     * To mark comment field mandatory in change / release form
     */
    markCommentMandatory: function(form) {
        const _self = this;
        if (_self.isCommentMandatory) {
            form.addMandatoryField("comment");//NO I18N
        }
        form.fields.comment.disabled = false;
    },
                  loadCIDetails : function(id){
                     assetsObj.loadCIDetailsInNewWindow(id);
                  },
                  loadAssetDetails : function(id){
                     assetsObj.popup.open('detail','asset_assets','',id,'','','showdetails');
                  },
                  loadCMDBRelationshipDetails : function(id){
                     var url = "/RelationshipMapD3.do?operation=showRelD3&ciId=" + id; //no I18n
                     showMap(url,'RelationshipMap_W'); //no i18n
                     event.stopPropagation();
                  },
                  showAssoicateAssetList: function (entity) {
                            assetsObj.loadAttachAssetPopup(entity, "attach_asset", "assets");//NO I18N
                  },
                  showAssoicateCIList : function(entity){
                            assetsObj.loadAttachCIPopup(entity,"configuration_items","configuration_items_actions",'500');//No I18N
                  },
                      ChangeFieldValidation:function(fieldName,formComp){
                          if(formComp.validateField(fieldName.name))
                          {
                              const spanElement=document.querySelector('span[for="'+fieldName.name+'"]');//No I18N
                                  if (spanElement) {
                                      spanElement.remove();
                                  }
                          }
                      }
}
