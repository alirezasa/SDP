/* $Id$ */

var serviceSLATemplates = {
    
    personalize_key : 'slas.service_template_sla_associations', // No I18N
    templatesAlreadySelected : [],
        associatedCount : 0,
    /*
        To load Associated Service Templates
        wrapper - div id to wrap table content
        slaObj - service sla data
        isForDetailView - boolean for List View or Details Page
        associateTempPage - To show new association form or associated templates list view
    */

    load: function( wrapper ,slaObj  , isForDetailView ,associateTempPage) {

        //For Detail view only 3 rows are shown in inline block
        var row_count = (isForDetailView ? 3 : 10);

        serviceSLATemplates.slaObj = slaObj ? slaObj : serviceSLATemplates.slaObj;
        serviceSLATemplates.isForDetailView = isForDetailView == true ;
        serviceSLATemplates.wrapper = wrapper ? wrapper : serviceSLATemplates.wrapper;
        serviceSLATemplates.dialog_container = "#associateSLA"; // No I18N  

        if((serviceSLATemplates.slaObj && serviceSLATemplates.slaObj.newSLAAssociation) || associateTempPage)
        {
            this.associateNewSla("newSLAAssociation"); // No I18N
        }
        else
        {
            this.listAssociatedSlATemp(row_count);
        }
    },

    /*
    To associate new SLA or edit existing association
    module_name - new or edit sla
    edit_data -  sla association details for selected template
    For new sla association, form component will be rendered here
    */

    associateNewSla : function(module_name,edit_data)
    {
        jQuery(serviceSLATemplates.wrapper).empty();

        if(serviceSLATemplates.slaObj)
        {
            serviceSLATemplates.slaObj.newSLAAssociation = true;
            var count = (serviceSLATemplates.tableComp && serviceSLATemplates.tableComp.t_obj.table_info.list_info.total_count) ? serviceSLATemplates.tableComp.t_obj.table_info.list_info.total_count : 0 ;
            serviceSLATemplates.slaObj.showBackBtn = count != 0 ;
        }


        var i18n_backbtn=translate('common.back.listview');
        var backDivHTML=(serviceSLATemplates.slaObj.showBackBtn)?'<a href="/" id="sla_associate_back_btn" name="backBtn" class="btn btn-default btn-xs fl mr10" rel="uitip" title='+i18n_backbtn+'> <span class="common-sprite icon-sm common-go-back-icon1"></span></a>':'';
        var i18nTitle=translate('associate.sla.title');
        var title=backDivHTML+' '+i18nTitle;// No I18N

        setTimeout(function()
        {
        renderhbs(serviceSLATemplates.wrapper,'service-sla-templates', serviceSLATemplates ,false,'admin'); // NO I18N

        var dialog_container = jQuery("#slaTempContentHolderPopup").children().length ? "#associateSLATemp" : "#associateSLA"; // No I18N
		serviceSLATemplates.dialog_container = dialog_container;
        jQuery(serviceSLATemplates.dialog_container).dialog('option', 'title',title);//NO I18N
        jQuery("#sla_associate_back_btn").off('click').on('click', (event) => {  //No I18N
            serviceSLATemplates.listAssociatedSlATemp();
        })

        var entity_data = {};
        entity_data.sla = serviceSLATemplates.slaObj;

         var mode = "new"; // NO I18N
         var api_url = "/api/v3/service_template_sla_associations"; // NO I18N
        if(module_name == "editSLAAssociation")
        {   
            if(edit_data)
            {
                entity_data.user_groups = edit_data.user_groups;    
                entity_data.template = edit_data.template;    
                entity_data.info = edit_data.info;
                api_url = api_url +"/" + edit_data.id;
            }
            
            mode = "edit";  // NO I18N  
        }

        var template = {};
        var fields = [{mandatory: true,name: "sla",position: {col: '1', col_size: 1, row: 1, row_size: 1},sort: false , disabled : true},{mandatory: true,name: "template",position: {col: '1', col_size: 1, row: 3, row_size: 1},sort: false , disabled : (mode == "edit")},{mandatory: false,name: "user_groups",position: {col: '1', col_size: 1, row: 3, row_size: 1},sort: false},{mandatory: false,name: "info",position: {col: '1', col_size: 1, row: 4, row_size: 1},sort: false}]; // NO I18N
        var sections = [{"column_count":1,fields:fields,"field_alignment" : 'top'}] // NO I18N
        template.style_properties = {"field_style": {"field_align" : "top"}};  //No I18N
        template.layouts = [{column_count:1,sections:sections}];
        var formId = "slaAssociateForm"; // NO I18N
       
         var configJSON = {
                name : "service_template_sla_association", // NO I18N
                entity: "service_template_sla_association", // NO I18N
                entityName: translate("common.association"), // NO I18N
                entitypath: "service_template_sla_association", // NO I18N
                metadata:{
                    entity: "service_template_sla_association", // NO I18N
                    fields: {
                        sla : {
                            display_name: translate('sdp.admin.sla.title'), // NO I18N
                            display_type: "Pick List", // NO I18N
                            placeholder: translate("sdp.change.sla.select"), // NO I18N
                            type: "lookup" // NO I18N
                        },
                        template : {
                            display_name: translate('common.service.template'), // NO I18N
                            display_type: "Pick List", // NO I18N
                            href: "/slas/"+serviceSLATemplates.slaObj.id+"/template_associations/template", // NO I18N
                            lookup_entity: "template", // NO I18N
                            lookup_field: "name", // NO I18N
                            partial_field: false,
                            placeholder: translate("sdp.change.sla.select"), // NO I18N
                            type: "lookup", // NO I18N
                            input_data_Callback : function (urlOptions,input_data,searchText) {
                                //SD-109075 | Fix service templates not sorted based on sort_index
                                input_data.list_info.sort_fields = [{"field":"service_category.sort_index","order":"asc"},{"field":"sort_index","order":"asc"}];    // NO I18N
                                return input_data;
                            }
                        },
                        user_groups:{
                            display_name: translate('show.usr.group.label'),
                            display_type: "MultiSelect", // NO I18N
                            href: "/user_groups", // NO I18N
                            lookup_entity: "user_groups", // NO I18N
                            lookup_field: "name", // NO I18N
                            multiple: true,
                            selection_handler : false,
                            partial_field: false,
                            placeholder: translate("sdp.change.sla.select"), // NO I18N
                            type: "lookup" // NO I18N
                        },
                        info : {
                            display_name: translate('common.info'),
                            display_type: "Multi Line", // NO I18N
                            partial_field: false,
                            searchable: false,
                            sortable: false,
                            position: { col: "1", col_size: "1", row: "5", row_size: "1" }, //No I18N
                            type: "string", // NO I18N
                            constraints:{
                                max_length: 2000
                            }
                        }
                    },
                    is_dynamic: false,
                    plural_name: "service_template_sla_associations", // NO I18N
                    relationship: false
                },

                template: template,
                entitydata: jQuery.extend(true,{},entity_data),
                container: "slaAssociateFormWrapper",   // No I18N
                canEdit: true,
                mode : mode, 
                formid: formId,
                edit: {

                    fields:{
                        template :{
                            processResults: function(search_data, data, field) {
                                search_data.push(data);
                            },
                            processSearchData : function(all_data , data , field)
                            {
                                return serviceSLATemplates.formatToServCat(all_data.template);
                            }
                        },
                        user_groups: {
                            post: function(field, form) {
                                field.container.find(".control-holder").addClass("mti-select");
                            }
                        }
                    },
                    onchange:{
                      template:"serviceSLATemplates.appendDefSLAAction" //No I18N
                    }
                },
                save: {
                    submit: true,
                    exit_alert: false,
                    onsave : function(data)
                    {
                        data.is_default_sla = jQuery("#"+serviceSLATemplates.formComp.formid+" #isdefaultSLA").is(":checked");

                        if(jQuery("#"+serviceSLATemplates.formComp.formid+" #mark-active").length)
                        {
                            var isDeletedSlaTemp = !(jQuery("#"+serviceSLATemplates.formComp.formid+" #mark-active").is(":checked"));
                            if(!isDeletedSlaTemp)
                            {
                                data.deleted = isDeletedSlaTemp;     
                            }
                        }
                        return data ;
                    },
                    cancel: function(fc)
                    {
                        serviceSLATemplates.cancelAction();
                    },
                    entity: "service_template_sla_association", //No I18N
                    url: api_url,
                    postsuccess: function (data, form)
                    {
                        if(serviceSLATemplates.isNewAssociation)
                        {
                            serviceSLATemplates.isNewAssociation = false;
                            var currentSelectedTemplate = serviceSLATemplates.formComp.getFieldValue("template"); // No I18N
                            serviceSLATemplates.templatesAlreadySelected.push(currentSelectedTemplate);
                            serviceSLATemplates.formComp.resetForm();
                            // SD-109077 | Resetting the 'Set as default SLA' checkbox and enabling the User Groups field on 'Save and Associate Another' action
                            jQuery("#"+serviceSLATemplates.formComp.formid+" #isdefaultSLA").prop("checked", false)
                            serviceSLATemplates.formComp.enableField("user_groups");  // NO I18N
                        }
                        else
                        {
                            serviceSLATemplates.listAssociatedSlATemp();    
                        }
                    },
                    pre: function (formData, associateTempFC, event, promiseArr) {
                        // If 'Set as Default SLA' is selected & default SLA is already configured for the selected template, display a confirmation pop-up.
                        promiseArr.push(
                            new Promise((resolve, reject) => {
                                var isDefaultSLA = jQuery("#" + associateTempFC.formid + " #isdefaultSLA").is(":checked");
                                if (!isDefaultSLA) {
                                    resolve();
                                    return;
                                }
                                var selectedSlaId = associateTempFC.mode == 'new' ? formData.service_template_sla_association.sla.id : associateTempFC.entitydata.sla.id;   // No I18N
                                var templateId = associateTempFC.mode == 'new' ? formData.service_template_sla_association.template.id : associateTempFC.entitydata.template.id;    // No I18N
                                var inputData = {
                                    input_data: sdpToJSON({
                                        list_info: {
                                            search_criteria: [
                                            {
                                                field: "is_default_sla",// No I18N
                                                value : true,
                                                condition: "eq", // No I18N
                                                logical_operator:"and" // No I18N
                                            },
                                            {
                                                field : "template.id", // No I18N
                                                value : templateId,
                                                condition : "eq", // No I18N
                                                logical_operator:"and" // No I18N
                                            }],
                                        },
                                    }),
                                };
                                sdpAjax({
                                    cache: false,
                                    url: "/api/v3/service_template_sla_associations", // No I18N
                                    method: "GET", // No I18N
                                    data: inputData,
                                    async: false,
                                    success: function (resp) {
                                        var sla_associations = resp.service_template_sla_associations;
                                        if (sla_associations.length == 0 || sla_associations[0].sla.id == selectedSlaId) {
                                            // resolve in case no default SLA is configured for the selected template or the configured default SLA is same as selected SLA
                                            resolve();
                                            return;
                                        }
                                        existingDefaultSLAName = sla_associations[0].sla.name;
                                        var confirmMsgTitle = translate("common.confirm.submit"); // No I18N
                                        var confirmMsg = translate("override.defaultsla.msg", [e_html(existingDefaultSLAName)]);
                                        var yesMsg = translate("common.yes");
                                        var noMsg = translate("common.no");
                                        showconfirm(true, "title=" + confirmMsgTitle + ", message=" + confirmMsg + ", submitbutton=" + yesMsg + ", cancelbutton=" + noMsg + ", closebutton=yes, closeOnEscKey=yes", showconfirmcommit); // No I18N
                                        function showconfirmcommit(canProceed) {
                                            // resolve or reject based on confirmation popup selection
                                            canProceed ? resolve() : reject();
                                        }
                                    },
                                });
                            })
                        );
                    },
                    promisereject: function (_self, event) {
                        // Enable the disabled 'Save' button, when 'No' option is selected on confirmation popup
                        var submitBtn = jQuery("#" + _self.container).find("button[name='save-form']"); //No I18N
                        submitBtn.length > 0 && (submitBtn[0].disabled = false);
                        event && event.target && (event.target.disabled = false);
                    },
                },
                afterRenderCallback: function(form)
                {
                    if(!edit_data){
                        var html = '<button name="new-association-form" type="button" data-cs-field="cancel" class="btn btn-default">'+translate('associate.new.label')+'</button>'; //No I18N
                        jQuery(html).insertAfter(jQuery("#"+form.formid+" [name='save-form']"));
                    }
                    jQuery("#"+form.formid).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N

                    jQuery("#"+form.formid+" [name='new-association-form']").off("click").on("click",function()
                    {
                        serviceSLATemplates.isNewAssociation = true;
                        serviceSLATemplates.formComp.submit("form_"+form.formid); // NO I18N
                    });

                    if(edit_data)
                    {
                        if (edit_data.deleted) {
                            serviceSLATemplates.addInactiveStyle(form);
                        } else {
                            // SD-109212 | 'Set as default SLA' checkbox should be shown only when SLA-Template Association is active
                            serviceSLATemplates.appendDefSLAAction(null, form, null, edit_data.is_default_sla);
                        }
                    }

                    html = '<p id="sla_association_note class="pt5 text-muted mb0">' + translate('sla.association.note') + '</p>';
                    jQuery(html).insertAfter(jQuery("#info_control"));
                }
            };

            serviceSLATemplates.formComp = new FC(configJSON);


        },1);

    },

    /*
    To load sla details in edit or new form page
    formcomp - form component data
    event - template field change jQuery event
    set_as_default - boolean to make set as default SLA field checked
    */

    appendDefSLAAction : function(field,formcomp,event,set_as_default)
    {   
        /* appending the sla action  definition */
        if(formcomp && formcomp.entitydata && formcomp.entitydata.sla && formcomp.entitydata.sla.is_active!=false && !formcomp.entitydata.sla.is_deleted)
        {
            var def_sla_inp = "#"+formcomp.formid+" #isdefaultSLA"; // NO I18N
            var shown_already = jQuery(def_sla_inp).is(":visible"); // NO I18N

            if(!shown_already)
            {
                var checked_status =  (set_as_default == true) ? "checked" : "";  // NO I18N
                var default_sla_html = '<div class="form-group pos-rel mb20"><label class="cus-input top10 mb10 xs radio-inline sla-select mt5 pl10" for="isdefaultSLA"><input class="top2 pos-rel" type="checkbox" id="isdefaultSLA" '+checked_status+'/><em></em><span class="pos-rel font-normal">'+translate('set.as.default.label',[translate('sdp.admin.sla.title')])+'</span></label></div>';
                jQuery(default_sla_html).insertAfter(jQuery("#"+formcomp.formid+" [data-fname='template']"));

                setTimeout(function()
                {
                    jQuery(def_sla_inp).off("change").on("change",function(e) // NO I18N
                    {
                        var checked = jQuery(this).is(":checked"); // NO I18N
                        if(checked)
                        {
                            serviceSLATemplates.formComp.disableField("user_groups"); // NO I18N
                            // User Groups should be cleared, not reset on clicking 'Set as default SLA'
                            serviceSLATemplates.formComp.unsetFieldValue("user_groups"); // NO I18N
                        }
                        else
                        {
                            serviceSLATemplates.formComp.enableField("user_groups");  // NO I18N 
                        }
                    });
                },1);
            }

            if(set_as_default == true)
            {
                serviceSLATemplates.formComp.disableField("user_groups"); // NO I18N
                serviceSLATemplates.formComp.resetFieldValue("user_groups"); // NO I18N
            }
            else
            {
                // SD-109077 | 'Set as default SLA' should be unchecked & user group should be enabled on template change
                jQuery(def_sla_inp).prop("checked", false);     // NO I18N
                serviceSLATemplates.formComp.enableField("user_groups");    // NO I18N
            }
        }
    },
    /*Adding event listeners, as the associate button will only be visible in list view of templates*/
    callBackForEvents: function(){
            jQuery("#associateSLAbtn").off('click').on('click', (event) => {    // No I18N
                serviceSLATemplates.associateNewSla("newSLAAssociation");     // No I18N
            })
        },

    /*
    To load associated templates list view
    row_count - For detail page, only 3 rows will be shown in inline block
    */

    listAssociatedSlATemp : function(row_count)
    {

        jQuery(serviceSLATemplates.wrapper).empty();
        var _self = this;
        sdpAjax({
            url: '/api/v3/slas/_user_selection',// No I18N
            type: 'GET', // No I18N
            async : false,
            success:function(res) {
              serviceSLATemplates.user_selection_enabled = res.user_selection.is_enabled;
            }
        });
        if(serviceSLATemplates.slaObj.id!=null && serviceSLATemplates.user_selection_enabled){

        if(serviceSLATemplates.slaObj)
        {
            serviceSLATemplates.slaObj.newSLAAssociation = false;
        }
        renderhbs(serviceSLATemplates.wrapper,'service-sla-templates', serviceSLATemplates ,false,'admin',null,null,_self.callBackForEvents); // NO I18N
        var table_info = {"list_info":{"row_count": row_count ,"start_index":"1","get_total_count":true}}; //NO I18N

        if(serviceSLATemplates.isForDetailView)
        {

             var table_content = {};
              table_content.header = serviceSLATemplates.headerdataConstructKanban(table_info,serviceSLATemplates);
              table_info.fields_required = {
                  "name" : { // No I18N
                      "column_settings": { "view_type": "row" ,"rowposition":0 }, // No I18N
                      "hide_label": true, //No I18N
                      "default": true, // No I18N
                      "dataCelltransformer" : serviceSLATemplates.nameCellTransformerRuleGrpTitle // No I18N
                   },
              }
              table_info.list_info.search_criteria={field:"sla.id",value:serviceSLATemplates.slaObj.id,condition:"eq"};// No I18N

              var inputObject = {};
              inputObject.list_info = table_info.list_info;
                
              setTimeout(function() {
                var options = {

                    callbackRowfunction : _self.rowDataConstruct,
                    personalize_key : _self.personalize_key,
                    row_inputdata       : inputObject,
                    callbackURL: "service_template_sla_associations", // No I18N
                    view : "kanban", // No I18N
                    view_mode : "linear", // No I18N
                    nodataString: '<div class="pos-rel tc p10">'+translate("sdp.listview.nodataavailble")+'</div>',
                    callbackAfterBodyRender : serviceSLATemplates.afterRenderCallbackForDetailTable,
                    discard_without_displayname: true,
                    entity_name: "service_template_sla_associations", // No I18N                    
                    tableHolder: "service_template_sla_associations", // No I18N
                    width : "auto", // No I18N
                    height : "auto" // No I18N

                };
                
                var table_compreq = new tableComponent(table_info,table_content,options,serviceSLATemplates);
                serviceSLATemplates.tableComp= table_compreq;

              },10);
        }
        else
        {
            var table_content = {};
            var slaID=serviceSLATemplates.slaObj.id;
            var table_info = table_comp.getTableInfo(_self.personalize_key);
            table_content.header = this.headerdataConstruct(table_info,this);
            table_info.list_info.search_criteria={field:"sla.id",value:slaID,condition: "eq"};// No I18N
            table_info.list_info.default_search_criteria={field:"sla.id",value:slaID,condition: "eq"};// No I18N

            setTimeout(function() {
            var options = {};
            options.paginationEnabled   = true;
            options.multiDeleteEnabled  = true;
            options.searchEnabled       = true;
            options.sortingEnabled      = true;
            options.support_search_criteria=true;
            options.personalize_key     = _self.personalize_key;
            options.callbackRowfunction = _self.rowdataConstruct;
            options.callbackAfterBodyRender = _self.afterRenderCallbackForListTable;
            options.row_inputdata       = _self.rowdataConstruct(table_info,_self);
            options.callbackURL         = "service_template_sla_associations"; // No I18N
            options.entity_name         = "service_template_sla_associations"; // No I18N
            options.delete_entity_name  = translate('service.template.and.sla.association');
            options.isODAPI             = true;
            var table_compreq = new tableComponent(table_info,table_content,options,_self);
            _self.tableComp=table_compreq;

            },10);
        };
        //resetting the templates already selected while inside the list view
        serviceSLATemplates.templatesAlreadySelected = [];
        }
    },

    /*
    Constructing header data for list view
    table_info - contains table data
    controller
    */

    headerdataConstructKanban: function(table_info,controller) {

          var meta_data = {
                  "name" : { // No I18N
                      "column_settings": { "view_type": "row" ,"rowposition":0 }, // No I18N
                      "hide_label": true, //No I18N
                      "default": true, // No I18N
                      "dataCelltransformer" : controller.nameCellTransformerRuleGrpTitle // No I18N
                   }
              }; 
          return meta_data;
    },

    /*
    To dissociate Template
    assTempId - Template ids which are to be dissociated
    */

     dissociateTemp:function(assTempId){

        var _self=this;
        sdpAjax({
          url: '/api/v3/service_template_sla_associations',// No I18N
          type: 'DELETE', // No I18N
          async: false,
          data : {"ids":assTempId}, // No I18N
          success:function(res) {
            if(res.response_status[0].messages != undefined){
                showalert("failure", e_html(res.response_status[0].messages[0].message), "isAutoHide=false");   // No I18N
            }
            else{
                showalert("success", getMessageForKey("sdp.admin.orgrole.messages.success.deleteassociation") ,"isAutoHide=true");		// No I18N
            }
            _self.tableComp.refreshTable();
          }
      });
    },

    /*
    Constructing template row in list view
    tableData - contains table info
    */
    nameCellTransformerRuleGrpTitle : function(tableData , controller)
    {

      var row_data=tableData.row_data;

      if(row_data)
      {
            
        var template= row_data.template;
        var service_category = template ? template.service_category : {};

        var temp_nav_url = "app#/admin/service-category/"+service_category.id+"/templates/"+template.id; // No I18N
        var name = template ? template.name : "";

		var disabled_or_default = '';
        if(row_data.deleted){
            disabled_or_default = '<span class="alert-danger1 mr10"><span class="cspr icon-sm disable-no mr3"></span>'+translate('common.disabled')+'</span>';
        } 
        else if(row_data.is_default_sla){
            disabled_or_default = '<span class="label label-success rounded10 mr10"><span class="text-muted text-color8 pt2">'+translate('common.default')+'</span></span>';
        }
        var template_row =  '<div class="disp-t p-hidethis p15"><div class="disp-c tc pr10 w-30px"><a data-attr="sla-associated-temp-id" data-id="'+row_data.id+'" href="/" class="hidethis"><span class="cspr icon-sm close-red2 gry-hvroff flat vmiddle" role="img" title="'+translate('common.remove.value', [translate("common.association")])+'" rel="uitip"></span></a></div><div class="disp-c"><div class="truncate-ellipsis"><div class="disp-flex"><span class="vmiddle disp-ib sb text-overflow" rel="uitip" mode_ellipsis="true" title="'+e_attr(template.name)+'">'+e_html(template.name)+'</span><span class="hidethis" rel="uitip" title="'+translate("table.open.newtab")+'"><a href="'+temp_nav_url+'" target="_blank" class="cspr flat icon-sm newtab ml10 mr10 top0" role="img" rel="noopener"></a></span>' + disabled_or_default + '</div><div class="text-overflow mt10"><span class="text-muted" rel="uitip" mode_ellipsis="true" title="'+e_attr(service_category.name)+'">'+e_html(service_category.name)+'</span></div></div></div></div>';
        if(row_data.deleted){
            template_row += '<div class="modal-overlay2 cur-na opac5"></div>';
        }
        return template_row;        
      }
      
      return "-";

    },

    /*
        To open Template Association Popup in Service Sla details page
        wrapper (List View) - slaTempContentHolder
        wrapper (Details Page - Inline) - slaTempContentHolder
        wrapper (Details Page - Popup) - slaTempContentHolderPopup
     */

    openPopupForDetailView : function(associateTempPage)
    {
        /* open the popup from the sla detail view page */

          var dialog=jQuery('#associateSLATemp').dialog({
                'resizable':false,// No I18N
                'draggable':false,// No I18N
                'autoOpen':false,// No I18N
                 show: {
                  effect:'fade',// No I18N
                },
                'title':'',// No I18N
                'width':'1200',// No I18N
                // 'height':'570',// No I18N
                'position': { my: "center top", at: "center top+100", of: window },// No I18N
                'modal':true,// No I18N
                close:function(event,ui){
                   jQuery("#slaTempContentHolderPopup").empty();

                   //for jsp page refelction on close
                   if(serviceSLATemplates.associatedCount != 0)
                   {
                    jQuery("#TemplateAssocList").removeClass("hide");
                    jQuery("#noTemplateAssoc").addClass("hide");

                    serviceSLATemplates.slaObj.newSLAAssociation = false;
                    serviceSLATemplates.load("#slaTempContentHolder",null,true); // NO I18N

                   }
                   else
                   {
                    jQuery("#TemplateAssocList").addClass("hide");
                    jQuery("#noTemplateAssoc").removeClass("hide");
                   }
                }
          });

          dialog.data( "sdpDialog" )._title = function(title) {//NO I18N
             title.html( this.options.title );
          };

         jQuery('#associateSLATemp').dialog("open"); // NO I18N
         jQuery("#slaTempContentHolder").empty();
         serviceSLATemplates.load("#slaTempContentHolderPopup",null,false,associateTempPage); // NO I18N
         
    },

    /*
        To show Total Count of BR Template Association
        For SLA List View - Add total count as title in Associated Templates Popup
        For Details Page - Add Count in Details Page and show View More option only if Count is greater than 3
     */

    showTotalCount : function()
    {
        /* showing the total count of sla-templates mapping */

        var count = (serviceSLATemplates.tableComp && serviceSLATemplates.tableComp.t_obj.table_info.list_info.total_count) ? serviceSLATemplates.tableComp.t_obj.table_info.list_info.total_count : 0 ;
        if(serviceSLATemplates.associatedCount < count){
            serviceSLATemplates.associatedCount = count;
        }
        if(serviceSLATemplates.isForDetailView)
        {
            jQuery("#sla-templates-count").text(" ("+count+")");
            if(count > 3){
				var html =  '<div class="tc-row cv-task-item p0 visi-parent"><div class="disp-t ml30 p10"><a id="temp-associate-popup" href="/" class="text-primary pl10">'+translate('sdp.project.history.viewmore')+'</a></div></div>';
            	jQuery("#service_template_sla_associations_kanban_div").append(html);
            	jQuery("#temp-associate-popup").off('click').on('click', (event) => {  //No I18N
                    serviceSLATemplates.openPopupForDetailView();
                })
			}
            jQuery("[associate-new-temp=true]").off("click").on("click",function(event) // NO I18N
            {
                serviceSLATemplates.openPopupForDetailView(true);
            });
            var dialog_container = jQuery("#slaTempContentHolderPopup").children().length ? "#associateSLATemp" : "#associateSLA"; // No I18N
            serviceSLATemplates.dialog_container = dialog_container;             
        }
        else
        {
            var associatedTempKey=translate('sdp.request.externalaction.availabletotemp');
            var name  = (serviceSLATemplates.slaObj && serviceSLATemplates.slaObj.name ) ? e_html(serviceSLATemplates.slaObj.name) : "";
            var title=associatedTempKey+'('+count+') - '+name;// No I18N

            var dialog_container = jQuery("#slaTempContentHolderPopup").children().length ? "#associateSLATemp" : "#associateSLA"; // No I18N
            serviceSLATemplates.dialog_container = dialog_container;      
            jQuery(dialog_container).dialog('option', 'title',title);//NO I18N
        }
    },

    /*
    To cancel and redirect to associated template list view popup
    */

    cancelAction:function(){


        var elem = jQuery("#associateSLATemp").length ? "#associateSLATemp" : "#associateSLA"; // No I18N 
        var title=jQuery(elem).dialog('option','title'); // No I18N
               
        if(title && (typeof title == "string" && title.indexOf("backBtn")!=-1))
        {
            this.listAssociatedSlATemp();
        }else{
            jQuery(elem).dialog('close'); // No I18N
        }
    },

    /*
    To edit already associated Template
    */

     editAssociation:function(params){

        var splitarr=params.split(",");
        serviceSLATemplates.editAssocAPICall(splitarr[0]);
    },

    /*
    To construct header data for list view popup
    */
 
    headerdataConstruct: function(table_info,controller) {
        /*heaader data construct for the sla-service templates list view */

          var tableWidth=700;
          var templateWidth=((tableWidth*50)/100)+"px";//NO I18N
          var is_defSLA_width=((tableWidth*16)/100)+"px";//NO I18N
          var sla_info_width=((tableWidth*34)/100)+"px";//NO I18N
          var show_to_ug_width=((tableWidth*10)/30)+"px";//NO I18N
          var sla_info_title=translate('common.info.label',[translate('sdp.admin.sla.title')])
          
          var meta_data = {
                "service_template_sla_associations_head_chk": {// No I18N
                  "type":"checkbox",//No I18N
                  "dataCelltransformer":controller.row_construct_chck_box // No I18N
                },
                "edit_chk": { // No I18N
                  "type":"icon",//No I18N
                  "dataCelltransformer":controller.row_construct_edit_icon // No I18N
                },
                "template.name":{ // No I18N
                  "text":"sdp.admin.requesttemplate.template", // No I18N
                  "dataCelltransformer" : controller.row_construct_template_field, // No I18N
                  "width":templateWidth//No I18N
                },
                "is_default_sla": { // No I18N
                  "text": "isdefault.sla.title", // No I18N
                  "disableSorting":true,// No I18N
                  "disableSearching":true,// No I18N
                  "dataCelltransformer" : controller.row_construct_default_sla, // No I18N
                  "width":is_defSLA_width//No I18N
                },
                "info": { // No I18N
                  "text": sla_info_title, // No I18N
                  "disableSorting":true,//No I18N
                  "disableSearching":true,// No I18N
                  "dataCelltransformer" : controller.row_construct_sla_info, // No I18N
                  "width":sla_info_width//No I18N
                },
                "show_to_ug":{// No I18N
                    "text": "show.usr.group.label", // No I18N
                    "disableSorting":true,//No I18N
                    "disableSearching":true,// No I18N
                    "dataCelltransformer" : controller.row_construct_show_to_ug, // No I18N
                    "width":show_to_ug_width//No I18N
                } 
              }; 
          return meta_data;
    },

    /*
    To construct checkbox for template association popup
    */

    row_construct_chck_box:function(table_data,cntrlr){

       var row_data=table_data.row_data;
       var col_str='<input type="checkbox" value='+e_attr(row_data.id)+' data-table-checkbox>';
       return col_str;
    },

    /*
    To construct sla info column in associated template popup
    */
    row_construct_sla_info:function(table_data,cntrlr){

       var row_data=table_data.row_data;
       var styleToGrey=cntrlr.getInactiveStyle(row_data);
       var info=(row_data.info==null)?'-':(row_data.info);
       var col_str='<span rel="uitip" mode_ellipsis="true" title="'+e_attr(info)+'" class='+styleToGrey+'>'+e_html(info)+'</span>';
       return col_str;
    },

    /*
    To construct template column in popup
    */
    row_construct_template_field:function(table_data,cntrlr){
      var row_data=table_data.row_data;
      var template=row_data.template;
      var tempName=e_html(template.name);
      var arr=[row_data.id];
      var servCatName=e_html(template.service_category.name);
      var col_str='';
      var styleToGrey=cntrlr.getInactiveStyle(row_data);
      var inactiveKey;

      if(!template.deleted){
        col_str+='<a data-attr="sla-listview-associated-temp-name" data-id="'+arr+'" href="/" rel="uitip" mode_ellipsis="true" title="'+e_attr(template.name)+'" name="TempName" class="'+styleToGrey+'">'+tempName+'</a>';
      }else{
        if(template.deleted){
            inactiveKey='('+translate('common.inactive.entity',[translate('sdp.admin.requesttemplate.template')])+' ) ';
            col_str+='<span class="fr fontgray pl10">'+inactiveKey+'</span>';//NO I18N
        }
        col_str+='<span class="cur-def '+styleToGrey+'">'+tempName+'</span>';
      }
      
        col_str+='<br><span rel="uitip" mode_ellipsis="true" title="'+e_attr(template.service_category.name)+'" class="text-muted '+styleToGrey+'">'+servCatName+'</span>';
        return col_str;
    },

    row_construct_edit_icon:function(table_data,cntrlr){
     /* consructing row for the edit action icon*/

      var row_data=table_data.row_data;
      var template=row_data.template;
      var arr=[row_data.id];
      var editSLATitle=translate('edit.sla.popup.title');
      var col_str='';
      var slaObj=cntrlr.slaObj;
      var styleToGrey=cntrlr.getInactiveStyle(row_data);

      col_str='<button data-attr="sla-listview-associated-temp-editicon" data-id="'+arr+'" class="btn btn-link btn-xs" rel="uitip" title="'+editSLATitle+'">';//NO I18N
      col_str+='<span aria-hidden="true" class="cspr edit icon-sm"></span></button>';
        return col_str;
    },

    row_construct_default_sla:function(table_data,cntrlr){
      /* consructing row for the is default sla */

      var row_data=table_data.row_data;
      var is_default_sla=row_data.is_default_sla;
      var col_str='';
      var styleToGrey=cntrlr.getInactiveStyle(row_data);

        if(is_default_sla){
            col_str='<span rel="uitip" aria-hidden="true" class="cspr enable icon-sm'+styleToGrey+'" title="'+translate('sla.association.default')+'"></span>';
        }
        else{
            col_str='<span aria-hidden="true" class="cspr disable icon-sm '+styleToGrey+'" title="'+translate('sla.association.nondefault')+'"></span>';
      }
        return col_str;
    },

    row_construct_show_to_ug:function(table_data,cntrlr){
        /* consructing row for the user group visibility */

      var row_data=table_data.row_data;
      var ug_count=row_data.user_groups_count;
      var tempUsersi18n=translate('template.users.label');
      var usrGrpsI18n=translate('sdp.admin.group.user');
      var styleToGrey=cntrlr.getInactiveStyle(row_data);
      var ugVal,col_str;

        if(ug_count<=0){
            ugVal=tempUsersi18n;
        }else{
            ugVal='('+ug_count+') '+usrGrpsI18n;// No I18N
        }
      col_str='<span class='+styleToGrey+'>'+ugVal+'</span>';
        
        return col_str;
    },

    rowdataConstruct : function(table_info,controller){        
    /* consructing row for the list view */

      var inputObject = {};
      inputObject.list_info = table_info.list_info;
      return inputObject;
    },

    addInactiveStyle:function(form)
    {
        /* adding styles for the inactive sla */

        var inactive_html = '<div class="p20 sla-form"><div class="alert sb alert-info icon w-90per" role="alert"> <span class="msg">'+translate("common.inactive.entity",[translate("common.association")])+'</span><p class="tr mt-20 fr text-color4"><label class="radio-inline sla-select" for="mark-active"><input type="checkbox" name="mark-active" class="top2 pos-rel" id="mark-active"><span class="vmiddle pos-rel">'+translate("sdp.group.listview.markasactive")+'</span></label></p> </div></div>';
        jQuery(inactive_html).insertBefore(jQuery("#"+form.formid+" [data-fname='sla']"));
    },

    getInactiveStyle:function(row_data){

        /* getting  styles for the inactive sla */
        var asscnInactive=row_data.deleted;
        var tempInactive=row_data.template.deleted;
        var sla=this.slaObj;
        var styleToGrey=(asscnInactive||tempInactive)?'fontgray':'';//NO I18N
        return styleToGrey;
    },

    /*
    For edit already associated template popup
    */
    editAssocAPICall:function(asscnId,fromTemplate){
        var asscnObj;
        sdpAjax({
                method:'GET',// No I18N
                url: '/api/v3/service_template_sla_associations/'+asscnId, // No I18N
                async:false,
                success: function(resp) {
                   asscnObj=resp.service_template_sla_association;
                },
                cache: false
        });

        serviceSLATemplates.associateNewSla("editSLAAssociation",asscnObj); // No I18N
    },


    /*
    To list out service categories available
    Removing already associated templates from the list
    */
    formatToServCat:function(resultArr){
        
        var allServiceCategories = resultArr.map(result => result.service_category.id);
        allServiceCategories = [...new Set(allServiceCategories)];
        var servCatArr = [];
        allServiceCategories.forEach(function(category_id)
        {
            var templates = resultArr.filter(result => result.service_category.id == category_id);

            if(serviceSLATemplates.templatesAlreadySelected.length)
            {
                templates = templates.filter(function(temp) 
                {
                    return !serviceSLATemplates.templatesAlreadySelected.includes(temp.id);
                });
            }

            if(templates.length)
            {   
                var text = templates[0] && templates[0].service_category && templates[0].service_category.name ? templates[0].service_category.name : "";   
                var lastServCatObj={"category_id":category_id,"text":text,"children":templates};// No I18N
                servCatArr.push(lastServCatObj);
            }
        });

        return servCatArr;
    },
    afterRenderCallbackForDetailTable: function(){
        serviceSLATemplates.showTotalCount();
        jQuery("#service_template_sla_associations_kanban_div").off('click').on('click', '[data-attr="sla-associated-temp-id"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            serviceSLATemplates.dissociateTemp(eleDataset.id);
        })
    },

    afterRenderCallbackForListTable: function(){
        serviceSLATemplates.showTotalCount();
        jQuery("#service_template_sla_associations_div").off('click').on('click', '[data-attr="sla-listview-associated-temp-name"],[data-attr="sla-listview-associated-temp-editicon"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            serviceSLATemplates.editAssociation(eleDataset.id);
        })
    }
}