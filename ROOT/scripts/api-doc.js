/**
 * APISidebar is an object that manages the sidebar navigation for API documentation.
 * It provides methods to construct the sidebar, handle entity and operation clicks, 
 * and populate the middle panel with entity details or operation forms.
 */
var APISidebar = {
	/*
	 *** Edition based Implementation ***
	 *** Nonlicense entity group name should be present in NonLicenseModules array and assigned module name as "Common" in the RestApi.txt and respective entity filenames.  ***
	 */
		isModuleEnabled : function(entity){
			const NonLicenseModules = ["Request","Solutions","Reports","Admin","Approvals","Reminder","Comments","Task","Worklog","Device_Registration","Announcements","Common","Software","Backup_Approver"]; //No I18N
			if( entity !== undefined && ( NonLicenseModules.contains(entity) || licenseModules[entity])){
				return true;
			}
			return false;
		},
		/**
		 * Constructs the left navigation sidebar with entities and their operations.
		 * @param {boolean} isReconstructed - Indicates whether the sidebar is being reconstructed.
		 */
		constructLeftNav: function(isReconstructed){
		
			if(isReconstructed){
				jQuery('#sidebar-nav > ul > li:not(:first)').remove();//No I18N
			}
			var internalMode = window.location.href.indexOf("internal=true") > 0 ? true : false;
	
			for(var entityGroup in indexJson.entities){
				if(!APISidebar.isModuleEnabled(entityGroup)){continue;}
				var entityGroupList = APISidebar.getGroupList(entityGroup);
				var hasAnyEntity = false;
	
				for(var i in indexJson.entities[entityGroup]){
					var entJson = indexJson.entities[entityGroup][i];
					if( !APISidebar.isModuleEnabled(entJson.moduleName)){continue;}
					if(!APISidebar.isAllowedToShowEntityVersion(entJson.entityName)){	continue;	}
	
					if( sdp_app.IS_SDP && ((entJson.inOP && entJson.inOP == 'true') && ((entJson.isReleased && entJson.isReleased == 'true') || internalMode) )){//No I18N
						var entityLi = APISidebar.getEntitylist( entJson.entityName, entJson.fileName, entityGroup);
						jQuery(entityGroupList).find('>ul').append(entityLi);
						hasAnyEntity = true;
					}
					else if( sdp_app.IS_AE && (((entJson.isAsset && entJson.isAsset == 'true') || internalMode) && ((entJson.isReleased && entJson.isReleased == 'true') || internalMode)  )){//No I18N
						var entityLi = APISidebar.getEntitylist( entJson.entityName, entJson.fileName, entityGroup);
						jQuery(entityGroupList).find('>ul').append(entityLi);
						hasAnyEntity = true;
					}
				}
				
				if(hasAnyEntity) {	jQuery('.nav-stacked').eq(0).append(entityGroupList);	}//No I18N	
			}
		},
		/**
		 * Checks if an entity version is allowed to be shown in the sidebar.
		 * @param {string} entName - The name of the entity.
		 * @returns {boolean} - True if the entity version is allowed, false otherwise.
		 */
		isAllowedToShowEntityVersion : function(entName) {
	
			if(sdp_app.IS_SDP && (entName && entName.indexOf('_V01') != -1) ){//No I18N
				return false;
			}
			return true;
		},
		/**
		 * Creates a group list element for a given entity group.
		 * @param {string} entityGroup - The name of the entity group.
		 * @returns {HTMLElement} - The group list element.
		 */
		getGroupList : function(entityGroup){
	
			var entityGroupList = jQuery('#enttity-group>li').clone();//No I18N
			jQuery(entityGroupList).addClass(entityGroup+' has-child');
			jQuery(entityGroupList).find('>a').html(e_html(entityGroup));
			jQuery(entityGroupList).find('>a').on("click",function(){ //No I18N
				APISidebar.groupClick(this,entityGroup);
			});
			jQuery(entityGroupList).find('>a').attr('id','entityGroup_'+entityGroup); //No I18N
			jQuery(entityGroupList).find('>ul').addClass('nav nav-stacked');
		
			return entityGroupList;
		},
	    /**
		 * Loads the entity list for a specific group and executes a callback when done.
		 * @param {string} entityGroup - The name of the entity group.
		 * @param {Function} callback - The callback function to execute after loading.
	    */
		loadEntityListForGroup: function(entityGroup,callback){
	
			var entityGroupCount = indexJson.entities[entityGroup].length;
			var populate = function(entity){
						APISidebar.populateLeftNavOper(entity,entityGroup);
						entityGroupCount--;
						if(entityGroupCount == 0){
							callback();
						}
					};
			indexJson.entities[entityGroup].map((item, index) => {
				var entity = item.entityName;
				if (!contentsJson[entity]) {
					APISection.getJsonFile(entity,undefined,populate);
				} else {
					APISidebar.populateLeftNavOper(entity);
					if (index === indexJson.entities[entityGroup].length - 1) {
						callback();
					}
				}
			});
		},
		/**
		 * Populates the left navigation with operations for a given entity.
		 * @param {string} entity - The name of the entity.
		 * @param {string} entityGroup - The name of the entity group.
		 */
		populateLeftNavOper : function(entity,entityGroup){
	
			if(jQuery('#entity_'+entity).siblings('ul').html() == ''){	APISidebar.populateLeftNavOperations(jQuery('#entity_'+entity).parent(),entity,entityGroup);	}
		},
		/**
		 * Handles the click event for a group in the sidebar.
		 * @param {HTMLElement} element - The clicked group element.
		 * @param {string} entityGroup - The name of the entity group.
		 * @param {Array} [callbackParam] - Optional callback parameters.
		 */
		groupClick : function(element,entityGroup, callbackParam){
	
			APISidebar.loadEntityListForGroup(entityGroup,function(){
	
				APIactions.toggleSidebarLinks(element);
	
				var liElem = jQuery(element).siblings('ul').find('a')[0];//No I18N
				var firstEntityName = jQuery(liElem).attr('id').replace('entity_', '');//No I18N
		
				if(callbackParam) {
					APISidebar.entityClick(callbackParam[0], callbackParam[1]);
				}
				else {
					APISidebar.entityClick( jQuery(element).siblings('ul').find('a')[0], firstEntityName);//No I18N
				}
			});
		
		},
		/**
		 * Populates the left navigation with operations for a given entity and group.
		 * @param {HTMLElement} entityLi - The list item element for the entity.
		 * @param {string} entity - The name of the entity.
		 * @param {string} entityGroup - The name of the entity group.
		 */
		populateLeftNavOperations : function(entityLi,entity,entityGroup){
			var internalMode = window.location.href.indexOf("internal=true") > 0 ? true : false;
	
			if(contentsJson[entity].operations.length > 0){
				jQuery(entityLi).addClass('has-child');
				if(jQuery(entityLi).find('>ul').length == 0){	jQuery(entityLi).append('<ul></ul>');	}
				jQuery(entityLi).find('>ul').empty();
				jQuery(entityLi).find('>ul').addClass('nav nav-stacked');
	
				for(var oper in contentsJson[entity].operations){
	
					if(!APISidebar.isModuleEnabled(contentsJson[entity].operations[oper].moduleName)){continue;}
	
					if( sdp_app.IS_SDP && ((((contentsJson[entity].operations[oper].isReleased && contentsJson[entity].operations[oper].isReleased == 'true') || internalMode) && (contentsJson[entity].operations[oper].inOP && contentsJson[entity].operations[oper].inOP == 'true')) )){
						jQuery(entityLi).find('>ul').append(APISidebar.getOperationList(entity,oper,entityGroup));
				
					} else if( sdp_app.IS_AE && ((((contentsJson[entity].operations[oper].isReleased && contentsJson[entity].operations[oper].isReleased == 'true') || internalMode) && ((contentsJson[entity].operations[oper].isAsset && contentsJson[entity].operations[oper].isAsset == 'true') || internalMode))  )){
						jQuery(entityLi).find('>ul').append(APISidebar.getOperationList(entity,oper,entityGroup));
					}
				}
	
				if(jQuery(entityLi).find('>ul').html() == ''){
					jQuery(entityLi).removeClass('has-child');
					jQuery(entityLi).find('>ul').remove();
				}
			}
			else{	jQuery(entityLi).find('>ul').remove();	}
		},
		/**
		 * Creates a list item element for a given entity.
		 * @param {string} entity - The name of the entity.
		 * @param {string} fileName - The file name associated with the entity.
		 * @param {string} entityGroup - The name of the entity group.
		 * @returns {HTMLElement} - The list item element for the entity.
		 */
		getEntitylist: function(entity,fileName, entityGroup){
	
			var entityLi = jQuery('#enttity-group>li').clone();//No I18N
			jQuery(entityLi).find('>a').html(e_html(entity))
									.attr({'id':'entity_'+entity}).on("click",function(){ APISidebar.entityClick(this,entity)});//No I18N
			if(APISidebar.getReleasedEntityCount(entityGroup) == 1 && entityGroup == entity){	jQuery(entityLi).find('>a').addClass('hide');	}
	
			return entityLi;
		},
		/**
		 * Gets the count of released entities for a specific group.
		 * @param {string} entityGroup - The name of the entity group.
		 * @returns {number} - The count of released entities.
		 */
		getReleasedEntityCount: function(entityGroup){
			
			var groupEntities = indexJson.entities[entityGroup] ? indexJson.entities[entityGroup] : [];
			var releasedApiCount = 0;
			groupEntities.map(item => {
				if( item.isReleased && item.isReleased == "true"){
					if(sdp_app.IS_SDP && item.inOP && item.inOP == "true"){
						releasedApiCount++;
					} else if(sdp_app.IS_AE && item.isAsset && item.isAsset == "true"){
						releasedApiCount++;
					}
				}
			});
	
			return releasedApiCount;
		},
		/**
		 * Creates a list item element for an operation of a given entity.
		 * @param {string} entity - The name of the entity.
		 * @param {number} oper - The index of the operation.
		 * @param {string} entityGroup - The name of the entity group.
		 * @returns {HTMLElement} - The list item element for the operation for given entity and index 'oper'
		 */
		getOperationList: function(entity,oper,entityGroup){
	
			if(!oper || oper == -1){	oper = contentsJson[entity].operations.length - 1;	}
			var operationLi = jQuery('#enttity-group>li').clone();//No I18N
			jQuery(operationLi).find('>a').html(contentsJson[entity].operations[oper].disp_desc).on("click" , function(){APISidebar.operationClick(this,entity,oper,entityGroup)});
			jQuery(operationLi).find('>ul').remove();
	
			return operationLi;
		},
		/**
		 * Handles the click event for an entity in the sidebar.
		 * @param {HTMLElement} element - The clicked entity element.
		 * @param {string} entity - The name of the entity.
		 */
		entityClick : function(element,entity){
	
			if(APISection.getFileModifiedTime('RestApi') > indexJson.lastModified){
					APISection.getIndexFile();
			}
	
			var groupName = APISection.findJson(entity)
	
			if(contentsJson[entity]==undefined) {
				var groupElement = jQuery("#entityGroup_"+groupName[0]).first();
				APISidebar.groupClick(groupElement, groupName[0], [element, entity]);
				return;
			}
	
			if(groupName.length == 0){
				showalert("failure",translate("doctool.entity.not.found"),'isAutoHide=true');//No I18N
				jQuery('#entity_'+entity).parent().remove(); // LeftNav Change   //No I18N
				return;
			}
	
			jQuery('#api-section').empty();//No I18N
			jQuery('.multi-response').removeClass('multi-response');//No I18N
			jQuery('#processingDiv').html( jQuery('#hiddenDiv').html() );//No I18N
			jQuery('#processingDiv .api-text').append( jQuery('#processingDiv .attr-list') );//No I18N
	
			APISidebar.constructEntityMiddlePanel( jQuery('#processingDiv .api-text')[0], entity );
	
			jQuery('#api-section').html( jQuery('#processingDiv').html() );//No I18N
			jQuery('#processingDiv').empty();//No I18N
	
			APIactions.toggleSidebarLinks(element);
		},
		/**
		 * Constructs the middle panel with details of a given entity.
		 * @param {HTMLElement} apiTextDiv - The container for the entity details. APISection div
		 * @param {string} entity - The name of the entity.
		 */
		constructEntityMiddlePanel: function(apiTextDiv,entity){
	
			var attrTable = jQuery(apiTextDiv).find('.attr-list')[0];
	
			APISidebar.populateEntityDetails(apiTextDiv,entity);
	
			APISidebar.populateAttributeTable( attrTable, entity );
	
			if(contentsJson[entity].subsections){ APISidebar.populateSubsections( attrTable, entity );	}
	
			if(contentsJson[entity].errorcodes){ APISidebar.populateErrorCodes( attrTable, entity );	}
	
			jQuery(apiTextDiv).find('.action-div').remove();
			jQuery(apiTextDiv).find('.api-form').remove();
		},
		/**
		 * Populates the entity details in the middle panel.
		 * @param {HTMLElement} apiTextDiv - The container for the entity details. APISection div
		 * @param {string} entity - The name of the entity.
		 */
		populateEntityDetails : function(apiTextDiv,entity){
			jQuery(apiTextDiv).find('.attr-list').show();
			APISidebar.populateEntityDesc(apiTextDiv,entity);
		},
		/**
		 * Populates the entity description in the middle panel.
		 * @param {HTMLElement} apiTextDiv - The container for the entity description.
		 * @param {string} entity - The name of the entity.
		 */
		populateEntityDesc: function(apiTextDiv,entity){
	
			var entDet = APISection.findJson(entity);
			var entJson = indexJson.entities[entDet[0]][entDet[1]];
		
			jQuery(apiTextDiv).find('h1').eq(0).text(entity);
			jQuery(apiTextDiv).find('p').eq(0).html( entJson.entityDesc ? entJson.entityDesc : '' );
		
			if(entJson.basetable != undefined && entJson.basetable != ''){	jQuery(apiTextDiv).find('.table-name-div').eq(0).show().find('>a').text( entJson.basetable );	}
		
		},
		/**
		 * Populates the attribute table for a given entity.
		 * @param {HTMLElement} attrTable - The attribute table container. (Attributes list)
		 * @param {string} entity - The name of the entity.
		 */
		populateAttributeTable : function(attrTable,entity){
			var entname = entity.toLowerCase().replace(/ /g,'-');
			jQuery(attrTable).find('#tab1').attr('id',entname+'-attributes');//No I18N
			jQuery(attrTable).find('[href="#tab1"]').attr('href','#'+e_attr(entname)+'-attributes');//No I18N
			jQuery(attrTable).find('#'+e_attr(entname)+'-attributes>table').replaceWith( APISidebar.createAttributeTable(entity,'attributes') ); //No I18N
		},
	
		/**
		 * Handles the click event for an operation in the sidebar.  :try out form shown in middle pane
		 * @param {HTMLElement} element - The clicked operation element.
		 * @param {string} entity - The name of the entity.
		 * @param {number} oper - The index of the operation.
		 * @param {string} entityGroup - The name of the entity group.
		 */
		operationClick : function(element,entity,oper,entityGroup){
			var oldOperationName = contentsJson[entity].operations[oper] ? contentsJson[entity].operations[oper].disp_desc : '';
			APISidebar.showOperation(element, entity, oper,oldOperationName,entityGroup);
		},
		/**
		 * Displays the details of an operation in the middle panel.
		 * @param {HTMLElement} element - The clicked operation element.
		 * @param {string} entity - The name of the entity.
		 * @param {number} oper - The index of the operation.
		 * @param {string} oldOperationName - The previous name of the operation.
		 * @param {string} entityGroup - The name of the entity group.
		 */
		showOperation : function(element, entity, oper,oldOperationName,entityGroup){
	
			if(jQuery.isEmptyObject(APISection.findOperationJson(entity, oldOperationName))){
				showalert("failure",translate("doctool.operation.not.found"),'isAutoHide=true');//No I18N
				APISidebar.populateLeftNavOperations(jQuery('#entity_'+entity).parent(),entity,entityGroup);//No I18N
				jQuery('#entity_'+entity).click();//No I18N
				return;
			}
		
			jQuery('#api-section').empty();//No I18N
			jQuery('.multi-response').removeClass('multi-response');//No I18N
		
			oper = APISidebar.findOperationIndex(entity, oldOperationName, oldOperationName);
		
			jQuery('#processingDiv').html( jQuery('#hiddenDiv').html() );//No I18N
		
			var operationJson = contentsJson[entity].operations[oper];
			var noOfInputs = APISidebar.constructOperationPanel(entity,oper);
		
			jQuery('#api-section').html( jQuery('#processingDiv').html() );//No I18N
			jQuery('#processingDiv').empty();//No I18N
		
			//below code are to be executed after 'api-section' is filled
			APISection.populateOperationForm(entity, operationJson,noOfInputs+1,jQuery('#api-section .api-text')[0],entityGroup);
		
			if( operationJson.output ){	APISection.showSampleResponse(operationJson.output.sample,jQuery('#api-section .api-response')[0]);	}
		
			APIactions.toggleSidebarLinks(element);
			if(entity.toLowerCase() != "attachment" && operationJson.path.indexOf('v3')!== -1){//No I18N
				jQuery("#code").show();//No I18N
			}
			else if( jQuery.isArray(operationJson.path) ){
	
				operationJson.path.map((item,i) => {
					if(i < operationJson.path.length && item.indexOf('v3')!== -1){
						jQuery("#code").show();//No I18N
					}
				});
			}
		},
		/**
		 * Constructs the operation panel in the middle pane.
		 * @param {string} entity - The name of the entity.
		 * @param {number} oper - The index of the operation.
		 * @returns {number} - The number of mandatory inputs included.
		 */
		constructOperationPanel: function(entity,oper){
	
			var operationJson = contentsJson[entity].operations[oper];
			var apiTextDiv = jQuery('#processingDiv .pos-rel')[0];
			var attrTable = jQuery('#processingDiv .attr-list')[0];
	
			APISidebar.populateOperationDetails(apiTextDiv,operationJson);
	
			APISidebar.populateAttributeTable(attrTable,entity);
	
			APISidebar.populateEntityDesc(attrTable, entity);
	
			APISidebar.enterHttpMethod(operationJson.method);
	
			if(contentsJson[entity].subsections){ APISidebar.populateSubsections( attrTable, entity );	}
	
			if(contentsJson[entity].errorcodes){ APISidebar.populateErrorCodes(attrTable,entity);	}
	
			return APISidebar.includeMandatoryInputs( apiTextDiv,operationJson.path );
		},
		/**
		 * Populates the operation details in the middle panel.
		 * @param {HTMLElement} apiTextDiv - The container for the operation details.
		 * @param {Object} operationJson - The JSON object containing operation details.
		 */
		populateOperationDetails : function(apiTextDiv,operationJson){
			var content = operationJson.desc ? operationJson.desc + '<br/>' : '';//No I18N
			jQuery(apiTextDiv).find('h1').eq(0).text( operationJson.disp_desc );
			jQuery(apiTextDiv).find('p').eq(0).html( content );
			if(operationJson.roles){	jQuery(apiTextDiv).find('.role-permission-div').eq(0).text( 'Role permissions :' + operationJson.roles.toString().replace(/,/g,', ') );	}
		},
		/**
		 * Sets the HTTP method for the operation in the middle panel.
		 * @param {string} method - The HTTP method (e.g., GET, POST).
		 */
		enterHttpMethod : function(method){
			jQuery('#processingDiv .api-request-type')[0].textContent = method;
			jQuery('#processingDiv .api-request-type').addClass('api-request-' + method.toLowerCase());//No I18N
		},
		/**
		 * Includes mandatory inputs for the operation in the middle panel.
		 * @param {HTMLElement} apiTextDiv - The container for the operation inputs.
		 * @param {string} path - The API path containing placeholders for inputs.
		 * @returns {number} - The number of mandatory inputs included.
		 */
		includeMandatoryInputs: function(apiTextDiv,path){
	
			var prevInputLi = jQuery(apiTextDiv).find('form>ul>li')[0];
			var noOfInputs = 0;
			if(jQuery.isArray(path)){
				path = path[0];
			}
			
			while(path.indexOf('{')>-1){
				var labelStr = path.substring(path.indexOf('{')+1,path.indexOf('}'));
				var inputLi = prevInputLi.cloneNode(true);
				jQuery(inputLi).show();
				jQuery(inputLi).find('.text-mandatory')[0].textContent = labelStr;
				jQuery(inputLi).find('.form-control')[0].id = labelStr.replace(/ /g,'_');
				jQuery(inputLi).find('.form-control').addClass('req_field');
				jQuery(inputLi).insertAfter(e_html(prevInputLi));
				path = path.replace('{','-').replace('}','-');
				prevInputLi = inputLi;
				noOfInputs++;
			}
		
			return noOfInputs;
		},
		/**
		 * Populates subsections for a given entity in the attribute table.
		 * @param {HTMLElement} attrTable - The attribute table container. (Attributes list)
		 * @param {string} entity - The name of the entity.
		 */
		populateSubsections: function(attrTable,entity){
	
			var attrContent = jQuery(attrTable).find('#'+entity.toLowerCase().replace(/ /g,'-')+'-attributes table tbody').eq(0);
			for(var subsec in contentsJson[entity].subsections){
				jQuery(attrContent).append( APISidebar.getSubsections( entity, subsec ) );
			}
		},
		/**
		 * Creates a subsection row for a given entity and subsection.
		 * @param {string} entity - The name of the entity.
		 * @param {string} subsec - The name of the subsection.
		 * @returns {HTMLElement} - The subsection row element.
		 */
		getSubsections: function( entity, subsec ){
		
			var returnArray = [], subsecJson = contentsJson[entity].subsections[subsec];
			var subsecRow = jQuery('#attrTable').find('tr.hidden').clone(true).removeClass();//No I18N
			jQuery(subsecRow).find('label').text( subsec );
			jQuery(subsecRow).find('span').text( 'Object' );//No I18N
			jQuery(subsecRow).find('p').text( subsecJson.desc );
	
			returnArray = subsecRow;
		
			if( subsecJson.attributes ){
				var attrArray = subsecJson.attributes;
				for(var attr in attrArray){
					if( sdp_app.IS_SDP && ((attrArray[attr].inOP && attrArray[attr].inOP == 'true')  )){
						var attrRow = APISidebar.createAttributeRow( entity, subsec, true, attrArray[attr], attr );
						returnArray = jQuery(returnArray).add( attrRow );
					}
					else if( sdp_app.IS_AE && ((attrArray[attr].isAsset && attrArray[attr].isAsset == 'true')  )){
						var attrRow = APISidebar.createAttributeRow( entity, subsec, true, attrArray[attr], attr );
						returnArray = jQuery(returnArray).add( attrRow );
					}
				}
			}
		
			return returnArray;
		},
		/**
		 * Populates error codes for a given entity in the attribute table.
		 * @param {HTMLElement} attrTable - The attribute table container. (Attributes list)
		 * @param {string} entity - The name of the entity.
		 */
		populateErrorCodes : function(attrTable,entity){
	
			var entname = entity.toLowerCase().replace(/ /g,'-');
			var navTab = jQuery(attrTable).find('.nav-sdtabs>li').eq(0).clone(true);
			jQuery(navTab).removeClass();
			jQuery(navTab).find('a').attr('href','#'+e_attr(entname)+'-errorcodes').text('Error Codes');//No I18N
			jQuery(attrTable).find('.nav-sdtabs').append( navTab );
			jQuery(contentDiv).removeClass('active').attr('id',entname+'-errorcodes');//No I18N
			jQuery(contentDiv).find('table').replaceWith( APISidebar.createErrorcodeTable(entity) );
			jQuery(attrTable).find('.sdtab-content').append(contentDiv);
		},
		/**
		 * Creates an attribute table for a given entity.
		 * @param {string} entity - The name of the entity.
		 * @param {string} attr_type - The type of attributes (e.g., "attributes").
		 * @param {boolean} isSubsection - Indicates if the attributes belong to a subsection.
		 * @returns {HTMLElement} - The attribute table element.
		 */
		createAttributeTable : function(entity,attr_type,isSubsection){
	
			var attrTable = jQuery('#attrTable')[0].cloneNode(true);
			var attrArray = isSubsection ? contentsJson[entity].subsections[attr_type].attributes : contentsJson[entity][attr_type]; // For subsections 'attr_type' is the name of subsection
	
			if(attrArray.length>0){
				var tbody = jQuery(attrTable).find('tbody')[0];
	
				for(var attr in attrArray){
					if( sdp_app.IS_SDP && (((attrArray[attr].isReleased && attrArray[attr].isReleased == 'true') && (attrArray[attr].inOP && attrArray[attr].inOP == 'true'))  )){
						var attrRow = APISidebar.createAttributeRow( entity, attr_type, isSubsection, attrArray[attr], attr );
						tbody.appendChild( attrRow );
					}
					else if( sdp_app.IS_AE && (((attrArray[attr].isReleased && attrArray[attr].isReleased == 'true') && (attrArray[attr].isAsset && attrArray[attr].isAsset == 'true'))  )){
						var attrRow = APISidebar.createAttributeRow( entity, attr_type, isSubsection, attrArray[attr], attr );
						tbody.appendChild( attrRow );
					}
				}
			}
			else if(attr_type == 'attributes'){
				var text = document.createTextNode("No attributes to show.");//No I18N
				jQuery(attrTable).html(text); 
			}
			jQuery(attrTable).removeAttr('id');//No I18N
	
			return attrTable;
		},
		/**
		 * Creates a row for an attribute in the attribute table.
		 * @param {string} entity - The name of the entity.
		 * @param {string} attr_type - The type of attributes (e.g., "attributes").
		 * @param {boolean} isSubsection - Indicates if the attribute belongs to a subsection.
		 * @param {Object} attrJson - The JSON object containing attribute details.
		 * @param {string} attr - The name of the attribute.
		 * @returns {HTMLElement} - The attribute row element.
		 */
		createAttributeRow: function(entity,attr_type,isSubsection,attrJson,attr){
	
			var attributeRow = jQuery('#attrTable').find('tr.hidden')[0].cloneNode(true);//No I18N
			var attrCell = jQuery(attributeRow).find('td')[0];
			var attrName = jQuery(attributeRow).find('label')[0];
		
			var text = attrJson.name;
			jQuery(attrName).html( text );
			if( attrJson.isMandatory && attrJson.isMandatory == 'true' ){
				jQuery(attrName).addClass('text-mandatory');
				jQuery(attrName).attr('title',translate("sdp.common.mandatory"));//No I18N
			}
		
			if( attrJson.isDefault && attrJson.isDefault == 'true' ){
				jQuery(attrCell).addClass('attr-default');
				if( jQuery(attrName).attr('title') && jQuery(attrName).attr('title') != '' ){
					jQuery(attrName).attr('title',jQuery(attrName).attr('title')+','+ translate("sdp.inventory.detailWS.default"));//No I18N
				}
				else{	jQuery(attrName).attr('title',translate("sdp.inventory.detailWS.default"))	}//No I18N
			}
		
			var attrType = jQuery(attributeRow).find('td').eq(1).find('span').eq(0);
			attrType.html(attrJson.type);
			if( attrJson.isReadOnly && attrJson.isReadOnly == 'true' ){		attrType.append('<label class="attr-readonly ml10"> (Read Only)</label>');		}
			if( !(attrJson.isReleased && attrJson.isReleased == 'true') ){		attrType.append('<label class="attr-readonly ml10"> (Not Implemented)</label>');		}
		
			var attrDesc = jQuery(attributeRow).find('p');
			attrDesc.eq(0).html( attrJson.desc ? attrJson.desc : '' );
		
			if(attrJson.column){
				var tableDetails = attrJson.column ? attrJson.column.split(':') : 'INFO NOT AVAILABLE: ';
				var attrColumn = "<label title='"+translate('doctool.table.view.details')+"' class='attr-table-data mt5'>"+tableDetails[0].trim()+" : "+tableDetails[1].trim()+"</label>";//No I18N
				jQuery(attrColumn).insertAfter( attrDesc );
			} 
			jQuery(attributeRow).removeAttr('class');//No I18N
			if(isSubsection){	jQuery(attributeRow).addClass('attr-subsec');	}
	
			return attributeRow;
		},
		/**
		 * Creates an error code table for a given entity.
		 * @param {string} entity - The name of the entity.
		 * @returns {HTMLElement} - The error code table element.
		 */
		createErrorcodeTable: function(entity){
	
			var codeTable = jQuery('#attrTable')[0].cloneNode(true);
			var codeArray = contentsJson[entity].errorcodes;
	
			if(codeArray.length>0){
				jQuery(codeTable).find('thead tr th')[0].textContent = 'Status Code';//No I18N
				jQuery(codeTable).find('thead tr th')[1].textContent = 'Message';//No I18N
				var tbody = jQuery(codeTable).find('tbody')[0];
				for(var index in codeArray){
					if( ((codeArray[index].isAsset && codeArray[index].isAsset == 'true') || (codeArray[index].inOP && codeArray[index].inOP == 'true')) ){
						var codeRow = APISidebar.createErrorcodeRow( entity, codeArray[index], index );
						tbody.appendChild( codeRow );
					}
				}
			}
			else{
				var text = document.createTextNode("No errorcodes to show.");//No I18N
				jQuery(codeTable).html(text); 
			}
	
			jQuery(codeTable).removeAttr('id');//No I18N
			jQuery(codeTable).removeAttr('class');//No I18N
	
			return codeTable;
		},
		/**
		 * Creates a row for an error code in the error code table.
		 * @param {string} entity - The name of the entity.
		 * @param {Object} codeJson - The JSON object containing error code details.
		 * @param {number} index - The index of the error code.
		 * @returns {HTMLElement} - The error code row element.
		 */
		createErrorcodeRow: function( entity, codeJson, index ){
	
			var codeRow = jQuery('#attrTable').find('tr.hidden')[0].cloneNode(true);//No I18N
			var code = jQuery(codeRow).find('label')[0];
			code.textContent = codeJson.code;
			jQuery(codeRow).find('p:eq(0)').html( codeJson.desc );
			jQuery(codeRow).removeAttr('class');//No I18N
		
			return codeRow;
		},
		/**
		 * Finds the index of an operation in the operations list for a given entity.
		 * @param {string} entity - The name of the entity.
		 * @param {string} operDispName - The display name of the operation.
		 * @param {string} operOldDispName - The previous display name of the operation.
		 * @returns {number} - The index of the operation, or -1 if not found.
		 */
		findOperationIndex: function(entity, operDispName, operOldDispName){
			var operJsons = contentsJson[entity].operations ? contentsJson[entity].operations : [];
			return operJsons.findIndex((item ,i)=> i < operJsons.length && (item.disp_desc == operDispName || item.disp_desc == operOldDispName));
		}
};