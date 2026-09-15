/* $Id$ */
var form;
var surveyObject={
  sel_user_groups:[],
  formDrag:null,
  report_data : {
    max_level : 100,
    min_level : 0
  },
  // Used to load survey list, used in SurveyReports.jspf
  loadSurveys: function(){
    zcomponent.collapsible_destroy('#surHis'); //NO I18N
  var type = jQuery("#selType").val();
  var strType = "all_responses";//NO I18N
  jQuery("#selectQueue").parent().closest('div').removeClass("hide");
  jQuery("#techSelect").parent().closest('div').removeClass("hide");
  jQuery("#requesterSelect").parent().closest('div').removeClass("hide");
  if(type==1)
  {
    strType = "incident_response";//NO I18N
  }
  else if(type == 2)
  {
    strType = "service_response";//NO I18N
  }
  else if(type == 3)
  {
    strType = "incidentNservice_response";//NO I18N
  }
  else if(type == 4)
  {
    strType = "general_response";//NO I18N
    jQuery("#selectQueue").parent().closest('div').addClass("hide");
    jQuery("#techSelect").parent().closest('div').addClass("hide");
    jQuery("#requesterSelect").parent().closest('div').removeClass("hide");
  }
  jQuery("#selSurvey").val('').trigger('change');
    var input_data = {"list_info" : {"row_count" : "50"}}; // NO I18N
  sdpAjax({
    url: "/api/v3/survey_mains", //No I18N
    method: "GET", //No I18N
        data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var list = dataArg;
      jQuery("#selSurvey").html('');
      if(list.survey_mains.length == 0)
      {
        if(strType == "all_responses" && jQuery("select#selSurvey").length == 1 && jQuery("select#selSurvey option").length == 0)
        {
          jQuery(".surveyreport-right").addClass("hide");
          jQuery("#nosurvey").removeClass("hide");

        }
      }
      else
      {
        for(var i=0;i<list.survey_mains.length;i++)
        {
            var survey = list.survey_mains[i];
            if(survey.type_id==type || strType=="all_responses")
            {
            jQuery("#selSurvey").append("<option value="+survey.survey_id+">"+encodeHTML(survey.survey_name)+"</option>");
        }
      }
      }
    }
});
  },
  // Used to update Survey Global Rules configured in Survey Exclusion Page
  updateGlobalRules : function(){
    gRules = {};
  gRules.rule_criteria=[];
  gRules.exclude_technician = false;
  if(jQuery("#excludeTechnician").prop("checked"))
  {
    gRules.exclude_technician = true;
  }

  gRules.allow_exception = false;
  if(jQuery("#allowException").prop("checked"))
  {
    gRules.allow_exception = true;
  }
  var selectedCriteria=jQuery('#rule_criteria').custom_filter("getFilterData");
  if(gRules.allow_exception && !selectedCriteria){
    return;
  }
  if(selectedCriteria)
  {
  gRules.rule_criteria = jQuery('#rule_criteria').custom_filter("getFilterData");
  }
  else
  {
    delete gRules.rule_criteria;
  }
    var input_data={"update_exclusion_details":gRules};// NO I18N
    sdpAjax({
      url : "/api/v3/survey_exclusions/_update_exclusion_details",// No I18N
      type : "PUT", // No I18N
      data: {input_data:sdpToJSON(input_data)},
      success : function(resp)
      {
      showalert("success",translate("sdp.admin.survey.alert.rulesupdated"),'isAutoHide=true');//NO I18N
  }
  });
  },
  /* Used to add/edit translation for particular survey
  * Arguements
  * surveyID : ID of the survey for which translation is added
  * transID  : ID of the translation in case of edit
  * langID   : ID of the language in which translation is added
  */
  addTranslation:function(surveyID,transID,langID){
    var translation = {};
    var langID;
    var status = true;
    var method="POST";//No I18N
    var url="";//No I18N
    translation.survey={};
    translation.status_id=1;
    translation.survey.survey_id = surveyID;
    if(transID != null)
    {
      translation.translation_id = transID;
      translation.language_id = langID;
      method="PUT";//No I18N
      url="api/v3/survey_translations/"+transID;// No I18N
    }
    else
    {
      url="api/v3/survey_translations/";// No I18N
      langID = jQuery('#selLang').val();//NO I18N
      translation.language_id = langID;
      if(translation.language_id == "0")
      {
        showalert("failure",translate("sdp.admin.survey.language.selectlanguage"),'isAutoHide=false');//NO I18N
        return;
      }
    }

    translation.survey_question_i18n = [];
    jQuery('.survey-translation-editques .form-question-container').each(function( index, value) {


      quesObj = {};
      quesObj.survey_question={};
      quesObj.survey_question.ques_id=form.survey_question[index].ques_id;
      var type = form.survey_question[index].ques_type;
      var text = jQuery(this).find('.form-question-name input').val();
      if(text === "")
      {
        status = false;
      }
      quesObj.ques_text=text;


      if(type ==="Rating")
      {
        var ratingObj={};
        quesObj.survey_rating_i18n={};
        ratingObj.survey_question={};
        var labels = jQuery(this).find('.opinion-label-container input');
        var least_label = labels.eq(0).val();
        if(least_label === "")
        {
          status = false;
        }

        var mid_label = labels.eq(1).val();
        if(mid_label === "")
        {
          status = false;
        }

        var max_label = labels.eq(2).val();
        if(max_label === "")
        {
          status = false;
        }
        ratingObj.rating_id = form.survey_question[index].survey_rating.rating_id;
        ratingObj.least_label = least_label;
        ratingObj.survey_question.ques_id = form.survey_question[index].ques_id;
        ratingObj.mid_label = mid_label;
        ratingObj.max_label = max_label;
        quesObj.survey_rating_i18n=ratingObj;
        ratingObj={};
        ratingObj.survey_question={};
      }
      else if( type ==="binaryValue")
      {
        var survey_radio_i18n={};
        survey_radio_i18n.survey_question={};
        quesObj.survey_radio_i18n=[];
        var labels = jQuery(this).find('.binary-value input[type=text]');
        for(var j=0;j<labels.length;j++)
         {
     var optid = jQuery(this).find('.field-val').eq(j).data('value'); // No I18n
          var text = labels[j].value;
          if(text === "")
          {
            status = false;
          }
          survey_radio_i18n.option_id=optid;
          survey_radio_i18n.option_text=text;
          survey_radio_i18n.survey_question.ques_id = form.survey_question[index].ques_id;
          quesObj.survey_radio_i18n.push(survey_radio_i18n);
          survey_radio_i18n={};
          survey_radio_i18n.survey_question={};
         }
      }
      else if(type === "Radio")
      {
        var survey_radio_i18n={};
        quesObj.survey_radio_i18n=[];
        survey_radio_i18n.survey_question={};
         var labels = jQuery(this).find('.radio-options input[type=text]');
         for(var j=0;j<labels.length;j++)
         {
          var optid = form.survey_question[index].survey_radio[j].option_id;
          var text = labels[j].value;
          if(text === "")
          {
            status = false;
          }
          survey_radio_i18n.option_id=optid;
          survey_radio_i18n.option_text=text;
          survey_radio_i18n.survey_question.ques_id = form.survey_question[index].ques_id;
          quesObj.survey_radio_i18n.push(survey_radio_i18n);
          survey_radio_i18n={};
          survey_radio_i18n.survey_question={};
         }
      }
      translation.survey_question_i18n.push(quesObj);
    });
    var input_data={"survey_translation":translation};// NO I18N
    if(status){
      sdpAjax({
        url: url,
        method: method,
        data: {input_data:sdpToJSON(input_data)},
        success: function(dataArg)
        {
        showalert("success",translate("sdp.admin.survey.translation.added"),'isAutoHide=true');//NO I18N
          jQuery('.survey-translation-quesfrm [data-name=closeLangfn]').trigger('click');
          surveyObject.loadTranslationList(surveyID);
          jQuery("#selLang option[value='"+langID+"']").remove();
          jQuery("#selLang").val("0").trigger("change");
        }
      });
    }else{
      showalert("failure",translate("sdp.admin.survey.questions.mandatory"),'isAutoHide=false');//NO I18N
    }
  },
  /* Used to edit the translation data for a particular survey
  *Arguments
  * surveyID     : Id of the survey for which translation is mapped.
  * transID      : Id of the translation
  * mode         : delete|toggle status (enable|disable)
  * enablestatus : holds either enable | disable .
  * langname     : name of the language associated to the translation
  */
  editTranslation:function(surveyID,transID,mode,enablestatus,langname)
  {
    if(mode == "delete"){
      showconfirm(true,'title='+translate("sdp.dashboard.common.confirmdelete")+',message='+translate("sdp.admin.survey.delete.option.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true);//NO I18N
        function showconfirmcallback(s) {
            if(s){
              sdpAjax({
                url:"/api/v3/survey_translations/"+transID,// No I18N
                type:"DELETE", //NO I18N
                success:function(res){
                showalert("success",translate("sdp.admin.survey.translation.deleted"),'isAutoHide=true');//NO I18N
                surveyObject.loadTranslationList(surveyID);
                surveyObject.loadLanguage(surveyID);
                }
             });
            }
        }
    }else
    {
      var url="/api/v3/survey_translations/"+transID+"/_toggle_status";// NO I18N
      sdpAjax({
        url : url,
        type : "PUT", // No I18N
        success : function(resp)
        {
        var success_msg = "";
        var langarr= [];
        langarr.push(langname);
        if(enablestatus == 1){
          success_msg = translate("sdp.admin.survey.translation.toggle.disable",langarr);
        }else{
          success_msg = translate("sdp.admin.survey.translation.toggle.enable",langarr);
        }
        showalert("success",success_msg,'isAutoHide=true');//NO I18N
        surveyObject.loadTranslationList(surveyID);
         }
          });
    }
  },
  /* To load configured translations
  * surveyID : ID of the survey
  */
  loadTranslationList : function(surveyID)
  {
    zcomponent.collapsible_destroy('#surHis'); //NO I18N
      var input_data={"list_info":{"search_criteria":{"field":"survey","values":[surveyID],"condition":"is"}}};//No I18N
      sdpAjax({
        url: "/api/v3/survey_translations", //No I18N
        method: "GET", //No I18N
        data:{input_data:sdpToJSON(input_data)},
        skipSUBREQUEST:true,
        success: function(dataArg)
        {
            var parent  = jQuery(".survey-translation .listview");
            var translation_list = dataArg.survey_translations;
            jQuery("#translationHistory").addClass('hide');
            if(translation_list.length > 0)
            {
              jQuery(parent).find("table").removeClass("hidden");
              jQuery(parent).find(".emptysurveyform").addClass("hidden");
              jQuery(parent).find("tbody tr").not(':first').remove();//NO I18N
              for(var i=0;i<translation_list.length;i++)
              {
                var translation = translation_list[i];
                $el = jQuery(parent).find("tbody tr:first").clone().removeClass("hidden");
              if(translation.status_id == 1)
                {
                  jQuery($el).find(".sdmenu-dd li").eq(1).removeClass("hidden").addClass("survey-translation-action").attr("data-trans-action","edit").attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id).attr("data-item-lang",translation.language).attr("data-item-statusid",translation.status_id);
                }
              if(translation.status_id == 2)
                {
            jQuery($el).find(".sdmenu-dd li").eq(0).removeClass("hidden").addClass("survey-translation-action").attr("data-trans-action","edit").attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id).attr("data-item-lang",translation.language).attr("data-item-statusid",translation.status_id);
                        	jQuery($el).find(".survey-transla-lang .modal-overlay2").removeClass("hide");
                            jQuery($el).find(".survey-transla-lang .freezelayer-text").removeClass("hide");
                            jQuery($el).find(".survey-transla-lang .freezelayer-text .enable").addClass("survey-translation-action").attr("data-trans-action","edit").attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id);

                            jQuery($el).find(".survey-transla-lang .freezelayer-text .delete").addClass("survey-translation-action").attr("data-trans-action","delete").attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id);
                }
                jQuery($el).find(".sdmenu-dd li").eq(2).off("click.editTranslation").addClass("survey-translation-action").attr("data-trans-action","delete").attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id);// No I18N

                            jQuery($el).find(".translated-lang a").text(translation.language).attr("data-survey-id",surveyID).attr("data-item-id",translation.translation_id).attr("data-item-lang",translation.language).attr("data-item-langid",translation.language_id).attr("data-item-statusid",translation.status_id);
                            jQuery($el).find(".translated-lang-details strong").text(translation.owner_name);
                            jQuery(parent).find('table tbody').append($el);
              }

        }
        else
        {
          jQuery(parent).find("table").addClass("hidden");
          jQuery(parent).find(".emptysurveyform").removeClass("hidden");
        }   
      }
	});
	jQuery('.survey-translation').off("click.surveyAction").on("click.surveyAction",".survey-translation-action",function(event)// No I18N
                    {
                      var transId=jQuery(this).attr("data-item-id");
                      var language=jQuery(this).attr("data-item-lang");
                      var surveyId=jQuery(this).attr("data-survey-id");
                      var action=jQuery(this).attr("data-trans-action");
                      var statusId=jQuery(this).attr("data-item-statusid");
                      switch(action){
                        case "delete":// No I18N
                          surveyObject.editTranslation(surveyId,transId,'delete');
                        break;
                        case "edit":// No I18N
                          surveyObject.editTranslation(surveyId,transId,'toggleStatus',statusId,language)
                        break;
                      }
                    });
},
/*
* Used to validate the dates provided in Start date and end date fields in General Survey
*/
validateDates:function()
{
  var startTime = jQuery("#datepicker13").val();
  var startDate = new Date(startTime);
  var endTime = jQuery("#datepicker14").val();
  var endDate = new Date(endTime);
  if(startTime!=undefined && endTime!=undefined &&startDate.getTime()>=endDate.getTime())
  {
      showalert("failure",translate("sdp.admin.survey.alert.enddategreater"),'isAutoHide=false');//NO I18N
      jQuery("#datepicker13").val("");
      jQuery("#datepicker14").val("");
  }
},
/*
Used to load survey report
*/
loadFullReport : function(btn){
  zcomponent.collapsible_destroy('#surHis'); //NO I18N
	var msg = jQuery(btn).button('loading');
	if(btn != undefined){//When the event is from Apply Filter button .. Reset satisfaction level select2 to All responses
		jQuery("[data-name=survyresultfilter]").val(-1).select2({
	        minimumResultsForSearch: Infinity
	    });
		surveyObject.report_data.max_level = 100;
		surveyObject.report_data.min_level = 0;
	}
	setTimeout(function () {
		msg.button('reset');
    if(isMSP && mspGlobalReport == 0 && btn == undefined)
      {
        var accountsList='';
        if(!document.getElementsByName("surveyAllAccounts")[0].checked)
        {
          var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
          for (var i = 0; i < selectedAccounts.length; i++) {
            accountsList +=selectedAccounts[i].value + ",";//No I18N
          }
        }
        else{
            accountsList += "0";
        }
        var groupElement = jQuery("#selectQueue"); //No I18N
        groupElement.empty();
        reloadSurveyFilterForMSP(groupElement, 'get_survey_filter_queues', accountsList); //No I18N

        var techElement = jQuery("#techSelect"); //No I18N
        techElement.empty();
        reloadSurveyFilterForMSP(techElement, 'get_survey_filter_techs', accountsList); //No I18N
      }
		surveyObject.report_data.start_date = jQuery("#datepicker13").val();
		surveyObject.report_data.end_date = jQuery("#datepicker14").val();
		surveyObject.report_data.survey_type = jQuery("#selType").val();
		surveyObject.report_data.survey_ids = null;
		var surveys = jQuery("#selSurvey").val().length > 0 ? jQuery("#selSurvey").val() : null;
		if(surveys != null)
		{
		if(surveys instanceof Array )
		{
		  surveyObject.report_data.survey_ids = surveys;
		}
		else
		{
		  surveyObject.report_data.survey_ids = JSON.parse("["+surveys+"]");
		}
		}
		surveyObject.report_data.group_ids = jQuery("#selectQueue").val().length > 0 ? JSON.parse("["+jQuery("#selectQueue").val()+"]") : null;
		surveyObject.report_data.tech_ids =JSON.parse("["+jQuery("#techSelect").val()+"]") ;
		surveyObject.report_data.requester_ids=JSON.parse("["+jQuery("#requesterSelect").val()+"]");
		surveyObject.report_data.max = 0;
		surveyObject.report_data.min = 0;
		surveyObject.report_data.offset = 0;
		surveyObject.report_data.limit = 100;
    jQuery(".surveyreport-right").removeClass("hide");
    jQuery(".emptyreport").addClass("hide");
    surveyObject.loadReportChart();
		setTimeout(function () {
      if(btn == undefined || surveyObject.report_data.has_response){// if btn is undefined event is from satisfaction dropdown.
       // Function has been reused for 'Apply filter' button and satisfaction level dropdown
        jQuery(".surveyreport-right").removeClass("hide");
        jQuery(".emptyreport").addClass("hide");
        surveyObject.loadResponseList();
      }else
      {
        jQuery(".surveyreport-right").addClass("hide");
        jQuery("#noresponse").removeClass("hide");
      }
		},100);
	}, 1000);
},
/*
Used to load report chart
*/
loadReportChart : function()
{
  if(isMSP)
    {
      if(mspGlobalReport == 1)
      {
        report_data.globalReport = true;
      }
      else
      {
        var accArr = [];
        if(document.getElementsByName("surveyAllAccounts")[0].checked)
        {
          var accObj = {'accountsList' : ''}; //NO I18N
          accArr.push(accObj);
          accObj = {'surveyAllAccounts' : 'surveyAllAccounts'}; //NO I18N
          accArr.push(accObj);
        }
        else{
          var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
          var accountsList='';
          for (var i = 0; i < selectedAccounts.length; i++) {
            accountsList +=selectedAccounts[i].value + "#----#";//No I18N
          }
          var accObj = {'accountsList' : accountsList}; //No I18N
          accArr.push(accObj);
        }
        report_data.account_data = accArr;
      }
    }
  var input_data={"report_config":surveyObject.report_data};// No I18N
  sdpAjax({
    url: "/api/v3/survey_mains/_get_report_chart", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var reportData = dataArg.survey_main;
      var satisfaction = reportData.satisfaction_level.levels;
      var aggregate = reportData.satisfaction_level.aggregate;
      var summary = reportData.summary.summary;
      var totalResponse = reportData.summary.total_responses;
      var totalResponseEntries = 0;
      for(var i=0;i<summary.length;i++){
        totalResponseEntries+=summary[i].value;
      }
      surveyObject.report_data.total_responses = totalResponse;
      surveyObject.report_data.has_response = reportData.summary.has_response;
      summaryCenterText = translate("sdp.admin.survey.reports.totalresponse")+"<br>"+e_html(totalResponseEntries); //No I18N
      satisfactionCenterText = translate("sdp.admin.survey.reports.aggregate")+"<br>"+e_html(aggregate); //No I18N
      surveyObject.renderSurveyChart(satisfaction, 'chart-container', translate("sdp.admin.survey.reports.satisfaction"), satisfactionCenterText); //No I18N
      surveyObject.renderSurveyChart(summary, 'chart-container1', translate("sdp.admin.survey.response.summary"), summaryCenterText); //No I18N
    }
  });
},
/*
* Used to render Survey report chart
*/
renderSurveyChart: function(data,divId,title,centerText)
{
  var seriesdata = [], colors =[];
  for(var node of data) {
      seriesdata.push([node.label, node.value]);
      colors.push(node.color);
  }
  var container = document.getElementById(divId);
  jQuery(container).empty();
  var chartData = {
      seriesdata: {
          chartdata: [ { type: "Pie", data: [ seriesdata ] } ] //No I18N
      },
      metadata: {
          axes: {
              x: [0], y: [[1]],
              tooltip: ["{{val(0)}}, {{per(1)}}"] //No I18N
          },
          columns: [
              { dataindex: 0, datatype: "ordinal" }, //No I18N
              { dataindex: 1, datatype: "numeric" }, //No I18N
          ]
      },
      chart: {
          axes: {
              xaxis: { label: { show: false } },
              yaxis: [ { label: { show: false } } ]
          },
          plot: { plotoptions: { pie: {innerRadius: "50%"} } } //No I18N
      },
      legend: {
          colors: colors,
          layout: "vertical", //No I18N
          vAlign: "center", //No I18N
          maxWidth: 150,
          border: { show: true, color: "#000000", radius: 1, size: 1 }, //No I18N
          shadow: { show: true, color: "rgba(186,186,186)" } //No I18N
      },
      tooltip: { backgroundColor: "white", opacity: 1, layout: "horizontal", fontColor: "rgba(0,0,0,0.7)" }, //No I18N
      canvas: {
          title: { text: title },
          subtitle: { show: false }
      },
      notes: {
        enabled: true,
        chartValues: [
          {
            type: "customNote", //No I18N
            description: centerText,
            x: function(chartObj, conf, ele) {
              var bound = ele.getBoundingClientRect();
              return chartObj.plotarea.left + (chartObj.plotarea.width / 2) - (bound.width / 2);
            },
            y: function(chartObj, conf, ele) {
              var bound = ele.getBoundingClientRect();
              return chartObj.plotarea.top + (chartObj.plotarea.height / 2) - (bound.height / 2);
            },
            htmlEl: function(chartObj, conf) {
              return "<div style='text-align: center;'><span style='font-size:12px;'>" + conf.description + "</span></div>"; //No I18N
            }
          }
        ]
      },
  };
  var chartObj = new $ZC.charts(container, chartData);
},
setUITooltip : function()
{
	var tooltipClassName = 'uitip'; //NO I18N
    jQuery('*[rel=uitip]').each(function() { //NO I18N
        var current = jQuery(this);
        var cursorTrack = current.data('cursor-track'); //NO I18N
        if (cursorTrack == null || cursorTrack == undefined) {
            cursorTrack = true;
        }
        current.uitooltip({
            content: function() {
                var element = jQuery(this);
                return element.attr('title') //NO I18N
            },
            track: cursorTrack,
            tooltipClass: tooltipClassName,
            show: {
                effect: 'none', //NO I18N
                delay: 10
            },
            hide: {
                effect: 'none', //NO I18N
                delay: 10
            }
        });
    });
},

/*
Used to load the survey reponse list in Survey Reports Page
*/
loadResponseList : function()
{
  if(isMSP)
    {
      if(mspGlobalReport == 1)
      {
        report_data.globalReport = true;
      }
      else
      {
        var accArr = [];
        if(document.getElementsByName("surveyAllAccounts")[0].checked)
        {
          var accObj = {'accountsList' : ''}; //NO I18N
          accArr.push(accObj);
          accObj = {'surveyAllAccounts' : 'surveyAllAccounts'}; //NO I18N
          accArr.push(accObj);
        }
        else{
          var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
          var accountsList='';
          for (var i = 0; i < selectedAccounts.length; i++) {
            accountsList +=selectedAccounts[i].value + "#----#";//No I18N
          }
          var accObj = {'accountsList' : accountsList}; //No I18N
          accArr.push(accObj);
        }
        report_data.account_data = accArr;
      }
    }
  var input_data={"report_config":surveyObject.report_data};// No I18N
  sdpAjax({
    url: "/api/v3/survey_mains/_get_response_list", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var reportData = dataArg.survey_main;
        jQuery('#userSurveyList tbody tr').not(':first').remove();//NO I18N
        jQuery("#surveyResponseParent").prop('checked', false);// No I18N
	    if(reportData.responses.length == 0)
	    {
	    	  jQuery("#emptyreport").removeClass("hide");
	    	  jQuery(".survey-report-table .listview tbody").append('<tr><td colspan="4"><span class="text-muted p10">'+translate('sdp.admin.survey.report.nosurvey1')+'</span></td></tr>');
              jQuery("#deleteSurveyResponse").prop("disabled",true);// No I18N
	    }
	    else
	    {
	    	jQuery("#emptyreport").addClass("hide");
	    	jQuery(".survey-report-table .listview").removeClass("hide");
	    	for(var i=0;i<reportData.responses.length;i++)
	          {
	            var surveyEntry = reportData.responses[i];
              var responseID=reportData.responses[i].id;
	            var $el = jQuery('#userSurveyList tbody tr:first').clone().removeClass("hidden");
              jQuery($el).find('td').eq(0).html('<input type="checkbox" id="'+responseID+'" name="surveyCheckBox" class="survey-report-action" data-event-action="toggleDeleteButton"/>');
	            jQuery($el).find('td').eq(1).html('<a href="/" sdphrefJs="js-href-surveyDetails-1" class="survey-report-action" data-event-action="viewResponse" data-survey-id="'+surveyEntry.id+'">'+encodeHTML(surveyEntry.requester_name)+'</a>');
	            var requesterDetails = reportData.responses[i].requester;
	            var requesterString = "<b>"+translate("sdp.common.name")+"</b> : "+encodeHTML(requesterDetails.fullname)+"</br>";//NO I18N
	            if(requesterDetails.email!=undefined && requesterDetails.email != ""){
	            	requesterString += "<b>"+translate("sdp.admin.survey.userDetails.email")+"</b> : "+encodeHTML(requesterDetails.email)+"</br>";//NO I18N
	            }else{
	            	requesterString += "<b>"+translate("sdp.admin.survey.userDetails.email")+"</b> : -</br>";//NO I18N
	            }
	            if(requesterDetails.phone!=undefined && requesterDetails.phone != ""){
	            	requesterString += "<b>"+translate("sdp.viewuserdetails.phone")+"</b> : "+encodeHTML(requesterDetails.phone)+"</br>";//NO I18N
	            }else{
	            	requesterString += "<b>"+translate("sdp.viewuserdetails.phone")+"</b> : -</br>";//NO I18N
	            }
	            if(requesterDetails.is_vip_user == true){
	            	jQuery($el).find('td').eq(1).find("a").addClass("vip-name-xs");
	            }
	            jQuery($el).find('td').eq(1).find("a").attr("title",requesterString);//NO I18N
	            jQuery($el).find('td').eq(1).attr("rel","uitip");//NO I18N
	            var entryTime = new Date(surveyEntry.time);
	            var timeStr = entryTime.getDate()+"/"+(entryTime.getMonth()+1)+"/"+entryTime.getFullYear();
	            jQuery($el).find('td').eq(2).text(surveyEntry.time);
	            jQuery($el).find('td').eq(3).text(surveyEntry.result+"%");
	            if(surveyEntry.comment != undefined){
	            	jQuery($el).find('td').eq(4).text(surveyEntry.comment);
	            }
	            jQuery('#userSurveyList tbody').append($el);
	          }
	    	surveyObject.setUITooltip();
	    }
    surveyObject.pageNavigator();
    }
    });
},
/*
* To view the survey responses
* id : response Id
*/
viewResponse : function(id)
{
  showURLInDialog('/survey/ViewResponse.jsp?responseID='+id, 'modal=yes,closeOnEscKey=yes,closeButton=no,width=1040,position=absmiddle');//NO I18N
},
/*
* Used for page navigation
*/
pageNavigator : function()
{
  surveyObject.report_data.max = surveyObject.report_data.limit+surveyObject.report_data.offset;
  jQuery("#nextPage").removeClass("disabled");
  jQuery("#prevPage").removeClass("disabled");

  if(surveyObject.report_data.max >= surveyObject.report_data.total_responses)
  {
    surveyObject.report_data.max = surveyObject.report_data.total_responses;
    jQuery("#nextPage").addClass("disabled");
  }
  surveyObject.report_data.min = surveyObject.report_data.offset + 1;
  if(surveyObject.report_data.min > surveyObject.report_data.max)
  {
    surveyObject.report_data.min = surveyObject.report_data.max;
    jQuery("#prevPage").addClass("disabled");
  }
  if(surveyObject.report_data.min <= 1)
  {
    jQuery("#prevPage").addClass("disabled");
  }
  jQuery("#pageRange").html(surveyObject.report_data.min+" - "+surveyObject.report_data.max+" "+translate("sdp.common.navigation.of")+" "+surveyObject.report_data.total_responses);//NO I18N
},
//1 is next 0 is previous
changeOffset : function(direction)
{
  if(direction == 0)
  {
    surveyObject.report_data.offset = surveyObject.report_data.offset - surveyObject.report_data.limit;
    surveyObject.report_data.min = surveyObject.report_data.offset;
  }
  else
  {
    surveyObject.report_data.offset = surveyObject.report_data.offset + surveyObject.report_data.limit;
    surveyObject.report_data.max = surveyObject.report_data.offset;
  }
  surveyObject.loadResponseList();
},
// To handle satisfaction level changes
changeSatisfaction : function(level)
{
  var intlevel = parseInt(level);
  if(intlevel < 0)
  {
    surveyObject.report_data.max_level=100;
    surveyObject.report_data.min_level=0;
  }
  else
  {
    surveyObject.report_data.max_level=intlevel+25;
    surveyObject.report_data.min_level=intlevel+1;
  }
  setTimeout(function () {
    surveyObject.loadFullReport();
  },100);
},

/*
* to load available user groups
*/
loadUserGroups : function()
{
  var list_names,data,tabArr=[],menu,menuArr=[],tabArr=[];
    var copied_usr_grps,copied_sel_grps;
    list_names=[{"name":translate("available.user.groups.label")}];//NO I18N

    surveyObject.convertUsrGrpFormt();
    copied_usr_grps=JSON.parse(sdpToJSON(av_usr_groups));
    copied_sel_grps=JSON.parse(sdpToJSON(surveyObject.sel_user_groups));

    menu={"id":-1,"name":"no-header"};//NO I18N
    menu['user_groups']=copied_usr_grps;
    menuArr.push(menu);

    tabArr.push(menuArr);

    data={'height':'150px','unselected_list':tabArr,'id':'templateAssoc','removeSelected':true,'selected_list':copied_sel_grps,'unsel_list_names':list_names,'sel_list_name':translate('selected.user.groups.label'),'subMenuAttrName':'user_groups'};//NO I18N
    multiselectComp=new multiSelect(jQuery("#assocUserGroups"),data);
},
convertUsrGrpFormt : function()
{
  for(var i=0;i<av_usr_groups.length;i++){
    if(av_usr_groups[i].text){
       av_usr_groups[i].name=av_usr_groups[i].text;
       delete av_usr_groups[i].text;
    }
}
},
// To add Survey template
addTemplate : function()
{
  var quest = form.survey_question;
  template = {};
  template.survey_name = jQuery("#surveyName").val();//NO I18N
  template.survey_question = quest;
  var type_id = jQuery("#group_id").val();
  template.type_id=type_id;
  for (let iter = 0; iter < template.survey_question.length; iter++) {
    delete template.survey_question[iter].properties;
    delete template.survey_question[iter].ques_id;
    if(template.survey_question[iter].survey_rating==null)
    {
      delete template.survey_question[iter].survey_rating;
    }
    else
    {
      delete template.survey_question[iter].survey_rating.rating_id;
    }
    if(template.survey_question[iter].survey_radio==null || template.survey_question[iter].survey_radio.length === 0 )
    {
      delete template.survey_question[iter].survey_radio;
    }
    else
    {
      for(let iter1=0;iter1<template.survey_question[iter].survey_radio.length;iter1++)
      {
        delete template.survey_question[iter].survey_radio[iter1].option_id;
  }
    }

   }
   var selected_criteria=jQuery("#ticket_criteria").custom_filter("getFilterData");// No I18N
   if(selected_criteria)
    {
      template.criteria=selected_criteria;
    }
    else
    {
      if(selected_criteria==null)
      {
        template.criteria=[];
      }
      else
      {
        return;
      }
   }
   if(isMSP)
    {
    var accArr = [];
    if(document.getElementsByName("surveyAllAccounts")[0].checked)
    {
      var accObj = {'accountsList' : ''}; //NO I18N
      accArr.push(accObj);
      accObj = {'surveyAllAccounts' : 'surveyAllAccounts'}; //NO I18N
      accArr.push(accObj);
    }
    else{
      var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
      var accountslen = selectedAccounts.length;
      if(accountslen==0) {
        showalert("failure",translate("sdp.msp.reqTemplate.selectAccount.error"),'isAutoHide=false');//NO I18N
        return;
      }
      var accountsList='';
      for (var i = 0; i < accountslen; i++) {
        accountsList +=selectedAccounts[i].value + "#----#";//No I18N
      }
      var accObj = {'accountsList' : accountsList}; //No I18N
      accArr.push(accObj);
    }
    template.account_data = accArr;
    }
   var input_data={"survey_template":template};// NO I18N
   sdpAjax({
     url: "/api/v3/survey_templates", //No I18N
     method: "POST", //No I18N
     data: {input_data:sdpToJSON(input_data)},
     success: function(dataArg)
     {
    showalert("success",translate("sdp.admin.survey.success.addtemplate"),'isAutoHide=true');//NO I18N
     }
   });
},

/*
* to delete a survey
* surevyID : Id of the survey to be deleted
*/

deleteSurvey : function(surveyID)
{
  showconfirm(true,'title='+translate("sdp.dashboard.common.confirmdelete")+',message='+translate("sdp.admin.survey.delete.option.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true);//NO I18N
	function showconfirmcallback(s) {
		if(s){
       var url="/api/v3/survey_mains/"+surveyID+"/_delete_survey";// NO I18N
      sdpAjax({
        url : url,
        type : "PUT", // No I18N
        success : function(resp)
    		{
			  if(jQuery("[data-name=survyfilter]").length > 0)
			  {
				jQuery("[data-name=survyfilter] li.active a").trigger('click');
        refreshSurveyList('allticket');//NO I18N
				createGeneralSurveyRows();
				jQuery(".action-go-back").trigger('click');
			  }
			  else
			  {
				location.href="/SurveyListView.do?action=getSurveyConfiguration";
			  }
		}
    });
	}
}
},

/*
* to stop the survey
* surveyID : Id of the survey
* source   :  list | details
*/
stopSurvey : function(surveyID,source)
{
  var url="/api/v3/survey_mains/"+surveyID+"/_stop_survey";// No I18N
  sdpAjax({
    url : url,
    type : "PUT", // No I18N
    success : function(resp)
    {
	  showalert("success",translate("sdp.admin.survey.stopped"),'isAutoHide=true');//NO I18N
      if(source == "list")
      {
       jQuery("[data-name=survyfilter] li.active a").trigger('click');
       refreshSurveyList('allticket');//NO I18N
       createGeneralSurveyRows();
      }
      else if(source == "details")
      {
         surveyObject.loadSurvey(surveyID,"viewWorkSpace");//NO I18N
      }
    }
});
},

/*
To start the survey
* surveyID : Id of the survey
* source   : list | details
*/

startSurvey : function(surveyID,source)
{
  var url="/api/v3/survey_mains/"+surveyID+"/_initiate_survey";// No I18N
  sdpAjax({
    url : url,
    type : "PUT", // No I18N
    success : function(resp)
    {
		showalert("success",translate("sdp.admin.survey.started"),'isAutoHide=true');//NO I18N
        if(source == "list")
        {
        	jQuery("[data-name=survyfilter] li.active a").trigger('click');
          refreshSurveyList('allticket');//NO I18N
        	createGeneralSurveyRows();
        }
        else if(source == "details")
        {
        	surveyObject.loadSurvey(surveyID,"viewWorkSpace");//NO I18N
        }
    }
});
},

/*
* To add survey
* status : status of the survey
*/
addSurvey : function(status)
{

  if(validInput())
    {
        var survey = {};
        var critArr=[];
        var type_id = jQuery("#surveyType").val();
        survey.type_id= type_id;
        survey.survey_name = jQuery("#surveyName").val();//NO I18N
        survey.description = jQuery("#surveyDesc").val();//NO I18N
        survey.status_id = status;
        if(type_id == 1 || type_id == 2 || type_id == 3)
        {
            var survey_mode = jQuery('input:radio[name=config'+type_id+']:checked').val();
            survey.survey_mode = survey_mode;
            if(survey_mode != 1)
            {
                survey.loop_interval = jQuery('input:radio[name=config'+type_id+']:checked').nextAll('input[type="number"]').first().val();//NO I18N
            }
            if(survey.loop_interval==null)
            {
              survey.loop_interval=0;
            }
            var selected_criteria=jQuery("#ticket_criteria").custom_filter("getFilterData");// No I18N
           if(selected_criteria)
            {
            survey.criteria=selected_criteria;
            }
            else
            {
              survey.criteria=[];
            }
            survey.module="request";//No I18N
        }
        else if(type_id == 4)
        {
           if(jQuery(".survey-recurrencetoggle ").attr("data-value") == "1")
             {
                 var startTime = jQuery("#datepicker11_IN").val();
                 survey.start_time = startTime;
                 var endTime = jQuery("#datepicker12_IN").val();
                 survey.end_time = endTime;
                 survey.loop_interval = jQuery("#repeatDays").val();//NO I18N
             }
             else
             {
                 survey.loop_interval = -1;
             }

            //check of 1-100
            if(jQuery("#checkpct").is(":checked") && jQuery("#pct_user").val() > 0 &&  jQuery("#pct_user").val() <= 100)
            {
              survey.pct_user = jQuery("#pct_user").val();//NO I18N
            }
            else
            {
              //select all
              survey.pct_user = 100;
            }

            if(jQuery("#surveyAudienceUG").is(":checked")){

                 selUsrGrps=multiselectComp.getSelItems()['tab_0'];
                if(selUsrGrps){
                   for(i=0;i<selUsrGrps.length;i++){
                        critArr.push({'user_group':selUsrGrps[i].id});
                   }
                }
            }
            if(critArr.length>0)
            {
            survey.criteria_general=critArr;
            }
            survey.module="general";//No I18N
        }
        if(form.survey_question.length == 0)
        {
            showalert("failure",translate("sdp.admin.survey.question.warning"),'isAutoHide=false');//NO I18N
            return;
        }
        if(jQuery("#additionalCmnt").hasClass("on"))
        {
          survey.is_comments_required=true;
          survey.is_comments_mandatory = jQuery("#checkmantr").is(":checked");//NO I18N
        }
        else
        {
          survey.is_comments_required=false;
        }
        survey.survey_question=form.survey_question;
        for (let iter = 0; iter < survey.survey_question.length; iter++) {
         delete survey.survey_question[iter].properties;
         if(survey.survey_question[iter].ques_id!=null)
         {
          delete survey.survey_question[iter].ques_id;
         }
         if(survey.survey_question[iter].survey_rating==null)
      {
        delete survey.survey_question[iter].survey_rating;
      }
      else
      {
        delete survey.survey_question[iter].survey_rating.rating_id;
      }
      if(survey.survey_question[iter].survey_radio==null || survey.survey_question[iter].survey_radio.length === 0 )
      {
        delete survey.survey_question[iter].survey_radio;
      }
      else
      {
        for(let iter1=0;iter1<survey.survey_question[iter].survey_radio.length;iter1++)
        {
          delete survey.survey_question[iter].survey_radio[iter1].option_id;
    }
      }
        }
        if(isMSP)
          {
            var accArr = [];
            if(document.getElementsByName("surveyAllAccounts")[0].checked)
            {
              var accObj = {'accountsList' : ''}; //No I18N
              accArr.push(accObj);
              accObj = {'surveyAllAccounts' : 'surveyAllAccounts'}; //No I18N
              accArr.push(accObj);
            }
            else{
              var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
              var accountsList='';
              for (var i = 0; i < selectedAccounts.length; i++) {
                accountsList +=selectedAccounts[i].value + "#----#";//No I18N
              }
              var accObj = {'accountsList' : accountsList};//No I18N
                      accArr.push(accObj);
            }
            survey.account_data = accArr;
          }
        var input_data={"survey_main":survey};// NO I18N
        sdpAjax({
          url: "/api/v3/survey_mains", //No I18N
          method: "POST", //No I18N
          data: {input_data:sdpToJSON(input_data)},
          success: function(dataArg)
          {
            refreshSurveyList('allticket');//NO I18N
            createGeneralSurveyRows();
            surveyObject.showListView();
            surveyObject.backToSurveyList();
          }
        });
    }

},
/*
* To update the survey details
* surveyID    : Id of the survey
* oldstatusID : current status of survey
* newstatusID : status of the survey to be updated
*/
updateSurvey : function(surveyID,oldstatusID,newstatusID)
{
  if(validInput())
  {
  var input_data={"list_info":{"search_criteria":{"field":"survey","values":[surveyID],"condition":"is"}}};//No I18N
  sdpAjax({
    url: "/api/v3/survey_translations", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      if(dataArg.survey_translations.length > 0 && oldstatusID == 4){
        if(confirm(translate("sdp.admin.survey.update.deletetranslation"))){
          var ids="";
          for(var iter=0;iter < dataArg.survey_translations.length;iter++)
          {
              ids+=dataArg.survey_translations[iter].translation_id;
              ids+=",";
          }
          if (ids.slice(-1) === ',') {
            ids = ids.slice(0, -1);
          }
          surveyObject.deleteSurveyTranslations(ids);
        }
        else
        {
          return;
        }
    }
    surveyObject.updateSurveyCallback(surveyID,oldstatusID,newstatusID);
    }
});
  }
},
/*
* To update the survey details
* surveyID    : Id of the survey
* oldstatusID : current status of survey
* newstatusID : status of the survey to be updated
*/
updateSurveyCallback : function(surveyID,oldstatusID,newstatusID)
{

    var critArr = [];
    var type_id;
    var survey = {};
    if(oldstatusID != 4)
    {
      surveyObject.saveOlatemplate();
    }
    survey.survey_name = jQuery("#surveyName").val();//NO I18N
    survey.description = jQuery("#surveyDesc").val();//NO I18N
    var type_id = jQuery("#surveyType").val();
    survey.type_id=type_id;
    survey.survey_question=form.survey_question;
    survey.status_id=newstatusID;
    if(type_id == 1 || type_id == 2 || type_id == 3)
    {
      var survey_mode = jQuery('input:radio[name=config'+type_id+']:checked').val();
      survey.survey_mode = survey_mode;
      if(survey_mode != 1)
      {
        survey.loop_interval = jQuery('input:radio[name=config'+type_id+']:checked').nextAll('input[type="number"]').first().val();//NO I18N
      }
      if(survey.loop_interval==null)
      {
        survey.loop_interval=0;
      }
      var selected_criteria=jQuery("#ticket_criteria").custom_filter("getFilterData");// No I18N
     if(selected_criteria)
     {
      survey.criteria=selected_criteria;
     }
     else
     {
       survey.criteria=[];
     }
      survey.module="request";//No I18N
    }
    else if(type_id == 4)
    {
    	if(jQuery(".survey-recurrencetoggle ").attr("data-value") == "1")
        {
          var startTime = jQuery("#datepicker11_IN").val();
          survey.start_time = startTime;
          var endTime = jQuery("#datepicker12_IN").val();
          survey.end_time = endTime;
          survey.loop_interval = jQuery("#repeatDays").val();//NO I18N
        }
        else
        {
          survey.loop_interval = -1;
        }

    //check of 1-100
      if(jQuery("#checkpct").is(":checked") && jQuery("#pct_user").val() > 0 &&  jQuery("#pct_user").val() <= 100)
      {
        survey.pct_user = jQuery("#pct_user").val();//NO I18N
      }
      else
      {
        //select all
        survey.pct_user = 100;
      }

      if(jQuery("#surveyAudienceUG").is(":checked")){

          selUsrGrps=multiselectComp.getSelItems()['tab_0'];
          if(selUsrGrps){
             for(i=0;i<selUsrGrps.length;i++){
                  critArr.push({'user_group':selUsrGrps[i].id});
             }
          }
      }
      survey.criteria_general=critArr;
      survey.module="general";//No I18N
    }
    if(jQuery("#additionalCmnt").hasClass("on") == true)
    {
      survey.is_comments_required=true;
      survey.is_comments_mandatory = jQuery("#checkmantr").is(":checked");//NO I18N
    }
    else
    {
      survey.is_comments_required=false;
    }
    for (let iter = 0; iter < survey.survey_question.length; iter++) {
      delete survey.survey_question[iter].properties;
      if(survey.survey_question[iter].survey_rating==null)
      {
        delete survey.survey_question[iter].survey_rating;
      }
      if(survey.survey_question[iter].survey_radio==null || survey.survey_question[iter].survey_radio.length === 0 )
      {
        delete survey.survey_question[iter].survey_radio;
      }

     }
     if(isMSP)
      {
        var accArr = [];
        if(document.getElementsByName("surveyAllAccounts")[0].checked)
        {
          var accObj = {'accountsList' : ''}; //NO I18N
          accArr.push(accObj);
          accObj = {'surveyAllAccounts' : 'surveyAllAccounts'}; //NO I18N
          accArr.push(accObj);
        }
        else{
          var selectedAccounts=document.getElementsByName("selectedAccountsBox")[0];
          var accountsList='';
          for (var i = 0; i < selectedAccounts.length; i++) {
            accountsList +=selectedAccounts[i].value + "#----#";//No I18N
          }
          var accObj = {'accountsList' : accountsList};//No I18N
          accArr.push(accObj);
        }
        survey.account_data = accArr;
     }
     var input_data={"survey_main":survey};// NO I18N
     var url="/api/v3/survey_mains/"+surveyID;// No I18N
     sdpAjax({
      url: url,
      method: "PUT", //No I18N
      data: {input_data:sdpToJSON(input_data)},
      success: function(dataArg)
      {
        showalert("success",translate("sdp.admin.survey.updated"),'isAutoHide=true');//NO I18N
      	surveyObject.loadSurvey(surveyID,"viewWorkSpace");//NO I18N
      }
    });

},

// Used to update the survey order
updateSurveyOrder : function()
{
  var surveyOrder = [];
  jQuery("#ticketSurveys .admin-box .row").not(":first").each(function(){//NO I18N
    surveyOrder.push(parseInt(jQuery(this).attr("data-id")));
   });
   var input_data={"survey_order":surveyOrder};// NO I18N
   sdpAjax({
     url : "/api/v3/survey_mains/_reorder_survey",// NO I18N
     type : "PUT", // No I18N
     data: {input_data:sdpToJSON(input_data)},
     success : function(resp)
     {
        showalert("success",translate("sdp.admin.survey.reorder.status.success"),'isAutoHide=true');//NO I18N
        jQuery("[data-name=cancelsurveyreorder]").trigger('click');
 }
 });
},
// Used to laod survey email messages in Survey Email Configuration Page
loadMessages : function(configid)
{
  jQuery("[data-name=saveemail]").addClass("hide");
   jQuery("[data-name=updateemail]").removeClass("hide");
   sdpAjax({
    url: "/api/v3/survey_emails/"+configid, //No I18N
    method: "GET", //No I18N
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
       var config = (dataArg.survey_email);
       //removing and adding the subject to dissociate autocomplete. else the old one will persist.
       var $subject = jQuery('<input>').attr({id: "subject", type: "text", class: "form-control", maxlength:"250"});
       var $subjectparent = jQuery("#subject").parent();
       jQuery("#subject").remove();
       $subjectparent.append($subject);
       jQuery("#subject").val(config.title);
       jQuery("#success").val(config.success_message.replace('\\"', '"')); //since java escapes " as \"
       jQuery("#failure").val(config.failure_message);
       jQuery("#thanks").val(config.thanks_message);
       if(config.status_id == 2){
         jQuery("[data-name=updateemail]").addClass("disabled");
       }else{
         jQuery("[data-name=updateemail]").removeClass("disabled");
       }

       setTimeout(function(){
      var type = 'ticket';  // No I18N
      if(config.type_id == 4){
        type= 'general';  // No I18N
      }
      zeditor({element:'HTMLDesc1',content:config.description,edithtml:true,isEnterKeyHandler:true,resize:true,toolbar:"generalToolbar", afterload: function(){//NO I18N
        init_autocomplete(type);
      }});

       }, 100);
    }
   });
},
// To load default email messages
loadDefaultMsgs : function()
{
  var type_id = jQuery("#typeid").val();
  var defaultid;
  if(type_id == "1")
  {
    defaultid = jQuery("[data-name=ticketTranslation]").attr("data-item-id");
  }
  else
  {
    defaultid = jQuery("[data-name=generalTranslation]").attr("data-item-id");
  }

  sdpAjax({
    url: "/api/v3/survey_emails/"+defaultid, //No I18N
    method: "GET", //No I18N
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var config = (dataArg.survey_email);
      jQuery("#demo_subject").html(encodeHTML(config.title));
        jQuery("#demo_Form_description").html("<p>"+config.description+"</p>");//NO I18N
      jQuery("#demo_success").html(encodeHTML(config.success_message));
      jQuery("#demo_failure").html(encodeHTML(config.failure_message));
      jQuery("#demo_thanks").html(encodeHTML(config.thanks_message));
    }
  });
},

// To add survey email configuration

addEmailConfig : function()
{
  jQuery("[data-name='saveemail']").addClass("disabled");
  var type_id = jQuery("#typeid").val();
  var lang_id = jQuery(".survey-mail-langselect").select2("data").id;//NO I18N
  var language = jQuery(".survey-mail-langselect").select2("data").text;//NO I18N
  var survey_email = {};
  if(!isNaN(lang_id) && lang_id > 0)
  {
	  if(validEmailConfig())
	  {
      survey_email.type_id=type_id;
      survey_email.language_id=lang_id;
      survey_email.status_id=1;
		  survey_email.title = jQuery("#subject").val();
		  survey_email.success_message = jQuery("#success").val();
		  survey_email.thanks_message = jQuery("#thanks").val();
		  survey_email.failure_message = jQuery("#failure").val();
		  survey_email.description = editor.getHTML();

      var input_data={"survey_email":survey_email};// NO I18N
      sdpAjax({
        url: "/api/v3/survey_emails", //No I18N
        method: "POST", //No I18N
        data: {input_data:sdpToJSON(input_data)},
        success: function(dataArg)
        {
          if (dataArg.response_status.status == 'failure')
          {
            showalert("failure",dataArg.response_status.status,'isAutoHide=false');//NO I18N
			      jQuery("[data-name='saveemail']").removeClass("disabled");
          }
          else
          {
			    showalert("success",translate("sdp.admin.survey.email.translation.add"),'isAutoHide=true');//NO I18N
              var config = dataArg.survey_email;
			    var config_id = config.config_id;
			    var username = encodeHTML(config.username);
			    var dummyrow = jQuery(".admin-box [data-name=ticketTranslation]").clone().removeClass("active")[0];
			    if(type_id == "4")
			    {
			      dummyrow = jQuery(".admin-box [data-name=generalTranslation]").clone().removeClass("active")[0];
			    }
			    jQuery(dummyrow).attr("data-item-id",config_id);
              jQuery(dummyrow).find("strong").html(language);
			    jQuery(dummyrow).find("ul").removeClass("hide");
          jQuery(dummyrow).find("li").eq(0).addClass("hide").attr("data-item-id",config_id);
          jQuery(dummyrow).find("li").eq(1).removeClass("hide").attr("data-item-id",config_id);
          jQuery(dummyrow).find("li").eq(2).attr("data-item-id",config_id);
          jQuery(dummyrow).find('[data-name=enableTranslation]').attr("data-item-id",config_id);
          jQuery(dummyrow).find('[data-name=disableTranslation]').attr("data-item-id",config_id);
          jQuery(dummyrow).find('[data-name=deleteEmailConfig]').attr("data-item-id",config_id);
			    jQuery(dummyrow).find(".text-muted").html(translate("sdp.admin.survey.createdby")+": "+username);
			    jQuery(dummyrow).find('.setting-box').css('visibility', 'visible');	// No I18N
			    jQuery(".admin-box").append(dummyrow);
			    jQuery(".survey-container-email [data-name=managelanguage]").trigger('click');
			    jQuery("[data-name='saveemail']").removeClass("disabled");
			    jQuery(".survey-mail-langselect option[value='"+lang_id+"']").remove();

				//For manage translation
				var managelang = jQuery('[data-id=survey-container-email]');
				managelang.find('[data-name=survey-mail-managelang]').removeClass('survey-mail-addlang');
	            managelang.find('[data-name=survey-mail-manageemail]').removeClass('hide');
				managelang.find('[data-name=survey-mail-defaultques] .form-footer [data-name=cancelemailtranslation]').addClass('hide');
				managelang.find('.survey-mail-defaultques,[data-name=survey-mail-langselect]').addClass('hide');
        jQuery(".nav-sdtabs").unfreeze();
        }
      }
      });
	  }
	  jQuery(".nav-tabs").unfreeze();
  }
  else
  {
	  showalert("failure",translate("sdp.admin.survey.email.select.language"),'isAutoHide=false');//NO I18N
  }

  jQuery("[data-name='saveemail']").removeClass("disabled");
},

// To update email configuration
updateEmailConfig : function()
{

  jQuery("[data-name='updateemail']").addClass("disabled");
  var config_id = jQuery(".admin-box .active").attr("data-item-id");
  if(config_id != undefined && validEmailConfig())
  {
      var survey_email = {};
	  survey_email.title = jQuery("#subject").val();
	  survey_email.success_message = jQuery("#success").val();
	  survey_email.thanks_message = jQuery("#thanks").val();
	  survey_email.failure_message = jQuery("#failure").val();
	  survey_email.description = editor.getHTML();
    var input_data={"survey_email":survey_email};// No I18N
    sdpAjax({
      url : "/api/v3/survey_emails/"+config_id, // No I18N
      type : "PUT", // No I18N
      data : {input_data : sdpToJSON(input_data)},
      success : function(resp)
      {
        if(resp.response_status.status=="success")
        {
		  showalert("success",translate("sdp.admin.survey.email.translation.update"),'isAutoHide=true');//NO I18N
	      jQuery("[data-name='updateemail']").removeClass("disabled");
        }
        else
        {
          showalert("failure",resp.response_status.status,'isAutoHide=false');//NO I18N
		  jQuery("[data-name='updateemail']").removeClass("disabled");
        }
      }
  });
  }
jQuery("[data-name='updateemail']").removeClass("disabled");

},

// To load available languages
loadLanguages : function(typeid)
{
  var input_data ={"type_id":typeid};// No I18N
  sdpAjax({
    url: "/api/v3/survey_emails/_get_available_language", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var options = dataArg.survey_email.survey_languages;
	    jQuery("select.survey-mail-langselect option").not(":first").remove();//NO I18N
	    (options).forEach(function(obj){


	      jQuery("select.survey-mail-langselect").append(jQuery('<option>', {
	                  value: obj.language_id,
	                  text: obj.language
	      }));

	    });
    }
	});
},

// To toggle the status of created email configurations

toggleEmailConfigStatus : function(configid,togglestatus)
{
  var url="/api/v3/survey_emails/"+configid+"/_toggle_status";// NO I18N
    sdpAjax({
      url : url,
      type : "PUT", // No I18N
      success : function(resp)
      {
      var success_msg = "";
      if(togglestatus == 1){
        success_msg = translate("sdp.admin.survey.email.status.enabled");
      }else{
        success_msg = translate("sdp.admin.survey.email.status.disabled");
      }
	    showalert("success",success_msg,'isAutoHide=true');//NO I18N
	    if(jQuery("[data-item-id="+configid+"]").find("li").eq(0).hasClass("hide"))
	    {
	    	jQuery("[data-item-id="+configid+"]").addClass("freezelayer-wrapper pos-rel");
	    	jQuery("[data-item-id="+configid+"] .freezelayer-text").removeClass("hide");
	    	jQuery("[data-item-id="+configid+"] .modal-overlay2").removeClass("hide");
	        jQuery("[data-item-id="+configid+"]").find("li").eq(0).removeClass("hide");
	        jQuery("[data-item-id="+configid+"]").find("li").eq(1).addClass("hide");
	    }
	    else if(jQuery("[data-item-id="+configid+"]").find("li").eq(1).hasClass("hide"))
	    {
	    	jQuery("[data-item-id="+configid+"]").removeClass("freezelayer-wrapper pos-rel");
	    	jQuery("[data-item-id="+configid+"] .freezelayer-text").addClass("hide");
	    	jQuery("[data-item-id="+configid+"] .modal-overlay2").addClass("hide");
	        jQuery("[data-item-id="+configid+"]").find("li").eq(1).removeClass("hide");
	        jQuery("[data-item-id="+configid+"]").find("li").eq(0).addClass("hide");
	    }
       }
        });
},

// to delete email configuration

deleteEmailConfig : function(configid,type)
{
  showconfirm(true,'title='+translate("sdp.dashboard.common.confirmdelete")+',message='+translate("sdp.admin.survey.delete.option.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true);//NO I18N
    function showconfirmcallback(s) {
        if(s){
          sdpAjax({
            url:"/api/v3/survey_emails/"+configid,// No I18N
            type:"DELETE", //NO I18N
            success:function(res){
			    showalert("success",translate("sdp.admin.survey.email.deleted"),'isAutoHide=true');//NO I18N
			    jQuery("[data-item-id="+configid+"]").remove();
			    if(type=='ticket'){
			    	jQuery(".admin-box [data-name=ticketTranslation]")[0].trigger('click');
			    	surveyObject.loadLanguages(1);
			    }else{
			    	jQuery(".admin-box [data-name=generalTranslation]")[0].trigger('click');
			    	surveyObject.loadLanguages(4);
			    }
            }
         });
        }
    }
},

// Used for list view page navigation

backToSurveyList : function()
{
  zcomponent.collapsible_destroy('#surHis'); //NO I18N
	jQuery("[data-name=formpreview]").attr("data-item-id","undefined");
	jQuery('#surveyName').val('');
	jQuery('#surveyDesc').val('');
	jQuery('#checkpct').prop('checked',false); //No I18N
	jQuery('#pct_user').val('');
	jQuery('#move-fieldright3 .move-templatelist ul').find('li:first').trigger('click');
	jQuery(".surveyprojtemp").text(translate("sdp.admin.rightpanel.listview.menu.new.newsurvey"));
	jQuery(".survey-translation #selLang").val(0).trigger('change');
	refreshSurveyList('allticket'); // No I18N
	createGeneralSurveyRows();
	surveyObject.showListView();
	jQuery("[data-name=survyfilter] li.active a").trigger('click');
	jQuery("[data-name=cancelsurveyreorder]").trigger('click');
  if(isMSP){
		document.getElementsByName('surveyAllAccounts')[0].checked = false;
    document.getElementById("__multibox__render__availableAccountsBox__selectedAccountsBox").style.display = 'block';
		var selAccs = document.getElementsByName('selectedAccountsBox')[0];
		for (var i = 0; i < selAccs.length; i++) {
			selAccs.options[i].selected = true;
		}
		document.getElementsByName('__selectedAccountsBox_to_availableAccountsBox')[0].click();
	}
	// SD-87422 - multiselectcomp will be used only when User groups is present in the application
	if(jQuery("#surveyAudienceUG").is(":checked")){
       if(multiselectComp){
    		  multiselectComp.destroyMultiSelect();
  	}
  	}
},

// to delete survey responses from Survey Reports page

deleteSurveyResponse : function()
{
  var selectedCheckboxes = jQuery("input:checkbox[name=surveyCheckBox]:checked");
  var length = selectedCheckboxes.length;
  if(length>0)
  {
    var ids = selectedCheckboxes.map(function() {
            return jQuery(this).attr("id");
            }).get().join(",");
     sdpAjax({
        url:"/api/v3/survey_response_mains",// No I18N
        type:"DELETE", //NO I18N
        data:"ids="+ids,// No I18N
        success:function(res){
          showalert("success", translate("api.deleted.success", [translate("sdp.admin.leftpanel.helpdesk.surveyresults")]), 'isAutoHide=true');//NO I18N
          window.location.reload();
        }
     })
  }
},

// to delete bulk translations from Survey Configuration page

deleteSurveyTranslations : function(transaltionsIds)
{
  sdpAjax({
    url:"/api/v3/survey_translations",// No I18N
    type:"DELETE", //NO I18N
    data:"ids="+transaltionsIds,// No I18N
    success:function(res){
      showalert("success", translate("sdp.admin.survey.translation.deleted"), 'isAutoHide=true');//NO I18N
    }
 });
},

// To toggle delete button if responses are not present

toggleDeleteButton : function()
{
  const isAnyCheckboxChecked = jQuery("input:checkbox[name=surveyCheckBox]:checked").length > 0;
  jQuery("#deleteSurveyResponse").prop("disabled", !isAnyCheckboxChecked);//No I18N
},

// To get Exclusion details in Survey Exclusion page
getSurveyExclusionDetails : function()
{
  sdpAjax({
    url: "/api/v3/survey_exclusions/_get_exclusion_details", //No I18N
    method: "GET", //No I18N
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      var ruleArrayFinal=[];
      var surveyExclusion = dataArg.survey_exclusion;
      var ruleArrayStr=JSON.stringify(surveyExclusion.ruleArray);
      if(ruleArrayStr)
{
ruleArrayStr=ruleArrayStr.slice(1,-1);
ruleArrayFinal=jQuery.parseJSON('['+ruleArrayStr+']');
}
  jQuery('#allowException').trigger('click');
if(surveyExclusion.allowException == 1)
{
  jQuery("#allowException").prop("checked",true);
  jQuery('#rule_criteria').removeClass('hide');//NO i18N
}
else
{
  jQuery("#allowException").prop("checked",false);
  jQuery('#rule_criteria').addClass('hide');//NO i18N
}
if(surveyExclusion.excludeTechnician == 1)
{
  jQuery("#excludeTechnician").prop("checked",true);
}
else
{
  jQuery("#excludeTechnician").prop("checked",false);
}
var adv_options = {
  maxrows:60,
  fieldTypeConditions: {
  "mode":["is", "is_not"], // No I18N
  "priority":["is", "is_not"],// No I18N
  "level":["is", "is_not"],// No I18N
  "site":["is", "is_not"],// No I18N
  "requester":["is", "is_not"],// No I18N
  "department":["is", "is_not"],// No I18N
  "is_vipuser":["is", "is_not"],// No I18N
  "email_id":["is", "is_not","contains", "not_contains","starts_with","ends_with"], // No I18N
  "point_of_contact":["is","is_not"],// No I18N
  "account":["is","is_not"]// No I18N
  },
  enableDragHandle: true,
  changeURLData: surveyObject.changeURLData,
  changeData : function(data,field){
    if(field=='is_vipuser'){
     var data1=[];
     data1.push(data[0]);
    }
        return data1;
    },
    "metainfo": {
        "mode":{
            "display_type":"Pick List",
            "href":"/requests/mode",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.mode"),
            "fields":{
                "name":{
                    "display_type":"Single Line",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
         "priority":{
            "display_type":"Pick List",
            "href":"/requests/priority",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.priority"),
            "fields":{
                "name":{
                    "display_type":"Single Line",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
         "level":{
            "display_type":"Pick List",
            "href":"/requests/level",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.level"),
            "fields":{
                "name":{
                    "display_type":"Single Line",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
          "site":{
            "display_type":"Pick List",
            "href":"/requests/site",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.site"),
            "fields":{
                "name":{
                    "display_type":"Pick List",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
          "requester":{
            "display_type":"Pick List",
            "href":"/requests/requester",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.reqname"),
            "fields":{
                "name":{
                    "display_type":"Single Line",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
          "department":{
            "display_type":"Pick List",
            "href":"/requests/department",
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
            "type":"lookup",
            "partial_field":false,
            "display_name":translate("sdp.requests.common.dept"),
            "fields":{
                "name":{
                    "display_type":"Single Line",
                    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
                    "type":"string",
                    "partial_field":true,
                    "display_name":"Name"
                }
            }
        },
        "is_vipuser": {
        "display_type":"Single Line",
        "href":"/users/is_vipuser",
         "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type": "boolean",
        "partial_field": true,
        "display_name": translate("sdp.admin.requesterDef.vipuser")
      },
      "email_id": { //No I18N
      "display_type": "Single Line",//No I18N
      "display_key": "sdp.admin.group.user.addgroup.criteria.email",//No I18N
      "type": "string",//No I18N
      "partial_field": true,//No I18N
      "list_view": true,//No I18N
       "display_name": translate("sdp.admin.group.user.addgroup.criteria.email"),//No I18N
       "constraints": {//No I18N
        "max_length": 200//No I18N
      }
      }
    }
};
if(isSCP)
{
  delete adv_options.metainfo.department;
  delete adv_options.metainfo.site;
  delete adv_options.metainfo.is_vipuser;
}
if(isMSP)
{
  adv_options.metainfo.point_of_contact={
"display_type":"Single Line",//No I18N
        "href":"/users/is_point_of_contact",//No I18N
         "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
        "type": "boolean",//No I18N
        "partial_field": true,//No I18N
        "display_name": translate("sdp.msp.account.pointofcontact")//No I18N
  };
}
if(isSCP || isMSP)
{
  adv_options.metainfo.account={
    "display_type":"Pick List",//No I18N
    "href":"/accounts/name",//No I18N
    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
    "type":"lookup",//No I18N
    "partial_field":false,//No I18N
    "display_name":translate("sdp.msp.common.account"),//No I18N
    "fields":{//No I18N
        "name":{//No I18N
            "display_type":"Single Line",//No I18N
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
            "type":"string",//No I18N
            "partial_field":true,//No I18N
            "display_name":"Name"//No I18N
        }
    }
  };
}
jQuery("#rule_criteria").custom_filter(adv_options);
jQuery("#rule_criteria").custom_filter("update",ruleArrayFinal);//NO I18N

    }
	});
},

// To initialize survey exclusion rules in Survey Exclusion page
initSurveyRules : function()
{
  jQuery('#allowException').on('change', function() {
    if(jQuery("#allowException").prop("checked")) {
      jQuery("#allowException").prop("checked",true);
        jQuery('#rule_criteria').removeClass('hide');//NO i18N
    }
    else{
      jQuery("#allowException").prop("checked",false);
      jQuery('#rule_criteria').addClass('hide');//NO i18N
    }
});
},

saveOlatemplate : function()
{
  jQuery('.form-question-container').each(function(index, value)
    {
        var placeholdertxt = jQuery(this).find('.form-question-name input').val();
        form.survey_question[index].ques_text = placeholdertxt;
        if (jQuery(this).find('.opinion-scale').length == 1)
        {
            var wdh = 100 / jQuery(this).find('.opinion-label-container .opinion-label').length;
            jQuery(this).find('.opinion-label-container div').each(function()
            {
                var label = jQuery(this).find('input').val();
                var dataName = jQuery(this).find('input').attr('data-name');
                if(dataName.indexOf("left") > -1)
                {
                    form.survey_question[index].survey_rating.least_label = label;
                }
                else if(dataName.indexOf("center") > -1)
                {
                    form.survey_question[index].survey_rating.mid_label = label;
                }
                else if(dataName.indexOf("right") > -1)
                {
                    form.survey_question[index].survey_rating.max_label = label;
                }
            });
        }
        if (jQuery(this).find('.binary-value').length == 1)
        {
            jQuery(this).find('.binary-value .field-val').each(function(optNo)
            {
                var label = jQuery(this).find('input').val();
                 form.survey_question[index].survey_radio[optNo].option_text = label;
            });
        }
        if (jQuery(this).find('.radio-options').length == 1)
        {
            var wdh = 100 / jQuery(this).find('.radio-options .field-val').length;
            jQuery(this).find('.radio-options .field-val').each(function(optNo)
            {
                var radioLabel = jQuery(this).find('input.form-control').val();
                form.survey_question[index].survey_radio[optNo].option_text = radioLabel;
            });
        }
    });

},

editOlatemplate : function()
{
  jQuery('.droppable-rightform').addClass('survey-translation').find('ul');
    jQuery('.form-question-container').each(function(index, value)
    {
        var placeholdertxt = encodeHTML(jQuery(this).find('.form-question-name').text());
        jQuery(this).find('.form-question-name').html('<input type="text" maxlength="300" class="form-control" placeholder="' + placeholdertxt + '" value="' + placeholdertxt + '">');

        if (jQuery(this).find('.opinion-scale').length == 1)
        {
            var wdh = 100 / jQuery(this).find('.opinion-label-container .opinion-label').length;
            jQuery(this).find('.opinion-label-container .opinion-label').each(function()
            {
                jQuery(this).html('<input type="text" maxlength="100" class="form-control fl mt10" placeholder="' + encodeHTML(jQuery(this).text()) + '" value="' + encodeHTML(jQuery(this).text()) + '" data-name="'+jQuery(this).attr('class')+'">').attr('style','margin-right: 0.33%;');
            });
        }
        if(jQuery(this).find('.binary-value').length == 1)
        {
            jQuery(this).find('.binary-value .field-val').each(function()
            {
                var classattr = jQuery(this).find('i').attr('class');
                var label=jQuery(this).text();
               jQuery(this).html('<em class="' + classattr + '"></em><input maxlength="100" style="width: auto; display: inline;" type="text" class="form-control" placeholder="' + encodeHTML(label) + '" value="' + encodeHTML(label) + '">');
            });
        }
        if (jQuery(this).find('.radio-options').length == 1)
        {
            var wdh = 100 / jQuery(this).find('.radio-options .field-val').length;
            jQuery(this).find('.radio-options .field-val').each(function(e)
            {
                var qtxt = jQuery(this).find('#question_text').text();
                jQuery(this).find('label').html(jQuery(this).find('input')[0].outerHTML + '<input maxlength="100" id="qtext" type="text" class="form-control" placeholder="' + encodeHTML(jQuery(this).text()) +'">');
                jQuery(this).find('#qtext').val(qtxt);
            });
        }
    });
},
// To load new survey form page based on group id
loadNewSurvey : function(group_id)
{
  form = {};
  jQuery("#surveyid").val('');
  jQuery(".survey-hddtls input").val("");
  jQuery("[data-name=formpreview]").removeClass("hide");
  jQuery("#publishShtcut").addClass("hide");
  jQuery("#stopShtcut").addClass("hide");
  jQuery("#deleteShtcut").addClass("hide");
  jQuery("#surveyDesc").val('');
  jQuery(".survey-config-form").find("input[type=text]").not("#pct_user").val('').prop("disabled",true);//NO I18N
  jQuery(".survey-config-form").find("input[type=radio]:last").trigger('click');
  jQuery('[data-id=survey-descriptarea]').addClass('hide');

  jQuery("#surveyTabs li").not(':first').addClass("hide");
   jQuery("#surveyTabs li").off("click.loadSurvey").off("click.loadFullReport").off("click.loadComments").off("click.loadHistory").off("click.loadTranslationList");// No I18N
  jQuery("#nav_Workspace a").trigger('click');
  jQuery(".draggable-leftform").removeClass("hide");
  jQuery("#surveyform").html('');
  jQuery("#surveyform").removeClass("survey-form-preview");
  jQuery("#surveyConfHistory").addClass('hide');

  form = jQuery(".droppable-rightform .form-droppablearea").surveyForm();
  if(surveyObject.formDrag == null)
  {
      surveyObject.formDrag = jQuery('.dragsection-form').formdragsection({"survey":true});//NO I18N
  }
  else
  {
      surveyObject.formDrag.survey=true;
  }
  jQuery('.droppable-rightform .emptysurveyform').removeClass('hide');
  jQuery(".surveyfilterwrapper").find("li.singlefilterwrapper").not(':first').remove();//NO I18N
  jQuery(".surveyfilterwrapper").find(".columnname").select2("val",-1).trigger('change');//NO I18N
  jQuery(".surveyfilterwrapper").find(".selectcriteria").select2("val",-1).trigger('change');//NO I18N
  jQuery(".surveyfilterwrapper").find(".selectcriteria").select2("close");//NO I18N

  jQuery("#surveyType option").removeClass("hide");
  jQuery(".new-action-btns").removeClass("hide");
  jQuery(".old-action-btns").addClass("hide").find("button").off("click.backToSurveyList").off("click.addTemplate").off("click.updateSurvey");// No I18N
  jQuery("#selType").val("");
  jQuery("#selSurvey").val("");

  jQuery("textarea[name=comment]").val('');
  jQuery('[data-name=surAddCmt]').prop('disabled', true); //NO I18N
  jQuery("[data-name=commandvalidation]").removeClass("hide");

  if(jQuery("#additionalCmnt").hasClass("on"))
  {
      jQuery("[data-id=survey-descriptarea] .tech-action").trigger('click');
  }

  jQuery('#move-fieldright3 .move-templatelist ul').find('li:first').trigger('click');
  jQuery("#datepicker11_IN").val('');
  displayClientTime('datepicker11_IN'); //NO I18N
  jQuery("#datepicker12_IN").val('');
  displayClientTime('datepicker12_IN'); //NO I18N
  jQuery("#repeatDays").val('');

  if(av_usr_groups.length<=0){
      jQuery("#targetAudience,#assocUserGroups").addClass('hide');
      jQuery("#allusers").removeClass('hide');
  }
 else{
      jQuery("#targetAudience,#assocUserGroups").removeClass('hide');
      jQuery('#surveyAudienceUG').prop('checked','true');//NO I18N
  }
  if(group_id!=4)
  {
       jQuery("#criteria_field").show();
  var criteria_options=surveyObject.getTicketCriteriaOptions();
  jQuery("#ticket_criteria").custom_filter(criteria_options);
  }
  else
  {
      jQuery("#criteria_field").hide();
  }
  if(isMSP){
    document.getElementsByName('surveyAllAccounts')[0].checked = false;
            document.getElementById("__multibox__render__availableAccountsBox__selectedAccountsBox").style.display = 'block';
    var selAccs = document.getElementsByName('selectedAccountsBox')[0];
    for (var i = 0; i < selAccs.length; i++) {
      selAccs.options[i].selected = true;
    }
    document.getElementsByName('__selectedAccountsBox_to_availableAccountsBox')[0].click();
  }
},

// To initialize criteria component for request based survey
getTicketCriteriaOptions : function()
{
  var adv_options = {
    maxrows:10,
     "notMandatory":true,// No I18N
    fieldTypeConditions: {
      "mode":["is", "is_not"],// No I18N
      "priority":["is", "is_not"],// No I18N
      "level":["is", "is_not"],// No I18N
      "site":["is", "is_not"],// No I18N
      "category":["is", "is_not"],// No I18N
      "urgency":["is", "is_not"],// No I18N
      "impact":["is", "is_not"],// No I18N
      "request_type":["is", "is_not"],// No I18N
      "group":["is", "is_not"],// No I18N
      "item":["is", "is_not"],// No I18N
      "service_category":["is", "is_not"],// No I18N
      "subcategory":["is", "is_not"],// No I18N
      "template":["is", "is_not"],// No I18N
      "requester":["is", "is_not"],// No I18N
      "department":["is", "is_not"],// No I18N
      "is_vipuser":["is", "is_not"],// No I18N
      "point_of_contact":["is","is_not"], // No I18N
      "account":["is","is_not"],// No I18N
      "sub_account":["is","is_not"], // No I18N
      "product":["is","is_not"],// No I18N
      "support_rep":["is","is_not"]// No I18N
    },
    enableDragHandle: true,
    notMandatory : true,
    changeURLData: surveyObject.changeURLData,
    changeData : function(data,field){
      if(field=='is_vipuser'){
       var data1=[];
       data1.push(data[0]);
      }
          return data1;
      },
"metainfo": {
"mode":{
"display_type":"Pick List",
"href":"/requests/mode",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.mode"),
"fields":{
    "name":{
        "display_type":"Single Line",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"priority":{
"display_type":"Pick List",
"href":"/requests/priority",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.priority"),
"fields":{
    "name":{
        "display_type":"Single Line",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"level":{
"display_type":"Pick List",
"href":"/requests/level",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.level"),
"fields":{
    "name":{
        "display_type":"Single Line",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"site":{
"display_type":"Pick List",
"href":"/requests/site",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.site"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"category":{
"display_type":"Pick List",
"href":"/requests/category",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.category"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"urgency":{
"display_type":"Pick List",
"href":"/requests/urgency",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.itil.common.urgency"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},"impact":{
"display_type":"Pick List",
"href":"/requests/impact",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.problem.impact"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"request_type":{
"display_type":"Pick List",
"href":"/requests/request_type",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.requesttype"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"group":{
"display_type":"Pick List",
"href":"/requests/group",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.admin.survey.criteria.queue"),// No I18N
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"item":{
"display_type":"Pick List",
"href":"/requests/item",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.common.item"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"service_category":{
"display_type":"Pick List",
"href":"/requests/service_category",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.request.serviceaffected"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"subcategory":{
"display_type":"Pick List",
"href":"/requests/subcategory",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.common.subcategory"),
"fields":{
    "name":{
        "display_type":"Pick List",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"template":{ // No I18N
"display_type":"Pick List", // No I18N
"href":"/requests/template", // No I18N
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"], // No I18N
"type":"lookup", // No I18N
"partial_field":false, // No I18N
"display_name":translate("sdp.admin.survey.criteria.template"), // No I18N
"fields":{ // No I18N
    "name":{  // No I18N
        "display_type":"Pick List", // No I18N
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"], // No I18N
        "type":"string", // No I18N
        "partial_field":true, // No I18N
        "display_name":"Name" // No I18N
    }
}
},
"requester":{
"display_type":"Pick List",
"href":"/requests/requester",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.reqname"),
"fields":{
    "name":{
        "display_type":"Single Line",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"department":{
"display_type":"Pick List",
"href":"/requests/department",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type":"lookup",
"partial_field":false,
"display_name":translate("sdp.requests.common.dept"),
"fields":{
    "name":{
        "display_type":"Single Line",
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
        "type":"string",
        "partial_field":true,
        "display_name":"Name"
    }
}
},
"is_vipuser": {
"display_type":"Single Line",
"href":"/users/is_vipuser",
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],
"type": "boolean",
"partial_field": true,
"display_name": translate("sdp.admin.requesterDef.vipuser")
}
}
};
if(isSCP)
{
  delete adv_options.metainfo.department;
  delete adv_options.metainfo.site;
  delete adv_options.metainfo.urgency;
  delete adv_options.metainfo.impact;
  delete adv_options.metainfo.is_vipuser;
  adv_options.metainfo.account={
    "display_type":"Pick List",//No I18N
    "href":"/requests/account",//No I18N
    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
    "type":"lookup",//No I18N
    "partial_field":false,//No I18N
    "display_name":translate("sdp.msp.common.account"),//No I18N
    "fields":{//No I18N
        "name":{//No I18N
            "display_type":"Single Line",//No I18N
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
            "type":"string",//No I18N
            "partial_field":true,//No I18N
            "display_name":"Name"//No I18N
        }
    }
  };
  adv_options.metainfo.sub_account={
    "display_type":"Pick List",//No I18N
    "href":"/requests/subaccount",//No I18N
    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
    "type":"lookup",//No I18N
    "partial_field":false,//No I18N
    "display_name":translate("scp.account.subaccount"),//No I18N
    "fields":{//No I18N
        "name":{//No I18N
            "display_type":"Single Line",//No I18N
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
            "type":"string",//No I18N
            "partial_field":true,//No I18N
            "display_name":"Name"//No I18N
        }
    }
  };
  adv_options.metainfo.product={
    "display_type":"Pick List",//No I18N
    "href":"/requests/product",//No I18N
    "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
    "type":"lookup",//No I18N
    "partial_field":false,//No I18N
    "display_name":translate("sdp.field.product"),//No I18N
    "fields":{//No I18N
        "name":{//No I18N
            "display_type":"Single Line",//No I18N
            "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
            "type":"string",//No I18N
            "partial_field":true,//No I18N
            "display_name":"Name"//No I18N
        }
    }
  };
  adv_options.metainfo.support_rep={
"support_rep":{//No I18N
"display_type":"Pick List",//No I18N
"href":"/requests/technician",//No I18N
"spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
"type":"lookup",//No I18N
"partial_field":false,//No I18N
"display_name":translate("sdp.reportcols.mod1.techname"),//No I18N
"fields":{//No I18N
    "name":{//No I18N
        "display_type":"Single Line",//No I18N
        "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
        "type":"string",//No I18N
        "partial_field":true,//No I18N
        "display_name":"Name"//No I18N
    }
}
}
  };
}
if(isMSP)
{
  adv_options.metainfo.point_of_contact={
    "display_type":"Single Line",//No I18N
            "href":"/users/is_point_of_contact",//No I18N
             "spl_criteria_conditions":["previous_value","is_changed","is_not_changed"],//No I18N
            "type": "boolean",//No I18N
            "partial_field": true,//No I18N
            "display_name": translate("sdp.msp.account.pointofcontact")//No I18N
      };
}
return adv_options;
},

// To load details of particular survey

loadSurvey : function(surveyID,action)
{
  zcomponent.collapsible_destroy('#surHis'); //NO I18N
  surveyObject.loadNewSurvey();
  var url = "/api/v3/survey_mains/"+surveyID;// No I18N

  sdpAjax({
      url :url,
       type:"GET",// No I18N
      success:function(data){
      var surveyDetails = data.survey_main;
      if(isMSP)
				{
					populateMSPSurveyTemplateDetails(surveyDetails);
				}
      jQuery("#surveyConfHistory").removeClass('hide');
      jQuery(".survey-hddtls input").val((surveyDetails.survey_name));
      jQuery("#surveyDesc").val((surveyDetails.description));
      jQuery(".survey-hddtls input").trigger("keyup");
      jQuery("#nav_Workspace").off("click.loadSurvey").on("click.loadSurvey",function(){ // No I18N
                          surveyObject.loadSurvey(surveyDetails.survey_id,'viewWorkSpace');// No I18N
                      });
      jQuery("#nav_Workspace").removeClass('hide');
      jQuery("#nav_Reports").off("click.loadFullReport").on("click.loadFullReport",function(){// No I18N
                          surveyObject.loadFullReport();
                      });
      jQuery("#nav_Reports").removeClass('hide');
      jQuery("#nav_Comments").off("click.loadComments").on("click.loadComments",function(){ // No I18N
                          surveyObject.loadComments(surveyDetails.survey_id,surveyDetails.status_id);
                      });
      jQuery("#nav_Comments").removeClass('hide');
      jQuery("[data-name=formpreview]").attr("data-item-id",""+surveyID);
      jQuery("[data-id=survey_mains]").attr("entity-id",surveyID);
      if(surveyDetails.status_id != 3)
      {
       jQuery("#nav_Translation").removeClass("hide").off("click.loadTranslationList").on("click.loadTranslationList",function(){ // No I18N
                              surveyObject.loadTranslationList(surveyDetails.survey_id)
                          });
                           jQuery("#nav_Translation").off("click.loadLanguage").on("click.loadLanguage",function(){ // No I18N
                              surveyObject.loadLanguage(surveyDetails.survey_id)
                          });
      }

      form = jQuery("#surveyform").surveyForm(surveyDetails);
      jQuery('.droppable-rightform .emptysurveyform').addClass('hide');
      jQuery('[data-id=survey-descriptarea]').removeClass('hide');
      if(surveyDetails.is_comments_required!=null && surveyDetails.is_comments_required)
      {
          jQuery("[data-id=survey-descriptarea] .tech-action").trigger('click');
          if(surveyDetails.is_comments_mandatory)
          {
              jQuery('#checkmantr').prop( 'checked', true );  //NO I18N
          }
          else
          {
              jQuery('#checkmantr').prop( 'checked', false);  //NO I18N
          }

      }

      if(surveyDetails.status_id != 4)
      {
          surveyObject.formDrag.survey=false;
          jQuery(".draggable-leftform").addClass("hide");
          jQuery("#surveyform").addClass("survey-form-preview");
          surveyObject.editOlatemplate();
      }
      else
      {
          jQuery(".draggable-leftform").removeClass("hide");
          surveyObject.formDrag.survey=true;
      }
      if(surveyDetails.status_id != 3)
      {
              jQuery("#deleteShtcut").removeClass("hide").off("click.deleteSurvey").on("click.deleteSurvey",function(){ // No I18N
                                          surveyObject.deleteSurvey(surveyDetails.survey_id);
                                      });
              if(surveyDetails.status_id != 1)
              {
                  jQuery("#publishShtcut").removeClass("hide").off("click.startSurvey").on("click.startSurvey",function(){ // No I18N
                                                  surveyObject.startSurvey(surveyDetails.survey_id,'details'); // No I18N
                                               });
              }
              else
              {
                  jQuery("#stopShtcut").removeClass("hide").off("click.stopSurvey").on("click.stopSurvey",function(){ // No I18N
                                                  surveyObject.stopSurvey(surveyDetails.survey_id,'details'); // No I18N
                                               });
              }
      }
      jQuery("[data-name=formpreview]").addClass("hide");
      var s = jQuery('[data-name=surconfigchgfn]').val(surveyDetails.type_id);
      var new_selection = surveyDetails.type_id;
      if(s.val() == null){
          new_selection = s.find('option:first').val();
          if(new_selection != 'undefined'){
              s = s.val(new_selection);
          }else { new_selection = surveyDetails.type_id; }
      };
      s.trigger('change');
      jQuery("#group_id").val(new_selection);
      jQuery("#surveyid").val(surveyDetails.survey_id);
      var surveyType = "";
      if(surveyDetails.type_id == 1 || surveyDetails.type_id == 2 || surveyDetails.type_id == 3)
      {
          jQuery("#criteria_field").show();
          jQuery("#general_criteria").addClass('hide');
          var criteria_options=surveyObject.getTicketCriteriaOptions();
          jQuery("#ticket_criteria").custom_filter(criteria_options);
          if(surveyDetails.criteria!=null)
          {
              jQuery("#ticket_criteria").custom_filter("update",surveyDetails.criteria[0]);
          }
          var serachIn = "";
          if(new_selection == 1 || surveyDetails.type_id == 1)
          {
              serachIn="survey-config-incident"//NO I18N
              surveyType = translate("sdp.survey.incidentsurvey");
          }
          else if(surveyDetails.type_id == 2)
          {
              serachIn="survey-config-service"//NO I18N
              surveyType = translate("sdp.survey.servicesurvey");
          }
          else if(surveyDetails.type_id == 3)
          {
              serachIn="survey-config-incidentservice"//NO I18N
              surveyType = translate("sdp.survey.incidentservicesurvey");
          }
          var el = jQuery("[data-name="+serachIn+"]").find("[value="+surveyDetails.survey_mode+"]");
          jQuery(el).prop('checked', true).trigger("click");

          if(surveyDetails.survey_mode != 1)
          {
              jQuery(el).next("input[type=number]").val(surveyDetails.loop_interval); //NO I18N
          }

          jQuery("#surveyType option:last").addClass("hide");

          var criteriaList = surveyDetails.criteria;
          if(criteriaList != null)
          {
              jQuery("#ticket_criteria").custom_filter("update",criteriaList);
          }

          jQuery("#onlyTicket").removeClass("hide");
          jQuery("#surveyType").parent().removeClass("hide");
          jQuery("#techSelect").parent().closest('div').removeClass("hide");
      }
      else if(surveyDetails.type_id == 4)
      {
          jQuery("#criteria_field").hide();
          jQuery("#general_criteria").removeClass('hide');
          surveyType = translate("sdp.survey.generalsurvey");
          jQuery("#surveyType").parent().addClass("hide");
          jQuery("#surveyType option").not(":last").addClass("hide");//NO I18N
          jQuery("#onlyTicket").addClass("hide");
          jQuery("#techSelect").parent().closest('div').addClass("hide");
          var dataValue = jQuery('.survey-recurrencetoggle').attr("data-value");
          if(surveyDetails.loop_interval > 0)
          {
              if(dataValue == 0){
                  jQuery('.survey-recurrencetoggle').trigger('click');
              }

              jQuery("#datepicker11_IN").val(surveyDetails.start_time.value);
              displayClientTime('datepicker11_IN'); //NO I18N
              jQuery("#repeatDays").val(surveyDetails.loop_interval);

              jQuery("#datepicker12_IN").val(surveyDetails.end_time.value);
              displayClientTime('datepicker12_IN'); //NO I18N
          }
          else if(dataValue == 1)
          {
              setTimeout(function(){
                  jQuery('.survey-recurrencetoggle').trigger('click');
              },200);

          }
          if(surveyDetails.criteria_general!=null)
          {
            surveyObject.sel_user_groups = surveyDetails.criteria_general;
      if(surveyObject.sel_user_groups!=null && surveyObject.sel_user_groups!=undefined)
      {
         for(i=0;i<surveyObject.sel_user_groups.length;i++){
          surveyObject.sel_user_groups[i].id=surveyObject.sel_user_groups[i].user_group;
         }
      }
          }

         if(av_usr_groups.length<=0){
              jQuery("#targetAudience,#assocUserGroups").addClass('hide');
         }
         else{
              jQuery("#targetAudience,#assocUserGroups").removeClass('hide');
              setTimeout(function()
              {
                  if(surveyObject.sel_user_groups.length < 1){
                      jQuery('#surveyAudienceAll').prop('checked','true');//NO I18N
                      surveyObject.toggleUG(0);
                  }
                  else{
                      jQuery('#surveyAudienceUG').prop('checked','true');//NO I18N
                      surveyObject.loadUserGroups();
                      surveyObject.toggleUG(1);
                  }
              },100);
         }
      }
      if(surveyDetails.pct_user <100){
          jQuery("#checkpct").prop("checked",true);  //NO I18N
      }
      jQuery("#pct_user").val(surveyDetails.pct_user);
      jQuery(".surveyprojtemp").text(surveyType);

      jQuery(".new-action-btns").addClass("hide");
      if(surveyDetails.status_id != 3)
      {
          jQuery(".old-action-btns").removeClass("hide");
          if(surveyDetails.status_id != 1)
          {
              jQuery(".old-action-btns button").eq(0).removeClass("hide").off("click.updateSurvey").on("click.updateSurvey",function(){ // No I18N
                  surveyObject.updateSurvey(surveyDetails.survey_id,surveyDetails.status_id,1)
              });
              jQuery(".old-action-btns button").eq(1).addClass("btn-default").removeClass("btn-primary").off("click.updateSurvey").on("click.updateSurvey",function(){ // No I18N
                  surveyObject.updateSurvey(surveyDetails.survey_id,surveyDetails.status_id,surveyDetails.status_id)
              });
          }
          else
          {
              jQuery(".old-action-btns button").eq(0).addClass("hide").off("click.updateSurvey"); // No I18N
              jQuery(".old-action-btns button").eq(1).addClass("btn-primary").removeClass("btn-default").off("click.updateSurvey").on("click.updateSurvey",function(){ // No I18N
                                          surveyObject.updateSurvey(surveyDetails.survey_id,surveyDetails.status_id,surveyDetails.status_id)
                                      });
          }
            jQuery(".old-action-btns button").eq(2).removeClass("hide").off("click.addTemplate").on("click.addTemplate",function(){ // No I18N
                                  surveyObject.addTemplate();
                              });
                               jQuery(".old-action-btns button").eq(3).off("click.backToSurveyList").on("click.backToSurveyList",function(){ // No I18N
                                  surveyObject.backToSurveyList();
                               });
                              jQuery("button[data-name=surAddCmt]").off("click.addComment").on("click.addComment",function(){ // No I18N
                                  surveyObject.addComment(this,surveyDetails.survey_id);
                              });
      }
      else
      {
          jQuery("[data-name=commandvalidation]").addClass("hide");
      }

      jQuery("#selType").val("0");
      jQuery("#typefilter").addClass('hide');
      jQuery("#selSurvey").val(surveyDetails.survey_id);

      surveyObject.showDetails();
  }
  });
  if(jQuery('.sticky-fixed').length == 1) {
      jQuery('[data-stickybar=true]').removeAttr('style').removeClass('sticky-fixed');//NO I18N
      jQuery('[data-stickybar-next=true]').css('margin-top','auto');//NO I18N
  }
  setTimeout(function(){
      var event = "";//NO I18N
      if(typeof(Event) === 'function') {//NO I18N
          event = new Event('scroll');//NO I18N
      }else{
          event = document.createEvent('Event');//NO I18N
          event.initEvent('scroll', true, true);//NO I18N
      }
      window.dispatchEvent(event);
      jQuery('html, body').animate({ scrollTop: 0 }, '1');
  },100)
},

showDetails : function()
{
  jQuery("#surveyList").addClass('hide');
  jQuery("#surveydetails").removeClass('hide');
},

showListView : function()
{
    form = undefined;
    jQuery("#surveyList").removeClass('hide');
    jQuery("#surveydetails").addClass('hide');
    jQuery('html, body').animate({ scrollTop: 0 }, '1');
},

showConfiguration : function(x)
{
  surveyObject.showDetails();
  jQuery("#surveyType").val(x).trigger('change');
  surveyObject.loadNewSurvey(x);
  surveyObject.sel_user_groups=[];
  surveyObject.loadUserGroups();
  var event = "";//NO I18N
  if(typeof(Event) === 'function') {//NO I18N
      event = new Event('scroll');//NO I18N
  }else{
      event = document.createEvent('Event');//NO I18N
      event.initEvent('scroll', true, true);//NO I18N
  }
  window.dispatchEvent(event);
  jQuery('html, body').animate({ scrollTop: 0 }, '1');
},

// to toggle User groups
toggleUG : function(isSelected)
{
  var selected = 1;
  if(isSelected == undefined){
      selected = jQuery("input[name=audience]:checked").val();
  }else{
      selected = isSelected;
  }
  if(selected == "0"){
      jQuery('#move-fieldright3 .move-templatelist').find('li:first').trigger('click');
      jQuery('#move-fieldright3 .move-templatelist').find('li:first').remove();
      jQuery('#assocUserGroups').addClass('hide');

  }else{
      jQuery('#assocUserGroups').removeClass('hide');
      if(jQuery("#multiselect_templateAssoc").length<=0){
          surveyObject.loadUserGroups();
      }
  }
},

// To invoke user capacity for general survey

changeUserCap : function()
{
  showDialog(jQuery('#userCapDialog').html(),'title='+translate("sdp.admin.survey.usercap.title")+', width=500, position=absmiddle'); //No I18N
},

// To update user capacity for general survey
updateUserCap : function()
{
  var limit = jQuery('[id=usrcap]:visible').val();
  if(limit.length < 1 || limit == 0 || limit > 2147483647){
      showalert("failure",translate("sdp.admin.survey.usercap.count",["1 - 2147483647"]),'isAutoHide=false');//NO I18N
      return;
  }
  var input_data={"limit":limit};// No I18N
  sdpAjax({
    url: "/api/v3/survey_mains/_update_user_capacity", //No I18N
    method: "PUT", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      if(dataArg.survey_main.status == true){
          showalert("success",translate("sdp.admin.SettingsAction.success.save"),'isAutoHide=true');//NO I18N
          jQuery('#uclimit').text(limit);
          closeDialog();
          jQuery('[id=usrcap]').val(limit);
    }else{
      showalert("failure",translate("sdp.admin.survey.error.operation"),'isAutoHide=false');//NO I18N
      }
    }
  });
},

reorderkeypressfn : function(dataname)
{
  dataname.on('keypress',"[data-name=reorderlist] input[data-name=reorderformcontrol]", function(e){ //Use only add data-name="reorderformcontrol" in input
    var val = jQuery(this).val();
    if((val!='')&&(e.keyCode==13)){
      var elm = jQuery(this).closest('[data-name=reorderlist]:not(.hide)');// No I18N
      var vl = elm.index();
      if(dataname.find('[data-name=emptydatadisplay].hide').length == 1) {// No I18N
  val = (val >= vl) ? val : val-1;
      }
  else {
  val = (val > vl) ? val : val-1;
  }
      if(val < 0 ) {
        val = 0;
      }
      if( val  >= dataname.find('[data-name=reorderlist]:not(.hide)').length) {
        val = dataname.find('[data-name=reorderlist]:not(.hide)').length;
        dataname.find('[data-name=reorderlist]:not(.hide)').eq(val-1).after(elm.clone());
        dataname.find('[data-name=reorderlist]:not(.hide)').eq(val).addClass('reorderhiglite');
        val = val-1;
      }
      else {
        dataname.find('[data-name=reorderlist]:not(.hide)').eq(val).before(elm.clone());
        dataname.find('[data-name=reorderlist]:not(.hide)').eq(val).addClass('reorderhiglite');
      }
      elm.remove();
      dataname.animate({
  scrollTop: dataname.find('.reorderhiglite').position().top //(val-1)*60
        //scrollTop: dataname.find('.reorderhiglite').position().top-dataname.find('.reorderhiglite').height()-20 //(val-1)*60
      },500);
      setTimeout(function(){
        dataname.find('[data-name=reorderlist]:not(.hide)').removeClass('reorderhiglite')
      },900);
      updateOrder(dataname);
      jQuery('div.reorder-input-alert').fadeOut('medium');// No I18N
    }
  });
},

showReorderMsg : function(list,msgBox)
{
  var listDiv = jQuery(list); //.request-catalog-inner
  var msgBoxDiv = jQuery(msgBox); //.reorder-input-alert
  jQuery(document).on({
      'focus': function() {// No I18N
          if (!jQuery(msgBox + ' input').is(':checked')) {
              msgBoxDiv.css({
                  'left': jQuery(this).offset().left - 30,// No I18N
                  'top': jQuery(this).offset().top - msgBoxDiv.outerHeight() - 10// No I18N
              }).removeClass('hide');
          }
          msgBoxDiv.removeClass('active');
          setTimeout(function() {
              msgBoxDiv.addClass('active');
          }, 200);
      },
      'blur': function() {// No I18N
          if (!msgBoxDiv.hasClass('active')) {
              msgBoxDiv.addClass('hide');
          }
      }
  }, list + ' input.form-control');// No I18N
  jQuery(document).on('click', msgBox + 'input', function(event) {
      event.stopPropagation();
      msgBoxDiv.removeClass('active').addClass('hide');
  });
  jQuery(document).on('click', function() {
      if (msgBoxDiv.hasClass('active')) {
          msgBoxDiv.addClass('hide');
      }
  });
},
loadLanguage : function(surveyID)
{
  var survey={};
    survey.survey_id=surveyID;
    var input_data ={"survey":survey};// No I18N
  sdpAjax({
    url: "/api/v3/survey_translations/_get_available_language", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
        var list = dataArg.survey_translation.survey_languages;
      jQuery("#selLang").find("option").not(':first').remove();//NO I18N
      for(var i=0;i<list.length;i++)
        {
            var lang = list[i];
            jQuery("#selLang").append("<option value="+lang.language_id+">"+lang.language+"</option>");
        }
    }
    });
    jQuery("#transAction").off("click.addTranslation").on("click.addTranslation",function(){ // No I18N
            surveyObject.addTranslation(surveyID);
        });
},

showTicketMessages : function()
{
  jQuery("[data-name = generalTranslation").addClass("hide");
  jQuery("#typeid").val("1");
  jQuery("[data-name = ticketTranslation").removeClass("hide").eq(0).trigger('click').addClass("active");
  surveyObject.loadLanguages(1);
},

showGeneralMessages : function()
{
  jQuery("[data-name = ticketTranslation").addClass("hide");
  jQuery("#typeid").val("4");
  jQuery("[data-name = generalTranslation").removeClass("hide").eq(0).trigger('click').addClass("active");
  surveyObject.loadLanguages(4);
},
loadComments : function(surveyID,statusID)
{
  zcomponent.collapsible_destroy('#surHis'); //NO I18N

  var input_data={"list_info":{"search_criteria":{"field":"survey","values":[surveyID],"condition":"is"}}};//No I18N
  sdpAjax({
    url: "/api/v3/survey_comments", //No I18N
    method: "GET", //No I18N
    data:{input_data:sdpToJSON(input_data)},
    skipSUBREQUEST:true,
    success: function(dataArg)
    {
      jQuery('.commentdetail').not(':first').remove();//NO I18N
      comment_list = dataArg;
      for(var i=0;i<comment_list.survey_comments.length;i++)
      {
        var comment = comment_list.survey_comments[i];
        var t = new Date(comment.comment_time);
        var $el = jQuery('.commentdetail:first').clone().removeClass("hidden");
        $el.find('.commentowner').html("<strong>"+encodeHTML(comment.user.name)+"</strong> "+translate("sdp.common.on")+" "+comment.comment_time.display_value);
        $el.find('.commentsdesc').text(comment.comment_text);
        if(statusID != 3)
        {
         $el.find('[data-name=deleteComment]').attr("data-id",comment.id);
         $el.find('[data-name=deleteComment]').off("click.deleteComment").on("click.deleteComment",function(){ // No I18N
                     surveyObject.deleteComment(surveyID,comment.comment_id,this);
                   });
        }else{
          $el.find('[data-name=deleteComment]').addClass('hide');
        }
        jQuery('.comments-row').append($el);
      }
    }
  });
},
 addComment : function(comment,surveyID) {
  var txt = jQuery(comment).parents('[data-name=commandvalidation]').find('textarea').val().trim();//NO I18N
  if(txt != '' && txt.length<=500) {
    commentObj = {};
    commentObj.comment_text=txt;
    commentObj.survey={};
    commentObj.survey.survey_id=surveyID;
    var input_data={"survey_comment":commentObj};// No I18N
    sdpAjax({
      url: "/api/v3/survey_comments", //No I18N
      method: "POST", //No I18N
      data: {input_data:sdpToJSON(input_data)},
      success: function(dataArg)
      {
        surveyObject.loadComments(surveyID,1);
        jQuery(comment).parents('[data-name=commandvalidation]').find('textarea').val('');//NO I18N
        showalert("success",translate("sdp.admin.survey.comment.success"),'isAutoHide=true');//NO I18N
      }
    });
  }
  else
  {
	 showalert("failure",translate("sdp.admin.survey.alert.validcomment"),'isAutoHide=false');//NO I18N
 }
},
deleteComment : function(surveyID,commentID,el)
{
	showconfirm(true,'title='+translate("sdp.dashboard.common.confirmdelete")+',message='+translate("sdp.admin.survey.delete.option.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', showconfirmcallback,true);//NO I18N
	function showconfirmcallback(s){
		if(s){
			var a = jQuery(el);
      sdpAjax({
        url:"/api/v3/survey_comments/"+commentID,// No I18N
        type:"DELETE", //NO I18N
        success:function(res){
          jQuery(a).closest('.commentsdetail').remove();//NO I18N
				  showalert("success",translate("sdp.admin.survey.comment.delete.success"),'isAutoHide=true');//NO I18N
        }
     });
		}
	}
},
changeURLData : function(field,url)
{
  if(field=='template')
  {
    var typeid=jQuery("#surveyType").val();
    var isServiceTemplate=false;
    if(typeid=='1' || typeid=='2')
    {
    if(typeid=='2')
      {
        isServiceTemplate=true;
      }
      var data = {};
      data['list_info'] ={"search_criteria":[{"field":"is_service_template","value":isServiceTemplate,"condition":"eq","logical_operator":"AND"}]};// No I18N
      data.list_info['row_count'] = 250;
      return {"url":  "api/v3"+url, "data":data, "field":field};// No I18N
    }
  }
  if(field=='site')
  {
    var data = {};
    data['list_info'] = {"search_criteria":[{"field":"id","value":-1,"condition":"is not","logical_operator":"AND"}]};// No I18N
    data.list_info['row_count'] = 250;
    return {"url":  "api/v3"+url, "data":data, "field":field};// No I18N
  }
}

}




