/* $Id$ */
/*  This file has utility functions required for displaying Change sub entities like notes,reminder,task and worklog.
 */
var change_subEntity = {
    /**
     Loads Remainder section
     */
    loadReminder: function(tabName, tabSetting, tabs_panel){
        var id = jQuery('#content-details-inner-change');
        if(id.find('#addRem').length == 1) {
            id.find('#addRem').remove();
        }
        id.removeClass("oxa");
        $header.invokeReminders({'mode':'list','entity':'change','entity_id':this.id});//No I18N
    },

    /**
     * Loads Notes Common tab
     */
    loadNotesTab: function(tabName, tabSetting, tabs_panel){
        var obj ={};
        obj.additonal_data= this.getNotesTemplateData(tabName, tabSetting, tabs_panel);
        renderhbs("#change_notes_container", "notes_template", obj, false, "change", true);  //NO I18N
        this.loadNotes(tabName, tabSetting, tabs_panel);
    },


    //A function to load task listview in details component.
    renderTask: function(stage) {
        jQuery('#task_listview').html($tasks.loadTasks('list', this.entity_name, this.id, null, this.printPreview? "printView" : null, null, stage ? this.stagesObject[stage].id : null)); // No I18N
        jQuery("#content-details-inner-change").removeClass("oxa");
        if(this.printPreview)
        {
            jQuery(".task-table-list").css("min-height","auto").addClass("p0");// No I18N
        }
        $CS.findElement("#task_listview").trigger("page:load"); //No I18N
    },
    //A function to load worklog listview in details component.
    renderWorkLog: function() {
        jQuery('#worklog_listview').html($tasks.loadWorkLog('list', 'change', this.id, null, null, null, null, null, this.printPreview)); // No I18N
        $CS.findElement("#worklog_listview").trigger("page:load"); //No I18N
    },
}