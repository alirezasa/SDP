/* $Id$ */
/*  This file has utility functions required for displaying Change Implementation page.
 */
var change_implementation = {
    /**
     Loads Implementation details section
     */
    loadImplementationDetails: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var options = {skipFields: ["projects","tasks","worklogs"]}; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);
    },
}