/* $Id$ */
var worklogDetailsForm;
var $worklogDetails = {
    init: function(options) {
        var _self = this;
        _self.options = options;
        _self.options.entity_name = "worklog"; //NO I18N
        _self.options.url         = _self.options.url + "/" + options.worklogId; //NO I18N
        _self.options.meta_info   = $tasks.getMetainfo(_self.options.url);
        _self.options.entityData  = $worklogForm.getEntityData("/api/v3/"+_self.options.url,false,{"include":["image_token"]});
        _self.template = $tasks.getTemplateInfo(_self.options.meta_info.fields.template.href + "/" + _self.options.entityData.template.id, "worklog_template");
        var descSec = _self.template.base_worklog.hasOwnProperty("description")? "<div class='accordion-log accordion-timeline'><div id='worklogDescription' class='mb20 panel'></div></div>":"";

        var opt = {
            module: "worklog",
            container: "worklogDiv", //NO I18N
            data: _self.options,
            panel_details: {
                content_panel: {
                    "class": "noborder", // NO I18N
                    header_panel: {
                        show: true,
                        template: "WorklogDetails", // NO I18N
                        template_namespace: "worklog", // NO I18N
                        afterRenderfunction: this.afterHeaderRender
                    },
                    tabs_panel: {
                        show: true,
                        name: "worklog-detail", // NO I18N
                        tabs: ["worklog_details"], // NO I18N
                        active: "worklog_details", // NO I18N
                        custom: true,
                        settings: {
                            "worklog_details": { // NO I18N
                                show: true,
                                "id": "worklog_detail_div", // NO I18N
                                "name": "details", // NO I18N
                                "display_name": translate("common.details"), // NO I18N
                                "renderfunction": _self.loadDetails, // NO I18N
                                "HTML": "<div class='maxh-80vh oya'>"+descSec+"<form id='worklogForm' name='Worklog' class='form-horizontal four-col inplace-edit'> <div id='worklog-container' class='container-fluid p0 mt0'></div> </form> </div>"
                            }
                        }
                    }
                }
            }
        }

        _self.opt = opt;
        _self.detComp = new DetailsComponent(opt, _self);
    },
    loadDetails: function(tabName, tabSetting, tabs_panel) {
        var _self = this;
        _self.template.base_worklog.hasOwnProperty("description") && _self.loadDescriptionSection(tabName, tabSetting, tabs_panel);//No I18N
        _self.initFormComponent();
        jQuery("#tabs-panel-worklog").addClass('hide');
    },
    loadDescriptionSection: function(tabName, tabSetting, tabs_panel) {
        var opt = {};
        var _self              = this;
        opt.expand             = true;
        opt.canEdit            = false;
        opt.attachment         = false;
        opt.id                 = _self.options.worklogId;
        opt.entity             = _self.options.entity_name + "s"; //No I18N
        opt.lookup_entity      = _self.options.entity_name;
        opt.metainfo           = _self.options.meta_info;
        opt.name               = _self.options.entity_name + "_description"; //No I18N
        opt.data               = Object.assign({}, _self.options.entityData);
        opt.data.description   = appendImageToken(opt.data.description, opt.data.image_token);
        opt.display_name       = _self.options.meta_info.fields.description.display_name;
        opt.container          = _self.options.entity_name + "Description"; // No I18N
        opt.detailsHbsTemplate = "entity_description_template"; // No I18N

        _self.$descriptionPC = new PanelComponent(opt);
    },
    /**
     * Constructs template with its fields from the template api response
     */
    constructTemplateInfo: function() {
        var _self = this;
        var column_count = 2;
        var template = jQuery.extend(true, {}, _self.template);
        var udf_fields = template["base_worklog"].udf_fields;

        template.layouts[0].sections.forEach( (section) => {
            section.column_count = column_count;
            // removing these fields from the layout which are rendered in the details page header section
            section.fields = section.fields.filter((field) =>{return !["owner", "time_spent", "description"].includes(field.name)});//No I18N
            let j = 0;
            section.fields.forEach( (field) => {
                var colCount = (++j) % column_count;
                field.position.col = colCount ? colCount : column_count;;

                //Remove field's customization properties for details page
                field.style_properties = {};

                if (udf_fields && udf_fields.hasOwnProperty(field.name)) {
                    field.context = "udf_fields"; //No I18N
                }
            });
            //Remove section customization properties for details page
            section.style_properties = {};
        });
        template.style_properties = null;
        return template;
    },
    initFormComponent: function() {
        var _self = this;

        var configJSON = {
            canEdit     : false,
            mode        : "view",
            formid      : "worklogForm", //NO I18N
            container   : "worklog-container", // No I18N
            skipFields  : ["owner", "time_spent", "description"],
            template    : _self.constructTemplateInfo(),
            name        : _self.options.entity_name,
            entity      : _self.options.entity_name,
            entityName  : _self.display_name,
            entitypath  : _self.options.entity_name,
            entitydata  : jQuery.extend(true, {}, _self.options.entityData),
            metadata    : jQuery.extend(true, {}, _self.options.meta_info),
        };
        worklogDetailsForm =  new FC(configJSON);
    },
    deleteWorklog: function(url) {
        showconfirm(true,
            "title=," + //No I18N
            "message=" + translate("common.delete.confirm") + "," + //No I18N
            "submitbutton=" + translate("sdp.common.ok") + "," + //No I18N
            "cancelbutton=" + translate("sdp.common.cancel") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes", // NO I18N
            function(didConfirm) {
                if (didConfirm) {
                    sdpAjax({
                        acceptODCompatible: true, async: false,
                        url: "/api/v3/" + url, type: "DELETE", //No I18N
                        success: function(resp) {
                            const activeWindow = $extFrame.getActiveWindow();
                            activeWindow.$previewComponent.closePreview("worklogDetails_popup"); //No I18N
                            activeWindow.WebComponents.instancePool["webc-worklog"].refreshTable(); //No I18N
                            var successMsg = (resp.response_status.messages) ? resp.response_status.messages[0].message : translate("sdp.project.history.taskworklogdelete0");
                            activeWindow.showalert('success', successMsg, "isAutoHide=true"); //NO I18N
                        },
                        error: function(xhr) {},
                    });
                }
            }, true
        );
    },
    afterHeaderRender: function(data){
        const $container = jQuery("#worklogDiv");
        $container.off(".worklog-details");//NO I18N

        $container.find("#editWorklog").on("click.worklog-details", function(){
            $tasks.loadWorkLog('form',$worklogDetails.options.module, $worklogDetails.options.moduleId,$worklogDetails.options.grandParent,$worklogDetails.options.grandParentId,$worklogDetails.options.worklogId,$worklogDetails.options.projectId,'detail');//NO I18N
        });
        $container.find("#deleteWorklog").on("click.worklog-details", function(){
            $worklogDetails.deleteWorklog($worklogDetails.options.url);
        });
        $container.find("#closeWorklog").on("click.worklog-details", function(){
            $extFrame.getActiveWindow().$previewComponent.closePreview('worklogDetails_popup');//NO I18N
        });
    }
}