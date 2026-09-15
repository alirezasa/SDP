var solarwindsMsg = "";
function get_server_settings(){
    jQuery('#solarwindsProgress').css('display','none'); //NO I18N
	jQuery('#solarwindsSuccess').css('display','none'); //NO I18N
	jQuery('#solarwindsFailed').css('display','none'); //NO I18N
   	sdpAjax({
   		  type: 'GET',//no i18n
   		  ignorefailuremessage: true,
   		  url: '/servlet/AJaxServlet',//no i18n
   		  data: 'action=getSolarwindsServerDetails', //No I18N
   		  success: function(resp) {
   		 	if(resp.integration_exists == true){
   		 	    var showCustomTrustStore = true;
   		 		jQuery('#serverName').val(resp.SERVER_NAME);
   		 		jQuery('#username').val(resp.USER_NAME);
   		 		jQuery('#solarwindsStartDate_Display').val(resp.next_schedule);
   		 		jQuery('#solarwindsStartDate').val(encodeHTML(resp.start_date));
	     		jQuery('#repeatFrequency').val(encodeHTML(resp.repeat_freq));
	     		jQuery('#remove').prop('disabled', false);   //NO I18N
	     		swapRows('solarwindsPwdReset','solarwindsPwdInput'); //NO I18N
	     		jQuery('#solarwindsPrevScheduleValue').html(encodeHTML(resp.prev_schedule));
	     		jQuery('#solarwindsNextScheduleValue').html(encodeHTML(resp.next_schedule));
	     		jQuery("#solarwindsSchedule").removeClass("hide").addClass("show");

     		if(resp.scan_status != "-"){
     			if(resp.scan_status=="running"){
     				jQuery('#solarwindsProgress').css('display','inline-block'); //NO I18N
     			}
     			else if(resp.scan_status=="success"){
     				jQuery('#solarwindsSuccess').css('display','inline-block'); //NO I18N
     				solarwindsMsg = getMessageForKey('sdp.discovery.sccm.tooltip.lastscan') + ' : <ui>';//NO I18N
     				var list_rows = resp.audit.list_rows;
     				for(i=0;i<list_rows.length;i++){
     					solarwindsMsg = solarwindsMsg + '<li>' + encodeHTML(list_rows[i]) + '</li>';
     				}
     				solarwindsMsg = solarwindsMsg + '</ui>'; //NO I18N
     			}
     			else if(resp.scan_status=="failure"){
     				jQuery('#solarwindsFailed').css('display','inline-block'); //NO I18N
     				solarwindsMsg = getMessageForKey('sdp.discovery.sccm.failurereason') + ' ' ;
     				var errorCode = resp.audit.errorCode;
     				if('href_link' in resp.audit){
     					var href_lik = encodeURI(resp.audit.href_link);
     					var href_text = encodeHTML(resp.audit.href_text);
     					var msg = encodeHTML(resp.audit.msg);
     					solarwindsMsg = msg + '<a href="/" id="failureMsgLink" data-href="'+href_lik+'" >' + href_text + '</a>'; //NO I18N
     				}
     				else{
     					solarwindsMsg = encodeHTML(resp.audit.msg);
     				}
     				if(errorCode == 9) {
     				    solarwindsMsg = encodeHTML(resp.audit.msg);
                        if('failedUrl' in resp) {
                            showCustomTrustStoreWarning(resp.failedUrl);
                            showCustomTrustStore = false;
                        }
                    } else if(errorCode == 10) {
                        solarwindsMsg = encodeHTML(resp.audit.msg);
                        if('failedUrl' in resp) {
                            showCustomTrustStoreWarning(resp.failedUrl);
                            showCustomTrustStore = false;
                        }
                     }
     				solarwindsMsg = getMessageForKey('sdp.discovery.sccm.failurereason') + ' ' +solarwindsMsg;
     			}					
   			}
     		else{
     			jQuery('#solarwindsNoScan').css('display','inline-block'); //NO I18N	
     		}
     		if(showCustomTrustStore && resp.isTrustStoreNeeded == false) {
     		    showCustomTrustStoreConfigured();
     		}
    	}
 		else{
 			jQuery('#remove').prop('disabled', true);   //NO I18N
 		 	swapRows('solarwindsPwdInput','solarwindsPwdReset'); //NO I18N
 		 	jQuery("#solarwindsSchedule").removeClass("show").addClass("hide");
 		}
   },
   error: function(resp){
   jQuery('#remove').prop('disabled', true);   //NO I18N
   	swapRows('solarwindsPwdInput','solarwindsPwdReset'); //NO I18N
    	}
   	});
   }
   
   function showSolarwindsStatus1(e,status){
	   e.stopPropagation();
	   showalert(status,solarwindsMsg,'isAutoHide=false,width=auto');               //NO I18N
   }
   
   function remove_server_settings(){
   	sdpAjax({
   		  type: 'POST',//no i18n
   		  ignorefailuremessage: true,
   		  url: '/servlet/AJaxServlet',//no i18n
   		  data: 'action=removeSolarwindsSettings', //No I18N
   		  success: function(resp) {
   		 		if(resp.status == true){
   		 			if('msg' in resp){
   		 				showalert('failure', ZSEC.Encoder.encodeForHTML(resp.msg),'isAutoHide=false,width=auto');               //NO I18N
   		 			}
   		 			else{
   		 				showalert('success',getMessageForKey('sdp.discovery.swintegration.success.remove'),'isAutoHide=true,delay=3,width=auto');               //NO I18N	
   		 			}
   		 			jQuery('#serverName').val('');
    		 		jQuery('#username').val('');
    		 		jQuery('#solarwindsPassword').val('');
    		 		jQuery('#solarwindsStartDate_Display').val('');
    		 		jQuery('#solarwindsStartDate').val('');
    				jQuery('#repeatFrequency').val('');
               		jQuery('#remove').prop('disabled', true);   //NO I18N
					jQuery('#CustomTrustStoreConfiguredSection').empty();
			        jQuery('#CustomTrustStoreSection').empty();
               		swapRows('solarwindsPwdInput','solarwindsPwdReset'); //NO I18N
               		jQuery("#solarwindsSchedule").removeClass("show").addClass("hide");
    		   	    
   		 		}else
   		 			showalert('failure',getMessageForKey('sdp.discovery.swintegration.failure.remove'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   		 		},
   		 	error: function(resp){
   		 		showalert('failure',getMessageForKey('sdp.discovery.swintegration.failure.remove'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   	   		 }
   		});
   }
   
   
   function save_server_settings(){
   
   	var serverName = jQuery('#serverName').val();
   	var userName = jQuery('#username').val();
   	var password = jQuery('#solarwindsPassword').val();
   	var startDate = jQuery('#solarwindsStartDate').val();
   var repeatFreq = jQuery('#repeatFrequency').val();
   var isCheckBoxEnable =  jQuery("[name=solarwinds_integrationCustomTrustStore]").is(":checked"); //NO I18N

   var param = 'action=testAndSaveSolarwindsServerDetails'; //NO I18N
   jQuery('#remove').prop('disabled', true);   //NO I18N
   	if(serverName == null || serverName == '')
   {
   showalert('failure',getMessageForKey('sdp.discovery.swintegration.emptyhostname'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   return;
   }
   	if(userName == null || userName == '')
   {
   showalert('failure',getMessageForKey('sdp.discovery.swintegration.emptyusername'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   return;
   }
   	if(jQuery('#solarwindsPwdInput').hasClass('show')){
   		if(password == null || password == ''){
   		   showalert('failure',getMessageForKey('sdp.discovery.swintegration.emptypassword'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   		   return;
   		}
   		else{
   			password = encryptDataWithRSA(password);
   	   		param = param + '&password='+encodeURIComponent(password); //NO I18N
   		}
   	}
   if(startDate.length == 0)
   {
   showalert('failure',getMessageForKey('sdp.discovery.sccm.blankstartdate'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   return;
   }
   if(repeatFreq == '0' || !(/^[0-9]+$/.test(repeatFreq)))
   {
   showalert('failure',getMessageForKey('sdp.discovery.sccm.invalidfrequency'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   return;
   }
   	var saveBtn = jQuery("#saveSolarwinds").button('loading'); //NO I18N
   	jQuery('#CustomTrustStoreSection').empty();
   	jQuery('#CustomTrustStoreConfiguredSection').hide();
    param = param + '&serverName='+encodeURIComponent(serverName)+'&userName='+encodeURIComponent(userName)+'&startDate='+parseInt(startDate)+'&repeatFreq='+parseInt(repeatFreq)+'&isCheckBoxEnable='+isCheckBoxEnable;  //NO I18N
   	sdpAjax({
   		  type: 'POST',//no i18n
   		  ignorefailuremessage: true,
   		  url: '/servlet/AJaxServlet',//no i18n
   		  data: param,
   		  success: function(resp) {
              if(resp!=null && resp.status == 'Success') {
                  showalert('success', resp.msg,'isAutoHide=true,delay=3,width=auto'); //resp.mssg as 'sdp.discovery.swintegration.success.save' //NO I18N
                  get_server_settings();
              } else if(resp!=null && resp.status == 'Failure') {//NO I18N
                    if('failedUrl' in resp) {
                        showalert('failure', resp.msg,'isAutoHide=true,delay=3,width=auto');//resp.msg as 'swintegration.hostname.failure.testsslandsave','Solariwnds.pkix.alert.failure' //NO I18N
                        showCustomTrustStoreWarning(resp.failedUrl);
                    } else if('msg' in resp) {//NO I18N
                        showalert('failure', resp.msg,'isAutoHide=true,delay=3,width=auto');//resp.msg as 'sdp.discovery.swintegration.failure.save' //NO I18N
                    }
                    else {
                        showalert('failure',getMessageForKey('sdp.admin.testmail.incoming.30'),'isAutoHide=true,delay=3,width=auto');//NO I18N
                    }
              }
            jQuery('#remove').prop('disabled', false);   //NO I18N
   		  },
   		 error: function(resp) {
   			showalert('failure',getMessageForKey('sdp.admin.testmail.incoming.30'),'isAutoHide=true,delay=3,width=auto');               //NO I18N
   			jQuery('#remove').prop('disabled', false);   //NO I18N
   		 },
   		 complete: function() {
   			saveBtn.button('reset'); //NO I18N
   		 }
   		});
   		
   }
   //Method to show customTrustStore alert, when there are failed urls
    function showCustomTrustStoreWarning(failedUrls)  {
        var customtruststore={};
        customtruststore.status='warning';//No I18n
        customtruststore.failedUrls = failedUrls;
        customtruststore.module='solarwinds_integration';//NO I18N
        renderhbs("#CustomTrustStoreSection", "customtruststore-template",customtruststore,false,'admin');// No I18N
        jQuery('#CustomTrustStoreSection').show();
    }
	//Method to show customTrustStore configured alert.
    function showCustomTrustStoreConfigured() {
        var customtruststore={};
        customtruststore.status ='configured';//No I18n
        customtruststore.module='solarwinds_integration';//NO I18N
        renderhbs("#CustomTrustStoreConfiguredSection", "customtruststore-template",customtruststore,false,'admin');// No I18N
        jQuery('#CustomTrustStoreConfiguredSection').show();
    }
