
/* $Id$ */

$req.common = {

	init: function(retainProps) {
		this.mode = "view";	//No I18N
		this.template = {};
		this.prop = {};
		this.request_info = {};
		this.status_mandatory = {};
		this.ssp = {};
		this.links = null;
		this.listview = false;
		if(!retainProps) {
			this.operational_data = {};
		}
		this.fafr = {};
		this.didFetchRules = false;
		this.didFetchFieldsObj = false;
		this.didFetchResourceObj = false;
		this.formname = "";
		this.resourceform = "";
		this.statusInfo = null;
		this.rlc_notes = null;
	},

	resetProps: function(retainProps) {
		this.init(retainProps);
	},

	/**
	 * checks if the user can edit the field and the field is editable in the current scenario
	 * @param : field - field name
	 * @param : fafrkey - FAFR key of the field name
	 */
	canEditField: function(field, fafrkey) {
		/**
		 * --- Non Editable fields ---
		 * 1- priority is non Ediatble (from priority Matrix)
		 * 2- printMode
		 * 3- if userType is Requester
		 * 4- request is trashed
		 * 5- field should be nonSelected Fields
		 * 6- fafr is undefined or field is Editor or field is EmailCC && field doesn't contain Closure in field && field shdn't be assets
		 *    && field shdn't be first response due by time
		 */

		if( window.print_mode
			|| this.request_info.is_trashed
			|| this.prop.non_editable_props.indexOf(field) !== -1
			|| (field === "priority" && this.ssp.priority_matrix_techoverride === false)	//No I18N
			|| (fafrkey === undefined 
				&& (field.indexOf('resolution') === -1) //No I18N
				&& (field.indexOf('closure_info') === -1) //No I18N
				&& (field.indexOf('onhold_scheduler') === -1) //No I18N
				&& (field.indexOf('resources') === -1) //No I18N
				&& (field !== 'assets') //No I18N
				&& (field !== 'first_response_due_by_time') //No I18N
				&& (field !== 'status_change_comments') //No I18N
				&& (field !== 'update_reason')	//No I18N
				&& (field !== 'on_behalf_of')	//No I18N
				&& (field !== 'is_fcr') // NO I18N
				&& (!window.isMSPOrSCP || field !== 'close_without_notif') // NO I18N
				)	//No I18N
			|| this.mode === "view"	//No I18N
				&& (field === 'editor'|| field === 'email_ids_to_notify')) {	//No I18N
			return false;
		}

		var notEditableFields = this.mode === "new" ? ( this.links && this.links.add && this.links.add.post ? this.links.add.post.non_editable_fields : [] )	//No I18N
									: ( this.links && this.links.edit && this.links.edit.put ? this.links.edit.put.non_editable_fields : [] );
		notEditableFields = notEditableFields || [];
		if(notEditableFields.indexOf( field ) > -1) {
			return false;
		}
		return true;
	},

	/* 
	 * To construct the permission info json from the _links data to make the data more reachable rather than iterating every time
	 * Input : [{name: "attachments", method: "get"}, {name: "attachments", method: "post"}]
	 * Output : {attachments: {get: {href: ""}, {post: {href: ""}}}
	 */
	constructLinksInfo: function(linksJson) {
		var clientLinks = {}, name, method, href;
		var linksLen = linksJson ? linksJson.length : 0;
		if(linksLen) {
			for(var i=0; i<linksLen; i++) {
				if(!linksJson[i]) {
					continue;
				}
				name = linksJson[i].name;
				method = linksJson[i].method;
				if(!clientLinks[name]) {
					clientLinks[name] = {};
				}
				clientLinks[name][method] = {};
				for(var key in linksJson[i]) {
					if(key === "name" || key === "method") {
						continue;
					}
					clientLinks[name][method][key] = linksJson[i][key]
				}
				if(name === "edit" && linksJson[i].disabled_reason) {
					clientLinks[name] = {};
					clientLinks[name].disabled_reason = linksJson[i].disabled_reason;	//No I18N
				}
			}
		}
		return clientLinks;
	},

	/**
	 * @param : mode - Current form mode - new | edit | view
	 * returns the section of the extra fields
	 **/
	getExtraFields: function() {
		var addFormFields = ["attachments"];	//No I18N

		var editFormFields;
		if(sdp_user.USERTYPE === "Technician") {
			editFormFields = [
				"created_time",	//No I18N
				"scheduled_start_time",	//No I18N
				"scheduled_end_time",	//No I18N
				"responded_time",	//No I18N
				"due_by_time",	//No I18N
				"resolved_time",	//No I18N
				"completed_time",	//No I18N
				"first_response_due_by_time",	//No I18N
				"attachments",	//No I18N
				"reason"	//No I18N
			];
		} else {
			editFormFields = [
				"attachments",	//No I18N
				"reason"	//No I18N
			];
		}

		var viewFormFields;
		if(sdp_user.USERTYPE === "Technician") {
			viewFormFields = [
				"assets",	//No I18N
				"created_by",	//No I18N
				"department",	//No I18N
				"sla",	//No I18N
				"template",	//No I18N
				"created_time",	//No I18N
				"scheduled_start_time",	//No I18N
				"scheduled_end_time",	//No I18N
				"responded_time",	//No I18N
				"due_by_time",	//No I18N
				"resolved_time",	//No I18N
				"completed_time",	//No I18N
				"time_elapsed",	//No I18N
				"first_response_due_by_time",	//No I18N
				"closure_code",	//No I18N
				"closure_comments",	//No I18N
				"last_updated_time"	//No I18N
			];
		} else {
			viewFormFields = [
				"assets",	//No I18N
				"created_by",	//No I18N
				"department",	//No I18N
				"template",	//No I18N
				"created_time",	//No I18N
				"responded_time",	//No I18N
				"due_by_time",	//No I18N
				"resolved_time",	//No I18N
				"completed_time",	//No I18N
				"time_elapsed",	//No I18N
				"last_updated_time"	//No I18N
			];
		}
		var extraSection = {
			"collapsed_state": "expanded",	//NO I18N
			"column_count": "2",	//NO I18N
			"fields": [],	//NO I18N
			"name": "-1"	//NO I18N
		};
		var col = 1, row = 1;
		var addExtraField = function(name, can_req_edit, can_req_view) {
			var field =  {
				"mandatory": false,	//NO I18N
				"name": name,	//NO I18N
				"position": {	//NO I18N
					"col": col,	//NO I18N
					"row": row 	//NO I18N
				},
				"requester_can_edit": can_req_edit	//NO I18N
			};
			if(col == 1) {
				col++;
			} else {
				col = 1;
				row++;
			}
			if(sdp_user.USERTYPE === "Technician") {
				field.can_req_view = can_req_view;
			}
			return field;
		};

		var extrafields, field, mode = this.mode;
		switch(mode) {
			case "new":	//No I18N
				extrafields = addFormFields;
				break;
			case "edit":	//No I18N
				extrafields = editFormFields;
				break;
			case "view":	//No I18N
				extrafields = viewFormFields;
				break;
		}
		// For maintenance request add fields are enough
		if($req.form.isMaintenance){
			extrafields=addFormFields;
		}		

		for(var i = 0, len = extrafields.length; i < len; i++) {
			field = extrafields[i];
			
			/** attachments and reason will not be inside form component */
			if(field === "attachments" || field === "reason") {
				continue;
			}

			if(field === "sla" && !this.is_service_template) {
				continue;
			}

			/** TODO::: Is Asset module enabled value is not available in client side, hence checking the asset property in base info */
			if(field === "assets" && !this.request_info.hasOwnProperty("assets")) {
				continue;
			}

			if(field === "responded_time" && (!this.request_info.responded_time || !this.request_info.responded_time.value)) {
				continue;
			}

			if(field === "resolved_time" && (!this.request_info.resolved_time || !this.request_info.resolved_time.value)) {
				continue;
			}

			if(field === "completed_time" && (!this.request_info.completed_time || !this.request_info.completed_time.value)) {
				continue;
			}

			if(field === "time_elapsed" && (!this.request_info.time_elapsed || !this.request_info.time_elapsed.value)) {
				continue;
			}

			extraSection.fields.push(addExtraField(field, false, true));
		}
		return extraSection;
	},

	/**
	 * fetches the priority matrix and store in "this.operational_data" object
	 */
	getPriorityMatrix:function(field, form, event, formPromise) {
		var _self = this;
		if($req.didFetchPriorityMatrix && this.operational_data.priority_matrix) {
			return;
		}
		if(this.priorityMatrixPromise) {
			formPromise && (formPromise[0] = this.priorityMatrixPromise);
			return;
		}
		var priority_matrices = {}, priority_matrix = [];
		var list_info = {
			row_count: 100
		};
		var promise = sdpAjax({
			url : '/api/v3/priority_matrices',	//No I18N
			cache: false,
			data: sdpAjaxInputData({"list_info": list_info}),	//No I18N
			success: function(data) {
				if(data && data.priority_matrices) {
					priority_matrix = data.priority_matrices;
					for(var i = 0, len = priority_matrix.length; i < len; i++){
						var impact = priority_matrix[i].impact.id;
						var urgency = priority_matrix[i].urgency.id;
						var priority = priority_matrix[i].priority.id;
						priority_matrices[impact + "##" + urgency] = priority;	//No I18N
					}
					_self.operational_data.priority_matrix = priority_matrices;
					$req.didFetchPriorityMatrix = true;
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				//TODO: handle error
			}
		}).always(function() {
			_self.priorityMatrixPromise = null;
		});
		formPromise && (formPromise[0] = this.priorityMatrixPromise = jQuery.when(promise));
	},

	/**
	 * Resolution content, attachments, inline images, associated solution ids - to update request json 
	 */
	addResolutionInfo: function(editorid) {
		var resol_form = jQuery('form[name="' + this.formname + '"]');	//No I18N
		if(resol_form.length === 0) {
			return;
		}
		var resol_content = jQuery("#" + editorid).find('.ze_area').contents().find('.ze_body').html();	//No I18N
		var added_resol_attachments = [];
		var deleted_resol_attachments = [];
		var associated_solution_ids = [];
		var resol_inline_images = [];
		var add_to_linked_requests = null;
		
		/** attachment and solution id association will be done only inside Request details page */
		if(mode === "view") {
			/** Including added attachments data */
			var attach_names = resol_form.find("[name='attach'] > option");	//No I18N
			var attach_sizes = resol_form.find("[name='attSize'] > option");	//No I18N
			var at_name, at_size;
			for(var i=0; i<attach_names.length; i++) {
				at_name = jQuery(attach_names[i]).val();
				at_size = jQuery(attach_sizes[i]).val();
				if(at_name !== undefined) {
					added_resol_attachments.push({
						"file_name": at_name,	//No I18N
						"size": at_size ? at_size : "0"	//No I18N
					});
				}
			}

			/** Including the attachments which are deleted */
			var del_id;
			resol_form.find("[name='toBeDeleted'] > option").each(function(index, element) {	//No I18N
				del_id = jQuery(element).val();
				if(del_id !== undefined) {
					deleted_resol_attachments.push({
						"id": del_id	//No I18N
					});
				}
			});

			/** Including associated solutions info */
			var asso_id;
			resol_form.find("[name='solutionID']").each(function(index, element) {	//No I18N
				asso_id = jQuery(element).val();
				if(asso_id !== undefined) {
					associated_solution_ids.push({
						"id": asso_id	//No I18N
					});
				}
			});

			/** When the request is linked to some other requests, the add resolution to linked requests value also needs to be included */
			if(resol_form.find('[name="addToLinkedRequest"]').length > 0) {
				add_to_linked_requests = resol_form.find('[name="addToLinkedRequest"]').is(":checked");	//No I18N
			}
		}

		/** Including the added inline images names */
		if(resol_form.find("[name='INLINEIMAGES']").length > 0) {
			var inline_image_name;
			resol_form.find("[name='INLINEIMAGES']:first > option").each(function(index, element) {	//No I18N
				inline_image_name = jQuery(element).val();
				if(inline_image_name !== undefined) {
					resol_inline_images.push(inline_image_name);
				}
			});
		}

		var resolution_info = {
			"content": resol_content	//No I18N
		};
		if(added_resol_attachments.length > 0) {
			resolution_info.added_resolution_attachments = added_resol_attachments;
		}
		if(deleted_resol_attachments.length > 0) {
			resolution_info.deleted_resolution_attachments = deleted_resol_attachments;
		}
		if(associated_solution_ids.length > 0) {
			resolution_info.associated_solution_ids = associated_solution_ids;
		}
		if(resol_inline_images.length > 0) {
			resolution_info.resolution_inline_images = resol_inline_images;
		}
		if(add_to_linked_requests !== null) {
			resolution_info.add_to_linked_requests = add_to_linked_requests;
		}
		return resolution_info;
	},

	/**
	 * categorizes the statuses into "status_stop", "status_running", "closed_resolved_status"
	 * sets the closed and resolved status's id to "closed_status_id" and "resolved_status_id" respectively
	 */
	setStatusInfo: function(statusInfo) {
		if(!statusInfo) {
			return;
		}
		this.operational_data.close_status_id = "-1";	//No I18N
		this.operational_data.resolved_status_id = "-1";	//No I18N
		this.operational_data.cancelled_status_id = "-1";	//No I18N
		var status_stop = [], status_running = {}, closed_resolved_status = [];

		for(var i=0,ilen = statusInfo.length; i < ilen ;i++) {
			if(statusInfo[i].internal_name === 'Closed') {	//No I18N
				this.operational_data.close_status_id = statusInfo[i].id;
			} else if(statusInfo[i].internal_name === 'Cancelled') {	//No I18N
				this.operational_data.cancelled_status_id = statusInfo[i].id;
			} else if(statusInfo[i].internal_name === 'Resolved') {	//No I18N
				this.operational_data.resolved_status_id = statusInfo[i].id;
			} else if(statusInfo[i].in_progress && statusInfo[i].stop_timer) {
				status_stop.push(parseInt(statusInfo[i].id));
			} else if(statusInfo[i].in_progress && !statusInfo[i].stop_timer) {
				status_running[statusInfo[i].id] = statusInfo[i].name;
			} else if(!statusInfo[i].in_progress && !statusInfo[i].stop_timer) {
				closed_resolved_status.push(parseInt(statusInfo[i].id)); 
			}
		}

		this.operational_data.status_stop = status_stop;
		this.operational_data.status_running = status_running;
		this.operational_data.closed_resolved_status = closed_resolved_status;
	},

	/** ===== On-Hold form methods ====== */

	/**
	 * prompts the On-Hold form dialog
	 */
	promptOnHoldForm: function(prevId, toId) {
		if(isMSPOrSCP && !isOnholdScheduleMandatory) {
		    // if in SSP On Hold Scheduler is not enabled, do not show this pop-up
		    return;
		}
		var self = this;
		$rf.toggleLayout("onhold-form-layout", true);	//No I18N
		jQuery("#onhold-form").dialog({	//No I18N
			modal: true,
			closeOnEscape: false,
			appendTo: "#req-form",	//No I18N
			open: function() {
				jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
					self.closeOnHoldForm();
				});
			},
			close: function(event, arg) {
				if(self.onhold_form_cancel && self.mode === "edit" && self.ssp.status_change_comment) {
					self.cancelOnHoldForm(prevId);	
				}
				self.onhold_form_cancel = false;
			},
			position: { my: "center center", at: "center center", of: window },	// No I18N
			width: "650",	// No I18N
			title: getMessageForKey("sdp.requests.viewrequest.scheduleonhold")	// No I18N
		});

		/** when the template has RLC transitions, the change_to_status field should be loaded using the RLC api */
		if(this.mode === "edit" && $req.form.isRLCEnabled()) {
			var changeToStatus = $rf.fields[ "onhold_scheduler.change_to_status" ];	//No I18N
			changeToStatus.href = "/requests/" + this.request_info.id + "/_get_connected_statuses";	//No I18N
			changeToStatus.response_field_name = "statuses";	//No I18N
			changeToStatus.input_fields = { status_id: toId, nodes_list_info: { row_count: 100, sort_field: "name"}};	//No I18N
			changeToStatus.list_info = false;
			$rf.reconstructField("onhold_scheduler.change_to_status");	//No I18N
		}
	},

	/**
	 * displays the On-Hold form
	 */
	showOnHoldForm: function() {
		jQuery("#enable-onhold-sch").prop('checked', true);	//No I18N
		this.toggleOnHoldScheduleForm(jQuery("#enable-onhold-sch")[0]);	//No I18N
		jQuery("#scheduled-info").hide();	//No I18N
		jQuery("#onhold-sch-form-container").show();	//No I18N
	},

	/**
	 * displays / hides the schedule info of the On-Hold form
	 */
	toggleOnHoldScheduleForm: function(checkbox) {
		closeCalDialog();
		if(checkbox.checked) {
			jQuery("#onhold-sch-info").css("display", "inline-block");	//No I18N
			$rf.addMandatoryField("onhold_scheduler.change_to_status", "status_change");	//No I18N
			$rf.addMandatoryField("onhold_scheduler.scheduled_time", "status_change");	//No I18N
			if(this.ssp.status_change_comment) {
				$rf.addMandatoryField("onhold_scheduler.comments", "status_change");	//No I18N
			}
		} else {
			jQuery("#onhold-sch-info").css("display", "none");	//No I18N
			$rf.removeMandatoryField("onhold_scheduler.change_to_status", "status_change");	//No I18N
			$rf.removeMandatoryField("onhold_scheduler.scheduled_time", "status_change");	//No I18N
			$rf.removeMandatoryField("onhold_scheduler.comments", "status_change");	//No I18N
		}
	},

	/**
	 * validates and updates the entered On-Hold info to the object "$rf.fields.values[ onhold_scheduler.<property> ]"
	 */
	updateOnHoldForm: function() {
		if(this.mode === "edit" && this.ssp.status_change_comment) {
			if( $rf.validateField("status_change_comments") === false ) {
				return;
			}
		}
		if(jQuery("#enable-onhold-sch").is(":checked")) {
			if($rf.validateField("onhold_scheduler.change_to_status") === false ) {
				return;
			}
			if($rf.validateField("onhold_scheduler.scheduled_time") === false ) {
				return;
			}
			if( $rf.validateField("onhold_scheduler.comments") === false ) {
				return;
			}
		}
		this.onhold_update = true;
		jQuery("#onhold-form").dialog("close");	//No I18N
	},

	/**
	 * closes On-Hold form dialog
	 */
	closeOnHoldForm: function() {
		this.onhold_form_cancel = true;
		$rf.removeMandatoryField("onhold_scheduler.change_to_status", "status_change");	//No I18N
		$rf.removeMandatoryField("onhold_scheduler.scheduled_time", "status_change");	//No I18N
		jQuery("#onhold-form").dialog("close");	//No I18N
		/** If the Status Mandatory Comment is mandatory, then revert the status*/
		if($req.form.bulk_mode && $rf.fields['status_change_comments'] && $rf.fields['status_change_comments'].mandatory){
			$req.form.revertStatus();
		}
	},

	/**
	 * resets all the fields in the On-Hold form dialog
	 */
	resetOnHoldForm: function() {
		this.onhold_update = false;
		$rf.toggleLayout("onhold-form-layout", false);	//No I18N
		jQuery("#enable-onhold-sch").prop('checked',false);	//No I18N
		this.toggleOnHoldScheduleForm(jQuery("#enable-onhold-sch")[0]);	//No I18N
		if(this.mode === "edit" && this.request_info.onhold_scheduler) {
			jQuery("#onhold-sch-form-container").hide();	//No I18N
			jQuery("#scheduled-info").show();	//No I18N
		}
	},

	/**
	 * cancels On-Hold form dialog and reverts the status
	 */
	cancelOnHoldForm: function(prevId) {
		this.resetOnHoldForm();
		$req.form.revertStatus();
	},

	/** ===== Close Form methods ====== */

	/**
	 * prompts the Close form dialog
	 */
	promptCloseForm: function(prevId, toId, isResolved) {
		var self = this;
		$rf.toggleLayout("close-form-layout", true);	//No I18N
		jQuery("#close-form").dialog({	//No I18N
			modal: true,
			closeOnEscape: false,
			appendTo: "#req-form",	//No I18N
			open: function() {
				if(isResolved){
					jQuery("#close-form [data-cs-field='closure_info.requester_ack_resolution']").hide(); //NO I18N
					jQuery("#close-form [data-cs-field='closure_info.requester_ack_comments']").hide(); //NO I18N
				}
				jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
					self.closeCloseForm();
				});
			},
			close: function(event, arg) {
				if(self.close_form_cancel) {
					self.cancelCloseForm(prevId);
				}
				self.close_form_cancel = false;
			},
			position: { my: "center center", at: "center center", of: window },	// No I18N
			width: "850",	// No I18N
			title:  isResolved ? getMessageForKey("sdp.requests.viewrequest.resolveRequest") :getMessageForKey("sdp.requests.viewrequest.closerequest")	// No I18N
		});
	},

	/**
	 * validates and updates the entered Close info to the object "$rf.fields.values[ closure_info.<property> ]"
	 */
	updateCloseForm: function() {
		if(this.mode === "edit" && this.ssp.status_change_comment) {
			if( $rf.validateField("closure_info.closure_comments") === false ) {
				return;
			}
		}
		this.close_update = true;
		jQuery("#close-form").dialog("close");	//No I18N
	},

	/**
	 * closes Close form dialog
	 */
	closeCloseForm: function() {
		this.close_form_cancel = true;
		jQuery("#close-form").dialog("close");	//No I18N
	},

	/**
	 * resets all the fields in the Close form dialog
	 */
	resetCloseForm: function() {
		this.close_update = false;
		$rf.toggleLayout("close-form-layout", false);	//No I18N
	},

	/**
	 * cancels Close form dialog and reverts the status
	 */
	cancelCloseForm: function(prevId) {
		this.resetCloseForm();
		$req.form.revertStatus();
	},
	/**
	 * Used to prompt the note popup, if it was configured in the RLC
	 */
	promptRLCNotes: function(){
		// Render the Handlebars template
			if(jQuery('#rlc-notes-container').html() === ""){
				renderhbs('#rlc-notes-container','rf-rlc-notes-template', null, false, 'requests/form'); // No I18N
			}
			var notes = new Conversation({lite: true, module_id:$req.form.woID, module:"requests"}); 	//No I18N
			jQuery("#rlc-notes-container").dialog({
				title: getMessageForKey("sdp.requests.action.help.addnote"),
				width:900,
				height:630,
				modal: true,
				open:function(){
					setTimeout(function(){
						notes.openNoteForm('.ui-dialog #rlc-notes-container #editor-placeholder',undefined, undefined, true); // NO I18N
						jQuery("#rlc-notes-container #editor-placeholder .form-footer").hide();
					},200);
					// Bind the event
					jQuery("#rlc-notes-container .form-footer .btn").click(function(){
						jQuery("#rlc-notes-container").dialog("close"); 	//No I18N
					});
				}
			});
		this.rlc_notes = notes;
	},
	/**
	 * Used to get the RLC Notes Value
	 */
	getRLCNotes: function(){
		try {
			if(this.rlc_notes){
				return this.rlc_notes.getNoteDataFromForm();
			}
		} catch (error) {
			console.error(error);
		}
		return null;
	},
	/** ===== Status Change Comment methods ====== */

	/**
	 * prompts the Status change comment form dialog
	 */
	promptStatusCommentForm: function(prevId, toId) {
		$rf.toggleLayout("statuscomment-form-layout", true);	//No I18N
		var self = this;
		jQuery("#statuscomment-form").dialog({	//No I18N
			modal: true,
			closeOnEscape: false,
			draggable: false,
			appendTo: "#req-form",//No I18N
			open: function() {
				jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
					self.closeStatusCommentForm();
				});
			},
			close: function(event, arg) {
				if(self.statuscomment_form_cancel) {
					self.cancelStatusCommentForm(prevId);	
				}
				self.statuscomment_form_cancel = false;
			},
			position: { my: "center center", at: "center center", of: window },	// No I18N
			width: "650",	// No I18N
			title: getMessageForKey("sdp.request.statuschange.popup.title")	// No I18N
		});
	},

	/**
	 * validates and updates the entered Status change comment info to the object "$rf.fields.values[ status_change_comments ]"
	 */
	updateStatusCommentForm: function() {
		if(this.mode === "edit" && this.ssp.status_change_comment) {
			if( $rf.validateField("status_change_comments") === false ) {
				return;
			}
		}
		this.statuscomment_update = true;
		jQuery("#statuscomment-form").dialog("close");	//No I18N
	},

	/**
	 * closes the Status change comment form
	 */
	closeStatusCommentForm: function() {
		this.statuscomment_form_cancel = true;
		jQuery("#statuscomment-form").dialog("close");	//No I18N
	},

	/**
	 * resets the Status change comment form
	 */
	resetStatusCommentForm: function() {
		this.statuscomment_update = false;
		$rf.toggleLayout("statuscomment-form-layout", false);	//No I18N
	},

	/**
	 * cancels Status change comment form dialog and reverts the status
	 */
	cancelStatusCommentForm: function(prevId) {
		this.resetStatusCommentForm();
		$req.form.revertStatus();
	},

	/**
	 * checks Technician validity
	 * inViewTech - the currently assigned technician
	 * changedTech - the selected technician
	 * from - the value of source page from which this method is called.
	 */
	isValidTech: function(selected_tech, from, conflictCallback) {
		var selectedtechid = selected_tech;
		if(from=="form"&&selected_tech&&selected_tech.id){
			selectedtechid=selected_tech.id;
		}
		if(this.is_service_template && this.template.approval_configurations && this.template.approval_configurations.assign_tech_after_approve && selectedtechid && selectedtechid !== "0") {
			if(this.mode === "new" || (!this.request_info.technician && (this.request_info.approval_status && this.request_info.approval_status.name !== "Approved"))) {	//No I18N
				if(!window.confirm(getMessageForKey("sdp.request.autoapproval.techwarning"))) {
					return false;
				}
			}
		}
		var request_info = this.request_info;
		if($req.form.editMode && $req.form.request_info_ref) {
			request_info = $req.form.request_info_ref;
		}
		if(this.mode !== "new" && !this.checkAssignedTech((request_info && request_info.technician ? (from=="form" ? request_info.technician : request_info.technician.id) : null),  selected_tech, from)) {
			typeof conflictCallback === "function" && conflictCallback();	//No I18N
			return false;
		}
		return true;
	},

	/**
	 * checks Technician conflict
	 * inViewTech - the currently assigned technician
	 * changedTech - the selected technician
	 * from - the value of source page from which this method is called.
	 */
	checkAssignedTech: function(inViewTech, changedTech, from) {
		/**
		 * Currently assigned technician is obtained using an ajax call. In the success function if there is no conflict the form is submitted.
		 * If there is conflict, Confirm alert pops up and if the result is true the form is submitted else the page is refreshed.
		 */
		 var assignTech = true;
		 sdpAjax({
			url:"/servlet/SDAjaxServlet?module=request&action=getRequestedID&search=" + encodeURIComponent(this.request_info.id)+ (from!=null&&from=="form"? "&from=form" : ""),	//No I18N
			type: "GET",	//No I18N
			dataType: "text",	//No I18N
			async: false,
			success: function(dbTech) {
				if(dbTech === "null") {
					dbTech = "0";	//No I18N
				}
				if(from="form"){
					try{
						dbTech=JSON.parse(dbTech);
						if(jQuery.isEmptyObject(dbTech)){
							dbTech = "0";	//No I18N
						}
					}
					catch(e){
						dbTech = "0";	//No I18N
					}
				}
				inViewTech = inViewTech || 0;
				changedTech = changedTech || inViewTech;

				var conflictMsg = "sdp.message.detailsconflict";	//No I18N
				if(from === "WOListView"){
					conflictMsg = "sdp.message.listview.conflict";	//No I18N
				}
				var result = validateTechConflict(inViewTech, dbTech, changedTech, conflictMsg,from);
				if(result) {
					assignTech = true;
					return;
				}
				if(from === "WOListView") {
					parent.refreshSubView(parent.getPortalViewName('RequestsView'));	//No I18N
					parent.closeDialog();
				}
				assignTech = false;
			}
    	});
    	return assignTech;
	},

	/**
	 * Technicain conflict occurs while assigning technician from multiple ways
	 * conflictMsg - optional. This method can be passed with conflict message as additional argument.
	 */
	validateTechConflict: function(inViewTech, dbTech, changedTech, conflictMsg) {
		var dbTechName = new Array();
		if(inViewTech != 0) {
			dbTechName[0] = techID_NameModel.list[inViewTech][1];
		} else {
			dbTechName[0] = "-";	//No I18N
		}
		if(dbTech != 0) {
			dbTechName[1] = techID_NameModel.list[dbTech][1];
		} else {
			dbTechName[1] = "-";	//No I18N
		}
		if(changedTech != 0) {
			dbTechName[2] = techID_NameModel.list[changedTech][1];
		} else {
			dbTechName[2] = "-";	//No I18N
		}
		var result = true;
		if((inViewTech != dbTech) && (changedTech != dbTech)) {
			conflictStr = getMessageForKey(conflictMsg, dbTechName);
			result = confirm(conflictStr);
		}
		return result;
	},

	/**
	 * checks the validity of the response due by date and due by date
	 */
	checkValidDue: function(fr_due_value, fieldId, timeValue) {
		if(!fr_due_value) {
			return true;
		}
		if(fieldId === "due_by_time" && timeValue !== "" && fr_due_value !== "" && timeValue < fr_due_value ) {
			alert(getMessageForKey("sdp.request.fr_duetime.error"));	//No I18N
			return false
		} else if(fieldId ==='created_time' && fr_due_value !== "" && timeValue > fr_due_value) {	//No I18N
			alert(getMessageForKey("sdp.request.fr_createdtime.error"));	//No I18N
			return false;
		}
		return true;
	},

	/**
	 * returns the given status' type
	 */
	getStatusType: function(status) {
		if(status === undefined) {
			status = this.request_info.status.id;
		}
		var closedStatusId = parseInt(this.operational_data.close_status_id);
		var resolveStatusId = parseInt(this.operational_data.resolved_status_id);
		var cancelledStatusId = parseInt(this.operational_data.cancelled_status_id);
		var inactiveList = this.operational_data.status_stop;
		var additionalCloseStatus = this.operational_data.closed_resolved_status;
		status = parseInt(status);
		if(closedStatusId === status || additionalCloseStatus.indexOf(status) !== -1) {
			return 'Closed';	//No I18N
		} else if(cancelledStatusId === status) {
			return 'Cancelled';	//No I18N
		} else if(resolveStatusId === status) {
			return 'Resolved';	//No I18N
		} else if(inactiveList.indexOf(status) !== -1) {
			return 'Onhold';	//No I18N
		} else {
			return 'Open';	//No I18N
		}
	},

	isCompletedStatus: function(status, includeCancelledStatus) {
		if(!status) {
			return false;
		}
		var statusType = this.getStatusType(status);
		var isCompleted =  statusType === "Closed" || statusType === "Resolved";	//No I18N
		if(includeCancelledStatus) {
			isCompleted = isCompleted || statusType === "Cancelled";	//No I18N
		}
		return isCompleted;
	},

	isCancelledStatus: function(status) {
		if(!status) {
			return false;
		}
		return this.getStatusType(status) === "Cancelled";	//No I18N
	},

	/**
	 * fetches the FAFR for the template ( create | edit )
	 * and executes the callback after fetching the FAFR
	 */
	getFAFR: function(callback, args) {
		var templateId = this.template.id;
		if(!templateId){
			templateId = $req.form.templateID;
			this.template.id = $req.form.templateID;
		}
		var module = this.is_service_template ? "SERVICE" : "INCIDENT";	//No I18N
		var mode = this.mode === "new" ? "create" : "edit";	//No I18N
		var url = "/servlet/SDAjaxServlet?action=getTemplateRulesJson&module=" + module + "&templateId=" + templateId + "&sdUserType=" + sdp_user.USERTYPE + "&mode=" + mode + "&rulesRequired=all"; //NO I18N
		if(window.isMSP && sdp_user.USERTYPE === "Technician") {
			url = url + "&ruleAccount=" + $req.mspform.getAccountID();	//NO I18N
		}
		var _self = this;
		return sdpAjax({
			url: url,
			type: 'GET',  //NO I18N
			cache: false,
			context: this,
			success: function(data){
				_self.didFetchRules = true;
				_self.rulesObj = data;
				if(typeof callback === "function") {
					callback.apply(_self, args);
				}
			}
		});
	},

	/**
	 * sets Field and form Rules to the form
	 * skipOnLoad - on opening the form in popup, the onload rules should be skipped from executing
	 */
	setFieldAndFormRules: function (skipOnload, from, options, getFieldJson) {
		var self = this;
		var setFAFR = function(skipOnload, from) {
			var module = self.is_service_template ? "SERVICE" : "INCIDENT";	//No I18N
			var templateId = self.template.id;
			if(!templateId){
				templateId = $req.form.templateID;
				self.template.id = $req.form.templateID;
			}
			var tasksObj = {};
			var _self = self;
			var promisefns = [];

			/** fetches the template's fields information including allowed values */
			if(Object.keys(self.rulesObj).length !== 0 || getFieldJson) {
				if(!self.didFetchFieldsObj) {
					var base_url = "/servlet/SDAjaxServlet";	//No I18N
					var params = "?action=getFieldJson&module=" + module + "&templateId=" + templateId;	//No I18N
					if(isMSP) {
						base_url = "/servlet/MSPSDAjaxServlet";	//No I18N
						if(sdp_user.USERTYPE === "Technician") {
							var account_id = $req.mspform.getAccountID();
							params = params + "&WF_ACCOUNTID=" + account_id;	//No I18N
						}
					}
					var fieldsPromise = sdpAjax({
						url: base_url + params,
						type: "GET",	//No I18N
						cache: false,
						success: function(data){
							self.fieldsObj = data;
							self.didFetchFieldsObj = true;
						}
					});
					promisefns.push(fieldsPromise);
				}

				/** TODO ::: It is already fetched on loading form. Why do we need to fetch again? */
				/** fetches resources information */
				if(module === "SERVICE") {
					if(!self.didFetchResourceObj) {
						var resourcePromise = sdpAjax({
							url: "/servlet/SDAjaxServlet?action=getResourceJson&templateId=" + templateId,	//No I18N
							type: "GET",	//No I18N
							cache: false,
							success: function(data) {
								self.resourceObj = data;
								self.didFetchResourceObj = true;
							}
						});
						promisefns.push(resourcePromise);
					}
				}
			}

			if(promisefns.length > 0) {
				jQuery.when.apply(this, promisefns).then(function() {
					initFAFR();
				});
			} else {
				initFAFR();
			}
		};

		var initFAFR = function() {
			$se.isCreateOperation = self.mode === "new" ? true : false;	//No I18N
			$se.resourcesObj = self.resourceform ? jQuery("#" + self.resourceform) : jQuery(document);	//No I18N
			$se.formObject = jQuery("#" + self.formname);	//No I18N
			$se.module = module;
			$se.rules = self.rulesObj;
			$se.fieldsJson = self.fieldsObj;

			if($req.form&&$req.form.udf_mapping_names){
                $se.udf_mapping_names=$req.form.udf_mapping_names
            }
            if($req.form&&$req.form.refer_fields){
                $se.refer_fields=$req.form.refer_fields;
            }
			/** removes special characters from field details object */
			$se.removeSpecialCharFromFields();
			$se.resources = self.resourceObj;

			/** adds data-field attributes to Tasks */
			if(self.page === "globalform" && self.fieldsObj && self.template.task_templates && self.template.task_templates.length > 0) {
				$se.tasks = {};
				self.template.task_templates.forEach(function(task) {
					if(task.hasOwnProperty("id") && task.hasOwnProperty("title")) {
						$se.tasks[ task.id ] = task.title;
					}
				});
				$se.addDataFieldAttrToTasks();
			}

			/** adds data-field attributes to resources */
			$se.addDataFieldAttrToResources();
			$se.fieldsJson = fieldDetailsFunction($se.fieldsJson);

			// if(skipOnload != true) {
			// 	$CS.mandateField(self.prop.fafr_mandate);
			// }
			
			/** TODO : Below requester updation is changed in prop file recently. When using this is in details page, this code has to be changed */
			if(self.request_info.requester) {
				var requesterId = self.request_info.requester.id;
				if(Object.keys(self.rulesObj).length !== 0 && Object.keys($se.requesterDetails).length === 0) {
					$se.getUserDetails(requesterId);
				}
			}

			/** Adding the rules to Form */
			if(!$req.prop.checkBulkEdit && from === "DetailsPage") {
				$se.onDetailPage = true;
				$CS.hideUnansweredFields(["resources"]);	//No I18N
				self.invokeOnDetailPageRules();
			} else {
				$se.onDetailPage = false;
				$se.isInlineView = true;
				$se.isFormComponent = true;
				$se.form = $rf;
				$se.addRulesToForm(skipOnload);
			}
			if($req.form.isAddIn && typeof externalCallback=="function"){
				externalCallback("request_form");//No I18N
			}
		}

		if(!this.didFetchRules) {
			this.getFAFR(setFAFR, [skipOnload, from]);
		} else {
			setFAFR(skipOnload, from);
		}
	},

	/**
	 * resets the properties set to the FAFR $se object
	 */
	resetFAFRProps: function() {
		$se.fieldsJson = "";
		$se.isCreateOperation = false;
		$se.resourcesObj = undefined;
		$se.formObject = undefined;
		$se.module = "";
		$se.rules = ""
		$se.fieldsJson = "";
		$se.resources = {};
		$se.tasks = {};
		$se.onDetailPage = false;
		$se.isInlineView = false;
		$se.isFormComponent = false;
		$se.form = undefined;
		$se.stopFormSubmission = false;
		$se.requesterDetails = {};
	},

	/**
	 * executes the onDetailPage FAFR
	 * ------ NOT USED AS OF NOW ------
	 */
	invokeOnDetailPageRules: function() {
		jQuery(document).ready(function() {
			var onPageDetail = this.fafr.ondetails_page;
			if(onPageDetail) {
				for(var i = 0,len = onPageDetail.length; i < len; i++) {
					var criterias = onPageDetail[i].CRITERIAS;
					if(!criterias.length || parent.$se.isCriteriaMatched(criterias)) {
						parent.$se.invokeAction(onPageDetail[i]);
					}
				}
			}
		});
	},

	/**
	 * sets the priority value based on the Priority Matrix configuration
	 */
	setPriorityMatrixValue: function() {
		if(jQuery.isEmptyObject( this.operational_data.priority_matrix)){
			return false;
		}
		var impact = $rf.fields.impact || null;
		var urgency = $rf.fields.urgency || null;
		var priority = $rf.fields.priority || null;
		var impactEle = impact && impact.element && jQuery(impact.element).length > 0 ? jQuery(impact.element) : null;
		var urgencyEle = urgency && urgency.element && jQuery(urgency.element).length > 0 ? jQuery(urgency.element) : null;
		var priorityEle = priority && priority.element && jQuery(priority.element).length > 0 ? jQuery(priority.element) : null;
		var impactVal, urgencyVal, priorityVal, matrixId, currentPriorityVal;
		var priorityStockEle = jQuery('#priorityMatrix');	//No I18N

		currentPriorityVal = priorityStockEle.val();
		/** gets the available current Urgency and Impact field values */
		if(impactEle && urgencyEle) {
			impactVal = impact.current_value ? impact.current_value.id : null;
			urgencyVal = urgency.current_value ? urgency.current_value.id : null;
		} else if(impactEle) {
			impactVal = impact.current_value ? impact.current_value.id : null;
			urgencyVal = this.request_info.urgency ? this.request_info.urgency.id : null;
		} else if(urgency.length) {
			impactVal = this.request_info.impact ? this.request_info.impact.id : null;
			urgencyVal = urgency.current_value ? urgency.current_value.id : null;
		}

		/** sets the priority value from the corresponding Priority matrix */
		if(impactVal !== null && impactVal !== undefined && urgencyVal !== null && urgencyVal !== undefined) {
			matrixId = impactVal + "##" + urgencyVal;	//No I18N
			priorityVal = this.operational_data.priority_matrix[matrixId];
		}
		if(!priorityVal) {
			priorityVal = "0";	//No I18N
		}

		/** when the techoverride is disabled and either Urgency or Impact doesn't have any value, the priority will be reset to the original value */
		if((!urgencyVal || !impactVal) && this.ssp.priority_matrix_techoverride === false) {
			priorityVal = this.request_info.priority ? this.request_info.priority.id : "0";	//No I18N
		}

		/** set the value to the field if present or the stock field */
		if(priority && priorityVal !== undefined) {
			priorityStockEle.val(priorityVal);
			/** check for the presence of the priority field */
			if(priority.container && priority.container.length > 0) {
				var priorityText = null;
				if(priorityVal == "0") {
					priorityText = getMessageForKey("sdp.common.notassigned");	//No I18N
				} else {
					if(priority.allowed_values) {
						for(var i = 0, len = priority.allowed_values.length; i < len; i++) {
							if(priority.allowed_values[i].id == priorityVal) {
								priorityText = priority.allowed_values[i].name;
								break;
							}
						}
					}
					if(!priorityText) {
						priorityText = this.request_info.priority ? this.request_info.priority.name : getMessageForKey("sdp.common.notassigned");	//No I18N
					}
				}
				if(priorityText) {
					priority.container.find("[data-name='priority']").text(priorityText);	//No I18N
					$rf.fields.priority._value = priorityVal;
				}
				if(priorityEle && priorityEle.length > 0) {
					/**
					 * when the techoverride is disabled, select2 field won't be available
					 * in that case, we have to manually trigger the change event of Priority stock element for FAFR to get executed, if any
					 */
					if(priorityEle.data("select2")) {
						$rf.fields.values.priority = priorityVal;
					} else if(currentPriorityVal != priorityVal) {
						priorityStockEle.trigger("change");	//No I18N
					}
				}
			}
		}
	},
	
	getFrameDetails:function () {
		var externalframe = !!window.externalframe;
		var internalframe = false;
		if(externalframe){
			try {
				internalframe = !!window.top.jQuery("#wo-details-frame").length; // NO I18N
			} catch (error) {}
		}
		return{
			externalframe:externalframe,
			internalframe:internalframe
		}
	},
	/**
	 * Format csi model suitable for FAFR execution
	 */
	formatCSI: function(csiJson1) {
		var csiJson = jQuery.extend(true, [], csiJson1);
		var csi_model={};
	  	for(var i=0,ilen=csiJson.length;i<ilen;i++) {
	        var obj={};
	        for(var j=0,jlen=csiJson[i].sub_categories.length;j<jlen;j++){
	            obj[csiJson[i].sub_categories[j].name] = csiJson[i].sub_categories[j];
	        }
	        csi_model[csiJson[i].name]=csiJson[i];
	        csi_model[csiJson[i].name].sub_categories = obj;
	  	}
	  	return csi_model;
	},
	// SD-94779
	requesterCriteriaCallback: function(searchText){
		if (!searchText) {
			return null;
		}
		var search_criteria = {};
		var childrenArray = [];
		var searchOptions = $req.common.getRequesterSearchOptions();
		if (searchText) {
			for (var i = 0; i < searchOptions.length; i++) {
				if (i == 0) {
					search_criteria = {
						field: searchOptions[i],
						condition: "like", // No I18N
						values: [searchText],
						logical_operator: "OR" // No I18N
					};
				} else {
					childrenArray.push({
						field: searchOptions[i],
						condition: "like", // No I18N
						values: [searchText],
						logical_operator: "OR" // No I18N
					});
				}
			}
		}
		if (childrenArray.length > 0) {
			search_criteria.children = childrenArray;
		}
		return search_criteria;
	},
	getRequesterSearchOptions: function(){
		var searchOptions = [];
		if (window.sdp_app.CLIENT_CONF.user_search_options.toString().indexOf("email_id") !== -1) {
			searchOptions = window.sdp_app.CLIENT_CONF.user_search_options;
		} else {
			searchOptions = window.sdp_app.CLIENT_CONF.user_search_options.concat("email_id"); // NO I18N
		}
		return searchOptions;
	},
	/**
	 * A helper function is used to check the not assiciated site is available or not
	 * for the logined in user
	 */
	isNotAssociatedSiteAvailable:function(){
		return (sdp_user.ROLES.includes("Resources not in any site") || sdp_user.ROLES.includes("SDAdmin")); //NO I18N
		},
	/**
	 *  Space Association Popup
	 */
	spacePopup: {
		// We are construct the meta info for the 3 fields
		metainfo: {
			space_campuses: {
				href: "/api/v3/spaces/space_campuses", // NO I18N
				name: getMessageForKey("space.campus"), // NO I18N
				common_module_input :  {"field": "common_module", "condition": "is", "value": "space_campus", "logical_operator": "AND"} // NO I18N
			},
			space_structures: {
				href: "/api/v3/spaces/space_structures", // NO I18N
				name: getMessageForKey("space.building"), // NO I18N
				common_module_input :  {"field": "common_module", "condition": "is", "value": "space_building", "logical_operator": "AND"}	 // NO I18N
			},
			space_floors: {
				href: "/api/v3/spaces/space_floors", // NO I18N
				name: getMessageForKey("space.floor"), // NO I18N
				common_module_input :  {"field": "common_module", "condition": "is", "value": "space_floor", "logical_operator": "AND"}	 // NO I18N			
			}
		},
		// Default Options
		options: {},
		/**
		 * Popup is used list the space by using v3 API
		 * @param {Options} Options for the space association popup
		 * @param {String[]} Options.available_fields List of available fields
		 * @param {Function} Options.onSelect Callback function, once the options is selected
		 * @param {Number[]} Options.selected Selected value, it will helpfull in edit page
		 */
		open: function(options) {
			var self = this;
			var jQBody = jQuery("body"); // NO I18N
			// If the container is not available, then we load it
			if (!jQBody.find("#space-association-container").length) {// NO I18N
				jQBody.append('<div id="space-association-container"></div>'); // NO I18N
			}
			self.options = options;
			// Open dialog
			jQBody.find("#space-association-container").dialog({ // NO I18N
				title: getMessageForKey("sdp.searchitem.select", [ // NO I18N
					getMessageForKey("space.field") // NO I18N
				]), 
				width: 1150,
				height: 500,
				modal: true,
				open: function() {
					// Prevent the body from scrolling
					jQBody.addClass("atp-open"); // NO I18N
					// Construct the HTML into table
					self.renderPopup();
				},
				close: function() {
					// Remove the atp-open class once the popup is closed
					jQBody.removeClass("atp-open"); // NO I18N
					// Destory the webComponent instance
					delete WebComponents.instancePool["webc-space_popup"]; // NO I18N
				}
			});
		},
		callbackSearchFunction : function(){
			var tablecomp = WebComponents.getInstance("webc-space_popup"); //NO I18N
			var search_criteria = this.getInputData().list_info.search_criteria;
			if(tablecomp.t_obj.table_info.list_info.search_criteria&&search_criteria&&search_criteria.length>0){
				if(tablecomp.t_obj.table_info.list_info.search_criteria.children){
					for(var i=0;i<search_criteria.length;i++){
						tablecomp.t_obj.table_info.list_info.search_criteria.children.push(search_criteria[i]);
					}
				}
				else{
					tablecomp.t_obj.table_info.list_info.search_criteria.children=search_criteria;
				}
			}
			else if(search_criteria&&search_criteria.length>0){
				tablecomp.t_obj.table_info.list_info.search_criteria=[];
				for(var i=0;i<search_criteria.length;i++){
					tablecomp.t_obj.table_info.list_info.search_criteria.push(search_criteria[i]);
				}
			}
			tablecomp.refreshTable("search"); // No I18N
		},
		/**
		 * Callback fucntion will call after the table component was rendered
		 */
		afterRender: function() {
			var self = this;
			var inputType="checkbox"; // NO I18N
			if(self.options.singleSelect){
				inputType="radio"; // NO I18N
			}			
			/**
			 * Give some to bind the events and render the table
			 */
			setTimeout(function() {
				var selected = self.options.selected || [];
				var jQBody = jQuery("body"); // NO I18N
				for (var index = 0; index < selected.length; index++) {
					var row = jQBody.find(".tc-row[data-entityid='" + selected[index].id + "'] [type='"+inputType+"']"); // NO I18N
					if (row.length) {
						row.trigger("click");
						//row.prop("checked", true); // NO I18N
					} else {
						// FIXME : Find a statergy to find selected fields
					}
				}
			}, 100);
		},
		tableCompOptions:function(){
			var self=this;
			return	{ bulkSelectionSetting : { selectionLimit:self.options.maximumSelectionSize , selectedRecords: $req.common.spacePopup.getDefaultSelectedRecords()	}	};
		},
		getDefaultSelectedRecords: function(){
			var self = this;
			var selected = self.options.selected || [];
			var selectedSpaces={};
			for (var index = 0; index < selected.length; index++) {
				if(selected[index]&&selected[index].text&&!selected[index].name){
					selected[index].name=selected[index].text;
				}
				selectedSpaces[selected[index].id]=selected[index];
			}
			return selectedSpaces;
		},
		/**
		 * On Select2 field change
		 * @param {string} field Name of the field
		 * @param {string | null} value Value of the field 
		 */
		onFieldChange: function(field, value) {
			var self = this;
			var jQBody = jQuery("body"); // NO I18N
			this.rerenderTable();
			switch (field) {
				case "space_campuses": // NO I18N
					try {
						jQBody.find("#space_structures").val("").prop("disabled", true).select2("destroy"); // NO I18N
						jQBody.find("#space_floors").val("").prop("disabled", true).select2("destroy"); // NO I18N
					} catch (error) {}
					if (value) {
						self.initSelect("space_structures"); // NO I18N
					}
					break;
				case "space_structures": // NO I18N
					try {
						jQBody.find("#space_floors").val("").prop("disabled", true).select2("destroy"); // NO I18N
					} catch (error) {}
					if (value) {
						self.initSelect("space_floors"); // NO I18N
					}
					break;
			}
		},
		/**
		 * Bind all component related events
		 */
		bindEvents: function() {
			var self = this;
			// Bind the event for Close button
			jQuery("#space-close").on("click", function() { // NO I18N
				jQuery("#space-association-container").dialog("close"); // NO I18N
			});
			// Bind the event for Select button
			jQuery("#space-save").on("click", function() { // NO I18N
				self.onSelect();
			});
			// Bind the events for checkbox
			var inputType="checkbox"; // NO I18N
			if(self.options.singleSelect){
				inputType="radio"; // NO I18N
			jQuery("#space-association-container").on("change", "[type='"+inputType+"']", function() { // NO I18N
				var jQBody = jQuery("body"); // NO I18N
				if (jQBody.find("#space-association-container [type='"+inputType+"']:checked").length) { // NO I18N
					// enable the select
					jQBody.find("#space-save").prop("disabled", false); // NO I18N
				} else {
					// disable the select
					jQBody.find("#space-save").prop("disabled", true); // NO I18N
				}
			});
			}
			// Set the selected row in the checkbox, if it is available
			/*jQuery("#space-association-container #nextPage, #space-association-container #prevPage").on("click", function() { // NO I18N
				self.afterRender();
			});*/
			// Set the select row while the page count increases
			/*jQuery("#pagination_comp_space_popup .sdmenu-dd a").on("click", function() { // NO I18N
				self.afterRender();
			});*/
		},
		/**
		 * Rerender the table on every select2 change
		 */
		rerenderTable: function() {
			// Re-Render the table
			var tablecomp = WebComponents.getInstance("webc-space_popup"); //NO I18N
			var listInfoObj = tablecomp.t_obj.table_info.list_info;
			listInfoObj.search_criteria = this.getInputData().list_info.search_criteria;
			// Refresh table
			tablecomp.refreshTable("search"); // No I18N
			tablecomp.changeFilterString('clearOnly'); // No I18N
		},
		/**
		 * Construct the input data for the both select2 and table
		 */
		getInputData: function() {
			var container = jQuery("#space-association-container"); // NO I18N
			// Get the value of each field
			var space_structures = container.find("#space_structures").val(); // NO I18N
			var space_floors = container.find("#space_floors").val(); // NO I18N
			var space_campuses = container.find("#space_campuses").val(); // NO I18N
			// Default list info
			var input_data = {
				list_info: {
					sort_field: "name", // NO I18N
					sort_order: "A", // NO I18N
					search_criteria: []
				}
			};
			if(this.options.search_criteria)
			{
				input_data.list_info.search_criteria.push(this.options.search_criteria);
			}
			// If the campuses field is available
			if (space_campuses) {
				input_data.list_info.search_criteria.push({
					field: "space_campus.id", // NO I18N
					value: space_campuses,
					condition: "is", // No I18N
					logical_operator: "and" // NO I18N
				});
			}
			// If the building field is available
			if (space_structures) {
				input_data.list_info.search_criteria.push({
					field: "space_building.id", // NO I18N
					value: space_structures,
					condition: "is", // No I18N
					logical_operator: "and" // NO I18N
				});
			}
			// If the floor field is available
			if (space_floors) {
				input_data.list_info.search_criteria.push({
					field: "space_floor.id", // NO I18N
					value: space_floors,
					condition: "is", // No I18N
					logical_operator: "and" // NO I18N
				});
			}
			return input_data;
		},
		/**
		 * Init Select2 for the field
		 * @param {string} field name of the field
		 */
		initSelect: function(field) {
			var container = jQuery("#space-association-container"); // NO I18N
			var ele = container.find("#" + field); // NO I18N
			var self = this;
			var id = ele.attr("id"); // NO I18N
			// enable the input field
			ele.prop("disabled", false); // NO I18N
			var input_data = {
				url: self.options.allowed_values_url?"/api/v3/"+self.options.allowed_values_url:"/api/v3/requests/space", // NO I18N
				field: "space", // NO I18N
				list_info: this.getInputDataForSelect2(id).list_info
			};
			// Initalize the select2
			ele.sdp_select2({
				url: [input_data],
				placeholder: ele.attr("placeholder"), // NO I18N
				allowClear: true
			});
			ele.on("change", function() { // NO I18N
				self.onFieldChange(id, jQuery(this).val());
			});
		},
		getInputDataForSelect2: function(key) {
			// Default list info
			var input_data = {
				list_info: {
					sort_field: "name", // NO I18N
					sort_order: "A", // NO I18N
					search_criteria: []
				}
			};
			if(this.options.search_criteria)
			{
				input_data.list_info.search_criteria.push(this.options.search_criteria);
			}
			input_data.list_info.search_criteria.push(this.metainfo[key].common_module_input);
			var container = jQuery("#space-association-container"); // NO I18N
			if(key=="space_structures"){
				var space_campuses = container.find("#space_campuses").val(); // NO I18N			
				if (space_campuses) {
					input_data.list_info.search_criteria.push({
						field: "space_campus.id", // NO I18N
						value: space_campuses,
						condition: "is", // No I18N
						logical_operator: "and" // NO I18N
					});
				}
			}
			if(key=="space_floors"){
				var space_structures = container.find("#space_structures").val(); // NO I18N
				if (space_structures) {
					input_data.list_info.search_criteria.push({
						field: "space_building.id", // NO I18N
						value: space_structures,
						condition: "is", // No I18N
						logical_operator: "and" // NO I18N
					});
				}
			}
			return input_data;
		},		
		/**
		 * On <button>Select</button> is clicked
		 */
		onSelect: function() {
			var selectedData = [];
			var selectedDataNames = [];
			var records= WebComponents.instancePool["webc-space_popup"].loadedRecords; //No i18n
			var inputType="checkbox"; // NO I18N
			if(this.options.singleSelect){
				inputType="radio"; // NO I18N
				if (this.options.selected&&this.options.selected.length>0) { 
					var id = jQuery(this).closest(".tc-row").data("entityid");  // NO I18N
					selectedData.push(this.options.selected[0].id);
					selectedDataNames.push(this.options.selected[0].name);
				}
			}
			else{
				var selectedRecords = WebComponents.instancePool["webc-space_popup"].bulkSelect.selectedRecords; // NO I18N
				if(selectedRecords){
					var selectedKeys = Object.keys(selectedRecords);
					if(selectedKeys&&selectedKeys.length>0){
						for(var i=0;i<selectedKeys.length;i++){
							selectedData.push(selectedKeys[i]);
							selectedDataNames.push(selectedRecords[selectedKeys[i]].name);
						}
					}
				}
			}
			if(this.options.maximumSelectionSize&&selectedData&&selectedData.length>this.options.maximumSelectionSize){
				showalert("failure", window.translate("common.select.items",[this.options.maximumSelectionSize]), "isAutoHide=true"); //NO I18N
				return;
			}
			// close the dialog
			jQuery("#space-association-container").dialog("close"); // NO I18N
			// call the callback function
			if (jQuery.isFunction(this.options.onSelect)) {
				this.options.onSelect(selectedData,selectedDataNames);
			}
		},
		/**
		 * Render the Popup  
		 */
		renderPopup: function() {
			var self=this;
			var data = {
				metadata: this.metainfo,
				singleSelect: this.options.singleSelect?this.options.singleSelect:false,
				url: self.options.allowed_values_url?self.options.allowed_values_url:"requests/space" // NO I18N
			};
			if(this.options.selected&&this.options.selected.length>0){
				data.enableSave=true;
			}
			var container = ".ui-dialog #space-association-container"; // NO I18N
			// Render the association-popup template
			renderhbs(container, "association-popup", data, false, "spacemodule/space",null,null, $req.details.bindEvents.templates.association_popup); // NO I18N
			// Render the webComponent
			WebComponents.render("webc-space_popup"); // NO I18N
			// Bind the events
			this.bindEvents();
			// Initalize the campuses field select2
			this.initSelect("space_campuses"); // NO I18N
		},
		/**
		 * Render the type field inside the table
		 */
		renderType: function(table_data) {
			var rowData = table_data.row_data;
			if (!rowData.template) {
				return;
			}
			return e_html(rowData.template.name);
		},
		renderCheckBox: function(table_data) {
			var rowData = table_data.row_data;
			if (this.options.singleSelect) {
				return '<input type="radio" name="selectedSpaceSingle" data-attr="space_ids" data-id="'+rowData.id+'" data-name ="'+rowData.name+'" value="'+rowData.id+'" data-table-checkbox="">';;
			}
			return '<input type="checkbox" value="'+rowData.id+'" data-table-checkbox="">';
		},	
		handleSingleSelect:function(id,name){
			this.options.selected=[{"id":id,"name":name}];
		},			
		/**
		 * Constrcut the input_data for table component inital render
		 */
		row_inputdata: function(table_info) {
			var list_info = table_info.list_info;
			var selectedLen = this.options.selected?this.options.selected.length:null;
			var selected = this.options.selected;
			if (selectedLen) {
				var search_criteria = [];
				for (var index = 0; index < selectedLen; index++) {
					search_criteria.push({
						field: "id", // No I18N
						value: selected[index],
						logical_operator: "or", // NO I18N
						condition: "is" //No I18N
					});
				}
				// We need to find better solution than this
				// list_info.search_criteria = search_criteria
			}
			if(this.options.search_criteria)
			{
				list_info.search_criteria?list_info.search_criteria.push(this.options.search_criteria):list_info.search_criteria=[this.options.search_criteria];
			}
			list_info.fields_required = ["name","template"]; // NO I18N
			return {
				list_info: list_info
			}; 
		}
	},
	initTemplateList: function(type,from,templateId) {
		var woID;
		if(from !== undefined){
			woID = from=="woForm" ? $req.form.woID : $req.details.request_info.id;//No I18N
		}
		if(templateId === undefined && from !== undefined && from === "Recommend_Template"){ //No I18N
			templateId = $req.details.request_info.template.id;
		}
		var url = woID ? "/api/v3/requests/" + woID +"/template": "/api/v3/requests/template";	//No I18N
		if(from !== undefined && from === "Recommend_Template"){
			url = "/servlet/SDAjaxServlet?action=allowed_templates_for_user&woId="+woID; //No I18N
		}
		if(window.isMSP) {
			url = url + '?ACCOUNTID=' + getAccountId();	//No I18N
		}
		var list_info = {
			row_count: 100,
			sort_fields: [
					{
					  "field": "service_category.name", //NO I18N
					  "order": "asc" //NO I18N
					},
					{
					  "field": "name", //NO I18N
					  "order": "asc" //NO I18N
					}
			],
			search_criteria: [{
				field: "is_service_template",	//No I18N
				condition: "is",	//No I18N
				value: "false"	//No I18N
			}]
		};
		var listEle;
		if(type === "service") {
			listEle = jQuery("#rf-template-service-list");
			list_info.search_criteria[0].value = "true";	//No I18N
		} else {
			listEle = jQuery("#rf-template-incident-list");
		}
		listEle.show().sdp_select2({
			processSearchData:function(data,_self){
				var templates = data.template;
				var modifiedTemplates = {}
				var templateLength = templates.length;
				for (var i = 0; i < templateLength; i++) {
					var current = templates[i];
					if(templateId != undefined && templateId == current.id){
						continue;
					}
					if(!current.text){
						current.text = current.name;
					}
					var serviceCategoryName = current.service_category ? current.service_category.name : "";
					if(!current.service_category){
						if(!modifiedTemplates[" "]){
							var othersCategoryName = (from == "woForm") ? $req.form.ssp.others_category_name : $req.details.self_service_portal_settings.others_category_name; //No I18N
							modifiedTemplates[" "] = {

								text : othersCategoryName,
								children : []
							}
						}
						modifiedTemplates[" "].children.push(current);
					}
					if(current.service_category && !modifiedTemplates[serviceCategoryName]){
						modifiedTemplates[serviceCategoryName] ={
							text : current.service_category.name,
							children :[]
						}
					}
					if(modifiedTemplates[serviceCategoryName]){
						modifiedTemplates[serviceCategoryName].children.push(current);
					}
				}
				processTemplates=[];
				jQuery.each(modifiedTemplates, function(key, value) {
					processTemplates.push(value);
				});
				return processTemplates;
			},
			formatSearching : function() {
				return getMessageForKey('ae.common.search.text');
			},			
			url: [{
			url: url,
			cacheData: {},
			field: 'template',	//No I18N
			list_info: list_info,
			processResults: function(search_data, data, field,settings) {
				var name = data.name
				search_data.push({
					text: name,
					id :  data.id,
					service_category: data.service_category
				});
			}
		}]});
		

		/**
		 * when service catalog is enabled or the current ticket is an already created service ticket,
		 * both Incident and Service templates will be rendered in separate select2 list
		 */
		if(sdp_app.IS_SERVICECATALOG_ENABLED || ( from !== undefined && from === "woForm" && $req.form.edit_mode && $req.form.is_service_template )) {
			var listTabs = '<div class="sdtabs-ui2 mb10 template-tabs">' +	//No I18N
					'<ul class="nav nav-sdtabs req-template-type">' +	//No I18N
						'<li id="incident_template_list" class="' + (type === "service" ? "" : "active") + '">' +	//No I18N
							'<a href="/" id="incidentTab" title="'+getMessageForKey("common.incident.template")+'" rel="uitip" mode_ellipsis="true"' +	//No I18N
								'>' + getMessageForKey("common.incident.template") + '</a>' +	//No I18N
						'</li>' +	//No I18N
						'<li id="service_template_list" class="' + (type === "service" ? "active" : "") + '">' +	//No I18N
							'<a href="/" id="serviceTab" title="'+getMessageForKey("common.service.template")+'" rel="uitip" mode_ellipsis="true"' +	//No I18N
								'>' + getMessageForKey("common.service.template") + '</a>' +	//No I18N
						'</li>' +	//No I18N
					'</ul>' +	//No I18N
				'</div>';	//No I18N
			listEle.on("select2-opening", function() {	//No I18N
				var dropdown = listEle.select2("dropdown");	//No I18N
				jQuery(".template-tabs").remove();
				dropdown.prepend(listTabs);
				if(type === "service"){
                    jQuery("#incidentTab").off('click').on('click', (event) => {  // No I18N
                        $req.common.switchTemplateTab('incident', '', from, templateId);  // No I18N
                        return false;
                    })
                }
                else{
                    jQuery("#serviceTab").off('click').on('click', (event) => {  // No I18N
                        $req.common.switchTemplateTab('service', '', from, templateId);  // No I18N
                        return false;
                    })
                }
				initTooltip('.template-tabs'); //No I18N
			});
		}
	},

	/**
	 * switches the Template list ( Service | Incident ) and hides the other
	 */
	switchTemplateTab: function(type, preventOpening,from,templateId) {
		var incidentList = jQuery("#rf-template-incident-list");	//No I18N
		var serviceList = jQuery("#rf-template-service-list");	//No I18N
		var incidentS2 = incidentList.data("select2");	//No I18N
		var serviceS2 = serviceList.data("select2");	//No I18N
		if(type === "service") {
			if(incidentS2) {
				incidentS2.close();
				incidentS2.container && incidentS2.container.hide();
			}
			if(serviceS2) {
				serviceS2.container && serviceS2.container.show();
			} else {
				if(from !== undefined && from == "woForm"){
					$req.form.initTemplateList("service");//No I18N
				}
				else{
					this.initTemplateList("service",from,templateId);	//No I18N
				}
			}
			!preventOpening && serviceList.select2("open");	//No I18N
		} else {
			if(serviceS2) {
				serviceS2.close();
				serviceS2.container && serviceS2.container.hide();
			}
			if(incidentS2) {
				incidentS2.container && incidentS2.container.show();
			} else {
				if(from !== undefined && from == "woForm"){
					$req.form.initTemplateList("incident");//No I18N
				}
				else{
					this.initTemplateList("incident",from,templateId);	//No I18N
				}
			}
			!preventOpening && incidentList.select2("open");	//No I18N
		}
	},
	//SD-103876
	revisePriority: function(updateinfo){
	/**
	 * Revise the priority
	 *  If the priority_matrix_techoverride is disabled, then we should sent the priority to the server,
	 * Execpt, 
	 * If the priority_matrix_techoverride and status changed to resolved or closed, in this case need to sent 
	 * 	priority to server.
	 *  This code is code to handle such cases common
	 * 	1. Request Form Page
	 *  2. Request Bulk Edit Page
	 *  3. Request Details Page (Form Component Based - TBI)
	 */
	// get the status type
		var statusType = "";
		if(updateinfo.status){
			statusType = $req.common.getStatusType(updateinfo.status.id);
		}
		// Check all above mentioned case
		if(["Closed","Resolved"].includes(statusType) && $req.form.ssp.priority_matrix_techoverride === false && $rf.fields.priority._value){
			var priority =  $rf.fields.priority._value;
			// This piece of code, needed since the common null handle is not in the form page but in bulk edit page
			if(!priority || (priority && priority.id == "0") ){
				priority = null;
			}else{
				priority = {"id": $rf.fields.priority._value}; //NO I18N
			}
			updateinfo.priority = priority;
		}
	},
	
	initializeSiteSelect2 : function(options){
		var selector = options.selector;
		var elementSelected = jQuery(selector);
		var select2Options = {	   	
			placeholder: getMessageForKey("common.site.placeholder"),//No I18N
	      	closeOnSelect: true,
			minimumInputLength : 0,
			allowClear: false,
			multiple: false,
			url:[{"url":options.url ? options.url : "/api/v3/requests/site" , "field" : "site" , "list_info" : {row_count:100}}], //No I18N
		};
		if(options.modifyResults){
			select2Options.processResults = function(search_data,data,field){
				if(data && data.id) 
				{
					if(data.id=="-1"){
						data.id="0";
					}
					search_data.push({	id: data.id,	name: data.name});
				}
			};
			select2Options.formatSelection = function(item) {
				return e_html(item.name)||e_html(item.text);
			};
			select2Options.formatResult = function(item) {
				return e_html(item.name)||e_html(item.text);
			};
		}
		elementSelected.sdp_select2(select2Options);
		if(options.selectedData){
			elementSelected.select2('data',options.selectedData);	//No I18N
		}
		if(options.onChangeCallback && typeof options.onChangeCallback == 'function'){
			elementSelected.on('change', function() {
               options.onChangeCallback(this.value);
            });
		}
	},
	/*
	  This method is to set warning header, Based on the warning message.
	*/
    setWarningHeader : function(options,warning,metaInfoFields){
    			if(!options|| (!options.element &&  !options.getMessage)){
    				return false;
    			}
    			let headerEle = options.element && jQuery("#"+options.element);
    			if(warning){
    				let alertMsg = warning.message.split(".")[0];
    				 if(warning.status_code == 21004 && warning.fields!==null){
    					let fields = warning.fields.slice();
    					metaInfoFields && warning.fields.forEach(function(field, index) { //Replacing api field names to display names using meta info .
    					   if(field == "content"){ //NO I18N
    						  field = "resolution" //NO I18N
    					   }
    					   if(metaInfoFields[field]){
    						 fields[index] = metaInfoFields[field].display_name;
    					   }
    					});
    					alertMsg += " : ";
    					alertMsg += fields.join(", ");
    					alertMsg += ". ";
    					alertMsg += `<a href="${translate('21004.learnmore.link')}" target="_blank" rel="noopener noreferrer" class="text-link">${translate('sdp.dc.header.learnmore')}</a>`
    				 }
    				 if(options.getMessage){
    					return alertMsg;
    				 }
    				 headerEle.find("span").html( '<strong>'+alertMsg+'</strong>');
    				 headerEle.hasClass("hide") ? headerEle.removeClass("hide") : headerEle.show(); //No I18N
    			}
    			else{
    				if(options.getMessage){
    					return undefined;
    				}
    				if(headerEle.length>0){
    				    !headerEle.hasClass("hide") && headerEle.hide(); //No I18N
    				}
    			}
	},

	openCIPopup: (selectionlimit) => {
		let jQBody = jQuery("body"); // NO I18N
		if (!jQBody.find("#ci-association-container").length) {// NO I18N
			jQBody.append('<div id="ci-association-container"></div>'); // NO I18N
		}
		assetsObj.loadAttachCIPopup('requests','configuration_items','ci-association-container',selectionlimit);// NO I18N
    },

    //This will construct the select2 component for 'Pick list - refer additional fields' in Request details page.
    initializeReferFieldSelect2 : function(options,field_name,isMultiSelect,selectedVal){
            var fieldMeta=$req.details.meta_info.fields.udf_fields.fields[field_name];
            var maxSelectionCount=(fieldMeta.constraints)?(fieldMeta.constraints.max_values):'25';
            options = {
                placeholder: translate("sdp.requests.fieldFormRules.rules.notspecified"),//No I18N
                closeOnSelect: false,
                minimumInputLength : 0,
                allowClear: true,
                multiple: isMultiSelect,
                maximumSelectionSize: maxSelectionCount,
                formatNoMatches: translate("ae.select2.no.message"),
                formatSelectionTooBig: function () {return translate("sdp.admin.multiselect.max.option.exceed", [maxSelectionCount]);},		//No I18n
                url:[{"url":"/api/v3"+fieldMeta.href, "field" : field_name , "list_info" : {row_count:100}}], //No I18N
    			processResults: function(cacheData, data) {
    				var obj = {};
    				obj.text = data.name || data.text;
    				obj.id = data.id;
    				if(data.site) {
    					obj.site = data.site;
    				}
    				cacheData.push(obj);
    			},
    			formatResult: function(data) {
    				var name = data.text;
    				if(data.site && data.site.name) {
    					name = data.text + ", " + data.site.name;
    				}
    				return e_html(name);
    			},
    			formatSelection: function(data) {
    				var name = data.text;
    				if(data.site && data.site.name) {
    					name = data.text + ", " + data.site.name;
    				}
    				return e_html(name);
    			}
            };
            jQuery('[name="'+field_name+'"]').sdp_select2(options);
            if(isMultiSelect && selectedVal){
                selectedVal.forEach(function(item){item.text=item.name});
                jQuery('[name="'+field_name+'"]').select2("data",selectedVal); //No I18N
            }
        },

        getReferUDFAllowedValues: function(allowedValues,udfName){
    		var input_data={"list_info":{"row_count":100}}; //No I18N
            var udfAllowedValues = sdpAjax({
                url : '/api/v3/requests/'+woID+'/'+udfName,	//No I18N
                type: "GET",	//No I18N
                cache: false,
    			data:sdpAjaxInputData(input_data),
                cache: false,
                async:false,
                success: function(data) {
                    if(data && data[udfName]) {
                        data[udfName].forEach(function(item){
    						allowedValues[item.id]=(item.site && item.site.name)?(item.name+ ", " +item.site.name):item.name;
    					});
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    //TODO: handle error
                }
            });
        }
};
$req.common.init();
