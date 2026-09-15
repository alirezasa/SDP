/* $Id$ */

function validateDelete(thisForm)
{
    returnValue = false;
    isSelected = false;
    for(var i=0; i<thisForm.elements.length; i++)
    {
        if(thisForm.elements[i].name == "selectedList")
        {
            if(thisForm.elements[i].checked)
            {
                isSelected = true;
            }
        }
    }
    if(isSelected)
    {
        returnValue = true;
    }
    else
    {
        alert(document.getElementById("checkforselection").innerHTML);
    }
    return returnValue;
}

function checkForDelete(thisForm,checkBoxCompName)
{
    returnValue = false;
    isSelected = false;
    for(var i=0; i<thisForm.elements.length; i++)
    {
        //if(thisForm.elements[i].name == "selectedList")
        if(thisForm.elements[i].name == checkBoxCompName)
        {
            if(thisForm.elements[i].checked)
            {
                isSelected = true;
                break;
            }
        }
    }
    if(isSelected)
    {
        returnValue = true;
    }
    return returnValue;
}

function selectAll(thisForm, checkBoxCompName)
{
    toSelectAll = false;
    if(thisForm.checkbox23.checked)
    {
        toSelectAll = true;
    }
    for(var i=0; i<thisForm.elements.length; i++)
    {
        if(thisForm.elements[i].name == checkBoxCompName)
        {
            thisForm.elements[i].checked = toSelectAll;
        }
    }
}

function confirmDelete(thisForm, checkBoxCompName, deleteConfirmString,selectRowString)
{
    deleteRows = false;
    if(checkForDelete(thisForm, checkBoxCompName))
    {
        deleteRows = true;
    }
    else
    {
        alert(selectRowString);
        return false;
    }
    if(confirmSubmit(deleteConfirmString))
    {
        deleteRows = true;
    }
    else
    {
        return false;
    }
    return deleteRows;
}

function checkForReqUDFNumeric() {
    var numFields = $A(jQuery('input[name*=udfName]'));            //No I18N
    var nosNumFields = numFields.length;
    for(i=0; i< nosNumFields; i++) {
        var nFl = numFields[i];
        if(nFl.getAttribute("isNum")!=null && nFl.getAttribute("isNum")=="true")
        {
            if(nFl != null && nFl.value !='') {
                trimAll(nFl);
                if(!checklong(nFl)) {
                    nFl.value = "";
                    nFl.focus();
                    return false;
                }
            }
        }
    }
    return true;
}

// This will be called from WorkOrder list view.  the difference between this and above
// checkRowSelection is, this method will not submit the form passed on validating true.
function checkForRowSelection(thisForm,checkBoxCompName)
{
    returnValue = false;
    isSelected = false;
    for(var i=0; i<thisForm.elements.length; i++)
    {
        if(thisForm.elements[i].name == checkBoxCompName)
        {
            if(thisForm.elements[i].checked)
            {
                isSelected = true;
            }
        }
    }
    if(isSelected)
    {
        returnValue = true;
    }
    return returnValue;
}

//var specchar1 = new Array(" ","`","~","!","#","$","%","^","&","*","(",")","+","=","|","\"","{","}","[","]",":",";","\\","'","<",">","?","/",",");
var leading = /^\s*/g;
var trailing =/\s*$/g;

function emailCheckDuplicate(email)
{
    var str = email;
    if(str=="")
    {
        showalert('failure', translate("sdp.common.notify.invalidemailjserror", [encodeHTML(email)]), "isAutoHide=true");	//NO I18N
        return false;
    }

    leadingremoved = str.replace(leading,"");
    str = leadingremoved.replace(trailing,"");

    if (str.length > 0)
    {
        var posadr1 = 0;
        var posdot = str.indexOf(".");
        var posadr = str.indexOf("@");
        posadr1=str.lastIndexOf("@");//No I18N
        if ( (posdot < 0) || (posadr < 0) || (posadr1 != posadr) )
        {
            showalert('failure', translate("sdp.common.notify.invalidemailjserror", [encodeHTML(email)]), "isAutoHide=true");	//NO I18N
            return false;
        }
    }
    var j = str.length;
    var strobj = new String(str);
    if (strobj.charAt(j-1)=="." || strobj.charAt(0)=="@" || strobj.charAt(j-1)=="@" || strobj.charAt(0)=="." || strobj.charAt(0)=="-" ||  strobj.charAt(j-1)=="-" || strobj.charAt(j-1)=="_" || strobj.charAt(j-2)=="." || strobj.charAt(j-2)=="-" || strobj.charAt(j-2)=="_")
    {
        showalert('failure', translate("sdp.common.notify.invalidemailjserror", [encodeHTML(email)]), "isAutoHide=true");	//NO I18N
        return false;
    }
    return true;
}

//newUI  will use new confirm dialog box rather than just alert.
//newUI is used for Zoom and ZohoAssist integration in SCPMSP
function emailCheck(email,newUI)
{
    var str = email.value;
    if(str=="")
    {
		if(newUI){
			showconfirm(true,'message='+document.getElementById('enteremail').innerHTML+', cancelbutton=OK, closebutton=no, closeOnEscKey=yes', focusOnEMail);////No I18N
		}
		else{
        alert(document.getElementById("enteremail").innerHTML);
        email.focus();
		}
        return false;
    }

    leadingremoved = str.replace(leading,"");
    str = leadingremoved.replace(trailing,"");

    if (str.length > 0)
    {
        var posadr1 = 0;
        var posdot = str.indexOf(".");
        var posadr = str.indexOf("@");
        posadr1=str.lastIndexOf("@");//No I18N
        if ( (posdot < 0) || (posadr < 0) || (posadr1 != posadr) )
        {
			if(newUI){
				showconfirm(true,'message='+document.getElementById('invalidemail').innerHTML+', cancelbutton=OK, closebutton=no, closeOnEscKey=yes', focusOnEMail);//No I18N
			}
			else{
            alert(document.getElementById('invalidemail').innerHTML);
            email.focus();
			}
            return false;
        }
    }
    var j = str.length;
    var strobj = new String(str);
    if (strobj.charAt(j-1)=="." || strobj.charAt(0)=="@" || strobj.charAt(j-1)=="@" || strobj.charAt(0)=="." || strobj.charAt(0)=="-" ||  strobj.charAt(j-1)=="-" || strobj.charAt(j-1)=="_" || strobj.charAt(j-2)=="." || strobj.charAt(j-2)=="-" || strobj.charAt(j-2)=="_")
    {
		if(newUI){
			showconfirm(true,'message='+document.getElementById('invalidemail').innerHTML+', cancelbutton=OK, closebutton=no, closeOnEscKey=yes', focusOnEMail);//No I18N
		}
		else{
        alert(document.getElementById('invalidemail').innerHTML);
        email.focus();
		}
        return false;
    }
    return true;
	
	function focusOnEMail()
	{
    email.focus();
	}
}

function validateEMailIDs(varEMail)
{
    email = trimAll(varEMail.value);
    if(email == "" || email==null)
    {
        alert(document.getElementById("enteremail").innerHTML);
        varEMail.value = email;
        varEMail.focus();
        return false;
    }
    if(email.indexOf(";") > 0) {
        email = email.replace(/\;/g,",");//No I18N
    }
    var mailids = email.split(",");//No I18N
    for(var i = 0; i < mailids.length; i++) {
        var result = emailCheckDuplicate(trimAll(mailids[i]));
        if(!result) {
            //alert(document.getElementById('enteremail').value);
            varEMail.value = email;
            varEMail.focus();
            return false;
        }
    }
    varEMail.value = email;
    return true;
}

function validateNumber(varNumber){
    var toAddress=varNumber.value;
    var isValid = !isNaN(parseFloat(toAddress)) && isFinite(toAddress);
   //SD-97181
    // there is no xss affect here, since we are show the message as alert
    var msg=document.getElementById("enterphoneno").innerHTML +""+toAddress;
    if(!isValid){
        alert(msg);
        varNumber.focus();
        return false;
    }
    return true;
}

function validateFullName(fullName)
{
    if(trimAll(fullName.value) == "")
    {
        alert(document.getElementById("entername").innerHTML);
        fullName.focus();
        return false;
    }
    fullName.value=trimAll(fullName.value);
    return true;
}

function validateUserName(userName)
{
    if(userName != null && isEmpty(userName.value))
    {
        alert(document.getElementById("enterloginname").innerHTML);
        userName.focus();
        return false;
    }
    if(userName != null)
    {
        userName.value=trimAll(userName.value);
    }
    return true;
}

function validatePwd(userPwd,confirmUserPwd)
{
    if( userPwd == undefined && confirmUserPwd == undefined )
    {
        return true;
    }

    if(userPwd.value == "")
    {
        alert(document.getElementById('enterpassword').innerHTML);
        userPwd.focus();
        return false;
    }
    if((userPwd.value != "") && (userPwd.value != confirmUserPwd.value))
    {
        alert(document.getElementById("incorrectretypepwd").innerHTML);
        confirmUserPwd.focus();
        return false;
    }
    return true;
}

function isDouble(str)
{
    var objRegExp = /^\d\d*(\.\d\d*)?$/;
    return objRegExp.test(str);
}

function selectCompWithName(compName, theForm)
{
    for(var i=0; i<theForm.elements.length; i++)
    {
        if(theForm.elements[i].name == compName)
        {
            theForm.elements[i].checked = true;
        }
    }
}

function deselectCompWithName(compName, theForm)
{
    for(var i=0; i<theForm.elements.length; i++)
    {
        if(theForm.elements[i].name == compName)
        {
            theForm.elements[i].checked = false;
        }
    }
}

//For FullControl box
function selectFGAAllPermission(component, checkboxComp,thisForm, dupCompAdd, dupCompEdit, dupCompDelete,fgaAdd, fgaEdit, fgaDelete)
{
    selectAllPermission(component, checkboxComp,thisForm);
    if(component.checked)
    {
        if(dupCompAdd!=null)
        {
            dupCompAdd.checked = true;
        }
        if(dupCompEdit!=null)
        {

            dupCompEdit.checked = true;
        }
        if(dupCompDelete!=null)
        {

            dupCompDelete.checked = true;
        }
        if(fgaAdd!=null)
        {
        	for(var j=0;j<fgaAdd.length;j++)
        	{
        		if(fgaAdd[j].name == 'assetFGAAddControl')
        		{
        			if(checkboxComp == 'contractControl')
        			{
        				if(fgaAdd[j].value == 'AddingNewVendor')
        				{
        					fgaAdd[j].checked= true;
        				}
        			}
        			else if(checkboxComp == 'purchaseControl')
        			{
        				if(fgaAdd[j].value != 'BookingTechnician')
        				{
        					fgaAdd[j].checked= true;
        				}
        			    if(fgaAdd[j].value == 'ViewAssociatedCI')
        			    {
        			        fgaAdd[j].checked = false;
        			    }
        			    else
        			    {
        			        fgaAdd[j].checked = true;
        			    }
        			}
        			else
        			{
        				fgaAdd[j].checked= true;
        			}
        		}
        		else
        		{
        			fgaAdd[j].checked= true;
        		}
        	}

        }
        if(fgaEdit!=null)
        {
            if (fgaEdit.length>1)
            {
                for(var j=0;j<fgaEdit.length;j++)
                {

                    fgaEdit[j].checked=true;
                }
            }
            else
            {
                fgaEdit.checked=true;
            }
        }
        if(fgaDelete!=null)
        {
            for(var j=0;j<fgaDelete.length;j++)
            {
                fgaDelete[j].checked=true;
            }
        }

    }
    else
    {
        if(dupCompAdd!=null)
        {
            dupCompAdd.checked = false;
        }
        if(dupCompEdit!=null)
        {

            dupCompEdit.checked = false;
        }
        if(dupCompDelete!=null)
        {

            dupCompDelete.checked = false;
        }
        if(fgaAdd!=null)
        {
        	for(var j=0;j<fgaAdd.length;j++)
        	{
        		if(fgaAdd[j].name == 'assetFGAAddControl')
        		{
        			wsFullControl = thisForm.wsFullControl.checked;
        			purchaseFullControl = thisForm.purchaseFullControl.checked;
        			contractFullControl = thisForm.contractFullControl.checked;

        			if(fgaAdd[j].value == 'AddingNewVendor')
        			{
        				if(!(wsFullControl || purchaseFullControl || contractFullControl) )
        				{
        					fgaAdd[j].checked= false;
        				}
        			}
                    else if(fgaAdd[j].value == 'BookingTechnician')
        			{
        				if(!wsFullControl )
        				{
        					fgaAdd[j].checked= false;
        				}
        			}
        			else
        			{
        				if(!(wsFullControl || purchaseFullControl))
        				{
        					fgaAdd[j].checked= false;
        				}
        			}
        		}
        		else
        		{
        			fgaAdd[j].checked= false;
        		}
        	}
        }
        if(fgaEdit!=null)
        {
            if (fgaEdit.length>1)
            {
                for(var j=0;j<fgaEdit.length;j++)
                {

                    fgaEdit[j].checked=false;
                }
            }
            else
            {
                fgaEdit.checked=false;
            }
        }
        if(fgaDelete!=null)
        {
            for(var j=0;j<fgaDelete.length;j++)
            {
                fgaDelete[j].checked= false;
            }
        }

    }

}

function selectViewPermission(compName,compToBeSelected, fullControlComp,theForm, checkList)
{
    if(compName.checked)
    {
        for(var i=0; i<theForm.elements.length; i++)
        {
            if(theForm.elements[i].type == "checkbox")
            {
                if(theForm.elements[i].value == compToBeSelected)
                {
                    theForm.elements[i].checked = true;
                }
            }
        }
        if(checkList) {
            for(var i=0;i<checkList.length;i++) {
                if(theForm[checkList[i]]) {
                    theForm[checkList[i]].checked = true;
                }
            }
        }
    }
    if(!compName.checked)
    {
        fullControlComp.checked=false;
    }
}

function deselectViewAndFGAPermission(compName,compToBeDeselected, fullControlComp, theForm,dupCompAdd,dupCompEdit,dupCompDelete,fgaAdd,fgaEdit,fgaDelete)
{
    deselectViewPermission(compName,compToBeDeselected,fullControlComp,theForm);
    if(!compName.checked)
    {
        if(dupCompAdd!=null)
        {
            dupCompAdd.checked = false;
        }
        if(dupCompEdit!=null)
        {
            dupCompEdit.checked = false;
        }
        if(dupCompDelete!=null)
        {
            dupCompDelete.checked = false;
        }
        if(fgaAdd!=null)
        {
    		for(var j=0;j<fgaAdd.length;j++)
            {
                if(fgaAdd[j].name == "assetFGAAddControl")
                {
                    wsFullControl = theForm.wsFullControl.checked;
                    purchaseFullControl = theForm.purchaseFullControl.checked;
                    contractFullControl = theForm.contractFullControl.checked;

                    if(fgaAdd[j].value == 'AddingNewVendor')
                    {
                        if(!(wsFullControl || purchaseFullControl || contractFullControl) )
                        {
                            fgaAdd[j].checked= false;
                        }
                    }
                    else
                    {
                        if(!(wsFullControl || purchaseFullControl))
                        {
                            fgaAdd[j].checked= false;
                        }
                    }
                }
                else
                {
                    fgaAdd[j].checked=false;
                }
            }
        }
        if (fgaEdit!= null)
 	   {	 
            if(fgaEdit.length > 1)
            {		   
 	          for (var g = 0; g < fgaEdit.length; g++) 
 			  {
                 fgaEdit[g].checked = false
               }
 		   }
 		   else
 		   {
 		      fgaEdit.checked = false;
 		   }
        }
        if(fgaDelete!=null)
        {
            for(var j=0;j<fgaDelete.length;j++)
            {
                fgaDelete[j].checked=false;
            }
        }
    }
}

function deselectViewPermission(compName,compToBeDeselected, fullControlComp, theForm)
{
    if(!compName.checked)
    {
        for(var i=0; i<theForm.elements.length; i++)
        {
            if(theForm.elements[i].type == "checkbox")
            {
                if(theForm.elements[i].name == compToBeDeselected)
                {
                    theForm.elements[i].checked = false;
                }
            }
        }
        fullControlComp.checked=false;
    }
}

function selectAllPermission(component, checkboxComp,thisForm)
{
    if((component.name == "woFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "woFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "prFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "prFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    //space 
    else if((component.name == "spaceFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "spaceFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
	//Maintenance 
    else if((component.name == "maintFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "maintFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "chFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "chFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "relFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "relFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "CMDBFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "CMDBFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "wsFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "wsFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "purchaseRequestFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "purchaseRequestFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "purchaseFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "purchaseFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "contractFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "contractFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "solutionFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "solutionFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "productFullControl" ) && (!component.checked))
    {
	    //SCP Product FGA - this feature is disabled for SDP as of now
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "productFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "reportsFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "reportsFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "announcementFullControl" ) && (component.checked))
    {
        selectCompWithName(checkboxComp,thisForm);
    }
    else if((component.name == "announcementFullControl" ) && (!component.checked))
    {
        deselectCompWithName(checkboxComp,thisForm);
    }
	else if(isMSPOrSCP) {
        if((component.name == "accountFullControl" ) && (component.checked))
        {
            selectCompWithName(checkboxComp,thisForm);
        }
        else if((component.name == "accountFullControl" ) && (!component.checked))
        {
            deselectCompWithName(checkboxComp,thisForm);
        }
    }
}

function checkFullControl(theForm,val)
{
    var countWo =0;
    var countWs =0;
    var countPurchase=0;
    var countPurchaseRequest =0;
    var countContract =0;
    var countSolution =0;
    var countReports = 0;
    var countProducts =0;
    var countProblems = 0;
    var countSpaces = 0;
	var countMaintenances = 0;
    var countChanges = 0;
	var countAccount = 0;
    var countannouncement=0;
    var countReleases = 0;
    var countCMDB = 0;
    for(var i=0; i<theForm.elements.length; i++)
    {
        /*
        if(theForm.elements[i].name == "woControl")
        {
            if(theForm.elements[i].checked)
            {
                countWo++;
            }
        }
        */
        if(theForm.elements[i].name == "prControl")
        {
            if(theForm.elements[i].checked)
            {
                countProblems++;
            }
        }
        if(theForm.elements[i].name == "spaceControl")
        {
            if(theForm.elements[i].checked)
            {
                countSpaces++;
            }
        }
		if(theForm.elements[i].name == "maintControl")
        {
            if(theForm.elements[i].checked)
            {
                countMaintenances++;
            }
        }
        if(theForm.elements[i].name == "chControl")
        {
            if(theForm.elements[i].checked)
            {
                countChanges++;
            }
        }
        if(theForm.elements[i].name == "relControl")
        {
            if(theForm.elements[i].checked)
            {
                countReleases++;
            }
        }
        if(theForm.elements[i].name == "CMDBControl")
        {
            if(theForm.elements[i].checked)
            {
                countCMDB++;
            }
        }
        if(theForm.elements[i].name == "wsControl")
        {
            if(theForm.elements[i].checked)
            {
                countWs++;
            }
        }
	if(  theForm.elements[i].name == "purchaseControl" )
	{
	    if( theForm.elements[i].checked )
	    {
	        countPurchase++;
            }
	}
        if( theForm.elements[i].name == "purchaseRequestControl" )
        {
            if( theForm.elements[i].checked )
            {
                countPurchaseRequest++;
            }
        }
        if(theForm.elements[i].name == "contractControl")
        {
            if(theForm.elements[i].checked)
            {
                countContract++;
            }
        }
        if(theForm.elements[i].name == "solutionControl")
        {
            if(theForm.elements[i].checked)
            {
                countSolution++;
            }
        }
        if(theForm.elements[i].name == "reportsControl")
        {
            if(theForm.elements[i].checked)
            {
                countReports++;
            }
        }
	if(isMSPOrSCP) {
        	if(theForm.elements[i].name == "productControl")
	        {
            		if(theForm.elements[i].checked)
	            	{
        	        	countProducts++;
            		}
        	}
	}
		if(isMSPOrSCP)
        {
            if(theForm.elements[i].name == "accountControl")
            {
                if(theForm.elements[i].checked)
                {
                    countAccount++;
                }
            }
        }
        if(theForm.elements[i].name == "announcementControl")
        {
            if(theForm.elements[i].checked)
            {
                countannouncement++;
            }
        }
    }
    /*
    if(countWo == '4')
    {
        theForm.woFullControl.checked=true;
    }
    */
    if(countWs == '4')
    {
        theForm.wsFullControl.checked=true;
    }
    if( countPurchase == '4' )
    {
	    theForm.purchaseFullControl.checked = true; 
    }
    if( countPurchaseRequest == '4' )
    {
        theForm.purchaseRequestFullControl.checked = true;
    }
    if(countContract == '4')
    {
        theForm.contractFullControl.checked=true;
    }
    if(countSolution == '4')
    {
        theForm.solutionFullControl.checked=true;
    }
    if(countProducts == '4')
    {
        theForm.productFullControl.checked=true;
    }
    if(countReports == '4')
    {
        theForm.reportsFullControl.checked=true;
    }
    if(countannouncement == '4')
    {
        theForm.announcementFullControl.checked=true;
    }
    if(countProblems == '4')
    {
        theForm.prFullControl.checked=true;
    }
    // for Space
    if(countSpaces == '4')
    {
        theForm.spaceFullControl.checked=true;
    }
	// for Maintenance
    if(countMaintenances == '4')
    {
        theForm.maintFullControl.checked=true;
    }
    if(countChanges == '4')
    {
        theForm.chFullControl.checked=true;
    }
    if(isMSPOrSCP)
    {
        if(countAccount == '5')
        {
            theForm.accountFullControl.checked=true;
        }
    }
    if(countReleases == '4')
    {
        theForm.relFullControl.checked=true;
    }
    if(countCMDB == '4')
    {
        theForm.CMDBFullControl.checked=true;
    }
    if(val!=null && val=='All')
    {
        theForm.showAssignedRequests[0].checked=true;
    }
    else if(val!=null && val=='Owned')
    {
        theForm.showAssignedRequests[2].checked=true;
    }
    else if(val!=null && val=='Queue')
    {
        theForm.showAssignedRequests[1].checked=true;
    }
}


function validateAssociateRoleForm(assignedRoles, tForm)
{
    if(assignedRoles.hasClassName("form-select2"))
    {
        var List = assignedRoles.selectedOptions;
        if(!assignedRoles) { return true; }  // if assign Roles select is absent
        var isApprove = false;
        if(document.getElementById('canApprovePOID')!= null && document.getElementById('canApprovePOID')!= 'undefined' && document.getElementById('canApprovePOID').checked == true)
        {
            isApprove = true;
        }

        //if(!isApprove && (List.length<=0 || List.options[0].value == '0')) -- refer the issue id  26093
        if(List.length<=0)
        {
            //alert("Either assign roles for the technican or check enable administrator privileges, to provide privileges for the technician login.");
            alert(document.getElementById("noroleselected").innerHTML);
            return false;
        }

        if(isApprove)
        {
            var approveRole = document.createElement("OPTION");
            approveRole.value = document.getElementById("SDAPPROVEPOID").innerHTML;
            approveRole.setAttribute('selected','true');
            assignedRoles.options.add(approveRole);
        }
        return true;
    }
    else
    {
        var List = assignedRoles;
        if(!List) { return true; }  // if list is absent
        var isApprove = false;
        if(document.getElementById('canApprovePOID')!= null && document.getElementById('canApprovePOID')!= 'undefined' && document.getElementById('canApprovePOID').checked == true)
        {
            isApprove = true;
        }

        //if(!isApprove && (List.length<=0 || List.options[0].value == '0')) -- refer the issue id  26093
        if(List.length<=0 || List.options[0].value == '0')
        {
            //alert("Either assign roles for the technican or check enable administrator privileges, to provide privileges for the technician login.");
            alert(document.getElementById("noroleselected").innerHTML);
            return false;
        }
        else
        {
            for (i=0;i<List.length;i++)
            {
                if(List.options[i].value != '0')
                {
                    List.options[i].selected = true;
                }
            }
        }

        if(isApprove)
        {
            var approveRole = document.createElement("OPTION");
            List.options.add(approveRole);
            approveRole.value = document.getElementById("SDAPPROVEPOID").innerHTML;
        }
        return true;
    }
}

function validateVendorForm(theForm)
{
	if(trimAll(theForm.organizationName.value) == "")
	{
		alert(document.getElementById('entervendorname').innerHTML);
		theForm.organizationName.focus();
		return false;
	}
	if(theForm.vendorCurrency.value == "-1")
	{
		alert(document.getElementById('entervendorcurrency').innerHTML);
		theForm.vendorCurrency.focus();
		return false;
	}
	if(theForm.organizationEmail.value != "")
	{
		if(!emailCheck(theForm.organizationEmail))
		{
			theForm.organizationEmail.focus();
			return false;
		}
	}
	theForm.organizationName.value = trimAll(theForm.organizationName.value);
	return true;
}


function valIncomingEmail(theForm)
{
    var mailOption = theForm.incomingMailOption.value;
    var idToHide = document.getElementById("outgoing");
    var authType = document.getElementById("incAuthType").value;
    var passwordElement;
    var ewsUrlRegex = new RegExp(/^https:\/\/.*\/ews\/exchange.asmx$/i);
    jQuery('#invalidEmailAlert').remove();

    //SD-105010
    if(mailOption === "ews" && !(oldIncMailOption === "ews" && oldIncAuthType === "oauth")) {
        if(isOffice365EWSConfigured(true, theForm, authType)) {
            alert(translate("mail.save.o365.ews.error")); //No I18N
        }
    }

    //SD-105010
    if(authType == "basic") {
        if(isOffice365BasicAuth(true, theForm)) {
            showalert('failure', getMessageForKey("mail.save.basic.error"), "isAutoHide=false"); //No I18N
            ShowEMailTab("incoming");//No I18N
            return false;
        }
    }

    if (idToHide.style.display != 'block')
    {
		if(mailOption == "javamail")
		{
            if(authType == "basic")
            {
                var hostname = trimAll(theForm.incomingHost.value);
                if(hostname == "")
                {
                    alert(document.getElementById("enterincomingserver").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingHost.focus();
                    return false;
                }
                if(hostname.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.servername"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthHost.focus();
                    return false;
                }
                theForm.incomingHost.value = hostname;

                var username = trimAll(theForm.userName.value);
                if(username == "")
                {
                    alert(document.getElementById("enterusername").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.userName.focus();
                    return false;
                }
                if(username.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthUsername.focus();
                    return false;
                }
                theForm.userName.value = username;

                if(("true" == document.EMailDefForm.changePwd.value || theForm.addEmailSetting!=undefined ))
                {
                    if(trimAll(theForm.userPwd.value) == "") {
                        alert(document.getElementById("enterpwd").innerHTML);
                        ShowEMailTab("incoming");//No I18N
                        theForm.userPwd.focus();
                        return false;
                    }
                    passwordElement = theForm.userPwd;
                }

                trimToEmail(theForm.toEmail); // To remove the leading and trailing "," characters in the email aliases
                var email = trimAll(theForm.toEmail.value);
                if(email == "")
                {
                    alert(document.getElementById("enteralias").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.toEmail.focus();
                    return false;
                }
                theForm.toEmail.value = email;
                if (!getTextToArrayAlias("toEmail")) {
                    theForm.toEmail.focus();
                    return false;
                }

                if(!checknumber(theForm.incomingPort))
                {
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingPort.focus();
                    return false;
                }
            }
            else if(authType == "oauth")
            {
                var hostname = trimAll(theForm.incJavaOauthHost.value);
                if(hostname == "")
                {
                    alert(document.getElementById("enterincomingserver").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthHost.focus();
                    return false;
                }
                if(hostname.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.servername"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthHost.focus();
                    return false;
                }
                theForm.incJavaOauthHost.value = hostname;

                var username = trimAll(theForm.incJavaOauthUsername.value);
                if(username == "")
                {
                    alert(document.getElementById("enterusername").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthUsername.focus();
                    return false;
                }
                if(username.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthUsername.focus();
                    return false;
                }
                theForm.incJavaOauthUsername.value = username;

                trimToEmail(theForm.incJavaOauthEmail);
                var email = trimAll(theForm.incJavaOauthEmail.value);
                if(email == "")
                {
                    alert(document.getElementById("enteralias").innerHTML);
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthEmail.focus();
                    return false;
                }
                theForm.incJavaOauthEmail.value = email;
                if (!getTextToArrayAlias("incJavaOauthEmail")) {
                    theForm.incJavaOauthEmail.focus();
                    return false;
                }

                if(!checknumber(theForm.incJavaOauthPort))
                {
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthPort.focus();
                    return false;
                }

                //Need to replace the length exceeding alert messages with appropriate labels.
                var clientid = trimAll(theForm.incJavaOauthClientId.value);
                if(clientid == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.clientid.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthClientId.focus();
                    return false;
                }
                if(clientid.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientid'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthClientId.focus();
                    return false;
                }
                theForm.incJavaOauthClientId.value = clientid;

                /*
                    changeClientSecret will be true
                    1. when user clicks on "enter client secret".
                    2. When user enters client secret for new configuration
                    Additional check "new_xxxxClientSecret" is added when user submits the form without entering client secret ( no onkeyup event "setClientSecretTrue" is called while submitting for new configurations. During that time, "new_xxxxClientSecret" will not be hidden )
                */
                if("true" == theForm.changeClientSecret.value || !jQuery("#new_incJavaOauthClientSecret").hasClass("hide"))
                {
                    var clientsecret = trimAll(theForm.incJavaOauthClientSecret.value);
                    if(clientsecret == "")
                    {
                        alert(getMessageForKey('auth.oauth.alert.clientsecret.empty'));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incJavaOauthClientSecret.focus();
                        return false;
                    }
                    if(clientsecret.length > 500)
                    {
                        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientsecret'), "500"]));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incJavaOauthClientSecret.focus();
                        return false;
                    }
                    theForm.incJavaOauthClientSecret.value = encryptDataWithRSA(clientsecret); //SD-100780
                }

                var authurl = trimAll(theForm.incJavaOauthAuthUrl.value);
                if(authurl == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.authurl.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthAuthUrl.focus();
                    return false;
                }
                if(authurl.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.authurl'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthAuthUrl.focus();
                    return false;
                }
                theForm.incJavaOauthAuthUrl.value = authurl;

                var tokenurl = trimAll(theForm.incJavaOauthTokenUrl.value);
                if(tokenurl == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.tokenurl.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthTokenUrl.focus();
                    return false;
                }
                if(tokenurl.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.tokenurl'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthTokenUrl.focus();
                    return false;
                }
                theForm.incJavaOauthTokenUrl.value=tokenurl;

                var oauthscope = trimAll(theForm.incJavaOauthScope.value);
                if(oauthscope == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.scope.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthScope.focus();
                    return false;
                }
                if(oauthscope.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.scope'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incJavaOauthScope.focus();
                    return false;
                }
                theForm.incJavaOauthScope.value = oauthscope;
            }
	    }
        else if(mailOption === "ews") {
            if(authType == "basic")
            {
                var connecturl = trimAll(theForm.incomingEwsUrl.value);
                if(connecturl == "")
                {
                    alert(getMessageForKey("sdp.admin.mailserver.ewsurl.alert"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsUrl.focus();
                    return false;
                }
                if(connecturl.length > 250)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.mailserver.ewsurl"), "250"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsUrl.focus();
                    return false;
                }
                if(!ewsUrlRegex.test(connecturl))
                {
                    alert(getMessageForKey("mail.ews.connect.url.error"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsUrl.focus();
                    return false;
                }

                theForm.incomingEwsUrl.value = connecturl;

                //SD-77842
                trimToEmail(theForm.incomingEwsEmailAddress); // To remove the leading and trailing "," characters in the email aliases
                var ewsEmail = trimAll(theForm.incomingEwsEmailAddress.value);
                if(ewsEmail == "")
                {
                    alert(getMessageForKey("sdp.admin.ews.incoming.username.emailerror"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsEmailAddress.focus();
                    return false;
                }
                if(ewsEmail.length > 5000) {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.emailaddress"), "5000"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsEmailAddress.focus();
                    return false;
                }
                theForm.incomingEwsEmailAddress.value = ewsEmail;

                if (!getTextToArrayAlias("incomingEwsEmailAddress")) {
                    theForm.incomingEwsEmailAddress.focus();
                    return false;
                }

                var username = trimAll(theForm.incomingEwsUsername.value);
                if(username == "")
                {
                    alert(getMessageForKey("sdp.admin.email.outgoingusernamejserror"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsUsername.focus();
                    return false;
                }
                if(username.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incomingEwsUsername.focus();
                    return false;
                }
                theForm.incomingEwsUsername.value = username;

                if(("true" == document.EMailDefForm.changePwd.value || theForm.addEmailSetting!=undefined ))
                {
                    if(trimAll(theForm.incomingEwsPassword.value) == "")
                    {
                        alert(getMessageForKey("sdp.admin.email.outgoingpwdjserror"));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incomingEwsPassword.focus();
                        return false;
                    }
                    if(theForm.incomingEwsPassword.value.length > 100)
                    {
                        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.password"), "100"]));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incomingEwsPassword.focus();
                        return false;
                    }
                    passwordElement = theForm.incomingEwsPassword;
                }
            }
            else if(authType == "oauth")
            {
                var connectUrl = trimAll(theForm.incEwsOauthConnectUrl.value);
                if(connectUrl == "")
                {
                    alert(getMessageForKey("sdp.admin.mailserver.ewsurl.alert"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthConnectUrl.focus();
                    return false;
                }
                if(connectUrl.length > 250)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.mailserver.ewsurl"), "250"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthConnectUrl.focus();
                    return false;
                }
                if(!ewsUrlRegex.test(connectUrl))
                {
                    alert(getMessageForKey("mail.ews.connect.url.error"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthConnectUrl.focus();
                    return false;
                }
                theForm.incEwsOauthConnectUrl.value = connectUrl;

                //SD-77842
                trimToEmail(theForm.incEwsOauthEmail); // To remove the leading and trailing "," characters in the email aliases
                var ewsEmail = trimAll(theForm.incEwsOauthEmail.value);
                if(ewsEmail == "")
                {
                    alert(getMessageForKey("sdp.admin.ews.incoming.username.emailerror"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthEmail.focus();
                    return false;
                }
                if(ewsEmail.length > 5000)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.emailaddress"), "5000"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthEmail.focus();
                    return false;
                }
                theForm.incEwsOauthEmail.value = ewsEmail;
                if (!getTextToArrayAlias("incEwsOauthEmail")) {
                    theForm.incEwsOauthEmail.focus();
                    return false;
                }

                var username = trimAll(theForm.incEwsOauthUsername.value);
                if(username == "")
                {
                    alert(getMessageForKey("sdp.admin.email.outgoingusernamejserror"));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthUsername.focus();
                    return false;
                }
                if(username.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthUsername.focus();
                    return false;
                }
                theForm.incEwsOauthUsername.value=username;

                //Need to replace the length exceeding alert messages with appropriate labels.
                var clientid = trimAll(theForm.incEwsOauthClientId.value);
                if(clientid == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.clientid.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthClientId.focus();
                    return false;
                }
                if(clientid.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientid'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthClientId.focus();
                    return false;
                }
                theForm.incEwsOauthClientId.value = clientid;
                /*
                    changeClientSecret will be true
                    1. when user clicks on "enter client secret".
                    2. When user enters client secret for new configuration
                    Additional check "new_xxxxClientSecret" is added when user submits the form without entering client secret ( no onkeyup event "setClientSecretTrue" is called while submitting for new configurations. During that time, "new_xxxxClientSecret" will not be hidden )
                */
                if("true" == theForm.changeClientSecret.value || !jQuery("#new_incEwsOauthClientSecret").hasClass("hide"))
                {
                    var clientsecret = trimAll(theForm.incEwsOauthClientSecret.value);
                    if(clientsecret == "")
                    {
                        alert(getMessageForKey('auth.oauth.alert.clientsecret.empty'));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incEwsOauthClientSecret.focus();
                        return false;
                    }
                    if(clientsecret.length > 500)
                    {
                        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientsecret'), "500"]));
                        ShowEMailTab("incoming");//No I18N
                        theForm.incEwsOauthClientSecret.focus();
                        return false;
                    }
                    theForm.incEwsOauthClientSecret.value = encryptDataWithRSA(clientsecret); //SD-100780
                }

                var authurl = trimAll(theForm.incEwsOauthAuthUrl.value);
                if(authurl == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.authurl.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthAuthUrl.focus();
                    return false;
                }
                if(authurl.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.authurl'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthAuthUrl.focus();
                    return false;
                }
                theForm.incEwsOauthAuthUrl.value = authurl;

                var tokenurl = trimAll(theForm.incEwsOauthTokenUrl.value);
                if(tokenurl == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.tokenurl.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthTokenUrl.focus();
                    return false;
                }
                if(tokenurl.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.tokenurl'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthTokenUrl.focus();
                    return false;
                }
                theForm.incEwsOauthTokenUrl.value = tokenurl;

                var oauthscope = trimAll(theForm.incEwsOauthScope.value);
                if(oauthscope == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.scope.empty'));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthScope.focus();
                    return false;
                }
                if(oauthscope.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.scope'), "500"]));
                    ShowEMailTab("incoming");//No I18N
                    theForm.incEwsOauthScope.focus();
                    return false;
                }
                theForm.incEwsOauthScope.value = oauthscope;
            }
		}
        else if(mailOption === "graph") {
            if(!valGraphDetails(theForm, true)) {
                return false;
            }
        }


		if(trimAll(theForm.fetchInterval.value) == "")
        {
            alert(document.getElementById("entermailfetch").innerHTML);

            ShowEMailTab("incoming");//No I18N
            theForm.fetchInterval.focus();
            return false;
        }
        if(!checkForIntegerZero(theForm.fetchInterval))
        {
            alert(document.getElementById("invalidinterval").innerHTML);
            ShowEMailTab("incoming");//No I18N
            theForm.fetchInterval.focus();
            return false;
        }
        if(theForm.errorFolderOption.checked)
        {
            var errorFolderName = trimAll(theForm.errorFolderName.value);
            if(errorFolderName == "")
            {
                alert(getMessageForKey("sdp.common.error.empty", [getMessageForKey("mail.error.folder.name")]));
                ShowEMailTab("incoming"); //NO I18N
                theForm.errorFolderName.focus();
                return false;
            }
            if(errorFolderName.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("mail.error.folder.name"), "100"]));
                ShowEMailTab("incoming");//No I18N
                theForm.errorFolderName.focus();
                return false;
            }
            theForm.errorFolderName.value = errorFolderName;
            if(!checknumber(theForm.errorFolderThreshold))
            {
                ShowEMailTab("incoming"); //NO I18N
                theForm.errorFolderThreshold.focus();
                return false;
            }
            if(theForm.errorFolderThreshold.value > 1000 || theForm.errorFolderThreshold.value < 1) {
                alert(getMessageForKey("enter.valid.number.range", ["1", "1000"]));
                ShowEMailTab("incoming"); //NO I18N
                theForm.errorFolderThreshold.focus();
                return false;
            }
        }
        if(theForm.enableDebug.checked) {
            if (theForm.mailDebugPeriodDays.value.includes(".") || !isInteger(theForm.mailDebugPeriodDays.value) || (theForm.mailDebugPeriodDays.value > 30 || theForm.mailDebugPeriodDays.value < 1)) {
                alert(getMessageForKey("sdp.admin.email.debug.period.days.range", ["1", "30"]));
                ShowEMailTab("incoming"); //NO I18N
                theForm.mailDebugPeriodDays.focus();
                return false;
            }
        }
        theForm.mailType.value="incoming";//No I18N
        if(passwordElement){
            passwordElement.value = encryptDataWithRSA(passwordElement.value);
        }
        return true;
    }
    else
    {
        return valOutgoingEmail(theForm);
    }
}

function valGraphDetails(theForm, isIncoming) {
    var prefix = isIncoming ? "inc" : "out"; //NO I18N
    var tab = isIncoming ? "incoming" : "outgoing"; //NO I18N

    var graphEndpointElement = jQuery(theForm).find('input[name=' + prefix + 'GraphEndpoint]'); //NO I18N
    var graphEndpoint = trimAll(graphEndpointElement.val());
    if(graphEndpoint == "")
    {
        alert(getMessageForKey("sdp.common.error.empty", [getMessageForKey("mail.graph.endpoint")]));
        ShowEMailTab(tab);
        graphEndpointElement.trigger('focus');
        return false;
    }
    if(graphEndpoint.length > 100)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("mail.graph.endpoint"), "100"]));
        ShowEMailTab(tab);
        graphEndpointElement.trigger('focus');
        return false;
    }
    if(graphEndpoints.indexOf(graphEndpoint) === -1)
    {
        alert(getMessageForKey("mail.graph.endpoint.error"));
        ShowEMailTab(tab);
        graphEndpointElement.trigger('focus');
        return false;
    }
    graphEndpointElement.val(graphEndpoint);

    var graphEmailElement = jQuery('#' + prefix + 'GraphEmail'); //NO I18N
    if(isIncoming) {
        //SD-77842
        trimToEmail(theForm.incGraphEmail); // To remove the leading and trailing "," characters in the email aliases
    }
    var graphEmail = trimAll(graphEmailElement.val());
    if(graphEmail == "")
    {
        alert(getMessageForKey("sdp.common.error.empty", [getMessageForKey(isIncoming ? "sdp.admin.email.incoming.emailaddress" : "sdp.admin.email.outgoing.replyto")]));
        ShowEMailTab(tab);
        graphEmailElement.trigger('focus');
        return false;
    }
    var maxLength = isIncoming ? 5000 : 250;
    if(graphEmail.length > maxLength)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey(isIncoming ? "sdp.admin.email.incoming.emailaddress" : "sdp.admin.email.outgoing.replyto"), maxLength]));
        ShowEMailTab(tab);
        graphEmailElement.trigger('focus');
        return false;
    }

    if(!isIncoming) {
        if(!validateMailIDs(graphEmail, null, null, {regex : /^[\w]([\w\-\.\+\'\/]*)@([\w\-\.]*)(\.[a-zA-Z]{2,22}(\.[a-zA-Z]{2}){0,2})$/})) {
            alert(getMessageForKey("sdp.admin.ews.incoming.username.emailerror"));
            ShowEMailTab(tab);
            graphEmailElement.trigger('focus');
            return false;
        }
    }
    else {
        if(!getTextToArrayAlias("incGraphEmail")) {
            theForm.incGraphEmail.focus();
            return false;
        }
    }
    graphEmailElement.val(graphEmail);

    // if(!valOauthDetails(theForm, 'Graph', isIncoming)) {
    //     return false;
    // }
    return valOauthDetails(theForm, 'Graph', isIncoming); //No I18N

}

function valOauthDetails(theForm, mailserver, isIncoming) {

    var prefix = (isIncoming ? "inc" : "out") + mailserver; //NO I18N
    var tab = isIncoming ? "incoming" : "outgoing"; //NO I18N

    //Need to replace the length exceeding alert messages with appropriate labels.
    var clientIdElement = jQuery(theForm).find('input[name=' + prefix + 'OauthClientId'); //NO I18N
    var clientId = trimAll(clientIdElement.val());
    if(clientId == "")
    {
        alert(getMessageForKey('auth.oauth.alert.clientid.empty'));
        ShowEMailTab(tab);
        clientIdElement.trigger('focus');
        return false;
    }
    if(clientId.length > 500)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientid'), "500"]));
        ShowEMailTab(tab);
        clientIdElement.trigger('focus');
        return false;
    }
    clientIdElement.val(clientId);

    /*
        changeClientSecret will be true
        1. when user clicks on "enter client secret".
        2. When user enters client secret for new configuration
        Additional check "new_xxxxClientSecret" is added when user submits the form without entering client secret ( no onkeyup event "setClientSecretTrue" is called while submitting for new configurations. During that time, "new_xxxxClientSecret" will not be hidden )
    */
    var clientSecretElement = jQuery(theForm).find('input[name=' + prefix + 'OauthClientSecret');
    var newClientSecretElement = jQuery('#new_' + prefix + 'OauthClientSecret');
    if("true" == theForm.changeClientSecret.value || !newClientSecretElement.hasClass("hide"))
    {
        var clientsecret = trimAll(clientSecretElement.val());
        if(clientsecret == "")
        {
            alert(getMessageForKey('auth.oauth.alert.clientsecret.empty'));
            ShowEMailTab(tab);
            clientSecretElement.trigger('focus');
            return false;
        }
        if(clientsecret.length > 500)
        {
            alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientsecret'), "500"]));
            ShowEMailTab(tab);
            clientSecretElement.trigger('focus');
            return false;
        }
    }

    var authUrlElement = jQuery(theForm).find('input[name=' + prefix + 'OauthAuthUrl'); //NO I18N
    var authUrl = trimAll(authUrlElement.val());
    if(authUrl == "")
    {
        alert(getMessageForKey('auth.oauth.alert.authurl.empty'));
        ShowEMailTab(tab);
        authUrlElement.trigger('focus');
        return false;
    }
    if(authUrl.length > 500)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.authurl'), "500"]));
        ShowEMailTab(tab);
        authUrlElement.trigger('focus');
        return false;
    }
    authUrlElement.val(authUrl);

    var tokenUrlElement = jQuery(theForm).find('input[name=' + prefix + 'OauthTokenUrl'); //NO I18N
    var tokenUrl = trimAll(tokenUrlElement.val());
    if(tokenUrl == "")
    {
        alert(getMessageForKey('auth.oauth.alert.tokenurl.empty'));
        ShowEMailTab(tab);
        tokenUrlElement.trigger('focus');
        return false;
    }
    if(tokenUrl.length > 500)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.tokenurl'), "500"]));
        ShowEMailTab(tab);
        tokenUrlElement.trigger('focus');
        return false;
    }
    tokenUrlElement.val(tokenUrl);

    var scopeElement = jQuery(theForm).find('input[name=' + prefix + 'OauthScope'); //NO I18N
    var oauthscope = trimAll(scopeElement.val());
    if(oauthscope == "")
    {
        alert(getMessageForKey('auth.oauth.alert.scope.empty'));
        ShowEMailTab(tab);
        scopeElement.trigger('focus');
        return false;
    }
    if(oauthscope.length > 500)
    {
        alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.scope'), "500"]));
        ShowEMailTab(tab);
        scopeElement.trigger('focus');
        return false;
    }
    scopeElement.val(oauthscope);
    clientSecretElement.val(encryptDataWithRSA(clientsecret)); //SD-100780
    return true;
}

function getTextToArrayAlias(elementName) {
	var textarea = document.getElementById(elementName).value;
	textarea = textarea.replace(/(\r\n|\n|\r|\s)/gm, ",");     		
	var mailArr = (textarea.trim()).split(",");		
	mailArr = validateEmail.eliminateDuplicates(mailArr);     		
	mailArr = isEmailListValid(elementName, mailArr);
	return mailArr;		
}

function isEmailListValid(elementName, outArr) {
    var invalidMailList = validateEmail.getInvalidEmail(outArr);
    if(invalidMailList == "") {
        if(outArr.length != 0) {
            outArr.shift();
            return true;
        }
        return true;
    }
    else {
        validateEmail.hideNoteBox();
        emailAlert(elementName, invalidMailList);
        return false;
    }
}

function emailAlert(elementName, invalidMailList) {
    var alertDiv = '<div class="fl" id="invalidEmailAlert" style="display:inline-block"><div class="inline-warningbox1 ml10 pos-abs"><div class="inline-warningbox1-inner p10"><div>' + getMessageForKey("sdp.admin.requester.invalidEmail") + '</div><div id="invalidMailList">' + invalidMailList + '</div></div></div></div>'

    jQuery('#' + elementName).after(alertDiv);
}

function changeFileProtectionResetPassword(x)
{
    jQuery('#fileProtectPwd').val('').trigger('focus');
    document.getElementById("fileProtectPwd").readOnly=false;
    jQuery(x).addClass('hide');
    jQuery('[name=changeFilePwdButton]').removeClass('hide');
    jQuery('[name=cancelResetPassword]').removeClass('hide');
    jQuery('[data-id=changedpassword]').html('<span class="mandatory">*</span>' + getMessageForKey("sdp.common.newpassword")); // No I18N
}

function showFileProtectionPassword(x) 
{
    if(jQuery(x).find('.cspr').hasClass('preview')) 
    {
        document.getElementById('fileProtectPwd').type = 'password';
        jQuery(x).attr('title',getMessageForKey("sdp.privacy.show.password")).uitooltip({content:getMessageForKey("sdp.privacy.show.password")}).find('.cspr').removeClass('preview').addClass('preview-hide1'); // No I18N
    } 
    else 
    {
        document.getElementById('fileProtectPwd').type = 'text';
        jQuery(x).attr('title',getMessageForKey("sdp.privacy.hide.password")).uitooltip({content:getMessageForKey("sdp.privacy.hide.password")}).find('.cspr').removeClass('preview-hide1').addClass('preview'); // No I18N
    }
}

function validateFileProtectionPassword(x)
{
    var password = jQuery('#fileProtectPwd').val().trim();
     if(password === "")
     {
         function formsubmit() 
         {
            jQuery('#fileProtectPwd').trigger('focus');
         }
         showconfirm(true,'message=' + getMessageForKey("sdp.common.password.empty.error") + ', cancelbutton=OK, closebutton=no, closeOnEscKey=yes',formsubmit); // No I18N
         return false;
     }
     password = encryptDataWithRSA(password);
     jQuery('#fileProtectPwd').val(password);

   /*if((password.length < 8) || (password.length > 15) || (!/[A-Z]/.test(password)) || (!/[a-z]/.test(password)) || (!/[0-9]/.test(password)) || (!/[!@#$%^&*`~]/.test(password)) )
    {
      function formsubmit() 
      {
        jQuery('#fileProtectPwd').trigger('focus');
      }
      showconfirm(true,'message=' + getMessageForKey("sdp.personalize.password.message") + ', cancelbutton=OK, closebutton=no, closeOnEscKey=yes',formsubmit); // No I18N
      return false;
    }*/
    return true;
}

function cancelResetFilePwd() {
    if (jQuery('#oldFileProtectPwd').val() != "null") {
        jQuery('#fileProtectPwd').val(jQuery('#oldFileProtectPwd').val()).trigger('focus');
    }
    else {
        jQuery('#fileProtectPwd').val('').trigger('focus');
    }
    document.getElementById("fileProtectPwd").readOnly=true;
    jQuery('[name=resetFilePwd]').removeClass('hide');
    jQuery('[name=cancelResetPassword]').addClass('hide');
    jQuery('[name=changeFilePwdButton]').addClass('hide');
    jQuery('[data-id=changedpassword]').html('<span class="mandatory">*</span>' + getMessageForKey("sdp.common.currentpassword")); // No I18N
}


function valOutgoingEmail(theForm)
{
    var mailOption = theForm.outgoingMailOption.value;
    var authType = document.getElementById('outAuthType').value;
    var passwordElement;
    var ewsUrlRegex = new RegExp(/^https:\/\/.*\/ews\/exchange.asmx$/i);
    //SD-105010
    //SD-117985
    if(mailOption === "ews" && !(oldOutMailOption === "ews" && oldOutAuthType === "oauth")) {
        if(isOffice365EWSConfigured(false, theForm, authType)) {
            alert(translate("mail.save.o365.ews.error")); //NO I18N
        }
    }

    //SD-105010
    if(authType == "basic") {
        if(isOffice365BasicAuth(false, theForm)) {
            showalert('failure', getMessageForKey("mail.save.basic.error"), "isAutoHide=false"); //No I18N
            ShowEMailTab("outgoing");//No I18N
            return false;
        }
    }

    if(mailOption == "javamail")
    {
        if(authType == "basic")
        {
            var hostname = trimAll(theForm.outgoingHost.value);
            if(hostname == "")
            {
                alert(document.getElementById("enteroutgoingserver").innerHTML);
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingHost.focus();
                return false;
            }
            if(hostname.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.servername"), "100"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.incJavaOauthHost.focus();
                return false;
            }
            theForm.outgoingHost.value = hostname;

            var email = trimAll(theForm.fromEmail.value);
            if(email == "")
            {
                alert(document.getElementById("enterreplyto").innerHTML);
                ShowEMailTab("outgoing");//No I18N
                theForm.fromEmail.focus();
                return false;
            }
            if(email.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.replyto"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.incJavaOauthHost.focus();
                return false;
            }
            theForm.fromEmail.value = email;
            if(!emailCheck(theForm.fromEmail))
            {
                ShowEMailTab("outgoing");//No I18N
                theForm.fromEmail.focus();
                return false;
            }

            if(!checknumber(theForm.outgoingPort))
            {
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingPort.focus();
                return false;
            }

            if(theForm.requireAuthentication.checked)
            {
                theForm.smtpUserName.value = trimAll(theForm.smtpUserName.value);
                if(theForm.smtpUserName.value == "")
                {
                    alert(document.getElementById("enterusername").innerHTML);
                    ShowEMailTab("outgoing");//No I18N
                    theForm.smtpUserName.focus();
                    return false;
                }
                //To capture password validation for both edit and add mode. (ID 32666)
                if( ("true"==document.getElementById("changePwdSmtp").value) || (theForm.addEmailSetting!=undefined) )
                {
                    theForm.smtpPassword.value = trimAll(theForm.smtpPassword.value);
                    if(trimAll(theForm.smtpPassword.value) == "")
                    {
                        alert(document.getElementById("enterpwd").innerHTML);
                        ShowEMailTab("outgoing");//No I18N
                        theForm.smtpPassword.focus();
                        return false;
                    }
                    passwordElement = theForm.smtpPassword;
                }

            }
        }
        else if(authType == "oauth")
        {
            var host = trimAll(theForm.outJavaOauthHost.value);
            if(host == "")
            {
                alert(document.getElementById("enteroutgoingserver").innerHTML);
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthHost.focus();
                return false;
            }
            if(host.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.servername"), "100"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthHost.focus();
                return false;
            }
            theForm.outJavaOauthHost.value = host;

            var email = trimAll(theForm.outJavaOauthEmail.value);
            if(email == "")
            {
                alert(document.getElementById("enterreplyto").innerHTML);
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthEmail.focus();
                return false;
            }
            if(email.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.replyto"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.incJavaOauthHost.focus();
                return false;
            }
            if(!emailCheck(theForm.outJavaOauthEmail))
            {
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthEmail.focus();
                return false;
            }
            theForm.outJavaOauthEmail.value=email;

            var username = trimAll(theForm.outJavaOauthUsername.value);
            if(username == "")
            {
                alert(document.getElementById("enterusername").innerHTML);
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthUsername.focus();
                return false;
            }
            if(username.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthUsername.focus();
                return false;
            }
            theForm.outJavaOauthUsername.value = username;

            if(!checknumber(theForm.outJavaOauthPort))
            {
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthPort.focus();
                return false;
            }

            //Need to replace the length exceeding alert messages with appropriate labels.
            var clientid = trimAll(theForm.outJavaOauthClientId.value);
            if(clientid == "")
            {
                alert(getMessageForKey('auth.oauth.alert.clientid.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthClientId.focus();
                return false;
            }
            if(clientid.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientid'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthClientId.focus();
                return false;
            }
            theForm.outJavaOauthClientId.value = clientid;

            /*
                changeClientSecret will be true
                1. when user clicks on "enter client secret".
                2. When user enters client secret for new configuration
                Additional check "new_xxxxClientSecret" is added when user submits the form without entering client secret ( no onkeyup event "setClientSecretTrue" is called while submitting for new configurations. During that time, "new_xxxxClientSecret" will not be hidden )
            */
            if("true" == theForm.changeClientSecret.value || !jQuery("#new_outJavaOauthClientSecret").hasClass("hide"))
            {
            var clientsecret = trimAll(theForm.outJavaOauthClientSecret.value);
            if(clientsecret == "")
            {
                alert(getMessageForKey('auth.oauth.alert.clientsecret.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthClientSecret.focus();
                return false;
            }
            if(clientsecret.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientsecret'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthClientSecret.focus();
                return false;
            }
                theForm.outJavaOauthClientSecret.value = encryptDataWithRSA(clientsecret); //SD-100780
            }

            var authurl = trimAll(theForm.outJavaOauthAuthUrl.value);
            if(authurl == "")
            {
                alert(getMessageForKey('auth.oauth.alert.authurl.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthAuthUrl.focus();
                return false;
            }
            if(authurl.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.authurl'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthAuthUrl.focus();
                return false;
            }
            theForm.outJavaOauthAuthUrl.value = authurl;

            var tokenurl = trimAll(theForm.outJavaOauthTokenUrl.value);
            if(tokenurl == "")
            {
                alert(getMessageForKey('auth.oauth.alert.tokenurl.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthTokenUrl.focus();
                return false;
            }
            if(tokenurl.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.tokenurl'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthTokenUrl.focus();
                return false;
            }
            theForm.outJavaOauthTokenUrl.value=tokenurl;

            var oauthscope = trimAll(theForm.outJavaOauthScope.value);
            if(oauthscope == "")
            {
                alert(getMessageForKey('auth.oauth.alert.scope.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthScope.focus();
                return false;
            }
            if(oauthscope.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.scope'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outJavaOauthScope.focus();
                return false;
            }
            theForm.outJavaOauthScope.value = oauthscope;
        }
    }
    else if(mailOption === "ews") {
        if(authType == "basic")
        {
            var connecturl = trimAll(theForm.outgoingEwsUrl.value);
            if(connecturl == "")
            {
                alert(getMessageForKey("sdp.admin.mailserver.ewsurl.alert"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingEwsUrl.focus();
                return false;
            }
            if(connecturl.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.mailserver.ewsurl"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingEwsUrl.focus();
                return false;
            }
            if(!ewsUrlRegex.test(connecturl))
            {
                alert(getMessageForKey("mail.ews.connect.url.error"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingEwsUrl.focus();
                return false;
            }
            theForm.outgoingEwsUrl.value = connecturl;

            var username = trimAll(theForm.outgoingEwsUsername.value);
            if(username == "")
            {
                alert(getMessageForKey("sdp.admin.email.outgoingusernamejserror"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingEwsUsername.focus();
                return false;
            }
            if(username.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outgoingEwsUsername.focus();
                return false;
            }
            theForm.outgoingEwsUsername.value = username;

            if(("true" == document.EMailDefForm.changePwdSmtp.value || theForm.addEmailSetting!=undefined))
            {
                if(trimAll(theForm.outgoingEwsPassword.value) == "")
                {
                    alert(getMessageForKey("sdp.admin.email.outgoingpwdjserror"));
                    ShowEMailTab("outgoing");//No I18N
                    theForm.outgoingEwsPassword.focus();
                    return false;
                }
                if(theForm.outgoingEwsPassword.value.length > 100)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.authentication.password"), "100"]));
                    ShowEMailTab("outgoing");//No I18N
                    theForm.outgoingEwsPassword.focus();
                    return false;
                }
                passwordElement = theForm.outgoingEwsPassword;
            }

            var replyto = trimAll(theForm.ewsReplyAddress.value);
            if(replyto == "")
            {
                alert(getMessageForKey("sdp.admin.email.replytojserror"));
                ShowEMailTab("outgoing");//No I18N
                theForm.ewsReplyAddress.focus();
                return false;
            }
            if(replyto.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.replyto"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthEmail.focus();
                return false;
            }
            theForm.ewsReplyAddress.value = replyto;
        }
        else if(authType == "oauth")
        {
            var connecturl = trimAll(theForm.outEwsOauthConnectUrl.value);
            if(connecturl == "")
            {
                alert(getMessageForKey("sdp.admin.mailserver.ewsurl.alert"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthConnectUrl.focus();
                return false;
            }
            if(connecturl.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.mailserver.ewsurl"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthConnectUrl.focus();
                return false;
            }
            if(!ewsUrlRegex.test(connecturl))
            {
                alert(getMessageForKey("mail.ews.connect.url.error"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthConnectUrl.focus();
                return false;
            }
            theForm.outEwsOauthConnectUrl.value = connecturl;

            var username = trimAll(theForm.outEwsOauthUsername.value);
            if(username == "")
            {
                alert(getMessageForKey("sdp.admin.email.outgoingusernamejserror"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthUsername.focus();
                return false;
            }
            if(username.length > 100)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.incoming.username"), "100"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthUsername.focus();
                return false;
            }
            theForm.outEwsOauthUsername.value = username;

            var replyto = trimAll(theForm.outEwsOauthEmail.value);
            if(replyto == "")
            {
                alert(getMessageForKey("sdp.admin.email.replytojserror"));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthEmail.focus();
                return false;
            }
            if(replyto.length > 250)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey("sdp.admin.email.outgoing.replyto"), "250"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthEmail.focus();
                return false;
            }
            theForm.outEwsOauthEmail.value = replyto;

            //Need to replace the length exceeding alert messages with appropriate labels.
            var clientid = trimAll(theForm.outEwsOauthClientId.value);
            if(clientid == "")
            {
                alert(getMessageForKey('auth.oauth.alert.clientid.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthClientId.focus();
                return false;
            }
            if(clientid.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientid'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthClientId.focus();
                return false;
            }
            theForm.outEwsOauthClientId.value = clientid;

            /*
                changeClientSecret will be true
                1. when user clicks on "enter client secret".
                2. When user enters client secret for new configuration
                Additional check "new_xxxxClientSecret" is added when user submits the form without entering client secret ( no onkeyup event "setClientSecretTrue" is called while submitting for new configurations. During that time, "new_xxxxClientSecret" will not be hidden )
            */
            if("true" == theForm.changeClientSecret.value || !jQuery("#new_outEwsOauthClientSecret").hasClass("hide"))
            {
                var clientsecret = trimAll(theForm.outEwsOauthClientSecret.value);
                if(clientsecret == "")
                {
                    alert(getMessageForKey('auth.oauth.alert.clientsecret.empty'));
                    ShowEMailTab("outgoing");//No I18N
                    theForm.outEwsOauthClientSecret.focus();
                    return false;
                }
                if(clientsecret.length > 500)
                {
                    alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.clientsecret'), "500"]));
                    ShowEMailTab("outgoing");//No I18N
                    theForm.outEwsOauthClientSecret.focus();
                    return false;
                }
                theForm.outEwsOauthClientSecret.value = encryptDataWithRSA(clientsecret); //SD-100780
            }

            var authurl = trimAll(theForm.outEwsOauthAuthUrl.value);
            if(authurl == "")
            {
                alert(getMessageForKey('auth.oauth.alert.authurl.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthAuthUrl.focus();
                return false;
            }
            if(authurl.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.authurl'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthAuthUrl.focus();
                return false;
            }
            theForm.outEwsOauthAuthUrl.value = authurl;

            var tokenurl = trimAll(theForm.outEwsOauthTokenUrl.value);
            if(tokenurl == "")
            {
                alert(getMessageForKey('auth.oauth.alert.tokenurl.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthTokenUrl.focus();
                return false;
            }
            if(tokenurl.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.tokenurl'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthTokenUrl.focus();
                return false;
            }
            theForm.outEwsOauthTokenUrl.value=tokenurl;

            var oauthscope = trimAll(theForm.outEwsOauthScope.value);
            if(oauthscope == "")
            {
                alert(getMessageForKey('auth.oauth.alert.scope.empty'));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthScope.focus();
                return false;
            }
            if(oauthscope.length > 500)
            {
                alert(getMessageForKey("common.creatorlinks.not.exceed", [getMessageForKey('auth.oauth.common.scope'), "500"]));
                ShowEMailTab("outgoing");//No I18N
                theForm.outEwsOauthScope.focus();
                return false;
            }
            theForm.outEwsOauthScope.value = oauthscope;
        }
    }
    else if(mailOption === "graph") {
        if(!valGraphDetails(theForm, false)) {
            return false;
        }
    }
    theForm.mailType.value="outgoing";//No I18N
    if(passwordElement){
        passwordElement.value = encryptDataWithRSA(passwordElement.value);
    }
    return true;
}


changePassword = function(isFromUserProfile){
    var changepassword = {};
    changepassword.old_password = jQuery("#oldPwd").val();
    changepassword.new_password = jQuery("#newPwd").val();
    changepassword.confirm_password = jQuery("#confirmNewPwd").val();
    if(changepassword.old_password == undefined ||  changepassword.old_password == "" )
    {
          alert(getMessageForKey("sdp.changepassword.currentpwdjserror"));
          document.getElementById("oldPwd").focus();
          return;
    }
    if(changepassword.new_password == undefined || changepassword.new_password == "")
    {
          alert(getMessageForKey("sdp.changepassword.newpwdjserror"));
          document.getElementById("newPwd").focus();
          return;
    }
    if(changepassword.new_password.trim() == ""){
          alert(getMessageForKey("sdp.changepassword.currentpwdblankjserror"));
          document.getElementById("newPwd").focus();
          return;
    }
    if(changepassword.confirm_password == undefined || changepassword.confirm_password == ""){
      alert(getMessageForKey("sdp.changepassword.confirmpwdjserror"));
      document.getElementById("confirmNewPwd").focus();
      return;
    }
    if(changepassword.new_password != changepassword.confirm_password){
        alert(getMessageForKey("sdp.jserror.retypepassword"));
        confirmUserPwd.focus();
        return;
    }
    changepassword.new_password = encryptDataWithRSA(changepassword.new_password);
    changepassword.confirm_password = encryptDataWithRSA(changepassword.confirm_password);
    changepassword.old_password = encryptDataWithRSA(changepassword.old_password);
    sdpAjax({
       url : "/api/v3/users/_change_password", //No I18N
       method : "put",  //NO I18N
       data : sdpAjaxInputData(changepassword),
       success: function(resp) {
        if(!isFromUserProfile){
            if(resp.change_password.response_status.status == "success"){ //NO I18N
                document.location.href = "/changePwd.do?pwdReset=true&mode=view"; //NO I18N
            }
            else{
                document.getElementById("warnMsg").innerHTML = ZSEC.Encoder.encodeForHTML(resp.change_password.response_status.message);
            }
        }
        else{
            if(resp.change_password.response_status.status == "success"){
                window.opener.location.href = "/changePwd.do?pwdReset=true&mode=view";
                window.close();
              }
              else{
                jQuery("#oldPwd").val(""); // NO I18N
                jQuery("#newPwd").val(""); // NO I18N
                jQuery("#confirmNewPwd").val(""); // NO I18N
                showalert("failure",ZSEC.Encoder.encodeForHTML(resp.change_password.response_status.message),"isAutoHide=false");  //NO I18N
              }
        }
       }
    })
}

function validateAssociateWS(assignedWS)
{
    List = assignedWS;
    if(List.length && List.options[0].value == '0')
    {
        alert(document.getElementById("chooseworkstation").innerHTML);
        return false;
    }
    for (i=0;i<List.length;i++)
    {
        List.options[i].selected = true;
    }
    //document.forms[0].trigger('submit');
    return true;
}
function copyWSToList(from,to,form)
{
    //alert("from "+from+" and to "+to+" form "+form+" form name "+form.name);
    var formName = form.name;
	fromList = document[formName][from];
    toList = document[formName][to];
    if (toList.options.length > 0 && toList.options[0].value == '0')
    {
        toList.options.length = 0;
    }
    var sel = false;
    for (i=0;i<fromList.options.length;i++)
    {
        var current = fromList.options[i];
        if (current.selected)
        {
            sel = true;
            if (current.value == '0')
            {
                alert (document.getElementById('invalidselection').innerHTML);
                return;
            }
            txt = current.text;
            val = current.value;
            len = toList.length;
            var present = false;
            for (role=0;role<len;role++)
            {
                if(current.value == toList.options[role].value)
                {
                    present = true;
                    break;
                }
                else
                {
                    continue;
                }
            }
            if(!present)
            {
                toList.options[toList.length] = new Option(txt,val);
            }
            fromList.options[i] = null;
            i--;
        }
    }
    if (!sel) alert (document.getElementById('noselection').innerHTML);
}

//To synch up VAED(ViewAddEditDelete) and duplicated VAED boxes
//Main Control- View, Add, Edit and Delete . Duplicated control -Add, Edit and Delete. Operation Control-fine grained operations related to Add, Edit ,Delete.
function handleVAED(compName,compToBeSelected, fullControlComp,theForm, fgaComponent,dupVAEDComp,mainVAEDComp,mainVAEDName) {
    selectViewPermission(compName,compToBeSelected, fullControlComp,theForm);
    if(compName.checked)
    {
	dupVAEDComp.checked = true;   // Duplicated  control is selected
       //when duplicated control is selected all the operation control related to this and Corresponding main control is getting selected if needed.
       	for (var g = 0; g < theForm.elements.length; g++) {
            if (theForm.elements[g].type == "checkbox") {
                if ((theForm.elements[g].name == fgaComponent)||((theForm.elements[g].value == mainVAEDName) && (theForm.elements[g].value != "DeleteRequests"))) {
                    theForm.elements[g].checked = true
                }
            }
        }
            }

    if(!compName.checked)
    {
      if(compName.name ==dupVAEDComp.name) // when duplicated control is deselected, all the operation related to this are getting deselected
        {
	for (var g = 0; g < theForm.elements.length; g++) {
            if (theForm.elements[g].type == "checkbox") {
                if (theForm.elements[g].name == fgaComponent) {
                   theForm.elements[g].checked = false
                }
            }
        }
      }
      else if(compName.value ==mainVAEDName) //when main control is deselected, For Add, adding requester operation control and For Edit, all the edit operation control are getting deselected.
        {
		for (var g = 0; g < theForm.elements.length; g++) {
            if (theForm.elements[g].type == "checkbox") {
		  if (((((theForm.elements[g].name == "woFGAAddControl") && (theForm.elements[g].value != "AddingRequestTasks")) || (theForm.elements[g].value == "duplicatedCreateRequests")) && (compName.value == "CreateRequests")) || ((compName.value == "ModifyRequests") && ((theForm.elements[g].name == "woFGAEditControl") || (theForm.elements[g].value == "duplicatedModifyRequests")))){
                   theForm.elements[g].checked = false
            }
        }
    }
}


    }
}
//To handle FGA operations only
/*
Upward Signal: If all FGA box is checked VAED button will be enabled. For e.g (refer gui - Assuming Add is in unchecked status, if all of the FGA operations - Adding Request Task  and Adding Requester is checked, Add will checked )
If any FGA boxes are unchecked then VAED will be unchecked For e.g (refer gui - If Adding Request Task  or Adding Requester is unchecked, Add will be unchecked)
If ANY of the FGA box is unchecked, then FC will be unchecked.
*/
function handleFGAOnly(compName,compToBeSelected,theForm,mainVAEDComp,mainVAEDName,dupVAEDComp, fullControlComp) {
    selectViewPermission(compName, compToBeSelected,fullControlComp, theForm);
    if (compName.checked) {
	    // on selecting every opertion control, corresponding main control is getting selected if needed.
        for (var b = 0; b <mainVAEDComp.length; b++) {
             if ((mainVAEDComp[b].value == mainVAEDName) && ((compName.value == "CreateRequester") || (compName.value == "AddingNewProduct") || (compName.value == "AddingNewVendor") || (mainVAEDName == "ModifyRequests")))
{
	         mainVAEDComp[b].checked = true
            }
        }
dupVAEDComp.checked = true  // Initially duplicated control selected
	/* on selecting every opertion control, check all the operations related to this are selected,
	   if any one operation control is in deselect, duplicated control is getting deselected. */
	for (var k = 0; k < theForm.length; k++)
    {
		if(theForm.elements[k].name == compName.name)
        {
			if(theForm.elements[k].checked == false)
            {
			dupVAEDComp.checked = false
            }
        }
    }

    } else {
       fullControlComp.checked = false // Full Control deselected
	dupVAEDComp.checked = false    // duplicated control deselected
    }
}
function swapLayerAndSetFocusOnRoleDefPage()
{
    onClickSwapLayer('sform','listview_div');//NO I18N
    document.RoleDefForm.name.focus();
}
function validateFormInRoleDefPage()
{
    var name = trimAll(document.RoleDefForm.name.value);
    if(name==null || name=="")
    {

        alert(getMessageForKey("sdp.admin.role.entername"));
        document.RoleDefForm.name.focus();
        return false;
    }
    document.RoleDefForm.name.value = name;
    var mandetoryList=new Array();
    for(i=0;i<document.RoleDefForm.elements.length;i++)
    {

        if(document.RoleDefForm.elements[i].type == "checkbox")
        {
            mandetoryList[i] = document.RoleDefForm.elements[i];
        }
    }
    if(validateformInRoleDefPage(mandetoryList) == false)
    {
        alert(getMessageForKey("sdp.admin.role.choosepermissions"));
        return false;
    }
    return true;
}
function validateformInRoleDefPage(mandetoryList1)
{

    var returnValue = new Boolean(0);
    for(j=0;j<mandetoryList1.length;j++)
    {
        if(mandetoryList1[j] != undefined && mandetoryList1[j].checked)
        {
            returnValue = new Boolean(1);
        }
    }
    return returnValue;
}

function filterSites(selectedView,isCallSite)
 {

     if(selectedView =='active'){
         jQuery("#filterViewMenu").html("<span class=\"dd\"><b class=\"caret\"></b></span>"+getMessageForKey("sdp.admin.site.listview.active"));  // NO I18N
         jQuery("#addNewSite_lnk").show();
         jQuery("#actionDropDown").show();
         jQuery("#markAsActive").hide(); // No I18n
     }
     else{
         jQuery("#filterViewMenu").html("<span class=\"dd\"><b class=\"caret\"></b></span>"+getMessageForKey("sdp.admin.site.listview.inactive")); // NO I18N
         jQuery("#addNewSite_lnk").hide();
         jQuery("#actionDropDown").hide();
         var isEMSDir = (forwardfrom == "ESM") ? true : false; //No I18N
         if(isEMSDir || isMDHSetup == "false")
         {
            jQuery("#markAsActive").show(); // No I18n
         }
     }
    callSite(selectedView);
 }

function callSite(selectedView)
{
    req = getXMLHttpRequest();
    if(req)
    {

        var url = "/SetUpWizard.do"; // No I18N
        var params = "forwardTo=site"; //No I18N
        var isActive = true;
        if(selectedView != 'markAsActiveSite')
        {
            if(selectedView == 'active')
            {
                params += "&isActive=true"; // No I18N
            }
            else
            {
                params += "&isActive=false"; // No I18N
                isActive = false;
            }
            var newVal = "&isActive="+isActive;//No i18N
            updateState(getPortalViewName("SiteListView"),"_D_RP", newVal);//No i18N
            parent.refreshSubView(getPortalViewName("SiteListView"));
        }
        else if(selectedView == 'markAsActiveSite')
        {
            var selectedValue = getSelectedCheckBoxes(document.SiteListView);
            if(selectedValue.length == 0) 
            {
                alert(getMessageForKey("sdp.admin.site.markasactive.noselect"));//No I18N
                return;
            }                       
             url = "/SiteDef.do"//No i18N
             updateState(getPortalViewName("SiteListView"),"_D_RP", url);//No i18N
	     // mode is added for security reasons SD-78168
            //SD-81192
            params = "mode=markAsActiveSite";//No I18N
             for(var i = 0; i < selectedValue.length; i++) {
                params += "&siteID="+selectedValue[i];//No i18N
             }                       
            
             if(selectedValue.length > 0 )
             {
                isActive1 = true;
             }
        }

	req.open("POST", url, true);//No i18N
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No i18N
	req.setRequestHeader("Content-length", params.length);//No i18N
	req.onreadystatechange = getSites;
	req.send(params);

    }
}
function getSites()
{
    if (req.readyState == 4)
    {
        if (req.status == 200)
        {
            if(isActive1 == true)
            {
                parent.showalert('success',getMessageForKey("sdp.admin.site.activesite.successmsg"),'isAutoHide=true,delay=3'); // No I18n
                isActive1 = false;
                filterSites("inactive",false); // No I18N
            }
        }
    }
}

//MSP Timesheet FGA - this feature is disabled for SDP as of now
function checkViewTimesheet()
{
    if(document.getElementById('approveTimesheet').checked){
        document.getElementById('viewTimesheet').checked=true;
    }
}

function unCheckApproveTimesheet()
{
    if(!document.getElementById('viewTimesheet').checked){
        document.getElementById('approveTimesheet').checked=false;
    }
}

