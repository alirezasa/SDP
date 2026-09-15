/* $Id$ */
//udf fields count modified for change module, text: 100, numeric: 50, date: 50
var udfTextNamesArray = [];
var udfNumericNamesArray = [];
var udfDateNamesArray = [];
for(var i = 100 ; i>=1 ; i--)
{
  udfTextNamesArray.push("UDF_CHAR" + i) ;
  (i<=50) && udfNumericNamesArray.push("UDF_LONG" + i) ;
  (i<=50) && udfDateNamesArray.push("UDF_DATE" + i) ;
}

 UDFS = {
    /* noText:100,
    noNumeric: 50, 
    noDate: 50, */
    udfTextNames: udfTextNamesArray ,
    udfNumericNames: udfNumericNamesArray,
    udfDateNames: udfDateNamesArray,
    udfDecimalNames: [],//Adding double values //No i18N
    listHash: {}
}       


var ChangeTemplate_lastCategory = undefined;
 // ChangeTemplate_lastCategory is initialised in ChangetemplateDetailsView.jsp after Canvas.init() method is called.
var Change_Canvas = {
__dacName: "FormDAC", // No I18N
	siteCm: undefined,
	categoryCm : undefined,
	stagestatusList : undefined,
	isRetrospective: false,
copyAssetDetails: function(list,fromlist,tolist){
			jQuery(tolist).find('option').remove().end();
			copyListValuesFromTo(fromlist,tolist);
            var listVals = {};
            var opt;
			if(list.options.length != 0)
			{
            for(var i=0; i< list.options.length; i++ ) {
                opt = list.options[i];
				if(opt && (opt.innerText!="Choose from list") ) {
				    listVals[opt.value] = opt.innerText;  //.push(opt.innerHTML);
                    Canvas.viewObjects.ASSETID.DEFAULTVALUE = listVals;
                }
				else
				{
					Canvas.viewObjects.ASSETID.DEFAULTVALUE = undefined;
				}
            }
			}
			else
			{
				Canvas.viewObjects.ASSETID.DEFAULTVALUE = undefined;
			}
        },
        addServiceDetails: function(form) {
            var listVals = {};
            //var list = form['SERVICE'];//No I18N
			var list = jQuery("input[name='SERVICE']:visible");
			var opt;
            var selBox = $A($('_ev'+Canvas.viewObjects.SERVICEID.INDEX_NO).getElementsByTagName('SELECT')).first();
            selBox.options.length = 0;
			
			for(var i=0; i< list.length; i++ ) {
                if(list[i].checked)
                {
                    opt = list[i];
                }
                else
                {
					continue;
                }
			    if(opt && opt.getAttribute("text")) {
					var optText = opt.getAttribute("text");
				    listVals[opt.value] = optText;  //.push(opt.innerHTML);
					selBox.options[selBox.options.length] = new Option(optText, opt.value);
			
                    Canvas.viewObjects.SERVICEID.DEFAULTVALUE = listVals;
                }
			}
			//code for reseting empty value
			if(!opt)
			{
				Canvas.viewObjects.SERVICEID.DEFAULTVALUE = undefined;
			}
            window.closeDialog();
        },
                          //function to set defualt values chosen for the ci field in the select element.
                                       loadChosenCIValue: function(sel) {
                                       var listVals = {};
                                       var list = sel.options;
                                       for(var i=0;i<list.length;i++){
                                           listVals[list[i].value] = list[i].text;
                                       }
                                       Canvas.viewObjects.CIID.DEFAULTVALUE = listVals;
                                   },
        loadChosenAssetValue: function(sel) {
            var listVals = {};
            var list = sel.options;
            for(var i=0;i<list.length;i++){
                listVals[list[i].value] = list[i].text;
            }
            Canvas.viewObjects.ASSETID.DEFAULTVALUE = listVals;
        },
        showAssoicateCIList : function(){
            let jQBody = jQuery("body"); // NO I18N
            if (!jQBody.find("#ci-association-container").length) {// NO I18N
                jQBody.append('<div id="ci-association-container"></div>'); // NO I18N
            }
            assetsObj.loadAttachCIPopup('changes','configuration_items','ci-association-container','500');//No I18N
        },
		populateStatusList: function(childListName, parentId ) {
        var childBox =  $A($('_ev'+Canvas.viewObjects[childListName].INDEX_NO).getElementsByTagName('SELECT')).first(); // No I18N
        var childValue = Canvas.viewObjects[childListName].DEFAULTVALUE;
        var defaultOption = childBox.options[0];
        childBox.options.length = 0;
		if(parentId == undefined || parentId == "0")
		{
			childBox.options[0] = new Option("-- Select Status --",0);
		}
		else
		{
			//"--select status--" option no populated
        var str = null;
        str = Change_Canvas.stagestatusList.list[parentId];
        for(var i=0; ( str && str[i] ); i++) {
            key = str[i];
            value = Canvas.statusID_Name.list[key];;
            if(childValue == key) {
                childBox.options[childBox.options.length] = new Option(value, key, true, true);
                childBox.options[childBox.options.length-1].title =  value;
            }
            else {
                childBox.options[childBox.options.length] = new Option(value, key);
                childBox.options[childBox.options.length-1].title =  value;
            }
        }
		//If modified workflow has status in template, retain the status, else check if the stage is defaultStage then set default status.
		if(Change_Canvas.stagestatusList.list && Change_Canvas.stagestatusList.list[parentId] && Change_Canvas.stagestatusList.list[parentId].contains(Canvas.viewObjects.WFSTATUSID.DEFAULTVALUE)){
			jQ(childBox).val(Canvas.viewObjects.WFSTATUSID.DEFAULTVALUE);
		}
		else if(parentId == Change_Canvas.defaultStageStatus.stage.id){
			jQ(childBox).val(Change_Canvas.defaultStageStatus.id);
		}
		//Update status value in Canvas object
		Canvas.viewObjects.WFSTATUSID.DEFAULTVALUE = jQ(childBox).val();

		}
    },
populateCMListFromArray: function(childListName) {
	
	var siteEle = $A($('_ev'+Canvas.viewObjects.CATEGORYID.INDEX_NO).getElementsByTagName('SELECT')).first();// No I18N
	//if CM field is not there in the template, update ChangeTemplate_lastCategory and return
	if($('_ev'+Canvas.viewObjects[childListName].INDEX_NO) == null)
	{
		// update ChangeTemplate_lastCategory variable before returning
		ChangeTemplate_lastCategory = siteEle.value;
		return;	
	}
	//only if CM field is present, proceed further
 var childBox =  $A($('_ev'+Canvas.viewObjects[childListName].INDEX_NO).getElementsByTagName('SELECT')).first(); // No I18N
 var defaultOption = childBox.options[0].text;
 var oldCm = childBox.value;
 childBox.options.length = 0;
	var cmid = undefined;
	if(Change_Canvas.categoryCm.list[siteEle.value] != undefined)
	{
		cmid = Change_Canvas.categoryCm.list[siteEle.value];
	}
	if(Change_Canvas.categoryCm.list[siteEle.value] == undefined)
	{
		cmid ='0';
	}
		//var selected = Canvas.viewObjects.CHANGEMANAGERID.LISTVALUES[cmid];
		 var list = $(document.getElementById("changemanager_FL")).getElementsByTagName('SELECT')[0];
		 var j=1;
		
		 //add option 0 as --Select Change Manager--
		childBox.options[0] = new Option(defaultOption,"0");
		/* if(cmid == undefined)
		 {
			 childBox.options[0] = new Option(defaultOption,"0");
			 j=1;
		 }*/
		
		 //add all change managers to the childbox options
		 for(var i=0; i<list.options.length; i++)
		 {
			 var opt = list.options[i];
			 if(opt.value != "0")
			 {
				 childBox.options[j] = new Option(opt.innerHTML,opt.value);
				 j++;
				 /*
				 if(cmid == undefined)
				 {
					 if(childBox.options[j].value == oldCm)
					 {
						 childBox.options[j].selected = true; 
					 }
				 }
				 else
				 {
					 if(opt.value == cmid)
					 {
						 childBox.options[j].selected = true;
						 Canvas.viewObjects["CHANGEMANAGERID"].DEFAULTVALUE=opt.value;
					 }
					 else
					 {
					 }
				 }
				  */
			 }
		 }
		 	/*
			 * if the change manager is not selected, set default change Manager for selected category.
			 * if some change manager has been selected,
			 * 		check if the current CM is the default CM for the previously selected category.
			 * 		if it is not the default CM, do not change the CM value.
			 * 		if it is the default CM, change CM to the default CM of newly selected category
			 * Issue id : 57242.
			 */
		 	/*
			 * This fix will result in a behaviour in which - if some change manager is selected and then a category that is mapped with the selected CM
			 * is selected by the user and then if some other category is selected, CM will be set to the newly selected category's default CM
			 */
		 childBox.value = oldCm;
		 //if CM is not selected, set new CM
		 if(oldCm == 0)
			{
				childBox.value=cmid;
				Canvas.viewObjects.CHANGEMANAGERID.DEFAULTVALUE=cmid;
			}
		 //if some CM is selected previously
			else
			{
				//check for mapping between previous category and previous CM : if mapping exists, apply the new CM
				if(Change_Canvas.categoryCm.list[ChangeTemplate_lastCategory] == oldCm)
				{
					childBox.value = cmid;
					Canvas.viewObjects.CHANGEMANAGERID.DEFAULTVALUE=cmid;
				}
				// if mapping does not exist, leave CM as such.
			}
		 	// update ChangeTemplate_lastCategory variable
			ChangeTemplate_lastCategory = siteEle.value;
			
},
change_populateChild: function(elm, id){
        //console.debug("element ", elm); //console.debug("id ",id);
        var viewName = $(id).getAttribute('viewname');
        if(viewName == 'CATEGORYID') {
        //default operation when category selected is handled from formlayout.js
		Rules.populateChild(elm, id);
		if(Canvas.viewObjects.CHANGEMANAGERID.DEFAULTVALUE == undefined)
		{
			Canvas.viewObjects.CHANGEMANAGERID.DEFAULTVALUE = '0';
		}
            	this.populateCMListFromArray('CHANGEMANAGERID');//No I18N
        }

        //changewf started
		else if(viewName == 'WFSTAGEID'){
			if(elm == "onload")
			{
				this.populateStatusList('WFSTATUSID', Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE);//NO I18N
			}
			else
			{
				this.populateStatusList('WFSTATUSID', elm.value);//NO I18N
			}
		}
                //SITE-GROUP-TECHNICIAN inter-relations in request template form.
                else if(viewName == 'SITEID') { //No I18N
                    Canvas.viewObjects.GROUPID.DEFAULTVALUE = '0';   //No I18N
                    // re-set default value
                    Canvas.viewObjects.TECHNICIANID.DEFAULTVALUE = '0';   //No I18N
                    // re-set default value
                    if(checkIfMSP()) {
                    	Canvas.viewObjects.CHANGEMANAGERID.DEFAULTVALUE = '0';   //No I18N
                    }
                    //start for group -- changing the group value on changing the site.
                    if(Canvas.viewNames.include('GROUPID')) { //No I18N
                      if(!checkIfMSP() || elm.value!=0){
                    	Rules.populateList('GROUPID', elm.value, Canvas.sitGrp.getSiteGroups, Canvas.sitGrp);//No I18N
                      }
                    }
                    if(Canvas.viewNames.include('TECHNICIANID')) {//No I18N
                      if(!checkIfMSP() || elm.value!=0){
                        Rules.populateListFromArray('TECHNICIANID', elm.value, "Site");//No I18N
                      }
                    }
                    if(checkIfMSP()) {
                    	if(Canvas.viewNames.include('CHANGEMANAGERID')){//No I18N
                    		getMSPChangeManagers(elm.value);
                    	}
                    	if(elm.value==0 && (Canvas.viewNames.include('GROUPID') || Canvas.viewNames.include('TECHNICIANID'))){//No I18N
							var options = new Array ("group","technician");//No I18N
							removeOptionsInChangeTemplate(options);
                    	}
                    }
                }
                else if(viewName == 'GROUPID') {
                    //this.populateTechList(elm.value);
                    Canvas.viewObjects.TECHNICIANID.DEFAULTVALUE = '0';              // re-set default value//No i18N
                    if(Canvas.viewNames.include('TECHNICIANID')) {
                        if(elm.value=='0' && Canvas.viewObjects.SITEID != null){
                            var siteId = Canvas.viewObjects['SITEID'].DEFAULTVALUE;
                            Rules.populateListFromArray('TECHNICIANID', siteId, "Site");//No I18N
                        }
                        else {
                            Rules.populateListFromArray('TECHNICIANID', elm.value ); // No I18N
                        }
                    }
                }
                //End for group                
},
 setMandatory: function(event) {
        if (jQuery("#changetemp-tab-roles").css("display") != "none") {
            setPropertyForRoles(this);
        } else {
            Canvas.Element.setProperty(this, event.target.name);
      }
 },
addServiceView: function(dragObj)
{
if(dragObj.id != 'AVTEXT')
        {
            
            //To get the selected values in the dialog box
			var doc=jQuery('#service_view');
            var table=doc.find("#ServicesListTable")[0];
            var length=Object.values(Canvas.viewObjects.SERVICEID.DEFAULTVALUE).length;
            for(var i=0,row;row=table.rows[i];i++){
            	input=row.getElementsByTagName("input");
            	var isPresent=false;
            	for(var j=0;j<length;j++){
            		if(input.SERVICE.getAttribute("text")==Object.values(Canvas.viewObjects.SERVICEID.DEFAULTVALUE)[j]){
                		doc.find("#ServicesListTable")[0].rows[i].getElementsByTagName("input").SERVICE.setAttribute("checked","true");
                		isPresent=true;
                		break;
                	}
            	}
            	if(!isPresent){
            		doc.find("#ServicesListTable")[0].rows[i].getElementsByTagName("input").SERVICE.removeAttribute("checked");
            	}
            }
            
            
            var html = doc[0].innerHTML;
            html = html.replace(/\@@@/g, '');//No I18N
            var left = parseInt((document.body.clientWidth - 415) / 2);
            var top = 120;
            var title = "Service Affected";//No I18N
            window.showDialog(html, 'position=middle,width=250,height=150, left='+left+', top='+top+', modal=yes, title='+title+', closeButton=yes, closeOnEscKey=no',()=>{//No i18N
            document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-Change_DummyContent-41"]').addEventListener("click", function(event) { Change_Canvas.addServiceDetails(this.form) });//No i18N
            document.querySelector('#_DIALOG_CONTENT [sdpJs="js-event-Change_DummyContent-42"]').addEventListener("click", function(event) { window.closeDialog() });//No i18N
            });
            this.addingField = true;
            
        }
},
applyChangeFieldProperties: function() {
                            var vn = Canvas.viewObjects.SERVICEID;
							 if(vn && vn.DEFAULTVALUE) {
							 if(vn.VIEWID == 'SERVICEID' && vn.INDEX_NO >= 0)
                                 {
                                     var def = vn.DEFAULTVALUE;
                                     var keys = $H(Canvas.viewObjects.SERVICEID.DEFAULTVALUE).keys();
                                     var values = $H(Canvas.viewObjects.SERVICEID.DEFAULTVALUE).values();
                                     var list = $('_ev'+vn.INDEX_NO).getElementsByTagName('SELECT')[0];//No I18N
                                     for(var i=0;i<keys.length;i++)
                                     {
                                         list.options[i] = new Option(values[i],keys[i]);
                                     }

                                 }
								 }
								vn = Canvas.viewObjects.ASSETID;
								if(vn && vn.DEFAULTVALUE) {
                                 if(vn.VIEWID == 'ASSETID' && vn.INDEX_NO >= 0)
                                 {
                                     var def = vn.DEFAULTVALUE;
                                     var keys = $H(Canvas.viewObjects.ASSETID.DEFAULTVALUE).keys();
                                     var values = $H(Canvas.viewObjects.ASSETID.DEFAULTVALUE).values();
                                     var list = $('_ev'+vn.INDEX_NO).getElementsByTagName('SELECT')[0];//No I18N
                                     for(var i=0;i<keys.length;i++)
                                     {
                                         list.options[i] = new Option(values[i],keys[i]);
                                     }

                                 }
								 }
								 vn = Canvas.viewObjects.CIID;
                                                                   if (vn && vn.DEFAULTVALUE) {
                                                                     if (vn.VIEWID == 'CIID' && vn.INDEX_NO >= 0) {
                                                                       var def = vn.DEFAULTVALUE;
                                                                       var keys = $H(Canvas.viewObjects.CIID.DEFAULTVALUE).keys();
                                                                       var values = $H(Canvas.viewObjects.CIID.DEFAULTVALUE).values();
                                                                       var list = $('_ev' + vn.INDEX_NO).getElementsByTagName('SELECT')[0]; //No I18N
                                                                       for (var i = 0; i < keys.length; i++) {
                                                                         list.options[i] = new Option(values[i], keys[i]);
                                                                       }
                                                                     }
                                                                   }
								 if(Change_Canvas.allowedStages){
									this.populateStagesList();
								 }
								//fix for : all status options appear alltogether when canvas is redrawn
								this.populateStatusList('WFSTATUSID', Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE); //no i18n
								},
showChangePropertySheet: function(obj, caller) {
            if(Canvas.user == "Technician") {
                //console.debug("showPropertySheet called ", obj);
                //obj = $(obj);
                $('propertyID').value = obj;        //obj.getAttribute('viewName');//No I18N
                var vname = $(obj).getAttribute('viewName');
                var field = Canvas.viewObjects[vname];
                var dimensions = (caller != null) ? FormDragDrop.getElementPosition(caller) : FormDragDrop.getElementPosition(obj);
                var ps = $('PropertySheet_PH');//No I18N
                ps.style.top  = dimensions.bottom+"px";
                ps.style.left = dimensions.left+"px";
                var cboxes = $A($('PropertySheet_PH').getElementsByTagName('input')).findAll(function(item){return item.type == 'checkbox'});//No I18N
                cboxes.each(function(cb){ cb.checked = field[cb.name];});
                cboxes = null;
                ps.show();
            }
        },
		populateStagesList: function(){
			//Clearing the previous stage data
			let stageEle = jQ("#WFSTAGEID").empty(); //No I18N
			if(Change_Canvas.allowedStages){
				Change_Canvas.allowedStages.forEach(stages => {
					let option = (stages.id == Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE) ? jQ("<option selected>") : jQ("<option>");
					let optionTag = option.attr("value", stages.id).text(e_html(stages.name));
					stageEle.append(optionTag);
				});
			}
			//Check whether the modified workflow has old template's stage and status
			//1. If stage and status present in modified workflow, then retain the same stage and status
			//2. If modified workflow doesn't has stage and status present in template, then reset to Default Stage/status - Submission/Requested

			if(!Change_Canvas.stagestatusList.list.hasOwnProperty(Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE)){
				Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE = Change_Canvas.defaultStageStatus.stage.id;
				Canvas.viewObjects.WFSTATUSID.DEFAULTVALUE = Change_Canvas.defaultStageStatus.id;
			}

			stageEle.val(Canvas.viewObjects.WFSTAGEID.DEFAULTVALUE).trigger("change");

		},
		onWorkflowChange: function(ele){
			let wfId = jQuery(ele.currentTarget).val();
			this.renderStageStatusBasedonWorkflow(wfId);
		},
		renderStageStatusBasedonWorkflow: function(wfId){
			let input_data;
			if(parseInt(wfId)){
				input_data = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":100},"workflow_id":wfId});//No I18N
			}else{
				input_data = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":100}});//No I18N
			}
			let getStages = new Promise(function(resolve, reject){
				sdpAjax({
					url: "/api/v3/changes/stage",//No I18N
					data: input_data,
					success: function(resp){
						if(resp.response_status && resp.response_status.status == "success"){
							Change_Canvas.allowedStages = resp.stage;
							resolve(resp);
						}else{
							reject();
						}
					}
				});
			});
			let getStatus = new Promise(function(resolve, reject){
				return sdpAjax({
					url: "/api/v3/changes/status",//No I18N
					data: input_data,
					success: function(resp){
						if(resp.response_status && resp.response_status.status == "success"){
							Change_Canvas.allowedStatuses = resp.status;
							resolve(resp);
						}else{
							reject();
						}
					}
				});
			});
			let promise = [];
			Promise.all([getStages, getStatus]).then(function(results){
				let modelData={}, defaultValue = 0;
				modelData[defaultValue] = [];
				Change_Canvas.allowedStatuses.forEach(status => {
					modelData[defaultValue].push(status.id);
					if(!modelData[status.stage.id]){
						modelData[status.stage.id] = [];
					}
					modelData[status.stage.id].push(status.id);
					//Get Default stage/status id
					if(status.internal_name === "Requested" && status.stage.internal_name === "Submission"){
						Change_Canvas.defaultStageStatus = status;
					}

				});
				Change_Canvas.stagestatusList.list = modelData;
				Change_Canvas.populateStagesList();
			});

		}

}
