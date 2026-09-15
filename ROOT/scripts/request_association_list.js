/* $Id$ */
/*  Request list view scripts for association is available in this file
 */
function getChgReqAssocObj(){
    var $reqAssocList = {
        setOptions: function(options){
            this.module = options.module;
            this.module_id = options.module_id;
            this.view = options.view;
            this.canAssociate = options.canAssociate;
            this.reqAssocType = options.reqAssocType;
            this.base_url = "/api/v3/";   //No I18N
            this.entity_url = this.module +"s/"+ this.module_id + "/" + options.reqAssocType;    //No I18N
            this.options = options;
            this.filter_personalize_key = "request_currentview";    //No I18N
            this.isExternalFrame=options.isExternalFrame;
            options.arc_entity_name = (options.module == 'change' ? ('arc_'+options.reqAssocType) : (options.module == 'problem' ? 'associated_arcincidents' : '')); //No I18N
        },
        // compiles handlebars and places it in container.
        renderListView: function(options){
            var _self = this;
            _self.setOptions(options);
            if(_self.module === 'change'  ) {
                var rc=(typeof $rc === 'undefined')?window.top.$rc:$rc;//No I18N
                //counts to be shown on request association page button
                _self.requestcount = rc.summary.requests[options.reqAssocType] - rc.summary.arc_requests["arc_" + options.reqAssocType];
                _self.arc_requestcount = rc.summary.arc_requests["arc_" + options.reqAssocType];

              }else if(_self.module === 'problem'){ //No I18N
                var problemDetails=(typeof $problemDetails === 'undefined') ? $previewComponent.iframeActiveParent().window.$problemDetails:$problemDetails; //No I18N
                _self.requestcount = problemDetails.getEntitySummary().summary.associated_incidents
                _self.arc_requestcount = problemDetails.getEntitySummary().summary.associated_arcincidents;
              }
                if (_self.isExternalFrame === true) {
                var personalize_Data = getPersonalizeData(_self.filter_personalize_key);
                    if (personalize_Data && personalize_Data.filter_by) {
                        sdpAjax({
                            url: '/api/v3/list_view_filters/' + personalize_Data.filter_by.id, // No I18N
                            success: function (resp) {
                                personalize_Data.filter_by.name = resp.list_view_filter.display_name;
                            },
                            async: false
                        });
                    }
                _self.currentFilterView = jQuery.isEmptyObject(personalize_Data) ? null : personalize_Data;
            }
            var data = _self;
            data.callbackURL = (_self.view == "associated") ? _self.entity_url : _self.entity_url + "/request";   //No I18N
            data.entityLabel =(_self.view == "associated") ? _self.reqAssocType : "request";   //No I18N
            data.personalizeKey = (_self.view == "associated") ? "associated_"+_self.reqAssocType : "associate_requests";   //No I18N
            data.metainfoURL = _self.entity_url + "/request";   //No I18N
            data.listDisplayName = (options.reqAssocType == "initiated_by_requests") ? translate("sdp.change.changedetails.incidentscauseschange") : translate("sdp.change.changedetails.incidentscausedbychange");   //No I18N
            data.hide_title = false;
            if(data.reqAssocType == "associated_incidents"){
                data.hide_title = true;
                data.listDisplayName = translate("sdp.problem.actions.associate");   //No I18N
            }
			if(isMSP) {
				data.showAccountFilter=msp_assoc_json.show_account_filter && _self.isExternalFrame === true;
				(_self.isExternalFrame === true) && (getCustomAccID = null);
			}
            var containerId = (_self.view == "associated") ? "#"+_self.reqAssocType+"_listviewloader" : "#request_listview_container";  //No I18N
            renderhbs(containerId, "request_listcontrols_template", data, false, "associations", true,false);  //NO I18N
            _self.initWebComponent();
			if(isMSP && data.showAccountFilter) {
				_self.initAccountSelectBox();    
			}
        },
        // This method is being used by MSP Team
        initAccountSelectBox: function(){
	        if(!isMSP){
		        return;
	        }
	        let assocAccountElement = jQuery("#association_account");//No I18N
	        let accountOpts = msp_assoc_json.account_options;
	        var webCompName = "webc_"+this.reqAssocType;//No I18N
	        if(msp_assoc_json.is_msp_entity) {
		        assocAccountElement.sdp_select2({value:accountOpts[0],cache:{},url:[{url:"/api/v3/accounts", field:'accounts',list_info:{start_index:1,row_count:25}}]});//NO I18N
	        } else {
		        assocAccountElement.select2({data:accountOpts});
		        assocAccountElement.select2('data', accountOpts[0]); //NO I18N
	        }
	        assocAccountElement.on('change', function(){
		        WebComponents.getInstance(webCompName).refreshTable("refresh"); //NO I18N
	        });
	        window.getCustomAccID = function(url){
		        if(url && ( (url.startsWith('/api/v3/problems/') && url.indexOf('associated_incidents/request')!=-1) || (url.startsWith('/api/v3/changes/') && url.indexOf('requests/request')!=-1) ) ) { //NO I18N
			        return jQuery("#association_account").select2('val'); //NO I18N
		        }
		        return getAccountFromCombo();
	        };
        },
        // initializes webcomponent.
        initWebComponent: function(){
            /* Clear the instance if already rendered */
            var _self = this;
            WebComponents && WebComponents.instancePool["webc_"+_self.reqAssocType] && delete WebComponents.instancePool["webc_"+_self.reqAssocType];
            WebComponents.render("webc_"+_self.reqAssocType);
            _self["webc_"+_self.reqAssocType] = WebComponents.getInstance("webc_"+_self.reqAssocType); //No I18N
        },
        constructNewTabIcon: function(tdata){
            return '<div><div class="right0 top0 p5 pr5" style="display: inline-block;"><a href="/WorkOrder.do?woMode=viewWO&woID=' + tdata.row_data.id + '" target="_blank" class="cspr flat icon-sm newtab" title="' + translate('sdp.requests.newrequest.autosuggest.newwindow.open') + '" rel="uitip"></a></div></div>';
        },
        row_inputdata: function(tableInfo){
            var self = this;
            var row_inputdata = {};
            row_inputdata.list_info = tableInfo.list_info;
            row_inputdata.fields_required=Object.keys(tableInfo.fields_required);
            var newTabIndex = row_inputdata.fields_required.indexOf('newtablink');
            if(newTabIndex != -1){
                row_inputdata.fields_required.splice(newTabIndex,1);
            }

            if($reqAssocList.module==='change' && ((typeof $rc === 'undefined')?window.top.$rc:$rc).printPreview)
            {
                //for print preview  100  available associations are shown by default
                row_inputdata.list_info.row_count="100";
            }
            if(self.currentFilterView){
                row_inputdata.list_info.filter_by = {id: self.currentFilterView.filter_by.id};
              }
            return row_inputdata;
        },

        setDataMetaInfo: function(){
            return {"for":"request_list_view"};  //No I18N
        },
        noDataRender: function(a){
            if($reqAssocList.canAssociate && !a.t_obj.options.isArchive){
                if($reqAssocList.module === 'change' && $reqAssocList.reqAssocType === 'initiated_requests') {
                    return '<div class="alert-nodata"><div class="msg">' + translate("common.noassociation",[translate("common.requests")]) + '.&nbsp;<a class="text-primary" href="/" id="ch_initiated_by_req_associationurl" data-cs-field="request_change">' + translate("sdp.project.associate.request") + '</a></div></div>';
                }else {
                    return '<div class="alert-nodata"><div class="msg">' + translate("common.noassociation",[translate("common.requests")]) + '.&nbsp;<a class="text-primary" href="/" data-event="click" data-handler="$previewComponent.load(\'/workorder/RequestListViewWeb.jsp?module=' + $reqAssocList.module + '&module_id=' + $reqAssocList.module_id + '&externalframe=true&view=association&type='+ $reqAssocList.reqAssocType+'&canAssociate='+ $reqAssocList.canAssociate+'\', \'' + $reqAssocList.listDisplayName + '\',\'75%\',null, null, \'request_association_popup\');" nonce='+sdpNonce+' data-cs-field="request_change">' + translate("sdp.project.associate.request") + '</a></div></div>';
                }
            }
            var html='';
            //For change module print preview header
            ($reqAssocList.module==='change' && ((typeof $rc === 'undefined')?window.top.$rc:$rc).printPreview)?html+='<span class="fl mt4 mr10 ml5 mb15">'+$reqAssocList.listDisplayName+'</span>':'';
            return html+='<div class="alert-nodata"><div class="msg">' + translate("common.noassociation",[translate("common.requests")]) + '.&nbsp;</div></div>';


        },
        // returns data in second level object.
        process_rowdata: function(row_data){
            return row_data;
        },
        confirmDissocRequests: function(){
            var _self = this;
            showconfirm(true,'title='+translate("common.dissociate.request")+', message='+translate("sdp.change.error.incidentdetachconfirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes', function(confirm){ //No I18N
                if(confirm){
                    _self.assocOrDissocRequests("delete");  //No I18N
                }
            },true);
        },
        assocOrDissocRequests: function(type){
            var _self = this;
            var selectedIds = WebComponents.instancePool["webc_"+_self.reqAssocType].bulkSelect.getSelectedIDs();
            if(selectedIds.length == 0){
                var message = (type ==  "delete") ? "sdp.change.error.reqdetachnoselection" : "sdp.changedetails.associateincidents.js"; //No I18N
                showalert("warning", translate(message), "isAutoHide=false"); //No I18N
                return;
            }
            var entityData = [];
            jQuery.each(selectedIds,function(i, id){
                var entityJson = {"request": {"id": id}};   //No I18N
                entityData.push(entityJson);
            });
            var sd_Data = {};
            sd_Data[_self.reqAssocType]= entityData;
            var inputData = sdpAjaxInputData(sd_Data);
            sdpAjax({
                    url: _self.base_url + _self.entity_url,
                    type: type ? type : "post",   //No I18N
                    data: inputData,
                    acceptODCompatible:true,
                    success: function(resp){
                        if(type == "delete"){
                            window.top.showalert("success", translate("common.dissociated",[translate('common.request')]), "isAutoHide=true, delay=3"); //No I18N
                            if(WebComponents.getInstance("webc_"+_self.reqAssocType)){
                                WebComponents.getInstance("webc_"+_self.reqAssocType).refreshTable(); // No I18N
                            }
                            var successCount = resp.response_status.filter(function(response){
                                if(response.status == "success") return true;
                            }).length;
                            if(_self.module=='change'){
                            window.top.$rc.summary.requests[_self.reqAssocType] = window.top.$rc.summary.requests[_self.reqAssocType] - successCount;
                            }else if(_self.module=='problem'){ //No I18N
                                var problemDetails=(typeof $problemDetails === 'undefined') ? $previewComponent.iframeActiveParent().window.$problemDetails:$problemDetails; //No I18N
                                problemDetails.getEntitySummary().summary.associated_incidents -= successCount;
                            }
                            //For dissociation page is not re-rendered only table is refreshed hence updating the button value through jquery
                            const spanElement = document.getElementById('activeCount_'+_self.reqAssocType);
                            if (spanElement) {
                            let currentCount = Number(spanElement.textContent.match(/\d+/)[0]);
                            let newCount = currentCount - successCount;
                            spanElement.textContent = translate("sdp.change.archive.problemView.recentrequests")+`(${newCount})`;
                            }

                            window.top.jQuery("#count_"+_self.reqAssocType).length && (window.top.jQuery("#count_"+_self.reqAssocType)[0].innerHTML = parseInt(window.top.jQuery("#count_"+_self.reqAssocType)[0].innerHTML) - successCount);
                        }else{
                            window.top.showalert("success", translate("common.associated",[translate('common.request')]), "isAutoHide=true, delay=3"); //No I18N
                            if(_self.module=='change'){
                            window.top.$rc.$detailsComp.gotoTabByPath(window.top.$rc.getTabPathHash("#Planning/associations")); //No I18N
                                window.top.$rc.summary.requests[_self.reqAssocType] = window.top.$rc.summary.requests[_self.reqAssocType] +selectedIds.length;
                            }else if(_self.module=='problem'){ //No I18N
                                var problemDetails=(typeof $problemDetails === 'undefined') ? $previewComponent.iframeActiveParent().window.$problemDetails:$problemDetails; //No I18N
                                problemDetails.$detailsComp.gotoTabByPath(problemDetails.getTabPathHash("#associations")); //No I18N
                                problemDetails.getEntitySummary().summary.associated_incidents += selectedIds.length;
                            }
                            window.top.jQuery("#count_"+_self.reqAssocType).length && (window.top.jQuery("#count_"+_self.reqAssocType)[0].innerHTML = parseInt(window.top.jQuery("#count_"+_self.reqAssocType)[0].innerHTML) + selectedIds.length);
                            window.top.jQuery("#actions_list").removeClass("open");
                            setTimeout(function() {
                                if(_self.module=='problem'){
                                    $previewComponent.iframeActiveParent().window.$previewComponent.closePreview("request_association_popup");// No I18N
                                }else{
                                window.top.$previewComponent.closePreview("request_association_popup");// No I18N
                                }
                            }, 10);
                        }
                    },
                    error: function(resp){

                    }
                });
        },

        // fetches non-archived requests nd hides archived request button
        loadRecentRequests: function(){
            _self=this;
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.entity_name=_self.options.reqAssocType;// No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.isArchive=false; // No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.callbackURL=_self.module +"s/"+ _self.module_id + "/" +_self.options.reqAssocType;// No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).refreshTable();// No I18N
            jQuery("#"+_self.reqAssocType+"_controls").show();
            jQuery("#"+_self.reqAssocType+"_controls2").addClass('hide');
        },

        // fetches archived requests nd hides recent request button
        loadArchivedRequests: function(){
            _self=this;
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.entity_name=_self.options.arc_entity_name;// No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.isArchive=true; // No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).t_obj.options.callbackURL=_self.module +"s/"+ _self.module_id + "/" +_self.options.arc_entity_name;// No I18N
            WebComponents.getInstance("webc_"+_self.options.reqAssocType).refreshTable();// No I18N
            jQuery("#"+_self.reqAssocType+"_controls").hide();
            jQuery("#"+_self.reqAssocType+"_controls2").removeClass('hide');
        },
        setListviewWidth: function(){
            return jQuery(window).width();
        },
        setListviewHeight: function(){
            return (jQuery(window).height() - 100);
        },
        // fetches filter list
        callbackInitialRender: function () {
            if($reqAssocList.module === 'change' && ((typeof $rc === 'undefined')?window.top.$rc:$rc).printPreview)
            {
                jQ('#'+$reqAssocList.reqAssocType+'_div').prepend('<span class="fl mt4 mr10 ml5 mb15">'+$reqAssocList.listDisplayName+'</span>');
            }
            jQuery("#request_filter_btn").on('click',function(event){         // No I18N
               var filterList_obj = new filterListComp();
               filterList_obj.initComponent({
                   element : "#request_filtermenu",  // No I18N
                   module : "request",  // No I18N
                   url: "/api/v3/list_view_filters", // No I18N
                   list_info: {"list_info":{"row_count":"10","start_index":"1","search_fields":{"module":"request"},"get_total_count":true}}, // No I18N
                   lookupentity: "list_view_filters", // No I18N
                   personalize_key : "request_filter_views",// No I18N
                   filter_action : "$"+event.currentTarget.dataset.nonAction+"_list.switchFilterView", //No I18N
                   isTrashEnabled: false,
                   favoritable : false,
                   custom_filters : false,
                   skipPersonalization : false,
                   hideFilterSearch: true,
                   processData: "$"+event.currentTarget.dataset.nonAction+"_list.processFilterData"    //No I18N
               });
            });
            if($reqAssocList.module === 'change' && $reqAssocList.reqAssocType === 'initiated_requests') {
                jQuery("#ch_initiated_by_req_associationurl").on("click", function(){
                    $previewComponent.load('/workorder/RequestListViewWeb.jsp?module=' + $reqAssocList.module + '&module_id=' + $reqAssocList.module_id + '&externalframe=true&view=association&type=' + $reqAssocList.reqAssocType + '&canAssociate=' + $reqAssocList.canAssociate, $reqAssocList.listDisplayName, '75%', null, null, 'request_association_popup'); //NO I18N
                });
            }
        },
        processFilterData: function(data){
          // TODO:To be modified with required filter
          return data;
        },
        //updates personalization and refreshes table on selecting filter
        switchFilterView: function (viewId,viewName) {
          var _self = this;
          var current_view = {filter_by : { "id": viewId, "name": viewName}};// No I18N
          addPersonalization(_self.filter_personalize_key, current_view);

          WebComponents.getInstance(instanceId).t_obj.table_info.list_info.filter_by = { "id": viewId}; //No i18n
          WebComponents.getInstance(instanceId).t_obj.table_info.list_info.start_index = 1;

          WebComponents.getInstance(instanceId).changeFilterString("clearOnly");// No I18N
          WebComponents.getInstance(instanceId).refreshTable("refresh");// No I18N
          jQuery('#request-filters').text(viewName); // No I18N
          jQuery('#request_filter_btn').attr("title",viewName);// No I18N
        },
        additionalMetaInfo : function(){
            return  {
                        "requester": {"value_path" : "requester.name"}, //No I18N
                        "technician": {"value_path":"technician.name"}, //No I18N
                        "category": {"value_path" : "category.name", "type" : "string"}, //No I18N
                        "subcategory": {"value_path" : "subcategory.name", "type" : "string"}, //No I18N
                        "priority": {"value_path" : "priority.name", "type" : "string"}, //No I18N
                        "impact": {"value_path" : "impact.name", "type" : "string"}, //No I18N
                        "urgency": {"value_path" : "urgency.name", "type" : "string"}, //No I18N
                        "group": {"value_path" : "group.name", "type" : "string"}, //No I18N
                        "item": {"value_path" : "item.name", "type" : "string"}, //No I18N
                        "site":{"value_path":"site.name"},//No I18N
                        "mode": {// No I18N
                            "value_path":"mode.name"// No I18N
                        },
                        "request_type": {// No I18N
                            "value_path":"request_type.name"// No I18N
                        },
                        "department": {// No I18N
                            "value_path":"department.name"// No I18N
                        },
                    };
          },
    }
    return $reqAssocList;
};
