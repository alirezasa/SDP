/* $Id$ */
var $rc = jQuery.extend(true,window.ChangeReleaseDetails, (function(){
    return {
         init: function (options) {
             try {
                 //This object helps to find from which page, form is invoked
                 $CRObj.fromPage = "details"; // No I18N
                 //Fix SD-98473
                 jQuery('body').addClass("pos-rel"); // No I18N
                 let _self = this;
                 /* Set the basic properties required for all methods */
                 _self.setProp(options);
                 _self.externalframe = options.externalframe;
                 _self.printPreview = window.print_mode = options.printPreview || false;
                 let isValidUrl = _self.getInitData();
                 if (isValidUrl === false) {
                     $CRObj.redirectTo("release", "list", null, null, "entity_not_exists");// No I18N
                     return false;
                 }
                 _self.moduleName = _self.entity_name.capitalize();
                 let allowedTabObj = _self.getAllowedTabs();
                 let opt = {
                     entity_id: _self.entity_data ? _self.entity_data.id : "", // No I18N
                     module_options: options,
                     printPreview: _self.printPreview,
                     module: _self.entity_name,
                     moduleName: _self.moduleName,
                     $rc: _self,
                     data: {
                         entity_data: _self.entity_data,
                         tabData: _self.tabData,
                         stages: _self.stagesObject,
                         metainfo: _self.metainfo,
                         _links: _self._links,
                         stagePermissions: _self.stagePermissions,
                         sdp_user: sdp_user,
                         system_userid: sdp_user.SYSTEM_USERID.toString()
                     },
                     container: _self.printPreview ? "changeDetails" : "release_detailview", // No I18N
                     afterInitialRender: _self.afterInitialRender,
                     afterRenderfunction: _self.afterRenderRelease,
                     panel_details: {
                         content_panel: {
                             left_panel: {
                                 show: true,
                                 id: "changedetail-stage-tabs" // No I18N
                             },
                             actions_panel: {
                                 show: !_self.printPreview && !_self.externalframe,
                                 left_panel: {
                                     show: true,
                                     dataCallback: this.getActionsTemplateData,
                                     template: "release_actions_menu_template",  // No I18N
                                     template_namespace: "release",   // No I18N
                                     afterRenderfunction: this.afterQuickActionsRender
                                 },
                                 middle_panel: {
                                     show: true,
                                     template: "release_middle_actions_panel_template",  // No I18N
                                     template_namespace: "release",   // No I18N
                                     afterRenderfunction: function () {
                                         spInit();
                                         initTooltip("#actionsBar"); //NO I18N
                                     }
                                 },
                                 right_panel: {
                                     show: true,
                                     template: "release_right_actions_panel_template",  // No I18N
                                     template_namespace: "release",   // No I18N
                                     afterRenderfunction: options.notificationsLength ? this.loadZiaActions : undefined
                                 }
                             },
                             header_panel : {
                                show : true,
                                template: "release_header_template",
                                template_namespace: "release",   // No I18N
                                "class": "headerbar"
                             }, // No I18N
                             details_panel: {show: true},
                             tabs_panel: {
                                 show: true,
                                 name: "release", // No I18N
                                 active: _self.getParentTab(),
                                 tabs: _self.getLeftMenus(),
                                 id: "release_stage", // No I18N
                                 containerId: "changedetail-stage-tabs", // No I18N
                                 template : "release_detail_left_template", // No I18N
                                 template_namespace: "release",   // No I18N
                                 dataCallback: this.getEntitySummary,
                                 afterRenderfunction: this.gotoActiveTab,
                                 settings: {
                                     stages: {
                                         show: true,
                                         name: "stages", // No I18N
                                         type: "tab", // No I18N
                                         template : "release_stages_left_panel_template", // No I18N
                                         template_namespace: "release",   // No I18N
                                         containerId: "stage_tabs", // No I18N
                                         active: _self.getActiveStageTab(),
                                         afterRenderfunction: this.parentTab === "stages" && this.gotoActiveTab, //No I18N
                                         custom: this.parentTab === "stages", //No I18N
                                         childAfterRenderfunction: this.stageTabAfterRender,
                                         settings: {
                                             "submission": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "submission", // No I18N
                                                 custom: true,
                                                 active: _self.getActiveSubTab("submission"), // No I18N
                                                 "tabs": _self.getAllowedTabs("submission").allowedTabs, // No I18N
                                                 header_name: _self.stagesObject.submission ? _self.stagesObject.submission.name : '', // No I18N
                                                 childAfterRenderfunction: this.afterTabRender,
                                                 settings: {
                                                     "details": { // No I18N
                                                     show : true,
                                                     display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                     dataCallback : this.getEntityTemplateData,
                                                     template : "release_details_template", // No I18N
                                                     template_namespace: "release",   // No I18N
                                                     renderfunction : this.loadReleaseDetails
                                                     },
                                                     "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "submission"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show : true,
                                                         display_name : getMessageForKey("approval.approvals"), // No I18N
                                                         containerId : "submission-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show : true,
                                                         display_name : getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "planning": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "planning", // No I18N
                                                 active: _self.getActiveSubTab("planning"), // No I18N
                                                 custom: true,
                                                 "tabs": _self.getAllowedTabs("planning").allowedTabs, // No I18N
                                                 // afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.planning ? _self.stagesObject.planning.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                  "details" : { // No I18N
                                                       show : true,
                                                       display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                       template : "release_planning_details_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadPlanningDetail
                                                  },
                                                  "schedule":{ // No I18N
                                                       show : true,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                         dataCallback: this.loadScheduleData,
                                                         template : "release_schedule_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: $rc.loadDownTimeSchedule
                                                     },
                                                     "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "planning"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "planning-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "implementation": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "implementation", // No I18N
                                                 active: _self.getActiveSubTab("implementation"), // No I18N
                                                 custom: true,
                                                 "tabs": _self.getAllowedTabs("implementation").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.implementation ? _self.stagesObject.implementation.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                  "details" : { // No I18N
                                                       show : true,
                                                       display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                       template : "release_implementation_details_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadStageDetails
                                                  },
                                                    "schedule": { // No I18N
                                                        show: true,
                                                        dataCallback:this.getScheduleTemplateData,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                        template: "release_schedule_tab_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadScheduleDetails
                                                    },
                                                  "tasks" : { // No I18N
                                                       show : true,
                                                       display_name : getMessageForKey("task.title"), // No I18N
                                                       renderfunction: this.renderTask.bind(this, "implementation"),
                                                       template: "release_task_listview_template", // No I18N
                                                       template_namespace: "release"   // No I18N
                                                  },
                                                  "notes" : { // No I18N
                                                       show : true,
                                                       display_name : getMessageForKey("common.notes"), // No I18N
                                                       dataCallback: this.getNotesTemplateData,
                                                       template : "release_notes_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadNotes
                                                  },
                                                  "approvals" : { // No I18N
                                                        show : true,
                                                        display_name : getMessageForKey("approval.approvals"), // No I18N
                                                        containerId : "implementation-tabs-panel_content",  // No I18N
                                                        renderfunction : _self.getApprovals // No I18N
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "testing": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "testing", // No I18N
                                                 active: _self.getActiveSubTab("testing"), // No I18N
                                                 custom: true,
                                                 "tabs": _self.getAllowedTabs("testing").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.testing ? _self.stagesObject.testing.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                  "details" : { // No I18N
                                                       show : true,
                                                       display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                       template : "release_testing_details_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadStageDetails
                                                  },
                                                    "schedule": { // No I18N
                                                        show: true,
                                                        dataCallback:this.getScheduleTemplateData,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N , // No I18N
                                                        template: "release_schedule_tab_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadScheduleDetails
                                                    },
                                                  "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "testing"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "testing-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "UAT": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "UAT", // No I18N
                                                 custom: true,
                                                 active: _self.getActiveSubTab("UAT"),// No I18N
                                                 "tabs": _self.getAllowedTabs("UAT").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.UAT ? _self.stagesObject.UAT.name : '',
                                                 childAfterRenderfunction: this.afterTabRender,
                                                 settings: {
                                                     "details": { // No I18N
                                                         show: true,
                                                         display_name: _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                         template : "release_uat_details_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadStageDetails
                                                     },
                                                     "schedule": { // No I18N
                                                        show: true,
                                                        dataCallback:this.getScheduleTemplateData,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                        template: "release_schedule_tab_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadScheduleDetails
                                                    },
                                                  "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "UAT"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "UAT-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "deployment": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "deployment", // No I18N
                                                 custom: true,
                                                 active: _self.getActiveSubTab("deployment"),// No I18N
                                                 "tabs": _self.getAllowedTabs("deployment").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.deployment ? _self.stagesObject.deployment.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                  "details" : { // No I18N
                                                       show : true,
                                                       display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                       template : "release_deployment_details_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadStageDetails
                                                  },
                                                  "schedule":{ // No I18N
                                                       show : true,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                       dataCallback : this.loadScheduleData,
                                                       template : "release_schedule_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                        renderfunction: this.loadDeploymentSchdule
                                                     },
                                                     "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "deployment"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         afterRenderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "deployment-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "training": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "training", // No I18N
                                                 active: _self.getActiveSubTab("training"), // No I18N
                                                 custom: true,
                                                 "tabs": _self.getAllowedTabs("training").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.training ? _self.stagesObject.training.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                  "details" : { // No I18N
                                                       show : true,
                                                       display_name : _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                       template : "release_training_details_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadStageDetails
                                                  },
                                                    "schedule": { // No I18N
                                                        show: true,
                                                        dataCallback:this.getScheduleTemplateData,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                        template: "release_schedule_tab_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadScheduleDetails
                                                    },
                                                  "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "training"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         afterRenderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "training-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "review": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "review", // No I18N
                                                 custom: true,
                                                 active: _self.getActiveSubTab("review"), // No I18N
                                                 "tabs": _self.getAllowedTabs("review").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.review ? _self.stagesObject.review.name : '',
                                             childAfterRenderfunction : this.afterTabRender,
                                             settings : {
                                                    "details": { // No I18N
                                                        show: true,
                                                        display_name: _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                        template: "release_review_details_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadStageDetails
                                                    },
                                                    "schedule": { // No I18N
                                                        show: true,
                                                        dataCallback:this.getScheduleTemplateData,
                                                        display_name: getMessageForKey("sdp.common.schedule"), // No I18N
                                                        template: "release_schedule_tab_template", // No I18N
                                                        template_namespace: "release", // No I18N
                                                        renderfunction: this.loadReviewDetails
                                                    },
                                                  "tasks" : { // No I18N
                                                       show : true,
                                                       display_name : getMessageForKey("task.title"), // No I18N
                                                       renderfunction: this.renderTask.bind(this, "review"),
                                                       template: "release_task_listview_template", // No I18N
                                                       template_namespace: "release"   // No I18N
                                                  },
                                                  "notes" : { // No I18N
                                                       show : true,
                                                       display_name : getMessageForKey("common.notes"), // No I18N
                                                       dataCallback: this.getNotesTemplateData,
                                                       template : "release_notes_template", // No I18N
                                                       template_namespace: "release",   // No I18N
                                                       renderfunction: this.loadNotes
                                                  },
                                                  "approvals" : { // No I18N
                                                       show : true,
                                                       display_name : getMessageForKey("approval.approvals"), // No I18N
                                                       containerId : "review-tabs-panel_content",  // No I18N
                                                       renderfunction : _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     }
                                                 }
                                             },
                                             "close": { // No I18N
                                                 show: true,
                                                 type: "tab", // No I18N
                                                 section_type: "sub", // No I18N
                                                 internal_name: "close", // No I18N
                                                 active: _self.getActiveSubTab("close"),// No I18N
                                                 custom: true,
                                                 "tabs": _self.getAllowedTabs("close").allowedTabs, // No I18N
                                                 //afterRenderfunction: this.afterTabRender,
                                                 header_name: _self.stagesObject.close ? _self.stagesObject.close.name : '',
                                                 childAfterRenderfunction: this.afterTabRender,
                                                 settings: {
                                                     "details": { // No I18N
                                                         show: true,
                                                         display_name: _self.printPreview ? "" : getMessageForKey("common.details"), // No I18N
                                                         template : "release_close_details_template",  // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadCloseDetails
                                                     },
                                                     "tasks": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("task.title"), // No I18N
                                                         renderfunction: this.renderTask.bind(this, "close"),
                                                         template: "release_task_listview_template", // No I18N
                                                         template_namespace: "release"   // No I18N
                                                     },
                                                     "notes": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("common.notes"), // No I18N
                                                         dataCallback: this.getNotesTemplateData,
                                                         template : "release_notes_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                         renderfunction: this.loadNotes
                                                     },
                                                     "approvals": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("approval.approvals"), // No I18N
                                                         containerId: "close-tabs-panel_content",  // No I18N
                                                         renderfunction: _self.getApprovals
                                                     },
                                                     "status_comments": { // No I18N
                                                         show: true,
                                                         display_name: getMessageForKey("sdp.change.statuscomments"), // No I18N
                                                         dataCallback: this.getStatusComments,
                                                         renderfunction: this.loadStatusComments,
                                                         template : "release_status_comments_tab_template", // No I18N
                                                         template_namespace: "release",   // No I18N
                                                     }
                                                 }
                                             }
                                         }
                                     },
                                     roles: {
                                         show: true,
                                         header_name: getMessageForKey("common.roles"), // No I18N
                                         HTML: '<div id="release_roles"></div>', // No I18N
                                         renderfunction: this.loadRoles,
                                         afterRenderfunction: this.afterTabRender
                                     },
                                     associations: {
                                         show: true,
                                         header_name: getMessageForKey("sdp.project.associations.tabname"), // No I18N
                                         template : "release_module_associations", // No I18N
                                         template_namespace: "release",   // No I18N
                                         dataCallback: this.getAssociationsAccessSummary,
                                         renderfunction: this.loadAssociations,
                                         afterRenderfunction: this.afterTabRender
                                     },
                                     tasks: {
                                         show: true,
                                         header_name: getMessageForKey("task.title"), // No I18N
                                         afterRenderfunction: this.afterTabRender,
                                         renderfunction: this.renderTask.bind(this, null),
                                         template: "release_task_listview_template", // No I18N
                                         template_namespace: "release"   // No I18N
                              },
                              reminders : {
                                show : true,
                                header_name : getMessageForKey("common.allreminder"), // No I18N
                                //href : "/ViewTasks.do?mode=view&RELEASEID="+this.id+"&from=Release", // No I18N
                                renderfunction: this.loadReminder,
                                afterRenderfunction: this.afterTabRender
                              },
                              worklogs : {
                                show : !_self.printPreview,
                                header_name : getMessageForKey("common.worklogs"), // No I18N
                                style : {"min-height":"500px"}, // No I18N
                                renderfunction: this.renderWorkLog,
                                template: "release_worklog_listview_template", // No I18N
                                template_namespace: "release",   // No I18N
                                afterRenderfunction: this.afterTabRender
                              },
                              approvalsummary : {
                                show : true,
                                header_name : getMessageForKey("sdp.change.close.approval.summary"), // No I18N
                                dataCallback : this.getApprovalSummary,
                                template : "release_approval_summary_template", // No I18N
                                template_namespace: "release",   // No I18N
                                afterRenderfunction: this.afterTabRender
                              },
                              conversations : {
                                show : true,
                                header_name : getMessageForKey("sdp.requests.viewrequest.conversations"), // No I18N
                                HTML : "<div id='conversation_section' class='content-section'></div>", // No I18N
                                renderfunction: this.loadConversations,
                                afterRenderfunction: this.afterTabRender
                              },
                              history : {
                                show : true,
                                internal_name: "history",// No I18N
                                display_name : _self.printPreview ? getMessageForKey("common.history") : "", // No I18N
                                type : "tab", // No I18N
                                active : _self.getActiveSubTab("history", "history"), // No I18N
                                afterRenderfunction : this.gotoActiveTab,
                                childAfterRenderfunction : this.afterTabRender,
                                containerId : "history_section", // No I18N
                                id : "history_section", // No I18N
                                tabs : ["history", "status_comments","approval_history"], // No I18N
                                section_type : "sub", // No I18N
                                settings : {
                                  history : {
                                    show : !_self.printPreview,
                                    display_name : getMessageForKey("common.history"), // No I18N
                                    href : "/common/ViewHistory.jsp?id="+this.id+"&module=releases&key=release_history_sort_order&print_view="+_self.printPreview // No I18N
                                  },
                                  status_comments : {
                                    show : !_self.printPreview,
                                    display_name : getMessageForKey("sdp.change.statuscomments"), // No I18N
                                    dataCallback: this.getStatusComments,
                                    renderfunction: this.loadStatusComments,
                                    template : "release_status_comments_tab_template", // No I18N
                                    template_namespace: "release"   // No I18N
                                             },
                                             approval_history: {
                                                 show: !_self.printPreview,
                                                 display_name: getMessageForKey("common.approval.history"), // No I18N
                                                 dataCallback: this.getApprovalHistory,
                                                 renderfunction: this.loadApprovalHistory,
                                                 template : "release_approval_history_template", // No I18N
                                                 template_namespace: "release"   // No I18N
                                             }
                                         }
                                     }
                                 }
                             },
                             right_panel: {
                                 show: !_self.externalframe,
                                 toggle: !_self.externalframe,
                                 "sections": ["properties", "associations"], // No I18N
                                 "settings": { // No I18N
                                     "associations": { // No I18N
                                         show: this.hasAssociationsAccess(),
                                         "class": "form-horizontal form-section inplace-edit pos-rel top0 right0", // No I18N
                                         dataCallback: this.getEntitySummary,
                                         template : "release_association_summary_template", // No I18N
                                         template_namespace: "release"   // No I18N
                                     },
                                     "properties": { // No I18N
                                         show: true,
                                         "class": "form-horizontal form-section inplace-edit pb10 pos-rel top0 right0", // No I18N
                                         HTML: '<div id="right_propertysection"></div> <div id="status_change_form" style="display:none"> </div> <div id="re_change_form" style="display:none"></div> <div id="rm_change_form" style="display:none"></div>',
                                         afterRenderfunction: this.loadRightPropertySection
                                     }
                                 },
                                 afterTogglefunction: function (toggleState) {
                                     if (toggleState === "close") {
                                         jQuery('#listcontrols').removeClass('task-menu-wrap');
                                     } else {
                                         jQuery('#listcontrols').addClass('task-menu-wrap');
                                     }
                                 }
                             }
                         }
                     }
                 };
                 if (allowedTabObj.allowedTabsObjs) {
                     opt.panel_details.content_panel.tabs_panel.settings = jQuery.extend(true, opt.panel_details.content_panel.tabs_panel.settings, allowedTabObj.allowedTabsObjs);
                 }
                 if (_self.printPreview) {
                     let print_details = {};
                     const allAvailableStages = ["submission", "planning", "implementation", "testing", "UAT", "deployment", "training", "review", "close"];// No I18N
                     print_details.print_sections = ["approval", "header_panel", "submission", "roles", "planning", "implementation", "testing", "UAT", "deployment", "training", "review", "close", "associations", "tasks", "worklogs", "approvalsummary", "status_comments"];// No I18N
                     /* check for associations permission */
                     if (!this.hasAssociationsAccess()) {
                         print_details.print_sections.splice(print_details.print_sections.indexOf("associations"), 1);
                     }
                     /* Check worklog permissions */
                     if (!_self.stagePermissions.hasOwnProperty("global") || (_self.stagePermissions.hasOwnProperty("global") && !_self.stagePermissions["global"].edit)) {
                         print_details.print_sections.splice(print_details.print_sections.indexOf("worklogs"), 1);
                     }
                     const urlParams = $CRObj.urlParams;
                     if (!urlParams.hasOwnProperty("approval")) { // No I18N
                         print_details.print_sections.splice(0, 1);
                     }
                     print_details.print_metainfo = this.getPrintableSectionsMeta();
                     opt.print_details = print_details;
                     opt.print_hideFilter = opt.print_hideFooter = !!_self.externalframe;

                     allAvailableStages.forEach(function (stage) {
                         if (!_self.stagesObject.hasOwnProperty(stage)) {
                             print_details.print_sections.splice(print_details.print_sections.indexOf(stage), 1);
                         }
                     });
                 }
                 if (_self.$detailsComp) {
                     _self.$detailsComp.rerenderDetails(opt, this);
                 } else {
                     _self.$detailsComp = new DetailsComponent(opt, this);
                 }
             } catch (e) {
                 console.error(e);
             }
             //Fix - When release's title is updated, then announcement title shows old data only
             jQuery("#announceDialogDiv").remove();

         },
         rightPanelOwnerChange:function(field,form,event){
            if (!(((event.originalEvent && event.originalEvent.firedBy === 'user_api') || event.firedBy === 'user_api'))&&($se.rules&&$se.rules!=""&&Object.keys($se.rules).length!=0)) {
            setTimeout(function(){
              $rc.right_changed_values = JSON.parse(sdpToJSON(form.getChangedValues()));;
              FC.submit(form.form)
            },500);
            }
         },
         afterRenderRelease: function () {
             setTimeout(function () {
                 if ($rc.printPreview) {
                     jQuery('#preview-panel z-collapsiblepanel div.zcollapsiblepanel__header').addClass('ptr-ev-none'); // No I18N
                 }
             }, 1000);
         },
         callPrintPreview: function () {
             NewWindowP('/ui/print?entity_id=' + this.id + '&module=release&printMode=true', '', '1100', '700', 'yes', 'center', 'yes', 'yes');// No I18N
         },
         getPrintableSectionsMeta: function () {
             return {
                 "approval": { // No I18N
                     header_name: getMessageForKey("sdp.approval.action"), // No I18N
                     "default": true, // No I18N
                     renderfunction: this.loadApprovalSection
                 },
                 "header_panel": { //NO I18N
                     path: "content_panel.header_panel", // No I18N
                     "default": true // No I18N
                 },
                 "submission": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.submission" // No I18N
                 },
                 "planning": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.planning" // No I18N
                 },
                 "implementation": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.implementation" // No I18N
                 },
                 "testing": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.testing" // No I18N
                 },
                 "UAT": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.UAT" // No I18N
                 },
                 "deployment": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.deployment" // No I18N
                 },
                 "training": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.training" // No I18N
                 },
                 "review": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.review" // No I18N
                 },
                 "close": { //NO I18N
                     path: "content_panel.tabs_panel.settings.stages.settings.close" // No I18N
                 },
                 "roles": {path: "content_panel.tabs_panel.settings.roles"}, // No I18N
                 "associations": {path: "content_panel.tabs_panel.settings.associations"}, // No I18N
                 "tasks": {path: "content_panel.tabs_panel.settings.tasks"}, // No I18N
                 "reminders": {path: "content_panel.tabs_panel.settings.reminders"}, // No I18N
                 "worklogs": {path: "content_panel.tabs_panel.settings.worklogs"}, // No I18N
                 "approvalsummary": {path: "content_panel.tabs_panel.settings.approvalsummary"}, // No I18N
                 "conversations": {path: "content_panel.tabs_panel.settings.conversations"}, // No I18N
                 "history": {path: "content_panel.tabs_panel.settings.history.settings.history"}, // No I18N
                 "status_comments": {path: "content_panel.tabs_panel.settings.history.settings.status_comments"} // No I18N
             };
         },
         hashChange: function () {
             let hashURL = window.location.hash;
             if (hashURL !== null && hashURL !== "") {  // No I18N
                 hashURL = hashURL.substr(1);
                 this.gotoActiveTab("", "", {"active": hashURL}); // No I18N
             }
         },
         getAllowedTabs: function (stage) {
             const _self = this;
             let allowedTabs = [], stageTabs = {};
             const allowed_stages = Object.keys(_self.stagesObject);
             if (allowed_stages.indexOf(stage) > -1) {
                 stageTabs = {
                     "submission": ["details", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "planning": ["details", "schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "implementation": ["details","schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "testing": ["details","schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "UAT": ["details","schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "deployment": ["details", "schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "training": ["details","schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "review": ["details","schedule", "tasks", "notes", "approvals", "status_comments"], // No I18N
                     "close": ["details", "tasks", "notes", "approvals", "status_comments"] // No I18N
                 };
                 let all_allowedTabs = stageTabs[stage];
                 if (_self.printPreview) {
                     allowedTabs.push(all_allowedTabs[0]);
                     if (stage === "planning" || stage === "deployment") { // No I18N
                         allowedTabs.push(all_allowedTabs[1]);
                     }
                 } else {
                     allowedTabs = all_allowedTabs;
                 }
             } else if (stage === "history") { // No I18N
                 allowedTabs = ["history", "status_comments", "approval_history"]; // No I18N
             }
             return {allowedTabs: allowedTabs};
         },
         /**
          * On click handling for all Actions
          */
         invokeActions: function (actionName) {
             let _self = this;
             switch (actionName) {
                 case "send_notification" :    // No I18N
                     let user_fetch = {};
                     user_fetch.url = _self.base_url + "/" + _self.id + '/release_requester';    //No I18N
                     user_fetch.lookup_field = 'release_requester';   //No I18N
                     user_fetch.search_keys = ['email_id'];   //No I18N
                     $notification_popup.openNotificationForm({
                         template_type: "Notify_Release",   //No I18N
                         type: "notify_release",   //No I18N
                         module: _self.entity_name,
                         module_id: _self.id,
                         afterNotificationSent: function () {
                             $rc.$convComp && $rc.$convComp.reinitialize();
                         },
                         user_fetch: user_fetch,
                         imgParameters: {module: _self.entity_name + "_notification", withURL: false, noForm: true}  //No I18N
                     });
                     break;
                 case "note" :   // No I18N
                     _self.initConversationForQuickAddNote();
                     break;
                 case "impact_details":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#planning/details"), function () {   // No I18N
                         setTimeout(function () {
                             $rc.$impact_details_PC.showEditTemplate();
                         }, 100);
                     });
                     break;
                 case "roll_out_plan":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#planning/details"), function () {   // No I18N
                         setTimeout(function () {
                             $rc.$roll_out_plan_PC.showEditTemplate();
                         }, 100);
                     });
                     break;
                 case "back_out_plan":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#planning/details"), function () {   // No I18N
                         setTimeout(function () {
                             $rc.$back_out_plan_PC.showEditTemplate();
                         }, 100);
                     });
                     break;
                 case "checklist":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#planning/details"), function () {   // No I18N
                         setTimeout(function () {
                             $rc.$checklist_PC.showEditTemplate();
                         }, 100);
                     });
                     break;
                 case "review":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#review/details"), function () {   // No I18N
                         setTimeout(function () {
                             $rc.$review_stageData_PC.showEditTemplate();
                         }, 100);
                     });
                     break;
                 case "associations":   // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#associations"));  // No I18N
                     break;
                 case "reminders": // No I18N
                     $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#reminders"));  // No I18N
                     break;
                 case "worklogs": // No I18N
                     jQuery('[aria-label="Actions"]').parent().removeClass("open");
                     $tasks.loadWorkLog('form', 'release', _self.id); //NO I18N
                     break;
                 case "addtask":// No I18N
                     jQuery('[aria-label="Actions"]').parent().removeClass("open");
                     $tasks.loadTasks('form', 'release', _self.id); //NO I18N
                     break;
             }
         },
         /**
          * Get all permissions required to show Actions
          */
         getActionsTemplateData: function () {
             let _self = this;
             let permissions = {};
             if (_self._links) {
                 _self._links.edit && _self._links.edit.put && _self.stagePermissions["submission"] && _self.stagePermissions["submission"].edit && (permissions.canEditEntity = true);
                 _self._links.notes && _self._links.notes.post && (permissions.canAddNote = true);
                 _self._links["delete"] && _self._links["delete"]["delete"] && (permissions.canDeleteEntity = true);
             }
             if (window.hasOwnProperty("$CRObj") && window.$CRObj.loadedRecords) {
                 let index;
                 //Find the next and prev release id with the loaded data in listview
                 index = window.$CRObj.loadedRecords.indexOf(_self.id);
                 if (index !== -1) {
                     let nextIndex = index + 1;
                     let prevIndex = index - 1;
                     (nextIndex !== window.$CRObj.loadedRecords.length) && (permissions.nextId = window.$CRObj.loadedRecords[nextIndex]);
                     (prevIndex !== -1) && (permissions.prevId = window.$CRObj.loadedRecords[prevIndex]);
                 }
                 //If the details page is refreshed or release is newly added, need not show navigation
                 if (window.$CRObj.loadedRecords.length > 1 && index !== -1) {
                     permissions.navigation = true;
                 }
             }

             permissions.canAddReminder = _self.stagePermissions["global"] && _self.stagePermissions["global"].edit;
             permissions.canAddTask = _self.getCommonTaskEditPermission(_self.permissionsArray);
             permissions.canAddWorklog = _self.stagePermissions["global"] && _self.stagePermissions["global"].edit;

             permissions.canUpdateDescriptiveField = _self.stagePermissions["planning"] && _self.stagePermissions["planning"].edit;
             permissions.canAddReview = _self.stagePermissions["review"] && _self.stagePermissions["review"].edit;

             _self._links && _self._links.close_completed && (permissions.close_complete = _self._links.close_completed);
             _self._links && _self._links.close_cancelled && (permissions.close_cancel = _self._links.close_cancelled);

             _self._links && _self._links.make_announcement && _self._links.make_announcement.post && (permissions.canMakeAnnouncement = true);
             _self._links && _self._links.notifications && _self._links.notifications.post && (permissions.canSendNotification = true);

             _self._links && _self._links.changes && _self._links.changes.post && (permissions.canAssociateChanges = true);
             _self._links && _self._links.projects && _self._links.projects.post && (permissions.canAssociateProjects = true);

             _self._links && _self._links.restore_from_trash && _self._links.restore_from_trash.put && (permissions.canRestoreEntity = true);

             return {"allowed_actions": permissions};   // No I18N
         },
         /**
          * Pre-data to construct release details template
          */
         getEntityTemplateData: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             let stageName = tabs_panel.internal_name;
             let stagePermission = _self.stagesObject[stageName];
             _self.entityFields = {
                 canEdit: stagePermission.canEdit && !_self.printPreview
             };
             return _self.entityFields;
         },
         /**
          * Loads Release Submission details tab
          */
         loadReleaseDetails: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             _self.getTemplateInfo(_self.entity_data.template.id);
             _self.constructTemplateInfo("submission");// No I18N
             /* Loads draft section */
             // Draft api is reverted. so loadDraftSection call is commented for phase 1
             //_self.loadDraftSection();
             /* Loads description panel section */
             _self.loadDescriptionSection(tabName, tabSetting, tabs_panel);
             /* Load Release details using FC */
             _self.loadEntityFields(tabName, tabSetting, tabs_panel);
         },
         /**
          * Loads Drafts section in submission details tab
          */
         loadDraftSection: function () {
             let _self = this;
             _self.drafts = {
                 loadDrafts: function () {
                     let templateData = {};
                     templateData.drafts = this.getDrafts();
                     templateData.data = _self;
                     templateData.display_name = getMessageForKey("request.draft");
                     renderhbs('#drafts_container','release_draft_template', templateData, false, 'release'); //No I18N
                 },
                 getDrafts: function () {
                     let drafts = [];
                     sdpAjax({
                         url: _self.base_url + "/" + _self.id + "/drafts", // No I18N
                         success: function (resp) {
                             if (resp.response_status && resp.response_status[0].status === "success") {
                                 drafts = resp.drafts;
                             }
                         },
                         async: false
                     });
                     return drafts;
                 },
                 deleteDraft: function (id) {
                     if (confirm(getMessageForKey("sdp.common.mail.draft.delete.confirm"))) {
                         sdpAjax({
                             url: _self.base_url + "/" + _self.id + "/drafts/" + id, // No I18N
                             type: "DELETE", //No I18N
                             success: function (resp) {
                                 if (resp.response_status && resp.response_status.status === "success") {
                                     _self.drafts.loadDrafts();
                                 }
                             },
                             async: false
                         });
                     } else {
                         return false;
                     }
                 }
             }
             _self.drafts.loadDrafts();
         },
         /**
          * Loads details tab of Development/Testing/UAT/Deployment/Training/Review
          */
         loadStageDetails: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
        _self.initStageDataDetails(tabName, tabSetting, tabs_panel);
        _self.loadAttachmentField(tabName, tabSetting, tabs_panel);
      },

        loadScheduleDetails: function(tabName, tabSetting, tabs_panel) {
            var _self = this;
            _self.initStageSchedule(tabName, tabSetting, tabs_panel);
        },

        loadDeploymentSchdule: function(tabName, tabSetting, tabs_panel) {
            var _self = this;
            _self.initStageSchedule(tabName, tabSetting, tabs_panel);

            $rc.loadDownTimeSchedule(tabName, tabSetting, tabs_panel);
        },


        /**
         * Initializes the stage schedules api based rendering sections
         */
        initStageSchedule: function(tabName, tabSetting, tabs_panel) {
            let _self = this;
            let requiredfields = ["scheduled_start_time", "scheduled_end_time", "actual_start_time", "actual_end_time"]; // No I18N
            let column_count = "2";
            let stageId = _self.stagesObject[tabs_panel.internal_name].id;
            let stageName = tabs_panel.internal_name;
            let container = "#" + stageName + "_schedule";

            let sd = {
                base_url: _self.base_url + "/" + _self.id + "/stage_data",
                entity_name: "stage_data", // No I18N
                display_name: getMessageForKey('sdp.release.stagedata'),
                stageId: stageId,
                stageName: stageName,
                entitydata: _self.getStageData(stageId),
                canEdit: (_self.stagePermissions[stageName].edit && !_self.printPreview) || false
            };

            /* Printpreview handling for stage data details*/
            sd.hasStagedata = _self.printPreview ? !(jQuery.isEmptyObject(sd.entitydata) || (!sd.entitydata.scheduled_start_time && !sd.entitydata.scheduled_end_time && !sd.entitydata.actual_start_time && !sd.entitydata.actual_end_time && !sd.entitydata.description)) : true,
                sd.hasStageScheduleData = _self.printPreview ? (sd.entitydata.scheduled_start_time || sd.entitydata.scheduled_end_time || sd.entitydata.actual_start_time || sd.entitydata.actual_end_time) : true,
                sd.hasStageDescription = _self.printPreview ? (sd.entitydata.description != null) : true


            sd.id = sd.entitydata && sd.entitydata.id ? sd.entitydata.id : null;
            _self.getMetaInfo(sd.base_url, sd);

            renderhbs(container, 'stage_schedule', sd, false, 'release'); //no i18n

            sd.initFC = function(mode) {

                /* Destroy the old instances */
                _self["$" + stageName + "_stageData_FC"] && _self["$" + stageName + "_stageData_FC"].destroy();
                /* Hide other sections which is in edit mode */
                _self.hidePanelEditor();
                /* Show/hide block edit icon */
                if (mode == "edit") {
                    jQuery('[data-id="blockEditStageFields"]').hide();
                } else {
                    jQuery('[data-id="blockEditStageFields"]').show();
                }

                var postSuccess = function(data) {
                    sd.entitydata = jQuery.extend(true, {}, data["stage_data"]);
                };
                sd.template = _self.constructTemplate(requiredfields, column_count);
                var configJSON = {
                    entitydata: !jQuery.isEmptyObject(sd.entitydata) ? sd.entitydata : null,
                    template: sd.template,
                    metadata: sd.metainfo,
                    entityName: sd.display_name,
                    container: stageName + "_stagedata_schedule", // No I18N
                    canEdit: sd.canEdit,
                    mode: mode,
                    formid: sd.stageName + sd.entity_name,
                    edit: {
                        inline: {
                            pre: _self.hidePanelEditor
                        }
                    },
                    save: {
                        url: sd.id ? sd.base_url + "/" + sd.id : sd.base_url, //NO I18N
                        entity: "stage_data", //No I18N
                        type: sd.id ? "PUT" : "POST", //No I18N
                        serializer: function(payload, form) {
                            payload["stage_data"].stage = {
                                id: stageId
                            };
                        },
                        postsuccess: function(data, form) {
                            postSuccess(data);
                            sd.id = data.stage_data.id;
                            form.options.save.url = sd.base_url + "/" + sd.id; //NO I18N
                            form.options.save.type = "PUT";
                        }
                    },
                    afterRenderCallback: function(form) {
                        jQuery("#" + form.container).find(".form-footer").addClass("mb15");
                    }
                };
                if (mode == "edit") {
                    configJSON.save = {
                        url: sd.id ? sd.base_url + "/" + sd.id : sd.base_url, //NO I18N
                        entity: "stage_data", //No I18N
                        type: sd.id ? "PUT" : "POST", //No I18N
                        submit: true,
                        cancel: "$rc." + stageName + "_stage_data.cancelForm", // No I18N
                        serializer: function(payload, form) {
                            payload["stage_data"].stage = {
                                id: stageId
                            };
                        },
                        postsuccess: function(data, form) {
                            postSuccess(data);
                            _self[stageName + "_stage_data"].initFC("view"); // No I18N
                        }
                    };
                }
                var instance = "$" + stageName + "_stageData_FC";
                _self[instance] = _self.initFormComponent(configJSON);
            };


            sd.cancelForm = function() {
                _self[stageName + "_stage_data"].initFC('view'); // No I18N
            };

            //Initialize both form and panel component for stage data
            sd.initFC();
            _self[stageName + "_stage_data"] = sd;
        },
      /**
       * Initializes the stage_data api based rendering sections
       */
      initStageDataDetails: function(tabName, tabSetting, tabs_panel){
        let _self = this;
             let stageId = _self.stagesObject[tabs_panel.internal_name].id;
             let stageName = tabs_panel.internal_name;
             let container = "#" + stageName + "_stagedata";

             let sd = {
                 base_url: _self.base_url + "/" + _self.id + "/stage_data",
                 entity_name: "stage_data",// No I18N
                 display_name: getMessageForKey('sdp.release.stagedata'),
                 stageId: stageId,
                 stageName: stageName,
                 entitydata: _self.getStageData(stageId),
                 canEdit: (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview) || false
             };

             /* Print preview handling for stage data details*/
             sd.hasStagedata = _self.printPreview ? !(jQuery.isEmptyObject(sd.entitydata) || (!sd.entitydata.scheduled_start_time && !sd.entitydata.scheduled_end_time && !sd.entitydata.actual_start_time && !sd.entitydata.actual_end_time && !sd.entitydata.description)) : true;
             sd.hasStageDescription = _self.printPreview ? (sd.entitydata.description !== null) : true;

             sd.id = sd.entitydata && sd.entitydata.id ? sd.entitydata.id : null;
             _self.getMetaInfo(sd.base_url, sd);

             renderhbs(container, 'release_stage_data_template', sd, false, 'release'); //No I18N

             sd.initFC = function (mode) {

                 /* Destroy the old instances */
                 _self["$" + stageName + "_stageData_FC"] && _self["$" + stageName + "_stageData_FC"].destroy();
                 /* Hide other sections which is in edit mode */
                 _self.hidePanelEditor();
                 /* Show/hide block edit icon */
                 if (mode === "edit") {
                     jQuery('[data-id="blockEditStageFields"]').hide();
                 } else {
                     jQuery('[data-id="blockEditStageFields"]').show();
                 }

                 let postSuccess = function (data) {
                     sd.id = _self["$" + stageName + "_stageData_PC"].id = data["stage_data"].id;
                     _self["$" + stageName + "_stageData_PC"].url = sd.base_url + "/" + sd.id;
                     sd.entitydata = jQuery.extend(true, {}, data["stage_data"]);
                 };
             };

             sd.initPanelComponent = function () {
                 let opt = {};
                 opt.id = sd.id;
                 opt.name = "stagedata_desc"; //No I18N
                 opt.base_url = _self.base_url + "/" + _self.id; //No I18N
                 opt.entity = sd.entity_name;
                 opt.lookup_entity = "stage_data";    //No I18N
                 opt.data = sd.entitydata;
                 opt.metainfo = sd.metainfo;
                 opt.canEdit = sd.canEdit;
                 opt.expand = true;
                 opt.display_name = sd.metainfo.fields.description.display_name;
                 opt.container = stageName + "_stagedata_description"; // No I18N
                 opt.detailsHbsTemplate = {
                     template: "release_description_template", //No I18N
                     namespace: "release" //No I18N
                 };
                 opt.inlineImagesEntity = _self.entity_name + "_stage_data";  //No I18N
                 opt.attachment = false;
                 opt.parentDivHeight = "320px"; // No I18N
                 opt.parentDivWidth = "100%"; // No I18N
                 opt.panel = {
                     pre_edit: function () {
                         sd.initFC();
                     }
                 };
                 opt.save = {
                     serializer: function (payload, pc) {
                         payload.stage = {id: stageId};
                         return payload;
                     },
                     postsuccess: function (data, pc) {
                         sd.id = pc.id = data.id;
                         //appending the latest image token to img src since data is re-rendered
                         data.description = appendImageToken(data.description, data.image_token);
                     }
                 };
                 let instance = "$" + stageName + "_stageData_PC";
                 _self[instance] = new PanelComponent(opt);
             };

             sd.cancelForm = function () {
                 _self[stageName + "_stage_data"].initFC('view');   // No I18N
             };

             //Initialize both form and panel component for stage data
             if (sd.hasStagedata) {
                sd.hasStageDescription && sd.initPanelComponent();
             }
             _self[stageName + "_stage_data"] = sd;
         },
         /**
          * Get stage data from stage_data api
          */
         getStageData: function (stageId) {
             let _self = this;
             let stageData = {};
             let inputObject = {
                 "list_info": { //NO I18N
                     "search_criteria": { //NO I18N
                         "field": "stage.id", //NO I18N
                         "value": stageId, //NO I18N
                         "condition": "is" //NO I18N
                     },
                     "fields_required": ["scheduled_start_time", "scheduled_end_time", "actual_start_time", "actual_end_time", "description", "stage_data_updated_on", "stage_data_updated_by"] //NO I18N
                 }, include: ["image_token"] //NO I18N
             };
             sdpAjax({
                 url: _self.base_url + "/" + _self.id + "/stage_data", // No I18N
                 data: sdpAjaxInputData(inputObject),
                 success: function (resp) {
                     if (resp.response_status && resp.response_status[0].status === "success") {
                         resp.stage_data.length === 1 && (stageData = resp.stage_data[0]);
                         if (stageData && stageData.image_token) {
                             stageData.description = appendImageToken(stageData.description, stageData.image_token);
                         }
                     }
                 },
                 async: false
             });
             return stageData;
         },
         /**
          * Get Attachment fields in a stage
          * Return Promise
          */
         getAttachmentFields: function (stageId) {
             let _self = this;
             let inputObject = {
                 "list_info": { //NO I18N
                     "search_criteria": { //NO I18N
                         "field": "stage.id", //NO I18N
                         "value": stageId, //NO I18N
                         "condition": "is" //NO I18N
                     }
                 }
             };
             return new Promise(function (resolve) {
                 sdpAjax({
                     url: _self.base_url + "/" + _self.id + "/attachment_fields", // No I18N
                     data: sdpAjaxInputData(inputObject)
                 }).then(function (resp) {
                     if (resp.response_status && resp.response_status[0].status === "success") {
                         resolve(resp.attachment_fields);
                     }
                 });
             });
         },
         /**
          * Render attachment field section
          */
         loadAttachmentField: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             const stageId = _self.stagesObject[tabs_panel.internal_name].id;
             const stageName = tabs_panel.internal_name;
             //Check if user has permission to add attachments in attachment field section
             const canEdit = (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview) || false;
             /* Load attachment fields section */
             let renderAttachment = function (field) {
                 var option = {
                     id: field.id,
                     name: field.internal_name,
                     data: field,
                     canEdit: canEdit,
                     attachment: {
                         titleText: _self.metainfo.fields[field.internal_name].display_name ? _self.metainfo.fields[field.internal_name].display_name : getMessageForKey("sdp.common.attachments"),
                         container: field.internal_name,
                         showNoattachment: !!(_self.isTrashed || !canEdit)
                     }
                 };
                 _self.$attachmentFieldPC = _self.initAttachmentField(option, stageId);
             };

             _self.getAttachmentFields(stageId)
                 .then(function (data) {
                     jQuery.each(data, function (i, field) {
                         jQuery("#" + stageName + "_attachmentfields").append('<div id=' + field.internal_name + ' class="mb30"></div>');

                         if (field.has_attachments) {
                             sdpAjax({
                                 url: _self.base_url + "/" + _self.id + "/attachment_fields/" + field.id // No I18N
                             }).then(function (data) {
                                 if (data.response_status && data.response_status.status === "success"){
                  renderAttachment(data.attachment_field);
                }
              });
            }
            else{
              /* Hide Attachment fields if not attachments in print preview*/
              if(!_self.printPreview){
                field.attachments = [];
                renderAttachment(field);
              }
            }

          });
        });
      },
      /**
       * Initialises the Panel component for rendering attachment fields sections
       */
      initAttachmentField: function(option,stageId){
        let _self = this;
             let opt = {};
             opt.name = "attachmentFields"; //No I18N
             opt.base_url = _self.base_url + "/" + _self.id; //No I18N
             opt.entity = "attachment_fields"; //No I18N
             opt.lookup_entity = "attachment_field";    //No I18N
             opt.canEdit = false;
             opt.detailsHbsTemplate = {
                 template: "release_description_template", //No I18N
                 namespace: "release" //No I18N
             };
             opt.description = false;
             opt.parentDivHeight = "320px"; // No I18N
             opt.parentDivWidth = "100%"; // No I18N
             opt.save = {
                 serializer: function (payload, pc) {
                     payload.stage = {id: stageId};
                 },
                 postsuccess: function (data, pc) {
                     // sd.id = pc.id = data.id;
                 }
             };
             jQuery.extend(true, opt, option);
             return new PanelComponent(opt);
         },
         /**
          * Loads review stage details sections
          */
         loadReviewDetails: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             let stageName = tabs_panel.internal_name;
             let stagePermission = _self.stagePermissions[stageName];
             //Destroy the old instance
             _self.$next_review_on && _self.$next_review_on.destroy();
             /* FC for next review on field */
             _self.getTemplateInfo(_self.entity_data.template.id);
             let template = _self.constructTemplateInfo(stageName, ["next_review_on"], 1);// No I18N
             template.style_properties = {};
             let configJSON = {
                 template: template,
                 entitydata: jQuery.extend(true, {}, _self.entity_data),
                 metadata: jQuery.extend(true, {}, _self.metainfo),
                 container: "next_review_on",// No I18N
                 formid: "release_next_review_on_form", //No I18N
                 canEdit: (!_self.printPreview && stagePermission.edit) || false,
                 linkedFields: [{
                     fields: ["next_review_on"], //NO I18N
                     denote_field: ["next_review_on"], //NO I18N
                     message: getMessageForKey("sdp.reports.errmsg.invalidtimedateexception"), //NO I18N
                     validation: function (valueJson) {
                         return !(valueJson.next_review_on && valueJson.next_review_on < new Date());
                     }
                 }],
                 save: {
                     postsuccess: function (data){
                if(_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)){
                  _self.reinitDetailsComponent();
                }else{
                  _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                }
              }
            },
            afterRenderCallback: function(form){
                jQuery("#"+form.container).find('[data-id="form-inner-wrapper"]').css("width", "50%").end()
                    .find(".col-group").addClass("fw");
                if(_self.printPreview){
                  form.emptyFields.includes("next_review_on") ? jQuery("#next_review_on").hide() : (setTimeout(function(){  // No I18N
                    jQuery("#"+stageName+"_print_nodata").hide();
                  },10));
                }
            }
        };
        _self.$next_review_on = _self.initFormComponent(configJSON);
        /* Load stage data */
            _self.loadScheduleDetails(tabName, tabSetting, tabs_panel);
         },
         getCommonTaskEditPermission: function (permissions) {
             /* Here stage id is compared instead of stage index. Need to change logic if stage reorder is allowed */
             let currentStage = $rc.entity_data.stage;
             for (let stageId in permissions) {
                 if (stageId >= currentStage.id && permissions[stageId].edit) {
                     return true;
                 }
             }
             return false;
         },
         /**
          * returns weather user has access to associations
          */
         hasAssociationsAccess: function () {
             return !($rc._links['changes'] === undefined && $rc._links['projects'] === undefined);
         },
         /**
          * returns summary of associations access
          */
         getAssociationsAccessSummary: function () {
             let associations_summary = {};
             associations_summary.canViewChanges = associations_summary.canEditChanges = !($rc._links['changes'] === undefined);
             if (associations_summary.canViewChanges) {
                 associations_summary.canViewChanges = !($rc._links['changes']['get'] === undefined);
                 associations_summary.canEditChanges = !($rc._links['changes']['post'] === undefined);
             }
             associations_summary.canViewProjects = associations_summary.canEditProjects = !($rc._links['projects'] === undefined);
             if (associations_summary.canViewProjects) {
                 associations_summary.canViewProjects = !($rc._links['projects']['get'] === undefined);
                 associations_summary.canEditProjects = !($rc._links['projects']['post'] === undefined);
             }

             return associations_summary;
         },
         /**
          * Render Close stage details section
          */
         loadCloseDetails: function (tabName, tabSetting, tabs_panel) {
             /* In close Details, previously when closure code is updated, description is mandatory.
           * Now it is changed as description is not mandatory for updating closure code
           * So, commented the previous functionlity */

             let _self = this;
             let stageName = tabs_panel.internal_name;
             let stagePermission = _self.stagePermissions[stageName];
             /* FC for Closure code on field */
             _self.getTemplateInfo(_self.entity_data.template.id);
             let template = _self.constructTemplateInfo(stageName, ["closure_code"], 1);// No I18N
             template.style_properties = {};

             let configJSON = {
                 template: template,
                 entitydata: jQuery.extend(true, {}, _self.entity_data),
                 metadata: jQuery.extend(true, {}, _self.metainfo),
                 container: "closurecode",// No I18N
                 formid: "release_closure_code_form", //No I18N
                 canEdit: (!_self.printPreview && stagePermission.edit) || false,
                 save: {
                     postsuccess: function (data) {
                         if (_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)) {
                             _self.reinitDetailsComponent();
                         } else {
                             _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                         }
                     }
                 },
                 afterRenderCallback: function (form) {
                     jQuery("#" + form.container).find('[data-id="form-inner-wrapper"]').css("width", "50%").end()
                         .find(".col-group").addClass("fw");
                     if (_self.printPreview) {
                         let hasCloseDetails = form.entitydata.close_details.description === null
                         form.emptyFields.includes("closure_code") && jQuery("#closurecode").hide();  // No I18N
                         if (hasCloseDetails && form.emptyFields.includes("closure_code")) {
                            jQuery("#close_details").html('<p class="tc text-muted">' + getMessageForKey('sdp.dashboard.addtodashboard.label.notavailable') + '</p>');  // No I18N
                         }
                     }
                 }
             };
             _self.$closure_code_FC = _self.initFormComponent(configJSON);
             /* Panel component for close details */
             let opt = {};
             opt.id = _self.entity_data.close_details.id;
             opt.name = "close_details";
             //using descriptive field api for updating description of close details since both the inline images api as well the description update api should contain same path
             opt.base_url = _self.base_url + "/" + _self.id; //No I18N
             opt.entity = "descriptive_fields"; //No I18N
             opt.lookup_entity = "descriptive_field"; //No I18N
             opt.display_name = _self.metainfo.fields["close_details"].display_name;
             opt.canEdit = (!_self.printPreview && stagePermission.edit) || false;
             opt.container = "closedetails"; // No I18N
             opt.detailsHbsTemplate = {
                 template: "release_review_close_details", // No I18N
                 namespace: "release" // No I18N
             };
             opt.data = _self.entity_data["close_details"];
             opt.parentDivHeight = "320px"; // No I18N
             opt.parentDivWidth = "100%"; // No I18N
             opt.image_url = "/" + _self.entity_data.close_details.id + "/images"; // No I18N
             opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";   // No I18N
             opt.save = {
                 serializer: function (payload) {
                     //removing image tokens if any, from description img src
                     if (payload.description) {
                         payload.description = $rc.removeImageToken(payload.description);
                     }
                     return payload;
                 },
                 postsuccess: function (data, pc) {
                     //appending the latest image token to img src since data is re-rendered
                     data.description = appendImageToken(data.description, data.image_token);
                     if (_self.checkIfpageNeedsRefresh(data, _self.entity_data)) {
                         _self.reinitDetailsComponent();
                     } else {
                         pc.data = data["close_details"];
                         _self.entity_data = data;
                     }
                 },
             };
             opt.attachment = {
                 entity_id: _self.entity_data.close_details.id,
                 base_url: _self.base_url + "/" + _self.id, //No I18N,
                 entity: "descriptive_fields", // No I18N
                 container: "close_details_attachment" //No I18N
             }
             _self.$close_details_PC = new PanelComponent(opt);

         },
         /**
          * Get pre schedule data to construct template
          */
         loadScheduleData: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             let stageName = tabs_panel.internal_name;
             let downtimeObj = {
                 base_url: _self.base_url + "/" + _self.id + "/downtimes",
                 entity_name: "downtime",// No I18N
                 display_name: getMessageForKey('sdp.change.deployment.details'),
                 tableHolder: tabSetting && tabSetting.id ? tabSetting.id : "downtimes" // No I18N
             };
             _self.getLinks(downtimeObj.base_url, downtimeObj);
             downtimeObj.stage = stageName;
             if (stageName === "deployment") {
                 downtimeObj.canAdd = false;
                 downtimeObj.isdeployment= true;
                 downtimeObj.canEdit = !_self.printPreview && (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.edit && downtimeObj._links.edit.hasOwnProperty("put") && (_self.activeStage === stageName));
                 downtimeObj.canCopy = !_self.printPreview && (downtimeObj._links && downtimeObj._links.copy_scheduled_to_actual && downtimeObj._links.copy_scheduled_to_actual.hasOwnProperty("put")); //No I18N
             } else if (stageName === "planning") { // No I18N
                 downtimeObj.canAdd = !_self.printPreview && (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.add && downtimeObj._links.add.hasOwnProperty("post") && (_self.stagesObject[stageName].state === "in_progress" || _self.stagesObject[stageName].state === "upcoming"));
                 downtimeObj.canEdit = !_self.printPreview && (_self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && downtimeObj._links.edit && downtimeObj._links.edit.hasOwnProperty("put") && (_self.stagesObject[stageName].state === "in_progress" || _self.stagesObject[stageName].state === "upcoming"));
             }
             _self.downtime = downtimeObj;
             return downtimeObj;
      },
           getAllDowntimes: function(downtimeObj,callback){
                       let _self=this;
              var downtimes = {};
              sdpAjax({
                  url: _self.base_url + "/" + _self.id + "/downtimes", // No I18N
                  type: "GET", // No I18N
                  success: function(resp){
                      if(resp.response_status && resp.response_status[0].status == "success"){
                        callback(resp.downtimes);
                      }
                  },
                  async: false
              });
              return downtimes;
          },
      loadReminder: function(tabName, tabSetting, tabs_panel){
        let id = jQuery('#content-details-inner-release');
             if (id.find('#addRem').length === 1) {
                 id.find('#addRem').remove();
             }
             id.removeClass("oxa");
             $header.invokeReminders({'mode': 'list', 'entity': 'release', 'entity_id': this.id});//No I18N
         },
         /**
          * Loads Roles panel section
          */
         loadRoles: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             let rolesInSubmission = [];
             let r = _self.roles;
             r.initFC = function (mode) {
                 /* Destroy the old instance*/
                 _self.$roles_FC && _self.$roles_FC.destroy();
                 r.canEdit = _self.stagePermissions["global"] && _self.stagePermissions["global"].edit && !_self.printPreview && !_self.isTrashed;
                 renderhbs("#" + _self.entity_name + "_roles", "release_roles_template", r, false, "release", true);  //NO I18N
                 /* Show/hide block edit icon */
                 if (mode === "edit") {
                     jQuery('[data-id="blockEditRolesFields"]').hide();
                 } else {
                     jQuery('[data-id="blockEditRolesFields"]').show();
                 }

                 let roleLayoutName = (_self.entity_name === "change") ? "Role_Layout" : "role";  //No I18N
                 _self.getTemplateInfo(_self.entity_data.template.id);
                 let column_count = 2;
                 let options = {setRolesInputDataCallback: true, metainfo: _self.metainfo.fields.roles.fields};
                 let template = _self.constructTemplateInfo(roleLayoutName, null, column_count, options);
                 let metadata = r.constructRolesMetainfo();
                 let rolesData = r.constructRolesData();
                 //Remove color customization and label placement applied in template
                 template.style_properties = null;
                 //Append inactive roles by checking metainfo, to the roles template
                 let inactiveRoles = $releaseForm.checkInactiveRoles(rolesData.roles, metadata.fields, template.layouts[0]);
                 inactiveRoles && template.layouts[0].sections.push(inactiveRoles);
                 let configJSON = {
                     entitydata: rolesData,
                     template: template,
                     metadata: jQuery.extend(true, {}, _self.metainfo),
                     container: "change_roles",  // No I18N
                     formid: "release_roles_form",  // No I18N
                     canEdit: r.canEdit,
                     mode: mode,
                     edit: {
                         defaults: {
                             lookup: {
                                 placeholder: translate('sdp.change.sla.select'),
                             }
                         },
                          fields: {
                              multi_select: {
                                  formatResult: function(item) { // Overriden formatResult method to display toolTip
                                      return _self.formatResultForToolTip(item);
                                  },
                                  processResults:function(search_data,data,field){ // Overriden processResult to retrieve desired results in toolTip
                                      search_data.push(_self.processResultsForToolTip(data));
                                  }
                              },
                              lookup: {
                                  formatResult: function(item) { // Overriden formatResult method to display toolTip
                                      return _self.formatResultForToolTip(item);
                                  },
                                  processResults:function(search_data,data,field){ // Overriden processResult to retrieve desired results in toolTip
                                      search_data.push(_self.processResultsForToolTip(data));
                                  }
                              }
                          }
                     },
                     /*Inline save*/
                     save: {
                         url: _self.base_url + "/" + _self.id,//NO I18N
                         entity: _self.entity_name,
                         serializer: "$rc.roles.serializeRolesDataForAPI", //No I18N
                         postsuccess: function (data) {
                             _self.reinitDetailsComponent();
                         }
                     },
                     afterRenderCallback: function (form) {
                         jQuery("#" + form.container).find(".section-title").addClass("pl0").removeClass("font-medium1");  //NO I18N
                         initTooltip("#" + _self.entity_name + "_roles"); //No I18N
                     }
                 };

                 /* Roles block edit options*/
                 if (mode === "edit") {
                     configJSON.save = {
                         url: _self.base_url + "/" + _self.id,//NO I18N
                         entity: _self.entity_name,
                         serializer: "$rc.roles.serializeRolesDataForAPI", //No I18N
                         submit: true,
                         cancel: "$rc.roles.cancelForm",   // No I18N
                         postsuccess: function (data) {
                             _self.reinitDetailsComponent();
                         }
                     };
                     configJSON.afterRenderCallback = function (form) {
                         jQuery("#" + form.container).find('[data-name="multiselecttemplate"]').hide();
                         jQuery("#" + form.container).find(".section-title").addClass("pl0");
                     };
                 }
                 _self.$roles_FC = _self.initFormComponent(configJSON);
             };
             // combine roles metainfo in submission and roles metainfo for change
             r.constructRolesMetainfo = function () {
                 let defaultFields = _self.metainfo.fields;
                 let roleMetainfo = jQuery.extend(true, {}, defaultFields.roles);
                 jQuery.each(rolesInSubmission, function (i, role) {
                     roleMetainfo.fields[role] = defaultFields[role];
                 });
                 return roleMetainfo;
             };
             r.cancelForm = function () {
                 _self.roles.initFC('view');   // No I18N
             };

             r.serializeRolesDataForAPI = function (payload, form) {
                 const entityData = jQuery.extend(true, {}, _self.entity_data);
                 payload[_self.entity_name].roles = $releaseForm.serializeRolesDataForAPI(payload[form.options.save.entity].roles, entityData);
             };

             r.constructRolesData = function () {
                 const entityData = jQuery.extend(true, {}, _self.entity_data);
                 entityData.roles = $releaseForm.serializeRolesDataForFC(entityData.roles, _self.metainfo.fields.roles.fields);
                 return entityData;
             };
             r.initFC("view");   // No I18N
         },
         // To get field properties from Release Template used.
         copyTemplateProperties: function (stageName, field) {
             let _self = this;
             const layoutToSearch = _self.getLayout(stageName);                 // Gets layout details for respective stage.
             return this.getFieldProperties(layoutToSearch.sections, field);   // Sections of layout is subject to field search to get respective field property.
         },
         // To get the layout of a particular stage from its Release Template.
         getLayout: function (stageName) {
             let _self = this;
             let templateDetailsCopy = _self.getTemplateInfo(_self.entity_data.template.id); // Retrieves Template Information.
             let layoutsDetailsCopy = templateDetailsCopy.layouts;                          // Retrieves layouts details.
             for (let i = 0, len = layoutsDetailsCopy.length; i < len; i++) {
                 if (layoutsDetailsCopy[i].name && layoutsDetailsCopy[i].name === stageName) {
                     return layoutsDetailsCopy[i];                                          // Returns Stage layout details from layouts information.
                 }
             }
         },
         // To get field properties from layout sections, if existing.
         getFieldProperties: function (sections, field) {
             let propertiesData = {};
             for (let i = 0, len = sections.length; i < len; i++) {
                 for (let j = 0, flen = sections[i].fields.length; j < flen; j++) {
                     if (sections[i].fields[j].name === field)                              // If key field is found in section, get mandatory property value.
                     {
                         propertiesData["mandatory"] = sections[i].fields[j].mandatory;      // TODO: Add further properties, if required.
                         return propertiesData;
                     }
                 }
             }
         },
      openWizard:function(change_fields){
         var _self = this;
         var template = _self.constructGeneralTemplate();
         _self.$status_stage_FC && _self.$status_stage_FC.destroy();
        const requiredFields = ["stage","status","comment"];   // No I18N
        let mandatory = false;
        //Get mandatory value for the comment field
        _self.template.layouts[0].sections[0].fields.forEach(function(field){
          if(field.name === "comment"){
            mandatory = field.mandatory;
          }
        });
        const column_count = "2";

        const callbackFields = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
        const fieldsProperty = {
            stage : {
              mandatory : true,
              input_data_Callback: callbackFields.stage,
              sort: false,
                disabled:!_self.stagePermissions.global.approve
            },
            status : {
              mandatory : true,
              input_data_Callback: callbackFields.status,
              sort: false
            },
            comment : {
              mandatory : false,
              disabled : true
            }
        };
        const stageTemplate = _self.constructTemplate(requiredFields,column_count,fieldsProperty,mode);
        stageTemplate.layouts[0].sections[0].attributes=null;
        stageTemplate.layouts[0].sections[0].help_text=null;
        stageTemplate.layouts[0].sections[0].id="3";
        stageTemplate.layouts[0].sections[0].name="General";
        stageTemplate.layouts[0].sections[0].stage=null;
         var fields=[];template.layouts[0].sections.forEach((val)=>{val.fields.forEach(val=>{fields.push(val.name)})});
         if(_self.entity_data.hasOwnProperty("site")){
                 _self.entity_data.site = _self.entity_data.site ? _self.entity_data.site : {"id":-1,"name":translate('common.site.nosite')};//NO I18N
             }
             var skipEditFields = ["site", "group","stage","status"]; // No I18N
         if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.contains('ViewInventoryWS')==false){
                 skipEditFields.push("assets");
             }
         ChangeReleaseForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);
         var template_fields = template.layouts[0].sections[0].fields;
             for(var i=0; i<template_fields.length;i++){
                 var field = template_fields[i];
                 if(field.name === 'sla_violation'){
                     field.custom_render = ()=>{
                         return (_self.entity_data.sla_violation === null)? "-" : (_self.entity_data.sla_violation ? getMessageForKey('sdp.change.submission.yes') + '<img align="absmiddle" class="overdue-icon2 vtop ml5" src="/images/spacer.gif" hspace="2" title="'+e_attr(translate(sdp.dashboard.slaviolated))+'">' : e_html(translate('sdp.change.submission.no')));//No i18n
                     }
                 }
                 if(field.name === 'comment'){
                     field.mandatory=false;
                 }
             }


                if(sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.contains('ViewInventoryWS')==false){
                    skipEditFields.push("assets");
                }
                if(_self.metainfo.fields.configuration_items && _self.metainfo.fields.configuration_items.hasOwnProperty("editable") && !_self.metainfo.fields.configuration_items.editable){
                    skipEditFields.push("configuration_items");
                }

            var skipFields = [ "title"];  //No I18N
            var templateClone=jQuery.extend(true,{},template);
            templateClone.layouts.pop();
            templateClone.layouts.push(stageTemplate.layouts[0]);
            if($rc&&$rc._links.edit && $rc._links.edit.put && !$rc._links.edit.put.non_editable_fields.includes("stage") ){
                skipEditFields=skipEditFields.filter(item => item !== "stage");  //No I18N
            }
            if($rc&&$rc._links.edit && $rc._links.edit.put && !$rc._links.edit.put.non_editable_fields.includes("status") && ($rc.stagePermissions[$rc.activeStage].edit || $rc.stagePermissions[$rc.activeStage].approve)){
                skipEditFields=skipEditFields.filter(item => item !== "status");  //No I18N
            }
            if(jQuery("#release_wizard")&&jQuery("#release_wizard").length==0){
                jQuery("body").append(`<div id="release_wizard"></div>`);
            }
         var configJSON = {
                 template: templateClone,
                 entitydata: jQuery.extend(true,{},_self.entity_data),
                 metadata: jQuery.extend(true,{},_self.metainfo),
                 container: "release_wizard",// No I18N
                 formid:"release_popup_wizard",// No I18N
                 editExceptions: ["site", "group"], // No I18N
                 skipEditFields: skipEditFields,
                 skipFields: skipFields,
                 mode: "edit",// No I18N
                 allowedValuesCallback: "$rc.getAllowedValues",//NO I18N
                 ffr:{
                   id:template.id,
                   enable:true,
                   skipOnload:true,
                   afterOnLoad:function(form){
                     for(let i=0,n=change_fields.tracker.length;i<n;i++){
                            $se.form[change_fields.tracker[i].event].apply($se.form,change_fields.tracker[i].param);
                     };
                     for (field in change_fields.current_value){
                        if((field.indexOf("udf_")!=-1&&$se.form.metadata.fields.udf_fields.fields[field.split(".")[1]]&&$se.form.metadata.fields.udf_fields.fields[field.split(".")[1]].type=="datetime")||($se.form.metadata.fields[field]&&$se.form.metadata.fields[field].type=="datetime")){
                            change_fields.current_value[field]=change_fields.current_value[field]&&change_fields.current_value[field].value?change_fields.current_value[field].value:change_fields.current_value[field];
                        }
                         $se.form.setFieldValue(field,change_fields.current_value[field]);
                     };
                   },
                   entity:"RELEASE",//No i18n
                   toggleMode:(form,event,mode)=>{
                     if(mode=="view"){
                        $rc.entityFields.initFC('edit');// No I18N
                        return false;
                     }
                  }
                 },
                 dependentFields: [{
                     fields: ["category", "subcategory", "item"],    //No I18N
                     order: true
                 }, {
                     fields: ["stage", "status"],  //No I18N
                     order: true
                 }],
                 linkedFields : [
                    {
                        fields : ["scheduled_start_time","scheduled_end_time"], //NO I18N
                        denote_field : ["scheduled_start_time"], //NO I18N
                        message : getMessageForKey("api.validation.scheduledstart.scheduledend"), //NO I18N
                        validation: function(valueJson)
                        {
                            if(valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time)
                            {
                                return false;
                            }

                            return true;
                        }
                    },
                    {
                    fields : ["created_time"], //NO I18N
                        denote_field : ["created_time"], //NO I18N
                        message : getMessageForKey("api.validation.createdtime.currenttime"), //NO I18N
                        validation: function(valueJson)
                        {
                            if(valueJson.created_time > new Date())
                            {
                                return false;
                            }

                            return true;
                        }
                    },
                    {
                        fields : ["created_time","completed_time"], //NO I18N
                        denote_field : ["completed_time"], //NO I18N
                        message : getMessageForKey("api.validation.completedtime.createdtime"), //NO I18N
                        validation: function(valueJson)
                        {
                            if(valueJson.completed_time && valueJson.created_time > valueJson.completed_time)
                            {
                                return false;
                            }

                            return true;
                        }
                    }],
                 edit: {
                     fields: {
                         services:{
                             placeholder:translate('sdp.change.sla.select')
                         },
                         assets:{
                             selection_icon_class:"hide"//NO I18N
                         },
                         configuration_items:{
                             selection_icon_class:"hide"//NO I18N
                         },
                         stage:{
                            allowClear:false
                         },
                         status:{
                            allowClear:false
                         },
                        description: {
                            images_api: true,
                            images_url: "/api/v3/" + _self.metainfo.plural_name+"/"+$rc.entity_data.id+ "/images"//NO I18N
                         }
                     },
                     inline: {
                         pre: _self.hidePanelEditor,
                         services: {
                             post: function() {
                                 if(_self.$entityFields_FC) {
                                     _self.$entityFields_FC.fields.services.renderasHTML = false;
                                     _self.$entityFields_FC.fields.services.hideCheckbox = false;
                                     delete _self.$entityFields_FC.fields.services.renderField;
                                 }
                             }
                         }
                     },
                     defaults: {
                         lookup:{
                             placeholder:translate('sdp.change.sla.select')
                         }
                     },
                     onchange: {
                        status:function(field, form)
                        {
                            if(mandatory){
                            form.addMandatoryField("comment");//NO I18N
                            }
                          form.fields.comment.disabled = !(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1);
                        }
                    }
                 },
                 save: {
                     pre: function (payload, formcomp, event, promise) {
                        let old_pl = JSON.parse(sdpToJSON(payload));
                        let current_changing_fields = Object.keys(payload[formcomp.entity]);
                        let roleIDs = Object.keys(formcomp.metadata.fields.roles.fields);
                        let roleID = "";
                        formcomp.options.save.url = _self.base_url + "/" + _self.id; // No I18N
                        formcomp.options.save.type = "PUT";
                        if (!payload.release.roles&&(current_changing_fields.indexOf( "release_engineer")>-1 || current_changing_fields.indexOf( "release_manager")>-1)) {
                            payload.release = {
                                "roles": {} // No I18N
                            };
                        }
                        current_changing_fields.forEach(field => {
                            let userDetails = old_pl[formcomp.entity][field];
                            if (field === "release_engineer" || field === "release_manager") {
                                formcomp.options.save.type = "PUT";
                                if (field === "release_engineer") { // No I18N
                                    roleID = roleIDs[1];
                                    payload.release.roles[roleID] = userDetails;
                                } else if (field === "release_manager") { // No I18N
                                    roleID = roleIDs[0]; 
                                    payload.release.roles[roleID] = userDetails;
                                }
                                let entityData = jQuery.extend(true, {}, _self.entity_data);
                                payload[_self.entity_name].roles = $releaseForm.serializeRolesDataForAPI(payload[formcomp.options.save.entity].roles, entityData);
                            }
                            else {
                                payload[_self.entity_name][field] = old_pl[formcomp.entity][field];
                            }
                        });
                    },
                     submit: true,
                     postsuccess:function(data){
                         jQuery("#announceDialogDiv").remove();

                            this.fields.services.custom_render = _self.renderAssetCIField;
                            this.fields.services.renderField = _self.renderAssetCIShowMoreComponent;
                            this.fields.services.renderasHTML = true;
                            this.fields.services.hideCheckbox = true;
                            jQuery("#release_wizard").dialog("close");// No I18N
                            _self.reinitDetailsComponent();
                     },
                     cancel: function(fc){
                       jQuery("#release_wizard").dialog("close");// No I18N
                     },
                     onsave: function (payload) {
                        payload = payload || {};
                        if ($rc.right_changed_values) {
                            payload = jQuery.extend($rc.right_changed_values, payload);
                        }
                        return payload;
                     }
                 }

             };
             _self.wizardFC = _self.initFormComponent(configJSON);
             jQuery("#release_wizard").dialog({
                 width:1100,
                 height: 700,
                 position:  { my: "top", at: "top", of: window },//No i18n
                 modal: true,
                 top:100,
                 title:"#"+$rc.entity_data.id+" Edit",
                 resizable: true,
                 closeOnEscape: true,
                 close:function() {
                         $rc.wizardFC.destroy();
                 }});
    },
      loadRightPropertySection: function(mode="view",field){      //No I18N
          if(!["view","edit","new"].includes(mode)){
            mode="view";//No i18n
          }
             let _self = this;
             let requiredFields = ["id", "status", "workflow", "template", "release_engineer", "release_manager", "scheduled_end_time"];   // No I18N
             let roleIDs = Object.keys(_self.metainfo.fields.roles.fields);
             let fieldsProperty = {
                 id: {
                     custom_render: function () {
                         return '<p class="form-control-static">RL-' + e_html(_self.entity_data.id) + '</p>'; // No I18N
                     }
                 },
                 status: {
                     custom_render: function () {
                         let obj = {
                             stage: _self.entity_data.stage.name,
                             status: _self.entity_data.status.name,
                             canEdit: !!(_self._links.edit && _self._links.edit.put && !_self._links.edit.put.non_editable_fields.includes("status") && !_self.isTrashed),   // No I18N
                             $rc: _self
                         }
                         return renderhbs(null, "release_right_panel_stage_status_template", obj, false, "release", true, true, null, true);  //NO I18N
                     }
                 },
                 workflow: {
                     // Fix-96612, general workflow is listed for emergency template while search
                     input_data_Callback: function (urlOptions, input_data, searchText) {
                         if (_self.entity_data.emergency) {
                             input_data.list_info.search_criteria = {
                                 "field": "type", //No I18N
                                 "condition": "is",       //No I18N
                                 "value": "Emergency",       //No I18N
                                 "children": [       //No I18N
                                     {
                                         "field": "name",      //No I18N
                                         "condition": "like",      //No I18N
                                         "values": [      //No I18N
                                             searchText
                                         ],
                                         "logical_operator": "and"      //No I18N
                                     }
                                 ]
                             };
                             return input_data;
                         } else {
                             return input_data;
                         }
                     }
                 },
                 release_manager: this.copyTemplateProperties("role", "roles." + roleIDs[0]),  // No I18N
                 release_engineer: this.copyTemplateProperties("role", "roles." + roleIDs[1])    // No I18N
             };
             fieldsProperty.release_engineer.input_data_Callback = $releaseForm.getSGTInputDataCallback(_self.entity_data);
             fieldsProperty.release_manager.input_data_Callback = $releaseForm.getAllInputDataCallback();

             let column_count = "1";
             let template = _self.constructTemplate(requiredFields, column_count, fieldsProperty,mode);
             let nonEditable = ["id", "template"];    // No I18N
             _self._links.edit && _self._links.edit.put && _self._links.edit.put.non_editable_fields && (nonEditable = nonEditable.concat(_self._links.edit.put.non_editable_fields));
             _self.stagePermissions && _self.stagePermissions.global && !_self.stagePermissions.global.edit && nonEditable.splice(0, 0, "release_engineer", "release_manager");   // No I18N

             //Destroy the old instance
             _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
             let stageName = "submission";  // No I18N
             //If release details is not editable,  workflow & scheduled_end_time is non editable
             if (!_self.stagesObject[stageName].canEdit) {
                 nonEditable.push("workflow");
                 nonEditable.push("scheduled_end_time");
             }
            let skipEditFields = [];
          var hideFields = ["id", "status", "workflow", "template", "release_engineer", "release_manager", "scheduled_end_time"];   //No I18N
          const loggedInUserId = sdp_user.LOGGEDIN_USERID.toString();

          $CRObj.isRMRE = (sdp_user.ROLES.contains('SDReleaseManager') ||  (_self.entity_data.release_manager && _self.entity_data.release_manager.id === loggedInUserId) || (_self.entity_data.release_engineer && _self.entity_data.release_engineer.id === loggedInUserId));

            if(mode!="view"){
                skipEditFields=skipEditFields.concat(["id", "status", "workflow", "template", "release_engineer", "release_manager","scheduled_end_time"].filter(item => item !== field));   //No I18N
            }
             /* Load FC for right property section */
             let rightPropFcConfig = {
                 template: template,
                 entitydata: jQuery.extend(true, {}, _self.entity_data),
                 metadata: jQuery.extend(true, {}, _self.metainfo),
                 container: "right_propertysection",   // No I18N
                 mode:mode,
                 preFix:"rpanel",// No I18N
                 formid: "rightPanelProperty",   // No I18N
                 skipEditFields: mode=="view"?nonEditable:skipEditFields,   //No I18N
                 disableFieldOnly:true,
                 canEdit: !_self.isTrashed, //CanEdit default's to true, and permission is controlled in skipEditFields
                 allowedValuesCallback: "$rc.getWFAllowedValues", //NO I18N
                 ffr: {
                    hideReverse: true,
                    hideFields: hideFields,
                    editSkippedFields:mode=="view"?[]:skipEditFields, //NO I18N
                    id: _self.entity_data.template.id,
                    enable: true,
                    entity: "RELEASE",    //No I18N
                    rerender:function(){
                         _self.loadRightPropertySection();
                    },
                    toggleMode:function(form,event,mode){
                        if(mode=="view"){
                            field=event.currentTarget.getAttribute("data-name");
                            FC_Mapper[form].destroy();
                            $rc.loadRightPropertySection("edit",field);  // No I18N
                            $rc.$rightpropertyfields_FC.sectionalEdit($rc.$rightpropertyfields_FC.form);
                            setTimeout(function(){
                                jQuery("#"+$rc.$rightpropertyfields_FC.container).find(".col-fields").addClass("mb0");

                                if(field=="scheduled_end_time"){
                                    $rc.$rightpropertyfields_FC.fields[field].container.find(".spot-actions").removeClass("hide").find(".spot-save").on("click",function(argument) {
                                        FC.submit($rc.$rightpropertyfields_FC.form)
                                    });
                                }else{
                                    $rc.$rightpropertyfields_FC.fields[field].container.find(".spot-actions").removeClass("hide").find(".spot-save").hide();
                                }
                                $rc.$rightpropertyfields_FC.fields[field].container.find(".spot-actions").find(".spot-cancel").on("click",function(argument) {
                                    FC.cancel($rc.$rightpropertyfields_FC.form);
                                });
                            },300);

                            return false;
                        }
                    }
                },
                 edit: {
                     defaults: {
                         lookup: {
                             placeholder: translate('sdp.change.sla.select'),
                         }
                     },
                     fields: {
                         workflow: {
                             onsave: function() {
                                return;
                             }
                         }
                     },
                     inline: {
                         scheduled_end_time: {
                             pre: function (form) {
                                 // when inline edit, allignment issue
                                 form.container.find('[data-title="scheduled_end_time"]').addClass("vmiddle");
                             }
                         }
                  },
                  onchange:{
                      release_manager: "$rc.rightPanelOwnerChange",// No I18N
                      release_engineer: "$rc.rightPanelOwnerChange",// No I18N
                      workflow: "$rc.onWorkFlowChange" // No I18N
                     }
                 },
                 afterRenderCallback: function () {
                     jQuery("#" + this.container).find('[data-id="form-fixed-wrapper"]').css("padding-bottom", '').end()
                         .find(".form-wrapper").removeClass("pb25").end()
                         .find(".form-section").addClass('noborder p0');

                 },
                 save: {
                     pre: function (payload, formcomp, event, promise) {
                        let old_pl = JSON.parse(sdpToJSON(payload));
                        let current_changing_fields = Object.keys(payload[formcomp.entity]);
                        let roleIDs = Object.keys(formcomp.metadata.fields.roles.fields);
                        let roleID = "";
                        formcomp.options.save.url = _self.base_url + "/" + _self.id; // No I18N
                        formcomp.options.save.type = "PUT";
                        if (!payload.release.roles&&(current_changing_fields.indexOf( "release_engineer")>-1 || current_changing_fields.indexOf( "release_manager")>-1)) {
                            payload.release = {
                                "roles": {} // No I18N
                            };
                        }
                        current_changing_fields.forEach(field => {
                            let userDetails = old_pl[formcomp.entity][field];
                            if (field === "release_engineer" || field === "release_manager") {
                                formcomp.options.save.type = "PUT";
                                if (field === "release_engineer") { // No I18N
                                    roleID = roleIDs[1];
                                    payload.release.roles[roleID] = userDetails;
                                } else if (field === "release_manager") { // No I18N
                                    roleID = roleIDs[0]; 
                                    payload.release.roles[roleID] = userDetails;
                                }
                                let entityData = jQuery.extend(true, {}, _self.entity_data);
                                payload[_self.entity_name].roles = $releaseForm.serializeRolesDataForAPI(payload[formcomp.options.save.entity].roles, entityData);
                            }
                            else {
                                payload[_self.entity_name][field] = old_pl[formcomp.entity][field];
                            }
                        });
                    },
                  cancel:function(){
                        if(_self.$rightpropertyfields_FC.mode=="edit"){
                            $rc.loadRightPropertySection();
                         }
                     },
                     postsuccess: function (data) {
                         if (data.release_to_release_role) {

                             let current_changing_field = data.release_to_release_role.role.internal_name;

                             _self.entity_data[current_changing_field] = data.release_to_release_role.user;

                             if ("release_engineer" === current_changing_field || "release_manager" === current_changing_field) {
                                 //updating for the latest entity data roles
                                 _self.entity_data.roles.push(data.release_to_release_role);
                             }

                         }
                         if (data.release.workflow && data.release.workflow.allowed_stages_config && data.release.workflow.allowed_stages_config === "ONLY_WF_STAGES") {
                             //To reset stage and status to default value on workflow change if the current stage not available in the new workflow
                             _self.checkAndResetStageStatus(data)
                                 .then(() => {
                                     _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
                                     _self.reinitDetailsComponent();
                                     _self.pushingStateURL('detail', _self.id, _self.metainfo.fields.stage.default_value.internal_name, _self.metainfo.fields.stage.default_value.internal_name); //No I18N
                                 });
                         } else {
                             _self.$rightpropertyfields_FC && _self.$rightpropertyfields_FC.destroy();
                             _self.reinitDetailsComponent();
                         }
                     },
                     promisereject: "$rc.roles.promisereject"   // No i18n
                 }
             };

             _self.$rightpropertyfields_FC = _self.initFormComponent(rightPropFcConfig);
         },

         /**
         * Loads change/release Details in submission details tab
         */
        loadEntityFields:function(tabName, tabSetting, tabs_panel){

             let _self = this;
             /* entityFields is set in getEntityTemplateData*/
             let entityFields = _self.entityFields;
             entityFields.initFC = function (mode) {
                 if(!["view","edit","new"].includes(mode)){
                     mode="view";//No i18n
                 }
                 /* Destroy the old instances */
                 _self.$entityFields_FC && _self.$entityFields_FC.destroy();
                 /* Hide other sections which is in edit mode */
                 _self.hidePanelEditor();
                 /* Show/hide block edit icon when mode is switched */
                 if (mode === "edit") {
                     jQuery('[data-id="blockEditEntityFields"]').hide();
                 } else {
                     jQuery('[data-id="blockEditEntityFields"]').show();
                 }

                 const stageName = tabs_panel.internal_name;
                 let column_count = 2, attachmentSectionIndex = null;
                 let options = {};
                 options.showRelationshipIcon = (!_self.printPreview && mode === "view");   //NO I18N
                 let template = _self.constructTemplateInfo(stageName, null, column_count, options,mode);
                 /* Remove attachment section */
                 jQuery.each(template.layouts[0].sections, function (i, section) {
                     jQuery.each(section.fields, function (j, field) {
                         if (field.name === "attachments") {
                             attachmentSectionIndex = i;
                             return false;
                         }
                     });
                 });
                 attachmentSectionIndex !== null && template.layouts[0].sections.splice(attachmentSectionIndex, 1);
                 //Remove color customization and label placement applied in template
                 template.style_properties = null;
                 /* Add context=udf_fields for the udf fields to render udf field */
                 $releaseForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);

                 /* Transform site null from api to Not associated to any site */
                 if (_self.entity_data.hasOwnProperty("site")) {
                     _self.entity_data.site = _self.entity_data.site ? _self.entity_data.site : {
                         "id": -1, //NO I18N
                         "name": translate('common.site.nosite') //NO I18N
                     };
                 }

                 let skipEditFields = ["site", "group"]; // No I18N
                 if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.contains('ViewInventoryWS') === false) {
                     skipEditFields.push("assets");
                 }
                 if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.contains('ViewCI') === false) {
                     skipEditFields.push("configuration_items");
                 }

                 let skipFields = ["stage", "status", "title", "description","comment","release_engineer","release_manager"];  //No I18N
                 let hideFields = ["stage","status","comment", "title", "description","release_engineer","release_manager"];   // No I18N
                 let callbackFields = _self.isChangeModule ? $CRForm.getInputDataCallback() : $releaseForm.getInputDataCallback();
                 let fieldsProperty = {
                     stage : {
                         mandatory : true,
                         input_data_Callback: callbackFields.stage,
                         sort: false
                     },
                     status : {
                         mandatory : true,
                         input_data_Callback: callbackFields.status,
                         sort: false
                     },
                     comment : {
                         mandatory : false,
                         disabled : true
                     },
                     release_engineer:{
                         mandatory : false,
                         disabled : true
                     },
                     release_manager:{
                         mandatory : false,
                         disabled : true
                     },
                     scheduled_end_time:{
                         mandatory : false,
                         disabled : true
                     },
                     scheduled_start_time:{
                         mandatory : false,
                         disabled : true
                     }
                 };
                 if(mode!="view"){
                     let stageTemplate = _self.constructTemplate(hideFields,column_count,fieldsProperty,mode);
                     jQuery.each(stageTemplate.layouts[0].sections, function (i, section) {
                        jQuery.each(section.fields, function (j, field) {
                            if(field.name==="created_time"){
                               field.mandatory=false;
                            }
                        });
                    });
                     template.layouts[0].sections=stageTemplate.layouts[0].sections;
                     ChangeReleaseForm.modifyUDFFieldsProperty(template.layouts[0], template[_self.entity_name].udf_fields);
                     template.layouts[0].sections[0].fields=template.layouts[0].sections[0].fields.filter(field => field.name!=="site"&&field.name!=="group");
                     skipEditFields.concat(["site","group"]); // No I18N
                     skipFields.concat(["site","group"]); // No I18N
                 }
                 let fcMode = mode ? mode : "view"; // No I18N
                 /* Load FC for details sections*/
                 let configJSON = {
                     template: template,
                     entitydata: jQuery.extend(true, {}, _self.entity_data),
                     metadata: jQuery.extend(true, {}, _self.metainfo),
                     container: "changeDetails",// No I18N
                     canEdit: entityFields.canEdit,
                     skipEditFields: skipEditFields,
                     editExceptions: mode=="view"?["site", "group"]:[], // No I18N
                     skipFields: skipFields,
                     mode: fcMode,
                     allowedValuesCallback: "$rc.getAllowedValues",//NO I18N
                     dependentFields: [{
                         fields: ["category", "subcategory", "item"], // No I18N
                         order: true
                     }],
                    ffr:{
                         id:template.id,
                         hideFields:hideFields,
                         entity:"release",//no i18n
                         toggleMode:(form,event,mode)=>{
                            if(mode=="view"){
                               $rc.entityFields.initFC('edit');// No I18N
                               return false;
                            }
                         },
                         rerender: function() {
                            $rc.entityFields.initFC("view");// No I18N
                        }
                     },
                     linkedFields: [
                         {
                             fields: ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                             denote_field: ["scheduled_start_time"], //NO I18N
                             message: getMessageForKey("api.validation.scheduledstart.scheduledend"), //NO I18N
                             validation: function (valueJson) {
                                 return !(valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time);


                             }
                         },
                         {
                             fields: ["created_time"], //NO I18N
                             denote_field: ["created_time"], //NO I18N
                             message: getMessageForKey("api.validation.createdtime.currenttime"), //NO I18N
                             validation: function (valueJson) {
                                 return valueJson.created_time <= new Date();


                             }
                         },
                         {
                             fields: ["created_time", "completed_time"], //NO I18N
                             denote_field: ["completed_time"], //NO I18N
                             message: getMessageForKey("api.validation.completedtime.createdtime"), //NO I18N
                             validation: function (valueJson) {
                                 return !(valueJson.completed_time && valueJson.created_time > valueJson.completed_time);
                             }
                         }],
                     edit: {
                         fields: {
                             services: {
                                 placeholder: translate('sdp.change.sla.select')
                             },
                             assets: {
                                selection_handler: "$releaseForm.showAssoiciateAssetList",//NO I18N
                                selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30")//NO I18N
                             },
                             configuration_items: {
                                selection_handler: "$releaseForm.showAssoicateCIList",//NO I18N
                                selection_icon_class: "cspr asset1 icon-sm right" + (mode === "view" ? "0" : "30")//NO I18N
                             },
                             created_time: {
                                 allowClear: false
                             }
                         },
                         inline: {
                             pre: _self.hidePanelEditor,
                             services: {
                                 post: function () {
                                     if (_self.$entityFields_FC) {
                                         _self.$entityFields_FC.fields.services.renderasHTML = false;
                                         _self.$entityFields_FC.fields.services.hideCheckbox = false;
                                         delete _self.$entityFields_FC.fields.services.renderField;
                                     }
                                 }
                             }
                         },
                         defaults: {
                             lookup: {
                                 placeholder: translate('sdp.change.sla.select')
                             }
                         },
                         onchange:
                            mode=="view"?{}:{   //No I18N
                                status: function (field, form) {
                                    form.addMandatoryField("comment");//NO I18N
                                    form.fields.comment.disabled = (!(form.fields.changed.indexOf("status") !== -1 || form.fields.changed.indexOf("stage") !== -1));
                                }
                            }

                     },
                     /*Inline save*/
                     save: {

                         postsuccess: function (data, form, fieldName) {
                             //Fix - When release's priority is updated, then announcement priority shows old data only
                             jQuery("#announceDialogDiv").remove();

                             if (_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)) {
                                 _self.reinitDetailsComponent();
                             } else {
                                 _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                                 //If schedule end is updated, same should be changed in right panel schedule end
                                 let options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                                 options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                                 _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);
                             }
                             if (fieldName === 'services') {
                                 this.fields.services.renderasHTML = true;
                                 this.fields.services.hideCheckbox = true;
                                 this.fields.services.renderField = _self.renderAssetCIShowMoreComponent;
                             }
                             //To reinitialize tooltips of all multiselect fields if any tooltips present after saving inline field edit.
                             initTooltip('p[type=multi_select]'); //No I18N
                         },
                         cancel: function(form, fieldName) {
                             if(fieldName === "services") {
                                 form.fields.services.renderasHTML = true;
                                 form.fields.services.hideCheckbox = true;
                                 form.fields.services.renderField = _self.renderAssetCIShowMoreComponent;
                             }
                             //To reinitialize tooltips of all multiselect fields if any tooltips present after canceling inline field edit.
                             initTooltip('p[type=multi_select]'); //No I18N
                         }
                     },
                     afterRenderCallback: function (form) {    // Rls Detail view mt10 added for each property
                         jQuery("#" + form.container).find(".section-title").addClass("pl0").end()
                             .find(".section-title").not(":first").addClass("mt10");     //NO I18N
                         jQuery("#" + form.container).find("[data-name='form-footer']").addClass("sticky-form-footer");    //NO I18N
                     }
                 };

                 if (fcMode === "view") {
                     let linkedFields = [
                         {
                             fields: ["scheduled_start_time", "scheduled_end_time"], //NO I18N
                             denote_field: ["scheduled_end_time"], //NO I18N
                             message: getMessageForKey("sdp.schedule.validation.key4"), //NO I18N
                             validation: function (valueJson) {
                                 return !(valueJson.scheduled_end_time && valueJson.scheduled_start_time > valueJson.scheduled_end_time);


                             }
                         },
                         {
                             fields: ["created_time", "completed_time"], //NO I18N
                             denote_field: ["created_time"], //NO I18N
                             message: getMessageForKey("api.validation.createdtime.completedtime"), //NO I18N
                             validation: function (valueJson) {
                                 return !(valueJson.completed_time && valueJson.created_time > valueJson.completed_time);


                             }
                         }];

                     configJSON.linkedFields = configJSON.linkedFields.concat(linkedFields);
                 } else if (fcMode === "edit") { //NO I18N

                     configJSON.save = {
                         url: _self.base_url + "/" + _self.id,//NO I18N
                         entity: _self.entity_name,
                         submit: true,
                         cancel: "$rc.entityFields.cancelForm",   // No I18N
                         postserializer: function (data, form) {
                             _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                             form.entitydata = data[_self.entity_name];
                         },
                         postsuccess: function (data) {
                             //If schedule end is updated, same should be changed in right panel schedule end
                             let options = jQuery.extend(true, {}, _self.$rightpropertyfields_FC.options);
                             options.entitydata = jQuery.extend(true, {}, data[_self.entity_name]);
                             _self.$rightpropertyfields_FC = _self.reinitFormComponent(_self.$rightpropertyfields_FC, options);

                             _self.entityFields.initFC("view");   // No I18N
                         }
                     };
                 }

                 jQuery.each(template[_self.entity_name].udf_fields, function (fieldName) {
                     if (_self.metainfo.fields.udf_fields && (_self.metainfo.fields.udf_fields.fields[fieldName].display_type === "MultiSelect" || _self.metainfo.fields.udf_fields.fields[fieldName].display_type === "CheckBox")) {
                         configJSON.edit.fields["udf_fields." + fieldName] = {selection_handler: "$releaseForm.showBulkSelect"}; //No I18N
                     }
                 });

                 _self.$entityFields_FC = _self.initFormComponent(configJSON);
             };
             entityFields.cancelForm = function () {
                 _self.entityFields.initFC('view');   // No I18N
             };

             _self.entityFields.initFC("view");   // No I18N
         },
         getLeftMenus: function () {
             let menus = ["stages", "roles", "associations", "tasks", "reminders", "worklogs", "approvalsummary", "conversations", "history"];    // No I18N
             if (!this.hasAssociationsAccess()) {
                 menus.splice(menus.indexOf('associations'), 1);
             }
             return menus;
         },
         getScheduleTemplateData: function(tabName, tabSetting, tabs_panel){
            let _self = this;
            let obj = {};
            const stageName = tabs_panel.internal_name;
            obj.stageName = stageName;
            return obj;
        },
         getApprovals: function (tab, tabObject, tabs_panel) {
             let _self = this, key = undefined;
             let stageName = tabs_panel.internal_name;
             let stage = _self.stagesObject[stageName];
             let permissions = _self.stagePermissions[stageName];
             let isCrossedStage = (_self.entity_data.stage.stage_index > stage.stage_index) || (_self.entity_data.stage.internal_name === "close" && (_self.entity_data.status.internal_name === "completed" || _self.entity_data.status.internal_name === "cancelled")) || false;  //No I18N
             let canApprove = (_self.options.moduleConfigs && _self.options.moduleConfigs.allowUserAsApprover ? (permissions.edit || permissions.approve) : permissions.approve);

             let user_fetch = {};
             user_fetch.url = _self.base_url + "/" + _self.id + '/release_requester';    //No I18N
             user_fetch.lookup_field = 'release_requester';   //No I18N
             user_fetch.search_keys = ['email_id'];   //No I18N


             let params = {
                 "entity_name": _self.entity_name_pl,   //No I18N
                 "changeId": _self.id,   //No I18N
                 "stageId": stage.id,  //No I18N
                 "contentHolderId": tabObject.containerId, //No I18N
                 "isCurrentStage": (_self.activeStage === stageName), //No I18N
                 "key": key,   // No I18N
                 "edit": !_self.printPreview && permissions.edit,   //No I18N
                 "approve": !_self.printPreview && canApprove,   //No I18N
                 "isCompletedStage": isCrossedStage,  //No I18N
                 "isNonLogin": false, //No I18N
                 "isAppend": _self.printPreview,//No I18N
                 "approvalRestricted": (_self.entity_data.workflow || isCrossedStage), //Restricting approval addition in case a workflow is configured   // No I18N
                 "isWorkflowConfigured": !!_self.entity_data.workflow,//No I18N
                 "postApprovalAction": function (resp) {  //No I18N
                     if (resp && ((resp.approval && resp.approval.is_workflow_updated) || (resp.approval_level && resp.approval_level.is_workflow_updated))) {
                         _self.isStageChanged = true;
                         _self.reinitDetailsComponent();
                     }
                 },
                 "user_fetch": user_fetch   //No I18N
             };
             _self.$approvals = new MLAComponent(params);
         },
         /**
          * Loads description section in the initial stage
          */
         loadDescriptionSection: function (tabName, tabSetting, tabs_panel) {
             let _self = this;
             let stageName = tabs_panel.internal_name;
             //Description and attachments section displayed using Panel comp
             let opt = {};
             opt.id = _self.id;
             opt.name = _self.entity_name + "_description"; //No I18N
             opt.base_url = "/api/v3"; //No I18N
             opt.entity = _self.entity_name + "s"; //No I18N
             opt.lookup_entity = _self.entity_name;
             opt.data = _self.entity_data;
             opt.metainfo = _self.metainfo;
             opt.canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;
             opt.expand = true;
             opt.display_name = _self.metainfo.fields.description.display_name;
             opt.inlineImagesEntity = _self.entity_name;
             opt.container = _self.entity_name + "Description"; // No I18N
             opt.detailsHbsTemplate = "entity_description_template"; // No I18N
             opt.panel = {
                 pre_edit: function () {
                     _self.entityFields.initFC();
                 }
             };
             opt.save = {
                 postsuccess: function (data) {
                     if (_self.checkIfpageNeedsRefresh(data, _self.entity_data)) {
                         _self.reinitDetailsComponent();
                     } else {
                         _self.entity_data = data;
                     }
                 }
             };
             opt.attachment = {
                 rerender: function (data) {
                     _self.entity_data.attachments = data;
                 },
                 container: _self.entity_name + "Description_attachment" //No I18N
             };
             _self.$descriptionPC = new PanelComponent(opt);
         },
         /**
          * Actions - close(complete/cancel) release
          * @status - values can be completed/cancelled
          */
         changeStatus: function (status, statusId, action) {
             let _self = this;
             let comment = jQuery("#closercomment").val();
             if (comment === "") {
                 showalert("failure", translate("sdp.changedetails.comments.emptyalert"), "isAutoHide=true");  //No I18N
                 return;
             }
             jQuery("#close_save").prop("disabled", true);  //No I18N
             let url, data;
             if (action === "close") {
                 url = _self.base_url+ "/" + _self.id + (_self.isChangeModule ? "/close_change" : "/_close");
                 data = { status: status, comment: comment };
             } else {
                 url = _self.base_url+ "/" +_self.id;
                 data = {};
                 data[_self.entity_name] = {
                     status: {id: statusId},
                     comment: comment
                 };
             }

             sdpAjax({
                 url: url,
                 type: "PUT",  // No I18N
                 data: sdpAjaxInputData(data),
                 success: function (resp) {
                     if (resp.response_status && resp.response_status.status === "success") {
                         showalert("success", translate("api.updated.success", [e_html(_self.display_name)]), "isAutoHide=true");  //No I18N
                         jQuery('#CloseEntity').dialog('close'); // No I18N
                         _self.isStageChanged = true;
                         _self.reinitDetailsComponent();
                     }
                 },
                 error: function () {
                     jQuery("#close_save").prop("disabled", false);  //No I18N
                 }
             });
         },
         //A function to load task listview in details component.
         renderTask: function (stage) {
             jQuery('#task_listview').html($tasks.loadTasks('list', this.entity_name, this.id, null, this.printPreview ? "printView" : null, null, stage ? this.stagesObject[stage].id : null)); // No I18N
         },
         //A function to load worklog listview in details component.
         renderWorkLog: function () {
             jQuery('#worklog_listview').html($tasks.loadWorkLog('list', 'release', this.id, null, null, null, null, null, this.printPreview)); // No I18N
        },
        /**
         * To check whether new workflow has current stage and status and if not reset to default stage/status.
         */
        checkAndResetStageStatus: function (form) {
            const _self = this;
            const wfObj = form.release.workflow;
            const workflowId = (wfObj && wfObj.id) ? wfObj.id : null;
            const stageId = (form.release.stage && form.release.stage.id) ? form.release.stage.id : null;
            const base_url = _self.entity_name_pl + '/' + form.release.id; //No I18N

            return new Promise((resolve, reject) => {
                if (workflowId && !$releaseForm.checkStageInWorkflow(stageId, workflowId, base_url)) {
                    const input_data = {
                        release: {
                            stage: {
                                id: _self.metainfo.fields.stage.default_value.id
                            },
                            status: {
                                id: _self.metainfo.fields.status.default_value.id
                            },
                            comment: getMessageForKey('workflow.update.status.comment', [encodeHTML(_self.metainfo.fields.stage.default_value.name), encodeHTML(_self.metainfo.fields.status.default_value.name)])
                        }
                    };
                    sdpAjax({
                        url: _self.base_url + '/' + _self.id, //No I18N
                        data: sdpAjaxInputData(input_data),
                        type: "PUT",  // No I18N
                        success: function (resp) {
                            window.location.href = '/ui/releases?entity_id=' + _self.id + '&mode=detail#' + _self.metainfo.fields.stage.default_value.internal_name; //No I18N
                            resolve(resp);
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                } else {
                    resolve();
                }
            });
        },
        //Close Dialog function
        closeDialog(element) {
            jQuery(element).dialog('close'); // No I18N
        },
        //Close Dialog function
        hide(element) {
            jQuery(element).hide();
        },
        //Close Dialog function
        slideToggle(element, speed) {
            jQuery(element).slideToggle(speed);
        }
     };
}()));
