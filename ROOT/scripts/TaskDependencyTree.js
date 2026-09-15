/* $Id:$ */
/*DependencyTree object */
var $task_dep = {
	 inputValues : undefined,
	 init: function(){
		inputValues = {};
		var csstoLoad = "/style/dhtmlxscheduler-overwrite.css"; //No I18N
		if(sdp_user.DIRECTION == "RTL"){
			csstoLoad = "/style/dhtmlxscheduler-overwrite_RTL.css"; //No I18N
		}
		ResourceLoader({
			js: ["/scripts/d3.min.js"] ,   //No i18N
			css: [csstoLoad],
		    success :function(){
		        spInit();
		    $task_dep.populateTreeData();

		    jQuery('#canvasDiv').scroll(function() {
			    jQuery('#tddelete').css('display', 'none'); //No I18N
		    });
		}
	    });
		jQuery(window).resize(function() {
		    if(jQuery('#tree-container').length != 0){
			    DependencyTree.getInstance().svgDimensionCalc();
			    $task_dep.updateViewPortLayout();
			}
		});
	 },
	 tdPanelSlider : function(){
		jQuery("#td-helpcard").removeClass("hide").panelSlider({
			width: 500,
			header: true,
			title : translate("sdp.admin.helpcard"),
			dialogClass: "td-helpcard",  // NO I18N
			placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
		});
	 },
	closeTaskDependency : function(module, isDependencyEditable){
		jQuery(".td-tree-view").remove();
        jQuery(".tree-recents-div").remove();
        if(module == "request"){//NO I18N
            $req.details.changeTab('tasks', null, event); //NO I18N
		}
		else if(module == "problem"){
			jQuery("[id$='details-tabs-problem'] [data-name=tasks]").trigger('click') //NO I18N
		}
		else if(module == "change"){
			jQuery("[id$='-tabs-panel'] [data-name=tasks].active").trigger("click");
        }else if(module == "project"){//NO I18N
            isDependencyEditable === "true" && jQuery("#ProjectTask-list").click();
        }else if(module == "milestone"){//NO I18N
            jQuery("#MileStoneTasks").click();
        }else if(module == "release"){//NO I18N
            jQuery("[id$='-tabs-panel'] [data-name=tasks].active").trigger("click");
        }else if(module.startsWith("cm_")){// No I18N
            jQuery("[data-name='tasks']").trigger("click");
        }
        jQuery("body").removeClass("of-h").css("overflow","auto"); //No I18N
	},
	populateTreeData : function(operation){
		var treeData = {};
		var nodes = [];
		var links = [];
		var milestones = [];
		treeData.nodes = nodes;
		treeData.links = links;
		treeData.milestones = milestones;
		var module = jQuery("#moduleName").attr("value");
		if(module.startsWith("cm_")){
            module = jQuery("#cm_api_plural_name").attr("value")
        }
		var subModule;
		if(module === 'project'){
			subModule = "milestones";	//No I18N
		}
		else if(module === 'project_template'){
			subModule = "milestone_templates";	//No I18N
		}
		var baseURL = $task_dep.getBaseUrlForTaksDep();
		var urlToGetTasks ="";
		if(module === 'request_template' || module==='project_template' || module==='milestone_template' || module==='problem_template'){
			urlToGetTasks = baseURL + "/task_templates";//No I18N
		}else{
			urlToGetTasks = baseURL + "/tasks?for=dep";//No I18N
		}
		var apiData;
		var taskindex=1;
		var populateMilestonesSuccFunc = function(data, isSuccess){
			$task_dep.populateMilestoneTreeNodes(data, treeData);
			if(data && data.list_info && data.list_info.has_more_rows) {
				var startindex = data.list_info.start_index+data.list_info.row_count;
				apiData = sdpAjaxInputData({"list_info":{"start_index":startindex,"row_count":100, "sort_field":"id"}}); //No I18N
				sdpAjax({
					url: baseURL+"/"+subModule, // No I18N
					data: apiData,
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					cache: false,
					async: false,
					success: function(response) {
						data = response;
						populateMilestonesSuccFunc(data, true);
					}
				})
			}
			else {
				apiData = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":100,"get_total_count":true,"sort_field":"id"}}); //No I18N
				sdpAjax({
					url: urlToGetTasks,
					data: apiData,
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(response) {
						data = response;
						populateTaskListSuccFunc(data, true);
					}
				})
			}
		};
		var urlToGetTaskDependencies = "";
		if(module === 'request_template' || module === 'project_template' || module==='milestone_template' || module==='problem_template'){
			urlToGetTaskDependencies = baseURL + "/task_template_dependencies";//No I18N
		}else{
			urlToGetTaskDependencies = baseURL + "/task_dependencies"; //No I18N
		}
		var taskDepParam;
        if(module === 'release' || module === 'change'){
        	taskDepParam={"list_info":{"start_index":1,"row_count":100, "sort_field":"id"},"stage":{id:jQuery('#stageId').val()}};   //No I18N
        }else {
            taskDepParam={"list_info":{"start_index":1,"row_count":100, "sort_field":"id"}};//No I18N
        }
		var ids = new Array();
		var taskCheckSuccFunc=function(data){
			$task_dep.markTaskDependencies(data, treeData);
			if(module == "milestone" || module == "milestone_template"){
				var dataArr = data.task_dependencies?data.task_dependencies:data.task_template_dependencies;
				for(var i=0,len=dataArr.length;i<len;i++){
					var childfound = false,parentfound = false;
					var nodeDataArr = treeData.nodes;
					for(var j=0,l=nodeDataArr.length;j<l;j++){
					   if((dataArr[i].child_task ? dataArr[i].child_task : dataArr[i].child_task_template.id) == nodeDataArr[j].id){
							childfound = true;
						}
					   else if((dataArr[i].parent_task ? dataArr[i].parent_task.id : dataArr[i].parent_task_template.id) == nodeDataArr[j].id){
							parentfound = true;
						}
					}
					if(childfound == false){
					   ids.push(dataArr[i].child_task ? dataArr[i].child_task : dataArr[i].child_task_template.id);
					}
					else if(parentfound == false){
					   ids.push(dataArr[i].parent_task ? dataArr[i].parent_task.id : dataArr[i].parent_task_template.id);
					}
				}
			}
			if(data && data.list_info && data.list_info.has_more_rows){
                taskDepParam.list_info.start_index = data.list_info.start_index+data.list_info.row_count;
				apiData=sdpAjaxInputData(taskDepParam);
				sdpAjax({
					url:urlToGetTaskDependencies,
					data:apiData,
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(res){
						taskCheckSuccFunc(res);
					}
				});
			}else{
				var treeInstance = DependencyTree.getInstance();
				var orientationType = treeInstance.getTreeOrientation();
				if(!orientationType){
					orientationType = '0';//Default layout
				}
				var user_options = {extractTreeData: "true", orientationType: orientationType};
				if(operation === "update"){
					user_options.update = true;
				}
				   //<--Dependent tasks from other milestones/milestone_templates and under project/project_template
				   var input_data = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":10,"search_criteria":{"field":"id","values":ids,"condition":"eq"}}}); //No I18N
				   var otherModuleTaskUrl = "";
				   var tasksuccess = function(data,succ){
					treeInstance.draw(treeData, user_options);
				};
				treeInstance.draw(treeData, user_options);
			}
		};
		var populateTaskListSuccFunc=function(data,isSuccess,operation){
			$task_dep.populateDepenendencyTreeNodes(data, treeData);
			if(data && data.list_info && data.list_info.total_count){
			    jQuery("#taskCount").val(data.list_info.total_count);
			}
			if(data && data.list_info && data.list_info.has_more_rows){
				var startindex=data.list_info.start_index+data.list_info.row_count;
				apiData=sdpAjaxInputData({"list_info":{"start_index":startindex,"row_count":100,"sort_field":"id"}}); //No I18N
				sdpAjax({
					url: urlToGetTasks,
					data: apiData,
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(response) {
						data = response;
						populateTaskListSuccFunc(data, true);
					}
				})
			}else{
				apiData=sdpAjaxInputData(taskDepParam);
				sdpAjax({
					url: urlToGetTaskDependencies,
					data: apiData,
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(response) {
						data = response;
						taskCheckSuccFunc(data);
					}
				})
			}
		};
		var setParentDetailsSuccFunc = function(data,isSuccess)	//Setting the parent module details to the hidden elements
		{
			var moduleName = module.toLowerCase();
			moduleName = moduleName.replace("_template_task","_template");
			if(isSuccess){
				jQuery("#parentTitle").val(data[moduleName].hasOwnProperty("title")?data[moduleName].title:data[moduleName].hasOwnProperty("name")?data[moduleName].name:data[moduleName].subject);
				inputValues.parentTitle = jQuery("#parentTitle").val();
				jQuery("#parentDisplayId").val(data[moduleName].hasOwnProperty("display_id")?(data[moduleName].display_id.display_value?data[moduleName].display_id.display_value:data[moduleName].display_id):data[moduleName].id); //No I18N

				//Setting header data
				if(moduleName == "milestone"){
					jQuery("#projectTitle").text(data[moduleName].title);	//No I18n
				}
				else if(moduleName == "milestone_template"){
					jQuery("#projectTitle").text(data[moduleName].project_template.title);	//No I18n
				}
				jQuery("#moduleTitle").text(inputValues.parentTitle);
				data = data[moduleName];
				if(moduleName === "request"){
					jQuery("#parentOwner").val(data.technician?e_html(data.technician.name):getMessageForKey("sdp.common.notassigned")); //No I18N
					jQuery("#isServiceRequest").val(data.is_service_request); //No I18N
					jQuery("#parentDueByTime").val(data.due_by_time?data.due_by_time.display_value:getMessageForKey("sdp.common.na")); //No I18N
				}
				else if(moduleName === "change"){
					jQuery("#parentOwner").val(data.change_owner?data.change_owner.name:getMessageForKey("sdp.common.notassigned")); //No I18N
					jQuery("#isEmergency").val(data.emergency); //No I18N
					jQuery("#parentDueByTime").val(data.scheduled_end_time?data.scheduled_end_time.display_value:getMessageForKey("sdp.common.na"));
					jQuery("#parentStage").val(data.stage.name); //No I18N
				}
				else if(moduleName === "release"){
					jQuery("#parentOwner").val(data.release_engineer?data.release_engineer.name:getMessageForKey("sdp.common.notassigned")); //No I18N
					jQuery("#parentDueByTime").val(data.scheduled_end_time?data.scheduled_end_time.display_value:getMessageForKey("sdp.common.na"));
					jQuery("#parentStage").val(data.stage.name); //No I18N
				}
				else if(moduleName.startsWith("problem")){
					if(moduleName==='problem_template'){
						data = data.problem;
					}
					jQuery("#parentOwner").val(data.technician?data.technician.name:getMessageForKey("sdp.common.notassigned")); //No I18N
					jQuery("#parentDueByTime").val(data.due_by_time?data.due_by_time.display_value:getMessageForKey("sdp.common.na"));
				}
				else if(moduleName === "milestone_template"){
					jQuery("#parentEstimatedHours").val(data.estimated_hours?data.estimated_hours:'-');
				   }
				else if(moduleName === "project_template"){
					jQuery("#parentEstimatedHours").val(data.estimated_hours?data.estimated_hours:'-');
					jQuery("#parentEstimatedCost").val(data.estimated_cost?data.estimated_cost:'-');
				   }
				else if(moduleName === "request_template"){
					jQuery("#isServiceRequest").val(data.is_service_template); //No I18N
					data = data.request;
				}
				else{
					jQuery("#parentOwner").val(data.owner?data.owner.name:getMessageForKey("sdp.common.notassigned")); //No I18N
					jQuery("#parentDueByTime").val(data.scheduled_end_time?data.scheduled_end_time.display_value:getMessageForKey("sdp.common.na")); //No I18N
				}
				jQuery("#parentStatus").val(data.status?data.status.name:getMessageForKey("sdp.common.na"));
				jQuery("#parentStatus").attr("statuscolor",(data.status?data.status.color:""));
				jQuery("#parentPriority").val(data.priority?data.priority.name:getMessageForKey("sdp.common.notassigned")); //No I18N
				jQuery("#parentPriority").attr("prioritycolor",(data.priority?data.priority.color:""));
				jQuery("#ownerId").val(data.owner? data.owner.id : '');
			}

			var taskparam;
			if(module === 'release'|| module==='change'){
				taskparam={"list_info":{"start_index":1,"row_count":100,"get_total_count":true, "sort_field":"id", "search_criteria": {"field":"stage.id","condition":"is","value":jQuery('#stageId').val()}}};  //No I18N
			}else{
				taskparam={"list_info":{"start_index":1,"row_count":100, "get_total_count":true, "sort_field":"id"}};   //No I18N
			}
			if(module === 'project' || module === 'project_template'){
				apiData = sdpAjaxInputData(taskparam);
				sdpAjax({
					url: baseURL + "/" + subModule, // No I18N
					data: sdpAjaxInputData(apiData),
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(response) {
						data = response;
						populateMilestonesSuccFunc(data, true);
					}
				})
			}
			else{
				apiData=sdpAjaxInputData(taskparam);
				sdpAjax({
					url: urlToGetTasks,
					data: sdpAjaxInputData(apiData),
					acceptODCompatible: true,
					type: "GET", // No I18N
					dataType: "json", // No I18N
					async: false,
					cache: false,
					success: function(response) {
						data = response;
						populateTaskListSuccFunc(data);
					}
				})
			}
			$task_dep.parentModuleHeaderValueUpdate(module);
		}

		var parentURL = jQuery("#taskUrl").val();
		//To get the parent module details for tooltip
		sdpAjax({
			url: parentURL,
			type: "GET", // No I18N
			dataType: "json", // No I18N
			async: false,
			acceptODCompatible: true,
			cache: false,
			success: function(response) {
				data = response;
				setParentDetailsSuccFunc(data, true);
			}
		})
	},
	getCharWidth : function(fontFamily, fontSize) {
		var div = document.createElement("div");
		div.style.position = "absolute";
		div.style.visibility = "hidden";
		div.style.fontFamily = fontFamily;
		div.style.fontSize = fontSize;
		div.innerHTML = "S";//No I18N
		document.body.appendChild(div);
		var width = div.offsetWidth;
		document.body.removeChild(div);
		return(width);
	},
	/* content in html starts*/
	populateMilestoneTreeNodes : function(data, treeData){
		var milestones = treeData.milestones;
		var mArr = data.milestones?data.milestones:data.milestone_templates;
		for(var i=0,len=mArr.length;i<len;i++){
			mArr[i].isMilestone = true;
			mArr[i].type = "milestone";
			milestones.push(mArr[i]);
		}
		treeData.milestones = milestones;
	},

	populateDepenendencyTreeNodes : function(data, treeData){
		var nodes = treeData.nodes;
		var dataArr = data.tasks?data.tasks:data.task_templates;
		for(var i=0,len=dataArr.length;i<len;i++){
			dataArr[i].type = "task";
			nodes.push(dataArr[i]);
		}
		treeData.nodes = nodes;
	},

	markTaskDependencies : function(data, treeData){
		var links = treeData.links;
		var dataArr = data.task_dependencies?data.task_dependencies:data.task_template_dependencies;
		for(var i=0,len=dataArr.length;i<len;i++){
			links.push(dataArr[i]);
		}
		treeData.links = links;
	},
	/* content in html ends*/

	parentModuleHeaderValueUpdate : function(moduletype){
		this.updateViewPortLayout();
		if(moduletype === 'project'  || moduletype === 'project_template'){
			jQuery('.tree-color-sep').hide();
			jQuery('.tree-head-project').hide();
			jQuery('.module-icon').addClass('project-ico-dep');
		}else if(moduletype === 'milestone'){	//No I18N
			jQuery('.tree-color-sep').show();
			jQuery('.tree-head-project').show();
			jQuery('.module-icon').addClass('milestone-ico-dep');
		}else if(moduletype === 'request' || moduletype === 'request_template'){//No I18n
			jQuery('.tree-color-sep').hide();
			jQuery('.tree-head-project').hide();
			var isServiceRequest = jQuery('#isServiceRequest').val();
			var html = '<svg class="header-menu-icons" viewBox="0 0 24 24"><g><path class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;" d="M20,7.77a2.06,2.06,0,0,1-2.91-2.91L14.67,2.44,3,14.07,5.46,16.5a2.05,2.05,0,1,1,2.91,2.9l2.42,2.43L22.43,10.19Z"></path><line class="cls-1" style="fill: none;stroke: currentColor;stroke-miterlimit: 10;" x1="11.1" y1="5.66" x2="19.21" y2="13.76"></line></g></svg>'; //No I18N
			if(isServiceRequest == 'true'){
				jQuery('.module-icon').addClass('service-request-ico-dep');
			}else{
				jQuery('.module-icon').html(html);
			}
		}else if(moduletype === 'problem' || moduletype === 'problem_template'){//No I18n
			jQuery('.tree-color-sep').hide();
			jQuery('.tree-head-project').hide();
			jQuery('.module-icon').addClass('problem-ico-dep');
			jQuery("#moduleTitle").text(inputValues.parentTitle);
		}else if(moduletype === 'change'){//No I18n
			jQuery('.tree-color-sep').hide();
			jQuery('.tree-head-project').hide();
			if(jQuery('#isEmergency').val() == 'true'){
				jQuery('.module-icon').addClass('emergency-change-ico');
			}else{
				jQuery('.module-icon').addClass('general-change-ico');
			}
		}else if(moduletype === "milestone_template"){//No I18n
			jQuery('.tree-color-sep').show();
			jQuery('.tree-head-project').show();
			jQuery('.module-icon').addClass('milestone-ico-dep');
		}
		var root = jQuery(".rootNode");
		var headTitleIcon = root.find(".svg-icon").html();
		var headId = root.find("text").attr("data-id");
		jQuery("#td_hdr_prnt_title").text(inputValues.parentTitle);
		jQuery("#td_header_icon").html(headTitleIcon);
		if(moduletype.startsWith("cm_")){
            jQuery("#td_header_icon").replaceWith('<span class="vmiddle disp-ib rounded-circle p1 icon-lg brd-dark1" id="td_header_icon"><svg class="default-fill m2 ml3" height="20" width="20" viewBox=" 0 0 26 26"><g><g><path d="M22.3,21H1.7C1.3,21,1,20.7,1,20.3V5.7C1,5.3,1.3,5,1.7,5h20.6C22.7,5,23,5.3,23,5.7v14.6C23,20.7,22.7,21,22.3,21z M2,20    h20V6H2V20z"></path></g><g><path d="M7.2,12L7.2,12C5.9,12,5,11.1,5,10V9.9c0-1.2,0.9-2.1,2.1-2.1s2.1,0.9,2.1,2.1C9.2,10.9,8.4,12,7.2,12z M7.1,8.8    C6.5,8.8,6,9.3,6,9.9V10c0,0.5,0.5,1,1.1,1h0.1c0.6,0,1-0.6,1-1.1C8.2,9.3,7.7,8.8,7.1,8.8z"></path></g><g><path d="M1.5,21c-0.1,0-0.2,0-0.3-0.1c-0.2-0.2-0.2-0.5,0-0.7l5-5.5c0.3-0.3,0.7-0.3,1-0.1l2,1.4l4.1-4.2c0.3-0.3,0.7-0.3,1,0    l8.5,8.4c0.2,0.2,0.2,0.5,0,0.7s-0.5,0.2-0.7,0l-8.3-8.2l-4.1,4.2c-0.3,0.3-0.7,0.3-1,0l-2.1-1.4l-4.8,5.3C1.8,20.9,1.6,21,1.5,21    z M13.6,12.5L13.6,12.5L13.6,12.5z"></path></g></g></svg></svg></span>');
        }
		jQuery("#td_header_id").html("#"+headId);
	},
	showPopoverCloseCallback : function(){
		setTimeout(function(){
			closeDD();
		},5000)
	},
	updateViewPortLayout : function (){
		var docwidh = jQuery('#top-band').width() || "100%"; //No I18N
		if(isExport){
            jQuery('#canvasDiv').css('background-image','radial-gradient(circle, #80808000 0px, #80808000 0px)'); //No I18N
        }
		jQuery('#canvasDiv').css('height',"calc(100vh - 52px) !important"); //No I18N
		jQuery('#canvasDiv').css('width',docwidh); //No I18N
		jQuery('body').css("overflow", "hidden"); // NO I18N
	},
	getBaseUrlForTaksDep : function() {
		var baseURL = jQuery("#taskUrl").val();
		return baseURL;
	},
	toggleOrientation : function() {
		var treeInstance = DependencyTree.getInstance();
		var treeData = treeInstance.getTreeData();
		var orientationType = treeInstance.getTreeOrientation();
		if(orientationType == '1'){
			orientationType = '0';
			jQuery('#orientationSpan').addClass('rotate-90');//No I18N
		}else{
			orientationType = '1';
			jQuery('#orientationSpan').removeClass('rotate-90');//No I18N
		}
		jQuery("#orientationType").val(orientationType);
		var user_options = {orientationType: orientationType};
		//clear the container before changing layout
		jQuery("#nodeG").empty();
		jQuery("#linkG").empty();
		DependencyTree.getInstance().draw(treeData, user_options);
		setTimeout(function(){
			DependencyTree.getInstance().svgDimensionCalc();
			d3.selectAll('#baseG').transition()//No I18N
				.duration(750);
		},1000);
	},

    getDimensions : function(element) {
        // find width and height
	    var width, height; //todo
	    var box = element.getBBox();
        var tx = 0, ty = 0;

        if(box.x < 0) {
            tx = -box.x + 10;
        }

        if(box.y < 0) {
            ty = -box.y + 60;
        }

        width = box.x + jQ("#canvasDiv_svg").width() + tx; //No I18N
        height = box.y + box.height + ty + 50;

        return {width: width, height: height, tx: tx, ty: ty};
    },
	exportTaskDependency : function(title, module, parentid, grantParentID, stageId, taskCount) {
        if(taskCount > parseInt(sdp_app.TASK_DEPENDENCY_EXPORT_LIMIT)){
            showalert("info", getMessageForKey("sdp.tasks.dependency.export.limitmsg"),"isAutoHide=false"); // No I18N
        }else{
            var url = `/tasks/TaskDependencyTreeView.jsp?mode=view&module=${module}&entityid=${parentid}&isExport=true`;
			if(grantParentID != "null"){url = url+ "&grandParentId="+grantParentID};
			if(stageId != "null"){ url = url+ "&stageId="+stageId};
			if(DependencyTree.getInstance().getTreeOrientation() == '1'){
				url = url+ "&orientationType=1";
			}
			var height = Math.round(jQuery('#canvasDiv_svg').height());
			var width = Math.round(jQuery('#canvasDiv_svg').width());
			exportPdf({
				url:url,
				puppeteer: {
		            waitUntil: "networkidle0"
		        },
		        page_settings: {
		            timeout: "1000",
		            waitfor_selector: "#exportHeader"
		        },
				showLoading:()=>{
					jQuery('#savePdfLi').append('<span id="depLoader" class="icon-sm spinner-icon1 vmiddle top-2 ml10"></span>').addClass("ptr-ev-none").css('opacity', '0.5'); // No I18N
				},
				hideLoading:(isSuccess)=>{
					jQuery('#depLoader').remove();
					jQuery('#savePdfLi').removeClass("ptr-ev-none").css('opacity', '1.0');
					if(isSuccess){
						showalert("success", translate('sdp.export.pdf.completed'), "isAutoHide=true");
					}
				},
				error:(response)=>{
					if(response.error.error && response.error.error.statuscode == 400 ){
						showalert("failure", translate("sdp.security.threshold.blocked"), "isAutoHide=false");
					}else if(response.message){
						showalert("failure", translate(response.message), "isAutoHide=false");
					}else{
					    showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"), "isAutoHide=false");
					}
				},
				pdf:{
					scale:1.8
				},
				fileName:`TaskDependencies_${module}_${parentid}_${getFormattedDateTime(new Date(), true)}`,
				height: height,
				width: width
			});
        }
	}

	}

var DependencyTree = (function () {
    var instance = null;
    function createDependencyTree() {
    	var def_options = {containerId: 'canvasDiv', width: 1650, duration: 750, height: 800, margin: {top: 40, right: 40, bottom: 40, left: 40}, rectW: 200, rectH: 24, node_link_gap: 8, orientationType: '0', extractTreeData: 'false', selectedNodeId: '', id: 0,   //No I18N
    	};//No I18N
        var options = {};//No I18N
        var root = null;
        var tree = null;
        var nodes = null;
        var multiParentData = null;
        var links = null;
        var nodeId=0;
        var diagonal = null;
        var operOccured = {addDep:false,deleteDep:false};

        // Calculate total nodes, max label length
        var totalNodes = 0;
        // var maxLabelLength = 0;
        var taskIconWidth;
        	taskIconWidth = 18;
        // variables for add/remove dependency links
        // var selectedNode = null;
        var mousedown_node = null;
        var mouseover_link = null;
        var selected_node = null;
        var svgGroupXPosition = null;
        var svgGroupYPosition = null;
        var rootNodePosition = null;
        var isViewEditable = false;

        //Arrow Marker
        var markerW = 18, markerH =14;

        //Notifications about the actions done on dependency tree
        var notificationObj = {
        		actionsArr : []
        };

        function getTreeData() {
            return root;
        }

        function getTreeOrientation() {
        	if(isExport){
	            return document.getElementById("orientationType").value;
	        }
	        return options.orientationType;
        }

        var findNode = function (id, nodeType) {
            for (var i=0; i < nodes.length; i++) {
				if(nodeType === "milestone"){
					if (nodes[i].id === id && nodes[i].isMilestone)
					{
						return nodes[i];
					}
					else if(nodes[i].data && nodes[i].isMilestone && nodes[i].data.id == id) {
						return nodes[i].data;
					}
				} else if(nodeType === "root"){ //No I18N
					if (nodenodes[i].id === id && nodes[i].depth === 0)
					{
						return nodes[i];
					}
					else if(nodes[i].depth === 0 && nodes[i].data && nodes[i].data.id == id) {
						return nodes[i].data;
					}
				} else {
	                if(nodes[i].module && nodes[i].module !== "task"){
    				    continue;
    				}else{
                        if (nodes[i].id === id && !nodes[i].isMilestone && nodes[i].depth !== 0){ // TODO Temporary fix as depth property not set.
                            return nodes[i];
    					}
    					else if(nodes[i].data && nodes[i].data.id == id && !nodes[i].isMilestone && nodes[i].depth !== 0) {
    					    return nodes[i].data;
    					}
    				}
				}
            };
		}

        function getNode(id, nodesArr)
        {
        	for (var i=0; i < nodesArr.length; i++) {
                if (nodesArr[i].id === id)
                {
                	return nodesArr[i];
                }
            };
        }

	   function extractRoot(treeData){
        	//multiparent nodes - populate the extra links goes here
        	var extraLinks = [];
        	multiParentData = {extraLinks : extraLinks};

        	var rootNode = nodes[0];
            rootNode.id= jQuery('#itemId').val();

            var rootText = inputValues.parentTitle;	//parent title only taken from inputValues as it is required in pdf
            var module = jQuery('#moduleName').val();
            rootNode.name = rootText;
            rootNode.module = module;

            // Create nodes for each unique source and target.
			var linksArr = treeData.links;
	        for(var i=0,len=linksArr.length;i<len;i++){
                var parentID=linksArr[i].parent_task?linksArr[i].parent_task.id:linksArr[i].parent_task_template.id;
                var childID=linksArr[i].child_task?linksArr[i].child_task.id:linksArr[i].child_task_template.id;
                var parentTitle = linksArr[i].parent_task?linksArr[i].parent_task.title:linksArr[i].parent_task_template.name;
                var childTitle = linksArr[i].child_task?linksArr[i].child_task.title:linksArr[i].child_task_template.name;
                var taskdepID=linksArr[i].id;

                var parent = linksArr[i].parent_task = getNode(parentID, treeData.nodes),
                child = linksArr[i].child_task = getNode(childID, treeData.nodes);
                if(parent){ parent.name=parentTitle;    }

                if(child){  child.name=childTitle;      }

                var isMulti = false;
                if(module == "project" || module == "milestone"){
                	if((parent.milestone && !child.milestone) || (!parent.milestone && child.milestone) || (parent.milestone && child.milestone && parent.milestone.id != child.milestone.id)){
                		isMulti = true;
                	}
                }
                else if(module == "project_template" || module == "milestone_template"){
                	if((parent.milestone_template && !child.milestone_template) || (!parent.milestone_template && child.milestone_template) || (parent.milestone_template && child.milestone_template && parent.milestone_template.id != child.milestone_template.id)){
                		isMulti = true;
                	}
                }
                links.forEach(function(link) {
                	if(child.id == link.target.id)
            		{
            			isMulti = true;
            		}
                });
                if(isMulti == false){
                	if (parent.children) { parent.children.push(child);}
                    else { parent.children = [child]; }
                	nodes.push(child);
                	links.push({"source": parent, "target": child, "id": taskdepID});//No I18N
                }
                else{
                	extraLinks.push({"source": parent, "target": child, "id": taskdepID});//No I18N
                }
			}

            if(module === 'project' || module === 'project_template') {	//If the Dependency view from Tasks tab from ProjectDetails view, then add milestones to the root(Project) and then add tasks
				var mArr = treeData.milestones;
				for(var i=0,len=mArr.length;i<len;i++){
					var node = mArr[i];
            		node.name = mArr[i].title;
            		if (rootNode.children) {
            			rootNode.children.push(node);
            		}
            		else {
            			rootNode.children = [node];
            		}
            		nodes.push(node);
            		links.push({"source": rootNode, "target": node});
				}
				var nData = treeData.nodes;
				for(var i=0,len=nData.length;i<len;i++){
                    var nodeType;
	    			if(!findNode(nData[i].id, "task")){
	    				var node = nData[i];
	        			node.name = (module.endsWith("template"))? nData[i].name : nData[i].title;
					   var parent = (nData[i].milestone)?findNode(nData[i].milestone.id, "milestone"):((nData[i].milestone_template)?findNode(nData[i].milestone_template.id , "milestone"):rootNode); //No I18N
	        			// TODO milestone_template
	        			if (parent.children) {
	        				parent.children.push(node);
	        			}
	        			else {
	        				parent.children = [node];
	        			}
	        			nodes.push(node);
	        			links.push({"source": parent, "target": node});//No I18N
	    			}
				}
            }
            else {
				var nData = treeData.nodes;				//Add the rest of the nodes (node with no dependencies) as virtual nodes under root node(request node)
				for(var i=0,len=nData.length;i<len;i++){
					var nodeType;
					if(nData[i].isMilestone){
						nodeType = "milestone"; //No I18N
					} else if(nData[i].depth === 0){
						nodeType = "root"; //No I18N
					} else {
						nodeType = "task"; //No I18N
					}
	            	if(nData[i].module_link){
	            		if(nData[i].milestone){
	            			if(treeData.other_milestones_title){
	            				nData[i].milestone.title = treeData.other_milestones_title[nData[i].milestone.id];
	            			}
	            		}
	            		else if(nData[i].milestone_template){
	            			if(treeData.other_milestones_title){
	            				nData[i].milestone_template.title = treeData.other_milestones_title[nData[i].milestone_template.id];
	            			}
	            		}
	            		else{
	            			var title = jQuery("#project-holder p").text();
	               		 	title = (title=="")?jQuery("#h1title").text():title;
	            			if(nData[i].project){
	            				nData[i].project.title = title;
            				}
	            			else if(nData[i].project_template){
	            				nData[i].project_template.title = title;
	            			}
	            		}
	            	}
	    			var title=(module.endsWith("template"))? nData[i].name : nData[i].title;
	    			if(!findNode(nData[i].id, nodeType)){
	    				var node = nData[i];
	        			node.name = title;
	        			if (rootNode.children) {
	        				rootNode.children.push(node);
	        			}
	        			else {
	        				rootNode.children = [node];
	        			}
	        			nodes.push(node);
	        			if(node.module_link != true){	//Preventing links from root(Milestone) to task, if that task is under project or under other milestone(From Milestone Module)
	        				links.push({"source": rootNode, "target": node});//No I18N
	        			}
	    			}
				}
            }

			nodes = tree(d3.hierarchy(rootNode)).descendants()
			for(var i =0; i< nodes.length; i++){
				nodes[i].data.x = nodes[i].x;
				nodes[i].data.y = nodes[i].y;
				nodes[i].data.depth= nodes[i].depth;
				nodes[i].data.height = nodes[i].height;
				nodes[i].data.parent = nodes[i].parent;
			}
			rootNode = nodes[0].data;
			rootNode.x = nodes[0].x;
			rootNode.y = nodes[0].y;
        }


        function draw(treeData, useroptions) {
            jQuery.extend(options, def_options, useroptions);
            //extract root node from flat treeData goes here
            if(options.extractTreeData == 'true'){
            	_init();
            	extractRoot(treeData);
            	root = nodes[0];
            }else{
            	root = treeData;
            }

			rootData = root.data? root.data : root;
			rootData.y0 = root.y0;
			rootData.x0 = root.x0;
			nodes = tree(root).descendants().reverse();
			for(var i =0; i< nodes.length; i++){
				nodes[i].data.x = nodes[i].x;
				nodes[i].data.y = nodes[i].y;
				nodes[i].data.depth= nodes[i].depth;
				nodes[i].data.height = nodes[i].height;
				nodes[i].parent = nodes[i].parent;
			}
            _visit();
            if(options.orientationType == '0'){     //horizontal
            	root.y0 = options.height / 2;
            	root.x0 = 0;
        	}else{
        		root.x0 = options.width / 2;
        		root.y0 = 0;
        	}
            _update(root);
            updateSVGLayout(true);
			if(!useroptions.update){
				clearNotificationBuffer();
			}
        }

        //Function to check whether link is present between the given source node id and the target node id
        //Recursive function to check whether the given task node is connected to its parent module node(in 'links')

        function findLink(source, target)
        {
        	var isDependencyExists = false;
        	linkG.selectAll('path.link, path.extralink').filter(function(link, i) { //NO I18N
        		if(link.source === source.data && link.target === target.data){     //checks in both direction
        			isDependencyExists = true;
        		}
        	});
        	return isDependencyExists;

        }

        function mousedown() {
        	svgGroup.classed('active', true);//No I18N
        }

        function mousemove() {
        	if(!mousedown_node) { return; }
        	// update drag line
        	if(options.orientationType == '0'){    //horizontal
    			xVal = mousedown_node.x+svgGroupYPosition;
    			yVal  = mousedown_node.y+svgGroupXPosition;
    			drag_line.attr('d', 'M' + (yVal+options.node_link_gap) + ',' + xVal + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1])
        	}else{
    			xVal = mousedown_node.x+svgGroupXPosition;
    			yVal  = mousedown_node.y+svgGroupYPosition;
        		drag_line.attr('d', 'M' + xVal + ',' + (yVal+options.node_link_gap) + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
        	}
        }

        function mouseup() {
        	if(mousedown_node) {
        		// hide drag line
        		drag_line
        		.classed('hidden', true)//No I18N
        		.style('marker-end', '');//No I18N
        		d3.selectAll("#node_circle").attr("fill", "#888").attr("r", "3"); //NO I18N
        	}
        	svgGroup.classed('active', false);//No I18N
        	// clear mouse event vars
            d3.selectAll('rect.rectbox-selected').attr("class","rectbox");//No I18N
        	resetMouseVars();
        }

        function resetMouseVars() {
        	mousedown_node = null;
        	mouseup_node = null;
        }

        function getPath(d){
        	if(d.source.depth >= d.target.depth){
        		return curve(d);
        	}
        	else if(d.source.x == d.target.x || d.source.y == d.target.y){
				return linkArc(d);
			}else{
				return diagonal(d);
			}
        }

        function linkArc(d) {
        	if(options.orientationType == '0'){    //horizontal
        		var x1 = d.source.y+d.source.rectW+options.node_link_gap;
        		var y1 = (d.source.x+options.rectH / 2);
        		var x3 = d.target.y;
        		var y3 = d.target.x;
        		var x2 = (d.target.y+d.source.y+d.source.rectW)/2;
        		var y2 = (d.source.x-90);
        		return "M" + x1 + "," + y1+"Q "+x2+" "+y2+" "+x3+" "+y3;	//No I18n
        	}else{
        		var x1 = (d.source.x+options.rectW / 2);
        		var y1 = d.source.y+d.source.rectH+options.node_link_gap;
        		var x3 = d.target.x;
        		var y3 = d.target.y;
        		var x2 = (d.source.x-90);
        		var y2 = (d.target.y+d.source.y)/2;
        		return "M" + x1 + "," + y1+"Q "+x2+" "+y2+" "+x3+" "+y3;	//No I18n
        	}
        }

        function curve(d){
        	if(options.orientationType == '0'){
        		var x1 = d.source.y+d.source.rectW+options.node_link_gap;
        		var y1 = d.source.x+(options.rectH/2);
        		var x2 = x1+(d.source.rectW/2);
        		var y2 = (d.source.x > d.target.x)?(y1-d.source.rectW/2):(y1+d.source.rectW/2);
        		var x4 = d.target.y;
        		var y4 = (d.source.x > d.target.x)?(d.target.x+d.target.rectH):(d.target.x);
        		var x3 = x4-(d.target.rectW/2);
        		var y3 = (d.source.x > d.target.x)?(y4+d.target.rectW/2):(y4-d.target.rectW/2);
        		return "M" + x1 + "," + y1 + " C" + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x4 + "," + y4;	//No I18n
        	}else{
        		var x1 = d.source.x+options.rectW/2;
        		var y1 = d.source.y+d.source.rectH+options.node_link_gap;
        		var x2 = (d.source.x > d.target.x)?(x1-d.source.rectW/4):(x1+d.source.rectW/4);
        		var y2 = y1+(d.source.rectW/2);
        		var x4 = (d.source.x > d.target.x)?(d.target.x+d.target.rectW):(d.target.x);
        		var y4 = d.target.y;
        		var x3 = (d.source.x > d.target.x)?(x4+d.target.rectH):(x4-d.target.rectH);
        		var y3 = y4-(d.source.rectW/2);
        		return "M" + x1 + "," + y1 + " C" + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x4 + "," + y4;	//No I18n
        	}
        }

    	function _init() {
            options.id = 0;
            root = null;
            nodeId=0;
            // selectedNode = null;
            try{	//isDependencyEditable may not be defined in script if required permission is not available. Therefore using try catch to avoid error
            	if(isDependencyEditable){
            		isViewEditable = true;
            	}
            	else{
            		isViewEditable = false;
            	}
            }
            catch(e){
            	isViewEditable = false;
            }

            var moduletype = jQuery('#moduleName').attr('value');
            jQuery("#TDHelpDiv ol > li").remove();
            if(isViewEditable){
            	jQuery("#TDHelpDiv ol").append("<li>"+getMessageForKey("sdp.dependencymap.help.li1")+"</li><li>"+getMessageForKey("sdp.dependencymap.help.li2")+"</li>");	//No I18n
            }
            if(moduletype == "milestone"){
            	jQuery("#TDHelpDiv ol").append("<li><svg width='12' height='10'><path d='M 0,2 L10,2 L10,10 Z' fill='#F7941E'></path></svg>"+getMessageForKey("sdp.dependencymap.help.li3")+"</li><li><svg width='12' height='10'><path d='M 0,2 L10,2 L10,10 Z' fill='#92e863'></path></svg>"+getMessageForKey("sdp.dependencymap.help.li4")+"</li>");	//No I18n
            }
            if(moduletype != "request_template" && moduletype != "project_template" && moduletype != "milestone_template" && moduletype != "problem_template"){
            	jQuery("#TDHelpDiv ol").append("<li>"+getMessageForKey("sdp.dependencymap.help.li5")+"</li>");	//No I18n
            }

            //Tree Object construction
            tree = d3.tree();
            tree.size()
            tree = tree.nodeSize([options.rectW+10, options.rectH+10]);

			diagonal = function link(d) {
				var data;
				if(options.orientationType === "0") {
					if(d.source.depth == 0 || d.source.isMilestone){
						data =  "M" + (d.source.y + d.source.rectW / 2) + "," + (d.source.x + d.source.rectH / 2) + "C" + ((d.source.y + d.source.rectW / 2) + d.target.y) / 2 + "," + (d.source.x + d.source.rectH / 2) //NO I18N
						+ " " + ((d.source.y + d.source.rectW / 2) + d.target.y) / 2 + "," + (d.target.x + d.target.rectH / 2)
						+ " " + (d.target.y) + "," + (d.target.x + d.target.rectH / 2);
					} else {
						data =  "M" + (d.source.y + d.source.rectW + options.node_link_gap) + "," + (d.source.x + d.source.rectH / 2) + "C" + ((d.source.y + d.source.rectW + options.node_link_gap) + d.target.y) / 2 + "," + (d.source.x + d.source.rectH / 2) //NO I18N
						+ " " + ((d.source.y + d.source.rectW + options.node_link_gap) + d.target.y) / 2 + "," + (d.target.x + d.target.rectH / 2)
						+ " " + (d.target.y) + "," + (d.target.x + d.target.rectH / 2);
					}
				}
				else {
					if(d.source.depth == 0 || d.source.isMilestone){
						data =  "M" + (d.source.x + d.source.rectW / 2 - (d.source.rectW -options.rectW) / 2) + "," + (d.source.y + d.source.rectH) + "C" + (d.source.x + d.source.rectW / 2 - (d.source.rectW -options.rectW) / 2) + "," + ((d.source.y + d.target.y + d.source.rectH + options.node_link_gap) / 2) //NO I18N
						+ " " + (d.target.x + d.source.rectW / 2 - (d.source.rectW -options.rectW) / 2) + "," +((d.source.y + d.target.y + d.source.rectH + options.node_link_gap) / 2)
						+ " " + (d.target.x + d.source.rectW / 2 - (d.source.rectW -options.rectW) / 2) + "," + (d.target.y)
					} else {
						data =  "M" + (d.source.x + d.source.rectW / 2) + "," + (d.source.y + d.source.rectH + options.node_link_gap) + "C" + (d.source.x + d.source.rectW / 2) + "," + ((d.source.y + d.target.y + d.source.rectH + options.node_link_gap) / 2) //NO I18N
						+ " " + (d.target.x + d.source.rectW / 2) + "," +((d.source.y + d.target.y + d.source.rectH + options.node_link_gap) / 2)
						+ " " + (d.target.x + d.source.rectW / 2) + "," + (d.target.y)
					}
				}

				return data;
			}

            jQuery("#" + options.containerId).empty();
            jQuery("#tooltipDiv").remove();

            // define the baseSvg, attaching a class for styling and the zoomListener
            var baseSvg = d3.select("#" + options.containerId).append("svg")//No I18N
            .attr("width", options.width)//No I18N
            .attr("height","100vh")//No I18N
            .attr("class", "svgborder")//No I18N
            .attr("id", options.containerId + "_svg")//No I18N
            //Hiding the dragging link while click anywhere on the workspace if the dragging was released
            .on('click', mouseup)//No I18N
            .on('mousemove', mousemove)//No I18N

            // Append a group which holds all nodes and which the zoom Listener can act upon.
        	svgGroup = baseSvg.append("g")//No I18N
        		.attr("id", "baseG")//No I18N
        		.attr("transform", "translate(0," + options.margin.top + ")")
        		.on('mousedown', mousedown)//No I18N
        		.on('mousemove', mousemove)//No I18N
        		.on('mouseup', mouseup)//No I18N
        		.on("mouseout", function(){//No I18N
        			//hiding the tooltip div when the cursor moves out of SVG space
        			return tooltipDiv.style("visibility", "hidden");//No I18N
				});

				svgGroup.append("svg:defs").append("svg:path")//No I18N
            .attr("id","otherModuleTask")
            .attr("d","M 0,0 L10,0 L10,8 Z");

				svgGroup.append("svg:defs").append("svg:marker")//No I18N
    	    .attr('id',"triangle")
    	    .attr('viewBox',"0 0 10 10")
    	    .attr('refX',10)
    	    .attr('refY',6)
    	    .attr('markerWidth',markerW)
    	    .attr('markerHeight',markerH)
    	    .attr('orient','auto')
            .append("path")//No I18N
            	.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            	.attr("stroke-opacity", "0");


					svgGroup.append("svg:defs").append("svg:marker")//No I18N
    	    .attr('id',"triangle-blue")
    	    .attr('viewBox',"0 0 15 15")
    	    .attr('refX',10)
    	    .attr('refY',6)
    	    .attr('markerWidth',markerW)
    	    .attr('markerHeight',markerH)
    	    .attr('orient','auto')
            .append("path")//No I18N
            	.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            	.attr("stroke-opacity", "0");

				var defs = svgGroup.append("defs"); //No I18N

            var imagePattern = defs.append("pattern")	//No I18n
            	.attr("id","image_link_pattern")
            	.attr("width","100%")
            	.attr("height","100%")
            	.attr("patternContentUnits", "objectBoundingBox")
            	.attr("preserveAspectRatio", "xMidYMid slice")
            	.attr("viewBox", "0 0 1 1");

            imagePattern.append("image")	//No I18n
            	.attr("xlink:href","/images/map-link-icon.svg")
            	.attr("width","1")
            	.attr("height","1")
            	.attr("preserveAspectRatio", "xMidYMid slice");

            tdDelete = d3.select("body") //No I18N
                .selectAll("#tddelete") //NO I18N
                .style("display","none"); //No I18N

        	linkG = svgGroup.append("g")//No I18N
        	.attr("id", "linkG");//No I18N

            nodeG = svgGroup.append("g")//No I18N
        		.attr("id", "nodeG");

            // line displayed when dragging new nodes
            //temp connector added to SVG itself in order to freely move around
            //If we add the same under svgGroup it wont move freely since svgGroup is a virtual group and it will get x and y coordinates only when there is a object found
            drag_line = baseSvg.append('svg:path')//No I18N
              .attr('class', 'link dragline hidden')
              .attr("stroke", 'none')
              .attr('d', 'M0,0L0,0');

        	//Div for tooltip
        	tooltipDiv = d3.select("#tree-container")//No I18N
        		.append("div")//No I18N
        			.attr("id", "tooltipDiv")
        			.attr("class", "dyn-tooltip")
        			.style("opacity", 0)//No I18N
        			.style("z-index", 100);	//No I18N

            //find char width
            var charWidth = $task_dep.getCharWidth("Arials", "13px");//No I18N
            charCountUsedByImageIcon = Math.round(taskIconWidth/charWidth);//here taskIconWidth is the task icon image width

            root = {},
			node_root = d3.hierarchy(root);
			nodes = [{}];
			links = node_root.links();

        }

    	function _visit(){
            // Call visit function to establish maxLabelLength
            visit(root, function(d) {
            	totalNodes++;
            	// maxLabelLength = charCountOfRow;

            }, function(d) {
            	return d.children && d.children.length > 0 ? d.children : null;
            });
    	}

    	function computeTreeSize(){
    		var maxTreeChildrenHeight = {},
    		maxTreeHeight = 0,
    		maxTreeDepth = 0,
    		minSvgWidth,
    		minSvgHeight;

			// Compute the max tree depth(node which is the lowest leaf)
    		nodes.forEach(function(d) {
    			if(d.depth>maxTreeDepth){
    				maxTreeDepth = d.depth;
    			}

    			if(!maxTreeChildrenHeight[d.depth]){
    				maxTreeChildrenHeight[d.depth] = 0;
    			}

    			maxTreeChildrenHeight[d.depth] = maxTreeChildrenHeight[d.depth]+1;
    		});

    		// Compute maximum number of vertical at a level
    		maxTreeHeight = d3.max(d3.values(maxTreeChildrenHeight));
			minSvgWidth = (maxTreeDepth+1)*150;
			minSvgHeight = (maxTreeHeight+1)*100;
    		return {
	    			width: minSvgWidth,
	    			height: minSvgHeight
	    	};
    	}

    	function _update(source) {
            var moduletype = jQuery('#moduleName').attr('value');
    		rootNodePosition = null;
    		//Resize the tree goes here - specific to the layout
    		var fixedLevelWidth = 180;
    		if(options.orientationType == '1'){
    			fixedLevelWidth = 80;
			}
    		dimentions = computeTreeSize();
    		if(options.orientationType == '1'){
        		tree.nodeSize([options.rectW+10, options.rectH+10])
                tree.separation(function separation(a, b) {
                	return (a.parent == b.parent ? 1.3 : 1) ;
                });
    		}
    		else {
        		tree = tree.size([dimentions.height, dimentions.width]);
        	}

			// Compute the new tree layout.
			rootData = root.data? root.data: root;
			if(root.constructor.name === "Uo") { // TODO
				rootData = tree(root);
			} else {
				rootData = tree(d3.hierarchy(root));
			}
			nodes = rootData.descendants().reverse();
			for(var i =0; i< nodes.length; i++){
				nodes[i].data.x = nodes[i].x;
				nodes[i].data.y = nodes[i].y;
				nodes[i].data.depth= nodes[i].depth;
				nodes[i].data.height = nodes[i].height;
				nodes[i].parent = nodes[i].parent;
			}

    		// Set widths between levels based on maxLabelLength.
    		nodes.forEach(function(d) {
				   d.y = d.depth * (fixedLevelWidth+130);
				   d.data.y = d.y;
    		});

    		//Find the new positions of the source and target node of the extra links goes here - multiparent nodes
    		multiParentData.extraLinks.forEach(function(e) {
    			if(e.source){
					var nodeType;
					if(e.source.isMilestone){
						nodeType = "milestone"; //No I18N
					} else if(e.source.depth === 0){
						nodeType = "root"; //No I18N
					} else {
						nodeType = "task"; //No I18N
					}
    				e.source = findNode(e.source.id, nodeType);
    			}
    			if(e.target){
					var nodeType;
					if(e.target.isMilestone){
						nodeType = "milestone"; //No I18N
					} else if(e.target.depth === 0){
						nodeType = "root"; //No I18N
					} else {
						nodeType = "task"; //No I18N
					}
    				e.target = findNode(e.target.id, nodeType);
    			}
    		});

    		// Update the nodes
    		node = nodeG.selectAll("#svgGroup") //NO I18N
    		.data(nodes, function(d) {
    			return d.id || (d.id = ++nodeId);
    		});

			// Enter any new nodes at the parent's previous position.
			var nodeGroup;
			if(node.data().length === 0){
				nodeGroup = node.enter();
			} else {
				nodeGroup = node;
			}
    		var nodeEnter = nodeGroup.append("g")//No I18N
    		.attr("id", "svgGroup")
    		.attr("class", function(d){
    			if(d.data.isMilestone){
    				return "node milestone";	//No I18n
    			}
    			else if(d.depth == 0){
    				return "node rootNode";	//No I18n
    			}
    			else{
    				return "node";	//No I18n
    			}
    		})
    		.attr("transform", function(d) {
    			if(options.orientationType == '0'){  //horizontal
    				return "translate(" + (source.y0) + "," + (source.x0) + ")";//No I18N
    			}
    			else{
    				return "translate(" + (source.x0) + "," + (source.y0)+ ")";//No I18N
    			}
    		})

    		.on("mouseover", function(d) {//No I18N
    			var highlightedNodeIds = new Array();
				var rootSvg = jQuery(this).find(".svg-icon").html();
    			jQuery("#tddelete").hide();//Node delete icon need not to be shown on mouse over of a node
    			//Highlighting task dependencies of the selected node [both depends on and dependent on]
    			linkG.selectAll('path.link, path.extralink').filter(function(link, i) { //NO I18N
    				if(link.source ==  d.data){
    					if(!d.data.isMilestone && d.depth !== 0){
    						highlightedNodeIds.push(link.target.id);
    					}
    					return true;
    				}
    				else if(link.target == d.data){
    					if(!d.data.isMilestone && d.depth !== 0){
    						highlightedNodeIds.push(link.source.id);
    					}
    					return true;
    				}
    				return false;
                }).each(function(dLink, iLink) {
                	if(dLink.source.depth !== 0 && dLink.source.isMilestone != true){
                		d3.select(this).style("stroke", "#00c5ff").style("stroke-width","2");//No I18N
                        d3.select(this).attr("marker-end","url(#triangle-blue)");//No I18N
                	}
    	        });

				if(isViewEditable){
	    			if(mousedown_node == null && !d.isDummy){
	    				d3.select(this).select("#node_circle").attr("fill", "url(#image_link_pattern)").attr("r", "8"); //No I18N
	    			}
				}

                //Highlighting rectangle color
                nodeG.selectAll('rect.rectbox').filter(function(dnode) { //NO I18N
    				return dnode ==  d || highlightedNodeIds.indexOf(dnode.data.id)>=0;
                }).each(function(dLink, iLink) {
                       d3.select(this).style("stroke","#0288d1"); //No I18N
                });

                 nodeG.selectAll('rect.rectFirst').filter(function(dnode) { //NO I18N
    				return dnode ==  d;
                }).each(function(dLink, iLink) {
                	if(dLink.module === 'project' || dLink.module === 'project_template'){
                		d3.select(this).style("stroke","#92B254"); //No I18N
                	}
                	else {
                		d3.select(this).style("stroke","#FB7211"); //No I18N
                	}
                });
                if(jQuery('#moduleName').attr('value').startsWith("cm_") && d.depth == 0){
                    return;
                }
    			//Showing tooltip about task/module on mouse over of a node goes here
    				var toolTipText = getToolTip(d,rootSvg);
        			tooltipDiv.style("visibility", "visible");//No I18N
        			tooltipDiv.transition()
        				.duration(500)
        				.style("opacity", 0);//No I18N
        			tooltipDiv.transition()
        				.duration(200)
        				.style("opacity", .9);//No I18N
        			tooltipDiv.html(toolTipText)
        					.style("left", (d3.event.pageX) + "px")//No I18N
        					.style("top", (d3.event.pageY) + "px");//No I18N

			})
			.on("mousemove", function(d){//No I18N
				if(mousedown_node == d){    //Hiding tooltipDiv for the drag started node since it hides the drag start point
					return tooltipDiv.style("visibility","hidden");//No I18N
				}
				var divXPosition = d3.event.pageX + 10;
				var divYPosition = d3.event.pageY + 15;
				//height and width required to show the tooltip box
				var tooltipDivWidth = jQuery('#tooltipDiv').width();
				var tooltipDivHeight = jQuery('#tooltipDiv').height();
				//Tooltip box direction should be adjusted to left side of node if there is no enough space on the right side and vice versa
				if(divXPosition + tooltipDivWidth > jQuery('#canvasDiv').width()){
					divXPosition = d3.event.pageX - tooltipDivWidth;
				}
				if(divYPosition + tooltipDivHeight > jQuery('#canvasDiv').height()){
					divYPosition = d3.event.pageY - tooltipDivHeight - 15;
				}
				//Relocating tooltip box on mouse move
				return tooltipDiv.style("top",(divYPosition)+"px").style("left",(divXPosition)+"px");//No I18N
    		})
    		.on("mouseout", function(){//No I18N
				linkG.selectAll('path.link, path.extralink').filter(function(link, i) { //NO I18N
					if(link.source != root){
						d3.select(this).style("stroke", "#888").style("stroke-width","1");//No I18N
                        d3.select(this).attr("marker-end","url(#triangle)");//No I18N
					}
                });
                //Deselecting rectangle stroke to gray color
                nodeG.selectAll('rect.rectbox, rect.rectFirst').filter(function(dnode) { //NO I18N
                    if(dnode.source != root){d3.select(this).style("stroke", "#CCC")}
                });
                if(mousedown_node == null){
                	d3.select(this).select("#node_circle").attr("fill", "#888").attr("r", "3"); //No I18N
                }
			})
			.on('mousedown', function(d) {//No I18N
				if(d3.event.ctrlKey) { return; }
				// select node
				if(d.data.isMilestone){
					mousedown_node = d;
					return;
				}
				if(d == root || d.isDummy) { return; }

				if(!isViewEditable){
					mousedown_node = d;
					return;
				}

				mousedown_node = d;
				if(mousedown_node === selected_node) { selected_node = null; }
				else { selected_node = mousedown_node; }
				d3.select(this).select('rect.rectbox').attr("class", "rectbox-selected");//No I18N

				// reposition drag line
				if(options.orientationType == '0'){     //horizontal
	    			xVal = mousedown_node.x+svgGroupYPosition;
	    			yVal  = mousedown_node.y+svgGroupXPosition;
	    			drag_line.attr('d', 'M' + yVal + ',' + xVal + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

	        	}else{
	    			xVal = mousedown_node.x+svgGroupXPosition;
	    			yVal  = mousedown_node.y+svgGroupYPosition;
	        		drag_line.attr('d', 'M' + xVal + ',' + yVal + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	        	}

				drag_line
				.attr('marker-end', function(d) { return "url(#triangle)";})
				.classed('hidden', false)//No I18N
				.attr('d', function(d) {
					//setting initial drag position for the dragline
					if(options.orientationType == '0'){
		    			xVal = mousedown_node.x+svgGroupYPosition;
		    			yVal  = mousedown_node.y+svgGroupXPosition;
		    			return ('M' + yVal + ',' + xVal + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);//No I18N
		        	}else{
		    			xVal = mousedown_node.x+svgGroupXPosition;
		    			yVal  = mousedown_node.y+svgGroupYPosition;
		        		return ('d', 'M' + xVal + ',' + yVal + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);//No I18N
		        	}
				});

				if(!d.isDummy){
					d3.select(this).select("#node_circle").attr("fill", "url(#image_link_pattern)").attr("r", "8"); //No I18N
				}

			})
			.on('mouseup', function(d) {//No I18N
				if(mousedown_node == d){
					return;
				}

				if(!mousedown_node || mousedown_node.isMilestone) { return; }

				if(!isViewEditable){return;}

				// needed by FF
				drag_line
				.classed('hidden', true)//No I18N
				.attr('marker-end', '');

				d3.selectAll("#node_circle").attr("fill", "#888").attr("r", "3"); //NO I18N

				// check for drag-to-self
				mouseup_node = d;
				if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

				var source, target;
				source = mousedown_node;
				target = mouseup_node;

				var tempLink=null;
				if(findLink(source, target) == false){
					//Add the link either to links or to extraLinks goes here
		        	//Note : if target mode is a multi parent node,  add the link under extraLinks
					tempLink = {source: source, target: target};
					addLink(tempLink);
				}
				resetMouseVars();
			});
    		nodeEnter.append("rect")//No I18N
    		.attr("id", "rectNode")
            .attr("class",function (d) {//No I18N
    			if(d.depth === 0 || d.data.isMilestone){
    				return "rectFirst";//No I18N

    			}else{
    				return  "rectbox";//No I18N
    			}
            })
    		.attr("width", function(d){
    			if(d.depth == 0){
    				d.rectW = options.rectW+50;
    				return d.rectW;
    			}
    			else if(d.data.isMilestone){
    				d.rectW = options.rectW+30;
    				return d.rectW;
    			}
    			else{
    				d.rectW = options.rectW;
    				return d.rectW;
    			}
    		})
    		.attr("height", function(d){
    			if(d.depth == 0){
    				d.rectH = options.rectH+4;
    				return d.rectH;
    			}
    			else if(d.data.isMilestone){
    				d.rectH = options.rectH+2;
    				return d.rectH;
    			}
    			else{
    				d.rectH = options.rectH;
    				d.nodeLinkGap = options.node_link_gap;
    				return d.rectH;
    			}
    		})
    		.attr("stroke", "#DBDBDB")
    		.attr("stroke-width", 0.7)
    		.attr("rx",4)
    		.attr("ry",4)
    		.attr("x", function(d){
				return (options.rectW / 2) - (d3.select(this).attr('width') / 2);
    		})
    		.attr("y", function(d){
    			return (options.rectH / 2) - (d3.select(this).attr('height') / 2);
    		})
    		.attr("fill", function (d) {//No I18N
    				return "#FFFFFF";	//No I18n
    		})

			for (var i=0; i< nodes.length; i++){
				nodes[i].data.rectH = nodes[i].rectH;
				nodes[i].data.rectW = nodes[i].rectW;
				nodes[i].data.nodeLinkGap = nodes[i].nodeLinkGap;

			}

    		var scaleFunc = function(value,width){
				var scale = d3.scaleLinear()
	    				.domain([0, 100])
	    				.range([0, width]);
				return scale(value);
    		};

    		nodeEnter.filter(function(d){
    			if(d.data.depth == 0 || !d.data.isMilestone){
    				return true;
    			}
    		})
    		.append("rect")	//No I18n
    		.attr("id", "perComRect")
    		.attr("width", function(d){
    			if(d.data.percentage_completion){
    				if(d.data.percentage_completion != null){
    	    			return scaleFunc(d.data.percentage_completion, d.rectW)-2;
    				}
    			}
    			return "0";
    		})
    		.attr("height", function(d){
    			return d.rectH-2;
    		})
    		.attr("fill", "#D1ECA7")
    		.attr("stroke", "#D1ECA7")	//No I18n
    		.attr("rx",4)
    		.attr("ry",4)
    		.attr("x", "1")
    		.attr("y", "1");

    		nodeEnter.filter(function(d){
    			if(d.depth !== 0 && !d.data.isMilestone){
    				if(!isViewEditable){	//In PDF or in view only mode, removing node circles for nodes having no children
    					if(d.children){
    						return true;
    					}
    					else{
							var mpDataLinks = multiParentData.extraLinks
							for(var i=0,len = mpDataLinks.length;i<len;i++){
								if(mpDataLinks[i].source.id == d.data.id){
    								    return true;
    							}
							}
    					}
    				}
    				else{
    					return true;
    				}
    			}
    		})
    		.append("svg:circle")	//No I18n
    		.attr("id", "node_circle")
            .attr("cx",function(d){
            	if(options.orientationType == "0"){
            		return d.rectW+d.nodeLinkGap;
            	}
            	else{
            		return d.rectW/2;
            	}
            })
            .attr("cy",function(d){
            	if(options.orientationType == "0"){
            		return d.rectH/2;
            	}
            	else{
            		return d.rectH+d.nodeLinkGap;
            	}
            })
            .attr("r", "3")
            .attr("fill", "#888");

    		//<--For representing other milestone tasks/project tasks from Milestone task dependency view
    		nodeEnter.filter(function(d){
    			if(d.module_link && !d.isDummy){
    				return true;
    			}
    		})
    		.append("use")	//No I18n
    		.attr("x",function(d){ return d.rectW-12; })
    		.attr("y","2")
    		.attr("xlink:href","#otherModuleTask")
    		.attr("fill",function(d){
    			if(d.milestone || d.milestone_template){
    				return "#F7941E";	//No I18n
    			}
    			else if(d.project || d.project_template){
    				return "#92e863";	//No I18n
    			}
    		});
    		//-->
        	var milestoneIcon = '<svg  x="0px" y="0px" width="14.8px" height="20.3px" viewBox="0 0 14.8 20.3" style="enable-background:new 0 0 14.8 20.3;"><path style="fill:#F2F2F2;" d="M7.2,0h0.3c4,0,7.2,3.2,7.2,7.2l0,0v13.1l0,0H0l0,0V7.2C0,3.2,3.2,0,7.2,0C7.2,0,7.2,0,7.2,0z"/><g style="opacity:0.2;"><path d="M7.5,0.5c3.7,0,6.7,3,6.7,6.7v12.6H0.5V7.2c0-3.7,3-6.7,6.7-6.7H7.5 M7.5,0H7.2C3.2,0,0,3.2,0,7.2v13.1h14.8V7.2C14.8,3.2,11.5,0,7.5,0z"/></g><rect y="14.8" style="fill:#FFA017;" width="14.8" height="5.5"/><g style="opacity:0.1;"><path d="M14.3,15.3v4.5H0.5v-4.5H14.3 M14.8,14.8H0v5.5h14.8V14.8z"/></g></svg>'; //No I18N
			var commonTaskIcon = '<svg width="22" height="22" viewBox="0 -1 16.6 15.2" style="enable-background:new 0 0 20 20;"><g><path style="fill:#FFFFFF;stroke:#B3BDC4;stroke-width:0.75;stroke-miterlimit:10" d="M12.5,7.2V2.3c0-0.9-0.7-1.5-1.6-1.6c0,0,0,0,0,0H2.1c-0.9,0-1.6,0.7-1.6,1.5c0,0,0,0,0,0v10.9c0,0.9,0.7,1.6,1.6,1.6H11"/><polygon style="fill:#FFFFFF;" points="3,4.3 3.1,4.1 9.7,4.2 9.6,4.3"/><path style="fill:#178BFF" d="M9.7,3.7H3c-0.3,0-0.5,0.2-0.5,0.5c0,0,0,0,0,0v0.2c0,0.3,0.2,0.5,0.5,0.5c0,0,0,0,0,0h6.6c0.3,0,0.5-0.2,0.5-0.5c0,0,0,0,0,0V4.2C10.1,3.9,9.9,3.7,9.7,3.7z"/><polygon style="fill:#FFFFFF;" points="3,10.5 3.1,10.4 9.7,10.4 9.6,10.5"/><path style="fill:#178BFF" d="M9.7,9.9H3c-0.3,0-0.5,0.2-0.5,0.5v0.2C2.6,10.8,2.8,11,3,11h6.6c0.3,0,0.5-0.2,0.5-0.5v-0.2C10.1,10.1,9.9,9.9,9.7,9.9z"/><polygon style="fill:#FFFFFF;" points="3,7.4 3.1,7.2 9.7,7.3 9.6,7.4"/><path style="fill:#178BFF" d="M9.7,6.8H3C2.8,6.8,2.6,7,2.6,7.2v0.2c0,0.3,0.2,0.5,0.5,0.5h6.6c0.3,0,0.5-0.2,0.5-0.5V7.2C10.1,7,9.9,6.8,9.7,6.8z"/><path style="fill:#178BFF" d="M11.9,14.7c-2.3,0-4.2-1.9-4.1-4.2c0-2.3,1.9-4.2,4.2-4.1c2.3,0,4.1,1.9,4.1,4.2C16.1,12.8,14.2,14.7,11.9,14.7C11.9,14.7,11.9,14.7,11.9,14.7z"/><path style="fill:#FFFFFF;" d="M11.9,6.9c2,0,3.6,1.6,3.6,3.7c0,2-1.6,3.6-3.7,3.6c-2,0-3.6-1.6-3.6-3.6C8.2,8.5,9.9,6.9,11.9,6.9C11.9,6.9,11.9,6.9,11.9,6.9 M11.9,5.9c-2.6,0-4.7,2.1-4.7,4.6s2.1,4.7,4.7,4.7s4.6-2.1,4.6-4.7l0,0C16.6,8,14.5,5.9,11.9,5.9z"/><path style="fill:#FFFFFF;" d="M13.1,9.3l-1.6,1.6l-0.7-0.7c-0.2-0.2-0.5-0.2-0.6,0s-0.2,0.5,0,0.6l1,1l0,0l0,0c0.2,0.2,0.5,0.2,0.6,0l1.9-1.9c0.2-0.2,0.2-0.5,0-0.6C13.5,9.1,13.3,9.1,13.1,9.3z"/></g></svg>';
            nodeEnter.append("g") //No I18N
			.attr("transform", function(d){
				if(d.data.isMilestone){
					return "translate(-10,1)";
				}
				else{
					return "translate(5,0)"
				}
			})
			.attr("class", "svg-icon")
            .attr("width", function(d){
            	if(d.data.isMilestone){
            		d.iconWidth = taskIconWidth+2;
            		return d.iconWidth;
            	}
            	else if(d == root){
            		d.iconWidth = taskIconWidth+4;
            		return d.iconWidth;
            	}
            	else{
            		d.iconWidth = taskIconWidth;
            		return d.iconWidth;
            	}
            })
            .attr("height", function(d){
            	if(d.data.isMilestone){
            		d.iconHeight = taskIconWidth+2;
            		return d.iconHeight;
            	}
            	else if(d == root){
            		d.iconHeight = taskIconWidth+4;
            		return d.iconHeight;
            	}
            	else{
            		d.iconHeight = taskIconWidth;
            		return d.iconHeight;
            	}
            }).html(function(d){
				if(d.data.isMilestone){
            		return milestoneIcon;
            	}
            	else {
            		return commonTaskIcon;
            	}
			});
			if(nodeEnter._groups.last){
				var lastEle = jQuery(nodeEnter._groups.last().last());
			}
			else{
				let nodes = nodeEnter._groups;
				var lastEle = nodes[nodes.length - 1]
				lastEle = jQuery(lastEle[lastEle.length - 1]);
			}
			lastEle.find("image").remove();
			lastEle.find(".svg-icon").remove();
			if(moduletype === "request" || moduletype === "request_template"){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -1 24 24"><g><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;" d="M20,7.77a2.06,2.06,0,0,1-2.91-2.91L14.67,2.44,3,14.07,5.46,16.5a2.05,2.05,0,1,1,2.91,2.9l2.42,2.43L22.43,10.19Z"></path><line class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;" x1="11.1" y1="5.66" x2="19.21" y2="13.76"></line></g></svg></g>'; //No I18N
				if(jQuery('#isServiceRequest').val() == 'true'){
					var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -2 25 25"><g id="Group_195"><path id="Path_80" style="fill: none;stroke: #ff8800;stroke-linecap: round;stroke-miterlimit: 10;stroke-width: 1.2px;" data-name="Path 80" d="M1.852,1.75h2.1l2.7,15h12.8a1.12,1.12,0,0,0,1.2-1l2.3-8H6.852"/><g><circle id="Ellipse_18" data-name="Ellipse 18" style="fill: none;stroke: #ff8800;stroke-linecap: round;stroke-miterlimit: 10;stroke-width: 1.2px;" cx="8.352" cy="21.65" r="1.6"/><circle id="Ellipse_19" data-name="Ellipse 19" style="fill: none;stroke: #ff8800;stroke-linecap: round;stroke-miterlimit: 10;stroke-width: 1.2px;" cx="18.352" cy="21.65" r="1.6"/></g></g></svg></g>'; //No I18N
				}
			}
			else if(moduletype === "project" || moduletype === 'project_template'){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -1 24 24"><g><rect class="cls-1" style=" fill: none;stroke: #ff8800; stroke-miterlimit: 10;" x="6.07" y="13.38"width="4.69" height="6.26" transform="translate(-9.2 10.76) rotate(-44.91)"></rect><path class="cls-1" style=" fill: none;stroke: #ff8800; stroke-miterlimit: 10;"d="M20.12,9.23l-3.41,3.41L12.28,8.22l3.41-3.41a3,3,0,0,1,4.24,0l.19.18A3,3,0,0,1,20.12,9.23Z"></path><path class="cls-1" style=" fill: none;stroke: #ff8800; stroke-miterlimit: 10;"d="M21.15,17.78,17.43,21.5a.5.5,0,0,1-.71,0L3.42,8.2a.51.51,0,0,1,0-.71L7.14,3.78a.48.48,0,0,1,.7,0l4.44,4.44,4.43,4.42,4.44,4.44A.5.5,0,0,1,21.15,17.78Z"></path><rect class="cls-2" style=" fill: #ff8800;stroke: #ff8800; stroke-miterlimit: 10;" x="6.45" y="6.8"width="2.09" height="2.09" rx="1" transform="translate(-3.35 7.6) rotate(-45)"></rect><line class="cls-2" style=" fill: #ff8800;stroke: #ff8800; stroke-miterlimit: 10;" x1="16.4" y1="16.75"x2="18.52" y2="14.63"></line><line class="cls-2" style=" fill: #ff8800;stroke: #ff8800; stroke-miterlimit: 10;" x1="13.45" y1="13.81"x2="15.57" y2="11.69"></line><line class="cls-2" style=" fill: #ff8800;stroke: #ff8800; stroke-miterlimit: 10;" x1="10.5" y1="10.86"x2="12.62" y2="8.74"></line><polygon class="cls-1" style=" fill: none;stroke: #ff8800; stroke-miterlimit: 10;"points="8.96 20.38 4.54 15.96 3.81 16.69 3.81 21.12 8.23 21.12 8.96 20.38"></polygon></g></svg></g>'; //No I18N
			}
			else if(moduletype === "milestone" || moduletype === 'milestone_template'){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg width="24" height="24" viewBox="-4 -3 24 24" style="enable-background:new 0 0 14.8 20.3;"><path style="fill:#F2F2F2;" d="M7.2,0h0.3c4,0,7.2,3.2,7.2,7.2l0,0v13.1l0,0H0l0,0V7.2C0,3.2,3.2,0,7.2,0C7.2,0,7.2,0,7.2,0z"/><g style="opacity:0.2;"><path d="M7.5,0.5c3.7,0,6.7,3,6.7,6.7v12.6H0.5V7.2c0-3.7,3-6.7,6.7-6.7H7.5 M7.5,0H7.2C3.2,0,0,3.2,0,7.2v13.1h14.8V7.2C14.8,3.2,11.5,0,7.5,0z"/></g><rect y="14.8" style="fill:#FFA017;" width="14.8" height="5.5"/><g style="opacity:0.1;"><path d="M14.3,15.3v4.5H0.5v-4.5H14.3 M14.8,14.8H0v5.5h14.8V14.8z"/></g></svg></g>'; //No I18N

			}
			else if(moduletype === "change"){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -1 24 24"><g><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;stroke-width: 1.1px;"d="M2,8.5H5.84a5,5,0,0,1,5,5h0a5,5,0,0,1-5,5H2"></path><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;stroke-width: 1.1px;"d="M20,8.5H16.12a5,5,0,0,0-5,5h0a5,5,0,0,0,5,5H20"></path><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;stroke-width: 1.1px;"points="18.55 6.18 20.8 8.42 18.55 10.67"></polyline><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;stroke-width: 1.1px;"points="18.55 16.18 20.8 18.42 18.55 20.67"></polyline></g></svg></g>'; //No I18N
			}
			else if(moduletype === "problem" || moduletype === "problem_template"){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -1 24 24"><g><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"points="2.51 15.02 5.14 12.88 7.27 13.52"></polyline><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"points="14.68 17.8 16.3 19.33 15.76 22.68"></polyline><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"points="8.28 10.47 6.31 9.34 6.47 6.64"></polyline><polyline class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"points="16.82 15.4 18.79 16.54 21.04 15.05"></polyline><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"d="M17.7,13.88l-.88,1.52-.18.31a7,7,0,0,1-2,2.09C13,19,10.79,19.65,9.2,18.73S7.05,15.6,7.27,13.52a6.87,6.87,0,0,1,.83-2.74l.18-.31L9.16,9Z"></path><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"d="M12.12,6.74a4,4,0,0,1,.19-4"></path><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"d="M21.51,8a3.94,3.94,0,0,1-3.38,2.17"></path><path class="cls-1" style="fill: none;stroke: #ff8800;stroke-miterlimit: 10;"d="M16.27,6.49a4.21,4.21,0,0,0-4.15.25,5.29,5.29,0,0,0-2,1.9l-.35.61,7.32,4.23.35-.61a5.33,5.33,0,0,0,.66-2.66A4.19,4.19,0,0,0,16.27,6.49Z"></path></g></svg></g>'; //No I18N
			}
			else if(moduletype === "release"){
				var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="header-menu-icons" width="24" height="24" viewBox="0 -1 24 24"> <g><path fill="#ff8800" d="M21.989,3.364a1.088,1.088,0,0,0-.322-.808,1.134,1.134,0,0,0-.806-.32c-5.1.195-8.841,1.686-11.737,4.685l-2.564-1L.989,11.49l5.032,1.677-.661,2.1,3.6,3.6,2.1-.661,1.678,5.032,5.571-5.572-1-2.564C20.3,12.2,21.794,8.463,21.989,3.364ZM13.2,21.246l-1.461-4.384-2.484.782L6.581,14.966l.782-2.484L2.979,11.02,6.824,7.176,9.413,8.187l.249-.27c2.724-2.954,6.3-4.418,11.253-4.594-.189,4.944-1.653,8.516-4.607,11.239l-.27.249,1.011,2.59Z"></path><path fill="#ff8800" d="M15.965,8.292a2.611,2.611,0,1,0,0,3.694A2.615,2.615,0,0,0,15.965,8.292Zm-.76,2.934a1.577,1.577,0,0,1-2.175,0,1.538,1.538,0,1,1,2.175,0Z"></path><path fill="#ff8800" d="M4.966,16.132a6.484,6.484,0,0,0-1.772,3.339l-.6,2.188,2.188-.6A6.48,6.48,0,0,0,8.124,19.29,3.158,3.158,0,0,1,4.966,16.132Z"></path></g></svg></g>'; //No I18N
			}else if(moduletype.startsWith("cm_")){//NO I18N
                var svgContent = '<g transform="translate(-20,-2)" class="svg-icon"><svg class="default-fill m2 ml3" height="20" width="20" viewBox=" 0 -4 26 26"><g><g><path d="M22.3,21H1.7C1.3,21,1,20.7,1,20.3V5.7C1,5.3,1.3,5,1.7,5h20.6C22.7,5,23,5.3,23,5.7v14.6C23,20.7,22.7,21,22.3,21z M2,20    h20V6H2V20z"></path></g><g><path d="M7.2,12L7.2,12C5.9,12,5,11.1,5,10V9.9c0-1.2,0.9-2.1,2.1-2.1s2.1,0.9,2.1,2.1C9.2,10.9,8.4,12,7.2,12z M7.1,8.8    C6.5,8.8,6,9.3,6,9.9V10c0,0.5,0.5,1,1.1,1h0.1c0.6,0,1-0.6,1-1.1C8.2,9.3,7.7,8.8,7.1,8.8z"></path></g><g><path d="M1.5,21c-0.1,0-0.2,0-0.3-0.1c-0.2-0.2-0.2-0.5,0-0.7l5-5.5c0.3-0.3,0.7-0.3,1-0.1l2,1.4l4.1-4.2c0.3-0.3,0.7-0.3,1,0    l8.5,8.4c0.2,0.2,0.2,0.5,0,0.7s-0.5,0.2-0.7,0l-8.3-8.2l-4.1,4.2c-0.3,0.3-0.7,0.3-1,0l-2.1-1.4l-4.8,5.3C1.8,20.9,1.6,21,1.5,21    z M13.6,12.5L13.6,12.5L13.6,12.5z"></path></g></g></svg></g>';//NO I18N
            }
			document.getElementsByClassName("rootNode")[0].insertAdjacentHTML("beforeend",svgContent); //No I18N
   		 nodeEnter.append("text")//No I18N
			.attr("id", "descText")	 //No I18n
			.attr("text-anchor", "start")
			.attr("data-id", function(d){
				return d.data.id
			})
			.attr("x", function(d) {
				if(d.data.isMilestone){
					return d.iconWidth+10+(options.rectW/2)-(d.rectW/2);
				}
				else{
					return d.iconWidth+15+(options.rectW/2)-(d.rectW/2);
				}
			})
   		.attr("y", function(d){
			   if(d.rectH == "28"){
				   return d.rectH-10+(options.rectH/2)-(d.rectH/2);
			   }
			   else{
   			return d.rectH-8+(options.rectH/2)-(d.rectH/2);
			   }
   		})
   		.style("fill", function(d){//No I18N
    			if(d.isDummy){
    				return "#aaaaaa";//No I18N
    			}
    			else{
    				return "";
    			}
    		})
   		.text(function(d) {
   			return d.data.name;
   		}).each(wrapText);

    		// Change the circle fill depending on whether it has children and is collapsed
    		node.select("rect.rectbox")//No I18N
    		.style("stroke",  "#DBDBDB"); //No I18N

    		node.select("rect.rectFirst")	//No I18n
    		.style("stroke",  "#DBDBDB"); //No I18N

            //First & Last Element Selection - Common Method
            d3.selection.prototype.first = function() {
				return d3.select(
					this.nodes()[0]
				);
			};
			d3.selection.prototype.last = function() {
				return d3.select(
					this.nodes()[this.size() - 1]
				);
			};

    		// Transition nodes to their new position.
            var transitionCount = 0;
    		var nodeUpdate = nodeEnter.transition()
    		.duration(options.duration)
    		.attr("transform", function(d) {
    			transitionCount++;
    			//Finding scroll position goes here
    			if(options.orientationType == '0'){//horizontal
    				if(d.y == 0){
        				rootNodePosition = d.x;
        			}
    			}else{
    				if(rootNodePosition == null){
        				rootNodePosition  = d.x;
        			}
        			if(d.x < 0){//LHS Node
        				if(d.x < rootNodePosition){
        					rootNodePosition = d.x;
        				}
        			}
    			}

    			if(options.orientationType == '0'){      //horizontal
    				return "translate(" + d.y + "," + d.x + ")";//No I18N
    			}else{
    				return "translate(" + d.x + "," + d.y + ")";//No I18N
    			}
    		}).on("end", function(){	//No I18n
        		if( --transitionCount === 0 && (operOccured.addDep || operOccured.deleteDep)){	//The width and height of the layout is calculated after transition of all nodes to make it proper and it should be executed after addlink and deletelink operations only.
        			operOccured.addDep = operOccured.deleteDep = false;
        			updateSVGLayout(false);
            	}
        	});;

    		nodeUpdate.select("rect.rectbox")//No I18N
    		.attr("width", options.rectW)
    		.attr("height", options.rectH)
    		.attr("stroke-width", 1);

    		// Fade the text in
    		nodeUpdate.select("text")//No I18N
    		.style("fill-opacity", 1);//No I18N

    		// Update the links
    		var link = linkG.selectAll("path.link") //NO I18N
    		.data(links)
    		.attr("class", "link");

    		// Enter any new links at the parent's previous position.

			var link = link.data().length == 0? link.enter() : link;
    		var linkEnter = link.append('path')//No I18N
    		.attr("id", "connector")
    		.attr("class", "link")
    		.attr("stroke-width", "1")
    		.attr("stroke", "#888")
    		.style("stroke-dasharray", function (d) {//No I18N
    			if(isVirtualLink(d)){
    				return "5,5";

    			}else{
    				return "";
    			}
    		})
    		.attr('marker-end', function(d) {return "url(#triangle)";})
    		.attr("fill", "none")
    		.attr("x", options.rectW / 2)
    		.attr("y", options.rectH / 2)
    		.attr("d", diagonal)
    		.style("opacity","0.9999") //No I18N
            .on('mouseover',function(d){ //No I18N
            	mouseover_link = d;
            	//Reverting the selection of a link if any
            	linkG.selectAll('path.link, path.extralink').style("stroke", "#888").style("stroke-width","1");//No I18N
            	linkG.selectAll('path.link, path.extralink').attr("marker-end","url(#triangle)");//No I18N
            	if(d.source != root.data && d.source.isMilestone != true){
            		if(!d.source.isDummy && !d.target.isDummy && isViewEditable){
	                   tdDelete.transition().delay(300).style("display","block");//No I18N
	                    tdDelete.style("left", (d3.event.pageX - 8) + "px")//No I18N
	                            .style("top", (d3.event.pageY - 8) + "px");//No I18N
	                    jQuery("#tddelete").off().click(function(){clickLink(mouseover_link);});
            		}
                    //Highlight the currently selected link goes here
                    d3.select(this).style("stroke", "#00c5ff").style("stroke-width","2");//No I18N
                    d3.select(this).attr("marker-end","url(#triangle-blue)");//No I18N
                    this.parentNode.appendChild(this);
                }
            })
            .on('mouseout',function(d){ //No I18N
				jQuery("#tddelete").on("mouseout",function(){
					linkG.selectAll('path.link, path.extralink').filter(function(link, i) { //NO I18N
						if(link.source != root){
							d3.select(this).style("stroke", "#888").style("stroke-width","1");//No I18N
							d3.select(this).attr("marker-end","url(#triangle)");//No I18N
						}
					});
					tdDelete.style("display","none"); //No I18N
				});
            });

    		// Transition links to their new position.

    		// Transition exiting nodes to the parent's new position.
    		link.exit().transition()
    		.duration(options.duration)
    		.attr("d", diagonal)
    		.remove();

    		//updating extra links for the multiparent nodes goes here
    		var extraLLink = linkG.selectAll("path.extralink") //NO I18N
    			.data(multiParentData.extraLinks)
    			.attr("class", "extralink");

    		var extraLinkEnter = extraLLink.enter().append('path')//No I18N
    			.attr("id", "connector")
    			.attr("class", "extralink")
    			.attr("stroke-width", "1")
    			.attr("stroke", "#888")
    			.style("stroke-dasharray", function (d) {//No I18N
	    			if(d.source.isDummy || d.target.isDummy){
	                    return "2,2";
	    			}else{
	    				return "";
	    			}})
    			.attr("fill", "none")
    			.attr("x", options.rectW / 2)
    			.attr("y", options.rectH / 2)
    			.style("opacity","0.9999") //No I18N
    			.attr("d", getPath)
    			.attr('marker-end', function(d) { return "url(#triangle)";})
                .on('mouseover',function(d){ //No I18N
                	mouseover_link = d;
                	//Reverting the selection of a link if any
                	linkG.selectAll('path.link, path.extralink').style("stroke", "#888").style("stroke-width","1");//No I18N
                	linkG.selectAll('path.link, path.extralink').attr("marker-end","url(#triangle)");//No I18N
                	if(d.source != root && d.source.isMilestone != true){
                		if(!d.source.isDummy && !d.target.isDummy && isViewEditable){
	                		tdDelete.transition().delay(500).style("display","block"); //No I18N
	                        tdDelete.style("left", (d3.event.pageX - 8) + "px")//No I18N
	                                .style("top", (d3.event.pageY - 8) + "px");//No I18N
	                        jQuery("#tddelete").off().click(function(){clickLink(mouseover_link);});
                		}
                        //Highlight the currently selected link goes here
                        d3.select(this).style("stroke", "#00c5ff").style("stroke-width","2");//No I18N
                        d3.select(this).attr("marker-end","url(#triangle-blue)");//No I18N
                        this.parentNode.appendChild(this);
                    }
                })
                .on('mouseout',function(){ //No I18N
					jQuery("#tddelete").on("mouseout",function(){
						linkG.selectAll('path.link, path.extralink').filter(function(link, i) { //NO I18N
							if(link.source != root){
								d3.select(this).style("stroke", "#888").style("stroke-width","1");//No I18N
								d3.select(this).attr("marker-end","url(#triangle)");//No I18N
							}
						});
						tdDelete.style("display","none"); //No I18N
					});
                });

    		extraLinkEnter.transition()
    			.duration(options.duration)
    			.attr("d", getPath);

    		extraLLink.exit().transition()
    			.duration(options.duration)
    			.attr("d", getPath)
    			.remove();

    		// Transition exiting nodes to the parent's new position.
    		var nodeExit = node.exit().transition()
    		.duration(options.duration)
    		.attr("transform", function(d) {
    			if(options.orientationType == '0'){//horizontal
    				return "translate(" + (source.y) + "," + (source.x) + ")";//No I18N
    			}else{
    				return "translate(" + (source.x) + "," + (source.y) + ")";//No I18N
    			}
    		})
    		.remove();

    		nodeExit.select("rect")//No I18N
    		.attr("width", options.rectW)
    		.attr("height", options.rectH);

    		nodeExit.select("text")//No I18N
    		.style("fill-opacity", 0);	//No I18N

    		// Stash the old positions for transition.
    		nodes.forEach(function(d) {
    			d.x0 = d.x;
    			d.y0 = d.y;
    		});

        }

    	/** Methods for Add/Remove Node/Link starts here */
    	// Add and remove elements on the graph object
        this.addLink = function (tempLink) {
        	if(tempLink.source.isDummy || tempLink.target.isDummy){
        		showalert("failure",getMessageForKey("sdp.common.noprivilege"),'isAutoHide=true'); //No I18N
        		return;
        	}else if(tempLink.target && (tempLink.target.depth === 0 || (tempLink.target.data && tempLink.target.data.isMilestone))){
                showalert("failure",getMessageForKey("sdp.invalid.dependency.msg"),'isAutoHide=true'); // NO I18N
                return;
            }else if(tempLink.source && (tempLink.source.depth === 0 || (tempLink.source.data && tempLink.source.data.isMilestone))){
                return;
        	}
        	var source, target;
			source = tempLink.source;
			target = tempLink.target;
			var module = jQuery('#moduleName').attr('value');

        	//Send a request to server to addDepdendency goes here
        	var url;
        	if(module == "project" && source.milestone && target.milestone){
        		url = $task_dep.getBaseUrlForTaksDep()+"/milestones/"+source.milestone.id+"/task_dependencies"; //NO I18N
        	}else if(module == "project_template" && source.milestone_template && target.milestone_template){	//No I18n
        		url = $task_dep.getBaseUrlForTaksDep()+"/milestone_templates/"+source.milestone_template.id+"/task_dependencies"; //NO I18N
		   }else if(module === "request_template" || module === "project_template" || module === "milestone_template" || module ==='problem_template'){	//No I18n
                url = $task_dep.getBaseUrlForTaksDep()+"/task_template_dependencies"; //NO I18N
        	}else{
        		url = $task_dep.getBaseUrlForTaksDep()+"/task_dependencies"; //NO I18N
        	}
			var param={};
			if (module === "request_template"){
                param.request_task_template_dependency = {parent_task_template:{id:tempLink.source.data.id},child_task_template:{id:tempLink.target.data.id}};
            }else if (module === "project_template" || module === "milestone_template"){	//No I18n
                param.project_task_template_dependency = {parent_task_template:{id:tempLink.source.data.id},child_task_template:{id:tempLink.target.data.id}};
            }else if(module === "problem_template"){// NO I18N
				param.problem_task_template_dependency = {parent_task_template:{id:tempLink.source.data.id},child_task_template:{id:tempLink.target.data.id}};
            }else{
			    param.task_dependency = {parent_task:{id:tempLink.source.data.id},child_task:{id:tempLink.target.data.id}};
			    if(module === "release"){
                 	param.stage={id:jQuery('#stageId').val()};
                }
			}
			sdpAjax({
				url: url, // No I18N
				data: sdpAjaxInputData(param),
				acceptODCompatible: true,
				type: "POST", // No I18N
				dataType: "json", // No I18N
				async: false,
				cache: false,
				success: function(data) {
						var item = data.task_dependency;
						if (module === "request_template"){
						    item=data.request_task_template_dependency;
						}else if (module === "project_template" || module === "milestone_template"){   // No I18N
						    item=data.project_task_template_dependency;
						}
						else if(module === "problem_template"){
							item=data.problem_task_template_dependency;
						}
						tempLink.id = item.id;

						/* Adding dependency link starts here */
						//Add the link either to links or to extraLinks goes here
						if(module == "project" || module == "Milestone" || module == "milestone"){
							if((isExtraLink(tempLink) ==  false) && ((tempLink.source.data.milestone && tempLink.target.data.milestone && tempLink.source.data.milestone.id == tempLink.target.data.milestone.id) || (!tempLink.source.data.milestone && !tempLink.target.data.milestone))){
								tempLink.source = tempLink.source.data;
								tempLink.target = tempLink.target.data;
								links.push(tempLink);
								var i = 0;
								while (i < links.length) {
									if ((links[i].source.depth === 0 || links[i].source.isMilestone)&&(links[i].target == tempLink.target)){
										var index = target.parent.children.indexOf(target);
										if (index > -1) {
											target.parent.children.splice(index, 1);
										}
										links.splice(i,1);
										break;
									}else {
										i++;
									}
								}
								if (source.data.children) {
									source.data.children.push(target.data);
								}else {
									source.data.children = [target.data];
								}

								if (source.children) {
									source.children.push(target);
								}else {
									source.children = [target];
								}
							}else{
								multiParentData.extraLinks.push(tempLink);
							}

						}
						else if(module == "project_template" || module == "milestone_template"){
							if((isExtraLink(tempLink) ==  false) && ((tempLink.source.milestone_template && tempLink.target.milestone_template && tempLink.source.milestone_template.id == tempLink.target.milestone_template.id) || (!tempLink.source.milestone_template && !tempLink.target.milestone_template))){
								links.push(tempLink);
								var i = 0;
								while (i < links.length) {
									if ((links[i].source .depth === 0 || links[i].source.isMilestone)&&(links[i].target == tempLink.target)){
										var index = target.parent.children.indexOf(target);
										if (index > -1) {
											target.parent.children.splice(index, 1);
										}

										links.splice(i,1);
										break;
									}else {
										i++;
									}
								}
								if (source.children) {
									source.children.push(target);
								}else {
									source.children = [target];
								}
							}else{
								multiParentData.extraLinks.push(tempLink);
							}
						}else{
							if(isExtraLink(tempLink) ==  true){
								multiParentData.extraLinks.push(tempLink);
							}else{
								links.push(tempLink);
								if(source.depth >= target.depth){//means dependency added upwards
									//After adding link, Remove the link from root, in case the target node has virtual link from root
									var i = 0;
									while (i < links.length){
										if ((links[i].source === root)&&(links[i].target == tempLink.target)){
											var index = target.parent.children.indexOf(target);
											if (index > -1) {
												target.parent.children.splice(index, 1);
											}
											links.splice(i,1);
											break;
										}else{
											i++;
										}
									}
									//Add target to the new source as child
									if (source.children) {
										source.children.push(target);
									}else {
										source.children = [target];
									}
								}
							}
						}


						//Adding entry in the notification buffer for add dependency goes here
						var parentTitle="",childTitle="";
                        if (module === "request_template"){
                            parentTitle=data.request_task_template_dependency.parent_task_template.name;
                            childTitle=data.request_task_template_dependency.child_task_template.name;
                        }else if (module === "project_template" || module === "milestone_template"){   // No I18N
                            parentTitle=data.project_task_template_dependency.parent_task_template.name;
                            childTitle=data.project_task_template_dependency.child_task_template.name;
                        }else if (module === "problem_template"){   // No I18N
                            parentTitle=data.problem_task_template_dependency.parent_task_template.name;
                            childTitle=data.problem_task_template_dependency.child_task_template.name;
                        }else{
                            parentTitle=data.task_dependency.parent_task.title;
                            childTitle=data.task_dependency.child_task.title;
                        }
						var operationDesc = translate('sdp.dependencymap.addition.msg',[e_html(parentTitle),e_html(childTitle)]);
						updateNotificationBuffer(operationDesc);
						/* Adding dependency link ends here */
						if(!jQuery("#lastActivity").is(":visible")){
							jQuery("#lastActivity").css("display","block");	//No I18n
						}
					tempLink.source = source;
					tempLink.target = target;
					operOccured.addDep = true;
					var coordinates = {};
					coordinates.x0 = root.x0;
					coordinates.y0 = root.y0;
					root = nodes[nodes.length - 1].data;
					// _update(coordinates);
					$task_dep.populateTreeData("update"); //NO I18N
					showalert("success", operationDesc, "isAutoHide=true");   // No I18N
				},
				error: function(err){
					var responseStatus=err.responseJSON.response_status.messages[0];
					showalert('failure',responseStatus.message, "isAutoHide=false"); // No I18N
				}
			})
        }

       	//adding link for it
        function clickLink(link) {
        	if(link.source.isDummy || link.target.isDummy){
        		showalert("failure", getMessageForKey("sdp.project.permissiondenied"), 'isAutoHide=true'); //No I18N
        		return;
        	}
        	if(link.source.depth !== 0){
        		if(link.id){
					var module = jQuery('#moduleName').attr('value');
					showconfirm(true, 'title=' + translate("sdp.delete.dependency.title") + '?, message=' + translate('sdp.delete.dependency.content') + '?, submitbutton=' + translate("common.yes") + ', cancelbutton=' + translate("common.no") + ', closebutton=yes, closeOnEscKey=yes', function(boo) { //NO I18N
						if (boo) {
							var url;
        					if(module == "project" && link.source.milestone && link.target.milestone){
        		        		url = $task_dep.getBaseUrlForTaksDep()+"/milestones/"+link.source.milestone.id+"/task_dependencies/"+link.id; //NO I18N
        		        	}else if(module === 'request_template' || module === 'project_template' || module==='milestone_template' ||module==='problem_template'){	//No I18n
                                url = $task_dep.getBaseUrlForTaksDep() + "/task_template_dependencies/"+link.id;//No I18N
                            }else{
        		        		url = $task_dep.getBaseUrlForTaksDep()+"/task_dependencies/"+link.id; //NO I18N
        		        	}

                        var isDeleteSuccessful = false;
                        if(module === "release" || module === "change"){
                        	sdpAjax({
                        		url: url,
                        		data: sdpAjaxInputData({stage:{id:jQuery('#stageId').val()}}),
                        		type: "DELETE", // No I18N
                        		acceptODCompatible: true,
                        		dataType: "json", // No I18N
                        		async: false,
                        		cache: false,
                        		success: function(response) {
                        			isDeleteSuccessful=true;
                        		}
                        })
                        }else{
                        	sdpAjax({
                        		url: url,
                        		type: "DELETE", // No I18N
                        		acceptODCompatible: true,
                        		dataType: "json", // No I18N
                        		async: false,
                        		cache: false,
                        		success: function(response) {
                                    isDeleteSuccessful=true;
                        		}
                        })
                        }
                        if(isDeleteSuccessful){
                        	// removeLink(link);
                        	$task_dep.populateTreeData("update"); //NO I18N
                        	jQuery("#tddelete").unbind( "click" ); //No I18N
                        	jQuery("#tddelete").hide();

                        	//Adding entry in the notification buffer for delete dependency goes here
                        	var operationDesc = translate('sdp.dependencymap.deletion.msg',[e_html(link.source.name), e_html(link.target.name)]);
                        	updateNotificationBuffer(operationDesc);
                        	if(!jQuery("#lastActivity").is(":visible")){
                        		jQuery("#lastActivity").css("display","block");	//No I18n
                        	}
                        	showalert("success", operationDesc, "isAutoHide=true");   // No I18N
                        }
						}
					})
        		}
        	}
    	}

        function isVirtualLink(link){
        	if(link.source.depth == 0 || link.source.isMilestone){
        		return true;
        	}
        	return false;
        }

        function isExtraLink(exLink){
        	var isExtra = false;
            links.forEach(function(link) {
            	if(exLink.target.id == link.target.id && link.source.depth !== 0 && link.source.isMilestone != true){//checks whether the target node is a multi parent node or not
            		isExtra = true;
        		}
            });
            return isExtra;
        }
        /** Methods for Add/Remove Node/Link ends here */

        function updateNotificationBuffer(operationDesc){
        	if(notificationObj.actionsArr.length == 0){
    			jQuery('#RecentsDiv ul').empty();
    		}
    		notificationObj.actionsArr.push(operationDesc);
    		jQuery("#RecentsDiv ul").append("<li class='pb5 pt5 task-recent-list pos-rel' style='word-break: break-word'>"+operationDesc+"</li>");
        }

        function clearNotificationBuffer(){
        	if(jQuery("#lastActivity").is(":visible")){
				jQuery("#lastActivity").css("display","none");	//No I18n
			}
        	notificationObj.actionsArr = [];
        	jQuery('#RecentsDiv ul').empty();
        	// jQuery("#RecentsDiv ul").append("<li id='norow_span' style='padding-left:30px;padding-right:30px;'>"+_getI18NMsg('sdp.dependencymap.actions.recentchanges.empty')+"</li>");
        }

		//Helper functions for text wrapping.
		function wrapText(d) {
			var self = d3.select(this);
			var textLength = this.getComputedTextLength();
			var text = this.textContent;
			while (textLength > (d.rectW-d.iconWidth-18) && text.length > 0) {
				text = text.slice(0, -1);
				self.text(text + '...');
				textLength = self.node().getComputedTextLength();
			}
		}

        function getToolTip(d,rootSvg){
        	var $temp= jQuery('#sdp-gantt-tooltip-template').clone();
        	var classprefix = 'task'; //No I18N
        	var hide = 'disp-h'; //No I18N
		   var type = 'sdp.task.taskid';//No I18N
            var moduletype = jQuery('#moduleName').attr('value');
            if(d.depth !== 0){
            	if(d.isDummy){
            		return "";
            	}
            	if(d.data.isMilestone){
            		classprefix = 'milestone'; //No I18N
				   type = 'sdp.project.milestoneattribute.milestoneid';//No I18N
            	}
                $temp.find('div.sdp-gantt-tooltip').addClass(classprefix+'-tooltip');
                //Setting values of task node tooltip from node props goes here
    			if(d.data.status && d.data.status!=null){
    				$temp.find('span.svalue').text(d.data.status.name);	//No I18N
    				$temp.find('span.scolor').css( "background-color",d.data.status.color );	//No I18N
    			}
    			if(d.data.priority && d.data.priority!=null){
    				$temp.find('span.pvalue').text(d.data.priority.name);	//No I18N
    				$temp.find('span.pcolor').css( "background-color",d.data.priority.color );	//No I18N
    			}else{
    			    $temp.find('span.pvalue').text(getMessageForKey("sdp.common.notassigned"));	//No I18N
                    $temp.find('span.pcolor').css( "background-color","#c0c0c0" );	//No I18N
    			}
    			if(classprefix === 'task'){
                    var effort = "";
                    if(d.data.estimated_effort.days > 0){
                        effort = effort+d.data.estimated_effort.days+" "+getMessageForKey("sdp.contract.printView.day")+" ";
                    }
                    if(d.data.estimated_effort.hours > 0){
                        effort = effort+d.data.estimated_effort.hours+" "+getMessageForKey("sdp.common.hrs")+" ";
                    }
                    if(d.data.estimated_effort.minutes > 0){
                        effort = effort+d.data.estimated_effort.minutes+" "+getMessageForKey("sdp.common.mins");
                    }
                    $temp.find('td.effort-value').text((effort=="")?"-":effort);//No I18N
                    $temp.find('#effortRow').removeClass(hide);    //No I18n
                    if(moduletype=== 'project' && d.data.milestone){
                        $temp.find('span.mId').text(d.data.milestone.id);
                        $temp.find('#milestoneId').removeClass(hide);
                    }else if (moduletype === 'release' && d.data.stage){     //No I18N
                        $temp.find('span.stageVal').text(d.data.stage.name);
                        $temp.find('#stage').removeClass(hide);
                    }
                }
                if(d.data.scheduled_end_time && d.data.scheduled_end_time != null){
                	$temp.find('td.due-value').text(d.data.scheduled_end_time.display_value);
                }else{
                	$temp.find('td.due-value').text(getMessageForKey("sdp.common.na"));//No I18N
                }
                $temp.find('#dueRow').removeClass(hide);	//No I18n
                if(d.data.marked_owner){
                    $temp.find('span.owner-value').text(d.data.marked_owner.name);//No I18N
                    $temp.find("#markicon").removeClass(hide);;
                }else{
                    $temp.find('span.owner-value').text(d.data.owner?d.data.owner.name:getMessageForKey("sdp.common.notassigned"));//No I18N
                }
                $temp.find("#ownerRow").removeClass(hide);;
                if(d.data.isMilestone && d.data.project_template){
                    type = 'sdp.admin.milestonetemplate';//No I18N
                    $temp.find("#ownerRow").removeClass(hide);
                    $temp.find('#dueRow').removeClass(hide);
                    $temp.find('td.estimatedhours-value').text(d.data.estimated_hours?d.data.estimated_hours:'-');//No I18N
                    $temp.find('#hoursRow').removeClass(hide);	//No I18n
                }
                $temp.find('div.tt-id').html(getMessageForKey(type) + ' : #'+d.data.id); //No I18N
            }
            else{
            	if(moduletype === 'request'){
				   type = 'sdp.requests.common.requestid'; //No I18N
                    if(jQuery('#isServiceRequest').val() == 'true'){
                    	classprefix = 'service-request'; //No I18N
            		}else{
            			classprefix = 'request'; //No I18N
            		}
            	}
            	else if(moduletype === 'problem'){
				   type = 'sdp.problem.problemId'; //No I18N
                    classprefix = 'problem'; //No I18N
            	}
            	else if(moduletype === 'change'){
            		type = 'sdp.change.changeId';  //No I18N
            		if(jQuery('#isEmergency').val() == 'true'){
            			 classprefix = 'emergency-change'; //No I18N
            		}else{
            			 classprefix = 'general-change'; //No I18N
            		}
                    $temp.find('span.stageVal').text(jQuery('#parentStage').val());
                    $temp.find('#stage').removeClass(hide);
            	}
            	else if(moduletype === 'release'){
                    type = 'common.release.id';  //No I18N
                    classprefix = 'release';  //No I18N
					$temp.find('span.stageVal').text(jQuery('#parentStage').val());
                    $temp.find('#stage').removeClass(hide);
                }
            	else if(moduletype === 'milestone'){
            		classprefix = 'milestone'; //No I18N
                    type = 'sdp.project.milestoneattribute.milestoneid'; //No I18N
            	}
            	else if(moduletype === 'project'){
            		classprefix = 'project'; //No I18N
                    type = 'sdp.project.projectid'; //No I18N
            	}
            	else if(moduletype === 'milestone_template'){
            		classprefix = 'milestone'; //No I18N
                    type = 'sdp.admin.milestonetemplate'; //No I18N
                	$temp.find('td.estimatedhours-value').text(jQuery('#parentEstimatedHours').val());//No I18N
                	$temp.find('#hoursRow').removeClass(hide);	//No I18n
            	}
            	else if(moduletype === 'project_template'){
            		classprefix = 'project'; //No I18N
                    type = 'project.template'; //No I18N
                	$temp.find('td.estimatedcost-value').text(jQuery('#parentEstimatedCost').val());//No I18N
                	$temp.find('td.estimatedhours-value').text(jQuery('#parentEstimatedHours').val());//No I18N
                	$temp.find('#costRow').removeClass(hide);	//No I18n
                	$temp.find('#hoursRow').removeClass(hide);	//No I18n
            	}
            	else if(moduletype === 'request_template'){
            		classprefix = 'request'; //No I18N
            		type = 'common.incident.template'; //No I18N
                    if(jQuery('#isServiceRequest').val() == 'true'){
                        type = 'common.service.template'; //No I18N
                        classprefix = 'service-request';	//No I18n
                    }
                    // $temp.find('div.tt-row03').hide();
            	}
				else if(moduletype ==='problem_template'){
					classprefix = 'problem';//No I18N
					type='admin.problemconf.template';//No I18N
				}
            	$temp.find('div.sdp-gantt-tooltip').addClass(classprefix+'-tooltip');
                //Setting values of module node tooltip goes here
            	$temp.find('span.svalue').text(jQuery('#parentStatus').val());	//No I18N
                if(jQuery('#parentStatus').attr("statuscolor") && jQuery('#parentStatus').attr("statuscolor") !==''){
                	$temp.find('span.scolor').css( "background-color",jQuery('#parentStatus').attr("statuscolor"));	//No I18N
                }else{
                	$temp.find('span.scolor').css( "background-color","#c0c0c0" );	//No I18N
                }

                $temp.find('span.pvalue').text(jQuery('#parentPriority').val());	//No I18N
                if(jQuery('#parentPriority').attr("prioritycolor") !==''){
                	$temp.find('span.pcolor').css( "background-color",jQuery('#parentPriority').attr("prioritycolor"));	//No I18N
                }else{
                	$temp.find('span.pcolor').css( "background-color","#c0c0c0" );	//No I18N
                }

            	if(moduletype === 'Request') {
            		$temp.find('div.tt-id').text(getMessageForKey(type) +' : #'+jQuery('#parentDisplayId').val()); //No I18N
            	} else if(moduletype === 'Change'){  //No I18N
            		$temp.find('div.tt-id').text(getMessageForKey(type) +' : '+jQuery('#parentDisplayId').val()); //No I18N
            	}else{
                	$temp.find('div.tt-id').text(getMessageForKey(type) +' : #'+d.data.id); //No I18N
            	}
            	if(moduletype !== 'project_template' && moduletype !== 'milestone_template' && moduletype !== 'request_template' && moduletype !== 'problem_template'){
            	    $temp.find('td.due-value').text(jQuery('#parentDueByTime').val());//No I18N
                    $temp.find('span.owner-value').text(jQuery('#parentOwner').val());//No I18N
                    $temp.find('#dueRow').removeClass(hide);	//No I18n
                    $temp.find('#ownerRow').removeClass(hide);	//No I18n
            	}
            }
            $temp.find('.print-icon').addClass("fl mr5 mt-2").html(rootSvg);
            $temp.find('div.tt-main-info h1').text(d.data.name);
			$temp.find('.tt-actions a span').attr('task_id',d.data.id);

			var titleString = $temp.html();
			return titleString;
        }
        // Function to center svg layout by root node
        function updateSVGLayout(fixScroll) {
        	//center the svg layout when changing loading/layout change
			setTimeout(function(){
				DependencyTree.getInstance().svgDimensionCalc();
				d3.selectAll('#baseG').transition()//No I18N
					.duration(750).on("end", function() {
					//To render the export header
			        if(isExport){
		            	var baseSvg = d3.select("#canvasDiv_svg");	//No I18N
		            	var width = Number(baseSvg.attr('width'));
		            	var date = translate("sdp.pdf.exported.at") + ": " +getFormattedDateTime(new Date(), true);
		        		var exportedBy = translate("ae.cmdb.businessview.exportedby") + ": " + sdp_user.USERNAME;
		        		var dispName = moduleDisplayName, moduleName = jQuery('#moduleName').attr('value');
		        		var moduleArray = {"request_template":"common.request.templates","project_template":"project.template","milestone_template":"sdp.admin.milestonetemplate","problem_template":"admin.problemconf.template","request":"common.request","problem":"common.newproblem","change":"common.change","release":"common.release","project":"common.project","milestone":"project.milestone"};       // NO I18N
		        		if (moduleArray.hasOwnProperty(moduleName)) {
					        dispName = translate(moduleArray[moduleName]);
					    }
					    dispName = dispName + ': #' + jQuery('#parentDisplayId').val()+ " " +jQuery('#parentTitle').val();
		        		baseSvg.append("svg:rect").attr('width',width).attr('height',60).attr('fill','#eaeaea').attr('id','exportHeader');
		        		baseSvg.append("svg:text").attr('x',(sdp_user.DIRECTION == 'RTL') ? (dispName.length * 7) : '10').attr('y','20').text(dispName);
		        		baseSvg.append("svg:text").attr('x',(sdp_user.DIRECTION == 'RTL') ? (date.length * 7) - 20: '10').attr('y','40').text(date);
		        		baseSvg.append("svg:text").attr('x',(sdp_user.DIRECTION == 'RTL') ? width - 15 : width - (exportedBy.length * 7)).attr('y','40').text(exportedBy);
		        	}
			    });
			},800);
            var baseGwidth = jQuery('#canvasDiv_svg').attr('width');
            var baseGheight = jQuery('#canvasDiv_svg').attr('height');
			var height = document.documentElement.clientHeight;
            options.width = baseGwidth;
            options.height = height;
			scale= 1;
        	if(options.orientationType == '0'){//horizontal
        		x = 40;
            	y = 20;
        	}else{
        		x = Math.abs(rootNodePosition) + options.rectW/2;
        		y= 80;
        	}

        	if(options.orientationType == "0"){
        		svgGroupXPosition = x + options.rectW;
        		svgGroupYPosition = y + options.rectH/2;
        	}
        	else{
        		svgGroupXPosition = x + options.rectW/2;
        		svgGroupYPosition = y + options.rectH;
        	}

        	d3.selectAll('#baseG').transition()//No I18N
        	.duration(options.duration)
        	.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");

        	//fixing scroll position
        	if(!fixScroll){return;}
        	if(options.orientationType == '0'){//horizontal
        		var viewportHeight = jQuery('#canvasDiv').height();
        		jQuery('#canvasDiv').scrollTop(rootNodePosition-viewportHeight/2);
        		jQuery('#canvasDiv').scrollLeft(0);
        	}else{
        		var viewportWidth = jQuery('#canvasDiv').width();
        		jQuery('#canvasDiv').scrollLeft(x-viewportWidth/2);
        		jQuery('#canvasDiv').scrollTop(0);
        	}
        	jQuery(window).scroll();
        	jQuery(window).resize();
        }

        function svgDimensionCalc(){
        	if(jQuery("#baseG")[0] != undefined){
        		var baseGwidth = jQuery("#baseG")[0].getBoundingClientRect().width;
            	var baseGheight = jQuery("#baseG")[0].getBoundingClientRect().height;
            	//here the hardcoded values are to prodvide extra space in the SVG layout.
            	jQuery('#canvasDiv_svg').attr('width',baseGwidth+400);
            	jQuery('#canvasDiv_svg').attr('height',baseGheight+260);
        	}
        }

        // A recursive helper function for performing some setup by walking through all nodes
        function visit(parent, visitFn, childrenFn) {
        	if (!parent) { return; }
        	visitFn(parent);
        	var children = childrenFn(parent);
        	if (children) {
        		var count = children.length;
        		for (var i = 0; i < count; i++) {
        			visit(children[i], visitFn, childrenFn);
        		}
        	}
        }

    	return {
            draw: draw,
            findNode : findNode,
            extractRoot : extractRoot,
            getTreeData: getTreeData,
            getTreeOrientation : getTreeOrientation,
            addLink : addLink,
            getToolTip : getToolTip,
            svgDimensionCalc : svgDimensionCalc
        };
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createDependencyTree();
            }
            return instance;
        }
    };
})(jQuery);
