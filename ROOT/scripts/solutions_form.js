/* $Id$ */
$sol.form = {
    /*Initialize new/edit form */
    initialize: function(options) {
        jQuery("body").removeClass("of-h");
        var _self = this;
        _self.setProp(options);
        _self.fromPage = $SolObj.fromPage;
       
        _self.entitydata = null
        var templateSol = null;
        if(_self.editId && _self.editId!="null"){
            _self.entitydata = _self.getEntityAll(_self.entityNamePl,_self.editId,_self.entityName)[0];
            _self.entityRefData = jQuery.extend(true, {}, _self.entitydata);
        }
         if(sdp_user.ROLES.indexOf("SolutionsApprove") > -1){
           _self.selfApprove=$SolObj.checkSelfApprovePermission();
         }
        _self.loadTemplate(_self.entitydata ? null : null,_self.editId,templateSol,_self.entitydata,null);
        //This object helps to find from which page, form is invoked
        $SolObj.fromPage = "";
        _self.approvedStatus=_self.getApprovedStatus();
    },
    /*Set properties while initialize*/
    setProp:function(options){
        var self = this;
        self.editId = options.id && options.id!="null" ? options.id : null;//NO I18N
        self.entityName = options.module;
        self.entityNamePl = self.entityName +"s";    //No I18N
        self.base_url = self.editId ? self.entityNamePl +"/"+ self.editId :  self.entityNamePl;   //NO I18N
        self.metainfo = self.getEntityAll(self.base_url+'/metainfo',null,'metainfo')[0];//NO I18N
        self.display_name = translate('common.newsolution'); // No I18N
        self.associateType=options.associateType;
        self.associateID=options.associateID;
        $SolObj.entityName = options.module;
        if(options.from){
            self.from = options.from;
        }
    },
    /*Load template*/
    loadTemplate:function(templateId, editId, templateRel, entityData, forcesave){
        try{
            var self=this, parentElement = jQuery('#sol-container');
            var templateSol;
            if(self.editId && entityData){
                self.metainfo = self.getEntityAll(self.base_url+'/metainfo',null,'metainfo')[0];//NO I18N
            }
            var formHeaderData = {};
            formHeaderData.editId = editId;
            formHeaderData.module = self.entityName;
            formHeaderData.from = self.from;
            formHeaderData.$SolObj = $SolObj;
            if(!externalframe){
                renderhbs("#sol-header", "sol_form_header_template", formHeaderData, false, "solutions");   //No I18N
            }
            //Remove created while opening new page
            if(!self.editId){
                delete self.metainfo.fields.created_time;
            }

            
            //var inputData =  {"list_info": {"fields_required": ["id", "name", "field_type"]},"module": {"name": self.entityName}};//NO I18N
            templateSol = $sol.constructTemplateInfo();
            if(sdp_user.CLIENT_CONF.solutions_currentview){
                if(sdp_user.CLIENT_CONF.solutions_currentview.topicID){
                    templateSol[self.entityName].topic={"name":  sdp_user.CLIENT_CONF.solutions_currentview.topicNAME};
                }
            }
            self.getEditData = entityData ? Object.assign({},entityData) : Object.assign({},templateSol[self.entityName]);
            var getEditRoles = self.getEditData.roles;
            if(getEditRoles && getEditRoles.length>0){
                var roleArrTemp = [];
                for(var i=0;i<getEditRoles.length;i++){
                    var temp = getEditRoles[i], obj = {};
                    obj["role"] = {id:temp.role.id};
                    obj["user"] = {id:temp.user.id};
                    temp.id ? obj["id"] = temp.id : null;
                    roleArrTemp.push(obj);
                }
                self.getEditData.roles =  roleArrTemp;
            }
            
            var configJSON = {
                name: "solForm",// No I18N
                entity: self.entityName,
                entitypath: "/"+self.entityNamePl,// No I18N 
                template: templateSol,
                metadata: jQuery.extend(true, {}, self.metainfo),
                // skipEditFields: skipEditFields,
                entitydata: entityData || templateSol[self.entityName],
                mode: self.editId ? "edit" : "new",// No I18N
                container: "sol-container",// No I18N
                formid: "solForm",// No I18N
                inlineImagesEntity: self.entityName,
                // fetching the user groups
                user_groups :self.fetchUserGroup(),
                customform: true,
                edit: {
                    fields: {
                        description:{
                            images_api:true,
                            uploadVideo : true,
                            images_url: "/api/v3/"+self.base_url+"/images", //NO I18N
                            enableNativeTrim : true  //SD-118354
                        },
                        status:{
                            allowClear: false
                        },
                        topic: {
                            processRemoteData: function(data, _self){  //This method is used to construct a hierarchical tree data for form component
                                var cache = _self.settings.cache;
                                var field = _self.field;
                                if (typeof _self.url_options.processResults == "undefined") {
                                  _self.url_options.processResults = _self.settings.processResults;
                                }
                                if (typeof cache[field] == "undefined") {
                                  cache[field] = {};
                                  cache[field][field] = [];
                                  cache[field].has_more_rows = true;
                                }
                                if (data.list_info) {
                                  cache[field].has_more_rows = data.list_info.has_more_rows;
                                  cache[field].start_index = parseInt(data.list_info.start_index || 1) + parseInt(data.list_info.row_count);
                                }else {
                                  cache[field].has_more_rows = false;
                                }
                                var _topics = [];
                                for (var i = 0; i < data.topic.length; i++) {
                                    var tp = data.topic[i];
                                    var tpObj = {
                                        id: tp.id,
                                        text: tp.name,
                                        parent_id: tp.parent != null ? tp.parent.id : 0,
                                        isdeleted: tp.isdeleted
                                    };

                                        _topics.push(tpObj);


                                }

                                $sol.constructListToTree(_topics);
                                
                                for (var i = 0; i < _topics.length; i++) {
                                    _self.url_options.processResults(cache[field][field], _topics[i], field, _self, _topics);
                                }
                                return data.topic = _topics;
                            },
                            processResults: function(search_data, data){
                                if(data){
                                    search_data.push(data);
                                }
                            },
                            dropdownCssClass:'s2-hover-ui1' //No I18N
                        },
                        //To fetch a user group data here
                        user_group_mapping: {
                            pre: function(field){
                                var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "id"}}; //No I18N
                                sdpAjax({
                                    url: "/api/v3/solutions/user_group_mapping", //No I18N
                                    async:false,
                                    cache:false,
                                    data:sdpAjaxInputData(input_data),
                                    success:function(data){
                                        field.allowedValues = data['user_group_mapping'];
                                    }
                                });
                            }
                        },
                        //To fetch a owners data here
                        owner: {
                          //SD-113439-fetching all the owners using lazy loading
                            processRemoteData: function(data, _self){
                                var cache = _self.settings.cache;
                                var field = _self.field;
                                if (typeof _self.url_options.processResults == "undefined") {
                                  _self.url_options.processResults = _self.settings.processResults;
                                }
                                if (typeof cache[field] == "undefined") {
                                  cache[field] = {};
                                  cache[field][field] = [];
                                  cache[field].has_more_rows = true;
                                }
                                if (data.list_info) {
                                  cache[field].has_more_rows = data.list_info.has_more_rows;
                                  cache[field].start_index = parseInt(data.list_info.start_index || 1) + parseInt(data.list_info.row_count);
                                }else {
                                  cache[field].has_more_rows = false;
                                }
                                var _owner = data.owner;
                                for (var i = 0; i < _owner.length; i++) {
                                    _self.url_options.processResults(cache[field][field], _owner[i], field, _self, _owner);
                                }
                                return data.owner = _owner;
                            },
                            processResults: function(search_data, data){
                                if(data){
                                    search_data.push(data);
                                }
                            },
                           selection_handler : "$sol.form.showBulkSelect" //No I18N
                        },
                        keywords: {
                            pre: function(field) {
                                field.helpText = translate("sdp.solutions.newsolution.keyword.comment");
                                field.container.find(".spot-field").append('<p class="text-muted mt10 lineh18" data-i18n-key="sdp.solutions.newsolution.keyword.comment">'+field.helpText+'</p>');
                            }
                        }
                    },
                    defaults: {
                        lookup:{
                             placeholder:translate('sdp.change.sla.select')
                        }
                    },
                },
                //To initialize the from page save, save and approve, cancel buttons here
                save: {
                    url: self.editId ? "/api/v3/"+self.entityNamePl+"/"+self.editId+"" : "/api/v3/"+self.entityNamePl,//NO I18N
                    entity: self.entityName,
                    submit: true,
                    forcesave: forcesave,
                    onsave: "$sol.form.modifySaveData",//NO I18N
                    serializer: "$sol.form.executeWhileSave",//NO I18N
                    cancel: "$sol.form.cancelForm",//No I18N
                    success: "$sol.form.postDataAdded",//No I18N
                    submitbutton: {
                        add: window.translate("sdp.common.save"), //No I18N
                    }
                },
                afterRenderCallback: "$sol.form.afterrenderpage" //No I18N
            }
            //SaveAndApprove button is restricted for the author of solution when no self Approve permission
            if(sdp_user.ROLES.includes("SolutionsApprove") && (($sol.form.selfApprove && $sol.form.selfApprove.length>0) || ($sol.form.selfApprove && $sol.form.selfApprove.length==0 && self.entitydata!=null && self.entitydata.created_by.id!=sdp_user.LOGGEDIN_USERID) )){
                configJSON.save.custom = [{
                    type: "default",   //No I18N
                    name: window.translate("sdp.solution.editsolution.saveandapprove"),
                    action: "$sol.form.customBtnAction"   //No I18N
                }]
            }
            if(isMSP){
                $mspSolutionsForm.modifyConfigJSONForMSP(configJSON,self);
            }
            
            $sol.form.solform  = new FC(configJSON);
            if(editId && this.entitydata.has_user_group && $sol.form.solform){
                $sol.form.solform.addMandatoryField("user_group_mapping", "manual", undefined); //No I18N
            }
            if(editId){
                //To append image token while rendering solution content during edit
                $sol.form.solform.fields.description.value = appendImageToken($sol.form.solform.fields.description.value, self.getEditData.image_token);
                jQuery("#browserTitleInfo").find("#bt_id").text(entityData.id).end().find("#bt_title").text(entityData.title);// No I18N
            }
            applyBrowserTitle();
            self.isCustomFieldsChanged = false;
        }catch(e){
            console.error(e);
        }
    },

    //Custom button actions
    customBtnAction: function(form,formalias,index,ev){
        $sol.form.solform.submit(formalias, ev, index);
    },

    //This function is used to problem association
    postDataAdded: function(data, form){
        var self = this;
        self.parent=window.top;
        if(data && data.response_status && (data.response_status.status === "success" || data.response_status.status === "warning" || (jQuery.isArray(data.response_status) && data.response_status[0].status === "success"))) {
            form.entitydata = data[self.entityName];
            if(form.mode === "new") {
                if(self.associateType){
                    self.associateTo(data[self.entityName].id,self.associateID,self.associateType);
                }
                else{
                    //Success for solution add page
                    window.showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
                    $SolObj.redirectTo(self.entityName, "detail", data[self.entityName].id);//No I18N
                }
            } else {
                window.showalert("success", translate("api.updated.success", [self.display_name]), "isAutoHide=true");   //No I18N
                //Update message for both solution and problem association edit page
                if($SolObj.externalframe == "true"){
                    setTimeout(function() {
                        self.parent.$previewComponent.closePreview('prob_sol_work');    //No I18N
                        self.parent.$problemDetails.refreshActionsDropDown(true);
                        self.parent.$problemDetails.gotoActiveTab("solution");// No I18N
                    }, 1000);
                }else{
                    $SolObj.redirectTo(self.entityName, "detail", data[self.entityName].id);//No I18N
                }
            }
        }
    },

    //This function is used to problem association
    associateTo:function(entityId,associateID,associateType){       
        var self = this;
        self.parent=window.top;
        //For request resolution
        if(associateType=="Resolution"){
            req_rsln.slnToReqAss("solution_to_request",associateID,entityId);  //NO I18N
            window.showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
            window.location.href = "/WorkOrder.do?woMode=viewWO&woID="+associateID+"#resolution";
        }
        //For problem workaround
        else if(associateType=="PROBLEM_WORKAROUND"){
            var data = {"problem": {"workaround": entityId }}; // No I18N
            var inputData = sdpAjaxInputData(data);
            var timeout = 1000;
			sdpAjax({
				url: "/api/v3/problems/"+associateID ,   //NO I18N
                type: "PUT", //No I18N
                data: inputData,
                async: false,
                ignorefailuremessage: true,
                success: function(resp){
                    //Success message for problem workaround
					window.showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
                },
                error: function(resp){
                    response = resp.responseJSON;
                    msg = response.response_status.messages[0].message;
                    if(response.response_status.messages && response.response_status.messages[0].status_code == 4001)
                    {
                        sln = translate("sdp.problem.workaround");
                        msg = translate("sdp.problem.solution.association.error",[sln,sln]);
                    }
                    else
                    {
                        // Use the formatError method from problem_common to get field-specific error messages
                        if (self.parent && self.parent.$problemDetails && self.parent.$problemDetails.formatError) {
                            msg = self.parent.$problemDetails.formatError(response.response_status.messages[0], self.parent.$problemDetails.metainfo);
                        }
                    }
                    self.parent.showalert('failure', msg, "isAutoHide=false"); //No I18N
                    timeout = 0;
                }
            });
            if($SolObj.externalframe == "true"){
            setTimeout(function () {
                self.parent.$previewComponent.closePreview('prob_sol_work'); //No I18N
                self.parent.$problemDetails.refreshActionsDropDown(true);
                self.parent.$problemDetails.gotoActiveTab("solution");// No I18N
            }, timeout);
            }else{
                $SolObj.redirectTo(self.entityName, "detail", entityId);//No I18N
            }
        }
        //for problem resolution
        else if(associateType=="PROBLEM_RESOLUTION"){
            var data = {"problem": {"resolution": entityId }}; // No I18N
            var inputData = sdpAjaxInputData(data);
            var timeout = 1000;
			sdpAjax({
				url: "/api/v3/problems/"+associateID ,  //NO I18N
                type: "PUT", //No I18N
                data: inputData,
                async: false,
                ignorefailuremessage: true,
                success: function(resp){
                    //Success message for problem resolution
					window.showalert("success", translate("api.added.success", [self.display_name]), "isAutoHide=true"); //No I18N
                },
                error: function(resp){
                    response = resp.responseJSON;
                    msg = response.response_status.messages[0].message;
                    if(response.response_status.messages && response.response_status.messages[0].status_code == 4001)
                    {
                        sln = translate("sdp.problem.resolution");
                        msg = translate("sdp.problem.solution.association.error",[sln,sln]);
                    }
                    else
                    {
                        // Use the formatError method from problem_common to get field-specific error messages
                        if (self.parent && self.parent.$problemDetails && self.parent.$problemDetails.formatError) {
                            msg = self.parent.$problemDetails.formatError(response.response_status.messages[0], self.parent.$problemDetails.metainfo);
                        }
                    }
                    self.parent.showalert('failure', msg, "isAutoHide=false"); //No I18N
                    timeout = 0;
                }
            });
            if($SolObj.externalframe == "true"){
            setTimeout(function () {
                self.parent.$previewComponent.closePreview('prob_sol_work'); //No I18N
                self.parent.$problemDetails.refreshActionsDropDown(true);
                self.parent.$problemDetails.gotoActiveTab("solution");// No I18N
            }, timeout);
            }else{
                $SolObj.redirectTo(self.entityName, "detail", entityId);//No I18N
            }
        }
    },
    /**
     * Append the fields value outside form, eg, review date, expiry date, is_public field in form
     */
    modifySaveData: function(saveData){
        //TODO handle the custom field changes if its changed or not when edit form

        if($sol.form.associateType!=null)
        {
            var obj = { solution_association:{"associate_id":$sol.form.associateID, "module":$sol.form.associateType } };//NO I18N
            saveData = Object.assign(saveData ,obj)
        }

        var reviewDate = jQuery("#reviewdate").val();
        var expirydate = jQuery("#expirydate").val();
        if(reviewDate > 0){
            saveData.review_date = {"value":reviewDate}; //No I18N
        }
        if(expirydate > 0){
            saveData.expiry_date = {"value": expirydate}; //No I18N
        }
        if(reviewDate == -1){
            saveData.review_date = null;
        }
        if(expirydate == -1){
            saveData.expiry_date = null;
        }
        //Solution from is public part
        var isPublic = jQuery("#sol_is_public").is(":checked"); //No I18N
        if($sol.form.solform.options && $sol.form.solform.options.user_groups.length > 0){
            if(isPublic){
                saveData.is_public = true;
                var userType  = jQuery("input[name='user-group']:checked").val();
                if(userType != "all_users" && saveData.user_group_mapping){
                    if(saveData.user_group_mapping.length == 0){
                        if($sol.form.solform.mode == 'edit'){
                            saveData.has_user_group = false;
                            saveData.user_group_mapping = [];
                            return saveData;
                        }
                        showalert("failure", translate("admp.select.one.group"), "isAutoHide=false"); //No I18N
                        return;
                    }else{
                        saveData.has_user_group = true;
                    }
                }else if(userType == "all_users"){ //No I18N
                    saveData.has_user_group = false;
                    saveData.user_group_mapping = [];
                }
            }else{
                saveData.is_public = false;
                saveData.has_user_group = false;
                saveData.user_group_mapping = [];
            }
        }else{
            if(isPublic){
                saveData.is_public = true;
                saveData.user_group_mapping = [];
            }else{
                saveData.is_public = false;
                saveData.has_user_group = false;
                saveData.user_group_mapping = [];
            }
        }
        return saveData;
    },
  

    /*Execute function while click save/update button*/
    executeWhileSave: function(payload, form, event , cusBtnIndex) {
        var self = this,roleArr = [], parentElement = jQuery('#sol-container');
        var obj = {"description":payload[self.entityName].images};//NO I18N
        var obj = {"description":payload[self.entityName].images};//NO I18N
        if(cusBtnIndex>-1){
         payload[self.entityName].approval_status=self.approvedStatus;
        }
        payload[self.entityName].images && (payload[self.entityName].images = obj);
        if(isMSP){
            $mspSolutionsForm.modifyPayloadForMSP(payload,self);
        }
    },
    /*Function execute after rendering page*/
    afterrenderpage:function(form){
        // custom fields rendered event bind
        this.formEvents();
        jQuery("#"+form.container).find(".section-title").addClass("pl0");
        form.focusField("title"); //No I18N

        //For attachment width adjusting
        var $wrap = jQuery("#"+form.container + " .main-pane").find(".form-wrapper"),
        $wrapEle = $wrap.eq(1).width($wrap.eq(0).find(".right-col").outerWidth());   //NO I18N
        $wrapEle.addClass("fr pl15 pr30").prev().removeClass('pb25');  //NO I18N
        $wrapEle.find('h4').attr('style','').addClass('nobold font-base pb10').removeClass('p10'); //NO I18N
        $wrapEle.find('#sol-attachment-container').removeClass('pl10 pr10'); //NO I18N

        if(isMSP)
        {   
            var isSDAdmin = (sdp_user.ROLES.indexOf('SDAdmin') != -1); // No I18N

            // In editcase , if the user is non sdAdmin he will be allowed to opt assciated accounts and all accounts options . if both not set the field will be hidden .
            
            var showAGB = !isSDAdmin && form.entitydata && form.entitydata.has_account_groups ? false : true;

            if(showAGB)
            {
                $mspSolutionsForm.initAGBComp(form);    
            }
            
        }
    },
    /*Click function for back/cancel button in new/edit page*/
    cancelForm:function(){
        var self = this;
        self.parent=window.top;
        if(self.parent.$previewComponent.options[1]){
            if(self.parent.$previewComponent.options[1].containerId == "prob_sol_work"){
                self.parent.$previewComponent.closePreview('prob_sol_work');    //No I18N
            }
        }
        else if(self.fromPage == "details"){
            $SolObj.redirectTo('solution','detail', this.editId);//NO I18N
        }else{
            $SolObj.redirectTo('solution','list','','','cancelForm','null','list');   //NO I18N
        }
    },
    /* Function for ajax call*/
    getEntityAll:function(moduleName,moduleid,entityName,inputData,getAllData){    
        var url = moduleid ? moduleName+'/'+moduleid : moduleName;
        var entityData = [], hasmorerows = false;
        do{
            try{
                var sdpOptions = {
                    url:'/api/v3/'+url,//NO I18N
                    cache: false,
                    async: false,
                    data:sdpAjaxInputData(inputData),
                    success: function(response)
                    {    
                        
                            entityData = entityData.concat(entityName ? response[entityName] : response);
                            if(getAllData && response.list_info && response.list_info.has_more_rows){
                                inputData.list_info.start_index = response.list_info.start_index + response.list_info.row_count;
                                hasmorerows = true;
                            }else{
                                hasmorerows = false;
                            }
                        
                        
                    },
                    error: function(response){
                        entityData = response.responseJSON;
                        hasmorerows = false;
                    }
                };
                sdpAjax(sdpOptions);
            }
            catch(e){
                console.error(e);
                hasmorerows = false;
            }
        }while(hasmorerows);

        return entityData;
    },

    //This function is used to modify the row count
    getAllInputDataCallback: function(){
        var modifyInputData = function(urlOptions,input_data,searchText){
            input_data.list_info.row_count = 25;
            return input_data;
        };
        return modifyInputData;
    },
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelect: function(formalias, fname, isEdit, event){
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "id"}}; //No I18N
        //SD-113439-load all the owners in bulk select component
        if(fname=='owner' && !field.allowedValues){
            FC_Mapper[formalias].fields[fname].allowedValues = this.getEntityAll(this.base_url,fname,fname,input_data,true);
        }
        if(!field.allowedValues){
        sdpAjax({
            url: "/api/v3"+field.href, //No I18N
            async:false,
            cache:false,
            data:sdpAjaxInputData(input_data),
            success:function(data){
              field.allowedValues = data[lookup_entity];
              FC.showBulkSelect(formalias, fname, isEdit, event, true);
            }
        });
        }else{
            FC.showBulkSelect(formalias, fname, isEdit, event, true);
        }
    },
    //To render a review date field in a form
    renderReviewDate: function(){
        var tempInfo = {"templateinfo":[{"id":"threemonths","name":translate('sdp.kbase.periodic.after.threemonths')},{"id":"sixmonths","name":translate('sdp.kbase.periodic.after.sixmonths')},{"id":"ninemonths","name":translate('sdp.kbase.periodic.after.ninemonths')}]};  //NO I18N
        if($sol.form.entitydata != undefined){
            var reviewDate = $sol.form.entitydata.review_date.display_value;
            if(reviewDate != "-"){
                tempInfo = {"review_date" : $sol.form.entitydata.review_date,"templateinfo":tempInfo.templateinfo}; //NO I18N
            }
        }
        return renderhbs(null,"sol-reviewdate-template",tempInfo,false,"solutions",null,"solutions",null,true);   //NO I18N
    },
    //To render a expiry date field in a form
    renderExpiryDate: function(){
        var tempInfo  = {};
        if($sol.form.entitydata != undefined){
            var expiryDate  = $sol.form.entitydata.expiry_date.display_value;
            if(expiryDate != "-"){
                tempInfo = {"expiry_date" : $sol.form.entitydata.expiry_date};  //NO I18N
            }
        }
        return renderhbs(null,"sol-expriydate-template",tempInfo,false,"solutions",null,"solutions",null,true);   //NO I18N
    },
    //Used to handle user groups and public show and hide actions
    formEvents: function(){
        var _self = this;
        //SD-131689
        jQuery(document).off("click.solformpre").on("click.solformpre", '[data-preriodic-date]', function(){ //No I18N
            var preiodic = jQuery(this).attr("id");
            if(preiodic){
                preiodic && _self.setPeriodicCalendarDate(preiodic);
            }else{
                jQuery(this).attr("data-preriodic-date") === "expiry" ? _self.resetSolFormDate("expiry") : _self.resetSolFormDate("review"); //No I18N
            }
        });
        jQuery(document).off("click.solformcalender").on("click.solformcalender", "[data-sol-calender]", function(e){ //No I18N
            e.stopPropagation();
            var field = jQuery(this).attr("data-sol-calender");
            _self.initSolCalendar(field);
            _self.showSolDateMenuAndCalendar(field);
        })

        jQuery(document).off('click.solispublic').on('click.solispublic', '#sol_is_public', function(){ //No I18N
            var is_public = jQuery(this).is(':checked'); //No I18N
            if(is_public){
                jQuery('#visibility_row').removeClass('disableDiv');
            }
            else{
                jQuery('#all_user_visibility').trigger("click");
                jQuery('#visibility_row').addClass('disableDiv');
            }
        });

        jQuery(document).off('change.solusergroup').on('change.solusergroup', 'input[name="user-group"]', function(){
            var usergroup = jQuery("input[name='user-group']:checked").val();
            if(usergroup == 'specific_user'){
                jQuery('#userGroupRow').removeClass('hide');
                // if(_self.editId){
                $sol.form.solform.addMandatoryField('user_group_mapping', 'manual', undefined) //No I18N
                // }
            }
            else{
                jQuery('#userGroupRow').addClass('hide');
                // if(_self.editId){
                $sol.form.solform.removeMandatoryField('user_group_mapping', 'manual', undefined) //No I18N
                // }
            }
        })
        if(isMSP){
            $mspSolutionsForm.addformEventsForMSP();
        }
        
    },
    //To initialize the Calender here
    initSolCalendar: function(element){
        var compareElement, errorCondition, setHrsMins, errorMsg;
        var tempVar;
        element = element+"date"; //No I18N
        if("reviewdate" == element){ //NO I18N
            compareElement = "expirydate";errorCondition = "";setHrsMins = "00:00";errorMsg=translate("sdp.solution.expiry.review.date.mismatch1");//NO I18N
            solution_oldTime = jQuery("#reviewdate").val();
            solution_oldDispTime = jQuery("#reviewdate_Display").val();
        }else if("expirydate" == element){	//NO I18N
            compareElement = "reviewdate";errorCondition = "less";setHrsMins = "00:00";errorMsg=translate("sdp.solution.expiry.review.date.mismatch2");//NO I18N
            solution_oldTime = jQuery("#expirydate").val();
            solution_oldDispTime = jQuery("#expirydate_Display").val();
            //To select the selected review date as the default value to the expiry date.
            if( (solution_oldTime == null || solution_oldTime <= 0 || solution_oldTime == "") && (jQuery("#reviewdate").val() != null && jQuery("#reviewdate").val() > -2) ) {
                tempVar = jQuery("#expirydate").val();
                jQuery("#expirydate").val(jQuery("#reviewdate").val());
                if(tempVar == "") {
                    tempVar = "-1";
                }
            }
        }
        var dropdownId = (('reviewdate' == element) ? 'ReviewDateDropDown' : (('expirydate' == element) ? 'ExpiryDateDropDown' : '')); //NO I18N
        var close = function( event, data ) {
            jQuery('body').click();//NO I18N
            jQuery('#'+dropdownId).removeClass('disp-ib'); // disp-ib class will be removed when mouse is clicked outside the calendar so that dropdown closes.
        }
        initCalendar(element, null, null, null, null, $sol.form.checkAndResetValidDate, window, [element , compareElement, errorMsg , errorCondition], false, setHrsMins ,true, null, false, null, {'close' : close, 'position' : 'top', 'parentId' : dropdownId}); // No I18N
        //Reassigning the original value for the expiry date field.
        if(tempVar) {
            jQuery("#expirydate").val(tempVar);
        }
    },

    //To check and validate review and expiry date in form
    checkAndResetValidDate: function(element , compareElement, errorMsg , errorCondition) {

        var currentDate = new Date();
        currentDate.setHours(0,0,0);
        currentDate.setMilliseconds(0);
    
        jQuery("#currentdate").val(currentDate.getTime());
        var currentDatVar = "currentdate";//NO I18N
        var currentErrorMsg = translate("sdp.solution.currentdate.review.date.mismatch");
        if("expirydate" == element){
            currentErrorMsg = translate("sdp.solution.currentdate.expiry.date.mismatch");
        }
        var currentErrorCondition = "less";//NO I18N
        //Checking the Current date to the review or expiry date
        if(!checkValidDate(element , currentDatVar, currentErrorMsg , currentErrorCondition)) {
    
            if("reviewdate" == element){ //NO I18N
                jQuery("#reviewdate").val(solution_oldTime);
                jQuery("#reviewdate_Display").val(solution_oldDispTime);
                if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
                    displayClientTime("reviewdate");//NO I18N
                    jQuery("#reviewDateMenu").find("span").html(jQuery("#reviewdate_Display").val());
                }
                else {
                    resetReviewDate();
                }
            }else if("expirydate" == element){	//NO I18N
                jQuery("#expirydate").val(solution_oldTime);
                jQuery("#expirydate_Display").val(solution_oldDispTime);
                if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
                    displayClientTime("expirydate");//NO I18N
                    jQuery("#expiryDateMenu").find("span").html(jQuery("#expirydate_Display").val());
                }
                else{
                    resetExpiryDate();
                }
            }
        }
        //Check/compare the review date and expiry date
        else if(checkValidDate(element , compareElement, errorMsg , errorCondition)) {
            if("reviewdate" == element){ //NO I18N
                jQuery("#reviewDateMenu").find("span").html(jQuery("#reviewdate_Display").val());//NO I18N
            }else if("expirydate" == element){	//NO I18N
                jQuery("#expiryDateMenu").find("span").html(jQuery("#expirydate_Display").val());//NO I18N
            }
        }
        else {
            if("reviewdate" == element){ //NO I18N
                jQuery("#reviewdate").val(solution_oldTime);
                jQuery("#reviewdate_Display").val(solution_oldDispTime);
                if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
                    displayClientTime("reviewdate");//NO I18N
                    jQuery("#reviewDateMenu").find("span").html(jQuery("#reviewdate_Display").val());
                }
                else {
                    resetReviewDate();
                }
            }else if("expirydate" == element){	//NO I18N
                jQuery("#expirydate").val(solution_oldTime);
                jQuery("#expirydate_Display").val(solution_oldDispTime);
                if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
                    displayClientTime("expirydate");//NO I18N
                    jQuery("#expiryDateMenu").find("span").html(jQuery("#expirydate_Display").val());
                }
                else{
                    resetExpiryDate();
                }
            }
        }
    },

    //To construct a Calender here
    showSolDateMenuAndCalendar: function(element){
        jQuery(".DashboardTableColor").on("click", function() {
          if(jQuery("#_CALDIALOG_LAYER").css({"visibility":"visible"})) {
            jQuery("#"+element+"DateDropDown").css({"display":"block"});//NO I18N
          }
        });
        jQuery("body").on("click", function(evt){
          if(jQuery(evt.target).closest("tr").attr("class") !== "DashboardTableColor" && jQuery(evt.target).attr("id") !== ""+element+"DateMenu"){
              jQuery("#"+element+"DateDropDown").css("display","none");//NO I18N
          }
        });
    
        jQuery("#check"+element).on("click", function(){
            if(!jQuery(this).hasClass("open")){
                 jQuery("#"+element+"DateDropDown").css("display","block");//NO I18N
            }
        });
    },
    //To set s periodic calender date options
    setPeriodicCalendarDate: function(months){
        var days;
        switch(months){
            case "threemonths": //No I18N
                days = 90
                break;
            case "sixmonths": //No I18N
                days = 180
                break;
            case "ninemonths": //No I18N
                days = 270
                break;
        }
        var oldTime = jQuery("#reviewdate").val();
        var oldDispTime = jQuery("#reviewdate_Display").val();
    
        var currentDate = new Date();
        currentDate.setHours(0,0,0);
        currentDate.setMilliseconds(0);
        currentDate.setDate(currentDate.getDate() + days);
    
        jQuery("#reviewdate").val(currentDate.getTime()) 
    
        var originalElement = "reviewdate";compareElement = "expirydate";errorCondition = "";errorMsg=translate("sdp.solution.expiry.review.date.mismatch1");//NO I18N
    
        if(checkValidDate(originalElement , compareElement, errorMsg , errorCondition)) {
            jQuery("#reviewdate").val(currentDate.getTime());
            displayClientTime("reviewdate");//NO I18N
            jQuery("#reviewDateMenu").find("span").html(jQuery("#reviewdate_Display").val());
        }
        else {
            jQuery("#reviewdate").val(oldTime);
            jQuery("reviewdate_Display").val(oldDispTime);
            if(oldTime !=null && oldTime != "" && oldTime != "-1") {
                jQuery("#reviewDateMenu").find("span").html(jQuery("#reviewdate_Display").val());
            }
            else {
                $sol.form.resetSolFormDate("review"); //No I18N
            }
        }
    },
    //To reset a solution form dates
    resetSolFormDate: function(field) {
        jQuery("#"+field+"date").val("-1");
        jQuery("#"+field+"date_Display").val("");
        jQuery("#"+field+"DateMenu").find("span").html(translate("sdp.common.notneeded"));
    },
    //To fetch user group related data's
    fetchUserGroup:function(){
        var userGroup;
        sdpAjax({
            url: "/api/v3/user_groups", //No I18N
            async: false,
            success: function(res){
                userGroup = res;
            }
        })
        return userGroup.user_groups;
    },
    //To get a approved status of a solution
    getApprovedStatus:function(){
      var approvalObj={};
      var search_criteria = {"list_info":{"search_criteria": [{"field":"name","value":"Approved","condition":"is"}]}};   //No I18N
      sdpAjax({
        url: "/api/v3/solutions/approval_status",   //No I18N
        cache:false,
        async:false,
        data: sdpAjaxInputData(search_criteria),
        success:function(resp){
            approvalObj=resp.approval_status[0];
        }
      });
      return approvalObj;
    }
}
//# sourceMappingURL=solutions_form.js