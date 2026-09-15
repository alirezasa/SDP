/* $Id$ */
var OrganizationRole = function (){
  var $orgRoles = jQuery("#orgRoles");
  var $orgRolesWrapper = $orgRoles.find(".org-roles-wrap");

  /*  UTIL FUNCTIONS STARTS */
  var $currentElement = null;
  var hasSentRequest = false;
  function clearFields(form) {
    $form = jQuery(form);
    $form.find("input[name='role_id']").val("");
    $form.find("input[name='role_type']").val("");
    $form.find("input[name='role_name']").val("");
    $form.find("textarea[name='role_desc']").val("");
  }
  function serializeForm($form) {
    var $input = $form.find("input,textarea");
    var json = {};

    jQuery.each($input,function(k,field){
      var $field = jQuery(field);
      if($field.attr("name"))
      {
        json[$field.attr("name")] = trim($field.val());
      }
    });
    return json;
  }
  function sendRequest(requestData){
    /* Utility method that sends request to the server. All ajax requests in the class will be channeled through this method. */
    /* 
      requestData = {
        "url" : <string>,
        "data" : <object>,
        "success" : <function>,
        "fail" : <function>,
        "complete" : <function>,
        "afterSendingRequest" : <function>,
        "beforeSendingRequest" : <function>,
      }
    */
    if(!requestData.url){
      requestData.url = "/";
    }
    if(!requestData.payload){
      requestData.payload = {
        "type" : "POST",//No I18N
        "data" : "{}"//No I18N
      }
    }
    if(!requestData.onSuccessCallback){
      requestData.onSuccessCallback = function(){}
    }
    if(!requestData.onFailureCallback)
    {
      requestData.onFailureCallback = function(){}
    }
    if(requestData.beforeSendingRequest)
    {
      requestData.beforeSendingRequest(url,data);
    }
    jQuery.ajax(requestData.url, requestData.payload).done(function(p1,p2,p3){validateResponseAndCallback(p1, requestData.success);}).fail(requestData.fail).complete(function(){
      hasSentRequest = false;
      if(requestData.complete)
      {
        requestData.complete();
      }
    });
    if(requestData.afterSendingRequest)
    {
      requestData.afterSendingRequest();
    }
  }

  function validateResponseAndCallback(data, callback){
    var val= (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) ; //NO I18N
  if(is_json(data))
  {
		callback(data);
	}else if(val.includes("/jsp/AuthError.jsp?module=Error")) //No I18N
  {
     showalert("failure", getMessageForKey("sdp.xss.vulnerability.message"), 'isAutoHide=false');//No I18N 
  }
  else{
		showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.nosession"), 'isAutoHide=false');//No I18N
	}
  }

  function updateTransform(json) {
    var fieldKeyMap = {
      "role_id" : "id",//No I18N
      "role_name" : "name",//No I18N
      "role_desc" : "description",//No I18N
      "role_type" : "orgrole_type"//No I18N
    };

    var resultJSON = {
      "orgroles" : []//No I18N
    };
    var roleTypeObj = {
      "orgrole_type" : "",//No I18N
      "role_details" : []//No I18N
    };
    var roleObj = {
      "id" : "",//No I18N
      "description" : "",//No I18N
      "name" : ""//No I18N
    };

    roleObj[fieldKeyMap.role_id]=json.role_id;
    roleObj[fieldKeyMap.role_desc]=json.role_desc;
    roleObj[fieldKeyMap.role_name]=json.role_name;
    roleTypeObj[fieldKeyMap.role_type]=json.role_type; 

    roleTypeObj.role_details.push(roleObj);

    resultJSON.orgroles.push(roleTypeObj);

    return resultJSON;
  }
  function formValid(json) {
    return json.role_name.length > 0;
  }
  function cleanCloseDialog() {
    $currentElement = null;
    closeDialog();
  }
  function emptyRoleGroup($el,roleType){
    var i18nKey = "sdp.admin.orgrole.roles."+roleType.toLowerCase();//No I18N
    var emptyRoleText = getMessageForKey(i18nKey+".empty");
    var newRoleBtnText = getMessageForKey(i18nKey+".new");
    $emptyRole = $orgRolesWrapper.find("#empty-role-group > div").clone(true,true);
    $emptyRole.find(".role-empty").text(emptyRoleText);
    $emptyRole.find("button[action='org_add_role']").append(newRoleBtnText);

    $el.empty();
    $el.append($emptyRole);
    $el.closest(".org-card").find(".org-card-head .org-new-role").remove();//No I18N
  }
  /*  UTIL FUNCTIONS ENDS */

  function highlight($el,duration,startColor,endColor){
    (!duration) && (duration=250);
    (!startColor) && (startColor="#FFFFDE");//No I18N
    (!endColor) && (endColor="#FFFFFF");//No I18N

    $el.css({
      "background-color" : startColor//No I18N
    });
    $el.animate({
      "background-color" : endColor//No I18N
    },{
      "duration" : duration,//No I18N
      "complete" : function(){//No I18N
        $el.css({
          "background-color" : ""//No I18N
        });
      }
    });
  }

  /* NEW ROLE FUNCTIONS STARTS */
  function addNewRole($container,roleType,roleId,roleName,roleDesc) {
      var i18nKey = "sdp.admin.orgrole.roles."+roleType.toLowerCase();//No I18N
      var $newRole = $orgRolesWrapper.find("#role-element > .ui-row-single").clone(true,true);
      $newRole.attr("data-roleid",roleId);
      $newRole.find(".role-name").text(roleName);
      $newRole.find(".role-desc").text(roleDesc);
      if(roleType != "ORG")
      {
        $newRole.find(".role-associated-users").html('<a href="/" sdphrefJs="js-href-organizationRoles-0" data-event="click" data-handler="showAssociatedUsers(&quot;/OrgRoles.do?action=vieworg&view=associateuser&quot;,&quot;'+roleType.toUpperCase()+'&quot;,&quot;'+roleId+'&quot;);" nonce="'+sdpNonce+'">'+getMessageForKey("sdp.admin.orgrole.nouserconf")+'</a>');//NO OUTPUTENCODING
      }
      var roleCount = $container.find(".ui-row-single").length;
      var isFirst = roleCount == 0;
      if(isFirst)
      {
        $container.empty();
        $newBtn = $orgRolesWrapper.find("#org-card-head-new-btn > a").clone(true,true);
        $container.closest(".org-card").find(".org-card-head").append($newBtn);//No I18N
      }
      $container.append($newRole);
      highlight($newRole,300);
      $container.closest(".org-card").find(".org-card-head .role-count").text("("+(roleCount+1)+")");//No I18N
      return $container.find(".ui-row-single").last();
  }
  function showNewRoleDialog(el,roleType,title) {
    $currentElement = jQuery(el).closest(".org-card");//No I18N
    var dialogBox = showDialog(jQuery('#new-org-role-dialog').html(),'title='+title+', width=500, position=absmiddle');//No I18N NO OUTPUTENCODING
    var $dialogBox = jQuery(dialogBox);
    $dialogBox.find("input[name='role_id']").remove();

    $dialogBox.find("form").submit(function(){
      return false;
    });
    $dialogBox.find("[action='org_saveandclose_btn']").on('click', function(evt){
      addRoleAndClose(jQuery(evt.target).closest("form"));//No I18N
    });

    $dialogBox.find("[action='org_save_btn']").removeClass("hide");
    $dialogBox.find("[action='org_save_btn']").on('click', function(evt){
      addRole(jQuery(evt.target).closest("form"));//No I18N
    });

    $dialogBox.find("input[name='role_type']").val(roleType);
    $dialogBox.find("input[name='role_name']").trigger('focus');
  }
  function addRoleAndClose(form) {
    function onSuccessCallback(){
      cleanCloseDialog();
    }

    addRole(form,onSuccessCallback);
  }
  function addRole($form,onSuccessCallback) {
    var formData = serializeForm($form);
    if(formValid(formData))
    {
      if(!hasSentRequest)
      {
        /*hasSentRequest = true;*/
        // ajax goes here...
        var ipJson = {
          "orgroles" : [//No I18N
            {
              "orgrole_type" : $form.find("[name='role_type']").val(),//No I18N
              "role_details" : [//No I18N
                {
                  "name" : $form.find("input[name='role_name']").val(),//No I18N
                  "description" : $form.find("textarea[name='role_desc']").val()//No I18N
                }
              ]
            }
          ]
        }
        function onSuccess(data){
          data = JSON.parse(data);
          if(data.response_status)
          {
            if(data.response_status.status_code == 2000)
            {
              $existingRoles = $currentElement.find(".org-card-items");
              var roleType = $form.find("[name='role_type']").val();
              $newRole = addNewRole($existingRoles,roleType,data.orgroles[0].role_details[0].id,formData.role_name,formData.role_desc);
              $form.find("input[name='role_name']").val("");
              $form.find("textarea[name='role_desc']").val("");
              onSuccessCallback && onSuccessCallback();
	      showalert('success',getMessageForKey("sdp.admin.orgrole.messages.success.addrole"),'isAutoHide=true');//No I18N
	      $form.find("input[name='role_name']").focus();
            }
            else
            {
              showalert('failure',data.response_status.message,'isAutoHide=true');//No I18N
            }
          }
        }
        var data = {
                     "action" : "add_role",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(ipJson) : JSON.stringify(ipJson) //No I18N
                   };
        sendRequest({
          "url":"/OrgRoles.do",//No I18N
          "payload" : {//No I18N
            "type" : "POST",//No I18N
            "data" : data //No I18N
          },
          "success" : onSuccess,//No I18N
          "complete" : function(){//No I18N
            hasSentRequest = false;
          }
        });
      }
    }else {
	showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.rolename"), 'isAutoHide=false'); //NO I18N
    }
  }
  /* NEW ROLE FUNCTIONS ENDS */
  function addAssociationForOrganizationRoleAndClose($form, $currentElement) {
    function callback() {
      closeDialog();
    }
    // addAssociationForOrganizationRole($form)
    addAssociationForOrganizationRole($form,callback, $currentElement);
  }
  function addAssociationForOrganizationRole ($form,onSuccessCallback, $currentElement) {
    var existingUserId = $form.find("input[name='existing_user_id']").val();
    var isEdit = ( existingUserId.length > 0);
    if(!$form.find("input[name='user_id']").val() && isEdit){	//No value, but edit = delete
       var i18nKey = "sdp.admin.orgrole.roles.org";//No I18N
      var dialogBox = showDialog(jQuery('#confirm-delete-dialog').html(),'title='+getMessageForKey("sdp.admin.orgrole.association.confirmdelete")+', width=500, position=absmiddle');//No I18N NO OUTPUTENCODING
      var roleId = $form.find("input[name='role_id']").val();//No I18N
      var $dialogBox = jQuery(dialogBox);

      $dialogBox.find('label').text(getMessageForKey("sdp.admin.orgrole.confirmorgassociationdelete"));
      $dialogBox.find("[action='org_confirm_delete']").on('click', function(evtin){
	deleteAssociation($currentElement, roleId, existingUserId);
	closeDialog();
      });
      return;
    }
  if($form.find("input[name='user_id']").val()){
    if(isEdit)			//value + edit = update
    {
      var serializedData = {
        "role_details": [//No I18N
          {
            "id": $form.find("input[name='role_id']").val(),//No I18N
            "old_user_id": existingUserId,//No I18N
            "user_id": $form.find("input[name='user_id']").select2("val")//No I18N
          }
        ]
      }
      if(!hasSentRequest)
      {
        /*hasSentRequest = true;*/
        var data = {
                     "action" : "update_association",//No I18N
                     "operation_type" : "update_role_user",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(serializedData) : JSON.stringify(serializedData) //No I18N
                   };
        sendRequest({
          "url" : "/OrgRoles.do",//No I18N
          "payload" : {//No I18N
            "type" : "POST",//No I18N
            "data" : data //No I18N
          },
          "success" : function(response){//No I18N
            response = JSON.parse(response);
            if(response.response_status)
            {
              if(response.response_status.status_code == 2000) {
                var username = $form.find("input[name='user_id']").prev(".select2-container").find(".select2-choice").data("select2Data").name;//No I18N
		if($form.find("input[name='user_id']").prev(".select2-container").find(".select2-choice").data("select2Data").is_vip_user)
                {
                  $currentElement.find(".role-associated-users a").addClass("vip-name-xs"); // No I18N
                }else{
		  $currentElement.find(".role-associated-users a").removeClass("vip-name-xs"); // No I18N
		}
                $currentElement.find(".role-associated-users > a").eq(0).text(username);
                $currentElement.find(".role-associated-users > a").data({
                  "userid": $form.find("input[name='user_id']").select2("val"),//No I18N
                  "username": $form.find("input[name='user_id']").prev(".select2-container").find(".select2-choice").data("select2Data").first_name//No I18N
                });
                showalert('success',getMessageForKey("sdp.admin.orgrole.messages.success.reassignuser"),'isAutoHide=true');//No I18N
                if(onSuccessCallback)
                {
                  onSuccessCallback();
                }
              }
            }
          },
          "complete" : function(response){//No I18N
            hasSentRequest = false;
          }
        });
      }
    }
    else
    {
      var serializedData = {
        "orgroles": [{//No I18N
          "role_id": null,//No I18N
          "user_details": [//No I18N
            {
              "id" : null,//No I18N
              "config_details" : ["-1"]//No I18N
            }
          ]
        }]
      }
      serializedData.orgroles[0].role_id = $form.find("input[name='role_id']").val();
      serializedData.orgroles[0].user_details[0].id = $form.find("input[name='user_id']").select2("val");
      if(!hasSentRequest)
      {
        /*hasSentRequest = true;*/
        var data = {
                     "action" : "add_association",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(serializedData) : JSON.stringify(serializedData) //No I18N
                   };
        if(isMSPOrSCP) {
          data["persistentAccountId"] = document.getElementById('__persistentAccountId__select').value; //No I18N
          data["persistAccountID"] = false;
        }
        sendRequest({
          "url" : "/OrgRoles.do",//No I18N
          "payload" : {//No I18N
            "type" : "POST",//No I18N
            "data" : data //No I18N
          },
          "success" : function(response){//No I18N
            response = JSON.parse(response);
            if(response.response_status)
            {
              if(response.response_status.status_code == 2000) {
		var email = response.orgroles[0].role_details[0].configured_users[0].email_id;
		if(email && email.length){
			email = ","+email;
		}else{
			email = "";
		}
    $currentElement.find(".role-associated-users").html('<a href="/" sdphrefJs="js-href-organizationRoles-2">'+encodeHTML(response.orgroles[0].role_details[0].configured_users[0].first_name+email)+'</a>');

		if(response.orgroles[0].role_details[0].configured_users[0].is_vip_user)
                {
                  $currentElement.find(".role-associated-users a").addClass("vip-name-xs"); // No I18N
                }
                $currentElement.find(".role-associated-users a").data({
                  "userid" : response.orgroles[0].role_details[0].configured_users[0].id,
                  "username" : response.orgroles[0].role_details[0].configured_users[0].first_name
                });
                showalert('success',getMessageForKey("sdp.admin.orgrole.messages.success.addassociation"),'isAutoHide=true');//No I18N
		$currentElement.find(".role-associated-users > a").on('click', function(evt){
			showUserDetailPopup(jQuery('#org-user-dialog').html(), jQuery(evt.target).data("username") + ' - '+getMessageForKey("sdp.admin.orgrole.roles.org") ,jQuery(evt.target).data("userid"));	//No I18N NO OUTPUTENCODING
  		});
                if(onSuccessCallback)
                {
                  onSuccessCallback();
                }
              }
            }
          },
          "complete" : function(){//No I18N
            hasSentRequest = false;
          }
        });
      }
    }
   }else{
      showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.nousersel"), 'isAutoHide=false'); //No I18N
   }
  }

  function showAddAssociationForOrganizationRoleDialog(el,roleType,roleId,userId,userName,title, isVip) {
    $currentElement = jQuery(el).closest(".ui-row-single");//No I18N
    $dialogBox = showDialog(jQuery("#org-association-dialog").html(),'width=350, position=absmiddle');//No I18N NO OUTPUTENCODING
    $dialogBox = jQuery($dialogBox);
    $dialogBox.find('.boxHeader').text(title);
    $dialogBox.find("input[name='role_id']").val(roleId);
    $dialogBox.find("input[name='existing_user_id']").val(userId);
    function format(item){
      var displayText = item.name;
      if(item.association)
      {
        displayText += " , "+item.association;
      }
      return displayText;
    }
    $dialogBox.find("input[name='user_id']").val(userId);
    applySelect2($dialogBox.find("input[name='user_id']"), userId, userName, isVip);

    $dialogBox.find("[action='org_saveandclose_btn']").on('click', function(evt){
      addAssociationForOrganizationRoleAndClose(jQuery(evt.target).closest("form"), $currentElement);//No I18N
    });
  }


  /*  EDIT ROLE FUNCTIONS STARTS */
  function showEditRoleDialog(el,roleType,roleId,title) {
    $currentElement = jQuery(el).closest(".ui-row-single");//No I18N
    var roleName = $currentElement.find(".role-name").text();
    var roleDesc = $currentElement.find(".role-desc").text();

    var dialogBox = showDialog(jQuery('#new-org-role-dialog').html(),'title='+title+', width=500, position=absmiddle');//No I18N NO OUTPUTENCODING
    var $dialogBox = jQuery(dialogBox);
    $dialogBox.find("form").submit(function(){
      return false;
    });

    $dialogBox.find("[action='org_saveandclose_btn']").on('click', function(evt){
      editRoleAndClose(jQuery(evt.target).closest("form"));//No I18N
    });

    $dialogBox.find("input[name='role_type']").val(roleType);
    $dialogBox.find("input[name='role_id']").val(roleId);
    $dialogBox.find("input[name='role_name']").val(roleName);
    $dialogBox.find("textarea[name='role_desc']").val(roleDesc);
    $dialogBox.find("input[name='role_name']").trigger('focus');
  }
  function editRoleAndClose(form) {
    editRole(form);
  }

  function editRole($form) {
    var formData = serializeForm($form);
    if(formValid(formData))
    {
      if(!hasSentRequest)
      {
        /*hasSentRequest = true;*/
        function onSuccess(data){
	  data = JSON.parse(data);
	  if(data.response_status && data.response_status.status_code == 2000){
		  $currentElement.find(".role-name").text(formData.role_name);
		  $currentElement.find(".role-desc").text(formData.role_desc);
		  $currentElement = null;

		  $form.find("input[name='role_name']").val("");
		  $form.find("textarea[name='role_desc']").val("");
      showalert('success',getMessageForKey("sdp.admin.orgrole.messages.success.editrole"),'isAutoHide=true');//No I18N
		  closeDialog();
	  }else{
	  	showalert('failure',data.response_status.message,'isAutoHide=false');//No I18N
	  }
        }
        var data = {
                     "action" : "update_role",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(updateTransform(formData)) : JSON.stringify(updateTransform(formData))//No I18N
                   };
        sendRequest({
          "url" : "/OrgRoles.do",//No I18N
          "payload" : {//No I18N
            "type" : "POST",//No I18N
            "data" : data //No I18N
          },
          "success" : onSuccess,//No I18N
          "complete" : function(){//No I18N
            hasSentRequest = false;
          }
        });
      }
    }else {
	showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.rolename"), 'isAutoHide=false'); //NO I18N
    }
  }
  /*  EDIT ROLE FUNCTIONS ENDS */






  /*  DELETE ROLE FUNCTIONS STARTS */
  function deleteRole(el,roleType,roleId) {
    var $container = jQuery(el).closest(".org-card-items");//No I18N
    $currentElement = jQuery(el);
    if(!hasSentRequest)
    {
      /*hasSentRequest = true;*/
      function onSuccess(data){
        data = JSON.parse(data);
        if(data.response_status)
        {
          if(data.response_status.status_code == 2000)
          {
            $currentElement.remove();
            var roleCount = $container.find(".ui-row-single").length;
            $container.closest(".org-card").find(".org-card-head .role-count").text("("+roleCount+")");//No I18N
            if(!roleCount || roleCount==0){
              emptyRoleGroup($container,roleType);
            }
            $currentElement = null;
            showalert('success',getMessageForKey("sdp.admin.orgrole.messages.success.delete"),'isAutoHide=true');//No I18N
	  } else {
	    showalert('failure',getMessageForKey("sdp.admin.orgrole.messages.failure.deleteassociation"), 'isAutoHide=false');  //No I18N
	  }
	}
      }
      var data = {
                   "action" : "delete_role",//No I18N
                   "roleId" : roleId//No I18N
                 };
      sendRequest({
        "url" : "/OrgRoles.do",//No I18N
        "payload" : {//No I18N
          "type" : "POST",//No I18N
          "data" : data //No I18N
        },
        "success" : onSuccess,//No I18N
        "complete" : function(){//No I18N
          hasSentRequest = false;
        }
      });
    }
  }
  /*  DELETE ROLE FUNCTIONS ENDS */




  /* EVENTS STARTS */
  function addRoleEvent(evt) {
    var roleType = jQuery(evt.target).closest(".org-card").attr("data-type");//No I18N
    var i18nKey = "sdp.admin.orgrole.roles."+roleType.toLowerCase();//No I18N
    showNewRoleDialog(evt.target,roleType,getMessageForKey(i18nKey+".create"));
    document.querySelector('#_DIALOG_CONTENT #cancel-role-btn').addEventListener("click", function(event) { closeDialog(); });
  }
  $orgRolesWrapper.find("[action='org_add_role']").on('click', addRoleEvent);

  function editRoleEvent(evt) {
    var roleType = jQuery(evt.target).closest(".org-card").attr("data-type");//No I18N
    var roleId = jQuery(evt.target).closest(".ui-row-single").attr("data-roleid");//No I18N
    var i18nKey = "sdp.admin.orgrole.roles."+roleType.toLowerCase();//No I18N
    showEditRoleDialog(evt.target,roleType,roleId,getMessageForKey(i18nKey+".edit"));
    document.querySelector('#_DIALOG_CONTENT #cancel-role-btn').addEventListener("click", function(event) { closeDialog(); });
  }
  $orgRolesWrapper.find("[action='org_edit_role']").on('click', editRoleEvent);

  function deleteRoleEvent(evt) {
    var $lastRow = jQuery(evt.target).closest(".ui-row-single");//No I18N
    var roleType = jQuery(evt.target).closest(".org-card").attr("data-type");//No I18N
    var roleId = jQuery(evt.target).closest(".ui-row-single").attr("data-roleid");//No I18N
    var roleName = jQuery(evt.target).closest(".ui-row-single").find(".role-name").text(); // No I18N
    var i18nKey = "sdp.admin.orgrole.roles."+roleType.toLowerCase();//No I18N
    var headerTitle = getMessageForKey(i18nKey+".delete")+' - '+roleName;
    var dialogBox = showDialog(jQuery('#confirm-delete-dialog').html(),'width=500, position=absmiddle');//No I18N NO OUTPUTENCODING
    var $dialogBox = jQuery(dialogBox);
    $dialogBox.find('.boxHeader').text(headerTitle);
    $dialogBox.find("[action='org_confirm_delete']").on('click', function(evtin){
      deleteRole($lastRow,roleType,roleId);
      closeDialog();
      //$lastRow.remove();
    });
    document.querySelector('#_DIALOG_CONTENT #cancel-delete-btn').addEventListener("click", function(event) { closeDialog(); });
  }
  $orgRolesWrapper.find("[action='org_delete_role']").on('click', deleteRoleEvent);

  function associateUserEvent(evt){
    var $lastRow = jQuery(evt.target).closest(".ui-row-single");//No I18N
    var roleType = jQuery(evt.target).closest(".org-card").attr("data-type");//No I18N
    var roleId = jQuery(evt.target).closest(".ui-row-single").attr("data-roleid");//No I18N
    var roleName = jQuery(evt.target).closest(".ui-row-single").find(".role-name").text();//No I18N
    if(roleType == "ORG")
    {
      var $alreadyAssociatedUser = $lastRow.find(".role-associated-users a").eq(0);
      var userId = null, userName = null;
      if($alreadyAssociatedUser)
      {
        userId = $alreadyAssociatedUser.data("userid");//No I18N
        userName = $alreadyAssociatedUser.html();//NO OUTPUTENCODING
      }
      showAddAssociationForOrganizationRoleDialog(evt.target,roleType,roleId,userId,userName,getMessageForKey("sdp.admin.orgrole.associateuser")+" - "+roleName, $alreadyAssociatedUser.hasClass('vip-name-xs')); //No I18N
	//is_vip_user
	document.querySelector('#_DIALOG_CONTENT #cancel-asso-btn').addEventListener("click", function(event) { closeDialog(); });
    }
    else {
      showAssociatedUsers("/OrgRoles.do?action=vieworg&view=associateuser",roleType,roleId,function(url){//No I18N
        url += "#add";//No I18N
        return url;
      });
    }
    loadmeadmin();
  }
  $orgRolesWrapper.find("[action='org_asso_user']").on('click', associateUserEvent);
  /* EVENTS ENDS */
  function init(){
    var $allOrgRoleAssos = $orgRolesWrapper.find(".org-card[data-type='ORG'] .org-card-items .role-associated-users a")
    jQuery.each($allOrgRoleAssos,function(k,v){
      var id = jQuery(v).attr("data-userid");
      var name = jQuery(v).attr("data-username");
      jQuery(v).attr("data-userid",null);
      jQuery(v).data({
        "userid" : id,//No I18N
        "username" : name//No I18N
      });
    });
    $orgRolesWrapper.find("[action='show-user-roles']").on('click', function(evt){
	showUserDetailPopup(jQuery('#org-user-dialog').html(), decodeHTML(jQuery(evt.target).data("username")) + ' - '+getMessageForKey("sdp.admin.orgrole.roles.org") ,jQuery(evt.target).data("userid"));//No I18N
    });
  }
  function deleteAssociation($el, roleId, userId){
    var payload = {
      "orgroles": [{//No I18N
        "role_id": roleId,//No I18N
        "user_details": [{//No I18N
          "id": userId//No I18N
        }]
      }]
    };
    var data = {
                   "action" : "delete_association",//No I18N
                   "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(payload) : JSON.stringify(payload) //No I18N
                 };
    sendRequest({
        "url" : "/OrgRoles.do",//No I18N
        "payload" : {//No I18N
          "type" : "POST",//No I18N
          "data" : data //No I18N
        },
       "success" : function(){$el.find(".role-associated-users > a").remove();showalert("success", getMessageForKey("sdp.admin.orgrole.messages.success.delete"), 'isAutoHide=true');}//No I18N
      });
  }
  init();
}
OrganizationRole();

function showAssociatedUsers(url,roleType,roleId,callback) {
  var toURL = url+"&roleid="+roleId; //No I18N NO OUTPUTENCODING
  if(callback)
  {
    toURL = callback(toURL);
  }

  if(forwardfrom === "ESM"){
    jQuery.ajax({
        url: toURL,
        async:false,      
        cache:false,       
        type: 'GET', //No I18N
        complete: function (resp) {        
        //97834 - the response from server side was in html format, hence reverted to render as html
            jQuery("#mdhSection-content").html(resp.responseText);
        }    
    });
  }else{
    window.location.href= toURL;
  }
}
