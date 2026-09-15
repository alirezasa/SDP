/* $Id$ */
var SDClass = {};
SDClass.create = function(Class) {
  if (!Class) {
    Class = function() {
      if (this.init) {
        this.init.apply(this, arguments);
      }
    }
  }
  var keys = Object.keys(SDClass);
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    Class[key] = SDClass[key];
  }
  var keys = Object.keys(SDClass.prototype);
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    Class.prototype[key] = SDClass.prototype[key];
  }
  return Class;
}
SDClass.extendTo = function(childClass) {
  childClass.prototype = Object.create(this.prototype);
  var keys = Object.keys(SDClass);
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    childClass[key] = SDClass[key];
  }
  childClass.prototype._parent_ = {};
  var keys = Object.keys(this.prototype);
  for (var i = 0; i < keys.length; i++) {
    childClass.prototype._parent_[keys[i]] = this.prototype[keys[i]];
  }
  childClass.prototype.parent = function() {
    var arr = [];
    var func = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      arr.push(arguments[i]);
    }
    return this._parent_[func].apply(this, arr);
  }
}
SDClass.extendFrom = function(baseClass) {
  this.prototype = Object.create(baseClass.prototype);
  this.prototype._parent_ = {};
  var keys = Object.keys(baseClass.prototype);
  for (var i = 0; i < keys.length; i++) {
    this.prototype._parent_[keys[i]] = baseClass.prototype[keys[i]];
  }
  this.prototype.parent = function() {
    var arr = [];
    var func = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      arr.push(arguments[i]);
    }
    return this._parent_[func].apply(this, arr);
  }
}
SDClass.methods = function(methods) {
  if (methods.static) {
    this.addStaticMethods(methods.static);
    delete methods.static;
  }
  if(methods.events) {
    this.addEvents(methods.events);
    delete methods.events;
  }
  this.addInstanceMethods(methods);
}
SDClass.properties = function(props) {
  this.methods(props);
}
SDClass.addEvents = function(props) {
  var keys = Object.keys(props);
  if(!this.prototype.events)
  {
    this.prototype.events = {};
  }
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    this.prototype.events[key] = props[key];
  }
}
SDClass.addStaticMethods = function(props) {
  var keys = Object.keys(props);
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    this[key] = props[key];
  }
}
SDClass.addInstanceMethods = function(props) {
  var keys = Object.keys(props);
  for (var keyIt = 0; keyIt < keys.length; keyIt++) {
    var key = keys[keyIt];
    this.prototype[key] = props[key];
  }
}
var Associateuser = function(data) {
  this.hasSentRequest = false; /* This boolean says whether any ajax request is waiting for response. If there is any request pending response, another request must not be allowed. ###this criteria will be applied when duplicate ajax request may result in inconsistent state in database### */
  this.isAddAssociationFormOpen = false; /* This boolean says whether the add association form is in open or close state. ###Needs to be checked in order not to allow duplicate forms in the page### */
  this.isFormSavedBefore = false; /* This boolean says if the add association form is saved after opening and before closing. If it is saved before closing, a new GET request for the associations listing must be fetched. */

  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    this[keys[i]] = data[keys[i]];
  }

  this.$container = data.$container; /* This variable contains the overall container of that the class works with. This variable in most cases act as a namespace. */
  this.$headerbar = this.$container.find(".headerbar"); /* This variable indicates the headerbar. Headerbar in GUI is the place that contains a 'back' button, a 'title', a 'role_type' selection, a 'role_name' selection  */
  this.$menubar = this.$container.find(".admin-panel .org-role-menubar.ui-row-act-head"); /* This variable refers to the menubar. Menubar in GUI is the place that contains a 'search' field, a 'add user' button, a 'import-xls' button , a 'pagination' component etc. */
  this.$listing = this.$container.find("#org-associated-users"); /* This variable in the UI refers to the list of associations that constitute the main data of the page. */
  this.$associateUserForm = this.$container.find("#org-associate-roles"); /* This variable stores the add-association form */


  this.users = []; /* This variable stores the list of all users once when the page is loaded. */
  this.unassociatedEntities = []; /* The variable stores the list of unassociated entities. The variable is updated everytime a new role_name is chosen. */
  this.currentAddAssociationFormOption = ""; /* This variable stores whether the current add association form is single association or multiple association form */

  this.init();  /* Refer the method for further information on what the function does. */
}
SDClass.create(Associateuser);  /* The normal JavaScript Class is extended to behave as SDClass */
Associateuser.methods({
  "static": {//No I18N
    /* All static methods of the class goes here */
    "showSpinner" : function($freezeContainer) {//No I18N
      for(var i = 0 ; i < arguments.length ; i++)
      {
        Associateuser.freeze(arguments[i]);
      }
      $freezeContainer.prepend("<div class='loader' style='width:100%;text-align: center;position: absolute;z-index: 1000;top: 150px;'><div>Loading...</div>");
    },
    "hideSpinner" : function($unfreezeContainer) {//No I18N
      $unfreezeContainer.find(".loader").remove();
      for(var i = 0 ; i < arguments.length ; i++)
      {
        Associateuser.unfreeze(arguments[i]);
      }
    },
    "sendRequest": function(url, data, onSuccessCallback, onFailureCallback, beforeSendingRequest) {//No I18N
      /* Utility method that sends request to the server. All ajax requests in the class will be channeled through this method. */
      if(!url){
        url = "/";
      }
      if(!data){
        data = {
          "type" : "POST",//No I18N
          "data" : "{}"//No I18N
        }
      }
      if(!onSuccessCallback){
        onSuccessCallback = function(){}
      }
      if(!onFailureCallback)
      {
        onFailureCallback = function(){}
      }
      if(beforeSendingRequest)
      {
        beforeSendingRequest(url,data);
      }
      jQuery.ajax(url, data).done(function(p1,p2,p3){Associateuser.validateResponseAndCallback(p1,onSuccessCallback)}).fail(onFailureCallback);
    },
    "validateResponseAndCallback" : function(data, callback){	//No I18N
      try{
	JSON.parse(data);
      } catch (e){
	//if its anything other than json.. then we know that its serving the login html page.
	showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.nosession"), 'isAutoHide=false');//No I18N
	return;
      }
      callback(data);
    },
    "changeURLInLocationBarWithoutReload" : function(paramChangesObj){//No I18N
      /* Since the page updates its data as per user operations through ajax requests (and not by page refresh), the URL might be displaying the parameters using which the page was initially loaded. In order to change the url without refreshing the page, this method must be used. */
      var currentURL = window.location.href;
      var params = Associateuser.getURLParams(currentURL);
      var keys = Object.keys(paramChangesObj);
      for(var i = 0 ; i < keys.length ; i++ )
      {
        if(paramChangesObj[keys[i]])
        {
          params[keys[i]] = paramChangesObj[keys[i]];
        }
        else
        {
          delete params[keys[i]];
        }
      }
      history.replaceState({}, jQuery("title").text(), window.location.origin+window.location.pathname+"?"+Associateuser.stringifyParams(params));
    },
    "getURLParams" : function(url) {//No I18N
      /* This method gets the url from the browser's location bar and splits the parameters from the string and returns a JSONObject for the same. */
      var paramPart = url.split("?")[1];
      var params = paramPart.split("&");
      var paramObj = {};
      for(var i=0;i<params.length;i++)
      {
        var param = params[i].split("=");
        paramObj[param[0]]=param[1];
      }
      return paramObj;
    },
    "stringifyParams" : function(paramObj){//No I18N
      /* This method does the opposite of getURLParams. It gets a JSONObject of the parameters and returns a query string */
      var keys = Object.keys(paramObj);
      var serializedStr = "";
      var i;
      for(i = 0 ; i < keys.length-1 ; i++)
      {
        serializedStr += keys[i]+"="+paramObj[keys[i]]+"&";
      }
      serializedStr += keys[i]+"="+paramObj[keys[i]];
      return serializedStr;
    },
    "constructSelectComponent": function($container, data, fields) {//No I18N
      /* 
      This method creates a <select> component under the jQuery object specified by $container. 
      For the <option> of the <select> the data must be given through {data} parameter. It is an array of objects.
      {fields} parameter is a map that says which key each object in the {data} array represents the value field of <option> and text for the <option>
      Precisely , for data with 
      data = {
        "valueField" : "key_for_value",
        "nameField" : "key_for_text"
      }
      
      <option value='data[iteration_counter].key_for_value'>data[iteration_counter].key_for_text</option>
      */

      $container.append("<select></select>");
      $select = $container.find("select").last();
      for (var i = 0; i < data.length; i++) {
        $select.append("<option value='" + data[i][fields.valueField] + "'>" + encodeHTML(data[i][fields.nameField]) + "</option>");
        $select.find("option").last().data("rolename",data[i][fields.nameField]);
      }
      return $select;
    },
    "slideClose": function($addAssoForm, duration, callback) {//No I18N
      /* This method closes a div that is passed to it as first parameter in an animated manner (slide) for specified duration. Also it executes the callback, once the closing is done. */
      $addAssoForm.animate({
        "height": 0//No I18N
      }, duration, function() {
        $addAssoForm.css("height", "");//No I18N
        $addAssoForm.hide();
        if (callback) {
          callback();
        }
      });
    },
    "slideOpen": function($addAssoForm, duration, callback) {//No I18N
      /* This method opens a div that is passed to it as first parameter in an animated manner (slide) for specified duration. Also it executes the callback, once the opening is done. */
      $addAssoForm.show();
      var height = $addAssoForm.height();
      $addAssoForm.css("height", "0");//No I18N
      $addAssoForm.animate({
        "height": height//No I18N
      }, duration, function() {
        $addAssoForm.css("height", "");//No I18N
        if (callback) {
          callback();
        }
      });
      return $addAssoForm;
    },
    "freeze": function($el) {//No I18N
      /* This method is used to freeze a container with a freeze layer on the top of it and set a boolean as data-attribute */
      $el.css("position", "relative");//No I18N
      $el.prepend("<div class='org-freeze-layer'></div>");
      $el.data("isFrozen", true);//No I18N
      $el.find(".org-freeze-layer").css({
        "position": "absolute",//No I18N
        "top": "0",//No I18N
        "bottom": "0",//No I18N
        "left": "0",//No I18N
        "right": "0",//No I18N
        "background-color": "#EFEFEF",//No I18N
        "opacity": "0.3",//No I18N
        "z-index": "999"//No I18N
      });
    },
    "unfreeze": function($el) {//No I18N
      /* This method does the opposite of freeze method */
      $el.css("position", "");//No I18N
      $el.find(".org-freeze-layer").remove();
      $el.data("isFrozen", null);//No I18N
    },
    "fadeIn": function($el, duration, callback) {//No I18N
      /* Similar to slideOpen but with a fading effect */
      $el.css({
        "opacity": "0",//No I18N
        "display": "block"//No I18N
      });
      $el.animate({
        "opacity": "1"//No I18N
      }, duration, function() {
        $el.css("opacity", "");//No I18N
        if (callback) {
          callback();
        }
      })
    },
    "fadeOut": function($el, duration, callback) {//No I18N
      /* Similar to slideClose but with a fading effect */
      $el.css("opacity", "1");//No I18N
      $el.animate({
        "opacity": "0"//No I18N
      }, duration, function() {
        $el.css({
          "opacity": "",//No I18N
          "display": "none"//No I18N
        });
        if (callback) {
          callback();
        }
      })
    },
    "on": function() {//No I18N
      /* 
      
      This method is used to set jQuery events. All events that are set are channelised through this method. Native jQuery method will not be used. 
      Q.) WHY CHANNELISE EVENT REGISTERING THROUGH THIS METHOD? 
      A.) This channelizing is done primarily to achieve extended security to the application. There are situations when one operation is being carried out by the user, the user must not be allowed to do any other operations. To prevent user from doing the forbidden operation, the container where operations are forbidden must be frozen. This function works with freeze and unfreeze methods. This method checks if the container is frozen and decides whether to continue with the event execution or not.
      This method recieves three to four arguments. 
      First argument(mandatory) is the jQuery object/array on which the event must be set.
      The second argument(mandatory) is the event name itself. 
      Third argument(optional) is an object containing the jQuery object freeze layer to be checked before executing the event
      Fourth argument(mandatory) is the function that needs to be executed in case the operation is allowed.

      */
      var action, $el, data, callback;
      action = arguments[0];
      $el = arguments[1];
      switch (arguments.length) {
        case 2:
          data = {};
          callback = function() {};
          break;
        case 3:
          if (typeof arguments[2] == "function") {
            data = {};
            callback = arguments[2];
          } else if (typeof arguments[2] == "object") {
            callback = function() {};
            data = arguments[2];
          }
          break;
        case 4:
          data = arguments[2];
          callback = arguments[3];
          break;
        default:
          throw ("Not enough parameters available for Associateuser.on");//No I18N
      }
      $el[action](function(evt) {
        var isContainerFrozen = false;
        if (data && data.freezeLayer) {
          isContainerFrozen = data.freezeLayer.data("isFrozen");//No I18N
        }
        if (!isContainerFrozen) {
          callback(evt);
        }
      });
    }
  },
  "changeToNewRoleType": function(roleType, roleName) {//No I18N
    /* This method updates all the role specific labels in the UI with the newly selected role_type and role_name */

    var instanceThis = this;
    var roleType = roleType.toLowerCase();
    if (!roleName) {
      roleName = "--";
    }
    /* For empty association table, the message must correspond to the role type chosen */
    jQuery("#orgRoles.associate-users #empty-association-table .org-empty-association").text(getMessageForKey("sdp.admin.orgrole.roles." + roleType + ".association.empty"));

    /* For each element in the Association Table, the message must correspond to the role type chosen */
    jQuery("#orgRoles.associate-users #association-element-template .org-entity label").text(getMessageForKey("sdp.admin.orgrole." + roleType));
    jQuery("#orgRoles.associate-users #association-element-template .org-user label").html(encodeHTML(roleName));

    /* The first search criteria must correspond to the role type chosen */
    instanceThis.$menubar.find(".ui-searchby ul.sdmenu-dd > li").eq(0).find("a").text(getMessageForKey("sdp.admin.orgrole.searchcriteria." + roleType + "name"));
    var list = instanceThis.userAssociationListing.getSearchCriteriaList();
    list[0].name = getMessageForKey("sdp.admin.orgrole.searchcriteria." + roleType + "name");
    instanceThis.userAssociationListing.setSearchCriteriaList(list);


    /* Add association form must be updated to the chosen role type */
    jQuery("#orgRoles.associate-users #org-associate-roles input[name='org-entity-option'][value='multiple']").next().text(getMessageForKey("sdp.admin.orgrole.adduser." + roleType + ".multi"));
    jQuery("#orgRoles.associate-users #org-associate-roles input[name='org-entity-option'][value='single']").next().text(getMessageForKey("sdp.admin.orgrole.adduser." + roleType + ".single"));
    jQuery("#orgRoles.associate-users #org-associate-roles #org-entity-multiple label[name='orgrole_type']").text(getMessageForKey("sdp.admin.orgrole." + roleType));
    jQuery("#orgRoles.associate-users #org-associate-roles #org-entity-single label[name='orgrole_type']").text(getMessageForKey("sdp.admin.orgrole." + roleType));

    jQuery("#orgRoles.associate-users #org-associate-roles #org-entity-multiple input[name='entity_id']").attr("placeholder", getMessageForKey("sdp.admin.orgrole.adduser.search." + roleType));

    /* The edit association dialog must contain fields according to the role type chosen */
    jQuery("#edit-association-dialog").find("strong[name='orgrole_type_val']").text(getMessageForKey("sdp.admin.orgrole.roles." + roleType));
    jQuery("#edit-association-dialog").find("strong[name='orgrole_name_val']").html(encodeHTML(roleName));
    jQuery("#edit-association-dialog").find("label[name='orgrole_type']").text(getMessageForKey("sdp.admin.orgrole." + roleType));
    jQuery("#edit-association-dialog").find("label[name='orgrole_type']").parent().next("select[name='entity_id']").attr("placeholder", getMessageForKey("sdp.admin.orgrole.adduser.search." + roleType));//No I18N
    jQuery("#edit-association-dialog").find("input[name='entity_id']").attr("placeholder",getMessageForKey("sdp.admin.orgrole.adduser.search."+roleType));
  },
  "createRoleNameSelectComponent": function(data, fieldMap) {//No I18N
    /* This method creates a role_name select element using the constructSelectComponent method */
    var instanceThis = this;
    $container = instanceThis.$headerbar.find(".org-role-filters");
    $select = Associateuser.constructSelectComponent($container, data, fieldMap);
    $select.addClass("form-control fl");
    $select.attr("name", "current_role_id");
    $select.css({
      "width": "200px"//No I18N
    });
    $select.select2({
      formatNoMatches: function(term) {
        return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
      }
    });
    instanceThis.events.roleNameChange(instanceThis, $select);
    return $select;
  },
  "getAllUsersList": function() {//No I18N
    /* This method makes an ajax(channeled through sendRequest) to fetch a list of all users with his/her IDs. */
    var instanceThis = this;
    if (instanceThis.users.length == 0) {
      /* ajax to get all users data and entity that are not yet associated... */
      /* make this ajax synchronous */
      
      Associateuser.sendRequest(instanceThis.url.pathname,{
        "async" : false,//No I18N
        "data" : {//No I18N
          "action" : "searchAutoComplete",//No I18N
          "sType" : "2"//No I18N
        }
      },function(response) {
        response = JSON.parse(response);
        jQuery.each(response,function(k,v){
          instanceThis.users.push({"id" : k,"name" : v});//No I18N
        });
      });
    }
  },
  "getAllUnassociatedEntities": function() {//No I18N
    /* This method makes an ajax(channeled through sendRequest) to fetch a list of all unassociated entities for the current role_type and role_name. */
    var instanceThis = this;
    if (instanceThis.unassociatedEntities.length == 0) {
      /* ajax to get all users data and entity that are not yet associated... */
      /* make this ajax synchronous */
      var onSuccess = function(response) {
        response = JSON.parse(response);
        instanceThis.unassociatedEntities = response;
      }
      var entities = [{
        "id": 301,//No I18N
        "name": "Chennai"//No I18N
      }, {
        "id": 302,//No I18N
        "name": "Bangalore"//No I18N
      }, {
        "id": 303,//No I18N
        "name": "Mumbai"//No I18N
      }, {
        "id": 304,//No I18N
        "name": "SFO"//No I18N
      }];
      onSuccess(entities);
    }
  },
  "verifyBackButtonConfiguration" : function(){ // No I18N
    if(!window.location.hash.length) {
      if(this.isAddAssociationFormOpen)
      {
        this.$headerbar.find("> a").prop("title",getMessageForKey("sdp.admin.orgrole.backtolist")); // No I18N
      }
      else {
        this.$headerbar.find("> a").prop("title",getMessageForKey("sdp.admin.orgrole.back")); // No I18N
      }
    }
    else {
      this.$headerbar.find("> a").prop("title",getMessageForKey("sdp.admin.orgrole.back")); // No I18N
    }
  },
  "closeAssociationForm" : function(){ // No I18N
    this.isAddAssociationFormOpen = false;
    this.verifyBackButtonConfiguration();
  },
  "openAssociationForm" : function(){ // No I18N
    this.isAddAssociationFormOpen = true;
    this.verifyBackButtonConfiguration();
  },
  "getModifiedURL" : function(url){ // No I18N
	  if(isMSP)
	  {
      // Append query parameters for account persistence
      const separator = url.indexOf("?") >= 0 ? "&" : "?";
      url = `${url}${separator}persistAccountID=false&persistentAccountId=${document.getElementById('__persistentAccountId__select').value}`; // No I18N
	  }
	  return url;
  },
  "init": function() {//No I18N
    /* Initialization function that runs when an object for the class is created */

    var start = 1;
    var allowedRecordsCountPerPage = [10, 20, 25, 50];
    var currentRecordsPerPage = allowedRecordsCountPerPage[0];
    var instanceThis = this;
    this.$menubar.hide();
    this.userAssociationListing.setAllowedRecordsCountPerPage(allowedRecordsCountPerPage);
    this.userAssociationListing.setCurrentRecordsPerPage(currentRecordsPerPage);
    this.userAssociationListing.setStartIndex(start);
    this.$emptySearch = this.userAssociationListing.$emptySearch;

    if (!this.currentAddAssociationFormOption) {
      this.currentAddAssociationFormOption = "multiple";//No I18N
    }

    this.initialiseEvents();

    this.$headerbar.find("> a").on('click', function(evt){
      var baseWindow = "_parent"; // No I18N
      if(evt.metaKey || evt.ctrlKey)
      {
        baseWindow = "_blank"; // No I18N
      }
      var assBackURL = instanceThis.url.pathname;
        if(assBackURL.indexOf('action')==-1){    
        assBackURL=assBackURL.indexOf('?')==-1?"?action=vieworg":"&action=vieworg"; //No I18N    
        }
      if(forwardfrom === "ESM"){
        assBackURL = "/ESM.do?type=orgroles"; //No I18N
      }
      if(window.location.hash.length != 0) {
        if(instanceThis.isAddAssociationFormOpen)
        {
          instanceThis.$associateUserForm.find("[action='cancel-add-association']").click();
          jQuery(this).uitooltip({
              content: getMessageForKey("sdp.admin.orgrole.back")
          });
        }
        else {
          window.open(assBackURL,baseWindow);
        }
      }
      else {
        window.open(assBackURL,baseWindow);
      }
      return false;
    });

    return this;
  },
  "initialiseEvents": function() {//No I18N
    this.events.editAssociation(this);
    this.events.reassignUserAssociation(this);
    this.events.deleteUserAssociation(this);
    this.events.addUserAssociation(this);
    this.events.addAssociationForm(this);
    this.events.pagination(this);
    this.events.roleTypeChange(this);
    this.events.searchCriteriaChange(this);
    this.events.addAssociationFormTypeChange(this);
    this.events.searchEvent(this);
    this.events.userDetailView(this);
    this.events.entityDetailView(this);
    Associateuser.on("click",this.$container.find("button[action='import-xls']"),function(evt){//No I18N
      if(forwardfrom == "ESM"){//No I18N
        NewWindow("/importRole.do?operation=step1",'import_roles','900','700','yes','center');//No I18N
      }else{
        window.open("/importRole.do?operation=step1","_self");
      }
    });
    return this;
  },
  "refresh": function(inputData) {//No I18N
    /* This method refreshes the association listing alone */
    var instanceThis = this;
    instanceThis.beforeRefreshListing();
    instanceThis.refreshListing(inputData);
    instanceThis.afterRefreshListing();
  },
  "beforeRefreshListing": function() {//No I18N

  },
  "refreshListing": function(inputData) {//No I18N
    /* This method populates the listing either with a given data. Or if data is not given, it fetches the data. While populating, it freezes the menubar and listing container so that no operation can be performed on the existing data. */
    var instanceThis = this;
    Associateuser.freeze(instanceThis.$menubar);
    Associateuser.freeze(instanceThis.$listing);
    
    instanceThis.populate(inputData);

    Associateuser.unfreeze(instanceThis.$menubar);
    Associateuser.unfreeze(instanceThis.$listing);
  },
  "afterRefreshListing": function() {//No I18N

  },
  "populate": function(associationListing) {//No I18N
    /* This method populates the listing either with a given data. Or if data is not given, it fetches the data. */
    var instanceThis = this;

    /* make an ajax call and get association data by calling sendRequest... */
    /* set data to the userAssociationListing... */
    /* populate it by calling populateListing... */
    if(instanceThis.isRoleIdValid())
    {
      if(!associationListing)
      {
        var row_count = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
        var start_index = instanceThis.userAssociationListing.getStartIndex();
        var get_total_count = (instanceThis.userAssociationListing.getTotalRecords() == null);
        var url = instanceThis.url.pathname+"?action=get_roles_roleid"//No I18N
        url = instanceThis.getModifiedURL(url);
        var jsnObj = {
                "list_info" : {//No I18N
                    "get_total_count" : get_total_count,//No I18N
                    "row_count" : row_count,//No I18N
                    "start_index" : start_index-1//No I18N
                    }
                    };
        var data={
                 "roleid" : instanceThis.currentRoleId,//No I18N
                 "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj)//NO I18N
                   };
        
        var requestData = {
          "type" : "GET",//No I18N
          "async" : false,//No I18N
          "data" : data //No I18N
        };
        Associateuser.sendRequest(url,requestData,function(response){
          response = JSON.parse(response);
          if(response.response_status)
          {
            if(response.response_status.status_code == 2000)
            {
              instanceThis.constructListing(response);
              // showalert("success","");
            }
          }
        });
      }
      else
      {
        instanceThis.constructListing(associationListing);
      }
    }
  },
  "constructListing" : function(data,highlighting){//No I18N
    var instanceThis = this;
    if(instanceThis.isRoleTypeValid && instanceThis.isRoleIdValid())
    {
      if(data.response_status)
      {
        if(data.response_status.status_code == 2000)
        {
          var userAssociation = data.users;
          instanceThis.changeToNewRoleType(instanceThis.currentRoleType,instanceThis.currentRoleName);
          if (!userAssociation || userAssociation.length == 0) {
            instanceThis.userAssociationListing.setData([]);
	    var prevPage = instanceThis.userAssociationListing.calculatePreviousPage();
            if(prevPage.start == instanceThis.userAssociationListing.getStartIndex()){
		    instanceThis.userAssociationListing.showEmptyMessage(function() {
		      Associateuser.freeze(instanceThis.$menubar);
		      instanceThis.$menubar.hide();
		    });
	    }else{
		instanceThis.userAssociationListing.previousPage();
		instanceThis.refresh();
	    }
          }
          else
          {
            instanceThis.userAssociationListing.setData(userAssociation);
            Associateuser.unfreeze(instanceThis.$menubar);
            instanceThis.$menubar.show();
            instanceThis.populateListing(userAssociation,highlighting);
          }
          if(data.list_info && data.list_info.get_total_count )
          {
            instanceThis.userAssociationListing.setTotalRecords(data.list_info.total_count);
            var paginationData = instanceThis.userAssociationListing.serialize();
            instanceThis.setPaginationBtnState(paginationData);
          }
        }
      }
    }
  },
  "populateListing": function(data,highlighting) {//No I18N
    var siteInfo = data;
    function populateCallback($addedElement, data, context) {
      function createElementAndSetData($el, data) {
        $tempEl = $el.clone(true, true);
        var displayText = encodeHTML(data.name);
        $tempEl.data("name" , data.name);//No I18N
        if(data.associated_site && data.associated_site.name)
        {
          displayText += " ( " + encodeHTML(data.associated_site.name) + " ) ";
          $tempEl.data("associated_site",data.associated_site.name);//No I18N
        }
        $tempEl.html(displayText);
        $tempEl.attr("data-entityid", data.id);
        return $tempEl;
      }

      $siteContainer = $addedElement.find(".org-entity span");
      $siteElement = $addedElement.find(".org-entity a").clone(true, true);
      $siteContainer.empty();
      var i=0;
      if(data.config_details)
      {
        for (; i < data.config_details.length - 1; i++) {
          var $tempSiteElement = createElementAndSetData($siteElement, data.config_details[i]);
          $siteContainer.append($tempSiteElement);
          $siteContainer.append(" , ");
        }
        var $tempSiteElement = createElementAndSetData($siteElement, data.config_details[i]);
        $siteContainer.append($tempSiteElement);
      }
      var username = encodeHTML(data.first_name);
      if(data.last_name && data.last_name.length && data.last_name != "null")
      {
        username += " " + encodeHTML(data.last_name);
      }
	  if(isMSP && jQuery("#orgRoles.associate-users select[name='current_role_type']").val()=='ORG')
	  {
		  $addedElement.find("[action='edit-association']").remove();
	  }
      $addedElement.find(".org-user > span > a").html(username);
      $addedElement.find(".org-user > span > a").attr("data-userid", data.id);
      if(data.is_vip_user)
      {
        $addedElement.find(".org-user > span > a").addClass("vip-name-xs");
      }
      var email = data.email_id;
      if(!email && email != "null")
      {
        email = "-";
      }
      $addedElement.find(".org-user-detail .email").html(encodeHTML(email));
      var landline = data.landline;
      if(!landline)
      {
        landline = "-";
      }
      $addedElement.find(".org-user-detail .landline").text(landline);
      var mobile = data.mobile;
      if(!mobile)
      {
        mobile = "-";
      }
      $addedElement.find(".org-user-detail .mobile").text(mobile);
      if(context.highlight && context.highlightText.length)
      {
        var $field = $addedElement.find(context.highlightField);
        jQuery.each($field,function(k,v){
          var text = jQuery(v).text();
          var matchIndex = text.indexOf(context.highlightText);
          if(matchIndex != -1)
          {
            var matchEndIndex = matchIndex+context.highlightText.length;
            jQuery(v).html(encodeHTML(text.substring(0,matchIndex))+"<mark>"+encodeHTML(text.substring(matchIndex,matchEndIndex))+"</mark>"+encodeHTML(text.substring(matchEndIndex)));
          }
        });
      }
    }
    var fields = [],currentCriteriaIndex = 0,searchText="";
    if(highlighting) {
      fields = [".org-entity a",".org-user a",".org-user-detail .email",".org-user-detail .landline"];//No I18N
      currentCriteriaIndex = this.userAssociationListing.getCurrentCriteriaIndex();
      searchText = this.userAssociationListing.$search.find("> input.searchText").val();
    }
    this.userAssociationListing.setData(siteInfo);
    this.userAssociationListing.clear();
    this.userAssociationListing.populate(populateCallback,{"highlight" : highlighting,"highlightField" : fields[currentCriteriaIndex],"highlightText" : searchText});//No I18N
  },
  "prepareSearchCriteria" : function(keyword,isSubstringSearch){//No I18N
    var instanceThis = this;
    var list_info = {};
    if(keyword.length)
    {
      var currentCriteriaIndex = instanceThis.userAssociationListing.getCurrentCriteriaIndex();
      var sType = currentCriteriaIndex + 1; /* index of the current criteria (starting from 1). currentCriteraIndex stores it with zero-indexing. But the request needs it in one-indexing */
      var eType = ""; /* should be either SITE or DEPARTMENT or REGION or GROUP. Needed only when sType = 1 */
      if(sType == 1)
      {
        eType = instanceThis.currentRoleType;
      }
      if(isSubstringSearch)
      {
        list_info = {
          "search_fields" : {//No I18N
            "sText" : keyword,//No I18N
            "sType" : sType,//No I18N
            "eType" : eType//No I18N
          }
        };
      }
      else
      {
        switch(sType)
        {
          case 1 :list_info = {
                    "search_fields" : {//No I18N
                      "entity" : keyword//No I18N
                    }
                  }
                  break;
          default :list_info = {
                    "search_fields" : {//No I18N
                      "user" : keyword//No I18N
                    }
                  }
        }
      }
    }
    return list_info;
  },
  "search" : function(keyword,isSubstringSearch,onSuccessCallback,onFailureCallback,beforeSendingRequest) {//No I18N
    var instanceThis = this;
    var $search = instanceThis.userAssociationListing.$search;
    var $searchBox = $search.find(" > input.searchText");
    $suggest = $searchBox.parent().find(".orgsearch_suggestions");//No I18N
    var shouldSearch;
    shouldSearch = instanceThis.isRoleIdValid();
    if(shouldSearch)
    {
      var list_info = instanceThis.prepareSearchCriteria(keyword,isSubstringSearch);
      $search.data("isSearched",true);//No I18N
      if(keyword.length == 0)
      {
        $search.data("isSearched",false);//No I18N
      }
      var row_count = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
      list_info.row_count = row_count;
      list_info.get_total_count = true;
      list_info.start_index = instanceThis.userAssociationListing.getStartIndex();
      list_info.start_index = list_info.start_index-1;

      if(beforeSendingRequest)
      {
        list_info = beforeSendingRequest(list_info);
      }

      var url = instanceThis.url.pathname+"?action=get_roles_roleid"//No I18N
      var jsnObj = {
              "list_info" : list_info//No I18N
      };
      var data={
                   "roleid" : instanceThis.currentRoleId,//No I18N
                   "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj) //NO I18N
                 };
        
        var requestData = {
          "type" : "GET",//No I18N
          "async" : false,//No I18N
          "data" : data //No I18N
        };
      if(!onSuccessCallback)
      {
        onSuccessCallback = function(response){
          response = JSON.parse(response);
          if(response.response_status)
          {
            if(response.response_status.status_code == 2000)
            {
              if(response.users && response.users.length)
              {
                instanceThis.constructListing(response);
                instanceThis.userAssociationListing.setStartIndex(1);
              }
              else
              {
                instanceThis.$listing.empty();
              }
            }
          }
        };
      }
      Associateuser.sendRequest(url,requestData,onSuccessCallback,onFailureCallback);
    }
  },
  "searchForKeyWord" : function (keyword,previousSearchText,isSubstringSearch) {//No I18N
    /* do ajax here to search with the keyword... */
    var instanceThis = this;
    var $search = instanceThis.userAssociationListing.$search;
    var $searchBox = $search.find(" > input.searchText");
    $suggest = $searchBox.parent().find(".orgsearch_suggestions");//No I18N
    var shouldSearch;
    if(isSubstringSearch)
    {
      shouldSearch = instanceThis.isRoleIdValid() && (previousSearchText != keyword);
    }
    else
    {
      shouldSearch = instanceThis.isRoleIdValid();
    }
    if(shouldSearch)
    {
      var list_info = instanceThis.prepareSearchCriteria(keyword,isSubstringSearch);
      $search.data("isSearched",true);//No I18N
      if(keyword.length == 0)
      {
        $search.data("isSearched",false);//No I18N
      }
      var row_count = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
      list_info.row_count = row_count;
      list_info.get_total_count = true;
      list_info.start_index = 0;

      var url = instanceThis.url.pathname+"?action=get_roles_roleid"//No I18N
      var jsnObj = {
              "list_info" : list_info//No I18N
      };
      var data =  {
                     "roleid" : instanceThis.currentRoleId,//No I18N
                     "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj)//NO I18N
                   };
        
        var requestData = {
          "type" : "GET",//No I18N
          "async" : false,//No I18N
          "data" : data//No I18N
        };
      Associateuser.sendRequest(url,requestData,function(response){
        response = JSON.parse(response);
        if(response.response_status)
        {
          if(response.response_status.status_code == 2000)
          {
            if(response.users && response.users.length)
            {
              instanceThis.constructListing(response);
              instanceThis.userAssociationListing.setStartIndex(1);
            }
            else
            {
              instanceThis.$listing.empty();
	      if(response.list_info && response.list_info.get_total_count )
	      {
		instanceThis.userAssociationListing.setTotalRecords(response.list_info.total_count);
		var paginationData = instanceThis.userAssociationListing.serialize();
		instanceThis.setPaginationBtnState(paginationData);
	      }
	      var $clone = instanceThis.$emptySearch.clone();
	      $clone.find('.org-empty-search').text(getMessageForKey("sdp.admin.orgrole.message.emptysearch")+": "+$searchBox.val());
	      instanceThis.$listing.append($clone);
            }
          }
        }
      });
    }
  },
  "reassignUserAndClose" : function($form) {//No I18N
    function onSuccessCallback() {
      closeDialog();
    }
    this.reassignUser($form, onSuccessCallback);
  },
  "reassignUser" : function($form,onSuccessCallback) {//No I18N
    var instanceThis = this;

    function serializeForm($form) {
      var json = {
        "role_details" : [//No I18N
          {
            "old_user_id" : $form.find("[name='user_id']").data("old_user_id"),//No I18N
            "id" : $form.find("input[name='role_id']").val(),//No I18N
            "user_id" : $form.find("[name='user_id']").select2("val")    //No I18N
          }
        ]
      }
      return json;
    }

    function formValid(json) {
      if(json.role_details[0].user_id > 0){
      	return true;
      }else{
      	showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.nousersel"), 'isAutoHide=false');	//No I18N
      	return false;
      }
    }
    var formData = serializeForm($form);
    if (formValid(formData)) {
      if (!instanceThis.hasSentRequest) {
	function onSuccess(response) {
          response = JSON.parse(response);
	  instanceThis.hasSentRequest = false;
          if(response.response_status)
          {
            if(response.response_status.status_code == 2000)
            {
	      instanceThis.userAssociationListing.setTotalRecords(null);
              instanceThis.refresh();
              if (onSuccessCallback) {
                onSuccessCallback();
              }
              showalert("success",getMessageForKey("sdp.admin.orgrole.messages.success.reassignuser"),'isAutoHide=true');//No I18N
            }
            else if(response.response_status.status_code == 400)
            {
              showalert("failure",response.response_status.message,'isAutoHide=true');//No I18N
            }
	  }
        }

        /*instanceThis.hasSentRequest = true;*/
        /* ajax goes here... */
        var data = {
                       "action" : "update_association",//No I18N
                       "operation_type" : "update_user",//No I18N
                       "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(formData) : JSON.stringify(formData) //No I18N
                     };
        
        Associateuser.sendRequest(instanceThis.url.pathname,{
          "type" : "POST",//No I18N
          "data" : data //No I18N
        },onSuccess);
      }
    }

  },
  /* EDIT ASSOCIATION METHODS STARTS */
  "editAssociationAndClose": function($form) {//No I18N
    function onSuccessCallback() {
      closeDialog();
    }
    this.editAssociation($form, onSuccessCallback);
  },
  "editAssociation": function($form, onSuccessCallback) {//No I18N
    var instanceThis = this;

    function serializeForm($form) {
      var json = {
        "role_details": [//No I18N
          {
            "user_id": null,//No I18N
            "id": null,//No I18N
            "config_details": []//No I18N
          }
        ]
      }
      json.role_details[0].id = $form.find("input[name='role_id']").val();
      json.role_details[0].user_id = $form.find("[name='user_id']").select2("val"); //No I18N
      json.role_details[0].config_details = $form.find("[name='entity_id']").select2("val");//No I18N
      return json;
    }

    function formValid(json) {
      return json.role_details[0].config_details.length;
    }
    var formData = serializeForm($form);
    if (formValid(formData)) {
      if (!instanceThis.hasSentRequest) {
	function onSuccess(response) {
          response = JSON.parse(response);
	  instanceThis.hasSentRequest = false;
          if(response.response_status)
          {
            if(response.response_status.status_code == 2000)
            {
              instanceThis.refresh();
              if (onSuccessCallback) {
                onSuccessCallback();
              }
              showalert("success",getMessageForKey("sdp.admin.orgrole.messages.success.editassociation"),'isAutoHide=true');//No I18N
            }
            else if(response.response_status.status_code == 400)
            {
              showalert("failure",response.response_status.message,'isAutoHide=true');//No I18N
            }
	  }
        }
        /*instanceThis.hasSentRequest = true;*/
        /* ajax goes here... */
        var data={
                                     "action" : "update_association",//No I18N
                                     "operation_type" : "update_user_association",//No I18N
                                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(formData) : JSON.stringify(formData) //No I18N
                 };
         
        Associateuser.sendRequest(instanceThis.getModifiedURL(instanceThis.url.pathname),{
          "type" : "POST",//No I18N
          "data" : data //No I18N
        },onSuccess);
      }
    }else{
	showalert("failure", getMessageForKey("sdp.admin.orgrole.messages.failure.noentity"), 'isAutoHide=false'); //NO I18N
    }
  },
  /* EDIT ASSOCIATION METHODS ENDS */



  /* ADD ASSOCIATION METHODS STARTS */
  "clearSearchParameters" : function() {//No I18N
    var $search = this.userAssociationListing.$search;
    var $searchBox = $search.find(" > input.searchText");
    $searchBox.val("");
  },
  "closeAddAssociation": function() {//No I18N
    var instanceThis = this;
    if(instanceThis.isFormSavedBefore)
    {
      instanceThis.userAssociationListing.setTotalRecords(null);
      instanceThis.userAssociationListing.setStartIndex(1);
      instanceThis.refresh();
      instanceThis.clearSearchParameters();
    }
    Associateuser.slideClose(instanceThis.$associateUserForm, 500, function() {
      instanceThis.isFormSavedBefore = false;
      if(instanceThis.isRoleTypeValid() && instanceThis.isRoleIdValid())
      {
        if (!instanceThis.userAssociationListing.isEmpty()) {
          Associateuser.unfreeze(instanceThis.$menubar);
          instanceThis.$menubar.show();
        }
        Associateuser.unfreeze(instanceThis.$listing);
        instanceThis.$listing.show();
      }
      var isSingle = instanceThis.$associateUserForm.find("input[name='org-entity-option'][value='single']").prop("checked");//No I18N
      if (isSingle) {
        instanceThis.singleOptionForm.clear();
      } else {
        instanceThis.multiOptionForm.clear();
      }
    });
  },
  "addAssociation": function($form) {//No I18N
    var instanceThis = this;
    if(instanceThis.isRoleIdValid())
    {
      this.isFormSavedBefore = true;
      var serializedData = {
        "orgroles": [{//No I18N
          "role_id": null,//No I18N
          "user_details": []//No I18N
        }],
        "list_info" : {//No I18N
          "get_total_count" : false,//No I18N
          "row_count" : 10,//No I18N
          "start_index" : 0//No I18N
        }
      }
      var isSingle = $form.find("input[name='org-entity-option'][value='single']").prop("checked");//No I18N
      var formData;
      if (isSingle) {
        formData = instanceThis.singleOptionForm.serialize();
      } else {
        formData = instanceThis.multiOptionForm.serialize();
      }
      serializedData.orgroles[0].role_id = instanceThis.currentRoleId;
      serializedData.orgroles[0].user_details = formData;

      var row_count = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
      var get_total_count = (instanceThis.userAssociationListing.getTotalRecords() == null);
      serializedData.list_info.get_total_count = get_total_count;
      serializedData.list_info.row_count = row_count;

      /* ajax goes here... */
      var data = {
                     "action" : "add_association",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(serializedData) : JSON.stringify(serializedData) //No I18N
                   };
		  if(isMSP)
		  {
				data["persistentAccountId"]=document.getElementById('__persistentAccountId__select').value;//No I18N//No I18N
				data["persistAccountID"]=false;
		  }
      Associateuser.sendRequest(instanceThis.url.pathname,{
          "type" : "POST",//No I18N
          "data" : data //No I18N
      },function(response){
        response = JSON.parse(response);
        if(response.response_status)
        {
          if(response.response_status.status_code == 2000)
          {
            /* instanceThis.userAssociationListing.clear(); */
            /* var obj = { */
            /*   "response_status" : {}, */
            /*   "users" : {} */
            /* } */
            /* obj.response_status = response.response_status; */
            /* obj.users = response.orgroles[0].role_details[0].user_details; */
            /* instanceThis.userAssociationListing.setTotalRecords(null); */
            /* instanceThis.refresh(obj); */

            Associateuser.freeze(instanceThis.$menubar);
            instanceThis.$menubar.hide();
            instanceThis.singleOptionForm.populateFields();
            instanceThis.multiOptionForm.clear();
            instanceThis.multiOptionForm.populateFields();
            showalert("success",getMessageForKey("sdp.admin.orgrole.messages.success.addassociation"),'isAutoHide=true');//No I18N
          }
          else if(response.response_status.status_code == 400)
          {
            showalert("failure",response.response_status.message,'isAutoHide=true');//No I18N
          }
        }
      });
    }
  },
  "addAssociationAndClose": function($form) {//No I18N
    this.addAssociation($form);
    this.closeAddAssociation();
  },
  /* ADD ASSOCIATION METHODS ENDS */


  /* DELETE ASSOCIATION METHODS STARTS */
  "deleteAssociation": function($el) {//No I18N
    /* ajax goes here... */
    var instanceThis = this;
    var index = $el.closest(".ui-row-single").index();//No I18N
    var role_id = this.currentRoleId;
    var user_id = $el.find(".org-user > span > a").attr("data-userid");

    // var entity_ids = [];
    // jQuery.each($el.find(".org-entity a"), function(k, v) {
    //   entity_ids.push(jQuery(v).attr("data-entityid"));
    // });

    var payload = {
      "orgroles": [{//No I18N
        "role_id": role_id,//No I18N
        "user_details": [{//No I18N
          "id": user_id//No I18N
          // ,
          // "config_details": entity_ids,
        }]
      }]
    };
    var dialogBox = showDialog(jQuery('#confirm-delete-dialog').html(),'title='+getMessageForKey("sdp.admin.orgrole.association.confirmdelete")+', width=500, position=absmiddle');//No I18N
    var $dialogBox = jQuery(dialogBox);
    Associateuser.on("click",$dialogBox.find("[action='org_confirm_delete']"),function(evtin){//No I18N
      whenDeleteConfirmed(payload);
      closeDialog();
    });
    Associateuser.on("click",$dialogBox.find("[action='org_cancel_delete']"),function(evtin){//No I18N
      closeDialog();
    });
    function whenDeleteConfirmed(associationData){
      var data = {
                     "action" : "delete_association",//No I18N
                     "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(associationData) : JSON.stringify(associationData) //No I18N
                   };
      
      var requestData = {
          "type" : "POST",//No I18N
          "data" : data //No I18N
        }
      Associateuser.sendRequest(instanceThis.url.pathname,requestData,function(response){
        response = JSON.parse(response);
        if(response.response_status)
        {
          if(response.response_status.status_code == 2000)
          {
            /* instanceThis.userAssociationListing.removeRecord(index); */
            /* if (instanceThis.userAssociationListing.isEmpty()) { */
            /*   instanceThis.userAssociationListing.showEmptyMessage(function() { */
            /*     instanceThis.$menubar.hide(); */
            /*   }); */
            /* } */
            instanceThis.userAssociationListing.setTotalRecords(null);
            instanceThis.populate();
            showalert('success', getMessageForKey("sdp.admin.orgrole.messages.success.delete"), 'isAutoHide=true');//No I18N
          }
          else if(response.response_status.status_code == 400)
          {
            showalert('failure', response.response_status.message , 'isAutoHide=true'); //No I18N
          }
        }
      });
    }
  },
  /* DELETE ASSOCIATION METHODS ENDS */
  "isRoleIdValid" : function(){//No I18N
    return (this.currentRoleId.toString() != "-1");
  },
  "isRoleTypeValid" : function(){//No I18N
    return (this.currentRoleType.toString() != "-1");
  },
  "onInvalidRole" : function(){//No I18N
    var instanceThis = this;
    Associateuser.freeze(instanceThis.$menubar);
    instanceThis.$menubar.hide();
    Associateuser.unfreeze(instanceThis.$listing);
    instanceThis.$listing.show();
    instanceThis.$listing.empty();
    var $clone = instanceThis.$container.find("#invalid-role-message > div").clone();
    $clone.append(getMessageForKey("sdp.admin.orgrole.invalidrolename"));//No I18N
    instanceThis.$listing.append($clone);
  },
  "onInvalidRoleType" : function(){//No I18N
    var instanceThis = this;
    Associateuser.freeze(instanceThis.$menubar);
    instanceThis.$menubar.hide();
    Associateuser.unfreeze(instanceThis.$listing);
    instanceThis.$listing.show();
    instanceThis.$listing.empty();
    var $clone = instanceThis.$container.find("#invalid-role-message > div").clone();
    $clone.append(getMessageForKey("sdp.admin.orgrole.invalidrole"));//No I18N
    instanceThis.$listing.append($clone);
  },
  "onRoleNameChange": function(valueSelected) {//No I18N
    var instanceThis = this;

    instanceThis.userAssociationListing.setTotalRecords(null);
    instanceThis.userAssociationListing.setStartIndex(1);
    instanceThis.$headerbar.find("select[name='current_role_id']").select2("val",valueSelected); // No I18N
    valueSelected = instanceThis.$headerbar.find("select[name='current_role_id']").val();
    instanceThis.currentRoleId = valueSelected;
    instanceThis.currentRoleName = instanceThis.$headerbar.find("select[name='current_role_id'] option[value='"+valueSelected+"']").data("rolename");//No I18N
    if(instanceThis.isRoleIdValid())
    {
      instanceThis.userAssociationListing.clear();
      instanceThis.refresh();
    }
    else
    {
      instanceThis.onInvalidRole();
    }
    if(instanceThis.isAddAssociationFormOpen)
    {
      instanceThis.$associateUserForm.find("a[action='cancel-add-association']").click();
    }
    instanceThis.clearSearchParameters();
    /*  var newParams = { */
   /*   "roleid":valueSelected */
    /* }; */
    /* if(!Associateuser.getURLParams(window.location.href).role) */
   /*  { */
   /*   newParams.role = instanceThis.currentRoleType; */
   /*  } */
    /* Associateuser.changeURLInLocationBarWithoutReload(newParams); */
  },
  "onRoleTypeChange": function(valueSelected) {//No I18N
    var instanceThis = this;
    instanceThis.unassociatedEntities = [];
    /* instanceThis.getAllUnassociatedEntities(); */
    instanceThis.currentRoleType = valueSelected;
    instanceThis.$headerbar.find("select[name='current_role_type']").select2("val",valueSelected); // No I18N
    /* do ajax... */
    /* on success call constructSelectComponent using the data. */
    var $select = instanceThis.$headerbar.find("[name='current_role_id']");
    if(!instanceThis.allRoles[valueSelected])
    {
      instanceThis.allRoles[valueSelected] = [];
    }
    var newArr = instanceThis.allRoles[valueSelected].slice();
    newArr.splice(0, 0, {
      "id": "-1",//No I18N
      "name": " -- " + getMessageForKey("sdp.admin.orgrole.rolename") + " -- "//No I18N
    });
    $selectTemp = instanceThis.createRoleNameSelectComponent(newArr, {
      "nameField": "name",//No I18N
      "valueField": "id"//No I18N
    });
    $optionsTemp = $selectTemp.find("option").clone(true,true);
    if ($select.length > 0) {
      $select.empty();
      $select.append($optionsTemp);
      //$selectTemp.select2("destroy"); // No I18N
      destroySelect2($selectTemp);
      $selectTemp.remove();
    }
    instanceThis.currentRoleId = -1;
    instanceThis.onInvalidRole();
    $select.focus();
    $select.select2("val", -1); // No I18N
    $select.select2("open"); // No I18N
    if(instanceThis.isRoleTypeValid())
    {
      instanceThis.changeToNewRoleType(instanceThis.currentRoleType,instanceThis.currentRoleName);
      /* Associateuser.changeURLInLocationBarWithoutReload({"role":valueSelected,"roleid":null}); */
    }
    else
    {
      instanceThis.onInvalidRoleType();
    }
    if(instanceThis.isAddAssociationFormOpen)
    {
      instanceThis.$associateUserForm.find("a[action='cancel-add-association']").click();
    }

  },
  "onSearchCriteriaChange": function(valueSelected) {//No I18N
    var instanceThis = this;
    instanceThis.userAssociationListing.changeSearchCriteria(valueSelected);
  },
  "getAllCriteria": function() {//No I18N
    var instanceThis = this;
    return instanceThis.userAssociationListing.serialize();
  },
  "setPaginationBtnState" : function(paginationData) {//No I18N
    var instanceThis = this;
    var $prevBtn = instanceThis.$menubar.find("#org-associated-users-pagination").find("[action='prevPage']");
    var $nextBtn = instanceThis.$menubar.find("#org-associated-users-pagination").find("[action='nextPage']");
    (paginationData.end == paginationData.total)?$nextBtn.prop("disabled",true):$nextBtn.prop("disabled",false); //No I18N
    (paginationData.start == 1)?$prevBtn.prop("disabled",true):$prevBtn.prop("disabled",false); //No I18N
  },
  /* EVENTS STARTS */
  "events": {//No I18N
    "userDetailView" : function(instanceThis){ //No I18N
      Associateuser.on("click", instanceThis.$container.find("a[name='org-user-roles']"),{"freezeLayer" : instanceThis.$listing}, function(evt) {//No I18N
        var $detailViewDialog = showDialog(jQuery('#org-user-dialog').html(), 'title=' + jQuery(evt.target).html() + ' - '+getMessageForKey("sdp.admin.orgrole.roles.org")+', width=500, position=absmiddle');//No I18N
        $detailViewDialog = jQuery($detailViewDialog);
        var $body = $detailViewDialog.find("#_DIALOG_CONTENT .org-user-details");
        var $item = $body.find("> div.org-user-row").clone();
        $body.empty();
        var uid = jQuery(evt.target).attr("data-userid");
        var data = {
                       "action" : "get_all_roles_userid",//No I18N
                       "userId" : uid,//No I18N
                       "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON({}) : JSON.stringify({}) //No I18N
                     };
        
        Associateuser.sendRequest(instanceThis.url.pathname,{
          "type" : "GET",//No I18N
          "data" : data //No I18N
        },function(response){
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
      });
    },
    "entityDetailView" : function(instanceThis) {//No I18N
      Associateuser.on("click", instanceThis.$container.find("a[name='org-entity-name']"),{"freezeLayer" : instanceThis.$listing}, function(evt) {//No I18N
        if(instanceThis.isRoleTypeValid())
        {
          var eType = instanceThis.currentRoleType;
          if(instanceThis.isRoleTypeValid())
          {
            var $detailViewDialog = showDialog(jQuery('#org-entity-dialog').html(), 'title=' + jQuery(evt.target).html() + ' - '+getMessageForKey("sdp.admin.orgrole.roles."+eType.toLowerCase()+".details")+', width=500, position=absmiddle'); /* Should do I18N *///No I18N
            $detailViewDialog = jQuery($detailViewDialog);
            var $body = $detailViewDialog.find("#_DIALOG_CONTENT .org-entity-details");
            var $item = $body.find("> div.org-entity-row").clone();
            $body.empty();
            var eid = jQuery(evt.target).attr("data-entityid");
            var data =  {
                          "action" : "get_roles_entity",//No I18N
                          "eType" : eType,//No I18N
                          "eId" : eid,//No I18N
                          "input_json" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON({}) : JSON.stringify({}) //No I18N
                        };
            
            Associateuser.sendRequest(instanceThis.url.pathname,{
              "type" : "GET",//No I18N
              "data" : data //No I18N
            },function(response){
              response = JSON.parse(response);
              if(response.response_status)
              {
                if(response.response_status.status_code == 2000)
                {
                  var allRoles = response.orgroles[0].config_details[0].config_roles;
                  jQuery.each(allRoles,function(index,roleDetail){
                    var $itemTemp = $item.clone();
                    $itemTemp.find("label").html(encodeHTML(roleDetail.role_name));
                    $itemTemp.find("select option").eq(0).html(encodeHTML(roleDetail.user.first_name));
                    $body.append($itemTemp);
                  });
                }
              }
            });
          }
        }
      });
    },
    "addUserAssociation": function(instanceThis) {//No I18N
      function showAssociationForm(){
        if (!instanceThis.isAddAssociationFormOpen) {
          Associateuser.slideOpen(instanceThis.$associateUserForm, 500);
		  if(isMSP){
		  if(document.getElementsByName('current_role_type')[0].value=='ORG'){
			var isSingle = instanceThis.$associateUserForm.find("input[name='org-entity-option'][value='single']").prop("checked");//No I18N
			if(!isSingle)
			{
				instanceThis.$associateUserForm.find("input[name='org-entity-option'][value='single']").prop("checked",true);//No I18N
				jQuery('#org-entity-single').show();
				jQuery('#org-entity-multiple').hide();
			}
			jQuery('#org-associate-roles').children().first().hide();
			}
			else{
				jQuery('#org-associate-roles').children().first().show();
			}
		  }
          instanceThis.openAssociationForm();
          Associateuser.freeze(instanceThis.$menubar);
          Associateuser.freeze(instanceThis.$listing);
          instanceThis.$menubar.hide();
          instanceThis.$listing.hide();

          instanceThis.singleOptionForm.populateFields(instanceThis.unassociatedEntities, instanceThis.users);
          instanceThis.multiOptionForm.populateFields(instanceThis.unassociatedEntities, instanceThis.users);
        }
      }
      Associateuser.on("click", instanceThis.$menubar.find("a[action='org-add-association']"), {//No I18N
        "freezeLayer": instanceThis.$menubar//No I18N
      }, function(evt) {
        showAssociationForm();
      });
      Associateuser.on("click", instanceThis.$container.find("#empty-association-table a[action='org-add-association']"), function(evt) {//No I18N
        showAssociationForm();
      });
    },
    "addAssociationForm": function(instanceThis) {//No I18N
      Associateuser.on("click", instanceThis.$associateUserForm.find("a[action='add-association']"), function(evt) {//No I18N
        instanceThis.addAssociation(jQuery(evt.target).closest("form"));//No I18N
      });
      Associateuser.on("click", instanceThis.$associateUserForm.find("a[action='cancel-add-association']"), function(evt) {//No I18N
        instanceThis.closeAssociationForm();
        instanceThis.closeAddAssociation();
      });
    },
    "deleteUserAssociation": function(instanceThis) {//No I18N
      Associateuser.on("click", instanceThis.$container.find("a[action='delete-association']"), {//No I18N
        "freezeLayer": instanceThis.$listing//No I18N
      }, function(evt) {
        instanceThis.deleteAssociation(jQuery(evt.target).closest(".ui-row-single"));//No I18N
      });
    },
    "reassignUserAssociation" : function(instanceThis){//No I18N
      Associateuser.on("click",instanceThis.$container.find("a[action='reassign-user']"),{//No I18N
        "freezeLayer" : instanceThis.$listing//No I18N
      },function(evt){
        var $editingRow = jQuery(evt.target).closest(".ui-row-single");//No I18N
        var sites = [];
        jQuery.each($editingRow.find(".org-entity a"), function(k, v) {
          var tempObj = {
            "id": jQuery(v).attr("data-entityid"),//No I18N
            "name": jQuery(v).data("name"),//No I18N
            "associated_site" : jQuery(v).data("associated_site")//No I18N
          }
          sites.push(tempObj);
        });
        var user = {
          "id": $editingRow.find(".org-user > span > a").attr("data-userid"),//No I18N
          "name": $editingRow.find(".org-user > span > a").html(),//No I18N
          "association" : $editingRow.find(".email").html(),//No I18N
	  "is_vip_user": $editingRow.find(".org-user > span > a").hasClass("vip-name-xs")//No I18N
        }
        if(user.association == "-")
        {
          delete user.association;
        }

        var dialogBox = showDialog(jQuery("#edit-association-dialog").html(), 'title=' + jQuery(evt.target).closest(".ui-row-single").find(".org-user a[name='org-user-roles']").html() + ' - '+getMessageForKey("sdp.admin.orgrole.edituserassociation")+', width=500, position=absmiddle');//No I18N
        var $dialogBox = jQuery(dialogBox);
        $dialogBox.find("form").prepend("<input type='hidden' name='role_id' value='" + instanceThis.currentRoleId + "'></input>");

        var roleId = instanceThis.currentRoleId;
        var roleType = instanceThis.currentRoleType;

        var id_arr = [];
        jQuery.each(sites,function(k,v){
          id_arr.push(v.id);
        });
        function defaultFormat(item){
          var displayText = item.name;
          if(item.association)
          {
            displayText += " , " + item.association;
          }
          return encodeHTML(displayText);
        }
        var formattingFunction = {
          "DEPARTMENT" : function(entity){//No I18N
            if(entity.associated_site)
            {
              return encodeHTML(entity.name +" , "+entity.associated_site);
            }
            else
            {
              return encodeHTML(entity.name)+" , "+getMessageForKey("sdp.admin.technician.addtechnician.nosite");
            }
          },
          "SITE" : defaultFormat,//No I18N
          "REGION" : defaultFormat,//No I18N
          "GROUP"  : defaultFormat//No I18N
        }
        $dialogBox.find("input[name='entity_id']").select2({
          "multiple" : true, // No I18N
          formatResult : formattingFunction[roleType],
          formatSelection : formattingFunction[roleType],
          formatNoMatches: function(term) {
            return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
          },
          query: function (query){
              var data = {results: sites};
              query.callback(data);
          }
        });
        $dialogBox.find("input[name='entity_id']").select2("data",sites); // No I18N
        $dialogBox.find("input[name='entity_id']").select2("readonly",true); // No I18N

        $dialogBox.find("[name='user_id']").data("old_user_id",user.id);//No I18N
        $dialogBox.find("[name='user_id']").val(user.id);
	var chkAndAppendEmail = function (item){
		if(item.association){
			return ", "+item.association;
		}
		return "";
	}
        applySelect2($dialogBox.find("[name='user_id']"),user.id,user.name+chkAndAppendEmail(user), user.is_vip_user);

        $dialogBox.find("button[action='edit-association-btn']").on('click', function(evt) {
          instanceThis.reassignUserAndClose(jQuery(evt.target).closest("form"));//No I18N
        });

        $dialogBox.find("button[action='edit-close-dialog']").on('click', function(evt) {
          destroySelect2(jQuery('.org-dialog-wrap select[multiple]')); closeDialog();
        });
      });
    },
    "editAssociation": function(instanceThis) {//No I18N
      Associateuser.on("click", instanceThis.$container.find("a[action='edit-association']"), {//No I18N
        "freezeLayer": instanceThis.$listing//No I18N
      }, function(evt) {
        var $editingRow = jQuery(evt.target).closest(".ui-row-single");//No I18N
        var sites = [];
        jQuery.each($editingRow.find(".org-entity a"), function(k, v) {
          var tempObj = {
            "id": jQuery(v).attr("data-entityid"),//No I18N
            "name": jQuery(v).data("name"),//No I18N
            "associated_site" : jQuery(v).data("associated_site")//No I18N
          }
          sites.push(tempObj);
        });
        var user = {
          "id": $editingRow.find(".org-user > span > a").attr("data-userid"),//No I18N
          "name": decodeHTML($editingRow.find(".org-user > span > a").html()),//No I18N
          "association" : $editingRow.find(".email").html(),//No I18N
	  "is_vip_user": $editingRow.find(".org-user > span > a").hasClass("vip-name-xs")//No I18N
        }
        if(user.association == "-")
        {
          delete user.association;
        }

        var dialogBox = showDialog(jQuery("#edit-association-dialog").html(), 'title=' + jQuery(evt.target).closest(".ui-row-single").find(".org-user a[name='org-user-roles']").html() + ' - '+getMessageForKey("sdp.admin.orgrole.edituserassociation")+', width=500, position=absmiddle');//No I18N
        var $dialogBox = jQuery(dialogBox);
        $dialogBox.find("form").prepend("<input type='hidden' name='role_id' value='" + instanceThis.currentRoleId + "'></input>");

        var formattingFunction = {
          "DEPARTMENT" : function(entity){//No I18N
            if(entity.name == "<DELETED>")
            {
              return "<span class='deleted_entity'>"+getMessageForKey("sdp.admin.orgrole.entity.department.deleted")+"</span>";
            }
            if(entity.associated_site)
            {
              return encodeHTML(entity.name +" , "+entity.associated_site);
            }
            else
            {
              return encodeHTML(entity.name)+" , "+getMessageForKey("sdp.admin.technician.addtechnician.nosite");
            }
          },
          "SITE" : function(item){//No I18N
            var displayText = item.name;
            if(displayText == "<DELETED>")
            {
              return "<span class='deleted_entity'>"+getMessageForKey("sdp.admin.orgrole.entity.site.deleted")+"</span>";
            }
            if(item.association)
            {
              displayText += " , " + item.association;
            }
            return encodeHTML(displayText);
          },
          "REGION" : function(item){//No I18N
            var displayText = item.name;
            if(displayText == "<DELETED>")
            {
              return "<span class='deleted_entity'>"+getMessageForKey("sdp.admin.orgrole.entity.region.deleted")+"</span>";
            }
            if(item.association)
            {
              displayText += " , " + item.association;
            }
            return encodeHTML(displayText);
          },
          "GROUP"  : function(item){//No I18N
            var displayText = item.name;
            if(displayText == "<DELETED>")
            {
              return "<span class='deleted_entity'>"+getMessageForKey("sdp.admin.orgrole.entity.group.deleted")+"</span>";
            }
            if(item.association)
            {
              displayText += " , " + item.association;
            }
            return encodeHTML(displayText);
          }
        }
        var roleId = instanceThis.currentRoleId;
        var roleType = instanceThis.currentRoleType;
        var id_arr = [];
        jQuery.each(sites,function(k,v){
          id_arr.push(v.id);
        });
        $dialogBox.find("input[name='entity_id']").val(id_arr);
        $dialogBox.find("input[name='entity_id']").select2({
          ajax: {
            url: "/OrgRoles.do",//No I18N
            dataType: 'json',//No I18N
            type:"GET",//No I18N
            data: function (term, page) {
            var data = {
                       "action" : "unusedEntities",//No I18N
                       "limit" : 25,//No I18N
                       "offset" : 0,//No I18N
                       "roleId" : roleId,//No I18N
                       "eType" : roleType,//No I18N
                       "needCount" : true,//No I18N
                       "sText": term // search term//No I18N
                   };
			   if(isMSP)
		  		{
				data["persistentAccountId"]=document.getElementById('__persistentAccountId__select').value;//No I18N
				data["persistAccountID"]=false;
		  		}
            return data;
            },
            results: function (data, page) { // parse the results into the format expected by Select2.
                // since we are using custom formatting functions we do not need to alter the remote JSON data
                if(!data.entities)
                {
                  data.entities = [];
                }
                var arr = sites.concat(data.entities);
                return {
                  "results": arr,//No I18N
                  "text" : "name"//No I18N
                };
            },
            cache: true
          },
          multiple : true,
          initSelection : function(element, callback) {
            callback(sites);
          },
          formatNoMatches: function(term) {
            return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
          },
          formatResult : formattingFunction[roleType],
          formatSelection : formattingFunction[roleType]
        });

        var format = function format(item){
		var vipClass = "";
		if(item.is_vip_user)
		{
			vipClass = "vip-name-xs"; // No I18N
		}
		var $div = jQuery("<div></div>");
		var $span = jQuery("<span></span>");
		$span.addClass(vipClass);
		var displayText = encodeHTML(item.name);
		  if(item.association)
		  {
		    displayText += " , " + encodeHTML(item.association);
		  }
		$span.html(displayText);
		$div.append($span);
		//return "<span class='"+vipClass+"'>"+item.name+"</span>";
		return $div.html();
	}

        $dialogBox.find("[name='user_id']").select2({
          formatResult : format,
          formatNoMatches: function(term) {
            return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
          },
          formatSelection : format,
          query : function(query) {
            callback({"results" : [user]})
          }
        });
        $dialogBox.find("[name='user_id']").select2("data",user); // No I18N
        $dialogBox.find("[name='user_id']").select2("enable",false); // No I18N

        $dialogBox.find("button[action='edit-association-btn']").on('click', function(evt) {
          instanceThis.editAssociationAndClose(jQuery(evt.target).closest("form"));//No I18N
        });

        $dialogBox.find("button[action='edit-close-dialog']").on('click', function(evt) {
          destroySelect2(jQuery('.org-dialog-wrap select[multiple]')); closeDialog();
        });

      });
    },
    "pagination": function(instanceThis) {//No I18N
      var $recordsPerPageDropDownItems = instanceThis.$menubar.find("#org-associated-users-pagination").find("button[action='recordsPerPage']").next("ul").find("li a");//No I18N
      var $prevBtn = instanceThis.$menubar.find("#org-associated-users-pagination").find("[action='prevPage']");
      var $nextBtn = instanceThis.$menubar.find("#org-associated-users-pagination").find("[action='nextPage']");
      var dataObj = {
        "freezeLayer": instanceThis.$menubar//No I18N
      };
      function setPaginationBtnState(paginationData) {
        (paginationData.end == paginationData.total)?$nextBtn.prop("disabled",true):$nextBtn.prop("disabled",false); //No I18N
        (paginationData.start == 1)?$prevBtn.prop("disabled",true):$prevBtn.prop("disabled",false); //No I18N
      }
      Associateuser.on("click", $recordsPerPageDropDownItems, dataObj, function(evt) {//No I18N
        /* ajax .. */
        /* on success do the following */
        if(instanceThis.isRoleIdValid())
        {
          try{
            var newRecordsPerPage = parseInt(jQuery(evt.target).closest("li").attr("data-value"));//No I18N
            var currentRecordsPerPage = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
            if(currentRecordsPerPage != newRecordsPerPage)
            {
              if(instanceThis.userAssociationListing.$search.data("isSearched"))
              {
                /* call search for keyword */
                var searchText = instanceThis.userAssociationListing.$search.find("> input.searchText").val();
                function beforeSendingRequest (data){
                  data.get_total_count = false;
                  data.row_count = newRecordsPerPage;
                  return data;
                }
                function onsuccess(response){
                  response = JSON.parse(response);
                  if(response.response_status)
                  {
                    if(response.response_status.status_code == 2000)
                    {
                      instanceThis.userAssociationListing.setCurrentRecordsPerPage(newRecordsPerPage);
                      instanceThis.setPaginationBtnState(instanceThis.userAssociationListing.serialize());
                      if(response.users && response.users.length)
                      {
                        instanceThis.constructListing(response);
                      }
                      else
                      {
                        instanceThis.$listing.empty();
                      }
                    }
                  }
                }
                function onfailure(response){
                }
                instanceThis.search(searchText,true,onsuccess,onfailure,beforeSendingRequest);
              }
              else
              {
                var start_index = instanceThis.userAssociationListing.getStartIndex();
                var url = instanceThis.url.pathname+"?action=get_roles_roleid"//No I18N
                var jsnObj = {
                        "list_info" : {//No I18N
                            "get_total_count" : false,//No I18N
                            "row_count" : newRecordsPerPage,//No I18N
                            "start_index" : start_index-1//No I18N
                          }
                        };
                var data = {
                           "roleid" : instanceThis.currentRoleId,//No I18N
                           
                           "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj)//NO I18N
                         };
                
                var requestData = {
                  "type" : "GET",//No I18N
                  "data" : data //No I18N
                };
                Associateuser.sendRequest(url,requestData,function(response){
                  response = JSON.parse(response);
                  if(response.response_status)
                  {
                    if(response.response_status.status_code == 2000)
                    {
                      instanceThis.userAssociationListing.setCurrentRecordsPerPage(newRecordsPerPage);
                      instanceThis.setPaginationBtnState(instanceThis.userAssociationListing.serialize());
                      instanceThis.constructListing(response);
                    }
                  }
                });
              }
            }
          }
          catch(e){
            throw "Records Per Page is not a number";//No I18N
          }
        }
      });
      Associateuser.on("click", $prevBtn, dataObj, function(evt) {//No I18N
        /* ajax .. */
        /* on success do the following */
        if(instanceThis.isRoleIdValid())
        {
          var currentStartIndex = instanceThis.userAssociationListing.getStartIndex();
          var currentRecordsPerPage = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
          var prevPage = instanceThis.userAssociationListing.calculatePreviousPage();
          var newStartIndex = prevPage.start;
          if(currentStartIndex != newStartIndex)
          {
            if(instanceThis.userAssociationListing.$search.data("isSearched"))
            {
              /* call search for keyword */
              var searchText = instanceThis.userAssociationListing.$search.find("> input.searchText").val();
              function beforeSendingRequest (data){
                data.get_total_count = false;
                data.start_index = newStartIndex-1;
                return data;
              }
              function onsuccess(response){
                response = JSON.parse(response);
                if(response.response_status)
                {
                  if(response.response_status.status_code == 2000)
                  {
                    instanceThis.userAssociationListing.previousPage(setPaginationBtnState);
                    if(response.users && response.users.length)
                    {
                      instanceThis.constructListing(response);
                    }
                    else
                    {
                      instanceThis.$listing.empty();
                    }
                  }
                }
              }
              function onfailure(response){

              }
              instanceThis.search(searchText,true,onsuccess,onfailure,beforeSendingRequest);
            }
            else
            {
              var url = instanceThis.url.pathname+"?action=get_roles_roleid";//No I18N
              var jsnObj = {
                      "list_info" : {//No I18N
                          "get_total_count" : false,//No I18N
                          "row_count" : currentRecordsPerPage,//No I18N
                          "start_index" : newStartIndex-1//No I18N
                        }
                      };
              var data = {
                             "roleid" : instanceThis.currentRoleId,//No I18N
                             "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj)//NO I18N
                           };
                
                var requestData = {
                  "type" : "GET",//No I18N
                  "data" : data //No I18N
                };
              Associateuser.sendRequest(url,requestData,function(response){
                response = JSON.parse(response);
                if(response.response_status)
                {
                  if(response.response_status.status_code == 2000)
                  {
                    instanceThis.userAssociationListing.previousPage(setPaginationBtnState);
                    instanceThis.constructListing(response);
                  }
                }
              });
            }
          }
        }
      });
      Associateuser.on("click", $nextBtn, dataObj, function(evt) {//No I18N
        /* ajax .. */
        /* on success do the following */
        if(instanceThis.isRoleIdValid())
        {
          var currentStartIndex = instanceThis.userAssociationListing.getStartIndex();

          var currentRecordsPerPage = instanceThis.userAssociationListing.getCurrentRecordsPerPage();
          var nextPage = instanceThis.userAssociationListing.calculateNextPage();
          var newStartIndex = nextPage.start;
          if(currentStartIndex != newStartIndex)
          {
            if(instanceThis.userAssociationListing.$search.data("isSearched"))
            {
              /* call search for keyword */
              var searchText = instanceThis.userAssociationListing.$search.find("> input.searchText").val();
              function beforeSendingRequest (data){
                data.get_total_count = false;
                data.start_index = newStartIndex-1;
                return data;
              }
              function onsuccess(response){
                response = JSON.parse(response);
                if(response.response_status)
                {
                  if(response.response_status.status_code == 2000)
                  {
                    instanceThis.userAssociationListing.nextPage(setPaginationBtnState);
                    if(response.users && response.users.length)
                    {
                      instanceThis.constructListing(response);
                    }
                    else
                    {
                      instanceThis.$listing.empty();
                    }
                  }
                }
              }
              function onfailure(response){
              }
              instanceThis.search(searchText,true,onsuccess,onfailure,beforeSendingRequest);
            }
            else
            {
              var url = instanceThis.url.pathname+"?action=get_roles_roleid"//No I18N
              var jsnObj = {
                      "list_info" : { //NO I18N
                          "get_total_count" : false,//No I18N
                          "row_count" : currentRecordsPerPage,//No I18N
                          "start_index" : newStartIndex-1//No I18N
                        }
                      };
              var data = {
                             "roleid" : instanceThis.currentRoleId,//No I18N
                             "input_json" : (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsnObj) : JSON.stringify(jsnObj)//NO I18N
                           };
                
                var requestData = {
                  "type" : "GET",//No I18N
                  "data" : data //No I18N
                };
              Associateuser.sendRequest(url,requestData,function(response){
                response = JSON.parse(response);
                if(response.response_status)
                {
                  if(response.response_status.status_code == 2000)
                  {
                    instanceThis.userAssociationListing.nextPage(setPaginationBtnState);
                    instanceThis.constructListing(response);
                  }
                }
              });
            }
          }
        }
      });
    },
    "roleTypeChange": function(instanceThis) {//No I18N
      Associateuser.on("change", instanceThis.$container.find("select[name='current_role_type']"), function(evt) {//No I18N
        var valueSelected = jQuery(evt.target).val();
        instanceThis.onRoleTypeChange(valueSelected);
      });
    },
    "roleNameChange": function(instanceThis, $select) {//No I18N
      if (!$select) {
        $select = instanceThis.$headerbar.find(".org-role-filters select[name='current_role_id']");
      }
      Associateuser.on("change", $select, function(evt) {//No I18N
        var valueSelected = jQuery(evt.target).val();
        instanceThis.onRoleNameChange(valueSelected);
      });
    },
    "searchCriteriaChange": function(instanceThis) {//No I18N
      Associateuser.on("click", instanceThis.$menubar.find(".ui-searchby ul li a"), {//No I18N
        "freezeLayer": instanceThis.$menubar//No I18N
      }, function(evt) {
        var valueSelected = jQuery(evt.target).closest("li").index();//No I18N
        instanceThis.onSearchCriteriaChange(valueSelected);
      });
    },
    "addAssociationFormTypeChange": function(instanceThis) {//No I18N
      instanceThis.$associateUserForm.find('input[name="org-entity-option"]').on('change', function() {
        instanceThis.currentAddAssociationFormOption = jQuery(this).val();
        if (instanceThis.currentAddAssociationFormOption === "multiple") {
          jQuery('#org-entity-single').hide();
          jQuery('#org-entity-multiple').show();
        } else {
          jQuery('#org-entity-single').show();
          jQuery('#org-entity-multiple').hide();
        }
      });
    },
    "searchEvent": function(instanceThis) {//No I18N
      var resultList = [];
      var $search = instanceThis.$menubar.find(".ui-searchby");
      var $searchBox = $search.find(" > input.searchText");
      $suggest = $searchBox.parent().find(".orgsearch_suggestions");//No I18N
      $searchBox.on('click', function(evt) {
        this.setSelectionRange($searchBox.val().length, $searchBox.val().length);
        updateList($searchBox.val());
      });
      instanceThis.$menubar.find("#clearSearch").on('click', function(){
	$searchBox.val("");
	if($search.data("isSearched")){
	  instanceThis.searchForKeyWord("",previousSearchText,true);
	}
	jQuery(this).addClass("hide");
      });
      var previousSearchText = "";
      Associateuser.on("keyup",$searchBox,{"freezeLayer" : instanceThis.$menubar},function(evt) {//No I18N
        var val = $searchBox.val();
	if(val.length){
		instanceThis.$menubar.find("#clearSearch").removeClass("hide");
	}else{
		instanceThis.$menubar.find("#clearSearch").addClass("hide");
	}
        /* down button 40, up button 38, right button 39, left button 37 */
        var suggestionLength = $suggest.find("li").length;
        var isSearchFieldFocussed = ($suggest.find("li.active").length == 0);
        switch (evt.keyCode) {
          case 13:
            /* enter button */
            if (isSearchFieldFocussed) {
              instanceThis.searchForKeyWord(val,previousSearchText,true);
            } else {
              /* selects the highlighted item from the suggestion list */
              var currentSelectedIndex = $suggest.find("li.active").index();
              var id = $suggest.find("li").eq(currentSelectedIndex).attr("data-val");
              $searchBox.val($suggest.find("li").eq(currentSelectedIndex).find('a').text());
              $suggest.find("li").eq(currentSelectedIndex).click();
            }
            previousSearchText = $searchBox.val();
            closeSuggestion();
            break;
          case 27:
            /* esc button */
            closeSuggestion();
            break;
          case 38:
            /* up button */
            var currentSelectedIndex = -1;
            var selectedLi = $suggest.find("li.active");
            if (selectedLi.length > 0) {
              currentSelectedIndex = selectedLi.index();
            }
            $suggest.find("li").removeClass("active");
            var prevIndex = currentSelectedIndex - 1;
            if(prevIndex == -2)
            {
              prevIndex = suggestionLength - 1;
              $suggest.find("li").eq(prevIndex).addClass("active");
            }
            else if(prevIndex > -1) {
              $suggest.find("li").eq(prevIndex).addClass("active");
            }
            break;
          case 40:
            /* down button */
            var currentSelectedIndex = -1;
            var selectedLi = $suggest.find("li.active");
            if (selectedLi.length > 0) {
              currentSelectedIndex = selectedLi.index();
            }
            $suggest.find("li").removeClass("active");
            var nextIndex = currentSelectedIndex + 1;
            if(nextIndex == suggestionLength)
            {
              nextIndex = -1;
            }
            else
            {
              $suggest.find("li").eq(nextIndex).addClass("active");
            }
            break;
          default:
            if (previousSearchText != val) {
              updateList(val);
              /* previousSearchText = val; */
            }
        }
      });

      function closeSuggestion() {
        $search.removeClass("open");
      }
      function openSuggestion(){
        $search.addClass("open");
      }
      function populateList($el, json, condition, callback) {
        $el.empty();
        var execute = false;
        if(!condition)
        {
          execute = true;
        }
        jQuery.each(json, function(k, v) {
          if (execute || condition(v)) {
            var displayText = v.name;
            if(v.association)
            {
              displayText += " , "+v.association;
            }
            $el.append("<li data-val='" + v.id + "'><a href='/'>" + encodeHTML(displayText) + "</a></li>");
          }
        });
        if (callback) {
          callback($el);
        }
        return $el;
      }



      function emptySuggestionList() {
        $suggest.empty();
      }

      function updateList(val) {
        val = trim(val);
        if(instanceThis.isRoleTypeValid())
        {
          if (val.length >= 0) {
            var currentCriteriaIndex = instanceThis.userAssociationListing.getCurrentCriteriaIndex();
            var sType = currentCriteriaIndex + 1; /* index of the current criteria (starting from 1). currentCriteraIndex stores it with zero-indexing. But the request needs it in one-indexing */
            var eType = ""; /* should be either SITE or DEPARTMENT or REGION or GROUP. Needed only when sType = 1 */
            var sText = val; /* search text must be stored in this parameter */
            if(sType == 1)
            {
              eType = instanceThis.currentRoleType;
            }
            /* var url = '/servlet/Select2Servlet?callback=&searchText=' + val + '&page=1&params={"module" : "site", "dropdownLength" : "20"}'; */
            Associateuser.sendRequest(instanceThis.getModifiedURL(instanceThis.url.pathname),{
              "type": "GET",//No I18N
              "data" : {//No I18N
                "action" : "searchAutoComplete",//No I18N
                "sType" : sType,//No I18N
                "eType" : eType,//No I18N
                "sText" : sText,//No I18N
                "count" : 25//No I18N
              },
              "async": true//No I18N
            },function(response){
              /* TODO: response json structure must be made consistent for all entity types */
              response = JSON.parse(response);
                var suggestionList = response.entities;
                emptySuggestionList();
                if(suggestionList)
                {
                  var $el = populateList($suggest, suggestionList, function(cond){ return cond.name && cond.name != ""; }, function($el) {
                    if ($el.find("li").length == 0) {
                      closeSuggestion();
                    }
                    else
                    {
                     openSuggestion();
                    }
                    $el.find("li").on('mouseenter', function(evt) {
                      $el.find("li").removeClass("selected");
                      jQuery(evt.target).addClass("selected");
                    }).on('mouseleave', function(evt) {
                      jQuery(evt.target).removeClass("selected");
                    });
                    $el.find("li").on('click', function(evt) {
                      var clickedItem = jQuery(this).find('a').text();
                      var id = jQuery(this).attr("data-val");
                      $searchBox.val(clickedItem);
                      previousSearchText = clickedItem;
                      instanceThis.searchForKeyWord(id,previousSearchText,false);
                      instanceThis.$menubar.find('#clearSearch').removeClass("hide");
                      closeSuggestion();
                    });
                  });
                }
            });
          } else if (val.length == 0) {
            emptySuggestionList();
            closeSuggestion();
          }
        }
      }
    }
  }
});

var UserAssociationTable = function(params) {
  this.$listContainer = params.$listContainer;
  this.$element = params.$element;
  this.$empty = params.$empty;
  this.data = params.data;
  if (!this.data) {
    this.data = [];
  }
};
SDClass.create(UserAssociationTable);
UserAssociationTable.methods({
  "setData": function(data) {//No I18N
    this.data = data;
  },
  "isEmpty": function() {//No I18N
    return (this.data.length == 0);
  },
  "removeRecord": function(index) {//No I18N
    this.$listContainer.find(".ui-row-single").eq(index).remove();
    this.data.splice(index, 1);
  },
  "populate": function(callback, context) {//No I18N
    if (!callback) {
      callback = function($el, data, context) {}
    }
    for (var i = 0; i < this.data.length; i++) {
      var $clone = this.$element.clone(true, true);
      this.$listContainer.append($clone);
      this.$listContainer = this.$listContainer;
      callback(this.$listContainer.find($clone).last(), this.data[i], context);
    }
  },
  "showEmptyMessage": function(callback, context) {//No I18N
    var $clone = this.$empty.clone(true, true);
    this.$listContainer.empty();
    this.$listContainer.append($clone);
    this.$listContainer = this.$listContainer;
    if (callback) {
      callback(context);
    }
  },
  "clear": function() {//No I18N
    this.$listContainer.empty();
  }
});

var PaginatedUserAssociationTable = function(params) {
  this.$listContainer = params.$listContainer;
  this.$element = params.$element;
  this.$empty = params.$empty;
  this.data = params.data;
  if (!this.data) {
    this.data = [];
  }
  this.$pagination = params.$pagination;
};
UserAssociationTable.extendTo(PaginatedUserAssociationTable);

PaginatedUserAssociationTable.properties({
  "allowedRecordsCountPerPage": null,//No I18N
  "startIndex": null,//No I18N
  "currentRecordsPerPage": null,//No I18N
  "totalRecords": null//No I18N
});
PaginatedUserAssociationTable.methods({
  "setTotalRecords": function(value) {//No I18N
    this.totalRecords = value;
    if(!this.totalRecords)
    {
      if(value==0){
        this.setStartIndex(0);
      }else{
        value = 0;
      }
    }else{
      this.setStartIndex(this.getStartIndex());
    }
    this.$pagination.find(".paginationState span[name='total']").text(value);
  },
  "setStartIndex": function(value) {//No I18N
    this.startIndex = value;
    if(!this.startIndex)
    {
      value = 0;
    }
    this.$pagination.find(".paginationState span[name='start']").text(value);
    if (this.startIndex && this.currentRecordsPerPage) {
      this.endIndex = this.startIndex + this.currentRecordsPerPage - 1;
      if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
      }
      this.$pagination.find(".paginationState span[name='end']").text(this.endIndex);
    }
    else
    {
      this.$pagination.find(".paginationState span[name='end']").text("0");
    }
  },
  "setCurrentRecordsPerPage": function(value) {//No I18N
    this.currentRecordsPerPage = value;
    this.$pagination.find("button[action='recordsPerPage']").html(this.currentRecordsPerPage + " <span class='caret'></span>");
    if (this.startIndex) {
      this.endIndex = this.startIndex + this.currentRecordsPerPage - 1;
      if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
      }
      this.$pagination.find(".paginationState span[name='end']").text(this.endIndex);
    }
  },
  "setAllowedRecordsCountPerPage": function(value) {//No I18N
    this.allowedRecordsCountPerPage = value;

    var $sampleEl = this.$pagination.find("[action='recordsPerPage']").next("ul").find("li").eq(0).clone(true, true);//No I18N
    var $allowedRecordsCountPerPageList = this.$pagination.find("[action='recordsPerPage']").next("ul").empty();//No I18N
    for (var i = 0; i < this.allowedRecordsCountPerPage.length; i++) {
      var $sampleElTemp = $sampleEl.clone(true, true);
      $sampleElTemp.find("a").text(this.allowedRecordsCountPerPage[i]);
      $sampleElTemp.attr("data-value", this.allowedRecordsCountPerPage[i]);
      $allowedRecordsCountPerPageList.append($sampleElTemp);
    }
  },
  "getTotalRecords": function() {//No I18N
    return this.totalRecords;
  },
  "getStartIndex": function() {//No I18N
    return this.startIndex;
  },
  "getCurrentRecordsPerPage": function() {//No I18N
    return this.currentRecordsPerPage;
  },
  "getAllowedRecordsCountPerPage": function() {//No I18N
    return this.allowedRecordsCountPerPage;
  },
  "updatePagination": function() {//No I18N

  },
  "calculatePreviousPage" : function(){//No I18N
    var newStartIndex = parseInt(this.startIndex) - parseInt(this.currentRecordsPerPage);
    if (newStartIndex <= 0) {
      newStartIndex = 1;
    }
    var endIndex = this.startIndex + this.currentRecordsPerPage - 1;
    if (endIndex > this.totalRecords) {
      endIndex = this.totalRecords;
    }
    return {
      "start" : newStartIndex,//No I18N
      "end" : endIndex//No I18N
    }
  },
  "calculateNextPage" : function(){//No I18N
    var newStartIndex = parseInt(this.startIndex) + parseInt(this.currentRecordsPerPage);
    if (newStartIndex > this.totalRecords) {
      newStartIndex = this.startIndex;
    }
    var endIndex = newStartIndex + this.currentRecordsPerPage - 1;
    if (endIndex > this.totalRecords) {
      endIndex = this.totalRecords;
    }
    return {
      "start" : newStartIndex,//No I18N
      "end" : endIndex//No I18N
    }
  },
  "nextPage": function(callback) {//No I18N
    var newStartIndex = parseInt(this.startIndex) + parseInt(this.currentRecordsPerPage);
    if (newStartIndex > this.totalRecords) {
      newStartIndex = this.startIndex;
    }
    var endIndex = newStartIndex + this.currentRecordsPerPage - 1;
    if (endIndex > this.totalRecords) {
      endIndex = this.totalRecords;
    }
    this.endIndex = endIndex;
    this.setStartIndex(newStartIndex);
    if (callback) {
      var paginationData = this.serialize();
      callback(paginationData);
    }
  },
  "previousPage": function(callback) {//No I18N
    var newStartIndex = parseInt(this.startIndex) - parseInt(this.currentRecordsPerPage);
    if (newStartIndex < 0) {
      newStartIndex = 1;
    }
    var endIndex = this.startIndex + this.currentRecordsPerPage - 1;
    if (endIndex > this.totalRecords) {
      endIndex = this.totalRecords;
    }
    this.endIndex = endIndex;
    this.setStartIndex(newStartIndex);
    if (callback) {
      var paginationData = this.serialize();
      callback(paginationData);
    }
  },
  "serialize": function() {//No I18N
    var endIndex = this.endIndex;
    var start = this.startIndex;
    var recordsPerPage = this.currentRecordsPerPage;
    var total = this.totalRecords;
    return {
      "start": start,//No I18N
      "end": endIndex,//No I18N
      "recordsPerPage": recordsPerPage,//No I18N
      "total": total//No I18N
    };
  }
});

AdvancedUserAssociationTable = function(params) {
  this.$listContainer = params.$listContainer;
  this.$element = params.$element;
  this.$empty = params.$empty;
  this.$emptySearch = params.$emptySearch;
  this.data = params.data;
  if (!this.data) {
    this.data = [];
  }
  this.$pagination = params.$pagination;
  this.$search = params.$search;
};
PaginatedUserAssociationTable.extendTo(AdvancedUserAssociationTable);
AdvancedUserAssociationTable.properties({
  "currentCriteriaIndex" : null,//No I18N
  "criteriaList" : []//No I18N
});
AdvancedUserAssociationTable.methods({
  "static": {},//No I18N
  "setSearchCriteriaList": function(list,callback) {//No I18N
    this.criteriaList = list;
    if(callback)
    {
      callback(this.$search);
    }
    jQuery.each(this.$search.find(".orgsearch-criteria li"), function(k, v) {
      jQuery(v).find("a").text(list[k].name);
      jQuery(v).attr("data-value", list[k].id);
    });
    var currentCriteriaIndex = this.getCurrentCriteriaIndex();
    if(!currentCriteriaIndex)
    {
      currentCriteriaIndex = 0;
    }
    this.changeSearchCriteria(currentCriteriaIndex);
  },
  "getSearchCriteriaList": function() {//No I18N
    return this.criteriaList;
  },
  "getCurrentCriteriaIndex" : function(){//No I18N
    return this.currentCriteriaIndex;
  },
  "changeSearchCriteria": function(index,callback) {//No I18N
    this.currentCriteriaIndex = index;
    var list = this.getSearchCriteriaList();
    this.searchCriteria = list[index].id;
    var placeholder = list[index].name;
    if(callback)
    {
      callback(this.$search);
    }
    this.$search.find("input").attr("placeholder", placeholder);
    /* this.$search.find("input").val(""); */
  },
  "serialize": function() {//No I18N
    var obj = this.parent("serialize");//No I18N
    return obj;
  }
});

var AddAssociationForm = function($form, data) {
  this.$form = $form;
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    this[keys[i]] = data[keys[i]];
  }
}

var initAssociations = function(currentRoleId, rolesMap){
  jQuery("#orgRoles.associate-users").hide();
  roleOfRoleId = {"null" : "-1"}; //No I18N
  constructRolesMap = function(){
    var rolesObj = {};
    var orgroles = rolesMap.orgroles;
    if(!orgroles)
    {
      orgroles = [];
    }
    for(var loop_level1_it = 0 ; loop_level1_it < orgroles.length ; loop_level1_it++)
    {
      rolesObj[orgroles[loop_level1_it].orgrole_type] = [];
      var orgrole_details = orgroles[loop_level1_it].orgrole_details;
      for(var loop_level2_it = 0 ; loop_level2_it < orgrole_details.length ; loop_level2_it++)
      {
        var detailObj = {
          "id" : null,//No I18N
          "name" : ""//No I18N
        };
        detailObj.id = orgrole_details[loop_level2_it].id;
        roleOfRoleId[detailObj.id] = orgroles[loop_level1_it].orgrole_type;
        detailObj.name = orgrole_details[loop_level2_it].name;
        rolesObj[orgroles[loop_level1_it].orgrole_type].push(detailObj);
      }
    }
    return rolesObj;
  }
  allRoles = constructRolesMap();
  currentRoleType = roleOfRoleId[currentRoleId];
  if(!currentRoleType){
    currentRoleType = "-1";
  }
  keys = Object.keys(allRoles);
  var index = keys.indexOf("ORG");
  if(index != -1 && !isMSP)
  {
    keys.splice(index,1);
  }
  roleTypeSelectItems = [{"id" : "-1","name" : "--"+ getMessageForKey("sdp.admin.orgrole.roletype") + "--"}];//No I18N
  for(var i = 0 ; i < keys.length ; i++ )
  {
    var obj = {"id" : "","name" : ""};//No I18N
    obj.id = keys[i];
    obj.name= getMessageForKey("sdp.admin.orgrole.roles."+keys[i].toLowerCase());
    roleTypeSelectItems.push(obj);
  }
  $roleTypeSelect = Associateuser.constructSelectComponent(jQuery("#orgRoles.associate-users .org-role-filters"),roleTypeSelectItems, {
    "nameField": "name",//No I18N
    "valueField": "id"//No I18N
  });
  $roleTypeSelect.addClass("form-control fl mr10");
  $roleTypeSelect.attr("name", "current_role_type");
  $roleTypeSelect.css({
    "width": "200px"//No I18N
  });
  $roleTypeSelect.select2({
      formatNoMatches: function(term) {
        return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
      }
  });
  usr_asso_tbl = new AdvancedUserAssociationTable({
    "$listContainer": jQuery("#orgRoles.associate-users .org-roles-wrap .admin-panel #org-associated-users"),//No I18N
    "$element": jQuery("#orgRoles.associate-users #association-element-template > div"),//No I18N
    "$empty": jQuery("#empty-association-table > div"),//No I18N
    "$emptySearch": jQuery("#empty-search-div > div"),//No I18N
    "$pagination": jQuery("#orgRoles.associate-users .org-roles-wrap .ui-row-act-head #org-associated-users-pagination"),//No I18N
    "$search": jQuery("#orgRoles.associate-users .org-roles-wrap .ui-row-act-head .ui-searchby")//No I18N
  });
  usr_asso_tbl.setSearchCriteriaList([{"id":"entity","name": getMessageForKey("sdp.admin.orgrole.searchcriteria."+currentRoleType.toLowerCase()+"name")},{"id" : "user","name" : getMessageForKey("sdp.admin.orgrole.searchcriteria.username")},{"id" : "user","name" : getMessageForKey("sdp.admin.orgrole.email")},{"id":"user","name": getMessageForKey("sdp.admin.orgrole.extn")}]);//No I18N

  singleValueForm = new AddAssociationForm(jQuery("#orgRoles.associate-users .org-roles-wrap .admin-panel #org-associate-roles #org-entity-single"));
  singleValueForm._returnValidPage_ = function(page){
    if(page.startIndex <= 0)
    {
      page.startIndex = 1;
    }
    if(page.startIndex > page.totalCount)
    {
      page.startIndex -= page.recordsPerPage;
    }
    return page;
  }
  singleValueForm.init = function(){
    var instanceThis = this;
    instanceThis.isFormValuesChanged = false;
    instanceThis.startIndex = 1;
    instanceThis.recordsPerPage = 10;
    instanceThis.hasMoreRows = true;

    instanceThis.$form.find("[action='prevPage']").on('click', function(){
      if(jQuery('[name="org_user"][value != ""]').length > 0){
	var $dialogBox = showDialog(jQuery('#confirm-navigation-dialog').html(),'title='+getMessageForKey("sdp.admin.orgrole.confirmnavigate")+', width=500, position=absmiddle');//No I18N
	$dialogBox = jQuery($dialogBox);
	$dialogBox.find("[action='org_confirm_nav']").on('click', function(){
	  instanceThis.doPrev();
	  closeDialog();
	});
  $dialogBox.find("[action='org_cancel_nav']").on('click', function(){
	  closeDialog();
	});
      }else{
      	instanceThis.doPrev();
      }
    });
    instanceThis.$form.find("[action='nextPage']").on('click', function(){
      if(instanceThis.hasMoreRows)
      {
        if(jQuery('[name="org_user"][value != ""]').length > 0){
	  var $dialogBox = showDialog(jQuery('#confirm-navigation-dialog').html(),'title='+getMessageForKey("sdp.admin.orgrole.confirmnavigate")+', width=500, position=absmiddle');//No I18N
	  $dialogBox = jQuery($dialogBox);
	  $dialogBox.find("[action='org_confirm_nav']").on('click', function(){
	    instanceThis.startIndex +=  instanceThis.recordsPerPage;
            instanceThis.refresh();
	    closeDialog();
	  });
    $dialogBox.find("[action='org_cancel_nav']").on('click', function(){
      closeDialog();
	  });
	}else{
          instanceThis.startIndex +=  instanceThis.recordsPerPage;
          instanceThis.refresh();
	}
      }
    });
  }
  singleValueForm.doPrev = function(){
    var currentStartIndex = this.startIndex;
      var currentTotalCount = this.totalCount;
      var recordsPerPage = this.recordsPerPage;
      var newStartIndex = currentStartIndex - recordsPerPage;
      if( newStartIndex > 0 )
      {
        this.startIndex = newStartIndex;
      }
      if(newStartIndex == this.startIndex)
      {
        this.refresh();
      }
  }
  singleValueForm.refresh = function(){
    var instanceThis = this;
    var roleId = jQuery("#orgRoles.associate-users select[name='current_role_id']").val();
    var roleType = jQuery("#orgRoles.associate-users select[name='current_role_type']").val();
    var needCount = (instanceThis.totalCount == null);
    var recordsPerPage = instanceThis.recordsPerPage;
    var offset = instanceThis.startIndex-1;
    var data = {
                   "action" : "unusedEntities",//No I18N
                   "eType" : roleType,//No I18N
                   "limit" : recordsPerPage,//No I18N
                   "offset" : offset,//No I18N
                   "roleId" : roleId,//No I18N
                   "needCount" : needCount//No I18N
                 };
    
    if(isMSP)
	{
		data["persistentAccountId"]=document.getElementById('__persistentAccountId__select').value;//No I18N
		data["persistAccountID"]=false;
	}
    Associateuser.sendRequest("/OrgRoles.do",{//No I18N
      "type" : "GET",//No I18N
      "data" : data //No I18N
    },function(response){
      instanceThis._onReceivingUnassociatedEntities_(instanceThis,response);
    });
  }
  singleValueForm.init();
  singleValueForm.populate = function(unassociatedEntities,users){
    $addAssoFormSingle = this.$form;
    var $fieldsContainer = $addAssoFormSingle.find(".org-form-fields");
    //$addAssoFormSingle.find("[name='org_user']").select2("destroy"); //No I18N
    destroySelect2($addAssoFormSingle.find("[name='org_user']"));
    $fieldsContainer.empty();
    if(!unassociatedEntities)
    {
      unassociatedEntities = [];
    }
    if(!users)
    {
      users = [];
    }
    function defaultFormat(item){
      var displayText = item.name;
      if(item.association)
      {
        displayText += " , " + item.association;
      }
      return displayText;
    }
    var formattingFunction = {
      "DEPARTMENT" : function(entity){//No I18N
        if(entity.associated_site)
        {
          return entity.name +" , "+entity.associated_site;
        }
        else
        {
          return entity.name+" , "+getMessageForKey("sdp.admin.technician.addtechnician.nosite");
        }
      },
	  "ORG" : defaultFormat,//No I18N
      "SITE" : defaultFormat,//No I18N
      "REGION" : defaultFormat,//No I18N
      "GROUP"  : defaultFormat//No I18N
    }
    var roleType = jQuery("#orgRoles.associate-users select[name='current_role_type']").val();
    function format(item){
        var displayText = item.name;
        if(item.association)
        {
          displayText += " , "+item.association;
        }
        return displayText;
      }
    for(var i = 0 ; i < unassociatedEntities.length ; i++)
    {
      var unassociatedEntity = unassociatedEntities[i];
      var $elTemplate = $addAssoFormSingle.find("#org-entity-single-row-item > div").clone(true,true);
      $elTemplate.find("[name='org_entity']").text(formattingFunction[roleType](unassociatedEntity));
      $elTemplate.find("[name='org_user']").attr("data-entityid",unassociatedEntity.id);
      applySelect2($elTemplate.find("[name='org_user']"));
      /*$elTemplate.find("[name='org_user']").select2({
          allowClear : true,
          placeholder : " -- " + getMessageForKey("sdp.admin.orgrole.searchcriteria.username") + " -- ",
          ajax: {
              url: "/OrgRoles.do",//No I18N
              dataType: 'json',//No I18N
              data: function (term, page) {
                  return {
                      "action" : "searchAutoComplete",//No I18N
                      "count" : 10,//No I18N
                      "sType" : 2,//No I18N
                      "sText": term, // search term//No I18N
                  };
              },
              results: function (data, page) { // parse the results into the format expected by Select2.
                  // since we are using custom formatting functions we do not need to alter the remote JSON data
                  var obj = {
                    "results" : data.entities//No I18N
                  };
                  // obj.results.unshift({"id" : "-1","name" : " -- " + getMessageForKey("sdp.admin.orgrole.searchcriteria.username") + " -- "});//No I18N
                  return obj;
              },
              cache: true
          },
          formatSelection: format,
          formatResult: format,
          initSelection : function(element,callback){
            //callback({"id":"-1","name":" -- " + getMessageForKey("sdp.admin.orgrole.searchcriteria.username") + " -- "});//No I18N
          }
        });*/
      $fieldsContainer.append($elTemplate);
    }
    jQuery('.org-entity-single-header').show();
    jQuery('.org-entity-single-navicons').show();
    if(unassociatedEntities.length == 0 )
    {
      this.onEmptyData();
      jQuery('[action="add-association"]').prop('disabled', true); //No I18N
    }else{
      jQuery('[action="add-association"]').prop('disabled', false); //No I18N
    }
  }
  singleValueForm._onReceivingUnassociatedEntities_ = function(instanceThis,response){
    response = JSON.parse(response);
    if(response.list_info)
    {
      instanceThis.hasMoreRows = response.list_info.has_more_rows;
      instanceThis.totalCount = response.list_info.total_count;
    }
    instanceThis.populate(response.entities,[]);
    if(response.list_info.offset == 0){ //neans its first page
      instanceThis.$form.find("[action='prevPage']").prop("disabled", true); //No I18N
    }else{
      instanceThis.$form.find("[action='prevPage']").prop("disabled", false); //No I18N
    }
    if(response.list_info.has_more_rows == false){  //means its last page
      instanceThis.$form.find("[action='nextPage']").prop("disabled", true); //No I18N
    }else{
      instanceThis.$form.find("[action='nextPage']").prop("disabled", false); //No I18N
    }
  }
  singleValueForm.onEmptyData = function() {
    $addAssoFormSingle = this.$form;
    var $fieldsContainer = $addAssoFormSingle.find(".org-form-fields");
    $fieldsContainer.append('<div class="ml5 mt15 mb15"><p class="org-empty-association pad10 ml5">'+ getMessageForKey("sdp.admin.orgrole.allassociated") +'</p></div>');//No I18N
      jQuery('.org-entity-single-header').hide();
      jQuery('.org-entity-single-navicons').hide();
    this.multiValueForm.onEmptyData();
  }
  singleValueForm.populateFields = function(unassociatedEntities,users){
    var instanceThis = this;

    instanceThis.startIndex = 1;
    instanceThis.totalCount = null;
    instanceThis.hasMoreRows = true;

    instanceThis.isFormValuesChanged = false;
    $addAssoFormSingle = instanceThis.$form;
    var roleId = jQuery("#orgRoles.associate-users select[name='current_role_id']").val();
    var roleType = jQuery("#orgRoles.associate-users select[name='current_role_type']").val();
    var needCount = instanceThis.hasMoreRows;
    var recordsPerPage = instanceThis.recordsPerPage;
    if(!unassociatedEntities || !unassociatedEntities.length)
    {
      var data = {
                   "action" : "unusedEntities",//No I18N
                   "eType" : roleType,//No I18N
                   "limit" : recordsPerPage,//No I18N
                   "offset" : 0,//No I18N
                   "roleId" : roleId,//No I18N
                   "needCount" : needCount//No I18N
                 };
      
		if(isMSP)
		{
			data["persistentAccountId"]=document.getElementById('__persistentAccountId__select').value;//No I18N
			data["persistAccountID"]=false;
		}
      Associateuser.sendRequest("/OrgRoles.do",{//No I18N
          "type" : "GET",//No I18N
          "data" : data //No I18N
      },function(response){
        instanceThis._onReceivingUnassociatedEntities_(instanceThis,response);
      });
    }
    else {
      instanceThis.populate(unassociatedEntities,[]);
    }
  }
  singleValueForm.serialize = function(){
    var $fields = this.$form.find(".org-form-fields [name='org_user']");
    var serializedData = [];
    for (var it = 0; it < $fields.length; it++) {
        $field = $fields.eq(it);
        var val = parseInt($field.select2("val"));//No I18N
        if(val && val > 0)
        {
          var user_details = {
              "id": null,//No I18N
              "config_details": []//No I18N
          };
          user_details.id = val;
          user_details.config_details.push($field.attr("data-entityid"));
          serializedData.push(user_details);
        }
    }
    return serializedData;
  }
  singleValueForm.clear = function(){
    $addAssoFormSingle = this.$form;
    $addAssoFormSingle.find("input[name='org_user']").select2("destroy");//No I18N
  }

  multiValueForm = new AddAssociationForm(jQuery("#orgRoles.associate-users .org-roles-wrap .admin-panel #org-associate-roles #org-entity-multiple"));
  multiValueForm.onEmptyData = function() {
    $addAssoFormMultiple = this.$form;
    var $fieldsContainer = $addAssoFormMultiple.find(".org-form-fields");
    $fieldsContainer.hide();
    $fieldsContainer.next("div").show();//No I18N
  }
  multiValueForm.populate = function(unassociatedEntities,users){
    $addAssoFormMultiple = this.$form;
    var $fieldsContainer = $addAssoFormMultiple.find(".org-form-fields");
    $fieldsContainer.show();
    $fieldsContainer.next("div").hide();//No I18N
    var $entitySelect = $addAssoFormMultiple.find("select[name='entity_id']");
    $entitySelect.empty();
    if(!unassociatedEntities)
    {
      unassociatedEntities = [];
    }
    if(!users)
    {
      users = [];
    }
    for(var i = 0; i < unassociatedEntities.length ; i++)
    {
      var entity = unassociatedEntities[i];
      $entitySelect.append("<option value='"+entity.id+"'>"+entity.name+"</option>");
    }
    var roleId = jQuery("#orgRoles.associate-users select[name='current_role_id']").val();
    var roleType = jQuery("#orgRoles.associate-users select[name='current_role_type']").val();

    function defaultFormat(item){
      var displayText = item.name;
      if(item.association)
      {
        displayText += " , " + item.association;
      }
      return encodeHTML(displayText);
    }
    var formattingFunction = {
      "DEPARTMENT" : function(entity){//No I18N
        if(entity.associated_site)
        {
          return encodeHTML(entity.name +" , "+entity.associated_site);
        }
        else
        {
          return encodeHTML(entity.name)+" , "+getMessageForKey("sdp.admin.technician.addtechnician.nosite");
        }
      },
      "SITE" : defaultFormat,//No I18N
      "REGION" : defaultFormat,//No I18N
      "GROUP"  : defaultFormat//No I18N
    }
    $addAssoFormMultiple.find("input[name='entity_id']").select2({
      ajax: {
          url: "/OrgRoles.do",//No I18N
          dataType: 'json',//No I18N
          type:"GET",//No I18N
          data: function (term, page) {
              var data = {
                                 "action" : "unusedEntities",//No I18N
                                 "limit" : 10,//No I18N
                                 "offset" : 0,//No I18N
                                 "roleId" : roleId,//No I18N
                                 "eType" : roleType,//No I18N
                                 "needCount" : true,//No I18N
                                 "sText": term // search term//No I18N
                             };
              
				if(isMSP)
				{
					data["persistentAccountId"]=document.getElementById('__persistentAccountId__select').value;//No I18N
					data["persistAccountID"]=false;
				}
              return data;
          },
          results: function (data, page) { // parse the results into the format expected by Select2.
              // since we are using custom formatting functions we do not need to alter the remote JSON data
              if(!data.entities)
              {
                data.entities = [];
              }
              return { 
                "results": data.entities//No I18N
              };
          },
          cache: true
      },
      multiple : true,
      formatNoMatches: function(term) {
        return getMessageForKey("sdp.admin.orgrole.messages.failure.nomatchfound");
      },
      formatResult : formattingFunction[roleType],
      formatSelection : formattingFunction[roleType]
    });

    applySelect2($addAssoFormMultiple.find("input[name='user_id']"));
    /* $addAssoFormMultiple.find("input[name='user_id']").select2({
      ajax: {
          url: "/OrgRoles.do",//No I18N
          dataType: 'json',//No I18N
          data: function (term, page) {
              return {
                  "action" : "searchAutoComplete",//No I18N
                  "count" : 10,//No I18N
                  "sType" : 2,//No I18N
                  "sText": term, // search term//No I18N
              };
          },
          results: function (data, page) { // parse the results into the format expected by Select2.
              // since we are using custom formatting functions we do not need to alter the remote JSON data
              var obj = {
                "results" : data.entities//No I18N
              }
              // jQuery.each(data,function(k,v){
              //   obj.results.push({"id":k,"name":v});
              // });
              return obj;
          },
          cache: true
      },
      formatSelection: defaultFormat,
      formatResult: defaultFormat
    }); */

    $addAssoFormMultiple.find("input[name='user_id']").select2("val",null);//No I18N
  }
  multiValueForm.populateFields = function(unassociatedEntities,users){
    this.populate(unassociatedEntities,users);
  }
  multiValueForm.serialize = function(){
    var serializedData = [];
    var user_details = {
        "id": null,//No I18N
        "config_details": []//No I18N
    };
    user_details.id = this.$form.find("input[name=user_id]").select2("val");
    if(user_details.id.length)
    {
      user_details.id = parseInt(user_details.id);
      user_details.config_details = this.$form.find("input[name=entity_id]").select2("val");//No I18N
      serializedData.push(user_details);
    }
    return serializedData;
  }
  multiValueForm.clear = function(){
    $addAssoFormMultiple = this.$form;
    $addAssoFormMultiple.find("input[name='user_id']").select2("val",null);//No I18N
    //$addAssoFormMultiple.find("input[name='user_id']").select2("destroy");//No I18N
    destroySelect2($addAssoFormMultiple.find("input[name='user_id']"));
    $addAssoFormMultiple.find("input[name='entity_id']").select2("val",null);//No I18N
    //$addAssoFormMultiple.find("input[name='entity_id']").select2("destroy");//No I18N
    destroySelect2($addAssoFormMultiple.find("input[name='entity_id']"));
  }
  singleValueForm.multiValueForm = multiValueForm;
  multiValueForm.singleValueForm = singleValueForm;
  $orgroleswrap = jQuery("#orgRoles.associate-users .org-roles-wrap");
  var associateUserObj = new Associateuser({
    "$container" : $orgroleswrap,//No I18N
    "allRoles" : allRoles,//No I18N
    "currentRoleType" : currentRoleType,//No I18N
    "currentRoleId" : currentRoleId,//No I18N
    "userAssociationListing" : usr_asso_tbl,//No I18N
    "singleOptionForm" : singleValueForm,//No I18N
    "multiOptionForm" : multiValueForm,//No I18N
    "url" : {//No I18N
      "pathname":"/OrgRoles.do"//No I18N
    }
  });
  /* triggering association listing starts */
  associateUserObj.onRoleTypeChange(currentRoleType);
  if(currentRoleId != "null")
  {
    associateUserObj.onRoleNameChange(currentRoleId);
  }
  /* triggering association listing ends */

  if(currentRoleType!= "-1" && window.location.hash == "#add")
  {
    jQuery("#orgRoles.associate-users .ui-row-act-head a[action='org-add-association']").trigger('click'); 
  }
  jQuery("#orgRoles.associate-users").show();
}
