/* $Id$ */
var taskFormComp;
var $taskForm = {
    /*
        *A function to form fields for Form Component
        *@PARAM options - Associated entity details
    */
    initialize: function(options) {
        options.mode = options.mode == "detail" ? "view" : (options.taskId ? "edit" : "new")//No I18N

        var _self = this;
        _self.options = options;

        var section0 = {
            "name": "", "column_count": "2",//No I18N
            "fields": { "template": {} }//No I18N
        };
        if (_self.options.module == "release" || _self.options.module == "change") {
            section0.fields.stage = {};
            if (_self.options.stageId || _self.options.mode == "edit") {
                section0.fields.stage.disabled = _self.options.module == "change"?false:true;// NO I18N
                if(!_self.options.taskId){
                   var stage;
                   window.top.$rc.stagesArray.filter(function(option){
                       if(_self.options.stageId == option.id){
                           stage = {"id": option.id, "text":option.name};// NO I18N
                           return;
                       }
                   });
                   if(_self.options.entity_data){
                      _self.options.entity_data.stage = stage;
                   }else{
                      _self.options.entity_data = {"stage": stage}; //No I18N
                   }
                }
            }
        }
        var section1 = {
            "name": "", "column_count": "2",//No I18N
            "fields": {//No I18N
                "title": {"constraints": {"max_length": 250 } },//No I18N
                "status": {"allowClear": false }//No I18N
            },
        };
        var section2 = {
            "name": "", "column_count": "1",//No I18N
            "fields": {//No I18N
                "description": {height: '12'}//No I18N
            },
        };
        var section3 = {
            "name": "", "column_count": "2",//No I18N
            "fields":{//No I18N
                "group":{}, "milestone" : {//No I18N
                    search_keys:["title"],
                    onchange: $taskForm.loadStartEndTimeMsg,
                    input_data_Callback: function(form, input_data){
                        input_data.list_info.sort_field="title";//No I18N
                        input_data.list_info.sort_order="asc";//No I18N
                        return input_data;
                    }
                },
                "owner": {//No I18N
                    techStatus : (['project','milestone'].contains(_self.options.module) || _self.options.module.startsWith("cm_") || window.isMSPOrSCP )?false:true,       //No I18N
                    input_data_Callback: function (e, t, s) {
                        t.list_info.fields_required = ["name", "is_online"];    //No I18N
                        let criteria = Object.keys(t.list_info.search_criteria).length === 0 ? [] : t.list_info.search_criteria;
                        if(e.formcomp.fields.group && e.formcomp.fields.group.current_value){
                            criteria.push({
                                field: "support_group", //No I18N
                                condition: "is",    //No I18N
                                value: e.formcomp.fields.group.current_value.id,
                                logical_operator: "AND" //No I18N
                            });
                            if(criteria[0] && criteria[0].field == "group.id"){
                                criteria.shift();
                                criteria[0].logical_operator = "AND"; //No I18N
                            }
                        }
                        if(e.formcomp.fields.owner.online){
                            criteria.push({
                                field: "is_online", //No I18N
                                condition: "is",    //No I18N
                                value: "1",
                                logical_operator: "AND" //No I18N
                            });
                        }
                        if(criteria.length > 0) {
                            if(criteria.length === 1) {
                                t.list_info.search_criteria = criteria[0];
                            } else {
                                t.list_info.search_criteria = criteria;
                            }
                        }
                        return t;
                    }
                }
            },
        };
        var section4 = {
            "name": "", "column_count": "2",//No I18N
            "fields": {//No I18N
               "priority": {}, "type": {},//No I18N
               "scheduled_start_time": {}, "actual_start_time": {},//No I18N
               "scheduled_end_time"  : {}, "actual_end_time": {}, //No I18N
               "estimated_effort": {"custom_render": _self.loadEstimatedEffortField }, //No I18N
               "percentage_completion": { "constraints" : { min: 0, max: 100 } }, //No I18N
               "additional_cost": {"constraints" : { min: 0 } },//No I18N
               "email_before":{"disableSort": true}, "attachments": {}//No I18N
            },
        };
         var section5 = {
             "name": getMessageForKey("sdp.admin.leftpanel.customfields.home"), // No I18N
             "fields": { // No I18N
                 "udf_fields": {} // No I18N
             },
             "column_count": "2" //No I18N
         };

        var form_sections;
        if(_self.options.mode == "view"){
            section1.fields.stage = {};
            section3.fields.group.custom_render = _self.createDetailsGroupOwnerCell;
            section3.fields.owner.custom_render = _self.createDetailsGroupOwnerCell;
            section4.fields = {
                "priority": {},//No I18N
                "status": {"allowClear": false }, //No I18N
                "scheduled_start_time" : {}, "actual_start_time": {},//No I18N
                "scheduled_end_time"   : {}, "actual_end_time": {}, //No I18N
                "type" : {},//No I18N
                "percentage_completion": { "constraints" : { "min": 0, "max": 100 } }, //No I18N
                "estimated_effort": { "custom_render": _self.loadEstimatedEffortField }, //No I18N
                "additional_cost": {"constraints" : { "min": 0 } }, //No I18N
                "created_by":{}, "created_time":{}//No I18N
            }
            if(window.checkIfMSPOrSCP()){
	            $taskForm.mspForm.includeMSPFields(_self.options.module, _self.options.mode, section3, section4);
			}
            delete section3.fields.milestone;
            _self.options.module == 'general' && delete section3.fields.group;//No I18N

            form_sections = [section3, section4,section5];
        }else{
            !["project", "milestone"].contains(_self.options.module) && delete section3.fields.milestone;//No I18N
            if(window.checkIfMSPOrSCP()){
	            $taskForm.mspForm.includeMSPFields(_self.options.module, _self.options.mode, section3, section4);
			}
		form_sections = [section0, section1, section2, section3, section4,section5];
            jQuery("#TaskForm").on("editLoaded", function() { //No I18N
                taskFormComp.focusField("title");//No I18N
                if($taskForm.options.from == "scheduler"){
                    taskFormComp.setFieldValue("owner", { "id": sdp_user.LOGGEDIN_USERID, "name": sdp_user.USERNAME});//No I18N
                    taskFormComp.setFieldValue("scheduled_start_time", options.startTime);//No I18N
                    taskFormComp.setFieldValue("scheduled_end_time", parseInt(options.startTime)+86340000);//No I18N
                }
                if(window.checkIfMSPOrSCP() && _self.options.from == "account"){
                    var acc=window.top.$taskList.taskOptions.acc_Id;
                    taskFormComp.setFieldValue("account",acc);//No I18N
                    taskFormComp.disableField("account");//No I18N
                }
            });
        }
        ["project", "milestone", "general"].contains(_self.options.module) && delete section3.fields.group;//No I18N
        _self.initializeForm(form_sections);
    },

    /*
        *A function to show confirmation popup for task dependency scheduling in task edit form
    */
    loadConfirmationForTaskDependency: function(field, form, event){
        if(!(field.value == field.current_value.value) && $taskForm.options.isTaskDependencySettingEnabled && !(field.value == null || field.current_value == null)){
            if (!taskFormComp.validateField(field.id)){return;}
            showconfirm(true,
            "title="+translate('common.confirm')+"," + //No I18N
            "message=" + translate("project.validation.horizontal.propagate.alert") + "," + //No I18N
            "submitbutton=" + translate("common.proceed") + "," + //No I18N
            "cancelbutton=" + translate("common.no") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes",// NO I18N
            plainTextConfirmation, true);
            function plainTextConfirmation(confirm){
                if(!confirm){
                    if($taskForm.options.mode == "edit"){taskFormComp.safeSetFieldValue(field.name,+field.value);}
                    else{jQuery("#"+field.id+"_actions .spot-cancel").trigger("click");}
                }
                else{
                    if($taskForm.options.mode == "edit"){field.value = field.current_value.value;return true;}
                    else{jQuery("#"+field.id+"_actions  .spot-save").trigger("click");}
                }
            }
        }
    },

    /*
        *A function to show Scheduled start and end of milestone in task edit form
        *@PARAM field - milestone
    */
    loadStartEndTimeMsg: function(field) {
        var ele = jQuery('#milestoneTime');
        if(ele.length) {
            ele.remove();
        }
        var milestoneId = field.current_value && field.current_value.id;
        if(milestoneId) {
            var time = $taskForm.options.milestoneTimeMap[milestoneId];
            if(time) {
               jQuery('#milestone_control').append('<div id="milestoneTime" class="pt5 font-small fontgray">' + time + '</div>');
            }
        }
    },
    /*
        *A function to show/hide inlineform for EstimatedEffort
        *@PARAM arg - Edit or Cancel
    */
    constructInlineEstimatedEffort: function(arg){
        if(arg == "edit"){//No I18N
            jQ("#Details_EstimatedEffort").hide();//No I18N
            jQ('#estimated_effort_actions').removeClass("hide");//No I18N
        }
        else if(arg == "cancel"){//No I18N
            $taskForm.estimatedEffortTaken($taskForm.entitydata.estimated_effort);
            jQ("#Details_EstimatedEffort").show();//No I18N
            jQ('#estimated_effort_actions').addClass("hide");//No I18N
        }
    },
    /*
        *A function to load estimated effort field in forms
        *@PARAM tabIndex - provided from Component side for form field navigation
    */
    loadEstimatedEffortField: function(tabIndex) {
        var html = "";
        var estimated_effort = ($taskForm.entitydata && $taskForm.entitydata.estimated_effort) ? $taskForm.entitydata.estimated_effort : {};

        var estEfrtHTML = '<div class="form-inline input-time-inline pos-rel o-wrt-framework-fc">';
        estEfrtHTML    += '<div class="form-group input-group addon-nofill pr5 mr15"><input type="text" tabIndex='+tabIndex+' id="Estimated_Effort_Days" value="'+(estimated_effort.days || 0)+'" class="form-control" name="Estimated_Effort_Days" data-event="change" data-handler="$taskForm.setEstimatedEffort()" nonce="'+sdpNonce+'"'+($taskForm.options.mode === "view"? 'data-event="blur" data-handler="checkNumeric(this,\'int\')" nonce="'+sdpNonce+'"':'')+' style="min-width:37px;"><span class="input-group-addon pl0"  style="max-width: 51px;width: 50px;">' + translate("common.days") + '</span></div>';
        estEfrtHTML    += '<div class="form-group input-group addon-nofill pr5 mr15"><input type="text" tabIndex='+tabIndex+' id="Estimated_Effort_Hours" value="'+(estimated_effort.hours || 0)+'" class="form-control" name="Estimated_Effort_Hours"   data-event="change" data-handler="$taskForm.setEstimatedEffort()" nonce="'+sdpNonce+'"'+($taskForm.options.mode === "view"? 'data-event="blur" data-handler="checkNumeric(this,\'int\')" nonce="'+sdpNonce+'"':'')+' style="min-width:37px;"><span class="input-group-addon pl0"  style="max-width: 51px;width: 50px;">' + translate("sdp.projects.daydiff.hour") + '</span></div>';
        estEfrtHTML    += '<div class="form-group input-group addon-nofill mr15"><input type="text" tabIndex='+tabIndex+' id="Estimated_Effort_Minutes" value="'+(estimated_effort.minutes || 0)+'" class="form-control" name="Estimated_Effort_Minutes"   data-event="change" data-handler="$taskForm.setEstimatedEffort()" nonce="'+sdpNonce+'"'+($taskForm.options.mode === "view"? 'data-event="blur" data-handler="checkNumeric(this,\'int\')" nonce="'+sdpNonce+'"':'')+' style="min-width:37px;"><span class="input-group-addon pl0" style="max-width: 51px;width: 50px;">' + translate("sdp.projects.daydiff.minute") + '</span></div>';
        estEfrtHTML    += '<span class="cspr helpText info icon-sm vshow pos-abs right5 top5" rel="uitip" rel-dir="right" rel-pr="5" rel-pl="5" help-title= \''+translate("sdp.tasks.estimatedeffort.info.msg")+'\' rel-class="help-text" rel-help-icon="true" style="visibility: hidden;z-index:10;"></span></div>';

        if($taskForm.options.mode == "view") {
            var canEdit = $taskForm.options.canEdit;
            html = '<span elemtype="textbox" id="Details_EstimatedEffort"'+(canEdit ? 'class="form-control-static spot-static" data-event="click" data-handler="$taskForm.constructInlineEstimatedEffort(\'edit\')" nonce='+sdpNonce : '') + '>'+estimated_effort.display_value+'</span>';//No I18N
            if(canEdit){
                html +=  '<div id="estimated_effort_actions" class="spot-form hide">';
                html += '<div id="estimated_effort_control" class="control-holder fw">' + estEfrtHTML + '</div><!--/.control-holder-->'; //No I18N
                html += '<div id="estimated_effort_actions" class="spot-actions">';//No I18N
                html += '<button type="button" class="spot-save btn btn-sm btn-link" title="'+translate('common.save')+'" data-event="click" data-handler="$taskForm.setEstimatedEffort(\'details\')" nonce='+sdpNonce+'>';//No I18N
                html += '<span class="spot-icon success mr5"></span>';//No I18N
                html += '</button>';//No I18N
                html += '<button type="button" class="spot-cancel btn btn-sm btn-link" title="'+translate('sdp.common.cancel')+'" data-event="click" data-handler="$taskForm.constructInlineEstimatedEffort(\'cancel\')" nonce='+sdpNonce+'>';//No I18N
                html += '<span class="spot-icon failure icon-xs"></span>';//No I18N
                html += '</button></div><!--/.spot-actions--></div><!--/.spot-form-->';//No I18N
            }
            return html;
        }
        return estEfrtHTML;
    },
    /*
        * A function to contruct Group Owner cell in Details page
    */
    createDetailsGroupOwnerCell: function(){
        var _self = this;
        var row_data  = _self.parent.entitydata;
        var inlineStr = $tasks.constructGroupOwnerField("details",_self.id,row_data);//No I18N
        if($taskForm.options.canEdit){
            return "<span class='cur-ptr form-control-static spot-static' data-event='click' data-handler=\"$tasks.BEA_Show_bem_dialog(\'details\', "+row_data.id+",this)\" nonce="+sdpNonce+">"+inlineStr+"</span>";//No I18N
        }
        return inlineStr;
    },
    /*
        *A function to add owner and group field as changed values when MarkAssign button is toggled
        *@PARAM btn Markassign Button hmtl element
    */
    markOwnerGroup: function(btn) {
        var _self = this;
        var markAssignOwner = (taskFormComp.entitydata && taskFormComp.entitydata.marked_owner != null) ? "mark": "assign";//No I18N
        //when changing toggle mark/assign, we have to push group and owner as changed fields, to update them later
        if ($taskForm.options.mode == "edit" && btn != markAssignOwner) {
            var formId = jQuery("#task-container").find("[data-id='form-fixed-wrapper']").attr("data-formid");
            var owner_id = jQuery('#s2id_for_owner').select2("data");   //No I18N
            if (owner_id) {
                FC_Mapper[formId].fields.values.owner = owner_id;
                FC_Mapper[formId].fields.changed.push("owner");
            }
            //incase of assign, push changed group only any group is present
            if (FC_Mapper[formId].fields.values.group && FC_Mapper[formId].fields.values.group != null) {
                FC_Mapper[formId].fields.changed.push("group");
            }
        }
    },
    /*
        * A function where form component is intialized
        *@PARAM form_sections - required Form fields separated by sections
    */
    initializeForm: function(form_sections) {
        var _self = this;
        var forParam;
        if(_self.options.mode === "edit"){
          _self.options.url += "/"+ _self.options.taskId;
        }
        if(_self.options.mode === "view" && _self.options.module === "request"){
            /* To include inactive resource questions under request metainfo */
            forParam = "details_page"; //No I18N
        }
        _self.options.attachments_url = _self.options.url;
        _self.meta_info = $tasks.getMetainfo(_self.options.url, forParam);
        _self.meta_info.fields.template.display_name = translate("sdp.admin.tasktemplate.usetemplate");
        _self.meta_info.fields.additional_cost.display_name += " ("+sdp_app.CURRENCY_SYMBOL+")";

        if(!sdp_user.EMAILID){
            delete _self.meta_info.fields.email_before;
        }
        for(field in _self.meta_info.fields){
            if(_self.meta_info.fields[field].type == "lookup"){
                _self.meta_info.fields[field].sort = false;
            }
            if(field == "milestone"){
                _self.meta_info.fields[field].display_type = "Pick List";
                if(_self.options.module == 'milestone' && _self.options.mode == "new"){
                    _self.meta_info.fields[field].default_value = {"id": _self.options.moduleId, "text": window.top.jQuery("#header_milestone_title").text()};//No I18N
                }
            }

            if(field == "email_before"){
                _self.meta_info.fields[field].display_type = "Pick List";
                _self.meta_info.fields[field].default_value = {"id":0, "text":translate("sdp.requests.viewrequest.noRefresh")}; // No I18N
            }
        }

        //after template change, to show the selected template
        if (_self.options.entity_data && _self.options.entity_data.task_template) {
            _self.meta_info.fields.template.default_value = _self.options.entity_data.task_template.default_value;
        }

        _self.entitydata = _self.options.entity_data ? _self.options.entity_data : (_self.options.taskId ? $tasks.getEntityData(_self.options.url) : "");
        if(_self.options.mode !== 'view' && _self.entitydata.description && _self.entitydata.image_token ){
            _self.entitydata.description = appendImageToken(_self.entitydata.description,_self.entitydata.image_token);
        }
        if (_self.options.mode === "edit") {
            if (_self.entitydata.marked_group) {
                _self.entitydata.group = _self.entitydata.marked_group;
            }
            if(_self.entitydata.milestone){
                _self.entitydata.milestone.name = _self.entitydata.milestone.title;
            }
        }

        var configJSON = {
            name       : "Tasks",//No I18N
            entity     : 'task',//No I18N
            container  : "task-container",//No I18N
            formid     : "TaskForm", //NO I18N
            entityName : translate("common.task"),
            customform : true,
            acceptODCompatible  : true,
            acceptODCompSelect2 : true,
            canEdit : (!_self.options.taskId) ? true : (_self.options.mode != "view" ? true : ((_self.options.mode == "view" && _self.options.canEdit) ? true : false)),//No I18N
            autoSaveTypes  : ["lookup"],//No I18N
            entitypath     : _self.options.url,
            entitydata     : _self.entitydata,
            skipEditFields : _self.options.mode == 'view' ? ["stage","created_by","created_time"] : "",//No I18N
            mode     : _self.options.mode,
            template : _self.constructLayoutObject(form_sections, _self.meta_info.fields),
            metadata : _self.meta_info,
            afterRenderCallback : _self.afterFormRender,
            inlineImagesEntity  : _self.options.module,
            allowedValues: {
                "email_before": [ //NO I18N
                    {"id": "Never", "name": translate("sdp.requests.viewrequest.noRefresh")},//NO I18N
                    {"id": 15*60*1000,      "name": "15 " + translate("sdp.projects.daydiff.minute")},//NO I18N
                    {"id": 30*60*1000,      "name": "30 " + translate("sdp.projects.daydiff.minute")},//NO I18N
                    {"id": 45*60*1000,      "name": "45 " + translate("sdp.projects.daydiff.minute")},//NO I18N
                    {"id": 1*60*60*1000,    "name": "1 "  + translate("sdp.projects.daydiff.hour")},//NO I18N
                    {"id": 2*60*60*1000,    "name": "2 "  + translate("sdp.projects.daydiff.hour")},//NO I18N
                    {"id": 6*60*60*1000,    "name": "6 "  + translate("sdp.projects.daydiff.hour")},//NO I18N
                    {"id": 12*60*60*1000,   "name": "12 " + translate("sdp.projects.daydiff.hour")},//NO I18N
                    {"id": 1*24*60*60*1000, "name": "1 "  + translate("sdp.projects.daydiff.day")},//NO I18N
                    {"id": 2*24*60*60*1000, "name": "2 "  + translate("common.days")},//NO I18N
                    {"id": 7*24*60*60*1000, "name": "1 "  + translate("sdp.home.week")} //NO I18N
                ]
            },
            linkedFields: [
                {
                    denote_field : ["scheduled_start_time"], //NO I18N
                    fields       : ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                    message      : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                    validation   : function(valueJson) { return !(valueJson.scheduled_end_time && (Number(valueJson.scheduled_start_time) > Number(valueJson.scheduled_end_time))) }
                },
                {
                    denote_field : ["actual_start_time"], //NO I18N
                    fields       : ["actual_start_time", "actual_end_time"], //NO I18N
                    message      : translate("api.validation.actualstart.actualend"), //NO I18N
                    validation   : function(valueJson) { return !(valueJson.actual_end_time && Number(valueJson.actual_start_time) > Number(valueJson.actual_end_time)) }
                },
                {
                    denote_field : ["Estimated_Effort_Minutes"], //NO I18N
                    fields       : ["Estimated_Effort_Days","Estimated_Effort_Hours","Estimated_Effort_Minutes"],//No I18N
                    message      : translate("sdp.admin.ad.schedule.invalidno"), //NO I18N
                    validation   : function(valueJson) {
                        if((valueJson.Estimated_Effort_Days.trim() != "" && !isNumeric(valueJson.Estimated_Effort_Days.trim()))
                            || (valueJson.Estimated_Effort_Hours.trim() != "" && !isNumeric(valueJson.Estimated_Effort_Hours.trim()))
                                || (valueJson.Estimated_Effort_Minutes.trim() != "" && !isNumeric(valueJson.Estimated_Effort_Minutes.trim()))){
                            return false;
                        }
                        return true;
                    }
                }
            ],
            save: {
                url: "/api/v3/" + _self.options.url,//No I18N
                entity: "task",//No I18N
                submit: true,
                submitbutton : {add : translate("common.save")},
                errorinterrupt:$taskForm.errorInterrupt,
                ignorefailuremessage: true,
                onsubmit: function(form, field, event, editType, callback){
                    if(form.fields.email_before && form.fields.email_before.current_value){
                        form.fields.email_before.current_value = form.fields.email_before.current_value.id == "Never"? 0 : form.fields.email_before.current_value.id;
                    }
                    if(form.fields.milestone && form.fields.milestone.current_value && form.fields.milestone.current_value.name){
                        form.fields.milestone.current_value.title = form.fields.milestone.current_value.name;
                        delete form.fields.milestone.current_value.name;
                    }
                    if($taskForm.options.mode === 'new' && form.fields.milestone && !(form.fields.milestone.current_value)) { //NO I18N
                        if((_self.options.url.indexOf('milestone')) > -1) { //NO I18N
                            configJSON.save.url = '/api/v3/projects/' + _self.options.projectId + '/tasks'; //NO I18N
                        }else{
                            configJSON.save.url = '/api/v3/projects/' + _self.options.moduleId + '/tasks'; //NO I18N
                        }
                        delete form.fields.milestone;
                    }
                },
                postsuccess: function(response,form) {
                    var activeWindow = $extFrame.getActiveWindow(parent.location.href);
                    //refer 'workLogForm.js' for usage of 'activeWindow' function
                    if(_self.options.mode == "edit" && jQuery.isArray(response.response_status)) {
                        $tasks.successMessageHandling(response, translate("sdp.project.history.taskupdated0"), true);
                    }else{
                        if(_self.options.mode !== "view"){ //NO I18N
                            //To Prevent the preview slider closing when its updated from bell notificaitons slider
                            activeWindow.$previewComponent.closePreview("taskmodule_popup");//No I18N
                        }
                    }
                    _self.options.mode != "view" && activeWindow.table_comp_task && activeWindow.table_comp_task.refreshTable();//No I18N
                    activeWindow.table_combined_task && activeWindow.table_combined_task.refreshTable();// For combinedVew and rq_leftPanel
                    if(_self.options.from == "detail"){
                        if(['milestone','project'].indexOf(_self.options.module) != -1){
                            var module, moduleId, projectId;
                            if(response.task.milestone){
                                moduleId = response.task.milestone.id;
                                module = "milestone";//NO I18N
                                projectId = response.task.project.id;
                            }else{
                                moduleId = response.task.project.id;
                                module = "project";//NO I18N
                            }
                            activeWindow.$taskDetails.options.module = module;
                            activeWindow.$taskDetails.options.moduleId = moduleId;
                            activeWindow.$taskDetails.options.projectId = projectId;
                            activeWindow.$taskDetails.options.url = $tasks.getEntityURL(module,moduleId, projectId);
                            activeWindow.$taskDetails.init(activeWindow.$taskDetails.options);
                        }else{
                            !activeWindow.$taskDetails.options.from && $tasks.updateParentTaskCount(_self.options.module, _self.options.moduleId);
                            $tasks.handlePermissionsForOwnerChange(false, null, form, _self);
                            activeWindow.$taskDetails.refreshTaskDetails(response.task);
                        }
                    }

                    if(_self.options.mode == "new"){
                        var successmsg =translate("api.added.success", [ taskFormComp.options.entityName ]);
                        if(jQuery.isArray(response.response_status)){//if status is closed when creating a task need to show task mandatory fields warning message.
                            activeWindow.$tasks.successMessageHandling(response, successmsg, true);
                        }else{
                            activeWindow.showalert("success", successmsg, "isAutoHide=true");  //No I18N
                        }
                    }else if(_self.options.mode == "edit" && !(jQuery.isArray(response.response_status))){//No I18N
                        activeWindow.showalert("success", translate("api.updated.success", [ taskFormComp.options.entityName ]), "isAutoHide=true");   //No I18N
                    }else if(_self.options.mode == "view"){//No I18N
                        if(form.fields.changed.includes("status")){
                            $tasks.successMessageHandling(response);
                        }
                        $taskDetails.refreshTaskDetails(response.task);
                    }
                    $tasks.addOverDueFlag()
                    $taskForm.refreshParentWindow(_self.options.from === "detail"? activeWindow.$taskDetails.options.from: _self.options.from);//No I18N
                },
                cancel: function() {
                    var activeWindow = $extFrame.getActiveWindow(parent.location.href);
                    activeWindow.$previewComponent.closePreview("taskmodule_popup");//No I18N
                }
            },
            dependentFields: [{
                fields: ["group", "owner"], //No I18N
                order: false
            }],
            edit: {
                defaults: {
                    lookup: { clear: true }
                },
                onchange: {
                    template: "$taskForm.chooseTaskTemplate",//No I18N
                    group: "$taskForm.selectedGroup",//No I18N
                    owner: "$taskForm.ownerChange",//No I18N
                    scheduled_start_time: "$taskForm.loadConfirmationForTaskDependency",//No I18N
                    scheduled_end_time: "$taskForm.loadConfirmationForTaskDependency"//No I18N
                },
                fields: {
                    milestone : {
                        processResults : function(search_data, resdata, resfield) {
                            if(resdata) {
                                search_data.push({
                                    id   : resdata.id,
                                    name : resdata.title ? resdata.title : resdata.name
                                });
                            }
                        }
                    }
                }
            }
        }
        if( window.checkIfMSPOrSCP() ){
	        $taskForm.mspForm.modifyConfigJSONForMSP(_self.options.module, _self.options.mode, configJSON);
        }
        if(_self.options.mode != "view"){
          configJSON.save.serializer = _self.updateData;
          configJSON.save.successinterrupt = function(){return true; };
        }else{
             configJSON.linkedFields.push(
                 {
                     denote_field : ["scheduled_end_time"], //NO I18N
                     fields       : ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                     message      : translate("api.validation.scheduledstart.scheduledend"), //NO I18N
                     validation   : function(valueJson) { return !(valueJson.scheduled_end_time && (valueJson.scheduled_start_time > valueJson.scheduled_end_time)) }
                 },
                 {
                     denote_field : ["actual_end_time"], //NO I18N
                     fields       : ["actual_start_time", "actual_end_time"], //NO I18N
                     message      : translate("api.validation.actualstart.actualend"), //NO I18N
                     validation   : function(valueJson) { return !(valueJson.actual_end_time && valueJson.actual_start_time > valueJson.actual_end_time) }
                 }
             );
         }

        if(_self.options.mode == "edit"){
            configJSON.allowedValues.email_before.filter(function(option){
                if(configJSON.entitydata.email_before == option.id){
                    configJSON.entitydata.email_before = {"id": option.id,"name": option.name}//No I18N
                }else if(configJSON.entitydata.email_before == '0'){//No I18N
                    configJSON.entitydata.email_before = {"id":"Never","name": translate("sdp.requests.viewrequest.noRefresh")};//No I18N
                }
            });
        //Handling for udf default values - on edit it default values should not get populated
        this.makeUdfFieldsEmpty(configJSON);

        }
         if(_self.options.entity_data && _self.options.entity_data.udf_fields)
         {this.makeUdfFieldsEmpty(configJSON);}//on choosing a template(entitydata will be loaded)
         taskFormComp = new FC(configJSON);    //default values from metadata should not get populated
         $se.page_scripts.render("all_page");
    },
    /*
        *A function to refresh Due Date in task Details page after update
        *@PARAM data - task data
    */
    // This function is not currently in use.
    refreshDueDate: function(data) {
        var scheduledEnd = data.task.scheduled_end_time

        var delayStr = scheduledEnd && scheduledEnd.days_diff.diff_key;
        jQuery("#task_delayStr").text(delayStr);
        jQuery("#DashInfo_taskdelay").html('<span class='+(delayStr && (delayStr === translate("sdp.projects.daydiff.late") || delayStr === translate("sdp.projects.daydiff.passed"))? 'listview-dateinfo-delay' : 'listview-dateinfo')+'>'+(scheduledEnd && scheduledEnd.days_diff.diff)+'</span>');

        if(!scheduledEnd) {
            jQuery("#task_delayTimeDiv").addClass('hide'); //No I18N
            jQuery("#DashInfo_taskscheduleend").text(translate("sdp.common.na"));
        }else{
            jQuery("#task_delayTimeDiv").removeClass('hide'); //No I18N
            jQuery("#DashInfo_taskscheduleend").text(data.task.due_by_time && data.task.due_by_time.display_value);
        }
    },
    afterFormRender: function(options) {
        if ($taskForm.options.mode != "view") {
            $taskForm.ownerRender(options);
        }
        jQuery('[data-formid="form_TaskForm"]').addClass("pb0"); //No I18N
        jQuery("#content-details-task").addClass("pb0"); //No I18N
        jQuery('#content-middle-panel-inner-task').addClass("pt0"); //No I18N Request Task Details page padding top fix.
        $tasks.addOverDueFlag();
        //To add milestone scheduled start and end time when form is opened
        if(options.mode !== 'view' && $taskForm.options.module === 'milestone') {
            var milestoneId = ($taskForm.options.module === 'milestone')? $taskForm.options.moduleId : $taskForm.entitydata.milestone.id; //NO I18N
            var time = $taskForm.options.milestoneTimeMap[milestoneId];
            if(time) {
                jQuery('#milestone_control').append('<div id="milestoneTime" class="pt5 font-small fontgray">' + time + '</div>');
            }
        }
    },
    estimatedEffortTaken: function(estimated_effort) {
        jQ('#Estimated_Effort_Days').val(estimated_effort.days || 0); //No I18N
        jQ('#Estimated_Effort_Hours').val(estimated_effort.hours || 0); //No I18N
        jQ('#Estimated_Effort_Minutes').val(estimated_effort.minutes || 0); //No I18N
    },
    /*
        *A function to render owner field in Add/Edit Form
        *@PARAM options - respective Task data for Edit Page
    */
    ownerRender: function(options) {
        var selected_owner;
        if (options.entitydata && (options.entitydata.owner || options.entitydata.marked_owner)) {
            selected_owner        = options.entitydata.owner ? options.entitydata.owner : options.entitydata.marked_owner;
            selected_owner.text   = selected_owner.name;
        }

        if(selected_owner) {
            jQuery("#s2id_for_owner").select2("data",{id : selected_owner.id, text: selected_owner.name, name : selected_owner.name, status: selected_owner.status});//No I18N
        }

        jQuery("#group_control").append("<span rel='uitip'>&nbsp;<img id='markIcon' title='"+translate('task.marked.markedtooltip')+ "' class='mark-icon-right hide' src='/images/spacer.gif'></span>");
        jQuery('[data-name="group"]').parent().find(".info").css(sdp_user.DIRECTION == "RTL"?"left":"right","15px");//No I18N

        jQuery("#owner_control").append("<span rel='uitip'>&nbsp;<img id='markIcon' title='"+translate('task.marked.markedtooltip')+ "' class='mark-icon-right hide' src='/images/spacer.gif'></span>");
        jQuery('[data-name="owner"]').parent().find(".info").css(sdp_user.DIRECTION == "RTL"?"left":"right","15px");//No I18N
        jQuery("#owner_control").append(`<span id='MarkGrpTechToggleSpan' class='togglebtn-holder req-task-togglebtn-holder' title='${translate("sdp.tasks.markassign.help.info")}' rel='uitip'><span selected="2" id="MarkAssignButtonSpan" class="togglebtn-cnt fh ml2"><label class="left mb0" id="MarkLabel"><button type="button" id="MarkButton" class="toggle-btn1-off" tabindex="6">${translate('common.mark')}</button></label><label class="right mb0" id="AssignLabel"><button type="button" id="AssignButton" class="toggle-btn1-on tgl-btn-posfix" tabindex="6">${translate('common.assign')}</button></label><input type="hidden" id="MarkedStatus" name="MarkedStatus" value="assign"></span></span>`);//No I18N

        jQuery("#MarkButton").off("click.mark").on("click.mark", function(){    //No I18N
            $tasks.createMarkAssigntoggle('Mark', this.form);   //No I18N
            $taskForm.markOwnerGroup('mark');   //No I18N
        });
        jQuery("#AssignButton").off("click.mark").on("click.mark", function(){  //No I18N
            $tasks.createMarkAssigntoggle('Assign', this.form); //No I18N
            $taskForm.markOwnerGroup('assign'); //No I18N
        });
        if($taskForm.options.mode == "edit" && (options.entitydata.group || options.entitydata.owner)) {
            jQuery("#MarkAssignButtonSpan").addClass("hide");
        }
        if (options.entitydata && (options.entitydata.marked_group || options.entitydata.marked_owner)) {
            jQuery("#MarkButton").trigger("click");
        }else {
            jQuery("#AssignButton").trigger("click");
        }
    },
    /*
        *A function to be triggered when task template is chosen Add/Edit Form
        *@PARAM obj - current selected template
    */
    chooseTaskTemplate: function(obj,form,event) {
        var _self = this;
        var templateId = obj.current_value.id;
        if (templateId) {
            if(_self.options.mode == "edit"){
                if(event){
                    var prev_value = event.removed;
                    showconfirm(true,
                        "title=" + translate("sdp.edit.release.task.templatechange.help") + "," + //No I18N
                        "message=" + translate(_self.options.mode == "edit" ? "sdp.tasktemplate.template.editconfirm":"request.form.templatechange.dataloss.alert")+ "," + //No I18N
                        "submitbutton=" + translate("common.proceed") + "," + //No I18N
                        "cancelbutton=" + translate("common.no") + "," + //No I18N
                        "closebutton=yes," + //No I18N
                        "closeOnEscKey=yes",//No I18N
                        function(didConfirm) {
                            if (didConfirm) {
                                _self.changeTemplate(templateId);
                            }else{
                                prev_value ? taskFormComp.setFieldValue("template", prev_value.id): taskFormComp.setFieldValue("template", "");//No I18N
                            }
                        }
                    );
                }
            }else{
                _self.changeTemplate(templateId);
            }
        }
    },
    /*
        *A function to populate form with the date of selected template
        *@PARAM templateId - Associated Entity id
    */
    changeTemplate: function(templateId) {
        var _self = this;
        var formId = jQuery("#task-container").find("[data-id='form-fixed-wrapper']").attr("data-formid"); //No I18N
        if($taskForm.options.module == "release" || $taskForm.options.module == "change"){
            var stage = $taskForm.options.mode == "edit" ? jQuery.extend({}, $taskForm.entitydata.stage) : (FC_Mapper[formId].fields.stage.current_value ? Object.assign({},FC_Mapper[formId].fields.stage.current_value) : null); //No I18N
        }
        var response;
        sdpAjax({
            acceptODCompatible: true, async: false,
            url: "/api/v3/" + _self.options.url + "/template/" + templateId,//No I18N
            success: function(data) {
                response = data;
            }
        });
        if(response){
            var task_template = response.task_template;
            if(['project','milestone', 'general'].indexOf($taskForm.options.module) != -1 || $taskForm.options.module.startsWith("cm_")){
                task_template.group && delete task_template.group;
                task_template.marked_group && delete task_template.marked_group;
            }
            if(['project','milestone'].indexOf($taskForm.options.module) != -1 && (task_template.owner || task_template.marked_owner)){
                sdpAjax({
                    acceptODCompatible: true, async: false, data: sdpAjaxInputData({"list_info":{"search_criteria": {"field": "user.id", "value": task_template.owner?task_template.owner.id:task_template.marked_owner.id, condition:"is", "children":[{"field":"is_active", "value":true, "condition": "is", "logical_operator":"AND"}]}}}),// NO I18N
                    url: "/api/v3/projects/" + ($taskForm.options.module === 'project'?_self.options.moduleId:_self.options.projectId)+"/members",// NO I18N
                    success: function(data) { data.members.length == 0 && delete task_template.owner && delete task_template.marked_owner; }
                })
            }
            if ($taskForm.options.mode == "new") {
                if (typeof taskFormComp !== "undefined" && taskFormComp instanceof FC && !taskFormComp.is_destroyed) {
                    jQuery("#TaskForm").find("[name='template']").select2("destroy");//No I18N
                    taskFormComp.destroy(true);
                    delete taskFormComp;
                }
                $taskForm.options.entity_data = task_template;
                $taskForm.options.entity_data.group = $taskForm.options.entity_data.group || $taskForm.options.entity_data.marked_group;
                if(stage){
                    $taskForm.options.entity_data.stage = stage;
                }
                $taskForm.options.entity_data.task_template = {
                    "default_value": {//No I18N
                        "id": response.task_template.id,//No I18N
                        "name": response.task_template.name//No I18N
                    }
                };
                $taskForm.initialize($taskForm.options);
            }
            _self.estimatedEffortTaken(task_template.estimated_effort ? task_template.estimated_effort : {});

            if($taskForm.options.mode == 'edit') {
                jQuery("#MarkAssignButtonSpan").removeClass("hide");
                jQuery("#AssignButton").trigger("click");
                if (task_template.group || task_template.owner){
                    jQuery("#MarkAssignButtonSpan").addClass("hide");
                    jQuery("#s2id_for_owner").width("340px"); //No I18N
                }else if(task_template.marked_group || task_template.marked_owner){
                    if(task_template.marked_group){
                        task_template.group = task_template.marked_group;
                    }
                }
                Object.assign(FC_Mapper[formId].fields.values, task_template);
                var udfFields = task_template.udf_fields;
                Object.keys(udfFields).forEach(function(key) {
                    if( udfFields[key] !=null && udfFields[key].value !=null){
                     taskFormComp.setFieldValue("udf_fields."+key,udfFields[key].value);
                     }else{taskFormComp.setFieldValue("udf_fields."+key,udfFields[key]);}
                 });
                (task_template.marked_group || task_template.marked_owner) && jQuery("#MarkButton").trigger("click");
                var owner;
                if(task_template.owner){
                    owner = task_template.owner;
                }else{
                    owner = task_template.marked_owner;
                }
                if(owner){
                    jQuery('#s2id_for_owner').select2("data", {id: owner.id, text: owner.name, status: owner.status})//No i18N
                }else{
                    jQuery('#s2id_for_owner').select2("data", null) //No I18N
                }
            }
        }
    },
    /*
        *A function to be triggered when group field is changed in Add/Edit Form
        *@PARAM form - selected group
    */
    selectedGroup: function() {
       jQuery("#AssignButton").trigger("click");
    },
    ownerChange: function(field,form) {
        let owner = jQuery('#s2id_for_owner').select2("data");   //No I18N
        if(owner) {
            form.fields.values.owner = owner.id;
        }else{
            form.fields.values.owner = null;
        }
        form.fields.changed.push("owner");
    },
    /*
        *A function to be triggered while submitting GroupOwnerPopup
        *@PARAM payload - updated group and owner data
    */
    updateData: function(payload) {
        let owner = jQuery("#s2id_for_owner").select2("data") && jQuery("#s2id_for_owner").select2("data").id;  //No I18N
        if (jQuery("#MarkedStatus").val() == "Mark") {
            var marked_group = payload.task.group;
            if (owner) {
                payload.task.marked_owner = {
                    "id": owner//No I18N
                };
                delete payload.task.owner;
            }
            if (marked_group) {
                payload.task.marked_group = marked_group;
                if (payload.task.group) {
                    delete payload.task.group;
                }
            }
            else if(marked_group == ""){
              delete payload.task.group;
              payload.task.marked_group = null;
            }
            if (payload.task.owner == null) {
                if(!owner){
                  payload.task.marked_owner =null;
                }
                delete payload.task.owner;
            }
        } else {
            if (owner) {
                payload.task.owner = {
                    "id": owner//No I18N
                };
            } else {
                payload.task.owner = null;
            }
        }
        payload.task['estimated_effort'] = $taskForm.setEstimatedEffort("payload");//No I18N
    },
    /*
        * A function triggered when estimated effort is changed
        *@PARAM arg - from details page or Add/Edit form
    */
    setEstimatedEffort: function(arg) {
        var estimated_effort = {
            "days"    : jQ('#Estimated_Effort_Days').val() != "" ? jQ('#Estimated_Effort_Days').val() : "0" , //No I18N
            "hours"   : jQ('#Estimated_Effort_Hours').val() != "" ? jQ('#Estimated_Effort_Hours').val() : "0", //No I18N
            "minutes" : jQ('#Estimated_Effort_Minutes').val() != "" ? jQ('#Estimated_Effort_Minutes').val() : "0"//No I18N
        }
        if(arg == "payload"){
            return estimated_effort;
        }else if(arg == "details"){//No I18N
            var inObj = {"estimated_effort" : estimated_effort};//No I18N
            $tasks.updateTaskData(arg + '_assign',inObj,undefined,$taskForm.options.taskId); //NO I18N
        }else{
            var formId = jQuery("#task-container").find("[data-id='form-fixed-wrapper']").attr("data-formid");
            FC_Mapper[formId].fields.values.estimated_effort = estimated_effort;
            FC_Mapper[formId].fields.changed.push("estimated_effort"); //No I18N
        }
    },
    /*
        * A function layout for Add/Edit form
        *@PARAM form_sections - details of form fields
        *@PARAM meta_info
    */
    constructLayoutObject: function(form_sections, meta_info) {
        var _self = this;
        var resp_obj = {}, layouts = [], metainfo_Obj = {}, sections = [];

        for(var i = 0; i < form_sections.length; i++){
            var sectionFields = form_sections[i].fields;
            var sec_col = sec_row = 1;
            var section = {};
            if(jQuery.isEmptyObject(form_sections[i].position)){
                section.position = {"col": sec_col,"row": sec_row };
            }else{
                sec_col = form_sections[i].position.col, sec_row = form_sections[i].position.row;
            }

            if(_self.options.mode != "view" && i == 0){
                section.custom_section = true;
                section.has_fields     = true;
                section.partial        = "changerelease-stage-template";//No I18N
            }

            section.name         = form_sections[i].name;
            section.field_align  = "left-right";//No I18N
            section.column_count = form_sections[i].column_count;

            var fields = [];
            var fld_col = fld_row = 1;
            var sectionFieldsArray = Object.keys(sectionFields);

            for(var j = 0; j < sectionFieldsArray.length; j++){
                var fieldName = sectionFieldsArray[j];
                var field_metainfo = meta_info && meta_info[fieldName];
                if (field_metainfo && field_metainfo.type == "udf") {
                   var flds = field_metainfo.fields;
                   if (!jQuery.isEmptyObject(flds)) {
                       var fieldsArray = Object.keys(flds);
                       fields1 = {};
                       //changing fieldsArray  - key as id and value as name so that we can sort
                       Object.keys(flds).forEach(function(key) {
                           field = flds[key];
                           fields1[field.id] = key;
                       });
                       fieldsArray = Object.keys(fields1).map(function(id) {
                           return fields1[id];
                       });
                       var fieldsCnt = fieldsArray.length;
                       for (var k = 0; k < fieldsCnt; k++) {
                           var subfield_name = fieldsArray[k];
                           var field = flds[subfield_name];
                           if (field.display_type === 'Pick List') { //NO I18N
                               field.allowClear = true;
                           }
                           field.position = {
                               "col": fld_col,//NO I18N
                               "row": fld_row //NO I18N
                           };
                           field.name = fieldName + "." + subfield_name;
                           if (!field.fieldname) {
                               field.fieldname = subfield_name;
                           }
                           fields.push(field);
                           if (fld_col == section.column_count) {
                               fld_col = 1;
                               fld_row += 1;
                           } else {
                               fld_col += 1;
                           }
                           metainfo_Obj[fieldName + "." + subfield_name] = field;
                       }
                   }
               }else {
                    var field = sectionFields[fieldName];
                    field.position = {"col": fld_col, "row": fld_row };
                    if(field_metainfo && field_metainfo.type == "datetime"){
                        field.args = {"showNow_Today": true};// NO I18N
                        if(fieldName == "scheduled_end_time"){
                            field.args.setHrsMins = "23:59";
                        }
                    }
                    field.name = fieldName;
                    if(fieldName == "description"){
                        field.images = true;
                        field.images_api = true;
                        field.images_save_path = "images";//No I18N
                        field.images_url = "/api/v3/" + _self.options.url + "/images"//No I18N
                        field.inlineImagesEntity = _self.options.module;
                    }
                    if(field_metainfo){
                        jQuery.extend(field, field_metainfo);
                    }else if(field.frommeta == true) {
                        field.default_hide = true;
                    }
                    fields.push(field);
                    metainfo_Obj[fieldName] = field;
                }
                if (fld_col == section.column_count) {
                    fld_col = 1;
                    fld_row += 1;
                } else {
                    fld_col += 1;
                }
                section.fields = fields;
                sec_row++;
            }
            sections.push(section);
        }

        var layout = [{"sections": sections}];//No I18N
        if (_self.options.mode != "view") {
            /** adding Attachments inside layout */
            layout.push({
                "title": window.translate("sdp.common.attachments"), //No I18N
                "sections": [{//No I18N
                    type: "attachments", //No I18N
                    id: "attachments", //No I18N
                    container_id: "task-attachment", //No I18N
                    options: {
                        api: false,
                        upload: true,
                        is_odapi: true,
                        upload_api: true,
                        enable_delete: true,
                        description: true,
                        accept_od_compatible: true,
                        entity: _self.options.attachments_url,
                    }
                }]
            })
        }
        return {"layouts" : layout, "metainfo" : metainfo_Obj }; //No I18N
    },
    refreshParentWindow: function(from, entityData){
        var activeWindow = $extFrame.getActiveWindow(parent.location.href);
        switch(from){
            case "homeMyTasks"://No I18N
                let selectedTab = sdp_user.CLIENT_CONF.home_view && sdp_user.CLIENT_CONF.home_view.view || 'my_view';  //No I18N
                activeWindow.loadHomePageTabContent && activeWindow.loadHomePageTabContent(selectedTab);
                break;
            case "scheduler"://No I18N
                window.top.loadCalendarForTech(window.top.jQuery("#TechList").val() || ''+sdp_user.LOGGEDIN_USERID);
                break;
            case "reqListView"://No I18N
                window.top.taskcombinedViewObj.refreshSideBarTaskView();
                break;
            case "resMgmt"://No I18N
                if(window.top.loadHomePageTabContent){
                    window.top.loadHomePageTabContent('resource'); // NO I18N
                }else if(window.top.location.href.indexOf("projectid") !== -1) {
                    window.top.jQuery("#proj-resource").trigger("click");
                }else{
                    window.top.jQuery('[data-id="resMgmtBtn"]').trigger("click");
                }
                break;
            case "gantt"://No I18N
                if(window.top.location.href.indexOf("projectid") !== -1){//NO I18N
                    window.top.jQuery("#proj-gantt").trigger("click");
                }else{
                    window.top.jQuery('[data-id="ganttViewBtn"]').trigger("click");
                }
                break;
        }
    },
    makeUdfFieldsEmpty: function(configJSON){
         var obj = configJSON.metadata.fields.udf_fields.fields;
              Object.keys(obj).forEach(key => {
                    if (obj.hasOwnProperty(key) && (obj[key].default_value !== null || obj[key].default_value !== '')) {
                      obj[key].default_value = '';
                    }
              });
    },
    errorInterrupt:function(data, _form){
        if(data && data.response_status && data.response_status.messages && data.response_status.messages.length){
            var message = data.response_status.messages[0];
            if(message.status_code >= 60000 && message.status_code <= 60006){
                showalert('failure', translate(message.message), "isAutoHide=false");//NO I18N
                return false;
            }
        }
        return true;
    }
}
