/* $Id$ */
/*  This file has utility functions for bulk close.
 */
if (typeof window.ChangeBulkClose === 'undefined') {
    window.ChangeBulkClose = class {

    constructor(obj) {
        this.changeIds = obj.ids;
        this.base_url = "/api/v3/changes"; //No I18N
        this.entityName = "change"; //No I18N
    }

    initialize() {
        let requiredfields = ["status","comment","closure_code","close_details"];//No I18N
        this.initializeForm(requiredfields);
    }

    /*Initialize bulkclose form */
    initializeForm(requiredfields) {

        let self = this;

        let obj = {metainfo:{}};
        $rc.getMetaInfo(self.base_url, obj);

        let metaInfo = obj.metainfo;

        metaInfo.fields['close_details'].type='html';
        metaInfo.fields['comment'].mandatory=true;
        var stageId = 0;
        var input_data={"list_info":{"start_index":1,"row_count":100,"search_fields":{"internal_name":"Close"}}    }//no i18n
        /* Fetch and set close stage id */
        sdpAjax({
			url: self.base_url+"/stage", //No I18N
            data:{input_data:sdpToJSON(input_data)},
			success: function(response) {
                stageId=response.stage[0].id;
			},
			async: false
		});

        /* Set input data callback for status field */
        metaInfo.fields['status'].input_data_Callback=function(urlOptions,input_data,searchText){
            var json = {"stage.id" : stageId,"name": searchText }; // No I18N
            input_data.list_info.search_fields = json;
            return input_data;
        };

        let configJSON = {
            name       : translate("change.listview.bulkclose"), //No I18N
            entity     : self.entityName,
            container  : "change_bulkclose_container",//No I18N
            formid     : "changeCloseForm", //NO I18N
            entityName : self.entityName,
            entitypath     : self.base_url,
            mode     : "edit", // No I18N
            template : self.constructTemplate(requiredfields,"1", metaInfo.fields),
            metadata : metaInfo,
            edit: {
                fields: {
                    close_details:{
                        images_api:true,
                        images_url: self.base_url+"/descriptive_fields/images"//NO I18N
                    },
                    closure_code:{
                        allowClear: true
                    },
                    comment:{
                        constraints:{
                            max_length: 500
                        }
                    }
                },
                defaults: {
                    lookup:{
                        placeholder:translate('sdp.change.sla.select')
                    }
                }
            },
            save: {
                url: self.base_url+"/close?ids="+self.changeIds,//NO I18N
                entity: self.entityName,
                submit: true,
                ignorefailuremessage: true,

                cancel:function(){
                        self.cancelForm();
                },
                success:function(responseData){
                    window.top.showalert("success", translate("sdp.itil.changehisview.changeclosed"), "isAutoHide=true, delay=2"); //No I18N
                    setTimeout(()=>{
                        window.top.changelistview.changeAjaxHandler("/Changes.cc");//No I18N
                        self.cancelForm();
                    },500)
                },
                error:function(responseData){
                    if(!Array.isArray(responseData.response_status) && responseData.response_status.messages && responseData.response_status.messages[0].message) {
                        let errorMessage = responseData.response_status.messages[0].message;
                        if(responseData.response_status.messages[0].field) {
                            errorMessage += (" : "+ responseData.response_status.messages[0].field);
                        }
                        window.top.showalert("failure", errorMessage, "isAutoHide=true, delay=2"); //No I18N
                        return;
                    }
                    self.constructSummaryDialog(responseData);
                },
                onsave: function(saveData) {
                    let closeDesc = saveData.close_details;
                    if(closeDesc && !closeDesc.trim().empty()) {
                        saveData.close_details = {"description": closeDesc}; //No I18N
                    }else if(closeDesc) {
                        delete saveData.close_details;
                    }
                    return saveData;
                },
                onsubmit: function(form, field, event, editType, callback) {
                    let alertMsg = translate("change.bulkclose.warning");
                    if(form.fields.changed.includes("close_details") && form.fields.close_details.current_value.length > 0) { //No I18N
                        alertMsg = translate("change.bulkclose.closedetails.warning"); //No I18N
                    }
                    if(form.validateForm()) {
                        self.confirmBulkClose(function(confirm){
                            callback(confirm);
                        }, alertMsg);
                        return true;
                    }
                }

            },
            afterRenderCallback: function(form) {
                jQuery(jQuery('[data-cs-field="properties_grid"]').find('.form-wrapper')[0]).removeClass('pb25');
                jQuery("#changeCloseForm").find(".left-col").removeClass("pt0").removeClass("pb0");
                jQuery("#changeCloseForm").find(".right-col").addClass("pr15");
                jQuery('#change_bulkclose_container').removeClass("form-template");

                self.getConfigForAttachment("changes/close_details");//No I18N
            }
        }

        self.$bulk_close_FC = new FC(configJSON)

    }
    getConfigForAttachment(entity) {
        var attconfig = sdp_app.attachment_configuration || {};
        var url = this.base_url + "/close_details/attachments/get_config"; //No I18N
        if (!attconfig || !attconfig[entity]) {
            sdpAjax({
                url: url,
                async: false,
                cache: true,
                ignoreHeader: true,
                ignorefailuremessage: true,
                success: function (resp) {
                    attconfig[entity] = resp.attachment_settings;
                    attconfig[entity].tuple_limit = 10;
                }
            });
        }else {
            attconfig[entity].tuple_limit = 10;
        }
    }
    /*Before Rendering form constructing template field changes*/
    constructTemplate(requiredfields,column_count,fieldsProperty)
    {

          var fieldsLayout = [];
          requiredfields.forEach(function(field, i) {
            var obj = {};
            obj.name = field;

            var colCount = (i+1)%column_count;
            var col = colCount ? colCount : column_count;
            obj.position = {"col": col,"col_size": 1,"row": i+1,"row_size": 1};

            if(field === "close_details") {
                jQuery.extend(true,obj,fieldsProperty['close_details'].fields.description);
                obj.name = 'close_details'

            }else {
                if(fieldsProperty && fieldsProperty.hasOwnProperty(field)){
                  jQuery.extend(true,obj,fieldsProperty[field]);
                }
            }

            fieldsLayout.push(obj);
          });

          let layout = [  {  "column_count": 1 ,  "sections": [{"column_count": column_count,"fields": fieldsLayout }] }];//No I18N
          /** adding Attachments inside layout */
          layout.push({
            "title": window.translate("sdp.common.attachments"), //No I18N
            "sections": [{//No I18N
                type: "attachments", //No I18N
                id: "attachments", //No I18N
                container_id: "closedetail-attachment", //No I18N
                options: {
                    api: false,
                    upload: true,
                    is_odapi: true,
                    upload_api: true,
                    enable_delete: true,
                    description: true,
                    accept_od_compatible: true,
                    entity: "changes/close_details",//No I18N
                }
            }]
        })

        var template = {"layouts":  layout};   // No I18N
        /** adding field_align so that field label is aligned at the top */
        template.style_properties = {field_style:{"field_align":"top"}} // No I18N
        return template;
    }
    /*Click function for cancel button in bulkclose form*/
    cancelForm() {
        let self = this;
        self.$bulk_close_FC.destroy();
        jQuery('#change_bulkclose_container').sdp_zcomponent_dialog("close"); //No I18N
    }
    /*Initialize close summary dialog */
    constructSummaryDialog(responseData) {
        let self = this;
        window.top.changelistview.changeAjaxHandler("/Changes.cc");//No I18N
        let data = self.constructSummaryData(responseData);
        let summaryContent = renderhbs(null, "bulkclose_summary_template", data, false, "change", true, true, null, true);// No I18N
        /*close summary dialog */
        window.top.jQuery("#CHG_BULK_CLOSE").append('<div id="chg_bulkCloseSummary"></div>');//No I18N
        const chgBulkCloseSummary = window.top.jQuery("#CHG_BULK_CLOSE").children('#chg_bulkCloseSummary').append(summaryContent);//No I18N

        window.top.jQuery(chgBulkCloseSummary).sdp_zcomponent_dialog({
            width:window.outerWidth * 0.4,
            height:'auto',   // No I18N
            modal:'true',    // No I18N
            resize:'false',   // No I18N
            open: function() {
                jQuery('.zdialog__content').addClass("maxh-65vh");
                jQuery(".zdialog__content ").scrollTop(0);
            },
            title: window.translate("change.bulkclose.summary.title") //No I18N
        });
        self.cancelForm();
    }
    /*Before Rendering summary dialog constructing data*/
    constructSummaryData(respData) {
        function hanldeResponseData(respStatus) {
            if(respStatus.message && typeof respStatus.message === 'string') {
                return [respStatus.message, respStatus.field];
            }
            return hanldeResponseData(respStatus.message.response_status.messages[0]);
        }

        let data = {};
        data.success = [];
        data.failed = {};
        data.failedCnt = 0;
        for(let status=respData.response_status.length-1;status>=0;status--) {
            let respStatus = respData.response_status[status];
            if(respStatus.status === "success") {   // No I18N
                data.success.push(respStatus.id);
            }else {
                data.failedCnt++;
                let [message, field] = hanldeResponseData(respStatus.messages[0])
                let reasonForFail = message + (field?(" - " + field):"");  // No I18N
                if(field === "change_stage") {//NO I18N
                    reasonForFail = translate("sdp.api.unauthorized");
                }
                if(!data.failed.hasOwnProperty(reasonForFail)) {
                    data.failed[reasonForFail] = {changeids:[], count:0, displayCnt: false};
                }
                data.failed[reasonForFail].count += 1;
                data.failed[reasonForFail].changeids.push(respStatus.id);
                if (!data.failed[reasonForFail].displayCnt && data.failed[reasonForFail].count > 1) {
                    data.failed[reasonForFail].displayCnt = true;
                }
            }
        }
        return data;
    }
    confirmBulkClose(callback, alertMessage) {
        showconfirm(true,'title='+getMessageForKey("sdp.common.warning")+', message='+alertMessage+', submitbutton='+getMessageForKey("sdp.common.ok")+', cancelbutton='+getMessageForKey("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',callback);   // No I18N
        jQuery("#show_alert_info_message > span").addClass("lh-large");
    }
}
}
