var $Office365 = (function()
{
     var domainId = null, 
         usersFilterId = null, 
         accountId = null, 
         tableObj = {},
         store_criteria={},
         o365Obj = {},
         currentAccountData = "";
     //function call while load 
     o365Obj.onLoad = function(){  
          //check if tenant account already personalized or not
          var hasO365Acc = jQuery.isEmptyObject(sdp_user.CLIENT_CONF.o365_accounts) ? false : true;//NO I18N
               if(hasO365Acc){
                    accountId = sdp_user.CLIENT_CONF.o365_accounts.id;
                    currentAccountData = accountId ? $Office365.ajaxFun('o365_accounts',accountId,'o365_account') : null;//NO I18N 
                    //if we delete personalize tenant account in office 365 then we again call account and put default
                    if(!currentAccountData || currentAccountData.length==0){
                         accountId = $Office365.getDefaultAccount();
                    }
               }else{
                   accountId = $Office365.getDefaultAccount();
               }
               //compile basic template using renderhbs function
               renderhbs("#Right-Section","office365-account-template",{isSdAdmin:checkUserRole('SDAdmin'),isAccountEmpty:accountId ? false : true,accountData:currentAccountData});//NO I18N
               //if atleast one account is present then only trigger all events and functions
               if(accountId){
                    //render subscription tab as default while load
                    var select2DefaultVal = {id:currentAccountData.id,text:currentAccountData.tenant_name};
                    renderhbs("#tab_365_subs","office365-subscription-template");//NO I18N
                    $Office365.renderBasicInputs();//render delete, search icons and listview section
                    $Office365.select2ForAccount('o365_accounts','o365_accounts',select2DefaultVal);//NO I18N
                    $Office365.onclickEvents();
                    $Office365.onchangeEvents();
                    $Office365.goToSubscriptionTab(accountId);//initiate subscription tab
               }
               o365Obj.urlRenderFunction();
               if(currentAccountData && currentAccountData.status.id=='2' && currentAccountData.status.name=="In Progress") {
                    jQuery('#sync_now').button('loading');
                    jQuery('#sync_now').attr("disabled", true);
               }else{
                    jQuery('#sync_now').button('reset');
               }
               jQuery(window).on('popstate', function(event) {
                    o365Obj.urlRenderFunction();
               });
     };
     //ajax function to get data based on url 
     o365Obj.ajaxFun=function(url,moduleid,entityName,inputData){
          if(inputData && inputData.list_info && inputData.list_info.has_more_rows){
               delete inputData.list_info.has_more_rows;
          }
          var getModules=[];        
          var moduleName = url;
          var url = moduleid ? moduleName+'/'+moduleid : moduleName;
               sdpAjax({
                    url    :'/api/v3/'+url, //NO I18N
                    cache  : false,
                    ignorefailuremessage : true,
                    async  : false,
                    data   :sdpAjaxInputData(inputData),
                    success: function(response){    
                         getModules= entityName ? response[entityName] : response[moduleName];
                    }
               });
               return getModules;
     };
     o365Obj.getDefaultAccount=function(){
          //if personalized tenant is not present put default tenant account while load or refresh page
          currentAccountData = $Office365.ajaxFun('o365_accounts',null,null,{list_info:{row_count:1}})[0];//NO I18N
          if(currentAccountData && currentAccountData.id){
               addPersonalization('o365_accounts',currentAccountData.id);//NO I18N
               return currentAccountData.id;
          }else{
               //clear personalisation if all accounts are removed
               addPersonalization('o365_accounts',{});//NO I18N
          }
     };
     o365Obj.renderBasicInputs=function(forpopup){
          var parentElement = jQuery('#Right-Section'), tableViewJson = [];
          var currentTab = parentElement.find('#office-nav-sdtabs .active>a').attr('data-tab');
               if(forpopup){
                    tableViewJson.push({"parentId": "list_usersFilters","tableHolder":"availUsers","domainDropdown":true, "userSiteDropdown": true});
               }else if(currentTab=="Subscriptions"){//NO I18N
                    tableViewJson.push({"parentId": "list_Subscriptions","tableHolder":"subscriptions"});
               }else if(currentTab=="Users"){//NO I18N
                    tableViewJson.push({"parentId": "list_Users","tableHolder":"users","domainDropdown":true,"LicenUnlicenDropdown":true, "userSiteDropdown": true});//NO I18N
               }    
                    //create delete icon, column chooser, filter dropdowns, search icon and listview div common for all tabs based on json it renders
                    for(var i=0;i<tableViewJson.length;i++){
                         var tableHolder = tableViewJson[i].tableHolder;
                        
                         var userDomainFilter = tableViewJson[i].domainDropdown ? '<input style="width:200px" id="'+tableHolder+'DomFilter" type="text" class="mr10 form-control text-wrap"/>' : ''; 
                         var LicenUnlicenFilter = tableViewJson[i].LicenUnlicenDropdown ? '<input style="width:180px" id="'+tableHolder+'Filter" type="text" class="mr10 form-control"/>' : ''; 
                         var userLoggedSiteFilter = tableViewJson[i].userSiteDropdown ? '<input style="width:180px" id="'+tableHolder+'LoggedSiteFilter" type="text" class="mr10 form-control"/>' : ''; 
                              parentElement.find('#'+tableViewJson[i].parentId).append('<div id="listcontrols" class="listcontrols mt10 pt5 pb5">'+userDomainFilter+LicenUnlicenFilter+userLoggedSiteFilter+'<div class="btn-group mr10"><div class="fl" id="t_searchicon_'+tableHolder+'"></div><div class="fl" id="t_column_choos_'+tableHolder+'"></div><div class="fl" id="pagination_comp_'+tableHolder+'"></div></div><div class="listview p0 office-listview mt10 mb20 brdtop0" id="parent_'+tableHolder+'"><div class="tablelist tlfixed-div" id="'+tableHolder+'_div"></div></div>');
                    }
     };
     //used to render subscription column in subscription table list view
     o365Obj.subscriptionDataCell = function(tableData){
          if(tableData.row_data.o365_license_sku){
               var services_count = tableData.row_data.license_services_count>0 ? '<div class="pt10 text-muted" title="'+translate("common.o365.tenant.view.license.services")+'"> '+ translate('common.o365.tenant.license.services') + ': <span class="text-link cur-ptr" id="license_'+tableData.row_data.id+'" data-id="license_'+tableData.row_data.id+'" data-press="servicecount" showpopover="true" closeon-esckey="yes" closeon-bodyclick="yes" data-target-id="#license_list_'+tableData.row_data.id+'">' + parseInt(tableData.row_data.license_services_count)+'</span></div>' : '';

               var splitServices = tableData.row_data.license_services.split(','),serviceContent='';
                    for(var i=0;i<splitServices.length;i++){
                          serviceContent  += '<span class="text-ellipsis disp-b p5" title="'+e_attr(splitServices[i])+'">'+e_html(splitServices[i])+'</span>';
                    }
                    return '<span class="text-overflow" title="'+e_attr(tableData.row_data.o365_license_sku.display_name)+'" rel="uitip">'+e_html(tableData.row_data.o365_license_sku.display_name)+'</span>'+services_count+'<div id="license_list_'+tableData.row_data.id+'" class="hide"><div class="text-wrap p10 oya" style="max-height: 350px;">'+serviceContent+'</div></div>';
          }    
          return '-';
     };
     //used to render service count column in users table list view
     o365Obj.servicesDataCell = function(tableData){
          //create popover with table while click services count in users tab
          if(tableData.row_data.user_services_count && tableData.row_data.user_services_count>0){
               return '<span class="cur-ptr text-link" id="services_'+tableData.row_data.id+'" data-id="services_'+tableData.row_data.id+'" showpopover="true" closeon-esckey="yes" closeon-bodyclick="yes" data-target-id="#service_list_'+tableData.row_data.id+'" data-press="servicecount2" data-serviceid='+tableData.row_data.id+' data-servicescount='+tableData.row_data.user_services_count+' >'+tableData.row_data.user_services_count+' '+translate('common.services')+'</span>';
          }
          return '-';
     };
     //used to render assigned/consumed column in subscriptions table list view
     o365Obj.assignedDataCell = function(tableData){
          if(tableData.row_data.consumed_units){
               return '<a class="cur-ptr font-normal" data-press="consumedunits" data-rowid='+ tableData.row_data.id +' id="assigned_'+tableData.row_data.id+'" data-id="assigned_'+tableData.row_data.id+'" data-name='+e_attr(tableData.row_data.o365_license_sku.sku_name)+' data-heading="'+e_attr(tableData.row_data.o365_license_sku.display_name)+'">'+tableData.row_data.consumed_units+'</a>';
          }
          return '-';
     };
     //rowdata construct function for construct table component
     o365Obj.rowDataConstruct=function(tableData,options){
          var inputObject = {};
          if(tableData.options)
          {
                options = tableData.options;
          }
          if (options.isFR_ListInfo_Support && tableData.list_info.fields_required != undefined) {
                           tableData.fields_required = tableData.list_info.fields_required;
                           delete tableData.list_info.fields_required;
                       }
          var fieldsRequired = tableData.fields_required ? Object.keys(tableData.fields_required) : [];
          inputObject.fields_required = fieldsRequired;
          inputObject.list_info = tableData.list_info;
          tableData.options = options;
          return inputObject;
     };
     //construct table component for users/subscriptions list view
     o365Obj.constructTableComponent = function(fields_required,header,addloptions,seachCriteria){
          
          var tablePersoDataLen = sdp_user.CLIENT_CONF[addloptions.personlizedKey] && Object.keys(sdp_user.CLIENT_CONF[addloptions.personlizedKey]).length>0
          if(tablePersoDataLen){
               var table_info = table_comp.getTableInfo(addloptions.personlizedKey);
          }else{
               var table_info = {list_info: {row_count: 25, start_index: 1}}
          }
          var fieldLen = table_info && table_info.fields_required && (Object.keys(table_info.fields_required).length===0)
          if(!table_info.fields_required || fieldLen){
               table_info.list_info.fields_required=fields_required;
          }
          
          
          var options = {
               tableHolder                 : addloptions.tableHolder,
               row_inputdata               : $Office365.rowDataConstruct(table_info,{ "isFR_ListInfo_Support": true }),//NO I18N
               getmetaInfo                 : true,
               isODAPI	                  : true,
               callbackURL                 : addloptions.url,
               entity_name                 : addloptions.entity_name,
               metainfo_entity             : addloptions.url,
               paginationEnabled           : addloptions.paginationEnabled,
               searchEnabled               : addloptions.searchEnabled,
               sortingEnabled              : addloptions.sortingEnabled,
               columnChooserEnabled        : addloptions.columnChooserEnabled,
               personalize_key             : addloptions.personlizedKey,
               callbackRowfunction         : $Office365.rowDataConstruct,
               discard_without_displayname : addloptions.discard_without_displayname,
               width                       : jQuery(window).width() - 320,
               staticHeader                : true,
               width                       : jQuery('#Right-Section').width() - 25,
               isFR_ListInfo_Support: true
          };
          if(addloptions.callbackSearchFunction){
               options.callbackSearchFunction = addloptions.callbackSearchFunction
          }
          
          seachCriteria ? (options.row_inputdata.list_info["search_criteria"] = seachCriteria.search_criteria) : null;
          var getValData = options.row_inputdata;
          if(getValData && getValData.list_info && getValData.list_info.has_more_rows || getValData && getValData.list_info && getValData.list_info.total_count){
               delete getValData.list_info.total_count;
               delete getValData.list_info.has_more_rows;

          }
          return accountId ? new tableComponent(table_info, {"header":header},options,null) : null;//NO I18N
     };
     //search call back function trigger for users whenever change filters and search text
     o365Obj.searchCallBack=function(tabSearch,val,tableData){
          var crit_Obj = {}, critChildArray = [];
          var searchEntity = tableData.t_obj.options.entity_name;
          var search_Obj = tableObj[searchEntity].t_obj.table_info.list_info.search_fields;
          var metainfo = tableObj[searchEntity].t_obj.meta_info;
               jQuery.each(search_Obj,function(key,value){
                    var condition = "contains"; // No I18N
                    //as discussed with server team change key based on users in admin
                    if(key=="user.department"){// No I18N
                         key="user.department.name";// No I18N
                    }
                    if(metainfo[key] && (metainfo[key].type === "long" ||  metainfo[key].type === "int")){ // No I18N
                         condition = "is"; // No I18N
                    }
                    critChildArray.push({
                         "field"            : key, // No I18N
                         "value"            : value, // No I18N
                         "condition"        : condition, // No I18N
                         "logical_operator" : "AND" // No I18N
                    });
               });
               if(store_criteria && store_criteria.search_criteria){
                    store_criteria.search_criteria.logical_operator = "AND";//NO I18N
                    critChildArray = critChildArray.concat(store_criteria.search_criteria);
               }
               delete tableObj[searchEntity].t_obj.table_info.list_info.search_fields;
               tableObj[searchEntity].t_obj.table_info.list_info.search_criteria = critChildArray;
               tableObj[searchEntity].refreshTable(); // No I18N
     };
     //popover events for both licenses in subscriptions and license service table inside users listview
     o365Obj.popoverEvents = function(popName,tdId,tdUserCount,event){
          showPopover(event,"click");//NO I18N
          if(popName == "service"){
               var contentServices = $Office365.ajaxFun('o365_users/'+Number(tdId)+'/_fetch_user_licenses_services_data',null,"fetch_user_licenses_services_data");//NO I18N
               var serviceName = '', serviceObjKeys = Object.keys(contentServices);
                    for(var i=0;i<serviceObjKeys.length;i++){
                         var licenseName = ''; 
                         for(var j=0;j<contentServices[serviceObjKeys[i]].length;j++){
                              licenseName += '<div class=mb5>'+e_html(contentServices[serviceObjKeys[i]][j])+'</div>';
                         }
                         serviceName += "<div class='row pb5'><div class='col-xs-6'><div class='mb5'>"+e_html(serviceObjKeys[i])+"</div></div><div class='col-xs-6'>"+licenseName+"</div></div>";
                    }
                    jQuery("#showPopover .popover-inner").html('<div id="service_list_'+tdId+'"><div style="max-height:300px;overflow:auto;" id="servicePopover"><div class="block-grid"><div class="row pb5"><div class="col-xs-6 sb"><div>'+translate("sdp.inventory.allocateswlicence.licensename")+'</div></div><div class="col-xs-6 sb"><div>'+translate("sdp.itil.common.service.item")+'</div></div></div>'+serviceName+'</div></div></div>');
                    jQuery('#showPopover').css({"min-width":"550px"}).find('.popover-inner').addClass('b10').css({"width":"100%"});//NO I18N
                    
          }else{
               jQuery('#showPopover').css({"min-width":""});//NO I18N
          }
     };
     //It contains all click events used in office365 page
     o365Obj.assignedDialogOpen = function(assignedId){
          // <-- create the dialog event to show users list view in dialog box while clicking assigned units in subscriptions in list view
          renderhbs("#popupDiv","office365-user-popup-template");//NO I18N
          if(assignedId){
               var dialog = jQuery('#consumedPopup');
               var searchCriteria = {
                    "search_criteria": {//NO I18N
                         "field": "o365_user_license.o365_account_license_detail.id",//NO I18N
                         "condition": "EQ",//NO I18N
                         "value":assignedId//NO I18N
                    }
               };//NO I18N
                    store_criteria=searchCriteria;
                    //gotousers tab because it has same functionality like users
                    $Office365.renderBasicInputs(true);
                    $Office365.goToUsersTab(accountId,searchCriteria,true,true);
                    //open users content in dialog box
                    dialog.dialog({ title:translate('ae.asset.o365.dashboard.assigned')+' - '+e_html(jQuery('#assigned_'+assignedId).attr('data-heading')),width: 1100, maxHeight:650, resizable: true, autoOpen: false, modal: true, closeOnEscape : true,close:function( event, ui ) {
                         jQuery(this).dialog('destroy').remove();//NO I18N
                     }});
                    //open users content in dialog box
                    dialog.dialog('open').attr('data-id',assignedId);//NO I18N
                    
                    jQuery('#availUsers_div').css({"width":"1068px","height":"380px"})//NO I18N
                    jQuery("div[aria-describedby=consumedPopup] .ui-dialog-titlebar-close").attr("title",translate("sdp.common.close"));
                    //give filer for users popup
                    $Office365.select2DomainUser("o365_accounts/"+accountId+"/domains","domains",accountId);//NO I18N
                    jQuery('#availUsersDomFilter').trigger('focus')
                    $Office365.select2UserSites();
          }
     };
     //onchange events for accounts in dropdown it loads account data based on id generated while change dropdown
     o365Obj.onchangeForAccount = function(){
          
          var parentElement = jQuery('#Right-Section');
          var select2Data = parentElement.find("#accountFilter").select2('data');//NO I18N
               addPersonalization('o365_accounts',{id: parseInt(select2Data.id)});//NO I18N
               jQuery('#s2id_accountFilter').attr('title',select2Data.text);
               accountId = select2Data ? select2Data.id : null;//NO I18N
               currentAccountData = accountId ? $Office365.ajaxFun('o365_accounts',accountId,'o365_account') : null;//NO I18N
               currentAccountData ? parentElement.find('#lastSyncDiv,#sync_now').show().end().find('#lastSyncTime').html(e_html(currentAccountData.last_sync_time ? currentAccountData.last_sync_time.display_value : '-')) : jQuery('#lastSyncDiv,#sync_now').hide();
               if(currentAccountData && currentAccountData.status.id=='2' && currentAccountData.status.name=="In Progress") {
                    jQuery('#sync_now').button('loading');
                    jQuery('#sync_now').attr("disabled", true);
               }else{
                    jQuery('#sync_now').button('reset');
               }
               $Office365.switchToTab(accountId);
               
     };
     //search criteria for domains in both users and popup users
     o365Obj.DomainsUserFilterCriteria = function(searchCriteria,usersFilterId,domainId,siteId){
          if(usersFilterId != null && usersFilterId != undefined){
               searchCriteria = {
                    "search_criteria": [{ //NO I18N
                         "field": "is_licensed", "condition": "IS", "value": usersFilterId, "logical_operator": "AND"}]//NO I18N
               };//NO I18N
          }
          if(domainId){
               if(!searchCriteria){
                    searchCriteria = {"search_criteria": [{ "field": "o365_account_domain.id", "condition": "IS", "value": domainId ,"logical_operator": "AND"}]};//NO I18N
               }else{
                    searchCriteria.search_criteria.push({ "field": "o365_account_domain.id", "condition": "EQ", "value": domainId , "logical_operator": "AND"})//NO I18N
               }
          }
          if(siteId)
          {
               var departSite = null;
               var condition = "EQ";//NO I18N
               if(siteId==-1){
                    var siteField = "user.department"//NO I18N
                    siteId = null;
                    condition = "IS";//NO I18N
                    departSite = {"field":"user.department.site","condition":"IS","value":null,"logical_operator":"OR"};//NO I18N
               }else{
                    var siteField = "user.department.site.id"//NO I18N
               }
               if(!searchCriteria){
                    if(departSite){
                         searchCriteria = {"search_criteria": [{ "field": siteField, "condition": condition, "value": siteId,"logical_operator": "AND",children:[departSite]}]};//NO I18N
                    }else{
                         searchCriteria = {"search_criteria": [{ "field": siteField, "condition": condition, "value": siteId,"logical_operator": "AND"}]};//NO I18N
                    }
               }
               else{
                    if(departSite){
                         searchCriteria.search_criteria.push({"field": siteField, "condition": condition, "value": siteId, "logical_operator": "AND",children:[departSite] });//NO I18N
                         
                    }else{
                         searchCriteria.search_criteria.push({"field": siteField, "condition": condition, "value": siteId, "logical_operator": "AND" });//NO I18N
                    }
               }
          }
          return searchCriteria;
     }
     //function for onchange events 
     o365Obj.onchangeEvents=function(){
          var parentElement = jQuery('#Right-Section');
          //tenant account select2/dropdown onchange function
          parentElement.find('#accountFilter').on("change",function(){
               $Office365.onchangeForAccount();
          });
          //user filter select2/dropdown onchange function for users
          parentElement.on("change",'#usersFilter',function(event,option){
               
               var currentEle = jQuery(this).attr('id'), urlStr = "";
               var consumedId = jQuery('#consumedPopup').attr('data-id'), searchCriteria = null;
               usersFilterId = jQuery("#"+currentEle).select2('data') ? jQuery("#"+currentEle).select2('data').id : null;
               domainId = jQuery("#usersDomFilter").select2('data') ? jQuery("#usersDomFilter").select2('data').id : null;//NO I18N
               siteId = jQuery("#usersLoggedSiteFilter").val() ? jQuery("#usersLoggedSiteFilter").val() : jQuery("#availUsersLoggedSiteFilter").val() ? jQuery("#availUsersLoggedSiteFilter").val() : null;
               var queryString = window.location.search, urlParams = new URLSearchParams(queryString);
                    jQuery('#s2id_usersFilter').attr('title',jQuery("#"+currentEle).select2('data') && jQuery("#"+currentEle).select2('data').text); 
                    if(option){
                         jQuery("#usersFilter").select2("data","");//NO I18N
                         jQuery("#usersDomFilter").select2("data","");//NO I18N
                         usersFilterId = null;
                         domainId = null;
                         if(option.user_filter && (decodeURIComponent(option.user_filter)=="Licensed Users")){
                              usersFilterId = true;
                              jQuery("#usersFilter").select2("data",{id:usersFilterId,text:translate('common.o365.users.licensed')});//NO I18N
                              option.user_filter && jQuery('#s2id_usersFilter').attr('title',translate('common.o365.users.licensed'));
                         }else if(option.user_filter && (decodeURIComponent(option.user_filter)!="Licensed Users")){//NO I18N
                              usersFilterId = false;
                              jQuery("#usersFilter").select2("data",{id:usersFilterId,text:translate('common.o365.users.unlicensed')});//NO I18N
                              option.user_filter && jQuery('#s2id_usersFilter').attr('title',translate('common.o365.users.unlicensed'));
                         } 
                         if(option.domain_filter){
                              domainId = option.domain_value;
                              jQuery("#usersDomFilter").select2("data",{id:domainId,text:decodeURIComponent(option.domain_filter)});//NO I18N
                              option.domain_filter && jQuery('#s2id_usersDomFilter').attr('title',option.domain_filter);
                              
                         }
                         if(option.site_filter){
                              jQuery("#usersLoggedSiteFilter").select2("data",{id:option.site_value,text:decodeURIComponent(option.site_filter)});//NO I18N
                              siteId = option.site_value;
                              option.site_filter && jQuery('#s2id_usersLoggedSiteFilter').attr('title',option.site_filter);
                         }
                    }                 
                    else if(!option){
                         var userEle = jQuery("#usersFilter").select2('data');//NO I18N
                         urlString = o365Obj.parameterIncludeInUrl("user_name",null,userEle);//NO I18N
                         window.history.pushState({ path: urlString }, '', urlString);
                    }
                    
                    searchCriteria = $Office365.DomainsUserFilterCriteria(searchCriteria,usersFilterId,domainId,siteId);
                    store_criteria=searchCriteria;
                    $Office365.goToUsersTab(accountId,searchCriteria,false,true);   
          });
          //domain filter select2/dropdown onchange function for both subscriptions assigned popup and users

          jQuery(document).on("change",'#list_Users #usersDomFilter,#list_usersFilters #availUsersDomFilter, #usersLoggedSiteFilter, #availUsersLoggedSiteFilter',function(event,option){
               var currentEle = jQuery(this).attr('id');
               var consumedId = jQuery('#consumedPopup').attr('data-id'), searchCriteria = null;
               
                    usersFilterId = jQuery("#usersFilter").select2('data') ? jQuery("#usersFilter").select2('data').id : null;//NO I18N
                    domainId = jQuery("#usersDomFilter").val() ? jQuery("#usersDomFilter").val() : jQuery("#availUsersDomFilter").val() ? jQuery("#availUsersDomFilter").val() : null;
                    siteId = jQuery("#usersLoggedSiteFilter").val() ? jQuery("#usersLoggedSiteFilter").val() : jQuery("#availUsersLoggedSiteFilter").val() ? jQuery("#availUsersLoggedSiteFilter").val() : null;
                    jQuery('#s2id_'+currentEle).attr('title',jQuery("#"+currentEle).select2('data') && jQuery("#"+currentEle).select2('data').text);
                    if(!option && (currentEle=="usersDomFilter") || (currentEle=="usersLoggedSiteFilter")){
                         if(currentEle=="usersDomFilter"){
                              var domEle = jQuery("#usersDomFilter").select2('data');//NO I18N
                              urlString = o365Obj.parameterIncludeInUrl("domain_name","domain_id",domEle);   //NO I18N
                         }
                         if(currentEle=="usersLoggedSiteFilter"){
                              var siteEle = jQuery("#usersLoggedSiteFilter").select2('data');//NO I18N
                              urlString = o365Obj.parameterIncludeInUrl("site_name","site_id",siteEle);//NO I18N
                                   
                         }
                         urlStr = window.history.pushState({ path: urlString }, '', urlString);
                    }
                    //execute while onchange inside license popup
                    if (currentEle == "availUsersDomFilter" || currentEle == "availUsersLoggedSiteFilter") {
                         searchCriteria = { 
                              "search_criteria": [{ //NO I18N
                                   "field": "o365_user_license.o365_account_license_detail.id", "condition": "EQ", "value": consumedId,"logical_operator": "AND"}] //NO I18N
                              
                              };//NO I18N 
                         if(domainId){
                              searchCriteria.search_criteria.push({"field": "o365_account_domain.id", "condition": "EQ", "value": domainId, "logical_operator": "AND" });//NO I18N
                         }
                         if(siteId){
                              var condition = "EQ";//NO I18N
                              var departSite = null;
                              if(siteId==-1){
                                   var siteField = "user.department"//NO I18N
                                   siteId = null;
                                   condition = "IS";//NO I18N
                                   departSite = {"field": "user.department.site", "condition": "IS", "value": null, "logical_operator": "OR" };//NO I18N
                              }else{
                                   var siteField = "user.department.site.id"//NO I18N
                              }
                              
                              if(departSite){
                                   searchCriteria.search_criteria.push({"field": siteField, "condition": condition, "value": siteId, "logical_operator": "AND" ,children:[departSite]});//NO I18N
                              }else{
                                   searchCriteria.search_criteria.push({"field": siteField, "condition": condition, "value": siteId, "logical_operator": "AND" });//NO I18N
                              }
                         }

                    }
                    //execute inside users tab
                    else{
                         searchCriteria = $Office365.DomainsUserFilterCriteria(searchCriteria,usersFilterId,domainId,siteId);
                    }
                    
                    store_criteria=searchCriteria;
               $Office365.goToUsersTab(accountId,searchCriteria,(currentEle=="availUsersDomFilter") ? true : (currentEle=="availUsersLoggedSiteFilter") ? true : null,true);//NO I18N
                    
          });
     };
     o365Obj.parameterIncludeInUrl=function(aname,aid,aele){
          var urlStr = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
          var queryString = window.location.search, urlParams = new URLSearchParams(queryString);
          if(urlParams.get(aname)){
               if(aele){
                    urlStr = urlStr.replace("&"+aname+"="+encodeURIComponent(urlParams.get(aname)),"&"+aname+"="+aele.text).replace("&"+aname+"="+(urlParams.get(aname)),"&"+aname+"="+aele.text);
                    if(aid){
                         urlStr = urlStr.replace("&"+aid+"="+urlParams.get(aid),"&"+aid+"="+Number(aele.id))
                    }
               }else{
                    if(aid){
                         urlStr = urlStr.replace("&"+aid+"="+urlParams.get(aid),"")
                    }
                    urlStr = urlStr.replace("&"+aname+"="+encodeURIComponent(urlParams.get(aname)),"")
               }
          }else{
               urlStr += "&"+aname+"="+aele.text;
               if(aid){
                    urlStr += "&"+aid+"="+aele.id
               }
          }
          return urlStr;
     };
     //function execute while load tenants in office365 dropdown 
     o365Obj.select2ForAccount = function(url,entityName,defaultVal){
          jQuery('#accountFilter').attr('title',defaultVal.text);
          jQuery("#accountFilter").sdp_select2({
               value: defaultVal,//NO I18N
               cache:{},
               multiple:false,
               placeholder: translate("common.o365.tenant.placeholder"), // No I18N
               value_path:'tenant_name',//NO I18N
               width : 180,
               url:[{
                    url:"/api/v3/o365_accounts",//NO I18N
                    field:'o365_accounts',//NO I18N
                    list_info:{fields_required:["id","tenant_name"]}//NO I18N
               }]
          });
     };
     //load domains and users in users tab filter dropdowns and popup in subscription tab assigned units
     o365Obj.select2DomainUser=function(url,entityName,accountId){
          jQuery('#usersDomFilter,#availUsersDomFilter').sdp_select2({
               value:"",
               cache:{},
               multiple:false,
               allowClear: true,
               sort:true,
               placeholder:translate('common.o365.domain.filter.placholder'),
               value_path:"domain.name",//NO I18N
               width : 180,
               dropdownCssClass: "text-wrap",//NO I18N
               url:[{
                    url:"/api/v3/"+url,//NO I18N
                    field:entityName,//NO I18N
                    list_info:{"sort_field":"domain.name","sort_order":"asc"}//NO I18N
               }],
               criteriaCallback: function(a, b, c){
                    var search_criteria = [];
                    search_criteria.push({ field: "domain.name", condition:'like', values:[a], logical_operator: "or" });
                    return search_criteria;
               },
          });
          var userFilter = [{"id":false,"text":translate("common.o365.users.unlicensed")}, {"id":true,"text":translate("common.o365.users.licensed")}];//NO I18N
          jQuery('#usersFilter').select2({data:userFilter,"placeholder":translate('common.user.filters'),allowClear:true,dropdownCssClass: "text-wrap"});  //NO I18N
     };

     //load user associated sites filter dropdowns on users list view
     o365Obj.select2UserSites=function(){
          if(sdp_app.IS_SITE_CONFIGURE){
               var siteUrl = "/api/v3/o365_users/user/department/site";//NO I18N
               jQuery('#usersLoggedSiteFilter,#availUsersLoggedSiteFilter').sdp_select2({
                    value:"",
                    cache:{},
                    multiple:false,
                    allowClear: true,
                    placeholder:translate('sdp.request.common.select.site'),
                    value_path:"site.name",//NO I18N
                    width : 180,
                    dropdownCssClass: "text-wrap",//NO I18N
                    url:[{
                         url:siteUrl,
                         field:"site",//NO I18N
                         list_info:{}
                    }]
               });
               jQuery('.siteInfo').html(translate('o365.assets.users.info')+""+translate('o365.assets.users.site.info'));
          } 
          else {
               jQuery('#usersLoggedSiteFilter,#availUsersLoggedSiteFilter').hide();
               jQuery('.siteInfo').html(translate('o365.assets.users.info'));
          }
     };

     //check for all tabs if data is empty then we show UI proto design for empty data
     o365Obj.checkTableIsEmptyOrNot = function(currentTab,tableComp,popOptions,filterClk,getGraphData){
          var parentElement = jQuery('#Right-Section');
          var tableListLength = tableComp ? Object.keys(tableComp.loadedRecords).length : getGraphData.length;
               if(tableListLength>0 || filterClk){
                    parentElement.find('#list_'+currentTab).show().end().find('.nodata-section,#loadingIcon').hide();
               }else{
                    !popOptions ? parentElement.find('#list_'+currentTab+',#loadingIcon').hide().end().find('.nodata-section').show() : null;
               }
     };
     //subscription tab table info
     o365Obj.goToSubscriptionTab = function(accountId){
          var fields_required = {"o365_license_sku":"","available_units":"","warning_units":"","active_units":"","consumed_units":"","suspended_units":""};//NO I18N
          //get difference b/w Subscription tab width and other column width as 570 and including padding 100
          var table_content = {
               "o365_license_sku":{//NO I18N
                    "default"          : true,//NO I18N
                    "value_path"       : "o365_license_sku.display_name",//NO I18N
                    "width"            : "300px",//NO I18N
                    dataCelltransformer: $Office365.subscriptionDataCell
               },
               "available_units":{//NO I18N
                    "default"  : true,//NO I18N
                    "td_class" : "success-bglight tr",//NO I18N
                   
               },
               "warning_units":{//NO I18N
                    "default"  : true,//NO I18N
                    "td_class" : "warning-bglight tr",//NO I18N
                    
               },
               "active_units":{//NO I18N
                    "default"  : true,//NO I18N
                    
                    "td_class" : "tr"//NO I18N
               },
               "consumed_units":{//NO I18N
                    dataCelltransformer : $Office365.assignedDataCell,//NO I18N
                    
                    "td_class"          : "tr"//NO I18N
               },
               "suspended_units":{//NO I18N
                    
                    "td_class": "tr"//NO I18N
               }
          }//NO I18N
          var options = {
               url               : 'o365_accounts/'+accountId+'/license_details',//NO I18N
               entity_name       : 'license_details',//NO I18N
               personlizedKey    : 'o365license_details',//NO I18N
               tableHolder       : "subscriptions",//NO I18N   
               paginationEnabled : true, 
               searchEnabled     : true,
               sortingEnabled    : true
          };//NO I18N
          var tableComp = $Office365.constructTableComponent(fields_required,table_content,options);
               tableObj[options.entity_name]=tableComp;
               $Office365.checkTableIsEmptyOrNot("Subscriptions",tableComp);  //NO I18N
               jQuery('#parent_subscriptions').css({"height":"435px"})//NO I18N
     };
     //users tab table info and popup inside subscriptions tab for both this function only trigger
     o365Obj.goToUsersTab = function(accountId,seachCriteria,popOptions,filterClk){
          var fields_required = {"user":"","user_principal_name":"","user_licenses":"","user_services_count":"","department":""};//NO I18N
          var navWid = jQuery('#office-nav-sdtabs').width();
          jQuery('#users_div').css({'width':navWid+"px","height":"435px"})//NO I18N
          
          var table_content = {
               "user":{//NO I18N
                    "default"    : true,//NO I18N
                    "value_path" : "user.name",//NO I18N
                    "text"       : translate("sdp.common.name"),//NO I18N
                    "width"      : "150px"//NO I18N
               },
               "user_principal_name":{//NO I18N
                    "width":"150px"//NO I18N
               },
               "user_services_count":{//NO I18N
                    dataCelltransformer : $Office365.servicesDataCell,//NO I18N
                    "width"             : "120px",//NO I18N
                    disableSearching    : true//NO I18N
               },
               "department":{//NO I18N
                    dataCelltransformer:$Office365.departmentDataCell,//NO I18N
                    "value_path"       :"user.department",//NO I18N
                    text               :translate("sdp.admin.requesterDef.deptName"),//NO I18N
                    "width"            :"125px"//NO I18N
               },
               "is_licensed":{//NO I18N
                    "width":"75px"//NO I18N
               },
               "object_id":{//NO I18N
                    "width":"75px"//NO I18N
               },
               "user_licenses":{//NO I18N
                    //"width":calLicenseWid+"px"//NO I18N
               }
          };//NO I18N
          var options = {
               url                        : 'o365_accounts/'+accountId+'/users',//NO I18N
               entity_name                : 'users',//NO I18N
               personlizedKey             : 'office365users',//NO I18N
               tableHolder                : "users",//NO I18N
               paginationEnabled          : true, 
               searchEnabled              : true,
               sortingEnabled             : true, 
               columnChooserEnabled       : true,
               callbackSearchFunction     : $Office365.searchCallBack,
               discard_without_displayname: true
          };//NO I18N
               if(popOptions){
                    options.url = 'o365_users';//NO I18N
                    options.entity_name = 'o365_users';//NO I18N
                    options.personlizedKey = 'o365_users';//NO I18N
                    options.tableHolder = "availUsers";//NO I18N
               }    
          var tableComp = $Office365.constructTableComponent(fields_required,table_content,options,seachCriteria);
               tableObj[options.entity_name]=tableComp;
               $Office365.checkTableIsEmptyOrNot(popOptions ? "usersFilters" : "Users",tableComp,popOptions,filterClk);//NO I18N
               jQuery('#availUsers_div').css({"width":"1068px","height":"380px"})//NO I18N
     }
     //navigation function - render listview table/graph based on navigation tabs
     o365Obj.switchToTab = function(accountId,seachCriteria,currTab,popOptions,FilterClk,currUrl){
          
          var parentElement = jQuery('#Right-Section'), urlStr = "";
          urlStr = window.location.protocol + "//" + window.location.host + window.location.pathname;    
          
          var currentTab = currTab || parentElement.find('#office-nav-sdtabs .active>a').attr('data-tab');
               if(currentTab=="Subscriptions"){
                    renderhbs("#tab_365_subs","office365-subscription-template");//NO I18N
                    o365Obj.renderBasicInputs();
                    $Office365.goToSubscriptionTab(accountId);
                    urlStr += "?list=Subscriptions";//NO I18N
               }
               else if(currentTab=="Users"){
                    renderhbs("#tab_365_users","office365-user-template");//NO I18N
                    o365Obj.renderBasicInputs();
                    $Office365.select2UserSites();
                    $Office365.goToUsersTab(accountId,seachCriteria,popOptions);
                    $Office365.select2DomainUser("o365_accounts/"+accountId+"/domains","domains",accountId);//NO I18N
                    urlStr += "?list=Users";//NO I18N
               }
               else if(currentTab=="licenses"){
                    var fetchGraph = $Office365.ajaxFun('o365_accounts/'+Number(accountId)+'/_fetch_graphdata',null,'fetch_graphdata');//NO I18N
                         renderhbs("#tab_365_license","office365-graph-template");//NO I18N
                         jQuery('#chart-container').html('').css('height',fetchGraph.length * 50);
                         setTimeout(function(){
                              (fetchGraph.length>0) ? $Office365.drawLicenseGraph(fetchGraph) : null;
                         },200);
                         $Office365.checkTableIsEmptyOrNot(currentTab,null,null,null,fetchGraph);
                         urlStr += "?list=licenses";//NO I18N
               }
               if(!currUrl){
                    window.history.pushState({ path: urlStr }, '', urlStr);
               }
     };
     //all onclick events in a single function
     o365Obj.onclickEvents = function(){
          var parentElement = jQuery('#Right-Section'), msg="";
               //click function for tabs
               parentElement.find('#office-nav-sdtabs li').click(function(event,option){   
                    setTimeout(function(){
                         $Office365.switchToTab(accountId,null,null,null,null,option);
                    },1)
                    jQuery('.ui-dialog .ui-dialog-titlebar-close').trigger("click");
               });
               //sync now button function
               parentElement.find('#sync_now').click(function(){
                    sdpAjax({
                         url:"/api/v3/o365_accounts/"+Number(accountId)+"/_sync_now",//NO I18N
                         type:"PUT",//NO I18N
                         success:function(response){
                              //msg.button('reset');//Hide loading image
                         },
                         error:function(response){
                              response = response.responseJSON.response_status;
                              if (response.status !== "success") {
                                   var message = (response.messages && response.messages[0] && response.messages[0].message);
                                   showalert('failure', translate(message),"isAutoHide=false");// No I18N
                              }
                         },
                         beforeSend: function(){
                              msg = jQuery('#sync_now').button('loading');// Show save loading image
                         }
                    });
               });
     };
     //fetching graph details and draw graph using focus chart 
     o365Obj.drawLicenseGraph = function(fetchGraph){
          var dataArr = [];
               jQuery.each(fetchGraph, function(index,obj){
                    dataArr.push([obj.service_name,obj.count]);
               });
               
          var dataObj = {
               "canvas": {//NO I18N
                    "title"   : {"show": false},//NO I18N
                    "subtitle": {"show": false},//NO I18N
                    "fontSize": 18,//NO I18N
                    "border"  : {//NO I18N
                         "show": false//NO I18N
                    }
               },
               "tooltip": {//NO I18N
                    "backgroundColor":"#FFFFFF",//NO I18N
                    "borderColor"    : "#FFFFFF",//NO I18N
                    "borderRadius"   :0,//NO I18N
                    "fontColor"      :"#616161",//NO I18N
                    "opacity"        : 1//NO I18N
               },
               "seriesdata": {//NO I18N
                    "chartdata": [{"type": "bar","data": [dataArr]}]//NO I18N
               },
               "metadata": {//NO I18N
                    "axes": {//NO I18N
                         "x": [0],"y": [[1]],"tooltip": [1,0]
                    },
                    "columns": [//NO I18N
                         {
                         "dataindex" : 0,//NO I18N
                         "columnname": translate('sdp.itil.common.service.item.name'),//NO I18N
                         "datatype"  : "ordinal"//NO I18N
                         },
                         {
                         "dataindex" : 1,//NO I18N
                         "columnname": translate('ae.barcode.genaeration.rangeCount'),//NO I18N
                         "datatype"  : "numeric",//NO I18N
                         }
                    ]
               },
               "chart": {//NO I18N
                    "axes": {//NO I18N
                         "rotated": true,//NO I18N
                         "xaxis": {//NO I18N
                             "show"     : true,//NO I18N
                             "threshold": {"coloroverlay": {"overlayRange": "above"}},//NO I18N
                             "axisline" : {"show": true,"color":"#BFBFBF"},//NO I18N
                             "grid"     : {"show":true},//NO I18N
                             "label"    :{"text": translate('sdp.itil.common.service.item.name')}//NO I18N
                         },
                         "yaxis": [//NO I18N
                             {
                                 "show"     : true,//NO I18N
                                 "threshold": {"coloroverlay": {"overlayRange": "above"}},//NO I18N
                                 "axisline" : {"show": false},//NO I18N
                                 "label"    :{"text": translate('ae.barcode.genaeration.rangeCount')},//NO I18N
                                 "grid"     : {"show":true,"color":"#BFBFBF"},//NO I18N
                             },
                         ]
                    },
                    "plot" : {//NO I18N
                         "datalabels": {//NO I18N
                              "show": true//NO I18N
                          },
                         "plotoptions": {//NO I18N
                             "bar":{//NO I18N
                                 "animation" : {"easingType": "back-out"},//NO I18N
                                 "datalabels": {"labelPos": "bottom","showAs": "x","show": false},//NO I18N
                                 "gradients" : {"type": "linear","options": {"linear": {"stopColor": ["#5daecc","#5daecc"]}}},//NO I18N
                                 "padding"   : 0.5,//NO I18N
                                 "datalabels": {//NO I18N
                                     "labelPos": "top"//NO I18N
                                  }
                             },
                         },
                         "animation" : {"easingType": "linear"},//NO I18N
                         "datalabels": {"show": true}//NO I18N
                    },
               },   
          }
               if(jQuery.fn.getDirection()=="rtl"){
                    dataObj.chart.axes.xaxis.orient = "right";//NO I18N
                    dataObj.chart.axes.yaxis[0].reversed = true;
               }
          var chartObj = new $ZC.charts("#chart-container", dataObj);//NO I18N
     };
     o365Obj.urlRenderFunction = function(){
          var tempVar = false, queryString = window.location.search, urlParams = new URLSearchParams(queryString);
          if(urlParams.get('list')){
               var availTab = jQuery(jQuery('#office-nav-sdtabs .active')[0]).find('a').attr("data-tab")
               var currTab = urlParams.get('list');
               if(availTab!=decodeURIComponent(currTab) || !tempVar){
                    jQuery('[data-tab='+currTab+']').trigger('click',"true")
               }
          }
          if((urlParams.get('domain_name')) || (urlParams.get('user_name')) || (urlParams.get('site_name'))){
               var option = {};
               tempVar = true;
               if(urlParams.get('user_name')){
                    option.user_filter = urlParams.get('user_name');
               }
               if(urlParams.get('domain_name')){
                    option.domain_filter = urlParams.get('domain_name');
                    option.domain_value =  urlParams.get('domain_id');
               }
               if(urlParams.get('site_name')){
                    option.site_filter = urlParams.get('site_name');
                    option.site_value =  urlParams.get('site_id');
               }
               setTimeout(function(){
                    jQuery('#usersFilter').off('change').trigger('change',option);//NO I18N
               },2);
          }
          
     };
     return o365Obj;
}());     