/* $Id$ */
/*
 * Need to be removed from SDPLIVE build and hosted in static server finally
 */
var SDP = {};
(function(SDP) {
	var SDP_EVENT = 'SDP_EVENT'; //No I18N
	
	/**
	 * trigger event
	 * @param eventName - events registered in application like SDP_EVENT
	 * @param eventData - data to be passed to the registered callback for the event
	 * @return promise - a promise with resolve / reject callback
	 */
	function triggerEvent(eventName, eventData) {
		return appSDK._sendEvent(eventName, eventData, true);
	}
	
	/**
	 * Defines the function in the passed object
	 * @param parent - function parent object
	 * @param functionName - function to be defined
	 * @param functionParams - function parameters in array.
	 * @param functionEvent - event to be passed when the respected function is called
	 * @param functionScript - Script to be executed on calling the function
	 */
	function defineFunction(parent, functionName, functionParams, functionEvent, functionScript) {
		parent[functionName] = function() {
			if(functionScript) {
				return Function('"use strict";' + functionScript)();
			}
			else {
				var data = {};
				if(functionParams) {
					var args = arguments;
					if(functionParams instanceof Array) {
						functionParams.forEach(function(item, index) {
							data[item] = args[index];
						});
					}
					else {
						data = args[0];
					}
				}
				data.type = functionEvent;
				return triggerEvent(SDP_EVENT, data);
			}
		}
	}
	
	/**
	 * Iterates the function list passed by parent and initiates defineFunction to create the functions under the passed scope
	 * @param parent - scope where the functions to be created
	 * @param functions - function details as object array
	 */
	function iterateAndDefineFunctions(parent, functions) {
		functions.forEach(function(func) {
			if(func.functions) {
				parent[func.name] = {};
				iterateAndDefineFunctions(parent[func.name], func.functions);
			}
			else {
				defineFunction(parent, func.name, func.params, func.event, func.exescript);
			}
		});
	}
	
	/*
	 * Initialize SDK and take a reference of it.
	 */
	var appSDK = ZSDK.Init();
	var promise = new Promise(function(resolve, reject) {
		appSDK.on('Load', function(appInfo) {
			iterateAndDefineFunctions(SDP, appInfo.widgetmeta.functions);
			delete appInfo.widgetmeta.functions;
			appInfo.meta = appInfo.widgetmeta;
			delete appInfo.widgetmeta;
			SDP.appInfo = appInfo;
			resolve(appInfo);
		});
	});
	
	/**
	 * Add eventlisteners, so that callback would be executed once the event gets executed in the application
	 * @param {*} eventName
	 * @param {*} callbackFn
	 */
	SDP.on = function(eventName, callbackFn) {
		appSDK.on(eventName, callbackFn);
	}
	
	/**
	 * @param Object - we could initiate the eventListeners needed for the widget
	 * @return Promise - a promise with resolve / reject callback
	 */
	SDP.init = function(obj) {
		var eventObj = obj ? (obj.EventListeners || {}) : {};
		for(var eventName in eventObj) {
			SDP.on(eventName, eventObj[eventName]);
		}
		return promise;
	}
})(SDP);