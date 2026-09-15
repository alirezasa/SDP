/*jquery onready and onclick function handling starts*/
 jQuery(document).ready(function()
 {
   jQuery('#ap-setup-popup').on('click', function(){
       loadAPlusJson();
   });

   jQuery('#ap-next').on('click', function()
   {
     errScreen="";
     if(screenNo == 1)
      {
         installType = jQuery("input[name=radio]:checked").val();
         if(installType == 'same' && aplusJson.hasOwnProperty('ostypeError'))
          {
            showErrorScreen(aplusJson.ostypeError);
          }
         else
          {
            saveInstallationType();
          }
      }
     else if(screenNo == 2)
      {
         if(!jQuery('#ap-licChk').is(':checked'))
         {
           licenseChkDone=false;
           showFlowError(licenseScreen, getMessageForKey("qsetup.config.accept.license"));
           hideTDbuttons();
           showBNQbuttons();
         }
         else
         {
           licenseChkDone = true;
           setLicenseChkValue();
         }
      }
      else if(screenNo == 3)
      {
        aplusAdminEmail = jQuery('#ap-adminEmailId').val();
        if(!validateEmail(aplusAdminEmail)) {
          showFlowError(configScreen, getMessageForKey("qsetup.config.valid.email"));
          hideTDbuttons();
          showBNQbuttons();
        }
        else
        {
          doConfiguration();
        }
      }
      else
      {
        screenNo++;
        showScreen();
      }
   });

   jQuery('#ap-back').on('click',function() {
     screenNo--;
     if(screenNo < 1)
     {
        screenNo=1;
     }
     if(screenNo == 1)
     {
        licenseChkDone=false;
        setLicenseChkValue();
     }
     if(screenNo == 1 || screenNo ==2)
     {
      jQuery('.ap-privacy-link').hide();
     }
     showScreen();
   });

   jQuery('#ap-tryagain').on('click', function()
   {
     tryAgainQS();
   });

//to remove the attributes relevant to same server option setup.
   jQuery('#ap-doitmyself').on('click', function()
   {
        var currentTime= (new Date()).getTime();
        jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
           action:"doItMyself"//No I18N
    })
    .done(function(data,status,xhr){
       aplusJson = data.aplusJson;
       if(data.result == "success")
           {
                licenseChkDone=false;
                  showManualDownloadInfoPage();
           }
           else
           {
               showErrorScreen(data.message);
          }
    })
    .fail(function(data) {
     });
   });


     jQuery('#ap-quit').on('click', function() {
           if(screenNo == 1){
             installType="";
           }
           jQuery('.ap-minimizedWindow').hide();
   		var currentTime= (new Date()).getTime();
        jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
              action:"doItMyself"//No I18N
   		})
   		.done(function(data,status,xhr){
   		   aplusJson = data.aplusJson;
   		   if(data.result == "success")
              {
                   licenseChkDone=false;
				   aplusAdminEmail="";
				   jQuery('.ap-privacy-link').hide();
                   closeAplusQsetuppopup();
              }
              else
              {
                  showErrorScreen(data.message);
              }
        })
        .fail(function(data) {
        });

         }
      );


    jQuery('#ap-close').on('click', function() {
        if(screenNo == 4){
            jQuery('.ap-minimizedWindow').hide();
        }
		licenseChkDone=false;
		aplusAdminEmail="";
        closeAplusQsetuppopup();
        var currentTime= (new Date()).getTime();
        jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
                      action:"doItMyself"//No I18N
        })
        .done(function(data,status,xhr){
           		   aplusJson = data.aplusJson;
           		   if(data.result == "success")
                      {
                           licenseChkDone=false;
        				   aplusAdminEmail="";
        				   jQuery('.ap-privacy-link').hide();
                           closeAplusQsetuppopup();
                      }
                      else
                      {
                          showErrorScreen(data.message);
                      }
        })
        .fail(function(data) {
         });
          try {
             window.location.reload();
          }
          catch(err) {
          }
        }
    );
 });

jQuery(document).on('click','.ap-minimize',function(){
      jQuery('.ap-popup').hide();
      jQuery('.ap-overlay').addClass('skewOut').delay(300).queue(function(next){
        jQuery('.ap-minimizedWindow').addClass('ap-active');
         jQuery('.ap-minimizedWindow').show();
        next();
      });
    });
    jQuery(document).on('click','.ap-minimizedWindow', function()
    {
      jQuery('.ap-popup').show();
      jQuery('.ap-overlay').removeClass('skewOut');
      jQuery('.ap-minimizedWindow').removeClass('ap-active');
    });

/*jquery onready and onclick function handling ends*/

//to fetch quicksetup attributes from server
 function loadAPlusJson()
 {
   aplusJson={};
   jQuery('.ap-loading').show();
   jQuery('#ap-doitmyself').hide();
   jQuery('#ap-close').hide();
   jQuery('#ap-tryagain').hide();
   var currentTime= (new Date()).getTime();
   jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
         action:"launchQsetupPopup"//No I18N
   })
   .done(function(data,status,xhr){
   jQuery('.ap-overlay').show();
   jQuery('.ap-popup').show();
   jQuery('.ap-overlay').removeClass('skewOut');
   jQuery('.ap-minimizedWindow').removeClass('ap-active');

   aplusJson = data.aplusJson;
   screenNo = 1;
   installType = aplusJson.installType;
   if(data.result == "success")
         {
            if (aplusJson.hasOwnProperty('LastLoadedScreen'))
               {
                  var lls = aplusJson.LastLoadedScreen;
                  if (lls === undefined && lls === 'undefined')
                  {
                      screenNo=1;
                  }
                  else
                  {
                     screenNo = parseInt(lls);
                     startDownloadTime=aplusJson.startDownloadTime;
                     aplusAdminEmail = aplusJson.aplusAdminEmail;
                     if(aplusJson.isLicenseAgreed == 'true'){
                      licenseChkDone = true;
                     }
                     aplusURL = aplusJson.aplusURL;
                  }
            }

            if(screenNo == 1 && aplusJson.hasOwnProperty('APLUS_GET_ZCREATOR_INPUT_STATUS') && aplusJson.APLUS_GET_ZCREATOR_INPUT_STATUS == 'true') //this will happen when quicksetup accessed from admin page.
            {
              screenNo = 2;
            }
            else if(screenNo == 2 && licenseChkDone == true)
            {
                screenNo=3;
            }
            showScreen();
         }
         else
         {
           showErrorScreen(data.message);
         }
   })
   .fail(function(data) {
       showErrorScreen("Error Occurred!");// No I18N
   });

   jQuery('.ap-loading').hide();
 }

 //to show the screen based on the screenNo
 function showScreen ()
   {
     initiatePrgChkThread();
     if(screenNo <= 1) {
         showInstallType();
         jQuery('#ap-doitmyself').hide();
      }
     else if(screenNo == 2)
     {
       if(installType == 'same')
       {
         showLicenseAgreementScreen();
         setLicenseContent();
         showBNQbuttons();
       }
     }
     else if(screenNo == 3)
     {
      showEmailConfigScreen();
     }
     else if(screenNo == 4)
     {
       hideBNQbuttons();
       jQuery('.ap-screens').html(flowScreen);
       var currentAction = aplusJson.currentAction;
       if(currentAction=='access')
       {
         setItemsInFlowScreen("access");//No I18N
       }
       else if(currentAction == 'integ')
       {
         handleInteg();
       }
       else if(currentAction == 'install')
       {
         handleInstall();
       }
       else if(currentAction == 'download')
       {
         handleDownload();
       }
       else if(currentAction == "precheck")
       {
          handlePrecheck();
       }
     }
     else if(screenNo >= totalScreens) {
           screenNo = 3;
     }
     else if(screenNo <= screenNo) {
           screenNo = 1;
     }
   }

   function showLicenseAgreementScreen()
   {
     jQuery('#ap-back').show();
     jQuery('.ap-screens').html(licenseScreen);
   }

//to to admin configuration for quicksetup which requires in Aplus.
   function doConfiguration()
   {
     var currentTime= (new Date()).getTime();
     jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
             action:"configureInputs",//No I18N
             adminEmailAddress:aplusAdminEmail
     })
     .done(function(data,status,xhr){
        aplusJson = data.aplusJson;
        if(data.result == "success")
        {
          doPreInstallChecks();
        }
        else
        {
           setFailedInFlowScreen(2, data.message);
        }
       })
     .fail(function(data) {
     });
   }

  function validateEmail(field)
  {
     if(field.includes(","))
     {
        return false;
     }
     var regex=/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
     return (regex.test(field)) ? true : false;
  }


  function showEmailConfigScreen()
   {
     jQuery('#ap-back').show();
     jQuery('.ap-screens').html(configScreen);
     if(aplusAdminEmail !== undefined && aplusAdminEmail != 'undefined' && aplusAdminEmail !== '')
     {
       jQuery('#ap-adminEmailId').val(aplusAdminEmail);
     }
     jQuery('.ap-privacy-link').show();
   }

 //to save install type (same/diff server)
   function saveInstallationType()
   {
     jQuery('.ap-container .ap-loading').show();
     var currentTime= (new Date()).getTime();
     jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
             action:"saveInstallType",//No I18N
             type:'same'//No I18N
     })
     .done(function(data,status,xhr)
     {
         aplusJson = data.aplusJson;
         if(data.result == "success")
         {
           installType = aplusJson.installType;
           jQuery('.ap-container .ap-loading').hide();
           if(installType == "same"){
              screenNo++;
              showScreen();
           }
           else if(installType == "diff")
           {
            showManualDownloadInfoPage();
           }
         }
         else
         {
           jQuery('.ap-container .ap-loading').hide();
           showFlowError(installTypeScreen,data.message);
         }
     })
     .fail(function(data) {
       jQuery('.ap-container .ap-loading').hide();
     });
   }

  function setLicenseChkValue()
  {
     var currentTime= (new Date()).getTime();
     jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
             action:"setLicenseChkValue",//No I18N
             chkVal:licenseChkDone
     })
     .done(function(data,status,xhr)
     {
         aplusJson = data.aplusJson;
         if(licenseChkDone){
          screenNo++;
          showEmailConfigScreen();
         }
     })
     .fail(function(data) {
     });
  }

    function showInstallType()
   {
     jQuery('.ap-screens').html(installTypeScreen);
     jQuery('#ap-back').hide();
     jQuery('#ap-next').show();
   }

   function showErrorScreen(errMsg)//This is for ajax req which was not at all processed.
   {
      var lastSc= "";
      if(errMsg == 'authError')
      {
        window.location.href = "/jsp/AuthError.jsp";
      }
      else
      {
       if(aplusJson.LastLoadedScreen == "1")
       {
         installType = 'same';//No I18N
         isRadio1checked="checked";//No I18N
         isRadio2checked="";
         lastSc = installTypeScreen;
       }
       else if(aplusJson.LastLoadedScreen == "2")
       {
        lastSc = licenseScreen;
       }
       else if(aplusJson.LastLoadedScreen == "3")
       {
        lastSc = configScreen;
       }


       if(aplusJson.hasOwnProperty("isWrongProxyConfigured") && aplusJson.isWrongProxyConfigured == "true"  ){
              jQuery('#ap-wizard-cont'+cId).html('<div class="ap-tac"><p><img src="/images/aplus-error.png" alt="Error"/></p>'+proxyConfigInputDiv+'</div>');
              jQuery('#ap-proxy-host').val(aplusJson.proxyHost);
              jQuery('#ap-proxy-port').val(aplusJson.proxyPort);
              jQuery('#ap-proxy-uname').val(aplusJson.proxyUName);
        }
       else{
            var ajaxReqNotProcessedErr = '<div class="ap-tac"><p><img src="/images/aplus-error.png" alt="Error Occured!"/><h1 class="ap-head3 ap-mB20">'+errMsg+'</h1></p></div><br>'+lastSc;
            jQuery('.ap-screens').html(ajaxReqNotProcessedErr);
       }


       hideBNQbuttons();

       jQuery('#ap-tryagain').show();
       if(aplusJson.LastLoadedScreen == "4")
       {
           jQuery('#ap-doitmyself').show();
       }

       if(aplusJson.hasOwnProperty('ostypeError'))
       {
         jQuery('#ap-tryagain').hide();
         jQuery('#ap-doitmyself').show();
       }
      }
    }

function setLicenseContent()
   {
    jQuery.get(contextPath+"/html/aplusqsetuplicense.txt", function(data){
    if(isSCP)
    {
      data = data.replaceAll("ServiceDesk", "SupportCenter");//NO I18N
    }
    else if(isMSP)
    {
      data = data.replaceAll("ServiceDesk Plus", "ServiceDesk Plus MSP");//NO I18N
    }
    jQuery('.ap-license-cont').html(data);//NO I18N
    });

     if(licenseChkDone)
     {
        jQuery('#ap-licChk').prop('checked', true);//NO I18N
     }
}

/*#####Screen-4 functionality methods starts #####*/

//to do pre chk operations required before proceed with qsetup
  function doPreInstallChecks()
   {
     screenNo=4;
     jQuery('.ap-loading').hide();
     jQuery('.ap-screens').html(flowScreen);
     setActiveInFlowScreen(0);
     hideBNQbuttons();
     hideTDbuttons();
     var currentTime= (new Date()).getTime();
     jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
                    action:"getZCInputs"//No I18N
     })
     .done(function(data,status,xhr){
            aplusJson = data.aplusJson;
            if(aplusJson.hasOwnProperty('PrechkStatus_Is_ZCreatorInputGot') && aplusJson.PrechkStatus_Is_ZCreatorInputGot === 'false')
            {
                setFailedInFlowScreen(0, aplusJson.APLUS_GET_ZCREATOR_INPUT_MESSAGE);
            }
            else
            {
               setActiveInFlowScreen(0);
               hideBNQbuttons();
               hideTDbuttons();
               jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
                              action:"getServerInfo"//No I18N
                    })
               .done(function(data,status,xhr){
                      aplusJson = data.aplusJson;
                      if(aplusJson.hasOwnProperty('errMsgCount') && parseInt(aplusJson.errMsgCount) == 0)
                      {
                        setCompletedUpto(0);//prechk completed
                        setActiveInFlowScreen(1);//download activated
                        setDownloadPercentage(0);
                        downloadAplus();
                      }
                      else
                      {

                         setFailedInFlowScreen(0, aplusJson.APLUS_SERVER_CHECK_MESSAGE);
						 // jQuery('ap-tryagain').show();
                      }
                    })
               .fail(function(data) {
                         setFailedInFlowScreen(0, aplusJson.APLUS_SERVER_CHECK_MESSAGE);
                    });
            }
     })
     .fail(function(data) {
               setFailedInFlowScreen(0, aplusJson.APLUS_GET_ZCREATOR_INPUT_MESSAGE);
     });
 }


 function setDownloadPercentage(percent)
 {
   jQuery('.ap-progress-wrap .ap-progress-bar').css({"left":percent+"%"}); //NO I18N
   jQuery('.ap-progress-count').html(percent+"%");
 }

//request to download aplus exeutable from me website
function downloadAplus()
   {
        startDownloadTime = new Date().getTime();
        var currentTime= (new Date()).getTime();
        jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
               action:"downloadAplus"//No I18N
               })
        .done(function(data,status,xhr){
               })
        .fail(function(data) {
        });
   }


//to update install screen loading content based on the lates aplusJson.APLUS_INSTALL_LOADER_MSG object
function setInstallLoaderValues()
   {
    if(aplusJson.hasOwnProperty('APLUS_INSTALL_LOADER_MSG'))
    {
     installProgMess = aplusJson.APLUS_INSTALL_LOADER_MSG;
      jQuery('.ap-inst-progress-text').text(installProgMess);
    }
}

//request to initiate data sync
 function initiateDataSync()
   {
     setCompletedInFlowScreen(2);
     setActiveInFlowScreen(3);
     var currentTime= (new Date()).getTime();
     jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
             action:"initDataSync"//No I18N
             })
     .done(function(data,status,xhr){
             })
     .fail(function(data) {
             });
   }


//to handle try again based on the latest stage of setup wizard.
function tryAgainQS()
   {
   getJsonInterval=null;
   initiatePrgChkThread();
   jQuery('.ap-loading').show();

   var currentAction = aplusJson.currentAction;
   if(currentAction == 'integ')
   {
      setItemsInFlowScreen("integ");//No I18N
   }
   else if(currentAction == 'install')
   {
      setItemsInFlowScreen("install");//No I18N
   }
   else if(currentAction == 'download')
   {
      setItemsInFlowScreen("download");//No I18N
   }
   else if(currentAction == "precheck")
   {
      setItemsInFlowScreen("precheck");//No I18N
   }
   var currentTime= (new Date()).getTime();
   jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
               action:"deleteAndReinitiateAction",//No I18N
               pHost:jQuery('#ap-proxy-host').val(),
               pPort:jQuery('#ap-proxy-port').val(),
               pUname:jQuery('#ap-proxy-uname').val(),
               pPwd:jQuery('#ap-proxy-pwd').val()
             })
             .done(function(data,status,xhr){
                 if(data.result == "success")
                 {
                     aplusJson = data.aplusJson;
                     if(aplusJson.LastLoadedScreen == "4")
                     {
                       if(aplusJson.currentAction == 'precheck')
                       {
                          doPreInstallChecks();
                       }
                       else if (aplusJson.currentAction == 'integ')
                       {
                          initiateDataSync();
                       }
                     }
                     else if(aplusJson.LastLoadedScreen == "1")
                     {
                      screenNo = 1;
                      showScreen();
                      jQuery('#ap-tryagain').hide();
                      hideBNQbuttons();
                      installType = jQuery("input[name=radio]:checked").val();
                      saveInstallationType();
                     }
                 }
                 else
                 {
                   showErrorScreen(data.message);
                 }
               })
               .fail(
               function(data) {
                  jQuery('.ap-loading').hide();
               }
     );
   }


//to end the wizard with 'access' stage.
 function endWizard()
   {
      setCompletedInFlowScreen(3);
      setActiveInFlowScreen(4);
      clearInterval(getJsonInterval);
   }
/*#####Screen-4 functionality methods ends #####*/


/*##### Thread methods starts #####*/
//to initiate a thread which will help to do periodic request to the server to get the latest attributes of the qsetup
function initiatePrgChkThread()
   {
    if(getJsonInterval != null)
      {
         try {
           clearInterval(getJsonInterval);
         }
         catch(err) {
         }
      }
       try {
            getJsonInterval = setInterval(function(){getLatestJson();},12000);
         }
         catch(err) {
         }
   }

//setting wizard flow screen based on the aplusJson attributes.
  function getLatestJson()
   {
      var currentTime= (new Date()).getTime();
      jQuery.getJSON("/aplusinteg?_="+currentTime, {//No I18N
         action:"getStatusJson"//No I18N
      })
      .done(function(data,status,xhr)
      {
         aplusJson = data.aplusJson;
         var cAction = aplusJson.currentAction;

         if(cAction == 'integ' || ( aplusJson.hasOwnProperty('install_complete_status') && aplusJson.install_complete_status=="true" ) )
         {
              handleInteg();
         }
         else if(cAction == 'install' || ( aplusJson.hasOwnProperty('download_complete_status') && aplusJson.download_complete_status=="true" ))
         {
              handleInstall();
         }
         else if(cAction == 'download' ||  aplusJson.hasOwnProperty('errMsgCount') && parseInt(aplusJson.errMsgCount) == 0 ) //get download prg status and
         {
             handleDownload();
         }
         else if(cAction == 'precheck' && aplusJson.hasOwnProperty('isPreChkStarted') && aplusJson.isPreChkStarted == "false")
         {
             doPreInstallChecks();
         }

      })
      .fail(function(data) {
      });

   }

//to handle prechk stage
 function handlePrecheck()
 {
   if( aplusJson.hasOwnProperty('errMsgCount') && parseInt(aplusJson.errMsgCount) > 0 )
   {
     setFailedInFlowScreen(0, aplusJson.APLUS_SERVER_CHECK_MESSAGE);
   }
   else
   {
      setItemsInFlowScreen("precheck");//No I18N
   }
 }

//to handle download stage
 function handleDownload()
 {
   if(aplusJson.hasOwnProperty('APLUS_DOWNLOAD_MESSAGE') && aplusJson.APLUS_DOWNLOAD_MESSAGE != "Success")
   {
     setFailedInFlowScreen(1, aplusJson.APLUS_DOWNLOAD_MESSAGE);
   }
   else
   {
     setItemsInFlowScreen("download");//No I18N
   }
 }

//to handle install stage
function handleInstall()
{
  if(aplusJson.hasOwnProperty('APLUS_INSTALL_MESSAGE') && aplusJson.APLUS_INSTALL_MESSAGE != "Success" )
  {
     setFailedInFlowScreen(2, aplusJson.APLUS_INSTALL_MESSAGE);
  }
  else
  {
    setItemsInFlowScreen("install");//No I18N
  }
}

//to handle integ stage
function handleInteg()
{
  if(aplusJson.hasOwnProperty('IS_QS_SUCCESS') && aplusJson.IS_QS_SUCCESS == "true")
  {
    endWizard();
  }
  else if(aplusJson.hasOwnProperty('APLUS_INTEG_MESSAGE') && aplusJson.APLUS_INTEG_MESSAGE != "Success")
  {
     setFailedInFlowScreen(3, aplusJson.APLUS_INTEG_MESSAGE);
  }
  else
  {
   if(aplusJson.hasOwnProperty('isIntegInitiated') && aplusJson.isIntegInitiated == "false")
   {
    initiateDataSync();
   }
   else
   {
    setItemsInFlowScreen("integ");//No I18N
   }
  }
 }
/*##### Thread methods ends #####*/

/*common functions - starts*/
function closeAplusQsetuppopup()
 {
    jQuery('.ap-overlay').hide();
           jQuery('.ap-popup').hide();
 }

//to hide back, next, quit buttons
 function  hideBNQbuttons()
 {
    jQuery('#ap-back').hide();
    jQuery('#ap-next').hide();
    jQuery('#ap-quit').hide();
    jQuery('.ap-privacy-link').hide();
 }

//to show back, next, quit buttons
  function  showBNQbuttons()
 {
    jQuery('#ap-back').show();
    jQuery('#ap-next').show();
    jQuery('#ap-quit').show();
    if(screenNo == 3){
        jQuery('.ap-privacy-link').show();
    }
 }

//to hide tryagain, do it myself buttons
 function hideTDbuttons()
 {
    jQuery('#ap-doitmyself').hide();
    jQuery('#ap-tryagain').hide();
 }

 function showManualDownloadInfoPage()
 {
    jQuery('.ap-screens').html(downloadMsg); //showing fourth screen
    jQuery('#ap-doitmyself').hide();
    jQuery('#ap-back').hide();
    jQuery('#ap-next').hide();
    jQuery('#ap-quit').show();
    jQuery('#ap-tryagain').hide();
 }

//to set info in the given stage and make the previous stage as completed
  function setItemsInFlowScreen(stage)
 {
  var i;
  if(stage =="precheck")
  {
    i=0;
  }
  else if(stage == "download")
  {
    i=1;
  }
  else if(stage == "install")
  {
    i=2;
  }
  else if(stage == "integ")
  {
    i=3;
  }
  else if(stage == "access")
  {
    i=4;
  }
  if(i==0)
  {
     setActiveInFlowScreen(i);
  }
  else if(i >= 1 && i<=4)//from download stage onwards..
  {
    setCompletedUpto(i-1);
    setActiveInFlowScreen(i);
    if(i==1)//if download screen
    {
        if(aplusJson.hasOwnProperty('downloadPercentage'))
        {
          setDownloadPercentage(parseInt(aplusJson.downloadPercentage));
        }
        else
        {
           setDownloadPercentage(0);
        }
    }
    hideBNQbuttons();
    hideTDbuttons();
  }
  jQuery('.ap-loading').hide();
 }

//to make complete the given cId stage.
 function setCompletedInFlowScreen(cId)
  {
     jQuery('#ap4s'+cId).removeClass('ap-active').addClass('ap-completed');
     jQuery('.ap-wizard-content li').removeClass('ap-active');
     jQuery('#ap4s'+cId+' a').html(tickMark);
  }

//to make complete all the stages happened before the given cId
  function setCompletedUpto(cId)
  {
      jQuery('.ap-screens').html(flowScreen);
      for (var i=0; i<=cId; i++)
      {
        setCompletedInFlowScreen(i);
      }
  }

//to show the given cId stage as an active one.
 function setActiveInFlowScreen(cId)
     {
       jQuery('#ap4s'+cId).addClass('ap-active');
       jQuery('.ap-wizard-content li').removeClass('ap-active');
       jQuery('#ap-wizard-cont'+cId).addClass('ap-active');

       if(cId == 4)
       {
         jQuery('a#apaccessbutton').attr('href', aplusJson.aplusURL);
         jQuery('.ap-qsp-but').hide();
         jQuery('#ap-close').show();
       }

       if(cId==2)
       {
        setInstallLoaderValues();
       }
 }

//to set fail screen on the given cId with the given message
 function setFailedInFlowScreen(cId, message)
 {
      if(message != 'undefined' && message != undefined)
      {
       screenNo=3;
       jQuery('#ap4s'+cId).removeClass('ap-active').addClass('ap-completed');
       jQuery('#ap4s'+cId+' a').html(intoMark);

     if(aplusJson.hasOwnProperty("isWrongProxyConfigured") && aplusJson.isWrongProxyConfigured == "true"  ){
    jQuery('#ap-wizard-cont'+cId).html('<div class="ap-tac"><p><img src="/images/aplus-error.png" alt="Error"/></p>'+proxyConfigInputDiv+'</div>');
    jQuery('#ap-proxy-host').val(aplusJson.proxyHost);
    jQuery('#ap-proxy-port').val(aplusJson.proxyPort);
    jQuery('#ap-proxy-uname').val(aplusJson.proxyUName);
     }
     else{
      jQuery('#ap-wizard-cont'+cId).html('<div class="ap-tac"><p><img src="/images/aplus-error.png" alt="Error"/></p><h1 class="ap-head3 ap-mB20">'+message+'</h1></div>');
     }
       jQuery('#ap-wizard-cont'+cId).addClass('ap-active');

       hideBNQbuttons();
       jQuery('#ap-tryagain').show();
       jQuery('#ap-doitmyself').show();

       try {
           clearInterval(getJsonInterval);
       }
       catch(err) {
       }
      }
 }

 function showFlowError(screen, errMsg)
   {
     errScreen = '<div class="ap-error-msg"><p><img src="/images/aplus-error.png" alt="Error Occurred!"/></p><h1 class="ap-head2 ap-mB20">'+errMsg+'</h1></div><br><br>'+screen;
    showErrpage();
 }

 function showErrpage()
 {
     isErrOccurred = true;
     jQuery('.ap-screens').html(errScreen);

     if(screenNo == 2)
     {
      setLicenseContent();
     }
     else if(screenNo == 3 && aplusAdminEmail !== undefined && aplusAdminEmail != 'undefined' && aplusAdminEmail !== '')
     {
       jQuery('#ap-adminEmailId').val(aplusAdminEmail);
     }

     jQuery('.ap-loading').hide();
     hideBNQbuttons();
     jQuery('#ap-tryagain').show();
 }
/*common functions - starts*/
