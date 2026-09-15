/* $Id$ */
var taskTemplateTableComp;
var $taskTemplateList = {
    /*
        *A function to render Task Template ListView
        *@PARAM options - Associated Entity Details
    */
    init: function (options) {
        _self = this;
        var table_info = table_comp.getTableInfo("task_templates"); // No I18N
        _self.options = options;

        if(_self.options.module == "release" || _self.options.module == "change"){
            jQuery("#stageDropDown").sdp_select2({
                acceptODCompatible : true,
                width: "200px",//No I18N
                url:[{
                    url:"/api/v3/"+_self.options.module +"s/"+_self.options.moduleId+"/tasks/stage", // No I18N
                    field:'stage', // No I18N
                    list_info:{ start_index:1, row_count:20}
                }]
            });

            if(_self.options.stageId && _self.options.stageId !=0){
                _self.options.selected_stage = _self.options.stageId;
                window.top.$rc.stagesArray.filter(function(option){
                    if(_self.options.stageId == option.id){
                        jQuery("#stageDropDown").select2("data", {"id": option.id, "text":option.name});// NO I18N
                        return;
                    }
                });
                jQuery('#stageDropDown').select2("readonly", true ); // No I18N
            }
            jQuery("#stageDropDown").on('change', function(){ _self.options.selected_stage = jQuery('#stageDropDown').val(); }); //NO I18N
        }

        var options = {};
        options.paginationEnabled    = options.columnChooserEnabled = options.isFR_ListInfo_Support   = true;
        options.searchEnabled        = options.sortingEnabled       = options.support_search_criteria = true;
        options.isODAPI              = options.getmetaInfo          = options.acceptODCompatible      = true;
        options.bulkSelectionSetting = {};

        options.personalize_key      = "task_templates"; // No I18N
        options.entity_name          = "template"; // No I18N
        options.tableHolder          = "task_templates"; // No I18N
        options.discarded_fields     = ["associated_entity", "associated_modules", "index", "inactive", "description", "marked_group", "marked_owner"]; // No I18N
        options.must_included_fields = ["marked_group", "marked_owner"]; // No I18N
        options.callbackURL          = _self.options.module+"s/"+_self.options.moduleId+"/tasks/template"; // No I18N
        if(_self.options.module == "milestone"){
            options.callbackURL = "projects/"+_self.options.projectId+"/"+options.callbackURL;//NO I18N
        }else if(_self.options.module.startsWith("cm_")){//NO I18N
            options.callbackURL      = _self.options.module+"/"+_self.options.moduleId+"/tasks/template"; // No I18N
        }
        options.metainfo_entity = options.callbackURL;
        options.callbackRowfunction  = _self.rowdataConstruct;
        options.row_inputdata        = _self.rowdataConstruct(table_info);
        options.callbackInputdata       = function(inputObject){
            var sortField = inputObject.list_info.sort_field || (this.tempObj && this.tempObj.sortField);
            var sortOrder = inputObject.list_info.sort_order || (this.tempObj && this.tempObj.sortOrder);
            if(sortField ==="owner" || sortField === "group"){
                inputObject.list_info.sort_fields=[{"field":sortField+".name","order":sortOrder},{"field":"marked_"+sortField+".name","order": sortOrder}];// NO I18N
                this.tempObj = {"sortField":sortField, "sortOrder": sortOrder}; //NO I18N
                delete inputObject.list_info.sort_field;
                delete inputObject.list_info.sort_order;
            }
            return inputObject;
        }
        taskTemplateTableComp = new tableComponent(table_info,{"header":_self.headerdataConstruct()},options);// No I18N
    },
    rowdataConstruct: function (table_info) {
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        inputObject.fields_required = Object.keys(table_info.fields_required);

        if(inputObject.fields_required.contains("owner")){ inputObject.fields_required.push("marked_owner"); } //No I18N
        if(inputObject.fields_required.contains("group")){ inputObject.fields_required.push("marked_group"); } //No I18N

        return inputObject;
    },
    headerdataConstruct : function () {
        return {
            // ui review changes -handled for change module alone
            "task_templates_head_chk" : this.options.module==='change'?{ "type" : "checkbox", "default" : true , "dataCelltransformer" : _self.constructCheckBox}:{ "type" : "checkbox", "default" : true}, //No I18N
            "name"                    : { "dataCelltransformer":_self.constructNameCell, "default" : true }, //No I18N
            "title"                   : { "default" : true }, //No I18N
            "group"                   : { "dataCelltransformer" : _self.constructGroupCell }, //No I18N
            "owner"                   : { "dataCelltransformer" : _self.constructOwnerCell },//No I18N
            "estimated_effort"        : { "type": "datetime" }, //No I18N
            "status": {"value_path": "status.name"}, //No I18N
            "priority": {"value_path": "priority.name"}, //No I18N
            "type": {"value_path": "type.name"}, //No I18N
            "created_by": {"value_path": "created_by.name"} //No I18N
        };
    },
    constructCheckBox: function(table_data){
        return '<div class="d_w w-30px"><input type="checkbox" value="'+ table_data.row_data.id +'" data-table-checkbox=""></div>';
    },
    constructNameCell : function (table_data){
        var row_data = table_data.row_data;
        return '<a class="cur-ptr" title="'+e_attr(row_data["name"])+'" data-event="click" data-handler="$taskTemplateList.toggleView(true,'+row_data.id+');" nonce='+sdpNonce+' rel="uitip" mode_ellipsis="true" target="PreviewFrame">' + e_html(row_data["name"]) + '</a>';
    },
    constructGroupCell : function (table_data){
      var row_data = table_data.row_data;
      if(row_data.marked_group != null){
        return '<span><img class="mark-icon top0 mr5" rel="uitip" title="'+translate('task.marked.markedtooltip')+'" src="../images/spacer.gif">'+e_html(row_data.marked_group.name)+'</span>';
      }else if(row_data.group != null){
        return '<span>'+e_html(row_data.group.name)+'</span>';
      }
      return '-';
    },
    constructOwnerCell : function (table_data){
        var row_data = table_data.row_data;
        if(row_data.marked_owner != null){
            return '<span><img class="mark-icon top0 mr5" rel="uitip" title="'+translate('task.marked.markedtooltip')+'" src="../images/spacer.gif">'+e_html(row_data.marked_owner.name)+'</span>';
        }else if(row_data.owner != null){
            return '<span>'+e_html(row_data.owner.name)+'</span>';
        }
        return '-';
    },
    /*
        *A function to create task from selected templates
    */
    addTasks : function() {
        var selVals = taskTemplateTableComp.bulkSelect.getSelectedIDs();
        var templates = [];

        if(_self.options.module == "release" || _self.options.module == "change" ){
            if(_self.options.selected_stage){
                for (var i = 0; i < selVals.length; i++) {
                  templates[i] = {"template":{"id": selVals[i]},"stage":{"id":_self.options.selected_stage}}; // No I18N
                }
            }else{
                showalert('failure',translate("sdp.admin.change.report.stagemsg"),'isAutoHide=false');//No i18N
                return false;
            }
        }else{
            for(var i = 0; i < selVals.length; i++) {
                templates[i] = {"template":{"id": selVals[i]}}; // No I18N
            }
        }
        var url = _self.options.module+"s/"+_self.options.moduleId+"/tasks"; // No I18N
        if(_self.options.module == "milestone"){
            url = "projects/"+_self.options.projectId+"/"+url;//NO I18N
        }else if(_self.options.module.startsWith("cm_")){//NO I18N
            url = _self.options.module+"/"+_self.options.moduleId+"/tasks"; // No I18N
        }
        sdpAjax({
            url : "/api/v3/"+url,// No I18N
            type : 'POST', acceptODCompatible: true, async : false, // No I18N
            data : sdpAjaxInputData({"tasks":templates}), // No I18N
            success : function(resp){
                var successmsg = translate("sdp.admin.tasktemplate.addbulktasks.success");
                if(jQuery.isArray(resp.response_status)){
                    window.top.$tasks.successMessageHandling(resp, successmsg, true);
                }else{
                    showalert('success', successmsg,"isAutoHide=true"); // No I18N
                }
                window.top.table_comp_task.refreshTable();
                taskTemplateTableComp.refreshTable();
            },
            error: function(xhr){
                window.top.$tasks.successMessageHandling(xhr.responseJSON, translate("sdp.admin.tasktemplate.addbulktasks.success"), true);
                window.top.table_comp_task.refreshTable();
                taskTemplateTableComp.refreshTable();
            }
        });
    },
    /*
        *@PARAM isPreview - Template listView or Preview
        *@PARAM templateId - Task Tempalteid for which the preview has to be shown
    */
    toggleView : function (isPreview, templateId) {
          var metaData;
        if(isPreview) {
              sdpAjax({
                url: '/api/v3/'+taskTemplateTableComp.t_obj.options.callbackURL+'/metainfo',// No I18N
                acceptODCompatible: true, async: false,
                success: function(resp){
                    metaData = resp.metainfo.fields;
             }
            });
            sdpAjax({
                url: '/api/v3/'+taskTemplateTableComp.t_obj.options.callbackURL+'/'+templateId,// No I18N
                acceptODCompatible: true, async: false,
                success: function(resp){
                    var labels = metaData;
                    var udfObject;
                    var labelsToDelete = [
                      'created_time','associated_entity','associated_modules','created_by','id','inactive','index','name', 'marked_owner', 'marked_group'// No I18N
                    ];
                    for (var property in labels) {
                      if (labelsToDelete.includes(property)) {
                        delete labels[property];
                      }
                    }
                   if(Object.keys(labels.udf_fields.fields).length > 0){
                         udfObject = labels.udf_fields.fields;
                         delete labels["udf_fields"];
                    }
                    task_template                  = resp.task_template
                    task_template.status           = task_template.status.name;
                    task_template.type             = task_template.type        ? task_template.type.name     : '-'; // No I18N
                    task_template.priority         = task_template.priority    ? task_template.priority.name : '-'; // No I18N
                    task_template.description      = task_template.description ? appendImageToken(task_template.description,task_template.image_token) : '-'; // No I18N
                    task_template.group            = _self.constructGroupCell({"row_data":task_template}); // No I18N
                    task_template.owner            = _self.constructOwnerCell({"row_data":task_template}); // No I18N
                    task_template.estimated_effort = task_template.estimated_effort.display_value;
                    //for picklist and date time udf it will be a
                    //json object so to display, extracting name and display value else putting a hipen
                    if (task_template.udf_fields) {
                            var udf_fields = task_template.udf_fields;
                            for (var key in udf_fields) {
                              if (udf_fields[key]!=null && typeof udf_fields[key] === 'object') {
                                const { name, display_value } = udf_fields[key];
                                task_template[key] = name || display_value || "-";
                              }else if(udf_fields[key]!=null && typeof udf_fields[key] === 'string'){
                                task_template[key] = udf_fields[key];
                              }else if(udf_fields[key]==null){ task_template[key] = '-';}
                            }
                    }

                    delete task_template.marked_owner;
                    delete task_template.marked_group;

                    renderhbs("#Preview","TaskTemplatePrintView",{"resp":task_template, "labels":labels , "udfLabels":udfObject}, false,"task"); // No I18N
                    jQuery('#taskListRow').hide();// No I18N
                    jQuery('#Preview').removeClass("hide");// No I18N
                    initTooltip("#Preview");// No I18N
                }
            });
        }else {
            jQuery('#Preview').html("").addClass("hide");// No I18N
            jQuery('#taskListRow').show();// No I18N
        }
    }
}