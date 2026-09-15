

/* $Id$ */
if (window.navigator.userAgent.toUpperCase().indexOf("OPERA") >= 0)
{
        var browser_opera_ae=true;
}


function loadSoftwareInformation()
{
	document.getElementById('totalSoftware').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('managedSoftware').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('unIdentifiedSoftware').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>"; //No I18N
	document.getElementById('prohibitedSoftware').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('unusedLicenses').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	//document.getElementById('unusedlicensecost').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('rarelyUsedLicenses').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	//document.getElementById('rarelyUsedLicensesCost').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('expired').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('expirein7days').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	document.getElementById('expirein30days').innerHTML = "<img src='/images/ajax-loader.gif' border='0'>";//No I18N
	updateSoftwareInformation();
}
function showRarelyUsedSoftwareListView()
{
	var param = '/SoftwareListView.do?softwareManufacturer=' + document.getElementById('softwareManufacturer').value;//No I18N;
	param += "&site=" + document.getElementById('allsites').value;//No I18N
	param += "&swType=2&fromRarelyUsedLink=true&swComplianceType=0&showZeroCount=false";//No I18N
	document.location = param;
}
function showUnusedLicensesListView()
{
	var param = '/SoftwareListView.do?softwareManufacturer=' + document.getElementById('softwareManufacturer').value;//No I18N;
	param += "&site=" + document.getElementById('allsites').value;//No I18N
	param += "&swType=2&fromSoftwareHome=true&showZeroCount=false&unusedlicenses=true";//No I18N
	document.location = param;

}
function updateSoftwareInformation()
{
	var param = "operation=fetchsoftwarecount";//No I18N
	param += "&swManufacturer=" + document.getElementById('softwareManufacturer').value;//No I18N
	let siteVal = document.getElementById('allsites').value;
    if (siteVal === '') {
        siteVal = '-1';
        document.getElementById('allsites').value = siteVal;
    }
	param += "&siteId=" + document.getElementById('allsites').value;//No I18N
	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'fetchsoftwarecount');//NO I18N
}
function updateLicenseInformation()
{
	var param = "operation=fetchlicensecount";//No I18N
	param += "&swManufacturer=" + document.getElementById('softwareManufacturer').value;//No I18N
	let siteVal = document.getElementById('allsites').value;
    if (siteVal === '') {
        siteVal = '-1';
        document.getElementById('allsites').value = siteVal;
    }
	param += "&siteId=" + document.getElementById('allsites').value;//No I18N
	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'fetchlicensecount');//NO I18N
}
function updateRarelyUsedSoftwareCount(graphName)
{
	var param = "operation=fetchrarelyusedlicensecount";//No I18N
	param += "&swManufacturer=" + document.getElementById('softwareManufacturer').value;//No I18N
	let siteVal = document.getElementById('allsites').value;
    if (siteVal === '') {
        siteVal = '-1';
        document.getElementById('allsites').value = siteVal;
    }
	param += "&siteId=" + document.getElementById('allsites').value;//No I18N
	//param += "&graphName=" + graphName;//No I18N
	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'fetchrarelyusedlicensecount');//NO I18N
}
function loadSoftwareComplianceGraph()
{
	var param = "operation=getGraph";//No I18N
	param += "&swManufacturer=" + document.getElementById('softwareManufacturer').value;//No I18N
	let siteVal = document.getElementById('allsites').value;
    if (siteVal === '') {
        siteVal = '-1';
        document.getElementById('allsites').value = siteVal;
    }
	param += "&siteId=" + document.getElementById('allsites').value;//No I18N
	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'getGraph');//NO I18N
}
function updateLicenseAgreementStatus()
{
	var param = "operation=agreementexpiryinfo";//No I18N
	param += "&swManufacturer=" + document.getElementById('softwareManufacturer').value;//No I18N
	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'agreementexpiryinfo');//NO I18N
}
function softwareHomeRequestOnFailure( requestObj, module )
{
	alert(requestObj.responseText);
}
function softwareHomeRequestOnSuccess( req, module )
{
	if( module == 'fetchsoftwarecount' )
	{
		var obj = req.responseXML;

		//SD-63539 :  If their is No Software present present in the Asset Explorer , Software Dashboard page is showing the Loading Image
		if( obj != null )
		{
			var stypes = obj.getElementsByTagName("softwaretype");

			if( stypes.length != 0 )
			{
				for( i=0; i<stypes.length; i++ )
				{
					if( stypes[i].getAttribute("type") == 'Total' )
					{
						document.getElementById('totalSoftware').innerHTML = stypes[i].getAttribute("count");//No I18N
					}
					else if( stypes[i].getAttribute("type") == 'Managed' )
					{
						document.getElementById('managedSoftware').innerHTML = stypes[i].getAttribute("count");//No I18N
					}
					else if( stypes[i].getAttribute("type") == 'UnIdentified' )
					{
						document.getElementById('unIdentifiedSoftware').innerHTML = stypes[i].getAttribute("count");//No I18N
					}
					else if( stypes[i].getAttribute("type") == 'Prohibited' )
					{
						document.getElementById('prohibitedSoftware').innerHTML = stypes[i].getAttribute("count");//No I18N
					}
				}

				if( document.getElementById('prohibitedSoftware').innerHTML.indexOf('ajax-loader') >= 0 )
				{
					document.getElementById('prohibitedSoftware').innerHTML = "0";//NO I18N
				}
				if( document.getElementById('unIdentifiedSoftware').innerHTML.indexOf('ajax-loader') >= 0 )
				{
					document.getElementById('unIdentifiedSoftware').innerHTML = "0";//NO I18N
				}
				if( document.getElementById('managedSoftware').innerHTML.indexOf('ajax-loader') >= 0 )
				{
					document.getElementById('managedSoftware').innerHTML = "0";//NO I18N
				}
				if( document.getElementById('totalSoftware').innerHTML.indexOf('ajax-loader') >= 0 )
				{
					document.getElementById('totalSoftware').innerHTML = "0";//NO I18N
				}
			}
			else
			{
				document.getElementById('totalSoftware').innerHTML = "0";//No I18N
				document.getElementById('managedSoftware').innerHTML = "0";//No I18N
				document.getElementById('unIdentifiedSoftware').innerHTML = "0"; //No I18N
				document.getElementById('prohibitedSoftware').innerHTML = "0";//No I18N
			}
		}
		else
		{
			document.getElementById('totalSoftware').innerHTML = "0";//No I18N
			document.getElementById('managedSoftware').innerHTML = "0";//No I18N
			document.getElementById('unIdentifiedSoftware').innerHTML = "0"; //No I18N
			document.getElementById('prohibitedSoftware').innerHTML = "0";//No I18N
		}
		updateLicenseInformation();
	}
	else if( module == 'fetchunderlicensedsites' )
	{
		var xmlDoc = req.responseXML;

		//SD-63539 :  If their is No Software present present in the Asset Explorer , Software Dashboard page is showing the Loading Image
		if( xmlDoc != null )
		{
			if( xmlDoc.getElementsByTagName('compliant') != null && xmlDoc.getElementsByTagName('compliant').length > 0 )
			{
				jQuery('#overallCompliance').show();
				jQuery('#siteBasedCompliance').hide();
				updateCompliance(xmlDoc.getElementsByTagName('compliant')[0].firstChild.nodeValue);
			}
			else if( xmlDoc.getElementsByTagName('overallCompliance') != null && xmlDoc.getElementsByTagName('overallCompliance').length > 0 )
			{
				jQuery('#overallCompliance').show();
				jQuery('#siteBasedCompliance').hide();
				updateCompliance(xmlDoc.getElementsByTagName('overallCompliance')[0].firstChild.nodeValue);
			}
			else
			{
				jQuery('#overallCompliance').hide();
				jQuery('#siteBasedCompliance').show();

				if( xmlDoc.getElementsByTagName('violation').length > 0 )
				{
					jQuery('#siteBasedCompliance span:first').show();//No I18N
					jQuery('#siteBasedCompliance span:first').html(xmlDoc.getElementsByTagName('violation')[0].firstChild.nodeValue.replace(/^\[CDATA\[/,'').replace(/\]\]$/,''));
				}
				else
				{
					jQuery('#siteBasedCompliance span:first').hide();//No I18N
				}

				if( xmlDoc.getElementsByTagName('overlicense').length > 0 )
				{
					if( xmlDoc.getElementsByTagName('violation').length > 0 )
					{
						jQuery('.site-seperator').show();
					}
					else
					{
						jQuery('.site-seperator').hide();
					}
					jQuery('.over-licensed').show();
					jQuery('#siteBasedCompliance span:last').html(xmlDoc.getElementsByTagName('overlicense')[0].firstChild.nodeValue.replace(/^\[CDATA\[/,'').replace(/\]\]$/,''));
				}
				else
				{
					jQuery('.site-seperator').hide();
					jQuery('.over-licensed').hide();
				}
			}
		}
	}
	else if( module == 'getGraph' )
	{
		let container = jQuery("#compliancePieChart")[0];
		let data = JSON.parse(req.responseText);
		if (data.hasOwnProperty("failure")) {
            jQuery("#compliancePieChart").html('<span class = "swdbindexcr">'+ translate('sdp.discovery.sccm.failure') + ' : ' + ZSEC.Encoder.encodeForHTML(a.failure)+ '</span>'); //No I18N
        }
		else {
			let formattedData = [
				Object.entries(data.graphData).map(([key, value]) => [key, value])
			];
			swChartsObj.createPieChartData(container,formattedData);
		}
	}
	else if( module == 'agreementexpiryinfo' )
	{
		var obj = req.responseXML;

		//SD-63539 :  If their is No Software present present in the Asset Explorer , Software Dashboard page is showing the Loading Image
		if( obj != null )
		{
			var expiry = obj.getElementsByTagName('expiry');//No I18N

			if( expiry.length != 0 )
			{
				document.getElementById('expired').innerHTML = expiry[0].getAttribute('expired');//No I18N
				document.getElementById('expirein7days').innerHTML = expiry[0].getAttribute('expirein7');//No I18N
				document.getElementById('expirein30days').innerHTML = expiry[0].getAttribute('expirein30');//No I18N
			}
			else
			{
				document.getElementById('expired').innerHTML = "0";//No I18N
				document.getElementById('expirein7days').innerHTML = "0";//No I18N
				document.getElementById('expirein30days').innerHTML = "0";//No I18N
			}
		}
		loadSoftwareComplianceGraph();//No I18N
	}
	else if( module == 'fetchrarelyusedlicensecount' )
	{
		var obj = req.responseXML;
		//SD-63539 :  If their is No Software present present in the Asset Explorer , Software Dashboard page is showing the Loading Image
		if( obj != null )
		{
			var rarelyused = obj.getElementsByTagName("rarelyused");

			if( rarelyused.length != 0 )
			{
				document.getElementById('rarelyUsedLicenses').innerHTML = rarelyused[0].getAttribute('license');//No I18N
				//document.getElementById('rarelyUsedLicensesCost').innerHTML = rarelyused[0].getAttribute('cost');//No I18N
			}
			else
			{
				document.getElementById('rarelyUsedLicenses').innerHTML = '0';//No I18N
				//document.getElementById('rarelyUsedLicensesCost').innerHTML = '0.0';//No I18N
			}
		}
		updateLicenseAgreementStatus();
	}
	else if( module == 'addsoftwareinstallation' )
	{
		if( req.responseText == 'success' )
		{
			document.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#softwareId').val())+"&PORTALID="+PORTALID;
		}
		else
		{
			alert(ZSEC.Encoder.encodeForHTML(req.responseText)); // error message thrown for restricted user #SD-113080
			jQuery('#saving').removeClassClass("hide");//NO I18N
            jQuery('#processing').addClass("hide");//NO I18N
		}
	}
	else if( module == 'fetchlicensecount' )
	{
		var obj = req.responseXML;

		//SD-63539 :  If their is No Software present present in the Asset Explorer , Software Dashboard page is showing the Loading Image
		if( obj != null )
		{
			var unused = obj.getElementsByTagName("unused");

			if( unused.length != 0 )
			{
				document.getElementById('unusedLicenses').innerHTML = unused[0].getAttribute("license");//No I18N
				//document.getElementById('unusedlicensecost').innerHTML = unused[0].getAttribute("cost");//No I18N
			}
			else
			{
				document.getElementById('unusedLicenses').innerHTML = "0";//No I18N
				//document.getElementById('unusedlicensecost').innerHTML = "0.0";//No I18N
			}
		}

		updateRarelyUsedSoftwareCount();
	}
	else if( module == 'showSuiteSoftwares' )
	{
		showDialog(req.responseText, "position=relative,top=20, left=90,width=700,closeButton=no");//No I18N
	}
	else if( module == 'changeSWType' )
	{
		if( req.responseText.indexOf('failed') >= 0 )
		{
			setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", req.responseText, true, 5000);},1000);//NO I18N
		}
		else
		{
			setTimeout(function(){displayLoadingInformation("/images/discoverystatus_discovered.gif",  encodeHTML(req.responseText) , true, 2000);},1000);//NO I18N
			reloadSoftwareListView();
		}
		//jQuery('#moveSwType').val('-1');//No I18N
		jQuery('#moveSwType').select2('val', -1);//NO I18N
	}
	else if( module == 'deleteSoftwares' || module == 'changeCategory' || module == 'changeManufacturer' )
	{
	//For SD - 111145 the response has HTML text hence cannot be encoded, for deleting softwares in SoftwareHomeAction (Line-716,the i18n key has HTML text) hence the encode is removed.
		if( req.responseText.toUpperCase().indexOf('FAILED') >= 0 )
		{
			setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", req.responseText, true, 5000);},1000);//NO I18N
		}
		else
		{
			setTimeout(function(){displayLoadingInformation("/images/discoverystatus_discovered.gif", encodeHTML(req.responseText), true, 2000);},1000);//NO I18N
			reloadSoftwareListView();
		}
	}
	else if( module == 'saveSuiteScanSettings' )
    {
        if( req.responseText =="failed : " + getMessageForKey("api.validation.unauthorised"))
        {
            alert(req.responseText);
            jQuery('#FreezeLayer').remove(); //No I18N
            jQuery('#processing').addClass('hide');//No I18N
            jQuery('#saving').removeClass('hide');//No I18N
        }
        else if( req.responseText.indexOf('failed') >= 0 )
        {
            jQuery('#error_message').show();
            jQuery('#processing').addClass('hide');//No I18N
            jQuery('#saving').removeClass('hide');//No I18N
        }
        else
        {
            window.opener.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#suitesoftwares option:selected').val());
            window.close();
        }
    }
}
function showSoftwareListView(linkObj,softwareTypeId)
{
	if( linkObj.innerHTML != '0')
	{
		var param = '';
		if( softwareTypeId != null )
		{
			param = '&swType=' + softwareTypeId;//No I18N
		}
		else
		{
			param = '&swType=0';//No I18N
		}

		param += "&swComplianceType=0";//No I18N

		if( linkObj.id == "totalSoftwareCount" || linkObj.id == "managedSoftwareCount" )
		{
			document.location = "/SoftwareListView.do?softwareManufacturer=-1&site=-1"+ param + '&fromSoftwareHome=true&showZeroCount=false';//No I18N
		}
		else
		{
			document.location = "/SoftwareListView.do?softwareManufacturer=" + document.getElementById('softwareManufacturer').value + "&site=" + document.getElementById('allsites').value + param + '&fromSoftwareHome=true&showZeroCount=false';//No I18N
		}
	}
}
function deleteSoftwareLicenses()
{
	var valid = isCheckBoxSelected('alllicenses');//No I18N

	if(valid)
	{
		valid = confirm(getMessageForKey("sdp.inventory.delete.swlicense.confirmMsg"));//No I18N
		if(valid)
		{
			displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.file.delete.progress.msg'), false);//NO I18n
			var param = 'operation=removeSoftwareLicenses';//No I18N
			jQuery("[name='alllicenses']").each(function(){
				if( this.checked )
				{
					param += '&alllicenses=' + this.value;//No I18N
				}
			});
			callCustomAjaxRequest('/SoftwareHome.do', param, removeSoftwareLicenses, ajaxRequestOnFailure, 'removeSoftwareLicenses');//No I18N
		}
	}
	else
	{
		alert(getMessageForKey("sdp.inventory.viewSoftware.detailView.selectMsg"));//No I18N
	}
	return false;
}

function moveLicensesToSite(allocateToSite)
{
	var valid = isCheckBoxSelected("alllicenses");//No I18N
	if(valid)
	{
		if( jQuery('#companyWideLicenses').attr('class') == undefined || jQuery('#companyWideLicenses').attr('class').indexOf('sw-useratabact') < 0 )
		{
			if( allocateToSite.value != -1 )
			{
				valid = confirm(getMessageForKey("sdp.inventory.licenselistview.unalloc.selectMsg") + " - " + document.getElementById('moveLicenseToSite').options[document.getElementById('moveLicenseToSite').options.selectedIndex].innerText);//No I18N
				if (!valid)
				{
					jQuery("#moveLicenseToSite").select2("val", "-1");//NO I18N
					return false;
				}
				displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
				var param = 'operation=allocateLicenseToSite';//No I18N
				jQuery("[name='alllicenses']").each(function(){
					if( this.checked )
				{
					param += '&alllicenses=' + this.value;//No I18N
				}
				});
				param += '&siteId=' + allocateToSite;//No I18N
				callCustomAjaxRequest('/SoftwareHome.do', param, assignSiteToLicense, ajaxRequestOnFailure, 'allocateLicenseToSite');//No I18N
			}
			else
			{
				jQuery("#moveLicenseToSite").select2("val", "-1");//NO I18N
				alert(getMessageForKey("sdp.inventory.licenselistview.siteseletion.selectMsg"));//No I18N
				return false;
			}
		}
		else
		{
			alert(getMessageForKey('sdp.software.license.allocation.warn'));//NO I18N
		}
	}
	else
	{
		jQuery("#moveLicenseToSite").select2("val", "-1");//NO I18N
		alert(getMessageForKey("sdp.inventory.licenselistview.detailView.selectMsg"));//No I18N
	}
	return false;
}


function removeSoftwareLicenses(req, operation)
{
	if( req.responseText == 'success' )
	{
		jQuery("#sw-users-content").html('');//No I18N
		jQuery("#sw-installation-content").html('');//No I18N
		jQuery("#sw-details-content").html('');//No I18N

		callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showLicenseDetails&softwareId=' + jQuery('#softwareId').val() + '&selectedSiteId=' + jQuery('#selectedSiteId').val(), loadDetails, failureOnLoad, 'sw-licenses');//NO I18N
		setTimeout(function(){displayLoadingInformation("/images/discoverystatus_discovered.gif", getMessageForKey('sdp.swdetailspage.workstation.swdeleted'), true, 3000);},1000);//NO I18N
	}
	else
	{
		setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", encodeHTML(req.responseText), true, 5000);},1000);//NO I18N
	}
	parent.closeDialog();
}

function assignSiteToLicense(req, operation)
{
	var selectedLicenseTypeId = -1;

	if( jQuery('#selectedLicenseTypeId').length > 0 )
	{
		selectedLicenseTypeId = jQuery('#selectedLicenseTypeId').val();//NO I18N
	}

	reloadListview('alllicenses', JSON.parse('{"softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "licenseTypeId" : "' + selectedLicenseTypeId + '"}'));//No I18N

	parent.closeDialog();

	if( req.responseText == 'failed' )
	{
		setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", getMessageForKey('sdp.swdetailspage.already.allocated'), true, 5000);},1000);//NO I18N
	}
	else if(req.responseText.includes("failure")) {
        setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif",encodeHTML(req.responseText), true, 5000);},1000);//NO I18N
	}
	else
	{
		setTimeout(function(){displayLoadingInformation("/images/discoverystatus_discovered.gif", encodeHTML(req.responseText), true, 3000);},1000);//NO I18N
	}
	jQuery("#moveLicenseToSite").select2("val", "-1");//NO I18N
}
/*function changeSite( selectTag, form )
{
        var swId = document.getElementById("swId").value;//No I18N
        document.location = "/SWWorkstationListView.do?criteria=" + swId + "&selectedSite=" + selectTag.value;//No I18N
}*/
function selectAllSw(thisForm, checkBoxCompName)
{
	toSelectAll = false;
	if(thisForm.checkbox25.checked)
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
function showNeededFields(selectTag)
{
	if( selectTag.value == 'Numeric Field' || selectTag.value == 'Date/Time Field' )
	{
		hideRow('defaultRow');//NO I18N
	}
	else
	{
		displayRow('defaultRow');//NO I18N
	}

	if( selectTag.value == 'Pick List' )
	{
		displayRow('picklistlabel');//NO I18N
		displayRow('picklistdata');//NO I18N
	}
	else
	{
		hideRow('picklistlabel');//NO I18N
		hideRow('picklistdata');//NO I18N
	}
}
function removePickListValue( selectTag )
{
	var length = selectTag.options.length;

	for( i=0; i<length; i++ )
	{
		if( selectTag.options[i].selected )
		{
			selectTag.options[i] = null;
			i = 0;
			length = selectTag.options.length;
		}
	}
}
function addPickListValue( valueTag, selectTag )
{
	var value = valueTag.value;
	if( trim(value) != '' )
	{
		var length = selectTag.options.length;
		selectTag.options[length] = new Option(value, value);
		valueTag.value = '';//No I18N
		valueTag.focus();
	}
	else
	{
		valueTag.value = '';//No I18N
		valueTag.focus();
		alert(getMessageForKey('sdp.software.license.agreement.pickvaluemand'));//No I18N
	}
}
function showAddNewLicensesPage()
{
	//showURLInDialog('/software/addnewlicensepage.jsp?swManufacturerId=' + document.getElementById('swManufacturer').value,'closeButton=yes,title=');//NO I18N
	NewWindow('/software/addnewlicensepage.jsp?swManufacturerId=' + document.getElementById('swManufacturer').value,'addNewItem','1000','335','no','center');//NO I18N
}
function createNewLicenses()
{
	if( document.getElementById('swlicenselist') != undefined )
	{
		var length = document.getElementById('swlicenselist').rows.length;

		var rowObj = document.getElementById('swlicenselist');

		for( i=0; i<length; i++ )
		{
			if( rowObj.rows[i].id != 'labelRow' )
			{
				var index = rowObj.rows[i].id.split('_')[1];

				if( parseInt(document.getElementById('software_' + index).value) > 0 )
				{
					if( parseInt(document.getElementById('licenseType_' + index).value) < 0 )
					{
						showBaloonToolTip('licenseType_' + index, getMessageForKey('sdp.admin.software.licensetype.choosetypetodel'));//No I18N
						return;
					}
					if( parseInt(document.getElementById('licenseOption_' + index).value) < 0 )
					{
						showBaloonToolTip('licenseOption_' + index, getMessageForKey('sdp.inventory.swLicense.selectLicenseOptionjsError'));//No I18N
						return;
					}

					try
					{
						if (document.getElementById('licenseCount_' + index).value != 'Unlimited' )
						{
						if( trim(document.getElementById('licenseCount_' + index).value) != '' && (parseInt(document.getElementById('licenseCount_' + index).value) > 0   ))
						{
							document.getElementById('licenseCount_' + index).value = parseInt(document.getElementById('licenseCount_' + index).value);//No I18N
						}
						else
						{
							showBaloonToolTip('licenseCount_' + index, getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
							return;
						}
						}
					}
					catch(ex)
					{
						showBaloonToolTip('licenseCount_' + index, getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
						return;
					}
					try
					{
						if( trim(document.getElementById('licenseCost_' + index).value) != '' && isDouble(document.getElementById('licenseCost_' + index).value) )
						{
						}
						else
						{
							showBaloonToolTip('licenseCost_' + index, getMessageForKey('sdp.purchase.addNew.popUpProduct.jsCostErr'));//No I18N
							return;
						}
					}
					catch(e)
					{
						showBaloonToolTip('licenseCost_' + index, getMessageForKey('sdp.purchase.addNew.popUpProduct.jsCostErr'));//No I18N
						return;
					}
				}
				else{
					showBaloonToolTip('software_' + index, getMessageForKey('ae.cmdb.inventory.ci.swins.selectSWJSError'));//No I18N
					return;
				}
			}
		}
		var param = "operation=createlicenses" + constructParameters(document.LicenseAgreement);//No I18N

		callCustomAjaxRequest('/LicenseAgreement.do',param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'createlicenses');//No I18N
	}
}

function showLicenseTypePage(e)
{
        displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
	showURLInDialog("/software/softwarelicensetypeinclude.jsp?swManufacturerId=" + document.getElementById('softwareManufacturer').value,"closeButton=yes,position=absmiddle,left=" + (e.screenX - 320) + ",top=" + (e.screenY -  150) + ",title=,width=550");//No I18N
}

var iframeIEHackForSW;

function showBaloonToolTip(inputElement, message)
{
	showToolTipMessage(document.getElementById(inputElement), message);
}
var tooltipTimer,
    tooltipTimerRemove;
function showToolTipMessage(inputElementObj, message, timeOut)
{
	var mydiv = document.getElementById('normalbubbletooltip');//No I18N

        if(mydiv != undefined){
          mydiv.parentNode.removeChild(mydiv);
          mydiv = null;
        }
	if( mydiv == undefined )
	{
		mydiv = document.createElement('DIV');//No I18N
		inputElementObj.parentNode.appendChild(mydiv);
	}

	mydiv.style.zIndex='300';
	mydiv.style.position='absolute';
	mydiv.id = 'normalbubbletooltip';//No I18N
	mydiv.className = 'bubbletooltip';//No I18N
	mydiv.style.display='block';

	var left = getX(inputElementObj);
	var top = getY(inputElementObj) + inputElementObj.offsetHeight;

	//If the input field is in micket client dialog box then we need to re calculate position (Fix only for IE)
	if( document.getElementById('_DIALOG_LAYER') != undefined && document.getElementById('_DIALOG_LAYER').style.visibility == 'visible')
	{
		top = getY(inputElementObj);

		if( navigator.appName != "Netscape" )
		{
			left = left - getX(document.getElementById('_DIALOG_LAYER')) - 24;//No I18N
			top = top - getY(document.getElementById('_DIALOG_LAYER')) - 24;//No I18N
		}
		else
		{
			left = left - getX(document.getElementById('_DIALOG_LAYER'));//No I18N
			top = top - getY(document.getElementById('_DIALOG_LAYER')) + inputElementObj.offsetHeight;//No I18N
		}
	}

	mydiv.style.left = left;
	mydiv.style.top = top;

	mydiv.innerHTML = "<div class='tooltip-ui1'>" + encodeHTML(message) + "<span class='close-icon4' id='normalbubbletooltip_close' title='" + getMessageForKey("sdp.common.close") + "'></span></div>"; //No I18N
    document.getElementById('normalbubbletooltip_close').addEventListener('click', function() {
        document.getElementById('normalbubbletooltip').style.display = 'none'; //NO I18N
        removeFrame();
    });



	// In dialog window, the position is wrongly shown in IE
	if((document.getElementById("_DIALOG_LAYER") != null) && (document.getElementById("_DIALOG_LAYER").style.visibility!='hidden'))
	{
		if(document.all)
		{
			mydiv.style.left =left + 20 + "px";//No I18N
			mydiv.style.top = top + +40 + "px";//No I18N
		}
	}


        if (document.all && !browser_opera_ae) {
		iframeIEHackForSW = document.createElement("IFRAME");//No I18N
		iframeIEHackForSW.scrolling = "no";//No I18N
		iframeIEHackForSW.frameBorder = 0;
                if(window["CONTEXT_PATH"] != null)
                {
                   iframeIEHackForSW.src= CONTEXT_PATH + "/framework/html/blank.html";//No I18N
                }
		iframeIEHackForSW.style.position = "absolute";//No I18N
		iframeIEHackForSW.style.zIndex = "200";//No I18N
		iframeIEHackForSW.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';//No I18N

		iframeIEHackForSW.style.width = mydiv.offsetWidth + "px";//No I18N
		iframeIEHackForSW.style.height = mydiv.offsetHeight + "px";//No I18N
		iframeIEHackForSW.style.top = parseInt(top) + "px";//No I18N
		iframeIEHackForSW.style.left = parseInt(left) + "px";//No I18N

		document.body.appendChild(iframeIEHackForSW);
	}

	if( timeOut == undefined || timeOut == null )
	{
		timeOut = 4000;
	}

	if( timeOut > -1 ){
		clearTimeout( tooltipTimer , tooltipTimerRemove );
		tooltipTimer       = setTimeout(function(){hideBaloonToolTip('normalbubbletooltip');}, timeOut); //NO I18N
		tooltipTimerRemove = setTimeout(function(){removeFrame();}, timeOut);
	}

	try
	{
		inputElementObj.focus();
	}
	catch(e){}
}

function removeFrame(){
        if (document.all && !browser_opera_ae && iframeIEHackForSW != undefined) {
		document.body.removeChild(iframeIEHackForSW);
		iframeIEHackForSW = null;
	}
}
function confirmRemoveLicense()
{
  	         canRemove = confirm(getMessageForKey("sdp.inventory.listviewWS&SW.jsconfirm")); // No I18N
  	         return canRemove;
}

function hideBaloonToolTip(divId)
{
	jQuery('[id^="normalbubbletooltip"]').each(function()
    {
         var id = document.getElementById(divId);
         if(!id)
         {
             return false;
         }
     id.style.display = 'none'; //No I18N
    });
}

function validateAddNewSoftware(form)
{
	var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if(form.cost!=null && !anum.test(form.cost.value)){
		showBaloonToolTip('cost', getMessageForKey("sdp.inventory.detailAsset.invalidCostMsg"));
		return false;
	}
	if(form.softwareName.value == "")
	{
		showBaloonToolTip('softwareName', getMessageForKey("sdp.inventory.newSW.emptySwMsg"));
		return false;
	}
	y = trimAll(form.softwareName.value)

	if(y==null || y=='')
	{
		showBaloonToolTip('softwareName', getMessageForKey("sdp.inventory.newSW.invalidSwMsg"));
		form.softwareName.value = '';
		return false;
	}

	var category = form.category.value;
	if (category != null && category == '0')
	{
		showBaloonToolTip('category', getMessageForKey("sdp.inventory.software.softwarejserror"));
		return false;
	}

	if( jQuery('#isSuiteSoftware').prop('disabled') == false && document.getElementById('isSuiteSoftware') != undefined && document.getElementById('isSuiteSoftware').checked )
	{
		if( document.getElementById('suitesoftwares').options.length == 0 )
		{
			showBaloonToolTip('suitesoftwares', getMessageForKey('ae.software.suite.software.alert'));//No I18N
			return false;
		}
		else if( document.getElementById('suitesoftwares').options.length == 1 )
		{
			showBaloonToolTip('suitesoftwares', getMessageForKey('ae.software.suite.software.component.select.warn'));//No I18N
			return false;
		}
	}

	freezePage('softwareinputpage');//No I18N

	displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n

	if(document.getElementById('isSuiteSoftware') != null && document.getElementById('isSuiteSoftware').checked){

		document.AddSoftware.suiteRuleId.value = jQuery('#suiteRuleValue').val();

		if( !document.getElementById('rule3').checked && document.getElementById('rule4').checked )
		{
			document.AddSoftware.suiteRuleId.value = jQuery('#rule4').val();
		}
		else
		{
			if( jQuery('#suiteRuleValue').val() > jQuery('#suitesoftwares option').length )
			{
				document.AddSoftware.suiteRuleId.value = jQuery('#suitesoftwares option').length;//NO I18N
			}
		}

		var workstationSelectTag = jQuery('#workstationIds');//NO I18N

		jQuery('[name=workstationIds]').each(function()
		{
			if( this.type == 'checkbox' )
			{
				if( !this.checked )
				{
					this.disabled = true;
				}
				else
				{
					workstationSelectTag.append('<option value="' + this.value + '">' + this.value + '</option>');//NO I18N
				}
			}
		});

		jQuery('#suitesoftwares option').each(function() { this.selected = true; });
		jQuery('#workstationIds option').each(function() { this.selected = true; });

	}
	var softwareImages=uploadImageSlider.getImagesList();
	for(index=0;index<softwareImages.length;index++){
		var imageNum = index+1;
		var input = document.createElement("input");//No I18N
        input.type = "hidden";//No I18N
        input.name = "images";//No I18N
        input.property = "images";//No I18N
        input.id = "image"+imageNum;//No I18N
        input.value = softwareImages[index];
		form.appendChild(input);
	}

	form.submit();
}

function showSuiteSection( rowObj, selectedSWIds )
{
	if( rowObj != null )
	{
		if( document.getElementById('type').options[document.getElementById('type').options.selectedIndex].innerHTML == 'Managed' )
		{
			rowObj.disabled = false;
			if( rowObj != undefined )
			{
				if( rowObj.checked )
				{
					displayRow('suitesoftwarerow');//No I18N
					displayRow('suiteRowHelp');//No I18N
					displayRow('suiteRuleRow');//No I18N
					loadSoftwareList(selectedSWIds);
				}
				else
				{
					hideRow('suitesoftwarerow');//No I18N
					hideRow('suiteRowHelp');//No I18N
					hideRow('suiteRuleRow');//No I18N
				}
			}
		}
		else
		{
			hideRow('suitesoftwarerow');//No I18N
			hideRow('suiteRowHelp');//No I18N
			hideRow('suiteRuleRow');//No I18N
			rowObj.disabled = true;
		}
	}
}

function loadSoftwareList(selectedSWIds)
{
	displayFadeMsg(getMessageForKey("sdp.reports.common.loading.message"), true);//No I18N
	var param = 'operation=fetchsoftwarelist';//No I18N

	//param += "&type=" + document.getElementById('type').value;//NO I18N
	param += "&swManufacturer=" + document.getElementById('swManufacturer').value;//NO I18N

	callCustomAjaxRequestForGET('/SoftwareHome.do', param, addNewSoftwareRequestOnSuccess, ajaxRequestOnFailure, selectedSWIds);//NO I18N
}

function addNewSoftwareRequestOnSuccess ( requestObj, selectedSWIds )
{
	var swJsonObj = selectedSWIds;
	var swList = requestObj.responseXML.getElementsByTagName("software");
	var swListLength = swList.length;

	AssetUtil.removeCompleteOptionTags(document.getElementById('allsuitesoftware'));
	AssetUtil.removeCompleteOptionTags(document.getElementById('suitesoftwares'));

	var isSoftwareSelected = false;

	if( swListLength > 0 )
	{
		try
		{
		for( i=0; i<swListLength; i++ )
		{
			document.getElementById('allsuitesoftware').options[i] = new Option(swList[i].childNodes[0].nodeValue, swList[i].getAttribute("id"));

			for( j=0; j<swJsonObj.length; j++ )
			{
				if(swJsonObj[j] == swList[i].getAttribute("id"))
				{
					document.getElementById('allsuitesoftware').options[i].selected = true;
					isSoftwareSelected = true;
				}
			}

		}
		}
		catch(e)
		{
			alert(e.message);
		}
	}
	else
	{
		document.getElementById('allsuitesoftware').options[0] = new Option(getMessageForKey('ae.software.nomanaged.software.message'), '-1');
		document.getElementById('allsuitesoftware').options[0].disabled = true;
	}

	if( isSoftwareSelected )
	{
		copyListValues('allsuitesoftware','suitesoftwares', null);//No I18N
	}

	jQuery("#centerstatus").hide();//No I18N
}
function addSuiteInstallation(softwareId)
{
	var valid = checkForDelete(document.SoftwareHome,"workstationIds");//No I18N

	if( !valid )
	{
		alert(getMessageForKey('ae.software.suite.software.installation.alert'));//No I18N
		return false;
	}

	var param = "operation=addSuiteInstallation";//No I18N

	for(var i=0; i<document.SoftwareHome.elements.length; i++)
	{
		if(document.SoftwareHome.elements[i].name == 'workstationIds')
		{
			if(document.SoftwareHome.elements[i].checked)
			{
				param += "&wsId=" + document.SoftwareHome.elements[i].value;
			}
		}
	}

	param += '&softwareId=' + softwareId;//No I18N

	callCustomAjaxRequest('/SoftwareHome.do', param, updateSWInstallationOnSuccess, ajaxRequestOnFailure, softwareId);//NO I18N
}
function updateSWInstallationOnSuccess( requestObj, operation)
{
	if( requestObj.responseText == 'success' )
	{
		window.opener.document.location = '/SWWorkstationListView.do?criteria=' +  operation;
		self.close();
	}
	else
	{
		alert(requestObj.responseText);
	}
}
function showInstalledSoftwares( softwareIds, workstationId, showSuiteInstallationAlone )
{
	var param = "operation=showSuiteSoftwares";//No I18N

	for( i = 0; i < softwareIds.length; i++ )
	{
		param += "&softwareId=" + softwareIds[i];
	}

	param += "&workstationId=" + workstationId;//No I18N

	if( showSuiteInstallationAlone == null || showSuiteInstallationAlone == undefined )
	{
		param += "&showSuiteInstallationAlone=false";//NO I18N
	}
	else
	{
		param += "&showSuiteInstallationAlone=true";//NO I18N
	}

	callCustomAjaxRequestForGET('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'showSuiteSoftwares');//NO I18N
}

function deleteSuiteSoftwares(suiteSWId, softwareId)
{
	var valid = confirm(getMessageForKey("ae.software.details.remove.suite.component")); // No I18N

	if(valid)
	{
		freezePage('softwaredetailspage');//No I18N
		displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
		var param = 'operation=deletefromsuite&suiteId=' + suiteSWId + '&softwareId=' + softwareId;//No I18N
		callCustomAjaxRequest('/SoftwareHome.do', param, deleteSuiteResponse, softwareHomeRequestOnFailure, suiteSWId);//NO I18N
	}
}

function openAddNewSoftwarePage()
{
	var param = '';
	jQuery("[name='softwareList']").each(
		function(idx)
		{
			if( this.checked )
			{
				param += '&softwareId=' + this.value;//No I18N
			}
		}
	);

	if( param == '' )
	{
		param = '&softwareId=-1';//NO I18N
	}
	document.location = "/SoftwareListViewAction.do?add=New&isSuite=true" + param;
}
//Will get invoked from software listview page
function addToSuiteSoftware()
{
	if( jQuery("[id='suiteName']").val() == '-1' )
	{
		showBaloonToolTip('suiteName', getMessageForKey("sdp.admin.product.type.software.choose"));//No I18N
	}
	else
	{
		var param = 'operation=addtosuite';//No I18N

		jQuery("[name='softwareList']").each(function()
		{
			if( this.checked )
			{
				param += '&softwareId=' + this.value;//No I18N
			}
		});

		param += "&suiteId=" + jQuery("[id='suiteName']").val();//No I18N

		displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
		callCustomAjaxRequest('/SoftwareHome.do', param, addSuiteResponse, softwareHomeRequestOnFailure, 'addSuiteSoftware');//NO I18N
	}
}
function deleteSuiteResponse(req, suiteId)
{
	if( req.responseText == 'success' )
	{
		document.location = '/SWWorkstationListView.do?criteria=' + suiteId;
	}
	else
	{
		jQuery('#errorMessageRow').show();
		jQuery('#errorMessage').text('Unable to delete from suite.');//No I18N
		setTimeout(function(){jQuery('#errorMessageRow').fadeOut();}, 3000);
	}
}

function addSuiteResponse(req, operation)
{
	if( 'addSuiteSoftware' == operation )
	{
		if( req.responseText != 'success' )
		{
		    jQuery('#loadingdivid').hide();
			jQuery('#errorMessageRow').show();
			jQuery('#errorMessage').text(getMessageForKey('sdp.software.suite.unable.toadd') + req.responseText);//No I18N
			setTimeout(function(){jQuery('#errorMessageRow').fadeOut();}, 3000);
		}
		else
		{
			parent.closeDialog();

			setTimeout(function(){displayLoadingInformation("/images/discoverystatus_discovered.gif", getMessageForKey('sdp.admin.common.addedsuccessfully'), true, 2000);},1000);//NO I18N
			reloadSoftwareListView();
		}
	}
}

function addSuiteSoftwareFromDetailsPage(req,swID){
	if( req.responseText == 'success' )
		{
			this.window.location = '/SWWorkstationListView.do?criteria='+swID;
		}
		else
		{
			jQuery('#errorMessageRow').show();
			jQuery('#errorMessage').text(getMessageForKey('sdp.software.suite.unable.toadd'));//No I18N
			setTimeout(function(){jQuery('#errorMessageRow').fadeOut();}, 3000);
		}
}

function freezePage(freezeElementId)
{
	var freezeElement = jQuery('#' + freezeElementId);

	var oFreezeLayer = document.createElement("DIV");
	oFreezeLayer.id = "FreezeLayer";
	oFreezeLayer.className = "freezeLayer";
	oFreezeLayer.style.zIndex = "30";

	if (browser_ie) oFreezeLayer.style.height = (freezeElement.height() + (document.body.scrollHeight - document.body.offsetHeight)) + "px";
	else if (browser_nn4 || browser_nn6) oFreezeLayer.style.height = freezeElement.height() + "px";

	jQuery(oFreezeLayer).css('left', 0);//No I18N
	jQuery(oFreezeLayer).css('top', 0);//No I18N

	freezeElement.append(oFreezeLayer);
}
function addToSuiteSW(suiteSWId, createNewSuite)
{
	var param = 'operation=addtosuite';//No I18N

	var isSelected = false;
	jQuery("#selectedsoftwares option").each(
			function(idx)
			{
				param += '&softwareId=' + this.value;//No I18N
				isSelected = true;
			});

	if( isSelected )
	{
		param += "&suiteId=" + suiteSWId;//No I18N
		param += "&siteId=" + jQuery('#selectedSiteId').val();//NO I18N
		param += "&createnewsuite=" + createNewSuite;//No I18N
		freezePage('softwaredetailspage');//No I18N
		displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
		callCustomAjaxRequest('/SoftwareHome.do', param, addSuiteSoftwareFromDetailsPage, softwareHomeRequestOnFailure, suiteSWId);//NO I18N
	}
	else
	{
		showBaloonToolTip('selectedsoftwares', getMessageForKey('sdp.admin.product.type.software.choose'));//No I18N
	}
}
function showUpgradeDowngradeLicenses( licenseId )
{
	displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
	callCustomAjaxRequestForGET('/software/upgradeddowngradeddetails.jsp', 'licenseId=' + licenseId, downgradeListResponse, softwareHomeRequestOnFailure, 'showdowngradelist');//NO I18N
}

function downgradeListResponse( req, operation )
{
	showDialog(req.responseText,'closeButton=no,title=');//NO I18N
}

function showSoftwareTab(tabID)
{
	if( jQuery(tabID).parent().attr('class') != 'active' ) {
		jQuery(tabID).parent().addClass("active");
		jQuery(tabID).parent().siblings().each(function(){jQuery(this).removeClass("active");});
		jQuery("#" + tabID.id + "-content").show().siblings().hide();
	}
}

function parseScriptTag(elementId)
{
	var scrObjs = document.getElementById(elementId).getElementsByTagName("script");
	var len = scrObjs.length;
	for( i=0; i<len; i++ )
	{
		var parentScript = scrObjs[i];
		try
		{
			var newScript = document.createElement('script');
    	    if(parentScript.src)
    	    {
    	        newScript.src = parentScript.src;
    	    }
    	    if(parentScript.innerHTML){
    		    newScript.innerHTML = parentScript.innerHTML;
    	    }
    	    newScript.setAttribute('nonce', sdpNonce);
    	    document.getElementsByTagName("head")[0].appendChild(newScript);
		}
		catch(e)
		{
		}
	}
}

function clearInstallDetails()
{
	jQuery("#sw-installation-content").html('');//NO I18N
}

function clearLicenseDetails()
{
	jQuery("#sw-licenses-content").html('');//NO I18N
}

function loadTabDetails( tabID, softwareId, filterValue, filterByUpgradedFromSoftware )
{

	var siteId  = jQuery('#selectedSiteId').val();

	if( jQuery("#" + tabID.id + "-content").html() == '' )
	{
		showLoadingIcon(tabID.id);

		if( tabID.id == 'sw-licenses' )
		{
			var filterBy = '-1';//NO I18N

			if( filterValue != undefined )
			{
				filterBy = filterValue;
			}

			var upgradedFromFilter = -1;

			if( filterByUpgradedFromSoftware != undefined )
			{
				upgradedFromFilter = filterByUpgradedFromSoftware;
			}

			callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showLicenseDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId + '&licenseTypeId=' + filterBy + '&upgradedFromFilter=' + upgradedFromFilter, loadDetails, failureOnLoad, tabID.id);//NO I18N
		}
		else if( tabID.id == 'sw-installation' )
		{
			var filterBy = 'unlicensed';//NO I18N

			if( filterValue != undefined )
			{
				filterBy = filterValue;
			}
			callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showInstallationDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId + '&filterBy=' + filterBy, loadInstallDetails, failureOnLoad, filterBy);//NO I18N
		}
		else if( tabID.id == 'sw-users' )
		{
			callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showUserDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId, loadDetails, failureOnLoad, tabID.id);//NO I18N
		}
		else if( tabID.id == 'sw-history' )
		{
			callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showHistoryDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId + '&filterBy=install', loadDetails, failureOnLoad, tabID.id);//NO I18N
		}
		else if( tabID.id == 'sw-details' )
		{
			callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showSoftwareDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId, loadDetails, failureOnLoad, tabID.id);//NO I18N
		}
	}
	else
	{
		refreshNiceScroll();
	}
}

function refreshNiceScroll()
{
	jQuery(".bDiv:hidden").each( function()
	{
		jQuery(this).getNiceScroll().resize().hide();
	});

	var visibleObj = jQuery('.bDiv:visible');//NO I18N

	if( visibleObj.length > 0 )
	{
		visibleObj.each( function()
		{
			jQuery(this).niceScroll({cursorcolor:"#98AFC7"});//NO I18N
			jQuery(this).getNiceScroll().resize().show();
		});
	}
}

function showLicenseDetailsPage(softwareId, purchased, triggerAllocateTab)
{
	if( purchased > 0 || purchased == -1 )
	{
		var siteId  = jQuery('#selectedSiteId').val();

		var showAllocatedDetails = false;

		if( triggerAllocateTab != undefined )
		{
			showAllocatedDetails = true;
		}

		if( !showAllocatedDetails )
		{
			showURLInDialog('/SoftwareHome.do?operation=showCompleteLicenseDetails&softwareId=' + softwareId + '&selectedSiteId=' + siteId + '&showAllocatedDetails=' + showAllocatedDetails,'closeButton=no,title=, width=800');//NO I18N
		}
		else
		{
			showLicenseInstallationListView();
		}
	}
	else if( triggerAllocateTab != undefined )
	{
		showLicenseInstallationListView();
	}
	else
	{
		alert(getMessageForKey('sdp.swdetailspage.workstation.nolicenseavailable'));
	}
}

function showLoadingIcon(tabId)
{
	jQuery("#" + tabId + "-content").html('<table width="100%"><tr><td align="right" width="30%"><img src="/images/ajax-loader.gif" valign="middle"></td><td>&nbsp;<spab>' + getMessageForKey('sdp.common.loading') + '<span></td></tr></table>');
}

function loadInstallDetails( req, filterBy )
{
	document.getElementById("sw-installation-content").innerHTML = req.responseText;
	parseScriptTag('sw-installation-content');//NO I18N

	if( filterBy == 'licensed' )
	{
		jQuery('#allocateLicense').val(getMessageForKey('sdp.inventory.swDetail.deallocatelicense'));
	}
	else
	{
		jQuery('#allocateLicense').val(getMessageForKey('sdp.inventory.swDetail.allocLicButtonValue'));
	}
	jQuery('#installationsType').val(filterBy);
	jQuery(".bDiv:hidden").each( function()
	{
		jQuery(this).getNiceScroll().resize().hide();
	});
	updateComplianceType('NA', jQuery('#softwareId').val(), jQuery('#selectedSiteId').val());//NO I18N
}

function loadDetails( req, tabId )
{
	document.getElementById(tabId + "-content").innerHTML = req.responseText;
	parseScriptTag(tabId + '-content');//NO I18N

	/*if( jQuery('#available_companywide').length > 0 && tabId == 'sw-licenses')
	{
		showUserTabs(document.getElementById('companyWideLicenses'), -4);
	}*/

	if( purchaseLinkClicked )
	{
		showUserTabs(document.getElementById('sw-userdetails_-1'), "-1");
		purchaseLinkClicked = false;
	}
	if( companyWideLicenseLinkClicked )
	{
		try
		{
			showUserTabs(document.getElementById('companyWideLicenses'), -4);
		}
		catch(e)
		{
			showUserTabs(document.getElementById('sw-userdetails_-3'), "-1");
		}

		try
		{
			//showUserTabs(document.getElementById('sw-userdetails_-3'), "-1");
		}
		catch(e){}
		companyWideLicenseLinkClicked = false;
	}
	jQuery(".bDiv:hidden").each( function()
	{
		jQuery(this).getNiceScroll().resize().hide();
	});
	updateComplianceType('NA', jQuery('#softwareId').val(), jQuery('#selectedSiteId').val());//NO I18N
}

function failureOnLoad(req, tabId)
{
	if(tabId=='deleteSwInstallation'){
		alert(getMessageForKey('sdp.software.delete.installation.failed'));
	}
	else{
		alert(req.responseText);
	}
}

function showUserTabs(tabID, licenseTypeId)
{
	//if( licenseTypeId != -2 )
	{
		jQuery(tabID).addClass('sw-useratabact');
		jQuery(tabID).siblings().each(function(){
			jQuery(this).removeClass('sw-useratabact');
		});
		var divname= tabID.id;
		jQuery("#"+divname+"-content").show().siblings().hide();
	}
}

function showToolTipPopupMenu(refid, message)
{
	var popupid = 'sw-tooltipcont',//NO I18N
		divObj = jQuery("[id=" + popupid + "]"),//NO I18N
		jElement = jQuery("[id=" + refid.id + "]:nth(0)"),//NO I18N
		leftSection = jQuery("#Left-Section").length > 0 ? jQuery("#Left-Section").width() : 0,//NO I18N
		divBlk = jQuery("#ui-framework-design1").length > 0 ? jQuery("#ui-framework-design1").offset().top : 0,//NO I18N
		eleTop = jElement.offset().top + jElement.height() - divBlk,
		eleLeft = jElement.offset().left - leftSection;
	divObj.width(divObj.width()).css("top",eleTop + "px").css("left",eleLeft + "px").css("position","absolute").css("z-index","100").show();//NO I18N

	jQuery(document).on('click', function(event)
	{
		if (!jQuery(event.target).closest( "#"+refid.id ).length )
		{
			jQuery("#"+popupid).hide();
		}
	});

	jQuery('#helpMessage').html(message);

	jQuery("#"+popupid).on('click', function(e)
	{
		e.stopPropagation();
	});
}

function filterSoftwareBySite(listObj)
{
	jQuery('#selectedSiteId').val(listObj.value);

	loadActiveSoftwarePage();
}

function openSelect2Dropdown(urlText, elementId, defaultId, defaultText, restrictedCount)
{
	var siteId = jQuery("#site").val();

	var searchEnabled = true;

	if( restrictedCount == null || restrictedCount == undefined )
	{
		restrictedCount = 100;
	}
	/* Used this method For account based select2 in Msp */
	function returnUrl() {
		if(isMSP){
			try{
				var accountId = $('__persistentAccountId__select') ? $('__persistentAccountId__select').value : getAccountIdFromSiteAccountModel();
				var params='persistentAccountId='+accountId;//NO I18N
				if(urlText.indexOf("persistentAccountId") < 0){
				if(urlText.indexOf("?") > 0) {
					urlText=urlText+'&'+params;//NO I18N
				}
				else {
					urlText=urlText+'?'+params;//NO I18N
				}
				}
			}catch(x){}
		}

		return urlText;
	}
	jQuery("#" + elementId).select2(
	{
		placeholder: defaultText,
		formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message'); },
		ajax: {
			url: function() { return returnUrl() },
			dataType: 'jsonp',//NO I18N
			quietMillis: 500,
			data: function (term, page)
			{
				/*if(trim(term) != '')
				{
					searchEnabled = true;
				}
				else
				{
					searchEnabled = false;
				}*/
				siteId = jQuery("#site").val();
				return { searchText: term, page: page, siteId: siteId };
			},
			results: function (data, page)
			{
				if( data.length < restrictedCount && !searchEnabled )
				{
					var elementObj = jQuery("#" + elementId);

					var elementName = elementObj.attr('name');
					var elementStyle = elementObj.attr('style');
					var elementOnChange = elementObj.attr('onchange');
					var elementAllowedValue = elementObj.attr('allowedvalue');
					var elementDataType = elementObj.attr('datatype');
					var elementValue = elementObj.val();

					var selectTagObj = jQuery(document.createElement("select"));

					for( i=0; i<data.length; i++ )
					{
						selectTagObj.append('<option value="' + data[i].id + '">' + encodeHTML(data[i].text) + '</option>');
					}
					selectTagObj.attr('name', elementName);
					selectTagObj.attr('id', elementId + "_");
					selectTagObj.attr('style', elementStyle);
					selectTagObj.attr('allowedvalue', elementAllowedValue);
					selectTagObj.attr('datatype', elementDataType);
					selectTagObj.attr('onchange',elementOnChange);
					selectTagObj.val(elementValue);
					if( document.getElementById(elementId).hasAttribute("mandatory") )
					{
						selectTagObj.attr('mandatory', elementObj.attr('mandatory'));
					}

					elementObj.parent().append(jQuery(selectTagObj));

					jQuery('#' + elementId).select2("destroy");//NO I18N
					jQuery('.select2-drop-mask').remove();
					elementObj.remove();

					selectTagObj.attr('id', elementId);

					jQuery('#' + elementId).select2();
					jQuery('#' + elementId).select2("open");//NO I18N

					return {results: {}};
				}
				else
				{
					return {results: data};
				}
			},
			escapeMarkup: function (m) { return m; }
		      },
		multiple: false,
		formatSearching: function() { return getMessageForKey('ae.software.site.dropdown.search.text'); }
	});
	jQuery('#' + elementId).val(defaultId);
}

function chooseOption(listObj)
{
	jQuery(listObj).parent().find('li').each( function()
	{
		jQuery(this).removeClass('ui-dropdown-list1-cur');
	});
	jQuery(listObj).attr('class', 'ui-dropdown-list1-cur');
	jQuery(listObj).parent().parent().parent().hide();
}

function loadActiveSoftwarePage()
{
	jQuery('#tabSection a').each(function()
	{
		var tabId = jQuery(this).attr('id');
		jQuery("#" + tabId + "-content").html('');
		let ulli = jQuery(this).parent();
		if( ulli && ulli.hasClass("active") ) {
			var targetElement = jQuery(this).get(0);
            if (targetElement) {
                var clickEvent = new MouseEvent('click', { //NO I18N
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                targetElement.dispatchEvent(clickEvent);
		    }
	    }
	});
}

function updateComplianceType(overallCompliance, softwareId, siteId)
{
	if( jQuery('#isRemoteServer').val() == 'true' )
	{
		return;
	}

	if( jQuery('#overallCompliance').length > 0 && jQuery('#overallCompliance').attr('style') != null && jQuery('#overallCompliance').attr('style').indexOf('block') >= 0 )
	{
		if( siteId == -1 || overallCompliance == 'NA' ) //All sites
		{
			if( overallCompliance == 'Under Licensed' || overallCompliance == 'NA' )
			{
				callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=fetchunderlicensedsites&softwareId=' + softwareId + '&siteId=' + siteId, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'fetchunderlicensedsites');//NO I18N
			}
			else
			{
				updateCompliance(overallCompliance);
			}
		}
		else
		{
			updateCompliance(overallCompliance);
		}
	}
	else
	{
		if( siteId == -1 || overallCompliance == 'NA' ) //All sites
		{
			if( overallCompliance == 'Under Licensed' ||  overallCompliance == 'NA' )
			{
				callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=fetchunderlicensedsites&softwareId=' + softwareId + '&siteId=' + siteId, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'fetchunderlicensedsites');//NO I18N
			}
			else
			{
				jQuery('#overallCompliance').show();
				jQuery('#siteBasedCompliance').hide();
				updateCompliance(overallCompliance);
			}
		}
		else
		{
			jQuery('#overallCompliance').show();
			jQuery('#siteBasedCompliance').hide();
			updateCompliance(overallCompliance);
		}
	}
}

function updateCompliance(overallCompliance)
{
	var style = 'available';//No I18N
	if( 'Under Licensed' == overallCompliance )
	{
		style = 'site-violated';//No I18N
	}
	else if( 'Over Licensed' == overallCompliance )
	{
		style = 'over-licensed';//No I18N
	}
	jQuery('#overallCompliance span:first').attr('class', style);
	jQuery('#overallCompliance span:first').html(overallCompliance);
}

function isCheckBoxSelected( checkboxName )
{
	var isChecked = false;
	jQuery("[name='" + checkboxName + "']").each(function(){
		if( this.checked )
		{
			isChecked = true;
		}
	});
	return isChecked;
}

function licenseRefineSearch()
{
	showUserTabs(document.getElementById('sw-userdetails_-1'));
	filterByLicenseType(-1);
}

function filterByUpgradedFromSoftware(softwareId)
{
	showSoftwareTab(document.getElementById('sw-licenses'));
	clearLicenseDetails();
	loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val(), -1, softwareId);
	parent.closeDialog();

	//showUserTabs(document.getElementById('sw-userdetails_-1'));
	//filterByLicenseType(-1, softwareId);
}

function filterByLicenseType(licenseTypeId, upgradedFromSoftware, otherLicenseTypes)
{
	jQuery('#selectedLicenseTypeId').val(licenseTypeId);
	//if( licenseTypeId != -2 )//No need to filter based on others summary
	{
		var upgradedFromFilter = -1;

		if( jQuery('#refineFilter').length > 0 )
		{
			upgradedFromFilter = jQuery('#refineFilter').val();//NO I18N
		}

		if( upgradedFromSoftware != undefined && upgradedFromSoftware != null )
		{
			upgradedFromFilter = upgradedFromSoftware;
		}

		var licenseFilter = jQuery('#licenseFilter').val();//NO I18N

		if( otherLicenseTypes != null && otherLicenseTypes != undefined )
		{
			reloadListview('alllicenses', JSON.parse('{"licenseTypeId" : "' + licenseTypeId + '","softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "upgradedFromFilter" : "' + upgradedFromFilter + '", "licenseFilter" : "' + licenseFilter + '", "otherLicenseTypes" : "' + otherLicenseTypes + '"}'));//No I18N
		}
		else
		{
			reloadListview('alllicenses', JSON.parse('{"licenseTypeId" : "' + licenseTypeId + '","softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "upgradedFromFilter" : "' + upgradedFromFilter + '", "licenseFilter" : "' + licenseFilter + '"}'));//No I18N
		}
	}

	if( licenseTypeId == -5 )
	{
		//No need to show the license operation like delete, Move to site and upgraded from license details
		//if the choosen filter is downgrade license
		jQuery('#license_operation_section').hide();
		jQuery('#downgrade_message').show();
	}
	else
	{
		jQuery('#license_operation_section').show();
		jQuery('#downgrade_message').hide();
	}
}

function licenseFilters(filterBy)
{
	showUserTabs(document.getElementById('sw-userdetails_-1'));
	filterByLicenseType(-1);
}

function filterBySoftwareUsers( filterBy, softwareId )
{
	if( filterBy == 'all' || filterBy == 'licensedUser' || filterBy == 'unlicensedUser' )
	{
		jQuery('#selectedLicenseFilter').val(filterBy);
		document.getElementById('licenseFilterButton').value = jQuery('#' + filterBy).text();
	}

	filterBy += "-" + document.getElementById('selectedLicenseFilter').value;

	jQuery('#sw-licensed').hide();
	reloadListview('softwareusers', JSON.parse('{"filterBy" : "' + filterBy + '", "softwareId" : "' + softwareId + '", "selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
}

function filterByManufacturer( manufacturerObj )
{
	Store.setItem({
		key:"swlist_softwareManufacturer", // NO I18N
		value: manufacturerObj.value,
		days: 300,
		isCookie:true
	});

	var siteId = jQuery('#allsites').val();

	var consoleFilter = jQuery('#consoleFilter').val();

	var dateFilter = jQuery('#dateFilter').val();

	dateFilter = (dateFilter == undefined ? "this_week" : dateFilter);//NO I18N

	var fromDate = jQuery('#fromDate').val();//NO I18N
	var toDate = jQuery('#toDate').val();//NO I18N

	if( fromDate != undefined && toDate != undefined && fromDate != '' && toDate != '' )
	{
		dateFilter = 'custom';//NO I18N
	}
	else
	{
		fromDate = 'NA';//NO I18N
		toDate = 'NA';//NO I18N
	}

	if( (siteId != undefined && siteId > 0) || jQuery('#isRestrictedAccess').val() == 'true' )
	{
		reloadListview('softwareList', JSON.parse('{"siteId" : "' + (siteId == undefined ? -1:siteId) + '", "softwareManufacturer" : "' + manufacturerObj.value + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + (jQuery('#swComplianceType').val() == null ? -1 : 0) + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
	else
	{
		reloadListview('softwareList', JSON.parse('{"softwareManufacturer" : "' + manufacturerObj.value + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + (jQuery('#swComplianceType').val() == null ? -1 : 0) + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
}

function filterBySoftwareType( swTypeObj )
{

	Store.setItem({
		key:"swlist_swType", // NO I18N
		value: swTypeObj.value,
		days: 300,
		isCookie:true
	});

	if( jQuery('#swType option:selected').text() == 'Managed' || jQuery('#swType option:selected').val() == -1 )
	{
		jQuery('#complianceFilter').show();
	}
	else
	{
		jQuery('#complianceFilter').hide();
	}

	var siteId = jQuery('#allsites').val();

	var consoleFilter = jQuery('#consoleFilter').val();

	var dateFilter = jQuery('#dateFilter').val();

	dateFilter = (dateFilter == undefined ? "this_week" : dateFilter);//NO I18N

	var fromDate = jQuery('#fromDate').val();//NO I18N
	var toDate = jQuery('#toDate').val();//NO I18N

	if( fromDate != undefined && toDate != undefined && fromDate != '' && toDate != '' )
	{
		dateFilter = 'custom';//NO I18N
	}
	else
	{
		fromDate = 'NA';//NO I18N
		toDate = 'NA';//NO I18N
	}


	if( (siteId != undefined && siteId > 0) || jQuery('#isRestrictedAccess').val() == 'true' )
	{
		if( swTypeObj.value == -2 )
		{
			jQuery("#swType").select2("val", "0");//NO I18N
			swTypeObj.value = 0;//NO I18N
			Store.setItem({
				key:"swlist_swType", // NO I18N
				value: swTypeObj.value,
				days: 300,
				isCookie:true
			});
			alert(getMessageForKey('ae.software.listview.zeroinstall.filter'));//NO I18N
		}
		reloadListview('softwareList', JSON.parse('{"siteId" : "' + (siteId == undefined ? -1:siteId) + '", "softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + swTypeObj.value + '", "swComplianceType" : "' + jQuery('#swComplianceType').val() + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
	else
	{
		reloadListview('softwareList', JSON.parse('{"softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + swTypeObj.value + '", "swComplianceType" : "' + jQuery('#swComplianceType').val() + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
}

function filterByComplianceType( complianceTypeObj )
{
	var siteId = jQuery('#allsites').val();

	var consoleFilter = jQuery('#consoleFilter').val();

	var dateFilter = jQuery('#dateFilter').val();

	dateFilter = (dateFilter == undefined ? "this_week" : dateFilter);//NO I18N

	var fromDate = jQuery('#fromDate').val();//NO I18N
	var toDate = jQuery('#toDate').val();//NO I18N

	if( fromDate != undefined && toDate != undefined && fromDate != '' && toDate != '' )
	{
		dateFilter = 'custom';//NO I18N
	}
	else
	{
		fromDate = 'NA';//NO I18N
		toDate = 'NA';//NO I18N
	}

	Store.setItem({
		key:"swlist_swComplianceType", // NO I18N
		value: complianceTypeObj.value,
		days: 300,
		isCookie:true
	});

	if( (siteId != undefined && siteId > 0) || jQuery('#isRestrictedAccess').val() == 'true' )
	{
		siteId = (siteId == undefined ? -1 : siteId);
		reloadListview('softwareList', JSON.parse('{"siteId" : "' + siteId + '", "softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + complianceTypeObj.value + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
	else
	{
		reloadListview('softwareList', JSON.parse('{"softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + complianceTypeObj.value + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
}

function allocateSoftwareLicense(softwareId)
{
	if( jQuery('#selectedLicenseFilter').val() == 'unlicensedUser' )
	{
		if( isCheckBoxSelected('softwareusers') )
		{
			var param = '?action=view&softwareId=' + softwareId + '&selectedSiteId=' + jQuery('#selectedSiteId').val();//No I18N
			param += '&fromUserPage=true';//NO I18N
			NewWindow('/AllocateSoftwareLicense.do' + param,'addNewItem','800','520','yes','center');//No I18N
		}
		else
		{
			alert(getMessageForKey("sdp.inventory.swDetail.selWSMsg"));//No I18N
		}
	}
	else if( jQuery('#selectedLicenseFilter').val() == 'licensedUser' )
	{
		//Deallocate license from workstation list
		if( isCheckBoxSelected('softwareusers') )
		{
			if( confirm (getMessageForKey('sdp.inventory.listviewWS&SW.jsconfirm')) )
			{
				var param = 'operation=removeAllocatedLicence&softwareID=' + softwareId;//NO I18N
				jQuery("[name='softwareusers']").each(
				function(idx)
				{
					if( this.checked )
					{
						param += '&installationIds=' + this.value;//No I18N
					}
				});
				callCustomAjaxRequest('/SoftwareLicense.do', param, softwareUserLicenseDeAllocation, ajaxRequestOnFailure, 'deallocate');//NO I18N
			}
		}
		else
		{
			alert(getMessageForKey("sdp.request.config.wsselect.jserror"));//No I18N
		}
	}
	else
	{
		if( jQuery('#selectedLicenseFilter').val() == 'unlicensedUser' || jQuery('#selectedLicenseFilter').val() == 'all' )
		{
			alert(getMessageForKey('ae.software.details.users.information'));//No I18N
			filterBySoftwareUsers('unlicensedUser', softwareId);//No I18N
		}
		else if( jQuery('#selectedLicenseFilter').val() == 'licensedUser' )
		{
			alert(getMessageForKey('ae.software.details.users.deallocate.information'));//No I18N
			filterBySoftwareUsers('licensedUser', softwareId);//No I18N
		}
	}
}

function changeAllocateButtonBehaviour( aTag )
{
	if( document.getElementById('licenseAllocateButton') != undefined && document.getElementById('licenseAllocateButton') != null )
	{
		if( aTag == 'licensedUser' )
		{
			document.getElementById('licenseAllocateButton').value = getMessageForKey('sdp.inventory.swDetail.deallocatelicense');
		}
		else
		{
			document.getElementById('licenseAllocateButton').value = getMessageForKey('sdp.inventory.swDetail.allocLicButtonValue');
		}
	}
}

function allocateLicenseToWorkstation(softwareId)
{
	if( jQuery('#installationsType').val() == 'unlicensed' )
	{
		if( isCheckBoxSelected('softwareInstallations') )
		{
			var param = '?action=view&softwareId=' + softwareId + '&selectedSiteId=' + jQuery('#selectedSiteId').val();//No I18N
			param += '&fromUserPage=false';//NO I18N
			NewWindow('/AllocateSoftwareLicense.do' + param,'addNewItem','1000','520','yes','center');//No I18N
		}
		else
		{
			alert(getMessageForKey("sdp.inventory.swDetail.selWSMsg"));//No I18N
		}
	}
	else if( jQuery('#installationsType').val() == 'allinstallations' )
	{
		alert(getMessageForKey('ae.software.details.workstations.information'));//No I18N
		filterByInstallationType('unlicensed', softwareId);//No I18N
		showUserTabs(document.getElementById(jQuery('#installationsType').val()));
	}
	else if( jQuery('#installationsType').val() == 'licensed' )
	{
		//Deallocate license from workstation list
		if( isCheckBoxSelected('softwareInstallations') )
		{
			if( confirm (getMessageForKey('sdp.inventory.listviewWS&SW.jsconfirm')) )
			{
				var param = 'operation=removeAllocatedLicence&softwareID=' + jQuery('#softwareId').val();//NO I18N
				jQuery("[name='softwareInstallations']").each(
				function(idx)
				{
					if( this.checked )
					{
						param += '&installationIds=' + this.value;//No I18N
					}
				});
				callCustomAjaxRequest('/SoftwareLicense.do', param, softwareLicenseDeAllocation, ajaxRequestOnFailure, null);//NO I18N
			}
		}
		else
		{
			alert(getMessageForKey("sdp.request.config.wsselect.jserror"));//No I18N
		}
	}
}

function validateSelectLicenses(isFromSoftwareUserPage)
{
	if( isCheckBoxSelected('availableLicenses') )
	{
		var param = 'action=allocateLicense&softwareId=' + jQuery('#softwareId').val() + '&siteId=' + jQuery('#selectedSiteId').val() + '&allocateOption=available';//No I18N

		jQuery("[name='availableLicenses']").each(function(){
			if( this.checked )
			{
				param += '&licenseId=' + this.value;//No I18N
			}
		});

		var isWorkstationSelected = false;

		if( isFromSoftwareUserPage == 'true' )
		{
			window.opener.jQuery("[name='softwareusers']").each(function()
			{
				if( this.checked )
				{
					param += '&wsId=' + this.value;//No I18N
					isWorkstationSelected = true;
				}
			});
		}
		else
		{
			window.opener.jQuery("[name='softwareInstallations']").each(function()
			{
				if( this.checked )
				{
					isWorkstationSelected = true;
					param += '&wsId=' + this.value;//No I18N
				}
			});
		}

		if( isWorkstationSelected )
		{
			callCustomAjaxRequest('/AllocateSoftwareLicense.do', param, allocateLicenseOnSuccess, ajaxRequestOnFailure, isFromSoftwareUserPage);//NO I18N
		}
		else
		{
			alert(getMessageForKey('sdp.inventory.swDetail.selWSMsg'));
		}
	}
	else
	{
		alert(getMessageForKey("sdp.inventory.allocateswlicence.jserror"));//No I18N
	}
}
function allocateLicenseOnSuccess(req, isFromSoftwareUserPage)
{
	var xmlDoc = req.responseXML;

	if( xmlDoc.getElementsByTagName('statuscode')[0].firstChild.nodeValue == 200 || xmlDoc.getElementsByTagName('statuscode')[0].firstChild.nodeValue == 201 )
	{
		if( xmlDoc.getElementsByTagName('statuscode')[0].firstChild.nodeValue == 200 )
		{
			jQuery('#successMessage').text(xmlDoc.getElementsByTagName('message')[0].firstChild.nodeValue);//No I18N
			jQuery('#successMessageRow').show();//No I18N

			setTimeout(function(){jQuery('#successMessageRow').hide();}, 3000);
		}
		else
		{
		    var message = xmlDoc.getElementsByTagName('message')[0].firstChild.nodeValue;
			jQuery('#errorMessage').html(encodeHTML(message) + '<table class="failurebox" width="90%" border="0"><tr><td><strong>' + getMessageForKey('sdp.swdetailspage.license.notallocated.cause') + ' </strong></td></tr> <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact1') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact2') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact3') +'</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;4.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact4') + '</td></tr></table>');//NO I18N
			jQuery('#errorMessageRow').show();//No I18N
		}

		try
		{
			if( jQuery('#showDowngradeLicenseDetails').is(':checked') )
			{
				reloadListview('availableLicenses', JSON.parse('{"softwareId" : "' + jQuery('#softwareId').val() + '", "selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "fetchDowngradedLicenses" : "true"}'));//No I18N
			}
			else
			{
				reloadListview('availableLicenses', JSON.parse('{"softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
			}
		}
		catch(e)
		{
		}

		window.opener.jQuery("#sw-users-content").html('');//No I18N
		window.opener.jQuery("#sw-installation-content").html('');//No I18N
		window.opener.jQuery("#sw-details-content").html('');//No I18N
		window.opener.jQuery("#sw-licenses-content").html('');//No I18N

		if( isFromSoftwareUserPage == 'true' )
		{
			if( jQuery("#sw-licenses").length > 0 && jQuery("#sw-licenses").attr('class').indexOf('active') >= 0 )
			{
				window.opener.loadTabDetails(window.opener.document.getElementById('sw-licenses'), jQuery('#softwareId').val());
			}
			else
			{
				window.opener.loadTabDetails(window.opener.document.getElementById('sw-users'), jQuery('#softwareId').val());
			}
		}
		else
		{
			window.opener.loadTabDetails(window.opener.document.getElementById('sw-installation'), jQuery('#softwareId').val());
		}
	}
	else
	{
		jQuery('#errorMessage').text(xmlDoc.getElementsByTagName('message')[0].firstChild.nodeValue);//No I18N
		jQuery('#errorMessageRow').show();//No I18N
	}
}

function sendMailToSoftwareUser( softwareId )
{
	var viewName = 'softwareInstallations';//NO I18N

	if( jQuery('#sw-users').attr('class') == 'ui-tabs1-active' )
	{
		viewName = 'softwareusers';//NO I18N
	}

	var param = '';

	if( !isCheckBoxSelected(viewName) && !confirm(getMessageForKey('ae.software.send.mailto.software.users.message')) )
	{
		return;
	}

	if( jQuery('#sw-users').attr('class') != 'ui-tabs1-active' )
	{
		//get the workstation id(s) from software detail's page installation listview
		jQuery("[name='softwareInstallations']").each(
		function(idx)
		{
			if( this.checked )
			{
				param += '&wsId=' + this.value;//No I18N
			}
		});
	}
	else
	{
		//get the workstation id(s) from software detail's page user listview
		jQuery("[name='softwareusers']").each(
		function(idx)
		{
			if( this.checked )
			{
				param += '&wsId=' + this.value;//No I18N
			}
		});
	}

	NewWindow('/NotifySWUsers.do?action=view&swId=' + softwareId + param,'Notifytousers','650','450','yes','center');//No I18N
}

function forwardToMailServerPage()
{
	window.opener.document.location = '/SetUpWizard.do?forwardTo=email';
	window.close();
}

function fetchHistoryDetails(filterBy)
{
	jQuery('#filterBy').val(filterBy);
	var dateFilter = jQuery('#dateFilter').val();
	reloadListview('softwareHistory', JSON.parse('{"dateFilter" : "' + dateFilter + '","filterBy" : "' + filterBy + '","softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
}

function searchSoftwareHistoryByDate()
{
	var fromDate = jQuery('#fromDate').val();
	var toDate = jQuery('#toDate').val();

	if( fromDate != '' && toDate != '' )
	{
		var filterBy = jQuery('#filterBy').val();
		reloadListview('softwareHistory', JSON.parse('{"filterBy" : "' + filterBy + '","softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '"}'));//No I18N
	}
	else if( fromDate == '' )
	{
		showBaloonToolTip('fromDate', getMessageForKey('sdp.common.datechooser'));//No I18N
	}
	else if( toDate == '' )
	{
		showBaloonToolTip('toDate', getMessageForKey('sdp.common.datechooser'));//No I18N
	}
}

function filterHistoryByDate(selectTag)
{
	var filterBy = jQuery('#filterBy').val();
	reloadListview('softwareHistory', JSON.parse('{"dateFilter" : "' + selectTag.value + '","filterBy" : "' + filterBy + '","softwareId" : "' + jQuery('#softwareId').val() + '","selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
}

function filterByInstallationType( filterBy, softwareId )
{
	if( filterBy != 'allinstallations' )
	{
		jQuery('#allocateButton').show();
	}
	else
	{
		jQuery('#allocateButton').hide();
	}

	if( filterBy == 'licensed' )
	{
		jQuery('#allocateLicense').val(getMessageForKey('sdp.inventory.swDetail.deallocatelicense'));
		//jQuery('#autoallocatebutton').hide();
	}
	else
	{
		jQuery('#allocateLicense').val(getMessageForKey('sdp.inventory.swDetail.allocLicButtonValue'));
		//jQuery('#autoallocatebutton').show();
	}
	jQuery('#installationsType').val(filterBy);
	reloadListview('softwareInstallations', JSON.parse('{"filterBy" : "' + filterBy + '", "softwareId" : "' + softwareId + '", "selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
}

function updateAttachFileList( fileId, fileName, fileSize, showLink, moduleUrl , module , entityId , attachmentAccessUserId)
{
	jQuery('#statusMessageRow').hide();
	jQuery('#noattachedfile').addClass("hide");

	var newObj = document.getElementById('attachedfiles').cloneNode(true);
	jQuery(newObj).show();
	jQuery(newObj).attr('id', fileId);

	jQuery(newObj).find('img').each(function()
	{
		if( showLink )
		{
			jQuery(this).on("click", function() { deleteAttachedFile(fileId, moduleUrl , module ); });//No I18N
		}
		else
		{
			jQuery(this).hide();
		}
	});
	jQuery(newObj).find('a').each(function()
	{
		moduleUrl = moduleUrl.replace("?task=uploadFile", "");
		if(module=="software")
		{
			jQuery(this).attr('href', moduleUrl + '?task=fileDownloader&module=software&attachKey=' + fileId);//NO I18N
		}
		else
		{
			jQuery(this).attr('href', moduleUrl + '?task=fileDownloader&attachKey=' + fileId);//NO I18N
		}
		jQuery(this).text(fileName)
	});
	jQuery(newObj).find('span').each(function()
	{
		jQuery(this).text(fileSize)
	});

	jQuery('#attachedfilesrow').append(newObj);
}

function deleteAttachedFile( attachKey, moduleUrl , module )
{
	if( confirm(getMessageForKey("sdp.inventory.ws.attachdelete.alert")) )
	{
		callCustomAjaxRequest(moduleUrl, 'task=fileDelete&attachKey=' + attachKey+'&module='+module, attachmentDeleteOnSuccess, attachmentDeleteOnFailure, attachKey);//NO I18N
	}
}

function attachmentDeleteOnSuccess( req, attachKey )
{
	if( jQuery('#' + attachKey).parent().children().length == 2 )
	{
		jQuery('#noattachedfile').removeClass("hide");
	}
	jQuery('#' + attachKey).remove();
}

function attachmentDeleteOnFailure( req, operation )
{
	alert(res.responseText);
}

function showMore(showChar)
{
	//var showChar = 100;
	var ellipsestext = "...";
	var moretext = getMessageForKey("sdp.home.more");
	var lesstext = getMessageForKey("sdp.common.less");

	jQuery('.more').each(function()
	{
		var content = decodeHTML(jQuery(this).html());//.replace( new RegExp( "&lt;" , 'g' ) , "<" ).replace( new RegExp( "&gt;" , 'g' ) , ">" ).replace(new RegExp("&amp;",'g'),"&");

		if(content.length > showChar)
		{

			var c = content.substr(0, showChar);
			var h = content.substr(showChar, content.length - showChar);

			var html = '<span class="ui-formfield">' + encodeHTML(c).replace('&#xa;', '<br>') + //NO I18N
			'</span><span class="ui-formfield moreelipses">' + ellipsestext + //NO I18N
			'</span>&nbsp;<span class="morecontent"><span class="hide">' + //NO I18N
			encodeHTML(h).replace('&#xa;', '<br>') + //NO I18N
			'</span>&nbsp;&nbsp;<a href="/" class="morelink linkblueuntxt" id="showmorelinl">' + moretext + '</a></span>'; //NO I18N

			jQuery(this).html(html).removeClass("hide");

			jQuery(document).on('click', '.morelink', function(event) {
				event.preventDefault();
				onMoreLinkClicked(jQuery(this), moretext, lesstext);
			});
		}
		else
		{
			content = encodeHTML(content);

			if( content != null )
			{
				jQuery(this).html(content).removeClass("hide");
			}
		}

	});
}

function onMoreLinkClicked(morelink,moretext,lesstext)
{
	if(jQuery(morelink).hasClass("less"))
	{
		jQuery(morelink).removeClass("less");
		jQuery(morelink).html(moretext);
		jQuery(morelink).prev().addClass('hide');
		jQuery(morelink).prev().attr('style', 'display:none');
	}
	else
	{
		jQuery(morelink).addClass("less");
		jQuery(morelink).html(lesstext);
		jQuery(morelink).prev().removeClass('hide');
		jQuery(morelink).prev().attr('style', 'display:inline');
	}
	jQuery(morelink).parent().prev().toggle();
	return false;
}

function editSoftwareDetails(softwareId)
{
	showURLInDialog('/SoftwareHome.do?operation=editSoftwareDetails&softwareId=' + softwareId,'closeButton=no,title=, width=750');//NO I18N
}

function saveSoftwareDetails( softwareId, isSuiteFamily )
{
	var param = '';

	var isSoftwareTypeChanged = false;

	if( jQuery('#softwareCategoryId').val() != jQuery('#softwareCategoryId').attr('selectedValue') )
	{
		param += '&softwareCategoryId=' + jQuery('#softwareCategoryId').val();//No I18N
		jQuery('#softwareCategoryId').attr('selectedValue', jQuery('#softwareCategoryId').val());//No I18N
	}
	if( jQuery('#softwareManufacturerId').val() != jQuery('#softwareManufacturerId').attr('selectedValue') )
	{
		param += '&softwareManufacturerId=' + jQuery('#softwareManufacturerId').val();//No I18N
		jQuery('#softwareManufacturerId').attr('selectedValue', jQuery('#softwareManufacturerId').val());//No I18N
	}
	if( jQuery('#softwareTypeId').val() != jQuery('#softwareTypeId').attr('selectedValue') )
	{
		param += '&softwareTypeId=' + jQuery('#softwareTypeId').val();//No I18N
		jQuery('#softwareTypeId').attr('selectedValue', jQuery('#softwareTypeId').val());//No I18N
		isSoftwareTypeChanged = true;

		if( jQuery('#softwareType').val() == 'Managed' && jQuery('#softwareTypeId option:selected').text() != jQuery('#softwareType').val() )
		{
			if( isSuiteFamily )
			{
				alert(getMessageForKey('ae.software.suite.change.type.notallowed'));//NO I18N
				jQuery('#softwareTypeId').val(2);
				return false;
			}

			if (!confirm(getMessageForKey('sdp.software.type.bulk.move.confirmation').replace('{0}', jQuery('#softwareTypeId option:selected').text())))
			{
				return false;
			}
		}
	}
	if( jQuery('#description').val() != jQuery('#description').attr('selectedValue') )
	{
		param += '&description=' + jQuery('#description').val();//No I18N
		jQuery('#description').attr('selectedValue', jQuery('#description').val());//No I18N
	}
	if(jQuery('#cost').length != 0){//No I18N
		var cost = jQuery('#cost').val().trim();//No I18N
		if( cost != jQuery('#cost').attr('selectedValue') )//No I18N
		{
			 var anum=/(^\d+$)|(^\d+\.\d+$)/;
	          if(!anum.test(cost)){
				 //jQuery('#cost').trigger('focus');//No I18N
			 alert(getMessageForKey("sdp.inventory.detailAsset.invalidCostMsg"));//No I18Ns
				 return false;
			 }
			param += '&cost=' + cost;//No I18N
			jQuery('#cost').attr('selectedValue', cost);//No I18N
		}
	}
	var images = "";//No I18N
	var softwareImages = uploadImageSlider.getImagesList();
	var selectedImages = [];
	if(jQuery("#imageList").length != 0){
	selectedImages = jQuery("#imageList").attr("selectedValue").split(",");//No I18N
	if(selectedImages.length==1 && "" == selectedImages[0]){
		selectedImages=[];
	}

	if(softwareImages.length>0){
		for(index=0;index<softwareImages.length;index++){
    		images=images+"&images="+softwareImages[index];//NO I18N
		}
    	param += images;
	}
	else if(softwareImages.length==0 && selectedImages.length>0) {
		images='&images=';//No I18N
		param += images;
	}
}
	if( param != '' )
	{
		jQuery('#processing').removeClass('hide');//No I18N
		jQuery('#saving').addClass('hide');//No I18N
		param = 'operation=saveSoftwareDetails&softwareId=' + softwareId + param;//No I18N

		callCustomAjaxRequest('/SoftwareHome.do', param, softwareUpdateOnSuccess, softwareUpdateOnFailure, isSoftwareTypeChanged);//NO I18N
	}
	else
	{
		parent.closeDialog();
	}
}

function softwareUpdateOnSuccess(req, isSoftwareTypeChanged)
{
	if(req.responseText == 'success')
	{
		jQuery('#processing').addClass('hide');
		jQuery('#onsuccess').removeClass('hide');

		if( !isSoftwareTypeChanged )
		{
			setTimeout(function(){jQuery('#onsuccess').addClass('hide');jQuery('#saving').removeClass('hide');}, 3000);

			if( jQuery('#sw-details').attr('class') === 'ui-tabs1-active' )
			{
				callCustomAjaxRequestForGET('/SoftwareHome.do', 'operation=showSoftwareDetails&softwareId=' + jQuery('#softwareId').val() + '&selectedSiteId=' + jQuery('#selectedSiteId').val(), loadDetails, failureOnLoad, 'sw-details');//NO I18N
			}
			else
			{
				//jQuery("#sw-details-content").html('');//No I18N
				document.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#softwareId').val());
			}
		}
		else
		{
			document.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#softwareId').val());
		}
	}
	else
	{
		softwareUpdateOnFailure(req);
	}
}

function softwareUpdateOnFailure(req)
{
	jQuery('#processing').addClass('hide');
	jQuery('#onfailure').removeClass('hide');
	jQuery('#onfailuremsg').html(req.responseText);
	setTimeout(function(){jQuery('#onfailure').addClass('hide');jQuery('#saving').removeClass('hide');}, 5000);
}

function showSiteBasedCompliance( softwareId, siteFilter, spanTag )
{
	displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n

	if( jQuery(jQuery(spanTag).children().get(0)).text() != '0' )
	{
		showURLInDialog('/SoftwareHome.do?operation=showsitebasedcompliance&softwareId=' + softwareId + '&siteFilter=' + siteFilter,'closeButton=no,title=,width=700');//NO I18N
	}
}

function filterBySite(siteId, siteName)
{
	if( jQuery("#usersites").length > 0 )
	{
		jQuery("#usersites").val(siteId);
		jQuery('#usersites').trigger('change');
		jQuery(jQuery('.select2-choice').children().get(0)).text(siteName)
	}
	else
	{
		document.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#softwareId').val()) + '&selectedSite=' + encodeURIComponent(siteId);//NO I18N
	}
}

function showSuiteInstallationPage(softwareId)
{
	var siteId  = jQuery('#selectedSiteId').val();
	NewWindow('/SoftwareHome.do?operation=showSuiteInstallations&softwareId=' + softwareId + '&siteId=' + siteId,'Change_Software_Type','800','430','yes','center')
}

function openSuiteSoftwaresPage(softwareId, createNewSuite)
{
	var siteId  = jQuery('#selectedSiteId').val();

	showURLInDialog('/software/showsuitesoftwares.jsp?swId=' + softwareId + '&siteId=' + siteId + '&createnewsuite=' + createNewSuite + '&date=' + new Date().getMilliseconds(),'closeButton=no,position=relative,width=780');//NO I18N
}

function openInstallationPage(softwareId)
{
	var siteId = jQuery('#selectedSiteId').val();//NO I18N

	if( jQuery('#usersites').length > 0 )
	{
		siteId = jQuery('#usersites').val();//NO I18N
		Store.setItem({
			key:"swlist_siteId", // NO I18N
			value: siteId,
			days: 300,
			isCookie:true
		});
	}
	showURLInDialog('/software/addsoftwareinstallation.jsp?softwareId=' + softwareId + '&siteId=' + siteId, 'closeButton=no,title=');//NO I18n
}

function deleteInstallationPage(swId)
{
	showalert('info', getMessageForKey('sdp.admin.common.deleting'), 'isAutoHide=true,delay=3,width=auto')         //No I18N
	var viewName = 'softwareInstallations';//NO I18N
	if(!isCheckBoxSelected(viewName))
	{
		alert(getMessageForKey('sdp.request.config.wsselect.jserror'));
		return;
	}
	var param = 'action=deleteSwInstallation&swId=' + swId;  //NO I18N
	param += '&wsIds=';    //No i18n
	jQuery("[name='softwareInstallations']").each(
		function(idx)
		{
			if( this.checked )
			{
				param += this.value + ",";//No I18N
			}
		});

	param = param.slice(0,-1);
	/*var result = jQuery.ajax({
		type : "GET", //NO I18N
		url : "/servlet/AJaxServlet" + param, //NO I18N
		async : false
	}).responseText;
	if(result != "null" && result === "true")
	{
		document.location = '/SWWorkstationListView.do?criteria=' + jQuery('#softwareId').val();
	}
	else
	{
		alert(getMessageForKey('sdp.software.delete.installation.failed'));
	}*/
	callCustomAjaxRequest('/servlet/AJaxServlet', param, loadSWInstallationDetails, failureOnLoad, 'deleteSwInstallation');//NO I18N
}
function loadSWInstallationDetails(req,module){
	if(req.responseText.indexOf('failed') >= 0)
    {
        alert(req.responseText); //The response text contains a static I18n key (AjaxServlet Line 463)
    }
    else {
    	document.location = '/SWWorkstationListView.do?criteria=' + encodeURIComponent(jQuery('#softwareId').val());
    }
}
function addWorkstationsToSoftware( softwareId )
{
	if( isCheckBoxSelected('workstationList') )
	{
		var param = 'operation=addsoftwareinstallation&softwareId=' +softwareId;//NO I18N
		jQuery("[name='workstationList']").each(function(){
			if( this.checked )
			{
				param += '&workstationId=' + this.value;//No I18N
			}
		});

		jQuery('#saving').addClass("hide");//NO I18N
		jQuery('#processing').removeClass("hide");//NO I18N

		callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'addsoftwareinstallation');//NO I18N
	}
	else
	{
		alert(getMessageForKey('sdp.request.config.wsselect.jserror'));
	}
}
function changeSoftwareType()
{
	if( jQuery("#moveSwType").length > 0 && jQuery("#moveSwType").val() == '-1' )
	{
		return false;
	}

	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.inventory.software.listView.moveSWMsg"));
		jQuery("#moveSwType").select2("val", "-1");//NO I18N
		return false;
	}
	else
	{
		var swType = jQuery('#swType option:selected').text();
		var selectedType = jQuery('#moveSwType option:selected').text();
		var swTypeId = jQuery('#moveSwType option:selected').val();

		if(swType == 'Managed')
		{
			if(!confirm(getMessageForKey('sdp.software.type.bulk.move.confirmation').replace('{0}', selectedType)))
			{
				jQuery('#moveSwType').select2('val', -1);//NO I18N
				return false;
			}
		}
		else if(swTypeId == 0 && selectedType != 'Managed')
		{
			if(!confirm(getMessageForKey('sdp.software.type.bulk.move.confirmation1')))
			{
				jQuery('#moveSwType').select2('val', -1);//NO I18N
				return false;
			}
		}
		else
		{
			if(!confirm(getMessageForKey('sdp.software.type.bulk.move.confirmation2').replace('{0}', selectedType)))
			{
				jQuery('#moveSwType').select2('val', -1);//NO I18N
				return false;
			}
		}
		var param = 'operation=changeSWType&swTypeId=' + swTypeId;//NO I18N

		jQuery("[name='softwareList']").each(function(){
			if( this.checked )
			{
				param += '&softwareId=' + this.value;//No I18N
			}
		});

		displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
		callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'changeSWType');//NO I18N
	}
}

function reloadSoftwareListView()
{
	var siteId = jQuery('#allsites').val();

	if( siteId != undefined && siteId > 0 )
	{
		reloadListview('softwareList', JSON.parse('{"siteId" : "' + siteId + '", "softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + jQuery('#swComplianceType').val() + '"}'));//No I18N
	}
	else
	{
		reloadListview('softwareList', JSON.parse('{"softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + jQuery('#swComplianceType').val() + '"}'));//No I18N
	}
}

function filterSoftwareListBySite( siteObj )
{
	try
	{
		Store.setItem({
			key:"swlist_siteId", // NO I18N
			value: siteObj.value,
			isCookie:true
		});
		var consoleFilter = jQuery('#consoleFilter').val();

		var dateFilter = jQuery('#dateFilter').val();

		dateFilter = (dateFilter == undefined ? "this_week" : dateFilter);//NO I18N

		var fromDate = jQuery('#fromDate').val();//NO I18N
		var toDate = jQuery('#toDate').val();//NO I18N

		if( fromDate != undefined && toDate != undefined && fromDate != '' && toDate != '' )
		{
			dateFilter = 'custom';//NO I18N
		}
		else
		{
			fromDate = 'NA';//NO I18N
			toDate = 'NA';//NO I18N
		}

		if( siteObj.value > 0 )
		{
			if( jQuery('#swType').val() == '-2' )
			{
				siteObj.value = '-1';//NO I18N
				Store.setItem({
					key:"swlist_siteId", // NO I18N
					value: siteObj.value,
					isCookie:true
				});
				jQuery('#' + siteObj.id).select2('val', '-1');//NO I18N
				alert(getMessageForKey('ae.software.listview.zeroinstall.filter'));
			}
		}

		reloadListview('softwareList', JSON.parse('{"siteId" : "' + siteObj.value + '", "softwareManufacturer" : "' + jQuery('#softwareManufacturer').val() + '", "swType" : "' + jQuery('#swType').val() + '", "swComplianceType" : "' + (jQuery('#swComplianceType').val() == null ? -1 : 0) + '", "consoleFilter" : "' + (consoleFilter == undefined ? "NA":consoleFilter) + '", "dateFilter" : "' + dateFilter + '", "fromDate" : "' + fromDate + '", "toDate" : "' + toDate + '", "searchText" : "' + searchText + '"}'));//No I18N
	}
	catch(e)
	{
		alert(e.message);
	}
	//siteObj.form.trigger('submit');
}

function deleteSoftwares()
{
	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.inventory.software.listView.selectSWMsg"));
	}
	else
	{
		if(confirm(getMessageForKey("sdp.inventory.software.listView.confirmDeleteMsg")))
		{
			var param = 'operation=deleteSoftwares';//NO I18N

			jQuery("[name='softwareList']").each(function()
			{
				if( this.checked )
				{
					param += '&softwareId=' + this.value;//No I18N
				}
			});

			displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.file.delete.progress.msg'), false);//NO I18n
			callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'deleteSoftwares');//NO I18N
			return true;
		}
		else
		{
			return false;
		}
	}
	return false;
}

function showSoftwareDetailsPage(softwareId, isCompliancePendingSW)
{
	if( isCompliancePendingSW )
	{
		jQuery("#freeze_softwarelist").removeClass('hide');
	}
	document.location = '/SWWorkstationListView.do?criteria=' + softwareId + '&selectedSite=' + (jQuery('#allsites').val() == undefined ? -1 : jQuery('#allsites').val());
}

function preLoadSoftwareList(softwareManufacturer, site, swType, swComplianceType)
{
	jQuery('#moveSwType').select2();//NO I18N
	//jQuery('#moveSwType').select2('val',2);//NO I18N

  if (softwareManufacturer !=-1)
  {
    softwareManufacturer = encodeHTML(softwareManufacturer);
  }

  if (site !=-1)
  {
    site = encodeHTML(site);
  }

  if (swType !=-1)
  {
    swType = encodeHTML(swType);
  }

  if (swComplianceType !=-1)
  {
    swComplianceType = encodeHTML(swComplianceType);
  }

	if( softwareManufacturer == null )
	{
		if( Store.getCookie('swlist_softwareManufacturer') != null )
		{
			jQuery('#softwareManufacturer').select2('val', Store.getCookie('swlist_softwareManufacturer'));//NO I18N
		}

	}
	else if( softwareManufacturer == -1 )
	{
		jQuery('#softwareManufacturer').select2('val', '-1');//NO I18N
	}
	else
	{
		jQuery('#softwareManufacturer').select2('val', softwareManufacturer);//NO I18N
		Store.setItem({
			key:"swlist_softwareManufacturer", // NO I18N
			value: softwareManufacturer,
			days: 300,
			isCookie:true
		});
	}
	if( site != null && jQuery('#allsites').length > 0 )
	{
		jQuery('#allsites').select2('val', site);//NO I18N
		Store.setItem({
			key:"swlist_siteId", // NO I18N
			value: site,
			days: 300,
			isCookie:true
		});
	}
	else if( Store.getCookie('swlist_siteId') != null && jQuery('#allsites').length > 0 )
	{
		jQuery('#allsites').select2('val', Store.getCookie('swlist_siteId'));//NO I18N
	}

	if(  jQuery('#swType').length > 0 )
	{
		if( swType != null )
		{
			jQuery('#swType').select2('val', swType);//NO I18N
			Store.setItem({
				key:"swlist_swType", // NO I18N
				value: swType,
				days: 300,
				isCookie:true
			});
		}
		else if( Store.getCookie('swlist_swType') != null )
		{
			jQuery('#swType').select2('val', Store.getCookie('swlist_swType'));//NO I18N
		}
		if( jQuery('#swType option:selected').text() == 'Managed' )
		{
			jQuery('#complianceFilter').show();//NO I18N
		}
	}

	if( jQuery('#swComplianceType').length > 0 )
	{
		if( swComplianceType != null )
		{
			jQuery('#swComplianceType').select2('val', swComplianceType);//NO I18N
			Store.setItem({
				key:"swlist_swComplianceType", // NO I18N
				value: swComplianceType,
				days: 300,
				isCookie:true
			});
		}
		else if(Store.getCookie('swlist_swComplianceType') != null )
		{
			if( Store.getCookie('swlist_swType') != null && Store.getCookie('swlist_swType') > 0 )
			{
				jQuery('#swComplianceType').select2('val', Store.getCookie('swlist_swComplianceType'));//NO I18N
			}
			else
			{
				jQuery('#swComplianceType').select2('val', 0);//NO I18N
				Store.setItem({
					key:"swlist_swComplianceType", // NO I18N
					value: 0,
					days: 300,
					isCookie:true
				});
			}
		}
	}
}
function changeSoftwareCategory()
{
	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.inventory.software.selcat"));
	}
	else
	{
		showURLInDialog('ChangeSWCategory.do?changeSWCatg=true','position=relative,closeButton=no, width=300');//NO I18N
	}
}

function updateSoftwareCategory()
{
	var swCategory = jQuery('#swCategory').val();

	if (swCategory == '0')
	{
		alert(getMessageForKey("sdp.inventory.software.softwarejserror"));
		return false;
	}

	var param = 'operation=changeCategory&softwareCategoryId=' + swCategory;//NO I18N

	jQuery("[name='softwareList']").each(function()
	{
		if( this.checked )
		{
			param += '&softwareId=' + this.value;//No I18N
		}
	});
	parent.closeDialog();

	displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
	callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'changeCategory');//NO I18N
}

/*
 * Function included for ListViewSW.jsp, if "change Manufacturer" clicked then ChangeSWManufacturer.jsp page with drop down opens for selecting SWs.
 */
function confirmChangeManufacturer()
{
	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.inventory.software.selcat"));
	}
	else
	{
		showURLInDialog('ChangeSWManufacturer.do?changeSWManu=true','closeButton=no')  //No I18N
	}
}

/*
 * function included for validating changemanufacturer.jsp, if Manufacturer not selected, Dialogue box does not close
 */
function validateManufacturer()
{
	var swManufacturer = jQuery('#swManufacturer').val();

	if (swManufacturer == '0' || swManufacturer == '-1' )
	{
		alert(getMessageForKey("sdp.inventory.software.chooseManufacturer"));
		return false;
	}
	var param = 'operation=updateswmanufacturer&softwareManufacturerId=' + swManufacturer;//NO I18N

	jQuery("[name='softwareList']").each(function()
	{
		if( this.checked )
		{
			param += '&softwareId=' + this.value;//No I18N
		}
	});
	parent.closeDialog();

	displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n
	callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'changeManufacturer');//NO I18N
}

function addToSuite(manufacturerId)
{
	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.inventory.software.selcat"));
	}
	else
	{
		showURLInDialog('/software/addtosuitesoftware.jsp?manufacturerId=' + manufacturerId + '&date=' + new Date().getMilliseconds(),'closeButton=no,position=absolute,width=550,left=550,top=150');//No I18N
	}
}
function checkManufacturer()
{
	if( jQuery("[id='softwareManufacturer']").val() != '-1' )
	{
		addToSuite(jQuery('#softwareManufacturer').val());
	}
	else
	{
		var url = '/servlet/AJaxServlet?action=doesSwHaveSameMfg&softwareId='; //NO I18N
		jQuery("[name='softwareList']").each(function()
		{
			if( this.checked )
			{
				url += this.value + ','; //NO I18N
			}
		});
		var result = jQuery.ajax({
			type : "GET", //NO I18N
			url : url,
			async : false
		}).responseText;
		if(result != "null")
		{
			addToSuite(result);
		}
		else
		{
			alert(getMessageForKey('sdp.admin.software.licensetype.choosesamemfg'));//No I18N
		}
	}
}
function addNewSoftware(isSuite)
{
	if( isSuite )
	{
        	document.location = '/SoftwareListViewAction.do?add=New&isSuite=true&softwareId=-1';//NO I18N
	}
	else
	{
        	document.location = '/SoftwareListViewAction.do?add=New&softwareId=-1';//NO I18N
	}
}

function swtabschange(a, aa)
{
	for (i=1;i<=2;i++)
	{
		document.getElementById("sw-tabdetails"+i).style.display="none";
		document.getElementById("tab"+i).className="inactivetab";
	}
	document.getElementById(a).style.display="block";
	document.getElementById(aa).className="activetab";
	return true;
}

function updatePurchasedLicenseId(rowObj, licenseId, licenseKey, rowIndex, poLotId, acquisitionDate, expiryDate, isLicenseAllocated, installationsAllowed, allocated)
{
	if( jQuery('#quantity_' + poLotId).length > 0 )
	{
		/*if( jQuery('#quantity_' + poLotId).val() < installationsAllowed )
		{
			alert(getMessageForKey("ae.purchase.software.receiveitems.installationsallowed.validation.msg"));//NO I18N
			return false;
		}
		else*/

		if( parseInt(jQuery('#quantity_' + poLotId).val()) > rowIndex )
		{
			jQuery('#rowIndex_' + poLotId + '_' + (rowIndex + 1)).removeClass('hide');//NO I18N
		}
	}

	var selectedOption = jQuery('input[name=typeOfLicense_' + poLotId + '_' + rowIndex + ']:checked').val();

	if( jQuery('#oldLicense').length > 0 )
	{
		//Called from add new software license page
		jQuery('#swlicenses tr').each(function()
		{
			if(jQuery(this).attr('class') == 'rowHiliten')
			{
				jQuery(this).removeClass('rowHiliten');
			}
		});

		jQuery(rowObj).addClass('rowHiliten');

		jQuery('input[id="oldLicense"]').val(licenseKey);
		jQuery('input[id="alreadyPurchasedLicense"]').val(licenseId);


		//Remove all the license row except the last one
		var $selectTags = jQuery('select[name^="software_"]');
		var size = $selectTags.length;
		var count = 1;
		var lastRowObject = null;

		$selectTags.each(function()
		{
			if( count < size )
			{
				jQuery('#' + this.id).parent().parent().remove()
			}
			else
			{
				lastRowObject = this;
			}
			count++;
		});

		if( lastRowObject != null )
		{
			var rowIndex = lastRowObject.name.split('_')[1];

			if( rowIndex != 0 )
			{
				jQuery('#licenseId_' + rowIndex).val(licenseId);
				jQuery('#licenseKey_' + rowIndex).val(licenseKey);
				jQuery('#software_' + rowIndex).val(jQuery('#licensedSoftware').val());

				addNewLicenseRow(document.getElementById('license_' + rowIndex));

				jQuery('#software_' + rowIndex).prop('disabled', true); //NO I18N
				jQuery('#licenseKey_' + rowIndex).prop('disabled', true); //NO I18N
				jQuery('#addLicenseImg_' + rowIndex).off('click');//NO I18N

				if( isLicenseAllocated )
				{
					jQuery('#addLicenseImg_' + rowIndex).on('click', function(){alert(getMessageForKey('ae.software.license.edit..cannot.removeLicense'));});//NO I18N
				}
				else
				{
					jQuery('#addLicenseImg_' + rowIndex).on('click', function(){removeAllDowngradeLicenses();});
				}

				fetchDowngradeLicenses(licenseId, rowIndex);
			}
		}
	}
	else
	{
		//Called from purchased order receive page
		var $selectTags = null;

		if( selectedOption == 'upgrade' )
		{
			$selectTags = jQuery('input[id^="alreadyPurchased_' + poLotId + '_"]');
		}
		else
		{
			$selectTags = jQuery('input[id^="purchasedLicense_' + poLotId + '_"]');
		}

		var isAlreadyLicenseChoosed = false;
		var licenseElement = null;

		$selectTags.each(function()
		{
			if( this.value == licenseKey )
			{
				licenseElement = this;
				isAlreadyLicenseChoosed = true;
			}
		});

		if( !isAlreadyLicenseChoosed )
		{
			if( selectedOption == 'upgrade' )
			{
				jQuery('#alreadyPurchased_' + poLotId + '_' + rowIndex).val(licenseKey);
				jQuery('#oldLicense_' + poLotId + '_' + rowIndex).val(licenseId);
			}
			else
			{
				jQuery('#purchasedLicense_' + poLotId + '_' + rowIndex).val(licenseKey);
				jQuery('#oldLicenseId_' + poLotId + '_' + rowIndex).val(licenseId);
			}
		}
		else
		{
			alert(getMessageForKey('ae.software.license.poreceiveitem.already.added.warn'));//No I18N
			return false;
		}

		if( acquisitionDate != undefined || acquisitionDate != null )
		{
			jQuery('#acquisitionDate_' + poLotId + '_' + rowIndex).val(acquisitionDate);
		}
		if( expiryDate != undefined || expiryDate != null )
		{
			jQuery('#expiryDate_' + poLotId + '_' + rowIndex).val(expiryDate);
		}
		if( installationsAllowed != undefined || installationsAllowed != null )
		{
			jQuery('#installAllowed_' + poLotId + '_' + rowIndex).val(installationsAllowed);
			jQuery('#oldInstallAllowed_' + poLotId + '_' + rowIndex).val(installationsAllowed);
		}
		if( allocated != undefined || allocated != null )
		{
			jQuery('#allocated_' + poLotId + '_' + rowIndex).val(allocated);
		}
	}
	parent.closeDialog();
}

function validateAllocatedDetails( installAllowedTextbox )
{
	//Need to remove the below block
	if( true )
	{
		return false;
	}

	if( isPositiveInteger(installAllowedTextbox.value) && parseInt(installAllowedTextbox.value) > 0 )
	{
		var temp = installAllowedTextbox.id.split("_");//NO I18N

		var elementId = '_' + temp[1] + '_' + temp[2];//NO I18N

		var allocated = 'allocated' + elementId;//NO I18N

		if( parseInt(jQuery(installAllowedTextbox).val()) < parseInt(jQuery('#' + allocated).val()) )
		{
			showBaloonToolTip(installAllowedTextbox.id, 'Licenses were already allocated to ' + jQuery('#' + allocated).val() + ' workstation(s)/server(s). So you cannot decrease the license count.');//NO I18N
			jQuery(installAllowedTextbox).val(jQuery('#oldInstallAllowed' + elementId).val());
			return false;
		}
		/*var $licensesList = jQuery('tr[id^="rowIndex_' + temp[1] + '_"]');

		var totalReceivingLicenses = 0;

		$licensesList.each(function()
		{
			if( jQuery('#' + this.id + ':visible').length != 0 )
			{
				tempInstalled = jQuery('#installAllowed' + this.id.split('rowIndex')[1]).val();

				if( tempInstalled != '' )
				{
					totalReceivingLicenses += parseInt(tempInstalled);//No I18N
				}
			}
		});

		if( totalReceivingLicenses > parseInt(jQuery('#quantity_' + temp[1]).val()) )
		{
			showBaloonToolTip( installAllowedTextbox.id, 'Receiving more than purchased count is not allowed.');//NO I18N

			oldInstallAllowed = jQuery('#oldInstallAllowed' + elementId).val();//NO I18N

			if( oldInstallAllowed != '' )
			{
				jQuery('#' + installAllowedTextbox.id).val(oldInstallAllowed);
			}
			else
			{
				jQuery('#' + installAllowedTextbox.id).val('');//NO I18N
			}
			return false;
		}*/
	}
	else
	{
		jQuery('#' + installAllowedTextbox.id).val('');//NO I18N
		showBaloonToolTip( installAllowedTextbox.id, 'Please provide valid count.');//NO I18N
	}
}

function fetchDowngradeLicenses( licenseId, rowIndex )
{
	callCustomAjaxRequestForGET('/SoftwareLicense.do', 'operation=fetch_downgrade_licenses&licenseId=' + licenseId, fetchDowngradeLicenseOnSuccess, licenseDeleteOnFailure, rowIndex );//NO I18N
}

function fetchDowngradeLicenseOnSuccess(req, rowIndex)
{
	rowIndex++;
	jQuery(req.responseXML).find('downgrade').each(function()
	{
		jQuery('#licenseId_' + rowIndex).val(jQuery(this).attr('licenseid'));
		jQuery('#licenseKey_' + rowIndex).val(jQuery(this).attr('licensekey'));
		jQuery('#software_' + rowIndex).val(jQuery(this).attr('softwareid'));

		addNewLicenseRow(document.getElementById('license_' + rowIndex));

		if( jQuery('#componentID').val() == jQuery(this).attr('softwareid') )
		{
			jQuery('#componentID').val('0');//NO I18N
		}

		jQuery('#software_' + rowIndex).prop('disabled', true); //NO I18N
		jQuery('#licenseKey_' + rowIndex).prop('disabled', true); //NO I18N
		jQuery('#addLicenseImg_' + rowIndex).off('click');//NO I18N

		if( jQuery(this).attr('isallocated') == 'true' )
		{
			jQuery('#addLicenseImg_' + rowIndex).on('click', function(){alert(getMessageForKey('ae.software.license.edit..cannot.removeLicense'));});//NO I18N
		}
		else
		{
			jQuery('#addLicenseImg_' + rowIndex).on('click', function(){removeAllDowngradeLicenses();});
		}

		rowIndex++;
	});
}

function removeAllDowngradeLicenses()
{
	var $selectTags = jQuery('input[id^="licenseId_"]');

	$selectTags.each(function()
	{
		if( this.value > 0 )
		{
			removeLicenseRow(this.parentNode.parentNode);
		}
	});
}

function clearLicenseField()
{
	jQuery('input[id="oldLicense"]').val('');
	jQuery('input[id="alreadyPurchasedLicense"]').val('-1');
}



function gotoSoftwareLicenseListView(fromSWDetailsPage)
{
	if( fromSWDetailsPage == null )
	{
		document.location = "/SoftwareLicenseListView.do?action=view";
	}
	else
	{
		document.location = '/SWWorkstationListView.do?criteria=' + fromSWDetailsPage;
		parent.closeDialog();
	}
}

function setReadOnlyStatus()
{
	if( document.getElementById('allocateToWorkstation').value == -1 )
	{
		document.getElementById('hostID').setAttribute("class", "formStyledisabled formtextboxw");//No I18N
		document.getElementById('hostID').readOnly = true;
		document.getElementById('hostID').value = '-';
		document.getElementById('OSName').setAttribute("class", "formStyledisabled formtextboxw");//No I18N
		document.getElementById('OSName').readOnly = true;
		document.getElementById('OSName').value = '-';
	}
	else
	{
		document.getElementById('hostID').setAttribute("class", "form-control formtextboxw");//No I18N
		document.getElementById('hostID').readOnly = false;
		document.getElementById('OSName').setAttribute("class", "form-control formtextboxw");//No I18N
		document.getElementById('OSName').readOnly = false;
	}
}

function fetchLicenses()
{
	if( jQuery('#allsites').length > 0 )
	{
		fetchSoftwareLicenses(jQuery('#licensedSoftware'), jQuery('#allsites').val(), null);
	}
	else
	{
		fetchSoftwareLicenses(jQuery('#licensedSoftware'), null, null);
	}
}
function fetchSoftwareLicenses(selectTag, siteId, poLotId)
{
	if( selectTag.val() != '-1' )
	{
		displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n

		var tempArray = selectTag.attr('id').split('_');

		var index = -1;

		if( tempArray.length > 1 )
		{
			index = tempArray[2];
		}

		var softwareId = selectTag.val();

		if( selectTag.prop('type') == 'text' )
		{
			softwareId = jQuery('#productextid_licenses_' + tempArray[1]).attr('softwareid_' + tempArray[1]);
		}

		var lotId = (poLotId == null ? -1 : poLotId);

		if( siteId != null )
		{
			showURLInDialog('/software/showlicenses.jsp?softwareId=' + softwareId + '&siteId=' + siteId + '&date=' + new Date().getMilliseconds() + '&rowIndex=' + index + '&poLotId=' + poLotId,'closeButton=no,title=,width=900');//NO I18n
		}
		else
		{
			showURLInDialog('/software/showlicenses.jsp?softwareId=' + softwareId + '&date=' + new Date().getMilliseconds() + '&rowIndex=' + index + '&poLotId=' + poLotId,'closeButton=no,title=,width=900');//NO I18n
		}
	}
	else
	{
		showBaloonToolTip(selectTag.attr('id'), getMessageForKey('sdp.admin.product.type.software.choose'));//No I18N
	}
}

function updateLicenseCategoryDetails(selectTag, operation)
{
	if(selectTag.value == 'standard' ) //Standard License
	{
		jQuery('#licensedSoftwareRow').hide();
		jQuery('#purchasedLicenseRow').hide();
	}
	else
	{
		jQuery('#licensedSoftwareRow').show();
		jQuery('#purchasedLicenseRow').show();
		if(selectTag == 'upgrade' )
		{
			jQuery('#licensedSoftwareLabel').text(getMessageForKey("ae.software.license.detailspage.upgradedfrom"));
			jQuery('#licensingSoftwareLabel').text(getMessageForKey('ae.software.license.detailspage.upgradedto'));
		}
		else if(selectTag == 'downgrade' )
		{
			jQuery('#licensedSoftwareLabel').text(getMessageForKey("ae.software.license.detailspage.downgradedfrom"));
			jQuery('#licensingSoftwareLabel').text(getMessageForKey("ae.software.license.detailspage.downgradedto"));
		}
	}
	if( operation != 'edit' )
	{
		clearLicenseField();
	}
}

function checkForDuplicateSoftware( selectTag )
{
	if( document.SoftwareLicense.componentID.value == 0 )
	{
		selectTag.value = '-1';
		showBaloonToolTip('componentID', getMessageForKey('sdp.inventory.softwarelicense.licensejserror3'));//NO I18N
		return false;
	}

	if( jQuery('#componentID').val() == selectTag.value  )
	{
		selectTag.value = '-1';
		showBaloonToolTip(selectTag.id, getMessageForKey('ae.software.license.downgrade.license.check'));//No I18N
		return false;
	}

	var $selectTags = jQuery('select[name^="software_"]');

	$selectTags.each(function()
	{
		if( selectTag.id != this.id && selectTag.value != '-1' )
		{
			if( selectTag.value == this.value )
			{
				selectTag.value = '-1';
				showBaloonToolTip(this.id, getMessageForKey('ae.software.license.downgrade.software.already.added'));//No I18N
			}
		}
	});
}

function checkForLicenseAllocation( licenseId, softwareId, isLicenseAllocated, rowIndex )
{
	if( softwareId == -1 )
	{
		removeLicenseRow(rowObj);
	}
	else if( isLicenseAllocated )
	{
		showBaloonToolTip('software_1', getMessageForKey('ae.software.license.downgrade.remove.license.warn'));//NO I18N
	}
	else
	{
		if( confirm(getMessageForKey('ae.software.license.edit.remove.downgrade.license.confirm')) )
		{
			callCustomAjaxRequest('/SoftwareLicense.do', 'operation=delete&licenseId=' + licenseId, licenseDeleteOnSuccess, licenseDeleteOnFailure, rowIndex );//NO I18N
		}
	}
}

function licenseDeleteOnFailure (req, operation)
{
	alert('server : failed');//NO I18N
}

function licenseDeleteOnSuccess ( req, rowIndex )
{
	var statusObj = req.responseXML.getElementsByTagName("status");

	if( jQuery(req.responseXML).find("status").text() == '200' )
	{
		removeLicenseRow(document.getElementById('addLicenseImg_' + rowIndex));
	}
	else
	{
		displayRow('messageRow');//NO I18N
		jQuery('#licenseOperationMessage').text(jQuery(req).find("message").text());
		setTimeout(function(){hideRow('messageRow');}, 4000);
	}
}

var isAlreadyValidated = false;

function checkForLicenseKeyExistence(licenseKeyInput)
{
	var $inputTags = jQuery('input[name^="licenseKey_"]');

	if( trim(licenseKeyInput.value) != '' )
	{
		$inputTags.each(function()
		{
			//No need to compare the self row
			if( isAlreadyValidated == false && this.id != licenseKeyInput.id && this.value == licenseKeyInput.value )
			{
				isAlreadyValidated = true;
				if( !confirm(getMessageForKey('ae.software.licensekey.validation.already.exists.confirm')) )
				{
					try
					{
						jQuery('#' + this.id).trigger('focus');
						jQuery('#' + this.id).trigger('select');
					}
					catch(e)
					{
					}

				}
				return false;
			}
		});

		if( !isAlreadyValidated )
		{
			//Need to check if any other license key is added already
			checkForDuplicateLicenseKey(licenseKeyInput);
		}
		isAlreadyValidated = false;
	}
}

var isDuplicateKeyIgnored = false;

function checkForDuplicateLicenseKey( licenseKeyInput )
{
	if( trim(licenseKeyInput.value) != '' && !isDuplicateKeyIgnored )
	{
		/*if( jQuery('#existingLicenseKey').length > 0 && jQuery('#existingLicenseKey').val() == trim(licenseKeyInput.value) )
		{
			return false;
		}*/
		callCustomAjaxRequestForGET('/SoftwareLicense.do', 'operation=checkForDuplicateLicenseKey&licenseKey=' + licenseKeyInput.value, licenseKeyDuplicateOnSuccess, licenseKeyDuplicateOnFailure, licenseKeyInput.id );//NO I18N
	}
}

function licenseKeyDuplicateOnSuccess( reqObj, licenseKeyInputFieldID )
{
	if( reqObj.responseText == 'true' )
	{
		if( !confirm(getMessageForKey('ae.software.licensekey.validation.already.exists.confirm')) )
		{
			jQuery('#' + licenseKeyInputFieldID).trigger('select');
			jQuery('#' + licenseKeyInputFieldID).trigger('focus');
		}
		else
		{
			isDuplicateKeyIgnored = true;
		}
	}
}

function licenseKeyDuplicateOnFailure( reqObj, operation )
{
}

function checkIfAlreadyAddedInDowngrade(selectTag)
{
	var $selectTags = jQuery('select[name^="software_"]');

	$selectTags.each(function()
	{
		if( selectTag.value != '-1' )
		{
			if( selectTag.value == this.value )
			{
				showBaloonToolTip(selectTag.id, getMessageForKey('ae.software.downgrade.already.added'));//No I18N
				selectTag.value = '0';
			}
		}
	});
}

function validateDuplicateUpgrade(selectTag)
{
	if(jQuery('#componentID').val() == jQuery('#licensedSoftware').val())
	{
		showBaloonToolTip(selectTag.id, getMessageForKey("ae.software.license.upgrade.validation.warn"));//No I18N

		if( selectTag.id == 'licensedSoftware' )
		{
			jQuery('#' + selectTag.id).val('-1');
		}
		else
		{
			jQuery('#' + selectTag.id).val('0');
		}
	}
}

function populateUpgradeSoftware( selectTag, poLotId, noOfLicenses )
{
	var selectedIndex = selectTag.name.split("_")[2];

	//for( i = selectedIndex; i<= noOfLicenses; i++ )
	//{
		jQuery('#licensedSoftware_' + poLotId).val(selectTag.value);
		jQuery('#alreadyPurchased_' + poLotId).val('');
		jQuery('#licenseKey_' + poLotId).val('');
	//}
}

function validateFormForRemoveLicence(formObj, licenseId)
{
	var valid = checkForDelete(formObj,"swcheckbox");//No I18N

	if(valid)
	{
		if( confirm (getMessageForKey('sdp.inventory.listviewWS&SW.jsconfirm')) )
		{
			var param = 'operation=removeAllocatedLicence';//NO I18N
			jQuery("[name='swcheckbox']").each(
				function(idx)
				{
					if( this.checked )
					{
						param += '&installationIds=' + this.value;//No I18N
					}
				}
			);
			callCustomAjaxRequest('/SoftwareLicense.do', param, softwareLicenseDeAllocation, ajaxRequestOnFailure, licenseId);//NO I18N
		}
	}
	else
	{
		jQuery("[name='checkbox25']").attr('id', 'checkbox25id');//No I18N
		showBaloonToolTip('checkbox25id', getMessageForKey("sdp.inventory.listviewWS&SW.jsSelect"));//No I18N
	}
}

function softwareUserLicenseDeAllocation(resObj, operation)
{
	if(resObj.responseText != 'success')
	{
		jQuery('#errorMessageRow').show();
		jQuery('#errorMessage').text(resObj.responseText);
		setTimeout(function(){jQuery('#errorMessageRow').fadeOut();}, 4000);
		alert(getMessageForKey("api.validation.unauthorised"));//No I18N
	}
	jQuery("#sw-users-content").html('');//No I18N
	jQuery("#sw-installation-content").html('');//No I18N
	jQuery("#sw-details-content").html('');//No I18N
	jQuery("#sw-licenses-content").html('');//No I18N

	loadTabDetails(document.getElementById('sw-users'), jQuery('#softwareId').val());
}

function softwareLicenseDeAllocation(resObj, licenseId)
{
	if(resObj.responseText != 'success')
	{
		jQuery('#errorMessageRow').show();
		jQuery('#errorMessage').text(resObj.responseText);
		setTimeout(function(){jQuery('#errorMessageRow').fadeOut();}, 4000);
		alert(getMessageForKey("api.validation.unauthorised"));//No I18N
	}
	else if( licenseId != null )
	{
		document.location = '/ViewWSDetails.do?wsId=' + licenseId + '&deallocated=success';
	}
	else
	{
		jQuery("#sw-users-content").html('');//No I18N
		jQuery("#sw-installation-content").html('');//No I18N
		jQuery("#sw-details-content").html('');//No I18N
		jQuery("#sw-licenses-content").html('');//No I18N

		loadTabDetails(document.getElementById('sw-installation'), jQuery('#softwareId').val());
	}
}

function loadUnlicensedPage(trackBy, softwareId, siteId, licenseId, licenseOption)
{
	if( trackBy != null )
	{
		//Called from software license details page
		if( "CAL" != trackBy )
		{
			NewWindow('/SoftwareLicense.do?operation=showunlicensedinstallations&licenseId=' + licenseId + '&softwareId=' + softwareId + '&siteId=' + ((siteId == null || siteId == undefined) ? -1 : siteId),'license_allocation_page','1050','475','no','center');//NO I18N
		}
		else if( "CAL" == trackBy )
		{
			if( softwareId == null )
			{
				showURLInDialog('/software/AllocateSWLicense.jsp?LICENSEID=' + licenseId + '&fromSWDetailsPage=' + new Date().getMilliseconds(),'title=' + getMessageForKey('sdp.inventory.swDetail.allocLicButtonValue') + ',closeButton=yes,modal=yes,position=center,width=700')//NO I18N
			}
			else
			{
				showURLInDialog('/software/AllocateSWLicense.jsp?LICENSEID=' + licenseId + '&softwareId=' + softwareId + '&licenseOption=' + licenseOption + '&fromSWDetailsPage=' + new Date().getMilliseconds(),'title=' + getMessageForKey('sdp.inventory.swDetail.allocLicButtonValue') + ',closeButton=yes,modal=yes,position=center,width=700')//NO I18N
			}
		}
	}
	else
	{
		//Called from software license listview page
		NewWindow('/SoftwareLicense.do?operation=showunlicensedinstallations&licenseId=' + licenseId + '&siteId=' + (jQuery('#usersites').val() == undefined ? -1 : jQuery('#usersites').val()),'license_allocation_page','1050','475','no','center');//NO I18N
	}
	jQuery('#loadingdivid').remove();
}

function allocateThisLicense( licenseId, trackby, licenseStatus )
{
	displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n

	if( licenseStatus == 1 )//If the license is active
	{
		if( trackby == 4 )//In case of CAL
		{
			loadUnlicensedPage('CAL', null, -1, licenseId, 'NA');//NO I18N
		}
		else
		{
			loadUnlicensedPage(null, null, null, licenseId, null);
		}
	}
	else
	{
		alert(getMessageForKey("ae.software.license.expired.allocation.warn"));//NO I18N
	}
}

function allocateLicense( formObj,softwareId, licenseId, siteId )
{
	var valid = checkForDelete(formObj,"checkbox");//No I18N

	if(valid)
	{
		var param = 'operation=allocateLicense&softwareId=' + softwareId + '&licenseId=' + licenseId + '&selectedSiteId=' + siteId + '&allocateOption=available';//No I18N
		jQuery("[name='checkbox']").each(
		function(idx)
		{
			if( this.checked )
			{
				param += '&wsId=' + this.value;//No I18N
			}
		});
		callCustomAjaxRequest('/SoftwareLicense.do', param, softwareLicenseAllocation, ajaxRequestOnFailure, licenseId);//NO I18N
	}
	else
	{
		jQuery("[name='checkbox23']").attr('id', 'checkbox23id');//No I18N
		showBaloonToolTip('checkbox23id', getMessageForKey("sdp.inventory.swDetail.selWSMsg"));//No I18N
	}

	return valid;
}

function softwareLicenseAllocation(resObj, licenseId)
{
	if(resObj.responseText != 'success')
	{
		jQuery('#errorMsgRow').show();
		jQuery('#errorMsg').html(encodeHTML(resObj.responseText) + '<table class="failurebox" width="100%" border="0"><tr><td><strong>' + getMessageForKey('sdp.swdetailspage.license.notallocated.cause') + ' </strong></td></tr> <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact1') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact2') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact3') + '</td></tr></table>');//NO I18N
		refreshSubView(getPortalViewName('SWUnlicencedInstallationView'));//NO I18N
	}

	if( window.opener.jQuery('#swManufacturer').length <= 0 && window.opener.jQuery('#SWLicencedInstallationView_NAV').length <= 0 )
	{
		//allocating license from software details page
		window.opener.jQuery("#sw-users-content").html('');//No I18N
		window.opener.jQuery("#sw-installation-content").html('');//No I18N
		window.opener.jQuery("#sw-details-content").html('');//No I18N
		window.opener.jQuery("#sw-licenses-content").html('');//No I18N

		if( window.opener.jQuery("#sw-licenses").length > 0 && window.opener.jQuery("#sw-licenses").attr('class').indexOf('active') >= 0 )
		{
			window.opener.loadTabDetails(window.opener.document.getElementById('sw-licenses'), window.opener.jQuery('#softwareId').val());
		}
		else
		{
			window.opener.loadTabDetails(window.opener.document.getElementById('sw-users'), window.opener.jQuery('#softwareId').val());
		}
	}
	else
	{
		//allocating license from software license listview page
		if( window.opener.jQuery('#swManufacturer').length > 0 )
		{
			if( window.opener.jQuery('#swManufacturer').val() > 0 )
			{
				window.opener.reloadListview('alllicenses', JSON.parse('{"SoftwareLicenseTypes:SWMANUFACTURERID":' + window.opener.jQuery('#swManufacturer').val() + ', "licenseCategory":"' + window.opener.jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
			}
			else
			{
				window.opener.reloadListview('alllicenses', JSON.parse('{"licenseCategory":"' + window.opener.jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
			}
		}
		else
		{
			//allocating license from software license detail page
			window.opener.location = '/ViewWSDetails.do?wsId=' + licenseId;//NO I18N
		}
	}

	if(resObj.responseText == 'success')
	{
		self.close();
	}
}

function showDowngradeLicenses( checkbox )
{
	if( checkbox.checked )
	{
		reloadListview('availableLicenses', JSON.parse('{"softwareId" : "' + jQuery('#softwareId').val() + '", "selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '", "fetchDowngradedLicenses" : "true"}'));//No I18N
	}
	else
	{
		reloadListview('availableLicenses', JSON.parse('{"softwareId" : "' + jQuery('#softwareId').val() + '", "selectedSiteId" : "' + jQuery('#selectedSiteId').val() + '"}'));//No I18N
	}
}

function updateSuiteScanRule()
{
	var count = 0;
	jQuery('#suitesoftwares option').each(function(){
		count++;
	});

	jQuery('#suiteRuleValue').val(count);

	fetchMatchedWorkstations();
}

function fetchMatchedWorkstations()
{
	var ruleId = jQuery('[name=suiteRule]:checked').val();

	if( ruleId == undefined )
	{
		return;
	}

	if( ruleId == 'on' )
	{
		ruleId = jQuery('#suiteRuleValue').val();

		if( ruleId == '' )
		{
			showBaloonToolTip('suiteRuleValue', getMessageForKey('ae.software.suite.scan.rule.cannotbe.empty'));//NO I18N
			return;
		}
		else if( !isInteger(ruleId) )
		{
			jQuery('#suiteRuleValue').val('');
			showBaloonToolTip('suiteRuleValue', getMessageForKey('sdp.inventory.detailWS.invalidUDFMsg'));//NO I18N
			return;
		}
		else if( ruleId <= 0 )
		{
			jQuery('#suiteRuleValue').val('');
			showBaloonToolTip('suiteRuleValue', getMessageForKey('ae.software.suite.scan.rule.zero.negative.warn'));//NO I18N
			return;
		}
	}
	if( jQuery('#suitesoftwares option').length >= 1 || jQuery('#suitesoftwares').length == 0 )
	{
		var newVal = "&suiteScanRuleId=" + ruleId;//No I18N

		var siteId = -1;

		if( jQuery('#selectedSiteId').length == 0 && window.opener != null )
		{
			try
			{
				siteId = jQuery("#selectedSiteId",window.opener.document).val();
			}
			catch(e)
			{
				siteId = jQuery("#selectedSiteId").val();
			}
		}
		else
		{
			siteId = jQuery("#selectedSiteId").val();
		}

		if( siteId != undefined )
		{
			newVal += '&siteId=' + siteId;//NO I18N
		}
		else
		{
			newVal += '&siteId=-1';//NO I18N
		}

		jQuery('#suitesoftwares option').each(function(){
			newVal += '&softwareId=' + this.value;//NO I18N
		});

		updateState(getPortalViewName("SuiteInstallations"),"_D_RP", newVal);//No I18N
		updateState(getPortalViewName("SuiteInstallations"), "_PN", null);//No I18N
		updateFormValues("SuiteInstallations", document.SoftwareListViewAction);//No I18N

		refreshSubView(getPortalViewName('SuiteInstallations'));//No I18N
	}
	else
	{
		if( jQuery('#suitesoftwares').length > 0 )
		{
			showBaloonToolTip('suitesoftwares', getMessageForKey('ae.software.suite.software.select.warn'));//No I18N
		}
	}
}

function openSuiteScanSettingsPage( softwareId )
{
	NewWindow('/SoftwareHome.do?operation=showSuiteSettingsPage&softwareId=' + softwareId + '&siteId=' + jQuery('#selectedSiteId').val(),'suitescanpage','950','475','no','center');//NO I18N
}

function saveSuiteScanSettings()
{
	var param = 'operation=saveSuiteScanSettings&softwareId=' + jQuery('#suitesoftwares option:selected').val();//NO I18N

	if( jQuery('#rule4').prop('checked') )
	{
		param += '&suiteRuleId=0';//NO I18N
	}
	else if( jQuery('#rule3').prop('checked') )
	{
		if( jQuery('#suiteRuleValue').val() != '' )
		{
			param += '&suiteRuleId=' + jQuery('#suiteRuleValue').val();//NO I18N
		}
		else
		{
			showBaloonToolTip('suiteRuleValue', getMessageForKey('ae.software.suite.scan.rule.cannotbe.empty'));//NO I18N
			return;
		}
	}

	jQuery('[name=workstationIds]').each(function()
	{
		if( this.checked )
		{
			param += '&wsId=' + this.value;//NO I18N
		}
	});

	var siteId = -1;

	if( jQuery('#selectedSiteId').length == 0 )
	{
		siteId = jQuery("#selectedSiteId",window.opener.document).val();
	}
	else
	{
		siteId = jQuery("#selectedSiteId").val();
	}

	if( siteId != undefined )
	{
		param += '&siteId=' + siteId;//NO I18N
	}

	freezePage('settingspage');//No I18N

	jQuery('#processing').removeClass('hide');//No I18N
	jQuery('#saving').addClass('hide');//No I18N

	callCustomAjaxRequest('/SoftwareHome.do', param, softwareHomeRequestOnSuccess, softwareHomeRequestOnFailure, 'saveSuiteScanSettings');//NO I18N
}

function openNewAgreementPage()
{
	window.opener.location = "/LicenseAgreement.do?operation=newagreement";//NO I18N
	self.close();
}

var purchaseLinkClicked = false;

function showPurchasedListView(softwareId)
{
	if( jQuery('#allPurchasedCount').length > 0 && jQuery('#allPurchasedCount').text() == '0' )
	{
		return;
	}
	purchaseLinkClicked = true;
	showSoftwareTab(document.getElementById('sw-licenses'));
	clearLicenseDetails();
	loadTabDetails(document.getElementById('sw-licenses'), softwareId);
}

var companyWideLicenseLinkClicked = false;

function showCALPurchasedListView()
{
	showSoftwareTab(document.getElementById('sw-licenses'));
	clearLicenseDetails();
	loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val(), '-6');
}

function showAvailableListView()
{
	if( jQuery('#allavailableCount').length > 0 && jQuery('#allavailableCount').text() == '0' )
	{
		return;
	}
	else if( jQuery('#available_downgrade').length > 0 )
	{
		showSoftwareTab(document.getElementById('sw-licenses'));
		clearLicenseDetails();
		loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val(), '-5');
	}
	else if( jQuery('#available_companywide').length > 0 )
	{
		companyWideLicenseLinkClicked = true;
		showSoftwareTab(document.getElementById('sw-licenses'));
		clearLicenseDetails();
		loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val(), '-4');
	}
	else
	{
		showSoftwareTab(document.getElementById('sw-licenses'));
		clearLicenseDetails();
		loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val(), '-3');
	}
}

function executeCustomPropScripts()
{
}

function showHideLicenseDetails()
{
	jQuery('body [id^="licencedetails_"]').on('click', function(){
		jQuery('#productextid_licenses_' + this.id.split('_')[1]).prop('checked', true);
		openAddNewLicenseSection(this);
	});
	jQuery('body [extid^="licencedetails_"]').on('click', function()
	{
		var arrayValues = jQuery(this).attr('extid').split('_');

		var licenseIdName = null;

		if( arrayValues.length == 2 )
		{
			//From PO
			licenseIdName = arrayValues[1];
		}
		else if( arrayValues.length == 3 )
		{
			//From PR
			licenseIdName = arrayValues[1] + '_' + arrayValues[2];
		}

		jQuery('#productextid_licenses_' + licenseIdName).prop('checked', true);//NO I18N

		if(jQuery(jQuery('#' + jQuery(this).attr('extid'))).attr('class')=='ui-expand')
		{
			jQuery(jQuery('#' + jQuery(this).attr('extid'))).removeAttr('class').addClass('ui-collapse');// NO I18N
			//jQuery('.morelicence').slideDown('slow');// NO I18N
			jQuery('#license_details_section_' + licenseIdName).slideDown('slow');// NO I18N
		}
		else
		{
			jQuery(jQuery('#' + jQuery(this).attr('extid'))).removeAttr('class').addClass('ui-expand');// NO I18N
			//jQuery('.morelicence').slideUp('slow');// NO I18N
			jQuery('#license_details_section_' + licenseIdName).slideUp('slow');// NO I18N
		}
	});
}

function openAddNewLicenseSection(iconObj)
{
	var arrayValues = iconObj.id.split('_');

	var licenseIdName = null;

	if( arrayValues.length == 2 )
	{
		//From PO
		licenseIdName = arrayValues[1];
	}
	else if( arrayValues.length == 3 )
	{
		//From PR
		licenseIdName = arrayValues[1] + '_' + arrayValues[2];
	}

	if( jQuery('#productextid_licenses_' + licenseIdName).prop('checked') == false )
	{
		jQuery(iconObj).removeAttr('class').addClass('ui-expand');// NO I18N
		jQuery('#license_details_section_' + licenseIdName).slideUp('slow');// NO I18N
	}
	else
	{
		if(jQuery(iconObj).attr('class')=='ui-expand')
		{
			jQuery(iconObj).removeAttr('class').addClass('ui-collapse');// NO I18N
			jQuery('#license_details_section_' + licenseIdName).slideDown('slow');// NO I18N
		}
		else
		{
			jQuery(iconObj).removeAttr('class').addClass('ui-expand');// NO I18N
			jQuery('#license_details_section_' + licenseIdName).slideUp('slow');// NO I18N
		}
	}
}

var softwareCount = 0;
var siteCount = 0;

function updateSoftwareCompliance1(totalSoftwares, totalSites)
{
	softwareCount = totalSoftwares;
	siteCount = totalSites;

	if( jQuery('#softwareIds :selected').length > 0  )
	{
		var param = 'action=calculateSoftwareCompliance';//NO I18N

		if( jQuery('#softwareIds :selected').val() != '-1' )
		{
			softwareCount = 0;
			jQuery("#softwareIds :selected").each(function()
			{
				param+= '&softwareId=' + this.value;//NO I18N
				softwareCount++;
			});
			param += "&allsoftware=false";//NO I18N
		}
		else
		{
			param += "&allsoftware=true";//NO I18N
		}

        var dialogHTML = '<table width="500px" class="whitebgBorder">' + //NO I18N
            '<tr><td colspan="3" class="lcnagreehrbg" align="left">' + //NO I18N
            '<b>Calculating software compliance, Please wait...</b></td></tr>' + //NO I18N
            '<tr style="height:30px;border-bottom: 1px solid #AAAAAA;">' + //NO I18N
            '<td width="70%" style="font-size: 12px;">&nbsp;Compliance calculated for software</td>' + //NO I18N
            '<td width="5%"><img id="softwareCountProcess" src="/images/processing.gif" border="0"></td>' + //NO I18N
            '<td width="25%" id="softwareCount">0/' + softwareCount + '</td></tr>' + //NO I18N
            '<tr style="height:30px;border-bottom: 1px solid #AAAAAA;">' + //NO I18N
            '<td width="70%" style="font-size: 12px;">&nbsp;Compliance calculated for site</td>' + //NO I18N
            '<td width="5%"><img id="siteCountProcess" src="/images/spacer.gif" border="0"></td>' + //NO I18N
            '<td width="25%" id="siteCount">0/' + siteCount + '</td></tr>' + //NO I18N
            '<tr id="completeButton"><td style="display:none" id="closeButtonRow" colspan="3" align="center">' + //NO I18N
            '<input type="button" value="Close" title="Close" style="width:auto" id="reset2224" class="formStylebutton" name="Close"></td></tr></table>'; //NO I18N

        showDialog(dialogHTML, 'closeButton=no,title='); //NO I18N
        jQuery('#reset2224').on('click', function() {
            closeDialog();
        });
		freezePage('softwarelist');//NO I18N
		callCustomAjaxRequest('/servlet/AJaxServlet', param, softwareComplianceOnSuccess, softwareComplianceOnFailure, 'compliance_calc');//NO I18N
		setTimeout(function(){updateComplianceUpdateProgress('compliance_progress');}, 2000);//NO I18N
	}
	else
	{
		alert(getMessageForKey("ae.cmdb.inventory.ci.swins.selectSWJSError"));//NO I18N
	}
}

function updateComplianceUpdateProgress(action)
{
	var param = 'action=getSoftwareComplianceProgress';//NO I18N
	callCustomAjaxRequestForGET('/servlet/AJaxServlet', param, softwareComplianceOnSuccess, softwareComplianceOnFailure, action);//NO I18N
}

function softwareComplianceOnFailure(req, softwareId)
{
	alert(requestObj.responseText);
}

function softwareComplianceOnSuccess(req, action)
{
	if( action == 'compliance_progress' )
	{
		if( req.responseText == 'compliance_running' )
		{
			alert(getMessageForKey('sdp.software.schedule.compliance.running.msg'));
			jQuery('#closeButtonRow').show();
			jQuery('#FreezeLayer').remove();
			closeDialog();
			return;
		}
		if( softwareCount > 0 )
		{
			document.getElementById('softwareCount').innerHTML = encodeHTML(req.responseText) + '/' + encodeHTML(softwareCount);//NO I18N
		}

		if( req.responseText == softwareCount )
		{
			document.getElementById('softwareCountProcess').src = '/images/processing_done.gif';//NO I18N
			softwareCount = 0;
			updateSiteBasedCompliance();
		}
		else if( req.responseText == '-1' )
		{
			document.getElementById('softwareCountProcess').src = '/images/po-rejectbtn.png';//NO I18N
			document.getElementById('softwareCount').innerHTML = 'Failed';//NO I18N
			jQuery('#closeButtonRow').show();
			jQuery('#FreezeLayer').remove();
			softwareCount = 0;
		}
		else if( softwareCount > 0 )
		{
			setTimeout(function(){updateComplianceUpdateProgress('compliance_progress');}, 2000);//NO I18N
		}
	}
	else if( action == 'site_compliance_progress' )
	{
		document.getElementById('siteCount').innerHTML = encodeHTML(req.responseText) + '/' + encodeHTML(siteCount);//NO I18N

		if( req.responseText == siteCount )
		{
			document.getElementById('siteCountProcess').src = '/images/processing_done.gif';//NO I18N
			siteeCount = 0;
			jQuery('#closeButtonRow').show();
			jQuery('#FreezeLayer').remove();
		}
		else if( req.responseText == '-1' )
		{
			document.getElementById('siteCountProcess').src = '/images/po-rejectbtn.png';//NO I18N
			document.getElementById('siteCount').innerHTML = 'Failed';//NO I18N
			siteeCount = 0;
			jQuery('#closeButtonRow').show();
			jQuery('#FreezeLayer').remove();
		}
		else
		{
			setTimeout(function(){updateComplianceUpdateProgress('site_compliance_progress');}, 2000);//No I18N
		}
	}
}

function updateSiteBasedCompliance()
{
	document.getElementById('siteCountProcess').src = '/images/processing.gif';//NO I18N
	var param = 'action=getSoftwareSiteCompliance&siteCount=' + siteCount;//NO I18N

	if( jQuery('#softwareIds :selected').length > 0 )
	{
		if( jQuery("#softwareIds :selected").val() != '-1' )
		{
			jQuery("#softwareIds :selected").each(function()
			{
				param+= '&softwareId=' + this.value;//NO I18N
			});
			param += "&allsoftware=false";//NO I18N
		}
		else
		{
			param += "&allsoftware=true";//NO I18N
		}
		callCustomAjaxRequest('/servlet/AJaxServlet', param, softwareComplianceOnSuccess, softwareComplianceOnFailure, 'start_sitebased_compliance');//NO I18N
		setTimeout(function(){updateComplianceUpdateProgress('site_compliance_progress');}, 2000);//No I18N
	}
}

function showAllInstallationListView()
{
	if( jQuery("#allinstallationCount").text() != '0' )
	{
		showSoftwareTab(document.getElementById('sw-installation'));//NO I18N
		clearInstallDetails();
		loadTabDetails(document.getElementById('sw-installation'), jQuery('#softwareId').val(), 'allinstallations');//NO I18N
	}
}

function showLicenseInstallationListView()
{
	if( jQuery("#alllicensedCount").text() != '0' )
	{
		showSoftwareTab(document.getElementById('sw-installation'));//NO I18N
		clearInstallDetails();
		loadTabDetails(document.getElementById('sw-installation'), jQuery('#softwareId').val(), 'licensed');//NO I18N
	}
}

function showUnLicenseInstallationListView()
{
	if( jQuery("#allunlicensedCount").text() != '0' )
	{
		showSoftwareTab(document.getElementById('sw-installation'));//No I18N
		clearInstallDetails();
		loadTabDetails(document.getElementById('sw-installation'), jQuery('#softwareId').val(), 'unlicensed');//NO I18N
	}
}

function showLicenseHelp(iconObj)
{
	var message = '';
	if( jQuery('#available_companywide').length > 0 )
	{
		message = jQuery('#available_companywide').attr('info');

		var selectedSite = jQuery(jQuery('.select2-choice span').get(0)).text();//NO I18N

		if( selectedSite != '' )
		{
			if( jQuery('#isrestrictedaccess').val() == 'true' )
			{
				message = getMessageForKey('ae.software.detailspage.site.license.availble.info');//NO I18N
			}
			else
			{
				message = message.replace('null', encodeHTML(jQuery(jQuery('.select2-choice span').get(0)).text()));//NO I18N
			}
		}
		else
		{
			if( jQuery('#isrestrictedaccess').val() == 'true' )
			{
				message = getMessageForKey('ae.software.detailspage.site.license.availble.info');//NO I18N
			}
			else
			{
				message = message.replace('null', getMessageForKey('sdp.admin.technician.addtechnician.nosite'));//NO I18N
			}
		}
	}
	else if( jQuery('#available_downgrade').length > 0 )
	{
		message = jQuery('#available_downgrade').attr('info');
	}

	showToolTipPopupMenu(iconObj, message);
}
function showPopupMenu(refid,popupid,alignpos)
{

	var divObj = jQuery("#"+popupid);
	var jElement = jQuery("#"+refid);
	var jElementOff = jElement.offset();
	var jElementCls = jElement.closest('td.pos-rel'); //No i18N

	var eleTop = jElementOff.top + jElement.height() - (jElementCls.length > 0 ? jElementCls.offset().top : 0);
	var leftOf = jElementOff.left - (jElementCls.length > 0 ? jElementCls.offset().left : 0);

	var eleLeft = leftOf - 1;
	if(alignpos == "right"){
		eleLeft = leftOf + jQuery(jElement).outerWidth() - jQuery(divObj).outerWidth();
	}

	divObj.width(divObj.width()).css({zIndex:1000, position: 'absolute',left: eleLeft+"px",top: eleTop+"px"}).show();//No i18N

	// Close div on document click
	jQuery(document).on('click', function(event) {
		if (!jQuery(event.target).closest( "#"+refid ).length ) {
			jQuery("#"+popupid).hide();
		}
	});

	// Do not close div on source element
	jQuery("#"+popupid).on('click', function(e) {
		e.stopPropagation();
	});

}

function showSoftwareCountDetails( softwareId, columnName, isCompliancePendingSW )
{
	if( isCompliancePendingSW )
	{
		jQuery("#freeze_softwarelist").removeClass('hide');
	}

	document.location = '/SWWorkstationListView.do?criteria=' + softwareId + '&selectedSite=' + (jQuery('#allsites').val() == undefined ? -1 : jQuery('#allsites').val()) + '&showDetailsOf=' + columnName;//No I18N
}

/*
* A function, to show the popup of individual users' runtime and runcount , if we click the runtime/runcount value in installations tab of a software details page
*/
function showSoftwareMeteringData( swInfoId, wsId, param )
{
	var title = getMessageForKey('software.metering.runtime');
	if(param === "runcount"){
		title = getMessageForKey('software.metering.runcount');
	}
	var list_info = {"list_info":{"search_criteria":[{"field":"installation","condition":"is","value":swInfoId}]},"fields_required":["user.name","run_time","run_count"]};//NO I18N
	sdpAjax({
		type : 'GET', //NO I18N
		url : '/api/v3/software_metering_data', //NO I18N
		dataType : 'json', //NO I18N
		data: sdpAjaxInputData(list_info),
		success : function(respJson) {
			if(respJson.response_status[0].status_code == 2000)
			{
			    if((respJson.software_metering_data).length > 0){
			        //Individual SW
				    renderhbs('#MeteringDataDiv','softwaremetering_template', {'data':respJson.software_metering_data,'param':param,'issuite':false}, false, "software"); // NO I18N
				}
                else{
                	//Suite SW
                    sdpAjax({
                            type: 'GET',//no i18n
                            url: '/servlet/AJaxServlet',//no i18n
                            data: 'action=getUsageDetailsForSuiteInstallationTab&wsId='+wsId+'&swInfoId='+swInfoId, //No I18N
                            async: false,
                            success: function(resp) {
                                renderhbs('#MeteringDataDiv','softwaremetering_template', {'data':resp,'param':param,'issuite':true}, false, "software"); // NO I18N
                            }
                        });
                }
				jQuery('#MeteringDataDiv').dialog({width: '602px',height: 'auto', title: title, modal: true}); // No I18N
			}
		}
	});
}

function triggerPostEvent( columnName, softwareId, purchased )
{
	if( columnName == 'installed' )
	{
		showAllInstallationListView();
	}
	else if( columnName == 'purchased' )
	{
		showPurchasedListView(softwareId);
	}
	else if( columnName == 'calpurchased' )
	{
		showCALPurchasedListView(softwareId);
	}
	else if( columnName == 'available' )
	{
		showAvailableListView();
	}
	else if( columnName == 'allocated' )
	{
		showLicenseDetailsPage(softwareId, purchased, 'triggerAllocateTab');//NO I18N
	}
}

function stopEventProbagation(e)
{
	if (!e)
		e = window.event;
	//IE9 & Other Browsers
	if (e.stopPropagation)
	{
		e.stopPropagation();
	}
	////IE8 and Lower
	else
	{
		e.cancelBubble = true;
	}
}

function openAutoAllocatePage(softwareId, siteId)
{
	var licensePurchased = jQuery('#sw-userdetails_-1 .sw-counttxt').text();

	if( (isInteger(licensePurchased) && parseInt(licensePurchased) > 0) || !isInteger(licensePurchased) || jQuery('#companyWideLicenses').length > 0 )
	{
		showURLInDialog('/SoftwareHome.do?operation=showautoallocatepage&softwareId=' + softwareId + '&siteId=' + siteId,'closeButton=no,title=,width=700,  modal=yes');//NO I18N
	}
	else
	{
		alert(getMessageForKey('sdp.swdetailspage.workstation.nolicenseavailable'));//NO I18N
	}
}

function autoAllocateLicenses(softwareId, siteId)
{
	jQuery('#processing').removeClass('hide');//No I18N
	jQuery('#saving').addClass('hide');//No I18N

	var param = 'operation=autoAllocateLicense&softwareId=' + softwareId + '&selectedSiteId=' + siteId + '&allocateOption=' + jQuery('[name=allocateOption]:checked').val();;//No I18N
	callCustomAjaxRequest('/SoftwareLicense.do', param, licenseAutoAllocateOnSuccess, softwareHomeRequestOnFailure, 'autoAllocateLicense');//NO I18N
}

function licenseAutoAllocateOnSuccess( req, identifier )
{
	jQuery('#processing').addClass('hide');
	jQuery('#saving').removeClass('hide');

	if( req.responseText == 'success' )
	{
		jQuery('#allocationSuccess').show();//No I18N
		jQuery('#allocationFailure').hide();//No I18N
	}
	else
	{
		jQuery('#allocationSuccess').hide();//No I18N
		jQuery('#allocationFailureMessage').html('<table class="failurebox" width="100%" border="0"><tr><td class="mandatory"><strong>' + encodeHTML(req.responseText) + '</strong></td></tr><tr><td><strong>' + getMessageForKey('sdp.swdetailspage.license.notallocated.cause') + ' </strong></td></tr> <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;1.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact1') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;2.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact2') + '</td></tr><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;3.' + getMessageForKey('sdp.swdetailspage.license.notallocated.fact3') + '</td></tr></table>');//NO I18N
		jQuery('#allocationFailure').show();//No I18N
	}
	jQuery("#sw-licenses-content").children().remove();

	//allocating license from software details page
	jQuery("#sw-users-content").html('');//No I18N
	jQuery("#sw-installation-content").html('');//No I18N
	jQuery("#sw-details-content").html('');//No I18N
	jQuery("#sw-licenses-content").html('');//No I18N

	loadTabDetails(document.getElementById('sw-licenses'), jQuery('#softwareId').val());//No I18N
}

function showSuiteComponentInstallations()
{
	var softwareId = jQuery('#softwareId').val();//NO I18N
	var siteId = jQuery('#selectedSiteId').val();//NO I18N

	showURLInDialog('/software/showsuitecomponentinstallation.jsp?softwareId=' + softwareId + '&siteId=' + siteId,'closeButton=no,title=');//NO I18N
}

function validateSoftwareAssociationForm(form,$this)
{
        if(form.selectedList.selectedIndex == -1)
        {
                alert(getMessageForKey("sdp.inventory.addSWToWS.selectSWMsg"));//NO I18N
                return false ;
        }
        else
        {
        		var msg = jQuery($this).button('loading');
                return true;
        }
}
function checkPurchasedLicenseStatus()
{
	var selectedSWTypeId = document.getElementById('selectedSWTypeId').value;
	var purchasedLicenseCount = document.getElementById('purchasedLicenseCount').value;

        var swTypeObj = document.getElementById('swType');

        var length = swTypeObj.options.length;

        var orginalSWType = "";
        var currentSWId = null;
        var currentSWType = null;

        for( i=0; i<length; i++ )
        {
                if( swTypeObj.options[i].value == selectedSWTypeId )
                {
                        orginalSWType = swTypeObj.options[i].innerHTML;
                }
                if( swTypeObj.options[i].selected )
                {
                        currentSWId = swTypeObj.options[i].value;
                        currentSWType = swTypeObj.options[i].innerHTML;
                }
        }

        if( selectedSWTypeId == currentSWId )
        {
                window.close();
                return false;
        }

	if( orginalSWType == 'Managed' )
        {
                if( purchasedLicenses != null && purchasedLicenses > 0 )
                {
			if( confirm(getMessageForKey('sdp.software.type.bulk.move.confirmation').replace('{0}', currentSWType)))
                        {
                                return true;
                        }
                        else
                        {
                                return false;
                        }
                }
                else
                {
                        return true;
                }
        }
        else
        {
                return true;
        }
}

function updateSoftwareDetailsPageUI()
{
	//jQuery('#swdescription').html(jQuery('#swdescription').html().replace('&#xd;&#xa;', '<br>'));
	//jQuery('#swdescription').html(jQuery('#swdescription').html());
	showMore(100);

	if( jQuery('#ui-tablelist1 tr').length > 6 )
	{
		jQuery('#ui-tablelist1').attr('style', 'height:200px;overflow:auto;');
	}

	if( jQuery('#allPurchasedCount').length > 0 )
	{
		if( jQuery('#allPurchasedCount').text() == '0' )
		{
			jQuery('#purchaseHelpIcon').hide();
		}
		else
		{
			jQuery('#purchaseHelpIcon').show();
		}
	}

	unlicensedCount = parseInt(jQuery('#allunlicensedCount').text());//NO I18N
	availableCount = parseInt(jQuery('#allavailableCount').text());//NO I18N

	if(availableCount == 0)
	{
		tdObj = jQuery("#allavailableCount").parent();

		tdObj.removeClass('available');//NO I18N
		tdObj.addClass('total-licence');//NO I18N
	}

	if( (unlicensedCount > 0 && availableCount > 0) || (unlicensedCount > 0 && jQuery('#available_companywide').is(':visible')) || (unlicensedCount > 0 && jQuery('#available_downgrade').is(':visible')) )
	{
		jQuery("#complianceInfo").removeClass('hide');//NO I18N
	}

	if( parseInt(jQuery('#expired').text()) <= 0 )
	{
		jQuery('#expired').removeClass("licenses-expired");
		jQuery('#expired').addClass("licenses-expir");
	}
}

function changeConsoleView( selectTag )
{
	document.location = '/AdminConsole.do?consoleFilter=' + encodeURIComponent(selectTag.value);//NO I18N
}

function clearPRHistory()
{
	if( jQuery('#purchaseHistory').children().length != 2 )
	{
		jQuery('#purchaseHistory').children().each(function(){
			if( this.id.split('_')[1] != 0 )
			{
				jQuery(this).remove();
			}
		});
	}
}

function calculatePendingList()
{
	if( jQuery("#pendingSWList").val() == null )
	{
		alert(getMessageForKey("sdp.software.empty.pending.list.error.message"));
	}
	else
	{
		var param = 'operation=calculatePendingList';//NO I18N

		var softwareIdsList = jQuery("#pendingSWList").val();

		for( i = 0; i < softwareIdsList.length; i++ )
		{
			param += '&softwareId=' + softwareIdsList[i];//No I18N
		}

		jQuery("#saving").addClass('hide');
		jQuery("#processing").removeClass('hide');

		jQuery.ajax({
			type: 'POST',//NO I18N
			url: '/SoftwareHome.do',//NO I18N
			data: param,
			success: function(data, status, req)
			{
				jQuery('#oninfo').addClass('hide');

				if( req.responseText == "success" )
				{
					jQuery('#onsuccess').removeClass('hide');

					var softwareIdsList = jQuery("#pendingSWList").val();

					for( i = 0; i < softwareIdsList.length; i++ )
					{
						jQuery("#pendingSWList option[value='"+softwareIdsList[i]+"']").remove();
					}

					reloadSoftwareListView();

					setTimeout(function() {
						if( jQuery("#pendingSWList option").length == 0 ) {
							jQuery("#saving #cancel").trigger('click');
							//window.location.reload();
							document.location="/SoftwareListView.do";
						}
						else
						{
							jQuery("#processing").addClass('hide');
							jQuery("#saving").removeClass('hide');
						}
					}, 3000);
					setTimeout(function(){jQuery("#onsuccess").addClass('hide');}, 4000);
				}
				else if( req.responseText == "compliance_running" || req.responseText == "already_calculated" || req.responseText == "scan_running" )
				{
					jQuery('#onfailure').removeClass('hide');

					if( req.responseText == "compliance_running" )
					{
						jQuery("#onfailuremsg").text(getMessageForKey('sdp.software.schedule.compliance.running.msg'));
					}
					if( req.responseText == "already_calculated" )
					{
						jQuery('#onfailuremsg').text(getMessageForKey('sdp.software.pending.software.list.already.calculated'));
						setTimeout(function(){jQuery("#saving #cancel").trigger('click');reloadPage(this.window);}, 4000);
					}
					else if( req.responseText == "scan_running" )
					{
						jQuery('#onfailuremsg').text(getMessageForKey('sdp.software.scan.running.inprocess.msg'));
					}

					setTimeout(function(){jQuery("#saving").removeClass('hide');jQuery('#processing').addClass('hide');}, 3000);
					setTimeout(function(){jQuery("#onfailure").addClass('hide');}, 4000);
				}
				else
				{
					if( req.getResponseHeader('content-type').indexOf('text/html') > -1 )
					{
						var canSend = false;

						var url = '/SoftwareHome.do?operation=calculatePendingList&softwareId=';//NO I18N

						var softwareIdsList = jQuery("#pendingSWList").val();

						var isNumber = /(^\d\d*$)/;

						for( i = 0; i < softwareIdsList.length; i++ )
						{
							if( !isNumber.test(softwareIdsList[i]) )
							{
								url += encodeURIComponent(softwareIdsList[i]);
								canSend = true;
								break;
							}
						}

						if( canSend )
						{
							window.location.href = url;
						}
					}
					else
					{
						jQuery('#onfailure').removeClass('hide');

						if( req.responseText == 'unauthorized' )
						{
							jQuery('#onfailuremsg').text(getMessageForKey('sdp.common.operation.autherror'));
						}
						else
						{
							jQuery('#onfailuremsg').text(getMessageForKey('sdp.software.calculate.compliance.error.message'));
						}

						setTimeout(function(){jQuery("#saving").removeClass('hide');jQuery('#processing').addClass('hide');}, 3000);
						setTimeout(function(){jQuery("#onfailure").addClass('hide');}, 4000);
					}
				}
			},
			error: function(data, status, req)
			{
				jQuery('#oninfo').addClass('hide');
				jQuery('#onfailure').removeClass('hide');

				if( req.responseText == 'unauthorized' )
				{
					jQuery('#onfailuremsg').text(getMessageForKey('sdp.common.operation.autherror'));
				}
				else
				{
					jQuery('#onfailuremsg').text(getMessageForKey('sdp.software.calculate.compliance.error.message'));
				}

				setTimeout(function(){jQuery("#saving").removeClass('hide');jQuery('#processing').addClass('hide');}, 3000);
				setTimeout(function(){jQuery("#onfailure").addClass('hide');}, 4000);
			}
		});
	}
}
function calculateSoftwareCompliance()
{
	if( !isCheckBoxSelected('softwareList') )
	{
		alert(getMessageForKey("sdp.software.empty.pending.list.error.message"));
	}
	else
	{
		var param = 'operation=runCompliance';//NO I18N

		jQuery("[name='softwareList']").each(function()
		{
			if( this.checked )
			{
				param += '&softwareId=' + this.value;//No I18N
			}
		});

		jQuery("#freeze_softwarelist").removeClass("hide");

		jQuery('#sw-licensed').hide();

		jQuery.ajax({
			type: 'POST',//NO I18N
			url: '/SoftwareHome.do',//NO I18N
			data: param,
			success: function(data, status, req)
			{
				if( req.responseText == 'failure' )
				{
					showalert('failure', getMessageForKey('sdp.software.calculate.compliance.error.message'), 'isAutoHide=true');//NO I18N
				}
				else if( req.responseText == 'unauthorized' )
				{
					showalert('failure', getMessageForKey('sdp.common.operation.autherror'), 'isAutoHide=true');//NO I18N
				}
				else if( req.responseText == 'compliance_running' )
				{
					showalert('failure', getMessageForKey('sdp.software.schedule.compliance.running.msg'), 'isAutoHide=true');//NO I18N
				}
				else if( req.responseText == "scan_running" )
				{
					showalert('failure', getMessageForKey('sdp.software.scan.running.inprocess.msg'), 'isAutoHide=true');//NO I18N
				}
                else if( req.responseText == "already_calculated" )
                {
                    showalert('failure', getMessageForKey('sdp.software.pending.software.list.already.calculated'), 'isAutoHide=true');//NO I18N
                }
				else
				{
					if( req.responseText == 'success' )
					{
						showalert('success', getMessageForKey('sdp.software.calculate.compliance.success.message'), 'isAutoHide=true');//NO I18N
						reloadSoftwareListView();
					}
					else
					{
						if( req.getResponseHeader('content-type').indexOf('text/html') > -1 )
						{
							var canSend = false;

							var url = '/SoftwareHome.do?operation=runCompliance&softwareId=';//NO I18N

							var isNumber = /(^\d\d*$)/;

							jQuery("[name='softwareList']").each(function()
							{
								if( this.checked && !isNumber.test(this.value))
								{
									url += this.value;
									canSend = true;
									return false;
								}
							});

							if( canSend )
							{
								window.location.href = url;
							}
						}
						else
						{
							showalert('failure', getMessageForKey('sdp.software.calculate.compliance.error.message'), 'isAutoHide=true');//NO I18N
						}
					}
				}

				jQuery("#freeze_softwarelist").addClass("hide");
			},
			error: function(data, status, req)
			{
				if( req.responseText == 'unauthorized' )
				{
					showalert('failure', getMessageForKey('sdp.common.operation.autherror'), 'isAutoHide=true');//NO I18N
				}
				else
				{
					showalert('failure', getMessageForKey('sdp.software.calculate.compliance.error.message'), 'isAutoHide=true');//NO I18N
				}

				jQuery("#freeze_softwarelist").addClass("hide");
			}
		});
	}
}
function validationSoftwareReconcile()
{
	var param = 'operation=validateSoftwareReconcile';//NO I18N
	var softwareIds=[];
	jQuery("[name='softwareList']").each(function()
	{
		if( this.checked )
		{
			param += '&softwareId=' + this.value;//No I18N
			softwareIds.push(this.value);
		}
	});
	if(softwareIds.length != 2)
	{
		alert(getMessageForKey("sdp.software.reconcile.noselect.error.message"));
	}
	else
	{
		jQuery("#freeze_softwarelist").removeClass("hide");
		jQuery('#compliance_running_msg').hide();
		jQuery('#sw-licensed').hide();

		jQuery.ajax({
			type: 'POST',//NO I18N
			url: '/SoftwareHome.do',//NO I18N
			data: param,
			success: function(data, status, req)
			{
				if(data.response == 'success') {
					openReconcilePopup(data.data);
				}else {
					showalert('failure', getMessageForKey(trim(data.message)), 'isAutoHide=true');//NO I18N
				}
			},
			error: function(data, status, req)
			{
				showalert('failure', getMessageForKey('sdp.software.reconcile.error.message'), 'isAutoHide=true');//NO I18N
			},
            complete: function()
            {
                jQuery("#freeze_softwarelist").addClass("hide");
                jQuery('#compliance_running_msg').show();
            }
		});
	}
}
function openReconcilePopup(data)
{
    jQuery("#software1_label")[0].innerHTML='<input type="radio" name="softwareName" id="software_1" checked="" value="'+Number(data[0].id)+'" class="radio-inline">'+e_html(data[0].name);
    jQuery("#software2_label")[0].innerHTML='<input type="radio" name="softwareName" value="'+Number(data[1].id)+'" id="software_2" class="radio-inline">'+e_html(data[1].name);
    jQuery('#select_software_and_reconcile').dialog({
        modal:"true",
        width: jQuery(window).width() * 30 / 100,
        close:function(){
          jQuery(this).dialog("destroy"); // No I18N
        }
    });
    jQuery('#sw-licensed').hide();
}

function softwareReconcile(button)
{
    button.disabled = true;
    var parentSoftware=jQuery("#software_1").val();
    var childSoftware=jQuery("#software_2").val();
    if(jQuery("#software_2").is(':checked'))
    {
        parentSoftware=jQuery("#software_2").val();
        childSoftware=jQuery("#software_1").val();

    }
    var param = 'operation=softwareReconcile';//NO I18N
    param += '&parentId=' + parentSoftware;//No I18N
    param += '&childId=' + childSoftware;//No I18N
    jQuery("#freeze_softwarelist").removeClass("hide");
    jQuery('#compliance_running_msg').hide();
    jQuery('#sw-licensed').hide();

    jQuery.ajax({
        type: 'POST',//NO I18N
        url: '/SoftwareHome.do',//NO I18N
        data: param,
        success: function(data, status, req)
        {
              if( req.responseText == 'success' ) {
                  showalert('success', getMessageForKey("sdp.software.reconcile.success.message"), 'isAutoHide=true');//NO I18N
              }else {
                  showalert('failure', getMessageForKey(trim(req.responseText)), 'isAutoHide=true');//NO I18N
              }
              reloadSoftwareListView();
        },
        error: function(data, status, req)
        {
            showalert('failure', getMessageForKey('sdp.software.reconcile.error.message'), 'isAutoHide=true');//NO I18N
        },
        complete: function()
        {
            jQuery('#select_software_and_reconcile').dialog("close");//NO I18N
            jQuery("#freeze_softwarelist").addClass("hide");
            jQuery('#compliance_running_msg').show();
            button.disabled = false;
        }
    });
}
function populateSoftwareTypeCount(allSWCountList, total) {
    var len = allSWCountList.length;

    if (len > 0) {
        var content = "";
        var swType = "";

        content += "<tr><td><div class='swdbindexl ml0'><span class='fr'>" + //NO I18N
            "<a href='/' id='totalSoftware' class='swdbindexc'>" + total + //NO I18N
            "</a></span><span>" + getMessageForKey('sdp.common.total') + "</span></div></td></tr>"; //NO I18N

        for (var i = 0; i < len; i++) {
            var id = allSWCountList[i].name.toLowerCase() + 'Software'; //NO I18N

            if (allSWCountList[i].name == "Managed") {
                swType = getMessageForKey('sdp.software.home.managedhaed'); //NO I18N
            } else if (allSWCountList[i].name == "UnIdentified") {
                swType = getMessageForKey('sdp.software.home.unidentifiedhead'); //NO I18N
            } else if (allSWCountList[i].name == "Prohibited") {
                swType = getMessageForKey('sdp.software.home.prohibitedhead'); //NO I18N
            } else if (allSWCountList[i].name == "Freeware") {
                swType = getMessageForKey('sdp.software.home.freewarehead'); //NO I18N
            } else if (allSWCountList[i].name == "Shareware") {
                swType = getMessageForKey('sdp.software.home.sharewarehead'); //NO I18N
            } else if (allSWCountList[i].name == "Excluded") {
                swType = getMessageForKey('sdp.software.home.excludedhead'); //NO I18N
            } else {
                swType = allSWCountList[i].name;
                id = allSWCountList[i].id + '_SoftwareType'; //NO I18N
            }

            content += "<tr><td><div class='swdbindexl ml0'><span class='fr'>" + //NO I18N
                "<a id='" + encodeHTMLAttribute(id) + "' href='/' class='swdbindexc' data-id='" + allSWCountList[i].id + "'>" + //NO I18N
                allSWCountList[i].count +
                "</a></span><span>" + encodeHTML(swType) + "</span></div></td></tr>"; //NO I18N
        }

        jQuery("#softwarecountlist").append(content);

        jQuery("#softwarecountlist").on('click', '.swdbindexc', function() {
            var softwareId = jQuery(this).data('id'); //NO I18N
            var elementId = jQuery(this).attr('id'); //NO I18N
            showSoftwareListView(document.getElementById(elementId), softwareId);
        });
        jQuery("#totalSoftware").on('click', function() {
            showSoftwareListView(document.getElementById("totalSoftware"), null); //NO I18N
        });
    }
}
//This code should be removed after mickey client movement
jQuery(document).ready(function(){// Issue fix #45514
    	jQuery(document).on('click','#AllSoftwareLicenceView_CCBtn',function(){//No I18N
            setTimeout(function(){
                jQuery('#_DIALOG_LAYER').addClass('temp-digpos');//No I18N
            },350);
	});
	spInit(); // SD-#101979
});
//This code should be removed after mickey client movement
