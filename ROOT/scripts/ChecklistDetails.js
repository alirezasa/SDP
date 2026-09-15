/* $Id$ */

var $checklist= {
	entityID : '',
	entity : '',
	subentity : '',
	itementity : '',
	table_comp_var:'',
	table_comp_association_var:'',
	data:{},
	editMode:false,
	deleteMode:false,
	currentID:null,
	colSpan:3,

	initListView: function(options){
		this.entityID=options.entityID;
		this.entity=options.entity;
		this.subentity=options.subentity;
		this.itementity=options.itementity;
		this.editMode=options.editMode;
		this.deleteMode=options.deleteMode;
		this.support_search_criteria = true;
		this.showListView();		
	},

	showListView: function()
	{
		var table_content = {};
		var _self=this;
		table_content.header = this.headerdataConstruct();
		setTimeout(function()
		{
			var options = {};
			options.paginationEnabled = true;
			options.searchEnabled = true;
			options.multiDeleteEnabled = true;
			options.callbackRowfunction = _self.rowdataConstruct;
			options.row_inputdata = _self.rowdataConstruct();
			options.callbackURL = _self.entity + "/" + _self.entityID + "/"+_self.subentity; // No I18N
			options.entity_name = _self.subentity; 
			options.deleteURL=options.callbackURL;
			options.nodatabanner_callback=_self.nodatabanner_callback;
			options.support_search_criteria = true;
			options.delete_callback= () => {
				$req.details.updateRequestTemplates('checklists',null);// No I18N
			}
			options.callbackAfterBodyRender= () => {
				let nodataele= jQuery('[data-action-name="associate-checklists-action"]');
					nodataele.off('click').on('click', (event) => {// No I18N
						$checklist.showChecklistsPopup();
					});
				jQuery('[data-action-name="takeActionOnChecklist"]').off('click').on('click', (event) => {// No I18N
					$checklist.takeAction(event.currentTarget,event.currentTarget.dataset.checklistId,true);
					sdpcollapsepanel.toggle(event.currentTarget);
				});
				jQuery('[data-action-name="expandOrCollapseChecklist"]').off('click').on('click', (event) => {// No I18N
					$checklist.expandOrCollapse(event.currentTarget.dataset.checklistId);
				});
				jQuery('[data-action-name="checklistStatusOnOff"]').off('click').on('click', (event) => {// No I18N
					var newvalue=jQuery(event.currentTarget).parent().find('.onoff').text() == window.translate("checklist.verified") ? 'Not Verified' : 'Verified'; //No I18N
					_self.switchStatus(event.currentTarget.dataset.checklistId);
					_self.updateChecklistStatus(event.currentTarget.dataset.checklistId,newvalue);
				});
				
			}
			var table_compreq = new tableComponent(table_comp.getTableInfo(), table_content, options);
			initTooltip('.cl-detailviewTab');  // No I18N
			_self.table_comp_var=table_compreq;
			setTimeout(function(){
				if(_self.deleteMode=='true')
				{
					jQuery('#deleteicon_checklists').removeClass("hide");
				}
				else 
				{
					_self.colSpan=2;
				}
				if(_self.entity=="requests"&&$req.details.operational_data.links.associate_checklists!=undefined)
				{
					jQuery("#Associate_checklists").removeClass("hide");
				}				
			},200);
			initTooltip('.cl-detailviewTab'); //No I18N
		}, 1);
	},
	
	nodatabanner_callback: function(table_data)
	{
		if(table_data && table_data.t_obj && table_data.t_obj.table_info && table_data.t_obj.table_info.list_info && table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }			
		var html = '';
		if($checklist.subentity=="archive_checklists"){
			html= '<div class="alert-nodata mt20"> <span class="msg">'+window.translate('checklists.not.found')+'</span> </div>';
		}
		else{
			html= '<div class="alert-nodata mt0"> <span class="msg"><span data-i18n-key="checklists.not.found">'+window.translate('checklists.not.found')+'</span> ' + (($req.details.operational_data.links.associate_checklists!=undefined)?'<a class="text-link" href="/" data-action-name="associate-checklists-action" data-name="module_add_checklist" data-i18n-key="associate.checklists">'+window.translate('associate.checklists')+'</a>':'')+'</span> </div>';
		}
		return html;
	},

	rowdataConstruct: function()
	{
		var inputObject = {"list_info":{"sort_field":"order","sort_order":"asc"}}; //No I18N
		return inputObject;
	},

	headerdataConstruct: function()
	{
		var tableWidth = jQuery(window).width() - 280;
		var tempNameWidth = ((tableWidth * 30) / 100) + "px"; //NO I18N       
		var meta_data={};
		if(this.subentity=='checklists'&&this.deleteMode=='true'){
		meta_data.checklists_head_chk= { "type": "checkbox","dataCelltransformer": this.constructCheckbox } ;  //No I18N
		}
		meta_data.title = {"dataCelltransformer": this.constructTitle , "text": "checklist.name", "width": tempNameWidth  }; //No I18N
		meta_data.status = { "text": "common.status", "dataCelltransformer": this.constructStatus ,"width": tempNameWidth  }; //No I18N
		return meta_data;
	},
	
	constructTitle: function(table_data)
	{
		var _self=this;
		var checklistID = $checklist.getRowValue("id", table_data); //No I18N 
		var title = $checklist.getRowValue("title", table_data); //No I18N 
		var col_str='<span aria-label="'+e_attr(title)+'" id="checklist-arrow-'+checklistID+'" class="cur-ptr cspr icon-sm circle-arrow-down opac7 top0 collapsed" data-target="#collapseItems_'+checklistID+'" title="'+window.translate('sdp.common.expand')+'"  data-action-name="takeActionOnChecklist" data-checklist-id="'+checklistID+'" ></span>';
		col_str = col_str+'<a href="/" aria-label="'+e_attr(title)+'" class="cur-ptr" rel="uittoltip-track-table" title="'+e_attr(title)+'" data-action-name="expandOrCollapseChecklist" data-checklist-id="'+checklistID+'" >'+e_html(title)+'</a>';
		return col_str;
	},

	constructStatus: function(table_data)
	{
		var _self=this;
		var checklistID = $checklist.getRowValue("id", table_data); //No I18N 
		var status = $checklist.getRowValue("status", table_data); //No I18N 
		var classvar="off grey"; //No I18N 
		if(status=='Verified')
		{
			classvar="on"; //No I18N 
		}
		var col_str='';
		if($checklist.subentity=='archive_checklists'||$checklist.editMode=='false')
		{
			col_str='<span>'+window.translate(status=='Verified'?'checklist.verified':'checklist.not.verified')+'</span>';
		}
		else 
		{
			col_str = '<div class="switchonoff disp-ib" > <span data-action-name="checklistStatusOnOff" data-checklist-id="'+checklistID+'" id="checklistStatusOnOff-'+checklistID+'" class="switchonoff-action mr5">	<input type="checkbox" id="checklistStatusToggleCb" class="on hide" switch="true">	<span chkid="checklistStatusToggleCb" name="checklistStatusToggle" id="checklistStatusToggle" class="switch '+classvar+'"></span>	</span>	 <label class="onoff" data-name="'+e_html(status)+'">'+window.translate(status=='Verified'?'checklist.verified':'checklist.not.verified')+'</label>  </div>';
		}
		var data=$checklist.data;
		var key=$checklist.itementity;
		var row_data= table_data.row_data;
		data[checklistID]=row_data;
		data[checklistID].editMode=$checklist.editMode;
		data[checklistID].deleteMode=$checklist.deleteMode;
		var items=[];
		for(var j=0;j<row_data[key].length;j++)
		{
			var temp={};
			temp=row_data[key][j];
			temp.last_updated_by=e_html(temp.last_updated_by);
			temp.help_text=e_html(temp.help_text);
			items.push(temp);
		}
		data[row_data.id][key]=items;
		$checklist.data=data;
		return col_str;
	},

	constructCheckbox: function(table_data)
	{
		var _self=this;
		var checklistID = $checklist.getRowValue("id", table_data); //No I18N 
		var col_str = '<label class="mr5 clcheckbox vmiddle"> <input type="checkbox" value=' + e_attr(checklistID) + ' data-table-checkbox></label>';
		return col_str;
	},

	getRowValue: function(attr_name, table_data)
	{
		var row_data = table_data.row_data;
		var attr_value = row_data[attr_name];
		return attr_value;
	},

	takeAction: function(ele,checklistID,toggleNeeded)
	{
		var _self=this;
		if(this.currentID!=null&&this.currentID!=checklistID)
		{
			jQuery('#checklist-arrow-'+this.currentID).addClass('circle-arrow-down top0 collapsed').removeClass('circle-arrow-up').attr('title',translate('sdp.common.expand')).closest('tr').find('td').removeClass('noborder'); // No I18N
			jQuery('#collapseItems_'+this.currentID).remove();
		}
		this.currentID=checklistID;
		if(jQuery('#collapseItems_'+checklistID).length==0){
		jQuery('<tr id="collapseItems_'+checklistID+'" class="tc-row" >  </tr>').insertAfter(jQuery(ele).closest('tr'));
		jQuery('#collapseItems_'+checklistID).css('background-color','#f5f5f5'); // No I18N
		}
		var theTemplate = "checklistitems-template"; //No I18N
		let callbackFunc = $checklist.checklistItemsCallback;
		if(this.subentity=='archive_checklists')
		{
			theTemplate = "archived-checklistitems-template"; //No I18N
			callbackFunc = null;
		}
		this.data[checklistID].colSpan=this.colSpan;
		renderhbs('#collapseItems_'+checklistID, theTemplate, this.data[checklistID] , false, "checklists",null,null,callbackFunc);// NO I18N
		_self.intCSSChanges(ele,checklistID,toggleNeeded);
	},

	checklistItemsCallback : () => {
    	jQuery("#checklist_body_requests").off('click').on('click', '[data-action-name="deleteChecklistItem"],[data-action-name="UpdateBooleanChecklistItem"],[data-action-name=UpdateRadioChecklistItem],[data-action-name=UpdateCommonChecklistItem],[data-action-name="ClearChecklist"]', (event) => {
    		let currentDataSet = event.currentTarget.dataset;
    		switch(currentDataSet.actionName){
    			case 'deleteChecklistItem':             //No I18N
    				$checklist.deleteChecklistItem(currentDataSet.checklistId,currentDataSet.checklistitemId,currentDataSet.indexx);
    				break;
    			case 'UpdateBooleanChecklistItem':          //No I18N
    				$checklist.updateItem(currentDataSet.checklistId,currentDataSet.checklistitemId,currentDataSet.fieldType,event.currentTarget,currentDataSet.indexx);
    				break;
    			case 'UpdateRadioChecklistItem':                //No I18N
    				$checklist.updateItem(currentDataSet.checklistId,currentDataSet.checklistitemId,'Radio',currentDataSet.index,currentDataSet.indexx);        //No I18N
    				break;
    			case 'UpdateCommonChecklistItem':               //No I18N
    				$checklist.updateItem(currentDataSet.checklistId,currentDataSet.checklistitemId,currentDataSet.fieldType,event.currentTarget,currentDataSet.indexx);
    				break;
    			case 'ClearChecklist':                          //No I18N
    				$checklist.clear(event.currentTarget.dataset.checklistId);
    				break;
    		}
    	});
    },

	intCSSChanges: function(ele,checklistID,toggleNeeded)
	{
		var collapseElement=jQuery('#collapseItems_'+checklistID);
		var arrowElement=jQuery('#checklist-arrow-'+checklistID);
		collapseElement.attr('colspan',5);
		if(toggleNeeded){
		if(arrowElement.hasClass('circle-arrow-down'))
		{
			arrowElement.addClass('circle-arrow-up top0').removeClass('circle-arrow-down');
			arrowElement.attr('title',translate('sdp.common.collapse'));
			jQuery(ele).closest('tr').find('td').addClass('noborder'); // No I18N
		}
		else
		{
			arrowElement.addClass('circle-arrow-down top0').removeClass('circle-arrow-up');
			arrowElement.attr('title',translate('sdp.common.expand'));
			jQuery(ele).closest('tr').find('td').removeClass('noborder'); // No I18N
		}
		}
		collapseElement.on('mouseenter',function() {
			jQuery(this).prev('tr').css('background-color','#f5f5f5'); // No I18N
		});
		collapseElement.on('mouseleave',function() {
			jQuery(this).prev('tr').css('background-color',''); // No I18N
		});
		jQuery(ele).closest('tr').on('mouseover',function() {  // No I18N
			collapseElement.css('background-color','#f5f5f5'); // No I18N
			});
		jQuery(ele).closest('tr').on('mouseenter',function() { // No I18N
			collapseElement.css('background-color','#f5f5f5'); // No I18N
			});
		jQuery(ele).closest('tr').on('mouseleave',function() { // No I18N
				collapseElement.css('background-color',''); // No I18N
			});
		initTooltip('.cl-detailviewTab'); // No I18N
	},

	updateItem: function(cid, iid, type, ele,index)
    {
        var inputjson = {};
        var key = '';
		var data= this.data;
		var entity=this.entity;
        if (type == 'Boolean')
        {
            var value = true;
            if (data[cid].checklist_items[index].bool_value == true)
            {
                value = false;
            }
            inputjson = {  "module_checklist_item":  { "bool_value": value  }  }; //No I18N
            key = 'bool_value'; //No I18N
        }
        else if (type == 'Single Line')
        {
            key = 'text_value'; //No I18N
            var val = jQuery("#single-line-" + iid).val();
            if (data[cid].checklist_items[index].text_value == val || (data[cid].checklist_items[index].text_value == null && val == "")){
                return;
			}
            inputjson = {  "module_checklist_item":  { "text_value": jQuery("#single-line-" + iid).val()   }   }; //No I18N
        }
        else if (type == 'Numeric')
        {
            key = 'long_value'; //No I18N
            var val = jQuery("#single-line-" + iid).val();
			if(val.match(/[^\d]/))
			{
				var msg=window.translate("sdp.inventory.detailWS.invalidUDFMsg");
				showalert("failure", msg, 'isAutoHide=true'); // No I18N
				this.clear(cid);
				return;
			}
            if (data[cid].checklist_items[index].long_value == val || (data[cid].checklist_items[index].long_value == null && val == "")){
                return;
			}
            if (val != "" && !val.match(/^[+-]?(?=.?\d)\d*(\.\d{0,9})?$/))
            {
                message = window.translate('sdp.common.failed');
                showalert("failure", message, 'isAutoHide=true'); // No I18N
                return;
            }
            inputjson = {   "module_checklist_item":  { "long_value": jQuery("#single-line-" + iid).val()    }    }; //No I18N
        }
        else
        {
            key = 'text_value'; //No I18N
			var val = data[cid].checklist_items[index].options[ele];
            if (data[cid].checklist_items[index].text_value == val){
                return;
			}
            inputjson = { "module_checklist_item":  { "text_value": val   }  }; //No I18N
        }
        var inputData = sdpAjaxInputData(inputjson);
        var message, type,_self=this;
        sdpAjax(
        {
            url: 'api/v3/'+_self.entity+'/' + _self.entityID + '/checklists/' + cid + '/checklist_items/' + iid, //No I18N
            type: 'PUT', //No I18N
            data: inputData,
            async: false,
            cache: false,
            success: function(resp)
            {
                type = resp.response_status.status;
                if (type == "success")
                {
                    message = window.translate('sdp.checklist_item.update');
					data[cid].checklist_items[index].is_completed = resp.module_checklist_item.is_completed;
                    data[cid].checklist_items[index].last_updated_time = resp.module_checklist_item.last_updated_time.display_value;
                    data[cid].checklist_items[index].last_updated_by = e_html(resp.module_checklist_item.last_updated_by.name);
                    data[cid].checklist_items[index][key] = resp.module_checklist_item[key];
					_self.data=data;
                    _self.takeAction(jQuery('#checklist-arrow-' + cid), cid,false);
					_self.updateStatus(cid);
                    showalert("success", message, 'isAutoHide=true'); // No I18N
                }
            }
        });
    },

    deleteChecklistItem:function(cid, iid,index)
    {
		if(!window.confirm(getMessageForKey('checklistitems.cannot.add')))
		{
			return;
		}
		var entity=this.entity;
		var _self=this;
		var table_comp_var=this.table_comp_var;
        sdpAjax(
        {
            url: 'api/v3/'+_self.entity+'/' + _self.entityID + '/checklists/' + cid + '/checklist_items/' + iid, //No I18N
            type: 'DELETE', //No I18N
            async: false,
            cache: false,
            success: function(resp)
            {
                type = resp.response_status.status;
                if (type == "success")
                {
                    message = window.translate('sdp.checklist_item.delete');
                    showalert("success", message, 'isAutoHide=true'); // No I18N
					var data=_self.data;
					data[cid].checklist_items.splice(index,1);
					if(data[cid].checklist_items.length==0)
					{
						_self.showListView();
						$req.details.updateRequestTemplates('checklists',null); // No I18N
					}
					else
					{
						_self.data=data;
						var ele=jQuery('#checklist-arrow-' + cid);
						_self.takeAction(ele, cid,false);
					}
                }
            }
        });

    },

	updateChecklistStatus: function(cid, statusvalue)
    {
		var data=this.data;
		var items=data[cid].checklist_items||[];
		var statusupdate=true;
		var _self=this;
		for(var i=0;i<items.length;i++)
		{
			if(items[i].is_completed==false)
			{
				statusupdate=false;
				break;
			}
		}
		if(statusupdate==false)
		{
			var message=window.translate('sdp.checklist.status.update');
			showalert("failure", message, 'isAutoHide=true'); //NO I18N
			_self.switchStatus(cid);
			if(jQuery('#checklist-arrow-'+cid).hasClass('circle-arrow-down')){
			_self.expandOrCollapse(cid);
			}
			return;
		}
		var entity=this.entity;
		var table_comp_var=this.table_comp_var;
		var inputjson={ "module_checklist": { "status":statusvalue } }; //No I18N
		var inputData = sdpAjaxInputData(inputjson);
        sdpAjax(
        {
            url: 'api/v3/'+_self.entity+'/' + _self.entityID + '/checklists/' + cid, //No I18N
            type: 'PUT', //No I18N
			data: inputData,
            async: false,
            cache: false,
            success: function(resp)
            {
                type = resp.response_status.status;
                if (type == "success")
                {
                    message = window.translate('status.updated');
					_self.data[cid].status=statusvalue;
                    _self.takeAction(jQuery('#checklist-arrow-'+cid),cid,false);
					jQuery('#checklist-arrow-'+cid).removeClass('circle-arrow-down collapsed').addClass('circle-arrow-up top0').attr('title',translate('sdp.common.collapse'));
					$req.details.updateRequestTemplates('checklists',null); // No I18N
                }
            }
        });

    },

    clear: function(checklistid)
    {
        this.takeAction(jQuery('#checklist-arrow-' + checklistid), checklistid,false);
    },
	
	expandOrCollapse: function(checklistid)
	{
		jQuery("#checklist-arrow-"+checklistid).trigger( "click" );
	},
	
	updateStatus: function(checklistID){
		var data=this.data;
		var items=data[checklistID].checklist_items||[];
		var statusupdate=true;
		for(var i=0;i<items.length;i++)
		{
			if(items[i].is_completed==false)
			{
				statusupdate=false;
				break;
			}
		}
		if(statusupdate)
		{
			jQuery("#checklistStatusOnOff-"+checklistID).trigger( "click" );
		}
	},

	switchStatus: function(checklistID){
		var cur = jQuery('#checklistStatusOnOff-'+checklistID);
		    var newvalue=cur.parent().find('.onoff').attr('data-name') == 'Verified' ? 'checklist.not.verified' : 'checklist.verified'; //No I18N
			if(cur.find('span').hasClass('on')) {
				cur.find('span').removeClass('on').addClass('off grey');
				cur.parent().find('.onoff').attr('data-name','Not Verified');
			}
			else {
				cur.find('span').removeClass('off grey').addClass('on');
				cur.parent().find('.onoff').attr('data-name','Verified');
			}
			cur.parent().find('.onoff').text(window.translate(newvalue));
	},
	
	showChecklistsPopup: function()
	{
		showURLInDialog('/common/ChecklistsListView.jsp?module=requests&id='+this.entityID,'position=absmiddle, top=100, modal=yes, width=700, height=500, title=' + window.getMessageForKey('associate.checklists')); // No I18N
	}
};
