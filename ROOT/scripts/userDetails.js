/* User/ Technician related Add/ Edit/ Details page section starts*/
var userAdd = (function(){
  var userForm = {};
  var bulkAssociation = {};
  var u_add = {};
      /* GET User/ Technician data*/
      u_add.initNewUserForm = function(isUser, userAddData, id, isDetailForm, changeTo){
        var localUserList = {};
        if (isSCP && userList.isImportReps) {
            //for importing support reps changing isUser to false, as adding details to "support reps"
            //requires technician form.
            isUser = false;
            userAddData.isImportReps = true;
        }
        if  (typeof userList == "undefined"){
          userList = {};
        }
        var user_data = {}, ent_url = "technician"; // No I18N
        u_add.selectedSites = [];
        u_add.selectedSupGrps = [];
        u_add.isUser = (changeTo == "change_as_technician") ? false : isUser ; // No I18N
        u_add.isDetailForm = isDetailForm;
        u_add.ciTypeId = jQuery("#ciTypeId").val(); // No I18N
        u_add.changeTo = changeTo;
        if(isUser){
          var isPortalModifyUsers = (userList.popupfor === "include_orgusers" || userList.popupfor === "exclude_orgusers"); // No I18N
          /* changing (isMDHSetup == "true" && sdp_user.USERTYPE == "Requester") to (isMDHSetup == "true" && sdp_app.IS_ESMDIR && sdp_user.USERTYPE == "Requester")
              because in SCP inside portal, orguser call is made.
              */
              ent_url = (forwardfrom == "ESM" || (isMDHSetup == "true" && sdp_user.USERTYPE == "Requester" && (!sdp_app.IS_MSPOrSCP || sdp_app.IS_ESMDIR) ) || userList.getOrguser || isPortalModifyUsers ) ? "orguser" : "user"; // No I18N
        } else if(isSCP && userAddData.isImportReps || userList.isOrgImport) {
          ent_url = "orguser";// No I18N
        }
        if (isMSP) {
          if (u_add.changeTo === "point_of_contact") {
            user_data.point_of_contact_roles = { SDPointOfContact: true };
          } else if (u_add.changeTo === "account_manager") {// No I18N
            user_data.point_of_contact_roles = { SDAccountManager: true };
          }
        }
        u_add.domainFieldName = isMSP ? "all_domain" : "domain"; // No I18N
        u_add.domainField = "select_" + u_add.domainFieldName; // No I18N
        var returnVal = false;
        u_add.ent_url = ent_url;
        if(id && id != "null" && userAddData.popupfor != "bulkupdate"){ // No I18N
          if(typeof user_details !== "undefined" && user_details && user_details.user && id == user_details.user.id) {
            user_data = user_details.user;
          } else {
            // var ignorefailuremsg = (typeof req_details !== "undefined" && req_details) || (window.opener && window.opener.req_details) ? true : false;  //No I18N
            var url;
            if(userList.url){
                url = userList.url;
            }
            else if(userList.apiEntity && userList.apiModule )
            {
                if(userList.apiModuleId)
                {
                    if(userList.apiModule == "chats"){
                      url = "users/" + id;// No I18N
                    }else{
                      url = userList.apiModule+"/"+userList.apiModuleId+"/"+userList.apiEntity+"/"+id;
                    }
                }
                else{
                    url = userList.apiModule+"/"+userList.apiEntity+"/"+id;
                }
                url="/api/v3/" + url; // No I18N
            }
            else{
                    if (sdp_user.LOGGEDIN_USERID !== parseInt(id) && userList.apiEntity === "on_behalf_of" && userList.apiModule === "requests") {
                          url = userList.apiModule + "/" + userList.apiEntity + "/" + id;// No I18N
                          ent_url = "user";// No I18N
                        } else {
                          url = ent_url + "s/" + id;// No I18N
                        }
                        // SD-99741, //SD-104670,SD-104797
                        if(userList.module === "requests" && $spa.getSearchParam("popupfor") === "detailspage" && url.indexOf('technicians') > -1 ){ //NO I18N
                          url = "requests/"+url;  //NO I18N
                          url = url.replace("technicians","technician"); // NO I18N
                        }
                        url="/api/v3/" + url; // No I18N
            }
            sdpAjax({
              url: url,
              success: function(resp) {
                user_data = resp.user || resp.technician || resp.orguser;
              },
              ignorefailuremessage : true,
              failedCallBack: function(jqXHR, status) {
                /** In request details page, if the user api is failed to fetch, rendering user details using the basic info from request */
                var req_context = null;
                if(typeof req_details !== "undefined" && req_details && $req) {
                  req_context = $req;
                } else if(window.opener && window.opener.req_details && window.opener.$req) {
                  req_context = window.opener.$req;
                }
                if(req_context && req_context.details && req_context.details.request_info && req_context.details.request_info.requester
                    && req_context.details.request_info.requester.id == id) {
                  user_data = req_context.details.request_info.requester;
                  user_data.is_deleted = true; // Assuming the User is deleted.. we need to change this code based on the status code..
                }else if(req_context && req_context.details && req_context.details.request_info && req_context.details.request_info.on_behalf_of
                     && req_context.details.request_info.on_behalf_of.id == id) {
                   user_data = req_context.details.request_info.on_behalf_of;
                   user_data.is_deleted = true; // Assuming the User is deleted.. we need to change this code based on the status code..
                }
                else if(window.opener && window.opener.prev_approval){
                	//used in approve.jsp for showing approver details
					user_data = window.opener.prev_approval.approvers[id];
				}

                var resp = jqXHR.responseJSON;
                if(resp.response_status && resp.response_status.constructor === Array){
                    responseText = resp.response_status[0];
                }
                else{
                    responseText = resp.response_status;
                }
                if(responseText && responseText.messages && responseText.messages[0].status_code == 12345){
                  returnVal = true;
                }
              },

              cache: false,
              async: false
            });
          }
          if(returnVal){
            userList.redirectTo('details',true,id); // No I18N
            return;
          }
          var selDomain = isMSP ? user_data.all_domain : user_data.domain;
          if (selDomain && !jQuery.isEmptyObject(selDomain)){
              user_data[u_add.domainFieldName].text = selDomain.name;
          }
          if(isUser && u_add.isUser){
            if(isSCP || u_add.changeTo !== "showmydetails" || userList.isSearchuserPopup == true){
              //Getting selected value for "Requester allowed to view" field
              var reqallview = {};
              var index = userAddData.requester_allowedorder[user_data.requester_allowed_to_view] || 0;
              reqallview = userAddData.requester_allowedtoview_fields[index];
              user_data.requester_allowed_to_view = reqallview;
            }
          }else{
            user_data.is_technician = true;
          }

          if(!(isUser && u_add.isUser) || userAddData.fromCMDB == "true"){//Roles for technician  // No I18N
        	  var asRoles = user_data.associated_roles || [], selected_roles = [], dcRole = null;
              for(var b=0;b<asRoles.length;b++){
                var discardDCRoles = ['DCAdmin','DCGuest','MDMPAdmin','MDMPGuest']; // No I18N
                if(discardDCRoles.indexOf(trim(asRoles[b].name)) < 0){
                  var discardSiteRoles = ['ViewRequestsNotInAnySite','Resources not in any site','ViewRequester','SDOrgAdmin','Restrict site access']; // No I18N
                  if(discardSiteRoles.indexOf(trim(asRoles[b].name)) < 0){
                    asRoles[b].text = asRoles[b].name;
                    selected_roles.push(asRoles[b]);
                  }
                }else{
                  dcRole = asRoles[b].name;
                }
              }

                user_data.dcRole = dcRole;

              user_data.associated_roles = selected_roles;
          }
        }else{//Need this check for AddNew User form
          if(forwardfrom=="ESM"){ // No I18N
            user_data.is_org_admin = false;
          }
          if(u_add.isUser){
            user_data.is_technician = false;
          }else{
            user_data.is_technician = true;
          }
        }
        userAddData.isFromAcc = userList.fromAcc;
        user_data.domainField = u_add.domainField;
        user_data.sdp_app = sdp_app;
        user_data.sdp_user = sdp_user;

        let allowOrgadmin_Field = (!sdp_app.IS_MDH_SETUP || sdp_user.ROLES.indexOf("SDOrgAdmin") >= 0 || sdp_app.IS_MSPOrSCP);

        user_data.card = userAddData.card;
        user_data.userType = userAddData.userType;
        user_data.has_admin_permission = userAddData.hasAdminPermission;
        user_data.isLoggedInUserDetails = id == sdp_user.LOGGEDIN_USERID;
        user_data.dcIntegrationProductName = userAddData.dcIntegrationProductName;
        user_data.dcPluginProductName = userAddData.dcPluginProductName;
        user_data.ENDPOINT_CENTRAL = userAddData.ENDPOINT_CENTRAL;
        user_data.allowOrgadmin_Field = allowOrgadmin_Field;

        //password policy fields
        user_data.passwordPolicyEnabled = userAddData.passwordPolicyEnabled;
        user_data.min_length = userAddData.min_length;
        user_data.mixed_case = userAddData.mixed_case;
        user_data.splChar = userAddData.splChar;
        user_data.previous_password = userAddData.previous_password;
        user_data.is_login_enabled = (allowOrgadmin_Field || (sdp_user.ROLES.contains("CreateRequester") && (id === "")) ? "" : "readonly"); //NO I18N
        user_data.getOrguser = userAddData.getOrguser;

        //remove sub roles from details page
        if (isMSP && (userAdd.isDetailForm || u_add.changeTo === "change_as_technician")) {
          var excludedMspRoles = {
            ViewInventoryWS: true, ViewReports: true, CreateReports: true, ModifyReports: true, DeleteReports: true, ViewProblems: true, ViewChanges: true, ViewWorkLog: true
          };
          if(u_add.changeTo === "change_as_technician") {
            excludedMspRoles.SDAccountManager = true;
            excludedMspRoles.SDPointOfContact = true;
          }
          if (Array.isArray(user_data.associated_roles)) {
              user_data.associated_roles = user_data.associated_roles.filter(function(role) {
                return !excludedMspRoles.hasOwnProperty(role.name);
              });
          } else {
            user_data.associated_roles = [];
          }
          user_data.isRequesterInMsp = isUser && !userList.isMspRequester;
        }
        if(isIThelpdesk == "true" && u_add.changeTo != "showmydetails" && (!isUser || !u_add.isUser)){ //Getting DC Roles For Technician / User - Change_as_technician
          sdpAjax({
              url : "/UserAPISupportAction.do?method=getDCInfo", // No I18N
              success : function(resp){
                user_data.user_get = resp.user_get;
              },
              async: false
            });
            var inputObject = {}, list_info = {};
                list_info.search_criteria = [{"field" : "name" ,"condition" : "is" ,"value" : "DCGuest","logical_operator":"OR"},{"field" : "name" ,"condition" : "is" ,"value" : "DCAdmin","logical_operator":"OR"}]; // No I18N
                inputObject.list_info = list_info;
            var dataval = sdpAjaxInputData(inputObject);

            sdpAjax({
              url: '/api/v3/technicians/associated_roles', // No I18N
              data : dataval,
              success: function(resp) {
                if(resp.associated_roles.length >0){
                var dc_g = "" ,dc_a = ""; // No I18N
                if(resp.associated_roles[0].name == "DCAdmin"){ // No I18N
                  dc_a = resp.associated_roles[0].id;
                  dc_g = resp.associated_roles[1].id;
                }else{
                  dc_a = resp.associated_roles[1].id;
                  dc_g = resp.associated_roles[0].id;
                }
                user_data.user_get[0].dc_login_details.dcadmin = dc_a;
                user_data.user_get[0].dc_login_details.dcguest = dc_g;
              }
              },
              async: false
            });
        }
        this.renderForm(userAddData, user_data, id);
        // Adding new info "not for ZohoTelephony" for Enable Telephony option ( ProjectID -1683 )
        if(jQuery("#Telephony_Details").length != 0){
          jQuery("#Telephony_Details").find('label[for="enable_telephony"]').append(`<span class="cspr helpText info icon-sm pos-abs top10 right-5 ml5" rel="uitip" help-title="${e_html(translate("sdp.ztsettings.usersettings"))}" rel-class="help-text" mode_html="true" mode_multiline="true" rel-help-icon="true"></span>`);
          jQuery("#enable_telephony").parent().addClass("checkbox-inline");
        }
        $sdEventListener("#mobile_static");  // No I18N
        $sdEventListener("#phone_static");   // No I18N
        if((userAdd.popupfor != "bulkupdate") && ((changeTo == "change_as_technician" && isMDHSetup == "false") || (sdp_app.IS_AE && !isUser && !id))){
            u_add.enableAuthtokenGeneration();
        }
      },
       u_add.selectUser = function(id){
             const name = u_add.constructPortalUserList.users.find((user) => user.id == id);
             selectUserFromSearch(id, name);
       },
      u_add.enableAuthtokenGeneration = function(){
        jQuery("#can_generate_authtoken").prop("checked",true); // No I18N
        jQuery("#can_generate_authtoken").attr("value",true); // No I18N
      },
      /* Constructing FORM layout object, that will be the input for FORMCOMPONENT*/
      u_add.renderForm = function(userAddData, user_data, id){

        var form_fields = u_add.constructFieldsObj(userAddData, user_data);
        var formHolder = "userDetails-section", formTemplate="user-form"; // No I18N

        if(u_add.isDetailForm){
          formTemplate="user-details"; // No I18N
        }
        var metURL = u_add.ent_url;
        if(isSCP && userList.isOrgImport) {
          metURL = "technician"; // No I18N
        } else if(u_add.changeTo === "change_as_technician"){ // No I18N
          metURL = "technician"; // No I18N
          if(u_add.isUser){
            user_data.change_as_technician = true;
          }else{
            user_data.change_as_technician = false;
          }
        }
        if(isMSP) {
          user_data.hasAccountAdminRole = u_add.hasAccountAdminRole();
        }
        var layout_fields = {}, metainfo = {};
        var dataval = {};
        if(jQuery("#cmdbUserType").val() == "child"){
          var indata = {"template" : {"id" : u_add.ciTypeId}}; // No I18N
          dataval = sdpAjaxInputData(indata);
        }
        if(typeof user_details !== "undefined" && user_details && user_details.metainfo) {
          u_add.meta_info = user_details.metainfo.fields;
          user_data.meta_info = user_details.metainfo.fields;
        } else {
          var idStr = "";// No I18N
          if(user_data.id){
            idStr = user_data.id + "/";// No I18N
          } else if(userAddData.popupfor === "bulkupdate" && isMDHSetup == "true") {//NO I18N
              idStr = sdp_user.LOGGEDIN_USERID  + "/";// No I18N
          }
          var url = sdp_user.LOGGEDIN_USERID !== parseInt(id) && userList.apiEntity === "on_behalf_of" && userList.apiModule === "requests" ? (userList.apiModule + "/" + userList.apiEntity + "/" + id + "/") : metURL+"s/"+idStr; // No I18N
          sdpAjax({
            url : "/api/v3/" + url + "_metainfo", // No I18N
            data :  dataval,
            success : function(resp){
              u_add.meta_info = resp.metainfo.fields;
              user_data.meta_info = resp.metainfo.fields;
              if(user_data.id && user_data.meta_info.is_vipuser && parseInt(user_data.id) == sdp_user.LOGGEDIN_USERID){
                user_data.meta_info.is_vipuser.editable = false;
              }
            },
            cache:false,
            async: false
          });
        }
        if (userAddData.popupfor === "bulkupdate" && !isSCP) {
          user_data.meta_info.department.mandatory = false;
        }
        if(u_add.changeTo != "showmydetails"){
          var addUDFFields = {}, udf_fields = ["technician_udf_fields","user_udf_fields","ci_default_fields","ci_user_fields"]; // No I18N
          for(var fldkey in user_data.meta_info){
			  if(user_data.meta_info[fldkey].display_type == "MultiSelect") {//display type changes (associatesites)
				  user_data.meta_info[fldkey].display_type='multi_select';
			  }
            if(~fldkey.indexOf('_fields') && udf_fields.indexOf(fldkey) == -1){ // No I18N
              var fldObj = user_data.meta_info[fldkey];
                  addUDFFields[fldkey] = user_data.meta_info[fldkey];
            }
          }
          jQuery.extend(form_fields[0].fields,addUDFFields);
        }
        var respobj = FormComponent.prototype.constructLayout(form_fields, user_data.meta_info);
        layout_fields = respobj.layouts;
        metainfo = respobj.metainfo;
        if(user_data.profile_pic && user_data.profile_pic.id){
             if(userList.res && userList.key){
               user_data.profile_pic["content-url"] += "?res=" + userList.res + "&key=" + userList.key;  //No I18N
             }
             else if(userList.res){
               user_data.profile_pic["content-url"] += "?res=" + userList.res;   //No I18N
             }
             else if(userList.key && user_data.profile_pic["content-url"].indexOf('?key=') == -1){
               user_data.profile_pic["content-url"] += "?key=" + userList.key;   //No I18N
             }
        }

      if (isSCP && userAddData.isImportReps) {
          userAddData.isPopup = true;
        }

        user_data.forwardfrom = forwardfrom;
        user_data.isMDHSetup = isMDHSetup;
        user_data.isShowmyDetails = userAddData.isShowmyDetails;
        user_data.myDetailsEdit = userAddData.myDetailsEdit;
        user_data.userViewType = userAddData.userViewType;
        user_data.fromCMDB = userAddData.fromCMDB;
        user_data.isFromAcc = userAddData.isFromAcc;
        user_data.isUser = u_add.isUser;
        user_data.changeTo = u_add.changeTo;
        user_data.popupmodule = u_add.popupmodule;
        u_add.isPopup = user_data.isPopup = userAddData.isPopup;
        u_add.popupfor = user_data.popupfor = userAddData.popupfor;
        user_data.id = id;
        user_data.minContent = userList.minContent == "true" || userAdd.minContent == "true" ? true : false;
        user_data.canCreateUser = sdp_user.ROLES.indexOf("CreateRequester") != -1;
        if(u_add.fromCMDBAllCIs == "true"){ // No I18N
          userList.backtoListview = "cmdbAllCIs"; // No I18N
        }
        user_data.isImportReps = isSCP && userAddData.isImportReps;
        user_data.backtoListview = userList.backtoListview;
        if (isMSP && id && user_data.associated_roles) {
          //for edit
          var pointOfContactRoles = {}
          user_data.associated_roles.forEach(function (roles) {
            pointOfContactRoles[roles.name] = roles.id;
          });
          userAddData.point_of_contact_roles = user_data.point_of_contact_roles = pointOfContactRoles;
        }

        renderhbs("#userDetails-section", formTemplate, user_data, true, "users",null,null,function(){  // No I18N
            jQuery("[sdpJs='provideLoginWithEvent']").off("click").on("click",function(){ // No I18N
                u_add.showLoginDetails();
            });
            jQuery("#is_org_admin").off("click").on("click",function(){ // No I18N
                userAdd.srApprChange(this);
            });
            jQuery("[sdpJs='enableDCLoginEvent']").off("click").on("click",function(){   // No I18N
                userAdd.enableDCRole(this);
            });
        });
        u_add.mdmKeysEventBindings();

        /*FORMCOMPONENT Initialization*/
        var options = {};
            options.formId = "UserForm"; // No I18N
            options.callbackAfterRender = this.userFormEvents;
            options.inlineSaveCallback = this.saveUpdateUser;
            options.holderele = jQuery("#userAdditionaldetails");
            options.layoutObj = layout_fields;
            options.metainfo = metainfo;
            options.isDetailForm = u_add.isDetailForm;
            options.startTabIndex = 5;
            if(user_data.myDetailsEdit != "ShowAndEdit" && (sdp_user.ROLES.indexOf("ModifyRequester") == -1 || user_data.userViewType == "adinactiveUsers" || user_data.userViewType == "azureinactiveUsers" || user_data.myDetailsEdit == "Show" || (sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && !u_add.isUser))){
              options.inlineEditDisabled = true;
            }
            delete user_data.meta_info;
            if(userAddData.popupfor === "bulkupdate") {
                options.discard_default_value = true;
                options.discard_readonly_fields = true;
            }

            if (u_add.isDetailForm && options.metainfo.requester_allowed_to_view) {
              options.metainfo.requester_allowed_to_view.allowed_values = u_add.getRequestersAllowedToViewOptions(user_data.account, user_data.subaccount);
            }
            userForm = new FormComponent(options, user_data);
            /**
            * Call attachment component here
            */
            if(u_add.isDetailForm && u_add.isRemote != "true" && u_add.minContent != "true" && userAddData.fromCMDB != "true" && userList.fromAcc != "true"){
              var obj = {
                "title"   : false, // No I18N
                "api"     : false, // No I18N
                "upload"  : false, // No I18N
                "ondelete"  : userAdd.deleteAttachment // No I18N
              }
              var attach = new attachPreview("#attachments",obj); // No I18N
            }
            this.loadSiteGroupdata();
            if(userAddData.popupfor === "bulkupdate") {
                var bulkSelect = userAdd.getTableObject().bulkSelect;
                u_add.bulkSelectedRecords = bulkSelect.selectedRecords;
                setTimeout(function() {
                    var personalDetails = jQuery("#Personal_Details");

                    personalDetails.prev("hr").remove();// No I18N
                    personalDetails.next("hr").addClass("m10");// No I18N

                    jQuery("#userAdditionaldetails").addClass("p20");
                    jQuery("#requester_allowed_to_view_control").css("width", "95%");// No I18N
                    jQuery("#associated_roles_control").css("width", "95%");// No I18N
                    if (parent.sdp_app.IS_SITE_CONFIGURE) {
                        u_add.disableSupportGroup(true);
                    }
                }, 100);
            }
            if(isSCP) {
              setTimeout(function() {
                if(userList.fromAcc) {
                    u_add.disableElement("account_control");// NO I18N
                }
                if (userList.subaccId) {
                    u_add.disableElement("subaccount_control");// NO I18N
                }
              }, 100);
            }
            (userList.popupfor === "include_orgusers" || userList.popupfor === "exclude_orgusers") && jQuery("#users_submit_row_cnt").hide();// No I18N
      },
      u_add.mdmKeysEventBindings =function(){
        jQuery('[data-id="enabLogfg"]').off("click").on("click","[data-id='mdmServerNotRunning']",function(e){ //No I18N
            e.preventDefault();
            return appendDID('http://www.manageengine.com/products/desktop-central/servicedeskplus-dc-server-not-running.html?sdpi',true); //No I18N
        }).on("click","[data-id='mdmAPIInvalid']",function(e){
            e.preventDefault();
            return appendDID('http://www.manageengine.com/products/desktop-central/desktop-central-api-key-invalid.html?sdpi',true); //No I18N
        }).on("click","[data-id='mdmServerNotCompatible']",function(e){
            e.preventDefault();
            return appendDID('http://www.manageengine.com/products/desktop-central/service-packs.html?sdpi',true); //No I18N
        });
      },
      u_add.setRequestersAllowedToViewData = function (account, subaccount) {
        var allowedValues = u_add.getRequestersAllowedToViewOptions(account, subaccount);
        var requesterAllowedToView = jQuery("#select_requester_allowed_to_view");
        var id = requesterAllowedToView.select2("val");// NO I18N
        var defaultId = "5"; //next priority value to set when the highest priority {name: "All their account requests", id: "3"} which is not available.

        function hasValue(id) {
          return allowedValues.some(function (value) { return value.id === id; });
        }

        //if the existing data/value of requester allowed to view is not found in the dropdown option, remove the existing,
        //and set the new data which is available in the options.
        if(!hasValue(id)) {
          defaultId = hasValue(defaultId) ? defaultId : "0";
          requesterAllowedToView.select2("data", allowedValues.find(function (value) { return value.id === defaultId; }));
        }

        requesterAllowedToView.select2({ "data": allowedValues }); //change drop down options.// NO I18N

        return defaultId;
      },
      u_add.getRequestersAllowedToViewOptions = function (account, subaccount) {
        var notAllowedIds = {};
        if(!account) {
          notAllowedIds["5"] = true;
          notAllowedIds["3"] = true;
        } else if (subaccount) {
          notAllowedIds["3"] = true;
        }

        var allowedValues = userAddData.requester_allowedtoview_fields;

        return allowedValues.filter(function (val) {
          return !notAllowedIds.hasOwnProperty(val.id);
        });
      },
      u_add.closeForm = function () {
      if (isSCP && userAddData.isImportReps) {
          userList.redirectTo("list", false); // No I18N
        } else {
          window.close();
        }

      },
      u_add.getTableObject = function() {
        return (isSCP && userAddData.isImportReps ? userList : window.opener.userList).getTableObject();
      },
      u_add.disableElement = function (id) {
            jQuery("#" + id).closest(".right-col").css("cursor", "not-allowed"); // No I18N
        jQuery("#" + id).css("pointer-events", "none"); // No I18N
      },
      u_add.disableSupportGroup = function(disable) {
        var supportGroup = jQuery("#support_group_control");
        if(disable) {
            supportGroup.closest(".right-col").css("cursor", "no-drop"); // No I18N
            supportGroup.closest(".right-col").attr("title", translate("bulk.update.group.requires.site")); // No I18N
            supportGroup.css("pointer-events", "none"); // No I18N
        } else {
            supportGroup.closest(".right-col").css("cursor", ""); // No I18N
            supportGroup.closest(".right-col").attr("title", ""); // No I18N
            supportGroup.css("pointer-events", ""); // No I18N
            supportGroup.removeAttr("title"); // No I18N
        }
      },
      u_add.hasUserRole = function (role) {
        return sdp_user.ROLES.indexOf(role) !== -1;
      },
      u_add.hasAccountAdminRole =  function () {
        return u_add.hasUserRole("SDAccountAdmin");// No I18N
      },
      u_add.isSiteAdmin = function () {
        return !u_add.hasUserRole("SDAccountAdmin") && u_add.hasUserRole("SDSiteAdmin");// No I18N
      },
      /*Form structure object i.e) Object structure should be as same as need to be showing in UI */
      u_add.constructFieldsObj = function(userAddData, user_data){
          var purAppEditable = true, hideForEdit = true, hideSites = true;
          if(u_add.isDetailForm){
              purAppEditable = false;
              hideForEdit = false;
          }
          if(parent.sdp_app.IS_SITE_CONFIGURE){
            hideSites = false;
          }
          var form_fields = [];
          var contactAccount, contactSubAccount;
          var userListData = userList.popupfor === "associate_acc_contacts" ? window.opener.userList : userList;// No I18N
          if(userListData.fromAcc) {
            contactAccount= { id: userListData.accId, text: userListData.accName };
            if(userListData.subaccId) {
                contactSubAccount = { id: userListData.subaccId, text: userListData.subaccName };
            }
          }
            var user_det = {
              "name" : "User_details", // No I18N
              "fields" : { // No I18N
                "employee_id" :{frommeta: true}, // No I18N
                "jobtitle":{frommeta: true}, // No I18N
                "account": { // No I18N
                  readonly: contactAccount !== undefined,
                  default_value: contactAccount ? contactAccount : "",
                  taggingNeeded: true,
                  frommeta: true,
                  changeCallBack: function(element) {
                    var subAccElement = jQuery("#select_subaccount");
                    var accountData = userForm.formdata.account;
                    if(accountData && accountData.id !== element.value) {
                        userAdd.isAccChangeConfirmed = false;
                        showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("scp.contact.acc.change.warning") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function(data) { // No I18N
                            if(!data || data[1] === "cancelButton") {
                                //rollback to old data.
                                jQuery("#select_account").select2("data", { id: accountData.id, text: accountData.name }); // No I18N
                                userForm.constructFieldOptions(); //close inline edit.
                            } else {
                                userAdd.isAccChangeConfirmed = true;
                                if(userForm.options.isDetailForm) {
                                    //update account if it's inline edit otherwise the account will be updated on form submit.
                                    FormComponent.prototype.inlineSaveChanges.call(userForm, element);
                                }
                                u_add.setRequestersAllowedToViewData(jQuery("#select_account").select2("data"), null);// NO I18N
                                subAccElement.select2("val", "");// No I18N
                            }
                        });
                    } else {
                        u_add.setRequestersAllowedToViewData(jQuery("#select_account").select2("data"), null);// NO I18N
                        subAccElement.select2("val", "");// No I18N
                    }
                  }
                },
                "subaccount": {// No I18N
                    frommeta: true,
                    readonly: contactSubAccount !== undefined,
                    default_value: contactSubAccount ? contactSubAccount : "",
                    changeCallBack: function (element) {
                      u_add.setRequestersAllowedToViewData(jQuery("#select_account").select2("data"), jQuery("#select_subaccount").select2("data"));// NO I18N
                    },
                    listinfoCallback: function () {
                        return {search_fields: {parent_id: jQuery("#select_account").val()}}
                    }
                },
                "department": { frommeta: true, "formatResult": u_add.deptFormatResult, "formatSelection": u_add.deptFormatResult, "dataDetailStaticTransformer": u_add.constructDeptDetStat, "criteriaCallback": u_add.departmentsCrit }, // No I18N
                "is_vipuser": { // No I18N
                  "frommeta": true,// No I18N
                  dataFieldtransformer: function () {
                    return '<input type="checkbox" class="mt10" tabindex="8" id="is_vipuser" name="is_vipuser" data-type="checkbox" value="false">';// No I18N
                  }
                },
                "reporting_to":{"frommeta": true}, // No I18N
                "phone":{"frommeta": true,display_dir : "ltr","dataDetailStaticTransformer":u_add.constructStaticPhone,"skipEncode":true}, // No I18N
                "mobile":{"frommeta": true,display_dir : "ltr","dataDetailStaticTransformer":u_add.constructStaticMobile,"skipEncode":true}, // No I18N
                "user_udf_fields":{"frommeta" :true}, // No I18N
                "ci_default_fields":{"frommeta" :true}, // No I18N
                "ci_user_fields":{"frommeta" :true}, // No I18N
                "technician_sys_attribute":{"default_hide" : true, "formatResult" : u_add.reportingToFormatResult,"formatSelection" : u_add.reportingToFormatResult, "isTooltipEnabled" :true} //added reference column for system attribute // No I18N
              }
            };

            if (userAddData.popupfor !== "bulkupdate") {
              delete user_det.fields.is_vipuser;
            }

            if(userList.card != "true") {  //No I18N
              user_det.fields.email_id = {"frommeta" :true,"display_type": "custom-email" };  //No I18N
              user_det.fields.description = {"frommeta" :true,"display_type": "Multi Line" };  // No I18N
              if(userList.minContent != "true" && userAdd.minContent != "true"){
                user_det.fields.secondary_emailids = {"frommeta" :true,"display_type": "email-multiple", "rowspan": "3", "dataDetailStaticTransformer": u_add.constructSecEmailStat };  // No I18N
                user_det.fields.sms_mail_id = {"display_type": "custom-email", "frommeta": true };  // No I18N
                delete user_det.fields.reporting_to;
              }
            }
            if(isMSP) {
              if (window.opener) {
                user_det.fields.account = {
                  frommeta: true,
                  mandatory: userAddData.popupfor != "bulkupdate"// No I18N
                }
              } else {
                //will be handled from header
                delete user_det.fields.account;
              }
            }
            form_fields.push(user_det);

            if(!u_add.isUser || forwardfrom == "ESM" || (isMDHSetup == "true" && !userAdd.isDetailForm)){
              form_fields.push({
                "name": "Telephony_Details", //No I18N
                "fields":{ //No I18N
                  "enable_telephony":{"frommeta" :true,"display_type":"checkbox", "editable" : !u_add.isDetailForm}, //No I18N
                  "extension":{"frommeta" :true, "editable" : !u_add.isDetailForm, "mandatory":true}, //No I18N
                  "sip_user":{"frommeta" :true, "editable" : !u_add.isDetailForm, "mandatory":true} //No I18N
                }
              });
            }

          if(userList.minContent != "true" && userAdd.minContent != "true") {
            form_fields.push({
              "name" : "Department_Details", // No I18N
              "fields" : { // No I18N
                "associated_accounts": { "frommeta": true,"display_type": "multi_select", "changeCallBack": u_add.showMspAssociatedAccounts, "readonly": true, "is_supporting_field": true, "showmaxlength": 10, "isTooltipEnabled": false, "dataDetailStaticTransformer": u_add.constructAssociatedAccounts }, // No I18N
                "cost_per_hour" : {"frommeta" :true,"display_type" : "currency"}, // No I18N
                "associated_sites" : {"frommeta" :true, "display_type" : "multi_select","changeCallBack" : u_add.showMultipleAssociate,"readonly" :true, "is_supporting_field" : true, "showmaxlength" : 10, "default_hide" :hideSites, "isTooltipEnabled" : false}, // No I18N
                "allowed_to_view_cost" : {"frommeta" :true, "display_type" : "checkbox","no_display_name" : true, editable: u_add.isAllowedToViewCostEditable(user_data.associated_roles) }, // No I18N
                "support_group" :{"frommeta" :true, "display_type" : "multi_select","formatResult" : u_add.supportGrpFormatResult,"formatSelection" : u_add.supportGrpFormatResult, "criteriaCallback" : u_add.supportGrpSiteCrit, "dataDetailStaticTransformer" : u_add.constructSGrpDetStat,"readonly" :true, "is_supporting_field" : true, "changeCallBack" : u_add.showMultipleAssociate, "showmaxlength" : 10, "isTooltipEnabled" : false}, // No I18N
                "service_request_approver":{"frommeta" :true,"display_type" : "checkbox","no_display_name" : true, "editable" :purAppEditable}, // No I18N
                "project_roles" :{"frommeta" :true}, // No I18N
                "purchase_approver" : {"frommeta" :true, "display_type" : "checkbox", "no_display_name" : true, "dataFieldtransformer" : u_add.constructPurAppField,"editable" :purAppEditable, "tabindex_count" :3}, // No I18N
                "reporting_to":{"frommeta" :true, "formatResult" : u_add.reportingToFormatResult,"formatSelection" : u_add.reportingToFormatResult, "isTooltipEnabled" :true}, // No I18N
                "purchase_approval_limit" : {"frommeta" :true, "dataDetailStaticTransformer" : u_add.constructPApprLimDetail, "display_type" : "currency", "default_hide" :hideForEdit, "editable" :purAppEditable}, // No I18N
                "requester_allowed_to_view":{ // No I18N
                  "display_type" : "Pick List", // No I18N
                  "frommeta" :true, // No I18N
                  "mandatory" : userAddData.popupfor !== "bulkupdate", // No I18N
                  "allowed_values": userAddData ? isSCP ? u_add.getRequestersAllowedToViewOptions(contactAccount || user_data.account, contactSubAccount || user_data.subaccount) : userAddData.requester_allowedtoview_fields : "", // No I18N
                  "default_value" : userAddData && userAddData.popupfor !== "bulkupdate" ? userAddData.requester_allowedtoview_fields[0] : "" // No I18N
                }
              }
            });
            if (sdp_app.IS_MSP && !userAdd.isDetailForm) {
                delete form_fields.last().fields.requester_allowed_to_view;
            }
            if (isMSP) {
              form_fields.last().fields.associated_sites.dataDetailStaticTransformer = u_add.constructAssociatedSitesByAccount
            }
          }
          if(!u_add.isUser){ //Only for Technician and change_as_technician
            var technician_addFlds = {"technician_udf_fields":{}, //No I18N
            };
            if(form_fields[2]){
              delete form_fields[2].fields.requester_allowed_to_view;
            }
            jQuery.extend(form_fields[0].fields,technician_addFlds);
          }
          /* Following setion is for Details page*/

        if (userAddData.popupfor !== "bulkupdate") {
          if(u_add.isDetailForm){
            if(userList.card != "true") {  //No I18N
              var personal_det = {
                "name" : "Personal_Details", // No I18N
                "fields": { // No I18N
                  "name" : {}, // No I18N
                  "first_name" : {"frommeta" :true}, // No I18N
                  "middle_name":{"frommeta" :true}, // No I18N
                  "last_name":{"frommeta" :true}, // No I18N
                  "is_vipuser":{"frommeta" :true,"display_type" : "checkbox"} // No I18N
                }
              };
              form_fields.unshift(personal_det);
            }
            if(userAddData.popupfor !== "bulkupdate" && u_add.changeTo !== "showmydetails" && (parent.sdp_app.IS_SDP || (!u_add.isUser && !parent.sdp_app.IS_SDP))){ // No I18N
              var login_det = {
                    "name" : "Login_Details", // No I18N
                    "fields" : { // No I18N
                      "login_name" : {"frommeta" :true,"editable":false}, // No I18N
                      "associated_roles" : {"frommeta" :true, "editable":false}, // No I18N
                      "domain" : {frommeta: true} // No I18N
                    }
                  }

              if (isMSP) {
                login_det.fields.all_domain = { frommeta: true };
                delete login_det.fields.domain;
              }
              form_fields.push(login_det);
            }
          }
        }

        if(userAddData.popupfor === "bulkupdate") {
          var login_det = {
            name : "Login_Details", // No I18N
            fields : {
              domain : {frommeta: true}
            }
          };
          if(!(sdp_app.IS_AE && u_add.isUser)){
            login_det.fields.can_generate_authtoken = {frommeta: true, display_type: "checkbox","no_display_name" : true}; // No I18N
          }


          if(isMSP) {
            login_det.fields.all_domain = {frommeta: true};
            delete login_det.fields.domain;
          }
        if (u_add.changeTo === "change_as_technician" || !u_add.isUser) {
            login_det.fields.associated_roles = {
              frommeta: true
            };
          }

          form_fields.push(login_det);

          if(u_add.isUser) {
            delete form_fields[1].fields.technician_sys_attribute;
          }

        delete form_fields[0].fields.employee_id;
        delete form_fields[0].fields.phone;
        delete form_fields[0].fields.mobile;
        delete form_fields[0].fields.email_id;
        delete form_fields[0].fields.secondary_emailids;

          var errMsg = bulkUpdate.checkUserSelection(bulkUpdate.getSelectedUsers());
          if(errMsg !== "") {
            showalert('failure', translate(errMsg), "isAutoHide=false"); // No I18N
          }
        }
        return form_fields;
      },
      /* Event triggers when , "Enable Login" checkbox onClick */
      u_add.showLoginDetails = function()
      {
          //Assign the selected_tech as -1 if the request is coming from requester from when changing requester ad Tech
          if(jQuery("#provideLogin").is(":checked"))
          {
            var userid = jQuery("#userID").val();
                userid = (u_add.changeTo == "change_as_technician" || userid == "") ? "-1" : userid; // No I18N
                parent.invokeProgressIndicator(null,translate("sdp.admin.settings.technician.loading.message"),'progress');  // No I18N
            var params = "module=show_login_details&loginPresent=true&id=" + userid;  // No I18N
                params += getCSRFParamURL(false);
                callAjaxRequest('/TechnicianDef.do',params, 'show_login_details'); // No I18N
                if(isSCP){
                	if(isMDHSetup != "true"){
                		sdpAjax({
                			url : "/servlet/SCPAjaxServlet?action=getSCPLoginDetails&userid="+userid, // No I18N
                			success : function(resp){
                				jQuery("#login_name").val(e_html(resp.loginname));
                        jQuery("#" + u_add.domainField).val(e_html(resp.domainname));
                			},
                			async: false
                		})
                	}
                }
          }else{
            u_add.enableLoginTech();
          }
          u_add.enableAuthtokenGeneration();
      },
      u_add.enableLoginTech = function(){
        if(jQuery("#provideLogin").is(":checked")){
          jQuery("[data-id='enabLogfg']").show(); // No I18N
        }else{
          jQuery("[data-id='enabLogfg']").hide(); // No I18N
        }
      },
      /* Triggers , when Remove login link onClick*/
      u_add.removeLogin = function()
      {
        var agree=confirm(translate("sdp.admin.technician.addtechnician.removelogin.confirmdelete",[jQuery("#login_name").val()])); // No I18N
        if(agree) {
          u_add.saveUpdateUser("removelogin"); // No I18N
        }
      },
      /* Triggers , when Enable DC login checkbox onClick*/
      u_add.enableDCRole = function(ele){
        jQuery("#dcrole_section").toggleClass('opac3'); // No I18N
        if(jQuery(ele).is(":checked")){
          jQuery("#DCAdmin").prop("checked",true); // No I18N
          jQuery(".rdo_dcRole").prop('disabled',false); // No I18N
        }else{
          jQuery(".rdo_dcRole").prop("checked", false); // No I18N
          jQuery(".rdo_dcRole").prop('disabled', true); // No I18N
        }
      },
      u_add.appendSiteAccountName = function(){
        var siteIdAccountNameMap = userList.getSiteIdAccountNameMap();
        var element = jQuery("#select_associated_sites");
        var sites = element.select2("data"); // No I18N
        var data = sites.map(function (site) {
          var accountName = siteIdAccountNameMap[site.id];
          var siteName = site.text;
          site.text = accountName ? (siteName + ", " + siteIdAccountNameMap[site.id]) : siteName;
          return site;
        });
        element.select2("data", data); // No I18N
      },
      u_add.constructAssociatedSitesByAccount = function(formdata){
        var siteIdAccountNameMap = userList.getSiteIdAccountNameMap();
        var sites = formdata.associated_sites;
        return sites.map(function (site) {
          var accountName = siteIdAccountNameMap[site.id];
          var siteName = site.name;
          return accountName ? (siteName + " (" + siteIdAccountNameMap[site.id] + ")") : siteName;
        }).join(", ");
      },
      u_add.constructAssociatedAccounts = function(formdata){
        var accounts = formdata.associated_accounts;
        return accounts.map(function(account) {
          return account.name;
        }).join(", ");
      },
      /* Constructing department names with associated_sites for Details page*/
      u_add.constructDeptDetStat = function(formdata, fieldObj){
        var requiredObj = {}, respObj = "-"; // No I18N
        if(fieldObj && fieldObj.name){
          requiredObj = getFunctionDefnOrVariable(formdata, fieldObj.name);
          respObj = requiredObj ? (requiredObj.name + (requiredObj.site ? ", "+requiredObj.site.name : '')) : ''; // No I18N
        }
        return respObj;
      },
      /* Constructing Support Group names with associated_sites for Details page*/
      u_add.constructSGrpDetStat = function(formdata){
        var support_group = formdata.support_group, support_groupStr = ""; // No I18N
        var siteIdAccountNameMap = userList.getSiteIdAccountNameMap();
        if(support_group && support_group.length > 0){
          for (var i = 0; i < support_group.length; i++) {
            var site = support_group[i].site;
            var siteId = site ? site.id : "";
            var mspAccountName = siteIdAccountNameMap[siteId] || "";
            mspAccountName = mspAccountName ? ", " + e_html(mspAccountName) : "";

            support_groupStr += (support_group[i].name + (support_group[i].site ? " (" + support_group[i].site.name + mspAccountName + ")" : '')) + ", "; // No I18N
          }
        }
        support_groupStr = support_groupStr.substring(0,support_groupStr.length-2);
        return support_groupStr;
      },
      /* Constructing Secondary Emails for Details page*/
      u_add.constructSecEmailStat = function(formdata){
        var mailIds = formdata.secondary_emailids, mailIdsStr = ""; // No I18N
        if(mailIds && mailIds.length > 0){
          for (var i = 0; i < mailIds.length; i++) {
            mailIdsStr += mailIds[i] + ", "; // No I18N
          }
        }
        if(mailIdsStr != ""){ // No I18N
          mailIdsStr = mailIdsStr.substring(0,mailIdsStr.length-2);
        }
        return mailIdsStr;
      },
      /* Constructing Department Select2 formatResult & formatSelection for Details page*/
      u_add.deptFormatResult = function(state){
        return e_html(state.text) + ( state.site ? ", " + e_html(state.site.name) : "" );
      },
      u_add.departmentsCrit = function(searchText){
        var accountCriteria = {
          field: "account",// No I18N
          condition: "is not",// No I18N
          value: null,
          logical_operator: "OR"// No I18N
        };
        var critObj;
          if(isMSP) {
            critObj = accountCriteria;
          }
          if(searchText){
            var departmentStr = jQuery("#select_department").val() , critArray = [];
            critObj = {"field":"name","condition":"like","value": searchText,"logical_operator" : "OR"}; // No I18N
            if(isMSP) {
              critObj.logical_operator = "AND";// No I18N
              critArray.push(critObj);
              critObj = accountCriteria;
            }

             critArray.push({"field":"site.name","condition":"like","value": searchText,"logical_operator" : "OR"}); // No I18N
             critObj.children = critArray;
          }
        return critObj;
      },
      u_add.siteOnchange = function(ele){
        var siteIdsStr = jQuery("#select_associated_sites").val(), remainGrp = [];
        if(siteIdsStr != ""){
          var siteIdsArray = JSON.parse("[" + siteIdsStr + "]");
          var notassSite = (siteIdsArray.indexOf(-1) > -1);
          var grpIdArray = jQuery("#select_support_group").select2('data'); // No I18N
          for(var i = 0; i < grpIdArray.length; i++){
              if((grpIdArray[i].site == null && notassSite) || (grpIdArray[i].site && siteIdsArray.indexOf(parseInt(grpIdArray[i].site.id)) > -1)){
                  remainGrp.push(grpIdArray[i]);
              }
          }
        }
        jQuery("#select_support_group").select2('data', remainGrp); // No I18N
      },
      u_add.supportGrpSiteCrit = function(searchText){
          var siteIdsStr = jQuery("#select_associated_sites").val(), critObj = {} , critArray = [];
              critObj = {"field":"name","condition":"like","value": searchText,"logical_operator" : "AND"}; // No I18N
              if(siteIdsStr != ""){
                var siteIdsArray = JSON.parse("[" + siteIdsStr + "]");
                var NotsiteIndex = siteIdsArray.indexOf(-1);
                if(NotsiteIndex > -1){
                   siteIdsArray.splice(NotsiteIndex,1);
                   critArray.push({"field": "site","condition":"in","values":[null] ,"logical_operator":"OR"}); // No I18N
                }
                if(siteIdsArray.length > 0){
                  critArray.push({"field": "site.id","condition":"in","values":siteIdsArray ,"logical_operator":"OR"}); // No I18N
                }
              }
              return critArray;
      },
      u_add.setReportingToField = function(id, name){
        jQuery('#select_reporting_to').select2('data',{'id':id, 'name':name}); // No I18N

        if(u_add.isDetailForm == true){
          u_add.saveUpdateUser("details"); // No I18N
        }
      },
      /* Constructing ReportingTo (User) names with Title for Select2*/
      u_add.reportingToFormatResult = function(user){
          var titleStr = '<div><b>'+translate('sdp.common.name.is')+' : </b><span>'+e_html(user.name)+'</span><br><b>'+translate('sdp.common.email.is')+' : </b><span>'+(user.email_id ? e_html(user.email_id) : "N/A" )+'</span><br><b>'+translate('sdp.common.empid.is')+' : </b><span>'+(user.employee_id ? e_html(user.employee_id) : 'N/A' )+'</span><br><b>'+translate('sdp.common.dept.is')+' : </b><span>'+((user.department && user.department.name)? e_html(user.department.name) + (user.department.site ? ", " + e_html(user.department.site.name) : "" ) : 'N/A' )+'</span><br></div>'; // No I18N
          return '<div rel="uitip" title="'+e_attr(titleStr)+'" data-allowhtml="true" mode_html="true" data-default-tooltip="true">'+e_html(user.name)+'</div>';
      },
      /* Constructing SupportGrp names with associated_sites for Select2*/
      u_add.supportGrpFormatResult = function(state){
        var siteIdAccountNameMap = userList.getSiteIdAccountNameMap();
        var siteId = state.site ? state.site.id : "";
        var mspAccountName = siteIdAccountNameMap[siteId] || "";
        mspAccountName = mspAccountName ? ", " + mspAccountName : "";
        return e_html(state.name) + (state.site ? " (" + e_html(state.site.name) + mspAccountName + ")" : "" );
      },
      /* Constructing Purchase Approver field for Details page*/
      u_add.constructPApprLimDetail = function(formdata){
        var limitValue = "-"; // No I18N
        if(formdata.purchase_approver == true){
          limitValue = formdata.purchase_approval_limit;
          if(limitValue.indexOf("-1") != -1){ // No I18N
            limitValue = translate("sdp.purchase.approver.approvercost.unlimit"); // No I18N
          }
        }
        return limitValue;
      },
      u_add.updateCanGenerateAuthTokenCheckboxValue = function(checkbox){
      var loginName = jQuery("[name=login_name]").val();
      if (loginName == null || loginName == "") {
        showalert("failure", getMessageForKey('sdp.loginnameerror.authtoken') ,"isAutoHide=false"); // No I18N
        jQuery("[name=login_name]").trigger('focus');
        checkbox.value = 'false';
        checkbox.checked = false;
      }
      else{
        if (checkbox.checked) {
          checkbox.value = 'true';
        } else {
          checkbox.value = 'false';
        }
      }
      },
      u_add.constructStaticPhone = function(formdata){
        if(formdata.phone && parent.sdp_app.IS_TELEPHONY_ENABLED && u_add.isDetailForm && formdata.minContent==true && userList.card=="true"){
          var getOrguserString = userList.getOrguser ? userList.getOrguser.toString() : null;
          if(getOrguserString!="true"){
            var phoneString = "'"+formdata.phone+"'";
            return '<a href="/" id="ctiCallPhone" data-event="click" data-handler="telephony.makeOutgoingCall('+e_attr(phoneString)+ ','+e_attr(formdata.id)+');return false;" nonce="'+sdpNonce+'"><span class="cspr icon-xs earphone vtop mr5"></span><span>'+e_html(formdata.phone)+'</span></a>';
          }
        }
        return e_html(formdata.phone);
      },
      u_add.constructStaticMobile = function(formdata){
        if(formdata.mobile && parent.sdp_app.IS_TELEPHONY_ENABLED && u_add.isDetailForm && formdata.minContent==true && userList.card=="true"){
          var getOrguserString = userList.getOrguser ? userList.getOrguser.toString() : null;
          if(getOrguserString!="true"){
            var mobileString = "'"+formdata.mobile+"'";
            return '<a href="/" id="ctiCallMobile" data-event="click" data-handler="telephony.makeOutgoingCall('+e_attr(mobileString)+ ','+e_attr(formdata.id)+');return false;" nonce="'+sdpNonce+'"><span class="cspr icon-xs earphone vtop mr5"></span><span>'+e_html(formdata.mobile)+'</span></a>';
          }
        }
        return e_html(formdata.mobile);
      },
      /* Constructing Purchase Approver field for Add/Edit page*/
      u_add.constructPurAppField = function(formdata){
        var checkedStr = "", valueStr = "false", checkUnlimit="", checkLimit = "", disableClass="opac3" , disabledStr = "", limitvalue="", disableRadio="";
        if(formdata.purchase_approver == true){
          checkedStr = " checked "; // No I18N
          valueStr = "true"; // No I18N
          disableClass = ""; // No I18N
          if(~(formdata.purchase_approval_limit).indexOf("-1")){
            checkUnlimit = " checked "; // No I18N
            disabledStr = " disabled "; // No I18N
          }else{
            limitvalue = formdata.purchase_approval_limit;
            checkLimit = " checked "; // No I18N
          }
        }else{
          checkUnlimit = " checked "; // No I18N
          disableRadio = disabledStr = " disabled "; // No I18N
        }
        var tabIndex = formdata.tabIndex;
        return '<label class="mb10"><input tabindex="'+(tabIndex++)+'" type="checkbox" class="checkbox-inline" name="purchase_approver" value="'+ valueStr +'" '+checkedStr+' id="purchase_approver">'+translate('sdp.admin.requesterdef.approvepo')+'</label><span data-id="papprover-warning"></span><br><div class="'+disableClass+' truncate-ellipsis pl5 input-group" id="applimitdiv"><label class="radio-inline ml15 truncate-wrapper text-oveflow pb5" style="width: 30%;" rel="uitip" mode_ellipsis=true title="'+translate("sdp.purchase.approver.approvercost.unlimit")+'"><input tabindex="'+(tabIndex++)+'" type="radio" class="ml-15" id="approveunLimit" value="UNLIMITED" '+checkUnlimit+' '+disableRadio+'> '+translate("sdp.purchase.approver.approvercost.unlimit")+'</label><span class="cus-input xs radio-inline truncate-wrapper form-inline pb5" style="width: 50%;"><input tabindex="'+(tabIndex++)+'" type="radio" class="top10 m0 left5" id="approveLimit" value="LIMITED" '+checkLimit+' '+disableRadio+'><input tabindex="'+(tabIndex++)+'" type="text" name="purchase_approval_limit" value="'+(limitvalue ? parseFloat(limitvalue): "")+'" style="width: 90%;" id="purchase_approval_limit" class="form-control" '+disabledStr+'></span><div class="text-overflow mt10" rel="uitip" mode_ellipsis=true title="'+e_attr(parent.sdp_app.CURRENCY_SYMBOL)+'">'+(parent.sdp_app.CURRENCY_SYMBOL ? " ( "+e_attr(parent.sdp_app.CURRENCY_SYMBOL)+" )" : "")+'</div></div>'; // No I18N
      },
      u_add.srApprChange = function(ele){
        jQuery(ele).val(jQuery(ele).is(":checked")); // No I18N
      },
      u_add.isAllowedToViewCostEditable = function(roles) {
        if (!roles) {
            return true;
        }
        var hasAdminRole = roles.some(function (role) {
          return role.text === "SDAdmin" || role.text === "SDSiteAdmin" || role.text === "SDAccountAdmin"; // No I18N
        });
        return !hasAdminRole;
      },
      u_add.enableAllowedToViewCostForAdminRoles = function(data) {
        var allowedToViewCostInfo = jQuery("#allowed_to_view_cost_info");
        var container = jQuery("#allowed_to_view_cost_control");
        var rolesSelect2 = jQuery("#select_associated_roles");
        var isEditable;
        var roles = data && data.associated_roles ? data.associated_roles : (rolesSelect2.length ? rolesSelect2.select2("data") : null);// No I18N

        if (!container.length || !roles) {
          return;
        }

        isEditable = u_add.isAllowedToViewCostEditable(roles);

        if (!allowedToViewCostInfo.length) {
          var classList = u_add.isDetailForm ? "mleft58 noborder pl0 pl10 pos-abs pr0 top10 vtop whitebg" : "ml10 whitebg noborder pl0 pr0 vtop"; // No I18N
          var info = '<span id="allowed_to_view_cost_info" class="' + classList + '"><span aria-hidden="true" class="cspr info icon-sm cur-ptr " rel="uitip" title="' + translate("sdp.users.allowedtoviewcost.admin.role.info") + '"></span></span>';

          jQuery("#allowed_to_view_cost_control").append(info);
          initTooltip("#allowed_to_view_cost_info");// No I18N
        }

        !isEditable && !jQuery("#allowed_to_view_cost").is(":checked") && jQuery("#allowed_to_view_cost").trigger("click");// No I18N
        jQuery("#allowed_to_view_cost").prop("disabled", !isEditable);// No I18N
      },
      /* Binding events after rendering the form content*/
      u_add.userFormEvents = function(formdata){
          if(!formdata.id && isMDHSetup == "true" && forwardfrom != "ESM" && (isSCP || !parent.sdp_app.IS_IMPORT_ALL_ORG_USER) && sdp_user.ROLES.indexOf("CreateRequester") && userAddData.popupfor !== "bulkupdate"){ // No I18N
            var value = isSCP && !userAdd.isUser ? "technician_suggestions" : "user_suggestions"; // No I18N
            var options = { suggestion: value };
            var _nameComp = new userSuggestionComponent("name", options); // No I18N
            var _emailComp = new userSuggestionComponent("email_id", options); // No I18N
          }
          if(!formdata.enable_telephony){
              jQ("#sip_user,#extension").prop("disabled",true); // No I18N
              jQuery("#Telephony_Details span.mandatory").hide();
          }
          if(isMSP && userAdd.isUser && jQuery("#__persistentAccountId__select").length) {
          jQuery("#first_name").trigger('focus');
          } else {
          jQuery("#first_name").trigger('focus');
          }
        if (sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && userList.LOGGEDIN_USER_SITES && userList.LOGGEDIN_USER_SITES.indexOf("-1") == -1 && !userAdd.isDetailForm){
            jQuery("#siteIdsStr").val("");
          }
          jQuery("#userBackBtn").off('click').on('click',function(){ // No I18N
              if(u_add.fromCMDBAllCIs == "true"){ //Under CMDB (ALL CIs link), When we click on "GO Back" from User EDIT/VIEW page
                window.location.href = "/CMDBAction.do?mode=listView";
              }else{
                userList.redirectTo('list',(userList.backtoListview == "user")); // No I18N
                (userList.popupfor === "include_orgusers" || userList.popupfor === "exclude_orgusers") && jQuery("#users_submit_row_cnt").show();// No I18N
              }
              if(isMSP) {
                userList.setMspAccount({ id: userList.mspAccountId});
              }
          });
          jQuery("#is_vipuser").on('change', function(){
              jQuery(this).val(jQuery(this).is(":checked")); // No I18N
          });
          jQuery("#isOrgAdminID").on('change', function () {
            if (userAddData.popupfor === "bulkupdate") {
              var field = "is_org_admin"; // No I18N
              if (this.checked) {
                bulkUpdate.displayInfoMessage(field, "show"); // No I18N
              } else {
                bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
              }
            }
          });

          jQuery("#account_manager").on('change', function () {
            if (userAddData.popupfor === "bulkupdate") {
              var display = this.checked ? "show" : "hide"; // No I18N
              bulkUpdate.displayInfoMessage("account_manager", display); // No I18N
            }
          });

          jQuery("#purchase_approver").on('change', function(){
            jQuery(this).val(jQuery(this).is(":checked")); // No I18N
            jQuery("#applimitdiv").toggleClass('opac3'); // No I18N
            jQuery("#purchase_approval_limit").val("").prop('disabled',true);
            jQuery("#approveunLimit").prop('checked',true);  // No I18N
            jQuery("#approveLimit").prop('checked', false); // No I18N
            if(jQuery(this).is(":checked")){ // No I18N
              jQ("#approveunLimit,#approveLimit").prop("disabled", false); // No I18N
            }else{
              jQ("#approveunLimit,#approveLimit").prop("disabled",true); // No I18N
            }

             if(userAddData.popupfor === "bulkupdate") {
                 var field = "purchase_approver"; // No I18N
                 if(this.checked) {
                    bulkUpdate.displayInfoMessage(field, "show"); // No I18N
                 } else {
                     bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
                 }
             }
          });

          jQuery("#enable_telephony").on("change",function(){
            jQuery(this).val(jQuery(this).is(":checked")); // No I18N
            if(jQuery(this).is(":checked")){ // No I18N
              jQ("#sip_user,#extension").prop("disabled", false); // No I18N
              jQuery("#Telephony_Details span.mandatory").show();
            }else{
              jQ("#sip_user,#extension").prop("disabled",true); // No I18N
              jQuery("#Telephony_Details span.mandatory").hide();
            }
          });

          jQuery('#select_associated_roles').on('change', function () { //NO I18N
            if (userAddData.popupfor === "bulkupdate") {
              var field = "associated_roles"; // No I18N
              if (this.value !== "") {
                bulkUpdate.displayInfoMessage(field);
              } else {
                bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
              }
            }
            u_add.enableAllowedToViewCostForAdminRoles();
          });

            if(userAddData.popupfor === "bulkupdate") {
                jQuery('#select_domain').on('change', function() { //NO I18N
                    var field = u_add.domainFieldName;
                    if(this.value !== "") {
                        bulkUpdate.displayInfoMessage(field);
                    } else {
                        bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
                    }
                });
                jQuery("#is_vipuser_control").closest(".col-fields").find(".label-text").append('<span class="cspr vip icon-sm ml5"></span>');
                jQuery("#userAdditionaldetails hr:first").remove();
            }
          jQuery("#approveunLimit,#approveLimit").on('click',function(){
              var cVal = jQuery(this).val();
              if(cVal === "UNLIMITED"){ // No I18N
                jQuery("#approveLimit").prop('checked', false); // No I18N
                jQuery("#purchase_approval_limit").prop('disabled',true).val("");
              }else{
                jQuery("#approveunLimit").prop('checked', false); // No I18N
                jQuery("#purchase_approval_limit").prop('disabled', false).val("").trigger('focus');
              }
          });

          jQuery("#service_request_approver").on("click",function(){
                var field = "service_request_approver"; // No I18N

                u_add.srApprChange(this);

                if(this.checked) {
                    bulkUpdate.displayInfoMessage(field, "show"); // No I18N
                } else {
                    bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
                }
          });
          jQuery("#allowed_to_view_cost").on("click",function(){
            u_add.srApprChange(this);
          });
          jQuery("#can_generate_authtoken").on('change', function(){
            jQuery(this).val(jQuery(this).is(":checked")); // No I18N
            var field = "can_generate_authtoken"; // No I18N
            if (this.checked) {
              bulkUpdate.displayInfoMessage(field,"show"); // No I18N
            } else {
              bulkUpdate.displayInfoMessage(field, "hide"); // No I18N
            }
        });
        jQuery("[name='is_org_admin']").off('click').on('click', function(){    // No I18N
          userAdd.srApprChange(this);
        });



          if(!u_add.isUser){
            //Apply select2 for Assigned roles
              u_add.applySelect2('associated_roles',formdata);  // No I18N
              jQuery("#DCAdmin,#DCGuest").on('click',function(){
                var cVal = jQuery(this).attr('id');
                if(cVal === "DCAdmin"){ // No I18N
                  jQuery("#DCGuest").prop('checked', false); // No I18N
                }else{
                  jQuery("#DCAdmin").prop('checked', false); // No I18N
                }
              });

              //enable "Allowed to View Cost" by default for admin roles.
              u_add.enableAllowedToViewCostForAdminRoles(formdata);

               /*  For Technician , we should not be allowed to assign morethan one Admin Role (SDAdmin & SDSiteAdmin)*/
                jQuery.validator.addMethod(
                  "adminrole-multiple", // No I18N
                  function(value, element) {
                    var isValidroles = true;
                    var assRoleS2 = jQuery("#select_associated_roles"); // No I18N
                    if(assRoleS2){
                      var assRoles = assRoleS2.select2('data'); // No I18N
                      var sdAdmin = false, sdSiteAdmin = false, accountAdmin;

                      for (var i = 0; i < assRoles.length; i++) {
                        if(assRoles[i].text == "SDAdmin"){ // No I18N
                          sdAdmin = true;
                        }else if(assRoles[i].text == "SDSiteAdmin"){ // No I18N
                          sdSiteAdmin = true;
                        } else if (isMSP && assRoles[i].text == "SDAccountAdmin") {
                          accountAdmin = true;
                        }
                      }
                      isValidroles = !(sdAdmin && sdSiteAdmin);
                      if (isMSP && (sdAdmin || sdSiteAdmin) && accountAdmin) {
                        isValidroles = false;
                      }
                    }
                    return isValidroles;
                  },
                  window.translate("sdp.api.exception.only.one.admin.role.can.associate") // No I18N
                );

                if(((formdata.id && u_add.changeTo == "change_as_technician") || !formdata.id) && parent.sdp_app.IS_SITE_CONFIGURE && (parent.sdp_user.ROLES.indexOf("SDSiteAdmin") == -1 || (parent.sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && parent.sdp_user.ROLES.indexOf("Resources not in any site") != -1))){
                      if(userAddData.popupfor !== "bulkupdate" && !isMSP) {
                          var selectedObject = [{"id":"-1", "name" : translate("sdp.admin.technician.addtechnician.nosite"), "text" : translate("sdp.admin.technician.addtechnician.nosite")}]; // No I18N
                          jQuery("#select_associated_sites").select2('data',selectedObject); // No I18N
                      }
                    }
                if(!parent.sdp_app.IS_SDP){
                  jQuery("[data-id='enabLogfg']").show(); // No I18N
                }
          }else{
            if(forwardfrom == "ESM" && sdp_user.LOGGEDIN_USERID == formdata.id) { // To disable isorgAdmin checkbox for Currently loggedin user
              jQuery("#isOrgAdminID").prop("disabled", false); // No I18N
            }

            if(!formdata.id){
              jQuery("#mobile").val(userList.mobile);
              jQuery("#phone").val(userList.phone);
            }

            //clear this value to stop reflecting these value in the edit form of a user in the popup.
            if(userAdd.popupfor) {
                userList.mobile = "";
                userList.phone = "";
            }
          }

          if(formdata.id && sdp_user.LOGGEDIN_USERID == formdata.id && jQuery("#is_vipuser").length >0){  // No I18N
            jQuery("#is_vipuser").removeAttr("name");  // No I18N
          }
          //Apply select2 for Domain
          if(u_add.changeTo != "showmydetails" && (!isSCP || forwardfrom === "ESM" || !u_add.isUser)) {
            u_add.applySelect2(u_add.domainFieldName,formdata);
          }
          //SD-105717
          jQuery.validator.addMethod(
                      "user-email", // No I18N
                      function(value, element) {
                        var valid = true, invalidMailArr = "";
                        var respObj = FormComponent.prototype.getTextToArray(value);
                        if(!jQuery.isEmptyObject(respObj)){
                          valid = respObj.valid;
                          invalidMailArr = respObj.mailList;
                        }
                        var email_id = element.value;
                         if(email_id.includes(",")){
                          valid = false;
                         }
                          return valid;
                       },
                      window.translate("sdp.common.email.id.invalid")
                    );
                    userForm.validateRules.email_id = {"user-email": true} // No I18N
          userForm.validateRules.name = {"required" :true}; // No I18N
          userForm.validateMsg.name = {"required" : translate("common.validation",[u_add.meta_info.name.display_name])}; //No I18N
          var deptValidation = (forwardfrom != "ESM" && sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && userList.LOGGEDIN_USER_SITES_WITH_REFER && userList.LOGGEDIN_USER_SITES_WITH_REFER.indexOf("-1") == -1) ? true : false; // No I18N
          if(deptValidation){
            userForm.validateRules.department = {"select": true}; // No I18N
            userForm.validateMsg.department = {"select": translate("common.validation.select", [u_add.meta_info.department.display_name])}; // No I18N
          }
          userForm.validateRules.purchase_approval_limit={"positive-decimal": true}; // No I18N
          userForm.initFormValidator("UserForm",userForm.validateRules,userForm.validateMsg); // No I18N
          if(u_add.isDetailForm == false){
            fixedformfooter(document.getElementById("UserForm"), document.getElementById('submit-row'));
          }
          var secemail = jQuery("#secondary_emailids_control"); // No I18N
          if(secemail){
            secemail.addClass('form-group input-group');
            secemail.find('textarea').css("width","98%"); // No I18N
            var titleStr ='<ul class="bullet-arrow pl20 pt10"><li>'+translate("sdp.admin.requester.emailSeperation")+'</li><li>'+translate("sdp.admin.duplicateEmail.remove")+'</li></ul>';
            secemail.append('<span class="input-group-addon whitebg noborder pl0 pr0 vtop"><span aria-hidden="true" class="fl cspr info icon-sm cur-ptr top10 mt3" rel="uitip" mode_html=true title="'+e_attr(titleStr)+'"></span>'); // No I18N
            if(u_add.isDetailForm){
              secemail.parents('.control-holder').next().addClass('pt10'); // No I18N
            }
          }
          if(deptValidation){
            if(!u_add.isDetailForm){
             var deptCtl = jQ("#department_control"); // No I18N
                 deptCtl.find("#s2id_select_department").css("width","95%"); // No I18N
                 deptCtl.append('<span aria-hidden="true" class="cspr info icon-sm mt5 pos-abs ml5" title="'+translate("user.department.mandate")+'" rel="uitip" mode_html=true data-allowhtml="true" data-default-tooltip="true"></span>'); // No I18N
            }
          }
          if(userList.isSearchuserPopup != true && (forwardfrom == "ESM" || (sdp_user.USERTYPE != "Requester" && isMDHSetup != "true"))){ // No I18N
            var repTo = jQuery("#reporting_to_control"); // No I18N
            if(repTo){
              repTo.find("#s2id_select_reporting_to").css("width","90%"); // No I18N
              repTo.addClass('pos-rel').append('<button type="button" class="btn btn-xs btn-link pos-abs top3 right0 mr-10" title="'+translate('sdp.admin.orgrole.adduser.search.user')+'" rel="uitip" data-event="click" data-handler="javascript:showUserSearchPopup(\'reportingTo\',true);return false;" nonce='+sdpNonce+'><span class="cspr contact icon-sm opac"></span></button>'); // No I18N
            }


          }
          if(userList.isSearchuserPopup != true && !u_add.isUser || userAddData.popupfor === "bulkupdate"){
            if(u_add.isDetailForm){
              if(formdata.associated_sites && formdata.associated_sites.length > 0){
                var assSite = jQuery("#associated_sites_static"); // No I18N
                if(assSite){
                  assSite.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr top10 right10" rel="uitip" title="'+translate("sdp.common.showallinfo")+'" data-event="click" data-handler="userAdd.showMultipleAssociate(\'Sites\',\'true\');" nonce='+sdpNonce+'></span></span>'); // No I18N
                }
              }
              if (formdata.associated_accounts && formdata.associated_accounts.length > 0){
                var account = jQuery("#associated_accounts_static"); // No I18N
                if(account){
                  account.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr top10 right10" rel="uitip" title="' + translate("sdp.common.showallinfo") +'" data-event="click" data-handler="userAdd.showMspAssociatedAccounts(\'associated_accounts\', true);" nonce='+sdpNonce+'></span></span>'); // No I18N
                }
              }
              if(formdata.support_group && formdata.support_group.length > 0){
                var assGrp = jQuery("#support_group_static"); // No I18N
                if(assGrp){
                  assGrp.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr top10 right10" rel="uitip" title="'+translate("sdp.common.showallinfo")+'" data-event="click" data-handler="userAdd.showMultipleAssociate(\'Support Groups\',\'true\');" nonce='+sdpNonce+'></span>'); // No I18N
                }
              }
            }else{
              var assSite = jQuery("#associated_sites_control"); // No I18N
              var assGrp = jQuery("#support_group_control"); // No I18N
              if(assSite){
                assSite.find("#s2id_select_associated_sites").css("width","90%"); // No I18N
                assSite.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr" rel="uitip" title="'+translate("sdp.admin.org.technician.associatesites")+'" data-event="click" data-handler="userAdd.showMultipleAssociate(\'Sites\');" nonce='+sdpNonce+'></span><span aria-hidden="true" class="cspr info icon-sm mt5 pos-abs ml25" title="'+translate("sdp.admin.tech.sitenote")+'" rel="uitip"></span>'); // No I18N
              }
              if(assGrp){
                assGrp.find("#s2id_select_support_group").css("width","95%"); // No I18N
                assGrp.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr" rel="uitip" title="'+translate("user.associate.group")+'" data-event="click" data-handler="userAdd.showMultipleAssociate(\'Support Groups\');" nonce='+sdpNonce+'></span>'); // No I18N
              }
            }

          }
          
          if(!formdata.login_name && jQ("input[id='login_name']").length > 0){
            var tabIndeEle = formdata.tabIndex - 1;
                if(!u_add.isUser && jQuery("#provideLogin").is(":visible")){
                  jQ("#provideLogin").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
                }
            jQ("#login_name").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
            jQ("#password").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
            jQ("#retypepassword").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
            jQ("#s2id_select_domain input").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
            if(!u_add.isUser){
              jQ("#s2id_select_associated_roles").attr("tabindex", tabIndeEle = tabIndeEle+1); // No I18N
            }
          }
          var org_roles = userForm.formdata.org_roles;

            var list_info = {};
            list_info.search_criteria = {field: "user.id", value: userForm.formdata.id, condition: "is"};//NO I18N
            var inputObject = {list_info: list_info};
            var dataVal = sdpAjaxInputData(inputObject), groupRoles = 0;
            if(jQuery("#service_request_approver_control").length || jQuery("#service_request_approver_static").length){
              if(PORTALID != -1){
                sdpAjax({
                  url: '/api/v3/support_group_role_associations/_total_count', // No I18N
                  data:dataVal,
                  success: function(resp) {
                    groupRoles = resp._total_count.support_group_role_associations;
                  },
                  ignorefailuremessage : true,
                  async : false
                });
              }
            }
              if(((org_roles && org_roles.length > 0) || (groupRoles > 0)) && !formdata.service_request_approver){
                var serReqAppr = jQuery("#service_request_approver_control,#service_request_approver_static"); // No I18N
                    serReqAppr.append('<span aria-hidden="true" class="cspr info icon-sm cur-ptr ml5" rel="uitip" title="'+translate("user.srapprover.orgroles.info")+'"></span>'); // No I18N
          }

          if (isMSP && !u_add.isUser) {
              var associatedAccounts = jQuery("#associated_accounts_control");// No I18N
              associatedAccounts.css("width", "95%");// No I18N
              associatedAccounts.append('<span class="aspr template-sm icon-sm opac5 pos-abs m5 cur-ptr" rel="uitip" title="' + translate("sdp.msp.accounts.selected") + '" data-event="click" data-handler="userAdd.showMspAssociatedAccounts(\'associated_accounts\');" nonce='+sdpNonce+'></span>'); // No I18N
          }

          if(userAddData.popupfor === "bulkupdate") {
                function getInfoHTML(key) {
                    var msg = translate(key);
                    return '<span class="fr">' +
                          '<span aria-hidden="true" class="fl cspr info icon-sm cur-ptr  pos-abs ml5 top10" rel="uitip" title="' + e_attr(msg) + '">' +
                          '</span></span>';
                }

                jQuery("#requester_allowed_to_view_control").append(getInfoHTML("requesterAllowedToView.ignoreFor.technician.msg")); // No I18N
          }
      if (sdp_app.IS_MSP) {
        u_add.initMspFieldsEvents(formdata);
      }
      $sdEventListener("#userDetails-section"); // No I18N
      },
      //Load Selected Site / Group data
      u_add.loadSiteGroupdata = function(){
        var siteIds = [], supGrpIds = [], supgrpSiteModel = {};
        var sites = userForm.formdata.associated_sites || [];
        var groups = userForm.formdata.support_group || [];
            for (var i = 0; i < sites.length; i++) {
              siteIds.push(sites[i].id);
              this.selectedSites.push({"id" : sites[i].id});
            }
            for (var i = 0; i < groups.length; i++){
              var grp = groups[i];
              var id = grp.id;
              supGrpIds.push(id);
              supgrpSiteModel[id] = {"id" : id, "site" : grp.site, "name" : grp.name, "text" : grp.name}; // No I18N
              this.selectedSupGrps.push({"id" : id});
            }
            this.supgrpSiteModel = supgrpSiteModel;
            if(siteIds.length > 0){
              jQuery("#siteIdsStr").val(siteIds);
              jQuery("#supportIdsStr").val(supGrpIds);
            }
      },
      u_add.addPocInfoMsg = function() {
        var poc = jQuery("#point_of_contact_control"); // No I18N

        // If current user does not have any of these role[SDGuest, CreateRequester, ModifyRequester], then api/v3/users/associated_roles is not invoked
        if (!poc.length || !(sdp_user.ROLES.indexOf("SDGuest") !== -1 || sdp_user.ROLES.indexOf("CreateRequester") !== -1 || sdp_user.ROLES.indexOf("ModifyRequester") !== -1)) {
          return false;
        }

        sdpAjax({
          url: "/api/v3/users", // No I18N
          data: sdpAjaxInputData({
            list_info: {
              search_criteria: [{
                "field": "associated_roles",// No I18N
                "value": userList.associated_roles_data.roleMap.SDPointOfContact, // No I18N
                "condition": "in",// No I18N
                "logical_operator": "AND", // No I18N
              },
              {
                "field": "account.id",// No I18N
                "value": getAccountId(), // No I18N
                "condition": "is",// No I18N
                "logical_operator": "AND", // No I18N
              },
              ],
              row_count: 0
            }
          }),
          success: function (response) {
            //add poc info msg if the user is not poc or no poc exits for the selected account.
            if (response.users.length && response.users[0].id !== jQuery("#userID").val()) {
              var title = '<div style="line-height: 20px;">' + translate("sdp.msp.poc.account.already") + "<br>" + translate("sdp.msp.poc.change") + '</div>';
              poc.append('<span id="poc_replace_info" class="cspr info icon-sm cur-ptr ml10" title=\'' + title + '\' rel="uitip"></span>'); // No I18N
              initTooltip("#point_of_contact_control");// No I18N
            } else {
              jQuery("#poc_replace_info").remove();
            }
          }
        });
      },
      //ShowDialog - Sites / Support Groups
      u_add.showMultipleAssociate = function(field, isDetailsPage){
        var options = {};
        if(typeof field == "object"){  // No I18N
            field = (field.id.indexOf("associated_sites") > -1) ? "Sites" : "Support Groups"; // No I18N
        }
        if(field == "Sites" || field == "Import_Users"){
          options.callbackToGetContent = userList.AppendSitesHTML;
          options.dialogtitle = options.label = translate("sdp.admin.org.technician.associatedsites"); // No I18N
        }else{
          options.skipTogetSelected = true;
          options.callbackToGetContent = userList.AppendGroupsHTML;
          options.dialogtitle = options.label = translate("sdp.admin.settings.technician.group.available"); // No I18N
        }
        options.saveCallBack = u_add.saveSelectedIds;
        if(isDetailsPage == "true"){
          options.viewOnly = true;
        }
        bulkAssociation = new BulkAssociationComponent(options,userAdd);
        bulkAssociation.field = field;
      },
      u_add.setAssociatedAccountsHtml = function() {
          var accounts = userForm.formdata.associated_accounts;
          var html = accounts.map(function (account) {
           var name = e_html(account.name);
            return '<div class="form-group pl10 pt5">\
              <label class="text-overflow" rel="uitip" title="' + name + '">' + name + // No I18N
              '</label>\
            </div>';
          }).join("");

          setTimeout(function () {
            jQuery("[id*='_DIALOG_CONTENT']").find('#assoiciated_div').html(html);
            jQuery("[id*='_DIALOG_LAYER']").find("#selectedCount").text(accounts.length);
            jQuery("[id*='_DIALOG_LAYER']").find("#totalCount,#totalCountLbl").text(mspAccountJsonData.length);
          }, 1);
      },
      u_add.showMspAssociatedAccounts = function () {
        var isDetailsPage = userAdd.isDetailForm;
        var options = {
          selected_values: userAddData.associated_accounts,
          viewOnly: isDetailsPage,
          saveCallBack: function (accounts) {
            userAddData.associated_accounts = accounts.selectedIds;
            userAddData.isAssociatedAccountUpdated = true;

            jQuery("#select_associated_accounts").select2("data", accounts.select2Objects).trigger("change");// No I18N
            var selectedAssociatedAccounts = {};

            accounts.selectedObjects.forEach(function (account) {
                selectedAssociatedAccounts[account.id] = account.id;
            });

            var associatedSites = jQuery("#select_associated_sites");
            var associatedSiteIds = jQuery("#siteIdsStr").val().split(",");// No I18N
            var notInSiteData = associatedSiteIds.find(function (id) { return id === "-1" });

            var assoicatedSiteMap = {};
            var availableSiteIds = [];

            if (notInSiteData) {
              availableSiteIds.push("-1");
            }

            associatedSiteIds.forEach(function (id) {
              assoicatedSiteMap[id] = id;
            });

            for (var site in siteAccountModel) {
              var accountId = siteAccountModel[site];
              if (selectedAssociatedAccounts.hasOwnProperty(accountId) && siteGroupExceptReferModel.hasOwnProperty(site) && assoicatedSiteMap.hasOwnProperty(site)) {
                availableSiteIds.push(assoicatedSiteMap[site]);
              }
            }

            jQuery("#siteIdsStr").val(availableSiteIds);

            associatedSites.select2("data", availableSiteIds.map(function (id) { //No I18N
              return { id: id, text: (id === "-1" ? translate("sdp.admin.technician.addtechnician.nosite") : siteGroupExceptReferModel[id]) }
            }).slice(0, 10));
            u_add.selectedSites = availableSiteIds.map(function (id){ return { id: id } });
          },
          dialogtitle: translate("sdp.msp.accounts.selected"),
        };

        if(isDetailsPage) {
          options.callbackToGetContent = userAdd.setAssociatedAccountsHtml;
        } else {
          options.allowed_values = mspAccountJsonData.map(function (account) {
            return { id: account.id, name: account.text };
          });
        }

        bulkAssociation = new BulkAssociationComponent(options);
    },
    u_add.togglePointOfContactFields = function (ids, canShow) {
      var ids = ids.map(function (id) {
        return "input#" + id;// No I18N
      }).join(",");
      var elements = jQuery(ids);

      elements.closest("[data-colfields]").toggle(canShow);// No I18N
      if (elements.prop("type") === "checkbox") {
        elements.prop("checked", true);// No I18N
      }
    },
    u_add.onAccountChange = function () {
        jQuery("#select_department").select2("val", "");// No I18N
    },
    u_add.getAssoicatedAccountIds = function (data) {
        if (!data.associated_accounts) {
          return [];
        }
        return data.associated_accounts.map(function (data) {
          return data.id;
        })
    },
    u_add.initMspFieldsEvents = function (formData) {
        //storing associated accounts in userAddData to access the value globally(i.e in userList.AppendSitesHTML)
        userAddData.associated_accounts = u_add.getAssoicatedAccountIds(formData);
        if (!userAdd.isDetailForm && u_add.isUser && sdp_user.LOGGEDIN_USERID != formData.id) {
          //load data in background that need to get associated roles ids which needed on save.
          userList.fetchAssociatedRoles();
        }

        if (!u_add.isDetailForm) {
          u_add.appendSiteAccountName();
        }

      if (userAdd.popupfor) {
        //replace msp function(msputils.js) to get account id from user form
        window.getAccountIDNeeded = function() {
          return jQuery("#select_account").val() || 0;
        }

        if (userList.fromAcc || (userAdd.popupfor === "bulkupdate" && (u_add.changeTo == "change_as_technician" || !userAdd.isUser))) {
          var selectAccountElement;
          if (u_add.changeTo == "change_as_technician" || !userAdd.isUser && userAdd.popupfor === "bulkupdate") {
            selectAccountElement = window.opener.jQuery("#__persistentAccountId__select").find("option[value=" + userList.mspMyOrgAccountId + "]");
            jQuery("#select_account").select2("enable", false);// No I18N
          } else {
            selectAccountElement = window.opener.jQuery("#persistentAccountId").find("select option:selected");
          }
          if (u_add.changeTo === "point_of_contact" || u_add.changeTo === "account_manager") {
            jQuery("#select_account").select2("enable", false);// No I18N
          }
          jQuery("#select_account").select2("data", { id: selectAccountElement.val(), text: selectAccountElement.text() })// No I18N
        }

        //reset department when account changed
        jQuery("#select_account").on("change", function () {
          jQuery("#select_department").select2("val", "");// No I18N
        });
      }

      if (formData.account && userAdd.isUser) {
        userList.setMspAccount(formData.account);
      }
      jQuery("#requester_allowed_to_view").select2({
        data: userAddData.requester_allowedtoview_fields,
        width: "100%",
      }).select2("val", formData.requester_allowed_to_view ? formData.requester_allowed_to_view.id : "0");// No I18N

      jQuery("#point_of_contact").on("change", function (e) {
        var fields = ["account_manager", "work_log", "problems", "changes", "assets", "reports"];// No I18N
        var isChecked = e.target.checked;
        u_add.togglePointOfContactFields(fields, !isChecked);
        u_add.togglePointOfContactFields(["requester_allowed_to_view"], false);
      });
      jQuery("#account_manager").on("change", function (e) {
        var fields = ["work_log", "problems", "changes", "assets", "reports", "requester_allowed_to_view"];// No I18N
        var isChecked = e.target.checked;
        u_add.togglePointOfContactFields(fields, isChecked);
        u_add.togglePointOfContactFields(["requester_allowed_to_view"], !isChecked);
      });

      if (!u_add.isMyOrgAccountAssociated()) {
        jQuery("#view_acc_req_btn").hide();
      }

      if (userForm.formdata.org_user_status === "UNAPPROVED") {
        jQuery('[action="add-association"]')
          .off("click") // No I18N
          .addClass("cur-na")  // No I18N
          .prop("rel", "uitip") // No I18N
          .prop("title", translate("sdp.msp.user.assgn.role.unkn.usr.info")); // No I18N

        initTooltip("body"); // No I18N
        userList.appliedFilter = "unapproved";// No I18N
      }

      if (sdp_user.LOGGEDIN_USERID == jQuery("#userID").val()) {
        jQuery("#block_user_btn").hide();
      }
      if(userAdd.isDetailForm) {
        u_add.hideNonPriviegedActions(formData);
      }
      jQuery("#select_department").on("change", function (e) {
        if(isMSP) {
          var isPopup = window.opener !== null;
          var accountField = jQuery(isPopup ? "#select_account" : "#__persistentAccountId__select");
          var accountId = accountField.val();
          //account will not be set when department selected if account already selected or logged in user is a requester
          if (accountId && accountId !== "0") return;
          sdpAjax({
            url: "/api/v3/departments/" + e.val,// No I18N
            success: function(response) {
              var department = response.department;
              if (department.account) {
                var accountId = department.account.id;
                if(isPopup) {
                  accountField.select2("data", { id: accountId, text: department.account.name });// No I18N
                } else {
                  accountField.select2("val", accountId );// No I18N
                  u_add.animateFieldChange("#s2id___persistentAccountId__select > a", 5);// No I18N
                }
              }
            }
          });
        }
      });
      userList.fetchAssociatedRoles().then(function() {
        u_add.addPocInfoMsg(formData);
      });
      jQuery("#select_account, #__persistentAccountId__select").on("change", function () {
        u_add.addPocInfoMsg();
      });
    },
    u_add.hideNonPriviegedActions = function(data) {
      var actions = ["#block_user_btn"];// No I18N
      var previlegeRoleOrder = ["SDAdmin", "SDAccountAdmin", "SDSiteAdmin"]; //high to lowest // No I18N
      var highestAvailableRole = getHeighestPrivilegedRole(sdp_user.ROLES); //logged in user's highest privilege role
      var highestAssoicatedRole = getHeighestPrivilegedRole(data.associated_roles.map(function (role) { return role.name; }));
      var hasHigherPrevilege = true;

      function getHeighestPrivilegedRole (roles) {
        return previlegeRoleOrder.find(function (role) {
          return roles.indexOf(role) !== -1;
        });
      }

      for (var i = 0, n = previlegeRoleOrder.length; i < n; i++) {
        var role = previlegeRoleOrder[i];

        if (role === highestAvailableRole) {
          hasHigherPrevilege = true;
          break;
        }

        if (role === highestAssoicatedRole && role !== highestAvailableRole) {
          hasHigherPrevilege = false;
          break;
        }
      }

      if (!hasHigherPrevilege) {
        jQuery(actions.join(",")).hide();
      }
    },
    u_add.isMyOrgAccountAssociated = function() {
      return getAccountName(userList.mspMyOrgAccountId) !== undefined;
    },
    u_add.animateFieldChange = function (selector, iteration, delay) {
        var element  = jQuery(selector);
        iteration = iteration || 1;

        function animateBackground (color, duration) {
          element.animate({
            backgroundColor: color
          }, duration);
        }

        for (var i = 0; i < iteration; i++) {
          setTimeout(function () {
            animateBackground("#fff1db", 250);// No I18N

              setTimeout(function () {
                animateBackground("");
              }, 500);
          }, i * (delay === undefined ? 500 : delay))
        }
    },
      //Saving the selected Sites/ Support Group IDs
      u_add.saveSelectedIds = function(selectedObj, context){
        var _self = context;
        var field = bulkAssociation.field;
        var selectedObjects = selectedObj.select2Objects;
        if(field == "Sites"){ // No I18N
            _self.selectedSites = selectedObj.selectedObjects;
            var selectedIds = selectedObj.selectedIds;
            var selectedGrpIds = "", remainGrpModel = {};

            if (userAddData.popupfor === "bulkupdate") {
                u_add.disableSupportGroup(selectedIds.length == 0);
            } else if(!isMSP) {
                if(selectedIds.length == 0 && (sdp_user.ROLES.indexOf("SDSiteAdmin") == -1 || (sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && sdp_user.ROLES.indexOf("Resources not in any site") != -1))){ // No I18N
                  selectedIds = ["-1"];
                  selectedObjects = [{"id":"-1", "name" : translate("sdp.admin.technician.addtechnician.nosite"), "text" : translate("sdp.admin.technician.addtechnician.nosite")}]; // No I18N
                }
            }
          var notassSite = (selectedIds.indexOf("-1") > -1);
          var grpSiteMod = _self.supgrpSiteModel;
            _self.selectedSupGrps = [];
            jQuery.each(grpSiteMod, function(grpId,grpObj){
              if((grpObj.site == null && notassSite) || (grpObj.site && selectedIds.indexOf(grpObj.site.id) > -1)){
                remainGrpModel[grpId] = grpObj;
                selectedGrpIds += grpId + ",";
                _self.selectedSupGrps.push({"id" : grpId});
              }
            });
            _self.supgrpSiteModel = remainGrpModel;
          var selectedSupGrpObj = [];
          var displayCnt = 10;
            jQuery.each(remainGrpModel, function(key, grpObj){
              selectedSupGrpObj.push(grpObj);
              displayCnt--;
              if(displayCnt == 0){
                return false;
              }
            });
            selectedGrpIds = selectedGrpIds.substring(0,selectedGrpIds.length-1);
            jQuery("#supportIdsStr").val(selectedGrpIds);
            jQuery("#select_associated_sites").select2('data',selectedObjects).trigger("change"); // No I18N
            jQuery("#select_support_group").select2('data',selectedSupGrpObj).trigger("change"); // No I18N
            jQuery("#siteIdsStr").val(selectedIds);

        }else{
          var siteAllowedValues = jQuery.extend({},siteGrpModel.list);
          var remainGrpModel = {};
          _self.selectedSupGrps = [];
          var selectedIds = jQuery("#bulk_select_grid .asso_checkbox:checked").map(function(){
              var gEle = jQuery(this);
              var grpId = gEle.val();
              var grpName = gEle.closest('[data-groupname]').attr('data-groupname'); // No I18N
              var siteObj = null;

              if(!isSCP && userAddData.popupfor === "bulkupdate") {
                u_add.disableSupportGroup(true);
              }

              if(gEle.attr('data-siteid') != "0"){
                var siteId = gEle.attr('data-siteid');
                var siteName = siteAllowedValues[siteId][0];
                  siteObj = {"id" : siteId, "name" : siteName}; // No I18N
              }
              _self.selectedSupGrps.push({"id" : grpId});
              var grpObj = {"id" : grpId,"text" : grpName, "name" : grpName, "site": siteObj}; // No I18N
              remainGrpModel[grpId] = grpObj;
            return grpId;
          }).get();
          _self.supgrpSiteModel = remainGrpModel;
          jQuery("#select_support_group").select2('data',selectedObjects).trigger("change"); // No I18N
          jQuery("#supportIdsStr").val(selectedIds);
        }
      },
      /*Select2 for Domain and Associated roles*/
      u_add.applySelect2 = function(field,formdata){
        var selected_obj = formdata[field];
        var isDomain = (field == u_add.domainFieldName);
        var multiple = isDomain ? false : true;
        var allowClear = isDomain ? true : false;

        var inputoptions = {
            data:selected_obj,
            select2Id: "select_"+field, // No I18N
            allowClear: allowClear,
            placeholder: translate("form.select.placeholder",[u_add.meta_info[field].display_name]), // No I18N
            callbackURL: u_add.meta_info[field].href,
            multiple:multiple,
            entity_name : field,
            results:function(data)
            {
                //If 'DCAdmin'/ 'DCGuest' in Associated role, just ignore from selection and make respective radio button as selected under Desktop and MDM Plugin
                //If 'ViewRequestsNotInAnySite' and 'Resources not in any site' in Associated role, just ignore from selection and select 'Not associated to any site' in Associated Site Select2
                var discardRoles = ['DCAdmin','DCGuest','MDMPAdmin','MDMPGuest','ViewRequestsNotInAnySite','Resources not in any site']; // No I18N
                var retdata = [];
                for (var i = 0; i < data.length; i++) {
                    var disp_obj = data[i];
                    if(!(field == "associated_roles" && ~discardRoles.indexOf(trim(disp_obj.name)))){
                      disp_obj.text = disp_obj.name;
                      retdata.push(disp_obj);
                    }
                }
                return retdata;
            }
        };
        var associateSiteSelect2 = new Select2APIComponent(inputoptions);
      },
      /* jQuery validation - Additional rules added based on some conditions*/
      u_add.additionalRules = function(isAdd){
        var ruleObj = {};
            ruleObj.rules = {};
            ruleObj.messages = {};
        var formSettObj = jQuery("#UserForm").validate().settings;
        var isSerReqAppr = jQuery("input#service_request_approver").is(":checked") || (jQuery("select[name='service_request_approver']").val() == "true"); // No I18N
        var isPOAppr =  jQuery("input#purchase_approver").is(":checked") || (jQuery("select[name='purchase_approver']").val() == "true"); // No I18N
        var loginvalidate = jQuery("#provideLogin").is(":checked") || ((jQuery("#login_name").val() !="" && jQuery("#login_name").val() != undefined) || jQuery("#isOrgAdminID").is(":checked") ? true :false);  // No I18N
        var primaryEmailvalidate = ((isPOAppr || (isSerReqAppr && (jQuery("[name='login_name']").val() == "" || jQuery("[name='login_name']").val() == undefined)) || trim(jQuery("#secondary_emailids").val()) != "") && (trim(jQuery("#email_id").val()) == "")) ? true :false;  // No I18N
        var telephonyEnabled = jQuery("#enable_telephony").is(":checked"); //No I18N
        if(loginvalidate){
          formSettObj.rules.login_name = {"required" :true}; // No I18N
          var login_name_mand = "" ;
          if(jQuery("#isOrgAdminID").is(":checked")){
            login_name_mand = translate("sdp.api.exception.provide.loginname.for.orgadmin");
          }else{
            login_name_mand = translate("common.validation",[u_add.meta_info.login_name.display_name]);
          }
          formSettObj.messages.login_name = {"required" : login_name_mand}; //No I18N

          formSettObj.rules.password = {"required" :true}; // No I18N
          formSettObj.messages.password = {"required" : translate("common.validation",[u_add.meta_info.password.display_name])}; //No I18N

          formSettObj.rules.retypepassword = {"required" :true}; // No I18N
          formSettObj.messages.retypepassword = {"required" : translate("common.validation",[translate("sdp.admin.technician.addtechnician.retypepassword")])}; //No I18N

          formSettObj.rules.associated_roles = {"required" :true}; // No I18N
        }else{
          delete formSettObj.rules.login_name;
          delete formSettObj.rules.password;
          delete formSettObj.rules.retypepassword;
          delete formSettObj.rules.associated_roles;
        }
        if(isPOAppr){
          if(jQuery("#approveLimit").is(":checked")){
            if(trim(jQuery("#purchase_approval_limit").val()) == "" || !isDecimal(jQuery("#purchase_approval_limit").val())){
              showalert('failure', translate("sdp.api.exception.provide.po.approval.limit") ,"isAutoHide=false"); // No I18N
              jQuery("#purchase_approval_limit").val("").trigger('focus');
              return false;
            }
          }
        }

        if(forwardfrom != 'ESM' && loginvalidate || userAddData.popupfor === "bulkupdate" && userAdd.isUser === false) {
          formSettObj.rules.associated_roles = formSettObj.rules.associated_roles || {};

          formSettObj.rules.associated_roles["adminrole-multiple"] = true; // No I18N
          formSettObj.messages.associated_roles = {"required" : translate("common.validation",[u_add.meta_info.associated_roles.display_name])};// No I18N
        }

        if(primaryEmailvalidate && userAddData.popupfor !== "bulkupdate"){
          var mailmandMsg = ""; // No I18N
          if(isSerReqAppr || isPOAppr){
            mailmandMsg = translate(isPOAppr ? "sdp.purchase.requester.approver.email.errmsg" : "sdp.catalog.requester.approver.email.errmsg"); // No I18N
          }else{
            mailmandMsg = translate("common.validation",[u_add.meta_info.email_id.display_name]); // No I18N
          }
          if(u_add.isDetailForm || isMDHSetup == "true"){
            showalert('failure', mailmandMsg ,"isAutoHide=false"); // No I18N
            return false;
          }else{
            formSettObj.rules.email_id.required = true; // No I18N
            formSettObj.messages.email_id = {"required" : mailmandMsg}; //No I18N
            if(!jQuery("#email_id").valid()){ //No I18N
              return false;
            } 
          }
        }else{
          if(formSettObj.rules && formSettObj.rules.email_id) {
             delete formSettObj.rules.email_id.required; // No I18N
          }

          if(isSCP && userAddData.isImportReps) {
            var assoicated_roles = formSettObj.rules.associated_roles;
            formSettObj.rules.associated_roles = assoicated_roles ? assoicated_roles : {};
            formSettObj.rules.associated_roles.required = true;
          }

        }
        if(telephonyEnabled){
          var extension = trim(jQuery("#extension").val());
          var sip_user = trim(jQuery("#sip_user").val().trim());
          if(!extension){
            showalert('failure', translate("sdp.admin.technician.jserror.Extn"),"isAutoHide=false"); // No I18N
            return false;
          }
          else if(!sip_user){
            showalert('failure', translate("sdp.admin.technician.jserror.sipUser"),"isAutoHide=false"); // No I18N
            return false;
          }
        }
      },
      /*Constructing input_data for User Form submission*/
      u_add.constructInputObject = function(){
        var obj = true;
        //if(u_add.changeTo != "showmydetails"){
            obj = u_add.additionalRules();
        //}
        if(obj != false){
          obj = jQuery("#UserForm").valid();
        }
        if(obj){
          if(jQuery("#select_associated_sites").is(":visible") && sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && jQuery("#siteIdsStr").val() == ""){ // No I18N
              var manMessage = translate("common.validation.select",[u_add.meta_info.associated_sites.display_name]);
              showalert('failure', manMessage ,"isAutoHide=false"); // No I18N
              return false;
          }
          if((u_add.isUser || (!u_add.isUser && jQuery("#provideLogin").is(":checked"))) && jQuery("#password").val() !== jQuery("#retypepassword").val()){
            showalert('failure', translate("sdp.jserror.retypepassword") ,"isAutoHide=false"); // No I18N
            return false;
          }
          jQuery("#loader-div").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 99;">'+ajaxBar("white")+'</div>');
          obj = userForm.getInputObject();
          if(obj.requester_allowed_to_view && obj.requester_allowed_to_view.id){
            obj.requester_allowed_to_view = obj.requester_allowed_to_view.id;
          }
          if(u_add.ciTypeId && u_add.ciTypeId != ""){  // No I18N
             obj.citype_id = u_add.ciTypeId;
          }
          if(!u_add.isUser ){
            if(isIThelpdesk == "true"){
              if(jQuery("#isEnableDCLogin").is(":checked")){
                var dcobj = {"id" : jQ(".rdo_dcRole:checked").val()};  // No I18N
                obj.associated_roles.push(dcobj);
              }
            }
            if(jQuery("#select_associated_sites").is(":visible")){
              if(this.selectedSites.length > 0){
                obj.associated_sites = this.selectedSites;
              } else if(userAddData.popupfor === "bulkupdate") { // No I18N
                  if(obj.associated_sites === null) {
                      delete obj.associated_sites;
                  } else if(obj.hasOwnProperty("associated_sites")) {// No I18N
                      obj.associated_sites = [obj.associated_sites];
                  }
              } else if(isMSP) {
                obj.associated_sites = [];
              }else{
                obj.associated_sites = [{"id" : "-1"}]; // No I18N
              }
            }
            if(jQuery("#select_support_group").is(":visible")){
              if(this.selectedSupGrps.length > 0){
                obj.support_group = this.selectedSupGrps;
              }else{
                obj.support_group = [];
              }
            }
          }
          if(obj.purchase_approver == "false"){ // No I18N
            delete obj.purchase_approval_limit;
          }else{
            if(jQuery("#approveunLimit").is(":checked")){
              obj.purchase_approval_limit = "-1"; // No I18N
            }
          }
          if(obj.secondary_emailids && obj.secondary_emailids != ""){ // No I18N
            obj.secondary_emailids = FormComponent.prototype.eliminateDuplicateEleFromArray(obj.secondary_emailids);
          }else if(obj.secondary_emailids === null){
            obj.secondary_emailids = [];
          }
          delete obj.retypepassword;
          if(obj.password)
          {
              obj.password = encryptDataWithRSA(obj.password);
          }
        }
      if (isMSP && !userAdd.isDetailForm) {
        u_add.setMspAccountData(obj);
        if (sdp_user.LOGGEDIN_USERID == userForm.formdata.id);
        else if (u_add.isUser) {
          if (!u_add.associated_roles) {
            //wait if assoicated roles data not loaded
            userList.fetchAssociatedRoles(false);
          }
          u_add.setMspUserFields(obj);
        } else {
          u_add.setMspTechnicianFields(obj);
        }
      }
        return obj;
      },
    u_add.setMspAccountData = function(data) {
        var accountId = jQuery("#__persistentAccountId__select").val() || jQuery("#select_account").val();
        if (userAddData.popupfor != "bulkupdate" || accountId) {
            data.account = accountId === "0" ? null : { id: accountId };
        }
    },
    u_add.setMspUserFields = function(data) {
      var pointOfContact = jQuery("#point_of_contact");
      var modules = ["point_of_contact", "account_manager", "work_log", "problems", "changes", "assets", "reports"];// No I18N
      var roleMap = userList.associated_roles_data.roleMap;

      if(userAdd.isUser) {
        data.requester_allowed_to_view = "3";
      }
      if (pointOfContact.is(":checked")) {
        data.associated_roles = [{ "id": roleMap[pointOfContact.val()] }]// No I18N
      } else if (jQuery("#account_manager").is(":checked")) {// No I18N
        var roles = [];

        modules.forEach(function (role) {
          var input = jQuery("input#" + role);
          if (input.is(":checked"))  {
            var roleNames = input.val().split(",");

            roleNames.forEach(function(name) {
              roles.push({ id: roleMap[name] });
            });
          }
        });
        data.associated_roles = roles;
      } else {
        data.requester_allowed_to_view = jQuery("#requester_allowed_to_view").val();
        data.associated_roles = [];
      }

      modules.forEach(function (field) {
        delete data[field];
      });
    },
    u_add.setMspTechnicianFields = function (data) {
        var associatedAccounts = userAddData.associated_accounts;
        //update only if data changed
        if (userAddData.isAssociatedAccountUpdated) {
          data.associated_accounts = associatedAccounts.map(function (id) {
            return { id: id }
          });
        }
    },
    u_add.ValidFormData = function (data, canShowError) {
        if (isMSP) {
            var isAccountRequired = !data.account && userAddData.popupfor != "bulkupdate" && !u_add.isDetailForm; // No I18N
            if (isAccountRequired) {
                if(canShowError) {
                    jQuery("#__persistentAccountId__select").select2("open");// No I18N
                    showalert('failure', translate("sdp.msp.selectAccount.error"), "isAutoHide=false"); // No I18N
                }
                return false;
            }
        }
        return true;
    },
      /*Form data saving API call*/
      u_add.saveUpdateUser = function(arg){
          closeCalDialog();
          var in_obj = {}, methodType= "POST"; // No I18N
          var addURL = "", saveEntname = u_add.ent_url, userIdStr = "", userId = "";
          if(arg != "portal_add"){
            if(arg == "removelogin"){
              in_obj = {"login_name" : null};  // No I18N
            }else{
              in_obj = u_add.constructInputObject();
              if(in_obj.hasOwnProperty("account") && userAdd.isAccChangeConfirmed === false) {
                  bulkUpdate.hideLoader();
                  return false;
              }
              if(in_obj === false){
                return false;
              }
              if (!u_add.ValidFormData(in_obj, true)) {
                bulkUpdate.hideLoader();
                return false;
              }
            }
            if(userAddData.popupfor === "bulkupdate") {
               var formObj = {};
               formObj[saveEntname] = in_obj;
               bulkUpdate.updateUsers(formObj, saveEntname);
               return;
            }

            userId = jQuery("#userID").val() || "";


            u_add.in_obj = in_obj;
            if(!userId && isMDHSetup == "true" && forwardfrom != "ESM"){ // No I18N
                  var usercnt = u_add.constructPortalUserList(in_obj);
                  if(usercnt){
                    return;
                  }
            }
            }else{
                in_obj = u_add.in_obj;
                jQuery("#loader-div").html('');
                closeDialog();
            }

          if(userId != ""){
            methodType = "PUT"; // No I18N
            userIdStr = "/"+userId;
          }

          if(isSCP && userList.isOrgImport) {
            addURL = "technicians/" + userId + "/associate_to_instance";// No I18N
            methodType = "POST";// No I18N
            saveEntname = "technician"; // No I18N
          } else if (u_add.changeTo && u_add.changeTo != "undefined" && u_add.changeTo != "showmydetails" && u_add.changeTo != "null" && arg !== "removelogin" && u_add.changeTo != "point_of_contact" && u_add.changeTo != "account_manager"){// No I18N
            addURL = (u_add.changeTo == "change_as_technician") ? "users/"+userId+"/_change_as_technician" : ""; // No I18N
            saveEntname = "technician"; // No I18N
          }
          else{
            addURL = u_add.ent_url+"s"+userIdStr; // No I18N
          }
          var inputObject = {};
              inputObject[saveEntname] = in_obj;


          var dataval = sdpAjaxInputData(inputObject);

          sdpAjax({
            url: '/api/v3/'+addURL, // No I18N
            data : dataval,
            type : methodType,
            success: function(resp) {
              jQuery("#loader-div").html("");
              var msgKey = userId ? "api.updated.success" : "api.added.success"; // No I18N
              var msg = translate(msgKey,[translate("sdp.inventory.wsRtPanel.userDetails")]); // No I18N
              userId = isSCP && userList.isOrgImport ? userId : resp[saveEntname].id;
              userList.isOrgImport = false;
              u_add.updateAPIKeyForUser(userId);
              if(resp.response_status.status == "success"){
                showalert('success', msg ,"isAutoHide=true"); // No I18N
              }
              if (isMSP && userList.fromAcc) {
                u_add.reloadOpenerAndClose();
              } else if (isMSP && u_add.changeTo === "point_of_contact" || u_add.changeTo === "account_manager") {// No I18N
                u_add.reloadOpenerAndClose();
              } else if(arg == "removelogin"){  // No I18N
                var changeTo = "", loc_isUser = u_add.isUser; // No I18N
                if(u_add.changeTo == "change_as_technician"){ // No I18N
                  changeTo = "change_as_technician"; // No I18N
                  loc_isUser = true;
                }
                userList.redirectTo("add", loc_isUser, userId, changeTo);  // No I18N
              }else if(arg == "addnew"){ // No I18N
                userList.redirectTo("add",u_add.isUser); // No I18N
              }else if(u_add.changeTo == "showmydetails"){ // No I18N
                userList.redirectTo("mydetails",u_add.isUser,userId); // No I18N
              }else if(userList.isSearchuserPopup == true){
                  if(userList.module === "import_user" || isMSP && u_add.popupfor && userList.module === "Problem") {
                    jQuery("#userBackBtn").trigger("click");
                  } else if(u_add.isPopup){
                    window.close();
                  }else{
                    selectUserFromSearch(userId, (resp[saveEntname].name));
                  }
              }else{
                userList.redirectTo("details",u_add.isUser,userId); // No I18N
              }
            },
            failedCallBack : function(resp,arg){
              jQuery("#loader-div").html(""); // No I18N
              var messageObj = resp.responseJSON.response_status.messages[0];
              if(messageObj.field == "is_org_admin"){ // No I18N
                showalert('failure', e_html(messageObj.message) ,"isAutoHide=false"); // No I18N
              }else if(messageObj.field){
                showalert('failure', e_html((userAdd.meta_info[messageObj.field] ? userAdd.meta_info[messageObj.field].display_name +" - " : "") + messageObj.message) ,"isAutoHide=false"); // No I18N
                jQ("#"+messageObj.field).trigger('focus');
              }else{
                showalert('failure', e_html(messageObj.message) ,"isAutoHide=false"); // No I18N
              }
            },
            ignorefailuremessage : true
          });
      },
      u_add.updateAPIKeyForUser = function(user_id){ //API key updation
        var apikey = jQuery("#sdpAPIKey").val(); // No I18N
        if(apikey){
          var apiKeyExpiry = jQuery("#apiKeyExpiry").val(); // No I18N
          var inputObject = {};
              inputObject.apikey = apikey;
              inputObject.validity = apiKeyExpiry;
              inputObject.user_id = user_id;
          var dataval = sdpAjaxInputData(inputObject);
          sdpAjax({
            url : "/APIKeyGeneration.do?module=updateAPIKey", // No I18N
            method : "post",    // No I18N
            data : dataval,
            success : function(){

            }
          })
        }
      },
       u_add.reloadOpenerAndClose = function() {
        window.opener.location.reload();
        window.close();
      },
      /*Onblur Event for First Name, Middle Name, Last Name*/
      u_add.settingDisplayName = function(form, param, field, event){
        if(event && typeof event.isTrigger != "undefined"){
          return;
        }
        var userId = document.getElementsByName("userID")[0].value;
        if(userId == -1 || userId == "")
        {
            var frsName =form.first_name.value;
            var midName =form.middle_name.value;
            var lasName=form.last_name.value;
            var fullN = '';
            if(frsName !=translate("ae.cmdb.source.firstName"))
            {
                fullN = frsName;
            }
            if(midName != translate("ae.cmdb.source.middleName"))
            {
                fullN = fullN + " " + midName;
            }
            if(lasName != translate("ae.cmdb.source.lastName"))
            {
                fullN = fullN + " " + lasName;
            }
            if(isMDHSetup == "true" && forwardfrom != "ESM" && (isSCP || !parent.sdp_app.IS_IMPORT_ALL_ORG_USER)){ // No I18N
              var displayName = trim(fullN);
              if(displayName != ""){ // No I18N
                var isOrgUserAvailable = u_add.getOrgUserAvailable("name", displayName); // No I18N
                if(isOrgUserAvailable){
                  jQuery("[name='name']").select2("open"); // No I18N
                }
                jQuery("#s2id_name").find('.select2-input').val(displayName).trigger("keyup-change"); // No I18N
                if(field == "lastName"){ // No I18N
                   jQuery("#s2id_name").find('.select2-input').trigger('focus');
                }
              }
              jQuery("#hidden_name").val(displayName);
            }
            try
            {
                document.getElementById(param).value=fullN.trim();
                jQuery(document.getElementById(param)).trigger("change");
            }
            catch(e)
            {
                //This is for IE
                document.getElementsByName(param)[1].value=fullN.trim();
                jQuery(document.getElementById(param)).trigger("change");
            }
            jQuery("#name").valid();
        }
    },
    u_add.getOrgUserAvailable = function(field, searchText){
      var isOrgUserAvailable = false;
      var inputObject = {}, list_info = {}, children = [];
      var value = isSCP && !userAdd.isUser ? "technician_suggestions" : "user_suggestions"; // No I18N
      var search_criteriaObj = {
              field: "operation_type", // No I18N
              condition: 'contains', // No I18N
              values: [value],
              logical_operator: "AND" // No I18N
          };
          children.push({
              field: field, // No I18N
              condition: 'contains', // No I18N
              values: [searchText],
              logical_operator: "AND" // No I18N
          });
          search_criteriaObj.children = children;
          list_info.search_criteria = search_criteriaObj;
          list_info.row_count = 1;
          inputObject.list_info = list_info;
          var dataVal = sdpAjaxInputData(inputObject), isOrgUserAvailable = 0;
          sdpAjax({
              url: '/api/v3/orgusers', // No I18N
              data:dataVal,
              success: function(resp) {
                  isOrgUserAvailable = resp.orgusers.length > 0;
              },
              async : false
          });
          return isOrgUserAvailable;
    },
    u_add.changeVIPUser = function(ele){
      jQuery(ele).val(jQuery(ele).is(":checked")); // No I18N
    },
    u_add.blockUser = function(id){
        showconfirm(true, 'message=' + translate("sdp.msp.admin.requester.details.block.confirmblock") + ', submitbutton=' + translate("msp.requester.block.txt") + ', cancelbutton=' + translate("sdp.common.cancel") + ', closebutton=no, closeOnEscKey=yes', function (isConfirmed) { // No I18N
          if(isConfirmed) {
            sdpAjax({
              url: "/api/v3/users/" + id + "/block_user",// No I18N
              type: "PUT",// No I18N
              data: sdpAjaxInputData({ "status": "block" }),// No I18N
              success: function () {
                showalert('success', translate("sdp.msp.requests.viewrequest.requesterblockmsg"), "isAutoHide=true"); // No I18N
                userList.redirectTo('list');// No I18N
              }
            });
          }
        });
    },
    u_add.showActiveParentUsers = function(){
      NewWindow('/setup/UsersPopup.jsp?popupfor=searchuser&isUser=true&module=merge_unknown_users', 'selectuser', '1100', '750', 'yes', 'center');
    },
    u_add.mergeUnknownUsers = function(childId){
      userAddData.userMerge = {
        parentId: childId,
        childId: jQuery("#userID").val()
      }
      ResourceLoader({
        js: ["/scripts/usermerge.js"], // No I18N
        success: function () {
          callRedirectCheck('userMergeSubmitListView'); // No I18N
        }
      });
    },
    u_add.drilldownreq = function(user, name)
      {
        // TASKID:77231
        var url;
          if(user === "Owner"){ // NO I18N
            var input_data = {
              "list_info":{ // NO I18N
                "search_fields":{ // NO I18N
                  "technician.name": name // NO I18N
                },
                "start_index":1 // NO I18N
              }
              };
          }else if(user === "Requester"){ //NO I18N
            var input_data = {
              "list_info":{ // NO I18N
                "search_fields":{ // NO I18N
                  "requester.name": name // NO I18N
                },
                "start_index":1 // NO I18N
              }
              };
          }
          if(isMSPOrSCP){
            if(user === "AccountName"){
              var input_data = {
                "list_info":{ // NO I18N
                  "search_fields":{ // NO I18N
                    "account.name": decodeURIComponent(name) // NO I18N
                  },
                  "start_index":1 // NO I18N
                }
                };
            }
          }
          // SD-102010
          url = "/WOListView.do?viewMode=table&url_search="+encodeURIComponent(sdpToJSON(input_data)) +''; //NO I18N

          if(isMSP){
            if(user === "Requester"){
            url = "/WOListView.do?viewMode=table&persistentAccountId="+document.getElementById("__persistentAccountId__select").value + "&url_search="+encodeURIComponent(sdpToJSON(input_data))+'';   // No i18n
            }else{
              url = "/WOListView.do?viewMode=table&persistentAccountId=0&url_search="+encodeURIComponent(sdpToJSON(input_data))+'';   // No i18n
            }
        }

        document.location = url;
    },
    u_add.appendWFAccountIdInNewWindow = function(url, windowName, width, height, modal, location) {
      if(isMSP)
      {
        url=url+'&WF_ACCOUNTID='+getAccountId(); //NO I18N
      }
      NewWindow(url, windowName, width, height, modal, location);
    },
    u_add.userDetailTabSwitch = function(tabTo, eleId){
        if(tabTo=='user-history') {
          ResourceLoader({js:["/scripts/hbs-template-components.js"]});  // No I18N
        }
        jQuery("#userDetailsTabs .sdtab-pane").hide();
        jQuery("#"+tabTo).show();
        jQuery("#user_tabs li").removeClass('active').find('#'+eleId).parents('li').addClass('active');
        if(tabTo == "user-relationship"){
          var url = jQuery("#"+eleId).attr('data-href');
          url += "&externalframe=true"; // No I18N
          // load url in iframe instead of loading div, since csp header will be handled in main jsp.
          jQuery("#"+tabTo).html('<iframe src="'+url+'" width="100%" height="555" frameborder="0"></iframe>');
          return false;
        }
       else if(tabTo !== "user-details"){
          var url = jQuery("#"+eleId).attr('data-href');
          jQuery("#"+tabTo).load(url);
          return false;
       }
    },
    u_add.deleteAttachment = function(self, ele) {
      var attachId = jQ(ele).attr("data-attachmentid"); // No I18N
      var userId = jQ(ele).attr("data-userid") , link = 'workorder/FileDownload.jsp?module=delete_user_attachment&ID='+attachId+'&KEY='+jQ(ele).attr("data-attachment_key")+'&delete=true' ,isUser = jQ(ele).attr("data-isUser"); // No I18N
      if(confirm(translate("sdp.inventory.ws.attachdelete.alert"))) {
        jQuery.ajax({
          url:link,
          method:"POST", //NO I18N
          success:function(res){
            userList.redirectTo("details", isUser, userId); // No I18N
          }
        })
      }
    },
    u_add.userAssociatePopup = function(ele){
      var select2Data = jQuery(ele).select2('data') && jQuery(ele).select2('data')[0]; // No I18N
      var userId = select2Data && select2Data.id;
      if(userId){
        var idAttr = jQuery(ele).attr("id");
        var msg = translate("user.portal.associate.confirm",[e_html(select2Data.name)]);
        if(isSCP) {
            var moduleText = userAdd.isUser ? translate("sdp.commom.contact") : translate("sdp.admin.leftpanel.users.technician");
            msg = translate("scp.contact.portal.asso.cnfrm", [moduleText]);
        }

        showconfirm(true,'message='+ msg +', submitbutton='+translate("sdp.common.associate")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=no, closeOnEscKey=yes',function(isConfirmed){ // No I18N
          jQuery(ele).select2("val" ,"").trigger("change"); // No I18N
          if(isConfirmed){
             if(isSCP && !userAdd.isUser) {
                 userList.isOrgImport = true;
                 userList.redirectTo("add", false, userId);// No I18N
                 return;
             }
             sdpAjax({
                url: '/api/v3/users/'+userId+'/_associate_to_instance', // No I18N
                method: "POST", // No I18N
                success: function(resp) {
                  var isFailed = resp.associate_to_instance.response_status.status === "failed";// No I18N
                  var status = isFailed ? "failure" : "success";// No I18N
                  showalert(status, resp.associate_to_instance.response_status.message ,"isAutoHide="+!isFailed); // No I18N  //Issue Fix - 116938

                  if(isFailed) {
                    jQuery("#name").valid();
                    jQuery("[name='name']").select2("open"); // No I18N
                    return;
                  }
                  if(userList.isSearchuserPopup == true){
                      selectUserFromSearch(userId, select2Data.name);
                      window.close();
                  }else{
                    userList.redirectTo("details",true,userId); // No I18N
                  }
                }
              });
           }else{
            var displayName = jQuery("#hidden_"+idAttr).val(); // No I18N
            jQuery("#"+idAttr).val(displayName).valid();
            jQuery("#s2id_"+idAttr).find('.select2-input').val(displayName).trigger("keydown");
           }
        });
      }
    },
    u_add.constructPortalUserList = function(in_obj, start_index){
      var inputObject = {};
      var list_info  = {};
      var criteria = [{
        field: "name", // No I18N
        condition: "is", // No I18N
        value: in_obj.name
      }];
          list_info.start_index = start_index || 1;
          list_info.row_count = 10;
          list_info.sort_field = "name"; // No I18N
          list_info.sort_order = "asc"; // No I18N
          list_info.fields_required = ["name", "profile_pic", "email_id", "jobtitle", "mobile"]; // No I18N
          if(!isSCP) {
            list_info.fields_required.push("is_vipuser");// No I18N
            list_info.fields_required.push("department");// No I18N
          }

          if(in_obj.email_id){
            criteria.push({
              field: "email_id", // No I18N
              condition: "is", // No I18N
              value: in_obj.email_id,
              logical_operator : "and" //No I18n
            })
          }
          list_info.search_criteria = criteria;
          inputObject.list_info = list_info;
          var dataval = sdpAjaxInputData(inputObject), usercnt = 0;
          sdpAjax({
            url: '/api/v3/users', // No I18N
            data : dataval,
            success: function(resp) {
                  u_add.hasMoreRows = resp.list_info.has_more_rows;
                  u_add.newStartIndex = resp.list_info.start_index + 10;
              var users = resp.users;
              var userStr = "";//No I18N
                  usercnt = users.length;
                  if(usercnt){
                    for (var i = 0; i < usercnt; i++) {
                        var user = users[i];
                        var nameStr = e_html(user.name);
                            if(userList.isSearchuserPopup == true){
                                 nameStr = '<a rel="noopener noreferrer" href="/" data-event="click" data-handler="selectUser('+parseInt(user.id)+');window.close();" nonce='+sdpNonce+'>'+ZSEC.Encoder.encodeForHTML(user.name)+'</a>'; // No I18N
                            }
                            var vipStr = user.is_vipuser ? '<span class="cspr vip-user icon-sm pos-rel" style="top:-16px;"></span>' :''; // No I18N
                            var imgURL = "/images/default-profile-pic2.svg";    //NO I18N

                            if (user.profile_pic){
                              imgURL = user.profile_pic["content-url"];    //NO I18N
                            }
                              userStr += '<li><div class="p10 fw visi-parent"><div class="disp-t pos-rel prp-photo"><div class="disp-c pr10 vmiddle"><span class="prp disp-b"><img class="icon-xxl" src="'+imgURL+'"></span>'+vipStr+'</div><div class="disp-c fw p0 m0 vmiddle"><div style="width:420px;"><div class="mb2 sb bk-truncate">'+nameStr+'</div><div class="text-muted bk-truncate">'+(user.email_id ? e_html(user.email_id) : "" )+'</div><div class="text-muted bk-truncate mt5">'+(user.jobtitle ? e_html(user.jobtitle)+" - " : "" )+(user.department ? e_html(user.department.name) : "" )+'</div><div class="text-muted bk-truncate mt5">'+(user.mobile ? e_html(user.mobile) : "" )+'</div></div><span class="text-muted text-link pos-abs" style="bottom:5px;right:25px;"><span class="more-dots11 visi-item cur-ptr" data-userid="'+user.id+'">[ '+translate("common.viewdetails")+' ]</span></span></div></div></div></li>'; // No I18N
                    }
                    if(start_index){
                       jQuery("[id*='_DIALOG_LAYER']").find("#userList").append(userStr); // No I18N
                    }else{
                      userStr ='<div class="bulk-select-search pos-rel m10" style="height: 40px;border: 1px solid #e3e3e3;border-radius: 5px;"><span class="list-sprite icon-md search-icon"></span><input class="user-search form-control pos-rel pl30 pr30" type="search" autocomplete="off" id="searchText"></div><ul id="userList" class="p0 m0" style="list-style:none;height:450px;overflow-y:auto;">'+ userStr +'</ul>'; // No I18N
                      userStr += '<div class="submit-row m0 form-footer" data-id="form-footer" id="submit-row" style="bottom: 0px;z-index: 10;"><span id="addRequestr" class="btn btn-primary">'+translate("user.portal.save")+'</span><span class="btn btn-default" id="user_cancel">'+translate("sdp.common.cancel")+'</span></div>'; // No I18N
                      userStr = "<div id='portalUserList' class='user-sel-cust'>"+userStr+"</div>"+'<div class="userdetails p10 pt0" style="display: none;" data-id="userDetailPopover"><div class="fr pos-rel top10"><input type="button" class="closebutton"></div><iframe data-id="userDetailsQuickView" class="mt20" style="width: 100%;height:94%;border:none;"></iframe></div>';
                      jQuery("#loader-div").html(''); // No I18N
                      showDialog(userStr,'title='+translate("user.portal.exist.lable")+', width=500, modal=yes, position=absmiddle, close=no', function(){ // No I18N
                        var dialogLayer = jQuery("[id*='_DIALOG_LAYER']"); // No I18N
                            dialogLayer.find(".user-search").menuSearch({"parent" :"#portalUserList"}); // No I18N
                            dialogLayer.find("#user_cancel").on("click", function(){ // No I18N
                                      closeDialog();
                                      if(isSCP && !userList.isUser) {
                                        userList.redirectTo('list', false); // No I18N
                                      } else {
                                      userList.redirectTo('list', true); // No I18N
                                      }

                                    });
                            dialogLayer.find('#userList').on('scroll', function() { // No I18N
                              var divHeight = jQuery(this).scrollTop() + jQuery(this).innerHeight();
                              var scrollHeight = jQuery(this)[0].scrollHeight;
                              //Getting API call, whenever scroll reaches the bottom of the div and "has_more_rows" is true
                              if(Math.abs(divHeight - scrollHeight) <= 5 && u_add.hasMoreRows){
                                  u_add.constructPortalUserList(in_obj, u_add.newStartIndex);
                              }
                            });

                            dialogLayer.on("click", '.more-dots11' ,function(event){
                                var target = jQuery(this);
                                var attrObj = {};
                                var alignment = sdp_user.DIRECTION == "RTL" ? "left" : "right"; // No I18N
                                    attrObj[alignment] = "-"+(dialogLayer.find("#portalUserList").width() - 140)+"px"; // No I18N
                                    attrObj.display = "block"; // No I18N
                                    attrObj.height='600px'; // No I18N
                                var userId = target.attr("data-userid"); // No I18N
                                    dialogLayer.find('[data-id=userDetailPopover]').css(attrObj); // No I18N
                                    dialogLayer.find("[data-id=userDetailsQuickView]").attr("src", "/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId="+userId+"&minContent=true&card=true&fromIframe=true&externalframe=true");  //No I18N
                                    dialogLayer.find("[data-id=userDetailPopover]").find(".closebutton").off("click").on("click", function(){ // No I18N
                                        dialogLayer.find('[data-id=userDetailPopover]').css('display','none'); // No I18N
                                    });
                            });

                            dialogLayer.on("click", '#submit-row' ,function(event){
                              userAdd.saveUpdateUser("portal_add"); //No I18N
                            });

                            var userListEle = dialogLayer.find("#userList"); // No I18N
                            if(userListEle.find('li.noitem').length === 0){ // No I18N
                              userListEle.append('<li class="noitem tc hide text-color3 p10">' + translate("admin.search.notfound") + '</li>'); // No I18N
                            }

                      });
                    }
                  }
            },
            cache: false,
            async: false
          });
        return usercnt;
    }
    return u_add;
}());
/**
* Handlebar Helper to set icon
*/
Handlebars.registerHelper('attachIcon', function(name) { // NO I18N
  if(!window.attachIcon){
    var temp = new attachPreview();
    window.attachIcon = temp.options.icons;
  }
  var extension = cl_attach.extension(name);
return (window.attachIcon[extension]) ? window.attachIcon[extension] : window.attachIcon.other ;

});

//User Suggestion select2 component
function userSuggestionComponent(param, options){
  this.init(param, options || {});
}
userSuggestionComponent.prototype = {
  init : function(param, options){
      var userSelectEle = jQuery('[name="'+param+'"]');//no i18n
      if(isSCP && userList.fromAcc && param == "name"){
        userSelectEle = jQuery('input[name="'+param+'"]');//no i18n
      }
        userSelect.initializeSelect2({
        url : "/api/v3/orgusers",// no i18n
        element:userSelectEle, // no i18n
        searchOptions:[param],//no i18n
        showAll: ["profile_pic","name","email_id","jobtitle","department","mobile","showmore"],//no i18n
        placeHolder:"",    // No I18N
        multiple : true,
        formatSearching: window.translate("ae.common.search.text"), //no i18n
        entity_name : "orgusers", // No I18N
        dropdownCssClass: "user-sel-cust", // No I18N
        isAPI : true,
        changeCallback : userAdd.userAssociatePopup,
        minimumInputLength: 1,
        resultsFn : function(data, page, obj){
           if(data.orgusers.length > 0 && trim(obj.term) != ""){//no i18n
              jQuery("#select2-drop").addClass("org-user-selection");//no i18n
              jQuery("#select2-drop").removeClass("org-user-hidden");//no i18n
           }else{
              jQuery("#select2-drop").removeClass("org-user-selection");//no i18n
              jQuery("#select2-drop").addClass("org-user-hidden");//no i18n
           }
        },
        maximumSelection :  1,
        criteriaCallback : function(searchText, search_criteria){
          var suggestion = options.suggestion || "user_suggestions";// No I18N
          var search_criteriaObj = {
              field: "operation_type", // No I18N
              condition: 'contains', // No I18N
              values: [suggestion],
              logical_operator: "AND" // No I18N
            }
          if(!jQuery.isEmptyObject(search_criteria)){
            search_criteria.children.push(search_criteriaObj);
          }else{
            search_criteria = search_criteriaObj;
          }
          return search_criteria;
        }
      });
      this.eventsBinding(userSelectEle, param);
    },
    eventsBinding : function(userSelectEle, param){
      userSelectEle.select2("container").find(".select2-drop").prepend("<div class='select2-filter-option whitebg'><p style='white-space:Normal;' class='pl5 mb0 sb'><i class='cspr icon-sm info mr5'></i>"+translate("user.portal.associate.info")+"</p></div>"); // No I18N
      userSelectEle.data("select2").clearSearch = function(){ // No I18N
         //To hide the select2 - results section
        jQuery("#select2-drop").removeClass("org-user-selection");//no i18n
        jQuery("#select2-drop").addClass("org-user-hidden");//no i18n
      }
      userSelectEle.data("select2").clearPlaceholder = function(){ // No I18N
        //To hide the select2 - results section
        jQuery("#select2-drop").removeClass("org-user-selection");
        jQuery("#select2-drop").addClass("org-user-hidden");
      }
      //To avoid TAB key selection, overritten the select2's keydown event for this element
      jQuery("#s2id_"+param).find('.select2-input').attr("data-name","usersuggestion_"+param).off('keydown').on('keydown', function (e) { // No I18N
        var that = userSelectEle.data("select2"); // No I18N
        if (!that.isInterfaceEnabled()){
            return;
        }

        // filter 229 keyCodes (input method editor is processing key input)
        if (229 == e.keyCode){
            return;
        }
        var KEY_CODE = { TAB: 9, ENTER: 13, ESC: 27,UP: 38,DOWN: 40,PAGE_UP: 33,PAGE_DOWN: 34};
        if (e.which === KEY_CODE.PAGE_UP || e.which === KEY_CODE.PAGE_DOWN) {
            // prevent the page from scrolling
            killEvent(e);
            return;
        }

        switch (e.which) {
            case KEY_CODE.UP:
            case KEY_CODE.DOWN:
                that.moveHighlight((e.which === KEY_CODE.UP) ? -1 : 1);
                killEvent(e);
                return;
            case KEY_CODE.ENTER:
                that.selectHighlighted();
                killEvent(e);
                return;
            case KEY_CODE.TAB:
                jQuery('[name="'+param+'"]').select2("close"); // No I18N
                return;
            case KEY_CODE.ESC:
                that.cancel(e);
                killEvent(e);
                return;
        }

        function killEvent(event){
          event.preventDefault();
          event.stopPropagation();
        }
    });

    jQuery("#s2id_"+param).find('.select2-input').on('keyup', function(){
      var ele = this;
      var val = trim(jQuery(ele).val());
      jQuery("#hidden_"+param).val(val);
        if(!val || val.length < 1){
          jQuery("#select2-drop").removeClass("org-user-selection");
          jQuery("#select2-drop").addClass("org-user-hidden");
        }
    });
    //To avoid auto reomving the text from Select2 on blur (Select2 behaviour), we stored the typed text and refill the textbox
    userSelectEle.on("select2-blur", function(a, b){ // No I18N
      if(jQuery(this).select2('data').length == 0){
        var displayName = jQuery('[data-name="usersuggestion_'+param+'"]').val();
        jQuery("#s2id_"+param).find('.select2-input').val(displayName);
        jQuery("#hidden_"+param).val(displayName);
        jQuery("#"+param).val(displayName);
        if(!jQuery("#select2-drop").is(":visible")){
          jQuery("#select2-drop").removeClass("org-user-selection");
          jQuery("#select2-drop").addClass("org-user-hidden");
          jQuery("#"+param).val(displayName);
        }
      }
    });
    //When user click on select2, loading the combined names string in Select2
    userSelectEle.on("select2-open", function(){ // No I18N
      var displayName = jQuery("#hidden_"+param).val(); // No I18N
      if(!displayName){
        if(param == "name"){
          var fName = trim(jQuery("#first_name").val()); // No I18N
          var MName = trim(jQuery("#middle_name").val()); // No I18N
          var LName = trim(jQuery("#last_name").val()); // No I18N
              displayName = fName+" "+MName+" "+LName; // No I18N
        }else{
          displayName = jQuery("#email_id").val();
        }
      }
      displayName = trim(displayName);
      if(displayName){
        jQuery("#"+param).val(displayName);
        //After loading the combined names string in Select2, trigger to API call
        jQuery("#s2id_"+param).find('.select2-input').val(displayName).trigger("keyup-change"); // No I18N
      }
      jQuery("#name").valid();
    });
    //When Select2 gets closed, need to hide Select2 results drop
    userSelectEle.on("select2-close", function(){ // No I18N
        userSelectEle.select2("dropdown").addClass("org-user-hidden").removeClass("org-user-selection"); // No I18N
    });
  }
}

//bulk update starts
var bulkUpdate = {
    getFieldsRules: function(formObject) {

        var fieldsRule = {
            service_request_approver: function(user) {
                return user.email_id || user.login_name;
            },

            purchase_approver: function(user) {
                return user.email_id;
            },

            purchase_approval_limit: function(user) {
                return user.email_id;
            },

            all_domain: function(user) {
                return user.login_name;
            },

            domain: function(user) {
                return user.login_name;
            },

            associated_roles: function(user) {
              return (isSCP && userAddData.isImportReps) || user.login_name && (user.type === "Technician" || userAdd.changeTo === "change_as_technician" || isMSP);
            },

            requester_allowed_to_view: function(user) {
                return user.type === "User";
            },

            is_org_admin: function (user) {
                return user.login_name;
            }
        };

        var rules = {};

        var fields = [];//to maintain the index of the each fields which are going to be ignored for a user based on the condition.

        //getting fields rules for the given data so that no need to check the fields that are not in the data.
        for(var field in fieldsRule) {
            if(formObject.hasOwnProperty(field)) {
                rules[field] = fieldsRule[field];
                fields.push(field);
            }
        }

        return {rules: fieldsRule, fields: fields};
    },

    // returns the warning info msg icon of the given field.
    getWarningInfoIcon: function(field, append) {
        function getWarningIcon(iconContainer, warningIconHTML) {
            var warningIcon = iconContainer.find(".warning");
            var isAppended = false;

            if(warningIcon.length === 0 && append !== false) {
                warningIconHTML = warningIconHTML || "<span class='cspr warning icon-sm ml5 cur-ptr'></span>"; // No I18N

                iconContainer.append(warningIconHTML); //append icon if not exixts.

                warningIcon = iconContainer.find(".warning");
                isAppended = true;

                warningIcon.on('click', function(event) { // No I18N
                    bulkUpdate.displayInfoMessage(field, "show"); // No I18N
                });
            }

            return { icon: warningIcon, isAppended: isAppended };
        }

        var warningIcon;

        if(field === "domain" || field === "associated_roles" || field === "can_generate_authtoken" || field === "all_domain") {
            //warning icon for select2
            warningIcon = '<span class="fr cur-ptr pos-abs top5 right0"><span aria-hidden="true" class="cspr warning icon-sm top5 left5" style="z-index: 9;"></span></span>';
        }

        switch(field) {
            case "service_request_approver": // No I18N
                var infoContainer = jQuery("#service_request_approver_control");
                return getWarningIcon(infoContainer);

            case "purchase_approver": // No I18N
                var infoContainer = jQuery("#purchase_approver_control").find('[data-id="papprover-warning"]');
                return getWarningIcon(infoContainer);

            case "all_domain": // No I18N
            case "domain": // No I18N
                var infoContainer = jQuery("#domain_control").parent(".right-col"); // No I18N
                return getWarningIcon(infoContainer, warningIcon);

            case "associated_roles": // No I18N
                var infoContainer = jQuery("#associated_roles_control").parent(".right-col"); // No I18N
                return getWarningIcon(infoContainer, warningIcon);

            case "account_manager": // No I18N
                var infoContainer = jQuery("#account_manager").closest(".right-col"); // No I18N
                return getWarningIcon(infoContainer, warningIcon);

            case "is_org_admin": // No I18N
                var infoContainer = jQuery("[for='isOrgAdminID']").closest(".right-col"); // No I18N
                return getWarningIcon(infoContainer);

            case "can_generate_authtoken": // No I18N
                var infoContainer = jQuery("#can_generate_authtoken_control").parent(".right-col") // No I18N
                return getWarningIcon(infoContainer, warningIcon);
        }
    },

    displayInfoMessage: function(field, display) {
        var infoMsg = jQuery("#bulk_edit_warning_msg");

        var currentMsgField = infoMsg.attr("data-attr");
        var hasInvalidUsers = !jQuery.isEmptyObject(bulkUpdate.getNonFieldUsers(field));

        if (display !== "hide" && !hasInvalidUsers) {
            return;
        }

        var icon = this.getWarningInfoIcon(field);

        var warningInfoIcon = icon.icon;

            //hide the warning info msg if it is shown for the given field.
        if(currentMsgField === field) {
            display === "hide" ? infoMsg.hide() : infoMsg.show(); // No I18N
        }

        display === "hide" ? warningInfoIcon.hide() : warningInfoIcon.show(); // No I18N

        //No need to show the warning info if all selected users can be updated by the field.
        if (!hasInvalidUsers || display === "hide" || currentMsgField === field || !icon.isAppended && display !== "show") {
            return;
        }

        function displayWaringMsgHTML(msg) {
            if(!warningInfoIcon || warningInfoIcon.length === 0) {
                return;
            } else if(!warningInfoIcon.is(":visible")) { // No I18N
                warningInfoIcon.show();
            }

            var offset = warningInfoIcon.offset();

            var top, left, right;

            top = offset.top;
            left = offset.left;

            right = jQuery(window).width() - left - 10;

            var position = right < 450 ? "right" : "left"; // No I18N

            left += 10;
            top += 10;

            //update the position and text/msg for the active field.
            if(infoMsg.length) {
                infoMsg.show();
                infoMsg.find(".msg").html(msg);

                infoMsg.attr("data-attr", field);
                if(position === "left") {
                    infoMsg.css({top: top + "px", left: left + "px","right":""}); // No I18N
                } else {
                    infoMsg.css({top: top + 'px', right: right + "px", "float": "right", "left": ""}); // No I18N
                }
            }
            else {
               //adding the warning info msg for first time.
                position === "right" ? customStyle = "float: right; right: " + right + "px" : customStyle = "left: " + left + "px"; // No I18N

                jQuery('body').append('<div id="bulk_edit_warning_msg" data-attr="' + field + '" class="alert alert-dismissible alert-warning rounded5 pos-abs" role="alert" \n' +  // No I18N
                    '  style="top: ' + top + 'px;' + customStyle + ' ; width: 450px; z-index: 10;">\n' + // No I18N
                    '  <button type="button" class="close" data-switch="sdalert">\n' + // No I18N
                    '       <span class="sdp-glyph sdp-glyph-close icon-xs" aria-hidden="true" title='+translate('common.close')+'></span>\n' + // No I18N
                    '  </button>\n' + // No I18N
                    '  <span class="msg">' + msg + '</span>\n' + // No I18N
                    '</div>');
                $sdEventListener("#bulk_edit_warning_msg"); // No I18N
            }
        }

        var technicians = "sdp.admin.leftpanel.users.technician"; // No I18N
        var users = "approve.users"; // No I18N
        var userType = translate(userAdd.isUser || userAdd.changeTo === "change_as_technician" ? users : technicians);// No I18N

        function getLink() {
            return ['<a href="/" id="bulk-user-remove-link">' + userType + '</a>'];
        }


        var msg = "";

        switch(field) {
            case "service_request_approver": // No I18N
                msg = translate("bulk.update.sra.ignore.msg", getLink());
                break;

            case "purchase_approver": // No I18N
                msg = translate("bulk.update.pa.ignore.msg", getLink());
                break;

            case "all_domain": // No I18N
            case "domain": // No I18N
                msg = translate("bulk.update.domain.ignore.msg", getLink());
                break;

            case "associated_roles": // No I18N
            case "account_manager": // No I18N
                msg = translate("bulk.update.role.ignore.msg", getLink());
                break;

            case "is_org_admin": // No I18N
                msg = translate("bulk.update.org_admin.ignore.msg", getLink());
                break;
            case "can_generate_authtoken": // No I18N
                msg = translate("bulk.update.authtoken.ignore.msg", getLink());
        }

        displayWaringMsgHTML(msg);
        jQuery("#bulk-user-remove-link").on("click", () => {
          bulkUpdate.showNonFieldUsers(field);
        });
    },

    //returns object({ fields index, [user ids] }), the indexes of the fields that can't be updated for the users.
    getUnSupportedFieldsMap: function(users, fields) {
        var fieldRules = fields.rules, fields = fields.fields;
        var usersData = {};

        for(var id in users) {
            var user = users[id];
            var fieldsIndexes = [];

            //getting indexes of the fields
            fields.forEach(function(field, index) {
                if(!fieldRules[field](user)) {
                    fieldsIndexes.push(index);
                }
            });

            //indexes of the fields that are not allowed to update for the user.
            var key = fieldsIndexes.toString();

            if(!usersData[key]) {
                usersData[key] = [];
            }

            usersData[key].push(user.id);
        }

        return usersData;
    },

    getRequesters: function(users) {
        var requesters = {};
        for(var id in users) {
            var user = users[id];
            if(user.type === "User") {
                requesters[id] = user;
            }
        }
        return requesters;
    },

    getSelectedUsers: function() {
        var users = userAdd.getTableObject().bulkSelect.selectedRecords;

        //getting requester alone for "change_as_technician".
        if((!isSCP || !userAddData.isImportReps) && userAdd.changeTo === "change_as_technician") {
            return this.getRequesters(users);
        }
        return users;
    },

    checkUserSelection: function(users) {
        if (jQuery.isEmptyObject(users)) {
            if(isSCP && userAddData.isImportReps) {
              return "scp.no.reps.selected.withlogin.msg";// No I18N
            }
            return userAdd.changeTo === "change_as_technician" ? "select.requesters.to.change.as.tech" : "no.user.selected"; // No I18N
        }
        return "";
    },

    updateUsers: function(formObject, saveEntname) {
        var users = this.getSelectedUsers();
        var data = this.removeUnChangedFields(formObject[saveEntname]);
        var technicianFields = ["associated_roles"];

        var fieldsRules = this.getFieldsRules(data);
        var forbiddenFields = this.getUnSupportedFieldsMap(users, fieldsRules);
        var hasUsersUpdated = false;

        var errMsg = this.checkUserSelection(users);

        errMsg = errMsg === "" ? jQuery.isEmptyObject(data) ? "common.nothing.to.save" : "" : errMsg;

        if (errMsg !== "") {
            this.hideLoader();
            showalert('failure', translate(errMsg), "isAutoHide=false"); // No I18N
            return false;
        }

        //remove not allowed fields for the users and update remaining the fields.
        for(var fieldsIndexes in forbiddenFields) {
            var updatableData = {}, usersData = {};
            var userIDs = forbiddenFields[fieldsIndexes];

            updatableData = this.getData(fieldsIndexes, fieldsRules.fields, data);//to remove not allowed fields for the users.

            var hasTechnicianField = technicianFields.some(function(field) {
                return updatableData.hasOwnProperty(field);
            });

            var inputField = hasTechnicianField ? "technician" : saveEntname;//to make technician call if a technician field is found. // No I18N
            if(isMSP) {
              inputField = saveEntname;
            }

            usersData[inputField] = updatableData;

            //don't make an update call if there is no data or no user is selected.
            if(!jQuery.isEmptyObject(updatableData) && userIDs.length > 0) {
                hasUsersUpdated = this.updateUsersAjax(userIDs, usersData, inputField) || hasUsersUpdated;
            }
        }

        if(!hasUsersUpdated) {
            showalert("failure", translate("no.fields.matches.criteria"), "isAutoHide=false"); // No I18N
            this.hideLoader();
            return false;
        }
        return true;
    },


    //returns the users data that can be updated for the users and ignores which
    //can't be updated.
    getData: function(fieldsIndex, fields, data) {
        var updatableData = {};
        var unSupportedFields = {};
        var indexes = fieldsIndex.split(",");

        indexes.forEach(function(index) {
            var field = fields[index];//getting unsupported field.
            unSupportedFields[field] = true;
        });

        for(var field in data) {
            if(unSupportedFields[field] !== true) {
                updatableData[field] = data[field];//getting allowed fields.
            }
        }
        return updatableData;
    },

    updateUsersAjax: function(userIDs, data, entityURL) {
        var type = "PUT"// No I18N
        if(!bulkUpdate.onBulkUpdateSuccess.noOfAjaxCalls) {
            bulkUpdate.onBulkUpdateSuccess.noOfAjaxCalls = 0;
        }

    if (isSCP && userAddData.isImportReps) {
            entityURL = "technicians/associate_to_instance";// No I18N
            type = "POST";// No I18N
        } else if(userAdd.changeTo === "change_as_technician") {// No I18N
            entityURL = "users/_change_as_technician";// No I18N
        } else {
            entityURL = entityURL + "s";// No I18N
        }

        bulkUpdate.onBulkUpdateSuccess.noOfAjaxCalls++;

        sdpAjax({
            url: "/api/v3/" + entityURL + "?ids=" + userIDs.toString(), // No I18N
            data: sdpAjaxInputData(data),
            type: type, // No I18N
            success: function (response) {
                var summary = messageHandling.summary;
                var noOfRecords = response.response_status.length || userIDs.length;

                summary.noOfRecords += noOfRecords;
                summary.noOfRecordsUpdated += noOfRecords;

                bulkUpdate.onBulkUpdateSuccess();
            },
            failedCallBack: function(response) {
                var options = {
                    response: response,
                    records:  userAdd.getTableObject().bulkSelect.selectedRecords,
                    metainfo: userAdd.meta_info
                };

                messageHandling.updateFailureSummary(options, userIDs);
                bulkUpdate.onBulkUpdateSuccess();
            },
            ignorefailuremessage: false
        });
        return true;
    },

    onBulkUpdateSuccess: function() {
        bulkUpdate.onBulkUpdateSuccess.noOfAjaxCalls--;
        //reset when all API update call finished.
        if(bulkUpdate.onBulkUpdateSuccess.noOfAjaxCalls <= 0) {
            var tableObj = window.opener.userList.getTableObject();
            tableObj.bulkSelect.resetSelectedRecords();
            tableObj.refreshTable("refresh"); // No I18N
            this.closeBulkEditWindow();
        }
    },

    closeBulkEditWindow: function() {
        this.hideLoader();
        window.close();

        //show bulk update failure summary.
        if(messageHandling.summary.failedRecords.length > 0) {
          var msg = {
            noOfRecordsUpdatedMsg: translate("sdp.noOf.users.updated"),
            noOfRecordsFailedMsg: translate("sdp.noOf.users.failed"),
            entity: translate("sdp.helpdesk.common.user")
          }

            const html = renderhbs(null, 'bulk-update-summary', {...msg, ...messageHandling.summary}, false, 'users', null, true, null, true); //No I18N
           window.opener.jQuery(html).dialog({ width: 800, height: 600, modal: true, title: translate("update.summary") });
        } else {
            var msg = translate("api.updated.success", [translate("sdp.inventory.wsRtPanel.userDetails")]); // No I18N
            window.opener.showalert("success", msg ,"isAutoHide=true"); // No I18N
        }
    },

    //removes the unchanged fields for the bulk edit.
    removeUnChangedFields: function(fieldObject) {
        for(var i in fieldObject) {
            var field = fieldObject[i];
            if(!fieldObject.hasOwnProperty(i)) {
                continue;
            }
            if(field === null) {
                delete fieldObject[i];//delete unchanged object.
            } else if(typeof field === "object") { //No I18N
                var obj = this.removeUnChangedFields(field);//remove unchanged fields of a child object recursively.

                if(Array.isArray(obj) && obj.length === 0 || jQuery.isEmptyObject(obj)) {
                    delete fieldObject[i];
                } else {
                    fieldObject[i] = obj;
                }
            } else if(field === "false") {//for checkbox fields.
                delete fieldObject[i];
            }
        }
        return fieldObject;
    },

    hideLoader: function() {
        jQuery("#loader-div").html("");
    },

    getNonFieldUsers: function(field) {
        var users = this.getSelectedUsers();

        //returns users who doesn't match the criteria.
        //e.g returns the users who don't have email id for field "purchase_approver".
        function getUsers(checkCondition) {
            var usersWithoutFields = {};
            for(var id in users) {
                var user = users[id];
                if(checkCondition(user)) {
                    usersWithoutFields[id] = user;
                }
            }
            return usersWithoutFields;
        }

        switch(field) {
            case "purchase_approver": // No I18N
                return getUsers(function(user) { return !user.email_id; });

            case "service_request_approver": // No I18N
                return getUsers(function(user) { return !user.email_id && !user.login_name; });

            case "account_manager": // No I18N
            case "is_org_admin": // No I18N
            case "associated_roles": // No I18N
            case "can_generate_authtoken": // No I18N
            case "domain": // No I18N
                return getUsers(function(user) { return !user.login_name; });

            default:
                return {};
        }
    },


    showNonFieldUsers: function(field) {
        var users = this.getNonFieldUsers(field);

        var title = "";

        switch(field) {
            case "service_request_approver": // No I18N
                title = "non.email.login.users"; // No I18N
                break;

            case "purchase_approver": // No I18N
                title = "non.email.users"; // No I18N
                break;

            case "is_org_admin":// No I18N
            case "all_domain": // No I18N
            case "domain": // No I18N
            case "associated_roles": // No I18N
                title = "non.login.users"; // No I18N
                break;
        }

        var options = {
            allowed_values  : Object.values(users),
             saveCallBack: function (users) {
               bulkUpdate.removeNonFieldUsers(users, field);
             },
            saveBtnText     : translate("sdp.common.remove"),
            dialogtitle     : translate(title),
            height          : 549
        };

        importUserAssociation = new BulkAssociationComponent(options, userAdd);
        jQuery("#bulk_select_grid").prepend('<div class="alert alert-info icon" style="margin: 0px;" role="alert"><span class="msg">' + translate("bulk.update.rmve.users.msg") + '</div>');  // No I18N
    },

    removeNonFieldUsers: function (users, field) {
        var bulkSelect = userAdd.getTableObject().bulkSelect;
        var selectedRecords = bulkSelect.selectedRecords;

        var selectedCheckboxes = bulkSelect.getSelectedCheckbox();
        users.selectedIds.forEach(function(id) {
            selectedCheckboxes.filter("[value=" + id + "]").trigger('click');
            bulkSelect.removeRecord(id);
        });

        bulkSelect.setSelectedRecordsCount();
        bulkUpdate.removeWarningIcons(selectedRecords);
        jQuery("#bulk_edit_warning_msg").hide();

        if(jQuery.isEmptyObject(selectedRecords)) {
            showalert('failure', translate("bulk.users.all.removed"), "isAutoHide=false"); // No I18N
        }
        if(jQuery.isEmptyObject(bulkUpdate.getNonFieldUsers(field))) {
          this.getWarningInfoIcon(field).icon.hide();
        }
    },

    removeWarningIcons: function(users) {
        var withoutLogin = false, withoutEmail = false, withoutLoginEmail = false;
        for(var id in users) {
            var user = users[id];

            if(!user.login_name) {
                withoutLogin = true;
            }

            if(!user.email_id) {
                withoutEmail = true;
            }

            if(!user.email_id && !user.login_name) {
                withoutLoginEmail = true;
                break;
            }
        }

        if(!withoutEmail) {
            this.getWarningInfoIcon("purchase_approver").icon.remove();
        }

        if(!withoutLogin) {
            this.getWarningInfoIcon("all_domain").icon.remove();
            this.getWarningInfoIcon("domain").icon.remove();
            this.getWarningInfoIcon("associated_roles").icon.remove();
        }

        if(!withoutLoginEmail) {
            this.getWarningInfoIcon("service_request_approver").icon.remove();
        }
    }
};
