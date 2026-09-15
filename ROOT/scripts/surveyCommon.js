/* $Id$ */

var surveyCommon={

// To send survey from request page

sendSurveyForRequest : function(woID,requesterID)
{
  var send_survey={};
  send_survey.requester_id=requesterID;
  send_survey.ticket_id=woID;
  var input_data={"send_survey":send_survey};// NO I18N

  sdpAjax({
    url: "/api/v3/survey_mains/_send_survey_for_request", //No I18N
    method: "PUT", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      if(dataArg.survey_main.isSurveySent == true){
			showalert("success",translate("sdp.requests.viewrequest.surveysuccessmsg"),'isAutoHide=true');//NO I18N
			jQuery("#Req_Det_CreateSurvey").addClass('hide');
		}else{
			showalert("failure",translate("sdp.requests.viewrequest.surveyfailuremsg"),'isAutoHide=false');//NO I18N
		}
    }
	});
}
}