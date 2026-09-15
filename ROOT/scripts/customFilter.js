/* $Id$ */
var requestListData = {};
var cust_filter = (function($){
    var c_f = {};
    var jD = jQuery(document);
    c_f.filter_table = {}
    c_f.initFilterComp = function(showType,filterId,module,uniqueId, isPreviewNeeded,isCustomFilter){
        this.module = module;
        this.uniqueId = uniqueId;
        this.isCustomFilter=isCustomFilter;
        var preview = (isPreviewNeeded === 'true');

        if (showType === "listview") {
            cust_filter.listAllFilters();
        }else {
            if((showType === "editfilter" || showType === "preview") && filterId != null && filterId !== "null") {
                cust_filter.newOrEditFilter(filterId, preview);
            } else {
                cust_filter.newOrEditFilter('');
            }
        }
        //To hide extra scroll in overall body.
        //SD-105192
        if (this.module == "request" || this.module == "solution"){ //No I18N
            jQuery('body').css('overflow','hidden'); //No I18N
        }
    },
    c_f.listAllFilters = function() {
        var _self = this;
        var table_info = table_comp.getTableInfo(_self.module);

        //Personalization Migration Handling TaskId: 79691
        if (_self.module == "request"){ //No I18N
            if(table_info && table_info.list_info){
                if(table_info.list_info.end_index){delete table_info.list_info.end_index;}
                if(table_info.list_info.fields_required){delete table_info.list_info.fields_required;}
                if(table_info.list_info.page_number){delete table_info.list_info.page_number;}
                if(table_info.list_info.total_count){delete table_info.list_info.total_count;}
            }
        }

        _self.loadfiltercontent(table_info);
            if (_self.module == "request") { //No I18N
                c_f.initNewCustomFilter({
                    selector: "custom_filter_" + _self.module, //No I18N
                    entity: "requests", //No I18N
                    discorded_fields: ["service_sla"], //No I18N
                    module: _self.module,
                    metaoverRide: {
                        "udf_fields": { "display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields") }, //No I18N
						"maintenance": {"type":"boolean"} //No I18N
                    }
                })
            }else if(_self.module === "project"  || _self.module === "task"){// No I18N
                c_f.initNewCustomFilter({
                    selector: "custom_filter_" + _self.module, //No I18N
                    entity: cust_filter.moduleMap[_self.module],
                    module: _self.module,
                    metaoverRide: {
                        "udf_fields": { "display_name": translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields") }, //No I18N
                    }
                })
            }
            if (_self.module == "solution") { //No I18N
                 c_f.initNewCustomFilter({
                    selector: "custom_filter_" + _self.module, //No I18N
                    entity: "solutions", //No I18N
                    module: _self.module,
                    haveNestedColumns : false,
                    dollarSupport : {},
                    ignoreNoneFields:['created_by','created_time','last_updated_by','last_updated_time','approval_status'], //No I18N
                    metaoverRide: {
                        "problem_resolution": {"display_name" : translate("solution.associated.problem"),"type" : "boolean"},//No I18N
                        "is_public": {"display_name" : translate("ae.cmdb.relationshipmap.visibility")},//No I18N
                        "last_updated_time": {"type" : "date"},//No I18N
                        "created_time" : {"type" : "date"}//No I18N

                    },
                    passOnlyIds:true,
                    allowNegativeValues : false,
                    discorded_fields : ["deleted_time"]

                 })
             }
    },
    //Method will be called when default filters of custom filters are changed
    c_f.switchFilterView=function(viewId,viewName){
        var filter_table=cust_filter.filter_table;
        var list_info=filter_table.t_obj.table_info.list_info;
        list_info.filter_by =  { "name" : viewId } ; //No i18n
        list_info.start_index = 1;
        filter_table.changeFilterString("clearOnly");// No I18N
        filter_table.refreshTable("refresh");// No I18N
        jQuery("#custom_view-filters").html(e_html(viewName));
        jQuery('#custom_view_filter_btn').prop('title',e_attr(viewName))// No I18N
    },
    //When custom view is enabled for a module, these options will used to render add/edit form
    c_f.detailsPageOptions=()=>{
    var detailsPageOptions= {
        defaultView:true,
        views : c_f.getViews(),
        columnConfig:{
            preProcessFields:this.preProcessFields
        },
        sortConfig:{
            default:"created_by"//No I18N
        },
        sharedConfig: {
            add_first: false,
            choose_display_name: translate("dashboard.shareto"), //No I18n
            view_type : "dropdown-search", //No I18n
            max_selection: 25,
            type_transformer: {
                groups: "support_group", //No I18n
                orgRoles: "org_role", //No I18n
                users: "user", //No I18n
                roles: "role", //No I18n
                user_groups: "user_group" //No I18n
            },
            multi_select: [
            {
                type: "users", //No I18n
                display_name: translate("custom.view.shareto.user"), //No I18n
                api_url: [{
                    url: "users", //No I18n
                    search_placeholder: translate("ae.header.search.users"), //No I18n
                    entity_key: "users", //No I18n
                    items_to_add:()=>{
                        items_to_add=[]
                        items_to_add.push({
                            id: "$(all_tech)",//No I18n
                            name: translate("sdp.calendar.alltechs")
                        })
                        return items_to_add;
                    }
                }],
                updateInputData: (inputData)=>{
                    inputData.list_info.search_criteria.children[0].values.forEach((element, index) => {
                        if (element == "$(all_tech)") {
                            inputData.list_info.search_criteria.children[0].values.splice(index, 1);
                        }
                    })
                },
                row_count: 100,
                values: []
            },{
                type: "roles", //No I18n
                display_name: translate("dashboard.techRoles"), //No I18n
                api_url: [{
                    url: "technicians/associated_roles", //No I18n
                    search_placeholder: translate("search.prefix", [translate("dashboard.techRoles")]), //No I18n
                    entity_key: "associated_roles" //No I18n
                }],
                row_count: 100,
                values: []
            },{
                type: "groups", //No I18n
                display_name: translate("sdp.admin.leftpanel.helpdesk.queues"), //No I18n
                api_url: [{
                    url: "support_groups", //No I18n
                    search_placeholder: translate("search.prefix", [translate("sdp.admin.leftpanel.helpdesk.queues")]), //No I18n
                    entity_key: "support_groups" //No I18n
                }],
                row_count: 100,
                values: []
            },{
                type: "user_groups", //No I18n
                display_name: translate("sdp.admin.group.user"), //No I18n
                api_url: [{
                    url: "user_groups", //No I18n
                    search_placeholder: translate("search.prefix", [translate("sdp.admin.group.user")]), //No I18n
                    entity_key: "user_groups" //No I18n
                }],
                row_count: 100,
                values: []
             },{
                type: "orgRoles", //No I18n
                display_name: translate("sdp.admin.leftpanel.helpdesk.orgroles"), //No I18n
                api_url: [{
                    url: "org_roles", //No I18n
                    search_placeholder: translate("search.prefix", [translate("sdp.admin.leftpanel.helpdesk.orgroles")]), //No I18n
                    entity_key: "org_roles" //No I18n
                }],
                row_count: 100,
                values: []
             }
            ]
        }
    }
        return detailsPageOptions
    },
    //method to be called on success of saving custom view
    c_f.saveFn=()=>{
        cust_filter.filter_table.refreshTable("refresh")//No I18N
    },
    //entity method to be called on failure of saving custom view
    c_f.errorFn=(xhr)=>{
        var response = JSON.parse(xhr.responseText);
         var message = response.response_status.messages? response.response_status.messages[0] : null;
         if(message.field && message.field === 'criteria'){
             showalert('failure', translate("sdp.customfilter.invalid.criteria"),"isAutoHide=false,delay=5"); // No I18N
         }
         else if(message.status_code === 4002){
             showalert('warning', e_html(message.message),"isAutoHide=true,delay=5"); // No I18N
         }
         if(response.response_status.messages[0].status_code === 4008){
              showalert('failure',translate("sdp.api.customfilter.name.exists"), 'isAutoHide=false'); //NO I18N
         }
    },
    //Method to pre process fields before listing them in column chooser of custom view add/edit form
    c_f.preProcessFields=fields=> fields,
    //Method to control the private/public/shared checkboxes to be shown for user under custom view form based on roles/permissions
    c_f.getViews = () => ["private", "public", "shared"];//No I18N
    //Default criteria condition options which module teams can consume for their date based fields under custom view criteria field
        c_f.dateCustomize=()=>{
        var  dateCustomize={
            "date_conditions": [  //No I18N
                {
                    "name":"date", //No I18N
                    "display_name":translate("sdp.common.date"), //No I18N
                    "children":[ //No I18N
                        {"id":"on", "text":translate("sdp.condition.13")}, //No I18N
                        {"id":"after", "text":translate("sdp.condition.14")}, //No I18N
                        {"id":"before", "text":translate("sdp.condition.15")}, //No I18N
                        {"id":"on or after", "text":translate("sdp.condition.on.after")}, //No I18N
                        {"id":"on or before", "text":translate("sdp.condition.on.before")} //No I18N
                    ]
                },
                {
                    "name":"dur", //No I18N
                    "display_name":translate("admp.duration"), //No I18N
                    "children":[ //No I18N
                        {"id":"dur.on", "text":translate("sdp.condition.13"), "type":"dateSelect"}, //No I18N
                        {"id":"dur.after", "text":translate("sdp.condition.14"), "type":"dateSelect"}, //No I18N
                        {"id":"dur.before", "text":translate("sdp.condition.15"), "type":"dateSelect"}, //No I18N
                        {"id":"dur.on or after", "text":translate("sdp.condition.on.after"), "type":"dateSelect"}, //No I18N
                        {"id":"dur.on or before", "text":translate("sdp.condition.on.before"), "type":"dateSelect"} //No I18N
                    ]
                }
            ],
            "date_placeholders": [ //No I18N
                {"id":"$(current_time)", "text":translate("sdp.common.currenttime")}, //No I18N
                {"id":"$(today)", "text":translate("sdp.common.today")}, //No I18N
                {"id":"$(tomorrow)", "text":translate("sdp.common.tomorrow")}, //No I18N
                {"id":"$(yesterday)", "text":translate("sdp.common.yesterday")}, //No I18N
                {"id":"$(this_week)", "text":translate("sdp.common.thisweek")}, //No I18N
                {"id":"$(last_week)", "text":translate("sdp.common.lastweek")}, //No I18N
                {"id":"$(next_week)", "text":translate("sdp.common.nextweek")}, //No I18N
                {"id":"$(last_month)", "text":translate("sdp.common.lastmonth")}, //No I18N
                {"id":"$(next_month)", "text":translate("sdp.common.nextmonth")}, //No I18N
                {"id":"$(this_month)", "text":translate("sdp.common.thismonth")}, //No I18N
                {"id":"$(this_year)", "text":translate("sdp.common.thisyear")} //No I18N
            ]
        }
        return dateCustomize;
}
    c_f.loadfiltercontent = function(table_info) {
        var _self = this;
            var table_content = {};
            table_content.header = this.headerdataConstruct(table_info);
            setTimeout(function(){
                var options = {};
                options.paginationEnabled = true;
                options.searchEnabled = true;
                options.sortingEnabled = true;
                options.multiDeleteEnabled = true;
                options.personalize_key = _self.module;
                options.callbackRowfunction = "cust_filter.rowdataConstruct";//No I18N
                options.row_inputdata = _self.rowdataConstruct(table_info);
                options.tableHolder="list_view_filters";//No I18N
                options.callbackURL = c_f.isCustomFilter?"list_view_filters":"custom_views"; // No I18N
                options.entity_name = c_f.isCustomFilter?"list_view_filters":"custom_views"; // No I18N
                options.isODAPI = true;
                options.view = "kanban"; //No I18N
				options.support_search_criteria = true;
                options.view_mode = "linear"; //No I18N
                options.width = _self.calculateWidth(_self.module);
                options.height= _self.calculateHeight(_self.module);
                options.bulkSelectionSetting = {
                    selectionDisplayField: "subject", // No I18N
                    selectionCallback: function (elm) {
                        _self.toggleCheckbox(elm);
                    },
                    unSelectionCallback: function (elm) {
                        _self.toggleCheckbox(elm);
                    }
                };
                options.column_settings = {
                    "default_position": 3,//No I18N
                    "assign_label_width": false,//No I18N
                    "assign_content_width": false,//No I18N
                    "cell_custom_class": "disp-flex", //No I18N
                    "columns": [{ //No I18N
                        "size": 1,//No I18N
                        "width": "80px" //No I18N
                    },
                    {
                        "size": 1, //No I18N
                        "width": "100px"//No I18N
                    },{
                        "size": 6,//No I18N
                        "pipe_separation": false, //No I18N
                        "row_count": 3 //No I18N
                    }, {
                        "size": 1 //No I18N
                    }, {
                        "size": 3 //No I18N
                    }
                    ]
                };
                options.nodataString = '<div class="text-center ptop44" style="">'+
                    '<span class="aspr not-found"></span>' +
                    '<div class="h2">'+translate("sdp.listview.nodataavailble")+'</div>' +
                    '</div>';
                table_info.list_info.filter_by= { "name" : "all_views" }// No I18N
                table_info.list_info.sort_order = "desc"; //No I18N
                table_info.list_info.sort_field = "id"; //No I18N
                    c_f.filter_table = new tableComponent(table_info,table_content,options, _self);
                },0);


               jQ("#custom_view_filter_btn").off('click').on('click',()=>{ //No I18N
                  var filterList_obj = new filterListComp();
                   filterList_obj.initComponent({
                       element : "#ListViewFilterMenu",  // No I18N
                       module : "custom_view_"+_self.module,  // No I18N
                       filter_action : "cust_filter.switchFilterView", //No I18N
                       custom_filters : false,
                       skipPersonalization : true,
                       hideFilterSearch:true
                   });
               })

              jQ('[data-id="list_view_filters"').off('click').on('click', function(){ //No I18N
                viewModuleHistory(this)
              })

              jQ('[data-id="custom_views"').off('click').on('click', function(){ //No I18N
                viewModuleHistory(this)
              })

              jQ("#addNewFltr").off('click').on('click', ()=>{ //No I18N
                window.location.href ='/ListViewFilter.do?module='+_self.module+'&action=addfilter'
              })

              jQ("#back_to_listview").off('click').on('click', ()=>{ //No I18N
                    jQuery(".cancel-filter").trigger("click");
              })
    },
    c_f.calculateWidth= function(module)
    {
        var widthVal=jQuery(window).width() - 20;
        if(module=="request" || module == "solution"){
            var sideBarWidth=0;
            var direction = jQuery.fn.getDirection();
            if(direction == 'rtl') {
                sideBarWidth = jQuery('body').css('padding-right'); //No I18N
            }else {
                sideBarWidth = jQuery('body').css('padding-left'); //No I18N
            }
            return (widthVal - parseInt(sideBarWidth));
        }
        return widthVal;
    },
    c_f.calculateHeight= function(module)
    {
        if(module=="request" || module == "solution"){
            return (window.innerHeight - jQuery('#header-placeholder').height() - 110) ;
        }
        return null;
    },
    c_f.getCriteriaString = function(condition) {
        var filterConditions = condition;
        var filterConcatString = "";
        for (var i = 0; i < filterConditions.length; i++) {
                filterConcatString = filterConcatString + translate(filterConditions[i].display_value) + " ";

            var filterCondString = filterConditions[i].condition;
            var filterCondVal = (filterCondString.indexOf("_duration") === -1) ? filterCondString.replace(/_/g, " ") : (filterCondString.split("_duration")[0]).replace(/_/g, " ");
            filterConcatString = filterConcatString + filterCondVal + " ";

            var criteriavalDisplay = "";
            var cond_obj = filterConditions[i].values;
            for(var j=0;j<cond_obj.length;j++){
                if (criteriavalDisplay === "") {
                    criteriavalDisplay = cond_obj[j].name;
                } else {
                    criteriavalDisplay = criteriavalDisplay + "," + cond_obj[j].name;
                }
            }
            filterConcatString = filterConcatString + criteriavalDisplay;
            if (i < filterConditions.length - 1) {
                filterConcatString = filterConcatString + " " + filterConditions[i + 1].logical_operator + " ";
            }
        }
        return encodeHTML(filterConcatString);
    },
    c_f.rowdataConstruct = function(table_info) {
        var inputObject = {};
        var list_info = table_info.list_info;
            inputObject.module = this.module;
            list_info.get_total_count = true;
            inputObject.list_info = list_info;
            return inputObject;
        },
        c_f.headerdataConstruct = function (table_info) {
            var _self = this;
            var header = {
            "id": { //No I18N
                "isHidden": true, //No I18N
                "display_name": translate("sdp.common.id")  //No I18N
            },
            "list_view_filters_head_chk": { //No I18N
                "id" : "list_view_filters_head_chk", type : "checkbox", "dataCelltransformer" : "cust_filter.constructChkboxCell", "default": true,  //No I18N
                    "column_settings": { "position": 1 }, // No I18N
                "hide_label": true  //No I18N
            },
            "edit_icon" :{ //No I18N
                "id" : "edit_icon", type : "icon", "dataCelltransformer" : "cust_filter.constructEditIconCell", "default": true, "hide_label": true, //No I18N
                    "column_settings": { //No I18N
                    "position": 1 //No I18N
                    }
            },
            "enable_disable": { //No I18N
                "id": "enable_disable", type: "icon", "dataCelltransformer": "cust_filter.constructEnableDisableCell", "hide_label": true, //No I18N
                    "column_settings": { //No I18N
                    "position": 2 //No I18N
                }
            },
            // { "id" : "preview",type : "icon","dataCelltransformer" : "cust_filter.constructPreviewIconCell"}, // No I18N
            "display_name":{ //No I18N
                "id" : "display_name", "dataCelltransformer" : "cust_filter.constructNameCell", "display_name": translate("sdp.common.name"), "default": true, "searchingEnabled": true, "hide_label": true, //No I18N
                    "column_settings": { //No I18N
                    "position": 3, //No I18N
                        "view_type": "row",  //No I18N
                            "rowposition": 1 //No I18N
                }
            },
            "description": { //No I18N
                "id": "description", "text": translate("sdp.common.description"), //No I18N
                    "column_settings": { //No I18N
                    "position": 3, //No I18N
                            "view_type":  "row",  //No I18N
                    "rowposition": 2 //No I18N
                }
            },
            "criteria": { //No I18N
                "id": "criteria", "text": translate("filter.criteria"), "dataCelltransformer": "cust_filter.constructCriteria", //No I18N
                    "column_settings": { //No I18N
                    "position": 3, //No I18N
                        "view_type":  "row",  //No I18N
                        "rowposition": 3 //No I18N
                }
            },
            "private_public": { //No I18N
                "id": "private_public", type: "icon", "dataCelltransformer": "cust_filter.constructLockIconCell", "hide_label": true, //No I18N
                    "column_settings": { //No I18N
                    "position": 4 //No I18N
                }
            },
            "created_by": { //No I18N
                "id" : "created_by", "text": translate("common.createdby"), "dataCelltransformer" : "cust_filter.constructCreatedBy", "hide_label": true, //No I18N
                    "width": "200px", //No I18N
                        "column_settings": { //No I18N
                        "position": 5 //No I18N
                    },
                    "display_name": translate("common.createdby")  //No I18N
            }

            // { "id" : "name", "text": translate("common.title"),"dataCelltransformer" : "cust_filter.constructNameCell","width":jQuery(window).width()-200 +"px"} // No I18N
        };
        if(_self.module === "request"){//No I18N
            delete header.description;
            delete header.criteria;
        }

        else if(_self.module === "solution"){
            delete header.criteria;
        }

        return header;
    },
    c_f.constructChkboxCell  = function(table_data, _self){
        var row_data = table_data.row_data;
        if(row_data.is_readonly||row_data.created_by.id==1){
            return "";
        }else{
            return '<span class="fl ml5 mt10 pt2"><input type="checkbox" value="'+row_data.id+'" data-table-checkbox></span>';
        }
    },
    c_f.constructNameCell = function(table_data, _self){
        var row_data = table_data.row_data;
        var displayStr = '<div><span data-filterid="'+row_data.id+'">#' + row_data.id +"</span> <span data-filtername>"+ e_html(row_data.display_name)+"</span></div>";
        if(!row_data.is_readonly&&row_data.created_by.id!=1){
            if (_self.module == "request" || _self.module === "solution" || _self.module === "project" || _self.module === "task") {
                displayStr = '<a href="/" class="clickaction" data-action-name="cust_filter.editFilterCriteria" data-action-param="'+row_data.id+'"  data-id="' + row_data.id + '" >' + displayStr + '</a>';
            }else{
                var editUrl = "/ListViewFilter.do?module=" + _self.module+ "&action=editfilter&filterid=" + row_data.id; //NO I18N
                displayStr = '<a href=' + editUrl + ' >' + displayStr + '</a>';
            }
        }
        return displayStr;
    },

    c_f.constructEditIconCell = function(table_data, _self){
        var row_data = table_data.row_data;
        if(row_data.is_readonly||row_data.created_by.id==1){
            return "";
        } else {
            var colStr = '<div class="btn-group pos-abs bs-noconflict ml20 pl25 top15 mt1" style="top:20px"> <a class="cur-ptr cspr menulist icon-xs flat2 sdmenu-toggle vtop toggle-edit" data-switch="sdmenu" title="'+translate("common.actions")+'"></a><ul class="sdmenu-dd" role="menu">'; //No I18N
            if (_self.module == "request" || _self.module === "solution" || _self.module === "project" || _self.module === "task") {
                colStr += '<li><a id="editCustFltr" href="/" class="clickaction" data-action-name="cust_filter.editFilterCriteria" data-action-param="'+row_data.id+'" data-id="' + row_data.id + '" type="button" >' + translate("common.edit") + '</a></li>'; //No I18N
            }else{
                var editUrl = "/ListViewFilter.do?module=" + _self.module + "&action=editfilter&filterid=" + row_data.id; //NO I18N
                colStr += '<li><a id="editCustFltr" href=' + editUrl + ' type="button" >' + translate("common.edit") + '</a></li>'; //No I18N
            }
            var titlekey = ""; //No I18N
            if (row_data.scope==2||row_data.scope==3) {
                titlekey = 'project.filters.markprivate1'; // No I18N
            }else{
            	titlekey = 'sdp.project.filters.markprivate'; // No I18N
            }

            //Task_id: 74848 -> Removing 'mark as private/public' for restricted users.
            if(_self.module == "request" || _self.module == "solution"){  // No I18N
               if(sdp_user.ROLES.indexOf("SDAdmin") != -1){   // No I18N
                   colStr += '<li><a id="cf_privacy_drop_'+row_data.id+'" href="/" class="clickaction" data-action-name="cust_filter.updateFilterPublic" data-action-param="' + row_data.id + ',' + row_data.scope + ',' + row_data.inactive + "," + row_data.module+'" data-id="' + row_data.id + '" type="button" title="' + translate(titlekey) + '">' + translate(titlekey) +'</a></li>'; //No I18N
               }
            }
            else{
                colStr += '<li><a id="cf_privacy_drop_'+row_data.id+'" href="/" class="clickaction" data-action-name="cust_filter.updateFilterPublic" data-action-param="' + row_data.id + ',' + row_data.scope + "," + row_data.inactive + "," +  row_data.module+'" data-id="' + row_data.id + '" type="button" title="' + translate(titlekey) + '">' + translate(titlekey) +'</a></li>'; //No I18N
            }


            if(_self.module == "change" && row_data.created_by.id == "1"){ // No I18N
                return ""; // No I18N
            }
            var previewUrl = "/ListViewFilter.do?module=" + _self.module+ "&action=preview&filterid=" + row_data.id; //NO I18N
            if (_self.module == "request" || _self.module === "solution" || _self.module === "project" || _self.module === "task") {
                //preview option is removed for Request module. Taskid: 74860
                colStr += '</ul ></div >'; //No I18N
                return colStr;
            }
            colStr += '<li><a id="custFltrPreview" href=' + previewUrl + ' type="button" >'+e_html(translate("sdp.common.preview"))+'</a></li>'; //No I18N

            colStr += '</ul ></div >'; //No I18N
            return colStr;
        }
    },
    c_f.constructLockIconCell = function(table_data, _self){
        var row_data = table_data.row_data;
        var clickAction = "clickaction";// No I18N
        var arrowHead = ""; // No I18N
        if(_self.module=='request' || _self.module=='solution'){
            if(sdp_user.ROLES.indexOf('SDAdmin')<0){
                clickAction="";
                arrowHead="cur-def";// No I18N
            }
        }
        if(row_data.is_readonly||row_data.created_by.id==1){
            return "";
        }else{
            var titlekey= "",classval="";
            if (row_data.scope==2) {
                titlekey = 'sdp.dashboard.common.public'; // No I18N
                classval = "cspr icon-sm public-filter"; //No I18N
            }else if(row_data.scope==1){
                 classval = 'cspr icon-sm private-filter '+arrowHead; // No I18N
                 titlekey = 'sdp.dashboard.common.private'; // No I18N
            }else{
                classval = 'cspr icon-sm share2 '; // No I18N
                titlekey = 'sdp.dashboard.common.shared'; // No I18N
            }
            if(!c_f.isCustomFilter){
                    classval+=' cur-na' //No I18N
                    return  '<div class="mt20"><button id="cf_privacy_col_'+row_data.id+'" class="btn-icon btn-md type="button" title="'+translate(titlekey)+'"><span class="cspr icon-sm '+classval+'"></span></button>&nbsp;<span>'+translate(titlekey) + '</span></div>'; //No I18N
            }else{
                    return  '<div class="mt20"><button id="cf_privacy_col_'+row_data.id+'" class="btn-icon btn-md '+clickAction+'" data-action-name="cust_filter.updateFilterPublic" data-action-param="'+row_data.id+','+row_data.scope+","+ row_data.inactive + "," + row_data.module+'" data-id="'+row_data.id+'" type="button" title="'+translate(titlekey)+'"><span class="cspr icon-sm '+classval+'"></span></button>&nbsp;<span>'+translate(titlekey) + '</span></div>'; //No I18N
            }
        }
    },
    //Method which constructs the enable disable button of custom views, in its list view
    c_f.constructEnableDisableCell=(table_data,_self)=>{
        var row_data = table_data.row_data;
        if(row_data.is_readonly){
            return "";
        }else{
            var chk = (!row_data.inactive) ? 'checked' : '';//No I18N
            var toolTipTitle = (!row_data.inactive) ? translate("common.enabled") : translate("common.hidden");
            return '<label class="disp-iflex ml5 mt10" id="cf_active_status_col_label_'+row_data.id+'" title="'+toolTipTitle+'" >'+//No I18N
                    '<input type="checkbox" '+chk+' class="togglechk clickaction" id="cf_active_status_col_'+row_data.id+'" name="cvradio'+row_data.id+'" data-action-name="cust_filter.enableOrDisableView" data-action-param="'+row_data.id+','+row_data.scope+','+row_data.inactive+','+row_data.module+'" data-id="'+row_data.id+'">'+
                        '<span class="slide-toggle togg-sm">'+
                            '<span class="switch-toggle"></span>'+
                        '</span>'+
                   '</label>';
        }
    }
    c_f.constructCreatedBy = function(table_data, _self){
        var row_data = table_data.row_data;
        var created_by = (row_data.updated_by && (row_data.updated_on && (row_data.created_on==null||row_data.updated_on.value !== row_data.created_on.value))) ? (e_html(translate("common.updatedby"))+'&nbsp;:&nbsp;</b>'+ e_html(row_data.updated_by.name)) : (translate("common.createdby")+'&nbsp;:&nbsp;</b>'+ (row_data.created_by ? e_html(row_data.created_by.name) : "-"));  //No I18N
        var created_on = row_data.updated_on ? row_data.updated_on.display_value : (row_data.created_on ? row_data.created_on.display_value : "");
        var created_str = created_by +"&nbsp;"+ (created_on != "" ? e_html(translate("common.on")) : "") + "&nbsp;"+ created_on  //No I18N
        //task-id : 74862 - Created_by goes incomplete for longer values so tooltip is mandatory.
        return "<div class='mt20 text-ellipsis' style='max-width=300px' rel='uitip' mode_ellipsis='true' title='"+ created_str +"'>" + created_str + "</div>"; //No I18N
    },
    c_f.constructCriteria = function(table_data, _self){
        var row_data = table_data.row_data;
        var criText = _self.getCriteriaString(row_data.criteria);
        return "<span rel='uitip' mode_ellipsis='true' title='"+ criText +"' style='max-width:90%'>" + criText + "</span>"; //No I18N
    },
    c_f.constructPreviewIconCell = function(table_data, _self){
        var rdata = table_data.row_data;
        var displayStr = "";
        if(!rdata.is_readonly){
            var row_data = table_data.row_data;
        if(_self.module == "change" && row_data.created_by.id == "1"){ // No I18N
            return ""; // No I18N
        }
            if (_self.module == "request"|| _self.module == "solution") {
                displayStr = '<a id="custFltrPreview" class="btn-icon icon-sm clickaction"  href="/" data-action-name="cust_filter.editFilterCriteria" data-action-param="'+row_data.id+','+true+'" data-id="' + row_data.id + '" type="button" title="'+translate("sdp.common.preview")+'"><span class="common-sprite common-preview-icon1"></span></a>';
            }else{
                var previewUrl = "/ListViewFilter.do?module=" + _self.module+ "&action=preview&filterid=" + row_data.id; //NO I18N
                displayStr = '<a id="custFltrPreview" class="btn-icon icon-sm" href=' + previewUrl + ' type="button" title="'+translate("sdp.common.preview")+'"><span class="common-sprite common-preview-icon1"></span></a>';
            }
        }
        return displayStr;
    },


    c_f.newOrEditFilter = function (filter_id, preview) {
        //variable 'dynamicId' initialized for Filter component globally in filterFields.js file. We need to re-initialize everytime ,when page is loaded.
        dynamicId = 0;
        var _self = this;
        if (filter_id !== "") {
            jQuery('#editView').removeClass("hide");
            jQuery("#filter_id").val(filter_id);
            jQuery("#preview").val(preview);
            var inputObject = {};
                inputObject.include = ["allowed_values"];
            var dataVal = window.sdpAjaxInputData(inputObject);
                sdpAjax({
                url: 'api/v3/list_view_filters/'+filter_id, // No I18N
                data:dataVal,
                    headers: {
                        "accept": "v3+json"  // No I18N
                    },
                success: function(j_obj) {
                    if(j_obj.list_view_filter.module === _self.module) {
                        if(_self.module == "change" && j_obj.list_view_filter.created_by.id == "1"){ // No I18N
                            jQuery("#btnpreview").remove();
                        }
                    var filterName = j_obj.list_view_filter.display_name;
                        jQuery("#filtername").val(filterName);
                        jQuery("#filterNameOrig").val(filterName);
                        var descriptionVal = j_obj.list_view_filter.description;
                        jQuery("#filterdesc").val(descriptionVal);
                        //var publicVar = j_obj.list_view_filter.is_public;
                        jQuery("#chk_public").prop({ 'checked': j_obj.list_view_filter.scope==2, 'disabled': !j_obj.allowed_values.can_create_public }); //No I18N
                        jQuery('#header_project_title').hide();
                        _self.constructFilterFieldsOpt(j_obj.allowed_values);
                        var filterCond = _self.updateFilterCondition(j_obj.list_view_filter.criteria, j_obj.allowed_values);
                        jQuery('#container1').filterFields('update', filterCond); // No I18N
                        if (preview) {
                            jQuery('#btnpreview').trigger('click');
                        }
                    } else {
                        showalert('failure',translate("sdp.api.customfilter.id.notfound"), 'isAutoHide=false'); //NO I18N
                    }
                    if(j_obj.list_view_filter.created_by.id != "1"){
                        jQuery("#submitbutton,#saveAndAddnewbutton").removeClass("hide");
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    response = JSON.parse(jqXHR.responseText);
                    if(response.response_status.messages[0].status_code === 4002){
                        showalert('failure',e_html(response.response_status.messages[0].message), 'isAutoHide=false'); //NO I18N
                    } else if(response.response_status.messages[0].status_code !== 4000){
                        showalert('failure',translate("sdp.api.customfilter.id.notfound"), 'isAutoHide=false'); //NO I18N
                    }
                },
                cache:false,async:false
            });
        }else{
                jQuery("#submitbutton,#saveAndAddnewbutton").removeClass("hide");
                sdpAjax({
                    headers: {
                        "accept": "v3+json"  // No I18N
                    },
                    url: '/api/v3/list_view_filters/new_form?input_data='+encodeURIComponent('{"module":"' + _self.module + '"}'), // No I18N
                success: function(j_obj) {
                    if(typeof j_obj === 'string') {
                        j_obj = JSON.parse(j_obj);
                    }
                        j_obj = j_obj.new_form;
                        jQuery("#chk_public").prop('disabled', !j_obj.allowed_values.can_create_public); //No I18N
                        _self.constructFilterFieldsOpt(j_obj.allowed_values);
                },
                async:false
            });
            jQuery('#newView').removeClass("hide");
        }
        jQuery('#filtername').trigger('focus');

    },
    c_f.constructFilterFieldsOpt = function(j_obj){
        var opt = {
            "addRowValidationFunction" : this.customAddRowValidateFunction, //No I18N
            "isSortable" : false, //No I18N
            "validateField" :true, //No I18N
            "validationMessageClass" :'validation-msgg', //No I18N
            "columnData" : { //No I18N
                "dataList": this.getColumnDataList(j_obj.criteria_field_details) //No I18N
            },
            "criteria" : { //No I18N
                "isSelectable": true, //No I18N
                "dataList": this.getCriteriaFieldData(j_obj.criteria_field_types) //No I18N
            },
            "criteriaValue" : { //No I18N
                    "dataList": this.getCriteriaValueDataList(j_obj.criteria_field_details) //No I18N
            },
            "addRowCBFunction" : this.CustomAddorRemoveRowCBFunction, //No I18N
            "removeRowCBFunction" : this.CustomAddorRemoveRowCBFunction //No I18N
        };
        this.columnDataList = opt.columnData;
        jQuery("#container1").filterFields(opt);
    },
    c_f.getColumnDataList = function(c_FD) {
        var cols_arr = [];
        for (var i = 0; i < c_FD.length; i++) {
            var cols = {};
            cols.TITLE = translate(c_FD[i].display_value);
            cols.TYPE = c_FD[i].field_type;
            cols.VALUE = c_FD[i].field;
            cols_arr.push(cols);
        }
        return cols_arr.sort(function(a,b) {return (a.TITLE.toLowerCase() > b.TITLE.toLowerCase()) ? 1 : ((b.TITLE.toLowerCase() > a.TITLE.toLowerCase()) ? -1 : 0);} );
    },
    c_f.getCriteriaFieldData = function(c_FT) {

            var fieldTypes = [{
                    "type": "text",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "text",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "starts with"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "ends with"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "contains"  // No I18N
                        }
                    ]
                },
                {
                    "type": "select",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "select",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "select",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "multiselect",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "multiselect",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                },
                {
                    "type": "#HREF",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "ajax_select",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "ajax_select",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "ajax_multiselect",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "ajax_multiselect",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                },
                {
                    "type": "boolean",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "boolean",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "boolean",  // No I18N
                            "condition": "is not"  // No I18N
                        }
                    ]
                },
                {
                    "type": "double",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "double",  // No I18N
                            "condition": "eq"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "neq"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "greater than"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "lesser than" // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "greater or equal"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "lesser or equal"  // No I18N
                        }
                    ]
                },
                {
                    "type": "long",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "long",  // No I18N
                            "condition": "eq"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "neq"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "greater than"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "lesser than"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "greater or equal"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "lesser or equal"  // No I18N
                        }
                    ]
                },
                {
                    "type": "date",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "date",  // No I18N
                            "condition": "on"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "after"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "before"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "on or after"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "on or before"  // No I18N
                        }
                    ]
                },
                {
                    "type": "picklist",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "picklist",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                }
            ]




        var _self =  this;
        var c_list = {};
            $.each(fieldTypes, function(key, value) {
            var c_dateField = [],
                c_selectField = [],
                c_list_Combined = {};
            var c_opt = value.options;
            for (var i = 0; i < c_opt.length; i++) {
                var c_data1 = {},
                    c_data2 = {};
                if (value.type === 'date') {
                    var date_objs = c_opt[i];
                    var disp_cond = translate(_self.getI18NKeysForCondition(date_objs.condition));
                        c_data1.TITLE = disp_cond;
                        c_data1.TYPE = date_objs.value_type;
                        c_data1.VALUE = date_objs.condition;
                        c_dateField.push(c_data1);
                        if(_self.module !='change')
                        {
                       c_data2.TITLE = disp_cond;
                        c_data2.TYPE = 'select'; // No I18N
                        c_data2.VALUE = date_objs.condition + "_duration"; // No I18N
                        c_selectField.push(c_data2);
                }
                }
                else {
                    var disp_cond = translate(_self.getI18NKeysForCondition(c_opt[i].condition));
                    c_data1.TITLE = disp_cond;
                    c_data1.TYPE = c_opt[i].value_type;
                    c_data1.VALUE = c_opt[i].condition;
                    c_selectField.push(c_data1);
                }

            }
            if (value.type === 'date'){
                c_list_Combined.Date = c_dateField;
                if(_self.module !='change')
                {
                c_list_Combined.Duration = c_selectField;
                }
                c_list[value.type] = c_list_Combined;
            }
            else{
                c_list[value.type] = c_selectField;
            }
        });

        return c_list;
    },
    c_f.getCriteriaValueDataList = function(c_AF) {
        var allowed_obj = {};
        var module=this.module;

            var dateValues = [{
                    "id": "$(current_time)",  // No I18N
                    "name": "sdp.common.currenttime"  // No I18N
                },
                {
                    "id": "$(today)", // No I18N
                    "name": "sdp.common.today" // No I18N
                },
                {
                    "id": "$(tomorrow)", // No I18N
                    "name": "sdp.common.tomorrow" // No I18N
                },
                {
                    "id": "$(yesterday)", // No I18N
                    "name": "sdp.common.yesterday" // No I18N
                },
                {
                    "id": "$(this_week)", // No I18N
                    "name": "sdp.common.thisweek" // No I18N
                },
                {
                    "id": "$(last_week)",  // No I18N
                    "name": "sdp.common.lastweek"  // No I18N
                },
                {
                    "id": "$(next_week)",  // No I18N
                    "name": "sdp.common.nextweek"  // No I18N
                },
                {
                    "id": "$(last_month)",  // No I18N
                    "name": "sdp.common.lastmonth"  // No I18N
                },
                {
                    "id": "$(next_month)",  // No I18N
                    "name": "sdp.common.nextmonth"  // No I18N
                },
                {
                    "id": "$(this_month)", // No I18N
                    "name": "sdp.common.thismonth" // No I18N
                },
                {
                    "id": "$(this_year)", // No I18N
                    "name": "sdp.common.thisyear" // No I18N
                }
            ]
            var boolValues = [{
                "id": "true",  // No I18N
                "name": "Yes"  // No I18N
            },
            {
                "id": "false", // No I18N
                "name": "No" // No I18N
            }
        ]

        $.each(c_AF, function(key, value) {

                if (value.field_type === 'date') {
                    value.values = dateValues;
                }
                if (value.field_type === 'boolean') { // No I18N
                    value.values = boolValues;
                }
                if (typeof value.values != 'string') {
                    if (value.values != null) {
                        value.values = value.values.sort(function(a, b) {
                     return (a.name > b.name);
                        });
                    }
                }
                var a_arr = [];
                if (Array.isArray(value.values)) {
                    for (var i = 0; i < value.values.length; i++) {
                        var jsonObj = {}, display_value = "", valueObj = value.values[i]; // No I18N
                            if(value.field=='status' && module=='change'){ // No I18N
                                display_value = valueObj.stage ? valueObj.stage.name+" -> "+valueObj.name : valueObj.name; // No I18N
                            }else if(value.field=='subcategory'){ // No I18N
                                if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else{
                                    display_value = valueObj.category.name+" -> "+valueObj.name; // No I18N
                                }
                            }else if(value.field=='item'){ // No I18N
                                if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else{
                                    display_value = valueObj.subcategory.category.name+" -> "+valueObj.subcategory.name+" -> "+valueObj.name; // No I18N
                                }
                            }else if(value.field=='group' && valueObj.hasOwnProperty("siteid")){	//NO I18N
                            	if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else if(valueObj.siteid==null){
                                	display_value = translate('common.site.nosite')+" -> "+valueObj.name;
                                }else{
                                    display_value = valueObj.siteid.name+" -> "+valueObj.name; // No I18N
                                }
                            }else{
                                display_value = translate(valueObj.name);
                            }
                        jsonObj.TITLE = display_value;
                        jsonObj.VALUE = valueObj.id;
                        a_arr.push(jsonObj);
                    }
                    allowed_obj[value.field] = a_arr;
                }else{
                    if(value && value.field_type === "#HREF") {
                        allowed_obj[value.field] = encodeURI(value.values);
                    } else {
                        allowed_obj[value.field] = value.values;
                    }
                }

        });
        return allowed_obj;
    },
    c_f.getI18NKeysForCondition = function(key) {
            key = key.replace(/\s+/g, '_');
        var conditionKeys = {};
        conditionKeys.is = "sdp.condition.1"; // No I18N
        conditionKeys.is_not = "sdp.condition.2"; // No I18N
        conditionKeys.starts_with = "sdp.condition.3"; // No I18N
        conditionKeys.ends_with = "sdp.condition.4"; // No I18N
        conditionKeys.in = "sdp.condition.5"; // No I18N
        conditionKeys.not_in = "sdp.condition.6"; // No I18N
        conditionKeys.eq = "sdp.condition.7"; // No I18N
        conditionKeys.neq = "sdp.condition.8"; // No I18N
        conditionKeys.greater_than = "sdp.condition.9"; // No I18N
        conditionKeys.lesser_than = "sdp.condition.10"; // No I18N
        conditionKeys.greater_or_equal = "sdp.condition.11"; // No I18N
        conditionKeys.lesser_or_equal = "sdp.condition.12"; // No I18N
        conditionKeys.on = "sdp.condition.13"; // No I18N
        conditionKeys.after = "sdp.condition.14"; // No I18N
        conditionKeys.before = "sdp.condition.15"; // No I18N
        conditionKeys.on_or_after = "sdp.condition.16"; // No I18N
        conditionKeys.on_or_before = "sdp.condition.17"; // No I18N
        conditionKeys.contains = "sdp.condition.18"; // No I18N
        conditionKeys.not_contains = "sdp.requests.fieldFormRules.criteria.not_contains"; // No I18N
        conditionKeys.between = "sdp.criteria.26"; // No I18N
        conditionKeys.not_between = "common.notbetween"; // No I18N
        return conditionKeys[key];
    },
    c_f.criteriaComponentOutput = function() {
            var outputData = [];
            var _self = this;
            jQuery('#container1').find('li.singlefilterwrapper').each(function(i, v) {
                // get selected operator attributes
                var operator = "";
                if (i > 0) {
                    operator = jQuery(this).find('.andor option:selected').val();
                } else {
                    operator = '';
                }

                // get selected column attributes
                var columnField = jQuery(this).find('.columnname option:selected').val();

                // get selected criteria attributes
                var criteriaField = jQuery(this).find('.selectcriteria option:selected').val();

                // check the data-type of criteriaField and get the value accordingly
                var inputType = jQuery(this).find('.selectcriteria option:selected').attr('data-type');
                var criteriaValField = {};
                var criteriavalTemp = [];
                var criteriaval = [];
                switch (inputType) {
                    case 'ajax_select': //NO I18N
                        var crit_fld_obj = jQuery(this).find('input.criteriaval').select2('data');//No I18N
                        criteriaValField = crit_fld_obj != null ? crit_fld_obj.id+"" : "";
                        break;
                    case 'select': //NO I18N
                        criteriaValField = jQuery(this).find('.criteriaval option:selected').val();
                        criteriaValField = criteriaValField != null ? criteriaValField+"" : "";
                        if (criteriaField.indexOf('_duration') >= 0) {
                            criteriaField = criteriaField.split('_duration')[0];
                        }
                        break;
                    case 'ajax_multiselect': //NO I18N
                        criteriaval = [];
                        jQuery(jQuery(this).find("input.criteriaval").select2('data')).each(function(index, crt_obj) {//No I18N
                            var $this = jQuery(this);
                            criteriavalTemp = "";
                            criteriavalTemp = crt_obj.id+"";
                            criteriaval.push(criteriavalTemp);
                        });
                        criteriaval = (criteriaval.length === 0)? null : criteriaval;
                        break;
                    case 'multiselect': //NO I18N
                        criteriaval = [];
                        jQuery(this).find("select.criteriaval option:selected").each(function() {
                            criteriavalTemp = jQuery(this).val();
                            criteriaval.push(criteriavalTemp);
                        });
                        criteriaval = (criteriaval.length === 0)? null : criteriaval;
                        break;
                    case 'datetime': //NO I18N
                    case 'date': //NO I18N
                        criteriaValField = (_self.filterBeginEndDayCal(criteriaField,Number(jQuery(this).find(("input[id*=datepicker]"))[0].value))); //To get start or end time with selected date
                        break;
                    default:
                        criteriaValField = jQuery(this).find('.criteriaval')[0].value.trim();
                        break;
                }

                if(inputType === 'multiselect' || inputType === 'ajax_multiselect'){
                    criteriaValField =  criteriaval;
                } else if (!Array.isArray(criteriaValField)) {
                    criteriaValField =  [criteriaValField];
                }
                outputData.push({
                    'logical_operator': operator, //No I18N
                    'field': columnField, //No I18N
                    'condition': criteriaField, //No I18N
                    'values': criteriaValField //No I18N
                });
            });
        return outputData;
    },
    c_f.isValidFilterCondition = function(filterDetailArray) {
        // validating all the fields
        for (var i = 0; i <= filterDetailArray.length - 1; i++) {
            var filterData = filterDetailArray[i];
            var columnVar = filterData.field;
            var critVar = filterData.condition;
            var critValVar = filterData.values != null ? filterData.values[0] : "";
            var columnType  = this.getFilterColumnType(filterData);
            var regex       = /^[0-9]+$/;
            var regex_double = /^\d*(\.\d+)?$/;
            if(columnType === "date" && typeof critValVar === "string" && critValVar.startsWith("$")){
                return true;
            }

            if ((columnVar === '' || columnVar === -1) || (critVar === '' || critVar === -1) || (critValVar === '' || critValVar === -1 || critValVar === undefined) || ((columnType === 'number' || columnType === 'long') && (!regex.test(critValVar))) || (columnType === 'double' && (!regex_double.test(critValVar))) || (columnType === 'date' && (isNaN(critValVar)))) {
                jQuery("#alertbox").remove();
                showalert('warning',translate("sdp.project.filters.error.invalidcond"),'isAutoHide=true,delay=5'); //No I18N
                return false;
            }
        }
        return true;
    },
    c_f.filterBeginEndDayCal = function(criteriaField, inputDate) {
            var outputJSONDate = [];
        var d   = new Date(inputDate);
        var day = d.getDate();
        var mon = d.getMonth();
        var yr  = d.getFullYear();

        if (criteriaField === 'on') {
            var start = new Date(inputDate);
            start.setHours(0, 0, 0, 0);

            var end = new Date(inputDate);
            end.setHours(23, 59, 59, 999);

            outputJSONDate.push(start.getTime());
            outputJSONDate.push(end.getTime());
            return outputJSONDate;
        }

        if(criteriaField === "after" || criteriaField === "on or before"){
            day++;
            var endDate;
            endDate = new Date(yr, mon, day, 0, -1, 0);
            outputJSONDate = endDate.getTime(); //End of day in milliseconds
        }

        if(criteriaField === "before" || criteriaField === "on or after"){
            var startDate;
            startDate = new Date(yr, mon, day, 0, 0, 0);
            outputJSONDate = startDate.getTime(); //Start of day in milliseconds
        }

        return outputJSONDate;
    },
    c_f.getFilterColumnType = function(filterObj) {
        var dataList = this.columnDataList.dataList;
            for(var i=0;i<dataList.length;i++){
                if (filterObj.field == dataList[i].VALUE) {
                    return dataList[i].TYPE;
                }
            }
    },
    c_f.CustomAddorRemoveRowCBFunction = function() {
        jQuery('#container1').find('li.singlefilterwrapper').find('.addrowbtn').removeClass('hide');
        if (jQuery('#container1').find('li.singlefilterwrapper').length >= 25) {
            jQuery('#container1').find('li.singlefilterwrapper:last').find('.addrowbtn').addClass('hide');
            jQuery('#hasmorerows').text(false);
        }else{
            jQuery('#hasmorerows').text("");
        }
    },
    c_f.updateFilterCondition = function (filterCondition, crit) {
        var jsonDataAry = [];
        for (var i = 0; i < filterCondition.length; i++) {
            var field = filterCondition[i].field;
            var isAjax = false;
            var c_arr  = crit.criteria_field_details;
            var field_type;
            for(var k=0;k< c_arr.length;k++){
                if(c_arr[k].field == field){
                    field_type = c_arr[k].field_type;
                    if(field_type === "#HREF"){
                        isAjax = true;
                    }
                }
            }
            var jsonData = {};
            jsonData.column = filterCondition[i].field;
            jsonData.criteria = filterCondition[i].condition;
            var criteriavalDisplay = [];
            var condObj = filterCondition[i].values;
            for(var j=0;j<condObj.length;j++){
                if(field_type === "date" && condObj[j].display_value) {
                    condObj[j].name = condObj[j].display_value;
                    condObj[j].id = condObj[j].value;
                    delete condObj[j].display_value;
                    delete condObj[j].value;

                }
                if(isAjax){
                    condObj[j].text = translate(condObj[j].name);
                    delete condObj[j].name;
                    if(condObj[j].text != undefined) {
                        criteriavalDisplay.push(condObj[j]);
                    }
                }else{
                    var dispval = typeof condObj[j] == "object" ? condObj[j].id : condObj[j];
                    criteriavalDisplay.push(dispval);
                }
            }
            if(field_type === "date" && !isNumeric(condObj[0].id)){
                jsonData.criteria = jsonData.criteria + "_duration"; // NO I18N
            }
            jsonData.criteriaVal = criteriavalDisplay;
            jsonData.operator = filterCondition[i].logical_operator;
            jsonDataAry.push(jsonData);
        }
        return jsonDataAry;
    },
    c_f.isAjaxField = function(field,c){
        var isAjax = false;
        var c_arr  = c.criteria_field_details;
        for(var i=0;i< c_arr.length;i++){
            if(c_arr[i].field == field && c_arr[i].field_type == "#HREF"){
                isAjax = true;
            }
        }
        return isAjax;
    },
    c_f.customAddRowValidateFunction = function(inputElArr) {
        var c_val = null;
        inputElArr.each(function(index) {
            jQuery(this).find('span.isValidated').remove();
            c_val = jQuery(this).find('.criteriaval');
            var errormsg = jQuery(this).parent().find('span.validation-msgg').text();
            if(c_val.length) {
                if (c_val.val() === null || c_val.val() === '' || c_val.val() === undefined) {
                    jQuery("#alertbox").remove();
                     showalert( 'warning',translate("sdp.project.filters.error.fillcond"),"isAutoHide=true"); // No I18N
                    jQuery(this).append('<span class="isValidated hidden">false</span>');//NO i18N
                    return false;
                }else if (errormsg.length > 0) {
                    jQuery("#alertbox").remove();
                    showalert( 'warning',translate("sdp.project.filters.error.invalidcond"),"isAutoHide=true"); //NO i18N
                    jQuery(this).append('<span class="isValidated hidden">false</span>');//NO i18N
                    return false;
                }else{
                    jQuery(this).append('<span class="isValidated hidden">true</span>');//NO i18N
                    var rowCount = index+1;
                    if(parseInt(rowCount) >= 25){
                        if(jQuery('#hasmorerows').text() == "false"){
                            jQuery("#alertbox").remove();
                            showalert( 'warning',translate("sdp.api.customfilter.condition.length"),"isAutoHide=true"); // No I18N
                            return false;
                        }
                    }
                }
            }
            else{
                jQuery(this).append('<span class="isValidated hidden">true</span>');//NO i18N
                var rowCountVal = index+1;
                if(parseInt(rowCountVal) >= 25){
                    if(jQuery('#hasmorerows').text() == "false"){
                        jQuery("#alertbox").remove();
                        showalert(translate("sdp.api.customfilter.condition.length"), 'warning', "isAutoHide=false"); // No I18N
                        return false;
                    }
                }
            }
        });
    },
    c_f.getCriteriaString = function(condition) {
         var filterConditions = condition;
            var filterConcatString = "";
            for (var i = 0; i < filterConditions.length; i++) {
                filterConcatString = filterConcatString + translate(filterConditions[i].display_value) + " ";

                var filterCondString = filterConditions[i].condition;
                var filterCondVal = (filterCondString.indexOf("_duration") === -1) ? filterCondString.replace(/_/g, " ") : (filterCondString.split("_duration")[0]).replace(/_/g, " ");
                filterConcatString = filterConcatString + translate(this.getI18NKeysForCondition(filterCondVal)) + " ";

                var criteriavalDisplay = "";
                var cond_obj = filterConditions[i].values ? filterConditions[i].values: [];
                for(var j=0;j<cond_obj.length;j++){
                    if(cond_obj[j] && cond_obj[j].display_value) {
                        cond_obj[j].name = cond_obj[j].display_value;
                    }
                    var display_value = ""; // No I18N
                        if(filterConditions[i].field  == "status" && this.module =="change"){
                        	 if(cond_obj[j].name === undefined) {
                                 display_value = cond_obj[j];
                             } else {
                            display_value = cond_obj[j].stage ? cond_obj[j].stage.name+" -> "+cond_obj[j].name : cond_obj[j].name;}
                        }else if(filterConditions[i].field =='subcategory'){ // No I18N
                            if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else{
                            	 if(cond_obj[j].name === undefined) {
                                     display_value = cond_obj[j];
                                 } else {
                                display_value = cond_obj[j].category.name+" -> "+cond_obj[j].name;} // No I18N
                            }
                        }else if(filterConditions[i].field =='item' && cond_obj[j] !== null){ // No I18N
                            if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else{
                            	if(cond_obj[j].name === undefined) {
                                    display_value = cond_obj[j];
                                } else {
                                display_value = cond_obj[j].subcategory.category.name+" -> "+cond_obj[j].subcategory.name+" -> "+cond_obj[j].name;} // No I18N
                            }
                        }else if(filterConditions[i].field=='group'  && cond_obj[j] !== null && cond_obj[j].hasOwnProperty("siteid")){
                        	if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else if(cond_obj[j].siteid==null){
                            	display_value = translate('common.site.nosite')+" -> "+cond_obj[j].name;
                            }else{
                            	 if(cond_obj[j].name === undefined) {
                                     display_value = cond_obj[j];
                                 } else {
                                display_value = cond_obj[j].siteid.name+" -> "+cond_obj[j].name; }// No I18N
                            }
                        }else{
                            display_value = (typeof cond_obj[j] == "object" ? cond_obj[j] !== null ? cond_obj[j].name : "" : cond_obj[j]);
                        }

                        if (criteriavalDisplay === "") {
                            criteriavalDisplay = display_value;
                        } else {
                            criteriavalDisplay = criteriavalDisplay + "," + display_value;
                        }
                }
                // is empty and is not empty string handling
                var emptyStr = ""; //No I18N
                if(filterConditions[i].hasOwnProperty("value") && filterConditions[i].value == null){
                    emptyStr = " " + translate("sdp.common.empty").toLowerCase() + " "; //No I18N
                }
                // when the values are comes as null need to display the none in UI
                if(Array.isArray(filterConditions[i].values) && filterConditions[i].values[0] == null){
                    emptyStr = translate("common.none"); //No I18N
                }
                filterConcatString = filterConcatString + criteriavalDisplay + emptyStr;
                if (i < filterConditions.length - 1) {
                    filterConcatString = filterConcatString + " " + filterConditions[i + 1].logical_operator + " ";
                }
            }
            return e_html(filterConcatString);
    },
    c_f.saveAndManage = function(arg) {
        var _self =this;
        var arrVar = this.criteriaComponentOutput();
        var viewName = jQuery('#filtername').val(); // No I18N
        if(viewName.length > 50){
            jQuery("#alertbox").remove();
            showalert('warning',translate("sdp.customfilter.invalid.filterName"),'isAutoHide=true,delay=5'); //No I18N
            return;
        }
        var description= jQuery('#filterdesc').val();
        if(description.length > 250){
            jQuery("#alertbox").remove();
            showalert('warning',translate("sdp.customfilter.invalid.filterDesc"),'isAutoHide=true,delay=5'); //No I18N
            return;
        }
        var filter_id = jQuery("#filter_id").val(); // No I18N
        if (jQuery.trim(viewName) == "") {
            showalert('warning',translate("sdp.project.filters.error.filtername"), 'isAutoHide=true,delay=5'); // No I18N
            jQuery('#filtername').val("").trigger('focus');
            return false;
        } else if (this.isValidFilterCondition(arrVar)) {
            var urlVal = "";
            var inputObject = {};
            var l_f = {};
                l_f.display_name = viewName;
                l_f.criteria = arrVar;
                l_f.description = description;
                l_f.scope = jQuery("#chk_public").prop('checked')==true?2:1; //No I18N
                l_f.module = this.module;
                inputObject.list_view_filter = l_f;
            var dataVal = "",
                methodType = "";
                url = "/api/v3/list_view_filters"  // No I18N
                methodType = filter_id !== "" ? 'PUT' : 'POST'; // No I18N
                url = methodType == 'PUT' ? url + "/" + filter_id : url;
                dataVal = sdpAjaxInputData(inputObject);
               sdpAjax({
                    headers: {
                        "accept": "v3+json"  // No I18N
                    },
                    url: url,
                type: methodType,
                dataType: "json",  // No I18N
                data: dataVal,
                success: function(resp) {
                    responseText = resp.response_status;
                      if (responseText && (responseText.status === "success" || (responseText.messages && responseText.messages[0].type.toLowerCase() == "success"))) {
                        if (arg == 'save') {
                            window.location.href = '/ListViewFilter.do?module=' + _self.module + '&action=listview';
                        } else {
                            window.location.href = '/ListViewFilter.do?module=' + _self.module + '&action=addfilter';
                        }
                      } else {
                        showalert('failure', e_html(responseText.messages[0].message),"isAutoHide=false"); // No I18N
                      }
                    },
                error: function(jqXHR, textStatus, errorThrown) {
                    response = JSON.parse(jqXHR.responseText);
                    if(response.response_status.messages[0].status_code === 4008){
                        showalert('warning',translate("sdp.api.customfilter.name.exists"), 'isAutoHide=true'); //NO I18N
                    }
                    if(response.response_status.messages[0].status_code === 4001){
                        if(response.response_status.messages[0].field == "display_name"){
                            showalert('warning',translate("sdp.customfilter.invalid.name"), 'isAutoHide=true'); //NO I18N
                        } else {
                            showalert('warning',response.response_status.messages[0].message, 'isAutoHide=true'); //NO I18N
                        }
                    }
                }
            });
        }
    },
c_f.updateFilterPublic = function(argStr) {
        var spl_val = argStr.split(",");
        var id = spl_val[0];
        var isUpdated = false;
        var inputObject = {};
        var l_f = {};
        var inactive=spl_val[2];
        l_f.module = spl_val[3];
        if(spl_val[1]==2||spl_val[1]==3){
            l_f.scope=1;
        }else{
          l_f.scope=2;
        }
        if(c_f.isCustomFilter){
            inputObject.list_view_filter = l_f;
        }else{
             inputObject.custom_view = l_f;
        }
        var scrollTop=jQuery("#list_view_filters_kanban_div").scrollTop()
        var dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
            url: c_f.isCustomFilter?'/api/v3/list_view_filters/' + id:'/api/v3/custom_views/' + id, // No I18N
            type: 'PUT', // No I18N
            headers: {
                "accept": "v3+json" // NO I18N
            },
            data: dataVal,
            success: function(jsonArray) {
                showalert('success',translate("sdp.api.customfilter.updated"), 'isAutoHide=true'); //NO I18N
                isUpdated = true;

                //Special handling for SDAdmin updating other's filters.
                if(l_f.module == 'request' || l_f.module == 'solution'){
                    if(sdp_user.ROLES && sdp_user.ROLES.indexOf('SDAdmin')>=0){
                        if(sdp_user.LOGGEDIN_USERID  != jsonArray.list_view_filter.created_by.id){
                            jQuery("div[data-entityid='"+id+"']").remove();
                            return;
                        }
                    }
                }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                response = JSON.parse(jqXHR.responseText);
                var message = response.response_status.messages? response.response_status.messages[0] : null;
                if(message.field && message.field === 'criteria'){
                    showalert('failure', translate("sdp.customfilter.invalid.criteria"),"isAutoHide=false,delay=5"); // No I18N
                }
                else if(message.status_code === 4002){
                    showalert('warning', e_html(message.message),"isAutoHide=true,delay=5"); // No I18N
                }
                if(l_f.module == 'request' && response.response_status.messages[0].status_code === 4008){
                     showalert('failure',translate("sdp.api.customfilter.name.exists"), 'isAutoHide=false'); //NO I18N
                }
            },
            async: false
        });
        if (isUpdated == true) {
            jQuery(`[data-id="${id}"]`).attr('data-action-param', `${id},${l_f.scope},${inactive},${l_f.module}`);
            if (l_f.scope==2) {
                jQuery("#cf_privacy_col_" + id).find("span").removeClass("private-filter").addClass("public-filter").end().next("span").text(translate("sdp.dashboard.common.public")); //No I18N
                jQuery("#cf_privacy_drop_" + id).text(translate("project.filters.markprivate1")); //No I18N
            }else{
                jQuery("#cf_privacy_col_" + id).find("span").removeClass("public-filter").addClass("private-filter").end().next("span").text(translate("sdp.dashboard.common.private")); //No I18N
                jQuery("#cf_privacy_drop_" + id).text(translate("sdp.project.filters.markprivate")); //No I18N
            }
            //Public|Private marking can be updated from Custom filter list view hence it has to be updated in Visible components too.
            cust_filter.filter_table.visibleContents.filter(function (filter) {
            if(filter.id == id){
                filter.scope=l_f.scope};
            });
            cust_filter.filter_table.refreshTable();
            setTimeout(function() {jQuery("#list_view_filters_kanban_div").scrollTop(scrollTop)}, 60);

        }
    },
    c_f.previewFilter = function() {
        var arrVar = this.criteriaComponentOutput();
        if (this.isValidFilterCondition(arrVar)) {
            if (arrVar != "") {
                this.redirectFilterPreview(sdpToJSON(arrVar));
                setTimeout(function() {
                    jQuery('html, body').animate({
                        scrollTop: jQuery('#filter-condition').position().top
                    }, 'slow'); // No I18N
                }, 1000);
            } else {
                showalert('warning',translate("sdp.project.filters.error.fillcond"), 'isAutoHide=true,delay=5'); // No I18N
            }
        }
    },
    c_f.redirectFilterPreview = function(criteriaData) {
        this.showFilterPreview(criteriaData);
        setTimeout(function() {
            jQuery('#proj-list').removeClass("hide");
            jQuery('.proListhead').hide();
            jQuery('#TaskActions_span').hide();
            jQuery('.trash-icon').parent().hide();
            jQuery('#bulkactionsMenu').parent().hide();
            jQuery('#headerbar').show();
            jQuery('.columnEditButton').hide();
            if (jQuery('filterFormControl1').is(':visible')) {
                jQuery('#filterFormControl1').hide();
                jQuery('#filterFormControl2').show();
            } else {
                jQuery('#filterFormControl1').show();
                jQuery('#filterFormControl2').hide();
            }
            jQuery('.selectwrap').css({
                'height': '27px', //No I18N
                'width': '39px' //No I18N
            });
            jQuery('#proj-list').show();
        }, 1000);
    },
    c_f.showFilterPreview = function(criteriaData){
        reqParams = "module="+this.module+"&criteria=" + encodeURIComponent(criteriaData);//No i18N
        updateState(this.uniqueId,'_D_RP',reqParams);
        refreshSubView(this.uniqueId);
        return;
    },
    c_f.initNewCustomFilter = function (options) {
        var filter_options = {
            parentDiv: options.selector,
            entity: options.entity,
            entityComponent: cust_filter,
            applyFn: this.previewNewCustomFilter,
            cancelFn: cust_filter.toggleViews,
            enableSave: true,
            skipFields: options.discorded_fields,
            haveNestedColumns: options.haveNestedColumns == false ? false : true,
            module: options.module,
            refFiltFn: function (resp) {
                if (resp.response_status.status === "success") {
                    // showalert("success", resp.response_status.message, "isAutoHide=true, delay=3") //No I18N
                    cust_filter.filter_table.refreshTable();
                }
            },
            errFiltFn: function (resp) {
                if(resp.responseJSON.response_status.messages[0].status_code === 4008){
                    showalert("failure", translate("sdp.api.customfilter.name.exists"), "isAutoHide=true, delay=3") //No I18N
                }
                else if(resp.responseJSON.response_status.messages[0].status_code === 4001){
                    if(resp.responseJSON.response_status.messages[0].field == "display_name"){
                        showalert("failure", translate("sdp.customfilter.invalid.name"), "isAutoHide=true, delay=3") //No I18N
                    } else {
                       showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                    }
                }
                else{
                    showalert("failure", resp.responseJSON.response_status.messages[0].message, "isAutoHide=true, delay=3") //No I18N
                }
            },
            metaOverride: options.metaoverRide,
            passOnlyIds: options.passOnlyIds == false ? false : true,
            haveOtherUDF: true,
            customView: {
                have_icon: false,
                title_text: translate("sdp.requests.listview.customview.create.button"),
                apply_text: translate("sdp.common.preview"),
                dialog_title_text: translate("sdp.requests.listview.customview.create.button"),
                title_btn_style:""
            },
            specialFormats: ["have_none"],
            allowNegativeValues: options.allowNegativeValues==false ? false:true,
            dollarSupport:options.dollarSupport  ? options.dollarSupport:{
                "$_user":{"fields": ["technician","sla_violated_technician","fr_sla_violated_technician","created_by"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} }, //No I18N
                "$_system_user":{"fields": ["created_by"], "option":{"id":"$(system_user)", "text": translate("common.systemuser")} },//No I18N
                "$_group":{"fields": ["group"], "option":{"id":"$(my_group)", "text": translate("sdp.requests.listview.allmyqueues")} }//No I18N
            },
            haveStrTypesUDF: true,
            haveMultiString: true,
            changeURLData: this.changeURLData,
            setNullSiteDef:true,
            ignoreNoneFields:options.ignoreNoneFields ? options.ignoreNoneFields :['site','template','status','requester','created_by'], //No I18N
            addNoneOption:this.addNoneOptionFn
            // enableDragHandle: true,
            // innerCriteriaEnabled:true,
            // haveRepeatedValues: false
        };
        filter_options.metaParam = "list_view_filter"; //No I18N
        filter_options.allowReadOnly = true;
        if(sdp_user.ROLES.indexOf("SDAdmin") == -1 ){ //No I18N
            filter_options.hideMarkPublic = true
        }
        if(options.module == 'request'){
            filter_options.enableDragHandle = true;
            filter_options.innerCriteriaEnabled = true;
            filter_options.maxinnerrows = 5;
            filter_options.subFieldsArr= {"site":["region","name"]}; //No I18N
            filter_options.subUDFFields= {"requester": ["user_udf_fields"] , "technician": ["user_udf_fields","technician_udf_fields"], "on_behalf_of":["user_udf_fields"], "created_by":["user_udf_fields"], "editor":["user_udf_fields","technician_udf_fields"], "sla_violated_technician":["user_udf_fields","technician_udf_fields"],"fr_sla_violated_technician":["user_udf_fields","technician_udf_fields"]}; //No I18N
            filter_options.haveOtherUDF=false;
            filter_options.noneValID= "$(none)"; //No I18N
            //#SD-120037
            filter_options.dollarSupport ? filter_options.dollarSupport.$_pendingstatus={"fields": ["status"], "option":{"id":"$(is_pending)", "text": translate("sdp.common.allpending")} }: filter_options.dollarSupport;//No I18N
            filter_options.dollarSupport ? filter_options.dollarSupport.$_completedstatus={"fields": ["status"], "option":{"id":"$(is_completed)", "text": translate("sdp.common.allcompleted")} }:filter_options.dollarSupport;//No I18N
            filter_options.haveStrTypesUDF = false;
            filter_options. skipFieldTypeConditions = {
                "status" : ["is_empty", "is_not_empty"] // No I18N
            }
        }else if(options.module == 'project' || options.module === "task"){// No I18N
            filter_options.haveNestedColumns = false;
            filter_options.handleInOperators  = true;
            filter_options.haveInactiveValues = (options.module !== "task");//No i18n
            filter_options.noneValID= "$(none)"; //No I18N
            filter_options.ignoreNoneFields = ["status","associated_entity","created_by"];//No I18N
            filter_options.dollarSupport  = {
                "$_user"             : {"fields": ["owner","created_by","requester","marked_owner"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} },//No I18N
                "$_status_pending"   : {"fields": ["status"], "option":{"id":"$(is_pending)", "text":translate("sdp.common.allpending")}},//No I18N
                "$_status_completed" : {"fields": ["status"], "option":{"id":"$(is_completed)", "text":translate("sdp.common.allcompleted")}},//No I18N
                "$_group"            : {"fields": ["group","marked_group"], "option":{"id":"$(my_group)", "text":translate("sdp.requests.listview.allmyqueues")}}//No I18N
            }
            filter_options.dateCustomize = $tasks.getCustomDateCond();
            filter_options.allowed_value = {
                callback : function(list_info, field){
                    if(["owner","created_by","site","requester","department"].contains(field)){
                        list_info = {"fields_required": ["name"]};      //No I18N
                    }
                    return list_info;
                }
            };
            // MarkAsPublic is allowed only for SDAdmin/SDSiteAdmin in Task and Users with ViewAllProjects permission in Projects
            filter_options.hideMarkPublic = (options.module === 'task' && (sdp_user.ROLES.indexOf("SDAdmin") == -1 && sdp_user.ROLES.indexOf("SDSiteAdmin") == -1))
                                                    || (options.module == 'project' && jQuery("#canViewAllProjects").val() === 'false');
        }
        if(options.module== 'solution'){
            filter_options. skipFieldTypeConditions = {
                                           "created_time" : ["is_empty", "is_not_empty"], // No I18N
                                           "created_by": ["is_empty", "is_not_empty"], // No I18N
                                           "last_updated_by" : ["is_empty", "is_not_empty"], // No I18N
                                           "approval_status":["is_empty", "is_not_empty"], // No I18N
                                           "id":["is_empty", "is_not_empty"], // No I18N
                                       },

            filter_options.changeData = function(data,field){
                  if(field=='is_public'){
                      data[0].text=translate("sdp.dashboard.common.public");//No I18N
                      data[1].text=translate("sdp.dashboard.common.private");//No I18N
                  }
                  else if(field == 'problem_resolution'){
                      data[0].text=translate("sdp.admin.settings.yes");//No I18N
                      data[1].text=translate("sdp.admin.settings.no");//No I18N
                  }
                  return data;
            },
            filter_options.chkMandatory = true;
            filter_options.enableDragHandle = true;
            filter_options.innerCriteriaEnabled = true;
            filter_options.maxinnerrows = 5;

        }
		filter_options.serialize= function(data,type){
			if(data.field=="maintenance"){
				if(type=="get"){
					if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
					{
						data.condition="is not"; //No I18N
						data.values=[null];
					}
					else
					{
						data.condition="is"; //No I18N
						data.values=[null];
					}
				}
				else{
					if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
					{
						data.values=['false'];
					}
					else
					{
						data.condition="is"; //No I18N
						data.values=['true'];
					}

				}
				return data;
			}
			else{
				return data;
			}
		}
        if(isMSPOrSCP){
            if(options.module == 'request'){
            if(isMSP){
                filter_options.subFieldsArr.account = ["name","country","city","doornumber","emailid","fax","weburl","postalcode","state","street","landline"]; //No I18N
            }else{
                filter_options.subFieldsArr.account = ["name","country","city","doornumber","emailid","fax","weburl","postalcode","state","street","landline","account_manager","industry","timezone","inactive"]; //No I18N
                filter_options.subFieldsArr.product = ["name","product_type","inactive"]; //No I18N
                filter_options.subUDFFields.account=["accountudf_fields"]; //No I18N
                filter_options.subUDFFields.product=["udf_fields"]; //No I18N
            }
          }
        }
        viewFilterComponent.initComponent(filter_options);
    },
    c_f.initNewCustomView =  options =>{  // method to call when new custom view UI has to be loaded for a module
          var filter_options = {
            isCustomView:!c_f.isCustomFilter,
            holder: options.selector,
            entity: options.entity,
            entityComponent: cust_filter,
            cancelFn: cust_filter.toggleViews,
            saveConfig:cust_filter.detailsPageOptions(),
            saveFn: c_f.saveFn,
            applyFn: cust_filter.previewNewCustomFilter,
            errorFn:c_f.errorFn,
            enableSave: true,
            module: options.module,
            passOnlyIds: true,
            metaParam : "list_view_filter", //No I18N
            preSaveFn: options.preSaveFn,
            customConfig: {
                have_icon: false,
                title_text: translate("sdp.requests.listview.customview.create.button"),
                apply_text: translate("sdp.common.preview"),
                dialog_title_text: translate("sdp.requests.listview.customview.create.button"),
                title_btn_style:""
            },
            criteriaOptions:{
                skipFields: options.discorded_fields,
                metaOverride: options.metaoverRide,
                dateCustomize:options.dateCustomize,
                allowReadOnly : true,
                haveOtherUDF: true,
                haveNestedColumns : true,
                specialFormats: ["have_none"],
                allowNegativeValues: true,
                dollarSupport:{
                    "$_user":{"fields": ["technician","sla_violated_technician","created_by"], "option":{"id":"$(logged_in_user)", "text": translate("sdp.common.loggedinuser")} }, //No I18N
                    "$_system_user":{"fields": ["created_by"], "option":{"id":"$(system_user)", "text": translate("common.systemuser")} },//No I18N
                    "$_group":{"fields": ["group"], "option":{"id":"$(my_group)", "text": translate("sdp.requests.listview.allmyqueues")} }//No I18N
                },
                haveStrTypesUDF: true,
                haveMultiString: true,
                changeURLData: this.changeURLData,
                setNullSiteDef:true,
                ignoreNoneFields:['site','template','status','requester','created_by'], //No I18N
                addNoneOption:this.addNoneOptionFn
            }
        };
                 filter_options.serialize= (data,type)=>{
            if(data.field=="maintenance"){
                if(type=="get"){
                    if((data.condition=="is"&&data.values&&data.values[0]&&data.values[0]=='true')||(data.condition=="is not"&&data.values&&data.values[0]&&data.values[0]=='false'))
                    {
                        data.condition="is not"; //No I18N
                        data.values=[null];
                    }
                    else
                    {
                        data.condition="is"; //No I18N
                        data.values=[null];
                    }
                }
                else{
                    if(data.condition=="is"&&data.values&&data.values.length>0&&data.values[0]==null)
                    {
                        data.values=['false'];
                    }
                    else
                    {
                        data.condition="is"; //No I18N
                        data.values=['true'];
                    }

                }
                return data;
            }
            else{
                return data;
            }
        }
        customViewFilter.init(filter_options);
    },
    c_f.previewTBComponent = {},
    //Method to append 'None' to field value in criteria section, if allowed values is empty.
    c_f.addNoneOptionFn=  function(id){
        if(cust_filter.module === "request"){
            return [{"id": "$(none)", "text":translate("common.none")}]; //No I18N
        }
    },
    c_f.previewNewCustomFilter = function (criteria) {
        var module = cust_filter.moduleMap[cust_filter.module];
        var tableHolder = module == "requests" ? "requests_list" : (module === "tasks"?"showAllTasks_tasks":module); // No I18N
        jQuery("#pagination_comp_filters_preview").attr("id", "pagination_comp_"+tableHolder);
        jQuery("#t_searchicon_filters_preview").attr("id", "t_searchicon_" + tableHolder);
        jQuery("#filter_preview_div").attr("id", (module === "projects"? "projectsDiv":(module === "tasks"?"tasksList":tableHolder +"_div")));
        !jQuery("#filter_preview_container").is(":visible") ? cust_filter.toggleViews(): undefined; // No I18N
        if(cust_filter.module === "request"){
            requestListData.viewName = "";
            requestListViews.viewMode = "table"; // No I18N
            requestListViews.filter_by = undefined;
            requestListViews.from = "cf_request"; //No I18N
            requestListViews.get_total_count = true;
            requestListViews.input_data = {
                "list_info": { //No I18N
                    search_criteria:criteria
            },"for":"list_view_filter"} //No I18N
            requestListViews.initRequestListView()
        }else if(cust_filter.module === "project"){// No I18N
            var projectOptions = {};
            projectOptions.from = "printView"; //No I18N
            projectOptions.advFilterCrit = criteria
            ResourceLoader({
                js:["/scripts/projectList.js", "/scripts/hbs-template-project.js"], //No I18N
                success: function(){    $projectList.init(projectOptions);  }
            });
        }else if(cust_filter.module === "task"){// No I18N
             var taskOptions = {};
             taskOptions.from = "printView"; //No I18N
             taskOptions.advFilterCrit = criteria;
             taskOptions.viewMode = "table";// NO I18N
             ResourceLoader({
                 js:["/scripts/taskList.js", "/scripts/hbs-template-task.js"], //No I18N
                 success: function(){    $taskList.init(taskOptions);  }
             });
        }

        if(cust_filter.module === "solution"){
            jQuery("#filter_preview_container").attr('class','listview')
            $SolGlobal.advancesearch_preview(criteria);
        }

    },
    c_f.toggleViews = function () {
        if(jQuery("#filter_preview_container").is(":visible")){
            jQuery("#filter_preview_container").animate({ top: "100%" }, 400, "swing", function () { // No I18N
                jQuery("#filter_preview_container").addClass("hide");
                jQuery("#listview").removeClass("hide");
                jQuery("#cf_default").html(jQuery("#custom_filter_" + cust_filter.module).detach());
                handleResizeBtnVal(jQuery("#filter_preview_container .listcontrols")); // No I18N
            });
        } else {
            jQuery("#filter_preview_container").removeClass("hide");
            jQuery("#filter_preview_container").animate({ top: "0" }, 400, "swing", function () { // No I18N
                jQuery("#listview").addClass("hide");
                setTimeout(function () {
                    jQuery("#cf_preview").html(jQuery("#custom_filter_" + cust_filter.module).detach());
                    jQuery(window).scrollTop(0);
                },500)
            });
        }
    },
    c_f.editFilterCriteria =argStr => {

        var arg = argStr.split(",");
        var id = arg[0];
        var isPreview=arg[1];

        if(cust_filter.restrictEdit){return;}
        var filterC = cust_filter.filter_table.visibleContents.filter(function (filter) {
            return filter.id == id;
        });
        var filter = jQuery.extend(true, {}, filterC[0]);
        if (filter) {
            if (isPreview) {
                jQuery("#cf_preview").html(jQuery("#custom_filter_" + cust_filter.module).detach());
            }
            jQuery(window).scrollTop(0)
            jQuery("#custom_filter_" + cust_filter.module + " .viewFiltLeft").trigger("click");
            var options = {
                search_criteria: filter.criteria,
                filter_name: filter.display_name,
                filter_id: filter.id,
                scope: filter.scope,
                description:filter.description
            }
            if(c_f.isCustomFilter){
                setTimeout(function () {
                    viewFilterComponent.updateComponent(options);
                    isPreview && jQuery(".apply-filter").trigger("click");
                }, 500); //taskid: 74742,74992 Fix
            }else{
                options.fields_required=filter.fields_required,
                options.shared_to=filter.shared_to,
                options.sort_info=filter.sort_info,
                options.is_custom_view=filter.is_custom_view,
                options.description=filter.description
                setTimeout(()=>{
                    customViewFilter.update(options);
                    isPreview && jQuery(".apply-filter").trigger("click");
                }, 500);
            }

        }
    },
    c_f.moduleMap = {
            "request": "requests", //No I18N
            "solution":"solutions", //No I18N
            "project": "projects", //No I18N
            "task": "tasks" //No I18N
    },
    c_f.restrictEdit=false,
    c_f.toggleCheckbox = function(elm){
        var tblObj = cust_filter.filter_table;
        var selectedId = tblObj.bulkSelect.getSelectedIDs().length;
        if (selectedId > 0) {
            jQuery("#listcontrols").find("#custom_filter_"+cust_filter.module).hide().end().find("#filterViewMenu").hide().end().find("#addNewFltr").hide().end().find("#t_searchicon_list_view_filters").hide().end(); //No I18N
            jQuery("#list_view_filters_div").find(".toggle-edit").hide();
            cust_filter.restrictEdit=true;
        } else {
            jQuery("#listcontrols").find("#custom_filter_"+cust_filter.module).show().end().find("#filterViewMenu").show().end().find("#addNewFltr").show().end().find("#t_searchicon_list_view_filters").show().end(); //No I18N
            jQuery("#list_view_filters_div").find(".toggle-edit").show();
            cust_filter.restrictEdit=false;
        }
    },
    c_f.changeURLData= function(field,url){ //Method to handle modifications in API URLs used in Custom filter component
        if(cust_filter.module === "request"){
            var  fieldData='';
            var fieldIncludesInactives=['category','subcategory','item','department','group','impact','level','mode','priority','urgency','closure_code','request_type','service_category','sla_violated_group','fr_sla_violated_group','sla','status','template','site']; //No I18N
            var fieldIncludesFor=['on_behalf_of','template','status','service_category','sla','requester']; //No I18N
            var data={};
            if(url){ //This section is for handling changes in URL of allowed values API
                if(fieldIncludesFor.includes(field)){
                    data["for"]="list_view_filter"; //No I18N
                }
                if(fieldIncludesInactives.includes(field) || field.indexOf("udf_pick_") > -1){
                    data["include_inactive_value"]=true; //No I18N
                }
                fieldData={"data":data};//No I18N
                return fieldData;
            }
            else{ //This section is for handling changes in URL of Meta Info API
                if(field == "item" || field == "subcategory" || field == "category" || field == "site" || (isMSPOrSCP && field == "account")){
                    fieldData={"data":{input_data:sdpToJSON( {"for":"list_view_filter"})}}; //No I18N
                    return fieldData;
                }
            }
        }else if(cust_filter.module === "task"){//No I18N
            var data = {};
            if(field == "group" || field == "marked_group"){
                data.for = "list_view_filter";//No I18N
            }
            var fieldIncludesInactives = ["status","priority","type","created_by","group","template"];//No I18N
            if(fieldIncludesInactives.contains(field) || field.indexOf("pick_") > -1){
                data.include_inactive_value = true;
            }
            urlOptions = {"data": data};//No I18N
            if(field === "marked_owner" || field === "marked_group"){
                urlOptions.field = field.replace("marked_", "");
            }
            return urlOptions;
        }else if(cust_filter.module === "project"){//No I18N
            return {"data":{"for":"list_view_filter"}};//No I18N
        }
    },
 c_f.enableOrDisableView = argStr => { //Method to call to enable or disable custom views
     var arg = argStr.split(",");
     var id = arg[0];
     var viewData = {};
     var inactive=arg[2]=="true"?true:false;
     var scope=arg[1];
     viewData.inactive =!inactive;
     viewData.module = arg[3];

     var convenienceOper=inactive?'enable':'disable';// No I18N
     var url=c_f.isCustomFilter?'/api/v3/list_view_filters/' + id+'/'+convenienceOper:'/api/v3/custom_views/' + id+'/'+convenienceOper // No I18N
     var scrollTop=jQuery("#list_view_filters_kanban_div").scrollTop()
     sdpAjax({
         url: url,
         type: 'PUT', // No I18N
         headers: {
             "accept": "v3+json" // NO I18N
         },
         success: jsonArray=> {
             var keyName = (inactive) ? "common.action.enabled":"common.action.hidden"; // No I18N
             var tempName = translate('common.filter');
             showalert('success',translate(keyName,[tempName]), 'isAutoHide=true'); //NO I18N
             jQuery(`[data-id="${id}"]`).attr('data-action-param', `${id},${scope},${viewData.inactive},${viewData.module}`);// No i18N
             jQuery("#cf_active_status_col_" + id).prop('checked',inactive) //No I18N
             jQuery("#cf_active_status_col_label_" + id).attr('title',inactive?translate('common.enabled'):translate('common.disabled'))//No I18N
             cust_filter.filter_table.visibleContents.filter( filter => {
                 if(filter.id == id){
                      filter.inactive=viewData.inactive
                  };
             });
             cust_filter.filter_table.refreshTable();
         },
         error: (jqXHR, textStatus, errorThrown)=> {
             response = JSON.parse(jqXHR.responseText);
             var message = response.response_status.messages? response.response_status.messages[0] : null;
             if(message.field && message.field === 'criteria'){
                 showalert('failure', translate("sdp.customfilter.invalid.criteria"),"isAutoHide=false,delay=5"); // No I18N
             }
             else if(message.status_code === 4002){
                 showalert('warning', e_html(message.message),"isAutoHide=true,delay=5"); // No I18N
             }
             if(viewData.module == 'request' && response.response_status.messages[0].status_code === 4008){
                  showalert('failure',translate("sdp.api.customfilter.name.exists"), 'isAutoHide=false'); //NO I18N
             }
         },
         async: false
     });
     setTimeout(function() {jQuery("#list_view_filters_kanban_div").scrollTop(scrollTop)}, 60);

 }

    return c_f;
}(jQuery));
