// $Id$
/**
 * Common File for the space module
 * It handles routes within space and other activties
 */

 var $space = {
    /**
     * Navigate to method
     * @param {string} path
     */
    route: function (path) {
      switch (path) {
        case "tree": // NO I18N
          //@todo: Handle route in properway
          jQuery("#Right-Section_tree").load("/space/SpaceTree.jsp"); // NO I18N
          break;
        case "default": // NO I18N
      }
      /**
       * SPA will handle the history related URL Pushes
       */
    },
    /**
     * Wrapper method for Form showBulkSelect, which fetches api data before providing data to bulk select component
     */
    showBulkSelect: function(formalias, fname, isEdit, event){
        var field = FC_Mapper[formalias].fields[fname];
        var lookup_entity = field.response_field_name || field.fieldname || field.href.substr(field.href.lastIndexOf("/") + 1);
        var input_data = {"list_info":{"start_index": 1,"row_count": 100,"sort_field": "name"}}; //No I18N
        if(!field.allowedValues){
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
        }else{
            FC.showBulkSelect(formalias, fname, isEdit, event, true);
        }
    },
	getTemplateFields : function(serviceId,id){
		var fields=[];
		sdpAjax({
			url: "/api/v3/facility_services/"+serviceId+"/template/"+id, // No I18N
            success: function(resp) {
					for(var i=0,iLen=resp.facility_service_template.layouts[0].sections.length;i<iLen;i++)
					{
						var section = resp.facility_service_template.layouts[0].sections[i];
						for(var j=0,jLen=section.fields.length;j<jLen;j++)
						{
							fields.push(section.fields[j].name);
						}
					}
            },
            async: false
       });
	   return fields;
	},  
	getValue : function(obj) {
		if(obj)
		{
			if(Array.isArray(obj))
			{
				var value="";
				for(var i=0,ilen=obj.length;i<ilen;i++)
				{
					value+=obj[i].name;
					if(i!=ilen-1)
					{
						value+=",";
					}
				}
				return value;
			}
			else if(obj instanceof Object)
			{
				return obj.name||obj.display_value;
			}
			return obj;
		}
		else{
			return "-";
		}
	},
	getEntityData : function(id){
		var responseData={};
		sdpAjax({
			url: "/api/v3/facility_services/"+id, // No I18N
            success: function(resp) {
					responseData=resp.facility_service;
            },
            async: false
       });
	   return responseData;
	},
	fetchAttachmentsAndValidateDsipayImage: function(attachurl,display_image){
		var isValid=false;
		sdpAjax({
			url: attachurl,
            success: function(resp) {
				var attachments =resp.attachments;
					for(var i=0;i<attachments.length;i++){
							if(attachments[i].id.toString()==display_image.toString()){
								isValid=true;
								break;
							}
					}
            },
            async: false
       });
	   return isValid;
	},
	openRequestForm : function(select2Id,containerId,id,name,fromSpace){
		var htmlDiv = '<div id="'+select2Id+'" >'+
'<form class="form-horizontal bubble-hor mt10" name="newcreateincident" id="newcreateincident">'+
        '<div class="wrapscroller">'+
            '<div class="scroller">'+
			'<div class="form-group">'+
                    '<label>'+
                        '<input type="radio" name="space_requesttype" class="mr3" value="incident" checked="true">'+
						getMessageForKey("sdp.requests.view.incidentrequest")+
                    '</label>'+
                    '<label class="ml10">'+ //No I18N
                        '<input type="radio" name="space_requesttype" class="mr3" value="service">'+
                        getMessageForKey("sdp.home.ssp.templates.tooltip.servicerequest")+
                    '</label>'+
                '</div>'+			
                '<div class="form-group pos-rel">'+
                    '<label for="selectincidenttemplate">'+getMessageForKey("sdp.searchitem.select",[getMessageForKey("sdp.admin.requesttemplate.template")])+'</label>'+ // No I18N
                    '<div class="form-control mt5" id="selectincidenttemplate"></div>'+
				'</div>'+
			'</div>'+
		'</div>'+
        '<div class="form-footer">'+
            '<button class="btn btn-primary"  type="button" id="createincidentsave">'+getMessageForKey("common.create")+'</button>'+ // No I18N
            '<button class="btn btn-default"  id="createincidentcancel" type="button">'+getMessageForKey("common.cancel")+'</button>'+ // No I18N
        '</div>'+
    '</form></div>';		
		jQuery('#'+containerId).dialog({
			title:window.getMessageForKey("create.request"),
			autoOpen : false, 
			modal : true, 
			position: { my: "center top+50", at: "center top+50", of: window },//No I18N
			maxHeight: 300,
			open: function(event, ui){
				$space.initTemplateSelect2('incident');//No I18N
				jQuery('input[name=space_requesttype]').change(function() {
					$space.initTemplateSelect2(jQuery("input[name='space_requesttype']:checked").val(),true);
				});
				jQuery("#"+containerId+" #createincidentsave").off('click').on('click', (event) => {
					$space.handleCreateRequestDialog(containerId,id,name,fromSpace);
				});
				jQuery("#"+containerId+" #createincidentcancel").off('click').on('click', (event) => {
					jQuery('#'+containerId).dialog('close');
				});
				jQuery("#"+containerId+" form").off('submit').on('submit', (event) => {
					$space.handleCreateRequestDialog(containerId,id,name,fromSpace);
					return false;
				});
			},
			close: function(event,ui){
				jQuery('#'+select2Id).remove();
				jQuery('#'+containerId).dialog("destroy"); // No I18N
			},
			width: 500,
		}).html(htmlDiv).dialog("open"); // No I18N
	},
	initTemplateSelect2: function(module,destroySelect2){
		if(destroySelect2){
			jQuery('#selectincidenttemplate').val("").select2("destroy");
		}
		var list_info_input={};
		var is_service_template = true;
		if(module=='incident'){
			is_service_template=false;
		}
		jQuery('#selectincidenttemplate').sdp_select2({
			cache:{},
			closeOnSelect : false,
			allowClear: false,
			url:[{
				url:"/api/v3/spaces/space_campuses/_get_request_templates_with_space",//NO I18N
				field:'template',//NO I18N	
				input_data_Callback : function(urlOptions,input_data,searchText){
					return {"is_service_template":is_service_template,"req_temp_search_name":searchText}; //NO I18N
				}				
			}],
		});		
	},	
	handleCreateRequestDialog:function(containerId,id,name,fromSpace){
		var template=jQuery('#selectincidenttemplate').select2('data'); //NO I18N
		if(template&&template.id){
			jQuery('#'+containerId).dialog('close'); // No I18N
			addMoreReqDetails({"space":[{"id":id,"name":name}],"template":template.id,"fromSpace":fromSpace}); // No I18N
		}
		else{
			showalert("failure", getMessageForKey('sdp.admin.requesttemplate.selecttemplate') , "isAutoHide=true");  //No I18N
		}
	}	
  };
Handlebars.registerHelper('isAmenitiesKeyAvailable', function(data) { //NO I18N 
	return data.hasOwnProperty("amenities");	 //NO I18N 
});
Handlebars.registerHelper('getDisplayImagName', function(attachments,display_image) { //NO I18N
	if(attachments&&display_image){
		for(var i=0;i<attachments.length;i++){
			if(attachments[i].id==display_image){
				return attachments[i].name;
			}
		}
	}
	return display_image;
	
});
Handlebars.registerHelper('isSpaceDefaultImage', function(content_url) { //NO I18N 
	if(content_url!=null&&content_url.indexOf("no-image-icon.svg")>-1){
		return true;
	}
	return false;
});
  