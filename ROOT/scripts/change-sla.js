/* $Id$ */
jQuery(document).ready(function(){

	//Resolution time change
	var esc_format = false;
	jQuery('.enable-res-time input[type="radio"]').on('change', function(){
		var val = jQuery(this).val();
		if(val=="yes"){  // Enable Resolution time
			jQuery('.sla-res-time').removeClass('disabled-div').find('.form-control').prop('disabled',false);// No I18N
			jQuery('.sla-escalation-criteria').find('.esc-per').hide().end().find('.esc-after').show();	
			esc_format = true; // Show resolution time in Escalations
			jQuery('.sla-criteria-head .alert').find('.sla-info-msg2').show().end().find('.sla-info-msg1').hide();
		}
		else{ // Resolution time disabled
			jQuery('.sla-res-time').addClass('disabled-div').find('.form-control').prop('disabled',true);// No I18N
			jQuery('.sla-escalation-criteria').find('.esc-per').show().end().find('.esc-after').hide();	
			esc_format = false; // Hide resolution time in Escalations
			jQuery('.sla-criteria-head .alert').find('.sla-info-msg2').hide().end().find('.sla-info-msg1').show();
		}
		jQuery('.sla-escalation-criteria').find('.res-time').parent().removeClass('has-error');
	});
	// New Escalation
	jQuery(document).on('click','.add-sla-esc, .remove-sla-esc',function(){ //No I18N
		var obj = jQuery(this);
		len = 0;

		var obj_sla = obj.closest('.sla-escalation-criteria'); //No I18N
		obj_sel = jQuery('.esc-criteria-div select[multiple]');

		if(obj.hasClass('add-sla-esc')){ // Add new Escalation row
			var  d_val = obj_sla.find('input[data-res="res-days"]').val();
			h_val = obj_sla.find('input[data-res="res-hours"]').val();
			s_val = obj_sla.find('select[multiple]').val();
			is_val = true;
			if(esc_format){ is_val = (d_val!='')||(h_val!=''); }
			else{ is_val = obj_sla.find('select[multiple]').val()==null?false:true; }

			if(is_val&&(s_val!=null))
			{
				obj_sel.each(function(){ jQuery(this).select2('destroy'); }); //No I18N
				obj_sla.after(jQuery('.esc-template').html());
				jQuery('.esc-criteria-div select[multiple]').select2({placeholder: getMessageForKey("sdp.change.sla.select"), closeOnSelect : false}); //No I18N
				len = jQuery('.esc-criteria-div').find('.sla-escalation-criteria').length;
				if(len==1){ jQuery('.sla-escalation-criteria').find('.remove-sla-esc').hide().end().find('.add-sla-esc').show(); }//atleat , one escaltions should be shown.
				if(len>1){ // Show add new row button if more than one rows are there
					jQuery('.sla-escalation-criteria').find('.remove-sla-esc,.add-sla-esc').show();
				}
				if(len==4){ //do not allow to add more than 4
					jQuery('.sla-escalation-criteria').find('.remove-sla-esc').show().end().find('.add-sla-esc').hide();
				}
				//events for new escalation row
				let newEscalationElement = document.querySelectorAll('[sdpJs="js-event-ChangeSLA-2"]');//No i18N
				newEscalationElement.forEach(function(el) {
					el.addEventListener("keypress", function(event) { return allowOnlyNumber(event); });//No i18N
				});
			}
			else{ alert(getMessageForKey("sdp.change.disable.please.fill.required"));} // Show error message
		}
		else{ // Remove Escalation row
			obj_sla.remove();
			obj_sel.select2('destroy').select2({placeholder: getMessageForKey("sdp.change.sla.select"), closeOnSelect : false}); //No I18N
			len = jQuery('.esc-criteria-div').find('.sla-escalation-criteria').length;  
			if(len==1){ jQuery('.sla-escalation-criteria').find('.remove-sla-esc').hide().end().find('.add-sla-esc').show(); }
			if(len>1){ 
				jQuery('.sla-escalation-criteria').find('.remove-sla-esc,.add-sla-esc').show();
			}
		}
	});

	// Enable / Disable SLA
	jQuery(document).on('click','a .common-disable-icon1, a .common-enable-icon1',function(){ //No I18N    	

		jQuery(this).closest('tr').toggleClass('disabled');// No I18N
		if(jQuery(this).hasClass('common-enable-icon1')){
			jQuery(this).attr({'class':'common-sprite icon-sm common-disable-icon1 ml10 mr10', 'title':getMessageForKey("sdp.change.enable.sla")}).uitooltip({content:getMessageForKey("sdp.change.enable.sla")});
		}
		else{ jQuery(this).attr({'class':'common-sprite icon-sm common-enable-icon1 ml10 mr10', 'title':getMessageForKey("sdp.change.disable.sla")}).uitooltip({content:getMessageForKey("sdp.change.disable.sla")}); }
	});

	// Set execution hours as Operational/Calendar hours
	jQuery('.exe-criteria').on('click', function(){
		jQuery('#execute-hrs').text(jQuery(this).find('input:checked').parent('label').text()); // No I18N
	});

	// Sortable sla-list view
	jQuery('#tablelist tbody').sortable({
		placeholder: "ui-state-highlight",// No I18N
		handle: ".sort-handle", // No I18N
		items: ">tr[class]", 
		update: function( event, ui ) {
			jQuery('.sla-apply-sort').show();
			jQuery('.sla-btn-head').hide();
		},
		start: function(e, ui){
			ui.placeholder.height(ui.item.height());
		}
	});

	// Revert Sorting positions
	jQuery('.sla-revert-sort').on('click', function(){		
		reloadListView();
	});

	// Apply Sorting
	var reorderInp =[];
	var repos=1;
	jQuery('.sla-apply-sort .btn-primary').on('click', function(){    	    	
		jQuery(".sla-list tr input.sla-id").each(function(){
			var slaid= jQuery(this).attr('id');
			if(!jQuery('#enable_'+slaid).hasClass('common-disable-no-action'))
			{
				reorderInp.push({id:parseInt(slaid),order_id:repos});
				repos = repos+1;
			}
		});
		var reorder = {changeSLA_order:reorderInp};
		var data = {"INPUT_DATA" : Object.toJSON(reorder)}; //No I18N
		data[getCSRFParamName()]=getCSRFParamValue();
		jQuery.ajax({ type: "PUT", url: "servlet/slaapi/changeSLA/reorder", data : data}).done(function(data) //No I18N
				{ 
			var opt = JSON.parse(data) ; 
			if(opt.status=="Success")
			{
				showalert('success',getMessageForKey("sdp.change.sla.reorder.apply.success"),'isAutoHide=true');// No I18N
			}
			else
			{
				showalert('failure',getMessageForKey("sdp.change.sla.reorder.apply.failure")+" "+parseErrorMessage(opt.message),'isAutoHide=false');//No I18N
				setTimeout(function(){
					var query = window.location.search; 
				    query += (query.lastIndexOf('&') == query.length-1 ) ? "PORTALID="+PORTALID : "&PORTALID="+PORTALID;	// No I18N
				    window.location.search=query;
					window.location.reload();
				},3000);
			}
				});
		reorderInp=[];
		repos=1;
	});					

	// Show/Hide Apply changes btns
	jQuery('.sla-apply-sort .btn').on('click', function(){
		jQuery('.sla-apply-sort').hide();
		jQuery('.sla-btn-head').show();
	});

	// Enable/Disable Delete button
	jQuery(document).on('click','#sla-checkall',function() {// No I18N
		if(jQuery('#sla-checkall').prop("checked"))
		{
			jQuery('.sla-id').prop('checked', jQuery(this).is(":checked")); //No I18N			
		}
		else 
		{
			jQuery('.sla-id').prop('checked', false); //No I18N
		}
	});
	jQuery(document).on('click','.sla-list input[type="checkbox"]',function() {// No I18N		
		jQuery('.create-sla .sla-delete-btn').prop('disabled',true); // No I18N
		jQuery(".sla-list tr input.sla-id:checked").each(function(){
			jQuery('.create-sla .sla-delete-btn').prop('disabled',false); // No I18N
		});
	});

	// Delete Action
	jQuery('.sla-delete-btn').on('click', function(){
		var c = confirm(getMessageForKey("sdp.change.sla.delete.sla.confirm.message"));
		if(c){
			var obj = jQuery(this);
			var deletedList = new Array();
			var notfurtherusagelist = new Array();
			var deletedlist = new Array();
			jQuery(".sla-list tr input.sla-id:checked").each(function(){
				var slaid= jQuery(this).attr('id');
				deletedList.push(slaid);				
			});
			var data={};
			data[getCSRFParamName()]=getCSRFParamValue();
			jQuery.ajax({ type: "DELETE", url: "servlet/slaapi/changeSLA?id="+encodeURIComponent(deletedList), data:data}).done(function(data){ //No I18N
				var test = JSON.parse(data) ;
				if(test.status=="Success")
				{					
					obj.prop('disabled',true).delay(1000).queue(function(){// No I18N
						obj.dequeue();
						obj.prop('disabled',true);//No I18N
					});
					var deletedMessage="";
					if(test.changeSLA.notForFurtherUsage != null && test.changeSLA.notForFurtherUsage != "" && test.changeSLA.notForFurtherUsage.length != 0)
					{
						notfurtherusagelist = test.changeSLA.notForFurtherUsage;
						var tablelist = jQuery('#tablelist tbody');// No I18N
						var deletedtablelist = jQuery('#deletedtablelist tbody');// No I18N

						for(var i=0;i<notfurtherusagelist.size();i++)
						{
						    notfurtherusagelist[i] = Number(notfurtherusagelist[i]);
							var id = notfurtherusagelist[i];
							jQuery('#enable_'+id).addClass('common-disable-no-action');
							var copy = jQuery('#trid_'+id);
							jQuery('#trid_'+id).remove();

							deletedtablelist.append(copy);
							jQuery('#enable_'+id).attr('title',getMessageForKey("sdp.admin.listview.notfurtherusage")); //No I18N
							jQuery('#trid_'+id).addClass("disabled").addClass("no-drag");// No I18N
							jQuery('#'+id).prop('checked',false);
							jQuery('#enable_'+id).removeClass('common-enable-icon1').removeClass('common-disable-icon1');
							recalltooltip();

						}
						deletedMessage = getMessageForKey('sdp.change.sla.deleted.message.nofurtherusage',[notfurtherusagelist.toString()]);
					}
					if(test.changeSLA.deleted.size()!=0)
					{    				
						deletedlist = test.changeSLA.deleted;
						for(var i=0;i<deletedlist.size();i++)
						{
							jQuery('#trid_'+deletedlist[i]).remove();
						}
						deletedMessage = getMessageForKey("sdp.change.sla.deleted.success")+" "+deletedMessage;
					}
					if(jQuery('.slalisviewtr').length<=2)
					{
						var tablelist = jQuery('#tablelist tbody');// No I18N
						tablelist.append(jQuery('#slalistview-nosla tbody').html());	
					}
					showalert('success',deletedMessage,'isAutoHide=true');//No I18N
					jQuery('.sla-id').prop('checked',false); // No I18N
					jQuery('#sla-checkall').prop('checked',false); // No I18N
				}
				else
				{
					showalert('failure',getMessageForKey("sdp.change.sla.deleted.failure")+". "+parseErrorMessage(test.message),'isAutoHide=false');//No I18N
					setTimeout(function(){		
						var query = window.location.search; 
					    query += (query.lastIndexOf('&') == query.length-1 ) ? "PORTALID="+PORTALID : "&PORTALID="+PORTALID;	// No I18N
					    window.location.search=query;		
						window.location.reload();
						},3000);

				}					    		
			});
			deletedList= new Array();	
		}
	});

	// Switch Radio
	jQuery('.toggle-pill').toggleSlider({activeClass:'btn-secondary'});// No I18N

	// Fixed table header for sla list
	jQuery(window).on('scroll', function(){
		if(jQuery('.create-sla').length!=0)
		{
			if (jQuery(this).scrollTop() > jQuery('.create-sla').offset().top) {
				jQuery('.sla-fixed-header .h3').addClass('fixed-scroll-div')
				.css({'width':jQuery('.create-sla').width(), 'left': jQuery('.create-sla').offset().left+1});// No I18N
				jQuery('.sla-list').css('margin-top','49px');// No I18N
			}
			else{
				jQuery('.sla-fixed-header .h3').removeClass('fixed-scroll-div').css({'width':'auto', 'left': 0});// No I18N
				jQuery('.sla-list').css('margin-top',0);// No I18N
			}
		}
	});  

	// Select switch for After/Before
	jQuery(document).on('click','.select-switch',function(){// No I18N
		var v1 = jQuery(this).find('select option').eq(0);
		v2 = jQuery(this).find('select option').eq(1);
		if(v1.text()==jQuery(this).find('span').text()){
			jQuery(this).find('span').removeClass('active').attr({'data-val':v2.val(),'title':v2.attr('title')}).text(v2.text()).uitooltip({content:v2.attr('title')});
		}
		else{ jQuery(this).find('span').addClass('active').attr({'data-val':v1.val(),'title':v1.attr('title')}).text(v1.text()).uitooltip({content:v1.attr('title')}); }
	});
	//loading default values

	if(jQuery('#slaID').val()!=undefined) // will invoke for create new and edit page.
	{
		var escalatelist = [];
		var criteriaValueDataList = {};	
		jQuery.ajax({ type: "GET", url: "servlet/slaapi/changeSLA/?get=ChangeSLAConfig"}).done(function(data){ //No I18N
			var defaultValues = JSON.parse(data) ;
			//senthil
			if(defaultValues.status=="Success")
			{
				if(defaultValues.fields!=null)
				{
					if(defaultValues.fields.change_roles!=null)//loading default values of escalate to
					{						
						jQuery.each(defaultValues.fields.change_roles, function(idt,val1){
							var temp ={};
							temp[idt]=val1;
							escalatelist.push(temp);
						});	
					}
					if(defaultValues.fields.condition_fields!=null)//loading default values of condition values.
					{								
						jQuery.each(defaultValues.fields.condition_fields, function(key,val)
								{
							var name="";	
							var datalist=[];							
							jQuery.each(val, function(key,val){
								if(key=="name")
								{
									name = val;									
								}
								else if(key=="values")
								{
									jQuery.each(val, function(key,val)
											{
										datalist.push({"TITLE":val,"VALUE":parseInt(key)}); //No I18N
											});
								}
							});
							if(name!="emergency")
							{
								criteriaValueDataList[name]=datalist;
							}
								});
					}
				}						
				//rendering the custom function div for emergency
				// sourav fix for filterfields update
				criteriaValueDataList.custom_func=function(inputType, currentCell) { currentCell.html(jQuery('#custom_func').html()); };//No I18N

				var jQueryselect = jQuery.find('.escalateto');                        
				jQuery.each(escalatelist, function(key, value) {
					jQuery.each(value, function(key, value) {
						jQuery('<option>').val(key).text(value).appendTo(jQueryselect);
					});
				});

				if(jQuery('.esc-criteria-div .convert-to-select2').length!=0)// No I18N
				{
					jQuery('.esc-criteria-div .convert-to-select2').select2({placeholder: getMessageForKey("sdp.change.sla.select"),closeOnSelect : false});// No I18N
				}
			}
			else
			{
				//Error code :1001 - fetching configuration data from server.
				showalert('failure',parseErrorMessage("1001 :"+data.message),'isAutoHide=false');//No I18N												
			}
		});

		// Filter criteria default values
		var columnDataList = [
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.type"), "TYPE":"multiselect", "VALUE":"type"},// No I18N
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.risk"), "TYPE":"multiselect", "VALUE":"risk"},// No I18N
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.impact"), "TYPE":"multiselect", "VALUE":"impact"},// No I18N
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.category"), "TYPE":"multiselect", "VALUE":"category"},// No I18N
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.services"), "TYPE":"multiselect", "VALUE":"services"},// No I18N
		                      {"TITLE":getMessageForKey("sdp.change.sla.condition.custom_func"), "TYPE":"custom_func", "VALUE":"custom_func"}// No I18N
		                      ];
		//using filter fields , pusing the default valus.
		var count = 0, arr = new Array(), rm_arr = new Array(), rem_val ="";
		jQuery("#criteria-div").filterFields({
			isSortable: false,
			operator: {
				hideOperator: true
			},
			criteria: {
				isSelectable: false,
				dataList: getMessageForKey("sdp.change.sla.condition.is")
			},
			columnData: {
				isSelectablePlaceholder: false,
				dataList: columnDataList,
				useSelect2: false
			},
			criteriaValue: {
				dataList: criteriaValueDataList
			},
			addRowCBFunction: function(newRow){	// Add new row function

				newRow.closest('ol').find('li').removeClass('new_li_row'); //No I18N
				newRow.addClass('new_li_row').closest('ol').find('>li:not(.new_li_row)').each(function(){ //No I18N
					var val = jQuery(this).find('select.columnname').val();
					jQuery('.new_li_row').find('option[value="'+val+'"]').hide().prop('disabled',true); // No I18N
				}); 

				var len = newRow.closest('ol').find('select.columnname').length; //No I18N

				jQuery('#criteria-div').find('.addrowbtn').hide();
				newRow.find('.addrowbtn').show();

				if(len>6){ newRow.remove(); }							

				if(len==6){ jQuery('#criteria-div').find('.addrowbtn').hide(); }								

			}
		});
		// copying the initial escalation from template.

		var ruleli = jQuery("#esc-template").clone();
		var ruleol = jQuery("#esc-criteria-ol");
		ruleol.append(ruleli.html());
		jQuery('.sla-escalation-criteria').find('.remove-sla-esc').hide().end().find('.add-sla-esc').show();
		//events for resolve within

        let slaResolveElements = document.querySelectorAll('[sdpJs="js-event-ChangeSLA-1"]');//No i18N
        	slaResolveElements.forEach(function(el) {
        		el.addEventListener("keypress", function(event) { return allowOnlyNumber(event); });//No i18N
        	});
	}
	//On Change select values, show/hide other criteria values
	var prevValue ='', sel_value ='';

	jQuery(document).on('change', 'select.columnname',function(event) {// No I18N
		var prevValue = jQuery(this).data('previous');// No I18N

		jQuery('select.columnname').not(this).each(function(){
			jQuery(this).find('option[value="'+prevValue+'"]').show().prop('disabled',false); // No I18N
		});
		var sel_value = jQuery(this).val();
		jQuery(this).data('previous',sel_value);// No I18N
		jQuery('select.columnname').not(this).each(function(){
			jQuery(this).find('option[value="'+sel_value+'"]').hide().prop('disabled',true); // No I18N
		}); 
		cur_li_val = sel_value;
	});
	// Remove criteria row and show select values
	jQuery(document).on('click','.removerowbtn',function(){// No I18N
		rem_val = jQuery(this).closest('li').find('select.columnname').val();// No I18N
		jQuery('#criteria-div').find('option[value="'+rem_val+'"]').show().prop('disabled',false); // No I18N

		if(jQuery('#criteria-div').find('select.columnname').length<6){
			jQuery('#criteria-div>li').eq(-1).find('.addrowbtn').show();
		}
	});

	// Save , add & new and Update actions
	jQuery('.sla-save, .sla-update, .sla-save-add').on('click', function(){

		var slaid=null;
		if(jQuery('#slaID').val()!="null")
		{
			slaid = jQuery('#slaID').val();
		}

		var obj = jQuery(this);
		d_val = jQuery('.sla-res-time input[data-res="res-days"]').val();
		h_val = jQuery('.sla-res-time input[data-res="res-hours"]').val();
		
		if(validatePage())
		{
			var inp = getInputDataInJson(slaid);
			var srcurl = "servlet/slaapi/changeSLA"; //No I18N
			var srctype="POST";//No I18N
			if(slaid!=null)
			{
				srcurl = "servlet/slaapi/changeSLA/"+slaid; //No I18N
				srctype="PUT";//No I18N
			}
			var data = {"INPUT_DATA" : Object.toJSON(inp)}; //No I18N
			data[getCSRFParamName()]=getCSRFParamValue();
			jQuery.ajax({
				type: srctype, 
				url: srcurl,
				data : data//No I18N
			}).done(function(data){					
				data = JSON.parse(data) ;
				if(data.status=="Success")
				{
					obj.prop('disabled',true).delay(1000).queue(function(){// No I18N
						obj.dequeue();
						obj.prop('disabled',false);//No I18N
					});						
					showalert('success', getMessageForKey("sdp.change.sla.save.success"), 'isAutoHide=true');//No I18N		
					if(obj.hasClass('sla-save-add')){				
						setTimeout(function(){
							jQuery(location).attr('href',"/ChangeSLA.do?PORTALID="+PORTALID);		//No I18N							
						},500);	
					}
					else
					{
						setTimeout(function(){
							jQuery(location).attr('href',"/ChangeSLAListView.do?PORTALID="+PORTALID);//No I18N						
						},500);
					}
				}
				else 
				{
					alert(getMessageForKey("sdp.change.sla.save.failure")+" "+parseErrorMessage(data.message));//No I18N	
				}				
			});
		}		
	});	
	if(jQuery('#slaID').val()!=null && jQuery('#slaID').val()!="null") 				
	{	
		//Editig the Change SLA details.
		var filterList_container1 = [];
		var slaID = jQuery('#slaID').val();
		jQuery.ajax({ type: "GET", url: "servlet/slaapi/changeSLA/"+encodeURIComponent(slaID), contentType : "application/json"}).done(function(data){ //No I18N
			var output = JSON.parse(data) ;
			if(output.changeSLA!=null && output.status=="Success")
			{	
				//SLA details
				var id=output.changeSLA.id;
				jQuery('#name').val(output.changeSLA.name);
				jQuery('#description').val(output.changeSLA.description);

				if(output.changeSLA.is_deleted)
				{
					jQuery('.sla-status').removeClass('hide');//No I18N
				}
				else
				{
					jQuery('.sla-status').attr('class','hide');//No I18N
				}
				if(output.changeSLA.override_operational_hours)
				{								
					jQuery('#org').prop('checked',false); // No I18N
					jQuery('#cal').prop('checked',true); // No I18N
					jQuery('#execute-hrs').text(jQuery('#cal').parent('label').text()); //No I18N
				}
				else if(!output.changeSLA.override_operational_hours)
				{
					jQuery('#org').prop('checked',true); // No I18N
					jQuery('#cal').prop('checked',false); // No I18N							
					jQuery('#execute-hrs').text(jQuery('#org').parent('label').text()); //No I18N
				}
				if(output.changeSLA.agreed_time!=null)
				{	
					if(output.changeSLA.agreed_time.is_predefined)
					{
						var slarestime = jQuery('.sla-res-time'), slarestimeDay = slarestime.find('input[data-res="res-days"]'), slarestimeHrs = slarestime.find('input[data-res="res-hours"]'),
							res_unit_day = slarestimeDay.attr("data-res-unit"), res_unit_hrs = slarestimeHrs.attr("data-res-unit"), 
							res_plc_day = slarestimeDay.attr("data-res-plc"), res_plc_hrs = slarestimeHrs.attr("data-res-plc"), 
							res_plural_day = slarestimeDay.attr("data-res-plural"), res_plural_hrs = slarestimeHrs.attr("data-res-plural");
						
						jQuery('#yes').prop('checked',true).parent().addClass("btn-secondary");
						jQuery('#no').prop('checked',false).parent().removeClass("btn-secondary");
						jQuery('.sla-res-time').removeClass('disabled-div').find('.form-control').prop('disabled',false);// No I18N
						jQuery('.sla-escalation-criteria').find('.esc-per').hide().end().find('.esc-after').show();
						jQuery('.sla-criteria-head .alert').find('.sla-info-msg2').show().end().find('.sla-info-msg1').hide();
						jQuery('.sla-res-time input[data-res="res-days"]').val(getKeyForResTimeDays(output.changeSLA.agreed_time.days, res_unit_day, res_plc_day, res_plural_day));	// No I18N																								
						jQuery('.sla-res-time input[data-res="res-hours"]').val(getKeyForResTimeHours(output.changeSLA.agreed_time.hours, res_unit_hrs, res_plc_hrs, res_plural_hrs));// No I18N
						
						if(res_plc_day=="false" || res_plc_hrs=="false"){ 
							var agreed_time, 
								resDay = getKeyForResTimeDays(output.changeSLA.agreed_time.days, res_unit_day, res_plc_day, res_plural_day), 
								resHrs = getKeyForResTimeHours(output.changeSLA.agreed_time.hours, res_unit_hrs, res_plc_hrs, res_plural_hrs);

							resDay = resDay.trim();
							resHrs = resHrs.trim();
							(resDay>1 && res_plural_day=="true") ? res_unit_day=res_unit_day+'s' : ''; //No I18N
							(resHrs>1 && res_plural_hrs=="true") ? res_unit_hrs=res_unit_hrs+'s' : ''; //No I18N
							agreed_time = resDay+res_unit_day+" "+resHrs+res_unit_hrs;
						}
						else{
							var agreed_time=getKeyForResTimeDays(output.changeSLA.agreed_time.days, res_unit_day, res_plc_day, res_plural_day)+" "+getKeyForResTimeHours(output.changeSLA.agreed_time.hours, res_unit_hrs, res_plc_hrs, res_plural_hrs);//No I18N
						}

						jQuery('#selected_time').text(agreed_time);//No I18N
					}
					else if(!output.changeSLA.agreed_time.is_predefined)
					{								
						jQuery('#no').prop('checked',true).parent().addClass("btn-secondary");
						jQuery('#yes').prop('checked',false).parent().removeClass("btn-secondary");		
						jQuery('.sla-criteria-head .alert').find('.sla-info-msg2').hide().end().find('.sla-info-msg1').show();
					}
				}					
				//condition section
				if(output.changeSLA.condition!=null)
				{						
					jQuery.each(output.changeSLA.condition, function(key,val)
							{
						if(key=="match" && val!=null)
						{
							if(val=="All")
							{
								jQuery('#all').prop('checked',true).parent().addClass("btn-secondary");
								jQuery('#any').prop('checked',false).parent().removeClass("btn-secondary");
							}
							else
							{
								jQuery('#any').prop('checked',true).parent().addClass("btn-secondary");
								jQuery('#all').prop('checked',false).parent().removeClass("btn-secondary");							 											
							}
						}							
						else if(key=="rules" && val!=null)
						{							
							jQuery.each(val, function(key,val)
									{

								if(val!=null)
								{
									var column = key;
									name = key;
									var criteriaVal= [];

									if(key=="emergency")
									{

										if(!val)
										{
											criteriaVal.push(getMessageForKey("sdp.change.sla.emergency.no")); //No I18N	
										}
										else
										{
											criteriaVal.push(getMessageForKey("sdp.change.sla.emergency.yes")); //No I18N
										}
										filterList_container1.push({operator:"or", column:"custom_func",criteria:"is",criteriaVal:criteriaVal}); //No I18N
									}
									else
									{

										jQuery.each(val, function(key,val)
												{
											criteriaVal.push(val.id);
												});
										filterList_container1.push({operator:"or",column:name,criteria:"is",criteriaVal:criteriaVal}); //No I18N
									}
								}
									});		
							// sourav fix for filterfields update																	
							var customUpdateFunctions = {
								"criteriaValue": { //No I18N
									"custom_func": function(i, v, row) { //No I18N
										row.find(".criteriavaldiv").find(".select-switch span").text(v.criteriaVal);//No I18N
										if(v.criteriaVal === getMessageForKey("sdp.change.sla.emergency.yes")) {
											row.find(".criteriavaldiv").find(".select-switch select option:eq(0)").prop('selected', true);//No I18N
										} else {
											row.find(".criteriavaldiv").find(".select-switch select option:eq(1)").prop('selected', true);//No I18N
										}
									}
								}
							};
							jQuery('#criteria-div').filterFields('update', filterList_container1, customUpdateFunctions);//No I18N	
							// Edit page show/hide criteria select values
							jQuery('#criteria-div>li').each(function(){ //No I18N
								var val = jQuery(this).find('select.columnname').val();
								jQuery('#criteria-div>li').not(this).find('option[value="'+val+'"]').hide().prop('disabled', true); // No I18N
							});							
						}
							});
				}		
				//escalations section.
				if(output.changeSLA.escalations!=null && output.changeSLA.escalations!="")
				{
					var ruleli = jQuery("#esc-template").clone();
					var ruleol = jQuery("#esc-criteria-ol");
					jQuery("#esc-criteria-ol li").remove();		
					var percentage=0;
					var len=1;
					jQuery.each(output.changeSLA.escalations, function(key,notify){

						var notifyids= new Array();
						var ruleid="per_"+key;// No I18N
						var notifyid="notify_"+key;// No I18N
						var liid="liid_"+key;// No I18N
						var escaid="esca_"+key;// No I18N
						var resdays ="resdays_"+key;// No I18N
						var reshours="reshours_"+key;// No I18N
						var selecttime="select_time"+key;// No I18N

						ruleli.find('.sla-escalation-criteria').attr('id',liid);
						percentage=notify.percentage;										
						ruleli.find('.percentage').attr('id',ruleid);											

						ruleli.find('.spanescalate').attr('id',escaid);						
						
						ruleli.find('.selected-time').attr('id',selecttime);
						ruleli.find('input[data-res="res-days"]').attr('id',resdays);
						ruleli.find('input[data-res="res-hours"]').attr('id',reshours);

						ruleli.find('.escalateto').attr('data-id',notifyid);
						var pos=key;
						if(notify.notify_roles != null)
						{
							jQuery.each(notify.notify_roles, function(key,val){
								notifyids[pos] = val.id;
								pos = pos +1;
							});					
						}
						ruleol.append(ruleli.html());
						if(output.changeSLA.agreed_time.is_predefined)
						{
							var slarestimeDay = ruleol.find("input[data-res='res-days']"), slarestimeHrs = ruleol.find("input[data-res='res-days']"),
								res_unit_day = slarestimeDay.attr("data-res-unit"), res_unit_hrs = slarestimeHrs.attr("data-res-unit"), 
								res_plc_day = slarestimeDay.attr("data-res-plc"), res_plc_hrs = slarestimeHrs.attr("data-res-plc"), 
								res_plural_day = slarestimeDay.attr("data-res-plural"), res_plural_hrs = slarestimeHrs.attr("data-res-plural");
							
							var days=0;
							if(notify.days!=undefined)
							{
								days = notify.days
							}
							days = getKeyForResTimeDays(days,res_unit_day,res_plc_day,res_plural_day);
							var hours=0;
							if(notify.days!=undefined)
							{
								hours = notify.hours
							}
							hours = getKeyForResTimeHours(hours,res_unit_hrs,res_plc_hrs,res_plural_hrs);						
							var agreed_time=days+" "+hours;//No I18N													
						}
						jQuery('#'+selecttime).text(agreed_time);
						if(notify.escalate=='After')
						{
							jQuery('#'+escaid).text(getMessageForKey("sdp.change.sla.after"));
							jQuery('#'+escaid).attr('data-val','After');
						}
						else
						{
							jQuery('#'+escaid).text(getMessageForKey("sdp.change.sla.before"));
							jQuery('#'+escaid).attr('data-val','Before');
						}						
						jQuery('#'+resdays).val(days);	// No I18N	
						jQuery('#'+reshours).val(hours);	// No I18N						
						if(percentage!=0)
						{
							jQuery('#'+ruleid).val(percentage);
						}
						jQuery('select[data-id='+notifyid+']').val(notifyids);//No I18N
						notifyids="";
						ruleol.find('#'+liid+' .convert-to-select2').select2({closeOnSelect : false});// No I18N
						if(len==4)
						{									
							jQuery('.sla-escalation-criteria').find('.remove-sla-esc').show().end().find('.add-sla-esc').hide();
						}
						if(len>1)
						{
							jQuery('.sla-escalation-criteria').find('.remove-sla-esc').show();
						}
						len = len +1;
						ruleol.find('input[data-res="res-hours"]').trigger('blur');
					});
				}					
			}
			else
			{
				//Error code :1002 - fetching data from server.
				showalert("error", parseErrorMessage("1002 :"+output.message),'isAutoHide=false');	//No I18N
				setTimeout(function(){
					jQuery(location).attr('href',"/ChangeSLAListView.do?PORTALID="+PORTALID);					
				},3000);
				
			}
		});				
	}
	else
	{
		//Change SLA list view 
		loadChangeSLAListView();
		//All Mail notifications section enabled and disabled section. 
		jQuery.ajax({ type: "GET", url: "servlet/slaapi/changeSLA/?get=escalationsEnabled"}).done(function(data){ //No I18N
			// all mail notification section.
			var defaultValues = JSON.parse(data) ;
			if(defaultValues.status=="Success")
			{
				if(defaultValues.escalationsEnabled)
				{
					jQuery('#allmailnotify').text(getMessageForKey("sdp.change.sla.enabled"));
					jQuery('#allmailnotify').attr("title",getMessageForKey("sdp.change.sla.escalation.disable"));
					jQuery('#allmailnotify').addClass('active');

				}
				else if(!defaultValues.escalationsEnabled)
				{
					jQuery('#allmailnotify').text(getMessageForKey("sdp.change.sla.disabled"));
					jQuery('#allmailnotify').attr("title",getMessageForKey("sdp.change.sla.escalation.enable"));
					jQuery('#allmailnotify').removeClass('active');

				}
			}
			else
			{
				//Error code :1001 - fetching configuration data from server.
				alert(parseErrorMessage("1001 :"+defaultValues.message));//No I18N												
			}
		});

	}
	// to show helpcard
	loadmeadmin();
});

//enabling (or) disabling SLA 
function slaUpdate(sla)
{
	var bolstatus = "true";
	var inp = {"changeSLA": {"is_enabled": true}}; //No I18N
	if(jQuery(sla).attr('data-enable')=="true")
	{  
		bolstatus="false";
		inp = {"changeSLA": {"is_enabled": false}}; //No I18N
	}
	var slaid = jQuery(sla).attr('id');
	var id = slaid.split('status_');

	var data={"INPUT_DATA" : Object.toJSON(inp)}; //No I18N
	data[getCSRFParamName()]=getCSRFParamValue();
	
	jQuery.ajax({
		type: "PUT",//No I18N
		url: "servlet/slaapi/changeSLA/"+encodeURIComponent(id[1]),//No I18N
		data : data//No I18N
	}).done(function(data)
			{
		var evlData = JSON.parse(data) ;
		if(evlData.status=="Success")
		{
			jQuery(sla).attr('data-enable',bolstatus);	//No i18N				
		}
		else
		{
			showalert('failure',parseErrorMessage(evlData.message),'isAutoHide=false') //No I18N
			setTimeout(function(){	
				var query = window.location.search; 
		        query += (query.lastIndexOf('&') == query.length-1 ) ? "PORTALID="+PORTALID : "&PORTALID="+PORTALID;	// No I18N
		        window.location.search=query;				
				window.location.reload();
				},3000);

		}
			});
}
//validating mandatory fields in change sla page.
function validatePage()
{
	var mandatorybol=true;
	var fieldToFocus = undefined;
	// name
	var name = jQuery('.sla-name input[type="text"]').val().trim();
	if(name == '')
	{
		jQuery('.sla-name input[type="text"]').parent().addClass('has-error');
		mandatorybol=false;
		if(!fieldToFocus)
		{
			fieldToFocus = jQuery('.sla-name input[type="text"]');
		}
	}
	else
	{
		jQuery('.sla-name input[type="text"]').parent().removeClass('has-error');
	}
	
	
	// condition fields
	jQuery('.filterwrapper li').each(function(){
		var v = jQuery(this).find('.columnnamediv select'); //No I18N
		m = jQuery(this).find('.criteriavaldiv select'); //No I18N		 
		if((v.val()!=null)&&(m.val()==null)){
			jQuery(this).find('.criteriavaldiv').addClass('has-error').find('.select2-container-multi').addClass('form-control');//No I18N
			mandatorybol=false;
			if(!fieldToFocus)
			{
				fieldToFocus = jQuery(this).find('.select2-input');
			}
		}
		else
		{
			jQuery(this).find('.criteriavaldiv').removeClass('has-error').find('.select2-container-multi').removeClass('form-control');//No I18N
		}
	});
	
	// resolution time
	var dueDefined = jQuery('.enable-res-time input:checked').val() =='yes';	//No I18N
	var res_day = 0, res_hour = 0;
	if(jQuery('#res_day').val()!="")
	{
		res_day = parseInt(jQuery('#res_day').val().split(' ')[0]); //No I18N
		if(isNaN(res_day) || res_day == "" || res_day == null)
		{
			res_day = 0;
		}
	}
	if(jQuery('#res_hour').val()!="")
	{
		res_hour = parseInt(jQuery('#res_hour').val().split(' ')[0]); //No I18N
		if(isNaN(res_hour) || res_hour == "" || res_hour == null)
		{
			res_hour = 0;
		}
	}
	if(dueDefined && res_hour == 0 && res_day == 0)
	{
		jQuery('.sla-res-time .res-time').parent().addClass('has-error');
		mandatorybol = false;
		if(!fieldToFocus)
		{
			fieldToFocus = jQuery('.sla-res-time .res-time');
		}
	}
	else
	{
		jQuery('.sla-res-time .res-time').parent().removeClass('has-error');
	}
	
	// escalations
	cd = jQuery('.esc-criteria-div>li');
	
	if(!dueDefined){ // if Escalation is percentage, show select
		cd.each(function(){
			var v = jQuery(this).find('.esc-per select');//No I18N
			m = jQuery(this).find('select.convert-to-select2');//No I18N

			if((v.val()!=null)&&(m.val()==null)){
				jQuery(this).find('div.convert-to-select2').parent().addClass('has-error');	//No I18N
				mandatorybol=false;
				if(!fieldToFocus)
				{
					fieldToFocus = jQuery(this).find('div.convert-to-select2').parent();
				}
			}
			else if((v.val()==null)&&(m.val()!=null)){
				jQuery(this).find('.esc-per select').parent().addClass('has-error');//No I18N
				mandatorybol=false;
				if(!fieldToFocus)
				{
					fieldToFocus = jQuery(this).find('.esc-per select').parent()
				}
			}
			else{
				jQuery(this).find('.esc-per select').parent().removeClass('has-error');//No I18N
				jQuery(this).find('div.convert-to-select2').parent().removeClass('has-error');//No I18N
			}						
		});
	}
	else{
		cd.each(function(){
			var d_val2 = jQuery(this).find('input[data-res="res-days"]').val();//No I18N
			var h_val2 = jQuery(this).find('input[data-res="res-hours"]').val();//No I18N

			v = (d_val2!='')||(h_val2!='');
			m = jQuery(this).find('select.convert-to-select2');//No I18N

			if((v==true)&&(m.val()==null)){
				jQuery(this).find('div.convert-to-select2').parent().addClass('has-error');	//No I18N
				mandatorybol=false;
				if(!fieldToFocus)
				{
					fieldToFocus = jQuery(this).find('div.convert-to-select2').parent();
				}
			}
			else if((v==false)&&(m.val()!=null)){
				jQuery(this).find('.res-time').parent().addClass('has-error');//No I18N
				mandatorybol=false;
				if(!fieldToFocus)
				{
					fieldToFocus = jQuery(this).find('.res-time').parent();
				}
			}
			else{
				jQuery(this).find('.res-time').parent().removeClass('has-error');	//No I18N
				jQuery(this).find('div.convert-to-select2').parent().removeClass('has-error');//No I18N
			}			
		});
	}
	if(fieldToFocus)
	{
		setTimeout(function (){jQuery(fieldToFocus).attr('tabindex',-1).trigger('focus');}, 500);
	}
	if(!mandatorybol)
	{
		alert(getMessageForKey("sdp.change.sla.red.focus.fields"));
	}

	return mandatorybol;
}
//updating the all mail enabled or disbale.
function updateNotifyMail()
{
	var escalationsEnabled=true;
	if(jQuery('#allmailnotify').text()==getMessageForKey("sdp.change.sla.enabled"))//No I18n
	{
		escalationsEnabled=false;
	}
	var data={};
	data[getCSRFParamName()]=getCSRFParamValue();
	jQuery.ajax({
		type: "PUT",//No I18N
		url: "servlet/slaapi?escalationsEnabled="+encodeURIComponent(escalationsEnabled),//No I18N
		data: data
	}).done(function(data)
			{
		var evlData = JSON.parse(data) ;
		if(evlData.status=="Success")
		{
			if(escalationsEnabled)
			{
				showalert('success',getMessageForKey("sdp.change.sla.all.mail.escalations.success"),'isAutoHide=true');// No I18N
			}
			else 
			{
				showalert('success',getMessageForKey("sdp.change.sla.all.mail.escalations.disabled"),'isAutoHide=true');// No I18N
			}
		}
		else
		{
			alert(getMessageForKey("sdp.change.sla.all.mail.escalations.failure")+" "+parseErrorMessage(evlData.message));
		}
			});
}
function recalltooltip(){ // Call uitooltip function for SLA list icons
	jQuery('.slastatus>img').uitooltip({
		content: function(){
			var element = jQuery(this);
			return element.attr('title')
		},
		position: {
			my: "center top+5",// No I18N
			at: "center bottom"// No I18N
		},
		show: {
			effect: 'none',// No I18N
			delay: 10
		},hide: {
			effect: 'none',// No I18N
			delay: 10
		}
	});
}

//parse the error message and return according to the function.
function parseErrorMessage(message)
{
	if(message.indexOf("UNIQUE_ERROR")!=-1)
	{
		message = getMessageForKey("sdp.change.sla.unique.error");
	}
	else if(message.indexOf("ID_ERROR")!=-1)
	{
		message = getMessageForKey("sdp.change.sla.id.error");
	}
	else //DATA_ERROR or some other error
	{		
		if(message.indexOf("1001")!=-1)//if fetching error in change sla configuration data
			{
				message = getMessageForKey("sdp.change.sla.fetching.configuration.data.error");
			}
		else if(message.indexOf("1002")!=-1) // if fetching error in change sla details.
			{
				message = getMessageForKey("sdp.change.sla.fetching.data.error");
			}
		else// exception in updating change sla details.
			{
				message = getMessageForKey("sdp.change.sla.updating.data.error");
			}
	}
	return message;
}
function reloadListView()
{
	jQuery('#tablelist .slalisviewtr').remove();
	jQuery('#deletedtablelist .slalisviewtr').remove();
	loadChangeSLAListView();		
	recalltooltip();
}
function loadChangeSLAListView()
{
	jQuery.ajax({
		type: "GET", //No I18N
		url: "servlet/slaapi/changeSLA/", //No I18N
		contentType : "application/json" //No I18N
	}).done(function(data){
		var output = JSON.parse(data) ;
		if(output.status=="Success")
		{
			var tablelist = jQuery('#tablelist tbody');// No I18N
			var deletedtablelist =jQuery('#deletedtablelist tbody');// No I18N
			var tmp_tr =jQuery('#slalistview-template tbody'); //No I18N
			if(output.changeSLA.size()==0)
			{
				tablelist.append(jQuery('#slalistview-nosla tbody').html());
			}
			if(!output.changeSLA.size()==0)
			{    					
				jQuery.each(output.changeSLA, function(key,sla){
					//SLA Details
					var id=sla.id;
					var name=sla.name;
					var is_enabled = sla.is_enabled;
					var is_deleted=sla.is_deleted;
					var agreed_time=getMessageForKey("sdp.change.sla.agreedtime.notavailble");
					var criteria=getMessageForKey("sdp.change.sla.criteria.notdefinied");
					var res_day_param = jQuery("#res-day-param"), res_hrs_param = jQuery("#res-hrs-param"),
						res_unit_day = res_day_param.attr("data-res-unit"), res_unit_hrs = res_hrs_param.attr("data-res-unit"), 
						res_plc_day = res_day_param.attr("data-res-plc"), res_plc_hrs = res_hrs_param.attr("data-res-plc"), 
						res_plural_day = res_day_param.attr("data-res-plural"), res_plural_hrs = res_hrs_param.attr("data-res-plural");

					if(id!=null)
					{
						tmp_tr.find('.sla-id').attr('id',id);
						tmp_tr.find('.sla-name').attr('id',"name_"+id);
						tmp_tr.find('.sla-name').attr('href',"ChangeSLA.do?id="+id);						
						tmp_tr.find('.slastatus').attr('id',"status_"+id);
						tmp_tr.find('.common-enable-icon1').attr('id',"enable_"+id);
						tmp_tr.find('.slalisviewtr').attr('id','trid_'+id);									
					}
					//Resolution Time.
					if(sla.agreed_time!=null)
					{							
						var days=0;	
						var hours=0;								
						if(sla.agreed_time.days!=null)
						{
							days=sla.agreed_time.days;
						}
						if(sla.agreed_time.hours!=null)
						{
							hours=sla.agreed_time.hours;
						}
						if(days!=0 || hours!=0)
						{	
							agreed_time = getKeyForResTimeDays(days, res_unit_day, res_plc_day, res_plural_day)+" "+getKeyForResTimeHours(hours, res_unit_hrs, res_plc_hrs, res_plural_hrs); //No I18N
						}
					}	
					// criteria section.
					if(sla.condition!=null)
					{
						var criteriamatch=getMessageForKey("sdp.change.sla.listview.criteria.or.text");
						if(sla.condition.match=="All")
							{
								criteriamatch=getMessageForKey("sdp.change.sla.listview.criteria.and.text");
							}
						if(sla.condition.rules!=null)
						{										
							jQuery.each(sla.condition.rules, function(key,escalateval)
									{
								var rule = [];
								var name;
								name = '"'+key+'"'; //No I18N
								if(key=="emergency")									
								{
									if(escalateval)
									{
										rule.push('"'+getMessageForKey("sdp.change.sla.emergency.yes")+'"'); //No I18N
									}
									else
									{
										rule.push('"'+getMessageForKey("sdp.change.sla.emergency.no")+'"'); //No I18N
									}
								}
								else
								{
									jQuery.each(escalateval, function(key,val)
											{
										if(val!=null)
										{
											rule.push('"'+val.name+'"'); //No I18N
										}
											});
								}
								if(key=="emergency")
								{
									key="custom_func"; //NO I18N
								}
								//criteria name should be in i18n, So , contact the json key with 'sdp.change.sla.condition' and get values via getMessageforKey method.  
								name = getMessageForKey("sdp.change.sla.condition."+key);
								if(criteria==getMessageForKey("sdp.change.sla.criteria.notdefinied"))
								{
									criteria = name +" "+getMessageForKey("sdp.change.sla.condition.is")+" "+encodeHTML(rule);//No I18N
								}
								else
								{
									criteria = criteria +" "+criteriamatch+" "+ name +' '+getMessageForKey("sdp.change.sla.condition.is")+' '+encodeHTML(rule);//No I18N
								}
									});
						}																
					}												
					tmp_tr.find('.sla-name').html('<b>'+ encodeHTML(name)+'</b>');
					
					tmp_tr.find('.criteria').html('<br><b>'+getMessageForKey("sdp.change.sla.listview.criteria.info")+': </b>'+criteria+'<br><b>'+getMessageForKey("sdp.change.sla.listview.resolutiontime.info")+': </b>'+agreed_time);//No I18N
					
					tmp_tr.find('.slastatus').attr('data-enable',is_enabled);
					if(is_deleted)
					{
						deletedtablelist.append(tmp_tr.html());						
					}
					else
					{
						tablelist.append(tmp_tr.html());
					}
					if(!is_enabled)
					{							
						jQuery('#trid_'+id).addClass("disabled");// No I18N							
						jQuery('#enable_'+id).removeClass('common-enable-icon1').addClass('common-disable-icon1');
						jQuery('#enable_'+id).attr('title',getMessageForKey("sdp.change.enable.sla"));
					}
					else
					{
						jQuery('#trid_'+id).removeClass("disabled");// No I18N
						jQuery('#enable_'+id).removeClass('common-disable-icon1').addClass('common-enable-icon1');
						jQuery('#enable_'+id).attr('title',getMessageForKey("sdp.change.disable.sla"));

					}
					if(is_deleted)
					{
						jQuery('#enable_'+id).attr('title',getMessageForKey("sdp.admin.listview.notfurtherusage")); //No I18N
						jQuery('#trid_'+id).addClass("disabled").addClass("no-drag");// No I18N
						jQuery('#enable_'+id).addClass('common-disable-no-action');
						jQuery('#enable_'+id).removeClass('common-enable-icon1').removeClass('common-disable-icon1');
					}					
				});

				//Adding event listeners for listview
				var elements = document.querySelectorAll('[sdpJs="js-event-ChangeSLAListView-2"]');//No i18N
            elements.forEach(function(el) {
                el.addEventListener("click", function(event) {//No i18N
                    slaUpdate(this);
                });
            });

				recalltooltip();
			}
		}
		else
		{
			//Error code :1002 - fetching data from server. 
			showalert('failure',parseErrorMessage("1002 :"+output.message),'isAutoHide=false');//No I18N												
		}
	});	
}
