/* $Id$ */



$req.resource = {

	init: function() {
		this.resourceDBJson = {};//resource fields selected value json
		this.resource_info = {};//Api Data 
		this.checkResSubmitMsg = "";//check for return db status
		this.checkResBulkEdit = false;
		this.content_id="resourcesFrame"; // no i18n
	},

	render:function(){
		$req.resource.resource_info = $req.resource.getResourceData();
	    $req.resource.resource_info.print_mode = window.print_mode ? true : false;
	    renderhbs('#resource-content', 'resource-view-template', $req.resource.resource_info, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.resource_view_template); //No I18N
	    $req.resource.setResourceToggelEditUpdate();
	    $req.resource.renderCostPreview();
	    this.leftAlignSection();
	},

	addRemoveCostDetails: function(ele,key,selectedValue){
		var type = $req.prop.resourceObj[key].TYPE,
			question = jQuery("#"+key+"_QUESTION").text(),
			totalCost = parseFloat($req.details.request_info.total_cost);

		if(!$req.prop.costDetails[key]){
			$req.prop.costDetails[key]=[];
		}
		var costArr = $req.prop.costDetails[key];

		if(type==="multicheckbox"){
			var value = jQuery(ele).val();
			var cost = jQuery(ele).attr("data-cost");
			if(jQuery(ele).prop("checked")){
				costArr.push({"question":question,"name":value,"cost":cost});
				$req.details.request_info.total_cost = (totalCost + parseFloat(cost)).toFixed(sdp_app.MAX_ALLOWED_DECIMAL_POINTS || 2);
				$req.prop.additionResourceCostType++; //additionalResourceCostType tracks the number of questions with a cost that have an answer
			}else{
				for(var i=0; i<costArr.length; i++){
					if(costArr[i].name===value && costArr[i].question===question){
						$req.details.request_info.total_cost = (totalCost - parseFloat(cost)).toFixed(sdp_app.MAX_ALLOWED_DECIMAL_POINTS || 2);
						costArr.splice(i,1);
					}
				}
				$req.prop.additionResourceCostType--;
			}
		}else if(type==="multiselect"||type=="radio"){ //No I18N
			var value = jQuery(ele).val();//NO I18N
			var cost = jQuery(ele).attr("data-cost");//NO I18N
			var oldCost = 0;
			if(typeof costArr[0]==="object" && costArr[0].cost){
				oldCost = costArr[0].cost;
			}

			if(type=="multiselect"){
				if(ele.id!=0){
					if(oldCost === 0){
						// oldCost being the numeric 0 indicates this is the first answer to a question
						$req.prop.additionResourceCostType++;
					}
				}else{
					//if the ---select item--- option is selected
					$req.prop.additionResourceCostType--;
				}
			}

			if(type=="radio"){
				var checked=jQuery(ele).prop("checked"); //No I18N
				if(!checked){
					jQuery(ele).prop("checked", false); //No I18N
					$req.prop.additionResourceCostType--;
					cost=0;
				}
				else{
					if(oldCost==0){
						$req.prop.additionResourceCostType++;
					}
				}
			}
			$req.details.request_info.total_cost = (totalCost - parseFloat(oldCost) + parseFloat(cost)).toFixed(sdp_app.MAX_ALLOWED_DECIMAL_POINTS || 2);
			$req.prop.costDetails[key]=[{"question":question,"name":value,"cost":cost}]; //No I18N
		}
		jQuery("span[name='totalCost']").text($req.details.request_info.total_cost);
	},

	renderCostPreview: function(){
	    var costPreviewJson = {};
	    if($req.prop.additionResourceCostType){
	    	costPreviewJson = {"costDetails":$req.prop.costDetails, "totalQty" : $req.prop.additionResourceCostType}; //NO I18N
	    }
	    if($req.details.request_info.total_cost){
	    	costPreviewJson.total_cost = $req.details.request_info.total_cost;
	    	costPreviewJson.template_cost =  $req.details.request_info.service_cost;
	    	costPreviewJson.cost_comments = $req.details.template_info.cost_details.cost_comments;
	    	costPreviewJson.isTechnician =  sdp_user.USERTYPE=="Technician"; // No I18N
	    	costPreviewJson.isRequester = !costPreviewJson.isTechnician;
	    	costPreviewJson.currencySymbol = sdp_app.CURRENCY_SYMBOL;

	        renderhbs("#cost-preview-content", "cost-preview-template", costPreviewJson, false, "requests/properties", null, null, $req.details.bindEvents.property_templates.cost_preview_template); //No I18N
	    }
	},

	showHideEmptyResourceMessage:function(){
		var allHidden = true;
		jQuery("#resourceDetailsForm").find('[value="ResourceDiv"]').each(function(){
			if(!jQuery(this).hasClass("hide")){
				allHidden = false;
				return;
			}
		});
		if(allHidden){
			jQuery("#emptyResourceMessage").removeClass("hide");
		}else{
			jQuery("#emptyResourceMessage").addClass("hide");
		}
	},

	constructCostDetails:function(key,name,fafr_key){
		var fields;
		$req.prop.costDetails[fafr_key]=[];
		if(key !== null){
	        fields=(!jQuery.isArray(key))?[key]:key;
		}else{
			return [];
		}
	    //check arry element is Object --- case handle for asset 
	    if(fields[0] && fields[0].name){
	        var field = [];
	        for(var i=0,ilen=fields.length;i<ilen;i++){
	            if(fields[i].cost != undefined && ($req.details.template_info.is_cost_enabled || $req.details.request_info.total_cost)) {
	                $req.prop.costDetails[fafr_key].push({"question":name,"name":fields[i].name,"cost":fields[i].cost});
	                $req.prop.additionResourceCostType++;
	            }
	        }
	    }
	    return fields;
	},

	getResourceData:function (){
		$req.prop.costDetails = {};
	    $req.prop.additionResourceCostType = 0;
		var layout = JSON.parse(sdpToJSON($req.details.template_info.layouts));
		var res_layout;
		var isAnswered = false;
		var hasVaildResource = false;
		for(var i=0; i<layout.length; i++) {
			if(layout[i].name === "resource_layout"){
				res_layout = layout[i];
				break;
			}
		}
		if(!res_layout) {
			return {};
		}

		for(i=0; i<res_layout.sections.length; i++) {
			var is_expandable = res_layout.sections[i].collapsed_state=='expanded';
			var columns = [], question_value;
			var res_metainfo = $req.prop.getFieldMetaInfo(res_layout.sections[i].name);
			columns.push({"questions":[]});
			res_layout.sections[i].is_expandable=is_expandable;
			
			/* If the section is expandable, it can have two column resource fields */
			if(is_expandable) {
				columns.push({"questions":[]});
			}

			res_layout.sections[i].position.col += "";
			res_layout.sections[i].position.row += "";
			if(!res_layout.sections[i].is_deleted){
				hasVaildResource = true;
			}
			for(j=0, f_len=res_layout.sections[i].fields.length; j<f_len; j++) {
				var f_name = res_layout.sections[i].fields[j].name;
				 fieldMetaInfo=$req.prop.getFieldMetaInfo(f_name);
				
				/* construct Question object */
        		for(f_key in fieldMetaInfo) {
	            	res_layout.sections[i].fields[j][f_key] = fieldMetaInfo[f_key];
	            	res_layout.sections[i].fields[j].has_images = fieldMetaInfo.options_has_image || false;
        		}

        		question_value = $req.resource.constructCostDetails($req.details.request_info.udf_fields[f_name], fieldMetaInfo.display_name, fieldMetaInfo.fafr_key);
	    	   	if((fieldMetaInfo.display_type== 'Single Line'&&question_value[0]==null)||question_value === null || question_value === undefined || !question_value.length) {
	            	if(fieldMetaInfo.display_type !== 'Single Line') {
						question_value = [getMessageForKey("sdp.servicerequest.resource.question.unanswered.text")];
	            	}
	            	$req.prop.emptyResourceFields.push(fieldMetaInfo.fafr_key);
	            }else {
					isAnswered = true;
				}
				res_layout.sections[i].fields[j].DISPLAY_ANSWER = question_value;
				res_layout.sections[i].fields[j].id = f_name;

				var col_num = parseInt(res_layout.sections[i].fields[j].position.col) - 1;
				if(col_num == -2) {
					col_num = 0;
				}
				columns[col_num].questions.push(res_layout.sections[i].fields[j]);
				$req.prop.key_title_mappingObject[f_name] = res_layout.sections[i].fields[j].label;
			}

			if(res_layout.resource_view === "2") {
				/** For Grid view, the last section in the column info is included for rendering template */
				if(i+1 >= res_layout.sections.length || res_layout.sections[i].position.col !== res_layout.sections[i+1].position.col) {
					res_layout.sections[i].last_row = true;
				}
			} else {
				/** For relative view, if the row has two columns, they need to be merged in view */
				if(!is_expandable && i+1 < res_layout.sections.length && res_layout.sections[i+1].position.col == "2") {
					res_layout.sections[i].merge_next = true;
				}
			}
			res_layout.sections[i].columns = columns;
			res_layout.sections[i].ID = res_layout.sections[i].name.toUpperCase();
			res_layout.sections[i].FIELDNAME = res_layout.sections[i].name;
			res_layout.sections[i].NAME = res_layout.sections[i].title;
			res_layout.sections[i].DESCRIPTION = res_layout.sections[i].help_text;
			delete res_layout.sections[i].fields;
		}
		res_layout.isAnswered = isAnswered;
		res_layout.hasVaildResource = hasVaildResource;
		return res_layout;
	},

	//Resources shown only with service template
	setResourceToggelEditUpdate:function(){
		var isTEchnicianModify = window.print_mode? false : $req.details.operational_data.links.edit && $req.details.operational_data.links.edit.put ? true : false; 

		if($req.details.request_info.is_service_request && Object.keys($req.resource.resource_info).length){
	        jQuery('#res-edit-btn').removeClass('hide');
	    }else{
	        jQuery('#res-edit-btn').addClass('hide');
	    }
	    if($req.details.request_info.is_trashed || window.print_mode || !isTEchnicianModify || sdp_user.USERTYPE === "Requester") {
	    	jQuery('#res-edit-btn').remove();	// No I18N
	    }
	},
		   
	//Edit the Resources
	resourcesformFieldsEdit:function(){
	    if($req.prop.checkRightPanel){
		    $req.prop.closeRightPanelPriorityStatus('priority'); //NO I18N
			$req.prop.closeRightPanelPriorityStatus('status'); //NO I18N
		    $req.prop.checkRightPanel = false;
		    //$req.prop.setFieldAndFormRules(!$req.prop.fromListview);
		}

	    $req.resource.resourceformEdit();
	    //$req.prop.isOperationComplete = false;

	    jQuery("#emptyResourceMessage").addClass("hide");
	},

	copyCostValues:function(){
		var costDetails={'additionResourceCostType':$req.prop.additionResourceCostType,'costDetails':$req.prop.costDetails,'total_cost':$req.details.request_info.total_cost};//NO I18N
		$req.prop.oldCostDetails=costDetails;
	},

	resourceformEdit:function (){
		//$req.prop.editMode = true; 
		this.checkResBulkEdit = true;
		this.content_id="resEditForm"; // no i18n
		this.resource_modified=false;
		this.modified_resource_data = {};
		this.copyCostValues();
		if(!$req.prop.checkRightPanel){
	        jQuery('#bottom-resource-action').removeClass('hide');
	    }
	    var templateId=$req.details.request_info.template.id;
	    //Api call for getting resource object with Allowed Values
	    if(!$req.prop.didFetchResourceObj) {
	    	sdpAjax({
		        url:'/servlet/SDAjaxServlet?action=getResourceJson&woID='+woID,//NO I18N
		        type: 'GET',//NO I18N
		        cache: false,
		        async: false,
		        success: function(data){
		            if(data.IMAGE_TOKEN){
		                //This token will be used for Question option images in Resource Edit Form alone.
		                $req.common.image_token_for_qstn_edit = data.IMAGE_TOKEN;
		                delete data.IMAGE_TOKEN;
		            }
		            $req.prop.resourceObj = data;
		        }
		    });
		    this.didFetchResourceObj = true;
	    }
		
		sdpAjax({
		    url:'/servlet/SDAjaxServlet?action=getResCheckBoxLimit',//NO I18N
		    type: 'GET',//NO I18N
		    cache: false,
		    async: false,
		    success: function(data){
		        $req.resource.checkbox_max_options_selected = data.maxLimit;
		    }
		});
		
	    $req.resource.setEditedResource();
	    $req.resource.trackResourceForm();

	    var resourceForm = jQuery('#'+this.content_id);
	    resourceForm.find('[value="ResourceDiv"]').removeClass('fl').end().find('[data-name="verticalSeperator"]').removeClass("hide");
	    $req.prop.setFieldAndFormRules(false);
	    this.leftAlignSection();
	},

	trackResourceForm:function(){
		jQuery("#resEditForm").find("input,select").on('change', function(ele){
			$req.resource.resource_modified=true;
			$req.resource.trackModifiedResourceOption(ele);
			jQuery("#resource-action").prop('disabled', false); //No I18N
		});

		jQuery("#resEditForm input[name='single_line']").on('keydown', function(){
			if(jQuery(this).val().length>0){
				jQuery(this).trigger('change');
			}
		})
	},

    // Setting the questions that are modified by the user. Due to this, only the cost for modified questions will not be set in CF/Scripts inputObjects.
	trackModifiedResourceOption:function(ele){
        var questions_key = ele.currentTarget.getAttribute("data-field");

        if(questions_key.indexOf('udf_multiselect') != -1){
            var selected_answers_ele = jQuery("#" + questions_key + "_EDIT").find('input[type=checkbox]:checked');
            $req.resource.modified_resource_data[questions_key] = [];
            for(var answer_ele of selected_answers_ele){
                $req.resource.modified_resource_data[questions_key].push({"id":answer_ele.getAttribute("data-optionid")});
            }
        }
        else{
            var answer = ele.currentTarget.type && ele.currentTarget.type == "radio" ? ele.currentTarget.getAttribute("data-optionid") : ele.currentTarget.value;
            if((questions_key.indexOf('udf_sline_') == -1 && answer === 'null') || (answer != null && answer.trim().length == 0)){ //No I18N
                answer = null;
            }
            $req.resource.modified_resource_data[questions_key] = questions_key.indexOf('udf_sline') == -1 && answer ? {"id":answer} :answer; // No I18N
        }
    },

	//json format changes performed on edit resource
	setEditedResource:function(){
	    var resources = this.resource_info.sections;
	    var allowed_values=$req.prop.resourceObj;
	    var modified_allowed_val={},fieldType;
	    var resource_col1={'sections':[]},resource_col2={'sections':[]};//NO I18N
	    var resourceView=this.resource_info.resource_view;

		if(this.resource_info.allowed_values==undefined){
			for(var key in allowed_values){
	    		fieldType=allowed_values[key].TYPE;
	    		modified_allowed_val[key]=this.getOptionsArray(this.displayCost(),fieldType,allowed_values[key].AllowedValues);
	    	}
	    	this.resource_info.allowed_values=modified_allowed_val;
		}
		modified_allowed_val=jQuery.extend(true,{},this.resource_info.allowed_values);
		
	    for(var i=0;i<resources.length;i++){
			if(!resources[i].is_deleted) {
				curResource=resources[i];
				for(var j=0;j<curResource.columns.length;j++){
					this.setOptionsSelected(curResource.columns[j].questions,modified_allowed_val);
					this.setImageTokenToQuestion(curResource.columns[j].questions, $req.common.image_token_for_qstn_edit);
				}
				if(resourceView==1||(resourceView==2&&curResource.position.col==1)){
						resource_col1.sections.push(curResource);
				}

				if(resourceView==2&&curResource.position.col==2){
					resource_col2.sections.push(curResource);
				}
	    	}
	    }
		if(resource_col1.sections.length == 0 && resource_col2.sections.length == 0) {
			var emptyColumn = true;
		} else {
			var emptyColumn = false;
		}

	    var resource_columns={'columns':[resource_col1,resource_col2],'emptyColumn':emptyColumn};//NO I18N
	    this.openResourceDialog(resource_columns,modified_allowed_val);
	},

	//whether to show cost or not in details page
	displayCost:function(){
		var serviceCostEnabled=$req.details.template_info.is_cost_enabled,_self=this;
		var total_Cost=$req.details.request_info.total_cost;

		return serviceCostEnabled&&total_Cost;
	},

	openResourceDialog:function(resource_columns,allowed_values){
		var _self=this;
		var total_Cost=$req.details.request_info.total_cost;
		
		var json_data={
			'resource_view':this.resource_info.resource_view,//NO I18N
			"currencySymbol":sdp_app.CURRENCY_SYMBOL,//NO I18N
			"layouts":resource_columns,//NO I18N
			"allowed_values":allowed_values,//NO I18N
			'total_cost':total_Cost,//NO I18N
			"showCost":this.displayCost(),//NO I18N
			"checkbox_max_options":$req.resource.checkbox_max_options_selected//NO I18N
		};

		renderhbs('#resEditForm', 'resource-edit-template', json_data, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.resource_edit_template); //No I18N
	   	var win_width = jQuery(window).width();
		var dl_width = win_width > 1180 ? 1180 : win_width;
	   	jQuery("#resEditForm").dialog({
	   		'draggable':false,//NO I18N
	   		'width':dl_width,//NO I18N
	   		'title':translate('common.edit.label',[translate('common.resource')]),//NO I18N
	   		'dialogClass':'fix-box',//NO I18N
	   		'modal':true,//NO I18N
	   		open:function(){
	   			initTooltip('#resEditForm');//NO I18N
	   		},
	   		close:function(){
	   			jQuery("#resEditForm").dialog('destroy');//NO I18N
	   			jQuery("#resEditForm").html('');
	   			
	   			//cost changes should not be reverted on resource updation
	   			if(!$req.resource.resourceUpdated){
	   				$req.resource.cancelResourceChanges();
	   			}
	   			else{
	   				$req.resource.resetValues();
	   			}
	   			$req.resource.resourceUpdated=false;
	   			$req.resource.init();
	   			$req.resource.render();
	   		}
	   	});
	   	$resource_edit.initializeS2(json_data.showCost,allowed_values,$req.details.request_info.udf_fields);
		$resource_edit.highlightState();
		if (navigator.userAgent.indexOf('Mac OS X') != -1) {
 			jQuery("#resEditForm").addClass("mac-hack");
		} 
		$resource_edit.setResourceHeight();
	},

	//mark as selected for the selected option in the allowed values object
	setOptionsSelected:function(questions,allowed_values){
		var sel_index,sel_answer,qn_allowed_values;
		for(var i=0;i<questions.length;i++){
		    if(questions[i].is_deleted){
		       questions[i].row_id="-1";
		    }
    		if(questions[i].display_type=='CheckBox'||questions[i].display_type=='Radio'){
	    		sel_answer=questions[i].DISPLAY_ANSWER;
	    		qn_allowed_values=allowed_values[questions[i].fafr_key];
	    		
	    		if(sel_answer[0]!=getMessageForKey("sdp.servicerequest.resource.question.unanswered.text") && questions[i].row_id != "-1"
){
		    		for(var index=0;index<sel_answer.length;index++){
		    			sel_index = -1;
		    			for(var position=0; position<qn_allowed_values.length; position++){
		    				var item = qn_allowed_values[position];
		    				if(item.name==sel_answer[index].name) {
		    					sel_index = position;
		    					break;
		    				}
		    			}
		    			if(sel_index!=-1){
		    				qn_allowed_values[sel_index].selected=true;
		    			}
		    		}
		    	}
	    	}
		}
	},

	//convert allowed_values from the servlet into [{'id':'','name':'','cost':''},{}]
	getOptionsArray:function(showCost,fieldType,jsonObj){
		var serviceCostEnabled=$req.details.template_info.is_cost_enabled;
		var placeholderOption={"id":"null",'cost':0,"text":translate('sdp.common.selectitem'),'name':translate('sdp.common.selectitem'),'images':['/images/dummyimage.png']};//NO I18N
		var optionsArr=[];

		if(fieldType=='multiselect'){
			optionsArr.push(placeholderOption);
		}
		
		for(var key in jsonObj){
			if(key!='0'){
				var obj,value;
				keyValue=jsonObj[key];
				obj={'id':key,'name':keyValue.value,'sort_index':keyValue.sort_index};//NO I18N

				if(fieldType=='multiselect'||fieldType=='pick_list'){
					obj.text=keyValue.value
				}
				if(showCost){
					obj.cost=keyValue.cost;
				}
				if(keyValue.images){
					obj.images=keyValue.images;
				}
				optionsArr.push(obj);
			}	
		}

		optionsArr.sort(function(a,b){
			return a.sort_index-b.sort_index;
		})

		return optionsArr;
	},

	//update the resource json
	setUpdatedResource:function(){
		/*On submit event mandatory field validation*/
		if(Object.keys($req.prop.rulesObj).length !==0){
			parent.$se.checkOnSubmitCall();
	        parent.$se.executeOnFormSubmitScripts();
		}
		
		var checkBoxLimitExceeded = false;
		jQuery("#resEditForm").find('[name="checkbox_max_limit_error"]').each(function(){
			if(jQuery(this).css("display") == "block"){
				checkBoxLimitExceeded = true;
				return;
			}
		});
		
	    if(!checkBoxLimitExceeded && parent.$se.checkMandatoryValidation() && $req.resource.resource_modified && !$se.stopFormSubmission){
	    	$se.onFormSubmit=true;
                $se.executeOnFormSubmitScripts();
                $se.onFormSubmit=false;
	    	/*On submit event rules execution*/ 	
	        var resourceObject = {};
	        var resources = this.resource_info.sections;
	        var fieldName, columns, questions, key, type, quesId, productType;
	        this.resourceDBJson = {};
	        for(var i=0,ilen=resources.length;i<ilen;i++) {
				if(resources[i] && !resources[i].is_deleted) {
					
					fieldName = resources[i].FIELDNAME;
					columns = resources[i].columns;
					for(var j=0; j < columns.length; j++) {
						questions = columns[j].questions;
						for(var k=0; k < questions.length; k++) {
							if(questions[k].row_id != "-1") {
								key = questions[k].fafr_key;
								type = $req.prop.resourceObj[key].TYPE;
								quesId = questions[k].id;
								productType = questions[k].product_type;
								$req.resource.setResourceDBJson(key, type, quesId, productType);
							}
							
						}
					}
					//resourceObject[fieldName] = this.resourceDBJson;
	   	        }
	        }
	        $req.resource.updateDBResources(this.resourceDBJson);
	    }
	},

	//created selected value resource json
	setResourceDBJson:function(key,type,quesId,productType) {
	    switch(type) {
	    	case "multiselect": //NO I18N
	    		var value = null,eleId;
	    		if(jQuery('#select_'+key).select2('data')) {
	    			value = jQuery('#select_'+key).select2("data");	//No I18N
	    			eleId=jQuery(value.element[0]).val()
	    		}
	    		if(eleId == "null") {
	    	    	this.resourceDBJson[quesId] = null;
	    	    } else if(productType !== null) {
	                this.resourceDBJson[quesId] = {id:eleId};
	    	    } else {
	    	    	this.resourceDBJson[quesId] = {name:value.text};
	    	    }
	    	    break;
	    	case "multicheckbox": //NO I18N
	    	case "radio"://NO I18N
	    	    var checkedArr = jQuery('#'+key+'_EDIT').find('input:checked');
	    	    var valueArr = [];
	    	    for(var i=0,ilen=checkedArr.length;i<ilen;i++){
	    	        let optionId = jQuery(checkedArr[i]).attr('data-optionId');
	    	    	if(optionId){
	    	    		valueArr.push({id:optionId});
	    	    	}else{
	    	    	    valueArr.push({name:checkedArr[i].value});
	    	    	}
	    	    }
	    	    if(valueArr.length){
	    	    	this.resourceDBJson[quesId] = (type=='radio')?valueArr[0]:valueArr;
	    	    }else{
	    	    	this.resourceDBJson[quesId] =(type=='radio')?null:valueArr;
	    	    }
	    	    break;
	    	default:
	    	    var value = jQuery('#'+key+'_INPUT').val();
	    	    if(value === ''){
	    	    	this.resourceDBJson[quesId] = null;
	    	    }else{
	    	    	this.resourceDBJson[quesId] = value;
	    	    }
	    }
	},

	updateDBResources:function(resourceObject) {
		var resourceJson = {},_self=this;
		// Only the modified resource questions will be tracked in modified_resource_data and the same will be set to input Object if it is not empty, Else for safer check setting resourceObject generated in old flow as a safe backUp.
	    resourceJson.udf_fields = Object.keys($req.resource.modified_resource_data).length > 0 ? $req.resource.modified_resource_data : resourceObject;
	    var jsonUpdate = window.sdpToJSON({"request":resourceJson}); //No I18N
	    var inputObj={"input_data":jsonUpdate};//No I18N
	    addCSRF(inputObj);
	    
	    /** Disabling the form save / cancel button */
	    jQuery(".form-footer button").addClass("disabled");
	    jQuery("#resource-action").text(getMessageForKey("sdp.admin.common.updating"));
	    sdpAjax({
	    	headers: { Accept: 'application/v3+json' }, //No I18N
		    type: 'PUT', //No I18N
		    data: inputObj, //No I18N
		    url: '/api/v3/requests/'+woID,  //No I18N
		    success: function(data) {
			    if(data.response_status.status === 'success') {
	                $req.details.request_info = data.request;
	                
	                $req.utils.alert("success", getMessageForKey("request.updated"), "isAutoHide=true"); //No I18N
	                $req.prop.emptyResourceFields = [];
	                $req.resource.render();
	                $req.resource.resourceUpdated=true
	                jQuery("#resEditForm").dialog('close');//NO I18N
			    }
		    },
		    error: function(data) {
	    		data = data.responseJSON;
	    		if(data && data.response_status && data.response_status.messages && data.response_status.messages.length > 0) {
    				var fields = data.response_status.messages[0].fields || [data.response_status.messages[0].field];
    				var errorMsg = data.response_status.messages[0].message,qnId;
    				errorMsg=(errorMsg)?errorMsg:getMessageForKey("request.fields.update.error");
    				if(fields && fields.length > 0) {
    					var mapped_fields = [],field,key;
    					for(var i=0; i<fields.length; i++) {
    						key=fields[i];
    						if(fields[i].indexOf(".")!=-1){
    							key=fields[i].split(".")[1];
    						}
    						field = $req.prop.key_title_mappingObject[key] || key;
    						mapped_fields.push(e_html(field));
    					}
    					errorMsg += " : <b>" + mapped_fields.join(", ") + "</b>";	//No I18N
    				}
	    		    $req.utils.alert("warning", errorMsg, "isAutoHide=false"); //No I18N
				} else {
					$req.utils.alert("warning", getMessageForKey("request.fields.update.error"), "isAutoHide=true, delay=15"); //No I18N
				}
	    	}
	    }).always(function() {
	    	/** Re-enabling the form save / cancel button incase of any failure in updation */
	    	jQuery("#resource-action").text(getMessageForKey("sdp.common.update"));
	    	jQuery(".form-footer button").removeClass("disabled");
	    });
	},

	//editmode is set to true on resource edit and false on cancel
	resetValues: function() {
	    $req.prop.editMode = false;
	    $req.resource.checkResBulkEdit = false;
	    $req.prop.checkBulkEdit = false;
	    $req.resource.resource_modified=false;
		$req.resource.modified_resource_data = {};
	    
	    setTimeout(function() {
	        $req.prop.setFieldAndFormRules(!$req.prop.fromListview);
	    },1);
	},

	//on cancelling resource popup changes,cost changes are reverted
	cancelResourceChanges:function(){
		var oldCostDetails=$req.prop.oldCostDetails;

		if(oldCostDetails){
			$req.prop.costDetails=oldCostDetails.costDetails;
	    	$req.details.request_info.total_cost=oldCostDetails.total_cost;
	    	$req.prop.additionResourceCostType=oldCostDetails.additionResourceCostType;
	    	delete $req.prop.oldCostDetails;
		}

    	this.resetValues();
	},

	closeResDialog:function(){
		jQuery("#resEditForm").dialog('close');//NO I18N
	},

	leftAlignSection: function() {
		if($req.resource.resource_info.resource_view === "1") {
			jQuery("#"+this.content_id).find(".resourceportletContainer").each(function(i, container) {
		    	var section = jQuery(container).find("[value=ResourceDiv]");
				if(section.length === 1) {
					/**  only for the relative view, align the section to left */
					section.addClass("fl")
					jQuery(container).find("[data-name=verticalSeperator]").addClass("fl");
				}
			});
		}
	},

	//view options for the question
	viewOptionImages:function(qnId,optionId){
		var optionDetails,ele,qnName;
		var templateId=$req.details.request_info.template.id;

        /* Need to load the scripts required for the option details popup only if it is not already present */
		if(!window.optionsViewer){
			ResourceLoader({
                js: ['/scripts/viewOptionDetails.js'], //No I18N
                process: "series", //If parallel, scripts will be fetched via promise and async will not be considered.
                async: false //By default async is true
            });
		}
		ele=jQuery(event.target);
		qnName=ele.parent().siblings('p[name="content-head"]').text();//NO I18N

		if(optionId){
		    /* Need to fetch options using api/v3/requests/<id>/udf_fields/<udf_api_key>/<optionId>. Need to include requestId because, deleted option details will be returned only when request Id present. */
			optionDetails=getOptionDetails(qnId,optionId,templateId,$req.details.request_info.id, true);
		}else{
			optionDetails={'name':ele.siblings("span[name='optionName']").text()};//NO I18N
		}

		if(!$req.details.template_info.is_cost_enabled ){
			delete optionDetails.cost;	
		}
		
		optionsViewer.init({
    		question:{
    		    id : qnId,
    		    name : qnName,
    		    options : [optionDetails],
    		    image_token : $req.details.request_info.image_token
            },
    		cur_index:0,
    		showCost:this.displayCost()
        });
	},
	
	//Checking resource question check box selected option limit
	checkBoxOptionsLimit:function(question, name){
		if(jQuery(question).attr('type') == "checkbox"){
			var checked = jQuery('input[name='+jQuery(question).attr('name')+']:checked').length;
			if(checked > $req.resource.checkbox_max_options_selected){
				jQuery('#resources\\.'+name+'-error').css("display","block"); //NO I18N
			}
			else{
				jQuery('#resources\\.'+name+'-error').css("display","none"); //NO I18N
			}
		}
	},
	setImageTokenToQuestion: function(questions, image_token){
	    for(let question of questions){
	        question.image_token = image_token;
	    }
	}
};

$req.resource.init();