var $changeListView = {
    // compiles handlebars and places it in container.
        renderChangeAssociationsTable: function(options){
            this.initOptions(options);

          renderhbs("#change_listview_container", "changelistview_table_template", this.moduleData(), false, "change", true); //NO I18N

          if(window.checkIfMSP() && this.isExternalFrame=='true'){ //No I18N
          	this.initAccountSelectBox();
          }
          this.initWebComponent("changes"); //No I18N
        },
        initOptions: function(options) {
            this.module_id = options.module_id;
            this.module = options.module;
            this.canManageAssociations = options.canManageAssociations;
            this.isExternalFrame = options.isExternalFrame;
            this.changesUrl = options.changesUrl
            this.isMSPLicense = options.isMSPLicense
        },
	// This method is being used by MSP Team
		initAccountSelectBox: function()
		{
			if(!window.checkIfMSP()){
				return;
			}
			let assocAccountElement = jQuery("#association_account");//No I18N
			let accountOpts = msp_assoc_json.account_options;
			if(msp_assoc_json.is_msp_entity) {
				assocAccountElement.sdp_select2({value:accountOpts[0],cache:{},url:[{url:"/api/v3/accounts", field:'accounts',list_info:{start_index:1,row_count:25}}]});//NO I18N
			} else {
				assocAccountElement.select2({data:accountOpts});
				assocAccountElement.select2('data', accountOpts[0]); //NO I18N
			}
			assocAccountElement.on('change', function(){//No I18N
				WebComponents.getInstance("webc_changes").refreshTable("refresh"); //NO I18N
			});
			window.getCustomAccID = function(url){
				if(url && url.startsWith('/api/v3/releases/') && url.indexOf('changes/change')!=-1){ //NO I18N
					return jQuery("#association_account").select2('val'); //NO I18N
				}
				return getAccountFromCombo();
			};
		},
        // initializes webcomponent.
        initWebComponent: function(entity){
            /* Clear the instance if already rendered */
            WebComponents && WebComponents.instancePool["webc_"+entity] && delete WebComponents.instancePool["webc_"+entity];
            WebComponents.render("webc_"+entity);
            this["webc_"+entity] = WebComponents.getInstance("webc_"+entity); //No I18N
            if(this.isExternalFrame == 'true'){
              jQuery("body").addClass('of-h');
            }
        },
        noDataRender: function(){
          return `<div id="no_assocChangeList" class="alert-nodata"><div class="msg">` + getMessageForKey('common.noassociation',[getMessageForKey('sdp.module.pluralname.change')]) + `.&nbsp;<a class="text-primary" href='/' nonce=`+sdpNonce+` data-event="click" data-handler="$previewComponent.load('/change/ChangeListViewWeb.jsp?module=` + $changeListView.module + `&module_id=` + $changeListView.module_id + `&externalframe=true', '` + getMessageForKey('sdp.release.associate.changes') + `','75%',null, null, 'change_association_popup');" data-cs-field="associate_change">` + getMessageForKey('sdp.project.associate.child.change') + `</a></div></div>`;
        },
        setListviewWidth: function(){
          return jQuery(window).width();
        },
        setListviewHeight: function(){
          return (jQuery(window).height() - 100);
        },
        // returns all the required input_data.
        row_inputdata: function(tableInfo){
            var row_inputdata = {};
            row_inputdata.list_info = tableInfo.list_info;
            if(this.isExternalFrame == 'true'){
              if(this.module == "workflow"){
                row_inputdata.list_info.filter_by = {name:"open_changes"}; //No I18N
                row_inputdata.list_info.search_criteria = {field: "workflow",condition: "is", value: this.module_id}; //No I18N
              }
              row_inputdata.fields_required=Object.keys(tableInfo.fields_required);
                var newTabIndex = row_inputdata.fields_required.indexOf('newtablink');
                if(newTabIndex != -1){
                row_inputdata.fields_required.splice(newTabIndex,1);
              }
            }
            return row_inputdata;
        },
        // returns input_data for metainfo.
        setDataMetaInfo: function(){
            return {"for":"list_view"}; // No I18N
        },
        // returns data in second level object.
        process_rowdata: function(row_data){
            return row_data.change;
        },
        constructNewTabIcon: function(tdata){
          return '<div><div class="right0 top0 p5 pr5 disp-ib"><a href="/ui/changes?entity_id=' + tdata.row_data.id + '&mode=detail" target="_blank" class="cspr flat icon-sm newtab assoc-change" title="' + getMessageForKey('sdp.requests.newrequest.autosuggest.newwindow.open') + '" rel="uitip noopener" ></a></div></div>';
        },
        formatChangeTypeWithColor: function(tdata){
          var change_type = tdata.row_data.change_type;
          if(!change_type){
            change_type = {
                "name": "N/A", // No I18N
                "color": "#cccccc" // No I18N
            }
          }
          var cell_data = '<div class="disp-t"><div class="disp-c vmiddle pl10 pr10"><span class="arrowBG mt2" style="background:' + e_html(change_type.color) + '"></span></div><div class="truncate-ellipsis"><span class="truncate-wrapper pt2">' + e_html(change_type.name) +'</span></div></div>';
          return cell_data;
        },
        getAssociatedSite : function(tdata){
          var site = tdata.row_data.site;
          if(site){
            return  e_html(site.name);
          }
          return getMessageForKey('common.site.nosite');
        },
        formatPriorityWithColor: function(tdata){
          var priority = tdata.row_data.priority;
          if(priority){
            var cell_data = '<div class="disp-t"><div class="disp-c vmiddle pl10 pr10"><span class="arrowBG mt2" style="background:' + e_html(priority.color) + '"></span></div><div class="truncate-ellipsis"><span class="truncate-wrapper pt2">' + e_html(priority.name) +'</span></div></div>';
            return cell_data;
          }
          return "-";
        },
        moduleData: function(){
          var table_input_data = {
              entityLabel: (this.module == "workflow") ? 'changes' : this.isExternalFrame == 'true' ? 'change' : 'changes', //No I18N
            metainfoURl: (this.module == "workflow") ? this.changesUrl : this.changesUrl + '/change', //No I18N
            url: (this.module == "workflow") ? this.changesUrl : this.isExternalFrame == 'true' ? this.changesUrl + '/change' : this.changesUrl, //No I18N
            isExternalFrame:this.isExternalFrame,
            canManageAssociations:this.canManageAssociations,
            personalize_key: (this.module == "workflow") ? 'wf_impacted_changes' : this.isExternalFrame == 'true' ? 'associate_changes' : 'associated_changes', // No I18N
            module: this.module
          }
          return table_input_data;
        },
        // construct input_data for associate or dissociating change.
        constructEntityJson: function(module, id, manageType){
            var entityJson = {};
            if(manageType == "POST"){
              entityJson = {["change"]: {"id": id},"initiated_by": module}; //No I18N
            }else{
              entityJson = {["change"]: {"id": id}}; //No I18N
            }
            return entityJson;
        },
        // associates change if popup else initializes
        associateChanges: function(){
          var _self = this;
          if(this.isExternalFrame == 'true'){
            this.manageChangeAssociations('POST'); //No I18N
          }else{
            $previewComponent.load('/change/ChangeListViewWeb.jsp?module=' + this.module + '&module_id=' + this.module_id + '&externalframe=true', getMessageForKey('sdp.release.associate.changes'),"75%",null, null, "change_association_popup");
          }
        },
        // associates or dissociate change based on manageType.
        manageChangeAssociations: function(manageType, _window){
            var selectedIds = [];
            var self = this;
            _window = _window ? _window : window;
            selectedIds = WebComponents.instancePool["webc_changes"].bulkSelect.getSelectedIDs();
            if(selectedIds.length == 0){
                var message = (this.module == "request") ? "sdp.changedetails.associateincidents.js" : "sdp.changedetails.associateproblems.js"; //No I18N
                _window.alert(getMessageForKey(message));
                return;
            }
            var entityData = [], entityJson = {};
            jQuery.each(selectedIds,function(i, id){
                entityJson = self.constructEntityJson(this.module, id, manageType);
                entityData.push(entityJson);
            });

            var inputData = sdpAjaxInputData({["changes"]: entityData});
            const refreshListView = function(assocCount){
              if($changeListView.isExternalFrame == 'true'){
                if(window.top.WebComponents.getInstance("webc_changes")){
                  window.top.WebComponents.getInstance("webc_changes").refreshTable(); // No I18N
                }
                // to update associated changes count.
                window.top.jQuery("#associated_changes_count")[0].innerHTML = parseInt(window.top.jQuery("#associated_changes_count")[0].innerHTML) + assocCount;
                setTimeout(function() {
                  window.top.$previewComponent.closePreview("change_association_popup"); // No I18N
                }, 10);
              }else{
                WebComponents.getInstance("webc_changes").refreshTable(); // No I18N
                jQuery("#associated_changes_count")[0].innerHTML = parseInt(jQuery("#associated_changes_count")[0].innerHTML) - assocCount;
              }
            }
            sdpAjax({
                url: "/api/v3/" + this.changesUrl, //No I18N
                type: manageType,
                data: inputData,
                acceptODCompatible:true,
                ignorefailuremessage: true,
                success: function(resp){
                  var showalert = window.top.showalert;
                  if(manageType == 'POST'){
                    showalert("success", getMessageForKey("common.associated",[getMessageForKey('sdp.module.singularname.change')]), "isAutoHide=true, delay=3"); //No I18N
                  }else{
                    showalert("success", getMessageForKey("common.dissociated",[getMessageForKey('sdp.module.singularname.change')]), "isAutoHide=true, delay=3"); //No I18N
                  }
                  refreshListView(selectedIds.length);
                },
                error: function(jqXHR){
                  let resp = jqXHR.responseJSON;
                  if (resp.response_status && resp.response_status.constructor === Array) {
                    let failed = resp.response_status.filter(i => i.status === "failed"); // No I18N
                    let success = resp.response_status.filter(i => i.status === "success"); // No I18N
                    if(selectedIds.length == 1 && failed.length){
                      if (failed[0].messages && failed[0].messages[0].message) {
                        showalert('failure', e_html(failed[0].messages[0].message), "isAutoHide=false"); // No I18N
                      }
                    }else{
                      const result = failed.flatMap(item => {
                        if (Array.isArray(item.messages)) {
                          return item.messages
                            .filter(msg => Array.isArray(msg.fields) && msg.fields[1] !== undefined)
                            .map(msg => msg.fields[1]);
                        }
                        return [];
                      });
                      const failedIds = result.join(",");
                      if(failedIds.length){
                        let input_data={"list_info":{"start_index":1,"row_count":100,"search_criteria":[{"field":"internal_name","value":"Release","condition":"like","logical_operator":"AND"}]}};// No I18N
                        let data=[];
                        let sdpOptions = {
                          url:'/api/v3/changes/stage',//NO I18N
                          cache: false,
                          async: false,
                          data:sdpAjaxInputData(input_data),
                          success: function(response) {
                            data = data.concat(response.stage);
                          },
                          error: function(response){
                            data = response.responseJSON;

                          }
                        };

                      sdpAjax(sdpOptions);
                      var errormessage="";
                      if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('name')) {
                        errormessage=data[0].name;
                      } else {
                        errormessage=data;
                      }
                        window.top.showalert('failure', translate('change.association.nostage.errormessage.bulk',[translate('sdp.inventory.audit.changes'),failedIds,e_html(errormessage)]), "isAutoHide=false"); // No I18N
                      }else{
                        failed.length && showalert('failure', e_html(failed[0].messages[0].message), "isAutoHide=false"); // No I18N
                      }
                      if(success.length){
                        refreshListView(success.length);
                      }
                    }
                  }
                }
            });
        },
        callbackInitialRender:function(){
          jQuery('#changes').off('click.assoc-change').on('click.assoc-change',function(event){//No I18N
            event.stopPropagation();
        })
        },
        additionalMetaInfo : function(){
          return  {
                      "change_type": {"value_path" : "change_type.name", "type" : "string"}, //No I18N
                      "change_owner": {"value_path" : "change_owner.name", "type" : "string"}, //No I18N
                      "urgency": {"value_path" : "urgency.name", "type" : "string"}, //No I18N
                      "change_requester": {"value_path" : "change_requester.name", "type" : "string"}, //No I18N
                      "group": {"value_path" : "group.name", "type" : "string"}, //No I18N
                      "item": {"value_path" : "item.name", "type" : "string"}, //No I18N
                      "workflow": {"value_path" : "workflow.name", "type" : "string"}, //No I18N
                      "approval_status": {"value_path" : "approval_status.name", "type" : "string"}, //No I18N
                      "change_manager": {"value_path" : "change_manager.name", "type" : "string"}, //No I18N
                      "impact": {"value_path" : "impact.name", "type" : "string"}, //No I18N
                      "sla": {"value_path" : "sla.name", "type" : "string"}, //No I18N
                      "priority": {"value_path" : "priority.name", "type" : "string"}, //No I18N
                      "site": {"value_path" : "site.name", "type" : "string"}, //No I18N
                      "stage": {"value_path" : "stage.name", "type" : "string"}, //No I18N
                      "reason_for_change": {"value_path" : "reason_for_change.name", "type" : "string"}, //No I18N
                      "risk": {"value_path" : "risk.name", "type" : "string"}, //No I18N
                      "category": {"value_path" : "category.name", "type" : "string"}, //No I18N
                      "subcategory": {"value_path" : "subcategory.name", "type" : "string"}, //No I18N
                      "status": {"value_path" : "status.name", "type" : "string"} //No I18N
                  };
        },
        otherOptions(){
          let options = {};
          options.support_search_criteria = true;
          return options;
        },
        callbackSearchFunction(){
          let _self = this;
          let search_criteria = [{field: "workflow",condition: "is", value: this.module_id}]; //No I18N
          if (_self.webc_changes.t_obj.table_info.list_info.search_criteria) {
            search_criteria.push(_self.webc_changes.t_obj.table_info.list_info.search_criteria);
          }
          //search_fields to search_criteria conversion
          delete _self.webc_changes.t_obj.table_info.list_info.search_criteria;
          _self.webc_changes.t_obj.table_info.list_info.search_criteria = search_criteria;
          _self.webc_changes.refreshTable("refresh"); //NO I18N
        }
  }
