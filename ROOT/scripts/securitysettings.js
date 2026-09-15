//$Id$

allowed_values = null;

isSDP = false;

isOutgoingMailServerConfigured = false;

isESMDirectory = false;

var storedUserFields;

/*
 * This method is ued to load security settings page.
 * */
function loadSecuritySettings(product, isConfigured, isESMDir)
{
	isSDP = product;
	isOutgoingMailServerConfigured = isConfigured;
	isESMDirectory = ( isESMDir === 'true' );
	window.name="securitysettings";
	loadmeadmin();
	getSecuritySettingsData();
	selectDomainDropDown(); //SD-69151
	// invoking security settings donut
    	jQuery('#donutSecuritySettings').progressDonutBar();
    	jQuery("#http").on('click', function() 
     	{
        	 showHTTPWarning();       
     	});
 }
 
function showHTTPWarning()
{
     showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate('sdp.admin.warning.httpstohttp') + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + 		translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(proceed) {//NO I18N
 	
         if(proceed)
         {
             jQuery('#http').prop('checked', true);  //NO I18N
         }
         else
         {
             jQuery('#https').prop('checked', true);  //NO I18N
         }
     });
}
//Onload trigger methods

function securitySettingsOnloadEvents(){
	jQuery("#enableAV").on('change', function(){
		if( jQuery('#enableAV').is(':checked') )
		{
			jQuery('#avConfig').show();
		}
		else
		{
			jQuery('#avConfig').hide();
		}
	})
	jQuery("input[name=mode]").on('change', function(){
		if( this.id == 'http' )
		{
			jQuery('#ciphersAndTls').hide();
		}
		else if( this.id == 'https' )
		{
			jQuery('#ciphersAndTls').show();
		}
	});

jQuery("#enableKeepMeSign").on('change',function() {
		if( jQuery(this).is(":checked") )
		{
			jQuery("#noOfExpireDays").removeAttr("disabled");//NO I18N
			jQuery('#keepMeConfig').show();//NO I18N
		}
		else
		{
			jQuery("#noOfExpireDays").attr("disabled", "");
			jQuery('#keepMeConfig').hide();//NO I18N
		}
	});
	
jQuery('#disableThrottles').change(function(){
	  	if(!jQuery(this).is(":checked")){
			jQuery('#disableThrottleFilter').hide();
		}
		else{
			jQuery('#disableThrottleFilter').show();
		}
	});

jQuery("#enableLockAcc").on('change', function() {
		if( jQuery(this).is(":checked") )
		{
			jQuery("#noOfAttempt").prop("disabled", false);//NO I18N
			jQuery("#unlockTime").prop("disabled", false);//NO I18N
			jQuery('#badLoginConfig').show();//NO I18N
			jQuery('#accountLockedLink').show();//NO I18N
			jQuery("#IPBasedLock").prop("disabled", false);//NO I18N
			jQuery("#UserBasedLock").prop("disabled", false);//NO I18N
		}
		else
		{
			jQuery("#noOfAttempt").prop("disabled", false); //NO I18N
			jQuery("#unlockTime").prop("disabled", false); //NO I18N
			jQuery('#badLoginConfig').hide();//NO I18N
			jQuery('#accountLockedLink').hide();//NO I18N
			jQuery("#IPBasedLock").prop("disabled", false); //NO I18N
			jQuery("#UserBasedLock").prop("disabled", false); //NO I18N
		}
	});

	jQuery("#enableSecureAttach").on('change',function() {
		if( jQuery(this).is(":checked") ) {
			jQuery('#secureAttachConfig').show();//NO I18N
			if( jQuery("#securePwd").val() == "" ) {
				enableResetSecurePwd();
			}
		} else {
			jQuery('#secureAttachConfig').hide();//NO I18N
		}
	});

	jQuery("#securePwd").on('input', function(){
		if( jQuery(this).val() != '' ) {
			jQuery(this).parent().removeClass('has-error').children('div[id=normalbubbletooltip]').remove();//NO I18N
		}
	});

	jQuery("#enableSecurityHeaders").on('change',function() {

		if( jQuery(this).is(":checked") )
		{
			if( jQuery("#securityHeaders div[id^=responseHeader_]").length == 0 )
			{
				createNewHeader(allowed_values.response_headers);
			}

			jQuery("#securityHeaders div[id^=responseHeader_]").show();
		}
		else
		{
			jQuery("#securityHeaders div[id^=responseHeader_]").hide();
		}
	});

	jQuery('#securityHeaders input[type=text]').on('focus', function(){
		jQuery(this).attr('data-action', 'validateHeaderValue');
	});

	jQuery('#securityHeaders input[type=text]').on('keypress', function(){
		jQuery(this).attr('data-action', 'validateHeaderValue');
	});

	jQuery("#saveSS").on('click', function()
	{
		if(jQuery( "#password-policy" ).hasClass( "active"))
        {
            submitPWDData();
        }else
        {
			showHttpConfirm();
		}
	});
	jQuery('#domainDropDown').on('change', function(){selectDomainDropDown()});
	
	jQuery("#notifyTo").on("change", function(e){
		if( e.removed )
		{
			var element = e.removed.element[0];

			if( jQuery(element).attr("isinvalid") )
			{
				element.remove();
			}
		}
	});
}
//Get security settings fields data from server.
function getSecuritySettingsData()
{
	var result;

	if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
	{
		result = sdpAjax({type: 'GET', url: '/api/v3/security_settings',data : encodeURI('INPUT_DATA={"include":["allowed_values"]}'), contentType: 'application/json', mimetype: "text/json", dataType:'json', cache: false, async: false}).responseText;//NO I18N
	}
	else if( !isESMDirectory )
	{
		result = sdpAjax({type: 'GET', url: '/api/v3/security_settings', contentType: 'application/json', mimetype: "text/json", dataType:'json', cache: false, async: false}).responseText;//NO I18N
	}

	var json = JSON.parse(result);

	if( json && json.security_settings )
	{
		var ssData = json.security_settings;

		if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
		{
			var isDomainSearchEnabled = false;

			var isDomainDropDownEnabled = false;

			var noOfAttempt = 0;

			var unlockTime = 0;

			var lockedMessage = "";

			var emailNotify = false;

			var technicianSpaceNotify = false;

			var isHttpMode = true;

			var webPort = 0;
			
			var isUserBasedLock = false;
			
			var noOfExpireDays = 45;
		
			var isForgotPasswordEnabled = true;

		    var disableConcurrentLogin = false;
		    
		    var removeExifMetadata = false;
			
			var disableThrottles = false;

			var enablePushNotificationForURLAccessViolation = false;

			var ssFieldsVsValue = { disableClipboardContentOnPasswordFields : false, disableDataCompression:false };
			var ssFields = Object.keys(ssFieldsVsValue);
			for (var i = 0; i < ssFields.length; i++) {
				var ssField = ssFields[i];
				ssFieldsVsValue[ssField] = ssData[ssField];
			}

			jQuery("#sessionTimeout").val(ssData.inactive_session_timeout);

			if( json.allowed_values && ssData.response_headers )
			{
				this.allowed_values = json.allowed_values;

				populateSecurityHeaders(allowed_values, ssData.response_headers);
			}
			if (ssData.fetch_user_domain_inlogin_page && ssData.fetch_user_domain_inlogin_page == "yes") {
				isDomainSearchEnabled = true;
			}
			if (ssData.enable_domain_dropdown && ssData.enable_domain_dropdown == "yes") {
				isDomainDropDownEnabled = true;
			}

			if( ssData.bad_login_configuration )
			{
				var badLoginConfig = ssData.bad_login_configuration;

				var strAttempt = badLoginConfig.no_of_bad_login_allowed;

				var strTime = badLoginConfig.auto_unlock_interval_time;

				if( strAttempt != "null" && strTime != "null" )
				{
					noOfAttempt = parseInt(strAttempt);

					unlockTime = parseInt(strTime);

				}
				
				if( badLoginConfig.isUserBasedLock )
				{
					isUserBasedLock = true;
				}
				
				lockedMessage = badLoginConfig.message_for_locked_account;

				if( badLoginConfig.email_notify == 'yes' )
				{
					emailNotify = true;
				}

				if( badLoginConfig.technician_space_notify == 'yes' )
				{
					technicianSpaceNotify = true;
				}

				var allowed_technician = allowed_values.notify_technician_list;

				var notify_technician_list = badLoginConfig.notify_locked_account_to;

				populateNotificationTechnician(allowed_technician, notify_technician_list);
			}
			if( ssData.server_configuration )
			{
				var protocolConfig = ssData.server_configuration;

				var strPort = protocolConfig.port;

				var strMode = protocolConfig.protocol;

				if( strPort != null && strMode != null )
				{
					webPort = parseInt(strPort);

					if( strMode == "https" )
					{
						isHttpMode = false;
					}
				}
			}
			if( ssData.enable_keep_me_sign )
			{
				noOfExpireDays = parseInt(ssData.rememberme_expiry_date);
			}
	        isForgotPasswordEnabled =  ssData.enable_forgot_password;
	
			if(ssData.disableConcurrentLogin=="true") 
			{
				disableConcurrentLogin = true;
			}
			
			if(ssData.removeExifMetadata=="true")
			{
				removeExifMetadata = true;
			}
			
			if(!(ssData.disableThrottles=="true"))
			{
				disableThrottles = true;
			}

			if(ssData.enablePushNotificationForURLAccessViolation=="true") 
			{
				enablePushNotificationForURLAccessViolation = true;
			}

			if( !isHttpMode )
			{
				jQuery('#isSelfSigned').val(ssData.server_configuration.selfSigned); 
				var tls = ssData.server_configuration.supported_tls;
				var ciphers = ssData.server_configuration.supported_ciphers;
				var allowed_tls = allowed_values.tls_and_ciphers.tls_version;
				var allowed_ciphers = allowed_values.tls_and_ciphers.ciphers;

				populateTLS_And_Ciphers(tls, ciphers, allowed_tls, allowed_ciphers);
			}

		    var restrictedFields;

            var restrictionType;

            if(ssData.user_restricted_fields) {
                var userRestrictedField = ssData.user_restricted_fields;
                restrictedFields = userRestrictedField.restricted_fields;
                restrictionType = userRestrictedField.restriction_type;
            }

			populateSSData( isDomainSearchEnabled, isDomainDropDownEnabled, noOfAttempt, unlockTime, lockedMessage, emailNotify, technicianSpaceNotify, webPort, isHttpMode, noOfExpireDays, isForgotPasswordEnabled, isUserBasedLock ,ssFieldsVsValue,disableConcurrentLogin, restrictedFields, restrictionType, enablePushNotificationForURLAccessViolation,removeExifMetadata, disableThrottles);
	
			jQuery("#disableThrottles").prop("checked", disableThrottles);//NO I18N
			jQuery("#av_host").val(ssData.avConfig.av_host);
			jQuery("#av_port").val(ssData.avConfig.av_port);
			jQuery("#av_servicename").val(ssData.avConfig.av_service);
			
			if( ssData.avConfig.enable_av == 'true')
			{
				jQuery('#enableAV').prop('checked',true); //NO I18N
				jQuery('#avConfig').show();
				jQuery('#testICAPConnection').show();
			}
			
			if( ssData.disableLastLogin )
			{
				jQuery('#disableLastLogin').prop("checked", true);//NO I18N
			}

		}
		if( !isESMDirectory && ssData.secure_attachments )
		{
			populateSecureAttachmentsConfig(ssData.secure_attachments);
		}
		if(!isESMDirectory){
			jQuery('#disableLocalIP').prop("checked", ssData.disable_local_ip);//NO I18N
		}
	}
}

/*
 * Method to used to populate security settings data.
 * */
function populateSSData( isDomainSearchEnabled, isDomainDropDownEnabled, noOfAttempt, unlockTime, lockedMessage, emailNotify, technicianSpaceNotify, webPort, isHttpMode, noOfExpireDays, isForgotPasswordEnabled, isUserBasedLock ,ssFieldsVsValue,disableConcurrentLogin, restrictedFields, restrictionType, enablePushNotificationForURLAccessViolation,removeExifMetadata,disableThrottles)
{
	var ssFields = Object.keys(ssFieldsVsValue);
		for (var i = 0; i < ssFields.length; i++) {
			var ssField = ssFields[i];
			jQuery("#"+ssField).prop("checked", ssFieldsVsValue[ssField] == 'true');//NO I18N
		}
	if (isDomainSearchEnabled) {
		jQuery("#domainSearch").prop("checked", isDomainSearchEnabled);//NO I18N
	}
	
	if(disableConcurrentLogin){
		jQuery("#disableConcurrentLogin").prop("checked", disableConcurrentLogin);//NO I18N
		
	}
	
	if(removeExifMetadata){
		jQuery("#removeExifMetadata").prop("checked", removeExifMetadata);//NO I18N
		
	}

	if(!disableThrottles){
		jQuery('#disableThrottleFilter').hide()

	}

	if(enablePushNotificationForURLAccessViolation)
	{
		jQuery("#enablePushNotificationForURLAccessViolation").prop("checked", enablePushNotificationForURLAccessViolation);//NO I18N
	}

	if (isDomainDropDownEnabled) {
		jQuery("#domainDropDown").prop("checked", isDomainDropDownEnabled);//NO I18N
	}



	if( noOfAttempt > 0 && unlockTime > 0 )
	{
		jQuery("#enableLockAcc").prop("checked", true);//NO I18N

		jQuery("#noOfAttempt").val(noOfAttempt);

		jQuery("#unlockTime").val(unlockTime);

		jQuery('#badLoginConfig').show();//NO I18N

		jQuery('#emailNotify').prop('checked', emailNotify);//NO I18N
		jQuery('#technicianSpaceNotify').prop('checked', technicianSpaceNotify);//NO I18N

		jQuery('#accountLockedLink').show();
		
		if( isUserBasedLock )
		{
			jQuery("#UserBasedLock").prop("checked", true);//NO I18N
		}
		else
		{
			jQuery("#IPBasedLock").prop("checked", true);//NO I18N
		}
	}
	else
	{
		jQuery("#noOfAttempt").prop("disabled", false); //NO I18N
		jQuery("#unlockTime").prop("disabled", false); //NO I18N

		jQuery('#emailNotify').prop('checked', false);//NO I18N
		jQuery('#technicianSpaceNotify').prop('checked', false);//NO I18N

		jQuery('#accountLockedLink').hide();
		
		jQuery("#UserBasedLock").prop("checked", false);//NO I18N
		
		jQuery("#IPBasedLock").prop("checked", false);//NO I18N
	}

	jQuery('#lockedMessage').val(lockedMessage);

	jQuery('#left_char').html(250-lockedMessage.length);

	if( lockedMessage.length >= 250 )
	{
		jQuery("#left_char").addClass("text-mandatory");//NO I18N
	}

	if( webPort != null )
	{
		jQuery("#webPort").val(webPort);

		if( isHttpMode )
		{
			jQuery("#http").prop("checked", true);//NO I18N
		}
		else
		{
			jQuery("#https").prop("checked", true);//NO I18N

			jQuery("#ciphersAndTls").show();
			
			jQuery("#importsslbtn").show();
		}
	}

	if( noOfExpireDays > 0 )
	{
		jQuery('#enableKeepMeSign').prop("checked",true);//NO I18N
		
		jQuery("#noOfExpireDays").val(noOfExpireDays);
	}
	else
	{
		jQuery("#noOfExpireDays").val(45);
		
		jQuery('#keepMeConfig').hide();//NO I18N
	}

	if(restrictionType == 'include' || restrictionType == 'exclude' || restrictionType == 'all') {
	    storedUserFields = restrictedFields;
		if(restrictionType == 'include' || restrictionType == 'exclude') {
			var returnState = restrictedFields.map(function(field){return {text: field.name, id: field.id}});
            showUserFieldsPopUp('techRestrictedFieldsCont', 'techRestrictedFields', returnState).always(function() { // No I18N
			  jQuery('#techRestrictedFields').select2('data', returnState);  // No I18N
			});
			if(restrictionType == 'include') {
				jQuery('#techFieldInclude').prop("checked", true); // No I18N
			} else {
				jQuery('#techFieldExclude').prop("checked", true); // No I18N
}
		} else {
			jQuery('#techFieldShowAll').prop("checked", true);  // No I18N
		  	closeUserFieldPopUp('techRestrictedFieldsCont');  // No I18N
		  	jQuery("#techRestrictedFields").select2({
                "data": '', // NO I18N
                "width": "400px", // NO I18N
                "multiple": true, // NO I18N
                "closeOnSelect": false //No I18N
            });
		}
	}
    jQuery('#enableForgotPassword').prop("checked", isForgotPasswordEnabled);//NO I18N
}

/*
 * Method to used populate security response headers.
 * */
function populateSecurityHeaders(allowed_values, responseHeaders)
{
	if( jQuery("#cloneResHeader").length == 1 )
	{
		var baseElement = jQuery("#cloneResHeader");

		var responseHeaders_keys = Object.keys(responseHeaders);

		var allowed_headers = allowed_values.response_headers;

		if( responseHeaders_keys.length > 0 )
		{
			jQuery("#enableSecurityHeaders").prop("checked", true);//NO I18N

			for( var i = 0; i < responseHeaders_keys.length; i++ )
			{
				var newElement = baseElement.clone(true);

				newElement.attr('id', 'responseHeader_' + (i+1));
				newElement.show();

				if( i == (responseHeaders_keys.length-1) )
				{
					newElement.find("#rowBtn").attr({'title': translate('sdp.common.add'), 'data-action':'addNewHeader'});//NO I18N
					newElement.find("#rowBtn").removeClass('removerowbtn').addClass('addrowbtn');//NO I18N
					newElement.find('#rowBtnIcon').removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N
				}

				for( var j = 0; j < allowed_headers.length; j++ )
				{
					newElement.find('#hName').append(jQuery("<option></option>").text(allowed_headers[j]).val((j+1)));

					if( responseHeaders_keys[i] == allowed_headers[j] )
					{
						newElement.find("#hName").val(j+1);//NO I18N
						newElement.find("#hValue").val(responseHeaders[responseHeaders_keys[i]]);
					}
				}

				var note = getNotesForSecurityHeader(responseHeaders_keys[i]);

				if( note != "" )
				{
					newElement.find("#hValue").attr("placeholder", note);
				}

				newElement.find('#hName').attr("id", "hName_" + (i+1) );
				newElement.find("#hValue").attr("id", "hValue_" + (i+1));
				newElement.find("#rowBtn").attr("id", "rowBtn_" + (i+1));//NO I18N
				newElement.find("#rowBtnIcon").attr("id", "rowBtnIcon_" + (i+1));//NO I18N

				jQuery("#securityHeaders").append(newElement);

				if( allowed_values.response_headers.length == jQuery("#securityHeaders div[id^=responseHeader_]").length )
				{
					jQuery(document.getElementById("rowBtn_"+(i+1))).attr({'data-action':'deleteHeader', 'title': translate('sdp.common.remove')});//NO I18N
					jQuery(document.getElementById("rowBtn_"+(i+1))).removeClass('addrowbtn').addClass('removerowbtn');//NO I18N
					jQuery(document.getElementById("rowBtnIcon_"+(i+1))).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N
				}
			}
		}
		else
		{
			createNewHeader(allowed_headers);
		}
	}	
}

/* Method to used create new one security header. when security header is not configured. but securityHeaders list cannot be empty. so create single row.*/
function createNewHeader(allowed_headers)
{
	var newElement = jQuery("#cloneResHeader").clone(true);

	newElement.attr('id', 'responseHeader_1');

	newElement.find('#rowBtn').removeClass('removerowbtn').addClass('addrowbtn');//NO I18N
	newElement.find('#rowBtn').attr({'title': translate('sdp.common.add'), 'data-action':'addNewHeader', 'id': 'rowBtn_1'});//NO I18N

	newElement.find('#rowBtnIcon').removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N
	newElement.find('#rowBtnIcon').attr('id', 'rowBtnIcon_1');//NO I18N

	for( var i = 0; i < allowed_headers.length; i++ )
	{
		newElement.find("#hName").append(jQuery("<option></option>").text(allowed_headers[i]).val((i+1)));
	}

	newElement.find('#hName').attr('id', 'hName_1');
	newElement.find('#hValue').attr('id', 'hValue_1');

	jQuery("#securityHeaders").append(newElement);
}

/*
 * Method to used populate tls and ciphers data.
 */
function populateTLS_And_Ciphers(tls, ciphers, allowed_tls, allowed_ciphers)
{
	if( typeof(tls) == "string" && typeof(ciphers) == "string" )
	{
		tls = tls.split(",").map(function (i) {return i.replace("[","").replace("]","").replace(/'/g,"").replace("\"","")});
		ciphers = ciphers.split(",").map(function (i) {return i.replace("[","").replace("]","").replace(/'/g,"").replace("\"","")});
	}
	if( typeof(allowed_tls) == "string" && typeof(allowed_ciphers) == "string" )
	{
		allowed_tls = allowed_tls.split(",").map(function (i) {return i.replace("[","").replace("]","").replace(/'/g,"").replace("\"","")});
		allowed_ciphers = allowed_ciphers.split(",").map(function (i) {return i.replace("[","").replace("]","").replace(/'/g,"").replace("\"","")});
	}

	var tlsVal = [];
	var ciphersVal = [];

	for( i = 0; i < allowed_tls.length; i++ )
	{
		jQuery("#server-tls").append(jQuery("<option></option>").text(allowed_tls[i]).val(allowed_tls[i]));//NO I18N

		for( k=0; k < tls.length; k++ )
		{
			if( allowed_tls[i] == tls[k] )
			{
				tlsVal.push(tls[k]);
			}
		}
	}

	for( j=0; j < allowed_ciphers.length; j++ )
	{
		jQuery("#server-ciphers").append(jQuery("<option></option>").text(allowed_ciphers[j]).val(allowed_ciphers[j]));//NO I18N

		for( l=0; l < ciphers.length; l++ )
		{
			if( allowed_ciphers[j] == ciphers[l] )
			{
				ciphersVal.push(ciphers[l]);
			}       
		}
	}

	jQuery("#server-tls").val(tlsVal);
	jQuery("#server-tls").select2({formatNoMatches : translate("sdp.admin.notificationrules.notifytechnician.select2nomatchesfound")});

	jQuery("#server-ciphers").val(ciphersVal);
	jQuery("#server-ciphers").select2({formatNoMatches : translate("sdp.admin.notificationrules.notifytechnician.select2nomatchesfound")});
}

/*
 * Method to populate notification technician list.
 */
function populateNotificationTechnician(allowed_technician, notify_technician_list)
{
	var allowed_technician_ids = [];

	for( i = 0; i < allowed_technician.length; i++ )
	{
		allowed_technician_ids.push(allowed_technician[i].id);

		var emailId = allowed_technician[i].email_id;

		if( emailId == "null" )
		{
			emailId = translate("sdp.common.no.email");
		}

		jQuery("#notifyTo").append(jQuery("<option></option>").text(allowed_technician[i].name+" - "+emailId).val(allowed_technician[i].id).attr("email",emailId));//NO I18N
	}

	var technicianList = [];

	for( j = 0; j < notify_technician_list.length; j++ )
	{
		var techID = notify_technician_list[j].id;

		technicianList.push(techID);

		if( allowed_technician_ids.indexOf(techID) == -1 )
		{
			var emailId = notify_technician_list[j].email_id;

			if( emailId == "null" )
			{
				emailId = translate("sdp.common.no.email");
			}

			jQuery("#notifyTo").append(jQuery("<option></option>").text(notify_technician_list[j].name+" - "+emailId).val(techID).attr({"email":emailId,"isinvalid":"true"}));//NO I18N
		}
	}

	jQuery("#notifyTo").val(technicianList).select2({formatNoMatches : translate("sdp.admin.notificationrules.notifytechnician.select2nomatchesfound")});
}

/*
 * Method to used create new header row.
 */
function addNewHeader(input)
{
	var baseId = jQuery(input).attr('id').split('_')[1];

	var baseElement = jQuery(document.getElementById('responseHeader_'+baseId));//NO I18N

	var newElement = baseElement.clone(true);

	jQuery(newElement).attr('id',"responseHeader_" + (Number(baseId)+1));

	jQuery(newElement).show().removeClass('has-error').children('div[id=normalbubbletooltip]').remove();//NO I18N

	jQuery(newElement).find("#rowBtn_"+baseId).attr({'data-action':'addNewHeader', 'title': translate('sdp.common.add')});//NO I18N
	jQuery(newElement).find("#rowBtn_"+baseId).removeClass('removerowbtn').addClass("addrowbtn");//NO I18N
	jQuery(newElement).find("#rowBtnIcon_"+baseId).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N

	jQuery(document.getElementById("rowBtn_"+baseId)).attr({'data-action':'deleteHeader', 'title': translate('sdp.common.remove')});//NO I18N
	jQuery(document.getElementById("rowBtn_"+baseId)).removeClass('addrowbtn').addClass("removerowbtn");//NO I18N
	jQuery(document.getElementById("rowBtnIcon_"+baseId)).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N

	jQuery(newElement).find("#hValue_"+baseId).val("").removeAttr("placeholder").attr('data-action', 'validateHeaderValue');

	jQuery(newElement).find("#hName_"+baseId).attr("id", "hName_"+(Number(baseId)+1));
	jQuery(newElement).find("#hValue_"+baseId).attr("id", "hValue_"+(Number(baseId)+1));
	jQuery(newElement).find("#rowBtn_"+baseId).attr("id", "rowBtn_"+(Number(baseId)+1));
	jQuery(newElement).find("#rowBtnIcon_"+baseId).attr("id", "rowBtnIcon_"+(Number(baseId)+1));

	jQuery("#securityHeaders").append(newElement);

	if( allowed_values.response_headers.length == jQuery("#securityHeaders div[id^=responseHeader_]").length )
	{
		jQuery(document.getElementById("rowBtn_"+(Number(baseId)+1))).attr({'data-action':'deleteHeader', 'title': translate('sdp.common.remove')});//NO I18N
		jQuery(document.getElementById("rowBtn_"+(Number(baseId)+1))).removeClass('addrowbtn').addClass('removerowbtn');//NO I18N
		jQuery(document.getElementById("rowBtnIcon_"+(Number(baseId)+1))).removeClass('sdp-glyph-plus').addClass('sdp-glyph-minus');//NO I18N
	}
}

/*
 * THis method to used delete one security response header.
 */
function deleteHeader(obj)
{
	var baseId = jQuery(obj).attr('id').split('_')[1];

	jQuery(document.getElementById("responseHeader_"+baseId)).remove();

	if( allowed_values.response_headers.length == (jQuery("#securityHeaders div[id^=responseHeader_]").length+1) )
	{
		var lastElementId = jQuery("#securityHeaders div[id^=responseHeader_]:last").attr('id').split('_')[1];

		jQuery(document.getElementById('rowBtn_'+lastElementId)).attr({'data-action':'addNewHeader', 'title': translate('sdp.common.add')});//NO I18N
		jQuery(document.getElementById('rowBtn_'+lastElementId)).removeClass('removerowbtn').addClass('addrowbtn');//NO I18N
		jQuery(document.getElementById('rowBtnIcon_'+lastElementId)).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N
	}
}

/*
 * Submit security settings data to server.
 */
function submitSSData()
{
	jQuery("#alertbox").remove();

	if( validateSSFormFieldsValues() )
	{
		try
		{
			jQuery('#processing').removeClass('hide');//No I18N
			jQuery('#saving').addClass('hide');//No I18N

			if( jQuery('#securitysettings #normalbubbletooltip').length > 0 )
			{
				jQuery('#normalbubbletooltip span').trigger('click');
			}

			var ssData = constructSSJSON();

			var param = {};
			
			param.security_settings = ssData;
			
			//SD-78251 fix
			param = {"INPUT_DATA":  (typeof sdpToJSON != 'undefined') ? sdpToJSON(param) : JSON.stringify(param) };//NO I18N

			sdpAjax({
				type: 'PUT',//NO I18N
				url: '/api/v3/security_settings',//NO I18N
				data: param,
				dataType: 'json',//NO I18N
				async:false,
				success: function(jsonObj)
				{
					if(ssData.disableThrottles){
                        jQuery('#enablePushNotificationForURLAccessViolation').prop('checked',false);//NO I18N
		            }

					jQuery('#processing').addClass('hide');//NO I18N
					jQuery('#saving').removeClass('hide');//NO I18N
					jQuery('#isSelfSigned').val('true');//NO I18N
					if( jsonObj.response_status.messages[0].status_code == 201 )
					{
						showalert('warning', translate("sdp.security.settings.update.success.and.restart.msg"), 'isAutoHide=false');//NO I18N
						if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
						{
							removeBlankHeaders();
							checkmodeforsslimport();
							if( jQuery('#enableAV').is(':checked')  )
							{
								jQuery('#testICAPConnection').show();
							}
							else
							{
								jQuery('#testICAPConnection').hide();
							}
						}
						if( !isESMDirectory )
						{
							showResetSecurePwd();
						}
					}
					else if( jsonObj.response_status.messages[0].status_code == 200 )
					{
						showalert('success', translate("sdp.security.settings.update.success.msg"), 'isAutoHide=true');//NO I18N
						if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
						{
							removeBlankHeaders();
							checkmodeforsslimport();
							if( jQuery('#enableAV').is(':checked')  )
							{
								jQuery('#testICAPConnection').show();
							}
							else
							{
								jQuery('#testICAPConnection').hide();
							}
						}
						if( !isESMDirectory )
						{
							showResetSecurePwd();
						}
					}
					else
					{
						showalert('failure', jsonObj.response_status.messages[0].message, 'isAutoHide=true');//NO I18N
					}
				}, 
				error: function(jsonObj)
				{
					jQuery('#processing').addClass('hide');//NO I18N
					jQuery('#saving').removeClass('hide');//NO I18N
					var message ;
					if(!jsonObj.response_status && jsonObj.responseJSON)
					{
						jsonObj.responseJSON.response_status ? message = jsonObj.responseJSON.response_status.messages[0].message : message = (jsonObj.responseJSON.status === 'mfa_required') ? translate('mfa.required') : '';//NO I18N  
							
					}
					else
					{
						message = jsonObj.response_status.messages[0].message;
					}
					
					showalert('failure', message, 'isAutoHide=true');//NO I18N
				} 
			});//NO I18N
		}
		catch( e )
		{
			jQuery('#processing').addClass('hide');//NO I18N
			jQuery('#saving').removeClass('hide');//NO I18N
			alert(e.message);	
		}
	}
}
function submitPWDData()
{

	jQuery("#alertbox").remove();

	jQuery('#processing').removeClass('hide');//No I18N
    jQuery('#saving').addClass('hide');//No I18N
	try
	{	
		var dataValues = constractPWDJson(); 
		if(dataValues == undefined)
		{
			jQuery('#processing').addClass('hide');//NO I18N
            jQuery('#saving').removeClass('hide');//NO I18N
			return;
		}
		var param = JSON.stringify(dataValues);
		jQuery.ajax({
		type: 'POST',//NO I18N
		url: '/servlet/AJaxServlet?action=updatePwdPolicy',//NO I18N
		data: "input_data="+param, //NO I18N
		dataType: 'json', //NO I18N
		async:false,
		success: function(jsonObj)
		{
			jQuery('#processing').addClass('hide');//NO I18N
			jQuery('#saving').removeClass('hide');//NO I18N
			if(jsonObj.status==="Success")
			{
				showalert('success', translate('sdp.pwdpolicy.sucessmsg'), 'isAutoHide=true');//NO I18N
				var validPwd=validPredefinedPassword();
			    if(validPwd==false)
			    {
					jQuery('#pwdmismatch').removeClass('hide');//NO I18N
				}
				else
				{
					jQuery('#pwdmismatch').addClass('hide');//NO I18N
				}
			}
			else if(jsonObj.status ==="warning")
			{
				alert(translate("sdp.pwdpolicy.min.length.warning",[8])); //NO I18N
			}
			else
			{
				alert(jsonObj.message);
			}
		},error: function(response){
			var message;
			message = response.responseJSON ? response.responseJSON.status === 'mfa_required' ? translate('mfa.required') : '' : '';//NO I18N
			message ? showalert('failure', message, 'isAutoHide=true') : '';//NO I18N
			
		}
		});//NO I18N
	}
	catch( e )
	{
		jQuery('#processing').addClass('hide');//NO I18N
		jQuery('#saving').removeClass('hide');//NO I18N
		alert(e.message);	
	}
	finally
	{
		jQuery('#processing').addClass('hide');//NO I18N
		jQuery('#saving').removeClass('hide');//NO I18N
	}

}
function constractPWDJson()
{
	var pwdPolicy = {};
	if(jQuery('#pwdPassCheckBox').is(':checked') == true) 
	{
		pwdPolicy.isPwdPolicyEnabled = true;
		var min_length = parseInt(jQuery("#minPwdLength").val());
		if(min_length < 8 || isNaN(min_length))
		{
			alert(translate("sdp.pwdpolicy.min.length.warning",[8]));//NO I18N
			jQuery('#minPwdLength').trigger('focus');
			return;
		}
		if(min_length >= 100)
		{
			alert(translate("sdp.pwdpolicy.max.length.warning",[100]));//NO I18N
			jQuery('#minPwdLength').trigger('focus');
			return;
		}
		pwdPolicy.min_length = min_length;
		pwdPolicy.mixed_case = jQuery("#mixedChar").is(":checked"); //NO I18N
		if(jQuery("#splChar").is(":checked"))
		{
			pwdPolicy.numOf_splChar = 1;
		}
		else	
		{
			pwdPolicy.numOf_splChar = -1;
			
		}
		if(jQuery("#prevPassChck").is(":checked"))
		{
			pwdPolicy.numOf_oldPass = jQuery("#prevPasswSelect").val();
		}
		// SD-97937
        pwdPolicy.loginnameindepnt=jQuery("#loginnameindepnt").is(":checked");//NO I18N
        // SD-97937
		pwdPolicy.password_age = jQuery('#setPwdExp').val();
	}
	else
	{
		pwdPolicy.isPwdPolicyEnabled = false;
	}
	if(jQuery('#forcePasswordReset').is(':checked') == true){
		pwdPolicy.forcePasswordReset = true;
	}else{
		pwdPolicy.forcePasswordReset = false;
	}

	return pwdPolicy;
}

function pwdPolicyCheck() 
{
	var jqBody = jQuery('body'),
		ssPwdPolicyForm_id = jqBody.find('#ssPwdPolicyForm');
	jQuery('body').on('click','label[data-id=pwd-enabled] input',function() 
	{
		jQuery('#minPwdLength').prop('disabled', false); //NO I18N
		if(jQuery(this).is(':checked') == true) 
		{			
			jqBody.find('#securitysettings').find('[data-disable=true]').prop('disabled', false); // No I18n
			previousPass();
		}else {
			jqBody.find('#securitysettings').find('[data-disable=true]').prop('disabled',true); //NO I18N
			jqBody.find('#securitysettings').find('[data-disable1=true]').prop('disabled',true); //NO I18N
			jQuery('#prevPasswSelect').prop('disabled',true); //NO I18N

		}
	});
}
function previousPass()
{
	if(jQuery('#prevPassChck').is(':checked') == true) 
	{
		jQuery('#prevPasswSelect').prop("disabled", false); //NO I18N
	}
	else
	{
		jQuery('#prevPasswSelect').prop('disabled',true); //NO I18N
	}
}

/*Metho to used remove unfilled headers name and values */
function removeBlankHeaders()
{
	var isConfigured = false;

	jQuery("#securityHeaders div[id^=responseHeader_]").each(function() {
		if( jQuery(this).attr('isvalid') == "true" )
		{
			isConfigured = true;
		}
		else
		{
			jQuery(this).remove();
		}
	});

	if( isConfigured && allowed_values.response_headers.length > jQuery("#securityHeaders div[id^=responseHeader_]").length ) 
	{
		var lastElementId = jQuery("#securityHeaders div[id^=responseHeader_]:last").attr('id').split('_')[1];

		if( jQuery(document.getElementById('rowBtn_'+lastElementId)).hasClass('removerowbtn') )
		{
			jQuery(document.getElementById('rowBtn_'+lastElementId)).attr({'data-action':'addNewHeader', 'title': translate('sdp.common.add')});//NO I18N
			jQuery(document.getElementById('rowBtn_'+lastElementId)).removeClass('removerowbtn').addClass('addrowbtn');//NO I18N
			jQuery(document.getElementById('rowBtnIcon_'+lastElementId)).removeClass('sdp-glyph-minus').addClass('sdp-glyph-plus');//NO I18N
		}
	}
	else if( !isConfigured )
	{
		jQuery("#enableSecurityHeaders").prop("checked", false);//NO I18N
		jQuery("#securityHeaders div[id^=responseHeader_]").hide();
	}
}

/*
 * Methos to used validate the response header value.
 */
function validateHeaderValue(inp)
{
	var error = false;

	var baseId = jQuery(inp).attr('id').split('_')[1];

	var tempHeaderName = [];

	jQuery("#securityHeaders div[id^=responseHeader_]").each(function() {

		var base_id = jQuery(this).attr('id').split('_')[1];

		if( jQuery(document.getElementById('hName_'+base_id)).find(':selected').val() != -1 )
		{
			var header_name = jQuery(document.getElementById('hName_'+base_id)).find(':selected').text();//NO I18N

			if( allowed_values.response_headers.indexOf(header_name) == -1 )
			{
				if( baseId == base_id )
				{
					showCustomError(jQuery('#hName_'+base_id), translate('sdp.security.settings.api.invalid.header.name.errmsg', [header_name]), true);//NO I18N
					error = true;
					return false;
				}
			}

			if( tempHeaderName.indexOf(header_name) == -1 )
			{
				tempHeaderName.push(header_name);
			}
			else
			{
				if( baseId == base_id )
				{
					showCustomError(jQuery('#hName_'+baseId), translate('sdp.admin.custom.security.headers.already.congfig.err.msg', [header_name]), true);//NO I18N
					error = true;
					return false;
				}
			}
		}
	});

	if( error )
	{
		return false;
	}

	var headerName = jQuery(document.getElementById('hName_'+baseId)).find(':selected').text();

	var headerValue = inp.value;

	if( headerValue == "" )
	{
		return false;
	}

	allowedValue = allowed_values.response_headers[headerName];

	var regex = null;

	var multiValues = null;

	if( "Cache-Control" == headerName )
	{
		regex = /^(public|private|no-(cache|transform|store)|(s-|)max-age=\d{1,7}|(must|proxy)-revalidate)$/i; 
		headerValue = headerValue.trim().replace(/ /g, ",");
		multiValues = headerValue.split(/,|;/g).filter(Boolean);
	}
	else if( "Content-Security-Policy" == headerName )
	{
		regex = /^((default|img|script|style|font|frame|object|connect)-src|'self'|'none'|'unsafe-inline'|'unsafe-eval'|data:|https:|\*)$/i;//NO I18N
		headerValue = headerValue.replace(/ /g, ",");
		multiValues = headerValue.split(/,|;/g).filter(Boolean);
	}
	else if( "Strict-Transport-Security" == headerName )
	{
		regex = /^(max-age=\d{1,9}|includesubdomains|preload)$/i;
		headerValue = headerValue.replace(/ /g, ",");
		multiValues = headerValue.split(/,|;/g).filter(Boolean);
	}
	else if( "X-Content-Type-Options" == headerName )
	{
		regex = /^(sniff|nosniff)$/i;//NO I18N
		headerValue = headerValue.replace(/ /g, "");
	}
	else if( "X-Frame-Options" == headerName )
	{
		regex = /^(sameorigin|deny)$/i;
		headerValue = headerValue.replace(/ /g, "");
	}
	else if( "X-XSS-Protection" == headerName )
	{
		regex = /^(0|(1\s*;\s*mode=block))$/i;
		headerValue = headerValue.replace(/ /g, "");
	}
	else if( "Access-Control-Allow-Origin" == headerName )
	{
		headerValue = headerValue.replace(/ /g, "");
		// SD-99063 change regex to accept trusted value
		regex = /^(ht|f)tp(s?)\:\/\/[\w\.\-\:]+|trusted$/;
		if( headerValue.length >  500 )
		{
			showCustomError(jQuery(inp), translate('sdp.app.common.maxlength.characters', [headerName,500 ]), true);
			return false;
		}
		multiValues = headerValue.split(',');
	}
	else if( "Referrer-Policy" == headerName )
	{
		headerValue = headerValue.replace(/ /g, "");
		regex = /^((no-referrer(-when-downgrade)?)|(origin(-when-cross-origin)?)|same-origin|(strict-origin(-when-cross-origin)?)|unsafe-url)$/;
	}
	else if( "Expect-CT" == headerName )
	{
		headerValue = headerValue.replace(/ /g, "");
		regex = /^(enforce)?(,max-age=[0-9]+)?(,report-uri='(http|https):\/\/.*')?$/;//NO I18N
	}
	else if( "Feature-Policy" == headerName )
	{
		regex = /^(accelerometer|ambient-light-sensor|autoplay|battery|camera|display-capture|document-domain|encrypted-media|fullscreen|geolocation|gyroscope|layout-animations|legacy-image-formats|magnetometer|microphone|midi|oversized-images|payment|picture-in-picture|publickey-credentials-get|screen-wake-lock|sync-xhr|unoptimized-images|unsized-media|usb|vibrate|vr|wake-lock|xr|xr-spatial-tracking|web-share) ('none'|\*|'src' (http|https):\/\/.+|'self' (http|https):\/\/.+|'src'|'self')$/;//NO I18N
		headerValue = headerValue.replace(/  /g, " ");
		multiValues = headerValue.split(/;/g).filter(Boolean);
	}

	var success = false;

	if( regex != null )
	{
		if( multiValues != null )
		{
			for( i = 0; i < multiValues.length; i++ )
			{
				var val = multiValues[i].trim();

				if( headerName == "Content-Security-Policy" && ( headerValue.indexOf("<") > -1 || headerValue.indexOf(">") > -1 ) )
				{
					showCustomError(jQuery(inp), translate('sdp.security.settings.api.invalid.headervalue.err.msg', [multiValues[i], headerName]), true);
					return false;
				}
				if( !regex.test(val) && headerName != "Content-Security-Policy" )
				{
					showCustomError(jQuery(inp), translate('sdp.security.settings.api.invalid.headervalue.err.msg', [multiValues[i], headerName]), true);
					return false;
				}
			}
		}
		else
		{
			if( !regex.test(headerValue) && headerName != "Content-Security-Policy" )
			{
				showCustomError(jQuery(inp), translate('sdp.security.settings.api.invalid.headervalue.err.msg', [inp.value, headerName]), true);
				return false;
			}
		}

		success = true;
	}
	else 
	{
		if( headerValue.indexOf("<") > -1 || headerValue.indexOf(">") > -1 )
		{
			showCustomError(jQuery(inp), translate('sdp.security.settings.api.invalid.headervalue.err.msg', [inp.value, headerName]), true);
			return false;
		}

		success = true;
	}

	if( success )
	{
		jQuery(document.getElementById('responseHeader_'+baseId)).removeClass('has-error').children('div[id=normalbubbletooltip]').remove();//NO I18N
		return true;
	}
}

/*
 * Method to used reset the header value when change the header name.
 */
function resetHeaderValue(inp)
{
	var baseId = jQuery(inp).attr('id').split('_')[1];

	var headerName = jQuery(document.getElementById('hName_'+baseId)).find(':selected').text();

	jQuery(document.getElementById('hValue_'+baseId)).val("");//NO I18N

	var note = getNotesForSecurityHeader(headerName);

	if( note != "" )
	{
		jQuery(document.getElementById('hValue_'+baseId)).attr("placeholder", note);//NO I18N
	}
	else
	{
		jQuery(document.getElementById('hValue_'+baseId)).removeAttr("placeholder");//NO I18N
	}

	jQuery(document.getElementById('responseHeader_'+baseId)).removeClass('has-error').children('div[id=normalbubbletooltip]').remove();//NO I18N

	var tempHeaderName = [];

	jQuery("#securityHeaders div[id^=responseHeader_]").each(function() {

		var base_id = jQuery(this).attr('id').split('_')[1];

		if( jQuery(document.getElementById('hName_'+base_id)).find(':selected').val() != -1 )
		{
			var headerName = jQuery(document.getElementById('hName_'+base_id)).find(':selected').text();//NO I18N

			if( allowed_values.response_headers.indexOf(headerName) == -1 )
			{
				showCustomError(jQuery('#hName_'+baseId), translate('sdp.security.settings.api.invalid.header.name.errmsg', [headerName]), true);//NO I18N
				err = true;
				return false;
			}

			if( tempHeaderName.indexOf(headerName) == -1 )
			{
				tempHeaderName.push(headerName);
			}
			else
			{
				if( baseId == base_id )
				{
					showCustomError(jQuery('#hName_'+baseId), translate('sdp.admin.custom.security.headers.already.congfig.err.msg', [headerName]), true);//NO I18N
					return false;
				}
			}
		}
	});
}

/*
 * This methods to used get placeholder message for specified header names.
 */
function getNotesForSecurityHeader(headerName)
{
	var note = "";

	if( "Cache-Control" == headerName )
	{
		note = "Eg:- public no-cache max-age=0 proxy-revalidate";//NO I18N
	}
	else if( "Content-Security-Policy" == headerName )
	{
		note = "Eg:- script-src 'self' www.zoho.com; img-src 'none' www.zoho.com";//NO I18N
	}
	else if( "X-Content-Type-Options" == headerName )
	{
		note = "Eg:- sniff (or) nosniff";//NO I18N
	}
	else if( "X-Frame-Options" == headerName )
	{
		note = "Eg:- sameorigin (or) deny";//NO I18N
	}
	else if( "Strict-Transport-Security" == headerName )
	{
		note = "Eg:- max-age=15892 includesubdomains preload";//NO I18N
	}
	else if( "X-XSS-Protection" == headerName )
	{
		note = "Eg:- 0 (or) 1; mode=block";//NO I18N
	}
	else if( "Access-Control-Allow-Origin" == headerName )
	{
		// change placeholder to inform the user that Access-Control-Allow-Orgin accepts trusted values.
		note = "Eg:- http://www.mydummywebsite.com (or) trusted";//NO I18N
	}
	else if("Referrer-Policy"  == headerName)
	{
		note = "Eg:- same-origin";//NO I18N
	}
	else if("Expect-CT" == headerName)
	{
		note = "Eg:- enforce, max-age=300, report-uri='https://www.your-report-website.com/'";//NO I18N
	}
	else if( "Feature-Policy" == headerName )
	{
		note = "Eg:- camera *; microphone 'none'; fullscreen 'self;";//NO I18N
	}

	return note;
}

/*
 * Method to used validate security settings fields all values.
 */
function validateSSFormFieldsValues()
{
	if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
	{
		var err = false;

	var sessionTimeout = parseInt(jQuery('#sessionTimeout').val());
	
	if( sessionTimeout <=0 || sessionTimeout > 1440 )
	{
		showCustomError(jQuery('#sessionTimeout'), translate('sdp.security.settings.max.session.timout'));//NO I18N
		return false;
	}
		var mobileSessionTimeout = parseInt(jQuery('#mobileSessionTimeout').val());
		if (mobileSessionTimeout < 5 || mobileSessionTimeout > 20000) {
			showCustomError(jQuery('#mobileSessionTimeout'), translate('admin.mobile.session.timeout.info'));	// No I18N
			return false;
		}

		if( jQuery("#enableSecurityHeaders").is(":checked") )
		{
			var tempHeaderName = [];

			jQuery("#securityHeaders div[id^=responseHeader_]").each(function() {

				var baseId = jQuery(this).attr('id').split('_')[1];

				if( jQuery(document.getElementById('hName_'+baseId)).find(':selected').val() != -1 )
				{
					var headerName = jQuery(document.getElementById('hName_'+baseId)).find(':selected').text();//NO I18N
					var headerValue = jQuery(document.getElementById('hValue_'+baseId)).val();//NO I18N

					if( allowed_values.response_headers.indexOf(headerName) == -1 )
					{
						showCustomError(jQuery('#hName_'+baseId), translate('sdp.security.settings.api.invalid.header.name.errmsg', [headerName]), true);//NO I18N
						err = true;
						return false;
					}

					if( tempHeaderName.indexOf(headerName) == -1 )
					{
						tempHeaderName.push(headerName);
					}
					else
					{
						showCustomError(jQuery('#hName_'+baseId), translate('sdp.admin.custom.security.headers.already.congfig.err.msg', [headerName]), true);//NO I18N
						err = true;
						return false;
					}
					if( headerValue.trim().length == 0 )
					{
						showCustomError(jQuery(document.getElementById('hValue_'+baseId)), translate('sdp.admin.custom.security.headers.value.empty.err.msg'), true);//NO I18N
						err = true;
						return false;
					}

					jQuery(this).attr('isvalid', 'true');//NO I18N
				}
				else
				{
					jQuery(this).removeAttr('isvalid');//NO I18N
				}
			});

			if( err )
			{
				return false;
			}
		}

		var isNumber = /(^\d\d*$)/;

		if( jQuery("#enableLockAcc").is(":checked") )
		{	
			var strAttempt = jQuery("#noOfAttempt").val();

			var strTime = jQuery("#unlockTime").val();	

			var lockedMsg = jQuery("#lockedMessage").val();

			if( !isNumber.test(strAttempt) || parseInt(strAttempt) < 1 )
			{
				showCustomError(jQuery("#noOfAttempt"), translate('sdp.security.settings.api.negative.value.errmsg'));//NO I18N
				return false;
			}
			else
			{
				if( parseInt(strAttempt) > 10 || parseInt(strAttempt) < 3 )
				{
					showCustomError(jQuery('#noOfAttempt'), translate('sdp.security.settings.api.max.attempt.errmsg'));
					return false;
				}
			}

			if( !isNumber.test(strTime) || parseInt(strTime) < 1 )
			{
				showCustomError(jQuery("#unlockTime"), translate('sdp.requests.requestcost.errorMM'));//NO I18N
				return false;
			}
			else
			{
				if( parseInt(strTime) > 3000 || parseInt(strTime) < 5 )
				{
					showCustomError(jQuery('#unlockTime'), translate('sdp.security.settings.api.max.unlock.time.errmsg'));
					return false;
				}
			}

			if( lockedMsg == "" || lockedMsg == null )
			{
				showCustomError(jQuery("#lockedMessage"), translate('sdp.common.error.empty', ['Locked message']));//NO I18N
				return false;
			}
			else
			{
				if( lockedMsg.length > 250 )
				{
					showCustomError(jQuery("#lockedMessage"), translate('sdp.security.settings.api.max.locked.info.errmsg'));//NO I18N
					return false;
				}
			}

			if( jQuery('#emailNotify').is(':checked')  || jQuery('#technicianSpaceNotify').is(':checked') )
			{
				if( jQuery("#notifyTo").val().length == 0 )
				{
					showCustomError(jQuery("#notifyTo").siblings('div').children('ul'), translate('sdp.security.settings.api.invalid.notification.empty.error.msg'));//NO I18N
					jQuery("#notifyTo").parent().addClass('has-error');
					setTimeout(function(){jQuery("#notifyTo").parent().removeClass('has-error');}, 4000);
					return false;
				}

				if( jQuery('#emailNotify').is(':checked') && isOutgoingMailServerConfigured == 'false' )
				{
					showalert('warning', getMessageForKey('sdp.security.settings.api.outgoing.mail.server.notconfigured.error.msg') + "<a class='text-link' style='cursor:pointer' sdpJs='js-event-securitysettings-24' > " + getMessageForKey("sdp.inventory.home.scan.configurenow") + "</a>", 'isAutoHide=false');//NO I18N
					jQuery("#notifyTo").parent().addClass('has-error');
					jQuery('[sdpJs="js-event-securitysettings-24"]').on("click", function() { redirectToOutgoingMailServer(); });//NO I18N
					setTimeout(function(){jQuery("#notifyTo").parent().removeClass('has-error');}, 4000);
					return false;
				}

				jQuery("#notifyTo").find(':selected').each(function(){

					var email = jQuery(this).attr('email');

					if( jQuery(this).attr("isinvalid") )
					{
						var name = jQuery(this).text();

						name = name.substring(0, parseInt(name.indexOf(email)));

						name = name.substring(0, parseInt(name.indexOf(" - ")));

						showCustomError(jQuery("#notifyTo").siblings('div').children('ul'), translate('sdp.security.settings.api.invalid.technician.error.msg', [name]));//NO I18N
						jQuery("#notifyTo").parent().addClass('has-error');
						setTimeout(function(){jQuery("#notifyTo").parent().removeClass('has-error');}, 4000);
						err = true;
						return false;
					}

					if( jQuery('#emailNotify').is(':checked') && !jQuery('#technicianSpaceNotify').is(':checked') )
					{
						if( email == translate('sdp.common.no.email') )
						{
							showCustomError(jQuery("#notifyTo").siblings('div').children('ul'), translate('sdp.security.settings.api.invalid.notification.noemail.error.msg'));//NO I18N
							jQuery("#notifyTo").parent().addClass('has-error');
							setTimeout(function(){jQuery("#notifyTo").parent().removeClass('has-error');}, 4000);
							err = true;
							return false;
						}
					}
				});

				if( err )
				{
					return false;
				}
			}
			else if( !jQuery('#emailNotify').is(':checked') && !jQuery('#technicianSpaceNotify').is(':checked') && jQuery('#notifyTo').val().length != 0 )
			{
				showCustomError(jQuery("#emailNotify").parent(), translate('sdp.security.settings.api.invalid.notification.type.error.msg'));//NO I18N
				return false;
			}
		}
		else
		{
			jQuery("#noOfAttempt").val('3');

			jQuery("#unlockTime").val('30');
		}

		var strExpireDays = jQuery("#noOfExpireDays").val();

		if( strExpireDays == "" )
		{
			showCustomError(jQuery("#noOfExpireDays"), translate('sdp.security.settings.api.cookie.expiry.date.empty.errmsg'));//NO I18N
			return false;
		}

		if( !isNumber.test(strExpireDays) )
		{
			showCustomError(jQuery("#noOfExpireDays"), translate('sdp.security.settings.api.negative.value.errmsg'));//NO I18N
			return false;
		}

		if( parseInt(strExpireDays) < 1 || parseInt(strExpireDays) > 365 )
		{
			showCustomError(jQuery("#noOfExpireDays"), translate('sdp.security.settings.api.max.expired.time.errmsg'));//NO I18N
			return false;
		}

		var strWebPort = jQuery("#webPort").val();

		if( strWebPort == "" )
		{
			showCustomError(jQuery("#webPort"), translate('sdp.security.settings.api.port.empty.errmsg'));//NO I18N
			return false;
		}

		if( !isNumber.test(strWebPort) )
		{
			showCustomError(jQuery("#webPort"), translate('sdp.security.settings.api.negative.value.errmsg'));//NO I18N
			return false;
		}

		if( strWebPort < 0 || strWebPort > 65535 )
		{
			showCustomError(jQuery("#webPort"), translate('sdp.security.settings.api.port.outof.range.errmsg'));//NO I18N
			return false;
		}
		if( jQuery("#https").is(":checked") )
		{
			var errorElement = null;

			if( jQuery("#server-tls").val() == null )
			{
				showCustomError(jQuery("#server-tls").siblings('div').children('ul'), translate('sdp.security.settings.api.tls.empty.errmsg'));//NO I18N
				errorElement = jQuery("#server-tls").parent().addClass('has-error');
				return false;
			}
			else if( jQuery("#server-ciphers").val() == null )
			{
				showCustomError(jQuery("#server-ciphers").siblings('div').children('ul'), translate('sdp.security.settings.api.ciphers.empty.errmsg'));//NO I18N
				errorElement = jQuery("#server-ciphers").parent().addClass('has-error');
				return false;
			}
			
			if( errorElement != null )
			{
				setTimeout(function(){errorElement.removeClass('has-error');}, 4000);
				return false;
			}
			if(isDcRunningInHttps()==0){
				if(!confirm(translate("sdp.security.settings.dc.http.errmsg",[encodeHTML(getUEMProdName(true, false).uem_integ_prod), encodeHTML(getUEMProdName(false, false).uem_integ_prod)]))){
					return false;
				} 
			}
		}
		
		if( jQuery("#enableSecurityHeaders").is(":checked") && jQuery("#securityHeaders div[id^=responseHeader]").length > 0 )
		{
			jQuery("#securityHeaders div[id^=responseHeader_] input[type=text]").each(function(){

				var baseId = jQuery(this).attr('id').split('_')[1];

				if( jQuery(document.getElementById('hName_'+baseId)).find(':selected').val() > -1 )
				{
					tempErr =  validateHeaderValue(this);

					if( !tempErr ) 
					{
						err = true;
						return;
					}
				}
			});
		}

		if( jQuery('#enableAV').is(":checked") )
		{
			var inputVal = jQuery("#av_host").val();
			
			if( inputVal.trim().length == 0 )
			{
				showCustomError(jQuery("#av_host"), translate('sdp.common.emptymessage',[translate('sdp.discovery.sccm.host')]),true);//NO I18N
				return false;
			}
			
			inputVal = jQuery("#av_servicename").val();
			if( inputVal.trim().length == 0 )
			{
				showCustomError(jQuery("#av_servicename"), translate('sdp.common.emptymessage',[translate('sdp.itil.common.service.item.name')]),true);//NO I18N
				return false;
			}
			
			inputVal = jQuery("#av_port").val().trim();
			
			if( inputVal.length == 0 )
			{
				showCustomError(jQuery("#av_port"), translate('sdp.common.emptymessage',[translate('sdp.admin.email.incoming.port')]),true);//NO I18N
				return false;
			}
			else
			{
				inputVal = Number(inputVal);
				
				if( Number.isNaN(inputVal) || inputVal < 1 || inputVal > 65535  )
				{
					showCustomError(jQuery("#av_port"), translate('sdp.admin.credentiallibrary.validport'),true);//NO I18N
					return false;
				}
			}
		}
		
		if( err )
		{
			return false;
		}
	}
	if( !isESMDirectory )
	{
		if( jQuery("#enableSecureAttach").is(":checked") )
		{
			var securePwd = jQuery("#securePwd").val();

			if( securePwd == "" )
			{
				showCustomError(jQuery("#securePwd"), translate('sdp.common.error.empty', ['Secure attachment password']));//NO I18N
				return false;
			}
			else if( securePwd.length > 50 )
			{
				showCustomError(jQuery("#securePwd"), translate('sdp.pwdpolicy.max.length.warning', [50]));//NO I18N
				return false;
			}
		}
	}
	return true;
}

function showHttpConfirm(){
if( jQuery('#http').is(":checked"))
	{
		if(jQuery('#isSelfSigned').val().indexOf("false") > -1)
		{
                    var options1 = 'message='+ translate('sdp.security.settings.confirm.delete.cert')+ ',submitbutton=' + translate('sdp.admin.security.dwnldnproceed')+',submitbutton2='+ translate('sdp.admin.translation.proceed') +', cancelbutton='+translate('sdp.common.cancel'); //No I18N
                    showconfirm(true,options1,formsubmit2);
                }else{
			submitSSData();
		}
	}
	else
	{
		submitSSData();
	}
}

function formsubmit2(boo,btn){
if(boo){
        
        if(btn=='submitButton'){
            //alert('download and save');
            window.location.href = '/importssl/controller?action=downloadSSLCert';

            
        }
        submitSSData();
        //var x = document.getElementsByTagName('form');
        //alert('Form will be submitted');
        
        //x[0].trigger('submit'); //form submission
    }
    else
    {
        return false;
    }
}

/*
 * Method used to construct security settings fields data to JSON.
 */
function constructSSJSON()
{
	var ssData = {};
	if( isMDHSetup == "false" || ( isMDHSetup == "true" && isESMDirectory ) )
	{
		var isDomainSearchEnabled = "no";//NO I18N

		if (jQuery("#domainSearch").is(":checked")) {
			isDomainSearchEnabled = "yes";//NO I18N
		}

		ssData.inactive_session_timeout= parseInt(jQuery('#sessionTimeout').val());

		ssData.fetch_user_domain_inlogin_page = isDomainSearchEnabled;

		var isDomainDropDownEnabled = "no"; //No I18N

		if (jQuery('#domainDropDown').is(':checked')) {
			isDomainDropDownEnabled = "yes"; //No I18N
		}

		ssData.enable_domain_dropdown = isDomainDropDownEnabled;

		var ssFields = ["disableClipboardContentOnPasswordFields","disableDataCompression"];//NO I18N

		for (var i = 0; i < ssFields.length; i++) {
			var ssField = ssFields[i];
			ssData[ssField] = jQuery("#"+ssField).is(":checked"); //NO I18N;
		}

		var resHeader = {};

		if( jQuery("#enableSecurityHeaders").is(":checked") && jQuery("#securityHeaders div[id^=responseHeader]").length > 0 )
		{
			jQuery("#securityHeaders div[id^=responseHeader_]").each(function(){

				var baseId = jQuery(this).attr('id').split('_')[1];

				if( jQuery(document.getElementById('hName_'+baseId)).find(':selected').val() != "-1" )
				{
					var headerName = jQuery(document.getElementById('hName_'+baseId)).find(':selected').text();//NO I18N

					var headerValue = jQuery(document.getElementById('hValue_'+baseId)).val();//NO I18N

					if( headerValue != "" )
					{
						resHeader[headerName] = headerValue;
					}
				}
			});
		}

		ssData.response_headers = resHeader;

		var attempt = 'null';//NO I18N

		var time = 'null';//NO I18N

		var lockedMsg = 'null';//NO I18N

		var isEmailNotify = false;

		var isTechSpaceNotify = false;

		var technicianList = [];

		var badLoginConfig = {};

		badLoginConfig.is_user_based_lock = false;
		
		if( jQuery("#noOfAttempt").val() > 0 && jQuery("#unlockTime").val() > 0 && jQuery("#enableLockAcc").is(":checked") )
		{
			attempt = parseInt(jQuery("#noOfAttempt").val());

			time = parseInt(jQuery("#unlockTime").val());

			lockedMsg = jQuery('#lockedMessage').val();

			isEmailNotify = jQuery('#emailNotify').is(':checked');//NO I18N

			isTechSpaceNotify = jQuery('#technicianSpaceNotify').is(':checked');//NO I18N

			jQuery("#notifyTo").find(':selected').each(function(){

				var technician = {};

				var nameAndEmail = jQuery(this).text().replace(/ /g, "");

				var name = nameAndEmail.substring(0, parseInt(nameAndEmail.indexOf(jQuery(this).attr('email').replace(/ /g, ""))-1));

			technician.id = jQuery(this).val();
				technician.name = name; 
				technician.email_id= jQuery(this).attr('email');

				technicianList.push(technician);
			});
			
			badLoginConfig.is_user_based_lock= jQuery('#UserBasedLock').is(':checked');//NO I18N
		}

		if(attempt != 'null')
		{
			badLoginConfig.no_of_bad_login_allowed = attempt; 
		}

		if( time != 'null' )
		{
			badLoginConfig.auto_unlock_interval_time = time; 
		}

		badLoginConfig.message_for_locked_account = lockedMsg;

		badLoginConfig.notify_locked_account_to = technicianList;

		badLoginConfig.email_notify = isEmailNotify;

		badLoginConfig.technician_space_notify = isTechSpaceNotify;

		ssData.bad_login_configuration = badLoginConfig;

		var protocolConfig = {};

		protocolConfig.port = parseInt(jQuery("#webPort").val());

		if( jQuery("#http").is(":checked") )
		{
			protocolConfig.protocol = 'http';//NO I18N
		}
		else
		{
			protocolConfig.protocol = 'https';//NO I18N

			var tls = [];
			jQuery("#server-tls").find(':selected').each(function(){
				tls.push(jQuery(this).val());
			});

			var ciphers = [];
			jQuery("#server-ciphers").find(':selected').each(function(){
				ciphers.push(jQuery(this).val());
			});

			protocolConfig.supported_tls = tls;
			protocolConfig.supported_ciphers = ciphers;
		}

		ssData.server_configuration = protocolConfig;

	if( jQuery('#enableKeepMeSign').is(':checked') )
	{
		var noOfExpireDays = jQuery("#noOfExpireDays").val();

		if( noOfExpireDays > -1 )
		{
			ssData.rememberme_expiry_date = parseInt(noOfExpireDays);
			
			ssData.enable_keep_me_sign = "true";
		}
	}
	else
	{
		ssData.enable_keep_me_sign = "false";
		}
	
	ssData.enable_forgot_password = jQuery("#enableForgotPassword").is(":checked"); //NO I18N

	var disableConcurrentLogin = jQuery("#disableConcurrentLogin").is(":checked"); //NO I18N
	
	ssData.disableConcurrentLogin = disableConcurrentLogin;
	
	var removeExifMetadata = jQuery("#removeExifMetadata").is(":checked"); //NO I18N
	
	ssData.removeExifMetadata = removeExifMetadata;
	
	var disableThrottles = !jQuery("#disableThrottles").is(":checked"); //NO I18N

	ssData.disableThrottles = disableThrottles;

	if(!ssData.disableThrottles){
		ssData.enablePushNotificationForURLAccessViolation = jQuery("#enablePushNotificationForURLAccessViolation").is(":checked"); //NO I18N
	}

	ssData.avConfig = { "enable_AV" : jQuery('#enableAV').is(':checked'), "av_service" : jQuery("#av_servicename").val() , "av_host" : jQuery("#av_host").val(), "av_port" : jQuery("#av_port").val()  };//NO I18N

		if( jQuery('#disableLastLogin').is(':checked') )
		{
			ssData.disableLastLogin = false;
		}
		else
		{
			ssData.disableLastLogin = true;
		}
	
	}
	if( !isESMDirectory )
	{
		var secureAttachObj = {};

		var isEnableSecureAttachments = "no";//NO I18N

		if( jQuery("#enableSecureAttach").is(':checked') )
		{
			isEnableSecureAttachments = "yes";//NO I18N
		}

		secureAttachObj.is_enabled = isEnableSecureAttachments;

		if( isEnableSecureAttachments == "yes" )
		{
			var authKey = jQuery("#securePwd").val();

			secureAttachObj.authkey = encryptDataWithRSA(authKey);
		}

		ssData.secure_attachments = secureAttachObj;

		ssData.disable_local_ip = jQuery("#disableLocalIP").is(":checked"); //NO I18N

		var userRestrictedFields = {};

		var restrictionType = jQuery('input[name="techFieldRestrictionType"]:checked').val();

		if(restrictionType != undefined) {
	        if(restrictionType == 'all') {
                jQuery('#techRestrictedFields').val(null);
                jQuery('#techRestrictedFields').select2('data', '');  // No I18N
			}
            var restrictedFieldIds = jQuery('#techRestrictedFields').select2("data").map(function(data) {return data.id});  // No I18N

            userRestrictedFields.restriction_type = restrictionType;
            userRestrictedFields.restricted_fields = restrictedFieldIds;

            ssData.user_restricted_fields = userRestrictedFields;
        }
	}
	return ssData;
}

/*
 * Method to used when validate the fields data if error occur throw the custom error.
 */
function showCustomError( errorElement, errMsg, isAdvancedSettings )
{
	var switchTab = false;

	if( isAdvancedSettings == undefined )
	{
		isAdvancedSettings = false;
	}

	var selectedTab = "settings";//NO I18N

	if( jQuery('#advancedSettingsTab').hasClass('active') )
	{
		selectedTab = 'advancedSettings';//NO I18N
	}

	if( isAdvancedSettings && selectedTab == 'settings' )
	{
		switchTab = true;

		jQuery('#advancedSettingsTab').children('a').trigger('click');//NO I18N
	}
	else if( !isAdvancedSettings && selectedTab == 'advancedSettings' )
	{
		switchTab = true;

		jQuery('#settingsTab').children('a').trigger('click');//NO I18N
	}

	errorElement.parent().addClass('pos-rel');
	errorElement.parent().addClass('has-error');

	if( switchTab )
	{
		setTimeout(function(){showToolTipMessage(errorElement[0], errMsg, -1);}, 500);
	}
	else
	{
		showToolTipMessage(errorElement[0], errMsg, -1);
	}

	setTimeout(function(){errorElement.parent().removeClass('has-error');}, 4000);
}

/*
 * This method to used unlock to user accounts.
 */
function unlockedUsers(isSDP)
{
	var lockIDs = table_lockedaccount.bulkSelect.getSelectedIDs();
	if( lockIDs.length > 0 )
	{
		jQuery('#processing').removeClass('hide');//No I18N
		jQuery('#unlock-submit').addClass('hide');//No I18N
		sdpAjax({
			type: 'delete',//NO I18N
			url: '/api/v3/locked_accounts?ids=' + lockIDs,//NO I18N
			dataType : 'json',//NO I18N
			success: function(jsonObj)
			{
				if( jsonObj.response_status[0].status_code == 2000 )
				{
					jQuery('#processing').addClass('hide');
					jQuery('#unlock-submit').removeClass('hide');
					showalert('success', translate("sdp.security.settings.unlock.success.msg"), 'isAutoHide=true');//NO I18N
					table_lockedaccount.refreshTable();
					setTimeout(function(){closeLockedAccountWindow(isSDP);}, 3000);
				}
				else
				{
					jQuery('#processing').addClass('hide');
					showalert('failure', jsonObj.responseJSON.response_status.messages[0].message, 'isAutoHide=true');//NO I18N
					setTimeout(function(){jQuery('#unlock-submit').removeClass('hide');}, 3000);
				}
			},
			error: function(jsonObj)
			{
				jQuery('#processing').addClass('hide');
				setTimeout(function(){jQuery('#unlock-submit').removeClass('hide');}, 3000);
			}
		});//NO I18N
	}
	else
	{
		alert(translate('sdp.admin.locked.account.empty.data.err'));
		return false;
	}
}


/*
 * Method to used if bad login is not configured so redirect to configure page.
 */
function configureBadLogin()
{
	if( window.name == "lockeduserdetails" ) 
	{
		window.close();
	}
	else
	{
		window.location.href = '/SetUpWizard.do?forwardTo=securitysettings';
	}
}

/*
 * Method to used account is locked to more then ip address(es) so redirect to locked account list view.
 */
function showMoreAccountLockList(userId)
{
	if( jQuery('#_DIALOG_LAYER').length > 0 )
	{
		closeDialog();
		NewWindow('/jsp/lockeduserdetails.jsp?userid='+userId, 'lockeduserdetails', '1200', '700', 'no', 'top');
	}
	else
	{
		window.location.href = '/jsp/lockeduserdetails.jsp?userid='+userId;
	}
}

function updateLeftCount(lockMsg)
{
	var length = lockMsg.length;

	if( length < 250 )
	{
		jQuery("#left_char").html(250 - length);
		jQuery("#left_char").removeClass("text-mandatory");//NO I18N
	}
	else
	{
		jQuery("#lockedMessage").val(lockMsg.substring(0, 250));
		jQuery("#left_char").html(0);
		jQuery("#left_char").addClass("text-mandatory");//NO I18N
	}
}

function showsslimport()
{
	jQuery("#importsslbtn").show().fadeOut(1000).fadeIn(1000).fadeOut(1000).fadeIn(1000);
    jQuery('html, body').animate({
      scrollTop: jQuery("#importsslbtn").offset().top - 100
  }, 1000); 
}

function hidesslimport()
{
	jQuery("#importsslbtn").hide(); 
}

function checkmodeforsslimport()
{
	if(jQuery('#https')[0].checked){
		//SD-114441 issue fix
		if(jQuery("#tab_1_1").is(":visible") && jQuery("#importsslbtn").is(":hidden"))
                	showsslimport();	
	} else {
		hidesslimport();
	}
}
function selectDomainDropDown()
{
	if( jQuery('#domainDropDown').is(':checked'))
	{
		jQuery('#domainSearch').prop('disabled', false); //No I18N
		jQuery('#domainFilterDiv').removeClass('opac5');
	}
	else
	{
		jQuery('#domainSearch').prop('disabled', true); //NO I18N
		jQuery('#domainFilterDiv').addClass('opac5');
	}
}
function setSecuritySettingsAtribute()
{
	jQuery("#security_settings_history").attr("search-filter","security_setting");
	jQuery("#security_settings_history").attr("data-id","security_settings");
	jQuery("#security_settings_history").attr("skip-filter-options","operationName,entity");
	jQuery("#security_settings_history").attr("entity-key",translate("sdp.admin.security.settings.key"));
	//SD-106898  starts
    jQuery("#saving").show();
    // SD-106898 ends
}
function getPwdPolicy()
{
//	jQuery('#pwdPolicyDiv').removeClass('hide');//NO I18N
	//SD-106898  starts
	jQuery("#saving").show();
	// SD-106898 ends
    var param = {};
    var url = "/servlet/AuthenticationServlet"//NO I18N
    if(window.sdp_user !== undefined && sdp_user.LOGGEDIN_USERID != undefined && sdp_user.LOGGEDIN_USERID != null) {
        url = "/servlet/AJaxServlet"//NO I18N
    } else {
        param.token = jQuery("#token").val();
    }
    jQuery("#security_settings_history").attr("search-filter","password_policy");
    jQuery("#security_settings_history").attr("data-id","password_policies");
    jQuery("#security_settings_history").attr("entity-key",translate("sdp.pwdpolicy.label"));
    jQuery("#security_settings_history").attr("skip-filter-options","entity");
    jQuery("#security_settings_history").attr("skip-operation-names","delete");
	jQuery.ajax({
    url: url + '?action=getPwdPolicy', //No I18N
    data: param,
    type: 'GET',//NO i18N
    success: function(data) 
    {
    	var jqBody = jQuery('body');
    	 if(data.isPwdPolicyEnabled)
    	 {
    	 	jQuery("#pwdPassCheckBox").prop("checked", true);//NO I18N
    	 	jqBody.find('#securitysettings').find('[data-disable=true]').prop('disabled', false); //NO I18N

    	 	 jQuery("#minPwdLength").val(data.min_length);
    	 	 
    	 	 jQuery("#mixedChar").prop("checked", data.mixed_case);//NO I18N
    	 	 jQuery("#splChar").prop("checked", data.splChar); //NO I18N
    	 	 
    	 	 if(parseInt(data.previous_password)!=-1) 
    	 	 {
    	 	  		jQuery("#prevPasswSelect").val(data.previous_password);
    	 	  		jQuery('#prevPasswSelect').prop("disabled", false); //NO I18N
    	 	  		jQuery("#prevPassChck").prop("checked", true); //NO I18N
    	 	 }
    	 	 else
    	 	 {
    	 	  	    jQuery("#prevPasswSelect").val(3);
    	 	  		jQuery('#prevPasswSelect').prop("disabled",true); //NO I18N
    	 	  		jQuery("#prevPassChck").prop("checked", false); //NO I18N
    	 	 }
    	 	  jQuery('#setPwdExp').val(data.password_age);
    	 }
    	 else
    	 {
    	 	jQuery("#pwdPassCheckBox").prop("checked", false);//NO I18N
    	 	jqBody.find('#securitysettings').find('[data-disable1=true]').prop('disabled',true); //NO I18N

    	 }
    	 if(data.forcePasswordReset){
     	 	jQuery("#forcePasswordReset").prop("checked", true);//NO I18N
    	 }else{
      	 	jQuery("#forcePasswordReset").prop("checked", false);//NO I18N
    	 }
    	 // SD-97937
         if(data.loginnameindepnt)
         {
         	jQuery("#loginnameindepnt").prop("checked", true);//NO I18N
         }
         else
         {
         	jQuery("#loginnameindepnt").prop("checked", false);//NO I18N
         }
         // SD-97937
    }
	});
}

function populateSecureAttachmentsConfig(secureAttachConfig) {
	if( secureAttachConfig.is_enabled ) {
		if( secureAttachConfig.is_enabled == "yes" ) {
			jQuery("#enableSecureAttach").prop("checked", true);//NO I18N
			if( secureAttachConfig.authkey ) {
				jQuery("#securePwd").val(secureAttachConfig.authkey);
			}
		} else {
			jQuery("#secureAttachConfig").hide();
		}
	}
}
function toggleSecurePwdVisibility(ele) {
	if(ele == null || ele == 'undefined') {
		ele = '#securePwdCtrl';//NO I18N
	}

	if(jQuery(ele).find('.cspr').hasClass('preview')) {
		var titleStr = translate("sdp.admin.hidepassword");
		document.getElementById('securePwd').type = 'text';
		jQuery(ele).attr('title',titleStr).uitooltip({content:titleStr}).find('.cspr').removeClass('preview').addClass('preview-hide1');
	} else {
		var titleStr = translate("sdp.admin.showpassword");
		document.getElementById('securePwd').type = 'password';
		jQuery(ele).attr('title',titleStr).uitooltip({content:titleStr}).find('.cspr').removeClass('preview-hide1').addClass('preview');
	}
}

function enableResetSecurePwd() {
	if(jQuery('#enableSecureAttach').is(':checked')) {
		jQuery("#securePwd").removeAttr('readonly').val('').focus();//NO I18N
		jQuery("#securePwdReset").addClass('hide');
	}
}

function showResetSecurePwd() {
	if(jQuery('#enableSecureAttach').is(':checked')) {
		var titleStr = translate("sdp.admin.showpassword");
		document.getElementById('securePwd').type = 'password';
		jQuery("#securePwdCtrl").attr('title',titleStr).uitooltip({content:titleStr}).find('.cspr').removeClass('preview-hide1').addClass('preview');
		jQuery("#securePwd").attr('readonly', 'readonly');
		jQuery("#securePwdReset").removeClass('hide');
	}
}

$passwordChecker = {
    jQuery: jQuery("body"), //NO I18N
    reference: jQuery("body"),
    configRules: {
        mixed_case: true,
        min_length: 8,
        isPwdPolicyEnabled: true,
        splChar: true,
        previous_enabled: false
    },
    validationLength: 0,
    serverCall: true,
    isPreviousPassCheck: false,
    button:"",
    init: function(element,button) {
        var self = this;
        $element = jQuery(element);
        self.button = jQuery(button);
        self.button.prop("disabled",true); //NO I18N

        if (self.serverCall) {
        	var param = {};
            var url = "/servlet/AuthenticationServlet"//NO I18N
            if(window.sdp_user !== undefined && sdp_user.LOGGEDIN_USERID != undefined && sdp_user.LOGGEDIN_USERID != null) {
                url = "/servlet/AJaxServlet"//NO I18N
            } else {
    			param.token = jQuery("#token").val();
            }
            sdpAjax({
                async: false,
                url: url + "?action=getPwdPolicy", //No I18N
                data: param,
                type: 'GET', //NO I18N
                success: function(res) {
                    self.configRules = jQuery.extend(self.configRules, res);
                    if (self.configRules.mixed_case) {
                        self.validationLength += 1;
                    }
                    if (self.configRules.min_length) {
                        self.validationLength += 1;
                    }
                    if (self.configRules.splChar) {
                        self.validationLength += 1;
                    }
                    self.serverCall = false;
                }
            });
        }
        if (self.configRules.isPwdPolicyEnabled) {
            /**
             * Keyup Event
             */
            jQuery("body").on("keyup", element, function() {
                self.validate(element);
            });
            /**
             * Foucsout
             * i.e User foucs out input close the popup
             */
            jQuery("body").on("focusout", element+',#pwdStrInfo', function() {
                closeDD();
              	if(jQuery(this).attr('id') === 'pwdStrInfo') {
              		// jQuery('#pwdStrInfo').find('input').attr('disabled','disabled'); // Issue on icon click - IE 11
				}
				(jQuery(this).attr('id') =='password') ? jQuery("#pwdStrInfo").trigger('focusout') : ''; //NO I18N
            });
            /**
             * Foucs IN
             */
            jQuery("body").on("focusin", element, function() {
           
	                jQuery('#pwdStrInfo').trigger('focusin');
	                    setTimeout(function() {
	                        jQuery(element).trigger('keyup');
	                        jQuery('.pwdreq-popup').css('display','block'); //NO I18N
	                    },1);
            });

            /**
             * click for info icon
             */
             jQuery("body").on("click", "#pwdStrInfo", function() {
             	jQuery(this).find('input').prop('disabled', false).trigger('focus'); //NO I18N
                    jQuery('#pwdStrInfo').trigger('focusin');
              // //  closeDD();
            });
        }
        else
        {
        	self.button.prop("disabled", false); //NO I18N
        }
        if("#changePwdButton" === button)
        {
            self.isPreviousPassCheck = true;
        }
        /**
         * Initialize the Popover
         */
        spInit();
    },
    validate: function(element) {
        var self = this;
        var val = jQuery(element).val();
        var noOfValidEntry = 0;
        /**
         * Check the Mixed Case
         */
        if (self.configRules.mixed_case) {
            var target = jQuery("[data-id='mixed_case']").find(".icon-sm").removeClass("danger success");
            if (self.mixed_case(val)) {
                target.addClass("success");
                noOfValidEntry++;
            } else {
                target.addClass("danger");
            }
        }
        /**
         * Mininum Length Checker
         */
        if (self.configRules.min_length) {
            var target = jQuery("[data-id='min_length']").find(".icon-sm").removeClass("danger success");
            if (self.min_length(val,self.configRules.min_length)) {
                target.addClass("success");
                noOfValidEntry++;
            } else {
                target.addClass("danger");
            }
        }
        /**
         * Check Special Character
         */
        if (self.configRules.splChar) {
            var target = jQuery("[data-id='splChar']").find(".icon-sm").removeClass("danger success");
            if (self.splChar(val)) {
                target.addClass("success");
                noOfValidEntry++;
            } else {
                target.addClass("danger");
            }
        }
        /**
         * Check for Previous Password Validation
         */
        if (noOfValidEntry == self.validationLength && parseInt(self.configRules.previous_password)!=-1 && self.isPreviousPassCheck)
        {
        	var param = {};
			param.newPwd = encryptDataWithRSA(val);
			param.token = jQuery("#token").val();
			param = {"input_data": JSON.stringify(param)};//NO I18N
            var url = "/servlet/AuthenticationServlet"//NO I18N
            if(window.sdp_user !== undefined && sdp_user.LOGGEDIN_USERID != undefined && sdp_user.LOGGEDIN_USERID != null){
                url = "/servlet/AJaxServlet"//NO I18N
            }

            sdpAjax({
            	url: url + "?action=checkNewPwd", //No I18N
                type: 'GET', //NO I18N
                data: param,
                success: function(res) {
                    var target = jQuery("[data-id='previous_password']").find(".icon-sm").removeClass("danger success");
		                 if(res.status === "Success") {
                        target.addClass("success");
                        self.button.prop("disabled", false); //NO I18N
                    } else {
                        target.addClass("danger");
                        self.button.prop("disabled",true); //NO I18N
                    }
                }
            });
        	
        }
        else if(noOfValidEntry == self.validationLength)
        {
        	self.button.prop("disabled", false); //NO I18N
        }
        else
        {
        	var target = jQuery("[data-id='previous_password']").find(".icon-sm").removeClass("danger success");
        	target.addClass("danger");
        	self.button.prop("disabled",true); //NO I18N
        }

    },
    /**
     * Rule for Mixed Case
     */
    mixed_case: function(val) {
        return /[a-z]/.test(val) && /[A-Z]/.test(val);
    },
    /**
     * Minimum Length
     */
    min_length: function(val,min_length) {
        return val.length >= min_length;
    },
    /**
     * Special Charater
     */
    splChar: function(val) {
        return /\W|_/g.test(val);
    }
};

function checkICAPConnection()
{
	var icapButton = jQuery('#testICAPConnection');
	icapButton.button('loading');//NO I18N
        sdpAjax({
                type: 'GET',//NO I18N
                url: '/api/v3/security_settings?checkICAPConnection=true',//NO I18N
                success: function(jsonObj)
                {
                		icapButton.button('reset');//NO I18N
                        jsonObj = jsonObj.response_status;
                        var status = jsonObj.status;
                        if( status == 'failed' )
                        {
                                status = 'failure';//NO I18N
                        }
                        showalert(status, jsonObj.messages[0].message, 'isAutoHide=true');//NO I18N
                }
        });
};

function showUserFieldsPopUpForSecuritySettings(divContentId, inputBoxId) {
    switchUserFieldRestrictionType(divContentId, inputBoxId, storedUserFields, userConfiguredFields[1]);
}

var table_lockedaccount = {};
function initLockedAccountListview(lockId, userId) {
	var tableInfo = table_comp.getTableInfo('locked_account');//NO I18N
	var _self = this;
	var tableContent = {};
	tableContent.header = this.lockedAccountHeaderDataConstruct();
	var options = {};
	options.paginationEnabled   = true;
	options.searchEnabled       = true;
	options.sortingEnabled      = true;
	options.multiDeleteEnabled  = true;
	options.columnChooserEnabled = true;
	options.getmetaInfo         = true;
	options.personalize_key     = 'locked_account';//NO I18N
	options.row_inputdata       = _self.lockedAccountRowDataConstruct(tableInfo, _self);
	options.callbackRowfunction = _self.lockedAccountRowDataConstruct;
	options.callbackURL         = 'locked_accounts';//NO I18N
	options.entity_name         = 'locked_accounts';//NO I18N
	options.metainfo_entity     = 'locked_accounts';//NO I18N
	options.csrf_needed         = true;
	options.isODAPI             = true;
	options.bulkSelectionSetting= true;
	options.discarded_fields 		= ['id', 'first_name', 'middle_name', 'last_name'];//NO I18N
	table_lockedaccount = new tableComponent(tableInfo, tableContent, options);
}

function lockedAccountHeaderDataConstruct() {
	var _self = this;
	var header = {
		'locked_accounts_head_chk': {//NO I18N
			type: 'checkbox',//NO I18N
			'default': true,//NO I18N
			'dataCelltransformer': this.lockedAccountConstructCheckBoxCell//NO I18N
		},
		'first_name': {//NO I18N
			'text': getMessageForKey('sdp.requests.common.firstName'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'middle_name': {//NO I18N
			'text': getMessageForKey('sdp.admin.requesterCSVImp.middleName'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'last_name': {//NO I18N
			'text': getMessageForKey('sdp.requests.common.LastName'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'login_name': {//NO I18N
			'text': getMessageForKey('sdp.admin.user.loginname'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'ip_address': {//NO I18N
			'text': getMessageForKey('sdp.admin.locked.account.blocked.ip.address'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'updated_time': {//NO I18N
			'text': getMessageForKey('sdp.admin.locked.account.last.logon.time'),//NO I18N
			'disableSearching': true,//NO I18N
			'dataCelltransformer': this.lockedAccountConstructUpdatedTimeCell//NO I18N
		},
		'domain': {//NO I18N
			'text': getMessageForKey('sdp.admin.user.domainname'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData//NO I18N
		},
		'email_id': {//NO I18N
			'text': getMessageForKey('sdp.api.admin.user.primary.emaid'),//NO I18N
			'dataCelltransformer': this.populateLockedAccountData,//NO I18N
			'disableSorting': true,//NO I18N
		}
	};
	return header;
}

function lockedAccountRowDataConstruct(tableInfo, _self) {
	var inputObject = {};
	var list_info = tableInfo.list_info;
	inputObject.list_info = list_info;
	if(!tableInfo.column_order) {
		tableInfo.column_order = ['login_name', 'ip_address', 'updated_time', 'domain', 'email_id'];//NO I18N
	}
	if(!tableInfo.fields_required) {
		var columnOrder = tableInfo.column_order;
		var fields_required = {};
		columnOrder && columnOrder.forEach(function(field) {
			fields_required[field] = {};
		});
		tableInfo.fields_required = fields_required;
	}
	return inputObject;
}

function lockedAccountConstructCheckBoxCell(tableData) {
	var rData = tableData.row_data;
	return '<input type=\'checkbox\' value=\''+ rData.id + '\' data-table-checkbox>';
}

function lockedAccountConstructUpdatedTimeCell(tableData) {
	var rData = tableData.row_data;
	if(rData.updated_time && rData.updated_time.display_value) {
		return rData.updated_time.display_value;
	}
}

function populateLockedAccountData(tableData) {
	if(tableData.head_data.id === 'login_name') {
		return tableData.row_data.login_name;
	} else if(tableData.head_data.id === 'ip_address') {//NO I18N
		return tableData.row_data.ip_address;
	} else if(tableData.head_data.id === 'domain') {//NO I18N
		return tableData.row_data.domain;
	} else if(tableData.head_data.id === 'email_id') {//NO I18N
		return tableData.row_data.email_id == null ? '-' : tableData.row_data.email_id;
	} else if(tableData.head_data.id === 'first_name') {//NO I18N
		return tableData.row_data.first_name == null ? '-' : tableData.row_data.first_name;
	} else if(tableData.head_data.id === 'middle_name') {//NO I18N
		return tableData.row_data.middle_name == null ? '-' : tableData.row_data.middle_name;
	} else if(tableData.head_data.id === 'last_name') {//NO I18N
		return tableData.row_data.last_name == null ? '-' : tableData.row_data.last_name;
	}
}

// SD-106898 related methods starts

var contactCollection = {

	isUpdate:false,
	contactId:null,
	jsonobj:{},
// Used to save the contact collection form data's
saveContactDetails: function(){
	var contactConfig={},emailid,phonenumber,country,state,organization;
	emailid=jQuery("#emailIdCC");
	phonenumber=jQuery("#phoneCC");
	country=jQuery("#countryCC");
	state=jQuery("#stateCC");
    organization=jQuery("#organizationCC");
    jQuery("#alertbox").remove(); // Removing previous success message alert popup
	if(!jQuery('#securitysettings').valid())
	{
        return;
	}
	if(sdp_app.IS_DEMO_BUILD)
    {
    	disableForDemo();
        return;
    }
    jQuery("#loadingDiv").show();
	if(jQuery("#countryCC option:selected").text()==="United States")
	{
		if(state.val().trim().length)
		{
			contactConfig.state=state.val();
		}
	}
	else
	{
		contactConfig.state=null;
	}

    contactConfig.organization=organization.val();
	contactConfig.email_id="";
	var emailArray=emailid.select2('data');//No I18N
	if(emailArray.length)
	{
		emailArray.forEach(function(mailId){
			contactConfig.email_id+=mailId.text;
			contactConfig.email_id+=",";
		});
	contactConfig.email_id = contactConfig.email_id.substring(0, contactConfig.email_id.length - 1);
	}
	contactConfig.country=country.val();
	if(phonenumber.val().trim().length)
	{
		contactConfig.phone_number=phonenumber.val();
	}
	else
	{
		contactConfig.phone_number=null;
	}

	var contactUrl = "/api/v3/contact_collections/";// NO I18N
	var method="POST";// NO I18N
	if(contactCollection.isUpdate)
	{
		contactUrl+=contactCollection.contactId;
		method="PUT";// NO I18N
	}

	var input_data={"contact_collection":contactConfig};// NO I18N

	sdpAjax({
		url: contactUrl,
		type: method,
		data: {input_data:sdpToJSON(input_data)},
		success: function(data)
		{
			if("success"==data.response_status.status)
			{
				showalert('success',translate("contact.collection.save.message"), 'isAutoHide=true'); // No I18N
				jQuery("#loadingDiv").hide();
				if(data.contact_collection.id!=null)
				{
					contactCollection.isUpdate=true;
					contactCollection.contactId=data.contact_collection.id;
				}
			}
			else
			{
				showalert('failure', data.response_status.message, 'isAutoHide=false'); // No I18N
			}
		}
	});
},

// Used to get the contact collection form data from Server
getContactConf : function()
{
	var sshistory = jQuery("#security_settings_history");
	sshistory.attr("search-filter","contact_collection");
    sshistory.attr("data-id","contact_collections");
    sshistory.attr("entity-key",translate("contact.collection.header"));
    sshistory.attr("skip-filter-options","entity");
    sshistory.attr("skip-operation-names","delete");
    sdpAjax({
        url: "/api/v3/contact_collections", //No I18N
        method: "GET", //No I18N
        skipSUBREQUEST:true,
        success: function(dataArg)
        {
			if(dataArg.contact_collections.size()>0)
			{
				contactCollection.isUpdate=true;
				contactCollection.contactId=dataArg.contact_collections[0].id;
				if(dataArg.contact_collections[0].phone_number!=null)
				{
					contactCollection.jsonobj.phoneNumber=dataArg.contact_collections[0].phone_number;
				}
				if(dataArg.contact_collections[0].country!=null)
				{
					contactCollection.jsonobj.country=dataArg.contact_collections[0].country;
				}
				if(dataArg.contact_collections[0].state!=null)
				{
					contactCollection.jsonobj.state=dataArg.contact_collections[0].state;
				}
				if(dataArg.contact_collections[0].email_id!=null)
				{
					contactCollection.jsonobj.email_id=dataArg.contact_collections[0].email_id;
				}
				if(dataArg.contact_collections[0].organization!=null)
				{
					contactCollection.jsonobj.organization=dataArg.contact_collections[0].organization;
				}
			}
			else
            {
            	contactCollection.isUpdate=false;
            	contactCollection.jsonobj.phoneNumber=null;
            	contactCollection.jsonobj.country=null;
            	contactCollection.jsonobj.state=null;
            	contactCollection.jsonobj.organization=null;
            	contactCollection.jsonobj.email_id=null;
            }
			jQuery("#saving").hide();

			sdpAjax({
				url: "/api/v3/contact_collections/get_form_data", //No I18N
				method: "GET", //No I18N
				skipSUBREQUEST:true,
				success: function(dataArg)
				{
					if(dataArg.contact_collection.emailList!=null)
					{
						contactCollection.jsonobj.emailList=dataArg.contact_collection.emailList;
					}
					if(dataArg.contact_collection.countryMap!=null)
					{
						contactCollection.jsonobj.countryMap=dataArg.contact_collection.countryMap;
					}
					if(dataArg.contact_collection.stateMap!=null)
					{
						contactCollection.jsonobj.stateMap=dataArg.contact_collection.stateMap;
					}
					if(dataArg.contact_collection.pendingEmails!=null)
					{
						contactCollection.jsonobj.pendingEmails=dataArg.contact_collection.pendingEmails;
					}
					if(dataArg.contact_collection.expiredEmails!=null)
					{
						contactCollection.jsonobj.expiredEmails=dataArg.contact_collection.expiredEmails;
					}
					if(dataArg.contact_collection.verifiedEmails!=null)
					{
						contactCollection.jsonobj.verifiedEmails=dataArg.contact_collection.verifiedEmails;
					}
					contactCollection.jsonobj.pendingEmailsCount=dataArg.contact_collection.pendingEmailsCount;
					contactCollection.jsonobj.expiredEmailsCount=dataArg.contact_collection.expiredEmailsCount;
					contactCollection.jsonobj.verifiedEmailsCount=dataArg.contact_collection.verifiedEmailsCount;
					contactCollection.jsonobj.lastSyncTime=dataArg.contact_collection.lastSyncTime;
					renderhbs("#securityAlert","contact_collection",contactCollection.jsonobj,false,'admin');// No I18N
					var contact_collection = jQuery("#securityAlert");
					contact_collection.find('#emailIdCC').select2({"closeOnSelect": false,
						placeholder:' -- '+ translate("contact.collection.email.select") + ' --',
						formatNoMatches: function(term) {
							return getMessageForKey("ae.select2.no.message");
						  },
						  formatSelection : function formatSelection(result)
						  {
							if(contactCollection.jsonobj.pendingEmailsCount>0 && contactCollection.jsonobj.pendingEmails.includes(result.text))
							{
								return '<span class="cspr danger icon-sm top0"></span> ' + result.text;
							}
							else if(contactCollection.jsonobj.expiredEmailsCount>0 && contactCollection.jsonobj.expiredEmails.includes(result.text))
							{
								return '<span class="cspr warning icon-sm top0"></span> ' + result.text;
							}
							else if(contactCollection.jsonobj.verifiedEmailsCount>0 && contactCollection.jsonobj.verifiedEmails.includes(result.text))
							{
								return '<span class="cspr success icon-sm top0"></span> ' + result.text;
							}
							else
							{
								return result.text;
							}
						  }
					});
					contact_collection.find("#countryCC").select2({
						placeholder:' -- '+ translate("sdp.admin.site.select.country") + ' --',
						sortResults: function(data)
						{
							data = data.sort(function compare(a, b) {
							return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);
							});
							return data;
						}
						});
					contact_collection.find('#stateCC').select2({
						placeholder:' -- '+ translate("contact.collection.state.select") + ' --'
					});
					var emailIdArray=[];
					if(contactCollection.jsonobj.email_id!=null)
					{
						var emailArray=contactCollection.jsonobj.email_id.split(",");
						if(emailArray)
						{
						for(var iter=0;iter<emailArray.length;iter++)
						{
							var emailObj={};
							emailObj.id=emailArray[iter];
							emailObj.text=emailArray[iter];

							emailIdArray.push(emailObj);
						}
						contact_collection.find("#emailIdCC").select2("data", emailIdArray);//No I18N
						}
					}
					contact_collection.find("#countryCC").select2("val", contactCollection.jsonobj.country);//No I18N
					contact_collection.find("#stateCC").select2("val", contactCollection.jsonobj.state);//No I18N
					if(jQuery("#countryCC option:selected").text() == "United States")
					{
						contact_collection.find("#stateDiv").removeClass("hide");
						contact_collection.find("#stateCC").attr("disabled",false);
					}
					else
					{
						contact_collection.find("#stateDiv").addClass("hide");
						contact_collection.find("#stateCC").attr("disabled",true);
					}
					initTooltip("#securityAlert");// No I18N
					jQuery("#loadingDiv").hide();
					cl_form.addRules();
					var rules={
						organizationCC:{
						required:true,
						noBlankSpace:true
					  },
					  countryCC:{
						select:true
					  },
					  emailIdCC:{
						required:true
					  },
					  stateCC:{
						  select:true
					  },
					  phoneCC:{
						  minlength:10,
						  noBlankSpace:true,
						  regex:"^([0-9A-Za-z\-\(\)\ \+])+$" // No I18N
					  }};
					var messages={
						organizationCC:{
						required: translate("contact.collection.organization.valid")
					  },
					  countryCC:{
						select:translate("contact.collection.country.valid")
					  },
					  emailIdCC:{
						required:translate("contact.collection.emailid.valid")
					  },
					  stateCC:{
						select:translate("contact.collection.state.valid")
					  },
					  phoneCC:
					  {
						regex:translate("contact.collection.phone.valid"),
						minlength:translate("contact.collection.phone.minlength",[10])
					  }};
					jQuery("#securitysettings").removeData("validator");        // No I18N
					initFormValidator("securitysettings", rules, messages);     // No I18n
				}
			});


        }
    });
},

// Used to show State field only if the country selected is 'United States'
showHideState : function(){
	var stateDiv=jQuery("#stateDiv");
    stateDiv.addClass("hide");
    if(jQuery("#countryCC option:selected").text() == "United States"){
    	stateDiv.removeClass("hide");
    	jQuery("#securityAlert").find("#stateCC").attr("disabled",false);
    }
    else
    {
    	jQuery("#securityAlert").find("#stateCC").select2("val","");// No I18N
    	jQuery("#securityAlert").find("#stateCC").attr("disabled",true);
    }
},

showPendingDialog : function(){
	jQuery('#pendingVerficationContainer').dialog({
        title: getMessageForKey('contact.collection.opt.in.pending'),
        resizable: false,
        height: 600,
        width: 500,
        modal: true,
        draggable: true
    });
}

};
// SD-106898 related methods ends
