$wfRuleUtil.timerAction = {
	module_config:{//Main config object which stores all module's configurations.
	    //routeName should be mentioned as key here.
		"request_timer": $wfRuleUtil.timerConfig.request //No i18n
	},
	/* Initialize all metainfo for new timer page.
	* @param model
	* @param timer_config - config object based on module.
	*/
    initMetaInfo: function(model,timer_config,controller){
        //Init timer metainfo
        var input_data = {};
        if(timer_config.has_extended_module_filter){
            input_data = {"extended_module": controller.extended_modules_data.selected_extended_module.name};//No I18N
        }
        sdpAjax({
            url: "/api/v3/"+timer_config.timer_url+"/metainfo", // No I18N
            data: sdpAjaxInputData(input_data),
            cache:false,
            async: false,
            success: function(resp) {
                model['meta'] = resp.metainfo;
            }
        });

        //Init entity metainfo for criteria
        var _self = this;
        var urlParts = model.meta.fields.initiation_criteria.href.split('?');
        var critURL = "api/v3"+urlParts[0];
        var critInputData = {};
        if(urlParts.length>1){
            critInputData = urlParts[1].split('=')[1];
        }
        sdpAjax({
            url: critURL,
            skipSUBREQUEST: true,
            cache:false,
            async:false,
            data: sdpAjaxInputData(JSON.parse(critInputData)),
            success:function(resp) {
                if(timer_config.criteria_config.modifyFieldsCallBack && typeof timer_config.criteria_config.modifyFieldsCallBack == "function"){
                    timer_config.criteria_config.modifyFieldsCallBack(resp.metainfo.fields);
                }

                var options = {//Configure all options for criteria component.
                    metainfo: resp.metainfo.fields,
                    haveNestedColumns: true,
                    innerCriteriaEnabled: true,
                    enableDragHandle: true,
                    innerCriteriaClass: "innerCriteria", //No i18n
                    cacheData: false,
                    notMandatory: true,
                    haveMultiString: true,
                    includeSubFields: timer_config.criteria_config.sub_field_list?timer_config.criteria_config.sub_field_list:[],
                    haveRepeatedValues: true,
                    havePreviousValue: false,
                    haveDependentRules: true,
                    clrSelect2Cache: true,
                    allowReadOnly:true,
                    isSortable:true,
                    maxrows: 50,
                    setNullSiteDef:true,
                    specialFormats: timer_config.criteria_config.specialFormats,
                    dollarSupport: timer_config.criteria_config.dollarSupport?timer_config.criteria_config.dollarSupport:{},
                    allowed_value: {"callback": timer_config.criteria_config.criteriaCallBack}, //No i18n
                    fieldTypeConditions: timer_config.criteria_config.fieldTypeConditions?timer_config.criteria_config.fieldTypeConditions:{},
                    defSubFields: timer_config.criteria_config.defSubFields?timer_config.criteria_config.defSubFields:[],
                    ignoreNoneFields: timer_config.criteria_config.ignoreNoneFields?timer_config.criteria_config.ignoreNoneFields:[],
                    typeOverride : timer_config.criteria_config.typeOverride?timer_config.criteria_config.typeOverride:{},
                    changeURLData: _self.criteriaURLcallback,
                    dateCustomize : {
                        "date_conditions": [ //No i18n
                            {
                                "name":"date", //No i18n
                                "display_name":translate("sdp.common.date"), //No i18n
                                "children":[ //No i18n
                                    {"id":"on", "text":translate("sdp.condition.13")}, //No i18n
                                    {"id":"not on", "text":translate("sdp.condition.not.on")}, //No i18n
                                    {"id":"before", "text":translate("sdp.condition.15")}, //No i18n
                                    {"id":"after", "text":translate("sdp.condition.14")}, //No i18n
                                    {"id":"on or before", "text":translate("sdp.condition.on.before")}, //No i18n
                                    {"id":"on or after", "text":translate("sdp.condition.on.after")}, //No i18n
                                    {"id":"is empty", "text":translate("sdp.admin.rule.addrule.condition.isempty")}, //No i18n
                                    {"id":"is not empty", "text":translate("sdp.admin.rule.addrule.condition.isnotempty")}, //No i18n
                                    {"id":"between", "text":translate("sdp.criteria.26")}, //No i18n
                                    {"id":"not between", "text":translate("common.notbetween")} //No i18n
                                ]
                            },
                            {
                                "name":"dur", //No i18n
                                "display_name":translate("admp.duration"), //No i18n
                                "children":[ //No i18n
                                    {"id":"dur.on", "text":translate("sdp.condition.13"), "type":"dateSelect"}, //No i18n
                                    {"id":"dur.not on", "text":translate("sdp.condition.not.on"), "type":"dateSelect"}, //No i18n
                                    {"id":"dur.before", "text":translate("sdp.condition.15"), "type":"dateSelect"}, //No i18n
                                    {"id":"dur.after", "text":translate("sdp.condition.14"), "type":"dateSelect"}, //No i18n
                                    {"id":"dur.on or before", "text":translate("sdp.condition.on.before"), "type":"dateSelect"}, //No i18n
                                    {"id":"dur.on or after", "text":translate("sdp.condition.on.after"), "type":"dateSelect"} //No i18n
                                ]
                            }
                        ],
                        "date_placeholders": [ //No i18n
                            {"id":"$(today)", "text":translate("sdp.common.today")}, //No i18n
                            {"id":"$(yesterday)", "text":translate("sdp.common.yesterday")}, //No i18n
                            {"id":"$(last_month)", "text":translate("sdp.common.lastmonth")}, //No i18n
                            {"id":"$(this_month)", "text":translate("sdp.common.thismonth")}, //No i18n
                            {"id":"$(last_week)", "text":translate("sdp.common.lastweek")}, //No i18n
                            {"id":"$(this_week)", "text":translate("sdp.common.thisweek")} //No i18n
                        ]
                    },
                };
				if(timer_config.module_name=="request"){
					options.metaOverride = {"maintenance": {"read_only":false,"type":"boolean"}}; //No i18n
					options.serialize= function(data,type){
						if(data.field=="maintenance"){
							if(type=="get"){
								if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
								{
									data.condition="is not"; //No i18n
									data.values=[null];
								}
								else
								{
									data.condition="is"; //No i18n
									data.values=[null];				
								}
							}
							else{
								if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
								{
									data.values=['false'];
								}
								else
								{
									data.condition="is"; //No i18n
									data.values=['true'];
								}
								
							}
							return data;
						}
						else{
							return data;
						}
					};
				}
                if(window.checkIfMSPOrSCP() && timer_config.routeName == "request_timer")
                {
                    options['includeSubFields'].push("accountcontract");
                    if(window.checkIfSCP()){
                        options['subUDFFields'] = {"account": "accountudf_fields"}; // No i18n
                    }
                }
                model['all_criteria'] = options;
            }
        });

        //Initializing Stage Date fields for select2 component.
    	model.meta.date_fields=[];//This should contain id,text pair for each date field.
    	var dateFields = model.meta.fields.stages.fields.initial_delay_configuration.fields;
        jQuery.each(dateFields,function(dateFieldKey,dateFieldObject) {
            if(!!dateFieldObject.display_name && !!dateFieldObject.type && dateFieldObject.type != "unknown") {    //NO I18N
                var select2Obj = {id:dateFieldKey,text:dateFieldObject.display_name};
                if(dateFieldObject.hasOwnProperty('fields') && jQuery.isEmptyObject(dateFieldObject.fields)){
                    return;
                }
                if(!jQuery.isEmptyObject(dateFieldObject.fields)) {
                    select2Obj.children = [];
                    select2Obj.oid = select2Obj.id;
                    delete select2Obj.id;
                    jQuery.each(dateFieldObject.fields, function(childDateFieldKey, childDateFieldObject) {
                        if(childDateFieldObject.display_name) {
                            if(childDateFieldObject.service_category_name) {
                                var serviceCategoryIndex;
                                for(var i = 0; i < select2Obj.children.length; i++) {
                                    if(select2Obj.children[i].text == childDateFieldObject.service_category_name && !select2Obj.children[i].id) {
                                        serviceCategoryIndex = i;
                                        break;
                                    }
                                }
                                if(serviceCategoryIndex) {
                                    //If a matching service cat already found, then pushing it as children under that object.
                                    select2Obj.children[serviceCategoryIndex].children.push({"id":dateFieldKey+"."+childDateFieldKey ,"text": childDateFieldObject.display_name}); //NO I18N
                                } else {
                                    //If a matching service cat not found, then creating new object without id (non clickable SC text) and pushing additional field as children under that object.
                                    select2Obj.children.push({"text": childDateFieldObject.service_category_name, children: []});    //NO I18N
                                    select2Obj.children[select2Obj.children.length-1].children.push({"id":dateFieldKey+"."+childDateFieldKey ,"text": childDateFieldObject.display_name});    //NO I18N
                                }
                            } else {
                                //Pushing additional field 
                                select2Obj.children.push({"id":dateFieldKey+"."+childDateFieldKey ,"text": childDateFieldObject.display_name});    //NO I18N
                            }
                        }
                    });
                    select2Obj.children = select2Obj.children.sort(function compare(leftObj,rightObj) {
                        if(leftObj.children && !rightObj.children) {
                            return 1;
                        }
                        if(!leftObj.children && rightObj.children) {
                            return -1;
                        }
                        return (leftObj.text > rightObj.text) ? 1 : ((rightObj.text > leftObj.text) ? -1 : 0);
                    });
                }
                model.meta.date_fields.push(select2Obj);
            }
        });
        model.meta.date_fields.sort(function compare(leftObj,rightObj) {
            if(leftObj.oid == "udf_fields") {  //NO I18N
                return 1;
            }
            if(rightObj.oid == "udf_fields") {  //NO I18N
                return -1;
            }
            return (leftObj.text > rightObj.text) ? 1 : ((rightObj.text > leftObj.text) ? -1 : 0);
        });
    },
    /* Initialize timer data for new/edit page.
    * @param model
    * @param timer_config - config object based on module.
    */
    initTimerData: function(model,timer_config,controller){
         if(model.timerID == 'new') {/*new rule pass parameters*/
            model["timer_data"] = cloneJson(timer_config.default_data);
        }
        else{
            sdpAjax({
                url: "/api/v3/"+timer_config.timer_url+"/"+model.timerID, // No I18N
                cache:false,
                async: false,
                success: function(data) {
                    var resp = data[timer_config.entity_key_singular];
                    model["timer_data"] = resp;
                    //initial_stages is used to check when a current stage is deleted. If an existing stage is deleted an alert should be thrown.
                    model['initial_stages'] = [];
                    if(!model.timer_data.stages){
                        model.timer_data.stages = [];
                    }
                    $.each(model.timer_data.stages,function(index,stage){
                        model['initial_stages'][stage.id]=stage;
                    });
                    //deleting extended_module from response when no filter is available for current module
                    if(!timer_config.has_extended_module_filter){ delete model.timer_data.extended_module;}
                }
            });
        }
        Ember.run.schedule('afterRender', this, function () { //No i18n

            for(var i=0;i<model.timer_data.stages.length;i++){
                var stage =model.timer_data.stages[i];
                var initialDelayConfig = stage.initial_delay_configuration;
                if(initialDelayConfig && initialDelayConfig.time_interval){
                    const days = getKeyForResTimeDays(initialDelayConfig.time_interval.days);
                    const hours = getKeyForResTimeHours(initialDelayConfig.time_interval.hours);
                    const minutes = getKeyForResTimeMinutes(initialDelayConfig.time_interval.minutes);
                    jQuery('div[data-action=Initial_Delay_'+stage.stage_number+'] .res-time span.selected-time').text(days+" "+hours+" "+minutes);
                }

                var repeatConfig = stage.repeat_configuration;
                if(repeatConfig && repeatConfig.time_interval){
                    const days = getKeyForResTimeDays(repeatConfig.time_interval.days);
                    const hours = getKeyForResTimeHours(repeatConfig.time_interval.hours);
                    const minutes = getKeyForResTimeMinutes(repeatConfig.time_interval.minutes);
                    jQuery('div[data-attr=RepeatEvery_'+stage.stage_number+'] .res-time span.selected-time').text(days+" "+hours+" "+minutes);
                }
            }
        });
    },
    /* Initialize templates related data to render into multi select component.
    * @param model
    * @param timer_config - config object based on module.
    */
    initTemplates : function(model,timer_config){

        if(timer_config.has_templates){
            var s_templates=Ember.A([]),i_templates=Ember.A([]),sel_templates=[];
            var template_list=[],temp_list_types=[{'name':translate('common.incident.templates')}]; //No i18n

            if(model.timer_data.associated_templates.templates){
                for(var i=0;i<model.timer_data.associated_templates.templates.length;i++){
                    sel_templates.push(model.timer_data.associated_templates.templates[i].id);
                }
            }
            var urlParts = model.meta.fields.associated_templates.fields.templates.href.split('?');
            var templatesURL = "api/v3"+urlParts[0];
            var templatesInputData = {};
            if(urlParts.length>1){
                templatesInputData = urlParts[1].split('=')[1];
            }
            jQuery.ajax({
            url: templatesURL,
                type: 'GET',//NO I18N
                data: sdpAjaxInputData(JSON.parse(templatesInputData)),
                cache:false,
                async:false,
                success:function(data){
                    $.each(data[timer_config.templates_response_key],function(index,template){
                        if(!template.inactive || (sel_templates.indexOf(template.id)!=-1)){
                            if(template.service_category) //This condition is used to remove the templates of service categories which are marked for no further usage.
                            {
                                if(template.service_category.inactive && (sel_templates.indexOf(template.id)==-1))
                                {
                                    return;
                                }
                            }
                            if(!template.service_category) {
                                    template.service_category={};
                                    template.service_category.id=-1
                                    template.service_category.name=window.translate("sdp.home.ssp.category.others");
                                }
                            if(template.is_service_template){
                                index =-1;
                                for(var i=0;i<s_templates.length;i++){
                                    if((index==-1) && s_templates[i].id==template.service_category.id){
                                        index=i;
                                    }
                                }
                                if(index==-1){
                                    s_templates.push({id:template.service_category.id,name:template.service_category.name,request_templates:[]});
                                    index=s_templates.length-1;
                                }
                                s_templates[index].request_templates.push({id:template.id,name:template.name})
                            }
                            else{
                                index =-1;
                                for(var i=0;i<i_templates.length;i++){
                                    if((index==-1) && i_templates[i].id==template.service_category.id){
                                        index=i;
                                    }
                                }
                                if(index==-1){
                                    i_templates.push({id:template.service_category.id,name:template.service_category.name,request_templates:[]});
                                    index=i_templates.length-1;
                                }
                                i_templates[index].request_templates.push({id:template.id,name:template.name})
                            }
                        }
                    });
                }
            });
            i_templates = i_templates.sort(function compare(leftObj,rightObj) {
                return (leftObj.name > rightObj.name) ? 1 : ((rightObj.name > leftObj.name) ? -1 : 0);
            });
            template_list.push(i_templates);

            if(sdp_app.IS_SERVICECATALOG_ENABLED){
                s_templates = s_templates.sort(function compare(leftObj,rightObj) {
                    return (leftObj.name > rightObj.name) ? 1 : ((rightObj.name > leftObj.name) ? -1 : 0);
                });
                template_list.push(s_templates);
                temp_list_types.push({'name':translate('common.service.templates')});
            }

            model.template_list=template_list;
            model.templates=sel_templates;
            model.temp_list_types=temp_list_types;
            model.has_templates=true;
            model.max_templates_count = model.meta.fields.associated_templates.max_templates_count?model.meta.fields.associated_templates.max_templates_count:10;//Max association templates count for displaying in tooltip.
        }
    },
    /* Method to submit timer complete form
    * @param controller - timeraction controller object.
    * addnew - indicates if save and add new button is clicked or only save button is clicked.
    */
     submitTimerForm:function(controller,addnew){
         var _self=this;
         var timerIDFromURLParam = controller.model.timerID;
         var timerData = cloneJson(controller.model.timer_data);
         if(!$('[name=timerrules]').valid()) {
             showalert('failure',translate('sdp.requests.fieldFormRules.fillAllFields'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
             if(timerData.name==undefined || timerData.name==""){
                     $(window).scrollTop(0);
             }
             return false;
         }

         if(controller.timer_config.has_templates && !controller.model.timer_data.associated_templates.for_all_templates){
             var sel_list=getSelItems($("#multiselect_SelectedTempOpt"));
             var req_templates=[];
             if(sel_list){
                 for(var tab in sel_list){
                     req_templates=$.merge(req_templates,sel_list[tab]);
                 }
             }
             if(req_templates.length<=0){

                 showalert('failure',translate('sdp.requests.fieldFormRules.selectTemplate.helper'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                 jQuery("html, body").animate({scrollTop: $("[name=timerrules]").offset().top}, 200);
                 return false;
             }
             Ember.set(timerData.associated_templates,'templates',req_templates); //No i18n
         }
         var timer_criteria=$("#timer_criteria").custom_filter("getFilterData");//NO I18N
         if(timer_criteria == null) {
             showalert('failure',translate('timer.setcriteria'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
             jQuery("html, body").animate({scrollTop: $("[data-name=timercriteria]").offset().top}, 200);
             return false;
         }
         if(timer_criteria == false) {//any criteria notfilled properly
             showalert('failure',translate('sdp.requests.fieldFormRules.fillAllFields'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
             jQuery("html, body").animate({scrollTop: $("[data-name=timercriteria]").offset().top}, 200);
             return false;
         }
         if(!this.criVallengthfn(timer_criteria)) {//for criteria option value not more than 100
             showalert('failure',translate('sdp.admin.rules.criteria.max.allowedvalues.error.msg',['100']),'isAutoHide=false,delay=4,closeOnEscKey=yes'); //No i18n
             jQuery("html, body").animate({scrollTop: $("[data-name=timercriteria]").offset().top}, 200);
             return false;
         }
         for(var i=0;i<timerData.stages.length;i++){
             var stage = timerData.stages[i];
             if(!_self.checkAndSetStageInitialDelayAndRepeat(stage) || !_self.checkStageRules(stage)){
                return false;
             }
             function deleteRuleNameDescInRules(rulesList){//Function to remove rule name and description from rule object.
                if(rulesList.length>0){
                    jQuery.each(rulesList,function(index,ruleObj) {
                        delete ruleObj.rule.name;
                        delete ruleObj.rule.description;
                     });
                 }
             }
             //Deleting rule's name and description from input JSON as it is not accepted in input_data in timer API.
             deleteRuleNameDescInRules(stage.during_rules);
             deleteRuleNameDescInRules(stage.after_rules);
         }
         delete timerData.created_time;
         delete timerData.last_updated_time;

         var json_data = {};
         json_data[controller.timer_config.entity_key_singular] = timerData;
         if(Object.keys(timer_criteria).length>0){
             timerData.initiation_criteria = timer_criteria;
         }
         var timerID = "";
         if(controller.model.timerID != 'new') {
             var type = "PUT"; //No i18n
             timerID = controller.model.timerID;
         } else {
             var type = "POST"; //No i18n
             timerID = "";
         }
         var url = "/api/v3/"+controller.timer_config.timer_url+"/"+timerID; //No i18n

         $('[data-id=timer_saveopt]').prop('disabled',true);//Disabling save buttons to restrict user from pressing save button multiple times.
         setTimeout(function() {//Timeout to wait till save button is disabled
             sdpAjax({
                 url: url,
                 type: type,
                 cache: false,
                 async: false,
                 data: sdpAjaxInputData(json_data),
                 success:function(resp) {
                     if(addnew == 'addnew') {
                         $('[data-id=timer_saveopt]').prop('disabled',false);
                         window.location.href =  "/app#/admin/timeractions/"+controller.model.routeName+"/new"; // No I18N
                         controller.send('reloadTemplateModel',controller);  //No I18N
                     } else {
                         window.location.href =  "/app#/admin/modules/"+controller.model.routeName; // No I18N
                     }
                     setTimeout(function(){
                     $(window).scrollTop(0);},500);
                     if(timerIDFromURLParam == 'new') {
                         var msg = translate('api.added.success',[translate('timer.action')]);
                     } else {
                         var msg = translate('api.updated.success',[translate('timer.action')]);
                     }
                     showalert('success',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                 }, error: function(resp) {
                     $('[data-id=timer_saveopt]').prop('disabled',false);
                    //Handling to be done
                    var respMsg = resp.responseJSON.response_status.messages[0];
                    if(respMsg.field == "stages")
                    {
                        var stagerespact = respMsg.message.response_status;
                        if(stagerespact.length == undefined) {
                            var msg = _self.timerErrorHandler(stagerespact.messages[0]);
                            showalert('failure',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                        } else {
                            for(var i=0; i<stagerespact.length; i++) {
                                if(stagerespact[i].status == "failed") {
                                    var msg = _self.timerErrorHandler(stagerespact[i].messages[0]);
                                    showalert('failure',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                                }
                            }
                        }
                    }
                    else {
                           showalert('failure',_self.timerErrorHandler(respMsg),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                    }

                 }
             });
         },10);
     },
     /* Common error handling for timer submit.
     * @param resp - response object of timer api.
     */
     timerErrorHandler:function (resp) {
         var returnkey =  (resp.message)?resp.message:translate('sdp.admin.testmail.incoming.30');
         if(resp.field && resp.message){
             if(resp.status_code == 10001 && (resp.field == "associated_templates.templates" || resp.field == "request_timer"))
             {
                returnkey = e_html(resp.message);
             }
             else
             {
                returnkey = '<rightObj>'+e_html(resp.field)+'</rightObj> '+e_html(resp.message);
             }

         }

         if(resp.status_code == 4008) {//Duplicate error - NOT_UNIQUE
              if(resp.fields.indexOf('name')>=0) {
                  var msg = translate("common.duplicate.error",[translate('sdp.common.name'),translate('sdp.common.name')]);
                  return msg;
              }
         }
       return returnkey;
     },
     /* Loops all criteria rows including children and check if selected values for picklist and multiselect are more than 100.
     * If > 100 returns false.
     * @param timer_criteria - initiation criteria JSON.
     */
     criVallengthfn: function(timer_criteria) {//for criteria option value not more than 100
         for(var i=0; i<timer_criteria.length; i++) {
             if(timer_criteria[i].children != undefined) {
                 this.criVallengthfn(timer_criteria[i].children);
             }
             if(timer_criteria[i].values != null && timer_criteria[i].values.length > 100) {
                return false;
             }
         }
         return true;
     },
     /* To return the index of given rule id in the rulesArr.
     * @Param rulesArr
     * @Param ruleID
     */
     findIndexForRules : function(rulesArr,ruleID){
        for(var index=0;index<rulesArr.length;index++){
            if(rulesArr[index].rule.id == ruleID){
                return index;
            }
        }
     },
     /* Method to validate or set stage initial delay and repeat date configruation.
     * @param stage - stage json
     * @param forValidation - when set to true, this method only validates and does not set the computed value to ember object.
     */
     checkAndSetStageInitialDelayAndRepeat: function(stage, forValidation)
     {
        function validateAndSet (configObj, stageNumber, selectorStr, errorI18nKey,forValidation){
              var element = jQuery(selectorStr+' .res-time input');
              var days = parseInt(element.eq(0).val());
              days = isNaN(days)?0:days;
              var hours = parseInt(element.eq(1).val());
              hours = isNaN(hours)?0:hours;
              var minutes = parseInt(element.eq(2).val());
              minutes = isNaN(minutes)?0:minutes;
              if((days<=0 || days>99)&& (hours<=0 || hours>23) && (minutes<=0 || minutes>59)){
                  showalert(forValidation?'warning':'failure',translate(errorI18nKey,[stageNumber]),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                  jQuery("html, body").animate({scrollTop: $('[data-attr=StageName_'+stageNumber+']').offset().top}, 200);
                  return false;
              }
              if(!forValidation){
                 Ember.set(configObj,'time_interval',{days,hours,minutes}); //No i18n
              }
              return true;
        };
        if(stage.initial_delay_configuration.type!='percentage_date_field' && stage.initial_delay_configuration.type!='date_field'){
            if(!validateAndSet(stage.initial_delay_configuration,stage.stage_number,'[data-action=Initial_Delay_'+stage.stage_number+']', 'timer.initial.delay.invalid', forValidation)){
                return false;
            }
        }
        if(stage.repeat_configuration && stage.repeat_configuration.time_interval){
            return validateAndSet(stage.repeat_configuration,stage.stage_number,'[data-attr=RepeatEvery_'+stage.stage_number+']', 'timer.repeat.invalid', forValidation); //No i18n
        }
        return true;
     },
     /* Method to check if stage's during/after rules are empty or not. If empty, error will be displayed as rules are mandatory while saving.
     * @param stage - stage json.
     * @param forValidation - If true soft warning will be displayed, else failure error will be displayed.
     */
     checkStageRules:function(stage,forValidation)
     {
        if(stage.during_rules.length==0 && stage.after_rules.length==0){
              showalert(forValidation?'warning':'failure',translate('timer.rules.not.configured',[stage.stage_number]),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
              jQuery("html, body").animate({scrollTop: $('[data-attr=StageName_'+stage.stage_number+']').offset().top}, 200);
              return false;
        }
        return true;
     },
     /**
     *  Returns a div for displaying No result image in list views.
     */
     getImageString : function(){
             var search_input_val = jQuery("#search-term").val();
             if(search_input_val){
                 var translate_key = translate("sdp.admin.translation.search.noresult",['<span class="text-link">"'+e_html(search_input_val)+'"</span>']);
                 return '<div class="tc pt30 pb30" data-id="open-screen"><span class="aspr not-found"></span><p class="form-control-static">'+translate_key+'</p></div>';
             }
             return '<div class="pos-rel tc p10">'+translate("sdp.listview.nodataavailble")+'</div>';
     },
     /* init select2. if element and default value is provided, value is set in corresponding select2.
     * @param model - timer data model
     * @param elementID - input element for date field or relative date field.
     * @param defaultValue - value to be set for the date field.
     */
     initSelect2ForDateFields(model,elementID,defalutValue){

        var selector = '[name=date_fields]'; //No i18n
        if(elementID){
            selector = '#'+elementID;
        }
        $(selector).select2({
            data:model.meta.date_fields,
            closeOnSelect : false,
            formatNoMatches: translate("common.no.match.found"), //No I18N
            multiple:false,
            allowClear: false
        });
        if(elementID && defalutValue){
            $(selector).select2('val',defalutValue);
        }
     },
     /**
     * Method to send PUT ajax call to update data and refresh list view table.
     * @param url
     * @param json_data - input data to be sent to url.
     * @param msg - success message.
     * @param tableDataObj - table component data object.
     */
      listviewCommonAjax: function(url,json_data,msg,tableDataObj) {
          var isSuccess = false;
          sdpAjax({
                url: url,
                method: 'PUT', //No i18n
                cache:false,
                async:false,
                data: sdpAjaxInputData(json_data),
                success:function(resp){
                    showalert('success',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
                    if(tableDataObj != null && tableDataObj != undefined) {
                        tableDataObj.refreshTable('refresh'); //No i18n
                    }
                    isSuccess = true;
                },
                error:function(resp){
                    var msg = translate('sdp.common.failed');
                    if(resp.responseJSON.response_status && resp.responseJSON.response_status.messages && resp.responseJSON.response_status.messages[0].message)
                    {
                        msg = e_html(resp.responseJSON.response_status.messages[0].message);
                    }
                    showalert('failure',msg,'isAutoHide=true,delay=4,closeOnEscKey=yes'); // No I18N
                    if(tableDataObj != null && tableDataObj != undefined) {
                        tableDataObj.refreshTable('refresh'); //No i18n
                    }
                }
          });
          return isSuccess;
      },
      /* Called before timer criteria field allowed values href is invoked. Can modify the url and it's input sent for allowed values.
      * @param id - field key - eg. technician.
      */
      criteriaURLcallback: function(id) {
          if(this.metainfo[id] && this.metainfo[id].href && this.metainfo[id].href.indexOf('"for"') != '-1') {
              var href = this.metainfo[id].href;
              var url = href.split('?')[0];
              var split = href.split('?input_data=')[1];
              var splObj = jQuery.parseJSON(split);
              var data = {};
                  data['for'] = splObj.for;
                  if(splObj.list_info) {
                      data['list_info'] = splObj.list_info;
                      data.list_info['row_count'] = 100;
                  }
              return {"url":  "/api/v3"+url, "data":data, "field":id}; //No i18n
          }
      },

      /* Method to update rule data to already selected timer stage rules.
      * @Param timerFormController - controller obj
      * @param updatedRuleID - rule id which is updated from popup.
      * @param updatedRuleIsEnabled - rule is_active which is updated from popup.
      * @param updatedRuleName - rule id which name updated from popup.
      * @param updatedRuleDescription - rule description which is updated from popup.
      */
      updateRuleDetailToStageRules : function(timerFormController, updatedRuleID, updatedRuleIsEnabled, updatedRuleName, updatedRuleDescription){
            $.each(timerFormController.model.timer_data.stages,function(index,stage){
               var stageRules = stage[timerFormController.selected_rule_type];
               $.each(stageRules,function(index,stageRule){
                    if(stageRule.rule.id==updatedRuleID){
                        if(updatedRuleName){
                            Ember.set(stageRule,'rule.name',updatedRuleName); //No i18n
                        }
                        if(updatedRuleDescription){
                            Ember.set(stageRule,'rule.description',updatedRuleDescription); //No i18n
                        }
                        if(updatedRuleIsEnabled !== undefined){
                            Ember.set(stageRule,'rule.is_enabled',updatedRuleIsEnabled); //No i18n
                        }
                    }
                });
            });
      },

    /*********Timer list view functions start **************/

    /**
    * Redirects to add new timer page.
    * @param e - event.
    * @param listViewController - listView controller object from modules component.
    */
    addNewTimer:function(e,listViewController){
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        var _self=this;
        $wfRuleUtil.ajaxloaderfn(false,function() {
            window.location.href='/app#/admin/timeractions/'+listViewController.routeName+'/new';//No I18N
        });
    },

    /**
    * Delete bulk timers from list view
    * @param table_component - table_component object from modules component.
    * @param listViewController - listView controller object from modules component.
    */
    deleteAction :function(table_component,listViewController){
      // Get Bulk selected id.
      var bulk_sel_ids = table_component.bulkSelect.getSelectedIDs();
      function deleteTimers(selectedOption){
          if(selectedOption){
              var input_data = null,url="/api/v3/"+$wfRuleUtil.timerAction.module_config[listViewController.routeName].timer_url;
              var timer_ids = '';
              jQuery.each(bulk_sel_ids, function(index, idStr) {
                  timer_ids = (timer_ids != '') ? timer_ids+','+idStr : idStr;
              });
              // Bulk edit ids stored in input data object.
              input_data = {"ids":timer_ids}; //No i18n
              sdpAjax({
                  url: url,
                  type: "DELETE", //No i18n
                  data: input_data,
                  async: false,
                  success: function() {
                      showalert('success', translate('sdp.admin.orgrole.messages.success.delete'),"isAutoHide=true,delay=4,closeOnEscKey=yes"); // No I18N
                  },
                  error: function(jqXHR) {
                    var msg = translate("sdp.vulnerability.error.unknownexception.msg");
                    if(resp.responseJSON.response_status && resp.responseJSON.response_status.messages && resp.responseJSON.response_status.messages[0].message)
                    {
                        msg = e_html(resp.responseJSON.response_status.messages[0].message);
                    }
                    showalert('failure',msg,"isAutoHide=true,delay=4,closeOnEscKey=yes"); // No I18N
                  }
              });
              // Refresh table component.
              table_component.refreshTable();
          }
      }
      showconfirm(true,'title='+translate("sdp.backupapprover.conformdelete")+', message='+translate("common.delete.confirm")+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',deleteTimers); //No i18n

    },
    /**
    * Enable disable custom functions from bulk edit action.
    * @selectedOption - indicates enable/disable
    * @param table_component - table_component object from modules component.
    * @param listViewController - listView controller object from modules component.
    */
    enableDisableAction : function(selectedOption,table_component,listViewController){
        this.listviewCommonAction(selectedOption,table_component,null,listViewController);
    },
    /**
    * Search list view
    * @param clearSearch - boolean to clear the search text.
    */
    searchlistView : function(clearSearch,table_component){
      var enter_key = event.keyCode || event.which;
      var _self=this;
      if(enter_key == 13 || clearSearch){
          var search_val = jQuery("#search-term").val();
          var searchArr = table_component.t_obj.table_info.list_info.search_criteria;
          searchArr = searchArr ? searchArr.filter(el => el['field'] != "name") : [];//NO I18N
          if(search_val && !clearSearch)
          {
             searchArr.push({"field": "name","condition": "contains","value":search_val,"logical_operator": "and", "children":[{"field": "description","condition": "contains","value":search_val,"logical_operator": "or"}]});
          }
          else
          {
            // when empty search is made or clear search is clicked.
            jQuery("[data-name='clearListSearch']").addClass('hide');
            jQuery("#search-term").val('');
          }
          table_component.t_obj.table_info.list_info.search_criteria = searchArr;
          table_component.t_obj.options.nodataString = $wfRuleUtil.timerAction.getImageString();
          // Refresh table component.
          table_component.refreshTable();
      }
      else
      {
        // On key up showing clear text button.
        if(jQuery("[data-name='clearListSearch']").hasClass('hide')){jQuery("[data-name='clearListSearch']").removeClass('hide')};
      }
    },

    /**
    * Group bulk select checkbox check event. To display/hide actions drop down in list view.
    * @param elm - html checkbox element
    * @param listViewController - listView controller object from modules component.
    */
    timerToggleCheckboxfn : function(elm,listViewController) {
      var tabObj = listViewController.tableObjects[listViewController.entity_name];
      var selectedIds = tabObj.bulkSelect.getSelectedIDs().length;
      var tagToShow = '#listcontrols [data-bulk=normal]'; //No i18n
      var tagToHide = '#listcontrols [data-bulk=selected]'; //No i18n
      if (selectedIds > 0) {//If some rows are selected, swapping the selector variables.
          var temp = tagToHide;
          tagToHide = tagToShow;
          tagToShow = temp;
      }
      $(tagToHide).addClass('hide');
      $(tagToShow).removeClass('hide');
    },
    /**
    * Method to handle list view row action icons click event.
    * @param table_info - table_info object
    * @param listViewController - listView controller object from modules component.
    * @param tableObjects - list view table object from modules component.
    */
    afterBodyRender : function(table_info,listViewController,tableObjects){

      var _self = this;
      //clear search value when navigating to different timer
      if(tableObjects.context.routeName != jQuery('#search-term').attr("data-route-name")){
          jQuery('#search-term').val('')
              .attr("data-route-name", tableObjects.context.routeName)
          jQuery('[data-id=clear-search]').addClass('hide');
      }
      $('#'+tableObjects.tableId+'_div').on('click','[data-id=enable_disable_action]',function(e) {//For enable disable button. Can't use clickaction as it doesn't support passing event as argument. //No i18n
          e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
          var opt = $(this).find('[name=radio_enable_head]').is(':checked');
          var confirmmsg = '';
          if (opt) {
                  confirmmsg = translate('timer.disable.alert');
          }
          else{
                  confirmmsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+translate('sdp.common.enable')+'</b>',translate('timer.action')]);
          }
          var id = $(this).attr('data-action-param');
          var _selfthis = $(this);
          function enableDisableFunction(s) {
              if(s) {
                  var isEnabled = !opt;
                  var tooltipKey = opt?'common.disabled':'common.enabled'; //No i18n
                  var enable_disable_param = opt?'disable':'enable'; //No i18n
                  _selfthis.attr('rel', 'uitip').attr('title',translate(tooltipKey)).find('[name=radio_enable_head]').prop('checked',isEnabled); //No i18n
                  $wfRuleUtil.timerAction.listviewCommonAction(enable_disable_param,tableObjects,id,listViewController);
              }
          }
          showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+confirmmsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',enableDisableFunction); //No i18n
      });

      $('#'+tableObjects.tableId+'_div').on('click','[data-id=viewTimer]',function(e) {//View timer by clicking timer name in list view.
                e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
                var timerID = $(this).attr('data-action-param');
                $wfRuleUtil.ajaxloaderfn(false,function() {
                    window.location.href='/app#/admin/timeractions/'+listViewController.routeName+'/'+timerID;//No I18N
                });
            });

        $wfRuleUtil.ajaxloaderfn(true);
    },
    /**
    * Method to handle list view menu action buttons for single and bulk operation
    * @param selectedOption - action name (enable/disable).
    * @param tableDataObj - table component DataObj
    * @param id - selected timer id.
    * @param listViewController - listViewController obj.
    */
    listviewCommonAction: function(selectedOption, tableDataObj, id, listViewController) {
      var updateJson, confirmMsg;
      var config = $wfRuleUtil.timerAction.module_config[listViewController.routeName];
      switch (selectedOption) {
          case "enable": //No i18n
              updateJson =   { "is_active": true }; //No i18n
              confirmMsg = translate('sdp.admin.rules.action.confirmmsg',['<b>'+translate('sdp.common.enable')+'</b>',translate('timer.action')]);
              break;
          case "disable": //No i18n
              updateJson =   { "is_active": false }; //No i18n
              confirmMsg = translate('timer.disable.alert');
              break;
      }
      var msg = translate('api.updated.success',[translate('timer.action')]);
      var json_data = {}; json_data[config.entity_key_singular] = updateJson;
      if(id != null && id != undefined) {//in single rules change event
          var url = '/api/v3/'+config.timer_url+'/'+id; //No i18n
          $wfRuleUtil.timerAction.listviewCommonAjax(url,json_data,msg);
      } else {//in bulk rules changes events
          var selectedTimers = [];
          $.each(tableDataObj.bulkSelect.selectedRecords, function(index, value) {selectedTimers.push(index)});
          if(selectedTimers.length != 0) {
              var url = '/api/v3/'+config.timer_url+'?ids='+selectedTimers.toString(); //No i18n
              function enableDisableFunction(s) {
                  if(s) {
                      $wfRuleUtil.timerAction.listviewCommonAjax(url,json_data,msg,tableDataObj);
                  }
              }
              showconfirm(true,'title='+translate("common.confirm.submit.msg")+', message='+confirmMsg+', submitbutton='+translate("sdp.admin.translation.proceed")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',enableDisableFunction); //No i18n
          }
      }
    },

    /**
    * Construct list view check box.
    * @param table_info - table component object.
    */
    row_construct_checkbox: function(table_info) {
      return '<span class="fl ml5 pos-rel" style="margin-top: 14px;" data-id="list_view_checkbox"><input type="checkbox" aria-label="checkbox" value="'+table_info.row_data.id+'" data-table-checkbox=""></span>';
    },
    /**
    * Construct list view edit icon for each row.
    * @param table_info - table component object.
    * @param listViewController - listViewController object.
    */
    row_construct_edit: function(table_info, listViewController) {
        return '<a rel="noopener" href="/app#/admin/timeractions/'+listViewController.routeName+'/'+table_info.row_data.id+'" role="link" aria-label="'+translate("sdp.common.edit")+'" data-id="edit_timer"> <span aria-label="Edit Timer Action" class="cspr icon-md edit-modern1 cur-ptr flat ml10" style="margin-top: 11px;" rel="uitip" title="'+translate("sdp.common.edit")+'"></span> </a>';
    },
    /**
    * Construct list view enable/disable icon for each row.
    * @param table_info - table component object.
    */
    row_construct_enable_disable: function(table_info) {
      var rd = table_info.row_data;
      var chk = (rd.is_active) ? 'checked' : ''; //No i18n
      var title = (rd.is_active) ? translate("common.enabled") : translate("common.disabled");
      return '<label id="row_'+rd.id+'" aria-label="'+title+'" data-id="enable_disable_action" data-action-param="'+rd.id+'" class="disp-iflex ml10" style="margin-top: 14px;" title="'+title+'" rel="uitip"><input type="checkbox" class="togglechk" '+chk+' name="radio_enable_head" id="bsradioYes'+rd.id+'" name="bsradio'+rd.id+'"><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span></label>';
    },
    /**
    * Construct list view name, description for each row.
    * @param table_info - table component object.
    */
    row_construct_custom_name: function(table_info) {
      var data = table_info.row_data;
      return '<div class="pl20"><a class="sb text-color6" role="link" aria-label="'+translate("sdp.common.edit")+'" data-id="viewTimer" data-action-param="'+data.id+'"href="/">' + e_html(data.name) + '</a> <p class="m0 mt5 text-muted text-overflow " data-id="desc-title" rel="uitip" mode_ellipsis="true" title="'+e_attr(data.description)+'">' + e_html(data.description) + '</p></div>';
    }
    /*********Timer list view functions end **************/
};