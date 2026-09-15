/* $Id$ */

/**
 * Following are the list of properties that can be used in config json for conversation component,
 *
 * module - Module or entity name
 * module_id - Module or entity id
 * container - DOM element (selector) where the conversation should be included
 * lite - If this options, enabled then component's automatic initization won't happened.
 * system_notifications - Whether the system notifications should be supported (Boolean)
 * notes - Whether the notes should be supported (Object | false)
 * notes.has_linked_requests - Function to return the value of has_linked_requests. (Function)
 * notes.mark_first_response - Function to know if the note should be added as first response. (Function | Boolean)
 * notes.mention_options - Options based on which mentions will be loaded in editor
 * notes.fields_required - Fields like has_attachments will not be shown in default call, so that field should be passed in fields_required
 * selected_filters - Filters which should be selected by default on loading the conversation, if false filter option wont be shown
 * sort - Whether sort should be supported or not ( Object | false )
 * sort.order - In which order the conversation list should be sorted by default
 * sort.key - Personalization key for the sorting
 * expand - Whether expand all should be supported ( Object | false )
 * expand.expand_panel - Whether the conversations should be expanded by default or not.
 * disable_header - Whether the conversation header is required or not.
 * row_count - Row count of each data fetching round.
 * show_count - Show count of the fetched data
 * notes_count - Show count if the only_notes is true
 * only_notes - Whether to show only notes (Boolean)
 * preview_mode - Whether the component should be rendered as preview mode(trashed view,print view)
 * visibility - Whether to add Public/Private options to conversation. Module specific. (Boolean)
 * allowed_operations - set of the allowed operations for each type of conversation (Object)
 * allowed_operations.note - set of allowed operations for note ["add"] (Array)
 * allowed_operations.email - set of allowed operations for email [ "reply", "forward", "split", "delete", "resend"] (Array)
 * afterNoteAdd - callback function on after adding/updatig note
 * emailReply - callback function on invoking the email's Reply
 * emailForward - callback function on invoking the email's Forward
 * emailResend - callback function on invoking the email's Resend
 * emailSplit - callback function on invoking the email's Split
 * emailDelete - callback function on invoking the email's Delete
 * selectedStage - Selected stage info (Object)
 * stages - Stages details (Used in Release)
 * disableStage - whether stage field should be disabled
 * showStageInPanel - Whether to show stage name in notes panel header
 */

/**
 * Constructor function that initializes the component
 * @param {Object} config Config to initialize the component
 */
function Conversation(config) {
    if (!config.lite) {
        if (!config || !config.module || !config.module_id || !config.container) {
            throw "Conversation component requires config properties";	//No I18N
        }
        this.defaults();
        this.config = config;
        this.setConfig(config);
        this.init();
    } else {
        this.defaults();
        this.config = config;
        this.setConfig(config);
        var callback = function () {}
        if (config.afterLoad && jQuery.isFunction(config.afterLoad)) {
            callback = config.afterLoad;
        }
        this.initLite(callback);
    }
}

Conversation.prototype = {
    /**
     * Initializing the default properties of the conversation
     */
    defaults: function () {
        this.system_notifications = false;
        this.notes = false;
        this.selected_filters = [];
        this.sort = {
            order: "desc" 	//No I18N
        };
        this.expand = {
            expand_panel: false
        };
        this.disable_header = false;
        this.row_count = 200;
        this.show_count = 10;
        this.notes_count = 25;
        this.only_notes = false;
        this.preview_mode = false;
        this.visibility = false;
        this.complete_loaded_notifications = {
            conversations: {},
            notifications: {}
        }
        this.complete_conversations = [];
        this.current_conversations = null;
        this.shown_notifications = 0;
        this.start_index = 1;
        // helper variable used as flag for expand all / collapse all
        this.isExpanded = false;
        // Store temporarily form data
        this.note = {};
        this.dialog = false;
        this.conv_title = getMessageForKey('sdp.requests.viewrequest.conversations');
    },
    /**
     * Sets the properties from config of the conversation to this instance
     * @param {Object} config Config of this instance
     */
    setConfig: function (config) {
        this.module = config.module;
        this.module_id = config.module_id;
        this.container = config.container;
        this.system_notifications = config.system_notifications || false;
        this.notes = config.notes || false;
        this.disable_header = config.disable_header || false;
        this.row_count = config.row_count || 200;
        this.show_count = config.show_count || config.row_count || 10;
        this.notes_count = config.notes_count || 25;
        this.only_notes = config.only_notes || false;
        this.preview_mode = config.preview_mode || false;
        this.usertype = config.usertype || sdp_user.USERTYPE;
        this.dialog = config.dialog || false;
        this.sort = config.sort || this.sort;
        this.expand = config.expand || this.expand;
        this.externalframe = config.externalframe || false;
        this.visibility = config.visibility || this.visibility;
        this.canAddNote = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("note") && (config.allowed_operations.note.indexOf("add") > -1);	//No I18N
        this.canReplyEmail = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("email") && (config.allowed_operations.email.indexOf("reply") > -1);	//No I18N
        this.canForwardEmail = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("email") && (config.allowed_operations.email.indexOf("forward") > -1);	//No I18N
        this.canDeleteEmail = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("email") && (config.allowed_operations.email.indexOf("delete") > -1);	//No I18N
        this.canSplitRequest = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("email") && (config.allowed_operations.email.indexOf("split") > -1);	//No I18N
        this.default_filter = ["email"];
        this.metainfo = config.metainfo || null;
        this.notes_lookup_entity = (config.metainfo && config.metainfo.notes && config.metainfo.notes.lookup_entity) ? config.metainfo.notes.lookup_entity : null;
        if (!config.hasOwnProperty("selected_filters") || !config.selected_filters) {
            this.notes && this.default_filter.push("notes");
            this.system_notifications && this.default_filter.push("system_notifications");
        }
        if (config.sort && config.sort.key) {
            var sort_order = this.getSortPersonalizeInfo(config.module, config.sort.key);
            this.sort.order = sort_order ? sort_order : this.sort.order;
        }
        this.selectedStage = config.selectedStage || null;
        this.stages = config.stages || [];
        this.mention_options = config.mention_options || null;
        this.canChangeNotificationVisibility = config.hasOwnProperty("canChangeNotificationVisibility") ? config.canChangeNotificationVisibility : false; //No I18N
        this.conv_title = config.conv_title || this.conv_title;
    },
    initLite: function (callback) {
        var self = this;
        if (jQuery("#conv-component-html").length === 0) {
            jQuery("body").append("<div id='conv-component-html'></div>"); //No I18N
            self.loadConversationTemplates(function () {
                self.attachEvents();
                callback(self);
            });
        } else {
            self.attachEvents();
            callback(self);
        }
    },
    /**
     * Initializes the component
     */
    init: function () {

        var self = this;
        if (jQuery("#conv-component-html").length === 0) {
            self.loadConversationTemplates(function () {
                self.render();
            });
        }
        else{
            self.render();
        }
    },
    /**
     * Render the conversation
     */
    render: function () {

        var self = this;
        /** Render the container*/
        var container_data = {};
        container_data.disable_header = self.disable_header;
        container_data.preview_mode = self.preview_mode;
        container_data.canAddNote = self.canAddNote;
        container_data.expand = self.config.expand ? true : false;
        container_data.sort = self.config.sort;
        container_data.conv_title = self.conv_title;

        renderhbs(self.container,'conversation_container_template', container_data, false, 'conversation'); //No I18N

        if (self.config.selected_filters) {
            self.renderFilter();
        }
        self.loaded_notifications = 0;
        self.loadConversations(false);

        self.attachEvents();

    },

    loadConversationTemplates: function (callback) {
        ResourceLoader({
            js: ['/scripts/hbs-template-conversation.js'], // No I18N
            success: function(){
         callback();
            }
        });
    },
    /**
     * Reinitializes the component
     */
    reinitialize: function () {
        var self = this;
        self.defaults();
        self.setConfig(self.config);
        self.init();

    },
    /**
     * Loads conversation using api for the component
     * @param {Boolean} more Whether conversation should be loaded on clicking load more
     */
    loadConversations: function (more) {
        var self = this,
            $container = jQuery(self.container);
        var json = {};
        var lazy_load = (self.config.hasOwnProperty('lazy_load')) ? self.config.lazy_load : true;	//No I18N
        if (!lazy_load && self.current_conversations) {
            self.renderCompleteConversations(more);
            return;
        }

        var afterLoad = function () {
            self.loaded_notifications += json.conversations.length;
            if (!json.list_info.hasOwnProperty("has_more_rows") && json.list_info.hasOwnProperty("total_count")) {
                if (parseInt(json.list_info.total_count) > self.loaded_notifications) {
                    json.list_info.has_more_rows = true;
                } else {
                    json.list_info.has_more_rows = false;
                }
            }
            self.has_more_rows = json.list_info.has_more_rows;
            json.module = self.module;
            json.module_id = self.module_id;
            json.usertype = self.usertype;
            json.preview_mode = self.preview_mode;
            json.visibility = self.visibility;
            json.only_notes = self.only_notes;
            json.canReplyEmail = self.canReplyEmail;
            json.canForwardEmail = self.canForwardEmail;
            json.externalframe = self.externalframe;
            json.config = self.config;

            /** setting the notes edit permission info in all the notes object */
            for (var i = 0, len = json.conversations.length; i < len; i++) {
                if (json.conversations[i].type === "notes") {
                    var created_by = json.conversations[i].hasOwnProperty("created_by") ? json.conversations[i].created_by.id : (json.conversations[i].hasOwnProperty("added_by") ? json.conversations[i].added_by.id : json.conversations[i].performed_by.id);	//No I18N
                    json.conversations[i].canEditNote = false;

                    if (created_by == sdp_user.LOGGEDIN_USERID) {
						json.conversations[i].canEditNote = (self.module == "releases" || self.module == "problems" ||self.module == "changes" ) ? true : sdp_user.ROLES.indexOf("EditDeleteOwnNotes") > -1;	//No I18N
                    } else {
						json.conversations[i].canEditNote = (self.module == "releases" || self.module == "problems" ||self.module == "changes" ) ? false : sdp_user.ROLES.indexOf("DeletingOthersNotes") > -1;	//No I18N
                    }
                }
            }

            if (self.start_index == 1) {
                self.complete_conversations = [];
            }
            jQuery.each(json.conversations, function (index, conversation) {
                self.complete_conversations.push(conversation);
            });

            if (!lazy_load && !self.config.has_data) {
                self.current_conversations = json;
                self.renderCompleteConversations(more);
                //callback function on after load conversations
                if (typeof self.config.afterLoadConversations === "function") {
                    self.config.afterLoadConversations.call(self);
                }
                return;
            }
            self.renderConversationTempl(json, more);
            //callback function on after load conversations
            if (typeof self.config.afterLoadConversations === "function") {
                self.config.afterLoadConversations.call(self);
            }
        };

        if (self.config.has_data) {
            json.conversations = self.config.data.conversations ? self.config.data.conversations : [];
            json.list_info = {
                has_more_rows: false,
                row_count: json.conversations.length,
                start_index: 1
            };
            afterLoad();
        } else {
            var url;
            var input_data = {
                'list_info': {	//No I18N
                    'start_index': self.start_index === undefined ? 1 : self.start_index,	//No I18N
                    'sort_order': self.sort.order	//No I18N
                }
            };
			var searchFields = ["notify_change","reply","forward","CHG_INCOMING", "approver_reply"]; //No I18N
			var fieldsRequired = ["id","sent_time","sender","type","id","has_attachments"]; //No I18N

            if (self.only_notes) {
                url = "/api/v3/" + self.module + "/" + self.module_id + "/notes";	//No I18N
                input_data.list_info.sort_field = "added_time.value";	//No I18N
                if (self.selectedStage) {
					input_data.list_info.search_criteria = {
						"field": "stage.id",	//No I18N
						"value": self.selectedStage.id,	//No I18N
						"condition": "is"	//No I18N
                    }
                }
                // Field - has_attachments is not shown by default in get list api call
                self.notes && self.notes.fields_required && (input_data.list_info.fields_required = self.notes.fields_required);

            } else {
				if(self.module === 'changes'){
					url = "/api/v3/"+ self.module+"/" + self.module_id +"/notifications";	//No I18N
				}
				else{
					url = "/api/v3/"+ self.module+"/" + self.module_id +"/_conversations";	//No I18N
				}
                if ((self.system_notifications && self.config.selected_filters && self.config.selected_filters.indexOf('system_notifications') > -1) || self.default_filter.indexOf('system_notifications') > -1) {
					if(self.module === 'changes'){
						searchFields = searchFields.concat(['system_notification','CH_NOT_TECH', 'CH_NOT_REMOVAL_TECH', 'ChangeStatus', 'Approvalaction_Change', 'ProjectDetached', 'Notify_Project_onChange_Deletion', 'Approval_Statement_40', 'ChangeStatus_E-Mail_Default', 'ChangeAssigned', 'ChangeIncidentAssociated', 'Change_Edit', 'ProblemDetached', 'ChangeCreated', 'Approval_Change', 'ProblemAssociated', 'Change_SLA', 'ChangeRoleRemoval', 'ChangeAssigned_SMS', 'ChangeIncidentDetached', 'Notify_Project_onChange_Closed_Cancelled_Rejected', 'ProjectAssociated', 'ChangeCreated_SMS', 'Change_Status', 'ApproveAction_Change', 'Approval_Statement_9', 'ChangeClosed', 'ZiaAcknowledgement_ApprovalAction', 'ZiaAcknowledgement_InconclusiveAction', 'ZiaAcknowledgement_AlreadyApproved']); //No I18N
					}
					else {
                    input_data.system_notifications = true;
                    }
				}
                if ((self.notes && self.config.selected_filters && self.config.selected_filters.indexOf('notes') > -1) || self.default_filter.indexOf('notes') > -1) {
                    input_data.notes = true;
                }
            }
			var searchCriteria = {'condition': 'in', 'field': 'type', 'values': searchFields}; //No I18N
			if(self.module === 'changes' && !self.only_notes){
				input_data.list_info.sort_field = 'sent_time'; //No I18N
				input_data.list_info.fields_required = fieldsRequired;
				if ((self.system_notifications && self.config.selected_filters && self.config.selected_filters.indexOf('system_notifications') > -1 ) || self.default_filter.indexOf('system_notifications') > -1) {
                    searchCriteria.children=[{condition:"starts with",field:"type",value:"WFNotification_change_EMAIL",logical_operator:"or"}]; //No I18N
                }
				input_data.list_info.search_criteria = searchCriteria
			}
            input_data.list_info.row_count = self.row_count;
            input_data = (typeof sdpToJSON != 'undefined') ? sdpToJSON(input_data) : JSON.stringify(input_data); //NO I18N
            if (self.list_xhr) {
                self.list_xhr.abort();
            }
            if (self.config.extra_param) {
                if (url.indexOf("?") > -1) {
                    url += "&" + self.config.extra_param;	//No I18N
                } else {
                    url += "?" + self.config.extra_param;	//No I18N
                }
            }
            self.list_xhr = sdpAjax({
                url: url,
                type: "GET", // No I18N
				data: (this.config.only_notes || (this.config.module=='requests') || (this.config.module=='releases') || (this.config.module=='problems') || (this.config.module=='changes')) ?  {'input_data': input_data} : {'INPUT_DATA': input_data}, // No I18N
                datatype: "json", // No I18N
                context: this,
                cache: false,
				acceptODCompatible: (!this.config.only_notes && (this.config.module=='releases' || this.config.module=='problems'|| this.config.module=='changes')) ? true : false, // No I18N
                success: function (response) {
                    if (response.response_status.status === "success" || response.response_status[0].status === "success") {
                        if (self.only_notes) {
                            json = response;
                            json.conversations = json.notes;
                            for (var i = 0; i < json.conversations.length; i++) {
                                json.conversations[i].type = "notes";
                                //SD-96067-performed by will always hold added_by details.
                                json.conversations[i].performed_by = json.conversations[i].added_by;
                                json.conversations[i].performed_time = json.conversations[i].added_time;
                                delete json.conversations[i].added_by;
                                delete json.conversations[i].added_time;

                            }
                            delete json.notes;
                        } else {
							if(response.notifications){
								response.conversations = response.notifications;
							}
                            json = response;
                        }
                        afterLoad();
                    } else {
						showalert('failure', translate('sdp.common.server.error.contact.admin'),'isAutoHide=false');//No I18N
                    }
                    self.list_xhr = null;
                    $container.find('[data-id="conv-loader-icon"]').addClass("hide");
                    $container.find("#conversation-holder").removeClass("opac3");
                    // support for open conv panels with or without by default
                    if (self.isExpanded && !(self.config.expand && self.config.expand.expand_panel)) {
                        var $toggleEle = !self.dialog ? $container.find('[data-id="toggle-conv"]') : jQuery(self.dialog.id).find('[data-id="toggle-conv"]');
                        $toggleEle.trigger("click");
                    }
                    else if(self.config.expand && self.config.expand.expand_panel){
                        var $toggleEle = !self.dialog ? $container.find('[data-id="toggle-conv"]') : jQuery(self.dialog.id).find('[data-id="toggle-conv"]');
                        if (!self.isExpanded) {
                            $toggleEle.trigger("click");
                        }
                        else{
                            self.toggleConversation($toggleEle, true);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (textStatus !== "abort") {
						showalert('failure', translate('sdp.common.server.error.contact.admin'),'isAutoHide=false');//No I18N
                        $container.find('[data-id="conv-loader-icon"]').addClass("hide");
                        $container.find("#conversation-holder").removeClass("opac3");
                    }
                }
            });
        }
    },

    /**
     * Loads more conversation on clicking load more element
     * @param {Element} loadEle Load more element
     */
    loadMoreConversations: function (loadEle) {
        var self = this;
        if (loadEle) {
            jQuery(loadEle).css({
                'position': 'relative',	//No I18N
                'height': '150px'	//No I18N
            }).html(ajaxBar());
        }
        setTimeout(function () {
            self.start_index = self.loaded_notifications + 1;
            self.loadConversations(true);
        }, 1);
    },
    /**
     * Loads the conversation body on clicking the conversation panel header
     * @param {String} content_url Content url to get the conversation
     * @param {String} id Conversation id
     * @param {String} type Type of conversation
     */
    loadConversationBody: function (content_url, id, type) {
        if (!id) {
            return;
        }
        var $container = jQuery(this.container);
		$CS.findElement("conversation-section").trigger("conversations:load",[{id:id,type:type}]); // NO I18N
        if ($container.find("#conv-" + id + "-" + type).length > 0) {
            return;
        }
        var json, canEditNote = false, self = this;

        var afterLoad = function () {
            if (!self.config.has_data) {
                if (type === "notes" && !self.preview_mode) {
                    /** since we have Request Note's Edit / Delete permission in client itself, we don't need to make calls to /api/v3/requests/<id>/notes/<note_id>/_links */
                    if (json.note) {
                        var created_by = null;
                        //SD-96067 - updated by user details is not needed here.
                        if (json.note.hasOwnProperty("added_by") && json.note.added_by != null) {
                            created_by = json.note.added_by.id;
                        }
                        else if(json.conversations!=null && json.conversations[i]!=null && json.conversations[i].hasOwnProperty("added_by") && json.conversations[i].added_by!=null){
                            created_by = json.conversations[i].added_by.id;
                        }
                        else{
                            created_by = json.note.performed_by.id;
                        }
                        //var created_by = json.note.hasOwnProperty("last_updated_by") ? json.note.last_updated_by.id : (json.conversations[i].hasOwnProperty("added_by") ? json.conversations[i].added_by.id : json.note.performed_by.id);	//No I18N
                        if (self.module == "requests") {
                            if (created_by != sdp_user.LOGGEDIN_USERID) {
                                if (sdp_user.ROLES.indexOf("DeletingOthersNotes") > -1) {
                                    canEditNote = true;
                                }
                            } else {
                                if (sdp_user.ROLES.indexOf("EditDeleteOwnNotes") > -1) {
                                    canEditNote = true;
                                }
                            }
                        }
						else if(self.module == "releases" || self.module == "problems" ||  self.module == "changes"){
                            if (created_by == sdp_user.LOGGEDIN_USERID) {
                                canEditNote = true;
                            }
                        }
                    }
                }
            }

            var convDetails = {};

            if (json.notification) {
                convDetails = json.notification;
                convDetails.description = appendImageToken(convDetails.description, convDetails.image_token);
            } else if (type === "notes") {	//No I18N
                if (json.note) {
                    convDetails = json.note;
                    convDetails.description = appendImageToken(convDetails.description, convDetails.image_token);
                }
                else if (self.notes_lookup_entity) {
                    convDetails = json[self.notes_lookup_entity];
                }
                convDetails.type = "notes";	//No I18N
            }
            convDetails.canEditNote = canEditNote;

            if (!self.config.has_data) {
                convDetails.email_resend = (type !== "request_approval") ? true : false;	//No I18N
            }
            convDetails.module = self.module;
            convDetails.module_id = self.module_id;
            convDetails.canReplyEmail = self.canReplyEmail;
            convDetails.canForwardEmail = self.canForwardEmail;
            convDetails.canDeleteEmail = self.canDeleteEmail;
            convDetails.usertype = self.usertype;
            convDetails.preview_mode = self.preview_mode;
            convDetails.canSplitRequest = self.canSplitRequest;
            convDetails.externalframe = window.externalframe;

            if ($container.find("#conv-" + id + "-" + type).length == 0) {
                var convEl = $container.find("#conv-panel-" + id + "-" + type);	//No I18N
                renderhbs(convEl.find("z-cpcontent"),'conversation_body_template', convDetails, true, 'conversation');
                // for change module, data mail to and mail cc needed
                convDetails.from && convEl.data("conv_from", convDetails.from.email_id);//No I18N
                convDetails.to && convEl.data("conv_to", convDetails.to.join(","));//No I18N
                convDetails.cc && convEl.data("conv_cc", convDetails.cc.join(","));//No I18N
                convDetails.bcc && convEl.data("conv_bcc", convDetails.bcc.join(","));//No I18N
                var has_bq = false;
                /*
                    * Finding the blockquote without border to avoid the blockquotes present inside the latest conversation content
                    * as currently we don't have any extra info to find the earlier conversation blockquote
                    */
                jQuery.each($container.find("#conv-" + id + "-" + type + " .panel-body blockquote"), function (element, index) {	//No I18N
                    if (this.style.border === "") {	//No I18N
                        last_BQ = jQuery(this);
                        last_BQ.addClass('bq-content').hide();
                        $container.find("#viewQuotedContent-" + id + "-" + type).insertBefore(last_BQ);	//No I18N
                        has_bq = true;
                        return false;
                    }
                });
                if (!has_bq) {
                    $container.find("#viewQuotedContent-" + id + "-" + type).remove();	//No I18N
                }
                // To highlight the reply btn on opening the conversation
                if (convEl.find(":hover").length > 0) {
                    convEl.trigger("mouseenter");
                }
            }
            if (self.module.toLowerCase() === "requests" && convDetails.type.toLowerCase() === "conversation") {
                self.complete_loaded_notifications.conversations[convDetails.id] = convDetails;
            } else {
                self.complete_loaded_notifications.notifications[convDetails.id] = convDetails;
            }

            /**
             * Load Attachment Preview for the Conversarion
             */
            var attachPreviewOptions = {
                upload: false,
                enable_delete: false
            };

            if (self.preview_mode) {
                attachPreviewOptions.download = false;
                attachPreviewOptions.print_preview = true;
            }
            $container.find(".conv-attachments").not('.atp-container-target').each(function (index, el) { // NO I18N
                var atp = new attachPreview(jQuery(this), attachPreviewOptions);
            });

            /** Initializing the image viewer for the Note's Description*/
            var imageViewer = new attachPreview(self.container + " #conv-panel-" + id + "-" + type + ' .req-des', { // NO I18N
                layouts: false,
                upload: false,
                target: 'img', // NO I18N
                excludeChildOf: 'a', // NO I18N
                external_links: true
            });
            //118119 -- RTA section Zoho color contrast changes updated
			      ThemeCustomizer.zcontrastcolorinit(self.container+" #conv-panel-" + id +"-" +type);// NO I18N
        };

        /** If the component is initialized with entire data, the content will be taken from the local data, else the content will be fetched through API */
        if (this.config.has_data) {
            for (var i = 0; i < this.complete_conversations.length; i++) {
                if (this.complete_conversations[i].id == id) {
                    if (type === "notes") {
                        /** As both notes and conversation might have same id, it is necessary to check the type as well */
                        if (this.complete_conversations[i].type === "notes") {
                            json = {note: this.complete_conversations[i]};
                        } else {
                            continue;
                        }
                    } else {
                        if (this.complete_conversations[i].type === "notes") {
                            continue;
                        } else {
                            json = {notification: this.complete_conversations[i]};
                        }
                    }
                    break;
                }
            }
            afterLoad();
        } else {
            if (this.only_notes) {
                content_url = content_url ? content_url : "/api/v3/" + this.module + "/" + this.module_id + "/notes/" + id;	//No I18N
                for (var i = 0; i < this.complete_conversations.length; i++) {
                    if (this.complete_conversations[i].id == id) {
                        json = {note: this.complete_conversations[i]};
                        break;
                    }
                }
            }
            if (!this.only_notes || !json || (!json.title && !json.subject)) {
                if (this.config.extra_param) {
                    if (content_url.indexOf("?") > -1) {
                        content_url += "&" + this.config.extra_param;	//No I18N
                    } else {
                        content_url += "?" + this.config.extra_param;	//No I18N
                    }
                }
				var handleFailure = (message)=>{
					if(message){
						 showalert('failure',message,'isAutoHide=false');//No I18N
					}else{
						 showalert('failure', translate('sdp.common.server.error.contact.admin'),'isAutoHide=false');//No I18N
					}
				}
                sdpAjax({
                    url: encodeURI(content_url),
                    type: "GET",	//No I18N
                    datatype: "json",	//No I18N
                    cache: false,
					acceptODCompatible: (!this.only_notes && (this.config.module=='releases' || this.config.module=='problems'|| this.config.module=='changes')) ? true : false, // No I18N
                    success: function (response) {
                        if (response.response_status.status === "success") {
                            json = response;
                            afterLoad();
                        } else {
							let message = response.response_status.messages && response.response_status.messages[0] && response.response_status.messages[0].message;
							handleFailure(message);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
					    var data =jqXHR.responseJSON;
						var messageObj =data.response_status.messages && data.response_status.messages[0];
                        if(data.response_status.status === "warning" && messageObj && messageObj.status_code===21004){
							/*
							   Error code 21004 will be sent in notification get call when notification description file got missed.
							   In such case, An info icon with helptext containing the warning message will be appended.
							   jQuery('#conv-'+id+'-warning') => id will be notification's id.
					        */
					            jQuery('#conv-'+id+'-warning').removeClass('hide');
								let msg = messageObj.message.split('.')[0];
								let fields = messageObj.fields.slice();
								let descInd = fields.indexOf('description');
					            fields[descInd] = getMessageForKey('common.description');
								msg +=" : ";  msg += fields.join(", "); msg += ".";
                        		jQuery('#conv-'+id+'-warning').attr("title",`${msg}`);
                        		json=data;
                        		afterLoad();
                        	}else{
                        	    let message = messageObj && messageObj.message
							    handleFailure(message);
						}
                    }
                });
            } else {
                afterLoad();
            }
        }
        iframeTextoutlook();
    },

    /**
     * Appends the loaded more conversation to the already rendered conversation
     * @param {Object} json JSON to handlebar template
     * @param {Boolean} more Whether the conversation should be rendered on clicking load more
     */
    renderConversationTempl: function (json, more) {
        var applied_filter = [];
        var $container = jQuery(this.container), self = this;
        if (more !== true) {
            renderhbs($container.find("#conversation-holder"),'conversation_template', json, false, 'conversation');
        } else {
            renderhbs($container.find("#conversation-holder"),'conversation_template', json, true, 'conversation');
        }
        this.setLoadMore();
        if ($container.find("input[name='conv-filter-chkb']").length > 0) {	//No I18N
            applied_filter = this.getSelectedFilterArray('conv-filter-chkb');	//No I18N
        }
        if (!self.preview_mode) {
            this.openLatestConversation(more);
        }

        /* To bind the mouseenter and mouseleave event for the conv panel to toggle the highlight of Reply button */
        CommonUIActions.convAccord();
        if (more) {
            if (self.isExpanded) {
                self.toggleConversation(undefined, true);
            }
        }
    },

    /**
     * Renders the Conversation template alone completely
     * @param {Boolean} more Whether the conversation should be rendered on clicking load more
     */
    renderCompleteConversations: function (more) {
        var self = this;
        var show_count = self.show_count;
        var selFilters = self.getSelectedFilterArray('conv-filter-chkb')
        if (selFilters.length === 1 && selFilters.indexOf("notes") !== -1) {
            show_count = self.hasOwnProperty('notes_count') ? self.notes_count : (self.hasOwnProperty('row_count') ? self.row_count : 20);	//No I18N
        }
        var content = {};
        for (var key in self.current_conversations) {
            if (key != "conversations") {
                content[key] = self.current_conversations[key];
            }
        }

        if (self.shown_notifications === undefined || self.shown_notifications === null) {
            self.shown_notifications = 0;
        }
        var from_index = self.shown_notifications;
        var end_index = self.shown_notifications + show_count;
        content.conversations = self.current_conversations.conversations.slice(from_index, end_index);
        if (content.list_info.has_more_rows && content.conversations.length == 0) {
            self.current_conversations = null;
            self.shown_notifications = 0;
            self.loadMoreConversations();
            return;
        }

        self.shown_notifications += content.conversations.length;
        if (!content.list_info.has_more_rows) {
            if (self.current_conversations.conversations.length > self.shown_notifications) {
                self.has_more_rows = true;
            } else {
                self.has_more_rows = false;
            }
        }
        content.container = self.container;
        var display_val = content;
        self.renderConversationTempl(display_val, more);
    },

    /**
     * checks for the more content and sets the Load More option
     */
    setLoadMore: function () {
        var $container = jQuery(this.container);
        $container.find(".more-conv-panel").remove();
        if (this.has_more_rows) {
			var loadMoreContent = this.only_notes ? translate("conversations.note.load.more") : translate("conversations.load.more")
            $container.find(".load-more").html(loadMoreContent); //NO I18N
            var loadMoreEle = $container.find(".lazyload").clone(true, true);
            loadMoreEle.removeAttr('id').addClass('more-conv-panel').removeClass('hide');
            loadMoreEle.find("div").removeAttr("id");
            loadMoreEle.find(".heading").addClass("load-more");
            $container.find("#conversation-holder").append(loadMoreEle);
            $container.find("#conversation-holder > div").addClass('lazy-container'); //NO I18N
        } else {
			$container.find(".load-more").html("0 "+translate("conversations.more")); //NO I18N
            $container.find(".lazyload").addClass("hide");	//No I18N
        }
        $CS.findElement("conversation-section").trigger("conversations:load"); //No I18N
    },

    /**
     * Renders the filter template using the constructed JSON
     */
    renderFilter: function () {
        var self = this,
            $container = jQuery(self.container);
        /* Get the already applied filters if present */
        var applied_filter = null;
        if ($container.find("input[name='conv-filter-chkb']").length > 0) {
            applied_filter = self.getSelectedFilterArray('conv-filter-chkb');	//No I18N
        }

        var filter_data = {};
        if (self.system_notifications) {
            filter_data.system_notifications = {};
            filter_data.system_notifications.active = self.config.selected_filters.indexOf("system_notifications") > -1 ? true : false;
        }
        if (self.notes) {
            filter_data.notes = {};
            filter_data.notes.active = self.config.selected_filters.indexOf("notes") > -1 ? true : false;
        }

        renderhbs($container.find('[data-id="conv-filter"]'),'conversation_filter_template', filter_data, false, 'conversation');

        /* check whether the filter is already applied and selects the same after rendering the template */
        if (applied_filter) {
            $container.find("input[name='conv-filter-chkb']").each(function (i, element) {	//No I18N
                if (applied_filter.indexOf(element.value) < 0) {
                    jQuery(element).prop("checked", false);	//No I18N
                } else {
                    jQuery(element).prop("checked", true);	//No I18N
                }
            });
        }

        $container.find("input[name='conv-filter-chkb']").on('change', function () {	//No I18N
            $container.find('[data-id="conv-loader-icon"]').removeClass("hide");
            $container.find("#conversation-holder").addClass("opac3");
            var filterArray = self.getSelectedFilterArray('conv-filter-chkb');	//No I18N
            self.applyFilter(filterArray);
        });
    },
    /**
     * Applies the filter to the template
     * @param {Array} filters Selected filters
     */
    applyFilter: function (filters) {
        var self = this;
        if (filters.length === 1 && filters.indexOf("notes") > -1) {
            self.only_notes = true;
            var sys_not_index = self.config.selected_filters.indexOf("system_notifications");	//No I18N
            if (sys_not_index > -1) {
                self.config.selected_filters.splice(sys_not_index, 1);
            }

        } else {
            self.only_notes = false;
            var removable_filters = ["system_notifications", "notes"];	//No I18N
            for (var i = 0; i < removable_filters.length; i++) {
                var filter_index = self.config.selected_filters.indexOf(removable_filters[i]);
                if (filters.indexOf(removable_filters[i]) > -1) {
                    if (filter_index === -1) {
                        self.config.selected_filters.push(removable_filters[i]);
                    }
                } else {
                    if (filter_index > -1) {
                        self.config.selected_filters.splice(filter_index, 1);
                    }
                }
            }
        }
        self.current_conversations = null;
        self.complete_conversations = [];
        self.shown_notifications = 0;
        self.start_index = 1;
        self.loaded_notifications = 0;
        self.loadConversations(false);
    },

    /**
     * Toggles hide/show the conversation based on the filter checked/unchecked
     */
    toggleFilteredConv: function (filterArray) {
        var self = this,
            $container = jQuery(self.container);
        var container = $container.find("#conversation-holder");
        container.find('.conv').addClass('hide');	//No I18N
        jQuery.each(filterArray, function (index, filter) {
            container.find('.conv-' + filter).removeClass('hide');	//No I18N
        });
    },

    /**
     * Gets the currently selected filters from the checkboxes
     * @param {String} checkBox Checkbox name
     */
    getSelectedFilterArray: function (checkBox) {
        var self = this,
            $container = jQuery(self.container);
        var filterArray = [];
        $container.find("input[name='" + checkBox + "']:checked").each(function (i, filter) {	//No I18N
            filterArray.push(filter.value);
        });

        if (filterArray.indexOf("email") === -1) {
            $container.find('[data-id="convFilter_system"]').prop("checked", false).prop("disabled", true); //No I18N
            if (filterArray.indexOf("system_notifications") > -1) {
                filterArray.splice(filterArray.indexOf("system_notifications"), 1);
            }
        }

        /** Disabling the filter checkbox, if only one checkbox is selected */
        if (filterArray.length === 1){
            $container.find("input[name='" + checkBox + "']:checked").prop("disabled", true);	//No I18N
        } else {
            $container.find("input[name='" + checkBox + "']:checked").prop("disabled", false);	//No I18N

            if (filterArray.indexOf("email") > -1) {
                $container.find('[data-id="convFilter_system"]').prop("disabled", false);  //No I18N
                if(filterArray.length === 2 && filterArray.indexOf("system_notifications") > -1) {
                    $container.find('[data-id="convFilter_email"]').prop("disabled", true);  //No I18N
                } else {
                    $container.find('[data-id="convFilter_email"]').prop("disabled", false);  //No I18N
                }
            }
        }
        return filterArray;
    },

    /*
    * Returns count of the types of the conversations for the Filter template
    */
    getProcessedJSON: function (data) {
        var system_notif_count = 0, email_notif_count = 0, notes_count = 0, drafts_count = 0;
        jQuery.each(data, function (index, conversation) {
            var type = conversation.type;
            if (type === "notes") {
                notes_count++;
            } else if (type === "draft") { // No I18N
                drafts_count++;
            } else if (type === "system_notification") { // No I18N
                system_notif_count++;
            } else {
                email_notif_count++;
            }
        });
        var filter_counts = {};
        filter_counts.system_notif_count = system_notif_count;
        filter_counts.email_notif_count = email_notif_count;
        filter_counts.notes_count = notes_count;
        filter_counts.drafts_count = drafts_count;
        return filter_counts;
    },

    /**
     * Opens the most recent conversation
     * @param {Boolean} more Whether on load more clicked
     */
    openLatestConversation: function (more) {
        var self = this,
            $container = jQuery(self.container);
        var convArr = $container.find("#conversation-holder > z-collapsiblepanel").not(".lazyload");	//No I18N
        for (var i = 0, len = convArr.length; i < len; i++) {
            /** opening the latest conversation which is not a system notification */
            if (jQuery(convArr[i]).attr("id") && jQuery(convArr[i]).attr("id").indexOf("system_notification") === -1 && jQuery(convArr[i]).is(":visible")) {
                if (!jQuery(convArr[i]).hasClass("is-selected")) {
                    if (!more) {
                        jQuery(convArr[i]).find("> div:first").addClass("latest-conv").trigger("click");	//No I18N
                    }
                }
                break;
            } else {
                continue;
            }
        }
    },
    /**
     * Toggle the conversation (Expand All / Collaplse All)
     * @param {Element} element Toggle element
     * @param {Boolean} isForced Force do expand/collapse. Used in case of load more
     */
    toggleConversation: function (element, isForced) {
        var self = this,
            $container = jQuery(self.container);
        var flag = false;
        var isExpanded = !isForced ? !self.isExpanded : self.isExpanded;

        self.isExpanded = isExpanded;

        // change the icon and title
        var icon = isExpanded ? 'cspr collapse-arrow1 icon-sm vsub' : 'cspr expand-arrow1 icon-sm vsub'; // NO I18N
		var title = isExpanded ? translate('sdp.common.collapseall') : translate('sdp.common.expandall');

        if (jQuery(element).length != 0) {
            jQuery(element).attr('title', title).attr('rel', 'uitip').find('.cspr').attr('class', icon);
            initTooltip(self.config.only_notes ? (self.config.dialog ? '#view-conv-header' : '#notes_section') : self.container); //No I18N
        }

        // Iterate all the convesation panel
        $container.find("z-collapsiblepanel").each(function (index, el) {
            var panel = jQuery(this);
            var panelBody = panel.find('z-cpcontent');
            var heading = panel.find("z-cpheading");

            if (isExpanded) {
                if (!panel.hasClass("is-selected")) {
                    heading.trigger("click");
                }
            } else {
                if (panel.hasClass("is-selected")) {
                    heading.trigger("click");
                }

            }
        });
    },
    /**
     * Toggle the conversation sorting (ascending/descending)
     * @param {Element} element Sort element
     */
    toggleSortConversation: function (element) {
        var self = this;
        var $container = jQuery(self.container);
        $container.find('[data-id="conv-loader-icon"]').removeClass("hide");
        $container.find("#conversation-holder").addClass("opac3");
        setTimeout(function () {
            if (self.sort.order === "desc") {
                self.sort.order = "asc";	//No I18N
				var latest = translate('common.sortby.latest');
                jQuery(element).find('span').removeClass('sort-down').addClass('sort-up');	//No I18N
                jQuery(element).attr('title', latest).attr('rel', 'uitip');	//No I18N
            } else {
                self.sort.order = "desc";	//No I18N
				var oldest = translate('common.sortby.oldest');
                jQuery(element).find('span').removeClass('sort-up').addClass('sort-down');	//No I18N
                jQuery(element).attr('title', oldest).attr('rel', 'uitip');	//No I18N
            }
            initTooltip(self.config.only_notes ? (self.config.dialog ? '#view-conv-header' : '#notes_section') : self.container); //No I18N
            self.current_conversations = null;
            self.complete_conversations = [];
            self.shown_notifications = 0;
            self.start_index = 1;
            self.loaded_notifications = 0;
            self.loadConversations(false);
            self.setSortPersonalizeInfo(self.module, self.sort.order, self.sort.key);
        }, 1);
    },
    /**
     * Fn to toggle the Conversation visiblity (i.e., public/private)
     * @param {String} id Conversation id
     * @param {String} type Type of the conversation
     * @param {Boolean} isPublic Whether to show this conversation to requester
     * @param {String} woID Request id for the conversation
     * @param {Element} element Public/Private element
     */
    toggleConversationVisiblitly: function (id, type, isPublic, woID, element) {
        var self = this;
        var module = this.module === "requests" ? "Request" : this.module;	//No I18N
        element = jQuery(element);
        isPublic = !isPublic;
        var inputData = {}
        var url = 'api/v3/requests/' + woID;//No I18N
        if (type === "notes") {
            url = url + '/notes/' + id;//No I18N
            var note = {};
            note.show_to_requester = isPublic;
            inputData = window.sdpToJSON({"note": note});//No I18N
        } else {
			url = url+'/notifications/'+id+'/_update_scope';//No I18N
            var notification = {}
            notification.type = (type === "conversation") ? "Conversation" : "Notification";//No I18N
            notification.is_public = isPublic;
            inputData = window.sdpToJSON(notification);
        }
        sdpAjax({
            url: url,
            type: "PUT",//No I18N
            data: {input_data: inputData},
            success: function (response) {
                if (response.response_status.status === "success") {//No I18N
                    // when Note's showToRequester (isPublic) field is different in inputData and response, warning alert message is shown
                    if (response.note && response.note.show_to_requester != isPublic) {
                        showalert('warning', getMessageForKey('brnote.visibility'), 'isAutoHide=false');    //NO I18N
                    }
                    else if (isPublic) {
                        var tooltip = translate("sdp.project.filters.markedaspublic");
                        element.attr({'isPrivate': 'false', 'title': tooltip}).attr('rel', 'uitip'); //NO I18N
                        element.find('span').removeClass('lock-line-clr').addClass('unlock-line opac7');	//No I18N
                    } else {
								var tooltip = translate("sdp.project.filters.markedasprivate");
                        element.attr({'isPrivate': 'true', 'title': tooltip}).attr('rel', 'uitip');  //NO I18N
                        element.find('span').removeClass('unlock-line opac7').addClass('lock-line-clr');	//No I18N
                    }
                    initTooltip(`#conv-panel-${id}-${type}`);
                    if (type === "notes") {//No I18N
                        self.config.afterNoteAdd();
                    }
                }
            },
            error: function (response) {
                response = response.responseJSON;
                if (response.response_status.messages) {
                    if (typeof response.response_status.messages[0].message === "object" && response.response_status.messages[0].message.mentions && response.response_status.messages[0].message.mentions.length > 0) {
                        showalert('failure', getMessageForKey("sdp.requests.note.addnote.error.mentions"), "isAutoHide=true"); // No I18N
                    }
                    else if (typeof response.response_status.messages[0].message === "string") {
                        showalert('failure', e_html(response.response_status.messages[0].message), "isAutoHide=false"); // No I18N
                    }
                }

            }
        });
        // event.stopPropagation();
    },

    /**
     * Stores the sort personalisation for the conversations
     * @param {String} module Module name
     * @param {String} sort_order Sort order of the conversation
     * @param {String} sort_key Database key for the sort column
     */
    setSortPersonalizeInfo: function (module, sort_order, sort_key) {
        if (!sort_key) {
            if (module) {
                sort_key = module + "_conv_sort";	//No I18N
            } else {
                return false;
            }
        }
        var data = {};
        data[sort_key] = sort_order;
        window.addPersonalization(sort_key, data);
    },
    /**
     * Toggles the quotes content of the conversations
     * @param {String} id Id of the conversation
     * @param {String} type Type of the conversation
     */
    toggleQuotedContent: function (id, type) {
        var $container = jQuery(this.container);
        $container.find("#conv-" + id + "-" + type + " .bq-content").toggle();	//No I18N
    },
    /**
     * Fetches the personalised Sort configuration for the conversations
     * @param {String} module Module name
     * @param {String} sort_key Database key for the sort column
     */
    getSortPersonalizeInfo: function (module, sort_key) {
        if (!sort_key) {
            if (module) {
                sort_key = module + "_conv_sort";	//No I18N
            } else {
                return null;
            }
        }
        var sort_info = window.getPersonalizeData(sort_key);
        if (sort_info && sort_info[sort_key]) {
            return sort_info[sort_key] === "asc" ? "asc" : "desc";	//No I18N
        } else {
            return null;
        }
    },
    /**
     * Scroll to the attachments section of the body
     * @param {Element} convElement Conversation element
     */
    scrollToConvAttachments: function (convElement) {
        var self = this;
        var $container = jQuery(self.container);
        var $convElement = $container.find(convElement);
        if ($convElement.closest("z-collapsiblepanel").hasClass('is-selected')) {
            var $element = $convElement.find(".conv-attachments");
            //Element for which animation is applied
            var containr = self.dialog ? "#_DIALOG_CONTENT" : undefined; //No I18N
            scrollToAttachments($element, containr);	//No I18N
        }
    },
    /**
     * Opens the conversation sender details pop up
     * @param {String} userId User id to show the details
     */
    openUserDetails: function (userId, event) {
        /** for System user, the User Dialog will not be invoked from the conversation component. */
        if (userId == "1") {
            return;
        }
        window.NewWindow('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + userId + '&minContent=true', translate('sdp.inventory.wsRtPanel.userDetails'), '450', '500', 'yes', 'center', null, null, null, true);	//No I18N
    },

    /**
     * Opens note form in dialog
     * @param {String} modId Module id
     * @param {String} noteId Note id
     */
    openNoteForm: function (ele, modId, noteId, skipDialog) {
        var self = this;
        var templateValue = {module: self.module};
        templateValue.showPublicCheck = (self.usertype === "Technician") ? true : false;	//No I18N
        templateValue.enable_mention = self.config.hasOwnProperty("enable_mention") ? self.config.enable_mention : true;	//No I18N
        var view = !noteId ? "add" : "edit";	//No I18N
        // Object to store the note data temporarily
        self.note.noteId = ""; 	//No I18N
        self.note.uploadedAttachments = [];
        //For release, stage input will be loaded
        var setStageInForm = function () {
            var formatResult = function (item) {
                var optionStr = e_html(item.name || item.text);
                return optionStr;
            };
            var stageEle = jQuery("#noteStage");
            var options = {
				placeholder: translate('common.select.placeholder'), 	//No I18N
                data: self.stages,
                formatNoMatches: translate("common.no.match.found"), //No I18N
                formatSelection: formatResult,
                formatResult: formatResult,
                matcher: function (term, text, option) {
                    text = text && text !== "undefined" ? text : (option ? (option.name || option.text) : "");	//No I18N
                    return text.toLowerCase().indexOf(term.toLowerCase()) >= 0;
                },
                allowClear: true
            };
            stageEle.select2(options);
            self.selectedStage && stageEle.select2('data', self.selectedStage);	//No I18N
            (self.config.disableStage || self.selectedStage) && stageEle.prop("disabled", true);	//No I18N
        };
        var openDialog = function (noteForm) {
			var title = view == "edit" ? translate("sdp.requests.notes.editnotes.title") : translate('sdp.requests.viewrequest.addnotes'); //No I18n
			//SD-113111 : Empty the dialog on close
			showDialog(noteForm,' top=50, left=400,width=900,modal=yes,closeOnEscKey=yes,emptyOnClose=true, title=' + title, self.stages && setStageInForm); //No I18n

        };

        // Open New form to add note
        if (view == "add") {
            templateValue.showAddToLinkedRequest = (self.usertype === "Technician" && typeof self.notes.has_linked_requests === "function" && self.notes.has_linked_requests()) ? true : false;	//No I18N
            templateValue.showMarkFirstResponse = (self.usertype === "Technician" && ((typeof self.notes.mark_first_response === "boolean" && self.notes.mark_first_response) || (typeof self.notes.mark_first_response === "function" && self.notes.mark_first_response()))) ? true : false;	//No I18N

            var noteForm = renderhbs(null, "note_form_template", templateValue, false, "conversation", true, true, null, true);

            var afterFormLoad = function () {
                // Enable the add button
                jQuery(ele).prop("disabled", false);  //No I18N
				//when loaded from list view stages are not available and stage perms are not known, allowing common note addition
				self.module=='changes' && (!self.stages||self.stages.length==0) && jQuery('#noteStagesection').remove(); //No I18n
                // Load Rich text editor for notes
                self.loadRTAForNotes();

				if(isMSPOrSCP && templateValue.showMarkFirstResponse && sdp_app.NOTES_ADDITION_DEFAULT_FIRST_RESPONSE) {
					// if mark as first response field is shown
					// check mark as first response by default based on SSP setting
					jQuery("[name='markFirstResponse']").prop("checked", true);	//No I18N
				}
            };
            if (!skipDialog) {
                // If in dialog, slide up to show the form
                if (self.dialog) {
                    self.effectOnFormInDialog(view, noteForm, function () {
                        afterFormLoad();
                    });
                }
                else {
                    openDialog(noteForm);
                    afterFormLoad();
                }
            } else {
                jQuery(ele).html(noteForm);
                afterFormLoad();
            }
        }
        else {
            // Populate the note details on editing the note
            self.note.noteId = noteId;
            self.getNoteDataToLoadForm()
                .done(function (data) {
                    if (data.response_status.status === 'success') {
                        var noteForm = renderhbs(null, "note_form_template", templateValue, false, "conversation", true, true, null, true);

                        var desc;

                        var populateData = function () {
                            var noteData = self.notes_lookup_entity ? data[self.notes_lookup_entity] : data.note;
                            desc = appendImageToken(noteData.description, noteData.image_token);
                            jQuery("#descText").val(desc);
                            jQuery("#isPublicCheck").prop("checked", noteData.show_to_requester); //No I18n
                            jQuery("#noteStage").select2('data', noteData.stage) && jQuery("#noteStage").prop("disabled", true); //No I18n
                            if (noteData.has_attachments) {
                                noteData.attachments.forEach(function (attachment) {
                                    var a = '<button type="button" data-href="' + e_attr(attachment.content_url) + '" data-attach-id="' + e_attr(attachment.id) + '" data-attach-size="' + e_attr(attachment.size.display_value) + '" data-attach-by="' + e_attr(attachment.attached_by.name) + '" data-attach-on="' + e_attr(attachment.attached_on.display_value) + '">' + e_html(attachment.name) + '</button>'; //No I18N
                                    jQuery("#notes-attachments-api").append(a); //No I18N
                                });
                                self.note.uploadedAttachments = noteData.attachments;
                            }
                            // Enable the edit button
                            jQuery(ele).prop("disabled", false);  //No I18N

                            self.loadRTAForNotes();
						//when loaded from list view stages are not available and stage perms are not known, allowing common note addition
						self.module=='changes' && (!self.stages||self.stages.length==0) && jQuery('#noteStagesection').remove();//No I18n
                        };
                        // If in dialog, slide up to show the form
                        if (self.dialog) {
                            self.effectOnFormInDialog(view, noteForm, populateData);
                        }
                        else {
                            openDialog(noteForm);
                            populateData();
                        }
                    }
                });
        }

        //bind event for elements inside note form
        self.attachEventsForNoteForm();
    },
    /**
     * Function to delete the note
     * @param {String} modId Module id
     * @param {String} noteId Note id
     */
    onNoteDelete: function (modId, noteId) {
        var self = this;
		var deleteNote=function (confirm)
		{
			if(confirm)
			{
            sdpAjax({
                url: '/api/v3/' + self.module + '/' + modId + '/notes/' + noteId,//No I18N
                type: 'DELETE',//No I18N
                success: function (response) {
                    if (response.response_status.status === 'success') {
							showalert('success',translate("sdp.change.note.delete.successfull"),"isAutoHide=true"); // No I18N
                        self.reinitialize();
                    }
                },
                error: function (response) {
                    response = response.responseJSON;
                    /* Notes negate action error message */
                    if (response && response.response_status && response.response_status.messages && response.response_status.messages[0] && response.response_status.messages[0].status_code === 4510) {
                        showalert('failure', e_html(response.response_status.messages[0].message), 'isAutoHide=false'); // No I18N
                    }
                }
            });
        }
    }
    showconfirm(true,'title='+translate("common.confirm")+', message='+translate("sdp.requests.viewrequest.notes.confirmDelete")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',deleteNote,true); //No I18N


	},
    /**
     * Invokes the emailReply method in the config
     * @param {Object} data Data attribute which holds the details of conversation(id,content_url,type)
     */
    emailReply: function (data, replyAll) {
        typeof this.config.emailReply === "function" && this.config.emailReply(data, replyAll);//No I18N
    },
    /**
     * Invokes the emailForward method in the config
     * @param {Object} data Data attribute which holds the details of conversation(id,content_url,type)
     */
    emailForward: function (data) {
        typeof this.config.emailForward === "function" && this.config.emailForward(data);//No I18N
    },
    /**
     * Invokes the emailResend method in the config
     * @param {Object} data Data attribute which holds the details of conversation(id,content_url,type)
     */
    emailResend: function (data) {
        typeof this.config.emailResend === "function" && this.config.emailResend(data);//No I18N
    },
    /**
     * Invokes the emailSplit method in the config
     * @param {Object} data Data attribute which holds the details of conversation(id,content_url,type)
     */
    emailSplit: function (data) {
        typeof this.config.emailSplit === "function" && this.config.emailSplit(data);//No I18N
    },
    /**
     * Invokes the emailDelete method in the config
     * @param {Object} data Data attribute which holds the details of conversation(id,content_url,type)
     */
    emailDelete: function (modId, convID) {

        var self = this;

		if(window.confirm(window.translate('sdp.requests.viewrequest.thread.delete.confirm'))) {
            jQuery('.page-progressbar').show();	//No I18N
			sdpAjax({
                url: 'api/v3/requests/' + modId + '/notifications/' + convID,	//NO I18N
                type: 'DELETE',	//NO I18N
                cache: false,
                success: function (data) {
						$req.utils.alert('success', translate('conversations.delete.success'), 'isAutoHide=true');	//NO I18N

                    self.config.hasOwnProperty("afterEmailDelete")	//No I18N
                    && (typeof self.config.afterEmailDelete === 'function')	//No I18N
                    && self.config.afterEmailDelete.call(self);

                    self.reinitialize();
                },
                error: function (response) {
                    response = response.responseJSON;
                    if (response.response_status.messages) {
                        if (typeof response.response_status.messages[0].message === "string") {
                            showalert('failure', e_html(response.response_status.messages[0].message), "isAutoHide=false"); // No I18N
                        }
                    }
                }
            });
            jQuery('.page-progressbar').hide();	//No I18N
        }
    },
    /**
     * Attach events for the element inside the component
     */
    attachEvents: function () {
        var self = this,
            $container = jQuery(self.container);

        //Remove all delegated event handlers
        $container.off("click", "**");	//No I18N
        /** Remove zoho component collapsible-panels toggle event using attribute "data-ztoggle='false'" **/
        $container.on('zbeforepanelcollapse', function (event) {
            var $this = event.originalEvent && event.originalEvent.originalEvent ? event.originalEvent.originalEvent.target : event.originalEvent.target;
            if (jQuery($this).attr("data-ztoggle") === "false" || jQuery($this).closest("[data-ztoggle=false]").length >= 1) {
                return false;
            }
        });
        $container.on('zbeforepanelexpand', function (event) {
            var $this = event.originalEvent && event.originalEvent.originalEvent ? event.originalEvent.originalEvent.target : event.originalEvent.target;
            if (jQuery($this).attr("data-ztoggle") === "false" || jQuery($this).closest("[data-ztoggle=false]").length >= 1) {
                return false;
            }
        });

        //Actions only to technician
        if (sdp_user.USERTYPE === "Technician") {
            /**
             * Handles both click and Enter key interactions on user and placeholder mention spans.
             */
            $container
            .off(".mentionHandler")  //No I18N
            .on('click.mentionHandler keydown.mentionHandler', 'span[mention-type="user"], span[mention-type="placeholder"]', function (e) {
                if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {  //No I18N
                    var mentionType = jQuery(this).attr("mention-type");
                    var id = mentionType === 'user'  //No I18N
                        ? jQuery(this).attr("mention")
                        : jQuery(this).attr("ref-user");

                    self.openUserDetails(id);
                    return false;
                }
            });

            $container.on('mouseover', 'span[mention]', function (e) {
                jQuery(this).css("text-decoration", "underline") //No I18N
                jQuery(this).css("cursor", "pointer") //No I18N
            });

            $container.on('mouseleave', 'span[mention]', function (e) {
                jQuery(this).css("text-decoration", "") //No I18N
            });
        }

        if (!self.preview_mode) {
            $container.on('click', '[data-id="add-note"]', function (event) { 	//No I18N
                jQuery(this).prop("disabled", true);//No I18N
                self.openNoteForm(jQuery(this), self.module_id);
            });

            $container.on('click', '[data-name="note-edit"]', function (event) {
                jQuery(this).prop("disabled", true);//No I18N
                var ele = jQuery(this).closest("z-collapsiblepanel");	//No I18N
                self.openNoteForm(jQuery(this), self.module_id, ele.data("conv_id"));	//No I18N
            });

            $container.on('click', '[data-name="note-delete"]', function (event) {
                var ele = jQuery(this).closest("z-collapsiblepanel");	//No I18N
                self.onNoteDelete(self.module_id, ele.data("conv_id"));	//No I18N
            });

            $container.on('click', '[data-name="conv-visisbility"]', function (event) {
                event.stopPropagation();
                var ele = jQuery(this).closest('z-collapsiblepanel'),	//No I18N
                    showRequester = (jQuery(this).attr("isPrivate") === "true" ? false : true);
                self.toggleConversationVisiblitly(ele.data("conv_id"), ele.data("conv_type"), showRequester, self.module_id, this);	//No I18N
            });

            $container.on('click', '[data-name="reply"]', function (event) {
                event.stopPropagation();
                var data = jQuery(this).closest('z-collapsiblepanel').data();	//No I18N
                self.emailReply(data, false);
            });
            $container.on('click', '[data-name="reply-all"]', function (event) {
                event.stopPropagation();
                var data = jQuery(this).closest('z-collapsiblepanel').data();	//No I18N
                self.emailReply(data, true);
            });
            $container.on('click', '[data-name="forward"]', function (event) {
                event.stopPropagation();
                var data = jQuery(this).closest('z-collapsiblepanel').data();	//No I18N
                self.emailForward(data);
            });
            $container.on('click', '[data-name="split"]', function (event) {
                event.stopPropagation();
                event.currentTarget.disabled = true; // SD-128553 When the "Split As New Request" button is clicked twice, duplicate requests gets created. // No i18n
                var data = jQuery(this).closest('z-collapsiblepanel').data();	//No I18N
                self.emailSplit(data);
            });
            $container.on('click', '[data-name="delete"]', function (event) {
                event.stopPropagation();
                var ele = jQuery(this).closest("z-collapsiblepanel");	//No I18N
                self.emailDelete(self.module_id, ele.data("conv_id"));	//No I18N
            });
            $container.on('click', '[data-name="resend"]', function (event) {
                event.stopPropagation();
                var data = jQuery(this).closest('z-collapsiblepanel').data();	//No I18N
                self.emailResend(data);
            });

        }

        $container.on("click", "z-collapsiblepanel div.zcollapsiblepanel__header", function (event) {
            var ele = jQuery(this).closest("z-collapsiblepanel");	//No I18N
            self.loadConversationBody(ele.data("content_url"), ele.data("conv_id"), ele.data("conv_type"));	//No I18N
        });

        $container.on('click', '[data-id="toggle-conv"]', function () {	//No I18N
            self.toggleConversation(this);
        });

        $container.on('click', '[data-id="sort"]', function () {	//No I18N
            self.toggleSortConversation(this);
        });

        $container.on('click', '.load-more', function (event) {
            event.stopPropagation();
            var el = jQuery(this).closest(".lazyload");	//No I18N
            self.loadMoreConversations(this);
        });

        $container.on('click', '.paperclip', function (event) {
            var ele = jQuery(this);
            var doScroll = function () {
                self.scrollToConvAttachments(ele.data("scrolltoid"));	//No I18N
            }
            if (!ele.closest('z-collapsiblepanel').hasClass('is-selected')) { // NO I18N
                ele.closest('z-collapsiblepanel').find('.zcollapsiblepanel__header').trigger('click'); //No I18N
                setTimeout(function () {
                    doScroll();
                }, 500);
            } else {
                event.stopPropagation();
                doScroll();
            }
        });

        $container.on('click', '[data-name="updation_performed_by"]', function (event) {
            var ele = jQuery('#last_updated_details');	//No I18N
            self.openUserDetails(ele.data("userid"));//No I18N
        });
        $container.on('click', '[data-name="performed_by"]', function (event) {
            var ele = jQuery(this).closest('z-collapsiblepanel');	//No I18N
            self.openUserDetails(ele.data("userid"));//No I18N
        });

        $container.on('click', '[data-name="quoted-content"]', function (event) {
            event.stopPropagation();
            var ele = jQuery(this).closest('z-collapsiblepanel');	//No I18N
            self.toggleQuotedContent(ele.data("conv_id"), ele.data("conv_type"));	//No I18N
        });

    },
    /**
     * Attach events for the element outside the component
     */
    attachEventsForNoteForm : function () {
        var self = this;
        jQuery("body").off('click', '[data-id="save_note"]').on('click', '[data-id="save_note"]', function (event) {	//No I18N
            event.stopPropagation();
            self.onNoteAdd(this.form);
        });
        jQuery("body").off('click', '[data-id="cancel_note"]').on('click', '[data-id="cancel_note"]', function (event) {	//No I18N
            event.preventDefault();
            //Clear the note data before leave form
            self.note.noteId = ""; 	//No I18N
            self.note.uploadedAttachments = [];
            if (self.dialog) {
                self.effectBackFromFormInDialog();
            }
            else {
                parent.closeDialog();
            }
        });
    },
    /**
     * Applies effects when form is loaded from conversation component which is in dialog
     * @param {String} view Type of view(Add/Edit) in Note form
     * @param {String} noteForm HTML string of the form template
     */
    effectOnFormInDialog: function (view, noteForm, callback) {

        var self = this;
        jQuery(self.container).after(noteForm);

        jQuery(self.container).slideUp("fast", function () { //No I18N
            self.dialog.hasOwnProperty("loadHeader") 	//No I18N
            && self.dialog.loadHeader(view, self.config);
            if (typeof callback === 'function') {
                callback();
            }
        });

    },
    /**
     * Applies effects when conversation component loaded from the note form in dialog
     * @param {String} view Type of view(Add/Edit) in Note form
     * @param {String} noteForm HTML string of the form template
     */
    effectBackFromFormInDialog: function (view) {

        var self = this;
        jQuery("#notes-add-section").remove();
        jQuery(self.container).slideDown();
        self.dialog.hasOwnProperty("loadHeader") 	//No I18N
        && self.dialog.loadHeader("view", self.config);	//No I18N

    },
    /**
     * Loads Rich text editor for the note description field
     */
    loadRTAForNotes: function () {

        var self = this;
        var autoCheck = self.mention_options && self.mention_options.hasOwnProperty("autoCheck") ? self.mention_options.autoCheck : true;	//No I18N

		if (isMSPOrSCP && self.module === "requests") {
			const mentionOptions = self.mention_options || {};

			if (mentionOptions.users) {
				mentionOptions.users.href = "/api/v3/requests/technician"; // No I18N
			} else {
				mentionOptions.users = { href: "/api/v3/requests/technician" };	// No I18N
			}
			// This line added for the issue, unable to tag technician's notes
			mentionOptions.users.lookup_entity = "technician"; // No I18N
			self.mention_options = mentionOptions;
		}

        var mentionStratergy = getMentionStratergy(autoCheck, null, null, self.mention_options);
        var config = {
            element: 'descText', 	//No I18N
            parentDivHeight: "320px", 	//No I18N
            parentDivWidth: "100%", 	//No I18N
            isEnterKeyHandler: true,
            avoidMoreOption: true,
            customName: "notesDescEditor", 	//No I18N
            focus: true,
            enableMention: self.config.hasOwnProperty("enable_mention") ? self.config.enable_mention : true,	//No I18N
            mentionType: 'custom', 	//No I18N
            mentionStratergy: mentionStratergy,
            maintainStructure: true,
            acceptODCompatible: false
        };
		if(self.module === "requests" || self.module === "releases" || self.module==="problems" || self.module === "changes"){
            config.inlineimagesAPI = self.note.noteId ? '/api/v3/' + self.module + '/' + self.module_id + '/notes/' + self.note.noteId + "/images" : '/api/v3/' + self.module + '/' + self.module_id + '/notes' + "/images";	//No I18N
            config.acceptODCompatible = true;
        } else {
            config.inlineimagesAPI = self.note.noteId ? '/api/v3/' + self.module + '/' + self.module_id + '/notes/' + self.note.noteId + "/_images" : '/api/v3/' + self.module + '/' + self.module_id + '/notes' + "/_images";	//No I18N
        }
        if (self.config.imgParameters) {
            config.imgParameters = self.config.imgParameters;
        }
        parent.window.zeditor(config);
        self.initialiseAttachPreview();
    },
    /**
     * Adding note via v3 api
     * @param {Element} notesForm Notes form element
     */
    onNoteAdd: function (notesForm) {
        var self = this;
        if (self.validateNotesForm(notesForm)) {
            var $notesForm = jQuery(notesForm);
            var note = self.getNoteDataFromForm(notesForm);
            var url = '', type = '';
            notesForm.savenote.disabled = true;
			if(self.module === 'changes'){
				self.config.only_notes = true;
			}
            if (self.metainfo && self.metainfo.notes && self.metainfo.notes.lookup_entity) {
                var lookup_entity = self.metainfo.notes.lookup_entity;
                var inputData = window.sdpToJSON({[lookup_entity]: note});
            }
            else {
                var inputData = window.sdpToJSON({"note": note}); // No I18N
            }
            if (self.note.noteId) {
                url = '/api/v3/' + self.module + '/' + self.module_id + '/notes/' + self.note.noteId; // No I18N
                type = 'PUT'; // No I18N
            }
            else {
                url = '/api/v3/' + self.module + '/' + self.module_id + '/notes'; // No I18N
                type = 'POST'; // No I18N
            }

            //will be called in both success and failure case(Linked Request Abort)
            var noteSuccessFunction = function (response) {
                if (self.dialog) {
                    self.effectBackFromFormInDialog();
                }
                else {
                    parent.closeDialog();
                }
						showalert('success',translate("sdp.change.note.save.successfull"),"isAutoHide=true"); // No I18N
                self.config.hasOwnProperty("afterNoteAdd")	//No I18N
                && (typeof self.config.afterNoteAdd === 'function')	//No I18N
                && self.config.afterNoteAdd.call(self, response, note);

                self.reinitialize();
            };

            sdpAjax({
                url: url,
                type: type,
                data: {input_data: inputData},
                success: function (response) {
                    if (response.response_status.status === "success") {
                        noteSuccessFunction(response);
                    }
                },
                error: function (response) {
                    response = response.responseJSON;
                    if (response.response_status.messages) {
                        if (typeof response.response_status.messages[0].message === "object" && response.response_status.messages[0].message.mentions && response.response_status.messages[0].message.mentions.length > 0) {
                            showalert('failure', translate("sdp.requests.note.addnote.error.mentions"), "isAutoHide=true"); // No I18N
                        }
                        else if (typeof response.response_status.messages[0].message === "string") {
                            if (response.response_status.messages[0].status_code == 10026) {
                                //Add to Linked Request Failed Notification
                                noteSuccessFunction(response);
                                showalert('warning', e_html(response.response_status.messages[0].message), "isAutoHide=true"); // No I18N
                            } else {
                                showalert('failure', e_html(response.response_status.messages[0].message), "isAutoHide=false"); // No I18N
                            }
                        }
                    }

                    notesForm.savenote.disabled = false;
                }
            });

        }
    },
    /**
     * Validating the fields in the form
     * @param {Element} thisForm Notes form element
     */
    validateNotesForm: function (thisForm) {
        // #83227 Append <br> to the editor content manually when it is saved first time
        parent.notesDescEditor.setHTML(parent.notesDescEditor.getHTML());
        thisForm.notesText.value = parent.notesDescEditor.getHTML();
        if (parent.notesDescEditor.isEmpty()) { // NO I18N
	        alert(translate("sdp.request.notes.addnotes.jserror"));        //No i18n
            return false;
        }
        else {
            return true;
        }
    },
    /**
     * Gets the note data from the form to submit
     * @param {Element} notesForm Notes form element
     * @return {Object} Returns note object
     */
    getNoteDataFromForm: function (notesForm) {

        var $notesForm = jQuery(notesForm),
            note = {},
            self = this;

        var description = parent.notesDescEditor ? notesDescEditor.getHTML() : "";
        note.description = description;

        if ($notesForm.find('[name="isPublic"]').length > 0) {
            note.show_to_requester = $notesForm.find('[name="isPublic"]').is(':checked'); // No I18N
        }
        if ($notesForm.find('[name="markFirstResponse"]').length > 0) {
            note.mark_first_response = $notesForm.find('[name="markFirstResponse"]').is(':checked'); // No I18N
        }
        if ($notesForm.find('[name="addToLinkedRequest"]').length > 0) {
            note.add_to_linked_requests = $notesForm.find('[name="addToLinkedRequest"]').is(':checked'); // No I18N
        }

        /* For release, stage input is required */
        if ($notesForm.find('[name="noteStage"]').length > 0) {
            var stage = $notesForm.find('[name="noteStage"]').select2('data');	//No I18N
            stage && (note.stage = {id: stage.id});
        }
        // Get the inline image path from editor object
        /*if(parent.notesDescEditor && notesDescEditor.initobj.options.imgParameters.inlineimages.length > 0){
            note.images ={
                "description": notesDescEditor.initobj.options.imgParameters.inlineimages // NO I18N
            }
        }*/

        note.attachments = [];
        if (self.note.uploadedAttachments) {
            self.note.uploadedAttachments.forEach(function (attachment) {
                note.attachments.push({id: attachment.id});
            });
        }


        return note;
    },
    /**
     * Gets the note details for v3 api
     * @return {Object} Returns jQuery XMLHttpRequest Object
     */
    getNoteDataToLoadForm: function () {

        var self = this;
        return sdpAjax({
            url: '/api/v3/' + self.module + '/' + self.module_id + '/notes/' + self.note.noteId, // No I18N
            type: 'GET'// No I18N
        });
    },
    /**
     * Callback function after attachment is uploaded
     * @param {Object} response Response received for the /upload api call
     * @param {Element} attachmentEle Attachment element
     */
    onuploadAttachmentCB: function (response, attachmentEle) {
        var isFailed = false,
            self = this;
        response && response.responseJSON && (response = response.responseJSON);
        if (response && response.response_status) {
            if (response.response_status.status === "success") {
                if (response.attachment) {
                    self.note.uploadedAttachments.push(response.attachment);

                    if (attachmentEle && attachmentEle.length > 0) {
                        var fsize = response.attachment.size.display_value || response.attachment.size;
                        var filename = response.attachment.name || response.attachment.file_name;
                        attachmentEle.data("attach-id", response.attachment.id);	//No I18N
                        attachmentEle.data("attach-url", response.attachment.content_url);	//No I18N
                        attachmentEle.data("attach-size", fsize);	//No I18N
                        attachmentEle.data("attach-name", filename);	//No I18N
                        //attachmentEle.attr("title", filename + " - " + fsize);	//No I18N
                        attachmentEle.parent().siblings("span:first") //No I18N
                            .html('<span class="atdrpactn text-center" data-attach-delete="true"><i class="cspr close3 mt1 flat"></i></span>');	//No I18N
                    }
                    /** re-binding the events for the attachments */
                    if (self.attachComponent && self.attachComponent.loadEvents) {
                        self.attachComponent.loadEvents();
                    }
                    initTooltip('.atp-container-target');//No I18N
                }
            }
            else if (response.response_status.messages) {
                window.showalert("failure", response.response_status.messages[0].message, "isAutoHide=true");	//No I18N
                isFailed = true;
            }
        }
        else {
            window.showalert("failure", translate("sdp.common.attachment.error"), "isAutoHide=true"); //No I18N
            isFailed = true;
        }

        if (isFailed && attachmentEle && attachmentEle.length > 0) {
            attachmentEle.closest(".btn-group").remove();	//No I18N
            if (jQuery("#notes-attachments-api").find(".btn-group").length == 0) {
                jQuery("#notes-attachments-api").hide();
            }
        }

    },
    /**
     * Callback function after attachment is deleted
     * @param {Object} context Context of the function when invoked
     * @param {Element} attachmentEle Attachment element
     */
    onDeleteAttachmentCB: function (context, attachmentEle) {

        if (!attachmentEle) {
            return;
        }
        var attach_id = attachmentEle.data("attach-id"), //No I18N
            self = this;
        var index;
        var len = self.note.uploadedAttachments.length;
        for (var i = 0; i < len; i++) {
            if (self.note.uploadedAttachments[i].id == attach_id) {
                index = i;
                break;
            }
        }

        self.note.uploadedAttachments.splice(index, 1);

        attachmentEle.closest(".btn-group").fadeOut("fast", function () {	//No I18N
            jQuery(this).remove();
            if (jQuery("#notes-attachments-api").find(".btn-group").length == 0) {
                jQuery("#notes-attachments-api").hide();
            }
        });
    },
    /**
     * Initializes the attachment preview
     */
    initialiseAttachPreview: function () {
        var self = this;
        var attach_options = {
            "api": false, // No I18N
            "upload_api": true, //No I18N
            "is_odapi": true, //No I18N
            "direct_upload": false, //No I18N
            "base_url": "/api/v3/" + self.module + "/" + self.module_id, //No I18N
            "entity": "notes", //No I18N
            "entity_id": (self.note.noteId) ? self.note.noteId : "", //No I18N
            "drop_element": "#notes-attachments", //No I18N
            "download": false, //No I18N
            "rerenderOnUpload": false, //No I18N
            "servlet_cb": function (response, attachmentEle) {  //No I18N
                self.onuploadAttachmentCB(response, attachmentEle);

            },
            "title": false, //No I18N
            "upload": true, //No I18N
            "enable_delete": true, //No I18N
            "ondelete": function (context, attachmentEle) {  //No I18N
                self.onDeleteAttachmentCB(context, attachmentEle);
            },
            //119114 -- Disable submit button when attachment uploading
            "formsubmit": "[data-id=save_note]"//No I18N


        };
        self.attachComponent = new attachPreview('#notes-attachments-api', attach_options);//No I18N
    }
};


var $conversation = {
    /**
     * Initializing the conversation component
     */
    init: function(){

        var conv_config, self = this;
        self.isTrashedView = (self.currentView == "TRASH") ? true : false; //No I18N
        if(window.isMSPOrSCP && window.sdp_feature_status.is_unapproved_requester_enabled && self.currentView == "UNAPPROVED") {	//No I18N
            self.isTrashedView = true;
        }
        self.isRetiredHelpdesk = window.hasOwnProperty("esm_details") && window.esm_details.hasOwnProperty("current_portal") && window.esm_details.current_portal.isRetired; //No I18N
        if(self.convViewType === "conversations"){
            conv_config = self.getConfigForConversations();
        }
        else if(self.convViewType === "notes"){
            conv_config = self.getConfigForNotes();
            }
        self.list = {};

        if(self.module === 'changes') {
            conv_config.mention_options = {autoCheck: false, users: {show: (sdp_user.USERTYPE === "Requester" ? false:true)}}//No I18N
            conv_config.enable_mention = (sdp_user.USERTYPE === "Requester" ? false:true);//No I18N
        }

        self.list = new Conversation(conv_config);
    },
    /**
     * Constructs the config for conversation popup
     */
    getConfigForConversations: function(){
        var self = this;
        var conv_config_list = {
            "module": self.module,	//No I18N
            "module_id": self.module_id,	//No I18N
            "container": self.convContainer,	//No I18N
            "preview_mode": window.print_mode || self.isTrashedView || self.isRetiredHelpdesk,	//No I18N
            "dialog": { //No I18N
                loadHeader: self.loadHeader,
                id: "#_DIALOG_LAYER" //No I18N
            },
            "afterNoteAdd" : function(response,noteFormdata){ //No I18N
                var convObj = this;
                if(response && response.response_status.status === "success" && noteFormdata.hasOwnProperty("mark_first_response") && noteFormdata.mark_first_response){
                    convObj.config.notes.mark_first_response = false;
                }
            },
            "afterLoadConversations" : function(){ //No I18N
                jQuery(self.convContainer).find(".accordion-log").addClass("ml20 mr20");
                self.loadHeader("view",this.config); //No I18N
                self.attachEventsForHeader();
            }
        };

        var conv_config = $req.conv.constructConfig(self.moduleInfo,true);
        jQuery.extend(true,conv_config,conv_config_list);
        return conv_config;
    },
    /**
     * Constructs the config for notes popup
     */
    getConfigForNotes: function(){

        /* Helper variable to open add note form for the first time if no notes. */
        var openAddNote = true, self = this;
        var conv_config_list = {
            "module": self.module,	//No I18N
            "module_id": self.module_id,	//No I18N
            "container": self.convContainer,	//No I18N
            "notes": {	//No I18N
                has_linked_requests: function(){
                    return (self.moduleInfo.hasOwnProperty("request_info") && self.moduleInfo.request_info.hasOwnProperty("has_linked_requests") && self.moduleInfo.request_info.has_linked_requests) ? true : false; }, //No I18N
                mark_first_response: function(){
                    return (self.moduleInfo.hasOwnProperty("request_info") && self.moduleInfo.request_info.hasOwnProperty("responded_time")) ? false : true; }, //No I18N
                fields_required : ["added_by","added_time","last_updated_by","last_updated_time","request","show_to_requester","has_attachments"]	//No I18N
            },
            "only_notes": true,	//No I18N
            "lazy_load": false,	//No I18N
            "expand": { 	//No I18N
                expand_panel: true
            },
            "sort": {	//No I18N
                order: "desc",  //No I18N
                key: "request_conv_sort",	//No I18N
            },
            "show_count": 10,	//No I18N
            "notes_count": 25,	//No I18N
            "row_count": 500,	//No I18N
            "preview_mode": window.print_mode || self.isTrashedView || self.isRetiredHelpdesk,	//No I18N
            "disable_header": true, //No I18N
            "dialog": { //No I18N
                loadHeader: self.loadHeader,
                id: "#_DIALOG_LAYER" //No I18N
            },
            //For change notes private/public is not used
            "visibility": self.module=="changes"?false:true, //No I18N
            "allowed_operations": {},	//No I18N
            "afterNoteAdd" : function(response,noteFormdata){ //No I18N
                var convObj = this;
                if(response && response.response_status.status === "success" && noteFormdata.hasOwnProperty("mark_first_response") && noteFormdata.mark_first_response){
                    convObj.config.notes.mark_first_response = false;
                }
            },
        };
        if(self.module=='problems'){
            conv_config_list.mention_options =  { autoCheck: false, users: { show: true, href: "/api/v3/problems/technician", lookup_entity: "technician" } };//No I18N
            delete conv_config_list.visibility;
        }
        if(!self.isTrashedView && !self.isRetiredHelpdesk){
            conv_config_list.allowed_operations.note = [];
            conv_config_list.allowed_operations.note.push("add");
        }
        conv_config_list.afterLoadConversations = function(){
            // context - Conversation component
            var hasNote = (this.current_conversations && this.current_conversations.list_info.row_count > 0) ? true : false;
            var canAddNote = this.canAddNote;
            // Load Dialog header, after conversation component load in order to know whether note is available.
            self.loadHeader("view",this.config); //No I18N
            self.attachEventsForHeader();

            jQuery(self.convContainer)
                .find(".accordion-log")
                    .addClass("ml20 mr20").css("border-left","0px") //No I18N
                .end()
                .find(".panel-group")
                    .attr('style','margin-left: 0px !important');
            if(this.sort.order === "desc" || this.sort.order === "D"){
                jQuery("#_DIALOG_LAYER").find('[data-id="sort"]').attr('title',getMessageForKey('common.sortby.oldest')).find("span").removeClass('sort-up').addClass('sort-down');
            }
            else{
                jQuery("#_DIALOG_LAYER").find('[data-id="sort"]').attr('title',getMessageForKey('common.sortby.latest')).find('span').removeClass('sort-down').addClass('sort-up');
            }
            self.updateNotesIconInList(this);

            //Taskid: 77333
            if(!hasNote){
                var data = {note_add: canAddNote}
                jQuery("#_DIALOG_LAYER").find("#conversation-holder").html(renderhbs(null, "conversation-fromlist-nonote-template", data, false, "common", true, true, null, true));//No I18N
                if(openAddNote){
                    if(canAddNote && !hasNote){
                        jQuery("#_DIALOG_LAYER").find('[data-id="addnote"]').trigger("click");
                    }
                    openAddNote = false;
                }
            }

        };
        return conv_config_list;
    },
    /**
     * Loads dialog header for note and conversation popup from list
     * @param {String} type Type of template to show in dialog header
     * @param {String} config Config of conversation
     */
    loadHeader: function(type, config){
        var self = this;
         if(type === "add" || type === "edit"){
             var tmpl_data = {};
             tmpl_data.title = (type === "add") ? getMessageForKey("sdp.requests.viewrequest.addnotes") : getMessageForKey("sdp.requests.notes.editnotes.title"); //No I18N
             tmpl_data.module_id = config.module_id;
             jQuery("#view-conv-header").hide();
             renderhbs("#add-note-header", "conversation-fromlist-dialog-header-add", tmpl_data, false, "common", true);//No I18N
         }
         else if(type == "view"){
             if(jQuery("#view-conv-header").is(":hidden")){
                 jQuery("#add-note-header").html("");
                 jQuery("#view-conv-header").show();
             }
             else{
                 var tmpl_data = {};
                 tmpl_data.module_id = config.module_id;
                 tmpl_data.view = self.convViewType;
                 tmpl_data.note_add = config.hasOwnProperty("allowed_operations") && config.allowed_operations.hasOwnProperty("note") && (config.allowed_operations.note.indexOf("add") > -1); //No I18N
                 tmpl_data.hasNote = (self.list.current_conversations && self.list.current_conversations.list_info.row_count > 0) ? true : false;
                 jQuery("#_DIALOG_LAYER").find(".boxHeader").html(renderhbs(null, "conversation-fromlist-dialog-header-view", tmpl_data, false, "common", true, true, null, true));//No I18N
             }
         }
    },
    /**
     * Attaches events for element in dialog header
     */
    attachEventsForHeader: function(){

        var self = this, convInstanceInList = self.list;
        //Remove all delegated event listeners
        jQuery("#_DIALOG_LAYER").off('click', "**")

        if(self.convViewType === "notes"){

            jQuery("#_DIALOG_LAYER").on('click','[data-id="add-note"],[data-id="addnote"]' ,function(event){
                jQuery(this).prop("disabled",true); //No I18N
                convInstanceInList.openNoteForm(jQuery(this),convInstanceInList.module_id);
                event.preventDefault();
            });
            jQuery("#_DIALOG_LAYER").on('click','[data-id="toggle-conv"]' ,function(event){
                convInstanceInList.toggleConversation(this);
            });
            jQuery("#_DIALOG_LAYER").on('click','[data-id="sort"]' ,function(event){
                convInstanceInList.toggleSortConversation(this);
            });
        }
        jQuery("#_DIALOG_LAYER").on("click","[data-id='back_view_notes']",function(event){
                event.stopPropagation();
                jQuery(convInstanceInList.config.container).slideDown();
                jQuery("#notes-add-section").remove();
                self.loadHeader("view"); //No I18N
        });
          jQuery("#dialog_closeButton").off("click").on("click",function(event){//Event not appended to _DIALOG LAYER div since emptyDialog() method needs to called, dialog_closeButton already has an event appended by dialog.js //No I18N
               event.stopPropagation();
               closeDialog(emptyDialog);
          });
    },
    /**
     * On add/delete note, update the note icon in the list
     * @param {Object} convObj Conversation object
     */
    updateNotesIconInList: function(convObj){
        var noteId=convObj.module=='changes'?"N_":"note"; //No I18N
        var noteEle = document.getElementById(noteId+convObj.module_id);
        if(convObj.current_conversations.list_info.row_count == 0){
            noteEle.className="tc-nonotes";
            noteEle.title = getMessageForKey("sdp.requests.notes.addnotes.title");
            initTooltip('#'+convObj.module=='changes'?noteEle.id:noteEle.parentElement.id);
        }
        else{
            noteEle.className="tc-notes";
            noteEle.title = getMessageForKey("sdp.requests.note.viewaddnote");
            initTooltip('#'+convObj.module=='changes'?noteEle.id:noteEle.parentElement.id);
        }
    },
    /**
     * Loads the module details. It is required to instantiate conversation component, used in configuration for conversation
     */
    getModuleInfoForConv: function(){
var self = this;
        var includes = ["_links","self_service_portal"];//No I18N
        var includesStr = sdpToJSON(includes);
        //This code will have changes for CHANGE module
        var url = "/api/v3/" + self.module + "/" + self.module_id;//No I18n
        url=self.module==='requests' ? url+"/request_detail?includes=" + encodeURIComponent(includesStr) : url+"/_links";//No I18n

        var processModuleInfo = (data)=>{
            var mod_details = {};
            mod_details.operational_data = {};
            if(self.module==='requests'){
                mod_details.request_info = data.request_detail[0].request;
                mod_details.operational_data.links = $req.common.constructLinksInfo(data.request_detail[0]._links);
                mod_details.self_service_portal_settings=data.request_detail[0].self_service_portal;
            }
            else if(self.module==='problem' ){
                $problemCommon.constructLinksInfo(data._links);
            }
            self.moduleInfo = mod_details;
        }

        sdpAjax({
            url: url,
            type: 'GET', // No I18N
            success: function(data){
                if(data.response_status.status === "success"){
                    processModuleInfo(data);
                    self.init();
                }
            },
            error: function(jqXHR, textStatus){
                   if(textStatus === "warning"){  //Warning handling //NO I18N
                      processModuleInfo(jqXHR.responseJSON);
                   }
                   self.init();
            }
        });


    },
    /**
     * Loads the conversation container template
     */
    load: function(options){
        var self = this;
        self.initOptions(options);
        var tmpl = { "view": self.convViewType }; //No I18N
        jQuery("#_DIALOG_CONTENT").append(renderhbs(null, "conversation-fromlist-container-template", tmpl, false, "common", true, true, null, true));//No I18N

        self.getModuleInfoForConv();
    },
    initOptions: function(options) {
        var self = this;
        self.module = options.module;
    	self.module_id = options.module_id;
    	self.currentView = options.currentView;
    	// To show only notes or conversations in popup
    	self.convViewType = options.convViewType;
    	self.convContainer = options.convContainer;
    	// Module details required to instiate conversation component, used in conversation configuration
    	self.moduleInfo = {}
    }

};