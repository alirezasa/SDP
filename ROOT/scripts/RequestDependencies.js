//$Id$

	function onRequestNodeShowTip(node)
	{
		if( node.data.ciType === 'Request' || node.data.ciType === 'SRequest' ){
			jQuery('#node_actions').removeClass('hide');
		}else{
			jQuery('#node_actions').addClass('hide');
		}
		if( (node.data.isarchived && node.data.isarchived === 'true') || (node.data.istrashed && node.data.istrashed === 'true') )
		{
			jQuery('#node_actions').addClass('hide');
		}
		if( node.data.canview && node.data.canview === 'false' )
		{
			return false;
		}
	}
	function onRequestNodeClick(nodeId, onComplete,that)
	{
		if(jQuery('#'+nodeId) ){ 
			if(jQuery('#'+nodeId).hasClass('node-selectable')){
				return saveReqDependency(nodeId);
			}else if(jQuery('#'+nodeId).hasClass('node-removable')){// NO I18N
				return saveReqDependency(nodeId);
			}
		}

		var responseObj = TaskDependency.resultJSON.responseObj;
				
		var result = responseObj[nodeId]?responseObj[nodeId]:[];
		if( !mapRendered ){ that.insertData(nodeId, responseObj[nodeId], onComplete);	 }
	}
	function saveReqDependency(nodeid)
	{
		// to remove "T" from the nodeid to get workorderid..
		var node = nodeid.substring(1);	
		var baseNode = TaskDependency.baseTask.substring(1);
		if(TaskDependency.taskRelation==='Depends-On'){
			document.RequestDependencyForm.Dependson_ReqId.value = node;
			document.RequestDependencyForm.Dependent_ReqId.value = baseNode;
			document.RequestDependencyForm.SubmitAction.value ='AddRequestDependency';// NO I18N
		}else if(TaskDependency.taskRelation==='removeDependency'){// NO I18N
			document.RequestDependencyForm.Dependson_ReqId.value = node;
			document.RequestDependencyForm.Dependent_ReqId.value = baseNode;
			document.RequestDependencyForm.SubmitAction.value ='DeleteRequestDependency';// NO I18N
		}
		document.RequestDependencyForm.Base_ReqId.value = baseNode;
		document.RequestDependencyForm.Request_Relation.value = TaskDependency.taskRelation;
		
		document.RequestDependencyForm.submit();
	}

	function saveDependency(nodeid)
	{
		// to remove "T" from the nodeid to get taskid..
		var node = nodeid.substring(1);	
		var baseNode = TaskDependency.baseTask.substring(1);

		if(TaskDependency.taskRelation=='Depends-On'){
			document.TaskDependencyForm.parent_taskid.value = node;
			document.TaskDependencyForm.child_taskid.value = baseNode;
			document.TaskDependencyForm.submitaction.value ='AddTaskDependency';// NO I18N

		}else if(TaskDependency.taskRelation=='Dependents'){// NO I18N
			
			document.TaskDependencyForm.parent_taskid.value = baseNode;
			document.TaskDependencyForm.child_taskid.value = node;
			document.TaskDependencyForm.submitaction.value ='AddTaskDependency';// NO I18N
		}else if(TaskDependency.taskRelation=='removeDependency'){// NO I18N

			document.TaskDependencyForm.parent_taskid.value = baseNode;
			document.TaskDependencyForm.child_taskid.value = node;
			document.TaskDependencyForm.submitaction.value ='DeleteTaskDependency';// NO I18N
		}
		document.TaskDependencyForm.base_taskid.value = baseNode;
		document.TaskDependencyForm.task_relation.value = TaskDependency.taskRelation;

		document.TaskDependencyForm.submit();
	}
	
	function markSelectableNodes(relation) 
	{
		
		if(parent.document.getElementById('operation_status') != null){
		
			parent.document.getElementById('operation_status').className = 'hide'
		}
		removedAllSelectable();
		var nodeid = vizard.infoData.nodeId;
		TaskDependency.baseTask = nodeid;
		TaskDependency.taskRelation = relation;
		TaskDependency.hierarchy = new Array(); 

		// while marking parent we need to exclude the childs and it's childs...
		// We need to exclude the current parents too..
		if(relation!='undefined' && relation=='Depends-On'){

			jQuery('#actionMSG').removeClass('disp-h');
			$('actionMSG').innerHTML = $('markParentMSG').innerHTML;
			getHierarchyList(nodeid,TaskDependency.dependsMapJson);
		
			if(TaskDependency.parentMapJson[nodeid]!=null){
				var tempList = TaskDependency.parentMapJson[nodeid];

				if(tempList!=null && tempList.length>0){
					for( var j = 0 ; j<tempList.length ; j++ ){ 		TaskDependency.hierarchy.push( tempList[j] );		}
				}
			}
		}else{
			jQuery('#actionMSG').removeClass('disp-h');
			$('actionMSG').innerHTML = $('markChildMSG').innerHTML;

			// while marking dependents we need to exclude the parents and it's parents...
			// We need to exclude the current dependents too..

			getHierarchyList(nodeid,TaskDependency.parentMapJson);
			
			if(TaskDependency.dependsMapJson[nodeid]!=null){
				var tempList = TaskDependency.dependsMapJson[nodeid];
				if(tempList!=null && tempList.length>0){
					for( var j = 0 ; j<tempList.length ; j++ ){ 		TaskDependency.hierarchy.push( tempList[j] );		}
				}
			}
		}
	
		// we need to exclude the current node from the selectable list..
		TaskDependency.hierarchy.push(nodeid);

		var selectList = TaskDependency.taskNodeList.clone();

		const index = selectList.indexOf(nodeid);
		if (index > -1) {
  			selectList.splice(index, 1);
		}

		for(var i=0; i<selectList.length; i++ ){

			selectList[i] = [window[selectList[i]]];
		}

		for(i=0;i<selectList.length;i++){		jQuery(selectList[i]).addClass('node-selectable');		}

		jQuery('#'+nodeid).addClass('node-currentnode');// NO I18N
		parent.jQuery('#cancelMarkingsMessage').removeClass('hide');
	}

	function removeRelation(fromModule){

		if(parent.document.getElementById('operation_status') != null){
		
			parent.document.getElementById('operation_status').className = 'hide'
		}

		jQuery('#actionMSG').removeClass('disp-h');
		$('actionMSG').innerHTML = $('removeRelationMSG').innerHTML;
		
		removedAllSelectable();
		var nodeid = vizard.infoData.nodeId;
		TaskDependency.baseTask = nodeid;
		TaskDependency.taskRelation = "removeDependency";// NO I18N
		TaskDependency.hierarchy = new Array(); 

		if(TaskDependency.parentMapJson[nodeid]!=null){
			var tempList = TaskDependency.parentMapJson[nodeid];
			for( var j = 0 ; j<tempList.length ; j++ ){ 		TaskDependency.hierarchy.push( tempList[j] );		}
		}
		if(TaskDependency.dependsMapJson[nodeid]!=null){
			var tempList = TaskDependency.dependsMapJson[nodeid];
			for( var j = 0 ; j<tempList.length ; j++ ){ 		TaskDependency.hierarchy.push( tempList[j] );		}
		}

		var selectList = TaskDependency.hierarchy;

		for(var i=0; i<selectList.length; i++ ){

			selectList[i] = [window[selectList[i]]];
		}

		for(i=0;i<selectList.length;i++){
			jQuery(selectList[i]).addClass('node-removable');
		}
		jQuery('#'+nodeid).addClass('node-currentnode');// NO I18N
		if(selectList.length == 0 && fromModule === 'requestDependency')
		{
			if(confirm(getMessageForKey("sdp.requests.dependencies.confirm.deletedependent")))
			{
				$('actionMSG').innerHTML = getMessageForKey("sdp.requests.dependencies.note.deletelastdependent");
				var baseNode = TaskDependency.baseTask.substring(1);
				document.RequestDependencyForm.Dependent_ReqId.value = baseNode;
				document.RequestDependencyForm.SubmitAction.value ='DeleteRequestFromDependencyGroup';// NO I18N
				document.RequestDependencyForm.submit();
			}
		}
		parent.jQuery('#cancelMarkingsMessage').removeClass('hide');
	}
	
	function removedAllSelectable(){
		TaskDependency.baseTask = null;
		TaskDependency.taskRelation = null;
		TaskDependency.hierarchy = null;
		for(z=0;z<TaskDependency.taskNodeList.length;z++){
			jQuery('#'+TaskDependency.taskNodeList[z]).removeClass('node-selectable');
			jQuery('#'+TaskDependency.taskNodeList[z]).removeClass('node-removable');
			jQuery('#'+TaskDependency.taskNodeList[z]).removeClass('node-currentnode');
		}
	}

	var taskHierarchy_len = 0;

	function getHierarchyList(nodeid,mapJson){

		if( TaskDependency.hierarchy.length == 0 ){	taskHierarchy_len = 0;	}

		if(mapJson[nodeid]!=null){
	
			var tempList = mapJson[nodeid].clone();
			
			// this will remove the already present enteries..
			tempList.remove(TaskDependency.hierarchy);

			if(tempList!=null && tempList.length>0){
				
				for( var j = 0 ; j<tempList.length ; j++ ){ 		TaskDependency.hierarchy.push( tempList[j] );				}
				
				for( ;taskHierarchy_len<TaskDependency.hierarchy.length;taskHierarchy_len++ ){	
					
					getHierarchyList( TaskDependency.hierarchy[taskHierarchy_len] , mapJson );   
				}
			}
		}

		return true;
	}
 
	function getNodeHoverHTML(node,citype){
		var returnStr = '';
			var imageClass = 'requests';	// NO I18N

			var statusColor = TaskDependency.taskStatusColor[node.data.status];			
			if(citype == 'milestone'){	

				imageClass = 'ui-milestoneicon1';		// NO I18N
				statusColor = TaskDependency.projectStatusColor[node.data.status];
				
			}else if(citype == 'project'){	// NO I18N	

				imageClass = 'ui-projecticon1';		// NO I18N
				statusColor = TaskDependency.projectStatusColor[node.data.status];
			}else if(citype == 'SRequest'){ // NO I18N

				imageClass = 'servicereqicn';  //NO I18N
			}else if(citype == 'DepGroup'){ // NO I18N

				imageClass = 'ui-button-dependency-large';  //NO I18N
			}

			returnStr = "<img class='"+imageClass+"' src='images/spacer.gif'>"+
		       			"<h2 class='title'>"+encodeHTML(node.name)+"</h2>"+
				       	"<div class='desc-cnt'>"+"<div class='auth-status'>";
				                	

			var priority = TaskDependency.priorityMap[node.data.priority];
			var priorityColor = TaskDependency.priorityColor[node.data.priority];
			var status = TaskDependency.entityStatus[node.data.status];
			var scheduleend = node.data.scheduleend;
			
			if(citype === 'Request' || citype === 'SRequest') 
			{
				returnStr = returnStr + "<span style='color:#555'>"+getMessageForKey("sdp.requests.common.requestid")+":</span> "+node.id.substring(1)+"<br>";
			}
			
			if( scheduleend != null && scheduleend.toString() == "0" ){	scheduleend = null;	}

			if(node.data.owner){
				returnStr = returnStr + '<span class="mr15">'+encodeHTML(node.data.owner)+'</span>' ;
			}
            		if(node.data.priority){
	
				if(priority == null || priority == 'null'){	 priority = '-';	}
				
				if( priority === '-' && (citype === 'Request' || citype === 'SRequest'))
				{
					//Should not include priority if it is not assigned
					returnStr = returnStr;
				}
				else
				{
					returnStr = returnStr + "<span class='st mr15'><em class='mr5' style='background-color:"+encodeHTML(priorityColor)+"'></em>"+encodeHTML(priority)+"</span>";
				}
 			}
			if(node.data.status){
	
				if(status == null || status == 'null'){	 status = '-';	}

				returnStr = returnStr + "<span class='st mr15'><em class='mr5' style='background-color:"+encodeHTML(statusColor)+"'></em>"+encodeHTML(status)+"</span>";
			}
			if(scheduleend && scheduleend != '-1'){
				if(citype === 'Request' || citype === 'SRequest')
				{
					returnStr = returnStr + "<br/><span style='color:#555'>"+getMessageForKey("sdp.requests.common.duedate")+":</span> "+scheduleend+" <br>";
				}
				else
				{
					returnStr = returnStr + "<br/>"+getMessageForKey("sdp.requests.common.duedate")+" :"+getDateStringTaskDependency(scheduleend,citype)+" <br>";
				}				
			}
			returnStr = returnStr + "</div></div>";

		return returnStr;
	}

	function getDateStringTaskDependency(longValue,module){

		if(longValue!=null && longValue!='null' && longValue!=''){
		
			var dt = new Date( parseInt(longValue) );

			//When the client is in a different format and the time zone selected is in a different format, then while editing the values will be displayed on the client timezone. To overcome this, the selected time zone's offset is obtained and calculated.
			var utc = dt.getTime() + (dt.getTimezoneOffset() * 60000);
			if(parent.sdp_user.OFFSET) {
				utc = utc + (parent.sdp_user.OFFSET);
			}               
			dt.setTime(utc);

			if("milestone" == module || "project" == module){
				return sdpDate.format({"entire_date" : dt , "type" : "D MMMM , YYYY"}); //NO I18N
			}else{
				return sdpDate.format({"entire_date" : dt , "type" : "D MMMM , YYYY hh:mm A"}); //NO I18N
			}
		}else{
			return 'N/A';	//NO I18N
		}
	}

	function checkIsClosed(ciType , status){
		
		if("Task" === ciType && parent.jQuery.inArray(status.toString(), TaskDependency.taskCompletedStatusIDs) !== -1){
			
			return 'completednode';	// NO I18N

		}else if("Task" != ciType && status == TaskDependency.entityCloasedStatus){	//NO I18N
			
			return 'completednode';	// NO I18N
		}

		return '';
	}

	//Check Request is Last dependent in group
	function checkIsLastDependent(lastdependentwo){
		if("true" === lastdependentwo){
			return 'jit-assetnode-last';	// NO I18N
		}
		return '';
	}
	
	//Check if the Request is Archived
	function checkIsArchived(isClosed, isarchived){
		if("true" === isarchived){
			return 'archivednode';	// NO I18N
		}
		return isClosed;
	}
	
	//Check if the Request is Trashed 
	function checkIsTrashed(isClosed, istrashed){
		if("true" === istrashed){
			return 'trashdnode'; // NO I18N
		}
		return isClosed;
	}
	
	//Check if the Request is recent/current 
	function checkIsRecent(isrecentwo){
		if("true" === isrecentwo){
			return 'jit-assetnode-current';// NO I18N
		}
		return '';
	}
	
	//Check if the Request is loggedin user request
	function checkIsMyRequest(ismyrequest){
		if("true" === ismyrequest){
			return 'myrequest';// NO I18N
		}
		return '';
	}

	jQuery(document).ready( () => {
	    jQuery('.dependency-info-icon a').off('click').on('click', () => { //No I18N
	        dialogCallback = () => { jQuery('#_DIALOG_LAYER').find('#digCloseBtn').off('click').on("click", (event) => { closeDialog(); }) };
            showDialog(document.getElementById("dependency_icon_help").innerHTML, "closeButton=no,position=relative,closeOnBodyClick=yes", dialogCallback); //No I18N
        });
        jQuery('.task-mark-parent').off('click').on("click", (event) => { //No I18N
            markSelectableNodes('Depends-On'); // No I18N
        });
        jQuery('.task-rem-dependency').off('click').on('click', (event) => { //No I18N
            removeRelation('requestDependency'); //No I18N
        });
	})


