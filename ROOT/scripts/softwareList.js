var softwareListView = {
    gotoSoftwareTab : function(tabName, tab_panel, tabSettings){
        assetsObj.pushingStateURL("detail", assetDetailView.module, "", tabSettings.options.module_options.id, "softwares"); // No I18N

        var showSoftwareList = false;
        var show_software = false;
        var url = "asset_computers/"+Number(assetDetailView.data.id)+"/softwares/_total_count"; //NO I18N
        var inputObject = {"list_info":{"start_index":1, "fields_required":["id"]}} //NO I18N

        assetsObj.commonAjaxFunction(url,null,inputObject,function(response){
            if(response.hasOwnProperty("_total_count")){
                showSoftwareList = response._total_count.softwares > 0;
            }
        },"_total_count",true);// No I18N
        sdpAjax({
            type: 'GET',//no i18n
            ignorefailuremessage: true,
            url: "/servlet/AJaxServlet?action=getShowSoftware&wsId="+Number(assetDetailView.asset_id),//no i18n
            async: false,
            success: function(resp) {
                if(resp.show_software){
                    show_software = resp.show_software;
                }
            },
            error:function(response){
                showalert('failure', ZSEC.Encoder.encodeForHTML(response.responseJSON.response_status.messages[0].message), "isAutoHide=true");// No I18N
             }

        });
        if(!show_software && !showSoftwareList) {
            var link = '<a href="/SetUpWizard.do?forwardTo=aesettings#swscan" target="_blank"><b>' + getMessageForKey("ae.asset.software.scansw.configure") + '</b></a>';
            var message = '<div class="alert alert-info icon" role="alert">\
                <span class="msg">\
                    ' + getMessageForKey("ae.asset.software.scansw.conf1", [link]) + '\
                </span>\
            </div>';
            jQuery("#content-details-inner-workstation").html(message);
            return;
        }

        setTimeout(function(){
            jQuery("#software_tab").find("[data-detail-tab='softwares']").trigger("click"); // No I18N
        });
    },
    getTemplateData: function (options) {
        return {
            multiDeleteDisabled: true,
            filterMenuEnabled: false,
            additonal_data: softwareListView.loadSoftwareTypes(),
            from: options.from
        }
    },
    render: function (id, data) {
        renderhbs("#"+id, "asset-details-software-template", jQuery.extend(this.getTemplateData(this.options), data), null,"assets" );// No I18N
    },
    init: function (options) {
        this.id = options.id;
        this.links_data = options.links_data;
        this.options = options;
    },
    initSoftwareListView : function() {
        var _self = softwareListView;
        var personalizeKey = "softwares" + (_self.options.from || ""); // No I18N
        var tableInfo = getPersonalizeData(personalizeKey);
        if(jQuery.isEmptyObject(tableInfo)){
            if (_self.options.from === "action") {//No I18N
                tableInfo = {

                    list_info: {
                    "fields_required": {"name": {}, "manufacturer": {}}//No I18N
                    }
                }
            } else {
                tableInfo = { //No I18N
                    "fields_required": {"software.name" : {},"version": {},"software.type.name": {"width": "200px"},"software.category.name": {},"product_key": {},"installed_on": {},"usage": {}}, // No I18N
                    "list_info": { // No I18N
                        "sort_field": "id", "sort_order": "desc", "row_count": "25" ,"fields_required": {"software.name" : {},"version": {},"software.type": {},"software.category": {},"product_key": {},"installed_on": {},"usage": {}} // No I18N
                    }
                };
            }
        }
        if (sdp_app.IS_REMOTE_SERVER && tableInfo.list_info.fields_required && tableInfo.list_info.fields_required.usage) {
            delete tableInfo["list_info"]["fields_required"]["usage"];
        }

        var table_content = {};
        var isFromAction = _self.options.from === "action";// No I18N
        table_content.header = _self.headerDataConstruct();
        if(this.printPreview){
            delete table_content.header.softwares_head_chk;
        }
        var options = {
            callbackURL          : "asset_computers/" + Number(_self.id) + "/softwares" + (isFromAction ? "/software" : ""),// No I18N
            deleteURL            : "asset_computers/"+Number(_self.id)+"/softwares",// No I18N
            entity_name          : isFromAction ? "software" : "softwares",// No I18N
            metainfo_entity      : isFromAction ? "asset_computers/"+Number(_self.id)+"/softwares/software" : "asset_computers/"+Number(_self.id)+"/softwares",// No I18N
            tableHolder          : "softwares",// No I18N
            paginationEnabled    : true,
            searchEnabled        : true,
            staticHeader         : true,
            sortingEnabled       : true,
            multiDeleteEnabled   : _self.links_data.permissions.edit,
            columnChooserEnabled : !isFromAction,
            getmetaInfo          : true,
            discard_without_displayname : true,
            callbackRowfunction  : _self.rowDataConstruct,
            row_inputdata        : _self.rowDataConstruct(tableInfo,{ "isFR_ListInfo_Support": true }),// No I18N
            personalize_key      : personalizeKey,
            isODAPI              : true,
            support_old_get_total_count : true,
            discarded_fields     : ["added_by","software","workstation","license","location"], //No I18N
            callbackSearchFunction : _self.globalSearch,
            isFR_ListInfo_Support : true,
            width : jQuery("#content-details-workstation").width(),
            bulkSelectionSetting: {
                constructSelectedListCB: function (data) {
                    var name = isFromAction ? data.name : data.software.name;
                    return "<span title='" + e_attr(name) + "' rel='uitip'>" + e_html(name) + "</span>";
                }
            },
            get_total_count: false
        };
        if (isFromAction) {
            options.width = jQuery(window).width() - 5;
            options.height = jQuery(window).height() - 100;
        }
        /**Added for getting all software in asset details page print preview */
        if(typeof assetDetailView!='undefined' && assetDetailView && assetDetailView.detComp && assetDetailView.detComp.mode=="print"){
            if(window.opener.assetActions.getSoftwareData){
                options.callbackDataGet = function(){
                    let entData = {};
                    entData.softwares = window.opener.assetActions.getSoftwareData;                
                    return entData;
                }
            }
            options.paginationEnabled = false;
            options.sortingEnabled = false;
            options.height="auto";
        }
        /**End */
        _self.softwareTable = new tableComponent(tableInfo, table_content, options, {});

        jQuery("ul#softwareFiltersList li").on("click", function(){
            jQuery("#searchSoftwares").val("");
            jQuery("ul#softwareFiltersList li").removeClass("active");
            var liEle = jQuery(this);
            liEle.addClass("active")
            var selectedFilter = liEle.find("a").text();
            var filterId = liEle.attr("data-filterid");
            jQuery("#softwareSelectedFilter").text(selectedFilter).attr("data-filterId", filterId);
            if(filterId != "all"){
                _self.softwareTable.t_obj.table_info.list_info.search_criteria = { "field": (_self.options.from === "action" ? "type.id" : "software.type.id"), "condition": "is", "value": filterId};     // No I18N
            }else{
                delete _self.softwareTable.t_obj.table_info.list_info.search_criteria;
            }
            _self.softwareTable.changeFilterString("clearOnly");// No I18N
            _self.softwareTable.refreshTable();
        });
        var clearIcon = jQuery("#software_tab_content").find(".inputclear-icon");// No I18N
        clearIcon.on('click',function(){// No I18N
            clearIcon.hide();
            jQuery("#searchSoftwares").val('').focus();// No I18N
            _self.globalSearch("globalSearch", jQuery("#software_tab_content #searchSoftwares"), {"keyCode" :13});// No I18N
        });
    },
    addSoftware: function () {
        var self = softwareListView;
        var softwareTable = softwareListView.softwareTable;
        var selectedSoftwares = softwareTable.bulkSelect.getSelectedIDs();
        var softwares = selectedSoftwares.map(function (id) {
            return { software: { id: id } };
        });

        var data = {
            softwares: softwares
        };

        jQuery("#sw_listviewloader").show();

        sdpAjax({
            url: "/api/v3/asset_computers/" + self.id + "/softwares", //NO I18N
            data: sdpAjaxInputData(data),
            type: "POST", //NO I18N
            success: function (resp) {
                if (resp.softwares.software || resp.softwares.length) {
                    assetDetailView = window.top.assetDetailView;
                    assetDetailView.data.show_software = true;
                    window.top.jQuery('[data-detail-tab="softwares"]').trigger("click");
                }

                showalert("success", translate("sdp.inventory.addSWAction.successMsg"), "isAutoHide=true"); //NO I18N
                softwareTable.refreshTable();
            },
            complete: function () {
                jQuery("#sw_listviewloader").hide();
            }
        });
    },
    headerDataConstruct: function () {
        var _self = softwareListView;
        var metaData = {};
        var meta_data_add = {};
        metaData.softwares_head_chk = {
            "type" : "checkbox", // No I18N
            "default" : true// No I18N
        };
        if(_self.options.from === "action") {
            metaData.softwares_head_chk.width = "21px";
            meta_data_add = {
                "name": {},// No I18N
                "manufacturer": {}// No I18N
            }
        } else {
            meta_data_add = {
                "software.name": {
                    "checkbox_disable": true,// No I18N
                    "default":true,// No I18N
                    dataCelltransformer : function(tdata){
                        return '<a href="/SWWorkstationListView.do?criteria='+tdata.row_data.software.id+'" target="_blank" rel="noopener noreferrer uitip" title="'+e_attr(tdata.row_data.software.name)+'">'+e_html(tdata.row_data.software.name)+'</a>';// No I18N
                    },
                    text: getMessageForKey("sdp.inventory.wsDetailView.tabHeader.software")
                },
                version: {"checkbox_disable": true, "default":true},// No I18N
                product_id: {},
                "software.type": {"text" : getMessageForKey("sdp.inventory.newSW.swType"), value_path: "software.type.name", "checkbox_disable": true}, // No I18N
                "software.category": {"text" : getMessageForKey("sdp.inventory.detailWS.SWcategory"), value_path: "software.category.name", "checkbox_disable": true}, // No I18N
                installed_on: { "checkbox_disable": true, "default":true},// No I18N
                product_key: {},
                usage: {
                    dataCelltransformer : function(tdata){
                        return tdata.row_data.usage ? tdata.row_data.usage.name : 'Not known';//No I18N
                    },
                    value_path: "usage.name"//No I18N
                },
                license_name : {"text" : getMessageForKey("sdp.asset.software.license.allocated.info"), value_path: "license.license_name"}, // No I18N
                key :{text : getMessageForKey("sdp.inventory.software.listView.allocatedProductKey"), value_path: "license.key"} // No I18N
            };
        }
        if(sdp_app.IS_REMOTE_SERVER && meta_data_add["usage"]) {
            delete meta_data_add["usage"];
        }
        jQuery.extend(metaData,meta_data_add);
        if(!softwareListView.links_data.permissions.edit){
            delete metaData.softwares_head_chk;
            delete metaData.edit;
        }
        return metaData;
    },
    rowDataConstruct: function(table_info,options) {
        if (options.isFR_ListInfo_Support && table_info.list_info.fields_required != undefined) {
                table_info.fields_required = table_info.list_info.fields_required;
                delete table_info.list_info.fields_required;
            }
        var inputObject = {};
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        var editIndex = fields_required_arr.indexOf("edit");
        if(editIndex > -1){
            fields_required_arr.splice(editIndex, 1);
        }
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
        return inputObject;
    },
    globalSearch : function(searchType, ele, e){
        var searchText = jQuery("#searchSoftwares").val();
        var clearIcon = jQuery("#searchSoftwares").closest(".sdpsearch-group").find(".inputclear-icon"); //No I18N
        if(searchText != ""){
            clearIcon.show();
        }else{
            clearIcon.hide();
        }
        var _self = softwareListView;
        if((e && e.keyCode == 13) || searchType == "tableSearch"){ // No I18N
            var meta_info =  jQ.extend(true, {}, _self.softwareTable.t_obj.meta_info);
            var criteria = {};
            if(searchType == "globalSearch"){
                jQuery("#softwareSelectedFilter").text(getMessageForKey("asset.sw.filter.all")).attr("data-filterId", "all");
                jQuery("ul#softwareFiltersList li").removeClass("active");
                jQuery("ul#softwareFiltersList li[data-filterid='all']").addClass("active");
                if(trim(searchText) != ""){
                    criteria = {"field" : "software.name" ,"condition" : "contains" ,"value" : searchText}; // No I18N
                    delete meta_info.software;
                    var childArray = [];
                    for(var key in meta_info) {
                        var valueObj = meta_info[key];
                        if(valueObj.searchable != false && valueObj.type != "checkbox" && valueObj.type != "icon"){
                            if(valueObj.lookup_entity){
                                key = key+"."+valueObj.lookup_field;
                            }
                            else if(valueObj.value_path) {
                                key=valueObj.value_path;
                            }
                            childArray.push({"field" : key ,"condition" : "contains" ,"value" : searchText, "logical_operator" :"OR"}); // No I18N
                        }
                    }
                    criteria.children = childArray;
                    _self.softwareTable.t_obj.table_info.list_info.search_criteria = criteria;
                }else{
                    delete _self.softwareTable.t_obj.table_info.list_info.search_criteria;
                }
                _self.softwareTable.changeFilterString("clearOnly");// No I18N
            }else{
                jQuery("#searchSoftwares").val("").next().hide(); // No I18N
                var filterId = jQuery("#softwareSelectedFilter").attr("data-filterid");
                if(filterId && filterId !="all"){
                    var logical_operator = (searchType == "tableSearch") ? "AND" : "OR"; // No I18N
                    criteria = { "field": (_self.options.from === "action" ? "type.id" : "software.type.id"), "condition": "is", "value": filterId, "logical_operator" :logical_operator }; // No I18N
                    delete meta_info.software_type;
                }
                var search_Obj = _self.softwareTable.t_obj.table_info.list_info.search_fields;
                var critChildArray = [];

                jQuery.each(search_Obj,function(key,value){
                    if(jQuery.isEmptyObject(criteria)){
                        criteria = {"field" :key, "condition": "contains", "value": value, "logical_operator" :"AND" }; // No I18N
                    }else{
                        critChildArray.push({
                            "field" : key, // No I18N
                            "value" : value, // No I18N
                            "condition" : "contains", // No I18N
                            "logical_operator" : "AND" // No I18N
                        });
                    }
                });
                if(critChildArray.length > 0){
                    criteria.children = critChildArray;
                }
                if(jQuery.isEmptyObject(criteria)){
                    delete _self.softwareTable.t_obj.table_info.list_info.search_criteria;
                    delete _self.softwareTable.t_obj.table_info.list_info.search_fields;
                }else{
                    _self.softwareTable.t_obj.table_info.list_info.search_criteria = criteria;
                    delete _self.softwareTable.t_obj.table_info.list_info.search_fields;
                }
            }

            _self.softwareTable.refreshTable("search"); // No I18N
        }
    },
    loadSoftwareTypes: function(){
        var sType = "";
        sdpAjax({
            url: "/api/v3/asset_computers/softwares/software/type", //NO I18N
            success: function(response) {
                sType = {"software_type" : response.type}; // No I18N
            },
            cache: false,
            async: false,
            ignorefailuremessage: true
        });
        return sType;
    },
    initServicePackList : function(){
        var _self = softwareListView;
        var tableInfo = {"list_info" :{"start_index" :1,"row_count" :25}};// No I18N
        var table_content = {};
        table_content.header = _self.headerDataSPConstruct();
        if(this.printPreview){
            delete table_content.header.service_packs_head_chk;
        }
        var options = {
            callbackURL          : "asset_computers/"+Number(_self.id)+"/service_packs",// No I18N
            metainfo_entity      : "asset_computers/"+Number(_self.id)+"/service_packs",// No I18N
            deleteURL			 : "asset_computers/"+Number(_self.id)+"/service_packs",// No I18N
            entity_name          : "service_packs",// No I18N
            tableHolder          : "service_packs",// No I18N
            paginationEnabled    : true,
            searchEnabled        : true,
            multiDeleteEnabled   : _self.links_data.permissions.edit,
            getmetaInfo          : true,
            row_inputdata        : {"list_info" :{"start_index" :1,"row_count":25}}, // No I18N
            isODAPI              : true
        };
        var _softTable = new tableComponent(tableInfo, table_content, options, {});
    },
    headerDataSPConstruct: function () {
        var _self = this;
        var meta_data = {
            service_packs_head_chk : {type: "checkbox","default" : true}, // No I18N
            service_pack: {"default": true, text: getMessageForKey("sdp.inventory.detailWS.osServicePack")}, // No I18N
            software: {"default": true, text: getMessageForKey("sdp.inventory.wsDetailView.tabHeader.software")}, // No I18N
            installed_on: {"default": true, text: getMessageForKey("sdp.inventory.listview.installedon")}, // No I18N
            installed_by: {"default": true, text: getMessageForKey("sdp.inventory.listview.installedby")} // No I18N
        };
        if (!_self.links_data.permissions.edit){
            delete meta_data.service_packs_head_chk;
        }
        return meta_data;
    }
};
