/* $Id$ */
var projectFormComp;
var $projectDetails = {
	init: function(options){
		var _self = this;
		_self.options = options;
		_self.options.url = "projects/"+options.projectId;//NO I18N
		_self.options.projectId = options.projectId;
        _self.options.meta_info = $tasks.getMetainfo(_self.options.url);
        _self.options.entityData = _self.getEntityData(_self.options.url);
        delete _self.options.entityData.attachments;
        _self.options.canEdit = _self.options.from !== "kanban";// NO I18N
		var opt = {
			module: "project", container: "projectDiv",//NO I18N
			data: _self.options,
			panel_details:{
				content_panel:{
					"class" : "noborder",// NO I18N
					header_panel:{
                        show : true,
                        template: "ProjectDetails",// NO I18N
                        template_namespace: "project",// NO I18N
                    },
                    tabs_panel: {
                        show: true,
                        name: "project-detail",// NO I18N
                        tabs: ["project_details", "project_history"],// NO I18N
                        active: "project_details",// NO I18N
                        custom: true,
                        settings: {
                            "project_details": {// NO I18N
                            	show: true,
                            	"id": "project_detail_div",// NO I18N
                                "name": "details",// NO I18N
                                "display_name": translate("common.details"),// NO I18N
                                "renderfunction" : _self.loadDetails,// NO I18N
                                "HTML": "<div class='accordion-log accordion-timeline'><div id='projectDescription' class='mt10 mb20 panel'></div></div><div><form id='projectForm' name='Project' class='form-horizontal four-col inplace-edit'> <div id='project-container' class='container-fluid p0 mt0'></div> </form> </div>"
                            },
                            "project_history":{//NO I18N
								"id":"projHistoryDiv",//NO I18N
                            	"display_name":translate("common.history"),//NO I18N
                            	"renderfunction":_self.loadHistory,//NO I18N
                            	"HTML":"<div id='ProjectHistory_DIV'></div>"
                            }
                        }
                    }
				}
			}
		}
		_self.opt = opt;
        _self.detComp = new DetailsComponent(opt, _self);
	},
	loadDetails: function(tabName, tabSetting, tabs_panel){
		var _self = this;
        var form_sections = [
            {
                "name":"", 'column_count': "2",//NO I18N
                "fields":{//NO I18N
                    "code":{},"status": {},//No I18N
                    "site":{},"owner":{},//No I18N
                    "type":{},"priority": {},//No I18N
                    "scheduled_start_time" : {}, "actual_start_time": {},//No I18N
                    "scheduled_end_time"   : {}, "actual_end_time": {}, //No I18N
                    "projected_end_time" : {}, "created_time": {},//No I18N
                    "estimated_hours" : {}, "actual_hours": {}, //NO I18N
                    "estimated_cost" : {}, "actual_cost": {}, //NO I18N
                    "requester":{}, "department":{}, //No I18N
                    "created_by": {},//NO I18N
                }
            },
            {
                "name": getMessageForKey("sdp.admin.leftpanel.customfields.home"), // No I18N
                "fields": { // No I18N
                    "udf_fields": {} // No I18N
                },
                "column_count": "2" //No I18N
            }
        ];

        var configJSON = {
            name                : "Project",//No I18N
            entity              : 'project',//No I18N
            container           : "project-container",//No I18N
            formid              : "projectForm", //NO I18N
            entityName          : translate("common.project"),
            customform          : true,
            canEdit             : _self.options.canEdit,
            entitypath          : _self.options.url,
            entitydata          : _self.options.entityData,
            mode                : "view",//NO I18N
            template            : _self.constructLayoutObject(form_sections, $projectDetails.options.meta_info.fields),
            metadata            : _self.options.meta_info,
        }
        projectFormComp = new FC(configJSON);
        $projectDetails.loadDescriptionSection();

        /* Project Tags in Kanban details page */
        const tagEle = document.createElement('div');
        tagEle.id = 'project-tags';
        document.getElementById('project_detail_div').appendChild(tagEle);
        $projectDetails.renderTags({ projectId: $projectDetails.options.entityData.id, associatedTags: $projectDetails.options.entityData.tags, canEdit: _self.options.canEdit, fromKanban: true });
	},
    loadHistory: function(){
        var _self = this;
        loadProjectEntityHistory("projects","kanban");//NO I18N
    },
    loadDescriptionSection: function(){
        var _self = this;
        var opt                  = {};
        opt.expand               = true;
        opt.accept_od_compatible = true;
        opt.attachment           = false;
        opt.lookup_entity        = "project";//No I18N
        opt.entity               = "projects"; //No I18N
        opt.base_url             = "/api/v3/projects/"; //No I18N
        opt.name                 = "project_description"; //No I18N
        opt.container            = "projectDescription";// NO I18N
        opt.detailsHbsTemplate   = "entity_description_template";// NO I18N
        opt.inlineImagesEntity   = "projects";  //No I18N
        opt.display_name         = translate("common.description");// NO I18N
        opt.image_url            = "/"+$projectDetails.options.projectId + "/images";//No I18N
        opt.metainfo             = {"fields":{"description":{"display_name": translate("common.description")}}};// NO I18N
        opt.data                 = Object.assign({},$projectDetails.options.entityData);
        opt.data.description     = appendImageToken(opt.data.description,opt.data.image_token);
        opt.id                   = $projectDetails.options.projectId;
        opt.canEdit              = _self.options.canEdit;

        _self.$descriptionPC = new PanelComponent(opt);
    },
	getEntityData: function (url, inputData) {
        var resp;
        sdpAjax({
            acceptODCompatible: true, async: false,
            data: sdpAjaxInputData(inputData),
            url: "/api/v3/" + url,// NO I18N
            success: function (data) {
                resp = data.project;
            },
            error: function(xhr){
                window.top.$previewComponent.closePreview("projectDetails_popup");//No I18N
                var resp = xhr.responseJSON.response_status;
                window.top.showalert('failure', e_html(resp.messages[0].message), "isAutoHide=false"); // NO I18N
            }
        })
        return  resp;
    },
    constructLayoutObject: function(form_sections, meta_info){
    	var _self = this;
    	var sections=[], layouts=[], metainfo_Obj={};

    	for(var i = 0; i < form_sections.length; i++){
            var sectionFields = form_sections[i].fields;
            var sec_col = sec_row = 1;
            var section = {};

            if(jQuery.isEmptyObject(form_sections[i].position)){
                section.position = {"col": sec_col,"row": sec_row };
            }else{
                sec_col = form_sections[i].position.col, sec_row = form_sections[i].position.row;
            }

            section.name         = form_sections[i].name;
            section.field_align  = "left-right";//No I18N
            section.column_count = form_sections[i].column_count;
            var fields = [];
            var fld_col = fld_row = 1;
            var sectionFieldsArray = Object.keys(sectionFields);

            for(var j = 0; j < sectionFieldsArray.length; j++){
                var fieldName = sectionFieldsArray[j];
                var field_metainfo = meta_info && meta_info[fieldName];
                if(field_metainfo && field_metainfo.type == "udf"){
                    var flds = field_metainfo.fields;
                    if(!jQuery.isEmptyObject(flds)){
                        var fieldsArray = Object.keys(flds);
                        var fieldsCnt = fieldsArray.length;
                        for (var k = 0; k < fieldsCnt; k++) {
                            var subfield_name = fieldsArray[k];
                            var field = flds[subfield_name];
                            field.position = {"col": fld_col, "row": fld_row };
                            field.name = fieldName + "." + subfield_name;
                            if (!field.fieldname) {
                                field.fieldname = subfield_name;
                            }
                            fields.push(field);
                            if (fld_col == section.column_count) {
                                fld_col = 1;
                                fld_row += 1;
                            } else {
                                fld_col += 1;
                            }
                            metainfo_Obj[fieldName + "." + subfield_name] = field;
                        }
                    }
                } else {
                    var field = sectionFields[fieldName];
                    field.position = {"col": fld_col, "row": fld_row };

                    field.name = fieldName;
                    if(fieldName == "description"){
                        field.images = true;
                        field.images_api = true;
                        field.images_save_path = "images";//No I18N
                        field.images_url = "/api/v3/" + _self.options.url + "/images"//No I18N
                        field.inlineImagesEntity = _self.options.module;
                    }
                    if(field_metainfo){
                        jQuery.extend(field, field_metainfo);
                    }else if(field.frommeta == true) {
                        field.default_hide = true;
                    }
                    fields.push(field);
                    metainfo_Obj[fieldName] = field;
                }
                if (fld_col == section.column_count) {
                    fld_col = 1;
                    fld_row += 1;
                } else {
                    fld_col += 1;
                }
                section.fields = fields;
                sec_row++;
            }
            sections.push(section);
        }
		var layout = [{"sections": sections}];//No I18N
	    return {"layouts" : layout, "metainfo" : metainfo_Obj }; //No I18N
    },
    /*
        *Function to render tags section in project details page
        *@PARAM tagConfig - Project tags entity data
    */
    renderTags:function(tagConfig){
        const tagOptions = {
            container: 'project-tags', //NO I18N
            canEdit: tagConfig.canEdit,
            entity: 'project', //NO I18N
            entityUrl: `/api/v3/projects/${tagConfig.projectId}`,
            associatedTags: tagConfig.fromKanban? tagConfig.associatedTags : tagConfig.associatedTags[tagConfig.projectId],
            afterRenderCallback: $projectDetails.afterTagsRender
        }
        $tags.init(tagOptions);
    },
    /*
        *Function to add styles to tags section in project details page
        *@PARAM tagConfig - $tag variable
    */
    afterTagsRender: function(tagConfig){
        document.getElementById(tagConfig.tagSection).classList.add('pl10', 'mt30'); //NO I18N
        document.getElementById('project_tag_heading').classList.add('left-col', 'fw', 'control-label', 'p0'); //NO I18N
    }
}
