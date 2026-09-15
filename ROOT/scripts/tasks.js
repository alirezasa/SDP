/* $Id$ */

var mileTimeMap = null;

function showMoreTaskFeilds(formObj)
{

	parent.jQuery(formObj).find("tr[elementType='moreFeilds']").each( function() {

		parent.jQuery(this).attr('class','show');
	});

	parent.jQuery(formObj).find('#showMoreTaskFeilds').addClass('hide');
}

//workLog scripts


	var  userCostJson ;

	function isDouble(str)
	{
		var objRegExp = /^\d\d*(\.\d\d*)?$/;
		return objRegExp.test(str);
	}

//WorkLog Scripts...
	jQuery('#TaskGroupTechLayer').remove();
function selectTaskView(selObj, type) {

    var options =  selObj.options;
            for(var i=0; i<options.length;i++) {
        	option = options[i].value
           if(option == type) {
           	options[i].selected = true;
        }
    }
}

function loadParentDetails(url)
{
    if(window.opener != null)
    {
        window.opener.location.href=url;
        window.opener.focus();
        window.close();
    }
    else
    {
        window.open(url);
    }
//	window.close();
}
	    document.getElementById("WorkLogListView_CREATEDBYtxt") && document.getElementById("WorkLogListView_CREATEDBYtxt").remove();
function swapGroupTechMarkAssign(mark_assign, formElem,refresh_task_view){

	if( mark_assign == null || mark_assign == undefined ){
		mark_assign = parent.jQuery(formElem).find('#MarkedStatus').val();
	}
	var formGroupID = 'GROUPID';		//NO I18N
	var formOwnerID = 'OWNERID';		//NO I18N
	var formMarkedGroupID = 'MarkedGroupID';	//NO I18N
	var formMarkedOwnerID = 'MarkedOwnerID';	//NO I18N

	var disp_GroupID = parent.jQuery(formElem).find('#GROUPID_Disp').val();
	var disp_OwnerID = parent.jQuery(formElem).find('#OWNERID_Disp').val();

	/*if(parent.jQuery(formElem).attr('id') == 'TaskTemplateForm' || parent.jQuery(formElem).attr('id') == 'ReqTemplateTaskForm' ){

		formGroupID = 'group';		//NO I18N
		formOwnerID = 'technician';	//NO I18N
	}*/
	if(mark_assign == 'Mark'){

		parent.jQuery(formElem).find('#'+formMarkedGroupID).val(disp_GroupID);
		parent.jQuery(formElem).find('#'+formMarkedOwnerID).val(disp_OwnerID);

		parent.jQuery(formElem).find('#'+formGroupID).val('null');	//NO I18N
		parent.jQuery(formElem).find('#'+formOwnerID).val('null');	//NO I18N

	}else{
		parent.jQuery(formElem).find('#'+formGroupID).val(disp_GroupID);
		parent.jQuery(formElem).find('#'+formOwnerID).val(disp_OwnerID);

		parent.jQuery(formElem).find('#'+formMarkedGroupID).val('null');	//NO I18N
		parent.jQuery(formElem).find('#'+formMarkedOwnerID).val('null');	//NO I18N
	}

	if (typeof taskcombinedViewObj === "object" && mark_assign != null && (refresh_task_view === undefined && refresh_task_view != false)) { // To refresh Task combined-view , when task form submit
		taskcombinedViewObj.refreshOnEdit();
	}
	if(typeof scheduler != "undefined" && scheduler.isactive && mark_assign == "Assign"){
		editschedulertask(parent.jQuery(formElem).find('[name=TASKID]').val());
	}
}

function showGroupTechLayer(ele,layerElem,setsize, elemID)
{
	var closetd = jQuery(ele).closest('td');		//NO I18N
	var boxcnt = jQuery('#'+elemID);
	if(setsize)
	{
		if( boxcnt[0] != undefined ){
			jQuery(layerElem).appendTo(boxcnt[0]).show();
		} else{
			adjustMark_AssignLayer(ele,layerElem);
			jQuery(layerElem).show();
		}
		var setsize = false;
	}
	else
	{
		var labelw = closetd.prev().outerWidth();
		var fieldw = closetd.outerWidth();
		jQuery(layerElem).find('tr.tasklayerDummyClass > td:even').width(labelw);
		jQuery(layerElem).find('tr.tasklayerDummyClass > td:odd').width(fieldw);
		jQuery(layerElem).css('width',labelw+fieldw);		//NO I18N
		var setsize = true;
		showGroupTechLayer(ele,layerElem,setsize,elemID);
	}
	return false;
}

function adjustMark_AssignLayer(ele,layerElem){

	var closetd = jQuery(ele).closest('td');		//NO I18N
	var posleft = closetd.prev().offset().left - jQuery(window).scrollLeft();
	var postop = closetd.prev().offset().top - jQuery(window).scrollTop();
	jQuery(layerElem).css({
		'left':posleft,		//NO I18N
		'top':postop		//NO I18N
	});
}

function setMarkAssigntoggle( mark_assign , form )
{	
	if(form===null){
		form = jQuery("#TaskGroupTechLayer")[0]; //NO I18N
	}
	var parentElem = form;
	if( typeof form == 'string' ){		parentElem = parent.jQuery('#'+form);		}

	toggleMark_AssignStyle(mark_assign, parentElem);

	swapGroupTechMarkAssign(mark_assign, parentElem);

	parent.jQuery(parentElem).find('#MarkedStatus').val(mark_assign);

	show_HideMarkIcon(mark_assign , parentElem);
}

function show_HideMarkIcon(mark_assign , parentElem){

	if(mark_assign == "Assign"){

		parent.jQuery(parentElem).find('.mark-icon-right').addClass('hide');
		parent.jQuery(parentElem).find('[name="MarkIconEmptySpan"]').css('padding-left','19px');		//NO I18N
	} else{

		parent.jQuery(parentElem).find('.mark-icon-right').removeClass('hide');
		parent.jQuery(parentElem).find('[name="MarkIconEmptySpan"]').removeAttr('style');		//NO I18N
		parent.addInstantToolTip( "mark-icon-right", parent.getMessageForKey("task.marked.markedtooltip"), "." );		//NO I18N
	}
}

function toggleMark_AssignStyle(mark_assign, parentElem){

	if(mark_assign == 'Mark'){

		jQuery(parentElem).find('#MarkButton').attr('class','toggle-btn1-on');
		jQuery(parentElem).find('#AssignButton').attr('class','toggle-btn1-off tgl-btn-posfix');

	}else{
		jQuery(parentElem).find('#AssignButton').attr('class','toggle-btn1-on tgl-btn-posfix');
		jQuery(parentElem).find('#MarkButton').attr('class','toggle-btn1-off');
	}
}

function editschedulertask(id) {
	jQuery('#scheduler_container').scheduler('reload_task',id, window.schedulerEvent);	//No I18N
}

function setTaskFilterForRM(id) {
	var filterName = jQuery(".cb[value="+id+"]").closest('li').find("[data-filter-content='item']").html();
	document.getElementById("selected_tasklist_filter").innerHTML = filterName;
	jQuery('#scheduler_container').scheduler("set_filter_and_refresh",id); //NO I18N

	var personalisedData = $tasks.getPersonalization("showAllTasks_tasks","tasks");//No I18N
    personalisedData.list_info.filter_by = {"id": id};// NO I18N
    addPersonalization("taskview_sidebar", personalisedData);

    var showAlltasks = $tasks.getPersonalization("showAllTasks_tasks","tasks");// NO I18N
    showAlltasks.list_info.filter_by = {'id':id};//NO I18N
    addPersonalization("showAllTasks_tasks",showAlltasks);
}

//this method will add instant showing tooltip(in black layer) of given @htmlString to the given @elem
function addInstantToolTip(elem, htmlString, idClassIdentifier, offsetElement, iframeElem){

	if( typeof elem == 'string' ){	elem = idClassIdentifier+elem;	}

	parent.jQuery(elem).off('mouseenter mouseleave');		//NO I18N

	parent.jQuery(elem).on('mouseenter', function(){

		addHoverToolTip(this, htmlString, offsetElement, iframeElem);

	}).on('mouseleave', function(){

		parent.jQuery('#hoveringTooltip').remove();
	})
}

function addHoverToolTip(elem, htmlString, offsetElement, iframeElem){

	if( offsetElement == null || offsetElement == undefined ){	offsetElement = elem;	}

	var frameTop = 0;
	if( iframeElem !== null && iframeElem !== undefined ){	frameTop = parent.jQuery(iframeElem).position().top;		}

	var frameLeft = 0;
	if( iframeElem !== null && iframeElem !== undefined ){	frameLeft = parent.jQuery(iframeElem).offset().left;		}

	parent.jQuery('body').append("<div id='hoveringTooltip' class='fontgrey' style='background-color:black;padding: 2px 9px;color:white;position:absolute;border-width:1px;border-style:dotted;border-color:black;z-index:100000;'></div>");
	parent.jQuery('#hoveringTooltip').html(htmlString);	//No I18N
    	parent.jQuery('#hoveringTooltip').css({

		"top" : parent.jQuery(offsetElement).offset().top + parent.jQuery(offsetElement).height()+5 + frameTop,	//No I18N
		"left" : parent.jQuery(offsetElement).offset().left + 10 + frameLeft	//No I18N
	});
}

function toggleCommentNotification(el){

	var formObj = parent.jQuery(el).parents('#CommentsForm');		//NO I18N

	var notifySelectElem = parent.jQuery(formObj).find("#CommentNotifyUsers");

	if(el.checked) {

		parent.jQuery(notifySelectElem).prop('readonly', false);		//NO I18N
		parent.jQuery(notifySelectElem).prop('disabled', false);		//NO I18N
		parent.jQuery(notifySelectElem).select2('enable');			//NO I18N

		parent.jQuery('#UserSearchHelp').css('display','block');	//NO I18N

    } else {

    	parent.jQuery(notifySelectElem).prop('readonly',true).prop('disabled',true);					//NO I18N

    	parent.jQuery(notifySelectElem).select2('disable');		//NO I18N

    	parent.jQuery('#UserSearchHelp').css('display','none');		//NO I18N
    }
}

function checkNotifyUsers( formObj, submitButton ){

	var selectedUsersDiv = parent.jQuery('#SelectedUsersDiv');

	parent.jQuery(selectedUsersDiv).html('');

	var failedEmailIDs = new Array();

	var notifyUsersResult = parent.jQuery(formObj).find('#CommentNotifyUsers').select2('data');		//NO I18N

	if( notifyUsersResult.size() > 0 ){

		for( var i=0; i<notifyUsersResult.size(); i++ ){

			var selectedObject = notifyUsersResult[i];

			var hiddenElem = document.createElement('input');

			hiddenElem.setAttribute('type', 'hidden');

			hiddenElem.setAttribute('name', 'notifyusers');

			hiddenElem.value = selectedObject.id;

			parent.jQuery(selectedUsersDiv).append( hiddenElem );
		}
	}

	if( parent.jQuery('#_DIALOG_LAYER')[0] == null || ( parent.jQuery('#_DIALOG_LAYER')[0] != null && parent.jQuery('#_DIALOG_LAYER')[0].style.visibility == 'hidden' ) ){

		parent.invokeProgressIndicator(null,'sdp.common.processing');		//NO I18N
	}

	disableButtonClick(submitButton);
	formObj.submit();
}

function handleCancelCommentNotifySection(editCommentRow, defaultNotifyUsers){

	if( jQuery(editCommentRow).find('#CommentNotificationSection') != null ){

		if( jQuery(editCommentRow).find('#toggleNotifyChk').is(':checked') ){

			jQuery(editCommentRow).find('#toggleNotifyChk').trigger('click');
			toggleCommentNotification( jQuery(editCommentRow).find('#toggleNotifyChk') );
		}

		jQuery('#Comments_Form_DIV').find('#commenttextarea').after( jQuery(editCommentRow).find('#CommentNotificationSection') );
	}

	if( defaultNotifyUsers != null ){

		parent.jQuery('#Comments_Form_DIV').find('#CommentNotifyUsers').select2('data', defaultNotifyUsers);		//NO I18N
	}
}

function bindUnderlineCss( parentElem, elementName ){

	parent.jQuery(parentElem).find('[name="'+elementName+'"]').on('mouseenter', function(){ //NO I18N

		parent.jQuery(this).css( "text-decoration", "underline" );		//NO I18N

	}).on('mouseleave', function(){ //NO I18N

		parent.jQuery(this).css( "text-decoration", "none" );		//NO I18N
	});
}

function confirmTaskDelete(form, checkBoxCompName, deleteConfirmObj, selectRowObj, fromRequest, formSubmit)
{
    if(confirmDelete(form,checkBoxCompName, deleteConfirmObj.innerHTML, selectRowObj.innerHTML))
    {
        form.action = form.action + "?delTask=Delete&mode=delete";//No i18N
        if(fromRequest == null)
        {
        handleStateForForm(form);
        }
		formSubmitAction(form,formSubmit, 'task_delete');
        return true;
    }
    else
    {
        return false;
    }
}

jQuery("body").removeClass("of-h").css("overflow" ,"auto"); //No I18N
