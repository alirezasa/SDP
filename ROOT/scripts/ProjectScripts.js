//$Id$
// this will be used to hieghlight the project,recent-updates,gantt tabs..(ProjectHeader.jspf)
var project_tab_header = 'project_header'; //NO I18N


function loadProjectDetails_Tab(tabName, associatedTags, canEdit)
{
	if(tabName == null){return;}

	if('tasks' == tabName){

		jQuery('#ProjectTask-list').trigger('click');

	}else if('milestone' == tabName){	// NO I18N

		jQuery('#MileStone-list').trigger('click');
	}else if('reqAssoc' == tabName){	// NO I18N

		jQuery('#proj-reqassocdetails').trigger('click');
	} else {
        renderTagsSection({ associatedTags: associatedTags, canEdit: canEdit });
	}
}

function cancelProjectForm(form)
{
	var prev_Val = form.submitaction.value;

	if(form.changeid.value != "null" && form.changeid.value != '' && 'AddNew' == prev_Val){
		window.close();
	}
	/* Project Code Starts Here */
        else if  (form.WORKORDERID.value != "null" && form.WORKORDERID.value != '' && 'AddNew' == prev_Val)
        {window.close();}
        /* Project Code Ends Here */
	if( 'UpdateProject' == prev_Val ){
		form.submitaction.value = 'ViewProject';	// NO I18N
	}else{
		window.location.href="/ui/projects?mode=list";// NO I18N
        return;
	}
	form.submit();
    renderProjectWebComponent();
}
function loadMileStoneDetails_Tab(tabName)
{
	if(tabName == null){return;}

	if('tasks' == tabName){

		jQuery('#MileStoneTasks').trigger('click');
	}

}

function deleteMileStoneList(form){

	var confirmMessage = getMessageForKey('sdp.project.milestone.deleteconfirm');
	var selectMessage = getMessageForKey('sdp.admin.common.deletemess');

	if (confirmDelete(form,"checkbox",confirmMessage,selectMessage)){

		form.submitaction.value = 'DeleteMileStone';	// NO I18N
		form.action = "/MileStoneAction.do";

		form.submit();
	}
}
		document.getElementById("ShowTaskDetails_CREATEDBYtxt") && document.getElementById("ShowTaskDetails_CREATEDBYtxt").remove();
	    document.getElementById("ShowTaskDetails_CREATEDBYtxt") && document.getElementById("ShowTaskDetails_CREATEDBYtxt").remove();

function loadMileStoneDetailsInline(url,submitaction){

	var submit = "ViewMileStone";	// NO I18N

	if(submitaction != null && submitaction != undefined){submit = submitaction;}

	window.frames['SDPHeaderFrame'].location.href = '/MileStoneAction.do?_='+new Date().getTime()+'&from=InlineSubmit&SUBREQUEST=true&submitaction='+submit+url;

    renderMilestoneWebComponent();
}
function loadMileStoneTasks(params)
{
	var wURL = new URL(window.location.href);
	var mid = wURL.searchParams.get("associatedEntityId");
	var pid = wURL.searchParams.get("scopeid");
	if(document.getElementById('projectid') && document.getElementById('projectid').innerHTML){
		pid = document.getElementById('projectid').innerHTML;
		mid = document.getElementById('milestoneid').innerHTML;
	}
	$tasks.loadTasks('list', 'milestone', mid, null, null, pid);//No i18N
}
function loadMileStoneTimeSpent(url)
{
   var id = new URL(window.location.href).searchParams.get("associatedEntityId");//No i18N
   if(document.getElementById('milestoneid') && document.getElementById('milestoneid').innerHTML){//No i18N
        id = document.getElementById('milestoneid').innerHTML;//No i18N
   }
   sdpAjax({
        url: "/project/ProjectsTimesheet.jsp?module=milestone&moduleId="+id, // NO I18N
        async: false,
        dataType: "html",   // NO I18N
        success : function(response){ jQuery("#MileStoneTimeSpent-content").html(response); }
   });
}
function loadProjectGanttDetails(){
	window.frames['SDPHeaderFrame'].location.href='/GanttAction.do?_='+new Date().getTime()+'&mode=read&SUBREQUEST=true&projectid='+document.getElementById('projectid').innerHTML+'&project_status='+document.getElementById('project_status').innerHTML;
}

function loadProjectDetails(submitaction){

	var submit = "ViewProject";	// NO I18N

	var projectid = document.getElementById('projectid')!=null?(document.getElementById('projectid').innerHTML!=''?document.getElementById('projectid').innerHTML:document.getElementsByName('projectid')[0].value):document.getElementsByName('projectid')[0].value;

	if(submitaction != null && submitaction != undefined){submit = submitaction;}

	window.frames['SDPHeaderFrame'].location.href = '/ProjectAction.do?_='+new Date().getTime()+'&from=InlineSubmit&submitaction='+submit+'&projectid='+encodeURIComponent(projectid)+ "&SUBREQUEST=true";

    renderProjectWebComponent();

}
function showProjectEditForm(){
	jQuery('#Hidden_ProjectForm').attr("class","show");
	jQuery('#ProjectDetails_DIV').attr("class","hide");

	parent.scrollToElement(parent.jQuery('#ProjectForm'),600);
	parent.jQuery('#title').trigger('focus').val(parent.jQuery('#title').val());
    parent.setTimeout(function() {
    	zeditor({element:'HTMLDesc', acceptODCompatible: true, inlineimagesAPI:'/api/v3/projects/' + parent.document.getElementById('projectid').innerHTML + '/images'});// NO I18N
        projectFormEvents();
    },100);
    parent.setTimeout(function() {
		jQuery('.pro-template-sec').addClass('hide')
	}, 200);
}
var projectStatusId = '';
var milestoneStatusId = '';
var localSetting = null;
function loadEditProjectForm(){
	cancelInline("Inline_ProjectForm");	//NO I18N
	projectStatusId = document.getElementById('statusid')?document.getElementById('statusid').value:'';

	if (! document.getElementById('ProjectDetails_DIV')){

		var element = document.getElementById('proj-details');
		showProjTabs(element);
		loadProjectDetails('EditProject');	//NO I18N
	} else {
		showProjectEditForm();
	}
    projectFormEvents();
}
function loadProjectEntityHistory(entity,from){
    var url = "/project/ProjectHistory.jsp?module="+entity+"&is_date_filter=true";      // NO I18N
	if(entity == 'projectRecentUpdates'){
	    var title = translate("sdp.header.recentupdates");
		jQuery("body").append("<div id='history_slide'></div>");
		isMSP?(url = (url + "&show_account_filter="+(sdp_user.USERTYPE=="Technician"))):"";       // NO I18N
        jQuery('#history_slide').load(url+"&is_slider=true");       // NO I18N
        jQuery("#history_slide").show().panelSlider({
            width: 800,header: true,modal: true,
            title: title,
            dialogClass: "tabui-rightpanel",        // NO I18N
            placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            close:function(){
                if(jQuery("#filter_toggle").hasClass("active")){
                    jQuery("#history_filter_slide").remove();         // NO I18N
                }
                jQuery("body").removeClass("subheader-of-h");
                jQuery('.cur-ptr.thm-spr').blur();
            }
        });
	}else if(entity == 'projects'){      // NO I18N
		var projectid = "";
        if(from === "kanban"){
            projectid = $projectDetails.options.projectId;
        }else{
            projectid = document.getElementById('projectid').innerHTML!=''?document.getElementById('projectid').innerHTML:document.getElementsByName('projectid')[0].value;
        }
    	jQuery("#ProjectHistory_DIV").load(url+"&id="+projectid+"&is_new_filter=true");            //No I18N
	}else if(entity == 'milestones'){        // NO I18N
		var projectid = document.getElementById('projectid').innerHTML!=''?document.getElementById('projectid').innerHTML:document.getElementsByName('projectid')[0].value;
	    var milestoneid = document.getElementById('milestoneid').innerHTML!=''?document.getElementById('milestoneid').innerHTML:document.getElementsByName('milestoneid')[0].value;
	    jQuery(window.top.document).find("#MileStoneHistory_DIV").load(url+"&projectId="+projectid+"&id="+milestoneid+"&is_new_filter=true");     //No I18N
	}
}
function loadMoreHistory(url){

	window.frames['SDPHeaderFrame'].location.href = url;
}
function loadProjectWorkLogList(){
    var id = new URL(window.location.href).searchParams.get("associatedEntityId");//No i18N
    if(document.getElementById('projectid') && document.getElementById('projectid').innerHTML){//No i18N
        id = document.getElementById('projectid').innerHTML;//No i18N
    }
    sdpAjax({
        url: "/project/ProjectsTimesheet.jsp?module=project&moduleId="+id, // NO I18N
        async: false,
        dataType: "html",   // NO I18N
        success : function(response){ jQuery("#ProjectWorkLog-link-content").html(response); }
    });
}
function loadProjectTaskList(params){
	var id = new URL(window.location.href).searchParams.get("associatedEntityId");
    if(document.getElementById('projectid') && document.getElementById('projectid').innerHTML){
        id = document.getElementById('projectid').innerHTML;
    }
    $tasks.loadTasks('list', 'project', id);//No i18N
}


function loadNewMileStoneForm(){
	window.frames['SDPHeaderFrame'].location.href='/MileStoneAction.do?_='+new Date().getTime()+'&submitaction=NewMileStone&projectid='+document.getElementById('projectid').innerHTML+"&SUBREQUEST=true";
}

function loadMileStoneDetails(milestoneId){
	window.location.href='MileStoneAction.do?_='+new Date().getTime()+'&fromListView=true&projectid='+document.getElementById('projectid').innerHTML+'&submitaction=ViewMileStone&milestoneid='+milestoneId;
}

function showMilestoneEditForm(){
	jQuery("#Hidden_MileStoneForm").attr("class","show");
	jQuery("#Details_MileStoneForm").attr("class","hide");

	parent.scrollToElement(parent.jQuery('#MileStoneForm'),600);
}

function loadEditMileStoneForm(milestoneid,projectid){

	cancelInline("Inline_MileStoneForm");	//NO I18N
	milestoneStatusId = document.getElementById('statusid')?document.getElementById('statusid').value:'';
	if (! document.getElementById("Details_MileStoneForm") ){

		var element = document.getElementById('MileStoneDetailsInfo');
		showProjTabs(element);
		loadMileStoneDetailsInline('&milestoneid='+jQuery('#milestoneid').html(),"EditMileStone");	//NO I18N
	} else{
		showMilestoneEditForm();
	}
	parent.jQuery('#title').trigger('focus').val(parent.jQuery('#title').val());

    parent.setTimeout(function() {
		zeditor({element:'MileStoneHTMLDesc',acceptODCompatible: true,inlineimagesAPI:'/api/v3/projects/'+projectid+'/milestones/'+milestoneid+'/images'});	//NO I18N
        milestoneFormEvents();
    }, 300);
}

function deleteMileStone(milestoneid){
	window.frames['SDPHeaderFrame'].location.href = '/MileStoneAction.do?_='+new Date().getTime()+'&submitaction=DeleteMileStone&milestoneid='+ milestoneid + "&SUBREQUEST=true&projectid="+document.getElementById('projectid').innerHTML;
}
function loadProjectMembers(mode){
	var projectId = jQuery('#projectid').html();
    projectId = projectId? projectId:document.getElementsByName('projectid')[0].value;
    mode = mode === undefined? "view": mode;// NO I18N
    sdpAjax({
        type: "GET",   // NO I18N
        dataType: "html", // NO I18N
        url: "/project/ProjectMemberListView.jsp?projectId="+projectId+"&mode="+mode,// NO I18N
        async: false,
        success : function(response){
            if(jQuery("#ProjectMembers-link-content").length){
                jQuery("#ProjectMembers-link-content").html(response);
            }else{
                jQuery(window.top.document).find("#ProjectMembers-link-content").html(response);
            }
        }
    });
}


function loadMilestoneComments(milestoneid, milestoneOwner, projectid)
{

	var navinfo = {
		entity: "milestones", // NO I18N
		entityId: milestoneid,
		entityOwner: milestoneOwner,
		parentEntity: "projects", // NO I18N
		parentEntityId: projectid,
		parentSingularName: "milestone" // NO I18N
	}

	showComments(navinfo); 
}

function loadProjectComments(projectOwner)
{
	var projectid = document.getElementById('projectid').innerHTML!=''?document.getElementById('projectid').innerHTML:document.getElementsByName('projectid')[0].value;
	var navinfo = {
		entity: "projects", // NO I18N
		entityId: projectid,
		entityOwner: projectOwner,
		parentSingularName: "project" // NO I18N
	}

	showComments(navinfo); 
}

function setValueToHtmlViewElement(elementid , doc , formName , editable)
{
	if(doc == null){doc = document;}

	var element = parent.document.getElementById('Details_'+elementid);
	if(element){

		if( doc.getElementById('tempDisp_'+elementid).innerHTML!='null' ){

			element.innerHTML = doc.getElementById('tempDisp_'+elementid).innerHTML;

		}else{
			
			element.innerHTML = '-';
		}

		if( editable ){

			let html = "<div id='inline-"+elementid+"'><a href='/' data-event='click' data-handler='loadInLineForm(\""+elementid+"\",\""+formName+"\")' nonce="+sdpNonce+">" + element.outerHTML + "</a></div>";
            element.outerHTML = html
            $sdEventListener(jQuery('#inline-'+elementid))
		}
	}
}
function setValueToHtmlElement(elementid , element , element_display , doc)
{
	if(!element){return;}

	if(doc == null){doc = document;}

	var type1 = element.type;

	if( (type1=='text' || type1=='textarea')){

		if(doc.getElementById('temp_'+elementid).getAttribute("value")!='null'){

			var elementValue = doc.getElementById('temp_'+elementid).getAttribute("value");// No i18n

			//This check is for RTA only. For RTA we have a div with id 'Form_description'
			if(type1=='textarea' && parent.jQuery('#Form_description').find('#'+element.id)[0] != undefined){

				elementValue = doc.getElementById('temp_'+elementid).innerHTML;
			}

			element.value = elementValue;
		}
	}else if(type1=='hidden'){//NO I18N

		var elementType = element.getAttribute("elementType");

		if(elementType == 'date' || elementType == 'datetime')
		{
			if( doc.getElementById('temp_'+elementid).innerHTML !='0' && doc.getElementById('temp_'+elementid).innerHTML!='null' ){
				element.value = doc.getElementById('temp_'+elementid).innerHTML;
			}
			if( element_display!=null ){displayClientTime(elementid);}

		}else if(elementType=='checkbox'){//NO I18N

			var val = doc.getElementById('temp_'+elementid).innerHTML;

			if(val == 'true'){element_display.checked = true;

			}else{element_display.checked = false;}

		}else{
			if(doc.getElementById('temp_'+elementid).innerHTML!='null'){
				element.value = doc.getElementById('temp_'+elementid).innerHTML;
			}
		}

	}else if(type1=='checkbox'){//NO I18N

		var val = doc.getElementById('temp_'+elementid).innerHTML;

		if(val == 'true'){element.checked = true;

		}else{element.checked = false;}

	}else if(type1=='select-one'){//NO I18N

		if (doc.getElementById('temp_'+elementid).innerHTML != ""){

			element.value = doc.getElementById('temp_'+elementid).innerHTML;
		}
	}else if(element){

		for(var i=0;i<element.length;i++){
			if(element[i].value ==doc.getElementById('temp_'+elementid).innerHTML){
				element[i].checked = true;
				break;
			}
		}
	}
}

//This getRolesComboBox function is overridden in msp.
function getRolesComboBox(pRoles)
{
        return document.getElementById(pRoles).innerHTML;
}

function showProjTabs(tabID)
{
	jQuery("div[id*='ascrail']").css('visibility','hidden');// NO I18N
	jQuery(tabID).parent().addClass('active');
	jQuery(tabID).parent().siblings().each(function(){
		jQuery(this).removeClass("active");
		let id = jQuery(this).find("a") && jQuery(this).find("a").attr('id') ? jQuery(this).find("a").attr('id') : jQuery(this).attr('id');// NO I18N
		jQuery("#"+id+"-content").children().html('');
	});
	var divname= tabID.id;
	jQuery("#"+divname+"-content").show().siblings().hide();
}

function loadInLineForm(attribute,formName,bindOnChange)
{
	var selectorAttr = jQuery('#'+attribute);
	if(attribute == 'GROUPID') {
		if( jQuery('#MarkedStatus').val() == 'Mark' ){	selectorAttr = jQuery('#MarkedGroupID');		}
	}
	else if(attribute == 'OWNERID') {
		if( jQuery('#MarkedStatus').val() == 'Mark' ){	selectorAttr = jQuery('#MarkedOwnerID');		}
	}
	var val = document.getElementById('Inline_selectattribute').value;
	if (val == '')
	{

		if( attribute == "department" && formName == "ProjectForm" )
		{
			attribute = "requestedby";	//NO I18N
		}

		var content = document.getElementById('Form_'+attribute).innerHTML;

		document.getElementById('Inline_selectattribute').value = attribute;

		document.getElementById('Details_'+attribute).className = 'hide';

		jQuery('#Inline_'+formName).find('#Inline_'+attribute).attr('class','show');

		if (jQuery('#'+formName).find('#'+attribute)[0].type == 'select-one' )
		{
			jQuery('#Inline_'+formName).find('#Inline_'+attribute).html( content + jQuery('#inline_image_div_cancel').html() );

			var selectValue =  selectorAttr.val() !== 'null' ? selectorAttr.val() : null;	//NO I18N
			jQuery('#Inline_'+formName).find('#'+attribute+'_Disp').val(selectValue);

			if(bindOnChange == null || ( bindOnChange != null && bindOnChange != false ) ){
				jQuery('#Inline_'+formName).find('#'+attribute).on('change',  function(){jQuery('#Inline_'+formName).submit();} );
			}

		}
		else
		{
			if(attribute == "requestedby" &&  formName == "ProjectForm")
			{
				var content = '<input type="text" name="requestedby" id="reqName" class="form-control"/>';

				jQuery('#Inline_'+formName).find('#Inline_'+attribute).html( content + jQuery('#inline_image_div').html() );

				getRequester({id:jQuery('#'+formName).find('#requestedby')[0].value,name:jQuery("#Details_requestedby").text()},"reqName",document.getElementsByName('projectid')[0].value); //NO I18N

				document.getElementById('Details_department').className = 'hide';

				jQuery('#Inline_'+formName).find('#Inline_department').attr('class','show');

				var content = '<input type="text" name="department" id="deptName" class="form-control"/>';

				jQuery('#Inline_'+formName).find('#Inline_department').html( content +  jQuery('#inline_image_div').html());

				getDepartment({"id":jQuery('#'+formName).find('#department')[0].value,"text":jQuery("#Details_department").text()},"deptName",document.getElementsByName('projectid')[0].value);//NO I18N

				jQuery('#Inline_ProjectForm').find('#Inline_department').find('.ui-saveicon').hide();
				jQuery('#Inline_ProjectForm').find('#Inline_department').find('.ui-cancelicon').hide();

			}
			else if(attribute == "ownerid"){
				var content = '<input type="text" name="ownerid" id="inlineownerid" class="form-control"/>';
				jQuery('#Inline_'+formName).find('#Inline_'+attribute).html( content + jQuery('#inline_image_div').html() );
				loadProjectOwner("inlineownerid",document.getElementsByName('projectid')[0].value); //NO I18N
				jQuery("#inlineownerid").select2("data",{"id":jQuery('#'+formName).find('#ownerid')[0].value,"text":jQuery("#Details_ownerid").text()}); //NO I18N
			}
			else
			{
				jQuery('#Inline_'+formName).find('#Inline_'+attribute).html( content + jQuery('#inline_image_div').html() );
                projectFormEvents();
                milestoneFormEvents();
				var selectValue1 =  selectorAttr.val() !== 'null' ? selectorAttr.val() : null;	//NO I18N
				jQuery('#Inline_'+formName).find('#'+attribute+'_Disp').val(selectValue1);

				jQuery('#Inline_'+formName).find('#'+attribute).trigger('click');
			}
		}
        if(attribute != "requestedby" && attribute != "ownerid"){
            var hiddenValue = jQuery('#'+formName).find('#'+attribute)[0].value;//NO I18N

            //document.getElementById('Form_'+attribute).innerHTML = ''
            //jQuery('#Inline_'+formName).find('#'+attribute)[0].onfocus();

            jQuery('#Inline_'+formName).find('#'+attribute)[0].value = hiddenValue;//NO I18N

            var elementType = jQuery('#'+formName).find('#'+attribute)[0].getAttribute('elementType');
            var element = jQuery('#Inline_'+formName).find('#'+attribute)[0];
            if ( elementType == 'datetime' || elementType == 'date' )
            {

                var hiddenDisplayValue = jQuery('#'+formName).find('#'+attribute+'_Display')[0].value;//NO I18N

                jQuery('#Inline_'+formName).find('#'+attribute+'_Display')[0].value = hiddenDisplayValue;//NO I18N
                jQuery('#Inline_'+formName).find('#'+attribute+'_Display').trigger('click');	//NO I18N
            }
            else if( element.type == 'text' ){jQuery(element).trigger('focus');}

            var callBack = jQuery('#'+formName).find('#'+attribute)[0].getAttribute('callBackFunc');
            if(callBack != null && callBack != undefined){
                callBack = callBack.slice(0,-2);
                window [callBack]();
            }
		}
	}
	else
	{
		// if there is any custom close method appendedn for that element..for e.g; in case of task group tech feilds..
		// invoking the click will work fine..
		var attrValue = jQuery('#Inline_'+formName).find('#Inline_selectattribute').val();
		jQuery('#Inline_'+formName).find('#Inline_'+attrValue).find('.ui-cancelicon').trigger('click');

		loadInLineForm(attribute,formName)
	}
    handleProjectEvents([
        { selector: '#Inline_'+attribute+' [sdpJs="js-event-ProjectDetailsIncludes-13"]', event: 'click', handler: function(event) { checkProjectForm(document.Inline_ProjectForm,null,null,true) } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectDetailsIncludes"]', event: 'click', handler: function(event) { cancelInline("Inline_ProjectForm") } },       //No I18N
        { selector: '#Inline_'+attribute+' [sdpJs="js-event-MileStoneDetailsTabs-6"]', event: 'click', handler: function(event) { checkMileStoneForm(document.Inline_MileStoneForm,null,null,true) } },       //No I18N
        { selector: '[sdpJs="js-event-MileStoneDetailsTabs"]', event: 'click', handler: function(event) { cancelInline("Inline_MileStoneForm"); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormOwnerInc-0"]', event: 'click', handler: function(event) {       //No I18N
            parent.showDialog(document.getElementById('MilestoneOwnerListInfo').innerHTML, 'closeButton=no, position=relative,closeOnBodyClick=yes');       //No I18N
            parent.handleProjectEvents([{ selector: '#_DIALOG_CONTENT [sdpJs="js-event-MilestoneFormOwnerInc-1"]', event: 'click', handler: function(event) { closeDialog(); } }]);       //No I18N
        } }
    ]);
}

function cancelInline(formid)
{
	var attrValue = jQuery('#'+formid).find('#Inline_selectattribute').val();

	jQuery('#'+formid).find('#Details_'+attrValue).attr('class', 'show');
	jQuery('#'+formid).find('#Inline_'+attrValue).attr('class', 'hide');
	jQuery('#'+formid).find('#Inline_'+attrValue).html('');

	jQuery('#'+formid).find('#Inline_selectattribute').val('');

	if(attrValue == "requestedby" && formid == "Inline_ProjectForm")
	{
		jQuery('#'+formid).find('#Details_department').attr('class', 'show');
		jQuery('#'+formid).find('#Inline_department').attr('class', 'hide');
		jQuery('#'+formid).find('#Inline_department').html('');

	}	

}
// to set N/A if the display value is null or empty..
function checkEmptyDisplayValues(id,doc)
{
	if(doc == null){doc = document;}

	var obj = doc.getElementById(id);
	if ( obj!=null && ( obj.innerHTML == null || obj.innerHTML == "null" || obj.innerHTML == "" ) )
	{
		obj.innerHTML = "-"; 		//NO I18N
	}
}

function cancelComment(comment, defaultNotifyOptions){
	
	var editCommentRow = jQuery(comment).closest('.proj-comment-row');		//NO I18N
	
	handleCancelCommentNotifySection(editCommentRow, defaultNotifyOptions);

	jQuery(editCommentRow).empty().html(jQuery('#hiddenComment').html());	// NO I18N
	jQuery('#hiddenComment').html('');
	jQuery('#Comments_Form_DIV').removeClass('ui-opacity5');					// NO I18N
	jQuery('.proj-comment-form').find('input').prop('disabled', false).css('cursor','');	// NO I18N
	jQuery('.proj-comment-form').find('textarea').prop('readonly', false).css('cursor','');	// NO I18N
	
	parent.jQuery(editCommentRow).find('.proj-comment-desc').on('click', function(){
		
		parent.EditComment( parent.jQuery(this).find("a"), defaultNotifyOptions );
	
	});
	
	parent.bindUnderlineCss( editCommentRow, 'notifiedUserLink' );		//NO I18N
}
function EditComment(comment, defaultNotifyOptions){
	
	if (jQuery('#hiddenComment').html() != ""){

		cancelComment(jQuery('[editSectionButton="true"]'), defaultNotifyOptions);
	}
	jQuery('#Edit_Comments_Form_DIV').html(jQuery('#Comments_Form_DIV').html());

	var cmt = jQuery(comment).html();
	cmt = cmt.replace(/<br>|<BR>/g,"\r\n"); //This is neccessary since we replace it in EntityComments.jsp

	var textAreaElem = jQuery('#Edit_Comments_Form_DIV').find('#commenttextarea')[0];
	textAreaElem.innerHTML = cmt;
	
	jQuery('#Edit_Comments_Form_DIV').find('#submitaction').val("updateComment");		//NO I18N
	jQuery('#Edit_Comments_Form_DIV').find('#commentid').val( parent.jQuery(comment).attr("id") );
	jQuery('#Edit_Comments_Form_DIV').find('#cancelButton').removeClass('hide').attr('editSectionButton', 'true');	// NO I18N
	
	jQuery('#hiddenComment').html(jQuery(comment).closest('.proj-comment-row').html());	// NO I18N
	
	var editCommentRow = jQuery(comment).closest('.proj-comment-row');		//NO I18N
	jQuery(editCommentRow).empty().html(jQuery('#Edit_Comments_Form_DIV').html());	// NO I18N
	
	parent.jQuery(editCommentRow).find('#cancelButton').on('click', function(){
		
		parent.cancelComment( parent.jQuery(this), defaultNotifyOptions );
	});
	
	handleEditCommentNotification(editCommentRow, defaultNotifyOptions);
	
	jQuery(editCommentRow).find('#CommentHeader').html( getMessageForKey("sdp.task.comment.updatecomment") );
	
	jQuery('#Edit_Comments_Form_DIV').html('');
	
	jQuery('#Comments_Form_DIV').addClass('ui-opacity5');
	jQuery('#Comments_Form_DIV').find('input').prop('disabled',true).css('cursor','not-allowed');	// NO I18N
	jQuery('#Comments_Form_DIV').find('textarea').prop('readonly',true).css('cursor','not-allowed');	// NO I18N
}

function deleteComment(id){
	
	if(window.confirm(getMessageForKey("sdp.admin.category.listview.delete.confirmdelete")))
	{
	jQuery('#Comments_Form_DIV').removeClass('ui-opacity5');
	jQuery('#Comments_Form_DIV').find('input').prop('disabled', false)	// NO I18N
	jQuery('#Comments_Form_DIV').find('textarea').prop('readonly', false);	// NO I18N



		jQuery('#Edit_Comments_Form_DIV').html(jQuery('#Comments_Form_DIV').html());

		jQuery('#Edit_Comments_Form_DIV').find('#submitaction').val("deleteComment");		//NO I18N
		jQuery('#Edit_Comments_Form_DIV').find('#commentid').val(id);
	
	var value = jQuery('#Edit_Comments_Form_DIV').find('#submitaction').val();
	
		jQuery('#Edit_Comments_Form_DIV').find('#CommentsForm').submit();
	}
}

function assocChangeToNewProject(){
	jQuery('#ProjectList_ID').attr('class','hide');
	jQuery('#ProjectForm_ID').attr('class','show');
	aswidth('#frmwidth','#assfrmwidth'); // No I18N
}
function deleteProjectdialog(form){

	var selVals = getSelectedCheckBoxes(form);
	if(selVals.length == 0) {
		alert(getMessageForKey('sdp.project.select.jserror'));
	} else {
		showDialog(jQuery('#deleteEntitydiv').html(),'closeButton=no, position=absmiddle');	//NO I18N
	}
}
function deleteProject(){

	var form = document.forms.ProjectForm;
	form.submitaction.value = 'DeleteProject';	//NO I18N
	if(jQuery("#cancelAssocChildEntity:checked").length > 0)
	{
		form.cancelAssocChange.value = 'true';
	}
	document.getElementById("ProjectListView_CREATEDBYtxt") && document.getElementById("ProjectListView_CREATEDBYtxt").remove();
	form.submit();
}

function checkProjectForm(myForm, submitBtn, addNew, submitForm) {
    if(myForm.projectid.value==''){
		myForm.projectid.value = document.getElementsByName('projectid')[0].value;
	}
	if(document.getElementsByName('projectid')[0].value != '' && projectStatusId==''){
		projectStatusId=openStatusId;
	}
	if(window.is_unique==false){
		window.is_unique=null;
		return false;
	}

	if (myForm.title){
		if (! validateProjectFormField(myForm.title,getMessageForKey("sdp.project.title.emptymsg"))){
			return false;
		}
	}

	if (! checkNumericFormFields([myForm.estimatedcost,myForm.tot_taskhours_cost,myForm.actualtaskhours,myForm.estimatedhours]) ){
		return false;
	}
	
	
	if(myForm.department && "" === myForm.department.value){
		 myForm.department.value = null;
	}

	if(myForm.department && myForm.requestedby && "" != myForm.requestedby.value.trim() && myForm.department.value != getUserDepartment(myForm.requestedby.value,myForm.projectid.value)[0]){
		var confirmMsg = confirm(translate("sdp.project.confirm.message.reqdept.notselected"));
		if(!confirmMsg){	return false;	}
	}
	if (document.getElementsByName('projectid')[0].value != ''){
		if(localSetting==null){	localSetting = getProjectSetting();}
		var isEnabled = localSetting.children_auto_close;
		if(myForm.projectid.value!='' && myForm.statusid && myForm.statusid.value == closedStatusId && (projectStatusId != closedStatusId || !submitBtn) && isEnabled && (isEnabled == true || isEnabled == "true")){//No I18N
			var confirmMsg = confirm(translate("project.validation.autoclose.parent.alert",["project", "milestones/tasks"]));
			if(!confirmMsg){	return false;	}
		}
	}

	if( ! checkForProjectUDF(myForm) ){
		return false;
	}
	
	if(myForm != document.Inline_ProjectForm){
		parent.editor.setHTML(getHTMLDescription());
		document.ProjectForm.description.value = getHTMLDescription(); // No I18N
	}

	if (addNew == true){myForm.submitaction.value = 'SaveAndAddNew';}

	disableButtonClick(submitBtn);
	if(submitForm){myForm.submit();}
		renderProjectWebComponent();
}

function checkNumericFormFields(numericElements){

	for (var i=0; i<numericElements.length; i++){
		var element = numericElements[i];
		if (element){
		    if(element.value != "" && element.value.trim() == ""){
                alert(getMessageForKey('sdp.common.number.validation.msg'));
                element.value = "";
                element.focus();
                return false;
            }
		    if(window.numeric_check_failed == true){
                window.numeric_check_failed = null;
                return false;
             }
			if (! checkNumeric(element,element.getAttribute("elemDataType"))){

				return false;
			}
		}
	}
	return true;
}

function enableSaveButton(submitBtn){
    parent.jQuery(submitBtn).prop("disabled",false); //No I18N
}

function checkForProjectUDF(myForm){

	if( ! checkForOnlyNumeric(myForm) ){
		return false;
	}

	if( ! validateUDFFields(myForm) ){
		return false;
	}
	return true;
}

function validateUDFFields(myForm){
	var udfFields = jQuery(myForm).find('input[name*=udf_]');
    for(var i=0; i<udfFields.length; i++){
        var udfField = udfFields[i];
        udfField.value = trimAll(udfField.value);
        var msgKey, args;
        if(udfField.getAttribute("fieldType") === "Decimal"){
            var precision = udfField.getAttribute("precision");
            if(udfField.value != ""){
            	var decimals = udfField.value.split('.');
            	if(decimals[0].length> 13 || (decimals.length > 1 && decimals[1].length > precision)){
	                msgKey = 'sdp.admin.common.decimalValidation.msg';//No I18N
	                args = [precision];
	            }
            }
        }else if(udfField.getAttribute("fieldType") === "Numeric"){//No I18N
            var min = udfField.getAttribute("num_range").split(":")[0] || "";
            var max = udfField.getAttribute("num_range").split(":")[1] || "";
            if(udfField.value != ""){
        		if(udfField.value.length > 19){
        			msgKey = "form.digits.maximumlength.alert";//No I18N
        			args=[19];
        		}else if((min != "" && parseInt(udfField.value) < min) || (max != "" && parseInt(udfField.value)>max)){
	                if(min != "" && max != ""){
	                    msgKey = 'form.value.rangevalue.alert';//No I18N
	                    args = [min, max];
	                }else if(min != ""){
	                    msgKey = "ae.asset.min.num.limit";//No I18N
	                    args = [min];
	                }else if(max != ""){
	                    msgKey = "ae.asset.max.num.limit";//No I18N
	                    args = [max];
	                }
	            }
		    }
        }else if(udfField.getAttribute("fieldType") === "Single Line"){//No I18N
            var min_len = udfField.getAttribute("min_len") || "";
            var max_len = udfField.getAttribute("max_len") || 250;
            if(udfField.value != ""){
                if(min_len != "" && max_len != "" && min_len == max_len && (udfField.value.length<min_len || udfField.value.length>max_len)){
                    msgKey = "form.character.exactlength.alert";//No I18N
                    args = [min_len];
                }else if(min_len != "" && udfField.value.length<min_len){
                    msgKey = "form.character.minimumlength.alert";//No I18N
                    args = [min_len];
                }else if(max_len != "" && udfField.value.length>max_len){
                    msgKey = "form.character.maximumlength.alert";//No I18N
                    args = [max_len];
                }
            }
        }
        if(msgKey){
            alert(getMessageForKey(msgKey,args));
            udfField.value = '';
            udfField.focus();
            return false;
        }
    }
    return true;
}
function checkForOnlyNumeric(myForm){
	var udfFields = jQuery(myForm).find('input[name*=udf_]');
	for(var i=0; i<udfFields.length; i++){
		var udfField = udfFields[i];
		var only_numeric = udfField.getAttribute('only_numeric');
		if(only_numeric == 'true' && window.numeric_check_failed == true){
            window.numeric_check_failed=null;
        	return false;
        }
		if(udfField.value != "" && only_numeric == 'true'){
			var isDecimal = ('Decimal' === udfField.getAttribute('numeric_type'));	//No I18N
			if(isDecimal ? !isDouble(udfField.value) : !isNumeric(udfField.value)){
				alert(getMessageForKey('sdp.common.number.validation.msg'));
				udfField.value = '';
				udfField.focus();
				return false;
			}
		}
	}
	return true;
}

function checkForFixedLength(myForm){
	var udfFields = jQuery(myForm).find('input[name*=udf_]');
	for(var i=0; i<udfFields.length; i++){
		var udfField = udfFields[i];
		var fixed_length = udfField.getAttribute('fixed_length');
		udfField.value = trimAll(udfField.value);
		if(udfField.value != "" && fixed_length != null && fixed_length != -1 && udfField.value.length != fixed_length){
			alert(getMessageForKey('sdp.jserror.requestcustomnumericfields.length',[fixed_length]));
			udfField.value = '';
			udfField.focus();
			return false;
		}
	}
	return true;
}

function checkMileStoneForm(myForm, submitBtn,addNew,submitForm){

	if (myForm.title){
		if (! validateProjectFormField(myForm.title,getMessageForKey("sdp.milestone.title.emptymsg"))){
			return false;
		}
	}
	if(document.getElementsByName('milestoneid')[0].value != '' && milestoneStatusId==''){
		milestoneStatusId=openStatusId;
	}

	if (! checkNumericFormFields([myForm.actualtaskhours,myForm.estimatedhours]) ){

		return false;
	}
	parent.editor.setHTML(getHTMLDescription());
	document.MileStoneForm.description.value = getHTMLDescription(); // No I18N
	if (document.getElementsByName('milestoneid')[0].value != ''){
		if(localSetting==null){	localSetting = getProjectSetting();}
		var isEnabled = localSetting.children_auto_close;
		if(myForm.statusid && myForm.statusid.value == closedStatusId && (milestoneStatusId != closedStatusId || !submitBtn) && isEnabled && (isEnabled == true || isEnabled == "true")){//No I18N
			var confirmMsg = confirm(translate("project.validation.autoclose.parent.alert", ["milestone", "tasks"]));
			if(!confirmMsg){	return false;	}
		}
	}

	if (addNew){

		myForm.submitaction.value = 'SaveAndAddNew';	// NO I18N
		myForm.target = "SDPHeaderFrame";
	}

	disableButtonClick(submitBtn);
	if(submitForm){myForm.submit();}
    renderMilestoneWebComponent();
}

function validateProjectFormField(element,emptymsg){

	if(element.value.trim() == "" || element.value == "null"){

		alert(emptymsg);
		// this is to avoid cross browser issue..
		setTimeout(function() {element.focus();}, 10);
		element.value='';
		return false;
	}
	return true;
}

parent.jQuery(document).ready(function() {
    if(parent.jQuery('.ui-header-box-status1').length!=0)
	{
		parent.jQuery('.ui-header-box-status1 .date').prepend('<img src="/images/spacer.gif" width="200" height="1" /><div class="clear"></div>');
	}
});


function cancelMileStoneForm(){


	if (document.MileStoneForm.submitaction.value == 'UpdateMileStone'){

		loadMileStoneDetailsInline('&milestoneid='+jQuery('#milestoneid').html());	// NO I18N
	}else{
		$projects.loadMileStoneList();
	}
}

function initProjectCalendar(element){

	if('scheduledstarttime' == element){

		compareElement = 'scheduledendtime';errorCondition = '';setHrsMins = '00:00';		//NO I18N

	}else if('scheduledendtime' == element){	//NO I18N

		compareElement = 'scheduledstarttime';errorCondition = 'less';setHrsMins = '23:59';		//NO I18N

	}else if('actualstarttime' == element){		//NO I18N

		compareElement = 'actualendtime';errorCondition = '';setHrsMins = '00:00';		//NO I18N

	}else if('actualendtime' == element){		//NO I18N

		compareElement = 'actualstarttime';errorCondition = 'less';setHrsMins = '23:59';		//NO I18N

	}else if('projectedend' == element){		//NO I18N

		compareElement = null;errorCondition = '';setHrsMins = '23:59';		//NO I18N
	}

	initRelationalCal('checkDate_InlineSubmit',element , compareElement , errorCondition , false , setHrsMins , true)	// NO I18N
}

function initRelationalCal(postInvokeFunction ,element , compareElement , errorCondition , showNow_Today , setHrsMins , hideTime){
	var dateValue=document.getElementById(element).value;
	document.getElementById(element+'_Display').setAttribute('data-clear','yes');// NO I18N
	
	var resetValue = false;
	var presValue = document.getElementById(element).value;

	if( ( presValue == null || presValue == '' ) && compareElement != null && document.getElementById(compareElement).value != null ){

		var val = document.getElementById(compareElement).value;

		if( val != '' && val != '-' ){

			// this will handle the different timezone problems too..
			if(setHrsMins == '23:59'){val = parseInt(val) + ( 24*60*60*1000 - 60*1000 );

			}else{val = parseInt(val) - ( 24*60*60*1000 - 60*1000 );}

			var dt = new Date();dt.setTime(val);

			resetValue = true;document.getElementById(element).value = dt.getTime();
		}
	}
    var fromGantt = postInvokeFunction === 'checkGanttInlineDates'; //NO I18N
	if( postInvokeFunction == 'checkDate_InlineSubmit' ){postInvokeFunction = checkDate_InlineSubmit;

	}else if( postInvokeFunction == 'checkGanttInlineDates' ){postInvokeFunction = checkGanttInlineDates;	}	// NO I18N

	initCalendar(element, null, null, null, null, postInvokeFunction, window, [element , compareElement, getMessageForKey("sdp.common.task.actualtimecheck.jserror") , errorCondition],showNow_Today, setHrsMins ,hideTime, null, null, null, {'reInitCalendar': fromGantt, "todayButton": true}); //NO I18N

	if( resetValue ){document.getElementById(element).value = '';if('scheduledstarttime' == element){document.getElementById('Details_scheduledstarttime').innerHTML = "-"}}
}

function checkDate_InlineSubmit(element , compareElement , msg ,errorCondition){
	if( compareElement != null ){

		var valid = checkValidDate( $(element), $(compareElement), msg,errorCondition);

		if( ! valid ){return false;}
	}
	if (document.getElementsByName('projectid')[0].value != ''){
		if(localSetting == null){	localSetting = getProjectSetting();}
		var isEnabled = localSetting.top_bottom_auto_scheduling;
		/* Showing prompt only when scheduled start time moved from/to certain value */
		if('scheduledstarttime' == element && isEnabled && (isEnabled == true || isEnabled == "true")){
			var isOldValNull = document.getElementById('Details_scheduledstarttime') == null || document.getElementById('Details_scheduledstarttime').innerHTML == '-';
			var isNewValNull = document.getElementById('scheduledstarttime').value == 'null' || document.getElementById('scheduledstarttime').value == '';// NO I18N
			var parentEntity = document.getElementsByName('milestoneid')[0]?"milestone":"project";//NO I18N
			var childEntitiyNames = document.getElementsByName('milestoneid')[0]?"tasks":"milestones and tasks";//NO I18N
			if (!(isOldValNull || isNewValNull)){
				if(!confirm(translate("project.validation.topbottom.parent.alert",[parentEntity, childEntitiyNames]))){return false;}
		    }
	    }
	}
	if( shouldSubmit && parent.jQuery('#Inline_selectattribute').length >0 && parent.jQuery('#Inline_selectattribute').val() !== '' ){

		parent.jQuery('#Inline_selectattribute').parents()[0].submit();

		if (typeof taskcombinedViewObj === "object") { // To refresh Task combined-view , when calendar value is changed in spot-edit
			taskcombinedViewObj.refreshOnEdit();
		}
		if(typeof scheduler != "undefined" && scheduler.isactive){
			editschedulertask(Inline_TaskForm.TASKID.value);
	}
}

    //handle for milestone and project attachment component
        if(document.getElementById("Details_MileStoneForm") != null){
           renderMilestoneWebComponent();
        }else if(document.getElementById("ProjectDetailsInfo_DIV") != null){
        	renderProjectWebComponent();
        }
}

function confirmDeleteLink(url,from){

	url = url + '&from='+from;	// NO I18N
	if(jQuery("#cancelAssocChildEntity:checked").length > 0)
	{
		url = url + '&cancelAssocChange=true';	// NO I18N

	} else {

		url = url + '&cancelAssocChange=false';	// NO I18N
	}
	var tempForm=getTempForm(url);
	if("gantt" == from){

			tempForm.setAttribute('target','SDPHeaderFrame');
	}
	tempForm.submit();
	setTimeout(function(){window.location.href = '/ui/projects?mode=list&fromDetails=true'},100);
}
function confirmMilestoneDeleteLink(key,url,from){

	if ( confirm(getMessageForKey(key)) ){
		url = url + '&from='+from;      // NO I18N
        var tempForm=getTempForm(url);
		if("gantt" == from){
		    tempForm.setAttribute('target','SDPHeaderFrame');
		}
		tempForm.submit();
	}
}

//Not used by projects module. This method can be removed if AttachmentTable.jspf is removed.
function hoverAttachment(ele){

	parent.jQuery(ele).addClass('ui-hover1').find('#deleteicon').removeAttr('class').addClass('ui-button-del1');	//NO I18N
}

//Not used by projects module. This method can be removed if AttachmentTable.jspf is removed.
function hoverOutAttachment(ele){

	parent.jQuery(ele).removeClass('ui-hover1').find('#deleteicon').removeAttr('class').addClass('ui-button-del2');	//NO I18N
}

//Not used by projects module. This method can be removed if LoadFileAttachments.jspf is removed.
function addNewAttachLink(){

	document.getElementById('attachfileButton').click();
}
function checkNullDueDateValue(elem,div,classname){

	if ( elem.innerHTML == "null" || elem.innerHTML == "-" ){

		div.className = 'hide';

	}else{div.className = classname;}
}

function enableOnSelectCheckboxActions(thisForm, checkBoxCompName) {

	toSelectAll = false;

	if (thisForm.checkbox23.checked) {toSelectAll = true;}

    	for (var i = 0; i < thisForm.elements.length; i++) {

        	if (thisForm.elements[i].name == checkBoxCompName) {thisForm.elements[i].checked = toSelectAll;}
    	}

	var totchk = jQuery(thisForm).find('input[name=checkbox]:checked').length;

	if(totchk == 0 && thisForm.checkbox23.checked){return;}

	if(totchk!=0 || toSelectAll){

		jQuery(thisForm).find('.ui-listnav-controls').find('#role-setting').attr('trigger','enabled').removeClass('ui-opacity5').find('label').children().prop('disabled', false);// NO I18N
		jQuery(thisForm).find('.ui-listnav-controls').find('.ui-listnav-countfilter').children().eq(1).prop('disabled', false);// NO I18N

	}else{

		jQuery(thisForm).find('.ui-listnav-controls').find('#role-setting').attr('trigger','disabled').addClass('ui-opacity5').find('label').children().prop('disabled',true);// NO I18N
		jQuery(thisForm).find('.ui-listnav-controls').find('.ui-listnav-countfilter').children().eq(1).prop('disabled',true);// NO I18N
	}
}

function scrollToElement(element, scrollSpeed, additionalParam){

	var headerTop = parent.jQuery(element).offset(), top1=0;

	if(headerTop != undefined){top1 = headerTop.top;}

	if (additionalParam != null && additionalParam != undefined && additionalParam != ""){

		top1 += additionalParam;
	}

	if( parent.jQuery('#_DIALOG_LAYER')[0] != null && parent.jQuery('#_DIALOG_LAYER')[0].style.visibility == 'visible' ){

		top1 += -75;
		parent.jQuery('#_DIALOG_CONTENT').animate({scrollTop: top1}, scrollSpeed );
	}else{
		parent.jQuery('body,html').animate({scrollTop: top1}, scrollSpeed );
	}
}

function focSearchText(searchText)
   {
            if(searchText.value == getMessageForKey("sdp.leftpanel.search.keyword"))
            {
                    searchText.value = '';
            }
            else if(searchText.value == '')
            {
                    searchText.value = getMessageForKey("sdp.leftpanel.search.keyword");
            }
  }

function searchTxtChange(form)
   {
            if(form.searchText.value == getMessageForKey("sdp.leftpanel.search.keyword"))
            {
                    form.searchText.value='';
            }
  }

function updateProjectListView(selObj) {
	var type = selObj.value;
	var newVal = "&filter=" + selObj.value+"&PORTALID=" + PORTALID;		//NO I18N

	var changeid = document.getElementById('CHANGEID');
	var initiatedBy = document.getElementById('initiatedBy');
	var from = document.getElementById('FROM')
	if( changeid != null && initiatedBy != null ){	newVal = newVal + "&CHANGEID=" + changeid.value + "&initiatedBy=" + 	 initiatedBy.value;	}	// No I18N
	if(from != null) {	newVal = newVal + "&FROM=" + from.value; 	}	// No I18N
	updateState(getPortalViewName("ProjectListView"),"_D_RP", newVal); // No I18N
	refreshSubView(getPortalViewName("ProjectListView")); // No I18N
}

function loadProjectTemplateList(){
   jQuery("#project_template").sdp_select2({
        closeOnSelect: true,
        allowClear : true,
        placeholder: translate("project.template.placeholder"),
        formatNoMatches : translate("ae.common.select2norecordsfound"),
	    width: '350px', //No I18N
        url:[{
        	url:"/api/v3/projects/template",//NO I18N
            field:'template', // NO I18N
            headers : { Accept: "vnd.manageengine.v3+json"}// NO I18N
    	}]
				//altered for msp.sdp's behaviour wont be affected
    });
    jQuery("#project_template").on('change', function (e) { //No I18N
    	if(e.val !=""){
        	projectTemplateContent(e.val);
    	}
    	else{
    	    jQuery("#ownerid").select2("destroy").val(""); //NO I18N
    		loadProjectOwner("ownerid"); //NO I18N
    	}
    });
}

function projectTemplateContent(id){
	var inputObject = {};
    	inputObject.fields_required = ["title","status","priority","estimated_hours","type","site","estimated_cost","description"]; //No I18N
    var dataVal = sdpAjaxInputData(inputObject);
    sdpAjax({
        url: '/api/v3/projects/template/' + id, // No I18N
        success: function(jsonArray) {
            var p_t = jsonArray.project_template;
            var jD = jQuery(document);
	            jD.find("#title").val(p_t.title);
	            editor.setHTML(p_t.description);
                jD.find("#estimatedhours").val(p_t.estimated_hours > 0 ? p_t.estimated_hours : "");
                jD.find("#estimatedcost").val(p_t.estimated_cost >0 ? p_t.estimated_cost : "");
                jD.find('#projecttypeid').val(p_t.type ? p_t.type.id : null);
                if(!isMSP){
                jD.find('#SITEID').val(p_t.site ? p_t.site.id : 0);
	            }
    			else if(p_t.site){
					jD.find('#SITEID').val(p_t.site.id);
				}
                jD.find('#statusid').val(p_t.status ? p_t.status.id : null);
                jD.find('#priorityid').val(p_t.priority ? p_t.priority.id : null);
                if(p_t.udf_fields){
                	var udfFields = p_t.udf_fields;
                	for(var key in udfFields){
                		if(key.indexOf('date') > 0){
                			if(udfFields[key] != null){
                				jD.find('#'+key).val(udfFields[key].value);
                				jD.find('#'+key+'_Display').val(udfFields[key].display_value);
                			}
                			else{
                				jD.find('#'+key).val(null);
                				jD.find('#'+key+'_Display').val(null);
                			}
                		}else{
                			jD.find('#'+key).val(udfFields[key]);
                		}
                	}
                }
                
            }
    });
   jQuery("#ownerid").select2("destroy").val(""); //NO I18N
   loadProjectOwner("ownerid",null,{"template" : { "id": id} }); //NO I18N
}

function getUserDepartment(userId,projectid){
   var deptId = '', deptName = '';
        var input_data = {
            list_info: {
		        fields_required: ["id","department"],//NO I18N
                search_criteria:{ "field": "id","condition":"eq","value":userId } //NO I18N
        }
    }
	sdpAjax({
            type: "GET", //No I18N
            data: sdpAjaxInputData(input_data),
            url: projectid?"/api/v3/projects/"+projectid+"/requester":"/api/v3/projects/requester", // No I18N
            success: function(response) {
            	if(response.requester.size() > 0){
            	var dept= response.requester[0].department
            	if(dept!=null){
                deptId= dept.id;
                deptName=dept.name
                }
            }
            },
            async: false
        });
        return [deptId,deptName];
}

function getDepartment(currentvalue,id,projectId){
	jQuery("#"+id).sdp_select2({
        allowClear: true,
        value : currentvalue,
        url:[{
        url:projectId?"/api/v3/projects/"+projectId+"/department":"/api/v3/projects/department",//NO I18N
        field:'department' // NO I18N
    	}],
    	placeholder : getMessageForKey("admp.select.dept"),
    	width : "350px", //NO I18N
    	processResults: function(search_data,data,fields){
    		search_data.push({
    			id: data.id,
				text: data.text || data.name,
				site : data.site? data.site.name || data.site: null
    		})
    	},
    	formatResult: function(data) {
			return data.site? e_html(data.text) + ", " + e_html(data.site) : e_html(data.text);	// No I18N
			
		},
        formatSelection:function(data){
          	return data.site? e_html(data.text) + ", " + e_html(data.site) : e_html(data.text);	// No I18N
        }
    });
}

function getRequester(currentvalue,id,projectId){
	var params = {
		ignoreInitChk: true, 
		isAPI: true,
		width: "350px", //NO I18N
		url: projectId?'/api/v3/projects/'+projectId+'/requester':'/api/v3/projects/requester',  //NO I18N
		entity_name: 'requester',  //NO I18N
		multiple: false,
		placeHolder: getMessageForKey('sdp.purcase.request.select.requester'),
		tooltip: true,
		showAll: ['email_id', 'department', 'employee_id', 'name', 'is_vipuser'], //NO I18N
		searchOptions: ['name', 'email_id'],    //NO I18N
		formatSearching: window.translate("ae.common.search.text"),	//No I18N
		element:jQuery('#'+id),
		value : currentvalue && currentvalue.id!=''? currentvalue.id:null,
		objvalue: currentvalue && currentvalue.id!='' ? currentvalue: null
	};
    userSelect.initializeSelect2(params).on("select2-selecting", function(data) {
    	var attr = this.id === 'reqName'? 'deptName' : 'department';
    	var dept = data.object.department;
        jQuery("#"+attr).select2("data",dept?{id : dept.id, text: dept.name}: "");
        });
}

function showProjectTemplateFormInDialog(Id) {

    var code = "<form name='ProjectToTemplateForm' target='SDPHeaderFrame' class='form-horizontal four-col form-edit'><div class='form-wrapper'>";//No i18N
    code = code.concat("<div class='form-group'>");//No i18N
    code = code.concat("<div class='col-group fw'>");
    code = code.concat("<div class='col-fields'>");//No i18N
	code = code.concat("<label for='' class='left-col control-label'>"+getMessageForKey('sdp.project.template.entername')+"</label>");//No i18N
	code = code.concat("<div class='right-col'>");
	code = code.concat("<input  type='text' class='form-control' name='templateName' id='templateName' maxlength='100'>");
	code = code.concat("</div>");
	code = code.concat("</div>");
	code = code.concat("</div>");
	code = code.concat("</div>");
	code = code.concat("</div>");
	code = code.concat("<div class='form-footer'>");
	code = code.concat("<button class='btn btn-primary' data-event='click' data-handler='createTemplateFromProject("+Id+");return false;' nonce="+sdpNonce+">"+getMessageForKey('sdp.common.save')+"</button>");//No i18N
    code = code.concat('<button class="btn btn-default" data-event="click" data-handler="closeDialog();return false;" nonce='+sdpNonce+'>'+getMessageForKey("sdp.common.cancel")+'</button>     ');      //No i18N
	code = code.concat("</div>");
	code = code.concat("</form>");
    showDialog(code, 'closeButton=no,position=relative,width=400,modal=yes,title='+getMessageForKey("sdp.project.template.title"), () => {
        $sdEventListener(jQuery('[name="ProjectToTemplateForm"]'))
    });
}

function createTemplateFromProject(projectid){
	var name=jQuery('#templateName').val();
	if(jQuery.trim(name)==""){
		showalert( 'warning',translate("sdp.project.template.templatename.empty"),'isAutoHide=false'); // No I18N
		jQuery('#templateName').val("");
		return false;
	}
	var project_template={};
	var inputObject={};
    inputObject.name = name;
	var urlValue='/api/v3/projects/'+projectid+'/_create_template';// No I18N
	var methodType='POST';// No I18N
	var dataValue= sdpAjaxInputData(inputObject);

	sdpAjax({
            url: urlValue,
            type: methodType,
            data: dataValue,
            ignorefailuremessage: true,
            success: function(jsonArray) {
            	if(jsonArray.response_status.status==='success'){
            		showalert( 'success',translate('sdp.project.template.addnew.successmessage'),'isAutoHide=true,delay=3'); // No I18N
            		closeDialog();
            	}
            	else{
            		showalert( 'failure',jsonArray.response_status.messages[0].message,'isAutoHide=false'); // No I18N
            		jQuery('#templateName').val("");
            	}
            },
            failedCallBack: function(jqXHR, status) {
                if(jqXHR.responseJSON.response_status.messages[0].status_code === 4008) {
                    showalert( 'warning',translate("sdp.project.template.duplicate.templatename"),'isAutoHide=false,delay=3'); // No I18N
                } else {
                    showalert( 'warning',translate("sdp.project.filters.error.ajaxmessage"),'isAutoHide=true,delay=3'); // No I18N
                }
            }
        });
}

function filterProjectListView(id) {
    var selEle = jQuery("<span></span>");
    var disText = jQuery(".cb[value=" + id + "]").closest('li').find("[data-filter-content='item']").html(); selEle.val(id); selEle.attr('title', disText);
    resetNavigationState(getPortalViewName("ProjectListView"));//No i18N
    updateProjDetailsView(selEle[0]);
    jQuery("#ListViewFilterMenu").removeClass('open');
}


function updateProjDetailsView(selObj) {
    var val = selObj
    if (val.nodeName == "SELECT") {
        val = selObj.value;
        selectTaskView(selObj, selObj.value);
    }
    else {
        val = val.value
    }

    var reqParams = "";
    var prevParams = getState(getPortalViewName('ProjectListView'), '_D_RP');//No i18N
    if (prevParams != null) {
        reqParams = prevParams + "&filter=" + val + "&CHANGED=true";//No i18N
    }
    else {
        reqParams = prevParams;
    }

    if(reqParams.toQueryParams('&').PORTALID==null){
        reqParams+="&PORTALID=" + PORTALID; // NO I18N
    }

    updateState(getPortalViewName('ProjectListView'), '_D_RP', reqParams);//No i18N
    refreshSubView(getPortalViewName('ProjectListView'));//No i18N
    var filterError;
    setTimeout(function () {
        filterError = getState(getPortalViewName('ProjectListView'), 'filterError'); // NO I18N
        if (filterError) {
            showalert('failure', translate("sdp.common.filter.field.error"), 'isAutoHide=true,delay=5'); //No I18N
        }
    }, 1000);

}


function getTempForm(url){
    var actualUrl = url;
    url = url.substring(0, url.indexOf("?"));

	jQuery( "#tempForm" ).remove();
	jQuery("<form/>",{ action:encodeURI(url)}).attr('method','post').attr('id','tempForm').appendTo(document.body);
	jQuery('<input />').attr('type', 'hidden').attr('name',getCSRFParamName()).val(getCSRFParamValue()).appendTo('#tempForm'); // NO I18N

	var parser = document.createElement('a');
	parser.href = actualUrl;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			key=decodeURIComponent(pair[0]);
			value=decodeURIComponent(pair[1]);
			jQuery('<input />').attr('type', 'hidden').attr('name', encodeHTMLAttribute(key)).val(encodeHTMLAttribute(value)).appendTo('#tempForm'); // NO I18N
    }
    return tempForm;
}

function loadResourceUtilization(projectId) {
	jQuery(window).scrollTop(0);
	// jQuery("#resource-utilization").clone().appendTo("#ProjectResource_DIV");
	jQuery.ajax({
		url: "/ui/projects?mode=resource&projectId=" + projectId, // NO I18N
		async: false,
		success: function (result) {
			jQuery("#ProjectResource_DIV").html(result); // No I18N
		}
	});
	// initScheduler(projectId);
}

//Not used by projects module. This method can be removed if AttachmentTable.jspf is removed.
function attachmentDeleteLink(url,target){
    invokeProgressIndicator(null,'sdp.common.processing') // No I18N
    var tempForm=getTempForm(url);
    tempForm.setAttribute('target',target);
    tempForm.submit();
}

function goToHomeAfterProjectDelete(){
	setTimeout(function (){showalert('info',getMessageForKey("sdp.project.delete.redirectmessage"),'isAutoHide=false')},3000);// No I18N
   	setTimeout(function (){window.location.href = '/ui/home';},7000);	// No I18N
}

function renderProjectWebComponent() {
	 parent.jQuery("iframe[name='SDPHeaderFrame']").one('load', function () { // NO I18N
	 try {
			if (parent.WebComponents.getInstance("project_attach")) {
				parent.WebComponents.getInstance("project_attach").destroy(true);// NO I18N
				delete parent.WebComponents.instancePool["project_attach"];
			}
			//118119 -- RTA section Zoho color contrast changes updated
			ThemeCustomizer.zcontrastcolorinit("#Inline_ProjectForm");// NO I18N
		} catch (error) {
			/* eslint-disable no-console */
			console.error(error);
			/* eslint-enable no-console */
		}
		parent.WebComponents.render("project_attach");
	});

}

function renderMilestoneWebComponent() {
	parent.jQuery("iframe[name='SDPHeaderFrame']").off('load').on('load', function () { // NO I18N
		try {
			if (parent.WebComponents.getInstance("milestone_attach")) {
				parent.WebComponents.getInstance("milestone_attach").destroy(true);// NO I18N
				delete parent.WebComponents.instancePool["milestone_attach"];
			}
			enableSaveButton("#addMileStoneButton");
		} catch (error) {
			/* eslint-disable no-console */
			console.error(error);
			/* eslint-enable no-console */
		}
		parent.WebComponents.render("milestone_attach");
	});
}

function getReleasePermission(projectId){
	var links_data = {permissions : {}};
    var url = "/api/v3/projects/" + projectId + "/_links";//NO I18N
    var sdpOptions = {
        url: url,
        acceptODCompatible : true,
        success: function (response) {
            var links = response._links;
            links = links.links || links;
            links.forEach(function (link) {
                if(link.name){
                    if(links_data.permissions[link.name]){
                    	links_data.permissions[link.name][link.method] = true;
                	}else{
                        links_data.permissions[link.name] = {};
                        links_data.permissions[link.name][link.method] = true;
                    }
                }
            });
        },
        async: false
    };
    sdpAjax(sdpOptions);
    if(links_data.permissions && links_data.permissions.releases && links_data.permissions.releases.get){
        return true
    }else{
        return false;
    }
}

function getProjectRoles(projectId){
	var data;
        var input_data = {
            list_info: {
            	row_count: "100",
		        fields_required: ["name","description"] //NO I18N
        }
    }
	sdpAjax({
            type: "GET", //No I18N
            data: sdpAjaxInputData(input_data),
            dataType: "json", // No I18N
            url: "/api/v3/projects/"+ projectId + "/members/role", // No I18N
            success: function(response) {
                data = response;
            },
            async: false
        });
        return data;
}

function loadProjectOwner(id,projectid,input_data)
{
	jQuery("#"+id).sdp_select2({
        allowClear: true, width : "350px", //NO I18N
        url:[{
	        url:projectid ? "/api/v3/projects/"+projectid+"/owner" : "/api/v3/projects/owner" ,//NO I18N
	        field:'owner', // NO I18N
	        list_info:{fields_required:["name"],"row_count":20}, //No I18N
	        input_fields:input_data
		}],
    	placeholder : getMessageForKey("sdp.project.form.selectowner")
    });

}

/*
    Function to render tags section in project details page.
    @PARAM options - object containing associated tags, mode.
*/
function renderTagsSection(options) {
	ResourceLoader({
		js: ["/scripts/projectDetails.js", "/scripts/Tag.js", "/scripts/hbs-template-tags.js"],// NO I18N
		success: function() {
			options.projectId = document.getElementById('projectid')!=null?(document.getElementById('projectid').innerHTML!=''?document.getElementById('projectid').innerHTML:document.getElementsByName('projectid')[0].value):document.getElementsByName('projectid')[0].value;
			$projectDetails.renderTags(options);
		}
	});
}

function handleProjectEvents(actions){
    actions.forEach(action => {
        const element = jQuery(action.selector);
        if (element) {
            element.off(action.event).on(action.event, action.handler);
        }
    });
}
// Remove after project revamp
function milestoneFormEvents(){
    handleProjectEvents([
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-0"]', event: 'click', handler: function(event) { parent.showMoreTaskFeilds(parent.document.MileStoneForm); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-1"]', event: 'click', handler: function(event) { parent.initProjectCalendar("actualstarttime"); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-2"]', event: 'click', handler: function(event) { parent.initProjectCalendar("actualendtime"); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-3"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"int"); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-4"]', event: 'click', handler: function(event) { parent.initProjectCalendar("projectedend"); } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormMoreFields-5"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"int"); } },       //No I18N
        { selector: '[sdpJs="js-event-AddMilestoneForm-0"]', event: 'click', handler: function(event) { parent.initProjectCalendar("scheduledstarttime"); } },       //No I18N
        { selector: '[sdpJs="js-event-AddMilestoneForm-1"]', event: 'click', handler: function(event) { parent.initProjectCalendar("scheduledendtime"); } },       //No I18N
        { selector: '[sdpJs="js-event-AddMilestoneForm-2"]', event: 'click', handler: function(event) { parent.checkMileStoneForm(parent.document.MileStoneForm,this,null,true); } },       //No I18N
        { selector: '[sdpJs="js-event-AddMilestoneForm-3"]', event: 'click', handler: function(event) { parent.checkMileStoneForm(parent.document.MileStoneForm,this,true,true); } },       //No I18N
        { selector: '[sdpJs="js-event-AddMilestoneForm-4"]', event: 'click', handler: function(event) { parent.cancelMileStoneForm() } },       //No I18N
        { selector: '[sdpJs="js-event-MilestoneFormOwnerInc-0"]', event: 'click', handler: function(event) {       //No I18N
            parent.showDialog(document.getElementById('MilestoneOwnerListInfo').innerHTML, 'closeButton=no, position=relative,closeOnBodyClick=yes');       //No I18N
            parent.handleProjectEvents([{ selector: '#_DIALOG_CONTENT [sdpJs="js-event-MilestoneFormOwnerInc-1"]', event: 'click', handler: function(event) { closeDialog(); } }]);       //No I18N
        } }
    ]);
}

function projectFormEvents(){
    handleProjectEvents([
        { selector: '[sdpJs="js-event-ProjectForm"]', event: 'click', handler: function(event) { parent.checkProjectForm(this.form, this, null, true); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectForm-0"]', event: 'click', handler: function(event) { parent.checkProjectForm(this.form, this, true, true); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectForm-1"]', event: 'click', handler: function(event) { parent.cancelProjectForm(this.form) } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormFields-1"]', event: 'keydown', handler: function(event) { return (event.key!='Enter'); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormFields-1"]', event: 'change', handler: function(event) { parent.checkUniqueExists("ProjectCode",this) } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormFields-2"]', event: 'click', handler: function(event) { parent.initProjectCalendar("scheduledstarttime"); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormFields-3"]', event: 'click', handler: function(event) { parent.initProjectCalendar("scheduledendtime"); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormFields-4"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"int") } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-0"]', event: 'click', handler: function(event) { parent.initProjectCalendar("actualstarttime"); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-1"]', event: 'click', handler: function(event) { parent.initProjectCalendar("actualendtime"); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-2"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"int") } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-3"]', event: 'click', handler: function(event) { parent.initProjectCalendar("projectedend"); } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-4"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"Double") } },       //No I18N
        { selector: '[sdpJs="js-event-ProjectFormMoreFields-5"]', event: 'blur', handler: function(event) { return parent.checkNumeric(this,"Double") } }       //No I18N
    ]);
    parent.document.querySelectorAll('[sdpJs="js-event-CommonFormAdditionalFields-0"]').forEach(numeric =>{     //No I18N
        numeric.addEventListener('blur',function(event){
            return parent.checkNumeric(this,'int');     //No I18N
        });
    });
    parent.document.querySelectorAll('[sdpJs="js-event-CommonFormAdditionalFields-1"]').forEach(decimal =>{     //No I18N
        decimal.addEventListener('blur',function(event){
            return parent.checkNumeric(this,'Double');      //No I18N
        });
    });
    parent.document.querySelectorAll('[sdpJs="js-event-CommonFormAdditionalFields-2"]').forEach(date =>{        //No I18N
        date.addEventListener('click',function(event){
            parent.initCalendar(date.dataset.formname);
        });
    });
}
/* Project Code ends here */

//
