/* $Id$ */
jQuery(document).ready(function(){

// Expand / Collapse org-items
jQuery('.org-down-arrow').on('click', function(){
	jQuery(this).closest('.org-card').find('.org-card-items').toggle();//No I18N
});

// Add new user
jQuery('#org-no-roles .add-new-user').on('click', function(){
	jQuery('#org-no-roles').hide();
	jQuery('#org-associate-roles').show().find('select').select2();
});

// Onchange group option
jQuery('#org-associate-roles input[name="org-group-option"]').on('change', function(){
	if(jQuery(this).val()==="multiple"){
		jQuery('#org-group-single').hide();
		jQuery('#org-group-multiple').show();
	}
	else{
		jQuery('#org-group-single').show();
		jQuery('#org-group-multiple').hide();
	}
});

// Destroy showDialog select2 elements
jQuery(document).on('click','.closebutton',function(){//No I18N
	//jQuery('.org-dialog-wrap select[multiple]').select2('destroy');//No I18N
	destroySelect2(jQuery('.org-dialog-wrap select[multiple]'));//No I18N
});

var _json_stringify = JSON.stringify;
JSON.stringify = function (value) {
    var _array_tojson = Array.prototype.toJSON;
    delete Array.prototype.toJSON;
    var r = _json_stringify(value);
    Array.prototype.toJSON = _array_tojson;
    return r;
};

is_json = function( data ) {
	try{
		JSON.parse(data);
		return true;
	} catch (e){
		//if its anything other than json.. then we know that its serving the login html page.
		return false;
	}
	return false;
}

// Trigger resize code on ready
//jQuery(window).trigger('resize');//No I18N

}); // document ready


// Expand Org cards height
jQuery(window).on('resize', function(){
	if((jQuery(window).width()>1800)&&(jQuery(window).height()>740)){
		jQuery('.org-card-items').height(jQuery(window).height()-350);//No I18N
	}
	else{
		jQuery('.org-card-items').height('360px');	//No I18N	
	}
});

/* Association Details Population logic */
function populateEntitiesList(data) { 
	var entities = "";
      jQuery.each(data,function(k,v){
      	var displayText = v.name;
		if(v.location_type == "DEPARTMENT")
		{
			if(v.associated_site && v.associated_site.name)
			{
				displayText += " ( " + v.associated_site.name + " ) ";
			}
			else
			{
				displayText += " ( " + getMessageForKey("sdp.admin.technician.addtechnician.nosite") + " ) ";	
			}
		}
        entities += "<span class='entity_name'>"+encodeHTML(displayText)+"</span>"+" , ";
      });
      entities = trim(entities);
      entities = entities.substring(0,entities.length-1);
      return entities;
}
function populateUserAssociationDetails($body,$item,allRoles,callback) {
	if(!callback)
	{
		callback = function($itemTemp){
			return $itemTemp;
		}
	}
	jQuery.each(allRoles,function(index,roleDetail){
	    var $itemTemp = $item.clone(true,true);
	    var keys = Object.keys(roleDetail);
	    if(keys.length > 0)
	    {
		    var roleType = roleDetail.orgrole_type;
		    $itemTemp.find("[name='role-type'] span").text(getMessageForKey("sdp.admin.orgrole.roles."+roleType.toLowerCase()));
		    $itemTemp.find("[name='role-name'] span").html(encodeHTML(roleDetail.role_name));
		    if(roleType == "ORG")
		    {
		      $itemTemp.find("[name='entity']").remove();
		    }
		    else
		    {
		      var entities = populateEntitiesList(roleDetail.user_details.config_details);
		      $itemTemp.find("[name='entity'] label").text(getMessageForKey("sdp.admin.orgrole."+roleType.toLowerCase()));
		      $itemTemp.find("[name='entity'] span").html(entities);//NO OUTPUTENCODING
		    }
		    $itemTemp = callback($itemTemp,allRoles[index]);
		    $body.append($itemTemp);
		}
	});
	return $body;
}

//orgrole script
function format(item){
	var vipClass = "";
	if(item.is_vip_user)
	{
		vipClass = "vip-name-xs"; // No I18N
	}
	var $div = jQuery("<div></div>");
	var $span = jQuery("<span></span>");
	$span.addClass(vipClass);
	$span.html(encodeHTML(item.name));
	$div.append($span);
	//return "<span class='"+vipClass+"'>"+item.name+"</span>";
	return $div.html();
}

function applySelect2(row, id, name, isVip){
	if(id){
		id = parseInt(id);
	}

    	row.select2({
    	  placeholder : getMessageForKey("sdp.admin.orgrole.searchcriteria.selectuser"),
    	  allowClear  : true,
    	  ajax: {
	      url: "/OrgRoles.do",//No I18N
	      dataType: 'json',//No I18N
	      data: function (term, page) {
	      		var jsonObj={
          			"action" : "searchAutoComplete",//No I18N
          			"count" : 25,//No I18N
          			"sType" : 2,//No I18N
          			"sText": term // search term//No I18N
          		};
          		if(isMSP)
          		{
          		    jsonObj=Object.assign(jsonObj,{"persistentAccountId" : getMSPOrgRoleAccId(row),"persistAccountID" : false});//No I18N
          	    }
                return jsonObj;
	      },
	      results: function (data, page) { // parse the results into the format expected by Select2.
		  // since we are using custom formatting functions we do not need to alter the remote JSON data
		  var obj = {
		    "results" : []//No I18N
		  };
		  jQuery.each(data.entities,function(k,v){
		    var assoc = v.association;
		    if(!assoc){
			assoc = "";
		    }else{
			assoc = ", "+assoc;
		    }
		    var dispText = v.name + assoc;
		    obj.results.push({"id":v.id,"name":dispText,"is_vip_user":v.is_vip_user, "first_name":v.name, "email":v.association});//No I18N
		  });
		  return obj;
	      },
	      cache: true
	  },
	  formatNoMatches: function(term) {
        return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
	  },
	  formatSelection: format,
	  formatResult: format,
	  multiple: false,
	  initSelection : function(element,callback){
		if(id && id>0){
			callback({'id': id, 'name': decodeHTML(name), 'is_vip_user':isVip});//No I18N
		}
	  }
	});
}

function getMSPOrgRoleAccId(row)
{
	var roleType = jQuery("#orgRoles.associate-users select[name='current_role_type']").val();
	if(roleType == "ORG")
	{
		return row.parent().find('input[name=org_user]').attr("data-entityid");
	}
	if(document.getElementById('__persistentAccountId__select').value>0){
		return document.getElementById('__persistentAccountId__select').value;
	}
	else{
		return document.getElementById('sitesAccountId').value;
	}
	
	
}

function destroySelect2($el){
	$el.select2("destroy");	//No I18N

	//used to overcome mozilla's default display:inline
	$el.css("display", ""); //No I18N
	return $el;
}

function constructRoleObj(roleId, type){
  var roleObj = {orgroles:[]};//No I18N
  var innerObj = {config_details: roleId, config_type: type , role_details: []};//No I18N
  var $rows = jQuery('.org_role_row');
  for(var i=0; i<$rows.length; i++){
  	var row = jQuery($rows[i]);
	var id = row.find("[data-roleid]").attr("data-roleid");
	var userId = row.find('input[name="org_role_user"]').val();
	var assoID = row.find('input[name="org_role_user"]').attr("associationId");
	var org_role = {"id": id};//No I18N
	if(userId && userId != '-1'){
		var user = {"id": userId};//No I18N
		var innerConf = {"user": user, "org_role": org_role};//No I18N
		if(assoID != "-1")
		{
			innerConf["id"] = assoID;
		}
		innerObj.role_details.push(innerConf);
	}
  }
  roleObj.orgroles.push(innerObj);
  return roleObj;
}

function showUserDetailPopup(body, title, uid){
	var $detailViewDialog = showDialog(body, ' width=500, position=absmiddle');//No I18N
        $detailViewDialog = jQuery($detailViewDialog);
	$detailViewDialog.find('.boxHeader').text(title);
        var $body = $detailViewDialog.find("#_DIALOG_CONTENT .org-user-details");
        var $item = $body.find("> div.org-user-row").clone();
        $body.empty();
        var data =  {
                       "action" : "get_all_roles_userid",//No I18N
                       "userId" : uid,//No I18N
                       "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON({}) : JSON.stringify({}) //No I18N
                     };
	jQuery.ajax("/OrgRoles.do", {	//No I18N
          "type" : "GET",//No I18N
          "data" : data //No I18N
        }).done(function(response){
	  if(!is_json(response)){
		showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.nosession"), 'isAutoHide=false');//No I18N
		return;
	  }
          response = JSON.parse(response);
          if(response.response_status)
          {
            if(response.response_status.status_code == 2000)
            {
              var allRoles = response.orgroles[0].role_details;
              populateUserAssociationDetails($body,$item,allRoles,function($el,data){
                $el.find(".org-item-btns").remove();
                return $el;
              });
            }
            else
            {
              showalert("failure",response.response_status.message,'isAutoHide=true');//No I18N
            }
          }
	});
}
