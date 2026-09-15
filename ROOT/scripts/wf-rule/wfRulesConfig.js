// @ts-check

/* Note: $wfRuleUtil is the only variable in workflow_rules.min.js that will be declared in global scope. Other variables present in workflow_rules.min.js
   (refer wfrule.txt), will be kept as a property of $wfRuleUtil if it is required later. Else they will be declared
   inside a Immediately Invoked Function Expression (IIFE) to ensure they are not added to the global scope. */
var $wfRuleUtil = {};

(() => {

    /**
     * @typedef {Object} baseConfig
     * 
     * @property {'business_rules' | 'custom_trigger' | 'pre_rules' | 'post_rules'} rule_type - For rule-type based checks.
     * @property {'during' | 'after'} rule_sub_type - For preRule or postRule based checks.
     * 
     * @property {null | 'incident_request' | 'service_request'} module_type - To filter rules & ruleGroups based on WFGroup.module_type & WFRule.module_type columns.
     * @property {null | 'incident_request_business_rules' | 'service_request_business_rules'} ruleurltype - Modules component routeName for rules. Need to specify this only if this is different from the rulesurl value.
     * 
     * @property {string} keygroupname - i18n key for 'Group-type'. Used in list view & form page. Eg. (Rule Group, Trigger Group).
     * @property {string} keyrulename - i18n key for 'Rule-type'. Used in list view & form page. Eg. (Business Rule, Custom Trigger, During Rule, After Rule).
     * @property {string} keyformname - i18n key for shortened 'Rule-type' name. Used in the list view & form page. Eg. (Rule, Trigger).
     * 
     * @property {boolean} include_events - Displays the 'execute on actions' dropdown in form page if set to true.
     * @property {boolean} has_extended_modules - For is-extended-module based checks.
     * @property {boolean} has_extended_module_filter - If set to true, enables the 'applies for' dropdown in list view page but disables it in the from page. Else, the vice versa happens. However, when has_extended_modules is set to false, the drop down will be hidden in both places.
     * @property {boolean} is_cascade_required - Displays the 'cascade execution' options in form page if set to true.
     * @property {boolean} is_execute_during_not_required - Hides the 'execute during' (operation hours) options in the form page if set to true.
     * 
     * @property {boolean} showAlertIfNoCrit - Displays 'no criteria selected' confirmation during Submit action in form page if set to true.
     * 
     * @property {boolean} skipabort - Hides the 'abort process execution' (negate) option id set to true.
     * @property {boolean} execute_class - **DEPRECATED:** Displays the 'execute class' action in the form page. The action is deprecated and is used only in requestCT, hence this property should not be used anylonger.
     * @property {boolean} groupRolesDollarVarSupported - Displays the group-roles in TO and CC fields of Notification action if set to true.
     * 
     * @property {string} defaultEvent - Default selected value of the 'execute on actions' dropdown in the form page. 
     * @property {number} notifiCount -  Maximum allowed notification action count for the rule in the form page actions.
     */

    /**
     * @typedef {Object} tempRuleConfig
     * 
     * @property {string} module - Rule-Module's entity API path. Eg. (requests, notes).
     * @property {string} module_name - Rule-Module's entity name for module based checks. Eg. (request, note).
     * 
     * @property {string} rulesurl - Rule's entity API path. Eg. (request_business_rules).
     * @property {string} ruleresp - Rule's entity name. Eg. (request_business_rule).
     * @property {string?} groupsurl - RuleGroup's entity API path. Eg. (request_business_rule_groups).
     * @property {string?} groupsresp - RuleGroup's entity name. Eg. (request_business_rule_group).
     * 
     * @property {string?} keyModuleName - i18n key for Rule-Module's name. Used in list view & form page.
     * 
     * @property {object} cf - Custom Function properties for the rule's CF action.
     * @property {string} cf.module - Module name for the Custom Function action.
     * @property {string} cf.route - Route name for the Custom Function action.
     * @property {string} cf.fnName - Function name for the Custom Function action.
     * @property {string} cf.mdObj - Module object key name for the Custom Function action 
     *
     * @property {baseModuleConfig?} baseModuleConfig - Base module properties used in the 'applies for' filter in rules form & list view pages. Eg. base_task is the base module for Task BR & CT.
     */

    /**
     * @typedef {baseConfig & tempRuleConfig} ruleConfig
     */

     /**
      * @typedef {Object} baseModuleConfig
      * @property {string} name - Name of the base module. Eg. base_task
      * @property {string} display_name - Display name of the base module. Eg. 'All task'
      * @property {'-1'} id - Id of the base module. As of now, base module data is not available when constructing 'applies for' filter. Hence a temp ID '-1' is used as -1 is not the ID of any other extended entities.
      *
      */
    
    /** @type baseConfig */
    const preRuleBaseConfig = {

        rule_type: 'business_rules', //No i18n
        rule_sub_type: 'during', //No i18n
        module_type: null,
        ruleurltype: null,

        keygroupname: translate('common.rule.group'),
        keyrulename: translate('sdp.admin.common.rule'),
        keyformname: translate('sdp.requests.fieldFormRules.listview.rule'),

        include_events: true,
        has_extended_modules: false,
        has_extended_module_filter: false,
        is_cascade_required: true,
        is_execute_during_not_required: false,

        showAlertIfNoCrit: true,

        skipabort: false,
        execute_class: false,
        groupRolesDollarVarSupported: true,
        
        defaultEvent: 'created', //No i18n
        notifiCount: 0,

    }

    /** @type baseConfig */
    const postRuleBaseConfig = {

        rule_type: 'custom_trigger', //No i18n
        rule_sub_type: 'after', //No i18n
        module_type: null,
        ruleurltype: null,

        keygroupname: translate('common.trigger.group'),
        keyrulename: translate('sdp.request.externalaction.autoaction'),
        keyformname: translate('sdp.tasks.trigger'),

        include_events: true,
        has_extended_modules: false,
        has_extended_module_filter: false,
        is_cascade_required: true,
        is_execute_during_not_required: false,

        showAlertIfNoCrit: true,

        skipabort: true,
        execute_class: false,
        groupRolesDollarVarSupported: true,

        defaultEvent: 'created', //No i18n
        notifiCount: 0,

    }

    $wfRuleUtil.rulesConfig = {

        /* Request PreRules (Request Timer During Rules) */

        /** @type ruleConfig */
        request_pre_rules: {

            // extends base config of preRules
            ...preRuleBaseConfig,

            module: 'requests', //No i18n
            module_name: 'request', //No i18n

            rule_type: 'pre_rules', //No i18n

            rulesurl: 'request_pre_rules', //No i18n
            ruleresp: 'request_pre_rule', //No i18n

            groupsurl: null,
            groupsresp: null,

            keyrulename: translate('during.rule'),
            keyModuleName: translate('common.request'),

            include_events: false,
            is_cascade_required: false,

            showAlertIfNoCrit: false,

            cf: {'module': 'request', 'route': 'rcf', 'fnName': 'request_function_<id>', 'mdObj':'requestObj'}, //No i18n

            baseModuleConfig: null,

        },

        /* Business Rules Start */

        /** @type ruleConfig */
        businessrules: {

            // extends base config of preRules
            ...preRuleBaseConfig,

            module: 'requests', //No i18n
            module_name: 'request', //No i18n
            module_type: 'incident_request', //No i18n

            rulesurl: 'request_business_rules', //No i18n
            ruleresp: 'request_business_rule', //No i18n

            ruleurltype: 'incident_request_business_rules', //No i18n

            groupsurl: 'request_business_rule_groups', //No i18n
            groupsresp: 'request_business_rule_group', //No i18n

            keyModuleName: translate('common.request'),
            
            cf: {'module': 'request', 'route': 'rcf', 'fnName': 'request_function_<id>', 'mdObj':'requestObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        servicecatalogbrules: {

            // extends base config of preRules
            ...preRuleBaseConfig,

            module: 'requests', //No i18n
            module_name: 'request', //No i18n
            module_type: 'service_request', //No i18n

            rulesurl: 'request_business_rules', //No i18n
            ruleresp: 'request_business_rule', //No i18n
            
            ruleurltype: 'service_request_business_rules', //No i18n

            groupsurl: 'request_business_rule_groups', //No i18n
            groupsresp: 'request_business_rule_group', //No i18n

            keyModuleName: translate('common.request'),
            
            cf: {'module': 'request', 'route': 'rcf', 'fnName': 'request_function_<id>', 'mdObj':'requestObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        notebusinessrules: {

           ...preRuleBaseConfig,
            // extends base config of preRules

            module: 'notes', //No i18n
            module_name: 'note', //No i18n

            rulesurl: 'note_business_rules', //No i18n
            ruleresp: 'note_business_rule', //No i18n

            groupsurl: 'note_business_rule_groups', //No i18n
            groupsresp: 'note_business_rule_group', //No i18n

            keyModuleName: translate('sdp.common.note'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            cf: {'module': 'note', 'route': 'ntcf', 'fnName': 'note_function_<id>', 'mdObj':'noteObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        notificationbusinessrules: {

           ...preRuleBaseConfig,
            // extends base config of preRules

            module: 'notifications', //No i18n
            module_name: 'notification', //No i18n

            rulesurl: 'notification_business_rules', //No i18n
            ruleresp: 'notification_business_rule', //No i18n

            groupsurl: 'notification_business_rule_groups', //No i18n
            groupsresp: 'notification_business_rule_group', //No i18n

            keyModuleName: translate('sdp.admin.workflow.stencil.notification'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            defaultEvent: 'sent_by_tech', //No i18n

            cf: {'module': 'notification', 'route': 'ncf', 'fnName': 'notification_function_<id>', 'mdObj':'notificationObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        cmbusinessrules: {

           ...preRuleBaseConfig,
            // extends base config of preRules

            module: 'cm_base', //No i18n
            module_name: 'cm_base', //No i18n

            rulesurl: 'custom_module_business_rules', //No i18n
            ruleresp: 'custom_module_business_rule', //No i18n

            groupsurl: 'custom_module_business_rule_groups', //No i18n
            groupsresp: 'custom_module_business_rule_group', //No i18n

            keyModuleName: null,

            has_extended_modules: true,
            has_extended_module_filter: true,
            is_execute_during_not_required: true,

            cf: {'module': 'cm_base', 'route': 'cmcf', 'fnName': 'custom_module_function_<id>', 'mdObj':'customModuleObj'}, //No i18n

            baseModuleConfig: null,

        },

        /* Business Rules End */

        /* Request Post Rules (Request Timer After Rules) */

        /** @type ruleConfig */
        request_post_rules: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'requests', //No i18n
            module_name: 'request', //No i18n

            rule_type: 'post_rules', //No i18n

            rulesurl: 'request_post_rules', //No i18n
            ruleresp: 'request_post_rule', //No i18n

            groupsurl: null,
            groupsresp: null,

            keyrulename: translate('after.rule'),
            keyModuleName: translate('common.request'),

            include_events: false,
            is_cascade_required: false,

            showAlertIfNoCrit: false,

            notifiCount: 20,

            cf: {'module': 'request', 'route': 'rcf', 'fnName': 'request_function_<id>', 'mdObj':'requestObj'}, //No i18n

            baseModuleConfig: null,

        },

        /* Custom Triggers Start */

        /** @type ruleConfig */
        customtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'requests', //No i18n
            module_name: 'request', //No i18n

            rulesurl: 'request_custom_triggers', //No i18n
            ruleresp: 'request_custom_trigger', //No i18n

            groupsurl: 'request_custom_trigger_groups', //No i18n
            groupsresp: 'request_custom_trigger_group', //No i18n

            keyModuleName: translate('common.request'),

            execute_class: true,

            notifiCount: 20,

            cf: {'module': 'request', 'route': 'rcf', 'fnName': 'request_function_<id>', 'mdObj':'requestObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        problemcustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'problems', //No i18n
            module_name: 'problem', //No i18n

            rulesurl: 'problem_custom_triggers', //No i18n
            ruleresp: 'problem_custom_trigger', //No i18n

            groupsurl: 'problem_custom_trigger_groups', //No i18n
            groupsresp: 'problem_custom_trigger_group', //No i18n

            keyModuleName: translate('common.newproblem'),

            notifiCount: 20,

            cf: {'module': 'problem', 'route': 'pbcf', 'fnName': 'problem_function_<id>', 'mdObj':'problemObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        releasecustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'release', //No i18n
            module_name: 'release', //No i18n

            rulesurl: 'release_custom_triggers', //No i18n
            ruleresp: 'release_custom_trigger', //No i18n

            groupsurl: 'release_custom_trigger_groups', //No i18n
            groupsresp: 'release_custom_trigger_group', //No i18n

            keyModuleName: translate('common.release'),

            notifiCount: 20,

            cf: {'module': 'release', 'route': 'relcf', 'fnName': 'release_function_<id>', 'mdObj':'releaseObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        notecustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'notes', //No i18n
            module_name: 'note', //No i18n

            rulesurl: 'note_custom_triggers', //No i18n
            ruleresp: 'note_custom_trigger', //No i18n

            groupsurl: 'note_custom_trigger_groups', //No i18n
            groupsresp: 'note_custom_trigger_group', //No i18n

            keyModuleName: translate('sdp.common.note'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            notifiCount: 5,

            cf: {'module': 'note', 'route': 'ntcf', 'fnName': 'note_function_<id>', 'mdObj':'noteObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        notificationcustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'notifications', //No i18n
            module_name: 'notification', //No i18n

            rulesurl: 'notification_custom_triggers', //No i18n
            ruleresp: 'notification_custom_trigger', //No i18n

            groupsurl: 'notification_custom_trigger_groups', //No i18n
            groupsresp: 'notification_custom_trigger_group', //No i18n

            keyModuleName: translate('sdp.admin.workflow.stencil.notification'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            defaultEvent: 'sent_by_tech', //No i18n
            notifiCount: 5,

            cf: {'module': 'notification', 'route': 'ncf', 'fnName': 'notification_function_<id>', 'mdObj':'notificationObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        approvallevelcustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'approval_levels', //No i18n
            module_name: 'approval_level', //No i18n

            rulesurl: 'approval_level_custom_triggers', //No i18n
            ruleresp: 'approval_level_custom_trigger', //No i18n

            groupsurl: 'approval_level_custom_trigger_groups', //No i18n
            groupsresp: 'approval_level_custom_trigger_group', //No i18n

            keyModuleName: translate('common.approvallevel'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            notifiCount: 5,

            cf: {'module': 'approval_level', 'route': 'alcf', 'fnName': 'approval_level_function_<id>', 'mdObj':'approvalLevelObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        approvalcustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'approvals', //No i18n
            module_name: 'approval', //No i18n

            rulesurl: 'approval_custom_triggers', //No i18n
            ruleresp: 'approval_custom_trigger', //No i18n

            groupsurl: 'approval_custom_trigger_groups', //No i18n
            groupsresp: 'approval_custom_trigger_group', //No i18n

            keyModuleName: translate('sdp.change.changedetails.approval'),

            has_extended_modules: true,
            has_extended_module_filter: true,

            notifiCount: 5,

            cf: {'module': 'approval', 'route': 'acf', 'fnName': 'approval_function_<id>', 'mdObj':'approvalObj'}, //No i18n

            baseModuleConfig: null,

        },

        /** @type ruleConfig */
        cmcustomtriggers: {

            // extends base config of postRules
            ...postRuleBaseConfig,

            module: 'cm_base', //No i18n
            module_name: 'cm_base', //No i18n

            rulesurl: 'custom_module_custom_triggers', //No i18n
            ruleresp: 'custom_module_custom_trigger', //No i18n

            groupsurl: 'custom_module_custom_trigger_groups', //No i18n
            groupsresp: 'custom_module_custom_trigger_group', //No i18n

            keyModuleName: null,

            has_extended_modules: true,
            has_extended_module_filter: true,
            groupRolesDollarVarSupported: false,
            is_execute_during_not_required: true,
            
            notifiCount: 5,

            cf: {'module': 'cm_base', 'route': 'cmcf', 'fnName': 'custom_module_function_<id>', 'mdObj':'customModuleObj'}, //No i18n

            baseModuleConfig: null,

        },

        /* Custom Triggers End */

    }

})();

