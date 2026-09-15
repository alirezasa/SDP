// $Id$
/* PO Listview actions */

var $purchaseList = {
	init: function (module,options) {
        var _self = this;
		if(options&&options.gsearch&&options.gsearch!="null"&&options.gsearch!=undefined){
			_self.gsearch=options.gsearch;
			_self.isGlobalSearch=true;
			jQuery("#subheader_search_box").val(options.gsearch); // No I18N
		}		
		_self.homePageFilter = options.homePageFilter;
		var viewMode = "table",view = "table";// No I18N
        this.getTemplateData(function (data) {
            var current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_order_currentview);
			if(current_view){
				if(current_view.filter_by && current_view.filter_by.id){
					var filter_id = current_view.filter_by.id;
					sdpAjax({
						url: '/api/v3/list_view_filters/'+filter_id, // No I18N
						success: function(resp) {
							_self.filter_view_display_name = resp.list_view_filter.display_name;
							_self.filter_view_internal_name = resp.list_view_filter.name;
						},
						async: false
					});
				}
				 if(current_view.view == "classic"){
					viewMode = "linear";// No I18N
					view = "kanban";// No I18N
				 }
			}
			if(document.getElementById('purchase_list_container') != null) {
                data.viewMode = viewMode;
                data.view = view;
				var promise = true;
				_self.setTemplate(data);
				_self.initList(promise);
			}			
        });
		
    },
	constructLink : function(table_data) {
		 var rd = table_data.row_data;
		 // rd.id is purchaseorderid which only holds long value
		 var href = '/PurchaseOrder.do?module=view&poID='+rd.id; // No I18N
		 var _self = this;
		 if(_self.viewMode === "table") {
			 var col_str = '<a href="'+href+'" rel="uitip noopener noreferrer" title="'+ ZSEC.Encoder.encodeForHTMLAttribute(rd.name)+'">'+ZSEC.Encoder.encodeForHTML(rd.name)+'</a>';// No I18N
		 }
		 else {
			var col_str = '<a class="text-color4 sb" rel="uitip noopener noreferrer" href="'+href+'" title="'+ ZSEC.Encoder.encodeForHTMLAttribute(rd.name)+'">&nbsp;PO#&nbsp;:&nbsp;'+ZSEC.Encoder.encodeForHTML(rd.custom_po_id) +' '+ZSEC.Encoder.encodeForHTML(rd.name)+'</a>'; // No I18N
		 }
		  return col_str;
	},
	constructLinkForPOId : function(table_data) {
		var _self = this;
		if(_self.viewMode === "table") {
			 var rd = table_data.row_data;
			 // rd.id is purchaseorderid which only holds long value
			 var href = '/PurchaseOrder.do?module=view&poID='+rd.id; // No I18N	
			 var col_str = '<a href="'+href+'" rel="uitip noopener noreferrer" title="'+ ZSEC.Encoder.encodeForHTMLAttribute(rd.custom_po_id)+'">'+ZSEC.Encoder.encodeForHTML(rd.custom_po_id)+'</a>';// No I18N
		}
		 return col_str;
	},
	setTemplate : function(data){
		 var contextObj = Object.assign({},data);
		  var _self = this;
          _self.view = data.view;
          _self.viewMode = data.viewMode;
          _self.checkbox = true;
		 contextObj.checkbox = true;
		 if(!data["delete"]){
            contextObj.checkbox = false;
            _self.checkbox = false;
         }
		 contextObj.view = data.view;
         contextObj.viewMode = data.viewMode;
		 renderhbs("#polistviewloader","po-listview-template",contextObj,false,'purchase','','',function() { // No I18N	
			jQuery('[sdpJs="po-listview-template-0"]').on("click",function(event) { $purchaseList.filterDropdownClick();});
		 });
	},
	getTemplateData: function (callbak) {
        sdpAjax({
            url: "/api/v3/purchase_orders/_links", // No I18N
            success: function (response) {
                var links = {};

                response._links.forEach(function (link) {
                    links[link.name] = link;
                });

                links.data = sdp_user.CLIENT_CONF["purchase_list"] || {}; // No I18N
                //links.canUpdateState = sdp_user.ROLES.indexOf("SDAdmin") > -1;

                callbak(links);
            }
        });
    },
	advFilterSettingsCB : function(){
        return {
            "options":{ // No I18N
                "metainfo_entity" : "purchase_orders", // No I18N
                "allowReadOnly" : true, // No I18N
                "haveOtherUDF" : true, // No I18N
                "setNullSiteDef" : true, // No I18N
				"fieldTypeConditions": { // No I18N
                    "custom_po_id": ["is", "is_not", "contains", "not_contains","starts_with","ends_with"], //No I18N
					"name": ["is", "is_not", "contains", "not_contains","starts_with","ends_with"], //No I18N
                },
				"serialize" : function(data,type) { // No I18N
				if(type == 'get' && (data.field == 'created_date' || data.field == 'required_date') && (data.value != null || data.values != null)) {
					// in server side we are storing end time of the date, so changing the date format here
					var endtime = new Date(parseInt(data.values[0]));
					endtime.setHours(23,59,59);
					data.values=[new Date(endtime).valueOf()]
				}
				return data;
            }
            }
        }
    },
    initList: function (promise) {
		var componentName = "webc-purchaseList"; // No I18N
		delete WebComponents.instancePool[componentName];
	    WebComponents.render(componentName);
        $purchaseList.table_comp_purchase = WebComponents.getInstance(componentName);
    },
	constructOwner : function(table_data){
        var rd = table_data.row_data;
        if( rd.owner ){
            return e_html(rd.owner.name);
        }
	},
	construct_edit_icon:function(table_data){
      var rowData=table_data.row_data;
      var paramArr=[rowData.id];
      var col_str='<button id="purchase_order_'+rowData.id+'" class="btn btn-link btn-xs clickaction pt5" type="button" title="'+translate("common.edit")+'" data-event="click" data-handler="javascript:editPurchaseOrder('+paramArr+');" nonce="'+sdpNonce+'"><span aria-hidden="true" class="cspr icon-md edit-modern1 flat"></span></button>';
	  $sdEventListener('#purchase_order_'+rowData.id); // NO I18N
      return col_str;
	},
	callbackInitialRender : function(viewMode) {
        if(!$purchaseList.filterList_obj){
            $purchaseList.filterList_obj = new filterListComp();
        }
    },
	 filterDropdownClick : function (){
        $purchaseList.filterList_obj.initComponent({
                   element : "#ListViewFilterMenuPO",  // No I18N
                   module : "purchase_order",  // No I18N
                   personalize_key : "purchase_order_filter_views",// No I18N
                   filter_action : "$purchaseList.switchFilterView", //No I18N
                   isTrashEnabled: false,
                   favoritable : true,
                   custom_filters : false,
                   skipPersonalization : true
               });
    },
	headerDataConstruct : function(){
        var _self = this;
        var header = {
            "purchase_orders_head_chk": { //No i18N
                "column_settings": { //No I18N
                    "position": 1 //No I18N
                },
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "type": "checkbox", //No i18N
                "dataCelltransformer": _self.constructChkboxCell // No I18N
            },

            "name": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
					"position": 2, //No I18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": _self.constructLink //No i18N
            },
			"base_total_price" : { //No i18N
				"text": getMessageForKey("sdp.common.totalcost") +'('+sdp_app.CURRENCY_SYMBOL+')' // No I18N
			},
			"custom_po_id": { //No i18N
                "isHidden": true, //No i18N
			}
        };

		if(!_self.checkbox){
            delete header.purchase_orders_head_chk;
        }

        return header;
    },
	constructChkboxCell : function(table_data){
        var rd = table_data.row_data;
        var rtl_style = ""; // No I18N
        if(sdp_user.DIRECTION=="RTL"){ // No I18N
            rtl_style = "right : 10px;"; // No I18N
        }
        else{
            rtl_style = "left : 10px;"; // No I18N
        }
        return "<input type='checkbox' name='checkbox' value=" + rd.id + " data-table-checkbox style='position: absolute; top: 22px;'"+ rtl_style+">"; //No I18N
    },
	setHeight : function() {
		var height;
        var listview_height =110;
		var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
		return height-15;
	},
	setWidth : function() {
		 var width = jQ("#Right-Section").outerWidth(); // No I18N
		 return width - 2;
	},
	rowDataConstruct : function(table_info){
        var inputObject = {};
		var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
		fields_required_arr.push("custom_po_id");
		table_info.list_info.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
		if($purchaseList.isGlobalSearch){
			inputObject.list_info.gsearch=$purchaseList.gsearch;
		}
        return inputObject;
	},
	row_inputdata:function(table_info){
         var list_info = table_info.list_info;
         var get_input_data = $purchaseList.input_data;
         if(get_input_data){
            if(get_input_data.search_criteria){
              list_info.search_criteria = get_input_data.search_criteria;
            }
         }
         return {"list_info" : list_info};//NO I18N
       },
	switchFilterView : function(viewId,viewName,messageKey){
        var _self = this;

            var current_view = {};
            if(sdp_user.CLIENT_CONF.purchase_order_currentview){
                current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_order_currentview);
            }
			if(viewId != null) {
				current_view.filter_by = { "id": viewId};// No I18N
			}
			if(viewId == null && viewName != null) {
				current_view.filter_by = { "name": viewName};// No I18N
			}
            addPersonalization("purchase_order_currentview", current_view); // No I18N
            if($purchaseList.search_text){
                jQ("#subheader_search_box").val(""); // No I18N
                jQ('[data-spa-page="purchases-list"]').trigger("click");// No I18N
                return false;
            }
			if(viewId != null) {
				sdpAjax({
					url: '/api/v3/list_view_filters/'+viewId, // No I18N
					success: function(resp) {
						$purchaseList.filter_view_internal_name = resp.list_view_filter.name;
						$purchaseList.filter_view_display_name = resp.list_view_filter.display_name;
					},
					async: false
				});
			}
            var table_info = $purchaseList.table_comp_purchase.t_obj.table_info;
			if(viewId != null) {
				$purchaseList.table_comp_purchase.t_obj.table_info.list_info.filter_by = { "id": viewId}; //No i18n
			}
			if(viewId == null && viewName != null) {
				$purchaseList.table_comp_purchase.t_obj.table_info.list_info.filter_by = { "name": viewName}; //No i18n
				viewName = getMessageForKey(messageKey);
			}
            $purchaseList.table_comp_purchase.t_obj.table_info.list_info.start_index = 1;


                $purchaseList.table_comp_purchase.changeFilterString("clearOnly");// No I18N

                $purchaseList.table_comp_purchase.refreshTable("refresh");// No I18N



        jQuery('#purchase_orders_filters').text(viewName);// No I18N
        jQuery('#po_listview_btn').attr("title",viewName);// No I18N
    },
	switchPurchaseView : function(view_mode) {
        var current_view = {};
		//var data ={};
        if(sdp_user.CLIENT_CONF.purchase_order_currentview){
            current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_order_currentview);
        }
        var viewMode;
        if(view_mode == "classic"){ // No I18N
            $purchaseList.viewMode = 'classic'; // No I18N
            viewMode = "linear"; // No I18N
            current_view.view = 'classic'; // No I18N
        }
        else if(view_mode == "table"){ // No I18N
            $purchaseList.viewMode = 'table'; // No I18N
            viewMode = "table"; // No I18N
            current_view.view = 'table'; // No I18N
        }

        addPersonalization("purchase_order_currentview",current_view); // No I18N
        //pass view as kanban to settemplate for a classic view
        current_view.view = (current_view.view == "classic") ? "kanban" : current_view.view; // No I18N

		 this.getTemplateData(function (data) {
			data.view = current_view.view;
			data.viewMode=viewMode;
			$purchaseList.setTemplate(data);
			$purchaseList.initList(true);
		 });
    },
	tableEntityInfo : function(personalize_key){
        var table_info = getPersonalizeData(personalize_key);
        var filter_by;
		var _self=this;
		var homePageFilter = _self.homePageFilter;
            var current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_order_currentview);
		var filterNameKey = {
			"PendingApproval" : "sdp.workorder.wotopo.filter.option3",
			"Approved" : "sdp.workorder.wotopo.filter.option8",
			"Rejected" : "sdp.puchase.POListAct.select3",
			"Ordered" : "sdp.purchase.listview.orderedpos",
			"PartiallyReceived" : "sdp.puchase.POListAct.select4",
			"Received" : "sdp.purchase.listview.recievedpos",
			"InvoiceReceived" : "sdp.purchase.listview.invoiceRecievedpos",
			"PaymentDone" : "sdp.purchase.listview.paymentDOnepos",
			"Closed" : "sdp.puchase.POListAct.select5"
		};
			if(current_view && current_view.filter_by && current_view.filter_by.name != null){
                filter_by = current_view.filter_by;
				_self.filter_view_display_name = getMessageForKey(filterNameKey[current_view.filter_by.name]);
				//_self.filter_view_display_name = current_view.filter_by.display_name;
            }
			if(homePageFilter != null && homePageFilter != 'null')
			{
				if(homePageFilter === "OverduePOs") {
					current_view.filter_by= {"name" : "Overdue" }; //NO I18N
					_self.filter_view_display_name=getMessageForKey("sdp.puchase.POListAct.select6");
				}
				else if(homePageFilter === "PODueFor7days") {
					current_view.filter_by= {"name" : homePageFilter }; //NO I18N
					_self.filter_view_display_name=getMessageForKey("sdp.puchase.POListAct.select7");
				}
				else if(homePageFilter === "PODueFor30days") {
					current_view.filter_by= {"name" : homePageFilter }; //NO I18N
					_self.filter_view_display_name=getMessageForKey("sdp.puchase.POListAct.select8");
				}

				filter_by = current_view.filter_by;
				addPersonalization("purchase_order_currentview", current_view); // No I18N
			}

            if(current_view && current_view.filter_by && current_view.filter_by.id){
                filter_by = current_view.filter_by;
            }
			if(_self.filter_view_display_name){
            jQ('#purchase_orders_filters').text(_self.filter_view_display_name);// No I18N
            jQ('#po_listview_btn').attr("title",_self.filter_view_display_name);// No I18N
        }
		if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            var t_info;
            var listInfo = {
                start_index : 1,
                row_count : 10,
                get_total_count :"true" // No I18N
            };
                t_info = {
                    "list_info": listInfo, //No i18N
                    "fields_required" : {"custom_po_id":"","name":"","required_date":"","created_date":"","vendor":"","status":"","owner":"","base_total_price":""},// No I18N
                    "column_order" : ["custom_po_id","name","required_date","created_date","vendor","status","owner","base_total_price"] // No I18N
                };
			table_info = t_info;
		}
		 table_info.list_info.filter_by = filter_by;
		 return table_info;
	},
	tableCompOptions : function(){
         var _self = this,
		 options = {};
            options = {
                "column_settings": { //No i18N
                    "default_position": 2, //No i18N
                    "assign_content_width": false, //No i18N
                    "assign_label_width": false, //No i18N
                    "columns": [{ //No i18N
                            "size": 1, //No i18N
                            "row_count": 1, //No i18N
							"width": '40px'//No i18N
                        },
                        {
                            "size": 11, //No i18N
                            "row_count": 1, //No i18N
                            "default_position": 2, //No i18N
                            "pipe_separation": true //No i18N
                        }
                    ]
                },
				must_included_fields : ["custom_po_id"],
                default_sort_field : {"sort_field" : "id","sort_order" : "desc"},//No i18N
				bulkSelectionSetting: {
					constructSelectedListCB: function(data){
						return '<span rel="uitip" mode_ellipsis=true title="#'+ZSEC.Encoder.encodeForHTMLAttribute(data.custom_po_id)+" "+ZSEC.Encoder.encodeForHTMLAttribute(data.name)+'">&nbsp;#'+ZSEC.Encoder.encodeForHTML(data.custom_po_id)+' <span class="vmiddle">'+ ZSEC.Encoder.encodeForHTML(data.name) +'</span></span>';
					},
					selectionCallback: function() {
						jQuery("#filter_icon").addClass("hide");
					},
					unSelectionCallback: function() {
						if(WebComponents.instancePool["webc-purchaseList"].bulkSelect.getSelectedIDs().length == 0){
							jQuery("#filter_icon").removeClass("hide");
						}
					}
			    }
            }
		return options;
	},
	exportListView : function(format) {
		var fields_required_arr = Object.keys($purchaseList.table_comp_purchase.t_obj.table_info.fields_required);
		var list_info = $purchaseList.table_comp_purchase.t_obj.table_info.list_info;
		list_info.fields_required = fields_required_arr;
		delete list_info.has_more_rows;
		delete list_info.end_index;
		delete list_info.total_count;
		delete list_info.sort_valuepath;
		var input_data = {
            "export": { //No I18N
                "format": format, //No I18N
				"title" : getMessageForKey("sdp.purchase.addNew.item.home") //No I18N
            },
			"list_info": list_info, //No I18N
        }
        try {
            var link = document.createElement("a");
            var fileType = format.toLowerCase();
			fileType = (isFileProtectionRequired && isFileProtectionRequired=="true")?"zip":fileType;//No I18N
            link.download = (Date.now()) + "."+fileType;
            link.href = "/api/v3/purchase_orders/export?" + sdpAjaxInputData(input_data);
            link.click();
        } catch (e) {

        }
	},
	adjustPOTableHeight : function(){
        var tableclass = jQuery("#purchase_orders_div");
        var paddingRight = window.externalframe ? 0 : 10;
        var paddingBottom = window.externalframe ? 0 : 20;
        var td_c_h = 0;
        if(jQuery('#header-placeholder').length == 0) {
            // SD-103955
            td_c_h = jQuery(window).height() - jQuery('#top-header').height() - paddingBottom ;  //No I18N
        } else {
            td_c_h = jQuery(window).height() - jQuery('#header-placeholder').height() - paddingBottom ;  //No I18N
        }
        if ( jQuery( 'body' ).css( 'direction' ) == 'rtl'){
            var right = (jQuery(window).width() + jQuery(window).scrollLeft()) - (jQuery('#new-pr').offset().left + jQuery('#new-pr').outerWidth(true));
            var table_w = jQuery(window).width()-right;
        } else if(jQuery('#new-pr').length){
            var table_w = jQuery(window).width()-jQuery('#new-pr').offset().left;
        }
       // tableclass.css({'width': ( table_w - paddingRight ) + 'px'});   //No I18N
        setTimeout(function() {
            var viewhgt = 0;
            if(jQuery("#purchase-list-sidebar #task-navigation-view").length == 1) {
                viewhgt = 34;
            }
            /** Reset the chat bar height in the External Frame features */
            window.externalframe ? is_chathgt = 0 : "";
            var cvtask=jQuery("#purchase-list-sidebar > .cv-task-bg").length > 0 ? jQuery("#purchase-list-sidebar > .cv-task-bg").outerHeight(true, true) : 0 ;
            //The above line added to avoid NaN issue
            var tskHeight = td_c_h - jQuery("#purchase-list-sidebar > .listcontrols").outerHeight(true, true) - cvtask - viewhgt - is_chathgt;
            var reqHeight = td_c_h - jQuery("#listcontrols").outerHeight(true, true) - is_chathgt + 4;
            jQuery(document).find('#taskview-sidebar-list').css({'max-height':tskHeight+'px', 'height':tskHeight+'px'}); //NO I18N
            tableclass.css({'max-height':reqHeight+'px', 'height':reqHeight+'px','width': ( table_w - paddingRight ) + 'px'});   //No I18N
        }, 500);
    }
};

var $prList = {
	init: function (module) {
        var _self = this;
		_self.module = module;
        this.getTemplateData(function (data) {
            var promise = true;

			if(module === 'purchase_request') {
				if(sdp_user.ROLES.indexOf("CreatePR") === -1) {
					jQuery('#NewPRReq').remove();
					jQuery('#edit_pr').remove();
				}
			var current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_request_currentview);
			var filterNameKey = {
				"PendingApproval" : "sdp.purchase.request.pending.approval",
				"Approved" : "sdp.purchase.request.approved", //No I18N
				"Rejected" : "sdp.purchase.request.rejected", //No I18N
				"Closed" : "sdp.purchase.request.closedprs"
			};
			if(current_view){
				if(current_view.filter_by && current_view.filter_by.name != null) {
						_self.filter_view_display_name = getMessageForKey(filterNameKey[current_view.filter_by.name]);
						_self.filter_view_internal_name = current_view.filter_by.name;
					}
				else if(current_view.filter_by && current_view.filter_by.id){
					var filter_id = current_view.filter_by.id;
					sdpAjax({
						url: '/api/v3/list_view_filters/'+filter_id, // No I18N
						success: function(resp) {
							_self.filter_view_display_name = resp.list_view_filter.display_name;
							_self.filter_view_internal_name = resp.list_view_filter.name;
						},
						async: false
					});
				}
			}

		  _self.personalize_key = "prview_sidebar"; // No I18N

		  personalizeObj = _self.loadPOViewPersonalization(_self.personalize_key);

		  if(personalizeObj == null || (personalizeObj!= null && personalizeObj.list_info.fields_required === undefined)){
		   _self.listInputData = {"list_info": {"fields_required":["id","title","status","comments","technician","requested_by","requested_date","due_date","created_date"],"get_total_count": true,"row_count": "25","start_index": "1","end_index": "25","sort_field": "id","sort_order": "A"}};//NO I18N

		   var poViewColumnIndex = ["requested_by","technician","due_date","status","created_date"], //NO I18N
		          poViewColumnShow = {
					  "requested_by" : true, //No I18N
					  "technician" : true, //No I18N
					  "due_date" : true, //No I18N
					  "status" : true, //No I18N
					  "created_date" : true}; //No I18N
		   _self.listInputData.poViewColumnIndex = poViewColumnIndex;
		   _self.listInputData.poViewColumnShow  = poViewColumnShow;

			}
			if(current_view.filter_by != undefined) {
			   _self.listInputData.list_info.filter_by ={"name" : _self.filter_view_internal_name}; // No I18N
			   jQ('#taskfiltername').text(_self.filter_view_display_name);// No I18N
			   jQ('#pr_listview_btn').attr("title",_self.filter_view_display_name);// No I18N
		   }
					jQuery("#c_sortlist li").on('click',function(){
					  _self.poViewSortBy(jQuery(this).attr('data-value'));
				    });
				    _self.changeSortClass(_self.listInputData.list_info.sort_order);

				    if(_self.listInputData.list_info.sort_field == undefined){
				    	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_id').html()+"<i></i>").fadeIn(600);
			        }else{
			        	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_'+_self.listInputData.list_info.sort_field.split('.')[0]).html()+"<i></i>").fadeIn(600);
			        }
			}
			else {
				if(sdp_user.ROLES.indexOf("CreatePurchaseOrder") === -1) {
					jQuery('#NewPO').remove();
				}
				var filterNameKey = {
					"PendingApproval" : "sdp.workorder.wotopo.filter.option3",
					"Approved" : "sdp.workorder.wotopo.filter.option8",
					"Rejected" : "sdp.puchase.POListAct.select3",
					"Ordered" : "sdp.purchase.listview.orderedpos",
					"PartiallyReceived" : "sdp.puchase.POListAct.select4",
					"Received" : "sdp.purchase.listview.recievedpos",
					"InvoiceReceived" : "sdp.purchase.listview.invoiceRecievedpos",
					"PaymentDone" : "sdp.purchase.listview.paymentDOnepos",
					"Closed" : "sdp.puchase.POListAct.select5",
					"Overdue" : "sdp.puchase.POListAct.select6",
					"PODueFor7days" : "sdp.puchase.POListAct.select7",
					"PODueFor30days" : "sdp.puchase.POListAct.select8"
				};
				var current_view = Object.assign({}, sdp_user.CLIENT_CONF.purchase_order_currentview);
				if(current_view){
					if(current_view.filter_by && current_view.filter_by.name != null) {
						_self.filter_view_display_name = getMessageForKey(filterNameKey[current_view.filter_by.name]);
						_self.filter_view_internal_name = current_view.filter_by.name;
					}
					else if(current_view.filter_by && current_view.filter_by.id){
						var filter_id = current_view.filter_by.id;
						sdpAjax({
							url: '/api/v3/list_view_filters/'+filter_id, // No I18N
							success: function(resp) {
								_self.filter_view_display_name = resp.list_view_filter.display_name;
								_self.filter_view_internal_name = resp.list_view_filter.name;
							},
							async: false
						});
					}
				}
				_self.personalize_key = "poview_sidebar"; // No I18N

				personalizeObj = _self.loadPOViewPersonalization(_self.personalize_key);
				if(personalizeObj == null || (personalizeObj!= null && personalizeObj.list_info.fields_required === undefined)){
				_self.listInputData = {"list_info": {"fields_required":["id","custom_po_id","name","status","owner","comments","requested_by","required_date","created_date"],"get_total_count": true,"row_count": "25","start_index": "1","end_index": "25","sort_field": "custom_po_id","sort_order": "A"}};//NO I18N

				var poViewColumnIndex = ["requested_by","owner","required_date","status","created_date"], //NO I18N
		          poViewColumnShow = {
					  "requested_by" : true, //No I18N
					  "owner" : true, //No I18N
					  "required_date" : true, //No I18N
					  "status" : true, //No I18N
					  "created_date" : true	 }; //No I18N
		   _self.listInputData.poViewColumnIndex = poViewColumnIndex;
		   _self.listInputData.poViewColumnShow  = poViewColumnShow;
			}

				if(current_view.filter_by != undefined) {
					_self.listInputData.list_info.filter_by ={"name" : _self.filter_view_internal_name}; // No I18N
					jQ('#taskfiltername').text(_self.filter_view_display_name);// No I18N
					jQ('#pr_listview_btn').attr("title",_self.filter_view_display_name);// No I18N
				}
			}

			_self.setTemplate(module);
           _self.fetchPOList(module);

				    jQuery("#c_sortlist li").on('click',function(){
					  _self.poViewSortBy(jQuery(this).attr('data-value'));
				    });
				    _self.changeSortClass(_self.listInputData.list_info.sort_order);

				    if(_self.listInputData.list_info.sort_field == undefined){
				    	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_custom_po_id').html()+"<i></i>").fadeIn(600);
			        }else{
			        	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_'+_self.listInputData.list_info.sort_field.split('.')[0]).html()+"<i></i>").fadeIn(600);
			        }
        });

    	clearTimeout(_self.resizetimer);
	   _self.resizetimer = setTimeout(function() {
    	var isChatBar = '';
    	if (jQuery('#sdp-chat-bar').length ){
    		isChatBar = jQuery('#sdp-chat-bar').outerHeight();
    	}else{
    		isChatBar = 0;
    	}
	        var PRLeftHeight = jQuery(window).height() - jQuery('#taskview-sidebar-list').offset().top - isChatBar - 10 ;
    		jQuery('#taskview-sidebar-list').height(PRLeftHeight);
        },400);

    },
	changeSortClass : function(sortOrder)
	{
		var th = jQuery('#taskview-sortby').find('> span').removeClass();
		if(sortOrder == "desc"){
			th.addClass('cspr asc icon-sm').end().attr('title',translate('common.sortasc')); //NO I18N
		}
		else{
			th.addClass('cspr desc1 icon-sm').end().attr('title',translate('common.sortdesc')); //NO I18N
		}
	},
	getTemplateData: function (callbak) {
		var _self = this;
        sdpAjax({
            url: "/api/v3/"+_self.module+"s/_links", // No I18N
            success: function (response) {
                var links = {};

                response._links.forEach(function (link) {
                    links[link.name] = link;
                });

                links.data = sdp_user.CLIENT_CONF["pr_list"] || {}; // No I18N
				 callbak(links);
            }
        });
    },
	setTemplate : function(module){
		var _self = this;
		if(!$prList.filterList_obj){
            $prList.filterList_obj = new filterListComp();
        }
		var li_inf = _self.listInputData;
			jQuery("#btn_taskcol_chooser").show();
			jQuery('#btn_taskcol_chooser').off('click').on('click',function(){ //NO I18N
				 _self.loadColumnList("prview-columnlist",li_inf.poViewColumnIndex,li_inf.poViewColumnShow); //NO I18N
		    });
	},
	filterDropdownClick : function (){
		var _self = this;
        $prList.filterList_obj.initComponent({
				element : "#ListViewFilterMenu",  // No I18N
                   module : _self.module,
                   personalize_key : _self.module+"_filter_views",// No I18N
                   filter_action : "$prList.switchFilterView", //No I18N
                   isTrashEnabled: false,
                   favoritable : true,
                   custom_filters : false,
                   skipPersonalization : true
               });
	},
	rowdataConstruct : function(table_info){
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        return inputObject;
	},
	row_inputdata:function(table_info){
         var list_info = table_info.list_info;
         var get_input_data = $purchaseList.input_data;
         if(get_input_data){
            if(get_input_data.search_criteria){
              list_info.search_criteria = get_input_data.search_criteria;
            }
         }
         return {"list_info" : list_info};//NO I18N
       },
	switchFilterView : function(viewId,viewName,messageKey){
        var _self = this;

            var current_view = {};
			loadPRDetailsandList = true;
			loadPODetailsandList = true;
            if(sdp_user.CLIENT_CONF.pr_currentview){
                current_view = Object.assign({}, sdp_user.CLIENT_CONF[_self.module+"_currentview"]);
            }
			if(viewId != null) {
				current_view.filter_by = { "id": viewId};// No I18N
			}
			if(viewId == null && viewName != null) {
				current_view.filter_by = { "name": viewName};// No I18N
			}
            addPersonalization(_self.module+"_currentview", current_view); // No I18N
            if($prList.search_text){
                jQ("#subheader_search_box").val(""); // No I18N
                jQ('[data-spa-page="pr-list"]').trigger("click");// No I18N
                return false;
            }
			if(viewId != null) {
				sdpAjax({
					url: '/api/v3/list_view_filters/'+viewId, // No I18N
					success: function(resp) {
						$prList.filter_view_internal_name = resp.list_view_filter.name;
						$prList.filter_view_display_name = resp.list_view_filter.display_name;
					},
					async: false
				});
			 _self.listInputData.list_info.filter_by = { "id": viewId};// No I18N
			}
			if(viewId == null && viewName != null) {
				 _self.listInputData.list_info.filter_by = { "name": viewName};// No I18N
				 viewName = getMessageForKey(messageKey);
			}

		 _self.refreshSideBarView();



        jQ('#taskfiltername').text(viewName);// No I18N
        jQ('#pr_listview_btn').attr("title",viewName);// No I18N
    },
	newPurchaseRequest : function() {
		newPurchaseRequest();
	},
	fetchPOList : function (module)
	{
		var _self = this;
		if(module === 'purchase_order' && sdp_user.ROLES.indexOf("ViewPurchaseOrder") === -1) {
			jQuery("#switchtopr").hide();
			return false;
		}
		else if(module === 'purchase_request' && sdp_user.ROLES.indexOf("ViewPurchaseOrder") === -1) {
			jQuery("#switch-panel").hide();
		}
		 jQuery("#purchase_search").show();
		 jQuery("#task-navigation-view").show();


		var module = module+"s"; //No I18N
		//var list_data = { "list_info": { "row_count": "10", "get_total_count": true } }; //NO I18N
		var input_data = sdpAjaxInputData(_self.inputToListAPI());
		sdpAjax({
			url : "/api/v3/"+module+"?"+input_data, //NO I18N
		    success : function(data){
		    	var li_inf = _self.listInputData;
		    	var retain_r_count = li_inf.list_info.row_count;
		    	var retain_filter = li_inf.list_info.filter;
		    	li_inf.list_info = data.list_info;
		    	li_inf.list_info.row_count = retain_r_count;
		    	li_inf.list_info.filter = retain_filter;
		    	data.poViewColumnIndex  = li_inf.poViewColumnIndex;

		    	if(data[module].length > 0){
					jQuery('#task_add_new').addClass('hide');
					jQuery('#task_add_new1').removeClass('hide');
				} else {
					jQuery('#task_add_new').removeClass('hide');
					jQuery('#task_add_new1').addClass('hide');
				}
				if(module === 'purchase_orders') {
                    renderhbs("#taskview-sidebar-list","po-summary-listview-template",data,false,"purchase");//NO I18N
				// fetch first po for details page
				if ( loadPODetailsandList )
				{
				loadPODetailsandList = false ;
					if ( data[module].length > 0 && data[module][0].id != undefined )
					{
						viewPurchaseOrder( data[module][0].id,null,true,true);
					}
					else
					{
						jQuery( document.getElementsByClassName('details-div') ).html('<div class="font14px"><p align="center" class="p20"> '+ getMessageForKey('sdp.requests.listview.nopurchaseordermessage') +'</p></div>')
					}

				}
					if(sdp_user.ROLES.indexOf("ModifyPurchaseOrder") === -1) {
						jQuery("[id^='edit_po']").remove();
					}
					if(sdp_user.ROLES.indexOf("DeletePurchaseOrder") === -1) {
						jQuery("[id^='delete_po']").remove();
					}
				}

				else {
				renderhbs("#taskview-sidebar-list","pr-summary-listview-template",data,false,"purchase");//NO I18N
				// fetch first pr for details page
				if ( loadPRDetailsandList )
				{
				loadPRDetailsandList = false ;
					if ( data[module].length > 0 && data[module][0].id != undefined )
					{
						showPRDetails( data[module][0].id );
					}
					else
					{
						jQuery( document.getElementsByClassName('details-div') ).html('<div class="font14px"><p align="center" class="p20">' + getMessageForKey('sdp.purchase.request.history.noprmessage') +'</p></div>');
					}
				}
					if(sdp_user.ROLES.indexOf("ModifyPR") === -1) {
						jQuery("[id^='edit_pr']").remove();
					}
					if(sdp_user.ROLES.indexOf("DeletePR") === -1) {
						jQuery("[id^='delete_pr']").remove();
					}
				}

				jQuery("ul#navPageLength li").on('click',function(){
					  var row_count = jQuery(this).attr("data-value");
					  jQuery("#f_row_count").text(row_count);
					  jQuery('ul#navPageLength li').removeClass();
					  jQuery('ul#navPageLength li[data-value="' + row_count + '"]').addClass('active');
					  _self.listInputData.list_info.start_index='1';
					  _self.listInputData.list_info.row_count = row_count;
					  _self.listInputData.list_info.get_total_count = true;
					  _self.refreshSideBarView();
					  _self.savePOViewPersonalization();
				});
				_self.setPOViewNavigations();
		        jQuery('.task-sort-by').show();

		    	initTooltip('#purchase-list-sidebar'); //NO I18N
		    	jQuery("#task_widget").removeClass('hide');
		    	jQuery("#combined-task-view").show();
		    	show_bs_menu();
		    }
		});
	},
	inputToListAPI : function(){
        var list_info = {};
        var inObj = {};
		var _self = this;
        var t_li = _self.listInputData.list_info;
        if (t_li.row_count) {
            list_info.row_count = t_li.row_count;
            list_info.start_index = t_li.start_index;
        }
        if (t_li.get_total_count) {
            list_info.get_total_count = t_li.get_total_count;
        }
        if (!jQuery.isEmptyObject(t_li.search_criteria)) {
            list_info.search_criteria = t_li.search_criteria;
        }
        var sort_order = t_li.sort_order;
        var sort_field = "";
        if (sort_order !== null && sort_order !== undefined) {
            list_info.sort_field = t_li.sort_field;
            list_info.sort_order = sort_order;
        }
        //list_info.tasks = {};
        if (!jQuery.isEmptyObject(t_li.filter_by)) {
            list_info.filter_by = t_li.filter_by;
          }
        inObj.list_info = list_info;
        inObj.list_info.fields_required = _self.listInputData.list_info.fields_required;
        return inObj;
	},

	loadColumnList : function(eleToBind, colsJSON, colToShow)
	{
	  var input = {};
	  var _self = this;
	  	  input.columns = colsJSON;
	  	  input.colToShow = colToShow;
	  if(is_ie){
		  renderhbs("#"+eleToBind[0],"po-summary-listview-template",input);//NO I18N
	  }else{
		  renderhbs("#"+eleToBind,"po-summary-listview-template",input);//NO I18N
	  }

	   jQuery('#'+eleToBind).sortable({
	       placeholder: "ui-state-highlight",  //No I18N
	       handle: '.ctl i',   //No I18N
	       start: function(e, ui){
	           ui.placeholder.height(ui.item.height());
	       },
	       stop: function(e,ui){
	           var c_ele_checked = jQuery(ui.item).find('.t_colcheckbox').prop('checked') ? true : false;  //No I18N
	           var p_ele_checked = jQuery(ui.item).prev().find('.t_colcheckbox').prop('checked') ? true : false;  //No I18N
	           var n_ele_checked = jQuery(ui.item).next().find('.t_colcheckbox').prop('checked') ? true : false;  //No I18N
	           setTimeout(function(){
		           if((c_ele_checked !== p_ele_checked && c_ele_checked !== n_ele_checked) || (c_ele_checked == false && c_ele_checked !== n_ele_checked)){
		        	   jQuery(ui.item).find('.t_colcheckbox').prop('checked',!c_ele_checked); // No I18N
		           }
	           },1);
			   
	       },
	       scrollSpeed : 10
	   });
	   jQuery('.t_colcheckbox').on('change', function(e) { // No I18N
		   _self.reOrderTaskColChooser(eleToBind,this);
	   });
	},

	reOrderTaskColChooser : function(eleToBind,chk_ele) {
	    var curr_ele = jQuery(chk_ele).closest('li'); // No I18N
	    var par_ele = jQuery("#"+eleToBind);
	    var c_len =  par_ele.find(".t_colcheckbox:checked").length;
	    var li_index = curr_ele.index();
	    if (jQuery(chk_ele).is(':checked')) {
	        if (c_len === 1) {
	        	par_ele.prepend(curr_ele);
	        } else {
	        	par_ele.find("li").eq(c_len - 2).after(curr_ele);
	        }
	    } else {
	        if (c_len > 0 && li_index !== c_len) {
	        	par_ele.find("li").eq(c_len).after(curr_ele);
	        }
	    }
	},
	saveColumnConfig : function(ele)
	{
	  var indexMap = {};
	  var showMap  = {};
	  var _self = this;

	  jQuery('#'+ele+'>li').each(function(indx){
	    jQuery(this).attr("index",indx);
	    indexMap[indx] = jQuery(this).attr("columnname");
	    showMap[jQuery(this).attr("columnname")] = jQuery(this).find("input").is(":checked");                                                                                                           //NO I18N
	  });
	   var fields_required = [];
	   jQuery("#prview-columnlist input[type='checkbox']:checked").each(function() {
		   fields_required.push(jQuery(this).val());
      });
	  if(_self.module == 'purchase_order') {
	   fields_required.push('id');
	   fields_required.push('custom_po_id');
	   fields_required.push('name');
	  }
	  else {
		fields_required.push('id');
		fields_required.push('title');
	  }
      _self.listInputData.fields_required = fields_required;
	  _self.listInputData.poViewColumnIndex = indexMap;
	  _self.listInputData.poViewColumnShow  = showMap;

	  _self.savePOViewPersonalization();
	  _self.refreshSideBarView();
	},
	
	refreshSideBarView : function()
	{
	  var _self = this;
	  
	  jQuery('.task-refresh').closest('div').find('.btn,.btn-group').hide().end().find('.task-loading').show();                                                                                                                                //NO I18N
	  setTimeout(function(){
	     jQuery('.task-loading').hide().closest('div').find('.btn,.btn-group').show();                                                                                                                         //NO I18N
	  },500);
	  _self.fetchPOList(_self.module);
	},
	
	poViewSortBy : function(column)
	{
	 var _self = this;
	  if(column == null){
		  _self.listInputData.list_info.sort_order = (_self.listInputData.list_info.sort_order == 'asc') ? 'desc' : 'asc';   //NO I18N
		  if(_self.module == 'purchase_order') {
			_self.listInputData.list_info.sort_field = (_self.listInputData.list_info.sort_field == undefined) ? 'custom_po_id' : _self.listInputData.list_info.sort_field;   //NO I18N
		   }
		   else {
			_self.listInputData.list_info.sort_field = (_self.listInputData.list_info.sort_field == undefined) ? 'id' : _self.listInputData.list_info.sort_field;   //NO I18N
		   }
		  _self.changeSortClass(_self.listInputData.list_info.sort_order);
	  }else{
		  _self.listInputData.list_info.sort_field = column;
		  _self.listInputData.list_info.sort_order = (_self.listInputData.list_info.sort_order == undefined) ? 'asc' : _self.listInputData.list_info.sort_order;   //NO I18N
	  }
	  var sortfield = _self.listInputData.list_info.sort_field;
	  if(sortfield == 'technician' || sortfield == 'requested_by' || sortfield == 'status' || sortfield == 'owner') {
		_self.listInputData.list_info.sort_field = sortfield+".name"; // No I18N
	  }
	  _self.savePOViewPersonalization();
	  _self.refreshSideBarView();
	  jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_'+_self.listInputData.list_info.sort_field.split('.')[0]).html()+"<i></i>").fadeIn(600);
	},
	getSearch : function() 
	{
		jQuery('#PR_sidebarSearchContainer').toggle();
		if(jQuery('#PR_sidebarSearchContainer').hasClass('hide')){
			jQuery('#PR_sidebarSearchContainer').removeClass('hide');
			jQuery('#PR_sidebarSearch').trigger('focus');
		}else{
			jQuery('#PR_sidebarSearchContainer').addClass('hide');
		}
		var isChatBar = '';
    	if (jQuery('#sdp-chat-bar').length ){
    		isChatBar = jQuery('#sdp-chat-bar').outerHeight();
    	}else{
    		isChatBar = 0;
    	}
        setTimeout(function(){
	        var PRLeftHeight = jQuery(window).height() - jQuery('#taskview-sidebar-list').offset().top - isChatBar - 50 ;
    		jQuery('#taskview-sidebar-list').height(PRLeftHeight);
        },200);
	},
	searchPR : function(ele)
	{
		if(event.key === 'Enter') 
		{
			var input = ele.value.trim();
			if(input !== undefined) {
			var _self = this;
			_self.fromSearch = true;
			_self.module="purchase_request"; // No I18N
			var search_criteria=[]
			search_criteria.push({
                    "field": "title", // No I18N
                    "condition": "like", // No I18N
                    "value": input, // No I18N
                    "logical_operator": "or", // No I18N
                    "children": [{ "field": "technician.name", "value": input, "condition": "like", "logical_operator": "or" }, // No I18N
					             { "field": "requested_by.name", "value": input, "condition": "like", "logical_operator": "or" }, // No I18N
								 { "field": "id", "value": Number(input), "condition": "=", "logical_operator": "or" }, // No I18N
								 { "field": "status.name", "value": input, "condition": "like", "logical_operator": "or" }] // No I18N
                });
			_self.listInputData.list_info.search_criteria=search_criteria;
			_self.fetchPOList(_self.module);
			}
		}
	},
	searchPO : function(ele)
	{
		if(event.key === 'Enter') 
		{
			var input = ele.value.trim();
			if(input !== undefined) {
			var _self = this;
			_self.fromSearch = true;
			_self.module="purchase_order"; // No I18N
			var search_criteria=[]
			search_criteria.push({
                    "field": "custom_po_id", // No I18N
                    "condition": "like", // No I18N
                    "value": input, // No I18N
                    "logical_operator": "or", // No I18N
                    "children": [{ "field": "name", "value": input, "condition": "like", "logical_operator": "or" }, // No I18N
					             { "field": "requested_by.name", "value": input, "condition": "like", "logical_operator": "or" }, // No I18N
								 { "field": "owner.name", "value": input, "condition": "like", "logical_operator": "or" }, // No I18N
								 { "field": "status.name", "value": input, "condition": "like", "logical_operator": "or" }] // No I18N
                });
			_self.listInputData.list_info.search_criteria=search_criteria;
			_self.fetchPOList(_self.module);
			}
		}
	},
	hideShowTaskSidebar : function(ishide){
		var _self = this;
		jQuery('.task-list-wrap').toggleClass('hide-sidebar'); //NO I18N
		var request_taskcntele = jQuery("#task_countview");
		if(request_taskcntele.length > 0){
			request_taskcntele.toggleClass('hide show'); //No I18N
		}
		_self.savePOViewPersonalization();
		if(ishide === true) {
			var width = jQ("#Right-Section").outerWidth(); // No I18N
			width = width - 2;
			jQuery('#purchase_orders_div').css({width :width+'px'}); // No I18N
		}
		else {
			$purchaseList.adjustPOTableHeight();
		}
	},
	setPOViewNavigations : function()
	{
		 var _self=this;
		 var list_info = _self.listInputData.list_info;
		 var total_count = list_info.total_count? translate("common.of")+" "+ list_info.total_count : list_info.has_more_rows ? "<b>...</b>" : list_info.total_count ? translate("common.of")+" "+ list_info.total_count: list_info.start_index > 25 ? "<b>...</b>" : "" ;
		 var start_index = list_info.total_count == 0? list_info.total_count : list_info.start_index;
		 jQuery("#nav-component").find("#f_start_index").text(start_index).end()
		 		.find("#f_end_index").text((parseInt(start_index)+parseInt(jQuery("#taskview-sidebar-list").children().length)-1).toString()).end()
		 					     .find("#f_total_count").html(total_count).end()
		 					     .find("#f_row_count").text(list_info.row_count).end()
		 					     .find('ul#navPageLength li').removeClass().end()
		 					     .find('ul#navPageLength li[data-value="' + list_info.row_count + '"]').addClass('active').end()
		 					     .find("#prevPage,#nextPage").prop('disabled', false); // No I18N
		 if (parseInt(list_info.start_index) <= 1) {
			 jQuery("#prevPage").prop("disabled",true); //No I18N
		 }
		 if (list_info.has_more_rows === false) {
			 jQuery("#nextPage").prop("disabled",true); //No I18N
		 }
	},
	gotoPrevNext : function(goto_page)
	{
	var _self = this;
	  jQuery("#taskview-sidebar-list").scrollTop(0);
	  if(goto_page == "next"){
		  _self.listInputData.list_info.start_index = (parseInt(_self.listInputData.list_info.start_index) + parseInt(_self.listInputData.list_info.row_count)).toString();
	  }else{
		  _self.listInputData.list_info.start_index = (parseInt(_self.listInputData.list_info.start_index)-parseInt(_self.listInputData.list_info.row_count)).toString();
	  }
	  _self.refreshSideBarView();
	},
	loadPOViewPersonalization : function(personalize_key)
	{
	  var _self = this;
	  var dataObj = null;
	  var data = getPersonalizeData(personalize_key);
		  if(!jQuery.isEmptyObject(data)){
		        if(data.fields_required != undefined){
		            data.list_info.fields_required = data.fields_required;
		           delete data.fields_required;
		           _self.listInputData = data;
		           _self.savePOViewPersonalization();
		        }
	            dataObj = data;
		        _self.listInputData = data;
		  }
	  return dataObj;
	},
	savePOViewPersonalization : function()
	{
	var _self = this;
	  if(_self.personalize_key != undefined){
		  var data = {};
		  //var filter   = jQuery('ul#taskfilterlist').length > 0 ? jQuery('ul#taskfilterlist li.active').attr('data-value') : null;
		  var rowCount = jQuery('#f_row_count').length > 0 ? jQuery('#f_row_count').text() : null;

		  var is_hidden = jQuery('#combined-task-view').length > 0 ? jQuery('#combined-task-view').parent().hasClass('hide-sidebar') : null; // No I18N
		  if(_self.listInputData.poViewColumnShow != null){
			  data.poViewColumnShow = _self.listInputData.poViewColumnShow;
		  }
		  if(_self.listInputData.poViewColumnIndex != null){
			  data.poViewColumnIndex= _self.listInputData.poViewColumnIndex;
		  }
		  if(is_hidden !=  null){
			  data.is_hidden   = is_hidden;
		  }

		  var list_info = {};
		  /*if(_self.listInputData.list_info.filter != null){
			  list_info.filter  = _self.listInputData.list_info.filter;
		  }*/

          //row count empty string when saving personalization from loadPOViewPersonalization
          if(rowCount == "" || rowCount == undefined){
              rowCount = _self.listInputData.list_info.row_count;
          }
		  if(rowCount != null){
			  list_info.row_count   = rowCount;
			  list_info.get_total_count = true;
		  }
		  if(_self.listInputData.list_info.sort_field != undefined){
			  list_info.sort_field = _self.listInputData.list_info.sort_field;
			  list_info.sort_order = _self.listInputData.list_info.sort_order;
		  }
		  if(_self.listInputData.list_info.fields_required != null){
		  	list_info.fields_required = _self.listInputData.list_info.fields_required;
		  }
		  data.list_info = list_info;
		  addPersonalization(_self.personalize_key, data);
	  }
	}

};
