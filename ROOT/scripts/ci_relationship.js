var $ciRelationship = {
    /**
    * get relationship data and construct table
    * @param {*} api_name
    * @param {*} api_plural_name
    * @param {*} ciid
    */
    getDataAndConstructRelationship : function(){
        const _self = this;
        sdpAjax({
            url: "/api/v3/"+$ciCommon.getAPIPluralName()+"/" + $ciCommon.getCIID() + "/_get_all_relationships", // No I18N
            success: function (response) {
                _self.constructTable(response["get_all_relationships"]);
                jQuery("[name=add_relationship]").off("click").on("click",function(){   //NO I18N
                    _self.openRelationAddForm($ciCommon.getAPIPluralName(),$ciCommon.getAPIName(),$ciCommon.getDisplayName(),$ciCommon.getCIID(),$ciCommon.getCIName());
                });
                jQuery("[name=clusterView").off("click").on("click",function(){  //NO I18N
                    popoutMap($ciCommon.getCIID(),true);
                });
                jQuery("[name=treeView").off("click").on("click",function(){    //NO I18N
                    popoutMap($ciCommon.getCIID());
                });
                jQuery("[name=delete_relationship]").off("click").on("click",function(){
                    const associationName = jQuery(this).data("association");
                    const id = jQuery(this).data("id");
                    _self.deleteRelationship(associationName,id);
                });
                jQuery("[name=ci_details_slider]").off("click").on("click",function(){
                    assetsObj.loadCIDetailsPopup(jQuery(this).data("id"),jQuery(this).data("module"));
                });
            }
        });
    },
    /**
     * construct table
     * @param {*} responseJSON
     */
    constructTable : function(responseJSON){
        let row = 0;
        for(let key in responseJSON){
            let currentRelationship = responseJSON[key];
            jQuery("#relationship_tab").append('<div class="cmdb-rltn-parent" id='+ row+'_rel_row>');
            const leftCol = '<div class="cmdb-rltn-left"><div><span class="disp-ib text-overflow vmiddle" style="width:calc(100% - 30px)" rel="uitip" title="'+ e_attr(currentRelationship.name) +'">'+ e_html(currentRelationship.name) +'</span><span class="badge ui1 default-c">'+ currentRelationship.count+'</span></div></div>';
            delete currentRelationship.name;
            delete currentRelationship.count;
            let jQ = jQuery('#' + row + '_rel_row');
            jQ.append(leftCol);
            jQ.append('<div class="cmdb-rltn-right" id="'+ row+'_right"></div>');
            jQ = jQuery('#' + row + '_right');
            this.constructTypeCol(jQ,currentRelationship,row + '_rel_row');    //NO I18N
            row++;
        }
        if (row == 0){
            jQuery("#relationship_header").addClass("hide");
            let addRelationshipLink = $ciCommon.entityData.links.edit ?
                '<a href="/" name="add_relationship" class="text-primary">' +
                translate("ae.cmdb.admin.citype.addrelationship") +
                '</a>' : '';
            jQuery("#relationship_tab").append(`
                <div id="problems_nodatabanner">
                    <div id="no_assocProblemList" class="alert-nodata">
                        <div class="msg">${translate("cmdb.no.relationship.available")}&nbsp;
                            ${addRelationshipLink}
                        </div>
                    </div>
                </div>`);
        }
    },
    /**
     * construct type column
     * @param {*} jQ
     * @param {*} relationship
     * @param {*} id
     */
    constructTypeCol : function(jQ,relationship,id){
        let row = 0;
        for(let key in relationship){
            let citype = relationship[key];
            jQ.append('<div class="cmdb-rltn-detail" id="'+ row+'_type_row' + id+'"></div>');
            const type_jQ = jQuery('#' + row + '_type_row' + id);
            let type_html = '<div class="cmdb-rltn-child"><div class="fh"><span class="disp-ib text-overflow vmiddle" style="width:calc(100% - 30px)" rel="uitip" title="'+ e_attr(citype.display_name) +'">' + e_html(citype.display_name) + '</span><span class="badge ui1 default-c">'+ citype.count +'</span></div></div>';
            type_jQ.append(type_html);
            delete citype.count;
            this.constructCICol(type_jQ,citype,row + '_type_row' + id); //NO I18N
            row++;
        }
    },
    /**
     * construct ci column
     * @param {*} type_jQ
     * @param {*} citypeData
     * @param {*} id
     */
    constructCICol : function(type_jQ,citypeData,id){
        type_jQ.append('<div class="cmdb-rltn-child-detail" id="ci_row' + id +'"></div>');
        const ci_jQ = jQuery('#ci_row' + id);
        for(let ciname of citypeData.ci_name ){
            ci_jQ.append('<div class="ci-row fh visi-parent"><span' + ( ciname.can_view ? ' name=ci_details_slider class="cur-ptr ' : ' class="cur-na opac7 ') + 'vmiddle wb-bw" data-canview='+ ciname.can_view +' data-id='+ ciname.id +' data-module="'+citypeData.api_plural_name+'" rel="uitip" title="'+ e_attr(ciname.name) +'">'+e_html(ciname.name) +'</span><span data-association='+ ciname.association +' data-id='+ ciname.instance_relationship_id+' ' +  (ciname.can_delete ?' name="delete_relationship" class="cur-ptr' : ' class="cur-na') + ' cspr flat icon-md spad-delete fr visi-item" rel="uitip" title="'+translate("sdp.common.delete")+'"></span></div>'); //NO I18N
        }
    },
    /**
     * delete relationship event
     * @param {*} association_name
     * @param {*} ci_relationship_id
     */
    deleteRelationship : function(association_name,ci_relationship_id){
        const _self = this;
        sdpAjax({
            url : "/api/v3/" + $ciCommon.getAPIPluralName() + "/" + $ciCommon.getCIID() + "/"+ association_name +"/" + ci_relationship_id,  // No I18N
            method : "delete",  // No I18N
            success : function(resp){
                showalert("success",translate("cmdb.ci.relationship.deleted.msg"), "isAutoHide=true"); // No I18N
                jQuery("#relationship_tab").empty();
                _self.getDataAndConstructRelationship();
            }
        });
    },
    /**
     * open relationship add form
     * @param {*} api_plural_name
     * @param {*} api_name
     * @param {*} api_display_name
     * @param {*} ciid
     * @param {*} from
     * @param {*} nodeId
     */
    openRelationAddForm : function(api_plural_name,api_name,api_display_name,ciid,ciname,from,nodeId){
        const _self = this;
        if (typeof $associations == "undefined"){
            ResourceLoader({
                js: ["/scripts/associationsComponent.js"],//No I18N
                success: function success(){
                    _self.renderPopup(api_name,api_plural_name,api_display_name,ciid,from,nodeId,ciname);
                }
              });
        }
        else{
            _self.renderPopup(api_name,api_plural_name,api_display_name,ciid,from,nodeId,ciname);
        }
    },
    renderPopup : function(api_name,api_plural_name,api_display_name,ciid,from,nodeId,ciname){
        const _self = this;
        window["aecm"] = {
            associations_template: function(ui, ass) {
                $ciCommon.ass = ass;
              },
            customsection: function(ui) {
              return '<div class="disp-ib">' +
                '<label class="radio-inline">' +    //No I18N
                    '<input type="radio" name="#popup_assoc_ci_relationships_popup" data-association-action="radio" value="custom">' + translate("ae.cmdb.addrelationship.chooserelationshiptype") +
                '</label>' +
                '<input type="text" id="custom-association" name="custom-association" data-name="association-select" class="form-control ml10 vmiddle hide w-300px" data-id="#popup_assoc_ci_relationships_popup_custom" >' +
               '</div><div id="no-data-available-container"></div>';
            },
            customaction: function(comp) {
                if ( typeof $associationType == 'undefined'){
                    ResourceLoader({
                        js: ["/scripts/admin-association-type.js"], //No I18N
                        success: () => {
                            _self.renderListView(comp);
                        }
                    });
                }
                else{
                    _self.renderListView(comp);
                }
            },
            beforeload: function(info) {
                //before associate
                if (info.assoc_ci_relationships) {
                    const relationship_type = jQuery("#custom-association").val();
                    info.assoc_ci_relationships.each(a => {
                        a.relationship_type = {id : relationship_type};
                        a.is_inverse = jQuery("#custom-association").select2("data").is_inverse; //NO I18N
                    })
                }
                return info;
              },
            afterassociate: function(info) {
                if (from && from == "mapView" && (nodeId || nodeId ==0) && nodeId != null){
                    window.top.map.controller.updateChildren(ciid,nodeId);
                }
                else if (from && from == "treeView"){
                    vizard.clickNode("CI"+ciid);    //NO I18N
                }
                else{
                    jQuery("[data-detail-tab=relationship]").trigger("click");
                }
            }
          };

          $associations.init({
            containerId : "Associations_DIV",                     //NO I18N
            module : api_plural_name,
            module_id : ciid,
            entity_name: api_name,
            display_name: api_display_name,
            successMsgKey: "ae.cmdb.addcirelationships.successmess", //No I18N
            dialog_title : translate("cmdb.add.relationship.slider.header",[ciname]) , // No I18N
            associate_popup: {
                skip_table_auto_render: true,
                header_customization: {
                    enable: true,
                    choose_all: true,
                    choose_all_lable : translate("ae.cmdb.cidetails.relationships.addRelationship.chooseRelationship"), //No I18N
                    position: "top",                        //NO I18N
                    renderhtml: "aecm.customsection",        //NO I18N
                    actions: "aecm.customaction",           //NO I18N
                    associated : {
                        pre: "aecm.beforeload",           //NO I18N
                        post: "aecm.afterassociate"        //NO I18N
                    }
                    }
                },
                custom_options: aecm
            });
          _self.customassociation();
    },
    customassociation: function() {
        $associations.openAssociations($ciCommon.ass.find((data) => {return data.association_field == 'assoc_ci_relationships'}).api_plural_name+"_list");   //NO I18N
    },
    renderListView : function(_self){
        new $associationType().init({
            selectId : "custom-association",                        //NO I18N
            entity_name: "relationship_type", //No I18N
            nameTitle: "ae.cmdb.relationshiptypes",                 //No I18N
            inverseNameTitle: "ae.cmdb.admin.relationshiptype.child",   //No I18N
            url: _self.associations.find((data) => {return data.association_field == 'assoc_ci_relationships'}).metaInfo.fields.relationship_type.href  //NO I18N
        });
        const containerparent = jQuery("#popup_assoc_ci_relationships_popup").parent();
        jQuery("#custom-association").off("change").on("change", function() {   //NO I18N
            jQuery("#no-data-available-container").empty();
            const selectedAssociation = _self.associations.find(assoc => assoc.association_field == 'assoc_ci_relationships');
            const commonjson = $associations.associateListviewpopup({"is_popup": true, "associations" : selectedAssociation});            //NO I18N
            jQuery(containerparent).find("[data-id=custom_association_popup]").remove();
            jQuery(containerparent).append('<div id="popup_'+selectedAssociation.table_holder+'" style="width: 99.5%;" data-id="custom_association_popup"></div>');
            new MC(commonjson);
        }
        );
        containerparent.find('[data-association-action="radio"]').off("change.association").on("change.association", function () { //No I18N
            let elements = containerparent.find('[data-name=association-select]');
            let $this = this;
            Array.from(elements).forEach( (el) => {
                if(jQuery(el).attr("data-id") == $this.name + "_" + $this.value) {
                    jQuery(el).select2("container").removeClass("hide"); // NO I18N
                    if($this.value == "custom"){
                        jQuery(el).select2("open"); // NO I18N
                    }
                } else {
                    jQuery(el).select2("container").addClass("hide"); // NO I18N
                    jQuery(el).select2("val", ""); // NO I18N
                    jQuery(el).select2("container").find(".select2-chosen").attr("title", "");  //NO I18N
                }
                jQuery('[data-id="custom_association_popup"]').empty();
                if($this.value == "custom"){
                    jQuery("#no-data-available-container").html("<span class='align-vh-center m10 pt10'>"+translate("ae.cmdb.selectrelationshiptype")+"</span>");
                }
                else{
                    if($ciCommon.ass.find((data) => {return data.association_field != 'assoc_ci_relationships'})){
                        jQuery("#no-data-available-container").empty();
                        const selectedAssociation = $ciCommon.ass.find((data) => {return data.association_field != 'assoc_ci_relationships'});
                        jQuery("[data-id=#popup_assoc_ci_relationships_popup_choose]").select2("data",{text:selectedAssociation.display_name,id:selectedAssociation.api_plural_name});  //NO I18N
                        jQuery("[data-id=#popup_assoc_ci_relationships_popup_choose]").trigger("change");
                    }
                    else{
                        jQuery("#no-data-available-container").html("<span class='align-vh-center m10 pt10'>"+translate("ae.cmdb.cidetails.relationships.addRelationship.noRelationshipconfigured")+"</span>");
                    }
                }
            });
        });
        jQuery("[name=#popup_assoc_ci_relationships_popup][value=choose]").trigger("click");
        if($ciCommon.ass.find((data) => {return data.association_field != 'assoc_ci_relationships'})){
            const selectedAssociation = $ciCommon.ass.find((data) => {return data.association_field != 'assoc_ci_relationships'});
            jQuery("[data-id=#popup_assoc_ci_relationships_popup_choose]").select2("data",{text:selectedAssociation.display_name,id:selectedAssociation.api_plural_name});  //NO I18N
            jQuery("[data-id=#popup_assoc_ci_relationships_popup_choose]").trigger("change");
        }
        else{
            jQuery("#no-data-available-container").html("<span class='align-vh-center m10 pt10'>"+translate("ae.cmdb.cidetails.relationships.addRelationship.noRelationshipconfigured")+"</span>");
        }
    }
};
