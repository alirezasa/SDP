/* $Id$ */


/*********************** Property ***************************/
$req.prop = {
	/** Initialize the property objects */
	init: function() {
		this.element="property-content";//No i18n
		this.hideRightPanelFields = [];
		this.fafr_mandate_keys = []; //used to store mandate fields
		this.fafr_mandate = []; // Used to store mandate fields from  template and FAFR
		this.fromListview = false; // flag for listView
		this.resourceObj = {}; // contain template resorces
		this.fieldsObj = {}; // contain template fields
		this.resourceTemplateObj = {}; // Contain resources which is inside the template json
		this.isOperationComplete = true; // is false when we had some error
		this.checkResolutionStatus = false; // when resolution status editable mode then it is true.
		this.resourceMandateFields =[]; // contain the close resource mandatory fields
	    this.checkBulkEdit = false; //true when we do sectional Edit
	    this.rulesObj = {};// contain FAFR rules Object
	    this.didFetchRules = false;	//Whether the FAFR for the ticket has been fetched or not
	    this.didFetchFieldsObj = false;	//Whether the fields details (allowed values, type, ...) object for the ticket has been fetched or not
	    this.didFetchResourceObj = false;	//Whether the resources details (allowed values, type, ...) object for the ticket has been fetched or not
	    this.sectionalUpdateJson ={}; //json for bulk update, it keep all the fields and updated value for database
	    this.fieldDetails = {};//contain left and right fields's group Details Object
	    this.udfDBObject = {};//contains updated values of UDF fields for update
	    this.checkSGT =false;//check true when field is SGT
	    this.checkCSI =false;//check true when field is CSI
	    this.checkNumDecimal =true;//check for Numeric and Decimal Values
	    this.checkSubmitMsg ="";//Db update Message
	    this.checkPriorityMatrix  = false; //check the api call of priority matrices
		this.isCategoryNotAvailable =false;//boolean to check whether category is available in the application
	    this.dependentField = ['site','group','technician','category','subcategory','item'];//group of CSI and SGT Fields //NO I18N
	    this.nonSelectedField = []; // non editable fields depends on the status value
	    this.mandatoryFieldJson =[];//array contains mandatory fields adding for (*)
	    this.closure_info ={};//contain closure code object
	    this.fcrUpdateJson ="";// contain fcr value
	    this.onhold_scheduler ={}; // onhold scheduler json object used for update sectionalupdateJson
	    this.checkDate =true;// check for date validation, Fr_dbt can't be exiced than due_b_t
	    this.checkRightPanel = false;//check for right Panel
	    this.status_change_comments = "";//for update the Mandatory Comments
	    this.editMode = false;
	    this.emptyPropertyFields = []; // json Array contain all answered fields (used in FAFR for hiding the all the empty Fields)
	    this.emptyResourceFields = []; // json Array contain all unanswered resources
	    this.highLightFields = []; // array cointain highlighted fields
	    this.requesterViewFields = ['request_type', 'status', 'mode', 'level', 'group', 'technician', 'service_category', 'email_ids_to_notify', 'impact', 'impact_details', 'urgency', 'priority', 'category', 'subcategory', 'item','space','configuration_items'];	//NO I18N
	    if(isSCP){
	    	this.requesterViewFields.push('product');
	    }
	    this.key_title_mappingObject  = {"description": getMessageForKey("sdp.common.description"),"worklog": getMessageForKey("sdp.requests.common.worklog"),"status_change_comments":getMessageForKey("sdp.request.statusChange.comment"),"tasks":getMessageForKey("sdp.admin.task.title"),"checklists":getMessageForKey("sdp.header.checklist")}; //NO I18N
	    this.costDetails = {};
	    this.prop_exception = ["requester_name", "asset", "subject", "description"];	//NO I18N
	    if(isSCP) {
	    	this.prop_exception.push("site");
	    }
	    this.additionResourceCostType = 0;
	    this.field_values = {};
	    this.resol_editor = null;	/** Resolution editor object */
	    this.modified_options={};   /** add/remove option via fafr can track through this **/
	    this.fafr_dependent_fields=[];   /**  fields to store dependent fields used in fafr **/
	    this.unavail_fields = ["editor"];	/** These fields are not available in request details edit form, hence redirecting to global edit page */ //NO I18N
	    this.fafrKeyMapping={}; /*This key used to store mapping between fafr key and field*/
	    this.checkRLC=false; //check for RLC implementation is triggered
	    this.assign_comments_attachments = []; // Holds temporarily attachment ids after upload attachment for assign comments
	    this.failureMsg = ""; //assign comments failure message
	    this.description = null;
	    this.resolution=null;
	    window.description_editor=null;
	    window.resolution_editor=null;
		  this.rlc_notes=null;
		this.replyTemplateStatus=false;
	},

	/* render the Property */
	render:function(checkFAFR,skipOnload) {
		if(!$req.details.request_info.hasOwnProperty('site') && this.prop_exception.indexOf("site") === -1) {
			this.prop_exception.push("site");
		}
		/* fields list which are not editable */
	    this.nonSelectedField = ['department','completed_time','time_elapsed','resolved_time','response_time_elapsed','created_by','sla','template','last_updated_time','service_approvers','ola_due_by_time']; //NO I18N
	    if($req.details.template_module === 'SERVICE'){
	        this.nonSelectedField.push('service_category');
	    }
	    $req.rpanel.fieldsObj = {}	/** Resetting the value to construct the right panel visible fields in Right Panel. */
	    this.requesterViewFields = ['request_type', 'status', 'mode', 'level', 'group', 'technician', 'service_category', 'email_ids_to_notify', 'impact', 'impact_details', 'urgency', 'priority', 'category', 'subcategory', 'item','space','configuration_items'];	/** Resetting the value as it is changed every time when we render the properties */ //NO I18N
	    if(isSCP){
	    	this.requesterViewFields.push('product');
	    }
		/* get the json and render property page */
		$req.prop.fieldDetails = $req.prop.getPropertyData();
		$req.prop.fieldDetails.request_info = $req.details.request_info;
		$req.prop.fieldDetails.is_print_mode = window.print_mode;
		if(isMSPOrSCP) {
			$req.prop.fieldDetails.isSignoffEnabled = sdp_app.IS_SIGNOFF_ENABLED;	//signoff is enabled for MSP and disabled for SDP in ServiceDeskUtil
		}
		$req.prop.fafr_dependent_fields=[];
		renderhbs(`#${$req.prop.element}`, 'property-section-template', $req.prop.fieldDetails, false, 'requests/properties', true, null, $req.details.bindEvents.property_templates.property_section_template); //No I18N

	    if($req.details.request_info.is_trashed || window.print_mode) {
	    	jQuery('#prop-edit-btn').remove();	// No I18N
	    }
	    if(window.print_mode) {
	    	return;
	    }
	    /* set Images for Technicians */
	    if(sdp_user.USERTYPE === 'Technician') {
	        /* set onhold status image */
	        $req.prop.setImageOnHoldStatus();
	        /* set Site Image */
	        if($req.details.request_info.site){
	            $req.prop.setImageSite($req.details.request_info.site.id);
	        }
	        /* set Technician Image */
	        if($req.details.request_info.technician){
	            $req.prop.setTechnicianIcon($req.details.request_info.technician.id);
	        }
	        /* set Account Image for MSP */
	        if(isMSPOrSCP && $req.details.request_info.account){
	            $req.mspprop.setAccountIcon($req.details.request_info.account.id);
	            if(isSCP && $req.details.request_info.subaccount) {
		            $req.mspprop.setSubAccountIcon($req.details.request_info.subaccount.id);
	            }
	        }
	    }
	    /* hide subject description fields */
	    $req.prop.hideExtraFields();
	    var templateId = $req.details.request_info.template.id;
	    var module = $req.details.template_module;
	    $req.prop.editMode = false;
	    $req.prop.isOperationComplete = true;
	    $req.prop.checkBulkEdit = false;
	    jQuery('#'+$req.prop.element).removeClass('form-edit'); //NO I18n
	    var fafrurl= '/servlet/SDAjaxServlet?';	// variable introduced for modifying URL for MSP/SCP	//NO I18n
	    if(isMSP){
			fafrurl = $req.prop.getModfiedURLForMSP();
	    }
	    //Field form Rules Object
	    if(!this.didFetchRules) {
		    sdpAjax({
		        url: fafrurl+'action=getTemplateRulesJson&module='+module+'&templateId='+templateId+'&sdUserType=Technician&mode=edit&rulesRequired=all', //NO I18N
		        type: 'GET',  //NO I18N
		        cache: false,
		        async: false,
		        success: function(data){
		            $req.prop.rulesObj = data;
		        }
		    });
		    this.didFetchRules = true;
	    }

	    /* apply fAFR after loading the form */
	    setTimeout(function(){
	    	/** If called from the listview, ondetailpage should be false */
	        $req.prop.setFieldAndFormRules(!$req.prop.fromListview,skipOnload);
	        if(checkFAFR === false){
	            $se.onDetailPage = false;
	        }
			jQuery("#req_details_skloader").skLoader("hide"); //No I18N
			jQuery("body").removeClass("atp-open"); //No I18N
	    }, 100);
	},

	/* this Function Create Json Object */
	getPropertyData:function (){
		var _self = this;
		var layout = JSON.parse(sdpToJSON($req.details.template_info.layouts));
		var constructSection = function(section, index) {
			var col_count = parseInt(section.column_count);
			var columns = [];
			for(var j=0; j<col_count; j++) {
				columns.push({
					"fields": []	//NO I18N
				});
			}
			for(j=0, f_len=section.fields.length; j<f_len; j++) {
				var f_name = section.fields[j].name;
				if(_self.prop_exception.indexOf(f_name) > -1) {
					continue;
				}
				/* construct field object */
				var fieldMetaInfo = _self.constructFieldObj(section.fields[j]);
				if(!fieldMetaInfo) {
					continue;
				}
				for(var key in fieldMetaInfo) {
					section.fields[j][key] = fieldMetaInfo[key];
				}

				var col_num = parseInt(section.fields[j].position.col) - 1;
				if(col_num == 1 || col_count == 1){

					section.fields[j].direc="bottom";
				}
				else{
					section.fields[j].direc="right";
				}
				columns[col_num].fields.push(section.fields[j]);
			}
			for(j=0; j<columns.length; j++) {
				if(columns[j].fields.length === 0) {
					columns.splice(j, 1);
					j--;
				}
			}
			if(columns.length === 0) {
				layout.sections.splice(index, 1);
				return false;
			}
			layout.sections[index].columns = columns;
			if(index-1 >= 0) {
				if(layout.sections[index].name === "-1") {
					layout.sections[index-1].merge_next = true;
				} else {
					layout.sections[index-1].merge_next = false;
				}
			}
			delete layout.sections[index].fields;
			return true;
		};

		/** Adding UDF values in to the requester readable fields array */
		if($req.sdp_user.USERTYPE === "Requester" && $req.details.request_info.udf_fields) {
			//As resource type fields also may come for details page load, restricting it here.
		    if($req.details.meta_info.fields.udf_fields && $req.details.meta_info.fields.udf_fields.fields){
                var udfMetaInfoObj = $req.details.meta_info.fields.udf_fields.fields;
                for(var udf in $req.details.request_info.udf_fields) {
                    if(udfMetaInfoObj.hasOwnProperty(udf) && udfMetaInfoObj[udf].field_group!='resources'){
                        this.requesterViewFields.push(udf);
                    }

                }
			}
		}

		for(var i=0; i<layout.length; i++) {
			if(($req.sdp_user.USERTYPE === "Technician" && layout[i].name === "technician_layout") || ($req.sdp_user.USERTYPE === "Requester" && layout[i].name === "requester_layout")){
				layout = layout[i];
				break;
			}
		}
		for(var i=0; i<layout.sections.length; i++) {
			var didInsert = constructSection(layout.sections[i], i);
			if(!didInsert) {
				i--;
			}
		}
		if($req.sdp_user.USERTYPE === "Requester") {
			layout.sections.push(this.getReqViewFields());
			constructSection(layout.sections[layout.sections.length-1], layout.sections.length-1);
		} else if(isMSPOrSCP && $req.sdp_user.USERTYPE === "Technician") {	//Technician only section for MSP	//NO I18N
			layout.sections.push($req.mspprop.getAccountFields());
			constructSection(layout.sections[layout.sections.length-1], layout.sections.length-1);
		}
		layout.sections.push(this.getExtraPropertyFields());
		constructSection(layout.sections[layout.sections.length-1], layout.sections.length-1);
		return layout;
	},

	constructFieldObj: function(field) {
		var req_info = $req.details.request_info;
		var isTEchnicianModify = window.print_mode? false : $req.details.operational_data.links.edit && $req.details.operational_data.links.edit.put ? true : false;
		var f_name = field.name;
		var edit=true, display="-", fieldValue="";
		var fafrKey, type, title;
		var key=f_name;
		var mandatoryField=false;//mandate fields are made to false
		var has_value = true;
		var f_meta_info = this.getFieldMetaInfo(key);
		if(f_meta_info === null) {
			return null;
		}
		fafrKey = f_meta_info.fafr_key;
		type = f_meta_info.type;
		title = f_meta_info.display_name;
		display_type=f_meta_info.display_type;
		var i18nKey = f_meta_info.display_key;
		if(Object.keys($se.rules).length==0){//mandate fields are without fafr are considered in normal flow
			mandatoryField=field.mandatory;
		}
		else if(fafrKey && field.mandatory){ // Those mandate fields are pushed into this variable and will be mandate in FAFR
			field.mandatory=false;
			if($req.prop.fafr_mandate == undefined){
				$req.prop.fafr_mandate=[];
			}
			$req.prop.fafr_mandate.push(fafrKey);
		}
		this.key_title_mappingObject[key] = title;

	    /* for Addition Fields */
	    if(key.lastIndexOf("udf_") !== -1) {
	        if(req_info.udf_fields[key]===null || req_info.udf_fields[key]=== undefined){
	            if(type === 'lookup' || display_type === 'Radio') {
	                display = getMessageForKey("sdp.common.notassigned");
	                fieldValue = "0";
	            }
	        } else if(type=="datetime") { //NO I18N
	            /** When the date value is lesser than year 1970, the display_value is sent as null and value is in negative */
	            display=req_info.udf_fields[key].display_value ? req_info.udf_fields[key].display_value : "-";
	            fieldValue = req_info.udf_fields[key].value >= 0 ? parseInt(req_info.udf_fields[key].value) : "";
	        } else if(type==='multi_line') { //NO I18N
	            display=req_info.udf_fields[key];
	            fieldValue = display;
	        } else if(req_info.udf_fields[key].length) {
				if(key.indexOf('multiselect')> -1){
					var out=[];
					var fieldVal=[];
					var multiArray=req_info.udf_fields[key];
					multiArray.forEach(function(multiVal){
						out.push((multiVal.site && multiVal.site.name)?(multiVal.name+ ", " +multiVal.site.name):multiVal.name);
						fieldVal.push({"id":multiVal.id, "text":multiVal.name});
					});
					display=out;
					fieldValue = fieldVal;
				}
				else{
					display=req_info.udf_fields[key];
					fieldValue = display;
				}
	        }
	        else if(req_info.udf_fields[key].name){
	        	display=(req_info.udf_fields[key].site && req_info.udf_fields[key].site.name)?(req_info.udf_fields[key].name+ ", " +req_info.udf_fields[key].site.name):req_info.udf_fields[key].name;
	            fieldValue = (key.indexOf('_pick')> -1)?req_info.udf_fields[key].id:display;
	        }
	    } else if(key.indexOf("closure") !== -1) {	//NO I18N /* request closure info */
	        if(!req_info.closure_info || (sdp_user.USERTYPE === 'Requester' && key === 'closure_comments')) {
	            return null;
	        } else if(req_info.closure_info) {
	            if(req_info.closure_info[key] === null) {
	                if(type === 'lookup') {
	                    display = getMessageForKey("sdp.common.notassigned");
	                    fieldValue = "0";
	                    this.emptyPropertyFields.push(fafrKey);
	                }
	            } else if(key==='closure_code' && req_info.closure_info[key] !==undefined) {
	                display = req_info.closure_info[key].name;
	                fieldValue = req_info.closure_info[key].id;
	            } else {
	                display = req_info.closure_info[key];
	                fieldValue = display;
	            }
	        }
	    } else if(req_info[key] === null || req_info[key] === undefined) {
	        if((key !== 'site' && type==='lookup') || (isMSPOrSCP && key === 'account')) {	//NO I18N
	    		display = getMessageForKey("sdp.common.notassigned");
	    		fieldValue = "0";
	    	} else if(key === 'site') { //NO I18N
	            display = getMessageForKey('common.site.nosite');
	            fieldValue = "0";
	        }
	    } else if(type=="datetime" || key==="time_elapsed") {	//NO I18N
	        /** When the date value is lesser than year 1970, the display_value is sent as null and value is in negative */
	        display = req_info[key].display_value ? req_info[key].display_value : "-";
	        fieldValue = req_info[key].value >= 0 ?parseInt(req_info[key].value) : "";
	    }
	    else if(type==="lookup" || type==="Label" || type==='service') {
	        display=req_info[key].name;
	        if(req_info[key].id){
	            fieldValue=req_info[key].id;
	        }
	    } else if(type ==='multi_select') { //NO I18N
	        if(req_info[key].length) {
	            display = JSON.parse(sdpToJSON(req_info[key]));
	            fieldValue = display;
	        }
	        if(key === 'assets' && req_info.hasOwnProperty('deleted_assets') && req_info.deleted_assets.length > 0) {
	        	if(display === '-') {
	        		display = [];
	        	}
	        	for(var i=0; i<req_info.deleted_assets.length; i++) {
	        		display.push({
	        			name: req_info.deleted_assets[i]
	        		});
	        	}
	        	fieldValue = display;
	        }
	    } else if(type === 'unknown') {	//NO I18N
	    	if(key === 'email_ids_to_notify') {
	            if(req_info.email_ids_to_notify.length) {
	                display = req_info.email_ids_to_notify;
	                fieldValue = display;
	            }
	        }
	    } else {
	        display=req_info[key];
	        fieldValue = display;
	    }
	    if(f_meta_info.fafr_key){
	    $req.prop.fafrKeyMapping[f_meta_info.fafr_key]=f_meta_info;
		$req.prop.fafrKeyMapping[f_meta_info.fafr_key].name=f_name;
		$req.prop.fafrKeyMapping[f_meta_info.fafr_key].display_value=display;
		$req.prop.fafrKeyMapping[f_meta_info.fafr_key].value=fieldValue;
	    }


	    /* default display values */
	    if(display === getMessageForKey('common.site.nosite') || display === getMessageForKey("sdp.common.notassigned") || display === "-" || display === "0.00" || (isMSPOrSCP && display === getMessageForKey('sdp.admin.org.technician.organizationdefault')) ) {
	        this.emptyPropertyFields.push(fafrKey);
	        has_value = false;
	    }
	    /* key is not in base json then return */
	    if((key ==='resolution') || (key === 'service_approvers') || display === undefined || ((key === 'editor' && display === getMessageForKey("sdp.common.notassigned")))) {
	        return null;
	    }


	    /** checks if the field is editable or not */
	    edit = this.canEditField(key, fafrKey);

	    /* object of mandatory Fields */
	    if(mandatoryField && Object.keys($se.rules).length==0) { //without fafr should not have mandateFieldJson
	        this.mandatoryFieldJson.push(key);
	    }
	    /* if technician can't modify then all the field are not editable*/
	    if(!isTEchnicianModify || req_info.is_trashed || window.print_mode) {
	        edit = false;
	    }
		if(key=="maintenance"){
			title=translate("maintenance.title");
		}
	    /* for requester only right panel will come */
	    var fieldObj = null;

	    if($req.sdp_user.USERTYPE === 'Requester' && key !== 'first_response_due_by_time') {
	    	var rvf_pos = this.requesterViewFields.indexOf(key);
	    	if(rvf_pos > -1) {
	    		this.requesterViewFields.splice(rvf_pos, 1);
	    	}
	        fieldObj = {
				"TITLE":title, // No I18N
				"KEY" : key, //NO I18N
				"DISPLAYVALUE" : display, //NO I18N
				"FIELDVALUE" : fieldValue, //NO I18N
				"FAFR_KEY":fafrKey,//NO I18N
				"VIEW" : true, //NO I18N
				"TYPE":type,//NO I18N
				"EDIT" : false //NO I18N
	        };
	        if($req.layout.properties.indexOf(key) > -1 && has_value) {
	        	$req.rpanel.fieldsObj[key] = fieldObj;
	        }
	    } else {
	    	this.field_values[key] = fieldValue;
	    	/** for assets, deleted assets should not be included in the actual value */
	    	if(key === "assets") {
	    		if(req_info["assets"].length > 0) {
	    			this.field_values["assets"] = req_info[key];
	    		} else {
	    			this.field_values["assets"] = "";	//No I18N
	    		}
	    	}
	    	/*if(($req.prop.checkBulkEdit || $req.prop.checkRightPanel || this.getChangedFields().indexOf(key)!==-1) && $req.prop.wizard.isEnabled && fafrKey && $CS.getText(fafrKey)){
	    		fieldValue = $CS.getValue(fafrKey);
	    		display = $CS.getText(fafrKey);
	    	}*/
	        fieldObj= {
				"KEY":key,//NO I18N
				"TYPE":type,//NO I18N
				"DISPLAYVALUE":display,//NO I18N
				"FIELDVALUE":fieldValue,//NO I18N
				"TITLE":title,//NO I18N
				"FAFR_KEY":fafrKey,//NO I18N
				"EDIT":edit, //NO I18N
				"VIEW" : true, //NO I18N
				"i18nKEY" : i18nKey //No I18N
	        };
	        /* technician right panel field object */
	        if($req.layout.properties.indexOf(key) > -1 && (has_value || $req.rpanel.actionable_props.indexOf(key) > -1 || (isMSPOrSCP && key === "account"))) {
	        	// for MSP, Account field should be present in right panel even if it is not assigned
	            $req.rpanel.fieldsObj[key] = fieldObj;
	        }
	    }
	    return fieldObj;
	},

	/** Checks if the given field can be edited */
	canEditField: function(field, fafrKey) {
		/* non Editable fields
	    * 1- priority is non Ediatble (from priority Matrix)
	    * 2- printMode
	    * 3- if userType is Requester
	    * 4- request is trashed
	    * 5- field should be nonSelected Fields
	    * 6- fafr is undefined or field is Editor && field doesn't contain Closure in field && field shdn't be  assets && field shdn't be first response due by time
	    */
	    if( window.print_mode
	    	|| $req.details.request_info.is_trashed
	    	|| $req.sdp_user.USERTYPE === 'Requester' //No I18N
	    	|| (this.nonSelectedField.indexOf(field) !== -1)
	    	|| (field === "priority" && $req.details.self_service_portal_settings.priority_matrix_techoverride === false)	//No I18N
	    	|| ((fafrKey === undefined || field === 'editor') && ((field.indexOf('closure_') === -1) && (field !== 'assets') && (field !== 'first_response_due_by_time')))	//No I18N
	    	|| (isMSPOrSCP && field === 'account')) {	//No I18N
	        return false;
	    }

	    var permissions = $req.details.operational_data.links
	    if(permissions) {
	    	if( (!(permissions.assign && permissions.assign.put) && (field === "technician" || field === "group" || field === "site")) ) {
	    		return false;
	    	}
	    }

	    if($req.sdp_user.ROLES.indexOf("ModifyingDueTime") === -1 && (field === "created_time" || field === "due_by_time" || field === "first_response_due_by_time")) {
	    	return false;
	    }
	    return true;
	},

	getExtraPropertyFields: function() {
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
			if($req.sdp_user.USERTYPE === "Technician") {
				field.can_req_view = can_req_view;
			}
			return field;
		};

		/** TODO::: Is Asset module enabled value is not available in client side, hence checking the asset property in base info */
		if($req.details.request_info.hasOwnProperty("assets")) {
			extraSection.fields.push(addExtraField("assets", true, true));
		}
		extraSection.fields.push(addExtraField("created_by", false, true));
		if(!isSCP) {
		extraSection.fields.push(addExtraField("department", false, true));
		}

		if($req.sdp_user.USERTYPE === "Technician") {
			extraSection.fields.push(addExtraField("sla", false, false));
			if($req.details.template_module === "SERVICE") {
				extraSection.fields.push(addExtraField("service_category", false, true));
			}
		}

		extraSection.fields.push(addExtraField("template", true, true));
		if($req.details.request_info.maintenance){
			extraSection.fields.push(addExtraField("maintenance", false, true));
		}
		extraSection.fields.push(addExtraField("created_time", false, true));

		// Scheduled_start_time and Scheduled_end_time
		if($req.sdp_user.USERTYPE === "Technician") {
			extraSection.fields.push(addExtraField("scheduled_start_time", true, true));
			extraSection.fields.push(addExtraField("scheduled_end_time", true, true));
		}

		if($req.details.request_info.responded_time && $req.details.request_info.responded_time.value) {
			extraSection.fields.push(addExtraField("responded_time", false, true));
		}
		extraSection.fields.push(addExtraField("due_by_time", false, true));
		if($req.details.request_info.resolved_time && $req.details.request_info.resolved_time.value) {
			extraSection.fields.push(addExtraField("resolved_time", false, true));
		}
		if($req.details.request_info.completed_time && $req.details.request_info.completed_time.value) {
			extraSection.fields.push(addExtraField("completed_time", false, true));
		}
		if($req.details.request_info.time_elapsed && $req.details.request_info.time_elapsed.value) {
			extraSection.fields.push(addExtraField("time_elapsed", false, true));
		}

		if($req.sdp_user.USERTYPE === "Technician") {
			extraSection.fields.push(addExtraField("first_response_due_by_time", false, false));
			extraSection.fields.push(addExtraField("closure_code", false, false));
			extraSection.fields.push(addExtraField("closure_comments", false, false));
			if($req.details.request_info.response_time_elapsed && $req.details.request_info.response_time_elapsed.value) {
				extraSection.fields.push(addExtraField("response_time_elapsed", false, false));
			}
			if($req.details.request_info.ola_due_by_time && $req.details.request_info.ola_due_by_time.value) {
				extraSection.fields.push(addExtraField("ola_due_by_time", false, false));
			}
		}
		extraSection.fields.push(addExtraField("last_updated_time", false, true));
		/*	extraSection.fields.push(addExtraField("resolution", false, true));	*/
		return extraSection;
	},

	/** Returns viewable fields for Requester which are not available in template */
	getReqViewFields: function() {
		var viewSection = {
			"collapsed_state": "expanded",	//NO I18N
			"column_count": "2",	//NO I18N
			"fields": [],	//NO I18N
			"name": "-1"	//NO I18N
		};
		var col = 1, row = 1;
		var addViewField = function(name) {
			var field =  {
				"mandatory": false,	//NO I18N
				"name": name,	//NO I18N
				"position": {	//NO I18N
					"col": col,	//NO I18N
					"row": row 	//NO I18N
				}
			};
			if(col == 1) {
				col++;
			} else {
				col = 1;
				row++;
			}
			return field;
		};
		for(var i=0; i<this.requesterViewFields.length; i++) {
			if($req.details.request_info.hasOwnProperty(this.requesterViewFields[i]) || (this.requesterViewFields[i].indexOf("udf_") > -1 && $req.details.request_info.udf_fields.hasOwnProperty(this.requesterViewFields[i]))) {
				viewSection.fields.push(addViewField(this.requesterViewFields[i]));
			}
		}
		return viewSection;
	},

	/**
	 * Returns the meta info for the given field
	 */
	getFieldMetaInfo: function(field) {
		var f_meta_info = null;
		if($req.details.meta_info.fields[field]) {
			f_meta_info = $req.details.meta_info.fields[field];
		} else if(field.indexOf("udf_") > -1) {
			if($req.details.meta_info.fields.udf_fields.fields.hasOwnProperty(field)) {
				f_meta_info = $req.details.meta_info.fields.udf_fields.fields[field];
			} else {
				return null;
			}
		} else if(field.indexOf("closure_") > -1 && $req.details.request_info.closure_info) {
			if($req.details.request_info.closure_info.hasOwnProperty(field)) {
				f_meta_info = $req.details.meta_info.fields.closure_info.fields[field];
			} else {
				return null;
			}
		} else if ($req.details.meta_info.fields.resources && $req.details.meta_info.fields.resources.hasOwnProperty(field)) {
			f_meta_info = $req.details.meta_info.fields.resources[field];
		} else {
			return null;
		}
		if(f_meta_info) {
			f_meta_info = JSON.parse(sdpToJSON(f_meta_info));
			this.reviseFieldType(f_meta_info);
		}
		return f_meta_info
	},

	/** server-client field type mapping, based on the client implementation */
	reviseFieldType: function(field) {
		if(field.type === "lookup") {
			if(field.multiple) {
				field.type = "multi_select";	//No I18N
			}
			if(field.display_type === "Radio") {
				field.type = "string";
			}
		} else if(field.type === "string") {
			if(field.display_type === "MultiSelect" || field.display_type === "CheckBox") {
				field.type = "multi_select";
			}
		}
		if(field.display_type === "Pick List") {
			field.type = 'lookup';	//No I18N
		} else if(field.display_type === "Multi Line") {	//No I18N
			field.type = 'multi_line';	//No I18N
		}
		if(field.fafr_key == "ASSET") { //No I18N
			field.fafr_key = "REQUESTER.ASSETS";	//No I18N
		}
	},

	/** Updates the meta info type of the fields that differs from server, in implementation */
	reviseMetaInfo: function() {
		if($req.details.meta_info.fields) {
			for(var field in $req.details.meta_info.fields) {
				if(!$req.details.meta_info.fields[field].hasOwnProperty("fields")) {
					this.reviseFieldType($req.details.meta_info.fields[field]);
				}
			}
			if($req.details.meta_info.fields.udf_fields && $req.details.meta_info.fields.udf_fields.fields) {
				for(field in $req.details.meta_info.fields.udf_fields.fields) {
					this.reviseFieldType($req.details.meta_info.fields.udf_fields.fields[field]);
				}
			}
			if($req.details.meta_info.fields.closure_info && $req.details.meta_info.fields.closure_info.fields) {
				for(field in $req.details.meta_info.fields.closure_info.fields) {
					this.reviseFieldType($req.details.meta_info.fields.closure_info.fields);
				}
			}
		}
	},

	/**
	 * opens or focuses the selected field (dropdown, input, e.t.c), when the respective field triggered the sectional edit
	 */
	focusField: function(name, oldRelativeTop) {
		var element = jQuery('#propertyDetailForm [name="' + name + '"]');		//No I18N
		var metaInfo = $req.prop.getFieldMetaInfo(name);
		var element_Type = metaInfo.type;
		var resultTop = element.parents(".col-fields:first").offset().top - oldRelativeTop;	//No I18N
		var submitRowHeight = 45 + ( typeof is_chathgt !== "undefined" && !isNaN(is_chathgt) ? is_chathgt : 0 );	//No I18N
		/** avoiding the field overlapped by the submit footer */
		if(oldRelativeTop > jQuery(window).height() - submitRowHeight) {
			resultTop += submitRowHeight;
		}
		//scrolls to the fields
		jQuery('html, body').animate({	//No I18N
			scrollTop: resultTop
		}, 0);

		//focus or open input field.
		switch(element_Type) {
			case "lookup":	//No I18N
			case "multi_select":	//No I18N
				element.select2('open');	//No I18N
				break;
			case "datetime":	//No I18N
				$req.prop.inlineCalendar(name);
				break;
			default:
				element.focus();
				break;
		}
		var displayType = metaInfo.display_type;
		if(displayType === "Radio" || displayType === "CheckBox") {
			var el_bg_color = element.parents(".input-group").css('background-color');    //No I18N
			element.parents(".input-group").animate({	//No I18N
				backgroundColor: "#fff1db"	//No I18N
			}, 500, function(){
				element.parents(".input-group").animate({	//No I18N
					backgroundColor: el_bg_color
				}, 500);
			});
			element.blur();
		}
	},

	/* this function use to edit Field Inline */
	setInlineEdit: function(name){
		if(Object.keys($req.prop.rulesObj).length) {
			var top = null;
			var selectedField = jQuery('[data-name="' + name + '"]').parents(".col-fields:first");	//No I18N
			if(selectedField.length > 0) {
				top = selectedField.offset().top - jQuery(window).scrollTop();//to get the current top position of the element.
			}
			$req.prop.sectionalFieldsEdit();
			if(top) {
				/** scrolls to the clicked field position */
				this.focusField(name, top);
			}
			return false;
		}
		/* inline edit will close all the editable fields in right panel */
		if($req.prop.checkRightPanel){
			$req.prop.checkRightPanel = false;
			$req.rpanel.render();
		}
	  	this.checkBulkEdit = false;
	  	this.editMode = true;
	  	var csi=false, sgt=false, editFieldArr = [];

	    if(name === 'category' || name === 'subcategory' || name === 'item') {
	        editFieldArr.push('category','subcategory','item');
	        csi=true;
	    } else if(name === 'site'||name === 'technician' || name === 'group') { //NO I18N
	        editFieldArr.push('site','group','technician');
	        sgt=true;
	    } else {
		    editFieldArr.push(name);
	    }
	    var len = editFieldArr.length;
	    var validateRules = {};
	    var validateMsg = {};
	    var currStatus = $req.prop.getCurrentStatus();
	    /* for getting the mandatory closure Fields */
	    if((currStatus === 'Closed' || currStatus === 'Resolved') && !Object.keys($req.details.request_closing_rules).length){
			$req.details.getRequestClosingRulesJson();
		}
	    for(var i=0; i<len; i++) {
	    	$req.prop.setFieldEditMode(editFieldArr[i], true);
	    	if((currStatus === 'Closed' || currStatus === 'Resolved') && $req.details.request_closing_rules.mandatory_fields.indexOf(editFieldArr[i]) > -1) {
	    		$req.prop.setMandatoryField(editFieldArr[i]);
	    	}
	    	var fieldEle = jQuery("[data-name='"+editFieldArr[i]+"']");
	    	var field = {
	    		name: editFieldArr[i],
	    		TYPE: fieldEle.attr('type'),
	    		mandatory: false,	//No I18N
	    		TITLE: fieldEle.parents('.fafr-row').find('.fafr-label').data('title'),	//No I18N
	    	};
			if(Object.keys($se.rules).length==0){ //set mandatory if its without fafr
				field.mandatory=fieldEle.parents('.fafr-row').find('.mandatory').length > 0;	//No I18N
			}
	    	var ruleObj = this.constructRuleObj(field);
            if(!jQuery.isEmptyObject(ruleObj.rules)) {
            	validateRules[field.name] = ruleObj.rules;
            }
            if(!jQuery.isEmptyObject(ruleObj.messages)) {
            	validateMsg[field.name] = ruleObj.messages;
            }
	    }
	    /* handling dependency code for CSI and SGT */
	    if(csi) {
	    	$req.prop.setChangeOnCSIFields('inline'); //NO I18N
	    }else if(sgt){
	    	$req.prop.setChangeOnSGTFields('inline'); //NO I18N
	    }
	    jQuery('#propertyDetailForm [name="'+name+'"]').select2('open'); //NO I18N

	    /** jQuery validator initializing for iniline Edit. If already initialized, adding the rules and corresponding messages */
	    if(jQuery("#propertyDetailForm").data('validator')) {
	    	var validator = jQuery("#propertyDetailForm").validate().settings;
	    	if(validator.rules != null) {
	    		for(var rule in validateRules) {
	    			validator.rules[rule] = validateRules[rule];
	    		}
	    	} else {
	    		validator.rules = validateRules;
	    	}
	    	if(validator.messages != null) {
	    		for(var msg in validateMsg) {
	    			validator.messages[msg] = validateMsg[msg];
	    		}
	    	} else {
	    		validator.messages = validateMsg;
	    	}
	    	initFormValidator("propertyDetailForm", validator.rules, validator.messages);	//No I18N
	    } else {
	    	initFormValidator("propertyDetailForm", validateRules, validateMsg);	//No I18N
	    }
	},
	/* this function show save and cancel actions and call for options */
	setFieldEditMode:function (fieldName, inlineEdit) {
		//load Csi Model Json
		 //SD-104829 - CSI call being sent even other fields gets edited in details page.
		if((fieldName === 'category' || fieldName ==='subcategory' || fieldName === 'item') && !$req.prop.isCategoryNotAvailable){
	    if(!Object.keys($req.csi.csi_model).length) {
	    	$req.csi.setCSIModel();
				if(!$req.csi.csi_model.length){
					$req.prop.isCategoryNotAvailable = true;
				}
			}
	    }
	    //Priority Matrix
	    if((fieldName == 'priority' || fieldName === 'urgency' || fieldName === 'impact') && !this.checkPriorityMatrix) {
	    	$req.prop.getPriorityMatrix();
	    }
		var fieldElement = jQuery('[data-name='+fieldName+']');
		if(inlineEdit){
			hoverAndFocusField("#PropertyFrame",true); //NO I18N
		}
		/* show all the hidden fields for bulk edit which is hidden by FAFR on detail page Rules */
		if(!$req.prop.checkRightPanel) {
			fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
			fieldElement.parents('.fafr-row').show(); //NO I18N
	    }
	    if(this.nonSelectedField.indexOf(fieldName) === -1) {
	        var fafrKey = fieldElement.attr('fafr-name');
	        var type = fieldElement.attr('type');
	        /* show and hide the save close button */
	        if(!$req.prop.checkRightPanel) {
				fieldElement.addClass('hide').parent().find('.spot-form').removeClass('hide');
				if(inlineEdit){
					fieldElement.parent().find(".helpText").css("visibility","visible"); //No I18N
				}
	            //show and hide the save close button
	            if(this.checkBulkEdit) {
					jQuery('#'+fieldName+'_actions').addClass('hide');
					fieldElement.parent().find(".helpText").css("visibility","hidden"); //No I18N
	            } else {
	                jQuery('#'+fieldName+'_actions').removeClass('hide');
	                if(type==='lookup' && !this.checkBulkEdit) {
	                    jQuery('#'+fieldName+'_actions>#saveButton').addClass('hide');
	                }
	            }
	        }
	        /* set the fields allowed values */
	        $req.prop.setFieldOptions(fieldElement,fieldName,fafrKey,type);
	        /* For Date Field update */
	        if(type==='datetime') {
	        	var dateField = jQuery('#'+fieldName+'_IN');
	            dateField.on("change",function(e) {
	                dateField.val(e.currentTarget.defaultValue)
	            });
	            if(inlineEdit) {
	            	$req.prop.inlineCalendar(fieldName);
	            }
	        } else if((type === "string" || type === "double" || type === "long") && inlineEdit) {	//No I18N
	            //To Place the focus on selected items of Radio button.
	 	        fieldElement.siblings('.spot-form').find('input[type="radio"]').each(function() {
                if (jQuery(this).is(':checked')) {
                    jQuery(this).focus();
                }
                });
	        }
	        if(type === "double") {
	        	var dec_points = $req.details.meta_info.fields['udf_fields'].fields[fieldName].constraints.decimal;
 	        	jQuery("#propertyDetailForm [name='"+fieldName+"']").on("keyup", function() {
 	        		var decimal = jQuery(this).val();
 	        		var _index = decimal.indexOf(".");
 	        		if(_index > -1) {
 	        			decimal = decimal.substr(decimal.indexOf(".")+1, decimal.length-1);
 	        			if(jQuery.isNumeric(decimal) && decimal.length > dec_points) {
 	        				jQuery(this).addClass("pos-rel").siblings(".decimal-rule-info").removeClass("hide");	//No I18N
 	        			} else {
 	        				jQuery(this).removeClass("pos-rel").siblings(".decimal-rule-info").addClass("hide");	//No I18N
 	        			}
 	        		} else {
 	        			jQuery(this).removeClass("pos-rel").siblings(".decimal-rule-info").addClass("hide");	//No I18N
 	        		}
 	        	}).on("blur", function() {
 	        		jQuery(this).removeClass("pos-rel").siblings(".decimal-rule-info").addClass("hide");	//No I18N
 	        	});
 	        }
	        /* on change close select fields */
	        if((fieldName !== 'status') && type==='lookup' && !$req.prop.checkBulkEdit && !$req.prop.checkRightPanel &&(this.dependentField.indexOf(fieldName) === -1)) {
	            jQuery('#propertyDetailForm [name="'+fieldName+'"]').off('change').on('change', function(e) {	//No I18N
	        	    if($req.details.operational_data.priority_matrix && (fieldName === 'impact' || fieldName === 'urgency')) {
	        		    $req.prop.setPriorityValue();
	        	    }
	        	    /* after appling the fafr on Change it will save the form */
	        	    if($req.prop.checkRLC == false) {
		                $req.prop.inlineSave(fieldName, true);
		            }
	            });
	        }
	        /* update priority according to priority matrix */
	        if($req.prop.checkBulkEdit && (fieldName === 'impact' || fieldName === 'urgency')) {
	        	if($req.details.operational_data.priority_matrix) {
	        		jQuery('#propertyDetailForm [name="impact"]').off("change").on("change",function(e) {	//No I18N
		                $req.prop.setPriorityValue();
		        	});
		        	jQuery('#propertyDetailForm [name="urgency"]').off("change").on("change",function(e) {	//No i18N
		                $req.prop.setPriorityValue();
		        	});
	        	}
	        }
	        if(fieldName === 'status') {
	        	var selectStatus =  jQuery('#propertyDetailForm [name="status"]');
	            selectStatus.on("select2-selecting", function(event, parentEvent) {
	            	if(!event.val) {
	            		event.val = parentEvent.val;
	            	}
	            	/** When the editor editing is not completed, alert is shown if other Technician tries to change the status */
	            	if($req.details.request_info.is_editing_completed === false && $req.details.request_info.editor && $req.details.request_info.editor.id != sdp_user.LOGGEDIN_USERID && $req.details.request_info.status.id !== event.val) {
	            		if(!window.confirm(getMessageForKey("sdp.request.status.update.removeintermediate"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}
	            	}
	            	var currentStatusId = $req.details.request_info.status.id;
	            	if($req.details.request_info.cancel_requested && ($req.details.operational_data.close_status_id
!= currentStatusId && $req.details.operational_data.resolved_status_id
!= currentStatusId && $req.details.operational_data.closed_resolved_status.indexOf(currentStatusId) == -1) && ($req.details.operational_data.close_status_id
== event.val || $req.details.operational_data.resolved_status_id
== event.val || $req.details.operational_data.closed_resolved_status.indexOf(event.val) != -1)) {
	            		if(!window.confirm(getMessageForKey("request.cancel.requested.status.change.warning"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}
	            	}
	            }).on('change',function(event) {
					//SD-99595
					if(!event.originalEvent  || (event.originalEvent && event.originalEvent.firedBy !== 'user_api')){ //NO I18N
						setTimeout(function(){
							$req.prop.wizard.statusChange(jQuery(event.currentTarget).select2("val"), null ,event)//No i18n
						},10);
					}
					else{
                    	if($notification_popup.isOpen && $req.prop.replyTemplateStatus){
                    		 $req.prop.resetStatusFields(); //Resetting reply template if status changed by  fafr.
                    	}
                    }
				});
		}
		// List view priority inline edit action handled
		if(fieldName === 'priority' && !window.req_details) { // NO I18N
			var selectStatus =  jQuery('#propertyDetailForm [name="priority"]');
			selectStatus.on('change',function(event) {
				if( !event.originalEvent || (event && event.originalEvent && event.originalEvent.firedBy !== "user_api")){ // NO I18N
					setTimeout(function(){
						if(!$req.prop.wizard.isEnabled){
							$req.prop.inlineSave("priority")//No i18n
						}
				},10);
				}
			});
		}
     if(fieldName === "technician"){ // NO I18N
			jQuery('#propertyDetailForm [name="technician"]').on("change", function() {
				$req.prop.toggleAssignComments();
			});
		}

    if(fieldName === "site"){ // NO I18N
    		jQuery('#propertyDetailForm [name="site"]').on("change", function() {
    				$req.prop.toggleAssignComments();
    			});
    	}
    if(fieldName === "group"){ // NO I18N
    		jQuery('#propertyDetailForm [name="group"]').on("change", function() {
    				$req.prop.toggleAssignComments();
    			});
    	}
	    }
	},

	reFormatMultiSelect : function (selectedValue) {
        return selectedValue.map(item => ((item.site && item.site.name)?(item.name+', '+item.site.name):item.name));
    },

	/* this function set the options in Fields */
	setFieldOptions:function (fieldElement,fieldName,fafrKey,type){
	    /* get the Allowed Values */
	    if(!Object.keys($req.details.allowedValues).length){
	    	$req.details.getAllowedValues();
	    }
	    var data=[], allowedData = {};
	    var selectedVal = fieldElement.text();
	    /* show mandatory (*) for mandatory fields*/
	    var is_mandatory = fieldElement.parents('.fafr-row').find('.mandatory').length > 0 ;	//No I18N
	    if(is_mandatory) {
	    	fieldElement.parents('.fafr-row').find('.mandatory').removeClass('hide');	//No I18N
	    }
	    /* remove the icons of site,status and technician */
	    if(fieldName === 'site') {
		       jQuery('#siteIcon').addClass('hide');
	    } else if(fieldName === 'status' ) { //NO I18N
	        jQuery('#onHoldIcon').addClass('hide');
	        // selectedVal = fieldElement.attr('data-value');
	    } else if(fieldName === 'technician') { //NO I18N
		    jQuery('#technicianIcon').addClass('hide');
	    } else if(isMSPOrSCP && (fieldName === 'account' || fieldName === 'subaccount')) {	//No I18N
	    	if(fieldName === 'account') {	//No I18N
			    jQuery('#accountIcon,#inactive-account-icon').addClass('hide');
			} else if(isSCP && fieldName === 'subaccount') {	//No I18N
			    jQuery('#inactive-subaccount-icon').addClass('hide');
			}
	    }
	    var metainfo = this.getFieldMetaInfo(fieldName);
	    var isReferUDF = false;
        if(fieldName.indexOf("udf_") > -1){
            isReferUDF=$req.details.meta_info.fields.udf_fields.fields[fieldName].lookup_entity != "request_option";
        }
        if($req.details.meta_info.fields.udf_fields.fields[fieldName]&&$req.details.meta_info.fields.udf_fields.fields[fieldName].lookup_entity&&$req.details.meta_info.fields.udf_fields.fields[fieldName].lookup_entity != "request_option"){
            $req.details.refer_fields.push(fieldName);
        }
	    switch(type) {
	  	   case 'multi_select': //NO I18N
	            jQuery('#propertyDetailForm [name="'+fieldName+'"]').remove();
	            if(metainfo && metainfo.display_type === "CheckBox") {
					var display_options = fieldElement.data("display");	//No I18N
					var selected_val_exist = false;
					var sort_order=null;

					if(isReferUDF && !$req.details.allowedValues[fafrKey]){
                        $req.common.getReferUDFAllowedValues(allowedData,fieldName);
                        sort_order=Object.keys(allowedData);
                        $req.details.allowedValues[fafrKey]={};
                        $req.details.allowedValues[fafrKey]['AllowedValues']=allowedData;
                        $req.details.allowedValues[fafrKey]['sorted_order']=sort_order;
                    }
					else{
						allowedData = $req.details.allowedValues[fafrKey].AllowedValues;
						sort_order = $req.details.allowedValues[fafrKey].sorted_order;
					}
					var selectedValInfo=$req.details.request_info.udf_fields[fieldName];
					var multiselect_val = selectedVal = $req.prop.reFormatMultiSelect(selectedValInfo);
					var mselect_avail_val = selectedVal.slice();	//Making a copy of the selected value array
		            jQuery('#'+fieldName+"_control").html("<div class='input-group'></div>");
		            var chbk_content = "";
					if(!sort_order.length ){
						sort_order = allowedData;
					}
					jQuery.each(sort_order, function(index, option) {
						chbk_content += "<label class='cus-input xs mr20 mt5 mb5'><input name='" + fieldName + "'type='checkbox' data-field='" + fafrKey + "' data-label='" + e_attr(allowedData[option]) + "' value='" + e_attr(option) + "'"; //NO I18N
						if (selectedVal && selectedVal.indexOf(allowedData[option]) > -1) {
							chbk_content += "checked"; //NO I18N
							mselect_avail_val.splice(mselect_avail_val.indexOf(allowedData[option]), 1);
						}
						chbk_content += "><em class='top0'></em>" + e_html(allowedData[option]) + "</label>"; //NO I18N
						if (display_options === "Vertical") {
							chbk_content += "<br>";
						}
					});
		            if(selectedVal !== undefined){
		        	    multiselect_val = selectedVal.join(";");
		        	}
		            chbk_content += "<input type='hidden' value='"+e_attr(multiselect_val)+"' id='select_"+fieldName+"_val'>";	//NO I18N
		            if(mselect_avail_val && mselect_avail_val.length > 0) {
		                var nonAvailName=mselect_avail_val[i];
                        var nonAvailId;
                        selectedValInfo.forEach((item) => {
                            if(item.name==nonAvailName){nonAvailId=item.id;}
                        });
		            	for(var i=0; i<mselect_avail_val.length; i++) {
		            		chbk_content += "<input name='"+fieldName+"'type='checkbox' class='non-avail-val hide' data-field='"+fafrKey+"' value='"+nonAvailId+"' checked>"
		            	}
		            }
		            jQuery('#'+fieldName+'_control > div').append(chbk_content).find("input").on("change", function() {	//No I18N
		            	jQuery('#'+fieldName+'_control > div').find('input.non-avail-val').prop("checked", false); //No I18N
		            });
	            } else {
	            	if(fieldName === 'assets'){

		                jQuery('#'+fieldName+"_control").html('<div class="input-group fw pb5"><input type="text" name="assets" id="selectedCIs" class="form-control spotmultiasset fw" data-field="REQUESTER.ASSETS"></div>'); //No I18N
		                if(jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0) {
							let $assetlist = jQuery('<span class="disp-c vtop bulk-select"> <a href="/" rel="uitip" title='+getMessageForKey("sdp.requests.assets.icon.addmore")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr asset1 icon-sm"></span></a></span>')
							$assetlist.find('a').off('click').on('click',function(event){
								$req.prop.openAssetModuleList();
							})
							let $assetToggle = jQuery('<span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>')
							$assetToggle.find('a').off('click').on('click',function(event){
								multiasset.toggleSelect2(event.currentTarget);
							})
						    let assetControl=jQuery('#'+fieldName+"_control")
							!window.externalframe && assetControl.after($assetlist) && $assetlist.after($assetToggle);
							window.externalframe && assetControl.after($assetToggle);
							assetControl.parent().attr('data-id','cus-sel').addClass('cus-sel2');

		                }
		                var displayName = translate("sdp.helpdesk.common.cis"); //No I18N

		                var assetUrl = "/api/v3/requests/assets";	// variable introduced for modiying URL in MSP/SCP	//No I18N
                        if(isMSP && window.current_req_mode == "kanban"){
                            assetUrl += '?ACCOUNTID='+$req.details.account_info.id; //NO I18N
                        }
		                jQuery('#propertyDetailForm [name="'+fieldName+'"]').sdp_select2({ //No I18N
		                	placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
	                    	allowClear: true,
	                    	closeOnSelect: false,
							multiple: true,
							url:[{"url":assetUrl,"field":"assets"}], //No I18N
	                    	maximumSelectionSize: maxCICount ? maxCICount : 5,
	                    	sortResults: function(results, container, query) {
				                return sortResultsFn(results, container, query);
				            }
	                	});
	                	jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", $req.prop.setSelectedAssets());	//No I18N

						//old code
		                /*var requesterId = $req.details.request_info.requester.id;
		                jQuery('#'+fieldName+"_control").html('<div class="input-group fw pb5"><input type="text" name="assets" id="selectedCIs" class="form-control spotmultiasset fw" data-field="REQUESTER.ASSETS"></div>'); //No I18N
		                if(jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0) {
		                	jQuery('#'+fieldName+"_control").after('<span class="disp-c vtop bulk-select"><a href="/" ofclick="showCIsForAssociation(\'inline\','+requesterId+'); event.preventDefault();" rel="uitip" title='+getMessageForKey("sdp.requests.assets.icon.addmore")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr asset1 icon-sm"></span></a></span><!--showmore--><span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1" ofclick="multiasset.toggleSelect2(this);"><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>').parent().attr('data-id','cus-sel').addClass('cus-sel2');	//No I18N
		                }
		                /** Issue fix : SD-90537 */
						/*window.chosenCIs = $req.prop.setSelectedAssets();
		                //this method implementation in multiassets (change Later)
		                updateSelectedCIDropdown(jQuery("#selectedCIs"), requesterId, chosenCIs, maxCICount);*/
		            }
					else if(fieldName === 'configuration_items'){
		                let maxConfItemsCount = $req.details.self_service_portal_settings.max_number_of_conf_items_per_request ? $req.details.self_service_portal_settings.max_number_of_conf_items_per_request : 25;
                        jQuery('#'+fieldName+"_control").html('<div class="input-group fw pb5"><input type="text" name="configuration_items" id="select_'+fieldName+'" class="form-control spotmultiasset fw" data-field="'+fafrKey+'"></div>'); //No I18N
		                if(jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0) {
		                    let $cilist = jQuery('<span class="disp-c vtop bulk-select"> <a href="/" rel="uitip" title='+getMessageForKey("sdp.udf.multiselect.bulk")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="aspr template-sm icon-sm"></span></a></span>')
                            $cilist.find('a').off('click').on('click',function(event){              //No I18N
                            	$req.common.openCIPopup(maxConfItemsCount);
                            })
                            let $ciToggle = jQuery('<span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>')
                            $ciToggle.find('a').off('click').on('click',function(event){            //No I18N
                            	multiasset.toggleSelect2(event.currentTarget);
                            })
                            let ciControl=jQuery('#'+fieldName+"_control")
                            !window.externalframe && ciControl.after($cilist) && $cilist.after($ciToggle);
                            window.externalframe && ciControl.after($ciToggle);
                            ciControl.parent().attr('data-id','cus-sel').addClass('cus-sel2');
		                }
		                let displayName = translate("ae.cmdb.search.cis"); //No I18N
		                jQuery('#propertyDetailForm [name="'+fieldName+'"]').sdp_select2({ //No I18N
		                	placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
	                    	allowClear: true,
	                    	closeOnSelect: false,
							multiple: true,
							url:[{"url":"/api/v3/requests/configuration_items","field":"configuration_items"}], //No I18N
	                    	maximumSelectionSize: maxConfItemsCount,
	                    	sortResults: function(results, container, query) {
				                return sortResultsFn(results, container, query);
				            }
	                	});
	                	jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", $req.prop.setSelectedConfItems());	//No I18N
		            }
		            else if(fieldName == "email_ids_to_notify") {
		           		var selectedVal = $req.details.request_info[fieldName];
		            	var multiselect_val = selectedVal.slice();
		            	jQuery('#'+fieldName+'_control').html('<div class="input-group fw pb5">'+'<input id="select_'+fieldName+'" name="'+fieldName+'" multiple data-field="'+fafrKey+'" class="form-control spotmultiasset fw" data-field-name="'+fieldName+'"/>'+'</div>'); //No I18N;
		                if(jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0){	//No I18N
							let userSearch = jQuery('<span class="disp-c vtop bulk-select"><a href="/"  rel="uitip" title='+getMessageForKey("sdp.udf.multiselect.bulk")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="aspr template-sm icon-sm"></span></a></span>');
							userSearch.find('a').off('click').on('click',(event)=>{
                               showUserSearchPopup('WorkOrder_EMailCC', true, '', 'requests', 'null', 'requester');
							})
							let toggleField= jQuery('<span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>');
							toggleField.find('a').off('click').on('click',function(event){
                                          multiasset.toggleSelect2(this);
							});
		                	jQuery('#'+fieldName+"_control").after(userSearch).parent().attr('data-id','cus-sel').addClass('cus-sel2');  userSearch.after(toggleField);	//No I18N
		                }
	                	var options =  $req.prop.getFieldOptionsString(allowedData, selectedVal);
	                	this.setMailNotifyField(options, fieldName);
		 	        }
		            else if(fieldName == "space") {
						jQuery('#'+fieldName+"_control").html('<div class="input-group fw pb5"><input type="text" name="'+fieldName+'" id="select_'+fieldName+'" class="form-control spotmultiasset fw" multiple data-field="'+fafrKey+'" data-field-name="'+fieldName+'"></div>'); //No I18N
		                if(jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0) {
							let spacePopup =jQuery('<span class="disp-c vtop bulk-select"><a href="/"  rel="uitip" title='+getMessageForKey("sdp.udf.multiselect.bulk")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="aspr template-sm icon-sm"></span></a></span>');
							spacePopup.find('a').off('click').on('click',(event)=>{
								$req.prop.openSpacePopup();
							})
							let toggleSpace = jQuery('<!--showmore--><span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1"><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>');
							toggleSpace.find('a').off('click').on('click',(event)=>{
								multiasset.toggleSelect2(event.currentTarget);
							})
		                 	jQuery('#'+fieldName+"_control").after(spacePopup).parent().attr('data-id','cus-sel').addClass('cus-sel2');	spacePopup.after(toggleSpace);//No I18N
						}
		                var displayName = translate("sdp.header.space"); //No I18N
		                jQuery('#propertyDetailForm [name="'+fieldName+'"]').sdp_select2({ //No I18N
		                	placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
	                    	allowClear: true,
	                    	closeOnSelect: false,
							multiple: true,
							maximumSelectionSize: maxSpaceCount ? maxSpaceCount : 25,
							url:[{"url":"/api/v3/requests/space","field":"space"}], //No I18N
	                    	sortResults: function(results, container, query) {
				                return sortResultsFn(results, container, query);
				            }
	                	});

						var val_obj = $req.details.request_info;
						if(val_obj && val_obj[fieldName] && jQuery.isArray(val_obj[fieldName]))
						{
							var default_val = [];
							for(var i=0; i<val_obj[fieldName].length; i++) {
								default_val.push({
									id: val_obj[fieldName][i].id,
									text: val_obj[fieldName][i].name
								});
							}
							jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", default_val);	//No I18N
						}
		 	        }
		            else {
		            	var out=[];
			        	var multiArray=$req.details.request_info.udf_fields[fieldName];
			        	multiArray.forEach(function(multiVal){out.push(multiVal.name)});
		            	var selectedVal = out;
		            	var multiselect_val = selectedVal.slice();
		            	if($req.details.allowedValues[fafrKey]){
		            	    allowedData=$req.details.allowedValues[fafrKey].AllowedValues;
		            	}
		                else{$req.details.allowedValues[fafrKey]={};}
                  var sorted_order = $req.details.allowedValues[fafrKey].sorted_order;
		            	var allowedDataArray = Object.keys(allowedData);
		            	if($req.sdp_user.USERTYPE === 'Requester'){
		            		jQuery('[data-name='+fieldName+']').parent().append('<div id="'+fieldName+'_control" class="hide"></div>')
		            	}
		            	var dynamic_loading_tag = '<select id="select_'+fieldName+'" name="'+fieldName+'" multiple=true data-field="'+fafrKey+'" class="form-control spotmultiasset fw"></select>';
		            	if((fieldName.indexOf("udf_") > -1) && (allowedDataArray.length > 501 || isReferUDF)){
		            		dynamic_loading_tag ='<input  id="select_'+fieldName+'" name="'+fieldName+'" multiple data-field="'+fafrKey+'" class="form-control spotmultiasset fw" data-dynamic-options="true" data-field-name="'+fieldName+'"/>';
		            	}
		            	if(selectedVal !== undefined){
			        	    multiselect_val = selectedVal.join(";");
			        	}
		            	jQuery('#'+fieldName+'_control').html('<div class="input-group fw pb5">'+dynamic_loading_tag+'</div><input type="hidden" value="'+e_attr(multiselect_val)+'" id="select_'+fieldName+'_val">'); //No I18N;

                        //SD-123188
		                if((jQuery('#'+fieldName+"_control").parent().find(".bulk-select").length === 0)&&(jQuery('#'+fieldName+"_control").parent().find(".circle-arrow-down").length === 0)){
		                	let ele= jQuery('#'+fieldName+"_control");
							let toggleEle= jQuery('<!--showmore--><span class="disp-c vtop show-more"><a href="/" title="' + getMessageForKey('sdp.helpdesk.common.select2.showmore') + '" class="btn btn-xs btn-link p3 pt2 mt1" ><span class="cspr icon-sm cur-ptr circle-arrow-down"></span></a></span>');
							toggleEle.find('a').off('click').on('click',(event)=>{
								multiasset.toggleSelect2(event.currentTarget);
							});
		                	if(allowedDataArray.length <= 2500 && !isReferUDF){
		                		let bulkSelectDialog_btn = jQuery('<span class="disp-c vtop bulk-select"><a href="/"  rel="uitip" title='+getMessageForKey("sdp.udf.multiselect.bulk")+' class="btn btn-xs btn-link p3 pt2 mt1"><span class="aspr template-sm icon-sm"></span></a></span>');
								bulkSelectDialog_btn.off('click').on('click',function(event){
                                      showURLInDialog('/workorder/multiselect.jsp?name=select_'+fieldName+'','modal=yes, closeButton=no,closeOnEscKey=no,position=absmiddle');
								});
								ele.after(bulkSelectDialog_btn);
								bulkSelectDialog_btn.after(toggleEle);
		                	}
							else{
								ele.after(toggleEle);
							}
		                	ele.parent().attr('data-id','cus-sel').addClass('cus-sel2');	//No I18N
		                }
		                if((fieldName.indexOf("udf_") > -1) && (allowedDataArray.length > 501)){
	                		var fieldSelector = "#select_"+fieldName; //No I18N
	                		var $fieldObject = jQuery(fieldSelector);
	                		var dynamicFieldName = $fieldObject.attr("data-field-name");
	                		//the really long chain below is to get the field's display name... This chaining is required to get the display name, without the mandatory *
	                        var displayName = $fieldObject.parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
	                        var placeholder = getMessageForKey('sdp.leftpanel.search.title')+" "+displayName; //No I18N
	                        var maxSelectionCount = 25;
	                        var maxLimit = [maxSelectionCount];
							var multiArray=$req.details.request_info.udf_fields[fieldName];
							var updatedArray = multiArray.map(obj => {
                                var temp=obj;
                                temp.text=temp.name;
                                return temp;
                            });

	                        var dynamicLoadingObj = {
	                            fieldName: dynamicFieldName,
	                            selectedValues: updatedArray,
	                            multiple: true,
	                            placeholder: placeholder,
	                            maximumSelectionSize: maxSelectionCount,
	                            formatSelectionTooBig: function (limit) {return getMessageForKey('sdp.admin.multiselect.max.option.exceed',maxLimit)} //No I18N
	                        }
	                		if(!$req.prop.wizard.isEnabled || Object.keys($se.rules).length == 0){
	                			//prevent the dynamicOptions array from being reinitialized
								var result = Object.entries(allowedData).map(([key, value]) => ({
									id: key,
									text: value
								}));
	                			dynamicLoadingObj.allowedValues = result;
	                		}

	                        dynamicLoading.init($fieldObject, dynamicLoadingObj);
	                	}
	                	else if((fieldName.indexOf("udf_") > -1) && isReferUDF){
                            var option={};
                            $req.common.initializeReferFieldSelect2(option,fieldName,true,multiArray);
                        }
	                	else{
                            var maxSelCount=($req.details.meta_info.fields.udf_fields.fields[fieldName].constraints)?($req.details.meta_info.fields.udf_fields.fields[fieldName].constraints.max_values):'25';
							var sorted_order = $req.details.allowedValues[fafrKey].sorted_order;
		                	var options =  $req.prop.getFieldOptionsString(allowedData, selectedVal, undefined, sorted_order, fafrKey);
		                	var optionString = options.options;
		                	//the really long chain below is to get the field's display name... This chaining is required to get the display name, without the mandatory *
			                var displayName = jQuery("#select_"+fieldName).parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
			                jQuery('#propertyDetailForm [name="'+fieldName+'"]').append(optionString).select2({ //No I18N
			                	placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
		                    	allowClear: true,
		                    	closeOnSelect: false,
		                    	formatNoMatches: translate("common.no.match.found"), //No I18N
		                    	maximumSelectionSize: maxSelCount,
		                    	sortResults: function(results, container, query) {
					                return sortResultsFn(results, container, query);
					            }
		                	});
			                if(!options.val_exist) {
			                	var val_obj = fieldName.indexOf("udf_") > -1 ? $req.details.request_info.udf_fields : fieldName.indexOf("closure_") > -1 ? $req.details.request_info.closure_info : $req.details.request_info;
				            	if(val_obj && val_obj[fieldName] && jQuery.isArray(val_obj[fieldName])) {
				            		var default_val = [];
				            		for(var i=0; i<val_obj[fieldName].length; i++) {
				            			default_val.push({
				            				id: val_obj[fieldName][i].id,
				            				text: val_obj[fieldName][i].name
				            			});
				            		}
				            		jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", default_val);	//No I18N
				            	}
			                }
			            }
		            }
		            jQuery("#"+fieldName+"_actions").find(".btn").addClass("pl0 pr0").find(".spot-icon").removeClass("mr5");
	            }
	            break;

	        case "lookup" : //NO I18N
	  	       //remove the old input type
	            var selected_val_exist = false;
	            var optionString;
	            jQuery('#propertyDetailForm [name="'+fieldName+'"]').remove();
	            var allowedDataArray = [];
		          var sorted_order;
	            if($req.details.allowedValues[fafrKey]){
		              allowedData = $req.details.allowedValues[fafrKey].AllowedValues;
			            sorted_order = $req.details.allowedValues[fafrKey].sorted_order;
		              allowedDataArray = Object.keys(allowedData);
		            }
	            if(fieldName !== 'site'){
	            	if((fieldName.indexOf("udf_") > -1) && ((allowedDataArray.length > 501)||isReferUDF)){
	            		jQuery('#'+fieldName+"_control").html('<input name="'+fieldName+'" class="form-control" data-field="'+fafrKey+'" data-dynamic-options="true" data-field-name="'+fieldName+'"></input>');
	            	}else{
	            	jQuery('#'+fieldName+"_control").html('<select name="'+fieldName+'" class="form-control" data-field="'+fafrKey+'"></select>');
	            }
	            }
	            if(fieldName === 'closure_code') {
	            	if($req.details.operational_data.request_closure_code == undefined) {
	            		$req.details.getClosureCode(woID);
	            	}
	                allowedData = $req.details.operational_data.request_closure_code;
	                optionString ='<option value=0>'+getMessageForKey('sdp.common.notassigned')+'</option>';
	                /* allowed value structure is diffent so we are not using getFieldOptionsString function */
	                for(var i=0,ilen=allowedData.length;i<ilen;i++) {
	                    if(selectedVal === allowedData[i].name) {
	                        optionString +='<option selected=selected value='+allowedData[i].id+'>'+e_html(allowedData[i].name)+'</option>';
	                        selected_val_exist = true;
	                    } else {
	                    	optionString +='<option value='+allowedData[i].id+'>'+e_html(allowedData[i].name)+'</option>';
	                    }
	                }
	            } else {
	            	if(fieldName === "status") {
	            		allowedData = {};
	            		if($req.details.rlc.isEnabled||!$req.prop.status.length){
	            			$req.details.getStatusJson(woID);
	            		}
						for(var i=0; i<$req.prop.status.length; i++) {
							allowedData[$req.prop.status[i].id] = $req.prop.status[i].name;
						}
	            	} else if(fieldName === 'site') { //No I18N
	            		jQuery('#'+fieldName+"_control").html('<input id="inline_site_id" name="'+fieldName+'" class="form-control" data-field="'+fafrKey+'"></input>');
						//SD-105342
	                    var siteJson = {};
	                    if($req.details.request_info.site){
	                    	siteJson = {"id":$req.details.request_info.site.id,"text":$req.details.request_info.site.name}; //No I18N
	                    }else{
	                        siteJson = {"id":"0","text":getMessageForKey("sdp.admin.technician.addtechnician.nosite")};	 //No I18N
	                    }
						$req.common.initializeSiteSelect2({
							selector:'#inline_site_id', //No I18N
							url: '/api/v3/requests/'+$req.details.request_info.id+'/site', //No I18N
							selectedData:siteJson,
							modifyResults:true
						});
	                    //jQuery('#inline_site_id').select2('data',siteJson);	//No I18N
	                } else if(fieldName === 'category') {	//No I18N
	                	allowedData[0] = getMessageForKey('sdp.common.notassigned');
	                }
	                if(fieldName !== 'site' && fieldName !== 'subcategory' && fieldName !== 'item') {	//No I18N
	                	if((fieldName.indexOf("udf_") > -1) && (allowedDataArray.length > 501)){
	                		var $fieldObject = jQuery('[data-field='+fafrKey+']');
	                        var selectedValue = $req.details.request_info.udf_fields[fieldName];
                            if(selectedValue && selectedValue.name){
                                selectedValue.text=selectedValue.name;
                            }
	                        //the really long chain below is to get the field's display name... This chaining is required to get the display name, without the mandatory *
	                        var displayName = $fieldObject.parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
	                        var emptyValText = getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified"); //No I18N

	                        var dynamicLoadingObj = {
	                            fieldName: fieldName,
	                            selectedValues: selectedValue,
	                            emptyValText: emptyValText,
	                            defaultValue: "0"
	                        }
	                		if(!$req.prop.wizard.isEnabled || Object.keys($se.rules).length == 0){
	                			//prevent the dynamicOptions array from being reinitialized
								var result = Object.entries(allowedData).map(([key, value]) => ({
									id: key,
									text: value
								}));
	                			dynamicLoadingObj.allowedValues = result;
	                		}

	                        dynamicLoading.init($fieldObject, dynamicLoadingObj);
	                		break;
	                	}
	                	else if((fieldName.indexOf("udf_") > -1) && isReferUDF){
                            var option={};
                            $req.common.initializeReferFieldSelect2(option,fieldName,false);
                        }
                        else{
				                  var options =  $req.prop.getFieldOptionsString(allowedData, selectedVal, "name", sorted_order, fafrKey);	//No I18N
				                  optionString = options.options;
		                      selected_val_exist = options.val_exist;
	                	}
	            }
	            }
	            /* get field allowed value options string */
	            if(fieldName !== 'site' && ((!isMSPOrSCP) || fieldName !== 'account')) {
                    if(!((fieldName.indexOf("udf_") > -1) && isReferUDF)){
                        jQuery('#propertyDetailForm [name="'+fieldName+'"]').append(optionString).select2({
                            allowClear: true,
	                    formatNoMatches: translate("common.no.match.found"), //No I18N
                            sortResults: function(results, container, query) {
                                return sortResultsFn(results, container, query);
                            }
                        });
                    }
                }
	            if(!selected_val_exist) {
	            	$req.prop.setOriginalValue(fieldName);
	            }
	            break;

	        case 'datetime': //NO I18N
	            var value = parseInt(jQuery('[data-name='+fieldName+']').attr('data-value'));
	            if(!value){
	            	value = "";
	            }
	            var fieldHiddenID = fieldName+'_IN'; //NO I18N
	            var fieldID = fieldName+'_IN_Display'; //NO I18N
	            jQuery('#propertyDetailForm [name="'+fieldName+'"]').remove();
	            jQuery('#'+fieldName+'_control').removeClass('control-holder').addClass('spot-action').html('<input type="hidden" name="'+fieldName+'" data-field="'+fafrKey+'" id="'+fieldHiddenID+'" value="'+value+'" class="form-control"><div class="input-group date">	<input type="text" readonly="" class="form-control dateFieldForceLTR"  id='+fieldID+' value="'+value+'"><span class="input-group-addon"><span class="cspr calendar"></span></span></div>');
				jQuery('#'+fieldName+'_control').off('click').on('click',(event)=>{
					$req.prop.inlineCalendar(fieldName);
				})
	            //set the field text value
	            if($req.details.request_info[fieldName] !== undefined && $req.details.request_info[fieldName] !== null){
	        	    jQuery('#'+fieldID).val($req.details.request_info[fieldName].display_value === "-" ? "" : $req.details.request_info[fieldName].display_value);
	            }else if(fieldName.indexOf('udf_') !== -1){
	            	jQuery('#'+fieldID).attr('data-clear', 'yes');
	        	    if($req.details.request_info.udf_fields[fieldName] !== null){
	        		    jQuery('#'+fieldID).val($req.details.request_info.udf_fields[fieldName].display_value);
	        	    }
	            }
	            if(fieldName==="due_by_time" || fieldName==="first_response_due_by_time" || fieldName==="scheduled_start_time" || fieldName==="scheduled_end_time") {
	            	if(!$req.details.request_info.sla) {
	            		jQuery('#'+fieldID).attr('data-clear', 'yes');
	            	}
	           	}
	            break;

	        case 'multi_line': //NO I18N
	 	        jQuery('#propertyDetailForm [name="'+fieldName+'"]').remove();
	 	        var value = fieldElement.html();
	 	        if(value === '-' || value === ""){
	 	    	    value = "";
	 	        }else if( fieldName === "closure_comments"){ //NO I18N
	                value = $req.details.request_info.closure_info.closure_comments;
	 	        }else if(fieldName.indexOf('udf_') !== -1){
	 	        	value = $req.details.request_info.udf_fields[fieldName];
	 	        }else{
                    value = $req.details.request_info[fieldName];
                }

                var autocomplete =  this.getAutocompleteState(fieldName);
                jQuery('#'+fieldName+'_control').html('<textarea '+autocomplete+' name="'+fieldName+'" class="form-control" data-field="'+fafrKey+'" rows="4">'+e_html(value)+'</textarea>');
                //SD-102891 upon using e_html() the escape characters are getting removed by default. so that even by passing "\\n" the encoder converts it to a line break
				//To overcome this , after creating the textarea textvalue is again assigned to the field without using e_html.
				jQuery("#"+fieldName+"_control textarea").text(value);
				break;

	        case 'string':  //NO I18N /* Radio button type is coming as type 'string' */
	        	if(metainfo) {
	        		if(metainfo.display_type === "Radio") {
	        			var display_options = fieldElement.data("display");	//No I18N
	        			var val_exist = false;
		        		jQuery('#propertyDetailForm [name="'+fieldName+'"]').remove();
		        		var fieldTempObj=$req.details.request_info.udf_fields[fieldName];
                        if(fieldTempObj != null){
                            selectedVal = (fieldTempObj.site && fieldTempObj.site.name)?(fieldTempObj.name+', '+fieldTempObj.site.name):fieldTempObj.name;
                        }
						jQuery('#'+fieldName+"_control").html("<div class='input-group'></div>");
						var rd_content = "";
						var sorted_order=null;

						if(isReferUDF && !$req.details.allowedValues[fafrKey]){
							$req.common.getReferUDFAllowedValues(allowedData,fieldName);
                            sorted_order=Object.keys(allowedData);
                            $req.details.allowedValues[fafrKey]={};
                            $req.details.allowedValues[fafrKey]['AllowedValues']=allowedData;
                            $req.details.allowedValues[fafrKey]['sorted_order']=sorted_order;
						}
						else{
							allowedData=$req.details.allowedValues[fafrKey].AllowedValues;
						 	sorted_order = $req.details.allowedValues[fafrKey].sorted_order;
						}

						if(!sorted_order.length){
							sorted_order = allowedData;
						}

						jQuery.each(sorted_order, function(index, option) {
                            rd_content += "<label class='cus-input xs mr20 mt5 mb5'><input name='"+fieldName+"'type='radio' data-field='"+fafrKey+"' data-label='"+e_attr(allowedData[option])+"' value='"+e_attr(option)+"'";	//NO I18N
                            if(selectedVal && selectedVal === allowedData[option]) {
								val_exist = true;
								rd_content += "checked";	//NO I18N
							}
							rd_content += "><em class='top0'></em>"+e_html(allowedData[option])+"</label>";	//NO I18N
							if(display_options === "Vertical") {
								rd_content += "<br>"
							}
						});

			            if(selectedVal && (selectedVal != translate('sdp.common.notassigned')) && !val_exist) {
			            	rd_content += "<input name='"+fieldName+"'type='radio' class='hide' data-field='"+fafrKey+"' value='"+e_attr(fieldElement[0].dataset.value)+"' checked>";
			            }
			            jQuery('#'+fieldName+"_control > div").append(rd_content);
			            break;
			        } else if(metainfo.display_type === "Multi Line") {	//No I18N
			        	var value = fieldElement.text();
						var autocomplete = this.getAutocompleteState(fieldName);
						jQuery('#'+fieldName+'_control').html('<textarea '+autocomplete+' name="'+fieldName+'" class="form-control" data-field="'+fafrKey+'" rows="4"></textarea>');//TODO
			 	        var selectedField = jQuery('#propertyDetailForm [name="'+fieldName+'"]');
			 	        if(value !== '-'){
			 	    	    selectedField.val(value);
			 	        }else{
			 	        	selectedField.val('');
			 	        }
			 	    	break;
			        }
	        	}

            default:
                var value = fieldElement.text();
                var autocomplete = this.getAutocompleteState(fieldName);
                jQuery('#'+fieldName+'_control').html('<input name="'+fieldName+'" class="form-control" '+autocomplete+' data-field="'+fafrKey+'" />');//TODO
	 	         var selectedField = jQuery('#propertyDetailForm [name="'+fieldName+'"]');
	 	        if(value !== '-'){
	 	    	    selectedField.val(value);
	 	        }else{
	 	        	selectedField.val('');
	 	        }

	 	        if(type === "double") {
                    jQuery('#'+fieldName+'_control').append("<span class='decimal-rule-info alert alert-info p3 pl10 pr10 font-xsmall pos-abs right0 hide z-ind1'>" + getMessageForKey("sdp.admin.common.decimalValidation.msg",[$req.details.meta_info.fields['udf_fields'].fields[fieldName].constraints.decimal]) + "</span>");
	 	        }
	 	    	break;
	    }
	},
  /**
	 * Autocomplete feature should be disabled for the PII fields
	 * */
	getAutocompleteState: function (fieldName) {
		var autocomplete = '';
		// autocomplete feature should disable for the PII fields
		try{
			if(fieldName.indexOf('udf_')!== -1 && $req.details.meta_info.fields['udf_fields'] && $req.details.meta_info.fields['udf_fields'].fields[fieldName]  && $req.details.meta_info.fields['udf_fields'].fields[fieldName].is_pii){ //NO I18N
				autocomplete = 'autocomplete="off"'; // NO I18N
			}
		}catch(e){}
		return autocomplete;
	},

	/** Returns the array of fields, those values are changed */
	getChangedFields: function() {
		var changedFields = {}, field_value,states = {}, values = {}, css = {},extra_fields={};
		for(var key in this.field_values) {
			if(jQuery("#propertyDetailForm [name='"+key+"']").length === 0) {
				continue;
			}
			var type, display_type,isReferField;
			var field_info = this.getFieldMetaInfo(key);
			if(field_info) {
				type = field_info.type;
				display_type = field_info.display_type;
				isReferField= field_info && field_info.lookup_entity != "request_option"; //No I18N
			}
			var field_element= jQuery("#propertyDetailForm [name='"+key+"']");
			/** capturing the fields' current states like hidden, disabled */
			if(field_element.parents(".fafr-row").hasClass('hide') || field_element.prop("disabled") === true) {
				states[key] = {
					hide:field_element.parents(".fafr-row").hasClass('hide'),//no i18n
					disabled:field_element.prop("disabled")== true//no i18n
				};
			}
			var fafrKey = jQuery("#propertyDetailForm [name='"+key+"']").attr("data-field");
            if(fafrKey && this.modified_options.hasOwnProperty(fafrKey)) {
                if(display_type === "Radio" || display_type === "CheckBox") {
                    values[key]=jQuery("#propertyDetailForm [name='"+key+"']").eq(0).parents(".input-group").eq(0).clone(true, true); //No I18N
                }else{
                    values[key]=jQuery("#propertyDetailForm [name='"+key+"']").html();
                }
            }
			var _val = jQuery("#propertyDetailForm [name='"+key+"']").val();
			if(_val === null && jQuery("#propertyDetailForm [name='"+key+"']").data("select2")) {
				if(jQuery("#propertyDetailForm [name='"+key+"']").select2("data") != null) {
					_val = jQuery("#propertyDetailForm [name='"+key+"']").select2("data").id;	//No I18N
				} else {
					continue;
				}
			}
			if(display_type === "Radio") {
				_val = jQuery("#propertyDetailForm [name='"+key+"']:checked").val()||0;
			}
			if(type === "multi_select") {
				if(display_type === "CheckBox") {
					_val = [];
					jQuery.each(jQuery("#propertyDetailForm [name='"+key+"']:checked"), function(index, element) {	//No I18N
						_val.push(jQuery(element).val());
					});
				} else {
					_val=(key === "assets")?jQuery("#propertyDetailForm [name='"+key+"']").select2("val"):jQuery("#propertyDetailForm [name='"+key+"']").select2("data"); //No I18N
				}
				if(typeof _val === "object") {
					field_value = JSON.parse(sdpToJSON(_val));
				}
				if(_val.length === this.field_values[key].length) {
					var comparVar=(display_type==="MultiSelect" && key.includes("udf_"))?_val.map(item => item.id):_val; //No I18N
					for(var i=0; i<this.field_values[key].length; i++) {
						/** assuming no two options can have same id */
						var id = (key === "assets" || key.includes("udf_multiselect_")) ? this.field_values[key][i].id : this.field_values[key][i];
						if(comparVar.indexOf(id) > -1) {
							comparVar.splice(comparVar.indexOf(id), 1);
						}
					}
					if(comparVar.length === 0) {
						continue;
					}else{
						_val=comparVar;
					}
				}
				if(key === "assets"||key === "space"||key === "configuration_items") {
					field_value = jQuery("#propertyDetailForm [name='"+key+"']").select2("data");	//No I18N
				}
				changedFields[key] = field_value;
			} else {
				if(_val !== undefined && this.field_values[key] != _val) {
                    if(key.includes("udf_") && display_type=="Pick List" && isReferField){
                        var temp=jQuery("#propertyDetailForm [name='"+key+"']").select2("data"); //No I18N
                        if(temp && temp.id){
                            _val = temp;
                        }
                    }
                    else{
                        if(this.dependentField.indexOf(key) > -1) {
                            _val = jQuery("#propertyDetailForm [name='"+key+"']").select2("data");	//No I18N
                        }
                    }
                    changedFields[key] = _val;
                }
			}
			if(type === "multi_line"){
				//we get the inline styles, as the fafr resize method modifies it, and those changes need to be carried into the pop-up
				var styleAttr = jQuery("#propertyDetailForm [name='"+key+"']").attr("style");
				if(styleAttr){
					css[key] = styleAttr;
				}
			}
			var tempValue = _val;
			if(tempValue && typeof tempValue === "object"){
				if(Array.isArray(tempValue)){
					for(var index=0; index < tempValue.length; index++){
						tempValue[index] = tempValue[index].id?tempValue[index].id:tempValue[index];
					}
				}else{
					tempValue = _val.id;
				}
			}
			var isDynamicLoadingField = $CS.isDynamicLoadingField(field_element);
			if((fafrKey && this.modified_options.hasOwnProperty(fafrKey) && !(isDynamicLoadingField)) && (type === "multi_select" || type === "lookup") && (tempValue &&(tempValue !== "0" || (Array.isArray(tempValue) && tempValue.length!=0))) ){
	            // If the field has a selected value, and if either a picklist or a multiselect field, we set the selected
	            // attribute to the selected options, to ensure the current option remains selected in the pop-up
	            /**
	             * for selecting elements with value attribute, option[value='value'] should not be used as the value might contain single quotes
	             * Instead, using the filter fn to match the value attribute's value
	             */
	            jQuery("#propertyDetailForm [name='"+key+"']").find("option").filter(function(index,el){
	                if(Array.isArray(tempValue)){
	                    return tempValue.indexOf(el.value)!=-1
	                }else{
	                    return tempValue==el.value;
	                }
	            }).attr("selected", true);    //No I18N
	            values[key]=jQuery("#propertyDetailForm [name='"+key+"']").html();
	        }
		}
		/** When updating from the technician pop up, even if the SGT values are not changed, the current values need to be updated in server to show the tech conflict if any */
		if(jQuery("#technicianPopUp").is(":visible") && !changedFields.technician) {
			changedFields.technician = this.field_values.technician ? this.field_values.technician : $req.details.request_info.technician ? $req.details.request_info.technician.id : null;
		}
		var dependencyValues={},fields=[];
		if(this.fafr_dependent_fields){
			for(var j=0;j<this.fafr_dependent_fields.length;j++){
				fields=fields.concat(this.fafr_dependent_fields[j].FIELDS);// join two arrays
				fields=fields.filter(function (item, pos) {return fields.indexOf(item) == pos});//remove duplicate values
				for(var i=0; i<fields.length; i++){
					fields[i]=$se.fieldsJson.getFieldId(fields[i])
					dependencyValues[fields[i]]=$CS.getText(fields[i]);
				}
			}
		}
		var fafr_keys=[];
		if(Object.keys($se.rules).length){
			try{
				 jQuery("#propertyDetailForm").find('[data-mandatory=true]').each(function(){
                	fafr_keys.push(jQuery(this).attr('data-field'));//NO I18N
            	});
			}catch(e){
			}
		}
		if(window.assign_comments && !window.assign_comments.isEmpty()){
			extra_fields.assign_comments=window.assign_comments.getHTML();
		}
		return {fields:changedFields,states:states,values:values,styles:css,dependency:{data:this.fafr_dependent_fields,fields:dependencyValues},fafr_keys:fafr_keys,extra_fields:extra_fields};
	},
	scrollToJQMandate:function($ele){
		var scrollToError;
		jQuery.each(jQuery('.propertyDetailForm-jv-error:visible'), function(index, element) {	//No I18N
			var errorPos = jQuery(element).parents(".col-fields:first").offset().top;	//No I18N
			scrollToError = scrollToError ?  (errorPos < scrollToError ? errorPos : scrollToError) : errorPos;
		});
		if(scrollToError) {
			if(!$ele) {
				$ele = 'html, body';	//No I18N
				scrollToError -= 50;
			} else {
				scrollToError =  scrollToError + jQuery($ele).scrollTop() - jQuery($ele).offset().top;
			}
			jQuery($ele).animate({
				scrollTop: scrollToError
			});
		}
	},
	/* this Function Save all inline open Fields Data and close them */
	inlineSave: function(field, spotEdit, successFn, errorFn, callback) {
		if((this.checkResolutionStatus || this.resol_update) && this.wizard.isEnabled) {
			if(this.resol_editor !== null) {
				resolution_editor = this.resol_editor;
				this.resol_editor = null;
			}
			$req.prop.wizard.options.resol_close=true;
			var descEle = parent.description_editor;
			if(descEle && descEle.isEmpty() == false) {
				this.description = descEle.getHTML();
			}
			jQuery("#ze_HTMLDesc_Focus").find('.ze_area').contents().find('.ze_body').html(jQuery("#ze_HTMLResolution").find('.ze_area').contents().find('.ze_body').html());// copying popup resolution content to resolution tab editor
			jQuery("#closeRequestPopUp").dialog("close");//closing wizard //No i18n
			return;
		}
		if(this.replyTemplateStatus && this.wizard.isEnabled){
			$req.prop.wizard.options.resol_close=true;
			 if($req.prop.wizard.options && $req.prop.wizard.options.set_resolution){

				if(parent.resolution_editor && !parent.resolution_editor.isEmpty()) {
					var resol_info = {
						content: parent.resolution_editor.getHTML()
					};
					if( !this.images|| Array.isArray(this.images)){
						this.images = {};
					}
					if(parent.resolution_editor.initobj.options.imgParameters.inlineimages.length>0){
						this.images["resolution.content"] = parent.resolution_editor.initobj.options.imgParameters.inlineimages
					}
					this.resolution = resol_info;
				}
		    }
		    var descEle = parent.description_editor;
			if(descEle && descEle.isEmpty() == false) {
				this.description = descEle.getHTML();
			}
			jQuery("#closeRequestPopUp").dialog("close");//closing wizard //No i18n
			return;
		}
		closeCalDialog();
		if(jQuery("#propertyDetailForm").data('validator') && !jQuery("#propertyDetailForm").valid() && (this.checkBulkEdit || spotEdit) && !this.checkResolutionStatus  && !this.resol_update && !this.replyTemplateStatus) {
			if(spotEdit) {
				$req.prop.sectionalFieldsEdit();
				jQuery("#propertyDetailForm").valid();
			}
			this.scrollToJQMandate();
			return;
		}
		/* requestId is used from listView table */
		jQuery('.page-progressbar').show();	//No I18N
	    this.checkNumDecimal = true;
	    /* check the mandate Fields */
	    if($req.prop.mandate_fields_exsists()) {
			if(window.current_req_mode == "kanban" && !!callback) {	//No I18N
				requestListViews.kanbanUpdateFn = callback;
			}
	        var validation = $req.prop.isDataValidated(field);
	        if(validation) {
                if(Object.keys(this.rulesObj).length !==0) {
            	    $se.checkOnSubmitCall();
                    if($se.checkMandatoryValidation() && $req.prop.mandate_fields_exsists() && !$se.stopFormSubmission) {
                        validation = $req.prop.isDataValidated();
                        if(validation) {
                            $se.onFormSubmit=true;
                            $se.executeOnFormSubmitScripts();
                            $se.onFormSubmit=false;
                	        $req.prop.updatePropertyRequest(spotEdit, successFn, errorFn, callback);
                        } else if($req.prop.checkResolutionStatus) {
                        	jQuery('.page-progressbar').hide();
                            return false;
            	        }
                    } else {
            	        if($req.prop.checkRightPanel) {
            	        	var fieldObj = $req.prop.getRightPanelModifiedField();
            	        	$req.prop.render(false);
            	        	$req.details.changeTab('properties'); //NO I18N
            		        $req.resource.checkResBulkEdit = false;
            		        $req.prop.sectionalFieldsEdit();
            		        $req.prop.setTriggeredField(fieldObj);
            	        } else if($req.prop.checkResolutionStatus) {
            	        	jQuery('.page-progressbar').hide();
                            return false;
            	        }
                    }
                } else {
            	    $req.prop.updatePropertyRequest(spotEdit, successFn, errorFn, callback);
                }
	        }
	    } else {
	    	/** When saving the spot edit in properties, bulk edit will be opened instead of the status change popup */
	    	if(spotEdit) {
				$req.prop.sectionalFieldsEdit();
				jQuery("#propertyDetailForm").valid();
				this.scrollToJQMandate();
			} else {
				if(window.current_req_mode == "kanban" && !!callback) {	//No I18N
					requestListViews.kanbanUpdateFn = callback;
				}
			    $req.prop.wizard.statusChange();
			}
	    }
		jQuery('.page-progressbar').hide();	//No I18N
	},
	/* this Function Close All the Fields */
	inlineCancel:function(fieldId){
		fieldElement = jQuery('[data-name='+fieldId+']');
		fieldElement.removeClass('hide').parent().find('.spot-form').addClass('hide');	//No I18N
		fieldElement.parent().find(".helpText").css("visibility","hidden"); //No I18N
		var reqFields = ["status", "priority", "technician", "site", "group"];	//No I18N
		if(reqFields.indexOf(fieldId) === -1) {
			/** Resets the value */
			this.resetField(fieldId);
		}
	    /* remove Mandatory (*) */
	    fieldElement.parents('.fafr-row').find('.mandatory').addClass('hide'); //NO I18N
	    /* site,technician,status Image Icon */
		if(fieldId === 'site'){
	  	   jQuery('#siteIcon').removeClass('hide');
	    }else if(fieldId === 'status' ){ //NO I18N
	        jQuery('#onHoldIcon').removeClass('hide');
	    }else if(fieldId === 'technician'){ //NO I18N
	    	jQuery('#technicianIcon').removeClass('hide');
	    }else if(isMSPOrSCP && (fieldId === 'account' || fieldId === 'subaccount')){ //NO I18N
	    	if(fieldId === 'account') {	//NO I18N
		    	jQuery('#accountIcon,#inactive-account-icon').removeClass('hide');
		    } else if(isSCP && fieldId === 'subaccount') {	//NO I18N
	    		jQuery('#inactive-subaccount-icon').removeClass('hide');
	    	}
	    }
	    /* close SGT */
	    if(fieldId === 'technician'){
	    	if(!$req.prop.checkRightPanel){
	            fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
	        }
	    	$req.prop.inlineCancel('group'); //NO I18N
	    	if(!$req.prop.checkRightPanel){
	            fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
	        }
	    	$req.prop.inlineCancel('site'); //NO I18N
	    }else if(fieldId === 'group'){ //NO I18N
	    	$req.prop.inlineCancel('site'); //NO I18N
	    }
	    /* close CSI */
	    if(fieldId === 'item'){
	    	if(!$req.prop.checkRightPanel){
	            fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
	        }
	    	$req.prop.inlineCancel('subcategory'); //NO I18N
	    	if(!$req.prop.checkRightPanel){
	            fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
	        }
	    	$req.prop.inlineCancel('category'); //NO I18N
	    }else if(fieldId === 'subcategory'){ //NO I18N
	    	$req.prop.inlineCancel('category'); //NO I18N
	    }

	    /** closing the opened calendar on canceling the date field */
	    if(fieldElement.attr("type") === "datetime") {
	    	closeCalDialog(undefined, fieldId + "_IN_calendar"); //NO I18N
	    }
	    /* fafr hidden fields */
	    if(!$req.prop.checkRightPanel){
	        fieldElement.parents('.fafr-row').removeClass('hide'); //NO I18N
	    }
	},

	/** Resets the changed value to the current value */
	resetField: function(key, val) {
		var set_default_val = val === undefined ? true : false;
		var type, display_type;
		if(set_default_val) {
			val = this.field_values[key]
		}
		var field_info = this.getFieldMetaInfo(key);
		var isDynamicLoadingField = $CS.isDynamicLoadingField(jQuery("#propertyDetailForm [name='"+key+"']")); //No I18N
		if(field_info) {
			type = field_info.type;
			display_type = field_info.display_type;
		}
		if(val !== undefined) {
			if(isDynamicLoadingField){
				var selectedValue;
				if(type === 'lookup'){
					if(val === "0" || val === "" || val == "null" || val == null){
						var isReferField= field_info && field_info.lookup_entity != "request_option"; //No I18N
                        if(!isReferField){
                            var displayName = jQuery("#propertyDetailForm [name='"+key+"']").parents(".fafr-row").find(".fafr-label").text().trim(); //No I18N
                            var placeHolderText = "-- " + getMessageForKey("sdp.common.select") + " " + displayName + " --";
                            selectedValue = {"id":0, "text":placeHolderText}; //No I18N
                        }
					}
					else{
                        var isReferField=field_info && field_info.lookup_entity != "request_option"; //No I18N
                        if(isReferField && (typeof val =="object")){
                            selectedValue = {"id":val.id, "text":val.text}; //No I18N
                        }else{
                            let allowedValues = ($req.details.allowedValues[key] && $req.details.allowedValues[key].AllowedValues) || {};
                            selectedValue = {"id":val, "text": allowedValues[val] || val}; //No I18N
                        }
					}
					jQuery("#propertyDetailForm [name='"+key+"']").select2("data", selectedValue);	//No I18N
				}else if(type === 'multi_select'){ //No I18N
					selectedValue = val;
					jQuery("#propertyDetailForm [name='"+key+"']").select2("data", selectedValue);	//No I18N
				}

			}else if(type === "multi_select") { //No I18N
				if(display_type === "CheckBox") {
					jQuery("#propertyDetailForm [name='"+key+"']").prop("checked", false); //No I18N
					for(var i=0; i<val.length; i++) {
						jQuery("#propertyDetailForm [name='"+key+"']").filter(function() {
							if(val[i].id){
								return this.value === val[i].id;
							}
							else{
								return this.value === val[i];
							}
						}).prop("checked", true);	//No I18N
					}
				} else {
					if(jQuery("#propertyDetailForm [name='"+key+"']").data("select2")) {
						if(key === "assets"||key=="space"||key=="configuration_items") {
							jQuery("#propertyDetailForm [name='"+key+"']").select2("data", val);	//No I18N
						} else if(key === "email_ids_to_notify") {	//No I18N
							var valFormat = val;
							if(valFormat.length && typeof valFormat[0] == "string") {	//No I18N
								valFormat = val.map(function(item) {
					                return {
					                    id: item,
					                    name: item
					                };
					            });
							}
							jQuery("#propertyDetailForm [name='"+key+"']").select2("data", valFormat);	//No I18N
						} else {
							jQuery("#propertyDetailForm [name='"+key+"']").select2("data", val);	//No I18N
						}
					}
				}
			} else {
				if(display_type === "Radio") {
					jQuery("#propertyDetailForm [name='"+key+"']").filter(function() {
						return this.value === val;
					}).prop("checked", true);	//No I18N
				} else if(field_info.type === "datetime") {
					jQuery("#propertyDetailForm [name='"+key+"']").val(val);
					if(!set_default_val) {
						val = isNaN(parseInt(val)) ? 0 : parseInt(val);
						jQuery("#"+key+"_IN_Display").val(this.getDateFormate(val));
					}
				} else if(field_info.type === "lookup" && jQuery("#propertyDetailForm [name='"+key+"']").data("select2")) {
					if( (key === "site" && typeof val === "object") || (isMSPOrSCP && key === 'account') ) {
						jQuery("#propertyDetailForm [name='"+key+"']").select2("data", val);	//No I18N
					} else {
						jQuery("#propertyDetailForm [name='"+key+"']").select2("val", val);	//No I18N
					}
				} else {
					jQuery("#propertyDetailForm [name='"+key+"']").val(val);
				}
			}
		}
	},

	/* this function update DateBase */
	updatePropertyRequest:function(spotEdit, successFn, errorFn, callback) {
		if(jQuery.isEmptyObject(this.sectionalUpdateJson) && requestListViews.viewMode == "kanban" && !Object.keys(this.udfDBObject).length) {	//NO I18N
	    	if(typeof callback === "function") {	//NO I18N
		    	callback();
		    }
	    	return;
	    }
	    if(jQuery.isEmptyObject(this.sectionalUpdateJson) && $req.prop.replyTemplateStatus){
	    	return;
	    }
		/** Checks the Technician change validation */
		if(this.sectionalUpdateJson.hasOwnProperty("technician") ){
			if(!this.validTechChange(this.sectionalUpdateJson.technician)){
				if(requestListViews.viewMode == "kanban" && typeof callback === "function") {	//NO I18N
				    callback();
				}
				return false;
			}
		}

		if(
			this.sectionalUpdateJson.hasOwnProperty("technician") ||  //No I18N
			this.sectionalUpdateJson.hasOwnProperty("site") || //No I18N
			this.sectionalUpdateJson.hasOwnProperty("group")  //No I18N
			){
			this.populateAssignComments();
		}

		/** for UDF JSON */
	    if(Object.keys(this.udfDBObject).length){
	       this.sectionalUpdateJson.udf_fields=this.udfDBObject;
	    }

	    /** For Closure Details */
	    if(Object.keys(this.closure_info).length){
	        this.sectionalUpdateJson.closure_info = this.closure_info;
	    }else if(this.status_change_comments.length){
	    	this.sectionalUpdateJson.status_change_comments = this.status_change_comments;
	    }
	    /** onhold_scheduler */
	    if(Object.keys(this.onhold_scheduler).length){
	    	this.sectionalUpdateJson.onhold_scheduler = this.onhold_scheduler;
	    }
	    if(this.status_change_comments.length){
	    	this.sectionalUpdateJson.status_change_comments = this.status_change_comments;
	    }
	    /** FCR */
	    if(this.fcrUpdateJson === true || this.fcrUpdateJson === false){
	    	this.sectionalUpdateJson.is_fcr = this.fcrUpdateJson;
	    }
	    if(isSCP && (this.closeWithoutNotif === true || this.closeWithoutNotif === false))
	    {
	    	this.sectionalUpdateJson.close_without_notif = this.closeWithoutNotif;
	    }
	    /** Priority Matrix */
	    var priorityElementValue = jQuery('#priorityMatrix').val();
	    if(!this.sectionalUpdateJson.priority && priorityElementValue) {
	    	if(priorityElementValue !== "0") {
	    		this.sectionalUpdateJson.priority = { "id": priorityElementValue }; //NO I18N
	    	}
	    }
	    /** Resolution Content */
	    if($req.prop.wizard.isEnabled && $req.prop.wizard.options && $req.prop.wizard.options.set_resolution){

			if(parent.resolution_editor && !parent.resolution_editor.isEmpty()) {
				var resol_info = {
					content: parent.resolution_editor.getHTML()
				};
				this.sectionalUpdateJson.resolution = resol_info; //NO I18N
			}
	    }

	    /** When updating from resolution section, Resolution content, attachments, ass_solution info also needs to be included */
	    if(this.resol_update) {
	    	this.addResolutionInfo();
	    }

	    var jsonUpdate = window.sdpToJSON({"request":this.sectionalUpdateJson}); //NO I18N
	    var statusId = $req.details.request_info.status.id;
	    var from_rpanel = this.checkRightPanel, from_resol = this.resol_update, from_dialog = this.wizard.isEnabled;
	    if(this.sectionalUpdateJson.status){
	       statusId = this.sectionalUpdateJson.status.id;
	    }
	    $req.prop.checkSubmitMsg = "";	//No I18N
	    $req.prop.failureMsg = "";

	    /** Disabling the form save button */
	    if(spotEdit) {
	    	jQuery("#propertyDetailForm .spot-save").addClass("disabled").prop("disabled", true); //No I18N
	    }
	    if(from_rpanel) {
	    	jQuery("#technicianPopUp .sgt-assign").addClass("disabled").prop("disabled", true);//No I18N
	    	jQuery("#categoryPopUp .csi-update").addClass("disabled").prop("disabled", true);//No I18N
	    	jQuery("#saveStatusButton").addClass("disabled").prop("disabled", true);//No I18N
	    }
	    if(from_resol) {
			jQuery("#resolutionDetails button[name='addResolutionButton']").addClass("disabled").prop("disabled", true); //NO I18N
			jQuery("#resolutionDetails button[name='saveAndAddAsSolutionButn']").addClass("disabled").prop("disabled", true); //NO I18N
	    }
	    if(from_dialog) {
	    	jQuery("#closeRequestPopUp .dialog-save").addClass("disabled").text(getMessageForKey("sdp.admin.common.updating")).prop("disabled", true);//No I18N
	    }
	    jQuery("#bottom-property-action button").addClass("disabled").prop("disabled", true);//No I18N
	    jQuery("#bottom-property-action .sect-save").text(getMessageForKey("sdp.admin.common.updating"));
	    var sdpAjaxSuccessFn = function (data){
	    try {
            $req.prop.checkSubmitMsg = data && data.response_status ? data.response_status.status : "";	//No I18N
            if($req.prop.checkSubmitMsg === 'success' || $req.prop.checkSubmitMsg === 'warning') {
                if(isMSP)
					{
						if(jQuery.isEmptyObject($req.details.request_info.site) && !jQuery.isEmptyObject($req.prop.sectionalUpdateJson.site))
						{
							window.location.reload();
						}
					}
	    		    if ($req.details.req_warning && $req.details.req_warning.status_code == 21004){
                			/*
                			If resolution was an incomplete content due to missing file.
                			After updating resolution, Removing resolution field from warning fields.
                			Same processing done for descriptio too.
                			*/
                			let resInd = $req.prop.sectionalUpdateJson.resolution ? $req.details.req_warning.fields.indexOf("content") : -1;//If resolution is passed in input_data & and updated successfully, Removing the resolution field from warning fieldsn array.
                			resInd!=-1 && $req.details.req_warning.fields.splice(resInd,1); //resInd will be -1 if (resolution content is not passed in input_data (or) If resolution field is not present in warning fields array.
                			let descInc = $req.prop.sectionalUpdateJson.description ? $req.details.req_warning.fields.indexOf("description"): -1; //If description is passed in input_data & and updated successfully, Removing the description field from warning fieldsn array.
                			descInc!=-1 && $req.details.req_warning.fields.splice(descInc,1); //descInd will be -1 if (description content is not passed in input_data (or) If description field is not present in warning fields array.
                			if(!$req.details.req_warning.fields.length>0){//If all missed fields got updated.
                			 $req.details.req_warning = undefined;//Making req_warning as undefined.
                		    }
                	 }
                $req.details.request_info = data.request;
                $req.details.request_info.description = appendImageToken($req.details.request_info.description, $req.details.request_info.image_token);
                $req.prop.isOperationComplete = true;
                $req.utils.alert("success", getMessageForKey("request.updated"),"isAutoHide=true"); //NO I18N
                    /** Destory the assign Comments */
                    window.assign_comments = undefined;
                if($req.prop.wizard.isEnabled) {
                    jQuery("#closeRequestPopUp").dialog('close');//No i18n
                }
            }

            if($req.prop.checkSubmitMsg === 'warning' && data && data.response_status && data.response_status.messages && data.response_status.messages[0] && data.response_status.messages[0].message) {
                setTimeout(function() {
                    $req.utils.alert("warning", data.response_status.messages[0].message, "isAutoHide=true, delay=5"); //NO I18N
                }, 2000);
            }
            if(typeof successFn === "function") {
                successFn();
            }
            try {
                if(window.current_req_mode == "kanban" && !!window.top.kanban_comp_request && !!window.top.requestListViews.kan_col_id) {	//No i18n
                    window.top.kanban_comp_request.chkColRefresh(window.top.requestListViews.kan_col_id, $req.prop.sectionalUpdateJson, function(id) {
                        window.top.requestListViews.kan_col_id = id;
                    });
                }
            } finally {
				SdpWidgets.eventHandle.updateRequest(jsonUpdate);
			}
            } catch(ex) {
                //console.error(ex);
            }
        }
	    sdpAjax({
	    	headers: { Accept: 'application/v3+json' }, //NO I18N
	    	type: 'PUT', //NO I18N
	    	data: {"input_data":jsonUpdate},  //NO I18N
	    	url: '/api/v3/requests/'+woID, //NO I18N
	    	success: sdpAjaxSuccessFn,
	    	error: function(data) {
	    		try {
	    		var openEdit = true;	/** Denotes whether to open the appropriate edit mode */
	    		data = data.responseJSON;
	    		if(data && data.request && data.response_status && data.response_status.messages && data.response_status.status == 'warning'){
                // If a warning response is returned along with the request data, it will be passed to success handler and the warning popup will also be thrown
                    sdpAjaxSuccessFn(data);
                    return;
                }

			// Re-enabling the submit/save button in case of failure
			jQuery("#bottom-property-action button").removeClass("disabled").prop("disabled", false);//No I18N

			// Pickup Button re-enable
            jQuery('#pickupTech').removeClass("ptr-ev-none");
			// RLC Transition buttons
			jQuery('#left-panel .btn-transition').prop({disabled: false});//no i18n
	    	jQuery('#right-panel .btn-transition').prop({disabled: false});//no i18n
	    	if(spotEdit) {
				jQuery("#propertyDetailForm .spot-save").removeClass("disabled").prop("disabled", false);//No I18N
			}
			if(from_rpanel) {
		    	jQuery("#technicianPopUp .sgt-assign").removeClass("disabled").prop("disabled", false);//No I18N
		    	jQuery("#categoryPopUp .csi-update").removeClass("disabled").prop("disabled", false);//No I18N
		    	jQuery("#saveStatusButton").removeClass("disabled").prop("disabled", false);//No I18N
		    }
		    if(from_resol) {
		    	jQuery("#resolutionDetails button[name='addResolutionButton']").removeClass("disabled").prop("disabled", false); //No I18N
		    	jQuery("#resolutionDetails button[name='saveAndAddAsSolutionButn']").removeClass("disabled").prop("disabled", false); //No I18N
		    }
		    if(from_dialog) {
		    	var updateBtnText = translate("sdp.common.update");
		    	if($req.prop.wizard.tabs && $req.prop.wizard.tabs.tab_order && $req.prop.wizard.tabs.tab_order.length > 1) {
		    		updateBtnText = translate("sdp.common.next");
		    	} else if($req.prop.wizard.options && $req.prop.wizard.options.closedStatusID == $req.prop.wizard.toStatus) {
		    		updateBtnText = translate("sdp.requests.viewrequest.closerequest");
		    	}
		    	jQuery("#closeRequestPopUp .dialog-save").removeClass("disabled").text(updateBtnText).prop("disabled", false);//No I18N
		    }

	    		if(data && data.response_status && data.response_status.messages) {

	    			if(data.response_status.messages[0].status_code === 4004 || data.response_status.messages[0].status_code === 7001) {
		    			$req.utils.alert("failure", data.response_status.messages[0].message ,"isAutoHide=true, delay=15"); //NO I18N
		    			return;
		    		}
	    			if(data.response_status.messages[0].status_code === 4510) {
		    			if(data.response_status.messages[0].message) {
		    				$req.utils.alert("failure", e_html(data.response_status.messages[0].message) ,"isAutoHide=false"); //NO I18N
		    			} else {
		    				$req.utils.alert("warning", getMessageForKey("request.fields.update.error") ,"isAutoHide=true, delay=15"); //NO I18N
		    			}
		    			/* Window should not close on negate.*/
						$req.prop.failureMsg = 'failed'; //NO I18N
		    			openEdit = false;
		    		} else {
			    		var fields = data.response_status.messages[0].fields;
			    		if(!fields && data.response_status.messages[0].field) {
			    			fields = [data.response_status.messages[0].field];
						}

                        /* Assign comments negate & rlc note negate handling */
                        if(fields && jQuery.isArray(fields) && fields.length > 0 && fields[0].indexOf('notes') !== -1) {
                            var notesResponseObj = data.response_status.messages[0].message.response_status.messages[0];
                            var notesResponseMsg = notesResponseObj.message;
                            var notesResponseField = notesResponseObj.field;
                            if (typeof notesResponseMsg === 'object') { // NO I18N
                                /* Notes mentions error message */
                                if (notesResponseMsg.mentions && notesResponseMsg.mentions.length > 0) {
                                    showalert('failure', getMessageForKey('sdp.requests.note.addnote.error.mentions'), 'isAutoHide=true, delay=15'); // NO I18N
                                } else {
                                    /* Unable to update field(s) : Notes error message */
                                    showalert('failure', getMessageForKey('common.update.fields.failed') +  ' : <b>' + getMessageForKey('sdp.common.notes')+ '</b>', 'isAutoHide=true, delay=15');	//No I18N
                                }
                            }
                            else if (typeof notesResponseMsg === 'string') {
                                if (notesResponseField === 'attachments') {
                                    /* Notes attachments error message */
                                    showalert('failure', '<b>' + getMessageForKey('sdp.common.attachments') + ' : </b>' + e_html(notesResponseMsg), 'isAutoHide=true, delay=15'); // NO I18N
                                } else {
                                    /* Notes negate action, invalid placeholder and other error messages */
                                    showalert('failure', e_html(notesResponseMsg), 'isAutoHide=false'); // NO I18N
                                }
                            }
                            $req.prop.failureMsg = 'failed'; //NO I18N
                            return false;
                        }

			    		var fieldTitles = [], mappedFieldName;
			    		if(fields) {
			    			for(var i=0; i < fields.length; i++) {
				    			if(fields[i].indexOf("udf_fields.") === 0) {
				    				mappedFieldName = $req.prop.key_title_mappingObject[fields[i].split("udf_fields.")[1]];
				    			} else {
				    				mappedFieldName = $req.prop.key_title_mappingObject[fields[i]];
				    			}
				    			if(mappedFieldName) {
				    				fieldTitles.push(e_html(mappedFieldName));
				    			}
				    			else if(fields[i]){
                                    fieldTitles.push(e_html(fields[i]));
                                }
				    		}
			    		}
			    		$req.prop.isOperationComplete = false;
			    		$req.prop.highLightFields = fields || [];
			    		if(data.response_status.messages[0].message) {
			    			if(jQuery("#propertyDetailForm").data('validator')) {
						    	jQuery("#propertyDetailForm").validate().settings.rules = null;
						    	jQuery("#propertyDetailForm").validate().settings.messages = null;
						    }
						    var errorMsg = data.response_status.messages[0].message;
						    if(fieldTitles.length > 0) {
								errorMsg += " : <b>" + fieldTitles.join(", ") + "</b>";	//No I18N
							}
						} else {
							var errorMsg = getMessageForKey("common.update.fields.failed");	//No I18N
							if(data.response_status.messages[0].status_code === 4001) {
			                    errorMsg = getMessageForKey("common.fields.invalid");	//No I18N
							}
							if(fieldTitles.length > 0) {
								errorMsg += " : <b>" + fieldTitles.join(", ") + "</b>";	//No I18N
							}
							openEdit = false;
						}
						var autoHide = "isAutoHide=true, delay=15";	//No I18N
						/** when any of the required fields is not available in the form, then show the message saying update those fields from Global edit */
						if(fields && fields.length > 0) {
							var unavail_fields = [];	//No I18N
							for(var i=0; i<fields.length; i++) {
								if(fields[i] && $req.prop.unavail_fields.indexOf(fields[i]) > -1 && $req.prop.key_title_mappingObject[fields[i]]) {
									unavail_fields.push(e_html($req.prop.key_title_mappingObject[fields[i]]));	//No I18N
								}
							}
							if(unavail_fields.length > 0) {
								errorMsg += "<br>" + getMessageForKey("request.fields.update.useglobaledit", ["<b>"+unavail_fields.join(", ")+"</b>", "<a href=\"/WorkOrder.do?woMode=editWO&fromPage=reqDetails&woID="+$req.details.request_info.id+"\" >" + getMessageForKey("sdp.common.clickhere") + "</a>"]);
								autoHide = "isAutoHide=false";	//No I18N
							}
						}
						$req.utils.alert("warning", errorMsg, autoHide); //NO I18N
					}
	    		}
                else {
	    			$req.utils.alert("warning", getMessageForKey("request.fields.update.error") ,"isAutoHide=true, delay=15"); //NO I18N
	    			openEdit = false;
	    		}
	    		/** SD-76105 : If worklog is needed, then show alert whether to open the worklogs tab */
	    		if(fields && fields.length === 1 && fields.indexOf("worklog") === 0) {
	    			if($req.prop.checkResolutionStatus) {
	    				openEdit = false;
	    				if(!jQuery("[name='timeSpent']").is(":checked")) {
			   				if(confirm(getMessageForKey("request.worklog.closingrule.alert"))) {
			   					jQuery("[name='timeSpent']").trigger("click");
			   				}
			   			}
	    			}
	    		}
				if(openEdit) {
					$req.prop.wizard.extraFields=fields;
					if($req.prop.wizard.isEnabled) {
						$req.prop.wizard.showPropertyTab();
					} else if(from_rpanel || from_resol || (fields && (fields.indexOf("description") !== -1 || fields.indexOf("resolution") !== -1)) || ($req.prop.fromListview && window.current_req_mode === "kanban")) {	//No I18N
						$req.prop.wizard.statusChange(null, fields);
					} else if(spotEdit) {
						$req.prop.sectionalFieldsEdit();
						jQuery("#propertyDetailForm").valid();
						$req.prop.scrollToJQMandate();
					} else {
						$req.prop.getMandateFields(); // Used to show the hidden fields in sectional edit
					}
				}
				if(typeof errorFn === "function") {
	    			errorFn();
	    		}
	    		} catch(ex) {
	    			//console.error(ex);
	    	}
	    	}
	    }).always(function() {

	    	var self = $req.prop;
	    	self.udfDBObject = {};
		    self.checkSGT = false;
		    self.checkCSI = false;
		    self.checkPriorityMatrix = false;
		    if(isSCP)
		    {
		    	self.closeWithoutNotif="";
		    }
			self.isCategoryNotAvailable =false;
			self.emptyResourceFields = [];
			self.emptyPropertyFields = [];
		    //refresh the right pannel and PropertyDetails
		    if($req.prop.checkSubmitMsg === 'success' || $req.prop.checkSubmitMsg === 'warning') {
		    	/** TODO::: After update, if the user doesn't fall under the updated Group, moving out of the Ticket */
		    	/** TODO::: Below request call is to get the complete asset object with remote options when asset is updated. Need to check if we need to change */
		    	if(self.sectionalUpdateJson.hasOwnProperty("assets")) {
		    		$req.details.getRequestInfo(woID, ["asset_list"]);
		    	}
		    	self.checkRightPanel = false;
		    	self.checkBulkEdit = false;
		    	if(typeof req_details !== "undefined") {	//No I18N

		    		if(self.resol_update) {
		    			jQuery(".sdtab-content #ze_HTMLDesc_Focus").addClass("disp-h");	//No I18N
		    		}
		    	    var updatedProps = [];
		    	    /** SD-87418 - Asset name automatically deleted on consecutive updation */
		    	    for(var key in self.sectionalUpdateJson) {
		    	    	if(key === "udf_fields") {
		    	    		if(self.sectionalUpdateJson.udf_fields) {
		    	    			for(var udfKey in self.sectionalUpdateJson.udf_fields) {
		    	    				updatedProps.push(udfKey);
		    	    			}
		    	    		}
		    	    	} else {
		    	    		updatedProps.push(key);
		    	    	}
		    	    }
		    	    //SD-113111 : if the changed fields has note_comments the update the conversation component.
                    if(self.sectionalUpdateJson.hasOwnProperty("note_comments")){
                        $req.details.updateRequestTemplates('conversation'); //No I18N
                    }
		    		$req.details.updateRequestTemplates('property', updatedProps); //NO I18N
		    	} else if(self.fromListview || typeof req_module !== "undefined") {	//No I18N
					/* refreshing the table based on the view */
					if(self.fromListview && window.current_req_mode === "kanban") {
						if(window.requestListViews && window.requestListViews.kanbanUpdateFn) {
							window.requestListViews.kanbanUpdateFn(true);
						}
					} else{
						window.current_req_mode === "combined" ? table_combined_task.refreshTable("refresh") : table_comp_request.refreshTable("refresh"); //No I18N
					}
		    	}
		    	self.resol_update = false;
		    	$req.details.getStatusJson(woID);
			    self.status_change_comments = "";
			    self.fcrUpdateJson = "";
			    self.onhold_scheduler = {};
			    self.closure_info = {};
			    self.description = null;
			    description_editor=null;
			    resolution_editor=null;
			    $req.prop.fafr_mandate_keys=[];
				$req.prop.fafr_dependent_fields=[];
				$req.details.status_mandate = {};
		    }
		    self.sectionalUpdateJson = {};
		    jQuery("#bottom-property-action .sect-save").text(getMessageForKey("sdp.common.update"));
		    jQuery('.page-progressbar').hide();
		    if(typeof callback === "function") {
		    	callback();
		    }
		    $req.prop.checkRLC = false;
	    });
	},

	updateFCR:function(value){
	   this.fcrUpdateJson =  value;
	   this.updatePropertyRequest();
	},

	/* Section Edit */
	sectionalFieldsEdit:function(skipOnload){
		var retain_prop=this.getChangedFields();
		/* if fafr applied on rightPanel (for DetailPage hide fields)*/
		if(this.checkRightPanel){
		    $req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
			$req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
		    this.checkRightPanel = false;
	    }
	    this.checkBulkEdit = true;
	    this.sectionalEdit(skipOnload);
	    jQuery("#"+$req.prop.element).addClass("form-edit");
	    this.restoreFields(retain_prop,true);
	},

	restoreFields:function(retain_prop,skipOnload){
		/** retains spot edit changed values in Sectional Edit */
		var changedValues=retain_prop.fields;
		var states=retain_prop.states;
		var values=retain_prop.values;
		var styles=retain_prop.styles;
		var extra_fields = retain_prop.extra_fields;
		//Dependent fields are reintiated and skipDependentField is to skip the intialization of dependent fields
		if(skipOnload!=true && retain_prop.dependency.data){
			for(var j=0;j<retain_prop.dependency.data.length;j++){
				$se.setParentListener(jQuery.extend(true,{},retain_prop.dependency.data[j],{}));
			}
		}
		//Modified fields through fafr like remove/add option
		for(var key in values){
			var field_info = this.getFieldMetaInfo(key);
			if(field_info.display_type=="Radio"||field_info.display_type=="CheckBox"){
				jQuery("#propertyDetailForm [name='"+key+"']").parents(".input-group").html(values[key]);//no i18n
			}
			else{
				jQuery("#propertyDetailForm [name='"+key+"']").html(values[key]);
			}
		}
		//Modified fields throught fafr like disable/enable field
		for(var key in states){
		//When data-field is null/empty and passed to hideField fn, error will be thrown
		let dataFieldName = jQuery("#propertyDetailForm [name='"+key+"']").attr('data-field');
			if(states[key].hide == true && dataFieldName){
				$CS.hideField(dataFieldName);
			}
			if(states[key].disabled == true && dataFieldName){
				$CS.disableField(dataFieldName);
			}
		}
		//restore Dependent Fields
		if(skipOnload!=true && Object.keys(retain_prop.dependency.fields).length){
			for( var id in retain_prop.dependency.fields){
				$CS.setText(id,retain_prop.dependency.fields[id]);
			}
		}
		//Modified fields by user or fafr
		for(var field in changedValues) {
			if(this.dependentField.indexOf(field) > -1) {
				this.restoreDependentFields(field, changedValues);
			} else {
				this.resetField(field, changedValues[field]);
			}
		}
		//Modified CSS styles by fafr resize
		for(var field in styles){
		    let style_ele = jQuery("#propertyDetailForm [name='"+field+"']");
	    	style_ele.attr("data-style", styles[field]);//style attr wont work due to CSP header. Hence appending it as data-style.
	    	$sdStyleConverter(style_ele);
		}
		 if(extra_fields && extra_fields.assign_comments && jQuery("#propertyDetailForm [name='assign_comments']").length === 0 ){
			jQuery("#propertyDetailForm").append('<textarea class="hide" name="assign_comments">'+extra_fields.assign_comments+'</textarea>');
		 }
		//restoring Mandate Fields
		if(Object.keys($se.rules).length && skipOnload!=true){
			$CS.mandateField($req.prop.fafr_mandate_keys);
		}
		if(Object.keys($se.rules).length && retain_prop.fafr_keys.length){
			$se.addMandatoryList(retain_prop.fafr_keys);
		}
	},

	restoreDependentFields: function(field, changedValues) {
		var sgt = ["site", "group", "technician"];	//No I18N
		var csi = ["category", "subcategory", "item"];	//No I18N
		if(sgt.indexOf(field) > -1) {
			var site = changedValues.site ? changedValues.site.id : ($req.details.request_info.site ? $req.details.request_info.site.id : 0);
			var group = changedValues.group ? changedValues.group.text : ($req.details.request_info.group ? $req.details.request_info.group.name : undefined);
			var technician = changedValues.technician ? changedValues.technician.text : ($req.details.request_info.technician ? $req.details.request_info.technician.name : undefined);
			if(changedValues.site) {
				this.resetField("site", changedValues.site);	//No I18N
			}
			$req.sgt.populateData(site, group, technician, "site");	//No I18N
		} else if(csi.indexOf(field) > -1) {
			var category = changedValues.category ? changedValues.category.text : ($req.details.request_info.category ? $req.details.request_info.category.name : undefined);
			var subcategory = changedValues.subcategory ? changedValues.subcategory.text : ($req.details.request_info.subcategory ? $req.details.request_info.subcategory.name : undefined);
			var item = changedValues.item ? changedValues.item.text : ($req.details.request_info.item ? $req.details.request_info.item.name : undefined);
			if(changedValues.category) {
				this.resetField("category", changedValues.category.id);	//No I18N
			}
			$req.csi.populateData(category, subcategory, item, "category");	//No I18N
		}
	},

	/* set fields in edit mode */
	iterateFieldsEdit:function(sections) {
		var validateRules = {};
		var validateMsg = {};
		for(var i=0; i<sections.length; i++) {
			for(var j=0; j<sections[i].columns.length; j++){
				for(var k=0; k<sections[i].columns[j].fields.length; k++) {
					if(sections[i].columns[j].fields[k] !== undefined){
						var field = sections[i].columns[j].fields[k];
			            var val = field.KEY;
			            if(field.EDIT){
			                $req.prop.setFieldEditMode(val);
			            }else if(!$req.prop.checkRightPanel){
			            	/* show fields which is hidden by on detail page */
			            	jQuery('[data-name='+val+']').parents('.fafr-row').removeClass('hide'); //NO I18N
			            }
			            var ruleObj = this.constructRuleObj(field);
			            if(!jQuery.isEmptyObject(ruleObj.rules)) {
			            	validateRules[field.name] = ruleObj.rules;
			            }
			            if(!jQuery.isEmptyObject(ruleObj.messages)) {
			            	validateMsg[field.name] = ruleObj.messages;
			            }
			        }
				}
		    }
		}
		if(!$req.details.self_service_portal_settings.priority_matrix_techoverride){
    		//if priority matrix is enabled, and tech overriding is disabled, set the value to the hidden input element for FAFR to work
    		var priorityVal = "0"
    		if($req.details.request_info.priority){
    			priorityVal = $req.details.request_info.priority.id;
    		}
    		jQuery("#priorityMatrix").val(priorityVal);
    	}
		if(jQuery("#propertyDetailForm").data('validator')) {
	    	jQuery("#propertyDetailForm").validate().settings.rules = validateRules;
	    	jQuery("#propertyDetailForm").validate().settings.messages = validateMsg;
	    }
	    initFormValidator("propertyDetailForm", validateRules, validateMsg);	//No I18N
	},

	/** constructs the jquery validator rules and messages object */
	constructRuleObj: function(field) {
		var obj = {
			rules: {},
			messages:{}
		};
		if(Object.keys($se.rules).length){
			field.mandatory	=false;
		}
		if(field.mandatory) {
			if(field.TYPE === "lookup" || field.name === "site") {	//No I18N
				if(field.name.indexOf("udf_") !== -1){
                    var isRefer= $req.details.meta_info.fields.udf_fields.fields[field.name].lookup_entity != "request_option"
                    if(isRefer){
                        obj.rules.required = true;
                        obj.messages.required = getMessageForKey("common.validation", [e_html(field.TITLE)]);	//No I18N
                    }
                    else{
                        obj.rules.select = true;
                        obj.messages.select = getMessageForKey("common.validation.select", [e_html(field.TITLE)]);	//No I18N
                    }
                }
                else{
                    obj.rules.select = true;
                    obj.messages.select = getMessageForKey("common.validation.select", [e_html(field.TITLE)]);	//No I18N
                }
			} else if(field.TYPE === "datetime") {	//No I18N
				obj.rules.date = true;
				obj.messages.date = getMessageForKey("common.validation", [e_html(field.TITLE)]);	//No I18N
			} else {
				obj.rules.required = true;
				obj.messages.required = getMessageForKey("common.validation", [e_html(field.TITLE)]);	//No I18N
			}
		}
		if(field.TYPE === "long") {	//No I18N
			obj.rules.regex = /^\d+$/;
			obj.messages.regex = getMessageForKey("sdp.common.invalidnumber");	//No I18N
		} else if(field.TYPE === "double") {	//No I18N
			obj.rules.number = true;
			obj.messages.number = getMessageForKey("common.invalid.decimal");	//No I18N
		} else if(field.name == 'email_ids_to_notify'){
		    //SD-105700 : Email separator for multi-select email field validation.
			obj.rules.email=",";
		}
		return obj;
	},

	/* Bulk Edit Function */
	sectionalEdit: function(skipOnload) {
	    $req.prop.editMode = true;
	    $req.prop.iterateFieldsEdit(this.fieldDetails.sections);
	    /* set mandate (*) on the fields if status is close request */
	    var currStatus = $req.prop.getCurrentStatus();
		if(currStatus === 'Closed' || currStatus === 'Resolved'){
			/* for getting the mandatory closure Fields */
	        if(!Object.keys($req.details.request_closing_rules).length){
			    $req.details.getRequestClosingRulesJson();
		    }
			$req.prop.setMandatoryField();
		}
	    this.checkSGT = false;
	    this.checkCSI = false;
	    $req.prop.hideExtraFields();
	    $req.prop.setChangeOnCSIFields('');
	    $req.prop.setChangeOnSGTFields('');
	    if(!this.checkRightPanel) {
			//for rightpanel edit, we call setFieldAndFormRules after calling sectionalCancel().
			$req.prop.setFieldAndFormRules(false, skipOnload);
		}
	    /* handle static submit footer */
	    var propertyForm = jQuery('#PropertyFrame');
	    var wrapper = propertyForm.find('[data-id=form-fixed-wrapper]'),
	        btn = propertyForm.find('[data-id=form-fixed-btn]'),
	        fixedwrapper = propertyForm,
	        innerhgt = propertyForm.find('[data-id=form-inner-wrapper]');
	    $req.prop.fixedform(wrapper,btn,fixedwrapper,innerhgt);
	    $req.prop.fixedformresizescroll(wrapper,btn,fixedwrapper,innerhgt);
	    if(!this.checkRightPanel){
	        jQuery('#prop-edit-btn').addClass('hide');
	        jQuery('#bottom-property-action').removeClass('hide');
	        // if($req.details.tab_name !== "properties"){
	        // 	jQuery('#top-property-label').removeClass('hide');
	        // }
	        }
		// 83358 In block edit all the info icons are displayed at once in stead of on hovering over the field
		hoverAndFocusField(propertyForm);
	},
	/* close the fields */
	iterateFieldsCancel:function(sections){
		for(var i=0; i<sections.length; i++) {
			for(var j=0; j<sections[i].columns.length; j++){
				for(var k=0; k<sections[i].columns[j].fields.length; k++) {
					if(sections[i].columns[j].fields[k] !== undefined){
			            var key = sections[i].columns[j].fields[k].KEY;
			            $req.prop.inlineCancel(key);
			        }
				}
		    }
		}
	},
	/*this Function used For Sectional close the Fields & ondetailCheck : used only when we Cancel edit mode */
	sectionalCancel:function(){
	    this.checkBulkEdit=false;
	    $req.prop.editMode=false;
	    $req.prop.iterateFieldsCancel($req.prop.fieldDetails.sections);
	    /* remove (*) from fields if status is close request */
	    var currStatus = $req.prop.getCurrentStatus();
		$req.prop.hideExtraFields();
	    jQuery('#prop-edit-btn').removeClass('hide');
	    jQuery('#bottom-property-action').addClass('hide');
		jQuery('#PropertyFrame').removeAttr('data-id','formfixedbtn').find('[data-id=form-fixed-wrapper]').css('overflow',''); //NO I18N
		// if($req.details.tab_name !== "properties"){
	 //    	jQuery('#top-property-label').addClass('hide');
	 //    }
	    if(!$req.prop.checkRightPanel && !$req.prop.checkResolutionStatus){
	        $req.prop.setFieldAndFormRules(!$req.prop.fromListview,false);
	    }
	    if($req.prop.checkResolutionStatus){
			$req.prop.checkResolutionStatus = false;
			jQuery('#resolution_status').find('[name="woStatus"]').remove();
		}
		if($req.prop.replyTemplateStatus){
			$req.prop.replyTemplateStatus = false;
		}
		/* hide description box */
		jQuery('#propertyDetailForm [name="description"]').addClass('hide');
		jQuery('#'+$req.prop.element).removeClass('form-edit'); //NO I18n
	},


	/********************* Internal Function ***************************/
	/* this Function create the sectional Json and update it in DB and return the DB message */
	isDataValidated:function(field) {
		var fieldDetails = this.fieldDetails;
	  	this.sectionalUpdateJson = {};
	  	this.checkSGT = false;
	  	this.checkCSI = false;
	  	this.checkNumDecimal = true;
	  	this.udfDBObject = {};
	  	this.checkDate = true;
	  	if(field) {
			var fieldElement = jQuery('#propertyDetailForm [name="'+field+'"]');
			if(fieldElement.length && field !== 'description' && field !== 'subject') {
				$req.prop.populateSectionalJson(fieldElement, field);
			}
			if(!this.checkNumDecimal ||!this.checkDate) {
	        	return false;
	        }
	  	} else {
	  		var updatedFields = this.getChangedFields().fields;
		  	for(var i=0; i<fieldDetails.sections.length; i++) {
				for(var j=0; j<fieldDetails.sections[i].columns.length; j++){
					for(var k=0; k<fieldDetails.sections[i].columns[j].fields.length; k++) {
						if(fieldDetails.sections[i].columns[j].fields[k] !== undefined){
				            var val = fieldDetails.sections[i].columns[j].fields[k].KEY;
				            if(!updatedFields.hasOwnProperty(val)) {
				            	continue;
				            }
				            var fieldElement = jQuery('#propertyDetailForm [name="'+val+'"]');
				            if(fieldElement.length && val !== 'description' && val !== 'subject' ){
				                $req.prop.populateSectionalJson(fieldElement,val);
				            }
				        }
				        if(!this.checkNumDecimal || !this.checkDate) {
				        	return false;
				        }
					}
			    }
			}
	  	}

	    /* description content */
	    if(parent.description_editor && description_editor.isEmpty()==false){
	    	this.sectionalUpdateJson.description = description_editor.getHTML();

	    } else if(this.description) {
	    	this.sectionalUpdateJson.description = this.description;
		}
		if(this.replyTemplateStatus && this.resolution){
			this.sectionalUpdateJson.resolution = this.resolution;
		}
		if(this.rlc_notes){
			this.sectionalUpdateJson.note_comments = this.rlc_notes;
		}
	    return true;
	},
	/*this Function create the Sectional Json For update in the Database */
	populateSectionalJson:function(fieldElement,fieldId) {
		var field_info = this.getFieldMetaInfo(fieldId);
	    var display_type = field_info ? field_info.display_type : undefined;
	    var type = field_info ? field_info.type : undefined;
	    switch(type) {
	        case 'multi_select': //NO I18N
	        	if (display_type === "CheckBox") {
	        		var value = [];
		        	fieldElement.each(function() {
		        		if(jQuery(this).is(":checked")) {
		        			if(jQuery(this).val() != "undefined"){
                                value.push({"id":jQuery(this).val()});
                            }
		        		}
		        	});
		        	if(fieldId.indexOf("udf_") !== -1) {
		                this.udfDBObject[fieldId] = value;
		            } else {
		                this.sectionalUpdateJson[fieldId] = value;
		            }
	        	} else {
	        		if(fieldId === 'assets') {
		                var value = jQuery('#selectedCIs').val();
		                //convert String into Array
		                var valueArray = JSON.parse("[" + value + "]");
		                var dataJson = [];
		                //create array of object update For DataBase
		                for(var j=0,jlen=valueArray.length; j<jlen; j++) {
		        	        var obj = {};
		        	        obj = { "id": valueArray[j] };
		        	        dataJson.push(obj);
		                }
		                this.sectionalUpdateJson.assets=dataJson;
		            } else if(fieldId === 'space') { //No i18n
						var valueArray = fieldElement.select2("val"); //No I18N
						var dataJson = [];
						for(var j=0,jlen=valueArray.length; j<jlen; j++) {
		        	        var obj = {};
		        	        obj = { "id": valueArray[j] };
		        	        dataJson.push(obj);
		                }
		                this.sectionalUpdateJson.space=dataJson;
					}else if(fieldId === 'configuration_items') { //No i18n
						let valueArray = fieldElement.select2("val"); //No I18N
						let dataJson = [];
						for(let j=0,jlen=valueArray.length; j<jlen; j++) {
		        	        let obj = {};
		        	        obj = { "id": valueArray[j] };
		        	        dataJson.push(obj);
		                }
		                this.sectionalUpdateJson.configuration_items=dataJson;
		            }
		            else if (fieldId === 'email_ids_to_notify'){ //No i18n
						var valArr=[];
						fieldElement.select2("val").each(function(idValue){ //No I18N
					            valArr.push(idValue);
						}); 
						this.sectionalUpdateJson[fieldId] = valArr;
					} 
					else {						
		                var valueId = [];
		                fieldElement.select2("data").each(function(idValue){ //No I18N
					            valueId.push({"id":idValue.id});
					        }); 
		                if(fieldElement.attr("data-dynamic-options") === "true"){
			                //not using select2("val"), as it breaks for dynamic loading fields, which have commas in the options
			                valueId = [];
					        fieldElement.select2("data").each(function(ele){ //No I18N
					            valueId.push({"id":ele.id});
					        });
					    }
		                if(valueId === "" || valueId === null) {
		                	valueId = [];
		                }
		                if(fieldId.indexOf("udf_") !== -1) {
		                    this.udfDBObject[fieldId] = valueId;
		                } else {
		                    this.sectionalUpdateJson[fieldId] = valueId;
		                }
		            }
	        	}
	            break;

	        case 'datetime': //NO I18N
	            var value = jQuery('#'+fieldId+'_IN').val();
	            if(fieldId === 'due_by_time' || fieldId === 'created_time') {
	            	$req.prop.checkDateValidation(fieldId,value);
	            }
	            if(this.checkDate && value !== undefined && value !== '') {
	        	    if(fieldId.indexOf("udf_") !== -1) {
	                   this.udfDBObject[fieldId] = {"value":value};
	                } else {
	                    this.sectionalUpdateJson[fieldId] = {"value":value};
	                }
	            } else if(this.checkDate) {
	            	if(fieldId.indexOf("udf_") !== -1) {
	                   this.udfDBObject[fieldId] = null;
	                } else {
	                    this.sectionalUpdateJson[fieldId] = null;
	                }
	            }
	            break;

	        case 'lookup': //NO I18N
	    	    if((fieldId ==='technician' || fieldId==='group' || fieldId==='site') && !this.checkSGT) {	//No I18N
	                $req.prop.createSGTUpdateObject();
	                this.checkSGT = true;
	    	    } else if((fieldId ==='item' || fieldId ==='category' || fieldId ==='subcategory') && !this.checkCSI) {	//No I18N
	                $req.prop.createCSIUpdatedObject();
	                this.checkCSI = true;
	    	    } else if(this.dependentField.indexOf(fieldId) === -1) {
	    		    var keyId = fieldElement.val();
	                if(keyId === '0') {
	            	    keyId = null;
	                }
	                if(fieldId.indexOf("udf_") !== -1) {
	                    if(keyId && keyId!=null){
							this.udfDBObject[fieldId] = {"id":keyId} ;
						}
						else{
							this.udfDBObject[fieldId] = null;
						}
	                } else if(fieldId.indexOf("closure_") !== -1) {
	                	var cur_status = jQuery('[data-field=STATUS]').length > 0 ? jQuery('[data-field=STATUS]').val() : $req.details.request_info.status.id;
	                	cur_status = parseInt(cur_status);
	                    if(Object.keys($req.prop.closure_info.closure_code).length || (cur_status !== parseInt($req.details.operational_data.close_status_id) && cur_status !== parseInt($req.details.operational_data.resolved_status_id))) {
	                    	break;
	                    } else if(keyId === null) {
	                        this.closure_info.closure_code = null;
	                    } else {
	                        this.closure_info.closure_code = {id:keyId};
	                    }
	                } else if(keyId !== null) {
	                    this.sectionalUpdateJson[fieldId] = {"id":keyId};
	                } else {
	                	this.sectionalUpdateJson[fieldId] = null;
	                }
	    	    }
	            break;

	        case 'multi_line': //NO I18N
	    	    var value = fieldElement.val();
	            if(fieldId.indexOf("udf_") !== -1) {
	      	        if(value === ''){
	      	        	this.udfDBObject[fieldId] = null;
	      	        } else {
	      	        	this.udfDBObject[fieldId] = value;
	      	        }
	            } else if(fieldId.indexOf("closure_") !== -1) {
	            	var current_status = jQuery("#propertyDetailForm [name='status']").length > 0 ? jQuery("#propertyDetailForm [name='status']").val() : $req.details.request_info.status.id;
	                if(Object.keys($req.prop.closure_info.closure_comments).length || ((parseInt(current_status) !== parseInt($req.details.operational_data.close_status_id)) && (parseInt(current_status) !== parseInt($req.details.operational_data.resolved_status_id)))) {
	                    break;
	                } else if(value === '') {
	            		this.closure_info.closure_comments = null;
	            	} else {
	                	this.closure_info.closure_comments = value;
	            	}
	            } else {
	                if(value === '') {
	                	this.sectionalUpdateJson[fieldId] = null;
	                } else {
	                    this.sectionalUpdateJson[fieldId] = value;
	                }
	            }
	            break;

	        case 'long': //NO I18N
	    	    var value = fieldElement.val();
	    	    if(value==='') {
	    	    	value = null;
	    	    }
	    	    if(jQuery.isNumeric(value) || value === null) {
	    		    if(fieldId.indexOf("udf_") !== -1){
	                    this.udfDBObject[fieldId] = value;
	                } else {
	                    this.sectionalUpdateJson[fieldId] = value;
	                }
	    	    } else {
	    		    alert(getMessageForKey('sdp.inventory.contract.msg1'));
	    		    fieldElement.focus();
	    		    this.checkNumDecimal = false;
	    	    }
	            break;

	        case 'double': //NO I18N
	    	    var value = fieldElement.val();
	    	    var numericalVal = null;
	    	    if(value===''){
	    	    	value = null;
	    	    } else {
	    	    	numericalVal = value.indexOf(".") > -1 ? value.substr(0, value.indexOf(".")) : value;
	    	    }
	    	    if(value === null || (jQuery.isNumeric(value) && numericalVal.length <= 13)) {
	    		    var number = Number(value);
	    		    if(fieldId.indexOf("udf_") !== -1) {
	                    this.udfDBObject[fieldId] = number.toString();
	                } else {
	                    this.sectionalUpdateJson[fieldId] = number.toString();
	                }
	    	    } else {
	    		    alert(getMessageForKey('sdp.jserror.requestcustomdecimalfields'));
	    		    fieldElement.focus();
	    		    this.checkNumDecimal = false;
	    	    }
	            break;
	        case 'string': //NO I18N /* Radio button type is coming as type 'string' */
	        	if(display_type === "Radio") {
		        	var value = jQuery('#propertyDetailForm input[name="'+fieldId+'"]:checked').val()||null;
		            this.udfDBObject[fieldId] = {"id":value};
		            break;
	        	} else if(fieldId.indexOf("closure_") > -1) {
	        		var value=fieldElement.val();
	        		this.closure_info[fieldId] = value;
	        		break;
	        	}

	        default:
	            if(this.nonSelectedField.indexOf(fieldId) === -1){
	                var value=fieldElement.val();
	                if(value!==undefined){
	                    if(fieldId.indexOf("udf_") !== -1){
	                        this.udfDBObject[fieldId] = value;
	                    }else{
	                        this.sectionalUpdateJson[fieldId] = value;
	                    }
	                }
	            }
	    }
	},

	/** Resolution content, attachments, inline images, associated solution ids - to update request json  */
	addResolutionInfo: function() {
		var resol_form = jQuery('form[name="addResolutionForm"]');
		if(resol_form.length === 0) {
			return;
		}

		var associated_solution_ids = [];
		var add_to_linked_requests = null;

		/** Including added attachments data */
		var res_attachments = [];
		var attachContainer = typeof resAttachInstance === "undefined" && resAttachInstance.selector ? resAttachInstance.selector : resol_form.find("#attachfiles");	//No I18N
		attachContainer.find("button").each(function(){	//No I18N
			var id = jQuery(this).data("attach-id");	//No I18N
			if(id) {
				res_attachments.push({
					id: id
				});
			}
		})

		/** Including associated solutions info */
		var asso_id;
		resol_form.find("[name='solutionID']").each(function(index, element) {
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

		// #83227 Append <br> to the editor content manually when it is saved first time
		parent.resolution_editor && resolution_editor.setHTML(resolution_editor.getHTML());
		var resolution_info = {
			"content": parent.resolution_editor && resolution_editor.getHTML()	//No I18N
		};
		resolution_info.resolution_attachments = res_attachments;
		if(associated_solution_ids.length > 0) {
			resolution_info.associated_solution_ids = associated_solution_ids;
		}
		if(add_to_linked_requests !== null) {
			resolution_info.add_to_linked_requests = add_to_linked_requests;
		}
		this.sectionalUpdateJson.resolution = resolution_info;
	},

	cancelResolution: function(tab, event) {
		cancelResolution();
		if(tab === "resolution") {
			var closeResol = callToSolutionsTab('tab1');	//No I18N
			if(closeResol === false) {
				/** when the resolution is canceled with the empty resolution content, move to the Details tab if previous resolution is none, else refresh the Resolution tab */
				if(jQuery('.sdtab-content #ze_HTMLDesc_Focus').is(':visible')  && getResolnDescription() == "") {
					if($req.details.request_info.resolution != null) {
						$req.details.changeTab(tab, undefined, event);	//No I18N
					} else {
						$req.details.changeTab("details", undefined, event);	//No I18N
					}
				}
				return false;
			}
			jQuery("html, body").animate({
				scrollTop: (jQuery("#req-details-body").offset().top - 60) + "px"	//No I18N
			}, 0);
		} else if(tab === "details") {	//No I18N
			$req.details.changeTab("details", undefined, event);	//No I18N
		} else {
			$req.details.changeTab($req.details.tab_name, undefined, event);
		}

		/** Checks if the execution of this event has been prevented before itself.
		 *  JS event has this information in the property "defaultPrevented"
		 *  jQuery event has it in the function "isDefaultPrevented"
		 */
		if(event && (event.defaultPrevented || (event.hasOwnProperty("isDefaultPrevented") && event.isDefaultPrevented()))) {
			return false;
		}
		/** resets the background status update info */
		this.resetStatusFields();
		this.description = null;
        description_editor=null;
		resolution_editor=null;
		if(this.checkBulkEdit) {
			$req.prop.renderForm();
		}
	},

	resetStatusFields: function() {
		this.onhold_scheduler = {};
		this.closure_info = {};
		$req.details.status_mandate = {};
		this.fcrUpdateJson = "";
		this.status_change_comments = "";
	},

	/** check Technician conflict */
	validTechChange: function(selected_tech) {
    	if($req.details.request_info.is_service_request && $req.details.template_info.approval_configurations && $req.details.template_info.approval_configurations.assign_tech_after_approve && !$req.details.request_info.technician && selected_tech && ($req.details.request_info.approval_status && $req.details.request_info.approval_status.name !== "Approved")) {
    		if(!window.confirm(getMessageForKey("sdp.request.autoapproval.techwarning"))) {
    			return false;
    		}
    	}
    	if(!assignTechCheck(null, $req.details.request_info.id,  $req.prop.fromListview ? "WOListView" : "Details")) {
    		$req.prop.cancelRightPanelTechnician();
            $req.details.updateRequestTemplates('assign_technician');	//No I18N
    		return false;
    	}
    	return true;
	},

	/* this Function Check first Response date shold less than due by date */
	checkDateValidation:function(fieldId,timeValue){
	    var fr_dueByTime = jQuery('#first_response_due_by_time_IN');
	    var fr_value = '';
	    if(fr_dueByTime.length){
	        fr_value = fr_dueByTime.val();
	    }else if(Object.keys($req.details.request_info.first_response_due_by_time).length){
	    	fr_value = $req.details.request_info.first_response_due_by_time.value;
	    }
	    if(fieldId === 'due_by_time' && timeValue !== '' && fr_value !== '' && timeValue < fr_value ){
	    	alert(getMessageForKey("sdp.request.fr_duetime.error"));
	    	this.checkDate = false;
	    }else if(fieldId ==='created_time' && fr_value !== "" && timeValue > fr_value){ //NO I18N
	    	alert(getMessageForKey("sdp.request.fr_createdtime.error"));
	    	this.checkDate = false;
	    }
	},
	/* this function fix the scroll size */
	fixedformresizescroll:function (wrapper, btn, fixedwrapper, innerhgt) {
		jQuery(window).on('resize', function() {
	        if(btn.is(':visible')) {
	        	$req.prop.fixedform(wrapper,btn,fixedwrapper,innerhgt);
	        }
	    });
	    jQuery(window).on('scroll', function() {
	        if(btn.is(':visible')) {
	        	$req.prop.fixedform(wrapper,btn,fixedwrapper,innerhgt);
	        }
	    });
	},
	/* this function fix the form */
	fixedform:function (wrapper, btn, fixedwrapper, innerhgt) {
		/*var jW = jQuery(window);
		var actionPanelBtm = wrapper.offset().top + wrapper.height() + 40 - jW.scrollTop() - jW.height();
		if(actionPanelBtm >= 0 && actionPanelBtm < wrapper.height()) {
			var leftPos = wrapper.offset().left - jW.scrollLeft();
			if(btn.css("position") !== "fixed" && btn.css("left") !== leftPos+"px") {
				btn.css({"position":"fixed", "bottom": "0px", "left":leftPos+"px", "width":wrapper.width()});	//No I18N
			}
		} else {
			btn.css({"position":"relative", "bottom": "0px", "left":"0px", "width":"auto"});	//No I18N
		}*/
		var options = {};
		if(!$req.layout.show_rpanel && $req.details.rlc.isEnabled && $req.layout.rlc_position == "bottom"){
			options.extraBottom = jQuery("#rlc-section").height();
		}
		else{
			options.extraBottom = 0;
		}
		fixedformfooter(jQuery(wrapper).get(0),jQuery(btn).get(0),options);
	},
	/* this function return the current status */
	getCurrentStatus:function(){
		if(!$req.prop.status || ($req.prop.status && !$req.prop.status.length )){
		    //SD-118310 The WoID was not passed here before and so retaining the same behavior.
		    //Need to check the impact areas and pass the woID here.
	        $req.details.getStatusJson();
		}
		var closedStatusId = parseInt($req.details.operational_data.close_status_id);
	    var resolveStatusId = parseInt($req.details.operational_data.resolved_status_id);
	    var inactiveList = $req.details.operational_data.status_stop;
	    var additionalCloseStatus = $req.details.operational_data.closed_resolved_status;
	    var statusId = jQuery('#propertyDetailForm [name="status"]').val();
	    if(statusId === undefined){
			statusId = $req.details.request_info.status.id;
		}
		statusId = parseInt(statusId);
	    if(closedStatusId === statusId || additionalCloseStatus.indexOf(statusId) !== -1){
	        return 'Closed'; //NO I18N
	    }else if(resolveStatusId === statusId){
	        return 'Resolved'; //NO I18N
	    }else if(inactiveList.indexOf(statusId) !== -1){
	        return 'Onhold'; //NO I18N
	    }else{
	        return 'Open'; //NO I18N
	    }
	},
	/* this Function set Field and form Rules */
	setFieldAndFormRules:function (onDetailPage, skipOnload){
	    var module = $req.details.template_module;
	    var templateId = $req.details.request_info.template.id;
	    var tasksObj={};
	    var rulesObj = this.rulesObj;
	    /* this api call fetch the template Fields Json */
	    if(Object.keys(rulesObj).length !== 0 ){
	        if(!this.didFetchFieldsObj){
	        	var fafrurl= '/servlet/SDAjaxServlet?';	// variable introduced for modifying URL for MSP/SCP	//NO I18N
	        	if(isMSP){
					fafrurl = $req.prop.getModfiedURLForMSP();
	        	}
	            jQuery.ajax({
	                url: fafrurl+'action=getFieldJson&module='+module+'&templateId='+templateId, //NO I18N
	                type: 'GET',  //NO I18N
	                cache: false,
	                async: false,
	                success: function(data){
	                    $req.prop.fieldsObj = data;
	                }
	            });
	            this.didFetchFieldsObj = true;
	        }
	        /*this Api Call fetch the Resource Json */
	        if(module==='SERVICE'){
	        	if(!this.didFetchResourceObj){
	                jQuery.ajax({
	                    url:'/servlet/SDAjaxServlet?action=getResourceJson&woID='+woID, //NO I18N
	                    type: 'GET', //NO I18N
	                    cache: false,
	                    async: false,
	                    success: function(data){
	                        $req.prop.resourceObj = data;
	                    }
	                });
	                this.didFetchResourceObj = true;
	            }
	        }
	    }
	    //Resource WorkOrderForm object
	    $se.resourcesObj=jQuery('#resEditForm');
	    //WorkOrderForm object
	    $se.formObject=jQuery('#PropertyFrame');
	    $se.module=module;
	    //contain rules Object
	    $se.rules=rulesObj;
	    //fields details
	    $se.fieldsJson = $req.prop.fieldsObj;
	    //this functions removes special characters from field details object
	    $se.removeSpecialCharFromFields();
	    //resource details
	    $se.resources = $req.prop.resourceObj;
	    //this function is used to add data-field attributes to resources
	    $se.addDataFieldAttrToResources();
        if($req.details&&$req.details.udf_mapping_names){
            $se.udf_mapping_names=$req.details.udf_mapping_names
        }
        if($req.details&&$req.details.refer_fields){
            $se.refer_fields=$req.details.refer_fields;
        }
	    //$se.fieldsJson = jQuery.extend({},fieldsObj,resourceObj);
	    //this module implementation exposes field properties
	    $se.fieldsJson = fieldDetailsFunction($se.fieldsJson); //1106
		if(skipOnload!=true){ //template fields are mandated in fafr "skipOnload" is to remove in popup
			$se.isAttachmentMandate = undefined; //84822 Used for mandating the attachments
	    	$CS.mandateField($req.prop.fafr_mandate);
	    }
	    $req.prop.resetUserDetails();
	    //Added Rule in Form
	    if(!$req.prop.checkBulkEdit && onDetailPage) {
	    	$se.onDetailPage = true;
	    	$CS.hideUnansweredFields(["resources"]);
	        $req.prop.setonDetailPageRule();
	    }else{
	    	$se.onDetailPage = false;
	    	$se.isInlineView = true;
	    	$se.addRulesToForm(skipOnload);
	    }
	},
	getModfiedURLForMSP:function(){
		var accountId = !jQuery.isEmptyObject($req.details.request_info.account) ? $req.details.request_info.account.id : getAccountId();
		return '/servlet/SDAjaxServlet?ruleAccount=' + accountId + '&woID=' + woID + '&'; // NO I18N
	},
	resetUserDetails:function(fromPageScript){
		var requesterId = $req.details.request_info.requester.id;
	    if((Object.keys($se.rules).length !== 0 && woID != $req.prop.woId)||(fromPageScript && requesterId !=$se.requesterDetails.id)){
	        $se.getUserDetails(requesterId);
	        $req.prop.woId=woID;
	    }
	},
	/* this function execute the onDetailPages Rules */
	setonDetailPageRule:function(){
	    jQuery(document).ready(function(){
	        var onPageDetail=$req.prop.rulesObj.ondetails_page;
	        if(onPageDetail){
	            for(var i=0,len=onPageDetail.length;i<len;i++){
	                var criterias = onPageDetail[i].CRITERIAS;
	                if(!criterias.length||parent.$se.isCriteriaMatched(criterias)){
	                  parent.$se.invokeAction(onPageDetail[i]);
	                }
	            }
	        }
	    });
	},
	/* display the Description fields */
	showDescriptionField:function(){
		//Not to rerender for secong time
		if(!jQuery('#ze_HTMLDesc').length){
			jQuery('#propertyDetailForm [name="description"]').removeClass('hide');
		    zeditor({element:'HTMLDesc',customName:"description_editor",inlineimagesAPI:"api/v3/requests/images"});//No i18n
		}
		jQuery('#ze_HTMLDesc').find('.ze_area').contents().find('.ze_body').css("background-color","#fff1db"); //NO I18N
	    window.scrollTo(0,document.body.scrollHeight);
	    setTimeout(function(){
	        jQuery('#ze_HTMLDesc').find('.ze_area').contents().find('.ze_body').css("background-color","");  //NO I18N
	    },2000);
	},
	getMandateFields:function(){
		var fields=[];
		if(Object.keys($se.rules).length==0){//without fafr fields should consider the template mandatoryFieldJson
			fields=jQuery.extend([],$req.prop.mandatoryFieldJson,[]);
		}
		$req.prop.wizard.toStatus=parseInt($req.prop.wizard.toStatus||$CS.getValue("STATUS")||$req.details.request_info.status.id)//No i18n
	    // Status Mandatory Fields from api call
	    if($req.details.status_mandate[$req.prop.wizard.toStatus]) {
			fields =fields.concat($req.details.status_mandate[$req.prop.wizard.toStatus].fields);
		}
		//While throwing server error you need to handle extra field in mandatory json
		// if($req.prop.wizard.extraFields) {
		// 	fields =fields.concat($req.prop.wizard.extraFields);
		// }
		var form=jQuery("#propertyDetailForm");//fafr fields are mandated in popup
		for(var i=0;i<fields.length;i++){
			var id=form.find("[name="+fields[i]+"]").attr("data-field");
			if(Object.keys($se.rules).length!=0 && !$CS.isVisible(id)){
				$CS.showField(id);
			}
		}
		var form=jQuery("#propertyDetailForm");//fafr fields are mandated in popup
		for(var i=0;i<$req.prop.fafr_mandate_keys.length;i++){
			if(form.find("[data-field='"+$req.prop.fafr_mandate_keys[i]+"']").attr("name")){
				fields.push(form.find("[data-field='"+$req.prop.fafr_mandate_keys[i]+"']").attr("name"));
			}
		}
    	fields=fields.filter(function (item, pos) {return fields.indexOf(item) == pos});
    	return fields;
	},
	/* check mandatory fields for bulk edit */
	mandate_fields_exsists:function(){
		fields=$req.prop.getMandateFields();
		var mandate = [];
	    $req.prop.wizard.needToFill={data:[],text:""};
	    if(fields !== undefined && fields.length){
			isEditorEmpty = function(editor) {
				if (editor) {
					return (jQuery(editor).text().trim() === "" // Plain string trim
						&& editor.innerText.trim() === "" // Plain string trim
						&& jQuery(editor).find("img").length === 0 // Editor contains image
						&& jQuery(editor).text().replace(/\u200B/g, "").trim() === "" // Editor contains only the empty space
					)
				}
			};
	        /* Description */
		    if(fields.indexOf('description') !== -1 ){
		    	var orig_desc=jQuery("<div>"+($req.details.request_info.description||" ")+"</div>")[0];
		    	var descEditor = jQuery('#ze_HTMLDesc').find('.ze_area').contents().find('.ze_body')[0];
			    if(isEditorEmpty(orig_desc) && (typeof isEditorEmpty(descEditor) == "undefined" || isEditorEmpty(descEditor)) && !this.description) {
				    $req.prop.wizard.needToFill.data.push("description");
		    		$req.prop.wizard.needToFill.text+=" "+getMessageForKey("sdp.common.description")+",";//No i18n
		    		mandate.push("description");
			    }
			}
		    if(fields.indexOf("resolution")!==-1)
	        {
	        	var orig_resc=jQuery("<div>"+($req.details.request_info.resolution.content||" ")+"</div>")[0];
		    	/**
	        	 * SD-77815: While opening the closure popup, if the Resolution editor is not yet initialized,
	        	 * the content will be taken from the Resolution for the mandatory validation
	        	 */
	        	var resEditor = jQuery('#ze_HTMLDesc_Focus').find('.ze_area').contents().find('.ze_body')[0];
	        	if(this.wizard.isEnabled && jQuery('#ze_HTMLResolution').find('.ze_area').contents().find('.ze_body').length > 0) {
	        		resEditor = jQuery('#ze_HTMLResolution').find('.ze_area').contents().find('.ze_body')[0];
	        	}

			    if(isEditorEmpty(orig_resc) && (typeof isEditorEmpty(resEditor) == "undefined" || isEditorEmpty(resEditor)) && !this.resolution) {
				    $req.prop.wizard.needToFill.data.push("resolution");
		    		$req.prop.wizard.needToFill.text+=" "+getMessageForKey("common.resolution")+",";//No i18n
		    		mandate.push("resolution");
			    }
	        }
	        var mandatoryException = ['description','resolution','tasks','timespent','checklists']; //NO I18N
	        if($req.details.template_module === 'SERVICE') {
	        	mandatoryException.push('service_category');
	        }

	        $req.prop.highLightFields = [];

	        /** In case of updating from the resolution tab, the allowed values might have not been loaded yet */
	        if(!Object.keys($req.details.allowedValues).length) {
		    	$req.details.getAllowedValues();
		    }
		    for(var i=0, ilen = fields.length; i<ilen; i++) {
			    if(mandatoryException.indexOf(fields[i]) === -1 ) {
			    	var fieldControl = jQuery('#'+fields[i]+'_control');
			    	if(fieldControl.length > 0 && fieldControl.find('[name="'+fields[i]+'"]').length > 0) {
		                var fieldElement = fieldControl.find('[name="'+fields[i]+'"]');
		                var id = fieldElement.attr('data-field');
		                if(fieldElement.length) {
			                var value = fieldElement.val();
			                var field_info = this.getFieldMetaInfo(fields[i]);
			                var type = field_info ? field_info.type : undefined;
			                var display_type = field_info ? field_info.display_type : undefined;
			                if(display_type==='multicheckbox' || display_type==='CheckBox' || display_type==='Radio'){
								value=null;
					            fieldElement.filter(function(){return jQuery(this).prop('checked');}).each(function(){//NO I18N
					                value=jQuery(this).val();
					            });
					        }else if(display_type === "MultiSelect"){ //No I18N
					        	var valuesArray = fieldElement.select2("data"); //No I18N
					        	for(var j=0; j<valuesArray.length; j++){
					        		valuesArray[j] = valuesArray[j].id;
					        	}
					        	value = valuesArray;
					        }
					        if(value==null && type === 'lookup'){
					        	continue;
					        }
			                if(!value || value === '' || (type === 'lookup' && value === '0') || (display_type === 'Radio' && value === '0') || (Array.isArray(value) && value.length === 0)) {
	                            mandate.push(" "+field_info.display_name);
	                            $req.prop.wizard.needToFill.data.push(fields[i]);
		    					$req.prop.wizard.needToFill.text+=" "+e_html(field_info.display_name)+",";
	                            $req.prop.highLightFields.push(id);
			                }
		                }
		            } else {
		        	    var value = '';
		        	    /** when priority matrix is enabled, the value should be checked in priorityMatrix element */
		        	    if(fields[i] === "priority" && jQuery("#priorityMatrix").val()) {
		        	    	value = jQuery("#priorityMatrix").val();
		        	    	value = value && value !== "0" ? value : null;
		        	    } else {
		        	    	if(fields[i].indexOf('udf') !== -1) {
		                        value = $req.details.request_info.udf_fields[fields[i]];
			        	    } else {
		                        value = $req.details.request_info[fields[i]];
			        	    }
		        	    }
		        	    if(value == null || value == '0.00' || (value.length == 0 )|| (Object.keys(value).length === 0)) {
		        	    	var id = jQuery('[data-name='+fields[i]+']').attr('fafr-name');
		        	    	if(id !== undefined) {
                                var isReferUDF = false;
                                var fieldTitle="";
                                if(id.indexOf("udf_") > -1){
                                    isReferUDF=$req.details.meta_info.fields.udf_fields.fields[id].lookup_entity != "request_option";
                                }
                                if(isReferUDF) { //For Refer UDF fields, we will not be passing allowed values on load. Therefore title should be fetched from MetaInfo.
                                    fieldTitle=$req.details.meta_info.fields.udf_fields.fields[id].display_name;
                                }
                                else{
                                    fieldTitle=$req.details.allowedValues[id].TITLE;
                                }
			        	        mandate.push(" "+fieldTitle);
			        	        $req.prop.wizard.needToFill.data.push(fields[i]);
		    					$req.prop.wizard.needToFill.text+=" "+e_html(fieldTitle)+",";
		    					$req.prop.highLightFields.push(id);
			        	    }
		            	}
		        	}
		    	}
		    }
	    }
	    mandate = jQuery.grep(mandate, function(value) {
          if(["tasks","checklists","worklog","depends_on_requests"].indexOf(value)==-1){
            return true;
          }
          return false;
        });
	    $req.prop.wizard.needWizard=mandate.length
	    return !mandate.length;
	},
	/* set mandate (*) in status close request mandatory fields */
	setMandatoryField:function(field) {
	    function addCloseMandatory(field) {
	    	 var fieldElement = jQuery('[data-name='+field+']');
    	    if(fieldElement.length){
    	    	if(fieldElement.parents('.fafr-row').eq(0).find('.mandatory').length <= 0) {// adding mandatory class instead of close / update classes
    	    		//fieldElement.parents('.fafr-row').eq(0).find('.mandatory').addClass('close-mandatory');	//No I18N
    	    		fieldElement.parents('.fafr-row').eq(0) //NO I18N
                                .find('.fafr-label em').remove().end()
                                .find('.fafr-label').prepend('<span class="mandatory">*</span>');//close-mandatory is removed (Need to check)
    	    	}
    	    }
	    }
	    var fields =$req.prop.mandatoryFieldJson;
	    if(typeof field =="string") {
	    	addCloseMandatory(field);
	    } else
	    {
	    	if(typeof field =="object")
	    	{
	    		fields=field;
	    	}
		    if(fields !== undefined){
		    	for(var i=0,ilen = fields.length;i<ilen;i++){
		    	   addCloseMandatory(fields[i]);
		        }
		    }
	    }
	},
	showFields:function(fields){
		jQuery("#propertyDetailForm").find(".form-section").removeClass('hide');
		jQuery("#propertyDetailForm").find(".col-group").removeClass('hide');
		jQuery("#propertyDetailForm").find("[data-name='section_name']").removeClass('hide');
		jQuery("#propertyDetailForm").find(".col-fields").addClass('hide');
		for(var i=0;i<fields.length;i++){
			jQuery("#propertyDetailForm").find("[data-name='"+fields[i]+"']").parents(".col-fields").removeClass('hide');//No i18n
		}
		jQuery("#propertyDetailForm").find(".form-section").each(function(index, el) {
				jQuery(el).find(".col-group").each(function(index, el) {
					if(!jQuery(el).find(".col-fields").not(".hide").length){
						jQuery(el).addClass('hide');
					}
				});
				if(!jQuery(el).find(".col-group").not(".hide").length){
					jQuery(el).addClass('hide');
					jQuery(el).prev("[data-id='section_name']").addClass('hide');//No i18n
				}
		});
	},
	/* return script for the right panel save close button */
	getRightPanelCloseButton:function(fieldName){

		var saveButton = "";
		let buttonEle =	jQuery('<div class="spot-form colon hide"><div class="control-holder"></div><div class="spot-actions"></div> </div>');
		let cancelButton = jQuery('<button type="button" class="btn btn-sm btn-link" title="'+getMessageForKey("sdp.common.cancel")+'"> <span class="spot-icon failure icon-xs"></span> </button> ');
		cancelButton.off('click').on('click',(event)=>{
			$req.prop.renderForm();
		})
		if(fieldName!="priority" || Object.keys($se.rules).length) {
			saveButton = jQuery('<button type="button" id="saveStatusButton" class="btn btn-sm btn-link" title="'+getMessageForKey("common.save")+'"> <span class="spot-icon success mr5"></span></button> ');
			saveButton.off('click').on('click',(event)=>{
                $req.prop.inlineSave(fieldName);
				return false;
			});
			buttonEle.find('.spot-actions').append(saveButton); saveButton.after(cancelButton);
		}
		else{
			buttonEle.find('.spot-actions').append(cancelButton);
		}
	    return buttonEle;
	},
	/* this Function call Calender */
	inlineCalendar:function(fieldId) {
	    var jserror1 = getMessageForKey("sdp.requests.newrequest.jserror1");
	    var isCatalog = $req.details.request_info.is_service_request;
	    if(fieldId === 'created_time') {
	    	var due_by_time = jQuery("#due_by_time_IN")[0];
	    	if(!due_by_time && jQuery("[data-name='due_by_time']").length > 0) {
				this.setInlineEdit('due_by_time');	//No I18N
				due_by_time = jQuery("#due_by_time_IN")[0];
				this.inlineCancel('due_by_time');	//No I18N
			}
	    	initCalendar('created_time_IN', null, null, null, null, checkValidDate, window,[jQuery('#created_time_IN')[0], due_by_time, jserror1] ); //NO I18N
	    } else if(fieldId === 'due_by_time') {	//No I18N
			var created_time = jQuery('[data-field=CREATEDDATE')[0];
			var first_res = jQuery("#first_response_due_by_time_IN")[0];
			if(!created_time && jQuery("[data-name='created_time']").length > 0) {
				this.setInlineEdit('created_time');	//No I18N
				created_time = jQuery('[data-field=CREATEDDATE')[0];
				this.inlineCancel('created_time');	//No I18N
			}
			if(!first_res && jQuery("[data-name='first_response_due_by_time']").length > 0) {
				this.setInlineEdit('first_response_due_by_time');	//No I18N
				first_res = jQuery("#first_response_due_by_time_IN")[0];
				this.inlineCancel('first_response_due_by_time');	//No I18N
			}
			if(isCatalog) {
	        	initCalendar("due_by_time_IN", null, null, null, null, checkValidDate, window, [created_time, jQuery("#due_by_time_IN")[0], jserror1]); //NO I18N
	      	} else {
	        	initCalendar("due_by_time_IN", null, null, null, null, checkValidFrDate, window, [created_time, first_res, jQuery("#due_by_time_IN")[0], "SLA"]); //NO I18N
	      	}
	    } else if(fieldId==='first_response_due_by_time') {	//No I18N
	    	var created_time = jQuery('[data-field=CREATEDDATE')[0];
			var due_by_time = jQuery("#due_by_time_IN")[0];
	      	if(!created_time && jQuery("[data-name='created_time']").length > 0) {
				this.setInlineEdit('created_time');	//No I18N
				created_time = jQuery('[data-field=CREATEDDATE')[0];
				this.inlineCancel('created_time');	//No I18N
			}
			if(!due_by_time && jQuery("[data-name='due_by_time']").length > 0) {
				this.setInlineEdit('due_by_time');	//No I18N
				due_by_time = jQuery("#due_by_time_IN")[0];
				this.inlineCancel('due_by_time');	//No I18N
			}
	      	initCalendar("first_response_due_by_time_IN", null, null, null, null, checkValidFrDate, window, [created_time, due_by_time, jQuery('#first_response_due_by_time_IN')[0], 'FR_SLA']); //NO I18N
	    } else if(fieldId==='scheduled_start_time' || fieldId==='scheduled_end_time') {	//No I18N
	    	var scheduled_start_time = jQuery('[data-field=SCHEDULEDSTARTTIME]')[0];
	    	var scheduled_end_time = jQuery('[data-field=SCHEDULEDENDTIME]')[0];
	    		if(!scheduled_start_time && jQuery('[data-name=scheduled_start_time]').length > 0) {
	    			this.setInlineEdit('scheduled_start_time');	//No I18N
					scheduled_start_time = jQuery('[data-field=SCHEDULEDSTARTTIME]')[0];
					this.inlineCancel('scheduled_start_time');	//No I18N
	    		}
	    		if(!scheduled_end_time && jQuery('[data-name=scheduled_end_time]').length > 0){
	    			this.setInlineEdit('scheduled_end_time');	//No I18N
					scheduled_end_time =jQuery('[data-field=SCHEDULEDENDTIME]')[0];
					this.inlineCancel('scheduled_end_time');	//No I18N
	    		}
	    	initCalendar(fieldId+"_IN", null, null, null, null, checkValidSchDate, window, [fieldId, scheduled_start_time, scheduled_end_time]); //NO I18N

	    } else{
	    	initCalendar(fieldId+"_IN"); //NO I18N
	    }
		//SD-99683
		setTimeout(function(){
			if(jQuery('#'+fieldId+"_IN").is(":disabled")){ //NO I18N
				try{
						closeCalDialog();
				}catch(e){}
			}
		}, 10);
	},
	/* this function return the date formate for edited select date field */
	getDateFormate:function (val){
	    if(val===0){
	    	return '';
	    }else{
	        var monthArr=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];//NO I18N
	        var value=new Date(val  + getTimezoneDifference(val));
	        var date=value.getDate();
	        var month=value.getMonth();
	        var year=value.getFullYear();
	        var hour=value.getHours();
	        var minuts=value.getMinutes();
	        if(date >=0 && date <10) {
				date = '0' + date; //NO I18N
			}
			if(hour >=0 && hour <10) {
				hour = '0' + hour; //NO I18N
			}
			if(minuts >=0 && minuts <10) {
				minuts = '0' + minuts; //NO I18N
			}
	        var str=date+" "+monthArr[month]+" "+year+", "+hour+":"+minuts+":00";
	        return str;
	    }
	},
	/* Get sorted title value pair jsonarray from jsonobject */
	getTitleValueSortedArray:function(jsonObj, sorted_order, fafrKey) {
	    var resultArr=[], titleValueArr=[];
		var hasNoItem = false;
		if(sorted_order && sorted_order.length > 0) {
			jQuery(sorted_order).each(function(index, item) {
				var obj;

				if(jsonObj.hasOwnProperty(item)) {
					if(jsonObj[item].value){
						obj = {
							VALUE: item,
							TITLE: jsonObj[item].value
						}
					}else{
						obj = {
							VALUE: item,
							TITLE: jsonObj[item]
						}
					}
				}
				if(obj.VALUE === "0"){
					hasNoItem = true;
				}
				if(
					item === "0" &&
					$req.details.allowedValues &&
					$req.details.allowedValues[fafrKey] &&
					$req.details.allowedValues[fafrKey].sorted_order &&
					$req.details.allowedValues[fafrKey].sorted_order.includes(item)
				){
					obj = {
						TITLE: "0",
						VALUE: "0"
					}
				}
				resultArr.push(obj)
			});
			if(!hasNoItem && jsonObj.hasOwnProperty("0")){
				resultArr.unshift({
					TITLE: jsonObj["0"],
					VALUE: "0"
				});
			}
			return resultArr
		}else{

			jQuery.each(jsonObj,function(i,v) {
				/* Resources allowed values contains TITLE as an object with value propety */
				var obj;
				if(v.value) {
					obj = { TITLE: v.value, VALUE: i };
				} else {
					obj = { TITLE: v, VALUE: i };
				}
				if(i!=='0') {
					titleValueArr.push(obj);
				} else {
					resultArr.push(obj);
				}
			});

			var sortedArray=this.sortArrayByTitle(titleValueArr);
			for(var i=0, len=sortedArray.length; i<len; i++) {
				resultArr.push(sortedArray[i]);
			}

			return resultArr;

		}
	},
	/* Sort JSONArray by title */
	sortArrayByTitle:function(inputArray){
	    inputArray.sort(function(a,b) {
	    	return a.TITLE.localeCompare(b.TITLE);
	    });
	    return inputArray;
	},
    resetReplyTemplateStatus() {
    		this.resetStatusFields();
			jQuery("select[name='woStatus']").select2("destroy")//No i18n
			jQuery("select[name='woStatus']").remove();//check
    		jQuery("[name=reply_template_status]").find("[name=viewWOStatus]").empty();
			var statusEle= jQuery("<em class='priority-badge mr5' style='background-color:" + e_attr($req.details.request_info.status.color) + "'>&nbsp;</em>" + e_html($req.details.request_info.status.name) + '<span class="caret ml5"></span>');
    		jQuery("[name=reply_template_status]").find("[name=viewWOStatus]").append(statusEle); //NO I18N
    		jQuery("[name=reply_template_status]").find("[name=viewWOStatus]").addClass("show").removeClass("hide");
    	    this.replyTemplateStatus=false;
    	},
	/* this Function return the string with option allowed Values */
	getFieldOptionsString: function(allowedData, selectedVal, selectedType, sorted_order, fafrKey) {
	    var opt = "";
	    var selected_val_exist = false;
	    var isArray = jQuery.isArray(selectedVal);
	    var mselect_avail_val = [];
	    allowedDataSortArr = $req.prop.getTitleValueSortedArray(allowedData, sorted_order, fafrKey);
	    for(var i=0,ilen=allowedDataSortArr.length;i<ilen;i++){
	        var title = allowedDataSortArr[i].TITLE;
	        var key = allowedDataSortArr[i].VALUE;
	        var costDispValue = '';
	        if(typeof allowedData[key]==='object'){
	        	costDispValue += 'disp-value="'+encodeHTMLAttribute(allowedData[key].value)+'"'; //No I18N
	        	if(allowedData[key].cost && ($req.details.template_info.is_cost_enabled || $req.details.request_info.total_cost)) {
	        		costDispValue += 'cost="'+allowedData[key].cost+'"'; //No I18N
	        	}
	        }

	        if(!isArray) {
	        	/** for json object type selected value, the selection based on the name or id should be provided */
	        	var fieldVal = selectedType === "name" ? title : key;	//No I18N
		        if(allowedData[key].cost && ($req.details.template_info.is_cost_enabled || $req.details.request_info.total_cost)) {
		        	title = title + " - " + sdp_app.CURRENCY_SYMBOL + " " + allowedData[key].cost;
		        }
	        	if(fieldVal === selectedVal) {
	                opt += '<option value=\''+encodeHTMLAttribute(key)+'\' '+costDispValue+' selected=selected>'+e_html(title)+'</option>';
	                selected_val_exist = true;
	    	    } else {
	    		    opt += '<option value=\''+encodeHTMLAttribute(key)+'\' '+costDispValue+'>'+e_html(title)+'</option>';
	    	    }
	        } else {
	            if(selectedVal && selectedVal.indexOf(key) !== -1) {
	                opt += '<option value=\''+encodeHTMLAttribute(key)+'\' '+costDispValue+' selected=selected>'+e_html(title)+'</option>';
	                mselect_avail_val.push(key);
	    	    } else {
	    		    opt += '<option value=\''+encodeHTMLAttribute(key)+'\' '+costDispValue+'>'+e_html(title)+'</option>';
	    	    }
	        }
	    }
	    if(isArray) {
	    	selected_val_exist = selectedVal.length === mselect_avail_val.length ? true : false;
	    }
	    return {
	    	options: opt,
	    	val_exist: selected_val_exist
	    };
	},
	// will set orignial value from metainfo
	setOriginalValue:function(fieldName){
		var val_obj = fieldName.indexOf("udf_") > -1 ? $req.details.request_info.udf_fields : fieldName.indexOf("closure_") > -1 ? $req.details.request_info.closure_info : $req.details.request_info;
    	if(val_obj && val_obj[fieldName]) {
    		var default_val;
    		if(typeof(val_obj[fieldName]) === "object") {
				var fieldVal = val_obj[fieldName].name;
				if(fieldName.includes("udf_")) {
                    fieldVal = (val_obj[fieldName].site && val_obj[fieldName].site.name)?(val_obj[fieldName].name +', '+val_obj[fieldName].site.name):val_obj[fieldName].name;
				}
    			default_val = {
        			id: val_obj[fieldName].id,
        			text: fieldVal
        		}
    		} else if(typeof(val_obj[fieldName]) === "string") {
    			/** for udf picklist --- the value is just the string of the selected value */
    			default_val = {
        			id: val_obj[fieldName],
        			text: val_obj[fieldName]
        		}
    		}
    		jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", default_val);	//No I18N
    	}
	},
	/*set selected Assedts */
	setSelectedAssets:function(){
	    var chosenAssets = [];
	    var assetObject = $req.details.request_info.assets;
	    if(!assetObject) {
	    	return [];
	    }
	    for(var i=0,assetLen = assetObject.length;i<assetLen;i++){
	        assetObject[i].text = assetObject[i].name;
	        chosenAssets.push(assetObject[i]);
	    }
	    return chosenAssets;
	},
	/*set selected Configuration Items */
	setSelectedConfItems:() => {
	    let chosenConfItems = [];
	    let confItemObject = $req.details.request_info.configuration_items;
	    if(!confItemObject) {
	    	return [];
	    }
	    for(let i=0,confItemLen = confItemObject.length;i<confItemLen;i++){
	        confItemObject[i].text = confItemObject[i].name;
	        chosenConfItems.push(confItemObject[i]);
	    }
	    return chosenConfItems;
	},
	/* set the priority matrix value*/
	setPriorityValue:function(){
	    var impact = jQuery('#propertyDetailForm [name="impact"]');
	    var urgency = jQuery('#propertyDetailForm [name="urgency"]');
	    var impact_val, urgency_val;
	    var val ="";
	    var currPriority = jQuery('#priorityMatrix').val();
	    if(impact.length && urgency.length){
	    	impact_val = impact.val();
	    	urgency_val = urgency.val();
	    	var id = impact_val+"##"+urgency_val;
	    	val = $req.details.operational_data.priority_matrix[id];
	    }else if(impact.length){
	        var urgId = $req.details.request_info.urgency;
	        if(urgId !== null && urgId !== undefined){
	        	urgId = urgId.id;
	        }
	        impact_val = impact.val();
	    	urgency_val = urgId;
	        var id = impact_val+"##"+urgency_val;
	        val = $req.details.operational_data.priority_matrix[id];
	    }else if(urgency.length){
	    	var impId = $req.details.request_info.impact;
	    	if(impId !== null && impId !== undefined){
	    		impId = impId.id;
	    	}
	    	impact_val = impId;
	    	urgency_val = urgency.val();
	    	var id = impact_val+"##"+urgency_val;
	    	val = $req.details.operational_data.priority_matrix[id];
	    }
	    var $priorityElement = jQuery('#propertyDetailForm [name="priority"]');
	    if(!val && $req.details.self_service_portal_settings.priority_matrix_techoverride === false) {
	    	val = "0";
	    }
	    if((!urgency_val || urgency_val == "0" || !impact_val || impact_val == "0") && $req.details.self_service_portal_settings.priority_matrix_techoverride === false) {
	    	val = $req.details.request_info.priority ? $req.details.request_info.priority.id : "0";
	    }
	    if($req.details.request_info.hasOwnProperty("priority") && val !== undefined){	//No I18N
	    	/** checking the base json for the presence of the priority field, as it reflects template */
	    	jQuery('#priorityMatrix').val(val);
	    	if(jQuery('#propertyDetailForm [data-name="priority"]').length > 0) {
	    		var priorityVal = null;
	    		if(val == "0") {
	    			priorityVal = getMessageForKey("sdp.common.notassigned");
	    		} else {
	    			priorityVal = $req.details.allowedValues.PRIORITY && $req.details.allowedValues.PRIORITY.AllowedValues ? $req.details.allowedValues.PRIORITY.AllowedValues[val] : ($req.details.request_info.priority ? $req.details.request_info.priority.name : getMessageForKey("sdp.common.notassigned"));
	    		}
	    		if(priorityVal) {
	    			jQuery('#propertyDetailForm [data-name="priority"]').text(priorityVal);
	    		}
				// SD-97020
	    		if($priorityElement.length > 0 && $priorityElement.data("select2")) {
	    			$priorityElement.select2("val", val);     //No I18N
	    		}
	    	}
	    }
	},
	/* this function show the onhold status image */
	setImageOnHoldStatus:function(){
		var statusElement = jQuery('[data-name=status]');
	    var inactiveList = $req.details.operational_data.status_stop;
	    if(inactiveList !== undefined && inactiveList.indexOf(parseInt($req.details.request_info.status.id)) !== -1){
	    	var title = getMessageForKey('sdp.requests.viewrequest.scheduleonhold');
	    	var schedule = $req.details.request_info.onhold_scheduler;
	    	if(schedule !== undefined && schedule !== null && Object.keys(schedule.scheduled_time).length){
	            statusElement.append('<span id="onHoldIcon" class="cspr onhold ml5 vmiddle"  title="'+title+'"></span>');
	    	}else{
	    		statusElement.append('<span id="onHoldIcon" class="cspr icon-sm ml5 vsub reschedule" title="'+title+'"></span>');
	    	}

			statusElement.find('#onHoldIcon').off('click').on('click',(event)=>{
				$req.prop.loadOnHoldBox(event);
				return false;
			});
	    }
	},
	/* this function set the site image */
	setImageSite:function(val){

		if($req.sdp_user.USERTYPE !== 'Requester' && (!$req.details.self_service_portal_settings || $req.details.self_service_portal_settings.show_site)) {
		    var siteDiv = jQuery('[data-name=site]');
	        if(siteDiv.length ){
	    	    jQuery('#siteIcon').remove();
	    	    if(val !=='0'){
	    		    var title = getMessageForKey('sdp.request.viewsite.title');
	    		    siteDiv.append('<span id="siteIcon" class="cspr icon-sm ml5 vsub home1"  align="center" title="'+title+'"></span>');
					siteDiv.find('#siteIcon').off('click').on('click',(event)=>{
                          $req.prop.siteDetails(event,val)
					})
	            }
	        }
	    }
	},
	/* this function show the site Image info */
	siteDetails:function(event,value) {
	    event.stopPropagation();
	    event.preventDefault();
	    var url = '/setup/SiteDetails.jsp'; // NO I18n
	    if(value!= null && value != undefined)
	    {
	            url  = url+"?SITEID="+value+"&WOID="+$req.details.request_info.id; //No I18N
	    }
	    showURLInDialog(url,'position=relative, width=470, title='+getMessageForKey("sdp.admin.organization.sitedetails")); // No I18N
	},
	/* this function add the technician icon */
	setTechnicianIcon: function(value){
		//add icon in Technician
	    if(value !== '0' && $req.sdp_user.USERTYPE !== 'Requester'){
	    	var title = getMessageForKey('sdp.admin.technician.view');
	    	jQuery('[data-name=technician]').append('<span id="technicianIcon" class="cspr icon-sm ml10 flat vsub th-technician" title='+title+'></span>');
			jQuery('[data-name=technician]').find('#technicianIcon').off('click').on('click',(event)=>{
				$req.prop.showProblemTechDetails(event,value)
			})
	    }
	},
	/* this function show the technician icon details */
	showProblemTechDetails:function(event,value) {
	    event.stopPropagation();
	    event.preventDefault();
		// SD-99741
	    window.NewWindow('/setup/UsersPopup.jsp?isUser=false&viewType=mydetails&userId='+value+'&apiModule=requests&apiEntity=technician&apiModuleId='+$req.details.request_info.id+'&key='+$req.details.request_info.image_token+'&minContent=true&popupfor=detailspage&module=requests', getMessageForKey('sdp.inventory.wsRtPanel.userDetails'), '450', '500', 'yes', 'center');	//No I18N
	},
	/* set the resolution status in Editable mode and clone it from property status */
	setEditResolutionStatus:function(skipOnload){
	    /* open the form and clone the status */
	    jQuery('[name="resolution_status"]').find('[name="viewWOStatus"]').addClass('hide').end().find('#woStatus_Id').remove();

	    if($req.prop.isOperationComplete){
	        $req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
	        $req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
		    $req.prop.checkResolutionStatus = true;
		    $req.prop.checkRightPanel = false;
	        $req.prop.checkBulkEdit = false;
	        $req.prop.sectionalFieldsEdit(skipOnload);
	        $req.prop.replyTemplateStatus = false;
	    }
	    var cloneStatus = jQuery('[data-name=status]').parent().find('[name="status"]').clone();
	    cloneStatus.attr('id','woStatus_Id').attr('name','woStatus').attr('data-field','').attr('class','form-control ml10 minw-250px');
		$req.prop.checkResolutionStatus = true;
	    jQuery('[name="resolution_status"]').append(cloneStatus);
	    jQuery('[name="resolution_status"]').find('#woStatus_Id').select2({
	        allowClear: true,
	        formatNoMatches: translate("common.no.match.found"), //No I18N
	        sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
	    }).select2('open'); //NO I18N
	    var leftField = jQuery('[data-name="status"]').parent().find('[name="status"]');
	    jQuery('[name="resolution_status"]').find('#woStatus_Id').on("select2-selecting", function(event, parentEvent) {
	            	if(!event.val) {
	            		event.val = parentEvent.val;
	            	}
	            	/** When the editor editing is not completed, alert is shown if other Technician tries to change the status */
	            	if($req.details.request_info.is_editing_completed === false && $req.details.request_info.editor && $req.details.request_info.editor.id != sdp_user.LOGGEDIN_USERID && $req.details.request_info.status.id !== event.val) {
	            		if(!window.confirm(getMessageForKey("sdp.request.status.update.removeintermediate"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}
	            	}
	            	var currentStatusId = $req.details.request_info.status.id;
	            	if($req.details.request_info.cancel_requested && ($req.details.operational_data.close_status_id
!= currentStatusId && $req.details.operational_data.resolved_status_id
!= currentStatusId && $req.details.operational_data.closed_resolved_status.indexOf(currentStatusId) == -1) && ($req.details.operational_data.close_status_id
== event.val || $req.details.operational_data.resolved_status_id
== event.val || $req.details.operational_data.closed_resolved_status.indexOf(event.val) != -1)) {
	            		if(!window.confirm(getMessageForKey("request.cancel.requested.status.change.warning"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}


	            	}
	            });
	    jQuery('[name="resolution_status"]').find('#woStatus_Id').on("change",function(e) {
	        var val = e.val;
	        if(val === undefined) {
	            val = e.currentTarget.value;
	        }
            if(leftField.val() !== val) {
	            /** if the status change event has been trigger with user_api option for FAFR, it has to be forwarded */
		        if(e.firedBy === "user_api" || e.originalEvent && e.originalEvent.firedBy === "user_api") {
		        	leftField.val(val);
		        	$req.utils.safeTrigger(leftField[0], "change");
		        } else {
		        	leftField.val(val).trigger('change');
		        }
		    }
	    });
	},
	setEditReplyTemplateStatus:function(skipOnload,fromListView){
		if(fromListView){
			$req.details.allowedValues = {};
	        var woID = $conversation.module_id;
	        $req.details.resetProperties();
	        $req.details.initialize(woID);
	        $req.prop.render();
        }
	    /* open the form and clone the status */
	    jQuery('[name="reply_template_status"]').find('[name="viewWOStatus"]').addClass('hide').end().find('#woStatus_Id').remove();

	    if($req.prop.isOperationComplete){
	        $req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
	        $req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
		    $req.prop.checkResolutionStatus = false;
		    $req.prop.checkRightPanel = false;
	        $req.prop.checkBulkEdit = false;
	        $req.prop.sectionalFieldsEdit(skipOnload);
	        $req.prop.replyTemplateStatus = true;
	    }
	    var cloneStatus = jQuery('[data-name=status]').parent().find('[name="status"]').clone();
	    cloneStatus.attr('id','woStatus_Id').attr('name','woStatus').attr('data-field','').attr('class','form-control ml10 minw-250px');
	    jQuery('[name="reply_template_status"]').append(cloneStatus);
	    jQuery('[name="reply_template_status"]').find('#woStatus_Id').select2({
	        formatNoMatches: translate("common.no.match.found"), //No I18N
	        allowClear: true,
	        sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
	    }).select2('open'); //NO I18N
	    var leftField = jQuery('[data-name="status"]').parent().find('[name="status"]');
	    jQuery('[name="reply_template_status"]').find('#woStatus_Id').on("select2-selecting", function(event, parentEvent) {
	            	if(!event.val) {
	            		event.val = parentEvent.val;
	            	}
	            	/** When the editor editing is not completed, alert is shown if other Technician tries to change the status */
	            	if($req.details.request_info.is_editing_completed === false && $req.details.request_info.editor && $req.details.request_info.editor.id != sdp_user.LOGGEDIN_USERID && $req.details.request_info.status.id !== event.val) {
	            		if(!window.confirm(getMessageForKey("sdp.request.status.update.removeintermediate"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}
	            	}
	            	var currentStatusId = $req.details.request_info.status.id;
	            	if($req.details.request_info.cancel_requested && ($req.details.operational_data.close_status_id
!= currentStatusId && $req.details.operational_data.resolved_status_id
!= currentStatusId && $req.details.operational_data.closed_resolved_status.indexOf(currentStatusId) == -1) && ($req.details.operational_data.close_status_id
== event.val || $req.details.operational_data.resolved_status_id
== event.val || $req.details.operational_data.closed_resolved_status.indexOf(event.val) != -1)) {
	            		if(!window.confirm(getMessageForKey("request.cancel.requested.status.change.warning"))) {
	            			event.stopImmediatePropagation();
	            			event.preventDefault();
	            			if(parentEvent) {
	            				parentEvent.stopImmediatePropagation();
	            				parentEvent.preventDefault();
	            			}
	            			return;
	            		}


	            	}
	            });
	    jQuery('[name="reply_template_status"]').find('#woStatus_Id').on("change",function(e) {
	        var val = e.val;
	        if(val === undefined) {
	            val = e.currentTarget.value;
	        }
            if(leftField.val() !== val) {
	            /** if the status change event has been trigger with user_api option for FAFR, it has to be forwarded */
		        if(e.firedBy === "user_api" || e.originalEvent && e.originalEvent.firedBy === "user_api") {
		        	leftField.val(val);
		        	$req.utils.safeTrigger(leftField[0], "change");
		        } else {
		        	leftField.val(val).trigger('change');
		        }
		    }
	    });
	},
	/* cretae the priority matrix json*/
	getPriorityMatrix:function(){
		var priority_matrices = {},priority_matrix = [];
        //SD-111653 : Priority_matrix Call is Iterated till it has more rows
        var start_index=1;
        var has_more_rows=false;
        do{
            var list_info = {
                 row_count: 100,
                 start_index:start_index
            };
          sdpAjax({
                 url : '/api/v3/priority_matrices',    //No I18N
                 type: 'GET',  //No I18N
                 cache: false,
                 async: false,
              data: sdpAjaxInputData({ "list_info": list_info }), //No I18N
                 success: function(data){
                     priority_matrix = priority_matrix.concat(data.priority_matrices);
                     has_more_rows=data.list_info.has_more_rows;
                     start_index=start_index+100;
                 }
            });
        }while(has_more_rows)

	    for(var i=0,ilen=priority_matrix.length;i<ilen;i++){
	    	var impact = priority_matrix[i].impact.id;
	    	var urgency = priority_matrix[i].urgency.id;
	    	var Priority = priority_matrix[i].priority.id;
	    	priority_matrices[impact+"##"+urgency] = Priority;
	    }
	    $req.details.operational_data.priority_matrix = priority_matrices;
	    $req.prop.checkPriorityMatrix = true;
	},
	/*show multi lines */
	toggleMultiLineValue:function(event, fieldId, more, less){
	    event.stopPropagation();
	    event.preventDefault();
	    if(sdp_user.USERTYPE === 'Technician'){
	    	jQuery('[data-name='+fieldId+']').find('.'+more+'').removeClass('hide').end().find('.'+less+'').addClass('hide');
	    }else{
	    	jQuery('#'+fieldId+'-right-panel').find('.'+more+'').removeClass('hide').end().find('.'+less+'').addClass('hide');
	    }
	},
	/* show multiselect field options */
	toggleMultiSelectOption:function(event, fieldId, more, less){
		event.stopPropagation();
	    event.preventDefault();
	    var element = jQuery("[data-name='"+fieldId+"']");
	    if(fieldId !== 'assets' && fieldId !== 'space' && fieldId !== 'configuration_items') {
	    	if(element.siblings(".spot-form").length > 0) {
	    		var fieldElement = jQuery('[data-name='+fieldId+']');
		        var fafrKey = fieldElement.attr('fafr-name');
		        var type = fieldElement.attr('type');
		        $req.prop.setFieldOptions(fieldElement,fieldId,fafrKey,type);
		        fieldElement.removeClass('hide').parent().find('.spot-form').addClass('hide');	//No I18N
		        fieldElement.parents('.fafr-row:first').find('.mandatory').addClass('hide');	//No I18N
	    	}
	    	if(jQuery("#select_"+fieldId).length > 0 || jQuery("#select_"+fieldId+"_val").length > 0) {
	    		showURLInDialog('/workorder/multiselect.jsp?name=select_'+fieldId+'&from=viewOnly&'+(new Date()).getTime()+'','modal=yes, closeButton=no,closeOnEscKey=no, width=450, height=600, position=absmiddle'); //NO I18N
	    	} else {
	    		element.find('.'+more+'').removeClass('hide').end().find('.'+less+'').addClass('hide');	//No I18N
	    	}
	    } else {
	    	element.find('.'+more+'').removeClass('hide').end().find('.'+less+'').addClass('hide');	//No I18N
	   	}
	},
	/** shows the full content of the truncated value in dialog */
	showFullTextDialog: function(event, element, fieldId) {

		event.stopPropagation();
		event.preventDefault();
		var content = '<div id= "fullText_'+fieldId+'" class="p20 pl10 pr10 wspace-prewrap">' + jQuery(element).find('.text-content').html() + '</div>';
		var title = "";
		if(fieldId) {
			var metainfo = this.getFieldMetaInfo(fieldId);
			if(metainfo) {
				title = metainfo.display_name;
			}
		}
		showDialog(content, "modal=yes, width=450px, height=300px, title=" + title + ", position=absmiddle");	//No I18N
	},
	/* this function show the assets info */
	openAssetInfo:function(event,val){
	    event.stopPropagation();
		event.preventDefault();
		window.open('/Assets.do?entity_id='+val+'&mode=get','_blank','noopener');
	},
	/* this function is used to show the CIs info */
	openCIInfo:function(event,val){
		assetsObj.loadCIDetailsPopup(val);
	},
	/* this function hide the unnecessary fields and also handle requester login */
	hideExtraFields:function(){
	    var isTechnicianModify = $req.details.operational_data.links.edit && $req.details.operational_data.links.edit.put ? true : false;;
	    if($req.sdp_user.USERTYPE==='Requester' || !isTechnicianModify){
	        jQuery('#prop-edit-btn, #res-edit-btn').addClass('hide');
	    }
	},


	/********************** CSI SGT *********************************/
	setChangeOnSGTFields:function(editType){
	    var site = jQuery('[data-name=site]');
		var group = jQuery('[data-name=group]');
		var technician = jQuery('[data-name=technician]');
		$req.prop.onchangeSGTField(editType,site,group,technician);
		var siteVal = 0;
		var groupVal = undefined;
		var technicianVal = undefined;
		if(site.length && $req.details.request_info.site){
			siteVal = $req.details.request_info.site.id;
		}else{
			siteVal = 0;
		}
		if(group.length){
			groupVal = group.text();
		}
		if(technician.length){
			technicianVal = technician.text();
		}
		$req.sgt.populateData(siteVal, groupVal, technicianVal, 'site'); //NO I18N
	},
	/* this Function set Onchange Actions On SGT fields */
	onchangeSGTField:function(checkInline, siteElement, grpElement, techElement){
	    if(techElement.length && !this.checkRightPanel){
	    	techElement.parent().find('.spot-form').removeClass('hide');
	    }

	    if(siteElement.length){
		    if(grpElement.length && techElement.length){
	            $req.prop.invokeSite();
	            $req.prop.invokeGroup();
	            if(checkInline==='inline'){
	                jQuery('#technician_actions').removeClass('hide').find('#saveButton').removeClass('hide');
	            }
		    }else if(grpElement.length){
	            $req.prop.invokeSite();
	            if(checkInline==='inline'){
	                jQuery('#group_actions').removeClass('hide').find('#saveButton').removeClass('hide');
	            }
		    }else if(techElement.length){
	            $req.prop.invokeSite();
	            if(checkInline==='inline'){
	                jQuery('#technician_actions').removeClass('hide').find('#saveButton').removeClass('hide');
	            }
		    }else if(checkInline==='inline'){ //NO I18N
	            jQuery('#site_actions').removeClass('hide');
	            var selectSite = jQuery('#propertyDetailForm [name="site"]');
	            selectSite.on('change',function(e){
	                $req.prop.inlineSave("site", true);	//No I18N
			    });
		    }
	    }else if(grpElement.length){
	        if(techElement.length){
		        $req.prop.invokeGroup();
	            if(checkInline==='inline'){
	                jQuery('#technician_actions').removeClass('hide').find('#saveButton').removeClass('hide');
	            }
	        }else if(checkInline==='inline'){ //NO I18N
	        	jQuery('#group_actions').removeClass('hide');
	            var selectGrp = jQuery('#propertyDetailForm [name="group"]');
	            selectGrp.on('change',function(e){
	                $req.prop.inlineSave("group", true);	//No I18N
		        });
	        }
	    }else if(techElement.length){
	        if(checkInline==='inline'){
	            jQuery('#technician_actions').removeClass('hide');
	            var selectTech = jQuery('#propertyDetailForm [name="technician"]');
	            selectTech.on('change',function(e){
	                $req.prop.inlineSave("technician", true);	//No I18N
		        });
	        }
	    }
	},
	/* this function create SGT sectional Json for update in Data Base */
	createSGTUpdateObject:function(){
	    var siteElement = jQuery('#propertyDetailForm [name="site"]');
	    var grpElement = jQuery('#propertyDetailForm [name="group"]');
	    var techElement = jQuery('#propertyDetailForm [name="technician"]');
	    if(siteElement.length){
	    	var value = siteElement.val();
	    	if(value === '0'){
	    		this.sectionalUpdateJson.site = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.site && $req.details.request_info.site.id;
	    		}
	    		this.sectionalUpdateJson.site = {"id":value} //NO I18N
	    	}
	    }

	    if(grpElement.length){
	    	var value = grpElement.val();
	    	if(value === '0'){
	    		this.sectionalUpdateJson.group = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.group && $req.details.request_info.group.id;
	    		}
	    		this.sectionalUpdateJson.group = {"id":value} //NO I18N
	    	}
	    }

	    if(techElement.length){
	    	var value = techElement.val();
	    	if(value === '0'){
	    		this.sectionalUpdateJson.technician = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.technician && $req.details.request_info.technician.id;
	    		}
	    		this.sectionalUpdateJson.technician = {"id":value} //NO I18N
	    	}
	    }
	},
	/* add onchange Action on Site */
	invokeSite:function() {
	    jQuery('#site_actions').addClass('hide');
	    jQuery('#propertyDetailForm [name="site"]').on("select2-selecting", function(e) {
	    	var prev_val = jQuery(this).val();
	    	var siteText = e.choice ? e.choice.text : null;
	    	if(!siteText && jQuery(this).data("select2")) {
	    		siteText = jQuery(this).select2("data").text;	//No I18N
	    	}

	    	/** When purchase request is associated, then on changing the site, the dissociation of PR warning alert should be shown for the confirmation */
	    	if($req.details.request_metrics
	    		&& $req.details.request_metrics.hasOwnProperty('purchase_request_count') 	//No I18N
	    		&& parseInt($req.details.request_metrics.purchase_request_count) > 0
	    		&& (!$req.details.request_info.site || $req.details.request_info.site.id === prev_val)) {
	    		if(!window.confirm(getMessageForKey("sdp.service.request.dissociate.pr.waringmessage", [siteText]))) {
        			e.stopImmediatePropagation();
        			e.preventDefault();
	    			return;
	    		}
	    	}
	    }).on('change', function(e) {
	    	var val = e.val;
	    	var nextGroup = undefined;
	    	try {
	    		/** SD-76500 : Based on CSI.js, if the group name matches with the previous site, the Group value should be maintained */
	    		var group_obj = jQuery("#propertyDetailForm [name='group']");
	    		if(group_obj.length > 0 && group_obj.data("select2") && group_obj.select2("data")) {
	    			nextGroup = group_obj.select2("data").text;	//No I18N
	    		}
	    		nextGroup = nextGroup || undefined;     /** to avoid the value 'null' in any case */
	    	} catch(ex) {
	    	//	console.error(ex);
	    	}
	    	if(val===undefined) {
	    		val = e.target.value;
	    	}
			$req.sgt.populateData(val, nextGroup, undefined, 'site', e); //NO I18N
	        // if($req.prop.checkRightPanel){
	        // 	$req.prop.mappingPropertySGT();
	        // }
	    });
	},
	/* add onchange Action on Group */
	invokeGroup:function() {
	    jQuery('#group_actions').addClass('hide');
	    jQuery('#propertyDetailForm [name="group"]').on('change', function(e) {
	    	var val = e.val, selectedGroup;
	    	if(val === undefined) {
	    		val = e.target.value;
	    	}

	    	/** Getting the selected option's text value */
	    	var selectedOption = jQuery(this).filter(function() {
				return this.value === val;
			});
			if(selectedOption && selectedOption.length > 0) {
				selectedGroup = selectedOption.text();
			}
			if(!selectedGroup) {
				selectedGroup = e.added.text;
			}
			$req.sgt.populateData(undefined, selectedGroup, undefined, 'group',e); //NO I18N
	        // if($req.prop.checkRightPanel){
	        // 	$req.prop.mappingPropertySGT();
	        // }
	    });
	},

	setChangeOnCSIFields:function(editType){
	    var cat = jQuery('#propertyDetailForm [name="category"]');
	    var subCat = jQuery('#propertyDetailForm [name="subcategory"]');
	    var item = jQuery('#propertyDetailForm [name="item"]');
	    $req.prop.onchangeCSIField(editType,cat,subCat,item);
	    var catVal = undefined;
	    var subCatVal = undefined;
	    var itemVal = undefined;
		if(cat.length){
        catVal = $req.details.request_info.category ? $req.details.request_info.category.name : getMessageForKey("sdp.common.notassigned");//No i18n
		}
		if(subCat.length){
        subCatVal = $req.details.request_info.subcategory ? $req.details.request_info.subcategory.name : getMessageForKey("sdp.common.notassigned");//No i18n
		}
		if(item.length){
			itemVal = $req.details.request_info.item ? $req.details.request_info.item.name : getMessageForKey("sdp.common.notassigned");//No i18n
		}
		$req.csi.populateData(catVal,subCatVal,itemVal,'category'); //NO I18N
	},
	/* this Function set Onchange Action on CSI fields */
	onchangeCSIField:function(checkInline, catElement, subCatElement, itemElement) {
		if(catElement.length && !subCatElement.length && checkInline ==='inline') {
			jQuery('#category_actions').removeClass('hide');
			var selectCategory = jQuery('#propertyDetailForm [name="category"]');
			selectCategory.on('change',function(e){
	            $req.prop.inlineSave('category', true);	//No I18N
			});
		} else if(catElement.length) {
	    	    jQuery('#category_actions').addClass('hide');
	    	    jQuery('#propertyDetailForm [name="category"]').on('change', function(e) {
	    	    	var value = "";
	    	    	if(e.currentTarget) {
	                    value = $req.details.allowedValues.CATEGORY.AllowedValues[e.currentTarget.value]
	    	    	} else {
	    	    		value = e.added.text;
	    	    	}
	                $req.csi.populateData(value, undefined, undefined, 'category',e); //NO I18N
	    	    });
	    }

	    if(subCatElement.length) {
	    	jQuery('#subcategory_actions').addClass('hide');
	    	jQuery('#propertyDetailForm [name="subcategory"]').on('change', function(e) {
	    		var value = "";
		    	if(e.currentTarget) {
	                //value =  e.currentTarget[e.currentTarget.value].innerText;
	                value = $req.details.allowedValues.SUBCATEGORY.AllowedValues[e.currentTarget.value];
		    	} else {
		    		value = e.added.text;
		    	}
	            $req.csi.populateData(undefined, value, undefined, 'subcategory',e); //NO I18N
	    	});
	    }
	},
	/* this Function create the CSI sectional JSON data For Update in DB */
	createCSIUpdatedObject:function(cat, subcat, item){
		var catElement = jQuery('#propertyDetailForm [name="category"]');
		var subcatElement = jQuery('#propertyDetailForm [name="subcategory"]');
		var itemElement = jQuery('#propertyDetailForm [name="item"]');
	    if(catElement.length){
	    	var value = catElement.val();
	    	if(value==='0'){
	    		this.sectionalUpdateJson.category = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.category && $req.details.request_info.category.id;
	    		}
	    		this.sectionalUpdateJson.category = {"id" : value}; //NO I18N
	    	}
	    }

	    if(subcatElement.length){
	    	var value = subcatElement.val();
	    	if(value==='0'){
	    		this.sectionalUpdateJson.subcategory = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.subcategory && $req.details.request_info.subcategory.id;
	    		}
	    		this.sectionalUpdateJson.subcategory = {"id" : value}; //NO I18N
	    	}
	    }

	    if(itemElement.length){
	    	var value = itemElement.val();
	    	if(value==='0'){
	    		this.sectionalUpdateJson.item = null;
	    	}else{
	    		if(value == null) {
	    			value = $req.details.request_info.item && $req.details.request_info.item.id;
	    		}
	    		this.sectionalUpdateJson.item = {"id" : value}; //NO I18N
	    	}
	    }
	 },
	 /* return open right panel field */
	 getRightPanelModifiedField:function(){
		if(jQuery('#priority-right-panel').find('[name="priority"]').length){
			return {"name":"priority","value":jQuery('#priority-right-panel').find('[name="priority"]').val()}; //NO I18N
		}else{
		    return {"name":"status","value":jQuery('#status-right-panel').find('[name="status"]').val()};	//NO I18N
		}
	},
	/* change Field Value */
	setTriggeredField:function(fieldObj){
		jQuery(document).ready(function(){
			setTimeout(function(){
	            jQuery('#propertyDetailForm [name="'+fieldObj.name+'"]').val(fieldObj.value).trigger('change'); //NO I18N
			},200);
		});
	},



	/************************ Right Panel **********************************/
	/* bind the field of right panel for editing */
	addListener: function() {
	    jQuery('#right-panel-div').find('.spot-static').each(function(){
	        var element = jQuery(this).parent();
	        var id = element[0].id;
	        var selector = '';
	        if(id === 'technician-right-panel' || id === 'group-right-panel' || id === 'site-right-panel'){
	            selector = id;
	            id = 'SGT'; //NO I18N
			}
			// CSI implementation checks
			if(id === 'category-right-panel' || id === 'subcategory-right-panel' || id === 'item-right-panel'){
	            selector = id;
	            id = 'CSI'; //NO I18N
	        }
	        switch(id){
	        	case 'status-right-panel': //NO I18N
	        	    jQuery('#'+id).find('p').off('click').on('click', function(event) {
	                    if(!$req.prop.wizard.isEnabled && (jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != "" || $req.prop.checkResolutionStatus)) {
							$req.prop.cancelResolution(undefined, event);
							if(event.isDefaultPrevented()) {
								return false;
							}
						}
	                    var button = $req.prop.getRightPanelCloseButton('status'); //NO I18N
	        	        element.append(button);
	        	        $req.prop.setRightPanelEdit('status', event); //NO I18N
	        	    });
	        	    break;
	        	case 'priority-right-panel': //NO I18N
	        	    jQuery('#'+id).find('p').off('click').on('click', function(event) {
	        	    	if(!$req.prop.wizard.isEnabled && (jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != "" || $req.prop.checkResolutionStatus)) {
							$req.prop.cancelResolution(undefined, event);
							if(event.isDefaultPrevented()) {
								return false;
							}
						}

	                    var button = $req.prop.getRightPanelCloseButton('priority'); //NO I18N
	        	        element.append(button);
	        	        $req.prop.setRightPanelEdit('priority', event); //NO I18N
	        	    });
	        	    break;
	        	case 'SGT': //NO I18N
	        	    jQuery('#'+selector).find('p').off('click').on('click', function(event) {
	        	    	$req.prop.showAssignDialog(event, selector);
	                });
	        	    break;
	        	case "CSI": //NO I18N
      					jQuery('#'+selector).find('p').off('click').on('click', function(event) {
      	        	    	if(!$req.prop.wizard.isEnabled && (jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != "" || $req.prop.checkResolutionStatus)) {
      							$req.prop.cancelResolution(undefined, event);
      							if(event.isDefaultPrevented()) {
      								return false;
      							}
      						}
      	        	    	$req.prop.setRightPanelEdit('category', event); //NO I18N
      	                    //var newBtn = '<span class="ui-dialog-title" data-name="rightPanel_assignTechnician">'+getMessageForKey('sdp.requests.viewrequest.assigntitle')+'</span>';
      	                    /* create dialog box */
      	                    var posId = false;
      	                    var categoryElement = jQuery('#category-right-panel');
      	                    if((jQuery('#item-right-panel').length && $req.prop.hideRightPanelFields.indexOf('ITEM') == -1) || (jQuery('#subcategory-right-panel').length && $req.prop.hideRightPanelFields.indexOf('subcategory') == -1) || (categoryElement.length && !categoryElement.parent().hasClass('hide'))){
      	                        posId = true;
      	                    }
							var Dialogtitle = jQuery("#"+selector).parent(".form-group").find(".control-label").text();
      	                    if(posId){
      	                        jQuery("#categoryPopUp").dialog({
      	                        	modal:true,
      	    	                    closeOnEscape: true,
      	    	                    open: function() {
      									jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
      										$req.prop.cancelRightPanelTechnician();
      									});
									},
									position: { my: "center center", at: "center center", of: window }, // No I18N
      								width:350,
      								close: function(e){
      									if(e && e.keyCode === 27){
      	                                    $req.prop.cancelRightPanelTechnician();
      									}
      								},
      								title: Dialogtitle ? Dialogtitle : getMessageForKey("sdp.requests.common.category"),
      								/**
      								 * onclose the popup on press escape
      								 */
      								beforeClose:function(){
      									/**
      									 * Forcly close the categoryPopUp, to avoid animation jerk
      									 */
      									jQuery("#categoryPopUp").closest(".ui-dialog").hide(); //NO I18N
      								}
      	                        });
      	                        jQuery('#rightPanelItem [name="item"]').on("select2-opening", function() {
      	                    	    setTimeout(function(){
      	                                jQuery('#select2-drop').find('#showAll').prop('checked',true); //NO I18N
      	                    	    },0);

      	                        });
      	                    }else{
      	                    	$req.prop.render();
      						}
      	                });
      					break;
            default :
	        	    break;
	        }

		});
		/**
		 * Add Notes while Assign to the technician
		 */
		jQuery("#enable-assign-cmt").on("focus", function() {
				/**
				 * Initialize the Zeditor
				 */
				zeditor({
					element: "assign-comments", //No i18n
					focus: true,
					customName: "assign_comments", //No i18n
					buttonsToHide: ["image"]
				});
				/**
				 * Hide the Textarea
				 */
				jQuery("#enable-assign-cmt").hide();
			/**
			 * After the Popup length change we need to repoisitioning the popup
			 */
			jQuery("#technicianPopUp").dialog("option", "position",  { my: "center center", at: "center center", of: window }); //No i18n
		});
	},

	showAssignDialog: function(event, element) {

		if(element){
			element = element.replace("-right-panel",""); //  NO I18N
			// Construct the selector for the select2 inthe popup
			element = "[data-field='"+element.toUpperCase()+"_popup'] .select2-focusser"; // NO I18N
		}

		if(!$req.prop.wizard.isEnabled && (jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  && getResolnDescription() != "" || $req.prop.checkResolutionStatus)) {
			$req.prop.cancelResolution(undefined, event);
			if(event.hasOwnProperty("isDefaultPrevented") && event.isDefaultPrevented()) {
				return false;
			}
		}
    	$req.prop.setRightPanelEdit('technician', event); //NO I18N
        //var newBtn = '<span class="ui-dialog-title" data-name="rightPanel_assignTechnician">'+getMessageForKey('sdp.requests.viewrequest.assigntitle')+'</span>';
        /* create dialog box */
        var posId = false;
        var siteElement = jQuery('[data-name="site"]').closest(".fafr-row");	//No I18N
        if((jQuery('[data-name="technician"]').length && $req.prop.hideRightPanelFields.indexOf('TECHNICIAN') == -1) || (jQuery('[data-name="group"]').length && $req.prop.hideRightPanelFields.indexOf('GROUP') == -1) || (siteElement.length && !siteElement.hasClass('hide'))){
            posId = true;
        }

        if(posId){
			const activeWindow = $extFrame.getActiveWindow();
            jQuery("#technicianPopUp").dialog({
                modal:true,
                closeOnEscape: true,
                open: function() {
                    jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ //NO I18N
                        $req.prop.cancelRightPanelTechnician(true);
                    });
                    // Give few milliseconds for the select2 to be rendered
                    setTimeout(function(){
                        jQuery(element).focus()
                    }, 10);
                    jQuery(element).focus();
					activeWindow.parent.$previewComponent.internalDialogs[jQuery(this).attr('id')] = jQuery(this).dialog("instance"); //NO I18N
                },
                position: { my: "center center", at: "center center", of: window }, //NO I18N
                width:350,
                close: function(e){
                    if(e && e.keyCode === 27){
                        $req.prop.cancelRightPanelTechnician(true);
                    }
					delete window.top.parent.$previewComponent.internalDialogs[jQuery(this).attr('id')];
                },
                title:getMessageForKey("sdp.requests.viewrequest.assigntitle"),
                /**
                 * onclose the popup on press escape
                 */
                beforeClose:function(){
                    /**
                     * Forcly close the technicianPopUp, to avoid animation jerk
                     */
                    jQuery("#technicianPopUp").closest(".ui-dialog").hide(); //NO I18N
                    /**
                     * close the assign comments and destory the zeditor
                     */
                    $req.prop.closeAssignComments();
                }
                // modal: true,
                // create: function() {
                //     jQuery(this).prev('.ui-dialog-titlebar').html(newBtn); //NO I18N
                // },
                //width:"350px",closeOnEscKey:"no" //NO I18N
                //position: { my: "center top+20", at: "center top",of: posId } //NO I18N
            });
            jQuery('#rightPanelTechnician [name="technician"]').on("select2-opening", function() {
        	    setTimeout(function(){
                    jQuery('#select2-drop').find('#showAll').prop('checked',true); //NO I18N
        	    },1);

            });
        }else{
        	if(jQuery('[data-name="technician"]').length === 0 && jQuery('[data-name="group"]').length === 0) {
        		$req.utils.alert("warning", getMessageForKey("sdp.request.assignreq.fieldsdisabled.message"), "isAutoHide=true, delay=15");	//No I18N
        	} else {
        		$req.utils.alert("failure", getMessageForKey("request.field.rules.modify.error"), 'isAutoHide=false'); //NO I18N
        		$req.prop.render();
        	}
		}
	},

	/* right panel field Editing */
	setRightPanelEdit:function(fieldName, event){
		/* close the resources if open */
		if($req.resource.checkResBulkEdit){
			$req.resource.resourceCancel()
		}
		/* checkrightPanel true stop to bind the change event on picklist elements */
		 this.checkRightPanel = true;
		 this.checkBulkEdit = false;
		if($req.prop.checkResolutionStatus){//if we already have opened status from resolution tab then it need to fix it to original span position
			jQuery("select[name='woStatus']").select2("destroy")//No i18n
			jQuery("select[name='woStatus']").remove();
		 	jQuery('[name="resolution_status"]').closest("#resolution").find('[name="viewWOStatus"]').removeClass('hide').end(); //NO I18N
		}
		$req.prop.checkResolutionStatus = false;
		/* check if open status in right panel and priority is already open then close it (vice-versa) */
		if(fieldName === 'status'){
			$req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
		}else if (fieldName === 'priority'){ //NO I18N
			$req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
		}
	    $req.prop.hideRightPanelFields = [];
	    // $req.prop.isHideFieldTechnician = false;
	    // $req.prop.isHideFieldGroup = false;

		$req.prop.sectionalEdit();
		$req.prop.sectionalCancel();

		/* closeRightPanelPriorityStatus set the right panel false so set it true again */
		if(fieldName === 'technician' || fieldName === 'group' || fieldName === 'site'){
			fieldName = 'SGT'; //NO I18N
			/* Loading this dynamically as this is not required unless an sgt field from rpanel/header/RLV is edited and to prevent unwanted rendering as this will be always hidden */
            /* Will be rendering it for first time edit alone. This needs to be performed before mappingPropertySGT function, since option cloning will be performed there. */
            !jQuery('#technicianPopUp').length && renderhbs('#sgt-popup', 'sgt-popup-template', {}, false, 'requests/properties', undefined, undefined, $req.details.bindEvents.property_templates.sgt_popup); //No I18N
			jQuery('#technicianPopUp').length && jQuery("#technicianPopUp .sgt-assign").removeClass("disabled").prop("disabled", false);//No I18N
		}

		//SD-126498
        //calling setFieldAndFormRules here to apply on form load rules.
        $req.prop.setFieldAndFormRules(false);

		//CSI implementation
		if(fieldName === 'category' || fieldName === 'subcategory' || fieldName === 'item'){
			fieldName = 'CSI'; //NO I18N
		}

	    switch(fieldName){
		    case 'SGT': //NO I18N
		        $req.prop.mappingPropertySGT();
				break;
			case 'CSI': //NO I18N
				$req.prop.mappingPropertyCSI();
				break;
		    case 'pickUp': //NO I18N
		        $req.prop.pickUp();
		        break;
		    default:
		        if($req.prop.hideRightPanelFields.indexOf(fieldName.toUpperCase()) !== -1){
			        $req.utils.alert("failure", getMessageForKey("request.field.rules.modify.error"), 'isAutoHide=false'); //NO I18N
			        $req.prop.render();
			        return false;
		        }
		        //resticted becasuse its called from listview only for status ,so no need to invoke other functionality of setRightPanelFields
		        if(!$req.prop.fromListview){
		        	$req.prop.setRightPanelFields(fieldName);
		        }
	    }
	},
	renderForm:function(){
		if($req.prop.checkRightPanel) {
			$req.prop.render();
			$req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
			$req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
			if(isMSPOrSCP) {
				$req.prop.closeRightPanelPriorityStatus('account'); //NO I18N
			}
		}
		if($req.prop.checkBulkEdit) {
			$req.prop.render();
		}
		if($req.resource.checkResBulkEdit) {
		    $req.resource.resourceCancel();
		}
		closeCalDialog();
	    this.checkRightPanel = false;
	    this.isOperationComplete = true;
		this.checkResolutionStatus = false;
		this.replyTemplateStatus = false;
		this.checkBulkEdit = false;
		this.closure_info = {};
		$se.page_scripts.render("rdp_page");
	},
	/* this Function Cancel Right panel Priority */
	closeRightPanelPriorityStatus:function(fieldId){
		var fieldElement = jQuery('#'+fieldId+'-right-panel');
		fieldElement.find('.spot-form').remove().end().find('p').removeClass('hide');
	},

	/* change right panel field in Editable mode */
	setRightPanelFields:function(fieldName){
	    var rightPanel = jQuery('#'+fieldName+'-right-panel');
	    rightPanel.find('.form-control-static').addClass('hide');
	    rightPanel.find('.spot-form').removeClass('hide');

	    var innerDiv = jQuery('#propertyDetailForm [name="'+fieldName+'"]')[0].cloneNode(true);//.prop('outerHTML'); //NO I18N
	    rightPanel.find('.control-holder').append(innerDiv);
	    if(!isMSPOrSCP || innerDiv.nodeName === 'SELECT') {
    	// block always executed for SDP
	    rightPanel.find('[name="'+fieldName+'"]').removeAttr('data-field').select2('destroy').select2({  //NO I18N
	 	    allowClear: true,
	 	    formatNoMatches: translate("common.no.match.found"), //No I18N
	 	    sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
	    });
		}
	    if(!rightPanel.parent().hasClass('hide')){
	      rightPanel.find('[name="'+fieldName+'"]').select2('open'); //NO I18N
	    }

	    var leftField = jQuery('[data-name="'+fieldName+'"]').parent().find('[name="'+fieldName+'"]');

	    //$req.prop.setChangeOnPickList(fieldName,'lookup');
	    rightPanel.find('[name="'+fieldName+'"]').on("select2-selecting", function(e) {
	    	leftField.trigger('select2-selecting', [e]);
	    }).on("change", function(e) {
	        var val = e.val;
	        if(val === undefined){
	        	val = e.currentTarget.value;
	        }

	        /** if the status change event has been trigger with user_api option for FAFR, it has to be forwarded */
	        if(e.firedBy === "user_api" || e.originalEvent && e.originalEvent.firedBy === "user_api") {
	        	leftField.val(val);
	        	$req.utils.safeTrigger(leftField[0], "change");
	        } else {
	        	leftField.val(val).trigger('change');
	        }
	        if(fieldName === 'priority' && !Object.keys($se.rules).length){
	        	setTimeout(function(){
	                $req.prop.inlineSave();
	        	},1);
	        }
	    });
	},
	/*clone the Property GST in right panel technician SGT Popup */
	mappingPropertySGT:function(){
	    if(jQuery('[data-name=site]').length){
			var rightPanelSite = jQuery('#rightPanelSite');
	    	 rightPanelSite.html('');
	    	 rightPanelSite.closest('.form-group').removeClass('hide'); //No i18n
	    	 var leftPanelSite = jQuery('#propertyDetailForm [name="site"]');
	    	 leftPanelSite.prev().appendTo('#rightPanelSite'); //NO I18N

	    	leftPanelSite.on("change",function(e){
	            $req.prop.rightPanelGroupUpdate();
	            $req.prop.rightPanelTechnicianUpdate();
	    	});
	    }

	    if(jQuery('[data-name=group]').length){
	    	var rightPanelGroup = jQuery('#rightPanelGroup');
	    	if($req.prop.hideRightPanelFields.indexOf('GROUP') === -1){
	            rightPanelGroup.closest('.form-group').removeClass('hide'); //No i18n
	    	    rightPanelGroup.html('');
	    	    $req.prop.rightPanelGroupUpdate(rightPanelGroup);
	    	}else{
	            rightPanelGroup.closest('.form-group').addClass('hide'); //No i18n
	    	}
	    }

	    if(jQuery('[data-name=technician]').length){
	    	var rightPanelTechnician = jQuery('#rightPanelTechnician');
	    	if($req.prop.hideRightPanelFields.indexOf('TECHNICIAN') === -1){
	    	    rightPanelTechnician.closest('.form-group').removeClass('hide');	//No i18n
	    	    rightPanelTechnician.html('')
	    	    $req.prop.rightPanelTechnicianUpdate(rightPanelTechnician);
	        }else{
	        	rightPanelTechnician.closest('.form-group').addClass('hide'); //No i18n
	        }
	    }
	},
	/*clone the Property CSI in right panel category CSI Popup */
	mappingPropertyCSI:function(){
	    if(jQuery('[data-name=category]').length){
			var rightPanelCategory = jQuery('#rightPanelCategory');
			rightPanelCategory.html('');
			rightPanelCategory.closest('.form-group').removeClass('hide'); //No i18n
	    	var leftPanelCategory = jQuery('#propertyDetailForm [name="category"]');
	    	leftPanelCategory.prev().appendTo('#rightPanelCategory'); //NO I18N

	    	leftPanelCategory.on("change",function(e){
	            $req.prop.rightPanelSubcategoryUpdate();
	            $req.prop.rightPanelItemUpdate();
	    	});
	    }

	    if(jQuery('[data-name=subcategory]').length){
	    	var rightPanelSubCategory = jQuery('#rightPanelSubcategory');
	    	if($req.prop.hideRightPanelFields.indexOf('SUBCATEGORY') === -1){
	            rightPanelSubCategory.closest('.form-group').removeClass('hide'); //No i18n
	    	    rightPanelSubCategory.html('');
	    	    $req.prop.rightPanelSubcategoryUpdate(rightPanelSubCategory);
	    	}else{
	            rightPanelSubCategory.closest('.form-group').addClass('hide'); //No i18n
	    	}
	    }

	    if(jQuery('[data-name=item]').length){
	    	var rightPanelItem = jQuery('#rightPanelItem');
	    	if($req.prop.hideRightPanelFields.indexOf('ITEM') === -1){
	    	    rightPanelItem.closest('.form-group').removeClass('hide');	//No i18n
	    	    rightPanelItem.html('')
	    	    $req.prop.rightPanelItemUpdate(rightPanelItem);
	        }else{
	        	rightPanelItem.closest('.form-group').addClass('hide'); //No i18n
	        }
	    }


		// CSI Popup is being opened
		// TASK ID : 75112
		// If the CSI is value is inactive then we need populate the value
		var request_info = $req.details.request_info;

		try {

			if( request_info.category &&  !$req.csi.csi_model[request_info.category.id]){
				jQuery('#propertyDetailForm [name="category"]').select2("data",{ // NO I18N
					id:request_info.category.id,
					text:request_info.category.name
				});

				if(request_info.subcategory){
					jQuery('#propertyDetailForm [name="subcategory"]').select2("data",{ // NO I18N
						id:request_info.subcategory.id,
						text:request_info.subcategory.name
					});
				}
				if(request_info.item){
					jQuery('#propertyDetailForm [name="item"]').select2("data",{ // NO I18N
						id:request_info.item.id,
						text:request_info.item.name
					});
				}
			}


			if(request_info.subcategory && !$req.csi.csi_model[request_info.category.id].sub_categories[request_info.subcategory.id]){
				jQuery('#propertyDetailForm [name="subcategory"]').select2("data",{  // NO I18N
					id:request_info.subcategory.id,
					text:request_info.subcategory.name
				});

				if(request_info.item){
					jQuery('#propertyDetailForm [name="item"]').select2("data",{  // NO I18N
						id:request_info.item.id,
						text:request_info.item.name
					});
				}
			}

			if(request_info.item && !$req.csi.csi_model[request_info.category.id].sub_categories[request_info.subcategory.id].items[request_info.item.id] ){
				jQuery('#propertyDetailForm [name="item"]').select2("data",{  // NO I18N
					id:request_info.item.id,
					text:request_info.item.name
				});
			}

		} catch (error) {}


	},
	/* update technician in right panel */
	rightPanelTechnicianUpdate:function(){
	    if(jQuery('[data-name=technician]').length){
	    	if(jQuery('#propertyDetailForm [name="technician"]').prev().length) {	//No i18n
		    	jQuery('#rightPanelTechnician').empty();	//NO I18N
		    }
	    	jQuery('#propertyDetailForm [name="technician"]').prev().appendTo('#rightPanelTechnician'); //NO I18N
	    }
	},
	/* update the value of group from right panel */
	rightPanelGroupUpdate:function(){
	    if(jQuery('[data-name="group"]').length){
	    	if(jQuery('#propertyDetailForm [name="group"]').prev().length) {	//No i18n
		    	jQuery('#rightPanelGroup').empty();	//NO I18N
		    }
	    	jQuery('#propertyDetailForm [name="group"]').prev().appendTo('#rightPanelGroup'); //NO I18N
	    	jQuery('#propertyDetailForm [name="group"]').on("change",function(){
	            $req.prop.rightPanelTechnicianUpdate();
	    	});
	    }
	},
	/* update item in right panel */
	rightPanelItemUpdate:function(){
	    if(jQuery('[data-name=item]').length){
	    	jQuery('#propertyDetailForm [name="item"]').prev().appendTo('#rightPanelItem'); //NO I18N
	    }
	},
	/* update the value of subcategory from right panel */
	rightPanelSubcategoryUpdate:function(){
	    if(jQuery('[data-name="subcategory"]').length){
	    	jQuery('#propertyDetailForm [name="subcategory"]').prev().appendTo('#rightPanelSubcategory'); //NO I18N
	    	jQuery('#propertyDetailForm [name="subcategory"]').on("change",function(){
	            $req.prop.rightPanelItemUpdate();
	    	});
	    }
	},
	/* pick up */
	createJsonAndUpdatePickUp: function(callback) {
		var grpVal = '0';
		var pickupJson = {};
		if($req.details.request_info.group){
	        grpVal = $req.details.request_info.group.id;
		}
	    var grpTechArrList = grpTechModel.list[grpVal];
	    if(grpTechArrList !== undefined && grpTechArrList.indexOf($req.sdp_user.LOGGEDIN_USERID) !== -1){
	    	/* triggering the change event as we want respective FAFR set for the on change event to fire */
			jQuery("#propertyDetailForm [name=technician]").select2("val",$req.sdp_user.LOGGEDIN_USERID,true); //NO I18N
	    }else{
	    	//TODO ::: Here the group is set to "Not Assigned" for the user if the user doesn't belong to the current group. Need to check what will happen if the user doesn't have permission to set to "Not Assigned" group
	    	/* if technician is not present in the list, set group as unassigned and set the technician value */
			jQuery("#propertyDetailForm [name=group]").select2("val", "0", true); //NO I18N
			jQuery("#propertyDetailForm [name=technician]").select2("val", $req.sdp_user.LOGGEDIN_USERID, true); //NO I18N
	    }
	    if(!this.validTechChange($req.sdp_user.LOGGEDIN_USERID)) {
			$req.prop.sectionalCancel();
			return false;
		}
		$req.prop.inlineSave(undefined, undefined, undefined, undefined, callback);
	},
	/* update logged-in user as technician using pick up */
	pickUp:function(){
		//var site = jQuery('[data-name=site]');
		var siteVal = '0';
		var siteTechArrList;
		if($req.details.request_info.site){
			siteVal = $req.details.request_info.site.id;
			siteTechArrList = siteTechModel.list[siteVal];
			/** If the site is a Refer site, then the technicians should be fetched from the referred site array */
			if(siteTechArrList && siteTechArrList[0] == -1 && siteRefModel && siteRefModel.list) {
				var referredSite = siteRefModel.list[siteVal] ? siteRefModel.list[siteVal] : 0;
				siteTechArrList = siteTechModel.list[referredSite];
			}
		}
		if(!$req.details.request_info.site || (siteTechArrList !== undefined && siteTechArrList.indexOf($req.sdp_user.LOGGEDIN_USERID) !== -1)) {
			$req.prop.createJsonAndUpdatePickUp(function() {
				if(!$req.prop.wizard.isEnabled) {
					$req.prop.cancelRightPanelTechnician();
				}
			});
	    } else {
			$req.utils.alert('failure', getMessageForKey("sdp.requests.listaction.pickupfailureforrestrictedtech",[woID]), 'isAutoHide=true, delay=15'); //NO I18N
			if(!$req.prop.wizard.isEnabled) {
				$req.prop.cancelRightPanelTechnician();
			}
		}
	},
	/* assign the value in right panel technician SGT */
	assignRightPanelTechnician:function(){
	    $req.prop.inlineSave(undefined, undefined, undefined, undefined, function() {
	    if(!$req.prop.wizard.isEnabled && $req.prop.failureMsg != "failed") {
	    	$req.prop.cancelRightPanelTechnician();
		}

	    if($req.prop.failureMsg != "failed"){
	    	$req.prop.closeAssignComments();
	    }
		});
	},
	/* cancel the right panel SGT Popup */
	/**
	 * @param {boolean} [isForced] - Forced to cancel the rightpanel technician (like manual cancel button)
	 */
	cancelRightPanelTechnician:function(isForced){
		if(isForced === void 0){
			isForced = false;
		}
		if($req.prop.wizard.isEnabled) {
			return;
		}
		if(isForced){
			/** destroy the Z-Editor */
			$req.prop.closeAssignComments();
			jQuery("#assign-notes").addClass("hide");	//No I18N
			jQuery("#assign-notes").removeClass("disp-ib"); //No I18N
		}
		jQuery("#technicianPopUp").find(".form-wrapper").css({"width":"", "height": "","overflow-y": ""});  // NO I18N
	    jQuery(".ui-dialog-content").dialog().dialog("destroy"); //No I18N
	    /** remove the highlighted row in listview */
	    removeRowHighlight();
	    $req.prop.render();
		$req.rpanel.render();
		$req.prop.closeAssignComments();
		this.checkRightPanel = false;
		$req.prop.assign_comments_attachments=[];
	},

	/******************** Status Close PopUp ******************/

	handleCloseMandatory: function(module, event) {
		/** preventing FAFR from executing the status change rules */
		if(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		$req.prop.closeJQueryDialog();
		var alert_key;
		if(module === "tasks") {	//No I18N
    		alert_key = getMessageForKey("request.tasks.notcompleted") + " " + getMessageForKey("request.tabs.move.alert", [getMessageForKey("task.title")]);	//No I18N
    	} else if(module === "dependency") {	//No I18N
    		alert_key = getMessageForKey("request.dependency.notclosed") + " " + getMessageForKey("request.tabs.move.alert", [getMessageForKey("sdp.requests.viewrequest.dependency")]);	//No I18N
    	} else  if(module === "worklogs") {	//No I18N
    		alert_key = getMessageForKey("request.worklogs.notfound") + " " + getMessageForKey("request.tabs.move.alert", [getMessageForKey("sdp.requests.common.worklog")]);	//No I18N
		}
		else if(module === "checklists") {	//No I18N
    		alert_key = getMessageForKey("pending.checklists.checkliststab");	//No I18N
		}

		if($req.prop.fromListview) {
			if(confirm(alert_key)) {
				window.location.href="/WorkOrder.do?woMode=viewWO&woID="+woID+"#"+module;
			} else {
				jQuery("[name='status']").select2("val",$req.details.request_info.status.id);//it will return back to original value //no i18n
				if(requestListViews && requestListViews.kanbanUpdateFn) {
					requestListViews.kanbanUpdateFn(false);
				}
			}
			return;
		} else if($req.prop.checkRightPanel) {
		    if(confirm(alert_key)) {
		        $req.rpanel.render();
		        $req.prop.checkRightPanel = false;
		        $req.details.changeTab(module);
	        } else {
	    	    setTimeout(function() {
                    jQuery('#status-right-panel').find('[name="status"]').val($req.details.request_info.status.id);
                    $req.utils.safeTrigger(jQuery('#status-right-panel').find('[name="status"]')[0], "change");	//No I18N
	    	    }, 10);
	        }
        } else if($req.prop.checkResolutionStatus) {
        	var save_resol = true;
        	if(!jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible")  || getResolnDescription() == "") {
        		save_resol = false;
        	}
        	var save_resol_key = save_resol ? "request.resolution.save.tabs.move.alert" : "request.tabs.move.alert";	//No I18N
        	var res_alert_key;
	    	if(module === "tasks") {	//No I18N
	    		res_alert_key = getMessageForKey("request.tasks.notcompleted") + " " + getMessageForKey(save_resol_key, [getMessageForKey("task.title")]);	//No I18N
	    	} else if(module === "dependency"){	//No I18N
	    		res_alert_key = getMessageForKey("request.dependency.notclosed") + " " + getMessageForKey(save_resol_key, [getMessageForKey("sdp.requests.viewrequest.dependency")]);	//No I18N
	    	} else  if(module === "worklogs") {	//No I18N
    			res_alert_key = getMessageForKey("request.worklogs.notfound") + " " + getMessageForKey(save_resol_key, [getMessageForKey("sdp.requests.common.worklog")]);	//No I18N
			} else if(module === "checklists") {	//No I18N
    		    res_alert_key = getMessageForKey("pending.checklists.checkliststab");	//No I18N
			}
	    	if(confirm(res_alert_key)) {
                setTimeout(function(){
                    jQuery('[name="woStatus"]').val($req.details.request_info.status.id);
                    $req.utils.safeTrigger(jQuery('[name="woStatus"]')[0], "change");	//No I18N
                    if(save_resol) {
                    	addResolution();
                    }
                }, 10);
                setTimeout(function() {
			        $req.details.changeTab(module);
                }, 1000);
		    } else {
			    setTimeout(function(){
				    jQuery('[name="woStatus"]').val($req.details.request_info.status.id);
				    $req.utils.safeTrigger(jQuery('[name="woStatus"]')[0], "change");	//No I18N
			    }, 10);
		    }
	    } else if($req.prop.replyTemplateStatus) {
	    	var alert_key
	    	if(module === "tasks") {	//No I18N
	    		alert_key = getMessageForKey("request.tasks.notcompleted");	//No I18N
	    	} else if(module === "dependency"){	//No I18N
	    		alert_key = getMessageForKey("request.dependency.notclosed");	//No I18N
	    	} else  if(module === "worklogs") {	//No I18N
    			alert_key = getMessageForKey("request.worklogs.notfound");	//No I18N
			} else if(module === "checklists") {	//No I18N
    		    alert_key = getMessageForKey("closingrules.checklists.verified");	//No I18N
			}
			setTimeout(function(){
                    jQuery('[name="woStatus"]').val($req.details.request_info.status.id);
                    $req.utils.safeTrigger(jQuery('[name="woStatus"]')[0], "change");	//No I18N

                }, 1000);
			alert(alert_key);


	    }else if($req.prop.checkBulkEdit) {
	    	var prop_alert_key;
	    	if(module === "tasks") {
	    		prop_alert_key = getMessageForKey("request.tasks.notcompleted") + " " + getMessageForKey("request.properties.save.tabs.move.alert", [getMessageForKey("task.title")]);	//No I18N
	    	} else if(module === "dependency"){	//No I18N
	    		prop_alert_key = getMessageForKey("request.dependency.notclosed") + " " + getMessageForKey("request.properties.save.tabs.move.alert", [getMessageForKey("sdp.requests.viewrequest.dependency")]);	//No I18N
	    	} else  if(module === "worklogs") {	//No I18N
    			prop_alert_key = getMessageForKey("request.worklogs.notfound") + " " + getMessageForKey("request.properties.save.tabs.move.alert", [getMessageForKey("sdp.requests.common.worklog")]);	//No I18N
    		} else if(module === "checklists") {	//No I18N
    		    prop_alert_key = getMessageForKey("pending.checklists.checkliststab");	//No I18N
			}
		    if(confirm(prop_alert_key)) {
                jQuery('#propertyDetailForm [name="status"]').select2("val", $req.details.request_info.status.id);	//No I18N
                $req.prop.inlineSave();
                setTimeout(function() {
                    $req.details.changeTab(module);
                }, 1000);
		    } else {
			    setTimeout(function() {
                    jQuery('#propertyDetailForm [name="status"]').select2("val", $req.details.request_info.status.id);	//No I18N
			    }, 10);
		    }
		    return false;
	    } else {
	    	if(confirm(alert_key)) {
                $req.details.changeTab(module);
	    	} else {
	    		setTimeout(function() {
                    jQuery('#propertyDetailForm [name="status"]').select2("val", $req.details.request_info.status.id);	//No I18N
			    }, 10);
	    	}
        }
	},

	/* In status change pop up, "CLOSE" button is clicked will show alert and set previous status id .if status change comment is mandatory. */
	closeAlert: function (select,existingStatusID){
	   if(confirm(getMessageForKey("sdp.request.statuschange.cancel.alert"))==true)
	   {
	    select.value=existingStatusID;
	     jQuery(select).select2('val',existingStatusID);//No I18N
	       $req.prop.divClear('FCR_IP');//No I18N
	       $req.prop.closeJQueryDialog();
	   }
	},

	/* clear Div */
	divClear: function(element){
		if(document.getElementById(element)!=null){
	        document.getElementById(element).value="";
	    }
	},

	/*close acceptability (close PopUp)*/
	checkCloseAccept:function() {
	    if(!$req.prop.wizard.isEnabled) {
		    $req.prop.closeJQueryDialog();
		    jQuery('#wotoClose').dialog({
		        modal:true,
		        closeOnEscape: true,
		        open: function() {
		            jQuery(".ui-dialog-titlebar-close").off('click').on('click',function() { //NO I18N
		                $req.prop.hideClosureCodeDetails($req.details.request_info.status.id);
		            });
		        },
		        position: { my: "center center", at: "center center", of: window }, //NO I18N
		        width:600,
		        title:getMessageForKey("sdp.requests.viewrequest.closerequest")
		    });
		} else {
			jQuery('#wotoClose').show();
		}
	},

	/*on submit the close pop up */
	submitCloseAccepted:function (form,checkcmnt) {
		jQuery("[name=CloseAccept]").prop("disabled",true); // No I18N
		// #83227 Append <br> to the editor content manually when it is saved first time
		if(parent.description_editor) {
			parent.description_editor.setHTML(parent.description_editor.getHTML());
		}
		if(parent.resolution_editor) {
			parent.resolution_editor.setHTML(parent.resolution_editor.getHTML());
		}
		if($req.sdp_user.USERTYPE=="Requester"){
			//form && $req.prop.setClosureValue(form);
			if($req.details.self_service_portal_settings.is_close_comment_mandatory && $req.details.self_service_portal_settings.status_change_comment && jQuery("#wotoClose [name=closeComment]").val().trim()==""){
				alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
				return;
			}
			if(!$req.details.self_service_portal_settings.is_close_comment_mandatory){
				this.sectionalUpdateJson.status_change_comments=getMessageForKey("request.closed");
			}
			else{
				this.sectionalUpdateJson.closure_info ={requester_ack_comments:jQuery("#wotoClose [name=closeComment]").val()}
		    }
		    var jsonUpdate = window.sdpToJSON({"request":this.sectionalUpdateJson}); //NO I18N
		    var input_data={
		    	headers: { Accept: 'application/v3+json' }, //NO I18N
		    	type: 'PUT', //NO I18N
		    	data: {"input_data":jsonUpdate},  //NO I18N
		    	url: '/api/v3/requests/'+woID+'/close', //NO I18N
		    	async: false,
		    	success: function(data){
		    		$req.details.getRequestInfo(woID);
		    		$req.details.updateRequestTemplates('property'); //NO I18N
		    		$req.rpanel.render();
		    		$req.utils.alert("success", getMessageForKey("request.updated"),"isAutoHide=true"); //NO I18N
		    	},
		    	error:function(data) {
		    		$req.utils.alert('warning',getMessageForKey("api.request.close.failuremsg"),'isAutoHide=true, delay=15'); //NO I18N
		    	}
	    	}
			sdpAjax(input_data);
	    	$req.prop.closeJQueryDialog();
	    	return;
		}
		if(checkcmnt === true) {
	        var comment=form.requestclosurecomment;
	        var reqCloseComment=form.closeComment;
	            if($req.details.self_service_portal_settings.status_change_comment && comment !== null && trim(comment.value) === "") {
	                alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
	                form.requestclosurecomment.focus();
	                return;
	            } else if($req.details.self_service_portal_settings.status_change_comment && comment==null && reqCloseComment!=null && trim(reqCloseComment.value)=="" ) {
	                alert(getMessageForKey("sdp.request.statuschange.close.addcomment"));
	                reqCloseComment.focus();
	                return;
	            } else {
	            	$req.prop.closeRequest(form);
	            }
	    } else {
	    	$req.prop.closeRequest(form);
	    }
	},

	/* check the close mandatory fields and update the close request */
	closeRequest:function(form){
	    $req.prop.setClosureValue(form);
	    if(!$req.prop.wizard.isEnabled)
	    {
	    	$req.prop.closeJQueryDialog();
	    }
	    //if(!$req.prop.checkResolutionStatus && !$req.prop.checkBulkEdit){
	        $req.prop.inlineSave();
	    //}
	},
	/* status Close Form */
	setClosureValue:function (form){
		this.closure_info = {};
	    for(var i=0,ilen=form.length;i<ilen;i++){
	    	var element = form[i];
	    	var name = element.name;
	    	switch(name){
	    		case 'checkFCR': //NO I18N
	    		    if(element.checked){
	                    this.fcrUpdateJson = true;
	                }else{
	                    this.fcrUpdateJson = false;
	                    element.checked = false;
	                }
	    		break;
	    		case 'closeAccepted': //NO I18N
	    		    if(element.value == "NO"){
	    		    	break;
	    		    }
	    		    else{
	    		    	if(element.checked){
	                        this.closure_info.requester_ack_resolution = true;
	                    }else{
	                        this.closure_info.requester_ack_resolution = false;
	                    }
	                }
	    		break;
	    		case 'closeComment': //NO I18N
	    		    if(element.value === ""){
	                    this.closure_info.requester_ack_comments = null;
	    		    }else{
	    		    	this.closure_info.requester_ack_comments = element.value;
	    		    }
	    		break;
	    		case 'closurecode': //NO I18N
	    		    if(element.value === "null" || element.value === ""){
	                    this.closure_info.closure_code = null;
	                }else{
	                    this.closure_info.closure_code = {id:element.value};
	                }
	    		break;
	    		case 'requestclosurecomment': //NO I18N
	    		    if(element.value === ""){
	    		    	this.closure_info.closure_comments = null;
	    		    }else{
	    		        this.closure_info.closure_comments = element.value;
	    		    }
	    		break;
	    		case 'closeWithoutNotif':	// written for SCP	//NO I18N
	    			if(isSCP){
	    				if(element.checked){
	                	    this.closeWithoutNotif = true;
	                	}else{
	                    	this.closeWithoutNotif = false;
	                    	element.checked = false;
	                	}
	                }
	    		break;
	    		default:
	    	}
	    }
	},


	/************ status Resolve **************/
	/* open resolve pop up*/
	getResolvedClosureCode:function() {
		if(!$req.prop.wizard.isEnabled) {
			$req.prop.closeJQueryDialog();
			jQuery('#closureForCompletedStatus').dialog({
				modal: true,
				closeOnEscape: true,
				open: function() {
					jQuery(".ui-dialog-titlebar-close").off('click').on('click', function() {	// No I18N
						$req.prop.hideClosureCodeDetails($req.details.request_info.status.id);
					});
				},
				position:  { my: "center center", at: "center center", of: window },	// No I18N
				width: "500px",	// No I18N
				title: getMessageForKey("sdp.requests.viewrequest.resolveRequest")	// No I18N
			});
		}
		else{
			jQuery('#closureForCompletedStatus').show();
		}

	},
	/* update Closue Fields */
	updateClosureFields:function(form,commentMand) {
	    var comment=form.requestclosurecomment;
	    if( $req.details.self_service_portal_settings.status_change_comment && commentMand!= undefined && commentMand && comment!=null && trim(comment.value)==""){
	        alert(getMessageForKey("sdp.request.statuschange.addcomment"));
	        comment.focus();
	        return false;
	    }else{
	    	$req.prop.setClosureValue(form);
	    	if(!$req.prop.wizard.isEnabled)
	    		{
	    	$req.prop.closeJQueryDialog();
	    		}
		    //if(!$req.prop.checkResolutionStatus && !$req.prop.checkBulkEdit){
		    	$req.prop.inlineSave();
		    //}
		    }
	},


	/************************ Mandatory Comment ***********************/
	/* To set previous status id if cancel or close operation is performed in onhold pop up when status comment is mandatory. */
	setPrevStatusId:function (prevStatusID){
		var closeId = $req.details.operational_data.close_status_id;
		var resolveId = $req.details.operational_data.resolved_status_id;
		var statusId = $req.details.request_info.status.id;
		var statusCommentMandatory = $req.details.self_service_portal_settings.status_change_comment;
		if(statusId === closeId){
			var closeForm = jQuery('#wotoClose');
			 closeForm.find('[name="checkFCR"]').prop('checked',false); //NO I18N
			 closeForm.find('#clacpNo').prop('checked',true); //NO I18N
			 closeForm.find('[name="closeComment"]').val('');
			 closeForm.find('[name="closurecode"]').val("null"); //NO I18N
			 closeForm.find('[name="requestclosurecomment"]').val('');
		}else if(statusId === resolveId){
			var resolveForm = jQuery('#closureForCompletedStatus');
			resolveForm.find('[name="checkFCR"]').prop('checked',false); //NO I18N
			resolveForm.find('[name="closurecode"]').val("null"); //NO I18N
			resolveForm.find('[name="requestclosurecomment"]').val('');
		}
		prevStatusID = prevStatusID ? prevStatusID : $req.details.request_info.status.id;
		prevStatusID = parseInt(prevStatusID);
		if(!statusCommentMandatory){
			if($req.prop.checkRightPanel){
	       	  jQuery('#status-right-panel').find('[name="status"]').val(prevStatusID).trigger('change');
	        }else{
	            jQuery('#propertyDetailForm [name="status"]').val(prevStatusID).trigger('change');
	        }
	       /* Below code is for Resolution edit page - status change select2 retaining */
	        if(jQuery('#woStatus_Id').length > 0) {
	       		jQuery('#woStatus_Id').val(prevStatusID);	// No I18N
	       		jQuery('#woStatus_Id').select2('val',prevStatusID);	// No I18N
	        }
	        if(!$req.prop.wizard.isEnabled)
	        	{
	        $req.prop.closeJQueryDialog();
	        	}
		}else if(confirm(getMessageForKey("sdp.request.statuschange.cancel.alert"))==true){
	        if($req.prop.checkRightPanel){
	       	  jQuery('#status-right-panel').find('[name="status"]').val(prevStatusID).trigger('change');
	        }else{
	            jQuery('#propertyDetailForm [name="status"]').val(prevStatusID).trigger('change');
	        }
	        /* Below code is for Resolution edit page - status change select2 retaining */
	        if(jQuery('#woStatus_Id').length > 0) {
	       		jQuery('#woStatus_Id').val(prevStatusID);	// No I18N
	       		jQuery('#woStatus_Id').select2('val',prevStatusID);	// No I18N
	        }
	        if(!$req.prop.wizard.isEnabled) {
	        	$req.prop.closeJQueryDialog();
	    	}
	    }
	    else{
	        jQuery("#_DIALOG_LAYER #onHoldComments").trigger('focus');
	        jQuery("#_DIALOG_LAYER #closeCommentText1").trigger('focus');
	    }
	},

	/* status comment are validated and if comment is not empty means additionaParams are added with form action and then the form is submited. */
	checkStatusComment:function (form){
	    $req.prop.divClear("statusChangeComment");// NO I18N
	    var comment=form.statusChangeComment;
	    if(comment!=null && trim(comment.value)==""){
	        alert(getMessageForKey("sdp.request.statuschange.addcomment"));
	        comment.focus();
	        return false;
	    }else{
	        if(document.getElementById("resStatusComment")!=null){
	            document.getElementById("resStatusComment").value=comment.value;
	        }else if( document.getElementById("statusChangeComment")!=null){
	            document.getElementById("statusChangeComment").value=comment.value;
	        }
	        $req.prop.status_change_comments = trim(comment.value);
	        if(!$req.prop.wizard.isEnabled)
	        	{
	        $req.prop.closeJQueryDialog();
	        	}
	        //if((!$req.prop.checkResolutionStatus && !$req.prop.checkBulkEdit) || (this.fromListview)){
	        	$req.prop.inlineSave();
	        //}
	        }
	},
	highLightMandatoryFields:function(){
		var mandatoryFields = $req.prop.highLightFields;
	    for(var i=0,ilen=mandatoryFields.length;i<ilen;i++){
	    	jQuery('[data-field="'+mandatoryFields[i].toUpperCase()+'"]').parents('.right-col').animate({backgroundColor: "#fff1db"}); //NO I18N
	    }
	    setTimeout(function(){
	    	for(var i=0,ilen=mandatoryFields.length;i<ilen;i++){
	    	    jQuery('[data-field="'+mandatoryFields[i].toUpperCase()+'"]').parents('.right-col').css('background',''); //NO I18N
	        }
	    },2000);
	},

	/* to set the existing status id if cancel or close operation is performed in close dialog box.when status comment is mandatory. */
	hideClosureCodeDetails:function(statusid){
	     if(statusid !== null || statusid !== undefined){
	        $req.prop.setPrevStatusId(statusid);
	        if(jQuery('#closureCodePlaceHolder').length){
	            jQuery('#closureCodePlaceHolder').html("");
	        }
	    }
	},


	/******************** Status Onhold ************************/
	/* schedulerCommentMand- to check comment is mandatory or not if true means the comments are mandated and validated */
	runOnHoldScheduler:function (form,schedulerCommentMand){
		this.onhold_scheduler.change_to_status = null;
	    this.onhold_scheduler.scheduled_time = null;
	    this.onhold_scheduler.comments = null;
	    var statusVal = jQuery('#propertyDetailForm [name="status"]').val();
	    if(statusVal !== undefined && ($req.details.request_info.status.id !== statusVal)){
	        var statusChangeComment = form.onHoldComments;
	        if(schedulerCommentMand !== null && schedulerCommentMand === true){
	            if($req.details.self_service_portal_settings.status_change_comment && statusChangeComment != null && trim(statusChangeComment.value) == ""){
	                alert(getMessageForKey("sdp.request.statuschange.addcomment"));
	                statusChangeComment.focus();
	                return false;
	            }
	            /* set the on status change comment */
	            this.status_change_comments = trim(statusChangeComment.value);
	        }

	    }
	    var schedulerComment= form.onHoldSchedulerComments;
	    var currentTime=document.getElementById('currentTimeId').value;//No I18N
	    var selectedTime = "";
	    var selectedStatus = "";
	    var check=document.getElementById("statusIdCheck");
	    if(check.checked==true){
	    	 selectedTime=document.getElementById('date1').value;//No I18N
	         selectedStatus=document.getElementById('selectedStatus').value ;
	        if(jQuery('#date1_Display').val() == ""){
	            alert("Schedule time can't be Empty");//No I18N
	            return false;
	        }else if($req.details.self_service_portal_settings.status_change_comment && jQuery('#onHoldSchedulerComments').val() == ""){
	            alert("Schedule Comment can't be Empty");//No I18N
	            return false;
	        }
	    }

	    if(selectedTime>currentTime)
	    {
	        if(trim(schedulerComment.value) !== ""){
	            this.onhold_scheduler.comments = trim(schedulerComment.value);
	        }
	        // else{
	        //     this.onhold_scheduler.comments = null;
	        // }

	        if(selectedStatus !== ""){
	        	this.onhold_scheduler.change_to_status = {"id" : selectedStatus}; //NO I18N
	        	this.onhold_scheduler.scheduled_time = {"value" : selectedTime}; //NO I18N
	        }
	        //else{
	        //	this.onhold_scheduler.change_to_status = null;
	        //	this.onhold_scheduler.scheduled_time = null;
	        //}
	        if(!$req.prop.wizard.isEnabled)
	        {
	        $req.prop.closeJQueryDialog();
	        }
	        closeCalDialog();
	        //if((!this.checkBulkEdit || this.checkRightPanel || this.fromListview)){
	        	$req.prop.inlineSave();
	        //}
	    }else{
	    	if(selectedTime < currentTime && selectedTime !== ''){
	        	alert(getMessageForKey('api.onholdscheduler.scheduledtime.invalid'));//No I18N
	        }
	        else{
	        	if(!$req.prop.wizard.isEnabled)
		        {
	        	$req.prop.closeJQueryDialog();
		        }
	            closeCalDialog();
	            //if((!this.checkBulkEdit || this.checkRightPanel || this.fromListview) && !$req.prop.checkResolutionStatus){
	        	    $req.prop.inlineSave();
	            //}
	        }
	    }
	},

	/* close PopUp */
	closeJQueryDialog:function(id){
	    if($req.prop.wizard.isEnabled) {
	    	jQuery("#closeRequestPopUp").dialog('close');//No i18n
	    }
	    try {
	    	/** closing sticky notes before destroying as it might have unsaved content */
		    if(jQuery("#sticky_dialog").is(":visible") && jQuery("#sticky_dialog").hasClass("ui-dialog-content")) {	//No I18N
		    	jQuery("#sticky_dialog").dialog("close"); //No I18N
		    }
	    } catch(ex) {
	    	console.error(ex);
	    }
	    jQuery(".ui-dialog-content").dialog().dialog("destroy"); //No I18N
	},
	updateRLCNotes:function (form,canSave) {
        var self = this;
        var notes = $req.details.conv.getNoteDataFromForm("#wo-rlc-notes #editor-placeholder"); // NO I18N
        self.rlc_notes = notes;
        if(canSave){
            $req.prop.inlineSave();
        }
	},
	/* onhold cancel */
	initiateCopy:function(){
	    $req.prop.closeJQueryDialog();
	    closeCalDialog();
	},
	/* Prompt box for status change to On Hold */
	statusChangeCheck:function (select){
	    var newStatusID = parseInt(select.value);
	    var inactiveStatusList = $req.details.operational_data.status_stop;
	    if(inactiveStatusList.length && (!isMSPOrSCP || isOnholdScheduleMandatory))	// for MSP OnHold Schedule configuration needs to be shown based on SSP setting
	    {
	        if(inactiveStatusList.indexOf(newStatusID) !== -1){
	        	$req.prop.loadOnHoldScheduler(false);
	            //$req.prop.showClosureCodeDetails(select, closedStatusID, existingStatusID,isStatusComment,isCloseComment);
	        }
	    }
	},
	/* load from image */
	loadOnHoldBox:function (event, val) {
		if(val) {
			$req.details.resetProperties();
			$req.details.initialize(val);
			$req.prop.render();
		}
	    //only image click event will work
	    $req.details.renderOnholdStatusPopUp();
		if(event){
		    event.stopPropagation();
	        event.preventDefault();
		}
	    if(document.getElementById('loadDirect@@@')!=null){
	        $req.prop.loadOnHoldScheduler(true);
	    }else{
	        if(document.getElementById('onHoldBox@@@')!=null){
	            var html_src = document.getElementById('onHoldBox@@@').innerHTML;
	            html_src = html_src.replace(/@@@/g, '');
	            var title = getMessageForKey("sdp.requests.viewrequest.scheduleonhold");
	            jQuery('<div class="disp-h">'+html_src+'</div>').dialog({modal:true,top:200,left:200,width:"650px",title: title}); // No I18N
	            jQuery('#editLinkId').off('click').on('click', () => { //No I18N
	                $req.prop.loadOnHoldScheduler(true);
	            })
	        }
	    }
	},
	/* this function excute on status comment mandatory & In spot edit ,to show pop  up for status changes performed. */
	showStatusChangeDialog:function (statusId){
		if(!$req.prop.wizard.isEnabled)
		{
		$req.prop.closeJQueryDialog();
		}
	    var inactiveStatusList=null;
	    var newStatusId = jQuery('#newStatusId');
	    if(newStatusId.length){
	        newStatusId.val(statusId);
	    }
	    if(document.getElementById('inactiveStatusListId')!=null)
	    {
	       inactiveStatusList=jQuery('#inactiveStatusListId').val();
	    }
	    if(inactiveStatusList && inactiveStatusList.indexOf(parseInt(statusId))!=-1 && (!isMSPOrSCP || isOnholdScheduleMandatory))	// for MSP OnHold Schedule configuration needs to be shown based on SSP setting
	    {
	        jQuery("#onHoldSetId").val("ONHOLD");//No I18N
	        jQuery("#newStatusId1").val(statusId);
	        jQuery("#fromSpotEdit").val("true");
	        $req.prop.loadOnHoldScheduler(false);
	    }
	    else
	    {
	    	if(!$req.prop.wizard.isEnabled)
			{
	        jQuery('#woStatusChangebox').dialog({modal:true, closeOnEscape: false, open: function() { jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ $req.prop.setPrevStatusId($req.details.request_info.status.id); }); },  position: { my: "center center", at: "center center", of: window },width:"500px",closeOnEscKey:"no", title: getMessageForKey("sdp.request.statuschange.popup.title")}); // No I18N
			}
			else{
				jQuery('#woStatusChangebox').show(); // No I18N
			}
	        jQuery('[name="statusChangeComment"]').val("");
	    }
	 },
	/* load the onhold pop up */
	loadOnHoldScheduler: function (skip) {
		if(!$req.prop.wizard.isEnabled) {
			$req.prop.closeJQueryDialog();
        }
        if(isMSPOrSCP && !isOnholdScheduleMandatory) {
            // if in SSP On Hold Scheduler is not enabled, do not show this pop-up
            return;
        }
	    if(document.getElementById('existingScheduleId')!=null && document.getElementById('existingScheduleId').value=="true" && !skip && !$req.prop.wizard.isEnabled) {
	        $req.prop.loadOnHoldBox();
	    } else {
	        //load box if already schedule is available
	        var wotoOnHoldWithoutForm = jQuery('#wotoOnHoldWithoutForm');
	        if(wotoOnHoldWithoutForm.length){
	            var html_src = wotoOnHoldWithoutForm.html();
	            html_src = html_src.replace(/@@@/g, '');
	            if(!$req.prop.wizard.isEnabled) {
	                jQuery(html_src).dialog({modal:true,closeOnEscape: false, open: function() { jQuery(".ui-dialog-titlebar-close").off('click').on('click',function(){ $req.prop.setPrevStatusId($req.details.request_info.status.id); }); },  position: { my: "center center", at: "center center", of: window },width:"650", title: getMessageForKey("sdp.requests.viewrequest.scheduleonhold")}); // No I18N
	            } else {
                	jQuery("#wo-status-hold").append(html_src);
                }
	            //Fill the Details of onhold popUp
	            $req.prop.autoFillSchedule();

	            //if schedule does not exist, set the status type as onhold //TO DO
	            if(!(document.getElementById('existingScheduleId')!=null && document.getElementById('existingScheduleId').value=="true")) {
	                $req.prop.divCopy('onHoldSetId','1');//No I18N
	                $req.prop.divCopy('onHoldSetId','2');//No I18N
	            }
	        }
	    }
	    /* hide the status change comment box */
	    if(skip){
			jQuery('#onHoldComments').parent().addClass('hide');
			document.getElementById('statusIdCheck').checked=true;
			$req.prop.checkUncheck();
			if(jQuery('#onHoldComments').parent().hasClass('hide')){
	            jQuery('[name="woOnHoldForm"]').find('[name="cancel"]').off('click').on('click',(event)=>{
					$req.prop.closeJQueryDialog()});
	            jQuery(".ui-dialog-titlebar-close").off().on('click',function(){ $req.prop.closeJQueryDialog();});
	        }
		}
		$req.details.bindEvents.property_templates.status_onhold_template();
	},
	/* auto filled onhold schedule */
	autoFillSchedule:function (){
	    if(document.getElementById('existingScheduleId')!=null && document.getElementById('existingScheduleId').value=="true")
	    {
	        document.getElementById('statusIdCheck').checked=true;
	        document.getElementById('changeStatusSelect').value=document.getElementById('changeToStatusId').value;
	        document.getElementById('date1').value=document.getElementById('scheduledTimeId').value;
	        $req.prop.checkUncheck();
	        initCalendar('date1',null,null,null,null,null,null,null,null,null,null,true);//No I18N
	    }
	    if(document.getElementById('schedulerCommentsId') !=null && document.getElementById('schedulerCommentsId').value !=null)
	    {
	        jQuery("#onHoldSchedulerComments").val(jQuery("#schedulerCommentsId").val().trim());
	    }else{
	    	jQuery("#onHoldSchedulerComments").val(jQuery("#onHoldSchedulerComments").val().trim());
	    }
	},
	/* copy div */
	divCopy:function(element,extraParam){
	    var element1=element+""+extraParam;
	    if(document.getElementById(element1)!=null)
	    {
	        document.getElementById(element1).value=document.getElementById(element)&&document.getElementById(element).value;
	    }
	},
	/* onhold scheduler check uncheck */
	checkUncheck:function (){
	    var check=document.getElementById("statusIdCheck");
	    if(check.checked==true){
	        document.getElementById('chbxsts').innerHTML=getMessageForKey("sdp.viewrequest.onhold.statuschangetrue");
	        document.getElementById("selectedStatus").value=document.getElementById("changeStatusSelect").value;
	        jQuery("#ohchsts").removeClass('hide'); //No I18N
	    }else{
	        document.getElementById('chbxsts').innerHTML=getMessageForKey("sdp.viewrequest.onhold.statuschangequestion");
	        document.getElementById("selectedStatus").value="";
	        jQuery("#ohchsts").addClass('hide'); //No I18N
	    }
	},

	wizard: {
		needToFill: {data:[], text:""}, //Mandatory date need to fill needToFill.data forfields and needToFill.text for warning tag
		isEnabled: false,//Wizard is shown or not
		tabs: {tab_order: []},//Tabs opened in wizard
		options:{},
		showWizard:false,//to show property tab even every mandate fields are filled
		render: function() {
			if(!$req.prop.replyTemplateStatus){
				$req.prop.closeJQueryDialog();// before opening any wizard close other popup
			}
			$req.prop.onhold_scheduler = {};//setting on hold schedular to null
			$req.prop.closure_info = {};//setting on closure info schedular to null
			$req.prop.status_change_comments = ""//setting status change comments to null
			$req.prop.wizard.isEnabled = true;
			$req.prop.isOperationComplete = false;
			jQuery("body").css("overflow", "hidden");	//No I18N
			var width = 1100;
			try {
				if(window.externalframe && window.parent.sdp_app){
					if(top.jQuery("#wo-details-frame").length){
						width =  top.jQuery("#wo-details-frame").width() * 0.860; //NO I18N
					}else if(top.jQuery("#dynamiclistview").length){
						width = top.jQuery("#dynamiclistview").width() * 0.70; //NO I18N
					}
				}
			} catch (error) {}

			jQuery("#closeRequestPopUp").dialog({
				width:width,
				height: "auto",//No i18n
				position:  { my: "top", at: "top", of: window },//No i18n
				modal: true,
				top:100,
				resizable: true,
				closeOnEscape: false,
				beforeClose: function(event, ui) {
					if(event && event.originalEvent && event.originalEvent.target && event.originalEvent.target.hasClassName("ui-dialog-titlebar-close")) {
						$req.prop.wizard.cancel = true;
					}
				},
				open: function (eve){
                    if($req.prop.replyTemplateStatus && !jQuery("#notification-component-popup-wrapper").hasClass("hide")){
                		jQuery("#notification-component-popup-wrapper,.zdialog--overlay").addClass("hide").removeClass("show"); //No I18N
                	}
                	},
                close:function() {
                    // SD-128428 When the RLC Transition buttons are displayed in Details page, after Closure Popup's Cancel, need to re-enable the transition buttons
                    // In other Right-panel and Property section buttons, the template will be re-rendered with button enabled. So only the left-panel transition button is handled here.
                    jQuery('#left-panel .btn-transition').prop({disabled: false});//no i18n

                	if( $req.prop.replyTemplateStatus && jQuery("#notification-component-popup-wrapper").hasClass("hide")){
                		jQuery("#notification-component-popup-wrapper,.zdialog--overlay").addClass("show").removeClass("hide"); //No I18N
                		jQuery("body").addClass("of-h"); //No I18N

                	}
					var retain_prop = $req.prop.getChangedFields();//Need to retain if fafr is applied
					var isCancelled = $req.prop.wizard.cancel;
					$req.prop.wizard.cancel = null;
					$req.prop.element = "property-content";//No i18n
					$req.prop.wizard.isEnabled = false;
					$req.prop.isOperationComplete = true;
					$req.prop.wizard.showWizard=false;
					$req.prop.wizard.tabs = {tab_order:[]},//resetting the wizard tabs
					$req.prop.wizard.toStatus=null;
					$req.prop.wizard.needToFill = {data:[], text:""},//resetting the need to Fill
					/** destroy the Z-Editor */
					$req.prop.closeAssignComments();
					$req.prop.rlc_notes = null; //rlc_notes should be destroyed on close, not on success
					jQuery("#technicianPopUp").find(".form-wrapper").css({"width":"", "height": "","overflow-y": ""});  // NO I18N
					jQuery("#closeRequestPopUp").html(''); // destroying the popup html
					jQuery("#closeRequestPopUp").dialog('destroy');//No I18N
					jQuery(".ui-front").css("z-index", "1001");//No i18n
					jQuery(".ui-widget-overlay.ui-front").css("z-index", "99");//No i18n
					if(window.current_req_mode !== "kanban") {
						jQuery("body").css("overflow", "inherit");	//No I18N
					}
					//closeCalDialog(); // close cal dialog if its open
					if(!isCancelled && ($req.prop.checkResolutionStatus || $req.prop.resol_update || $req.prop.replyTemplateStatus)){
						$req.prop.render(undefined,true); //rerendering the property tab and right panel to avoid fafr conflicts and changes during wizard open
					} else {
						$req.prop.render(); //rerendering the property tab and right panel to avoid fafr conflicts and changes during wizard open
					}
					if( window.current_req_mode !== "kanban"){
						$req.rpanel.render();
					}
					//there will be no tabs in listview and
					if($req.prop.fromListview){
						$req.prop.resetStatusFields();
						/** for kanban list view, when the close popup is shown and closed, the callback has to be triggered; */
						if($req.prop.fromListview && window.current_req_mode === "kanban" && $req.prop.checkSubmitMsg !== "success" && $req.prop.checkSubmitMsg !== "warning") {
							if(window.requestListViews && window.requestListViews.kanbanUpdateFn) {
								window.requestListViews.kanbanUpdateFn(false);
							}
						} else {
							jQuery("[name='status'").select2("val",$req.details.request_info.status.id);//no i18n
							return
						}
					}
					if($req.prop.checkResolutionStatus || $req.prop.resol_update || $req.prop.replyTemplateStatus) {// we should not reolad tab if its from status change occurs from resolution
						var current_status = retain_prop.fields.status;
						if(!current_status) {
							current_status = $req.details.request_info.status.id;
						}
						jQuery("select[name='woStatus']").select2("destroy");//destroying select2 in resolution tab and invoking again to perform select2 //No i18n
						if($req.prop.replyTemplateStatus){
							$req.prop.setEditReplyTemplateStatus(true);
						}
						else{
						$req.prop.setEditResolutionStatus(true);
						}
						if($req.prop.wizard.options.resol_close !== true) {
							current_status = $req.details.request_info.status.id;
						}
						$req.prop.wizard.options.resol_close=false;

						jQuery("select[name='woStatus']").select2("val", current_status);//No i18n

						jQuery("select[name='woStatus']").select2("close");//No i18n
						/** Property values should not be retained when the cancel button is clicked */
						if(isCancelled) {
							$req.prop.wizard.needToFill.data = [];
							$req.prop.description = null;
							$req.prop.fafr_dependent_fields=[];
							$req.prop.fafr_mandate_keys=[];
						} else {
							$req.prop.restoreFields(retain_prop);
						}
						if($req.prop.resol_editor !== null) {
							resolution_editor = $req.prop.resol_editor;
							$req.prop.resol_editor = null;
						}
						$req.prop.resol_update = false;
					} else {
						$req.prop.fafr_mandate_keys=[];
						$req.prop.fafr_dependent_fields=[];
						$req.details.changeTab($req.details.tab_name); // rerender previous tab
						$req.prop.resetStatusFields();
						$req.prop.checkRLC = false;
					}

					/**
					 * Remove the Assign Comments Value
					 */
					window.assign_comments = undefined;
					jQuery("body").css("overflow","auto"); // NO I18N
				}
			})
			.parent().find(".ui-dialog-titlebar-close").click(function() {
                           if($req.prop.replyTemplateStatus){
            				$req.details.updateRequestTemplates("property");//Updating property section edit when close button is clicked// NO I18N
            			   }
            });
			/*if($req.prop.replyTemplateStatus){
				jQuery( "#closeRequestPopUp" ).dialog( "option", "modal", true );//No I18N
			}*/
			jQuery("#closeRequestPopUp").parent().css({position: 'fixed',top:100,height:"80%","z-index":"99"});//No i18n
			jQuery(".ui-widget-overlay.ui-front").css({"z-index":"98"});//No i18n

		},
		//This function is to access status change from button trigger can be used close button and RLC transition button change
		invokeAction:function(value){
			if($req.details.tab_name=="resolution" && jQuery(".sdtab-content #ze_HTMLDesc_Focus").is(":visible") && $req.prop.cancelResolution("resolution") === false) {
				return false;
			}
			$req.prop.checkRLC = true;
			if($req.prop.checkBulkEdit) {
				$req.prop.sectionalCancel();
			}
			if($req.prop.checkRightPanel){
				$req.prop.renderForm();
			}
    			$req.prop.sectionalEdit(true);
    			$req.prop.sectionalCancel();
			//calling setFieldAndFormRules here to apply on form load rules.
			$req.prop.setFieldAndFormRules(false);
			jQuery('#left-panel .btn-transition').prop({disabled: true});//no i18n
			jQuery('#right-panel .btn-transition').prop({disabled: true});//no i18n
    		setTimeout(function(){
    			jQuery("[name='status']").val(value).trigger("change");//no i18n
    		},100);
    		return;
		},
		statusChange: function(value,fields,event) {
			var _self = $req.prop.wizard;
			value = value || $CS.getValue("STATUS") || $req.details.request_info.status.id;//No i18n
			value = parseInt(value);
			if(value && $req.prop.wizard.isEnabled && value != _self.toStatus) {
				var retain_prop=$req.prop.getChangedFields();//Need to retain if fafr is applied
				jQuery("#closeRequestPopUp").dialog('close');//No i18n
				$req.prop.sectionalFieldsEdit(true);
				$req.prop.restoreFields(retain_prop);
				$req.prop.fafr_dependent_fields=[];
				_self.showWizard=true;
				_self.toStatus=value;
				$req.prop.wizard.statusChange(value);
				return;
			}
			else if($req.prop.wizard.isEnabled||!value){
				return;
			}
			$req.prop.resetStatusFields();
			_self.toStatus=value;
			$req.prop.wizard.tabs = {tab_order: []};
			_self.options = {
				closedStatusID: parseInt($req.details.operational_data.close_status_id),
		    	resolveStatusID: parseInt($req.details.operational_data.resolved_status_id),
		    	inactiveList: $req.details.operational_data.status_stop,
		    	additionalClosedStatus: $req.details.operational_data.closed_resolved_status,
		    	statusCommentMandatory: $req.details.self_service_portal_settings.status_change_comment,
	        	showClosurePopUpForResolvedStatus: false,
	        	closeCommentMandatory: $req.details.request_closing_rules.is_close_comment_mandatory,
	        	mandate:[]
	        };
	        //get closing rules if its closing rule is empty and incase of close and resolve status only
	        if((value === _self.options.closedStatusID || value == _self.options.resolveStatusID) && !Object.keys($req.details.request_closing_rules).length) {
				$req.details.getRequestClosingRulesJson(false);
				_self.options.closeCommentMandatory=$req.details.request_closing_rules.is_close_comment_mandatory;
			}
			//get status mandate fields
			if(!$req.details.status_mandate[_self.toStatus]){
				$req.details.get_status_mandate(woID, _self.toStatus);
			}
		    jQuery('#propertyDetailForm [name="status"]').select2("val", _self.toStatus);//No i18n
		    if(!$req.details.status_mandate[_self.toStatus]){
		    	return;
		    }
		    //handling execution of status close mandatory fields
		    if($req.details.status_mandate[_self.toStatus]["depends_on_requests"].length) {
	  			$req.prop.handleCloseMandatory("dependency", event);	//No I18N
	  			return false;
	   		} else if($req.details.status_mandate[_self.toStatus]["tasks"].length) {
	  			$req.prop.handleCloseMandatory("tasks", event);	//No I18N
	  			return false;
			} else if($req.details.status_mandate[_self.toStatus]["checklists"].length) {
	  			$req.prop.handleCloseMandatory("checklists", event);	//No I18N
	  			return false;
	   		} else if($req.details.status_mandate[_self.toStatus]["to_be_filled"].indexOf("worklog") > -1 && !$req.prop.checkResolutionStatus) {
	  			$req.prop.handleCloseMandatory("worklogs", event);	//No I18N
	  			return false;
	   		} else {
	   			/** SD-76105 : If worklog is mandatory as per closing rules and the status field is opened in Resolution tab, then open the worklog form by default */
	   			if($req.details.status_mandate[_self.toStatus]["to_be_filled"].indexOf("worklog") > -1 && $req.prop.checkResolutionStatus) {
	   				if(!jQuery("[name='timeSpent']").is(":checked")) {
		   				if(confirm(getMessageForKey("request.worklog.closingrule.alert"))) {
		   					jQuery("[name='timeSpent']").trigger("click");
		   				} else {
		   					setTimeout(function(){
							    jQuery('[name="woStatus"]').val($req.details.request_info.status.id);
							    $req.utils.safeTrigger(jQuery('[name="woStatus"]')[0], "change");	//No I18N
						    }, 10);
		   				}
		   			}
	   			}
   		 		//check for mandate fields
		   		$req.prop.mandate_fields_exsists();
				var callback = function() {
    				_self.retain_prop = $req.prop.getChangedFields();
    				$req.prop.element = "mandatoryFields";//No i18n
					$req.prop.render(undefined,true);
					jQuery("#property-content").html('');
					$req.prop.sectionalFieldsEdit(true);
					jQuery('#propertyDetailForm [name="status"]').select2("val",_self.toStatus);//No i18n
					jQuery("#PropertyFrame").find(".control-holder").addClass('fw');
					jQuery("#PropertyFrame").find(".form-control-static").addClass('pt5');
					$req.prop.restoreFields(_self.retain_prop);
					$req.prop.fafr_dependent_fields=[];
					jQuery("#propertyDetailForm [name='status']").prop('disabled',true); //NO I18N
					jQuery("#bottom-property-action").addClass('hide');
				};
				_self.tabs.tab_order.push({
					'name':getMessageForKey("request.properties"),
					'id':'mandate',//No i18n
					'class':'close-active',//No i18n
					'callback':callback,//NO I18N
					validation:function(flag) { // flag is to show validation even everything is filled used in RLC
					 	var infoHeader = false; //Boolean : Need to show info header on wizard (Warning header)
                     	if($req.details.req_warning && $req.details.req_warning.status_code == 21004 ){
                     		let alertMsg = $req.common.setWarningHeader({getMessage : true},$req.details.req_warning,$req.details.meta_info.fields); //If there is any warning messages caught on request : Need to show that on wizard
                     		let alertHTML =`<strong>${getMessageForKey('sdp.common.note')} :</strong> ${alertMsg}`; //No I18N
                     		if(alertMsg){ // if alertMsg is not undefined
                     			 jQuery("#closeRequestPopUp").find('[data-name="mandateFields"] span').html(`${alertHTML}`); //No I18N
                     			 infoHeader = true;//Even if the flag is true , Need to show the alert header because of the warning i
                     		}
                     	}
						$req.prop.mandate_fields_exsists();
						if($req.prop.wizard.needToFill.data.length||flag) {
							if(!flag){
								let mandatoryInfo = getMessageForKey("api.validation.mandatory") + " - <b>" + $req.prop.wizard.needToFill.text.slice(0,-1) + "</b>"//No i18n
                                infoHeader && jQuery("#closeRequestPopUp").find('[data-name="mandateFields"] span').prepend(`${mandatoryInfo}<br><br>`);// Placing mandatory info at first index. //No I18N
								!infoHeader && 	jQuery("#closeRequestPopUp").find('[data-name="mandateFields"] span').html(mandatoryInfo);
                                var height=	jQuery("#closeRequestPopUp").find('[data-name="mandateFields"]').height()+40;
                                if(height>65){
                                	jQuery("#closeRequestPopUp").find('[data-id="mandate"]').height("CALC(100% - "+height+"px)");//No i18n
                                }
							}
							if(!flag || infoHeader){
								jQuery("#closeRequestPopUp").find('[data-name="mandateFields"]').show(); //If warningInfo or mandatoryInfo needs to shown .
							}
							if(!$req.details.status_mandate[$req.prop.wizard.toStatus]){
								return;
							}
							var mandate_fields=$req.details.status_mandate[$req.prop.wizard.toStatus].fields;
							var optional_fields=$req.details.status_mandate[$req.prop.wizard.toStatus].optional_fields;
							if(!(Object.keys($se.rules).length)) {
									if(mandate_fields.indexOf("site")!=-1||mandate_fields.indexOf("group")!=-1||mandate_fields.indexOf("technician")!=-1){
										optional_fields=optional_fields.concat(["site","group","technician"]);//No i18n
									}
									if(mandate_fields.indexOf("item")!=-1||mandate_fields.indexOf("subcategory")!=-1||mandate_fields.indexOf("category")!=-1){
										optional_fields=optional_fields.concat(["item","category","subcategory"]);//No i18n
									}
									if(Object.keys($req.details.operational_data.priority_matrix).length && (mandate_fields.indexOf('priority')>=0 ||optional_fields.indexOf("priority")>=0 )){
										optional_fields=optional_fields.concat(["priority","impact","urgency"]);//No i18n
										if($req.details.request_info.hasOwnProperty("urgency") && !mandate_fields.includes("urgency") ){ //NO I18N
											$req.details.status_mandate[$req.prop.wizard.toStatus].fields.push("urgency");  //NO I18N
										}
										if($req.details.request_info.hasOwnProperty("impact") && !mandate_fields.includes("impact") ){  //NO I18N
											$req.details.status_mandate[$req.prop.wizard.toStatus].fields.push("impact");  //NO I18N
										}
									}
									optional_fields=optional_fields.filter(function (item, pos) {return optional_fields.indexOf(item) == pos});
									$req.details.status_mandate[$req.prop.wizard.toStatus].optional_fields=optional_fields;
							}
							if($req.prop.wizard.needToFill.data.indexOf("description") !== -1||(optional_fields&& optional_fields.indexOf("description")!==-1)||(mandate_fields&& mandate_fields.indexOf("description")!==-1)) {
								jQuery("#PropertyFrame [name='description']").removeClass('hide');
								if($req.prop.description) {
									jQuery("#HTMLDesc").val($req.prop.description);
								} else {
									jQuery("#HTMLDesc").val($req.details.request_info.description);
								}
								$req.prop.showDescriptionField();
							}
							if($req.prop.wizard.needToFill.data.indexOf("resolution") !== -1 || $req.prop.checkResolutionStatus||(optional_fields&& optional_fields.indexOf("resolution")!==-1)||(mandate_fields&& mandate_fields.indexOf("resolution")!==-1)) {
								//Not to rerender for second time
								if(!jQuery("#ze_HTMLResolution").length){
									jQuery("#HTMLResolution").val($req.details.request_info.resolution.content);
									if($req.prop.checkResolutionStatus) {
										jQuery("#HTMLResolution").val(jQuery("#ze_HTMLDesc_Focus").find('.ze_area').contents().find('.ze_body').html())
									}
									jQuery("#PropertyFrame [name='resolution']").removeClass('hide');
									zeditor({element:'HTMLResolution',customName:"resolution_editor",inlineimagesAPI:"api/v3/requests/images"});//NO I18N
								}
								$req.prop.wizard.options.set_resolution=true
								jQuery('#ze_HTMLResolution').find('.ze_area').contents().find('.ze_body').css("background-color","#fff1db"); //NO I18N
							    window.scrollTo(0,document.body.scrollHeight);
							    setTimeout(function(){
							        jQuery('#ze_HTMLResolution').find('.ze_area').contents().find('.ze_body').css("background-color","");  //NO I18N
							    },2000);
							}
							$req.prop.setMandatoryField($req.prop.wizard.needToFill.data);
							if(!flag){
								$req.prop.highLightMandatoryFields();
							}
							if(!(Object.keys($se.rules).length)) {
								var fields=$req.prop.wizard.needToFill.data;
								fields=fields.concat($req.details.status_mandate[$req.prop.wizard.toStatus].optional_fields);
								if(flag==true){
									$req.prop.setMandatoryField($req.details.status_mandate[$req.prop.wizard.toStatus].fields);
									fields=fields.concat($req.details.status_mandate[$req.prop.wizard.toStatus].fields);
								}
								fields=fields.filter(function (item, pos) {return fields.indexOf(item) == pos});
								$req.prop.showFields(fields);
							}
							var initvalidator={ id: $req.prop.wizard.needToFill.data, title: [] };
							for(var i=0; i<initvalidator.id.length; i++) {
								initvalidator.title.push($req.prop.key_title_mappingObject[initvalidator.id[i]]);
							}
							mandateInValidator("#propertyDetailForm", initvalidator.id, initvalidator.title);//No i18n
							jQuery("#propertyDetailForm").valid();
							$req.prop.scrollToJQMandate(jQuery('[data-id="mandate"]'));
							return false;
						}
						else{
							  infoHeader && jQuery("#closeRequestPopUp").find('[data-name="mandateFields"]').show();
                             !infoHeader && jQuery("#closeRequestPopUp").find('[data-name="mandateFields"]').hide();
						}
						return true;
					}
				});
				if($req.details.status_mandate[this.toStatus].fields && $req.details.status_mandate[this.toStatus].fields.indexOf("note_comments") !== -1){
					_self.tabs.tab_order.push({
						'name':getMessageForKey("sdp.common.notes"),
						'id':'rlc-notes',//No i18n
						'class':'close-incomplete',//No i18n
						validation:function(flag) {
							var isValid = false;
							try {
								if(window.notesDescEditor.isEmpty()){
									isValid = false;
								}else{
									isValid = true;
								}
							} catch (error) {
								/* eslint-disable */
								console.error(error);
								/* eslint-enable */
							}
						return isValid;
						},
						callback:function() {
							var openAddNoteForm = function(){
								$req.details.conv.openNoteForm('#wo-rlc-notes #editor-placeholder',undefined, undefined, true); // NO I18N
							}
							if($req.details.conv){
								openAddNoteForm();
							}else{
								$req.details.conv = new Conversation({lite:true, afterLoad:function(){
									openAddNoteForm();
									jQuery("#notes-add-section .form-footer").addClass('hide'); // NO I18N
								}});
							}
						}
					});
				}
				if(_self.toStatus != parseInt($req.details.request_info.status.id)) {
					// if auto close enabled need to show resolve popup
			        if($req.details.request_closing_rules.is_auto_close_enabled && _self.options.resolveStatusID === _self.toStatus) {
			            _self.options.showClosurePopUpForResolvedStatus = true;
			        }
					if(_self.toStatus === _self.options.closedStatusID || _self.toStatus == _self.options.resolveStatusID) {
				    	if($req.details.operational_data.request_closure_code === undefined) {
			    	        $req.details.getClosureCode(woID);
			    	    }
			    	    //show popup for close and resolved if close comment is mandate
		    	    	if(_self.options.closeCommentMandatory && (_self.options.closedStatusID === _self.toStatus || _self.options.showClosurePopUpForResolvedStatus)) {
						 	_self.tabs.tab_order.push({
						 		'name':getMessageForKey("sdp.request.closurecomments"),//No i18n
						 		'id':'close',//No i18n
						 		'class':'close-incomplete',//No i18n
						 		callback:function() {

					   		  		$req.details.renderCloseResolvedStatusPopUp();
					   		  		if(_self.options.showClosurePopUpForResolvedStatus) {
				    		    		$req.prop.getResolvedClosureCode();
					    		    } else {
						     		    $req.prop.checkCloseAccept();
						     	    }
				   		  		}
							});
				    		_self.options.statuschange = true;
				        }
					} else if(_self.options.inactiveList.indexOf(_self.toStatus) !== -1 && (!isMSPOrSCP || isOnholdScheduleMandatory)) {	// for MSP OnHold Schedule configuration needs to be shown based on SSP setting
						//show popup for hold status
						$req.details.close_mandatory_fields=[];
						_self.tabs.tab_order.push({
							'name':getMessageForKey("request.onholdscheduler"),//No i18n
							'id':'onhold',//No i18n
							'class':'close-incomplete',	//No I18N
							callback: function() {
								$req.details.renderOnholdStatusPopUp();
								$req.prop.statusChangeCheck({value:_self.toStatus});
								jQuery("#onHoldComments").trigger('focus');
							}
						});
						_self.options.statuschange=true;
					}

					//show comment mandatory for any status change if other status change pop us not shown
					if(_self.options.statusCommentMandatory && !_self.options.statuschange) {
						_self.tabs.tab_order.push({
							'name':getMessageForKey("sdp.request.statusChange.comment"),	//No I18N
							'id':'status_change',	//No I18N
							'class':'close-incomplete',	//No I18N
							callback:function(){
								$req.prop.showStatusChangeDialog(_self.toStatus);
							}
						});
					}
				}
				$req.details.status_mandate[_self.toStatus].fields= jQuery.grep($req.details.status_mandate[_self.toStatus].fields, function(value) {
		          if(["tasks","checklists","worklog","depends_on_requests"].indexOf(value)==-1){
		            return true;
		          }
		          return false;
		        });
		        /** open wizard only if some values are invalid/required
		        *  (or) actions to be performed in more than one tab in wizard
				*  (or) RLC actions to be performed
				*/
				_self.showWizard = ($req.details.rlc.isEnabled
						&& _self.toStatus != parseInt($req.details.request_info.status.id)
						&& ($req.details.status_mandate[$req.prop.wizard.toStatus].optional_fields.length
							|| $req.details.status_mandate[$req.prop.wizard.toStatus].fields.length))
					|| _self.showWizard
					|| (fields && fields.length > 0);
				if(_self.tabs.tab_order.length>1 || _self.needToFill.data.length || _self.showWizard) {
					if($req.prop.replyTemplateStatus){
		 				jQuery("#notification-component-popup-wrapper,.zdialog--overlay").addClass("hide").removeClass("show"); //Hiding notification popup before opening close request popup//No I18N
		 			}
					if($req.prop.checkResolutionStatus || $req.prop.resol_update) {
						$req.prop.resol_editor = resolution_editor;
					}
				    _self.render();
			    	renderhbs('#closeRequestPopUp', "close-popup", _self.tabs, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.close_popup);	//No I18N
					_self.changeWizard(0);
					if(_self.showWizard && $req.details.status_mandate[$req.prop.wizard.toStatus].fields.length === 1  && $req.details.status_mandate[$req.prop.wizard.toStatus].fields.indexOf("note_comments") !== -1){
						_self.showWizard = false;
					}
			    	if(!_self.showWizard){
			    		jQuery("#closeRequestPopUp button[data-name='next']").trigger('click');
			    	}else{
			    		_self.tabs.tab_order[0].validation(true);
			    	}
			    	jQuery("#closeRequestPopUp").dialog('option', 'title', "#"+woID+"- "+_self.tabs.tab_order[_self.tabs.tab_order.length-1].name);	//No I18N
			    	if(_self.tabs.tab_order[_self.tabs.tab_order.length-1].id === "close") {
			    		jQuery("#closeRequestPopUp").dialog('option', 'title', "#"+woID+"- "+getMessageForKey("sdp.requests.viewrequest.closerequest"));	//No I18N
			    	}
				} else if(((!$req.prop.checkBulkEdit && !$req.prop.checkRightPanel && !$req.prop.resol_update) || $req.prop.fromListview)) {
					if(requestListViews.viewMode == "kanban") {	//No I18N
						return;
					}
				    $req.prop.inlineSave();
				}
	   		}
		},

		showPropertyTab: function(fields) {
			//while saving if api results in error it will help to show the property which was prerendered
			$req.details.get_status_mandate(woID,this.toStatus);
			jQuery("#closeRequestPopUp").find("[data-tab-id='mandate']").show();
			jQuery("#closeRequestPopUp").find("[data-tabid]").attr("class","text-dark close-incomplete clearfix")
			jQuery("#closeRequestPopUp").find("[data-tabid='mandate']").attr("class","text-dark close-active clearfix")
			jQuery("#closeRequestPopUp").find("[data-type='close-tab']").hide();
			jQuery("#closeRequestPopUp").find("[data-id='mandate']").show();
			$req.prop.mandate_fields_exsists();
			if($req.details.status_mandate[this.toStatus]){
				if($req.details.status_mandate[this.toStatus]["depends_on_requests"].length) {
		  			$req.prop.handleCloseMandatory("dependency");	//No I18N
		  			return;
		   		 } else if($req.details.status_mandate[this.toStatus]["tasks"].length) {
		  			$req.prop.handleCloseMandatory("tasks");	//No I18N
		  			return;
				 } else if($req.details.status_mandate[this.toStatus]["checklists"].length) {
		  			$req.prop.handleCloseMandatory("checklists");	//No I18N
		  			return;
		   		 } else if($req.details.status_mandate[this.toStatus]["to_be_filled"].indexOf("worklog") > -1) {//No i18n
		  			/** SD-76105 : If worklog is mandatory as per closing rules and the status field is opened in Resolution tab, then open the worklog form by default */
		  			if($req.prop.checkResolutionStatus) {
		   		 		if(!jQuery("[name='timeSpent']").is(":checked")) {
			   				if(confirm(getMessageForKey("request.worklog.closingrule.alert"))) {
			   					jQuery("[name='timeSpent']").trigger("click");
			   				} else {
			   					setTimeout(function(){
								    jQuery('[name="woStatus"]').val($req.details.request_info.status.id);
								    $req.utils.safeTrigger(jQuery('[name="woStatus"]')[0], "change");	//No I18N
							    }, 10);
			   				}
			   			}
		   		 	} else {
		   		 		$req.prop.handleCloseMandatory("worklogs");	//No I18N
		  				return;
		   		 	}
		  		}
			}
			$req.prop.setMandatoryField(this.needToFill.data);
			this.changeWizard(0);
		},

		changeWizard: function(index, flag) {
			var _self=$req.prop.wizard;
			if(flag) {
				if(!_self.tabs.tab_order[index].isExecute) {
					return;
				}
				if(index!=0 && _self.needToFill.data.length){
					return;
				}
			}
			jQuery("#wizardContent").html('');
			if(_self.tabs.tab_order[index]) {
				//Next button configuration
				jQuery("#closeRequestPopUp button[data-name='next']").off("click").on("click", function() {//No i18n
					var form=jQuery('[data-id="'+_self.tabs.tab_order[index].id+'"] form:visible')[0];
					var lastab=(index==_self.tabs.tab_order.length-1);
					switch(_self.tabs.tab_order[index].id) {
						case "mandate"://No i18n
							if(_self.tabs.tab_order[index].validation()) {
								if(index==_self.tabs.tab_order.length-1) {
									$req.prop.inlineSave();
									return;
								}
								jQuery("#closeRequestPopUp").find('[data-name="mandateFields"]').hide();
								_self.tabs.tab_order[index+1]&&_self.changeWizard(index+1);
							}
							return;
						break;
						case "onhold"://No i18n
							$req.prop.runOnHoldScheduler(form,true);
						break;
						case "close"://No i18n
							if(_self.options.showClosurePopUpForResolvedStatus) {
					    		$req.prop.updateClosureFields(form,true);
						    } else {
							    $req.prop.submitCloseAccepted(form,true);
							}
						break;
						case "rlc-notes": // NO I18N
							if(_self.tabs.tab_order[index].validation()) {
								jQuery("#wo-rlc-notes [data-name='rlc-notes-warning']").hide();
                                //SD-113111 : update and save the note if it is in last tab else change the tab and update the note.
                                 if(lastab){
                                     $req.prop.updateRLCNotes(form,true);
                                 } else {
                                     $req.prop.updateRLCNotes(form,false);
                                     _self.tabs.tab_order[index+1]&&_self.changeWizard(index+1);
                                 }
							}else{
								jQuery("#wo-rlc-notes [data-name='rlc-notes-warning']").show();
							}
						break;
						case "status_change"://No i18n
							$req.prop.checkStatusComment(form)
						break;
					}
				});
				var updateBtnText = getMessageForKey("sdp.common.update");
				if(_self.options && _self.options.closedStatusID == _self.toStatus) {
					updateBtnText = getMessageForKey("sdp.requests.viewrequest.closerequest");
				}
				jQuery("#closeRequestPopUp button[data-name='next']").html(updateBtnText) //No i18n
				if(index <= _self.tabs.tab_order.length-2) {
					jQuery("#closeRequestPopUp button[data-name='next']").html(getMessageForKey("sdp.common.next"))//No i18n
				}
				if(_self.tabs.tab_order[index-1]) {
					jQuery("#closeRequestPopUp").find("[data-tabid="+_self.tabs.tab_order[index-1].id+"]").attr("class","text-dark close-completed clearfix");
				}
				jQuery("#closeRequestPopUp").find("[data-tabid="+_self.tabs.tab_order[index].id+"]").attr("class","text-dark close-active clearfix");
				jQuery("#closeRequestPopUp").find("[data-type='close-tab']").hide();
				jQuery("#closeRequestPopUp").find("[data-id='"+_self.tabs.tab_order[index].id+"']").show();
				if(!_self.tabs.tab_order[index].isExecute) {
					_self.tabs.tab_order[index].callback();
					_self.tabs.tab_order[index].isExecute=true;
				}
				jQuery("#closeRequestPopUp").find("[data-id='"+_self.tabs.tab_order[index].id+"'] .form-footer").hide();
				if(_self.tabs.tab_order[index]&&_self.tabs.tab_order[index].id=="mandate") {
					_self.tabs.tab_order[index].validation();
				}
			}
		}
	},
	/**
	 * Close the assign comments
	 * i.e destory the zeditor, change the (Notes[ Hide ]) => (Add Notes)
	 */
	closeAssignComments: function(closeOnly) {
        var $technicianPopUp = jQuery("#technicianPopUp");
        jQuery("#assign-notes").html('<a href="/" class="text-link">'+getMessageForKey("sdp.requests.notes.addnotes.title")+'</a>'); //No I18N
        jQuery("#assign-notes .text-link").off("click").on("click", () => { //No I18N
            $req.prop.openAssignComments();
            return false;
        });
        if(!closeOnly){
            window.assign_comments = undefined;
        }else{
            window.assign_comments_draft = window.assign_comments;
            window.assign_comments = undefined;
        }
        $req.prop.assign_comments_attachments = [];
		try{
			$technicianPopUp.find("#assign-comments").addClass('hide').end()
			.find("#ze_assign-comments").remove().end()
			.find("#techassign-notes .btn-group,#file-browser-area").remove().end()
			.find("#techassign-notes").hide().end()
			.dialog("widget").animate({ // NO I18N
				width: "350px"  // NO I18N
			}, {
				duration: 500,
				step: function() {
					$technicianPopUp.is(':visible') ? $technicianPopUp.dialog("option", "position",  { my: "center center", at: "center center", of: window }) : '';  // NO I18N
				}
			});
			$technicianPopUp.find(".form-wrapper").css({"width":"", "height": "","overflow-y": ""});  // NO I18N
		}catch(err){}
	},
	/**
	 * Show / Hide the Assign notes based on criteria
	 */
	toggleAssignComments:function(){
		if(jQuery("#technicianPopUp").is(":visible")){
			/**
			 * Site Change
			 */
			var cur_selected_site = jQuery('#propertyDetailForm [name="site"]').val() || "0";
			var currentSite = $req.details.request_info.site ? $req.details.request_info.site.id : "0";

			/**
			 * Tech Change
			 */
			var cur_selected_tech = jQuery('#propertyDetailForm [name="technician"]').val() || "0";
			var currentTech = $req.details.request_info.technician ? $req.details.request_info.technician.id : "0";

			/**
			 * Group Change
			 */
			var cur_selected_group = jQuery('#propertyDetailForm [name="group"]').val() || "0";
			var currentGroup = $req.details.request_info.group ? $req.details.request_info.group.id : "0";

			if(
				cur_selected_tech != currentTech ||
				cur_selected_group != currentGroup ||
				cur_selected_site != currentSite
				){
				jQuery("#assign-notes").addClass('disp-ib'); // No I18N
				jQuery("#assign-notes").removeClass('hide'); // No I18N
			}else{
				jQuery("#assign-notes").addClass('hide'); // No I18N
				jQuery("#assign-notes").removeClass('disp-ib') //No I18N
					this.closeAssignComments(true);
			}
		}
	},
	/**
	 * Open the Assign Comments
	 * i.e Initialize the zeditor and animate the dialog size
	 */
    openAssignComments: function() {
        var $technicianPopUp = jQuery("#technicianPopUp");
        jQuery("#assign-notes").html('<span class="pr5">'+getMessageForKey("sdp.requests.common.notes")+'</span><a href="/" class="text-link">[ '+getMessageForKey('sdp.common.cancel')+' ]</a><span class="pos-rel pr1 fr"><span class="sdp-glyph sdp-glyph-info-blue pr5"><span class="path1"></span></span>'+ getMessageForKey("sdp.comment.mention.helptext") +'</span>'); //No I18N
        jQuery("#assign-notes .text-link").off("click").on("click", () => { //No I18N
            $req.prop.closeAssignComments();
            return false;
        });
		$technicianPopUp.find("#assign-comments").addClass("h-250px").removeClass("hide"); //No I18N
		$technicianPopUp.find(".form-wrapper").css({"width":"100%", "height": "520px","overflow-y": "scroll"});  // NO I18N
		/**
		 * Increase the width of the dialog
		 */
		$technicianPopUp.dialog("widget").animate({  // NO I18N
            width: "900px"  // NO I18N
        }, {
            duration: 500,
            step: function() {
				/**
				 * During every step of the animatation,
				 *  set the popup position to the center of the screen
				 */
                $technicianPopUp.dialog("option", "position",  { my: "center center", at: "center center", of: window });  // NO I18N
            },
            complete: function() {

				/**
				 * Initize the z editor
				 */
				var user_criteria = {  "condition": "is", "field": "type", "logical_operator": "and", "value": "Technician" }; // NO I18N
				if(isSCP)
				{
					user_criteria = undefined;
				}
				var placeholder_criteria = {"condition": "NEQ","field": "name","logical_operator": "and","value": "requester"}; //No I18N

				// options variable introduced for MSP/SCP
				var options = undefined;
				 if(isMSPOrSCP)
				 {
				 	options = {users:{href:"/api/v3/requests/technician", "lookup_entity":"technician"}}; //No i18n
				 }


				// options param passed additionally for MSP/SCP
				var mentionStratergy = getMentionStratergy(false, user_criteria,  placeholder_criteria, options);
                zeditor({
                    element: "assign-comments", //No i18n
                    isEnterKeyHandler: true,
                    focus: true,
                    customName: "assign_comments", //No i18n
					avoidMoreOption: true,
					inlineimagesAPI:"api/v3/requests/"+$req.details.request_info.id+"/notes/images", //No i18n
					enableMention: true,
					mentionType: 'custom', //No i18n
					mentionStratergy: mentionStratergy,
					maintainStructure: true,
					afterload:function(){
						/**
						 * If any editor drafts are availble, then load the comments after editor load
						 */
                        if( window.assign_comments_draft && !window.assign_comments_draft.isEmpty()){
                            jQuery("#ze_assign-comments .ze_area").contents().find('body').html(window.assign_comments_draft.getHTML());
                            window.assign_comments_draft = undefined;
                        }

					}
                });
                // Initialize Attachment browse section
                var attachComponent;
                var onuploadAttachmentCB = function(response,attachmentEle){
					var isFailed = false;
					response && response.responseJSON && ( response = response.responseJSON );
					if(response && response.response_status){
						if(response.response_status.status === "success"){
							if(response.attachment){
								$req.prop.assign_comments_attachments.push(response.attachment);

								if(attachmentEle && attachmentEle.length > 0){
									var fsize = response.attachment.size.display_value || response.attachment.size;
									var filename = response.attachment.name || response.attachment.file_name;
									attachmentEle.data("attach-id", response.attachment.id);	//No I18N
									attachmentEle.data("attach-url", response.attachment.content_url);	//No I18N
									attachmentEle.data("attach-size", fsize);	//No I18N
									attachmentEle.data("attach-name", filename);	//No I18N
									attachmentEle.attr("title", filename + " - " + fsize);	//No I18N
									attachmentEle.parent().siblings("span:first") //No I18N
										.html('<span class="atdrpactn text-center" data-attach-delete="true"><i class="cspr close3 mt1 flat"></i></span>');	//No I18N
								}
								/** re-binding the events for the attachments */
								if(attachComponent && attachComponent.loadEvents) {
									attachComponent.loadEvents();
								}
							}
						}
						else if(response.response_status.messages){
							window.showalert("failure", response.response_status.messages[0].message, "isAutoHide=true");	//No I18N
							isFailed = true;
						}
					}
					else{
						window.showalert("failure", getMessageForKey("sdp.common.attachment.error"), "isAutoHide=true"); //No I18N
						isFailed = true;
					}

					if(isFailed && attachmentEle && attachmentEle.length > 0) {
						attachmentEle.closest(".btn-group").remove();	//No I18N
						if(jQuery("#techassign-notes").find(".btn-group").length == 0){
							jQuery("#techassign-notes").hide(); //No I18N
						}
					}

				};
				var onDeleteAttachmentCB = function(context,attachmentEle){

					if(!attachmentEle) {
						return;
					}
					var attach_id = attachmentEle.data("attach-id"); //No I18N
					var index;
					var len = $req.prop.assign_comments_attachments.length;
					for(var i = 0; i < len; i++){
						if($req.prop.assign_comments_attachments[i].id == attach_id){
							index = i;
							break;
						}
					}

					$req.prop.assign_comments_attachments.splice(index,1);

					attachmentEle.closest(".btn-group").fadeOut("fast", function() {	//No I18N
					jQuery(this).remove();
					if(jQuery("#techassign-notes").find(".btn-group").length == 0){
						jQuery("#techassign-notes").hide(); //No I18N
					}
					});
				};
                var attach_options = {
					"api": false, // No I18N
					"upload_api": true, //No I18N
					"is_odapi": true, //No I18N
					"direct_upload": false, //No I18N
					"base_url": "/api/v3/requests/"+woID, //No I18N
					"entity": "notes", //No I18N
					"drop_element" : "#techassign-notes-attachments", //No I18N
					"download": false, //No I18N
					"rerenderOnUpload": false, //No I18N
					"servlet_cb": function(response,attachmentEle){  //No I18N
						onuploadAttachmentCB(response,attachmentEle);

					},
					"title": false, //No I18N
					"upload" :  true, //No I18N
					"enable_delete" :  true, //No I18N
					"ondelete": function(context,attachmentEle){  //No I18N
						onDeleteAttachmentCB(context,attachmentEle);
					}


				};
				attachComponent = new attachPreview('#techassign-notes',attach_options);//No I18N
            }
        });
    },
    populateAssignComments: function() {
  		  /**
           * assign_comments : Editor object from window
           */
		  var hasComments = window.assign_comments && !window.assign_comments.isEmpty();
		  var restoreASC = jQuery("#propertyDetailForm [name='assign_comments']").val();
          if (hasComments || restoreASC ) {
			  var description =  window.assign_comments && window.assign_comments.getHTML() || restoreASC;
			  var attachments = [];
			  this.assign_comments_attachments.forEach(function(attachment){
				attachments.push({id: attachment.id});
			});
			this.sectionalUpdateJson.assign_comments = {
				description: description,
				attachments: attachments
			};
          }
          return true;
    },
    addSelectedEmails: function(emails) {
    	var fieldObject = jQuery('[data-field="EMAILCC"]');	// NO I18N
    	var new_val = emails.split(",");
    	var exist_val = fieldObject.select2("val");	// NO I18N
    	var value = exist_val;
    	for(var i = 0; i < new_val.length; i++) {
    		if(value.indexOf(new_val[i]) == -1) {
    			value.push(new_val[i]);
    		}
    	}
    	value = value.map(function(item) {
            return {
                id: item,
                name: item
            };
        });
    	fieldObject.select2("data", value).trigger('change');   // NO I18N
    },
    setMailNotifyField: function(options, fieldName) {
    	// the really long chain below is to get the field's display name... This chaining is required to get the display name, without the mandatory *
        var displayName = jQuery("#select_"+fieldName).parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
        jQuery('#propertyDetailForm [name="'+fieldName+'"]').sdp_select2({ //No I18N
        	allowClear: false,
			multiple: true,
			closeOnSelect: false,
			maximumSelectionSize: isMSPOrSCP && maxEmailIdsToNotify ? maxEmailIdsToNotify:25,	// for SDP it is always 25. For MSP/SCP maxEmailIdsToNotify is defined in WOPropertyDetails.jspf based on SSP
			placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,	//No I18N
			createSearchChoicePosition: "bottom",	//No I18N
			createSearchChoice: function(term, data) {
				var obj = undefined;
				var canTag = !data || !data.some( function(item) {
					return item.name.toLowerCase() === term.toLowerCase()
				});
				if(!canTag || !validateMailIDs(term)) {
					return null;
				}
				return { id: term, name: term, isTag: true };
			},
			tags: true,
			url: [{
				url: "/api/v3/requests/"+ $req.details.request_info.id +"/requester",	//No I18N
				field: "requester",	//No I18N
				list_info: {
					start_index: 1,
					sort_field: "name",	//No I18N
					row_count: 100
				},
				search_keys: [ "name", "email_id" ]	//No I18N
			}],
			filterRemoteData: function(item) {
				return item && item.email_id;
			},
			processResults: function(search_data, data, field) {
				if(data && data.email_id) {
					search_data.push({
						id: data.email_id,
						name: data.name,
						email_id: data.email_id
					});
				}
			},
			formatSelection: function(item) {
				return e_html(item.email_id) || e_html(item.name);
			},
			formatResult: function(item) {
				if(item.email_id) {
					return e_html(item.name) + " &lt;" + e_html(item.email_id) + "&gt;";	// No I18N
				} else {
					return e_html(item.name);
				}
			},
		    matcher: function(term, text, option) {
				text = text && text !== "undefined" ? text : (option ? (option.name || option.text) : "");	//No I18N
				return text.toLowerCase().indexOf( term.toLowerCase() ) >= 0;
			},
			value: []
    	});
   		var default_val = [];
       	if(!options.val_exist) {
        	var val_obj = $req.details.request_info;
        	if(val_obj && val_obj[fieldName] && jQuery.isArray(val_obj[fieldName])) {
        		for(var i=0; i<val_obj[fieldName].length; i++) {
        			default_val.push({
        				id: val_obj[fieldName][i],
        				name: val_obj[fieldName][i]
        			});
        		}
        	}
        	jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", default_val);	//No I18N
        }
    },
    setSpaceField: function(options, fieldName) {
    	// the really long chain below is to get the field's display name... This chaining is required to get the display name, without the mandatory *
        var displayName = jQuery("#select_"+fieldName).parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
        jQuery('#propertyDetailForm [name="'+fieldName+'"]').sdp_select2({ //No I18N
        	allowClear: false,
			multiple: true,
			closeOnSelect: false,
			maximumSelectionSize: 25,
			placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,	//No I18N
			url: [{
				url: "/api/v3/requests/"+ $req.details.request_info.id +"/space",	//No I18N
				field: "space",	//No I18N
				list_info: {
					start_index: 1,
					sort_field: "name",	//No I18N
					row_count: 100
				},
				search_keys: [ "name" ]	//No I18N
			}],
			value: []
    	});
   		var default_val = [];
        	var val_obj = $req.details.request_info;
        	if(val_obj && val_obj[fieldName] && jQuery.isArray(val_obj[fieldName])) {
        		for(var i=0; i<val_obj[fieldName].length; i++) {
        			default_val.push({
        				id: val_obj[fieldName][i].id,
        				text: val_obj[fieldName][i].name
        			});
        		}
        	jQuery("#propertyDetailForm [name='"+fieldName+"']").select2("data", default_val);	//No I18N
        }
    },
	/**
	 * Open the space selection popup
	 */
	 openSpacePopup: function() {
		 var result=[];
		$req.common.spacePopup.open({
			selected: jQuery("#propertyDetailForm [name='space']").select2("data"), //No i18n
			maximumSelectionSize: maxSpaceCount ? maxSpaceCount : 25,
			onSelect: function(value,selectedDataNames){
				value.forEach(function(item, index) {
					result.push({"id":item,"text":selectedDataNames[index] });
				  });
				try{
					jQuery("#propertyDetailForm [name='space']").select2("data", result);	//No I18N
				}catch (error) {
					$req.form.handleError(error);
				}
			}
		})
	},
	openAssetModuleList: function(){
		try{
			var user = $req.details.request_info.requester;
			var userId = user ? user.id : null;
			var siteId = $req.details.request_info.site && $req.details.request_info.site.id && $req.details.request_info.site.id!="0" ? $req.details.request_info.site.id : "-1";
			var siteName=translate('sdp.admin.technician.addtechnician.nosite');
			if(siteId!="-1" && siteId!=null && siteId!="0" ){
				siteName=$req.details.request_info.site.name;
			}
			assetsObj.fiter_requester_id=userId;
			assetsObj.fiter_department_id=user&&user.department?user.department.id:null;
			assetsObj.filter_site_id=siteId;
			assetsObj.filter_site_name=siteName;
		}
		catch(error){
			console.error(error);
		}
		assetsObj.loadAttachAssetPopup('request', 'attach_asset', 'asset');	//No I18N
    }
};
$req.prop.init();


/* CSI Model */
$req.csi = {
    csi_model:{},//csi model
//get csi model
setCSIModel:function(){
    sdpAjax({
		    type: "GET"    ,  //NO I18N
		    url:'/api/v3/categories/_get_csi_model' + (isMSP ? '?WF_ACCOUNTID='+getAccountId() : '')   ,  //NO I18N
		    cache: false,
	  		async: false,
		    success :function(data){
			    $req.csi.csiModelJson(data.csi_model.categories);
		    }
	});
},
//create csi model json
csiModelJson:function(csiJson){
  	var csi_model={};
  	for(var i=0,ilen=csiJson.length;i<ilen;i++){
        var object={};
        for(var j=0,jlen=csiJson[i].sub_categories.length;j<jlen;j++){
            object[csiJson[i].sub_categories[j].name] = csiJson[i].sub_categories[j];
        }
        csi_model[csiJson[i].name]=csiJson[i];
        csi_model[csiJson[i].name].sub_categories = object;
  	}
  	this.csi_model = csi_model;
},

//populate CSI
populateData:function(catValue, subCatValue, itemVal, field, event) {
    var cat = jQuery('#propertyDetailForm [name="category"]'), sct = jQuery('#propertyDetailForm [name="subcategory"]'), itm = jQuery('#propertyDetailForm [name="item"]');
    var key='';
    if(cat.length && !catValue){
	    key = cat.val();
	    catValue = $req.details.allowedValues.CATEGORY.AllowedValues[key];
    }

    if(field==='category' ){
        if(itm.length) {
     	    $req.csi.setSubcategory(catValue, subCatValue, sct, event);
     	    $req.csi.setItem(catValue, subCatValue, itemVal, itm, event);
     	    jQuery('#item_actions>#saveButton,#closeButton').removeClass('hide');
        }else if(sct.length){
     	    $req.csi.setSubcategory(catValue, subCatValue, sct, event);
     	    if(!$req.prop.checkBulkEdit){
     	        jQuery('#subcategory_actions').removeClass('hide').find('#saveButton').removeClass('hide');
            }
        }
    }
    else if(field==='subcategory' && sct.length && itm.length){
	    $req.csi.setItem(catValue,subCatValue,itemVal,itm, event);
    }
},

setSubcategory: function(catValue, subCatValue, subCatElement, event) {
  	var allowedData={};
  	var selectedVal = subCatValue;
  	allowedData = $req.csi.getSubCategories(catValue);
  	if(allowedData) {
  		var options = $req.prop.getFieldOptionsString(allowedData, selectedVal, "name");	//No I18N
  		var optionString = options.options;
  		subCatElement.find('option').remove().end().append(optionString).select2({
  		    formatNoMatches: translate("common.no.match.found"), //No I18N
  			allowClear: true,
  			sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
  		});
  		if(!options.val_exist && event == undefined){
  			$req.prop.setOriginalValue("subcategory");//no i18n
  		}
  	}else{
  	   subCatElement.select2({
  	    formatNoMatches: translate("common.no.match.found"), //No I18N
  	   	allowClear: true,
  	   	sortResults: function(results, container, query) {
            return sortResultsFn(results, container, query);
        }
  	   });
  	}
},

getSubCategories:function(catValue) {
    var obj ={};
    var notassignedValue = getMessageForKey("sdp.common.notassigned");
    if(catValue !== notassignedValue && catValue !==undefined && $req.csi.csi_model[catValue]) {
        obj = $req.csi.csi_model[catValue].sub_categories;
    }
    var subCatObject = {};
    for(var i in obj) {
        subCatObject[obj[i].id]=i;
    }
    subCatObject[0] = notassignedValue;
    return subCatObject;
},

setItem:function(catValue, subCatValue, itemVal, itemElement, event) {
  	var allowedData = {};
    allowedData = $req.csi.getItems(catValue, subCatValue);
    if(allowedData) {
    	var options = $req.prop.getFieldOptionsString(allowedData, itemVal, "name");	//No I18N
    	var optionString = options.options;
    	itemElement.find('option').remove().end().append(optionString).select2({
    	    formatNoMatches: translate("common.no.match.found"), //No I18N
    		allowClear: true,
    		sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
    	});
    	if(!options.val_exist && event == undefined ){
  			$req.prop.setOriginalValue("item");//no i18n
  		}
    } else {
    	itemElement.select2({
    	    formatNoMatches: translate("common.no.match.found"), //No I18N
    		allowClear: true,
    		sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
    	});
    }
},

getItems:function(catValue,subCatValue){
    var obj ={};
    var notassignedValue = getMessageForKey("sdp.common.notassigned");
    var itemObject={};
    if(subCatValue !== undefined && subCatValue.indexOf(">>") !== -1){
    	subCatValue = subCatValue.slice(0,subCatValue.indexOf(">>"));
    }
    if(catValue !== notassignedValue && subCatValue !== notassignedValue && catValue !== undefined && subCatValue !==undefined && $req.csi.csi_model[catValue] && $req.csi.csi_model[catValue].sub_categories){
        var subCatObject = $req.csi.csi_model[catValue].sub_categories[subCatValue];
    }
    if(subCatObject !== undefined){
        obj = $req.csi.csi_model[catValue].sub_categories[subCatValue].items;
        for(var i=0;i<obj.length;i++){
            itemObject[obj[i].id] = obj[i].name;
        }
    }
    itemObject[0] = notassignedValue;
    return itemObject;

}
};


//populate SGT Fields
$req.sgt = {
	populateData: function(siteVal, grpVal, techVal, onChangedField,event) {
	    var siteElement = jQuery('#propertyDetailForm [name="site"]');
	    var groupElement = jQuery('#propertyDetailForm [name="group"]');
	    var technicianElement = '';
	    technicianElement = jQuery('#propertyDetailForm [name="technician"]');

        //SD - 100880 - Checking if Restricted Template Site is selected - special Case Site Restricted Technician is the Requester
        var isRestrictedTemplateSite=false;
        //isRestrictedTemplateSite Boolean is used to  restrict the Group & Technician
        //Allowed Values in Inline SGT Edit - When the Site is a Restricted Site
        if(siteVal||siteElement.length){ //Site Check If there is no Site
            var tempSiteVal=siteVal?siteVal:siteElement.val(); //When Site Fields Edited else if Group Field is Edited
            var siteTechArrList = siteTechModel.list[tempSiteVal];
            /** If the site is a Refer site, then the technicians should be fetched from the referred site array */
            if(siteTechArrList && siteTechArrList[0] == -1 && siteRefModel && siteRefModel.list) {
                var referredSite = siteRefModel.list[tempSiteVal] ? siteRefModel.list[tempSiteVal] : 0;
                siteTechArrList = siteTechModel.list[referredSite];
            }
            var templateSite;
            if($req.details.template_info.request.site&&$req.details.template_info.request.site.id){
                templateSite=$req.details.template_info.request.site.id;
            }
            if(templateSite&&sdp_user.USERTYPE === 'Technician'&&templateSite==tempSiteVal&&siteTechArrList&&siteTechArrList.indexOf($req.sdp_user.LOGGEDIN_USERID) == -1){//If the Template Site is Selected and Its Restricted
                isRestrictedTemplateSite=true;
            }
		}

	    if(onChangedField === 'site') {
		    var actualSiteVal = siteVal;	// variable defined and used for MSP
	    	/** If the selected site is a refer site, then referred site should be used for further data population */
	    	if(siteGrpModel.list[siteVal] && siteGrpModel.list[siteVal][1] == -1 && siteRefModel) {
	    		siteVal = siteRefModel.list[siteVal] ? siteRefModel.list[siteVal] : 0;
	    	}

	    	/** Both Group and Technician elements are available */
	    	if(groupElement.length && technicianElement.length) {
	            $req.sgt.setGroup(siteVal, grpVal, groupElement,event,isRestrictedTemplateSite);
	            var techArrList = siteTechModel.list[siteVal];
	            if(isMSP) {
	            	// can take Technician list from actual site for MSP because technician is updated with entry in UserSiteMapping even for the site he/she is referred to in MSP.
	            	techArrList = siteTechModel.list[actualSiteVal];
	            }
	            var techJson = $req.sgt.getSiteTechnicianJson(techArrList, groupElement);
	            $req.sgt.setTechnician(techJson, techVal, technicianElement, groupElement,event,isRestrictedTemplateSite);
	        } else if(groupElement.length) {	/** Only Group is available */
	            $req.sgt.setGroup(siteVal, grpVal, groupElement,event,isRestrictedTemplateSite);
	        } else if(technicianElement.length) {	/** Only Technician is available */
	            var techArrList = siteTechModel.list[siteVal];
	            if(isMSP) {
	            	// can take Technician list from actual site for MSP because technician is updated with entry in UserSiteMapping even for the site he/she is referred to in MSP.
	            	techArrList = siteTechModel.list[actualSiteVal];
	            }
	            var techJson = $req.sgt.getSiteTechnicianJson(techArrList, groupElement);
	            $req.sgt.setTechnician(techJson, techVal, technicianElement, groupElement,event,isRestrictedTemplateSite);
	        }
	    } else if(onChangedField==='group') { //NO I18N
	    	/** Populating value for the technician if available */
	        if(technicianElement.length) {
	        	var techJson1 = undefined;
	        	if(siteElement.length) {
	        		siteVal = siteElement.val();
	        		var actualSiteVal = siteVal;	// variable defined and used for MSP
		        	if(siteGrpModel.list[siteVal] && siteGrpModel.list[siteVal][1] == -1 && siteRefModel) {
			    		siteVal = siteRefModel.list[siteVal] ? siteRefModel.list[siteVal] : 0;
			    	}
	        		var techArrList = siteTechModel.list[siteVal];
	        		if(isMSP) {
		            	// can take Technician list from actual site for MSP because technician is updated with entry in UserSiteMapping even for the site he/she is referred to in MSP.
		            	techArrList = siteTechModel.list[actualSiteVal];
		            }
	        		techJson1 = $req.sgt.getSiteTechnicianJson(techArrList,groupElement);
	        	}
	            $req.sgt.setTechnician(techJson1, techVal, technicianElement, groupElement,event,isRestrictedTemplateSite);
	        }
	    }
	},

	setGroup: function(siteVal, selectedVal, grpElement, event,isRestrictedTemplateSite) {
	//SD - 100880 - If Restricted Template Site is selected - Initializing Group Allowed values with Not Assigned Value
	    var allowedData ={};
        if(isRestrictedTemplateSite){
            allowedData[0] = getMessageForKey('sdp.common.notassigned');
        }else{
            allowedData=$req.sgt.getGroupAllowedValues(siteVal);
        }

	    if(allowedData) {
	    	var options = $req.prop.getFieldOptionsString(allowedData, selectedVal, "name");	//No I18N
	    	var optionString = options.options;
	    	grpElement.select2('destroy').find('option').remove().end().append(optionString).select2({	//No I18N
	    	    formatNoMatches: translate("common.no.match.found"), //No I18N
	    		allowClear: true,
	    		sortResults: function(results, container, query) {
	                return sortResultsFn(results, container, query);
	            }
			}); //NO I18N
	    	if(!options.val_exist && event == undefined) {
	  			$req.prop.setOriginalValue("group");//no i18n
	  		}
	    }
	},

	getGroupAllowedValues: function(siteVal) {
	    var grpObject = {};
	    if(siteGrpModel.list[siteVal] !== undefined) {
	        grpObject = siteGrpModel.list[siteVal][1];
	    } else if(siteVal==='0') {
	    	grpObject = siteGrpModel.list[0][1];
	    }
	    var grpObj = {};
	    if(grpObject !== -1) {
	        for(var i in grpObject) {
	    	    grpObj[i]=grpObject[i][0];
	        }
	    }
	    grpObj[0] = getMessageForKey('sdp.common.notassigned');
	    return grpObj;
	},

	getSiteTechnicianJson: function(techArrList, groupElement) {
		var object = {};
	    var grpTechAllowedData = $req.sgt.getTechnicianAllowedValues(groupElement);
	    for(var i in grpTechAllowedData) {
	    	if(techArrList!== undefined && techArrList.indexOf(parseInt(i)) !== -1){
	            object[i]= grpTechAllowedData[i];
	    	}
	    }
	    object[0] = getMessageForKey('sdp.common.notassigned');
	    return object;
	},

	setTechnician: function(allowedValue, techVal, techElement, groupElement, event,isRestrictedTemplateSite) {
		var allowedData = {}, isTechAllowed = false;
		//SD - 100880 - If Restricted Template Site is selected - Initializing Technician Allowed values with the  Not Assigned Value
		if(isRestrictedTemplateSite){
			allowedData[0] = getMessageForKey('sdp.common.notassigned');
		}else if(!allowedValue) {
	        allowedData = $req.sgt.getTechnicianAllowedValues(groupElement);
	    } else {
	    	allowedData = allowedValue;
	    }
	    if(allowedData) {
	    	var cur_selected_tech;
	    	if(techVal !== undefined) {
	    		cur_selected_tech = techVal;
	    	} else {
	    		var selected_tech_index = techElement[0].selectedIndex;
	    		if(selected_tech_index && selected_tech_index!=-1) {
		    		cur_selected_tech = techElement[0].options[selected_tech_index].text;
		    	}
	    	}
	    	if(cur_selected_tech) {
	    		for(var id in allowedData) {
	    			if(allowedData[id] === cur_selected_tech) {
	    				isTechAllowed = true;
	    				break;
	    			}
	    		}
	    	}
	    	if(!isTechAllowed || !cur_selected_tech) {
	    		cur_selected_tech = null;
	    	}
	    	var options = $req.prop.getFieldOptionsString(allowedData, cur_selected_tech, "name");	//No I18N
	    	var optionString = options.options;
	    	techElement.find('option').remove().end().append(optionString);
	    	if(!options.val_exist && event == undefined){
	  			$req.prop.setOriginalValue("technician");//no i18n
	  		}
	    }
	    //To avoid reintializing of data
	    var data=techElement.select2("data");//no i18n
	    //by using formateResult we can set the online Offline in technician options
	    techElement.select2({
	    	formatNoMatches: getMessageForKey('ae.select2.no.message'),
	    	formatResult: formatResult,
	    	formatSelection: formatResult,
	    	escapeMarkup: function(m) { return m; },
	    	sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            }
	    });
	    if(techElement.select2("data")==null){
	    	techElement.select2("data",data);//no i18n
	    }

	    //we can show only online technicians
	    filterbyOnline(techElement);
	    jQuery('#technicianIcon').addClass('hide');
	},

	getTechnicianAllowedValues:function(grpElement){
	    var grpValue = grpElement.val();
	    if(grpValue === undefined){
	    	grpValue = 0;
	    }
		var techArray = grpTechModel.list[grpValue];
		var techList = $req.details.allowedValues.TECHNICIAN.AllowedValues;
		var techObject = {};
		if(techArray !=undefined){
		    for(var i=0,ilen=techArray.length;i<ilen;i++){
	                var techName = techList[techArray[i]];
	                techObject[techArray[i]] = techName;
		    }
		}
		techObject[0] = getMessageForKey('sdp.common.notassigned');
		return techObject;
	},

	openAssignDialog: function(event) {
		var permissions = $req.details.operational_data.links;
		var canAssign = permissions && permissions.assign && permissions.assign.put ? true : false;
		if(sdp_user.USERTYPE === 'Requester' || !canAssign || $req.details.request_info.is_trashed || window.print_mode) {
			return;
		}
		var hasField = ["technician", "group", "site"].some(function(field) {	//No I18N
			var _hasField = $req.layout.properties.indexOf(field) > -1;
			if(!hasField && Object.prototype.hasOwnProperty.call($req.details.request_info, field)){
				_hasField = true;
			}
			return _hasField;
		});
		if(!hasField) {
			$req.utils.alert("warning", getMessageForKey("sdp.request.assignreq.fieldsdisabled.message"), "isAutoHide=true, delay=15");	//No I18N
			return;
		}
		$req.prop.showAssignDialog(event, 'TECHNICIAN'); // NO I18N
	}
};
