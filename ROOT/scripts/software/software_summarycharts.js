var swChartsObj = {
	/**
	  * A function, to render pie chart for license usage summary
	*/
	getPieChart: function () {
		var container = jQuery("#pieChartContainer")[0];
		var siteId = jQuery("#allsites").val();
		var manufacturerId = jQuery("#softwareManufacturer").val();
		var notInUseCount;
		var inUseCount;
		var ajaxUrl = `/SoftwareHome.do?operation=getLicenseUsageGraph`;
		sdpAjax({
			url: ajaxUrl,
			type: "POST",//No I18N
			data: {
				"site": siteId,  //NO I18N
				"manufacturer": manufacturerId  //NO I18N
			},
			dataType: 'json',//NO I18N
			success: function (response) {
				notInUseCount = response.graphData.notInUse;
				inUseCount = response.graphData.inUse;
				var hasData = [];
				if (notInUseCount != 0 || inUseCount != 0) {
					hasData = [
						[
							[
								translate("software.metering.license.not.in.use"),//no i18n
								notInUseCount
							],
							[
								translate("software.metering.license.in.use"),//no i18n
								inUseCount
							]
						]
					];
				}
				swChartsObj.createPieChartData(container, hasData);
			},
			failedCallBack: function () {
				showalert('failure', getMessageForKey("sdp.ajax.request.send.error") + "." + getMessageForKey("sdp.admin.windowsagent.trylatermsg") + ".", 'isAutoHide=false,closeOnEscKey=yes');//No I18N
			}
		});
	},

	/**
	  * A function, to return the chart data for rendering the pie chart
	*/
	createPieChartData: function (container, hasData) {
		var data = {
			"legend": { //no i18n
				"layout": "horizontal",//no i18n
				"colorPallete": {//no i18n
					"options": {//no i18n
						"multicolor": "zoho-reports-new"//no i18n
					}
				},
				"useChartEffect": false,//no i18n
				"enabled": true//no i18n
			},
			"chart": {//no i18n
				"plot": {//no i18n
					"plotoptions": {//no i18n
						"pie": {//no i18n
							"gradients": {//no i18n
								"type": "linear",//no i18n
								"options": {//no i18n
									"linear": {//no i18n
										"x1": "0",//no i18n
										"x2": "0",//no i18n
										"y1": "0",//no i18n
										"y2": "100",//no i18n
										"gradientUnits": "objectBoundingBox",//no i18n
										"colorGamma": [//no i18n
											0.45,
											0.25
										]
									}
								}
							}
						}
					}
				}
			},
			"metadata": {//no i18n
				"axes": {//no i18n
					"x": [//no i18n
						0
					],
					"y": [//no i18n
						[
							1
						]
					]
				},
				"columns": [//no i18n
					{
						"dataindex": 0,//no i18n
						"columnname": "Type",//no i18n
						"datatype": "ordinal"//no i18n
					},
					{
						"dataindex": 1,//no i18n
						"columnname": "Count",//no i18n
						"datatype": "numeric"//no i18n
					}
				]
			},
			"seriesdata": {//no i18n
				"chartdata": [//no i18n
					{
						"type": "pie",//no i18n
						"data": hasData //no i18n
					}
				]
			},
			"canvas": {//no i18n
				"title": {//NO I18N
					"show": false//NO I18N
				},
				"fontSize": 19,//no i18n
				"subtitle": {//no i18n
					"text": 0,//no i18n
					"show": false//no i18n
				}
			},
			"loader": {//NO I18N
				"enabled": true//NO I18N
			}
		};

		data = applyAxesPropForWeb(data);
		swChartsObj.pieChartObj = chartObj = new $ZC.charts(container, data);


		function applyAxesPropForWeb(data) {
			data.chart = {
				"axes": {//no i18n
					"xaxis": {//no i18n
						"grid": {//no i18n
							"color": "black",//no i18n
							"strokeWidth": 0.7//no i18n
						},
						"tickmark": {//no i18n
							"color": "black",//no i18n
							"strokeWidth": 0.7//no i18n
						},
						"axisline": {//no i18n
							"show": false//no i18n
						}
					},
					"yaxis": [{//no i18n
						"ticklabel": {//no i18n
							"fontColor": "transparent"//no i18n
						},
						"grid": {//no i18n
							"color": "grey",//no i18n
							"strokeWidth": 0.5//no i18n
						},
						"label": {//no i18n
							"show": false//no i18n
						},
						"axisline": {//no i18n
							"show": false//no i18n
						},
						"tickmark": {//no i18n
							"color": "transparent"//no i18n
						}
					}]
				},
				plot: {
					events: {
						click: swChartsObj.complianceEventHandler
					}
				}
			}
			return data;
		}
		function resetAxesProp(data) {
			data.chart = {
				"axes": {//no i18n
					"xaxis": {},//no i18n
					"yaxis": [{}]//no i18n
				}
			}
			return data;
		}
	},

	/**
	 * function to handle click event of compliance chart
	 */
	complianceEventHandler: function (event, data, chartObj) {
		const graphId = jQuery(chartObj.container._groups[0]).attr('id');
		if (graphId !== "compliancePieChart") {
			return;
		}

		const manufacturerId = jQuery("#softwareManufacturer").val();
		const siteId = jQuery("#allsites").val();

		let url = `/SoftwareListView.do?fromSoftwareHome=true&showZeroCount=false&swType=2&softwareManufacturer=${manufacturerId}&site=${siteId}`;

		const complianceMap = { "Compliant": 1, "Under Licensed": 2, "Over Licensed": 3 }; // No I18N
		const complianceTypeId = complianceMap[data.point[0]];
		url += `&swComplianceType=${complianceTypeId}`;

		window.open(url, "_blank"); // No I18N
	},

	/**
	  * A function, to create a bar chart object for software usage summary using the count of each usage type and total of all usage types
	*/
	updateOverallSwUsage: function () {
		var container = jQuery("#barChartContainer")[0];
		swChartsObj.getUsageGraphData().then((data) => {
			var rareCount = data.rarelyUsed;
			var frequentCount = data.frequentlyUsed;
			var occasionalCount = data.occasionallyUsed;
			var neverusedCount = data.neverUsed;
			var total = rareCount + frequentCount + occasionalCount + neverusedCount;
			var data = swChartsObj.returnDataForChart([[["FrequentlyUsed", frequentCount], ["OccasionallyUsed", occasionalCount], ["RarelyUsed", rareCount], ["NeverUsed", neverusedCount]]], total, "Usage", ["FrequentlyUsed", "OccasionallyUsed", "RarelyUsed", "NeverUsed"]);//No I18N
			swChartsObj.overallBarchartObj = chartObj = new $ZC.charts(container, data);
		}).catch((error) => {
			showalert('failure', getMessageForKey("sdp.ajax.request.send.error") + "." + getMessageForKey("sdp.admin.windowsagent.trylatermsg") + ".", 'isAutoHide=false,closeOnEscKey=yes');//No I18N
		});
	},

	/**
	 * A function, to get the software usage data from the server
	 * @returns {Promise} - A promise that resolves with the software usage data
	 */
	getUsageGraphData: function () {
		return new Promise((resolve, reject) => {
			var siteId = jQuery("#allsites").val();
			var manufacturerId = jQuery("#softwareManufacturer").val();
			var ajaxUrl = `/SoftwareHome.do?operation=getSoftwareUsageGraph`;

			sdpAjax({
				url: ajaxUrl,
				type: "POST",  //NO I18N
				data: {
					"site": siteId,  //NO I18N
					"manufacturer": manufacturerId  //NO I18N
				},
				dataType: 'json',  //NO I18N
				success: function (response) {
					resolve(response.graphData);
				},
				failedCallBack: function () {
					showalert('failure', getMessageForKey("sdp.ajax.request.send.error") + "." + getMessageForKey("sdp.admin.windowsagent.trylatermsg") + ".", 'isAutoHide=false,closeOnEscKey=yes');//No I18N
					reject("Failed to fetch usage data.");  //NO I18N
				}
			});
		});
	},


	/**
	  * A function, to render bar chart for software usage summary
	*/
	getSpecificUsageChart: function (usagetype) {

		var container = jQuery("#barChartContainer")[0], start_index = 1, has_more_rows = false, input_data_usage, swValues = [], total = 0;
		var siteId = jQuery("#allsites").val();
		//"-2" indicates Not associated to any site. Hence assigning site id as null
		if (siteId === "-2") {
			siteId = null;
		}
		var manufacturerId = jQuery("#softwareManufacturer").val();
		do {
			if (usagetype === "Never") {
				input_data_usage = { "list_info": { "group_by": ["software.name"], "fields_required": ["id:count", "software.id:max", "software.name:max", "usage.name:max"], "row_count": "100", "start_index": start_index, "search_criteria": [{ "field": "usage", "condition": "is", "value": null, "logical_operator": "and" }] } };//NO I18N
			}
			else {
				input_data_usage = { "list_info": { "group_by": ["software.name"], "fields_required": ["id:count", "software.id:max", "software.name:max", "usage.name:max"], "row_count": "100", "start_index": start_index, "search_criteria": [{ "field": "usage.name", "condition": "is", "value": usagetype }] } };//NO I18N
			}
			//"-1" indicates All sites, so no need to add site and manufacturer criteria.
			if (siteId !== "-1") {
				input_data_usage.list_info.search_criteria.push({ "field": "workstation.site", "condition": "eq", "value": siteId, "logical_operator": "and" });
			}
			if (manufacturerId !== "-1") {
				input_data_usage.list_info.search_criteria.push({ "field": "software.manufacturer", "condition": "eq", "value": manufacturerId, "logical_operator": "and" });
			}

			sdpAjax({
				type: 'GET', //NO I18N
				url: '/api/v3/software_installations', //NO I18N
				dataType: 'json', //NO I18N
				async: false,
				data: sdpAjaxInputData(input_data_usage),
				success: function (response) {
					if (response.response_status[0].status_code === 2000) {
						total = total + response.software_installations.length;
						response.software_installations.forEach(function (sw) {
							swValues.push([sw["software.name"], parseInt(sw["id:count"])]);
						});
					}
					has_more_rows = response.list_info.has_more_rows;
					start_index = start_index + 100;
				},
				error: function (response) {
					showalert('failure', e_html(response.responseJSON.response_status.messages[0].field) + "-" + e_html(response.responseJSON.response_status.messages[0].message), 'isAutoHide=false,delay=3,width=400');// NO I18N
				}
			});
		} while (has_more_rows);
		var data = swChartsObj.returnDataForChart(swValues, total, "Software", []);//NO I18N
		swChartsObj.specificBarChartObj = chartObj = new $ZC.charts(container, data);
	},

	/**
	  * A function, to return the chart data for rendering the bar chart
	*/
	returnDataForChart: function (swValues, total, xColName, xCategories) {
		var data = {
			"canvas": {//NO I18N
				"subtitle": {//NO I18N
					"show": false//NO I18N
				},
				"title": {//NO I18N
					"show": false//NO I18N
				}
			},
			"seriesdata": {//NO I18N
				"chartdata": [//NO I18N
					{
						"type": "bar",//NO I18N
						"data": swValues //NO I18N
					}
				]
			},
			"metadata": {//NO I18N
				"axes": {//NO I18N
					"x": [//NO I18N
						0
					],
					"y": [//NO I18N
						[
							1
						]
					]
				},
				"columns": [//NO I18N
					{
						"dataindex": 0,//NO I18N
						"columnname": xColName,//NO I18N
						"datatype": "ordinal"//NO I18N
					},
					{
						"dataindex": 1,//NO I18N
						"columnname": "Count",//NO I18N
						"datatype": "numeric"//NO I18N
					}
				]
			},
			"chart": {//NO I18N
				"axes": {//NO I18N
					"rotated": false,//NO I18N
					"xaxis": {//NO I18N
						"categories": xCategories,//NO I18N
						"label": {//NO I18N
							"text": "Total: " + total//NO I18N
						},
						"ticklabel": {//NO I18N
							"maxWidth": "10%"//NO I18N
						}
					},
					"yaxis": [//NO I18N
						{
							"label": {//NO I18N
								"text": "Count"//NO I18N
							}
						}
					]
				},
				"plot": {//NO I18N
					"plotoptions": {//NO I18N
						"bar": {//NO I18N
							"datalabels": {//NO I18N
								"show": true//NO I18N
							},
							"maxBandWidth": 50//NO I18N
						}
					}
				},
				"effects": {//NO I18N
					"choice": "auto"//NO I18N
				},
				"scroll": {//NO I18N
					"enabled": true,//NO I18N
					"visibleCategories": 4//NO I18N
				}
			},

			"loader": {//NO I18N
				"enabled": true//NO I18N
			},
			"tooltip": {//NO I18N
				"enabled": true,//NO I18N
				"view": "normal"//NO I18N
			}
		};
		return data;
	},

	/**
	  * A function, to handle the dropdown change in bar chart. For instance, if Frequently is chosen from dropdown, frequently used softwares chart data should be shown
	*/
	handleMeteringDropdown: function () {
		jQuery("#barChartContainer").empty();
		var type = jQuery('#meteringDropdown').val();
		if (type === "overall") {
			swChartsObj.updateOverallSwUsage();
		}
		else if (type === "rarely") {
			swChartsObj.getSpecificUsageChart("Rarely");//no i18n
		}
		else if (type === "frequently") {
			swChartsObj.getSpecificUsageChart("Frequently");//no i18n
		}
		else if (type === "occasionally") {
			swChartsObj.getSpecificUsageChart("Occasionally");//no i18n
		}
		else if (type === "never") {
			swChartsObj.getSpecificUsageChart("Never");//no i18n
		}
	}

}