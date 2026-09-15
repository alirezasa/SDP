
/* $Id$ */
/**
* Script containing all asset module functions
* @date 12-15-2007
* @author Murugesan K
*/

var formObj;
var isCallingFirstTime = true;
var executed = false;
var currentForm = null;
var isNewAsset = true;
var isAssetAttached = 'false'; //NO I18N
var siteUser;
var siteDept;
var uemProdNameJson;
var isActiveUser;
var assetAssignedType;
var currentAssetState; //During update operation,old asset state will be stored.
var isAttachedAssetOwnedByInactiveUser;

function AssetUtil( form )
{
    this.formObj = form;
}
AssetUtil.setSiteUser = function ( siteUser )
{
    this.siteUser = siteUser;
}

AssetUtil.getSiteUser = function ()
{
    return this.siteUser;
}

AssetUtil.setSiteDepartment = function ( siteDept )
{
    this.siteDept = siteDept;
}

AssetUtil.getSiteDepartment = function ()
{
    return this.siteDept;
}

AssetUtil.prototype.getAssignedType = function(){
    return this.assetAssignedType;
}

AssetUtil.prototype.setAssignedType = function(assetAssignedType){
    this.assetAssignedType = assetAssignedType;
}

AssetUtil.prototype.setIsActiveUser = function(isActiveUser){
    this.isActiveUser = isActiveUser;
}

AssetUtil.prototype.getIsActiveUser = function(){
    return this.isActiveUser;
}

AssetUtil.prototype.getAssetState = function(){
    return this.currentAssetState;
}

AssetUtil.prototype.setAssetState = function(state){
    this.currentAssetState = state;
}

AssetUtil.prototype.setIsAttachedAssetOwnedByInactiveUser = function(isAttachedAssetOwnedByInactiveUser){
    this.isAttachedAssetOwnedByInactiveUser = isAttachedAssetOwnedByInactiveUser;
}

AssetUtil.prototype.getIsAttachedAssetOwnedByInactiveUser = function(){
    return this.isAttachedAssetOwnedByInactiveUser;
}

AssetUtil.prototype.updateSiteDeptDetails = function ()
{
    var param = "action=get_associated_site_depts";//NO I18N

    if( this.formObj.site != undefined )
    {
        param += "&siteId=" + this.formObj.site.value;//NO I18N
    }
    callCustomAjaxRequestForGET('/servlet/AJaxServlet', param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_associated_site_depts');//NO I18N
}
AssetUtil.prototype.selectSiteForDept = function ()
{
    var department = this.formObj.department.value;

    if( department != null )
    {
        var param = "action=select_site_associated_dept&deptid=" + department;//NO I18N

        if( this.formObj.site != undefined )
        {
            param += "&siteId=" + this.formObj.site.value;//NO I18N
        }
        callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'select_site_associated_dept');//NO I18N
    }
}
AssetUtil.prototype.selectSiteForAsset = function ()
{
    executed = false;
    this.isAttachedAssetOwnedByInactiveUser = false;
    var asset = this.formObj.asset.value;
    if( asset != null )
    {
        var param = "action=select_site_associated_asset&assetid=" + asset;//NO I18N
        callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'select_site_associated_asset');//NO I18N
    }
}
AssetUtil.prototype.fetchWorkstations = function()
{
    var componentID = this.formObj.componentID.value;
    if( componentID != 0 )
    {
        callCustomAjaxRequestForGET("/servlet/AJaxServlet","action=get_unlicensed_sw_installations&compId=" + componentID, softwareAjaxRequestSuccess, ajaxRequestOnFailure, "get_unlicensed_sw_installations");//NO I18N
    }
    else
    {
        this.formObj.wsList.options.length = 0;
        this.formObj.associatedWsList.options.length = 0;
        //remove all workstations
    }
}
AssetUtil.prototype.isLicenseCountAvailable = function ()
{
    callCustomAjaxRequestForGET('/servlet/ClientUtilServlet', "mode=checkLicenseCount&componentId=" + this.formObj.componentID.value, ajaxRequestOnSuccess, ajaxRequestOnFailure, 'license_check');//NO I18N
}
AssetUtil.prototype.setAssetAttachedStatus = function ( isAssetAttached )
{
    this.isAssetAttached = isAssetAttached;
}
AssetUtil.prototype.callAddItem = function ()
{
    var item = this.formObj.componentID;
    var typeId = "";
    if (this.formObj.typeId != null)
    {
        typeId = this.formObj.typeId.value;
    }
    len = item.options.length;
    var lastoption = new Option();
    item.options[len] = lastoption;
    item.options[len].selected = true;
    if(document.getElementById('SystemInfo_MODEL') != undefined){
        var ciItem = document.getElementById('SystemInfo_MODEL');
        len = ciItem.options.length;
        var lastoption = new Option();
        ciItem.options[len] = lastoption;
        ciItem.options[len].selected = true;
    }
    NewWindow(encodeURI('ProductDef.do?mode=add_new&toShowView=addForm&popup=true&tempItemID=document.' + this.formObj.name + '.componentID.options['+len+']&tempPrice=document.' + this.formObj.name + '.assetPrice&isNewAssetPage=true&typeId='+typeId),'addNewItem','450','230','yes','center');//NO I18N
}
AssetUtil.prototype.callAddModel = function (edition)
{

    var item = this.formObj.wsModel;

    var typeId = jQuery('#componentType').val();

    if( edition != undefined && edition == 'cmdb' )
    {
        item = this.formObj.CI_SystemInfo_MODEL;
    }
    len = item.options.length;
    var lastoption = new Option();
    item.options[len] = lastoption;
    item.options[len].selected = true;
    if( edition != undefined && edition == 'cmdb' )
    {
        NewWindow(encodeURI('ProductDef.do?mode=add_new&toShowView=addForm&popup=true&tempModelName=document.' + this.formObj.name + '.CI_SystemInfo_MODEL.options['+len+']&tempManufacturer=document.' + this.formObj.name + '.wsManufacturer&isNewAssetPage=false&componentType='+typeId+'&wsType=Desktop&addmodel=true'),'addNewItem','450','275','yes','center');//NO I18N
    }
    else
    {
        NewWindow(encodeURI('ProductDef.do?mode=add_new&toShowView=addForm&popup=true&tempModelName=document.' + this.formObj.name + '.wsModel.options['+len+']&tempManufacturer=document.' + this.formObj.name + '.wsManufacturer&isNewAssetPage=false&componentType='+typeId+'&wsType=Desktop&addmodel=true'),'addNewItem','450','275','yes','center');//NO I18N
    }
}
AssetUtil.prototype.callAddSoftware = function ()
{
    itm = AssetUtil.getCurrentForm().componentID;
    len = itm.options.length;
    var lastoption = new Option();
    itm.options[len] = lastoption;
    itm.options[len].selected = true;
    NewWindow(encodeURI('ProductDef.do?mode=add_new&toShowView=addForm&popupSW=true&tempItemID=document.SoftwareLicense.componentID.options['+len+']'),'addNewItem','750','310','yes','center');//NO I18N
    //NewWindow('/asset/AddFormSoftware.jsp','addNewItem','350','235','yes','center');
}
AssetUtil.prototype.fetchUserDepartment = function ()
{
    executed = false;
    this.isActiveUser = true;
    var user = this.formObj.user.value;
    var siteId = this.formObj.site.value;
    if (user != null && user != '0' && user != "")
    {
        var param = "action=get_associated_user_dept_for_assets&userId=" + user;//NO I18N

        callCustomAjaxRequest("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_associated_user_dept_for_assets');//NO I18N
    }
}
AssetUtil.prototype.fetchDepartments = function ()
{
    var user = this.formObj.user.value;
    if (user != null && user != '0' && user != ""  )
    {
        var param = "action=get_associated_user_dept_for_assets&userId=" + user;//NO I18N

        if( this.formObj.site != undefined && this.formObj.site.value > 0 )
        {
            param += "&siteId=" + this.formObj.site.value;
        }
        callCustomAjaxRequest("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_associated_user_dept_for_assets');//NO I18N
    }
    else
    {
        this.formObj.department.value = "0";
    }
}
AssetUtil.prototype.validateFieldValues = function (oldComponentId)
{
    try
    {
        if( !isValidData(this.formObj.assetName,'','text', getMessageForKey("sdp.inventory.detailAsset.invalidAssetNameMsg")) ) return false;
        if( !isValidData(this.formObj.assetPrice,'','double', getMessageForKey("sdp.inventory.detailAsset.invalidCostMsg")) ) return false;
        if( !isValidData(this.formObj.componentID,0,'pinteger', getMessageForKey("sdp.inventory.detailAsset.prodNameMsg")) ) return false;
    }
    catch(e)
    {
        alert(e.message);
    }

    //Check for non admin
    if( !this.formObj.site.options.length > 0 )
    {
        alert(getMessageForKey("ae.software.choose.site")); //NO I18N
        new Effect.ScrollTo(this.formObj.site.id);
        return false;
    }

    var product = this.formObj.componentID.value;
    if (oldComponentId != null && product != oldComponentId)
    {
        modifyProductName = confirm("Are you sure to modify the Product Name");//NO I18N
        if (!modifyProductName)
        {
            return false;
        }
    }

    for( i=1; i<=4; i++ )
    {
        if( document.getElementById("UDF_LONG" + i) != undefined )
        {
            if( trim(document.getElementById("UDF_LONG" + i).innerHTML) != "" && !isValidData(document.getElementById("UDF_LONG" + i),'','integer','Invalid input value specified [' + document.getElementById("ALIAS_UDF_LONG" + i).innerHTML + ']') ) return false;
        }
    }

    var rState = this.formObj.resourceState.value;
    var stateJSON = getResourceStateDetails(rState);
    var isOwnershipEnabled = stateJSON.maintainownership;
    var isLeased = this.formObj.isLeased.checked;


    if (isOwnershipEnabled)
    {
        var assignedType;

        if( this.formObj.assignedType.length != undefined )
        {
            var assignedTypeSize = this.formObj.assignedType.length;
            for (var i=0;i<assignedTypeSize;i++)
            {
                if (this.formObj.assignedType[i].checked==true)
                {
                    assignedType = this.formObj.assignedType[i].value;
                }
            }
        }
        else
        {
            assignedType = this.formObj.assignedType.value;
        }

        if (assignedType == 'Assign')
        {
            var user = this.formObj.user.value;
            var dept = this.formObj.department.value;

            if(user == '0' && dept == '0')
            {
                alert(getMessageForKey("sdp.inventory.assignownertoWS.jserror"));
                return false;
            }
            this.formObj.isStateChange.value="false";//NO I18N

            var isLeased = this.formObj.isLeased.checked;
            if (this.formObj.isLeased.checked)
            {
                var startTime = this.formObj.leaseStart.value;
                var endTime = this.formObj.leaseEnd.value;

                if (startTime == '')
                {
                    alert(getMessageForKey("sdp.inventory.assignownertoWS.jserror1"));
                    return false;
                }

                if (endTime == '')
                {
                    alert(getMessageForKey("sdp.inventory.assignownertoWS.jserror2"));
                    return false;
                }
                if(user == '0')
                {
                    alert(getMessageForKey("sdp.asset.loan.assets.nousererror"));
                    return false;
                }
            }
        }
        else
        {
            var asset = this.formObj.asset.value;
            if (asset == '0')
            {
                alert(getMessageForKey("sdp.inventory.assignownertoWS.jserror3"));
                return false;
            }
        }

    }
    if(this.formObj.ciName != undefined )
    {
        return false;
    }
    return true;
}

AssetUtil.prototype.onLoadCall = function (temp)
{
    if(temp=='assetName')
    {
        this.formObj.assetName.focus();
    }
    else if(temp=='ownerID')
    {
        this.formObj.ownerID.focus();
    }
    loadme();
}
AssetUtil.prototype.call = function()
{
    //  alert('Summa');
}

AssetUtil.removeAllOptionTags = function ( selectTagObj )
{
    var valStr = selectTagObj.options[0].innerHTML;
    var val = selectTagObj.options[0].value;
    selectTagObj.innerHTML = null;
    selectTagObj.options[0] = new Option(valStr, val);
}
AssetUtil.isContainsValue = function ( selectTagObj, value )
{
    var length = selectTagObj.options.length;
    for( i=0; i<length; i++ )
    {
        if(selectTagObj.options[i].value == value)
        {
            return true;
        }
    }
    return false;
}
AssetUtil.removeCompleteOptionTags = function ( selectTagObj )
{
    var length = selectTagObj.options.length;
    for( i=0; i<length; i++ )
    {
        selectTagObj.options[i] = null;
    }
    selectTagObj.options.length = 0;
}
AssetUtil.setMode = function ( isNewAsset )
{
    this.isNewAsset = isNewAsset;
}

AssetUtil.getMode = function ()
{
    return this.isNewAsset;
}

AssetUtil.updateSiteUserDetails = function ()
{
    var param = "action=get_associated_site_users";//NO I18N

    if( AssetUtil.getCurrentForm().site != undefined )
    {
        if( AssetUtil.getCurrentForm().site.value != "-1" )
        {
            param += "&siteId=" + AssetUtil.getCurrentForm().site.value;//NO I18N
        }
    }

    callCustomAjaxRequestForGET('/servlet/AJaxServlet', param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_associated_site_users');//NO I18N
}

AssetUtil.fetchSiteUsers = function ()
{
    var param = "action=get_associated_site_users";//NO I18N

    if( document.getElementById('allsites') != undefined )
    {
        if( document.getElementById('allsites').value != "-1" )
        {
            param += "&siteId=" + document.getElementById('allsites').value;//NO I18N
        }
    }

    callCustomAjaxRequestForGET('/servlet/AJaxServlet', param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_site_users');//NO I18N
}

AssetUtil.setFirstTimeCall = function( isFirstTime )
{
    this.isCallingFirstTime = isFirstTime;
}

AssetUtil.getFirstTimeCall = function()
{
    return this.isCallingFirstTime;
}
AssetUtil.setCurrentForm = function( currentForm )
{
    this.currentForm = currentForm;
}
AssetUtil.getCurrentForm = function ()
{
    return this.currentForm;
}

function addAgreementOnFailure ( requestObj, module )
{
    if( 'add_license_agreement' == module )
    {
        closeModalDialog();
        Hide('loadingdivid');//No I18N
        if(requestObj.status==203){

            Effect.ScrollTo('displayAttachments');//No I18N
            showBaloonToolTip('displayAttachments', requestObj.responseText);//No I18N
        }
        else if(requestObj.status==202){
            new Effect.ScrollTo('agreementNumber');//No I18N
            showBaloonToolTip('agreementNumber',  getMessageForKey("sdp.admin.common.samename.jscheck", [getMessageForKey("sdp.software.license.agreement.new")]));//No I18N
        }
        else{
            new Effect.ScrollTo('agreementNumber');//No I18N
            showBaloonToolTip('agreementNumber', requestObj.statusText);//No I18N
        }
    }
    else
    {
        alert(requestObj.statusText);
    }
}

function ajaxRequestOnFailure ( requestObj, module )
{
    if( 'add_license_agreement' == module )
    {
        closeModalDialog();
        Hide('loadingdivid');//No I18N
        new Effect.ScrollTo('agreementNumber');//No I18N
        showBaloonToolTip('agreementNumber', requestObj.statusText);//No I18N
    }
    else
    {
        alert(requestObj.statusText);
    }
}
function ajaxRequestOnSuccess( req, module )
{
    if( module == 'license_check' )
    {
        var requiredVal = req.responseXML.getElementsByTagName("isLicenseCountAvailable")[0].childNodes[0].nodeValue;

        if (requiredVal == "true")
        {
            Show('assetState'); //NO I18N
            var isCompVal = req.responseXML.getElementsByTagName("isComp")[0].childNodes[0].nodeValue;
            if (isCompVal == 'Component')
            {
                try
                {
                    var assignedTypeSize = AssetUtil.getCurrentForm().assignedType.length;
                    for (var i=0;i<assignedTypeSize;i++)
                    {
                        if (AssetUtil.getCurrentForm().assignedType[i].value=="Associate")
                        {
                            AssetUtil.getCurrentForm().assignedType[i].checked=true;
                        }
                    }
                    Hide("hideAssign");Show("associateTo1");Hide("assignTo1");//NO I18N
                    isComponent = true;

                    //If the component in 'In Use' state then need to disable the site
                    if( document.getElementById('resourceState').value == 2 )
                    {
                        AssetUtil.getCurrentForm().site.disabled=true;
                    }
                    else
                    {
                        AssetUtil.getCurrentForm().site.disabled=false;
                    }
                }
                catch(ex)
                {
                }
            }
            else
            {
                try
                {
                    isComponent = false;
                    AssetUtil.getCurrentForm().site.disabled=false;
                    Show("hideRadio");Show("hideAssign");//NO I18N
                }
                catch(ex)
                {
                }
            }
        }
        else
        {
            var keyText = req.responseXML.getElementsByTagName("NoOfDevices")[0].childNodes[0].nodeValue;
            alert(getMessageForKey("sdp.inventory.operationstatus.maxout") + " " + keyText + " " + getMessageForKey("sdp.inventory.operationstatus.itassets") + " " + getMessageForKey("sdp.inventory.operationstatus.uppgradelicense"));
        }
        //AssetUtil.getCurrentForm().assetName.trigger('focus');
    }
    else if( module == 'update_product_vendors' )
    {
        document.getElementById('productvendorlist').innerHTML = req.responseText;
        var scrObjs = document.getElementById('productvendorlist').getElementsByTagName("script");
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
                newScript.nonce = sdpNonce;

                document.getElementsByTagName("head")[0].appendChild(newScript);
            }
            catch(e){}
        }
    }
    else if( module == 'add_vendor' )
    {
        document.ProductVendorForm.productVendorId.value = '';

        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.common.addedsuccessfully').innerHTML, true, 2000)},1000);//NO I18N
            document.ProductVendorForm.vendor.value = '';
            document.ProductVendorForm.price.value = '';
            document.ProductVendorForm.warrantyYrs.value = '0';
            document.ProductVendorForm.warrantyMths.value = '0';
            document.ProductVendorForm.maintanenceVendor.value = '';
            document.ProductVendorForm.comments.value = '';
            refreshSubView(getPortalViewName('ProductVendorView'));//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'save_product' || module == 'save_and_add_new_product' || module =='save_product_update' || module == 'save_and_add_new_product_update' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductView'));//NO I18N

            if( module == 'save_product_update' || module == 'save_and_add_new_product_update' )
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif', getMessageForKey("sdp.admin.common.updatedsuccessfully"), true, 2000)},1000);//NO I18N
                document.ProductDefForm.mode.value = "add";//No I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif', getMessageForKey("sdp.admin.common.addedsuccessfully"), true, 2000)},1000);//NO I18N
            }

            document.ProductDefForm.name.value = "";//NO I18N

            if( module == 'save_product' || module == 'save_product_update')
            {
                setTimeout(function(){new Effect.toggle($('sform'),'Slide');changeProductText()},3000);//NO I18N
            }
            else
            {
                document.ProductDefForm.name.focus();
            }

            while ( document.ProductDefForm.associatedSoftwareList.options.length > 0 )
            {
                document.ProductDefForm.associatedSoftwareList.remove(0);
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }

    }
    else if( module == 'save_product_type' ||  module == 'save_and_add_new_product_type' || module == 'save_product_type_update' || module == 'save_and_add_new_product_type_update' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductTypeView'));//NO I18N

            if( module == 'save_product_type_update' || module == 'save_and_add_new_product_type_update' )
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey("sdp.admin.common.updatedsuccessfully"), true, 2000)},1000);//NO I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey("sdp.admin.common.addedsuccessfully"), true, 2000)},1000);//NO I18N
            }

            if( module == 'save_and_add_new_product_type_update' )
            {
                document.ProductTypeDefForm.mode.value = "add";//No I18N
            }

            document.ProductTypeDefForm.name.value = "";//NO I18N
            if( module == 'save_product_type' || module == 'save_product_type_update')
            {
                document.ProductTypeDefForm.resourceType.value = "Select";//NO I18N
                document.ProductTypeDefForm.category.value = "Select";//NO I18N
                setTimeout(function(){new Effect.toggle($('sform'),'Slide');changeProductTypeText()},3000);//NO I18N
            }
            else
            {
                document.ProductTypeDefForm.name.focus();
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
        }
    }
    else if( module == 'edit_product_vendor' )
    {
        var result = req.responseXML;

        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            document.ProductVendorForm.productVendorId.value = result.getElementsByTagName("COMPONENTVENDORID")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.vendor.value = result.getElementsByTagName("VENDORID")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.price.value = result.getElementsByTagName("COMPONENTPRICE")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.warrantyYrs.value = result.getElementsByTagName("WARRANTYPERIODYRS")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.warrantyMths.value = result.getElementsByTagName("WARRANTYPERIODMTHS")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.maintanenceVendor.value = result.getElementsByTagName("MAINTVENDORID")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.comments.value = result.getElementsByTagName("COMMENTS")[0].childNodes[0].nodeValue;//NO I18N
            document.getElementById('loadingdivid').style.display = 'none';//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = result.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'edit_product' )
    {
        var result = req.responseXML;

        document.getElementById('loadingdivid').style.display = 'none';

        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            if( document.getElementById('sform').style.display == 'none' )
            {
                changeProductText();
                //new Effect.toggle($('sform'),'Slide');//No I18N
                Show('sform');
            }
            try
            {
                var productId = result.getElementsByTagName("ID")[0].childNodes[0].nodeValue;
                var productName = result.getElementsByTagName("COMPONENTNAME")[0].childNodes[0].nodeValue;
                var manufacturer = '-';//No I18N
                if( result.getElementsByTagName("MANUFACTURERNAME")[0].childNodes[0] != undefined )
                {
                    manufacturer = result.getElementsByTagName("MANUFACTURERNAME")[0].childNodes[0].nodeValue;
                }
                var productTypeId = result.getElementsByTagName("COMPONENTTYPEID")[0].childNodes[0].nodeValue;
                var partNo = result.getElementsByTagName("PARTNO")[0].childNodes[0].nodeValue;
                var cost = result.getElementsByTagName("COST")[0].childNodes[0].nodeValue;
                var comments = result.getElementsByTagName("COMMENTS")[0].childNodes[0].nodeValue;
                var wsType = result.getElementsByTagName("WSTYPE")[0].childNodes[0].nodeValue;
                var licenseType = result.getElementsByTagName("LICENSETYPE")[0].childNodes[0].nodeValue;

                while ( document.ProductDefForm.associatedSoftwareList.options.length > 0 )
                {
                    document.ProductDefForm.associatedSoftwareList.remove(0);
                }

                if( result.getElementsByTagName("SOFTWARE") != undefined  && result.getElementsByTagName("SOFTWARE").length > 0)
                {
                    var len = result.getElementsByTagName("SOFTWARE").length;

                    var optionSize = document.ProductDefForm.associatedSoftwareList.options.length;

                    for( i=0; i<len; i++ )
                    {
                        document.ProductDefForm.associatedSoftwareList.options[ optionSize + i ] = new Option(result.getElementsByTagName("SOFTWARE")[i].childNodes[0].nodeValue, result.getElementsByTagName("SOFTWARE")[i].getAttribute("id"));

                        var opt = document.ProductDefForm.associatedSoftwareList.options[ optionSize + i ];

                        if (i == 0)
                        {
                            opt.className = 'optparent'; //NO I18n
                            var val = opt.innerHTML;
                            if (val.indexOf("&nbsp;") != -1)
                            {
                                opt.innerHTML = val.substring(18,val.length);
                            }
                        }
                        else
                        {
                            opt.className = 'optchild'; //NO I18n
                            var val = opt.innerHTML;
                            if (val.indexOf("&nbsp;") == -1)
                            {
                                opt.innerHTML = '&nbsp;&nbsp;&nbsp;' + opt.innerHTML;//NO I18n
                            }
                        }
                    }

                    }

                document.ProductDefForm.componentType.value = productTypeId;
                document.ProductDefForm.name.value = productName;
                document.ProductDefForm.manufacturer.value = manufacturer;
                document.ProductDefForm.partNo.value = partNo;
                if(document.ProductDefForm.cost != undefined){
                    document.ProductDefForm.cost.value = cost;
                }
                document.ProductDefForm.description.value = comments;
                document.ProductDefForm.itemID.value = productId;
                if( document.ProductVendorForm != undefined )
                {
                    document.ProductVendorForm.itemID.value = productId;
                }

                if( "Desktop" == wsType )
                {
                    document.ProductDefForm.wsType[0].checked = true;
                }
                else
                {
                    document.ProductDefForm.wsType[1].checked = true;
                }

                setWsType();

                ShowProductTab('productDetails');//NO I18n
        }
            catch(e)
            {
                document.getElementById('loadingdivid').style.display = 'none';
                document.getElementById('errorMessageTag').innerHTML =  e.message;
                ShowHide('operation_status');//NO I18N
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML =  addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue ;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'edit_product_type' )
    {
        var result = req.responseXML;

        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            var productTypeId = result.getElementsByTagName("ID")[0].childNodes[0].nodeValue;
            var productTypeName = result.getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
            var isDefault = result.getElementsByTagName("DEFAULT")[0].childNodes[0].nodeValue;
            var description = '';
            try
            {
                description = result.getElementsByTagName("DESCRIPTION")[0].childNodes[0].nodeValue;
            }
            catch(e)
            {
            }

            var category = result.getElementsByTagName("CATEGORY")[0].childNodes[0].nodeValue;
            var resourceType = result.getElementsByTagName("RESOURCETYPE")[0].childNodes[0].nodeValue;
            var isSoftware = result.getElementsByTagName("ISSOFTWARE")[0].childNodes[0].nodeValue;

            document.ProductTypeDefForm.name.value = productTypeName;
            document.ProductTypeDefForm.itemID.value = productTypeId;
            if(isSoftware == "true")
            {
                resourceTypeSelect.options[resourceTypeSelect.options.length] = new Option("Software", resourceType);
            }
            else
            {
                if(resourceTypeSelect.options.length > 4)
                {
                    //resourceTypeSelect.remove(4);
                    jQuery("#resourceType option:last").remove();
                }
            }
            document.ProductTypeDefForm.resourceType.value = resourceType;
            document.ProductTypeDefForm.category.value = category;
            document.ProductTypeDefForm.description.value = description;
            if(isDefault == "true")
            {
                document.ProductTypeDefForm.resourceType.disabled = true;
                document.ProductTypeDefForm.category.disabled = true;
                document.ProductTypeDefForm.resourceType.className = "TFDisabled";
                document.ProductTypeDefForm.category.className = "TFDisabled";
            }
            else
            {
                document.ProductTypeDefForm.resourceType.disabled = false;
                document.ProductTypeDefForm.category.disabled = false;
                document.ProductTypeDefForm.resourceType.className = "form-control";
                document.ProductTypeDefForm.category.className = "form-control";
            }
            try
            {
                document.ProductTypeDefForm.asset.value = result.getElementsByTagName("PREVIOUSTYPE")[0].childNodes[0].nodeValue;
            }
            catch(ex) {}

            if( document.getElementById('sform').style.display == 'none' )
            {
                changeProductTypeText();
                //new Effect.toggle($('sform'),'Slide');//No I18N
                Show('sform');
            }
            document.getElementById('loadingdivid').style.display = 'none';
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML =  addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue ;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'delete_vendor' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductVendorView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.backup.file.delete.success.msg').innerHTML, true, 2000)},1000);//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
        }
    }
    else if( module == 'delete_product' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.backup.file.delete.success.msg').innerHTML, true, 2000)},1000);//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
        }
    }
    else if( module == 'delete_product_types' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductTypeView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey("sdp.admin.common.deletedsuccessfully"), true, 2000)},1000);//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
        }
    }
    else if( module == 'check_remote_server_availability' )
    {
        alert(req.responseText);
    }
    else if( module == 'get_remote_server_folders' )
    {
        var dirXml = req.responseXML;

        if( dirXml.getElementsByTagName("error").length > 0 )
        {
            alert(dirXml.getElementsByTagName("error")[0].childNodes[0].nodeValue);
            return false;
        }
        else
        {
            alert(req.responseText);
            var directories = dirXml.getElementsByTagName("start");

            var length = directories.length;

            alert(length);

            for( i=0; i<length; i++ )
            {
                alert(directories[i].childNodes[0].nodeValue);
            }
        }
    }
    else if( module == 'get_site_users' )
    {
        if( document.getElementById('userList') != undefined )
        {
            var userList = document.getElementById('userList');
            AssetUtil.removeCompleteOptionTags(userList);

            var optionSize = userList.options.length;
            var userObj = req.responseXML.getElementsByTagName("AaaUser");
            var length = userObj.length;
            for( i=0; i<length; i++ )
            {
                userList.options[ optionSize + i ] = new Option(userObj[i].getAttribute("first_name"), userObj[i].getAttribute("user_id"));
            }
        }
        if( AssetUtil.getCurrentForm().licenseOption.value == 3 || AssetUtil.getCurrentForm().licenseOption.value == 4 )
        {
            updateInstalledServerNames(document.getElementById('componentID'));
        }
    }
    else if( module == 'get_unlicensed_users' )
    {
        try
        {
            var ws = req.responseXML.getElementsByTagName("AaaUser");
            var swList = req.responseXML.getElementsByTagName("SoftwareInfo");
            var optionSize = document.getElementById('unlicensedWSList').options.length;
            var length = ws.length;
            for( i=0; i<length; i++ )
            {
                if( swList.length == 0 )
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(ws[i].getAttribute("first_name"), ws[i].getAttribute("user_id"));
                }
                else
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(ws[i].getAttribute("first_name"), ws[i].getAttribute("user_id") + "," + swList[i].getAttribute("softwareid"));//NO I18N
                }
            }

            if( length == 0 )
            {
                document.getElementById('nodatadiv_data').innerHTML = '<b>'+document.getElementById("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg").innerHTML+'</b>';//NO I18N
                Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
            }
        }
        catch(e)
        {
            document.getElementById('nodatadiv_data').innerHTML = '<b>' + req.responseText + '</b>';//NO I18N
            Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
        }
        Hide('centerstatus');//NO I18N
        changeSearchText(document.getElementById('searchBox'));
    }
    else if( module == 'get_unlicensed_sw_installations' )
    {
        try
        {
            var ws = req.responseXML.getElementsByTagName("Resources");
            var optionSize = AssetUtil.getCurrentForm().wsList.options.length;
            var length = ws.length;
            for( i=0; i<length; i++ )
            {
                AssetUtil.getCurrentForm().wsList.options[ optionSize + i ] = new Option(ws[i].getAttribute("resourcename"), ws[i].getAttribute("resourceid"));
            }
        }
        catch(e)
        {
            alert(e);
        }
    }
    else if( module == 'get_associated_site_depts' )
    {
        AssetUtil.removeAllOptionTags(AssetUtil.getCurrentForm().department);
        var optionSize = AssetUtil.getCurrentForm().department.options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            AssetUtil.getCurrentForm().department.options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }

        AssetUtil.updateSiteUserDetails();
    }
    else if( module == 'get_site_depts_for_allocate_site_page' )
    {
        var department = AssetUtil.getCurrentForm().departmentName;
        if(department == null) {
            department = AssetUtil.getCurrentForm().department;
        }
        AssetUtil.removeAllOptionTags(department);
        var optionSize = department.options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            department.options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
    }
    else if( module == 'update_departments_only' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('department'));
        var optionSize = document.getElementById('department').options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            document.getElementById('department').options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
    }
    else if( module == 'update_departments' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('department'));
        var optionSize = document.getElementById('department').options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            document.getElementById('department').options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
        AssetUtil.fetchSiteUsers();
    }
    else if( module == 'get_installed_ws' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('associatedServer'));

        var wsList = req.responseXML.getElementsByTagName("Resources");

        var length = wsList.length;
        for( i=1; i<=length; i++ )
        {
            document.getElementById('associatedServer').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
        }

    }
    else if( module == 'get_unlicensed_ws' )
    {
        try
        {
            AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));
            var optionSize = document.getElementById('unlicensedWSList').options.length;
            var wsList = req.responseXML.getElementsByTagName("Resources");
            var swList = req.responseXML.getElementsByTagName("SoftwareInfo");
            var length = wsList.length;
            for( i=0; i<length; i++ )
            {
                if( swList.length == 0 )
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(wsList[i].getAttribute("resourcename"), wsList[i].getAttribute("resourceid"));
                }
                else
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(wsList[i].getAttribute("resourcename"), wsList[i].getAttribute("resourceid") + "," + swList[i].getAttribute("softwareid"));//NO I18N
                }
            }

            var currentLicenseType = document.getElementById('licenseType').value;

            var len = document.getElementById('unlicensedWSList').length;

            if( currentLicenseType == 3 ) //Enterprise
            {
                if( len > 0 )
                {
                    for(i=0;i<len;i++)
                    {
                        document.getElementById('unlicensedWSList').options[i].selected = true;
                    }
                    copyListValues('unlicensedWSList','allocateToWSList', null);//NO I18N
                }
            }
            if( len == 0 )
            {
                document.getElementById('nodatadiv_data').innerHTML = '<b>'+document.getElementById("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg").innerHTML+'</b>';//NO I18N
                Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
            }
        }
        catch(e)
        {
            document.getElementById('nodatadiv_data').innerHTML = '<b>' + req.responseText + '</b>';//NO I18N
            Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
        }

        Hide('centerstatus');//NO I18N
        changeSearchText(document.getElementById('searchBox'));
    }
    else if( module == 'allocate_cal_license' || module == 'delete_cal_license' )
    {
        if( req.responseText == 'success' )
        {
            try
            {
                refreshSubView(getPortalViewName('CALSummaryListView'));//NO I18N
            }catch(e){}

            try
            {
                if( jQuery('#swManufacturer').val() > 0 )
                {
                    reloadListview('alllicenses', JSON.parse('{"SoftwareLicenseTypes:SWMANUFACTURERID":' + jQuery('#swManufacturer').val() + ', "licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
                }
                else
                {
                    reloadListview('alllicenses', JSON.parse('{"licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
                }
            }
            catch(e){}
            parent.closeDialog();
        }
        else
        {
            alert(req.responseText);
        }
    }
    else if( module == 'get_license_mode' )
    {
        AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().licenseMode);
        var optionSize = AssetUtil.getCurrentForm().licenseMode.options.length;
        var licenseMode = req.responseXML.getElementsByTagName("SoftwareLicenseMode");
        var length = licenseMode.length;
        for( i=0; i<length; i++ )
        {
            AssetUtil.getCurrentForm().licenseMode.options[ optionSize + i ] = new Option(licenseMode[i].getAttribute("name"), licenseMode[i].getAttribute("licensemodeid"));
        }
    }
    else if( module == 'get_site_associated_dept' )
    {
        var siteObj = req.responseXML.getElementsByTagName("SDOrganization");
        var length = siteObj.length;
        if( length >= 1 )
        {
            AssetUtil.getCurrentForm().site.value = siteObj[0].getAttribute("org_id");
        }
        else
        {
            AssetUtil.getCurrentForm().site.value = "-1"; // No I18n
        }
    }
    else if( module == 'get_associated_user_dept_for_assets' )
    {
        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var dept;
        try
        {
            dept = deptObj[0].getAttribute("deptid");
        }
        catch(e)
        {
            dept = "0";
        }
        AssetUtil.getCurrentForm().department.value = dept;
    }
}



AssetUtil.updateDepartment = function()
{
    var param = "action=get_associated_site_depts";//NO I18N

    if( AssetUtil.getCurrentForm().site != undefined )
    {
        param += "&siteId=" + AssetUtil.getCurrentForm().site.value;//NO I18N
    }

    callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_site_depts_for_allocate_site_page');//NO I18N
}

AssetUtil.verifyAndUpdateDepartment = function () {

    if(AssetUtil.getCurrentForm().site.value != "0" || AssetUtil.getCurrentForm().site.value != "-1") {         // No i18n

        AssetUtil.updateDepartment();
    }
    else {

        var department = AssetUtil.getCurrentForm().departmentName;
        if(department == null) {
            department = AssetUtil.getCurrentForm().department;
        }
        AssetUtil.removeAllOptionTags(department);
    }
}

AssetUtil.selectSite = function()
{
    var param = "action=get_site_associated_dept";//NO I18N

    if( AssetUtil.getCurrentForm().departmentName != undefined )
    {
        param += "&deptid=" + AssetUtil.getCurrentForm().departmentName.value;//NO I18N
    }

    callCustomAjaxRequest("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_site_associated_dept');//NO I18N
}

AssetUtil.validateAssignToDeptPage = function()
{
  jQuery('#saveButton').hide();//NO I18N
  jQuery('#loadButton').show();//NO I18N

  var resourceIds = parent.getSelectedResources();

  if( resourceIds.split(';').length > 100 )
  {
    alert(getMessageForKey("ae.asset.change.state.performance.warn"));
  }

  document.AssignToDepartment.resourceIds.value = resourceIds;
  return true;
}

AssetUtil.prototype.calculatePOTotalCost = function()
{
    if( AssetUtil.getCurrentForm().licenseCount != undefined && trim(AssetUtil.getCurrentForm().licenseCount.value) != '' )
    {
        if( !isValidData(AssetUtil.getCurrentForm().licenseCount,'','pinteger', getMessageForKey("sdp.inventory.softwarelicense.licensejserror")) )
        {
            return false;
        }
    }

    if( AssetUtil.getCurrentForm().totalCost != undefined && AssetUtil.getCurrentForm().licenseCount != undefined )
    {
        AssetUtil.getCurrentForm().totalCost.value = parseInt(AssetUtil.getCurrentForm().licenseCount.value) * parseInt(AssetUtil.getCurrentForm().purchaseCost.value);
    }
}
function validateSWFieldValues()
{
    try
    {
      if( jQuery('#licenseCategory').val() == 'standard' || document.SoftwareLicense.operation.value == 'update' )
      {
        //Need to check the license name
        if(document.SoftwareLicense.operation.value == 'update')
        {
            if( trim(document.SoftwareLicense.licenseName.value) == '' )
            {
                showBaloonToolTip('licenseName', getMessageForKey('sdp.license.allocate.licensecantbeempty'));//No I18N
                return false;
            }
        }

        if( document.SoftwareLicense.operation.value != 'update' )
        {
            if( document.SoftwareLicense.componentID.value == 0 )
            {
                showBaloonToolTip('componentID', getMessageForKey('sdp.inventory.softwarelicense.licensejserror3'));//NO I18N
                return false;
            }
        }

        if(  document.getElementById('installationType').value != 'Unlimited' && document.SoftwareLicense.operation.value == 'add' ) //If not an enterprise license
        {
            if( trim(document.SoftwareLicense.licenseCount.value) == '' || !isPositiveInteger(document.SoftwareLicense.licenseCount.value) )
            {
                showBaloonToolTip('licenseCount', getMessageForKey('sdp.inventory.softwarelicense.licensejserror'));//NO I18N
                return false;
            }
            if( document.SoftwareLicense.licenseCount.value <= 0 )
            {
                showBaloonToolTip('licenseCount', getMessageForKey('sdp.inventory.softwarelicense.licensejserror'));//No I18N
                return false;
            }
        }

        var loption = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;

        if( document.getElementById('licenseOptionValue').value == "-1" )
        {
            showBaloonToolTip('licenseOptionValue', getMessageForKey('sdp.inventory.swLicense.selectLicenseOptionjsError'));
            return false;
        }

        if( document.getElementById('trackby').value == 'CAL' ) //For cal license
        {
            if( loption == "Per Processor" ) //License option is per processor
            {
                if( trim(document.SoftwareLicense.processorCount.value) == '' || !isPositiveInteger(document.SoftwareLicense.processorCount.value) || parseInt(document.SoftwareLicense.processorCount.value) <= 0 )
                {
                    showBaloonToolTip('processorCount', getMessageForKey('sdp.license.allocate.processorvalidcountwarn'));
                    return false;
                }
            }
            else
            {
                if( trim(document.SoftwareLicense.calLicenseCount.value) == '' || !isPositiveInteger(document.SoftwareLicense.calLicenseCount.value) || parseInt(document.SoftwareLicense.calLicenseCount.value) <= 0 )
                {
                    showBaloonToolTip('calLicenseCount', getMessageForKey('sdp.license.allocate.calvalidcountwarn'));
                    return false;
                }
            }
        }

        if( document.getElementById('installationType').value == 'Multiple'  ) //Volume license
        {
            if( trim(document.SoftwareLicense.installationCount.value) == '' || !isPositiveInteger(document.SoftwareLicense.installationCount.value) || parseInt(document.SoftwareLicense.installationCount.value) <= 0 )
            {
                showBaloonToolTip('installationCount', getMessageForKey('sdp.license.allocate.validinstallationcount'));
                return false;
            }

            if( document.SoftwareLicense.installedIn.value > parseInt(document.SoftwareLicense.installationCount.value) )
            {
                alert(getMessageForKey('sdp.license.allocate.alreadyallocatedwarn1') + " " + document.SoftwareLicense.installedIn.value + " " + getMessageForKey('sdp.license.allocate.alreadyallocatedwarn2'));
                return false;
            }
        }
         var anum=/(^\d+$)|(^\d+\.\d+$)/;
        if( trim(document.SoftwareLicense.purchaseCost.value) == '' || !anum.test(document.SoftwareLicense.purchaseCost.value) )
        {
            showBaloonToolTip('purchaseCost', getMessageForKey('sdp.inventory.detailAsset.invalidCostMsg'));
            return false;
        }

        if( document.getElementById('isnodelockedlicense') != undefined && document.getElementById('isnodelockedlicense').value == 'true' && document.SoftwareLicense.operation.value != 'renew' )
        {
            if( document.getElementById('allocateToWorkstation').value != -1 )
            {
                if( trim(document.getElementById('hostID').value) == '' )
                {
                    showBaloonToolTip('hostID', getMessageForKey('sdp.software.license.validation.hostid')); //NO I18N
                    return false;
                }
                if( trim(document.getElementById('OSName').value) == '' )
                {
                    showBaloonToolTip('OSName', getMessageForKey('sdp.software.license.validation.osname'));
                    return false;
                }
            }
        }

        if( document.getElementById('trackby').value == 'User' ) //Concurrent license
        {
            if( document.getElementById('userAccessType').value != 3 ) //Validation needed only if the access type is Single Or Multiple
            {
                if( trim(document.SoftwareLicense.noOfUsersAllowed.value) == '' || !isPositiveInteger(document.SoftwareLicense.noOfUsersAllowed.value) || parseInt(document.SoftwareLicense.noOfUsersAllowed.value) <= 0 )
                {
                                        showBaloonToolTip('usersAllowed', getMessageForKey('sdp.software.license.userlicvalidation'));//NO I18N
                                        return false;
                }
            }

                        if( jQuery('#licenseType option:selected').text() != 'Concurrent License' )
                        {
                            if( document.getElementById('userAccessType').value == 1 ) //Single user license
                            {
                                    if( document.getElementById('allocateToUser') != undefined )
                                    {
                                            var length = document.getElementById('allocateToUser').options.length;

                                            if( length > 1 )
                                            {
                                                    showBaloonToolTip('allocateToUser', getMessageForKey('sdp.admin.software.allocate.user'));
                                                    return false;
                                            }
                                    }
                            }
                            else if( document.getElementById('userAccessType').value == 2 ) //Multi user license
                            {
                                if( document.getElementById('allocateToUser') != undefined )
                                {
                                    var length = document.getElementById('allocateToUser').options.length;

                                    if( document.getElementById('usersAllowed').value < length )
                                    {
                                        showBaloonToolTip('allocateToUser', getMessageForKey('ae.software.user.license.validation'));//NO I18N
                                        return false;
                                    }
                                }
                            }
                        }
        }
        if( document.SoftwareLicense.allocateToWSList != undefined )
        {
            var currentLicenseType = document.SoftwareLicense.licenseType.value;
            var len = document.SoftwareLicense.allocateToWSList.length;

            if( len > 0 )
            {
                for(i=0;i<len;i++)
                {
                    document.SoftwareLicense.allocateToWSList.options[i].selected = false;
                }

                if( document.getElementById('trackby').value == 'CAL' ) //CAL
                {
                    var licenseCount = parseInt(document.SoftwareLicense.licenseCount.value) * parseInt(document.SoftwareLicense.calLicenseCount.value);

                    // No need of license check for 'Per Processor' license option because this is
                    //unlimited access
                    if( loption != 'Per Processor' )
                    {
                        if( !checkPurchaseVsInstalled(len, licenseCount) )
                        {
                            return false;
                        }
                    }
                }
                else if( document.getElementById('installationType').value == 'Single' || document.getElementById('installationType').value == 'OEM' ) //Individual or OEM
                {
                    var licenseCount = document.SoftwareLicense.licenseCount.value;

                    if( !checkPurchaseVsInstalled(len, licenseCount) )
                    {
                        return false;
                    }
                }
                else if( document.getElementById('installationType').value == 'Multiple' ) //Volume or Trial
                {
                    var licenseCount = parseInt(document.SoftwareLicense.licenseCount.value) * parseInt(document.SoftwareLicense.installationCount.value);
                    if( !checkPurchaseVsInstalled(len, licenseCount) )
                    {
                        return false;
                    }
                }

                len = document.SoftwareLicense.allocateToWSList.length;

                for(i=0;i<len;i++)
                {
                    document.SoftwareLicense.allocateToWSList.options[i].selected = true;
                }
            }
            if( document.getElementById('trackby').value == 'CAL' ) // Client Access License
            {
                var len = document.SoftwareLicense.allocateToWSList.length;

                if( len > 0 )
                {
                    for( i=0; i<len; i++ )
                    {
                        document.SoftwareLicense.allocateToWSList.options[i].selected = true;
                    }
                }
            }
        }

        if( document.SoftwareLicense.operation.value == 'update' )
        {
            var previousLicenseTypeID = document.SoftwareLicense.prevLicenseTypeID.value;
            var currentLicenseType = document.SoftwareLicense.licenseType.value;

            //If license is already allocated to any other workstation(s) then we need to ask the confirm dialog prompt
            if( previousLicenseTypeID != currentLicenseType && document.getElementById('licenseUsageStatus') != undefined && document.getElementById('licenseUsageStatus').value == 'true' )
            {
                if( !confirm(getMessageForKey('sdp.software.license.update.warnmsg1') + " '" + document.SoftwareLicense.prevLicenseType.value + "' " + getMessageForKey('sdp.purchase.history.to') + " '" + document.SoftwareLicense.licenseType[document.SoftwareLicense.licenseType.selectedIndex].innerHTML + " " + getMessageForKey('sdp.software.license.update.warnmsg2')) )
                {
                    return false;
                }
            }
        }
        for( i=1; i<=4; i++ )
        {
            if( document.getElementById("NUM_UDF_LONG" + i) != undefined )
            {
                if( trim(document.getElementById("NUM_UDF_LONG" + i).value) != "" )
                {
                    if( !isInteger(trim(document.getElementById("NUM_UDF_LONG" + i).value)) )
                    {
                        new Effect.ScrollTo("NUM_UDF_LONG" + i);//No I18N
                        showBaloonToolTip("NUM_UDF_LONG" + i, getMessageForKey('sdp.license.allocate.udfinvalidvaue'));//No I18N
                        return false;
                    }
                }
            }
        }
        for( i=1; i<=4; i++ )
        {
            if( document.getElementById("NUM_UDF_COST" + i) != undefined )
            {
                if( trim(document.getElementById("NUM_UDF_COST" + i).value) != "" )
                {
                    if( !isDouble(trim(document.getElementById("NUM_UDF_COST" + i).value)) )
                    {
                        new Effect.ScrollTo("NUM_UDF_COST" + i);//No I18N
                        showBaloonToolTip("NUM_UDF_COST" + i, getMessageForKey('sdp.inventory.resources.amountjserror1'));//No I18N
                        return false;
                    }
                }
            }
        }

        if( document.getElementById("notifyBefore") != undefined )
        {
            if( trim(document.getElementById("notifyBefore").value) != '' && document.getElementById('expiryDate').value == ''  )
            {
                if( document.getElementById('notifyToList').options.length > 0 )
                {
                    new Effect.ScrollTo(document.getElementById("expiryDate").id);
                    showBaloonToolTip('expiryDate', getMessageForKey('sdp.license.allocate.licenseexpirywarn'));
                    return false;
                }
            }

            if( trim(document.getElementById("notifyBefore").value) != '' )
            {
                if( trim(document.getElementById("notifyBefore").value) == '' || !isPositiveInteger(document.getElementById("notifyBefore").value) || parseInt(document.getElementById("notifyBefore").value) <= 0 )
                {
                    showBaloonToolTip('notifyBefore', getMessageForKey('sdp.contract.addNew.noteBefore'));
                    return false;
                }
            }
        }

        }
        else
        {
            if( document.SoftwareLicense.operation.value != 'update' )
            {
                if( document.SoftwareLicense.componentID.value == 0 )
                {
                    showBaloonToolTip('componentID', getMessageForKey('sdp.inventory.softwarelicense.licensejserror3'));//No I18N
                    return false;
                }
            }
            if( jQuery('#licensedSoftware').val() == '-1' )
            {
                showBaloonToolTip('licensedSoftware', getMessageForKey('sdp.inventory.softwarelicense.licensejserror3'));//No I18N
                return false;
            }
            if( jQuery('#oldLicense').val() == '' )
            {
                showBaloonToolTip('oldLicense', getMessageForKey('ae.software.upgrade.license.choose.license'));//No I18N
                return false;
            }

            if( document.getElementById('licenseOptionValue') != undefined )
            {
                var loption = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;

                if( document.getElementById('licenseOptionValue').value == "-1" )
                {
                    showBaloonToolTip('licenseOptionValue', getMessageForKey('sdp.inventory.swLicense.selectLicenseOptionjsError'));//NO I18N
                    return false;
                }
            }
            var anum=/(^\d+$)|(^\d+\.\d+$)/;
            if( trim(document.SoftwareLicense.purchaseCost.value) == '' || !anum.test(document.SoftwareLicense.purchaseCost.value)  )
            {
                showBaloonToolTip('purchaseCost', getMessageForKey('sdp.inventory.detailAsset.invalidCostMsg'));//NO I18N
                return false;
            }
        }

        if( document.getElementById('allocateToUser') != undefined )
        {
            var length = document.getElementById('allocateToUser').options.length;

            for( i=0; i<length; i++ )
            {
                document.getElementById('allocateToUser').options[i].selected = true;
            }
        }

        //Code to validate downgrade license details
        var $selectTags = jQuery('select[name^="software_"]');

        var isHavingValidData = true;

        $selectTags.each(function()
        {
            if( this.name.startsWith('software_') )
            {
                if( jQuery(this).val() != 0 && jQuery(this).val() != '-1' )
                {
                    if( jQuery('#componentID').val() == jQuery(this).val() )
                    {
                        showBaloonToolTip('software_' + licenseId, getMessageForKey('ae.software.license.software.cannotbein.downgradelist'));//No I18N
                        isHavingValidData = false;
    }
                        else
                    {
                        var licenseId = this.name.split('_')[1];

                        if( jQuery.trim(jQuery('#licenseKey_' + licenseId).val()) == '' )
                        {
                            jQuery('#licenseKey_' + licenseId).val('');
                            showBaloonToolTip('licenseKey_' + licenseId, getMessageForKey('ae.software.license.software.keycheck'));//No I18N
                            isHavingValidData = false;
                        }
                    }
                }
            }
        });

        if( !isHavingValidData )
        {
            return false;
        }

        $selectTags.each(function()
        {
            if( this.name.startsWith('software_') )
            {
                var rowIndex = this.name.split("_")[1];
                jQuery('#software_' + rowIndex).prop('disabled', false);//NO I18N
                jQuery('#licenseKey_' + rowIndex).prop('disabled', false);//NO I18N
            }
        });
    }
    catch(e)
    {
        alert(e);
        return false;
    }
    freezePage('licenseinputpage');//No I18N

    displayLoadingInformation('/images/processing.gif', getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n

    if( document.SoftwareLicense.operation.value == 'renew' )
    {
        document.SoftwareLicense.operation.value = 'createrenew';//No I18N
    }

    return true;
}

var leading = /^\s*/g;
var trailing =/\s*$/g;



function checkPurchaseVsInstalled(totalInstallations, purchased)
{
    if( purchased < totalInstallations )
    {
        for( i = 0; i<totalInstallations; i++ )
        {
            document.getElementById('allocateToWSList').options[i].selected = false;
        }

        alert(getMessageForKey('sdp.license.allocate.moreallocationwarn'));
        for( i = 0; i<totalInstallations; i++ )
        {
            if( i >= purchased )
            {
                document.getElementById('allocateToWSList').options[i].selected = true;
            }
        }
        copyListValues('allocateToWSList','unlicensedWSList', null);//NO I18N
        return false;
    }
    return true;
}

function validateNewWorkstationDetails(isLoanableAsset,isAdminPermission,associatedVendorCost,util,$this)
{
    var form = AssetUtil.getCurrentForm();

    if( form.ciName != undefined )
    {
        if( trim(form.ciName.value) == '' )
        {
            showBaloonToolTip('ciName', document.getElementById("emptyWSMsg").innerHTML);
            return false;
        }
    }
    else
    {
        if( trim(form.wsName.value) == '' )
        {
            showBaloonToolTip('wsName', document.getElementById("emptyWSMsg").innerHTML);
            return false;
        }
    }

    if( document.getElementById('isVMHost') != undefined )
    {
        if(document.getElementById('isVMHost').checked==true)
        {
            var val =  document.getElementById('allowedVMs').value;//No I18N
            if((trim(val) != "" && !isPositiveInteger(trim(val))) )
            {
                showBaloonToolTip("allowedVMs", document.getElementById("allowedVMsMsg").innerHTML);//No I18N
                return false;
            }
        }
    }

    var isServer = form.isServer.value;

    /*if (isServer != null && isServer == 'true' )
    {
        if( form.componentID == null || form.componentID.value == 0 )
        {
            alert(document.getElementById("emptyProductName").innerHTML);
            try
            {
                form.componentID.trigger('focus');
            }
            catch(e)
            {
            }
            return false;
        }
    }*/
    if( document.getElementById('SystemInfo_MODEL') != undefined )
    {
        if( document.getElementById('SystemInfo_MODEL').value == 'null' || document.getElementById('SystemInfo_MODEL').value == '')
        {
            showBaloonToolTip('SystemInfo_MODEL', document.getElementById("sdp.inventory.addnewWS.selectModeljsError").innerHTML);
            return false;
        }
    }
    else
    {
        if( form.wsModel.value == 0 || form.wsModel == null || form.wsModel == '')
        {
            showBaloonToolTip('wsModel', document.getElementById("sdp.inventory.addnewWS.selectModeljsError").innerHTML);
            return false;
        }
    }
    //}

    if( trim(form.memoryCapacity.value) != "" && !isDouble(trim(form.memoryCapacity.value)) )
    {
        if( document.getElementById('MemoryInfo_TOTALMEMORY') != undefined )
        {
            showBaloonToolTip('MemoryInfo_TOTALMEMORY', document.getElementById("ramMemoryMsg").innerHTML);
            return false;
        }
        else
        {
            showBaloonToolTip(form.memoryCapacity.id, document.getElementById("ramMemoryMsg").innerHTML);
            return false;
        }
    }

    if( trim(form.virtualCapacity.value) != "" && !isDouble(trim(form.virtualCapacity.value)) )
    {
        if( document.getElementById('MemoryInfo_VIRTUALMEMORY') != undefined )
        {
            showBaloonToolTip('MemoryInfo_VIRTUALMEMORY', document.getElementById("virMemoryMsg").innerHTML);
            return false;
        }
        else
        {
            showBaloonToolTip(form.virtualCapacity.id, document.getElementById("virMemoryMsg").innerHTML);
            return false;
        }
    }



    for(i=0;i<form.elements.length;i++) {
        var ele = form.elements[i];
        if(ele.name.indexOf("processorCount") >=0) {
            var val = ele.value;

            if(trim(val) != "" && !isPositiveInteger(trim(val)) )
            {
                showBaloonToolTip(ele.id, document.getElementById("procCountMsg").innerHTML);
                return false;
            }
        }
        else if(ele.name.indexOf("processorSpeed") >=0) {
            var val = ele.value;
            if(trim(val) != "" && !isDouble(trim(val)) )
            {
                showBaloonToolTip(ele.id, document.getElementById("procSpeedMsg").innerHTML);
                return false;
            }
        }
        else if(ele.name.indexOf("processorCore") >=0) {
            var val = ele.value;
            if(trim(val) != "" && !isPositiveInteger(trim(val)) )
            {
                showBaloonToolTip(ele.id, document.getElementById("sdp.inventory.detailWS.procCoreMsg").innerHTML);
                return false;
            }
        }
        else if(ele.name.indexOf("hardDiskCapacity") >=0) {
            var val = ele.value;
            if(trim(val) != "" && !isDouble(trim(val)) )
            {
                showBaloonToolTip(ele.id, document.getElementById("hardDiskCapacityMsg").innerHTML);
                return false;
            }
        }
    }

    //Validating IP Address on add new workstation page
    var ipAdd = document.getElementById("ipAddress").value;
    if(ipAdd != undefined && trimAll(ipAdd) != "" )
    {
        if(ipAdd.indexOf(',') != -1)
        {
          var ip = ipAdd.split(",");
          for(var i=0;i<ip.length;i++)
          {
              if(!isIpAddress(ip[i]) && !isIpV6Address(ip[i]))
              {
                  showBaloonToolTip('ipAddress', document.getElementById("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message").innerHTML);
                  return false;
              }
          }
        }
        else if(!isIpAddress(ipAdd) && !isIpV6Address(ipAdd))
        {
            showBaloonToolTip('ipAddress', document.getElementById("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message").innerHTML);
            return false;
        }
    }


    if( trim(document.getElementById('assetPrice').value) != '' && !isDouble(trim(document.getElementById('assetPrice').value)) )
    {
        showBaloonToolTip("assetPrice", getMessageForKey("sdp.inventory.detailAsset.invalidCostMsg"));//No I18N
        return false;
    }

    for( i=1; i<=2; i++ )
        {
            var udfNameField = document.getElementById("udfName" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("udfName" + i).value = "";
                }
            }

            udfNameField = document.getElementById("assetudfName" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("assetudfName" + i).value = "";
                }
            }
        }

        for( i=1; i<=2; i++ )
        {
            var udfNameField = document.getElementById("udfName1" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("udfName1" + i).value = "";
                }
            }

            udfNameField = document.getElementById("assetudfName1" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("assetudfName1" + i).value = "";
                }
            }
        }

        for( i=37; i<=42; i++ )
        {
            var udfNameField = document.getElementById("udfName" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("udfName" + i).value = "";
                }
            }

            udfNameField = document.getElementById("assetudfName" + i);

            if( udfNameField != null )
            {
                if( trim(udfNameField.value) != "" )
                {
                    if( !isInteger(udfNameField.value) )
                    {
                        showBaloonToolTip(udfNameField.id, getMessageForKey('sdp.inventory.detailAsset.invalidUDFMsg'));//No I18N
                        return false;
                    }
                }
                else if( trim(udfNameField.value) == "" )
                {
                    document.getElementById("assetudfName" + i).value = "";
                }
            }
        }

    if(isMSP)
    {
        if (form.site.value == '-1')        // No i18n
        {
            alert(getMessageForKey("sdp.inventory.import.wsdata.chooseSite"));
            try
            {
                form.site.focus();
            }
            catch(e)
            {
            }
            return false;
        }
    }


    var rState = form.resourceState.value;
    var stateJSON = getResourceStateDetails(rState);
    var isOwnershipEnabled = stateJSON.maintainownership;
    var isOwnerMandatory = stateJSON.isownershipmandatory;
    var isLoanableState = stateJSON.maintainleaseinfo;
    var isAssetAssocState = stateJSON.maintainattachassets;

    if (isOwnershipEnabled)
    {
        //SD-24788:  fix : Assign Owner is not validating in Add New WS and asset page.
        var assignVal;
        if(form.assignedType.length != undefined) {
            var assignedTypeSize = form.assignedType.length;
            for (var i=0;i<assignedTypeSize;i++)
            {
                if (form.assignedType[i].checked==true)
                {
                    assignVal = form.assignedType[i].value;
                }
            }
        }
        else {
            assignVal = form.assignedType.value;
        }
        var isStateChange = "false";
        if(assignVal != null && assignVal == "Assign") {
            var user = form.user.value;
            var dept = form.department.value;
            var isLeased = form.isLeased.checked;

            if(user == '0' && dept == '0')
            {
                isStateChange = "true";
                if(isOwnerMandatory)
                {
                    showBaloonToolTip(form.user.id, getMessageForKey("sdp.inventory.assignownertoWS.jserror"));//No I18N
                    return false;
                }
            }

            //If In Active User -> if state is changed n updated -> error will be thrown.
            //If Associated to asset with user -> update the assign type to assign will show user -> error will be thrown.
            if((rState != util.getAssetState() || assignVal != util.getAssignedType()) && !util.getIsActiveUser()){
                alert(getMessageForKey("sdp.asset.assign.inactive.user"));
                return false;
            }

            if (isLoanableState && isLeased == true)
            {
                var leaseStart = form.leaseStart.value;
                var leaseEnd = form.leaseEnd.value;
                if (leaseStart == null || leaseStart == '')
                {
                    showBaloonToolTip(form.leaseStart.id, getMessageForKey("sdp.inventory.assignownertoWS.jserror1"));//No I18N
                    return false;
                }
                if (leaseEnd== null ||  leaseEnd == '')
                {
                    showBaloonToolTip(form.leaseEnd.id, getMessageForKey("sdp.inventory.assignownertoWS.jserror2"));//No I18N
                    return false;
                }
                var leaseStart11 = Date.parse(leaseStart);
                var leaseEnd11 = Date.parse(leaseEnd);
                if( leaseStart > leaseEnd){
                    showBaloonToolTip(form.leaseEnd.id, getMessageForKey("sdp.inventory.assignownertoWS.leaseend.error"));//No I18N
                    return false;
                }
                 if(user == '0')
                {
                    alert(getMessageForKey("sdp.asset.loan.assets.nousererror"));
                    return false;
                }
                isOwnerMandatory = true;
            }
            else {
            	if(isLoanableAsset && (user != '0' || dept != '0')) {
            		showBaloonToolTip(form.user.id, getMessageForKey("loanable.asset.cannot.be.owned"));//No I18N
                    return false;
            	}
            }

        }
        if(assignVal != null && assignVal == "Associate") {
            var asset = form.asset.value;
            if (asset == '0')
            {
                isStateChange = "true";
                if(isOwnerMandatory)
                {
                    showBaloonToolTip('assetAppend', getMessageForKey("sdp.inventory.assignownertoWS.jserror3"));//No I18N
                    return false;
                }
            }
            if(rState != util.getAssetState() && util.getIsAttachedAssetOwnedByInactiveUser()){
                alert(getMessageForKey("sdp.asset.associate.inactive.user"));
                return false;
            }
            else{
            	if(isLoanableAsset) {
            		showBaloonToolTip('assetAppend', getMessageForKey("loanable.asset.cannot.be.owned"));//No I18N
                    return false;
            	}
            }
        }
        form.isStateChange.value = isStateChange;
    }
    if(form.ciName != undefined)
    {
        return false;
    }
    //Depreciation
    if(document.getElementById('enableDepreciation').checked && trim(document.AddWSForm.depreciationTypeId.value) == '')
    {
        alert(getMessageForKey('sdp.asset.depreciationDetailsPopUp.configureDepreciation'));
        return false;
    }
    if(document.getElementById('enableDepreciation').checked && !validateDepreciationAttribute(document.AddWSForm))
    {
        return false;
    }
    if(isAdminPermission != null && isAdminPermission != undefined && isAdminPermission)
    {
        var vendorId = document.AddWSForm.vendor.value;
        var price = document.AddWSForm.assetPrice.value;
        var oldCost = document.AddWSForm.purchasecost.value;
        var oldAssociatedVendorId = document.AddWSForm.oldAssociatedVendor.value;
        if((isEdit &&  associatedVendorCost != undefined && associatedVendorCost[vendorId] != undefined) || (!isEdit && vendorCost[vendorId] != undefined))
        {
            if(parseInt(price) != parseInt(oldCost) && vendorId != 0)
            {
                modifyCostValue = confirm(getMessageForKey("sdp.asset.costConfirmationForProductLevel"));//No I18N
                if(modifyCostValue)
                {
                    document.AddWSForm.modifycost.value = "true";
                }
            }
        }
        else
        {
            document.AddWSForm.modifycost.value = "true";
        }
    }
    var purchaseCostOfAsset = document.AddWSForm.assetPrice.value;
    var salvageValueOfAsset = document.AddWSForm.salvageValue.value;
    if(parseInt(purchaseCostOfAsset) != 0 && parseInt(purchaseCostOfAsset)<=parseInt(salvageValueOfAsset))
    {
        alert(getMessageForKey("sdp.assetAddForm.compare.salvageAndcost"));
        return false;
    }
    var msg = jQuery($this).button('loading');
    return true;
}
//code checkin error faced. Dupliated method exist. As discussed with siddik, removing the below method
/*function ajaxRequestOnFailure ( requestObj )
{
    alert(requestObj.responseText);
}*/
function callLoadingIcon(tdTagId, message)
{
    if( document.getElementById(tdTagId) != undefined )
    {
        document.getElementById(tdTagId).innerHTML =  '<table width="100%"><tr><td width="50%" align="right"><img src="/images/cogwheel.gif"></td><td align="left">' + message + '</td></tr></table>';
    }
}

function searchUserOrWorkstation()
{
    if( document.getElementById('trackby').value == 'CAL' ) //CAL
    {
        if(document.getElementById('searchBox').value == getMessageForKey( "sdp.software.license.search.workstation" ) || document.getElementById('searchBox').value == getMessageForKey("sdp.software.license.search.user") )
        {
            //document.getElementById('searchBox').value = '*';
        }

        AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));

        if( document.getElementById('componentID').value == 0 )
        {
            alert(getMessageForKey('sdp.license.allocate.serverswwarn'));
            document.getElementById('componentID').focus();
            return false;
        }

        var licenseID = -1;
        //While editing the sw license
        if( document.getElementById('licenseID') != undefined )
        {
            licenseID = document.getElementById('licenseID').value;
        }

        //callLoadingIcon('warnmessage', document.getElementById('sdp.license.allocate.loadmessage').innerHTML);
        displayFadeMessage(getMessageForKey('sdp.license.allocate.loadmessage'), getElementPosition('moveRight'));//NO I18N

        var param = "action=search_user_or_workstation&swId=-1&serverSWProduct=" + document.getElementById('componentID').value + "&department=-1&licenseID=" + licenseID + "&licenseOption=" + document.getElementById('licenseOptionValue').value;//NO I18N

        if(document.getElementById('searchBox') != undefined && (document.getElementById('searchBox').value != getMessageForKey( "sdp.software.license.search.workstation" ) && document.getElementById('searchBox').value != getMessageForKey("sdp.software.license.search.user")))
        {
            param += "&searchText=" + document.getElementById('searchBox').value;//NO I18N
        }
        else
        {
            param += "&searchText=";//NO I18N
        }

        if( document.getElementById('allsites') != undefined && document.getElementById('allsites').value > 0 )
        {
            param += "&site=" + document.getElementById('allsites').value;//NO I18N
        }

        var licenseOption = document.getElementById('licenseOptionValue');
        var licenseOptionValue = null;

        if( licenseOption.type == 'hidden' )
        {
            //Call from allocate CAL license page
            licenseOption = document.getElementById('licenseOptionString');
            licenseOptionValue = document.getElementById('licenseOptionString').value;
        }
        else
        {
            licenseOptionValue = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;
        }
        if( licenseOption != undefined && licenseOptionValue == 'Per Seat - User'  ) //Per User
        {
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_unlicensed_users');//NO I18N
        }
        else
        {
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_unlicensed_ws');//NO I18N
        }
    }
}

function displayFadeMessage(msg, nearByElement)
{
    if( document.getElementById('centerstatusmsg') != undefined )
    {
        document.getElementById('centerstatusmsg').innerHTML= msg;
    }
    var sts = document.getElementById('centerstatus');

    sts.style.backgroundColor="rgb(255,255,255)";//NO I18N
    sts.style.border= 'solid black 1px';//NO I18N
    sts.style.display='block';//NO I18N
}

function getElementPosition(elemID)
{
    var offsetTrail = document.getElementById(elemID);
    var offsetLeft = 0;
    var offsetTop = 0;
    while (offsetTrail)
    {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }
    if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined'){
        offsetLeft += document.body.leftMargin;
        offsetTop += document.body.topMargin;
    }
    return {left:offsetLeft,top:offsetTop};
}

function fetchUserORWSByDepartment()
{
    var selectedDeptId = document.getElementById('department').options[document.getElementById('department').selectedIndex].value;
    /*if( selectedDeptId == -1 )
    {
        AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));
        return false;
    }*/
    var clientSWObj = document.getElementById('clientSWName');
    var clientSWID = clientSWObj.options[clientSWObj.selectedIndex].value;

    return fetchUnlicensedUserOrWorkstation(clientSWID, selectedDeptId);
}

function fetchUserOrWSBySoftware()
{
    var clientSWObj = document.getElementById('clientSWName');
    var clientSWID = clientSWObj.options[clientSWObj.selectedIndex].value;

    if( clientSWID == -1 )
    {
        AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));
        return false;
    }
    var selectedDeptId = document.getElementById('department').options[document.getElementById('department').selectedIndex].value;
    return fetchUnlicensedUserOrWorkstation(clientSWID, selectedDeptId);
}

function fetchUnlicensedUserOrWorkstation(clientSWID, selectedDeptId)
{
    if( document.getElementById('trackby').value == 'CAL' ) //CAL
    {
        AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));

        if( document.getElementById('componentID').value == 0 )
        {
            alert(getMessageForKey('sdp.license.allocate.serverswwarn'));
            document.getElementById('componentID').focus();
            document.getElementById('clientSWName').value='-1';
            document.getElementById('department').value='-1';
            return false;
        }

        var licenseID = -1;
        //While editing the sw license
        if( document.getElementById('licenseID') != undefined )
        {
            licenseID = document.getElementById('licenseID').value;
        }

        //callLoadingIcon('warnmessage', document.getElementById('sdp.license.allocate.loadmessage').innerHTML);
        displayFadeMessage(getMessageForKey('sdp.license.allocate.loadmessage'), getElementPosition('moveRight'));//NO I18N

        var param = "action=get_unlicensed_sw_installations&swId=" + clientSWID + "&serverSWProduct=" + document.getElementById('componentID').value + "&department=" + selectedDeptId + "&licenseID=" + licenseID + "&licenseOption=" + document.getElementById('licenseOptionValue').value;//NO I18N

        if( document.getElementById('allsites') != undefined && document.getElementById('allsites').value > 0 )
        {
            param += "&site=" + document.getElementById('allsites').value;//NO I18N
        }

        var licenseOption = document.getElementById('licenseOptionValue');
        var licenseOptionValue = null;

        if( licenseOption.type == 'hidden' )
        {
            //Call from allocate CAL license page
            licenseOption = document.getElementById('licenseOptionString');
            licenseOptionValue = document.getElementById('licenseOptionString').value;
        }
        else
        {
            licenseOptionValue = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;
        }
        if( licenseOption != undefined && licenseOptionValue == 'Per Seat - User'  ) //Per User
        {
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_unlicensed_users');//NO I18N
        }
        else
        {
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_unlicensed_ws');//NO I18N
        }
    }
}

function fetchUnLicensedWS()
{
    AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().unlicensedWSList);
    AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);

    var licenseType = document.getElementById('licenseTypeName').value;

    //Check for CAL
    if( document.getElementById('trackby').value == 'CAL' ) //CAL
    {
        var param = "action=get_associated_site_depts";//NO I18N

        if( AssetUtil.getCurrentForm().site != undefined )
        {
            param += "&siteId=" + AssetUtil.getCurrentForm().site.value;//NO I18N
        }

        callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'update_departments');//NO I18N
    }
    else if( document.getElementById('isnodelockedlicense').value == 'true' )
    {
        updateActiveWSList();
    }
    else
    {
        AssetUtil.fetchSiteUsers();
    }
}

function updateActiveWSList()
{
    var param = "action=get_installed_ws&productId=" + document.getElementById('componentID').value;//NO I18N

    var siteId = -1;

    var index = document.getElementById('allsites').options.selectedIndex;

    param += "&siteId=" + document.getElementById('allsites').options[index].value;//NO I18N
    callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_active_ws');//NO I18N
}

function updateInstalledServerNames( selectTag )
{
    if( selectTag.value > 0 && document.getElementById('licenseOptionValue') != undefined )
    {
        var loption = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;

        if((loption == 'Per Server' || loption == 'Per Processor') || (document.getElementById('isnodelockedlicense').value == 'true' )) //Node locked
        {
            var param = "action=get_installed_ws&productId=" + document.getElementById('componentID').value;//NO I18N

            var siteId = -1;

            //var index = document.getElementById('allsites').options.selectedIndex;

            param += "&siteId=" + document.getElementById('allsites').value;//NO I18N
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'get_installed_ws');//NO I18N
        }
    }
    else
    {
        if( document.getElementById('associatedServer') != undefined )
        {
            AssetUtil.removeAllOptionTags(document.getElementById('associatedServer'));
        }
        if( document.getElementById('allocateToWorkstation') != undefined )
        {
            AssetUtil.removeAllOptionTags(document.getElementById('allocateToWorkstation'));
        }
    }
}

AssetUtil.prototype.updateUnlicensedInstallations = function( selectTag )
{
}

AssetUtil.prototype.updateListviewLabel = function( selectTag )
{
    if( selectTag.value == 2 || selectTag.value == 3 )
    {
        document.getElementById('uninslabel').innerHTML = document.getElementById('sdp.license.swdetailspage.serverorws').innerHTML;
        document.getElementById('allocateCAL').innerHTML = document.getElementById('sdp.license.addnew.calinstallations').innerHTML;
    }
    else if( selectTag.value == 1 )
    {
        document.getElementById('uninslabel').innerHTML = getMessageForKey('sdp.contract.addNew.userList');
        document.getElementById('allocateCAL').innerHTML = document.getElementById('sdp.license.addnew.calusers').innerHTML;
    }

    AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().unlicensedWSList);
    AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
}

AssetUtil.getDefaultLicenseOption = function ()
{
    var defaultLicenseOptionId = document.getElementById('selectedOptionValue').value;

    var selectTag = document.getElementById('licenseOptionValue');

    var length = selectTag.length;

    for( i=0; i<length; i++ )
    {
        if( selectTag[i].value == defaultLicenseOptionId )
        {
            return selectTag[i].innerHTML;
        }
    }
    return defaultLicenseOptionId;
}

AssetUtil.prototype.updateLicenseMode = function( selectTag )
{
    //Do the following if the selected license type is CAL
    if(document.getElementById('trackby').value == 'CAL')
    {
        displayRow('searchclientswinstalltions');//NO I18N
        hideRow('license');//No I18N

        var defaultLicenseOption = AssetUtil.getDefaultLicenseOption();

        var selectedLicenseOption = selectTag[selectTag.selectedIndex].innerHTML;

        if( selectedLicenseOption == 'Per Processor' )
        {
            displayRow('noofprocessor');//NO I18N
            hideRow('noofcal');//NO I18N
            hideRow('unlicensed1');//NO I18N
            hideRow('unlicensed2');//NO I18N
            hideRow('unlicensed3');//NO I18N
            hideRow('unlicensed4');//No I18N

                        hideRow('site');//NO I18N
                        jQuery('#allsites').val('-1');
        }
        else
        {
            hideRow('noofprocessor');//NO I18N
            displayRow('noofcal');//NO I18N
            displayRow('unlicensed1');//NO I18N
            displayRow('unlicensed2');//NO I18N
            displayRow('unlicensed3');//NO I18N
            displayRow('unlicensed4');//No I18N
                        displayRow('site');//NO I18N
        }

    hideRow('downgradeList');//No I18N
        hideRow('downgradeHeader');//No I18N

        AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().unlicensedWSList);

        if( defaultLicenseOption == 'Per Seat - Device' ) //Per Device
        {
            if( selectedLicenseOption == 'Per Seat - User' )
            {
                AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
            }
        }
        else if( defaultLicenseOption == 'Per Seat - User' || defaultLicenseOption == 'Per Processor' ) //Per User OR Per Processor
        {
            AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
        }
        else if( defaultLicenseOption == 'Per Server' ) //Per Server
        {
            if( selectedLicenseOption == 'Per Seat - User' )
            {
                AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
            }
        }
        else if( defaultLicenseOption == 'Per Mailbox' ) //Per Mailbox
        {
            if( selectedLicenseOption == 'Per Seat - User' )
            {
                AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
            }
        }

        if( selectTag.value > 0 )
        {
            if( selectedLicenseOption != 'Per Seat - User' )
            {
                document.getElementById('unswlabel').innerHTML = '<b>&nbsp;' + getMessageForKey('sdp.license.swdetailspage.connectingserverorws') + '</b>';//NO I18N
                document.getElementById('calhelptext').innerHTML = getMessageForKey('sdp.cal.device.helptext');
            }
            else if( selectedLicenseOption == 'Per Seat - User' )
            {
                document.getElementById('unswlabel').innerHTML = '<b>&nbsp;' + getMessageForKey('sdp.license.swdetailspage.calusers') + '</b>';//NO I18N
                document.getElementById('calhelptext').innerHTML = getMessageForKey('sdp.cal.user.helptext');
            }

            if( selectedLicenseOption != 'Per Seat - User' )
            {
                document.getElementById('uninslabel').innerHTML = getMessageForKey('sdp.license.swdetailspage.serverorws');
                document.getElementById('allocateCAL').innerHTML = getMessageForKey('sdp.license.addnew.calinstallations');
            }
            else if( selectedLicenseOption == 'Per Seat - User' )
            {
                document.getElementById('uninslabel').innerHTML = getMessageForKey('sdp.contract.addNew.userList');
                document.getElementById('allocateCAL').innerHTML = getMessageForKey('sdp.license.addnew.calusers');
            }
        }

        //Need to show the server name if the license option is 'Per Server' OR 'Per Processor'
        if( selectedLicenseOption == 'Per Server' || selectedLicenseOption == 'Per Processor' )
        {
            displayRow('servername');//NO I18N
        }
        else
        {
            hideRow('servername');//NO I18N
        }

        updateInstalledServerNames(document.getElementById('componentID'));

        updateSearchText(document.getElementById('searchBox'));
    }
}

function showAgreements( softwareId, noOfDays )
{
    var summaryCount = '-1';//No I18N
    try
    {
        if( noOfDays == -2 )
        {
            summaryCount = jQuery('#expired').text();
        }
        else if( noOfDays == 7 )
        {
            summaryCount = jQuery('#expirein7days').text();
        }
        else if( noOfDays == 30 )
        {
            summaryCount = jQuery('#expirein30days').text();
        }
    }
    catch(e)
    {
        //Error may thrown if any call from software home page
    }

    if( summaryCount != '0')
    {
        if( softwareId != null )
        {
            NewWindow('/Agreements.cc?softwareId=' + softwareId + '&expiresIn=' + noOfDays,'showagreements','1050','535','yes','center');//NO I18N
        }
        else
        {
            NewWindow('/Agreements.cc?expiresIn=' + noOfDays + '&mfgId=' + jQuery('#softwareManufacturer').val(),'showagreements','1050','535','yes','center');//NO I18N
        }
    }
}

function resetAllInputFields()
{
    var formName = document.SoftwareLicense;

    formName.licenseOption.value = "-1";//No I18N
    formName.licenseCount.value = "1";//No I18N
    formName.calLicenseCount.value = "1";//No I18N
    formName.processorCount.value = "1";//No I18N
}

AssetUtil.prototype.resetUnlicensedWSList = function()
{
    if( AssetUtil.getCurrentForm() != undefined )
    {
        if( AssetUtil.getCurrentForm().allocateToWSList != null )
        {
            AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().allocateToWSList);
        }
        if( AssetUtil.getCurrentForm().unlicensedWSList != null )
        {
            AssetUtil.removeCompleteOptionTags(AssetUtil.getCurrentForm().unlicensedWSList);
        }
    }
    else
    {
        AssetUtil.setCurrentForm(document.SoftwareLicense);
    }
}

AssetUtil.prototype.showHideLicenseInformation = function( selectTag )
{
    try
    {
        if( operation == 'add' )
        {
            resetAllInputFields();
        }

        if( operation != 'renew' )
        {
            //No need to allow the user to change the acquisition & expiry date if the license is downgrade
            if( operation == 'edit' && jQuery('#licenseCategory').val() == 'downgrade' )
            {
                jQuery('#acqDate1').parent().parent().hide();
                jQuery('#acqDate3').parent().parent().hide()

                    jQuery('#acqDate').width(225);
                jQuery('#expiryDate').width(225);

                setReadonly('licenseOptionValue', '225px');//No I18N
                setReadonly('vendorID', '225px');//No I18N
                jQuery('#usersAllowed').prop('readonly',true);//No I18N
            }

            if( jQuery('#isNodeLockedAllocated').val() )
            {
                //jQuery('#allocateToWorkstation').val(-1);
                setReadonly('allocateToWorkstation', '225px');//No I18N

                jQuery('#hostID').prop('readonly', true);//No I18N
                jQuery('#OSName').prop('readonly', true);//No I18N
            }

            if( jQuery('#trackby').val() == 'CAL' ) // Client Access License
            {
                var param = "action=get_associated_site_depts";//NO I18N

                if( AssetUtil.getCurrentForm().site != undefined )
                {
                    param += "&siteId=" + AssetUtil.getCurrentForm().site.value;//NO I18N
                }

                callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, siteAjaxRequestSuccess, ajaxRequestOnFailure, 'update_departments_only');//NO I18N
            }
            else if( jQuery('#installationType').val() == 'Unlimited' && AssetUtil.getCurrentForm().unlicensedWSList != undefined ) //Enterprise
            {
                len = AssetUtil.getCurrentForm().unlicensedWSList.length;

                if( len > 0 )
                {
                    for(i=0;i<len;i++)
                    {
                        AssetUtil.getCurrentForm().unlicensedWSList.options[i].selected = true;
                    }
                    copyListValues('unlicensedWSList','allocateToWSList', null);//NO I18N
                }
            }

            hideRow('servername');//NO I18N
            hideRow('noofusersallowedRow');//NO I18N
            hideRow('allocateLicenseToWS');//NO I18N
            hideRow('installedInRow');//NO I18N
            hideRow('hostIDrow');//NO I18N
            hideRow('OSNamerow');//NO I18N
        }

        operation = AssetUtil.getCurrentForm().operation.value;
        if( jQuery('#installationType').val() == 'Unlimited' ) //Enterprise (Perpetual) / Entreprise subscription / Free license
        {
            if( operation != 'renew' )
            {
                hideRow('unlicensed1');//NO I18N
                hideRow('unlicensed2');//NO I18N
                hideRow('unlicensed3');//NO I18N
                hideRow('unlicensed4');//No I18N
            }

            hideRow('license');//NO I18N
            hideRow('noofinstallations');//NO I18N
            hideRow('totalCost');//NO I18N
            jQuery('#licenseCount').prop('disabled', true);//No I18N

            hideRow('site');//NO I18N

            if( operation != 'renew' )
            {
                //hideRow('licenseModetr');
                hideRow('noofcal');//NO I18N
                //hideRow('licenseOption');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('searchclientswinstalltions');//NO I18N

                jQuery('#allsites').val('-1');
                jQuery('#unswlabel').html('<b>' + getMessageForKey('sdp.license.allocate.unlicensedserver') + '</b>');//NO I18N
                jQuery('#uninslabel').html(getMessageForKey('sdp.license.swdetailspage.serverorws'));
                jQuery('#allocateCAL').html(getMessageForKey('sdp.license.addnew.calinstallations'));

                displayRow('downgradeList');//No I18N
                displayRow('downgradeHeader');//No I18N
            }
            else
            {
                hideRow('noofcal');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('noofusersallowedRow');//NO I18N
            }

        }
        else if( jQuery('#installationType').val() == 'Single' || jQuery('#installationType').val() == 'OEM' ) //Individual license OR OEM
        {
            if( operation != 'renew' )
            {
                hideRow('unlicensed1');//NO I18N
                hideRow('unlicensed2');//NO I18N
                hideRow('unlicensed3');//NO I18N
                hideRow('unlicensed4');//No I18N
            }

            hideRow('noofinstallations');//NO I18N
            hideRow('totalCost');//NO I18N

            if( operation != 'renew' )
            {
                if( operation == 'add' )
                {
                    hideRow('license');//NO I18N
                    jQuery('#licenseCount').prop('disabled', false);//No I18N
                }
                else if( operation == 'update' )
                {
                    hideRow('license');//NO I18N
                }
                displayRow('site');//NO I18N
                if( jQuery('#isnodelockedlicense').val() == 'true' )
                {
                    hideRow('license');//NO I18N
                    displayRow('allocateLicenseToWS');//NO I18N
                    displayRow('hostIDrow');//NO I18N
                    displayRow('OSNamerow');//NO I18N
                }

                //hideRow('licenseModetr');
                hideRow('noofcal');//NO I18N
                //hideRow('licenseOption');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('searchclientswinstalltions');//NO I18N

                jQuery('#allsites').prop('disabled', false);//No I18N

                jQuery('#unswlabel').html('<b>' + getMessageForKey('sdp.license.allocate.unlicensedserver') + '</b>');//NO I18N
                jQuery('#uninslabel').html(getMessageForKey('sdp.license.swdetailspage.serverorws'));
                jQuery('#allocateCAL').html(getMessageForKey('sdp.license.addnew.calinstallations'));

                displayRow('downgradeList');//No I18N
                displayRow('downgradeHeader');//No I18N
            }
            else
            {
                hideRow('noofcal');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('noofusersallowedRow');//NO I18N
            }
        }
        else if( jQuery('#trackby').val() == 'CAL' ) //CAL license
        {
            var loption = jQuery("#licenseOptionValue option:selected").text();

            if( operation != 'renew' )
            {
                displayRow('unlicensed1');//NO I18N
                displayRow('unlicensed2');//NO I18N
                displayRow('unlicensed3');//NO I18N
                displayRow('unlicensed4');//No I18N
            }

            hideRow('noofinstallations');//NO I18N
            hideRow('totalCost');//NO I18N
            hideRow('downgradeList');//No I18N
            hideRow('downgradeHeader');//No I18N

            hideRow("license");//NO I18N

            if( operation != 'renew' )
            {
                if( operation == 'add' )
                {
                    hideRow('license');//NO I18N
                    jQuery('#licenseCount').prop('disabled', false);//No I18N
                }
                else if( operation == 'update' )
                {
                }

                displayRow('noofcal');//NO I18N

                if( loption == 'Per Processor' )
                {
                    hideRow('site');//NO I18N
                    jQuery('#allsites').val('-1');

                    hideRow('unlicensed1');//NO I18N
                    hideRow('unlicensed2');//NO I18N
                    hideRow('unlicensed3');//NO I18N
                    hideRow('unlicensed4');//No I18N
                }
                else
                {
                    displayRow('site');//NO I18N
                    displayRow('unlicensed1');//NO I18N
                    displayRow('unlicensed2');//NO I18N
                    displayRow('unlicensed3');//NO I18N
                    displayRow('unlicensed4');//No I18N
                }

                if( loption == 'Per Processor' && operation == 'update')
                {
                    hideRow('noofcal');//NO I18N
                }
                if( loption == 'Per Server' || loption == 'Per Processor')
                {
                    displayRow('servername');//NO I18N
                }

                if( loption != 'Per Processor' )
                {
                    hideRow("noofprocessor");//NO I18N
                }

                displayRow('searchclientswinstalltions');//NO I18N

                if( document.SoftwareLicense.licenseOption != undefined && document.SoftwareLicense.licenseOption.value > 0 )
                {
                    if( loption != 'Per Seat - User' )
                    {
                        jQuery('#unswlabel').html('<b>&nbsp;' + getMessageForKey('sdp.license.swdetailspage.connectingserverorws') + '</b>');//NO I18N
                    }
                    else if( loption == 'Per Seat - User' )
                    {
                        jQuery('#unswlabel').html('<b>&nbsp;' + getMessageForKey('sdp.license.swdetailspage.calusers') + '</b>');//NO I18N
                    }

                    if( loption != 'Per Seat - User' )
                    {
                        jQuery('#uninslabel').html(getMessageForKey('sdp.license.swdetailspage.serverorws'));
                        jQuery('#allocateCAL').html(getMessageForKey('sdp.license.addnew.calinstallations'));
                    }
                    else if( loption == 'Per Seat - User' )
                    {
                        jQuery('#uninslabel').html(getMessageForKey('sdp.contract.addNew.userList'));
                        jQuery('#allocateCAL').html(getMessageForKey('sdp.license.addnew.calusers'));
                    }
                }

                jQuery('#allsites').prop('disabled', false);//No I18N
            }
            else
            {
                if( loption == 'Per Processor' )
                {
                    hideRow('noofcal');//NO I18N
                    displayRow('noofprocessor');//NO I18N
                }
                else
                {
                    displayRow('noofcal');//NO I18N
                    hideRow('noofprocessor');//NO I18N
                }
                hideRow('noofusersallowedRow');//NO I18N
            }
        }
        else if( jQuery('#installationType').val() == 'Multiple'  ) //Volume / Trial / Free license
        {
            if( operation != 'renew' )
            {
                hideRow('unlicensed1');//NO I18N
                hideRow('unlicensed2');//NO I18N
                hideRow('unlicensed3');//NO I18N
                hideRow('unlicensed4');//No I18N
            }

            jQuery('#licenseCount').val(1);

            if( operation == 'add' )
            {
                hideRow('totalCost');//NO I18N

                hideRow('license');//NO I18N
                jQuery('#licenseCount').prop('disabled', false);//No I18N
            }
            else if( operation == 'update' || operation == 'renew' )
            {
                hideRow('totalCost');//NO I18N
                hideRow('license');//NO I18N
            }

            displayRow('noofinstallations');//NO I18N
            displayRow('site');//NO I18N

            if( operation != 'renew' )
            {
                //hideRow('licenseModetr');
                hideRow('noofcal');//NO I18N
                //hideRow('licenseOption');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('searchclientswinstalltions');//NO I18N

                jQuery('#allsites').prop('disabled', false);//No I18N
                jQuery('#unswlabel').html('<b>' + getMessageForKey('sdp.license.allocate.unlicensedserver') + '</b>');//NO I18N
                jQuery('#uninslabel').html(getMessageForKey('sdp.license.swdetailspage.serverorws'));
                jQuery('#allocateCAL').html(getMessageForKey('sdp.license.addnew.calinstallations'));
                displayRow('downgradeList');//No I18N
                displayRow('downgradeHeader');//No I18N
            }
            else
            {
                hideRow('noofcal');//NO I18N
                hideRow('noofprocessor');//NO I18N
                hideRow('noofusersallowedRow');//NO I18N
            }
        }
        if( jQuery('#trackby').val() == 'User' )
        {
            hideRow('license');//NO I18N

            if( operation != 'renew' )
            {
                if( jQuery('#userAccessType').val() == 1 ) //Single user allowed to access the software
                {
                    displayRow('installedInRow');//NO I18N
                    jQuery('#allocateToUser').prop("multiple", false);//NO I18N
                    jQuery('#allUserList').prop("multiple", false);//NO I18N
                    updateAllUsersList();
                }
                else if( jQuery('#userAccessType').val() == 2 ) //Multiple users allowed to access the software
                {
                    displayRow('noofusersallowedRow');//NO I18N
                    displayRow('installedInRow');//NO I18N
                    jQuery('#allocateToUser').prop("multiple", true);//NO I18N
                    jQuery('#allUserList').prop("multiple", true);//NO I18N
                    updateAllUsersList();
                    //document.getElementById('allocateToUser').setAttribute("size", '5');
                }
                else if( jQuery('#userAccessType').val() == 3 ) //Unlimited users allowed to access the software
                {
                    if( document.getElementById('allocateToUser') != undefined )
                    {
                        AssetUtil.removeCompleteOptionTags(document.getElementById('allocateToUser'));//NO I18N
                    }
                    if( document.getElementById('allUserList') != undefined )
                    {
                        AssetUtil.removeCompleteOptionTags(document.getElementById('allUserList'));//NO I18N
                    }
                }
                displayRow('downgradeList');//No I18N
                displayRow('downgradeHeader');//No I18N
            }
            else
            {
                if( jQuery('#userAccessType').val() == 2 ) //Multiple users allowed to access the software
                {
                    displayRow('noofusersallowedRow');//NO I18N
                }
                else
                {
                    hideRow('noofusersallowedRow');//NO I18N
                }
            }
        }

        if( AssetUtil.getCurrentForm().disabledSite != undefined )
        {
            if( AssetUtil.getCurrentForm().dLicenseType.value == AssetUtil.getCurrentForm().licenseType.value )
            {
                AssetUtil.getCurrentForm().site.value = AssetUtil.getCurrentForm().disabledSite.value;
                AssetUtil.getCurrentForm().site.disabled = true;
            }
        }

        if( operation != 'renew' )
        {
            if( jQuery('#trackby').val() == 'CAL' ) //Need to hide the add new license option icon
            {
                jQuery('#addnewlicenseOption').attr('class', 'displayNone');
                jQuery('#licenseOptionHelpIcon').attr('class', 'helptool-icon-thumb');
            }
            else
            {
                jQuery('#addnewlicenseOption').attr('class', 'add-items');//NO I18N
                jQuery('#addnewlicenseOption').css('margin-left', '9px');//NO I18N

                jQuery('#licenseOptionHelpIcon').removeAttr('class');//NO I18N
            }
        }
    }
    catch(e)
    {
        alert(e.message);
    }
}

function updateAllUsersList()
{
    if( document.getElementById('allUserList') != undefined && document.getElementById('allocateToUser') != undefined )
    {
        if( document.getElementById('allUserList').options.length == 0 && document.getElementById('allocateToUser').options.length == 0 )
        {
            AssetUtil.fetchSiteUsers();
        }
    }
}

function deleteLicenseType( form )
{
    var valid = false;

    var selectedObj = document.getElementsByName("checkbox");//NO I18N

    for( i=0; i<selectedObj.length; i++ )
    {
        if( selectedObj[i].checked )
        {
            valid=true;
            break;
        }
    }

    if( valid )
    {
        var selectedObj = document.getElementsByName("checkbox");//NO I18N

        var isAllDisabled = true;

        var param = 'action=delete_license_types';//No I18N

        for( i=0; i<selectedObj.length; i++ )
        {
            if( selectedObj[i].checked && !selectedObj[i].disabled )
            {
                isAllDisabled = false;
                param += "&licenseTypeId=" + selectedObj[i].value;//No I18N
            }
        }

        if( isAllDisabled )
        {
            alert(getMessageForKey('sdp.admin.software.licensetype.defcantbedeleted'));//No I18N
            return false;
        }
        else
        {
            if( confirm(getMessageForKey('sdp.admin.software.licensetype.deletionconfirm')) )
            {
                displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.file.delete.progress.msg'), false);//NO I18n
                callCustomAjaxRequest("/servlet/AJaxServlet", param, softwareAjaxRequestSuccess, ajaxRequestOnFailure, 'delete_license_types');//NO I18N
            }
        }
    }
    else
    {
        alert(getMessageForKey('sdp.admin.software.licensetype.choosetypetodel'));//No I18N
        return false;
    }
}

function allocateCALLicense( licenseId, softwareId, availableCAL, optionId )
{
    var wslength = document.getElementById('allocateToWSList').options.length;
    /*if( wslength == 0 )
    {
        alert("No devices / users selected!!!");//NO I18N
        return;
    }*/
    if( availableCAL < wslength )
    {
        if( !checkPurchaseVsInstalled(wslength, availableCAL) )
        {
            return false;
        }
    }
    else
    {
        var param = "operation=allocateCAL&licenseId=" + licenseId + "&softwareId=" + softwareId + "&availableCAL=" + availableCAL + "&licenseOption=" + optionId;//NO I18N

        for( i=0; i<wslength; i++ )
        {
            param += "&allocateToWSList=" + document.getElementById('allocateToWSList').options[i].value;//NO I18N
        }
        callCustomAjaxRequest("/SoftwareLicense.do", param, softwareAjaxRequestSuccess, ajaxRequestOnFailure,  'allocate_cal_license');//NO I18N
    }
}

function displayRow(rowId)
{
    jQuery('#' + rowId).show();
}
function hideRow(rowId)
{
    jQuery('#' + rowId).hide();
}

function removeDuplicateCALInstallations()
{
    var selectTag = document.getElementById('allocateToWSList');

    var length = selectTag.length;

    for( var i=0; i<selectTag.length; i++ )
    {
        var totalOccurences = findDuplicate(selectTag.options[i].value, selectTag);

        if( totalOccurences.length > 1 )
        {
            for( j=1; j<totalOccurences.length; j++ )
            {
                selectTag.options[totalOccurences[j]] = null;
            }
        }
    }
}

function captureKeyPress(e)
{
    var keynum
    var keychar
    var numcheck

    if(window.event) // IE
    {
        keynum = e.keyCode
    }
    else if(e.which) // Netscape/Firefox/Opera
    {
        keynum = e.which
    }
    //keychar = String.fromCharCode(keynum)
    if( keynum == 13 )
    {
        searchUserOrWorkstation();
        return false;
    }
    return true;
}

function changeSearchText(source)
{
    if(source.value == getMessageForKey( "sdp.software.license.search.workstation" ) || source.value == getMessageForKey("sdp.software.license.search.user") )
    {
        source.value = '';
    }
    else if(source.value == '')
    {
        updateSearchText(source);
    }
}

function updateSearchText(source)
{
    var licenseOption = document.getElementById('licenseOptionValue');
    var licenseOptionValue = null;

  if( licenseOption != undefined )
    {
    if( licenseOption.type == 'hidden' )
    {
        //Call from allocate CAL license page
        licenseOption = document.getElementById('licenseOptionString');
        licenseOptionValue = document.getElementById('licenseOptionString').value;
    }
    else
    {
        licenseOptionValue = document.getElementById('licenseOptionValue')[document.getElementById('licenseOptionValue').selectedIndex].innerHTML;
    }
    if( licenseOption != undefined && licenseOptionValue == 'Per Seat - User'  ) //Per User
    {
        source.value = getMessageForKey('sdp.software.license.search.user');
    }
    else
    {
        source.value = getMessageForKey('sdp.software.license.search.workstation');
    }
  }
}

function displayLoadingInformation(iconPath, loadMessage, autoClose, autoCloseTime)
{
    var mydiv = document.getElementById('loadingdivid'),
		iconClass = '';
	if(iconPath == '/images/discoverystatus_discovered.gif'){ //No I18N
		iconClass = 'cspr icon-sm success vsub'; //No I18N
		iconPath  = '/images/spacer.gif';//No I18N
	} else if(iconPath == '/images/deleteMail.gif'){ //No I18N
		iconClass = 'cspr icon-sm danger vsub';//No I18N
		iconPath  = '/images/spacer.gif';//No I18N
	} else if(iconPath == '/images/discoverystatus_undiscovere.gif'){ //No I18N
		iconClass = 'cspr icon-sm dis-undiscover vsub';//No I18N
		iconPath  = '/images/spacer.gif';//No I18N
	} else{
		iconClass = '';
		iconPath  = iconPath;
	}
    var divExists = true;
    if( mydiv == undefined )
    {
        divExists = false;
        mydiv = document.createElement('DIV');//No I18N
    }

    mydiv.width = '50px';//No I18N
    mydiv.addEventListener('click', function() {
        this.style.display = 'none';//No I18N
    });
    mydiv.id = 'loadingdivid';//No I18N
    mydiv.align = 'left';//No I18N
    mydiv.style.position = "absolute";
    mydiv.setAttribute("style",'padding: 8px; position: absolute; z-index: 300; display:block;');//No I18N

    if( iconPath == null )
    {
        iconPath = '/images/processing.gif';//No I18N
    }

    mydiv.innerHTML = '<img src="' + iconPath + '" align=absmiddle class="'+ iconClass +'"> &nbsp;<span id="centerstatusmsg" class="text-color4 top0 vmiddle" style="font:14px bold verdana,helvetica,arial,sans-serif;">' + loadMessage + '</span>';//No I18N

    if( !divExists )
    {
        document.body.appendChild(mydiv);
        //document.getElementsByTagName('body')[0].appendChild(mydiv);//No I18N
    }

    var width = mydiv.offsetWidth;
    var height = mydiv.offsetHeight;
    var left = (window.screen.width / 2) + document.body.scrollLeft - 50;
    var topx = (window.screen.height / 2) + (document.body.scrollTop/2) - (height/2);
    if(autoClose == "contract")
    {
        left = (window.screen.width / 4) + document.body.scrollLeft - 50;
            topx = (window.screen.height / 4) + (document.body.scrollTop/4) - (height/4);
        autoClose=true;
    }
    mydiv.style.left = parseInt(left) + "px";//No I18N
    mydiv.style.top = parseInt(topx) + "px";//No I18N
    mydiv.style.backgroundColor="rgb(255,255,255)";//No I18N
    mydiv.style.border= 'solid black 1px';//No I18N
    mydiv.style.display='block';//No I18N
    if(autoClose)
    {
        if( autoCloseTime == null )
        {
            autoCloseTime = 3000;
        }
        setTimeout(function() { mydiv.style.display='none'; } , autoCloseTime);//No I18N
    }
}


function findDuplicate( value, selectTag )
{
    var list = new Array();
    var index = 0;

    value = value.split(",")[0];//NO I18N

    var length = selectTag.length;

    for( k=0; k<length; k++ )
    {
        if( value == selectTag.options[k].value.split(",")[0] )
        {
            list[index++] = k;
        }
    }
    return list;
}

function changeProductTypeText(ele)
{
    var addNewProduct = document.getElementById('sform');

    if( addNewProduct.style.display != 'none' )
    {
        //document.getElementById('addNewProductTypeLink').innerHTML = document.getElementById("sdp.admin.producttype.listview.addproducttype").innerHTML;
        document.getElementById('addNewProductTypeLink').parentNode.show();
        document.ProductTypeDefForm.name.value = '';//No I18N
        document.ProductTypeDefForm.itemID.value = null;
        document.ProductTypeDefForm.resourceType.value = "Select";//No I18N
        document.ProductTypeDefForm.category.value = "Select";//No I18N
        document.ProductTypeDefForm.description.value = "";//No I18N
        document.ProductTypeDefForm.mode.value = 'add';//No I18N
    }
    else
    {
        //document.getElementById('addNewProductTypeLink').innerHTML = document.getElementById("sdp.common.cancel").innerHTML;//No I18N
        document.getElementById('addNewProductTypeLink').parentNode.hide();
    }
    //Remove Disabled for Product type & producvt category Select field
    assetSaveAddNew(null,ele)
}
//Remove Disabled for Product type & producvt category Select field
function assetSaveAddNew(saveButton,ele) {
    if(jQuery(ele).find('#addNewProductTypeLink').length === 1 || saveButton === 'saveandadd') {
        jQuery('form[name="ProductTypeDefForm"]').find('#resourceType,#resourceCategory').prop('disabled', false).removeClass('TFDisabled').addClass('form-control').find('option[value=Select]').prop('selected',true).end().end().find('textarea[name=description],input[name=name]').val('');//No I18N
    }
}

function editProductType( productId )
{
    document.ProductTypeDefForm.asset.value = '';
    displayLoadingInformation(null, getMessageForKey('sdp.purchase.progress.indicator.openrecent'), false);//NO I18n
    callCustomAjaxRequestForGET('/ProductTypeDef.do', "mode=edit&productTypeId=" + productId, productAjaxRequestSuccess, ajaxRequestOnFailure, 'edit_product_type');//No I18N
    document.ProductTypeDefForm.mode.value = 'edit';//No I18N
}

var productEdited = false;

function editProduct( productId )
{
    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
    callCustomAjaxRequestForGET('/ProductDef.do', "mode=edit&itemID=" + productId, productAjaxRequestSuccess, ajaxRequestOnFailure, 'edit_product');//No I18N
    document.ProductDefForm.mode.value = 'edit';//No I18N
}

function deleteProductfromView(productId){
	showconfirm(true,"title="+getMessageForKey("sdp.common.delete")+", message="+document.getElementById("deleteProductConfirmMsg").innerHTML+", submitbutton="+getMessageForKey("sdp.common.delete")+", cancelbutton="+getMessageForKey("sdp.common.cancel")+", closebutton=yes, closeOnEscKey=yes",deleteProductfrmview);//NO I18N
	function deleteProductfrmview(valid){
	if(valid)
    {
    callCustomAjaxRequest("/ProductDef.do","mode=delete&productId="+productId, productAjaxRequestSuccess, ajaxRequestOnFailure, 'delete_product_from_view');//NO I18N
	}
	}
}

function redirecttoListView(){
	window.location="/ProductDef.do";
}

function siteAjaxRequestSuccess( req, module )
{
    if( module == 'update_departments_only' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('department'));
        var optionSize = document.getElementById('department').options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            document.getElementById('department').options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
    }
    else if( module == 'get_associated_site_depts' )
    {
        AssetUtil.removeAllOptionTags(AssetUtil.getCurrentForm().department);
        var optionSize = AssetUtil.getCurrentForm().department.options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            AssetUtil.getCurrentForm().department.options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }

        AssetUtil.updateSiteUserDetails();
    }
    else if( module == 'get_associated_user_dept_for_assets' )
    {
        let response = JSON.parse(req.responseText);
        let { department: { name: deptName, id: deptId } = {} } = response || {};
        let { site: { name: siteName, id: site } = {} } = response || {};
        let { isLoggedUserAllowedForUser } = response || {};

        if(!deptId)
        {
            deptId = "0";
            deptName = getMessageForKey('sdp.inventory.workstations.listview.nojustselectusermsg');
        }

        if(!site)
        {
            site = "0"; //NO I18N
            siteName = getMessageForKey('sdp.admin.org.technician.organizationdefault');
        }

        if(!isLoggedUserAllowedForUser){
            showalert("info", getMessageForKey('asset.site.changed.info.message'), "isAutoHide=true"); // No I18N
            deptId = "0";
            deptName = getMessageForKey('sdp.inventory.workstations.listview.nojustselectusermsg');
            jQuery("#department").select2("data", {id: deptId, text: deptName}, false); //NO I18N
            return;
        }

        site = (site == '0') ? '-1' : site;
        if(site > 0 && site != undefined && site != null)
        {
            deptName = deptName + ', ' + siteName;
        }
        jQuery("#department").select2("data", {id: deptId, text: deptName}, false); //NO I18N
        if(jQuery('#usersites').select2("val")  != undefined )
        {
        	if(isMSP && jQuery('#accountNameDiv').is(":visible") && (getAccountId()!=document.getElementById('account').value)) {
        		return;
        	}
            var siteId = jQuery('#usersites').select2("val"); //NO I18N
                if( jQuery('[name=site]').val() != site )
                {
                    if (siteId != -1)
                    {
                        if(confirm(getMessageForKey('sdp.asset.site.changed.warn.message')) )
                        {
                            jQuery('[name=site]').val(site);
                            //document.getElementById('usersites').value = site;
                            if( document.getElementById('usersites_siteSearch') != undefined )
                            {
                                document.getElementById('usersites_siteSearch').value = siteName;
                            }
                jQuery('#usersites').select2("data", {id: site, text: siteName}, false); //NO I18N
                        }
                    }
                    else //Asset not in any site, so assigning the user's site (if exists) to the asset
                    {
                        jQuery('[name=site]').val(site);
                        //document.getElementById('usersites').value = site;
                        if( document.getElementById('usersites_siteSearch') != undefined )
                        {
                            document.getElementById('usersites_siteSearch').value = siteName;
                        }
                jQuery('#usersites').select2("data", {id: site, text: siteName}, false); //NO I18N
                    }
                }
        }
        else if (jQuery('#allsites').select2("val") != undefined )
        {
            var siteId = jQuery('#allsites').select2("val"); //NO I18N
            if( siteId != site )
            {
                jQuery('[name=site]').val(site);
                jQuery('#allsites').select2("data", {id: site, text: siteName}, false); //NO I18N
                if( document.getElementById('allsites_siteSearch') != undefined )
                {
                    document.getElementById('allsites_siteSearch').value = siteName;
                }
            }
        }
    }
    else if( module == 'get_site_users' )
    {
        var userList = document.getElementById('userList');

        if( userList == undefined )
        {
            userList = document.getElementById('allUserList');
        }
        if( userList != undefined )
        {
            AssetUtil.removeCompleteOptionTags(userList);

      var allocatedList = document.getElementById('allocateToUser');//NO I18N


        if( allocatedList != undefined )
        {
                AssetUtil.removeCompleteOptionTags(allocatedList);
        }

            var optionSize = userList.options.length;
            var userObj = req.responseXML.getElementsByTagName("AaaUser");
            var length = userObj.length;
            for( i=0; i<length; i++ )
            {
                userList.options[ optionSize + i ] = new Option(userObj[i].getAttribute("first_name"), userObj[i].getAttribute("user_id"));
            }
        }
    }
    else if( module == 'get_site_depts_for_allocate_site_page' )
    {
        var department = AssetUtil.getCurrentForm().departmentName;
        if(department == null) {
            department = AssetUtil.getCurrentForm().department;
        }
        AssetUtil.removeAllOptionTags(department);
        var optionSize = department.options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            department.options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
    }
    else if( module == 'get_site_associated_dept' )
    {
        var siteObj = req.responseXML.getElementsByTagName("SDOrganization");
        var length = siteObj.length;
        if( length >= 1 )
        {
            AssetUtil.getCurrentForm().site.value = siteObj[0].getAttribute("org_id");
        }
        else
        {
            AssetUtil.getCurrentForm().site.value = "-1";//NO I18n
        }
    }
    else if(module == 'select_site_associated_dept') {
        var siteObj = req.responseXML.getElementsByTagName("SDOrganization");
        var length = siteObj.length;
        var isMatched = false;
        var departmentSite = "-1";
        var departmentSiteName = getMessageForKey('sdp.admin.org.technician.organizationdefault');

        if( length >= 1 )
        {
            departmentSite = siteObj[0].getAttribute("org_id");
            departmentSiteName = siteObj[0].getAttribute("name");
            //Following code is for Site Technician

            if( document.getElementById('site') != undefined  && document.getElementById('userSite') == undefined && document.getElementById('site_siteSearch') == undefined )
            {
                var siteLength = AssetUtil.getCurrentForm().site.options.length;
                for(i=0;i<siteLength;i++)
                {
                    if(AssetUtil.getCurrentForm().site.options[i].value==departmentSite)
                    {
                        isMatched = true;
                        break;
                    }
                }
                if(!isMatched)
                {
                    return;
                }
            }
            else if (document.getElementById('userSite') != undefined  &&  document.getElementById('usersites_siteSearch') == undefined)
            {
                var siteLength = AssetUtil.getCurrentForm().userSite.options.length;
                for(i=0;i<siteLength;i++)
                {
                    if(AssetUtil.getCurrentForm().userSite.options[i].value==departmentSite)
                    {
                        isMatched = true;
                        break;
                    }
                }
                if(!isMatched)
                {
                    return;
                }
            }
        }
        else if(!isMSP)
        {
            //Following code is for Site Technician
            if( document.getElementById('site') != undefined && AssetUtil.getCurrentForm().site.options != null  )
            {
                var siteLength = AssetUtil.getCurrentForm().site.options.length;
                for(i=0;i<siteLength;i++)
                {
                    if(AssetUtil.getCurrentForm().site.options[i].value==departmentSite)
                    {
                        isMatched = true;
                        break;
                    }
                }
                if(!isMatched)
                {
                    return;
                }
            }
            else if (document.getElementById('userSite') != undefined  &&  document.getElementById('usersites_siteSearch') == undefined)
            {
                var siteLength = AssetUtil.getCurrentForm().userSite.options.length;
                for(i=0;i<siteLength;i++)
                {
                    if(AssetUtil.getCurrentForm().userSite.options[i].value==departmentSite)
                    {
                        isMatched = true;
                        break;
                    }
                }
                if(!isMatched)
                {
                    return;
                }
            }
            AssetUtil.getCurrentForm().site.value = departmentSite;//NO I18n

            if( document.getElementById('usersites') != undefined )
            {
                document.getElementById('usersites').value = departmentSite;
                if( document.getElementById('usersites_siteSearch') != undefined )
                {
                    document.getElementById('usersites_siteSearch').value = departmentSiteName;
                }
            }
            else if( document.getElementById('allsites') != undefined )
            {
                document.getElementById('allsites').value = departmentSite;
                if( document.getElementById('allsites_siteSearch') != undefined )
                {
                    document.getElementById('allsites_siteSearch').value = departmentSiteName;
                }
            }
        }
        if(!isMSP || departmentSite != "-1") {
            if( document.getElementById('usersites') != undefined && (document.getElementById('usersites').value != departmentSite) )
            {
                var siteId = document.getElementById('usersites').value ;
                if (siteId != -1)
                {
                    if(!executed) {
                        executed = true;
                        if(confirm(getMessageForKey('sdp.asset.site.changed.warn.message')) )
                        {
                            AssetUtil.getCurrentForm().site.value = departmentSite;
                            if( document.getElementById('usersites') != undefined )
                            {
                                document.getElementById('usersites').value = departmentSite;
                                if( document.getElementById('usersites_siteSearch') != undefined )
                                {
                                    document.getElementById('usersites_siteSearch').value = departmentSiteName;
                                }
                            }
                        }
                    }
                }
                else //Asset not in any site, so assigning the department's site (if exists) to the asset
                {
                    AssetUtil.getCurrentForm().site.value = departmentSite;
                    if( document.getElementById('usersites') != undefined )
                    {
                        document.getElementById('usersites').value = departmentSite;
                        if( document.getElementById('usersites_siteSearch') != undefined )
                        {
                            document.getElementById('usersites_siteSearch').value = departmentSiteName;
                        }
                    }
                }
            }
        }
        if( document.getElementById('allsites') != undefined )
        {
            AssetUtil.getCurrentForm().site.value = departmentSite;

            if( document.getElementById('allsites') != undefined )
            {
                document.getElementById('allsites').value = departmentSite;
                if( document.getElementById('allsites_siteSearch') != undefined )
                {
                    document.getElementById('allsites_siteSearch').value = departmentSiteName;
                }
            }
        }
    }
    else if(module == 'select_site_associated_asset') {
        var siteObj;
        var siteNameObj;
        if(req.responseXML != null)
            {
            siteObj = req.responseXML.getElementsByTagName("ResourceLocation");
            siteNameObj = req.responseXML.getElementsByTagName("SDOrganization");
            }

        var length = 0;
        if(siteObj != null || siteObj !== undefined)
            {
            length = siteObj.length;
            }
        var siteElement;
        var assetSite = jQuery('#allsites');
        if(jQuery('#allsites').length > 0 ){
            siteElement = jQuery('#allsites');
        }else{
            siteElement = jQuery('#usersites');
        }
        if( length >= 1 )
        {

            if(isComponent != undefined && isComponent) {
              //  AssetUtil.getCurrentForm().site.value = siteObj[0].getAttribute("siteid");
                siteElement.select2("data", {id: siteObj[0].getAttribute("siteid"), text: siteNameObj[0].getAttribute("name")}, false); //NO I18N
            }
            else  {
                var assetSite = "-1";
                assetSite = siteElement.select2("val"); //NO I18N
                if(assetSite != "-1"  && assetSite != siteObj[0].getAttribute("siteid")) {
                    if(confirm(getMessageForKey("sdp.asset.site.changed.warn.message2"))) {
                      //  AssetUtil.getCurrentForm().site.value = siteObj[0].getAttribute("siteid");
                        siteElement.select2("data", {id: siteObj[0].getAttribute("siteid"), text: siteNameObj[0].getAttribute("name")}, false); //NO I18N

                    }
                }
                else if(assetSite == "-1") {
                    //AssetUtil.getCurrentForm().site.value = siteObj[0].getAttribute("siteid");
                    siteElement.select2("data", {id: siteObj[0].getAttribute("siteid"), text: siteNameObj[0].getAttribute("name")}, false); //NO I18N
                }
            }
        }
        else
        {
            if(isComponent != undefined && isComponent) {
                //AssetUtil.getCurrentForm().site.value = "-1";//NO I18n
                siteElement.select2("data", {id: -1, text: getMessageForKey("sdp.admin.org.technician.organizationdefault")}, false); //NO I18N
            }
            else  {
                var assetSite = siteElement.select2("val"); //NO I18N
                if(assetSite != "-1") {
                    if(confirm(getMessageForKey("sdp.asset.site.changed.warn.message2"))) {
                      //  AssetUtil.getCurrentForm().site.value = "-1";
                        siteElement.select2("data", {id: -1, text: getMessageForKey("sdp.admin.org.technician.organizationdefault")}, false); //NO I18N
                    }
                }
            }
        }
    }
    else if( module == 'get_unlicensed_users' )
    {
        try
        {
            var ws = req.responseXML.getElementsByTagName("AaaUser");
            var swList = req.responseXML.getElementsByTagName("SoftwareInfo");
            var optionSize = document.getElementById('unlicensedWSList').options.length;
            var length = ws.length;
            for( i=0; i<length; i++ )
            {
                if( swList.length == 0 )
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(ws[i].getAttribute("first_name"), ws[i].getAttribute("user_id"));
                }
                else
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(ws[i].getAttribute("first_name"), ws[i].getAttribute("user_id") + "," + swList[i].getAttribute("softwareid"));//NO I18N
                }
            }

            if( length == 0 )
            {
                document.getElementById('nodatadiv_data').innerHTML = '<b>'+document.getElementById("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg").innerHTML+'</b>';//NO I18N
                Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
            }
        }
        catch(e)
        {
            document.getElementById('nodatadiv_data').innerHTML = '<b>' + req.responseText + '</b>';//NO I18N
            Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
        }
        Hide('centerstatus');//NO I18N
        changeSearchText(document.getElementById('searchBox'));
    }
    else if( module == 'get_unlicensed_ws' )
    {
        try
        {
            AssetUtil.removeCompleteOptionTags(document.getElementById('unlicensedWSList'));
            var optionSize = document.getElementById('unlicensedWSList').options.length;
            var wsList = req.responseXML.getElementsByTagName("Resources");
            var swList = req.responseXML.getElementsByTagName("SoftwareInfo");
            var length = wsList.length;
            for( i=0; i<length; i++ )
            {
                if( swList.length == 0 )
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(wsList[i].getAttribute("resourcename"), wsList[i].getAttribute("resourceid"));
                }
                else
                {
                    document.getElementById('unlicensedWSList').options[ optionSize + i ] = new Option(wsList[i].getAttribute("resourcename"), wsList[i].getAttribute("resourceid") + "," + swList[i].getAttribute("softwareid"));//NO I18N
                }
            }

            var currentLicenseType = document.getElementById('licenseType').value;

            var len = document.getElementById('unlicensedWSList').length;

            if( currentLicenseType == 3 ) //Enterprise
            {
                if( len > 0 )
                {
                    for(i=0;i<len;i++)
                    {
                        document.getElementById('unlicensedWSList').options[i].selected = true;
                    }
                    copyListValues('unlicensedWSList','allocateToWSList', null);//NO I18N
                }
            }
            if( len == 0 )
            {
                document.getElementById('nodatadiv_data').innerHTML = '<b>'+document.getElementById("sdp.inventory.addNewSWLicense.filter.nodatafoundmsg").innerHTML+'</b>';//NO I18N
                Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
            }
        }
        catch(e)
        {
            document.getElementById('nodatadiv_data').innerHTML = '<b>' + req.responseText + '</b>';//NO I18N
            Show('nodatadiv');setTimeout(function(){Hide('nodatadiv')},3000);//NO I18N
        }

        Hide('centerstatus');//NO I18N
        changeSearchText(document.getElementById('searchBox'));
    }
    else if( module == 'update_departments' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('department'));
        var optionSize = document.getElementById('department').options.length;

        var deptObj = req.responseXML.getElementsByTagName("DepartmentDefinition");
        var length = deptObj.length;
        for( i=0; i<length; i++ )
        {
            document.getElementById('department').options[i + 1] = new Option(deptObj[i].getAttribute("deptname"), deptObj[i].getAttribute("deptid"));
        }
        updateInstalledServerNames(document.getElementById('componentID'));
    }
    else if( module == 'get_active_ws' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('allocateToWorkstation'));
        //AssetUtil.removeAllOptionTags(document.getElementById('installedWorkstation'));

        var wsList = req.responseXML.getElementsByTagName("Resources");

        var length = wsList.length;
        for( i=1; i<=length; i++ )
        {
            document.getElementById('allocateToWorkstation').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
            //document.getElementById('installedWorkstation').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
        }
    }
    else if( module == 'get_installed_ws' )
    {
        AssetUtil.removeAllOptionTags(document.getElementById('associatedServer'));
        AssetUtil.removeAllOptionTags(document.getElementById('allocateToWorkstation'));
        //AssetUtil.removeAllOptionTags(document.getElementById('installedWorkstation'));

        var wsList = req.responseXML.getElementsByTagName("Resources");

        var length = wsList.length;
        for( i=1; i<=length; i++ )
        {
            document.getElementById('associatedServer').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
            document.getElementById('allocateToWorkstation').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
            //document.getElementById('installedWorkstation').options[i] = new Option(wsList[i - 1].getAttribute("resourcename"), wsList[i - 1].getAttribute("resourceid"));
        }

    }
}

function swapNetworkOrRange()
{
    if(document.EditNetwork.specifyRange[0].checked == true)
    {
        document.getElementById("entireNetworkTable").style.display ="block";
        document.getElementById("rangeTable").style.display ="none";

        document.EditNetwork.nameD.value=0;
        document.EditNetwork.nameD.disabled=true;

    }
    else if(document.EditNetwork.specifyRange[1].checked == true)
    {
        document.getElementById("entireNetworkTable").style.display ="none";
        document.getElementById("rangeTable").style.display ="block";

        //document.EditNetwork.fromAddressD.value=1;
        //document.EditNetwork.toAddressD.value=255;
    }

}

function setToAddress()
{
    document.EditNetwork.toAddressA.value=document.EditNetwork.fromAddressA.value;
    document.EditNetwork.toAddressB.value=document.EditNetwork.fromAddressB.value;
    document.EditNetwork.toAddressC.value=document.EditNetwork.fromAddressC.value;
    //document.EditNetwork.toAddressA.value=document.EditNetwork.fromAddressA.value;

}
function validateNetworkAddress(form)
{
    if(sdp_app.IS_DEMO_BUILD) {
        showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
		return false;
	}
    document.EditNetwork.name.value=trimAll(document.EditNetwork.nameA.value) + ".";    // no I18N
    document.EditNetwork.name.value=document.EditNetwork.name.value + trimAll(document.EditNetwork.nameB.value) + ".";  // no I18N
    document.EditNetwork.name.value=document.EditNetwork.name.value + trimAll(document.EditNetwork.nameC.value) + ".";  // no I18N
    document.EditNetwork.name.value=document.EditNetwork.name.value + trimAll(document.EditNetwork.nameD.value) ;
    if(trimAll(form.name.value) == "")
    {
        alert(document.getElementById('enternetworkaddress').innerHTML);
        form.nameA.focus();
        return false;
    }
    else
    {
        if(!validateIP(form.name.value))
        {
            alert(document.getElementById("entervalidnetworkaddress").innerHTML);
            return false;
        }
    }

    form.name.value = trimAll(form.name.value);
    return true;

}
function changeProductText()
{
    var addNewProduct = document.getElementById('sform');

    if( productEdited )
    {
        var optionSize = document.ProductDefForm.softwareList.options.length;
        document.getElementById('softwareList').options[optionSize-1] = null;
        this.productEdited = false;
    }

    if( addNewProduct.style.display != 'none' )
    {
        //document.getElementById('productAddNewLink').innerHTML = document.getElementById("sdp.purchase.addNew.popUpProduct.title").innerHTML;
        document.getElementById('productAddNewLink').parentNode.show();
        document.ProductDefForm.softwareList.value = '-1';//No I18N
        document.ProductDefForm.name.value = '';//No I18N
        document.ProductDefForm.componentType.value = '';//No I18N
        document.ProductDefForm.manufacturer.value = '';//No I18N
        document.ProductDefForm.partNo.value = '';//No I18N
        if(document.ProductDefForm.cost != undefined){
            document.ProductDefForm.cost.value = parseFloat('0').toFixed(sdp_app.MAX_ALLOWED_DECIMAL_POINTS);
        }
        document.ProductDefForm.description.value = "";//No I18N
        document.ProductDefForm.itemID.value = '';//No I18N
        document.ProductDefForm.mode.value = 'add';//No I18N
        //Depreciation Start
        document.ProductDefForm.depreciationTypeId.value = '';//No I18N
        document.ProductDefForm.declinePercent.value = '';//No I18N
        document.ProductDefForm.depreciationPercent.value = '';//No I18N
        document.ProductDefForm.salvageValue.value = '';//No I18N
        document.ProductDefForm.usefulLife.value = '';//No I18N
        document.getElementById("depreciationDetail").style.display = 'none';
        document.getElementById("depreciationTypeRadioButton").style.display = 'none';
        document.getElementById("usefulLifeRadio").style.display = 'none';
        document.getElementById("depreciationPercentRadio").style.display = 'none';
        document.getElementById("declinePercentRadio").style.display = 'none';

        document.getElementById("depreciationType").style.display = 'none';
        document.getElementById("declinePercentType").style.display = 'none';
        document.getElementById("usefulLifeType").style.display = 'none';
        document.getElementById("salvageValueType").style.display = 'none';
        document.getElementById("depreciationPercentType").style.display = 'none';
        //Depreciation End
        if(document.ProductDefForm.cost != undefined){
            uploadImageSlider.resetImagesList();
        }
    }
    else
    {
        //document.getElementById('productAddNewLink').innerHTML = document.getElementById("sdp.common.cancel").innerHTML;//No I18N
        document.getElementById('productAddNewLink').parentNode.hide();
    }
}
function validateIPRange(form)
{


    document.EditNetwork.fromAddress.value=trimAll(document.EditNetwork.fromAddressA.value) + ".";  // no I18N
    document.EditNetwork.fromAddress.value=document.EditNetwork.fromAddress.value+trimAll(document.EditNetwork.fromAddressB.value) + ".";   // no I18N
    document.EditNetwork.fromAddress.value=document.EditNetwork.fromAddress.value+trimAll(document.EditNetwork.fromAddressC.value) + ".";   // no I18N
    document.EditNetwork.name.value=document.EditNetwork.fromAddress.value+".0";    // no I18N
    document.EditNetwork.fromAddress.value=document.EditNetwork.fromAddress.value+trimAll(document.EditNetwork.fromAddressD.value);

    if(trimAll(form.fromAddress.value) == "")
    {
        alert(getMessageForKey("sdp.admin.scan.network.addnw.jsnofromipmsg"));// no I18N
        form.fromAddressA.focus();
        return false;
    }
    else
    {
        if(!validateIP(form.fromAddress.value))
        {
            alert(getMessageForKey("sdp.admin.scan.network.addnw.jsinvalidFromipmsg")); //no I18N
            return false;
        }
    }


    document.EditNetwork.toAddress.value=trimAll(document.EditNetwork.toAddressA.value) + ".";  // no I18N
    document.EditNetwork.toAddress.value=document.EditNetwork.toAddress.value+trimAll(document.EditNetwork.toAddressB.value) + "."; // no I18N
    document.EditNetwork.toAddress.value=document.EditNetwork.toAddress.value+trimAll(document.EditNetwork.toAddressC.value) + "."; // no I18N
    document.EditNetwork.toAddress.value=document.EditNetwork.toAddress.value+trimAll(document.EditNetwork.toAddressD.value);

    if(trimAll(form.toAddress.value) == "")
    {
        alert(getMessageForKey("sdp.admin.scan.network.addnw.jsnotoipmsg"));   // no I18N
        form.fromAddressA.focus();
        return false;
    }
    else
    {
        if(!validateIP(form.toAddress.value))
        {
            alert(getMessageForKey("sdp.admin.scan.network.addnw.jsinvalidtoipmsg"));  // no I18N
            return false;
        }
    }

    var validRange=false;
    if(parseInt(document.EditNetwork.toAddressA.value) > parseInt(document.EditNetwork.fromAddressA.value))
    {
        validRange=true;
    }
    else if(parseInt(document.EditNetwork.toAddressA.value) == parseInt(document.EditNetwork.fromAddressA.value))
    {
        if(parseInt(document.EditNetwork.toAddressB.value) > parseInt(document.EditNetwork.fromAddressB.value))
        {
            validRange=true;
        }
        else if(parseInt(document.EditNetwork.toAddressB.value) == parseInt(document.EditNetwork.fromAddressB.value))
        {
            if(parseInt(document.EditNetwork.toAddressC.value) > parseInt(document.EditNetwork.fromAddressC.value))
            {
                validRange=true;
            }
            else if(parseInt(document.EditNetwork.toAddressC.value) == parseInt(document.EditNetwork.fromAddressC.value))
            {
                if(parseInt(document.EditNetwork.toAddressD.value) >= parseInt(document.EditNetwork.fromAddressD.value))
                {
                    validRange=true;
                }
            }
        }
    }

    if(validRange)
    {
        form.fromAddress.value = trimAll(form.fromAddress.value);
        form.toAddress.value = trimAll(form.toAddress.value);
    }
    else
    {
        alert(getMessageForKey("sdp.admin.scan.network.addnw.jsvalidipmsg"));  // no I18N
    }


    return validRange;
}
//MDP added this code, windows domain is moved to esm page
function DomainSubmitAction(form,savemode){
		if(isMSP && forwardfrom === "ESM"){
			var saveParam=(savemode!=undefined)?"&"+savemode+"=Save" : "";
			sdpAjax({
				url: "/EditDomain.do",  //No I18N
				async:false,
                dataType:'text', //No I18N
                ignorefailuremessage : true,
				cache:false,
				type: 'POST', //No I18N
				data: jQuery(form).serialize()+savParam,
				complete: function (resp) {
					jQuery("#mdhSection-content").html(resp.responseText);
				}
			});
			return false;
		}else{
		  return true;
		}
}

function validateDomainForm(form,submitType)
{
    var regex = /^[A-Za-z0-9\u0080-\uFFFF](?:[A-Za-z0-9\u0080-\uFFFF.-]*[A-Za-z0-9\u0080-\uFFFF])?$/;
    if(!form.name.value.match(regex) && form.name.value!= null && !trimAll(form.name.value) == "") {
            showalert('failure',getMessageForKey('windows.domain.scan.nameerror.regex.alert'),'isAutoHide=true,delay=3');//No I18N
            return false;
    }
    if(sdp_app.IS_DEMO_BUILD) {
        showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
        return false;
    }
    if(trimAll(form.name.value) == "")
    {
      alert(document.getElementById('enterDomainNameMsg').innerHTML);
      form.name.focus();
      return false;
    }
    // SD-13320 Domain name should be uppercase when adding domain name in domaininfo - SSO did't work
    form.name.value = trimAll(form.name.value.toUpperCase());
        if(submitType == 'addButton'){
        form.addButton.value = 'Save';  //no I18n
    }
    else if(submitType == 'addAndAddNew'){
        form.addAndAddNew.value = 'Save and Scan now';  //no I18n

    }
    else if(submitType == 'updateButton'){
        form.updateButton.value = 'Save';  //no I18n
    }
    else if(submitType == 'updateAndAddNew'){
        form.updateAndAddNew.value = 'Save and Scan now';  //no I18n
    }
    var password = form.password.value;
    if(password!=null && password!=undefined)
    {
        if(password!=null && password!=""){
        form.password.value = encryptDataWithRSA(password);
        }
    }
    return DomainSubmitAction(form,submitType); //to perform submit from esm directory
}

function setWsType(componentType)
{
    if(isWorkstationSelected() || isServerSelected())
    {
        if(document.getElementById("workstationType")!=null && document.getElementById("workstationType")!=undefined)
        {
            document.getElementById("workstationType").style.display = '';
        }
        if(document.getElementById("depreciationDetail")!=null && document.getElementById("depreciationDetail")!=undefined)
        {
            document.getElementById("depreciationDetail").style.display = '';
        }
        Hide("softwareDiv");//No I18N
    }
    else if (isSoftwareSelected())
    {
        document.ProductDefForm.wsType.value = -1;
        document.getElementById("softwareDiv").style.display = '';
        if(document.getElementById("workstationType")!=null && document.getElementById("workstationType")!=undefined){
            document.getElementById("workstationType").style.display = 'none';
        }
        if(document.getElementById("depreciationDetail")!=null && document.getElementById("depreciationDetail")!=undefined)
        {
            document.getElementById("depreciationDetail").style.display = 'none';
        }
        //document.getElementById("licenseType").style.display = 'block';
        //displayInsCount(document.ProductDefForm);
    }
    else
    {
        document.ProductDefForm.wsType.value = -1;
        Hide("softwareDiv");//No I18N
        if(document.getElementById("workstationType")!=null && document.getElementById("workstationType")!=undefined)
        {
            document.getElementById("workstationType").style.display = 'none';
        }
        if(document.getElementById("depreciationDetail")!=null && document.getElementById("depreciationDetail")!=undefined)
        {
            if( document.ProductDefForm.componentType.value==''|| componentType == "Consumable")
            {
                document.getElementById("depreciationDetail").style.display = 'none';
            }
            else if(componentType != "Consumable")
            {
                document.getElementById("depreciationDetail").style.display = 'block';
            }
        }
    }
}

function isWorkstationSelected()
{
    var selIndx = document.ProductDefForm.componentType.selectedIndex;
    var data = document.ProductDefForm.componentType.options[selIndx].text;
    var editedWsType = document.ProductDefForm.editedWsTypeName.value;
    if(data==editedWsType)
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isServerSelected()
{
    var selIndx = document.ProductDefForm.componentType.selectedIndex;
    var data = document.ProductDefForm.componentType.options[selIndx].text;
    var editedServerType = document.ProductDefForm.editedServerTypeName.value;
    if(data==editedServerType)
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isSoftwareSelected()
{
    var selIndx = document.ProductDefForm.componentType.selectedIndex;
    var data = document.ProductDefForm.componentType.options[selIndx].text;
    var editedSoftwareType = document.ProductDefForm.editedSoftwareTypeName.value;
    if(data==editedSoftwareType)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function editProductVendor( productVendorId )
{
    displayLoadingInformation(null, document.getElementById('sdp.purchase.progress.indicator.openrecent').innerHTML, false);//NO I18n
    callCustomAjaxRequestForGET('/ProductDef.do', "mode=editProductVendor&productVendorId=" + productVendorId, productAjaxRequestSuccess, ajaxRequestOnFailure, 'edit_product_vendor');//No I18N
}

function productAjaxRequestSuccess( req, module )
{
    if( (module == "save_product" || module == "save_and_add_new_product" || module == "save_product_update" || module == "save_and_add_new_product_update") && req.responseText.indexOf("AuthError.jsp") >= 0 ) //No I18N
    {
        parent.window.open('/jsp/Error.jsp', '_self');//No i18n
        return;
    }
    if( module == 'edit_product_vendor' )
    {
        var result = req.responseXML;
        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            document.ProductVendorForm.productVendorId.value = result.getElementsByTagName("COMPONENTVENDORID")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.vendor.value = result.getElementsByTagName("VENDORID")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.price.value = result.getElementsByTagName("COMPONENTPRICE")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.warrantyYrs.value = result.getElementsByTagName("WARRANTYPERIODYRS")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.warrantyMths.value = result.getElementsByTagName("WARRANTYPERIODMTHS")[0].childNodes[0].nodeValue;//NO I18N
            if(result.getElementsByTagName("MAINTVENDORID")[0].childNodes[0] != undefined)
            {
                document.ProductVendorForm.maintanenceVendor.value = result.getElementsByTagName("MAINTVENDORID")[0].childNodes[0].nodeValue;//NO I18N
            }
            document.ProductVendorForm.comments.value = result.getElementsByTagName("COMMENTS")[0].childNodes[0].nodeValue;//NO I18N
            document.ProductVendorForm.taxrate.value = result.getElementsByTagName("TAXRATE")[0].childNodes[0].nodeValue;//NO I18N
            getVendorCurrency(result.getElementsByTagName("VENDORID")[0].childNodes[0].nodeValue,"edit_product_vendor");
            document.getElementById('loadingdivid').style.display = 'none';//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = result.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'save_product_type' ||  module == 'save_and_add_new_product_type' || module == 'save_product_type_update' || module == 'save_and_add_new_product_type_update' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductTypeView'));//NO I18N

            if( module == 'save_product_type_update' || module == 'save_and_add_new_product_type_update' )
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.setup.productyype.updatemsg'), true, 2000)},1000);//NO I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.setup.productyype.addedmsg'), true, 2000)},1000);//NO I18N
            }

            if( module == 'save_and_add_new_product_type_update' )
            {
                document.ProductTypeDefForm.mode.value = "add";//No I18N
            }

            document.ProductTypeDefForm.name.value = "";//NO I18N
            if( module == 'save_product_type' || module == 'save_product_type_update')
            {
                document.ProductTypeDefForm.resourceType.value = "Select";//NO I18N
                document.ProductTypeDefForm.category.value = "Select";//NO I18N
                setTimeout(function(){new Effect.toggle($('sform'),'Slide');changeProductTypeText()},3000);//NO I18N
            }
            else
            {
                document.ProductTypeDefForm.name.focus();
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = encodeHTML(addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'edit_product_type' )
    {
        var result = req.responseXML;

        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            var productTypeId = result.getElementsByTagName("ID")[0].childNodes[0].nodeValue;
            var productTypeName = result.getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
            var description = '';
            try
            {
                description = result.getElementsByTagName("DESCRIPTION")[0].childNodes[0].nodeValue;
            }
            catch(e)
            {
            }

            var category = result.getElementsByTagName("CATEGORY")[0].childNodes[0].nodeValue;
            var resourceType = result.getElementsByTagName("RESOURCETYPE")[0].childNodes[0].nodeValue;
            var isSoftware = result.getElementsByTagName("ISSOFTWARE")[0].childNodes[0].nodeValue;

            document.ProductTypeDefForm.name.value = productTypeName;
            document.ProductTypeDefForm.itemID.value = productTypeId;
            var resourceTypeSelect = document.ProductTypeDefForm.resourceType;
            if(isSoftware == "true")
            {
                resourceTypeSelect.options[resourceTypeSelect.options.length] = new Option("Software", resourceType);
            }
            else
            {
                if(resourceTypeSelect.options.length > 4)
                {
                    //resourceTypeSelect.remove(4);
                    jQuery("#resourceType option:last").remove();
                }
            }
            document.ProductTypeDefForm.resourceType.value = resourceType;
            document.ProductTypeDefForm.category.value = category;
            document.ProductTypeDefForm.description.value = description;
            if(isDefault == "true")
            {
                document.ProductTypeDefForm.resourceType.disabled = true;
                document.ProductTypeDefForm.category.disabled = true;
                document.ProductTypeDefForm.resourceType.className = "TFDisabled";
                document.ProductTypeDefForm.category.className = "TFDisabled";
                if (isMSP)
                {
                    document.getElementById('defaultPTMsgTr').style.display = '';
                }
            }
            else
            {
                document.ProductTypeDefForm.resourceType.disabled = false;
                document.ProductTypeDefForm.category.disabled = false;
                document.ProductTypeDefForm.resourceType.className = "form-control";
                document.ProductTypeDefForm.category.className = "form-control";
                if (isMSP)
                {
                    document.getElementById('defaultPTMsgTr').style.display = 'none';
                }
            }
            try
            {
                document.ProductTypeDefForm.asset.value = result.getElementsByTagName("PREVIOUSTYPE")[0].childNodes[0].nodeValue;
            }
            catch(ex) {}
            if( document.getElementById('sform').style.display == 'none' )
            {
                changeProductTypeText();
                Show('sform');
            }
            document.getElementById('loadingdivid').style.display = 'none';
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML =  addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'edit_product' )
    {
        var result = req.responseXML;
        document.getElementById('loadingdivid').style.display = 'none';

        if( result.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            if( document.getElementById('sform').style.display == 'none' )
            {
                changeProductText();
                Show('sform');
            }
            try
            {
                //Depreciation Start
                document.ProductDefForm.depreciationTypeId.value = "";
                document.ProductDefForm.declinePercent.value = "";
                document.ProductDefForm.depreciationPercent.value = "";
                document.ProductDefForm.salvageValue.value = "";
                document.ProductDefForm.usefulLife.value = "";
                var depreciationTypeId="";
                var salvageValue="";
                var declinePercent= "";
                var depreciationPercent = "";
                var usefulLife = "";
                var depreciationTypeRadio;
                var productId = result.getElementsByTagName("ID")[0].childNodes[0].nodeValue;
                var productName = result.getElementsByTagName("COMPONENTNAME")[0].childNodes[0].nodeValue;
                var productTypeId = result.getElementsByTagName("COMPONENTTYPEID")[0].childNodes[0].nodeValue;
                var manufacturer = '-';//No I18N
                if( result.getElementsByTagName("MANUFACTURERNAME")[0].childNodes[0] != undefined )
                {
                    manufacturer = result.getElementsByTagName("MANUFACTURERNAME")[0].childNodes[0].nodeValue;
                }
                var productTypeId = result.getElementsByTagName("COMPONENTTYPEID")[0].childNodes[0].nodeValue;
                var partNo = result.getElementsByTagName("PARTNO")[0].childNodes[0].nodeValue;
                var cost = 0.0;
                if(result.getElementsByTagName("COST")[0] != undefined){
                    cost = result.getElementsByTagName("COST")[0].childNodes[0].nodeValue;
                }
                var imagesArr = [];
                if(result.getElementsByTagName("IMAGES")[0] != undefined){
                    var imagesStr = result.getElementsByTagName("IMAGES")[0].childNodes[0].nodeValue;
                    if(imagesStr != "" && imagesStr != "null") {
                        var imgArray = imagesStr.split(",");
                        for(index=0; index<imgArray.length; index++) {
                            var object = {content_url : imgArray[index]};
                            imagesArr.push(object);
                        }
                    }
                }
                //Depreciation Start
                if( result.getElementsByTagName("DEPRECIATIONTYPEID")!= undefined &&  result.getElementsByTagName("DEPRECIATIONTYPEID").length>0)
                {
                    document.ProductDefForm.depreciationTypeId.value = result.getElementsByTagName("DEPRECIATIONTYPEID")[0].childNodes[0].nodeValue;
                    var depreciationType = document.ProductDefForm.depreciationTypeId.options[document.ProductDefForm.depreciationTypeId.selectedIndex].innerHTML;
                    depreciationTypeId = document.ProductDefForm.depreciationTypeId.value;
                    if( depreciationType != undefined && depreciationType.length>0)
                    {
                        if(result.getElementsByTagName("SALVAGEVALUE")!= undefined && result.getElementsByTagName("SALVAGEVALUE").length>0)
                        {
                            salvageValue =  result.getElementsByTagName("SALVAGEVALUE")[0].childNodes[0].nodeValue;
                        }
                        if( depreciationType == "Declining Balance")
                        {
                            depreciationTypeRadio = result.getElementsByTagName("DEPRECIATIONTYPERADIO")[0].childNodes[0].nodeValue;
                            if(depreciationTypeRadio == "DeclinePercent")
                            {
                                declinePercent = result.getElementsByTagName("DEPRECIATIONPERCENT")[0].childNodes[0].nodeValue;
                            }
                            else if(depreciationTypeRadio == "UsefulLife")
                            {
                                usefulLife =  result.getElementsByTagName("USEFULLIFE")[0].childNodes[0].nodeValue;
                            }
                        }
                        else if(depreciationType == "Straight Line")
                        {
                            depreciationTypeRadio = result.getElementsByTagName("DEPRECIATIONTYPERADIO")[0].childNodes[0].nodeValue;
                            if(depreciationTypeRadio == "DepreciationPercent")
                            {
                                depreciationPercent = result.getElementsByTagName("DEPRECIATIONPERCENT")[0].childNodes[0].nodeValue;
                            }
                            else if(depreciationTypeRadio == "UsefulLife")
                            {
                                usefulLife =  result.getElementsByTagName("USEFULLIFE")[0].childNodes[0].nodeValue;
                            }
                        }
                        else
                        {
                            usefulLife =  result.getElementsByTagName("USEFULLIFE")[0].childNodes[0].nodeValue;
                        }
                    }
                }
                //Depreciation End
                var comments = result.getElementsByTagName("COMMENTS")[0].childNodes[0].nodeValue;
                var wsType = result.getElementsByTagName("WSTYPE")[0].childNodes[0].nodeValue;
                var licenseType = result.getElementsByTagName("LICENSETYPE")[0].childNodes[0].nodeValue;

                if( result.getElementsByTagName("SOFTWARE") != undefined && result.getElementsByTagName("SOFTWARE").length>0)
                {
                    var len = result.getElementsByTagName("SOFTWARE").length;

                    var optionSize = document.ProductDefForm.softwareList.options.length;

                    if( productEdited )
                    {
                        optionSize = optionSize - 1;
                    }
                    document.getElementById('softwareList').options[optionSize] = new Option(result.getElementsByTagName("SOFTWARE")[0].childNodes[0].nodeValue, result.getElementsByTagName("SOFTWARE")[0].getAttribute("id"));
                    document.getElementById('softwareList').value = result.getElementsByTagName("SOFTWARE")[0].getAttribute("id");
                    this.productEdited = true;
                }
                document.ProductDefForm.componentType.value = productTypeId;
                document.ProductDefForm.name.value = productName;
                document.ProductDefForm.manufacturer.value = manufacturer;
                document.ProductDefForm.partNo.value = partNo;
                document.ProductDefForm.oldPartNo.value = partNo;
                if(document.ProductDefForm.cost != undefined){
                    document.ProductDefForm.cost.value = cost;
                    uploadImageSlider.init("product", "img-slider", "chooseQnImages", imagesArr, 5);    //NO I18N
                }
                //Depreciation Start
                document.ProductDefForm.depreciationTypeId.value = depreciationTypeId;
                document.ProductDefForm.declinePercent.value = declinePercent;
                document.ProductDefForm.depreciationPercent.value = depreciationPercent;
                document.ProductDefForm.salvageValue.value = salvageValue;
                document.ProductDefForm.usefulLife.value = usefulLife;

                document.ProductDefForm.oldDepreciationTypeId.value = depreciationTypeId;
                document.ProductDefForm.oldDeclinePercent.value = declinePercent;
                document.ProductDefForm.oldDepreciationPercent.value = depreciationPercent;
                document.ProductDefForm.oldSalvageValue.value = salvageValue;
                document.ProductDefForm.oldUsefulLife.value = usefulLife;
                //Depreciation End
                document.ProductDefForm.description.value = comments;
                document.ProductDefForm.itemID.value = productId;
                var isAssetBuild = result.getElementsByTagName("isAssetBuild")[0].childNodes[0].nodeValue;
                if( document.ProductVendorForm != undefined )
                {
                    document.ProductVendorForm.itemID.value = productId;
                }


                document.ProductDefForm.wsType.value = wsType;

                //setWsType();
                getConsumableProductType(productTypeId);
                //Depreciation
                setDepreciationTypeMethod(document.ProductDefForm,depreciationTypeRadio);
                ShowProductTab('productDetails');//NO I18n
            }
            catch(e)
            {
                document.getElementById('loadingdivid').style.display = 'none';
                document.getElementById('errorMessageTag').innerHTML =  e.message;
                ShowHide('operation_status');//NO I18N
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML =  addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'delete_product_type' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductTypeView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.common.deletedsuccessfully').innerHTML, true, 2000)},1000);//NO I18N
            if(addedstatus.getElementsByTagName("isProductTypeHidden").length != 0)
            {
                jQuery('#hiddenProductTypeInfo').removeClass('hide');
            }
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'visible_product_types' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('HiddenProductTypeView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue, true, 2000)},1000);//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
     else if( module == 'delete_product' )
     {
         var addedstatus = req.responseXML;
         if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
         {
             refreshSubView(getPortalViewName('ProductView'));//NO I18N
             setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.backup.file.delete.success.msg').innerHTML, true, 2000)},1000);//NO I18N
         }
         else
         {
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
             document.getElementById('loadingdivid').style.display = 'none';
             document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
             ShowHide('operation_status');//NO I18N

         }
     }
    else if( module == 'save_product' || module == 'save_and_add_new_product' || module =='save_product_update' || module == 'save_and_add_new_product_update' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductView'));//NO I18N
            if(document.ProductDefForm.cost != undefined){
                uploadImageSlider.resetImagesList();
            }

           if( module == 'save_product_update' || module == 'save_and_add_new_product_update' )
           {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif', getMessageForKey('sdp.admin.common.updatedsuccessfully'), true, 2000)},1000);//NO I18N
                document.ProductDefForm.mode.value = "add";//No I18N
           }
           else
           {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.common.addedsuccessfully'), true, 2000)},1000);//NO I18N
           }

            document.ProductDefForm.name.value = "";//NO I18N

            if( module == 'save_product' || module == 'save_product_update')
            {
                //Removing added software
                if(document.getElementById('softwareList').selectedIndex != -1)  {
                    document.getElementById('softwareList').options[document.getElementById('softwareList').selectedIndex] = null;
                }
                setTimeout(function(){new Effect.toggle($('sform'),'Slide');changeProductText()},3000);//NO I18N

        }

			else
            {
                document.ProductDefForm.name.focus();
            }

            /*while ( document.ProductDefForm.associatedSoftwareList.options.length > 0 )
            {
                document.ProductDefForm.associatedSoftwareList.remove(0);
            }*/
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
            setTimeout(function(){new Effect.toggle($('sform'),'Slide');changeProductText()},1000);//NO I18N
    }

    }
    else if( module == 'add_vendor' )
    {
        document.ProductVendorForm.productVendorId.value = '';

        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            if(addedstatus.getElementsByTagName("updatedata")[0] != undefined && addedstatus.getElementsByTagName("updatedata")[0].childNodes[0].nodeValue == 'update' && addedstatus.getElementsByTagName("updatedata")[0].childNodes[0].nodeValue != null)
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif', getMessageForKey("sdp.admin.common.updatedsuccessfully"), true, 2000)},1000);//NO I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.common.addedsuccessfully').innerHTML, true, 2000)},1000);//NO I18N
            }
            document.ProductVendorForm.vendor.value = '';
            document.ProductVendorForm.price.value = '';
            document.ProductVendorForm.warrantyYrs.value = '0';
            document.ProductVendorForm.warrantyMths.value = '0';
            document.ProductVendorForm.maintanenceVendor.value = '';
            document.ProductVendorForm.comments.value = '';
            document.ProductVendorForm.taxrate.value = '0';
            refreshSubView(getPortalViewName('ProductVendorView'));//NO I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
    else if( module == 'update_product_vendors' )
    {
        document.getElementById('productvendorlist').innerHTML = req.responseText;
        var scrObjs = document.getElementById('productvendorlist').getElementsByTagName("script");
        /* Fix for SD-69533, scripts object array length cannot be assigned to any varaible, as the script which is executed by eval might also have the same varible under the same scope */
        for( i=0; i<scrObjs.length; i++ )
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
                newScript.nonce = sdpNonce;
                document.getElementsByTagName("head")[0].appendChild(newScript);
            }
            catch(e){}
        }
    }
    else if( module == 'delete_vendor' )
    {
        var addedstatus = req.responseXML;
        if( addedstatus.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200 )
        {
            refreshSubView(getPortalViewName('ProductVendorView'));//NO I18N
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',document.getElementById('sdp.admin.backup.file.delete.success.msg').innerHTML, true, 2000)},1000);//NO I18N
        }
        else
        {
            //alert( addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue);//NO I18N
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('errorMessageTag').innerHTML = addedstatus.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            ShowHide('operation_status');//NO I18N
        }
    }
}
function addSoftwareManufacturer(e)
{
    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
    showURLInDialog("/software/addmanufacturer.jsp","closeButton=no,position=relative,title=");//No I18N
}
function addManagedSoftware(e)
{
    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
    var param = "";
    if( document.getElementById('softwareManufacturer') != undefined )
    {
        param = "?softwareManufacturer=" + document.getElementById('softwareManufacturer').value + '&date=' + new Date().getMilliseconds();//NO I18n
    }
        else
    {
        param = '?date=' + new Date().getMilliseconds();//NO I18N
    }
    showURLInDialog("/software/addmanagedsoftware.jsp" + param,"closeButton=yes,position=absmiddle,left=" + (e.screenX - 370) + ",top=" + (e.screenY -  180) + ",title=");//No I18N
}
function addNewSWMfg()
{
    if( trim(document.getElementById('mfgName').value) == '' )
    {
        alert(getMessageForKey('sdp.admin.software.swmfg.chooseswmfg'));//No I18N
        document.getElementById('mfgName').focus();
        return false;
    }
    var param = "action=add_sw_mfg&name=" + encodeURIComponent(document.getElementById('mfgName').value); //No I18N
    if( document.getElementById('swvendor') != undefined )
    {
        param += "&swvendor=" + document.getElementById('swvendor').value;//No I18N
    }
    else
    {
        param += "&swvendor=-1";//No I18N
    }
    param += "&description=" + encodeURIComponent(document.getElementById('mfgDescription').value);//No I18N
    callCustomAjaxRequest("/servlet/AJaxServlet", param, softwareAjaxRequestSuccess, ajaxRequestOnFailure, 'add_sw_mfg');//No I18N
}
function changeAsManagedSoftware( unManagedList )
{
    if(unManagedList != undefined && unManagedList.value != '')
    {
        var param = "action=change_as_managed_software&softwareId=" + unManagedList.value; //No I18N
        callCustomAjaxRequest("/servlet/AJaxServlet", param, softwareAjaxRequestSuccess, ajaxRequestOnFailure, 'change_as_managed_software');//No I18N
    }
    else
    {
        alert(getMessageForKey("sdp.inventory.software.jserror.select"));//No I18N
    }
}

function softwareAjaxRequestSuccess( req, module )
{
    if( module == 'change_as_managed_software' )
    {
        if( req.responseText == 'success')
        {
            //For add new product page from admin section
            if( document.getElementById('softwareList') != undefined )
            {
                var length = document.getElementById('softwareList').options.length;

                document.getElementById('softwareList').options[length] = new Option(document.getElementById('unmanagedsoftware')[document.getElementById('unmanagedsoftware').selectedIndex].innerHTML, document.getElementById('unmanagedsoftware').value);
                document.getElementById('softwareList').value = document.getElementById('unmanagedsoftware').value;
                document.getElementById('productName').value = document.getElementById('unmanagedsoftware')[document.getElementById('unmanagedsoftware').selectedIndex].innerHTML;
            }
            else if( document.getElementById('componentID') != undefined ) // For add new software license page
            {
                var length = document.getElementById('componentID').options.length;
                document.getElementById('componentID').options[length] = new Option(document.getElementById('unmanagedsoftware')[document.getElementById('unmanagedsoftware').selectedIndex].innerHTML, document.getElementById('unmanagedsoftware').value);
                document.getElementById('componentID').value = document.getElementById('unmanagedsoftware').value;
            }
            parent.closeDialog();
        }
        else
        {
            alert(req.responseText);
        }
    }
    else if( module == 'reload_additional_fields' )
    {
        var result = req.responseText.replace('<form name="LicenseAgreement" method="post" action="/LicenseAgreement.do">', '');
        result = result.replace('</form>', '');
        //document.getElementById('additionalDetails').innerHTML = result;
    jQuery('#additionalDetails').html(result);

    if( jsonText != null && jsonText != undefined )
    {
        jQuery('#additionalDetails').find(':input').each(function()
        {
            var data = jsonText.purchaserequests[jQuery(this).attr('name')];

            if( data != undefined )
            {
                if( jQuery(this).prop('type') == 'textarea' )
                {
                    jQuery(this).text(data.replace('\\n', '\n'));
                }
                else
                {
                    jQuery(this).val(data);
                }
            }
        });
    }
        callDateDefaultEventfn();
    jQuery.each( additionalfieldvalue , function( elementId , value )
    {
        jQuery( document.getElementById( elementId ) ).val( value );
    });
    }
    else if( module == 'get_unlicensed_sw_installations' )
    {
        try
        {
            var ws = req.responseXML.getElementsByTagName("Resources");
            var optionSize = AssetUtil.getCurrentForm().wsList.options.length;
            var length = ws.length;
            for( i=0; i<length; i++ )
            {
                AssetUtil.getCurrentForm().wsList.options[ optionSize + i ] = new Option(ws[i].getAttribute("resourcename"), ws[i].getAttribute("resourceid"));
            }
        }
        catch(e)
        {
            alert(e);
        }
    }
    else if( module == 'delete_license_types' )
    {
        var statusCode = req.responseXML.getElementsByTagName("status")[0].childNodes[0].nodeValue

        if( statusCode == '200' )
        {
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.common.deletedsuccessfully'), true, 2000)},1000);//NO I18N
            refreshSubView(getPortalViewName('SoftwareLicenseTypes'));//No I18N
        }
        else
        {
            document.getElementById('loadingdivid').style.display = 'none';
            document.getElementById('operation_status_message').innerHTML = req.responseXML.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            Show('operation_status');//No I18N
        }
    }
    else if( module == 'allocate_cal_license' || module == 'delete_cal_license' )
    {
        if( req.responseText == 'success' )
        {
            try
            {
              if( document.getElementById('CALListView_NAV') != undefined )
              {
                refreshSubView(getPortalViewName('CALListView'));//NO I18N
              }
              else
              {
                refreshSubView(getPortalViewName('CALSummaryListView'));//NO I18N
              }
            }
            catch(e){}
        try
        {
            if( jQuery('#swManufacturer').val() > 0 )
            {
                reloadListview('alllicenses', JSON.parse('{"SoftwareLicenseTypes:SWMANUFACTURERID":' + jQuery('#swManufacturer').val() + ', "licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
            }
            else
            {
                reloadListview('alllicenses', JSON.parse('{"licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
            }
        }
        catch(e){}
            parent.closeDialog();
        }
        else
        {
            alert(req.responseText);
        }
    }
    else if( module == 'update_software_desc' )
    {
        if( req.responseText == 'success')
        {
            var desc = document.getElementById('swDescription').value;//NO I18N
            if( document.getElementById('swDescription').value.length >= 100 )
            {
                desc = desc.substring(0, 97) + "...";//NO I18N
            }
            document.getElementById('softwareDesc').innerHTML = encodeHTML(desc).split("&#xa;").join("<br />");//NO I18N
            parent.closeDialog();
        }
        else
        {
            alert(req.responseText);
        }
    }
    else if( module == 'add_sw_mfg' )
    {
        try
        {
            var userObj = req.responseXML.getElementsByTagName("SoftwareManufacturer");

            //Again comparing with element ID for IE8 fix. In IE case while calling document.getElementId() function if there is no
            //Element with that ID then its trying to pick the other element having the same name.
            //Fixed by - Murugesh
            if( document.getElementById('swMfg') != undefined && document.getElementById('swMfg').id == 'swMfg' )
            {
                var mfgLength = document.getElementById('swMfg').options.length;

                document.getElementById('swMfg').options[mfgLength] = new Option(userObj[0].getAttribute("name"), userObj[0].getAttribute("swmanufacturerid"));
                document.getElementById('swMfg').value = userObj[0].getAttribute("swmanufacturerid");
            }

            if( document.getElementById('swManufacturer') != undefined && document.getElementById('swManufacturer').id == 'swManufacturer' )
            {
                mfgLength = document.getElementById('swManufacturer').options.length;

                document.getElementById('swManufacturer').options[mfgLength] = new Option(userObj[0].getAttribute("name"), userObj[0].getAttribute("swmanufacturerid"));
                document.getElementById('swManufacturer').value = userObj[0].getAttribute("swmanufacturerid");
            }

            if( document.getElementById('softwareManufacturer') != undefined && document.getElementById('softwareManufacturer').id == 'softwareManufacturer' )
            {
                mfgLength = document.getElementById('softwareManufacturer').options.length;

                document.getElementById('softwareManufacturer').options[mfgLength] = new Option(userObj[0].getAttribute("name"), userObj[0].getAttribute("swmanufacturerid"));
            }
            parent.closeDialog();
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.software.licensetype.addedsuccessfully'), true, 2000)},1000);//NO I18N

        }
        catch(e)
        {
            //alert(e.message);
            setTimeout(function(){displayLoadingInformation('/images/invalidoperationicon.gif',getMessageForKey('sdp.admin.software.swmfg.alreadyadded'), true, 2000)},3000);//NO I18N
        }
    }
}

function updateAdditionalFieldSection(req, tableName)
{
    if( req.responseText.indexOf('true') >= 0 )
    {
        parent.closeDialog();

        if( tableName == 'LicenseAgreement_Fields' )
        {
            callCustomAjaxRequest('/software/reloadadditionalfields.jsp?tableName=' + tableName, 'reload=true', softwareAjaxRequestSuccess, ajaxRequestOnFailure, 'reload_additional_fields');//NO I18n
        }
        else if( tableName == 'PurchaseRequest_Fields' )
        {
            callCustomAjaxRequest('/software/reloadadditionalfields.jsp?tableName=' + tableName, 'reload=true', softwareAjaxRequestSuccess, ajaxRequestOnFailure, 'reload_additional_fields');//NO I18n
        }
    }
    else
    {
        if( tableName == 'PurchaseRequest_Fields' && req.responseText.indexOf("AuthError.jsp") >= 0 )
        {
            alert(getMessageForKey("sdp.xss.vulnerability.message"));
        }
        else
        {
            document.getElementById('success_div').style.display = 'block';
        }
    }
}

var selectedLicenseType;

AssetUtil.setSelectedLicenseType = function ( stype )
{
    this.selectedLicenseType = stype;
}

AssetUtil.getSelectedLicenseType = function ()
{
    return this.selectedLicenseType;
}

var selectedRowId;

AssetUtil.setSelectedRowId = function ( stype )
{
    this.selectedRowId = stype;
}

AssetUtil.getSelectedRowId = function ()
{
    return this.selectedRowId;
}
var noOfLicenseRows;

AssetUtil.setNoOfLicenseRows = function ( stype )
{
    this.noOfLicenseRows = stype;
}

AssetUtil.getNoOfLicenseRows = function ()
{
    return this.noOfLicenseRows;
}

function checkMandatoryStatus(licenseOptionTag)
{
    var index = licenseOptionTag.name.split('_')[1];
    if( parseInt(document.getElementById('software_' + index).value) > 0 )
    {
        if( trim(licenseOptionTag.value) == '' || !isDouble(licenseOptionTag.value) || parseInt(licenseOptionTag.value) < 0 )
        {
            if(licenseOptionTag.value != 'Unlimited')
            {
                showBaloonToolTip(licenseOptionTag.id, getMessageForKey('sdp.admin.ad.schedule.invalidno'));
            }
        }
    }
}
function showHideCALInput(selectTag)
{
    var index = selectTag.name.split('_')[1];

    var noOfInstallations = document.getElementById("licenseCount_" + index);

    var optionValue = selectTag.options[selectTag.options.selectedIndex].innerHTML;

    if( optionValue == 'Per Processor' ) //Per Processor license
    {
        noOfInstallations.setAttribute('readOnly', 'true');
        //Don't try to convert this value as i18n key bcoz its hard coded in server side
        noOfInstallations.value = "Unlimited";//No I18N
    }
    else if( optionValue == 'Per Seat - User' || optionValue == 'Per Seat - Device' || optionValue == 'Per Server' )
    {
        noOfInstallations.removeAttribute('readOnly');
        noOfInstallations.value = "";
    }
}

function updateLicenseOption(licenseTypeTag)
{
    var url = "/servlet/AJaxServlet";//No I18N
    var param = "action=fetchLicenseOption&licenseTypeId=" + licenseTypeTag.value + "&swManufacturer=" + document.getElementById('swManufacturer').value;//No I18N
    AssetUtil.setSelectedLicenseType(licenseTypeTag.name);

    var index = licenseTypeTag.name.split('_')[1];
    if( parseInt(document.getElementById('software_' + index).value) > 0 )
    {
        if( parseInt(licenseTypeTag.value) < 0 )
        {
            markAsMandatoryElement(licenseTypeTag.name);
        }
        else
        {
            resetMandatoryElement(licenseTypeTag.name);
        }

    }

    callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'updateLicenseOption');//No I18N
}

AssetUtil.prototype.updateSoftwareLicenseOptions = function (swManufacturer)
{
    var url = "/servlet/AJaxServlet";//No I18N
    var param = "action=fetchLicenseOption&licenseTypeId=" + document.getElementById('licenseType').value + "&swManufacturer=" + swManufacturer.value;//No I18N
    callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchLicenseOption');//No I18N
}

AssetUtil.prototype.updateManagedSoftware = function (swManufacturer)
{
    var url = "/servlet/AJaxServlet";//No I18N
    var param = "action=fetchManagedSoftwares&swManufacturer=" + swManufacturer.value;//No I18N
    callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchManagedSoftwares');//No I18N
}

AssetUtil.prototype.updateSoftwareLicenseTypes = function (swManufacturer)
{
    var url = "/servlet/AJaxServlet";//No I18N
    var param = "action=fetchLicenseTypes&swManufacturer=" + swManufacturer.value;//No I18N
    callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchLicenseType');//No I18N
}
AssetUtil.prototype.addSoftwareLicenseOption = function()
{
    var selectTag = document.getElementById('softwareManufacturer');

    var licenseFor = selectTag.options[selectTag.selectedIndex].innerHTML;

    selectTag = document.getElementById('licenseType');

    var licenseType = selectTag.options[selectTag.selectedIndex].innerHTML;

    showURLInDialog('/software/addlicenseoption.jsp?licenseFor=' + encodeURIComponent(licenseFor) + '&licenseType=' + encodeURIComponent(licenseType) + '&swmanufacturer=' + encodeURIComponent(document.getElementById('softwareManufacturer').value) + '&licenseTypeId=' + selectTag.value,'closeButton=yes,position=absmiddle,width=380,left=250,top=100');//No I18N
}
function AddNewSoftwareLicenseOption (optionName, swmanufacturer, licenseType)
{
    if( trim(optionName) != '' )
    {
        var url = "/SoftwareLicense.do";//No I18N
        var param = 'operation=addlicenseoption&swmanufacturer=' + swmanufacturer + '&licenseType=' + licenseType + '&optionName=' + encodeURIComponent(optionName);//No I18N
        callCustomAjaxRequest(url, param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'addLicenseOption');//No I18N
    }
    else
    {
        alert(getMessageForKey('sdp.admin.software.licenseoption.mandatory'));
        return false;
    }
}

function validateLicenseImportMandatoryFields()
{
    try
    {
        if( parent.populateCSVFields.document.getElementById('software').value == -1 )
        {
            showToolTipMessage(parent.populateCSVFields.document.getElementById('software'), parent.getMessageForKey('sdp.admin.product.type.software.choose'));//No I18N
            return false;
        }
        if( parent.populateCSVFields.document.getElementById('swmanufacturer').value == -1 )
        {
            showToolTipMessage(parent.populateCSVFields.document.getElementById('swmanufacturer'), parent.getMessageForKey('sdp.software.license.import.mfg.choose'));//No I18N
            return false;
        }
        if( parent.populateCSVFields.document.getElementById('licenseType').value == -1 )
        {
            showToolTipMessage(parent.populateCSVFields.document.getElementById('licenseType'), parent.getMessageForKey('sdp.inventory.softwarelicense.Chooselicensetypemsg'));//No I18N
            return false;
        }

        if( parent.populateCSVFields.document.getElementById('licenseKey').value == -1 )
        {
            showToolTipMessage(parent.populateCSVFields.document.getElementById('licenseKey'), parent.getMessageForKey('sdp.software.license.import.choose.licensekey'));//No I18N
            return false;
        }
        parent.showProgressBar(parent.getMessageForKey("sdp.software.license.import.progressmsg"));//No I18N
    }
    catch(e)
    {
        alert(e.message);
        return false;
    }
    return true;
}
function validateContractImportMandatoryFields()
{
    if(isMSP) {
        if((document.getElementById("accountXLS").checked == true) && document.getElementById('account').value == -1 ) {
            showBaloonToolTip('account', document.getElementById('sdp.msp.import.account').innerHTML);//No I18N
            return false;
        }
        else if ((document.getElementById("accountList").checked == true) && document.getElementById('account_list').value == -1) {
            showBaloonToolTip('siteId', document.getElementById('sdp.msp.import.account').innerHTML);//No I18N
            return false;
        }
    }
    if( document.getElementById('custContractID').value == -1 )
    {
        showBaloonToolTip('custContractID', parent.document.getElementById('sdp.contract.import.id.choose').innerHTML);//No I18N
        return false;
    }
    if( document.getElementById('contractName').value == -1 )
    {
        showBaloonToolTip('contractName', parent.document.getElementById('sdp.contract.import.name.choose').innerHTML);//No I18N
        return false;
    }
    if( document.getElementById('categoryID').value == -1 )
    {
        showBaloonToolTip('categoryID', parent.document.getElementById('sdp.contract.import.type.choose').innerHTML);//No I18N
        return false;
    }
    if( document.getElementById('vendorID').value == -1 )
    {
        showBaloonToolTip('vendorID', parent.document.getElementById('sdp.contract.addNew.jsMaintainVendorErr').innerHTML);//No I18N
        return false;
    }
    if( document.getElementById('fromDate').value == -1 )
    {
        showBaloonToolTip('fromDate', parent.document.getElementById('sdp.contract.import.fromDate.choose').innerHTML);//No I18N
        return false;
    }

    if( document.getElementById('toDate').value == -1 )
    {
        showBaloonToolTip('toDate', parent.document.getElementById('sdp.contract.import.toDate.choose').innerHTML);//No I18N
        return false;
    }
    /*if( document.getElementById('assetName').value == -1 && document.getElementById('serviceTag').value == -1 && document.getElementById('ipAddress').value == -1)
    {
        showBaloonToolTip('assetName', parent.document.getElementById('sdp.contract.import.toDate.choose').innerHTML);//No I18N
        return false;
    }*/
    showProgressBar(parent.document.getElementById("sdp.software.license.import.progressmsg").innerHTML);//No I18N
    return true;
}
function showProgressBar(loadMessage)
{
    var mydiv = document.getElementById('loadingdivid');

    var divExists = true;
    if( mydiv == undefined )
    {
        divExists = false;
        mydiv = document.createElement('DIV');//No I18N
    }

    mydiv.style.width = '240px';//No I18N
    mydiv.addEventListener('click', function() {
        this.style.display = 'none';//No I18N
    });
    mydiv.id = 'loadingdivid';//No I18N
    mydiv.align = 'center';//No I18N
    mydiv.style.position = "absolute";
    mydiv.setAttribute("style",'padding: 2px; position: absolute; z-index: 300; display:block;');//No I18N

    mydiv.innerHTML = '<table width="100%"><tr><td class="blueHbg11" width="100%" align="left">' + loadMessage + '<blink> ...</blink></td></tr><tr><td align="center"><img src="/images/progressbar.gif" align=absmiddle border="0"></td></tr></table>';//No I18N

    if( !divExists )
    {
        try
        {
            window.parent.document.body.appendChild(mydiv);
        }
        catch(ex)
        {
            //Error ignored for IE 6
        }
    }

    var width = mydiv.offsetWidth;
    var height = mydiv.offsetHeight;
    var left = (window.screen.width / 2) + document.body.scrollLeft - 50;
    var topx = (window.screen.height / 2) + (document.body.scrollTop/2) - (height/2);
    mydiv.style.left = parseInt(left) + "px";//No I18N
    mydiv.style.top = parseInt(topx) + "px";//No I18N
    mydiv.style.backgroundColor="rgb(255,255,255)";//No I18N
    mydiv.style.border= 'solid black 1px';//No I18N
    mydiv.style.display='block';//No I18N

}
function refreshLicenseTypeList(selectTag, form)
{
    var newVal = "&SWMANUFACTURERID=" + selectTag.value;//No I18N
    updateState(getPortalViewName("SoftwareLicenseTypes"),"_D_RP", newVal);//No I18N
    updateState(getPortalViewName("SoftwareLicenseTypes"), "_PN", null);//No I18N
    updateFormValues("SoftwareLicenseTypes", form);//No I18N

    refreshSubView(getPortalViewName('SoftwareLicenseTypes'));//No I18N
}
function showNewLicensePage()
{
    if( document.getElementById('addnewlicensetypepage').style.display == 'none' )
    {
        document.getElementById('addnewlicensetypepage').style.display = 'block';//No I18N
        //document.getElementById('licenseTypeHead').innerHTML = '<b>' + getMessageForKey('sdp.common.cancel') + '</b>';//No I18N
        document.getElementById('licenseTypeHead').parentNode.hide();

        document.getElementById('swlicenseType').value = '';//No I18N
        document.getElementById('swMfg').value = '-1';//No I18N
        document.getElementById('swInstallationType').value = '-1';//No I18N
        document.getElementById('swComplianceType').value = '-1';//No I18N
        document.getElementById('isPerpetual').checked = false;//No I18N
        document.getElementById('isFree').checked = false;//No I18N
        document.getElementById('lmode').value = 'add';//No I18N
        document.getElementById('licenseTypeId').value = '-1';//No I18N

        document.getElementById('swMfg').disabled = false;
        document.getElementById('swInstallationType').disabled = false;
        document.getElementById('swComplianceType').disabled = false;
        document.getElementById('isPerpetual').disabled = false;
        document.getElementById('isFree').disabled = false;
        document.getElementById('userAccessType').disabled = false;
        document.getElementById('isNodeLocked').disabled = false;
        document.getElementById('addnewmanufacturer').style.visibility = 'visible';//No I18N
        document.getElementById('swlicenseType').focus();
        showAdditionalProperties(document.getElementById('swComplianceType'));

        AssetUtil.removeCompleteOptionTags(document.getElementById('swLicenseOption'));//No I18N
    }
    else
    {
        document.getElementById('addnewlicensetypepage').style.display = 'none';//No I18N
        //document.getElementById('licenseTypeHead').innerHTML = '<b>' + getMessageForKey('sdp.admin.licensetype.addnew') + '</b>';//No I18N
        document.getElementById('licenseTypeHead').parentNode.show();
    }
    //document.getElementById('addnewlabelhead').innerHTML = '&nbsp;' + getMessageForKey('sdp.admin.licensetype.addnew') + '';//No I18N
}
function addSWLicenseOption()
{
    var value = document.getElementById('licenseOptionText').value;

    if( trim(value) != '' )
    {
        var length = document.getElementById('swLicenseOption').options.length;
        document.getElementById('swLicenseOption').options[length] = new Option(value, value);
        document.getElementById('licenseOptionText').value = '';//No I18N
        document.getElementById('licenseOptionText').focus();
    }
    else
    {
        alert(getMessageForKey('sdp.admin.software.licenseoption.mandatory'));//No I18N
    }
}
function removeSelectedOption()
{
    var selectbox = document.getElementById('swLicenseOption');

    var i;
    for(i=selectbox.options.length-1;i>=0;i--)
    {
        if(selectbox.options[i].selected)
        {
            selectbox.remove(i);
        }
    }
}
function ajaxRequestOnFailureOfEditSWLicenseType(requestObj,module)
{
      if('edit_software_license_type' == module)
      {
          Hide('loadingdivid');//No I18N
          showalert('failure',getMessageForKey('sdp.admin.defaultedit.error'),'isAutoHide=true,delay=3');//No I18N
      }
}
function editLicenseType(licenseTypeId)
{
    Hide('operation_status');//No I18N

    //document.getElementById('licenseTypeHead').innerHTML = '<b>' + getMessageForKey('sdp.common.cancel') + '</b>';//No I18N
    document.getElementById('licenseTypeHead').parentNode.hide();

    document.getElementById('swlicenseType').value = '';//No I18N
    document.getElementById('swMfg').value = '-1';//No I18N
    document.getElementById('swInstallationType').value = '-1';//No I18N
    document.getElementById('swComplianceType').value = '-1';//No I18N
    document.getElementById('isPerpetual').checked = false;
    document.getElementById('isFree').checked = false;
    document.getElementById('lmode').value = 'edit';//No I18N
    document.getElementById('licenseTypeId').value = '-1';//No I18N
    AssetUtil.removeCompleteOptionTags(document.getElementById('swLicenseOption'));//No I18N

    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n

    var param = 'action=edit_software_license_type&licenseTypeId=' + licenseTypeId;//No I18N
    callCustomAjaxRequestForGET('/servlet/AJaxServlet', param, agreementAjaxRequestSuccess, ajaxRequestOnFailureOfEditSWLicenseType, 'edit_software_license_type');//NO I18N
}
function saveLicenseTypeDetails( swManufacturerId )
{
    if( trim(document.getElementById('swlicenseType').value) == '' )
    {
        showBaloonToolTip('swlicenseType', getMessageForKey('sdp.admin.software.licensetype.ltypenotfound'));//No I18N
        return false;
    }

    if( document.getElementById('swMfg').value == '-1' )
    {
        showBaloonToolTip('swMfg', getMessageForKey('sdp.admin.software.licensetype.choosemfg'));//No I18N
        return false;
    }

    if( document.getElementById('swComplianceType').value == '-1' )
    {
        showBaloonToolTip('swComplianceType', getMessageForKey('sdp.admin.software.licensetype.chooseswcompliance'));//No I18N
        return false;
    }

    if( document.getElementById('swInstallationType').value == '-1' )
    {
        showBaloonToolTip('swInstallationType', getMessageForKey('sdp.admin.software.licensetype.chooseswinstallation'));//No I18N
        return false;
    }

    if( document.getElementById('swLicenseOption').options.length == 0 )
    {
        showBaloonToolTip('swLicenseOption', getMessageForKey('sdp.admin.licensetype.option.cannotbeempty'));//No I18N
        return false;
    }

    var length = document.getElementById('swLicenseOption').options.length;

    if( length > 0 )
    {
        for( i=0; i<length; i++ )
        {
            document.getElementById('swLicenseOption').options[i].selected = true;
        }
    }

    displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n

    Hide('operation_status');//No I18N

    var param = "action=add_software_license_type&mode=" + document.getElementById('lmode').value;//No I18N
    param += "&licenseTypeId=" + document.getElementById('licenseTypeId').value;//No I18N
    param += "&licenseType=" + encodeURIComponent(document.getElementById('swlicenseType').value);//No I18N
    param += "&swManufacturer=" + document.getElementById('swMfg').value;//No I18N
    param += "&swComplianceType=" + document.getElementById('swComplianceType').value;//No I18N
    param += "&swInstallationType=" + document.getElementById('swInstallationType').value;//No I18N
    param += "&userAccessType=" + document.getElementById('userAccessType').value;//No I18N
    if( document.getElementById('isNodeLocked').checked )
    {
        param += "&isNodeLocked=" + document.getElementById('isNodeLocked').value;//No I18N
    }
    if( document.getElementById('isPerpetual').checked )
    {
        param += "&isPerpetual=" + document.getElementById('isPerpetual').value;//No I18N
    }
    if( document.getElementById('isFree').checked )
    {
        param += "&isFree=" + document.getElementById('isFree').value;//No I18N
    }

    var len = document.getElementById('swLicenseOption').options.length;

    if( len > 0 )
    {
        for( i=0; i<len; i++ )
        {
            if(document.getElementById('swLicenseOption').options[i].selected )
            {
                param += "&swLicenseOption=" + encodeURIComponent(document.getElementById('swLicenseOption').options[i].value);//No I18N
            }
        }
    }

    if( swManufacturerId != null )
    {
        callCustomAjaxRequest('/servlet/AJaxServlet', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'add_software_license_type_tolist');//NO I18N
    }
    else
    {
        callCustomAjaxRequest('/servlet/AJaxServlet', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'add_software_license_type');//NO I18N
    }
}
function addNewItemRow()
{
    rows = jQuery('#requestedItemTable tr:last-child').prev();

    if( rows.length == 1 )
    {
        thisRow = rows[0];
    }
    else
    {
        thisRow = rows[rows.length-1];
    }
    if( document.createElement && document.childNodes )
    {
        jQuery("#requestedItemTable tbody tr:nth-child(2) td:last-child img").show();

        var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

        //if( jQuery('#addLicenseImg_' + (gUniqueRowID - 1)).attr('class') == 'swsubbtn' )
        //{
        //  return;
        //}

        var newElement = thisRow.cloneNode(true);

        newElement.id = "itemDetails_" + gUniqueRowID;

        thisRow.parentNode.insertBefore(newElement, document.getElementById('totalValueSection'));
        //thisRow.parentNode.insertBefore(newElement, thisRow);
        //thisRow.parentNode.appendChild(newElement);
        //jQuery(thisRow).after(newElement);

        updateItemElementName(thisRow, newElement, gUniqueRowID);

        try
        {
            //document.getElementById('product_' + gUniqueRowID).value = 'null';//No I18N
            //document.getElementById('productType_' + gUniqueRowID).value = 'null';//No I18N
            //document.getElementById('softwareType_' + gUniqueRowID).value = 'null';//No I18N
            document.getElementById('item_name_' + gUniqueRowID).value = '';//No I18N
            document.getElementById('item_desc_' + gUniqueRowID).value = '';//No I18N

            document.getElementById('quantity_' + gUniqueRowID).value = '1';//No I18N
            document.getElementById('estimated_cost_' + gUniqueRowID).value = '0.00';//No I18N
            document.getElementById('totalCost_' + gUniqueRowID).value = '0.00';//No I18N
        }
        catch(ex)
        {
            //Error ignored
        }

        var scrObjs = document.getElementById(newElement.id).getElementsByTagName("script");

        var len = scrObjs.length;

        for( i=0; i<len; i++ )
        {
            while( scrObjs[i].innerHTML.indexOf('_' + (gUniqueRowID-1)) > 0 )
            {
                scrObjs[i].innerHTML = scrObjs[i].innerHTML.replace('_' + (gUniqueRowID-1), '_' + gUniqueRowID);
            }
        }

        return newElement;
    }
    return null;
}
function updateItemElementName(oldRow, rowObj, newId)
{
    for(var i=0;i<rowObj.childNodes.length;i++)
    {
        if( rowObj.childNodes[i].nodeName == 'TD' )
        {
            for(var j=0; j<rowObj.childNodes[i].childNodes.length; j++)
            {
                var tags = rowObj.childNodes[i].childNodes[j];
                if(tags.nodeName == 'SELECT' || tags.nodeName == 'INPUT' || tags.nodeName == 'IMG')
                {
                    if( tags.name != undefined )
                    {
                        if( tags.type != 'hidden' )
                        {
                            tags.name = getElementName(tags.name.split("_")) + '_' + newId;//No I18N
                            tags.id = getElementName(tags.id.split("_")) + '_' + newId;//No I18N
                            tags.style.border = '1px solid #C4C4C4';//No I18N
                        }

                        /*if( tags.id.indexOf('addLicenseImg') >= 0 )
                        {
                            var browser = navigator.appName;
                            if( browser == "Netscape" )
                            {
                                tags.onclick = function(event) {addNewItemRow(this.parentNode.parentNode);};
                            }
                            else
                            {
                                tags.onclick = function() {addNewItemRow(this.parentNode.parentNode);};
                            }
                        }*/
                    }
                }
            }
        }
    }
    changeItemClassName(oldRow, 'swsubbtn', newId);//No I18N
}

function getElementName( elementWords )
{
    elementName = elementWords[0];

    if( elementWords.length > 2 )
    {
        for( j=1; j<(elementWords.length - 1); j++ )
        {
            elementName += "_" + elementWords[j];//NO I18N
        }
    }
    return elementName;
}

function addNewLicenseRow(thisRow)
{
    if( document.createElement && document.childNodes )
    {
        var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

        if( jQuery('#addLicenseImg_' + (gUniqueRowID - 1)).attr('class') == 'swsubbtn' )
        {
            return;
        }
        var newElement = thisRow.cloneNode(true);
        newElement.id = "license_" + gUniqueRowID;

        thisRow.parentNode.appendChild(newElement);

        updateLicenseElementName(thisRow, newElement, gUniqueRowID);

        try
        {
            document.getElementById('software_' + gUniqueRowID).value = '-1';//No I18N
            document.getElementById('licenseKey_' + gUniqueRowID).value = '';//No I18N
            document.getElementById('licenseId_' + gUniqueRowID).value = '-1';//No I18N

            document.getElementById('licenseType_' + gUniqueRowID).value = '-1';//No I18N
            document.getElementById('licenseOption_' + gUniqueRowID).value = '-1';//No I18N
            document.getElementById('licenseCount_' + gUniqueRowID).value = '1';//No I18N
            document.getElementById('licenseCost_' + gUniqueRowID).value = '0.0';//No I18N
        }
        catch(ex)
        {
            //Error ignored
        }

        return newElement;
    }
    return null;
}
function removeLicenseRow( theRow )
{
    var tmpRow = theRow.parentNode.parentNode;

    for(var j=0;j<tmpRow.childNodes.length;j++)
    {
        if( tmpRow.childNodes.item(j).nodeName == 'TD' )
        {
            tmpRow.childNodes.item(j).setAttribute('bgcolor','#FF1111');
            new Effect.Fade(tmpRow.childNodes.item(j),{duration:1.15});
        }
    }
    new Effect.Fade(theRow,{duration:1.15});
    setTimeout(function() { removeRow(theRow); } , 1500);//No I18N
}

function removeItemRow( theRow )
{
    var tagTR = jQuery("#requestedItemTable tbody tr");

    if( tagTR.length == 3 )
    {
            return;
    }
    else if(  tagTR.length == 4 )
    {
        jQuery("[id^=addLicenseImg_]").hide();
    }

    var tmpRow = theRow.parentNode.parentNode;

    for(var j=0;j<tmpRow.childNodes.length;j++)
    {
        if( tmpRow.childNodes.item(j).nodeName == 'TD' )
        {
            tmpRow.childNodes.item(j).setAttribute('bgcolor','#FF1111');
            new Effect.Fade(tmpRow.childNodes.item(j),{duration:1.15});
        }
    }
    new Effect.Fade(theRow,{duration:1.15});
    setTimeout(function() { removeRow(theRow);recalculateCost(); } , 400);//No I18N
}

function recalculateCost()
{
    jQuery('[id^="quantity_"]').each(function()
    {
        jQuery(this).trigger('blur');//NO I18N
    });
}

function removeRow( theRow )
{
    try
    {
        if( document.createElement && document.childNodes )
        {
            if( theRow.type != 'TR' )
            {
                var thisRow = theRow.parentNode.parentNode;

                if( thisRow.parentNode.rows != undefined && thisRow.parentNode.rows.length != 2)
                {
                    thisRow.parentNode.removeChild(thisRow);
                }
                else if( theRow.parentNode.rows != undefined && theRow.parentNode.rows.length != 2 )
                {
                    theRow.parentNode.removeChild(theRow);
                }
            }
            else
            {
                theRow.parentNode.removeChild(theRow);
            }
        }
    }
    catch(e)
    {
        //alert(e.message); ignored
    }
}
function updateLicenseElementName(oldRow, rowObj, newId)
{
    for(var i=0;i<rowObj.childNodes.length;i++)
    {
        if( rowObj.childNodes[i].nodeName == 'TD' )
        {
            for(var j=0; j<rowObj.childNodes[i].childNodes.length; j++)
            {
                var tags = rowObj.childNodes[i].childNodes[j];
                if(tags.nodeName == 'SELECT' || tags.nodeName == 'INPUT' || tags.nodeName == 'IMG')
                {
                    if( tags.name != undefined )
                    {
                        if( tags.type != 'hidden' )
                        {
                            tags.name = tags.name.split("_")[0] + '_' + newId;//No I18N
                            tags.id = tags.id.split("_")[0] + '_' + newId;//No I18N
                            //tags.style.border = '1px solid #C4C4C4';//No I18N
                        }
                        else
                        {
                            if( tags.name.indexOf('licenseId_') >= 0 )
                            {
                                tags.name = tags.name.split("_")[0] + '_' + newId;//No I18N
                                tags.id = tags.id.split("_")[0] + '_' + newId;//No I18N
                            }
                            else if( tags.name == 'rowIds')
                            {
                                tags.value = newId;
                            }
                        }

                        if( tags.id.indexOf('addLicenseImg') >= 0 )
                        {
                            var browser = navigator.appName;

                            if( browser == "Netscape" )
                            {
                                tags.onclick = function(event) {addNewLicenseRow(this.parentNode.parentNode);};
                            }
                            else
                            {
                                tags.onclick = function() {addNewLicenseRow(this.parentNode.parentNode);};
                            }
                        }
                        else if( tags.id.indexOf('licenseKey_') >= 0 )
                        {
                            var browser = navigator.appName;

                            if( browser == "Netscape" )
                            {
                                tags.onblur = function(event) {checkForLicenseKeyExistence(this);};
                            }
                            else
                            {
                                tags.onblur = function() {checkForLicenseKeyExistence(this);};
                            }
                        }
                    }
                }
            }
        }
    }
    changeClassName(oldRow, 'swsubbtn', newId);//No I18N
}
function changeItemClassName(rowObj, className, newId)
{
    for(var i=0;i<rowObj.childNodes.length;i++)
    {
        if( rowObj.childNodes[i].nodeName == 'TD' )
        {
            for(var j=0; j<rowObj.childNodes[i].childNodes.length; j++)
            {
                var tags = rowObj.childNodes[i].childNodes[j];
                if(tags.nodeName == 'IMG')
                {
                    if( tags.id != undefined && tags.id.indexOf('addLicenseImg') >= 0 )
                    {
                        tags.className = className;

                        var browser = navigator.appName;

                        if( className == 'swsubbtn' )
                        {
                            if( browser == "Netscape" )
                            {
                                tags.onclick = function(event) {removeItemRow(this);};
                            }
                            else
                            {
                                tags.onclick = function() {removeItemRow(this);};
                            }
                        }
                        else
                        {
                            if( browser == "Netscape" )
                            {
                                tags.onclick = function(event) {addNewItemRow(this);};
                            }
                            else
                            {
                                tags.onclick = function() {addNewItemRow(this);};
                            }
                        }
                    }
                }
            }
        }
    }
}
function changeClassName(rowObj, className, newId)
{
    for(var i=0;i<rowObj.childNodes.length;i++)
    {
        if( rowObj.childNodes[i].nodeName == 'TD' )
        {
            for(var j=0; j<rowObj.childNodes[i].childNodes.length; j++)
            {
                var tags = rowObj.childNodes[i].childNodes[j];
                if(tags.nodeName == 'IMG')
                {
                    if( tags.id != undefined && tags.id.indexOf('addLicenseImg') >= 0 )
                    {
                        tags.className = className;

                        var browser = navigator.appName;

                        if( className == 'swsubbtn' )
                        {
                            var checkForLicenseElement = document.getElementById('licenseId_' + (newId - 1));

                            if( checkForLicenseElement == null || checkForLicenseElement == undefined || checkForLicenseElement.value == '-1' )
                            {
                                //jQuery(tags).click(function() {removeLicenseRow(this);});
                                if( browser == "Netscape" )
                                {
                                        tags.onclick = function(event) {removeLicenseRow(this);};
                                }
                                else
                                {
                                        tags.onclick = function() {removeLicenseRow(this);};
                                }
                            }
                        }
                        else
                        {
                            if( browser == "Netscape" )
                            {
                                tags.onclick = function(event) {addNewLicenseRow(this);};
                            }
                            else
                            {
                                tags.onclick = function() {addNewLicenseRow(this);};
                            }
                        }
                    }
                }
            }
        }
    }
}

function updateAgreementLicenseList (swManufacturer)
{
    var url = "/LicenseAgreement.do";//No I18N
    var param = "operation=refreshlicenselist&softwareManufacturer=" + swManufacturer.value;//No I18N
    callCustomAjaxRequest(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'refreshlicenselist');//No I18N
}
function markAsMandatoryElement( elementId )
{
    document.getElementById(elementId).style.border='1px solid red';
    document.getElementById(elementId).focus();
    new Effect.ScrollTo(elementId);
}

function resetMandatoryElement( elementId )
{
    document.getElementById(elementId).style.border='1px solid #C4C4C4';
}

additionalfieldvalue = {};
/*function addMoreAdditionalFields( tableName , formName )
{
    if ( formName == "pradditionalInfo" )
    {
        jQuery( "#"+ formName +" input,textarea,select" ).each(function(){
            additionalfieldvalue[ jQuery( this ).attr("id") ] = jQuery( this ).val();
        });
    }
    showURLInDialog('/software/addadditionalfields.jsp?date=' + new Date().getMilliseconds() + "&tableName=" + tableName,'closeButton=no,title=');//NO I18N
}*/

function saveAgreementDetails(operation)
{
    if( trim(document.getElementById('agreementNumber').value) == '' )
    {
        markAsMandatoryElement('agreementNumber');//No I18N
        showBaloonToolTip('agreementNumber', getMessageForKey('sdp.software.agreement.validation.agreementno'));//No I18N
        return;
    }
    else
    {
        resetMandatoryElement('agreementNumber');//No I18N
    }

    if( trim(document.getElementById('acqDate').value) == '' )
    {
        markAsMandatoryElement('acqDate');//No I18N
        showBaloonToolTip('acqDate', getMessageForKey('sdp.software.agreement.validation.acqdate'));//No I18N
        return;
    }
    else
    {
        resetMandatoryElement('acqDate');//No I18N
    }
    var fields = [
        { id: 'agreementNumber', maxLength: 50 }, //No I18N
        { id: 'authorizationNumber', maxLength: 50}, //No I18N
        { id: 'description', maxLength: 250}, //No I18N
        { id: 'terms', maxLength: 3500}, //No I18N
        { id: 'poNumber', maxLength: 50}, //No I18N
        { id: 'invoiceNumber', maxLength: 50}, //No I18N
        { id: 'poName', maxLength: 100}, //No I18N
        { id: 'poDesc', maxLength: 250}, //No I18N
      ];

      for (var field of fields) {
        var element = document.getElementById(field.id);
        if (element.value.length > field.maxLength) {
          markAsMandatoryElement(field.id);
          showBaloonToolTip(field.id, getMessageForKey("form.character.maximumlength.alert", [Number(field.maxLength).toString()]));
          return;
        }
      }


    /*if(document.getElementById('notifyUsersList').options.length <= 0)
    {
        markAsMandatoryElement('notifyUsersList');//No I18N
        showBaloonToolTip('notifyUsersList', getMessageForKey('sdp.contract.addNew.notifyUsersListErr'));//No I18N
        return;
    }
    else
    {
        resetMandatoryElement('notifyUsersList');//No I18N
    }*/

    if(document.getElementById('notifyUsersList').options.length > 0)
    {
        if( document.getElementById('notifyBefore') != undefined && ((!isPositiveInteger(document.getElementById('notifyBefore').value) && parseInt(document.getElementById('notifyBefore').value) <= 0) || trim(document.getElementById('notifyBefore').value) == '') )
        {
            markAsMandatoryElement('notifyBefore');//No I18N
            showBaloonToolTip('notifyBefore', getMessageForKey('sdp.contract.addNew.jsNotifyErr'));//No I18N
            return;
        }
        else if( document.getElementById('notifyBefore') != undefined )
        {
            resetMandatoryElement('notifyBefore');//No I18N
        }
    }

    for( i=1; i<=4; i++ )
    {
        if( document.getElementById("NUM_UDF_LONG" + i) != undefined )
        {
            if( trim(document.getElementById("NUM_UDF_LONG" + i).value) != "" )
            {
                if( !isInteger(trim(document.getElementById("NUM_UDF_LONG" + i).value)) )
                {
                    new Effect.ScrollTo("NUM_UDF_LONG" + i);//No I18N
                    showBaloonToolTip("NUM_UDF_LONG" + i, getMessageForKey('sdp.license.allocate.udfinvalidvaue'));//No I18N
                    return ;
                }
            }
        }
    }
    for( i=1; i<=4; i++ )
    {
        if( document.getElementById("NUM_UDF_COST" + i) != undefined )
        {
            if( trim(document.getElementById("NUM_UDF_COST" + i).value) != "" )
            {
                if( !isDouble(trim(document.getElementById("NUM_UDF_COST" + i).value)) )
                {
                    new Effect.ScrollTo("NUM_UDF_COST" + i);//No I18N
                    showBaloonToolTip("NUM_UDF_COST" + i, getMessageForKey('sdp.inventory.resources.amountjserror1'));//No I18N
                    return ;
                }
            }
        }
    }

    if( !isDouble(trim(document.getElementById('totalAmount').value)) )
    {
        new Effect.ScrollTo('totalAmount');//No I18N
        showBaloonToolTip('totalAmount', getMessageForKey('sdp.inventory.resources.amountjserror1'));//No I18N
        return;
    }

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
                        markAsMandatoryElement('licenseType_' + index);//No I18N
                        return;
                    }
                    else
                    {
                        resetMandatoryElement('licenseType_' + index);//No I18N
                    }
                    if( parseInt(document.getElementById('licenseOption_' + index).value) < 0 )
                    {
                        markAsMandatoryElement('licenseOption_' + index);//No I18N
                        return;
                    }
                    else
                    {
                        resetMandatoryElement('licenseOption_' + index);//No I18N
                    }

                    if( trim(document.getElementById('licenseCount_' + index).value) != '' && (parseInt(document.getElementById('licenseCount_' + index).value) > 0 || document.getElementById('licenseCount_' + index).value == 'Unlimited' ) )
                    {
                        resetMandatoryElement('licenseCount_' + index);//No I18N
                    }
                    else
                    {
                        markAsMandatoryElement('licenseCount_' + index);//No I18N
                        return;
                    }
                    if( trim(document.getElementById('licenseCost_' + index).value) != '' && isDouble(document.getElementById('licenseCost_' + index).value) )
                    {
                        resetMandatoryElement('licenseCost_' + index);//No I18N
                    }
                    else
                    {
                        markAsMandatoryElement('licenseCost_' + index);//No I18N
                        return;
                    }
                }
            }
        }
    }

    if( document.getElementById('notifyUsersList') != undefined )
    {
        var noti = document.getElementById('notifyUsersList').options;

        for( i=0; i<noti.length; i++ )
        {
            noti[i].selected = true;
        }
    }

    var slobj = document.getElementsByName('searchedLicenseId');

    if( slobj.length > 0 )
    {

        var totalAmount = 0.0;

        for( k=0; k<slobj.length; k++ )
        {
            totalAmount += parseFloat(document.getElementById("cost_" + slobj[k].value).innerHTML);
        }

        if( trim(document.getElementById('totalAmount').value) == '' || parseFloat(document.getElementById('totalAmount').value) == 0.0 )
        {
            document.getElementById('totalAmount').value = totalAmount;
        }
        else
        {
            if( parseFloat(document.getElementById('totalAmount').value) != totalAmount )
            {
                if( confirm(getMessageForKey('sdp.software.licenseagreement.costvalidation')) )
                {
                    document.getElementById('totalAmount').value = totalAmount;
                }
            }
        }
    }

    createModalDialog(document.getElementById('SWLICENSEAGREEMENT_TABLE'), '');

    displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.settings.save.progress.msg'), false);//NO I18n

    var url = "/LicenseAgreement.do";//No I18N
    var param = "";

    if( 'newagreement' != operation )
    {
        param = "operation=updateagreement" + constructParameters($('LicenseAgreement')); //NO I18n
        param += "&agreementId=" + document.getElementById('agreementId').value;//No I18N
    }
    else
    {
        param = "operation=addagreement" + constructParameters($('LicenseAgreement')); //NO I18n
    }

    callCustomAjaxRequest(url,param, agreementAjaxRequestSuccess, addAgreementOnFailure, 'add_license_agreement');//No I18N
}

function closeModalDialog()
{
    var mydiv = document.getElementById('modalDiv');

    if(  mydiv != undefined )
    {
        mydiv.style.display = 'none';
    }
}

function createModalDialog( modalElement, htmlContent )
{
    if( modalElement != undefined )
    {
        var mydiv = document.getElementById('modalDiv');

        if( mydiv == undefined )
        {
            mydiv = document.createElement('DIV');//No I18N
            window.parent.document.body.appendChild(mydiv);

        }
        mydiv.id = 'modalDiv';
        mydiv.setAttribute("style",'border: 1px solid rgb(153, 153, 153); margin: auto; filter: alpha(opacity=55); -moz-opacity: .55; background-color: rgb(250, 250, 250); position: absolute; display:block;');//No I18N

        mydiv.style.left = getX(modalElement);
        mydiv.style.top = getY(modalElement);
        mydiv.style.width = modalElement.offsetWidth;
        mydiv.style.height = modalElement.offsetHeight;

        if( htmlContent != undefined )
        {
            mydiv.innerHTML = htmlContent;
        }
    }
}
function getY( oElement )
{
    var iReturnValue = 0;
    while( oElement != null )
    {
        iReturnValue += oElement.offsetTop;
        oElement = oElement.offsetParent;
    }
    return iReturnValue;
}
function getX( oElement )
{
    var iReturnValue = 0;
    while( oElement != null )
    {
        iReturnValue += oElement.offsetLeft;
        oElement = oElement.offsetParent;
    }
    return iReturnValue;
}
function viewLicenseAgreement(url)
{
    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
    callCustomAjaxRequestForGET('/LicenseAgreement.do', url, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'viewlicenseagreement');//NO I18n
}
function editLicenseAgreement(agreementId)
{
    displayLoadingInformation(null, getMessageForKey('sdp.common.loading'), false);//NO I18n
    callCustomAjaxRequestForGET('/LicenseAgreement.do', 'operation=editagreement&agreementId=' + agreementId, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'editlicenseagreement');//No I18N
}
function showAddLicensesRow(agreementId, fromLAActionMenu)
{
    var param = '';

    if( agreementId != undefined && agreementId != "" && agreementId != "null")
    {
        if(isMSP) {
            param = '&agreementId=' + agreementId; // No i18n
            if(fromLAActionMenu) {
                param = param + '&fromLAActionMenu=true';   // No i18n
            }
        }
        else {
            param = '&fromLAActionMenu=true&agreementId=' + agreementId;//NO I18N
        }
    }
    NewWindow('/LicenseAgreement.do?operation=showLicenseSearchWindow&swManufacturer=' + document.getElementById('swManufacturer').value + param,'addNewItem','1000','435','yes','center');//NO I18N
}

function updateLicenseList()
{
    var param = 'softwareManufacturer=' + document.getElementById('swManufacturer').value;//NO I18N
    param += '&fromLALicenseSearch=true&fromSearchFilter=true';//NO I18N

    if( document.getElementById('softwareName').value > 0 )
    {
        param += '&softwareId=' + document.getElementById('softwareName').value;//NO I18N
    }

    if( document.getElementById('allsites').value > 0 )
    {
        param += '&siteId=' + document.getElementById('allsites').value;//NO I18N
    }

    var addedlicenses = window.opener.document.getElementById('addedlicenses');

    if( addedlicenses != undefined )
    {
        if( addedlicenses.value != '' )
        {
            param += '&addedlicenses=' + addedlicenses.value;//NO I18N
        }
    }
    updateState(getPortalViewName("AllSoftwareLicenceView"),"_D_RP", param);//No I18N
    refreshSubView(getPortalViewName('AllSoftwareLicenceView'));//No I18N
}
function searchSoftwareLicenses()
{
    var param = 'softwareManufacturer=' + document.getElementById('swManufacturer').value;//NO I18N
    param += '&fromLALicenseSearch=true';//NO I18N

    if( document.getElementById('softwareName').value > 0 )
    {
        param += '&softwareId=' + document.getElementById('softwareName').value;//NO I18N
    }

    if( document.getElementById('allsites').value > 0 )
    {
        param += '&siteId=' + document.getElementById('allsites').value;//NO I18N
    }

    var addedlicenses = window.opener.document.getElementById('addedlicenses');

    if( addedlicenses.value != '' )
    {
        param += '&addedlicenses=' + addedlicenses.value;//NO I18N
    }
    updateState(getPortalViewName("AllSoftwareLicenceView"),"_D_RP", param);//No I18N
    refreshSubView(getPortalViewName('AllSoftwareLicenceView'));//No I18N

    var param = 'operation=fetchsoftwarelicenses';//No I18N
    param += "&addedlicenses=" + addedlicenses.value;//No I18N
    callCustomAjaxRequest('/LicenseAgreement.do', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchsoftwarelicenses');//NO I18N

    document.getElementById('associatedstatus').style.display = 'block';
    setTimeout(function(){Hide("associatedstatus")}, 2000);
}

function associateToAgreement(agreementId)
{
    var valid = checkForDelete(document.SoftwareLicenseListView, "checkbox");//NO I18N

    if( !valid )
    {
        alert(getMessageForKey('sdp.inventory.softwarelicense.chooselicensetoadd'));//NO I18N
        return false;
    }

    var selectedObj = document.getElementsByName("checkbox");//NO I18N

    var licenseIds = null;

    for( i=0; i<selectedObj.length; i++ )
    {
        if( selectedObj[i].checked )
        {
            if( licenseIds != null )
            {
                licenseIds += "," + selectedObj[i].value;//NO I18N
            }
            else
            {
                licenseIds = selectedObj[i].value;
            }
        }
    }

    var parame = 'softwareManufacturer=' + document.getElementById('swManufacturer').value;//NO I18N
    parame += '&fromLALicenseSearch=true';//NO I18N

    if( document.getElementById('softwareName').value > 0 )
    {
        parame += '&softwareId=' + document.getElementById('softwareName').value;//NO I18N
    }

    if( document.getElementById('allsites').value > 0 )
    {
        parame += '&siteId=' + document.getElementById('allsites').value;//NO I18N
    }

    var addedlicenses = window.opener.document.getElementById('addedlicenses');

    if( addedlicenses.value == '' )
    {
        addedlicenses.value = licenseIds;
    }
    else
    {
        addedlicenses.value += "," + licenseIds;//NO I18N
    }

    parame += '&addedlicenses=' + addedlicenses.value;//NO I18N

    updateState(getPortalViewName("AllSoftwareLicenceView"),"_D_RP", parame);//No I18N
    refreshSubView(getPortalViewName('AllSoftwareLicenceView'));//No I18N


    var param = 'operation=addtoagreement&swManufacturer=' + document.getElementById('swManufacturer').value + '&agreementId=' + agreementId;//NO I18N

    param += "&licenseIds=" + licenseIds;//NO I18N

    callCustomAjaxRequest('/LicenseAgreement.do', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'addtoagreementandclose');//NO I18N
}

function addToAgreement()
{
    var valid = checkForDelete(document.SoftwareLicenseListView, "checkbox");//NO I18N

    if( !valid )
    {
        alert(getMessageForKey('sdp.inventory.softwarelicense.chooselicensetoadd'));//NO I18N
        return false;
    }

    var selectedObj = document.getElementsByName("checkbox");//NO I18N

    var param = null;
    for( i=0; i<selectedObj.length; i++ )
    {
        if( selectedObj[i].checked )
        {
            if( param != null )
            {
                param += "," + selectedObj[i].value;//NO I18N
            }
            else
            {
                param = selectedObj[i].value;
            }
        }
    }

    var addedlicenses = window.opener.document.getElementById('addedlicenses');

    if( addedlicenses != undefined )
    {
        if( addedlicenses.value == '' )
        {
            addedlicenses.value = param;
        }
        else
        {
            addedlicenses.value += "," + param;//NO I18N
        }
    }

    searchSoftwareLicenses();
}
function updateLicensesTable(updatedContent) {
    document.getElementById('existingswlicenselist').innerHTML = updatedContent;
    bindLicenseClickEvent();
}

function bindLicenseClickEvent() {
    jQuery('#existingLicensesTable').on('click', '[sdpJs^="js-event-addexistingsoftwarelicenses-1"]', function(event) {
        var licenseId = this.getAttribute('data-license-id');
        removeLicenseFromBuffer(this, licenseId);
    });
}

function agreementAjaxRequestSuccess( req, module )
{
    if( module == 'fetchsoftwarelicenses' || module == 'fetchsoftwarelicenses_close_window' )
    {
        if (window.opener) {
            window.opener.updateLicensesTable(req.responseText);
        }

        if( module == 'fetchsoftwarelicenses_close_window' )
        {
            self.close();
        }
        //document.getElementById('wheelloadicon').style.visibility = 'hidden';
    }
    else if( module == 'createlicenses' )
    {
        var assetObj = req.responseXML.getElementsByTagName("Resources");
        var length = assetObj.length;

        var licenseId = null;

        for( i=0; i<length; i++ )
        {
            if( licenseId != null )
            {
                licenseId += "," + assetObj[i].getAttribute("resourceid");//No I18N
            }
            else
            {
                licenseId = assetObj[i].getAttribute("resourceid");
            }
        }

        var addedlicenses = window.opener.document.getElementById('addedlicenses');

        if( addedlicenses.value == '' )
        {
            addedlicenses.value = licenseId;
        }
        else
        {
            addedlicenses.value = addedlicenses.value + "," + licenseId;//No I18N
        }

        var param = 'operation=fetchsoftwarelicenses';//No I18N
        param += "&addedlicenses=" + addedlicenses.value;//No I18N
        callCustomAjaxRequest('/LicenseAgreement.do', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchsoftwarelicenses_close_window');//NO I18N
    }
    else if( module == 'addtoagreementandclose' )
    {
        viewLicenseAgreement('operation=viewagreement&agreementId=' + req.responseText);//NO I18N
    }
    else if( module == 'addtoagreement' )
    {
        parent.closeDialog();
        updateState(getPortalViewName("AllSoftwareLicenceView"),"_D_RP", "softwareManufacturer=" + document.getElementById('swManufacturer').value);//No I18N
        refreshSubView(getPortalViewName('AllSoftwareLicenceView'));//NO I18N
    }
    else if( module == 'updateLicenseOption' )
    {
        var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseOptions");

        var index = AssetUtil.getSelectedLicenseType().split("_")[1];
        var licenseOptionValue = document.getElementById('licenseOption_' + index);

        AssetUtil.removeAllOptionTags(licenseOptionValue);

        if( swOptionsObj.length > 0 )
        {
            for( i=1; i<=swOptionsObj.length; i++ )
            {
                licenseOptionValue.options[i] = new Option(swOptionsObj[i-1].getAttribute('optionname'), swOptionsObj[i-1].getAttribute("licenseoptionid"));
            }
        }
        var swLicenseType = req.responseXML.getElementsByTagName("SoftwareInstallationTypes");
        var swComplianceType = req.responseXML.getElementsByTagName("SoftwareComplianceTracking");

        if( swLicenseType[0] != undefined && swComplianceType[0].getAttribute('trackby') == 'Workstation' )
        {
            var installationTypeId = swLicenseType[0].getAttribute('name');
        }
        else if( swLicenseType[0] != undefined && swComplianceType[0].getAttribute('trackby') == 'User' )
        {
            var userAccess = req.responseXML.getElementsByTagName('SoftwareUserAccessTypes');
            installationTypeId = userAccess[0].getAttribute('name');
        }

        if( installationTypeId == 'Single' || installationTypeId == 'OEM' ) //Single or OEM
        {
            document.getElementById('licenseCount_' + index).value = '1';//No I18N
            document.getElementById('licenseCount_' + index).setAttribute('readOnly', 'true');
        }
        else if( installationTypeId == 'Unlimited' )
        {
            document.getElementById('licenseCount_' + index).value = 'Unlimited';//No I18N
            document.getElementById('licenseCount_' + index).setAttribute('readOnly', 'true');
        }
        else
        {
            document.getElementById('licenseCount_' + index).value = '1';//No I18N
            document.getElementById('licenseCount_' + index).removeAttribute('readOnly');
        }
    }
    else if( module == 'fetchLicenseOption' )
    {
        var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseOptions");
        var licenseOptionValue = document.getElementById('licenseOptionValue');

        AssetUtil.removeAllOptionTags(licenseOptionValue);

        if( swOptionsObj.length > 0 )
        {
            for( i=1; i<=swOptionsObj.length; i++ )
            {
                licenseOptionValue.options[i] = new Option(swOptionsObj[i-1].getAttribute('optionname'), swOptionsObj[i-1].getAttribute("licenseoptionid"));
            }
        }
        var swTypesObj = req.responseXML.getElementsByTagName("SoftwareLicenseTypes");

        if( swTypesObj.length > 0 )
        {
            document.getElementById('isfreelicense').value = swTypesObj[0].getAttribute('isfreelicense');
            document.getElementById('isfreesupport').value = swTypesObj[0].getAttribute('isfreesupport');
            document.getElementById('isperpetual').value = swTypesObj[0].getAttribute('isperpetual');
            document.getElementById('iscompanylicense').value = swTypesObj[0].getAttribute('iscompanylicense');
            document.getElementById('licenseTypeName').value = swTypesObj[0].getAttribute('licensetype');
            document.getElementById('isnodelockedlicense').value = swTypesObj[0].getAttribute('isnodelocked');
            document.getElementById('userAccessType').value = swTypesObj[0].getAttribute('useraccesstypeid');
        }

        var swCompObj = req.responseXML.getElementsByTagName("SoftwareComplianceTracking");

        if( swCompObj.length > 0 )
        {
            document.getElementById('trackby').value = swCompObj[0].getAttribute('trackby');
        }

        var swInstObj = req.responseXML.getElementsByTagName("SoftwareInstallationTypes");

        if( swInstObj.length > 0 )
        {
            document.getElementById('installationType').value = swInstObj[0].getAttribute('name');
        }

        var assetutil = new AssetUtil(AssetUtil.getCurrentForm());
        assetutil.showHideLicenseInformation(document.getElementById('licenseType'));
        updateInstalledServerNames(document.getElementById('componentID'));
    }
    else if( module == 'deleteLA' )
    {
        refreshSubView(getPortalViewName('LicenseAgreementListView'));//NO I18N
    }
    else if( module == 'add_license_agreement' || module == 'viewlicenseagreement' || module == 'editlicenseagreement' )
    {
        if( document.getElementById('loadingdivid') != undefined )
        {
            document.getElementById('loadingdivid').style.display = 'none';
            closeModalDialog();
        }
        var uobj = document.getElementById('agreementStart');

        var needScrolling = true;
        var needToShowSuccessMSG = false;

        if( uobj == undefined )
        {
            uobj = document.getElementById('softwaredetailspage');
        }
        if( uobj == undefined ) {
            uobj = window.opener.document.getElementById('agreementStart');
            needScrolling = false;
            needToShowSuccessMSG = true;
        }

      if( uobj != null )
      {
        //uobj.innerHTML = req.responseText;
                jQuery(uobj).html(req.responseText);

        if( document.getElementById('agreementLabel') != undefined && document.getElementById('agreementValue') != undefined )
        {
            document.getElementById('agreementLabel').innerHTML = document.getElementById('agreementValue').innerHTML.replace(':', '');//No I18N
        }

        if( needScrolling )
        {
            new Effect.ScrollTo(uobj.id);
        }
        if( needToShowSuccessMSG ) {
            setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey("sdp.license.agreement.associatedstatus"), true, 2000)},1000);//NO I18N
        }
        setTimeout(callDateDefaultEventfn,200);
    }
    }
    else if( module == 'refreshlicenselist' )
    {
        var uobj = document.getElementById('licenseDetails');
        uobj.innerHTML = req.responseText;
        var scrObjs = uobj.getElementsByTagName("script");
        var len = scrObjs.length;
        for( ij=0; ij<len; ij++ )
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
                newScript.nonce = sdpNonce;
                document.getElementsByTagName("head")[0].appendChild(newScript);
            }
            catch(e){}
        }
    }
    else if( module == 'fetchLicenseTypeForAgreement' )
    {
        var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseTypes");
        var index = document.getElementById('swlicenselist').rows[1].id.split('_')[1];
        var licenseTypeValue = document.getElementById('licenseType_' + index);

        AssetUtil.removeAllOptionTags(licenseTypeValue);

        if( swOptionsObj.length > 0 )
        {
            for( i=1; i<=swOptionsObj.length; i++ )
            {
                licenseTypeValue.options[i] = new Option(swOptionsObj[i-1].getAttribute('displayname'), swOptionsObj[i-1].getAttribute("licensetypeid"));
            }
        }

        //Updating license options
        var url = "/servlet/AJaxServlet";//No I18N
        var param = "action=fetchLicenseOption&licenseTypeId=" + document.getElementById('licenseType_' + index).value + "&swManufacturer=" + document.getElementById('swManufacturer').value;//No I18N
        callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchLicenseOptionForAgreement');//No I18N
    }
    else if( module == 'fetchLicenseOptionForAgreement' )
    {
        var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseOptions");
        var index = document.getElementById('swlicenselist').rows[1].id.split('_')[1];
        var licenseOptionValue = document.getElementById('licenseOption_' + index);

        AssetUtil.removeAllOptionTags(licenseOptionValue);

        if( swOptionsObj.length > 0 )
        {
            for( i=1; i<=swOptionsObj.length; i++ )
            {
                licenseOptionValue.options[i] = new Option(swOptionsObj[i-1].getAttribute('optionname'), swOptionsObj[i-1].getAttribute("licenseoptionid"));
            }
        }
    }
    else if( module == 'add_software_license_type_tolist' )
    {
        if(req.responseXML==null){
            parent.window.open('/jsp/Error.jsp', '_self');//No i18n
            return;
        }
        try
        {
            var userObj = req.responseXML.getElementsByTagName("SoftwareLicenseTypes");
            if( userObj.length > 0 )
            {
                var mfgLength = document.getElementById('licenseType').options.length;
                if( document.getElementById('licenseType') != undefined )
                {
                    mfgLength = document.getElementById('licenseType').options.length;

                    document.getElementById('licenseType').options[mfgLength] = new Option(userObj[0].getAttribute("licensetype"), userObj[0].getAttribute("licensetypeid"));
                }
                document.getElementById('licenseType').value = userObj[0].getAttribute("licensetypeid");

                                jQuery('#licenseType').trigger('change');//NO I18N

                var loptions = req.responseXML.getElementsByTagName('SoftwareLicenseOptions');

                if( loptions != undefined && loptions[0] != undefined )
                {
                    AssetUtil.removeAllOptionTags(document.getElementById('licenseOptionValue'));
                    var length = loptions.length;

                    for( i=1; i<=length; i++ )
                    {
                        document.getElementById('licenseOptionValue').options[i] = new Option(loptions[i-1].getAttribute('optionname'), loptions[i-1].getAttribute('optionname'));
                    }
                }

                parent.closeDialog();
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.software.licensetype.addedsuccessfully'), true, 2000)},1000);//NO I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/invalidoperationicon.gif',getMessageForKey('sdp.admin.software.licensetype.alreadyadded'), true, 2000)},1000);//NO I18N
            }
        }
        catch(e)
        {
            setTimeout(function(){displayLoadingInformation('/images/invalidoperationicon.gif',getMessageForKey('sdp.admin.software.licensetype.alreadyadded'), true, 2000)},1000);//NO I18N
        }
    }
    else if( module == 'add_software_license_type' )
    {
        if(req.responseXML==null){
            parent.window.open('/jsp/Error.jsp', '_self');//No i18n
            return;
        }
        try
        {
            if( req.responseXML.getElementsByTagName('SoftwareLicenseTypes').length > 0 )
            {
                setTimeout(function(){displayLoadingInformation('/images/discoverystatus_discovered.gif',getMessageForKey('sdp.admin.software.licensetype.addedsuccessfully'), true, 2000)},1000);//NO I18N
                refreshLicenseTypeList(document.getElementById('swMfg'), document.dummyForm);

                var mfgLength = document.getElementById('softwareManufacturer').options.length;

                if( !AssetUtil.isContainsValue(document.getElementById('softwareManufacturer'), document.getElementById('swMfg').value) )
                {
                    document.getElementById('softwareManufacturer').options[mfgLength] = new Option(document.getElementById('swMfg').options[document.getElementById('swMfg').selectedIndex].innerHTML, document.getElementById('swMfg').value);
                }
                document.getElementById('softwareManufacturer').value = document.getElementById('swMfg').value;

                document.getElementById('swlicenseType').value = '';//No I18N
                document.getElementById('swMfg').value = '-1';//No I18N
                document.getElementById('swInstallationType').value = '-1';//No I18N
                document.getElementById('swComplianceType').value = '-1';//No I18N
                document.getElementById('isPerpetual').checked = false;
                document.getElementById('isNodeLocked').checked = false;
                document.getElementById('isFree').checked = false;
                document.getElementById('lmode').value = 'add';//No I18N
                AssetUtil.removeCompleteOptionTags(document.getElementById('swLicenseOption'));//No I18N
            }
            else
            {
                setTimeout(function(){displayLoadingInformation('/images/invalidoperationicon.gif',getMessageForKey('sdp.admin.software.licensetype.alreadyadded'), true, 2000)},1000);//NO I18N
            }
        }
        catch(e)
        {
            alert(e.message);
            setTimeout(function(){displayLoadingInformation('/images/invalidoperationicon.gif',getMessageForKey('sdp.admin.software.licensetype.alreadyadded'), true, 2000)},1000);//NO I18N
        }
    }
    else if( module == 'fetchManagedSoftwaresForAgreement' )
    {
        var swObj = req.responseXML.getElementsByTagName("SoftwareList");
        /*var swcomponent = document.getElementById('softwareName');

        AssetUtil.removeCompleteOptionTags(swcomponent);

        if( swObj.length > 0 )
        {
            for( i=0; i<swObj.length; i++ )
            {
                swcomponent.options[i] = new Option(swObj[i].getAttribute('softwarename'), swObj[i].getAttribute("softwareid"));
            }
        }*/

        var index = document.getElementById('swlicenselist').rows[1].id.split('_')[1];
        var software = document.getElementById('software_' + index);

        AssetUtil.removeAllOptionTags(software);

        if( swObj.length > 0 )
        {
            for( i=1; i<=swObj.length; i++ )
            {
                software.options[i] = new Option(swObj[i-1].getAttribute('softwarename'), swObj[i-1].getAttribute("softwareid"));
            }
        }

        var url = "/servlet/AJaxServlet";//No I18N
        var param = "action=fetchLicenseTypes&swManufacturer=" + document.getElementById('swManufacturer').value;//No I18N
        callCustomAjaxRequestForGET(url,param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'fetchLicenseTypeForAgreement');//No I18N
    }
    else if( module == 'fetchManagedSoftwares' )
    {
        var swObj = req.responseXML.getElementsByTagName("SoftwareList");

        var swcomponent = document.getElementById('componentID');

        if( swcomponent != undefined && swcomponent.type != 'text' && swcomponent.type != 'hidden' )
        {
            AssetUtil.removeAllOptionTags(swcomponent);

            if( swObj.length > 0 )
            {
                for( i=1; i<=swObj.length; i++ )
                {
                    swcomponent.options[i] = new Option(swObj[i-1].getAttribute('softwarename'), swObj[i-1].getAttribute("softwareid"));
                }
            }
        }

    if( jQuery('#licensedSoftware').length > 0 )
        {
            var licensedSoftwares = document.getElementById('licensedSoftware');

            AssetUtil.removeAllOptionTags(licensedSoftwares);

            if( swObj.length > 0 )
            {
                for( i=1; i<=swObj.length; i++ )
                {
                    licensedSoftwares.options[i] = new Option(swObj[i-1].getAttribute('softwarename'), swObj[i-1].getAttribute("softwareid"));
                }
            }
        }
        var $selectTags = jQuery('select[name^="software_"]');

        var isHavingValidData = true;

        $selectTags.each(function()
        {
            if( this.name.startsWith('software_') )
            {
                var downgradeSoftwares = document.getElementById(this.name);

                AssetUtil.removeAllOptionTags(downgradeSoftwares);

                if( swObj.length > 0 )
                {
                    for( i=1; i<=swObj.length; i++ )
                    {
                        downgradeSoftwares.options[i] = new Option(swObj[i-1].getAttribute('softwarename'), swObj[i-1].getAttribute("softwareid"));
                    }
                }
            }
        });

        var clientSWName = document.getElementById('clientSWName');

        if( clientSWName != undefined )
        {
            AssetUtil.removeAllOptionTags(clientSWName);

            if( swObj.length > 0 )
            {
                for( i=1; i<=swObj.length; i++ )
                {
                    clientSWName.options[i] = new Option(swObj[i-1].getAttribute('softwarename'), swObj[i-1].getAttribute("softwareid"));
                }
            }
        }

        var assetutil = new AssetUtil(AssetUtil.getCurrentForm());
        assetutil.updateSoftwareLicenseTypes(document.getElementById('softwareManufacturer'));
    }
    else if( module == 'fetchLicenseType' )
    {
        var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseTypes");
        var licenseTypeValue = document.getElementById('licenseType');

    if( swOptionsObj != undefined && licenseTypeValue != undefined )
        {

        AssetUtil.removeCompleteOptionTags(licenseTypeValue);

        if( swOptionsObj.length > 0 )
        {
            for( i=0; i<swOptionsObj.length; i++ )
            {
                licenseTypeValue.options[i] = new Option(swOptionsObj[i].getAttribute('displayname'), swOptionsObj[i].getAttribute("licensetypeid"));
            }
        }

        var assetutil = new AssetUtil(AssetUtil.getCurrentForm());
        assetutil.updateSoftwareLicenseOptions(document.getElementById('softwareManufacturer'));
    }
    else
        {
            //Will be invoked incase of upgrade or downgrade license
            AssetUtil.removeAllOptionTags(document.getElementById('licensedSoftware'));

            var licensedSoftwareObj = jQuery('select#licensedSoftware');

            jQuery('select#componentID option').each(function(idx)
            {
                if( this.value != '0' )
                {
                    licensedSoftwareObj.append( jQuery('<option></option>').val(this.value).html(this.innerHTML) );
                }

            });
        }
    }
    else if( module == 'addLicenseOption' )
    {
        hideRow('errorRow');//No I18N

        var licenseOption = req.responseXML.getElementsByTagName("licenseOptionId");
        if( licenseOption.length > 0 )
        {
            var length = document.getElementById('licenseOptionValue').options.length;
            document.getElementById('licenseOptionValue').options[length] = new Option(req.responseXML.getElementsByTagName("licenseOption")[0].childNodes[0].nodeValue, req.responseXML.getElementsByTagName("licenseOptionId")[0].childNodes[0].nodeValue);
            document.getElementById('licenseOptionValue').value = req.responseXML.getElementsByTagName("licenseOptionId")[0].childNodes[0].nodeValue;
            closeDialog();
        }
        else
        {
            displayRow('errorRow');//No I18N
            document.getElementById('errorMsg').innerHTML = encodeHTML(req.responseXML.getElementsByTagName("error")[0].childNodes[0].nodeValue);
        }
    }
    else if( module == 'edit_software_license_type' )
    {
        var ltype = req.responseXML.getElementsByTagName('SoftwareLicenseTypes');

        document.getElementById('swComplianceType').value = ltype[0].getAttribute('trackbyid');
        showAdditionalProperties(document.getElementById('swComplianceType'));

        document.getElementById('swlicenseType').value = ltype[0].getAttribute('displayname');
        document.getElementById('swMfg').value = ltype[0].getAttribute('swmanufacturerid');
        document.getElementById('swInstallationType').value = ltype[0].getAttribute('installationtypeid');
        document.getElementById('isPerpetual').checked = ltype[0].getAttribute('isperpetual');
        document.getElementById('isFree').checked = ltype[0].getAttribute('isfreelicense');
        document.getElementById('isNodeLocked').checked = ltype[0].getAttribute('isnodelocked');
        if( ltype[0].getAttribute('useraccesstypeid') != null )
        {
            document.getElementById('userAccessType').value = ltype[0].getAttribute('useraccesstypeid');
        }
        else
        {
            document.getElementById('userAccessType').value = 1;
        }

        //Some of the software licenses may be created using license type
        if( req.getResponseHeader('licensetypeusage') != null && trim(req.getResponseHeader('licensetypeusage')) != '' )
        {
            document.getElementById('swMfg').disabled = true;
            document.getElementById('swInstallationType').disabled = true;
            document.getElementById('swComplianceType').disabled = true;
            document.getElementById('isPerpetual').disabled = true;
            document.getElementById('isFree').disabled = true;
            document.getElementById('isNodeLocked').disabled = true;
            document.getElementById('userAccessType').disabled = true;
            document.getElementById('addnewmanufacturer').style.visibility = 'hidden';
        }
        else
        {
            document.getElementById('swMfg').disabled = false;
            document.getElementById('swInstallationType').disabled = false;
            document.getElementById('swComplianceType').disabled = false;
            document.getElementById('isPerpetual').disabled = false;
            document.getElementById('isFree').disabled = false;
            document.getElementById('isNodeLocked').disabled = false;
            document.getElementById('userAccessType').disabled = false;
            document.getElementById('addnewmanufacturer').style.visibility = 'visible';
        }

        document.getElementById('licenseTypeId').value = req.getResponseHeader('licenseTypeId');//No I18N

        AssetUtil.removeCompleteOptionTags(document.getElementById('swLicenseOption'));

        var loptions = req.responseXML.getElementsByTagName('SoftwareLicenseOptions');

        var unusedoptions = req.getResponseHeader('unusedoptions');//No I18N

        if( loptions != undefined && loptions[0] != undefined )
        {
            var length = loptions.length;

            for( i=0; i<length; i++ )
            {
                document.getElementById('swLicenseOption').options[i] = new Option(loptions[i].getAttribute('optionname'), loptions[i].getAttribute('optionname'));
                if( unusedoptions != null && unusedoptions.indexOf(',' + loptions[i].getAttribute('licenseoptionid') + ',') < 0 )
                {
                    document.getElementById('swLicenseOption').options[i].disabled = true;
                }
            }
        }
        document.getElementById('addnewlicensetypepage').style.display = 'block';//No I18N
        document.getElementById('loadingdivid').style.display = 'none';//No I18N
        document.getElementById('swlicenseType').focus();
    }
}
function setReadonly( selectElementId, width )
{
    var selectElement = document.getElementById(selectElementId);

    if (selectElement && selectElement.type == 'select-one')
    {
        var parent = selectElement.parentElement;
        var textValue = selectElement.options[selectElement.options.selectedIndex].text;
        if (!parent){
            parent=selectElement.parentNode;
            textValue = selectElement.options[selectElement.options.selectedIndex].text;
        }
        var input = document.createElement("input");//No I18N
        input.setAttribute("id",selectElement.id + "_old");//No I18N
        input.setAttribute("name",selectElement.name + "_old");//No I18N
        input.setAttribute("type","text");//No I18N
        input.setAttribute("value",textValue);//No I18N
        if( width == undefined )
        {
            input.style.width = "100%";//No I18N
            input.className = "formStyledisabled";//No I18N
        }
        else
        {
            input.style.width = width;
            input.className = "formStyledisabled";//No I18N
        }
        input.readOnly = true;
        parent.appendChild(input);
    }

    if( selectElement )
    {
      selectElement.style.display = 'none';
    }
}
function confirmLADelete(form)
{
    var valid = checkForDelete(form,"checkbox");//NO I18N
    if(valid)
    {
        valid = confirm(getMessageForKey("sdp.inventory.swlicenseagrview.jserror2"));//NO I18N
        if(valid)
        {
            var param = "operation=deleteLA";//NO I18N

            var selectedObj = document.getElementsByName("checkbox");//NO I18N

            for( i=0; i<selectedObj.length; i++ )
            {
                if( selectedObj[i].checked )
                {
                    param += "&agreementId=" + selectedObj[i].value;//NO I18N
                }
            }
            callCustomAjaxRequest('/LicenseAgreement.do', param, agreementAjaxRequestSuccess, ajaxRequestOnFailure, 'deleteLA');//NO I18N
        }
        else
        {
            return false;
        }
    }
    else
    {
        alert(getMessageForKey("sdp.inventory.swlicenseagrview.jserror1"));//NO I18N
    }
    return false;
}


function exportWSData()
{
    valid = confirm(getMessageForKey("sdp.inventory.export.wsdata.confirm"));

    if (valid)
    {
        var zipFile=document.getElementById("zipFile");
        zipFile.style.display = "none";
        var zipFileError = document.getElementById("zipFileError");
        zipFileError.style.display = "none";

        var loadingElem=document.getElementById("inProgress");
        loadingElem.style.display="block";
        url = "/servlet/ClientUtilServlet"; // No i18n
        param = "mode=exportWSData&exportWS=true&temp=dummy"; // No i18n
        callCustomAjaxRequestForGET(url,param, processWSExportResult, ajaxRequestOnFailure, 'processWSExportResult'); //NO I18n
    }
}

function processWSExportResult( req, module )
{
    var nameNode = req.responseXML.getElementsByTagName("ZipFile")[0];
    if (nameNode != null)
    {
        var objTextNode = nameNode.childNodes[0];
        var zipFile=document.getElementById("zipFile");
        var loadingElem=document.getElementById("inProgress");
        loadingElem.style.display="none";
        if(objTextNode != null)
        {
            var fileName = objTextNode.nodeValue;
            var fileLocation = "/workorder/FileDownload.jsp?FILENAME="+fileName+"&module="+"exportimport";;  // No i18n
            var displayResult=document.getElementById("displayResult");
            displayResult.innerHTML = document.getElementById("sdp.inventory.export.comment").innerHTML+'<br><a href='+fileLocation+'>'+document.getElementById("sdp.inventory.export.click").innerHTML+' '+document.getElementById("sdp.support.supportfile.creating.msg4").innerHTML+' '+'</a>'+ document.getElementById("sdp.inventory.export.msg1").innerHTML;//No I18N
            zipFile.style.display = "block";
        }
    }
    else
    {
        var loadingElem=document.getElementById("inProgress");
        loadingElem.style.display="none";

        var zipFileError = document.getElementById("zipFileError");
        zipFileError.style.display = "block";
    }
}
function exportAndPushData()
{
    isCentralInfoConfigured = isCentralServerSettingsConfigured();
    if (isCentralInfoConfigured)
    {
        valid = confirm(getMessageForKey("sdp.inventory.export.dataandpush.confirm"));

        if (valid)
        {
            var zipFile=document.getElementById("zipFile1");
            zipFile.style.display = "none";
            var zipFileError = document.getElementById("zipFileError1");
            zipFileError.style.display = "none";

            var loadingElem=document.getElementById("inProgress1");
            loadingElem.style.display="block";
            url = "/servlet/ClientUtilServlet"; // No i18n
            param = "mode=exportAndPushData&exportAndPushData=true&temp=dummy"+ "&" + getCSRFParamName() + "=" + getCSRFParamValue(); // No i18n
            callCustomAjaxRequest(url,param, processExportAndPushResult, ajaxRequestOnFailure, 'processExportAndPushResult');//NO I18n
        }
    }
}

function processExportAndPushResult( req, module )
{
    var nameNode = req.responseXML.getElementsByTagName("ZipFile")[0];
    if (nameNode != null)
    {
        var objTextNode = nameNode.childNodes[0];
        var zipFile=document.getElementById("zipFile1");
        var loadingElem=document.getElementById("inProgress1");
        loadingElem.style.display="none";
        if(objTextNode != null)
        {
            var displayResult=document.getElementById("displayResult1");
            displayResult.innerHTML = document.getElementById("sdp.inventory.export.dataandpush.message").innerHTML;
            zipFile.style.display = "block";
        }
    }
    else
    {
        var loadingElem=document.getElementById("inProgress1");
        loadingElem.style.display="none";

        var exceptionNode = req.responseXML.getElementsByTagName("Exception")[0];
        var expTextNode = exceptionNode.childNodes[0];
        var expVal = expTextNode.nodeValue;
        var dispException=document.getElementById("displayException1");
        dispException.innerHTML=encodeHTML(expVal);

        var zipFile2Exception=document.getElementById("zipFileError1");
        zipFile2Exception.style.display = "block";
    }
}

function confirmRemoteDelete(form)
{
    var valid = checkForDelete(form,"checkbox"); // No i18n
    if(valid)
    {
        valid = confirm(document.getElementById("confirmMsg").innerHTML);
        if (!valid)
        {
            return false;
        }

        var ids = "";
        var elements_list = form.elements;
        var length = elements_list.length;
        var element_type;
        for( i=0; i<length; i++ ) {
            element_type = elements_list[i].type;
            if( element_type == 'checkbox') {
                if (elements_list[i].checked)
                {
                    ids += "##" + encodeURIComponent(elements_list[i].value); //No I18N
                    }}}
                    url = "/servlet/ClientUtilServlet"; // No i18n
                    callCustomAjaxRequest(url,"mode=confirmRemoteDelete&deleteRemoteData=true&param="+ids + "&" + getCSRFParamName() + "=" + getCSRFParamValue(), deleteRemoteData, ajaxRequestOnFailure, 'deleteRemoteData');//NO I18n
    }
    else
    {
        alert(document.getElementById("selectMsg").innerHTML);
        return false;
    }
    return false;
}

function deleteRemoteData( req, module )
{
    var result = req.responseText;

    if (result == 'Success')
    {
        document.getElementById('deleteSuccessMsg').style.display = 'block';//NO I18N
    }
    else
    {
        document.getElementById('deleteFailureMsg').style.display = 'block';//NO I18N
    }

    refreshSubView(getPortalViewName('RemoteDataView')); // No i18n
}
function filterAgreementListView( selectTag, softwareId )
{
    var param = "expirein=" + selectTag.value//No I18N

    if( softwareId != null )
    {
        param += "&softwareId=" + softwareId;//No I18N
    }
    updateState(getPortalViewName("LicenseAgreementListView"),"_D_RP", param);//No I18N
    refreshSubView(getPortalViewName('LicenseAgreementListView'));//No I18N
}
function confirmLicensesDelete(form, additionalParams)
{
        var valid = checkForDelete(form,"alllicenses");//NO I18N
    if(valid)
    {
        valid = confirm(getMessageForKey("sdp.inventory.swlicenseview.jserror4"));//NO I18N
        if(valid)
        {
            var param = 'action=delete';//NO I18N
            jQuery('[name=alllicenses]').each(function(obj)
            {
                if(this.checked)
                {
                    param += '&checkbox=' + this.value;//NO I18N
                }
            });
            callCustomAjaxRequest('/SoftwareLicenseListView.do', param, successOnLicenseDelete, failureOnLicensedelete, 'delete');//NO I18N
        }
        else
        {
            return false;
        }
    }
    else
    {
        alert(getMessageForKey("sdp.inventory.swlicenseview.jserror"));//NO I18N
    }
    return false;
}

function successOnLicenseDelete( req, operation )
{
    var result = req.responseXML;

        if( result.getElementsByTagName("result") != undefined && result.getElementsByTagName("result").length > 0)
        {
            var statusCode = result.getElementsByTagName("result")[0].getAttribute("code");
            if(statusCode != null && statusCode == 200 )
            {
                jQuery('#operation_success_message').text(result.getElementsByTagName("result")[0].childNodes[0].nodeValue);
                jQuery('#successMessage').show();
                reloadListview('alllicenses');//NO I18N
                setTimeout(function(){jQuery('#successMessage').hide()},4000);
            }
            else if(statusCode != null && statusCode != 200 )
            {
                jQuery('#operation_failure_message').text(result.getElementsByTagName("result")[0].childNodes[0].nodeValue);
                jQuery('#errorMessage').show();
                setTimeout(function(){jQuery('#errorMessage').hide()},4000);//NO I18N
            }
        }
}

function failureOnLicensedelete( req, operation )
{
    alert(req.responseText);
}

function resetMandatoryCheck()
{
    if( document.getElementById('swManufacturer').value > 0 )
    {
        resetMandatoryElement('swManufacturer');//NO I18N
    }
}

function reloadLicenseListview()
{
    if( jQuery('#swManufacturer').val() > 0 )
    {
        reloadListview('alllicenses', JSON.parse('{"SoftwareList:SWMANUFACTURERID":' + jQuery('#swManufacturer').val() + ', "licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
    }
    else
    {
        reloadListview('alllicenses', JSON.parse('{"licenseCategory":"' + jQuery('#swLicenseCategory').val() +'"}'));//NO I18N
    }
}
function showAdditionalProperties( selectTag )
{
    if( selectTag.value == 1 ) //Workstation
    {
        hideRow('userAccessTypeRow');//No I18N
        //document.getElementById('userAccessType').value = -1;
        displayRow('isNodeLockedRow');//No I18N
        displayRow('swInstallationTypeRow');//No I18N
        document.getElementById('swInstallationType').value = '-1';//No I18N
    }
    else if( selectTag.value == 2 ) //User
    {
        document.getElementById('swInstallationType').value = '1';//No I18N
        displayRow('userAccessTypeRow');//No I18N
        hideRow('isNodeLockedRow');//No I18N
        hideRow('swInstallationTypeRow');//No I18N
        document.getElementById('isNodeLocked').checked = false;
    }
    else
    {
        hideRow('userAccessTypeRow');//No I18N
        hideRow('isNodeLockedRow');//No I18N
        document.getElementById('isNodeLocked').checked = false;
        //document.getElementById('userAccessType').value = -1;
    }
}
function chooseUnlimitedInstallation(checkBox)
{
    if( checkBox.checked )
    {
        if( !document.getElementById('isNodeLocked').checked )
        {
            document.getElementById('swInstallationType').value = 3;
        }
    }
}

function chooseSingleInstallation(checkBox)
{
    if( checkBox.checked )
    {
        document.getElementById('swInstallationType').value = 1;
    }
    else
    {
        if( document.getElementById('isFree').checked )
        {
            document.getElementById('swInstallationType').value = 3;
        }
    }
}

function removeLicenseFromBuffer(theRow, licenseId)
{
    if( confirm(getMessageForKey('sdp.license.agreement.deassociate.license.info')) )
    {
        var addedlicenses = document.getElementById('addedlicenses').value;

        if( addedlicenses != '' )
        {
            addedlicenses = addedlicenses.replace(',' + licenseId, '');//No I18N
            addedlicenses = addedlicenses.replace(licenseId, '');//No I18N
            document.getElementById('addedlicenses').value = addedlicenses;
        }
        //theRow.parentNode.removeChild(theRow);
        if( document.createElement && document.childNodes )
        {
            if( theRow.type != 'TR' )
            {
                var thisRow = theRow.parentNode.parentNode.parentNode;

                thisRow.parentNode.removeChild(thisRow);
            }
            else
            {
                theRow.parentNode.removeChild(theRow);
            }
        }

        if( document.getElementById('existingLicensesTable').rows.length == 1 )
        {
            var trow = document.createElement("tr");//No I18N
            trow.setAttribute("class", "evenRow");//No I18N

            var tdata = document.createElement("td");//No I18N
            tdata.setAttribute("colspan", "9");//No I18N
            tdata.setAttribute("style",'width:100%;');//No I18N
            tdata.setAttribute("align", "center");//No I18N
            tdata.innerHTML = getMessageForKey('sdp.inventory.listview.noswassetmessage');//No I18N

            trow.appendChild(tdata);

            document.getElementById('existingLicensesTable').appendChild(trow);
        }
    }
}
function callChangeServerType( req, module )
{
    window.location.reload();
}

function validateCSVFile()
{
    if( trim(document.getElementById('csvfile').value) == '' )
    {
        alert(getMessageForKey('sdp.software.license.import.locatecsv'));
        return false;
    }

    if( !document.getElementById('csvfile').value.toLowerCase().endsWith('.csv') )
    {
        alert(getMessageForKey("sdp.software.license.import.allowedonlycsvfile"));
        return false;
    }
    darkMode();
    return true;
}
function validateXLSFile()
{
    if( trim(document.getElementById('xlsfile').value) == '' )
    {
        alert(getMessageForKey('sdp.contract.import.locatexls'));
        return false;
    }

    if( document.getElementById('xlsfile').value.endsWith('.xlsx') )
    {
        alert(getMessageForKey("sdp.contract.import.xlsxfileHelp"));
        return false;
    }

    if( !document.getElementById('xlsfile').value.endsWith('.xls') )
    {
        alert(getMessageForKey("sdp.contract.import.allowedonlyXlsfile"));
        return false;
    }

    return true;
}
function gotoContractListview()
{
    if(isMSP){
	    if(window.parent.document.getElementById('fromAccTab')){
    		if(window.parent.document.getElementById('fromAccTab').value == "true"){
    			window.parent.goBack();
	    		return;
    		}
	    }
    }
    window.parent.document.location = '/ContractView.do?contractMode=contractListView';
}
function calcHeight(iframeId)
{
    document.getElementById(iframeId).height = 10;
    var the_height= document.getElementById(iframeId).contentWindow.
    document.body.scrollHeight;
    document.getElementById(iframeId).height = the_height;
}



function getFailedWSCount(days,proceedAfterScanSummary)
{
    url = "/servlet/ClientUtilServlet"; // No i18n
    callCustomAjaxRequestForGET(url,"mode=getScanFailedWS&scanFailedWS="+days, scanFailedWS, ajaxRequestOnFailure, proceedAfterScanSummary);//NO I18n
}


function scanFailedWS( req, module )
{
    var result = req.responseText;
    document.getElementById('failedWSCount').innerHTML = result;//NO I18N
    if (module == 'true')
    {
    fetchPageDetails('ResourcesInStore');//No I18N
        }
}


function getResourcesCountByState(resourceState,nextOperation)
{
    url = "/servlet/ClientUtilServlet"; // No i18n
    callCustomAjaxRequestForGET(url,"mode=getResourcesCount&resourcesCount=true&resourceState="+resourceState, resourceCountByState, ajaxRequestOnFailure, nextOperation);//NO I18n
}


function resourceCountByState( req, module )
{
    var result = req.responseText;
    if (module == 'ResourcesInUse')
    {
        document.getElementById('resourceCountByState').innerHTML = result;//NO I18N
    }
    else if (module == 'ResourcesInRepair')
    {
        document.getElementById('InUse').innerHTML = result;//NO I18N
    }
    else
    {
        document.getElementById('InRepair').innerHTML = result;//NO I18N
    }
    fetchPageDetails(module);
}

function getLeasedAssetsCount()
{
    url = "/servlet/ClientUtilServlet"; // No i18n
    callCustomAjaxRequestForGET(url,"mode=getLeasedAssetsCount&leasedAssetsCount=true", leasedAssetsCount, ajaxRequestOnFailure, 'leasedAssetsCount');//NO I18n
}

function leasedAssetsCount(req, module )
{
    var result = req.responseText;
    document.getElementById('leasedCount').innerHTML = result;//NO I18N
    fetchPageDetails('groups');//No I18N
}

function getAssetsPageGroups()
{
    url = "/servlet/ClientUtilServlet"; // No i18n
    callCustomAjaxRequestForGET(url,"mode=fetchGroups&fetchGroups=true", fetchGroups, ajaxRequestOnFailure, 'fetchGroups');//NO I18n
}

function fetchGroups(req, module )
{
    var result = req.responseText;
    document.getElementById('assetsPageGroups').innerHTML = result;//NO I18N
}

function addAdditionalField(tableName)
{
    if( trim(document.getElementById('fieldName').value) != '' )
    {
        var len = document.getElementById('picklist').options.length;

        for( i=0; i<len; i++ )
        {
            document.getElementById('picklist').options[i].selected = true;
        }

        var param = 'action=add_additional_field' + constructParameters(document.additionalField) + "&tableName=" + tableName;//NO I18N

        document.getElementById('success_div').style.display = 'none';//NO I18N
        callCustomAjaxRequest("/servlet/AJaxServlet", param, updateAdditionalFieldSection, ajaxRequestOnFailure, tableName);//NO I18N
    }
    else
    {
        alert(getMessageForKey('sdp.software.license.agreement.labelcantempty'));//NO I18N
        document.getElementById('fieldName').focus();
        return false;
    }
}

function importADUsers(os)
{
    if(!isLoginNotifcation_Outgoing_Enabled()){
        return false;
    }
    if(os.indexOf('Windows')!=-1)
    {
        //SD-86904
        NewWindow('/ImportADUsers.do?operation=view','ImportADUsers',800,575,'yes','center',null,null,null,true)
    }
    else
    {
        alert(getMessageForKey('sdp.admin.importusers.nonWindowsMsg'));
    }
}

function moveUsers( selectTag )
{
    if( document.getElementById('userAccessType').value == 1 ) //Single user allowed to access the software
    {
        if( document.getElementById('allocateToUser').options.length <= 0 )
        {
            copyListValues('allUserList','allocateToUser', selectTag);
        }
        else
        {
            alert(getMessageForKey('sdp.software.license.singleuser.allocwarn'));
        }
    }
    else
    {
        copyListValues('allUserList','allocateToUser', selectTag);//NO I18N
    }
}


function changeServerType(isRemote)
{
    isConfirm = confirm(getMessageForKey("sdp.admin.distrutedscan.change")); // no i18n
    if(isConfirm){
        url= "/servlet/ClientUtilServlet";  // no i18n
        params = "mode=changeServerType&changeServerType="+isRemote + "&" + getCSRFParamName() + "=" + getCSRFParamValue();  // no i18n

        callCustomAjaxRequest(url,params, callChangeServerType, ajaxRequestOnFailure, 'change_server_type'); //NO I18n
    }


}
function confirmToScan(listViewForm,typename,isFromCMDB,alertMsg)
{
    var valid = checkForDelete(listViewForm,"checkbox"); //NO I18N
    if(valid)
    {

         if(isFromCMDB != true){
            isFromCMDB = false;
         }
         var form = document.getElementById("groupscanform");
         var ciIds = getSelectedResources();
         if(form == null){
            jQuery(document.body).append(
             '<form id="groupscanform" action="/DomainDiscovery.do?action=getwsidtoscan&isgroupScan=true" method="POST" target="Scan_WS">' +
               '<input type="hidden" name="ciId" value="'+ ciIds+ '">'+
                 '<input type="hidden" name="isFromCMDB" value="'+ isFromCMDB+ '">' +
                 '<input type="hidden" name="type" value="' + typename + '">' +
                 '<input type="hidden" name="' + getCSRFParamName() + '" value="' + getCSRFParamValue() + '">' +
             '</form>');
            form = document.getElementById("groupscanform");
        }
        else{
            form.isFromCMDB.value = isFromCMDB;
            form.type.value = typename;
        }
        window.open('about:blank', 'Scan_WS', "scrollbars=yes,menubar=no,height=450,width=810,resizable=yes,toolbar=no,status=no,'noopener'");
        form.submit();
        jQuery('#groupscanform').remove();
       // NewWindow('DomainDiscovery.do?action=startgroupscan&isgroupScan=true&isFromCMDB='+isFromCMDB+'&type='+encodeURIComponent(typename),'Scan_WS','810','450','yes','center');//No I18N
    }
    else
    {
        alert(alertMsg);  //NO I18N
    }
}
function confirmChangeCredentials(form,isWS,isFromCMDB,alertMsg,type)
{
    var valid = checkForDelete(form,"checkbox"); //NO I18N
    var url = '/WsScanSettings.do?operation=changeforbulk&isBulk=true'; //NO I18N
    if(valid)
    {
        if(isFromCMDB){
            if(isWS){
                url=url+"&isFromCMDB=true"; //NO I18N
            }else if(type){
                url = url+"&isWorkstation=false&isFromCMDB=true&type="+type; //NO I18N
            }else{
                url = url+"&isWorkstation=false&isFromCMDB=true"; //NO I18N
            }
        }else if(!isWS && type){
            url = url +"&isWorkstation=false&type="+type; //NO I18N
        }
          NewWindow(url,'Scan_WS','640','260','yes','center', null, null, null, false);//No I18N
    }
    else
    {
        alert(alertMsg);
    }
}
function updateScanStatus(action,domain_network_id)
{
    var stat = "";
    if(action == 'start'){   //NO I18N
        stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.inprogress'); //NO I18N
        if(jQuery('#status_'+domain_network_id).length>0){
            jQuery('#status_'+domain_network_id).html('<img src="/images/discoverystatus_inprogress.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            document.getElementById("startScan_"+domain_network_id).style.display="none";
            document.getElementById("stopScan_"+domain_network_id).style.display="block";
        }

    }else if(action == 'stop'){ //NO I18N
        stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.scanned'); //NO I18N
        if(jQuery('#status_'+domain_network_id).length>0){
            jQuery('#status_'+domain_network_id).html('<img src="/images/discoverystatus_discovered.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            document.getElementById("stopScan_"+domain_network_id).style.display="none";
            document.getElementById("startScan_"+domain_network_id).style.display="block";
        }
    }else{
        stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.yettoscan'); //NO I18N
        if(jQuery('#status_'+domain_network_id).length>0){
            jQuery('#status_'+domain_network_id).html('<img src="/images/discoverystatus_discovered.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            document.getElementById("stopScan_"+domain_network_id).style.display="none";
            document.getElementById("startScan_"+domain_network_id).style.display="block";
        }
    }

}
function updateNetworkScanStatus(action,network_id,network_name,siteId,isSiteEnabled)
{
    var stat = "";
    if(jQuery('.scan_status_'+network_id).length>0){
        if(action == 'start'){   //NO I18N
            /*stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.inprogress'); //NO I18N
            jQuery('.scan_status_'+network_id).html('<img src="/images/discoverystatus_inprogress.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            jQuery('.scan_icon_'+network_id+' img').attr('class','admin_stopscanicon'); // no i18n
            jQuery('.scan_icon_'+network_id+' img').attr('title',getMessageForKey('sdp.admin.nwscan.stop',new Array(network_name))); // no i18n
            jQuery('.scan_icon_'+network_id+' a').attr('href','javascript:void stopScan("'+network_id+'","'+network_name+'","'+siteId+'")'); // no i18n*/

        }else if(action == 'stop'){ //NO I18N
            stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.scanned'); //NO I18N
            jQuery('.scan_status_'+network_id).html('<img src="/images/discoverystatus_discovered.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            jQuery('.scan_icon_'+network_id+' img').attr('class','admin_scannowicon'); // no i18n
            jQuery('.scan_icon_'+network_id+' img').attr('title',getMessageForKey('sdp.admin.nwscan.start',new Array(network_name))); // no i18n
            jQuery('.scan_icon_'+network_id+' a').attr('href','/');//NO I18N
            jQuery('.scan_icon_'+network_id+' a').addEventListener('click',function(){
                scanNetwork(network_id,network_name,siteId,isSiteEnabled);
            });
        }else{
            stat = getMessageForKey('sdp.admin.network.listview.discoverystatus.yettoscan'); //NO I18N
            jQuery('.scan_status_'+network_id).html('<img src="/images/discoverystatus_discovered.gif" height="18" width="18">&nbsp;'+stat); //NO I18N
            jQuery('.scan_icon_'+network_id+' img').attr('class','admin_scannowicon'); // no i18n
            jQuery('.scan_icon_'+network_id+' img').attr('title',getMessageForKey('sdp.admin.nwscan.start',new Array(network_name))); // no i18n
            jQuery('.scan_icon_'+network_id+' a').attr('href','/');//NO I18N
            jQuery('.scan_icon_'+network_id+' a').addEventListener('click',function(){
                scanNetwork(network_id,network_name,siteId,isSiteEnabled);
            });
        }
    }
}
/*
* Function included for ListViewWorkstationWithSW.jsp, on changing swmanufacturer it tag with SwId
* param send through Ajax  call, this call send to the SoftwareHomeAction.java and Manufacturer will be updated.
* Success and failure parameter also send with the Ajax request, on success it prints the Modified manufacturer.
* On failure alert text displayed
*/
function displaySWManufacturers()
{
    ShowHide('swManufacturer');//No I18N
    ShowHide('swManufacturerLabel');//No I18N
}


//***********************************************************DEPRECIATION SECTION START**************************************************************
//ProductDef Depreciation script section Start
function addDepreciation(form)
{
    var valid = checkForDelete(form,"checkbox");//NO I18N
    var param = "mode=get&isFrom=productlistview";//No I18N
    if(valid)
    {
        var selectedObj = document.getElementsByName("checkbox");//NO I18N
        for( var i=0; i<selectedObj.length; i++ )
        {
            if( selectedObj[i].checked )
            {
                param += "&wsId="+selectedObj[i].value;//NO I18N
            }
        }
        showURLInDialog('AddDepreciation.do?'+param,'modal=yes,closeButton=no')//No I18N
    }
    else
    {
        alert(getMessageForKey("sdp.product.listview.action.addproduct"));//No I18N
    }
}
function isDepreciationTypeSelected(depFormObject)
{
    var selIndx = depFormObject.depreciationTypeId.selectedIndex;

    var data = depFormObject.depreciationTypeId.options[selIndx].text;

    if(data=="Straight Line" || data=="Declining Balance" || data=="Sum Of The Years Digit" || data=="Double Declining Balance")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isStraightLineSelected(depFormObject)
{
    var selIndx = depFormObject.depreciationTypeId.selectedIndex;
    var data = depFormObject.depreciationTypeId.options[selIndx].text;
    if(data=="Straight Line")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isDeclineBalanceSelected(depFormObject)
{
    var selIndx = depFormObject.depreciationTypeId.selectedIndex;
    var data = depFormObject.depreciationTypeId.options[selIndx].text;
    if(data=="Declining Balance")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isDoubleDeclineBalanceSelected(depFormObject)
{
    var selIndx = depFormObject.depreciationTypeId.selectedIndex;
    var data = depFormObject.depreciationTypeId.options[selIndx].text;
    if(data=="Double Declining Balance")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isSumOfTheYearsDigitSelected(depFormObject)
{
    var selIndx = depFormObject.depreciationTypeId.selectedIndex;
    var data = depFormObject.depreciationTypeId.options[selIndx].text;
    if(data=="Sum Of The Years Digit")
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isUsefulLifeSelected(depFormObject)
{
    if(depFormObject.depreciationTypeRadio[0].checked )
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isDepreciationPercentSelected(depFormObject)
{
    if(depFormObject.depreciationTypeRadio[1].checked )
    {
        return true;
    }
    else
    {
        return false;
    }
}
function isDeclinePercentSelected(depFormObject)
{
    if(depFormObject.depreciationTypeRadio[2].checked )
    {
        return true;
    }
    else
    {
        return false;
    }
}
function depreciationTypeRadioSelected(depFormObject)
{
    if( isUsefulLifeSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType").style.display = '';
        document.getElementById("depreciationPercentType").style.display = 'none';
        document.getElementById("declinePercentType").style.display = 'none';
    }
    else if( isDepreciationPercentSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType").style.display = 'none';
        document.getElementById("depreciationPercentType").style.display = '';
        document.getElementById("declinePercentType").style.display = 'none';
    }
    else if(isDeclinePercentSelected(depFormObject))
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType").style.display = 'none';
        document.getElementById("depreciationPercentType").style.display = 'none';
        document.getElementById("declinePercentType").style.display = '';
    }
}
function setDepreciationTypeMethod(depFormObject,depreciationTypeRadio)
{
    if(depreciationTypeRadio != undefined && depreciationTypeRadio)
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType").style.display = '';
            document.getElementById("salvageValueType").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = '';
                document.getElementById("declinePercentRadio").style.display = 'none';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelected(depFormObject);
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DepreciationPercent")
                {
                    depFormObject.depreciationTypeRadio[1].checked = true;
                    depreciationTypeRadioSelected(depFormObject);
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = '';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelected(depFormObject);
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DeclinePercent")
                {
                    depFormObject.depreciationTypeRadio[2].checked = true;
                    depreciationTypeRadioSelected(depFormObject);
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = 'none';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = 'none';
                document.getElementById("depreciationPercentType").style.display = 'none';
                document.getElementById("declinePercentType").style.display = 'none';
                document.getElementById("usefulLifeType").style.display = '';
                document.getElementById("depreciationTypeRadioButton").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = '';
                }
                else
                {
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType").style.display = 'none';
            document.getElementById("usefulLifeRadio").style.display = 'none';
            document.getElementById("depreciationPercentRadio").style.display = 'none';
            document.getElementById("declinePercentRadio").style.display = 'none';
            document.getElementById("depreciationPercentType").style.display = 'none';
            document.getElementById("declinePercentType").style.display = 'none';
            document.getElementById("usefulLifeType").style.display = 'none';
            document.getElementById("salvageValueType").style.display = 'none';
            document.getElementById("depreciationTypeRadioButton").style.display = 'none';
            document.getElementById("inMonths").style.display = 'none';
            document.getElementById("inYears").style.display = 'none';
        }
    }
    else
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType").style.display = '';
            document.getElementById("salvageValueType").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = '';
                document.getElementById("declinePercentRadio").style.display = 'none';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelected(depFormObject);
                document.getElementById("inMonths").style.display = '';
                document.getElementById("inYears").style.display = 'none';
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = '';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelected(depFormObject);
                document.getElementById("inMonths").style.display = '';
                document.getElementById("inYears").style.display = 'none';
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = 'none';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = 'none';
                document.getElementById("depreciationPercentType").style.display = 'none';
                document.getElementById("declinePercentType").style.display = 'none';
                document.getElementById("usefulLifeType").style.display = '';
                document.getElementById("depreciationTypeRadioButton").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = '';
                }
                else
                {
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType").style.display = 'none';
            document.getElementById("usefulLifeRadio").style.display = 'none';
            document.getElementById("depreciationPercentRadio").style.display = 'none';
            document.getElementById("declinePercentRadio").style.display = 'none';
            document.getElementById("depreciationPercentType").style.display = 'none';
            document.getElementById("declinePercentType").style.display = 'none';
            document.getElementById("usefulLifeType").style.display = 'none';
            document.getElementById("salvageValueType").style.display = 'none';
            document.getElementById("depreciationTypeRadioButton").style.display = 'none';
            document.getElementById("inMonths").style.display = 'none';
            document.getElementById("inYears").style.display = 'none';
        }
    }
}

function validateDepreciationAttribute(depFormObject)
{
    if(isDepreciationTypeSelected(depFormObject))
    {
        if(isDeclineBalanceSelected(depFormObject))
        {
            if(isDeclinePercentSelected(depFormObject))
            {
                if(trim(depFormObject.declinePercent.value) == '')
                {
                    alert(getMessageForKey('sdp.admin.product.choosedecpercent'));
                    depFormObject.declinePercent.focus();
                    return false;
                }
                if(!checknumber(depFormObject.declinePercent))
                {
                    depFormObject.declinePercent.focus();
                    return false;
                }
            }
            else if(isUsefulLifeSelected(depFormObject))
            {
                if(trim(depFormObject.usefulLife.value) == '' )
                {
                    alert(getMessageForKey('sdp.admin.product.chooseusefullife'));
                    depFormObject.usefulLife.focus();
                    return false;
                }
                if(!isPositiveInteger(depFormObject.usefulLife.value))
                {
                    alert(getMessageForKey('sdp.admin.product.chooseusefullife.positiveInteger'));
                    depFormObject.usefulLife.focus();
                    return false;
                }
            }
        }
        else if(isStraightLineSelected(depFormObject))
        {
            if(isDepreciationPercentSelected(depFormObject))
            {
                if(trim(depFormObject.depreciationPercent.value) == '' )
                {
                    alert(getMessageForKey('sdp.admin.product.deppercent'));
                    depFormObject.depreciationPercent.focus();
                    return false;
                }
                if(!checknumber(depFormObject.depreciationPercent))
                {
                    depFormObject.depreciationPercent.focus();
                    return false;
                }
            }
            else if(isUsefulLifeSelected(depFormObject))
            {
                if(trim(depFormObject.usefulLife.value) == '' )
                {
                    alert(getMessageForKey('sdp.admin.product.chooseusefullife'));
                    depFormObject.usefulLife.focus();
                    return false;
                }
                if(!isPositiveInteger(depFormObject.usefulLife.value))
                {
                    alert(getMessageForKey('sdp.admin.product.chooseusefullife.positiveInteger'));
                    depFormObject.usefulLife.focus();
                    return false;
                }
            }
        }
        else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
        {
            if(trim(depFormObject.usefulLife.value) == '' )
            {
                alert(getMessageForKey('sdp.admin.product.chooseusefullife'));
                depFormObject.usefulLife.focus();
                return false;
            }
            if(!isPositiveInteger(depFormObject.usefulLife.value))
            {
                alert(getMessageForKey('sdp.admin.product.chooseusefullife.positiveInteger'));
                depFormObject.usefulLife.focus();
                return false;
            }
        }

        if(trim(depFormObject.salvageValue.value) != '')
        {
            var x=depFormObject.salvageValue.value;
            var anum=/(^\d+$)|(^\d+\.\d+$)/;
            var testresult;
            if (x!=null && x!="" && anum.test(x))
            {
                testresult=true;
            }
            else
            {
                alert(getMessageForKey('sdp.admin.product.salvageValue.positiveInteger'));
                depFormObject.salvageValue.focus();
                testresult=false;
            }

            return (testresult);
        }
    }

    return true;
}
//ProductDef Depreciation script section End

//AddDepreciation Dereciation scripts Start
function depreciationTypeRadioSelected_1(depFormObject)
{
    if( isUsefulLifeSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton_1").style.display = '';
        document.getElementById("usefulLifeType_1").style.display = '';
        document.getElementById("depreciationPercentType_1").style.display = 'none';
        document.getElementById("declinePercentType_1").style.display = 'none';
    }
    else if( isDepreciationPercentSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton_1").style.display = '';
        document.getElementById("usefulLifeType_1").style.display = 'none';
        document.getElementById("depreciationPercentType_1").style.display = '';
        document.getElementById("declinePercentType_1").style.display = 'none';
    }
    else if(isDeclinePercentSelected(depFormObject))
    {
        document.getElementById("depreciationTypeRadioButton_1").style.display = '';
        document.getElementById("usefulLifeType_1").style.display = 'none';
        document.getElementById("depreciationPercentType_1").style.display = 'none';
        document.getElementById("declinePercentType_1").style.display = '';
    }
}
function setDepreciationTypeMethod_1(depFormObject,depreciationTypeRadio)
{
    if(depreciationTypeRadio != undefined && depreciationTypeRadio)
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType_1").style.display = '';
            document.getElementById("salvageValueType_1").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = '';
                document.getElementById("depreciationPercentRadio_1").style.display = '';
                document.getElementById("declinePercentRadio_1").style.display = 'none';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelected_1(depFormObject);
                    document.getElementById("inMonthsOnDetails").style.display = '';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DepreciationPercent")
                {
                    depFormObject.depreciationTypeRadio[1].checked = true;
                    depreciationTypeRadioSelected_1(depFormObject);
                    document.getElementById("inMonthsOnDetails").style.display = 'none';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = '';
                document.getElementById("depreciationPercentRadio_1").style.display = 'none';
                document.getElementById("declinePercentRadio_1").style.display = '';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelected_1(depFormObject);
                    document.getElementById("inMonthsOnDetails").style.display = '';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DeclinePercent")
                {
                    depFormObject.depreciationTypeRadio[2].checked = true;
                    depreciationTypeRadioSelected_1(depFormObject);
                    document.getElementById("inMonthsOnDetails").style.display = 'none';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = 'none';
                document.getElementById("depreciationPercentRadio_1").style.display = 'none';
                document.getElementById("declinePercentRadio_1").style.display = 'none';
                document.getElementById("depreciationPercentType_1").style.display = 'none';
                document.getElementById("declinePercentType_1").style.display = 'none';
                document.getElementById("usefulLifeType_1").style.display = '';
                document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonthsOnDetails").style.display = 'none';
                    document.getElementById("inYearsOnDetails").style.display = '';
                }
                else
                {
                    document.getElementById("inMonthsOnDetails").style.display = '';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType_1").style.display = 'none';
            document.getElementById("usefulLifeRadio_1").style.display = 'none';
            document.getElementById("depreciationPercentRadio_1").style.display = 'none';
            document.getElementById("declinePercentRadio_1").style.display = 'none';
            document.getElementById("depreciationPercentType_1").style.display = 'none';
            document.getElementById("declinePercentType_1").style.display = 'none';
            document.getElementById("usefulLifeType_1").style.display = 'none';
            document.getElementById("salvageValueType_1").style.display = 'none';
            document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
            document.getElementById("inMonthsOnDetails").style.display = 'none';
            document.getElementById("inYearsOnDetails").style.display = 'none';
        }
    }
    else
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType_1").style.display = '';
            document.getElementById("salvageValueType_1").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = '';
                document.getElementById("depreciationPercentRadio_1").style.display = '';
                document.getElementById("declinePercentRadio_1").style.display = 'none';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelected_1(depFormObject);
                document.getElementById("inMonthsOnDetails").style.display = '';
                document.getElementById("inYearsOnDetails").style.display = 'none';
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = '';
                document.getElementById("depreciationPercentRadio_1").style.display = 'none';
                document.getElementById("declinePercentRadio_1").style.display = '';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelected_1(depFormObject);
                document.getElementById("inMonthsOnDetails").style.display = '';
                document.getElementById("inYearsOnDetails").style.display = 'none';
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio_1").style.display = 'none';
                document.getElementById("depreciationPercentRadio_1").style.display = 'none';
                document.getElementById("declinePercentRadio_1").style.display = 'none';
                document.getElementById("depreciationPercentType_1").style.display = 'none';
                document.getElementById("declinePercentType_1").style.display = 'none';
                document.getElementById("usefulLifeType_1").style.display = '';
                document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonthsOnDetails").style.display = 'none';
                    document.getElementById("inYearsOnDetails").style.display = '';
                }
                else
                {
                    document.getElementById("inMonthsOnDetails").style.display = '';
                    document.getElementById("inYearsOnDetails").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType_1").style.display = 'none';
            document.getElementById("usefulLifeRadio_1").style.display = 'none';
            document.getElementById("depreciationPercentRadio_1").style.display = 'none';
            document.getElementById("declinePercentRadio_1").style.display = 'none';
            document.getElementById("depreciationPercentType_1").style.display = 'none';
            document.getElementById("declinePercentType_1").style.display = 'none';
            document.getElementById("usefulLifeType_1").style.display = 'none';
            document.getElementById("salvageValueType_1").style.display = 'none';
            document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
            document.getElementById("inMonthsOnDetails").style.display = 'none';
            document.getElementById("inYearsOnDetails").style.display = 'none';
        }
    }
}
function setResourceDepreciationInfo(depFormObject)
{
    depFormObject.depreciationTypeId.disabled = false;
    depFormObject.declinePercent.disabled = false;
    depFormObject.depreciationPercent.disabled = false;
    depFormObject.salvageValue.disabled = false;
    depFormObject.usefulLife.disabled = false;
    document.getElementsByName("depreciationTypeRadio")[0].disabled = false;
    document.getElementsByName("depreciationTypeRadio")[1].disabled = false;
    document.getElementsByName("depreciationTypeRadio")[2].disabled = false;
    depFormObject.depreciationTypeId.className=depFormObject.depreciationTypeId.className.replace('TFDisabled','form-control');
    depFormObject.declinePercent.className=depFormObject.declinePercent.className.replace('TFDisabled','form-control');
    depFormObject.depreciationPercent.className=depFormObject.depreciationPercent.className.replace('TFDisabled','form-control');
    depFormObject.salvageValue.className=depFormObject.salvageValue.className.replace('TFDisabled','form-control');
    depFormObject.usefulLife.className=depFormObject.usefulLife.className.replace('TFDisabled','form-control');
    var formName = depFormObject.name;
    var element;
    if(formName == "AssetDefForm" || formName == "AddWSForm")
    {
        if(formName == "AssetDefForm")
        {
            element = document.getElementsByName("assetID");
        }
        else
        {
            element = document.getElementsByName('assetID');
        }
        document.getElementById("configureProductDepInfoAtAssetPage").style.display = 'none';
        depFormObject.depreciationTypeId.value = "";
        document.getElementById("depreciationTypeRadioButton").style.display = 'none';
        document.getElementById("depreciationType").style.display = 'none';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("depreciationPercentType_11").style.display = 'none';
        document.getElementById("depreciationPercentType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
        document.getElementById("salvageValueType_11").style.display = 'none';
        document.getElementById("salvageValueType_22").style.display = 'none';
    }
    else
    {
        element= document.getElementsByName("depCiId");
        document.getElementById('depreciationFieldsRow').style.display ='';
        document.getElementById('configureProductDepInfo').style.display ='none';
        document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
        document.getElementById("depreciationType_1").style.display = 'none';
        document.getElementById("usefulLifeType_1").style.display = 'none';
        document.getElementById("depreciationPercentType_1").style.display = 'none';
        document.getElementById("declinePercentType_1").style.display = 'none';
        document.getElementById("salvageValueType_1").style.display = 'none';
    }
    for(var i=0;i<element.length;i++)
    {
        if(element[i].value != null && element[i].value != 'null' && element[i].value != 0 && element[i].value != '')
        {
            var param = "action=fetchResourceDepreciation&ciId="+element[i].value;//NO I18N
            callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, configureResourceDepreciation, ajaxRequestOnFailure,depFormObject);//No I18N
        }
        else
        {
            depFormObject.depreciationTypeId.value = "";
            depFormObject.declinePercent.value = "";
            depFormObject.depreciationPercent.value = "";
            depFormObject.salvageValue.value = "";
            depFormObject.usefulLife.value = "";
            var depreciationTypeRadio = "UsefulLife";//No I18N
            if(formName == "AddDepreciation")
            {
                document.getElementById('depreciationFieldsRow').style.display ='';
                setDepreciationTypeMethod_1(depFormObject,depreciationTypeRadio);
            }
            else
            {
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='';
                setDepreciationTypeMethodForAsset(depFormObject,depreciationTypeRadio);
            }
        }
    }
}
function configureResourceDepreciation(form,depFormObject)
{
    var formName = depFormObject.name;
    var result = form.responseXML;
    //alert(form.responseText);
    try
    {
        depFormObject.depreciationTypeId.value = "";
        depFormObject.declinePercent.value = "";
        depFormObject.depreciationPercent.value = "";
        depFormObject.salvageValue.value = "";
        depFormObject.usefulLife.value = "";
        var depreciationTypeId = "";
        var salvageValue = "";
        var declinePercent = "";
        var depreciationPercent = "";
        var usefulLife = "";

        if( result != null && result.getElementsByTagName("DepreciationType") != null && result.getElementsByTagName("DepreciationType") != undefined && result.getElementsByTagName("DepreciationType").length >0)
        {
            if(result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid") != null)
            {
                depFormObject.depreciationTypeId.value = result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid");
                depreciationTypeId = result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid");
                var depreciationType = depFormObject.depreciationTypeId.options[depFormObject.depreciationTypeId.selectedIndex].innerHTML;
                if( depreciationType != undefined && depreciationType.length>0)
                {
                    if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("salvagevalue") != null)
                    {
                        salvageValue =  result.getElementsByTagName("DepreciationDetails")[0].getAttribute("salvagevalue");
                    }
                    var depreciationTypeRadio = "UsefulLife";//No I18N
                    if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("usefullife") !=null)
                    {
                        usefulLife = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("usefullife");
                    }
                    if( depreciationType == "Declining Balance")
                    {
                        if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent") != null)
                        {
                            declinePercent = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent");
                            depreciationTypeRadio = "DeclinePercent";//No I18N
                        }
                    }
                    else if(depreciationType == "Straight Line")
                    {
                        if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent") != null)
                        {
                            depreciationPercent = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent");
                            depreciationTypeRadio = "DepreciationPercent";//No I18N
                        }
                    }
                }
            }
            depFormObject.depreciationTypeId.value = depreciationTypeId;
            if(declinePercent != '')
            {
                declinePercent = parseFloat(declinePercent).toFixed(2);
            }
            depFormObject.declinePercent.value = declinePercent;
            if(depreciationPercent != '')
            {
                depreciationPercent = parseFloat(depreciationPercent).toFixed(2);
            }
            depFormObject.depreciationPercent.value = depreciationPercent;
            depFormObject.salvageValue.value = salvageValue;
            depFormObject.usefulLife.value = usefulLife;

            if(formName == "AddDepreciation")
            {
                document.getElementById('depreciationFieldsRow').style.display ='';
                setDepreciationTypeMethod_1(depFormObject,depreciationTypeRadio);
            }
            else
            {
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='';
                setDepreciationTypeMethodForAsset(depFormObject,depreciationTypeRadio);
            }

        }
        else
        {
            depFormObject.depreciationTypeId.value = "";
            depFormObject.declinePercent.value = "";
            depFormObject.depreciationPercent.value = "";
            depFormObject.salvageValue.value = "";
            depFormObject.usefulLife.value = "";

            if(formName == "AddDepreciation")
            {
                document.getElementById('depreciationFieldsRow').style.display ='';
                setDepreciationTypeMethod_1(depFormObject,depreciationTypeRadio);
            }
            else
            {
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='';
                setDepreciationTypeMethodForAsset(depFormObject,depreciationTypeRadio);
            }
        }
    }
    catch(e)
    {
        alert("Error in configureResourceDepreciation : " + e.message);//No I18N
    }
}
function setProductDepreciationInfo(depFormObject)
{

    var element;
    var isFrom;
    var formName = depFormObject.name;
    if(formName == "AssetDefForm" || formName == "AddWSForm")
    {
        document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='none';
        isFrom = "addNewAssetPage"//NO I18N
        if(formName == "AssetDefForm")
        {
            element = depFormObject.componentID.value;
        }
        else if(formName == "AddWSForm")
        {

            if( document.getElementById('SystemInfo_MODEL') != undefined )
            {
                element = document.getElementById('SystemInfo_MODEL').value;
            }
            else
            {
                if( depFormObject.wsModel.value != 0 && depFormObject.wsModel.value != null )
                {
                    element = depFormObject.wsModel.value;
                }
            }

        }
        document.getElementById("depreciationTypeRadioButton").style.display = 'none';
        document.getElementById("depreciationType").style.display = 'none';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("depreciationPercentType_11").style.display = 'none';
        document.getElementById("depreciationPercentType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
        document.getElementById("salvageValueType_11").style.display = 'none';
        document.getElementById("salvageValueType_22").style.display = 'none';

        if(element != "null" && element != 0 && element != null)
        {
            document.getElementById('configureDepreciationRadio').style.display ='';
            depFormObject.configureDepreciation[0].checked= true;
            var param = "action=fetchProductDepreciation&ciId="+element+"&isFrom="+isFrom;//NO I18N
            callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, configureProductDepreciation, ajaxRequestOnFailure,depFormObject);//No I18N
        }
        else
        {
            document.getElementById('enableDepreciation').checked= false;
            if(formName == "AddWSForm")
            {
                alert(getMessageForKey('sdp.depreciation.model.ifNotSelected'));
            }
            else if(formName == "AssetDefForm")
            {
                alert(getMessageForKey('sdp.depreciation.product.ifNotSelected'));
            }
        }
    }
    else
    {
        document.getElementById('depreciationFieldsRow').style.display ='none';
        isFrom = "detailsPage"//NO I18N
        element= document.getElementsByName("depCiId");
        document.getElementById('depreciationFieldsRow').style.display ='';
        document.getElementById('configureProductDepInfo').style.display ='none';
        document.getElementById("depreciationTypeRadioButton_1").style.display = 'none';
        document.getElementById("depreciationType_1").style.display = 'none';
        document.getElementById("usefulLifeType_1").style.display = 'none';
        document.getElementById("depreciationPercentType_1").style.display = 'none';
        document.getElementById("declinePercentType_1").style.display = 'none';
        document.getElementById("salvageValueType_1").style.display = 'none';
        for(var i=0;i<element.length;i++)
        {
            if(element[i].value != null && element[i].value != 'null')
            {
                var param = "action=fetchProductDepreciation&ciId="+element[i].value+"&isFrom="+isFrom;//NO I18N
                callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, configureProductDepreciation, ajaxRequestOnFailure,depFormObject);//No I18N
            }
        }
    }
}


function configureProductDepreciation(form,depFormObject)
{
    var formName = depFormObject.name;
    var result = form.responseXML;
    //alert(form.responseText);
    try
    {
        depFormObject.depreciationTypeId.value = "";
        depFormObject.declinePercent.value = "";
        depFormObject.depreciationPercent.value = "";
        depFormObject.salvageValue.value = "";
        depFormObject.usefulLife.value = "";
        var depreciationTypeId = "";
        var salvageValue = "";
        var declinePercent = "";
        var depreciationPercent = "";
        var usefulLife = "";


        if( result != null && result.getElementsByTagName("DepreciationType") != null && result.getElementsByTagName("DepreciationType") != undefined && result.getElementsByTagName("DepreciationType").length > 0)
        {
            if(result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid") != null)
            {
                depFormObject.depreciationTypeId.value = result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid");
                depreciationTypeId = result.getElementsByTagName("DepreciationType")[0].getAttribute("depreciationtypeid");
                var depreciationType = depFormObject.depreciationTypeId.options[depFormObject.depreciationTypeId.selectedIndex].innerHTML;
                if( depreciationType != undefined && depreciationType.length>0)
                {
                    if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("salvagevalue") != null)
                    {
                        salvageValue =  result.getElementsByTagName("DepreciationDetails")[0].getAttribute("salvagevalue");
                    }
                    var depreciationTypeRadio = "UsefulLife";//No I18N
                    if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("usefullife") != null)
                    {
                        usefulLife = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("usefullife");
                    }
                    if( depreciationType == "Declining Balance")
                    {
                        if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent") != null)
                        {
                            declinePercent = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent");                                 depreciationTypeRadio = "DeclinePercent";//No I18N
                        }
                    }
                    else if(depreciationType == "Straight Line")
                    {
                        if(result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent") != null)
                        {
                            depreciationPercent = result.getElementsByTagName("DepreciationDetails")[0].getAttribute("depreciationpercent");
                            depreciationTypeRadio = "DepreciationPercent";//No I18N
                        }
                    }
                }
            }

            depFormObject.depreciationTypeId.value = depreciationTypeId;
            if(declinePercent != '')
            {
                declinePercent = parseFloat(declinePercent).toFixed(2);
            }
            depFormObject.declinePercent.value = declinePercent;
            if(depreciationPercent != '')
            {
                depreciationPercent = parseFloat(depreciationPercent).toFixed(2);
            }
            depFormObject.depreciationPercent.value = depreciationPercent;
        depFormObject.salvageValue.value = salvageValue;
            depFormObject.usefulLife.value = usefulLife;

            if(formName == "AddDepreciation")
            {
                document.getElementById('configureProductDepInfo').style.display ='none';
                document.getElementById('depreciationFieldsRow').style.display ='';
                setDepreciationTypeMethod_1(depFormObject,depreciationTypeRadio);
            }
            else
            {
                document.getElementById('configureProductDepInfoAtAssetPage').style.display ='none';
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='';
                setDepreciationTypeMethodForAsset(depFormObject,depreciationTypeRadio);
            }
            depFormObject.depreciationTypeId.className=depFormObject.depreciationTypeId.className.replace('form-control','TFDisabled');
            depFormObject.declinePercent.className=depFormObject.declinePercent.className.replace('form-control','TFDisabled');
            depFormObject.depreciationPercent.className=depFormObject.depreciationPercent.className.replace('form-control','TFDisabled');
            depFormObject.salvageValue.className=depFormObject.salvageValue.className.replace('form-control','TFDisabled');
            depFormObject.usefulLife.className=depFormObject.usefulLife.className.replace('form-control','TFDisabled');
            depFormObject.depreciationTypeId.disabled = true;
            depFormObject.declinePercent.disabled = true;
            depFormObject.depreciationPercent.disabled = true;
            depFormObject.salvageValue.disabled = true;
            depFormObject.usefulLife.disabled = true;
            document.getElementsByName("depreciationTypeRadio")[0].disabled = true;
            document.getElementsByName("depreciationTypeRadio")[1].disabled = true;
            document.getElementsByName("depreciationTypeRadio")[2].disabled = true;
        }
        else
        {
            if(formName == "AddDepreciation")
            {
                depFormObject.isProductInfoAdded.value = "true";
                document.getElementById('configureProductDepInfo').style.display ='';
                document.getElementById('depreciationFieldsRow').style.display ='none';
            }
            else
            {
                depFormObject.isProductInfoChanged.value = "true";
                document.getElementById('configureProductDepInfoAtAssetPage').style.display ='';
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='none';
            }
        }
    }
    catch(e)
    {
        alert("Error in configureProductDepreciation : " + e.message);//No I18N
    }
}

function validateAddDepreciationForm(isFrom,newAssetPage)
{
    var cost;
    var acquisitionDate;

    if(isFrom == "WSRightPanel" )
    {
        if( trim(document.AddDepreciation.cost.value) == '' )
        {
            alert(getMessageForKey('sdp.admin.product.cost'));
            document.AddDepreciation.cost.focus();
            return false;
        }
        else
        {
            cost = document.AddDepreciation.cost.value;
        }
        if(!checknumber(document.AddDepreciation.cost))
        {
            document.AddDepreciation.cost.focus();
            return false;
        }
        else
        {
            acquisitionDate = document.AddDepreciation.acquisitionDate.value;
        }
        if( trim(document.AddDepreciation.acquisitionDate.value) == '' )
        {
            alert(getMessageForKey('sdp.admin.product.acquisitionDate'));
            document.AddDepreciation.acquisitionDate.focus();
            return false;
        }
        if(!document.AddDepreciation.configureDepreciation[0].checked && !document.AddDepreciation.configureDepreciation[1].checked )
        {
            alert(document.getElementById('sdp.asset.depreciationDetailsPopUp.configureDepreciation').innerHTML);
            return false;
        }
        var purchaseCostOfAsset = document.AddDepreciation.cost.value;
        var salvageValueOfAsset = document.AddDepreciation.salvageValue.value;
        if(parseInt(purchaseCostOfAsset) != 0 && parseInt(purchaseCostOfAsset)<=parseInt(salvageValueOfAsset))
        {
            alert(getMessageForKey("sdp.assetAddForm.compare.salvageAndcost"));
            return false;
        }

    }
    if(trim(document.AddDepreciation.depreciationTypeId.value) == '')
    {
        alert(document.getElementById('sdp.admin.depreciation.depreciationTypeId').innerHTML);
        return false;
    }
    if(!validateDepreciationAttribute(document.AddDepreciation))
    {
        return false;
    }

    var isProductInfoAdded = document.AddDepreciation.isProductInfoAdded.value;
    var modifyProductDepreciation = false;
    if(isProductInfoAdded== "true" && isFrom == "WSRightPanel" && !document.AddDepreciation.configureDepreciation[1].checked)
    {
        modifyProductDepreciation = confirm(getMessageForKey("sdp.asset.depreciationDetailsPopUp.forProductLevelConfirmation"));//NO I18N
        if (!modifyProductDepreciation)
        {
            return false;
        }
    }
    if(isFrom != null && isFrom == "productlistview" && (newAssetPage != "AssetDefForm" || newAssetPage != "AddWSForm"))
    {
        modifyProductDepreciation = confirm(getMessageForKey("sdp.asset.depreciationProductListViewPopUp.forProductLevelConfirmation"));//NO I18N
        if (!modifyProductDepreciation)
        {
            return false;
        }
    }
    if(isFrom != null && isFrom == "AssetListView" && (newAssetPage != "AssetDefForm" || newAssetPage != "AddWSForm"))
    {
        modifyProductDepreciation = confirm(getMessageForKey("sdp.assetListViews.depreciationConfiguration.cofirmationMessage"));//NO I18N
        if (!modifyProductDepreciation)
        {
            return false;
        }
    }
    if((newAssetPage == "AssetDefForm" || newAssetPage == "AddWSForm") && isFrom != "productlistview" && isFrom != "AssetListView")
    {
        modifyProductDepreciation = confirm(getMessageForKey("sdp.asset.depreciationAddNewAssetPopUp.forProductLevelConfirmation"));//NO I18N
        if (!modifyProductDepreciation)
        {
            return false;
        }
    }

    var depreciationTypeId=document.AddDepreciation.depreciationTypeId.value;
    var element= document.getElementsByName("depCiId");

    var param = "mode=save&isFrom="+isFrom+"&save=true&newAssetPage="+newAssetPage+"&cost="+cost+"&acquisitionDate="+acquisitionDate+"&isProductInfoAdded="+isProductInfoAdded+constructParameters(document.AddDepreciation);//No I18N
    for(var i=0;i<element.length;i++)
    {
        param+="&depCiId="+element[i].value;
        callLoadingIcon('addDepreciationLoading', document.getElementById('sdp.depreciation.progress.indicator').innerHTML);//No I18N
        callCustomAjaxRequest('/AddDepreciation.do',param, configureDepreciationPopUpSuccess, configureDepreciationPopUpFailure,'AddDepreciation');//No I18N
    }
}

function configureDepreciationPopUpSuccess(requestObj, module)
{
    if(module == 'AddDepreciation')
    {
        var statusCode = requestObj.responseXML.getElementsByTagName("status")[0].childNodes[0].nodeValue;
        if(statusCode == '200')
        {
            var closeDepreciationWindow;
            if(requestObj.responseXML.getElementsByTagName("closeDepreciationWindow").length != "0")
            {
                closeDepreciationWindow = requestObj.responseXML.getElementsByTagName("closeDepreciationWindow")[0].childNodes[0].nodeValue;
            }
            if(closeDepreciationWindow != undefined && closeDepreciationWindow == 'newAssetPage')
            {
                document.getElementById('depreciationTypeId_AddNew').value=document.AddDepreciation.depreciationTypeId.value;
                document.getElementById('declinePercent_AddNew').value = document.AddDepreciation.declinePercent.value;
                document.getElementById('depreciationPercent_AddNew').value =document.AddDepreciation.depreciationPercent.value;
                document.getElementById('salvageValue_AddNew').value = document.AddDepreciation.salvageValue.value;
                document.getElementById('usefulLife_AddNew').value = document.AddDepreciation.usefulLife.value;
                document.getElementById('configureProductDepInfoAtAssetPage').style.display ='none';
                document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='';
                var depreciationTypeRadioForAsset = "UsefulLife";//NO I18N
                var depreciationPercent = document.getElementById('depreciationPercent_AddNew').value;
                var declinePercent = document.getElementById('declinePercent_AddNew').value;
                if(depreciationPercent != undefined && depreciationPercent != "")
                {
                    depreciationTypeRadioForAsset = "DepreciationPercent";//NO I18N
                }
                else if(declinePercent != undefined && declinePercent != "")
                {
                    depreciationTypeRadioForAsset = "DeclinePercent";//NO I18N
                }
                setDepreciationTypeMethodForAsset(document.getElementById('addNewAsset'),depreciationTypeRadioForAsset);
                closeDialog();
            }
            else if(closeDepreciationWindow != undefined && closeDepreciationWindow == 'assetDetailsPage')
            {

                closeDialog();
                displayLoadingInformation('/images/discoverystatus_discovered.gif','Added Successfully!!!', true,2000);//No I18N
                var wsId = document.ViewWSDetails.wsId.value;
                setTimeout(function(){reloadAssetPage(this.window,wsId);}, 2000);
            }
            else
            {
                closeDialog();
                displayLoadingInformation('/images/discoverystatus_discovered.gif','Added Successfully!!!', true,2000);//No I18N
            }
        }
        else
        {
            var Message = requestObj.responseXML.getElementsByTagName("message")[0].childNodes[0].nodeValue;
            confirm(Message);
        }
    }
}

function configureDepreciationPopUpFailure ( requestObj )
{
    alert("configureDepreciationPopUpFailure Method of AddDepreciation: "+requestObj.responseText);//No I18N
}

function uncheckConfigureProductDepRadio(addNewAssetPage)
{
    if(addNewAssetPage == 'AssetDefForm' || addNewAssetPage == 'AddWSForm')
    {
        document.getElementById('productLevel').checked= false;
        document.getElementById('configureProductDepInfoAtAssetPage').style.display ='none';
        document.getElementById('depreciationFieldsRowAtAssetPage').style.display ='none';
        document.getElementById("depreciationTypeRadioButton").style.display = 'none';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
    }
}
function closeDepDialog(addNewAssetPage)
{
    uncheckConfigureProductDepRadio(addNewAssetPage);
    closeDialog();
}

//AddDepreciation Dereciation scripts End

//AddNewAsset Depreciation scripts Start
function depreciationTypeRadioSelectedForAsset(depFormObject)
{
    if( isUsefulLifeSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType_11").style.display = '';
        document.getElementById("usefulLifeType_22").style.display = '';
        document.getElementById("depreciationPercentType_11").style.display = 'none';
        document.getElementById("depreciationPercentType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
    }
    else if( isDepreciationPercentSelected(depFormObject) )
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("depreciationPercentType_11").style.display = '';
        document.getElementById("depreciationPercentType_22").style.display = '';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
    }
    else if(isDeclinePercentSelected(depFormObject))
    {
        document.getElementById("depreciationTypeRadioButton").style.display = '';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("depreciationPercentType_11").style.display = 'none';
        document.getElementById("depreciationPercentType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = '';
        document.getElementById("declinePercentType_22").style.display = '';
    }
}

function setDepreciationTypeMethodForAsset(depFormObject,depreciationTypeRadio)
{
    if(depreciationTypeRadio != undefined && depreciationTypeRadio)
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType").style.display = '';
            document.getElementById("salvageValueType_11").style.display = '';
            document.getElementById("salvageValueType_22").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = '';
                document.getElementById("declinePercentRadio").style.display = 'none';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelectedForAsset(depFormObject);
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DepreciationPercent")
                {
                    depFormObject.depreciationTypeRadio[1].checked = true;
                    depreciationTypeRadioSelectedForAsset(depFormObject);
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = '';
                if(depreciationTypeRadio == "UsefulLife")
                {
                    depFormObject.depreciationTypeRadio[0].checked = true;
                    depreciationTypeRadioSelectedForAsset(depFormObject);
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
                else if(depreciationTypeRadio == "DeclinePercent")
                {
                    depFormObject.depreciationTypeRadio[2].checked = true;
                    depreciationTypeRadioSelectedForAsset(depFormObject);
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = 'none';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = 'none';
                document.getElementById("depreciationPercentType_11").style.display = 'none';
                document.getElementById("depreciationPercentType_22").style.display = 'none';
                document.getElementById("declinePercentType_11").style.display = 'none';
                document.getElementById("declinePercentType_22").style.display = 'none';
                document.getElementById("usefulLifeType_11").style.display = '';
                document.getElementById("usefulLifeType_22").style.display = '';
                document.getElementById("depreciationTypeRadioButton").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = '';
                }
                else
                {
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType").style.display = 'none';
            document.getElementById("usefulLifeRadio").style.display = 'none';
            document.getElementById("depreciationPercentRadio").style.display = 'none';
            document.getElementById("declinePercentRadio").style.display = 'none';
            document.getElementById("depreciationPercentType_11").style.display = 'none';
            document.getElementById("depreciationPercentType_22").style.display = 'none';
            document.getElementById("declinePercentType_11").style.display = 'none';
            document.getElementById("declinePercentType_22").style.display = 'none';
            document.getElementById("usefulLifeType_11").style.display = 'none';
            document.getElementById("usefulLifeType_22").style.display = 'none';
            document.getElementById("salvageValueType_11").style.display = '';
            document.getElementById("salvageValueType_22").style.display = '';
            document.getElementById("depreciationTypeRadioButton").style.display = 'none';
            document.getElementById("inMonths").style.display = 'none';
            document.getElementById("inYears").style.display = 'none';

        }
    }
    else
    {
        if(isDepreciationTypeSelected(depFormObject))
        {
            document.getElementById("depreciationType").style.display = '';
            document.getElementById("salvageValueType_11").style.display = '';
            document.getElementById("salvageValueType_22").style.display = '';
            if(isStraightLineSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = '';
                document.getElementById("declinePercentRadio").style.display = 'none';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelectedForAsset(depFormObject);
                document.getElementById("inMonths").style.display = '';
                document.getElementById("inYears").style.display = 'none';
            }
            else if(isDeclineBalanceSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = '';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = '';
                depFormObject.depreciationTypeRadio[0].checked = true;
                depreciationTypeRadioSelectedForAsset(depFormObject);
                document.getElementById("inMonths").style.display = '';
                document.getElementById("inYears").style.display = 'none';
            }
            else if(isDoubleDeclineBalanceSelected(depFormObject) || isSumOfTheYearsDigitSelected(depFormObject))
            {
                document.getElementById("usefulLifeRadio").style.display = 'none';
                document.getElementById("depreciationPercentRadio").style.display = 'none';
                document.getElementById("declinePercentRadio").style.display = 'none';
                document.getElementById("depreciationPercentType_11").style.display = 'none';
                document.getElementById("depreciationPercentType_22").style.display = 'none';
                document.getElementById("declinePercentType_11").style.display = 'none';
                document.getElementById("declinePercentType_22").style.display = 'none';
                document.getElementById("usefulLifeType_11").style.display = '';
                document.getElementById("usefulLifeType_22").style.display = '';
                document.getElementById("depreciationTypeRadioButton").style.display = 'none';
                if(isSumOfTheYearsDigitSelected(depFormObject))
                {
                    document.getElementById("inMonths").style.display = 'none';
                    document.getElementById("inYears").style.display = '';
                }
                else
                {
                    document.getElementById("inMonths").style.display = '';
                    document.getElementById("inYears").style.display = 'none';
                }
            }
        }
        else
        {
            document.getElementById("depreciationType").style.display = 'none';
            document.getElementById("usefulLifeRadio").style.display = 'none';
            document.getElementById("depreciationPercentRadio").style.display = 'none';
            document.getElementById("declinePercentRadio").style.display = 'none';
            document.getElementById("depreciationPercentType_11").style.display = 'none';
            document.getElementById("depreciationPercentType_22").style.display = 'none';
            document.getElementById("declinePercentType_11").style.display = 'none';
            document.getElementById("declinePercentType_22").style.display = 'none';
            document.getElementById("usefulLifeType_11").style.display = 'none';
            document.getElementById("usefulLifeType_22").style.display = 'none';
            document.getElementById("salvageValueType_11").style.display = 'none';
            document.getElementById("salvageValueType_22").style.display = 'none';
            document.getElementById("depreciationTypeRadioButton").style.display = 'none';
            document.getElementById("inMonths").style.display = 'none';
            document.getElementById("inYears").style.display = 'none';
        }
    }
}
var isLevel = new Object();
function ShowHideDepreciationConf(checkEle,depFormObject)
{
    if(checkEle.checked == true)
    {
        if(isLevel != undefined && isLevel == "assetLevel")
        {
            document.getElementById('configureDepreciationRadio').style.display ='';
            depFormObject.configureDepreciation[1].checked= true;
            setResourceDepreciationInfo(depFormObject);
        }
        else
        {
            setProductDepreciationInfo(depFormObject);
        }
    }
    else
    {
        document.getElementById('configureDepreciationRadio').style.display ='none';
        document.getElementById("depreciationTypeRadioButton").style.display = 'none';
        depFormObject.configureDepreciation[0].checked=false;
        depFormObject.configureDepreciation[1].checked=false;
        depFormObject.depreciationTypeRadio[0].checked=false;
        depFormObject.depreciationTypeRadio[1].checked=false;
        depFormObject.depreciationTypeRadio[2].checked=false;
        document.getElementById("depreciationFieldsRowAtAssetPage").style.display = 'none';
        document.getElementById("configureProductDepInfoAtAssetPage").style.display = 'none';
        document.getElementById("usefulLifeType_11").style.display = 'none';
        document.getElementById("usefulLifeType_22").style.display = 'none';
        document.getElementById("depreciationPercentType_11").style.display = 'none';
        document.getElementById("depreciationPercentType_22").style.display = 'none';
        document.getElementById("declinePercentType_11").style.display = 'none';
        document.getElementById("declinePercentType_22").style.display = 'none';
        document.getElementById("salvageValueType_11").style.display = 'none';
        document.getElementById("salvageValueType_22").style.display = 'none';
    }
}

function submitForm(wsModel,depFormObject,componentName)
{
    if(wsModel == "null" || wsModel == 0)
    {
        var optGrps;
        if(depFormObject.name == "AddWSForm")
        {
            depFormObject.vendor.length=1;
            optGrps = depFormObject.vendor.getElementsByTagName("optgroup");
        }
        else
        {
            depFormObject.vendorID.length=1;
            optGrps = depFormObject.vendorID.getElementsByTagName("optgroup");
        }

        for (var i = 0; i < optGrps.length; i++)
        {
            optGrps[0].parentNode.removeChild(optGrps[0]);
            i--;
        }
    }
    if(wsModel != undefined && wsModel != null && wsModel != 0)
    {
        var componentId = wsModel;
        var param = "action=fetchVendorDetails&componentId="+componentId;//NO I18N
        callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, componentVendorForm, ajaxRequestOnFailure,depFormObject);//No I18N
    }
    else
    {
        var param = "action=fetchDepreciation&componentName="+componentName;//NO I18N
        callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, depreciationForm, ajaxRequestOnFailure,depFormObject);//No I18N
    }
    if(document.getElementById('enableDepreciation')!=null && document.getElementById('enableDepreciation')!=undefined && document.getElementById('enableDepreciation').checked && !depFormObject.configureDepreciation[1].checked)
    {
        setEditDepreciationSetting(wsModel,depFormObject,componentName);
    }

}
function setEditDepreciationSetting(wsModel,depFormObject,componentName)
{
    if(((wsModel != undefined && wsModel != 0 && wsModel != "" && wsModel != "null") || (componentName != undefined && componentName != null  && componentName != 0 && componentName != "" && componentName != "null")))
    {
        depFormObject.configureDepreciation[0].checked = true;
        setProductDepreciationInfo(depFormObject);
    }
    else
    {
        closeAllDepreciationDiv(depFormObject);
    }
}
function closeAllDepreciationDiv(depFormObject)
{
    document.getElementById('enableDepreciation').checked = false;
    document.getElementById('configureProductDepInfoAtAssetPage').style.display ='none';
    document.getElementById('configureDepreciationRadio').style.display ='none';
    document.getElementById("depreciationTypeRadioButton").style.display = 'none';
    depFormObject.configureDepreciation[0].checked=false;
    depFormObject.configureDepreciation[1].checked=false;
    depFormObject.depreciationTypeRadio[0].checked=false;
    depFormObject.depreciationTypeRadio[1].checked=false;
    depFormObject.depreciationTypeRadio[2].checked=false;
    document.getElementById("depreciationFieldsRowAtAssetPage").style.display = 'none';
    document.getElementById("usefulLifeType_11").style.display = 'none';
    document.getElementById("usefulLifeType_22").style.display = 'none';
    document.getElementById("depreciationPercentType_11").style.display = 'none';
    document.getElementById("depreciationPercentType_22").style.display = 'none';
    document.getElementById("declinePercentType_11").style.display = 'none';
    document.getElementById("declinePercentType_22").style.display = 'none';
    document.getElementById("salvageValueType_11").style.display = 'none';
    document.getElementById("salvageValueType_22").style.display = 'none';
}

function depreciationForm(form,depFormObject)
{
    var result = form.responseXML;
    //alert(form.responseText);
    if(result.getElementsByTagName("ComponentDefinition").length != "0")
        var componentId = result.getElementsByTagName("ComponentDefinition")[0].getAttribute("componentid");
    if(componentId != undefined)
    {
        var param = "action=fetchVendorDetails&componentId="+componentId;//NO I18N
        callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, componentVendorForm, ajaxRequestOnFailure,depFormObject);//No I18N
    }

}

var vendorCost = new Object();
function componentVendorForm(form,depFormObject)
{
    vendorCost={};
    depFormObject.assetPrice.value="";
    associatedVendorCost = new Object();
    var result = form.responseXML;
    //alert(form.responseText);
    var vendorDetailsLength = result.getElementsByTagName("vendordetails").length;//No I18N
    var associatedLength = result.getElementsByTagName("associated").length;//No I18N
    var notAssociatedLength = result.getElementsByTagName("notassociated").length;//No I18N
    var optGrps;
    if(depFormObject.name == "AddWSForm")
    {
        depFormObject.vendor.length=1;
        optGrps = depFormObject.vendor.getElementsByTagName("optgroup");
    }
    else
    {
        depFormObject.vendorID.length=1;
        optGrps = depFormObject.vendorID.getElementsByTagName("optgroup");
    }

    for (var i = 0; i < optGrps.length; i++)
    {
        optGrps[0].parentNode.removeChild(optGrps[0]);
        i--;
    }

    try
    {
        if(vendorDetailsLength > 0)
        {
            if(associatedLength > 0 )
            {
                var associated = document.createElement("optgroup");
                associated.label = getMessageForKey("sdp.asset.associatedVendorList");//No I18N

                for(var i=0; i<associatedLength; i++)
                {

                    var associatedVendor  = document.createElement("option");
                    associatedVendor.value =  result.getElementsByTagName("associated")[i].getAttribute("vendorId");
                    associatedVendor.appendChild(document.createTextNode(result.getElementsByTagName("associated")[i].childNodes[0].nodeValue));
                    associated.appendChild(associatedVendor);
                    var vendorId = result.getElementsByTagName("associated")[i].getAttribute("vendorId");
                    var vendorCostValue = result.getElementsByTagName("associated")[i].getAttribute("cost");
                    if(vendorCostValue) {
                        vendorCost[vendorId] = vendorCostValue;
                        associatedVendorCost[vendorId]= vendorCostValue;
                    }
                }
                if(depFormObject.name == "AddWSForm")
                {

                    depFormObject.vendor.appendChild(associated);
                }
                else
                {
                    depFormObject.vendorID.appendChild(associated);
                }
            }
            if(notAssociatedLength >0)
            {

                var notAssociated = document.createElement("optgroup");
                notAssociated.label = getMessageForKey("sdp.asset.notAssociatedVendorList");//No I18N
                for(var i=0; i<notAssociatedLength; i++)
                {

                    var notAssociatedVendor  = document.createElement("option");
                    notAssociatedVendor.value = result.getElementsByTagName("notassociated")[i].getAttribute("vendorId");
                    notAssociatedVendor.appendChild(document.createTextNode(result.getElementsByTagName("notassociated")[i].childNodes[0].nodeValue));
                    notAssociated.appendChild(notAssociatedVendor);
                    var vendorId = result.getElementsByTagName("notassociated")[i].getAttribute("vendorId");
                }
                if(depFormObject.name=="AddWSForm")
                {
                    depFormObject.vendor.appendChild(notAssociated);
                }
                else
                {
                    depFormObject.vendorID.appendChild(notAssociated);
                }
            }

        }
    }
    catch(e)
    {
        alert("Error in componentVendorForm" + e.message);//No I18N
    }
}

function setVendorCost(vId,depFormObject,associatedVendorCost)
{
    depFormObject.assetPrice.value="";
    var exchangeRateForAddAsset = 1;
    var param = "action=fetchVendorCurrency";//NO I18N
    param += "&vendorId="+vId;//NO I18N
    callSjaxRequest("/servlet/AJaxServlet", param);//NO I18N
    if(srequestOne.responseText != '')
    {

        var currencyJson = JSON.parse(srequestOne.responseText);
        if(currencyJson.currencyExchangeRate != undefined)
        {
            exchangeRateForAddAsset = currencyJson.currencyExchangeRate;
        }
    }
    if(vendorCost[vId]!=undefined)
    {
        var basePurchaseCost = vendorCost[vId]/exchangeRateForAddAsset;
        basePurchaseCost = basePurchaseCost.toFixed(2);
        var isCost = depFormObject.assetPrice.value;
        //if(isCost == undefined || isCost == "" || isCost =="-")
        //{
            depFormObject.assetPrice.value=basePurchaseCost;
        //}
        depFormObject.purchasecost.value = basePurchaseCost;
    }
    else if(associatedVendorCost != undefined && associatedVendorCost[vId]!=undefined)
    {
        var basePurchaseCost = associatedVendorCost[vId]/exchangeRateForAddAsset;
        basePurchaseCost = basePurchaseCost.toFixed(2);
        var isCost = depFormObject.assetPrice.value;
        if(isCost == undefined || isCost == "" || isCost =="-")
        {
            depFormObject.assetPrice.value=basePurchaseCost;
        }
        depFormObject.purchasecost.value = basePurchaseCost;
    }
}

function getConsumableProductType(componentTypeId)
{
    var param = "action=fetchComponentTypeDetails&componentTypeId="+componentTypeId;//NO I18N
    callCustomAjaxRequestForGET('/servlet/AJaxServlet',param, componentTypeDetails, ajaxRequestOnFailure);//No I18N
}
function componentTypeDetails(form)
{
    //var componentType = form.responseText;
    setWsType(form.responseText);
}
//AddNewAsset Depreciation scripts End
//**********************************************************DEPRECIATION SECTION END*******************************************************************

function ChangeAuthenticationMethod(privateKeyEleId,pwdEleId,pkAuthEleName,pwdEleName,pkEleName)
{
    if(document.getElementsByName(pkAuthEleName)[0].checked == true)
    {
        jQuery("#"+privateKeyEleId).show().removeClass('hide');
        jQuery("#"+pwdEleId).hide();
        document.getElementsByName(pwdEleName)[0].value="";
    }
    else
    {
        jQuery("#"+privateKeyEleId).hide();
        jQuery("#"+pwdEleId).removeAttr('style');
        document.getElementsByName(pkEleName)[0].value="";
    }
}

function showCommentBox(trId,tdId)
{
    if(document.getElementById(tdId) != undefined && document.getElementById(trId) != undefined)
    {
        var changeComment = document.getElementById("changeComment");
        if(changeComment)
        {
            changeComment.parentNode.removeChild(changeComment);
        }
        var textArea = document.createElement("textarea");
        textArea.setAttribute("name","changeComment");
        textArea.setAttribute("id","changeComment");
        textArea.setAttribute("class","form-control");
        textArea.setAttribute("style","width:225px");
        textArea.setAttribute("rows","2");
        document.getElementById(tdId).appendChild(textArea);
        document.getElementById(trId).style.display = '';
    }
}

// RDS Settings begins...
function deleteRDSMethod(rdsId)
{
    valid = confirm(getMessageForKey("ae.admin.rcsettings.deletealert")); // no i18n
    if(valid)
    {
        callCustomAjaxRequest("/RCSettings.do?isDelete=true&rdsId="+rdsId, "", deleteRdsSuccess,deleteRdsFailure);//NO I18N
    }
}
function deleteRdsSuccess(responseObj,actionName)
{
    responseObj = JSON.parse(responseObj.responseText);
    if( responseObj.STATUS == 'SUCCESS'){
        rdsIdDeleted = responseObj.RDSID;
        jQuery("#rdsMethod_"+rdsIdDeleted).addClass("hide");
        showMessageAndClose(getMessageForKey("ae.admin.rcsettings.deletesuccess"),2000);
    }else{
        failureMsg = responseObj.MESSAGE;
        showFailureMessageAndClose(failureMsg,5000);
    }
}
function deleteRdsFailure()
{
    showFailureMessageAndClose(getMessageForKey("ae.admin.rcsettings.deletefail"),5000);
}
function changeRdsStatus(obj,rdsId){
    callCustomAjaxRequest("/RCSettings.do?action=changeStatus&changeStatus="+obj.checked+"&rdsId="+rdsId, "", updateRdsStatus,updateRdsFailure);//NO I18N
}
function updateRdsStatus(responseObj,actionName)
{
    if(sdp_app.IS_DEMO_BUILD) {
        showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
        return false;
    }
    responseObj = JSON.parse(responseObj.responseText);
    if(responseObj.errorStr) {
        showalert('failure',ZSEC.Encoder.encodeForHTML(responseObj.errorStr),'isAutoHide=false,delay=3,width=400') //NO I18N
        return false;
    }
    if( responseObj.STATUS == 'FAILED'){
        failureMsg = responseObj.MESSAGE;
        showFailureMessageAndClose(failureMsg,5000);
    }else{
        isEnabled = responseObj.ISENABLED;
        if('true' == isEnabled){
            showMessageAndClose(getMessageForKey("ae.admin.rcsettings.enable"),2000);
        }else{
            showMessageAndClose(getMessageForKey("ae.admin.rcsettings.disable"),2000);
        }
    }
}
function updateRdsFailure()
{
    showFailureMessageAndClose(getMessageForKey("ae.admin.rcsettings.updatestatfail"),5000);
}
// RDS Settings ends...

function loadMoreAuditResults(startIndex,divToBeLoaded,wsIdStr)
{
    document.getElementById("loadMoreDataLoading_"+divToBeLoaded).style.display = 'block';
    document.getElementById("loadMoreDataLink_"+divToBeLoaded).style.display = 'none';
    callCustomAjaxRequestForGET("/ViewWSAuditDetails.do?mode=morehistory&startIndex="+startIndex+"&wsId="+wsIdStr+"&loadAuditDetails=true", "", auditDetailsRequestSuccess, ajaxRequestOnFailure, divToBeLoaded);//No I18N
}

function loadMoreCIHistory(a,b,c)
{
    document.getElementById("LodingMoreLink_"+c).style.display = 'none';
    document.getElementById("dataLoading_"+c).style.display = 'block';
    callCustomAjaxRequestForGET("/ViewCIHistoryDetails.do?lastOperationTime="+a+"&ciId="+b+"&isAjaxCall=yes","",ciHistoryRequestSuccess,ajaxRequestOnFailure,c);
}
function loadMoreRemoteHistory(startIndex,divToBeLoaded,wsIdStr)
{
    document.getElementById("remoteLoadMoreDataLoading_"+divToBeLoaded).style.display = 'block';
    document.getElementById("remoteLoadMoreDataLink_"+divToBeLoaded).style.display = 'none';
    callCustomAjaxRequestForGET("/ViewWSAuditDetails.do?mode=morehistory&remoteStartIndex="+startIndex+"&wsId="+wsIdStr+"&remoteLoadAuditDetails=true", "", remoteDetailsRequestSuccess, ajaxRequestOnFailure, divToBeLoaded);//No I18N
}
function ciHistoryRequestSuccess(a,b)
{
    document.getElementById("LodingMoreLink_"+b).style.display="none";
    document.getElementById("dataLoading_"+b).style.display = 'none';
    document.getElementById(b).innerHTML = a.responseText;
}

function auditDetailsRequestSuccess( req, divId )
{
    document.getElementById("loadMoreDataLink_"+divId).style.display = 'none';
    document.getElementById("loadMoreDataLoading_"+divId).style.display = 'none';
    document.getElementById(divId).innerHTML = req.responseText;
}
function remoteDetailsRequestSuccess( req, divId )
{
    document.getElementById("remoteLoadMoreDataLink_"+divId).style.display = 'none';
    document.getElementById("remoteLoadMoreDataLoading_"+divId).style.display = 'none';
    document.getElementById(divId).innerHTML = req.responseText;
}

function historyShowhideAsset(prefix,gName)
{
        var selRowObj = document.getElementById(prefix+ "HIST_" + gName);
        var text = document.getElementById(prefix + "HT_" + gName);
        if (selRowObj.className == 'hide')
        {
                selRowObj.className = 'show';
                text.innerHTML = "<span class='cspr circle-arrow-down icon-sm'></span>";
        }
        else if(selRowObj.className == 'show')
        {
                selRowObj.className = 'hide';
                text.innerHTML = "<span class='cspr circle-arrow-up icon-sm tf-rot90'></span>";
        }
        else if(selRowObj.className == '')
        {
                selRowObj.className = 'show';
                text.innerHTML = "<span class='cspr circle-arrow-down icon-sm'></span>";
        }
}

//Credentials Library begins
function addProtocolOptions(deviceTypeId){
    var params = "action=getProtocols";
    if(deviceTypeId != null && deviceTypeId != undefined){
        params = params+"&deviceTypeId="+deviceTypeId;
    }
    callCustomAjaxRequest("/CredentialsLibrary.do", params, addProtocolsInClient,ajaxRequestOnFailure);//NO I18N
}
function addProtocolsInClient(responseObj){
    var resXml = responseObj.responseXML;
    var nodeList = resXml.getElementsByTagName("ProtocolList")[0].childNodes;
    var childNodeCount = nodeList.length;
    var firstProtocol = nodeList[0].getAttribute("ProtocolName");
    for(i=0;i<childNodeCount;i++){
        var node = nodeList[i];
        var protocolId = node.getAttribute("ProtocolId");
        var protocol = node.getAttribute("ProtocolName");
        var htmlId = protocol;
        if(protocol.indexOf('/') >0){
            htmlId = protocol.substring(0,protocol.indexOf('/'));
        }
        jQuery("#selPtcol").append('<option id=\"'+e_html(htmlId)+'\" value=\"'+Number(protocolId)+'\">'+e_html(protocol)+'</option>');
    }
    if(firstProtocol.indexOf('/')>0){
        firstProtocol = firstProtocol.substring(0,firstProtocol.indexOf('/'));
    }
    var htmlId = firstProtocol.replace(/(\s)/gi,'');
    jQuery("#protoCol_"+htmlId).show();
    jQuery('.credTypeHelp').hide();
    jQuery("#"+htmlId+"Msg").show();
    hideHTTPProtocol()
}
function saveCredentialDetails(formObj,isPopUp,parentEleId){
    var elements_list = formObj.elements;
    var length = elements_list.length;
    var element_type;
    var params="action=saveCredential";
    if(isPopUp != null && isPopUp != undefined && isPopUp == true){
        params = params+"&popUp=true";
    }
    if(parentEleId != null && parentEleId != undefined && parentEleId != '' && parentEleId != 'null'){
        params = params+"&parentElementId="+parentEleId;
    }
    for( i=0; i<length; i++ ) {
        var paramName = elements_list[i].name;
        var paramValue = elements_list[i].value;
        if(paramValue != null && paramName=="sshPrivateKey" && (paramValue =  paramValue.trim()) != ""){
            var encryptionResult = encryptWithAES(paramValue);
            params = params + "&" + paramName + "=" + encodeURIComponent(encryptionResult.encryptedvalue);
            params = params + "&encryptedKey=" + encodeURIComponent(encryptionResult.key);
            params = params + "&encryptedIV=" + encodeURIComponent(encryptionResult.iv);
            continue;
        }
        if(paramName.toLowerCase().endsWith("password") || paramName.toLowerCase().endsWith("pwd") || paramName=="snmpRead"){
            if(paramValue!=null && paramValue!=""){
                paramValue = encryptDataWithRSA(paramValue);
            }
        }
        params = params+"&"+paramName+"="+encodeURIComponent(paramValue);
    }
    callCustomAjaxRequest("/CredentialsLibrary.do", params, updateCredentialSuccess,ajaxRequestOnFailure);    //NO I18N
}

function updateCredentialSuccess(responseObj){
    try{
    responseObj = JSON.parse(responseObj.responseText);
    if( responseObj.STATUS == 'SUCCESS'){
        if(responseObj.CLOSEPOPUP != undefined && responseObj.CLOSEPOPUP == 'TRUE'){
            populateAdditionInParentwindow(responseObj.PARENTELEMENTID,responseObj.CREDENTIALID,responseObj.CREDENTIALNAME);
        }else{
            document.CredentialsLibraryForm.reset();
            Hide('formview');
            Show('listview');
            refreshSubView(getPortalViewName('CredentialsLibraryListView'));
            if(responseObj.ACTION == 'UPDATE'){
                showMessageAndClose(getMessageForKey('ae.admin.credentiallibrary.updatesuccess'),2000);
            }else{
                showMessageAndClose(getMessageForKey('ae.admin.credentiallibrary.addedsuccess'),2000);
            }
        }

    }else{
        if(responseObj.MESSAGE != undefined){
            failureMsg = responseObj.MESSAGE;
        }else{
            failureMsg = getMessageForKey('ae.admin.credentiallibrary.updateerror');
        }
        Hide('formview');
        Show('listview');
        //refreshSubView('CredentialsLibraryListView');
        showFailureMessageAndClose(failureMsg,5000);
    }
}catch(error){

    parent.window.open('/jsp/AuthError.jsp?module=Error', '_self');   // captured the updation in try catch and loaded response for SD-66584. The above try block will throw error if response is not JSON, in which case we append the same to the page to display the error message
}
		/*
		if(isMSP ) {
			var accountElement = $("__persistentAccountId__select"); // no i18n
			accountElement.disabled = false;
		 	accountElement.className='accountFormStyle'; // no i18n
			//refreshCredentialsView();
	}
		*/
}

function deleteCredential(form)
{
        var valid = checkForDelete(form,"checkbox");//NO I18N
        if(valid)
        {
                valid = confirm(getMessageForKey('ae.admin.credentiallibrary.confirmdelete'));//NO I18N
                if(valid)
                {
                        var param = "action=deleteCredential";//NO I18N

                        var selectedObj = document.getElementsByName("checkbox");//NO I18N

                        for( i=0; i<selectedObj.length; i++ )
                        {
                                if( selectedObj[i].checked )
                                {
                                        param += "&credentialId=" + selectedObj[i].value;//NO I18N
                                }
                        }
                        displayLoadingInformation(null,'delete in progresss', false);//NO I18n
                        callCustomAjaxRequest("/CredentialsLibrary.do", param, deleteCredentialSuccess, ajaxRequestOnFailure);//NO I18N
                        return true;
                }
                else
                {
                        return false;
                }
        }
        else
        {
                alert(getMessageForKey('ae.admin.credentiallibrary.delete'));
        }
        return false;
}


function deleteCredentialSuccess(responseObj){
    responseObj = JSON.parse(responseObj.responseText);
    if( responseObj.STATUS == 'SUCCESS'){
        document.getElementById('loadingdivid').style.display = 'none';
        refreshSubView(getPortalViewName('CredentialsLibraryListView'));
        showMessageAndClose(getMessageForKey('ae.admin.credentiallibrary.deletesuccess'),2000);
    }else{
        document.getElementById('loadingdivid').style.display = 'none';
        failureMsg = responseObj.MESSAGE;
        showFailureMessageAndClose(failureMsg,5000);
    }

}
function editCredential(credId){
    displayLoadingInformation(null,'Going to edit...', false);//NO I18n
        callCustomAjaxRequest("/CredentialsLibrary.do", "action=editCredential&credentialId="+credId, editCredentialSuccess, ajaxRequestOnFailure);//NO I18N
}
function editCredentialSuccess(responseObj){
    responseObj = JSON.parse(responseObj.responseText);
    if( responseObj.STATUS == 'SUCCESS'){
        jQuery('#addEditTitle').html(getMessageForKey('sdp.admin.credentialslibrary.editcred'));
        jQuery('#selPtcol').prop('disabled',true);//NO I18N
        document.getElementById('loadingdivid').style.display = 'none';
        Hide('listview');
        Show('formview');
        jQuery('.colors').hide();
        if (responseObj.HTTP != undefined && responseObj.HTTP == true ){
            jQuery("#selPtcol").append('<option id="HTTP" value="'+responseObj.PROTOCOLID+'">HTTP</option>');
            //jQuery('#selPtcol option:selected' ).text('HTTP')
        }
        document.CredentialsLibraryForm.credentialId.value = responseObj.CREDENTIALID;
        document.CredentialsLibraryForm.protocolId.value = responseObj.PROTOCOLID;
        document.CredentialsLibraryForm.name.value = responseObj.NAME;
        document.CredentialsLibraryForm.description.value = responseObj.DESCRIPTION;
        var hasPwd = responseObj.HASPWD;
        if(responseObj.WINDOWS  != undefined && responseObj.WINDOWS == true){
            document.CredentialsLibraryForm.userName.value = responseObj.USERNAME;
            if(hasPwd == true){
                swapRows('resetPwd','pwdInput');
            }else{
                swapRows('pwdInput','resetPwd');
            }
            jQuery('#protoCol_Windows').show();
            // set wmi time out here

        }else if(responseObj.SSHTELNET  != undefined && responseObj.SSHTELNET == true){
            document.CredentialsLibraryForm.sshTelnetProtocol.value = responseObj.ISTELNET;
            document.CredentialsLibraryForm.sshTelnetUsername.value = responseObj.USERNAME;
            document.CredentialsLibraryForm.sshTelnetPort.value = responseObj.SSHTELNETPORT;
            document.CredentialsLibraryForm.sshTelnetTimeout.value = responseObj.SSHTELNETTIMEOUT;
            // set private key and time out
            var hasPK = responseObj.HASPK;
            if(hasPK == false){
                if(hasPwd == true){
                    jQuery('#sshPKInput').removeClass("show").addClass("hide"); //If password is given, Private key should not be shown while editing the credential. For handling the case, if credential with password created, then credential with PK created, now when editing the credential with password, PK field is shown.
                    swapRows('resetSshPwd','sshPwdInput');
                }else{
                    swapRows('sshPwdInput','resetSshPwd');
                }
            }else{
                jQuery('#sshPwdInput').removeClass("show").addClass("hide");
                jQuery('#resetSshPwd').removeClass("show").addClass("hide");
                jQuery('#sshPKInput').removeClass("show").addClass("hide");
                jQuery('#resetSshPK').removeClass("hide").addClass("show");
                document.getElementById('sshTelnetPassword').value='';
                document.getElementById('usePublicKeyAuth').checked = true;

            }
            var isSudoDisabled = responseObj.ISSUDODISABLED;
            if(isSudoDisabled == true){
                document.getElementById('isSudoDisabled').value = true;
                document.getElementById('isSudoDisabled').checked = true;
            }
            else{
                document.getElementById('isSudoDisabled').value=false;
                document.getElementById('isSudoDisabled').checked = false;
            }
            jQuery('#protoCol_Telnet').show();
        }else if(responseObj.SNMP  != undefined &&  responseObj.SNMP == true){
            document.CredentialsLibraryForm.snmpTimeOut.value = responseObj.SNMPTIMEOUT;
            document.CredentialsLibraryForm.snmpRetries.value = responseObj.SNMPRETRIES;
            document.CredentialsLibraryForm.snmpPort.value = responseObj.SNMPPORT;
            var hasSnmpRead = responseObj.HASSNMPREAD;
            if(hasSnmpRead == true){
                swapRows('resetSnmpRead','snmpReadInput');
            }else{
                swapRows('snmpReadInput','resetSnmpRead');
            }
            jQuery('#protoCol_SNMPV1').show();
        }else if(responseObj.SNMPV3  != undefined && responseObj.SNMPV3 == true){
            document.CredentialsLibraryForm.snmpV3Timeout.value = responseObj.SNMPV3TIMEOUT;
            document.CredentialsLibraryForm.snmpV3Retries.value = responseObj.SNMPV3RETRIES;
            document.CredentialsLibraryForm.snmpV3Port.value = responseObj.SNMPV3PORT;
            document.CredentialsLibraryForm.snmpV3UserName.value = responseObj.SNMPV3USERNAME;
            document.CredentialsLibraryForm.snmpV3ContextName.value = responseObj.SNMPV3CONTEXTNAME;
            document.CredentialsLibraryForm.snmpV3AuthProtocol.value = '' + responseObj.SNMPV3AUTHPROTOCOL;
            document.CredentialsLibraryForm.snmpV3EncryptProtocol.value = '' + responseObj.SNMPV3ENCRYPTPROTOCOL;
            var hasSnmpV3AuthPwd = responseObj.HASAUTHPWD;
            if(hasSnmpV3AuthPwd == true){
                swapRows('resetSnmpV3AuthPwd','mainSnmpV3AuthPwd'); //No I18N
            }else{
                swapRows('mainSnmpV3AuthPwd','resetSnmpV3AuthPwd'); //No I18N
            }
            var hasSnmpV3EncryptPwd = responseObj.HASENCRYPTPWD;
            if(hasSnmpV3EncryptPwd == true){
                swapRows('resetSnmpV3EncryptPwd','mainSnmpV3EncryptPwd');   //No I18N

            }else{
                swapRows('mainSnmpV3EncryptPwd','resetSnmpV3EncryptPwd');   //No I18N
            }
            if(hasSnmpV3AuthPwd == true)
            {
                document.getElementById("snmpV3EncryptProtocol").disabled = false;
                document.getElementById("snmpV3EncryptPwd").disabled = false;
            }
            jQuery('#protoCol_SNMPV3').show();
        }else if(responseObj.VMWARE != undefined && responseObj.VMWARE == true){
            document.CredentialsLibraryForm.httpUsername.value = responseObj.USERNAME;
            document.CredentialsLibraryForm.httpPort.value = responseObj.HTTPPORT;
            document.CredentialsLibraryForm.httpTimeout.value = responseObj.HTTPTIMEOUT;
            if(hasPwd == true){
                swapRows('resetHttpPwd','httpPwdInput');
            }else{
                swapRows('httpPwdInput','resetHttpPwd');
            }
            jQuery('#protoCol_VMware').show();
        }else if(responseObj.REMOTECONTROL != undefined && responseObj.REMOTECONTROL == true){
            document.CredentialsLibraryForm.rdsUserName.value = responseObj.USERNAME;
            document.CredentialsLibraryForm.rdsDomainName.value = responseObj.RDS_DOMAIN;
            if(hasPwd == true){
                swapRows('resetRdsPwd','rdsPwdInput');
            }else{
                swapRows('rdsPwdInput','resetRdsPwd');
            }
            jQuery('#protoCol_RemoteControl').show();

        }else if (responseObj.HTTP != undefined && responseObj.HTTP == true){
            document.CredentialsLibraryForm.ciscoTimeout.value = responseObj.CISCOTIMEOUT;
            jQuery('#protoCol_HTTP').show();
        }else if(responseObj.SCCM != undefined && responseObj.SCCM == true){
            jQuery('#sccmUserName').val(responseObj.USERNAME);
            jQuery('#sccmDomain').val(responseObj.SCCMDOMAIN);
            jQuery('#sccmAuthMode').val(responseObj.SCCMAUTHMODE);
            jQuery('#protoCol_SCCM').show();
            if(responseObj.SCCMAUTHMODE == 'sql'){
                  jQuery('#sccmDomainRow').hide();
                jQuery('#sccmDomain').val('');
            }
            if(responseObj.SCCMAUTHMODE == 'Windows'){
                jQuery('#sccmDomainRow').show();
          }
            if(hasPwd == true){
                swapRows('sccmPwdReset','sccmPwdInput');
            }else{
                swapRows('sccmPwdInput','sccmPwdReset');
            }
        }

		if(isMSP) {
			var accountElement = jQuery("#__persistentAccountId__select"); // no i18n
			accountElement.attr('disabled','disabled');
			accountElement.removeClass('accountFormStyle'); // no i18n
		 	accountElement.addClass('accountStyleDisabled'); // no i18n
		 	if(responseObj.ACCOUNTID == undefined) {
				accountElement.select2("val",0);// no i18n
		 	}
		 	else {
				accountElement.select2("val",responseObj.ACCOUNTID);
		 	}
		}
    }else{
        document.getElementById('loadingdivid').style.display = 'none';
        failureMsg = responseObj.MESSAGE;
        showFailureMessageAndClose(failureMsg,5000);
    }
}

function showCredentialsListView() {
	swapLayer('listview','formview'); // no i18n
	if(isMSP ) {
			var accountElement = jQuery("#__persistentAccountId__select"); // no i18n
			accountElement.removeAttr('disabled');
		 	accountElement.addClass('accountFormStyle'); // no i18n
		 	accountElement.removeClass('accountStyleDisabled'); // no i18n
			refreshCredentialsView();
	}
}
//Since HTTP Protocol is currently used for scanning cisco ip phones and it doesn't need any username/passwords, hiding it from the Add credentials sections
function hideHTTPProtocol(){
    jQuery('#selPtcol option[id="HTTP"]').remove();
}

function swapRows(idToShow,idToHide){
    jQuery("#"+idToShow).removeClass("hide").addClass("show");
    jQuery("#"+idToHide).removeClass("show").addClass("hide");
}

function fillCredentialOptions(responseObj){
    var resXml = responseObj.responseXML;
    var nodeList = resXml.getElementsByTagName("NetworkList")[0].childNodes;
    var childNodeCount = nodeList.length;
        jQuery("#networkId").html("<option value='-1'>----"+getMessageForKey('sdp.common.choose')+"----</option>");
        jQuery("#credentialId1").html("<option value='-1'>----"+getMessageForKey('sdp.common.choose')+"----</option>");
    for(i=0;i<childNodeCount;i++){
        var node = nodeList[i];
        var networkId = node.getAttribute("NetworkId");
        var network = node.getAttribute("NetworkName");
        jQuery("#networkId").append('<option value='+networkId+'>'+encodeHTML(network)+'</option>');
    }
        var nodeListEle1 = resXml.getElementsByTagName("CredentialList1")[0];
        if(nodeListEle1 != undefined){
            var nodeList1 = nodeListEle1.childNodes;
            var childNodeCount1 = nodeList1.length;
            for(i=0;i<childNodeCount1;i++){
                    var node1 = nodeList1[i];
                    var credentialId1 = node1.getAttribute("CredentialId");
                    var credential1 = node1.getAttribute("CredentialName");
                    jQuery("#credentialId1").append('<option value='+credentialId1+'>'+encodeHTML(credential1)+'</option>');
            }
        }
        /*var nodeListEle2 = resXml.getElementsByTagName("CredentialList2")[0];
        if(nodeListEle2 != undefined){
            var nodeList2 = nodeListEle2.childNodes;
            var childNodeCount2 = nodeList2.length;
            for(i=0;i<childNodeCount2;i++){
                    var node2 = nodeList2[i];
                    var credentialId2 = node2.getAttribute("CredentialId");
                    var credential2 = node2.getAttribute("CredentialName");
                    jQuery("#credentialId2").append('<option value='+credentialId2+'>'+credential2+'</option>');
            }
            jQuery(".credentialRow2").removeClass("hide").addClass("show");
        }else{
            jQuery(".credentialRow2").removeClass("show").addClass("hide");
        }*/

}
function addNewCredential(formObj,elementIdToUpdate,devTypeId){
    if(devTypeId == null || devTypeId == undefined){
        devTypeId = formObj.devicetype.value;
    }
    if(devTypeId != null && devTypeId != undefined && devTypeId != -1){
        showURLInDialog('CredentialsLibrary.do?action=addNew&popUp=true&elementId='+elementIdToUpdate+'&deviceTypeId='+devTypeId,'closeButton=no,width=600');  //No I18N
    }else{
        alert(getMessageForKey('ae.admin.credentiallibrary.devicetype.select'));
    }
}

function deleteNetwork(form)
{
        var valid = checkForDelete(form,"checkbox");//NO I18N
        if(valid)
        {
                valid = confirm('are you sure to delete?');//NO I18N
                if(valid)
                {
                        var param = "action=delete";//NO I18N

                        var selectedObj = document.getElementsByName("checkbox");//NO I18N

                        for( i=0; i<selectedObj.length; i++ )
                        {
                                if( selectedObj[i].checked )
                                {
                                        param += "&networkId=" + selectedObj[i].value;//NO I18N
                                }
                        }
                        displayLoadingInformation(null,'delete in progresss', false);//NO I18n
                        callCustomAjaxRequest("/EditNetwork.do", param, deleteNetworkSuccess, ajaxRequestOnFailure);//NO I18N
                        return true;
                }
                else
                {
                        return false;
                }
        }
        else
        {
          alert('Please select network to delete.');//NO I18N
        }
        return false;
}


function deleteNetworkSuccess(responseObj){
    responseObj = JSON.parse(responseObj.responseText);
    if( responseObj.STATUS == 'SUCCESS'){
        document.getElementById('loadingdivid').style.display = 'none';
        refreshSubView(getPortalViewName('NetworkListView'));
        showMessageAndClose("Network(s) deleted Successfully.",2000);//NO I18N
    }else{
        document.getElementById('loadingdivid').style.display = 'none';
        failureMsg = responseObj.MESSAGE;
        showFailureMessageAndClose(failureMsg,5000);
    }

}
function updateNwCredential(){
    var len = devTypeList.length;
    var i =0;
    for(i=0;i<len;i++){
        var credList = nwCredList[i];
        var j = 0;
        var credCount = credList.length;
        document.getElementById('credential_'+devTypeList[i]+'_1').value=credList[0];
        for(j=1;j<credCount;j++){
            addAnotherCredential('cred_'+devTypeList[i],j,true);
            document.getElementById('credential_'+devTypeList[i]+'_'+(j+1)).value=credList[j];
        }
    }
}
function addAnotherCredential(credTDid, credCount,addWithOutCondition){
    /*var credCount = jQuery('#'+credTDid).children('.firstcred').length;
    var divCount = jQuery('#'+credTDid).children('.mt10').length;
    credCount = credCount+divCount;*/
    var devTypeId = credTDid.substring(credTDid.indexOf('_')+1);
    var selValue = document.getElementById('credential_'+devTypeId+'_'+credCount).value;
    if(selValue != -1){
        var credCounter = parseInt(credCount)+1;
        var newCred = jQuery('#credRow').html();
        newCred = newCred.replace('hide','show');
        newCred = newCred.replace(/COUNTER/g,credCounter);
        newCred = newCred.replace(/DEVTYPEID/g,devTypeId);
        jQuery('#'+credTDid).find('.addnew').removeClass('ae-icon05');
        jQuery('#'+credTDid).find('.addAnother').removeClass('ae-icon07');
        //jQuery('#'+credTDid).find('.addnew').html('');
        jQuery('#'+credTDid).append(newCred);
        jQuery('#credential_'+devTypeId+'_'+credCounter).html(jQuery('#credential_'+devTypeId+'_'+credCount).html());
        //document.getElementById('credential_'+devTypeId+'_'+credCounter).options[document.getElementById('credential_'+devTypeId+'_'+credCount).selectedIndex].remove();
        document.getElementById('credential_'+devTypeId+'_'+credCounter).remove(document.getElementById('credential_'+devTypeId+'_'+credCount).selectedIndex);
        jQuery(".ntcrediv").on('mouseenter',
                function () {
                    jQuery(this).css("background-color","#f3f3f3"); // no i18n
                    jQuery(this).find(".removecre").removeClass('hide');
                });

        jQuery(".ntcrediv").on('mouseleave',
                function () {
                    jQuery(this).css("background-color","transparent"); // no i18n
                    jQuery(this).find(".removecre").addClass('hide');
                });
        /*if(newCredId != undefined){
            document.getElementById('credential_'+devTypeId+'_'+credCounter).value=newCredId;
        }*/
    }else{
        /*if(newCredId != undefined){
            document.getElementById('credential_'+devTypeId+'_'+credCount).value=newCredId;
        }else{*/
            //alert('Please select credential.');
            //new Effect.ScrollTo('credential_'+devTypeId+'_'+credCount);//No I18N
            if(addWithOutCondition == undefined || addWithOutCondition == false){
                showBaloonToolTip('credential_'+devTypeId+'_'+credCount, getMessageForKey('ae.admin.nwscan.alert.selectcred'));//No I18N
            }
        //}
    }
    if(document.querySelector('#addAnother_'+devTypeId+'_'+credCounter)) { document.querySelector('#addAnother_'+devTypeId+'_'+credCounter).addEventListener("click", function(event) { //NO I18N
        addAnotherCredential('cred_'+devTypeId, credCounter); //NO I18N
    }); };
    if(document.querySelector('#del_'+devTypeId+'_'+credCounter)) { document.querySelector('#del_'+devTypeId+'_'+credCounter).addEventListener("click", function(event) { //NO I18N
        removeCredential('cred_'+ devTypeId, 'del_'+devTypeId+'_'+credCounter , this); //NO I18N
    }); };
    if(document.querySelector('#add_'+devTypeId+'_'+credCounter)) { document.querySelector('#add_'+devTypeId+'_'+credCounter).addEventListener("click", function(event) { //NO I18N
        addNewCredential(document.forms.EditNetwork, 'credential_'+devTypeId+'_'+credCounter, devTypeId); //NO I18N
    }); };
}

function removeCredential(credTDid, credIdDel,curEle)
{
    var credCount = jQuery('#'+credTDid).children('.firstcred').length; // no I18N
    var divCount = jQuery('#'+credTDid).children('.mt10').length; // no I18N
    credCount = credCount+divCount;
    var devTypeId = credTDid.substring(credTDid.indexOf('_')+1);
    if(credCount>1){
        var delCred  = parseInt(credIdDel.substring(credIdDel.lastIndexOf('_')+1));
        var selIndex = document.getElementById("credential"+credIdDel.substring(credIdDel.indexOf('_'))).selectedIndex;
        if(selIndex >0){
            var i = 0;
            var lastEleId = jQuery('#'+credTDid).find('select')[jQuery('#'+credTDid).find('select').length-1].id;
            credCount = parseInt(lastEleId.substring(lastEleId.lastIndexOf('_')+1));

            for(i=delCred+1;i<=credCount;i++){
                if(document.getElementById("credential_"+devTypeId+"_"+i) != undefined){
                    var opt = new Option();
                    opt.value = document.getElementById("credential"+credIdDel.substring(credIdDel.indexOf('_'))).options[selIndex].value;
                    opt.text = document.getElementById("credential"+credIdDel.substring(credIdDel.indexOf('_'))).options[selIndex].text;
                    document.getElementById("credential_"+devTypeId+"_"+i).add(opt,selIndex);
                }
            }
        }
        var lastBeforeEleId = jQuery('#'+credTDid).find('select')[jQuery('#'+credTDid).find('select').length-2].id;
        var countToUpdateaddNew = parseInt(lastBeforeEleId.substring(lastBeforeEleId.lastIndexOf('_')+1));

        var addDevTypeID = jQuery('#add_'+devTypeId+'_'+countToUpdateaddNew),
        credentRow = jQuery(curEle).parents('td.credential-row'); // no I18N
        jQuery('#'+credIdDel).parents('div:first').remove(); // no I18N
        jQuery('#add_'+devTypeId+'_'+countToUpdateaddNew).addClass('ae-icon05');
        var ntcredivChildren = credentRow.children('.ntcrediv'); // no I18N
        if(ntcredivChildren.length !== 0){
            ntcredivChildren.find('img.ml8').removeClass('ae-icon05'); // no I18N
            ntcredivChildren.last().find('img.ml8').addClass('ae-icon05'); // no I18N
            ntcredivChildren.find('img.addAnother').removeClass('ae-icon07'); // no I18N
            ntcredivChildren.last().find('img.addAnother').addClass('ae-icon07'); // no I18N
        }
        jQuery('#addAnother_'+devTypeId+'_'+countToUpdateaddNew).addClass('ae-icon07');

    }else{
        var eleMent = document.getElementById('credential_'+devTypeId+'_'+credCount);
        if(eleMent){
            document.getElementById('credential_'+devTypeId+'_'+credCount).value=-1;
        }
    }

}
function fetchOus(domainId,name){
             jQuery(document.body).append(
             '<form id="fetchousForm" action="/DomainDiscovery.do?action=fetchous" method="POST">' +
                 '<input type="hidden" name="isRefresh" value="true">' +
                 '<input type="hidden" name="domain" value="'+ domainId.valueOf()+ '">' +
                 '<input type="hidden" name="scanType" value="domain">'+
                 '<input type="hidden" name="name" value="' + encodeHTMLAttribute(name) + '">' +
                 '<input type="hidden" name="' + getCSRFParamName() + '" value="' + getCSRFParamValue() + '">' +
             '</form>');
         jQuery('#fetchousForm').trigger('submit');
}
function scanNetwork(nwId,nwName,siteId,isSiteEnabled,newWindow){
     if(sdp_app.IS_DEMO_BUILD) {
         showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
         return false;
     }
     if(isSiteEnabled){
        var url = 'DomainDiscovery.do?action=scannownetwork&network='+nwId+'&scanType=network&name='+nwName ; // no I18N
        if(siteId != null && siteId != "" && siteId != 'null'){
            url += '&siteId='+siteId ;   // no I18N
        }
         NewWindow(url ,'NetworkDiscovery-'+nwId,'810','450','yes','center');   // no I18N
    }else{
            if(!isMSP){siteId = -1;}
          var form = document.getElementById("startnetworkscanForm");
          if(form == null){
            jQuery(document.body).append(
                 '<form id="startnetworkscanForm" action="/DomainDiscovery.do?action=startnetworkscan" target="NetworkDiscovery-'+nwId + '" method="POST">' +
                     '<input type="hidden" name="scanType" value="network">' +
                     '<input type="hidden" name="subScanType" value="network">' +
                     '<input type="hidden" name="network" value="'+ nwId.valueOf()+ '">' +
                     '<input type="hidden" name="name" value="' + encodeHTMLAttribute(nwName) + '">'+
                     '<input type="hidden" name="siteId" value="' + siteId.valueOf() + '">'+
                     '<input type="hidden" name="' + getCSRFParamName() + '" value="' + getCSRFParamValue() + '">' +
                 '</form>');
            form = document.getElementById("startnetworkscanForm");
          }
           else{
                form.network.value = nwId.valueOf();
                form.name.value = encodeHTMLAttribute(nwName);
                form.siteId.value = siteId.valueOf();
           }
          if(newWindow == undefined || newWindow == true){
                        window.open('about:blank', 'NetworkDiscovery-'+nwId, 'scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');
                         form.target= 'NetworkDiscovery-'+nwId ;
                    }
            else{
                form.target = window.name;
            }
         form.submit();
    }
}
function removeSelectedValues(){
    var len = arguments.length;
    var i = 0;
    for(i=0;i<len;i++){
        document.getElementById(arguments[i]).value='-1';
    }
}
function validateAndSaveCredential(formObj,isPopUp,parentEleId){
    var protocolId = formObj.protocolId.value;
    if(protocolId == -1){
        showBaloonToolTip('selPtcol', getMessageForKey('ae.admin.credentiallibrary.select.credntialtype'));//No I18N
        return;
    }
    var credName = formObj.name.value.trim();
    if(credName.length == 0){
        showBaloonToolTip('credName', getMessageForKey('ae.admin.credentiallibrary.entercredential'));//No I18N
        return;
    }
    var protocolName = formObj.protocolId.options[formObj.protocolId.options.selectedIndex].text;

    if(protocolName.indexOf('Windows') != -1){
        var userName = formObj.userName.value.trim();
        var backSlashIndex = userName.indexOf('\\');
        if(backSlashIndex < 0 || userName.substring(0,backSlashIndex).length == 0 || userName.substring(backSlashIndex+1) == 0){
            showBaloonToolTip('userName', getMessageForKey('sdp.admin.credentiallibrary.windows.loginformat'));//No I18N
            return;
        }

        if((jQuery('#pwdInput').hasClass('show')) && (formObj.password.value.trim().length == 0)){
            showBaloonToolTip('password',getMessageForKey('sdp.admin.credentiallibrary.enter.password'));//No I18N
            return;
        }
    }else if(protocolName.indexOf('Telnet') != -1){
        var sshTelnetProtocolId = formObj.sshTelnetProtocol.value;
        if(sshTelnetProtocolId == -1){
            showBaloonToolTip('selsshTelnet', getMessageForKey('sdp.admin.credentiallibrary.selectprotocol'));//No I18N
            return;
        }
        var sshTelnetPorts = formObj.sshTelnetPort.value.trim().split(',');
        var portscount = sshTelnetPorts.length;
        var i = 0;
        for(i=0;i<portscount;i++){
            if(sshTelnetPorts[i].length == 0 || !isPositiveInteger(sshTelnetPorts[i]) || sshTelnetPorts[i].trim() == '0'){
                showBaloonToolTip('sshTelnetPort',getMessageForKey('sdp.admin.credentiallibrary.validport'));//No I18N
                return;
            }
        }
        var timeout = formObj.sshTelnetTimeout.value.trim();
        if(timeout.length == 0 || !isPositiveInteger(timeout)){
            showBaloonToolTip('sshTelnetTimeout',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
        var userName =formObj.sshTelnetUsername.value.trim();
        if(userName.length == 0){
            showBaloonToolTip('sshTelnetUsername',getMessageForKey('sdp.admin.credentiallibrary.enter.username'));//No I18N
            return;
        }
        if(document.getElementById('usePublicKeyAuth').checked == true){
            var privateKey = formObj.sshPrivateKey.value.trim();
                if(jQuery('#sshPKInput').hasClass('show') && privateKey.length == 0){
                    showBaloonToolTip('sshPrivateKey',getMessageForKey('sdp.admin.credentiallibrary.enter.privatekey'));//No I18N
                    return;
                }
                if(privateKey.length > 5000){
                    showBaloonToolTip('sshPrivateKey',getMessageForKey('sdp.admin.credentiallibrary.enter.pklength'));//No I18N
                    return;
                }
        }else{
            //var isPwdShown = jQuery('#sshPwdInput').is(':visible');//No I18N
            if(jQuery('#sshPwdInput').hasClass('show')){
                var pwd = formObj.sshTelnetPassword.value.trim();
                if(pwd.length == 0){
                    showBaloonToolTip('sshTelnetPassword',getMessageForKey('sdp.admin.credentiallibrary.enter.password'));//No I18N
                    return;
                }
            }
        }
    }else if(protocolName.indexOf('SNMP V1') != -1){
        //var isPwdShown = jQuery('#snmpReadInput').is(':visible');//No I18N
        if(jQuery('#snmpReadInput').hasClass('show')){
            var snmpRead = document.getElementById('snmpRead').value.trim();
            if(snmpRead.length == 0){
                showBaloonToolTip('snmpRead',getMessageForKey('sdp.admin.credentiallibrary.enter.snmpread'));//No I18N
                return;
            }
        }
        var snmpPort = document.getElementById('snmpPort').value.trim();
        if(snmpPort.length == 0 || !isPositiveInteger(snmpPort) || snmpPort.trim() == '0'){
            showBaloonToolTip('snmpPort',getMessageForKey('sdp.admin.credentiallibrary.validport'));//No I18N
            return;
        }
        var snmpTimeOut = document.getElementById('snmpTimeOut').value.trim();
        if(snmpTimeOut.length == 0 || !isPositiveInteger(snmpTimeOut)){
            showBaloonToolTip('snmpTimeOut',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
        var snmpRetries = document.getElementById('snmpRetries').value.trim();
        if(snmpRetries.length ==0 || !isPositiveInteger(snmpRetries)){
            showBaloonToolTip('snmpRetries',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
    }else if(protocolName.indexOf('SNMP V3') != -1){
        //var isPwdShown = jQuery('#snmpReadInput').is(':visible');//No I18N
        var snmpV3UserName = document.getElementById('snmpV3UserName').value.trim();
        if(snmpV3UserName.length == 0){
            showBaloonToolTip('snmpV3UserName',getMessageForKey('sdp.admin.credentiallibrary.enter.username'));//No I18N
            return;
        }
        var snmpV3AuthProtocol = document.getElementById('snmpV3AuthProtocol').value.trim();
        if(jQuery('#mainSnmpV3AuthPwd').hasClass('show')){
            var snmpV3AuthPwd = document.getElementById('snmpV3AuthPwd').value.trim();
            if(snmpV3AuthProtocol !== "Select" && snmpV3AuthProtocol !== null && snmpV3AuthPwd.length == 0){
                showBaloonToolTip('snmpV3AuthPwd',getMessageForKey('sdp.admin.credentiallibrary.enter.password'));//No I18N
                return;
            }
            else if(snmpV3AuthProtocol === "Select" && snmpV3AuthPwd.length > 0)
            {
                document.getElementById('snmpV3AuthPwd').value = '';//No I18N
            }
        }
        var snmpV3EncryptProtocol = document.getElementById('snmpV3EncryptProtocol').value.trim();
        if(jQuery('#mainSnmpV3EncryptPwd').hasClass('show')){
            var snmpV3EncryptPwd = document.getElementById('snmpV3EncryptPwd').value.trim();
            if(snmpV3EncryptProtocol !== null && snmpV3EncryptProtocol != "Select" && snmpV3EncryptPwd.length == 0){
                showBaloonToolTip('snmpV3EncryptPwd',getMessageForKey('sdp.admin.credentiallibrary.enter.password'));//No I18N
                return;
            }
            else if(snmpV3EncryptProtocol === "Select" && snmpV3EncryptPwd.length > 0)
            {
                document.getElementById('snmpV3EncryptPwd').value = '';//No I18N

            }
        }
        var snmpV3Port = document.getElementById('snmpV3Port').value.trim();
        if(snmpV3Port.length == 0 || !isPositiveInteger(snmpV3Port) || snmpV3Port.trim() == '0'){
            showBaloonToolTip('snmpV3Port',getMessageForKey('sdp.admin.credentiallibrary.validport'));//No I18N
            return;
        }
        var snmpV3TimeOut = document.getElementById('snmpV3Timeout').value.trim();
        if(snmpV3TimeOut.length == 0 || !isPositiveInteger(snmpV3TimeOut)){
            showBaloonToolTip('snmpV3Timeout',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
        var snmpV3Retries = document.getElementById('snmpV3Retries').value.trim();
        if(snmpV3Retries.length ==0 || !isPositiveInteger(snmpV3Retries)){
            showBaloonToolTip('snmpV3Retries',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }

    }else if(protocolName.indexOf('VMware') != -1){
        var httpUsername = document.getElementById('httpUsername').value.trim();
        if(httpUsername.length == 0){
            showBaloonToolTip('httpUsername',getMessageForKey('sdp.admin.credentiallibrary.enter.username'));//No I18N
            return;
        }
        //var isPwdShown = jQuery('#httpPwdInput').is(':visible');//No I18N
        if(jQuery('#httpPwdInput').hasClass('show')){
            var httpPassword = document.getElementById('httpPassword').value.trim();
            if(httpPassword.length == 0){
                showBaloonToolTip('httpPassword',getMessageForKey('sdp.admin.credentiallibrary.enter.password'));//No I18N
                return;
            }
        }
        var httpPort = document.getElementById('httpPort').value.trim();
        if(httpPort.length == 0 || !isPositiveInteger(httpPort) || httpPort.trim() == '0'){
            showBaloonToolTip('httpPort',getMessageForKey('sdp.admin.credentiallibrary.validport'));//No I18N
            return;
        }
        var httpTimeout = document.getElementById('httpTimeout').value.trim();
        if(httpTimeout.length == 0 || !isPositiveInteger(httpTimeout)){
            showBaloonToolTip('httpTimeout',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
    }else if(protocolName.indexOf('HTTP') != -1){
        var ciscoTimeout = document.getElementById('ciscoTimeout').value.trim();
        if(ciscoTimeout.length == 0 || !isPositiveInteger(ciscoTimeout)){
            showBaloonToolTip('ciscoTimeout',getMessageForKey('sdp.admin.ad.schedule.invalidno'));//No I18N
            return;
        }
    }else if(protocolName.indexOf('SCCM') != -1){
        var sccmUserName= document.getElementById('sccmUserName').value.trim();
        var sccmPassword= document.getElementById('sccmPassword').value.trim();
        var sccmDomain= document.getElementById('sccmDomain').value.trim();

        if(sccmUserName.length == 0)
        {
            showBaloonToolTip('sccmUserName',getMessageForKey('sdp.discovery.sccm.usernamenull'));   //No I18N
            return;
        }
    }else{
        var rdsDomainName = document.getElementById('rdsDomainName').value.trim() || '';
        var rdsUserName = document.getElementById('rdsUserName').value.trim() || '';
        var rdsPassword = document.getElementById('rdsPassword').value.trim() || '';
        if(rdsDomainName == '' && rdsUserName == '' && rdsPassword == '' && jQuery('#rdsPwdInput').hasClass('show')){
            jQuery('.rdsCredMandatory').removeClass('form-control').addClass('formStyleValidate');
            return;
        }
    }
    saveCredentialDetails(formObj,isPopUp,parentEleId);
    return true;
}
function changeSSHAuthMethod(isPKAuth){

    if(isPKAuth){
        jQuery('#sshPwdInput').removeClass("show").addClass("hide");
        jQuery('#resetSshPwd').removeClass("show").addClass("hide");
        jQuery('#sshPKInput').removeClass("hide").addClass("show");
        document.getElementById('sshTelnetPassword').value='';
    }else{
        jQuery('#sshPKInput').removeClass("show").addClass("hide");
        jQuery('#resetSshPK').removeClass("show").addClass("hide");
        jQuery('#sshPwdInput').removeClass("hide").addClass("show");
        document.getElementById('sshPrivateKey').value='';
    }
}
function changeSshTelnet(isTelnet){
    if(isTelnet == 'true'){
        document.CredentialsLibraryForm.sshTelnetPort.value="23";
        jQuery('#publicKeyAuth').removeClass("show").addClass("hide");
        jQuery('#sshPKInput').removeClass("show").addClass("hide");
        jQuery('#resetSshPK').removeClass("show").addClass("hide");
        jQuery('#sshPwdInput').removeClass("hide").addClass("show");
        jQuery('#resetSshPwd').removeClass("show").addClass("hide");
        document.getElementById('usePublicKeyAuth').checked = false;
        document.getElementById('sshPrivateKey').value='';

    }else{
        document.CredentialsLibraryForm.sshTelnetPort.value="22";
        jQuery('#publicKeyAuth').removeClass("hide").addClass("show");
        jQuery('#sshPwdInput').removeClass("hide").addClass("show");
        jQuery('#resetSshPwd').removeClass("show").addClass("hide");
    }
}
function getRdsCredentials(){
    var requestOne = callSjaxRequest('/ConnectRemoteHost.do', 'action=getCredentialsList'); // no i18n
    try {
        if (requestOne.readyState == 4) {
            if (requestOne.status == 200) {
                fillRdsCredentialOptions(requestOne);
            }
            else {
                ajaxRequestOnFailure(requestOne);
            }
        }
    }
    catch(e) {
        //alert("Error while fetching ajax response : " + e.message);
    }
}
function fillRdsCredentialOptions(responseObj){
    var resXml = responseObj.responseXML;
    jQuery("#credentialId").html("<option value='-1'>----"+getMessageForKey('sdp.common.choose')+"----</option>");
    var nodeListEle = resXml.getElementsByTagName("CredentialList")[0];
    if(nodeListEle != undefined){
        var nodeList = nodeListEle.childNodes;
        var childNodeCount = nodeList.length;
        for(i=0;i<childNodeCount;i++){
            var node = nodeList[i];
            var credentialId = node.getAttribute("CredentialId");
            var credential = node.getAttribute("CredentialName");
            jQuery("#credentialId").append('<option value='+Number(credentialId)+'>'+e_html(credential)+'</option>');
        }
    }
}

//Hiding the Add credential icon for Cisco IP Phones

function handleAddCredentialIcon(){
    var devTypeName = jQuery('#devicetype option:selected').text()//no i18n
    if (devTypeName == "Cisco IP Phone")//no i18n
    {
          jQuery('#addCredId').removeClass('show').addClass('hide');
    }else{
          jQuery('#addCredId').removeClass('hide').addClass('show');
    }
}

//Credentials Library ends
/* Exclude Device Javascript Methods Starts */
function confirmScanExclude(form,additionalParams)
{

    var params = "scanFromExclude=scanFromExclude"; //No I18N
    params+='&scanExcludeWSIds='+parent.getSelectedResources()+additionalParams; //No I18N
    //alert(params);
    callLoadingIcon('addExcludedListLoading',getMessageForKey("sdp.asset.ws.listview.excludedevice.pleasewait"));//No I18N
    callCustomAjaxRequest('/AESettings.do?action=exclude&',params,excludeDeviceFromScanPopUpSuccess, excludeDeviceFromScanPopUpFailure,'excludeDeviceFromScan');//No I18N
}
function excludeDeviceFromScanPopUpSuccess(requestObj, module)
{
if(module == 'excludeDeviceFromScan')
    {

                var status=requestObj.responseXML.getElementsByTagName("status")[0].childNodes[0].nodeValue;
                var message = requestObj.responseXML.getElementsByTagName("message")[0].childNodes[0].nodeValue;

        resetExcludeDialog();

        showalert(status, message, 'isAutoHide=true');  //No i18N
        //To reload ListView
        if(assetActions.options.isListView){
            assetListView.tableObject.refreshTable("refresh"); //NO I18N
        }
    }
}
function excludeDeviceFromScanPopUpFailure(requestObj, module)
{
    showalert("failure", getMessageForKey("sdp.asset.ws.listview.excludedevice.failedtocommunicate"), 'isAutoHide=true');  //No i18N
    resetExcludeDialog();
}
function resetExcludeDialog() {
    jQuery("#addExcludedListLoading").hide();
    jQuery("#excludescan.ui-dialog-content").dialog('destroy'); //No I18N
    jQuery("#ws_save_exclude").button('reset');
    jQuery("#ws_save_exclude_delete").button('reset');
}

function showDeleteButton(obj)
{
    jQuery(obj).find('.closebtn-circle').css('visibility','visible');//No I18N
}
function hideDeleteButton(obj)
{

    jQuery(obj).find('.closebtn-circle').css('visibility','hidden');//No I18N
}
function addExcludeList()
{
        var excludeName=document.getElementById("excludeName");
        var list=document.getElementById("Exclude_List");
        if(excludeName.value == "")
        {
            alert(getMessageForKey('sdp.admin.AESettings.excludescan.devinameempty'));
            return false;
        }
        else
        {
            var listOfNames=excludeName.value.replace(/\s+/g, '').split(',');
            //alert(listOfNames.length);
            for(var i=0;i<listOfNames.length;i++)
            {
                        if((listOfNames[i].indexOf('-')!==-1)&&(listOfNames[i].split('-').length==2))
                        {
                            var startIP=listOfNames[i].split('-')[0];
                            var endIP=listOfNames[i].split('-')[1];
                            if((isIpAddress(startIP)&&isIpAddress(endIP))||(isIpV6Address(startIP)&&isIpV6Address(endIP)))
                            {
                                //alert(startIP+","+endIP);
                                if(!isIPV4Range(startIP,endIP))
                                {
                                    alert(getMessageForKey("sdp.admin.AESettings.excludescan.validiprange"));
                                    return false;
                                }
                            }
                        }
            }
            addList(list,listOfNames);
            excludeName.value="";
        }
}
function addList(list,listOfNames)
{
    for(var i=0;i<listOfNames.length;i++)
        {
            var data=listOfNames[i];
            var divId=(list.childElementCount/2)+i
            data=data.trim();
            if(data!="")
                {
                    list.insertAdjacentHTML('afterbegin',"<span id='js-event-ExcludeSettingList-4-"+divId+"'><img id='js-event-ExcludeSettingList-6-"+divId+"' class='closebtn-circle' src='/images/spacer.gif' style='visibility: hidden;'>"+encodeHTML(data)+"</span> ");
                    if(document.getElementById("js-event-ExcludeSettingList-4-"+divId)){
                    document.getElementById("js-event-ExcludeSettingList-4-"+divId).addEventListener("mouseout", function(event) { hideDeleteButton(this) });//NO I18N
                    document.getElementById("js-event-ExcludeSettingList-4-"+divId).addEventListener("mouseover", function(event) { showDeleteButton(this) });//NO I18N
                    }
                    if(document.getElementById("js-event-ExcludeSettingList-6-"+divId)){
                    document.getElementById("js-event-ExcludeSettingList-6-"+divId).addEventListener("click", function(event) { removeApproverList(this) });//NO I18N
                    }
                }
        }
}

function stringToInt(str)     // Fix for ID: 60286
{
    var val=0;

    for(var i=0;i<str.length;i++)
    {
        var ASCIIVal=str.charCodeAt(i);
        val+=(ASCIIVal-48)*Math.pow(10,str.length-1-i);
    }

    return val;
}

function isIPV4Range(from,to)
{
    from=trim(from);
    from=from.split(".");

    to=trim(to);
    to=to.split(".");

    var fromIp=[0,0,0,0];
    var toIp=[0,0,0,0];

    for(var i=0;i<from.length;i++)      // Fix for ID: 60286
    {
        fromIp[i]=stringToInt(from[i]);
        toIp[i]=stringToInt(to[i]);
    }

    if(fromIp[0]<=toIp[0])
    {
        if((fromIp[1]<=toIp[1])||(fromIp[0]<toIp[0]))
        {
            if((fromIp[2]<=toIp[2])||(fromIp[0]<toIp[0])||(fromIp[1]<toIp[1]))
            {
                if((fromIp[3]<toIp[3])||(fromIp[2]<toIp[2])||(fromIp[0]<toIp[0])||(fromIp[1]<toIp[1]))
                {
                    return true;
                }
            }
        }
    }
    return false;
}

function removeApproverList(appObject)
    {
        if( confirm(getMessageForKey("sdp.admin.AESettings.excludeDevice.deletemsg")))
        {
            var spanId  = jQuery(appObject.parentNode).attr('id');
            var parentId = jQuery(appObject.parentNode.parentNode.parentNode.parentNode).attr('id');
            var selectId = jQuery(jQuery('#'+parentId+'').find('select')).attr('id');
            var isBeforeHtmlExist = jQuery(appObject.parentNode).prev().html();
            if(isBeforeHtmlExist != null)
            {
                jQuery(appObject.parentNode).prev('b').remove();//No I18N
            }
            else
            {
                jQuery(appObject.parentNode).next('b').remove();//No I18N
            }
            jQuery(appObject.parentNode).remove();
            jQuery('#'+selectId+' option[value="'+spanId+'"]').remove();
        }
    }

function excludeFormSubmit(formObj)
{
var excludedList=getExcludedList();
var str="";
var val="";
for(i=0;i<excludedList.length;i++)
{
 val= trimAll(excludedList[i]);

  if(i != 0)
    {
      str = str + "," + val;
    }
    else
    {
      str = val;
    }
}
formObj.excludeListString.value=str;
formObj.excludeDeviceSave.value="Save"; //no I18n
}
function excludePopUpFormSubmit(formObj)
{
    excludeFormSubmit(formObj);
    var str=formObj.excludeListString.value;
    var params="excludePopUp=excludePopUp&excludeDeviceSave=excludeDeviceSave&excludeListString="+str; //No I18N
    callCustomAjaxRequest('/AESettings.do?action=exclude&',params,excludeDeviceFromScanSuccess, excludeDeviceFromScanFailure,'configureExcludeDevice');//No I18N
}
function excludePopUpFormNwDomainSubmit(formObj)
{
    excludeFormSubmit(formObj);
    var str=formObj.excludeListString.value;
    var params="excludePopUp=excludePopUp&excludeDeviceSave=excludeDeviceSave&excludeListString="+str; //No I18N
    callCustomAjaxRequest('/AESettings.do?action=exclude&',params,excludeDeviceFromScanNwDomainSuccess, excludeDeviceFromScanNwDomainFailure,'configureExcludeDeviceFromNwDomain');//No I18N
}
function getExcludedList()
{
    var excludedList = new Array();
    var div = document.getElementById("Exclude_List");
    var spans = div.getElementsByTagName("span");
    var val="";
    for(i=0;i<spans.length;i++)
    {
        val= trimAll(jQuery('#Exclude_List span').eq(i).text());
        excludedList[i]=val;
    }
    return excludedList;
}
function excludeDeviceFromScanSuccess(requestObj, module)
{
    if(module == 'configureExcludeDevice')
    {
                var message = requestObj.responseXML.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                window.opener.showLoadingInformation(message);
                window.close();
    }

}
function excludeDeviceFromScanFailure(requestObj, module)
{
window.close();
displayLoadingInformation('/images/discoverystatus_undiscovere.gif',getMessageForKey("sdp.asset.ws.listview.excludedevice.failedtocommunicate"), true,2000);//No I18N
}
function excludeDeviceFromScanNwDomainSuccess(requestObj, module)
{
    if(module == 'configureExcludeDeviceFromNwDomain')
    {
                var message = requestObj.responseXML.getElementsByTagName("message")[0].childNodes[0].nodeValue;
                closeDialog();
                displayLoadingInformation('/images/discoverystatus_discovered.gif',message,"contract",2000);//No I18N

    }

}
function excludeDeviceFromScanNwDomainFailure(requestObj, module)
{
closeDialog();
displayLoadingInformation('/images/discoverystatus_undiscovere.gif',getMessageForKey("sdp.asset.ws.listview.excludedevice.failedtocommunicate"), "contract",2000);//No I18N
}
function disableEnterKey(e){
    if(e.keyCode == 13){
        addExcludeList();
    }
    return e.keyCode !==13;
}
function addClearStyle(){
    jQuery('#s2id_vmHost').children('a').children('span').addClass('ellipsis'); // no i18n
}
function changeVMDetailsForm(selecteId){
    if(selecteId == 'isVMHost'){
        if(document.AddWSForm.isVMHost.checked == true){
            jQuery('#vmInfo').show();
            jQuery('#isVM').prop('checked', false); // no i18n
            jQuery('.vmInfo2').hide();
            jQuery('.vmInfo1').show();
            jQuery('#vmHost').select2("container").hide(); // no i18n
            //document.AddWSForm.isVirtualMachine.value=false;
        }else{
            jQuery('#vmInfo').hide();
        }
    }else{
        if(document.AddWSForm.isVirtualMachine.checked == true){
            jQuery('#vmInfo').show();
            jQuery('#isVMHost').prop('checked', false); // no i18n
            jQuery('.vmInfo1').hide();
            jQuery('.vmInfo2').show();
            jQuery('#vmHost').show();
            jQuery('#vmHost').select2("container").show(); // no i18n
            //document.AddWSForm.isVMHost.value = false;

        }else{
            jQuery('#vmInfo').hide();
        }
    }
}

/* onchange methods for department selectbox(select2). */
function callSelect2ForUsers(util)
{
    var allowChange=true;
    util.setIsActiveUser(true);
    if(isMSP && jQuery('#accountNameDiv').is(":visible"))
    {
	allowChange=(getAccountId()==document.getElementById('account').value)?true:false;
    }
    var param = "";
    var deptId = jQuery('#department').select2('val'); // no i18n
    var userId = jQuery('#user').select2('val'); // no i18n
    if(userId != '0' && deptId != '0'){
        userId = '0';
        userName = getMessageForKey('sdp.inventory.workstations.listview.nojustselectdepartmentmsg');
        jQuery('#user').select2('data',{id: userId, name: userName});  //NO I18N
    }
    var siteObj = jQuery('#usersites');
    if(siteObj == undefined)
    {
        siteObj = jQuery('#allsites');
    }
    var siteId = null;
    if(siteObj != undefined)
    {
        siteId = siteObj.select2('val');// no i18n
    }
    if(deptId != null)
    {
        if(deptId > 0)
        {
            param = "action=select_site_associated_dept&deptid=" + deptId;//NO I18N
            callCustomAjaxRequestForGET("/servlet/AJaxServlet", param, function(req, module) {// no i18n
            if(req.responseText.length == 0)
                {
                 var confirmValue = false;
                if(siteId != -1){
                     confirmValue = window.confirm(getMessageForKey('sdp.asset.site.changed.warn.message'));
                }
                if(confirmValue)
                {
                    siteObj.select2('data', JSON.parse('{"id": "-1" '+', "text" : "' + getMessageForKey("sdp.admin.technician.addtechnician.nosite") + '"}'), false);// no i18n
                }
                }
                else
            {
                var departmentSiteObj = req.responseXML.getElementsByTagName("SDOrganization");// no i18n
                var length = departmentSiteObj.length;
                if(length >= 1)
                {
                    var departmentSiteId = departmentSiteObj[0].getAttribute("org_id");// no i18n
                    var departmentSiteObjJSON = '{"id":"' + departmentSiteId +'", "text" : "' + departmentSiteObj[0].getAttribute("name") + '"}';// no i18n
                    if(departmentSiteId !== siteId && (siteId > 0))
                    {
					if(allowChange)
      	  				{	var confirmValue = window.confirm(getMessageForKey('sdp.asset.site.changed.warn.message'));
                        if(confirmValue)
                        {
                            siteObj.select2('data', JSON.parse(departmentSiteObjJSON), false);// no i18n
                        }
                }
				}
                    else
                    {
						if(allowChange)
                    {
                        siteObj.select2('data', JSON.parse(departmentSiteObjJSON), false);// no i18n
                    }
                }
            }
			}
            }, ajaxRequestOnFailure, 'select_site_associated_dept');//NO I18N
        }
    }
    jQuery("#user").data("deptId", deptId);     // No I18N
}
/* Exclude Device Javascript Methods Ends */



function addMonitorDetailsForForm()
{
    if( document.createElement && document.childNodes )
    {
        var gUniqueRowID = Math.round((999 - 100) * Math.random() + 1);
        var thisRow = document.getElementById('monitorDetails_1');
        var newElement = thisRow.cloneNode(true);
        newElement.id = "monitorDetails_" + gUniqueRowID;
        thisRow.parentNode.appendChild(newElement);
        updateMonitorElementName(newElement, gUniqueRowID);
    }
}


function updateMonitorElementName( trObj, newId )
{
    var temp1 = function(event) {removeMonitorRowWithID(newId);};
    var temp2 = function() {removeMonitorRowWithID(newId);};
    for(var jj=0; jj<trObj.childNodes.length; jj++) {
        var tdObj = trObj.childNodes[jj];
        if(tdObj.nodeName =='TD') {
            for(var z=0; z<trObj.childNodes[jj].childNodes.length; z++) {
                var tags = trObj.childNodes[jj].childNodes[z];
                if(tags.nodeName == 'INPUT')
                {
                    var name = tags.name;
                    name = name.substr(0,name.indexOf('_'));
                    tags.name = name+"_" + newId;
                    tags.id = name+"_" + newId;
                    tags.value='';
                }
                if(tags.nodeName == 'SPAN')
                {
                    var src = tags.className;
                    var id = tags.id;
                    if(id.indexOf("deleteimg") != -1)
                    {
                        src = src.replace("icon-md","cspr icon-md spad-delete");//NO I18N
                        tags.className = src;
                        var browser = navigator.appName;
                        if( browser == "Netscape" )
                        {
                            tags.onclick = temp1;
                        }
                        else
                        {
                            tags.onclick = temp2;
                        }
                    }
                    else if(src.indexOf("deleteicon") != -1)
                    {
                        tags.className='show';
                        var browser = navigator.appName;
                        if( browser == "Netscape" )
                        {
                            tags.onclick = temp1;
                        }
                        else
                        {
                            tags.onclick = temp2;
                        }
                    }

                    if( tags.name != undefined && tags.name.indexOf("deleteimg_") >= 0 )
                    {
                        tags.name = "deleteimg_" + newId;
                        tags.id = "deleteimg_" + newId;
                    }
                }
            }
        }
    }

}


function removeMonitorRowWithID( id )
{
    if( document.createElement && document.childNodes )
    {
        var theRow = document.getElementById('monitorDetails_'+id);
        theRow.setAttribute('bgcolor','#FAF8CC');
        Hide('monitorDetails_'+id);//NO I18N
        theRow.parentNode.removeChild(theRow);
    }
}

function validateAssociateServicesForm()
{
    var anum=/(^\d+$)|(^\d+\.\d+$)/;
    var vendorId = jQuery('#hiddenVendorId').val();
    var serviceId = jQuery('#vendorService').val();
    if( serviceId == '-1' )
    {
        alert(getMessageForKey("ae.admin.vendor.validation.servicename.jserr"));
        jQuery("#vendorService").trigger('focus');
        return false;
    }
    var serviceCost = jQuery('#serviceCost').val();
    if( serviceCost == '' )
    {
        alert(getMessageForKey("ae.admin.vendorservice.validation.servicecost"));
        jQuery("#serviceCost").trigger('focus');
        return false;
    }
    else
    {
        if (!anum.test(serviceCost))
        {
            alert(getMessageForKey("sdp.inventory.detailAsset.invalidCostMsg"));
            jQuery("#serviceCost").trigger('focus');
            return false;
        }
    }
    var taxRate = jQuery('#taxRate').val();
    if( taxRate != '' && !anum.test(taxRate))
    {
        alert(getMessageForKey("ae.admin.vendorassociation.validtaxrate.message"));
        jQuery("#taxRate").trigger('focus');
        return false;
    }
    else if(taxRate.trim() == '')
    {
        taxRate = '0.00';
    }
    var param = "operation=asssociateNewVendor";//NO I18N
    var serviceYears = jQuery('#serviceYears').val();
    var serviceMonths = jQuery('#serviceMonths').val();
    var supportVendor = jQuery('#supportVendor').val();
    var vendorComments = jQuery('#vendorComments').val();
    var paramFields = "&serviceInfoId="+serviceId+"&serviceVendor="+vendorId+"&serviceCost="+serviceCost+"&taxRate="+taxRate+"&serviceYears="+serviceYears+"&serviceMonths="+serviceMonths+"&supportVendor="+supportVendor+"&vendorComments="+encodeURIComponent(vendorComments);//No I18N
    var serviceVendorId = jQuery('#serviceVendorId').val();
    if(serviceVendorId != '')
    {
        param = "operation=updateAssociatedVendor&serviceVendorId="+serviceVendorId+paramFields; //NO I18N
        callCustomAjaxRequest('/VendorServices.do', param, associateServiceOperation, ajaxRequestOnFailure, 'updateAssociatedVendor'); //NO I18n
    }
    else
    {
        param += paramFields;
        callCustomAjaxRequest('/VendorServices.do', param, associateServiceOperation, ajaxRequestOnFailure, 'asssociateNewVendor'); //NO I18n
    }
}

function refreshServiceVendorAssociationList()
{
    var vendorName = jQuery('#hiddenVendorName').val();
    var vendorId = jQuery('#hiddenVendorId').val();
    if(vendorId != '')
    {
        var param = "operation=showAssociatedServices&vendorId="+vendorId+"&vendorName="+encodeURIComponent(vendorName);//NO I18N
        callCustomAjaxRequest('/VendorServices.do', param, associateServiceOperation, ajaxRequestOnFailure, 'showAssociatedServices'); //NO I18n
    }
}

function editServiceAssociation(serviceVendorId)
{
    param = "operation=editVendorAssociation&serviceVendorId="+serviceVendorId; //NO I18N
    callCustomAjaxRequest('/VendorServices.do', param, associateServiceOperation, ajaxRequestOnFailure, 'editVendorAssociation'); //NO I18n
}
function deleteServiceAssociation(serviceVendorId)
{
    var valid = confirm(getMessageForKey('ae.admin.vendor.serviceassociation.delete.confirmmessage'));//NO I18N
    if(valid)
    {
        param = "operation=deleteVendorAssociation&serviceVendorId="+serviceVendorId; //NO I18N
        callCustomAjaxRequest('/VendorServices.do', param, associateServiceOperation, ajaxRequestOnFailure, 'deleteVendorAssociation'); //NO I18n
    }
}
function associateServiceOperation(req, operation)
{
    //alert(req.responseText);
    var browser = navigator.appName;
    var xmlDoc;
    if (browser == "Netscape1")
    {
            xmlDoc = req.responseXML;
    }
    else if(browser == "Netscape")
    {
            xmlDoc = req.responseXML;
    }
    else
    {
        xmlDoc = req.responseXML.xml;
    }
    if(operation == 'showAssociatedServices')
    {
        jQuery('#associatedVendors').show();
        jQuery('#serviceDetails').hide();
        jQuery('#serviceAssociationSection').html(req.responseText);
    }
    if(operation == 'asssociateNewVendor' || operation == 'updateAssociatedVendor')
    {
        if(xmlDoc != null && xmlDoc != 'null' && xmlDoc !="")
        {
            var resultTag = xmlDoc.getElementsByTagName("result");//NO I18N
            var statusNodeValue = resultTag[0].childNodes[0].childNodes[0].nodeValue;
            var message = resultTag[0].childNodes[1].childNodes[0].nodeValue;
            if(statusNodeValue == '500')
            {
                jQuery('#errorMessageTag').html(message);
                ShowHide('operation_status');//NO I18N
            }
            else if(statusNodeValue == '200')
            {
                jQuery('#vendorService').val('-1');
                jQuery('#serviceCost').val('');
                jQuery('#taxRate').val('');
                jQuery('#serviceYears').va
                jQuery('#serviceMonths').val('0');
                jQuery('#supportVendor').val('-1');
                jQuery('#vendorComments').val('');
                if(operation == 'updateAssociatedVendor')
                {
                    message = getMessageForKey("sdp.admin.common.updatedsuccessfully");
                }
                else
                {
                    message = getMessageForKey("sdp.admin.common.addedsuccessfully");
                }
                refreshServiceVendorAssociationList();
                showSuccessMessageAndClose(null,message,2000);
            }
        }

    }
    if(operation == 'editVendorAssociation')
    {
        if(xmlDoc != null && xmlDoc != 'null' && xmlDoc !="")
        {
            showAssociateServicesFormTable();
            jQuery('#serviceVendorId').val(xmlDoc.getElementsByTagName("SERVICEVENDORID")[0].childNodes[0].nodeValue);
            jQuery('#serviceCost').val(xmlDoc.getElementsByTagName("SERVICECOST")[0].childNodes[0].nodeValue);
            if(xmlDoc.getElementsByTagName("TAXRATE")[0].childNodes[0] != undefined)
            {
                jQuery('#taxRate').val(xmlDoc.getElementsByTagName("TAXRATE")[0].childNodes[0].nodeValue);
            }
            if(xmlDoc.getElementsByTagName("SERVICEPERIODYEARS")[0].childNodes[0] != undefined)
            {
                jQuery('#serviceYears').val(xmlDoc.getElementsByTagName("SERVICEPERIODYEARS")[0].childNodes[0].nodeValue);
            }
            if(xmlDoc.getElementsByTagName("SERVICEPERIODMONTHS")[0].childNodes[0] != undefined)
            {
                jQuery('#serviceMonths').val(xmlDoc.getElementsByTagName("SERVICEPERIODMONTHS")[0].childNodes[0].nodeValue);
            }
            if(xmlDoc.getElementsByTagName("SUPPORTVENDORID")[0].childNodes[0] != undefined)
            {
                jQuery('#supportVendor').val(xmlDoc.getElementsByTagName("SUPPORTVENDORID")[0].childNodes[0].nodeValue);
            }
            if(xmlDoc.getElementsByTagName("COMMENTS")[0].childNodes[0] != undefined)
            {
                jQuery('#vendorComments').val((xmlDoc.getElementsByTagName("COMMENTS")[0].childNodes[0].nodeValue).replace(/<?\/?br>/g, "\n"));//No I18N
            }
            jQuery('#vendorService').append('<option value="'+xmlDoc.getElementsByTagName("SERVICEINFOID")[0].childNodes[0].nodeValue+'" selected="selected">'+encodeHTML(xmlDoc.getElementsByTagName("SERVICENAME")[0].childNodes[0].nodeValue)+'</option>');
        }
    }
    if(operation == 'deleteVendorAssociation')
    {
        var resultTag = xmlDoc.getElementsByTagName("result");//NO I18N
        var statusNodeValue = resultTag[0].childNodes[0].childNodes[0].nodeValue;
        var message = resultTag[0].childNodes[1].childNodes[0].nodeValue;
        if(statusNodeValue == '500')
        {
           jQuery('#errorMessageTag').html(message);
            ShowHide('operation_status');//NO I18N
        }
        else
        {
            message = getMessageForKey("sdp.admin.common.deletedsuccessfully");
            refreshServiceVendorAssociationList();
            showSuccessMessageAndClose(null,message,2000);
        }
    }
}

function showAssociateServicesFormTable()
{
    jQuery( "#associateServicesFormTable" ).slideDown( "slow", function() {//NO I18N
      // Animation complete.
    });
    jQuery('#associateServiceButton').hide();
}
function cancelAssociateServicesFormTable()
{
    jQuery('#vendorService').val('-1');
    jQuery('#serviceCost').val('');
    jQuery('#taxRate').val('');
    jQuery('#serviceYears').val('0');
    jQuery('#serviceMonths').val('0');
    jQuery('#supportVendor').val('-1');
    jQuery('#vendorComments').val('');
    jQuery( "#associateServicesFormTable" ).slideUp( "slow", function() {//NO I18N
      // Animation complete.
    });
    jQuery('#associateServiceButton').show();
}
function getResourceStateDetails(resourceStateId)
{
	var stateJSON = null;
	if(resourceStateId != null){
        sdpAjax({
		async : false,
		url : "/servlet/AssetApiServlet?module=getResourceStateDetails&resourceStateId="+resourceStateId,//NO I18N
		type : "GET",//NO I18N
		dataType : 'json',//NO I18N
		success : function(data)
		{
			stateJSON = data;
		}
	});
	}
	return stateJSON;
}
//For product and software cost decimal point limit validation.
function costValueRoundOf(element) {
    if(element.value.trim() == "" || isNaN(element.value)) {
        element.value = 0;
    }
    element.value = parseFloat(element.value).toFixed(sdp_app.MAX_ALLOWED_DECIMAL_POINTS);
    jQuery("#display_info_allowed_decimal").addClass("hide");
}
function costDecimalLimitInfo(element) {
    var value = element.value;
    if(value != "" && isDecimal(value) && value.indexOf(".") >= 0) {
        var intValue = value.split(".");
    if(intValue[1].length > sdp_app.MAX_ALLOWED_DECIMAL_POINTS){
        jQuery("#display_info_allowed_decimal").removeClass("hide");
    }else {
        jQuery("#display_info_allowed_decimal").addClass("hide");
    }
    }else {
        jQuery("#display_info_allowed_decimal").addClass("hide");
    }
}
function fillNetworkAndCredentialConfig(devTypeId,isSynch){
    if(devTypeId == "null" || devTypeId == -1)
    {
        jQuery("#agentMode").removeClass("show").addClass("hide");
        jQuery("#credentialDiv").removeClass("show").addClass("hide");
        jQuery("#ws-stype2").removeClass("show").addClass("hide");
        jQuery("#ws-stype3").removeClass("show").addClass("hide");
    }
    else if(jQuery('#opt'+devTypeId).html().indexOf("Windows", 0) != -1)
    {
        jQuery("#agentMode").removeClass("hide").addClass("show");
        jQuery("#credentialDiv").removeClass("show").addClass("hide");
        jQuery("#ws-stype2").removeClass("show").addClass("hide");
        jQuery("#ws-stype3").removeClass("show").addClass("hide");
    }
    else
    {
        jQuery("#agentMode").removeClass("show").addClass("hide");
        jQuery("#credentialDiv").removeClass("hide").addClass("show");
        jQuery("#tab2").prop("checked", true); //no i18n
        jQuery("#tab3").prop("checked", false);//no i18n
        jQuery("#ws-stype2").removeClass("hide").addClass("show");
        jQuery("#ws-stype3").removeClass("show").addClass("hide");
    }
    if(devTypeId != null && devTypeId != 'null' ){
        if(isSynch != undefined && isSynch == true){
            var requestOne = callSjaxRequest('/NodeDiscovery.do', 'action=getCredentialsList&deviceTypeId='+devTypeId);//no i18n
            try {
                if (requestOne.readyState == 4) {
                    if (requestOne.status == 200) {
                        fillCredentialOptions(requestOne);
                    }
                    else {
                        ajaxRequestOnFailure(requestOne);
                    }
                }
            }
            catch(e) {
                //Commenting the below alert to stop alerts in home page - 38802
                //alert("Error while fetching ajax response : " + e.message);
            }
        }else{
            callCustomAjaxRequest('/NodeDiscovery.do', 'action=getCredentialsList&deviceTypeId='+devTypeId, fillCredentialOptions, ajaxRequestOnFailure);//no i18n
        }
    }

}

function reloadAssetPage(page, wsId)
{
    var query = page.location.pathname;
    var search = page.location.search;
    if( (query.indexOf("ManualNodeAddition") > 0 && search.indexOf("save") > 0) || (query.indexOf("AssetDef") > 0 && search.indexOf("submit") > 0) ) {
        var url = '/ViewWSDetails.do?wsId=' + wsId + '&PORTALID=' + PORTALID;// No I18N
        page.location = url;
    } else {
        reloadPage(page);
    }
}
function bindEvents(startIndex, endIndex) {
    var $sortableElement = jQuery("#activities_table_colsort"); // Get newly added elements

    $sortableElement.sortable({
                placeholder: "ui-state-highlight",  //No I18N
                handle: '.ctl i',   //No I18N
                start: function(e, ui){
                    ui.placeholder.height(ui.item.height());
                },
                stop: function(e,ui){
                    var c_ele_checked = jQuery(ui.item).find('.colcheckbox').prop('checked') ? true : false;  //No I18N
                    var p_ele_checked = jQuery(ui.item).prev().find('.colcheckbox').prop('checked') ? true : false;  //No I18N
                    var n_ele_checked = jQuery(ui.item).next().find('.colcheckbox').prop('checked') ? true : false;  //No I18N
                },
                scrollSpeed : 10
            });

    $sortableElement.find('.colcheckbox').off('change').on('change', function(e) { // No I18N
        reOrderColChooser(this);
            });
            initTooltip();
            columnChooserSearchFilter();

    $sortableElement.off('click').on('click', function() { //No I18N
        $sortableElement.find("#search-input").val('').keyup();
                setTimeout(function() {
            $sortableElement.find("#search-input").focus(); // Focus Input Box
                }, 300);
            });

            // TO prevent implicit submission of form
    $sortableElement.find("#search-input").keypress(function(event) { //No I18N
                if (event.keyCode == 13) {
                    event.preventDefault();
                }
            });
    };

    //Reordering event will get triggered, when checkbox state is changed.
    function reOrderColChooser(chk_ele) {

        var _self = this;
    _self.maxAllowedFields = 50; // Maximum allowed fields for the server.
        var curr_ele = jQuery(chk_ele).closest('li'); // No I18N
    var c_len = jQuery("#activities_table_colsort").find(".colcheckbox:checked").length;
        var li_index = curr_ele.index();
    if (c_len > _self.maxAllowedFields) {
        showalert('failure', translate("api.max.limit.exceeded", [_self.maxAllowedFields]), "isAutoHide=false"); // No I18N
            jQuery(chk_ele).prop('checked',false);  // No I18N
            return;
        }
        if (jQuery(chk_ele).is(':checked')) {
            if (c_len === 1) {
            jQuery("#activities_table_colsort").prepend(curr_ele);
            } else {
            jQuery("#activities_table_colsort").find("li").eq(c_len - 2).after(curr_ele);
            }
        } else {
            if (c_len > 0 && li_index-1 !== c_len) {
            jQuery("#activities_table_colsort").find("li").eq(c_len).after(curr_ele);
            }
        }
    };

    function columnChooserSearchFilter (){

        // Prevent Hiding the dropdown when click
    jQ('[data-action-name="column_search"]').off('click').on('click', function(event) { //NO I18N
            event.stopPropagation();
        }).find(':input').on('keyup', function() {
            var _this = jQ(this);
            var searchString = _this.val();

            var btn = "";

                btn = _this.parents('.notfi-colchsr-menu');    //NO I18N


            var sortableElement = btn.find(".sortlist").sortable();
            var totalLi = btn.find(".sortlist li").length;
            // search all li items
            btn.find("ul.sortlist li:not(.noitem)").each(function(index, el) {

                if (jQ(this).text().toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
                    jQ(this).show().addClass('show');
                } else {
                    jQ(this).hide().removeClass('show');
                }
            });
            btn.find('.inputclear-icon').show(); // Show Clear Icon
            var showLength = btn.find('ul.sortlist li.show').length;
            if (showLength == 0) { // when No matches found
                btn.find('ul.sortlist li.noitem').removeClass('hidden'); // Show No item Found Message
            } else if (showLength == (totalLi)) {
                sortableElement.sortable("enable");  //NO I18N
                btn.find('ul.sortlist li.noitem').addClass('hidden');
                btn.find('ul.sortlist li .ctl i').css('visibility', '').end().find('.sdp-glyph-failure').hide() //NO I18N
            } else {
                btn.find('ul.sortlist li.noitem').addClass('hidden');
                btn.find('ul.sortlist li .ctl i').css('visibility', 'hidden'); //NO I18N
                sortableElement.sortable("disable"); //NO I18N
            }
    }).end().find('.sdp-glyph-failure').off('click').on('click', function(event) { //NO I18N
            event.preventDefault();
            var parEle = "";

                parEle = jQ(this).parents('.notfi-colchsr-menu');   //NO I18N
            parEle.find('ul.sortlist li.noitem').addClass('hidden');

            parEle.find('#search-input').val('').trigger('focus').trigger('keyup');

        });
    };

    function isDcRunningInHttps() {
    var isDcHttps = -1;
    sdpAjax({
        url: "/DCActions.do?action=getDcHttpsStatus", //No i18N
        success: function(response) {
            var callStatus = response.call_status;
            if(callStatus=="success"){
                isDcHttps = response.isDCHttps;
            }
            else{
                showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=true');  //No i18N
            }
       },
       failedCallBack: function() {
            showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=true');  //No i18N
       },
       async: false,
       ignorefailuremessage: false
    });
    return isDcHttps;
}
//This code should be removed after mickey client movement
jQuery(document).ready(function(){
    jQuery(document).on('click','#SWLicencedInstallationView_CCBtn',function(){
            setTimeout(function(){
            if(window.location.pathname != '/WorkOrder.do'){//No I18N
                    jQuery('#_DIALOG_LAYER').addClass('temp-digpos');
            }
            },100);
    });
});
//This code should be removed after mickey client movement

//this function used in asset old form(new/edit) page. can be removed once revamped
function showDescriptionRemainingCount(selector, maxLimit) {
    var description = jQuery(selector);
    var maxLimit = isNaN(maxLimit) ? 250 : maxLimit;

    if(!description.length) {
        return;
    }

    description.prop("maxlength", maxLimit);//No I18N
    description.parent().append("<div id='ast_desc_remng_cnt'><span id='ast_desc_remng_count'></span>" + getMessageForKey("sdp.admin.survey.title.charsremain") + "</div>");

    function toggle(canShow) {
        jQuery("#ast_desc_remng_cnt").css("visibility", canShow ? "visible" : "hidden");//No I18N
    }

    function updateCount() {
        toggle(true);
        jQuery("#ast_desc_remng_count").text((maxLimit - description.val().length) + " ");
    }

    description.on("focus input", function (e) {//No I18N
        updateCount();
    });

    description.on("blur", function (e) { //No I18N
        toggle(false);
    });

    toggle(false);
}
function addItemWithoutDuplicates(picklist,tf) {
    if(trim(tf.value) == "") {
        alert(getMessageForKey("sdp.admin.udf.emptystringjerror"));
        return false;
    }
    tf.value = tf.value.trim();
    var doExist = jQuery("select[name='" + picklist.name + "']").find('option').filter(function() {
            return jQuery(this).val().toLowerCase() === tf.value.toLowerCase();
        }).length > 0;

    if(doExist){
        alert(getMessageForKey("sdp.admin.common.exist.msg"));
        return false;
    }
    var NI = picklist.options.length++;
    picklist.options[NI]= new Option(tf.value, tf.value, true, false);
    //To display tooltip for larger text
    picklist.options[NI].title = encodeHTMLAttribute(tf.value);
    jQuery(picklist.options[NI]).attr('rel','uitip');
    initTooltip('#udfTextType table'); //NO I18N
    tf.value = "";
    return true;
}

function getUEMProdName(callServer, isAsync) {

	if(callServer || typeof uemProdNameJson === "undefined") {
		uemProdNameJson = JSON.parse("{\"uem_prod\":\"UEM Product\",\"uem_central\":\"Endpoint Central(formerly Desktop Central)\",\"uem_integ_prod\":\"Endpoint Central(formerly Desktop Central)\"}"); //NO I18N
		sdpAjax({
        url: "/servlet/AJaxServlet?action=getUEMProdName", //No i18N
        ignorefailuremessage : true,
        success: function(response) {
            uemProdNameJson = response;
            return uemProdNameJson;
       },
       async: isAsync,
      });
	}
	return uemProdNameJson;
}

function getUEMPluginProdName(uemProductName) {
    var uemPluginProdName = uemProductName;
    if(uemProductName === "Endpoint Central" || uemProductName === "Endpoint Central(formerly Desktop Central)") { //uem product name check
        uemPluginProdName = uemProductName + " and MDM"; //NO I18n
    }
    return uemPluginProdName;
}
function removeUserRestrictedFields(inputArr){
	var returnArr=[];
    sdpAjax({
		url: "/api/v3/users/metainfo", //NO I18N
		type: "GET", // No I18N
        ignorefailuremessage : true,
		success: function(resp) {
			var fields = resp.metainfo.fields;
			if(inputArr.length > 0) {
                for(i = 0; i < inputArr.length; i++) {
                    var f = inputArr[i];
                    if(fields.hasOwnProperty(f)) {
                        returnArr.push(inputArr[i]);
                    }
                }
            }
		},
		async: false
	});
	return returnArr;
}