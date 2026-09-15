/* $Id$ */
/*  This file has utility function required for displaying Chnage details page.
    Some common functions for change & release module is available in change_release_common.js
 */
var stagesAndEntitiesObjects=jQuery.extend(window.ChangeReleaseDetails,window.change_submission,window.change_planning,window.change_approval,window.change_implementation,window.change_uat,window.change_release,window.change_review,window.change_close,window.change_roles,window.change_associations,window.change_subEntity,window.change_helper,window.change_actions,window.change_lhsrhs,window.change_panelcomponent_helper,window.change_template,window.change_printpreview,window.change_nonlogin,window.change_conversation);
var $rc = jQuery.extend(true,stagesAndEntitiesObjects,(function(){
    var cDetails = {
    	hashChange : function(){
            var hashURL = window.location.hash;
                if(hashURL != null && hashURL != "") {  // No I18N
                    hashURL = hashURL.substr(1);
                    !this.isNonLogin && this.gotoActiveTab({"active" : hashURL}); // No I18N
                }
        },
        init : function(options){
            this.initializeChange(); //To avoid multiple popstate event binding
            //This object helps to find from which page, form is invoked
            $CRObj.fromPage = "details"; // No I18N
            var _self = this;
                /* Set the basic properties required for all methods */
                options.module = "change";  // No I18N
                _self.setProp(options);
                _self.externalframe = options.externalframe;
                _self.printPreview = window.print_mode = options.printPreview;
                if(options.isNonLogin) {
                    _self.isNonLogin=true;
                    _self.setNonLoginInitData(options);
                }
                else if( _self.getInitData()===false) {
                        window.open('/Changes.cc','_self', 'noopener');
                }
                //fetching the summary as the datacall back in detail comp is not called in print preview
             !_self.isNonLogin && this.getEntitySummary();
             _self.moduleName = _self.entity_name.capitalize();
            var allowedTabObj = _self.getAllowedTabs();
            var opt = {
                entity_id : _self.entity_data ? _self.entity_data.id : "", // No I18N
                module_options : options,
                printPreview : _self.printPreview,
                module : _self.entity_name,
                moduleName : _self.moduleName,
                $rc: _self,
                data : { entity_data : _self.entity_data, tabData : _self.tabData, stages : _self.stagesObject, metainfo: _self.metainfo, _links: _self._links, stagePermissions: _self.stagePermissions, sdp_user: sdp_user, system_userid: sdp_user.SYSTEM_USERID.toString()},
                container : "change_detailview", // No I18N
                afterInitialRender : _self.afterInitialRender,
                afterRenderfunction: _self.afterRenderChange,
                panel_details : {
                    content_panel : {
                        actions_panel : {
                            show : !options.printPreview && !_self.externalframe,
                            left_panel : {
                                show : true,
                                dataCallback: this.getActionsTemplateData,
                                template: "change_actions_template",  // No I18N
                                template_namespace: "change",   // No I18N
                                afterRenderfunction: this.afterQuickActionsRender
                            },
                            middle_panel : {
                                show : true,
                                template: "actions_middle_template",  // No I18N
                                template_namespace: "change",   // No I18N
                                afterRenderfunction: function(){ spInit(); initTooltip("#actionsBar");}  // No I18N
                            },
                            right_panel : {
                                show : true,
                                template: "action_rightPanel_template",  // No I18N
                                template_namespace: "change",   // No I18N
                                afterRenderfunction: options.notificationsLength ? this.loadZiaActions : undefined
                            }
                        },
                        left_panel : {
                           show : true,
                           id : "changedetail-stage-tabs" // No I18N
                        },
                        header_panel : {show : true, template: "change_headeractions_template", template_namespace: "change", "class":"headerbar", afterRenderfunction: this.afterHeaderPanelRender }, // No I18N
                        details_panel : {show : true},
                        tabs_panel : {
                            show : true,
                            name : "change", // No I18N
                            active : !this.isNonLogin && _self.getParentTab(),
                            tabs : _self.getLeftMenus(),
                            id : "change_stage", // No I18N
                            containerId : "changedetail-stage-tabs", // No I18N
                            template : "changedetail-left-template", // No I18N
                            template_namespace: "change",   // No I18N
                            dataCallback: !this.isNonLogin && this.getEntitySummary,
                            afterRenderfunction : !this.isNonLogin && this.gotoActiveTab,
                            settings : {
                            	stages : {
                                    show: true,
                                    name : "stages", // No I18N
                                    type : "tab", // No I18N
                                        template : "change-stages-left-template", // No I18N
                                    template_namespace: "change",   // No I18N
                                    containerId : "stage_tabs", // No I18N
                                    active : _self.getActiveStageTab(), 
                                    afterRenderfunction : this.parentTab == "stages" && !this.isNonLogin && this.gotoActiveTab, //No I18N
                                    custom : this.parentTab == "stages", //No I18N
                                    childAfterRenderfunction : this.stageTabAfterRender,
                            		settings: {
                            			"Submission" : { // No I18N
                                            show: true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Submission", // No I18N
                                            custom : true,
                                            active : _self.getActiveSubTab("Submission"), // No I18N
                                            "tabs" : _self.getAllowedTabs("Submission").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Submission ? _self.stagesObject.Submission.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                            					"details" : { // No I18N
                            						show : true,
                            						display_name :  _self.printPreview ? "" : translate("common.details"), // No I18N
                                                    dataCallback : this.getEntityTemplateData, 
    				                                template : "changedetails_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction : this.loadChangeDetails
                            					},
                                                    "schedule":{ // No I18N
                                                        show : true,
                                                        display_name : _self.printPreview ? "" :translate("sdp.common.schedule"), // No I18N
                                                        template : "common_schedule_template", // No I18N
                                                        dataCallback: this.getScheduleData,
                                                        template_namespace: "change",   // No I18N
                                                        renderfunction: this.loadSubmissionSchedule
                                                    },
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
                                                    containerId : "Submission-tabs-panel_content",  // No I18N
    				                                renderfunction : _self.getApprovals 
                            					},
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
                                                    dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
    				                                template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change"   // No I18N
                            					},
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Submission"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                }
                            				}
                            			},
                            			"Planning" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Planning", // No I18N
                                            active : _self.getActiveSubTab("Planning"), // No I18N
                                            custom : true,
                                            "tabs" : _self.getAllowedTabs("Planning").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Planning ? _self.stagesObject.Planning.name : '' ,
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                            					"details" : { // No I18N
                            						show : true,
                            						display_name :  _self.printPreview ? "" : translate("common.details"), // No I18N
    				                                template : "planningdetails_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: this.loadPlanningDetailSection
                            					},
                            					"schedule":{ // No I18N
                            						show : true,
                            						display_name : _self.printPreview ? "" :translate("sdp.common.schedule"), // No I18N
                                                    dataCallback : this.loadScheduleData,
    				                                template : "release_stage_schedule_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: this.loadPlanningSchedule
                            					},
                            					"associations" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.project.associations.tabname"), // No I18N
                                                    dataCallback: this.getAssociationPermission,
                                                    template : "planning_association_template",  // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction : this.loadChangeAssociations 
                            					},
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Planning-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals 
                            					},
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
    				                                dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change"   // No I18N
                            					},
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Planning"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                }
                            				}
                            			},
                            			"Approval" : { // No I18N
                            				show : true,
                            				type : "tab", // No I18N
                            				section_type : "sub", // No I18N
    										internal_name : "Approval", // No I18N
                            				custom : true,
    		                                "tabs" : _self.getAllowedTabs("Approval").allowedTabs, // No I18N
                                            active: "approvals", //No I18N
                                            header_name : _self.stagesObject.Approval ? _self.stagesObject.Approval.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                                                "details" : { // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" : translate("common.details"), // No I18N
                                                    dataCallback : _self.getAdditionalFieldsTemplateData,
                                                    template : "additional_fields_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: _self.loadApprovalDetails
                                                },                           				
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Approval"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Approval-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals 
                            					},
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                },
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
    				                                dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change"   // No I18N
                            					}
                            				}
                            			},
                            			"Implementation" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Implementation", // No I18N
                                            active : _self.getActiveSubTab("Implementation"), // No I18N
                                            custom : true,
                                            "tabs" : _self.getAllowedTabs("Implementation").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Implementation ? _self.stagesObject.Implementation.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                                                "details" : { // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" : translate("common.details"), // No I18N
                                                    dataCallback : _self.getAdditionalFieldsTemplateData,
                                                    template : "additional_fields_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: _self.loadImplementationDetails
                                                },
                            					"tasks" : { // No I18N
                            						show : true,
                            						display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Implementation"),
                                                    HTML:'<div id="task_listview"></div>'
                            					},
                            					"associations" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.project.associations.tabname"), // No I18N
                                                    HTML : '<div id="ui-framework-design1"><div class="sb pb10 ui-underline1 mt20">'+translate("sdp.change.association.getall.child.project")+'</div></div><div class="mt10" id="project_associations"></div>',  // No I18N
                                                    renderfunction : this.loadChangeAssociations 
                            					},
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                },
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Implementation-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals 
                            					},
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
    				                                dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                            					}
                            				}
                            			},
                                        "UAT" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "UAT", // No I18N
                                            custom : true,
                                            active : _self.getActiveSubTab("UAT"),// No I18N
                                            "tabs" : _self.getAllowedTabs("UAT").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.UAT ? _self.stagesObject.UAT.name : '', 
                                            childAfterRenderfunction : this.afterTabRender,
                                            settings : {
                                                "details" : { // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" : translate("common.details"), // No I18N
                                                    template : "uatdetails_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: _self.loadUATDetails
                                                },
                                                "schedule":{ // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" :translate("sdp.common.schedule"), // No I18N
                                                    template : "uat_schedule_template", // No I18N
                                                    dataCallback: this.getScheduleData,
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: this.loadUATSchedule
                                                    },
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "UAT"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                },
                                                "approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "UAT-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals
                                                },
                                                "status_comments" : { // No I18N
                                                    show : true,
                                                    display_name : translate("sdp.change.statuscomments"), // No I18N
                                                    dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                }
                                            }
                                        },
                                        "Release" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Release", // No I18N
                                            custom : true,
                                            active : _self.getActiveSubTab("Release"),// No I18N
                                            "tabs" : _self.getAllowedTabs("Release").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Release ? _self.stagesObject.Release.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                                            settings : {
                                                "details" : { // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" : translate("common.details"), // No I18N
                                                    template : "change_releasedetails_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: _self.loadReleaseDetails
                                                },
                                                "schedule":{ // No I18N
                                                    show : true,
                                                    display_name : _self.printPreview ? "" :translate("sdp.common.schedule"), // No I18N
                                                    dataCallback: this.loadScheduleData,
                                                    template : "release_stage_schedule_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: this.loadReleaseSchedule
                                                },
                                                "tasks" : { // No I18N
                            						show : true,
                            						display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Release"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                                                "associations" : { // No I18N
                                                    show : true,
                                                    display_name : translate("sdp.project.associations.tabname"), // No I18N
                                                    HTML : '<div class="mt10"><div id="ui-framework-design1" ><div class="sb pb10 ui-underline1 mt20">'+translate("sdp.change.association.getall.child.release")+'</div></div><div id="associatedReleaseList"></div></div>',  // No I18N
                                                    renderfunction : this.loadChangeAssociations 
                                                },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                },
                                                "approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Release-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals
                                                },
                                                "status_comments" : { // No I18N
                                                    show : true,
                                                    display_name : translate("sdp.change.statuscomments"), // No I18N
                                                    dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                }
                                            }
                                        },
                            			"Review" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Review", // No I18N
                                            custom : true,
                                            active : _self.getActiveSubTab("Review"), // No I18N
                                            "tabs" : _self.getAllowedTabs("Review").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Review ? _self.stagesObject.Review.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                            					"details" : { // No I18N
                            						show : true,
                            						display_name :  _self.printPreview ? "" : translate("common.details"), // No I18N
    				                                template : "change_review_details_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    renderfunction: this.loadReviewDetails
                            					},
                                                    "schedule":{ // No I18N
                                                        show : true,
                                                        display_name : _self.printPreview ? "" :translate("sdp.common.schedule"), // No I18N
                                                        template : "common_schedule_template", // No I18N
                                                            dataCallback: function() {return {name:"Review"}},// No I18N
                                                        template_namespace: "change",   // No I18N
                                                        renderfunction: this.loadReviewSchedule
                                                    },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                },
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Review-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals
                            					},
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
    				                                dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                            					},
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Review"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },

                            				}
                            			},
                            			"Close" : { // No I18N
                                            show : true,
                                            type : "tab", // No I18N
                                            section_type : "sub", // No I18N
                                            internal_name : "Close", // No I18N
                                            active : _self.getActiveSubTab("Close"),// No I18N
                                            custom : true,
                                            "tabs" : _self.getAllowedTabs("Close").allowedTabs, // No I18N
                                            header_name : _self.stagesObject.Close ? _self.stagesObject.Close.name : '',
                                            childAfterRenderfunction : this.afterTabRender,
                            				settings : {
                            					"details" : { // No I18N
                            						show : true,
                                                       display_name : _self.printPreview ? "" : translate("common.details"), // No I18N
                                                       template : "change_close_details_template",  // No I18N
                                                       template_namespace: "change",   // No I18N
                                                       renderfunction: this.loadCloseDetails
                            					},
                            					"approvals" : { // No I18N
    												show : true,
    												display_name : translate("approval.approvals"), // No I18N
    				                                containerId : "Close-tabs-panel_content",  // No I18N
                                                    renderfunction : _self.getApprovals
                            					},
                            					"status_comments" : { // No I18N
                            						show : true,
                            						display_name : translate("sdp.change.statuscomments"), // No I18N
    				                                dataCallback: this.getStatusComments,
                                                    renderfunction: this.loadStatusComments,
                                                    template : "change_status_comments_tab_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                            					},
                                                "tasks" : { // No I18N
                                                    show : true,
                                                    display_name : translate("task.title"), // No I18N
                                                    renderfunction: this.renderTask.bind(this, "Close"),
                                                    HTML:'<div id="task_listview"></div>'
                                                },
                                                "notes" : { // No I18N
                                                    show : true,
                                                    display_name : translate("common.notes"), // No I18N
                                                    template : "notes_template", // No I18N
                                                    template_namespace: "change",   // No I18N
                                                    dataCallback: this.getNotesTemplateData,
                                                    renderfunction: this.loadNotes
                                                }
                            				}
                            			}
                            		}
                            	},
                            	roles : {
                                    show : true,
                                    header_name : !_self.printPreview ? "" : translate("common.roles"), // No I18N
                                    HTML : '<div id="change_roles_container" data-cs-field="change_roles_container" class="form-template"></div>', // No I18N
                                    renderfunction: this.loadRoles,
                                    afterRenderfunction: this.afterTabRender
                            	},
                            	notes : {
                            		show : true,
                            		header_name : translate("common.notes"), // No I18N
                                    HTML : "<div id='change_notes_container' data-cs-field='change_notes_container' class='content-section'></div>", // No I18N
                                    renderfunction: this.loadNotesTab,
                                    afterRenderfunction: this.afterTabRender
 
                            	},
                            	conversations : {
                            		show : !_self.isRequester(),
                                    header_name : translate("sdp.requests.viewrequest.conversations"), // No I18N
                                    HTML : "<div id='conversation_section' class='content-section'></div>", // No I18N
                                    renderfunction: this.loadConversationsForChange,
                                    afterRenderfunction: this.afterTabRender
                            	},
                            	reminders : {
                            		show : true,
                                    header_name : translate("common.allreminder"), // No I18N
                                    renderfunction: this.loadReminder,
                                    afterRenderfunction: this.afterTabRender
                            	},
                            	history : {
                            		show : !_self.isRequester(),
                                    internal_name: "history",// No I18N
                                    display_name : _self.printPreview ? translate("common.history") : "", // No I18N
                                    type : "tab", // No I18N
                                    active : _self.getActiveSubTab("history", "history"), // No I18N
                                    afterRenderfunction : !this.isNonLogin && this.gotoActiveTab,
                                    childAfterRenderfunction : this.afterTabRender,
                                    containerId : "history_section", // No I18N
                                    id : "history_section", // No I18N
                                    tabs : ["history", "status_comments","approval_history"], // No I18N
                                    section_type : "sub", // No I18N
                                    settings : {
                                        history : {
                                            show : !_self.printPreview,
                                            display_name : translate("common.history"), // No I18N
                                            href : "/common/ViewHistory.jsp?id="+this.id+"&module=changes&key=change_history_sort_order&is_new_history=true&print_view="+_self.printPreview // No I18N
                                        },
                                        status_comments : {
                                            show : !_self.printPreview,
                                            display_name : translate("sdp.change.statuscomments"), // No I18N
                                            dataCallback: this.getStatusComments,
                                            renderfunction: this.loadStatusComments,
                                            template : "change_status_comments_tab_template", // No I18N
                                            template_namespace: "change",   // No I18N
                                        },
                                        approval_history : {
                                            show : !_self.printPreview,
                                            display_name : translate("common.approval.history"), // No I18N
                                            dataCallback: this.getApprovalHistory,
                                            renderfunction: this.loadApprovalHistory,
                                            template : "change_approval_history_template", // No I18N
                                            template_namespace: "change",   // No I18N
                                        }
                                    }
                            	},
                                tasks : {
                                    show : true,
                                    header_name : translate("task.title"), // No I18N
                                    afterRenderfunction: this.afterTabRender,
                                    HTML:'<div id="task_listview" data-cs-field="task_listview" ></div>',
                                    renderfunction: this.renderTask.bind(this, null),
                                },
                                worklogs : {
                                    show : !_self.printPreview,
                                    header_name : translate("common.worklogs"), // No I18N
                                    style : {"min-height":"500px"}, // No I18N
                                    renderfunction: this.renderWorkLog,
                                    template: "worklog_listview_template", // No I18N
                                    afterRenderfunction: this.afterTabRender
                                },
                                approvalsummary : {
                                    show : true,
                                    header_name : translate("sdp.change.close.approval.summary"), // No I18N
                                    dataCallback : this.getApprovalSummary,
                                    template : "change_approval_summary_template", // No I18N
                                    template_namespace: "change",   // No I18N
                                    afterRenderfunction: this.afterApprovalSummaryRender
                                },
                            }
                        },
                        right_panel : {
                            show: !_self.externalframe,
                            toggle: !_self.externalframe,
                            "sections": ["properties", "associations"], // No I18N
                            "settings": { // No I18N
                                "associations": { // No I18N
                                    show: this.hasAssociationsAccess(),
                                    "class": "form-horizontal form-section inplace-edit pos-rel top0 right0", // No I18N
                                    dataCallback: !this.isNonLogin && this.getEntitySummary,
                                    template: "associations_rightpanel_template", // No I18N
                                    template_namespace: "change",   // No I18N
                                },
                                "properties": { // No I18N
                                    show: true,
                                    "class": "form-horizontal form-section inplace-edit pb10 pos-rel top0 right0", // No I18N
                                    HTML: '<div id="right_propertysection"  data-cs-field="rigthpanel_section" ></div> <div id="status_change_form" style="display:none"> </div>',
                                    afterRenderfunction: this.loadRightPropertySection
                                }
                            },
                            afterTogglefunction: function (toggleState) {
                                if (toggleState == "close") {
                                    jQuery('#listcontrols').removeClass('task-menu-wrap');
                                } else {
                                    jQuery('#listcontrols').addClass('task-menu-wrap');
                                }
                            }
                        }
                    }
                }
            };
            if(allowedTabObj.allowedTabsObjs){
                opt.panel_details.content_panel.tabs_panel.settings = jQuery.extend(true, opt.panel_details.content_panel.tabs_panel.settings, allowedTabObj.allowedTabsObjs);
            }
            if(options.printPreview){
                var print_details = {};
                const allAvailableStages = ["Submission", "Planning", "Approval", "Implementation", "UAT", "Release", "Review", "Close"];// No I18N
                if(_self.isNonLogin){
                    print_details.print_sections = ["header_panel", "Submission", "roles", "Planning", "Approval", "Implementation", "UAT", "Release", "Review", "Close", "approvalsummary"];// No I18N
                } else {
                    print_details.print_sections = ["header_panel", "Submission", "roles", "Planning", "Approval", "Implementation", "UAT", "Release", "Review", "Close", "tasks", "worklogs", "approvalsummary"];// No I18N
                }

                var urlParams = $CRObj.urlParams;
                if(_self.isNonLogin || urlParams.hasOwnProperty("approval")){ // No I18N
                    print_details.print_sections.unshift("approval"); // No I18N
                }

                print_details.print_metainfo = (this.isNonLogin) ? this.getPrintableSectionsMetaForNonLogin() : this.getPrintableSectionsMeta();
                opt.print_details = print_details;
                opt.print_hideFilter =  opt.print_hideFooter = _self.externalframe ? true : false;
                opt.print_hideFooter = (opt.print_hideFooter || this.isNonLogin) ? true : false;

                allAvailableStages.forEach(function(stage){
                    if(!_self.stagesObject.hasOwnProperty(stage)){
                        print_details.print_sections.splice(print_details.print_sections.indexOf(stage),1);
                    }
                });
            }

            //Remove stage settings if the stage is not participating
            for(let stage in opt.panel_details.content_panel.tabs_panel.settings.stages.settings){
                if(!_self.stagesObject.hasOwnProperty(stage)){
                    delete opt.panel_details.content_panel.tabs_panel.settings.stages.settings[stage];
                }
            }
            //Dont show tabs in stages, if user dont have stage view permission. 
            _self.modifyStageConfig(opt);
            _self.checkPreApprovedChange(opt);
            $rc.$detailsComp = new DetailsComponent(opt, this);
            if(isMSP) {
				window.getCustomAccID = function(url) {
					if(url && url.startsWith('/api/v3/changes/') && (url.indexOf('requests')!=-1 || url.indexOf('problems')!=-1 || url.indexOf('projects')!=-1 || url.indexOf('releases')!=-1)) { //NO I18N
						return 0;
					}
					return getAccountFromCombo();
				};
			}
        },
        afterRenderChange: function(){
            if($rc.printPreview) {
                jQuery('#header_panel_print_content .title .text').prepend("#"+$rc.entity_data.id+" ");
            }
            setTimeout(function(){
                if($rc.printPreview){
                    initTooltip("#detailview");    // No I18N
                    //Expand all collapsable panels in print preview
                    jQuery('z-collapsiblepanel').attr('is-active', 'true');
                    jQuery('#preview-panel z-collapsiblepanel div.zcollapsiblepanel__header').addClass('ptr-ev-none'); // No I18N
                    jQuery(' [data-name="user_link"]').addClass("ptr-ev-none"); // No I18N
                    jQuery('[data-name="approvalPanel"] [data-name="approvalPanelHeader"]').removeClass('ptr-ev-none'); // No I18N
                    jQuery('[data-name="approvalPanel"]').find('.zcollapsiblepanel__header').removeClass('ptr-ev-none'); // No I18N
                }
                //SLA Violation check for showing Flag icon in Change Details page header
                if(_self.entity_data.sla_violation) {
                    jQuery("#overDueFlag").removeClass('hide');
                } else {
                    jQuery("#overDueFlag").addClass('hide');
                }
            },1000);
        },
        initializeChange: function(){
            //To avoid multiple popstate event binding
            if(!window.$CRObj.isPopStateAvailable){
                window.$CRObj.isPopStateAvailable = true;
                jQuery(window).on('popstate', function (event) { // No I18N
                    var state = event.originalEvent.state;
                    if (state && !state.spa){ //To discard popstate event trigger, because of history (history pushed by SPA)
                        $CRObj.doPush = false;
                        if(state.entity_id && (typeof $rc != "undefined" && $rc.$detailsComp) && state.hash){// No I18N
                            window.location.hash="#"+state.hash;// No I18N
                            if($CRObj.entity_id == state.entity_id){
                                var objectPath = $rc.getTabPathHash(window.location.hash);
                                $rc.$detailsComp.gotoTabByPath(objectPath);
                            }else{
                                $rc.init({id: state.entity_id, module : state.module, printPreview : false, externalframe : false});
                            }
                        }else{
                            if($rc.isTrashed) {
                            window.history.pushState({ "spa_skipstate": true }, "", "/Changes.cc?trashView=true"); // No I18N
                                window.location.href="/Changes.cc?trashView=true";// No I18N
                            }else {
                                window.history.pushState({ "spa_skipstate": true }, "", "/Changes.cc");// No I18N
                                    window.location.href="/Changes.cc";    // No I18N
                            }
                        }

                    }
                });
            }
        },
    };
    return cDetails;
}()));
