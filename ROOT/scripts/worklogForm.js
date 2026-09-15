/* $Id$ */
    var $worklogForm = {
        ownerAndCostPerHour: {},
        /*
            *A function used to initializ worklog form.
            *@param options - associated entity details
        */
        init: function (options) {
            var _self = this;
            _self.parent = window.top;
            _self.options = options;
            _self.url = _self.options.worklogId ? ("/api/v3/" + _self.options.url +"/"+ _self.options.worklogId) : ("/api/v3/" + _self.options.url); // No I18N
            let worklogTemplate;
            let entityData = _self.options.worklogId? _self.getEntityData(_self.url) : null;
            if(_self.options.from === "preview"){
                _self.metaInfo = $worklogList.apiCall(_self.url + "/_metainfo",sdpAjaxInputData({ "for":"template" })).metainfo;// No I18N
                _self.metaInfo.fields.owner.read_only = true;
                _self.metaInfo.fields.owner.default_value = {"id":sdp_user.LOGGEDIN_USERID, "name":sdp_user.USERNAME, "cost_per_hour": 0.00};// No I18N
                _self.metaInfo.fields.include_nonoperational_hours= {"default_value":"false"};// No I18N

                worklogTemplate = $extFrame.getActiveWindow().preview_json.worklog_template;
                entityData = worklogTemplate.base_worklog;
            }else{
                _self.metaInfo = !jQuery.isEmptyObject($worklogForm.metaInfo)?$worklogForm.metaInfo:$worklogList.apiCall(_self.url + "/_metainfo", sdpAjaxInputData({ "for":"form" })).metainfo; //NO I18N
                _self.entity_name = _self.options.module;

                const templateId = _self.options.templateId || (entityData? entityData.template.id : _self.metaInfo.fields.template.default_value.id);
                worklogTemplate = _self.getEntityData(_self.url+`/template/${templateId}`, true);
                entityData = entityData || worklogTemplate.base_worklog; // entityData can't be null else FC will set default values for udf.
            }

            renderhbs('#worklog-section', 'WorklogForm', { id: options.worklogId }, false, 'worklog');// No I18N

            _self.options.isOwnerCostAvailable = false;
            const udf_fields = _self.metaInfo.fields.udf_fields;
            worklogTemplate.layouts.forEach(layout => {
                layout.sections.forEach(section => {
                    section.fields.forEach(field => {
                        switch(field.name){
                            case 'time_spent':// No I18N
                                field.custom_render = $worklogForm.timeSpent;
                                break;
                            case 'start_time':// No I18N
                                field.onchange = $worklogForm.calculateHrsMins;
                                if(!field.mandatory){
                                    field.mandatory = $worklogForm.metaInfo.fields.start_time.mandatory;
                                }
                                field.args = {"showNow_Today": true};// NO I18N
                                break;
                            case 'end_time':// No I18N
                                field.onchange = $worklogForm.calculateHrsMins;
                                if(!field.mandatory){
                                    field.mandatory = $worklogForm.metaInfo.fields.end_time.mandatory;
                                }
                                field.allowClear = false;
                                field.args = {"showNow_Today": true};// NO I18N
                                break;
                            case 'owner':// No I18N
                                field.onchange =  $worklogForm.loadCostperhour;
                                field.processResults= $worklogForm.inputDataProcess;
                                break;
                            case 'other_cost':// No I18N
                                field.onchange=$worklogForm.calculateTotalCharge;
                                field.constraints={"min": 0}; //NO I18N
                                break;
                            case 'owner_cost':
                                _self.options.isOwnerCostAvailable = true;
                                break;
                        }
                        // set context = 'udf_fields' for udf fields in order for the Form component to render
                        if (udf_fields && udf_fields.fields.hasOwnProperty(field.name)) {
                            const fieldMeta = udf_fields.fields[field.name];
                            field.context = "udf_fields"; //No I18N
                            if(fieldMeta.type === "lookup"){
                                field.allowClear = true;
                                if(_self.options.from === "preview" && fieldMeta.lookup_entity === "attachment"){
                                    field.disabled = true;
                                }
                            }else if(fieldMeta.type === "datetime"){
                                field.args = {"showNow_Today": true};// NO I18N
                            }
                        }
                    });
                });
            });
            worklogTemplate.base_worklog.other_cost = parseFloat(worklogTemplate.base_worklog.other_cost).toFixed(2);

            _self.initTemplateList(worklogTemplate,_self.url);
            if(options.from == "reqTimer"){//No I18N
                jQuery("#wForm").on("editLoaded", function() { //No I18N
                    if(!_self.options.timerStartTime && !_self.options.timerDesc){
                        showalert('info', translate("sdp.request.view.technician.timer.autopopulating"),'isAutoHide=true,width=400');// NO I18N
                        const activeWindow = $extFrame.getActiveWindow();
                        _self.options.timerStartTime = activeWindow.$req.details.timerStartTime;
                        _self.options.timerDesc = activeWindow.$req.details.timerDesc;
                        delete activeWindow.$req.details.timerStartTime;
                        delete activeWindow.$req.details.timerDesc;
                    }

                    _self.worklogform_comp.setFieldValue("start_time", _self.options.timerStartTime);//No I18N
                    _self.worklogform_comp.setFieldValue("description",_self.options.timerDesc);//No I18N

                });
            }

            if(isMSPOrSCP)
            {
                // MSP/SCP worklog fields customizations will be added here
                $msp_worklogForm.customizeSectionsForMSP(form_fields,metaInfo);
            }

            var configJSON = {
                name              : "Worklog",// No I18N
                entity            : 'worklogs',// No I18N
                customform        : true,
                entitypath        : "/"+_self.options.url,// No I18N
                metadata          : _self.metaInfo,
                template          : worklogTemplate,
                entitydata        : entityData,
                container         : "worklog-container",// No I18N
                mode              : _self.options.worklogId ? "edit" : "new",// No I18N
                formid            : "wForm",//NO I18N
                inlineImagesEntity: _self.entity_name + "_worklog",//NO I18N
                linkedFields: [
                    {
                        fields: ["start_time", "end_time"], //NO I18N
                        denote_field: ["start_time"], //NO I18N
                        message: translate("api.validation.actualstart.actualend"), //NO I18N
                        validation: function(valueJson) {
                            if((valueJson.start_time && valueJson.end_time) && (Number(valueJson.start_time) > Number(valueJson.end_time))) {
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        fields: ["timespenthrs","timespentmins"],// No I18N
                        denote_field: ["timespentmins"],
                        message: translate("sdp.admin.ad.schedule.invalidno"), //NO I18N
                        validation: function(valueJson) {
                            if((valueJson.timespenthrs.trim() != "" && !isNumeric(valueJson.timespenthrs.trim()))
                                    || (valueJson.timespentmins.trim() != "" && !isNumeric(valueJson.timespentmins.trim()))){
                                return false;
                            }
                            return true;
                        }
                    }
                ],
                entityName: translate("sdp.requests.common.worklog"),
                afterRenderCallback : function(){
                    jQuery("#total_cost_control").parent().append('<div class="mt5">'+translate("sdp.timenetry.totalcal")+'</div>');// NO I18N

                    $worklogForm.loadCostperhour(true, _self.metaInfo, this.entitydata);

                    var checkBoxEnable = ($worklogForm.options.worklogId)? (this.entitydata.include_nonoperational_hours+"") : this.metadata.fields.include_nonoperational_hours.default_value;
                    if(checkBoxEnable.toLowerCase() === 'true') { // NO I18N
                        jQuery('#inc_nonOperationalHours_Display').prop('checked', true) // NO I18N
                    }

                    if($worklogForm.metaInfo.fields.mark_first_response || $worklogForm.metaInfo.fields.add_time_for_linked_requests){
                        var html = '<div data-style="position: sticky; z-index: 10; bottom: 49px;" class="whitebg"> <hr class="m0"> <div class="pt5 pb5">';
                        if(_self.metaInfo.fields.mark_first_response) {
                            html += '<label class="checkbox-inline disp-flex ml5" for="mark_first_response"><input type="checkbox" id="mark_first_response">'+translate("sdp.request.details.worklog.firstresponse")+'</label>';
                        }
                        if(_self.metaInfo.fields.add_time_for_linked_requests) {
                            html += '<label class="checkbox-inline disp-flex ml5" for="add_time_for_linked_requests"><input type="checkbox" id="add_time_for_linked_requests">'+translate("sdp.requests.resolution.link.addworklog")+'</label>';
                        }
                        html += '</div></div>';
                        html = jQuery(html);
                        $sdStyleConverter(html);
                        if($worklogForm.options.reqResolution){
                            setTimeout(function(){ jQuery("[data-formid='form_wForm']").append(html);}, 50);
                        }else{
                            setTimeout(function(){ jQuery("[data-formid='form_wForm']").find('[data-name="form-footer"]').before(html);}, 50);
                        }
                    }
                },
                save: {
                    entity: "worklog",// No I18N
                    url: _self.url,
                    submit: true,
                    fixtoBottom: true,
                    serializer: this.updateData,
                    successinterrupt: function(response){
                        const activeWindow = $extFrame.getActiveWindow();
                        (response.worklog.release || response.worklog.change) && activeWindow.$rc && activeWindow.$rc.refreshLeftPanelCount("worklog");//NO I18N
                        return true;
                    },
                    errorinterrupt:$taskForm.errorInterrupt,
                    onsave: function(saveData) {
                        if($worklogForm.options.module === 'request' || $worklogForm.options.grandParent === 'request') {
                            saveData.mark_first_response && delete saveData.mark_first_response;
                            $worklogForm.worklogform_comp.fields.mark_first_response && delete $worklogForm.worklogform_comp.fields.mark_first_response;
                            saveData.add_time_for_linked_requests && delete saveData.add_time_for_linked_requests;
                            $worklogForm.worklogform_comp.fields.add_time_for_linked_requests && delete $worklogForm.worklogform_comp.fields.add_time_for_linked_requests;
                            $worklogForm.addCheckBoxValuesToPayload(saveData);
                        }
                        return saveData
                    },
                    onsubmit: function(arg1, arg2, btn) {
                        var self = this;
                        if(btn) {
                           btn.target.disabled = false;
                        }
                        var hrs = Number(jQuery("#timespenthrs").val());
                        var mins = Number(jQuery("#timespentmins").val());
                        if($worklogForm.hasNoMSPContractInfo && sdp_app.ALLOW_NULL_TIME_ENTRY === 'false' && (!hrs && !mins)){
                            if(confirm(translate("sdp.common.worklog.nulltimeentry"))){
                                jQuery("#timespentmins").val("1");
                                return false;
                            } else {
                                return true;
                            }
                        }
                    },
                    postsuccess: function (response, form) {
                        /**
                         * when we load SDP inside in iframe of another third party application, 'window.top' refers to the window of thid party application, but we need window object of SDP. 'getActiveWindow' function is used for that.
                        */
                        var activeWindow = $extFrame.getActiveWindow(parent.location.href);
                        var options = $worklogForm.options;
                        if(options.from == 'detail'){
                            activeWindow.showalert("success", translate("api.updated.success", [ form.options.entityName ]), "isAutoHide=true"); //NO I18N
                            $tasks.loadWorkLog('detail',options.module,options.moduleId,options.grandParent,options.grandParentId,options.worklogId,options.projectId,'form'); //NO I18N
                        }else{
                            activeWindow.$previewComponent.closePreview("worklogs_popup");//No I18N
                        }

                        if(activeWindow.WebComponents.getInstance("webc-worklog")){
                            activeWindow.WebComponents.getInstance("webc-worklog").refreshTable();// NO I18N
                            if(isMSPOrSCP)
                            {
                                var wl_table = window.top.WebComponents.getInstance("webc-worklog").t_obj; // NO I18N
                                var total_len = wl_table && wl_table.table_info && wl_table.table_info.list_info ? wl_table.table_info.list_info.total_count : 0 ;
                                jQuery("#WL_Status_Cnt").text("("+total_len+")");
                            }
                        }
                        options.from != 'detail' && activeWindow.showalert("success", translate((form.mode === "new")? "api.added.success" : "api.updated.success", [ form.options.entityName ]), "isAutoHide=true"); //NO I18N
                        if($worklogForm.entity_name === 'request') {
                            var reqTableView = activeWindow.table_comp_request;
                            if(!reqTableView || reqTableView.context.viewMode!=="table"){
                                if(isMSPOrSCP && window.top.jQuery("#timesheet").hasClass("active"))
                                {
                                    var viewName = window.top.getPortalViewName("TimeSheetListView");//NO I18N
                                    window.top.refreshSubView(viewName);
                                }
                                else
                                {
                                    activeWindow.$req.details.getRequestInfo(activeWindow.woID);
                                    activeWindow.$req.prop.render();
                                }
                            }else{
                                reqTableView.refreshTable();
                            }
                        }
                    },
                    submitbutton:{
                        add: translate("common.save") // No I18N
                    },
                    cancel: this.cancelForm
                },
                edit: {
                    onchange: this.calculateTotalCharge,
                    fields: {
                        description: {
                            images_api: true,
                            images_url: _self.url + "/images"//NO I18N
                        },
                        time_spent: {
                            pre: this.displayTimetaken
                        },
                        lookup:{
                            input_data_Callback: this.input_data_callback
                        },
                        multi_select:{
                            input_data_Callback: this.input_data_callback
                        }
                    },
                    defaults:{
                        lookup:{}
                    },
                    serializer: this.updateData,
                    postsuccess: function(){
                        window.top.WebComponents.getInstance("webc-worklog").refreshTable();// NO I18N
                        setTimeout(function(){window.top.$previewComponent.closePreview("worklogs_popup")},1000);// No I18N
                    }
                },
                formatValues: function(search_data, field){
                    if($worklogForm.metaInfo.fields.udf_fields && $worklogForm.metaInfo.fields.udf_fields.fields[field] && $worklogForm.metaInfo.fields.udf_fields.fields[field].lookup_entity === "department"){
                        for (var i = 0; i < search_data.length; i++) {
                            if (search_data[i].site != null) {
                                search_data[i].name = search_data[i].name + ", " + search_data[i].site.name;
                            }
                        }
                    }
                }
            };

            if(configJSON.entitydata && configJSON.entitydata.description && configJSON.entitydata.image_token){
                 configJSON.entitydata.description = appendImageToken(configJSON.entitydata.description,configJSON.entitydata.image_token);
            }

            if(options.reqResolution) {
                configJSON.save.submit = false;
                configJSON.save.controller = function(resp) {
                    $worklogForm.worklogFormDetails = resp;
                }
            }

            // //Setting default value for end_time field
            if(!_self.metaInfo.fields.end_time.mandatory || options.from == "reqTimer"){
                var date = new Date().getTime();
                var dateString = getFormattedDateTime(new Date(date + getTimezoneDifference(date)), true);
                configJSON.template.base_worklog["end_time"]={"value": date,"display_value":dateString}; // No I18N
            }
            configJSON.template.base_worklog["owner"]=_self.metaInfo.fields.owner.default_value;
            configJSON.acceptODCompatible = true;

            if(isMSPOrSCP)
            {
                $msp_worklogForm.modifyConfigJSONForMSP(configJSON,metaInfo,self);
            }
            if(_self.options.from == "preview"){
                configJSON.edit.fields.description.images_api = false;
                configJSON.save.controller = function(){ return; }
            }
            this.worklogform_comp = new FC(configJSON);
            $worklogForm.hasNoMSPContractInfo = (isMSPOrSCP && $worklogForm.worklogform_comp && $worklogForm.worklogform_comp.metadata && $worklogForm.worklogform_comp.metadata.contractInfo) ? false : true ;
            if(options.reqResolution) {
                $worklogForm.requestResolutionWorklogForm = this.worklogform_comp;
            }
            $se.page_scripts.render("all_page");
        },
        initTemplateList: function (template,baseURL) {
            const select2Ele = jQuery('#worklog-section').find("#worklog_template");
            select2Ele.sdp_select2({
                url:[{
                    url:baseURL+"/template",//No I18N
                    field: 'template',//No I18N
                    list_info: { "start_index": 1, "row_count": 10 }//No I18N
                }],
                value: {text: template.name, id: template.id},
                formatNoMatches: translate('common.no.match.found')
            });
            const _self = this;
            if(_self.options.worklogId || _self.options.from == "preview"){
                select2Ele.select2("destroy").attr("disabled",true).val(template.name); //No I18N
            }else{
               select2Ele.off('change').on('change', function(e) { //NO I18N
                    _self.options.templateId = this.value;
                    _self.init(_self.options);
                });
            }

        },
        getEntityData: function (url, forTemplate, input_data) {
            var _self = this;
            var response;
            sdpAjax({
                url: url || _self.url, async: false,
                data: sdpAjaxInputData(input_data),
                success: function (data) {
                    response = data;
                }
            });
            return forTemplate? response.worklog_template : response.worklog;
        },
        /*
            *A function to load time taken to resolve field values(custom field) before saving/updating
            *@param worklog input data.
        */
        updateData: function (payload) {
            var hrs = jQuery("#timespenthrs").val();
            var mins = jQuery("#timespentmins").val();

            payload.worklog.time_spent={"hours":hrs,"minutes":mins}; // No I18N
            hrs = Number(hrs);
            mins = Number(mins);
            if($worklogForm.hasNoMSPContractInfo && sdp_app.ALLOW_NULL_TIME_ENTRY === 'false' && (!hrs && mins === 1) && (jQuery("#start_time_IN").val() !== '' && (jQuery("#end_time_IN").val() - jQuery("#start_time_IN").val() < 60000))) {
                var endTimeVal = Number(jQuery("#end_time_IN").val()) + 60000;
                jQuery("#end_time_IN").val(endTimeVal);
                payload.worklog.end_time.value = endTimeVal;
            }
            delete payload.worklog.total_cost;
            delete payload.worklog.owner_cost;
            delete payload.worklog.cost_per_hour;
            if(payload.worklog.other_cost == ""){
                payload.worklog.other_cost = 0;
            }
            $worklogForm.addCheckBoxValuesToPayload(payload.worklog);
            var udfFields = payload.worklog.udf_fields
            if(udfFields) {
                for(var udfField in udfFields) {
                    if(udfField.indexOf("pick") > -1 && udfFields[udfField] === '') {
                        udfFields[udfField] = null;
                    }
                }
            }

            if($worklogForm.worklogform_comp.mode === 'new') {
                payload.worklog.template = { id: jQuery('#worklog-section').find("#worklog_template")[0].value };
            }

            if(isMSPOrSCP)
            {
               $msp_worklogForm.modifyPayloadForMSP(payload);
            }
        },
        cancelForm: function () {
            var options = $worklogForm.options;
            if(options.from === 'detail'){
                $tasks.loadWorkLog('detail',options.module,options.moduleId,options.grandParent,options.grandParentId,options.worklogId,options.projectId,'form'); //NO I18N
                return;
            }
            var activeWindow = $extFrame.getActiveWindow(parent.location.href);
            activeWindow.$previewComponent.closePreview("worklogs_popup");// No I18N
        },
        /*
            *A function to render time taken to resolve field.
        */
        displayTimetaken: function () {
            var _self = this;
            if(this.entitydata){
                var curr_value = this.fields.time_spent.current_value;
                if (curr_value != null) {
                    jQuery("#timespenthrs").val(curr_value.hours);
                    jQuery("#timespentmins").val(curr_value.minutes);
                    jQuery('#total_timespent').val(curr_value.value);
                }
                if(this.entitydata.include_nonoperational_hours){
                    jQuery("#inc_nonOperationalHours_Display").attr("checked","checked");
                }
            }
        },
        /*
            *A function used to include operational hours in worklog form.
        */
        includeOperationalHours: function(start,end){
            var _self = $worklogForm;
            var timespent= 0;
            if(jQuery("#inc_nonOperationalHours_Display").is(":checked")){
                timespent = end-start;
            }
            else{
                var input_data = {
                    "worklog": { // No I18N
                        "start_time": { "value": start }, // No I18N
                        "end_time": { "value": end } // No I18N
                    }
                };
                 timespent = $worklogList.apiCall("/api/v3/"+_self.options.url + "/_get_time_spent", sdpAjaxInputData(input_data)); // No I18N
            }
            return timespent;
        },
        /*
            *A function used to calculate hours and minutes in worklog form.
        */
        calculateHrsMins: function (isFromFormLoad) {
            var _self = $worklogForm;
            var hrs=jQuery("#timespenthrs").val(), mins=jQuery("#timespentmins").val();
            var start = jQuery("#start_time_IN").val();
            var end = jQuery("#end_time_IN").val();
            if ((start != "" && !isNaN(start)) && (end != "" && !isNaN(end))) {
                if(end < start){
                    $worklogForm.worklogform_comp.validateLinkedFields($worklogForm.worklogform_comp.options.linkedFields);
                    return
                } else {
                    var errorEle = jQuery(":input[name=start_time]").next()
                    if(errorEle && errorEle.hasClass("text-danger")) {
                       errorEle.remove()
                    }
                }
                var timespent = _self.includeOperationalHours(start,end);
                if(typeof timespent === 'object'){
                    hrs = parseInt(timespent.worklog.time_spent.hours);
                    mins = parseInt(timespent.worklog.time_spent.minutes);
                }

                if (jQuery("#inc_nonOperationalHours_Display").is(":checked")) {
                    hrs = parseInt(timespent/(1000*60*60));
                    mins =  parseInt(parseInt(timespent/(1000*60))%60);
                    _self.setValues(hrs, mins);
                }
                else {
                    _self.setValues(hrs, mins);
                }

                var proceedNullTimeCheck = (isMSPOrSCP && (!$worklogForm.hasNoMSPContractInfo || isFromFormLoad == true) ) ? false : true ;

                if(((timespent < 60000) || (hrs==0 && mins==0)) && proceedNullTimeCheck && sdp_app.ALLOW_NULL_TIME_ENTRY === 'false'){
                    if(confirm(translate("sdp.common.worklog.nulltimeentry"))){
                        mins = 1;
                        var endTime = Number(jQuery("#end_time_IN").val()) + Number(60000);
                        jQuery("#end_time_IN").val(""+endTime);
                        _self.worklogform_comp.fields.end_time.current_value.value = "" + endTime;
                        _self.setValues(hrs, mins);
                        $worklogForm.worklogform_comp.submit("form_wForm"); //No I18N
                    }
                }
                _self.setHrsandMins();
            }
        },
        /* */
        setValues: function(hrs, mins){
            jQuery("#timespenthrs").val(hrs);
            jQuery("#timespentmins").val(mins);
        },
        /*
            *A function used to set hours and minutes in worklog form.
        */
        setHrsandMins: function(){
            var form = jQuery("#worklog-container").find("[data-id='form-fixed-wrapper']");
            var formId = form.attr("data-formid");
            var hrs = jQuery("#timespenthrs").val();
            var mins = jQuery("#timespentmins").val();

            var hrsInvalid = hrs.trim() != "" && !isNumeric(hrs.trim());
            var minsInvalid = mins.trim() != "" && !isNumeric(mins.trim())

            var ele = form.find(":input[name='timespentmins']");
            if(jQuery(ele).next().hasClass("text-danger")) {
                jQuery(ele).next().remove();
            }

            if(hrsInvalid || minsInvalid) {
                jQuery(
                    "<span for='timespentmins' generated='true'" +	//No I18N
                    "class='disp-b text-danger " + formId + "-jv-error alert-danger p3 pl10 pr10 font-xsmall'" +	//No I18N
                    " style='position: absolute; top:" + jQuery(ele).outerHeight() + "px; width: auto; left: auto;" +	//No I18N
                    " white-space: nowrap; right: 0px; z-index: 2 !important;'>" +	//No I18N
                    translate("sdp.admin.ad.schedule.invalidno") +	//No I18N
                    "</span>"	//No I18N
                ).insertAfter(ele);
                return;
            }

            var fc = FC_Mapper[formId];
            fc.fields.values.time_spent='{"hours":'+hrs+',"minutes":'+mins+'}'// No I18N
            fc.fields.changed.push("time_spent");

            if(isMSPOrSCP && fc.metadata.contractInfo && fc.metadata.contractInfo.contract_type == "Hour Based")
            {
                $msp_worklogForm.calcAndSetBhours();
            }

            $worklogForm.calculateTechCharge();
        },

        /*
            *A function used to calculate Total cost in worklog form.
        */
        calculateTotalCharge: function () {
            var parentElement = jQuery("#worklog-container");
            var other_cost = parentElement.find("[name=other_cost]").val();
            var tech_charge = parentElement.find("[name=owner_cost]").val();
                other_cost = (other_cost!="" && !isNaN(other_cost)) ? other_cost : 0;
                tech_charge = (tech_charge!="" && !isNaN(tech_charge)) ? tech_charge : 0;
            var value = Number(other_cost) + Number(tech_charge);
            parentElement.find("[name=total_cost]").val(value.toFixed(2));
        },
        /*
            *A function used to calculate Owner cost in worklog form.
        */
        calculateTechCharge: function(){
            if($worklogForm.options.isOwnerCostAvailable){
                var parentElement = jQuery("#worklog-container");
                var hrs = parentElement.find("#timespenthrs").val();
                var mins = parentElement.find("#timespentmins").val();
                var cost_per_hour = $worklogForm.options.costPerHour;
                var tech_charge = 0;
                if(cost_per_hour && !isNaN(cost_per_hour)){
                    if(hrs!="" && !isNaN(hrs)){
                        tech_charge = parseFloat(cost_per_hour)*parseInt(hrs);
                    }
                    if(mins!="" && !isNaN(mins)){
                        tech_charge += (parseFloat(cost_per_hour)*(parseInt(mins)/60));
                    }
                }
                parentElement.find("[name=owner_cost]").val(tech_charge.toFixed(2));
                $worklogForm.calculateTotalCharge();
            }
        },
        /*
            *A function used to set cost per hour for the selected owner in worklog form.
            *@param onFormLoad - true
        */
        loadCostperhour:function(onFormLoad, metaInfo, entityData){
            if($worklogForm.options.isOwnerCostAvailable){
                var parentElement = jQuery("#worklog-container");
            var costPerHour;
                if(onFormLoad === true) {
                    costPerHour = entityData.owner? entityData.owner.cost_per_hour : metaInfo.fields.owner.default_value ? metaInfo.fields.owner.default_value.cost_per_hour : 0.00;
                    parentElement.find("#owner_cost_control").parent().append('<div class="mt5" id="owner_cost_cal">'+translate("sdp.requests.requestcost.addnewtechcostnotes", [parseFloat(costPerHour).toFixed(2)])+'</div>');// NO I18N
                }
                else {
                    costPerHour = $worklogForm.ownerAndCostPerHour[parentElement.find("[name=owner]").val()] || 0.00;
                    parentElement.find("#owner_cost_cal").html(translate("sdp.requests.requestcost.addnewtechcostnotes", [parseFloat(costPerHour).toFixed(2)]));// NO I18N
                }
                $worklogForm.options.costPerHour = costPerHour;
                $worklogForm.calculateTechCharge();
            }
        },
        inputDataProcess: function (searchData, data) {
            data.text = data.name;
            searchData.push(data);
            if(data.cost_per_hour) {
                $worklogForm.ownerAndCostPerHour[data.id] = data.cost_per_hour;
            }
        },
        /*
            *A function used to load time taken field in worklog form.
        */
        timeSpent: function(tabIndex) {
            var html = '<div class="form-inline input-time-inline"><div class="disp-c pr2"><div class="input-group addon-nofill">'+
            '<label class="sr-only"></label><input id="timespenthrs" data-event="change" data-handler="$worklogForm.setHrsandMins()" nonce='+sdpNonce+' tabindex='+tabIndex+' name="timespenthrs"'+//No I18N
            'type="text" class="form-control p0 pl5 w-40px"><span class="input-group-addon maxw-70px text-overflow">'+translate("sdp.projects.daydiff.hour")+'</span></div></div><div class="disp-c pr2"><div class="input-group addon-nofill">'+//No I18N
            '<label class="sr-only">'+translate("sdp.common.mins")+'</label><input id="timespentmins" data-event="change" data-handler="$worklogForm.setHrsandMins()" nonce='+sdpNonce+' tabindex='+tabIndex+' name="timespentmins" type="text"'+//No I18N
            'class="form-control  p0 pl5 w-40px"><span class="input-group-addon maxw-70px text-overflow">'+translate("sdp.projects.daydiff.minute")+'</span></div></div></div>'+
            '<div class="pt10"><input type="hidden" id="inc_nonOperationalHours" name="inc_nonOperationalHours" value="" elementtype="checkbox"><input type="checkbox" tabindex='+tabIndex+' id="inc_nonOperationalHours_Display" data-style="position:relative;top:2px;" data-event="change" data-handler="$worklogForm.calculateHrsMins()" nonce='+sdpNonce+'>'+
            '<label for="inc_nonOperationalHours_Display">' + translate("sdp.request.details.worklog.includenonoperatinalhours") + // No I18N
            '</label></div>'
            return html;
        },
        /*
            A function to save worklog under Request Resolution tab
        */
        saveWorklog: function() {
            if(!$worklogForm.requestResolutionWorklogForm) {
                return
            }
            $worklogForm.requestResolutionWorklogForm.submit($worklogForm.requestResolutionWorklogForm.form)
            var input_data = $worklogForm.worklogFormDetails
            if(!input_data) { return; }
            delete $worklogForm.worklogFormDetails;
            delete input_data.worklog.images;
            delete input_data.worklog.cost_per_hour
            delete input_data.worklog.total_cost
            delete input_data.worklog.owner_cost
            var hrs = jQuery("#timespenthrs").val();
            var mins = jQuery("#timespentmins").val();
            input_data.worklog.time_spent={"hours":hrs,"minutes":mins}; // No I18N
            input_data.worklog.template = { id: jQuery('#worklog-section').find("#worklog_template")[0].value };
            if(isMSPOrSCP && !$worklogForm.hasNoMSPContractInfo && $worklogForm.worklogform_comp.metadata.contractInfo.contract_type == "Hour Based")
            {
                delete input_data.worklog.time_spent;
            }
            $worklogForm.addCheckBoxValuesToPayload(input_data.worklog);
            hrs = Number(hrs);
            mins = Number(mins);


            if($worklogForm.hasNoMSPContractInfo && sdp_app.ALLOW_NULL_TIME_ENTRY === 'false' && (!hrs && mins === 1) && (jQuery("#start_time_IN").val() !== '' && (jQuery("#end_time_IN").val() - jQuery("#start_time_IN").val() < 60000))) {
                var endTimeVal = Number(jQuery("#end_time_IN").val()) + 60000;
                jQuery("#end_time_IN").val(endTimeVal);
                input_data.worklog.end_time.value = endTimeVal;
            }

            if(isMSPOrSCP)
            {
                if(input_data.worklog.accountcontract)
                {
                    delete input_data.worklog.accountcontract.name;
                }

                if(!$worklogForm.hasNoMSPContractInfo && $worklogForm.worklogform_comp.metadata.contractInfo.contract_type == "Hour Based" && ($worklogForm.worklogform_comp.fields.values.is_billable == 'true' || $worklogForm.worklogform_comp.fields.values.is_billable == true))
                {
                    delete input_data.worklog.time_spent;
                }

                $msp_worklogForm.addBillingDetailsHoursToPayload(input_data.worklog);
                $msp_worklogForm.addAdditionalCostData(input_data.worklog);
            }

            var isWorkLogSaveSuccess;
            if(document.addResolutionForm.timeSpent.checked) {
                sdpAjax({
                    url: '/api/v3/requests/'+$req.details.request_info.id+'/worklogs', //No I18N
                    async:false,
                    type: 'POST', //No I18N
                    acceptODCompatible: true,
                    data: sdpAjaxInputData(input_data),
                    complete: function(resp) {
                        var status = resp.responseJSON.response_status.status
                        if(status === 'failed') {
                            showalert('failure', resp.responseJSON.response_status.messages[0].message, "isAutoHide=false"); // No I18N
                        } else if(status === 'success') { // No I18N
                            isWorkLogSaveSuccess = true

                        }
                    }
                });
                if(isWorkLogSaveSuccess) {
                    $worklogForm.requestResolutionWorklogForm.destroy();
                    /** unchecking the Add Worklog option, as it is already saved. */
                    if(jQuery("[name='timeSpent']").is(":checked")) {
                        jQuery("[name='timeSpent']").trigger("click");
                    }
                    /** adding "Saved" message next to "Add Worklog" checkbox to indicate that Worklog has been already added. */
                    if(jQuery("#worklog-saved-msg").length === 0) {
                        var saved_html = '<span id="worklog-saved-msg" data-style="margin-left: 20px;padding: 2px 5px;color: #378d41;border-radius: 15px;"><span class="cspr success icon-sm mr5"></span><span>' + translate('sdp.admin.servicecatalog.saved') + '</span></span>'; //No I18N
                        saved_html = jQuery(saved_html);
                        $sdStyleConverter(saved_html);
                        jQuery("[name='timeSpent']").parent().append(saved_html);
                    }
                }
            }
            return isWorkLogSaveSuccess
        },
        /*
            A function to load the worklog form in Request Resolution page.
        */
        showHideWorklog: function() {
            if(jQuery("#timeSpentId").is(":checked")) {
                $tasks.loadWorkLog('form', 'request', woID, null, null, null, null, 'reqResolution'); //NO I18N
            } else {
                document.getElementById('worklogsDiv').innerHTML = ''
            }
        },
        addCheckBoxValuesToPayload: function(payLoad) {
            jQuery.each(['inc_nonOperationalHours_Display', 'mark_first_response', 'add_time_for_linked_requests'], function(idx, val) { //NO I18N
                if(jQuery('#' + val).is(":checked")) {
                    if(val === 'inc_nonOperationalHours_Display') {
                        if($worklogForm.worklogform_comp.mode === 'new' || !($worklogForm.worklogform_comp.entitydata.include_nonoperational_hours)) {
                            payLoad.include_nonoperational_hours = true;
                        }
                    } else {
                        payLoad[val] = true;
                    }
                } else if((val === 'inc_nonOperationalHours_Display' && $worklogForm.worklogform_comp.mode === 'edit' && $worklogForm.worklogform_comp.entitydata.include_nonoperational_hours) || (val === 'inc_nonOperationalHours_Display' && $worklogForm.worklogform_comp.mode === 'new')) { //NO I18N
                    payLoad.include_nonoperational_hours = false;
                }
            });
        },
        input_data_callback: function(url_options, input_data){
            if(url_options.field && url_options.field !== "type"){
                input_data.list_info.fields_required = ["id","name"];// No I18N

                if(url_options.field === "owner"){
                    input_data.list_info.fields_required.push("cost_per_hour");
                }else if(!jQuery.isEmptyObject($worklogForm.metaInfo.fields.udf_fields.fields) && $worklogForm.metaInfo.fields.udf_fields.fields[url_options.field].lookup_entity === "department"){// No I18N
                    input_data.list_info.fields_required.push("site");
                }
            }
            return input_data;
        }
    }   
