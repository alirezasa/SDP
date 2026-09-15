/* $Id$ */
function setChartContent(id,url,callback) {
	if(url.includes("/GenerateReportWidget.do") || url.includes("custom_report=true")){
	    //For report widget zoho charts should be generated.
		url = addURLParam(url, "isWidget", "true");//no i18n
		jQuery.ajax(url).done(function(response,data){
			document.getElementById(id).innerHTML = "";
			document.getElementById(id).setAttribute("style",'direction: ltr;');
			/* to do event check */
			if(response.chart.plot.events != null)
			{
				response.chart.plot.events['click'] = {};
				response.chart.plot.events.click = function (e, d) {
					d.data[0].reportId = response.chart.plot.events.reportId;
					d.data[0].otherNegate = response.chart.plot.events.otherNegate;
					d.data[0].isAPISupported = response.chart.plot.events.isAPISupported;
					d.data[0].search_criteria = response.chart.plot.events.search_criteria;
            		chartClick(d.data);
           		};
			}else {
				response.chart.plot['events'] = {};
			}
			if(response.seriesdata) {
				response = prepareReportsChart.call(Object.create(dashboardComp), { response, id });
			new $ZC.charts(document.getElementById(id), response);
			}
			else {
				dashboardComp.showEmptyChart(id);
			}
		}).always(function(){
			callback && callback();
		});
	}else{
	jQuery.ajax(url).done(function(response,data){
			if(dashboardComp.isOldDataChartSupported(id, url)) {
				Object.create(dashboardComp).generateReport(id, response, url);
				return;
			}
		}).always(function(){
			callback && callback();
		});
	}
}

// Function to prepare the reports' chart data as per dashboard charts properties
function prepareReportsChart(content) {
	var id = content.id;
	var response = content.response;
	var chartType = response.seriesdata.type || response.seriesdata.chartdata[0].type;
	this.widgetDiv = jQuery("#" + id).closest("li.gs-w");
	this.widgetName = this.widgetDiv.data('name'); //No I18n
	this.moduleName = this.widgetDiv.data("module"); //No I18n
	this.widgetApiInfo = { chart: { name: "ReportWidget", type: [chartType], colors: response.legend.colors} };
	response.is_single_series = response.seriesdata.type ? false : true;
	this.widgetApiInfo.chart.group = response.is_single_series ? this.chartGroup.singleSeries : this.chartGroup.multiSeries;
	this.widgetApiInfo.chart.legend = true;
	response.seriesdata.categories = response.chart.axes.xaxis.categories;
	response.seriesdata.chartData = response.seriesdata.chartdata;
	delete response.seriesdata.chartdata;

	// set chartType for multi-series data
	if (response.seriesdata.type) {
		response.seriesdata.chartData.forEach(function (elem) {
			elem.type = chartType;
		});
	}

	var metaDataColumns = response.metadata.columns;
	var plotOption = response.chart.plot.plotoptions[chartType];
	var events = response.chart.plot.events;
	var xgrid = {};
	var ygrid = {};

	// Find & assign graph types for incoming data				
	this.graphType = [];
	switch (true) {
		case (response.chart.plot.plotoptions.pie.innerRadius != undefined):
			this.graphType = ['Pie', 'Doughnut']; //No I18n
			break;
		case (response.chart.axes.rotated == true):
			this.graphType = ['Bar', 'Rotated']; //No I18n
			break;
		case (response.chart.plot.plotoptions.line.mode === "stepAfter"): //No I18n
			this.graphType = ['Line', 'Stepline']; //No I18n
			break;
		case (chartType === "funnel"): //No I18n
			this.graphType = ['Funnel']; //No I18n
			break;
		case (chartType === "web"): //No I18n
			xgrid = response.chart.axes.xaxis.grid;
			ygrid = response.chart.axes.yaxis[0].grid;
			break;
		default:
			break;
	}

	var tooltip = response.metadata.axes.tooltip;
	var label = response.metadata.axes.label;
	this.reportEventEnabled = response.chart.plot.events && response.chart.plot.events.enabled;
	response = this.constructZohoChart(response.seriesdata);

	// Replace tooltip & label given in reports data
	response.metadata.axes.tooltip = tooltip;
	response.metadata.axes.label = label;

	// Special case handling for reports' sunburst, packedbubble & scatter chart type
	if (chartType === "sunburst" || chartType === "packedbubble") {
		response.legend.layout = "vertical"; //No I18n
		response.metadata.columns[2].levelindex = 0;
	} else if (chartType === "scatter") { //No I18n
		response.metadata.axes.clr[0] = 0;
	} else if (chartType == "web") { //No I18n
		response.chart.axes.xaxis.grid = xgrid;
		response.chart.axes.yaxis[0].grid = ygrid;
	}

	// Reassign plotOption for reports' unique chart types that are not handled in dashboard
	if ((!response.chart.plot.plotoptions[chartType] && plotOption) || chartType ==='bar') {
		response.chart.plot.plotoptions[chartType] = {
			...(response.chart.plot.plotoptions[chartType] || {}),
			...plotOption
		};
	}

	//replace binded events
	response.chart.plot.events = events;

	// Replace metaData columns
	response.metadata.columns = metaDataColumns;

	return response;
}
				
function addURLParam(url,name,value){
	if(url.indexOf("?") != -1) //NO OUTPUTENCODING
	{
		url += "&";
	}
	else
	{
		url += "?";//NO OUTPUTENCODING
	}
	url += name+"="+value;
	return url;
}

function refreshWidgets(options = {}) {
	var widgetsInOrder = jQuery(".gridster li.gs-w").filter(function(k,v){
		return !jQuery(v).data("external"); // No I18N
	}).sort(function(one,another){
		var row1 = jQuery(one).data("row"); // No I18N
		var col1 = jQuery(one).data("col"); // No I18N
		var row2 = jQuery(another).data("row"); // No I18N
		var col2 = jQuery(another).data("col"); // No I18N
		return (row1 == row2)? (col1 - col2) : (row1 - row2);
	});
	if(!options.isTabSwitch) {
		let widgets = jQuery("#dboard-content li.widgets");
		if(options.isSiteGroupUpdate) {
			widgets = widgets.not("[data-module=Graph]").not("[data-module=Table]"); // No I18N
		}
		widgets.data("isLoaded", false); // No I18N
	}
	dashboardComp.attachEvent();
	dashboardComp.loadWidgets();
}
function refreshWidgetData(liElemWidgetDataId) {
    var liElem = (jQuery('li[data-widgetid=\"'+liElemWidgetDataId+'\"]:not([data-external=true])'));
	var $widget = jQuery(liElem).find('.widget-bg');
	reloadDataForRestore($widget);
}
function reloadDataForRestore($widget){
	if(dashboardComp.isZChartsSupported($widget)) {
		Object.create(dashboardComp).loadZChart($widget);
	}
	else if(jQuery($widget).find('.widget-header .widget-select').hasClass('clickableSelect')){		
		var reloadUrl = jQuery($widget).find('.clickableSelect').find('option:selected').data('changeurl');	//No I18n
		if(reloadUrl.startsWith("/AssetHomePage.do") && jQuery($widget).parent().hasClass("fullScreen")) {
			reloadUrl = addURLParam(reloadUrl,"frame","first");	//No I18n
		}
		var contentElem = $widget.find(".widget-summaryrequests-list>div");
		var id = contentElem.attr("id");
		jQuery($widget).find(".reload > span").removeClass("rotate-right1").addClass("task-loading"); // No I18N
		var prefix = id.split("_")[0];
		if(prefix == "table")
		{			
			doAjaxGet(id, reloadUrl,function(){
				jQuery($widget).find(".reload > span").addClass("rotate-right1").removeClass("task-loading"); // No I18N
			});
		}
		else if (prefix == "customapp")
		{
			var widgetId = $widget.data("actualwidgetid");//No I18n
			SdpWidgets.renderHelpers.renderWidget(widgetId, "dashboard", { module: $widget.data("module"), containerId: id });//No I18n
			callbackAfterChange && callbackAfterChange();
		}
		else
		{
			setChartContent(id,reloadUrl,function(){
				jQuery($widget).find(".reload > span").addClass("rotate-right1").removeClass("task-loading"); // No I18N
			});
		}
		
	} else if (jQuery($widget).find(".widget-summaryrequests-list").hasClass("iframe-widget-summaryrequests-list")) { //No I18n
		var frameDiv = $widget.find(".widget-summaryrequests-list"); //No I18n
		var dataUrl = frameDiv.attr('data-url'); //No I18n
		frameDiv.find("> iframe")[0].src = dataUrl; //No I18n
	} else {
		var dataUrl = $widget.find(".widget-summaryrequests-list > div").attr('data-url');
		var headerElem = jQuery($widget).find('div.widget-header .widget-menu-container.normalviewmenu');
		jQuery($widget).find(".reload > span").removeClass("rotate-right1").addClass("task-loading"); // No I18N
		if(dataUrl) {
			changeContent(headerElem,dataUrl,function(){
				jQuery($widget).find(".reload > span").addClass("rotate-right1").removeClass("task-loading"); // No I18N
			});
		}
	}
}
function changeContent($el,baseurl,callbackAfterChange) {
	$el = jQuery($el);
	var headerElem;
	var isRefreshEvent = false;
	if($el.hasClass('widget-select') && $el.is("select")){ // No I18N
		var $selectedOption = $el.find('option:selected'); // No I18N
		$el.find('option').attr('selected',false); // No I18N
		jQuery($selectedOption).attr('selected',true); // No I18N
		headerElem = $el.parent();
	}else {
		headerElem = $el;
		isRefreshEvent = true;
	}
	var selects = jQuery(headerElem).parents(".widget-header").find('select.widget-select'); // No I18N
	var $widget = jQuery(headerElem).closest(".gs-w , .widget-bg");		//No I18n

	var $container = $widget.find(".widget-summaryrequests-list");	//.widgets-cont
	var id = $container.find(" > div").attr("id"); // No I18N
	var url = baseurl;

	if(url.startsWith('/dashboard/CreateTaskTable.jsp') || url.startsWith('/DashBoardView.do?action=chartData')) {
		if(dashboardComp.getDashboardId() && !url.includes("viewId=")) {
			url = addURLParam(url, "viewId", dashboardComp.getDashboardId()); //No I18n
		}
		if(getSDPURLParams().action == 'embedWidget') {
			let groups = jQuery("#groupSelection").select2("data"); //No I18n
			let groupIds = [];
			for(let group of groups) {
				let groupId = group.id;
                if(!isInteger(groupId)) {
                    groupId = (group.text != undefined) ? dashboardComp.supportGroups[group.text] : dashboardComp.supportGroups[group.name];
                }
                if(isInteger(groupId)) {
					groupIds.push(groupId);
				}
			}
			url = addURLParam(url, "groups", groupIds); //No I18n
		}
	}
	if(url && jQuery($widget).parent().hasClass("fullScreen")) {
		if(url.startsWith("/reports/CreateReportTable.jsp")) {
			url = addURLParam(url, "viewFullReport", true); //No I18n
		}
		else if(url.startsWith('/dashboard/CreateTaskTable.jsp') || (url.indexOf("viewFullReport=false") != -1)) {
			url = url.replace("viewFullReport=false", "viewFullReport=true"); //No I18n
		}
	}
	var siteId=jQuery("#siteSelection").val();
	if(url.indexOf("ChangePlan.jsp")==-1) {
	if(isRefreshEvent){
		jQuery.each(selects,function(k,v){
			var valStr = jQuery(v).find('option:selected').data('value') || jQuery(v).find('option:first-child').data('value');	//No I18n
			url = addURLParam(url,jQuery(v).attr("name"),valStr); // No I18N
		});
	}
		else {
		url = addURLParam(url,$el.attr("name"),$el.find("option:selected").data("value")) // No I18N
	}
	}
	if(siteId && !url.startsWith("/ui/reports/drilldown") && !url.startsWith("/app/")){
		url = addURLParam(url,"site",siteId); // No I18N
	}
	
	var dynamicTitle = (isRefreshEvent) ? 'null' : $el.find('option:selected').attr('data-dynamictitle');		//No I18n
	if(dynamicTitle != 'null'){
		//change the widget title
		jQuery(headerElem).closest(".widget-header").find('.widgets-hdr-txt').text(dynamicTitle).attr('title',dynamicTitle); // No I18N
	}	

	var prefix = id.split("_")[0];
	if(prefix == "table")
	{
		$container.find(" > div").html('<div class="pos-abs fw fh">'+ajaxBar()+'</div>');
		doAjaxGet(id, url,callbackAfterChange);
	}
	else if (prefix == "customapp")
	{
		var widgetId = $widget.data("actualwidgetid");//No I18n
		SdpWidgets.renderHelpers.renderWidget(widgetId, "dashboard", { module: $widget.data("module"), containerId: id, "clearContainer":true});//No I18n
		callbackAfterChange && callbackAfterChange();
	}
	else
	{
		if(dashboardComp.isZChartsSupported(jQuery("#"+id).parents(".widget-bg"))) {
			Object.create(dashboardComp).reloadWidget(jQuery("#"+id));	
		}
		else {
		setChartContent(id,url,callbackAfterChange);
	}
}
}
function doAjaxGet(id, url, callbackfn){
	if(url.indexOf("ui/reports")==-1) {
		url = addURLParam(url,"id",id); //No I18N
	}
	jQuery.get(url, function(data) {
			var append = false;
			var dataAdded = false;
			jQuery(data).each(function(){
				if(this.tagName == 'DIV' && !dataAdded){
					dataAdded = true;
					if(append){
						jQuery('#'+id).append(jQuery(this).html());//NO OUTPUTENCODING
					}else {
						jQuery('#'+id).html(jQuery(this).html());//NO OUTPUTENCODING
					}					
				}
			});
			if(!dataAdded){	//if it do not have DIV element, then just load the data
				jQuery('#'+id).html(data);//NO OUTPUTENCODING
			}
			$sdEventListener('#'+id);
		var widgetCont = jQuery('#'+id).closest('.widget-bg');
	}).always(function(){
		if(callbackfn){
			callbackfn();
		}
	});
}
function handleClickableSelect(selectElem){
	var optionSelected = jQuery(selectElem).find('option:selected');
	jQuery(selectElem).find('option').attr('selected',false); //No I18n
	jQuery(optionSelected).attr('selected',true); //No I18n
	var displayName = optionSelected.attr("data-displayname");
	var onChangeUrl = optionSelected.attr("data-changeurl");
	var isGraph = optionSelected.attr("data-graph");
	var widgetEl = jQuery(selectElem).closest("li.gs-w");	//No I18n
	var contentDiv = widgetEl.find(".widget-summaryrequests-list > div");
	contentDiv.empty();

	if(isGraph == 'true')
	{			
		if(dashboardComp.isZChartsSupported(contentDiv)) {
			Object.create(dashboardComp).loadZChart(contentDiv);
		}
		else {
		contentDiv.attr("id","graph_"+contentDiv.attr("id").split("_")[1]);
		setChartContent(contentDiv.attr("id"),onChangeUrl);
		widgetEl.find('.widget-header').find('.graph-type').removeClass('hide-chart').removeAttr('style');	//No I18n
		}
	}else {
		var newId = "table_"+contentDiv.attr("id").split("_")[1];	//No I18n
		contentDiv.attr("id",newId);
		widgetEl.find('.widget-header').find('.graph-type').addClass('hide-chart').attr('style','display:none !important;').find("ul.graph-type-ul").find("li").remove();		
		if(onChangeUrl.startsWith("/AssetHomePage.do?requiredGraph=AssetSummary") && contentDiv.parents("li").hasClass("fullScreen")) {
			onChangeUrl+="&frame=first"; //NO I18N
		}
		doAjaxGet(newId, onChangeUrl);
	}		
}
function applySelect2ForAllVisibleWidgets(){
	jQuery(".gridsterul").find('select.max-col-field').select2("destroy"); // No I18N
	jQuery(".gridsterul").find('select.max-col-field').select2({ // No I18N
		minimumResultsForSearch: -1
	});
	jQuery(".gridsterul").find('select.widget-select').select2("destroy"); // No I18N
	jQuery(".gridsterul").find('select.widget-select').select2({ // No I18N
		minimumResultsForSearch: -1,
		dropdownAutoWidth: true,
		containerCssClass: "select2-brdr-none"	//No I18n
	}).on("select2-open", function() {	//No I18n
		if ( jQuery(this).closest('.refreshreportgraph').attr('data-name') == 'iconviewmenu' ) {
			jQuery(this).closest('.refreshreportgraph').attr('style','visibility: visible;');	//No I18n
			jQuery(this).closest('.btn-group').addClass('open');	//No I18n
		}
	}).on("select2-close", function() {	//No I18n
		if ( jQuery(this).closest('.refreshreportgraph').attr('data-name') == 'iconviewmenu' ) {
			jQuery(this).closest('.refreshreportgraph').removeAttr('style');	//No I18n
		}
	});
}
function setDefaultSelectForAllDropDowns(){	
	jQuery(".gridsterul").find('select.widget-select').each(function(index, el){ // No I18N
		var selectedOption = jQuery(el).attr('data-defaultselect');
		if(typeof selectedOption !== 'undefined' && 'null' !== selectedOption) {
			if(selectedOption != 'undefined') {
				var selectedOptionVal = jQuery(el).find('option[data-value="'+selectedOption+'"]').val() || jQuery(el).find('option:first-child').val();
				jQuery(el).val(selectedOptionVal);
			}
		}
	});	
	applySelect2ForAllVisibleWidgets();
}
var maxCols = 2;

function constructDefaultDimensions(baseObj){
	var allWidgetElems = jQuery('.gridster>ul>li');	
	var defaultWidgetDimensions = {};
	var customWidgetDimensions = {};
	var externalWidgetDimensions = {};
	var RemovedWidgetDimensions = {};
	var removedUrlWidgetDimensions = {};
	var rowVal = 1;
	if(baseObj && baseObj.properties && baseObj.properties.max_cols){
		maxCols = baseObj.properties.max_cols
	}else{
		maxCols = 2;
	}
	if(isMSPOrSCP && jQuery("#activeViewId").val() == 'MSP_Executive') {
		defaultWidgetDimensions = JSON.parse('{"33":[8,4,3,3],"44":[11,1,3,3],"34":[8,1,3,3],"45":[11,4,3,3],"35":[5,4,3,3],"46":[2,4,3,3],"36":[5,1,3,3],"47":[14,1,3,3],"37":[1,1,1,1],"48":[17,1,3,3],"38":[1,2,1,1],"39":[1,3,1,1],"40":[1,4,1,1],"41":[1,5,1,1],"42":[1,6,1,1],"32":[2,1,3,3],"43":[14,4,3,3]}');
		maxCols = 6;
	}else{
	jQuery(allWidgetElems).each(function(i, elem){
		var widgetDimension = [];
		var col = i%maxCols + 1;
		var widgetId = jQuery(elem).attr('data-widgetid');
		widgetDimension.push(rowVal);//Row
		widgetDimension.push(col);//Column
		widgetDimension.push(1);//size_x
		widgetDimension.push(1);//size_y
		if(col == maxCols){
			rowVal++;
		}
		if(jQuery(elem).attr('data-widgettype') == "2"){
			defaultWidgetDimensions[widgetId] = widgetDimension;    //{WidgetId : [row,column, size_x,size_y]}
		} 
		else if (jQuery(elem).attr('data-name') === 'Requests Custom Filter') {
			removedUrlWidgetDimensions[widgetId] = widgetDimension;
		}
		else if(jQuery(elem).attr('data-widgettype') == "1") {
			defaultWidgetDimensions[widgetId] = widgetDimension;    //{WidgetId : [row,column, size_x,size_y]}
		}
		else if(jQuery(elem).attr('data-widgettype') == "3") {
			RemovedWidgetDimensions[widgetId] = widgetDimension;    //{WidgetId : [row,column, size_x,size_y]}
		}
		else if (jQuery(elem).attr('data-external') == "true") {
			externalWidgetDimensions[widgetId] = widgetDimension;
		}
	});
	}
	var finalExtUrlInfo = {};
	var dimensionJson = {"DefaultWidgets" : defaultWidgetDimensions, "CustomWidgets": customWidgetDimensions, "ExternalWidgets" : externalWidgetDimensions, "RemovedWidgets": removedUrlWidgetDimensions, "RemovedDefaultWidgets":RemovedWidgetDimensions};    //No I18n
	if(baseObj && baseObj.urlinfo && baseObj.urlinfo.ExtUrlInfo){
		finalExtUrlInfo = baseObj.urlinfo.ExtUrlInfo;
	}
	var resultJson = {
		"diminfo" : dimensionJson, 	//No I18n
		"urlinfo" : { // No I18N
			"ExtUrlInfo" : finalExtUrlInfo, //No I18N
			"RemovedExtUrlInfo" : [] //No I18N
		},
		"properties" : { // No I18N
			"max_cols" : maxCols, // No I18N
			"bgColor": 1, // No I18N
			"isWideLayout":true // No I18N
		}
	};
	return function() {
		return resultJson;
	}
}
function configureSiteAndSupportGroupForView(hasReqModuleReports,hasChangeModuleReports){
	jQuery(".site-selection-container , .group-selection-container").addClass("hide");
	$dash.newWidgets.showFilterInfo = ((sdp_user.USERTYPE=='Technician') && (hasReqModuleReports == "true" || hasChangeModuleReports == "true"));
	jQuery("#dashOrganizeSection #siteGroupInfo").addClass("hide");
	if(hasReqModuleReports == "true"){
		jQuery('.site-selection-container').removeClass('hide');
		jQuery('.group-selection-container').removeClass('hide');
	}
	else if(hasChangeModuleReports == "true"){
		jQuery('.site-selection-container').removeClass('hide');
	}
}

DashboardPermission = function( meta_data ) {
	var am_i_tech = ( meta_data.USERTYPE.toUpperCase() == "technician".toUpperCase() ); // No I18N
	var allRoles = meta_data.ROLES.map(function(value,index){
		return value.toUpperCase();
	});
	var isSDAdmin = (allRoles.indexOf("SDADMIN") != -1);
	var isSDSiteAdmin = (allRoles.indexOf("SDSITEADMIN") != -1);
	var isSDCoordinator = (allRoles.indexOf("SDCO-ORDINATOR") != -1);
	var isProjectAdmin = (allRoles.indexOf("PROJECT ADMIN") != -1);
	var IS_PRIVATE = 0 , IS_PUBLIC = 1 , IS_OWNER = 2 ;
	/* PRIVATE: */

	/* PUBLIC: */
	this.settingsChooserVisibilityDecider = function($tab) {
		if($tab.length==0) {
			return;
		}
		var permission = $tab.data("perm"); // No I18N
		var isPrivate = ((permission>>IS_PRIVATE)%2) == 1;
		var isPublic = ((permission>>IS_PUBLIC)%2) == 1;
		var isOwner = ((permission>>IS_OWNER)%2) == 1;
		var isDefault = (!isPrivate) && (!isPublic);
		var isShared = (isPrivate) && (isPublic);


		var $settings = jQuery(".dashbdsett");
		var $newDashboard = $settings.find("a[data-name='addDashbrd']");
		var $addWidget = $settings.find("a[data-name='addWidget']");
		var $organiseWidget = $settings.find("a[data-name='organiseWidget']");
		var $editDashbrd = $settings.find("a[data-name='editDashbrd']");
		var $shareDashbrd = $settings.find("a[data-name='shareDashbrd']");
		var $deleteDashbrd = $settings.find("a[data-name='deleteDashbrd']");
		var $dashboardSettings = $settings.find("a[data-name='settDashboard']");
		
		function changeVisibility(new_state) {
			var buttons = [$newDashboard , $addWidget, $organiseWidget , $editDashbrd , $deleteDashbrd , $shareDashbrd ,  $dashboardSettings];
			for(var i = 0 ; i < buttons.length ; i++ ){
				if(new_state[i]) {
					buttons[i].css("opacity","").data("isNotPermitted",false).removeAttr("title"); // No I18N
				}
				else {
					buttons[i].css("opacity","0.5").data("isNotPermitted",true).attr("title",translate("sdp.dashboard.common.messages.limitedpermission") ); // No I18N
				}
			}
		}
		if(isOwner) {
			/* isOwner is same as private dashboard */
			if ( isSDAdmin || isSDSiteAdmin ) {
				changeVisibility([true,true,true,true,true,true,true]);
			}
			else
			{
				changeVisibility([true,true,true,true,true,false,true]);
			}
			return;
		}
		if(isDefault) {
			if ( isSDAdmin || isSDSiteAdmin ) {
				changeVisibility([true,true,true,false,false,true,true]);
			}
			else if( isProjectAdmin && $tab.attr("data-view").toUpperCase() == "PROJECTHOME" ) {
				changeVisibility([true,true,true,false,false,false,true]);
			}
			else if( isSDCoordinator ) {
				if($tab.attr("data-view") && $tab.attr("data-view").toUpperCase() == "DASHBOARD1") {
					changeVisibility([true,true,true,false,false,false,true]);
				}
				else {
					changeVisibility([true,false,false,false,false,false,true]);
				}
			}
			else if(am_i_tech){
				changeVisibility([true,false,false,false,false,false,true]);
			}
			else if(!am_i_tech) {
				changeVisibility([false,false,false,false,false,false,false]);
			}
		}
		else if(isShared) {
			if(isSDAdmin || isSDSiteAdmin) {
				changeVisibility([true,true,true,true,true,true,true]);
			}
			else {
				changeVisibility([true,false,false,false,false,false,true]);
			}
		}
		else if(isPublic) {
			if(isSDAdmin || isSDSiteAdmin) {
				changeVisibility([true,true,true,true,true,true,true]);
			}
			else if(am_i_tech) {
				changeVisibility([true,false,false,false,false,false,true]);
			}
			else {
				changeVisibility([false,false,false,false,false,false,false]);
			}
		}
		else if(!isDefault && !isOwner && !isShared && isPrivate) {
			//If it is Widget shared Dashboard
			changeVisibility([true,false,false,false,false,false,true]);
		}
	}
	this.viewChangeEvent = function($tab){
		if(jQuery(".dashboard-actions-dropdown").length)
		{
			this.settingsChooserVisibilityDecider($tab);
		}
	}
}
DashboardPermission.encodePermission = function(data){
	var encodedPermission = 0;
	if(data.isOwnView) {
		encodedPermission++;
	}
	encodedPermission = encodedPermission << 2; 
	if(data.isDefaultView) {
		encodedPermission += 0;
	}
	else if(data.isPrivate) {
		encodedPermission += 1;
	}
	else if(data.isPublic) {
		encodedPermission += 2;
	}
	else if(data.isShared) {
		encodedPermission += 3;
	}
	return encodedPermission;
}
DashboardPermission.decodePermission = function(encodedPermission){
	var data = {};
	var shareInfo = encodedPermission % 100;
	data.isShared = false;
	data.isPublic = false;
	data.isPrivate = false;
	data.isDefaultView = false;
	if(shareInfo == 3) {
		data.isShared = true;
	}
	else if(shareInfo == 2){
		data.isPublic = true;
	}
	else if(shareInfo == 1) {
		data.isPrivate = true;
	}
	else {
		data.isDefaultView = true;
	}
	encodedPermission = encodedPermission>>2;
	if(encodedPermission % 10 == 1) {
		data.isOwnView = true;
	}
	return data;
}

//Latest dashboard changes
var dashboardComp = {
  enabled: true,
  moduleName: -1,
  widgetDiv: -1,
  openReq: sdp_user.USERTYPE=="Requester" ? "Open_Requester" : "Open_System", //No I18N
  allReq: sdp_user.USERTYPE=="Requester" ? "All_Requester" : "All_Requests", //No I18N
  slaVioReq: sdp_user.USERTYPE=="Requester" ? "Overdue_Requester" : "Overdue_System", //No I18N
  allCompleted: sdp_user.USERTYPE=="Requester" ? "All_Completed_Requester" : "All_Completed", //No I18N
  filter1: "#widgetDropdown_0", //No I18N
  filter2: "#widgetDropdown_1", //No I18N
  isOverDue: "is_overdue", //No I18N

  chartTypes: {
  	StackedBar: [10],
  	HorizontalBar: ["Bar", "Rotated"], //No I18N
  	StepLine: ["Line", "Stepline"], //No I18N
  	Doughnut: ["Pie", "Doughnut"], //No I18N
  	//Reports graph types
	Pie3DFusionChart: ["Pie"], //No I18N
	Bar3DFusionChart: ["Bar", "Rotated"],  //No I18N
	Column3D: ["Bar"], //No I18N
	StackedBar3DFusionChart: [10], 
	MSLineChart: ["Line"], //No I18N
	MSAreaChart: ["Area"], //No I18N
	Doughnut3D: ["Pie", "Doughnut"], //No I18N
  },
  graphType: -1,
  widgetApiInfo: {},
  timePeriod: {
  	dayname: ["", translate("sdp.days.short.sun"), translate("sdp.days.short.mon"), translate("sdp.days.short.tue"), translate("sdp.days.short.wed"), translate("sdp.days.short.thu"), translate("sdp.days.short.fri"), translate("sdp.days.short.sat")], //No I18N
  	month: ["", translate("sdp.Jan"), translate("sdp.Feb"), translate("sdp.Mar"), translate("sdp.Apr"), translate("sdp.May"), translate("sdp.Jun"), translate("sdp.Jul"), translate("sdp.Aug"), translate("sdp.Sep"), translate("sdp.Oct"), translate("sdp.Nov"), translate("sdp.Dec")], //No I18N
  	weekDays: [],
  	personalizedDate: new Date()
  },
  chartGroup: {
  	singleSeries: ["Bar", "Pie", "Line", "Area", "Doughnut", "Funnel", "Pyramid", "HorizontalBar"], //No I18N
  	multiSeries: ["Bar", "StackedBar", "Line", "Area", "StepLine", "HorizontalBar"] //No I18N
  },
  inputData: {}, supportGroups: {},
  defaultDashboard: {Dashboard1: "requests", ProjectHome: "projects", assetHome: "assets", helpdesk: "requests", project: "projects"}, // No I18N
  apiWidgetsList: ["PendingProjByPriorityNType", "PendingProjBySiteNDept", "ProjectCreatedNClosed", "projByStatus", "OverdueNDueProjByOwner", "ProjectDueThisMonth", "ProjHourNCostVioaltionByOwner", "ProjectDelayedNOnSchedule", "MilestoneDueThisWeek", "All_Assets", "WorkStations", "PO_Contracts", "POSummaryDetails", "ContractSummaryDetails", "ChangeChart", "ChangeOpenChart", "ChangeUnapprovedChart"], //NO I18N
  dashAPIWidgetsList: ["RequestSummaryByTime", "OpenRequestPieChart", "SLAViolatedChart", "NewOpenRequests", "SLAViolatedOpenChart", "ApproachingSLA", "RequestReceived", "RequestClosed", "OLAViolatedOpenChart", "ApproachingOLA", "OLAViolatedChart", "RequestsInflowByTime"], //No I18N
  // ["Software", "ProblemChart"] are the sdp widgets others are MSP and SCP widgets, they use old flow.
  oldDataWidgetsList: (!isMSPOrSCP)?["Software", "ProblemChart"]:["Software", "ProblemChart","Revenue","TimeSpent","TopServices_TimeSpent","CSAT","CSAT_Tech","RequestFlow","TechTimeSpent","ReqSerTimeSpent","Contract_Revenue","SLARequests","WorklogCost","RequestsVsProducts","TopAccount_Product","TopAccount_Req","TopContacts_Req","RequestsVsContracts","BURequestsBySLA","BUInboundRequests","AccountsByTimeZone","AccountsByIndustry","ORByAccount","AccountAndContactSummary","ContractExpirySummary","ContractCreationSummary","BUPendingRequestsByStatus","BUPendingRequestsBySrep","BUContractSummary","RequestApprochingFRSLA","RecentSolutions","RequestApprochingSLA","ApprovalPendingSolutions"],  // No I18N 
  newTabWidgetsList: ["PendingProjByPriorityNType", "PendingProjBySiteNDept", "OverdueNDueProjByOwner", "ProjHourNCostVioaltionByOwner", "projByStatus", "ProjectDueThisMonth", "ProjectCreatedNClosed", "ProjectDelayedNOnSchedule", "PO_Contracts", "POSummaryDetails", "ContractSummaryDetails"], // No I18N
  noClickWidgets: ["MilestoneDueThisWeek", "ChangeChart", "ChangeOpenChart", "ChangeUnapprovedChart", "ProblemChart"], // No I18N
  filters: {"project type": "type"}, // No I18N
  colors: ["#04C36B","#3A92E9","#FDC33A","#D65587","#FF465B","#FC7C63","#51A5A9","#BFBFBF","#91CD6A","#BE9B89","#7D8DB0","#B68E2E","#C6D5B0","#D1ACCE","#E0AE60","#5CD29F","#716398","#AD8686","#FF99A8","#A0C0C0","#2D7094","#553D4E","#B2449D","#FED577","#D3D159","#AAAAAA","#7ED9D9","#F7A26D","#8ABFA2","#767676","#E36068","#A3AFC7"], // No I18N
  defaultWidgetTypes: {NewOpenRequests: ["Dial"], OpenRequestPieChart: ["Pie"], SLAViolatedOpenChart: ["Dial"], ApproachingSLA: ["Dial"], RequestReceived: [10], RequestClosed: [10],SLAViolatedChart: ["Bar"], OLAViolatedOpenChart: ["Dial"], ApproachingOLA: ["Dial"], OLAViolatedChart: ["Bar", "Rotated"], RequestSummaryByTime: [10], RequestsInflowByTime: [10]},
  defaultWidgetColors: {NewOpenRequests: ["#FDC33A"], SLAViolatedOpenChart: ["#FF465B"], ApproachingSLA: ["#ff0000", "#f3aa00", "#ede741"], RequestReceived: ["#FF465B","#04C36B"], RequestClosed: ["#FF465B","#04C36B"], OLAViolatedOpenChart: ["#ff8f2e"], ApproachingOLA: ["#ff0000", "#f3aa00", "#ede741"], RequestSummaryByTime: ["#3A92E9", "#04C36B", "#FF465B"], RequestsInflowByTime: ["#3A92E9", "#04C36B", "#FF465B"]}, //NO I18N
  dialWidgetsList: ["SLAViolatedOpenChart", "OLAViolatedOpenChart", "ApproachingSLA", "ApproachingOLA", "NewOpenRequests"],//NO I18N
  oldDataSingleSeries :(isMSPOrSCP) ? ["TopServices_TimeSpent","CSAT_Tech","CSAT","AccountsByIndustry","RequestsVsProducts","RequestsVsContracts","BUInboundRequests","BURequestsBySLA","TopAccount_Product","TopAccount_Req","TopContacts_Req","AccountsByTimeZone"]:[], //NO I18N
  // Dial widgets have no filters. This is the list of dial widgets.
  noFilterDialWidgets: ["SLAViolatedOpenChart", "OLAViolatedOpenChart", "NewOpenRequests"],//NO I18N
  // TitleInfo for widgets to used to construct filters on listview popup
  defaultWidgetTitleInfo: {
	  RequestsBy: {
		  label: ["", translate("sdp.itil.common.status")],
		  itemFilterFirst: false
	  },
	  RequestSummaryByTime: {
		  label: [translate("common.type"), translate("sdp.project.milestoneattribute.duration")],
		  itemFilterFirst: true
	  },
	  NewOpenRequests: {
		  label: [translate("common.type")],
		  itemFilterFirst: false
	  },
	  ApproachingSLA: {
		  label: [translate("sdp.common.next")],
		  itemFilterFirst: false
	  },
	  RequestReceived: {
		  label: [translate("sdp.admin.sla.title"), translate("common.single.day")],
		  itemFilterFirst: true
	  },
	  RequestClosed: {
		  label: [translate("sdp.admin.sla.title"), translate("common.single.day")],
		  itemFilterFirst: true
	  },
	  ApproachingOLA: {
		  label: [translate("sdp.common.next")],
		  itemFilterFirst: false
	  },
	  RequestsInflowByTime: {
		  label: [translate("common.type"), translate("sdp.project.milestoneattribute.duration")],
		  itemFilterFirst: true
	  },
	  All_Assets: {
		  label: [translate("common.type"), ""],
		  itemFilterFirst: true
	  }
	},

  //Initializing the public api widgets criteria and chart type
  loadAPIInfo: function(widgetName) {
  	let info = [], filterMap = {}, selectedFilter, filter, apis, startTime, endTime;
  	let today = new Date();
  	this.isSiteGroupFilterEnabled = false;
  	switch(widgetName) {
		//Project by Type
		case 'PendingProjByPriorityNType': //No I18N
		case 'PendingProjBySiteNDept': //No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value").toLowerCase(); //No I18N
			filter = filter=='projecttype'?'type':filter; //No I18N
			info = {
				api: [{criteria: [{"status.completed": false}], group_by: [filter], xAxis: [filter]}],
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'ProjectCreatedNClosed': // No I18N
			info = {
				api: [
					{criteria: [{created_time: "$(this_year)"}], group_by: ["created_time:month"], xAxis: ["created_time:month"], seriesname: translate("sdp.requests.history.created")},
					{criteria: [{actual_end_time: "$(this_year)"}, {"status.internal_name": "Closed"}], group_by: ["actual_end_time:month"], xAxis: ["actual_end_time:month"], seriesname: translate("sdp.admin.projectstatus.completed")}
				],
				chart: {type: [10], group: this.chartGroup.multiSeries}
			};
			break;

		case 'projByStatus': // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value"); //No I18N
			apis = {
				Due: {criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "gte"}, {scheduled_end_time: null, operator: "or", condition: "eq"}]}], group_by: ["status", "priority"], xAxis: ["status"], yAxis: ["priority"]}, // No I18N
				Overdue: {criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "lt"}]}], group_by: ["status", "priority"], xAxis: ["status"], yAxis: ["priority"]} // No I18N
			};
			info = {
				api: [apis[filter]],
				chart: {type: [10], group: this.chartGroup.multiSeries}
			};
			break;

		case 'OverdueNDueProjByOwner': // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value"); //No I18N
			apis = {
				Due: {criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "gte"}, {scheduled_end_time: null, operator: "or", condition: "eq"}]}], group_by: ["owner"], xAxis: ["owner"]}, // No I18N
				Overdue: {criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "lt"}]}], group_by: ["owner"], xAxis: ["owner"]} // No I18N
			};
			info = {
				api: [apis[filter]],
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'ProjectDueThisMonth': // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value"); // No I18N
			filter = "$("+filter+")";
			info = {
				api: [{criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "gte"}, {scheduled_end_time: null, operator: "or", condition: "eq"}, {scheduled_end_time: filter}]}], group_by: ["scheduled_end_time:day"], xAxis: ["scheduled_end_time:day"]}], // No I18N
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'ProjHourNCostVioaltionByOwner': // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value").toLowerCase(); //No I18N
			info = {
				api: [{filter_by: filter+"_violated", criteria: [{"status.internal_name": "Closed"}], group_by: ["owner"], xAxis: ["owner"]}], // No I18N
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'ProjectDelayedNOnSchedule': // No I18N
			let startTime = new Date(new Date().setMonth(new Date().getMonth()-5));
			startTime = new Date(startTime.getFullYear(), startTime.getMonth(), 1);
			let endTime = new Date(startTime);
			endTime.setMonth(endTime.getMonth()+6);
			info = {
				api: [
					{filter_by: "completed_ontime", criteria: [{"status.internal_name": "Closed", children:[{actual_end_time: startTime.getTime(), condition: "gte"},{actual_end_time: endTime.getTime(), condition: "lt"}]}], group_by: ["actual_end_time:month"], xAxis: ["actual_end_time:month"], seriesname: translate("sdp.projects.daydiff.ontime")}, // No I18N
					{filter_by: "completed_offtime", criteria: [{"status.internal_name": "Closed", children:[{actual_end_time: startTime.getTime(), condition: "gte"},{actual_end_time: endTime.getTime(), condition: "lt"}]}], group_by: ["actual_end_time:month"], xAxis: ["actual_end_time:month"], seriesname: translate("sdp.dashboard.project.delayed")} // No I18N
				],
				chart: {type: [10], group: this.chartGroup.multiSeries} 
			};
			break;

		case 'MilestoneDueThisWeek': // No I18N
			this.moduleName = "milestones"; // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("value"); // No I18N
			filter = "$("+filter+")";
			info = {
				api: [{criteria: [{"status.completed": false, children:[{scheduled_end_time: "$(current_time)", condition: "gte"}, {scheduled_end_time: null, operator: "or", condition: "eq"}, {scheduled_end_time: filter}]}], group_by: ["scheduled_end_time:dayname"], xAxis: ["scheduled_end_time:dayname"]}], // No I18N
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'All_Assets': // No I18N
			this.moduleName = "asset_assets" // No I18N
			filterMap = {ResourcesBySite: (isMSP)?"account":"site", ResourcesByRegion: "region", ResourcesByState: "state"}; // No I18N
			selectedFilter = this.widgetDiv.find(this.filter1).find("option:selected").data('value'); // No I18N
			filter = filterMap[selectedFilter];
			if(isIThelpdesk == "true"){
			info = {
				api: [
						{criteria: [{"asset_type.name": "Asset", children: [{"asset_category.name": "IT"}]}], group_by: [filter], xAxis: [filter], seriesname: translate("sdp.inventory.breadcrumb.itassets")}, // No I18N
						{criteria: [{"asset_type.name": "Component"}], group_by: [filter], xAxis: [filter], seriesname: translate("sdp.inventory.listviewWS.components")}, // No I18N
						{criteria: [{"asset_type.name": "Asset", children: [{"asset_category.name": "Non-IT"}]}], group_by: [filter], xAxis: [filter], seriesname: translate("sdp.inventory.breadcrumb.nonitassets")}, // No I18N
				],
				chart: {type: [10], group: this.chartGroup.multiSeries}
			};
			}else{
				info = {
					api: [
						{criteria: [{"asset_type.name": "Component"}], group_by: [filter], xAxis: [filter], seriesname: translate("sdp.inventory.listviewWS.components")}, // No I18N
						{criteria: [{"asset_type.name": "Asset", children: [{"asset_category.name": "Non-IT"}]}], group_by: [filter], xAxis: [filter], seriesname: translate("sdp.inventory.breadcrumb.nonitassets")}, // No I18N
					],
					chart: {type: [10], group: this.chartGroup.multiSeries}
				};
			}

			break;

		case 'WorkStations': // No I18N
			this.moduleName = "asset_computers"; // No I18N
			filterMap = {"WSByOS": "os_name", "WSByManufacturer": "manufacturer", "WSByDomain": "domain", "WSByDepartment": "department", "WSBySite": (isMSP)?"account":"site", "WSByRegion": "region", "WSByStates": "state"}; // No I18N
			selectedFilter = this.widgetDiv.find(this.filter1).find("option:selected").data('name'); //No I18N
			filter = filterMap[selectedFilter];
			let groupBy = filter;
			if(typeof filter == 'object') {
				groupBy = filter[1];
			}

			info = {
				api: [{criteria: [{"state.name": "Disposed", condition: "is not"}], group_by: [groupBy], xAxis: filter}], // No I18N
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		case 'PO_Contracts': // No I18N
		case 'POSummaryDetails': // No I18N
		case 'ContractSummaryDetails': // No I18N
			filter = this.widgetDiv.find(this.filter1).find(":selected").data("name"); // No I18N
			this.moduleName = "purchase_orders"; // No I18N
			if(filter=='ContractSummary' || widgetName=='ContractSummaryDetails') {
				this.moduleName = "contracts"; // No I18N
			}

			apis = {
				purchase_orders: [
					{filter_by: "Overdue", xAxis: translate("sdp.puchase.POListAct.select6"), seriesname: "OverduePOs"}, // No I18N
					{filter_by: "PODueFor7days", xAxis: translate("sdp.puchase.POListAct.select7"), seriesname: "PODueFor7days"}, // No I18N
					{filter_by: "PODueFor30days", xAxis: translate("sdp.puchase.POListAct.select8"), seriesname: "PODueFor30days"}, // No I18N
				],
				contracts: [
					{filter_by: "ExpiredInLast7", group_by: ["contract_status"], xAxis: translate("sdp.home.global.contract.expired.description"), seriesname: "Recent_Expired_Contract"}, // No I18N
					{filter_by: "ExpiredInNext7", group_by: ["contract_status"], xAxis: translate("sdp.home.global.contract.duenext7.title"), seriesname: "Contract_Expiring_In_7days"}, // No I18N
					{filter_by: "ExpiredInNext30", group_by: ["contract_status"], xAxis: translate("sdp.home.global.contract.duenext30.title"), seriesname: "Contract_Expiring_In_30days"}, // No I18N
				],
			};
		
			info = {
				api: apis[this.moduleName],
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries, colors: ["#FF465B", "#3A92E9", "#04C36B"]} //No I18N
			};
			this.PO_RESPONSE_COUNT = 0;
			this.isPOWidget = true;
			break;

		
		case 'ChangeChart': //Approved Changes by Type //No I18N
		case 'ChangeOpenChart': //Open changes by type //No I18N
		case 'ChangeUnapprovedChart': //UnApproved Changes by Type //No I18N
			this.isSiteGroupFilterEnabled = true;
			this.moduleName = "changes"; //No I18N
			selectedFilter = this.widgetDiv.find(this.filter1).find(":selected").data("value").toLowerCase(); //No I18N
			selectedFilter = selectedFilter=='changetype'?'change_type':selectedFilter; //No I18N
			filter = this.widgetDiv.find("[name=time]").find(":selected").data("value"); //No I18N
			filter = "$("+filter+")";  //No I18N

			let apiDetails;
			if(widgetName=='ChangeChart') {
				apiDetails = [{filter_by: "approved_changes", criteria: [{scheduled_start_time: filter, condition: "lte" }, {scheduled_end_time: filter, condition: "gte"}], group_by: [selectedFilter], xAxis: [selectedFilter]}]; //No I18N
			}
			else if(widgetName=='ChangeOpenChart') {
				apiDetails = [{filter_by: "open_changes", criteria: [{scheduled_start_time: filter, condition: "lte" }, {scheduled_end_time: filter, condition: "gte"}], group_by: [selectedFilter], xAxis: [selectedFilter]}]; //No I18N
			}
			else if(widgetName=='ChangeUnapprovedChart') {
				apiDetails = [{filter_by: "open_changes", criteria: [{"approval_status.name": "Pending Approval"}, {scheduled_start_time: filter, condition: "lte" }, {scheduled_end_time: filter, condition: "gte"}], group_by: [selectedFilter], xAxis: [selectedFilter]}]; //No I18N
			}
			info = {
				api: apiDetails, 
				chart: {type: ["Bar"], group: this.chartGroup.singleSeries} //No I18N
			};
			break;

		default:
			return false;
	}
	info.chart.name = widgetName;
	this.widgetApiInfo = info;
	info.api = this.updateFilters(info.api);
	this.updateGraphType(info);

	this.eventHandler = this.openURL;
	if(this.newTabWidgetsList.indexOf(widgetName)!=-1) {
		this.eventHandler = this.openTab;
	}
	else if(this.noClickWidgets.indexOf(widgetName)!=-1) {
		this.eventHandler = undefined;
	}
	return true;
  },

  //Update the widget filters selected values in the API Criteria
  updateFilters: function(widgetApiInfo) {
  	let dynamicFields = ["criteria", "group_by", "xAxis"]; //No I18N
  	for(let filter of widgetApiInfo) {
  		if(filter.list_info) {
  			continue;
  		}
  		for(let df of dynamicFields) {
  			if(filter[df] && typeof filter[df]=='object') { 
	  			for(let i=0;i<filter[df].length;i++) { 
	  				let node = filter[df][i];
	  				if(typeof node == "string") {
  						if(node.startsWith("#widgetDropdown")) {
  							let val = this.widgetDiv.find(node).val().toLowerCase();
  							if(this.filters[val]) {
  								val = this.filters[val];
  							}
  							filter[df][i] = val;
  						}
  						else if(node.endsWith('_time:')) {
  							let selTime = this.widgetDiv.find("#widgetDropdown_0").find(":selected").data("value"); //No I18N
	  						let groupBy = "";
	  						if(selTime.endsWith('_year')) {
	  							groupBy = "month"; //No I18N
	  						}
	  						else if(selTime.endsWith('_month')) {
	  							groupBy = "day"; //No I18N
	  						}
	  						else if(selTime.endsWith('_week')) {
	  							groupBy = "dayname"; //No I18N
	  						}
	  						else if(selTime.endsWith('_days')) {
	  							groupBy = "day"; //No I18N
	  						}
	  						filter[df][i] = node+groupBy;
	  					}
  					}
  					else {
		  				for(let field in node) {
		  					if(typeof node[field]=='string') {
		  						if(node[field].startsWith("#widgetDropdown")) {
		  							let selTime = this.widgetDiv.find(node[field]).find(":selected").data("value"); //No I18N
			  						node[field] = "$("+selTime+")";
			  					}
			  				}
		  				}
		  			}
	  			}
	  		}
  		}
  	}
  	return widgetApiInfo;
  },

  //update the Graph type of a widget from Personalization
  updateGraphType: function(info) {
  	let graphType;
		let dashboardId = this.getDashboardId();
		let personalizedData = sdp_user.CLIENT_CONF["WidgetGraphType-"+dashboardId+"_"+this.widgetName]; //No I18N
		if(personalizedData && personalizedData["graphType"]) {
			graphType = personalizedData["graphType"];
		}
		if($dash.embed.isSingleWidget) {
			let sharedGraph = getSDPURLParams().graph;
			if(sharedGraph) {
				graphType = sharedGraph;
			}
		}
		if(graphType) {
			if(this.chartTypes[graphType]) {
				this.graphType = this.chartTypes[graphType];
			}
			else {
				this.graphType = [graphType];
			}
			this.graphType.selected = graphType;
		}
		else {
			this.graphType = info.chart.type;
			this.graphType.selected = info.chart.type[0];
		}
  },

  //Function to load a public or dashboard API Widget
  loadZChart: function(widgetdiv) {
  	this.widgetDiv = widgetdiv.parents("li.gs-w"); //No I18N
  	this.widgetName = this.widgetDiv.find(".widget-bg").data('widgetname'); //No I18N
  	this.widgetDiv.find(".widget-summaryrequests-list>div").html('<div class="pos-abs fw fh">'+ajaxBar()+'</div>');

  	let viewId = jQuery("#headerbar #view-listing .active").data('viewid'); // No I18N
  	this.moduleName = this.defaultDashboard[viewId];
  	if(!this.moduleName) {
  		let module = widgetdiv.data("module"); // No I18N
  		this.moduleName = this.defaultDashboard[module];
  	}

  	if(this.dashAPIWidgetsList.indexOf(this.widgetName)!=-1) {
			this.getDataProcessDashAPI();
			dashboardComp.inputData = {};
  	}
  	else {
		let isValid = this.loadAPIInfo(this.widgetName);
		if(isValid==false) {
			return;
		}
		this.clearInputData(this.widgetName);
		this.createChartTypeDropdown(this.widgetDiv.find('div.widget-header'));
		this.process();
	}
  },

  //To clear the inputData
  clearInputData: function(widgetName) {
  	for(let key in this.inputData) {
  		if(key.startsWith(widgetName+"_")) {
  			delete this.inputData[key];
  		}
  	}
  },

  //Go through the public API of a widget and make calls with site and group criteria
  process: function() {
  	let baseCriteria= [];
  	if(this.widgetApiInfo.api[0].list_info) {
  		baseCriteria = this.widgetApiInfo.api[0].list_info.search_criteria
  	}
  	
  	if(sdp_app.IS_SDP) { //AE does have site and group filter
	  	let groupField = "group.name"; //No I18N
	  	let siteId = jQuery("#siteSelection").val(); //No I18N
	  	let isSiteFilterAvailable = !jQuery("#siteSelection").parents(".site-selection-container").hasClass("hide"); //NO I18N
	  	isSiteFilterAvailable = this.isSiteGroupFilterEnabled ? isSiteFilterAvailable : false;
	  	if(siteId && siteId!="0" && isSiteFilterAvailable) {
	  		if(siteId=="-1") {
	  			baseCriteria.push(this.addCriteria({"site": [null]}));
	  		}
	  		else {
	  			baseCriteria.push(this.addCriteria({"site.id": siteId}));
	  		}
	  		groupField = "group.id"; //No I18N
	  	}

	  	let isGroupFilterAvailable = !jQuery("#groupSelection").parents(".group-selection-container").hasClass("hide"); //NO I18N
	  	isGroupFilterAvailable = this.isSiteGroupFilterEnabled ? isGroupFilterAvailable : false;
	  	if(isGroupFilterAvailable) {
		  	let selectedGroups = jQuery("#groupSelection").select2("data"); //No I18N
		  	let groupIds = [];
		  	for(let group of selectedGroups) {
		  		groupIds.push(""+group.id);
		  	}
		  	if(groupIds.length>0) {
		  		let groupCrit = {};
		  		groupCrit[groupField] = groupIds;
		  		baseCriteria.push(this.addCriteria(groupCrit));
		  	}
			}
		}

  	let zCData = { categories: {}, chartData: [] };
  	this.apiIndex=0; 
  	this.seriesNamesInOrder=[];
  	for(let apiDetails of this.widgetApiInfo.api) {
  		let criteria = [];
  		if(apiDetails.criteria) {
	  		for(let node of apiDetails.criteria) {
	  			let crit = this.addCriteria(node);
	  			criteria.push(crit);
	  		}
	  	}
  		criteria = baseCriteria.concat(criteria);
  		this.getDataNProcess(apiDetails, criteria, zCData);
  	}
  },

  //Process the public API response and group it
  processAPIResponse: function(apiDetails, response, zCData) {
  	if(response) {
		response[this.moduleName] = this.groupData(response[this.moduleName], apiDetails);

		if(apiDetails.yAxis) {
			zCData = this.filterData(apiDetails, response[this.moduleName], zCData);
		}
		else {
			zCData = this.constructChartData(response[this.moduleName], zCData, apiDetails.xAxis, apiDetails.seriesname);
		}
  	}
  	if(this.isPOWidget) {
  		++this.PO_RESPONSE_COUNT;
  		if(this.PO_RESPONSE_COUNT<this.widgetApiInfo.api.length) {
  			return;
  		}
  	}
  	if(this.isGraphCustomWidget || zCData.chartData.length >= this.widgetApiInfo.api.length || this.isPOWidget) {
	  	let container = this.widgetDiv.find(".widget-summaryrequests-list > div")[0];
	    jQuery(container).empty();

	  	zCData = this.sortCategory(zCData);
	  	zCData = this.sortSeriesData(zCData);
	  	zCData = this.constructZohoChart(zCData);
	  	new $ZC.charts(container, zCData);
	  }
  },

  //Group data for Yaxis widgets
  filterData: function(apiDetails, data, zCData) {
  	let groupData = {};
	for(node of data) {
		let yAxisName = node.priority==null? translate("sdp.common.notassigned") : node.priority.name; //NO I18N
		if(groupData[yAxisName]) {
			groupData[yAxisName].push(node);
		}
	    else {
	    	groupData[yAxisName]=[node];
	    }
	}
	
	this.colors = [];
	for(yAxis in groupData) {
	    zCData = this.constructChartData(groupData[yAxis], zCData, apiDetails.xAxis, yAxis);
		this.seriesNamesInOrder.push(yAxis);
		if(groupData[yAxis][0].priority) {
			this.colors.push(groupData[yAxis][0].priority.color);
		}
		else {
			this.colors.push("#c0c0c0"); //NO I18N
		}
	}

	if(zCData.chartData.length==0) {
		zCData.chartData[0] = {seriesname: 'Not Assigned', data: [[]]}; //NO I18N
	}
	
	return zCData;
  },

  //zoho charts json data, category sorting for time based widget
  sortCategory: function(zCData) {
  	let categories = [];
  	let filter = this.widgetDiv.find(this.filter1).find(":selected").data('value'); //NO I18N
  	let widgetName = this.widgetApiInfo.chart.name;
  	let isLastNDays = false;
  	let today = this.getPersonalizedDate(new Date());
  	
  	if(widgetName=='ProjectDelayedNOnSchedule' || widgetName=='ProjectCreatedNClosed') {
  		//Last 6 months handling
		for(i=0;i>-6;i--,month--) { 
			if(i==0) {
				month = today.getMonth(); 
			} 
			if(month==-1) {
				month = 11;
			}
			categories.push(dashboardComp.timePeriod.month.slice(1)[month]);
		}
		categories.reverse();
		zCData.categories = categories;
		return zCData;
	}
  	if(filter) {
  		if(filter=='this_week' || filter=='last_week') {
  			zCData.categories = this.timePeriod.weekDays;
  			return zCData;
  		}
  		else if(filter=='this_year' || filter=='last_year') {
  			zCData.categories = this.timePeriod.month.slice(1);
  			if(filter=='this_year') {
  				zCData.categories = zCData.categories.slice(0, today.getMonth()+1);
  			}
  			return zCData;
  		}
  		else if(filter=='last_7_days' || filter=='last_30_days' || isLastNDays) {
  			let noDays = filter.split('_')[1];
  			for(let i=1;i<=noDays;i++) {
  				today.setDate(today.getDate()-1);
  				categories.push(""+today.getDate());
  			}
  			zCData.categories = categories.reverse();
  			return zCData;
  		}
  	}

  	if(this.isPOWidget) {
    	for(let crit of this.widgetApiInfo.api) { 
    		categories.push(crit.xAxis); 
    	}
    }
    else {
    	for(let cat in zCData.categories) {
	  		categories.push(cat);
	  	}
    }

  	zCData.categories = categories;
  	return zCData;
  },

  //zoho charts, series data sorting for time based widgets and sort the series based on the required order
  sortSeriesData: function(zCData) {
  	if(this.isGraphCustomWidget) {
  		return zCData;
  	}
  	let _this = this;
  	let widgetName = this.widgetApiInfo.chart.name;
  	let presetData = zCData.categories;
  	let isDialEmpty = true;
  	
  	for(let chartData of zCData.chartData) {
	  	let serName = chartData.seriesname;
	  	let data = chartData.data[0];
	  	if(serName.endsWith("_time:dayname") || serName.endsWith("_time:month") || serName.endsWith("_time:day")) {
	  		let availVals = [];
	  		for(let value of data) {
	  			availVals.push(value[0]);
	  		}
	  		if(availVals.length && availVals.length<presetData.length) {
	  			for(let value of presetData) {
	  				if(availVals.indexOf(value)==-1) {
	  					let node = [value, 0];
	  					node.id = -1;
	  					node.field = serName;
	  					data.push(node);
	  				}
	  			}
	  		}
	  		data.sort(function(a, b) {
	  			return presetData.indexOf(a[0]) - presetData.indexOf(b[0]);
	  		});
	  	}
	}

	//Sorting the data as the same API order
	let sortedChartData = [];
	for(let seriesname of this.seriesNamesInOrder) {
	    for(let chartData of zCData.chartData) {
	        if(chartData.seriesname==seriesname) {
	            sortedChartData.push(chartData);
	            break;
	        }
	    }
	}
	zCData.chartData = sortedChartData;

	if(this.isPOWidget) {
  		let sortedNodes = [];
	    for(let category of zCData.categories) {
		    for(let node of zCData.chartData[0].data[0]) {
		        if(node[0]==category) {
		            sortedNodes.push(node);
		            break;
		        }
		    }
		}
		zCData.chartData[0].data[0] = sortedNodes;
  	}

  	return zCData;
  },

  //Construct public API criteria based on the API info in loadAPIInfo
  addCriteria: function(node) {
	let childCrit = [];
	if(node.children) {
		for(let child of node.children) {
			childCrit.push(this.addCriteria(child));
		}
	}
	let condition = node.condition;
	let operator = node.operator;
	delete node.condition;
	delete node.operator;
	delete node.children;
	for(let field in node) {
	    let criteria = {
	      field: field,
	      condition: condition || "is", //No I18N
	      logical_operator: operator || "and" //No I18N
	    };

	    if(typeof node[field] == 'object') {
	    	criteria.values = node[field];
	    	criteria.condition = condition || "in"; //No I18N
	    }
	    else {
	    	criteria.value = node[field];
	    }
	    
	    if(childCrit.length) {
	    	criteria.children = childCrit;
	    }
	    return criteria;
	}
  },

  //Make public API Calls
  getDataNProcess: function(apiDetails, criteria, zCData) {
  	let _this = this;
  	if(criteria.length==1) {
  		criteria = criteria[0];
  	}
  	let input_data = {
		list_info: { 
			search_criteria: criteria, 
			group_by: apiDetails.group_by,
			row_count: 100, 
			get_total_count: true
		}
	};
	if(apiDetails.filter_by) {
		input_data.list_info.filter_by = {name: apiDetails.filter_by};
	}
  	else if(apiDetails.list_info) {
	  	input_data.list_info = apiDetails.list_info;
	}
	this.inputData[this.widgetApiInfo.chart.name+"_"+this.apiIndex] = input_data;
	this.apiIndex++;

	let apiName = this.apiName || this.moduleName;
	let apiUrl = '/api/v3/'+apiName; //No I18N
	if(!apiDetails.group_by) {
		apiUrl = apiUrl + "/_total_count" //No I18N
	}
  	let data;
  	sdpAjax({
		url: apiUrl,
		cache: false,
		data: {input_data: sdpToJSON(input_data), module: this.entityName},
		//Added for projects API to work
		headers: {"Accept": "vnd.manageengine.v3+json"}, //No I18N
		success: function(response) {
			data = response;
			if(!apiDetails.group_by && !_this.isGraphCustomWidget) {
				let count = [{"id:count": data["_total_count"][_this.moduleName]}];
				data[_this.moduleName] = count;
			}
			_this.processAPIResponse.call(_this, apiDetails, data, zCData);
		}
	});

  	//Storing series names to sort the data in order afte api response
  	if(!apiDetails.yAxis) {
		if(!apiDetails.seriesname) {
			if(typeof apiDetails.xAxis=='object') {
				apiDetails.seriesname = apiDetails.xAxis[0];
			}
			else {
				apiDetails.seriesname = apiDetails.xAxis;
			}
		}
		if(this.seriesNamesInOrder.indexOf(apiDetails.seriesname)==-1) {
			this.seriesNamesInOrder.push(apiDetails.seriesname);
		}
	}
  },

  //Get day of a date for time based widgets
  getDay: function(date) {
  	let days = ["sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; //NO I18N
    let weekDays = [];
    for(i=sdp_app.WEEK_START_DAY; i<sdp_app.WEEK_START_DAY+7; i++) {
        weekDays.push(days[i]);
    }
    return weekDays.indexOf(days[date.getDay()])
  },

  //Process and group the public api response data for time based widgets
  //Convert day wise data of a month to week wise
  groupData: function(data, apiDetails) {
  	if(this.isGraphCustomWidget) {
  		return data;
  	}
  	let filter = this.widgetDiv.find(this.filter1).find(":selected").data('value'); //NO I18N
	if(data.length && (filter=="last_month" || filter=="this_month" || filter=="next_month")) {
		let groupBy = apiDetails.group_by;
		let weekData = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
		let week = 1;
		for(let node of data) {
			if(this.widgetName=='ProjectDueThisMonth') {
				date = new Date();
				let filter = this.widgetDiv.find(this.filter1).find(":selected").data("value"); //No I18N
				if(filter == 'next_month') {
					date.setMonth(date.getMonth()+1);
				}
				date.setDate(node[groupBy]);

				let day = this.getDay(date);
			   	week = Math.ceil((date.getDate() - 1 - day) / 7)+1;
			}
			else {
				let date = node[groupBy];
				let offset = 0;
				if(date%7) {
					offset = 1;
				}
		  		week = Math.floor(date/7)+offset;
		  	}
	  		weekData[week] = parseInt(node['id:count']) + weekData[week];
	  	}
	  	data = [];
	  	var weekTxt = translate("sdp.home.week");
	  	for(let node in weekData) {
	  		if((node==5 && weekData[5]==0 && weekData[6]==0) || (node==6 && weekData[6]==0)) {
	  			continue;
	  		}
	  		let d = {"id:count": weekData[node]};
	  		d[groupBy] = weekTxt+" "+node;
	  		data.push(d);
	  	}
	}
	return data;
  },

  //Convert the API response data to zoho charts data
  constructChartData: function(data, zCData, axis, seriesName) {
	let xAxis = axis;
	if(typeof xAxis=='object') {
		xAxis = xAxis[0];
	}

	var chartN = {
		type: this.graphType[0],
		seriesname: seriesName ? seriesName : xAxis,
		data: [[]]
	};

	for(let node of data) {
		let xVal = "", yVal = parseInt(node["id:count"]);
		let paneId = -1, field = xAxis;
		let nodeObj = node[xAxis];
		if(xAxis.startsWith("udf_fields.") || xAxis.startsWith("cm_fields.")) {
			let field = xAxis.split(".");
			nodeObj = node[field[0]][field[1]];
		}
		else if(!nodeObj && node.udf_fields) {
			nodeObj = node.udf_fields[xAxis];
		}
		if(nodeObj) {
			if(typeof nodeObj=='object') {
				xVal = nodeObj.name;
				paneId = nodeObj.id;
				field = xAxis + ".id"; //No I18N
				if(xVal==undefined && axis[1]) {
					xVal = nodeObj[axis[1]];
					paneId = xVal;
					if(xVal==null) {
						xVal = translate("sdp.common.notassigned"); //No I18N
					}
					field = [xAxis]+"."+[axis[1]]; //No I18N
				}
			}
			else {
				if(xAxis.indexOf(":")!=-1) {
					let type = xAxis.split(":")[1];
					value = nodeObj;
					if(this.timePeriod[type]) {
						xVal = this.timePeriod[type][value];
					}
					else if(type=='week') {
						xVal = type+value;
					}
					else {
						xVal = value;
					}
				}
				else {
					xVal = nodeObj;
					paneId = xVal;
				}
			}
		}
		else {
			if(nodeObj===null || this.widgetName=='WorkStations') {
				xVal = translate("sdp.common.notassigned"); //No I18N
				paneId = null;
			}
			else {
				xVal = xAxis;
			}
		}

		let dataset = [xVal, yVal];
		dataset.id = paneId;
		dataset.field = field;
		dataset.link = node.link;
		dataset.criteria = node.criteria;
		chartN.data[0].push(dataset);
		zCData.categories[xVal]=true;
	}
	if(this.isPOWidget) {
		let dataset = chartN.data[0][0];
		if(dataset) {
			//For - Open in new tab url param
			dataset.field = seriesName;
			//Merging all 3 api response into 1 dataset
			if(zCData.chartData.length>0) { 
				zCData.chartData[0].data[0].push(dataset);
				return zCData;
			}
		}
		else if(zCData.chartData.length>0) {
			return zCData;
		}
	}
	zCData.chartData.push(chartN);
	return zCData;
  },

  //Finally construct the json data required for zoho charts to load
  constructZohoChart: function(zCData) {
  	var isFullScreen = this.widgetDiv.hasClass("fullScreen"); //No I18N
  	if(this.widgetApiInfo.chart.legend==undefined) {  
  		if(this.widgetApiInfo.chart.group==this.chartGroup.multiSeries || this.graphType[0]=='Pie' || this.graphType=='Pyramid' || isFullScreen) {
			this.widgetApiInfo.chart.legend = true;
			if(isFullScreen && this.widgetApiInfo.chart.group==this.chartGroup.singleSeries && zCData.chartData.length>0) {
				delete zCData.chartData[0].seriesname;
			}
		}
	}
	let isChartClickable = this.eventHandler!=undefined || this.reportEventEnabled;
	let _this = this;
  	let data = {
		seriesdata: {
			chartdata: zCData.chartData
		},
		metadata: {
			axes: {
				x: [ 0 ],
				y: [ [ 1 ] ],
				clr: [ 2 ],
				tooltip: [
					"{{val(0)}} : {{val(1)}}" //No I18N
				],
				label: ["{{val(1)}}"] //No I18N
			},
			columns: [
				{ 
					dataindex: 0,
					columnname: this.widgetApiInfo.chart.name
				},
				{
					 dataindex: 1,
					numeric: {
						subfunction: "integer", //No I18N
						format: {
							prefix: zCData.prefix,
							suffix: zCData.suffix
						}
					}
				},
				{
					datatype: "ordinal", //No I18N
					ordinal: {
						format: {
							customFormat: this.customTooltip
						}
					}
				}
			]
		},
		chart: { 
			axes: { 
				xaxis: { 
					categories: zCData.categories,
					label: {
						show: false
					},
					ticklabel: {
						textOverflow: "ellipsis", //No I18N
						maxHeight: 150,
						fontSize: 13,
						alignMode: "auto", //No I18N
						events: { cursor: "null" } //No I18N
					}
				},
				yaxis: [
					{
						label: {
							show: false
						},
						ticklabel: {
							fontSize: 13,
							events: { cursor: "null" } //No I18N
						}
					}
				]
			},
			plot: {
				renderer: {
					mode: "SVG" //No I18N
				},
				datalabels: {
					show: true,
					handleOverlapping: true
				},
				plotoptions: {
					bar: {
						maxBandWidth: 50,
						multiColoring: true,
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					},
					pie: {
						datalabels: {
							type: "doubleside", //No I18N
							line: { strokeColor: null, strokeWidth: null },
							fontSize: 13
						},
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					},
					line: {
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					},
					area: {
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					},
					pyramid: {
						datalabels: {
							fontSize: 13
						},
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					},
					dial: {
						events: {
							enabled: true
						},
						datalabels: {
							fontSize: 13
						},
						targetMarker: {
							enabled: true,
							dataindex: 1,
							outerStrokeWidth: 1,
							events: {
								enabled: false
							}
						},
						levelMarker: {
							events: {
								click: this.dialTargetMarkerClick,
								tooltipContent: function(data, chartObj) {
									return data.formattedValue+": "+data.value;
								}
							}
						},
						minmaxlabels: {
							fontSize: 13
						}
					},
					funnel: {
						datalabels: {
							innerLabel: {
								show: true,
								fontColor: "rgba(0,0,0,0.8)" //No I18N
							},
							fontSize: 13
						},
						animation: {
							type: "verticalAll", //No I18N
							duration: 700,
							easingType: "quad" //No I18N
						},
						events: { cursor: isChartClickable ? "pointer" : "null" } //NO I18N
					}
				},
				events: {
	                click: this.eventHandler,
                	contextmenu: _this.contextMenu.axisChartsEventHandler
	            }
			}
		},
		canvas: { 
			title: { show: false },
			subtitle: { show: false },
			border: { show: false },
			background: { alpha: 0 },
			fontFamily: sdp_app.CLIENT_CONF.RTA.fontFamily,
			events:{
	          	onload: _this.contextMenu.initContextMenu
	        }
		},
		legend: {
			enabled : this.widgetApiInfo.chart.legend,
			layout : "vertical", //No I18N
			colors: this.widgetApiInfo.chart.colors || this.colors, 
			marginTop: 0,
    		marginBottom: 0,
    		tooltip: true,
			maxHeight: "94%",
    		expandable: {
				show: true
			},
			shapes: "circle", //NO I18N
			fontSize: 13
		},
		tooltip: {
			backgroundColor: "white", //No I18N
			fontColor: "rgb(97, 97, 97)", //No I18N
			opacity: 1,
			shadow: "2px 2px 2px rgba(0,0,0,0.3)" //No I18N
		},
		noDataHandler: {
        	text: translate("sdp.common.nodata")
    	}
	};

	if(isFullScreen) {
		data.chart.axes.xaxis.ticklabel.alignMode = "rotate"; //No I18N
		data.chart.plot.datalabels.fontSize = 13;
	}
	else {
		data.chart.axes.xaxis.ticklabel.maxWidth = 110;
		data.tooltip.fontSize = 13;
	}
	
	if(this.graphType[0]=="Dial") {
		let yaxis = data.chart.axes.yaxis[0];
		data.metadata.axes.label= ["{{val(0)}}"]; //No I18N
		yaxis.show = false;
	}
	else if(this.graphType[1]=='Doughnut') {
		data.chart.plot.plotoptions.pie.innerRadius= "65%"; //No I18N
	}
	else if(this.graphType[1]=='Rotated') {
		data.chart.axes.rotated = true;
	}
	else if(this.graphType[1]=='Stepline') {
		data.chart.plot.plotoptions.line.mode = "stepAfter"; //No I18N
	}
	else if(this.graphType[0]=='Funnel') {
		data.metadata.axes.label= ["{{val(0)}}: {{val(1)}}"];  //No I18N
	}

	if(this.widgetName=='ApproachingSLA' || this.widgetName=='ApproachingOLA') {
		data.chart.plot.plotoptions.dial = {
	        datalabels: { show: false },
	        events: { enabled: true },
	        innerRadius: "90%", //No I18N
	        needle: { fillColor: null, strokeColor: null },
	        targetMarker: { enabled: true, dataindex: 1, outerFillOpacity: 0, outerStrokeOpacity: 0 },
	        minmaxlabels: data.chart.plot.plotoptions.dial.minmaxlabels
	    };
	    data.legend.enabled = true;
	    data.legend.vAlign = "center"; //NO I18N
	    data.legend.marginRight = 50;
	    delete data.metadata.axes.label;
	}

	if(this.widgetApiInfo.chart.group==this.chartGroup.multiSeries) {
		data.legend.hAlign = "center"; //NO I18N
		data.legend.vAlign = "bottom"; //NO I18N
	}
	else {
		data.chart.plot.plotoptions.bar.datalabels = { fontSize: 13 };
		data.chart.plot.plotoptions.area.datalabels = { fontSize: 13 };
		data.chart.plot.plotoptions.line.datalabels = { fontSize: 13 };
	}

	//tooltip
	var reportMultiseriesCharts = [10, 'Line', 'Area']; //NO I18N
	if((this.widgetApiInfo.chart.group==this.chartGroup.multiSeries && this.graphType[0]!="Dial") || (this.moduleName=="reportData" && reportMultiseriesCharts.indexOf(this.graphType[0])!=-1)) {
		data.metadata.axes.tooltip[0] = "{{val(2)}} : {{val(1)}}"; //No I18N
		data.legend.layout = "horizontal"; //No I18N
	}
	else if(this.widgetApiInfo.chart.showPercentValues) {
		data.metadata.axes.tooltip[0] = "{{val(0)}} : {{val(1)}} ({{per(1)}})"; //No I18N
	}

	// Adjusting right margin for embed widget to prevent x-axis labels from hiding.
	if (sdp_app.IS_SDP && $spa.getSearchParam("action") === "embedWidget") { //No I18N
		data.chart.marginRight = 50;
	}

	return data;
  },
  
  //Refresh a widget when clicking refresh icon
  reloadWidget: function (selectElem) {
		let widgetDiv = jQuery(selectElem).parents(".widget-bg"); //No I18N
		if(this.isZChartsSupported(widgetDiv)) {
			Object.create(this).loadZChart(widgetDiv);
		}
		else if(sdp_app.IS_SDP && $dash.gridster.isTableGraphWidget(widgetDiv)) {
			let widgetId = widgetDiv.data("actualwidgetid"); //No I18N
			$dash.newWidgets.refreshWidget(widgetId, {container: widgetDiv});
		}
		else {
			let widgetId = jQuery(selectElem).parents("li.gs-w").data("widgetid"); //No I18N
			refreshWidgetData(widgetId);
		}
  },

  //Construct Graph type dropdown of a widget
  createChartTypeDropdown: function($container) {
  	let graphClass = { "Bar": "bar", "Pie": "pie", "Line": "line", "Area": "area", "Doughnut": "doughnut", "Funnel": "funnel", "Pyramid": "pyramid", "HorizontalBar": "hbar", "StepLine": "stline", "StackedBar": "stbar" }; //NO I18N
  	let dashboardId = this.getDashboardId();
	let graphType = this.graphType.selected;
	graphType = graphType == 10 ? "StackedBar" : graphType; // No I18N
	$container.find("#graphTypeIcon").removeClass().addClass(`hspr icon-sm vtop gh-${graphClass[graphType]}`);

  	if(graphType=='Bar' && this.graphType[1]=='Rotated') {
  		graphType = 'HorizontalBar'; // No I18N
  	}
	let graphTypeElem = $container.find('.normalviewmenu .graph-type');		
	if(!graphTypeElem.hasClass('hide-chart')){
		if(jQuery(graphTypeElem).find('ul.graph-type-ul').find('[data-graphtype="'+graphType+'"]').length == 0){
			jQuery(graphTypeElem).find('ul.graph-type-ul').find('li').remove();
		} else if(jQuery(graphTypeElem).find("ul.graph-type-ul>li").length > 0){
			jQuery(graphTypeElem).find('ul.graph-type-ul>li>a').removeClass('active');
			jQuery(graphTypeElem).find('ul.graph-type-ul').find('[data-graphtype="'+graphType+'"]').addClass('active');
			jQuery(graphTypeElem).removeAttr('style');	//No I18n
			return;
		} else {				
			jQuery(graphTypeElem).addClass('hide-chart').attr('style','display:none !important;');
		}
	}
	var chartList = this.widgetApiInfo.chart.group;
	if(chartList)
	{
		if(chartList.length > 1)
		{				
			for(var i = 0 ; i < chartList.length ; i++ )
			{
				var selectComponentStr = `<li><a class="disp-flex valign-center pt5 pb5" data-graphtype="${chartList[i]}" href="/" data-event="click" data-handler="dashboardComp.personalizeGraphType(this);return false;" nonce="${sdpNonce}"><span class="hspr icon-ms gh-${graphClass[chartList[i]]} mr5"></span><span class="disp-ib">${translate('dashboard.graphtype.'+chartList[i])}</span></a></li>`; //No I18N	
				jQuery(graphTypeElem).find('ul.graph-type-ul').append(selectComponentStr);
			}
			$sdEventListener(jQuery(graphTypeElem));
			jQuery(graphTypeElem).removeClass('hide-chart').removeAttr('style');	//No I18n
			jQuery(graphTypeElem).find('ul.graph-type-ul').find('[data-graphtype="'+graphType+'"]').addClass('active');
		} else {
			jQuery(graphTypeElem).addClass('hide-chart').attr('style','display:none !important;'); //No I18N
		}
	}
  },

  //When changing a Graphy type of a widget personalize it
  personalizeGraphType: function(_this) {
		let graphType = jQuery(_this).data('graphtype'); //No I18n
		let widgetName = jQuery(_this).parents(".widget-bg").data('widgetname'); //No I18N
		if(widgetName && graphType) {
			let dashboardId = dashboardComp.getDashboardId();
			if(dashboardId) {
				ClientUtil.addUserPersonalization("widgetGraphType", {graphType: graphType}, {internalKey: "WidgetGraphType-"+dashboardId+"_"+widgetName}); //No I18N
			}
			sdp_user.CLIENT_CONF["WidgetGraphType-"+dashboardId+"_"+widgetName] = {graphType: graphType}; //No I18N
		}
		dashboardComp.reloadWidget(_this);
  },

  //Get dashboard view id
  getDashboardId: function() {
  	let dashboardId = jQuery("#view-listing li.active").data("viewid"); //No I18N
	if(sdp_app.IS_AE) {
		dashboardId = "assetHome"; //No I18N
	}
	if(dashboardId==undefined && getSDPURLParams().externalframe=='true') {
		dashboardId = jQuery("#activeViewId").val()
	}
	return dashboardId;
  },

  //Check whether a widget support API or not
  isZChartsSupported: function(widgetDiv) {
  	let widgetName = widgetDiv.data('widgetname'); //No I18N
  	if(!widgetName && !widgetDiv.hasClass("widget-bg")) {
  		widgetName = widgetDiv.parents(".widget-bg").data('widgetname'); //No I18N
  	}
  	if(widgetName=='WorkStations') {
  		let chartName = widgetDiv.find(".widget-header select option:selected").data('name'); //No I18N
  		if(chartName=='WSByProcessorType' || chartName=='WSUnaudited') { //No I18N
  			return false;
  		}
  	}
  	else if(widgetName=='All_Assets') {
  		let chartName = widgetDiv.find(".widget-header select option:selected").data('value'); //No I18N
  		if(chartName=='AssetSummary') { //No I18N
  			return false;
  		}
  	}
  	let isPublicAPI = this.apiWidgetsList.indexOf(widgetName)!=-1;
  	let isWidgetAPI = this.dashAPIWidgetsList.indexOf(widgetName)!=-1;
  	return isPublicAPI || isWidgetAPI;
  },

  //Check whether a widget support in fusion chart data
  isOldDataChartSupported: function(id, url) {
  	let widgetDiv = jQuery("#"+id).parents(".widget-bg");
  	let widgetName = widgetDiv.data('widgetname'); //No I18N
  	if(widgetName=='WorkStations') {
  		let chartName = widgetDiv.find(".widget-header select option:selected").data('name'); //No I18N
  		if(chartName=='WSByProcessorType' || chartName=='WSUnaudited') { //No I18N
  			return true;
  		}
  	}
  	return this.oldDataWidgetsList.indexOf(widgetName)!=-1 || url.startsWith("/DashBoardView.do?action=chartData"); //No I18N
  },

  //Dial widget on click handling
  dialTargetMarkerClick: function(event, data, chartObj) {
  	let _this = dashboardComp; 
  	let index = 1;
  	
  	let widgetName = chartObj.userdata.metadata.columns[0].columnname;
  	let widgetDiv = jQuery(event.target).parents("div.widget-bg"); //No I18N

  	if(Object.keys(_this.inputData).length>0 && _this.inputData[widgetName+"_"+index]) {
  		var input_data = JSON.parse(JSON.stringify(_this.inputData[widgetName+"_"+index]));	
  	}
  	else {
  		let criteria = chartObj.seriesdata[1].data[0][0].criteria;
  		let filterBy = criteria[1] || {name: _this.allReq};
  		var input_data = {list_info: {search_criteria: criteria[0], filter_by: filterBy}}; 
  	}
  	_this.openListView(input_data, widgetDiv, '', {widgetTitle: translate('sdp.requests.viewrequest.openrequests')}); //No I18N
  },

  //Push criteria to a criteria list
  pushToCriteria: function(criteria, filter) {
  	if(Array.isArray(criteria)) {
  		if(criteria.length==0) {
  			criteria = filter;
  		}
  		else {
			criteria.push(filter);
		}
	}
	else {
		if(!criteria.children) {
			criteria.children = [];
		}
		criteria.children.push(filter);
	}
	return criteria;
  },

  //Zoho charts widget onclick handling
  openURL: function (event, data, chartObj, options = {}) {
  	let _this = dashboardComp;
    let widgetDiv = jQuery(event.target).parents("div.widget-bg"); //No I18N
    
    let widgetName = chartObj && chartObj.userdata.metadata.columns[0].columnname;
    if(!widgetName) {
    	widgetName = options.widgetName;
    	if(!widgetName) {
    		return;
    	}
    }
    let selectedDay = data.point[0];
    let index = data.point.rendererIndex;
    if(!index) {
    	index = 0;
    }
    
    let input_data = JSON.parse(JSON.stringify(_this.inputData[widgetName+"_"+index]));
    input_data.list_info.group_by = undefined;
    input_data.list_info.row_count = undefined;
    input_data.list_info.get_total_count = undefined;
    let filter = {
		field: data.point.field,
		condition: "in", //No I18N
		values: [data.point.id],
		logical_operator: "and" //No I18N
	}

	if(input_data.list_info.search_criteria == undefined) {
			input_data.list_info.search_criteria = [];
	}
	let searchCrit = input_data.list_info.search_criteria;
	if(data.point.id!=-1) {
		if(widgetDiv.data("belongsto")=="asset" && searchCrit.length==0) {
			input_data.list_info.search_criteria = filter;	
		}
		else {
			searchCrit = _this.pushToCriteria(searchCrit, filter);
			input_data.list_info.search_criteria = searchCrit;
		}
	}
	
	let startDate = -1, endDate = -1, rangeField = -1;
	if(data.point.field.indexOf("_time:")!=-1) {
		if(!Array.isArray(searchCrit)) {
			searchCrit = [searchCrit];
		}
		for(let criteria of searchCrit) {
			if(criteria.condition=='GT' || criteria.condition=='GTE') {
				let rangeStart = new Date(criteria.value);
				let mon = rangeStart.getMonth();
				let day = rangeStart.getDate();
				let year = rangeStart.getFullYear();
				for(let i=0;i<=20;i++) {
					let curDate = new Date(year, mon, day+i);
					if(selectedDay==curDate.getDate()) {
						criteria.value = curDate.getTime();
						startDate = curDate;
					}
				}
			}
			else if(criteria.condition=='LT') {
				let end_Date = new Date (startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+1);
				criteria.value = end_Date.getTime();
			}

			else if(criteria.value=='$(this_week)' || criteria.value=='$(last_week)') {
				let offset = 0;
				if(criteria.value=='$(last_week)') {
					offset = -7;
				}
				let today = new Date(); 
				let dayIndex = today.getDay()-(_this.timePeriod.dayname.slice(1).indexOf(_this.timePeriod.weekDays[0]));
				if(dayIndex<0) {
					dayIndex = dayIndex+7;
				}
				var diff = today.getDate() - dayIndex + offset;
				let rangeStart = new Date(today.setDate(diff));

				let mon = rangeStart.getMonth();
				let day = rangeStart.getDate();
				let year = rangeStart.getFullYear();
				let index = _this.timePeriod.weekDays.indexOf(selectedDay);

				startDate = new Date(year, mon, day+index);
				endDate = new Date(year, mon, day+index+1);
				rangeField = criteria.field;
				break;
			}
			else if(criteria.value=='$(this_year)' || criteria.value=='$(last_year)') {
				let offset = 0;
				if(criteria.value=='$(last_year)') {
					offset = -1;
				}
				let selectedMonth = _this.timePeriod.month.indexOf(selectedDay)-1;
				let today = new Date();

				startDate = new Date(today.getFullYear()+offset, selectedMonth, 1);
				endDate = new Date(today.getFullYear()+offset, selectedMonth+1, 1);
				rangeField = criteria.field;
				break;
			}
			else if(criteria.value=='$(last_7_days)' || criteria.value=='$(last_30_days)') {
				let daysCount = criteria.value.split('_')[1];
				let today = new Date();
				for(let i=1;i<=daysCount;i++) {
					startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()-i);
					if(selectedDay==startDate.getDate()) {
						endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+1);
						rangeField = criteria.field;
						break;
					}
				}
				break;
			}
			else if(criteria.value=='$(last_month)' || criteria.value=='$(this_month)') {
				let endDay = 7*selectedDay.replace(translate("sdp.home.week")+" ", "");
				let today = new Date();
				let month = today.getMonth();
				if(criteria.value=='$(last_month)') {
					month = month-1;
				}
				startDate = new Date(today.getFullYear(), month, endDay - 6);
				endDate = new Date(today.getFullYear(), month, endDay+1);
				rangeField = criteria.field;
			}
		}
		
		if(startDate!=-1 && endDate!=-1 && rangeField!=-1) {
			startDate = _this.getPersonalizedDate(startDate);
			endDate = _this.getPersonalizedDate(endDate);

			let startTimeCrit = {field: rangeField, condition:"GTE", logical_operator:"and", value:startDate.getTime()}; //NO I18N
			_this.pushToCriteria(input_data.list_info.search_criteria, startTimeCrit);

			let endTimeCrit = {field: rangeField, condition:"LT", logical_operator:"and", value:endDate.getTime()}; //NO I18N
			_this.pushToCriteria(input_data.list_info.search_criteria, endTimeCrit);
		}
	}

	if(!options.isNewTab) {
		_this.fetchOpenURLCriteria(widgetName, chartObj, input_data.list_info.filter_by);
		options = _this.constructTitleBarFilterData(data, chartObj, widgetDiv.data("widgetname")); // No I18n
	}

	let widgetTitle = widgetDiv.find("[data-widget-name]").text().trim();
	if(widgetTitle=='') {
		widgetTitle = (widgetDiv.data('module')=='Graph') ? widgetDiv.parent().data('name') : widgetDiv.find("#widgetDropdown_0").val(); // No I18n
	}
	options.widgetTitle = widgetTitle;
	options.module = widgetDiv.data("belongsto"); // No I18n
	options.widgetName = widgetName;

	_this.openListView(input_data, widgetDiv, widgetName, options);
  },

  //Open listview popup
  openListView: function(input_data, widgetDiv, widgetName, options) {
  	if(typeof options=="undefined") {
  		options = {};
  	}
  	let mod = options.module || jQuery(event.target).parents("div[data-belongsto]").data("belongsto"); //No I18N
  	if(options.isContextMenu) {
  		mod = jQuery(dashboardComp.contextMenuEvent.target).parents("div[data-belongsto]").data("belongsto"); //No I18N
  	}
  	mod = mod.toLowerCase()
    let modules = { request: "requests", asset: "asset_assets" }; //NO I18N
    let entity = {All_Assets: "asset_assets", WorkStations: "asset_computers" };  //No I18N

    if(getSDPURLParams().externalframe=='true')  {
    	let url = '';
	  	if(modules[mod]=='requests') {
	  		url = "/WOListView.do?input_data="+ encodeURIComponent(sdpToJSON(input_data)) +"&viewMode=table"; //NO I18N
	  	}
	  	else if(modules[mod]=='asset_assets') {
	  		let assetEntity = entity[widgetName];
	  		if($dash.gridster && $dash.gridster.isTableGraphWidget(jQuery(event.target).parents(".widget-bg"))) {
		  		let filter = widgetDiv.find("#widgetDropdown_0").select2('data').text; //No I18N
		  		assetEntity = (filter=="Workstation") ? entity.WorkStations : modules[mod];
		  	}
	  		url = "/ui/asset?module="+assetEntity+"&mode=get&input_data="+ encodeURIComponent(sdpToJSON(input_data)); //NO I18N
	  	}
	    if(url!='') {
	  		window.open(url);
	  	}
    	return;
    }

    if(!options.widgetTitle) {
	    options.widgetTitle = widgetDiv.find(".widgets-hdr-txt").text().trim();
	    if(options.widgetTitle=='') {
	    	options.widgetTitle = widgetDiv.find("#widgetDropdown_0").val();
	    }
  	}

  	let assetEntity;
    let url = "/ui/load_list?module="+modules[mod]; //No I18N
    if(entity[widgetName]) {
  		url = url + "&entity="+entity[widgetName]; //No I18N
  	}
  	else if(mod=="asset" && $dash.gridster && $dash.gridster.isTableGraphWidget(jQuery(event.target).parents(".widget-bg"))) {
  		let filter = widgetDiv.find("#widgetDropdown_0").select2('data').text; //No I18N
  		assetEntity = (filter=="Workstation") ? entity.WorkStations : modules[mod];
  		url = url + "&entity="+assetEntity; //No I18N
  	}
  	url = url + "&input_data="+encodeURIComponent(sdpToJSON(input_data)); //No I18N

	if (options) {
		options.module = modules[mod];
		options.entity = entity[options.widgetName] || assetEntity;
	}

    if(options.isNewTab) {
  		url = url + "&noheader=false"; //No I18N
		window.open(url, "_blank"); //No I18N
  	}
  	else {
  		options.refreshBtn = widgetDiv.find("#instantRefresh");
  		options.closeCB = function() {
  			options.refreshBtn.trigger("click");
  		}
  		listview_popup.render(url, options.widgetTitle, options);
  	}
  },

  //Construct Listview url for a module
  openAssetListView: function(url, popupTitle) {
  	if(getSDPURLParams().externalframe=='true') {
		window.open(url);
	}
	else {
		url += '&externalframe=true&noheader=true&from=dashboard'; //NO I18N
		listview_popup.render(url, popupTitle);
	}
  },

  //Open Non listview support widgets onclick in new tab
  openTab: function(event, data, chartObj) {
  	_this = dashboardComp;
  	let url = data.point.link;
  	if(url) {
		if(url.indexOf("/ui/load_list")!=-1) {
			let title = jQuery(event.target).parents("div.widget-bg").find(".widgets-hdr-txt").text().trim(); //No I18N
			if(title=='') {
				title = jQuery(event.target).parents("div.widget-bg").find("#widgetDropdown_0").val(); //No I18N
			}
			listview_popup.render(url.slice(2), title);
		}
		else if(url!=-1) {
			window.open(decodeURIComponent(url).replace("n-", ""));
		}
  		return;
  	}
  	let columnNames = {
  		TYPEID: "PROJECTTYPEID", //NO I18N
  		TYPE: "PROJECTTYPEID", //NO I18N
  		DEPARTMENT: "DEPARTMENTID", //NO I18N
  	}

  	let widgetNames = {
  		projByStatus: "PendingProjByStatus", //NO I18N
  	}
  	let widgetName = data.data[0].columnname;
  	if(widgetNames[widgetName]) {
  		widgetName = widgetNames[widgetName];
  	}
  	
  	let colName = data.point.field.replace(".", "").toUpperCase();
  	let colValue = data.point[0];
  	let filter = jQuery(event.target).parents("li.gs-w").find("#widgetDropdown_0 option:selected").data('value'); //No I18N
  	let widgetJson = {criteria:{}, name:widgetName ,type:filter}; 
  	
  	if(columnNames[colName]) {
  		colName = columnNames[colName];
  	}

  	//Multi series widget
  	if(widgetName=='PendingProjByStatus') {
  		let seriesName = data.data[2].value;
  		if(seriesName==translate("sdp.common.notassigned")) {
  			widgetJson.criteria.unassigned_column = "PRIORITYID"; //NO I18N
  		}
  		else {
  			colName = colName + ",PRIORITYID"; //NO I18N
  			colValue = colValue + ","+seriesName;
  		}
  	}
  	
  	if(data.point.id==null) { //Not Assigned
  		if(!colName.endsWith("ID")) {
  			colName = colName + "ID"; //NO I18N
  		}
  		widgetJson.criteria.unassigned_column = colName;
  	}

	if(['PO_Contracts','POSummaryDetails','ContractSummaryDetails'].indexOf(widgetName)!=-1) {
		let type = jQuery(event.target).parents("li.gs-w").find("#widgetDropdown_0 option:selected").data('name'); //NO I18N
		if(type=='POSummary' || widgetName=='POSummaryDetails') {
			url = "/PurchaseOrderList.do?status="+data.point.field; //NO I18N
		}
		else {
			url = "/ContractView.do?contractMode=contractListView&status="+data.point.field; //NO I18N
		}
	}
	else {
		let splHanldingWidgets = ["ProjectDueThisMonth", "ProjectDelayedNOnSchedule", "ProjectCreatedNClosed"]; //NO I18N
	  	if(splHanldingWidgets.indexOf(widgetName)!=-1) {
			colName = undefined;
		  	if(widgetName=='ProjectDueThisMonth') {
		  		let filters = ["this_month", "next_month"]; //NO I18N
		  		let keyVal = colValue.toLowerCase().split(" ");
		  		widgetJson.criteria.week=parseInt(keyVal[1]);
		  		if(isNaN(parseInt(keyVal[1])) && keyVal[2]) {
		  			widgetJson.criteria.week=parseInt(keyVal[2]);
		  		}
		  		widgetJson.criteria.due_month = filters.indexOf(filter);
		  		widgetJson.type = undefined;
		  	}
		  	else {
		  		let thisMonth = _this.timePeriod.personalizedDate.getMonth();
				let months = _this.timePeriod.month.slice(1);
				let lastSixMonth = [];
				for(i=thisMonth,j=thisMonth;i>thisMonth-6;i--,j--) {
				    if(j==-1) {
				        j=11;
				    }
				    lastSixMonth.push(months[j]);
				}
				let month = lastSixMonth.indexOf(colValue) * -1;

			  	if(widgetName=='ProjectDelayedNOnSchedule') {
			  		widgetJson.criteria.closed_month = month;
			  		widgetJson.type = (data.point.seriesIndex == 0) ? "On Sechedule" : "Delayed"; //NO I18N
			  	}
			  	else if(widgetName=='ProjectCreatedNClosed') {
			  		widgetJson.criteria.created_month = month;
			  		widgetJson.type = (data.point.field == "actual_end_time:month") ? "Closed" : "Created"; //NO I18N
			  	}
			}
		}
		if(data.point.id!=null && colName) {
            widgetJson.columnNames = colName;
            widgetJson.columnValues = colValue;
        }
		url="/ui/projects?mode=list&from=dashboard&widgetJSON="+e_param(sdpToJSON(widgetJson)); //No I18N
	}
  	window.open(url);
  },

  //Get tooltip text of a widget
  customTooltip: function(value, datatype, columnInfo, type, chartObj) {
  	if((chartObj.seriesdata.widgetName=='RequestsInflowByTime' || chartObj.seriesdata.widgetName=='RequestSummaryByTime') && type=='tooltip') {
  		return value.replace(/\(\d+\)/,"");
  	}
	if(chartObj.chartTypes[0].name=='dial') {
		return translate('sdp.dashboard.open'); //No I18N
	}
	return value;
  },

  //Render non API based widgets, not reports
  generateReport: function(id, fusionchartData, url) {
  	this.widgetDiv = jQuery("#"+id).parents("li.gs-w");
  	this.widgetName = this.widgetDiv.find(".widget-bg").data("widgetname"); //No I18N
  	if(typeof fusionchartData == 'string') {
  		fusionchartData = JSON.parse(fusionchartData);
  	}
  	this.widgetApiInfo = {chart: {name: "GenerateReportWidget", colors: this.colors, type: ["Bar"], group: this.chartGroup.singleSeries}}; //No I18N

  	if(url.startsWith("/DashBoardView.do?action=chartData") && this.oldDataWidgetsList.indexOf(this.widgetName)==-1) {
  		this.moduleName = "reportData"; //No I18N
  		this.eventHandler = undefined;
  		this.graphType = this.chartTypes[fusionchartData.graphType] || ["Bar"]; //No I18N
  	}
  	else {
  		this.moduleName = "fusionData"; //No I18N
  		this.eventHandler = this.openTab;
  		if(this.noClickWidgets.indexOf(this.widgetName)!=-1) {
			this.eventHandler = undefined;
		}
  		this.updateGraphType(this.widgetApiInfo);
  		if(fusionchartData.chartData.dataset) {
  			this.widgetApiInfo.chart.group = this.chartGroup.multiSeries;
  		}
  		this.createChartTypeDropdown(this.widgetDiv.find(".widget-header"));
  	}
  	
  	let categories = 0;
  	let zCData = { categories: {}, chartData: [] };

  	if(fusionchartData.chartData.data) { //Single Stack chart
  		let chartData = [];
		let categoriesTemp = [];
  		let apiDetails = {xAxis: "label"}; //No I18N
	  	for(let node of fusionchartData.chartData.data) {
	  		if(!node.link) {
				node.link = -1;
			}
	  		chartData.push({"id:count": node.value, label: node.label, link: node.link}); //No I18N
			categoriesTemp.push(node.label);
	  	}
	  	zCData = this.constructChartData(chartData, zCData, apiDetails.xAxis, apiDetails.seriesname);

		if(isMSPOrSCP && this.oldDataSingleSeries.indexOf(this.widgetName)!=-1){
			zCData.categories = categoriesTemp;
		}else{
			zCData = this.sortCategory(zCData);
		}

	}
	else if(fusionchartData.chartData.dataset) { //Multi stack chart
		let categories = [];
		if(fusionchartData.chartData.categoriesList) {
			categories = fusionchartData.chartData.categoriesList;
		}
		else if(fusionchartData.chartData.categories) {
			for(let cat of fusionchartData.chartData.categories[0].category) {
				categories.push(cat.label);
			}
		}
		for(let set of fusionchartData.chartData.dataset) {
			let chartData = [];
			for(let n=0;n<set.data.length;n++) {
				let node = set.data[n];
				if(node) {
					if(!node.link) {
						node.link = -1;
					}
					let data = {"id:count": node.value, link: node.link}; //No I18N
					data[set.seriesname]= categories[n];
					chartData.push(data);
				}
			}
			let apiDetails = {xAxis: set.seriesname};
			zCData = this.constructChartData(chartData, zCData, apiDetails.xAxis, apiDetails.seriesname);
		}
		zCData.categories = categories;
		this.widgetApiInfo.chart.legend = true;
	}

	if(fusionchartData.chartData.chart && fusionchartData.chartData.chart.showPercentValues) {
		this.widgetApiInfo.chart.showPercentValues = true;
	}
	zCData.prefix = fusionchartData.YAxisPrefix;
	zCData.suffix = fusionchartData.YAxisSuffix;

	zCData.prefix = fusionchartData.chartData.YAxisPrefix;
	zCData.suffix = fusionchartData.chartData.YAxisSuffix;
  	zCData = this.constructZohoChart(zCData);
  	let container = this.widgetDiv.find(".widget-summaryrequests-list > div")[0];
    jQuery(container).empty();
  	var chartObj = new $ZC.charts(container, zCData);
  },

  //Maximize / Minimize a widget handling
  showInFullScreen: function(_this) {
  	let widget = jQuery(_this).parents("li.gs-w"); //No I18N
  	let contentDiv = widget.find(".widget-summaryrequests-list > div");
  	(!(""+widget.data("widgetid")).startsWith("Table_")) && contentDiv.empty(); //No I18N
  	if($dash.gridster && $dash.gridster.isTableGraphWidget(widget.find(".widget-bg"))) {
		contentDiv.removeAttr("style"); //NO i18N
  	}
  	if(widget.hasClass("fullScreen")) {
  		jQuery("#dboard-content").removeClass("fh").find("li.gs-w").removeClass("hide");
  		widget.removeClass("fullScreen").removeAttr("style").find(".widget-panel").removeAttr("style"); //No I18N
  		if(!sdp_app.IS_SDP) { //For AE Homepage
  			widget.css({'position':'relative','width':'49%','margin':'4px'});// No I18N
  		}
  		jQuery(_this).find("span").removeClass("small-screen left2").addClass("full-screen");
  		widget.find("#maximizeWidget").attr('title', translate('common.maximize'));
  		
  		setTimeout(function() { 
  			jQuery('html, body').animate({
	    		scrollTop: jQuery(widget).offset().top
	    	}, 300);
	    	if(sdp_app.IS_AE) {
	    		jQuery("#dboard-content li a.remove-custom-report").removeClass("hide")
	    	}
	    	else if(getSDPURLParams().externalframe!='true') {
	    		jQuery(".dashboardsiteoraganise #refreshTimeDiv,.dashboard-new-actions-dropdown,.dashboard-actions-dropdown").removeClass("hide");
	    	}
  		}, 300);
  	}
  	else {
  		let headerHeight = $dash.embed.isSingleWidget ? 2 : getSDPURLParams().action=="embeddashboard" ? 80 : 190;
  		if($dash.embed.isSingleWidget) {
  			setTimeout(function() {
  				jQuery("#dboard-content").css({width: jQuery(window).width()-1});
  			},10);
  		}

	  	let height = jQuery(window).height()-headerHeight;
	  	jQuery("#dboard-content").addClass("fh").find("li.gs-w").addClass("hide");
	  	widget.addClass("fullScreen").removeClass("hide").css({left: "0px", top: "0px", position: "relative", width: "calc(100%)", height: height+"px"}); //No I18N
	  	if($dash.embed.isSingleWidget) {
	  		widget.find(".widget-panel").css({height: height-50});
	  	}
	  	else {
  			widget.find(".widget-panel").css({height: "92%"});
  		}
	  	jQuery(_this).find("span").removeClass("full-screen").addClass("small-screen left2");
	  	widget.find("#maximizeWidget").attr('title', translate('common.minimize'));
	}
	setTimeout(function() {
		if($dash.embed.isTableGraphWidget) {
			let refreshBtn = jQuery(_this).parents("div#widget-menu").find("#instantRefresh"); //No I18N
			Object.create(dashboardComp).reloadWidget(refreshBtn.first());
			jQuery(_this).remove();
			refreshBtn.parents(".widget-menu-container").removeClass("hide"); //No I18N
		}
		else if($dash.gridster && $dash.gridster.isTableGraphWidget(widget.find(">.widget-bg"))) {
			let widgetId = widget.data("widgetid").replace("Table_", "").replace("Graph_", "");
			$dash.newWidgets.refreshWidget(widgetId, {container: widget.find(">.widget-bg"), fullScreen: true});
		}
		else {
			jQuery(_this).parents("div#widget-menu").find(".normalviewmenu .refreshreportgraph .reload").click(); //No I18N
		}
	}, 300);
	if(sdp_app.IS_AE) {
		jQuery("#dboard-content li a.remove-custom-report").addClass("hide");
	}
	else {
		jQuery(".dashboardsiteoraganise #refreshTimeDiv,.dashboard-new-actions-dropdown,.dashboard-actions-dropdown").addClass("hide");
	}
  },

  //Get date with User personalized timezone
  getPersonalizedDate: function(date) {
    let utc = date.getTime() - (date.getTimezoneOffset() * 60000);
    if(!sdp_user.OFFSET) {
    	let usertimezoneoffset=getUserTimezoneOffset(date.getTime(), sdp_user.USERTIMEZONECODE);
    	sdp_user.OFFSET = usertimezoneoffset*1
    }
    utc = utc - sdp_user.OFFSET;
    date.setTime(utc);
    return date;
  },

  //Check whether a widget is visible or not
  isOnScreen: function(elem) {
		if( elem.length == 0 ) {
			return false;
		}
		
		var viewport_top = jQuery(window).scrollTop();
		var viewport_height = jQuery(window).height();
		var viewport_bottom = viewport_top + viewport_height;

		var top = jQuery(elem).offset().top;
		var height = jQuery(elem).height();
		var bottom = top + height;

		return (top >= viewport_top && top < viewport_bottom) ||
		(bottom > viewport_top && bottom <= viewport_bottom) ||
		(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
	},

	//Lazy loading the widgets event handler
	attachEvent: function() {
	  let _this = this;
	  jQuery(window).off('.dashboard').on('scroll.dashboard',function(){ //NO I18N
	  	dashboardComp.loadWidgets(_this);
		});
  	},

  //Load all the widget widget if visible / Refresh the dashboard
  loadWidgets: function() {
  	_this = this;
	  	let widgets = $dash.newWidgets;
	  	let loadedWidgetCount = 0;
  	jQuery("#dboard-content li.widgets").each(function(i,node) {
  		let $widget = jQuery(node).find('.widget-panel');
			if(!jQuery(node).data("isLoaded") && !jQuery(node).hasClass("hide") && _this.isOnScreen($widget)) {
				_this.reloadWidget($widget);
				jQuery(node).data("isLoaded", true); //NO I18N
			}
			if(jQuery(node).data("isLoaded")) {
				loadedWidgetCount++;
			}
		});
		if(widgets.isTableGraphWidgetLoadeded && loadedWidgetCount===widgets.widgetsCount) {
			jQuery(window).off('.dashboard'); //NO I18N
		}
  },

  //Dashboard/widgets API based code start here
  //Get Support group id, values for widgets api
  getSupportGroups: function() {
  	let supportGroups = {};
  	sdpAjax({
			url: "/api/v3/widgets/_widget_support_group", //No I18N
			cache: false,
			async: false,
			success: function(response) {
				let groups = response.widget.group;
				let groupsCount = groups.length;
				for(let i=0;i<groupsCount;i++) {
					supportGroups[groups[i].text] = groups[i].id;
				}
			}
		});
		this.supportGroups = supportGroups;
  },

  //Call widgets api of a widget
  getDataProcessDashAPI: function() {
  	let widgetId = this.widgetDiv.find(".widget-bg").data('actualwidgetid'); //No I18N
  	//Fetching Site Id's
  	let siteId = jQuery("#siteSelection").val(); //No I18N
  	
  	//Fetching Group Id's
  	let isGroupFilterAvailable = !jQuery("#groupSelection").parents(".group-selection-container").hasClass("hide"); //NO I18N
  	let groupIds = [];
  	if(isGroupFilterAvailable) {
	  	let selectedGroups = jQuery("#groupSelection").select2("data"); //No I18N
	  	for(let group of selectedGroups) {
	  		let groupId = group.id;
	  		if(!isInteger(groupId) || group.id===group.text || group.id===group.name) {
	  			if(group.text) {
	  				groupId = this.supportGroups[group.text];	
	  			}
	  			else {
	  				groupId = this.supportGroups[group.name];
	  			}
	  		}
	  		if(groupId) {
	  			groupIds.push({id: groupId});
	  		}
	  	}
	}
  	
  	if(siteId=="0") { //All Sites
  		siteId = -2; 
  	}
	let input_data = {
		group: groupIds.length==0 ? undefined : groupIds,
		site: siteId==undefined ? undefined : [{id: parseInt(siteId)}]
	};
	  	
  	//widget time type
	if(this.widgetName=='RequestSummaryByTime' || this.widgetName=='RequestsInflowByTime') {
		let selTime = this.widgetDiv.find("#widgetDropdown_0").find(":selected").data("value"); //No I18N
		input_data.type = selTime;
	}

  let _this = this;
  sdpAjax({
		url: "/api/v3/widgets/"+widgetId+"/_widget_data", //No I18N
		cache: false,
		data: {input_data: sdpToJSON(input_data)},
		success: function(response) {
			_this.processDashApiData.call(_this, response.widget);
		}
	});
  },

  //Process the widgets api response
  processDashApiData: function(response) {
  	let chartType = this.defaultWidgetTypes[this.widgetName] || ["Bar"];
  	let chartColors = this.defaultWidgetColors[this.widgetName];
  	this.widgetApiInfo = {chart: {name: "DashboardAPIWidget", colors: chartColors, type: chartType}}; //No I18N
  	this.widgetApiInfo.chart.group = response.is_single_series ? this.chartGroup.singleSeries : this.chartGroup.multiSeries;
  	this.eventHandler = this.openDashApiListView;

  	this.updateGraphType(this.widgetApiInfo);
  	if(chartType!='Dial') {
  		this.createChartTypeDropdown(this.widgetDiv.find('div.widget-header'));
  	}
  	
  	let zCData = {};
  	let data = response.data_set, categories = {}, isContainsData = false;
  	if(response.is_single_series) { //Single series chart
	  	let result = this.processNode(data, categories);
	  	isContainsData = result.isContainsData;
	  	if(this.widgetName=='ApproachingOLA' || this.widgetName=='ApproachingSLA') {
  			result.chartNodes.reverse();
  		}
	  	zCData.chartData = [{type: this.graphType[0], seriesname: response.widget_name, data : [result.chartNodes]}];
	}
	else { //Multi series chart
		zCData.chartData = [];
		for(let aset of response.data_set) {
			result = this.processNode(aset.data, categories);
			isContainsData = isContainsData || result.isContainsData;
			zCData.chartData.push({type: this.graphType[0], seriesname: aset.series_name, data : [result.chartNodes]});
		}
		this.widgetApiInfo.chart.legend = true;
	}
	
	if(this.dialWidgetsList.indexOf(this.widgetName)!=-1 && !isContainsData) {
		zCData.chartData = [];
	}
	if(this.widgetName!='RequestReceived' && this.widgetName!='RequestClosed') {
		zCData.categories = Object.keys(categories);
	}
	if(this.widgetName=='RequestsInflowByTime' || this.widgetName=='RequestSummaryByTime') {
		zCData.chartData.widgetName = this.widgetName;
		this.updateOverallCount(zCData.chartData);
	}
	zCData = this.constructZohoChart(zCData);
  	let container = this.widgetDiv.find(".widget-summaryrequests-list > div")[0];
    jQuery(container).empty();
  	var chartObj = new $ZC.charts(container, zCData);
  },

  //Update Over All count in Request inflow by widget
  updateOverallCount: function(chartData) {
  	for(let i=0;i<chartData.length;i++) {
  		let seriesData = chartData[i].data[0];
  		let overAllCount = 0;
  		if(chartData.widgetName=="RequestsInflowByTime" && i==2) {
  			//Last value will be taken for BackLog
  			overAllCount = seriesData[seriesData.length-1][1];
  		}
  		else {
	  		for(let j=0;j<seriesData.length;j++) {
	  			overAllCount += seriesData[j][1];
	  		}
	  	}
  		chartData[i].seriesname += " ("+overAllCount+")";
  	}
  },

  //Process a single data in the widgets api response
  processNode: function(data, categories) {
	let chartNodes = [];
	let isContainsData = false;;
	for(let node of data) {
		let nData = [node.label, parseInt(node.value)];
		nData.criteria = [node.criteria, node.filter_by];
		chartNodes.push(nData);
		categories[node.label]=true;
		if(nData[1]>0) {
			isContainsData = true;
		}
	}
	return {isContainsData: isContainsData, chartNodes: chartNodes};
  },

  //Open listview popup for widgets API
  openDashApiListView: function(event, data, chartObj, options) {
	let _this = dashboardComp;
	let widgetDiv = jQuery(event.target).parents("div.widget-bg"); //No I18N
	let widgetName = chartObj && chartObj.userdata.metadata.columns[0].columnname;
	let criteria = data.point.criteria;
	let filterBy = criteria[1] || {name: _this.allReq};
	let input_data = {list_info: {search_criteria: criteria[0], filter_by: filterBy}};

	if(options==undefined) {
		options = {};
	}
	options.widgetTitle = widgetDiv.find("[data-widget-name]").text().trim();
	if(options.widgetTitle=='') {
		options.widgetTitle = widgetDiv.find("#widgetDropdown_0").val();
	}

	if (!_this.noFilterDialWidgets.contains(widgetDiv.data("widgetname")) && !options.isContextMenu) {
		var options = _this.constructTitleBarFilterData(data, chartObj, widgetDiv.data("widgetname")); // No I18n
		options.module = widgetDiv.data("belongsto"); // No I18n
		options.widgetName = widgetName;
	}
	_this.openListView(input_data, widgetDiv, widgetName, options);
  },

  // For openurl cases, criteria needs to be added to the seriesData separately for use in pop-up listview filter construction
  fetchOpenURLCriteria: function (widgetName, chartObj, filterBy) {
  	  let _this = dashboardComp;
	  var seriesData = chartObj.seriesdata;
	  for (var i = 0; i < seriesData.length; i++) {
		  var series = seriesData[i].data[0];
		  for (var j = 0; j < series.length; j++) {
			  var data = series[j];
			  var input_data = JSON.parse(sdpToJSON(_this.inputData[widgetName+"_"+(data.rendererIndex || 0)]));
			  var searchCrit = input_data.list_info.search_criteria || [];
			  var filter = {
				  field: data.field,
				  condition: "in", //No I18N
				  values: [data.id],
				  logical_operator: "and" //No I18N
			  }

			  if (data.id != -1 && data.field) {
				  searchCrit = _this.pushToCriteria(searchCrit, filter);
			  }

			  data.criteria = [sdpToJSON(searchCrit), filterBy];
		  }
	  }
  },

  // The filter data required for the requested widget is formed here. It is used to render in select2 dropdown later in listview pop-up.
  constructTitleBarFilterData: function (currData, chartObj, widgetName) {
	  var seriesData = chartObj.seriesdata;
	  var seriesFilter = [];
	  var itemFilter = [];
	  var seriesIndex = currData.formattedValue ? seriesData.findIndex(s => s.seriesname == currData.formattedValue) : currData.seriesIndex;
	  var itemIndex = currData.formattedValue ? 0 : currData.itemIndex;
	  var isSeriesFilterNeeded = seriesData.length > 1;
	  var isItemFilterNeeded = seriesData[0].data[0].length > 1 || !isSeriesFilterNeeded || (isSeriesFilterNeeded && chartObj.labelHandler.chartType != "dial");

	  for (var i = 0; i < seriesData.length; i++) {
		  var series = seriesData[i];
		  let seriesName = series.seriesname;
		  if(widgetName=='RequestsInflowByTime' || widgetName=='RequestSummaryByTime') {
		  	seriesName = seriesName.replace(/\(\d+\)/,"");
		  }
		  seriesFilter.push({index: i, text: seriesName, id: isItemFilterNeeded ? sdpToJSON(series.data[0].map(function (dat, idx) {
			  return { index: idx, text: dat[0] || "", id: dat.criteria}; //No I18N
		  })) : series.data[0][0].criteria});
	  }

	  if (isItemFilterNeeded) {
		  itemFilter = JSON.parse(seriesFilter[seriesIndex].id);
	  }

	  var titleBarFilters = { seriesFilter, seriesIndex, isSeriesFilterNeeded, itemFilter, itemIndex, isItemFilterNeeded, titleInfo: this.defaultWidgetTitleInfo[widgetName] };
	  return {titleBarFilters};
  },

  //Empty widget in zoho charts handled
  showEmptyChart: function(id) {
  	let emptyChartData = {
		canvas: { 
			title: { show: false },
			subtitle: { show: false },
			border: { show: false },
			fontFamily: sdp_app.CLIENT_CONF.RTA.fontFamily,
			background: { alpha: 0 },
		},
		noDataHandler: { 
			text: translate("sdp.common.nodata")
		}
	};
	new $ZC.charts(document.getElementById(id), emptyChartData);
  },

  contextMenu: {
  	initContextMenu: function(event, chartObj) {
    	let pieGrp = chartObj.svg.selectAll(".piegroup").node(); //No I18N
      	pieGrp && (pieGrp.oncontextmenu = _this.contextMenu.nonAxisEventHandler);

      	let funnelGrp = chartObj.svg.selectAll(".funnelgroup").node(); //No I18N
		funnelGrp && (funnelGrp.oncontextmenu = _this.contextMenu.nonAxisEventHandler);

		let pyramidGrp = chartObj.svg.selectAll(".pyramidgroup").node(); //No I18N
		pyramidGrp && (pyramidGrp.oncontextmenu = _this.contextMenu.nonAxisEventHandler);

		let openArea = chartObj.svg.selectAll(".levelmarkerSeries").node(); //No I18N
		if(openArea) { //for Pie Chart Level marker side open list view in new tab on right click
			let criteria = chartObj.seriesdata[1] && chartObj.seriesdata[1].data[0][0].criteria;
			if(criteria) {
				dashboardComp.openReqCriteria = criteria;
				openArea.oncontextmenu = function(event) {
					_this.contextMenu.show(event);
				}
			}
		}
    },

  	show: function(event, pointData, chartData) {
	  	let _this = dashboardComp;
	  	event.preventDefault();
	  	let headerHeight = jQuery("#header-placeholder").height()+jQuery("#headerbar").height()+20;
	  	jQuery("#openInNewTab").css({left: event.pageX-5, top: event.pageY-headerHeight}).removeClass("hide");
	  	_this.contextMenuEvent = { target: event.target };
	  	var optionsParam = {isContextMenu: true, isNewTab: true};

	  	jQuery("#openInNewTab").unbind('click').click(function() { //No I18N
	  		const module = jQuery(event.target).parents(".widget-bg").data("module"); //No I18N
	  		const belongsTo = jQuery(event.target).parents(".widget-bg").data("belongsto"); //No I18N
	  		optionsParam.widgetName = jQuery(event.target).parents(".widget-bg").data("widgetname"); //No I18N
	  		if(pointData) {
	  			if(module=='helpdesk') {
	  				_this.openDashApiListView(_this.contextMenuEvent, pointData, chartData, optionsParam);
	  			}
	  			else if((module=='asset') || (module=='Graph' && belongsTo=='request')) {
	  				_this.openURL(_this.contextMenuEvent, pointData, chartData, optionsParam);
	  			}
	  		}
	  		else { //for Pie Chart Level marker side open list view in new tab on right click
		  		let widgetDiv = jQuery(_this.contextMenuEvent.target).parents("div.widget-bg"); //No I18N
				let criteria = _this.openReqCriteria;
				let filterBy = criteria[1] || {name: _this.allReq};
				var input_data = {list_info: {search_criteria: criteria[0], filter_by: filterBy}}; 
				optionsParam.widgetTitle = translate('sdp.requests.viewrequest.openrequests')
				_this.openListView(input_data, widgetDiv, '', optionsParam); //No I18N
			}
			jQuery(this).addClass("hide");
	  	});
	},

	nonAxisEventHandler: function(event) {
		let pointData = {};
		if(!_this.contextMenu.isContextMenuAllowed()) {
			return;
		}
		if(event.target.__data__.data) {
			pointData = {point: event.target.__data__.data};
		}
		else if(event.target.__data__._acutalData) {
			pointData = {point: event.target.__data__._acutalData()};
		}
		else {
			pointData = {point: event.target.__data__};
		}
		_this.contextMenu.show(event, pointData, undefined);
  	},

  	axisChartsEventHandler: function(event, pointData, chartData) {
		//for Axis oriented Charts open list view in new tab on right click
		if(!_this.contextMenu.isContextMenuAllowed()) {
			return;
		}
		if(pointData) {
			chartData.eventHandler.targetEvent.preventDefault();
			_this.contextMenu.show(event, pointData, chartData);
		}
  	},

  	isContextMenuAllowed: function() {
  		let noRightClickWidgets = ["Software", "PO_Contracts", "POSummaryDetails", "ContractSummaryDetails", "All_Assets", "WorkStations"]; //No I18N
  		let noRightClickModules = ["project", "problemchange"]; //No I18N
  		let widgetName = jQuery(event.target).parents(".widget-bg").data("widgetname"); //No I18N
  		let moduleName = jQuery(event.target).parents(".widget-bg").data("module"); //No I18N
  		let belongsTo = jQuery(event.target).parents(".widget-bg").data("belongsto"); //No I18N
  		if(moduleName=="Graph" && belongsTo=="change") {
  			return false;
  		}
  		if(noRightClickModules.indexOf(moduleName)!=-1 || noRightClickWidgets.indexOf(widgetName)!=-1) {
  			return false;
  		}
  		return true;
  	},

	initEvents: function() {
		jQuery(document).mousedown(function() {
			if(jQuery(event.target).closest("#openInNewTab").length == 0) {
				jQuery("#openInNewTab").addClass("hide");
			}
		});
	}
  }
};

if(typeof $dash == 'undefined') {
	var $dash = {};
}
//Widget filters on change events handled, used in AE Homepage too
$dash.initFilterHandler = function() {
	_this = dashboardComp;
	jQuery("#dboard-content select").off(".initFilterHandler").on('change.initFilterHandler', function(event) {  //No I18N
		let selectedFilter = jQuery(this).find("option:selected").data('value'); //No I18N
		let widgetName = jQuery(this).parents(".widget-bg").data('widgetname'); //No I18N
		let filterName = "";
		if(widgetName=='ChangeChart' || widgetName=='ChangeOpenChart' || widgetName=='ChangeUnapprovedChart') {
			 filterName = "_" + jQuery(this).attr('name');
		}
		if(widgetName && selectedFilter) {
			let dashboardId = _this.getDashboardId();
			let personalizeKey = "WidgetFilter-"+dashboardId+"_"+widgetName+filterName; //No I18N
			if(dashboardId) {
				let personalizeValue = {};
                if(sdp_user.CLIENT_CONF[personalizeKey] && widgetName=="RequestsBy") {
                	//Saving Filter and Status column choose in singe personalization
                    personalizeValue = sdp_user.CLIENT_CONF[personalizeKey];
                }
                personalizeValue.selected = selectedFilter;
				ClientUtil.addUserPersonalization("widgetFilter", personalizeValue, {internalKey: personalizeKey}); //No I18N
			}
			sdp_user.CLIENT_CONF[personalizeKey] = {selected: selectedFilter};
			if(!isNaN(parseInt(selectedFilter))) {
				jQuery(this).parents(".widget-bg").data('actualwidgetid', selectedFilter); //No I18N
			}
		}
	});
	//Move the time filter to right side
	jQuery("#dboard-content .widget-select.filter").map(function(i, v) {
		jQuery(v).insertAfter(jQuery(v).parents(".widget-header:first").find("#widget-menu")); //No I18N
	});
	$dash.bindEvents();

	//Update the days list based on the SSP settings - Start day of the week
	let weekStart = jQuery("#weekStartIndex").data('value');  //No I18N
	let dayNames = _this.timePeriod.dayname.slice(1);
	_this.timePeriod.weekDays = dayNames.slice(weekStart).concat(dayNames.slice(0, weekStart));
	_this.timePeriod.personalizedDate =  _this.getPersonalizedDate(new Date());
};

$dash.bindEvents = function() {
    if($dash.embed.isSingleWidget) {
        jQuery("#dboard-content .widget-menu-container").removeClass("hide");
    }
    else {
        jQuery("#dboard-content .widget-menu-container").addClass("hide");
        let container = jQuery(document);
        container.off('.widgetIconEvent'); // No I18N
        container.on("mouseleave.widgetIconEvent", "#dboard-content>li", function() { // No I18N
            jQuery(this).find(".widget-menu-container").addClass("hide");
        });
        container.on("mouseenter.widgetIconEvent", "#dboard-content>li", function() { // No I18N
            jQuery(this).find(".widget-menu-container").removeClass("hide");
        });
    }

    //Dashboard request listview popup click
    jQuery(document).off("click.dashboard").on("click.dashboard","a" ,function(e){ // No I18N
      var url = jQuery(this).attr("href");
      if(url && url.startsWith("/ui/load_list")) {
        e.preventDefault();
        var widgetDiv = jQuery(this).parents(".widget-bg"); // No I18N
        let title = widgetDiv.find(".widgets-hdr-txt").text().trim();
        if(title=='') {
          title = widgetDiv.find("#widgetDropdown_0").val();
        } 

        var info = jQuery(this).data("index-info"); // No I18N
        if (info) {
          var filterInfo = $dash.requestByWrapper.popupFiltersInfo;
          filterInfo.seriesIndex = info.seriesIndex;
          filterInfo.itemIndex = info.itemIndex;
          filterInfo.itemFilter = JSON.parse(filterInfo.seriesFilter[info.seriesIndex].id);
          var options = {module: "requests", widgetName: "RequestsBy", titleBarFilters: filterInfo}; //No I18N
          options.refreshBtn = jQuery(e.target).parents("li").find("#instantRefresh"); //No I18N
          options.closeCB = function() {
            options.refreshBtn.trigger("click");
          }
        }
        listview_popup.render(url, title, options || undefined);
      }
    });
};

$dash.deleteCustomReportWidget = function(el,widgetId,reportid,widgetType)
{
    function deleteWidgetUsingGridster($el){
        jQuery(".gridster").data("dashboard")._gridster.remove_widget($el.closest("li.gs-w")); // No I18N
    }
    let confirmMsg = "sdp.dashboard.widget.delete.confirm"; // No I18N
    if(widgetType == 'public'){// No I18N
        confirmMsg = "sdp.dashboard.public.widget.delete.confirm";// No I18N
    }
    if( confirm(getMessageForKey(confirmMsg)) )
    {
        let url = "/servlet/AJaxServlet";//No I18N
        let params = "action=deleteWidgetFromDashboard&widgetId="+encodeURIComponent(widgetId)+"&reportId="+encodeURIComponent(reportid); //NO I18N
        if(sdp_app.IS_AE) {
        	callCustomAjaxRequest(url,params, function(){ jQuery(el).closest("li.gs-w").remove(); }, function(){} , 'deleteWidgetFromDashboard');//No I18N
        }
        else {
        	callCustomAjaxRequest(url,params, function(){deleteWidgetUsingGridster(jQuery(el));}, function(){} , 'deleteWidgetFromDashboard');//No I18N
        }
    }
};
if(sdp_app.IS_SDP && sdp_user.ROLES.contains("ViewRequests") && sdp_user.USERTYPE==='Technician') {
	dashboardComp.getSupportGroups();
}
dashboardComp.contextMenu.initEvents();
