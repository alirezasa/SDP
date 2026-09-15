/* $Id$ */

var SdpWidgets = (function() {
	'use strict'; //No I18N
	// var renderOnce =false;
	var pageEntityMap = {};
	/*Whenever a new location is introduced for the widget need to handle here too.
	 this is used to restrict function that will work only on some pages */
	var widgetLocations = {
		custom: {
			dashboard: 'dashboard', //No I18N
			webtab: 'webtab', //No I18N
			configuration: 'configuration', //No I18N
			popup: 'widget.popup' //No I18N
		},
		request: {
			custommenu: 'request.detail.menu', //No I18N
			detail_subtab: 'request.detail.subtab', //No I18N
			detail_rightpanel: 'request.detail.rightpanel', //No I18N
			form_rightpanel: 'request.form.rightpanel' //No I18N
		},
		change: {
			custommenu: 'change.detail.menu', //No I18N
			detail_subtab: 'change.detail.subtab', //No I18N
			stage_detail_subtab: 'change.stage.detail.subtab', //No I18N
			detail_rightpanel: 'change.detail.rightpanel' //No I18N
		},
		asset: {
			custommenu: 'asset.detail.menu', //No I18N
			detail_subtab: 'asset.detail.subtab', //No I18N
			detail_rightpanel: 'asset.detail.rightpanel' //No I18N
		}
	};
	var SdpWidgetConstants = {
		// popupDimension: {
		// 	height: {
		// 		default: 600,
		// 		max: 800
		// 	},
		// 	width: {
		// 		default: 1200,
		// 		max: 1200
		// 	}
		// },
		allowedDeleteUrlStartsWith: ['cm_'],
	};
	
	var defaultEvents= ["updateRequest","revokeConnection","authorizeConnection"]; //No I18N
	var SdpWidgetsLocationMeta=[];
	var CustomApps=[];
	
	var sdkFunctions = (function() {
		
		var functions;
		
		/*
		 * Util functions which has to be sent to widgets are defined here.
		 * name - Name of the function
		 * exescript - Script to execute on function call
		 */
		var clientFunctions = (function() {
			
			function getParentInfo(key) {
				var meta = SDP.appInfo.meta;
				if(meta.hasOwnProperty('parent') && meta.parent.hasOwnProperty(key)) {
					return meta.parent[key];
				}
				return null;
			}
			
			var functions = [{
				name: 'getCurrentInstance', //No I18N
				exescript: 'return SDP.appInfo.meta.instance' //No I18N
			}, {
				name: 'getCurrentUserId', //No I18N
				exescript: 'return SDP.appInfo.meta.userId' //No I18N
			}, {
				name: 'getCurrentUserType', //No I18N
				exescript: 'return SDP.appInfo.meta.userType' //No I18N
			}, {
				name: 'getCurrentUserName', //No I18N
				exescript: 'return SDP.appInfo.meta.userName' //No I18N
			}, {
				name: 'getCurrentUserEmail', //No I18N
				exescript: 'return SDP.appInfo.meta.userEmail' //No I18N
			}, {
				name: 'getWidgetInfo', //No I18N
				exescript: 'return SDP.appInfo.meta.widget' //No I18N
			}, {
				name: 'getWidgetMeta', //No I18N
				exescript: 'return SDP.appInfo.meta' //No I18N
			}, {
				name: 'getWidgetInvokedLocation', //No I18N
				exescript: 'return SDP.appInfo.location' //No I18N
			}, {
				name: 'getDataPassedByparent', //No I18N
				exescript: getParentInfo.toString() + '; return ' + getParentInfo.name + '("data")' //No I18N
			}, {
				name: 'getParentLocation', //No I18N
				exescript: getParentInfo.toString() + '; return ' + getParentInfo.name + '("location")' //No I18N
			}, {
				name: 'getParentWidgetInfo', //No I18N
				exescript: getParentInfo.toString() + '; return ' + getParentInfo.name + '("widget")' //No I18N
			}]
			
			return {
				getFunctions: function() {
					return functions;
				}
			};
		})();
		
		/*
		 * Event functions which has to be sent to widgets are defined here.
		 * Add an entry in SDP_EVENT variable, functions will be auto generated.
		 * Handling on event call is handled along with access and input validation.
		 * 
		 * api_name - string - Name of the function. It can be string or string array.
		 * 		If api_name is an array, multiple functions will be registered for same event.
		 * 
		 * param_type - {} | [] - If not specified user passed params won't be taken.
		 * 		{} - passed object will be directly passed to the parent from widgets
		 * 		[] - passed params will be parsed from arguments object and will be set inside data obj and passed to parent
		 * 
		 * fields - [] - Array with field details. If param_type is array, the fields given here will be taken as function params in same orger.
		 * 		Do not modify any param orders. It will affect client sdk.
		 * 		field properties:
		 * 			name - string - Name of the field.
		 * 			mandatory - true | false - Specifies if the field is mandatory.
		 * 			nullable - true | false - Specifies if the field can be null or undefined.
		 * 			type - string (string|boolean|number|array|object) - Type of the field. Validation will be done based on type.
		 * 
		 * handleEvent - function - Function to be called after validation is passed for each JS APIs.
		 */
		var eventFunctions = (function() {
			var EntityOperations={
			    "GET": "GET",//No i18n
			    "PUT": "PUT",//No i18n
			    "POST": "POST",//No i18n
			    "DELETE": "DELETE"//No i18n
			};
			var temp_storage = {};

			var SDP_EVENT = {

				/*
				 * For V3 API get call.
				 */
				GET_DATA: {
					api_name: 'get', //No I18N
					param_type: {},
					fields: [{
						name: 'url', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						data.operation = EntityOperations.GET;

						var options = {
							api_options: data,
							promise: promise
						};

						utils.handleApiCalls(options);
					}
				},

				/*
				 * For V3 API post call.
				 */
				ADD_DATA: {
					api_name: 'add', //No I18N
					param_type: {},
					fields: [{
						name: 'url', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						data.operation = EntityOperations.POST;

						var options = {
							api_options: data,
							promise: promise
						};

						utils.handleApiCalls(options);
					}
				},

				/*
				 * For V3 API put call.
				 */
				SET_DATA: {
					api_name: 'edit', //No I18N
					param_type: {},
					fields: [{
						name: 'url', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						data.operation = EntityOperations.PUT;

						var options = {
							api_options: data,
							promise: promise
						};

						utils.handleApiCalls(options);
					}
				},

				/*
				 * For V3 API delete call.
				 */
				DEL_DATA: {
					api_name: 'del', //No I18N
					param_type: {},
					fields: [{
						name: 'url', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					},
					{
						name:'ids',//No I18N
						mandatory:true,
						type:'string'//No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						var url = data.url;

						if(url.startsWith('/')) {
							url = url.substring(1);
						}

						if(url.startsWith('api/v3/')) {
							url = url.substring(7);
						}

						var startsWith = url.substring(0, 3);

						if(!SdpWidgetConstants.allowedDeleteUrlStartsWith.includes(startsWith)) {
							promise.reject({
								message: 'Delete operation not supported for this url' //No I18N
							});

							return;
						}

						data.operation = EntityOperations.DELETE; 
						data.url=data.url+"?ids="+data.ids; //No I18N
						delete data.ids;
						var options = {
							api_options: data,
							promise: promise
						};

						utils.handleApiCalls(options);
					}
				},
				/*
				 * Gets all the connections created for the custom widget
				 */
				CONNECT: {
					param_type: {},
					fields: [{
						name: 'url', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}, {
						name: 'method', //No I18N
						type: 'string', //No I18N
						matches: ['get', 'put', 'post', 'delete', 'patch'] //No I18N
					}, {
						name: 'params', //No I18N
						type: 'object' //No I18N
					}, {
						name: 'headers', //No I18N
						type: 'object' //No I18N
					}, {
						name: 'data', //No I18N
						type: 'string' //No I18N
					}],
					api_name: 'connect', //No I18N
					handleEvent: function(eventObj, promise, data) {
						var meta= getWidgetMeta(eventObj);
						data.for=meta.location
						var api_options = {
							url: '/custom_app/'+meta.widget.id+ '/_ajax', //No I18N
							operation: EntityOperations.POST,
							input_data:data,
							success_callback:function(response){
								promise.resolve(response.ajax.values.result);
							},
							error:function(resp){
								promise.reject(resp);
							},
						};
						var options = {
							api_options: api_options,
							promise: promise,
						};
						utils.handleApiCalls(options);
					}
				},
				/*AUTHORIZE: {
					param_type: {},
					fields: [{
						name: 'link_name', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					api_name: 'authorize', //No I18N
					handleEvent: function(eventObj, promise, data) {
						var customWidgetData = getWidgetMeta(eventObj);
						var connection_data= customWidgetData.widget.connections.filter((data)=>{return data.link_name==eventObj.data.link_name});
						if(connection_data.length==0 || connection_data[0].is_authorized==true){
							promise.resolve("Not Authorized connection for this widget");//No i18n
						}else{
							var childWindow = window.open(connection_data[0].auth_url);
							 //when user closed the auth window

							let intervalTimer=setInterval(function(){
								if(childWindow.closed){
									clearInterval(intervalTimer);
									if(!customWidgetData.widget.connections[0].is_authorized){
										SdpWidgets.eventHandle.authorizeConnection(customWidgetData.widget.id,"falied");//No I18N
									}
								}
							},1000);
							window.addEventListener(
								"message", // No I18N
								(event) => {
								  if (event.origin == window.location.origin && event.source.location.href.indexOf("integration") !=-1){
									if(typeof event.data =="string"){
									  let response = JSON.parse(event.data);
									  childWindow.close();
									  if (response.status === 'success') { // No I18N
										SdpWidgets.eventHandle.authorizeConnection(customWidgetData.widget.id,"success");//No I18N
										customWidgetData.widget.connections[0].is_authorized=true;
										}
									}
								  }
								},{ once: true });
							}
							promise.resolve("success");//No i18n
					}
				},*/
				SHOW_ALERT:{ 
					api_name:"show_alert", //No I18N
					param_type: {},
					fields: [{
						name: 'message', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					},
					{
						name: 'autohide', //No I18N
						type: 'boolean', //No I18N
					},
					{	
						name:'alert_type', //No I18N
						type:'string', //No I18N
						matches:['success','failure'],  //No I18N
						mandatory: true
					}],
					handleEvent:function(eventObj, promise, data){
						let hide= data.autohide || false;
						showalert(data.alert_type, e_html(data.message), "isAutoHide="+hide); // No I18N
						promise.resolve('displayed alert');  //No I18N

					}
				},
				SHOW_CONFIRM_DIALOG:{
					api_name: 'show_confirm', //No I18N
					param_type: {},
					fields: [{
						name: 'message', //No I18N
						type: 'string', //No I18N
					},
				{
					name:'buttons',  //No I18N
					type:'array',  //No I18N
					mandatory:true
				},
				{
					name:'input_fields',  //No I18N
					type:'array'  //No I18N
				}
			],
					handleEvent: function(eventObj, promise, data) {
						let message=`<div class="form"><div class="form-wrapper" ><div class="form-group"><div class="ml10"><h3 class="sb mb15 mt0">${e_html(data.message)}</h3> </div></div>` //No I18N
						
						if(data.input_fields){
							data.input_fields.forEach((input_field)=>{
								message+=`<div class="form-group"><label class="control-label">${e_html(input_field.label)}</label><input name=${e_html(input_field.name)} class="form-control  cw-input" type="text"></div>`  //No I18N
							})
							 

						}
						message+=`</div>`;
						
						   let fotter=` <div class="form-footer">`
						data.buttons.forEach(button=>{
							fotter+=` <button type="button" class="btn btn-primary " data-cw-btn  value=${e_html(button.value)}>${e_html(button.label)}</button>`  //No I18N
						})
						fotter+=`</div>`;
					
						   showDialog(message+fotter,'width=450px,modal=yes,closeOnEscKey =yes,closeButton=yes,position=absmiddle,draggable=false')  //No I18N
						jQuery("[data-cw-btn]").click(function(){
							let inputs=[]
							jQuery(".cw-input").each(function(i,o){
								inputs.push(o.value);
							})
							promise.resolve({
								message: jQuery(this).val(),
								input_field: inputs
							});
							closeDialog();
						})
						   
					}
				},
				/*
				 * Fetches all the stored values as a JSON object.
				 */
				GET_TEMP_VARIABLES: {
					api_name: 'getTempVariables', //No I18N
					handleEvent: function(eventObj, promise, data) {
						var customWidgetId = getCustomWidgetId(eventObj);

						promise.resolve(getTempVariables(customWidgetId));
					}
				},

				/*
				 * Fetches the value from the stored JSON object.
				 */
				GET_TEMP_VARIABLE: {
					api_name: 'getTempVariable', //No I18N
					param_type: [],
					fields: [{
						name: 'key', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						var customWidgetId = getCustomWidgetId(eventObj);

						promise.resolve({
							key: data.key,
							value: getTempVariable(customWidgetId, data.key)
						});

						return;
					}
				},

				/*
				 * Stores the value in a JSON object in the SDP window.
				 */
				SET_TEMP_VARIABLE: {
					api_name: 'setTempVariable', //No I18N
					param_type: [],
					fields: [{
						name: 'key', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}, {
						name: 'value', //No I18N
						mandatory: true,
						nullable: true
					}],
					handleEvent: function(eventObj, promise, data) {
						var customWidgetId = getCustomWidgetId(eventObj);

						storeTempVariable(customWidgetId, data);

						promise.resolve({
							message: 'Variable saved in application window successfully' //No I18N
						});
					}
				},
				/*
				 * Refreshes the current parent view of the widget.
				 */
				REFRESH_PAGE: {
					api_name: 'refreshPage', //No I18N
					handleEvent: function(eventObj, promise, data) {
						promise.resolve({
							message: 'Refresh page action initiated' //No I18N
						});
						var customWidgetData = getWidgetMeta(eventObj);
						SdpWidgets.renderHelpers.renderWidget(customWidgetData.widget.id,customWidgetData.location,SdpWidgetsLocationMeta[customWidgetData.location].data);						
					}
				},

				/*
				 * Displays the message as an indicator.
				 */
				SHOW_INDICATOR: {
					api_name: 'showIndicator', //No I18N
					param_type: {},
					fields: [{
						name: 'category', //No I18N
						mandatory: true,
						type: 'string', //No I18N
						matches: ['loading'] //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						var options = {};
						if(data.category == 'loading') {
							jQuery(".page-progressbar").show()
							promise.resolve('showing loading'); //No I18N
						}

						//sdpShowIndicator(options);

						promise.resolve({
							message: 'Indicator displayed' //No I18N
						});
					}
				},

				/*
				 * Hides the indicator.
				 */
				HIDE_INDICATOR: {
					api_name: 'hideIndicator', //No I18N
					param_type: {},
					fields: [{
						name:'category', //No I18N
						type: 'string', //No I18N
						nullable: true,
						matches: ['loading'] //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						if(data.category == 'loading') {
							jQuery(".page-progressbar").hide()
						}
						promise.resolve({
							message: 'Indicator hidden' //No I18N
						});
					}
				},
				

				/*
				 * Shows the widget from the view.
				 */
				/*
				SHOW_WIDGET: {
					custom_widget_api: true,
					allowed_locations: [widgetLocations.request.form_rightpanel],
					api_name: 'showWidget', //No I18N
					handleEvent: function(eventObj, promise, data) {
						var wdgInfo = getWidgetInfo(eventObj);

						sdp.module.request.form.obj.getWrapper().find('#wdg_rhs_' + wdgInfo.widgetmeta.widget.id).removeClass('hide');

						promise.resolve({
							message: 'The requested action performed successfully.' //No I18N
						});
					}
				},

				/*
				 * Hides the widget from the view.
				 */
				/*
				HIDE_WIDGET: {
					custom_widget_api: true,
					allowed_locations: [widgetLocations.request.form_rightpanel],
					api_name: 'hideWidget', //No I18N
					handleEvent: function(eventObj, promise, data) {
						var wdgInfo = getWidgetInfo(eventObj);

						sdp.module.request.form.obj.getWrapper().find('#wdg_rhs_' + wdgInfo.widgetmeta.widget.id).addClass('hide');

						promise.resolve({
							message: 'The requested action performed successfully.' //No I18N
						});
					}
				}, 


				/*
				 * Get a value of a field from the form
				 */
				GET_FORM_FIELD_VALUE: {
					custom_widget_api: true,
					api_name: 'getValueFromForm', //No I18N
					param_type: [],
					fields: [{
						name: 'field', //No I18N
						mandatory: true,
						type: 'string' //No I18N
					}],
					handleEvent: function(eventObj, promise, data) {
						promise.resolve({
							value: $CS.getValue(data.field)
						})
					}
				},

				/*
				 * Set a value of a field in the form.
				 */
				// SET_FORM_FIELD_VALUE: {
				// 	custom_widget_api: true,
				// 	allowed_locations: [widgetLocations.request.form_rightpanel],
				// 	api_name: 'setValueInForm', //No I18N
				// 	param_type: [],
				// 	fields: [{
				// 		name: 'field', //No I18N
				// 		mandatory: true,
				// 		type: 'string' //No I18N
				// 	}, {
				// 		name: 'value', //No I18N
				// 		nullable: true,
				// 		type: 'string' //No I18N
				// 	}],
				// 	handleEvent: function(eventObj, promise, data) {
				// 		sdp.module.request.entity_bean.setDataForField(data.field, data.value, SdpRequest.CONTEXT);

				// 		promise.resolve({
				// 			message: 'The requested action performed successfully' //No I18N
				// 		});
				// 	}
				// },
				LOADINGAJAXBAR:{
					api_name: 'ajaxBar', //No I18N
					param_type: [],					
					fields:[],
					handleEvent: function(eventObj, promise, data) {
						promise.resolve({
							html:ajaxBar()
					});
					}
				}
			};

			/*
			function openWidgetHandler(promise, response, data) {
				if(response.list_info.row_count > 0) {
					var wdg = window.isRequester ? response.portal_widgets[0] : response.widgets[0];

					var options = {
						widgetData: wdg,
						location: 'widget.popup', //No I18N
						validate: false,
						metaData: {
							parent: {
								data: data.data,
								location: data.wdgInstance.location,
								widget: data.wdgMeta.widget
							}
						}
					};

					var keys = ['module', 'module_entity_id', 'stage_id']; //No I18N
					jQuery.each(keys, function(index, key) {
						var value = data.wdgMeta[key];

						if(value) {
							options.metaData[key] = value;
						}
					});

					var title = data.title || wdg.name;

					renderHelpers.renderPopupWidget(options, title);

					promise.resolve({
						message: 'Widget opened successfully' //No I18N
					});

					return;
				}

				promise.reject({
					message: 'Please provide a valid widget id or name with required visibility permissions to render' //No I18N
				});
			}
			*/

			function getWidgetInstance(eventObj) {
				var wdgInstanceId = eventObj.iframe.id;
				return ZApp.GetWidgetInstance(wdgInstanceId);
			}

			function getWidgetInfo(eventObj) {
				var wdgInstance = getWidgetInstance(eventObj);
				return wdgInstance.__WIDGET__;
			}

			function getWidgetMeta(eventObj) {
				var widget = getWidgetInfo(eventObj);
				return widget.widgetmeta;
			}

			function getCustomWidgetId(eventObj) {
				var wdgMeta = getWidgetMeta(eventObj);
				return wdgMeta.widget.custom_widget.id;
			}
			/*
			function getIntegrationId(eventObj) {
				var wdgMeta = getWidgetMeta(eventObj);
				return wdgMeta.widget.connections.flow_configuration.id;
			}

			function getWidgetId(eventObj) {
				var wdgMeta = getWidgetMeta(eventObj);
				return wdgMeta.widget.id;
			}

			function storeVariables(customWidgetId, variables) {
				if(!temp_storage.hasOwnProperty(customWidgetId)) {
					temp_storage[customWidgetId] = {};
				}

				if(!temp_storage[customWidgetId].hasOwnProperty('variables_map')) {
					temp_storage[customWidgetId].variables_map = {};
				}

				jQuery.each(variables, function(index, variable) {
					temp_storage[customWidgetId].variables_map[variable.key] = variable.id;
				});
			}

			function getVariableId(customWidgetId, key) {
				if(temp_storage.hasOwnProperty(customWidgetId)) {
					if(temp_storage[customWidgetId].hasOwnProperty('variables_map')) {
						return temp_storage[customWidgetId].variables_map[key];
					}
				}

				return null;
			}
				*/
			function storeTempVariable(customWidgetId, data) {
				if(!temp_storage.hasOwnProperty(customWidgetId)) {
					temp_storage[customWidgetId] = {};
				}

				if(!temp_storage[customWidgetId].hasOwnProperty('temp_variables')) {
					temp_storage[customWidgetId].temp_variables = {};
				}

				temp_storage[customWidgetId].temp_variables[data.key] = data.value;
			}

			function getTempVariables(customWidgetId) {
				if(temp_storage.hasOwnProperty(customWidgetId)) {
					if(temp_storage[customWidgetId].hasOwnProperty('temp_variables')) {
						return temp_storage[customWidgetId].temp_variables;
					}
				}

				return {};
			}

			function getTempVariable(customWidgetId, key) {
				if(temp_storage.hasOwnProperty(customWidgetId)) {
					if(temp_storage[customWidgetId].hasOwnProperty('temp_variables')) {
						return temp_storage[customWidgetId].temp_variables[key];
					}
				}

				return null;
			}

			function validateInput(eventDetails, promise, data) {
				if(eventDetails.hasOwnProperty('fields')) {
					var fields = eventDetails.fields;

					for(var i = 0; i < fields.length; i++) {
						var field = fields[i];

						var field_name = field.name;
						var field_type = field.type;

						var value = data[field_name];

						if(field.mandatory && !data.hasOwnProperty(field_name)) {
							promise.reject({
								message: field_name + ' is not passed from the widget' //No I18N
							});

							return false;
						}

						var check_type = true;

						if((value == undefined || value == null) && data.hasOwnProperty(field_name)) {
							if(field.nullable) {
								check_type = false;
							}
							else {
								promise.reject({
									message: field_name + ' cannot be null' //No I18N
								});

								return false;
							}
						}

						if(check_type && field.type && data.hasOwnProperty(field_name)) {
							if(field_type == 'id') {
								if(typeof value != 'string' || (!field.nullable && value == '')) {
									promise.reject({
										message: field_name + ' is not a valid identifier' //No I18N
									});

									return false;
								}
								else {
									var is_valid = true;

									try {
										var temp = parseInt(value);

										if(isNaN(temp) || temp < 0) {
											is_valid = false;
										}
									}
									catch(err) {
										is_valid = false;
									}

									if(!is_valid) {
										promise.reject({
											message: field_name + ' is not a valid identifier' //No I18N
										});

										return false;
									}
								}
							}
							else if(field_type == 'string') {
								if(typeof value != 'string' || (!field.nullable && value == '')) {
									promise.reject({
										message: field_name + ' is not a valid string' //No I18N
									});

									return false;
								}

								if(field.matches) {
									if(!field.matches.includes(value)) {
										promise.reject({
											message: field_name + ' is not valid' //No I18N
										});

										return false;
									}
								}
							}
							else if(field_type == 'number') {
								var is_valid = true;

								if(typeof value != 'number') {
									if(typeof value != 'string') {
										is_valid = false;
									}

									if(is_valid) {
										try {
											var temp = parseInt(value);

											if(isNaN(temp) || temp < 0) {
												is_valid = false;
											}
										}
										catch(err) {
											is_valid = false;
										}
									}
								}
								else if(value < 0) {
									is_valid = false;
								}

								if(!is_valid) {
									promise.reject({
										message: field_name + ' is not a valid number' //No I18N
									});

									return false;
								}
							}
							else if(field_type == 'boolean') {
								if(value != true && value != false && value != 'true' && value != 'false') {
									promise.reject({
										message: field_name + ' is not a valid boolean' //No I18N
									});

									return false;
								}
							}
							else if(field_type == 'array') {
								if(!(value instanceof Array)) {
									promise.reject({
										message: field_name + ' is not a valid array' //No I18N
									});

									return false;
								}
							}
							else if(field_type == 'object') {
								var is_valid = false;

								if(!(value instanceof Array) && value instanceof Object) {
									try {
										JSON.parse(JSON.stringify(value));
										is_valid = true;
									}
									catch(err) {
										is_valid = false;
									}
								}

								if(!is_valid) {
									promise.reject({
										message: field_name + ' is not a valid object' //No I18N
									});

									return false;
								}
							}
						}
					}
				}

				return true;
			}

			function validateAccess(eventObj, promise, data, obj) {
				if(obj.hasOwnProperty('allowed_locations')) {
					var wdgInfo = getWidgetInfo(eventObj);

					if(!obj.allowed_locations.includes(wdgInfo.location)) {
						promise.reject({
							message: 'This requested action is not supported in this view' //No I18N
						});

						return false;
					}
				}

				return true;
			}

			return {

				getFunctions: function() {
					var functions = [];

					jQuery.each(SDP_EVENT, function(key, value) {
						var api_name = value.api_name;
						var param_type = value.param_type;

						var event = key;
						var params;

						if(param_type) {
							if(param_type instanceof Array) {
								var fields = value.fields;

								params = [];

								jQuery.each(fields, function(index, field) {
									params.push(field.name);
								});
							}
							else {
								params = {};
							}
						}
						if(api_name instanceof Array) {
							jQuery.each(api_name, function(index, api) {
								var api_details = {};

								api_details.name = api;
								api_details.event = event;

								if(params) {
									api_details.params = params;
								}

								functions.push(api_details);
							});
						}
						else {
							var api_details = {};

							api_details.name = api_name;
							api_details.event = event;

							if(params) {
								api_details.params = params;
							}

							functions.push(api_details);
						}
					});

					return functions;
				},

				/**
				 * SDP_EVENT triggered from widget SDK will land at this function
				 * @param eventObj {*} contains the event data passed from the SDK
				 */
				handleEvent: function(eventObj) {
					var promise = eventObj.promise;
					var data = eventObj.data;

					var data_type = data.type;

					if(SDP_EVENT.hasOwnProperty(data_type)) {
						var obj = SDP_EVENT[data_type];

						var proceed = validateAccess(eventObj, promise, data, obj);

						proceed = proceed && validateInput(obj, promise, data);

						if(proceed) {
							obj.handleEvent(eventObj, promise, data);
						}
					}
					else {
						promise.reject({
							message: 'Invalid Message data type passed to the MessageHandler from the widget' //No I18N
						});
					}
				}
			};
		})();

		return {

			/*
			 * Returns the available helper functions which has to be sent to widget.
			 */
			getFunctions: function() {
				if(!functions) {
					functions = clientFunctions.getFunctions().concat(eventFunctions.getFunctions());
				}

				return functions;
			},

			eventFunctions: eventFunctions
		}
	})();

	var sdkEvents = (function() {

		/*
		 * Broadcasting an event to a particular zappid widgets
		 */
		function sendEventToWidget(appId, eventName, data) {
			Object.entries(ZApp.GetAllWidgetInstance()).forEach(([key, widgetInstance]) => {
				if(widgetInstance && widgetInstance.isActive() && (widgetInstance.getZAppID() == appId || widgetInstance.getZAppID() + '-' + getCurrentAppAccount() == appId)) {
					widgetInstance.SendEvent(eventName, data, false);
				}
			});
		}

		return {
			/*
			 * Authorize Connection event. Events sent to widgets of same appid.
			 */
			authorizeConnection: function(appId, data) {
				sendEventToWidget(appId, 'AuthorizeConnection', data);//No i18n
			},
			triggerEvent: function( evnt ,data) {
				if(defaultEvents.contains(evnt)) {return ;}
				ZApp.BroadcastEvent(evnt, data,false);
			},
			updateRequest:(msg)=>{
				ZApp.BroadcastEvent("UpdateRequest",msg,false); //No i18n
			},
			/*
			 * Revoke Connection event. Events sent to widgets of same appid.
			 */
			revokeConnection: function(appId, data) {
				sendEventToWidget(appId, 'revokeConnection', data);//No i18n
			}
		};
	})();

	var renderHandlers = (function() {
		return {

			/**
			 * Render Handlers are called when the widget has to be invoked in the application
			 * @param location - location of the widget
			 * @param appConfig - contains the configuration of the widget
			 */
			widgetHandler: function(location, appConfig) {
				var config = appConfig instanceof ZWidgetRuntime ? appConfig.getConfig() : appConfig.config;

				var widgetView = config.widget_view_div;
				var appURL = appConfig._resolvedURL || appConfig.url;

				var iframeElement;
				var iframeParent;

				if(widgetView) {
					if(typeof widgetView == 'string') {
						iframeParent = document.getElementById(widgetView);
					}
					else if(widgetView instanceof Element) {
						iframeParent = widgetView;
					}
					else if(widgetView instanceof jQuery) {
						iframeParent = widgetView[0];
					}
				}

				/*
				 * Iframe length by 0, inside that div because, there would be only one widget possible inside that iframe. Preventing duplicates of Iframe inside
				 */
				if(iframeParent instanceof HTMLDivElement && iframeParent.getElementsByTagName('iframe').length == 0) {
					iframeElement = document.createElement('iframe');
					let finalHeigth="800px"; //No I18N
					iframeElement.setAttribute('class', 'iframe-url widget-iframe');
                    iframeElement.style.width="100%";
					let loc=location.split('.');
					if(loc[loc.length-1]==="rightpanel"){
						const fullheight=jQuery(window).height()-iframeParent.offsetTop
						jQuery(iframeParent).css('min-height', `${fullheight}px`); //No I18N
						iframeElement.style.minHeight=`${fullheight}px`
						config.widget_view_div.addClass("fh");
						finalHeigth="100%";
					}
					else if(loc[loc.length-1]==="dashboard"){
						finalHeigth="100%";
					}
					iframeElement.style.height=finalHeigth;
					/*
					 * Issue: Some URLs will redirect the parent window
					 * Fix: Sandbox attribute added. Values allowed (explicitly): forms, scripts,
					 * same origin, popups Values restricted (implicitly): orientation locks, pointer locks, presentations, top navigations
					 *
					 * Issue: By default "sandbox" forces the “different origin” policy for the iframe (forcing it into a unique origin)
					 * Fix: allow-same-origin is added (iframe content is treated as being from its real origin)
					 *
					 * Warning: Setting both allow-scripts and allow-same-origin & having the parent and the iframe URL origin same, allows the
					 * embedded page to simply remove the sandbox attribute and then reload itself, effectively breaking out of the sandbox altogether.
					 */
					iframeElement.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-popups');

					iframeElement.addEventListener('load', function() {
						//sdpHideIndicator();
						if(config.onload){
							call_fn(config.onload);
						}
					}, false);

					if (location === "dashboard.tab.widget") {
						iframeElement.style.height="100%";
					}

					iframeElement.setAttribute('src', appURL);
					iframeElement.setAttribute('frameBorder', '0');

					iframeParent.appendChild(iframeElement);
				}

				return iframeElement;
			}
		};
	})();

	var utils = (function() {
		function showWidget(name,loc){
			jQuery(`[data-wdg-name="${name}"][data-category="${loc}"][data-type="custom_widget"]`).removeClass("hide");
		}

		function openWidget(name,loc){
			jQuery(`[data-wdg-name="${name}"][data-category="${loc}"][data-type="custom_widget"]`).click();
		}
		function hideWidget(name,loc){
			jQuery(`[data-wdg-name="${name}"][data-category="${loc}"][data-type="custom_widget"]`).addClass('hide')
		}
		/*
		 * Get entity from current page.
		 */
		function getCurrentEntity() {
			var page = $spa.getCurrentURLId();
			return pageEntityMap[page];
		}

		/*
		 * Returns the location key for the passed entity accessibility combination.
		 */
		function getLocation(entity, accessibility) {
			if(asset_entities_list.includes(entity)) {
				entity = 'asset'; //No I18N
			}

			return widgetLocations[entity][accessibility];
		}
		/*
		 * Returns the stages list for the corresponding entity.
		 */
		function getStages(entity, callback) {
			if(!entity) {
				entity = getCurrentEntity();
			}

			if(entity == 'change') {
				sdp.module.change.utils.get_all_stages(function(stages) {
					call_fn(callback, stages);
				});
			}
		}

		/*
		 * Returns the corresponding detailsPage object for the entity.
		 */
		function getDetailsPageObj(entity) {
			if(!entity) {
				entity = getCurrentEntity();
			}

			if(entity == 'request') {
				return $req.details.request_info;
			}
			else if(entity == 'change') {
				return sdp.module.change.detailsPage.obj;
			}
			else if(asset_entities_list.includes(entity)) {
				return sdp.module.asset[entity].detailsPage.obj;
			}
		}

		/*
		 * Returns the corresponding tab url for request/change/asset modules.
		 */
		function getEntityURL(entity, selectTab) {
			var url = SdpRouter.getCurrentURL();

			if(entity == 'request') {
				if(!selectTab) {
					selectTab = sspConfig.requestDetailsDefaultTab;
				}

				url = sdp.module.request.detailsPage.getUrl(sdp.module.request.entity_bean.getId(), selectTab);
			}
			else if(entity == 'change') {
				url = sdp.module.change.detailsPage.getUrl(sdp.module.change.entity_bean.getId(), selectTab);
			}
			else if(asset_entities_list.includes(entity)) {
				selectTab = selectTab ? '?selectTab=' + selectTab : ''; //No I18N

				url = sdp_client_url + getUrl(sdp.module.asset[entity].entity_bean) + '/details' + selectTab; //No I18N
			}

			return convertToPortalUrl(url);
		}


		/**
		 * Makes the api calls to the server and returns the appropriate response
		 * @param options - Object, which contains the following keys
		 * 		@key api_options - contains url, input_data, portal_id, ids for making the V3 api calls
		 * 		@key promise - to be resolved or rejected on api calls
		 * 		@key timeout - api timeout in seconds.
		 * 		@key entityName - resolving the entity response alone, excluding the response_status
		 * 		@key success_callback - callback function that would be invoked, on api call success
		 */
		function handleApiCalls(options) {
			var promise = options.promise;
			var api_options = options.api_options;
			var entityName = options.entityName;

			var responded = false;

			var queryOptions = {
				type:options.api_options.operation,
				url: "/api/v3"+api_options.url,//No i18n
				data: sdpAjaxInputData(api_options.input_data),
				success: function(response, isSuccess) {
					if(responded) {
						return;
					}

					responded = true;

					if(isSuccess) {
						if(options.api_options.success_callback) {
							options.api_options.success_callback(response);
							return;
						}

						if(response.hasOwnProperty(entityName)) {
							response = response[entityName];
						}

						try {
							response = JSON.parse(response);
						}
						catch(e) {}

						promise.resolve(response);
					}
					else {
						try {
							response = JSON.parse(response);
						}
						catch(e) {}

						promise.reject(response);
					}
				},
				error:(resp)=>{
					if(options.api_options.error){
						options.api_options.error(resp.responseJSON);
						return;
					}
					else{
						promise.reject(resp.responseJSON);
					}
				},
				ignorefailuremessage:true
			}

			if(api_options.hasOwnProperty('ids')) {
				queryOptions.ids = api_options.ids;
			}

			var appid = api_options.portalid;

			if(!isNaN(appid) && appid != '') {
				queryOptions.headers = {
					'x-sdpod-appid': appid, //No I18N
					skip_app_id: false
				};
			}

			if(options.timeout) {
				setTimeout(function() {
					if(!responded) {
						responded = true;

						promise.reject({
							message: 'API call took too long to respond' //No I18N
						});
					}
				}, options.timeout * 1000);
			}

			//jQuery.sdpapi[api_options.operation](queryOptions);
			sdpAjax(queryOptions);
		}

		return {
			getCurrentEntity: getCurrentEntity,
			getLocation: getLocation,
			getStages: getStages,
			getDetailsPageObj: getDetailsPageObj,
			getEntityURL: getEntityURL,
			handleApiCalls: handleApiCalls,
			openWidget:openWidget,
			hideWidget:hideWidget,
			showWidget:showWidget
		};
	})();

	/*
	 * Defines helper function to render widget in the page.
	 */
	var renderHelpers = (function() {
		/*
		var webtabs = [];
		var subtabs = [];
		var rhstabs = [];
		var stagetabs = [];

		var webtabsLoaded = false;
		var subtabsFetched = false;
		var rhstabsFetched = false;

		var webtabCallback;
		var subtabCallback;

		var $subtab_holder;
		var $rhstab_holder;
		*/
		var tab_count=5;

		/*
		 * options : {
		 * 		widgetData - Widget json data that is used to render the necessary widget
		 * 		widgetView - Holder element or its id in which the iframe should be loaded
		 * 		location - Location of the widget where it gets displayed like request_custommenu_widget, dashboard_widget
		 * 		metaData : {	//additional data based on the place where it invoked
		 * 					module - In which module, the widget is invoked like request, dashboard, etc
		 * 					module_entity_id - Like Request Id, DashboardId, etc
		 * 					stage_id - Change stage subtab have stages like submission, UAT, etc. This would be used for all other modules which has similar use case
		 * 				}
		 * 		onload - callBack function once the widget loads
		 * }
		 */
		function init(options) {
			function loadWidget() {
				var metaData = options.metaData;
				var widgetData = options.widgetData;


				//var instanceDetails = appAccount.currentAppAccount;
				metaData.instance = {
					appid: PORTALID,
					//appname: instanceDetails.appname,
					//appdisplayname: instanceDetails.appdisplayname
				};
				/*
				var globalSetting = getGlobalSetting();
				metaData.personalization = {
					time_zone: globalSetting.time_zone,
					time_format: globalSetting.time_format,
					date_format: globalSetting.date_format
				};
				*/
				metaData.userLanguage = sdp_user.LOCALE;
				metaData.userLocale = sdp_user.LOCALE;
				metaData.userType = sdp_user.USERTYPE;

				metaData.userId = $CS.getLoggedInUserId();
				metaData.userName = $CS.getLoggedInUserName();
				metaData.userEmail = $CS.getLoggedInUserEmailId();
				metaData.isSDAdmin = $CS.hasRole("SDAdmin");//No i18n
				metaData.widget = {
					id: widgetData.id,
					name: widgetData.name,
					description: widgetData.description,
					custom_widget: {
						id: widgetData.custom_widget.id
					},
					connections:widgetData.custom_widget.connections,
					custom_module:widgetData.custom_widget.modules

				};
				metaData.functions = sdkFunctions.getFunctions();

				var zappid = '-1';
				var url;

				var app_type = widgetData.custom_widget.type
				if(app_type == 'url') {
					url = widgetData.widget_url;
				}
				else {
					var property_json = widgetData.custom_widget.property_json;
					if(typeof property_json == 'string') {
						property_json = JSON.parse(property_json);
					}

					/*var zapp_properties = property_json.zapp_properties;
					zappid = zapp_properties.zappid;*/
					var view_path_url = widgetData.url;
					var protocolRegex = new RegExp('^(http|https)://', 'i');
					var match = protocolRegex.test(view_path_url);

					if(match) {
						url = view_path_url;
					}
					else {
						url = getFullUrl(view_path_url, widgetData.custom_widget);
					}
				}

				var widgetConfig = {
					url: url,
					location: options.location,
					zappid: metaData.widget.id,
					ondemand: false,
					widgetmeta: metaData,
					config: {
						widget_view_div: options.widgetView,
						onload: options.onload,
						app_type: app_type,
						dimension: options.dimension
					}
				}

				initiateWidget(widgetConfig);
					let iframeSelectorn=widgetConfig.config.widget_view_div.find('iframe');
					iframeSelectorn.on("load", function () {
						var iframeSelector1 = jQuery(this);
						/**
						 * Check if 'editor-dark.css' stylesheet is not already included in the iframe's head
						 */
						if(!(iframeSelector1.contents().find("head link[href*='/style/editor-dark.css']").length) > 0){
						  iframeSelector1.contents().find("head").append('<link type="text/css" rel="stylesheet" href="/style/editor-dark.css?'+sdp_app.BUILD_NUMBER+'">');
						}
						/**
						 * Apply dark mode theme to the iframe's body if user preferences indicate dark mode
						 */
						if(isDark()){
						  iframeSelector1.contents().find("body").attr('theme','dark-mode');
						}else{
						  iframeSelector1.contents().find("body").removeAttr('theme'); // NO I18N
						}
					});
			}

			//sdpShowIndicator();

			if(options.validate != undefined && !options.validate) {
				loadWidget();
			}
			else {
				var inputData = {
					location_name: options.location
				};

				if(options.metaData.stage_id) {
					inputData.stage_id = options.metaData.stage_id;
				}
				options.widgetData.custom_widget=getCustomWidgetData(options.widgetData,options.location);
				options.widgetData.custom_widget && loadWidget();
			}
		}
		function getCustomWidgetData(app,location){
			var result;
			sdpAjax({
					url: '/api/v3/custom_app/'+app.id+'/custom_widget/' + app.custom_widget.id, //No I18N
					data:sdpAjaxInputData({for:location}),
					async:false,
					//data: sdpAjaxInputData(inputData),
					success: function(data) {
							result=data.custom_widget;
			
					}
				});
			return result;
		}

		/*
		 * Initiated the loadWidget handler in ZApps.
		 */
		function initiateWidget(widgetConfig) {
			var instance;

			try {
				instance = ZApp.LoadWidget(widgetConfig);
			}
			catch(e) {}

			//For IE, ES6 is not supported which Zapps use, So invoking the renderHandler manually
			if(!(instance instanceof ZWidgetRuntime)) {
				renderHandlers.widgetHandler(widgetConfig.location, widgetConfig);
			}
		}

		/*
		 * Constructing full url for widget and its icon.
		 */
		function getFullUrl(view_path_url, widget) {
			var url = sdp_app.CLIENT_CONF.hostedDomain+`/custom/custom_widget/${widget.id}/`+widget.unique_key;
			url += view_path_url.startsWith('/') ? view_path_url : '/' + view_path_url;
			return url;
		}

		

		/*
		 * This will return 2 letters from the widget name.
		 */
		function getWidgetIconLetters(widget_name) {
			var icon_letters = widget_name.split(/\s/).map(function(item) {
				return item[0];
			}).join('').substring(0, 2);

			if(icon_letters.length < 2) {
				icon_letters = widget_name.substring(0, 2);
			}

			return icon_letters.toUpperCase();
		}
		/*
		 * Resets subtab and rhstab widgets
		function resetDetailsPageWidgets() {
			subtabsFetched = false;
			rhstabsFetched = false;
		}
		 */
		function renderModuleWidgets(options){
			if(!sdp_app.IS_CUSTOM_MODULE_ENABLED){return;}
			if(options.loadTabs!=false){
			SdpWidgets.renderHelpers.renderWidgetHeader({
	            location : options.module+".detail.tab",//No i18n
	            type:"tab",//No i18n
	            element:"#" + (options.stage ? (options.stage + '-') : '') + "tabs-panel" + (options.moduleAlias ? ('-'+options.moduleAlias) : '') + "_holder",
	            append:true,
	            refreshPanel:options.refreshPanel,
	            data:{
	                module:options.module,
	                containerId:(options.containerId ? options.containerId : ("content-details-" + options.moduleAlias)),//No i18n
	                entity_id:options.entity_id,
	                clearContainer:true
	            },
				afterRender:options.afterRender
	        });
		}
	        if(options.loadRightPanel != false){
		        jQuery('#content-right-panel-inner-'+(options.moduleAlias ? options.moduleAlias : options.module)).before(`<div id="widget_tabs"></div>`);
		        SdpWidgets.renderHelpers.renderWidgetHeader({
		            location:options.module+".detail.rightpanel",//No i18n
		            element:"#widget_tabs",//No i18n
		            refreshPanel:options.refreshPanel,
					type:"rightpanel", //No i18n
		            data:{
		                module:options.module,
		                containerId:("content-right-panel-inner-" + (options.moduleAlias ? options.moduleAlias : options.module)), //No I18N
		                entity_id:options.entity_id,
		                clearContainer:true,
		            },
					default_icon:options.default_icon,
					afterRender:options.afterRender
		        });

		    }
	    }
		function renderWidgetHeader(meta_data){
			if(!sdp_app.IS_CUSTOM_MODULE_ENABLED ||(jQuery("#"+meta_data["data"].containerId).find("#widget_tabs").length >0)){
				return ;
			}
			if(meta_data.type === "rightpanel" && meta_data.data.module.startsWith("cm_")){
				tab_count = 6
			}
			if(meta_data.widget_tabs){
				jQuery("#"+meta_data["data"].containerId).before(`<div id="widget_tabs"></div>`);
			}
			var custom_app_info;
	        var list_info={"for":meta_data.location};//no i18n
			if(SdpWidgetsLocationMeta[meta_data.location]==undefined){
				SdpWidgetsLocationMeta[meta_data.location]={};
			}
			let widget_meta=SdpWidgetsLocationMeta[meta_data.location];
			if(widget_meta==undefined||widget_meta.widget_data==undefined){
				sdpAjax({
					url: "/api/v3/custom_app/_location_based",//no i18n
					data:{input_data:sdpToJSON(list_info)},
					async:false,
					success: function(response){
						custom_app_info=response.custom_app.custom_app;
						widget_meta.widget_data=custom_app_info;
					}
				})
			}

			SdpWidgetsLocationMeta[meta_data.location]={
					...meta_data, 
					widget_data:widget_meta.widget_data};

			custom_app_info=widget_meta.widget_data
				if(custom_app_info !=undefined){
		      		custom_app_info.forEach((value)=>{
		      			CustomApps[value.id]=value;
		      		});
		      		if(custom_app_info&&custom_app_info.length){
		      			let template=meta_data.template|| 'custom_widget';//No i18n
		      			let compiled_data={
		      				widget:custom_app_info,
		      				options:{
		      					module:meta_data.data.module,
			      				location:meta_data.location,
			      				type:meta_data.type,
								default_icon:meta_data.default_icon,
								tab_count:tab_count
			      			}
			      		}
                        renderhbs(meta_data.element,template, compiled_data , meta_data.append||false, 'common',undefined,undefined,afterWidgetRender(meta_data));//No i18n 
			      	}
				}

		}
		function getWidgetIcon(icons,night_mode,app,widget) {
			let img_txt=""
			if(icons) {
				if(icons[night_mode]!=undefined){
					img_txt="<img src='"+getFullUrl(encodeURI(icons[night_mode]),app.custom_widget); //No i18n
				}
			}
			return img_txt!=""? img_txt+="'/>":"";
		}
		function addWigetIcon(ele){
				let element="";
				if(ele instanceof jQuery){
					element=ele
				}
				else {
					element=jQuery(ele);
				}
            	let id = element.data("id");//No i18n
            	let app = CustomApps[id]; 
            	let icons=CustomApps[id] && CustomApps[id].property_json && CustomApps[id].property_json.icons;
            	let night_mode=(sdp_user.CLIENT_CONF.userTheme&&sdp_user.CLIENT_CONF.userTheme.nightMode==true)?"dark":"light";//No i18n
            	let img_txt="";//No i18n
            	if(id=="details"){
            	    return;
            	}
				if(!element.hasClass("cw_tab")){
						img_txt+=app.name;
				}
				else{
            	img_txt=e_html(getWidgetIconLetters(app.name));
            	if(icons) {
            		if(icons[night_mode]!=undefined){
						img_txt= getWidgetIcon(icons,night_mode,app,element);
					}else{
            		    img_txt=e_html(getWidgetIconLetters(app.name));
            	    }
            	}
				}
            	element.html(img_txt);
		}
		function afterWidgetRender(meta_data){
			return ()=>{
				if(meta_data.type==='tab'){
					let resTabs=new ResponsiveTabs(meta_data.element);
					jQuery( window ).off('resize.widget').on('resize.widget', function(event){  //No i18n
						resTabs.handleTabs();
					});
				}
				if(meta_data.location === 'request.detail.rightpanel'){
					jQuery("#right-panel").addClass("of-h");
				}
				if(meta_data.type=="rightpanel"){
					const parent=jQuery("#"+meta_data.data.containerId);
					const fullheight=jQuery(window).height()-parent.height();
					jQuery(parent).css('min-height', `${fullheight}px`); //No I18N
				 }
				jQuery("[data-type='custom_widget'][data-category='rightpanel']").each((index,ele)=>{
					addWigetIcon(ele);
				
            });
			function updateWigetIcon(widget){
				let img=widget.find("img");
				if(widget.hasClass("cw_dropdown")){	
					widget.removeClass("font-medium");
					widget.addClass("disp-ib text-overflow");
					widget.attr("mode_ellipsis",true);
					widget.css({
						"max-width":"200px"  //No i18n
					})
					img=widget.data('wdg-name') //No i18n
					widget.html(e_html(img));	
				}
				else{
					widget.addClass("font-medium");
					widget.removeAttr("mode_ellipsis");
					addWigetIcon(widget);
				} 
			}
            jQuery("[data-type='custom_widget']").off().on("click", function(e) {
				let clicked_widget=jQuery(this);
            	var data=clicked_widget.data();
            	var options=SdpWidgetsLocationMeta[data.location];
				if(data.location.indexOf("rightpanel")!=-1){
					if(!clicked_widget.hasClass("cw_tab")){
					//TODO: check whether this is from dropdown
					let tab_toshift=jQuery(`#widget_tabs li:eq(${tab_count}) a`);
					tab_toshift.addClass("cw_dropdown");
					tab_toshift.removeClass("cw_tab");
					clicked_widget.removeClass("cw_dropdown");
					clicked_widget.addClass("cw_tab");
					updateWigetIcon(clicked_widget);
					updateWigetIcon(tab_toshift);
					jQuery("#widget_dropdown").append(jQuery(`#widget_tabs li:eq(${tab_count})`)[0]);
					//tab_count -1 used for appending before ... part
					jQuery(`[data-tab="cwdg_rightpanel"] li:eq(${tab_count-1})`).after(this.parentNode); //No i18n 
					jQuery("#widget_tabs li").removeClass("active");//No i18n 
					}
					jQuery(`#${options.data.containerId}`).addClass("fh");
				}
            	if(data.id=="details"){//No i18n
            		options.pre && options.pre();
            		options.refreshPanel && options.refreshPanel();
            		return;
	            }
                SdpWidgets.renderHelpers.renderWidget(data.id,data.location,options.data);
				if(data.location.endsWith("tab")){
					setTimeout(()=>{
						new ResponsiveTabs(options.element).reArrangeTab();
					},10)
				}
                options.post && options.post();
            });
			 //first bind events and then call back
				meta_data.afterRender && meta_data.afterRender(meta_data.type);
		}

		}

		function renderWidget(id,location, options) {
			SdpWidgetsLocationMeta[location]==undefined ?SdpWidgetsLocationMeta[location]={}:"";
			SdpWidgetsLocationMeta[location].data=options;
			function getMetaData(app_data,location,options){
				var mainfest_data= {};
				mainfest_data.metaData= {
			        module: options.module ? options.module : "request",//no i18n
			        module_entity_id:options.entity_id ? options.entity_id : 1,
			        location: location
			    }
				mainfest_data.location=location;
				mainfest_data.widgetData=app_data.custom_app;
      			mainfest_data.pageObject=$req.details.request_info;
				mainfest_data.widgetView=jQuery("#" + (options.containerId ? options.containerId : "widget_content"));
				if(options.clearContainer){
					jQuery("#"+options.containerId).html("");
				}
				return mainfest_data;
			}
			SdpWidgets.init();
			if(!isNaN(id)){
				sdpAjax({
			      	url: "/api/v3/custom_app/"+id,//no i18n
			      	data:{input_data:sdpToJSON({for:location})},
			      	success: function(response){
			      		//mainfest_data.validate=false;
			      		var mainfest_data=getMetaData(response,location,options);
						SdpWidgets.renderHelpers.init(mainfest_data);
						if(location=="request.detail.rightpanel"){
							jQuery("#main-tab-content").removeClass("active").removeClass("in").addClass("hide");
							jQuery("#widget_content").addClass("active").addClass("in").removeClass("hide");
						}else if(location=="request.detail.tab"){//No i18n
							jQuery("#desc-section, #resource-section, #conversation-section, #property-section, #share-section , #asso-section , #tag-section").addClass("hide");
							jQuery("#tab-content").removeClass("hide");
						}
			      	}
			  	});
			}
		}

		function isWidgetPresent(location){
			if(!sdp_app.IS_CUSTOM_MODULE_ENABLED){
				return false;
			} 
			var custom_app_info;
	        var list_info={"for":location};//no i18n
			let present=false;
			sdpAjax({
		      	url: "/api/v3/custom_app/_location_based",//no i18n
		      	data:{input_data:sdpToJSON(list_info)},
		      	async:false,
		      	success: function(response){
		      		custom_app_info=response.custom_app;
		      		if(custom_app_info.custom_app&&custom_app_info.custom_app.length){
						present= true;
						SdpWidgetsLocationMeta[location]={
							widget_data:custom_app_info.custom_app
						}
			      	}

		      	}
		  	});
			  return present;

		}

		return {
			init: init,
			getWidgetIconLetters: getWidgetIconLetters,
			renderModuleWidgets:renderModuleWidgets,
			renderWidget:renderWidget,
			renderWidgetHeader:renderWidgetHeader,
			getCustomWidgetData:getCustomWidgetData,
			isWidgetPresent:isWidgetPresent
		}
	})();

	var init=function(){
		if(this.renderOnce==true){
			return;
		}
		var dcCode="local";//No i18n
		/*pageEntityMap[SdpRequest.pages.details] = 'request'; //No I18N
		pageEntityMap[SdpChange.pages.details] = 'change'; //No I18N
		pageEntityMap[SdpAsset.pages.details] = 'asset'; //No I18N
		pageEntityMap[SdpWorkStation.pages.details] = 'workstation'; //No I18N
		pageEntityMap[SdpMobile.pages.details] = 'mobile'; //No I18N
		pageEntityMap[SdpVMHostObject.pages.details] = 'virtual_host'; //No I18N
		pageEntityMap[SdpVMachineObject.pages.details] = 'virual_machine'; //No I18N*/
		pageEntityMap["request-details"]= 'request'; //No I18N
		ZAppUtil.constructQueryParamsString=function(){
			return "";
		}
		var options = {
			/*
			 * TODO: check how application locale can be used here
			 */
			defaultLocale: 'en', //No I18N
			EventListeners: {
				SDP_EVENT: sdkFunctions.eventFunctions.handleEvent
			},
			RenderHandlers: {
				WidgetHandler: renderHandlers.widgetHandler
			}
		};

		try {
			/*
			 * For live, the hostname and other details would be available in the dependency JS file (ZFramework.js) fetched from Zapps
			 */
			if(typeof isDevelopementBuild != 'undefined' && isDevelopementBuild == 'true') {
				var patt = new RegExp('(http[s]?):\/\/([A-Za-z0-9-.]*)', 'g'); //No I18N
				var res = patt.exec(zappServer);
				var zappServerHost = res[2];
				options.serverConfig = {
					zappsHost: {
						host: zappServerHost
					}
				};
			}
			else if(dcCode == 'local') {
				/*
				 * For local manageengine setup need to point to zapps local dev setup, so changing the hostname here, from the app.properties
				 * server host : {{zappid}}.localzappscontents.com
				 */
				options.serverConfig = {
					zappsHost: {
						host: sdp_app.CLIENT_CONF.hostedDomain
					}
				};
			}
			
			/*
			 * Initiating ZFramework
			 */
			ZApp.Bootstrap(options);
			this.renderOnce=true;
		}
		catch(err) {
			//console.error("Exception while invoking the ZAPPS server " + err); //No I18N
		}
	};
	
	return {
		init:init,
		utils: utils,
		renderHelpers: renderHelpers,
		eventHandle:sdkEvents	

	};
})();
