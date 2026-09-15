/* $Id$ */
var taskcombinedViewObj = (function(){
	var c_obj = {};
	var _self = this;

	c_obj.initCombinedView = function(options){
		  _self = this;
		  _self.options = options;
		  var isColumnShow = true;
		  _self.rowCount ;
		  if(options.module == "home"){
		  	isColumnShow = false;
		  	jQuery("#hideShowSideBar").hide();
		  	jQuery("#taskview-sidebar-list").siblings().hide();
		  	jQuery("#task-list-sidebar").removeClass();
		  }
		  var taskViewColumnIndex = ["priority","scheduled_start_time","status","group","owner","associated_entity","percentage_completion","created_by","type","additional_cost","estimated_effort","scheduled_end_time","actual_start_time","actual_end_time","created_time", "link"], //NO I18N
		      taskViewColumnShow = {
				  "created_by"             : false  ,                          //NO I18N
				  "percentage_completion"  : false  ,                          //NO I18N
				  "associated_entity"      : false  ,                          //NO I18N
				  "type"                   : false  ,                          //NO I18N
				  "additional_cost"        : false  ,                          //NO I18N
				  "actual_end_time"        : false  ,                          //NO I18N
				  "priority"               : isColumnShow   ,                  //NO I18N
				  "owner"                  : false  ,                          //NO I18N
				  "actual_start_time"      : false  ,                          //NO I18N
				  "estimated_effort"       : false  ,                          //NO I18N
				  "scheduled_start_time"   : true   ,                          //NO I18N
				  "scheduled_end_time"     : false  ,                          //NO I18N
				  "status"                 : false  ,                          //NO I18N
				  "group"                  : false  ,                          //NO I18N
				  "created_time"           : false  ,                          //NO I18N
				  "link"                   : false                             //NO I18N
				};
		  if(isMSPOrSCP){
			  taskViewColumnIndex.splice(5, 0, "account");//NO I18N
			  taskViewColumnShow.account=true;
		  }
		  var personalizeObj = null;
		  _self.listInputData = {};
		  if(options != undefined && options.personalize_key != undefined){
			  personalizeObj = _self.loadTaskViewPersonalization(options.personalize_key);
		  }
		  if(personalizeObj == null || (personalizeObj!= null && personalizeObj.list_info.fields_required === undefined)){
			  if(options.module == "home"){
				  _self.listInputData = {"list_info": {"get_total_count": true,"row_count": "25","start_index": "1","end_index": "25","sort_field": "scheduled_start_time","sort_order": "asc","filter_by" : {"name":"my_pending_tasks"},"fields_required":["id","title","scheduled_start_time", "description"]}};//NO I18N
			  }else{
			        _self.defaultFilter = true;
				  _self.listInputData = {"list_info": {"get_total_count": true,"row_count": "25","start_index": "1","end_index": "25","sort_field": "id","sort_order": "asc","filter_by" : {"id": jQuery("#myTaskFilterId").val()},"fields_required":["id","title","status","priority","group","owner","scheduled_start_time"]}};//NO I18N
			  }
			  if(isMSPOrSCP){
				  _self.listInputData.list_info.fields_required.push("account");//NO I18N
			  }
			  if(personalizeObj!= null && personalizeObj.list_info.fields_required === undefined){
				  _self.listInputData.list_info.filter_by = personalizeObj.list_info.filter_by;
			  }
			  _self.listInputData.taskViewColumnIndex = taskViewColumnIndex;
			  _self.listInputData.taskViewColumnShow  = taskViewColumnShow;
		  }
		  if(_self.listInputData.list_info.filter_by && _self.listInputData.list_info.filter_by.id && _self.listInputData.list_info.filter_by.id!=0){
                sdpAjax({
                    url: "/api/v3/list_view_filters/" + _self.listInputData.list_info.filter_by.id,//NO I18N
                    ignorefailuremessage: true, async: false,
                    error: function(e) {
                        delete _self.listInputData.list_info.filter_by;
                    }
                })
          }
		  var li_inf = _self.listInputData;
		  if(options != null && options != undefined){
			  	if(options.isFilterEnabled){
			  		jQuery("#ListViewFilterMenuTask").on('click',function(){

			  		var filterList_obj = new filterListComp();
				  		filterList_obj.initComponent({
							element : "#ListViewFilterMenuTask",    //No I18N
							module : "task",    //No I18N
							personalize_key : "task_filter_views",    //No I18N
							mod_spec_pers_key : "taskview_sidebar",  //No I18N
							filter_action : "taskcombinedViewObj.taskViewSetFilterValue",    //No I18N
                            managefilter_url : "/ListViewFilter.do?module=task&action=listview",   //No I18N
							user_type : sdp_user.USERTYPE,
							favoritable: true,
							skipPersonalization: true
						});

			  		});
				   _self.taskViewSetFilterValue();
			  	}
			  if(options.isSearchEnabled){
				  jQuery("#task_search").show();
			  }
			  if(options.isColumnChooserEnabled){
				  jQuery("#btn_taskcol_chooser").show();
				   jQuery('#btn_taskcol_chooser').off('click').on('click',function(){ //NO I18N
					   _self.loadColumnList("taskview-columnlist",li_inf.taskViewColumnIndex,li_inf.taskViewColumnShow); //NO I18N
				   });
			  }

			  if(options.isSortingEnabled){
				    jQuery('.task-sort-by').show();
				    jQuery("#c_sortlist li").on('click',function(){
					  _self.taskViewSortBy(jQuery(this).attr('data-value'));
				    });
				    c_obj.changeSortClass(_self.listInputData.list_info.sort_order);

				    if(['status.name', 'priority.name'].indexOf(li_inf.list_info.sort_field) > -1) { //Resetting sort field value path
                        var arr = _self.listInputData.list_info.sort_field.split('.');
                        li_inf.list_info.sort_field = arr[0];
                    }

				    if(li_inf.list_info.sort_field == undefined){
				    	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_id').html()+"<i></i>").fadeIn(600);
			        }else{
			        	 jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_'+li_inf.list_info.sort_field).html()+"<i></i>").fadeIn(600);
			        }

			  }
			  if(options.isNavigationEnabled){
				  jQuery("#task-navigation-view").show();
				  jQuery("ul#navPageLength li").on('click',function(){
					  var row_count = jQuery(this).attr("data-value");
					  jQuery("#f_row_count").text(row_count);
					  jQuery('ul#navPageLength li').removeClass();
					  jQuery('ul#navPageLength li[data-value="' + row_count + '"]').addClass('active');
					  _self.listInputData.list_info.start_index='1';
					  _self.listInputData.list_info.row_count = row_count;
					  _self.refreshSideBarTaskView();
					  _self.saveTaskViewPersonalization(); //NO I18N
				   });
				  _self.setTaskViewNavigations();
			  }
			 // Set Tasks list height
			  if(jQuery('#task-list-sidebar').length>0 && options.initHeight != undefined){
				jQuery('#task-list-sidebar, .show-sidebar-btn').find('.task-items').height(options.initHeight);
			  }
		  }
		  if (options.from === "homeMyTasks" || (options.from === "reqListView" && options.module !== 'combined')) {
				_self.fetchTaskList(options.from);
		  }
		  jQuery("#combined-task-view").show();
		  if(options.module == "home") {
			  setTimeout(function(){
				jQuery('#task-list-sidebar').find('.task-items').height(jQuery('#task-list-sidebar').closest('.widget-panel').height()); //NO I18N
			  },1);
		  }
		//Event handled for display a total count when clicking ... in task list view navigation
		jQuery("#f_total_count").on("click", function () {
			_self.showTotalCount(true);
		});
	},
	c_obj.showSearchTaskDialog = function(){
        var data = {
            "title":{"text": "sdp.common.title"}, "id":{"text": "sdp.common.id"},//NO I18N
            "status":{"text":"sdp.admin.leftpanel.helpdesk.status", "placeHolder": "sdp.requests.selectstatus.title"},//NO I18N
            "priority":{"text":"sdp.requests.common.priority", "placeHolder": "common.priority.placeholder"},//NO I18N
            "group":{"text":"sdp.common.queue", "placeHolder": "sdp.change.bulkoperation.selectgroup"},//NO I18N
            "owner":{"text":"common.owner", "placeHolder": "sdp.tasks.select.owner"}//NO I18N
        }
        if(jQuery("#searchPanel").length > 0 && taskcombinedViewObj.listInputData.list_info.search_criteria){
            jQuery("#searchPanel").closest("#_DIALOG_LAYER").css("visibility", "visible");//NO I18N
        }else{
            showDialog(renderhbs("","TaskSearchPanel",{"data":data},false,"", false, false, null, true),'title='+translate("sdp.app.tasks.searchTask")+',width=450,position=relative', function() {
                $sdEventListener(jQuery('#_DIALOG_CONTENT #task-search-footer'))
            });
            jQuery.each(["priority","status","group","owner"], function(index,value){//NO I18N
                var options = {
                    allowClear: true,
                    placeholder: translate(data[value].placeHolder),
                    url:[{
                    url:"/api/v3/tasks/"+value,//NO I18N
                    field:value,
                    list_info:{start_index:1,row_count:25},
                    headers : { Accept: "vnd.manageengine.v3+json" } //NO I18N
                    }]
                }
                if(value == "group"){
                    options.for = "resource_mgmt";//NO I18N
                    options.formatSelection = options.formatResult = function(data){
                        if(data.site){
                            return data.site.name + " > "+data.name;
                        }
                        return data.name;
                    }
                    options.processResults= function(search_data, data, field){
                        search_data.push(data);
                    }
                }
                jQuery("#taskview-"+value).sdp_select2(options);
            });
        }
        jQuery("#taskview-title").focus();
	},
	c_obj.fetchTaskList = function (from)
	{
	        if(jQuery('#combined-task-view').parent().hasClass('hide-sidebar')) {
                return
            }
               var input_data = sdpAjaxInputData(_self.inputToListAPI());
               if(['status.name', 'priority.name'].indexOf(_self.listInputData.list_info.sort_field) > -1) { //Resetting sort field value path
                    var arr = _self.listInputData.list_info.sort_field.split('.');
                    _self.listInputData.list_info.sort_field = arr[0];
               }
		sdpAjax({
		    acceptODCompatible:true,
			url : "/api/v3/tasks?"+input_data, //NO I18N
		    success : function(data){
		    	var li_inf = _self.listInputData;
		    	var retain_r_count = li_inf.list_info.row_count;
		    	var retain_filter = li_inf.list_info.filter_by;
		    	li_inf.list_info = data.list_info;
		    	li_inf.list_info.row_count = retain_r_count;
		    	li_inf.list_info.filter_by = retain_filter;
		    	data.taskViewColumnIndex  = li_inf.taskViewColumnIndex;
		    		jQuery("#task_tot_cnt").text(li_inf.list_info.total_count);
		    		data.module = "home";
		    		data.from = from;
					data.tasks.each(function(ele){
						var module = ele.associated_entity;
                        ele.moduleId = module && module !== "general"? ele[module].id: '';// NO I18N
                        ele.projectId = module && module === "milestone"? ele["project"].id: '';// NO I18N
					})	
		    	if(data.tasks.length > 0){
					jQuery('#task_add_new').addClass('hide');
					jQuery('#task_add_new1').removeClass('hide');
				} else {
					jQuery('#task_add_new').removeClass('hide');
					jQuery('#task_add_new1').addClass('hide');
				}
				const html = jQuery(_self.compileHandleBarWithHTML("TaskviewRowTemplate",data))
                $sdStyleConverter(html)
		    	jQuery("#taskview-sidebar-list").html(html); //NO I18N
		    	$sdEventListener(jQuery(html))
		    	if(_self.options != undefined && _self.options.isNavigationEnabled){
		    		_self.setTaskViewNavigations();
		    	}

		    	initTooltip('#task-list-sidebar'); //NO I18N
		    	jQuery("#task_widget").removeClass('hide');
		    	jQuery("#combined-task-view").show();
		    },
		   error: function(response) {
               var message;
               var resp = response.responseJSON;
               if (resp && resp != null) {
                   if (resp.response_status[0] != null && resp.response_status[0].messages.constructor === Array && resp.response_status[0].messages.length > 0) {
                       message = response.responseJSON.response_status[0].messages[0].message;
                       var invalid_filter_criteria = getMessageForKey("sdp.customfilter.invalid.criteria"); // No I18N
                       if (invalid_filter_criteria === message) {
                           showalert('failure', getMessageForKey("sdp.customfilter.invalid.criteria"), "isAutoHide=false"); // No I18N
                           _self.taskViewSetFilterValue("0");
                           jQuery('#taskfiltername').text(translate("sdp.tasks.globle.AllTasks"));
                       } else {
                           showalert('failure', e_html(message), "isAutoHide=true,delay=3"); // No I18N
                       }
                   }
               } else {
                   showalert('failure', getMessageForKey("sdp.admin.associatedapplications.connectionfailure.msg", ["SDP"]), "isAutoHide=true,delay=3"); // No I18N
               }
           }
		});
	},
	c_obj.inputToListAPI = function(){
        var list_info = {};
        var inObj = {};
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
            //Setting sort field value path for status, priority, module below
            list_info.sort_field = (['status', 'priority'].indexOf(t_li.sort_field) > -1)? t_li.sort_field + '.name' : t_li.sort_field; //NO I18N
            list_info.sort_order = sort_order;
        }
        //list_info.tasks = {};
        if (!jQuery.isEmptyObject(t_li.filter_by)) {
            list_info.filter_by = t_li.filter_by;
        }
        inObj.list_info = list_info;
        inObj.list_info.fields_required = _self.listInputData.list_info.fields_required;
		if(_self.options.module == "home" || !_self.options.module ){
		    var fields = ["associated_entity", "request","project","change","problem","milestone","release", "overdue"] //NO I18N
            for(var i=0; i<fields.length; i++) {
                (inObj.list_info.fields_required.indexOf(fields[i]) < 0) && inObj.list_info.fields_required.push(fields[i])
            }
		}
        return inObj;
	},
	c_obj.refreshSideBarTaskView = function()
	{
	  jQuery('.task-refresh').closest('div').find('.btn,.btn-group').hide().end().find('.task-loading').removeClass("hide");                                                                                                                                //NO I18N
	  setTimeout(function(){
	     jQuery('.task-loading').addClass("hide").closest('div').find('.btn,.btn-group').show();                                                                                                                         //NO I18N
	  },500);
	  _self.fetchTaskList("reqListView"); //NO I18N
	},

	c_obj.setTaskViewNavigations =function()
	{
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

	c_obj.gotoPrevNext = function(goto_page)
	{
	  jQuery("#taskview-sidebar-list").scrollTop(0);
	  if(goto_page == "next"){
		  _self.listInputData.list_info.start_index = (parseInt(_self.listInputData.list_info.start_index) + parseInt(_self.listInputData.list_info.row_count)).toString();
	  }else{
		  _self.listInputData.list_info.start_index = (parseInt(_self.listInputData.list_info.start_index)-parseInt(_self.listInputData.list_info.row_count)).toString();
	  }
	  _self.refreshSideBarTaskView();
	},

	c_obj.loadColumnList = function(eleToBind, colsJSON, colToShow)
	{
	  var input = {};
	  	  input.columns = colsJSON;
	  	  input.colToShow = colToShow;
		  jQuery("#"+eleToBind).html(_self.compileHandleBarWithHTML("columnChooserTemplate", input)); //NO I18N
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

	c_obj.reOrderTaskColChooser = function(eleToBind,chk_ele) {
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

	c_obj.saveColumnConfig = function(ele)
	{
	  var indexMap = {};
	  var showMap  = {};

	  jQuery('#'+ele+'>li').each(function(indx){
	    jQuery(this).attr("index",indx);
	    indexMap[indx] = jQuery(this).attr("columnname");
	    showMap[jQuery(this).attr("columnname")] = jQuery(this).find("input").is(":checked");                                                                                                           //NO I18N
	  });
	   var fields_required = [];
	   jQuery("#taskview-columnlist input[type='checkbox']:checked").each(function() {
		   fields_required.push(jQuery(this).val());
      });
      if(fields_required.indexOf("owner") > -1) {
        fields_required.push("marked_owner")
      }
	   fields_required.push('id');
	   fields_required.push('title');
	   if(jQuery.inArray("scheduled_end_time",fields_required) < 0){
		   fields_required.push('scheduled_end_time');
	   }
      _self.listInputData.list_info.fields_required = fields_required;
	  _self.listInputData.taskViewColumnIndex = indexMap;
	  _self.listInputData.taskViewColumnShow  = showMap;

	  _self.saveTaskViewPersonalization(); //NO I18N
	  _self.refreshSideBarTaskView();
	},
	c_obj.isNormalInteger = function(str) {
    	var n = Math.floor(Number(str));
    	return n !== Infinity && String(n) === str && n > 0;
	},
	c_obj.taskViewApplySearch = function()
	{
	  var parent_ele = jQuery("#_DIALOG_LAYER");
      var taskId = parent_ele.find("#taskview-id").val().trim(); //NO I18N
      if(taskId != "" && !_self.isNormalInteger(taskId)) {
        showalert('failure',translate("taskid.search.error"), "isAutoHide=true"); //NO I18N
        return;
      }

      var fields_arr = ["title","id","status","priority","owner","group"];//NO I18N
      var search_criteria = {"condition": "is","logical_operator": "AND"};//NO I18N
          for(var i=0;i<fields_arr.length;i++){
            var fld_name = fields_arr[i];
            var fld_ID = parent_ele.find("#taskview-"+fld_name).val().trim();
            if(fld_ID !=""){
                if(search_criteria.children == undefined){
                    search_criteria.field = fld_name;
                    search_criteria.value = fld_ID;
                    if(fld_name == "title"){
                        search_criteria.condition = "contains";//NO I18N
                    }
                    search_criteria.children = [];
                }else{
                    search_criteria.children.push({
                        "field" : fld_name,//NO I18N
                        "value" : fld_ID,//NO I18N
                        "condition": "is",//NO I18N
                        "logical_operator": "AND"//NO I18N
                    })
                }
            }
          }
            if(search_criteria.children && search_criteria.children.length === 0) {
              delete search_criteria.children;
            }
            _self.listInputData.list_info.start_index = "1";
            if(!jQuery.isEmptyObject(search_criteria)){
                _self.listInputData.list_info.search_criteria = search_criteria;
            }else{
                delete _self.listInputData.list_info.search_criteria;
            }

         _self.refreshSideBarTaskView();
         jQuery('#search-result-display').show();
         jQuery('#task-combinedview-filter').hide();
         closeDialog();
	},

	c_obj.resetTaskViewSearch = function()
	{
	  jQuery('#search-result-display').hide();
	  jQuery('#task-combinedview-filter').show();
	  delete _self.listInputData.list_info.search_criteria;
	  _self.refreshSideBarTaskView();
	},

	c_obj.saveTaskViewPersonalization = function()
	{
	  if(_self.options != undefined && _self.options.personalize_key != undefined){
		  var data = {};
		  //var filter   = jQuery('ul#taskfilterlist').length > 0 ? jQuery('ul#taskfilterlist li.active').attr('data-value') : null;
		  var rowCount = jQuery('ul#navPageLength').length > 0 ? jQuery('ul#navPageLength li.active').attr('data-value') : null;

		  var is_hidden = jQuery('#combined-task-view').length > 0 ? jQuery('#combined-task-view').parent().hasClass('hide-sidebar') : null;
		  if(_self.listInputData.taskViewColumnShow != null){
			  data.taskViewColumnShow = _self.listInputData.taskViewColumnShow;
		  }
		  if(_self.listInputData.taskViewColumnIndex != null){
			  data.taskViewColumnIndex= _self.listInputData.taskViewColumnIndex;
		  }
		  if(is_hidden !=  null){
			  data.is_hidden   = is_hidden;
		  }

		  var list_info = {};
		  if(_self.listInputData.list_info.filter_by != null){
			  list_info.filter_by  = _self.listInputData.list_info.filter_by;
		  }
		  if(rowCount != null){
			  list_info.row_count   = rowCount;
		  }
		  if(_self.listInputData.list_info.sort_field != undefined){
			  list_info.sort_field = _self.listInputData.list_info.sort_field;
			  list_info.sort_order = _self.listInputData.list_info.sort_order;
		  }
		  if(_self.listInputData.list_info.get_total_count){
            list_info.get_total_count = true;
          }
		  data.list_info = list_info;
		  if(_self.listInputData.list_info.fields_required != null){
		  	data.list_info.fields_required = _self.listInputData.list_info.fields_required;
		  }
		  addPersonalization(_self.options.personalize_key, data);
	  }
	},

	c_obj.loadTaskViewPersonalization = function(personalize_key)
	{
	  var dataObj = null;
	  var data = getPersonalizeData(personalize_key);
		  if(!jQuery.isEmptyObject(data)){
	            dataObj = data;
		        _self.listInputData = data;
		  }
	  return dataObj;
	},

	c_obj.taskViewSetFilterValue = function(filterValue)
	{
		var disp_filter = "";
	  if(filterValue!=null){
		 _self.listInputData.list_info.start_index = "1";
		 disp_filter = jQuery("#ListViewFilterMenuTask .cb[value="+filterValue+"]").closest('li').find("[data-filter-content='item']").text();
		  _self.listInputData.list_info.filter_by = {"id" :filterValue};// NO I18N
		  // Syncing the filters for both request task sidepanel and home-->showAllTasks
          var showAlltasks = $tasks.getPersonalization("showAllTasks_tasks","tasks");// NO I18N
          if(!showAlltasks.list_info){
            showAlltasks.list_info={};
          }
          showAlltasks.list_info.filter_by = {'id':filterValue};//NO I18N
          addPersonalization("showAllTasks_tasks",showAlltasks);
          _self.saveTaskViewPersonalization();
		 _self.refreshSideBarTaskView();
	  }else{
		  if(_self.listInputData.list_info.filter_by !=null){
			  filterValue = _self.listInputData.list_info.filter_by.id;
		  }
		disp_filter = jQuery('#taskfiltername').text();
	  }

      jQuery("#task_countview a").attr("href","/ui/tasks?mode=list&from=showAllTasks"+(_self.defaultFilter?"&filter=my_all_tasks":""));
	  var request_taskcntele = jQuery("#task_countview");
	  if(request_taskcntele.length > 0){
	  	  request_taskcntele.find("#selected_task_name").html(e_html(disp_filter));
	  }
	  jQuery('#task-combinedview-filter span:last').html(e_html(disp_filter)).fadeIn(600);
	  _self.rowCount = "";
	},

	c_obj.taskViewSortBy = function(column)
	{
	  if(column == null){
		  _self.listInputData.list_info.sort_order = (_self.listInputData.list_info.sort_order == 'asc') ? 'desc' : 'asc';   //NO I18N
		  _self.listInputData.list_info.sort_field = (_self.listInputData.list_info.sort_field == undefined) ? 'id' : _self.listInputData.list_info.sort_field;   //NO I18N
		  c_obj.changeSortClass(_self.listInputData.list_info.sort_order);
	  }else{
		  _self.listInputData.list_info.sort_field = column;
		  _self.listInputData.list_info.sort_order = (_self.listInputData.list_info.sort_order == undefined) ? 'asc' : _self.listInputData.list_info.sort_order;   //NO I18N
	  }
	  _self.saveTaskViewPersonalization(); //NO I18N
	  _self.refreshSideBarTaskView();
	  jQuery('#ActionsStepsMenuParentSort').html(jQuery('#taskview_sort_choice_'+_self.listInputData.list_info.sort_field).html()+"<i></i>").fadeIn(600);
	},

	c_obj.refreshOnEdit = function()
	{
		/**Change for combined view on edit refresh */
		if (_self.options.module == "combined") {
			setTimeout(function(){
				table_combined_task.refreshTable("refresh"); //NO I18N
			},500);
		} else {
			setTimeout(function(){
				_self.fetchTaskList();
			},500);				
		}
	},
	c_obj.changeSortClass = function(sortOrder)
	{
		var th = jQuery('#taskview-sortby').find('> span').removeClass();
		if(sortOrder == "desc"){
			th.addClass('cspr asc icon-sm').end().attr('title',translate('common.sortasc')); //NO I18N
		}
		else{
			th.addClass('cspr desc1 icon-sm').end().attr('title',translate('common.sortdesc')); //NO I18N
		}
	},
	c_obj.editClickWrapper = function()
	{
	  _self.refreshOnEdit();
	  setTimeout(function(){jQuery('#_DIALOG_LAYER').find('#edit_link').trigger('click');},200);                                                                       //NO I18N
	},

	c_obj.hideShowTaskSidebar = function(ishide){
		jQuery('.task-list-wrap').toggleClass('hide-sidebar'); //NO I18N
		var request_taskcntele = jQuery("#task_countview");
		if(request_taskcntele.length > 0){
			request_taskcntele.toggleClass('hide show');
		}
		_self.saveTaskViewPersonalization(); //NO I18N

         setTimeout(function() {
	 		jQuery('html, body').animate({scrollLeft: -1}, 350, function() {//NO I18N
  			window.adjustWOTableHeight(jQuery(".tableComponent"));	//NO I18N
	 		});
         }, 50);
		if (ishide) {
			_self.showTotalCount();
		}else{
            _self.fetchTaskList("reqListView");//NO I18N
        }
	},
	c_obj.compileHandleBarWithHTML = function(eleId,data){
		return renderhbs(null, eleId, data, false, 'task/combined-view', null, null, null, true) //NO I18N
	},
	/*
	Display total count in request list view and task list view navigation
	@param dispOnTaskList is Boolean value and used to display a count when clicking the ... in navigation
	*/
	c_obj.showTotalCount = function (dispOnTaskList) {
	var inpuData = _self.inputToListAPI();
		var list_data = { "list_info": { "row_count": "0","filter_by": inpuData.list_info.filter_by, "get_total_count": true } }; //NO I18N
		var input_data = sdpAjaxInputData(list_data);
		sdpAjax({
		    acceptODCompatible:true,
			url: "/api/v3/tasks/_total_count?" + input_data, //NO I18N
			success: function (data) {
				if (data._total_count) {
                    if (dispOnTaskList) {
                        jQuery("#f_total_count").text(translate("common.of") + " " + data._total_count.tasks).find("b").remove();
                        _self.rowCount = data._total_count.tasks;
                    }
                }
            jQuery("#selected_task_tot_cnt").text(data._total_count.tasks);
			}
		});
	}

	return c_obj;
}());
