/* $Id$ */

function showDomainListHelp()
{
    document.getElementById('showDomainDetails').style.display='block';// No I18N
}

function closeDomainList()
{
    document.getElementById('showDomainDetails').style.display='none';// No I18N
}

/* SAML CHANGES BEGINS */

/*
* SDPMSP Multiple IDP is supported.
* - IDP is discovered based on parameter values.
* - So SAML url might already have parameters.
* - Need to append params based on that.
*/
function loadSaml(url) {

	//All known usage already has this default value. Adding a default value in method for fail safe.
	if(url == undefined) {
		url = "/SamlRequestServlet";//NO I18N
	}

	if(url.indexOf("?") > 0) {
		url=url+"&";
	}else{
		url=url+"?";
	}
    if (document.referrer.includes("teams.microsoft.com")) {
        microsoftTeams.initialize(function () {
            microsoftTeams.authentication.authenticate({
                url: url + "popupAuth=true&inTeams=true",   // No I18N
                width: 750,
                height: 650,
                successCallback: function (result) {
                    window.location.reload();
                },
                failureCallback: function (reason) {
                    if(reason === "CancelledByUser") {
                        reason = "The authentication window was closed by the user"     // No I18N
                    }
                    var errorMsg = jQuery('#errorMsg');
                    errorMsg.find('span.msg').text(reason);
                    errorMsg.slideDown('slow');//NO I18N
                }
            });
        });
    } else if (window.location.href.includes("externalframe=true")) {   // No I18N
        NewWindow(url+"popupAuth=true", 'preferences', '750', '650', 'yes', 'center');
    } else {
    window.location.href=url;
    }
}

/* SAML CHANGES ENDS */
// SD-11880 to list domain name(s) for local authentication, When user login as Local Authentication.
function checkLocalAuth(domainname)
{
    // SD-11880 checking to list domain name(s) for the user login as local authentication
    if(document.login.domain.value=="Local Authentication")
    {
        loadLocalAuthDomainNameList();
		document.getElementById("AUTHRULE_NAME").value = "RememberMeLoginModule";//NO I18N
    } else if(document.login.domain.value==="LDAP") {////NO I18N
		document.getElementById("AUTHRULE_NAME").value = "LDAPLoginModule";//NO I18N
		document.getElementById("LocalAuthLabel").innerHTML = "";
        document.getElementById("LocalAuthdomainname").style.display="none";
	} else {
		document.getElementById("AUTHRULE_NAME").value = "SDRelationalLoginModule";//NO I18N
		document.getElementById("LocalAuthLabel").innerHTML = "";
        document.getElementById("LocalAuthdomainname").style.display="none";
    }
}
function loadEntireDomainNameList()
{
	if(document.login.dname.options.length > 1) //SD-67654 For Domain dropdown will not be shown if no domains available in the application.
    {
    var domainLabel=document.getElementById("LocalAuthLabel"); //NO I18N
    // domainLabel.innerHTML="<div class='pt10'><label class='domaininfo cursor-hand'><span> (?)</span>"+
    // "<div class='alert alert-info' role='alert'><span class='msg'>Username specified is available in more than one domain or not in any domain. Kindly select the appropriate Domain or \"Not in Domain\" from the list to login in</span></div></label></div>"; // No I18N
    document.getElementById("LocalAuthdomainname").style.display="block";
    document.forms.login.DomainCount.value = document.login.dname.options.length;
    // SD-104934 Login Page | 2 Domain Fields in firefox when credentials are saved
    // A very minute delay is required before initializing select2 and hence a timeout of 0 ms is used.
    setTimeout(function() {jQuery('select[name="dname"]').select2();}, 0);
 }
}
// SD-11880 Only for Local Authentication. Its listing domain name(s) from aaalogin table for the user to login as local authentication.
function loadLocalAuthDomainNameList()
{
    var reqName = document.login.j_username.value;
    //SD 59848 fix
    reqName=encodeURIComponent(reqName);
    //When domain is restricted from showing in login page, AJAX calls aren't called.
    enableDomainDropdown = document.login.enableDomainDropdown.value;
    if ((reqName!=null) && (enableDomainDropdown == 'true'))
    {
        var dte = new Date().getTime();
        url = "/domainServlet/AJaxDomainServlet?action=searchLocalAuthDomain&timestamp="+dte+"&search="+reqName; // No I18N
        if (window.XMLHttpRequest)
        {
            req = new XMLHttpRequest();
            if(req)
            {
                try
                {
                    // sd-11880 waiting process state to list domain name(s) for AD User to login as Local Authentication.
                    req.onreadystatechange = processStateForLocalAuthDomain;
                    req.open("GET", url, false);//NO I18N
                } catch (e)
                {
                    alert(e);
                }
                req.send(null);
            }
        }
        else if (window.ActiveXObject)
        {
            try
            {
                req = new ActiveXObject("Msxml2.XMLHTTP");//NO I18N
            }catch(e)
            {
                //alert("ee "+e);
                req = new ActiveXObject("Microsoft.XMLHTTP");//NO I18N
            }

            if (req)
            {
                // sd-11880 waiting process state to list domain name(s) for AD User to login as Local Authentication.
                req.onreadystatechange = processStateForLocalAuthDomain;
                try
                {
                    req.open("GET", url, false);//NO I18N
                }catch(e)
                {
                    alert(e);
                }
                req.send(null);
            }
        }
    }
}
// sd-11880 To list domain name(s) for local authentication.listing domain name(s) from aaalogin table based on login name. Only for local authentication.Following user can login with this 1. Not in Domain for manually added user. 2. AD imported user can login as local Authentication. 3. User can login as local authentication when user imported using Ad and domain name(s) is deleted in domaininfo.
function processStateForLocalAuthDomain()
{
    if (req.readyState == 4) // if value is 4, then it is Ready State.
    {
        if (req.status == 200) // if 200 - success , returned with a object.
        {
            var value = req.responseText;
            if(value === "showAllDomains")
            {
                loadEntireDomainNameList();
            }
            else
            {
            if ((value!='null') && (value!="Not in Domain"))//sd-11880 don't show for domain name(s) list when no domain for the user.
            {
                var domainList=value;
                var mytool_array=domainList.split("|");//NO I18N
                                //sd-11880 domain list does not show if only one domain for the user.
                if(mytool_array.length==1)
                {
                    domainLabel=document.getElementById("LocalAuthLabel");

                    domainLabel.innerHTML="<input type='hidden' name='dlabel' readonly='true' value='"+encodeHTML(mytool_array[0])+"'>"; // No I18N
                    var doname=document.getElementById("LocalAuthdomainname");
            doname.style.display="block";
                    doname.innerHTML="<input type='hidden' name='dname' readonly='true' value='"+encodeHTML(mytool_array[0])+"'>"; // No I18N
                    document.forms['login'].DomainCount.value=1;
                }
                else // sd-11880 listing domain when more than a domain for the user.
                {
                    domainLabel=document.getElementById("LocalAuthLabel"); //NO I18N
                    //sd-11880 label to identify the local authentication.
    //                 domainLabel.innerHTML="<div class='pt10'><label class='domaininfo cursor-hand'><span> (?)</span>"+
    // "<div class='alert alert-info' role='alert'><span class='msg'>Username specified is available in more than one domain or not in any domain. Kindly select the appropriate Domain or \"Not in Domain\" from the list to login in</span></div></label></div>"; // No I18N
                    var doname=document.getElementById("LocalAuthdomainname");
                    doname.style.display="block";
                    var innerHTMLContent="<div class='login-user-focus pt20'><div class='input-group'> <span class='input-group-addon email-label'><span class='login-globe1-icon'></span></span><select class='form-control' name='dname'>"; // No I18N
                    for (var pos=0;pos<mytool_array.length;pos++)
                    {

                        innerHTMLContent=innerHTMLContent+"<option value="+pos+">"+encodeHTML(mytool_array[pos])+"</option>"; // No I18N
                        document.forms['login'].DomainCount.value=pos+1;//NO I18N
                    }
                    doname.innerHTML=innerHTMLContent+"</select></div></div>"; //NO I18N
                    // SD-104934 Login Page | 2 Domain Fields in firefox when credentials are saved
                    // A very minute delay is required before initializing select2 and hence a timeout of 0 ms is used.
                    setTimeout(function() {jQuery('select[name="dname"]').select2();}, 0);
                }
            }
            else //sd-11880 to avoid For Domain list for local authentication when no domain for the user
            {
                document.forms['login'].DomainCount.value=0;
            }
        }
        }
        else
        {
            jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = "Error while fetching domain"; //No I18n
            jQuery('#errorMsg').slideDown('slow'); //NO I18n        alert("Error while fetching domain");//No I18n
        }
    }
}

function loadDomainListForADLogin(username)
{
    // sd-11880 Only login for AD Authentication. Here checking AD enable is true And dynamic user addition is false. Listing domain name(s) based on aaalogin,sduser,domaininfo and the domain should be public.
    var reqName = username.value;
    //SD-69151
    var enableDomainDropdown = document.getElementsByName('enableDomainDropdown')[0].value;
    //SD 59848 fix
    reqName=encodeURIComponent(reqName);
    //Ajax calls should be sent only when domain dropdown is enabled. SD-69151
    if ((enableDomainDropdown == 'true') && (reqName!=null) && (document.login.AdEnable.value=='true' || (isMSP && (document.login.LDAPEnable.value=='true'))) && (document.login.dynamicUserAddition_status.value=='false'))
    {
        var dte = new Date().getTime();
        url = "/domainServlet/AJaxDomainServlet?action=searchDomain&timestamp="+dte+"&search="+reqName;//NO I18N
        if (window.XMLHttpRequest)
        {
            req = new XMLHttpRequest();
            if(req)
            {
                try
                {
                    // sd-11880 waiting process state to list domain name(s) for AD User to login as AD authentication.
                    req.onreadystatechange = processStateADDomain;
                    req.open("GET", url, false);//NO I18N
                } catch (e)
                {
                    alert(e);
                }
                req.send(null);
            }
        }
        else if (window.ActiveXObject)
        {
            try
            {
                req = new ActiveXObject("Msxml2.XMLHTTP");//NO I18N
            }catch(e)
            {
                //alert("ee "+e);
                req = new ActiveXObject("Microsoft.XMLHTTP");//NO I18N
            }

            if (req)
            {
                // sd-11880 waiting process state to list domain name(s) for AD User to login as AD authentication
                req.onreadystatechange = processStateADDomain;
                try
                {
                    req.open("GET", url, false);//NO I18N
                }catch(e)
                {
                    alert(e);
                }
                req.send(null);
            }
        }
    }
    else
    {
        if ((document.login.AdEnable.value=='false') && (document.login.LDAPEnable.value=='false'))
        {
            // sd-11880 listing domain name(s) when AD enbable is false. to list domain name from aaalogin.
            loadLocalAuthDomainNameList()
        }
    }

}
//sd-11880 listing domain name(s) for AD Imported User login as AD Authentication.
//20776,20795
function processStateADDomain()
{
    if (req.readyState == 4)
    {
        if (req.status == 200)
        {
            var value = req.responseText;
            if ((value=='null'))
            {
                if (document.login.localAuthEnable.value=='true') // sd-11880 The user is not in AD. local authentication will be added to domain list to user to select Local Authentication.
                {
                    document.forms['login'].domain.options.length = 0;
                    document.forms['login'].domain.options[0] = new Option(document.getElementById("LocalAuthentication").innerHTML,"Local Authentication");//NO I18N
                    jQuery('select[name="domain"]').select2();
                    loadLocalAuthDomainNameList()
                }
                else
                {
                    // sd-11880 -Domain not Found- when the user is not imported By AD and The local authentication is false.
                    document.forms['login'].domain.options.length = 0;//NO I18N
                    document.forms['login'].domain.options[0] = new Option(document.getElementById("NoDomain").innerHTML,0);//No I18n
                    jQuery('select[name="domain"]').select2();
                }

            }
            else if(value!="showAllDomains") //SD 63193 fix
            {
                // sd-11880 listing domain name(s) for AD authentication.
                var domainList=value;
                var mytool_array=domainList.split("|");//NO I18N
                document.forms['login'].domain.options.length = 0;
                document.forms['login'].domain.options[0] = new Option(document.getElementById('choosedomaindiv').innerHTML,0);//NO I18N

                var bolNotInDomain=false;
                for (var pos=0;pos<mytool_array.length;pos++)
                {
                    if (mytool_array.length==1) //sd-11880 the choose domain will be overwritten by the domain name when only one domain for the user.
                    {
                        document.forms['login'].domain.options[pos] = new Option(mytool_array[pos],pos);//NO I18N
                    }
                    else
                    {
                        document.forms['login'].domain.options[pos+1] = new Option(mytool_array[pos],pos+1);//NO I18N
                    }
                    document.forms['login'].DomainCount.value=pos+1;//NO I18N
                }
                if(document.login.localAuthEnable.value=='true') //sd-11880 Local Authentication won't show when Local authentication is false.
                {
                    if (mytool_array.length==1)//sd-11880 the choose domain will be overwritten by the domain name when only one domain for the user.
                    {
                        document.forms['login'].domain.options[pos] = new Option(document.getElementById("LocalAuthentication").innerHTML,"Local Authentication");//NO I18N
                    }
                    else
                    {
                        document.forms['login'].domain.options[pos+1] = new Option(document.getElementById("LocalAuthentication").innerHTML,"Local Authentication");//NO I18N
                    }
                }
                jQuery('select[name="domain"]').select2();
            }


        }
        else
        {
            jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = "Error while fetching domain"; //No I18n
            jQuery('#errorMsg').slideDown('slow'); //NO I18n        alert("Error while fetching domain");//No I18n
        }
    }
}


function checkForNullInLogin(btn,form,pubKey)
{
    if(document.login.j_username.value == "" || document.login.j_password.value == "")
    {
        jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = document.getElementById("jserror").innerHTML;
        jQuery('#errorMsg').slideDown('slow'); //NO I18N
        if(document.login.j_username.value=="")
        {
            document.login.j_username.focus();
        }
        else
        {
            document.login.j_password.focus();
        }
        return false;
    }
	else if( document.login.captcha_text != undefined && document.login.captcha_text.value == "" )
	{
        jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = document.getElementById('empty_captcha').innerHTML;
        jQuery('#errorMsg').slideDown('slow'); //NO I18N
		document.login.captcha_text.focus();
		return false;
	}

    /*
     * Opertions to be performed for Domain List
     */

    /* SD-69151
     * When domain dropdown is disabled, another dropdown is shown to allow users to select the type of authentication.
     */
    if(document.login.enableDomainDropdown.value == 'false')
    {
        var domain = jQuery('#domain').html();
        if(!isMSP && document.getElementById('authtype') && "ldapauth" == document.getElementById("authtype").value)
        {
            createDomainNameForLogin("LDAP"); //No I18N
        }
        else
        {
            if("" != domain && domain != null)
            {
                document.login.username.value = document.login.username.value.substring(document.login.username.value.indexOf("\\") +1);
                createDomain_NameForLogin(domain);
		    /*
		     *  SDPMSP - Users from LDAP
		     *  - AAALogin.domain will contain LDAP domain, but SDP does not.
		     *  - Hence sending that domain for MSP alone.
		     */

                if(document.getElementById('authtype') && ("adauth" == document.getElementById("authtype").value
							|| (isMSP && ("ldapauth" == document.getElementById("authtype").value)))) //No I18N
                {
                    document.login.logonDomainName.value=domain;
                }
                else
                {
                    document.login.logonDomainName.value="Local Authentication"; //No I18N
                }
            }
            else
            {
                document.login.logonDomainName.value="Local Authentication"; //No I18N
            }

        }
    }
    else if (document.login.AdEnable.value=='true' || (isMSP && document.login.LDAPEnable.value == 'true'))
    {
        var domainList="";
        if (document.login.domain.value=="Local Authentication" || document.login.domain.value== "-- Choose Domain --") //No internationalization
        {
            domainList =document.login.domain.value ;
        }
        else
        {
            domainList = document.login.domain.options[document.login.domain.selectedIndex].text;
        }
        if((domainList!=""))
        {

            if((domainList == "") || (domainList==document.getElementById('choosedomaindiv').innerHTML) || (domainList=="-- Choose Domain --") || (domainList=="-Domain not Found-"))
            {
                jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = document.getElementById('choosedomaindiv').innerHTML;
                jQuery('#errorMsg').slideDown('slow'); //NO I18N
                document.login.domain.focus();
                return false;
            }
            var count=document.forms['login'].DomainCount.value;//NO I18N
        }
        // sd-11880 To login AD user. Domain_name is created when the user choose domain name. not in domain for login as local authentication.
        var domainvalue="";
        if (document.login.domain.value=="Local Authentication")
        {
            domainvalue =document.login.domain.value ;
        }
        else
        {
            domainvalue = document.login.domain.options[document.login.domain.value].text;
        }
        document.login.logonDomainName.value=domainvalue;
        //sd-11880 The domain list will be overwritten when dynamic user addition is false.
        if (document.login.dynamicUserAddition_status.value=='false')
        {
            if ((domainvalue!="Local Authentication")) //sd-11880 The user can login as AD authentication.
            {
                createDomain_NameForLogin(domainvalue);
                document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
                document.forms['login'].LocalAuth.value="No";//NO I18N
            }
            else
            {
                // sd-11880 The user can login as local authentication.
                var count=document.forms['login'].DomainCount.value;//NO I18N
                if(count != 0)          //SD-72857
                {
                    document.forms['login'].LocalAuth.value="yes";//NO I18N
                    if(count==1)
                    {
                        domainvalue=document.login.dname.value;

                    }
                    else
                    {
                        domainvalue=document.login.dname.options[document.login.dname.value].text;

                    }

                    //if (domainvalue!="Not in Domain")//sd-11880 No need to create domain_name for manually added user. if Not in domain shows in domain list, it means the user is added by manually.
                    //{
                    createDomain_NameForLogin(domainvalue);
                    document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
                    //}
                }

            }
        }
        else
        {

            //sd-11880 Here domain name(s) added in domain list when Login.jsp is created. The user can login with AD authentication as well as local authenticaion.
            if(domainvalue!='Local Authentication') // sd-11880 When user login with AD Authentication.
            {
                createDomain_NameForLogin(domainvalue);
                document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
                document.forms['login'].LocalAuth.value='No';//NO I18N
            }
            else //sd-11880 When user login as local authentication.
            {

                var count=document.forms['login'].DomainCount.value;//NO I18N

                if (count!=0)
                {
                    if(count==1)
                    {
                        domainvalue=document.login.dname.value;
                    }
                    else
                    {
                        domainvalue=document.login.dname.options[document.login.dname.value].text;
                    }

                    createDomain_NameForLogin(domainvalue);
                    document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
                    document.forms['login'].LocalAuth.value='No';//NO I18N
                }
            }
        }
    }
    //20405 unable to login via local authentication, if LDAP is enabled and also AD is imported.
    else if(document.login.LDAPEnable.value == 'true')
    {
        var domainList = document.login.domain.value;
        if(domainList == "-- Choose Domain --" || domainList == "")
        {
            jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = document.getElementById('choosedomaindiv').innerHTML;
            jQuery('#errorMsg').slideDown('slow'); //NO I18N
            return false;
        }
        var count=document.forms['login'].DomainCount.value;//NO I18N
        if (count!=0)
        {
            if(count==1)
            {
                domainvalue=document.login.dname.value;
            }
            else
            {
                domainvalue=document.login.dname.options[document.login.dname.value].text;
            }
            createDomain_NameForLogin(domainvalue);
            document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
            document.forms['login'].LocalAuth.value='No';//NO I18N
        }
    }
    else//sd-11880 only for local authentication.
    {
        var count=document.forms['login'].DomainCount.value;//NO I18N
        if (count!=0)
        {

            if(count==1)
            {
                domainvalue=document.login.dname.value;
            }
            else
            {
                domainvalue=document.login.dname.options[document.login.dname.value].text;
            }
            createDomain_NameForLogin(domainvalue);
            document.forms['login'].LocalAuthWithDomain.value=domainvalue;//NO I18N
            document.forms['login'].LocalAuth.value='No';//NO I18N
        }
    }

    //setting the value of AUTHRULE_NAME which is used PamImpl.Validate() method
    //sd-88035 Issues Faced While doing Local Authentication If LDAP/AD Authentication was enabled
    /*
     * SCP Supports OTP based login instead of password.
     * - Related Extensions are done in RememberMeLoginModule.
     * - Hence, using RememberMeLoginModule is user has selected OTPLogin.
     */
    if(isSCP && document.getElementsByName("OTPLogin")[0]!=undefined && document.getElementsByName("OTPLogin")[0].value=='true') {
        document.getElementById("AUTHRULE_NAME").value="RememberMeLoginModule";//No I18N
    } else if(document.login.AdEnable.value==='true') {
    	//#89377 6236414 Cannot login using AD Authentication after Upgrade
		if(document.login.domain != undefined && document.login.domain.value != 'Local Authentication')
		{
			document.getElementById("AUTHRULE_NAME").value="SDRelationalLoginModule";//No I18N
		}
		else if(document.getElementById("authtype") != null && document.getElementById("authtype").value != 'localauth')
		{
			document.getElementById("AUTHRULE_NAME").value="SDRelationalLoginModule";//No I18N
		}
    } else if(document.login.LDAPEnable.value === 'true') {

    	if(document.login.domain != undefined && document.login.domain.value != 'Local Authentication')
		{
    		document.getElementById("AUTHRULE_NAME").value="LDAPLoginModule";//No I18N
		}
		else if(document.getElementById("authtype") != null && document.getElementById("authtype").value != 'localauth')
		{
			document.getElementById("AUTHRULE_NAME").value="LDAPLoginModule";//No I18N
		}

    } else {
        document.getElementById("AUTHRULE_NAME").value="RememberMeLoginModule";//No I18N
    }
    /* ## To convert username to lowercase ## */
    document.login.username.value=document.login.username.value.toLowerCase();
    setTimeout(function(){jQuery(btn).button('loading');},10);
    if(pubKey != null) {
        encryptPassword(pubKey);
    }
    return true;
}


function loadLoginAndEncryptPassword(uName, pwd, domain, publicKey)
{
    if( uName != null && uName != "" )
    {
        document.login.checkbox.checked=false;
        document.login.j_username.value=uName;
        document.login.j_password.value=pwd;
	if(publicKey != null) {
            encryptPassword(publicKey);
	}
        if( domain != null && domain != "-" )
        {
            createDomain_NameForLogin(domain);
        }
        document.login.checkbox.checked=true;
        document.login.submit();
    }
    else
    {
	//SD-66008 Login page landing issue in SSO fixed.
        //document.getElementById("loginDiv").style.display="table";//NO I18N
        document.login.j_username.focus();
    }
}

// sd-11880 DOMAIN_NAME will be created for AD authentication and local authentication with domain based. No need to create the domain_name object for user added by manually.
function createDomain_NameForLogin(domainvalue)
{
    if(domainvalue != null && domainvalue == 'Not in Domain')//NO I18N
    {
        domainvalue = "-";//NO I18N
    }
    var doname=document.getElementById("domainname");
    var DOMAINNAME=document.createElement("input");
    DOMAINNAME.setAttribute("name","DOMAIN_NAME");//NO I18N
    DOMAINNAME.setAttribute("type","hidden");//NO I18N
    DOMAINNAME.setAttribute("value",domainvalue);//NO I18N
    doname.appendChild(DOMAINNAME);
}

function hideLoginInfo() {
    jQuery.ajax({type: 'GET', url: '/domainServlet/AJaxDomainServlet?action=hideLoginDetails',contentType: 'application/json; charset=utf-8', dataType: 'text', //NO I18N
   success: function(result) {
                jQuery('#login-info').slideUp('slow'); //NO I18N
            }
        });
}

function loadLogin(username, junkVal, domainname, publicKey) {
    loadLoginAndEncryptPassword(username, junkVal, domainname, publicKey);
    domainList = document.login.domain;
    if(domainList!=null) {
        var domainCount = domainList.length;
        //if(domainCount <=3 && domainCount > 1) {
        if(domainCount <=3 && domainCount > 1) {
            domainList[1].selected = true;
            //SD 63711 fix - Hide domain list when only 1 domain present with Local Authentication disabled
            if(domainCount==2){
                hideDomainList();
            }
        }
        else {
            var cookieDomain = document.login.domain.selectedIndex;
            if(cookieDomain != 0 && loginError != "true"){
               hideDomainList();
            }
        }
    }
}

function hideShowDomainList() {
    if(document.getElementById("domainListSelect").style.display=="block") {
        hideDomainList();
    }
    else {
        showDomainList();
    }
}

function hideDomainList() {
    var selectedDomain = document.login.domain.selectedIndex;
    document.getElementById("domainListText").style.display="none";//NO I18N
    //document.getElementById("domainListBlankText").style.display="block";//NO I18N

    document.getElementById("domainListSelect").style.display="none";//NO I18N
    document.getElementById("domainListBlankSelect").style.display="block";//NO I18N

    var optionMsg = document.getElementById("moreOptionsMsg").innerHTML + " &gt;";//NO I18N
    document.getElementById("optionMsg").innerHTML = optionMsg;//NO I18N
}

function showDomainList() {
    document.getElementById("domainListText").style.display="block";//NO I18N
    //document.getElementById("domainListBlankText").style.display="none";//NO I18N

    document.getElementById("domainListSelect").style.display="block";//NO I18N
    document.getElementById("domainListBlankSelect").style.display="none";//NO I18N

    var optionMsg ="&lt; " +  document.getElementById("moreOptionsMsg").innerHTML;//NO I18N
    document.getElementById("optionMsg").innerHTML = optionMsg;
}

function ShowHide(divId) {
    var id = document.getElementById(divId);
    if (id.style.display == "none") {
        id.style.display = '';//NO I18N
    }
    else {
        id.style.display = 'none';//NO I18N
    }
}

function getCustomHtml(login_logo,prodName,prodLink,prodVersion,cssClass){
	var portalLoginPageDetails = {};   // variable introduced for MSP/SCP
    // login_Url introduced to modify the URL for MSP/SCP
	var login_Url = '/custom/login/Login.html'; //No I18N
	if(isMSP){
		login_Url = '/accLogin/MSPAccountLoginServlet?loginAccId='+loginAccId;
	}
    else if(isSCP && loginPortalId != -1)
    {
        portalLoginPageDetails = $.ajax({
            url: '/sd/portalServlet/AjaxPortalServlet?action=getCXPortalLoginDetails&portalId='+loginPortalId,  // No I18N
        async: false,
        dataType: 'html',//No I18N
        type: 'GET',//No I18N
        cache:false,
        success: function(response) {
                return response;
            }
        });
        portalLoginPageDetails = JSON.parse(portalLoginPageDetails.responseText);

        if(portalLoginPageDetails.is_portal_accessible && portalLoginPageDetails.is_enabled){
        	login_Url = '/sd/portalServlet/AjaxPortalServlet?action=getPortalHtml&portalId='+encodeURIComponent(loginPortalId); // No I18N
        }
    }

    $.ajax({
		url: login_Url,
        async: false,
        dataType: 'html',//No I18N
        type: 'GET',//No I18N
        cache:false,
        success: function(response) {
        	if(isSCP && loginPortalId != -1 && portalLoginPageDetails.is_portal_accessible && portalLoginPageDetails.is_enabled)
            {
                var keys = Object.keys(portalLoginPageDetails);
                for(var i=0; i<keys.length; i++){
                   var key = keys[i];
                    var placeHolder = "{{"+key+"}}";
                    if (response.indexOf(placeHolder) !== -1) {
                       response = response.replace(placeHolder, portalLoginPageDetails[key]);
                     }
                }
            }

            if (cssClass == "display:none") {
                window.onload(function() {
                    jQuery('html').css('background', '');
                });
            }
            var newDiv = $('<div></div>');
            var outerResponse = $('<div id="login_form" style="'+cssClass+'"></div>');

            if(response.indexOf("{{login_image}}") !== -1){
                var loginImage = '<img src="' + login_logo + '" class="log-logo" title="' + encodeHTMLAttribute(prodName) +'">';
                response = response.replace(/{{login_image}}/g,loginImage);
            }
            if (response.indexOf("{{copyright_year}}") !== -1) {
                var dateObj = new Date();
                response = response.replace(/{{copyright_year}}/g, (dateObj).getFullYear());
            }
            outerResponse.html(response);


            var prodNameAndLinkElement = $(outerResponse).find('[name="productDetails"]');
            if(prodNameAndLinkElement.length >0){
                prodNameAndLinkElement.attr({
                    href: prodLink,
                    title: prodName
                });
                if (response.indexOf("{{product_name}}") === -1 && response.indexOf("{{product_version}}") === -1) {
                    prodNameAndLinkElement.html(prodName + " &nbsp; " + prodVersion);
                } else {
                    if (response.indexOf("{{product_version}}") !== -1) {
                        prodNameAndLinkElement.html((prodNameAndLinkElement.html()).replace(/{{product_version}}/g, "") + prodVersion);
                    }
                    if (response.indexOf("{{product_name}}") !== -1) {
                        prodNameAndLinkElement.html((prodNameAndLinkElement.html()).replace(/{{product_name}}/g, prodName));
                    }
                }
            }else{
                if (response.indexOf("{{product_name}}") !== -1) {
                    response = response.replace(/{{product_name}}/g, prodName);
                }
                if (response.indexOf("{{product_version}}") !== -1) {
                    response = response.replace(/{{product_version}}/g, prodVersion);
                }
                outerResponse.html(response);
            }

            newDiv.html(outerResponse);
            $html = newDiv.html();
             const isAppStarted = jQuery("#changePasswordDiv").length > 0 || isServiceStarted();
            if($html.indexOf("{{login_form}}") !== -1){
                // SD-88953 Login Page Customization for SAML/SSO
                var divSelectRegex = new RegExp('{{[\\s\\S]*}}', 'g');
                var str = "";
                if(!isAppStarted) {
                    str = "<div id=\"login-section1\" class=\"login-section loginform\">" + '<div id="loading-form" class="tc"><img style="width:70px;height:auto;object-fit:contain;margin-top:20px;" src="../images/aplus-load.gif"><p style="padding: 10px 30px 50px 30px; line-height: 20px">Please wait while we make everything<br>perfect for you..</p></div>' + "</div>";
                }
                else {
                    str = "<div id=\"login-section1\" class=\"login-section loginform\">" + $html.match(divSelectRegex)[0] + "</div>";
                }
                $html = $html.replace(divSelectRegex, str);
                var mapping = {
                    '{{login_form}}': '#login-form',    // No I18N
                    '{{saml_div}}': '#saml-div',    // No I18N
                    '{{oauth_div}}': '#oauth-div',    // No I18N
                    '{{or_div}}': '#or-div',    // No I18N
                    '{{error_div}}': '#message',    // No I18N
                    '{{login_info}}': '#login-info'     // No I18N
                };
                for (var key in mapping) {
                    if ($html.indexOf(key) !== -1) {
                        var val = mapping[key];
                        var div = $("#tempLoginFormDiv").find(val)[0];
                        $html = $html.replace(new RegExp(key, 'g'), div === undefined ? "" : div.outerHTML);
                    }
                }
                $("#tempLoginFormDiv").remove();
                $("#loginFormDiv").before($html);
            }else{
                $('#loginFormDiv').html(newDiv.html());
                newDiv.remove();
                replaceLoginFormData(isAppStarted);
            }
            $login.loadOAuthSection();
        }
    });

}

function replaceLoginFormData(isAppStarted){

    //if the element id "loginFormDiv" is available
    if($("#loginFormDiv").length){
        if(!isAppStarted) {
            $('#loginFormDiv').html('<div id="loading-form" class="tc"><img style="width:70px;height:auto;object-fit:contain;margin-top:20px;" src="../images/aplus-load.gif"><p style="padding: 10px 30px 50px 30px; line-height: 20px">Please wait while we make everything<br>perfect for you..</p></div>');
        }
        else {
            $("#loginFormDiv").html($("#tempLoginFormDiv").html());
        }
        $("#tempLoginFormDiv").remove();
    }else{
    //if the element id "loginFormDiv" is not available then the form is loaded in the centre of the page
        var formElement = $('[name="login"]');
        formElement.attr("class","alignpagecenter");
        var htmlAndFormContent = $('#loginFormDiv').html() + $("#tempLoginFormDiv").html();
        if(!isAppStarted) {
            $('#loginFormDiv').html('<div id="loading-form" class="tc"><img style="width:70px;height:auto;object-fit:contain;margin-top:20px;" src="../images/aplus-load.gif"><p style="padding: 10px 30px 50px 30px; line-height: 20px">Please wait while we make everything<br>perfect for you..</p></div>');
        }
        else {
            $("#loginFormDiv").html(htmlAndFormContent);
        }
        $("#tempLoginFormDiv").remove();
    }
}

function isServiceStarted() {
    var is_service_started = false;
    $.ajax({
        url: "/servlet/AuthenticationServlet?action=isServiceStarted",
        async: false,
        type: 'GET',//No I18N
        success: function(response) {
            is_service_started = response.result.is_service_started;
        }
    });
    return is_service_started;

}


function LoginAs(user)
{
    // var elementID = this.attr('id');
    if(user == "admin")
    {
        if($('#adminuser').length)
        {
            document.login.j_username.value = $('#adminuser').val();
            jQuery('#username').trigger('change');
            document.login.j_password.value = $('#adminuser').val();
            if(noDomain())
            {
                jQuery('#loginSDPage').trigger('click');
            }
            else
            {
                jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = jQuery("#choosedomaindiv").text();
                jQuery('#errorMsg').slideDown('slow');
            }
        }
        else
        {
            document.login.j_username.value = "administrator";
            jQuery('#username').trigger('change');
            jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = "Enter your InstanceID as password";
            jQuery('#errorMsg').slideDown('slow');
            document.login.j_password.focus();
        }
    }
    else if(user == "guest")
    {
        if($('#guestuser').length)
        {
            document.login.j_username.value = $('#guestuser').val();
            jQuery('#username').trigger('change');
            document.login.j_password.value = $('#guestuser').val();
            if(noDomain())
            {
                jQuery('#loginSDPage').trigger('click');
            }
            else
            {
                jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = jQuery("#choosedomaindiv").text();
                jQuery('#errorMsg').slideDown('slow');
            }
        }
        else
        {
            document.login.j_username.value = "guest";
            jQuery('#username').trigger('change');
            jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = "Enter your InstanceID as password";
            jQuery('#errorMsg').slideDown('slow');
            document.login.j_password.focus();
        }
    }
}
function noDomain()
{
    var localDomain = "none";
   if($('#LocalAuthdomainname').length > 0)
   {
       localDomain = $('#LocalAuthdomainname').css('display');
       dname = $(document.forms.login.dname).css('display');
   }
   var Domain = "none"
   if($('#domainListSelect').length > 0)
   {
       Domain = $('#domainListSelect').css('display');
   }
   if(Domain === 'block')
   {
        return false;
   }
   if(localDomain === 'block')
   {
        if(dname === 'none')
        {
            return true;
        }
        return false;
   }

    return true;
}
//SD-69151
function userNameKeyUp(event)
{
    var domainName = jQuery("#username").val();
    var index = domainName.indexOf("\\");
    if(index > 0)
    {
        var str = domainName.substring(0, index);//NO I18N
        jQuery('#domainLabel').show();
        jQuery('#domain').html(encodeHTML(str.toUpperCase()));
        jQuery('#keepme').removeClass('pt15');
    }
    else
    {
        jQuery('#domainLabel').hide();
        jQuery('#keepme').addClass('pt15');
    }
}

function createDomainNameForLogin(domainValue)
{
    var doname=document.getElementById("domainname");
    var DOMAINNAME=document.createElement("input");
    DOMAINNAME.setAttribute("name","domain");//NO I18N
    DOMAINNAME.setAttribute("type","hidden");//NO I18N
    DOMAINNAME.setAttribute("value",domainValue);//NO I18N
    doname.appendChild(DOMAINNAME);
}

//OTP Login is disabled for SDP by default
function generateOTP() {
	var loginName=jQuery("#username").val().toLowerCase();
    sdpAjax({
            url: "/servlet/AuthenticationServlet?action=generateOTP&loginName="+encodeURIComponent(loginName), //NO I18N
            ignorefailuremessage: true,
            success: function(result) {
            	if(result.message!=undefined){
					jQuery('#successMsg').find('span[class="msg"]')[0].innerHTML = encodeHTML(result.message);
					jQuery('#successMsg').slideDown('slow'); //NO I18N
					jQuery('#loginFormTable').append('<input type="hidden" name="OTPLogin" value="true" />');
				}else{
					jQuery('#errorMsg').find('span[class="msg"]')[0].innerHTML = encodeHTML(result.failure);
					jQuery('#errorMsg').slideDown('slow'); //NO I18N
				}
            }
        });
}

//START - Clear text password encryption using RSA algorithm.
function encryptPassword(pubKey) {
    var plainPassword = document.login.j_password.value;
    var publicKey = '-----BEGIN PUBLIC KEY-----'+pubKey+'-----END PUBLIC KEY-----';//NO I18N
	var pkey = forge.pki.publicKeyFromPem( publicKey )
    let utf8_encoded_data=forge.util.encodeUtf8(plainPassword)
     var enc = pkey.encrypt( utf8_encoded_data, 'RSA-OAEP',//NO I18N
     {
         md : forge.md.sha256.create(),
         mgf1: { md:forge.md.sha256.create()}
     });
     var encryptedPwd = forge.util.encode64(enc);
    document.login.j_password.value = encryptedPwd;
}
//END - Clear text password encryption using RSA algorithm.

/* issuefix 92411 */

function getCookie(key) {
    var name = key + "=";
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if(cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function onForgotPasswordClick() {
    var username = jQuery("#username").val();
    window.location.href = '/jsp/ForgotPassword.jsp' + (!username.trim().length == 0 ? ('?username=' + encodeURIComponent(username)) : "");
}

function focusUsername(){
    setTimeout(function () {
        document.getElementById("username").focus();
    }, 500);
}
