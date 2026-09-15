/* $Id$ */
//method to call organizeSLA Window
function OpenOrganizeWindow(url, title, h, w, y, pos)
{
  url = url + "&siteID="+encodeURIComponent(document.SLADefAction.LOCATION.value); // No I18N
  NewWindow(url, title, h, w, y, pos);
}

//method used to sort the Array of object
var sorting=function(a, b) {
                var valueA=a.value.toLowerCase();
                var valueB=b.value.toLowerCase();
                return ((valueA < valueB) ? -1 : (valueA > valueB) ? 1 : 0);
            };

//adding options to dropdownlist
    function addOptionsToSelect(values,selectTag){
        for(i=0 ; i<selectTag.length ; i++){
            var select=selectTag[i];
            values.sort(sorting);
            for(j=0;j<values.length;j++){
                var option = document.createElement("option");// Creating the Option Element.
                //setting the value to the option element
                option.text = values[j].value ;
                option.value = values[j].id ;
                option.title = values[j].value;
                select.add(option);//Adding the option to the Select
            }
        }
    }

//method for showing and hiding the Action Div
 function ShowDivArr(from)
{
    if(document.getElementById(from).className=="hide")
    {     document.getElementById(from).className = "show" ;
    }
    else
    {    document.getElementById(from).className= "hide" ;
    }
}

//method for generating action values into json and appending it into input element
     function createSlaJson(){
         //getting all the Elements using their names.
        var groupid= document.getElementsByName("PlaceInGroup");
        var technicianid= document.getElementsByName("AssignToTech");
        var priorityid =  document.getElementsByName("priority");
        var levelid =  document.getElementsByName("level");

        var length= groupid.length;//getting the length
        var slaJsonArray=new Array();
        var i;
        for(i=0;i<length;i++){
            var data= {position: "" , queueid : "", technicianid : "" , priorityid : "" , levelid : ""};//creating the object to store the Action data

            var isLevelSelected= document.getElementById("checkbox"+i);
            var isActionEnabled=  document.getElementById("sActions"+i).className;
            //check for selected Escalation level
            if((isLevelSelected.checked)&&(isActionEnabled=="show")){
             if(groupid[i].options[groupid[i].selectedIndex].value == 0){
                data.queueid= "";
            }else{
                data.queueid=groupid[i].options[groupid[i].selectedIndex].value;
            }
            if(technicianid[i].options[technicianid[i].selectedIndex].value == 0){
                data.technicianid= "";
            }else{
                data.technicianid=technicianid[i].options[technicianid[i].selectedIndex].value;
            }
            data.priorityid = priorityid[i].options[priorityid[i].selectedIndex].value;
            data.levelid = levelid[i].options[levelid[i].selectedIndex].value;
            }

            if( i == 0){
                data.position = length;

            } else {
                data.position = i;
            }
            slaJsonArray.push(data);
        }
        var slaJsonObject={};
        slaJsonObject.actionvalues=slaJsonArray;
        var sladata=  (typeof sdpToJSON != 'undefined') ? sdpToJSON(slaJsonArray) : JSON.stringify(slaJsonArray) ; //NO I18N
        document.getElementById("actionValues").value=sladata;

    }

//Code within this block should be excuted after loading the page
//then only we can get the Elements to be operated
jQuery(document).ready(function() {

  //to get the SGT combination for the current Site
  var site=$('siteIDs');
  var svalue=null;
  if(site) {if(site.value === 'null'){
          site=$('dummyselect');// dummy select is used since in SLA default site has null value
          svalue = site.value;
      }
      svalue = site.value;
  }
  if(site === null){
          var siteElement=document.getElementById("LOCATION");

          if(siteElement !== null){
              var value=document.getElementById("LOCATION").value;
              var option = document.createElement("option");
                option.text = value ;
                option.value = value;
                option.selected=true;
                document.getElementById("dummyselect").add(option);
          }
          
          site=$('dummyselect');

          svalue = site.value;
          }
          //invoking methods to show Select option in action part According to the SGT configuration based on th site
  invokeSGTPopulation(site, $('PlaceInGroup0'), $('AssignToTech0'), $('AssignToTech0').value, $('PlaceInGroup0').value, svalue);
  invokeSGTPopulation(site, $('PlaceInGroup1'), $('AssignToTech1'), $('AssignToTech1').value, $('PlaceInGroup1').value, svalue);
  invokeSGTPopulation(site, $('PlaceInGroup2'), $('AssignToTech2'), $('AssignToTech2').value, $('PlaceInGroup2').value, svalue);
  invokeSGTPopulation(site, $('PlaceInGroup3'), $('AssignToTech3'), $('AssignToTech3').value, $('PlaceInGroup3').value, svalue);
  invokeSGTPopulation(site, $('PlaceInGroup4'), $('AssignToTech4'), $('AssignToTech4').value, $('PlaceInGroup4').value, svalue);

  //will call on reload and edit view
  populateTechnicians('selectedID');// No I18N
  //will be called on changing site for admin preference
  jQuery(site).on("change", function() {
    populateTechnicians('selectedID');// No I18N
  });

    //parsing json object and setting the values into action block.
    if(ActionValues != null){
        //getting the select elements by name of the element.
       var groupid= document.getElementsByName("PlaceInGroup");
        var technicianid= document.getElementsByName("AssignToTech");
        var priorityid =  document.getElementsByName("priority");
        var levelid =  document.getElementsByName("level");
        for(i=0;i<ActionValues.length;i++){
           var position=ActionValues[i].position;
           if(position == 5){
               position=0;
           }
          //setting The values into the select elemnt
          groupid[position].value = isNaN(ActionValues[i].queueid)? "" : ActionValues[i].queueid;
          technicianid[position].value= isNaN(ActionValues[i].technicianid)? "" : ActionValues[i].technicianid;
          priorityid[position].value= checkForValue(priorityvalue,ActionValues[i].priorityid);
          levelid[position].value=checkForValue(levelvalue,ActionValues[i].levelid);
          //making the Action block visible if any one of the value is selected.
          if((groupid[position].value != '0' && groupid[position].value != "" ) || (technicianid[position].value != '0' && technicianid[position].value != "") || (priorityid[position].value != "") || (levelid[position].value != "")){
             var isLevelSelected= document.getElementById("checkbox"+position);
             isLevelSelected.checked=true;
             ShowDivArr("sActions"+position);// No I18N
        }
        }
        //invoking methods to show Select option in action part According to the SGT configuration based on th site
        invokeSGTPopulation(site, $('PlaceInGroup0'), $('AssignToTech0'), $('AssignToTech0').value, $('PlaceInGroup0').value, svalue);
        invokeSGTPopulation(site, $('PlaceInGroup1'), $('AssignToTech1'), $('AssignToTech1').value, $('PlaceInGroup1').value, svalue);
        invokeSGTPopulation(site, $('PlaceInGroup2'), $('AssignToTech2'), $('AssignToTech2').value, $('PlaceInGroup2').value, svalue);
        invokeSGTPopulation(site, $('PlaceInGroup3'), $('AssignToTech3'), $('AssignToTech3').value, $('PlaceInGroup3').value, svalue);
        invokeSGTPopulation(site, $('PlaceInGroup4'), $('AssignToTech4'), $('AssignToTech4').value, $('PlaceInGroup4').value, svalue);
    }
    populateOLADetails(olaDetailsJson);

    if(escalationUsers != null || escalationGroupRoles != null)
    {
      for (var i = 0; i < 5; i++) {
        var escalationUsersList = [];
        if(escalationUsers[i] != null && escalationUsers[i].length >0){
          var tech = escalationUsers[i];
          for(var j=0; j<tech.length; j++){
            if(tech[j].id != -1){
              escalationUsersList.push({id:"technicians_"+tech[j].id,name:e_attr(tech[j].name)});
            }else{
              escalationUsersList.push({id:tech[j].id,name:e_attr(tech[j].name)});
            }
          }
        }

        if(escalationGroupRoles[i] != null && escalationGroupRoles[i].length >0){
          var role = escalationGroupRoles[i];
          for(var j=0; j<role.length; j++){
              escalationUsersList.push({id:"grouproles_"+role[j].id,name:e_attr(role[j].name)});
          }
        }
        jQuery('#selectedID'+i).select2("data",escalationUsersList);// No I18N
      }

    }
    //method to check that the value present in the array.
    //selectArray - the array that should be checked for the value.
    //selectValue - the value to be searched in the array.
    function checkForValue(selectArray,selectValue){
        if(selectValue !== undefined && selectValue !== "" && selectValue !== null){
         var id=selectValue.toString();
        var valueChecked=jQuery.grep(selectArray, function(e){ return e.id === id ; });
        if(valueChecked[0]===undefined){
            return "";
        }else{
            return selectValue;
        }
        }else{
            return "";
    }
    }
    function populateTechnicians(selector)
    {
      var assignTo = [];
      assignTo.push({text:'$Ticket Owner',id:'-1'})// No I18N
      if(isMSP){
        assignTo.push({text:'$ACCOUNT_MANAGERS$',id:ACCOUNTMANAGERCRIT})
        assignTo.push({text:'$POINT_OF_CONTACT$',id: POCCRIT})
      }
      var roleCrit = {"field":"associated_entity","condition":"is","value":"GROUP"};// No I18N
        var formatResult = function(item) {
          return item.name || item.text;
        };
        sdpAjax({
        url:"/api/v3/group_roles",//No I18N
        type:"GET",//No I18N
        data: {input_data:sdpToJSON({list_info:{"search_criteria":roleCrit,row_count:100,start_index:0,sort_field:"name",sort_order:"asc"}})},
        async:false,
        ignorefailuremessage:true,
        success:function(response){
          if(response.group_roles){
            for(var i=0; i<response.group_roles.length; i++){
                assignTo.push({id:"grouproles_"+response.group_roles[i].id,text:e_attr(response.group_roles[i].display_name)});
            }
         }
        }
      })
        var siteId = jQuery("#siteIDs").val();
		siteId = (siteId!=null && (siteId == "" || siteId == "null"))?null:siteId;
		//SD-132630
        siteId = siteId==null ? -1: siteId;
        var techs = []; //default technicians list will be maintained
		var listInfoForTech = {list_info:{start_index:1,sort_field:"name",row_count:25,fields_required:["id","name"]}};//NO I18N
		if(jQuery("#ServiceSLA").val() == "false" && !isSCP){
			listInfoForTech.list_info.search_criteria = [{"field":"associated_sites","value":siteId,"condition":"is"}];//NO I18N
		}
        sdpAjax({
        url:"/api/v3/requests/technician",//No I18N
        type:"GET",//No I18N
        data: {input_data:sdpToJSON(listInfoForTech)},
        async:false,
        success:function(response){
          
          if(response.technician){
            for(var i=0; i<response.technician.length; i++){
                techs.push(response.technician[i].id);
                assignTo.push({id:"technicians_"+response.technician[i].id,text:e_attr(response.technician[i].name)})
            }
         }
        }
      })

          for(var action=0;action<5;action++)
          {
            var users = techs;
            jQuery('#'+selector+action).select2({
              data : assignTo,
              multiple : true,
              formatResult: formatResult,
              formatSelection: formatResult,
              closeOnSelect: false,
              formatNoMatches: function (){ return translate('ae.select2.no.message'); },//NO i18N
              createSearchChoice:function(term,data){
                var newData = data;
                if(!term.startsWith("$")){
					listInfoForTech.list_info.row_count = 100;
					if(jQuery("#ServiceSLA").val() == "false"  && !isSCP){
						listInfoForTech.list_info.search_criteria = [{field:"associated_sites",value:siteId,condition:"is"},{field:"name",condition:"like",values:[term],logical_operator:"and"}];//NO I18N
					}else{
						listInfoForTech.list_info.search_criteria = [{field:"name",condition:"like",values:[term]}];//NO I18N
					}
                  sdpAjax({
                    url: '/api/v3/requests/technician',//No I18N
                    type: 'GET',//No I18N
                    data: {input_data: sdpToJSON(listInfoForTech)},//No I18N
                    async:false,
                    success:function(response){
                      for(var i=0;i<response.technician.length;i++){
                        //search results other than default techs should be added to list
                        if(!users.contains(response.technician[i].id))
                        {
                          assignTo.push({id:"technicians_"+response.technician[i].id,text:e_attr(response.technician[i].name)});
                          //createSearchChoice will return search results from default items set to
                          //select2 data. So modifying the search result after above apicall
                          newData.push({id:"technicians_"+response.technician[i].id,text:e_attr(response.technician[i].name)});
                          users.push(response.technician[i].id);
                        }
                      }
                      return assignTo;
                    }
                  })
                }
              }
            });
          }
    }
  });
var selected_groups=[];

function populateOLADetails(olaDetailsJson){
  jQuery.each(olaDetailsJson, function(index,value){
    var groups = olaDetailsJson[index].groups;
    var days = olaDetailsJson[index].days;
    var hours = olaDetailsJson[index].hours;
    var minutes = olaDetailsJson[index].minutes;
    var description = olaDetailsJson[index].description;
    addOLASection(groups,days,hours,minutes,description);
  });
  //If there is no OLA configured before then need to add empty row
  if(Object.keys(olaDetailsJson).length == 0){
    addOLASection();
  }
}
function get_support_groups(list_info){
    if(typeof list_info == "undefined"){
      var list_info={}
      list_info.group_by=["name"];
      list_info.sort_field="name";//No I18N
      list_info.sort_order="asc";//No I18N
      list_info.fields_required=["name"];
      list_info.search_criteria=[];
      list_info.start_index=1;
      list_info.row_count=100;
      list_info.search_criteria.push({field:"deleted",condition:"eq",value:"false"})
      var siteId = jQuery("#siteIDs").val();
      if(jQuery("#ServiceSLA").val() == "false"){
        if(siteId === undefined){
          siteId = jQuery("#LOCATION").val();
        }

        if(siteId == "null"){
          list_info.search_criteria.push({field:"site",condition:"eq",value:null,logical_operator:"and"});
        }
        else{
          list_info.search_criteria.push({field:"site",condition:"eq",value:siteId,logical_operator:"and"});
        }
      }
    }

    var groups=[];
        sdpAjax({
         url: '/api/v3/requests/group',//No I18N
         quietMillis: 500,
         type: 'GET',//No I18N
         data: {input_data: sdpToJSON({list_info:list_info})},//No I18N
         async:false,
         success:function(data){
         for(var i=0;i<data.group.length;i++)
          {
              groups.push({id:data.group[i].name,text:data.group[i].name});
          }
       }
       });
        return groups;
  }
function addOLASection(selectedGroups, days, hours, minutes, description){

  var size = 0;//OLA row count
  jQuery("#ola-section").find('div[data-id *= olasec_]').each(function(){
    size = jQuery(this).attr("data-id").split("_")[1];
  });
  var sectionId = parseInt(size) + 1;

  jQuery("#ola-section").append(jQuery("#olasec").clone().attr({
    "id":"olasec_"+sectionId, //No I18N
    "class":"disp-t fw mb10 ola-table",//No I18N
    "data-id":"olasec_"+sectionId//No I18N
    }));

  var siteId = jQuery("#siteIDs").val();
  var isServiceSLA = jQuery("#ServiceSLA").val();

  jQuery("#olasec_"+sectionId+" input[data-id=groupNameSel]").attr("id","groupNameSel_"+sectionId);

   //ola groupNameSel select validation
  jQuery('#olasec_'+sectionId+' [data-id=ola-timersel]').prepend('<div class="modal-overlay2 cur-na opac5" title="'+getMessageForKey('sdp.change.sla.groupname.first')+'"></div>');
  jQuery('#olasec_'+sectionId+' #groupNameSel_'+sectionId).on('change click keyup',function() {
    if(jQuery('#s2id_groupNameSel_'+sectionId+'>ul.select2-choices>li.select2-search-choice').length === 0 ) {
      jQuery('#olasec_'+sectionId+' [data-id=ola-timersel] .modal-overlay2').show();
      jQuery('#olasec_'+sectionId+' [data-id=add-ola]').prop('disabled',true); //No I18N
    }else {
      jQuery('#olasec_'+sectionId+' [data-id=add-ola]').prop('disabled', false); //No I18N
      jQuery('#olasec_'+sectionId+' [data-id=ola-timersel] .modal-overlay2').hide();
    }
  });

  var $to = jQuery('#groupNameSel_'+sectionId);
  $to.val("").end().select2("destroy");

  //To use the processed results
  if(typeof group_list=="undefined"){
    parent.group_list=get_support_groups();
  }

  $to.select2({
    multiple:true,
    closeOnSelect: false,
    formatNoMatches: function (){ return translate('ae.select2.no.message'); },//NO i18N
    maximumSelectionSize: jQuery("#maxGroups").val(),
    data:group_list,
    query: function (query){
      var term =query.term
      var data=[];
      if(term!=""){
        var list_info={}
        list_info.group_by=["name"];
        list_info.sort_field="name";//No I18N
        list_info.sort_order="asc";//No I18N//No I18N
        list_info.fields_required=["name"];
        list_info.search_criteria=[];
        list_info.start_index=1;
        list_info.row_count=20;
        if(isServiceSLA == "false"){
          if(siteId === undefined || siteId == "null"){
            list_info.search_criteria.push({field:"site",condition:"eq",value:null});
          }
          else{
            list_info.search_criteria.push({field:"site",condition:"eq",value:siteId});
          }
        }
        list_info.search_criteria.push({field:"name",condition:"like",value:term,logical_operator:"and"});
        data=get_support_groups(list_info);
      }else{
        data=group_list;
      }
      data = data.filter(function(i){
        return selected_groups.indexOf(i.id)==-1;
      })
      query.callback({results: data});
    }
    }).on("change",function(event){
      if(event.added != undefined){
        var addedGroup = event.added.text;
        if(!selected_groups.includes(addedGroup)){
          selected_groups.push(addedGroup);
        }
      }
      if(event.removed != undefined){
        var removedGroup = event.removed.text;
        var index = selected_groups.indexOf(removedGroup);
        selected_groups.splice(index, 1);
      }
  });

  if(selectedGroups !== undefined){
    $to.select2("data", selectedGroups);//No I18N
    jQuery('#olasec_'+sectionId+' [data-id=ola-timersel] .modal-overlay2').hide();
    for(var i=0;i<selectedGroups.length;i++){
      selected_groups.push(selectedGroups[i].text);
    }
  }


  var ola_res_day = jQuery("#olasec_"+sectionId+" #res_day"),
      ola_res_hrs = jQuery("#olasec_"+sectionId+" #res_hour"),
      ola_res_min = jQuery("#olasec_"+sectionId+" #res_min"),
      res_unit_day = ola_res_day.attr("data-res-unit"),
      res_plc_day = ola_res_day.attr("data-res-plc"),
      res_plural_day = ola_res_day.attr("data-res-plural"),
      res_unit_hrs = ola_res_hrs.attr("data-res-unit"),
      res_plc_hrs = ola_res_hrs.attr("data-res-plc"),
      res_plural_hrs = ola_res_hrs.attr("data-res-plural"),
      res_unit_min = ola_res_min.attr("data-res-unit"),
      res_plc_min = ola_res_min.attr("data-res-plc"),
      res_plural_min = ola_res_min.attr("data-res-plural");

  ola_res_day.val(days);
  ola_res_hrs.val(hours);
  ola_res_min.val(minutes);
  jQuery("#olasec_"+sectionId+" #olaDescription").val(description);
  if(days !== undefined && hours !== undefined && minutes !== undefined){
    var obj_day_val = getKeyForResTimeDays(days, res_unit_day, res_plc_day, res_plural_day);
    var obj_hrs_val = getKeyForResTimeHours(hours, res_unit_hrs, res_plc_hrs, res_plural_hrs);
    var obj_min_val = getKeyForResTimeMinutes(minutes, res_unit_min, res_plc_min, res_plural_min);

    ola_res_day.val(obj_day_val);
    ola_res_hrs.val(obj_hrs_val);
    ola_res_min.val(obj_min_val);

    if(res_plc_day=="false" || res_plc_hrs=="false" || res_plc_min=="false"){
      obj_day_val = obj_day_val.trim();
      obj_hrs_val = obj_hrs_val.trim();
      obj_min_val = obj_min_val.trim();
      (obj_day_val>1 && res_plural_day=="true") ? res_unit_day=res_unit_day+'s' : ''; //No I18N
      (obj_hrs_val>1 && res_plural_hrs=="true") ? res_unit_hrs=res_unit_hrs+'s' : ''; //No I18N
      (obj_min_val>1 && res_plural_min=="true") ? res_unit_min=res_unit_min+'s' : ''; //No I18N
      jQuery("#olasec_"+sectionId).find('.selected-time').text(obj_day_val+res_unit_day+" "+obj_hrs_val+res_unit_hrs+" "+obj_min_val+res_unit_min);
    }
    else{
      jQuery("#olasec_"+sectionId).find('.selected-time').text(obj_day_val+" "+obj_hrs_val+" "+obj_min_val); //No I18N
    }
  }

  if(size > 0){
    //To Hide add row button in previous row and Show remove row button
    jQuery("#olasec_"+size+" [data-id=add-ola]").hide();
    jQuery("#olasec_"+size+" [data-id=remove-ola]").show();
  }
  //To remove add row button if maximum rows are defined
  if(parseInt(jQuery("#ola-section").find('div[data-id *= olasec_]').length) == parseInt(jQuery("#maxOLARows").val())){
    jQuery("#olasec_"+sectionId+" [data-id=add-ola]").hide();
  }
  //To hide remove button if only one row is defined
  if(parseInt(jQuery("#ola-section").find('div[data-id *= olasec_]').length) == 1){
    jQuery("#olasec_"+sectionId+" [data-id=remove-ola]").hide();
  }

  // Adding event listeners
  ola_res_day.off('keypress').on('keypress', function(event) { return allowOnlyNumber(event);}); // No I18N
  ola_res_hrs.off('keypress').on('keypress', function(event) { return allowOnlyNumber(event);}); // No I18N
  ola_res_min.off('keypress').on('keypress', function(event) { return allowOnlyNumber(event);}); // No I18N
  jQuery("#olasec_"+sectionId+" [data-id=add-ola]").off('click').on('click', function(event) { return addOLASection();}); // No I18N
  jQuery("#olasec_"+sectionId+" [data-id=remove-ola]").off('click').on('click', function(event) { return removeOLASection(this);}); // No I18N

  return sectionId;
}

function toggleHideShow(div){
  var id = document.getElementById(div);
    idStyle = window.getComputedStyle(id);
    id.style.display = idStyle.display == "none"? 'block': 'none';//NO I18N
  }

function removeOLASection(ele){
  var divId = jQuery(ele).closest('[data-id^=olasec_').attr('data-id');//No I18N
  var sectionId = divId.split("_")[1];
  //To remove to be deleted groups in selected_groups.So that it can be listed again
  jQuery("#groupNameSel_"+sectionId).select2("data").each(function(val){//No I18N
    var group = val.text;
    var index = selected_groups.indexOf(group);
    selected_groups.splice(index, 1);
  });
  
  jQuery("#"+divId).remove();

  //To show add icon for last OLA time 
  //If max rows are defined then add row button will be hidden so Showing the button on removing of OLA Section
  var lastSection = 0;
  jQuery("#ola-section").find('div[data-id *= olasec_]').each(function(){
    lastSection = jQuery(this).attr("data-id").split("_")[1];
  });
  jQuery("#olasec_"+lastSection+" [data-id=add-ola]").show();
  //To hide remove button if only one row is defined
  if(parseInt(jQuery("#ola-section").find('div[data-id *= olasec_]').length) == 1){
    jQuery("#olasec_"+lastSection+" [data-id=remove-ola]").hide();
  }
}

function olaTimeValidations(jq){
  var options = [{
    element: '.ola_days',//No I18N
    time_period: 31,
    msg: "sdp.requests.requestcost.errorDD"//No I18N
  },{
    element: '.ola_hours',//No I18N
    time_period: 23,
    msg: "sdp.requests.requestcost.errorHH"//No I18N
  },{
    element: '.ola_mins',//No I18N
    time_period: 59,
    msg: "sdp.requests.requestcost.errorMM"//No I18N
  }]
  
  options.forEach(function(opt){
    jq.on('keyup change click',opt.element,function(e) {
      if(jq.find(this).val() > opt.time_period) {
        jq.find(this).val('');
        showalert('failure',getMessageForKey(opt.msg),'isAutoHide=false,closeOnEscKey=yes,width=500,height=80');//No I18N
        return false;
      }
    });
  });
}