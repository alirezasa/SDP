
/* $Id$ */
//cwf start
//added for attachment popup close
var analysisType;
var analysisOp;
//added to hide statusaction links
var statusActionHTML = "";//NO I18N
//cwf end
//Calender Month and week Obj Method creation
var calMonthWeek = {
	jq_doc: jQuery(document),
	// Month Calendar Footer method
	calviewMonthFooter: function () {
		var jq_doc = this.jq_doc,
			$self;
		// loopping month calendar change type and  initializing tooltip
		jq_doc.find('#Calendar_Div table.tbgbdr [data-id=monthcal-foo]').each(function() { //NO I18N
			$self = jq_doc.find(this);
			$self.attr({
				// adding change type text into title attribute for tooltip purpose
				'title':$self.text()//NO I18N
			});
			//initialize tooltip
			initTooltip();
		});
	},
	// Week Calendar method
	calviewWeek: function(ele) {
		// Declaring & initializing variables
		var jq_doc = this.jq_doc,
			trHeight = 0,
			self = this, IE=0;
			//adjusting automaticaly week calendar height depends on window height
			function calWeekInner() {
				var windHeight = jQuery(window).height(),
				calWeekTbody = jq_doc.find('#calendarcontainerweek>tbody'),
				calWkTbody_top = calWeekTbody.position().top,
				calWkTbgbdr_height = jq_doc.find('#calendarcontainerweek').next('table.tbgbdr').outerHeight(); //NO I18N

				function calWkInner() {

				jq_doc.find('#calendarcontainerweek').prev('br').remove();//NO I18N

				calWeekTbody.css("height", "calc(100vh - "+ Math.floor(calWeekTbody.offset().top  + calWkTbgbdr_height + is_chathgt + 12) +"px)"); //No I18N
				jQ("#calendarcontainerweek_div").removeClass("vhide");//No I18N
				}
				calWeekTbody.find('tr').each(function() {
					trHeight = trHeight + jq_doc.find(this).height();
				});
				if(trHeight < calWeekTbody.height()) {
					calWeekTbody.css({'height':'auto'});//NO I18N
					calWkInner();
				}else if(trHeight > calWeekTbody.height()) {
					calWkInner();
				}
				trHeight = 0;
				(detectIEVersion()) ? IE=1 : '';
				if(calWeekTbody[0].scrollHeight > Math.round(calWeekTbody.height()+IE)) {
					jq_doc.find('#calendarcontainerweek th[data-id=empty-head]').show().prev('th').css('borderRightColor','transparent');//NO I18N
				}else {
					jq_doc.find('#calendarcontainerweek th[data-id=empty-head]').hide();
				}
				setTimeout(function() {
					//invoking calviewMonthFooter method
					self.calviewMonthFooter();
				},200);

				jQuery("#chnWeekCalNavL,#chnWeekCalNavR").on('click',function(){  //NO I18N
					setTimeout(function() { calWeekInner(); },500);
				});
			}
		setTimeout(function() { calWeekInner(); },500);
		jQuery(window).on('resize scroll',function() {
			calWeekInner();
		});
		//Issue fix SD-92570
		changeCalendar.emptyCalView();
	},
	//Month Calender Method
	calviewMonth: function() {
		var $self = this,
			jq_doc = $self.jq_doc;
		setTimeout(function() {
			//Invoking calviewMonthFooter method
			$self.calviewMonthFooter();
		},200);
	}
};
var conversationObj = null;

//Delete functions
function deleteChange(changeId) {
	var url;
	var data;
	var succMsg;
	if (isChangeTrashed) {
		url = "/api/v3/changes/" + changeId;	//NO I18N
		succMsg = "changes.delete.permanently";//NO I18N
	}
	else {
		url = "/api/v3/changes/" + changeId + "/move_to_trash";	//NO I18N
    if(jQuery("#cancelAssocChildEntity:checked").length > 0){
			data = {"cancel_associated_projects": true};    // No I18N
		}
		succMsg = "changes.moved.trash";//NO I18N
	}
	restoreOrDeleteAjaxChangeApi(succMsg, url,"DELETE", false, data); // No I18N
	setTimeout(function() { window.open("/Changes.cc","_self") }, 800);// No I18N
}

function restoreChange(changeId) {
	var url = "/api/v3/changes/" + changeId + "/restore_from_trash"; //NO I18N
	restoreOrDeleteAjaxChangeApi("changes.restored", url,"PUT", false); // No I18N
	setTimeout(function() { window.open("/Changes.cc","_self") }, 800);// No I18N
}

function restoreBulk() {
	var selVals = getSelectedCheckBoxes(document.ChangeListForm);
	if(sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {/*Change Classic view single restore event*/
		if(jQuery('#restoreChangeid').val() != '') {
			var selectListIdarr = [];
			selectListIdarr.push(jQuery('#restoreChangeid').val());
			jQuery('#restoreChangeid').val('');
			selVals = selectListIdarr;
    } else {
			var selectedtabl = table_tech_changes.bulkSelect.selectedRecords;
			selVals=Object.keys(selectedtabl);
		}
	}

	var url = "/api/v3/changes/restore_from_trash?ids="; //NO I18N
	var ids = "";
	for(var i = 0; i < selVals.length; i++) {
		ids = ids + encodeURIComponent(selVals[i]) + ((i === selVals.length - 1) ? '' : ',');
	}
	url = url + ids;
	restoreOrDeleteAjaxChangeApi("changes.restored", url,"PUT", true); // No I18N
}

function restoreOrDeleteAjaxChangeApi(succMsg,url,method, asynch,data) {
	sdpAjax({
		url: url,
		data: data !== undefined ? sdpAjaxInputData(data) : null,
		type:method,
		async: asynch
	}).done(function(data){
		var success = false;
		if(data && data.response_status && data.response_status.status === "success") {
			success = true;
		}
		else if (data && data.response_status && data.response_status[0]) {
			var i;
			for (i = 0; i < data.response_status.length; i++) {
				if (data.response_status[i].status !== "success") {
					break;
				}
			}
			if (i === data.response_status.length) {
				success = true;
			}
		}
		if (success) {
			closeDialog();//for close confrim delete popup
			showalert('success',encodeHTML(getMessageForKey(succMsg)),'isAutoHide=true');//No i18N
			refreshSubView(getPortalViewName("ChangesList"));//No i18N
		}
		else {
			showalert('failure',encodeHTML(getMessageForKey("sdp.change.exception.msg")),'isAutoHide=false');//No i18N
		}
		if(sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {/*Change Classic view*/
			if(typeof table_tech_changes !== 'undefined' && table_tech_changes != null) {
				table_tech_changes.refreshTable('refresh');//No i18N
			}
		}
		else if (typeof navparamId !== 'undefined' && navparamId === "trashed_changes") {
			updateChangeListView(navparamId);
    }
	}).fail(function(jqXHR){
		closeDialog();
		showalert('failure',encodeHTML(getMessageForKey("sdp.change.exception.msg")),'isAutoHide=false');//No i18N
	});
}
//cwf start
var changeTabs = new Array('submissiontab', 'planningtab', 'problemsandincidents', 'approvaltab', 'taskDetails','reviewtab', 'closetab', 'conversationtab', 'historyDetails');
//cwf end

//cwf start
function changeChangeTab(selectedTab, params, value, userId,key,isCurrentStage, portalId){
    var form = null;

		 var changeDUrl = "/ChangeDetails.do?";//NO I18N
  	         var chgUrl2a = "/";//NO I18N
  	         var chgUrl2b = "?";//NO I18N
  	         if(key!=null && key != 'null')
  	         {
  	                 changeDUrl = "/sd/ChangeDetails.sd?USERID="+encodeURIComponent(userId)+"&KEY="+encodeURIComponent(key)+"&";//NO I18N
  	                 chgUrl2a = "/sd/";//NO I18N
  	                 chgUrl2b = "?USERID="+encodeURIComponent(userId)+"&KEY="+encodeURIComponent(key)+"&";//NO I18N
  	         }
//cwf end
  	         if(isViewChangesPerm==false)
  	        	 {
  	        	 changeTabs.splice(8,1);
  	        	 }
	for(var i = 0; i < changeTabs.length; i++)
	{
		var tabName = changeTabs[i];
		if(tabName == selectedTab) {
			//cwf start
			if(selectedTab == "problemsandincidents")
			{
				tabName = "planningtab";// No I18N
			}
			if(selectedTab == "submissiontab")
			{
				setTimeout(function(){ jQuery("div[id='changecommentsinfo']:visible").html("")}, 1000);
			}
			//cwf end
			jQuery("#" + tabName).addClass("show"); // NO I18N
			jQuery("#" + tabName).removeClass("hide"); // NO I18N
			//document.getElementById(tabName).className = "show"; // No I18N
			//cwf start
			jQuery("#" + tabName + "_td").addClass("subtabon"); // NO I18N
			jQuery("#" + tabName + "_td").removeClass("subtaboff"); // NO I18N
			//document.getElementById(tabName + "_td").className = "subtabon"; // No I18N
			//cwf end
		}
		else
		{
			//cwf start
			if(tabName != "problemsandincidents")
			{
				//cwf end
				jQuery("#" + tabName).addClass("hide"); // NO I18N
				jQuery("#" + tabName).removeClass("show"); // NO I18N
				//document.getElementById(tabName).className = "hide"; // No I18N

				//cwf start
				jQuery("#" + tabName + "_td").addClass("subtaboff"); // NO I18N
				jQuery("#" + tabName + "_td").removeClass("subtabon"); // NO I18N
				//document.getElementById(tabName + "_td").className = "subtaboff"; // No I18N
			}
		}
	}
	if(selectedTab!="submissiontab")
		{
		document.getElementById("NotesPH").className="hide";
		}
	else
		{
		document.getElementById("NotesPH").className="change-content pt0 pb0";
		}
	//}

	var url = null;
	//cwf start
		var selectedStage = "Submission";// No I18N
		var tabVal = "Submission";// No I18N
		if(selectedTab == "planningtab")
	        {
		    selectedStage = "Planning";// No I18N
		    tabVal = "Planning";// No I18N
		    url = changeDUrl + "mode=planningtab&CHANGEID=" + parent.CHANGEID+"&from=change"; // No I18N
		}
		else if(selectedTab == "problemsandincidents")
		{
		    selectedStage = "Planning";// No I18N
			tabVal = "Planning";// No I18N
		    url = changeDUrl + "mode=problemsandincidents&CHANGEID=" + parent.CHANGEID;// No I18N
		}
		//For implementation tab details
		//TODO: change  the tabe name to changImplTab.. this is conflicing with taskframework
	else if(selectedTab == "taskDetails")
	{
		selectedStage = "taskDetails";// No I18N
		tabVal = "Implementation";// No I18N

			url = changeDUrl + "mode=taskDetails&CHANGEID=" + parent.CHANGEID+"&from=change";// No I18N
			if( parent.SITEID != null && parent.SITEID != 'null'  )
			{
				url=url+"&SITEID="+parent.SITEID; // No I18N
			}
			if(params && params.indexOf("addtask")!=-1){
            $tasks.loadTasks('form', 'change', parent.CHANGEID); //NO I18N
            params = params.substring(0,params.indexOf("addtask")-1);// No I18N
        }else if(params && params.indexOf("addworklog") != -1){
            $tasks.loadWorkLog('form', 'change', parent.CHANGEID); //NO I18N
            params = params.substring(0,params.indexOf("addworklog")-1);// No I18N
        }
	}

	//unused code
	/*else if(selectedTab == "timeEntryDetails") {
		    url = "/common/TimeEntryListView.jsp"+chgUrl2b +"MODULE=Change&ID=" + parent.CHANGEID+"&from=change"; // No I18N
	}*/
		if(url!=null && params!=null && params!='null')
		{
			url = url + params;
		}
showHideStatusActionList(selectedStage);// No I18N

	if( key!=null && key != 'null' && portalId != null && portalId != "null" && portalId != undefined )
	{
		url += "&PORTALID=" + portalId;//NO I18N
	}
	if(url != null) {
		if(selectedTab == "approvaltab"){
			jQuery("#approvaltab").load(url, function(){
				var canview = jQuery("#approvaltab_view").val();
				if(canview === "false"){
					jQuery("#approvaltab").html(jQuery("#warningDiv").html());
				}else if(isChangePreApp == "true") {
					jQuery("#approvaltab").html(jQuery("#preapproveDiv").html());
				}
				else{
					jQuery("#ApprDiv").show();
					changeStatusMenu();
				}
				loadMLA(selectedTab,tabVal,key);
			});
		}else{
			jQuery("[name=ChangeFrame]").on('load.approvallevel', function() {
                loadMLA(selectedTab,tabVal,key);
                jQuery("[name=ChangeFrame]").off('load.approvallevel'); // No I18N
            });
			jQuery("#"+selectedTab+" div[id^='approvalLevelsStage']:first").remove(); // No I18N
			window.frames.ChangeFrame.location.href = url + "&_=" + (new Date()).getTime() + "&SUBREQUEST=true"; // No I18N
			selectedTab == "problemsandincidents" ? tooltipFix(5500) : ''; // No I18N
		}
	}
	else
	{//Submission tab is already loaded
            loadMLA(selectedTab,tabVal,key);
	}
	window.scrollTo(0,0);
}


function loadMLA(selectedTab,tabVal,key)
{
	var mlaInterval = setInterval(function(){
		var tabIDs = ["","submissiontab","planningtab", "approvaltab", "taskDetails", "reviewtab", "closetab"]; // No I18N
		var selectedTabIndex = tabIDs.indexOf(selectedTab);
		if(jQuery("#approvalLevelsStage"+selectedTabIndex).length > 0){
			var stageIndex = { "Submission":1, "Planning":2, "Approval":3, "Implementation":4, "Review":5, "Close":6 };	 // No I18N
			var stageId = stageIds[tabVal];
			var isCompletedStage = false;
			var currentStageIndex = -1;
				jQuery.each(stageIds, function(stageName, stage_id){
					if(stage_id == globalCurrentStageId){
						currentStageIndex = stageIndex[stageName];
					}
				});
			if(currentStageIndex > selectedTabIndex || (selectedTabIndex == 6 && (globalCurrentStatusId == closeCompletedId || globalCurrentStatusId == closeCancelledId))){
				isCompletedStage = true;
			}
			if(stageId==globalCurrentStageId){
				isCurrentStage=true;
			}else{
				isCurrentStage=false;
			}
			if(selectedTabIndex != -1){
				var changeIframe = jQuery("iframe[name='ChangeFrame']").contents();
				var ChangeStatusFrame = jQuery("iframe[name='ChangeStatusFrame']").contents();
				var editLevel = jQuery("#"+selectedTab+"_edit").length > 0 ? jQuery("#"+selectedTab+"_edit").val() : changeIframe.find("#"+selectedTab+"_edit").length > 0 ? changeIframe.find("#"+selectedTab+"_edit").val() : ChangeStatusFrame.find("#"+selectedTab+"_edit").val(); // No I18N
				var approveLevel =  jQuery("#"+selectedTab+"_approve").length > 0 ? jQuery("#"+selectedTab+"_approve").val() : changeIframe.find("#"+selectedTab+"_approve").length > 0 ? changeIframe.find("#"+selectedTab+"_approve").val() : ChangeStatusFrame.find("#"+selectedTab+"_approve").val(); // No I18N
				var wfId=jQuery("[name='WORKFLOWID']").val();
				//Restricting approval addition in case a workflow is configured
				var approvalRestricted=wfId && wfId!="null";// No I18N
				if(isAllowedUserAsApprover){
					var params = {entity_name: "changes", "changeId":parent.CHANGEID,"stageId" : stageId, "contentHolderId" : "approvalLevelsStage"+selectedTabIndex,"isCurrentStage":isCurrentStage,"key":key,"stageIds":stageIds, "edit":editLevel, "approve" : editLevel || approveLevel, isCompletedStage : isCompletedStage,approvalRestricted:approvalRestricted, isNonLogin: isNonLoginUser}; // No I18N
					parent.approvalStage = new MLAComponent(params);
				}else{
				var params = {entity_name: "changes", "changeId":parent.CHANGEID,"stageId" : stageId, "contentHolderId" : "approvalLevelsStage"+selectedTabIndex,"isCurrentStage":isCurrentStage,"key":key,"stageIds":stageIds, "edit":editLevel, "approve" : approveLevel, isCompletedStage : isCompletedStage,approvalRestricted:approvalRestricted, isNonLogin: isNonLoginUser}; // No I18N
					parent.approvalStage = new MLAComponent(params);
			}

			}
			var hasApprovals=jQuery('#approvalLevelsStage'+stageId).find('[id^="approvalStage'+stageId+'_"]').length;
			if(wfId=="null" || stagesWithApproval.contains(stageId) || hasApprovals)
			{//Only when there is no workflow or when the associated workflow has approval(s) in the stage (or) when the stage has manually added approvals,
			//approval section will be shown
				jQuery("#approvalSection"+stageId).show()
			}

			clearInterval(mlaInterval);
		}
	},500);
}

function updateChangeListView(id, from) {

	 var newVal;
	if(id.indexOf(":")!=-1) {
		var res= id.split(":");
		newVal= "&FILTERID=" + encodeURIComponent(res[0]) + "&TYPE=" + encodeURIComponent(res[1]) + "&CHANGED=true"; // No I18N
	} else {
		newVal= "&FILTERID=" + encodeURIComponent(id) + "&CHANGED=true"; // No I18N
	}

	if(getState(getPortalViewName("ChangesList"),"CATEGORYID") != null) { newVal = newVal + "&CATEGORYID=" + getState(getPortalViewName("ChangesList"),"CATEGORYID"); }// No I18N

	if(from != null) {	newVal = newVal + "&FROM=" + from; 	}	// No I18N

	if(isMSP){ 	        newVal = newVal + "&persistAccountID=false"; 	}	// No I18N

	var projectid = document.getElementById('PROJECTID');
	var initiatedBy = document.getElementById('initiatedBy');

	if( projectid != null && initiatedBy != null ){	newVal = newVal + "&PROJECTID=" + projectid.value + "&initiatedBy=" + initiatedBy.value;	}	// No I18N


	updateState(getPortalViewName("ChangesList"),"_D_RP", newVal); // No I18N
	refreshSubView(getPortalViewName("ChangesList")); // No I18N
	// This check is required because this method will be called from places where TYPE will not be available. Eg. Associate to Incident to Change screens
	if(document.ChangeActions != null) {
		document.ChangeActions.TYPE.value = type;
		if(document.ChangeActions_BOT != null) {
			document.ChangeActions_BOT.TYPE.value = type;
		}
	}
}

function filterChangeListView(id,load)
{
	var disText = jQuery(".cb[value="+id+"]").closest('li').find("[data-filter-content='item']").html();
	navparamId = id;
	if((sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") || load == 'onload') {/*Change Classic view and page url with 'FILTERID' to set filter id*/
		if (id === 'trashed_changes') {
			table_tech_changes.t_obj.table_info.list_info.filter_by = {"name": "trashed_changes"}; //No i18n
			table_tech_changes.refreshTable();
			window.history.pushState({"/Changes.cc":"/Changes.cc"}, '', "/Changes.cc?trashView=true");
		}
		else {
		sdpAjax({
			type: "PUT", //No I18N
			url: 'api/v3/changes/set_filter?id='+id, //No I18N
			async:false,
			success: function(data) {
				jQuery("#listview_btn").attr("title", e_attr(disText)); //No I18N
				jQuery("#ListProListHdr").html(e_html(disText)); //No I18N
				if(load != 'onload') {
					table_tech_changes.t_obj.table_info.list_info.filter_by = {"id": id}; //No i18n
					table_tech_changes.refreshTable();
					window.history.pushState({"/Changes.cc":"/Changes.cc"}, '', "/Changes.cc");
				}
			}
		});
		}
	} else {/*Change Table view*/
		updateChangeListView(id);
		document.getElementById("ListProListHdr").innerHTML = disText;
	}
	if (id === 'trashed_changes') {
		var trashTitle = getMessageForKey("filter.trashed.changes");
		jQuery("#listview_btn").attr("title", e_attr(trashTitle)); //No I18N
		jQuery("#ListProListHdr").html(e_html(trashTitle)); //No I18N
		window.history.pushState({"/Changes.cc":"/Changes.cc"}, '', "/Changes.cc?trashView=true");
	}
	else {
		window.history.pushState({"/Changes.cc":"/Changes.cc"}, '', "/Changes.cc");
	}
}
function selectChangeView(selectObj, type) {
	var options =  selectObj.options;
	if(type == "Search")
	{
		jQuery("div#ListViewFilterMenu").find("#ProListHdr").html("<nobr>" + getMessageForKey("sdp.leftpanel.search.title") + "</nobr><span class='dd'><strong class='caret m0'></strong></span>");//NO I18N
	}
	for(var i=0; i<options.length;i++) {
		if(options[i].value == type) {
			options[i].selected = true;
			if(document.getElementById("ProListHdr") != null) {
				jQuery("div#ListViewFilterMenu").find("#ProListHdr").html("<nobr>" + encodeHTML(options[i].text) + "</nobr><span class='dd'><strong class='caret m0'></strong></span>");//NO I18N
			}
		}
	}
}

function changesBulkOperation(type, selectListId, singleRow) {
	var formObj = document.ChangeListForm;
	var selVals = getSelectedCheckBoxes(document.ChangeListForm);
	if (sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {
		var selectedtabl = table_tech_changes.bulkSelect.selectedRecords;
		selVals=Object.keys(selectedtabl);
	}
	if(singleRow) {/*Change Classic view single change operation*/
		var selectListIdarr = [];
		selectListIdarr.push(selectListId);
		selVals = selectListIdarr;
	}
	if(selVals.length == 0) {
		if(type == "DELETE") {
			alert(getMessageForKey("sdp.change.listview.changestodelete"));
		}
		else if (type === "RESTORE") {
			alert(getMessageForKey("change.listview.changestorestore"));
		}
		else if(type == "ASSIGN") {
			alert(getMessageForKey("sdp.change.listview.changestoassign"))
		}
		else if(type == "PICKUP") {
			alert(getMessageForKey("sdp.change.listview.changestopickup"))
		}else if(type == "CLOSE") { //No I18N
			alert(getMessageForKey("change.listview.changestoclose"));
		}
		return;
	}
	var url = "/change/ChangeListBulkOperations.jsp?TYPE=" + type+"&Module=Change"; // No I18N
	if(type == "DELETE") {
		if(document.getElementById('cancelAssocDiv'))
		{
			document.getElementById('cancelAssocDiv').style.display = (navparamId === 'trashed_changes') ? "none" : "block";
		}
		showDialog(jQuery('#deleteEntitydiv').html(),'closeButton=no, position=absmiddle');		// No I18N
		document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-0"]').addEventListener('mousedown', function(event) {// No I18N
        			captureDialog(event);
        		});

        document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-1"]').addEventListener('click', function(event) {// No I18N
            deleteEntity('change', null, true);// No I18N
        });

       document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-DeleteEntityDialogue-2"]').addEventListener('click', function(event) {// No I18N
        			closeDialog();
        		});
		return;
	}
	if(type == "CLOSE") {
		var ids = "";
		var selValLength=selVals.length;
		for(var i = 0; i < selValLength; i++) {
			ids = ids + encodeURIComponent(selVals[i]) + ((i === selValLength - 1) ? '' : ',');
		}
		var closeDialogHTML = `
                <div id="change_bulkclose_container" class="disp-h" >
                    <div id="closedetail-attachment"></div>
                </div>
            `;
        jQuery('#CHG_BULK_CLOSE').after(closeDialogHTML);
		/*Initialize ChangeBulkClose class */
		if(ids.length > 0) {
			var changeBulkClose = new ChangeBulkClose({"ids": ids});//No I18N
			changeBulkClose.initialize();
		}
        /* Initialize jQuery dialog where bulk close form is rendered */
		let bulkClosePopupOpt = {
			title: translate("change.listview.bulkclose"),//NO I18N
			width:'950px',//No I18N
			height: jQuery(window).height(),
			closeOnEscKey: true,
            maximizable: true,
			resizable: {

				directions: "w" ,//No I18N
				minWidth: 920

			},
			animation:{
				open:{
					className:'zeffects--slideright', //No I18N
					duration:300
				}
			},
			position: {
				right: "0px", //No I18N
				top: "0px" //No I18N
			},
			draggable: false
		 }
		 if(sdp_user.DIRECTION == "RTL"){ //No I18N
			bulkClosePopupOpt.position = {
			  left: "0px", //No I18N
			   top:"0px" //No I18N
			};
			bulkClosePopupOpt.resizable = {
			   directions: "e" , //No I18N
			   minWidth: 920
			};
			bulkClosePopupOpt.animation={
			 open:{
				className:'zeffects--slideleft', //No I18N
				duration: 300
			 }
			}
		  }
		jQuery('#change_bulkclose_container').sdp_zcomponent_dialog(bulkClosePopupOpt);

		return;
	}
	if (type === "RESTORE") {
		showDialog(jQuery('#restoreChangeDiv').html(),'closeButton=no, position=absmiddle',function(){// No I18N
			let dialogDiv=document.getElementById('_DIALOG_CONTENT');
			dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-0"]').addEventListener("mousedown", function(event) { captureDialog(event) });// No I18N
			let element=dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-1"]');// No I18N
			
			if(element)
			{
				element.addEventListener("click", function(event) { restoreBulk() });// No I18N
			}
			let element2=dialogDiv.querySelector('[sdpJs="js-event-RestoreChangeDialogue-2"]')// No I18N
			
			if(element2)
			{
				element2.addEventListener("click", function(event) { restoreChange() });// No I18N
			}
			
			dialogDiv.querySelector('#restoreDialog_Cancel').addEventListener("click", function(event) { closeDialog(); });

		});
		return;
	}
	for(var i = 0; i < selVals.length; i++) {
		url = url + "&CHANGEID=" + encodeURIComponent(selVals[i]); // No I18N
	}
	if(type == "ASSIGN") {
		var list = $('TechList'); // No I18N
		if(selectListId != null) {
			list = $(selectListId);
		}
		//var options = document.getElementById('TechList').options;
		if(list.value == -1) {
			alert(getMessageForKey("sdp.change.listview.selecttech"));
			return;
		}
		url = url + "&TECHID=" + encodeURIComponent(list.value); // No I18N
	}


    jQuery('body').append('<form action='+url+ "&" + (new Date()).getTime()+' target='+frames.ChangeFrame.name+' method="post" id="IframePostForm" ></form>');
    jQuery('#IframePostForm').append('<input type="hidden" name='+getCSRFParamName()+' value='+getCSRFParamValue()+' />');
    jQuery('#IframePostForm').submit().remove();

	//invokeProgressIndicator(null,'sdp.common.processing'); // No I18N
	if(isMSP){
		jQuery('#Right-Section select').each(function(){
              var selectid=jQuery(this).attr('id'); // No I18N
               if(!(selectid!= null && selectid=="__persistentAccountId__select")){ // No I18N
              	jQuery(this).select2('val',-1); // No I18N
              }
			});

	}
	else{
	jQuery('#Right-Section select').select2('val',-1); // No I18N
	}
	if(sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {/*Change Classic view*/
		setTimeout(function(){/*Change classic listview table refresh*/
			if(table_tech_changes != null && table_tech_changes != undefined) {
				table_tech_changes.refreshTable();
			}
		},200);
	}
}
function changesBulkDelete() {
    var formObj = document.ChangeListForm;
    var selVals = getSelectedCheckBoxes(document.ChangeListForm);
	if(sdp_user.CLIENT_CONF.changelistview != undefined && sdp_user.CLIENT_CONF.changelistview.current_view_mode == "classic") {/*Change Classic view single delete event*/
		if(jQuery('#delEntityid').val() != '') {
			var selectListIdarr = [];
			selectListIdarr.push(jQuery('#delEntityid').val());
			jQuery('#delEntityid').val('');
			selVals = selectListIdarr;
		} else {
			var selectedtabl = table_tech_changes.bulkSelect.selectedRecords;
			selVals=Object.keys(selectedtabl);
		}
	}
	var url;
	var data;
	var succMsg;
	if ('trashed_changes' === navparamId) {
		url = "/api/v3/changes?ids="; //NO I18N
		succMsg = "changes.delete.permanently";//NO I18N
        }
	else {
		url = "/api/v3/changes/move_to_trash?ids="; //NO I18N
		if(jQuery("#cancelAssocChildEntity:checked").length > 0) {
			data = {"cancel_associated_projects": true}    // No I18N
		} else {
			data = {"cancel_associated_projects": false}   // No I18N
        }
		succMsg = "changes.moved.trash";//NO I18N
    }
	var ids = "";
	var selValLength=selVals.length;
	for(var i = 0; i < selValLength; i++) {
		ids = ids + encodeURIComponent(selVals[i]) + ((i === selValLength - 1) ? '' : ',');
    }
	url = url + ids;

    //invokeProgressIndicator(null,'sdp.common.processing'); // No I18N
	restoreOrDeleteAjaxChangeApi(succMsg, url,"DELETE",true,data); // No I18N
}

function associateToChange(entityId,module) {

	var formObj = document.ChangeListForm;
	var selVals = null;
	var params="";
	var elems = formObj.elements;
	for(var i = 0; i < elems.length; i++) {
		if(elems[i].type == "radio" && elems[i].name == "checkbox") {
			if(elems[i].checked) {
				selVals = elems[i].value;
			}
		}
	}
	if(selVals == null) {
		alert(getMessageForKey("sdp.change.error.selectone"));
		return false;
	}
	var url = "/servlet/CmClientUtilServlet"; // No I18N
	/* Incident By Change starts */
	if(module != null && module != "null") {  // No I18N
		if(module == 'Request')
		{
			params="command=associateIncidents&ASSOCIATE=true&FROMREQUESTPAGE=true&WORKORDERID=" + encodeURIComponent(entityId); // No I18N
		}
		else if(module == 'RequestCausedByChange')
		{
			params="command=associateIncidents&ASSOCIATE=true&FROMREQUESTPAGE=true&REQUESTTYPE=CausedByChange&WORKORDERID=" + encodeURIComponent(entityId); // No I18N
		}
		else if(module == 'Problem')
		{
			url='api/v3/problems/'+entityId+'/associated_change';// No I18N
			params=sdpAjaxInputData({associated_change:{change:{id:selVals}}});
		}
	}
	/* Incident By Change ends */
	if(module!='Problem')
	params = params + "&CHANGEID=" + selVals+ "&" + (new Date()).getTime(); // No I18N

	sdpAjax({
		url: url,
		type: "post", // No I18N
		data: params,
		success: function(response)
		{
			if(module == 'Problem'){
				if(response.response_status.status=='success'){
					window.opener.$problemDetails.refreshRightSectionProperties('associations');// No I18N
					window.close();
				}
			}
			if(response.status=='success')
			{
				window.close();
				window.opener.showChangeDialog(entityId);
			}
			else if(response.status=='failed' && response.message){
				showalert("failure", e_html(response.message), "isAutoHide=false"); //No I18N
			}
		}
	});
	//TODO: to get details on it..will refix
	return false;
}

function addUsersForChangeNotification(notName) {
	var mode = 'add'; // No I18N
	var values, ids, url;
	if(notName == "ChangeClosed") {
		values = document.ChangeNotForm.ChangeClosed_UserDisplay.value;
		ids = document.ChangeNotForm.ChangeClosed_USERS.value;
		url = '/SearchItem.do?criteria=Technician Name&element1=document.ChangeNotForm.ChangeClosed_UserDisplay&element2=document.ChangeNotForm.ChangeClosed_USERS&from=escalate&type=Change'; // No I18N
	}
	else if(notName == "ChangeCreated") {
		document.ChangeNotForm.ChangeCreated_UserDisplay.value;
		ids = document.ChangeNotForm.ChangeCreated_USERS.value;
		url = '/SearchItem.do?criteria=Technician Name&element1=document.ChangeNotForm.ChangeCreated_UserDisplay&element2=document.ChangeNotForm.ChangeCreated_USERS&from=escalate&type=Change'; // No I18N
	}
	if(values!=null && values!='' && ids!=null && ids!='')
	{
		mode = 'edit'; // No I18N
	}
	if(isMSP){
  	        url = url + '&WF_ACCOUNTID=0&WFfromNotificationRulesPage=MSPtrue';      // No i18n
  	}
	url = url + '&mode=' + mode; // No I18N

	NewWindow(url,'selectitem','320','350','yes','center'); // No I18N
}

function checkChangeNotifications(formObj) {
	if(formObj.ChangeCreated.checked == true || formObj.ChangeCreated_SMS.checked == true) {
		if(formObj.ChangeCreated_USERS.value == "" && formObj.ChangeCreated_SMS_USERS.value == "") {
			alert(getMessageForKey("sdp.admin.changenotification.techchoose.newchange.js"));
			return false;
		}
		else if (formObj.ChangeCreated_USERS.value == "") {
			formObj.ChangeCreated_USERS.value = formObj.ChangeCreated_SMS_USERS.value;

		}
		else {
			formObj.ChangeCreated_SMS_USERS.value = formObj.ChangeCreated_USERS.value;
		}
	}
	if(formObj.ChangeCreated_SMS.checked == true) {
		formObj.ChangeCreated_SMS_USERS.value = formObj.ChangeCreated_USERS.value
			formObj.ChangeCreated_SMS_UserDisplay.value = formObj.ChangeCreated_UserDisplay.value
	}
	if(formObj.ChangeClosed.checked == true) {
		if(formObj.ChangeClosed_USERS.value == "") {
			alert(getMessageForKey("sdp.admin.changenotification.techchoose.changeclosed.js"));
			return false;
		}
	}

	invokeProgressIndicator(null, "sdp.common.processing"); // No I18N
	formObj.submit();
}

function cabBulkOperation(type) {

	    var formObj = document.CABListForm;
	    var selVals = getSelectedCheckBoxes(document.CABListForm);
	    if(selVals.length == 0) {
	        alert(getMessageForKey("sdp.setup.cab.selectone"));
	        return;
	    }
	    if(type == "DELETE") {
	        var result = confirm(getMessageForKey("sdp.setup.cab.confirm"));
	        if(!result) {
	            return;
	        }
	    }
	    invokeProgressIndicator(null, "sdp.change.delete.cab"); // No I18N

	    var url = "SetUpWizard.do?forwardTo=cab"; //No I18N

	    var method="POST"; //No I18N
	    var form = document.createElement("form");
	    form.setAttribute("method", method);
	    form.setAttribute("action", url);

	    var typeElement = document.createElement("input");

	    typeElement.setAttribute("type", "hidden");
	    typeElement.setAttribute("name", "TYPE");
	    typeElement.setAttribute("value", encodeURIComponent(type));

	    form.appendChild(typeElement);


	    var valuesElement = document.createElement("input");

	    valuesElement.setAttribute("type", "text");
	    valuesElement.setAttribute("name", "CONFIGID");
	    valuesElement.setAttribute("value",  selVals);
	    form.appendChild(valuesElement);

	    var csrfElement = document.createElement("input");
	    csrfElement.setAttribute("type","hidden");
	    csrfElement.setAttribute("name", getCSRFParamName());
	    csrfElement.setAttribute("value", getCSRFParamValue());
	    form.appendChild(csrfElement);

	    document.body.appendChild(form);

	    form.submit();
	    return;
}

//JQuery Validator custom rule to ensure that 0 should not be considered as a value during mandatory fields validation
jQuery.validator.addMethod("SelectNonZero", function(value, element){//No I18N
		return (value != '0');
	}, '');


function showChangeTab(selectedTab, month, year,vieSel){
	/* Issue fix SD-93249 Starts*/
	var JQBody = jQuery('body'); // No I18N
	if(selectedTab=='ListView'){
		JQBody.addClass('changelistview'); // No I18N
	}
	else if(selectedTab == 'CalendarView'){
		JQBody.removeClass('changelistview'); // No I18N
	}
	/* Issue fix SD-93249 Ends*/
	var tabs = new Array("ListView", "CalendarView"); // No I18N
	for(var i = 0; i < tabs.length; i++) {
		var tabName = tabs[i];
		if(tabName == selectedTab) {
			document.getElementById(tabName).className = "show"; // No I18N
	//		document.getElementById(tabName + "_tab").className = "subtabon"; // No I18N
		}
		else {
			document.getElementById(tabName).className = "hide"; // No I18N
	//		document.getElementById(tabName + "_tab").className = "subtaboff"; // No I18N
		}

		if( jQuery('body').find('#CalendarView').is(":visible") ){
			      jQuery('body').css('overflow', ''); //NO I18N
			    }
	    else{
	    	jQuery('body').css('overflow', 'hidden'); //NO I18N
	    }
	}
	var param = "viewType=" + encodeURIComponent(selectedTab) + "&" + (new Date()).getTime() ;// No I18N
	var myAjax = new Ajax.Request("/calendar/SaveColorSelection.jsp", {
			method: 'post',// No I18N
			parameters: param // No I18N
		});

	var url = null;
	if(selectedTab == "CalendarView") {
		url = "/calendar/ChangeCalendar.jsp?Module=Change"; // No I18N
		if(month != null && month != 'null') {
			url = url + "&month=" + month; // No I18N
		}
		if(year != null && year != 'null') {
			url = url + "&year=" + year; // No I18N
		}
		if(vieSel != null && vieSel != 'null') {
			url = url + "&FILTERID=" + vieSel; // No I18N
		}

		//tooltip get current text of div for tooltip
		setTimeout(function() {
			calMonthWeek.calviewMonthFooter();
		},400)
		//Issue fix SD-92570
		jQuery('body').css('overflow-x','hidden'); // No I18N
	}
	else {
		//Issue fix SD-92570
		jQuery(window).scrollTop('0px'); // No I18N
		changeCalendar.emptyCalView();
		//CODE REVAMP :This set of code across the files can be removed if the div's constructed for displaying change(as stripes) in calendar view is moved to calendar div
		//instead of appending it to the document
		var divObjs = parent.document.getElementsByTagName("div");
		var tobeDeleted = new Array();
		for(var i=0; i<divObjs.length; i++) {
			if(divObjs[i].id.indexOf("ElementMark") >= 0 || divObjs[i].id.indexOf("More_") >= 0) {
				tobeDeleted.push(divObjs[i]);
			}
		}
		for(var j=0; j<tobeDeleted.length;j++){
			parent.document.body.removeChild(tobeDeleted[j]);
		}
	}
	if(url != null) {
		window.frames.ChangeFrame.location.href = url + "&" + (new Date()).getTime(); // No I18N
	}
}
function updateAssetChgView(obj)
{

	updateState(getPortalViewName("ChangesForAsset"),"TYPE",obj.value);
	refreshSubView(getPortalViewName("ChangesForAsset"));
}

/* Incident By Change starts */
function showChangeDialog(woId,archive)
{
	if(archive != null)
	{
		showURLInDialog('/workorder/ArchiveWOChangeIncident.jsp?workorderID=' + woId + "&" + (new Date()).getTime(),' title=' + getMessageForKey('sdp.requests.changedialog.RelatedLink'));  // NO I18N
	} else {
		showURLInDialog('/workorder/ViewWOChangeIncident.jsp?workorderID=' + woId + "&" + (new Date()).getTime(),' title=' + getMessageForKey('sdp.requests.changedialog.RelatedLink'));  // NO I18N
	}
}
/* Incident By Change ends */



/*function updateEffect(trId)
  {
  if(trId != null)
  {
  new Effect.ScrollTo(trId.id);
  new Effect.Highlight(trId, { startcolor: "#FDFFD1",duration: 3.15 });//NO I18N
  }
  }*/
function updateEffect(trId, all)
{
	var startColor = "#FFF380",	//NO I18N
		endColor = "#FFFFFF";	//NO I18N
	if(isDark()){
		startColor = "#254312";	//NO I18N
		endColor = "#121212";	//NO I18N
	}
    if(trId!=null && ( all!=null && all) )
    {
	new Effect.ScrollTo(trId.id);
	new Effect.Highlight(trId, { startcolor: startColor, endcolor: endColor, duration: 3.15 });
    }
    else if(trId != null)
    {
	new Effect.ScrollTo(trId.id);
	for(var j=0;j<trId.childNodes.length;j++)
	{
	    if( trId.childNodes.item(j).nodeType == 1 )
	    {
		new Effect.Highlight(trId.childNodes.item(j), { startcolor: startColor, endcolor: endColor, duration: 3.15 });
	    }
	}
    }
}

/*
 *  Defining CategoryCM Model- Constructor
 * The JSON model (java object ) is passed as String, which will inturn be converted to JSON - javascript object
 * */
function CategoryCMModel(modelAsString) {

    //if(JSON.parse(modelAsString))
    //{
	//this.categCMJson = JSON.parse(modelAsString) ;
    //}
    try{
    	this.categCMJson = JSON.parse(modelAsString);
	}
	catch(err){
		this.categCMJson = modelAsString;
	}
}

/*
 * The function will return CM ID for a given Category id. CM ID is picked up from the JSON format {catId: [CMID]}
 * */
CategoryCMModel.prototype = {
getCMListForCategory: function(catId) {

			  if(this.categCMJson[catId]){
			      return this.categCMJson[catId];
			  }
			  else {
			      return "";
			  }
		      }
}

//global variable change_lastCategory to keep track of the previous value of category in onCategoryChange() method
var change_lastCategory = 0;








/*
 * The model holds JSON  as {stageID,[StatusArray] }
 */
function StageStatusModel(sgString)
{

    //if(JSON.parse(sgString))
    //{
	//this.list = JSON.parse(sgString) ;
    //}
    try{
		this.list = JSON.parse(sgString);
	}
	catch(err){
		this.list = sgString;
	}

}

//Change Scripts - For Effects START

function changeStatusMenu(val)
{
	var j;
    if(val != null)
    {
	j = window.parent.jQuery;
    }
    else
    {
	j = jQuery;
    }
    //      j(" #statusList ul ").css({display: "none"});//no i18n
    if (j("ul[id='statusList']:visible li").hasClass('.disable-opacity3'))
    {
	j('a.one').removeAttr('href').removeAttr('style');//NO I18N
    }
    j("ul[id='statusList']:visible li:not('.disable-opacity3') table").on('mouseenter', //no i18n
	 function()
	 {
	 j("ul[id='statusList']:visible li:first i").css({background: "url(/images/change-statusbox-select.png) no-repeat"}); //No I18N
	 j("ul[id='statusList']:visible li:first").children('ul:first').css({visibility: "visible",display: "none"}).show(400); // No I18N
	 j("ul[id='statusList']:visible li li").hover// No I18N
	 (                               function()
					 {
					 j("ul[id='statusList']:visible li:first i").css({background: "url(/images/change-statusbox-select.png) no-repeat"}); //No I18N
					 j(this).find('ul:first').css({visibility: "visible",display: "none"}).show(400); //No I18N
					 },
					 function(){
					 j("ul[id='statusList']:visible li:first i").css({background: "url(/images/change-statusbox-arrow.gif) no-repeat"}); //No I18N
					 j(this).find('ul:first').css({visibility: "hidden"}); //No I18N
					 }
	 );
	 }
	);
    j("ul[id='statusList']:visible li:first").on('mouseleave',// No I18N
	 function()
	 {
	 j("ul[id='statusList']:visible li:first").find('ul').css({visibility: "hidden"}); //No I18N
	 j("ul[id='statusList']:visible li").hover// No I18N
	 (
	  function()
	  {
	  },
	  function()
	  {
	  }
	 );
	 }
	);
}

//TODO: Not to hit the DB to show the content which is already in a hidden div.. Fix it. Applicable for Planning tab fields too..

function isHtmlAreaEmpty()
{
	//striptag content after checking img tag
	//contains method is replaced with indexof (due to IE not supported contains method)
	if(parent.editor._editor.getHTML().indexOf("img") != -1)
	{
		return false;

	}
	else
	{
	var string = parent.editor._editor.getHTML().stripTags();
	string      = string.replace(/<br \/>/g,"\n"); // No I18N
	string      = string.replace(/<br>/g,"\n"); // No I18N
    string      = string.replace(/<\/p>/g,""); // No I18N
    string      = string.replace(/<p>/g,"\n\n"); // No I18N
    //string    = string.replace(/(<([^>]+)>)/g,""); // No I18N
    string      = string.replace(/&lt;/g,"<"); // No I18N
    string      = string.replace(/&gt;/g,">"); // No I18N
    string      = string.replace(/&nbsp;/g,""); // No I18N
    string      = string.replace(/^\s*|\s*$/g, "");  // No I18N*/

	if(jQuery.trim(string) == ""){
		    return true;
    }
    else {
	        return false;
    }
	}
}

//Change Scripts - For Effects  END -->

function showNotificationDetails(notificationDetails)
{
	//If notificationdetails is empty ,then show "status updated successfully" message.
	if(!notificationDetails)
	{
			invokeProgressIndicator(null, getMessageForKey("sdp.common.processing"));
			showSuccessMessageAndClose(null,getMessageForKey("sdp.changedetails.status.updatesuccess.msg"),3000);
			return;
	}
	var type,text,lineNumber = 0;
	var messages=[];
	var title = getMessageForKey("sdp.change.notification.details.title");
	// For each stage-status
	jQuery.each(notificationDetails,function(stageStatus,map){

		lineNumber = lineNumber+1;
		// Initialize failureRoles, successRoles and failureUsers arrays.
		var failureRoles = new Array();
		var failureUsers = new Array();
		// Set successRoles as the keys of successMap
		var successRoles = Object.keys(map.successMap);
		for(var i = 0 ; i < successRoles.length ; i++)
		{
			if(parent.sdp_user.DIRECTION == "RTL")
			{
				successRoles[i] = successRoles[i]+" ";
			}
			else
			{
				successRoles[i] = " "+successRoles[i];
			}
		}
		// To make sure there are no duplicates in failureUsers list, use a failureUserSet map and then retrieve its keys as failureUsers array.
		var failureUsersSet = {};

		// In failureMap, for each role
		jQuery.each(map.failureMap,function(role,userList){
			// If userList for this role is null or empty, add the role to failureRoles list.(No users have been configured for this role, So the role is not notified)
			if(userList == null || userList.size() == 0)
			{
				if(parent.sdp_user.DIRECTION == "RTL")
				{
					failureRoles.push(role+" ");
				}
				else
				{
					failureRoles.push(" "+role);
				}
			}
			// else,
			else
			{
				// add all the users to failureUsersSet as keys (will make sure there are no duplicates)
				jQuery.each(userList, function(index,user){
					if(parent.sdp_user.DIRECTION == "RTL")
					{
						failureUsersSet[user+" "] =null;
					}
					else
					{
						failureUsersSet[" "+user] =null;
					}
				});
			}
		});
		// get failureUsers list from the failureUsersSet's keys
		failureUsers = Object.keys(failureUsersSet);

		var failLine = "", succLine="";
		if(successRoles && successRoles.size() > 0)
		{
			if(lineNumber == 1)
			{
				succLine = getMessageForKey("sdp.change.notification.details.type2",new Array(stageStatus,successRoles.toString()));	//No I18N
			}
			else
			{
				succLine = getMessageForKey("sdp.change.notification.details.type2wf",new Array(stageStatus,successRoles.toString()));	//No I18N
			}
		}
		else
		{
			if(lineNumber == 1)
			{
				succLine = getMessageForKey("sdp.change.notification.details.type1",new Array(stageStatus));	//No I18N
			}
			else
			{
				succLine = getMessageForKey("sdp.change.notification.details.type1wf",new Array(stageStatus,successRoles.toString()));	//No I18N
			}
		}
		if(failureRoles && failureRoles.size() > 0 && failureUsers && failureUsers.size() > 0)
		{
			failLine = getMessageForKey("sdp.change.notification.details.type5",new Array(failureUsers.toString(),failureRoles.toString()));	//No I18N
		}
		else if(failureUsers && failureUsers.size() > 0)
		{
			failLine = getMessageForKey("sdp.change.notification.details.type3",new Array(failureUsers.toString()));	//No I18N
		}
		else if(failureRoles && failureRoles.size() > 0)
		{
				failLine = getMessageForKey("sdp.change.notification.details.type4",new Array(failureRoles.toString()));	//No I18N
		}
		if(succLine != "")
		{
			messages.push({'type' : "success", 'text' : succLine});	//No I18N
		}
		if(failLine != "")
		{
			messages.push({'type' : "failure", 'text' : failLine});	//No I18N
		}
	});

	var param = {'messages' : messages, 'title' : title};	//No I18N
	showNewDialog(param,850,210);
}


function successHdlrForUpdateChangeStatus(result)
{
	notificationDetails = result.notificationDetails;

    if(result.status == "success")
    {
	var wfId = result.wfId;
	var userId = result.userId;
	var key = result.key;
	var changeId = result.changeId;

	var currentStatusName = result.currentStatusName;
	var currentStageName = result.currentStageName;
	var currentStatusId = result.currentStatusId;
	var currentStageId = result.currentStageId;

	var newStatusName = result.newStatusName;
	var newStageName = result.newStageName;
	var newStatusId = result.newStatusId;
	var newStageId = result.newStageId;
	globalCurrentStageId=newStageId;
	globalCurrentStatusId=currentStatusId;

	var tabName = "";
	var spanid = "statusName_"+currentStageId;//NO I18N
	if(currentStatusName.length>26)
	{
		currentStatusName = currentStatusName.truncate('26','...');
	}
	jQuery("span[id='"+spanid+"']:visible").text(currentStatusName);
	jQuery("#statusName_"+result.currentStageId).text(currentStatusName);
	if(newStageId != "" && newStatusId !="")
	{
	    tabName = newStageName.toLowerCase()+"tab";//NO I18N
	    //TODO: check with gayathiri.. need of this call
	    //changeActionLink(changeId);
		if(newStageName == "Implementation")
		{
			jQuery("#openedstage").val("taskDetails");//NO I18N
		}
		else
		{
			jQuery("#openedstage").val(newStageName);
		}
	}
	else
	{
	    tabName = currentStageName.toLowerCase()+"tab";//NO I18N
	    //TODO:: Check and unccoment: Do we really need to reload action menu bar on status update within a stage..
    }

	//modified to fix invoking update status if same status  of change status is selected/clicked again
	//      if(currrentStageId != newStageId && newStageId != "")
	//      {
	if((currentStageId == "1" && newStageId== "") || (newStageId == "1"))
	{
	    changeSubmissionTab(userId,key,true);
	    hideStatusComments("1");//NO I18N
	}
	else
	{
	    if(tabName == "implementationtab")
	    {
		tabName = "taskDetails";//NO I18N
	    }
	    changeChangeTab(tabName,null,null,userId,key,true, null);
	}

	//      }
	//setTimeout(function(){parent.closeProgressIndicator(getMessageForKey("sdp.changedetails.status.updatesuccess.msg"),true)},700);
	parent.closeDialog();
	showNotificationDetails(notificationDetails);
	}
    else //On failure
    {
    	var errormsg={};
    	errormsg.title=getMessageForKey("sdp.changedetails.status.updatefailure.title");
    	errormsg.messages=[];
    	errormsg.messages.push({
    		type:'failure', //NO I18N
    		text:result.msg
    	});
    	showNewDialog(errormsg,850,210)
    }

}

function changeSubmissionTab(userId,key,isCurrentStage)
{

    var sUrl  = null;
    if( key==null || key=='null')
    {
    	sUrl = "/ChangeDetails.do?mode=changeSubmnTab&CHANGEID=" + encodeURIComponent(parent.CHANGEID)+ "&tab=Submission"; //No I18N
    	if(parent.SITEID != null && parent.SITEID != 'null')
        {
        	sUrl = sUrl + "&CHGSITEID=" + encodeURIComponent(parent.SITEID);// No I18N
        }
        if(parent.GROUPID != null && parent.GROUPID != 'null')
        {
    	  	sUrl = sUrl + "&CHGGROUPID="+parent.GROUPID;// No I18N
    	}
    }
    else
    {
	sUrl ="/sd/ChangeDetails.sd?USERID="+encodeURIComponent(userId) + "&KEY=" + encodeURIComponent(key) + "&mode=changeSubmnTab&CHANGEID=" + encodeURIComponent(parent.CHANGEID)+"&tab=Submission";// No I18N
    }

    window.frames['ChangeSubmissionFrame'].location.href = sUrl + "&" + (new Date()).getTime() + "&SUBREQUEST=true";//NO I18N
    changeChangeTab('submissiontab',null,null,userId,key,isCurrentStage, null);//NO I18N
}

function recommendChange(appid,userId,key,mode,portalId,changeid,approvalId,approvalLevelId)
{
    var approveElementId = "approve";	// No I18N
    var rejectElementId = "reject";	// No I18N
    var approvalCommetsId = "APPVLCOMMENTS";	// No I18N
    var recommend = document.getElementById(approveElementId).getAttribute("isSelected");
    var action = "Approve"; // No I18N
    if(recommend!=undefined &&  recommend !=null && recommend !="" && recommend == "false")
    {
	action = "Reject"; //No I18N
    }
    //This is from homepage
    if(mode!=null && mode == 'takeAction')
    {
        if(document.getElementById(approveElementId).checked)
        {
            action = "Approve";//NO I18N
        }
        else if(document.getElementById(rejectElementId).checked)
        {
            action = "Reject";//NO I18N
        }
    }
    var comments = document.getElementById(approvalCommetsId).value;
    if(comments.trim()=="")
    {
        alert(getMessageForKey("sdp.changedetails.comments.emptyalert"));
        document.getElementById(approvalCommetsId).focus();
        return false;
    }
    var newUrl = '/servlet/CmClientUtilServlet';// No I18N
    if(key!=null && key!='null')
    {
	newUrl = '/sd/servlets/CmClientUtilServlet';// No I18N
    }
    var params = 'command=recommendOrRejectChange&';// No I18N

    params = params + 'ITEMID='+encodeURIComponent(changeid)+'&BY='+encodeURIComponent(appid)+'&Action='+action+'&COMMENTS='+encodeURIComponent(comments)+'&APPROVALLEVELID='+approvalLevelId+'&APPROVALID='+encodeURIComponent(approvalId)+'&KEY='+encodeURIComponent(key);// No I18N
    invokeProgressIndicator(null, 'sdp.common.processing');//NO I18N

    if( portalId != null && portalId != "null")
    {
	    params += "&PORTALID=" + portalId;//NO I18N
    }
    var myAjax = new Ajax.Request(newUrl, {
method: 'post',// No I18N
parameters: params,
        onComplete: function(resp, jsonObj){ successHdlr4Recommend(resp,appid,userId,key,mode, portalId); }
});
    return true;
}
function successHdlr4Recommend(resp,appid,userId,key,mode, portalId)
{
	closeDialog();
    var result = JSON.parse(resp.responseText) ;
    //After non-login approval action we redirect to autherror page with appropriate success/failure msg.
    if(result.status == "success")
    {
        let errorMsg="sdp.approval.action.sucess.msg";//NO I18N
    	if(result.auto_approved)
    	{
    	errorMsg="sdp.change.approval.autoapprovemessage";//NO I18N
    	}
    	window.location.href = "/jsp/AuthError.jsp?ErrorMsg="+errorMsg+"&module=ThanksMsg";
    	}
    	else
    	{
    	var errorMessage = "sdp.common.server.error.contact.admin";	//NO I18N
    	var errorCode = result.error_code;
    	if (errorCode != undefined)
    	{
    		if (errorCode === 60000)
    		{
    			errorMessage = "sdp.approvals.takeaction.error.notnotified";	//NO I18N
    		}
    		else if(errorCode === 60002 || errorCode === 60011)
    		{
    			errorMessage = "sdp.common.operation.autherror";	//NO I18N
    		}else if(errorCode === 60004){
    			errorMessage = "api.mla.common.current.level.for.approval.notmatched";	//NO I18N
    		}else if(errorCode === 60001){
    			errorMessage = "api.mla.common.approval.deleted";	//NO I18N
    		}
    	}
    	window.location.href = "/jsp/AuthError.jsp?ErrorMsg="+errorMessage;
    }
}

function showIncidentPView(woID)
{

    jQuery("#change-incident-preview").fadeIn("slow");// No I18N
    jQuery('html, body').animate({
        scrollTop: jQuery("#change-incident-preview").offset().top// No I18N
    }, 2000);
    var url = "/workorder/WOPrintPreview.jsp?woID="+encodeURIComponent(woID)+"&woMode=printWO&trimmed_details=request_details,resolution&isPreview=true"; // No I18N
//document.getElementById("PreviewFrame").src = url + "&" + (new Date()).getTime() + "&SUBREQUEST=true";
    window.frames.PreviewFrame.location.href = url + "&" + (new Date()).getTime() + "&SUBREQUEST=true";
}
function showArcIncidentPView(woID)
{

         jQuery("#change-incident-preview").fadeIn("slow");// No I18N
         jQuery('html, body').animate({
         scrollTop: jQuery("#change-incident-preview").offset().top// No I18N
         }, 2000);
         var url = null;
         url="/SDArchiveWorkOrder.do?woMode=PrintView&fromModule=Change&woID="+encodeURIComponent(woID);// No I18N
         window.frames.PreviewFrame.location.href = url + "&" + (new Date()).getTime() + "&SUBREQUEST=true";
}
function showProblemPView(id)
{
	window.open("/ui/problems?mode=detail&entity_id=" + id,'','noopener');
}
function validateChangeNotifForm()
{

    var toAddress = document.ChangeNotificationForm.to.value;
    var validto = validateEMailIDs(document.ChangeNotificationForm.to);

    if(!validto) {
	return false;
    }
    var ccAddress = document.ChangeNotificationForm.cc.value;
    var validcc = true;
    if(ccAddress != null && ccAddress != "") {
	validcc = validateEMailIDs(document.ChangeNotificationForm.cc);
    }
    if(!validcc) {
	return false;
    }

    val = document.ChangeNotificationForm.subject.value;
    val = trimAll(val);

    if(val == null || val == '') {
	alert(getMessageForKey("sdp.common.mail.jsSubErr"));//NO I18N
	document.ChangeNotificationForm.subject.focus();
	return false;
    }
}


function successHdlrForSaveClosureInfo(closeResp){
	if(closeResp.response_status.status == "success")
{
        var resultJSON = closeResp.change.close_details;
		resultJSON.description = appendImageToken(resultJSON.description,resultJSON.image_token);
        var comments = resultJSON.description;
        var by = resultJSON.updated_by.name;
        var on = resultJSON.updated_on.display_value;
        var closePlanId = resultJSON.id;
        var closureCodeJSON = closeResp.change.closure_code;
        var clsName = closureCodeJSON.name;
        var closeCodeId = closureCodeJSON.id;

    jQuery("#hiddendiv_CLOSE").fadeOut("slow",function(){// No I18N
	    jQuery("#detailswithcontent_CLOSE").fadeIn("slow");// No I18N
//a href replaced with <span> tag no need <a href>
        	var content = "<input type=\"hidden\" id=\"Change_Close_ClosureCode_ID\" value=\'" + closeCodeId + "\'/>" + "<input type=\"hidden\" id=\"CLOSE_ID\" value=\'" + closePlanId + "\'/>" + "<b>"+getMessageForKey("sdp.change.closecode")+ " : </b>" + "<b id=\"Change_Close_ClosureCode\" value=\'" + encodeHTML(clsName) + "'>" + "\""+ encodeHTML(clsName) + "\" " + "</b><span class='fontgray-81'>" +  getMessageForKey("sdp.common.by")+"</span> <a id=\"Change_Close_closedby\" >"+encodeHTML(by)+"</a> <span class='fontgray-81'>"+getMessageForKey("sdp.common.on")+" <a id=\"change_close_time\">"+on + "</a></span><br><b>"+getMessageForKey("sdp.common.comments")+ ": </b><br><span id=\"Change_Close_ClosureComments\">" + comments + "</span>"; // No I18N
		jQuery("#editlink_CLOSE")[0].style.display='';
	    jQuery("#details_CLOSE").html(content);
	    });
}
    else
    {
        parent.showFailureMessageAndClose("sdp.change.exception.msg",5000);//NO I18N
    }
}

/*
 * This function get invoked when Impact,Roll Out, Back Out,Checklist, and Review are edited through Add menu.
 *
 * ToDo: No need to change the Tab in the following two cases
 *      1. If current ChangeTab is Planning and detail entered is Impact,Roll Out, Back Out, or Checklist
 *      2. If current ChangeTab is Review and detail entered is Review.
 */
function enterResolutionDetails(fieldName,changeid,ctStageName)
{

	if(fieldName != 'REVIEW')
    {
		//load the Plannning stage tab and open the edit section for the field i.e, fieldName
		changeChangeTab('planningtab', '&EDIT=true&show=resolution&fieldname='+encodeURIComponent(fieldName)); // No I18N
		showHideStatusActionList("Planning");//NO I18N
    }
    else
    {
    	//load the Review stage tab and open the edit section for Review
    	changeChangeTab('reviewtab', '&EDIT=true&show=resolution'); // No I18N
    	showHideStatusActionList("Review");//NO I18N
    }
}

function showResolutionDetails(fieldname,value)
{

    var val = fieldname;
    value = decodeURIComponent(value);
	if(value.trim() == "")
    {
	document.getElementById("SCRIPT").value= "add";//NO I18N
    }
    else
    {
	document.getElementById("SCRIPT").value = "edit";//NO I18N
    }
	jQuery("#emptydiv_"+val).fadeOut("slow");//NO I18N
	jQuery("#addlink_"+val).fadeOut("slow");//NO I18N
    var header;
    parent.document.getElementById("TYPE").value = val;
    if(val == "IMPACTDESC")
    {
	header = parent.getMessageForKey("sdp.change.impact");
    }
    else if(val == "ROLLOUTPLAN")
    {
	header = parent.getMessageForKey("sdp.change.rollout");
    }
    else if(val == "BACKOUTPLAN")
    {
	header = parent.getMessageForKey("sdp.change.backout");
    }
    else
    {
	header = parent.getMessageForKey("sdp.change.checklist");
    }
    window.parent.jQuery("#detailsdiv_"+fieldname).fadeOut("slow",function(){//NO I18N
	    window.parent.jQuery("#hiddendiv_"+fieldname).fadeIn("slow");//NO I18N
	    parent.document.getElementById("hiddendiv_"+fieldname).innerHTML = parent.document.getElementById("editingdiv").innerHTML;

	    window.parent.jQuery("div[id='header']").html(header);
	    });
	setTimeout(function()
		{
		new parent.Effect.ScrollTo("hiddendiv_"+fieldname,{duration: 1.0});
		parent.jQuery("#HTMLDesc").filter(':visible:first').attr('id',"HTMLDesc_"+val);
		parent.zeditor({element:"HTMLDesc_"+val});// No I18N
		},1000);
	setTimeout(function(){
		parent.parent.editor.setHTML(value);
		parent.editor._editor.focus();
		}, 2500);
}
/*
 * Issue ID: 56142 - Unwanted ajax call is removed.
 * ToDo: If the opened tab is planning then no need to change the Tab
 */
function enterDownTimeDetails(changeid,ctStageName)
{

	changeChangeTab('planningtab', '&EDIT=true&show=downtime'); // No I18N
	showHideStatusActionList("Planning");//NO I18N
}
/*
 * Issue: SD-57127 - When SDChangeManager is not allowed to edit the Change and click global 'Edit' option,
 * this function helps to associate him/her as CM so that he/she can edit the Change.
 */
function showChangeRolesSection()
{
	alert(getMessageForKey("sdp.change.edit.sdchangemanager.confirm")); //NO I18N
	changeSubmissionTab();
	Effect.ScrollTo('Change_Submn_ViewRoles');
	jQuery("#change_globaleditlink").attr("href","/EditChange.cc?CHANGEID="+parent.CHANGEID);
}

function switchToChangeRolesSection(section)
{
    if(section == 'Edit')
    {
    	jQuery("#Change_Submn_ViewRoles").fadeOut('slow',function(){ 	//NO I18N
    		jQuery("#Change_Submn_EditRoles").fadeIn('slow');			//NO I18N
    	});
    }
    else if (section == 'View')
    {
    	jQuery("#Change_Submn_EditRoles").fadeOut('slow',function(){	//NO I18N
    		jQuery("#Change_Submn_ViewRoles").fadeIn('slow');			//NO I18N
    	});
    }
}

function ActionsMenus(val)
{
    var j;
    if(val != null)
    {
	j = window.parent.jQuery;
    }
    else
    {
	j = jQuery;
    }
    j('#AddNewMenu').ActionsMenuList();// No I18N
    j('#ViewItems').ActionsMenuList();//NO I18N
    j('#Actions').ActionsMenuList();// No I18N
    j('#Resolution').ActionsMenuList();// No I18N
    j('#WFActions').ActionsMenuList();// No I18N
}
(function($){
 $.fn.extend({
ActionsMenuList: function(options) {
var defaults = {
animSpeed: 400
};
var options = $.extend(defaults, options);
return this.each(function() {
    var o =options;
    var obj = $(this);
    $('ul', obj).css({display: "none"});
    var framer = $('iframe', obj);
    $("li.f", obj).hover //No I18N
    (
     function()
     {
     framer.css({visibility: "visible",display:"block"}); //No I18N
     $(this).find('ul:first').css({visibility: "visible",display: "none"}).show(o.animSpeed); //No I18N
     },
     function(){
     framer.css({visibility: "hidden",display:"none"}); //No I18N
     $(this).find('ul:first').css({visibility: "hidden"}); //No I18N
     }
    );

    });
}
});
})(window.parent.jQuery);

function showFailureMessageForChange(source,value, timeout){
    parent.invokeProgressIndicator(source, value, "completed", '/images/invalidoperationicon.gif'); //No I18N
    if(timeout == null)
    {
	setTimeout(function() { parent.closeDialog(); }, 2000);
    }
    else
    {
	setTimeout(function() { parent.closeDialog(); }, timeout); //No I18N
    }
}

function showTempFilter(menu)
{
    if (menu.className=='mnuNormal')
    {
	menu.className='mnuActive';
    }
}
function hideTempFilter(menu)
{
    if (menu.className=='mnuActive')
    {
	menu.className='mnuNormal';
    }
}

function hideStatusComments(sgid)
{

    jQuery("#hidelink_"+sgid).fadeOut("slow",function(){//NO I18N
	    jQuery("#viewlink_"+sgid).fadeIn("slow");//NO I18N
	    jQuery("div[id='changecommentsinfo']:visible").html("");
	    });

}

function showProgressUIComments(thisVal,event,stageid)
{
	var result = {};
	var approvalSummaryCommentDetails;
	jQuery.each($rc.approvalSummary.approval_summary,function(i,apprvsummary){
		if(apprvsummary.stage.id==stageid)
		{
		approvalSummaryCommentDetails= apprvsummary;
		}
	});
	if(approvalSummaryCommentDetails) {
		result = {
            latestDecision: approvalSummaryCommentDetails.state === "cancelled" ? "reject" : approvalSummaryCommentDetails.status.action_name,//No I18N
            commentsTitle: translate("sdp.changedetails.status.comments.setby.on", [encodeHTML(approvalSummaryCommentDetails.status.name),encodeHTML(approvalSummaryCommentDetails.commented_by.name),approvalSummaryCommentDetails.commented_on.display_value]), //No I18N
            commentsVal: approvalSummaryCommentDetails.comment
        };
	}
	else if($rc.stagesArray.find((item) => item.id === stageid.toString()).state === "skipped" || $rc.stagesArray.find((item) => item.id === stageid.toString()).state === "visited")
    {
		result = {
            latestDecision: "",
            commentsTitle: translate("sdp.change.details.skippedstage.msg"), //No I18N
            commentsVal: ""
        };
    }
	if(result.commentsTitle)
    {
		showProgressComments(result.commentsTitle,encodeHTML(result.commentsVal),thisVal,result.latestDecision);
    }
}



function menubar2actions(bool){
		jQuery('#nav-view,#nav-addnew,#nav-actions,#nav-statusactions,#nav-resolutiontab').off('click') //NO I18N
		jQuery('#nav-view,#nav-addnew,#nav-actions,#nav-statusactions,#nav-resolutiontab').on('click',{}, ActionMenubar) //NO I18N
		if(!bool)
 		{

 			jQuery("#nav-statusactions").off('mouseenter').off('mouseleave').off('click');//NO I18N
// following is commented due to status actions list not refreshed sometimes when we change status and view history tab.
			//undefined check added for statusActionHTML
		/*	if(statusActionHTML != undefined && statusActionHTML.trim() == "")
			{
				statusActionHTML = jQuery("#nav-statusactions").find("div").find("#customMenuList4").html();//NO I18N
			}
			jQuery("#nav-statusactions").find("div").find("#customMenuList4").html("");//NO I18N*/
 		}
		/*else
		{
			if(statusActionHTML != undefined && statusActionHTML.trim() != "")
			{
				setTimeout(function(){jQuery("#nav-statusactions").find("div").find("#customMenuList4").html(statusActionHTML)}, 300);//NO I18N
			}
		}*/
}

function reloadTab(selectedStage,selectedTab, params, value, userId,key,isCurrentStage, portalId)
{

if(selectedTab == "submissiontab")
{
	changeSubmissionTab(userId,key,isCurrentStage);
}
else
{
	changeChangeTab(selectedTab,params,value,userId,key,isCurrentStage, portalId);
}
if(selectedTab == "historyDetails" || selectedTab == "conversationtab")
{
	document.getElementById("statusactionmenu").style.display="none";
}
else
{
	setTimeout(function(){document.getElementById("statusactionmenu").style.display="block"}, 500);
}
//showHideStatusActionList(selectedStage);

//added for height issue
jQuery('#LeftIndicator, #LeftIndicatorClosed').height('');
setMinLeftPanelHeight();
	jQuery('#TaskGroupTechLayer').remove();
}
function showHideStatusActionList(selectedTab)
{

var stageName = jQuery("#openedstage").val();
	if(stageName != selectedTab)
	{
		jQuery("#nav-statusactions > div").addClass("disable-opacity3");
		menubar2actions(false);
	}
	else
	{
		jQuery("#nav-statusactions > div").removeClass("disable-opacity3");
		menubar2actions(true);
	}
}
function showEmptyDiv(type,operation)
{

if(operation == "add")
{
	jQuery("#emptydiv_"+type).fadeIn("slow");//NO I18N
}
else
{
	jQuery("#addlink_"+type).fadeIn("slow");//NO I18N
}
}
function showProgressComments(msg, desc, obj,latestdecision){

		var stagediv = jQuery('#stagemsg');
		var h = 0, t = 0, l = 0, w = 0;
		stagediv.children('div.stage-content').html('');//NO I18N
		stagediv.children('div.stage-desc').show().html('');//NO I18N
		stagediv.children('div.stage-content').html(msg);//NO I18N
		if(desc.length > 0){
			stagediv.children('div.stage-desc').show().html(desc);//NO I18N
		}
		else{
			stagediv.children('div.stage-desc').hide();//NO I18N
		}
		if(latestdecision == "reject")
		{
		jQuery("#popupicon").attr('class','cspr icon-md failure-outline');
		}
		else if(latestdecision==null || latestdecision.trim() == "" || latestdecision.trim() == "skip")
		{
		jQuery("#popupicon").attr('class','cspr icon-md skip-outline');
		}
		else
		{
		jQuery("#popupicon").attr('class','cspr icon-md success-outline');
		}
				h = stagediv.height();
		var w =stagediv.width();
		var pos = jQuery(obj).offset();
		var scrlft = document.body.scrollLeft;
		var scrtop = document.body.scrollTop;
		var direct = parent.sdp_user.DIRECTION;

	t = pos.top - 10;
	l = isDark() ? pos.left + 28 :pos.left + 25;
		if(direct == "RTL")
		{
		l = isDark() ? l - 322 : l - 317;
		}
		stagediv.css({'top': t, 'left': l});//NO I18N
		stagediv.removeClass("hide").addClass("show");
		jQuery('#changestartListMenuItems .changeact-seperator').on('mouseenter',{}, hideStageMsg);  //NO I18N

}
function hideStageMsg(){
	jQuery('#stagemsg').removeClass("show").addClass("hide");
}

function changeWFFlowChartMouseOut()
{
	jQuery('.deletediv, .sep-icon, #attachlink2').hide();
}

/*
 * constructparameters method already available in common.js. But in downtime case we need to escape before encoding.In success method need to unescape.so not do in common.js.Post 8.3
 * need to modify save downtime info method without getting entire structure from servlet.
 */

function highlightRow(rowid)
{
        if(rowid != null || rowid != "")
        {
                updateEffect(document.getElementById("detailsrow_"+rowid));
        }
        loadmeadmin();
}
//clear previously opened tab due to inlineimages duplication.
/*

 *This method is used to copy a change

 */

function showCopyDialog(content)

{
var helpContent=$('table_icon_help').innerHTML;

showDialog(helpContent, "position=absolute,width=450,left=500,top=250,title=" + content);//No I18N

}

function scanChgAssociatedAssets(assetId)
{
	 var form = document.getElementById("groupscanform");
         if(form == null){
            jQuery(document.body).append(
             '<form id="groupscanform" action="/DomainDiscovery.do?action=getwsidtoscan" method="POST" target="Scan_WS">' +
                 '<input type="hidden" name="isgroupScan" value="true">' +
                 '<input type="hidden" name="ciId" value="'+ assetId+ '">' +
                 '<input type="hidden" name="type" value="Assets">' +
                 '<input type="hidden" name="' + getCSRFParamName() + '" value="' + getCSRFParamValue() + '">' +
             '</form>');
            form = document.getElementById("groupscanform");
        }
        else{
            form.ciId.value = assetId;
        }
	let left = Math.max(0, (screen.width - 810) / 2);
	let top = Math.max(0, (screen.height - 450) / 2);
	window.open('about:blank', 'Scan_WS', 'scrollbars=yes,menubar=no,height=450,width=810,resizable=yes,toolbar=no,status=no'+',left=' + left + ',top=' + top);

        form.submit();
	//NewWindow('DomainDiscovery.do?action=startgroupscan&isgroupScan=true&ciId='+encodeURIComponent(assetId)+'&type=Assets','Scan_WS','810','450','yes','center');
}
/* 	Issue fix SD-92570 Starts
	Files Impact - MonthCalendar.jsp, Solution.js
	Module & Page - Change Calendar View */
var changeCalendar = (function(){
	var CalmonthView,CalyearView,changeCalendarArray = {};
	changeCalendarArray.getCalMonthYear = function (calmonth,calyear){
		CalmonthView = calmonth;
		CalyearView = calyear;
	}
	changeCalendarArray.calenderViewOnchange = function (calTime){
		setTimeout(function(){
			var calStrip = jQuery('#ElementMark.calendarStrip'),
				calStripLen = calStrip.length;// No I18N
			if(module == 'Change' && calStripLen > 0){
				if(jQuery('#ListView').hasClass('hide') == true){
					showChangeTab('CalendarView',CalmonthView,CalyearView);// No I18N
				}
			}
		},calTime);
	}
	changeCalendarArray.emptyCalView = function (){
		CalyearView = undefined ;
		CalmonthView = undefined ;
	}
	return changeCalendarArray;
})();
jQuery(document).on('ready',function(){
	changeCalendar.calenderViewOnchange(300);
});
/* Issue fix SD-92570 Ends*/
function getAssociatedRelease(changeid){
	var assocReleaseId = null;
	sdpAjax({
        url: "/api/v3/changes/"+changeid+"/releases", // No I18N
        success: function(response) {
        	if(response.releases.length >0 ){
        		assocReleaseId = response.releases[0].release.id;
        	}
        },
        async: false,
		acceptODCompatible : true
    });
    return assocReleaseId;
}
//to dissociate release from change
function disassociateRelease(changeid){
	var assocReleaseId = getAssociatedRelease(changeid);
	if(assocReleaseId && confirm(getMessageForKey('sdp.change.releasedissociate.confirm'))) { // No I18N
        var data = sdpAjaxInputData({
                     "releases": [// No I18N
                            {
                                "release": {// No I18N
                                    "id": assocReleaseId // No I18N
                                }
                            }
                        ]
                    });
        sdpAjax({
            url: "/api/v3/changes/" + changeid + "/releases", // No I18N
            data: data,
            type: "DELETE", // No I18N
            success: function(resp) {
                showalert("success", getMessageForKey("sdp.project.history.releasedisassociated"), "isAutoHide=true, delay=3"); //No I18N
                if(jQuery("#taskDetails_td").hasClass("subtabon")){ //NO I18N
				    $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
				}else{
                    parent.changeChangeTab('taskDetails'); //NO I18N
				}
                jQuery('#changeReleaseAssocAction').removeClass("hide");
                jQuery('#changeReleaseDissocAction').addClass("hide");
            },
            async: false,
            acceptODCompatible : true
        });
    }
}
