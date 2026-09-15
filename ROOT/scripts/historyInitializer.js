var initConfig = {
    /**
     * If it's a development build, we'll load the uncompressed files. If it's a production build, we'll load the compressed file
     */
    scriptFiles : (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/ViewHistory.js", "/scripts/historyUrlConfiguration.js", "/scripts/historyOptions.js"] : ["/scripts/history_min.js"], //No I18N
    /**
     * To avoid reloading the script if it is already loaded in the dom based on the configuration
     */
    cacheValue : !sdp_app.IS_DEVELOPMENT_MODE,
    /**
     * This function is used for initializing the component
     * @param {object} options 
     */
    init : function (options) {
        ResourceLoader({
            js : this.scriptFiles,
            cache : this.cacheValue,
            process : "series", //No I18N
            success : function(){
                /**
                 * Extend the 'hbs' object with properties from the 'common' object using jQuery.extend
                 */
                jQuery.extend(options.hbs, options.common);
                /**
                 * Render an Handlebars template with the specified options and inject it into the element with ID 'history_main_container'
                 */
                renderhbs("#history_main_container_"+options.hbs.encoded_module_attr, "view-history", options.hbs, false, "history");  //NO I18N
                
                /**
                 * Extend the 'options' object with properties from the 'common' object using jQuery.extend
                 */
                jQuery.extend(options.history, options.common);
                /**
                 * If 'admin_entity' is defined, set 'diffInPopupFields' to an array containing "description". Otherwise, leave it as is.
                 */
                (options.history.admin_entity) ? options.history.diffInPopupFields = ["description","help_text"] : ""; //NO I18N
                /**
                 * Copy properties from the 'config' method of the '$history' object to 'options'.
                 */
                Object.assign(options.history, $history.config(options.history));
                /**
                 * Initialize WOHistory using the 'options' configuration.
                 */
                $history.initWOHistory(options.history);
                /**
                 * If 'is_new_filter' and 'backtotop' are both true, add a scroll-to-top feature.
                 */
                if(options.history.is_new_filter && options.history.backtotop){
                    $history.addScrollToTop();
                }
            }
        });
    }
}
