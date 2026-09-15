/* $Id$ */
var $spForm = spaceForm = {
    /*Initialize new/edit form */
    initialize: function(options) {
        if(!(options.min_preview==true||options.min_preview=="true")){
			jQuery('body').removeClass('of-h');
		}
		else{
			jQuery('#spaceFormDetailView').removeClass('p10');
		}
        var self = this;
		if(jQuery("#showPopover").is(":visible")){
			jQuery("#showPopover").hide();
		}
        self.setProp(options);
        //self.entitydata = null
    },
    /*Load template*/
    loadTemplate: function(templateId, editId, entityData) {
        var self = this, parentElement = jQuery('#sf-container');
        var templateRC = {};
		if(templateId)
		{
			templateRC = self.getEntityAll((self.metainfo.fields.template.href).substring(1)+'/'+templateId, null, self.templateModule)[0]; //NO I18N
		}
		else{
			if(self.module=="space")
			{
				var input_data_module={"module":{"name":self.entityName}}; //NO I18N
				templateRC = self.getEntityAll(self.templateModule+'s/default', null, self.templateModule,input_data_module)[0]; //NO I18N
			}
			else{
				templateRC = self.getEntityAll(self.templateModule+'s/default', null, self.templateModule)[0]; //NO I18N
			}
		}
		self.templateId=templateRC.id;
        var formHeaderData = {};
        formHeaderData.editId = editId;
        formHeaderData.module = self.entityName;
        formHeaderData.headerKey = self.headerKey;
		formHeaderData.subModule=self.subModule;
		formHeaderData.min_preview=self.min_preview;
        renderhbs("#sf-header", "spaceform_header_template", formHeaderData ,false,"spacemodule");// NO I18N
        self.constructMetaInfo(self.metainfo.fields,entityData);
        self.constructTemplateInfo(templateRC);
        self.initTemplateList(templateRC);
        if(self.module=="space"&&self.editId && entityData){
			if(self.subModule!="campus"){
			 self.CampusSiteMap[entityData.space_campus.id]=entityData.site;
			}
			if(self.subModule=="roompartition"){
				self.site_id=entityData.site;
			}
            entityData.site = entityData.site ? entityData.site : {"id":-1,"name":translate('common.site.nosite')};//NO I18N
			entityData.is_floating_capacity&(entityData.is_floating_capacity?entityData.is_floating_capacity={"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")}:entityData.is_floating_capacity={"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}); // No I18N
			entityData.is_room_partitionable&(entityData.is_room_partitionable?entityData.is_room_partitionable={"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")}:entityData.is_room_partitionable={"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}); // No I18N
        }
        var configJSON = {
            name: "sfForm", // No I18N
            entity: self.entityName, // No I18N 
            entitypath: "/" + self.entityNamePl, // No I18N 
            template: templateRC,
            metadata: jQuery.extend(true, {}, self.metainfo),
            entitydata: entityData || templateRC[self.entityName],
            mode: self.editId ? "edit" : "new", // No I18N
            container: "sf-container", // No I18N
            formid: "sfForm", // No I18N
            inlineImagesEntity: self.entityName, //NO I18N
			skipEditFields:self.non_editable_fields,
            allowedValuesCallback: "spaceForm.getAllowedValues", //NO I18N
            edit: {
                fields: {
                    status: {
                        allowClear: false
                    },
                    "site": { //No I18N
                        allowClear: false
                    },
					"space_campus": { //No I18N
                        allowClear: false
                    },
					"space_building": { //No I18N
                        allowClear: false
                    },
					is_room_partitionable: {
						allowClear: false
					},
					"area.space_area": { //No I18N
                    custom_render: self.loadAreaField
					} // No I18N
                },
                defaults: {
                    lookup: {
                        placeholder: translate('sdp.change.sla.select')
                    }
                }
            },	
            save: {
                url: self.editId ? "/api/v3/"+(self.module=="facility_service"?'':(self.modulePl+"/")) + self.entityNamePl + "/" + self.editId + "" : "/api/v3/"+(self.module=="facility_service"?'':(self.modulePl+"/")) + self.entityNamePl, //NO I18N
                entity: self.entityName, //NO I18N
                submit: true,
                onsave: "spaceForm.modifySaveData", //NO I18N
                cancel: "spaceForm.cancelForm", //No I18N
                postsuccess: function(data) {
					if(self.min_preview==true||self.min_preview=="true"){
						$previewComponent.closePreview("space-form-dialog"); //NO I18N
						if(window.$sDetails)
						{
							var tabName='details'; //No I18N
							if(self.subModule.indexOf("building")>-1){
								tabName="structures"; //No I18N
							}
							else if(self.subModule=="roompartition")
							{
								tabName="partition"; //No I18N
							}
							else{
								tabName=self.subModule+"s"; //No I18N
							}
							window.$sDetails.fetchEntityData(function() {
							window.$sDetails.$detailsComp.refreshPanel("panel","content-right"); // NO I18N
							});
							window.$sDetails.gotoTab(tabName);
						}
						return;
					}					
					if(self.subModule!="facility"){
						$spa.navigate("/ui/space?mode=details&module="+self.subModule+"&entity_id="+data[self.entityName].id, "spaces", "spaces-details",true);	//No I18N
					}
					else {
						window.externalframe=undefined;
						$spa.navigate("/ui/space?mode=list&module=facility", "spaces", "spaces-list",true);	//No I18N
					}
                },
                submitbutton: {
                    add: window.getMessageForKey("sdp.common.save"), //No I18N
                }
            },
			afterRenderCallback: "spaceForm.afterrenderpage", //No I18N
            entityName: translate('space.'+self.subModule),  //No I18N
			customform : true
        };
		if(self.module=="space")
		{
			configJSON.save.onsubmit= "spaceForm.validateForm"; //No I18N
			if(self.subModule=="campus")
			{
				configJSON["dependentFields"]=[{fields: ["site","supervisors"], order: true}]; //No I18N
			}
			else if(self.subModule=="building"||self.subModule=="nonbuilding")
			{
				configJSON["dependentFields"]=[{fields: ["space_campus","supervisors"], order: true}]; //No I18N
			}	
			else if(self.subModule=="floor")
			{
				configJSON["dependentFields"]=[{fields: ["space_campus","space_building"], order: true},{fields: ["space_campus","supervisors"], order: true}]; //No I18N
			}
			else if(self.subModule=="room")
			{
				configJSON["dependentFields"]=[{fields: ["space_campus","space_building","space_floor"], order: true},{fields: ["space_campus","supervisors"], order: true},{fields: ["space_campus","department"], order: true}]; //No I18N
			}
			
		}
		if(self.subModule=="room"||self.subModule=="nonbuilding"||self.subModule=="roompartition")
		{
					configJSON["linkedFields"]	 = [
            {
                fields : ["occupied_capacity","total_capacity"], //NO I18N
                denote_field : ["occupied_capacity"], //NO I18N
                message : "Occupied Capacity cannot be greater than Total Capacity ", //NO I18N
                validation: function(valueJson)
                {
                    if(valueJson.occupied_capacity&&valueJson.total_capacity&&parseInt(valueJson.occupied_capacity) > parseInt(valueJson.total_capacity))
                    {
                        return false;
                    }

                    return true;
                }
            }]
		}
		if(self.min_preview==true||self.min_preview=="true"){
			configJSON.scrollContainer = "#space-form-dialog";	//No I18N
		}	
            //Add bulk select configs for udf fields
        if(self.module=="space"){
			configJSON.edit.fields["amenities"] = { selection_handler: "$space.showBulkSelect"}; //No I18N
			configJSON.edit.fields["criticalities"] = { selection_handler: "$space.showBulkSelect"}; //No I18N
			configJSON.edit.fields["supervisors"] = { selection_handler: "spaceForm.showBulkSelectSupervisors"}; //No I18N
        }		
        window.$spfform = new FC(configJSON);
        /*Onchange function for template dropdown*/
		if(self.subModule!="roompartition"){
        jQuery('#sf-header').off('change').on('change', '#sf_template', function() { //NO I18N
            if (!self.editId) {
                $spfform.destroy();
				var templateid=this.value;
				if(!(self.min_preview==true||self.min_preview=="true")&&!self.editId){
					var url="/ui/space?mode=add&module="+self.subModule+"&fromPage="+self.fromPage+"&templateid="; //No I18N
					window.history.replaceState({templateid:templateid}, "", url+templateid);	//No I18N
				}
                self.loadTemplate(this.value);
            }
        });
		}
        if (editId) {
            jQuery("#browserTitleInfo").find("#bt_id").text(entityData.id).end().find("#bt_title").text(entityData.name); // No I18N
        }
        applyBrowserTitle();
    },

    /**
     * Append the fields value outside form, eg, area field in form
     */
    modifySaveData: function(saveData) {
		var self=this;
		if(self.module!="facility_service"){
		var inputKeys = Object.keys(saveData);
		for(var i=0;i<inputKeys.length;i++)
		{
			if(inputKeys[i]=="site"&&saveData["site"]&&saveData["site"].id==-1)
			{
				saveData["site"]=null;
			}
			if(inputKeys[i]=="is_room_partitionable"&&saveData["is_room_partitionable"])
			{
				if(saveData["is_room_partitionable"].id==1)
				{
					saveData["is_room_partitionable"]=true;
				}
				else 
				{
					saveData["is_room_partitionable"]=false;
				}
			}
			if(inputKeys[i]=="is_floating_capacity")
			{
				if(saveData["is_floating_capacity"].id==1)
				{
					saveData["is_floating_capacity"]=true;
				}
				else 
				{
					saveData["is_floating_capacity"]=false;
				}
			}
			if(inputKeys[i]=="building_type"&&saveData["building_type"])
			{
				if(saveData["building_type"].id==1)
				{
					saveData["building_type"]="Floors and Rooms";  // No I18N
				}
				else 
				{
					saveData["building_type"]="Rooms Only";  // No I18N
				}
			}
		}
		if(saveData["supervisors"]==null)
		{
			delete saveData["supervisors"];
		}
		if(window.$spfform.fields["area.space_area"]){
		saveData["area"]={};
		saveData["area"].space_area=saveData["area.space_area"];
		var data = jQuery('#areaSelect2').select2('data'); //NO I18N
		if(data&&data.text)
		{
			data.name=data.text;
			delete data["text"];
		}
		saveData["area"].area_unit=data;
		delete saveData["area.space_area"];
		}
		if((!self.editId||self.editId == "null")&&self.subModule=="roompartition")
		{
			saveData["space_room"]= {"id":self.room_id};//NO I18N
		}
		delete saveData["available_capacity"];
		if (self.subModule!="nonbuilding"&&self.subModule!="room"&&self.subModule!="roompartition")
		{
			delete saveData["occupied_capacity"];
			delete saveData["total_capacity"];
		}
		else{
			if(!self.editId){
			if(($spfform.fields["occupied_capacity"])&&(saveData["occupied_capacity"]==""||saveData["occupied_capacity"]==null))
			{
				saveData["occupied_capacity"]=0;
			}
			if(($spfform.fields["total_capacity"])&&(saveData["total_capacity"]==""||saveData["total_capacity"]==null))
			{
				saveData["total_capacity"]=0;
			}	
			}			
		}
		if(self.subModule=="room"||self.subModule=="roompartition")
		{
			var layoutData=[];
			for(var i=0;i<self.layoutIds.length;i++)
			{
				var data = jQuery('#roomlayout'+self.layoutIds[i]).select2('data'); //NO I18N
				var capacity= jQuery('#roomcapacity'+self.layoutIds[i]).val();
				if(data)
				{
					if(capacity==null||capacity==""){
						capacity=0;
					}
					data.name=data.text;
					delete data["text"];
					layoutData.push({"room_layout": data,"capacity": capacity});
				}
			}
			if(layoutData)
			{
				saveData["room_layouts"]=layoutData;
			}
		}
		if(self.display_image)
		{
			/*
			For add we should always check savedata for edit if no attachment is added ot deleted then savedata.attachments will be null 
			and we have to check entitydata in this case. If any attachment i added or deleted savedata wont be null so wec an check in savedata
			*/
			if(self.isValidDisplayImage(saveData)||(!saveData.attachments&&self.isValidDisplayImage(self.entitydata))){
			saveData["display_image"]=self.display_image;
			}
			else{
				saveData["display_image"]=""; //No I18N
				self.display_image="";
			}
		}
		if(!(self.display_image)){
			if(saveData&&saveData.attachments&&saveData.attachments.length>0){
				saveData["display_image"]=saveData.attachments[0].id;
			}
			else if(!saveData.attachments&&self.entitydata&&self.entitydata.attachments&&self.entitydata.attachments.length>0){
				saveData["display_image"]=self.entitydata.attachments[0].id;
			}
			else{
				saveData["display_image"]=""; //No I18N
			}
		}			
		}
		if(!self.editId||self.editId == "null")
		{
			saveData["template"]={"id":self.templateId}; //NO I18N
		}
        return saveData;
    },
	isValidDisplayImage:function(saveData)
	{
		var self=this;
		if(saveData&&saveData.attachments&&saveData.attachments.length>0)
		{
			for(var k=0,kLen=saveData.attachments.length;k<kLen;k++)
			{
				if(saveData.attachments[k].id.toString()==self.display_image)
				{
					isValidDisplayImage=true;
					return true;
				}
			}
		}
		return false;
	},
    /* Modify metainfo to add the missing properties required for components */
    constructMetaInfo: function(metaFields,entityData) {
        /*Code for removing multiselect icon for all multiselect roles and udf_multiseelct fields*/
		var self=this;
        var metaKeys = Object.keys(metaFields);
        for (var i = 0; i < metaKeys.length; i++) {
            if (metaFields[metaKeys[i]].type == "lookup") {
                metaFields[metaKeys[i]].placeholder = getMessageForKey("form.select.placeholder", [metaFields[metaKeys[i]].display_name]);
            } else if (metaKeys[i] == "udf_fields") {
                var udfFields = metaFields[metaKeys[i]].fields;
                var udfFieldsObj = Object.keys(udfFields);
                for (var j = 0; j < udfFieldsObj.length; j++) {
                    if (udfFields[udfFieldsObj[j]].display_type == "MultiSelect") {
                        udfFields[udfFieldsObj[j]].selection_handler = false;
                    }
                }
            }
        }
		if (self.subModule!="nonbuilding"&&self.subModule!="room"&&self.subModule!="roompartition") {
			if(self.metainfo.fields.total_capacity)
			{
				self.metainfo.fields.total_capacity.read_only=true;
			}
			if(self.metainfo.fields.occupied_capacity)
			{
				self.metainfo.fields.occupied_capacity.read_only=true;
			}
		}
		if(self.metainfo.fields.building_type)
		{
			self.metainfo.fields.building_type.type="lookup";
		}
		if(self.metainfo.fields.is_room_partitionable)
		{
			self.metainfo.fields.is_room_partitionable.type="lookup";
			self.metainfo.fields.is_room_partitionable.default_value={"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")};//NO I18N
		}
		if(self.metainfo.fields.is_floating_capacity)
		{
			self.metainfo.fields.is_floating_capacity.type="lookup";
		}
    },
    /*Before Rendering form constructing template field changes*/
    constructTemplateInfo: function(templateRC) {
        var self = this;
        //!templateRC[self.entityName].site ? templateRC[self.entityName].site=null : null; 
        var layouts = templateRC.layouts;
        for (var i = 0; i < layouts[0].sections.length; i++) {
            var secObj = layouts[0].sections[i];
			secObj.position.row=secObj.position.row+1;
			if((self.subModule=="room"||self.subModule=="roompartition")&&i==layouts[0].sections.length-1)
			{
				secObj.custom_section = true;
                secObj.partial = "space_room_layouts_template"; // No I18N
				secObj.room_layouts=self.room_layouts;
				secObj.has_fields = true;
			}
			for(var j=0,jLen=secObj.fields.length;j<jLen;j++)
			{
				if(secObj.fields[j].name=="space_area")
				{
					secObj.fields[j].name="area.space_area";
					self.areaHT=secObj.fields[j].help_text;
				}
			}
        }

        self.modifyUDFFieldsProperty(layouts[0], templateRC[self.entityName].udf_fields);

        /** adding Attachments inside layout */
        var attachLayout = {};
        attachLayout.title = (self.module=="facility_service"?window.getMessageForKey("sdp.common.attachments"):window.getMessageForKey("space.imageattachment")); //No I18N
        attachLayout.sections = [{
            type: "attachments", //No I18N
            id: "attachments", //No I18N
            container_id: "sf-attachment", //No I18N
            options: {
                api: false,
                upload_api: true,
                upload: true,
                enable_delete: true,
                is_odapi: true,
                download: true,
				iconRender: (self.module=="facility_service"?false:true), // No I18N
				markactivefn: function(id) {
					self.display_image=id;
				},
                entity: (self.module=="facility_service"?'':(self.modulePl+"/")) + self.entityNamePl //No I18N
            }
        }];
		if(self.module!="facility_service"){
			 attachLayout.sections[0].options.allowed_ext=['jpeg','jpg','png','gif']; //No I18N
			 attachLayout.sections[0].options.accept_mimes = "image/png,image/jpeg"; // No I18N
		}		
		if(self.display_image)
		{
			attachLayout.sections[0].options.markactiveAttach={"id":self.display_image};
		}
        layouts.splice(1, 0, attachLayout);
        return templateRC;
    },
    /**
     * Adds context=udf_fields inside fields property
     * @layouts - [Object] layouts which contains fields
     * @udf_fields - [Object] to identify udf_fields in template layout fields, udf_fields is passed
     */
    modifyUDFFieldsProperty: function(layouts, udf_fields) {
        var self = this;
		var inputdataCB = self.getInputDataCallback();
        /*as per component need to pass context = "udf_fields" then only udf_fields render in form*/
        for (var i = 0; i < layouts.sections.length; i++) {
            for (var j = 0; j < layouts.sections[i].fields.length; j++) {
                if (udf_fields && udf_fields.hasOwnProperty(layouts.sections[i].fields[j].name)) {
                    layouts.sections[i].fields[j].context = "udf_fields";
                }
				if(inputdataCB.hasOwnProperty(layouts.sections[i].fields[j].name)){
                    layouts.sections[i].fields[j].input_data_Callback = inputdataCB[layouts.sections[i].fields[j].name];
                }
				if(layouts.sections[i].fields[j].name=="space_campus")
				{
					layouts.sections[i].fields[j].processResults=self.processResults;
				}
                layouts.sections[i].fields[j].sort = false;
            }
        }
    },
    /** Initiate template list in dropdown while new/edit page loading */
    initTemplateList: function(templateRC) {
        var self = this; //NO I18N
        var templateValue = {text: templateRC.name,id: templateRC.id};
        var templateSelect2Options = {
            value: templateValue,
            url: [{
                url: "/api/v3"+self.metainfo.fields.template.href, //NO I18N
                field: "template" //NO I18N
            }]
        };
        jQuery('#sf-header').find("#sf_template").sdp_select2(templateSelect2Options); //NO I18N
		if(this.editId && this.editId != "null"){
            jQuery('#sf-header').find("#sf_template").prop('disabled',true);//NO I18N
        }
    },

    /*Passed this for bulk select for services once handled in component need to remove*/
    getAllowedValues: function(callback, formcomp) {
		formcomp.allowedValues.building_type=[{"id":1,"name":getMessageForKey("floors.and.rooms")},{"id":2,"name":getMessageForKey("rooms.only")}]; // No I18N
		formcomp.allowedValues.is_room_partitionable=[{"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")},{"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}]; // No I18N
		formcomp.allowedValues.is_floating_capacity=[{"id":1,"name":getMessageForKey("sdp.change.sla.emergency.yes")},{"id":2,"name":getMessageForKey("sdp.change.sla.emergency.no")}]; // No I18N
    },
    /*End*/

    /*Click function for back/cancel button in new/edit page*/
    cancelForm: function() {
		var self=this;
		if(self.min_preview==true||self.min_preview=="true")
		{
			$previewComponent.closePreview("space-form-dialog"); //NO I18N
			return;
		}
		window.externalframe=false;
		if(self.fromPage&&self.fromPage=='list'){
			$spa.navigate("/ui/space?mode=list&module="+this.subModule, "spaces", "spaces-list");	//No I18N
		}
		else{
			if(self.editId)
			{
				$spa.navigate("/ui/space?mode=details&module="+this.subModule+"&entity_id="+self.editId, "spaces", "spaces-details");	//No I18N
			}
			else{
				$spa.navigate("/ui/space?mode=list&module="+this.subModule, "spaces", "spaces-list");	//No I18N
			}		
		}
    },
    /* Function for ajax call*/
    getEntityAll: function(moduleName, moduleid, entityName, inputData) {
        var url = moduleid ? moduleName + '/' + moduleid : moduleName;
        var entityData = [];
        sdpAjax({
            url: '/api/v3/' + url, //NO I18N
            cache: false,
            async: false,
            data: sdpAjaxInputData(inputData),
            success: function(response) {
                entityData = entityData.concat(entityName ? response[entityName] : response[moduleName]);
            }
        });
        return entityData;
    },
    /*Set properties while initialize*/
    setProp: function(options) {
        var self = this;
        self.fromPage = options.fromPage;
		self.min_preview = options.min_preview;
        self.editId = options.id && options.id != "null" ? options.id : null; //NO I18N
        self.module = options.module; // No I18N
		self.modulePl = self.module+"s"; // No I18N
		self.templateModule=self.module=="space"?"space_template":"facility_service_template"; //NO I18N
        self.entityName = options.entityName; // No I18N
        self.entityNamePl = options.entityNamePl; //No I18N
		self.subModule=options.subModule;
		self.CampusSiteMap={};
		if(options.templateid&&options.templateid!="null")
		{
			self.templateid=options.templateid;
		}
        if (self.editId && self.editId != "null") {
                self.entitydata = self.getEntityAll((self.module=="facility_service"?'':(self.modulePl+"/")) +self.entityNamePl, self.editId, self.entityName)[0]; //NO I18N
				self.display_image=self.entitydata.display_image;
                self.entityRefData = jQuery.extend(true, {}, self.entitydata);
				self.room_layouts=self.entitydata.room_layouts;
				if(self.room_layouts&&self.room_layouts.length>0)
				{
					self.layoutIds=[];
					for(var i=0;i<self.room_layouts.length;i++)
					{
						self.layoutIds.push(i);
					}
					self.layoutIdMax=self.room_layouts.length-1;
				}
				else 
				{
					self.room_layouts=[];
					self.layoutIds=[0];
					self.layoutIdMax=0;
				}
        }	
		else 
		{
			self.room_layouts=[];
			self.layoutIds=[0];
			self.layoutIdMax=0;
		}
		if(self.subModule=="roompartition")
		{
			self.room_id=options.room_id;
			self.site_id=options.site_id;
		}
        self.headerKey = window.translate((options.id && options.id != "null" ? "edit." : "new.") + (self.subModule=="facility"?"facilityService":self.subModule));
		self.metainfo = self.getEntityAll((self.module=="facility_service"?'':(self.modulePl+"/")) +self.entityNamePl +(self.editId?'/'+self.editId:'')+ '/metainfo', null, 'metainfo')[0]; //NO I18N
		self.non_editable_fields= self.getNonEditableFields();
        self.loadTemplate((self.entitydata ? self.entitydata.template.id :(self.templateid? self.templateid: undefined)), self.editId, self.entitydata);		
    },
	loadAreaField : function() {
		return '<div class="disp-t fw"><div class="disp-c pos-rel w-60per" >  <div id="area.space_area_control" class="control-holder fw pos-rel"><input name="area.space_area" class="form-control valid fw" value="" data-type="double" tabindex="5"></div><!--/.control-holder--> </div><div class="disp-c pl10 w-100px maxw-100px" ><div id="areaSelect2" class="form-control mt-2 fw"></div></div></div><span class="cspr helpText info icon-sm pos-abs " rel="uitip" rel-dir="right" rel-pr="5" rel-pl="5" help-title="'+e_attr(e_attr($spForm.areaHT))+'" rel-class="help-text" rel-help-icon="true" style="visibility: hidden;"></span>';
	},
	afterrenderpage : function() {
		initTooltip("#sf-header");//NO I18N
		jQuery('#sf-header #back-to-space-listview').off('click').on('click', (event) => { // No I18N
			spaceForm.cancelForm();
		});
		var self =this;
		var areaUnit = spaceForm.entitydata && spaceForm.entitydata.area && spaceForm.entitydata.area.area_unit ? {"id":spaceForm.entitydata.area.area_unit.id,"text":spaceForm.entitydata.area.area_unit.name} : null; //NO I18N
		jQuery('#areaSelect2').sdp_select2({
			cache:{},
			closeOnSelect : false,
			value: areaUnit,
			multiple:false,
			allowClear: false,
			placeholder: getMessageForKey("form.select.placeholder",[getMessageForKey("space.areaUnit")]), // No I18N
			url:[{
				url:"/api/v3"+self.metainfo.fields.area.fields.area_unit.href,//NO I18N
				field:'area_unit',//NO I18N
				list_info:{start_index:1,row_count:25}
			}]
		});
		if (!self.room_layouts||self.room_layouts.length==0) {
			self.initRoomLayoutSelect2('roomlayout0'); //NO I18N
		}
		else{
			for(var i=0;i<self.room_layouts.length;i++)
			{
				self.initRoomLayoutSelect2('roomlayout'+i,{"id":self.room_layouts[i].room_layout.id,"text":self.room_layouts[i].room_layout.name}); //NO I18N
				jQuery('#roomcapacity'+i).val(self.room_layouts[i].capacity);
			}			
		}
		jQuery('#cloneRow1 [data-action-name="RoomLayoutAddRow"]').off('click').on('click', (event) => {//No I18N
			spaceForm.AddRow(parseInt(event.currentTarget.dataset.indexValue));
		});
		jQuery('#cloneRow1 [data-action-name="RoomLayoutRemoveRow"]').off('click').on('click', (event) => {//No I18N
			spaceForm.RemoveRow(parseInt(event.currentTarget.dataset.indexValue));
		});
		if(self.min_preview==true||self.min_preview=="true"){
			window.$spForm.CampusSiteMap=jQuery.extend(true, {}, window.$spfform.CampusSiteMap);
			if(self.subModule=="building"||self.subModule=="nonbuilding")
			{
				window.$spForm.CampusSiteMap[window.$sDetails.entity_data.id]=window.$sDetails.entity_data.site;
				window.$spfform.setFieldValue("space_campus",window.$sDetails.entity_data.id); //No I18N
				window.$spfform.disableField("space_campus"); //No I18N
			}
			else if(self.subModule=="floor")
			{
				window.$spForm.CampusSiteMap[window.$sDetails.entity_data.space_campus.id]=window.$sDetails.entity_data.site;
				window.$spfform.setFieldValue("space_campus",window.$sDetails.entity_data.space_campus.id); //No I18N
				window.$spfform.disableField("space_campus");		 //No I18N
				window.$spfform.setFieldValue("space_building",window.$sDetails.entity_data.id); //No I18N
				window.$spfform.disableField("space_building");				 //No I18N
			}
			else if(self.subModule=="room")
			{
				window.$spForm.CampusSiteMap[window.$sDetails.entity_data.space_campus.id]=window.$sDetails.entity_data.site;
				window.$spfform.setFieldValue("space_campus",window.$sDetails.entity_data.space_campus.id); //No I18N
				window.$spfform.disableField("space_campus");	 //No I18N
				if(window.$sDetails.entity_data.common_module=="space_floor")
				{
					window.$spfform.setFieldValue("space_building",window.$sDetails.entity_data.space_building.id); //No I18N
					window.$spfform.disableField("space_building"); //No I18N
					window.$spfform.setFieldValue("space_floor",window.$sDetails.entity_data.id); //No I18N
					window.$spfform.disableField("space_floor"); //No I18N
				}
				else{
					window.$spfform.setFieldValue("space_building",window.$sDetails.entity_data.id); //No I18N
					window.$spfform.disableField("space_building");					 //No I18N
				}
			}
		}
	},
	initRoomLayoutSelect2 : function(ele,selectedValue) {
		jQuery('#'+ele).sdp_select2({
			cache:{},
			closeOnSelect : false,
			value: selectedValue,
			multiple:false,
			allowClear: false,
			url:[{
				url:"/api/v3/spaces/space_rooms/room_layouts/room_layout",//NO I18N
				field:'room_layout',//NO I18N
				list_info:{start_index:1,row_count:25}
			}]
		});		
	},
	AddRow : function(current_index) {
		var self=this;
		if(!self.validateRoomLayouts()){
			return;
		}
		self.layoutIdMax=self.layoutIdMax+1;
		var html =	'<div id="layoutRow'+self.layoutIdMax+'"><div class="form-group clearfix  cloneRow1 mb10 ml20">'+
		'<div  class="col-sm-3 pl0" >'+
			'<label class="mb10 vhide" id="roomlayoutlabel'+self.layoutIdMax+'" for="roomlayout'+self.layoutIdMax+'" data-space="label">'+translate("choose.layout")+'</label>'+ //NO I18N
			'<div class="form-control spaceclone" id="roomlayout'+self.layoutIdMax+'" title="'+translate('choose.layout')+'"></div>'+
		'</div>'+
		'<div  class="col-sm-3" >'+
			'<label class="mb10  vhide" id="roomcapacitylabel'+self.layoutIdMax+'" for="roomcapacity'+self.layoutIdMax+'" data-space="label">'+ translate("sdp.inventory.asset.printerinfo.capacity")+'<span class="mandatory">*</span></label>'+
			'<input name="lname" id="roomcapacity'+self.layoutIdMax+'" type="number" class="form-control" aria-required="true">'+
		'</div>'+
		'<div class="col-sm-2 pl0 pr0 actionsdiv mt25 pt1 w-100px" >'+
            '<button type="button" class="btn-default btn-sm btn cur-ptr addrowbtn clone-add" data-clone="cloneRow1" data-action-name="RoomLayoutAddRow" data-index-value="'+self.layoutIdMax+'" rel="uitip" title="'+translate('add.row')+'"><span class="cspr icon-xs"></span></button>'+
            '<button type="button" class="btn-default btn-sm btn ml10 cur-ptr removerowbtn clone-remove" data-clone="cloneRow1" data-action-name="RoomLayoutRemoveRow" data-index-value="'+self.layoutIdMax+'" title="'+translate('remove.row')+'" rel="uitip"><span class="cspr icon-xs remove"></span></button>'+
        '</div>'+
		'</div></div>';
		html=jQuery(html);
		jQuery('#cloneRow1').append(html);
		jQuery('#layoutRow'+self.layoutIdMax+' [data-action-name="RoomLayoutAddRow"]').off('click').on('click', (event) => {//No I18N
			spaceForm.AddRow(parseInt(event.currentTarget.dataset.indexValue));
		});
		jQuery('#layoutRow'+self.layoutIdMax+' [data-action-name="RoomLayoutRemoveRow"]').off('click').on('click', (event) => {//No I18N
			spaceForm.RemoveRow(parseInt(event.currentTarget.dataset.indexValue));
		});
		initTooltip('#cloneRow1');//NO I18N
		self.initRoomLayoutSelect2("roomlayout"+self.layoutIdMax); //NO I18N
		self.layoutIds.push(self.layoutIdMax);
	},
	RemoveRow : function(current_index) {
		var self=this;
		if(self.layoutIds.length==1)
		{
			jQuery('#roomlayout0').val("").select2("destroy");
			self.initRoomLayoutSelect2("roomlayout0"); //NO I18N
			jQuery('#roomcapacity0').val("");
			return;
		}
		jQuery('#layoutRow'+current_index).remove();
		if(current_index==self.layoutIds[0])
		{
			jQuery('#roomlayoutlabel'+self.layoutIds[1]).removeClass('vhide');
			jQuery('#roomcapacitylabel'+self.layoutIds[1]).removeClass('vhide');
		}
		self.layoutIds.splice(self.layoutIds.indexOf(current_index), 1);
	},
	validateForm : function(form, field, event, editType, callback){
		var self=this;
		if(self.module=="space"){
		if(!self.ValidateArea()){
			typeof callback === "function" && callback(false); //NO I18N
			return true;
		}
		}
		else{
			typeof callback === "function" && callback(); //NO I18N
		}		
		if(self.subModule=="room"||self.subModule=="roompartition"){
		if(!self.validateRoomLayouts(true)){
			typeof callback === "function" && callback(false); //NO I18N
			return true;
		}
		else{
			typeof callback === "function" && callback(); //NO I18N
		}
		}
		else{
			typeof callback === "function" && callback(); //NO I18N
		}
		return true;
	},
	ValidateArea: function()
	{
		if(!window.$spfform.fields["area.space_area"]){
			return true;
		}
		var spaceArea= window.$spfform.getFieldValue("area.space_area"); // No I18N
		var data = jQuery('#areaSelect2').select2('data'); //NO I18N
		if(spaceArea&&!data||!spaceArea&&data)
		{
			showalert('failure',translate("area.info"),"isAutoHide=true"); // No I18N
			return false;
		}
		if(spaceArea&&!(/^[0-9]+\.[0-9]+$/.test(spaceArea))&&!(/^[+]{0,1}\d+$/.test(spaceArea)))
		{
			showalert('failure',translate("enter.valid.decimal.positive"),"isAutoHide=true"); // No I18N
			return false;			
		}
		return true;
	},
	validateRoomLayouts: function(skipEmptyRowValidation)
	{
		var self=this;
		var selectedLayouts=[];
		var total_capacity = window.$spfform.getFieldValue("total_capacity"); //NO I18N
		if(total_capacity==""||total_capacity==null)
		{
			total_capacity=0;
		}
		total_capacity=parseInt(total_capacity);
		for(var i=0;i<self.layoutIds.length;i++)
		{
			var data = jQuery('#roomlayout'+self.layoutIds[i]).select2('data'); //NO I18N
			var capacity= jQuery('#roomcapacity'+self.layoutIds[i]).val();
			if(data==null||capacity==null||capacity=="")
			{
				if(skipEmptyRowValidation){
					continue;
				}
				showalert('failure',translate("sdp.requests.fieldFormRules.fillAllFields"),"isAutoHide=true"); // No I18N
				return false;
			}
			if(!(/^\d+$/.test(capacity))){
				showalert('failure',window.getMessageForKey("positive.integer.capacity"),"isAutoHide=true"); // No I18N
				return false;				
			}
			capacity=parseInt(capacity);
			if(capacity<0)
			{
				showalert('failure',window.getMessageForKey("negative.values.found.for",[getMessageForKey("sdp.inventory.asset.printerinfo.capacity")]),"isAutoHide=true"); // No I18N
				return false;
			}
			if(total_capacity<capacity)
			{
				showalert('failure',window.translate("room.layout.capcity.error"),"isAutoHide=true"); // No I18N
				return false;
			}
			if(selectedLayouts.includes(data.id))
			{
				showalert('failure',window.translate("duplicate.room.layouts"),"isAutoHide=true"); // No I18N
				return false;
			}
			else{
				selectedLayouts.push(data.id);
			}
		}
		return true;
	},
	processResults: function(search_data, data, field) 
	{
		var self=spaceForm;
		if(data && data.id) 
		{
			search_data.push({	id: data.id,	name: data.name});
			if(data.site){
				self.CampusSiteMap[data.id]=data.site;
			}
		}
	},
	getInputDataCallback: function(){
		var self=this;
        var obj = {
            supervisors: function(urlOptions,input_data,searchText){
				var idVal="-1";
				if(self.subModule=="campus")
				{
					idVal=urlOptions.formcomp.fields.values["site"];
				}
				else if(self.subModule=="roompartition")
				{
					idVal=self.entitydata?self.entitydata.site:self.site_id;
				}
				else 
				{
					idVal=self.CampusSiteMap[urlOptions.formcomp.fields.values["space_campus"]];
					if(!idVal)
					{
						idVal="-1";
					}
					else{
						idVal=idVal.id;
					}
				}
                input_data.list_info.search_criteria= {"field": "associated_sites", "condition": "is", "value":idVal,"logical_operator":"and"}; //No I18N
				if(searchText){
					input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
				}
				delete input_data.list_info["search_fields"];
                return input_data;
            },
            "space_building": function(urlOptions,input_data,searchText){ //No I18N
                input_data.list_info.search_criteria= [{"field": "space_campus", "condition": "is", "value":{"id":urlOptions.formcomp.fields.values["space_campus"]},"logical_operator": "and"}]; //No I18N
				if(self.subModule=="floor")
				{
					input_data.list_info.search_criteria.push({"field":"building_type","condition":"is","value":"Floors and Rooms","logical_operator": "and"});
				}
				if(searchText){
					input_data.list_info.search_criteria.push({"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"});
				}				
				delete input_data.list_info["search_fields"]; //No I18N
                return input_data;
            },
            "space_floor": function(urlOptions,input_data,searchText){ //No I18N
                input_data.list_info.search_criteria= {"field": "space_building", "condition": "is", "value":{"id":urlOptions.formcomp.fields.values["space_building"]},"logical_operator":"and"}; //No I18N
				if(searchText){
					input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
				}
				delete input_data.list_info["search_fields"];
                return input_data;
            },
			"department" : function(urlOptions,input_data,searchText){ //No I18N
				if(self.subModule=="roompartition")
                {
					input_data.list_info.search_criteria= {"field": "site", "condition": "is", "value":self.site_id=="-1"?null:self.site_id,"logical_operator":"and"}; //No I18N
					if(searchText){
						input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
					}					
					delete input_data.list_info["search_fields"];
					return input_data;		
				}
				else
				{
					var idVal=self.CampusSiteMap[urlOptions.formcomp.fields.values["space_campus"]];
					input_data.list_info.search_criteria= {"field": "site", "condition": "is", "value":idVal?(idVal.id=="-1"?null:idVal.id):null,"logical_operator":"and"}; //No I18N
					if(searchText){
						input_data.list_info.search_criteria.children=[{"field": "name", "condition": "contains", "value":searchText,"logical_operator":"and"}]; //NO I18N
					}						
					delete input_data.list_info["search_fields"];
					return input_data;						
				}
			}
        }
        return obj;
    },
    getNonEditableFields : function(){
        var _self = this;
		var non_editable_fields=[];
        var url = "/api/v3/"+(_self.module=="facility_service"?'':(_self.modulePl+"/")) +_self.entityNamePl +(_self.editId?"/"+_self.editId:'') + "/_links";// No I18N
        sdpAjax({
			url: url,
            success: function (response) {
				var links = response._links;
                links = links.links || links;
                links.forEach(function (link) {
					if(link.name&&link.name=="edit"){
						non_editable_fields=link.non_editable_fields||[];
                    }
                });
            },
            async: false
        });
        return non_editable_fields;
    },
    /**
     * Wrapper method for Form showBulkSelectSupervisors, which fetches api data before providing data to bulk select component
     */
    showBulkSelectSupervisors: function(formalias, fname, isEdit, event){
        var field = FC_Mapper[formalias].fields[fname];
		var self=this;
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "name"}}; //No I18N
		var idVal="-1";
		if(self.subModule=="campus")
		{
			if(!FC_Mapper[formalias].fields["site"].current_value){
				showalert('warning',translate("common.validation.select",[translate("sdp.requests.common.site")]),"isAutoHide=true"); // No I18N
				return;
			}			
			idVal=FC_Mapper[formalias].fields["site"].current_value;
		}
		else if(self.subModule=="roompartition")
		{
			idVal=self.entitydata?self.entitydata.site:self.site_id;
		}
		else 
		{
			if(!FC_Mapper[formalias].fields["space_campus"].current_value){
				showalert('warning',translate("common.validation.select",[translate("space.campus")]),"isAutoHide=true"); // No I18N
				return;
			}
			idVal=self.CampusSiteMap[FC_Mapper[formalias].fields["space_campus"].current_value.id];
			if(!idVal)
			{
				idVal="-1";
			}
			else{
					idVal=idVal.id;
			}
		}
        input_data.list_info.search_criteria= {"field": "associated_sites", "condition": "is", "value":idVal}; //No I18N		
        sdpAjax({
            url: "/api/v3"+field.href, //No I18N
            async:false,
            cache:false,
            data:{input_data:sdpToJSON(input_data)},
            success:function(data){
              field.allowedValues = data[lookup_entity];
              FC.showBulkSelect(formalias, fname, isEdit, event, true);
            }
        });
    } 	
}
