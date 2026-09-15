/* $Id$ */
/*  This file has utility functions required for displaying Change roles page.
 */
var change_roles = {
    /**
     * Loads Roles panel section
     */
    loadRoles: function(tabName, tabSetting, tabs_panel){
        var _self = this, rolesObj = {};
        var rolesInSubmission = ["change_requester", "change_owner", "change_manager"]; // No I18N
        rolesObj = _self.roles;
        rolesObj.initFC = function(mode="view"){
            if(!["view","edit","new"].includes(mode)){
                mode="view";//No i18n
            }
            /* Destroy the old instance*/
            _self.$roles_FC && _self.$roles_FC.destroy();
            rolesObj.addHeader=!_self.printPreview;
            rolesObj.canEdit =  ((_self.isConfigEnabled("RoleEditConfig","AllowOnlySuperUsersToEditChangeRoles",_self.changeConfigurations))?_self.changeProperties.hasRFCEdit:_self.stagePermissions["global"].edit) && !_self.printPreview && !_self.isTrashed;//No I18N
            renderhbs("#change_roles_container", "roles_template", rolesObj, false, "change", true);  //NO I18N
            /* Show/hide block edit icon */
            var blockEditRoleId = '[data-id="blockEditRolesFields"]';  //NO I18N
            if(mode == "edit"){
                jQuery(blockEditRoleId).hide();
            }else{
                jQuery(blockEditRoleId).show();
            }

            var roleLayoutName = "role";  //No I18N
            _self.getTemplateInfo(_self.entity_data.template.id);
            var column_count = 2;
            var options = {setRolesInputDataCallback: true, metainfo: _self.metainfo.fields};
            //Get roles in Submission layout and append it to roles layout
            rolesObj.appendRolesToLayout(_self.submissionLayout, rolesInSubmission,mode);
            var template = _self.constructTemplateInfo(roleLayoutName, null, column_count, options,mode);
            var metadata = jQuery.extend(true,{},_self.metainfo.fields.roles);
            var rolesData = rolesObj.constructRolesData();
            //Remove color customization and label placement applied in template
            template.style_properties = null;
            //Append inactive roles by checking metainfo, to the roles template
            var inactiveRoles = $CRForm.checkInactiveRoles(rolesData.roles, metadata.fields, template.layouts[0]);
            inactiveRoles && template.layouts[0].sections.push(inactiveRoles);
            template.layouts[0].sections[1].fields.forEach((val)=>{rolesInSubmission.push(val.name)});
            if(template.layouts[0].sections[2]&&mode == "edit"){
                template.layouts[0].sections[2].fields=template.layouts[0].sections[2].fields.filter(field => field.name!=="site"&&field.name!=="group");
            }
            var configJSON = {
                entitydata: rolesData,
                template: template,
                metadata: jQuery.extend(true,{},_self.metainfo),
                container: "change_roles",// No I18N
                formid:"change_roles_form",// No I18N
                canEdit: rolesObj.canEdit,
                mode: mode,
                skipInlineTranslate:true,
                ffr:{
                    hideFields:rolesInSubmission,
                    hideReverse:true,
                    id:_self.entity_data.template.id,
                    enable:true,
                    entity:"CHANGE",//No i18n
                    rerender:function(form){
                        $rc.roles.initFC();
                    },
                    toggleMode:(form,event,mode)=>{
                        if(mode=="view"){
                            $rc.roles.initFC('edit');//No i18n
                            return false;
                        }
                    }
                },
                edit: {
                    defaults: {
                        lookup:{
                            placeholder:translate('sdp.change.sla.select'),
                        }
                    }
                    ,
                    fields: {
                        multi_select: {
                            formatResult: function(item) { // Overriden formatResult method to display toolTip
                                return _self.formatResultForToolTip(item);
                            },
                            processResults:function(search_data,data,field){ // Overriden processResult to retrieve desired results in toolTip
                                search_data.push(_self.processResultsForToolTip(data));
                            },
                        },
                        lookup: {
                            formatResult: function(item) { // Overriden formatResult method to display toolTip
                                return _self.formatResultForToolTip(item);
                            },
                            processResults:function(search_data,data,field){ // Overriden processResult to retrieve desired results in toolTip
                                search_data.push(_self.processResultsForToolTip(data));
                            },
                        }
                    }
                },
                /*Inline save*/
                save: {
                    url: _self.base_url+ "/" +_self.id,//NO I18N
                    entity: _self.entity_name,
                    serializer: "$rc.roles.serializeRolesDataForAPI", //No I18N
                    postsuccess: function(data){
                        _self.reinitDetailsComponent();
                    }
                },
                afterRenderCallback: function(form){
                    jQuery("#"+form.container).find(".section-title").addClass("pl0").removeClass("font-medium1");  //NO I18N
                }
            };

            /* Roles block edit options*/
            if(mode == "edit"){
                configJSON.save = {
                    url: _self.base_url+ "/" +_self.id,//NO I18N
                    entity: _self.entity_name,
                    serializer: "$rc.roles.serializeRolesDataForAPI", //No I18N
                    submit: true,
                    cancel: "$rc.roles.cancelForm",   // No I18N
                    postsuccess: function (data) {
                        _self.reinitDetailsComponent();
                    }
                };
                configJSON.afterRenderCallback = function(form){
                    jQuery("#"+form.container).find('[data-name="multiselecttemplate"]').hide();
                    jQuery("#"+form.container).find(".section-title").addClass("pl0");
                };
            }
            _self.$roles_FC = _self.initFormComponent(configJSON);
        };
        rolesObj.cancelForm = function(){
            _self.roles.initFC('view');   // No I18N
        };
        /** Get the roles in Submission layout and append it to Roles layout */
        rolesObj.appendRolesToLayout = function(layout, roles,mode){

                //Get role id to form section in roleslayout
                var otherSubmissionFields=[];
                var customSection  = jQuery.extend(true, {}, _self.rolesLayout.sections[0]);
                customSection.fields = [];
                otherSubmissionFields.fields=[];
                layout.sections.forEach(function(section,i){
                    section.fields.forEach(function(field,j){
                        if(roles.contains(field.name)){
                            customSection.fields.push(field);
                        }else{
                            if(field.name!="attachments"){
                            otherSubmissionFields.fields.push(field);
                            }
                        }
                    });
                });
                if(_self.rolesLayout.sections.length == 1){
                    _self.rolesLayout.sections.unshift(customSection);
                }else{
                    _self.rolesLayout.sections[0]=customSection;
                }
                if(mode=="edit"){
                    _self.rolesLayout.sections.push(otherSubmissionFields);
                }
                else if(mode=="view"&&_self.rolesLayout.sections.length>2){
                    _self.rolesLayout.sections.pop();
                }
                _self.rolesLayout.sections[0].name=translate("sdp.change.roles.critical.title");
                _self.rolesLayout.sections[1].name=translate("sdp.change.roles.other.title");

        };

        rolesObj.serializeRolesDataForAPI = function(payload, form){
            var entityData = jQuery.extend(true,{},_self.entity_data);
            var roleArr = $CRForm.serializeRolesDataForAPI(payload[form.options.save.entity].roles, entityData, form);
            payload[_self.entity_name].roles = roleArr;
        };

        rolesObj.constructRolesData = function(){
            var entityData = jQuery.extend(true,{},_self.entity_data);
            entityData.roles = $CRForm.serializeRolesDataForFC(entityData.roles,_self.metainfo.fields.roles.fields);
            return entityData;
        };
        rolesObj.initFC("view");   // No I18N
        $CS.findElement("#change_roles_container").trigger("page:load"); //No I18N
    },
}
