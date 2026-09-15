/* $Id$ */
/*  This file has utility functions required for displaying Change close page.
 */
var change_close = {
    /**
     * Render Close stage details section
     */
    loadCloseDetails: function(tabName, tabSetting, tabs_panel){
        /* In close Details, previously when closure code is updated, description is mandatory.
         * Now it is changed as description is not mandatory for updating closure code
         * So, commented the previous functionlity */

        var _self = this;
        var stageName = tabs_panel.internal_name;
        let canEdit = _self.stagePermissions[stageName] && _self.stagePermissions[stageName].edit && !_self.printPreview;

        //Additional field section is added
        var options = {skipFields: ["descriptive_fields", "close_details","tasks"]}; // No I18N
        var configObj = {
            afterRenderCallback: function(form){
                if(!_self.printPreview && sdp_user.ROLES && sdp_user.ROLES.length>0 && sdp_user.ROLES.contains('Scan Now')){
                    jQuery("#Close_additionalfieldsSection").addClass("disp-t fw").append('<div class=" disp-c vmiddle pl30 tr"><button id="scan_assets" type="button" data-cs-field="scan_assets" class="btn btn-outline-primary rounded3 text-link"><svg class="thmicon-fill vtop mr3 mt1" width="16" height="16"><use href="#sync-icon"></use></svg>'+translate('sdp.change.scan.assets')+'</button></div>').end()  // No I18N
                        .find('[data-id="form-inner-wrapper"]').css("width","").end()  // No I18N
                        .find(".main-pane").css("width","50%").find(".form-wrapper").removeClass("pb25");  // No I18N
                    if(_self.entity_data.assets && _self.entity_data.assets.length > 0){
                        var assetIds = _self.entity_data.assets.map(function(item){
                            return item.id;
                        });
                        assetIds = assetIds.join(";");
                        jQuery("#scan_assets").attr("data-event","click").attr("data-handler","scanChgAssociatedAssets('"+assetIds+"')").attr("nonce",sdpNonce);
                        $sdEventListener("#Close-tabs-panel_content");// No I18N
                    }else{
                        jQuery("#scan_assets").prop("disabled",true);  // No I18N
                    }
                }
            }
        };
        _self.loadAdditionalFieldsSection(tabName, tabSetting, tabs_panel, options,configObj);
        /* Panel component for close details */
        var opt = {};
        opt.id = _self.entity_data.close_details.id;
        opt.name = "close_details";
        //using descriptive field api for updating description of close details since both the inline images api as well the description update api should contain same path
        opt.base_url = _self.base_url + "/" + _self.id; //No I18N
        opt.entity = "descriptive_fields"; //No I18N
        opt.lookup_entity = "descriptive_field"; //No I18N
        opt.display_name = _self.metainfo.fields["close_details"].display_name;
        opt.canEdit = canEdit;
        opt.container = "closedetails"; // No I18N
        opt.detailsHbsTemplate = "panel_template"; // No I18N
        opt.data = _self.entity_data["close_details"];
        opt.image_url = "/" + _self.entity_data.close_details.id + "/images" ; // No I18N
        opt.inlineImagesEntity = _self.entity_name + "_descriptive_field";   // No I18N
        opt.expand = true;
        opt.print_mode = _self.printPreview || false;
        opt.save = {
            serializer: function(payload){
                //removing image tokens if any, from description img src
                if(payload.description){
                    payload.description = _self.removeImageToken(payload.description);
                }
                return payload;
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
                    pc.data = data["close_details"];
                    _self.entity_data = data;
                }
            }
        };
        opt.attachment = {
            container: "close_details_attachcontainer", //No I18N
            entity_id: _self.entity_data.close_details.id,
            base_url: _self.base_url+ "/" +_self.id, //No I18N,
            entity: "descriptive_fields", // No I18N
            description: true,
        };
        if(_self.isNonLogin && opt.data.image_token){
            opt.data.description = appendImageToken(opt.data.description, opt.data.image_token);
        }
        _self.$close_details_PC = new PanelComponent(opt);

    },
}
