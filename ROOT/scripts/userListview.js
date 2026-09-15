/* User/ Technician related Listview section starts*/
userList = jQuery.extend(true, userList, (function(){
     var l_view = userList;
     var table_tech = {};
     window.isSCP = sdp_app.IS_SCP;
     window.isMSP = sdp_app.IS_MSP;
     userList.mspAccountId = jQuery("#__persistentAccountId__select").val();

     l_view.getMetaInfo = function(isUser){
      return new Promise((resolve) => {
        var entityName = "technicians"; // No I18N
        // For SCP, during import rep popup, orguser metainfo call should  be invoked
        if(isSCP && l_view.isImportReps) {
            entityName = "orgusers"; // No I18N
        }else if(isUser) {
          entityName = (forwardfrom == "ESM" || ((l_view.isADInactiveUserListView || l_view.isAzureInactiveUserListView) && isMDHSetup == "true")) ? "orgusers" : "users"; // No I18N
        }
        var userInputData;
        if(l_view.isCMDB && l_view.ciTypeId && l_view.ciTypeId != ""){ //Meta info input_data for CIType User under CMDB
          userInputData = {"template" : {"id" : l_view.ciTypeId}}; // No I18N
        }
        sdpAjax({
       url : "/api/v3/"+entityName+"/_metainfo", //NO I18N
          data : sdpAjaxInputData(userInputData),
          success : function(resp){
            resolve(resp.metainfo);
          }
        });
      })
     },
     l_view.getGlobalSearchMetaInfo = function() {
        var forGlobalSearchData = '{"for":"globaUserSearch"}';  // No I18N
        var entityName = (forwardfrom == "ESM" || ((l_view.isADInactiveUserListView || l_view.isAzureInactiveUserListView )&& isMDHSetup == "true")) ? "orgusers" : "users"; // No I18N
        if(entityName == "users") {
            sdpAjax({
              url : "/api/v3/"+entityName+"/_metainfo?input_data=" + encodeURIComponent(forGlobalSearchData), //NO I18N
              type: "GET", // No I18N
              async: false,
              success : function(resp){
                l_view.global_search_meta_info = resp.metainfo;
              }
            });
         }
     }
     /*call table component*/
     l_view.initTableComonent = async function(isUser){
        l_view.meta_info = await l_view.getMetaInfo(isUser);
        if(isUser) {
          l_view.getGlobalSearchMetaInfo();
        }
        initTooltip("#listcontrols"); // No I18N
        if(!l_view.isSearchuserPopup){
          sdpAjax({
            url : "/UserAPISupportAction.do?method=getUserDCInfo", // No I18N
            success : function(resp){
              l_view.user_get = resp.user_get;
            },
            async: false
          });
        }
        if(typeof forwardfrom == "undefined"){ // No I18N
          forwardfrom = "";  // No I18N
        }
        var table_content = {}, personalize_key = l_view.entity_name;
        var popupFor = l_view.popupfor;
        var appliedFilter = userList.appliedFilter = userList.appliedFilter || jQuery("#filterViewMenu").attr("applied-filter");
        if (isSCP && (userList.module === "Request" || userList.module === "QuickReq") || (isMSP && (!jQuery("#filterViewMenu").length || !isUser))) {
            userList.appliedFilter = appliedFilter = "active";// No I18N
        }
        if (isMSP) {
          userList.fetchAssociatedRoles(false);
          if (l_view.module === "merge_unknown_users") {
            userList.isMspRequester = false;
          }
          if (!userList.isMspRequester) {
            userList.enableMspHeaderAccount(appliedFilter === "active"); //No I18N
            if (appliedFilter !== "active") {
              userList.setMspAccount({ id: 0 });
            }
          }
          if (l_view.apiModule === "account_managers") {
            userList.appliedFilter = "associate_account_managers";// No I18N
          } else if (l_view.apiModule === "point_of_contact") {// No I18N
            userList.appliedFilter = "associate_point_of_contact";// No I18N
          }
        }

        if(appliedFilter === "unapproved" || appliedFilter === "registered" || appliedFilter === "all") {
           //#1324: merge user not supported for these filters.
           jQuery("#userMerge").hide();
        }
        if(isUser){
            personalize_key = l_view.entity_name = (forwardfrom == "ESM" || ((l_view.isADInactiveUserListView || l_view.isAzureInactiveUserListView) && isMDHSetup == "true")) ? "orgusers" : "users"; // No I18N

          if (l_view.module === "merge_unknown_users") {
            personalize_key = "unknown_requester_parent_list";// No I18N
            l_view.entity_name = "users"; // No I18N
          } else if (userList.isMspRequester) {
            personalize_key = "msp_requesters";// No I18N
            l_view.entity_name = "users"; // No I18N
          } else if (isSCP && popupFor === "associate_acc_contacts") {// No I18N
            l_view.entity_name = "users"; // No I18N
            personalize_key = popupFor;
          } else if(isSCP && userList.isImportReps) {
            l_view.entity_name = "orgusers";// No I18N
            personalize_key = popupFor;
          } else if (isSCP && l_view.fromAcc) {
            l_view.entity_name = "users";// No I18N
            personalize_key = l_view.subaccId ? "sub_account_contacts" : "account_contacts";// No I18N
          } else if (popupFor === "verify_users") {// No I18N
            personalize_key = popupFor;
            l_view.entity_name = "users"; // No I18N
          } else if (popupFor === "exclude_orgusers" || popupFor === "include_orgusers") {// No I18N
            l_view.entity_name = "orgusers";// No I18N
            personalize_key = "modify_criteria_orguers";// No I18N
          } else if(l_view.isSearchuserPopup || l_view.isADInactiveUserListView == true || l_view.isAzureInactiveUserListView == true) {
            personalize_key = l_view.entity_name+"_popup"; // No I18N
          }else if(l_view.isCMDB && jQuery("#cmdbUserType").val() == "child") {// No I18N
              personalize_key = "users_"+l_view.ciTypeId; // No I18N
          }
        }else{
          if(isMSP && getAccountName(userList.mspMyOrgAccountId) === undefined) {
            //don't show change as technician dropdown if account/site admin is not assoicated with "My Org Inc" account.
            jQuery("#changeastech_container").remove();
          } else if(!l_view.isADInactiveUserListView && !l_view.isAzureInactiveUserListView){
          /* Initialize Select2 for Change as Technician*/
           // var param = {"element" : "changeastech","excludeTech" :true,"placeHolder" : translate("sdp.admin.requesterDef.changeAsTechnician")}; // No I18N
                //userSelect.initializeSelect2(param);
                var techoptions = {
                  callbackURL: "/users" + (isMSP ? "?ACCOUNTID=" + userList.mspMyOrgAccountId : ""), // No I18N
                  placeholder: translate("sdp.admin.requesterDef.changeAsTechnician"), // No I18N
                  select2Id : "changeastech", // No I18N
                  entity_name : "users", // No I18N
                  criteriaCallback : l_view.changeAsTechCrit
                }
                var _techSelect2 = new Select2APIComponent(techoptions);
                jQuery("#changeastech").on('change',function(udata,b){
                  userList.redirectTo('add',true,udata.added.id,'change_as_technician'); // No I18N
                  setTimeout(function(){
                    //Need to set as false, to avoid redirect to UserListview when we click on "Back to listview" button in Change as Technician page
                    jQuery("#change_as_technician").val(false);  // No I18N
                  },100);
                });
          }
        }
        var table_info = {};
        if(isUser) {
          /*Getting tableinfo for (Admin- Users , CMDB - Users & CI Users ) Listviews*/
          if(l_view.isInactiveUserListView){// Will be 'true', when filter by 'DeletedUsers' in ( Admin-User, CMDB-User) Listview
              table_info = {
                "fields_required" : {"name":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
                "list_info" : { // No I18N
                    "row_count" : "25" // No I18N
                }
              }
              if(forwardfrom == "ESM"){  // No I18N
                table_info.list_info.search_criteria = {"field" :"org_user_status","value": "RESIGNED","condition":"is"}; // No I18N
              }else{
                table_info.list_info.search_criteria = {"field" :"status","value": "RESIGNED","condition":"is"}; // No I18N
              }
          }else{
            table_info = getPersonalizeData(personalize_key);
            if(jQuery.isEmptyObject(table_info)){
              if(isSCP && l_view.fromAcc || popupFor === "include_orgusers" || popupFor === "exclude_orgusers" || forwardfrom == "ESM" || (isMDHSetup == "true" && (userList.isADInactiveUserListView || userList.isAzureInactiveUserListView))){   //NO I18N
                /*Getting tableinfo for (ESM Dir Users ) Listview*/
                table_info = {
                  "fields_required" : {"name":"","login_name":"","email_id":"","department":"","site":"","phone":"","mobile":"","jobtitle":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
                      "list_info" : { // No I18N
                          "row_count" : "25" // No I18N
                      }
                    }
              }else if(sdp_user.USERTYPE == "Requester"){ // No I18N
                table_info = {
                  "fields_required" : {"name":"","email_id":"","department":"","phone":"","mobile":"","jobtitle":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
                  "list_info" : { // No I18N
                      "row_count" : "25" // No I18N
                  }
                }
              }else{
                table_info = {
                  "fields_required" : {"name":"","is_technician":"","citype":"","login_name":"","email_id":"","department":"","site":"","phone":"","mobile":"","jobtitle":"","project_roles":"","employee_id":"","first_name":"","middle_name":"","last_name":""}, // No I18N
                  "list_info" : { // No I18N
                      "row_count" : "25" // No I18N
                  }
                }
              }
            }
          }
          if(l_view.module == "Intermediate_Editing"){
              table_info['template'] = {"id" : opener.$req.form.template.id}; //No I18N
        if(l_view.apiModule=="request_maintenances"){
          table_info['template'] = {"id" : opener.$maintenanceDetails.entity_data.template.id}; //No I18N
        }
          }
        }else{
          /*Getting tableinfo for (Admin- Technician) Listview*/
          table_info = table_comp.getTableInfo(personalize_key);
        }
        if (isSCP && userList.isImportReps) {
          table_info.list_info.search_criteria = l_view.getSearchCriteria("include_support_reps"); // No I18N
        } else if (l_view.module == "tfa") { // No I18N
          table_info.list_info.search_criteria = l_view.getSearchCriteria("with_login"); // No I18N
        } else if(l_view.filterSearchCriteria) {
            table_info.list_info.search_criteria = l_view.filterSearchCriteria;
        } else if (userList.appliedFilter) {
            //getting search_criteria as filterSearchCriteria is not available for first time when the page loaded.
            var searchCriteria = userList.getSearchCriteria(userList.appliedFilter);
            if(searchCriteria) {
              table_info.list_info.search_criteria = searchCriteria;
            }
        } else if(l_view.apiModule == "portalusers") { // No I18N
            var crObj = {
                "field" : "operation_type", // No I18N
                "value" : "manually_added", // No I18N
                "condition" : "contains" // No I18N
            };
            table_info.list_info.search_criteria = crObj;
        }else if(isUser){
          if(l_view.isCMDB){
            jQuery("#requesterListDiv").addClass('admin-container'); //Adding class 'admin-container' to solve some style issues under CMDB tab  // No I18N
            table_info.list_info.filter_by = {"id": l_view.ciTypeId}; // Listview filtered by CIType ID for User created CI-User // No I18N
          }
          if(isSCP && l_view.fromAcc) {
              table_info.list_info.search_criteria = l_view.getSearchCriteria("fromAcc");// No I18N
              jQuery("#user_lview").css("padding", "0px"); // No I18N
          } else if(l_view.isSearchuserPopup == true){
             var crObj;
             if (isSCP && popupFor === "associate_acc_contacts") {
                 crObj = l_view.getSearchCriteria(popupFor);
             } else if (popupFor === "verify_users") {// No I18N
                crObj = {
                    "field": "operation_type",// No I18N
                    "condition": "contains",// No I18N
                    "values": [// No I18N
                      "user_list_for_acknowledge"// No I18N
                    ],
                    "logical_operator": "AND" // No I18N
                }
             } else if (parent.sdp_app.INCLUDE_TECH_AS_REQUESTER != undefined && parent.sdp_app.INCLUDE_TECH_AS_REQUESTER == false && popupFor !== "include_orgusers" && popupFor !== "exclude_orgusers" && (isSCP && popupFor !== "associate_acc_contacts" && !userList.isImportReps)) { // No I18N
                crObj = {
                    "field" : "type", // No I18N
                    "value" : "user", // No I18N
                    "condition" : "contains", // No I18N
                    "logical_operator" : "AND" // No I18N
                };
             }
             if(crObj !== undefined) {
                 table_info.list_info.search_criteria = crObj;
             }
          }
        }
       if(!isUser) {
         l_view.initSiteFilter();
        }
        var _self = l_view;
        table_content.header = l_view.headerdataConstruct(isUser);
        l_view.isUser = isUser;
        setTimeout(function() {
          if(l_view.isADInactiveUserListView){
              table_info.list_info.search_criteria = {"field" :"is_in_ad","value": "false","condition":"is"}; // No I18N
              if(l_view.domainid && l_view.domainid != "null"){ // No I18N
                table_info.list_info.search_criteria.children = [{
                    "field" : "domain.id", // No I18N
                    "value" : l_view.domainid, // No I18N
                    "condition" : "is", // No I18N
                    "logical_operator" : "AND" // No I18N
                }];
              }
          }else if(l_view.isAzureInactiveUserListView){
              table_info.list_info.search_criteria = {"field" :"is_in_azure","value": "false","condition":"is"}; // No I18N
              if(l_view.domainid && l_view.domainid != "null"){ // No I18N
                table_info.list_info.search_criteria.children = [{
                    "field" : "domain.id", // No I18N
                    "value" : l_view.domainid, // No I18N
                    "condition" : "is", // No I18N
                    "logical_operator" : "AND" // No I18N
                }];
              }
          }else{
            if(!isUser && parent.sdp_app.IS_SITE_CONFIGURE){
              var siteId = jQuery("#sites").val();
              if(siteId!="" && siteId != null){
                table_info.list_info.search_criteria = {"field": "associated_sites","value": siteId,"condition": "is"}; // No I18N
              }
            }
          }
          var options = {};
          /*Initialize table component*/
          var tempentname = null;
          if(isUser){
            tempentname = "users"; // No I18N
          }else{
            tempentname = "technicians"; // No I18N
          }
              options.paginationEnabled   = true;
              options.searchEnabled       = true;
              options.sortingEnabled      = true;
              options.staticHeader= true;
              options.isODAPI = true;
              options.support_search_criteria = true;
              if(!isUser ||(isUser && !l_view.isInactiveUserListView)){
                  options.columnChooserEnabled= true;
              }
              var diffWidth = 0, header_height = 300;
              if(forwardfrom == "ESM"){
                diffWidth = -35;
              }
              if(l_view.isCMDB){
                diffWidth = -50;
                if(!jQ(".cmdb-wrap #Left-Section").is(":visible")){//No I18N
                    diffWidth = 240 + diffWidth;
                }
                header_height = 250;
              }
              if(l_view.isSearchuserPopup || l_view.isADInactiveUserListView || l_view.isAzureInactiveUserListView){
                options.isPopup = true;
                header_height = 180;
              }
              var leftPanelWidth = 280;

              if(isSCP && jQuery("#admin-sidebar").length === 0) {
                leftPanelWidth =  0;
                diffWidth = -35;
              }

              options.width = l_view.tableWidth ? l_view.tableWidth : jQuery("#header-placeholder").width() - leftPanelWidth + diffWidth;
              var dynHeight = jQuery('.listcontrols').height() + jQuery("#requesterListDiv .row").height() + header_height;
              options.height = l_view.tableHeight ? l_view.tableHeight : jQuery(window).height() - dynHeight;

              if(!l_view.isInactiveUserListView){
                options.personalize_key     = personalize_key;
              }
              options.callbackRowfunction = l_view.rowdataConstruct;
              options.row_inputdata       = l_view.rowdataConstruct(table_info,l_view);
              options.isFR_ListInfo_Support = true;
              /** Users Listview for other modules based on their data */
              if(l_view.apiEntity) {
                options.callbackURL       = ""; //No I18N
                if(l_view.apiModule) {
                  options.callbackURL    += l_view.apiModule+"/"; //No I18N
                  if(l_view.apiModuleId) {
                    options.callbackURL  += l_view.apiModuleId+"/"; //No I18N
                  }
                }
                options.callbackURL      += l_view.apiEntity;
                options.entity_name       = l_view.apiEntity;
                options.metainfo_entity   = l_view.entity_name;
              } else {
                options.callbackURL       = l_view.entity_name;
                options.entity_name       = l_view.entity_name;
              }
              options.tableHolder = tempentname;
              options.callbackSearchFunction = l_view.refreshTechnicianListview;
              options.callbackAfterBodyRender = l_view.callbackTableRender;

              if(l_view.module == "UserGroups"){ // No I18N
                options.row_inputdata.list_info.search_criteria = l_view.search_criteria;
              }

            options.discarded_fields = ["password", "associated_sites", "id", "requester_allowed_to_view", "citype_id", "sms_mail_id", "description", "status", "cost_per_hour", "service_request_approver", "allowed_to_view_cost", "secondary_emailids", "purchase_approval_limit", "created_time", "associated_roles", "purchase_approver", "is_online", "ciid", "is_vipuser", "support_group", "portaluser_id", "is_org_admin", "profile_pic", "type","org_user_status" ,"is_user_anonymized", "operation_type"]; // No I18N
              if (isSCP || isMSP && !userList.isMspRequester) {
                  options.discarded_fields.push("is_technician");
              }
              if(isMSP) {
                options.discarded_fields.push("associated_accounts");
              }
              if(forwardfrom == "ESM"){ // No I18N
                options.discarded_fields.push("ciid"); // No I18N
              }
              if(!isUser || forwardfrom == "ESM" || sdp_user.USERTYPE == "Requester"){ // No I18N
                options.discarded_fields.push("citype");
                options.discarded_fields.push("is_technician");
              }
              if(!l_view.isInactiveUserListView){
                options.getmetaInfo = true;
              }
              if(l_view.isCMDB && l_view.ciTypeId && l_view.ciTypeId != ""){ //Meta info input_data for CIType User under CMDB
                options.metaInfo_input = {"template" : {"id" : l_view.ciTypeId}}; // No I18N
              }
                options.meta_data = jQuery.extend(true, {}, l_view.meta_info.fields);
              var searchText = l_view.searchText || jQuery("[name='searchText']").val();

              if(searchText && trim(searchText) != ""){
                options.globalSearchEnabled = true;
                options.callbackGlobalSearch = l_view.getGlobalSearchList;
                jQuery("#searchUser").val(searchText);
              }
              if (isMSP && userList.module === "Request") {
                getAccountIDNeeded = window.parent.getAccountId;
              }
              if(l_view.module !="chat"){
                options.get_total_count=false;
              }
              options.bulkSelectionSetting = { //to enable bulk select.
                enabled: true,
                selectionLimit: l_view.module == "tfa" ? window.opener.tfa.tfaLoginRulesUsersSelectionLimit : l_view.popupfor === "include_orgusers" || l_view.popupfor === "exclude_orgusers" ? 250:100 , //No I18N
                constructSelectedListCB: l_view.constructSelectedListCB,
                selectedRecords: l_view.getDefaultSelectedRecords()
              };
              table_tech = new tableComponent(table_info,table_content,options, l_view);
        },100);
     },
     l_view.initSiteFilter = function() {
       if ((!l_view.isADInactiveUserListView && !l_view.isAzureInactiveUserListView) && parent.sdp_app.IS_SITE_CONFIGURE) {
         /* Apply select2 for Associated Sites in Technician Listview*/
         //using the sdp_select2 component, to add not associated to any site as a default option
         var site = jQuery("#sites");
         if (site.data('select2')) {
           jQuery("#sites").select2("val", ""); // No I18N
           site.data("sdp_select2").cache = {}; // No I18N
           return site;
         }
         site.sdp_select2({
           cache: {},
           multiple: false,
           placeholder: translate("sdp.admin.org.technician.allsite"), // No I18N
           allowClear: true,
           default_option: { id: "-1", text: translate("common.site.nosite") },
           url: [{
             url: "/api/v3/sites",//NO I18N
             field: 'sites',//NO I18N
             list_info: { start_index: 1, row_count: 25 }
           }]
         });
         site.on("select2-opening",function(){  //  #106723
          if(jQuery("#bulkactionsMenu").parent().hasClass("open")){ //NO I18N
            jQuery("#bulkactionsMenu").sdmenu('toggle');  //NO I18N
          }
         });
         var prefersite = jQuery("#prefersite").val();
         if (prefersite && prefersite != "null") {
           l_view.updateTechListOnSiteChange(prefersite);
         }
       }
     },
     //returns the users to be selected in the list-view when loaded
     l_view.getDefaultSelectedRecords = function () {
        var selectedRecords = {}, popupFor = l_view.popupfor;
        var isInclude = popupFor === "include_orgusers", isExclude = popupFor === "exclude_orgusers";// No I18N
        if(l_view.selectedRecords) {
          return l_view.selectedRecords;
        }
        if (isInclude || isExclude) {
           var selectedUsers = window.opener.selectedUsersSelect2Data;
           var users = isInclude ? selectedUsers.includeUsers : selectedUsers.excludeUsers;
           users.forEach(function (user) {
               selectedRecords[user.id] = user;
           });
        }
        if(l_view.apiModule === 'cabs' && l_view.apiEntity === 'members'){
        window.opener.FC_Mapper.form_cabs_form.fields.members.current_value.forEach((user)=>{selectedRecords[user.id]=user;});
        }
        if(l_view.module == "tfa") {
          window.opener.tfa.tfaLoginRulesUserBulkCurrentSelect.select2('data').forEach(function (advFilSelect2){ //NO I18N
              selectedRecords[advFilSelect2.id]={"id" : advFilSelect2.id, "name" : advFilSelect2.text, "email_id" : advFilSelect2.email_id, "profile_pic" : advFilSelect2.profile_pic}; //NO I18N
          });
        }
        return selectedRecords;
     },
     //To construct "type=user" criteria for Change As Technician Select2 in TechnicianListview.
     l_view.changeAsTechCrit = function(searchText){
        var crit_Obj = {} , critArray = [];
            crit_Obj = {
                  "field" : "type", // No I18N
                  "value" : "user", // No I18N
                  "condition" : "contains", // No I18N
                  "logical_operator" : "AND" // No I18N
              };
              if(isMSP) {
                critArray.push({ "field": "account", "condition": "is", "value": "1", "logical_operator": "AND" }); // No I18N
              }
            if(searchText){
               critArray.push({"field":"name","condition":"like","value": searchText,"logical_operator" : "AND"}); // No I18N
            }
            if(isSCP) {
              critArray.push({ "field": "operation_type", "condition": "contains", "value": "change_as_tech_suggestions", "logical_operator": "AND" }); // No I18N
            }
            if(critArray.length) {
               crit_Obj.children = critArray;
            }
            return crit_Obj;
     },
     /*Call When Assiciate Sites Select2 on change - Technician Listview */
     l_view.updateTechListOnSiteChange = function(siteId, isRecursive){
        jQuery("#refSiteSection,[data-id=refSiteSection-container]").hide();
        var selVal = ""; //NO I18N
        if(siteId && typeof siteId != "object"){
            selVal = siteId;
        }else{
          selVal = jQuery("#sites").val();

          var siteObj = {"id" :selVal}; //NO I18N
          addPersonalization("ADMIN_SITEPREFERENCE",siteObj); //NO I18N
        }
        //Check whether the selected site is a refer site.
        var referSiteDetails = sdp_app.IS_SDP ?checkReferSiteAjax(selVal, 7) : null;
        if(referSiteDetails && referSiteDetails.parentSiteStatus == "InActive"){
          selVal = "-1";
          siteId = "";
        }
        if(referSiteDetails && referSiteDetails.parentSiteStatus != "InActive") {

            var label1 = translate("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(referSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(referSiteDetails.SITEREFERNAME));
            var label2 = translate("sdp.admin.siterefer.dialog.label2").replace('{0}', encodeHTML(referSiteDetails.SITEREFERNAME)).replace('{1}',translate("sdp.common.technician"));
            var label3 = translate("sdp.admin.siterefer.dialog.label3").replace('{0}', encodeHTML(referSiteDetails.SITEREFERNAME));

            var siteReferDialog = jQuery("#site-info-dialog");
                siteReferDialog.find('#site-label1').html(label1);
                siteReferDialog.find('#site-label2').html(label2);
                siteReferDialog.find('#site-label3').html(label3);

                showDialog(siteReferDialog.html(),'title='+translate("sdp.admin.siterefer.redirect.title")+', width=500, modal=yes, position=absmiddle',function(){ //No I18N
                  jQuery('[name="close-site-info-dialog"]').off('click').on('click', function() {   //No I18N
                    closeDialog();
                  });
                });
        }else{
          //To get Site name from site id
          if(selVal && typeof siteId != "object"){
            if(selVal == "-1"){
              var siteObj = {"id" : "-1","name" : translate("common.site.nosite"), "text" : translate("common.site.nosite")}; //NO I18N
              jQuery("#sites").select2('data',siteObj); //NO I18N
              if(referSiteDetails){
				        var label1 = translate("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(referSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(referSiteDetails.SITEREFERNAME));
				        var label2 = translate("sdp.admin.siterefer.dialog.label4").replace('{0}', encodeHTML(referSiteDetails.SITEREFERNAME)).replace('{1}',translate("sdp.common.technician"));
                var siteReferDialog = jQuery("#site-info-dialog");
                siteReferDialog.find('#site-label1').html(label1);
                siteReferDialog.find('#site-label2').html(label2);
                siteReferDialog.find('#site-label3').html("");

                showDialog(siteReferDialog.html(),'title='+translate("sdp.admin.siterefer.redirect.title")+', width=500, modal=yes, position=absmiddle',function(){ //No I18N
                  jQuery('[name="close-site-info-dialog"]').off('click').on('click', function() {   //No I18N
                    closeDialog();
                  });
                });

                l_view.updateTechListOnSiteChange(siteObj,true);

                return;
              }
            }else{
              sdpAjax({
                url : "/api/v3/sites/"+selVal, //NO I18N
                success : function(resp){
                  var siteObj = {"id" : selVal,"name" : resp.site.name, "text" : resp.site.name}; //NO I18N
                  jQuery("#sites").select2('data',siteObj); //NO I18N
                },
                error: function(resp){
                  if(resp.status == 404){
                    //if the personalized site has been deleted, reset the personalization.
                    var defSiteObj = {id: "-1"}
                    addPersonalization("ADMIN_SITEPREFERENCE", defSiteObj); //NO I18N
                    l_view.updateTechListOnSiteChange("-1");
                  }
                }
              });
            }
          }
        }
        if(typeof siteId == "object" && !isRecursive){
          siteId = ""; //NO I18N
        }
        l_view.techReferSiteChange(referSiteDetails,siteId);
     },
      l_view.techReferSiteChange = function(referSiteDetails,siteId){
        if(referSiteDetails) {
            var newSiteID = referSiteDetails.SITEREFERID, referSiteName = encodeHTML(referSiteDetails.SITEREFERNAME);
            if(newSiteID == -1){
                referSiteName = translate('sdp.admin.technician.addtechnician.nosite');//NO I18N
            }
            var msg1 = translate("sdp.admin.siterefer.dialog.label1").replace('{0}', encodeHTML(referSiteDetails.CHOOSENSITENAME)).replace('{1}',encodeHTML(referSiteDetails.SITEREFERNAME));
            jQuery("#refer-msg").html(msg1);
            jQuery("#refSiteSection,[data-id=refSiteSection-container]").show();
            var siteObj = {"id" : newSiteID,"name" : referSiteName, "text" : referSiteName}; //NO I18N
            jQuery("#sites").select2('data',siteObj); //NO I18N
        }
        //When by default loading TechListview, we dont need to refresh Listview
        if(!siteId){
          table_tech.changeFilterString("defaultSearch"); //NO I18N
        }
     },
     /*Listview refresh for Users and Technicians*/
     l_view.refreshTechnicianListview = function(type,ele){
        var search_Obj = table_tech.t_obj.table_info.list_info.search_criteria, popupFor = l_view.popupfor;
        if(type == "alphasearch"){
           //Trigger When alphabets search under Users Listview
           jQuery(".pagination li").find('a').attr('class',"btn btn-default");
           jQuery(ele).attr('class',"btn btn-secondary bg-light");
           jQuery("#searchUser").val("");
           jQuery(".inputclear-icon").hide();
           table_tech.changeFilterString("defaultSearch"); // No I18N
           return false;
        }else if(type == "tableSearch"){ // No I18N
            jQuery("#searchUser").val("");
            jQuery(".inputclear-icon").hide();
            var critChildArray = [], crit_Obj = {};
            if(isMSP && !userList.isUser) {
              var searchCriteria = userList.getSearchCriteria("active"); // No I18N
              if (searchCriteria) {
                crit_Obj = searchCriteria;
                if (searchCriteria.hasOwnProperty("children")) {
                  critChildArray = searchCriteria.children.concat(critChildArray);
                }
              }
            } else if(l_view.entity_name === "users" || l_view.entity_name === "orgusers"){// No I18N
                //Trigger When apply Deleted Users filter under Users Listview
                if(l_view.isInactiveUserListView === true){
                  if(forwardfrom == "ESM"){  // No I18N
                    crit_Obj = {"field" :"org_user_status","value": "RESIGNED","condition":"is"}; // No I18N
                  }else{
                    crit_Obj = {"field" :"status","value": "RESIGNED","condition":"is"}; // No I18N
                  }
                }else if(l_view.isADInactiveUserListView){
                  crit_Obj = {"field" :"is_in_ad","value": "false","condition":"is"}; // No I18N
                  if(l_view.domainid && l_view.domainid != "null"){ // No I18N
                    critChildArray.push({
                        "field" : "domain.id", // No I18N
                        "value" : l_view.domainid, // No I18N
                        "condition" : "is", // No I18N
                        "logical_operator" : "AND" // No I18N
                    });
                  }
                }else if(l_view.isAzureInactiveUserListView){
                                   crit_Obj = {"field" :"is_in_azure","value": "false","condition":"is"}; // No I18N
                                   if(l_view.domainid && l_view.domainid != "null"){ // No I18N
                                     critChildArray.push({
                                         "field" : "domain.id", // No I18N
                                         "value" : l_view.domainid, // No I18N
                                         "condition" : "is", // No I18N
                                         "logical_operator" : "AND" // No I18N
                                     });
                                   }
                                 } else if (userList.appliedFilter) {
                    var searchCriteria = userList.getSearchCriteria(userList.appliedFilter);
                    if(searchCriteria) {
                      crit_Obj = searchCriteria;
                      if (searchCriteria.hasOwnProperty("children")) {
                        critChildArray = searchCriteria.children.concat(critChildArray);
                      }
                    }
                }

                if (isSCP && popupFor === "associate_acc_contacts") {
                  crit_Obj = l_view.getSearchCriteria(popupFor);
                } else if (isSCP && l_view.fromAcc) {
                  crit_Obj = l_view.getSearchCriteria("fromAcc");// No I18N
              } else if(l_view.isSearchuserPopup == true && l_view.isUser){
                if (isSCP && userList.isImportReps) {
                    crit_Obj = l_view.getSearchCriteria("include_support_reps");// No I18N
                } else if (popupFor === "verify_users") {// No I18N
                  crit_Obj = {
                    "field": "operation_type",// No I18N
                    "condition": "contains",// No I18N
                    "values": [// No I18N
                      "user_list_for_acknowledge"// No I18N
                    ],
                    "logical_operator": "AND" // No I18N
                  }
                } else if(parent.sdp_app.INCLUDE_TECH_AS_REQUESTER  != undefined && (!isSCP || !userList.appliedFilter) && parent.sdp_app.INCLUDE_TECH_AS_REQUESTER == false && l_view.popupfor !== "include_orgusers" && l_view.popupfor !== "exclude_orgusers"){ //No I18N
                  crit_Obj = {
                      "field" : "type", // No I18N
                      "value" : "user", // No I18N
                      "condition" : "is", // No I18N
                      "logical_operator" : "AND" // No I18N
                  };
                } else if (l_view.module == "tfa") { // No I18N
                  crit_Obj = l_view.getSearchCriteria("with_login"); // No I18N
                }
              }
              /*Alphabets search criteria constructs starts*/
              var startWithStr = "ALL"; // No I18N
              var alEle = jQuery(".pagination li").find('a.btn-secondary');
              if(alEle.length > 0) {
                startWithStr = alEle.html();
              }
              if(startWithStr != "ALL"){
                if(jQuery.isEmptyObject(crit_Obj)){
                  crit_Obj = { "field" : "name", "value" : startWithStr,"condition" : "starts with"}; // No I18N
                }else{
                  critChildArray.push({ "field" : "name", "value" : startWithStr,"condition" : "starts with","logical_operator" : "AND"}); // No I18N
                }
              }
              /*Alphabets search criteria constructs Ends*/
            }
             if(l_view.module !="chat"){
            if(l_view.entity_name !== "users" && l_view.entity_name !== "orgusers"){// No I18N
              //Trigger When Associated Sites search under Technicians Listview
               var siteId = jQuery("#sites").val();
               if(l_view.isADInactiveUserListView){
                  crit_Obj = {"field" :"is_in_ad","value": "false","condition":"is"}; // No I18N
               }else if(l_view.isAzureInactiveUserListView){
                  crit_Obj = {"field" :"is_in_azure","value": "false","condition":"is"}; // No I18N
               }else if(siteId != ""){
                  crit_Obj = {"field": "associated_sites","value": siteId,"condition": "is"}; // No I18N
               }
             }
            }

              var isCObjEmpty = jQuery.isEmptyObject(crit_Obj);

              var inlineSearchCriteria = table_tech.t_obj.table_info.list_info.search_criteria;

              if(inlineSearchCriteria) {
                if(inlineSearchCriteria.children) {
                  critChildArray = critChildArray.concat(inlineSearchCriteria.children);
                  delete inlineSearchCriteria.children;
                }
                if(isCObjEmpty) {
                  crit_Obj = inlineSearchCriteria;
                } else if(inlineSearchCriteria) {
                  critChildArray.push(inlineSearchCriteria);
                }
              }

              if(isCObjEmpty){
                delete table_tech.t_obj.table_info.list_info.search_criteria;
              }
              if(popupFor === "associate_acc_contacts") {
                 crit_Obj.children = crit_Obj.children.concat(critChildArray);
              } else if(critChildArray.length > 0){
                crit_Obj.children = critChildArray;
              }
              if(!jQuery.isEmptyObject(crit_Obj)){
                table_tech.t_obj.table_info.list_info.search_criteria = crit_Obj;
              }
          }
        table_tech.refreshTable('search'); // No I18N
     },
     //remove a field from search_criteria.children
     l_view.removeFieldCriteriaChildren = function(field) {
       var listInfo = table_tech.t_obj.table_info.list_info;
       var searchCriteria = listInfo.search_criteria;
       var children = searchCriteria.children;
       if(Array.isArray(children)) {
         children.forEach(function (criteria, index) {
           if (criteria.field === field) {
             children.splice(index, 1);
           }
         });
       }
     },
     //set selected account id either in search field or in search criteria
     //if search criteria found, account filter will be added in criteria otherwise in search fields
     l_view.refreshMspList = function() {
        userList.mspAccountId = jQuery("#__persistentAccountId__select").select2("val"); // No I18N
        !userList.isUser && l_view.initSiteFilter();
        if (isMSP) {
          var url = userList.getTableObject().t_obj.options.callbackURL;
          url = url.replace(/persistentAccountId=[1-9]+/, "persistentAccountId=" + userList.mspAccountId);
          if (url.indexOf("persistentAccountId") === -1) {
            userList.getTableObject().t_obj.options.callbackURL += (url.indexOf("?") > -1 ? "&" : "?") + "persistentAccountId=" + userList.mspAccountId;
          } else {
            userList.getTableObject().t_obj.options.callbackURL = url;
          }
        }
		table_tech.refreshTable("refresh"); // No I18N
        l_view.toggleAssignDepartmentAction();
     },
      l_view.toggleAssignDepartmentAction = function() {
       var isAllAccount = jQuery("#__persistentAccountId__select").select2("val") === "0";// No I18N
       jQuery("#associate_departments").parent("li").toggle(!isAllAccount);// No I18N
      },
      l_view.addPointOfContact = function(id) {
         l_view.updateMspAssociatedRoles("users/" + id, [{ "name": "SDPointOfContact" }]);// No I18N
      },
      l_view.addAccountManagers = function() {
        var ids = l_view.getSelectedIds();
       userList.fetchAssociatedRoles(false);
       var roleMap = userList.associated_roles_data.roleMap;
        var roles = [{
          id: roleMap["SDAccountManager"]
        }];

       jQuery(permissionsForm).find("input[type=checkbox]:checked").each(function (index, element) {
         var names = element.value.split(",");

         names.forEach(function (name) {
           roles.push({ id: roleMap[name] });
         });
       });

       l_view.updateMspAssociatedRoles('users?ids=' + ids, roles);// No I18N
      },
      l_view.updateMspAssociatedRoles = function (url, roles) {
       var data = {
         user: {
           associated_roles: roles,
           requester_allowed_to_view: "3"
         }
       };

        sdpAjax({
         url: '/api/v3/' + url, // No I18N
          data: sdpAjaxInputData(data),
          type: "PUT",// No I18N
          success: function () {
           if (window .opener.getUrlParameterByName("forwardTo") !== "orgdetails") {
                window.opener.location.reload();
           }
            window.close();
          }
        });
      },
     /*Triggers when table content refresh*/
     l_view.callbackTableRender = function(){
          var popupFor = l_view.popupfor;
          if(l_view.module != "WorkOrder_EMailCC" &&l_view.module!="cab" && l_view.module != "UserGroups" && l_view.module != "Maintenance_EMailCC" && l_view.module !="tfa"){
            jQuery("#"+table_tech.tableId+"_body").find('input[type=checkbox][value="'+sdp_user.LOGGEDIN_USERID+'"]').remove();
          }
          jQ("[id^='userlink']").on("click",function(event){ // No I18N
            event.preventDefault();
          });

          if (l_view.module =="tfa" || popupFor === "verify_users" || popupFor === "exclude_orgusers" || popupFor === "include_orgusers" || isMSP && l_view.module === "merge_unknown_users") {
            jQuery("#addnewuser").hide();
          }
          if(isMSP) {
            l_view.toggleAssignDepartmentAction();
            if(!l_view.isUser) {
              var mspAccountElement = jQuery("#__persistentAccountId__select");
              mspAccountElement = mspAccountElement.length ? mspAccountElement : window.opener.jQuery("#__persistentAccountId__select");

              //show add new technician button only if logged in technician is associated with "My org Inc" account.
              if (mspAccountElement.find("option[value=" + userList.mspMyOrgAccountId + "]").length) {
                jQuery("#technician_add").show();
              }
            }
          }
     },
     /* Triggers when Users Listview filter applied */
     l_view.changeUserFilter = function(arg){
        l_view.isInactiveUserListView = false;
        l_view.isADInactiveUserListView =  false;
        var userViewStr = null;
        l_view.doPush = true;
        if(arg == "inactive"){ //No I18N
          userViewStr = "deletedUsers"; //No I18N
          l_view.isInactiveUserListView = true;
          jQuery("[name='searchText']").val("");
        }else if(arg == "adinactive"){ //No I18N
          l_view.isADInactiveUserListView = true;
        }
       if (userList.appliedFilter) {
            var searchCriteria = l_view.getSearchCriteria(arg);
            l_view.filterSearchCriteria = searchCriteria;
            l_view.appliedFilter = arg;
        }
        if(isMSP) {
          userList.mspAccountId = jQuery("#__persistentAccountId__select").val();
        }
        l_view.redirectTo("list", l_view.isUser, null,userViewStr); //No I18N
     },
     l_view.getSearchCriteria = function(value, from) {
        var searchCriteria = null;

        switch(value) {
            case "associate_acc_contacts":// No I18N
                var data = window.opener.userList;
                var isSubAcc = data.subaccId !== undefined;

                searchCriteria = {
            field: isSubAcc ? "subaccount" : "account", // No I18N
                    value: isSubAcc ? data.subaccId  : data.accId,
                    condition: "is not" // No I18N
                };
                break;
            case "fromAcc":// No I18N
                var isSubAcc = userList.subaccId !== undefined;

                searchCriteria = {
                field: isSubAcc ? "subaccount" : "account", // No I18N
                    value:  isSubAcc ? userList.subaccId  : userList.accId,
                    condition: "is"// No I18N
                };
                break;
            case "include_support_reps":// No I18N
                searchCriteria = {
                    field: "operation_type",// No I18N
                    condition: 'is',// No I18N
                    value: "technician_suggestions" // No I18N
                };
                break;
            case "active":// No I18N
                searchCriteria = {
                  field: "org_user_status", // No I18N
                  value: "ACTIVE", // No I18N
                  condition: "is" // No I18N
                };
                break;
            case "unapproved":// No I18N
                searchCriteria  = {
                    field: "operation_type",// No I18N
                    value: "UNAPPROVED",// No I18N
                    condition: "is"// No I18N
                };
                break;
            case "registered":// No I18N
                searchCriteria = {
                    field: "operation_type",// No I18N
                    value: "Registered",// No I18N
                    condition: "is"// No I18N
                };
                break;
            case "primary":// No I18N
                searchCriteria =  {
                    field: "requester_allowed_to_view",// No I18N
                    value: "3",// No I18N
                    condition: "is"// No I18N
                };
                break;
            case "no_accounts":// No I18N
                searchCriteria = {
                    field: "account",// No I18N
                    condition: "is",// No I18N
                    value: null
                };
                break;
            case "requesters":// No I18N
              searchCriteria = {
                  "field": "type", // No I18N
                  "value": "user", // No I18N
                  "condition": "contains", // No I18N
                  "logical_operator": "AND" // No I18N
                }
                break;
              case "with_login": // No I18N
              searchCriteria = {
                    "field": "login_name",// No I18N
                    "value": null, // No I18N
                    "condition": "is not",// No I18N
                    "logical_operator": "AND" // No I18N
                  }
                break;
          case "associate_account_managers":// No I18N
              searchCriteria = {
                "field": "associated_roles",// No I18N
                "value": userList.associated_roles_data.roleMap.SDAccountManager, // No I18N
                "condition": "not in",// No I18N
                "logical_operator": "AND", // No I18N
              }
              break;
          case "associate_point_of_contact":// No I18N
              searchCriteria = {
                "field": "associated_roles",// No I18N
                "value": userList.associated_roles_data.roleMap.SDPointOfContact, // No I18N
                "condition": "not in",// No I18N
                "logical_operator": "AND", // No I18N
                    }
                break;
          case "my_org" : // No I18N
              searchCriteria = {
                "field": "account",// No I18N
                "value": sdp_app.ORG_ACC_ID, // No I18N
                "condition": "is",// No I18N
                "logical_operator": "AND", // No I18N
                    }
                break;
        }

       if (isMSP && (getUrlParameterByName("forwardTo") === "requester" || l_view.module === "merge_unknown_users") && value !== "requesters" && searchCriteria && !jQuery("#searchUser").val()) {
         searchCriteria.children = [l_view.getSearchCriteria("requesters")];
       }

       if (from !==  "additional_criteria") {
         l_view.addAdditionalCriteria(searchCriteria);
       }

        if (searchCriteria) {
            searchCriteria.logical_operator = "AND";// No I18N
        }

        if(value === "associate_acc_contacts" && searchCriteria) {
            searchCriteria.children = [ l_view.getSearchCriteria("active") ];
        }

        return searchCriteria;
     },
     l_view.addAdditionalCriteria = function(searchCriteria) {
       var children;

       if (!searchCriteria) return null;

       children = searchCriteria.children ? searchCriteria.children : [];

       function getSearchCriteria() {
         var args = Object.values(arguments);
         args.push("additional_criteria");
         return   l_view.getSearchCriteria.apply(this, args);
       }

       if (isMSP && (userList.appliedFilter === "associate_point_of_contact" || userList.appliedFilter === "associate_account_managers")) {
         children.push(getSearchCriteria("with_login"));
         children.push(getSearchCriteria("requesters"));
       } else if (isMSP && (getUrlParameterByName("forwardTo") === "requester" || l_view.module === "merge_unknown_users") && jQuery("#searchUser").val()) {// No I18N
         children.push(getSearchCriteria("requesters"));
       }

       if (children && children.length) {
         searchCriteria.children = children;
       }

       return searchCriteria;
     },
    l_view.markAsSpam = function () {
       var ids = l_view.getSelectedIds();
       if (ids.length === 0) {
         return false;
       }
       var successCallBack = function(response) {
        showalert('success', translate("sdp.spam.success"), "isAutoHide=true"); // No I18N
        table_tech.refreshTable("refresh"); // No I18N
       }
       l_view.markUserAsSpan(ids, successCallBack)
    },
    l_view.markUserAsSpan = function (ids, successCallBack) {
      if (ids.length === 0) {
        return false;
      }
      sdpAjax({
        url: "api/v3/users/move_to_spam?ids=" + ids, // No I18N
        type: "DELETE", // No I18N
        success: function (response) {
          if(successCallBack) {
            successCallBack(response);
          }
        }
      });
    },
    l_view.rejectUser = function () {
       var ids = l_view.getSelectedIds();
       if (ids.length === 0) {
         return false;
       }
       var successCallBack = function(response) {
        showalert('success', translate("sdp.reject.success"), "isAutoHide=true"); // No I18N
        table_tech.refreshTable("refresh"); // No I18N
       }
       l_view.rejectUserAction(ids, successCallBack)
    },
    l_view.rejectUserAction = function (ids, successCallBack) {
      if (ids.length === 0) {
        return false;
      }
      sdpAjax({
        url: "/api/v3/users?ids=" + ids, // No I18N
        type: "DELETE", // No I18N
        success: function (response) {
          if(successCallBack) {
            successCallBack(response);
          }
        }
      });
    },
    l_view.approve = function (operation) {
      var ids = l_view.getSelectedIds();
      if(ids.length === 0) {
        return false;
      }
      sdpAjax({
          url: "/api/v3/users/approve?ids=" + ids, // No I18N
          type: "put", // No I18N
          data: sdpAjaxInputData({
            approve: {
              operation: operation
            }
          }),
          success: function (response) {
            var msg = operation === "approve" ? "scp.enable.login.succmsg" : "scp.approve.contacts.success"; // No I18N
            showalert('success', translate(msg), "isAutoHide=true"); // No I18N
          },
          complete: function() {
            table_tech.refreshTable("refresh"); // No I18N
          }
        });
    },
    l_view.approveMspUsers = function (ids, departmentId, successCallBack) {
      if (ids.length === 0) {
        return false;
      }
      sdpAjax({
        url: "/api/v3/users/approve?ids=" + ids, // No I18N
        type: "put", // No I18N
        data: sdpAjaxInputData({
          approve: {
            operation: "enable_login"// No I18N
          },
          department: {
            id: departmentId
          }
        }),
        success: function (response) {
          if(successCallBack){
            successCallBack(response);
          }
        },
      });
    },
    l_view.dissociateFromPortal = function(ids) {
        var url = "/dissociate_from_instance?ids=" + ids.toString();// No I18N

         url = (userList.isUser ? "users" : "technicians") + url;// No I18N
         sdpAjax({
             url: "/api/v3/" + url,// No I18N
             type: "delete",// No I18N
             success: function() {
                 showalert('success', translate("sdp.admin.orgrole.messages.success.delete"), "isAutoHide=true"); // No I18N
                 table_tech.refreshTable("refresh");// No I18N
             }
         });
    },
     l_view.getUserIDsToDissociate = function(ids, idsToDelete) {
         var idsToDeleteMap = {};
         idsToDelete.forEach(function (id) {
             idsToDeleteMap[id] = true;
         });
         return ids.filter(function (id) {
             return !idsToDeleteMap.hasOwnProperty(id);
         });
     },
     l_view.dissociateUsersFromPortal = function() {
         var moduleText = userList.isUser ? translate("sdp.commom.contact") : translate("sdp.admin.leftpanel.users.technician");
         var ids = l_view.getSelectedIds();
         if(l_view.user_get[0].enable_user_deletion_popup !== "true") {
            l_view.dissociateFromPortal(ids);
         } else {
             sdpAjax({
                 url: "/UserAPISupportAction.do?method=getUserListExistOnlyinOnePortal&ids=" + ids,// No I18N
                 success: function (response) {
                     var idsToDelete = response.user_id;
                     var idsToDissociate = l_view.getUserIDsToDissociate(ids, idsToDelete);
                     if(idsToDelete.length) {
                         l_view.idsToDissociate = idsToDissociate;
                         l_view.idsToDelete = idsToDelete;
                         callAjaxRequest('/servlet/PIIServlet', 'action=getGDPRSettings&subAction=fetchAnonymousNameMapping&isUserId=true&userList=' + idsToDelete.toString(), "userDeleteHandler");
                     } else {
                         var c = confirm(translate("sdp.admin.common.deleteconfmess", [moduleText]));
                         if(c) {
                             return l_view.dissociateFromPortal(idsToDissociate);
                         }
                     }
                 }
             });
         }
     },
     l_view.dissociateAccount = function() {
         sdpAjax({
             url: "/api/v3/users?ids=" + userList.getTableObject().bulkSelect.getSelectedIDs().toString(),// No I18N
             type: "put",// No I18N
             data: sdpAjaxInputData({ user:{ account:null, requester_allowed_to_view:0 } }),
             success: function() {
                 showalert('success', translate("scp.dissociated.account.succmsg"), "isAutoHide=true"); // No I18N
                 table_tech.refreshTable("refresh");// No I18N
             }
         });
     },
     l_view.openUsersPopup = function(popupfor, args) {
         args = args || "";
         NewWindow('/setup/UsersPopup.jsp?popupfor=' + popupfor + '&isUser=true&module=import_user' + args,'mydetails','1100','750','yes','center');
     },
     /* Triggers when Users Listview Global search is applied ,
        we need to construct search_criteria object based on all the available search fields in metainfo*/
     l_view.getGlobalSearchList = function(meta_info,event){
      var searchText = jQuery("#searchUser").val(), popupFor = l_view.popupfor;
        if(searchText != ""){
          jQuery('.inputclear-icon').show();
          searchText = trim(searchText);
        }else{
          jQuery('.inputclear-icon').hide();
        }
        if(searchText == "" || (searchText != "" && meta_info) || event.keyCode == 13) {
          var fromTableComp = false;
          if(meta_info){
            fromTableComp = true;
          }else{
            meta_info =  jQ.extend(true, {}, table_tech.t_obj.meta_info);
         }
         if(isSCP) {
           delete meta_info.department;
         }
         var globalSearchMetaInfo;
         if(forwardfrom !== "ESM") {
            globalSearchMetaInfo = l_view.global_search_meta_info.fields;
         }
         var criteria = {};
        if (isMSPOrSCP && userList.appliedFilter) {
          criteria = userList.getSearchCriteria(userList.appliedFilter, "additional_criteria");// No I18N
        } else if(isSCP) {
             if (popupFor === "associate_acc_contacts") {// No I18N
              criteria = l_view.getSearchCriteria(popupFor);
            } else if(l_view.fromAcc) {
             criteria = l_view.getSearchCriteria("fromAcc");// No I18N
            } else if(userList.isImportReps) {// No I18N
             criteria = l_view.getSearchCriteria("include_support_reps");// No I18N
            }
         } else if(popupFor === "verify_users") { // No I18N
             criteria = {
                 "field": "operation_type",// No I18N
                 "condition": "is",// No I18N
                 "values": ["user_list_for_acknowledge"]// No I18N
             }
         } else if (l_view.module == "tfa") { // No I18N
              criteria = l_view.getSearchCriteria("with_login"); // No I18N
          }
         if(searchText != ""){
             if(jQuery.isEmptyObject(criteria)) {
                 criteria = {"field": "name", "condition": "contains", "value": searchText}; // No I18N
                 delete meta_info.name;
             }
                var childArray = [];
            for(var key in meta_info) {
              var valueObj = meta_info[key];
              var fieldType = valueObj.type;
              if(globalSearchMetaInfo && !globalSearchMetaInfo.hasOwnProperty(key)) {
                continue;
              }

              var isNumericField = fieldType === "long" || fieldType === "double"; // No I18N
              //SD- 81934 --> Removing project roles from search list
              if ((isNumericField && !jQuery.isNumeric(searchText) ) || key === 'project_roles' || (!valueObj.is_inmeta || valueObj.is_inmeta == false)){
                continue;
              }
              //Below changes done by salamon due to the key disableSearching removed from metainfo
              if( !(valueObj.disableSearching || valueObj.searchable == false) && valueObj.type != "checkbox"  && valueObj.type != "icon" && valueObj.type != "datetime" && valueObj.type != "boolean"){
                    if(valueObj.lookup_entity){
                       key = key+"."+valueObj.lookup_field;
                    }else if(valueObj.value_path){
                      key = valueObj.value_path;
                    }
                  var condition = isNumericField ? "eq" : "contains"; // No I18N
                  childArray.push({ "field": key, "condition": condition ,"value" : searchText, "logical_operator" :"OR"});
                }
            }
           if (isMSP || isSCP && (userList.isImportReps || userList.appliedFilter || popupFor === "associate_acc_contacts" || l_view.fromAcc) || ((l_view.popupfor === "verify_users" || l_view.module == "tfa") && childArray.length > 0)) {
                childArray[0].logical_operator = "AND";
            }
                        if(childArray.length > 0) {

           if (criteria.children) {
                criteria.children = criteria.children.concat(childArray);
            } else {
            if(childArray.length > 0) {
                criteria.children = childArray;
              }
          }
           }
          }

          l_view.addAdditionalCriteria(criteria);

          if(table_tech.t_obj){
            delete table_tech.t_obj.table_info.list_info.search_fields;
            table_tech.changeFilterString("clearOnly"); //NO I18N
          }
          if(fromTableComp){
            return criteria;
          }else{
            if (!userList.appliedFilter && ((isSCP && (popupFor !== "associate_acc_contacts" && !l_view.fromAcc && !userList.isImportReps) && popupFor !== "verify_users" && searchText == "") || (!isSCP && popupFor !== "verify_users" && searchText == "" && l_view.module != "tfa"))) { // No I18N
              delete table_tech.t_obj.table_info.list_info.search_criteria;
            }else{
              table_tech.t_obj.table_info.list_info.search_criteria = criteria;
            }
            table_tech.refreshTable("search"); // No I18N
          }
        }
     },
     /*Triggerring as callback when all the Actions completed under UserList view*/
     l_view.refreshUserTable = function(){
        table_tech.refreshTable("refresh"); // No I18N
     },
       l_view.setTableObject = function (tableObject) {
        table_tech = tableObject;
       }
      l_view.getTableObject = function() {
        return table_tech;
      },
     /*Getting Users/Technicians ids/CIID from Listview as it is checkboxes checked*/
     l_view.selectedTech = function(message, needId){
         var techIds, selectedRecords, selectedIDs, tableId;
         if(needId) {
             //to get selected users id.
             selectedIDs = table_tech.bulkSelect.getSelectedIDs();
             techIds = selectedIDs;
         } else {
             //to get users ccid
             selectedRecords = table_tech.bulkSelect.selectedRecords;
             techIds = [];
             for(var id in selectedRecords) {
                 techIds.push(selectedRecords[id].ciid);
             }
         }
         if (techIds.length == 0) {
             alert(translate(message));
         }
         return techIds;
     },
     /*Triggers , when delete Users/ Technicians from Listview*/
     l_view.deleteTechnician = function(arg, ids, anonymousMap,fromTechPortalPopup){
      if(fromTechPortalPopup != true && ((isMDHSetup == "true" && (userList.isADInactiveUserListView || userList.isAzureInactiveUserListView)) || (forwardfrom == "ESM" && arg != "USER_ANONYMIZATION" && arg != "deletefromanonymize"))){
        l_view.getTechnicianForPortals(arg, ids, anonymousMap);
        return;
      }
      if(l_view.user_get[0].enable_user_deletion_popup == "true" && arg != "deletefromanonymize"){ // No I18N
        l_view.handleUserDelete(arg,ids);
      }else if(arg === "adinactiveUsers" || arg === "azureinactiveUsers" || arg == "deletefromanonymize"){ // No I18N
        ids = jQuery("#userID").val();
        if(isSCP && l_view.idsToDelete) {
            ids = l_view.idsToDelete;
        }
        if(!ids){
          ids = l_view.selectedTech("sdp.admin.projectrole.selectuser",true); // No I18N
        }
        if(ids.length > 0){
          l_view.deleteADDeletedUser(ids, anonymousMap);
        }
      }else{
        table_tech.deleteRecords();
      }
     },
     l_view.enableUserActions = function(){
      jQuery('#bulk_change_as_tech').on('click', function(e) { e.stopPropagation(); });
      //Site Admin cannot do "Assign Department and Mark As VIP user" to Technicians
      if(sdp_user.ROLES.indexOf("SDSiteAdmin") != -1){
        var isTechAvailable = false;
        var techIds = jQuery("#users_body input[type='checkbox']:checked").map(function(){
          if(jQuery(this).attr('data-istechnician') == "true"){
              isTechAvailable = true;
          }
        });
        if(isTechAvailable){
           jQuery("#bulkactionsMenu").next().find(".disableForSiteAdmin").each(function(i, e){
              jQuery(this).removeAttr("href").attr("title", translate("user.sdsiteadmin.action")).parents('li').addClass("disabled"); // No I18N
           });
        }else{
           jQuery("#bulkactionsMenu").next().find(".disableForSiteAdmin").each(function(i, e){
              jQuery(this).attr({"href": jQuery(this).attr("data-href"),"title" : jQuery(this).attr("data-title")}).parents('li').removeAttr("class"); // No I18N
           });
        }
      }
     },
     l_view.getTechnicianForPortals = function(arg, ids, anonymousMap){
       var ids = l_view.selectedTech("sdp.admin.projectrole.selectuser",true); // No I18N
       if(ids.length >0){
         sdpAjax({
            url : "/UserAPISupportAction.do?method=getPortalTechnicianHelpdeskDetails&userIDs="+ids, // No I18N
            success : function(user_data){
              if(user_data.user_details.length > 0){
                l_view.portalTechHTML = renderhbs(null, 'portal-technician-delete-confirm', user_data, false, 'users', null, true, null, true); // No I18N
              }else{
                l_view.portalTechHTML = null;
              }
              if(l_view.user_get[0].enable_user_deletion_popup != "true" && l_view.portalTechHTML){
                  showDialog(l_view.portalTechHTML, "top=100, left=10,width=500, title="+translate("sdp.admin.technician.deletetechnician")+",position=absmiddle,modal=yes", btnEvent);     //NO I18N
                  $sdEventListener("#_DIALOG_CONTENT"); // No I18N
                  function btnEvent(){
                    jQuery("#techPortalBtn").on('click',function(){
                      l_view.deleteTechnician(arg, ids, anonymousMap, true);
                      closeDialog();
                    });
                  }
              }else{
                l_view.deleteTechnician(arg, ids, anonymousMap, true);
              }
            }
          });
       }
     },
     l_view.deleteADDeletedUser = function(ids, anonymousMap){
        var method = "GET"; // No I18N
        if(isSCP || isMSP){
        	method = "POST"; // No I18N
        }
        if(anonymousMap && jQuery("[id*='_DIALOG_LAYER']").find("#isAnonymizeUser").val() == "true"){// No I18N
          var user_ids = ""; // No I18N
          for (var i = 0; i < ids.length; i++) {
            user_ids += "&user_ids="+ids[i];// No I18N
          }
          method="POST";    //NO I18N
          url = "/UserAPISupportAction.do?method=handlePIIForDeletedUsers&anonymous_user_map="+encodeURIComponent(sdpToJSON(anonymousMap))+(user_ids); // No I18N
        }else{
          var dataVal = {};
          if(anonymousMap){
            dataVal  = sdpAjaxInputData(anonymousMap);
          }
          method = "DELETE"; // No I18N
          url = "/api/v3/"+l_view.entity_name+"?ids="+ids;// No I18N
        }
        jQuery('#' + table_tech.tableId + '_body').html("<div style='background:#000;opacity:0.05;z-index:10;height:"+table_tech.t_obj.options.height+"px;width:100%;' class='pos-abs'></div>"+ajaxBar()); // No I18N
        table_tech.t_obj.options.row_inputdata.list_info.start_index = 1;
        //for account manager, deleting from all portals once anonymize done, unlike contacts/support reps who are dissociated/removed from current portal alone when exits in more than 1 portal.
        var dissociateFromPortal = !userList.isAccountManager && isSCP && forwardfrom !== "ESM";// No I18N
        sdpAjax({
          url : url, // No I18N
          method : method, // No I18N
          data : dataVal,
          success : function(resp){
            if (dissociateFromPortal || userList.isAccountManager) {
                if(l_view.idsToDissociate && l_view.idsToDissociate.length) {
                    return l_view.dissociateFromPortal(l_view.idsToDissociate);
                }
                showalert('success', translate("sdp.admin.orgrole.messages.success.delete"), "isAutoHide=true"); // No I18N
            } else {
            if(anonymousMap && resp && resp.message){
              showalert("success",e_html(resp.message), "isAutoHide=true"); // No I18N
            }else{
                  var moduleText = isSCP && forwardfrom === "ESM" ? translate("sdp.admin.leftpanel.users.technician") : translate("sdp.helpdesk.common.user");//NO I18N
                  showalert("success",translate("sdp.admin.common.delete.success",[moduleText]), "isAutoHide=true"); // No I18N
            }
            }

            table_tech.refreshTable("refresh"); // No I18N
          },
          error : function(){
            if(dissociateFromPortal && l_view.idsToDissociate.length) {
              return l_view.dissociateFromPortal(l_view.idsToDissociate);
            }
            table_tech.refreshTable("refresh"); // No I18N
          }
        });
     },
     /*** Technicain actions Starts ****/
     //Method for Change as User
     l_view.confirmRequesterMovement = function(){
      var techIds = l_view.selectedTech("users.move.techtoreq", true); // No I18N
      if(techIds.length > 0){

          var c = confirm(translate("sdp.admin.technician.movetechnicianasrequester.confirm")); //No I18N
          if (c) {
            sdpAjax({
              url : "/api/v3/technicians/_change_as_user?ids="+techIds, // No I18N
              type: 'PUT', //No I18N
              success: function(obj) {
                showalert("success",translate("sdp.admin.technician.movetechnicianasrequester.success"), "isAutoHide=true"); // No I18N
                table_tech.t_obj.options.row_inputdata.list_info.start_index = 1;
              },
              complete: function () {
                table_tech.bulkSelect.resetSelectedRecords();
                table_tech.refreshTable("refresh"); // No I18N
              },
              async: false
            });
          }
      }
    },
    //Method for Assign Project Roles
     l_view.BulkProjRoleAssign = function(URL,features){
        var techIds = l_view.selectedTech("sdp.admin.projectrole.selectuser",true); //No I18N
        if(techIds.length > 0){
          var params = "module=projectRoleBulkAssociate"; // No I18N
              //below code is to append the correct parameter seperator(?/&). Because sdp-msp is appending param in url
              params = (URL.split('?')[1] ? '&':'?') + params;// No I18N
              for(var i=0;i<techIds.length;i++){
                params += "&user_ids="+techIds[i]; // No I18N
              }
              showURLInDialog(URL+params,features);
        }
      },
      //Method for Association of departments
      l_view.associateUserToDept = function(additionalParams){
          var techIds = l_view.selectedTech("sdp.admin.projectrole.selectuser",true); // No I18N
          if(techIds.length > 0){
            var params = "requesterView=requesterView"; // No I18N
                for(var i=0;i<techIds.length;i++){
                    params = params +"&tech_Id="+techIds[i]; // I18N
                }
            // Cache issue in IE
            params = params + "&tm="+encodeURIComponent(new Date().getTime());  // No i18n
            showURLInDialog('/setup/RequesterListActions.jsp?'+params,'closeButton=yes,method=GET,width=350,title=' + translate("sdp.admin.requesters.assigntodepartment")); // No I18N
          }
      },
      l_view.modifyCIType = function(){
        showURLInDialog('ChangeType.do?mode=openForm&isgroup=true&isFromCMDB=true&ciTypeId='+jQuery("#ciTypeId").val()+"&fromUser=true",'closeButton=no,width=400,height=340');//No I18N
      },
      l_view.userBulkUpdate = function(isTechinician){
             var techIds = l_view.selectedTech(translate("no.user.selected"),true); // No I18N
          if(techIds.length > 0){
              //opens bulk update window.
              NewWindow('/setup/UsersPopup.jsp?isUser=' + l_view.isUser  + '&viewType=add&popupfor=bulkupdate','userdetails','1100','700','yes','center');
          }
      },
    /* User Listview bulk association*/
    l_view.userBulkAssociation = function(association){
      var userIds = l_view.selectedTech("sdp.admin.projectrole.selectuser", true); // No I18N
      if(userIds.length > 0){
            var messgeKey = "", inObj = {}, upObj = {}, addUrlStr = ""; // No I18N
            var apientity_name = (forwardfrom == "ESM") ? "orguser" : "user"; // No I18N
            if( association == 'projectRole' ){ // No I18N
              messgeKey = "sdp.admin.requester.bulkaction.projectrole.success"; // No I18N
              var roleid = jQuery("#DefaultUserRole").val();
              if(roleid && roleid != "null"){
                upObj = {"project_roles" : {"id" : roleid}}; // No I18N
              }else{
                upObj = {"project_roles" : null}; // No I18N
              }
            }else if (association == 'markAsVipUser') { // NO I18N
              messgeKey = 'sdp.admin.requesterDef.vipuser.bulkmark.success'; // NO I18N
              upObj = {"is_vipuser" : true}; // No I18N
            }else if(association == "department"){ // NO I18N
              messgeKey = "sdp.admin.requester.bulkaction.dept.success"; // NO I18N

              var deptid = jQuery("#deptselect1").val();
              if(deptid == null){
                alert(translate("sdp.admin.requester.bulkaction.selectdeptmsg"));
                return false;
              }
              if(deptid && deptid != "0" && deptid != "None"){ // No I18N
                upObj = {"department" : {"id" : deptid}}; // No I18N
              }else{
                upObj = {"department" : null}; // No I18N
              }
            }else if(association == "modifyCIType"){ // NO I18N
              messgeKey = "ae.cmdb.citype.update.success"; // NO I18N
              upObj = {"citype_id": jQuery("#childCIType").val()}; // NO I18N
              addUrlStr = "/_modify_ci_type"; // NO I18N
            }
            jQuery("#loader-div").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 9999;">'+ajaxBar("white")+'</div>');
            inObj[apientity_name] = upObj;
            var dataVal = sdpAjaxInputData(inObj);
            sdpAjax({
              url : "/api/v3/"+apientity_name+"s"+addUrlStr+"?ids="+userIds, // No I18N
              type: 'PUT', //No I18N
              data:dataVal,
              success: function(obj) {
                userList.getTableObject().bulkSelect.resetSelectedRecords();
                closeDialog();
                showalert("success",translate(messgeKey), "isAutoHide=true"); // No I18N
                userList.getTableObject().refreshTable("refresh"); // No I18N
                jQuery("#loader-div").html(''); // No I18N
              },
              failedCallBack : function(){
                userList.getTableObject().bulkSelect.resetSelectedRecords();
                jQuery("#loader-div").html(''); // No I18N
              }
            });
      }


    },
    //Method for Association/Dissociation of sites
    l_view.associateUserToSite = function(additionalParams,action){
        var techIds = l_view.selectedTech("sdp.admin.technician.list.select.jserror",true); //No I18N
        if(techIds.length > 0){
            var params = null;
            for(var i=0;i<techIds.length;i++){
                if(params === null)
                {
                    params = "tech_Id="+techIds[i]; // I18N
                }
                else
                {
                    params = params +"&tech_Id="+techIds[i]; // I18N
                }
            }
          showURLInDialog('/setup/TechnicianListActions.jsp'+additionalParams+params,'closeButton=yes,width=250,height=150,title='+action+','); // No I18N
        }
    },
    //removes the selected users from the portal
    l_view.dissociateFromInstance = function () {
       var ids = userList.getTableObject().bulkSelect.getSelectedIDs();
      if(ids.length === 0) {
        showalert("failure", translate("select.requesters.to.change.as.tech"), "isAutoHide=true"); // No I18N
        return;
      }
      sdpAjax({
        url: "/api/v3/users/_dissociate_from_instance?ids=" + ids, // No I18N
        type: "delete", // No I18N
        success: function (response) {
              var windowOpener = window.opener || window;

              windowOpener.showalert("success", translate("portal.user.removed.succmsg"), "isAutoHide=true"); // No I18N

            if (l_view.popupfor !== "verify_users") {
                userList.getTableObject().refreshTable();
            } else {
                windowOpener.jQuery("#cloneCriteriaRow").nextAll().remove();
                windowOpener.populateRequesterCriteria();
                windowOpener.showVerifyUsersListMsg();
                window.close();
            }
          }
      });
    },
    l_view.verifyUsers = function () {
        var selectedIDs = userList.getTableObject().bulkSelect.getSelectedIDs();
        var data = {
            "acknowledge": selectedIDs.map(function (val) { // No I18N
                 return {
                     "id": val // No I18N
                 }
             })
        };
        sdpAjax({
            url: "/api/v3/users/_acknowledge", // No I18N
            data: sdpAjaxInputData(data),
            type: "put", // No I18N
            success: function (response) {
              var windowOpener = window.opener;
              windowOpener.showalert("success", translate("portal.user.edit.verifyuser.succ.msg"), "isAutoHide=true"); // No I18N
              windowOpener.showVerifyUsersListMsg();
              window.close();
            }
        })
    },

    l_view.getSelectedIds = function(ignoreWarning) {
        var ids = userList.getTableObject().bulkSelect.getSelectedIDs();
        if(ids.length === 0 && !ignoreWarning) {
            showalert("failure", translate("common.select.users"), "isAutoHide=true"); // No I18N
            return [];
        }
        return ids;
    },
    l_view.importSupportReps = function() {
        var ids = l_view.getSelectedIds();

        if(ids.length === 0) {
            return false;
        }

        userList.redirectTo("add", true, undefined, "change_as_technician");// No I18N
    },
    //sets include or exclude select2 data of the selected users from the popup list view.
    l_view.addUsersCriteria = function () {
      var bulkSelect = userList.getTableObject().bulkSelect;
      var selectedIDs = bulkSelect.getSelectedIDs();
      var windowOpener = window.opener;
      var popupFor = l_view.popupfor;
      if(l_view.module == "tfa") {
        var bulkSelectValue = [];
        for (var key in bulkSelect.selectedRecords) {
          bulkSelectValue.push({ "id": key , "text": bulkSelect.selectedRecords[key].name});
        }
		window.opener.tfa.tfaLoginRulesUserBulkCurrentSelect.select2('data',bulkSelectValue); //NO I18N
        window.close();
        return;
      }

      if(isSCP && popupFor === "associate_acc_contacts") {
          if(selectedIDs.length === 0) {
            showalert("failure", translate("common.select.users"), "isAutoHide=true"); // No I18N
            return false;
          }
          l_view.associateAccountContacts(bulkSelect.getSelectedIDs());
          return;
      }

      var selectedRecords = bulkSelect.selectedRecords;
      var select2Objects = [];

      for (var id in selectedRecords) {
            select2Objects.push( selectedRecords[id] );
      }

      windowOpener.saveAssociatedIds({select2Objects: select2Objects}, this, l_view.popupfor); // No I18N
      window.close();
    },
     l_view.updateAccount = function(ids) {
         var listData = window.opener.userList;
         var data = {
             user: { account: { id: listData.accId } }
         }

         if(listData.subaccId !== undefined) {
             data.user.subaccount = { id:  listData.subaccId };
         }

         sdpAjax({
             url: "/api/v3/users?ids=" + ids.toString(),// No I18N
             type: "put",// No I18N
             data: sdpAjaxInputData(data),
             success: function () {
                l_view.showPopupSucessMsg(translate("scp.contacts.associated.succmsg"));
             }
         });
     },
     l_view.showPopupSucessMsg = function(msg) {
        var windowOpener = window.opener;

        windowOpener.showalert("success", msg, "isAutoHide=true"); // No I18N
        windowOpener.userList.getTableObject().refreshTable("refresh"); // No I18N
        window.close();
     },
     l_view.associateAccountContacts = function(ids) {
         var ids = l_view.getSelectedIds();
         var users = userList.getTableObject().bulkSelect.selectedRecords;
         var hasAccount = false;

         if(ids.length === 0) {
             return false;
         }

         for(var id in users) {
             var user = users[id];
             if(user.account !== null) {
                 hasAccount = true;
                 break;
             }
         }

         if(hasAccount) {
             showconfirm(true, 'title=' + translate("common.confirm.submit.msg") + ', message=' + translate("scp.contact.acc.change.warning") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes',// No I18N
                 function(confirm) {
                     if(confirm) {
                         l_view.updateAccount(ids);
                     }
                 });
         } else {
             l_view.updateAccount(ids);
         }
     },
    /*Table header data meta_info*/
     l_view.headerdataConstruct = function(isUser){
      var meta_data ={}, meta_data_add = {}, popupFor = l_view.popupfor;
      var tempentname = l_view.entity_name;
          if(isUser){
            tempentname = "users"; // No I18N
          }else{
            tempentname = "technicians"; // No I18N
          }
        if ((l_view.module == "tfa") || isMSP && l_view.apiModule === "account_managers" || userList.module === "import_user" || userList.module === "chat" || popupFor === "verify_users" || (isSCP || isMSP ) && (popupFor === "associate_acc_contacts" || userList.isImportReps) || popupFor === "include_orgusers" || popupFor === "exclude_orgusers" || (l_view.isInactiveUserListView == true && (l_view.user_get && l_view.user_get[0].enable_user_deletion_popup == "true") && (forwardfrom == "ESM" || isMDHSetup == "false" || isSCP)) || (l_view.isInactiveUserListView !== true && l_view.isSearchuserPopup != true || (l_view.isSearchuserPopup == true && (l_view.module == "WorkOrder_EMailCC" || l_view.module=="cab" || l_view.module == "UserGroups" || l_view.module == "Maintenance_EMailCC")))) {
            meta_data[tempentname + "_head_chk"] = { // No I18N
              "type" : "checkbox", // No I18N
              "default" : true, // No I18N
              "dataCelltransformer" : l_view.constructCheckboxCell // No I18N
            };
          }

          if (isMSP && l_view.module === "merge_unknown_users") {
            meta_data[tempentname + "radio"] = { // No I18N
              "type": "icon", // No I18N
              "default": true, // No I18N
              "dataCelltransformer": function (data) {// No I18N
            return '<span class="fl"><input type="radio" name="parent_user" value="' + data.row_data.id + '"></span>';// No I18N
              }
            };
          }

          if(l_view.isInactiveUserListView == true){
            /*Meta for Deleted /Inactive user listview*/
            meta_data_add = {
              "name" : { // No I18N
                "text" : "sdp.admin.technician.addtechnician.name" // No I18N
              },
              "employee_id":{ // No I18N
                "text": "sdp.admin.technician.addtechnician.employeeid" // No I18N
              },
              "first_name":{ // No I18N
                "text": "sdp.requests.common.firstName" // No I18N
              },
              "middle_name":{ // No I18N
                "text": "sdp.admin.requesterCSVImp.middleName" // No I18N
              },
              "last_name":{ // No I18N
                "text": "sdp.requests.common.LastName" // No I18N
              }
            }
            if(isSCP && isUser) {
                delete meta_data_add.employee_id;
            }
            jQuery.extend(meta_data,meta_data_add);
          }else{ //Meta  For Active Users / Technicians
            meta_data_add = {
              "editicon" : { // No I18N
                "type" : "icon", // No I18N
                "default" : true, // No I18N
                "dataCelltransformer": l_view.constructEditCell // No I18N
              },
              "previewicon" : { // No I18N
                "type" : "icon", // No I18N
                "default" : true, // No I18N
                "dataCelltransformer": l_view.constructPreviewCell // No I18N
              },
              "name" : { // No I18N
                "div_class" : "pos-rel pr30", // No I18N
                "dataCelltransformer" : l_view.constructTechnicianCell // No I18N
              },
              "is_technician" : { // No I18N
                "type" : "String", // No I18N
                "value_path" : "type", //Here 'type' is User module field name // No I18N
                "text" : translate("ae.cmdb.admin.citype.type"), // No I18N
                "dataCelltransformer" : l_view.constructUserTypeCell, // No I18N
                "disableSorting" : true // No I18N
              },
              "citype":{ // No I18N
                "disableSearching" : true, // No I18N
                "disableSorting" : true, // No I18N
                "frommeta": true // No I18N
              },
              "login_name":{}, // No I18N
              "email_id":{}, // No I18N
              "department":{frommeta: true}, // No I18N
              "site" : { // No I18N
                "value_path" : "department.site.name", // No I18N
                "text":"common.site" // No I18N
              },
              "phone":{"display_dir" :"ltr"}, // No I18N
              "mobile":{"display_dir" :"ltr"}, // No I18N
              "jobtitle":{frommeta: true}, // No I18N
              "project_roles":{frommeta : true}, // No I18N
              "employee_id":{frommeta: true}, // No I18N
              "first_name":{}, // No I18N
              "middle_name":{}, // No I18N
              "last_name":{}, // No I18N
              "enable_telephony":{ //No I18N
              "disableSearching" : true, // No I18N
                "dataCelltransformer" : l_view.constructTelephonyCell //No I18N
              },
              "linked_entity":{ // No I18N
                "dataCelltransformer": l_view.constructLinkedEntity // No I18N
              }
            };

            if (popupFor === "verify_users") {
              meta_data_add.name.default = true;
              meta_data_add.created_by = { default: true };
              meta_data_add.created_time = { default: true };
            }

            if (isSCP && forwardfrom !== "ESM" && !userList.isImportReps && isUser) {
                meta_data_add.name.default = true;
                meta_data_add.account = { default: true };
                meta_data_add.subaccount = { default: true };
            }

            jQuery.extend(meta_data,meta_data_add);
                if(userList.apiEntity === "on_behalf_of") {
                  delete meta_data.enable_telephony;
                }
                if (isMSP && !userList.isMspRequester && userList.apiModule !== "requests") {
                  delete meta_data.is_technician;
                  delete meta_data.citype;
                }
                if(isSCP) {
                  if (userList.isImportReps) {
                    delete meta_data.editicon;
                  }
                  delete meta_data.is_technician;
                } else if (parent.sdp_app.IS_SDP) {
                if(isUser){
                  if (forwardfrom == "ESM" || l_view.popupfor === "exclude_orgusers" || l_view.popupfor === "include_orgusers") {
                    delete meta_data.project_roles;
                    delete meta_data.citype;
                    delete meta_data.is_technician;
                  }else if(sdp_user.USERTYPE == "Requester"){ //No I18N
                    delete meta_data.project_roles;
                    delete meta_data.citype;
                    delete meta_data.is_technician;
                    delete meta_data.login_name;
                    delete meta_data.site;
                  }
                }else{
                  delete meta_data.is_technician;
                  delete meta_data.citype;
                }
              }else{
                delete meta_data.project_roles;
                if(isUser){
                  delete meta_data.login_name;
                }else{
                  delete meta_data.is_technician;
                  delete meta_data.citype;
                }
              }


          }
          if (isMSP && l_view.fromAcc || l_view.popupfor === "exclude_orgusers" || l_view.popupfor === "include_orgusers" || l_view.module === "merge_unknown_users") {
            delete meta_data.editicon;
          }
          if(forwardfrom != "ESM" && ((sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && !isUser) || sdp_user.ROLES.indexOf("ModifyRequester") == -1 || sdp_user.USERTYPE == "Requester" || l_view.userPreview)){
            delete meta_data.editicon;
          }
          var previewIconMods = ["QuickReq","Request","Problem","Department","OnBehalfOf_User","reportingTo"]; // No I18N
          if(!l_view.isSearchuserPopup || (sdp_user.USERTYPE == "Requester" && forwardfrom != "ESM") || l_view.isADInactiveUserListView || l_view.isAzureInactiveUserListView || (l_view.isSearchuserPopup == true && previewIconMods.indexOf(l_view.module) == -1)){
            delete meta_data.previewicon;
          }
          if(l_view.module =="tfa" || userList.module === "chat" || userList.module === "cab" || userList.module === "Change"){
            delete meta_data.editicon;
          }
          l_view.column_order = Object.keys(meta_data);
            var allowedMetaInfoKeys = Object.keys(l_view.meta_info.fields);
            Object.keys(meta_data).forEach((key)=>{
              if(!allowedMetaInfoKeys.includes(key) && (!meta_data[key].default || meta_data[key].default == false) && (isSCP || "site"!=key)) {
                delete meta_data[key];
              }
            });
        return meta_data;
     },
     /*Constructs input_data for GETALL Users/Technicians*/
     l_view.rowdataConstruct = function(table_info){
        var fields_required = table_info.fields_required;
        var inputObject = {};
        var fields_required_arr = Object.keys(fields_required);
            var siteIndex = (fields_required_arr).indexOf("site");
            if(~siteIndex){
              fields_required_arr.splice(siteIndex, 1);
            }
            var relateIndex = (fields_required_arr).indexOf("relateicon");
            if(~relateIndex){
              fields_required_arr.splice(relateIndex, 1);
            }
            var editIndex = (fields_required_arr).indexOf("editicon");
            if(~editIndex){
              fields_required_arr.splice(editIndex, 1);
            }
            var previewIndex = (fields_required_arr).indexOf("previewicon");
            if(~previewIndex){
              fields_required_arr.splice(previewIndex, 1);
            }

            if(isSCP && l_view.isUser) {
                fields_required_arr.push("account");
                fields_required_arr.push("subaccount");
            }


            if (l_view.popupfor === "verify_users") {
              fields_required_arr.push("created_by");
              fields_required_arr.push("created_time");
            }

            var techIndex = (fields_required_arr).indexOf("name");
            if(~techIndex){
              if(!l_view.isUser){
                fields_required_arr.push("is_online");
              }
              if(!isSCP) {
              fields_required_arr.push("is_vipuser");
              }
          }else {
              fields_required_arr.push("name");
            }
            if(forwardfrom == "ESM"){
              fields_required_arr.push("is_org_admin");
            }
            if(forwardfrom !== "ESM" && sdp_user.USERTYPE != "Requester"){
              fields_required_arr.push("ciid");
            }
            var is_technicianIndex = fields_required_arr.indexOf('is_technician');
            if(~is_technicianIndex && !l_view.isUser){
              fields_required_arr.splice(is_technicianIndex, 1);
            }
            //Department field is needed for UserListview Popup, to enable edit icon basedon Logged-in User's Associated sites
            // If we removed department from column chooser, then site data in list view show null. It becz site is getting from department object. So checked with salmon and done the changes .
            // Issue ID - 92900
            //if(l_view.isSearchuserPopup && sdp_user.ROLES.indexOf("SDAdmin") == -1 && sdp_user.ROLES.indexOf("ModifyRequester") != -1 && fields_required_arr.indexOf('department') == -1){
              fields_required_arr.push("department");
            //}
            if(l_view.isUser && isSCP) {
                fields_required_arr.push("org_user_status");
            }
            fields_required_arr.push("email_id");
            fields_required_arr.push("login_name");
      fields_required_arr.push("profile_pic");
              var dupFieldsRequired = [];
              var fieldsInMetaInfo = Object.keys(l_view.meta_info.fields);
              for (i = 0; i < fields_required_arr.length; ++i) {
                var field = fields_required_arr[i];
                if(field.includes('.')) {
                  var splittedFields = field.split('.');
                  if(fieldsInMetaInfo.includes(splittedFields[0]) &&
                      Object.keys(l_view.meta_info.fields[splittedFields[0]].fields).includes(splittedFields[1])) {
                    dupFieldsRequired.push(field);
                  }
                } else if(fieldsInMetaInfo.includes(field)) {
                  dupFieldsRequired.push(field);
                }
              }

            inputObject.list_info = table_info.list_info;
            inputObject.fields_required = dupFieldsRequired;
            if(table_info.hasOwnProperty("template")){
                inputObject.template = table_info.template;
            }
        return inputObject;
      },
      //Constructing Checkbox cells
      l_view.constructCheckboxCell = function(tabledata){
        var rdata = tabledata.row_data;
        if(rdata.is_user_anonymized && l_view.isInactiveUserListView == true){// Remove checkbox for Anonnymized users
          return ""; // No I18N
        }
        return '<input type="checkbox" value="'+rdata.id+'" data-ciid="'+rdata.ciid+'" data-istechnician="'+rdata.is_technician+'" data-table-checkbox>';
      },
      l_view.mergeUnknownUsers = function() {
          var isDetailsPage = userList.forwardTo === "mydetails"; //No I18N
          var id = isDetailsPage ? jQuery("#userID").val() : jQuery('[name="parent_user"]:checked').val();
          if(!isDetailsPage && id === undefined) {
            showalert("warning", translate("sdp.merge.parent.select"), "isAutoHide=true"); // No I18N
            return;
          }
          if (confirm(translate("sdp.merge.warningmessage"))) {
            window.opener.userAdd.mergeUnknownUsers(id);
            window.close();
          }
      },
      //Constructing Users/Technician Name cells
      l_view.constructTechnicianCell = function(tabledata){
        var rdata = tabledata.row_data, availStr="", vipStr = "", unapprovedIcon = "";
        if(l_view.isUser){
          if(forwardfrom == "ESM" && rdata.is_org_admin){
            vipStr = '<span rel="uitip" class="aspr org-admin icon-md mr4 pos-abs right20 top-5 a11yemphasize" title="'+translate("user.orgadmin.title")+'"></span>';
          }
          if(rdata.org_user_status === "UNAPPROVED") {
          unapprovedIcon = '<span class="cspr help6 icon-sm mr4 pos-abs"></span>';
          }
        }else{
          var availIcon = "", availTitle = "";
          if(sdp_app.IS_SDP){
            if(rdata.is_online === "1"){
              availIcon = "onlineicon btn-success", availTitle = "sdp.techMarking.online"; // No I18N
            }else if(rdata.is_online === "2"){
              availIcon = "offlineicon btn-secondary", availTitle = "sdp.techMarking.offline"; // No I18N
            }else{
              availIcon = "logedicon", availTitle = "sdp.techMarking.logout"; // No I18N
            }
            availIcon += " mr5"; // No I18N
          }
          availStr = ' <span title="'+translate(availTitle)+'" class="'+availIcon+'" rel="uitip"></span> '; // No I18N
        }
        if(rdata.is_vipuser){
          vipStr +='<span class="cspr vip icon-sm ml5 pos-abs right0 top0" rel="uitip" title="'+translate("sdp.admin.requesterDef.vipuser")+'"></span>'; // No I18N
        }

        var mspRoleIcon = "";
        if(isMSP) {
            if (rdata.is_account_manager) {
                  mspRoleIcon = '<span rel="uitooltip-track" class="cspr account-manager-icon icon-sm mr4 flat" title="' + translate("sdp.admin.account.accmanager") + '"></span>';
            } else if (rdata.is_point_of_contact) {
                  mspRoleIcon = '<span rel="uitooltip-track" class="cspr  icon-sm user-md mr5 flat" title="' + translate("sdp.msp.account.pointofcontact") + '"></span>';
            }
        }
        var isUser = ((rdata.is_technician == true || !l_view.isUser) && !l_view.isCMDB)  ? false : true;
        var callbackfn = 'userList.redirectTo(\'details\','+isUser+','+parseInt(rdata.id)+')'; // No I18N
        if(l_view.userPreview){ // No I18N
          return '<span>' + availStr + mspRoleIcon + e_html(rdata.name)+vipStr + unapprovedIcon + '</span>'; // No I18N;
        }else{
          if(l_view.isSearchuserPopup == true){
          if (isMSP && (l_view.apiModule === "account_managers" || l_view.module === "merge_unknown_users") || isSCP && (userList.isImportReps || userList.popupfor === "associate_acc_contacts") || l_view.module == "UserGroups" || l_view.module == "WorkOrder_EMailCC" || l_view.module=="cab" || userList.module === "import_user" || userList.module === "Maintenance_EMailCC" || userList.module === "chat" || l_view.module == "tfa") { // No I18N
              callbackfn = 'userList.redirectTo(\'mydetails\','+l_view.isUser+','+parseInt(rdata.id)+')'; // No I18N
            }else{
              callbackfn = 'userList.selectUser(\''+parseInt(rdata.id)+'\')'; // No I18N
            }
          }
          var redirectmodule = isUser ? "requester" : "technician"; // No I18N
          var hrefURL = '/SetUpWizard.do?forwardTo='+redirectmodule+'&isUser='+isUser+'&viewType=details&userId='+parseInt(rdata.id); // No I18N
          if(forwardfrom == "ESM"){ // No I18N
            hrefURL = '/ESM.do?type=users&viewType=details&userId='+parseInt(rdata.id); // No I18N
          }
          return '<a id="userlink' + rdata.id + '" rel="uitip noopener noreferrer"  mode_ellipsis=true href="' + hrefURL + '" data-event="click" data-handler="' + callbackfn + '" nonce='+sdpNonce+' title="' + e_attr(rdata.name) + '">' + availStr + mspRoleIcon + e_html(rdata.name)+vipStr + unapprovedIcon + '</a>'; // No I18N;
        }
      },

      l_view.selectUser = function (id) {
             const name = userList.getTableObject().bulkSelect.loadedRecords[id].name;
             selectUserFromSearch(id, name);
      }

       //Constructing Edit icon cells
      l_view.constructEditCell = function(tabledata){

        var rdata = tabledata.row_data, edtiIconStr = ""; // No I18N
        var isUser = (rdata.is_technician == true || !l_view.isUser) ? false : true;
        if(forwardfrom != "ESM" && sdp_user.ROLES.indexOf("SDAdmin") == -1){
          var siteId = (rdata.department && rdata.department.site) ? rdata.department.site.id : "-1"; // No I18N
          if(rdata.is_technician == true || (l_view.LOGGEDIN_USER_SITES_WITH_REFER && l_view.LOGGEDIN_USER_SITES_WITH_REFER.indexOf(siteId) == -1)){
            return '<div class="opac3"><span style="cursor:no-drop" class="editicon"><a></a></span></div>'; // No I18N
          }
        }
        return '<span class="editicon"><a href="/" data-event="click" data-handler="userList.redirectTo(\'add\','+isUser+','+rdata.id+')" nonce='+sdpNonce+' class="editicon"></a></span>'; // No I18N
      },
      l_view.constructPreviewCell  = function(tabledata){
        var rdata = tabledata.row_data;
        var previewStr = "";
        var isUser = (rdata.is_technician == true || !l_view.isUser) ? false : true;
        if(forwardfrom != "ESM" && l_view.isSearchuserPopup && sdp_user.ROLES.indexOf("SDAdmin") == -1){
          var siteId = (rdata.department && rdata.department.site) ? rdata.department.site.id : "-1"; // No I18N
          if((rdata.is_technician == true && sdp_user.ROLES.indexOf("SDSiteAdmin") == -1) || (l_view.LOGGEDIN_USER_SITES_WITH_REFER && l_view.LOGGEDIN_USER_SITES_WITH_REFER.indexOf(siteId) == -1)){
            return '<div class="opac3"><span style="cursor:no-drop" class="common-sprite common-preview-icon1"></span></div>'; // No I18N
          }
        }
        return '<a class="btn-icon icon-sm" href="/" data-event="click" data-handler="userList.redirectTo(\'mydetails\','+isUser+','+rdata.id+')" nonce='+sdpNonce+' type="button" title="'+translate('sdp.common.preview')+'"><span class="common-sprite common-preview-icon1"></span></a>';
      },
      l_view.constructUserTypeCell = function(tabledata){
        var rdata = tabledata.row_data, userType = "sdp.header.user"; // No I18N
        if(rdata.is_technician){
          userType = "sdp.requests.common.technician"; // No I18N
        }
        return translate(userType);
      },
      l_view.constructTelephonyCell = function(tabledata){
        var rdata = tabledata.row_data, teleEnabled = "sdp.request.listview.linkrequest.linkedwith.no"; // No I18N
        if(rdata.enable_telephony){
          teleEnabled = "sdp.request.listview.linkrequest.linkedfrom.yes"; // No I18N
        }
        return translate(teleEnabled);
      },
      l_view.constructLinkedEntity = function(tabledata){
        return tabledata.row_data.linked_entity != null ? tabledata.row_data.linked_entity.display_name : "-";
      },
      l_view.handleUserDelete = function(userType){
        if("REQ" == userType || "TECH" == userType || "USER_ANONYMIZATION" == userType || userType == "adinactiveUsers" || userType == "azureinactiveUsers"){
          var conMsg = "";
          if("REQ" == userType){
            conMsg = 'sdp.admin.requester.delete.choose'; // No I18N
          }else if("TECH" == userType){ // No I18N
            conMsg = 'sdp.admin.technician.list.select.jserror'; // No I18N
          }else if("USER_ANONYMIZATION" == userType){ // No I18N
            conMsg = "sdp.admin.user.anonymize.choose"; // No I18N
          }else if("adinactiveUsers" == userType || "azureinactiveUsers" == userType){ // No I18N
            conMsg = "sdp.admin.projectrole.selectuser"; // No I18N
          }
          var userIds = jQuery("#userID").val();
          if(userIds == "" || userIds == undefined){
            userIds = l_view.selectedTech(conMsg, true);
          }
          if(userIds && userIds.length > 0){
            var callBackModule = null;
            if("USER_ANONYMIZATION" == userType){ // No I18N
                callBackModule = "userAnonymizationHandler"; //No I18N
            }else{
              callBackModule = "userDeleteHandler"; //No I18N
            }
            callAjaxRequest('/servlet/PIIServlet', 'action=getGDPRSettings&subAction=fetchAnonymousNameMapping&isUserId=true&userList=' + userIds, callBackModule);
          }
        }
        else{
          alert(translate('sdp.common.error.unknown'));
        }
      },
      //dropdown menu for selected users list
      l_view.constructSelectedListCB = function(user) {
        var email = e_html(user.email_id);
        var nameMarginTop = "";

            if(email !== null && email != undefined) {
                email = '<div class=" pt3 font-small text-muted">' +
                    '<span class="disp-b text-overflow" style="max-width: 200px;">'
                    + email  + '</span></div>';
            } else {
                email = "";
                nameMarginTop = "margin-top: 9px;";//NO I18N
            }
            var name = '<span class="disp-b text-overflow" style="max-width: 200px;' + nameMarginTop + '">'
                + e_html(user.name)
                + '</span>';
            var imgURL = "/images/default-profile-pic2.svg";    //NO I18N
            if (user.profile_pic) {
                imgURL = user.profile_pic["content-url"];    //NO I18N
            }
            var profilePic = '<div style="" class="col-xs-2 p0"><div class="proThumIcon"><div class="prp-circle mt5 mb5">' +
                '<img src="' + imgURL + '">' +
            '</div></div></div>';
            var html =  profilePic +
            '<div class=" col-xs-8 p5"> <span class="disp-b" >' + name + '</span>' + email + '</div>';
            return html;
      },
        l_view.getRequestersIds = function (users) {
          var ids = [];
          for (var id in users) {
            var user = users[id];
            if (!user.is_technician) {
              ids.push(id);
            }
          }
          return ids;
        },

        l_view.changeAsTechnician = function () {
          var users = userList.getTableObject().bulkSelect.selectedRecords;

          var techIds = userList.selectedTech(translate("no.user.selected"), true); // No I18N
          if (techIds.length > 0) {
            //opens bulk update window.
            NewWindow('/setup/UsersPopup.jsp?isUser=false&viewType=add&popupfor=bulkupdate&changeTo=change_as_technician', 'userdetails', '1100', '700', 'yes', 'center');
          }
        },
        l_view.changeAsTechnicianNow = function () {
          var users = userList.getTableObject().bulkSelect.selectedRecords;
          var usersIDs = this.getRequestersIds(users);

          if (!usersIDs.length) {
            showalert("failure", translate("no.user.selected.to.change.as.tech"), "isAutoHide=true"); // No I18N
            return;
          }

          sdpAjax({
            url: "/api/v3/users/_change_as_technician?ids=" + usersIDs.toString(), // No I18N
            type: "PUT", // No I18N
            success: function () {
              table_tech.refreshTable();
              showalert("success", translate("changed.as.tech.succ.msg"), "isAutoHide=true"); // No I18N
            },
            failedCallBack: function (response) {
              l_view.showFailureSummary(response);
            },
            ignorefailuremessage: false
          });
      },
      l_view.getDisplayValue = function (metaInfo, field) {
        var key;
        if (metaInfo.hasOwnProperty(field)) {
          return metaInfo[field].display_name;
        }
        key = "ci_default_fields." + field; //No I18N
        if (metaInfo.hasOwnProperty(key)) {
          return metaInfo[key].display_name;
        }
        key = "user_udf_fields." + field; //No I18N
        if (metaInfo.hasOwnProperty(key)) {
          return metaInfo[key].display_name;
        }
        return field;
      },
      //Adding selected Bulk users to channel
      l_view.addUsersToChat = function(chatId) {
        let selectedIDs = userList.getTableObject().bulkSelect.getSelectedIDs();
        jQuery("#users_submit_row_cnt").find("input").attr("disabled",true);
        if(selectedIDs.length === 0) {
          showalert("failure", translate("bulk.users.all.removed"), "isAutoHide=true"); // No I18N
          jQuery("#users_submit_row_cnt").find("input").attr("disabled",false);
          return;
        }
        let inputJson = {};
        inputJson.users = selectedIDs;
        sdpAjax({
              url : "/api/v3/chats/"+ chatId +"/add_member", //No I18N
              type: 'PUT', //No I18N
              data: sdpAjaxInputData(inputJson),
              success: function(res) {
                window.close();
              },
              error: function (response) {
                jQuery("#users_submit_row_cnt").find("input").attr("disabled",false);
                window.showalert('warning',translate("channel.users.add.member.error"), "isAutoHide=false");// No I18N
              }
            });
      },
      l_view.showFailureSummary = function (response) {
          var options = {
            response: response,
            records: userList.getTableObject().bulkSelect.selectedRecords,
            metainfo: userList.getTableObject().t_obj.meta_info,
            getDisplayValue: l_view.getDisplayValue
          };
          messageHandling.updateFailureSummary(options);

          //show bulk update failure summary.
          if (messageHandling.summary.failedRecords.length > 0) {
            var msg = {
              noOfRecordsUpdatedMsg: translate("sdp.noOf.users.updated"),
              noOfRecordsFailedMsg: translate("sdp.noOf.users.failed"),
              entity: translate("sdp.helpdesk.common.user")
            }
            const html = renderhbs(null, 'bulk-update-summary', {...msg, ...messageHandling.summary}, false, 'users', null, true, null, true); //No I18N
            jQuery(html).dialog({
              width: 800,
              height: 600,
              modal: true,
              title: translate("update.summary") 
            });
          }
      }
      return l_view;
  }()));
/* User/ Technician related Listview section Ends*/
