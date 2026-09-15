window.userList = (function(){
  /*Call for Admin-Users, ESM Dir- Users
          forwardTo - will be  "list", "add" ,"details"  
          isUser - 'true' for Users/ 'false' for Technicians
          changeTo - will be "Change_as_Technician" from UsersDetails page and Technician Listview
          id - will have value for Edit mode
          changeTo - will be "showmydetails" from Requester Login Mydetails view,  
       */
    var lview = {};
        lview.isInactiveUserListView = false;
        lview.entity_name = "technicians"; // No I18N
        lview.isCMDB = false; //Will be 'true' , when it will be under CMDB
        lview.selectedRecords;

    /*Call from CMDB-Users*/
    lview.redirectFromCMDB = function(){
      lview.isCMDB = true;
      lview.ciTypeId = jQuery("#ciTypeId").val(); // No I18N
      if (isMSP) {
        lview.mspAccountId = jQuery("#__persistentAccountId__select").val();
      }
      lview.redirectTo('list',true); // No I18N
    },
    lview.redirectTo = function(forwardTo, isUser, id, changeTo){
      var pathName = "", userCallback = "", callbackParams = ""; // No I18N
        var isFromAccount = isSCP && lview.fromAcc;
        lview.forwardTo = forwardTo;
        if(isSCP && (userList.isImportReps || userList.popupfor === "associate_acc_contacts")) {
            //hiding list-view submit row for details/form of import support reps popup as same popup used for both list-view and form.
            jQuery("#users_submit_row_cnt").css("display", forwardTo === "list" ? "" : "none");// No I18N
            jQuery("#bulk_edit_warning_msg").remove(); //hiding field info warning msg of the bulk edit.
        } else if(isMSP) {
          lview.resetMspAccountId(forwardTo);
        }

      //getting selectedRecords from the list-view to retaining the user selection changes as the table object will be reinitialized when user redirected to list-view from details page
      if(forwardTo !== "list" && (userList.module === "import_user" || userList.module === "UserGroups" || userList.module === "WorkOrder_EMailCC" || userList.module ==="chat") ) {
          if(typeof userList.getTableObject === "function") {
            var bulkSelect = lview.selectedRecords = userList.getTableObject().bulkSelect;
            if(bulkSelect !== undefined) {
              lview.selectedRecords = bulkSelect.selectedRecords;
            }
          }
        } else if(isSCP && forwardTo === "list") { // No I18N
            userList.isOrgImport = false;
      }
      if(forwardTo === "mydetails" || changeTo == "showmydetails" || lview.isCMDB == true || lview.backtoListview == "cmdbAllCIs" || lview.isSearchuserPopup == true){ // No I18N
          lview.doPush = false;
      }
      if(forwardTo === "list"){
        if(lview.backtoListview == "cmdbAllCIs"){ //Under CMDB (ALL CIs link), When we click on "GO Back" from User EDIT/VIEW page
          window.location.href = "/CMDBAction.do?mode=listView";
          return;
        }
        if(lview.backtoListview == "user" || (isUser == true) || jQuery("#change_as_technician").val() == "true"){
          isUser = true;
          var paraStr = ""; // No I18N
          if(isMSPOrSCP && lview.appliedFilter){
            paraStr = "?userViewType=" + lview.appliedFilter;// No I18N
          }
          if(lview.isInactiveUserListView == true || changeTo == "deletedUsers"){
            paraStr = "?userViewType=inactiveUsers"; // No I18N
            lview.isInactiveUserListView = true;
          }else if(lview.isADInactiveUserListView == true){
            paraStr = "?userViewType=adinactiveUsers"; // No I18N
          }else if(lview.isAzureInactiveUserListView == true){
            paraStr = "?userViewType=azureinactiveUsers"; // No I18N
          }else if(lview.isSearchuserPopup == true){
            lview.myDetailsEdit = "Show"; // No I18N
            paraStr = "?userViewType=searchUsers"; // No I18N
          }
          if(lview.isCMDB){
            paraStr += (paraStr!="") ? "&fromCMDB=true" : "?fromCMDB=true";
          }
          paraStr += lview.apiModule ? "&apiModule="+lview.apiModule : ""; //No I18N
          paraStr += lview.apiModuleId ? "&apiModuleId="+lview.apiModuleId : ""; //No I18N
          paraStr += lview.apiEntity ? "&apiEntity="+lview.apiEntity : ""; //No I18N
          lview.backtoListview = "user"; // No I18N
            if(isFromAccount) {
              paraStr += (paraStr ? "&" : "?") + "isFromAccount=true";
            }
            if(isMSP && userList.isMspRequester) {
              paraStr += (paraStr ? "&" : "?") + "isMspRequester=true";
            }

            if(forwardfrom != "" && (isMSP || isSCP)) {
                paraStr += (paraStr ? "&" : "?") + "forwardfrom=" + forwardfrom;
            }
          pathName = "/setup/UsersListview.jsp"+paraStr; // No I18N
        }else{
          var paraStr = ""; // No I18N
          if(lview.isADInactiveUserListView == true){
            paraStr = "?userViewType=adinactiveUsers"; // No I18N
          }
          if(lview.isAzureInactiveUserListView == true){
            paraStr = "?userViewType=azureinactiveUsers"; // No I18N
          }
          if(lview.apiModule == "chats"){
            //Used specifically for adding user to channels
            if(paraStr == ""){
              paraStr = "?apiModule="+lview.apiModule;// No I18N
            }else{
              paraStr = paraStr+"&apiModule="+lview.apiModule;// No I18N
            }
          }
          if(isMSP) {
               paraStr += (paraStr ? "&" : "?") + "isUser=false"; //No I18N
           }
          lview.backtoListview = "technician"; // No I18N
          pathName = "/setup/TechnicianListview.jsp"+paraStr; // No I18N
        }
      }else if(forwardTo === "add"){ // No I18N
        var idStr = id ? "&userId="+id : ""; // No I18N
        var isPopup = (lview.isSearchuserPopup == true && !lview.module) ? "&isPopup=true":"";  // No I18N
        changeTo = changeTo ? "&changeTo="+changeTo : ""; // No I18N
          var popupfor = lview.popupfor ? "&popupfor="+lview.popupfor : ""; // No I18N
        if(!idStr && isMDHSetup == "true" && forwardfrom != "ESM" && sdp_user.ROLES.indexOf("CreateRequester") == -1){ // No I18N
          window.location.href = '/ui/home'; // No I18N
          return false;
        }else{
          pathName = "/setup/UserForm.jsp?isUser="+isUser+idStr+changeTo+isPopup+popupfor + (isSCP && lview.isOrgImport ?  "&isOrgImport=true" : ""); // No I18N
        }
      }else{
        var mydetStr = (forwardTo === "mydetails" || ( lview.isSearchuserPopup == true && (lview.module == "UserGroups" || lview.module == "Department" || lview.module == "OnBehalfOf_User" || lview.module == "WorkOrder_EMailCC"))) ? "&showmydetails=true&myDetailsEdit="+lview.myDetailsEdit : ""; // No I18N
            mydetStr = id ? mydetStr+"&userId="+id : mydetStr; // No I18N
            mydetStr = (lview.isADInactiveUserListView == true) ? mydetStr+"&userViewType=adinactiveUsers" : mydetStr; // No I18N
            mydetStr = (lview.isAzureInactiveUserListView == true) ? mydetStr+"&userViewType=azureinactiveUsers" : mydetStr; // No I18N
            mydetStr = (lview.backtoListview == "cmdbAllCIs") ? mydetStr+"&fromCMDBAllCIs=true&fromCMDB=true"  : mydetStr; // No I18N
            mydetStr = (lview.isCMDB == true || lview.backtoListview == "cmdbAllCIs") ? mydetStr+"&fromCMDB=true" : mydetStr; // No I18N
            mydetStr = (lview.module) ? mydetStr+"&popupmodule="+lview.module : mydetStr; // No I18N
            mydetStr += lview.minContent == "true" ? "&minContent=true" : ""; //No I18N
            mydetStr += lview.card == "true" ? "&card=true" : ""; //No I18N
            mydetStr += lview.getOrguser == "true" ? "&getOrguser=true" : ""; //No I18N
            pathName = "/setup/UserDetails.jsp?isUser="+isUser+mydetStr; // No I18N
      }
      jQuery("#userDetails-section").load(pathName, function() {

        if(forwardTo === "list"){
          userList = jQuery.extend(true, userList, lview);
          lview = userList;
        }

        if(forwardTo === "list" && (!isUser || (isUser && (lview.isRequesterConfigured != "false" || lview.isCMDB == true || lview.isSearchuserPopup == true)))){ // No I18N
          if(isUser){
            jQuery("#requesterListDiv").show();
            jQuery('.inputclear-icon').on('click',function(){
              jQuery('.inputclear-icon').hide();
              jQuery("#searchUser").val('').trigger('focus');
              lview.getGlobalSearchList();
            });
            jQuery("#searchUser").trigger('focus');
            //Need to remove Active/Deleted Users filter for Child CIType
            if(jQuery("#cmdbUserType").val() == "child"){ // No I18N
              jQuery("#filterViewMenu").parent().remove();
            }

            if(jQuery("#displayallocateToType").val() == "false"){
              jQuery("#modifyCITypeBtn").hide();
              if(jQuery("#modifyCITypeBtn").siblings().length == 0){
                  jQuery("#bulkactionsMenu").hide();
              }
            }
          }else{
            if(parent.sdp_app.IS_SITE_CONFIGURE){
              jQuery("#associatedSitesList").show();
              var siteObj = getPersonalizeData("ADMIN_SITEPREFERENCE"); // No I18N
              if(siteObj){
                jQuery("#prefersite").val(siteObj.id);
              }
            }
          }
          lview.initTableComonent(isUser);
          if(!userList.isImportReps && lview.isSearchuserPopup == true && (lview.module != "UserGroups" && lview.module != "Department" && lview.module != "OnBehalfOf_User" && lview.module != "WorkOrder_EMailCC" && lview.module != "Intermediate_Editing" && lview.module != "reportingTo")){
            jQuery("#addnewuser").show();
          }
          if(trim(jQ("#bulkactionsMenu").next("ul").html()) == ""){ // No I18N
            jQ("#bulkactionsMenu").hide();  // No I18N
          }
          
        }else if(isUser && isMDHSetup == "true" && lview.isRequesterConfigured == "false"){
          jQuery("#importUserDiv").show();
        }else if(forwardTo === "add"){// No I18N
          /*When editing a user in request add page*/
          initTooltip('#UserForm');// No I18N
        }
        if(lview.doPush){
          var idStr = "", userType=""; // No I18N
          if(id){
            if(forwardTo == "add"){ // No I18N
              forwardTo = "edit"; // No I18N
            }
            idStr = "&userId="+id; // No I18N
          }
          var urlStr = ""; // No I18N
          if(forwardfrom == "ESM"){ // No I18N
            urlStr = "/ESM.do?type=users"; // No I18N
            userType = "users"; // No I18N
          }else{
            userType = lview.backtoListview == "user" ? "requester" : lview.backtoListview; // No I18N
              if (userList.isMspRequester) {
                userType = "msprequester"; // No I18N
              }
            urlStr = 'SetUpWizard.do?forwardTo=' + userType;  // No I18N
            if(forwardTo != "list"){
              urlStr += "&isUser="+isUser; // No I18N
              if(changeTo && changeTo.indexOf("change_as_technician")>-1){ // No I18N
                urlStr += changeTo;
              }
            }else{
              if(changeTo == "deletedUsers"){
                urlStr += "&changeTo=deletedUsers"; // No I18N
              }
            }
          }
          urlStr += "&viewType="+ forwardTo+idStr; // No I18N
            urlStr += forwardTo === "edit" && isSCP && lview.isOrgImport ?  "&isOrgImport=true" : "";// No I18N
            if(!isFromAccount) {
          window.history.pushState({'type':userType,"viewType" : forwardTo, "userId" : id, "changeTo" : changeTo}, '', urlStr); // No I18N
            }
        }else{
          lview.doPush = true;
        }
        if(forwardTo !== "details" && parent.sdp_app.IS_SITE_CONFIGURE && sdp_user.USERTYPE !== "Requester" && !lview.LOGGEDIN_USER_SITES && sdp_user.ROLES.indexOf("ModifyRequester") != -1 && forwardfrom != "ESM"){
          sdpAjax({
            url : "/api/v3/technicians/loggedin_user_details", // No I18N
            success : function(resp){
              lview.LOGGEDIN_USER_SITES = lview.siteToIdsConversion(resp.technician.associated_sites);
              lview.LOGGEDIN_USER_SITES_WITH_REFER = (lview.LOGGEDIN_USER_SITES).concat(resp.technician.associated_refer_sites || []);
            }, 
            async:false
          });
        }
         //"ChangeTo" will be used for redirecting from "ADDeletedUsers" under portal(Bell notification) to ESMDirectory
          if(changeTo === "addeletedusers"){ // No I18N
            jQuery("#addeletedusers").trigger("click"); // No I18N
          }
          //"ChangeTo" will be used for redirecting from "AzureDeletedUsers" under portal(Bell notification) to ESMDirectory
                    if(changeTo === "azuredeletedusers"){ // No I18N
                      jQuery("#azuredeletedusers").trigger("click"); // No I18N
                    }
            // Set pending request count in request details page right panel.
            if(typeof req_details !== "undefined" && req_details && $req) {
              jQ("#user_detail_section").show(); // No I18N
              if($req.details.pending_req_count > 0){
                var req_info = $req.details.request_info.requester;
                jQuery("[data-name=requests_by_requester]").text(translate('sdp.requests.common.requests')+" ("+$req.details.pending_req_count+")").attr({title : translate('sdp.home.summary.openRequestsTitle')+" - "+encodeHTMLAttribute(req_info.name) , onclick:$req.header.constructListReqUrl({reqId:req_info.id , key:'ListRequests' , width:'975' , height:'620'})});
              }
            }
      });
        if (forwardTo === "list" && userList.mspAccountId) {
          userList.setMspAccount({ id: userList.mspAccountId });
        }
        if(isMSP) {
          if (!isUser || changeTo && changeTo.indexOf("change_as_technician") !== -1) {
            lview.enableMspHeaderAccount(forwardTo === "list"); // No I18N
            // TODO: get "My Org Inc" account id from API
            forwardTo !== "list" && lview.setMspAccount({ id: lview.mspMyOrgAccountId, text: lview.mspMyOrgAccountName }); // No I18N
          } else if (!userList.isMspRequester) {
            lview.enableMspHeaderAccount(forwardTo !== "details"); // No I18N
          }
        }

    },
    //if "My Org admin" not associated with logged in technician set account as 0
    //reset to selected associated account filter once redirected to list view.
    lview.resetMspAccountId = function(forwardTo){
      if (!userList.isUser && !(getAccountName(userList.mspMyOrgAccountId) || (window.opener ? window.opener.getAccountName(userList.mspMyOrgAccountId) : false))) {
        window.getAccountIDNeeded = function() {
          return ( forwardTo === "list" || forwardTo === "mydetails" ) ? getAccountId() : 0;// No I18N
        }
      }
    },
    lview.enableMspHeaderAccount = function(enable) {
      jQuery("#__persistentAccountId__select").select2("enable", enable); // No I18N
    },
    lview.siteToIdsConversion = function (siteObj) {
              
      return jQuery.map(siteObj, function (obj, index) {
        return obj.id;
      });
    },
    //returns selected associated accounts ids map { id: id }
    lview.getAssociatedAccountIdsMap = function () {
      return userAddData.associated_accounts.reduce(function (account, key) {
        var value = {};
        value[key] = key;
        return Object.assign(account, value);
      }, {});
    },
    lview.getSiteIdAccountNameMap = function () {
      if(!isMSP) return {};

      var accountMap = mspAccountJsonData.reduce(function (accounts, account) {
        accounts[account.id] = account.text;
        return accounts;
      }, {});

      var siteIdAccountNameMap = {};

      for (var siteId in siteAccountModel) {
        var accountId = siteAccountModel[siteId];
        siteIdAccountNameMap[siteId] = accountMap[accountId]
      }
      return siteIdAccountNameMap;
    },
    lview.appendAccountName = function(sites) {
      var siteIdAccountNameMap = lview.getSiteIdAccountNameMap();
      for (var id in sites) {
        sites[id] = sites[id] + " (" + siteIdAccountNameMap[id] + ")";
      }
    },
    //Constructing Associated Siktes HTML
    lview.AppendSitesHTML = function(compObj){
      setTimeout(function(){
        jQuery("#searchText").trigger('focus');
        var checkedRowStr = "", uncheckedRowStr = "";
        var siteIds = jQuery("#siteIdsStr").val();
        var allsites = siteIds ? JSON.parse("[" + siteIds + "]") : [];
          var isNoSiteChecked = (typeof isMSP!="undefined" && !isMSP)  || allsites.indexOf(-1) !== -1;  // No I18N
        var checkedCnt = 0, unCheckedCnt = 0, field = "";
        if(siteGroupExceptReferModel.Sites){//In Import Users - For Sites allowed values popup
          field = "Import_Users"; // No I18N
          var siteAllowedValues = jQuery.extend([],siteGroupExceptReferModel.Sites);
          for (var i = 0; i <= siteAllowedValues.length - 1; i++) {
              var siteId = siteAllowedValues[i].id;
              var siteName = siteAllowedValues[i].name;
              var checkBoxStr = ""; // No I18N
            if(allsites.indexOf(parseInt(siteId)) !=-1){
              if(!compObj.options.viewOnly){
                checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(siteId)+'" type="checkbox" checked>'; // No I18N
              }
              checkedRowStr += '<div class="form-group pl10 pt5" data-search="'+e_attr(siteName)+'" data-checked="true"><label class="text-overflow pt2" rel="uitooltip-track-table" title="'+e_attr(siteName)+'">'+checkBoxStr+e_html(siteName)+'</label></div>';
              checkedCnt++;
            }else{
              if(!compObj.options.viewOnly){
                checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(siteId)+'" type="checkbox">'; // No I18N
                uncheckedRowStr += '<div class="form-group pl10 pt5" data-search="'+e_attr(siteName)+'" data-checked="false"><label class="text-overflow pt2" rel="uitooltip-track-table" title="'+e_attr(siteName)+'">'+checkBoxStr+e_html(siteName)+'</label></div>';
              }
              unCheckedCnt++;
            }
          }
        }else{
            if(isMSP) {
              var siteAllowedValues = {};
              var selectedAssociatedAccounts = {};

              if (Array.isArray(jQuery("#select_associated_accounts").select2("data"))) {
              selectedAssociatedAccounts = lview.getAssociatedAccountIdsMap();
                var siteAllowedValues = {};
                for (var site in siteAccountModel) {
                  var accountId = siteAccountModel[site];
                  if (selectedAssociatedAccounts.hasOwnProperty(accountId) && siteGroupExceptReferModel.hasOwnProperty(site)) {
                    siteAllowedValues[site] = siteGroupExceptReferModel[site]
                  }
                }
              } else {
          var siteAllowedValues = jQuery.extend({},siteGroupExceptReferModel);
              }

            } else {
                var siteAllowedValues = jQuery.extend({},siteGroupExceptReferModel);
            }
          delete siteAllowedValues[0];
          var isSiteAdmin = sdp_user.ROLES.indexOf("SDSiteAdmin");
            if(isMSP) {
              lview.appendAccountName(siteAllowedValues);
            }
          jQuery.each(siteAllowedValues,function(siteId, siteName){
            var checkBoxStr = ""; // No I18N
            if(compObj.options.viewOnly || isSiteAdmin == -1 || (isSiteAdmin != -1 && lview.LOGGEDIN_USER_SITES && lview.LOGGEDIN_USER_SITES.indexOf(siteId) != -1)){
              if(allsites.indexOf(parseInt(siteId)) !=-1){
                if(!compObj.options.viewOnly){
                  checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(siteId)+'" type="checkbox" checked>'; // No I18N
                }
                checkedRowStr += '<div class="form-group pl10 pt5" data-search="'+e_attr(siteName)+'" data-checked="true"><label class="text-overflow pt2" rel="uitooltip-track-table" title="'+e_attr(siteName)+'">'+checkBoxStr+e_html(siteName)+'</label></div>';
                checkedCnt++;
              }else{
                  if(!compObj.options.viewOnly){
                    checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(siteId)+'" type="checkbox">';
                    uncheckedRowStr += '<div class="form-group pl10 pt5" data-search="'+e_attr(siteName)+'" data-checked="false"><label class="text-overflow pt2" rel="uitooltip-track-table" title="'+e_attr(siteName)+'">'+checkBoxStr+e_html(siteName)+'</label></div>';
                  }
                  unCheckedCnt++;
              }
            }
          });
        }

        var notAssStr = "", checkBoxStr = "";
        
        if(field == "Import_Users" || (field != "Import_Users" && (sdp_user.ROLES.indexOf("SDSiteAdmin") == -1 || sdp_user.ROLES.indexOf("SDSiteAdmin") != -1 && sdp_user.ROLES.indexOf("Resources not in any site") != -1))){
          if(siteIds.indexOf("-1") != -1 || (siteIds.length == 0 && field != "Import_Users")){
            if(!compObj.options.viewOnly){
              checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="-1" type="checkbox" ' + (isNoSiteChecked ? "checked" : "") + '>';
            }
              if (isNoSiteChecked) {
                checkedCnt++;
              } else {
                unCheckedCnt++;
              }
            notAssStr = '<div class="form-group pl10 pt5" data-search="'+translate("sdp.admin.technician.addtechnician.nosite")+'" data-checked="true"><label>'+checkBoxStr+translate("sdp.admin.technician.addtechnician.nosite")+'</label></div>';
          }else{
            if(!compObj.options.viewOnly){
              checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="-1" type="checkbox">';
              notAssStr = '<div class="form-group pl10 pt5" data-search="'+translate("sdp.admin.technician.addtechnician.nosite")+'" data-checked="false"><label>'+checkBoxStr+translate("sdp.admin.technician.addtechnician.nosite")+'</label></div>';
            }
            unCheckedCnt +=1;
          }
        }
        var dispStr = notAssStr+checkedRowStr+uncheckedRowStr;
        if(!dispStr){
          dispStr = '<div class="tc pt10">'+translate("common.no.record.found")+'</div>'; // No I18N
        }
        compObj.grid.find('#assoiciated_div').html(dispStr);  // No I18N
        compObj.grid.find("#totalCountLbl").text(checkedCnt+unCheckedCnt);  // No I18N
        compObj.title_grid.find("#selectedCount").text(checkedCnt); // No I18N
        compObj.title_grid.find("#totalCount").text(checkedCnt+unCheckedCnt); // No I18N
     },1);
    },

    //Constructing Support Groups HTML
    lview.AppendGroupsHTML = function(compObj){
      setTimeout(function(){
        jQuery("#searchText").trigger('focus');
        var checkedRowStr = "", uncheckedRowStr = "";
        var siteIds = jQuery("#siteIdsStr").val();
        var siteIdsArray = siteIds ? JSON.parse("[" + siteIds + "]") : [];
        var supGrpIds = jQuery("#supportIdsStr").val();
        var supGrpArray = supGrpIds ? JSON.parse("[" + supGrpIds + "]") : [];
        
        var siteAllowedValues = jQuery.extend({},siteGrpModel.list);
        var checkedCnt = 0, unCheckedCnt = 0;
          var siteIdAccountNameMap = lview.getSiteIdAccountNameMap();
        for (var i = 0; i < siteIdsArray.length; i++) {
          var siteId = siteIdsArray[i];
              siteId = siteId == -1 ? 0 : siteId;
          var siteGrpObj = siteAllowedValues[siteId];
          if(siteGrpObj){
            var siteName = siteGrpObj[0];
            var supGrpObjs = siteGrpObj[1] != -1 ? siteGrpObj[1] :{};
              jQuery.each(supGrpObjs,function(grpId, supGrp){
                var supGrpName = supGrp[0], checkBoxStr= ""; // No I18N
                  var mspAccountName = siteIdAccountNameMap[siteId] || "";
                  mspAccountName = mspAccountName ? ", " + e_html(mspAccountName) : "";
                  supGrpSiteName = e_html(supGrpName) + (siteId != 0 ? ' <span>(' + e_html(siteName) + mspAccountName +')</span>' : '');
                    if(supGrpArray.indexOf(parseInt(grpId)) > -1){
                      if(!compObj.options.viewOnly){
                        checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(grpId)+'" data-siteid="'+Number(siteId)+'" type="checkbox" checked>';
                      }
                      checkedRowStr += '<div class="form-group left0 pt5" data-groupname="'+e_attr(supGrpName)+'" data-search="'+e_attr(supGrpName+siteName)+'" data-siteid="'+Number(siteId)+'" data-checked="true"><label class="text-overflow pl10 pt2" rel="uitip-track-table" title="'+e_attr(supGrpName) + (siteId !=0 ? ' ('+e_attr(siteName)+')' : '')+'">'+checkBoxStr+supGrpSiteName+'</label></div>';
                      checkedCnt++;
                    }else{
                      if(!compObj.options.viewOnly){
                        checkBoxStr = '<input class="fl mt1 mr10 asso_checkbox" value="'+(grpId)+'" data-siteid="'+Number(siteId)+'" type="checkbox">';
                        uncheckedRowStr += '<div class="form-group left0 pt5" data-groupname="'+e_attr(supGrpName)+'" data-search="'+e_attr(supGrpName+siteName)+'" data-siteid="'+Number(siteId)+'" data-checked="false"><label class="text-overflow pl10 pt2" rel="uitip-track-table" title="'+e_attr(supGrpName) + (siteId !=0 ? ' ('+e_attr(siteName)+')' : '')+'">'+checkBoxStr+supGrpSiteName+'</label></div>';
                      }
                      unCheckedCnt++;
                    }
              });
            }
        }
        var dispStr = checkedRowStr+uncheckedRowStr;
        if(!dispStr){
          dispStr = '<div class="tc pt10">'+translate("common.no.record.found")+'</div>'; // No I18N
        }
        compObj.grid.find('#assoiciated_div').html(dispStr);  // No I18N
        compObj.grid.find("#totalCountLbl").text(checkedCnt+unCheckedCnt);  // No I18N
        compObj.title_grid.find("#selectedCount").text(checkedCnt); // No I18N
        compObj.title_grid.find("#totalCount").text(checkedCnt+unCheckedCnt); // No I18N
     },1);
    },
      lview.setMspAccount = function (account) {
        var accountId = userList.isMspRequester ? lview.mspMyOrgAccountId : "0";
        if(account.text) {
          return jQuery("#__persistentAccountId__select").select2("data", account);// No I18N
        }
        if(account && account.id) {
          accountId = account.id;
    }
        jQuery("#__persistentAccountId__select").select2("val", accountId); // No I18N
      },
      lview.onMspAccountChange = function () {
      var forwardTo = userList.forwardTo;
        if (forwardTo === "list") {
            userList.refreshMspList();
        } else if (forwardTo === "add") {// No I18N
          userAdd.onAccountChange();
        }
      },
      lview.fetchAssociatedRoles = function (async) {

        // If current user does not have any of these role[SDGuest, CreateRequester, ModifyRequester], then api/v3/users/associated_roles is not invoked
        if (sdp_user.USERTYPE !== "Technician" || !(sdp_user.ROLES.indexOf("SDGuest") !== -1 || sdp_user.ROLES.indexOf("CreateRequester") !== -1 || sdp_user.ROLES.indexOf("ModifyRequester") !== -1)) {
          return new Promise(function (resolve, reject) {
            reject();
          });
        }
        async = async === undefined ? true : async;
        if (lview.associated_roles_data || async && lview.fetchAssociatedRolesPromise) {
          return lview.fetchAssociatedRolesPromise;
        }
        return lview.fetchAssociatedRolesPromise = sdpAjax({
          url: "/api/v3/users/associated_roles",// No I18N
          data: sdpAjaxInputData({ list_info: { row_count: 50 } }),
          async: async,
          success: function (response) {
            var data = response.associated_roles;
            var roleMap = data.reduce(function (object, role) {
              object[role.name] = role.id;
              return object;
            }, {});

            lview.associated_roles_data = {
              data: data,
              roleMap: roleMap
            };
          }
        });
    },
    lview.sendPasswordResetLink = function(userid,isEsm,isContact){
        var link;
        if(isEsm=="true" && !isContact){
           link = '/api/v3/orgusers/'+userid+'/_reset_password'; // No I18N
        }
        else{
           link = '/api/v3/users/'+userid+'/_reset_password'; // No I18N
        }
        sdpAjax({
                 url: link,
                 method : 'post', //NO I18N
                 dataType: 'json', //NO I18N
                 success : function(resp){
                   if(resp.reset_password.link==null){
                     showalert("success", translate('admin.message.success.pwdrstlink') ,"isAutoHide=true"); // No I18N
                   }
                   else{
                    var data = {link : resp.reset_password.link,pwd_reset_link_msg : getMessageForKey("admin.message.pwdrstlink"),link_validity_msg : getMessageForKey("admin.message.linkvalidity"), copy_to_clipboard_msg : getMessageForKey("sdp.common.copy.to.clipboard") };
                    renderhbs("#reset_password", "reset-password", data,false,"admin");//No I18N
                     jQuery("#reset_password").dialog({
                        modal : true,
                        close: function() {
                             jQuery(this).dialog("destroy"); //No I18N
                        },
                        title: translate('admin.message.pwdrstlink'), height: "auto", width:"auto" }); // No I18N
                   }
                 }
        })
        },
        lview.copy = function(){
            var copyText = document.getElementById('pwd-resetlink-value');//NO I18N
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");//NO I18N
            showalert('success', translate('msteams.copied'), 'isAutoHide=true,delay=2');//NO I18N
            jQuery('#pwd-resetlink-value').blur();
        }
    return lview;
}());

/*callback function for Users / Technicians Listview Actions*/
function ajaxRequestOnSuccess( requestObj, module )
{
      if(module == "projectRoleBulkAssociate" || module == "associate_techToSite" ||  module == 'move_tech_to_requester' || module == 'markAsVipUserBulkAssocite' || module == 'deptBulkAssocitae'){
          var messgeKey = ""; // No I18N
          if( module == 'move_tech_to_requester' ){ // No I18N
            messgeKey = "sdp.admin.technician.movetechnicianasrequester.success"; // No I18N
          }else if( module == 'associate_techToSite' ){ // No I18N
            messgeKey = "sdp.admin.technician.siteasocciated.success"; // No I18N
          }else if( module == 'projectRoleBulkAssociate' ){ // No I18N
            messgeKey = "sdp.admin.requester.bulkaction.projectrole.success"; // No I18N
          }else if (module == 'markAsVipUserBulkAssocite') { // NO I18N
            messgeKey = 'sdp.admin.requesterDef.vipuser.bulkmark.success'; // NO I18N
          }else if(module == "deptBulkAssocitae"){ // NO I18N
            messgeKey = "sdp.admin.requester.bulkaction.dept.success"; // NO I18N
          }
          parent.showMessageAndClose("",1);
          showalert("success",translate(messgeKey), "isAutoHide=true"); // No I18N
          userList.getTableObject().refreshTable("refresh"); // No I18N
          return true;
      }else if( module == 'CheckLogin' ){  // No I18N
        parent.showMessageAndClose("", 1);
      }else if(module == "show_login_details"){ // No I18N
        parent.showMessageAndClose("", 1); // No I18N
        userAdd.enableLoginTech();
      } else if (module == 'userDeleteHandler') { // NO I18N
        handleAjaxResponseForRequesterDelete(requestObj, module, document.SearchUserForm);
      } else if(module=='userMerge' || module=='userMergeSubmit' || module=='userMergeUserDataSubmit' || module=='userMergeRedirect' || module=='userMergeRedirect' || module=='fetchUserMergeListView' || module=='userMergeSubmitListView' || module=='userMergeUserDataSubmitListView'){ // NO I18N
        handleUserMergeAjaxResponse(requestObj, module);
      } else if (module == 'userAnonymizationHandler') { // NO I18N
        handleAjaxResponseForUserAnonymization(requestObj, module, document.SearchUserForm);
      }
}

function ajaxRequestOnFailure(requestObj, module)
{   
    var msgKey = ""; // NO I18N
    parent.showMessageAndClose("", 1); // NO I18N
    if(module == 'show_login_details'){ // NO I18N
      jQuery('#provideLogin').prop('checked', false); // NO I18N
      msgKey = "sdp.admin.technician.error.logincountexceeds"; // NO I18N
      if(userAdd.changeTo === "change_as_technician"){ // NO I18N
        msgKey = "license.violation.convertTech"; // NO I18N
      }
    }else{
      msgKey = requestObj.responseText;
    }
    showalert("failure",translate(msgKey),"isAutoHide=true"); // NO I18N
    if(module === "CheckLogin"){
      jQuery("#login_name").val("").trigger('focus');
    }
}

var userConfiguredFields = [];

function showUserFieldsPopUp(divContentId, inputBoxId, availableFields) {
    jQuery("#" + divContentId).show();
    var forRestrictedInputData = '{"for":"' + inputBoxId + '"}'; // No I18N
    return sdpAjax({
        url: "/api/v3/technicians/metainfo?input_data=" + encodeURIComponent(forRestrictedInputData), //NO I18N
        type: "GET", // No I18N
        success: function(resp) {
            var tempAllFields = [];
            resp.metainfo.fields.forEach(function(field) {
                var id = field.id;
                var text = field.display_name;
                var jObj = { "text": text, "id": id }; // No I18N
                tempAllFields.push(jObj);
            });
            tempAllFields = tempAllFields.filter(function(input) { return input.text != undefined });

            if (inputBoxId == 'userRestrictedFields') {
                userConfiguredFields[0] = tempAllFields;
            } else {
                userConfiguredFields[1] = tempAllFields;
            }
            initUserConfigurableFields(inputBoxId);
        },
        error: function(resp) {
            if (inputBoxId == 'userRestrictedFields') {
                userConfiguredFields[0] = availableFields;
            } else {
                userConfiguredFields[1] = availableFields;
            }
            initUserConfigurableFields(inputBoxId);
        }
    });
};

function closeUserFieldPopUp(divContentId) {
    jQuery("#" + divContentId).hide();
};

function initUserConfigurableFields(inputBoxId) {
    var tempAllFields;
    if (inputBoxId == 'userRestrictedFields') {
        tempAllFields = userConfiguredFields[0];
    } else {
        tempAllFields = userConfiguredFields[1];
    }
    jQuery("#" + inputBoxId).select2({
        "data": tempAllFields, // NO I18N
        "width": "400px", // NO I18N
        "multiple": true, // NO I18N
        "closeOnSelect": false //No I18N
    });
};

function openUserFieldPopup(inputBoxId, titleName) {
    var tempAllFields;
    if (inputBoxId == 'userRestrictedFields') {
        tempAllFields = userConfiguredFields[0];
    } else {
        tempAllFields = userConfiguredFields[1];
    }
    jQuery("#" + inputBoxId).select2("data") // NO I18N
    var options = {
        allowed_values: tempAllFields.map(function(field) { return { name: field.text, id: field.id } }),
        selected_values: jQuery("#" + inputBoxId).select2("data").map(function(data){return data.id}), // NO I18N
        dialogtitle: translate(titleName),
        saveCallBack: function(selection) {
            var userReturnState = tempAllFields.filter(function(input) { return selection.selectedIds.includes(input.id) }).map(function(field) { return { text: field.text, id: field.id } });
            jQuery("#" + inputBoxId).select2("data", userReturnState); // NO I18N
        }
    };

    new BulkAssociationComponent(options);
};


function switchUserFieldRestrictionType(divContentId, inputBoxId, inDBFields, allUserFields) {
    var currentValues = jQuery('#' + inputBoxId).val().split(',');
    var currentValueSelect2 = [];
    var returnState = inDBFields.map(function(field) { return { text: field.name, id: field.id } });
    showUserFieldsPopUp(divContentId, inputBoxId, returnState).then(function() {

        var allowedFieldsToDisplayName = {};

        allUserFields.map(function(field) {
            allowedFieldsToDisplayName[field.id] = field.text;
        });

        if (jQuery('#' + inputBoxId).val().length !== 0) {
            currentValues.forEach(function(currentValue) {
                var id = currentValue;
                var text;
                if (!allowedFieldsToDisplayName.hasOwnProperty(currentValue)) {
                    text = '(' + translate("sdp.settings.user.restriction.deleted.fields") + ')';
                } else {
                    text = allowedFieldsToDisplayName[currentValue];
                }
                var jObj = { "text": text, "id": id }; // No I18N
                currentValueSelect2.push(jObj);
            });
        }

        jQuery('#' + inputBoxId).select2('data', currentValueSelect2); // No I18N
    });
};
