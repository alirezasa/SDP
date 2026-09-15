/* $Id $ */

/*Change Multi Approval Level - Start*/
function MLAComponent(params) {
    this.params = params;
    this.params.edit = (params.edit == "true" || params.edit == true) ? true : false;
    this.params.approve = (params.approve == "true" || params.approve == true) ? true : false;
    this.tableObjects = {};
    this.init();
}

MLAComponent.prototype = {
    /* To initialize approval level */
    init: function(approval_levelid) {
        var _self = this, approval_level_obj = {};
        if(!_self.params.per_ruleArray) {
            let per_ruleArray = [{"id":"33","text":"33"},{"id":"50","text":"50"},{"id":"75","text":"75"},{"id":"100","text":"100"}]; // No I18N
            _self.params.per_ruleArray = per_ruleArray;
        }
        var get_url;
        var inputObject = {};
        var list_info = {
            "list_info": { //No I18N
                "row_count": 100, //No I18N
                "sort_field": "id", //No I18N
                "sort_order": "asc" //No I18N
            }
        };
        if (_self.params.entity_name == "releases" || _self.params.entity_name == "changes") {
            list_info.list_info.search_criteria = {
                "field": "stage.id", //No I18N
                "value": _self.params.stageId, //No I18N
                "condition": "is" //No I18N
            };
        }
        inputObject = list_info;
        var dataVal = sdpAjaxInputData(inputObject);
        if (!_self.params.key || _self.params.key == "null" || _self.params.key == "undefined" || _self.params.key == undefined) {
            _self.c_url = "/api/v3/" + _self.params.entity_name + "/" + _self.params.changeId; // No I18N
            get_url = _self.c_url + '/approval_levels?' + dataVal; // No I18N
            _self.params.is_non_login = false;
        } else {
            _self.c_url = "/sd/servlets/CmClientUtilServlet?"; // No I18N
            get_url = _self.c_url + "stageid=" + _self.params.stageId + "&command=fetchChangeApprovalLevels" + "&KEY=" + _self.params.key + "&approval_module_id=" + _self.params.changeId; // No I18N
            _self.params.is_non_login = true;
        }
        sdpAjax({
            url: get_url,
            ignorefailuremessage: true,
            success: function(resp) {
                resp.app_static_obj = {
                    "To Be Sent": { //No I18N
                        "icon_class": "in-queue", //No I18N
                        "text": getMessageForKey("approval.tobesent") //No I18N
                    },
                    "Pending Approval": { //No I18N
                        "icon_class": "in-progress", //No I18N
                        "text": getMessageForKey("approval.pending") //No I18N
                    },
                    "Pending Clarification": { //No I18N
                        "icon_class": "in-progress", //No I18N
                        "text": getMessageForKey("api.approval.clarification.status.name") //No I18N
                    },
                    "Approved": { //No I18N
                        "icon_class": "success", //No I18N
                        "text": getMessageForKey("sdp.common.status.approved") //No I18N
                    },
                    "Denied": { //No I18N
                        "icon_class": "danger", //No I18N
                        "text": getMessageForKey("sdp.change.approval.rejected") //No I18N
                    }
                    }
                resp.stageId = _self.params.stageId;
                resp.edit = _self.params.edit;
                resp.approve = _self.params.approve;
                resp.isCompletedStage = _self.params.isCompletedStage;
                resp.approvalRestricted = _self.params.approvalRestricted;
                resp.approvalStageId = _self.params.approvalStageId;
                resp.isNonLogin = _self.params.isNonLogin;
                resp.params = _self.params;

                //We have replaced the html template compilation using renderHbs method as a part of CSP activity. The hbs template with id "configlevel" from MLAComponent.jspf is moved as approval-config-level.hbs.
                renderhbs("#"+_self.params.contentHolderId, "approval-config-level", resp, _self.params.isAppend, "approval", false, true); // No I18N
                approval_level_obj = resp.approval_levels;
            },
            cache: false,
            async: false
        });
        var applen = approval_level_obj.length;
        var active_levels = 0;
        if (applen > 0) {
            _self.isCurrentLevel = false;
            _self.currentStageLevelNames = [];
            for (var i = 0; i < applen; i++) {
                var app_Obj = approval_level_obj[i];

                if (app_Obj.is_current == true) {
                    _self.params.currentLevel = app_Obj;
                }

                _self.currentStageLevelNames.push(app_Obj.name);

                if (!approval_level_obj[i].deleted) {
                    active_levels++;
                }

                if (_self.params.entity_name == "requests") {
                    if (typeof level_ids != 'undefined') {
                        level_ids[app_Obj.level - 1] = app_Obj.id;
                    }
                    $req.appr_convos.init(app_Obj.level, "#approval_conversations_" + app_Obj.level + "_div"); // No I18N
                }

                //Listview initialization

                _self.initListview(app_Obj.id, app_Obj.status.name, app_Obj.is_current, approval_level_obj[i].deleted);

                //To disable checkbox in listview, until a a level status moved from "To Be Sent / Yet to progress"
                if (app_Obj.is_current !== true && !_self.params.is_non_login) {
                    jQuery("#" + _self.params.contentHolderId).find("#approvals_" + app_Obj.id + "_div").find('input[type="checkbox"]').prop('disabled', true);
                }
                if (i == applen - 1 && active_levels > 0) {
                    setTimeout(function() {
                        var tabelDiv = "";
                        for (let j = applen - 1; j >= 0; j--) {
                            let tempObj = approval_level_obj[j];
                            if (!tempObj.deleted) {
                                tabelDiv = jQuery("#" + _self.params.contentHolderId).find("#approvals_" + tempObj.id + "_div");
                                break;
                            }
                        }
                        if ((tabelDiv.innerHTML !== "" && tabelDiv.find('table tbody tr:first td').length > 1) && active_levels < 10) {
                            jQuery("#" + _self.params.contentHolderId).find("#addnewlevel").prop('disabled', false).end().find("#addnewlevelparent").removeAttr("title");
                        } else {
                            jQuery("#" + _self.params.contentHolderId).find("#addnewlevel").prop('disabled', true);
                        }
                    }, 150);
                }
            }
            if (!_self.params.isCompletedStage && (_self.params.edit == true || _self.params.approve == true) && !_self.params.is_non_login) {
                var maxLevelLimit = _self.params.maxLevelLimit || 10;
                if (active_levels >= maxLevelLimit) {
                    jQuery("#" + _self.params.contentHolderId).find("#addnewlevel").hide();
                } else {
                    jQuery("#" + _self.params.contentHolderId).find("#addnewlevel").show();
                }
            }
        }
        setTimeout(function() {
            _self.eventBindings(approval_levelid);
        }, 1000);
    },
    refresh: function() {
        this.init();
    },
    eventBindings: function(approval_levelid) {
        var _self = this;
        if (document.getElementById('ZCchild' + approval_levelid)) {
            document.getElementById('ZCchild' + approval_levelid).expandPanel();
        }
        if (!_self.params.is_non_login) {
            // To bind the on change event to enable "send for notification" button

            jQuery("#" + _self.params.contentHolderId).off("change.approveEvent").on("change.approveEvent", "table tr input[type='checkbox']", function() {
                var par_ele = jQuery(this).parents('.cab-table'); // No I18N
                var isChecked = par_ele.find("table tbody").find('input').is(":checked"); // No I18N
                par_ele.find("[id*='send-rec']").prop('disabled', !isChecked); // No I18N
            });
            // To bind the "Approval Delete" action for listview delete icons
            jQuery("#" + _self.params.contentHolderId).find(".approvals_delete").off('click').on('click', function() {
                var apprid = jQuery(this).attr('data-id');
                var levelname = e_attr(jQuery(this).attr('data-levelname'));
                var par_id = jQuery(this).parents('table').attr('id'); // No I18N
                var applevel_id = par_id.split("approvals_")[1];

                showconfirm(true, 'title=' + getMessageForKey('sdp.dashboard.common.confirmdelete') + ', message=' + getMessageForKey('common.delete.confirm') + ', cancelbutton=' + getMessageForKey('sdp.common.cancel') + ', submitbutton=' + getMessageForKey('sdp.common.delete') + ', closebutton=yes, closeOnEscKey=yes', function(boo) { //NO I18N
                    if (boo) {
                        if (_self.params.entity_name == "requests") {
                            if ("Pending Clarification" === _self.tableObjects[applevel_id].loadedRecords[apprid].status.name) {
                                showconfirm(true, 'title=' + getMessageForKey('sdp.dashboard.common.confirmdelete') + ', message=' + translate('api.approval.delete.pending.clarification') + ', cancelbutton=' + getMessageForKey('sdp.common.cancel') + ', submitbutton=' + getMessageForKey('sdp.common.delete') + ', closebutton=yes, closeOnEscKey=yes', function(saidYes) { //NO I18N
                                    if (saidYes) {
                                        if (_self.tableObjects[applevel_id] && _self.tableObjects[applevel_id].visibleContents.length == 1) {
                                            showconfirm(true, 'title=' + getMessageForKey('sdp.dashboard.common.confirmdelete') + ', message=' + translate('approval.delete.warning.skip.stage', [levelname, levelname]) + ', cancelbutton=' + getMessageForKey('sdp.common.cancel') + ', submitbutton=' + getMessageForKey('sdp.common.delete') + ', closebutton=yes, closeOnEscKey=yes', function(saidYes) { //NO I18N
                                                if (saidYes) {
                                                    _self.deleteAppLevel(applevel_id, "/approvals/" + apprid); // No I18N

                                                }
                                            });
                                        } else {
                                            _self.deleteAppLevel(applevel_id, "/approvals/" + apprid); // No I18N
                                        }
                                    }
                                });
                            } else if (_self.tableObjects[applevel_id] && _self.tableObjects[applevel_id].visibleContents.length == 1) {
                                showconfirm(true, 'title=' + getMessageForKey('sdp.dashboard.common.confirmdelete') + ', message=' + translate('approval.delete.warning.skip.stage', [levelname, levelname]) + ', cancelbutton=' + getMessageForKey('sdp.common.cancel') + ', submitbutton=' + getMessageForKey('sdp.common.delete') + ', closebutton=yes, closeOnEscKey=yes', function(saidYes) { //NO I18N
                                    if (saidYes) {
                                        _self.deleteAppLevel(applevel_id, "/approvals/" + apprid); // No I18N

                                    }
                                });
                            } else {
                                _self.deleteAppLevel(applevel_id, "/approvals/" + apprid); // No I18N
                            }
                        } else {
                            _self.deleteAppLevel(applevel_id, "/approvals/" + apprid); // No I18N
                        }

                    }
                }, true);
            });
            jQuery("#" + _self.params.contentHolderId).find("[id*='send-rec_']").off('click').on('click', function() {
                var changeId = jQuery(this).attr("data-changeid");
                var canEdit = jQuery(this).attr("data-canedit");
                var levelid = jQuery(this).attr("data-levelid");
                _self.sendReccomendation(_self.params.changeId, true, levelid);
            });
        }
        var doc = jQuery(document);
        doc.find(".approvalReject, .actiontaken, .statusaction").off('click').on('click', function(e) { // No I18N
            e.stopPropagation();
            var approverlink = jQuery(this).attr("data-approverlink")
            if (approverlink) {
                var topPos = (jQuery(window).height() / 10) * 3 + "px"; //NO I18N
                var leftPos = (jQuery(window).width() / 10) * 1 + "px"; //NO I18N
                var width = (jQuery(window).width() / 15) * 14 + "px"; //NO I18N
                var height = jQuery(window).height() + "px"; //NO I18N
                var params = 'resizable=1,scrollbars=yes,width=' + width + ',height=' + height + ',top=30px,left=' + leftPos; //NO I18N

                approverlink = approverlink && approverlink.includes("/approval") ? "/approval" + approverlink.split("/approval")[1] : approverlink; // No I18N
                window.open(approverlink, "_blank", params);
            } else {
                var appReject = jQuery(this).attr("data-type"),
                    levelid = jQuery(this).attr("data-levelid"),
                    appLevlid = jQuery(this).attr("data-id");
                if (appLevlid) {
                    _self.approveRejectPopup(null, levelid, jQuery(this), appLevlid);
                } else {
                    _self.approveRejectPopup(appReject, levelid);
                }
            }

        });
        if (!_self.params.is_non_login) {
            doc.find(".configurelevel").off('click').on('click', function(e) { // No I18N
                e.stopPropagation();
                var title = jQuery(this).attr("data-title"),
                    addType = jQuery(this).attr("data-add"),
                    levelid = jQuery(this).attr("data-levelid"),
                    rule = jQuery(this).attr("data-rule"),
                    index = jQuery(this).attr("data-index");
                var approverIds = [];
                jQuery("#approvals_" + levelid).find("[data-approverid]").each(function() {
                    approverIds.push(jQuery(this).attr("data-approverid"));
                });
                if (_self.params.entity_name == "requests" && _self.params.currentLevel && (_self.params.currentLevel.id == levelid || _self.params.currentLevel.status.name == "Approved")) {
                    var isAddLevel = this.id == "addnewlevel";
                    _self.params.sendApprovalCallBackFun(null, null, null, isAddLevel);
                } else {
                    if (_self.params.entity_name == "requests") {
                        jQuery('#levelname-section').remove();
                    }
                    _self.configureLevel(title, addType, levelid, rule, approverIds, index);
                }
            });
            doc.find(".deleteLevel").off('click').on('click', function(e) { // No I18N
                    e.stopPropagation();
                    var applevel_id = jQuery(this).attr('data-levelid');
                    showconfirm(true, 'title=' + getMessageForKey('sdp.dashboard.common.confirmdelete') + ', message=' + getMessageForKey('common.delete.confirm') + ', cancelbutton=' + getMessageForKey('sdp.common.cancel') + ', submitbutton=' + getMessageForKey('sdp.common.delete') + ', closebutton=yes, closeOnEscKey=yes', function(boo) { //NO I18N
                        if (boo) {
                            _self.deleteAppLevel(applevel_id);
                        }
                    });
                }

            );
        }
    },
    getApprovalRules : function () {
        let url = '/api/v3/approval_rules';// No I18N
        let list_info = {"list_info":{"start_index":1,"row_count":100}};	// No I18N
        let dataVal = sdpAjaxInputData(list_info);
        url = url+'?'+dataVal;
        let _self = this;

        sdpAjax({
                  url: url,
                  ignorefailuremessage:true,
                  async :false,
                  success: function(resp) {
                  if(resp.approval_rules) {
                        let approval_rules = resp.approval_rules;
                        let modified_rules = [];
                        let len = resp.approval_rules.length;
                        for(let i=0; i<len; i++) {
                            let rule = approval_rules[i];
                            let modified_rule = {"id": rule.type, "text" : rule.name};	// No I18N
                            modified_rules.push(modified_rule);
                        }
                        _self.params.approval_rules = modified_rules;
                  }
                }
        });

    },
    changeLevelRule :  function(per_rule_val){
        let parDial = jQuery("#_DIALOG_LAYER");
        let rule_obj  = parDial.find("#approval_rule").select2('data');		// No I18N
            if(rule_obj.id === 'percentage') {
                parDial.find("#rule_value").removeClass('hide');
                let per_ruleArray = this.params.per_ruleArray;
                let per_rule = per_rule_val == undefined ? {"id":"100","text":"100"} : {"id":per_rule_val,"text":per_rule_val};// No I18N
                parDial.find("#rule_value").select2({'data':per_ruleArray}).select2("data",per_rule);    //No I18N
            }
            else {
                parDial.find("#rule_value").addClass('hide');
            }
    },
    /* To initialize "Configure Level" Popup*/
    configureLevel : function(title, arg, apprId, rule , approverIds, index){
        var _self = this, data = {};
        jQuery("#MLAComponentSection").find("#configpopup-temp").removeClass('disp-h');
        showDialog(jQuery("#MLAComponentSection").find("#configpopup-temp").html(), "closeButton=yes, position=absmiddle,modal=yes,width=450px,closeOnBodyClick=no,title=" + title); //No I18N

        var parDial = jQuery("#_DIALOG_LAYER");
        parDial.find('#levelName').removeClass('disp-h');
        parDial.find('#add_approval_level').removeClass('disp-h');
        parDial.find('#cancel_approval_level').removeClass('disp-h');
        parDial.find('.form-footer').removeClass('disp-h');
        parDial.find('#cancel_approval_level').off('click.cancel_level').on('click.cancel_level',  function(event) { jQuery("#_DIALOG_LAYER"); closeDialog(); });

        if (apprId && arg !== "member") {
            parDial.find('.toggleSave').toggle();
        }
        if (arg !== "new") {
            parDial.find("#" + arg + "-section").show();
        } else {
            parDial.find("#levelname-section,#member-section").show();
            parDial.css('top', parDial.position().top - 100); //No I18N
        }
        if (_self.params.stageIds && _self.params.stageIds.Approval && _self.params.stageId == _self.params.stageIds.Approval.id) {
            parDial.find("#apprStageUsers,.approvaStageLabel3").show();
        } else {
            parDial.find("#apprStageUsers").hide();
            parDial.find("#nonapprStageUsers,.approvaStageLabel").removeClass("hide");
        }
        jQuery("#" + _self.params.contentHolderId).find("#currentTask").val(arg);
        jQuery("#" + _self.params.contentHolderId).find("#approvalLevelId").val(apprId);
        parDial.find(".saveapprovallevel").on("click", function() {
            _self.save(index);
        });


        if(parDial.find("#approval_rule").length > 0) {
            let per_rule;
            let ruleArray = _self.params.per_ruleArray;

            if(_self.params.entity_name==="changes" || _self.params.entity_name==="releases"){

                if(!_self.params.approval_rules) {
                    _self.getApprovalRules();
                }
                ruleArray = _self.params.approval_rules;
                if(rule == undefined){
                    rule = "anyone_approves";   //NO I18N
                }
                else if(parseInt(rule)) {
                    per_rule = rule;
                    rule = "percentage"; //NO I18N
                }
            }

            if(rule == undefined){
                per_rule = "100";
                rule = "percentage"; //NO I18N
            }

            rule = ruleArray.find(obj => {
                return obj.id===rule;
            });

            parDial.find("#approval_rule").select2({'data':ruleArray}).select2("data",rule);    //No I18N
            if(rule.id == "percentage") {
                _self.changeLevelRule(per_rule);
        }

            parDial.find("#approval_rule").on('change',function(){
                _self.changeLevelRule();
            });
        }

        if (arg === "new" || arg === "member") {
            if (_self.params.stageIds && _self.params.stageIds.Approval && _self.params.stageId == _self.params.stageIds.Approval.id) {
                //To get cab list

                parDial.find("#cablist").sdp_select2({
                    cache: {},
                    multiple: false,
                    'placeholder': getMessageForKey("approval.cab.placeholder"), // No I18N
                    url: [{
                        url: "/api/v3/cabs", //NO I18N
                        field: 'cabs', //NO I18N
                        list_info: {
                            start_index: 1,
                            row_count: 25
                        }
                    }]
                });

                parDial.find("#cablist").on('change', function() {
                    var cabid = jQuery(this).val();
                    if (cabid != "") {
                        parDial.find("#cabmemberlist").parents('.col-fields').removeClass('hide'); // No I18N
                        //To get cab members list
                        sdpAjax({
                            url: '/api/v3/cabs/' + cabid, // No I18N
                            success: function(resp) {
                                var cabmembers = resp.cab.members.filter(function(user) {
                                    return approverIds.indexOf((user.id).toString()) == -1;
                                });
                                cabmembers.sort(function(member1, member2) {
                                    let name1 = member1.name.toLowerCase();
                                    let name2 = member2.name.toLowerCase();
                                    if (name1 < name2) return -1;
                                    if (name1 > name2) return 1;
                                    return 0;
                                });
                                parDial.find("#cabmemberlist").select2('destroy'); // No I18N
                                parDial.find("#cabmemberlist").select2({
                                    'placeholder': getMessageForKey("approval.cabmember.placeholder"),
                                    'data': cabmembers, // No I18N
                                    'multiple': true, // No I18N
                                    'closeOnSelect': false, // No I18N
                                    formatResult: function(obj) {
                                        obj.text = obj.name;
                                        return e_html(obj.name);
                                    },
                                    formatSelection: function(obj) {
                                        return e_html(obj.name);
                                    }
                                }).select2('open'); // No I18N
                            }
                        });
                    } else {
                        parDial.find("#cabmemberlist").parents('.col-fields').addClass('hide'); // No I18N
                    }
                });
            } else if (_self.params.entity_name == "requests" || _self.params.entity_name == "changes" || _self.params.entity_name == "releases") { // No I18N
                var url = "";
                if (arg == "new") {
                    url = "/api/v3/" + _self.params.entity_name + "/" + _self.params.changeId + "/approval_levels/approvals/approver"; //NO I18N
                } else {
                    url = "/api/v3/" + _self.params.entity_name + "/" + _self.params.changeId + "/approval_levels/" + apprId + "/approvals/approver"; //NO I18N
                }
                if (isMSP) {
                    url = url + "?ACCOUNTID=0"; // No I18N
                }
                var select2Options;
                if (_self.params.entity_name == "requests") {
                    select2Options = {
                        value: "",
                        cache: {},
                        multiple: true,
                        placeholder: getMessageForKey('sdp.approvers.select.approvers.placeholder'), // No I18N
                        allowClear: true,
                        closeOnSelect: false,
                        url: [{
                            url: url,
                            field: 'approver', //NO I18N
                            processResults: function(search_data, data, field, settings) {
                                var textVal = data.text ? data.text : data.name + ", " + data.email_id;
                                search_data.push({
                                    id: data.id,
                                    text: textVal
                                });
                            },
                            search_keys: ["name", "email_id"] //NO I18N
                        }]
                    }
                } else {
                    //SD-109405 Moving away from select2Servlet to list approvers in Change and Release modules.
                    select2Options = {
                        value: "",
                        multiple: true,
                        cache: {},
                        placeholder: getMessageForKey('sdp.approvers.select.approvers.placeholder'), // No I18N
                        allowClear: true,
                        closeOnSelect: false,
                        tooltip: true,
                        url: [{
                            url: url,
                            field: 'approver', //NO I18N
                            list_info: {
                                "start_index": 1, //No I18N
                                "sort_field": "name", //No I18N
                                "row_count": 20, //No I18N
                                fields_required: ['name', 'email_id', 'id'] //No I18N
                            },
                            processResults: function(search_data, data, field, settings) {
                                var textVal = data.text ? data.text : data.name;
                                search_data.push({
                                    id: data.id,
                                    email: data.email_id ? data.email_id : data.email,
                                    name: data.name,
                                    text: textVal
                                });
                            },
                            search_keys: ["name"] //NO I18N
                        }],
                        formatResult: _self.reportingToFormatResult
                    };
                }

                parDial.find("#cabmemberlist").sdp_select2(select2Options);
            } else {

                var params = {
                                element : parDial.find("#cabmemberlist"),multiple:true, 		//No I18N
                    resultsFn: function(users) {
                        return users.filter(function(user) {
                            return approverIds.indexOf((user.id).toString()) == -1;
                        });
                    }
                };
                if (isMSP) {
                    params.fromModule = "Change"; //No I18N
                    params.fromModuleId = parent.CHANGEID;
                    params.isApproverField = true;
                    params.entity_name = _self.params.entity_name;
                }
                userSelect.initializeSelect2(params);
            }
        } else {
            parDial.find("#levelName").val(jQuery("#" + _self.params.contentHolderId).find("#level-name-" + apprId).text());

        }
        if (arg === "member") { // No I18N
            parDial.find("#s2id_cabmemberlist .select2-choices input.select2-input").focus(); // No I18N
        } else {
            parDial.find("#levelName").focus(); // No I18N
        }
        parDial.find('[name=configLevelForm]').validate({
            errorClass: 'text-danger', //NO I18N
            errorElement: 'span', // No I18N
            onkeydown: function(element) {
                this.element(element); //To trigger keyup event once validation is initialized to form.
            },
            errorPlacement: function(error, element) {
                element.closest(".col-fields").append(error); // No I18N
                error.addClass('alert alert-danger alert-arrow p5').css({
                    'position': 'absolute', //No I18N
                    'overflow': 'visible', //No I18N
                    'z-index': '100' //No I18N
                });
            }
        });
    },
    reportingToFormatResult: function(user) {
        setTimeout(function(){ initTooltip('.select2-results'); }, 300); //No I18N
        var titleStr = e_attr('<div><b>' + getMessageForKey('sdp.common.name.is') + ' : </b><span>' + e_attr(user.name) + '</span><br><b>' + getMessageForKey('sdp.common.email.is') + ' : </b><span>' + (user.email ? e_attr(user.email) : "N/A") + '</span><br></div>'); // No I18N
        return '<div rel="uitip" mode_html="true" title="' + titleStr + '" data-allowhtml="true" data-default-tooltip="true">' + e_html(user.name) + '</div>';
    },
    /*To delete Approval Level and Approvals */
    deleteAppLevel: function(id, addURL) {
        var _self = this;
        addURL = addURL ? addURL : "";
        sdpAjax({
            url: _self.c_url + '/approval_levels/' + id + addURL, // No I18N
            type: "DELETE", // No I18N
            success: function(resp) {
                showalert('success', getMessageForKey("sdp.admin.common.deletedsuccessfully"), "isAutoHide=true"); // No I18N
                _self.init("approvalStage" + _self.params.stageId + "_" + id); // No I18N
                //SD-110475 : Approval Status is Updated after Deleting Approval Level
                if (_self.params.entity_name == "requests") {
                    $req.details.updateRequestTemplates('approvals'); // No I18N
                }
                if (resp.approval != undefined) {
                    successHdlrForUpdateChangeStatus(resp.approval.workflow_update);
                }
            }
        });
    },
    /*To save the Approval Level and Approval status*/
    save: function(index) {
        var _self = this,
            currentTask = jQuery("#" + _self.params.contentHolderId).find("#currentTask").val();
        var appLevId = jQuery("#" + _self.params.contentHolderId).find("#approvalLevelId").val();
        var parDial = _self.params.from == "home" ? jQuery("#" + _self.params.contentHolderId) : jQuery("#_DIALOG_LAYER"); // No I18N
        var appurl = (currentTask === "new") ? "/approval_levels" : "/approval_levels/" + appLevId; // No I18N
        var inputObject = {},
            approval_level = {},
            approvals = [],
            approval = {},
            type = "POST"; // No I18N
        if (currentTask === "AppApprove" || currentTask === "AppReject" || currentTask === "AppLevelApprove" || currentTask === "AppLevelReject") {
            appId = jQuery("#" + _self.params.contentHolderId).find("#approvalId").val();
            type = "PUT"; // No I18N
            var appOrrej = parDial.find("input[name='recommendation']:checked").val(),
                comments = parDial.find("#appr_comments").val();
            if (!appOrrej) {
                showalert('failure', getMessageForKey("approval.add.action.mandate"), "isAutoHide=true"); // No I18N
                return;
            } else if (trim(comments) == "") { // No I18N
                parDial.find("#appr_comments").focus();
                showalert('failure', getMessageForKey("sdp.changedetails.comments.emptyalert"), "isAutoHide=true"); // No I18N
                return;
            }
            if (appId) {
                appurl += "/approvals/" + appId; // No I18N
                approval.comments = comments;
                inputObject.approval = approval;
            } else {
                approval_level.comments = comments;
                inputObject.approval_level = approval_level;
            }
            appurl += "/" + "_" + appOrrej;
            if ((currentTask === "AppApprove" || currentTask === "AppReject") && _self.params.key != "null" && _self.params.key != "undefined" && _self.params.key != undefined) {
                appurl = "command=takeApprovalAction" + "&KEY=" + _self.params.key + "&approval_module_id=" + _self.params.changeId + "&level_id=" + appLevId + "&id=" + appId + "&action=" + appOrrej; //NO I18N
                type = "GET"; //NO I18N
            }
        } else {
            if (_self.params.entity_name == "releases" || _self.params.entity_name == "changes") {
                let rule_obj  = parDial.find("#approval_rule").select2('data');// No I18N
                //It is mandatory to have 'rule' object for AP
                if(rule_obj.id === 'percentage') {
                    approval_level.rule={"type": "percent","value": parDial.find("#rule_value").val()};// No I18N
                }
                else {
                    approval_level.rule={"type": "condition","value": rule_obj.id};// No I18N
                }
            }
            var lname = trim(parDial.find("#levelName").val());
            //Rename Approval Level
            if (currentTask === "levelname") {
                type = "PUT"; // No I18N
                var isvalidate = parDial.find("#configLevelForm").valid();
                if (!isvalidate) {
                    return false;
                }
                approval_level.name = lname;
                inputObject.approval_level = approval_level;
            } else {
                //Add Cab Members
                var l_obj = parDial.find("#cabmemberlist").select2('data'); // No I18N
                if (l_obj.length > 0 && jQuery.isArray(l_obj)) {
                    l_obj.each(function(a, b) {
                            approvals.push({"approver" : {"id" : a.id}}); //No I18N
                    });
                }
                if (currentTask === "member") {
                    appurl += "/approvals"; // No I18N
                    inputObject.approvals = approvals;
                    if (approvals.length === 0) {
                        if (_self.params.stageId == _self.params.approvalStageId) {
                            showalert('failure', getMessageForKey("approval.add.cab.member"), "isAutoHide=true"); // No I18N
                        } else {
                            showalert('failure', getMessageForKey("approval.selectapprover"), "isAutoHide=true"); // No I18N
                        }
                        return false;
                    }
                } else {
                    //Add New Approval Level
                    var isvalidate = parDial.find("#configLevelForm").valid();
                    if (!isvalidate) {
                        return false;
                    }
                    approval_level.name = lname;
                    if (_self.params.entity_name == "releases" || _self.params.entity_name == "changes") {
                        approval_level.stage= {"id": _self.params.stageId}; // No I18N
                    }
                    if (!jQuery.isEmptyObject(approvals)) {
                        approval_level.approvals = approvals;
                    }
                    inputObject.approval_level = approval_level;
                    if (isMSP && _self.params.entity_name == "requests") {
                        appurl += "?ACCOUNTID=0"; // No I18N
                    }
                }
            }
        }
        if (currentTask === "new" || currentTask === "levelname") {
            var levels = jQuery('#approvalLevelsStage' + _self.params.stageId + ' span')
                .filter(function() {
                    return this.id.match(/level-name-/);
                });
            for (var i = 0; i < levels.length; i++) {
                var level = levels[i].textContent;
                if (level === lname && ((currentTask === "levelname" && i != parseInt(index)) || currentTask === "new")) {
                    showalert('failure', getMessageForKey('approval.same.level.name'), 'isAutoHide=true,delay=2'); // No I18N
                    jQuery("#_DIALOG_CONTENT").find("#levelName").focus();
                    return false;
                }
            }
        }
        jQuery("#_DIALOG_CONTENT").find("#levelName").focus();
        parDial.find(".saveapprovallevel").prop('disabled', true); // No I18N
        var url = _self.c_url + appurl;
        var dataVal = sdpAjaxInputData(inputObject);

        sdpAjax({
            url: url,
            data: dataVal,
            type: type,
            success: function(resp) {
                if (_self.savecallback) {
                    _self.savecallback.apply(window, resp);
                } else {
                    if (currentTask === "levelname") {
                        _self.init("approvalStage" + _self.params.stageId + "_" + (appLevId || resp.approval_level.id)); // No I18N

                    } else {
                        _self.init("approvalStage" + _self.params.stageId + "_" + (appLevId || resp.approval_level.id)); // No I18N
                    }
                    closeDialog();
                    if (currentTask === "AppReject" || currentTask === "AppLevelApprove" || currentTask === "AppLevelReject") {
                        if (_self.params && _self.params.postApprovalAction) {
                            _self.params.postApprovalAction.call(_self, resp);
                            return;
                        }
                        if (resp.approval != undefined) {
                            successHdlrForUpdateChangeStatus(resp.approval.workflow_update);
                        }
                        if (resp.approval_level != undefined) {
                            successHdlrForUpdateChangeStatus(resp.approval_level.workflow_update);
                        }

                    }
                }
            },
            failedCallBack: function(response, status) {
                var responseStatus = response.responseJSON.response_status;
                var message = "";
                if (responseStatus.messages != null) {
                    message = responseStatus.messages[0].message;
                } else {
                    message = responseStatus[0].messages[0].message;
                }
                showalert('failure', message, 'isAutoHide=true,delay=2'); // No I18N
                parDial.find(".saveapprovallevel").prop("disabled", false); // No I18N
            }
        });
    },
    /* To initialize approve/reject popup for Approve Levels and Aprrovals*/
    approveRejectPopup: function(arg, apprLevelId, clickEle, apprId, entity, entity_id, savecallback) {
        var _self = this;
        var popTitle = getMessageForKey("approval.cab.recommendation"),
            currentTask = "";
        if (_self.params && _self.params.stageId != _self.params.approvalStageId) {
            popTitle = getMessageForKey("approval.recommendation.title"); // No I18N
        }
        if (arg == "home") {
            _self.params = {
                "contentHolderId": "approval_print_content" //No I18N
            };
            _self.params.from = "home"; // No I18N
            currentTask = "AppApprove"; // No I18N
            _self.c_url = "/api/v3/" + entity + "/" + entity_id; // No I18N
            _self.savecallback = savecallback;
            var data = _self.getApprovalDetails(entity, entity_id, apprLevelId, apprId);
            data.from = _self.params.from;
        } else if (apprId) {
            currentTask = (arg === "approve") ? "AppApprove" : "AppReject"; // No I18N
            var data = this.tableObjects[apprLevelId].loadedRecords[apprId];
        } else {
            var data = {};
            currentTask = "AppLevelApprove"; // No I18N
            var icon_class = "success", //No I18N
                iconTitle = getMessageForKey("approval.approve"),
                dataTiltleNum = jQuery("#" + _self.params.contentHolderId).find('#level-num-' + apprLevelId).html(), // No I18N
                levelName = jQuery("#" + _self.params.contentHolderId).find('#level-name-' + apprLevelId).text(),
                levelNameAppend = '<span class="pl-of disp-ib maxw-250px" rel="uitip" title="' + e_attr(levelName) + '">' + e_html(levelName) + '</span>';
            if (arg === "reject") {
                currentTask = "AppLevelReject"; // No I18N
                icon_class = "danger"; // No I18N
                iconTitle = getMessageForKey("approval.reject");
            }
            popTitle = "<span class='cspr " + icon_class + " icon-sm mr3 vtop'></span>" + iconTitle + "<span class='ml10 text-muted disp-ib pos-rel font-base'>- &nbsp; " + getMessageForKey("approval.level.label") + " " + dataTiltleNum + " &nbsp;&nbsp;" + levelNameAppend + "</span>";
        }
        if (arg == "home") {
            //We have replaced the html template compilation using renderHbs method as a part of CSP activity. The hbs template with id "appReject-template" from MLAComponent.jspf is moved as approval-action-template.hbs.
            renderhbs("#approval_print_content", "approval-action-template", data, true, "approval", false, true); // No I18N
            var parDial = jQuery("#approval_print_content");
            parDial.find("#appRejectPopup").addClass("fw").removeClass('w-440px');
            parDial.find("#approval-section").show();
        } else {
            //We have replaced the html template compilation using renderHbs method as a part of CSP activity. The hbs template with id "appReject-template" from MLAComponent.jspf is moved as approval-action-template.hbs.
            var compiledHtml = renderhbs("#approval_print_content", "approval-action-template", data, false, "approval", false, true, null, true); // No I18N
            showDialog(compiledHtml, 'closeButton=yes, width=450px, position=center,modal=yes,closeOnBodyClick=no,title=' + popTitle); //No I18N
            var parDial = jQuery("#_DIALOG_LAYER");
            parDial.find('#approve_level_cancel').off('click.cancelDialofg').on('click.cancelDialofg', function() { closeDialog() } );  //No I18N
            if (clickEle) {
                apprLevelId = (jQuery(clickEle).parents('table').attr('id')).split('approvals_')[1]; // No I18N
                parDial.find("#approval-section").show();
            }
        }
        parDial.find(".saveapprovallevel").on("click", function() {
            _self.save();
        });
        jQuery("#" + _self.params.contentHolderId).find("#currentTask").val(currentTask);
        if (arg) {
            parDial.find('input[name="recommendation"][value=' + arg + ']').prop('checked', true); // No I18N
        }

        jQuery("#" + _self.params.contentHolderId).find("#approvalLevelId").val(apprLevelId);
        jQuery("#" + _self.params.contentHolderId).find("#approvalId").val(apprId);
    },
    sendReccomendation: function(changeid, canEdit, approvalLevelId) {
        var _self = this;

        var notifyTo = "";
        var selected = "false";
        var cabSelected = "false";
        var isMailConfigured = "false";
        var resendToMember = false;
        var confirmation = true;
        var approvalIds = "";
        var emails = [];
        jQuery("#" + _self.params.contentHolderId).find("#approvals_" + approvalLevelId + "_body input[type='checkbox']:checked").each(function() {
            var emailId = jQuery(this).attr("data-usermailid");
            var userName = jQuery(this).attr("data-username");
            var userId = jQuery(this).attr("data-userid");
            var orgRoleName = jQuery(this).attr("data-orgrolename");
            var approvalId = jQuery(this).val();
            emailId = emailId && emailId != "null" && emailId.trim() != "-" ? emailId : (_self.params.entity_name == "requests" ? ((userName && userName != "null" && userName != "-") ? userName : orgRoleName) : null); //NO I18N
            if (emailId && emailId != "null") {
                notifyTo = notifyTo + userId + ','; // No I18N
                approvalIds = approvalIds + approvalId + ','; // No I18N
                var isActionTaken = jQuery(this).attr("data-actiontaken");
                if (isActionTaken == 'true') {
                    resendToMember = true;
                }
                cabSelected = "true";
                emails.push(emailId);
                isMailConfigured = "true";
            }

        });
        approvalIds = approvalIds.substring(0, approvalIds.length - 1);
        if (isMailConfigured == "false" && _self.params.entity_name != "requests") {
            alert(getMessageForKey("workflow.notification.failure.noemail"));
            return false;
        }

        if (changeid != null && changeid != "") {
            if (resendToMember) {
                var message = _self.params.entity_name == "requests" ? "sdp.request.app.resend" : "sdp.change.app.cab.resend"; // No I18N
                confirmation = window.confirm(getMessageForKey(message));
            }
            if (confirmation) {
                if (_self.params.entity_name == "releases" || _self.params.entity_name == "changes") {
                    var module = _self.params.entity_name.slice(0, -1);
                    // For release open dialog box. _self.refresh called to refresh page after mail send
                    $notification_popup.openNotificationForm({
                        type: "approval_" + module, //No I18N
                        module: module,
                        module_id: changeid,
                        sub_module: "approval", //No I18N
                        sub_module_id: approvalLevelId,
                        approval_ids: approvalIds.split(","),
                        has_attachments: true,
                        to: emails,
                        afterNotificationSent: function() {
                            _self.refresh()
                        },
                        user_fetch: _self.params.user_fetch
                    });
                } else if (_self.params.entity_name == "requests") { //NO I18N
                    var requestApprovals = approvalIds.split(',');
                    _self.params.sendApprovalCallBackFun(emails.length > 0 ? emails : null, requestApprovals.length > 0 ? requestApprovals : null, approvalLevelId);
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    /* Initialize TABLE COMPONENT for listview*/
    initListview: function(id, appStatus, isCurrentLevel, isLevelDeleted) {
        var _self = this;
        _self.isCurrentLevel = _self.isCurrentLevel || isCurrentLevel;
        var table_content = {},
            options = {};
        var approval_get_url;
        if (!_self.params.is_non_login) {
            approval_get_url = _self.params.entity_name + "/" + _self.params.changeId + "/approval_levels/" + id + "/approvals"; // No I18N
        } else {
            options.defaultpath = ""; // No I18N
            approval_get_url = "/sd/servlets/CmClientUtilServlet?" + "command=fetchChangeApprovals" + "&KEY=" + _self.params.key + "&approval_module_id=" + _self.params.changeId + "&level_id=" + id; // No I18N
        }
        var table_info = {
            "list_info": { //No I18N
                "start_index": 1, //No I18N
                "row_count": 100, //No I18N
                'sort_order': 'asc', //No I18N
                'sort_field': 'approver.name' //No I18N
            }
        };

        if (_self.params.entity_name == "requests") {
            table_info.list_info.search_criteria = {
                "field": "deleted", //No I18N
                "value": false, //No I18N
                "condition": "is" //No I18N
            };
        }
        table_content.header = _self.headerdataConstruct(_self, id, appStatus, isCurrentLevel);
        options.callbackHeaderfunction = _self.headerdataConstruct;
		options.callbackAfterBodyRender = _self.afterBodbyRender;
        options.callbackURL = approval_get_url;
        options.row_inputdata = table_info;
        options.entity_name = "approvals"; // No I18N
        options.tableHolder = "approvals_" + id; // No I18N
        if (_self.params.stageId == _self.params.approvalStageId) {
            options.nodataString = getMessageForKey("sdp.change.app.nocab"); // No I18N
        }

        this.tableObjects[id] = new tableComponent({
            "list_info": { //No I18N
                "row_count": 100, //No I18N
                "start_index": 1, //No I18N
                'sort_order': 'asc', //No I18N
                'sort_field': 'approver.name' //No I18N
            }
        }, table_content, options, _self);
    },
	afterBodbyRender: function() {
        jQuery('[data-action-name=show_more_comments]').each(function()  {
			jQuery(this).off('click').on('click', function() {//No I18N
				var txt = e_html(jQuery(this).attr('data-msg'));
				showDialog("<div class='dig-content-scroll p10 wspace-prewrap lh20'>"+txt+"</div>","modal=yes, width=650px, height=auto, title="+translate('sdp.common.comments')+", position=absmiddle");//No I18N
			});
		});
    },
    headerdataConstruct: function(_self, id, appStatus, isCurrentLevel, isLevelDeleted) {
        var meta_data = {},
            meta_data_add = {};
        meta_data["approvals_" + id + "_head_chk"] = { // No I18N
            "type": "checkbox", // No I18N
            "dataCelltransformer": _self.constructCheckboxCell, // No I18N
            "default": true // No I18N
        };
        meta_data_add = {
            "delete": { // No I18N
                "dataCelltransformer": _self.constructDeleteCell, // No I18N
                "type": "icon", // No I18N
                "is_non_login": _self.params.is_non_login, // No I18N
                "approve": _self.params.approve, // No I18N
                "edit": _self.params.edit // No I18N
            },
            "status": { // No I18N
                "dataCelltransformer": _self.constructStatusCell, // No I18N
                "text": getMessageForKey('common.status') // No I18N
            },
            "approver": { // No I18N
                "dataCelltransformer": _self.constructApproverCell, // No I18N
                "text": getMessageForKey("approval.approvers"), // No I18N
                "wrapped": true // No I18N
            },
            "sent_on": { // No I18N
                "dataCelltransformer": _self.constructSentCell, // No I18N
                "text": getMessageForKey("approval.senton"), // No I18N
                "type": "date-time" // No I18N
            },
            "action_taken_on": { // No I18N
                "text": getMessageForKey("approval.actedon"), // No I18N
                "dataCelltransformer": _self.constructActTakenCell, // No I18N
                "type": "date-time" // No I18N
            },
            "comments": { // No I18N
                "text": getMessageForKey("common.comments"), // No I18N
                "dataCelltransformer": _self.constructCommentsCell, // No I18N
                "width": "400px" // No I18N
            }
        };
        jQuery.extend(meta_data, meta_data_add);
        if (_self.params.disableReqApprovalActions) {
            delete meta_data["approvals_" + id + "_head_chk"]; // No I18N
        } else if (appStatus === "Approved") {  // Remove checkbox for Approved Levels //No I18N
            if ((_self.params.entity_name == "requests" && !isCurrentLevel) || _self.params.entity_name != "requests") {
                delete meta_data["approvals_" + id + "_head_chk"]; // No I18N
            }
        } else if (!isCurrentLevel || _self.params.isCurrentStage != true || (_self.params.approve == false && _self.params.edit == false)) {
            delete meta_data["approvals_" + id + "_head_chk"]; //No I18N
        }

        /* if(_self.params.approve != true){// No I18N
            delete meta_data.delete;
        } */
        _self.appLevelObject = {
            approval_id: id,
            status: appStatus,
            is_current_level: isCurrentLevel,
            is_level_deleted: isLevelDeleted

        }
        return meta_data;
    },
    constructCheckboxCell: function(td, comp) {
        var rd = td.row_data;
        var rdApprId = rd.approver ? rd.approver.id : null;
        var rdApprEmail = rd.approver ? rd.approver.email_id : rd.email ? rd.email : '-';
        var rdApprName = rd.approver ? rd.approver.name : '-';
        var rdOrgRoleName = rd.org_role && rd.org_role.display_name ? rd.org_role.display_name : null;
        if (!td.row_data.deleted) {
            if (comp.params.entity_name == "requests" && !(rd.approver || rd.org_role)) {
                return '<span class="fl ml5"><input type="checkbox" aria-label="Checkbox" data-table-checkbox disabled="true" title="' + getMessageForKey('api.mla.emailaddress.approver.msg') + '"></span>';
            }
            return '<span class="fl ml5"><input type="checkbox" aria-label="Checkbox" value="' + rd.id + '" data-userid="' + rdApprId + '" data-username="' + e_attr(rdApprName) + '" data-usermailid="' + e_attr(rdApprEmail) + '" data-orgrolename= "' + e_attr(rdOrgRoleName) + '" data-actiontaken="' + (rd.action_taken_on ? true : false) + '" data-table-checkbox></span>';
        } else {
            return '<span class="fl ml5 opac5"></span>';
        }
    },
    constructDeleteCell: function(td, comp) {
        var rd = td.row_data;
        var levelName = td.row_data.approval_level ? td.row_data.approval_level.name : ""; //No I18N

        var deleteHTML = '<div align="center" class="delete-iconblk"><button class="btn btn-link btn-xs approvals_delete" title="' + getMessageForKey('common.delete') + '" rel="uitip" data-id=' + rd.id + ' data-levelname="' + e_attr(levelName) + '"><span aria-hidden="true" class="cspr trash icon-sm"></span></button></div>';
        var blank = '<div align="center"></div>';

        if (comp.params.entity_name == "requests") {
            //for request approvals section
            if (comp.params.delete && td.row_data.status.name != "Approved" && td.row_data.status.name != "Rejected" && td.row_data.status.name != "Denied" && !comp.params.isCancelled) {
                return deleteHTML;
            } else {
                return blank;
            }
        } else {
            //for change,release section
            if (!td.head_data.is_non_login && !td.row_data.deleted && ((td.head_data.approve == true) || (td.head_data.approve == false && td.head_data.edit == true && td.row_data.status.name == "To Be Sent"))) {
                return deleteHTML;
            } else {
                return blank;
            }
        }
    },
    constructStatusCell: function(td, comp) {
        var rd = td.row_data;
        var st = rd.status.name;
        //temporary changed Rejected to Denied
        var stall_obj = {
            "To Be Sent": { //No I18N
                "text": getMessageForKey("sdp.approval.status.tobesent"), //No I18N
                "icon": "hide" //No I18N
            },
            "Pending Approval": { //No I18N
                "text": getMessageForKey("sdp.purchase.status.pendingapproval"), //No I18N
                "icon": "hourglass" //No I18N
            },
            "Pending Clarification": { //No I18N
                "text": getMessageForKey("api.approval.clarification.status.name"), //No I18N
                "icon": "hourglass" //No I18N
            },
            "Approved": { //No I18N
                "text": getMessageForKey("sdp.common.status.approved"), //No I18N
                "icon": "success" //No I18N
            },
            "Denied": { //No I18N
                "text": getMessageForKey("sdp.change.approval.rejected"), //No I18N
                "icon": "danger" //No I18N
            }
        };
        var link = "";
        //temporary changed Rejected to Denied
        if ((st === "Approved" || st === "Denied") && (rd.approver && (rd.approver.id == sdp_user.LOGGEDIN_USERID || rd.approver.id == userID)) && comp.isCurrentLevel && !comp.params.isCompletedStage) { //To show the edit icon for logged-in USER
            var editStr = ''; //NO I18N
            if (!td.row_data.deleted && !comp.params.isTrashed && comp.params.entity_name != "requests") {
                editStr = '&nbsp;<span class="cur-ptr">[ ' + getMessageForKey("common.edit") + ' ]</span>'; //NO I18N
            }
            link = '<a class="text-link disp-ib statusaction" data-levelid=' + comp.appLevelObject.approval_id + ' data-id=' + rd.id + '>' + editStr + '</a>'; //NO I18N
        }
        if (td.row_data.deleted) {
            return '<span class="opac5" rel="uitip" title="' + stall_obj[st].text + '"><span class="cspr' + stall_obj[st].icon + ' icon-sm mr3 vsub opac5"></span>' + stall_obj[st].text + link + '</span>'; //NO I18N
        } else {
            return '<span class="cspr ' + stall_obj[st].icon + ' icon-sm mr3 vsub"></span><span rel="uitip" title="' + stall_obj[st].text + '">' + stall_obj[st].text + link + '</span>'; //NO I18N
        }
    },
    constructActTakenCell: function(td, comp) {
        var rd = td.row_data,
            colstr = "-";
        if (!td.row_data.deleted && comp.params.isCurrentStage && (rd.status.name === "Pending Approval" || rd.status.name === "Pending Clarification") && (rd.approver && (rd.approver.id == sdp_user.LOGGEDIN_USERID || rd.approver.id == userID)) && comp.appLevelObject.status != "Approved" && !comp.params.isTrashed && comp.params.to_show_action_button !== false) { //To show the "Take Action" button for logged-in USER
            if ((comp.params.entity_name == "requests" && !comp.params.isCancelled && !disableReqApprovalActions) || (comp.params.entity_name == "changes" && !$rc.printPreview) || (comp.params.entity_name == "releases")) { //Module based checks
                var data_approverlink = comp.params.entity_name == 'requests' ? 'data-approverlink="' + td.row_data.approval_link + '"' : ''; // No I18N
                colstr = '<button class="btn btn-primary btn-sm actiontaken" ' + data_approverlink + ' data-levelid=' + comp.appLevelObject.approval_id + ' data-id=' + rd.id + ' type="button" >' + getMessageForKey("approval.list.takeaction") + '</button>'; // No I18N
            }
        } else if (rd.status.name !== "To Be Sent") { // No I18N
            var value = rd.action_taken_on ? rd.action_taken_on.display_value : "-"; // No I18N
            colstr = td.row_data.deleted ? `<span class="opac5">` + value + `</span>` : value;
        }
        return colstr;
    },
    constructApproverCell: function(td, comp) {
        var rd = td.row_data;

        var additionalInfo = "";

        if (rd.obo_approver != null) {
            //additional info will be obo info
            var args = [e_html(rd.obo_approver.name)];
            var obo = "(" + getMessageForKey("sdp.backupapprover.approver.view.info", args) + ")";
            additionalInfo = obo;
        } else if (rd.approver && rd.approver.name && rd.org_role && rd.org_role.display_name) {
            //additional info will be resolved org role info
            var resolvedRole = " (" + e_html(rd.org_role.display_name) + ")";
            additionalInfo = resolvedRole;
        }

        var rdApprName = (rd.approver && rd.approver.name) || (rd.org_role && rd.org_role.display_name) || (rd.email) || "";
        var rdApprId = (rd.approver && rd.approver.id) || (rd.org_role && rd.org_role.id) || (rd.email) || "";
        if (td.row_data.deleted) {
            return '<div class="text-wrap opac5" rel="uitip" title="' + e_attr(rdApprName) + additionalInfo + '">' + e_html(rdApprName) + additionalInfo + '</div>';
        } else {
            var onclickAction;
            if (comp.params.entity_name == 'requests' && (!rd.approver || $req.sdp_user.USERTYPE != "Technician")) {
                onclickAction = ""; //No I18N
            } else {
                //rd.approver will always be present for other modules
                onclickAction = 'href="/" data-event="click" data-handler="window.NewWindow(\'/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + rdApprId + '&minContent=true\', getMessageForKey(\'sdp.inventory.wsRtPanel.userDetails\'), \'450\', \'500\', \'yes\', \'center\', null, null, null, true);" nonce='+sdpNonce; // No I18N //No I18N
            }

            return '<div class="text-wrap" title="' + e_attr(rdApprName) + additionalInfo + '" rel="uitip" data-approverid=' + rdApprId + '><a ' + onclickAction + '>' + e_html(rdApprName) + additionalInfo + '</a></div>';
        }
    },
    constructSentCell: function(td) {
        var rd = td.row_data;
        if (rd.sent_on != null) {
            if (td.row_data.deleted) {
                return '<div class="opac5">' + rd.sent_on.display_value + '</div>';
            } else {
                return '<div>' + rd.sent_on.display_value + '</div>';
            }
        } else {
            return '-';
        }
    },
    constructCommentsCell: function(td) {
        var value = td.row_data.comments || "-", textString = ""; //No I18N
        if (value.length > 150 || (value.match(/\n/g) || []).length > 0) {
            if (value.length > 150 || (value.match(/\n/g) || []).length > 4) {
                var displayText = e_attr(value).replace(/\n/g, '<br>'); //No I18N
                textString = `<br><a class='text-primary text-lowercase' href='/' rel='noopener noreferrer' data-action-name='show_more_comments' data-msg='` + displayText + `'>`+translate("sdp.common.show") + ` ` + translate("sdp.common.more")+`</a>`; //No I18N
            }
            var charLength = 150;
            if ((value.match(/\n/g) || []).length > 4) {
                charLength = value.split("\n", 3).join("\n").length; //No I18N
            }
            textString = "<span class='text-overflow disp-b mb5 wspace-preline maxh-90px wb-bw'>" + e_html(value.substr(0, charLength > 150 ? 150 : charLength)) + textString + "</span>"; //No I18N
        } else {
            textString = "<div class='wspace-normal wb-bw'>" + e_html(value) + "</div>"; //No I18N
        }
        textString = (td.row_data.deleted) ? "<div class='opac5'>" + textString + "</div>" : textString;
        return textString;
    },
    getApprovalDetails: function(entity, entity_id, approval_level_id, approval_id) {
        var approvalDetail = {};
        var url = '/api/v3/' + entity + '/' + entity_id + '/approval_levels/' + approval_level_id; //No I18N
        sdpAjax({
            url: url,
            success: function(resp) {
                approvalDetail = resp.approval_level;
                approvalDetail.status.name = "Approved"; //No I18N
            },
            async: false
        });
        return approvalDetail;
    }
}
/*Change Multi Approval Level - End*/
