/* $Id$ */
/*  This file has utility functions required for displaying Change details left and right panel.
 */
var change_lhsrhs ={
    /**
     Left Menus for DC
     */
    getLeftMenus: function(){
        var _self = this;
        var menus = ["stages","roles","tasks","reminders","notes","worklogs","approvalsummary","conversations","history"];    // No I18N
        return menus;
    },
    rightPanelOwnerChange:function(field,form,event){
       setTimeout(function(){
         FC.submit(form.form)
       },500);
    },
    /**
     Renders customized right property section of DC
     */
    loadRightPropertySection: function(mode="view"){// No I18N
        if(!["view","edit","new"].includes(mode)){
            mode="view";//No i18n
        }
        var _self = this;
        var requiredfields = ["id","status","workflow","template","change_type","change_owner","scheduled_end_time", "approval_status"];   // No I18N
        var fieldsProperty = {
            id: {
                custom_render: function(){
                    return '<p class="form-control-static">CH-'+e_html(ChangeReleaseDetails.entity_data.id)+'</p>'; // No I18N
                }
            },
            status: {
                custom_render: function(){
                    var obj = {
                        stage : _self.entity_data.stage.name,
                        status : _self.entity_data.status.name,
                        canEdit : _self._links.edit && _self._links.edit.put && !_self._links.edit.put.non_editable_fields.includes("status") && ((_self.stagePermissions[_self.activeStage] && _self.stagePermissions[_self.activeStage].edit) || (_self.stagePermissions[_self.activeStage] && _self.stagePermissions[_self.activeStage].approve))&& !_self.isTrashed ? true : false,   // No I18N
                        $rc: _self
                    }
                    var html = renderhbs(null,"rightpanel_stagestatus_template", obj, false, "change", true, true, null, true);  //NO I18N
                    return html;
                }
            },
            workflow: {
                input_data_Callback: function(urlOptions,input_data,searchText){
                    if(_self.entity_data.emergency){
                        var json = {
                            "field": "type", //No I18N
                            "condition": "is",       //No I18N
                            "value": "Emergency",       //No I18N
                            "children": [       //No I18N
                                {
                                    "field": "name",      //No I18N
                                    "condition": "like",      //No I18N
                                    "values": [      //No I18N
                                        searchText
                                    ],
                                    "logical_operator": "and"      //No I18N
                                }
                            ]
                        };
                        input_data.list_info.search_criteria = json;
                        return input_data;
                    }else{
                        return input_data;
                    }
                }
            },
            change_owner:_self.copyTemplateProperties("Submission","change_owner"),//No I18N

            approval_status: {
                custom_render: function(){
                    return '<p class="form-control-static">'+((_self.entity_data.change_type && _self.entity_data.change_type.pre_approved) ? '<span class="cspr icon-sm success mr5 vmiddle top-1 pos-rel"  rel="uitip" title="'+ translate('sdp.change.approvaltab.preapproved.text') +'"></span>' : '')+e_html(_self.entity_data.approval_status.name) +'</p>'; // No I18N
                }
            }
        };
        fieldsProperty.change_owner.input_data_Callback = $CRForm.getRolesInputDataCallback({name: "change_owner"}, _self.entity_data ,_self.metainfo.fields);   // No I18N

        var column_count = "1";
        var template = _self.constructTemplate(requiredfields,column_count,fieldsProperty,mode);
        //Except stage & status all other fields are not editable in right section
        var nonEditable = ["id", "template", "approval_status", "workflow","scheduled_end_time","change_type"];    // No I18N
        _self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields && (nonEditable = nonEditable.concat(_self._links.edit.put.non_editable_fields));
        if(!_self.stagePermissions["global"].edit)
            nonEditable.push("change_owner");// No I18N
        if(_self.isConfigEnabled("RoleEditConfig", "AllowOnlySuperUsersToEditChangeRoles") && !_self.changeProperties.hasRFCEdit) {
            nonEditable.push("change_owner");
        }
        template.layouts[0].sections[0].fields=template.layouts[0].sections[0].fields.filter(field => field.name!=="site"&&field.name!=="group");
        //Destroy the old instance
        /* Load FC for right property section */
        var rightPropFcConfig = {
            template: template,
            entitydata: jQuery.extend(true,{},_self.entity_data),
            metadata: jQuery.extend(true,{},_self.metainfo),
            container: "right_propertysection",   // No I18N
            preFix:"rpanel",// No I18N
            formid: "rightPanelProperty",   // No I18N
            skipEditFields: nonEditable,
            mode:mode,
            disableFieldOnly:true,
            canEdit: _self.isTrashed ? false : true, //CanEdit default's to true, and permission is controlled in skipEditFields
            ffr:{
              hideReverse:true,
              hideFields:requiredfields,
              id:$rc.entity_data.template.id,
              enable:true,
              entity:"CHANGE",//No i18n
              rerender:function(){
                 $rc.loadRightPropertySection();
              },
              toggleMode:(form,event,mode)=>{
                if(mode=="view"){
                   FC_Mapper[form].destroy()
                   $rc.loadRightPropertySection("edit");// No I18N
                   $rc.$rightpropertyfields_FC.sectionalEdit($rc.$rightpropertyfields_FC.form);
                   setTimeout(function(){
                       jQuery("#"+$rc.$rightpropertyfields_FC.container).find(".col-fields").addClass("mb0");
                       $rc.$rightpropertyfields_FC.hideFieldToggle("sla_violation",true);// No I18N
                       $rc.$rightpropertyfields_FC.hideFieldToggle("sla",true);// No I18N
                       $rc.$rightpropertyfields_FC.fields.change_owner.container.find(".spot-actions").removeClass("hide").find(".spot-save").hide();
                       $rc.$rightpropertyfields_FC.fields.change_owner.container.find(".spot-actions").find(".spot-cancel").on("click",function(argument) {
                           FC.cancel($rc.$rightpropertyfields_FC.form);
                       });
                   },300);

                   return false;
                }
              },
            },
            edit: {
                defaults: {
                    lookup:{
                        placeholder:translate('sdp.change.sla.select'),
                    }
                },
                fields:{
                    workflow: {
                        onsave: "$rc.confirmWorkflowChange" // No I18N
                    }
                },
                inline: {
                    scheduled_end_time: {
                        pre: function(form){
                            // when inline edit, allignment issue
                            form.container.find('[data-title="scheduled_end_time"]').addClass("vmiddle");
                        }
                    }
                },
                onchange:{
                    change_owner: "$rc.rightPanelOwnerChange"// No I18N
                }
            },
            afterRenderCallback: function(){
                jQuery("#"+this.container).find('[data-id="form-fixed-wrapper"]').css("padding-bottom",'').end()
                    .find(".form-wrapper").removeClass("pb25").end()
                    .find(".form-section").addClass('noborder p0');

            },
            save: {
                pre : function(payload, formcomp, event, promise ){
                    //if form component url override with roles it will be reverted
                    formcomp.options.save.url  = _self.base_url+ "/" +_self.id; // No I18N
                    formcomp.options.save.type = "PUT";
                },
                cancel:function(){
                    if(_self.$rightpropertyfields_FC.mode=="edit"){
                        $rc.loadRightPropertySection();
                    }
                },
                postsuccess : function(data){
                    _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
                    _self.reinitDetailsComponent();

                },
                promisereject: "$rc.roles.promisereject"   // No i18n
            }
        };
        if(_self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.form){
            _self.$rightpropertyfields_FC.destroy();
        }

        _self.$rightpropertyfields_FC = _self.initFormComponent(rightPropFcConfig);
    },
}
