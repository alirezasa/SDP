var view_wf = {
    wf_init : function(options){
        var wf_self = this;
        var workflow_id = options.id;
        var wf_module = options.module;
        wf_datas.wf_self = wf_self;
        wf_datas.module = wf_module;
        wf_datas.wf_id = workflow_id;
        wf_datas.mode = "edit"; // No I18N
        wf_datas.is_view = true;
        jQuery("#wf_canvas_loader").html(ajaxBar());
        updateWFViewPortLayout();
        if(wf_module == 'zia-bot') {
            wf_self.init_and_load_zia_workflow();
        } else {
            loadWorkflow();
        }

    },
    /**
     * Function to initialize and load the data required to render the Zia Workflow
    */
    init_and_load_zia_workflow: function() {
        sdpAjax({
            url: '/api/v3/zia_bot_workflows/_get_workflow/expand', success: function (response) {//No I18n
                wf_datas.wf_editor_instance = WorkflowEditorInstance.getInstance();
                ziaBotWFUtil.workflow_data = response;
                var wrapperConfiguration = ziaBotWFUtil.getConfiguration();
                wrapperConfiguration.workflow_data = response;
                loadWorkflow(wrapperConfiguration);
            }
        });
    },
    wf_append_workflow_datas : function(data){
        var wf_data = data.workflow;
        renderhbs("#wf_view_container", "viewWF_header_template", {"wf_name": wf_data.name, "wf_description": wf_data.description, "wf_type": wf_data.type}, false, "change", true, true, setTimeout(function(){ // NO I18N
            jQuery("#wf_canvas_container").find(".btn-edit-node").parent().remove().end().end().find(".btn-notify-option").removeClass("btn-notify-option");
        },300), false);
    },
}