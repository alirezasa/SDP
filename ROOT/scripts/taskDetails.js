 /* $Id$ */
var $taskDetails = {
    /*
        *A function to intiliaze details Component
        *@PARAM options - Associated Entity Details
    */
    init : function(options){
        var _self = this;
        options.url += (options.url.split('/').pop() === 'tasks')? '/'+options.taskId : '';
        _self.options = options;
        _self.entity_data = $tasks.getEntityData(_self.options.url);
        _self.options.canEdit = ((options.from !== 'kanban' && options.from !== 'notification') && _self.options.allowedOperations.edit);// NO I18N
        var dayDiff = _self.getDiffDays(_self.entity_data);

        // data object is used for rendering DetailsComponent.
        var data = {
                "links"    : _self.options.allowedOperations, "viewMilestone"    : _self.options.viewMilestone,// NO I18N
                "title"    :  _self.entity_data.title,        "marked"           : _self.entity_data.marked_owner ? true : false,// NO I18N
                "delayStr" : dayDiff.diff_key,                "delayDashInfo"    : dayDiff.diffString,// NO I18N
                "projectId": _self.options.projectId || '',   "module"           : _self.entity_data.associated_entity,// NO I18N
                "taskId"   : _self.entity_data.id,            "associated_entity": _self.entity_data[_self.entity_data.associated_entity],// NO I18N
                "from"     : options.from || '',              "dueDate"          : (_self.entity_data.scheduled_end_time)? _self.entity_data.scheduled_end_time.display_value : translate('sdp.common.na')// NO I18N
            };
        if(_self.entity_data.marked_owner || _self.entity_data.owner){
          data.owner = _self.entity_data.marked_owner ? _self.entity_data.marked_owner.name : _self.entity_data.owner.name;
        }
        if(data.module.startsWith("cm_")){
            data.module = data.associated_entity.api_plural_name;
        }

        switch(data.module){
            case 'project':// NO I18N
                data.href       = "/ProjectAction.do?submitaction=ViewProject&projectid="+data.associated_entity.id;
                data.moduleI18N = translate("sdp.project.heading.project");
                break;
            case "milestone":// NO I18N
                data.ptitle = _self.entity_data.project.title;
                data.phref  = "/ProjectAction.do?submitaction=ViewProject&projectid="+_self.entity_data.project.id;// NO I18N
                if(_self.options.viewMilestone){
                    data.mhref = "/ProjectAction.do?showTab=milestone&submitaction=ViewProject&projectid="+_self.entity_data.project.id;// NO I18N
                    data.href  = "/MileStoneAction.do?submitaction=ViewMileStone&milestoneid="+data.associated_entity.id+"&projectid="+_self.entity_data.project.id;
                }
                data.moduleI18N = translate("sdp.project.heading.milestone");
                break;
            case "request":// NO I18N
                data.href       = "/WorkOrder.do?woMode=viewWO&woID="+data.associated_entity.id;
                data.titleattr  = translate("sdp.projects.tooltip.breadcrumb.requestdetails");
                data.moduleI18N = translate("sdp.header.newrequest");
                data.associated_entity.title = data.associated_entity.subject;
                delete data.associated_entity.subject;
                break;
            case "change":// NO I18N
                data.href       = "/ui/changes?mode=detail&entity_id="+data.associated_entity.id;
                data.titleattr  = translate("sdp.projects.tooltip.breadcrumb.changedetails");
                data.moduleI18N =  translate("sdp.module.singularname.change");
                break;
            case "problem":// NO I18N
                data.href       = "/ui/problems?mode=detail&entity_id="+data.associated_entity.id;
                data.titleattr  = translate("sdp.projects.tooltip.breadcrumb.problemdetails");
                data.moduleI18N = translate("sdp.problem.problemtab");
                break;
            case "release":// NO I18N
                data.href       = "/ui/releases?mode=detail&entity_id="+data.associated_entity.id;
                data.titleattr  = translate("sdp.projects.tooltip.breadcrumb.releasedetails");
                data.moduleI18N = translate("common.release");
                break;
        }

        //Navigation buttons in Task Details
        var loadedRecords = table_comp_task && table_comp_task.loadedRecords;
        if((loadedRecords && Object.keys(loadedRecords).length > 1) && ['gantt', 'resMgmt', 'combinedView', 'reqListView', 'homeMyTasks','rq_leftpanel'].indexOf(options.from) == -1) {
            data.displayNavigation = true;
            var loadedIDs = table_comp_task.loadedIDs, index = 0;
            for(var i=0; i<loadedIDs.length; i++) {
                var record = Number(loadedIDs[i]);
                var currentRecord = loadedRecords[record];
                if(currentRecord.id == options.taskId) {
                    data.prevRecord = (index - 1 >= 0) && loadedRecords[loadedIDs[index - 1]];
                    data.nextRecord = (index + 1 < loadedIDs.length) && loadedRecords[loadedIDs[index + 1]];
                    data.prevRecord && setNavigationProps('prevRecord', 'prevModule', 'prevModuleId');// NO I18N
                    data.nextRecord && setNavigationProps('nextRecord', 'nextModule', 'nextModuleId');// NO I18N
                }
                index++;
            }
        }
        function setNavigationProps(key, moduleKey, moduleIdKey) {
            data[moduleKey] = data[key].associated_entity;
            if(data[key].associated_entity.startsWith("cm_")){
                data[moduleKey] = data[key][data[key].associated_entity].api_plural_name;
            }
            if(data[moduleKey] !== 'general') {
                data[moduleIdKey] = (data[key][data[moduleKey]])? data[key][data[moduleKey]].id : options.moduleId; // options.moduleId for module tasks.
            }
            if(data[moduleKey] === 'milestone') {
                data[moduleKey+'ProjectId'] = (data[key].project)? data[key].project.id : options.projectId;
                if(data[moduleKey+'ProjectId'] === '0' || data[moduleKey+'ProjectId'] === 'null') {
                    data[moduleKey+'ProjectId'] = null;
                    data[moduleKey] = 'project';
                    data[moduleIdKey] = options.projectId;
                }
            }
        }
        if((['resMgmt', 'reqListView', 'combinedView', 'homeMyTasks','rq_leftpanel'].indexOf(data.from) != -1 && data.module !== 'general') || ["showAllTasks","gantt","history"].indexOf(data.from) != -1 || ["project","milestone"].indexOf(data.module) != -1){
            data.showBreadcrumbs = true;
        }
        if(data.from === "notification" || data.from === "kanban"){
            data.showBreadcrumbs = false;
        }
        var opt = {
            module: "task", container: "task_detailview",// NO I18N
            data: data,
            panel_details: {
                content_panel: {
                    "class" : "noborder",// NO I18N
                    header_panel:{
                        show : true,
                        template: "TaskDetails",// NO I18N
                        template_namespace: "task",// NO I18N
                        "class": "task_details_render",// NO I18N
                        afterRenderfunction : _self.afterHeaderRender
                    },
                    tabs_panel: {
                        show: true,
                        name: "task-detail",// NO I18N
                        tabs: ["task_details", "task_comments", "task_worklogs", "task_history"],// NO I18N
                        active: "task_details",// NO I18N
                        custom: true,
                        tabs_class: "pl20 pr20", // No I18N
                        settings: {
                            "task_details": {// NO I18N
                                show: true,
                                "id": "task_detail_div",// NO I18N
                                "name": "details",// NO I18N
                                "display_name": translate("common.details"),// NO I18N
                                "renderfunction" : _self.viewTaskDets,// NO I18N
                                "HTML" : '<div class="accordion-log accordion-timeline"><div id="taskDescription" class="mt10 mb20 panel"></div></div><div class="widget-panel p0"><form id="TaskForm" name="Task" class="form-horizontal four-col inplace-edit"><div id="task-container" class="container-fluid p0 mt0"></div><div name="requestTaskProperties" class="pb20"><div id="reqTaskPropDiv"></div></div></form></div>' //NO I18N
                            },
                            "task_comments" : {// NO I18N
                                show : true,
                                display_name : translate("sdp.common.comments"),
                                renderfunction : _self.constructTaskComments,
                                id:"task_comments_div",// NO I18N
                                HTML: '<div id="Comments-content" class="comments-content mt0" style=""><div id="TaskComments_DIV" class="mt10"></div></div>'
                            },
                            "task_worklogs" : {// NO I18N
                                show : true,
                                display_name : translate("common.worklogs"),
                                HTML: '<div id="worklog_listview" style="overflow-x:auto;min-height:475px"></div>',
                                renderfunction: _self.constructWorkLog
                            },
                            "task_history" : {// NO I18N
                                show : true,
                                display_name : translate("common.history"),
                                renderfunction: _self.taskHistory,
                                HTML: '<div id="ui-framework-design1"><div id="TaskHistory_DIV" class="mt10"></div></div>'
                            }
                        }
                    }
                }
            }
        };
        if(['project', 'milestone'].includes(options.module) && (!options.from || options.from === 'undefined')) {
            opt.panel_details.content_panel.tabs_panel.childAfterRenderfunction = $taskDetails.addBtnClass
        }

        if(data.from == "notification" || data.from === "kanban"){
            delete opt.panel_details.content_panel.tabs_panel.settings.task_worklogs;
        }
        if(data.module.startsWith("cm_")){
            data.href='/ui/custom_module?module='+data.associated_entity.api_plural_name+'&mode=details&entity_id='+data.associated_entity.id+'#details'
            data.moduleI18N=data.associated_entity.display_value;
            opt.panel_details.content_panel.tabs_panel.tabs.splice(opt.panel_details.content_panel.tabs_panel.tabs.indexOf("task_comments"),1);
        }
        _self.opt = opt;
        _self.opt.skip_user_audit=true;
        _self.detComp = new DetailsComponent(opt, _self);
    },
    afterHeaderRender:function(){
      var _self = this;
      if(_self.entity_data && !_self.entity_data.scheduled_end_time){
        jQ("#task_delayTimeDiv").addClass('hide'); //Inorder to refresh we need this div hence adding class hide. //No I18N
      }
      if(['problem', 'change', 'release'].indexOf(_self.options.module) > -1 && ['showAllTasks', 'homeMyTasks', 'combinedView', 'reqListView', 'resMgmt'].indexOf(_self.options.from) < 0) {
          jQuery("#task_detailview").find('#ui-framework-design1').addClass('mt20');
      }
      $extFrame.setOptions();
    },
    viewTaskDets: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        _self.loadDescriptionSection(tabName, tabSetting, tabs_panel);
        $taskForm.initialize(Object.assign({"canEdit": _self.options.canEdit,"entity_data": _self.entity_data}, _self.options));// NO I18N
        if($taskDetails.options.from != "kanban" && $taskForm.meta_info.fields.request && $taskForm.meta_info.fields.request.fields) {
            $taskReqProp.showAssociatedRequestProperties();
            if(document.getElementById('taskDetailsDialog')) { // NO I18N
                jQuery('[name="requestTaskProperties"]').css('margin-top', 50); // NO I18N
            }

            var attach_options = {
                "layouts":true,//NO I18N
                "upload": false, // No I18N
                "enable_delete" : false, //No I18N
                "download" : false, //No I18N
            };
            var atPreview=parent.attachPreview;
            new atPreview(jQ(parent.document).find('#reqprop_attachment_api'),attach_options); //No I18N
        } else {
            jQuery('#reqTaskPropDiv').remove();
        }
        _self.renderTags();
    },
    /*
        *A function to load description section in forms
    */
    loadDescriptionSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        //Description and attachments section displayed using Panel comp
        var opt                  = {};
        opt.expand               = true;
        opt.accept_od_compatible = true;
        opt.lookup_entity        = "task";//No I18N
        opt.entity               = "tasks"; //No I18N
        opt.base_url             = "/api/v3"; //No I18N
        opt.name                 = "task_description"; //No I18N
        opt.container            = "taskDescription";// NO I18N
        opt.detailsHbsTemplate   = "entity_description_template";// NO I18N
        opt.inlineImagesEntity   = _self.options.module + "_task";  //No I18N
        opt.display_name         = translate("common.description");// NO I18N
        opt.image_url            = "/"+_self.options.taskId + "/images";//No I18N
        opt.metainfo             = {"fields":{"description":{"display_name": translate("common.description")}}};// NO I18N
        opt.data                 = Object.assign({},_self.entity_data);
        opt.data.description     = appendImageToken(opt.data.description,opt.data.image_token);
        opt.id                   = _self.options.taskId;
        opt.canEdit              = $taskDetails.options.canEdit;

        var module               = _self.entity_data.associated_entity
        if(module !== 'general') {
            if(module === 'milestone'){ //No I18N
                opt.base_url += "/projects/" + _self.entity_data.project.id + '/' + module + 's/' + _self.entity_data[module].id //No I18N
            }else if(_self.entity_data.associated_entity.startsWith("cm_")){    //No I18N
                opt.base_url += '/'+ _self.entity_data[module].api_plural_name + '/' + _self.entity_data[module].id  //No I18N
            }else{
                opt.base_url += '/'+ module + 's/' + _self.entity_data[module].id //No I18N
            }
        }
        if(['combinedView', 'gantt', 'resMgmt', 'homeMyTasks', 'reqListView', 'rq_leftpanel'].indexOf(_self.options.from) > -1) {
            opt.ispopup = true;
            opt.attach_highlight_scrollele = '#taskDetailsDialog'; //NO I18N
        }
        opt.save = {
            postsuccess : function(data){
                _self.entity_data = Object.assign({}, data);
                data.description = appendImageToken(data.description,data.image_token);
            }
        };
        opt.attachment={
            rerender: function(data){
                _self.entity_data.attachments = data;
            },
            container: opt.name +"_attachment", //No I18N
            description: true
        }
        _self.$descriptionPC = new PanelComponent(opt);
    },
    refreshTaskDetails: function(entity_data){
        var _self = this;
        _self.entity_data = entity_data;
        if(_self.opt && _self.opt.data){
            _self.opt.data.title = _self.entity_data.title;
            _self.opt.data.dueDate = (_self.entity_data.scheduled_end_time)? _self.entity_data.scheduled_end_time.display_value : translate("sdp.common.na");

            var dayDiff = _self.getDiffDays(_self.entity_data);
            _self.opt.data.delayStr = dayDiff.diff_key;
            _self.opt.data.delayDashInfo = dayDiff.diffString;

            if(_self.entity_data.marked_owner || _self.entity_data.owner){
                _self.opt.data.owner = _self.entity_data.marked_owner ? _self.entity_data.marked_owner.name : _self.entity_data.owner.name;
            }else{
                delete _self.opt.data.owner;
            }
            _self.opt.data.marked = _self.entity_data.marked_owner ? true : false;
            _self.opt.data.links = _self.options.allowedOperations;
        }
        _self.detComp.rerenderDetails(_self.opt,_self);
    },
    constructTaskComments : function(){
        var _self = this;
        var entity = _self.entity_data.associated_entity;
        var entity_id = (entity !== "general")? _self.entity_data[entity].id : null;
        var modalEle;
        if(['combinedView', 'gantt', 'resMgmt', 'homeMyTasks', 'reqListView', 'rq_leftpanel'].indexOf(_self.options.from) > -1) {
            modalEle = 'taskDetailsDialog'; //NO I18N
        }
        // To avoid the duplicate divId conflict in gantView
        if($taskDetails.options.from === "gantt" || $taskDetails.options.from === "resMgmt"){
            jQuery("#_DIALOG_LAYER").remove();
        }
        $tasks.loadTaskComments(entity,'&TASKID='+_self.entity_data.id+((entity === 'milestone')? '&projectId='+_self.entity_data.project.id : ""),null,entity_id, modalEle);
    },
    constructWorkLog: function() {

        jQuery('#worklog_listview').html($tasks.loadWorkLog('list', 'task', $taskDetails.options.taskId, ($taskDetails.options.module !== 'general')? $taskDetails.options.module : null, $taskDetails.options.moduleId, null, $taskDetails.options.projectId)); // No I18N
    },
    redirectToTaskList : function() {
        var url = '/ui/tasks?mode=list';// NO I18N

        if(this.options.from === "showAllTasks" || (window.checkIfMSPOrSCP() && this.options.from === "account")) {
            $tasks.loadTasks('list','','','',this.options.from);// NO I18N
            return
        } else {
            url += "&module="+this.options.module+"&moduleId="+this.options.moduleId// NO I18N
            url = (this.options.module === 'milestone')? url + "&projectId=" + this.options.projectId : url;// NO I18N
            url = (( this.options.module === 'change' || this.options.module === 'release' ) && $taskList.taskOptions.stageId ) ? url + "&stageId=" + $taskList.taskOptions.stageId : url;// NO I18N
            if(this.options.module === 'project') {
                window.location.href = "/ProjectAction.do?showTab=tasks&submitaction=ViewProject&projectid=" + this.options.moduleId
            }
            if(this.options.module === 'milestone') {
                window.location.href = "MileStoneAction.do?showTab=tasks&submitaction=ViewMileStone&milestoneid=" + this.options.moduleId
            }
        }
        jQuery("#tasksDiv").load(url);
    },
    getDiffDays: function(task) {
        var scheduledEnd = task.scheduled_end_time;
        var diff_key, diffString;
        if(scheduledEnd) {
            var daysDiff = scheduledEnd.days_diff;
            diffString = "<span class="+((daysDiff.diff_key === translate("sdp.projects.daydiff.late") || daysDiff.diff_key === translate("sdp.projects.daydiff.passed"))? 'listview-dateinfo-delay' : 'listview-dateinfo') +">"+daysDiff.diff + "</span>";
            diff_key = daysDiff.diff_key;
        }
        return {diff_key: diff_key, diffString: diffString};
    },
    /*
        *Function to render tags section in task details page
    */
    renderTags() {
        const tagOptions = {
            container: 'task-container', //NO I18N
            canEdit: $taskDetails.options.canEdit,
            entity: 'task', //NO I18N
            entityUrl: `/api/v3/${$taskDetails.options.url}`,
            associatedTags: $taskDetails.entity_data.tags,
            afterRenderCallback: $taskDetails.afterTagsRender
        }
        $tags.init(tagOptions);
    },
    /*
        *Function to add styles to tags section in task details page
        *@PARAM tagConfig - $tag variable
    */
    afterTagsRender(tagConfig) {
        document.getElementById(tagConfig.tagSection).classList.add('pl5'); //NO I18N
        if($taskDetails.entity_data.request && Object.keys($taskDetails.entity_data.request).length > 2) { //For request task containing request properties
            document.getElementById(tagConfig.tagSection).classList.add('mb30'); //NO I18N
        }
    },
    /*  Due to the present of the element with id ui-framework-design1 details page tab has ui issue hence adding the class sdmenu-toggle*/
     addBtnClass() {
         const elts = ['task_details', 'task_comments', 'task_worklogs', 'task_history'] //NO I18N
         elts.forEach(val => {
             const ele = document.querySelector(`[data-name=${val}]`).children[0]
             ele && ele.classList.add('sdmenu-toggle') //NO I18N
         })
     },
    taskHistory: function(){
        jQuery("#TaskHistory_DIV").load("/project/ProjectHistory.jsp?module=tasks&is_date_filter=true&parentModule="+$taskDetails.options.module+(($taskDetails.options.module.include("general")?"":"&moduleId="+$taskDetails.options.moduleId))+"&id="+$taskDetails.options.taskId+"&is_new_filter=true");    //No I18N
    }
};

// TaskReqProperties script starts
var $taskReqProp={
    mapToResultObj:function(keyName,fromJson,toJson){
        toJson[keyName]=fromJson[keyName];
        if(keyName !== 'title' && keyName !== 'description') {
            delete fromJson[keyName];
        }
    },
    /*
        *A function used to show Task Request Properties in Task details page.
        *@PARAM options - associated entity details.
    */
    showAssociatedRequestProperties:function(){
        var reqProp = $taskDetails.entity_data;
        var metainfo= $taskForm.meta_info.fields.request;
        if(reqProp&&metainfo){
            var reqObj=reqProp.request;
            if(reqObj.hasOwnProperty('has_attachments')) {
                delete reqObj.has_attachments;
            }
            var resources,resInfo,qns,resObj;
            var resultObj={'fields':{},'resources':{}, "showReqHeader": true};//NO I18N

            this.mapToResultObj('resolution',reqObj,resultObj);//NO I18N
            this.mapToResultObj('subject',reqObj,resultObj);//NO I18N
            this.mapToResultObj('description',reqObj,resultObj);//NO I18N
            this.mapToResultObj('attachments',reqObj,resultObj);//NO I18N
            this.mapToResultObj('title',reqObj,resultObj);//NO I18N

            resultObj.id=reqObj.id;

            this.mapLabelandValue(resultObj.fields,reqObj,metainfo.fields);
            metainfo.fields.udf_fields && this.mapLabelandValue(resultObj.fields,reqObj.udf_fields,metainfo.fields.udf_fields);

            resources=reqObj.resources;
            resMetaInfo=metainfo.fields.resources;

            //mapping resources value and resource metainfo
            for(var resKey in resources){
                resInfo=resMetaInfo[resKey];
                qns=resources[resKey];
                resObj={'label':resInfo.label,'questions':{}};//NO I18N

                this.mapLabelandValue(resObj.questions,qns,resInfo);

                //Need to skip the sections with empty fields
                if(!jQuery.isEmptyObject(resObj.questions) && !(Object.keys(resObj.questions).length === 1 && resObj.questions.label)){
                    delete resObj.questions.label;
                    resultObj.resources[resKey]=resObj;
                }
            }
            delete resultObj.fields.description;
            delete resultObj.fields.title;
            delete resultObj.fields.id;
            if(!jQuery.isEmptyObject(resultObj.resources)||!jQuery.isEmptyObject(resultObj.fields)||resultObj.description||resultObj.resolution){
                resultObj.midno=Math.ceil(Object.keys(resultObj.fields).length/2)-1;
            }

            if(!jQuery.isEmptyObject(resultObj.resources)||resultObj.description||resultObj.attachments){
                resultObj.showDesc=true;
            }
            resultObj.showReqProp = true;
            if(!resultObj.showDesc && jQuery.isEmptyObject(resultObj.fields)) {
                resultObj.showReqProp = false;
            }
            renderhbs("#reqTaskPropDiv", "TaskReqProperties", resultObj, false, "task");//No I18N
        }
    },
    mapLabelandValue:function(resultObj,reqProp,metaInfo){
        var fieldObj={};

        for(var fieldKey in reqProp){
            var fieldVal=reqProp[fieldKey];
            fieldObj=metaInfo[fieldKey];
            if(fieldObj && fieldObj.field_group && fieldObj.field_group === "resources"){
                /* Should not display the questions with the empty values/options  */
                if((fieldKey.indexOf("udf_multiselect_") !== -1 && fieldVal && fieldVal.length === 0) || (fieldKey.indexOf("udf_multiselect_") === -1 && !fieldVal)){
                    continue;
                }
            }
            else if(fieldKey.indexOf("requester")!=-1){
                resultObj[fieldKey]={"label":parent.translate("common.newrequester"),"display_type":"pick_list","value":fieldVal};//NO I18N
                continue;
            }else if(fieldKey.indexOf("due_by_time")!=-1){
                resultObj[fieldKey]={"value":fieldVal,"label":fieldObj.display_name,"display_type":"datetime"};//NO I18N
                continue;
            }else if(fieldKey.indexOf("resources")!=-1||fieldKey.indexOf("udf_fields")!=-1){
                continue;
            }
            resultObj[fieldKey]={"value":fieldVal};
            fieldObj=metaInfo[fieldKey];

            if(fieldObj){
                if(fieldObj.display_name){
                    resultObj[fieldKey].label=fieldObj.display_name;
                }else if(fieldObj.label){
                    resultObj[fieldKey].label=fieldObj.label;
                }
                if(fieldObj.display_type){
                    resultObj[fieldKey].display_type=fieldObj.display_type;
                }
                if(fieldKey == "site" && !resultObj[fieldKey].value){
                    resultObj[fieldKey].value = parent.translate("common.site.nosite");//NO I18N
                }
            }
        }
     }
};