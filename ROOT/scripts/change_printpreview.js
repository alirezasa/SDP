/* $Id$ */
/*  This file has utility functions required for change print preview.
 */
var change_printpreview ={
    callPrintPreview : function(){
        NewWindowP('/ui/print?entity_id='+this.id+'&module=change&printMode=true','','1100','700','yes','center','yes','yes', null, null, true);// No I18N
    },

    /**
     Returns the metadata for prinpreview to display in top as checkbox
     */
    getPrintableSectionsMeta : function(){
        var print_options = {
            "approval" : { // No I18N
                header_name : translate("sdp.approval.action"), // No I18N
                "default" : true, // No I18N
                renderfunction : this.loadApprovalSection
            },
            "header_panel":{path : "content_panel.header_panel", // No I18N
                "default" : true // No I18N
            },
            "Submission":{ path : "content_panel.tabs_panel.settings.stages.settings.Submission" // No I18N
            },
            "Planning" : { path : "content_panel.tabs_panel.settings.stages.settings.Planning" // No I18N
            },
            "Approval" : { path : "content_panel.tabs_panel.settings.stages.settings.Approval" // No I18N
            },
            "Implementation" : { path : "content_panel.tabs_panel.settings.stages.settings.Implementation" // No I18N
            },
            "UAT":{ path : "content_panel.tabs_panel.settings.stages.settings.UAT" // No I18N
            },
            "Release" : { path : "content_panel.tabs_panel.settings.stages.settings.Release" // No I18N
            },
            "Review" : { path : "content_panel.tabs_panel.settings.stages.settings.Review" // No I18N
            },
            "Close" : { path : "content_panel.tabs_panel.settings.stages.settings.Close" // No I18N
            },
            "roles" : {path : "content_panel.tabs_panel.settings.roles"}, // No I18N
            "tasks" : {path : "content_panel.tabs_panel.settings.tasks"}, // No I18N
            "reminders" : {path : "content_panel.tabs_panel.settings.reminders"}, // No I18N
            "worklogs" : {path : "content_panel.tabs_panel.settings.worklogs"}, // No I18N
            "approvalsummary" : {path : "content_panel.tabs_panel.settings.approvalsummary"}, // No I18N
            "conversations" : {path : "content_panel.tabs_panel.settings.conversations"}, // No I18N
            "history" : {path : "content_panel.tabs_panel.settings.history.settings.history"}, // No I18N
            "status_comments" : {path: "content_panel.tabs_panel.settings.history.settings.status_comments"} // No I18N
        }
        return print_options;
    },
}