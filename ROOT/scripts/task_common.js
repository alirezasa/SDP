/* $Id$ */
var $tasks = {
    loadTasks: function(mode, module, moduleId, taskId, from, projectId, stageId, filterId, startTime, options){
        jQuery('#task-action-' + taskId).hide();
        var url = '/ui/tasks?mode='+mode;// NO I18N
        if(module){
            url += '&module='+module.toLowerCase();// NO I18N
            if(moduleId){url+= '&moduleId='+moduleId;}
            if(projectId){url+= '&projectId='+projectId;}
            if(stageId){url+= '&stageId='+stageId;}
        }
        if(from === "history" && !module && $taskDetails.options){
            from   =  $taskDetails.options.from;
            module =  $taskDetails.options.module;
        }
        if(taskId){url+= '&taskId='+taskId;}
        if(from && from != 'undefined'){
            if(from === 'reqAction'){
                jQuery('[data-cs-field="actions"]').removeClass('open');
                $req.details.changeTab('tasks');// No I18N
            }else{
                url+= '&from='+from;// NO I18N
            }
        }
        if(mode == "list" && filterId){url+= '&filterId='+filterId;}

        if(from == "notification" && mode == "detail"){
            window.top.jQuery("#module-preview-frame").attr("src","/DynamicNotification.do?method=redirectModuleUrl&moduleId="+taskId+"&notifyType=task-assign&dynamicNotifId=1&openInIframe=true");
            return;
        }
        if(mode === 'form' || mode === 'template' || (mode === 'detail' && from === "kanban")){
            if(from === "scheduler"){url+="&startTime="+startTime;}
            if(module==''){ url+='&module=general'; }
            var title = mode === 'template'? "sdp.admin.tasktemplates" : (mode==="detail"?'sdp.common.taskdetails':taskId?'sdp.task.edittask':'sdp.tasks.globle.NewTask');// NO I18N
            if((["showAllTasks", "combinedView", "reqListView"].indexOf(from) > -1 || (!from && mode === 'form' && (module === 'release'|| module === 'problem'|| module === 'change'))) && taskId) {
                var editUrl;
                if(!from || from === 'reqListView') {
                    editUrl = $tasks.getEntityURL(module, moduleId, projectId, taskId);
                } else {
                    editUrl = (from === 'combinedView')? table_combined_task.loadedRecords[taskId].task.baseURL : table_comp_task.loadedRecords[taskId].baseURL;
                    editUrl += "/" + taskId;
                }
                if(!$tasks.isUserPermittedToEdit(editUrl)) {
                    showalert("failure", translate("sdp.api.unauthorized"), "isAutoHide=false");  //No I18N
                    return;
                }
            }
            $previewComponent.load(url+'&externalframe=true',translate(title),"1140px",parseInt(jQuery(window).height()) - 65, function() {setTimeout(function() {jQuery('body').addClass('of-h')}, 100)}, "taskmodule_popup",null,null,"auto_close:true");  // NO I18N
        }else if(mode === 'list' && from === 'showAllTasks'){// NO I18N
            if(window.location.pathname == "/ui/home") {
                jQuery("#homeHeaderTabs a#tasks").trigger("click");
                return;
            }
            window.location.href = (window.externalframe ? url+ '&externalframe=true' : url);
        }else if(mode === 'detail' && ['gantt', 'resMgmt', 'combinedView','homeMyTasks','reqListView','rq_leftpanel','kanban'].indexOf(from) != -1){// NO I18N
            !(jQuery("#taskDetailsDialog").length) && jQuery("body").append("<div class='hide'><div id='taskDetailsDialog'></div></div>");
            jQuery('#taskDetailsDialog').load(url);

            jQuery("#taskDetailsDialog").dialog({
                modal    : true, resizable: false,
                width    : '1050',
                height   : ((window.innerHeight) * 80 ) / 100,
                position : { my: 'top', at: 'top+100' }, // NO I18N
                title    : translate("sdp.common.taskdetails"),
                show     : { effect: 'fadeIn', duration: 500 },// NO I18N
                open: function () {
                    jQuery(document).find('body').addClass('of-h'); //Remove Page scroll
                },
                close: function () {
                    jQuery(document).find('body').removeClass('of-h'); //Add page scroll
                    jQuery(this).dialog("close").remove(); // NO I18N
                }
            });
        }else if(mode == "unified"){// NO I18N
            if(options.scheduledEnd){
                $previewComponent.load(url+'&scheduledEnd='+options.scheduledEnd+'&externalframe=true',translate("home.scheduler.task.heading",[e_html(jQuery("#TechList option:selected").text()),getFormattedDateTime(new Date(options.scheduledEnd), false)]),"1140px",parseInt(jQuery(window).height()) - 65,null,"taskmodule_popup");  // NO I18N
            }else{
                !(jQuery("#taskListDialog").length) && jQuery("body").append("<div class='hide'><div id='taskListDialog'></div></div>");
                jQuery('#taskListDialog').load(url);// NO I18N

                jQuery("#taskListDialog").dialog({
                    modal     : true,  resizable : false, draggable:false,
                    width     : '1100', height    : 'auto',
                    position  : { my: "center", at: "center top+100" }, closeOnEscape: true,//No I18N
                    title     : translate("sdp.home.reminderDisplay.heading")+" ("+options.completed+"/"+options.total+")",
                    show      : { effect: 'fadeIn', duration: 500 },// NO I18N
                    close: function () {
                        jQuery(this).dialog("close"); // NO I18N
                        delete $tasks.scheduler;
                    }
                });
                $taskList.scheduler = {"showPendTasks" : (options.completed != 0) && (options.completed != options.total)};// NO I18N
            }
        }else{
            var listview;
            if(window.location.pathname == "/ui/home" && getSDPURLParams().view_type=="tasks") {
                $spa.navigate(url,"home", "", false, $taskList.spaSubContainer()); // NO I18N
                return;
            }
            sdpAjax({
                url: url, async: false, dataType: "html",   // NO I18N
                success : function(response){
                    if((module === 'release'|| module === 'problem'|| module === 'change')  && mode === 'list'){
                        listView = response;
                        return;
                    }
                    var container = '#tasksDiv';// NO I18N
                    if(mode == 'detail'){
                      if(from === "history" || (from !== "showAllTasks" && (module === "project" || module === "milestone"))){
                        container = ".ui-container";// NO I18N
                        if(window.location.href.indexOf("ui/projects") !== -1){
                            container = "#spa-container";// NO I18N
                        }
                        closeDialog(); // to close the dialog box when opening the task details from ganttview Milestone/task history
                        jQuery("#history_slide").dialog("close");         // NO I18N
                        $previewComponent.closePreview('dependend_history');        // NO I18N
                      }
                    }
                    jQuery(container).html(response);
                }
            });
            if((module === 'release' || module==='problem'|| module === 'change') && mode === 'list'){
                return listView;
            }
        }
    },
    loadWorkLog: function(mode, module, moduleId, grandParent, grandParentId, id, projectId, from, printPreview) {
        var url = "/ui/worklogs?mode="+ mode; //NO I18N
        if(module){
            url += "&module="+module;// NO I18N
        }
        if(moduleId){
            url += "&moduleId="+moduleId;// NO I18N
        }
        url += (grandParent && grandParent !== "undefined")? "&grandParent=" + grandParent + "&grandParentId=" + grandParentId : ""; //NO I18N
        url += (projectId && projectId !== "undefined")? "&projectId=" + projectId : ""; //NO I18N
        url += printPreview? "&printPreview=true" : ""; //NO I18N

        if(from === 'reqActions') {
            jQuery('[data-cs-field="actions"]').removeClass('open'); // To hide Actions menu.
            $req.details.changeTab('worklogs');//NO I18N
        }
        if(from === 'reqTimer') {
            url += "&from=" + from; //NO I18N
            var reqTimer = $req.header.getTimer(moduleId);
            let currentTimer;
            for(let i=0; i<reqTimer.length; i++) {
                const timer = reqTimer[i];
                if(timer.owner.id == sdp_user.LOGGEDIN_USERID) {
                    currentTimer = timer;
                    break;
                }
            }
            $req.details.timerStartTime = currentTimer.start_time.value;
            $req.details.timerDesc = currentTimer.comment;
            if((!table_comp_request || table_comp_request.context.viewMode!=="table")){
                $req.details.changeTab('worklogs'); //NO I18N
                $req.header.toggleTimer(moduleId);
            }else{
                $req.header.toggleTimer(moduleId, true);
            }
        }
        const activeWindow = $extFrame.getActiveWindow();
        if(mode === 'form' || mode === 'preview') {
            if(from === 'reqResolution') {
                url += "&from=" + from; //NO I18N
            } else {
                url += "&externalframe=true"; //NO I18N
                var title = translate("sdp.common.form.newworklog");
                if(id) {
                  title = translate("sdp.common.form.editworklog");
                    url += "&worklogId=" + id; //NO I18N
                }
                if(mode==='form' && from ==='detail'){
                    activeWindow.$previewComponent.load(url+"&from=detail", title, "70%", parseInt(jQuery(window).height()) - 65, null, "worklogs_popup",null,null,"auto_close:true,renderin_prev_frame:true,title:"+title); //NO I18N
                }else{
                    activeWindow.$previewComponent.load(url, title, "70%", parseInt(jQuery(window).height()) - 65, null, "worklogs_popup",null,null,"auto_close:true"); //NO I18N
                }

                return;
            }
        }else if (mode === 'detail'){    //NO I18N
            url = from ? url+"&from="+from:url;  //NO I18N
            url += "&worklogId=" + id + "&externalframe=true";    //NO I18N
            if (from === 'form'){
                activeWindow.$previewComponent.load(url, "", "70%", parseInt(jQuery(window).height()) - 65, null, "worklogs_popup",null,null,"hideHeader:true,auto_close:true,renderin_prev_frame:true,scrolling:no"); //NO I18N
            }else{
                activeWindow.$previewComponent.load(url, "", "70%", parseInt(jQuery(window).height()) - 65, null, "worklogs_popup",null,null,"hideHeader:true,scrolling:no"); //NO I18N
            }
            return;
        }

        var listView;
        sdpAjax({
            url: url, async: false, dataType: "html", //NO I18N
            success : function(res) {
                if(module === 'task' || module === 'release' || module === 'problem'|| module === 'change') {
                    listView = res;
                } else {
                    jQuery("#worklogsDiv").html(res);
                }
            }
        });

        if(module === 'task' || module === 'release' || module==='problem'|| module === 'change') {
            return listView;
        }
    },
    getMetainfo: function(url, forParam) {
        var resp, data;
        if(forParam){
            data = {"for": forParam}; //No I18N
        }
        sdpAjax({
            acceptODCompatible: true, async: false,
            data: sdpAjaxInputData(data),
            url: "/api/v3/" + url + "/_metainfo", // NO I18N
            success: function(data) {
                resp = data.metainfo;
            }
        });
        return resp;
    },
    getEntityData: function (url, inputData) {
        var resp;
        sdpAjax({
            acceptODCompatible: true, async: false,
            data: sdpAjaxInputData(inputData),
            url: "/api/v3/" + url,// NO I18N
            success: function (data) {
                resp = data.tasks? data.tasks : data.task;
            }
        })
        return  resp;
    },
    getEntityURL : function(module,moduleId,projectId, taskId){
        var url = 'tasks';// NO I18N
        if(module == "milestone"){
            url = "projects/"+projectId+"/milestones/"+ moduleId+ "/tasks";// NO I18N
        }else if(module.startsWith("cm_")){//NO I18N
            url = module+"/"+ moduleId+"/tasks";// NO I18N
        }else if(module != "general"){// NO I18N
            url = module+"s/"+ moduleId+"/tasks";// NO I18N
        }
        url += taskId? "/" + taskId : "";
        return url;
    },
    /*
        *A function used to render GroupOwnerPopup
        *@PARAM arg - inline or details
        *@PARAM id - task Id
    */
    BulkEditAssign : function(arg, id){
        var inited_assignto_dialog;
        var loadAssignToForm=jQuery("#QuickTaskFormDialogBox"); //NO I18N
        var ownerEle = jQuery("#edit_owner"); //NO I18N
        var groupEle = jQuery("#edit_group"); //NO I18N
        var isbulk   = (arg == "bulk_") ? true : false;// NO I18N

        var entityurl, module, moduleId, projectId;
        if(arg === "inline"){
            $tasks.row_data = table_comp_task.loadedRecords[id];
            entityurl = $taskList.taskOptions.url+'/'+id;
            if($taskList.taskOptions.from === 'showAllTasks' ||  (window.isMSPOrSCP && $taskList.taskOptions.from === 'account')){
                var rowData = table_comp_task.loadedRecords[id];
                entityurl = $tasks.getEntityURL(rowData.associated_entity,rowData[rowData.associated_entity]? rowData[rowData.associated_entity].id: '',rowData.associated_entity == "milestone"?rowData.project.id:"", id);//NO I18N
            }
        }else if(arg === "details"){//NO I18N
            $tasks.row_data = $taskDetails.entity_data;
            entityurl = $taskDetails.options.url;
        }

        if(isbulk){
            module    = $taskList.taskOptions.module;
            moduleId  = $taskList.taskOptions.moduleId;
            projectId = module === 'milestone'? $taskList.taskOptions.projectId: projectId;// NO I18N
            entityurl = $taskList.taskOptions.url;
        }else{
            module    = $tasks.row_data.associated_entity;
            moduleId  = module !== 'general' ? $tasks.row_data[$tasks.row_data.associated_entity].id : moduleId;//NO I18N
            projectId = module === 'milestone' ? $tasks.row_data.project.id: projectId;// NO I18N
        }

        (["project", "milestone", "general"].contains(module) || module.startsWith("cm_")) && jQuery("#bem_from_table").find("tr")[0].remove() && setTimeout(() => { jQuery('#edit_owner').select2('open')}, 100);// NO I18N

        /*
        *A function to owner select2 in GroupOwnerPopup
        *@PARAM grp_val - group Value for changeing owner accordingly
        *@PARAM owner_value - available owner value
        */
        function loadOwnerList(grp_val,owner_value = {}){
            ($tasks.row_data && ($tasks.row_data.owner || $tasks.row_data.group)) && jQuery("#MarkGrpTechToggleSpan").hide();
            ownerEle.select2("destroy").val(""); //NO I18N
            var mspGeneralTasks = (window.isMSPOrSCP && module == "general");//NO I18N

            var list_info = {"start_index":1,"row_count":25};//NO I18N
            if(['project','milestone'].contains(module) || module.startsWith("cm_") || mspGeneralTasks ) {
                if(mspGeneralTasks){
                    window.getCustomAccID = function(url) {
                        try{
                            if($tasks.row_data.account.id && url.startsWith("/api/v3/"+entityurl+"/owner")){//No I18N
                                return $tasks.row_data.account.id;
                            }
                        } catch(ex){}
                        return getAccountFromCombo();
                    }
                }
            }
            let select2Options = {
                cache:{}, multiple:false, allowClear: true,
                placeholder: translate("form.select.placeholder", [translate('common.owner')]),
                url:[{
                    url:"/api/v3/"+entityurl+"/owner",//NO I18N
                    field:'owner',//NO I18N
                    list_info: list_info,
                    headers : { Accept: "vnd.manageengine.v3+json"},// NO I18N
                    input_data_Callback : function(e,t,s) {
                        t.list_info.fields_required = ["name", "is_online"];        //No I18N
                         let criteria = t.list_info.search_criteria || [];
                        if(grp_val){
                            criteria.push({
                                field: "support_group", //No I18N
                                condition: "is",    //No I18N
                                value: grp_val,
                                logical_operator: "AND" //No I18N
                            });
                        }
                        if(owner_value && owner_value.online){
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
                }]
            }
            if(!(['project','milestone'].contains(module) || module.startsWith("cm_") || mspGeneralTasks )) {
                select2Options = {
                    ...select2Options,
                    processResults:  FC.config.techStatus.processResults,
                    formatSelection: FC.config.techStatus.formater,
                    formatResult: FC.config.techStatus.formater,
                    sortResults: $tasks.sortTechnician
                }
            }
            ownerEle.sdp_select2(select2Options);
            ownerEle.on("change", function(){
                jQuery("#GroupOwnerAssign").prop("disabled",false); //No I18N
            });

            if(!isbulk && owner_value && owner_value.id){
                var owner_data = $tasks.row_data.owner ? $tasks.row_data.owner : ($tasks.row_data.marked_owner ? $tasks.row_data.marked_owner : "");
                var data = {id : owner_data.id, text : owner_data.name};
                if(!['project','milestone'].contains(module) && !module.startsWith("cm_")) {
                    data.status = owner_data.status
                }
                ownerEle.select2("data", data);// NO I18N
            }
            if(!['project','milestone'].contains(module) && !module.startsWith("cm_")) {
                owner_value.element = jQuery("#edit_owner"); //NO I18N
                FC.config.techStatus.handleFilter(jQuery("#edit_owner"), true, owner_value);
            }
        }
        $tasks.loadOwnerList = loadOwnerList;
        /*
        *A function to load group select2 in GroupOwnerPopup
        */
        function loadGroupList(callBack){
            var group_value = "",owner_value = {};
            if(!['project','milestone','general'].contains(module) && !module.startsWith("cm_")){ //NO I18N
                groupEle.sdp_select2({
                    allowClear: true,
                    url:[{
                        url:"/api/v3/"+entityurl+"/group",//NO I18N
                        field:'group', list_info:{start_index:1,row_count:25}, headers : { Accept: "vnd.manageengine.v3+json" }// NO I18N
                    }]
                });
                groupEle.on("change", function(){
                    jQuery("#GroupOwnerAssign").prop("disabled",false); //No I18N
                });
            }
            if(!isbulk){
                var row_data = $tasks.row_data;

                var group_data = row_data.group ? row_data.group : (row_data.marked_group ? row_data.marked_group : "");
                if(group_data){
                    group_value = {id : group_data.id, text : group_data.name};
                }

                var owner_data = row_data.owner ? row_data.owner : (row_data.marked_owner ? row_data.marked_owner : "");
                if(owner_data){
                    owner_value = {id : owner_data.id, text : owner_data.name};
                }

                if(row_data.marked_group || row_data.marked_owner){
                    jQuery("#MarkButton").trigger("click");
                }else if(row_data.group || row_data.owner){
                    jQuery("#MarkGrpTechToggleSpan").hide();
                }

                if(group_value){
                    groupEle.select2("data",group_value); //NO I18N
                }
            }
            (group_value || owner_value) ? loadOwnerList(group_value.id,owner_value) : loadOwnerList();
            if(callBack){ return callBack();}
        }
        /*
        *A function to intialize GroupOwnerPopup
        */
        function init(){
            inited_assignto_dialog=loadGroupList(function(){
            var assignToDialog=jQuery("#bulk_edit_modal").dialog({ //NO I18N
                autoOpen:false, modal:true,
                width:"auto",//NO I18N
                buttons:[
                    {text:translate("common.assign"),"click":saveGroupOwner,"class":"btn btn-primary", "disabled":"disabled", "id":"GroupOwnerAssign"}, //NO I18N
                    {text:translate("sdp.common.cancel"), "click":closeAssignToDialog,"class":"btn btn-default"} //NO I18N
                ],
                open: function() {
                    initTooltip("#QuickTaskFormDialogBox"); //NO I18N
                },
                close: function () {
                    jQuery(this).dialog("destroy"); // NO I18N
                }
            });
            function closeAssignToDialog(){
                loadAssignToForm.remove();
                assignToDialog.dialog("destroy"); //NO I18N
                    jQuery('body').removeClass('of-h'); //NO I18N
                }
                jQuery(".ui-dialog-buttonset").addClass("tc"); //NO I18N
                function saveGroupOwner(){
                    var inObj={}
                    var BEM_group_val =loadAssignToForm.find("#edit_group").val(); //NO I18N
                    var BEM_owner_val =loadAssignToForm.find("#edit_owner").val(); //NO I18N
                    var markAssign = loadAssignToForm.find("[name=MarkedStatus]").val(); //NO I18N

                    BEM_owner_val  = !BEM_owner_val || BEM_owner_val == "null" ? null:{id:BEM_owner_val} //NO I18N
                    BEM_group_val  = !BEM_group_val || BEM_group_val == "null" ? null:{id:BEM_group_val} //NO I18N

                    if(markAssign=="Mark"){ //NO I18N
                        inObj.marked_owner = BEM_owner_val;
                        if(!['project','milestone','general'].contains(module)){ //NO I18N
                            inObj.marked_group = BEM_group_val;
                        }
                    }else{
                        inObj.owner = BEM_owner_val;
                        if(!['project','milestone','general'].contains(module)){ //NO I18N
                            inObj.group = BEM_group_val;
                        }
                    }

                    isbulk ? $tasks.updateTaskData('bulk_assign',inObj,entityurl) : $tasks.updateTaskData(arg + '_assign',inObj,entityurl,$tasks.row_data.id); //NO I18N

                    closeAssignToDialog();
                }
                return assignToDialog;
            });
            // group and corressponding owner intializtion
            groupEle.change(function(eve){
                var grp_val = eve.target.value;
                loadOwnerList(grp_val);
            });
        }
        return{
            init:init,
            show_assignto_dialog : function(){
                inited_assignto_dialog.dialog("open"); //NO I18N
            }
        }
    },
    /*
        *A function for handling success Message
        *@PARAM resp - API success repsonse
        *@PARAM msg - success message to be displayed
        *@PARAM fromEditPage - From which page
    */
    successMessageHandling : function(resp,successMsg, fromEditPage){
        var successArr = [], warningArr = [], warningMsg = "", res = resp.response_status;
        for(var i=0,len=res.length;i<len;i++){
          if(res[i].status_code == "2000"){
              successArr.push(res[i].id);
          }else if(res[i].status_code == "3000"){
              warningArr.push(res[i+1].id);
              warningMsg += e_html(res[i].messages[0].message) + (res[i+1].id ? " ["+ res[i+1].id +"]" : "" )+ "</br> ";
          }
        }
        if(warningArr.length){
            successArr = jQuery(successArr).not(warningArr).get();
            if(successArr.length){
                showalert('info', successMsg + " ["+successArr+"]" + "</br>" + warningMsg, "isAutoHide=false");
            }else if(successMsg && fromEditPage) {
                showalert('info', successMsg + "</br>" + warningMsg, "isAutoHide=false");
                if(warningMsg){
                    jQuery('[name="save-form"]').prop("disabled", false); //NO I18N
                }
            }else{
                showalert("info",warningMsg,"isAutoHide=true"); //No I18N
            }
        }else if(successArr.length){
            showalert('success',successMsg,"isAutoHide=true"); // NO I18N
        }
    },
    /*
        *A function to update Task for pickup, assign and EstimatedEffortChange
        *@PARAM arg - pickup, assign or EstimatedEffortChange
        *@PARAM data - changed data
        *@PARAM url - update URL if needed
        *@PARAM taskId - Task ID
    */
    updateTaskData : function(arg, data, url, taskId) {
        var successMsg = translate("task.assign.success");
        var markAssign = jQuery("#QuickTaskFormDialogBox").find("[name=MarkedStatus]").val();
        if(arg.endsWith("_assign")){
            successMsg = translate(markAssign == "Mark"?"sdp.project.history.marktask0":"task.assign.success");
            if(arg == "bulk_assign"){
                url += "/_assign?ids="+table_comp_task.bulkSelect.getSelectedIDs();//NO I18N
            }else if(arg == "inline_assign"){//NO I18N
                url += "/_"+markAssign.toLowerCase();
            }else if(arg == "scheduler_assign"){//NO I18N
                url += "/_assign";//NO I18N
            }else{
                if(data.estimated_effort){
                    url = $taskDetails.options.url;
                    successMsg = translate("api.updated.success", [ translate("common.task") ]);
                }else{
                    url = $taskDetails.options.url+"/_"+markAssign.toLowerCase();
                }
            }
        }else if(arg == "pickup"){//NO I18N
            successMsg = translate("task.pickup.success");
            url = table_comp_task.t_obj.options.callbackURL+"/_assign?ids="+table_comp_task.bulkSelect.getSelectedIDs();//NO I18N
            data = {"owner": {"id": sdp_user.LOGGEDIN_USERID}}; //NO I18N
        }

        sdpAjax({
            url  : "/api/v3/"+url, //NO I18N
            type : "PUT",//NO I18N
            ignorefailuremessage: true, async : false, acceptODCompatible: true,
            data : sdpAjaxInputData(!jQuery.isEmptyObject(data)? {"task" : data} : {}),// NO I18N
            success : function(resp){
                if(arg === 'scheduler_assign') {
                    $taskList.scheduler.successIds.push(resp.task.id);
                    return;
                }
                showalert('success',successMsg,"isAutoHide=true"); // NO I18N
                if(arg === "details_assign"){
                    const activeWindow = $extFrame.getActiveWindow();
                    activeWindow.table_combined_task && activeWindow.table_combined_task.refreshTable();
                    $tasks.handlePermissionsForOwnerChange(true, data);
                    $taskDetails.refreshTaskDetails(resp.task);
                    $taskForm.refreshParentWindow($taskDetails.options.from);
                }else{
                    table_comp_task.refreshTable();
                }
            },
            error: function(xhr){
                var resp = xhr.responseJSON.response_status;
                if(arg === 'scheduler_assign') {
                    showalert('failure', e_html(resp.messages[0].message), "isAutoHide=false"); // NO I18N
                    return;
                }
                if(arg === 'pickup' || arg === 'bulk_assign'){
                    if(['project','milestone'].indexOf($taskList.taskOptions.module) != -1 && resp[0].messages && resp[0].messages[0].status_code == 4001){
                        showalert('failure',translate("task.pickup.error"), "isAutoHide=false");// NO I18N
                        return;
                    }else {
                        var successArr = [], failureArr = [], failureMsg="";
                        for(var i=0,len=resp.length;i<len;i++){
                            if(resp[i].status_code == "2000"){
                                successArr.push(resp[i].id);
                            }else if(resp[i].status_code == "4000"){
                                failureArr.push(resp[i].id);
                                failureMsg = resp[i].messages[0].message;
                            }
                        }
                        if(successArr.length){ showalert('success',successMsg + " ["+successArr+"]" ,"isAutoHide=true"); } // NO I18N
                        if(failureArr.length){ showalert("failure",failureMsg + " ["+failureArr+"]","isAutoHide=false"); } //No I18N
                    }
                    table_comp_task.refreshTable();
                }else if(resp && resp.messages && resp.messages[0].message){
                    showalert('failure', e_html(resp.messages[0].message), "isAutoHide=false"); // NO I18N
                }
            },
        });
        return true;
    },
    /*
        *A function to render the GroupOwnerPopup template and intiate
        *@PARAM arg - inline, details or bulkAssign
        *@PARAM id - Task ID
    */
    BEA_Show_bem_dialog : function(arg, id){
        renderhbs("#bulk_edit_modal","GroupOwnerPopup", {'arg':arg == undefined? 'bulkAssign':arg}, false,"task");//No I18N
        var BulkEditAssign = (arg == "inline" || arg == "details") ? $tasks.BulkEditAssign(arg,id) : $tasks.BulkEditAssign("bulk_"); //NO I18N
        BulkEditAssign.init();
        BulkEditAssign.show_assignto_dialog(); // initializing bulk edit
    },
    /*
        *A function to cosntruct HTML contents for group and owner fields
        *@PARAM arg - inline, details
        *@PARAM field - Group or Owner
        *@PARAM rwo_data - respective task details
    */
    constructGroupOwnerField : function(arg,field,row_data){
        var col_str = "-", assignName = "", assign_id = "",isMarked = false,isUnAssigned = false;
        if(row_data.marked_group || row_data.marked_owner){
            if(row_data["marked_" + field]){
                if(arg == "details"){
                    col_str = '<span>'+e_html(row_data["marked_" + field].name)+'<span rel="uitip" id="markIcon" title="'+translate('task.marked.markedtooltip')+ '">&nbsp;<img class="mark-icon-right" src="/images/spacer.gif"></span></span>'; // NO I18N
                }else if(arg == "inline"){// NO I18N
                    col_str = '<span rel="uitip" title="'+translate('task.marked.markedtooltip')+'"><img class="mark-icon mr5 mt-5 pos-rel top2" src="/images/spacer.gif"></span><span>' + e_html(row_data["marked_" + field].name) + '</span>';
                }
                assign_id = row_data["marked_" + field].id;
                assignName = row_data["marked_" + field].name;
            }
            isMarked = true;
            isUnAssigned = true;
        }else if(row_data.group || row_data.owner){
            if(row_data[field]){
                col_str    = e_html(row_data[field].name);
                assign_id  = row_data[field].id;
                assignName = row_data[field].name;
            }
        }
        return '<span id="box_Task'+field+'_'+row_data.id+'" title="'+e_attr(e_html(assignName))+'" rel="uitip" mode_html="true" name="TaskListInlineDisplayDiv" marked="'+isMarked+'" unassigned="'+isUnAssigned+'" attrvalue="'+assign_id+'" >'+ col_str +'</span>';
    },
    /*
        *A function to construct Mark Assign Toggle button
        *@PARAM mark_assign - Mrk or Assign
        *@PARAM form - For form or detials page
    */
    createMarkAssigntoggle : function( mark_assign , form ) {
        form = (!form)? jQuery("#TaskGroupTechLayer")[0] : form;
        var parentElem = (typeof form === 'string')? parent.jQuery('#'+form) : form;// NO I18N

        if(mark_assign == 'Mark'){
            jQuery(parentElem).find('#MarkButton').attr('class','toggle-btn1-on');
            jQuery(parentElem).find('#AssignButton').attr('class','toggle-btn1-off tgl-btn-posfix');
            jQuery("[id='markIcon']").removeClass("hide");
            jQuery("#s2id_for_owner").width(jQuery('[name="percentage_completion"]').width() - jQuery("#MarkGrpTechToggleSpan").width()-jQuery("[id='markIcon']").width());
            jQuery("#group_control .select2-container").width(jQuery('[name="percentage_completion"]').width()-jQuery("[id='markIcon']").width()); //No I18N
        }else{
            jQuery(parentElem).find('#AssignButton').attr('class','toggle-btn1-on tgl-btn-posfix');
            jQuery(parentElem).find('#MarkButton').attr('class','toggle-btn1-off');
            jQuery("[id='markIcon']").addClass("hide");
            jQuery("#s2id_for_owner").width(jQuery('[name="percentage_completion"]').width() - jQuery("#MarkGrpTechToggleSpan").width());
            jQuery("#group_control .select2-container").width("340px"); //No I18N
            (jQuery("#edit_owner").val() != '' || jQuery("#edit_group").val() != '') && jQuery("#GroupOwnerAssign").prop("disabled",false);//No I18N
        }
        jQuery(parentElem).find('#MarkedStatus').val(mark_assign);
    },
    /*
        *A function to delete the selected Tasks
        *@PARAM action - inline, details or bulkAssign
        *@PARAM from - From which page like showAllTasks or HomeMyTasks or TaskSidePanel
        *@PARAM url - delete URL
    */
    deleteTask: function(action, from, url, id){
        showconfirm(true,
            "title=," + //No I18N
            "message=" + translate("sdp.admin.request.template.task.delete.confirm") + "," + //No I18N
            "submitbutton=" + translate("sdp.common.ok") + "," + //No I18N
            "cancelbutton=" + translate("sdp.common.cancel") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes",// NO I18N
            function(didConfirm) {
                if (didConfirm) {
                    var _self;
                    if(action === 'bulkDelete') {
                        _self = $taskList;
                        url  = "/api/v3/" + $tasks.getEntityURL(_self.taskOptions.module, _self.taskOptions.moduleId, _self.taskOptions.projectId); //NO I18N
                        url += "?ids="+table_comp_task.bulkSelect.getSelectedIDs(); //NO I18N
                    } else if(from === 'details') { //NO I18N
                        url = "/api/v3/"+$taskDetails.options.url; //NO I18N
                        _self = $taskDetails
                    } else if(['showAllTasks', 'combinedView'].indexOf(from) > -1 || (window.isMSPOrSCP && from === 'account')) { //NO I18N
                        url = "/api/v3/"; //NO I18N
                        url += (from === 'combinedView')?(table_combined_task.loadedRecords[id].task.baseURL + "/" + id) : (table_comp_task.loadedRecords[id].baseURL+ "/" + id);
                        _self = $taskList;
                    } else if(from === 'requestSideBarTaskDelete') { //NO I18N
                        url = "/api/v3/" + url; //NO I18N
                    }
                    sdpAjax({
                        url : url, type : "DELETE", //No I18N
                        acceptODCompatible: true, async : false,
                        success : function(resp){
                            var successMsg = (resp.response_status.messages)? resp.response_status.messages[0].message : translate("sdp.project.history.taskdelete");
                            showalert('success', successMsg, "isAutoHide=true"); //NO I18N

                            if(from === 'showAllTasks' || ( window.isMSPOrSCP && from === 'account')) {
                                return;
                            }
                            if(action === 'bulkDelete' || from === 'combinedView') {
                                _self.taskOptions && (_self.taskOptions.module === 'release' || _self.taskOptions.module === 'change') && window.top.$rc.refreshLeftPanelCount("task")// NO I18N
                                _self.taskOptions && _self.taskOptions.module === 'problem' && window.top.$problemDetails.refreshRightSectionProperties('tasks');// NO I18N
                                from === 'combinedView'? table_combined_task.refreshTable("refresh") : table_comp_task.refreshTable("refresh");// NO I18N
                                return;
                            }

                            if(from == "requestSideBarTaskDelete"){
                                taskcombinedViewObj.refreshSideBarTaskView();
                            } else if(from === 'details' && ['gantt', 'resMgmt', 'combinedView', 'reqListView', 'homeMyTasks', 'rq_leftpanel'].indexOf(_self.options.from) == -1) { // NO I18N
                                const activeWindow = $extFrame.getActiveWindow();
                                (_self.options.module == "release" || _self.options.module == "change") && (activeWindow.$rc && activeWindow.$rc.refreshLeftPanelCount("task"));// NO I18N
                                _self.options.module === 'problem' && activeWindow.$problemDetails && activeWindow.$problemDetails.refreshRightSectionProperties('tasks');// NO I18N
                                _self.redirectToTaskList();
                                return;
                            }else if(_self.options.from == "resMgmt"){// NO I18N
                                $taskForm.refreshParentWindow(_self.options.from);
                            }else if(_self.options.from == "homeMyTasks" || _self.options.from === 'reqListView'){// NO I18N
                                (window.location.href.indexOf("my_view") > -1)? $extFrame.getActiveWindow().loadHomePageTabContent('my_view') : taskcombinedViewObj.refreshSideBarTaskView();// NO I18N
                            } else if(_self.options.from === "gantt"){ //NO I18N
                                (window.location.href.indexOf("projectid") === -1)? window.location.reload() : loadProjectGanttDetails();
                            }
                            jQuery("#taskDetailsDialog").length && jQuery("#taskDetailsDialog").dialog("close");// NO I18N
                        },
                        error: function(xhr) {
                            var responseText = "";
                            var success_msg = translate("common.taskdeleted");//NO I18N
                            var resp = xhr.responseJSON;
                            var failedArr = [];
                            if(resp.response_status && resp.response_status.constructor === Array){
                                $tasks.successMessageHandling(resp, success_msg)
                                responseText = resp.response_status[0];
                                resp.response_status.each(function(ele){
                                    if(ele.status_code === 4000){
                                        failedArr.push(ele.id);
                                    }
                                });
                            }else{
                                responseText = resp.response_status;
                            }
                            if(responseText && responseText.messages && responseText.messages[0].message){
                                var msg =  (failedArr.length > 1) ? responseText.messages[0].message + " [ "+failedArr.join(", ")+ " ] " : responseText.messages[0].message;
                                var alertType = (responseText.messages[0].status_code === 8001)? 'info' : 'failure'; //NO I18N
                                showalert(alertType, e_html(msg),"isAutoHide=false");// NO I18N
                            }
                        },
                    });
                    _self && _self.options && _self.options.from === "gantt" && loadProjectGanttDetails();// NO I18N
                    table_comp_task && table_comp_task.refreshTable("refresh"); // NO I18N
                    table_combined_task && table_combined_task.refreshTable("refresh"); // NO I18N
                }
            },true
        );
    },
    /*
        *A function used to close task
        *@PARAM url - close Url
        *@PARAM arg - BulkClose
        *@PARAM id - Task ID
    */
    closeTask: function(url, arg, id){
        if(arg === 'bulkClose') {
            url = $taskList.taskOptions.url + "/_close?ids="+table_comp_task.bulkSelect.getSelectedIDs(); //NO I18N
        } else if(!url) {
            url = (arg === 'combinedViewClose')? table_combined_task.loadedRecords[id].task.baseURL : table_comp_task.loadedRecords[id].baseURL
            url += "/_close"; //NO I18N
        }
        url += id? "?ids=" + id : ""; //NO I18N
        sdpAjax({
            url : "/api/v3/"+url, //NO I18N
            type : "PUT", //NO I18N
            ignorefailuremessage: true, // Inorder to show warning msg when closing rule is enabled for task.
            success : function(res){
                const activeWindow = $extFrame.getActiveWindow();
                if(jQuery.isArray(res.response_status)){
                    $tasks.successMessageHandling(res, window.translate("sdp.project.history.closetask0"));
                } else {
                     showalert('success', window.translate("sdp.project.history.closetask0"),"isAutoHide=true"); // NO I18N
                }
                if(res.tasks && (res.tasks.associated_entity == "release" || res.tasks.associated_entity == "change")
                    || (jQuery.isArray(res.tasks) && (res.tasks[0].associated_entity === 'release' || res.tasks[0].associated_entity === 'change'))){
                    activeWindow.$rc && activeWindow.$rc.refreshLeftPanelCount("task"); // NO I18N
                }
                if(res.tasks && res.tasks.associated_entity == "problem" || (jQuery.isArray(res.tasks) && res.tasks[0].associated_entity === 'problem')){
                    activeWindow.$problemDetails && activeWindow.$problemDetails.refreshRightSectionProperties("tasks"); // NO I18N
                }
            },
            error: function(xhr) {
                var responseText = "";
                var success_msg = translate("sdp.project.history.closetask0");//NO I18N
                var resp = xhr.responseJSON;
                var failedArr = [];
                if(resp.response_status && resp.response_status.constructor === Array){
                    $tasks.successMessageHandling(resp, success_msg)
                    resp.response_status.each(function(ele){
                        if(ele.status_code === 4000){
                            responseText = ele;
                            failedArr.push(ele.id);
                        }
                    });
                }else{
                    responseText = resp.response_status;
                }
                if(responseText && responseText.messages && responseText.messages[0].message){
                    var msg =  (failedArr.length > 1) ? responseText.messages[0].message + " [ "+failedArr.join(", ")+ " ] " : responseText.messages[0].message;
                    var alertType = (responseText.messages[0].status_code === 8001)? 'info' : 'failure'; //NO I18N
                    showalert(alertType, e_html(msg),"isAutoHide=false");// NO I18N
                }
            },
            async : false,
            acceptODCompatible : true
        });
        table_comp_task && table_comp_task.refreshTable("refresh");// NO I18N
        table_combined_task && table_combined_task.refreshTable("refresh");// NO I18N
        window.location.href.includes("/ui/home") && $extFrame.getActiveWindow().loadHomePageTabContent(getSDPURLParams().view_type) // NO I18N
    },
    /*
        *A function used to save changes made in Gantt view Task Tooltip
        *@PARAM input_data - updated data
        *@PARAM projectId - project ID sent for milestone module
        *@PARAM milestoneId - milestone ID
        *@PARAM taskId - task id
    */
    saveGanttTaskChanges: function(input_data, projectId, milestoneId, taskId) {
        sdpAjax({
            url  : '/api/v3/projects/'+projectId+(milestoneId ? '/milestones/'+milestoneId : '') + '/tasks/' + taskId,// NO I18N
            type : "PUT", //NO I18N
            acceptODCompatible: true, async : false,
            data : sdpAjaxInputData(input_data),
            success : function(resp){
                var message = "";
                if(resp.response_status.messages){
                    message = resp.response_status.messages[0].message;
                }else{
                    message = translate("api.updated.success", [ translate("common.task") ]);
                }
                showalert('success',message,"isAutoHide=true"); // NO I18N
                window.location.href.indexOf("projectid") !== -1? loadProjectGanttDetails() : window.location.reload();
            },
        });
    },
    /*
        *A function to add overDue Flag in for status Field
    */
    addOverDueFlag: function() {
        if(taskFormComp && taskFormComp.entitydata && taskFormComp.entitydata.overdue) {
            var nodeList = document.querySelectorAll('[data-name="status"]'); //No I18N
            var statusElement = nodeList[nodeList.length - 1];
            if(statusElement && !statusElement.querySelector('#overdueFlag')) { //No I18N
                var flagElement = document.createElement("span");
                flagElement.classList.add('list-sprite', 'icon-sm', 'flag-warning-icon') //No I18N
                flagElement.align = "absmiddle"
                flagElement.hspace = "4"
                flagElement.id = 'overdueFlag'
                statusElement.appendChild(flagElement)
            }
        } else {
            var ele = document.getElementById('overdueFlag');
            if(ele) {
                ele.remove();
            }
        }
    },
    loadTaskComments : function(entity, url, taskOwnerId, entityId, modalEle){
    	if(entity == "milestone") {
    		var navinfo = {
    			entity: "tasks", // NO I18N
    			entityId: getUrlParameterByName('TASKID', url), // NO I18N
    			entityOwner: taskOwnerId,
    			parentEntity: "milestones", // NO I18N
    			parentEntityId: entityId,
    			grandParentEntity: "projects", // NO I18N
    			grandParentEntityId: getUrlParameterByName('projectId', url) // NO I18N
    		}
    	} else if(entity == 'general') { // NO I18N
    		var navinfo = {
    			entity: "tasks", // NO I18N
    			entityId: getUrlParameterByName('TASKID', url) // NO I18N
    		}
    	} else {
    		var navinfo = {
    			entity: "tasks", // NO I18N
    			entityId: getUrlParameterByName('TASKID', url), // NO I18N
    			entityOwner: taskOwnerId,
    			parentEntity: entity + "s", // NO I18N
    			parentEntityId: entityId
    		}
    	}
        navinfo.parentSingularName = "task"; // NO I18N
    	showComments(navinfo, modalEle);
    },
    /*
        *A function used to update total and completed task count in parent window
    */
    updateParentTaskCount: function(module, moduleId){
        if(module == "release" || module == "change"){
            window.top.$rc.refreshLeftPanelCount("task");// NO I18N
        }else if(module == "request") {// NO I18N
            window.top.$req.details.getRequestSummary(moduleId);
            window.top.$req.rpanel.render(false, false);
        }else if(module == "problem"){// NO I18N
            window.top.$problemDetails.refreshRightSectionProperties("tasks");// NO I18N
        }else if(module == "milestone" || module == "project"){// NO I18N
            var completedTasks = 0, totalTasks = 0;
            var url = "/api/v3/"+module +"s/"+moduleId+"/tasks/_total_count";//NO I18N
            if(module === "milestone"){
                url = "/api/v3/projects/"+$taskList.taskOptions.projectId+"/milestones/"+moduleId+"/tasks/_total_count";//NO I18N
            }
            sdpAjax({
                acceptODCompatible: true, async: false, data: sdpAjaxInputData({"list_info":{"filter_by":{"name":"completed_tasks"}}}),// NO I18N
                url: url,
                success: function(data) {
                    completedTasks = data._total_count.tasks;
                }
            });
            sdpAjax({
                acceptODCompatible: true, async: false, data: sdpAjaxInputData({"list_info":{"filter_by":{"name":"pending_tasks"}}}),// NO I18N
                url: url,
                success: function(data) {
                   pendTasks = data._total_count.tasks;
                }
            })
            jQuery("#"+module+"_totalTasks").html(pendTasks);
            jQuery("#"+module+"_closedTasks").html(completedTasks+"<em></em>");
        }
    },
    /*
        A function to call _links for task edit
    */
    isUserPermittedToEdit: function(url) {
        var isPermitted = false;
        sdpAjax({
            url: "/api/v3/" + url + "/_links", //NO I18N
            data: sdpAjaxInputData({"operations_required": ["edit"]}), //NO I18N
            acceptODCompatible: true, async: false,
            success: function(res) {
                jQuery.each(res._links.links, function(idx, val){
                    if(val.name === 'edit') {
                        isPermitted = true;
                    }
                })
            }
        })
        return isPermitted;
    },
    /*
        A function to check permission and render task details page for task edit.
    */
    handlePermissionsForOwnerChange: function(fromDetails, data, form, _self) {
        const activeWindow = $extFrame.getActiveWindow();
        if(fromDetails) {
            if(!data.owner || (data.owner && (data.owner.id != sdp_user.LOGGEDIN_USERID))) {
                if(!$tasks.isUserPermittedToEdit($taskDetails.options.url)) {
                    activeWindow.$taskDetails.options.allowedOperations.edit = false;
                    activeWindow.$taskDetails.init($taskDetails.options);
                }
            }
        } else {
            if(activeWindow.$taskDetails.options && form.options.entitypath === activeWindow.$taskDetails.options.url) {
                if(taskFormComp.fields.changed && taskFormComp.fields.changed.indexOf('owner') > -1) {
                    if(!($tasks.isUserPermittedToEdit(activeWindow.$taskDetails.options.url))) {
                        activeWindow.$taskDetails.options.allowedOperations.edit = false;
                        activeWindow.$taskDetails.init(activeWindow.$taskDetails.options);
                    }
                }
            }
        }
    },

    setPersonalizeUserData: function(filterid, keyName) {
      var persObj = $tasks.getPersonalization(keyName,"tasks") ;// NO I18N
      persObj.list_info.filter_by = {"id":filterid} ;//NO I18N
      addPersonalization(keyName, persObj);
    },
    /*
        A function to get default personalization data for the modules project/milestone/task/project association(request/change)
    */
    getPersonalization: function(personalize_key, default_Key){
        var persObj = getPersonalizeData(personalize_key);
        if(jQuery.isEmptyObject(persObj)){
            switch(default_Key || personalize_key){
                case "projects":// NO I18N
                    persObj = {
                        "fields_required" : {"title":"","status":"","priority":"","owner":"","scheduled_end_time":"","projected_end_time":"","milestone_progress":"","task_progress":""}, //No I18N
                        "column_order" : ["title","status","priority","owner","scheduled_end_time","projected_end_time","milestone_progress","task_progress"]// NO I18N
                    };
                    break;
                case "milestones":// NO I18N
                    persObj = {
                        "fields_required":{"title":"","status":"","priority":"","owner":"","scheduled_end_time":"","projected_end_time":"","task_progress":""},// No I18N
                        "column_order":["title","status","priority","owner","scheduled_end_time","projected_end_time","task_progress"] // No I18N
                    }
                    break;
                case "tasks":// NO I18N
                    persObj = {
                        "fields_required" : {"priority":"","stage":"","status":"","title":"","owner" : "","scheduled_start_time":"","scheduled_end_time":"","percentage_completion":"","index":"","associated_entity":"","link":""}, //No I18N
                        "column_order" : ["title","stage","status","priority","owner","scheduled_start_time","scheduled_end_time","percentage_completion","index","associated_entity","link"] // No I18N
                    }
                    break;
                case "project_request":// NO I18N
                    persObj = {
                        "fields_required" : {"id":"","subject":"","requester":"","technician":"","due_by_time":"","status":"","created_time":""}, //No I18N
                        "column_order":["id","subject","requester","technician","due_by_time","status","created_time"] //No I18N
                    }
                    break;
                case "project_change":// NO I18N
                    persObj = {
                         "fields_required" : {"title":"","status":"","scheduled_end_time":"","scheduled_start_time":"","priority":"","stage":"","change_owner":"","change_type":""}, // No I18N
                         "column_order":["title","change_owner","priority","change_type","stage","status","scheduled_start_time","scheduled_end_time"] // No I18N
                    }
                    break;
                case "worklogs"://NO I18N
                    persObj = {
                        "fields_required": {"owner":"", "start_time":"", "total_cost":"", "other_cost":"", "end_time":"", "owner_cost":"", "description":"", "time_spent":"" },//NO I18N
                        "columns_order":["owner", "start_time", "total_cost", "other_cost", "end_time", "owner_cost", "description", "time_spent" ]//NO I18N
                    }
                    break;
            }
            persObj.list_info = {"row_count": "10"};// NO I18N
        }
        return persObj;
    },
    /*
        A function to fetch the date conditions for date fields in project/task used in advanced filter.
    */
    getCustomDateCond: function(){
        return {
            "date_conditions": [//NO I18N
                {
                    "name":"date",//NO I18N
                    "display_name":translate("sdp.common.date"),//NO I18N
                    "children":[//NO I18N
                        {"id":"is", "text":translate("sdp.condition.13")},//NO I18N
                        {"id":"is not", "text":translate("sdp.condition.not.on")},//NO I18N
                        {"id":"before", "text":translate("sdp.condition.15")},//NO I18N
                        {"id":"after", "text":translate("sdp.condition.14")},//NO I18N
                        {"id":"on or before", "text":translate("sdp.condition.on.before")},//NO I18N
                        {"id":"on or after", "text":translate("sdp.condition.on.after")},//NO I18N
                        {"id":"is empty", "text":translate("sdp.admin.rule.addrule.condition.isempty")},//NO I18N
                        {"id":"is not empty", "text":translate("sdp.admin.rule.addrule.condition.isnotempty")},//NO I18N
                        {"id":"between", "text":translate("sdp.criteria.26")},//NO I18N
                        {"id":"not between", "text":translate("common.notbetween")}//NO I18N
                    ]
                },
                {
                    "name":"dur",//NO I18N
                    "display_name":translate("admp.duration"),//NO I18N
                    "children":[//NO I18N
                        {"id":"dur.on", "text":translate("sdp.condition.13"), "type":"dateSelect"},//NO I18N
                        {"id":"dur.not on", "text":translate("sdp.condition.not.on"), "type":"dateSelect"},//NO I18N
                        {"id":"dur.before", "text":translate("sdp.condition.15"), "type":"dateSelect"},//NO I18N
                        {"id":"dur.after", "text":translate("sdp.condition.14"), "type":"dateSelect"},//NO I18N
                        {"id":"dur.on or before", "text":translate("sdp.condition.on.before"), "type":"dateSelect"},//NO I18N
                        {"id":"dur.on or after", "text":translate("sdp.condition.on.after"), "type":"dateSelect"}//NO I18N
                    ]
                }
            ],
            "date_placeholders": [//NO I18N
                {"id":"$(current_time)", "text":translate("sdp.common.currenttime")},//NO I18N
                {"id":"$(today)", "text":translate("sdp.common.today")},//NO I18N
                {"id":"$(tomorrow)", "text":translate("sdp.common.tomorrow")},//NO I18N
                {"id":"$(yesterday)", "text":translate("sdp.common.yesterday")},//NO I18N
                {"id":"$(this_week)", "text":translate("sdp.common.thisweek")},//NO I18N
                {"id":"$(last_week)", "text":translate("sdp.common.lastweek")},//NO I18N
                {"id":"$(next_week)", "text":translate("sdp.common.nextweek")},//NO I18N
                {"id":"$(last_month)", "text":translate("sdp.common.lastmonth")},//NO I18N
                {"id":"$(next_month)", "text":translate("sdp.common.nextmonth")},//NO I18N
                {"id":"$(this_month)", "text":translate("sdp.common.thismonth")},//NO I18N
                {"id":"$(this_year)", "text":translate("sdp.common.thisyear")}//NO I18N
            ]
        };
    },
    /*
        Function to sort owner name alphabetically in the owner dropdown
    */
    sortTechnician: function(results, container, query) {
        if(query.term) { //for search
            return sortResultsFn(results, container, query);
        }
        else {
            const loggedInUser = results.shift();
            results.sort((a, b) => a.text.localeCompare(b.text));
            results.unshift(loggedInUser);
            return results;
        }
    },
    /*
        A common function to fetch the template info for project/milestone/task/worklog
    */
    getTemplateInfo: function(url, entity) {
        var template;
        sdpAjax({
            async: false, url: "/api/v3" + url, // No I18N
            success: function(resp) {
                template = resp[entity];
            }
        });
        return template;
    }
}
