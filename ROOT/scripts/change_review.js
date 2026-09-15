/* $Id$ */
/*  This file has utility functions required for displaying Change review page.
 */
var change_review ={

    /**
     * Loads review stage details sections
     */
    loadReviewDetails: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var stagePermission = _self.stagePermissions[stageName];
        //Additional field section is added
        var options = {skipFields:["descriptive_fields","next_review_on","review_details","tasks"] }; //No I18N
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options);

        /* Load description section*/
        var opt = {};
        opt.id = _self.entity_data.review_details.id;
        opt.name = "review_details"; //No I18N
        opt.base_url = _self.base_url + "/" + _self.id; //No I18N
        opt.entity = "descriptive_fields"; //No I18N
        opt.display_name = _self.metainfo.fields["review_details"].display_name;
        opt.lookup_entity = "descriptive_field"; //No I18N
        opt.canEdit = (!_self.printPreview && stagePermission && stagePermission.edit) || false;
        opt.container = "reviewdetails"; // No I18N
        opt.detailsHbsTemplate = "panel_template"; // No I18N
        opt.data = _self.entity_data["review_details"];
        opt.image_url = "/" + _self.entity_data.review_details.id + "/images" ; // No I18N
        opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";   // No I18N
        opt.expand = true;
        opt.print_mode = _self.printPreview || false;
        opt.save = {
            serializer : function(data, pc){
                //removing image tokens if any, from description img src
                if(data.description){
                    data.description = _self.removeImageToken(data.description);
                }
                data.id = _self.entity_data.review_details.id;
                return data;
            },
            postsuccess : function(data, pc){
                //appending the latest image token to img src since data is re-rendered
                if(data.image_token){
                    data.description = appendImageToken(data.description,data.image_token);
                }
                if(_self.checkIfpageNeedsRefresh(data, _self.entity_data)){
                    _self.reinitDetailsComponent();
                }
                else{
                    _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                }
            },
        };
        opt.attachment = {
            entity_id: _self.entity_data.review_details.id,
            base_url: _self.base_url+ "/" +_self.id, //No I18N,
            entity: "descriptive_fields", // No I18N
            container: "review_details_attachcontainer", //No I18N
            description: true
        }
        if(_self.isNonLogin && opt.data.image_token){
            opt.data.description = appendImageToken(opt.data.description, opt.data.image_token);
        }
        _self.$review_details_PC = new PanelComponent(opt);
    },

    /**
     * review stage schedule constructor
     */
    loadReviewSchedule:function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var stagePermission = _self.stagePermissions[stageName];
        //Destroy the old instance
        _self.$next_review_on && _self.$next_review_on.destroy();
        /* FC for next review on field */
        _self.getTemplateInfo(_self.entity_data.template.id);
        var template = _self.constructTemplateInfo(stageName,["next_review_on"], 1);// No I18N
        template.style_properties = {};
        var configJSON = {
            template: template,
            entitydata: jQuery.extend(true,{},_self.entity_data),
            metadata: jQuery.extend(true,{},_self.metainfo),
            container: "Review_schedule",// No I18N
            formid: "Review_schedule_form",// No I18N
            canEdit: (!_self.printPreview && stagePermission && stagePermission.edit) || false,
            linkedFields : [{
                fields : ["next_review_on"], //NO I18N
                denote_field : ["next_review_on"], //NO I18N
                message : translate("sdp.reports.errmsg.invalidtimedateexception"), //NO I18N
                validation: function(valueJson)
                {
                    if(valueJson.next_review_on && valueJson.next_review_on < new Date())
                    {
                        return false;
                    }

                    return true;
                }
            }],
            save: {
                postsuccess: function(data, form){
                    if(_self.checkIfpageNeedsRefresh(data[_self.entity_name], _self.entity_data)){
                        _self.reinitDetailsComponent();
                    }else{
                        _self.entity_data = jQuery.extend(true, {}, data[_self.entity_name]);
                    }
                }
            },
            afterRenderCallback: function(form){
                jQuery("#"+form.container).find('[data-id="form-inner-wrapper"]').css("width", "50%").end()
                    .find(".col-group").addClass("fw");
                if(_self.printPreview){
                    form.emptyFields.includes("next_review_on") ? jQuery("#next_review_on").hide() : (setTimeout(function(){  // No I18N
                        jQuery("#"+stageName+"_print_nodata").hide();
                    },10));
                }
            }
        };
        _self.$next_review_on = _self.initFormComponent(configJSON);
    },
}