/* $Id$ */
var $ProjectSetting = {
    init:function(id){
        $ProjectSetting.loadSettingsForm(id);
    },
    /*
    load project settings tab through jsp
    param1: id || type:long
    */
    loadProjectSettings: function(id){
        if(id == null && document.getElementById('projectid') && document.getElementById('projectid').innerHTML){//No i18N
            id = document.getElementById('projectid').innerHTML;//No i18N
        }
        parent.sdpAjax({
            url: '/project/ProjectSettings.jsp?entityId='+id, // NO I18N
            async: false,
            dataType: "html",   // NO I18N
            success : function(response){ parent.jQuery("#projectSettingsDiv").html(response); }
        });
    },

    /*
    load individual project settings page by using projectid
    param1: projectId || type: long
    */
    loadSettingsForm: function(projectId){
      var urlValue="/api/v3/projects/"+projectId+"/settings";//NO I18N
      var methodType = "GET";//NO I18N
      sdpAjax({
        url: urlValue,
        type: methodType,
        dataType: "json", // No I18N
        acceptODCompatible : true,
        success: function(data) {
            var settings = JSON.parse(data.settings[0].settings);
            settings["non_admin"] = true;// To differentiate global settings and individual project settings
            settings["project_id"] = data.settings[0].project.id;
            data.settings[0].settings = settings;
    		renderhbs("#projectSettingsDiv", "project-settings", data.settings[0], false, "project"); // NO I18N
            fixedformfooter(document.getElementById('projectSettingsDiv'),document.querySelector('#projectSettingsDiv .form-footer'));// NO I18N
            spInit();//Initiate Showpopover
            initTooltip("#projectSettingsDiv");// NO I18N
        },
        error: function(jqXHR, status) {
        	showalert('failure',translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=false'); //No I18N
        }
      	});
    },

    /*
    save settings page by using projectid
    param1: result  || type: json
    */
    saveSettingsForm: function(result){
    	var settingsUrl;
    	var settings = result.settings;
    	var id = result.id;
        var projId = result.project?result.project.id:result.project;
    	for (var key in settings){
    		settings[key] = jQuery('#'+key).prop('checked');
            if (key === 'allow_closing_parent_if_children_open' ){
                settings[key] = !jQuery('#'+key).prop('checked');
            }
    	}
    	var inputJson = {"project_settings":result};//NO I18N
    	var strJson = sdpToJSON(inputJson);
    	if (projId){
    		settingsUrl = "/api/v3/projects/"+projId+"/settings/"+id;// No I18N
    	}
    	else{
    		settingsUrl = "/api/v3/project_settings/"+id;// No I18N
    	}
    	var dataValue = sdpAjaxInputData(strJson);
    	sdpAjax({
    		type: "PUT",//No I18N
    		data:{"input_data":dataValue},//NO I18N
    		url: settingsUrl,
            acceptODCompatible : true,
    		success: function(data) {
    			localSetting = result.settings;
    			showalert('success',translate('project.history.settingsupdated'), 'isAutoHide=true,closeOnEscKey=yes,width=auto,height=80');// NO I18N
    		},
    		error: function(data){showalert('failure', data.responseJSON.response_status.messages[0].message, 'isAutoHide=false');} // No I18N
    	});
    },


     /*
     Resetting settings form by rendering default settings
     param1: result  || type: json
     */
     resetSettingsForm: function(result){
        var defaultSettings = {"strict_project_management":false,"allow_closing_parent_if_children_open":true,"operations_on_closed_status":true,"actual_cost_bottom_up":false,"clear_actual_time_cost_on_reopen":false,"task_dependency_auto_scheduling":false,"estimated_effort_bottom_up":false,"children_auto_close":false,"actual_time_bottom_up":false,"bounded_tasks":false,"top_bottom_auto_scheduling":false, "non_admin": false};// No I18N
        if(result.project && result.project.id){
            defaultSettings["non_admin"] = true;// Individual project settings
        }
        result.settings = defaultSettings;
        renderhbs("#projectSettingsDiv", "project-settings", result, false, "project"); // NO I18N
        fixedformfooter(document.getElementById('projectSettingsDiv'),document.querySelector('#projectSettingsDiv .form-footer'));// NO I18N
        spInit();//Initiate Showpopover
        initTooltip("#projectSettingsDiv");// NO I18N
    },

    /*
    used to check the subSetting automatically when strict project management and task dependency scheduling settings are checked.
    also used to enable/disable the subsetting based on task dependency setting checked.
    param1: elmntId  || type: long
    */
    childControl: function(elmntId) {
        var spmCheckBox = document.getElementById("strict_project_management");
        var tdsCheckBox = document.getElementById("task_dependency_auto_scheduling");
        var btCheckBox = document.getElementById("bounded_tasks");
        var acpCheckBox = document.getElementById("allow_closing_parent_if_children_open");
        var cacCheckBox = document.getElementById("children_auto_close");
        var settingsId = "boundedtask";// NO I18N
        var jSet = jQuery("#"+settingsId);
        var jSet1 = jQuery("#boundedtasklabel");// NO I18N
       if(elmntId === "strict_project_management"){
            if(spmCheckBox && spmCheckBox.checked){
                if(tdsCheckBox && tdsCheckBox.checked && btCheckBox && btCheckBox.checked){
                    jSet.find(":input").prop('disabled', true);// No I18N
                    jSet.removeClass("opac7").addClass("opac7");
                    jSet1.removeClass("cur-na").addClass("cur-na");
                }
                else if(tdsCheckBox && tdsCheckBox.checked){
                    jSet.find(":input").prop('checked', true).prop('disabled', true);// No I18N
                    jSet.removeClass("opac7").addClass("opac7");
                    jSet1.removeClass("cur-na").addClass("cur-na");
                }
            }
            else{
                if(tdsCheckBox && tdsCheckBox.checked && btCheckBox && btCheckBox.checked){
                    jSet.find(":input").prop('disabled', false);// No I18N
                    jSet.removeClass("opac7");
                    jSet1.removeClass("cur-na");
                }
            }
       }
       else if(elmntId === "task_dependency_auto_scheduling"){
            if(tdsCheckBox && tdsCheckBox.checked){
                if(spmCheckBox && spmCheckBox.checked){
                    jSet.find(":input").prop('checked', true).prop('disabled', true);// No I18N
                    jSet.removeClass("opac7").addClass("opac7");
                    jSet1.removeClass("cur-na").addClass("cur-na");
                }
                else if(!(spmCheckBox && spmCheckBox.checked) && !(btCheckBox && btCheckBox.checked)){
                    jSet.find(":input").prop('disabled', false);// No I18N
                    jSet.removeClass("opac7");
                    jSet1.removeClass("cur-na");
                }
            }
            else{
                jSet.find(":input").prop('checked', false).prop('disabled', true);// No I18N
                jSet.removeClass("opac7").addClass("opac7");
                jSet1.removeClass("cur-na").addClass("cur-na");

            }
       }
       else{
            if(elmntId === "children_auto_close" && acpCheckBox && acpCheckBox.checked){
                jQuery("#allow_closing_parent_if_children_open").prop('checked', false);// No I18N
            }
            else if(elmntId === "allow_closing_parent_if_children_open" && cacCheckBox && cacCheckBox.checked){
                jQuery("#children_auto_close").prop('checked', false);// No I18N
            }
       }
    }
};