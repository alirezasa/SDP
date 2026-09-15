/* $Id$ */
/*  This file has utility functions required for displaying Change Planning page.
 */
var change_planning ={

    /**
     Loads Planning details section
     */
    loadPlanningDetailSection: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var options = {skipFields:["descriptive_fields","downtimes","back_out_plan","roll_out_plan","checklist","impact_details","release_scheduled_start","release_scheduled_end","tasks"]}; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);
        _self.loadPlanningDetail(tabName, tabSetting, tabs_panel);

    },
    /**
     * Loads schedule tab
     */
    loadPlanningSchedule: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var options = {skipFields: ["descriptive_fields", "downtimes", "back_out_plan", "roll_out_plan", "checklist", "impact_details", "tasks"]};   // No I18N
        options.skipUDF = true;
        options.container = "Planning_schedule"; // No I18N
        _self.loadReleaseScheduleFields(tabName, tabSetting, tabs_panel, options);
        if(!_self.isNonLogin){
        _self.loadDownTimeSchedule(tabName, tabSetting, tabs_panel);
        }
    },
}