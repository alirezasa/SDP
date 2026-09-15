$wfRuleUtil.timerStageRule = {
    /* To render during/after rules list view panel slider.
    * @param forDuring - boolean
    * @param controller - admin.timeractions controller.
    */
    loadRulesPopup:function(forDuring,controller){

        var title = forDuring?translate("during.rules"):translate("after.rules");
        var selected_rule_type = forDuring?"during_rules":"after_rules"; //No i18n
        var table_info = $wfRuleUtil.timerStageRule.getTableInfoObject();//table_comp.getTableInfo(selected_rule_type);
        var rules_popup_selector = "#rules_popup"; //No i18n
        jQuery(rules_popup_selector).attr('data-popup','active').show().panelSlider({
              header: true,
              title,
              width: 1260,top:0,
              placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
              dialogClass: "tabui-rightpanel", // NO I18N
              open: function(){
                if($(rules_popup_selector).hasClass('hide')){ $(rules_popup_selector).removeClass('hide');}
	            $wfRuleUtil.ajaxloaderfn();//ajax loading
                controller.send("callTableComponent",table_info,selected_rule_type); //No i18n
                Ember.set(controller,'redirect_to_rule_listview_popup',true);//Setting this to redirect to list view/timer page if back button is clicked. //No i18n
              },
              close : function(){
                Ember.set(controller,'showNewRule',false);//This will remove the add_timer_rule outlet. //No i18n
                if(!$('#rules-list-view').hasClass('hide')){$('#rules-list-view').addClass('hide');}
                if(!$('#newRule').hasClass('hide')){$('#newRule').addClass('hide');}
                // setting search string as empty as this should not be carry forwarded for next time popup is rendered.
                jQuery("#search-term").val('');
                if(!jQuery("[data-name='clearListSearch']").hasClass('hide')){jQuery("[data-name='clearListSearch']").addClass('hide');}
                // resetting the filter as this should not be carry forwarded for next time popup is rendered.
                Ember.set(controller,'rule_list_filter','unassociated_rules'); //No i18n
                jQuery("#filter_text").text(translate('rules.unassociated'));

                // destroying the rules dialog
                if(!$(rules_popup_selector).hasClass('hide')){$(rules_popup_selector).addClass('hide');}
                $(rules_popup_selector).dialog('destroy');
                // Whenever a popup is opened, the subheader class set will remove the scroll for the parent page. To add back the scroll, need to remove the class in close.
                jQuery('body').removeClass("subheader-of-h");
                jQuery(rules_popup_selector).attr('data-popup','inactive');
              }
          });
    },

    /* Associate rules from rules popup list view.
    * @param controller
    */
    associateRules:function(controller) {

        var selected_rule_type = controller.selected_rule_type;
        var tempSelectedRulesFromListView = controller.get('table_comp_'+selected_rule_type).bulkSelect.selectedRecords;
        if(Object.keys(tempSelectedRulesFromListView).length==0){
            showalert('warning',translate('common.delete.atleastone'),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
            return;
        }
        controller.model.temp_selected_rules=[];
        var existingRules = controller.model.timer_data.stages[controller.selected_stage][selected_rule_type];
        for(var i=0;i<existingRules.length;i++){
            if(tempSelectedRulesFromListView[existingRules[i].rule.id]){
                delete tempSelectedRulesFromListView[existingRules[i].rule.id];
            }
        }
        var tempSelectedRulesFromListViewLength = Object.keys(tempSelectedRulesFromListView).length;
        if(existingRules.length+tempSelectedRulesFromListViewLength>5){
            showalert('warning',translate('timer.max.rules.error',[5]),'isAutoHide=true,delay=4,closeOnEscKey=yes'); //No i18n
            return;
        }
        var selectedRuleSortedArray = Object.keys(tempSelectedRulesFromListView).reverse();

        var newRulesList = [];
        $.each(selectedRuleSortedArray,function(index, selectedRuleID) {//Pushing the newly selected rules in sorted order of id.
            var isEnabled = tempSelectedRulesFromListView[selectedRuleID].is_enabled;
            newRulesList.push({"id":selectedRuleID,"name":tempSelectedRulesFromListView[selectedRuleID].name,"description":tempSelectedRulesFromListView[selectedRuleID].description,"is_enabled":isEnabled})
        });
        this.associatedSelectedRules(controller,newRulesList);
    },
    /* Append the new rules to existing timer stage rule list.
    * @param controller - timer page controller
    * @param newRulesList - list of rule JSON objects which are to be associated to timer stage.
    */
    associatedSelectedRules:function(controller,newRulesList){
            var self = this;
            var existingRules = controller.model.timer_data.stages[controller.selected_stage][controller.selected_rule_type];
            var stage_rule_order = (existingRules && existingRules.length>0)?existingRules[existingRules.length-1].stage_rule_order:0;
            $.each(newRulesList,function(index, newRule) {
                stage_rule_order++;//Incrementing stage rule order for each new rule.
                existingRules.pushObject({"rule":newRule,stage_rule_order,"is_cascade_rule_for_stage": true}); //No i18n
            });
    		setTimeout(function(){
                initTooltip('#timerrules');//To initialize tooltip for stage rule's description after associating from popup. //No i18n
                $.each(newRulesList,function(index, selectedRuleID) {

                    highlightfn($('[data-id='+controller.selected_rule_type+'_'+controller.selected_stage+'_'+selectedRuleID.id+']').get(0),'autoscroll=true,highlight=true'); //No i18n
                });
                /**
                 * Initialize collapsible panels when associating a rule.
                 */
                if(controller.selected_rules_count == 0){
                  self.initCollapsiblePanels(`[data-id=${controller.selected_rule_type}_cp]`);
                }
                Ember.setProperties(controller,{
                 'selected_rule_type': '', //No i18n
                 'selected_rules_count' : 0, //No i18n
                 'selected_stage' : 0}); //No i18n
    		},50);
            $('#rules_popup').dialog('close');
    },
    /**
     * Initializes zohocomponent collapsible panels for a given element ID.
     * @param {string} id 
     */
    initCollapsiblePanels : function(id){
        ZComponents.collapsiblepanels(id, {
            toggleButton: false,
            toggleOnHeaderClick: true,
            className: "visi-parent accordion-log change-approval zcomponents" //No i18n
        });
    },
    /* Uses wfRuleUtil.js getModelForRule method to render the route inside add_timer_rule outlet.
    * @param controller - timer page controller
    * @param ruleid - optional, if ruleid is given, corresponding rule will be displayed. Else, new form page is displayed.
    */
    showRulePage: function(controller,ruleid){
     var _self=this;
     $('#rules_popup').removeClass('hide');
     $wfRuleUtil.ajaxloaderfn(false, function(){
         const params = (controller.selected_rule_type=="during_rules") ? controller.timer_config.during_rules_config.during_rules_params : controller.timer_config.after_rules_config.after_rules_params; //No i18n
         params.rid=ruleid;
         params.gid=null;

         const rulesFormAttrs = {
            params,
            onFormSubmitOrCancel: _self.redirectToRulesPopUp,
            routeName: (controller.selected_rule_type=="during_rules") ? controller.timer_config.during_rules_config.during_rule_route_name : controller.timer_config.after_rules_config.after_rule_route_name, //No i18n
         };

         Ember.set(controller,'rulesFormAttrs', rulesFormAttrs); //No i18n
         Ember.set(controller,'showNewRule',true); //No i18n
         //selected extended module is needed for timer rules part
         Ember.set(controller,'selected_extended_module', controller.extended_modules_data.selected_extended_module); //No i18n
         Ember.run.schedule('afterRender', controller.route_obj, function () { //No i18n

                 if(!$('#rules-list-view').hasClass('hide'))
                 {
                    $('#rules-list-view').addClass('hide');
                 }
                 if($('#newRule').hasClass('hide'))
                 {
                    $('#newRule').removeClass('hide');
                 }
         });
     });

   },
   /* Method invoked from wfRuleUtil.js after save/cancel/update/saveandassociate button is clicked.
   * @param option - save/cancel/update/saveandassociate
   * @param response - Rule API response containing rule JSON.
   */
   redirectToRulesPopUp: function(option,response){
        var timerFormController= Ember.getOwner(this).lookup("controller:admin.timeractions");//This method will be invoked from rulesform controller. So 'this' indicates rulesform controller. //No i18n
        switch(option){
           case "cancel" : { //No i18n
                               if(timerFormController.redirect_to_rule_listview_popup){
                                     var selected_rule_type = timerFormController.selected_rule_type;
                                     var rules_table_component=timerFormController.get('table_comp_'+selected_rule_type);
                                     timerFormController.refreshRulesListView(rules_table_component);
                               }
                               else
                               {
                                 $('#rules_popup').dialog('close');
                               }
                              break;
                            }
           case "save" :  {     var _self=this; //No i18n
                                var ruleList = (timerFormController.newlyAddedRulesList.length>0)?timerFormController.newlyAddedRulesList:[];
                                ruleList.push(response[_self.rdata.modelopt.ruleresp].id);
                                Ember.set(timerFormController,'newlyAddedRulesList',ruleList); //No i18n
                                var selected_rule_type = timerFormController.selected_rule_type;
                                var rules_table_component=timerFormController.get('table_comp_'+selected_rule_type);
                                timerFormController.refreshRulesListView(rules_table_component);

                              break;
                           }
           case "saveAndAssociate" :  {     var _self=this; //No i18n
                                           var ruleList = [];
                                           var addedRule = response[_self.rdata.modelopt.ruleresp];
                                           ruleList.push({"id":addedRule.id,"name":addedRule.name,"description":addedRule.description,"is_enabled":addedRule.is_enabled});
                                           $wfRuleUtil.timerStageRule.associatedSelectedRules(timerFormController,ruleList);
                                         break;
                                      }
           case "update": {   var _self=this; //No i18n
                              $wfRuleUtil.timerAction.updateRuleDetailToStageRules(timerFormController,_self.rdata.options.id,($('[name=radio_enable_head]').is(':checked')) ? true : false, _self.rdata.options.name,_self.rdata.options.description);
                              if(timerFormController.redirect_to_rule_listview_popup){
                                var rules_table_component=timerFormController.get('table_comp_'+timerFormController.selected_rule_type);
                                timerFormController.refreshRulesListView(rules_table_component);
                              }
                              else
                              {
                               $('#rules_popup').dialog('close');
                              }
                            break;

                          }
        }
   },
   /**
   Method to get table info JSONObject as rules list view need not be personalized.
   */
   getTableInfoObject : function() {
     var table_info ={};
     if (jQuery.isEmptyObject(table_info)) {
         var list_info = {};
         list_info.row_count = "10";
         list_info.start_index = "1";
         table_info.list_info = list_info;
     }
     return table_info;
     }
};