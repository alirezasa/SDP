var $assetQuickAction = {
    init: function(options) {
        var dialog_options = {
            title: options.dialogTitle,
            width: 500,
            height: 200,
            open: function() {
                hierarchySelect2.init({
                    id : options.module+"_dropdown", //No I18N
                    return_value : "api_name", //No I18N
                    entity : "module", //No I18N
                    url : options.url,
                    placeHolder : options.placeHolder,
                    displayField : "display_name", //No I18N
                    list_info : options.list_info
                });
            }
        };
        jQuery("body").append(`<div id="${options.module}_quick_action_container"></div>`);
        renderhbs("#"+options.module+"_quick_action_container","add-quick-action-template",{module:options.module,labelText:options.labelText},false,"quick_actions");// No I18N
        jQuery("#"+options.module+"_quick_save").off('click').on('click',function(){
            $assetQuickAction.quickActionSave(options);
        });
        jQuery("#"+options.module+"_quick_close").off('click').on('click',function(){
            $assetQuickAction.quickActionCancel(options);
        });
        jQuery("#"+options.module+"_entity").sdp_zcomponent_dialog(dialog_options); //No I18N
    },
    quickActionSave: function(options) {
        let getType = jQuery("#"+options.module+"_dropdown").select2("data"); //No I18N
        if(getType){
            let apiPluralName = getType.api_plural_name;
            window.location=`${options.pageUrl}=${apiPluralName}&mode=add`;
        }
        else{
            showalert("failure",options.errorMsg,"isAutoHide=false"); //No I18N
        }
    },
    quickActionCancel: function(options) {
        jQuery("#"+options.module+"_entity").sdp_zcomponent_dialog("close"); //No I18N
    }
}