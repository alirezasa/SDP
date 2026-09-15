// $Id$
var adpageJS = {   
jsonparam:{},
deleteReqParam : {},
scheduleParam : {},
adParam : {},
allowEdit : true,
os :"-1" ,
userTimeZoneOffset : "0",
isLDapAuthParam : {},
ldapScheduleParam : {},

validateUserImport : function (btnn)
{
  if(adpageJS.os == "-1")
  {
    notOperatedForLinux();
    return false;
    }else{
      adpageJS.saveAdSettings(btnn);
        return true;
    }
},
    

saveSchedule: function (btn){
    if(jQuery('#schedule').is(":checked")){
        if(!isLoginNotifcation_Outgoing_Enabled()){
                return false;
        }
        adpageJS.jsonparam.schedule = 'true'; //No I18N
        if(checkintegervalue(jQuery('#scheduleDays').val()) ==  false){
            alert(getMessageForKey("sdp.fullSyncSchedule.interval.invalid")); //No I18N
            jQuery('#scheduleDays').trigger('focus');
            return false;
        }
        else if(jQuery('#scheduleDays').val() === '0'){
            alert(getMessageForKey("sdp.adschedule.days.zero"));
            jQuery('#scheduleDays').trigger('focus');
            return false;
        }
        else if(jQuery('#scheduleDays').val() > 365 || jQuery('#scheduleDays').val()<7){
            alert(getMessageForKey("sdp.fullSyncSchedule.interval.invalid"));
            jQuery('#scheduleDays').trigger('focus');
            return false;
        }
        else if(jQuery('#adsched_IN').val() == ''){
            alert(getMessageForKey("sdp.admin.auditsettings.scaninterval.choosedate"));
            ZComponents.datetimepicker(document.getElementById("adsched_parent")).open();
            return false;
        }
        else if(Date.now() > jQuery('#adsched_IN').val())
        {
          alert(getMessageForKey("sdp.adschedule.time.greater"));
          ZComponents.datetimepicker(document.getElementById("adsched_parent")).open();
            return false;
        }
        /*else if(!adpageJS.greaterThanCurrentTime()){
            alert(getMessageForKey("sdp.adschedule.time.greater"));
            return false;
        }
        else if(jQuery('#ADScheduleStartDate').val() == ''){
            alert(getMessageForKey("sdp.admin.auditsettings.scaninterval.choosedate"));
            jQuery('#ADScheduleStartDate').trigger('focus');
            return false;
        }
        else if(jQuery('#hrs').val() < 0 || jQuery('#hrs').val() > 23){
        	alert(getMessageForKey("sdp.adschedule.hrs.invalid"));
        	jQuery('#hrs').trigger('focus');
        	return false;
        }
        else if(jQuery('#mins').val() < 0 || jQuery('#mins').val() > 59){
        	alert(getMessageForKey("sdp.adschedule.mins.invalid"));
        	jQuery('#mins').trigger('focus');
        	return false;
        }*/
        else{
            adpageJS.jsonparam.scheduleDays = jQuery('#scheduleDays').val(); //No I18N
            adpageJS.jsonparam.scheduleDate= jQuery('#adsched_IN').val(); //No I18N
            //adpageJS.jsonparam.hrs= jQuery('#hrs').val(); //No I18N
            //adpageJS.jsonparam.mins = jQuery('#mins').val(); //No I18N
        }
    }else{
        adpageJS.jsonparam.schedule = 'false'; //No I18N
    }
            adpageJS.ajaxRequest(btn,"saveAD",adpageJS.jsonparam); //No I18N
            btn.preventDefault(); //after adding delta schedule along with full schedule,  the new schedule change is not reflected after the reload. request shows as canceled
              return true;
},

greaterThanCurrentTime : function (){
    var yyyymmdd = jQuery('#ADScheduleStartDate').val()
    var hh = jQuery('#hrs').val();
    var mm = jQuery('#mins').val();
    var scheduled = adpageJS.getLongDate_ITIL(yyyymmdd,hh,mm);
    var now = adpageJS.getCurLongDate_ITIL();
    if(now < scheduled){
        return true;
    }else{
        return false;
    }
},

getCurLongDate_ITIL : function ()
{
  var userOff = adpageJS.userTimeZoneOffset;
  var dt = new Date();
  var clientOff = dt.getTimezoneOffset();
  var offInMills= clientOff*60*1000;
  var time =  dt.getTime();
  var currentTime = time - ((-offInMills) -userOff);
  return currentTime;
},

getLongDate_ITIL: function (dtFormat, hh, mm)
{
  var tmp = dtFormat.split("-");
  var dt = new Date();
  dt.setYear(tmp[0]);
  dt.setMonth(tmp[1] - 1);
  dt.setDate(tmp[2]);
  dt.setHours(hh);
  dt.setMinutes(mm);
  dt.setSeconds(0);
  return dt.getTime();
},

saveUserDeleteSettings : function (btn){
    adpageJS.jsonparam.delSchedule = false
    adpageJS.jsonparam.deleteSync = jQuery('#deleteSync').is(":checked"); //No I18N
    adpageJS.jsonparam.deleteOption = jQuery("#auto").is(":checked") ? "auto" : "manual" ; //No I18N
if(adpageJS.jsonparam.deleteSync)
{
  adpageJS.jsonparam.delSchedule = jQuery('#schdeletesync').is(":checked"); //No I18N
  adpageJS.jsonparam.delScheduleDays = jQuery('#delScheduleDays').val(); //No I18N
  adpageJS.jsonparam.delScheduleDate = jQuery('#deletesched_IN').val(); //No I18N
  if(adpageJS.jsonparam.delSchedule)
  {
    if(checkintegervalue(jQuery('#delScheduleDays').val()) ==  false)
    {
        alert(getMessageForKey("sdp.adschedule.interval.invalid")); //No I18N
        jQuery('#delScheduleDays').trigger('focus');
        return false;
    }
    else if(jQuery('#delScheduleDays').val() === '0')
    {
        alert(getMessageForKey("sdp.adschedule.days.zero"));
        jQuery('#delScheduleDays').trigger('focus');
        return false;
    }
    else if(jQuery('#delScheduleDays').val() > 365)
    {
        alert(getMessageForKey("sdp.adschedule.interval.invalid"));
        jQuery('#delScheduleDays').trigger('focus');
        return false;
    }
    else if(adpageJS.jsonparam.delScheduleDate == '')
    {
        alert(getMessageForKey("sdp.admin.auditsettings.scaninterval.choosedate"));
        ZComponents.datetimepicker(document.getElementById("deletesched_parent")).open();
        return false;
    }
    else if(Date.now() > adpageJS.jsonparam.delScheduleDate)
    {
        alert(getMessageForKey("sdp.adschedule.time.greater"));
        ZComponents.datetimepicker(document.getElementById("deletesched_parent")).open();
        return false;
    }
  }

}

adpageJS.ajaxRequest(btn,"userDeleteSettings",adpageJS.jsonparam); //No I18N
return false;
},
  
saveLdapSchedule : function (btn)
{
  if(sdp_app.IS_DEMO_BUILD){
    disableForDemo();
    return false;
  }
  adpageJS.jsonparam.ldapSchedule = jQuery('#ldapSchedule').is(":checked"); //No I18N
  if(adpageJS.jsonparam.ldapSchedule)
  {
    if(checkintegervalue(jQuery('#ldapScheduleDays').val()) ==  false){
        alert(getMessageForKey("sdp.adschedule.interval.invalid")); //No I18N
        jQuery('#ldapScheduleDays').trigger('focus');
        return false;
    }
    else if(jQuery('#ldapScheduleDays').val() === '0'){
        alert(getMessageForKey("sdp.adschedule.days.zero"));
        jQuery('#ldapScheduleDays').trigger('focus');
        return false;
    }
    else if(jQuery('#ldapScheduleDays').val() > 365){
        alert(getMessageForKey("sdp.adschedule.interval.invalid"));
        jQuery('#ldapScheduleDays').trigger('focus');
        return false;
    }
    else if(jQuery('#ldapsched_IN').val() == ''){
        alert(getMessageForKey("sdp.admin.auditsettings.scaninterval.choosedate"));
        ZComponents.datetimepicker(document.getElementById("ldapsched_parent")).open();
        return false;
    }
    else if(Date.now() > jQuery('#ldapsched_IN').val()){
        alert(getMessageForKey("sdp.adschedule.time.greater"));
        ZComponents.datetimepicker(document.getElementById("ldapsched_parent")).open();
        return false;
    }
    adpageJS.jsonparam.ldapScheduleDays = jQuery('#ldapScheduleDays').val(); //No I18N
    adpageJS.jsonparam.ldapScheduleDate = jQuery('#ldapsched_IN').val(); //No I18N
  }
    adpageJS.ajaxRequest(btn,"saveLdapSchedule",adpageJS.jsonparam); //No I18N
    return false;
},

saveAdSettings : function (btn){
    adpageJS.jsonparam.ADAuthEnabled = jQuery('#ADAuth').is(":checked");    // No I18N
    adpageJS.ajaxRequest(btn,'saveAdAuth',adpageJS.jsonparam);//No I18N
},

ajaxRequest : function (btn,form,jsonparam){
   var msg = jQuery(btn).button('loading');
   
    jQuery.ajax({
        url : "/servlet/AJaxServlet?action="+form,//No I18N
        type : "POST",//No I18N
        data : adpageJS.jsonparam,
        dataType : "text",//No I18N
        success : function(responseText){
            if(responseText.indexOf("messageHolder") > -1){
               //var print = responsetText.getElementById('messageHolder').innerHTML();
                   var responseDiv=document.createElement('div');
                   responseDiv.innerHTML=responseText;
                   print = responseDiv.getElementsBySelector('#messageHolder')[0].innerHTML;
               showalert('failure',print,'isAutoHide=false'); //No I18N
               msg.button('reset');
           }else{
            var response = JSON.parse(responseText);
            var status=response.status;
            var message = response.message;
            adpageJS.responseParser(response,status,message,form,btn);
              msg.button('reset');
            }
        },
        error: function(){
          adpageJS.responseParser("","Failure",getMessageForKey("sdp.admin.dcconfig.settings.error.message"),form,btn);
          msg.button('reset');
        }
    });
    adpageJS.jsonparam={};
},

loadAdVar : function (){
    adpageJS.adParam.ADAuth = jQuery('#ADAuth').is(":checked"); //No I18N
},

responseParser : function (response,status,message,form,btn){
    
    if(status){
       
    
    switch(status){
                case "Success": //No I18N
                    //jQuery('#successmsg').text(response.message);
                    showalert('success',message,'isAutoHide=true'); //No I18N
                    if(form == 'userDeleteSettings'){
                        adpageJS.deleteReqParam.delOption = jQuery("#auto").is(":checked") ? "auto" : "manual" ; //No I18N
                          adpageJS.deleteReqParam.delSync = jQuery('#deleteSync').is(":checked"); //No I18N
                          adpageJS.deleteReqParam.delSchedule = jQuery('#schdeletesync').is(":checked") && adpageJS.deleteReqParam.delSync; //No I18N
                          if(adpageJS.deleteReqParam.delSchedule)
                          {
                              adpageJS.deleteReqParam.delScheduleDays = jQuery('#delScheduleDays').val();
                              adpageJS.deleteReqParam.personalizedDelSch = response.DeleteSyncADUserSchedule;
                          }
                          else
                          {
                            adpageJS.deleteReqParam.delScheduleDays = "";
                            adpageJS.deleteReqParam.delScheduleDate = "";
                          }
                          document.getElementById("personalizedDelScheduleDate").textContent = response.DeleteSyncADUserSchedule === undefined?'-':response.DeleteSyncADUserSchedule;
                          window.location.reload();
                    }else if(form == 'saveAD'){ //No I18N
                        adpageJS.scheduleParam.schedule =  jQuery('#schedule').is(":checked"); //No I18N
                        if(adpageJS.scheduleParam.schedule){
                            adpageJS.scheduleParam.scheduledDays = jQuery('#scheduleDays').val();
                              adpageJS.scheduleParam.personalizedNxtSch = response.ADFullUserSyncSchedule;
                        }else{
                            adpageJS.scheduleParam.scheduledDays = "";
                              adpageJS.scheduleParam.nextSchDate = ""; //No I18N
                      }
                      document.getElementById("personalizedNextDeltaSch").textContent = response.ADDeltaUserSyncSchedule === undefined?'-':response.ADDeltaUserSyncSchedule;
                      document.getElementById("personalizedNxtSch").textContent = response.ADFullUserSyncSchedule === undefined?'-':response.ADFullUserSyncSchedule;
                      window.location.reload();
                      }else if(form == 'saveLdapSchedule') //No I18N
                      {
                        adpageJS.ldapScheduleParam.ldapSchedule = jQuery('#ldapSchedule').is(":checked");//No I18N
                        if(adpageJS.ldapScheduleParam.ldapSchedule)
                        {
                          adpageJS.ldapScheduleParam.ldapScheduleDays = jQuery('#ldapScheduleDays').val();
                          adpageJS.ldapScheduleParam.personalizedLdapSch = response.LDAPFullUserSyncSchedule;
                    }
                        else
                        {
                          adpageJS.ldapScheduleParam.ldapScheduleDays = "";
                          adpageJS.ldapScheduleParam.ldapScheduleDate = "";
                        }
                        document.getElementById("personLdapScheduleDate").textContent = response.LDAPFullUserSyncSchedule === undefined?'-':response.LDAPFullUserSyncSchedule;
                        window.location.reload();
                      }
                    else if(form == 'saveAdAuth'){ //No I18N
                        adpageJS.loadAdVar();
                    }
                    adpageJS.allowEdit = true;
                    jQuery(btn).closest('.activedirect-section').find('.submit-row').addClass('hide').end().find('input').prop('disabled', true); //No I18N
                    jQuery(btn).closest('.activedirect-section').find('select').prop('disabled', true); //No I18N
		            clickallow = true;
                    jQuery(btn).closest('.activedirect-section').find('.modal-overlay2').removeClass('hide'); //No I18N
                    jQuery(btn).closest('.activedirect-section').find('.freezelayer-text').removeClass('hide'); //No I18N
                    break;
                case "Warning": //No I18N
                    var mess = message;
                    //else{
                        //jQuery('#alert-warning').show();
                        showalert('warning',message,'isAutoHide=true'); //No I18N
                        adpageJS.allowEdit = true;
                    //}
                    break;
                case "Info": //No I18N
                    showalert('info',message,'isAutoHide=true'); //No I18N
                    adpageJS.allowEdit = true;
                    jQuery(btn).closest('.activedirect-section').find('.submit-row').addClass('hide').end().find('input').prop('disabled', true); //No I18N
		                clickallow = true;	
                    jQuery(btn).closest('.activedirect-section').find('.modal-overlay2').removeClass('hide'); //No I18N
                    jQuery(btn).closest('.activedirect-section').find('.freezelayer-text').removeClass('hide'); //No I18N
                    break;
                case "Failure": //No I18N
                    showalert('failure',message,'isAutoHide=false,closeOnEscKey=no'); //No I18N
                    break;
                default:
                    
            }
        }
},
        
showSchedule : function (){
    var c = adpageJS.scheduleParam.schedule;
    jQuery('#schedule').prop('checked',adpageJS.scheduleParam.schedule); // No I18N
          jQuery('#scheduleDays').prop('disabled',true);// No I18N
          //jQuery('#hrs').prop('disabled',true);// No I18N
          //jQuery('#mins').prop('disabled',true);// No I18N
          if(c){
            jQuery('#scheduleDays').val(adpageJS.scheduleParam.scheduledDays);
            document.getElementById("personalizedSch").textContent = adpageJS.scheduleParam.personalizedNxtSch;
            document.getElementById("schDays").textContent = adpageJS.scheduleParam.scheduledDays;
            //jQuery('#hrs').val(adpageJS.scheduleParam.nextSchHours);
            //jQuery('#mins').val(adpageJS.scheduleParam.nextSchMinutes);
          }
          else
          {
            jQuery('#schmsg').removeClass('hide');
            jQuery('#totsch').addClass('hide');
          }
        jQuery('.importdetail').removeClass("hide");
        jQuery('#schDays').removeClass('hide');
        jQuery('#personalizedSch').removeClass('hide');
        jQuery('#editCal').addClass('hide');
        jQuery('#scheduleDays').addClass('hide');
},

showDeleteSchedule : function ()
{
    var c = adpageJS.deleteReqParam.delSchedule;

    jQuery('#schdeletesync').prop('checked',adpageJS.deleteReqParam.delSchedule); // No I18N 
    jQuery('#delScheduleDays').prop('disabled',true);// No I18N
    if(c)
    {
    
      jQuery('#delScheduleDays').val(adpageJS.deleteReqParam.delScheduleDays);
      jQuery('#delScheduleDaysConfigured').removeClass('hide');
      jQuery('#delScheduleDateConfigured').removeClass('hide');
        document.getElementById("delScheduleDaysConfigured").textContent = adpageJS.deleteReqParam.delScheduleDays;
        document.getElementById("delScheduleDateConfigured").textContent = adpageJS.deleteReqParam.personalizedDelSch;
    }
      else{
      jQuery("#notConfigured").removeClass("hide");
      jQuery("#configure").addClass("hide");
    }
        jQuery('#deleditCal').addClass('hide');
        jQuery('#delScheduleDaysNotConfigured').addClass('hide');
},

showLdapSchedule : function ()
{
    var c = adpageJS.ldapScheduleParam.ldapSchedule;
    jQuery('#ldapSchedule').prop('checked',adpageJS.ldapScheduleParam.ldapSchedule); // No I18N
  
    jQuery('#ldapScheduleDays').prop('disabled',true);// No I18N

    if(c)
    {

      jQuery('#ldapScheduleDays').val(adpageJS.ldapScheduleParam.ldapScheduleDays);
      jQuery('#ldapScheduleDaysConfigured').removeClass('hide');
      jQuery('#ldapScheduleDateConfigured').removeClass('hide');
        document.getElementById("ldapScheduleDaysConfigured").textContent = adpageJS.ldapScheduleParam.ldapScheduleDays;
        document.getElementById("ldapScheduleDateConfigured").textContent = adpageJS.ldapScheduleParam.personalizedLdapSch;
    }
      else
    {
      jQuery("#notConfigured").removeClass("hide");
      jQuery("#configure").addClass("hide");
    }
      jQuery('#ldapeditCal').addClass('hide');
      jQuery('#ldapScheduleDaysNotConfigured').addClass('hide');
},


showADAuthForm : function (el){
   var c = jQuery(el).is(':checked'); //No I18N
    if(c) 
    { 
        jQuery('#ADAuthForm').show();
        jQuery(el).closest('.activedirect-section').find('input').prop("disabled", false); //No I18N
        jQuery(el).closest('.activedirect-section').find('select').prop("disabled", false); //No I18N
       return true;
    } else { 
        jQuery('#ADAuthForm').hide(); 
        return true;
    }
},
ADCheck : function (el){
            var c = jQuery(el).is(':checked'); //No I18N
            jQuery('input[name="deleteType"]').prop('disabled',!c);// No I18N
            jQuery('#schdeletesync').prop('disabled',!c);// No I18N
            jQuery('#delScheduleDays').prop('disabled',!c);// No I18N
            if(!c)
            {
              jQuery('#'+adpageJS.deleteReqParam.delOption).prop('checked',true);
            }
            adpageJS.deleteScheduleCheck(jQuery('#schdeletesync'));
},
adCheck : function (el){
    var c = jQuery(el).is(':checked'); //No I18N
    if(c){
    var publicDomain = false;
    if(document.getElementById("isPublicDomain").value!=null && document.getElementById("isPublicDomain").value=='true' )
    {
      publicDomain = true;
    }
    if(!publicDomain)
    {
      alert(getMessageForKey("sdp.admin.activedirectory.enable.failure.incorrectdomaincontroller"));
      return false;
    }
    }else{
        jQuery('#ADAuthForm').hide();
    }
    return true;
},
scheduleCheck : function (el){
    var c = jQuery(el).is(':checked'); //No I18N
    if(c){
      //jQuery('#ADScheduleStartDate').prop('disabled',!c).parent().find('.input-group-addon').removeClass('opac5'); // No I18N
      jQuery("#adsched").removeClass('dpicker-disabled'); // No I18N
      jQuery('#scheduleDays').prop('disabled',false); // No I18N
      jQuery('#adsched').find('input').prop('disabled',false);//No I18N
      jQuery('#scheduleDays').trigger('focus');
    }
    else{ 
      //jQuery('#ADScheduleStartDate').prop('disabled',!c).parent().find('.input-group-addon').addClass('opac5'); // No I18N 
      //jQuery('#ADScheduleStartDate').addClass('form-control');
      jQuery('#scheduleDays').prop('disabled',true); // No I18N
      jQuery('#adsched').find('input').prop('disabled',true);//No I18N
      jQuery("#adsched").addClass('dpicker-disabled'); // No I18N
    }
    //jQuery('#ADScheduleStartDate').attr('disabled',!c).parent().find('.input-group-addon').addClass('opac5');
    //jQuery('#hrs').prop('disabled',!c); // No I18N
    //jQuery('#mins').prop('disabled',!c); // No I18N
},

deleteScheduleCheck : function (el){
      var c = jQuery(el).is(':checked') && jQuery('#deleteSync').is(':checked'); //No I18N
    if(c){
      jQuery('#delScheduleDays').prop('disabled',false); // No I18N
      jQuery("#deletesched").removeClass('dpicker-disabled'); // No I18N
      jQuery("#deletesched").find('input').prop('disabled',false); // No I18N
      jQuery('#delScheduleDays').trigger('focus');
    }
    else{ 
      jQuery('#delScheduleDays').prop('disabled',true); // No I18N
      jQuery("#deletesched").find('input').prop('disabled',true); // No I18N
      jQuery("#deletesched").addClass('dpicker-disabled'); // No I18N
    }
},

ldapScheduleCheck : function (el){
    var c = jQuery(el).is(':checked'); //No I18N
    if(c){
      jQuery('#ldapScheduleDays').prop('disabled',false); // No I18N
      jQuery("#ldapsched").removeClass('dpicker-disabled'); // No I18N
      jQuery("#ldapsched").find('input').prop('disabled',false); // No I18N
      jQuery('#ldapScheduleDays').trigger('focus');
    }
    else{ 
      jQuery('#ldapScheduleDays').prop('disabled',true); // No I18N
      jQuery("#ldapsched").find('input').prop('disabled',true); // No I18N
      jQuery("#ldapsched").addClass('dpicker-disabled'); // No I18N
    }
},

loadDeleteRqForm : function (){
      if(adpageJS.deleteReqParam.delSync){
        jQuery('#deleteSync').prop('checked',true); //No I18N
    }else{
        jQuery('#deleteSync').prop('checked',false);   //No I18N 
    }
        jQuery('#'+adpageJS.deleteReqParam.delOption).prop('checked',true);

},
loadAdForm : function (){
    jQuery('#ADAuth').prop('checked',adpageJS.adParam.ADAuth); //No I18N
},

cancelSection : function (section){
    if(section === 'deleteRequester'){
        adpageJS.loadDeleteRqForm();
        adpageJS.showDeleteSchedule();
        closeCalDialog();
    }else if(section === 'schedule'){ //No I18N
        jQuery('#ADScheduleStartDate').addClass('form-control');
        adpageJS.showSchedule();
        closeCalDialog();
    }else if(section === 'adSettings'){ //No I18N
        adpageJS.loadAdForm();
    }
    else if(section === 'localAuthPass')
    {
        adCommon.loadLAuthPass();
    }
    else if(section === 'ldap')
    {

        jQuery('#ldapDialog,#ldapEdit').removeClass('hide');
        if(adpageJS.isLDapAuthParam === true)
        {
           jQuery('#ldapauth').prop('checked',true); //No I18N
        }
        else
        {
           jQuery('#ldapauth').prop('checked',false); //No I18N
        }
    }
    else if(section === 'ldapSchedule')
    {
      adpageJS.showLdapSchedule();
      closeCalDialog();
    }

    adpageJS.allowEdit = true;
},
editSection : function (section,btn){
    if(!adpageJS.allowEdit){
        alert(getMessageForKey("sdp.ad.anotherform.open"));
        return false;
    }
    adpageJS.allowEdit = false;
    if(section === 'deleteRequester'){
        jQuery('#deleteSync').prop('disabled',false); //No I18N
        jQuery('#schdeletesync').prop('disabled',false); //No I18N
        jQuery('#notConfigured').addClass('hide');
        jQuery('#configure').removeClass('hide');
        jQuery('#delScheduleDaysConfigured').addClass('hide');
        jQuery('#delScheduleDateConfigured').addClass('hide');
        jQuery('#delScheduleDaysNotConfigured').removeClass('hide');
        jQuery('#deleditCal').removeClass('hide');
        jQuery('#schdeletesync').prop('checked',adpageJS.deleteReqParam.delSchedule);//No I18N
        adCommon.initCalendarField('deletesched');//No I18N
        adpageJS.ADCheck(jQuery('#deleteSync'));
    }else if(section === 'schedule'){ //No I18N
        jQuery('#schmsg').addClass('hide');
        jQuery('#totsch').removeClass('hide');
        jQuery('#schedule').prop('disabled', false); //No I18N
        jQuery('#schDays').addClass('hide');
        jQuery('#personalizedSch').addClass('hide');
        jQuery('#editCal').removeClass('hide');
        jQuery('#scheduleDays').removeClass('hide');
        adCommon.initCalendarField('adsched');//No I18N
        adpageJS.scheduleCheck(jQuery('#schedule'));
    }else if(section === 'adSettings'){ //No I18N
        jQuery('#ADAuth').prop('disabled', false); //No I18N
        adpageJS.adCheck(jQuery('#ADAuth'));
    }
    else if(section == 'localAuthPass')
    {
        adCommon.editLocalAuthPassSection();
    }
    else if(section == 'ldap')
    {
      	jQuery('#ldapDialog,#ldapEdit').addClass('hide');
        jQuery('#ldapauth').prop('disabled', false); //No I18N
    }
    else if(section == 'ldapSchedule')
    {
        jQuery('#notConfigured').addClass('hide');
        jQuery('#configure').removeClass('hide');
        jQuery('#ldapSchedule').prop('disabled',false); //No I18N
        jQuery('#ldapScheduleDaysConfigured').addClass('hide');
        jQuery('#ldapScheduleDateConfigured').addClass('hide');
        jQuery('#ldapScheduleDaysNotConfigured').removeClass('hide');
        jQuery('#ldapeditCal').removeClass('hide');
        jQuery('#ldapSchedule').prop('checked',adpageJS.ldapScheduleParam.ldapSchedule); // No I18N
        adCommon.initCalendarField('ldapsched');//No I18N
        adpageJS.ldapScheduleCheck(jQuery('#ldapSchedule'));
    }
    jQuery(btn).closest('.activedirect-section').find('.submit-row').removeClass('hide'); //No I18N
    jQuery(btn).closest('.activedirect-section').find('.modal-overlay2').addClass('hide'); //No I18N
    jQuery(btn).closest('.activedirect-section').find('.freezelayer-text').addClass('hide'); //No I18N
},
loadallFirstJSvar : function(del,sch,ad){
  adpageJS.deleteReqParam = del;
  adpageJS.scheduleParam = sch;
  adpageJS.adParam = ad;
},

saveLocalAuthConfig: function(btn)
{
    adpageJS.allowEdit = adCommon.saveLocalAuthPass(btn);
},

enableLdap :  function(btn)
{
    if(sdp_app.IS_DEMO_BUILD){
      disableForDemo();
      return false;
    }

    if(document.getElementById("ldapauth").checked == true)
    {
            document.getElementById("module1").value = "enableLdap";//No I18N
            document.getElementById("ldapauth").value = "true";//No I18N
    }
    else
    {
            document.getElementById("module1").value = "disableLdap";//No I18N
            document.getElementById("ldapauth").value = "false";//No I18N
    }
        
      document.LdapEnableForm.submit();
      jQuery(btn).closest('.activedirect-section').find('.submit-row').addClass('hide').end().find('input').prop('disabled', true); //No I18N
      
      jQuery('#ldapDialog,#ldapEdit').removeClass('hide');
      clickallow = true;  
      adpageJS.allowEdit = true;
},

loadDateChooser : function(btn){
    if(jQuery('#schedule').is(':checked')){
      initCalendar('ADScheduleStartDate',false,'%Y-%m-%d');
    }

}

};

function responseParser(status,message){
    
    if(status){
       
    
    switch(status){
                case "Success": //No I18N
                    showalert('success',message,'isAutoHide=true'); //No I18N
                    break;
                case "Warning": //No I18N
                        showalert('warning',message,'isAutoHide=false'); //No I18N
                    break;
                case "Info": //No I18N
                    showalert('info',message,'isAutoHide=true'); //No I18N
                    break;
                case "Failure": //No I18N
                    showalert('failure',message,'isAutoHide=false,closeOnEscKey=no,width=500,height=80'); //No I18N
                    break;
                default:
                    
            }
        }
}
function confirmUserDeleteforAD(ciid,citypeid,isAE){
    var t = citypeid;
    var citype,url,additionalparam,module;
    var actiontype = "fromModule=ADDeleteSync&module=delete"; //NO I18N 
    if(t === 6){
        if(isAE){
          actiontype = "mode=delete"; //NO I18N
        }
        citype = 'technician'; //NO I18N
        url = '/TechnicianDef.do'; //NO I18N
        additionalparam = 'tech_Id'; //NO I18N
        module = 'deleteTech'; //No I18N
    }else{
        citype = 'requester'; //NO I18N
        url = '/SearchRequester.do'; //NO I18N
        additionalparam = 'req_Id'; //NO I18N
        module = 'deleteReq'; //No I18N
    }
    if(confirmDeletingforAD(citypeid)){
    var params = actiontype + "&citype="+citype; //NO I18N
    
    params = params +"&"+additionalparam+"="+ciid; // I18N
    params += getCSRFParamURL(false);
    callAjaxRequest(url,params ,module); // I18N          
} 
}

function deleteTechFromListForAD(userid){
  if(confirmDeletingforAD(6)){
    var url = '/TechnicianDef.do'; //No I18N
    var params = "mode=delete&id="+userid; //No I18N
    var module = 'deleteTech'; //No I18N
    params += getCSRFParamURL(false);
    callAjaxRequest(url,params,module);
  }

}

function confirmDeletingforAD(t){
    if(t=== 6){
        return confirm(getMessageForKey("sdp.addel.technician.delete.confirm")); //NO I18N
    }else{
        return confirm(getMessageForKey("sdp.addel.requester.delete.confirm")); //NO I18N
    }
}


function toggleEnabled()
{
  var sslSwitch=document.getElementById("sslcheck_Switch");
  if(sslSwitch.className=="switch on")
  {
    document.getElementById("sslcheck_Switch").className="switch off";
    document.getElementById("sslcheck").checked=false;
    document.getElementById("sslcheckText").textContent=getMessageForKey("common.disabled");//'<%=bnd.getString("common.disabled")%>';
  }
  else
  {
    document.getElementById("sslcheck_Switch").className="switch on";
    document.getElementById("sslcheck").checked=true;
    document.getElementById("sslcheckText").textContent=getMessageForKey("common.enabled");//'<%=bnd.getString("common.enabled")%>';
  }

}

function setSpan()
{
  document.getElementById('sslcheck_Switch').className=document.getElementById('sslcheck').checked?'switch on':'switch off';
  document.getElementById("sslcheckText").textContent=document.getElementById('sslcheck').checked?getMessageForKey("common.enabled"):getMessageForKey("common.disabled");
  /* Help Popovers init in User AD Import  */
  setTimeout(function(){
    spInit(); // Show Popover Init
  },100);
  jQuery(window).on('resize',function(){
    jQuery('body').trigger('click'); // To Close Popover in Window Resize
  });
}

function validPredefinedPassword()
{
  var result=false;
    jQuery.ajax({
        url : '/servlet/AJaxServlet?action=validPredefinedPassword',   //No I18N
        async:false,
        type : 'GET', //NO I18N
        complete: function (resp) {
          if(resp.responseText == 'true')
          {
            result=true;
          }
        }
    });
  return result;
}

var activeDirectory = {

  // Initialise function - Events added for ou/group and manual radio button
  init : function(){
      var jB = jQuery("body");
      jB.find("input[name=OUorGroup]").on('change', function(){
          if(jQuery(this).val() == 'yes'){
              jB.find("#selUserfromManually").addClass("hide").end()
                  .find("#selUserfromOuGroup").removeClass("hide").end()
                  .find("#manuallFooter").addClass("hide").end()
                  .find("#ouGroupFooter").removeClass("hide");
          }else{
              jB.find("#selUserfromOuGroup").addClass("hide").end()
                  .find("#selUserfromManually").removeClass("hide").end()
                  .find("#ouGroupFooter").addClass("hide").end()
                  .find("#manuallFooter").removeClass("hide");
          }
      });

      // Enable / Disable the import button
      jB.find("#groupenable, #ouenable").on('change',function(){
          (jB.find("#groupenable:checked, #ouenable:checked").length==0) ? jB.find("#importusersbtn > button").attr("disabled",'') : jB.find("#importusersbtn > button").removeAttr("disabled"); //No I18N
      });
  },

  // Trigger on OU Tab clicked - Allow the OU check box to check
  ouTabswitch : function(ele){
      var jB = jQuery("body");
      jB.find("label[for='ouenable']").removeClass("opac5 ptr-ev-none").end()
          .find("label[for='groupenable']").addClass("opac5 ptr-ev-none");
  },

  // Trigger on Group Tab clicked - Allow the Group check box to check
  groupTabswitch : function(ele){
      var jB = jQuery("body");
      jB.find("label[for='groupenable']").removeClass("opac5 ptr-ev-none").end()
          .find("label[for='ouenable']").addClass("opac5 ptr-ev-none");
  },

  // Trigger on OU Tab check box enabled - Enable / Disable the freez layer
  ouEnable : function(ele){
      var freez = jQuery("#ouGroupFreez");
      if(jQuery(ele).prop("checked") == true){
          freez.addClass("hide");
      }else{
          freez.removeClass("hide");
      }
  },

  // Trigger on Group Tab check box enabled - Enable / Disable the freez layer
  groupEnable : function(ele){
      var freez = jQuery("#groupNameFreez");
      if(jQuery(ele).prop("checked") == true){
          freez.addClass("hide");
      }else{
          freez.removeClass("hide");
      }
  },

  // Trigger on import now button clicked - Shows import now message
  importUsers : function(){
      var jB = jQuery("body");
      jB.find("#iframeAdUserFreez").removeClass("hide").end()
          .find("#ImportAdMessage").fadeIn();
  },

  // Trigger on import schedule button clicked - Shows import schedule message
  SchImportUsers : function(){
      var jB = jQuery("body");
      jB.find("#iframeAdUserFreez").removeClass("hide").end()
          .find("#SchImportAdMessage").fadeIn();
  },

  //from selectou
/***
*
* Checks if any OUs are selected, if selected submit the form...
*
***/
validateOUAndGroupSelectionForm : function(form)
{
	//var valid = checkForDelete(form,"selectedOUs");
	var valid = checkForDelete(document.ImportADUsers,"selectedOUs"); // No I18N
	var userLogins = document.getElementById("ad_username_field").value;
	var selectOU = document.getElementById("allOU").checked;
	var manualUser = document.getElementById("selectedUser").checked;
	
	var groupNames = "";
	var groupEnabled = "";
  // AD Group feature disabled in MSP-SCP
	if(!isMSPOrSCP || sdp_feature_status.is_ad_group_enabled){
		var groupNames = document.getElementById("ad_groupname_field").value;
		var groupEnabled = document.getElementById("groupenable").checked;
	}
	var ouEnabled = document.getElementById("ouenable").checked;
	if(selectOU && ouEnabled && !valid)
    	{
		alert(document.getElementById('selectOUMsg').innerHTML);
	    	return valid ;
    	}
		if(selectOU && groupEnabled && (groupNames == "" || groupNames.trim() == ""))
		{
			alert(getMessageForKey('sdp.admin.ad.groupName'));
			return false;
		}
	if(userLogins == "" && !selectOU)
	{
		alert(document.getElementById('sdp.admin.ad.jserror').innerHTML);
	        return false;
	}
	//During single user import, comma separated groups are passed as it is, causing security validation failure as JSONObject is expected.
	if(!selectOU)
	{
		document.ImportADUsers.groupNames.remove();
	}
    document.ImportADUsers.operation.value="StartImporting"; //No I18N
	return true;

},

confirmFullSync: function(domainname, objecttype){
  var _self = this;

  showconfirm(true,'title='+getMessageForKey('common.confirm')+', message='+getMessageForKey('sdp.admin.ad.ou.full.sync.confirm')+', submitbutton='+getMessageForKey('sdp.admin.translation.proceed')+', cancelbutton='+getMessageForKey('sdp.htmlarea.cancel')+', closebutton=yes, closeOnEscKey=yes', function(proceed){//No I18N

    if(proceed){
      _self.refreshOU(domainname, objecttype, true);
    }
  });
},

refreshOU : function(domainname,objecttype,isFullSync)
{
	document.getElementById('refreshText').innerText=getMessageForKey('sdp.admin.ad.ou.refreshing');
	document.getElementById('refreshImg').className ='cspr flat icon-sm spinner-icon1 mr5 vmiddle';
	var action = document.ImportADUsers.action;
	document.ImportADUsers.action = document.ImportADUsers.action;
	document.ImportADUsers.operation.value="RefreshOU";     //No I18N
	jQuery('#importADuserUI').addClass('disableDiv');
	jQuery('#loading').removeClass('hide');
	callAjax("/servlet/AJaxServlet", "action=loadOUsTree&domainName="+domainname+"&objectType="+objecttype+"&isRefresh=true"+"&isFullSync="+isFullSync, 'loadoutree',domainname,objecttype); //No I18N
	document.ImportADUsers.action = action;
},


/***
* Show Error Message - when Exception occurs while enumerating the OUs in the selected Domain
*
* This method will be flushed from Java Code...
***/
showErrorMsg: function(errorMsg)
{
	document.getElementById("scanning").style.display = 'none';
	document.getElementById("scanFailed").style.display = 'block';
	document.getElementById("operationMsg").innerHTML = errorMsg ;
},


/***
*
* Initialize the screen to OnProgress Status
*
***/
initialize : function()
{
	document.getElementById("onProgress").style.display = "block" ;
	document.getElementById("result").style.display = "none" ;
},


/***
*
* Called when OU import is completed
*
***/
ouImportDone : function(domainname,objecttype)
{
	if (req.readyState == 4)
	{
		// only if "OK"
		if (req.status == 200)
		{
			var scrObjs;
			var len;
			var con = req.responseText;
			var firstFiftyChar = con.substring(0,100);
			if(firstFiftyChar.indexOf("showErrorMsg") == -1 && firstFiftyChar.indexOf("proceedDirectDomainDiscovery") == -1)
			{
				document.getElementById("main_cs").innerHTML = req.responseText;
				var scrObjs = document.getElementById('main_cs').getElementsByTagName("script");
				var len = scrObjs.length;
				for( i=0; i<len; i++ )
				{
					var json = JSON.parse(scrObjs[i].innerText)
					childStore[json["key"]] = json["value"]
				}
                elemObj = Object.keys(elemObj).length > 0 ? {} : elemObj;
				assignElements(document.ImportADUsers);
				if(isMSP){
				var url = appendTimestamp('/servlet/AJaxServlet');  // No i18n
		        var deptAjax = new Ajax.Request(url, {
                                       method: 'post',     // No i18n
                                       parameters:{action:"loadOusofaccount",domainName:domainname},  // No i18n
                                       onComplete:function(resp) {activeDirectory.sharedouImportDone(resp);}
									   });
						}
				document.ImportADUsers.importUser.disabled = false;
				document.getElementById("onProgress").style.display = "none" ;
				document.getElementById("result").style.display = "block" ;
                //CSP activity - appending event listener to the OU tree container
                jQuery('#main_cs').off('click.tree').on('click.tree', '[id^="ID_"],[id^="ceimg_"]', function(event){//No I18N

                    if(event.target.id && event.target.id.startsWith('ceimg_')){
                        ce(event.target.id.split('_')[1]);
                    }
                    else if(event.target.id && event.target.id.startsWith('ID_')){
                        gc(event.target.id.split('_')[1]);
                    }
                });
			}
			else
			{
				// "test" was added to avoid script error in IE, when con have script tag  alone.
				con = "ServiceDesk Error"+con; // No i18n
				document.getElementById("operationMsg").innerHTML = con;
				scrObjs = document.getElementById("operationMsg").getElementsByTagName("script");
				len = scrObjs.length;
				for( i=0; i<len; i++ )
				{
					var json = JSON.parse(scrObjs[i].innerText)
					if (json["function"] === "showErrorMsg") {
						activeDirectory.showErrorMsg(json["message"]);
					} else if (json["function"] === "proceedDirectDomainDiscovery") {	// No I18N
						proceedDirectDomainDiscovery();
					}
				}
			}
      //After refreshOU completed or errormsg is shown, need to remove the loading changes
      jQuery('#importADuserUI').removeClass('disableDiv');
      jQuery('#loading').addClass('hide');
      document.getElementById('refreshText').innerText=getMessageForKey('sdp.admin.ad.ou.delta.sync');
      document.getElementById('refreshImg').className ='cspr flat icon-sm rotate-right1 mr5 vmiddle top-2';

		}
	}


},

sharedouImportDone : function(resp)
	{

		// only if "OK"
		if (resp.status == 200)
		{
		var oulist=resp.responseText;
		var array = oulist.split(",");
		var len = array.length;
		for( i=0; i<len; i++ )
				{
					var id="ID_"+array[i];
					document.getElementById(id).checked=false;
					document.getElementById(id).disabled=true
}
}
},

/***
*	If the Domain Selected is a WORKGROUP, this function will be called for server flusing
*
*	Since, for requesters, proceed for domain is not required. show error message will be called.
***/
proceedDirectDomainDiscovery : function()
{
	var errorMsg = document.getElementById('ouEnumFailedMsg').innerHTML ;
	activeDirectory.showErrorMsg(errorMsg);
},
showADusers : function(arg){
	if(arg){
		jQuery('#singleUser').hide();
		jQuery('#ouTree').fadeIn();
		jQuery('#startImportingSection').addClass("hide");
		jQuery('#importNowSection').removeClass("hide");
	}
	else{
		jQuery('#singleUser').fadeIn();
		jQuery('#ouTree').hide();
		jQuery('#ad_username_field').trigger('focus');
		jQuery('#importNowSection').addClass("hide");
		jQuery('#startImportingSection').removeClass("hide");
	}
},
//
setSelectedGroups : function(selectedGroups,invalidGroups)
{
  document.getElementById("ad_groupname_field").innerText=selectedGroups;
  if(invalidGroups != "")
  {
    document.getElementById("invalidGroups").innerText=invalidGroups;
  }
},

initOUAndGroup : function(ouBasedImportEnabled,groupBasedImportEnabled)
{
  if(ouBasedImportEnabled == true)
  {
    document.getElementById('ouenable').checked=true;
    activeDirectory.ouEnable(document.getElementById('ouenable'));
    var event = new Event('change'); //No I18N
    document.getElementById('ouenable').dispatchEvent(event);
  }
  if(groupBasedImportEnabled == true)
  {
    if(ouBasedImportEnabled == false)
    {
      document.getElementById('groupSwitch').click();
    }
    document.getElementById('groupenable').checked=true;
    activeDirectory.groupEnable(document.getElementById('groupenable'));
    var event = new Event('change'); //No I18N
    document.getElementById('groupenable').dispatchEvent(event);
  }
},

validateFormAndSubmitOUSelection : function(form,inputMethod,isMDHSetup,maxGroupCount)
{
  var valid=activeDirectory.validateOUAndGroupSelectionForm(form);

  if(valid)
  {
    //SD-99540
    var validPwd=validPredefinedPassword();
    if(validPwd==false)
      {
        parent.window.open('/jsp/AuthError.jsp?ErrorMsg=sdp.admin.ad.localauth.passwordpolicymismatch', '_self');
        return false;
      }

      var jsonObject = {groupObject:[]};
      var commaSeparatedValue=document.ImportADUsers.groupNames.value;
      var arr=commaSeparatedValue.split(",");
      var isGroupEnabled=false;
      // AD Group feature disabled in MSP-SCP
      if(!isMSPOrSCP || sdp_feature_status.is_ad_group_enabled){
    	  isGroupEnabled = document.getElementById("groupenable").checked;
      }
      if(isGroupEnabled)
      {
        if(arr.length > maxGroupCount)
        {
          alert(getMessageForKey('sdp.api.error.constraint.max_count',['0',maxGroupCount]));
          return false;
        }

        for(var i=0;i<arr.length;i++)
        {
          jsonObject.groupObject.push(arr[i]);
        }

        var json=sdpToJSON(jsonObject);
        document.ImportADUsers.jsonGroupObject.value=json;
      }

    if(isMDHSetup)
    {
      jQuery('#'+inputMethod+'esm').removeClass("hide");
    }
    else
    {
      jQuery('#'+inputMethod).removeClass("hide");
    }    
    document.ImportADUsers.inputMethod.value=inputMethod;
        
    var frm=jQuery('#importADForm');    
    jQuery.ajax(
    {
          type: 'POST', // No I18N
          url: frm.attr('action'),
          data: frm.find("input[name!=groupNames]").serialize()
    });

    return false;
  }
  else
  {
    return valid;
  }

},

scheduleEnabledOrDisabled : function(isADScheduleEnabled,isMDHSetup,maxGroupCount)
{
  var btn = document.querySelector('[sdpJs="js-event-import-main"]');//No I18N

  if(isADScheduleEnabled)
  {
    btn.textContent = getMessageForKey("sdp.ad.saveandimportinschedule");
    btn.addEventListener('click', function(event) {activeDirectory.validateFormAndSubmitOUSelection(this.form, 'schedule', isMDHSetup, maxGroupCount);});//No I18N
    jQuery('#dropdown_btn').removeClass('hide');
  }
  else{
    btn.addEventListener("click", function(event) { activeDirectory.validateFormAndSubmitOUSelection(this.form, 'manual', isMDHSetup, maxGroupCount); });//No I18N
  }
},

userAlert: function(){
  jQuery('#wcag-department').change(function () {
    if(!this.checked && jQuery('#wcag-office').is(':checked')){
      message = getMessageForKey("ad.deptImport.info").replaceAll(',','&#x2c;');
      showconfirm(true,'title='+getMessageForKey("ad.deptImport.title")+',message='+message+',submitbutton='+getMessageForKey('sdp.common.ok')+',cancelbutton='+getMessageForKey('sdp.common.cancel')+', closebutton=no, closeOnEscKey=no',activeDirectory.applyUserChoiceForDept)//No I18N
    }
  });

  jQuery('#wcag-office').change(function(){
    if(this.checked){
      message = getMessageForKey('ad.siteImport.info').replaceAll(',','&#x2c;')
      showconfirm(true,'title='+getMessageForKey('ad.siteImport.title')+',message='+message+',submitbutton='+getMessageForKey('sdp.common.ok')+',cancelbutton='+getMessageForKey('sdp.common.cancel')+', closebutton=no, closeOnEscKey=no',activeDirectory.applyUserChoiceForSite);//No I18N
    }
  });
},

applyUserChoiceForDept: function(set){
  if(!set){
    jQuery('#wcag-department').prop('checked',true);//No I18N
  }
},

applyUserChoiceForSite: function(set){
  if(!set){
    jQuery('#wcag-office').prop('checked',false);//No I18N
  }
},

verifyDC : function(inputData){
  sdpAjax({
          url : "/servlet/AJaxServlet?action=verifyDC",//No I18N
          type : "GET",//No I18N
          data : sdpAjaxInputData(inputData),
          async : true,
          success : function(response){
                      if(response){
                        document.ImportADUsers.submit();
                      }
                      else{
                        showalert('failure',getMessageForKey("ad.unreachable.dc"),'isAutoHide=false,closeOnEscKey=yes');//No I18N
                        jQuery('#submitButton').button('reset');
                      }
                  },
          failedCallBack : function(){
                    showalert('failure',getMessageForKey("sdp.ajax.request.send.error")+"."+getMessageForKey("sdp.admin.windowsagent.trylatermsg")+".",'isAutoHide=false,closeOnEscKey=yes');//No I18N
                    jQuery('#submitButton').button('reset');
                  }
        });
}
}


