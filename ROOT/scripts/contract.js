/* $Id$ */

function callAddAssetsToContract()
{
	var coIDView = document.getElementById("coIDView").value;
	NewWindow('ContractResourcesDef.do?mode=viewSelectResources&contractID='+coIDView+'','addResources','870','513','yes','center')
}
function removeContractedAsset(thisForm)
{
	var confirm1 = document.getElementById("confirm1").innerHTML;
	var confirm2 = document.getElementById("confirm2").innerHTML;
	var it= confirmDelete(thisForm,'checkbox',confirm1,confirm2);//NO I18N
	if(it)
	{
		var coIDView = document.getElementById("coIDView").value;
		thisForm.action=thisForm.action+"?contractID="+coIDView+"&contractMode=deleteAsset";
		thisForm.submit();
	}
	return false;
}

function showContractTabs(tabID)
{
	jQuery(tabID).parent().addClass("active");
	jQuery(tabID).parent().siblings().each(function(){
		jQuery(this).removeClass("active")
	});
	var divname= tabID.id;
	jQuery("#"+divname+"-content").show().siblings().hide();
	if((divname=='ct-details')||(divname=='ct-renewal')||(divname=='ct-child'))
	{
		jQuery('.countfilter').countercomboUI();
	}
	/*else if(divname=='proj-comments')
	{
		listHover();
	}*/
}

function deleteContracts(thisForm)
{
	var confirm1 = document.getElementById("confirm1").innerHTML;
	var confirm2 = document.getElementById("confirm2").innerHTML;
	var it= confirmDelete(thisForm,'checkbox',confirm1,confirm2);//NO I18N
	if(it)
	{
		thisForm.action=thisForm.action+"?contractMode=deleteContract";
		thisForm.submit();
	}
	return false;
}

function contractStatusFilterChange(form)
{
	form.categoryID.value=null;
	updateState(getPortalViewName("ContractListView"),"_D_RP", "viewName=" + form.viewName.value);//No I18N
	updateFormValues("ContractListView",form);//No I18N
	refreshSubView(getPortalViewName("ContractListView"));
}

var modes;
var xmlRequest;
var operations;

function updateParentVendor(selectTag)
{
	var selectedParent = selectTag[selectTag.selectedIndex].value;
	if (selectedParent !=null && selectedParent != '')
	{	
        var url = "/ContractDef.do";//No I18N
		var param = "contractMode=get_parent_vendor&parentID=" + selectedParent;//No I18N
	    callCustomAjaxRequestForGET(url, param, updateParentContractSuccess, ajaxRequestOnFailure, 'get_parent_vendor');//No I18N
	}
	else
	{
		document.getElementById("addVendor").className = "show";
		document.getElementById("vendorID").selectedIndex= null;
		document.getElementById("vendorID").disabled = false;
		document.getElementById("vendorID").style.width = "205px";
	}
}
function updateParentContract(selectTag)
{
    var selectedVendor = selectTag[selectTag.selectedIndex].value;
	var contractID = document.ContractDefForm.contractID ? document.ContractDefForm.contractID.value : null;
	var url = "/ContractDef.do";//No I18N
	var param = "contractMode=get_parent_contract";//No I18N
	if (selectedVendor != null && selectedVendor != '') {
		param = param + "&vendorID=" + selectedVendor;//No I18N
	}
	if (contractID != null) {
		param = param + "&contractID=" + contractID;//No I18N
	}
	callCustomAjaxRequestForGET(url, param, updateParentContractSuccess, ajaxRequestOnFailure, 'get_parent_contract');//No I18N
}
function updateParentContractSuccess(xmlRequest,operation)
{
	if(operation =='get_parent_vendor')
	{
		var vendorID = xmlRequest.responseText;
				if (vendorID != null)
				{
					var selectVendor = document.getElementById("vendorID");
					selectVendor.value = vendorID;
					selectVendor.disabled = true;
					document.getElementById("addVendor").className = "hide";
					document.getElementById("vendorID").style.width = "225px";
				}
	}
	else if(operation == 'get_parent_contract')
	{
			var parentContract = JSON.parse(xmlRequest.responseText);
			jQuery('#parentID').find('option:not(:first)').remove();
			jQuery.each(parentContract, function(key,value){
					jQuery('#parentID').append('<option value="'+encodeHTMLAttribute(key)+'">'+encodeHTML(value)+'</option>');
			});
	}
}
function updateResourcesList(resourceID)
{
	if (resourceID !=null && resourceID != '')
	{	
		this.operations = 'getResourceName';//No I18N
		callAjaxThreads(this.operations,resourceID);
	}
}

function callAjaxThreads(action,ID)
{
	xmlRequest = false;
	// branch for native XMLHttpRequest object
	if(window.XMLHttpRequest)	
	{
		try
		{
			xmlRequest = new XMLHttpRequest();
		}
		catch(e)
		{
			xmlRequest = false;
		}
		// branch for IE/Windows ActiveX version
	}	
	else if(window.ActiveXObject)
	{
		try
		{
			xmlRequest = new ActiveXObject("Msxml2.XMLHTTP");//No I18N
		}
		catch(e)
		{
			try 
			{
				xmlRequest = new ActiveXObject("Microsoft.XMLHTTP");//No I18N
			}
			catch(e)
			{
				xmlRequest = false;
			}
		}
	}
	if(xmlRequest)
	{



		if( action == 'getResourceName' )
		{
			var url = "/ContractResourcesDef.do";//No I18N
			var params = "mode=" + action + "&resourceID=" + ID;//No I18N
			xmlRequest.open("POST", url, true);//No I18N
			xmlRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			xmlRequest.setRequestHeader("Content-length", params.length);//No I18N
			xmlRequest.onreadystatechange = updateAjaxThreads;
			xmlRequest.send(params);
		}
	}
}

function updateAjaxThreads()
{
	// only if req shows "loaded"
	if (xmlRequest.readyState == 4)
	{
		// only if "OK"
		if (xmlRequest.status == 200)
		{

			if( operations == 'getResourceName' )
			{
				var resourceXml = xmlRequest.responseXML;
				var status = resourceXml.childNodes[0].childNodes[0].childNodes[0].nodeValue;

				var resources = (resourceXml.getElementsByTagName("RESOURCES"));

				for (i=0; i<resources.length; i++)
				{
					var resource = (resources[i].childNodes[0].nodeValue).split(":");
					window.opener.setResourcesList(resource[0],resource.slice(1).join(":"));
				}
			}
		}
	}
}


function showContractDetails(tdID)
{
	var tabTdIDs = new Array("contractDetails","renewalDetails","childDetails");
	var tabTdContents = new Array(getMessageForKey("sdp.contract.printView.conDetails"),getMessageForKey("ae.contract.view.renewDetail"),getMessageForKey("ae.contract.view.childContracts"));
	for (var i=0; i<tabTdIDs.length; i++)
	{
		if(tabTdIDs[i] == tdID)
		{
			jQuery('#'+tdID).removeClass('subtaboff');
			jQuery('#'+tdID).addClass('subtabon');
			document.getElementById(tdID).innerHTML = '<div>'+tabTdContents[i]+'</div>';
			document.getElementById(tdID+'-content').style.display = 'block';
		}
		else
		{
			jQuery('#'+tabTdIDs[i]).removeClass('subtabon');
			jQuery('#'+tabTdIDs[i]).addClass('subtaboff');
			document.getElementById(tabTdIDs[i]).innerHTML = '<a data-event="click" data-handler="showContractDetails(this.parentNode.id)" nonce="'+sdpNonce+'" href="/" sdphrefJs="js-href-contract-1">'+tabTdContents[i]+'</a>';
			document.getElementById((tabTdIDs[i]+'-content')).style.display = 'none';
		}
	}
}

function addSubContracts(contractID)
{
	showURLInDialog("/contract/AddSubContracts.jsp?contractMode=addSubContract&parentContractID="+contractID+"&"+new Date().getTime(),'closeButton=yes,position=absolute,width=900,left=200,top=100,title='+getMessageForKey("ae.contract.view.addChild"));	//No I18N
}
function contractCategoryChange(form)
{
	if( form.categoryID.value != '' )
	{
		updateState(getPortalViewName("ContractListView"),"_D_RP", "categoryID=" + form.categoryID.value);//No I18N
	}
	else
	{
		updateState(getPortalViewName("ContractListView"),"_D_RP");//No I18N
	}
	//updateState("ContractListView","_D_RP", "forwardedFrom=" + null);//No I18N
	refreshSubView(getPortalViewName("ContractListView"));
}
//This code should be removed after mickey client movement
jQuery(document).ready(function(){  // Issue fix #98494
	jQuery(document).on('click','input[id$=_CCBtn]',function(){	//No I18N
	    	setTimeout(function(){ 
		    		jQuery('#_DIALOG_LAYER').addClass('temp-digpos');	//No I18N
	    	},250);	
	});
  	//Screen resolution based delete button value changed to icon/text
	  tableComponent && tableComponent.prototype.handleResizeBtnVal && (tableComponent.prototype.handleResizeBtnVal());
});
//This code should be removed after mickey client movement
