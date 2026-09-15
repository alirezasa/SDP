/* $Id$ */
function getVisibleExRowsCount(type)
{
	visibleRows = 0;
	if(type === "archive"){
		for (i=0; i<document.SDArchiveConfigForm.CHECK_BOX.length; i++)
		{
			if(document.SDArchiveConfigForm.CHECK_BOX[i].checked)
			{
				visibleRows++;
			}					
		}
	}
	else if(type === "deletion"){
		for (i=0; i<document.SDArchiveConfigForm.CHECK_BOX_DELETION.length; i++)
		{
			if(document.SDArchiveConfigForm.CHECK_BOX_DELETION[i].checked)
			{
				visibleRows++;
			}					
		}
	}
	return visibleRows;
}



function removeRow(uniqueId,type)
{
	visibleRows = getVisibleExRowsCount(type);
	var del="";
	if(type === "deletion"){
		del="DELETION_";//No I18N
	}

	//To remove the OR Lablel
	orElement = document.getElementById("OR_ROW_"+del+uniqueId);
	if(orElement!=null)
	{
		orElement.remove();	
	}
	else{
		if(type == "deletion"){
		    orElement = jQuery("span").closest("#deletionExceptonDiv").find("div[name='deletionOrClass']")[0];//No I18N
		    if(orElement != undefined){
			    orElement.remove();
			}
		}
		else{
			orElement = jQuery("span").closest("#archiveExceptionDiv").find("div[name='archiveOrClass']")[0];//No I18N
			if(orElement != undefined){
			    orElement.remove();
			}
		}
	}


	if(visibleRows>1)
	{
		chekBox = document.getElementById("CHECK_BOX_"+del+uniqueId);
		if(chekBox!=undefined)
		{
			chekBox.checked = false;
		}
		var templateElement = document.getElementById("EXCEPTION_RULE_" + del+uniqueId);
		if(templateElement != null)
		{
			templateElement.remove();
		}
	}
	else
	{
		//Last Row of the Exception Rules Block
		document.getElementById("RULE_CRITERIA_"+del+uniqueId).options[0].selected = true;
		document.getElementById("MATCH_CRITERIA_"+del+uniqueId).options[0].selected = true;
		document.getElementById("DISPLAY_DATA_"+del+uniqueId).value = "";
		document.getElementById("SELECT_DATA_"+del+uniqueId).value = "";
		
		if(type === "deletion"){
			document.SDArchiveConfigForm.allowExceptionForDeletion.checked=false;
			showAndHideExBlock("deletion");//No I18N
		}
		else{
			document.SDArchiveConfigForm.allowExceptionForArchive.checked=false;
			showAndHideExBlock("archive");//No I18N
		}
	}

}

function addNewRow(type)
{
	
	if( document.createElement && document.childNodes )
	{
		var uniqueID = Math.round((999 - 100) * Math.random() + 1);
		var del="";
		var divType="";
		if(type === "archive"){
			var validExceptionConfig = validateExceptionConfig(type);
			if(!validExceptionConfig)
			{
				return false;
			}
			templateElement = document.getElementById("archiveTemplateAbstract");
			orTemplateElement = document.getElementById("OR_ROW_TEMPLATE");
			divType="#archiveExceptionDiv";//No I18N
		}
		else{
			var validDelExceptionConfig = validateExceptionConfig(type);
			if(!validDelExceptionConfig)
			{
				return false;
			}	
			templateElement = document.getElementById("deletionTemplateAbstract");
			orTemplateElement = document.getElementById("OR_ROW_DELETION_TEMPLATE");
			del = "DELETION_";//No I18N
			divType="#deletionExceptonDiv";//No I18N
		}
		var newElement = templateElement.cloneNode(true);
        if(type === "archive"){
			newElement.querySelector("#EXCEPTION_RULE_TEMPLATE").classList.add("disp-b-imp"); //No I18N
		}
		else
		{
    		newElement.querySelector("#DELETION_EXCEPTION_RULE_TEMPLATE").classList.add("disp-b-imp"); //No I18N
		}
		newElement.classList.remove("hide");//No I18N
		newElement.id = "EXCEPTION_RULE_" + del+uniqueID;//No I18N
		jQuery(divType).append(newElement);
		updateElement(type,uniqueID,divType);

		var visibleExRows = getVisibleExRowsCount(type);
        if(visibleExRows>1)
        {
            var newORElement = orTemplateElement.cloneNode(true);
            newORElement.id = "OR_ROW_" +del+ uniqueID;        //No I18N
			newORElement.classList.add("disp-b-imp"); //No I18N
			newORElement.classList.remove("hide");//No I18N
            newElement.parentNode.insertBefore(newORElement,newElement);
        }
        else{
        	var nullOrNode = document.createElement("div");
        	nullOrNode.setAttribute("style","width:3%");
        	nullOrNode.addClassName("col-sm-1 disp-c");//No I18N
        	newElement.parentNode.insertBefore(nullOrNode,newElement);
        }
	}
}

/**unique id along with the type will be set to node when it gets duplicated.
* Default template element will gets cloned upon every rule addition.
*/
function updateElement(type,uniqueID,divType){
	var del = ""
	var delShort=""
	var boxType = "CHECK_BOX";//No I18N
	var templateName = "archiveTemplateDetails";//No I18N
	var divRuleName = ""
	if(type == "deletion"){
		delShort="Del" //No I18N
		del="DELETION_";//No I18N
		boxType = "CHECK_BOX_DELETION";//No I18N
		templateName = "deletionTemplateDetails";//No I18N
	}
	var clonedNode = jQuery(divType).find('[data-name='+templateName+']').last();
	var checkBoxNode = clonedNode.find("input[name="+boxType+"]");
	checkBoxNode.val(del+uniqueID);
	checkBoxNode.attr("id","CHECK_BOX_"+del+uniqueID);
	checkBoxNode.prop("checked",true); //No I18N
	var ruleCrit = clonedNode.find("select[name^='RULE_CRITERIA_']");
	ruleCrit.attr("id","RULE_CRITERIA_"+del+uniqueID);
	ruleCrit.attr("name","RULE_CRITERIA_"+del+uniqueID);
	ruleCrit.attr("data-id",uniqueID);
	ruleCrit.attr("data-action-name","archiveRuleCriteria"+delShort);
	var matchCrit = clonedNode.find("select[name^='MATCH_CRITERIA_']");
	matchCrit.attr("id","MATCH_CRITERIA_"+del+uniqueID);
	matchCrit.attr("name","MATCH_CRITERIA_"+del+uniqueID);
	var selData = clonedNode.find("input[name^='SELECT_DATA_']");
	selData.attr("id","SELECT_DATA_"+del+uniqueID);
	selData.attr("name","SELECT_DATA_"+del+uniqueID);
	selData.val("");
	var disData = clonedNode.find("input[name^='DISPLAY_DATA_']");
	disData.attr("id","DISPLAY_DATA_"+del+uniqueID);
	disData.attr("name","DISPLAY_DATA_"+del+uniqueID);
	disData.val("");
	disData.attr("data-id",uniqueID);
	disData.attr("data-action-name","display"+delShort+"DataName");
	var chooseBtn = clonedNode.find("span[name^='CHOOSE_BUTTON_']");
	chooseBtn.attr("id","CHOOSE_BUTTON_"+del+uniqueID);
	chooseBtn.attr("name","CHOOSE_BUTTON_"+del+uniqueID);
	chooseBtn.attr("data-id",uniqueID);
	chooseBtn.attr("data-action-name","display"+delShort+"DataName");
	var removeBtn = clonedNode.find("a[name^='REMOVE_BUTTON_']");
	removeBtn.attr("id","REMOVE_BUTTON_"+del+uniqueID);
	removeBtn.attr("name","REMOVE_BUTTON_"+del+uniqueID);
	removeBtn.attr("data-id",uniqueID);
	removeBtn.attr("data-action-name","remove"+delShort+"ButtonName");

}

//List the values for the selected rule
function openArchiveDataPicker(uniqueRowId,type)
{
	var del="";
	if(type==="deletion"){
		del="DELETION_";//No I18N
	}
	ruleCrit = "RULE_CRITERIA_" + del+uniqueRowId;//No I18N
	selectedValue = document.getElementById(ruleCrit).value;
	selectedCriteria = document.getElementById("MATCH_CRITERIA_" + del+uniqueRowId).value;//No I18N
	if((selectedValue != "-1") && (selectedCriteria != "-1"))//No I18N
	{
		var url = "/RulePopUp.do?isArchive=true&selVal=" + encodeURIComponent(selectedValue) + "&siteID=-1&element1=document.SDArchiveConfigForm.DISPLAY_DATA_" + encodeURIComponent(del+uniqueRowId) + "&element2=document.SDArchiveConfigForm.SELECT_DATA_" + encodeURIComponent(del+uniqueRowId) + "&from=rule&mode=add";//No I18N
		NewWindow(url ,'selectitem', 450, 350, 'yes', 'center');//No I18N
	}
	else
	{
		showOnSaveAlertMsg("sdp.archive.adminSetup.chooseColumnAndCriteriaMsg",null,false);//No I18N
	}

}

//If any of the rule in deletion exception list is empty, then next rule cannot be created and form cannot be saved.
function validateExceptionConfig(type)
{
	var result=true;
	var checked = true;
	if(document.SDArchiveConfigForm.allowExceptionForArchive.checked || document.SDArchiveConfigForm.allowExceptionForDeletion.checked){
		if(document.SDArchiveConfigForm.allowExceptionForDeletion.checked && type === "deletion")
		{
			checked = false;
			for (i=0; i<document.SDArchiveConfigForm.CHECK_BOX_DELETION.length; i++)
			{
				if(document.SDArchiveConfigForm.CHECK_BOX_DELETION[i].checked)
				{
					checked = true;

					var uniqueId = document.SDArchiveConfigForm.CHECK_BOX_DELETION[i].value;
					selectedColumnValue = document.getElementById("RULE_CRITERIA_"+uniqueId).value;
					selectedCriteriaValue = document.getElementById("MATCH_CRITERIA_"+uniqueId).value;
					selectValue = document.getElementById("SELECT_DATA_"+uniqueId).value;

					if(selectedColumnValue=="-1" || selectedCriteriaValue=="-1" || selectValue==null || selectValue.trim()=="")
					{
						showOnSaveAlertMsg("sdp.archive.adminSetup.invalidExceptionRuleMsg",null,false);	//No I18N
						result = false;
						break;
					}
				}
			}
		}
		if(document.SDArchiveConfigForm.allowExceptionForArchive.checked && type === "archive"){
			checked = false;
			for (i=0; i<document.SDArchiveConfigForm.CHECK_BOX.length; i++)
			{
				if(document.SDArchiveConfigForm.CHECK_BOX[i].checked)
				{
					checked = true;

					var uniqueId = document.SDArchiveConfigForm.CHECK_BOX[i].value;
					selectedColumnValue = document.getElementById("RULE_CRITERIA_"+uniqueId).value;
					selectedCriteriaValue = document.getElementById("MATCH_CRITERIA_"+uniqueId).value;
					selectValue = document.getElementById("SELECT_DATA_"+uniqueId).value;

					if(selectedColumnValue=="-1" || selectedCriteriaValue=="-1" || selectValue==null || selectValue.trim()=="")
					{
						showOnSaveAlertMsg("sdp.archive.adminSetup.invalidExceptionRuleMsg",null,false);	//No I18N
						result = false;
						break;
					}
				}
			}
		}
		if(!checked)
		{
			showOnSaveAlertMsg("sdp.archive.adminSetup.emptyExMsg",null,false);//No I18N
			result = false;
		}

	}
	return result;
}

//While saving - form will be validated.
/**
* validate conditions:
* 1. If any rule is empty or not
* 2. Time value validations - selected date should be greater than current date
* 3. similar criteria for both archive and deletion is checked
*/
function validateConfigForm(form,isMDH)
{
	var isDeletionEnabled=document.SDArchiveConfigForm.enableDeletionSchedule.checked;
	var isArchiveEnabled=document.SDArchiveConfigForm.enableArchiveSchedule.checked;

	if(isDeletionEnabled)
	{
		if(document.SDArchiveConfigForm.allowExceptionForDeletion.checked)
		{
			var validDelExceptionConfig = validateExceptionConfig("deletion");//No I18N
			if(!validDelExceptionConfig)
			{
				return false;
			}
		}
	}
	if(isArchiveEnabled)
	{
		if(document.SDArchiveConfigForm.allowExceptionForArchive.checked)
		{
			var validExceptionConfig = validateExceptionConfig("archive");//No I18N
			if(!validExceptionConfig)
			{
				return false;
			}
		}
	}
	if(isArchiveEnabled || isDeletionEnabled){

		if(jQuery("#startTimeDiv").hasClass('disp-b-imp'))
		{
			var startDate = document.SDArchiveConfigForm.startDate.value;
	 		if( startDate == '' )
			{
				showOnSaveAlertMsg("sdp.archive.adminSetup.startDateMsg",null,false);//No I18N
				jQuery('#startDate').trigger('focus');
				return false;
			}
			var hh = jQuery("#hours").val().split(" ")[0];
			var mm  = jQuery("#minutes").val().split(" ")[0];
			if(!isInteger(hh) && !isInteger(mm)){
				showOnSaveAlertMsg("sdp.select.valid.time",null,false);//No I18N
				return false;
			}
			var scheduled = getLongDate_ITIL(startDate,hh,mm);
			var now = getCurLongDate_ITIL();
			if( now > scheduled )
			{
				showOnSaveAlertMsg("sdp.reports.errmsg.invalidtimedateexception",null,false);//No I18N
				jQuery('#startDate').trigger('focus');
				return false;
	  		}

			var rptInt = document.SDArchiveConfigForm.interval.value;
			var isValidRptInt = isInteger(rptInt);
			if(!isValidRptInt)
			{
				showOnSaveAlertMsg("sdp.archive.adminSetup.invalidRptIntAlertMsg",null,false);//No I18N
				return false;
			}
			//This is mandatory for server side action.
			document.SDArchiveConfigForm.startDateChanged.value="true";

			document.SDArchiveConfigForm.hrs.value=hh;
			document.SDArchiveConfigForm.mins.value=mm;
			if(isMDH) {
				if(confirm(getMessageForKey("mdh.archive.schedule"))) {
					return true;
				}else {
					return false;
				}
			}
		}
	}
	if(isArchiveEnabled && isDeletionEnabled){
		var delStatus = document.SDArchiveConfigForm.statusCriteriaDel.value;
		var delDate = document.SDArchiveConfigForm.dateCriteriaDel.value;
		var delDuration_count = document.SDArchiveConfigForm.durationCriteriaDel_count.value;
		var delDuration_span= document.SDArchiveConfigForm.durationCriteriaDel_span.value;

		var arcStatus = document.SDArchiveConfigForm.statusCriteria.value;
		var arcDate = document.SDArchiveConfigForm.dateCriteria.value;
		var arcDuration_count = document.SDArchiveConfigForm.durationCriteria_count.value;
		var arcDuration_span= document.SDArchiveConfigForm.durationCriteria_span.value;


		if((delStatus === arcStatus) && (delDate === arcDate) &&
		((delDuration_span === arcDuration_span) || (delDuration_span==='MONTH'))){//No I18N
		/**
		  if delDuration_span & arcDuration_span is not equal. Checking whether dulDuration_span ==='Month' is enough, Because arcDuration_span will be 'Month' if delDuration_span is 'Year'  (Month < Year)
		**/
		  //SD-108329 fix
			if(delDuration_span!==arcDuration_span|| parseInt(delDuration_count) <= parseInt(arcDuration_count)){
				showOnSaveAlertMsg("sdp.admin.deletion.criteria.warning",null,true);//No I18N
				if(document.SDArchiveConfigForm.isWarningSeen.value === "true"){
					return true;
				}
				document.SDArchiveConfigForm.isWarningSeen.value = "true";
              	return false;
			}
		}
	}
	return true;
}



function getCurLongDate_ITIL()
{
  var dt = new Date();
  return dt.getTime();
}

function getLongDate_ITIL(dtFormat, hh, mm)
{
  var tmp = dtFormat.split(" ");//No I18N
  var dt = new Date();
  dt.setDate(tmp[0]);
  var date = new Date(dtFormat);
  dt.setMonth(date.getMonth());
  dt.setYear(tmp[2]);
  dt.setHours(hh);
  dt.setMinutes(mm);
  dt.setSeconds(0);
  return dt.getTime();
}

//Date criteria will be set based on status configured.
function setDateCriteria()
{
    var statusCriteriaValue = document.SDArchiveConfigForm.statusCriteria.value;
	if(statusCriteriaValue=="CLOSED_ONLY" || statusCriteriaValue=="ANY_COMPLETED_STATUS")
	{
		if(document.SDArchiveConfigForm.dateCriteria.options.length==1)
		{
			document.SDArchiveConfigForm.dateCriteria.options.length=2;
			var newOption = document.SDArchiveConfigForm.dateCriteria.options[1];
			newOption.value="CLOSED_DATE";//No I18N
			newOption.text=document.getElementById("closedDateString").innerHTML;
			document.SDArchiveConfigForm.dateCriteria.appendChild(newOption);

		}
	}
	else
	{
		if(document.SDArchiveConfigForm.dateCriteria.options.length==2)
		{
			document.SDArchiveConfigForm.dateCriteria.options[0].selected = true;
			document.SDArchiveConfigForm.dateCriteria.options[1] = null;
		}
	}

}

function setDateCriteriaDel()
{
    var statusCriteriaValue = document.SDArchiveConfigForm.statusCriteriaDel.value;
	if(statusCriteriaValue=="CLOSED_ONLY" || statusCriteriaValue=="ANY_COMPLETED_STATUS")
	{
		if(document.SDArchiveConfigForm.dateCriteriaDel.options.length==1)
		{
			document.SDArchiveConfigForm.dateCriteriaDel.options.length=2;
			var newOption = document.SDArchiveConfigForm.dateCriteriaDel.options[1];
			newOption.value="CLOSED_DATE";//No I18N
			newOption.text=document.getElementById("closedDateString").innerHTML;
			document.SDArchiveConfigForm.dateCriteriaDel.appendChild(newOption);

		}
	}
	else
	{
		if(document.SDArchiveConfigForm.dateCriteriaDel.options.length==2)
		{
			document.SDArchiveConfigForm.dateCriteriaDel.options[0].selected = true;
			document.SDArchiveConfigForm.dateCriteriaDel.options[1] = null;
		}
	}

}



function toggleStartTime()
{
	if(jQuery("#startTimeDiv").hasClass('disp-b-imp'))
	{
		jQuery("#startTimeDiv").removeClass('disp-b-imp')//No I18N
		jQuery("#startTimeDiv").addClass('hide')//No I18N

		jQuery("#startTimeTextDiv").removeClass('hide')//No I18N
		jQuery("#startTimeTextDiv").addClass('disp-b-imp')//No I18N
	}
	else
	{

		jQuery("#startTimeDiv").removeClass('hide')//No I18N
		jQuery("#startTimeDiv").addClass('disp-b-imp')//No I18N


		jQuery("#startTimeTextDiv").removeClass('disp-b-imp')//No I18N
		jQuery("#startTimeTextDiv").addClass('hide')//No I18N
	}
}

function showSchedule(type){
	if(type == "deletion"){
		if(document.SDArchiveConfigForm.enableDeletionSchedule.checked){
		  jQuery("#deletionCriteriaDiv").removeClass("arc-hide") //No I18N
	      jQuery("#scheduleColumn").slideDown();
	    }
	    else{
			jQuery("#deletionCriteriaDiv").addClass("arc-hide")//No I18N
	      if(!document.SDArchiveConfigForm.enableArchiveSchedule.checked){
	      	jQuery("#scheduleColumn").slideUp();
	      }
	    }
	}
	else{
		if(document.SDArchiveConfigForm.enableArchiveSchedule.checked){
	      jQuery("#archiveCriteriaDiv").removeClass("arc-hide")//No I18N
	      jQuery("#scheduleColumn").slideDown();
	    }
	    else{
	      jQuery("#archiveCriteriaDiv").addClass("arc-hide");//No I18N
	      if(!document.SDArchiveConfigForm.enableDeletionSchedule.checked){
	      	jQuery("#scheduleColumn").slideUp();
	      }
	    }
	}
}

function showAndHideExBlock(type)
{
	if(type == "deletion"){
		if(document.SDArchiveConfigForm.allowExceptionForDeletion.checked){
			jQuery('#deletionExceptonDiv').removeClass("arc-hide"); //No I18N
		}
		else{
			jQuery('#deletionExceptonDiv').addClass("arc-hide"); //No I18N
		}
	}
	else{
		if(document.SDArchiveConfigForm.allowExceptionForArchive.checked){
			jQuery('#archiveExceptionDiv').removeClass("arc-hide"); //No I18N

		}
		else{
			jQuery('#archiveExceptionDiv').addClass("arc-hide"); //No I18N
		}
	}
}

function duplicateExceptionCriteriaCheck(ruleCriteriaElement,type){
	if(type === "deletion"){
		var selectedRuleValue = ruleCriteriaElement.value;
		//Duplicate criteria will be checked only for scheduled deletion(both archive and active)
		if(selectedRuleValue != null && selectedRuleValue != "-1" && type === "deletion"){
			for (i=0; i<document.SDArchiveConfigForm.CHECK_BOX_DELETION.length; i++)
			{
				if(document.SDArchiveConfigForm.CHECK_BOX_DELETION[i].checked)
				{
					var criteriaVal =document.SDArchiveConfigForm.CHECK_BOX_DELETION[i].value;
					if(criteriaVal !=null){
						var otherCriteriaEle = document.getElementById("RULE_CRITERIA_"+criteriaVal);
						if(otherCriteriaEle != null && otherCriteriaEle.value === selectedRuleValue && !(ruleCriteriaElement === otherCriteriaEle)){
							showOnSaveAlertMsg("sdp.deletion.schedule.duplicate.criteria.warning.info",[ruleCriteriaElement.selectedOptions[0].text],false);//No I18N
							ruleCriteriaElement.value="-1";
							return false;
						}
					} 
				}					
			}
		}
	}
}

function handleRuleCriteriaChange(uniqueId,type)
{
	var del="";
	if(type === "deletion"){
		del="DELETION_";//No I18N
	}
	var ruleCriteriaElement = document.getElementById("RULE_CRITERIA_"+del+uniqueId);	//No I18N
	duplicateExceptionCriteriaCheck(ruleCriteriaElement,type);
	var matchCriteriaElement = document.getElementById("MATCH_CRITERIA_"+del+uniqueId);	//No I18N
    var displayData = document.getElementById("DISPLAY_DATA_"+del+uniqueId); //No I18N
    var selectData = document.getElementById("SELECT_DATA_"+del+uniqueId);
    if(ruleCriteriaElement != null && matchCriteriaElement !=null){
    matchCriteriaElement.value = "-1";
    displayData.value = "";
    selectData.value = "";
	if(ruleCriteriaElement.value=="5")
	{
		for(var i=0; i<matchCriteriaElement.options.length; i++)
		{	
			var optValue = matchCriteriaElement.options[i].value;
			if(optValue=="IS" || optValue=="IS_NOT")			//No I18N
			{
				matchCriteriaElement.options[i] = null;
				i=i-1;
			}	
		}
		matchCriteriaElement.options[0].selected = true;			
	}
	else
	{
		var selOptSize = matchCriteriaElement.options.length;
		var defOptSize = document.getElementById("MATCH_CRITERIA_"+del+"0").options.length;	//No I18N
		if(defOptSize!=selOptSize)
		{
			var defaultElement = document.getElementById("MATCH_CRITERIA_"+del+"0");	//No I18N
			for(var i=0; i<defOptSize; i++)
			{
				var optValue = defaultElement.options[i].value;
				if(optValue=="IS" || optValue=="IS_NOT")			//No I18N
				{
					selOptSize=selOptSize+1;
					matchCriteriaElement.options.length=selOptSize;
					var newOption = matchCriteriaElement.options[selOptSize-1];
					newOption.value=optValue;
					newOption.text=defaultElement.options[i].text;
					matchCriteriaElement.appendChild(newOption);
				}
			}	
			matchCriteriaElement.options[0].selected = true;
	}	}
	}
}

function showOnSaveAlertMsg(errorMsg,params,isWarning){
	if(errorMsg != null || errorMsg !=' '){
		if(jQuery('#showAlert').hasClass('hide')){
			jQuery('#showAlert').removeClass('hide');
		}
		var alertDiv = jQuery('#alertWarnDiv');
		if(!alertDiv.length){
			jQuery('#showAlert').append('<div class="alert alert-dismissible alert-danger icon disp-ib" role="alert" style="width: 700px;" id="alertWarnDiv"><button type="button" class="close" data-switch="sdalert"><span class="sdp-glyph sdp-glyph-close icon-xs" aria-hidden="true"></span><span class="sr-only"><%=bnd.getString("sdp.common.close") %></span></button><span class="msg"></span></div>')
		}
		if(isWarning){
			if(jQuery('#alertWarnDiv').hasClass('alert-danger')){
				jQuery('#alertWarnDiv').removeClass('alert-danger');
			}
			jQuery('#alertWarnDiv').addClass('alert-warning');
		}
		else{
			if(jQuery('#alertWarnDiv').hasClass('alert-warning')){
				jQuery('#alertWarnDiv').removeClass('alert-warning');
			}
			jQuery('#alertWarnDiv').addClass('alert-danger');
		}
		if(params !=null){
			jQuery('#showAlert').find('.msg').text(getMessageForKey(errorMsg,params));
		}
		else{
			jQuery('#showAlert').find('.msg').text(getMessageForKey(errorMsg));
		}
        jQuery(window).scrollTop(jQuery('#showAlert').position().top);
	}
}

