/* $Id $ */

//Service Layout Customize

var $slc={
	viewTypeGlobal:"",
	showDescGlobal:"",
	expandGlobal:"",
	serviceResponse:{},
	templateResponse:"",
	selectedService:"",
	selectedTemp:"",
	currentServiceId:"",
	listViewTempResp:"",
	isTemplatePresent:false,
	decodeUrl:"",
	view:"",
	page:"",
	filePath:"",
	leftBarHeight:"",
	module:"",
	stCount:"",
	serviceId:"",
	catagoryLen:0,
	asset_id:"",
	noHeader:"",
	init:function(){
		var servId,servName,layResp,serviceResp;
		this.catagoryLen = 0;
		this.getServices()//Get Service response and store in global variable.
		serviceResp = jQuery.extend(true, {}, this.serviceResponse); // Extend service Response.
		layResp=this.tempLayoutAjax("GET").responseJSON;	// No I18N
		(this.view !="null") ? serviceResp.view=this.view : ""; // No I18N
		(this.module !="null") ? serviceResp.module=this.module : ""; // No I18N
		// when click on header catalog catagory then url redirect to catagory template(layout customize view).
		if(this.serviceId!="null"){
			if(this.expandGlobal!="true"){//Expand is enabled
				(this.viewTypeGlobal=="CardView") ? this.cardView(this.serviceId) : (this.viewTypeGlobal=="PanelView") ? this.panelView(this.serviceId) : this.listView(this.serviceId);	// No I18N
			}
		//Expand is disabled
			else{		
				this.includeParams(serviceResp); 
			}
		}
		// shown in the saved (layout customize view).
		else{
			(this.page!="null") ? serviceResp.page=this.page : ""; // No I18N
			serviceResp.showDesc=this.showDescGlobal;
			serviceResp.viewType=this.viewTypeGlobal;
			serviceResp.expandAll=this.expandGlobal;
			this.includeParams(serviceResp);
			(this.viewTypeGlobal=="PanelView") ? (this.showSspMsg(),this.checkIframeLoaded()) : ""; // No I18N
		}	
		jQuery('#allTemp').addClass('btn-secondary');
		this.triggerCategory();
	},

	triggerCategory:function(){
		if(this.catagoryLen == 1){
			jQuery("[data-attr=singleCategory]").trigger("click"); // No I18N
		}
	},
	//view layout for (cardview,panelview,listview)
	viewPanel:function(panel){
		this.viewTypeGlobal=panel; // stored layout value into global variable.
		this.includeParams(this.serviceResponse);
		(this.viewTypeGlobal=="PanelView") ? (this.selectedTemp="",this.currentServiceId="",this.showSspMsg(),jQuery('#allTemp').addClass('btn-secondary'),this.checkIframeLoaded()) : ""; // No I18N
		this.triggerCategory();
	},
	//We have check for which type is present in this page.(default,hover,expand)
	viewType:function(view){
		var resp,checkExpand,self=this;
			resp=jQuery.extend(true, {}, this.serviceResponse); // Get services
		//Verify (expand check box) checked or not.
			checkExpand=jQuery('#expandAllCb').prop("checked"); // No I18N
		if(view=="default" || view=="onHover"){ //checking for default or onhover
			(this.viewTypeGlobal=="CardView" && this.templateResponse && !checkExpand) ? resp=this.templateResponse : ""; // No I18N
			(this.viewTypeGlobal=="PanelView" && jQuery('#templateList:visible').length==0) ? resp.templates=this.selectedTemp : this.selectedTemp="" ;  // No I18N
			(this.viewTypeGlobal=="ListView" && this.isTemplatePresent && !checkExpand) ? (resp=this.listViewTempResp,resp.displayTemp="true") : "";	// No I18N
			this.showDescGlobal=(view=="default")?"true":"false"; // No I18N
		}	
		if(view=="expand"){
			//check box is enabled
			if(checkExpand){
				this.expandGlobal="true";
			}
			//check box is disabled
			else{
				this.expandGlobal="false";
				(this.viewTypeGlobal=="ListView" && this.isTemplatePresent) ? (resp=this.listViewTempResp,resp.displayTemp="true") : (resp=this.serviceResponse,delete resp.template); // No I18N
				(this.viewTypeGlobal=="CardView" && this.templateResponse) ? resp=this.templateResponse : ""; // No I18N
			}
		}
		this.includeParams(resp);
		// Active selected category for panel view
		(this.viewTypeGlobal=="PanelView" && this.currentServiceId && jQuery('#templateList:visible').length==0) ? this.activePanel(this.currentServiceId) : ""; // No I18N
		(this.viewTypeGlobal=="PanelView" && this.selectedTemp == "" ) ? this.showSspMsg() : "" ; // No I18N
		(this.viewTypeGlobal=="PanelView") ? (jQuery('#allTemp').addClass('btn-secondary'),this.checkIframeLoaded(true)) : ""; // No I18N
		setTimeout(function(){
			if(self.viewTypeGlobal=="PanelView" && jQuery('#templateList:visible').length!=0){
				jQuery('#leftBar').find('.panel-wrap').removeClass('panel-active');
			}
		}, 200);
	},
	//Get services
	getServices:function(value){
		//value means ssp search
		if(value && this.serviceResponse.service_category){
			return this.serviceResponse;
		}
		else{
			var inputObject={},list_info={},params="hasMergedTemplates",result,self=this; // No I18N
			(this.stCount=="") ? this.stCount=1 : "";
				(this.module=="mergedRequest") ? params="hasMergedTemplates" : ""; // No I18N
				(this.module=="incident") ? params="hasIncidentTemplates" : ""; // No I18N
				(this.module=="serviceRequest") ? params="hasServiceTemplates" : ""; // No I18N
			inputObject.list_info={"row_count" : "100","start_index": this.stCount,"filter_by": { "name": params },"fields_required":[ "id", "name", "description","icon_name","sort_index", "templates" ]}; // No I18N
			if (checkIfMSP()) {
				mspCrit = [
					{
						"condition": "is",// No I18N 
						"logical_operator": "and",// No I18N 
						"field": "associated_account",// No I18N 
						"value": getAccountId()// No I18N 
					}
				]
				inputObject.list_info.search_criteria = mspCrit;
			}
			result=sdpAjaxInputData(inputObject);
			return sdpAjax({
				type:'GET',//NO I18N
				url:"/api/v3/requests/service_category",// No I18N 
				data:result,
				cache:false,
				async:false,
				success: function(resp) {
				    //SD-122013 : Instead storing the service category count, now its added with existing category count, as the api call can be triggered till it doesn't have more rows.
					self.catagoryLen += resp.service_category.length;
					if(resp.list_info.has_more_rows==true){
		          		(resp.list_info.start_index==1) ? self.serviceResponse.service_category=resp.service_category : self.serviceResponse.service_category=self.serviceResponse.service_category.concat(resp.service_category);
		          		self.stCount=self.stCount+100;
		          		self.getServices();
		          	}
		          	else{
		          		(resp.list_info.start_index==1) ? self.serviceResponse.service_category=resp.service_category : self.serviceResponse.service_category=self.serviceResponse.service_category.concat(resp.service_category);
		          	}
		          	if(value){
						return resp;
					}
					else{
						(self.viewTypeGlobal=="PanelView" && self.currentServiceId && jQuery('#templateList:visible').length==0) ? self.activePanel(self.currentServiceId) : "" ; // No I18N
						(self.viewTypeGlobal=="PanelView") ? self.showSspMsg() : ""; // No I18N
					}	
				}
			});
		}
	},
	// if template_settings is undefined or we don't have we is_incident_templates_available or is_service_templates_available data we will call this function.
	//SD-113582
	getTemplatesData:function(){
		return sdpAjax({
				type:'GET',//NO I18N
				url:"/servlet/AJaxServlet?action=GetTemplateSettings",// No I18N
				cache:false,
				async:false,
				success: function(data) {
					return data;
				}
			    });
	    },
	//Check incident and service templates are available or not.
	isTemplatesAvailable:function(resp){
		if(template_settings == undefined || !template_settings.hasOwnProperty('is_incident_templates_available') || !template_settings.hasOwnProperty('is_service_templates_available')){
		    template_settings={ ...template_settings, ...this.getTemplatesData().responseJSON};
		}
		if(template_settings.is_service_templates_available && (this.module == "serviceRequest" || this.module == "mergedRequest") || template_settings.is_incident_templates_available && (this.module == "incident" || this.module == "mergedRequest")){
			resp.reorder = "true"; // No I18N
		}
		else{
			resp.reorder = "false"; // No I18N
		}
	},
	/** Getting catalog title based on module **/
	getCatalogTitle:function(){
		var catalog_key;
		if(this.module == "incident"){
			catalog_key = "common.tech.issuecatalog"; // No I18N
		}
		else if(this.module == "serviceRequest"){
			catalog_key = "common.servicecatalog"; // No I18N
		}
		else{
			catalog_key = "sdp.cpl.service.catagories"; // No I18N
		}
		return catalog_key;
	},
	 /*Adding event listeners*/
	callBackForEvents: function(){
	    jQuery("[data-name='service-catalog-layout-cardView']").off('click').on('click', (event) => {  // No I18N
            $slc.viewPanel('CardView');  // No I18N
        })
        jQuery("[data-name='service-catalog-layout-listView']").off('click').on('click', (event) => {    // No I18N
            $slc.viewPanel('ListView');   // No I18N
        })
        jQuery("[data-name='service-catalog-layout-panelView']").off('click').on('click', (event) => {   // No I18N
            $slc.viewPanel('PanelView');  // No I18N
        })
        jQuery("[data-name='service-catalog-layout-default-button']").off('click').on('click', (event) => {   // No I18N
            $slc.viewType('default');   // No I18N
        })
        jQuery("[data-name='service-catalog-layout-hover-button']").off('click').on('click', (event) => {   // No I18N
            $slc.viewType('onHover');   // No I18N
        })
        jQuery("[data-name='service-catalog-layout-expandall-button']").off('click').on('click', (event) => {  // No I18N
            $slc.viewType('expand');  // No I18N
        })
        jQuery("[data-name='service-catalog-layout-editSsp']").off('click').on('click', (event) => {  // No I18N
            $slc.editMsg(true);
        })
        jQuery("[data-name='service-catalog-layout-reorder']").off('click').on('click', (event) => {  // No I18N
            reorder.showTemplatesPopup($slc.module);
        })
        jQuery("[data-name='service-catalog-applyChanges-button']").off('click').on('click', (event) => {   // No I18N
            $slc.tempLayoutAjax('PUT','save');  // No I18N
        })
        jQuery("[data-name='service-catalog-cancelLayout-button']").off('click').on('click', (event) => {  // No I18N
            if ($slc.page==='serviceRequest'){
                window.location.href="/app#/admin/modules/servicecatalog" // No I18N
            }
            else{
                window.location.href="/app#/admin/incident-templates"   // No I18N
            }
        })
        jQuery("[data-name='service-catalog-layout-show-allTemp']").off('click').on('click', (event) => {  // No I18N
            $slc.filterTabs('allTemp');  // No I18N
        })
        jQuery("[data-name='service-catalog-layout-show-incident']").off('click').on('click', (event) => {  // No I18N
           $slc.filterTabs('incident');  // No I18N
        })
        jQuery("[data-name='service-catalog-layout-show-service']").off('click').on('click', (event) => {   // No I18N
            $slc.filterTabs('service');  // No I18N
        })
        jQuery("#service-catalog-layout-back-button").off('click').on('click', (event) => {  // No I18N
            $slc.backToServices(event);
        })
        jQuery("#service-catalog-layout-category-cards").off('click').on('click', '[data-attr="singleCategory"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.cardView(eleDataset.id);
        })
        jQuery("#service-catalog-layout-templates-view").off('click').on('click', '[data-attr="singleTemplate"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.invokeTempUrl(eleDataset.id,eleDataset.serviceid,eleDataset.isservice);
        })
        jQuery("#service-catalog-layout-templates-expanded-view").off('click').on('click', '[data-attr="expandTemplate"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.invokeTempUrl(eleDataset.id,eleDataset.tempid,eleDataset.isservice);
        })
        jQuery('[sdpJs="service-catalog-layout-panel-view-category"]').off('click').on('click', '[data-attr="panelViewCategory"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.panelView(eleDataset.id);
        })
        jQuery("[data-name='service-catalog-layout-sspSave']").off('click').on('click', (event) => {   // No I18N
            $slc.saveMsg();
        })
        jQuery("[data-name='service-catalog-layout-sspCancel']").off('click').on('click', (event) => {   // No I18N
            $slc.editMsg(false); 
        })
        jQuery("#service-catalog-layout-panel-view-template").off('click').on('click', '[data-attr="panelTemplates"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.invokeTempUrl(eleDataset.tempid,eleDataset.serviceid,eleDataset.isservice);
        })
        jQuery("#service-catalog-layout-list-view-customizations").off('click').on('click', '[data-attr="listViewExpandTemp"],[data-attr="listViewTemp"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.invokeTempUrl(eleDataset.tempid,eleDataset.serviceid,eleDataset.isservice);
        })
        jQuery("#service-catalog-layout-list-view-customizations").on('click', '[data-id="listViewService"]', function(event) {
            let eleDataset = event.currentTarget.dataset;
            $slc.listView(eleDataset.serviceid);
        })
        jQuery("#service-catalog-layout-back-to-category-arrow").off('click').on('click', (event) => {   // No I18N
            $slc.backToServices(event);
        })
	},
	// Include params
	includeParams:function(resp){
		this.isTemplatesAvailable(resp);
		(this.view == "admin") ? resp.isAdmin="true" : resp.isAdmin="false"; // No I18N
		jQuery.extend(resp,{'expandAll':this.expandGlobal,'viewType':this.viewTypeGlobal,'showDesc':this.showDescGlobal,'selectedService':this.selectedService,'page':this.page,'view':this.view,'filePath':this.getFile(),'isAdmin':resp.isAdmin,'module':this.module,'reorder':resp.reorder,'catalogTitle':this.getCatalogTitle()}); // No I18N
		this.compileHandleBars("customize_layout","#mainContainer",resp); // No I18N
	},
	// Compile Handle bars
	compileHandleBars:function(getTemp,setTemp,response){
		var self=this,theTemplate,findDesc;
		let afterRenderCallback = function() {
            self.callBackForEvents(response);
        }
		renderhbs(setTemp, getTemp, response, false, "service_catalog",null,null,afterRenderCallback); // No I18N
		search_widget.init("");//Invoke search widget
		(this.viewTypeGlobal=="PanelView" && this.leftBarHeight=="") ? this.pvSetHeight() : ""; // No I18N
		(this.viewTypeGlobal!="PanelView") ? self.pageScroll() : this.appendScroll(); // No I18N
		(this.viewTypeGlobal=="PanelView") ? (jQuery('.ssp-search .select2-container .select2-choices .select2-input').css({'height':'27px','font-size':'13px'}),jQuery("body").css("overflow","hidden")) : jQuery("body").css("overflow",""); // No I18N
		(this.showDescGlobal=="true") ? jQuery(".panelContainer").addClass('mb10') : jQuery(".panelContainer").removeClass('mb10'); // No I18N
		findDesc=jQuery('[data-id=getDesc]');  // No I18N
		for (var i = 0; i < findDesc.length; i++) {
			if(findDesc[i].innerHTML == ""){
				var currentPanel =jQuery(".panelContainer")[i];  // No I18N
				jQuery(currentPanel).removeClass('mb10');  // No I18N
			}
		}
		(jQuery(".win-resize")[0].scrollHeight < jQuery(window).outerHeight()) ? (jQuery(".win-resize,#mainContainer").addClass('fh')) : ""; // No I18N
		setTimeout(function(){
			jQuery(".win-resize,#mainContainer").removeClass('fh');
			self.windowResize();
		 }, 300);
		jQuery(window).on('resize.scc_windowResize',self.windowResize)
    	setTimeout(function(){
			self.titleTruncate();
			initTooltip('#mainContainer'); // No I18N
			jQuery(window).trigger('resize');
		}, 400);
		this.appendTitle();
		this.goToTopScroll();
		jQuery("#service-head").css("height",jQuery("#service-head-fixed").height()); // No I18N
		jQuery("html, body").animate({
				scrollTop: 0
		}, 200);
		$se.page_scripts.render("all_page");
	},
	// Get and put ajax
	tempLayoutAjax:function(type,save){
		var data,self=this;
		(save) ? (input_data={"template_layout_setting": [{"parameter": "ViewType","paramvalue": this.viewTypeGlobal},{"parameter": "Show_Desc_By_Default","paramvalue": this.showDescGlobal},{"parameter": "Expand_All","paramvalue": this.expandGlobal}]},data=sdpAjaxInputData(input_data)) : "";// No I18N

		return sdpAjax({
			type:type,
		    url: "/api/v3/template_layout_settings", // No I18N
		    data:data,
		    cache:false,
		    async:false,
		    success: function(tempLayResp) {
		    	if(save){
		    		showalert('success',translate("sdp.cpl.successfully"),'isAutoHide=true,delay=3,width=auto'); // No I18N
		    	}
		    	else{
		    		jQuery.map(tempLayResp.template_layout_setting, function(data, index ) {
					 	(data.parameter=="Show_Desc_By_Default") ? self.showDescGlobal=data.paramvalue : ""; // No I18N
					 	(data.parameter=="ViewType") ? self.viewTypeGlobal=data.paramvalue : ""; // No I18N
					 	(data.parameter=="Expand_All") ? self.expandGlobal=data.paramvalue : ""; // No I18N
				 	});
		    		return tempLayResp;
		    	}
		    }
		});
	},
	// View template for default view
	cardView:function(scId){
		$CS.findElement("service_category_"+scId).trigger("listen:click");//No I18N
		this.templateResponse=this.getTemplates(scId);
		this.templateResponse.serviceId=scId;
		this.selectedService=this.templateResponse.selectedService=this.templateResponse.templates.serviceName;
		this.includeParams(this.templateResponse);
	},
	// View template for Card view
	panelView:function(scId){
		$CS.findElement("service_category_"+scId).trigger("listen:click");//No I18N
		var templateId,templist,selectedTabId;
		selectedTabId=jQuery('.filtersContainer').find('.btn-secondary').attr('id');
		templist = this.getTemplates(scId);
		this.selectedTemp=templist.templates;
		serivesList=jQuery.extend(true, {}, this.serviceResponse);
		serivesList.templates=templist.templates;
		serivesList.service_category=serivesList.service_category;
		serivesList.serviceId=scId;
		this.includeParams(serivesList);
		jQuery("#templateList").hide();
		this.currentServiceId=scId;
		this.activePanel(this.currentServiceId);
		this.filterTabs(selectedTabId);
		jQuery("#leftBar").scrollTop(jQuery('[data-id='+scId+']').position().top-jQuery("#leftBar").position().top);
		},
	// View template for list view
	listView:function(scId){
		$CS.findElement("service_category_"+scId).trigger("listen:click");//No I18N
		var getSeriviceResp,resultData,resp
		getSeriviceResp=jQuery.extend(true, {}, this.serviceResponse);
		this.templateResponse=this.getTemplates(scId);
		resultData=jQuery.map(getSeriviceResp.service_category, function(data, index ) {
			if(scId==data.id){
				return getSeriviceResp.service_category=data;
			}
		})
		getSeriviceResp.service_category=resultData;
		getSeriviceResp.templates=this.templateResponse.templates;
		getSeriviceResp.serviceId=scId;
		this.listViewTempResp=getSeriviceResp;
		this.includeParams(getSeriviceResp);
		jQuery("#panel-body").slideDown("fast"); // No I18N
		this.isTemplatePresent=true;
	    jQuery("#service-catalog-layout-list-view-customization").off('click', '[data-id="listViewService"]'); // No I18N
	},
	// Get Templates
	getTemplates:function(scId){
		var serviceName,resultData;
	 	resultData=jQuery.map(this.serviceResponse.service_category, function(data, index ) {
			if(scId==data.id){
				serviceName=data.name;
				return data.templates;
			}
		})
		jQuery.extend(resultData,{"serviceName":serviceName}); // No I18N
		return {templates:resultData};
	},
	// selected service activate for card view.
	activePanel:function(Id){
		jQuery('[data-id='+Id+']').addClass('panel-active').closest('.panel-wrap').next('hr').css({'visibility':'visible'}).end().prev('hr').css({'visibility':'visible'});// No I18N
	},
	// Go to Default view then list services.
	backToServices:function(event){
		this.templateResponse=false;
		this.isTemplatePresent=false;
		jQuery("[data-id=listViewService]").removeAttr("onclick");
		this.includeParams(this.serviceResponse);
	},
	// Invoke template url
	invokeTempUrl:function(tempId,serviceId,isServiceTemp){
		var pathName=parent.window.location.pathname;
		var url = "/WorkOrder.do?woMode=newWO&from=Templates&module="+this.module+"&reqTemplate="+tempId;  // No I18N
		if($slc.asset_id!="" && $slc.asset_id!="null"){
			url ="/WorkOrder.do?woMode=newWO&from=Templates&module=incident&reqTemplate="+tempId+ "&assetId="+$slc.asset_id;  // No I18N
		}
		if(isServiceTemp){
			url += "&requestServiceId="+serviceId;  // No I18N
		}
        if(window.externalframe || parent.window.externalframe)
        {
            window.open(url, '_blank', 'noopener,noreferrer');
			return false;
        }
        /** Try catch event for script error (Unsafe attempt to initiate navigation for frame with URL - MS Team), then navigate to new tab  **/
		try {
			if(pathName=="/SSCustomizeView.do" || pathName=="/ui/home"){
				parent.window.location.href = url;
			}else{
				$spa.navigate(url,"requests","requests-new"); // NO I18N
			}
		} catch(e) {
			window.location.href = url;
		}
	},
	// find html present or not
	getFile:function(){
		var value=this.module,path,url;

		if(this.viewTypeGlobal=="PanelView"){
			url = ((isSCP?isDefaulthelpdesk:isIThelpdesk) == "true") ? "/custom/widgets/catalogmessage/"+value+"_edited.html" : "/custom/widgets/catalogmessage_"+PORTALID+"/"+value+"_edited.html"; // No I18N
			sdpAjax({
				url:url,
                type:"GET",//No I18n
                async:false,
                cache:false,
                dataType: "html", // NO I18N
                ignorefailuremessage: true,
                success: function (data) {
                    path=url;
                },
                error: function(){
                    path="/custom/widgets/catalogmessage/"+value+".html" // No I18N
                }
            });
        return path;
		}
	},
	//Append page scroll for card view and list view
	pageScroll :function(){
		var serviceCatalogTop,headerHeight;
		serviceCatalogTop = jQuery('#service-head-fixed').offset().top;
		jQuery(window).on('scroll.scc_pageScroll',function() {
			headerHeight = jQuery('#header-placeholder').outerHeight();
			scrollTopValue = serviceCatalogTop || headerHeight || 77;
			if(jQuery(window).scrollTop() > scrollTopValue)  {
				var servicedir = 'left';// No I18N
				if(jQuery( 'body' ).css( 'direction' ) == 'rtl') {
					servicedir = 'right';// No I18N
			}
			jQuery('#service-head-fixed').attr('style','position: fixed;top:0px;'+servicedir+':auto;width: '+jQuery('#service-head').width()+'px;background-color: #fff;z-index: 999;box-shadow: 0px 1px 8px 0px #ccc');  // No I18N
			}
			else{
			 jQuery('#service-head-fixed').removeAttr('style')
				if(jQuery(window).outerHeight() < jQuery('.win-resize')[0].scrollHeight){
					 jQuery('.win-resize').css('height','auto'); // No I18N
				}
			}
		})
	},
	//Append scroll for panel view
	appendScroll:function(){
		var self=this;
		if(this.viewTypeGlobal=="PanelView"){
		   	jQuery(window).on('resize.scc_appendScroll',function(){
		  		resize();
		 	});
			function resize(){
		 	 	jQuery('#pvWrapper').css({"height":self.leftBarHeight-12}); // No I18N
			}
			resize();
		}
	},
	// Show and hide templates for incident and service.
	filterTabs:function(filter){
		var param_1,param_2,panel_bdy;
		panel_bdy=jQuery(".panel-bdy");
		jQuery(".filtersContainer").find('.btn-sm').removeClass('btn-secondary');
		jQuery("#"+filter).addClass('btn-secondary');
		jQuery('#info_msg').remove();
		if(filter=="incident"){
			param_1="true";
			param_2="false";
		}else if(filter=="service"){  // No I18N
			param_1="false";
			param_2="true";
		}
		else{
			jQuery(panel_bdy).find('[data-id="false"]').show().next().show().end().end().find('[data-id="true"]').show().next().show();
		}
		jQuery(panel_bdy).find('[data-id='+param_1+']').hide().next().hide().end().end().find('[data-id='+param_2+']').show().next().show();
		(!jQuery(".panel-bdy .panel-inner").is(":visible") && !jQuery("#templateList").is(":visible")) ? jQuery(panel_bdy).append('<div id="info_msg" class="alert-nodata mt20 ml20" role="alert"><span class="msg">'+translate("project.template.list.notemplate")+'</span></div>') : "";
	},
	//show ssp message and set height.
	showSspMsg:function(){
		jQuery(".dv-right").css("overflow","hidden"); // No I18N
		jQuery("#templateList").show();
		jQuery("#template_msg_iframe").css("height",this.leftBarHeight); // No I18N
	},
	//ssp message
	editMsg:function(flag){
		jQuery(".dv-right").css("overflow",""); // No I18N
		if(flag){
			jQuery(".cpl_header").hide();//No I18n
			jQuery(".filtersContainer").hide();
			this.pvSetHeight();
			jQuery('#pvWrapper').css({"height":this.leftBarHeight-10}); // No I18N
			jQuery("#templateList").show();//No I18n
			jQuery("#template_msg_iframe").hide();	//No I18n
			jQuery("#EditTemMsg").show();//No I18n
			jQuery(".panel-bdy").hide();//No I18n
			zeditor({element:'HTMLDesc',edithtml:true,toolbar:"generalToolbar",content:document.getElementById('template_msg_iframe').contentDocument.getElementsByTagName("BODY")[0].outerHTML}); //No i18n
			(this.view!="admin") ? jQuery('#mainContainer').addClass('mt10') : ""; // No I18N
			jQuery("#mainContainer .ze_area").height(this.leftBarHeight-80);
			jQuery('#leftBar').find('.panel-wrap').removeClass('panel-active');

		}
		else{
			jQuery(".panel-bdy").show();//No I18n
			jQuery(".cpl_header").show();//No I18n
			jQuery(".filtersContainer").show();
			(this.selectedTemp=="") ? jQuery("#templateList").show(): (jQuery("#templateList").show(),jQuery(".panel-bdy").hide()); //No I18n
			jQuery("#template_msg_iframe").show();	//No I18n
			jQuery("#EditTemMsg").hide();//No I18n
			jQuery('#leftBar').find('.panel-wrap').removeClass('panel-active'); // No I18N
			jQuery("#template_msg_iframe").css("height",this.leftBarHeight); // No I18N
			this.triggerPannel();
		}
		this.windowResize();
		this.loadCss();
	},
	//Load Iframe css
	loadCss:function(){
		if(parent.jQuery('body').attr('theme') == 'dark-mode'){
			jQuery('#template_msg_iframe').contents().find("body").attr("theme",'dark-mode');
		}
		jQuery('#template_msg_iframe').contents().find("body").css("font-family", parent.setBodyFont()); // No I18N
		jQuery('#template_msg_iframe').contents().find("head").append(jQuery('<link rel="stylesheet" type="text/css" href="/style/base-font.css"><link rel="stylesheet" type="text/css" href="/style/editor-style.css"><style>body {font-family:"Roboto";font-size:13px;}</style>'));
	},
	//save ssp message
	saveMsg:function(){
		var self=this,inputdata;
		inputdata = {
			'content':editor.getHTML(),//No I18n
			'module':this.module//No I18n
		};
		
		(inputdata.content=="") ? inputdata.content="<br/>" : "" ;  // No I18N
		jQuery.ajax({
			url: "/servlet/HdClientUtilServlet?command=uploadContentToFile", //No I18N
			type: 'POST',//No I18n
			data: inputdata,
			cache:false,
			success: function (data) {
				if(data.search(self.module)>-1){
					document.getElementById('template_msg_iframe').contentWindow.document.open();
					document.getElementById('template_msg_iframe').contentWindow.document.write(inputdata.content);//No i18n
					document.getElementById('template_msg_iframe').contentWindow.document.close();
					self.editMsg(false);
					showalert('success',translate("api.updated.success",[translate("sdp.admin.home.wizard.configuration.label")]),'isAutoHide=true');//NO I18N
				}
				else{
					showalert('failure',translate("sdp.admin.zreports.network.connection.error"),'isAutoHide=true');//NO I18N
				}
			}	
		});	
	},	
	// append value in Iframe and append css.
	checkIframeLoaded : function(val) {
		var self=this;
		if(document.getElementById("template_msg_iframe")!=undefined){
			document.getElementById("template_msg_iframe").src=document.getElementById("template_msg_iframe").src+"?="+Date.now();
			jQuery("#templateList").addClass("hide");
			setTimeout(function(){
				self.loadCss();
				self.appendScroll();
				(val==undefined) ? self.triggerPannel() : jQuery("#templateList").removeClass("hide"); //NO I18N	
			 }, 500);
		}
    },
    // trigger first pannel when Iframe value is empty.
    triggerPannel:function() {
    	var content=jQuery("#template_msg_iframe").contents().find("body")[0];
   		if(content && content.text.trim()===""&& content.innerText.trim()==="" && jQuery(content).find("img").length === 0){
           var firstchild=jQuery('#leftBar').children()[0];
           jQuery(firstchild).trigger('click');
           jQuery('#info_msg').remove();
        }
        else{
        	jQuery("#templateList").removeClass("hide"); //NO I18N
        }
    },
    pvSetHeight:function(){
    	var ChatBarHeight  = jQuery("#sdp-chat-bar").length > 0 ? 35 : 0;   //No I18N
        this.leftBarHeight = jQuery(window).height() - ( jQuery('#pvWrapper').position().top + ChatBarHeight );
    },
    getParseParams:function(params){
	 	var ampIdx,qstIdx,paramsArray,paramsMap,count,curParam,keyName,keyValue,val;
	 	ampIdx = params.indexOf("&");
	  	qstIdx = params.indexOf("?");
	  	(qstIdx >= 0 && qstIdx < ampIdx) ? params = params.substring(qstIdx + 1, params.length) : params = params.substring(1);
	  	paramsArray = params.split("&");
	  	paramsMap = new Object();
	    for(count = 0; count < paramsArray.length; count ++){
	       	curParam = paramsArray[count];
	        keyName = curParam.substring(0, curParam.indexOf("="));
	        keyValue = curParam.substring(curParam.indexOf("=") + 1, curParam.length);
	        (paramsMap[keyName] == null) ? paramsMap[keyName] = new Array() : "";
	        val = paramsMap[keyName];
	        val[val.length] = keyValue;
	    }
    	return paramsMap;
	},
	appendTitle:function(){
		jQuery('.sortable').parent('.btn').on('mouseover',function() { // No I18N
		if(jQuery(this).find('.reorder-txt').is(":visible") == false) {
			jQuery(this).attr({
				'rel':'uitip', //NO I18N
				'title':'Reorder' //NO I18N
			});
			initTooltip('#mainContainer'); // No I18N
		}else {
			jQuery(this).removeAttr('title').removeAttr('rel');
		}
		}).on('mouseout',function() {
			jQuery(this).removeAttr('title').removeAttr('rel');
		})
	},
	goToTopScroll:function(){
		jQuery(window).on("scroll.scc_goToTopScroll", function() {
			 if(jQuery(document).scrollTop() > 1000) {
			    jQuery("#backtotop").removeClass("hide");
		     } else {
		    	jQuery("#backtotop").addClass("hide");
		     }
	     })
	    jQuery("#backtotop").off().on("click", function() {
			jQuery("html, body").animate({
				scrollTop: 0
			}, 400);
		}).find("span").text(getMessageForKey("sdp.change.submission.gototop"));
	},
	windowResize:function(){
		var _height = jQuery(window).outerHeight()-jQuery('.win-resize').position().top-20;
	    if(jQuery(window).outerHeight() >= jQuery(document).outerHeight()){
	        jQuery('.win-resize').css('height',_height+'px'); // No I18N
	        jQuery('#mainContainer').addClass('fh');
	    }
	    else{
	    	if(jQuery('#pvWrapper').length <= 0){
	    		if(jQuery("#_DIALOG_LAYER").css('visibility') != 'visible'){
	    			jQuery('.win-resize').css('height','auto'); // No I18N
	        		jQuery('#mainContainer').removeClass('fh');
	    		}
	    	}
	     }
	     if(jQuery('#pvWrapper').length > 0){
	     	jQuery('#pvWrapper').css("height",jQuery('.win-resize').outerHeight() - (jQuery('#pvWrapper').position().top-jQuery('.win-resize').position().top + 10)); // No I18N
	 	 }
	},
	titleTruncate:function(){
		var singleLineTruncate,multiLineTruncate;
			singleLineTruncate=jQuery(".single-line-truncate");
			multiLineTruncate=jQuery(".multi-line-truncate");
		ItreateTruncate(singleLineTruncate,"single"); // No I18N
		ItreateTruncate(multiLineTruncate,"multi"); // No I18N
		function ItreateTruncate(obj,val){
			var param1,param2;
			for (var i = 0; i < obj.length; i++) {
				(val=="single") ? (param1=obj[i].scrollWidth,param2=jQuery(obj[i]).outerWidth()) : (param1=obj[i].scrollHeight,param2=jQuery(obj[i]).outerHeight());
				if(param1 > param2){
					jQuery(obj[i]).attr('title',e_html(jQuery(obj[i]).text()));
				}
			}
		}
	}
}
