// $Id$
/* Listview actions and template compilation*/
var $spaceList = {
    table_comp_space : {},
    view : 'table',// No I18N
    viewMode : 'table', // No I18N
    filter_view_internal_name : '',
    filter_view_display_name : '',
	externalframe : '',
	input_data:'',
	showFilters:false,
	showPhotos:true,
	support_search_criteria :false,
	gsearch :'',
	isGlobalSearch:false,
	alSpaceFilters :[{"id":"all","name":translate("all.space")},{"id":"campus","name":translate("space.campus")},{"id":"structure","name":translate("space.structure")},{"id":"floor","name":translate("space.floor")},{"id":"room","name":translate("space.room")},{"id":"roompartition","name":translate("space.roompartition")}], // No I18N
    init : function(module, from, externalframe,customContainer,input_data,gsearch){
		if(module=="tree")
		{
			let spaceListViewTemplateRenderCallback = () => {
				jQuery('ul[data-name="space-left-panel"]').off('click').on('click','[data-name="space-switch-tab"]', (event) => {
					let clickedModule = event.currentTarget.dataset.moduleName;
					$spaceList.switchTab(clickedModule, '');
				});
				initTooltip('[data-name="space-left-panel"]'); // No I18N
			};
			renderhbs("#listviewloader", "space_listview_template", {"module":"tree","externalframe":false}, false, "spacemodule",null,true,spaceListViewTemplateRenderCallback);// NO I18N	
			$space.route('tree',this);// No I18N
			this.LeftPanelHeight();			
			return;
		}
		applyBrowserTitle();
        var _self = this;
		var modulMap={"campus":"space_campuses","structure":"space_structures","building":"space_buildings","nonbuilding":"space_nonbuildings","floor":"space_floors","room":"space_rooms","facility":"facility_services","roompartition":"space_roompartitions","space":"spaces"}; // No I18N
		var keyMap={"campus":"space.campus","structure":"all.structures","building":"space.building","nonbuilding":"space.nonbuilding","floor":"space.floor","room":"room.and.space","facility":"space.facility","roompartition":"space.partition","space":"all.space"}; // No I18N
        _self.module = modulMap[module]; // No I18N
		_self.moduleKey = keyMap[module]; // No I18N
		_self.spaceSubModule = module; // No I18N
		_self.externalframe=externalframe;
		_self.customContainer=customContainer;
		_self.showFilters=false;
		_self.gsearch=gsearch;
		if(gsearch&&gsearch!=''){
			_self.isGlobalSearch=true;
			jQuery("#subheader_search_box").val(e_attr(gsearch)); // No I18N
		}
		else{
			_self.isGlobalSearch=false;
		}
		if(externalframe&&externalframe==true){
			 _self.setTemplate("table","table",customContainer); // No I18N
		}
		else{
        var view_mode = "table",view = "table";// No I18N
        var current_view = {};
		var viewKey = _self.module+"_currentview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}		
        if(sdp_user.CLIENT_CONF[viewKey]){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF[viewKey]);
			view_mode=current_view.view;
        }
        var viewMode;
        if(view_mode == "classic"){ // No I18N
            _self.viewMode = 'classic'; // No I18N
            viewMode = "linear"; // No I18N
            current_view.view = 'classic'; // No I18N
        }
        else{
            _self.viewMode = 'table'; // No I18N
            viewMode = "table"; // No I18N
            current_view.view = "table"; // No I18N
        }
        //pass view as kanban to settemplate for a classic view
        current_view.view = (current_view.view == "classic") ? "kanban" : current_view.view; // No I18N
        _self.setTemplate(current_view.view,viewMode,customContainer);
		}
		this.LeftPanelHeight();			
    },
	LeftPanelHeight: function(){
		var spLeft = jQuery('div.space-left'); // No I18N
		if(spLeft.length > 0){
			var spWin = jQuery(window),
			spHpl = jQuery('div#header-placeholder'); // No I18N
			spLeft.css('min-height',spWin.height() - (spHpl.height() + 50)+'px'); // No I18N
			jQuery(window).on('resize',function(){
				spLeft.css('min-height',spWin.height() - (spHpl.height() + 50)+'px'); // No I18N
			});	
		}
		initTooltip(".space-right .listcontrols"); // No I18N
	},	
    setTemplate : function(view,viewMode,customContainer){
        var _self = this;
            _self.view = view;
            _self.viewMode = viewMode;
            _self.permissions = _self.getPermissions();
            var contextObj = _self.permissions;
            if($spaceList.permissions["delete"]){
				contextObj.checkbox = true;
			}
			else{
				contextObj.checkbox = false;
			}
			if($spaceList.permissions.edit||$spaceList.permissions["delete"]){
				contextObj.actioncell = true;
			}
			else{
				contextObj.actioncell = false;
			}
            contextObj.module = _self.module; // No I18N
			contextObj.moduleKey=_self.moduleKey;
			contextObj.spaceSubModule=_self.spaceSubModule;
            contextObj.view = view;
			contextObj.externalframe=_self.externalframe;
			contextObj.input_data=_self.input_data;
			contextObj.showPhotos=_self.showPhotos;
			contextObj.alSpaceFilters=_self.alSpaceFilters;
			contextObj.isGlobalSearch=_self.isGlobalSearch;
			contextObj.gsearch=_self.gsearch;
			if(_self.room_id){
				contextObj.room_id=_self.room_id;
			}
			if(_self.site_id){
				contextObj.site_id=_self.site_id;
			}
			if(_self.fromPage){
				contextObj.fromPage=_self.fromPage;
			}
			if(_self.min_preview){
				contextObj.min_preview=_self.min_preview;
			}			
            contextObj.viewMode = viewMode;
            contextObj.entityDisplayName =  translate("space."+_self.spaceSubModule);//No I18N
            if(sdp_user && sdp_user.ROLES.indexOf("SDAdmin") !== -1 && (sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND )){ //NO I18N
                HelpVideos.init('spaces', "#spa-container"); // No I18N
            }				
			var divId;
			if(!customContainer||customContainer==false)
			{
				divId="listviewloader";//NO I18N
			}
			else{
				divId=_self.containerId;
			}
			let spaceListViewTemplateRenderCallback = () => {
				jQuery('ul[data-name="space-left-panel"]').off('click').on('click','[data-name="space-switch-tab"]', (event) => {
					let clickedModule = event.currentTarget.dataset.moduleName;
					$spaceList.switchTab(clickedModule, '');
				});
				let switchSpaceViewTable = jQuery('#switch-space-view-table');
					switchSpaceViewTable.off('click').on('click', (event) => { // No I18N
						$spaceList.switchSpaceView('table'); // No I18N
					});
				let switchSpaceViewClassic = jQuery('#switch-space-view-classic');
					switchSpaceViewClassic.off('click').on('click', (event) => { // No I18N
						$spaceList.switchSpaceView('classic'); // No I18N
					});
				let allSpaceFilterElement= jQuery('select[name="all_space_filter"]');
					allSpaceFilterElement.off('change').on('change', (event) => { // No I18N
						$spaceList.changeAlSpaceFilter(event.currentTarget,_self.gsearch);
					});
				let switchStructureElement=jQuery('ul[data-action-name="space-switch-tab-list"]');
					switchStructureElement.off('click').on('click', '[ data-name="space-switch-tab-list-element"]' , (event) => {
						let clickedModule = event.currentTarget.dataset.structureModule;
						let externalFrameValue = event.currentTarget.dataset.externalframe;
						$spaceList.switchTab(clickedModule, '', externalFrameValue=="true"?true:false);
					});
				let addStructureList = jQuery('ul[data-action-name="add-structure-list"]');
				if( _self.min_preview){
					addStructureList.off('click').on('click', '[data-name="add-structure-list-element"]' , (event) => {
						let clickedModule = event.currentTarget.dataset.structureModule;
						$spaceList.openFormInPreview(clickedModule,'add'); // No I18N
					});
				}
				let addSpaceElement = jQuery('[data-action-name="add-space-element"]');
				if(_self.min_preview){
					addSpaceElement.off('click').on('click', (event) => { // No I18N
						let spaceSubModuleValue = event.currentTarget.dataset.spaceSubModule;
						$spaceList.openFormInPreview(spaceSubModuleValue,'add'); // No I18N
					});
				}
				let initFilterSpaceElement = jQuery('[data-action-name="init-filter-space"]');		
					initFilterSpaceElement.off('click').on('click', (event) => { // No I18N
						$spaceList.initFilter(event.currentTarget);
					});
				let photoCOntrolElement = jQuery('#photoscontrol');
					photoCOntrolElement.off('click').on('click', (event) => { // No I18N
						$spaceList.hideandshowphoto(this);
					});
				let clearFilterElement = jQuery('[data-action-name="space-clear-filter"]');
					clearFilterElement.off('click').on('click', (event) => { // No I18N
						$spaceList.clearFilter();
					});
				initTooltip('[data-name="space-left-panel"]'); // No I18N
			};
			renderhbs("#"+divId, "space_listview_template", contextObj, false, "spacemodule",null,true,spaceListViewTemplateRenderCallback);// NO I18N	
            if(sdp_user && sdp_user.ROLES.indexOf("SDAdmin") !== -1 && (sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND )){ // No I18N
                if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("spaces")){ // No I18N
                    HelpVideos.open('spaces',false); // No I18N
                }
            }			
            $spaceList.loadSpaceListView(viewMode);
        
    },
    getPermissions : function(){
        var _self = this;
        var url = (_self.module.indexOf("space_")>-1?"spaces/":"")+_self.module + "/_links";// No I18N
        var links_data = _self.getLinksData(url); //NO I18N
        return links_data.permissions;
    },
    getLinksData : function(moduleURL){
        var links_data = {permissions : {}};
        var url = "/api/v3/" + moduleURL;//NO I18N
            sdpAjax({
                url: url,
                success: function (response) {
                    var links = response._links;
                    links = links.links || links;
                    links.forEach(function (link) {
                        if(link.name){
                            links_data.permissions[link.name] = true;
                        }
                    });
                },
                async: false
            });
            return links_data;
    },


    backToListview : function(){

    },
	
	switchTab : function(module,from,externalframe) {
		if(!externalframe||(externalframe&&this.fromPage=="details")){
			$spa.navigate("/ui/space?mode=list&module="+module, "spaces", "spaces-list");	//No I18N
		} else {
			this.init(module, '', externalframe,this.customContainer);
		}
	},
	clearFilter : function() {
		/* Disable Table and Classic View Height adjustment in Filter click */
		var spTHeight = ($spaceList.viewMode == 'table') ? 35 : 0, // No I18N
		searchRowJQ = jQuery('#'+$spaceList.module+'_head tr.searchRow'),// No I18N
		searchRowHeight = (searchRowJQ.is(':visible')) ? searchRowJQ.height() : 0,// No I18N
		spHeight = $spaceList.setHeight() + spTHeight - searchRowHeight;
		$spaceList.table_comp_space.setTableHeight(spHeight);
		$spaceList.table_comp_space.t_obj.options.height = $spaceList.setHeight();
		var _self=this;
		_self.showFilters=!_self.showFilters;
		var ele = jQuery('#spaceFilter_'+_self.spaceSubModule);
		ele.removeClass('btn-info');
		ele.addClass('btn-default');	
		jQuery('#filtersList_'+_self.spaceSubModule).addClass('hide');	
		_self.destroyFilters();
	},
	destroyFilters : function(){
		var _self = this;
		var search_criteria = _self.table_comp_space.t_obj.table_info.list_info.search_criteria;
		if(search_criteria){
			_self.table_comp_space.setDefaultSearchCriteria(null);
			search_criteria = _self.clearSearchCriteria(search_criteria,"site.id");	//No I18N
			search_criteria = _self.clearSearchCriteria(search_criteria,"space_campus.id");	//No I18N
			search_criteria = _self.clearSearchCriteria(search_criteria,"space_building.id"); //No I18N
			search_criteria = _self.clearSearchCriteria(search_criteria,"space_floor.id"); //No I18N
			search_criteria = _self.clearSearchCriteria(search_criteria,"template.id");	 // No I18N
			_self.table_comp_space.t_obj.table_info.list_info.search_criteria = search_criteria;
		}
		_self.table_comp_space.refreshTable("refresh"); // No I18N		
		var ele1=jQuery('#siteSelect2');
		if(ele1.length>0){
			ele1.val("").select2("destroy"); // NO I18N
		}
		var ele2=jQuery('#campusSelect2');
		if(ele2.length>0){
			ele2.val("").select2("destroy"); // NO I18N
		}
		var ele3=jQuery('#buildingSelect2');
		if(ele3.length>0){
			ele3.val("").select2("destroy"); // NO I18N
		}
		var ele4=jQuery('#floorSelect2');
		if(ele4.length>0){
			ele4.val("").select2("destroy"); // NO I18N
		}	
		var ele5=jQuery('#facilitySelect2');
		if(ele5.length>0){
			ele5.val("").select2("destroy"); // NO I18N
		}		
	},
	initFilter : function(ele) {
		var _self=this;
		_self.showFilters=!_self.showFilters;
		if(_self.showFilters==true)
		{
			jQuery(ele).addClass('btn-info');
			jQuery(ele).removeClass('btn-default');
			jQuery('#filtersList_'+_self.spaceSubModule).removeClass('hide');
			if(_self.spaceSubModule=="campus"||_self.spaceSubModule=="structure"||_self.spaceSubModule=="building"||_self.spaceSubModule=="nonbuilding"){
				_self.handleSearchCriterias("siteSelect2","site");// No I18N
			}
			if(_self.spaceSubModule=="room"||_self.spaceSubModule=="roompartition"||_self.spaceSubModule=="floor"||_self.spaceSubModule=="structure"||_self.spaceSubModule=="building"||_self.spaceSubModule=="nonbuilding"){
				_self.handleSearchCriterias('campusSelect2','space_campus'); // No I18N
			}
			if(_self.spaceSubModule=="room"||_self.spaceSubModule=="roompartition"||_self.spaceSubModule=="floor"){
				_self.handleSearchCriterias('buildingSelect2','space_building'); // No I18N
			}
			if(_self.spaceSubModule=="room"||_self.spaceSubModule=="roompartition"){
				_self.handleSearchCriterias('floorSelect2','space_floor'); // No I18N
			}	
			if(_self.module=="facility_services"){
				_self.handleSearchCriterias('facilitySelect2','template'); // No I18N
			}				
		}
		else{
			_self.destroyFilters();
			jQuery(ele).removeClass('btn-info');
			jQuery(ele).addClass('btn-default');	
			jQuery('#filtersList_'+_self.spaceSubModule).addClass('hide');			
		}
		/* Enable Table and Classic View Height adjustment in Filter click */
		var spTHeight = ($spaceList.viewMode == 'table') ? 35 : 0, // No I18N
		searchRowJQ = jQuery('#'+$spaceList.module+'_head tr.searchRow'),// No I18N
		searchRowHeight = (searchRowJQ.is(':visible')) ? searchRowJQ.height() : 0,// No I18N
		filterHeight = jQuery('#filtersList_'+$spaceList.spaceSubModule).height(), // No I18N
		spHeight = $spaceList.setHeight() - filterHeight + spTHeight - searchRowHeight;
		$spaceList.table_comp_space.setTableHeight(spHeight);
		$spaceList.table_comp_space.t_obj.options.height = $spaceList.setHeight() - filterHeight;
		initTooltip('.ae-filter'); // No I18N
	},
	handleSearchCriterias: function(select2Id,field){
		var _self=this;
			_self.initSelect2('#'+select2Id,field); // No I18N
			jQuery("#"+select2Id).on("change", function(e) { 
				if(e.val!=null&&e.val!="")
				{
					var search_criteria;
					var default_criteria;
					if(_self.table_comp_space.t_obj.table_info.list_info.search_criteria){
						search_criteria = _self.table_comp_space.t_obj.table_info.list_info.search_criteria;
					}
					else{
						search_criteria={};
					}
					if(field=="site"){
						_self.clearSearchFields('campusSelect2','space_campus',false,e.val);// No I18N
						search_criteria = _self.clearSearchCriteria(search_criteria,'space_campus.id');// No I18N
					}
					if(field=="space_campus"){
						_self.clearSearchFields('buildingSelect2','space_building',false,e.val);// No I18N
						_self.clearSearchFields('floorSelect2','space_floor',true);	// No I18N
						search_criteria = _self.clearSearchCriteria(search_criteria,'space_building.id');// No I18N
						search_criteria = _self.clearSearchCriteria(search_criteria,'space_floor.id');// No I18N
					}
					if(field=="space_building"){
						_self.clearSearchFields('floorSelect2','space_floor',false,e.val);	// No I18N
						search_criteria = _self.clearSearchCriteria(search_criteria,'space_floor.id');// No I18N
					}
					default_criteria = _self.table_comp_space.t_obj.default_search_criteria;
					if(default_criteria){
						default_criteria = _self.clearSearchCriteria(default_criteria,field+".id"); //No I18N
					}
					if(search_criteria){
						search_criteria = _self.clearSearchCriteria(search_criteria, field+".id") //No I18N
					}
					if(jQuery.isEmptyObject(default_criteria)){
						default_criteria = {"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq" }; // No I18N
					} else {
						if(default_criteria.children){
							default_criteria.children.push({"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq","logical_operator":"and" }); // No I18N
						} else {
							default_criteria.children = [{"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq","logical_operator":"and" }]; // No I18N
						}
					}
					_self.table_comp_space.t_obj.default_search_criteria = default_criteria;
					if(jQuery.isEmptyObject(search_criteria)){
						search_criteria = {"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq" }; // No I18N
					} else {
						if(search_criteria.children){
							search_criteria.children.push({"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq","logical_operator":"and" });//No I18N
						} else {
							search_criteria.children = [{"field":field+".id","value":(e.val=="-1"?null:e.val),"condition":"eq", "logical_operator":"and" }]; //No I18N
					}
					}
                    _self.table_comp_space.t_obj.table_info.list_info.search_criteria = search_criteria;
					_self.table_comp_space.refreshTable("refresh"); // No I18N
				}
				else{
					var search_criteria = _self.table_comp_space.t_obj.table_info.list_info.search_criteria;
					var default_criteria = _self.table_comp_space.t_obj.default_search_criteria;
					if(field=="site"){
						_self.clearSearchFields('campusSelect2','space_campus',true);// No I18N
						if(search_criteria){
							search_criteria = _self.clearSearchCriteria(search_criteria,'space_campus.id');// No I18N
							default_criteria = _self.clearSearchCriteria(default_criteria,'space_campus.id');// No I18N
						}
					}
					if(field=="space_campus"){
						_self.clearSearchFields('buildingSelect2','space_building',true);// No I18N
						_self.clearSearchFields('floorSelect2','space_floor',true);		// No I18N
						if(search_criteria){
							search_criteria = _self.clearSearchCriteria(search_criteria,'space_building.id');// No I18N
							search_criteria = _self.clearSearchCriteria(search_criteria,'space_floor.id');// No I18N
							default_criteria = _self.clearSearchCriteria(default_criteria,'space_building.id');// No I18N
							default_criteria = _self.clearSearchCriteria(default_criteria,'space_floor.id');// No I18N
						}
					}
					if(field=="space_building"){
						_self.clearSearchFields('floorSelect2','space_floor',true);	// No I18N
						if(search_criteria){
							search_criteria = _self.clearSearchCriteria(search_criteria,'space_floor.id');//No I18N
							default_criteria = _self.clearSearchCriteria(default_criteria,'space_floor.id');//No I18N
					    }
                    }
					if(default_criteria){
						default_criteria = _self.clearSearchCriteria(default_criteria,field+".id"); //No I18N
					}
					if(search_criteria){
						search_criteria = _self.clearSearchCriteria(search_criteria, field+".id") //No I18N
					}
					if(jQuery.isEmptyObject(default_criteria)){
						_self.table_comp_space.setDefaultSearchCriteria(null);
					} else{
						_self.table_comp_space.t_obj.default_search_criteria = default_criteria;
                    }
                    _self.table_comp_space.t_obj.table_info.list_info.search_criteria = search_criteria;
					_self.table_comp_space.refreshTable("refresh"); // No I18N
				}
			});
	},
	clearSearchCriteria : function(criteria, field){
		var index = criteria.children? criteria.children.findIndex(obj=> obj.field === field) : -1;
		if(index !== -1){
			criteria.children.splice(index, 1);
			if(criteria.children.length == 0){
				delete criteria.children
			}
		}
		else if(criteria.field === field ){
			if(criteria.children){
				criteria.field = criteria.children[0].field;
				criteria.condition = criteria.children[0].condition;
				criteria.value = criteria.children[0].value;
				criteria.children.splice(0, 1);
				if(criteria.children.length == 0){
					delete criteria.children
				}
			} else {
				criteria = {};
			}
		}

		return criteria;
	},
	clearSearchFields : function(select2Id,field,disable,val){
		var _self = this;
		var campEle3 = jQuery("#"+select2Id);
		if(campEle3.length>0){
			campEle3.val("").prop("disabled", disable).select2("destroy"); // NO I18N
			_self.initSelect2('#'+select2Id,field,val); // No I18N
			if(_self.table_comp_space.t_obj.table_info.default_searchfields){
				delete _self.table_comp_space.t_obj.table_info.default_searchfields[field+".id"];	
			}
		}		
	},
	initSelect2: function(ele,field,parentVal) {
		var placeHolderKeys = {"site":"sdp.admin.org.technician.allsite","space_campus":"all.campuses","space_building":"all.buildings","space_floor":"all.floors","template":"common.service.templates.all"}; // No I18N
		var _self=this;
		var options = {
			cache:{},
			closeOnSelect : false,
			multiple:false,
			allowClear: true,
			placeholder: translate(placeHolderKeys[field]),
			url:[{
				url:"/api/v3"+(field=="template"?_self.fieldsMetaInfo.fields.template.href:_self.fieldsMetaInfo.fields[field].href),//NO I18N
				field: field,
				list_info:_self.getInputDataForSelect2(field,parentVal)
			}]
		};
		if(field=="template"||field=="site"){
			options.include_inactive_value= true;
		}
		jQuery(ele).sdp_select2(options);
	},
	getInputDataForSelect2: function(key,val) {
			// Default list info
			var input_data = {
				list_info: {
					sort_field: "name", // NO I18N
					sort_order: "A", // NO I18N
					search_criteria: []
				}
			};
			if(key=="site")
			{
				return {start_index:1,row_count:25};
			}
			if(key=="space_campus"&&val){
					input_data.list_info.search_criteria.push({
						field: (val=="-1"?"site":"site.id"), // NO I18N
						value: (val=="-1"?null:val),
						condition: "is", // No I18N
						logical_operator: "and" // NO I18N
					});
			}	
			if(key=="space_building"&&val){
					input_data.list_info.search_criteria.push({
						field: (val=="-1"?"space_campus":"space_campus.id"), // NO I18N
						value: (val=="-1"?null:val),
						condition: "is", // No I18N
						logical_operator: "and" // NO I18N
					});
			}	
			if(key=="space_floor"&&val){
					input_data.list_info.search_criteria.push({
						field: (val=="-1"?"space_building":"space_building.id"), // NO I18N
						value: (val=="-1"?null:val),
						condition: "is", // No I18N
						logical_operator: "and" // NO I18N
					});
			}				
			return input_data.list_info;
	},	
	callbackSearchFunction : function()
	{
		$spaceList.table_comp_space.refreshTable("refresh"); // No I18N
	},
	hideandshowphoto : function(ele)
	{
		var _self=this;
		_self.showPhotos=!_self.showPhotos;
		this.init(_self.spaceSubModule, '', false);
	},
    callbackInputSearchCriteria: function(data) {
		if (data.list_info.search_criteria) {
			updateSearchCriteria(data.list_info.search_criteria);
		}

		function updateSearchCriteria(searchCriteria) {
			if (Array.isArray(searchCriteria)) {
				for (var i = 0; i < searchCriteria.length; i++) {
					updateCriteria(searchCriteria[i]);
				}
			} else {
				updateCriteria(searchCriteria);
				if (searchCriteria.children) {
					var criteriaArray = searchCriteria.children;
					for (var i = 0; i < criteriaArray.length; i++) {
						updateCriteria(criteriaArray[i]);
					}
				}
			}
		}

		function updateCriteria(criteria) {
			if (criteria.field && criteria.field.indexOf(".") !== -1) {
				var temp = criteria.field.split(".");
				if (temp[1] === "id" && criteria.condition === 'contains') {
					criteria.condition = 'eq'; // No I18N
				}
			}
		}

		return data;
	}
};


/* TableComponent initialization*/
$spaceList = jQuery.extend(true, (function(){
    var r = {};
    r.current_view_mode = ""; // No I18N
    r.loadSpaceListView = function(viewMode){
        var componentName = ""; // No I18N
            componentName = "webc-spacelist-"+$spaceList.module; // No I18N
        delete WebComponents.instancePool[componentName];//NO I18N
        r.current_view_mode = viewMode;
        WebComponents.render(componentName); // No I18N
        $spaceList.table_comp_space = WebComponents.getInstance(componentName); //NO I18N
    },
    r.rowDataConstruct = function(tableInfo) {
        var inputObject = {};
		var _self=this;
        var fields_required = tableInfo.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var actioncellIndex = fields_required_arr.indexOf("actioncell"); // No I18N
        actioncellIndex > -1 && fields_required_arr.splice(actioncellIndex, 1);
        var chkindex = fields_required_arr.indexOf(_self.module+"_head_chk"); // No I18N
        chkindex > -1 && fields_required_arr.splice(chkindex, 1);	
        var viewInSpaceTreeindex = fields_required_arr.indexOf("viewInSpaceTree"); // No I18N
        viewInSpaceTreeindex > -1 && fields_required_arr.splice(viewInSpaceTreeindex, 1);			
        if($spaceList.module.indexOf("space")>-1){ // No I18N
                    fields_required_arr.push("created_time"); // No I18N
                    fields_required_arr.push("status"); // No I18N
					fields_required_arr.push("site"); // No I18N
					fields_required_arr.push("type"); // No I18N
					fields_required_arr.push("display_image"); // No I18N
					
					fields_required_arr.push("area.space_area"); // No I18N
					fields_required_arr.push("area.area_unit"); // No I18N
					fields_required_arr.push("request_count"); // No I18N
					fields_required_arr.push("total_capacity"); // No I18N
            }
			fields_required_arr.push("created_by"); // No I18N
			if($spaceList.module!="facility_services"){ // No I18N
                  fields_required_arr.push("space_campus"); // No I18N
				  fields_required_arr.push("space_building"); // No I18N
				  fields_required_arr.push("space_floor"); // No I18N
				  fields_required_arr.push("space_room"); // No I18N
			}
			fields_required_arr.push("template"); // No I18N
			fields_required_arr.push("name"); // No I18N
            inputObject.fields_required = fields_required_arr;
            inputObject.list_info = tableInfo.list_info;
			if(_self.input_data&&_self.input_data.list_info&&_self.input_data.list_info.search_fields)
			{
				if(!inputObject.list_info.search_fields)
				{
					inputObject.list_info.search_fields={};
				}
				inputObject.list_info.search_fields = jQuery.extend(true, {}, _self.input_data.list_info.search_fields);
			}
			if(_self.input_data&&_self.input_data.list_info&&_self.input_data.list_info.search_criteria)
			{
				if(!inputObject.list_info.search_criteria)
				{
					inputObject.list_info.search_criteria={};
				}
				inputObject.list_info.search_criteria = jQuery.extend(true, {}, _self.input_data.list_info.search_criteria);
				$spaceList.support_search_criteria =true;
			}	
			if(_self.gsearch&&_self.gsearch!="")
			{
				inputObject.list_info.gsearch=_self.gsearch;
			}
        return inputObject;
    },
    r.tableCompOptions = function(){
         var _self = this,
            options = {};
            options = {
                "column_settings": { //No i18N
                    "default_position": 2, //No i18N
                    "assign_content_width": false, //No i18N
                    "assign_label_width": false, //No i18N
                    "columns": [{ //No i18N
                            "size": ((_self.module=="facility_services"&&$spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined)?7:1), //No i18N
                            "width": ((_self.module=="facility_services"&&$spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined)?'':'143px'), //No i18N
                            "row_count": ((_self.module=="facility_services"&&$spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined)?2:1), //No i18N
							"pipe_separation": ((_self.module=="facility_services"&&$spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined)?true:false), //No i18N
                        },
                        {
                            "size": (_self.module=="facility_services"?($spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined?2:5):(_self.showPhotos==true?2:7)), //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2, //No i18N
							"pipe_separation": true,  // No I18N
							"width": (_self.showPhotos==true&&_self.module!="facility_services"?'220px':''), //No i18N
                        },
                        {
                            "size": (_self.module=="facility_services"?2:(_self.showPhotos==true?6:1)), //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2, //No i18N
							"pipe_separation": (_self.module=="facility_services"?false:true) //No i18N
                        },
                        {
                            "size": (_self.module=="facility_services"?2:(_self.showPhotos==true?1:1)), //No I18N
                            "row_count": 2, //No i18N
                            "default_position": 2 //No i18N
                        },
                        {
                            "size": (_self.module=="facility_services"?1:1), //No I18N
                            "row_count": 4, //No i18N
                            "default_position": 2 //No i18N
                        }
                    ]
                },
                default_sort_field : {"sort_field" : "name","sort_order" : "desc"}//No i18N
            }
			if(!_self.externalframe||(_self.externalframe && _self.fromPage == "details")) {
				options.staticHeader= true;
			}
			options.cancelFilterTable = $spaceList.handleAdvancedFilter;
			options.applyFilterTable =  $spaceList.handleAdvancedFilter;
			options.bulkSelectionSetting={"enabled":true}; // No I18N
			options.callbackSearchFunction=$spaceList.callbackSearchFunction;
			options.support_search_criteria=$spaceList.support_search_criteria;
			options.deleteURL=((_self.module.indexOf("space")>-1&&_self.module!="spaces")?"spaces/":"")+_self.module; // No I18N
			options.isFR_ListInfo_Support = true;
			options.support_search_criteria = true;
			options.callbackInputSearchCriteria = $spaceList.callbackInputSearchCriteria;
            return options;
    },
    r.headerDataConstruct = function(){
        var _self = this;
        var header = {};
		if($spaceList.permissions["delete"]){
            header[_self.module+"_head_chk"]= { //No i18N
                "column_settings": { //No I18N
                    "position": 1 //No I18N
                },
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "checkbox", //No i18N
                "dataCelltransformer": _self.constructChkboxCell // No I18N
            };
		}
			if($spaceList.permissions.edit||$spaceList.permissions["delete"]){
            header["actioncell"]= { //No i18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructActionCell, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            };
			}
            header["name"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"preview":(_self.module=="facility_services"?true:false), // No I18N
				"is_column_preview":(_self.module=="facility_services"?true:false), // No I18N
				"dataCelltransformer": _self.constructNameCell, // No I18N
                "column_settings": { //No i18N
                    "position": (_self.module=="facility_services"?2:(_self.showPhotos==true?3:2)), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
            };
			header["template"]= { //No i18N
                "default": true, //No i18N
				"value_path" : "template.name", // No I18N
                "hide_label": true, //No i18N
				"dataCelltransformer": _self.constructTemplateCell, // No I18N
                "column_settings": { //No i18N
                    "position": (_self.module=="facility_services"?3:(_self.showPhotos==true?5:4)), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
            };
			if(_self.module.indexOf("space")>-1){
			header["viewInSpaceTree"]= { //No i18N
                "default": true, // No I18N
                "column_settings": {"position": 1}, // No I18N
                "dataCelltransformer": _self.constructTreeCell, // No I18N
                "type": "icon", // No I18N
                "hide_label": true  //No I18N
            };
            header["status"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"value_path" : "status.name", // No I18N
                "column_settings": { //No i18N
                    "position": (_self.showPhotos==true?4:3), //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
				"dataCelltransformer": _self.constructStatus // No I18N
            };
			if(_self.showPhotos){
            header["display_image"]= { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
				"disableSorting" : true, //No i18N
                "column_settings": { //No i18N
                    "position": 2, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
				"dataCelltransformer": _self.constructDisplayImage, // No I18N
            };	
			}			
			header["area.space_area"]= { // No I18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructArea, // No I18N
			};
			header["site"]= { // No I18N
                "hide_label": false, //No i18N
				"value_path" : "site.name", // No I18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructSite, // No I18N
			};
			if(_self.module=="spaces"||_self.module=="space_structures"||_self.module=="space_buildings"||_self.module=="space_nonbuildings"||_self.module=="space_floors"||_self.module=="space_rooms"||_self.module=="space_roompartitions"){
			header["space_campus"]= { // No I18N
                "hide_label": false, //No i18N
				"value_path" : "space_campus.name", // No I18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructCampus, // No I18N
			};
			}
			if(_self.module=="spaces"||_self.module=="space_floors"||_self.module=="space_rooms"||_self.module=="space_roompartitions"){
			header["space_building"]= { // No I18N
                "hide_label": false, //No i18N
				"value_path" : "space_building.name", // No I18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructBuilding, // No I18N
			};
			}	
			if(_self.module=="spaces"||_self.module=="space_rooms"||_self.module=="space_roompartitions"){
			header["space_floor"]= { // No I18N
                "hide_label": false, //No i18N
				"value_path" : "space_floor.name", // No I18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructFloor, // No I18N
			};
			if(_self.module=="space_rooms"){
			header["is_floating_capacity"]= { // No I18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructFloating, // No I18N
			};
			header["is_room_partitionable"]= { // No I18N
                "hide_label": false, //No i18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructPartitionable, // No I18N
			};
			}
			else{
				header["space_room"]= { // No I18N
                "hide_label": false, //No i18N
				"value_path" : "space_room.name", // No I18N
                "column_settings": { //No i18N
                    "position": 2 //No I18N
                },
				"dataCelltransformer": _self.constructRoom, // No I18N
			};
			}
			}				
			}
			else{
			header["created_by"]= { // No I18N
				"default": true, //No i18N
                "hide_label": true, //No i18N
				"value_path" : "created_by.name", // No I18N
				"dataCelltransformer": _self.constructCreatedByCell, // No I18N
                "column_settings": { //No i18N
                    "position": 4, //No I18N
					"rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                }
			};					
			}

        return header;
    },
	r.constructTreeCell = function(table_data){
		if(r.current_view_mode == "table"){
			return '<span data-action-name="handleSPaceTree" data-space-id="'+table_data.row_data.id+'" class="sspr icon-lg tree-view cur-ptr ml5 top-1 a11yemphasize" role="img" rel="uitip" title="'+window.translate('view.in.tree')+'" data-view="tree"></span>';
		}
		else{
		return '<div data-action-name="handleSPaceTree" data-space-id="'+table_data.row_data.id+'" class="k_div mt15 mb2 fw "><span class="disp-ib text-overflow"><span class="sspr icon-lg tree-view cur-ptr pos-abs top10 ml1" role="img" rel="uitip" title="'+window.translate('view.in.tree')+'" data-view="tree"></span></span></div>';
		}
	},
    r.constructChkboxCell = function(table_data){
        var rd = table_data.row_data;
        return "<input type='checkbox' name='checkbox' class='pos-abs top15 mt2' value=" + rd.id + " data-table-checkbox>"; //No I18N
    },
    r.callbackAfterTableRender = function(){
		var self=this;	
		if(!self.externalframe||(self.externalframe && this.fromPage == "details")) {
			window.$SPObjLoadedRecords = Object.assign({},$spaceList.table_comp_space.loadedRecords);
			window.$SPObjLoadedIDs = Object.assign({},$spaceList.table_comp_space.loadedIDs);
		}
		else{
			jQuery('.listview.space-right').css({'min-height':'500px','padding-bottom':'80px'}); // No I18N
		}
		initTooltip(".listcontrols"); // No I18N
		jQuery('#space-section [data-action-name="handleSPaceTree"]').off('click').on('click', (event) => { // No I18N
			$spaceList.handleSPaceTree(event.currentTarget.dataset.spaceId);
		});
		jQuery('#space-section [data-action-name="openSpaceDetailsPage"]').off('click').on('click', (event) => { // No I18N
			window.open('/ui/space?mode=details&module='+event.currentTarget.dataset.module+'&entity_id='+event.currentTarget.dataset.entityId,'_blank','noopener');
		});
		jQuery('#space-section [data-action-name="openSpaceEditPage"]').off('click').on('click', (event) => { // No I18N
			$spaceList.openFormInPreview(event.currentTarget.dataset.module,'edit',event.currentTarget.dataset.id); // No I18N
		});
		jQuery('#space-section [data-action-name="nonbuilding-add"]').off('click').on('click', (event) => { // No I18N
			$spaceList.openFormInPreview('nonbuilding','add'); // No I18N
		});
		jQuery('#space-section [data-action-name="building-add"]').off('click').on('click', (event) => { // No I18N
			$spaceList.openFormInPreview('building','add'); // No I18N
		});
		jQuery('#space-section [data-action-name="space-others-add"]').off('click').on('click', (event) => { // No I18N
			$spaceList.openFormInPreview(event.currentTarget.dataset.spaceSubModule,'add'); // No I18N
		});
    },
	r.constructNameCell = function(table_data){
        var rd = table_data.row_data;
		if($spaceList.spaceSubModule=="facility")		{
			return '<a href="/" '+('rel="uitip" mode_ellipsis=true title="'+e_attr(rd.name)+'" ')+'> '+e_html(rd.name)+' </a>';
		}
		else{
			return '<a '+(' mode_ellipsis=true title="'+e_attr(rd.name)+'" ')+'  '+($spaceList.externalframe==true?' rel="uitip" href="/" data-action-name="openSpaceDetailsPage" data-module="'+e_attr((rd.common_module).split("_")[1])+'" data-entity-id="'+rd.id+'" ':' rel="uitip noopener" href="/ui/space?mode=details&module='+e_attr((rd.common_module).split("_")[1])+'&entity_id='+rd.id+'" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-details" ')+'> '+e_html(rd.name)+' </a>';
		}
    },
    r.constructStatus = function(table_data){
        var rd = table_data.row_data;
		var col_str='<div '+('rel="uitip" '+(r.current_view_mode == "linear"? '':' mode_ellipsis=true ')+' title="'+(r.current_view_mode == "linear"?window.getMessageForKey('sdp.requests.common.status')+': '+e_attr(e_html(rd.status.name)):e_attr(rd.status.name))+'"')+' class="text-overflow pr5"><span  class="arrowBG mr5 mt1 fl" style="background:'+e_attr(rd.status.color)+'"></span>'+e_html(rd.status.name)+'</div>';
        return col_str;
    },
    r.constructTemplateCell = function(table_data){
        var rd = table_data.row_data;
		return '<span '+('rel="uitip" '+(r.current_view_mode == "linear"? '':' mode_ellipsis=true ')+' title="'+(r.current_view_mode == "linear"?window.getMessageForKey('sdp.admin.requesttemplate.template')+': '+e_attr(e_html(rd.template.name)):e_attr(rd.template.name))+'"')+' >'+e_html(rd.template?rd.template.name:'-')+'</span>';
    },	
    r.constructCreatedByCell = function(table_data){
        var rd = table_data.row_data;
		return '<span '+('rel="uitip" '+(r.current_view_mode == "linear"? '':' mode_ellipsis=true ')+' title="'+(r.current_view_mode == "linear"?window.getMessageForKey('common.createdby')+': '+e_attr(e_html(rd.created_by.name)):e_attr(rd.created_by.name))+'"')+' >'+e_html(rd.created_by?rd.created_by.name:'-')+'</span>';
    },	
    r.constructSite = function(table_data){
        var rd = table_data.row_data;
		var site = rd.site? e_html(rd.site.name) : getMessageForKey("sdp.admin.technician.addtechnician.nosite"); // No I18N
		var col_str;
		if(r.current_view_mode == "table"){
			col_str='<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr(rd.site? rd.site.name:getMessageForKey("sdp.admin.technician.addtechnician.nosite"))+'" ':'')+' >'+site+'</span>';
		}
		else{
			col_str='<div class="pt5 pb5 "><span class="sspr icon-xs pin vtop mr5"></span>'+site+'</div>';
		}
        return col_str;
    },
    r.constructCampus = function(table_data){
        var rd = table_data.row_data;
		return '<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr(rd.space_campus?rd.space_campus.name:'-')+'" ':'')+'>'+e_html(rd.space_campus?rd.space_campus.name:'-')+'</span>';
    },
	r.constructFloating = function(table_data){
        var rd = table_data.row_data;
		if(rd.is_floating_capacity&&rd.is_floating_capacity==true)
		{
			return '<span>Yes</span>'; // No I18N
		}
		else{
			return '<span>No</span>'; // No I18N
		}
    },
	r.constructPartitionable = function(table_data){
        var rd = table_data.row_data;
		if(rd.is_room_partitionable&&rd.is_room_partitionable==true)
		{
			return '<span>Yes</span>'; // No I18N
		}
		else{
			return '<span>No</span>'; // No I18N
		}
    },	
    r.constructBuilding = function(table_data){
        var rd = table_data.row_data;
		return '<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr(rd.space_building?rd.space_building.name:'-')+'" ':'')+' >'+e_html(rd.space_building?rd.space_building.name:'-')+'</span>';
    },	
    r.constructFloor = function(table_data){
        var rd = table_data.row_data;
		return '<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr(rd.space_floor?rd.space_floor.name:'-')+'" ':'')+' >'+e_html(rd.space_floor?rd.space_floor.name:'-')+'</span>';
    },		
    r.constructRoom = function(table_data){
        var rd = table_data.row_data;
		return '<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr(rd.space_room?rd.space_room.name:'-')+'" ':'')+' >'+e_html(rd.space_room?rd.space_room.name:'-')+'</span>';
    },	
    r.constructArea = function(table_data){
        var rd = table_data.row_data;
		var col_str='<span '+(r.current_view_mode != "linear"?'rel="uitip" mode_ellipsis=true title="'+e_attr((rd.area.space_area?rd.area.space_area:"-")+" " + (rd.area.area_unit?rd.area.area_unit.name:""))+'" ':'')+' >'+e_html(rd.area.space_area?rd.area.space_area:"-")+" "+e_html(rd.area.area_unit?rd.area.area_unit.name:"")+'</span>';
        return col_str;
    },
	r.constructDisplayImage = function(table_data){
		var rd = table_data.row_data;
		if(rd.display_image){
			var urlModule=this.$spaceList.module;
			if($spaceList.isGlobalSearch){
				urlModule=rd.type.api_plural_name;
			}
			var srcUrl=e_attr('/api/v3/spaces/'+urlModule+'/'+rd.id+'/attachments/'+rd.display_image+'/download'); // No I18N
			return '<div class="k_div space-img-container"><img loading="lazy" src="'+srcUrl+'" class="fw" alt="Signature Tower"></div>';
		}
		else{
			var noPhotoKey=window.translate('no.photo.available');
			return '<div class="k_div no-img-common mt2"><div class="block-bordered tc text-color5"><div class="mt25 mb30"><span class="sspr icon-xxl no-image-icon1 tf0-8" role="img" title="'+noPhotoKey+'"></span><div class="ml3 mr3">'+noPhotoKey+'</div></div></div></div>';
		}
		return '';
	},
    r.constructActionCell = function(table_data){
		var _self = this;
        var rd = table_data.row_data;
        var entity = "" ; // No I18N
        var dataAttr = "data-"+rd.common_module; // No I18N
        var col_str;
        if(r.current_view_mode == "linear"){
            col_str = '<div id="actions_'+rd.id+'" class="btn-group tc-req-edit bs-noconflict pos-abs pl1 top15"  > <a href="/" rel="uitip" class="cur-ptr cspr menulist icon-xs flat sdmenu-toggle vbottom ml3" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
                        '<ul class="sdmenu-dd" role="menu">'; // No I18N
            col_str += $spaceList.constructActioncellOptions(rd,dataAttr);
            col_str +='</ul></div>';// No I18N
        }
        else{
			if(!_self.externalframe||(_self.externalframe && _self.fromPage == "details")) {
				col_str = '<div class="tc ml-5"><div id="actions_'+rd.id+'" class="btn-group tc-req-edit bs-noconflict pos-abs"  > <a href="/" rel="uitip" class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle mt-2" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
							'<ul class="sdmenu-dd" role="menu">'; // No I18N
				col_str += $spaceList.constructActioncellOptions(rd,dataAttr);
				col_str +='</ul></div></div>';// No I18N
			}
			else{
				col_str = '<div class="tc"><div id="actions_'+rd.id+'" class="btn-group tc-req-edit bs-noconflict"  > <a href="/" rel="uitip" class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle mt-4 ml5 mr5" data-switch="sdmenu" title="' + getMessageForKey("sdp.common.actions") + '" ></a>' +
							'<ul class="sdmenu-dd" role="menu">'; // No I18N
				col_str += $spaceList.constructActioncellOptions(rd,dataAttr);
				col_str +='</ul></div></div>';// No I18N
			}
        }
        return col_str;
    },
    r.constructActioncellOptions = function(rd,dataAttr){
        var html = "";// No I18N
        html += $spaceList.permissions.edit ? ('<li><a '+($spaceList.min_preview==true||$spaceList.min_preview=="true"?' href="/" data-action-name="openSpaceEditPage" data-module="'+e_attr((this.spaceSubModule=="facility"?"facility":(rd.common_module).split("_")[1]))+'" data-id="'+rd.id+'" ':(' data-spa="true" data-spa-module="spaces" data-spa-page="spaces-edit" rel="noopener" href="/ui/space?mode=edit&module='+(this.spaceSubModule=="facility"?"facility":(rd.common_module).split("_")[1])+'&fromPage=list&entity_id='+rd.id+'"  '))+dataAttr+'>' + getMessageForKey("sdp.common.edit") + ' </a></li>') : "";
        html += $spaceList.permissions["delete"] ? ('<li><a href="/" data-table-delete data-entityid='+ rd.id +'>'  + getMessageForKey("sdp.common.delete") + '</a></li>') : "";// No I18N
		return html;
    },
    r.switchSpaceView = function(view_mode) {
        var current_view = {};
		var _self=this;
		_self.showFilters=false;
		var viewKey = _self.module+"_currentview"; // No I18N
		if(_self.isGlobalSearch){
			viewKey="global_"+viewKey; // No I18N
		}
        if(sdp_user.CLIENT_CONF[viewKey]){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF[viewKey]);
        }
        var viewMode;
        if(view_mode == "classic"){ // No I18N
            $spaceList.viewMode = 'classic'; // No I18N
            viewMode = "linear"; // No I18N
            current_view.view = 'classic'; // No I18N
        }
        else if(view_mode == "table"){ // No I18N
            $spaceList.viewMode = 'table'; // No I18N
            viewMode = "table"; // No I18N
            current_view.view = "table"; // No I18N
        }
        addPersonalization(viewKey,current_view);
        //pass view as kanban to settemplate for a classic view
        current_view.view = (current_view.view == "classic") ? "kanban" : current_view.view; // No I18N
        $spaceList.setTemplate(current_view.view,viewMode); // No I18N
        $spaceList.LeftPanelHeight();		
    },
    r.setDataMetaInfo = function(){
       // return {"for":"list_view"}; // No I18N
    },
    r.advFilterSettingsCB = function(){
        return {
            "options":{ // No I18N
                "metainfo_entity" : $spaceList.module, // No I18N
                "allowReadOnly" : true, // No I18N
                "haveOtherUDF" : true, // No I18N
                "setNullSiteDef" : true, // No I18N
				"skip_fields" :["available_capacity"],  // No I18N
				"includeSubFields" : ["area"]// No I18N
            }
        }
    },	
	r.handleAdvancedFilter = function(search_criteria){
		if(search_criteria){
			jQuery('#spaceFilter_'+$spaceList.spaceSubModule).prop("disabled", true);  // No I18N
			$spaceList.table_comp_space.t_obj.table_info.list_info.search_criteria=search_criteria;
		}
		else{
			jQuery('#spaceFilter_'+$spaceList.spaceSubModule).prop("disabled", false);  // No I18N
			delete $spaceList.table_comp_space.t_obj.table_info.list_info.search_criteria;
		}
		if($spaceList.showFilters){			
			$spaceList.clearFilter();
		}else{
			$spaceList.table_comp_space.refreshTable("refresh"); // No I18N	
		}
	},
     r.setHeight = function(){
        var height;
        var listview_height;
        if(r.current_view_mode == "linear"){ // No I18N
            listview_height = 64;
        }
        else{
            listview_height = 110;
        }
        var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
        return height-15;
     },
     r.setWidth = function(){
		if(this.isGlobalSearch){
			return jQuery('.space-right').width(); // No I18N
		 }
		 else if(this.externalframe) {
			return '100%';
		 }
        return jQuery('.listview .space-right').width(); // No I18N
     },
	 r.yourFunction = function() {
		return {
			contentCB : function(APIData){
				var fields=$space.getTemplateFields(this.id,this.template.id);
				var entityData=$space.getEntityData(this.id);
				var html='<div class="listview"><h4 class="ml10">'+translate("ae.admin.vendorServices.serviceTab")+'</h4><hr class="m0 ml10 mr10">';
				for(var i=0,ilen=fields.length;i<ilen;i++)
				{
					var key="";
					var value="";
					if(fields[i].indexOf("dec_")>-1||fields[i].indexOf("num_")>-1||fields[i].indexOf("sline_")>-1||fields[i].indexOf("mline_")>-1||fields[i].indexOf("date_")>-1||fields[i].indexOf("pick_")>-1||fields[i].indexOf("multi_")>-1){
						if($spaceList.fieldsMetaInfo.fields.udf_fields.fields[fields[i]]){
						key=$spaceList.fieldsMetaInfo.fields.udf_fields.fields[fields[i]].display_name;
						value=$space.getValue(entityData.udf_fields[fields[i]]);
						}
						else{
							continue;
						}
					}
					else{
						key=$spaceList.fieldsMetaInfo.fields[fields[i]].display_name;
						value=$space.getValue(entityData[fields[i]]);
					}
					html+='<div class="row ml10 space-fs-detail">';					
					html+='<div class="col-sm-2 text-muted">'+e_html(key)+'</div>';
					html+='<div class="col-sm-3">'+e_html(value)+'</div>';
					i++;
					if(i<ilen)
					{
						var key="";
						if(fields[i].indexOf("dec_")>-1||fields[i].indexOf("num_")>-1||fields[i].indexOf("sline_")>-1||fields[i].indexOf("mline_")>-1||fields[i].indexOf("date_")>-1||fields[i].indexOf("pick_")>-1||fields[i].indexOf("multi_")>-1){
							key=$spaceList.fieldsMetaInfo.fields.udf_fields.fields[fields[i]].display_name;
							value=$space.getValue(entityData.udf_fields[fields[i]]);
						}
						else{
							key=$spaceList.fieldsMetaInfo.fields[fields[i]].display_name;
							value=$space.getValue(entityData[fields[i]]);
						}
						html+='<div class="col-sm-2 text-muted">'+e_html(key)+'</div>';
						html+='<div class="col-sm-3">'+e_html(value)+'</div>';						
					}
					html+='</div>';
				}
				if(entityData.attachments&&entityData.attachments.length>0)
				{
					html+='<div id="attachment-api-space" >';
					for(var j=0,jlen=entityData.attachments.length;j<jlen;j++)
					{
							  html+='<button type="button" data-href="'+e_attr(entityData.attachments[j].content_url)+'"  data-attach-size="'+e_attr(entityData.attachments[j].size.display_value)+'" data-attach-id="'+e_attr(entityData.attachments[j].id)+'" data-attach-by="' + e_attr(entityData.attachments[j].attached_by.name) + '" data-attach-on="' + e_attr(entityData.attachments[j].attached_on.display_value) +'">'+e_html(entityData.attachments[j].name)+'</button>';// No I18N
					}
					html+='</div>';
				}
				html+='</div>';
				return html;
			},
			afterCB : function(APIData){
				var id = APIData.id;
				var attach_options = {
					"entity" : "facility_services", // No I18N
					"api" : false, // No I18N
					"is_odapi": true,	//No I18N
					"entity_id": id, // No I18N
					"ondelete": ['refreshAttachmentSection', $spaceList],  //No I18N
					"enable_delete" :  ($spaceList.permissions.edit==undefined?false:true) // No I18N
				};
				this.attachInstance = new attachPreview('#attachment-api-space',attach_options); //No I18N
			}
		}
	},
	r.refreshAttachmentSection = function (){
		$spaceList.table_comp_space.previewer.refresh();
	},
    r.setNoDataString = function(){
		var self=$spaceList;
		var key=self.moduleKey;
		if(self.module=="space_structures")
		{
			key="space.structure"; //No I18N
		}
		else if(self.module=="spaces"){
			key="space.field"; //No I18N
		}
		if((self.isGlobalSearch==true)||((self.current_view_mode == "linear"&&self.table_comp_space && self.table_comp_space.t_obj && (self.table_comp_space.t_obj.table_info.list_info.search_fields||self.table_comp_space.t_obj.table_info.list_info.search_criteria))||(self.current_view_mode != "linear"&&((self.table_comp_space && self.table_comp_space.t_obj && (self.table_comp_space.t_obj.table_info.list_info.search_criteria))||(self.input_data&&self.input_data.list_info&&self.input_data.list_info.search_criteria))))){
			return'<div class="tc p15"><span>'+getMessageForKey('common.noitems',[getMessageForKey(key)])+'</span></div>';
		}		
		return '<div class="tc pt30 pb30" id='+self.module+'Typenocontent">'+window.getMessageForKey("no.space.created",[window.getMessageForKey(key)])+($spaceList.permissions.add?(self.module=="space_structures"?'<span class="text-link cur-ptr" '+((self.min_preview==true||self.min_preview=="true")?(' data-action-name="nonbuilding-add" '):(' href= "/ui/space?mode=add&module=nonbuilding&fromPage=list" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-add" '))+' > '+window.getMessageForKey("create.new.space",[window.getMessageForKey("space.nonbuilding")])+'.</span> '+window.getMessageForKey("sdp.admin.common.or")+' <span class="text-link cur-ptr" '+((self.min_preview==true||self.min_preview=="true")?(' data-action-name="building-add" '):(' href= "/ui/space?mode=add&module=building&fromPage=list" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-add" '))+' > '+window.getMessageForKey("create.new.space",[window.getMessageForKey("space.building")])+'.</span>':'<span class="text-link cur-ptr" '+((self.min_preview==true||self.min_preview=="true")?(' data-action-name="space-others-add" data-space-sub-module="'+self.spaceSubModule+'" '):(' href= "/ui/space?mode=add&module='+self.spaceSubModule+'&fromPage=list" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-add"'))+' > '+window.getMessageForKey("create.new.space",[window.getMessageForKey(key)])+'.</span>'):'')+'</div>';
    },
	r.additionalMetaInfo = function(){
		var self=this;
		var obj = {};
		if(self.module=="facility_services"){
			var position = (($spaceList.permissions["delete"]==undefined&&$spaceList.permissions.edit==undefined)?1:2);
			obj = {
				"created_by": {"column_settings":{"view_type": "row","position":(position+2)},"value_path" : "created_by.name"}, //No I18N
				"last_updated_by": {"column_settings":{"position":position},"value_path" : "last_updated_by.name"}, //No I18N
				"supervisor": {"column_settings":{"position":position},"value_path" : "supervisor.name"}, //No I18N
				"template": {"column_settings":{"view_type": "row","position":(position+1)},"value_path" : "template.name"}, //No I18N
				"description": {"column_settings":{"position":position}}, //No I18N
				"created_time": {"column_settings":{"position":position}}, //No I18N
				"last_updated_time": {"column_settings":{"position":position}}, //No I18N
				"name": {"column_settings":{"rowposition": 1,"view_type": "row","position":position}}, //No I18N
			};
					var udf_fields=Object.assign({},self.fieldsMetaInfo.fields.udf_fields);
		if(udf_fields&&udf_fields.fields)
		{
			var udfKeys=Object.keys(udf_fields.fields);
			for(var i=0;i<udfKeys.length;i++)
			{
				if(udf_fields.fields[udfKeys[i]].type != "MultiSelect" && udf_fields.fields[udfKeys[i]].display_type != "MultiSelect" && udf_fields.fields[udfKeys[i]].display_type != "CheckBox"){
				 obj["udf_fields."+udfKeys[i]]={"column_settings":{"position":position}}; //No I18N
				if(udf_fields.fields[udfKeys[i]].display_type == "Pick List"||udf_fields.fields[udfKeys[i]].display_type == "Radio")
				{
					obj["udf_fields."+udfKeys[i]].value_path="udf_fields."+udfKeys[i]+".name"; // No I18N
				}	
				}
			}
		}
		} else{
		var position = self.showPhotos==true?3:2;
        obj = {
                    "space_code": {"column_settings":{"position":position}}, //No I18N
					"site": {"column_settings":{"position":position},"value_path" : "site.name"}, //No I18N
					"area.space_area": {"column_settings":{"position":position}}, //No I18N
					"available_capacity": {"column_settings":{"position":position}}, //No I18N
					"total_capacity": {"column_settings":{"position":position}}, //No I18N
					"occupied_capacity": {"column_settings":{"position":position}}, //No I18N
					"id": {"column_settings":{"position":position}}, //No I18N
					"created_by": {"column_settings":{"position":position},"value_path" : "created_by.name"}, //No I18N
					"created_time": {"column_settings":{"position":position}}, //No I18N
					"last_updated_by": {"column_settings":{"position":position},"value_path" : "last_updated_by.name"}, //No I18N
					"last_updated_time": {"column_settings":{"position":position}}, //No I18N
					"description": {"column_settings":{"position":position}}, //No I18N
                  };
		if(self.spaceSubModule=="structure")
		{
			obj["structure_type"]= {"column_settings":{"position":position}}; //No I18N
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
		}
		else if(self.spaceSubModule=="building")
		{
			obj["structure_type"]= {"column_settings":{"position":position}}; //No I18N
			obj.building_type={"column_settings":{"position":position}}; // No I18N
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
		}
		else if(self.spaceSubModule=="nonbuilding")
		{
			obj["structure_type"]= {"column_settings":{"position":position}}; //No I18N
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
		}
		else if(self.spaceSubModule=="floor")
		{
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
			obj["space_building"]= {"column_settings":{"position":position},"value_path" : "space_building.name"}; //No I18N
		}
		else if(self.spaceSubModule=="room")
		{
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
			obj["space_building"]= {"column_settings":{"position":position},"value_path" : "space_building.name"}; //No I18N
			obj["is_room_partitionable"]= {"column_settings":{"position":position}}; //No I18N
			obj["is_floating_capacity"]= {"column_settings":{"position":position}}; //No I18N
			obj["space_floor"]= {"column_settings":{"position":position},"value_path" : "space_floor.name"}; //No I18N
			obj["department"]= {"column_settings":{"position":position},"value_path" : "department.name"}; //No I18N
		}
		else if(self.spaceSubModule=="roompartition")
		{
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
			obj["space_building"]= {"column_settings":{"position":position},"value_path" : "space_building.name"}; //No I18N
			obj["space_floor"]= {"column_settings":{"position":position},"value_path" : "space_floor.name"}; //No I18N
			obj["space_room"]= {"column_settings":{"position":position},"value_path" : "space_room.name"}; //No I18N
			obj["department"]= {"column_settings":{"position":position},"value_path" : "department.name"}; //No I18N
		}
		else if(self.module=="spaces")
		{
			obj["space_campus"]= {"column_settings":{"position":position},"value_path" : "space_campus.name"}; //No I18N
			obj["space_building"]= {"column_settings":{"position":position},"value_path" : "space_building.name"}; //No I18N
			obj["space_floor"]= {"column_settings":{"position":position},"value_path" : "space_floor.name"}; //No I18N
			obj["space_room"]= {"column_settings":{"position":position},"value_path" : "space_room.name"}; //No I18N
		}
		var udf_fields=Object.assign({},self.fieldsMetaInfo.fields.udf_fields);
		if(udf_fields&&udf_fields.fields)
		{
			var udfKeys=Object.keys(udf_fields.fields);
			for(var i=0;i<udfKeys.length;i++)
			{
				if(udf_fields.fields[udfKeys[i]].type != "MultiSelect" && udf_fields.fields[udfKeys[i]].display_type != "MultiSelect" && udf_fields.fields[udfKeys[i]].display_type != "CheckBox"){
				 obj["udf_fields."+udfKeys[i]]={"column_settings":{"position":position}}; //No I18N
				if(udf_fields.fields[udfKeys[i]].display_type == "Pick List"||udf_fields.fields[udfKeys[i]].display_type == "Radio")
				{
					obj["udf_fields."+udfKeys[i]].value_path="udf_fields."+udfKeys[i]+".name"; // No I18N
				}	
				}
			}
		}
		}
		return obj;
    },
	r.getMetaData = function () {
        var _self = this;
        var metaInfo;
        var sdpOptions = {
            url: "/api/v3/"+(_self.module=="facility_services"?"":"spaces/")+(_self.module=="spaces"?"":_self.module+"/")+"_metainfo", // No I18N
            success: function(data) {
                 metaInfo = data.metainfo.fields;
				 _self.fieldsMetaInfo=data.metainfo;
            },
            cache:false,
            async: false
        };
        sdpAjax(sdpOptions);
        return metaInfo;
    },
	r.handleSPaceTree = function (id) {
		var _self=this;
		var personalization = {};
		var data = _self.table_comp_space.loadedRecords[id];
		var common_module = data.common_module.substring(6);
		if(common_module=="campus")
		{
			personalization["space_campuses"]={"id":data.id}; // No I18N
		}
		else if(common_module=="structure"||common_module=="building"||common_module=="nonbuilding")
		{
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.id}; // No I18N
		}
		else if(common_module=="floor")
		{
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			personalization["space_floors"]={"id":data.id}; // No I18N			
		}
		else if(common_module=="room"){
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			if(data.space_building.building_type!="Rooms Only"){
			personalization["space_floors"]={"id":data.space_floor.id};  // No I18N
			}
			personalization["space_rooms"]={"id":data.id}; // No I18N
		}
		else if(common_module=="roompartition"){
			personalization["space_campuses"]={"id":data.space_campus.id};  // No I18N
			personalization["space_structures"]={"id":data.space_building.id};  // No I18N
			if(data.space_building.building_type!="Rooms Only"){
			personalization["space_floors"]={"id":data.space_floor.id};  // No I18N
			}
			personalization["space_rooms"]={"id":data.space_room.id}; // No I18N
		}		
		addPersonalization("spacetree", personalization, true); // NO I18N
		if(_self.min_preview==true||_self.min_preview=="true")
		{
			window.open('/ui/space?mode=list&module=tree');
		}
		else{
		_self.switchTab('tree','',false); // No I18N
		}
	},
	r.changeAlSpaceFilter = function(ele,gsearch){
		var common_module_input = jQuery(ele).val();
		if(common_module_input=="all"){
			common_module_input="space"; // No I18N
		}
        this.init(common_module_input, '', false,false,null,gsearch);
	},
	r.openFormInPreview = function(module,mode,id)
	{
		var self=this;
		if(mode=="add"&&module.indexOf("building")>-1){
			jQuery('#addnewBtn_space_structures').removeClass("open");
		}
		//Need to close actions popover in details page subtabs when edit is clicked
		var elem=jQuery('#actions_'+id);
		if(elem.length>0){
			elem.removeClass('open');
		}
		var options = {
                url: '/ui/space?mode='+mode+'&module='+module+'&container=space-form-dialog&externalframe=false&min_preview=true'+(module=="roompartition"&&mode=="add"?'&room_id='+self.room_id+'&site_id='+self.site_id:'')+(id?'&entity_id='+id:''), //No I18N
                container: "space-form-dialog", //No I18N
                width: "75%", //No I18N
                onClose: self.onclose
            };
			$previewComponent.load(options.url,'', "1140px", parseInt(jQuery(window).height()) - 65, null, "space-form-dialog", true, 98);  // No I18N
            //$Previewer.showPreview(options, event);
	}
    return r;
}()),$spaceList);