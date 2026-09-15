/* $Id$ */
//Need to add this file in servicedeskJSList for compressed usage
var $problemGlobal = {

    /*This method is used to convert the parameters to JSON object and send for redirection*/
    redirect: function (mode, entity_id, view, from, operation, associatedEntityId, overwrite_option, printPreview, externalframe, listViewType,fromActions,templateId) {
        mode = mode == 'null' ? null : mode;// No I18N
        entity_id = entity_id == 'null' ? null : entity_id;// No I18N
        view = view == 'null' ? null : view;// No I18N
        from = from == 'null' ? null : from;// No I18N
        operation = operation == 'null' ? null : operation;// No I18N
        associatedEntityId = associatedEntityId == 'null' ? null : associatedEntityId;// No I18N
        overwrite_option = overwrite_option == 'null' ? null : overwrite_option;// No I18N
        printPreview = printPreview == 'null' ? null : printPreview;// No I18N
        externalframe = externalframe == 'null' ? null : externalframe;// No I18N
        listViewType = listViewType == 'null' ? null : listViewType;// No I18N
        fromActions = fromActions =='null' ?null:fromActions;//No I18N
        templateId = templateId == 'null' ? null : templateId;// No I18N
        previewSlider = getSDPURLParams().previewSlider;
        var hashURL = window.location.hash, tabName = "";

        if (hashURL != null && hashURL != "") {  // No I18N
            tabName = hashURL.substr(1);
        }

        var options = {
            mode: mode,
            id: entity_id,
            tabName: tabName,
            from: from,
            view: view,
            externalframe: externalframe,
            operation: operation,
            associatedEntityId: associatedEntityId,
            overwrite_option: overwrite_option,
            printPreview: printPreview,
            listViewType: listViewType,
            fromActions:fromActions,
            templateId : templateId,
            previewSlider: previewSlider
        };
        this.redirectTo(options);

    },
    /* The below method redirects to required object initialization based the mode of the options*/
    redirectTo: function (options) {
        if (options && options.mode) {
            jQuery("#problem-section").html('');
            jQuery('body').removeClass('of-h'); // No I18N
            if (options.mode == "add" || options.mode == "edit") {
                $PBForm.initialize(options);
            } else if (options.mode == "list") {// No I18N
                if(options.operation!='associated'){
               jQuery('body').addClass('of-h'); // No I18N
                }
                //To overcome height overflow issue, initialised in timeout
                setTimeout(function () {
               $problemList.init(options);
                }, 10);
            } else if (options.mode == "detail") {// No I18N
                this.entity_id = options.id
                this.fromPage = options.mode;
                $problemDetails.init(options);
            }
        }
        else if (options.printPreview) {
            jQuery('#module-content').load('/ui/problems?mode=detail&printPreview=true&entity_id=' + options.id+(paramObj.externalframe?'&externalframe=true':''), function () {});// No I18N
        }
    },
    /*This method is called from PrintPreviewComponent.jsp*/
    callPrintpreview: function (id,paramObj) {
        var opt={
            id:id,
            printPreview:true
        };
        opt = jQuery.extend(opt, paramObj);
        this.redirectTo(opt);
    },
    /*The options ['Overwrite All Fields','Overwrite Empty Fields','Do Not Overwrite'] is shown in popup for pre-filling data in problem form.
    ** Declared here for global usage('New Problem' from request page)
    */
    showOverwritePopup: function (module, moduleid, defaultSelectedOption, submitCallback) {
        var contextObj = {};
        var self = this;
        contextObj.message_key = 'problem.newpage.alert.message';// No I18N
        contextObj.optkey1='problem.overwrite.existing.values';// No I18N
        contextObj.optkey2='problem.overwrite.empty.values';// No I18N
        contextObj.optkey3='problem.do.not.overwrite';// No I18N
        contextObj.selectedOpt = self.selOverwriteId?self.selOverwriteId:defaultSelectedOption;
        this.associatedEntityId = moduleid;
        if (module == 'request') {
            var opts = ['optkey1','optkey2','optkey3'];// No I18N
            opts.forEach(function (opt) {contextObj[opt] = contextObj[opt] && contextObj[opt].replace('problem','problem.request')})
            contextObj.message_key = 'request.problem.associate.choose';// No I18N
            submitCallback = this.openProbAsscForm;
            jQuery('body').on('change', '[name=overwritetmp]', function () {
                self.selOverwriteId = jQuery("input[name='overwritetmp']:checked").val();
            });
            contextObj.fieldsToSync = {
                "sdp.requests.common.category": "sdp.requests.common.category",// No I18N
                "sdp.common.subcategory": "sdp.common.subcategory",// No I18N
                "sdp.common.item": "sdp.common.item",// No I18N
                "sdp.requests.common.title": "sdp.common.title",// No I18N
                "sdp.requests.common.desc": "sdp.common.description",// No I18N
                "sdp.requests.common.priority": "sdp.requests.common.priority",// No I18N
                "sdp.itil.common.urgency": "sdp.itil.common.urgency",// No I18N
                "sdp.problem.impact": "sdp.problem.impact",// No I18N
                "sdp.requests.common.site": "sdp.requests.common.site",// No I18N
                "sdp.request.serviceaffected": "sdp.itil.common.serviceaffected",// No I18N
                "sdp.helpdesk.common.cis": "sdp.itil.common.asset",// No I18N
                "ae.cmdb.search.cis": "common.association.configuration_items"// No I18N
            }
            contextObj.fromModuleName = translate('common.request');
        }
        if(!self.selOverwriteId){self.selOverwriteId=3}
        var content = renderhbs(null, 'problemform-overwrite-popup', contextObj, false, 'common', null, true, null, true);// No I18N
        content = content.replaceAll(",","&#44;");
        showconfirm(true,
            "title=" + translate("sdp.change.modify.template.title") + "," + //No I18N
            "message=" + content + "," +   //No I18N
            "submitbutton=" + translate("sdp.license.upgrade") + "," +    //No I18N
            "cancelbutton=" + translate("common.cancel") + "," + //No I18N
            "closebutton=yes," +    //No I18N
            "closeOnEscKey=yes", submitCallback// No I18N
        );
        if (module && jQuery('#CreateProblemUIPopup').length != 0) {
            initTooltip('#CreateProblemUIPopup');// No I18N
        }
    },

    openProbAsscSlider: function (entityId, templateId) {
            this.templateId = templateId;
            this.associatedEntityId = entityId;
            $previewComponent.load('/ui/problems?mode=add&from=cmdb&associatedEntityId=' + entityId + '&operation=associateto&overwrite=' + 2 + '&externalframe=true&templateId='+ templateId, translate('common.new.label', [translate('sdp.problem.problemtab')]), null, null, null, 'newproblem_popup'); // No I18N
    },

    /*Loading Problem New form in previewComponent from request page*/
    openProbAsscForm: function (didConfirm) {
        if (didConfirm) {
            $previewComponent.load('/ui/problems?mode=add&from=request&associatedEntityId=' + $problemGlobal.associatedEntityId + '&operation=associateto&overwrite=' + $problemGlobal.selOverwriteId + '&externalframe=true', translate('common.new.label', [translate('sdp.problem.problemtab')]), null, null, null, 'newproblem_popup'); // No I18N
        }
    },
    //Below methods are used in different pages other than problem page
    problemsBulkOperation: function (type, form, techSelector) {
        // Called from Calendar page for tech assignment
        var formObj = form ? form : document.ProblemListForm, _self = this;
        var techEle = techSelector ? techSelector : '#TechList';// No I18N
        var selVals = getSelectedCheckBoxes(formObj);
        if (selVals.length == 0) {
             if (type == "ASSIGN") {
                _self.removeAndShowAlert("warning", translate("sdp.problem.listview.problemstoassign"), "isAutoHide=true");// No I18N
            }
            return;
        }
        var successMsg = "", assignTechId;
        switch (type) {
            case "ASSIGN"://No I18N
                if (document.querySelector(techEle).value == "-1" || document.querySelector(techEle).value == "0") {
                    _self.removeAndShowAlert("warning", translate("sdp.change.listview.selecttech"), "isAutoHide=true");// No I18N
                    return;
                }
                successMsg = translate("sdp.common.assign.success", [translate('sdp.problem.problemtab')]);
                assignTechId = document.querySelector(techEle).value;
                break;
        }
        return _self.invokeBulkAPICalls(selVals, type, successMsg, assignTechId,techEle);
    },
    removeAndShowAlert:function(type,msg,add){
        jQ('#alertbox').remove();// No I18N
        showalert(type,msg,add);
    },
    // SD:71704 - Vul Issues to be fixed - GET URLs for deleting problem
    manageRequestAssociations: function (type, WOId) {
        //Called from request page for dissociation (Right panel and Actions)
        var selVal;
            selVal = jQuery('#asso-problem-id').attr('data-id');
        if (!selVal) {
            showalert("warning", translate("sdp.problem.error.selectone"), "isAutoHide=true");// No I18N
            return;
        }
        var url = "/api/v3/problems/" + selVal + "/associated_incidents";//No I18N
        var inputData = sdpAjaxInputData({ "associated_incidents": [{ "request": { "id": WOId } }] });//No I18N

        sdpAjax({
            url: url,
            type: type,
            data: inputData,
            acceptODCompatible: true,
            success: function (resp) {
                if (type == 'DELETE') {
                    window.showalert("success", translate("request.association.detached", [translate("common.problem")]), "isAutoHide=true");  //No I18N
                    if (window.$req) {
                        $req.details.updateRequestTemplates('problem');//No I18N
                    }
                }
            }
        });

    },
    addUsersForProblemNotification: function (notName) {
        //Called from Problem Notification Template page to fill Choose technician Input
        var mode = 'add'; // No I18N
        var values, ids, url;
        if (notName == "ProblemClosed") {
            values = document.ProbNotForm.ProblemClosed_UserDisplay.value;
            ids = document.ProbNotForm.ProblemClosed_USERS.value;
            url = '/SearchItem.do?criteria=Technician Name&element1=document.ProbNotForm.ProblemClosed_UserDisplay&element2=document.ProbNotForm.ProblemClosed_USERS&from=escalate&type=Problem'; // No I18N
        }
        else if (notName == "ProblemCreated") {
            document.ProbNotForm.ProblemCreated_UserDisplay.value;
            ids = document.ProbNotForm.ProblemCreated_USERS.value;
            url = '/SearchItem.do?criteria=Technician Name&element1=document.ProbNotForm.ProblemCreated_UserDisplay&element2=document.ProbNotForm.ProblemCreated_USERS&from=escalate&type=Problem'; // No I18N
        }
        if (values != null && values != '' && ids != null && ids != '') {
            mode = 'edit'; // No I18N
        }
        if (isMSP) {
            url = url + '&WF_ACCOUNTID=0&WFfromNotificationRulesPage=MSPtrue';      // No i18n
        }
        url = url + '&mode=' + encodeURIComponent(mode); // No I18N
        //Since parent's input is box is controlled, cannot add noopener
        NewWindow(url, 'selectitem', '320', '350', 'yes', 'center'); // No I18N
    },
    checkProblemNotifications: function (formObj) {
        //Called from Problem Notification Template List Save
        if (formObj.ProblemCreated.checked == true || formObj.ProblemCreated_SMS.checked == true) {
            if (formObj.ProblemCreated_USERS.value == "" && formObj.ProblemCreated_SMS_USERS.value == "") {
                showalert("warning", translate("sdp.admin.problemnotification.techchoose.newproblem.js"), "isAutoHide=true");// No I18N
                return false;
            }
            else if (formObj.ProblemCreated_USERS.value == "") {
                formObj.ProblemCreated_USERS.value = formObj.ProblemCreated_SMS_USERS.value;

            }
            else {
                formObj.ProblemCreated_SMS_USERS.value = formObj.ProblemCreated_USERS.value;
            }
        }
        if (formObj.ProblemClosed.checked == true) {
            if (formObj.ProblemClosed_USERS.value == "") {
                showalert("warning", translate("sdp.admin.problemnotification.techchoose.problemclosed.js"), "isAutoHide=true");// No I18N
                return false;
            }
        }
        if (formObj.ProblemCreated_SMS.checked == true) {
            formObj.ProblemCreated_SMS_USERS.value = formObj.ProblemCreated_USERS.value
            formObj.ProblemCreated_SMS_UserDisplay.value = formObj.ProblemCreated_UserDisplay.value
        }
        invokeProgressIndicator(null, "sdp.common.processing"); // No I18N
        formObj.submit();
        parent.bindProblemNotifEvents();
    }
}