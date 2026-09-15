// $Id$
/* Listview actions and template compilation*/
var $problemList = {
    table_comp_problem : {},
    view : 'table',// No I18N
    viewMode : 'table', // No I18N
    filter_view_display_name : '',
    fromCMDB : false,
    cmdb_base_criteria : {},
    //initialize the list holder, filter section
    init : function(options){
        renderhbs('#problem-section', 'problem_list_section', options, false, 'problems');//No I18N
        Handlebars.registerPartial("pb_table_render", renderhbs(null,'pb_web_component_template',null,null,'problems',null,true,null,true)); //No I18N
        //This object helps to find from which page, form is invoked
        $problemGlobal.fromPage = "list"; // No I18N
        var _self = this;
        _self.printPreview = options.printPreview;
        if(options.from){
            _self.from = options.from;
            _self.fromPl = _self.from + "s"; // No I18N
        }
        _self.module = _self.from=='request'?"problem":"problems"; // No I18N
        _self.modulePlural = "problems"; // No I18N
        if(options.associatedEntityId){
            _self.associatedEntityId = options.associatedEntityId;
            _self.entity = 'problem';// No I18N
            _self.operation = options.operation;
            if(options.fromActions){
                _self.fromActions = options.fromActions;
            }
        }
        if(options.from == "asset" || options.from == "services") {
            _self.fromCMDB = true;
        }

            _self.filter_view_internal_name = "my_open_problems";// No I18N

        var current_view = Object.assign({}, sdp_user.CLIENT_CONF.problems_currentview);
        var viewMode = "table",view = "table";// No I18N
        var params = getSDPURLParams();
        _self.search_text = params.gsearch;
        if(_self.search_text){
            _self.filter_view_display_name = translate("sdp.leftpanel.search.title");// No I18N
        }
        if(options.listViewType){
            _self.listViewType = options.listViewType;
            //Added sort_field below to work around the issue where multiple results will be returned in specific cases. (Ex: pending_problems will return pending_problems as well as my_pending_problems due to search_fields usage) 
            let data = { list_info: { search_fields: {name: options.listViewType }, sort_field:"name", sort_order:"desc" }, module: "problem"}// No I18N
            data = sdpAjaxInputData(data);
            sdpAjax({
                url: '/api/v3/list_view_filters', // No I18N
                data:data,
                success: function(resp) {
                    _self.filter_view_display_name = resp.list_view_filters[0].display_name;
                },
                async: false
            });
            if(current_view.view == "classic"){
                viewMode = "linear";// No I18N
                view = "kanban";// No I18N
            }
        }else if(current_view && !options.associatedEntityId){
            if(!_self.search_text && current_view.filter_by && current_view.filter_by.id){
                var filter_id = current_view.filter_by.id;
                sdpAjax({
                    url: '/api/v3/list_view_filters/'+filter_id, // No I18N
                    success: function(resp) {
                        _self.filter_view_display_name = resp.list_view_filter.display_name;
                    },
                    async: false
                });
            }
            if(current_view.view == "classic"){
                viewMode = "linear";// No I18N
                view = "kanban";// No I18N
            }
        }
        _self.setTemplate(view,viewMode);

        // Help Videos self.form check is added here to avoid the module tour opening from the associations.
        if(sdp_app && sdp_app.IS_SDP && !sdp_app.IS_REBRAND && !_self.from){
            if(sdp_user.USERTYPE === 'Technician' && sdp_user.ROLES.includes("ViewProblems")){ // No I18N
                HelpVideos.init('Problems', '#spa-container'); //No I18N
            }
            if(sdp_user.TOURS_TOLOAD && sdp_user.TOURS_TOLOAD.includes("Problems")){ // No I18N
                HelpVideos.open('Problems',false); // No I18N
            }   
        }
    },
    //Context for web component is set here
    setTemplate : function(view,viewMode){
        /*To destroy previous instance of tablecomponent*/
        if($problemList && $problemList.table_comp_problem && !jQuery.isEmptyObject($problemList.table_comp_problem)){
            $problemList.table_comp_problem.destroy();
        }
        var _self = this;
        _self.view = view;
        _self.viewMode = viewMode;
        _self.permissions = $problemList.fromCMDB ? {} : _self.getPermissions();
        var contextObj = Object.assign({},_self.permissions);
        contextObj.checkbox = true;
        contextObj.actioncell = true;
        _self.show_icons = {"checkbox": true, "actioncell": true}; // No I18N
        if((!_self.permissions.edit && (_self.viewMode == "table" || !_self.permissions.delete)) || _self.associatedEntityId){
            _self.show_icons.actioncell = contextObj.actioncell = false;
        }

        if((!_self.permissions.edit && !_self.permissions["delete"] && !_self.permissions.assign && !_self.permissions.pickup) || (_self.operation == "associateto") || _self.printPreview){
            _self.show_icons.checkbox = contextObj.checkbox = false;
        }

        /*calculating no. of icons to be showed in list view*/
        _self.icon_count = 1;
        if(_self.show_icons.checkbox){
            _self.icon_count++;
        }
        if(_self.show_icons.actioncell){
            _self.icon_count++;
        }
        if(_self.associatedEntityId){
            contextObj.from = _self.from;
            contextObj.operation = _self.operation;
            contextObj.associations = true;
            contextObj[_self.operation] = true;
            contextObj.module = (_self.operation == "associateto") ? _self.entity : _self.module; // No I18N
            if ($problemList.fromCMDB) {
                _self.metainfoEntity = contextObj.metainfoEntity =  _self.module ;
                contextObj.defaultpath = "/api/v3/"; // No I18N
            }
            else {
                _self.metainfoEntity = contextObj.metainfoEntity = _self.fromPl + "/" + _self.associatedEntityId + "/" + _self.module + "/" + _self.entity; // No I18N
                contextObj.defaultpath = "/api/v3/" + _self.fromPl + "/" + _self.associatedEntityId + "/" + ((_self.operation == "associateto") ? (_self.module +"/") : ""); // No I18N
            }
            contextObj.associatedEntityId = _self.associatedEntityId;
			if(isMSP) {
				let associateTo = (_self.operation == "associateto"); // No I18N
				contextObj.showAccountFilter=associateTo && msp_assoc_json.show_account_filter;
				associateTo && (getCustomAccID = null);
			}
        }
        else{
            contextObj.module = _self.module;
        }
        contextObj.view = view;
        contextObj.viewMode = viewMode;
        contextObj.entityDisplayName =  translate("common.problem");//No I18N
        contextObj.fromCMDB = _self.fromCMDB;
        contextObj.printPreview = _self.printPreview;
            jQuery("body").removeClass('oyh');
                var template_id = 'pb'+(_self.operation ? ('-'+_self.operation) : "") + "-listview-template"; //No I18N
            renderhbs('#prob_listviewloader',template_id,contextObj,false,'problems',true);// No I18N
			if(isMSP && contextObj.showAccountFilter) {
				_self.initAccountSelectBox();
			}
            _self.setAssignDropDown();
            //Problem List View Filter Dropdown construction for Asset Association
            if($problemList.fromCMDB || $problemList.operation=="associateto") {
                _self.setProblemFilterDropdown();
            }
            $problemList.loadProblemListView(viewMode);
    },
	// This method is being used by MSP Team
	initAccountSelectBox: function(){
		if(!isMSP) {
			return;
		}
		let assocAccountElement = jQuery("#association_account");//No I18N
		let accountOpts = msp_assoc_json.account_options;
		if(msp_assoc_json.is_msp_entity) {
			assocAccountElement.sdp_select2({value:accountOpts[0],cache:{},url:[{url:"/api/v3/accounts", field:'accounts',list_info:{start_index:1,row_count:25}}]});//NO I18N
		} else {
			assocAccountElement.select2({data:accountOpts});
			assocAccountElement.select2('data', accountOpts[0]); //NO I18N
		}
		assocAccountElement.on('change', function(){
			$problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
		});
		window.getCustomAccID = function(url){
			if(url && ((url.startsWith('/api/v3/changes/') && url.indexOf('problems/problem')!=-1) || (url.startsWith('/api/v3/requests/') && url.indexOf('problem/problem')!=-1)) ){ //NO I18N
				return jQuery("#association_account").select2('val'); //NO I18N
			}
			return getAccountFromCombo();
		};
	},
    //Technician dropdown for bulk assign is initialized here
    setAssignDropDown : function(){
        var _self = this;
        if(_self.permissions.assign){
            var url, field;
                url = "/api/v3/problems/technician"; // No I18N
                field = 'technician'; // No I18N
            jQuery("#technicianDropdown").sdp_select2({ // No I18N
                placeholder : translate('sdp.requests.common.select.technician'), //No I18N
                allowClear:true,
                url:[{
                    url: url,
                    field: field
                }]
            });
            jQuery('#assign-button').off().on('click', function(event) {
                $problemList.openTechnicianDropdown();
            });
            jQuery("#technicianDropdown").on('change', function () { // No I18N
                _self.bulkActions("assign");//No I18N
            }).on('select2-close',function(){ // No I18N
                jQuery("#assignMenu").removeClass('open') // No I18N
            });
        }
    },
    //Links object is constructed here
    getPermissions : function(){
        var _self = this;
        var url = _self.from ? (_self.fromPl + "/" + _self.associatedEntityId + "/" + _self.module + "/_links")   :(_self.module + "/_links");// No I18N
        var links_data = _self.getLinksData(url);
        return links_data.permissions;
    },
    getLinksData : function(moduleURL){
        var links_data = {permissions : {}};
        var url = "/api/v3/" + moduleURL;//NO I18N
        var sdpOptions = {
            url: url,
            success: function (response) {
                var links = response._links;
                links = links.links || links;
                links.forEach(function (link) {
                    if(link.name){
                        links_data.permissions[link.name] = true;
                    }
                });
            },
            async: false
        };
        sdpAjax(sdpOptions);
        return links_data;
    },
    //On click of assign button
    openTechnicianDropdown : function(){
        setTimeout(function(){
            jQuery("#technicianDropdown").select2("val", "").select2("open");   //No I18N
        });
    },
    //Assign / Pickup call is made here
    bulkActions: function (action) {
        var _self = this;
        jQuery('.page-progressbar').show(); // No I18N
        var ids = $problemList.table_comp_problem.bulkSelect.getSelectedIDs();
        if(ids.length == 0){
            return;
        }
        var url = "/api/v3/"+_self.module+"/"+action+"?ids="+ids.toString();// No I18N
        var data = {};
        if(action == "assign"){ // No I18N
            technician = jQuery('#technicianDropdown').val(); // No I18N
                data = sdpAjaxInputData({
                    "problem": { // No I18N
                                "technician": { // No I18N
                            "id": technician // No I18N
                        }
                    }
                });
            }

        sdpAjax({
            url: url,
            type: "PUT", //No I18N
            data:  data,
            success: function (resp) {
                //Separate success message Assign and PickUp..
                if (action === "assign") {
                    showalert("success", translate("sdp.common.assign.success"), "isAutoHide=true, delay=3"); //No I18N
                }
                else if (action === "pickup") {
                    showalert("success", translate("problems.viewproblem.pickupsuccessmsg"), "isAutoHide=true, delay=3"); //No I18N
                }
                else {
                    showalert("success", translate("sdp.common.success"), "isAutoHide=true, delay=3"); //No I18N
                }
                $problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
                jQuery('.page-progressbar').hide(); // No I18N
            },
            error: function (resp) {
                let obj = {t_obj:{options:{skipIDInErrorMsg:false}}}
                let tab_proto = tableComponent.prototype;
                Object.setPrototypeOf(obj,tab_proto);
                obj.handleErrorMsg(resp,{status_code :[]});
                    $problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
                jQuery('.page-progressbar').hide(); // No I18N
            }
        });
    },
    //Problem association from request and change
    associateProblem : function(){
        var _self = this,json={};
        var asscEntity = _self.from == "request" ? "request_problem_association" : "problems"; // No I18N
        if(_self.from=='request' ){
            json[asscEntity]={
                    "problem": { // No I18N
                    "id": _self.table_comp_problem.getSelectedRadio() // No I18N
                    }
                }
        }else if(_self.from=='change'){// No I18N
            json[asscEntity]=[]
            Object.keys(_self.table_comp_problem.bulkSelect.selectedRecords).forEach(e=> {
                json[asscEntity].push({
                        "problem": { // No I18N
                        "id": e // No I18N
                    }
                });
            });
        }
            var data = sdpAjaxInputData(json);
            var sdpOptions = {
                url: "/api/v3/" + _self.fromPl + "/" + _self.associatedEntityId + "/" + _self.module, // No I18N
                data: data,
                type: "POST",// No I18N
                success: function(resp) {
                    var parent = _self.from=='request' ? $previewComponent.iframeActiveParent().window : window.top; // No I18N
                    parent.showalert("success", translate("api.associate.success.msg", [translate("sdp.problem.problemtab")]), "isAutoHide=true, delay=3"); //No I18N
                    parent.$previewComponent.closePreview("listview_popup");// No I18N
                    setTimeout(function(){
                        if(_self.from=='request'){
                            parent.$req.details.updateRequestTemplates('problem');// No I18N
                        }
                        if(_self.from=='change'){
                            let successCount = resp.response_status.filter(function(response){
                                if(response.status == "success") return true;
                            }).length;
                            parent.jQuery('#associated_problems_count')[0].innerHTML = parseInt(parent.jQuery('#associated_problems_count')[0].innerHTML) + successCount;
                            if(_self.fromActions){
                            parent.changeChangeTab('problemsandincidents','&from=Actionlink&edit=true'); //No I18N
                        }
                        else{
                            if(parent.$problemList && parent.$problemList.table_comp_problem){
                                parent.$problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
                            }
                            parent.jQuery("#pb_table_render_div").addClass("listview").css("display", ""); //NO I18N
                        }
                        }
                    },100);
                }
            }
            sdpAjax(sdpOptions);
    },
    //Problem dissociation from request and change
    disassociateProblem : function(){
        var _self = this;
        if(confirm(translate('sdp.change.error.detachconfirm'))) { // No I18N
            var loadedRecords = Object.keys(_self.table_comp_problem.bulkSelect.selectedRecords);
            var json = {problems:{}};
            if(_self.from == "change"){
                json.problems = [];
                loadedRecords.forEach(e=>{
                    json.problems.push({"problem":{"id":e}});
                })
            }else{
                json.problems = {
                    "problem": {// No I18N
                        "id": id[0]
                            }
                    };
                }
                var data = sdpAjaxInputData(json);
                var sdpOptions = {
                    url: "/api/v3/" + _self.fromPl + "/" + _self.associatedEntityId + "/" + _self.module, // No I18N
                    data: data,
                    type: "DELETE", // No I18N
                    success: function(resp) {
                        let successCount = resp.response_status.filter(function(response){
                            if(response.status == "success") return true;
                        }).length;
                        if(_self.from == "change"){ //No I18N
                            parent.jQuery('#associated_problems_count')[0].innerHTML = parseInt(parent.jQuery('#associated_problems_count')[0].innerHTML) - successCount;
                            showalert("success", translate("sdp.change.planning.problemdeattached.success"), "isAutoHide=true, delay=3"); //No I18N
                        }
                        $problemList.table_comp_problem && $problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
                    },
                    async: false
                }
                sdpAjax(sdpOptions);

        }
    },
    getMetaData : function () {
        var _self = this;
        var dataVal = ""; // No I18N
        dataVal = sdpAjaxInputData({"for":"list_view"}); //No I18N
        var metaInfo;
        var sdpOptions = {
            url: "/api/v3/" + _self.metainfoEntity + "/_metainfo", // No I18N
            data : dataVal,
            success: function(data) {
                metaInfo = data.metainfo.fields;
            },
            cache:false,
            async: false
        };
        sdpAjax(sdpOptions);
        return metaInfo;
    },
    /*
    Problem List View Filter Construction for Asset Association
     */
    setProblemFilterDropdown : function(){
        let defaultOpt = "open_problems"; //No I18N
        //By default we will have 3 problem filter for asset association. So constructing static Select2 component with below $problemList.filterObj.
        $problemList.filterObj = [
            {
                id : 1,
                text : translate("sdp.problem.listview.allproblems"),
                value : "all_problems"  	//No I18N
            },
            {
                id : 2,
                text : translate("sdp.problem.listview.openproblems"),
                value : "open_problems"     //No I18N
            }
        ];
        if($problemList.fromCMDB){
            $problemList.filterObj.push({
                id : 3,
                text : translate("sdp.problem.listview.closedproblems"),
                value : "closed_problems"	//No I18N
                });
        }
        if($problemList.from == "change"){ //No I18N
            if(window.top.$rc && window.top.$rc.entity_data.category){
            $problemList.filterObj.push({
                id : -1,
                    text : translate("sdp.changedetails.changecategory") +" - "+ window.top.$rc.entity_data.category.name,
                value : "change_cat_problem"	//No I18N
            });
            defaultOpt = "change_cat_problem"; //No I18N
            }
        }

        if($problemList.from == "request"){ //No I18N
            let reqObj = $previewComponent.iframeActiveParent().window.$req;
            if( reqObj && reqObj.details.request_info.category){
            $problemList.filterObj.push({
                id : -1,
                text : translate("sdp.problem.listview.openwithcategory"),
                value : "req_cat_open_problem"	//No I18N
            });
            defaultOpt = "req_cat_open_problem"; //No I18N
        }
        }
        jQuery("#problemFilterDropdown").select2({
            data : $problemList.filterObj,
            multiple : false,
            closeOnSelect : true,
            formatSelection: function(item){
                var $span = jQuery("<span>", {"rel-class": "problem-uitip", "rel": "uitip", "mode_ellipsis":"true","title": e_attr(item.text), "html": e_html(item.text) });  //NO I18N
                return $span;
            }
        }).on({
            "select2-close" :	function(){ jQuery("#problemFilterDropdown").removeClass('open'); },	//No I18N
            "change" :  function(item,data){ //No I18N
                initTooltip('#s2id_problemFilterDropdown'); //NO I18N
                if(item.added != undefined) {
                    $problemList.switchFilterView(item.added.id,item.added.value);
                }
            },
            "select2-open" : function(){ jQuery(".problem-uitip").remove(); }	//No I18N
        });
        //Default List View filter is Open_Problems.
        var defaultFilter = $problemList.filterObj.filter(function(x) { if ( x.value == defaultOpt ) { return x; } });
        $problemList.defaultFilter = defaultFilter;
        initTooltip('#s2id_problemFilterDropdown'); //NO I18N
        jQuery("#problemFilterDropdown").select2("val", defaultFilter[0].id).change();   //No I18N
    },
    /*
    Critera to fetch all problems associated to an asset.
    */
    getSearchCriteriaForCMDB : function() {
        var search_criteria;
        if(!jQuery.isEmptyObject($problemList.cmdb_base_criteria)) {
            search_criteria = $problemList.cmdb_base_criteria;
        }
        else {
            if($problemList.from == "services") {
                search_criteria = {
                    field : "affected_service.id", // No I18N
                    condition : "is", // No I18N
                    value : $problemList.associatedEntityId,
                }
            }
            else  if($problemList.from == "asset"){// No I18N
                sdpAjax({
                    url: '/api/v3/assets/' + $problemList.associatedEntityId, // No I18N
                    async: false,
                    success: function(resp) {
                        search_criteria = {
                            field : "associated_asset.id", // No I18N
                                    condition : "is", // No I18N
                            value : $problemList.associatedEntityId
                        };
                    }
                });
            }
            $problemList.cmdb_base_criteria = search_criteria;
        }
        return search_criteria;
    }
};


/* TableComponent initialization*/
$problemList = Object.assign(true, (function(){
    var pbTbComp = {};
    pbTbComp.current_view_mode = ""; // No I18N
    //table component initialization
    pbTbComp.loadProblemListView = function(viewMode){
        var componentName = ""; // No I18N
            componentName = "webc-problemlist"; // No I18N
        delete WebComponents.instancePool[componentName];
        pbTbComp.current_view_mode = viewMode;
        WebComponents.render(componentName);
        $problemList.table_comp_problem = WebComponents.getInstance(componentName);
    },
    //Action and Checkbox /Radio cell construction
        pbTbComp.rowDataConstruct = function(tableInfo) {
            var inputObject = {};
            var fields_required = tableInfo.fields_required;
            var fields_required_arr = Object.keys(fields_required);
            var actioncellIndex = fields_required_arr.indexOf("actioncell"); // No I18N
            actioncellIndex > -1 && fields_required_arr.splice(actioncellIndex, 1);
            var radiocellIndex = fields_required_arr.indexOf("radiocell"); // No I18N
            radiocellIndex > -1 && fields_required_arr.splice(radiocellIndex, 1);
                var chkindex = fields_required_arr.indexOf("problems_head_chk"); // No I18N
                chkindex > -1 && fields_required_arr.splice(chkindex, 1);
                //Forced addition of fields for tooltip construction
                if(fields_required_arr.indexOf("reported_time") == -1){ // No I18N
                    fields_required_arr.push("reported_time"); // No I18N
                }

                if(fields_required_arr.indexOf("status") == -1){ // No I18N
                    fields_required_arr.push("status"); // No I18N
                }
                if(fields_required_arr.indexOf("title") == -1){ // No I18N
                    fields_required_arr.push("title"); // No I18N
                }
            inputObject.fields_required = fields_required_arr;
            inputObject.list_info = tableInfo.list_info;
            if($problemList.printPreview){ //change PrintPreview page
                inputObject.list_info.row_count="100"; //No I18N
            }
            return inputObject;
        },
        //Classic View Table options
        pbTbComp.tableCompOptions = function(){
            var _self = this,
                options = {};
            options = {
                "column_settings": { //No i18N
                    "default_position": 2, //No i18N
                    "assign_content_width": false, //No i18N
                    "assign_label_width": false, //No i18N
                    "columns": [{ //No i18N
                        "size": 1, //No i18N
                        "width": (_self.icon_count == 2 ? '70px' : (_self.icon_count == 1 ? '50px' : '80px')) //No i18N
                    },
                        {
                            "size": 11, //No i18N
                            "row_count": 2, //No i18N
                            "pipe_separation": true, //No i18N
                            "default_rowposition": 2//No I18N
                        }
                    ]
                },
                icon_settings : {
                    "show_icons_Bottom": true, //No I18N
                    "position": 2, //No I18N
                    "isPrepend":true,  //No I18N
                    "rowPosition" : 2,  //No I18N
                    "class": "req_icons disp-ib vmiddle" //No I18N
                }
            }
            if(_self.operation != "associated" || _self.from != "change"){ //No I18N
                options.default_sort_field = {"sort_field" : "id","sort_order" : "desc"}//No i18N
            }
            if (!_self.associations) {
                options.listSettingOptions = {
                    enableSettings: ["record_per_page", "refresh_frequency"], //No I18N
                    disableSettings: ["text_wrapping"] //No I18N
                }
                if (_self.viewMode == "linear") {
                    options.listSettingOptions.enableSettings.push("sorting"); //No I18N
                }
                options.reinitializeCalback = _self.reinitializeCalback;
            }
            return options;
        },
        //Header Meta construction
        pbTbComp.headerDataConstruct = function(){
            var _self = this;
            //The below header options is for classic view, and for table view, header is constructed in web component
            var header = {
                "problems_head_chk": { //No i18N
                    "column_settings": { //No I18N
                        "position": 1 //No I18N
                    },
                    "hide_label": true, //No i18N
                    "default": true, //No i18N
                    "type": "checkbox", //No i18N
                    "dataCelltransformer": _self.constructChkboxCell // No I18N
                },
                "actioncell": { //No i18N
                    "default": true, // No I18N
                    "column_settings": { //No I18N
                        "position": 1 //No I18N
                    },
                    "dataCelltransformer": _self.constructActionCell, // No I18N
                    "type": _self.viewMode=='table'?"icon":"", // No I18N
                    "sortable" : false, // No I18N
                    "hide_label": true //No i18N
                },
                "id": { //No i18N
                    "text": translate("sdp.common.id") // No I18N
                },
                "title": { //No i18N
                    "default": true, //No i18N
                    "hide_label": true, //No i18N
                    "column_settings": { //No i18N
                        "rowposition": 1, //No i18N
                        "view_type": "row" //No i18N
                    },
                    "dataCelltransformer": _self.constructTitle //No i18N
                },
                "notes_present": { //No i18N
                    "hide_label": true, //No i18N
                    "type": "icon", // No I18N
                    "dataCelltransformer": _self.constructNotesCell, // No I18N
                    "text": translate("sdp.requests.common.notes") // No I18N
                },
                "tasks": { //No i18N
                    "hide_label": true, //No i18N
                    "type": "icon", // No I18N
                    "dataCelltransformer": _self.taskLoading //No i18N
                },
            "technician": { //No I18N
                "dataCelltransformer": _self.constructTechnician //No i18N
            },
                "priority": { //No i18N
                    "dataCelltransformer": _self.constructPrioritiy //No i18N
                },
                "known_error_details.is_known_error":{ //No i18N
                    "text": translate("problem.knownerror"), //No i18N
                },
                "associated_incidents": { //No i18N
                    "dataCelltransformer": _self.reqCntLoading //No i18N
                },
            };
            if(!_self.show_icons.checkbox){
                delete header.problems_head_chk;
            }
            if(!_self.show_icons.actioncell){
                delete header.actioncell;
            }
            return header;
        },
        //Title Cell construction with tooltip
        pbTbComp.constructTitle = function(table_data){
            var rd = table_data.row_data,_self=this;
        var entity = "", modCode = "";// No I18N
            var title_head = "";
            var title_class = ""; // No I18N
            if(pbTbComp.current_view_mode == "linear"){ // No I18N
                title_class = "uni-heading"; // No I18N
            }
                entity = "problem"; // No I18N
                modCode = "PB"; // No I18N
                title_head = translate("common.newproblem");// No I18N

            var dataAttr = "data-"+entity; // No I18N
            var spaAttrs = ($problemList.from) ? '' : ' data-spa-module="problems" data-spa-page="problems-details" data-spa="true" ';// No I18N
            var href = '/ui/problems?mode=detail&entity_id='+ rd.id ; // No I18N
            var a_title =  $problemList.constructTooltipTitle(rd, title_head);
        var col_str = '<a '+spaAttrs+(_self.from=='change'?' class="text-dark" ':' href="'+href+'"')+ 'rel="uitip" mode_html="true" title="'+ e_attr(a_title) +'" '+' class="'+ title_class +'" '+dataAttr+' ' + ($problemList.from ? 'target="_blank"' : '') +'>'; // No I18N
            if(pbTbComp.current_view_mode == "linear"){ // No I18N
            col_str += '<span class="vmiddle">'+modCode+'-'+ rd.id +'&nbsp;</span><span class="vmiddle">'+ e_html(rd.title) +'</span></a>';// No I18N
            }
            else{
            col_str += '</span><span class="vmiddle">'+ e_html(rd.title) +'</span></a>';// No I18N
            }
            return col_str;
        },
        pbTbComp.constructTooltipTitle = function(row_data, title_head){
            return "<div class='ui-tooltip-style-1'><p class='text-color1 font-small'>"+title_head+": "+row_data.id+"</p> <span class='disp-t'> <span class='disp-c'><span class='cspr th-problem icon-sm mr5 tf1-2 top-2'></span></span> <span class='sb vmiddle disp-c text-color4 wb-bw'>"+e_html(row_data.title)+"</span> </span><p class='mt10 mb0 font-small'><label class='text-muted mr5'>"+translate("common.status")+":</label>"+e_html(row_data.status.name)+"</p><hr class='mb10 mt10'><p class='font-small'><label class='text-muted mr5'>"+translate("sdp.problem.details.reporteddate")+":</label>"+row_data.reported_time.display_value+"</p></div>";
        },
        //checkbox cell construction
        pbTbComp.constructChkboxCell = function(table_data){
            var rd = table_data.row_data;
            var rtl_style = ""; // No I18N
            if(sdp_user.DIRECTION=="RTL"){ // No I18N
                rtl_style = "right : 10px;"; // No I18N
            }
            else{
                rtl_style = "left : 10px;"; // No I18N
            }
            return "<input type='checkbox' name='checkbox' value=" + rd.id + " data-table-checkbox style='position: absolute; top: 22px;'"+ rtl_style+">"; //No I18N
        },
        //Initial loading of tasks before summary call
        pbTbComp.taskLoading = function(table_data){
            var rd = table_data.row_data;
            var col_str = ""; // No I18N
            col_str += '<div id="problem_task_' + rd.id + '" class="vbottom disp-ib"><span title="' + translate("sdp.projects.notasks") + '" rel="uitip" class="sdp-glyph sdp-glyph task-loading" role="img"></span></div>'; // No I18N
            return col_str;
        },
        //Initial loading of Req Cnt before summary call
        pbTbComp.reqCntLoading = function(table_data){
            var rd = table_data.row_data;
            var col_str = ""; // No I18N
            col_str += '<div id="problem_req_cnt_' + rd.id + '" class="vbottom disp-ib">-</div>'; // No I18N
            return col_str;
        },
        //Priority cell construction
        pbTbComp.constructPrioritiy = function(table_data){
            var rd = table_data.row_data;
            var col_str;
            if( rd.priority ){
                let priority = rd.priority.name;
                if( rd.priority.color ){
                    col_str = '<div class="d_w"><span class="arrowBG mt3 mr5 vmiddle" style="background:'+e_attr(rd.priority.color)+'"></span><span class="vmiddle" rel="uitip" mode_ellipsis="true" title="'+e_attr(priority)+'">'+e_html(priority)+'</span></div>';// No I18N
                }
                else{
                    col_str = '<span class="vmiddle">'+e_html(priority)+'</span>';// No I18N
                }
                return col_str;
            }
            return '-'; // No I18N
        },
        //Filter Menu initialization
        pbTbComp.callbackInitialRender = function(viewMode){
            if( $problemList.operation == "associateto"){ // No I18N
                jQuery("#prob_listview_btn").attr("disabled", true); // No I18N
            }
            else{
                jQuery("#prob_listview_btn").on('click',function(){         // No I18N
                    var filterList_obj = new filterListComp();
                    filterList_obj.initComponent({
                        element : "#ListViewFilterMenu",  // No I18N
                        module : "problem",  // No I18N
                        personalize_key :  "problems_filter_views",// No I18N
                        filter_action : "$problemList.switchFilterView", //No I18N
                    isTrashEnabled: false,
                        favoritable : true,
                        custom_filters : false,
                        skipPersonalization : true
                    });
                });
            }
        },
        //On change of filter view
        pbTbComp.switchFilterView = function(viewId,viewName){
            var _self = this;
            //We don't need below handling for asset association. so skipping below block.
            if(!$problemList.fromCMDB && $problemList.operation != "associateto"){ // No I18N
                var current_view = {};
                if(sdp_user.CLIENT_CONF.problems_currentview){
                    current_view = Object.assign({}, sdp_user.CLIENT_CONF.problems_currentview);
                }
                current_view.filter_by = { "id": viewId};// No I18N
                addPersonalization("problems_currentview", current_view); // No I18N
                if($problemList.search_text){
                    jQuery("#subheader_search_box").val(""); // No I18N
                    jQuery('[data-spa-page="problems-list"]').trigger("click");// No I18N
                    return false;
                }
                sdpAjax({
                    url: '/api/v3/list_view_filters/'+viewId, // No I18N
                    success: function(resp) {
                        $problemList.filter_view_display_name = resp.list_view_filter.display_name;
                    },
                    async: false
                });
            }
                var table_info = $problemList.table_comp_problem.t_obj.table_info;
                //In asset association, we are reusing default problem listview filter's by internal_name for asset_problem filter.
                $problemList.table_comp_problem.t_obj.table_info.list_info.filter_by = ( $problemList.fromCMDB || ($problemList.operation=='associateto' && viewId!=-1)) ? { "name" : viewName } : { "id" : viewId }; //No i18n
                $problemList.table_comp_problem.t_obj.table_info.list_info.start_index = 1;

                    //New list_info is added into personalization to reflect filter_by parameter.
                    if( $problemList.fromCMDB || $problemList.operation == "associateto") {
                        $problemList.fromCMDB && ($problemList.table_comp_problem.t_obj.table_info.list_info.search_criteria = $problemList.getSearchCriteriaForCMDB());
                        if(!_self.from || ["request","change"].indexOf(_self.from)==-1){
                        $problemList.table_comp_problem.addPersonalizeData($problemList.table_comp_problem.t_obj.table_info);
                    }
                    }
                    $problemList.table_comp_problem.changeFilterString("clearOnly");// No I18N
                        $problemList.table_comp_problem.refreshTable("refresh");// No I18N
            //We don't need below handling for asset association. so skipping below block.
            if( !$problemList.fromCMDB ) {
                jQuery('#problems-filters').text(viewName);// No I18N
                jQuery('#prob_listview_btn').attr("title",viewName);// No I18N
            }
        },
        //Task and Req Count is added post the table render
        pbTbComp.callbackAfterTableRender = function(){
            var _self = this;
            //visibleContents property holds the order of the loaded records in listview
        $problemGlobal.loadedRecords = $problemList.table_comp_problem.loadedIDs;
            var loadedRecords = $problemList.table_comp_problem.loadedRecords;
            var fields_req = Object.keys($problemList.table_comp_problem.t_obj.table_info.fields_required).filter(fld=>["associated_incidents","tasks"].indexOf(fld)!=-1); //No I18N
            var keys = Object.keys(loadedRecords);
            if(keys.length && fields_req.length){
                var url = "/api/v3/" + $problemList.modulePlural + "/summary?ids="+keys.toString();// No I18N
                var data = sdpAjaxInputData({"list_info":{"fields_required":fields_req}});//NO I18N
                sdpAjax({
                    url: url,
                    data: data,
                    success: function (response) {
                        var summary = response.summary;
                        for(var i=0;i<summary.length;i++){
                            if (summary[i].task_total_count > 0) {
                                var total_task = summary[i].task_total_count;
                                var comp_task = summary[i].task_completed_count;
                                var pen_task = parseInt(total_task) - parseInt(comp_task);
                                var my_pen_task = summary[i].my_task_pending_count;
                                var title = translate("sdp.request.listview.tasks.total", [total_task]); // No I18N
                                var iconClass = "tc-task"; // No I18N
                                if (pen_task > 0) {
                                    title += "<br>" + translate("sdp.request.listview.tasks.pending", [pen_task]); // No I18N
                                    iconClass = "tc-task-p"; // NO I18N
                                }
                                if (comp_task > 0) {
                                    title += "<br>" + translate("sdp.request.listview.tasks.completed", [comp_task]); // No I18N
                                }
                                if (my_pen_task > 0) {
                                    title += "<br>" + translate("sdp.request.listview.tasks.pendingowner", [my_pen_task]); //No I18N
                                    iconClass = "tc-task-p-t"; // NO I18N
                                }
                                if (comp_task > 0 && pen_task == 0) {
                                    iconClass = "tc-task-c"; // NO I18N
                            }
                                html = '<a '+($problemList.from ? '' : ('data-spa-module="problems" data-spaPage="problem-details" data-spa="true" href="/ui/problems?mode=detail&entity_id='+ summary[i].id +'#tasks"'))+' rel="uitip" mode_html="true" title="' + title + '"><span role="img" class="' + iconClass +   '" aria-label="' + title + '"></span></a>'
                                jQuery("#problem_task_" + summary[i].id).html(html);
                            }else{
                                jQuery("#problem_task_" + summary[i].id).find("span").removeClass().addClass("tc-task");
                        }
                            if (summary[i].associated_incidents > 0) {
                                jQuery("#problem_req_cnt_" + summary[i].id).html(summary[i].associated_incidents);
                            }
                        }
                        initTooltip('#'+ ((_self.operation == "associateto") ? _self.entity : _self.module) + (_self.view=='linear'?'_kanban_div':'_div')); //No I18N
                    },
                    async: false
                });
            }
        },
        //Reset Personalization action
        pbTbComp.reinitializeCalback = function(){
            $problemList.loadProblemListView($problemList.viewMode);
        },
        pbTbComp.constructActionCell = function(table_data){
            var rd = table_data.row_data,_self=this;
            if(_self.viewMode=="table"){
                return '<a data-spa-module="problems" data-spa-page="problems-edit" data-spa="true" href="/ui/problems?mode=edit&entity_id=' + rd.id + '" data-problem data-cs-field="edit_problem" title="' + translate("sdp.common.edit") + '" rel="uitip"><span class="tc-edit" role="img" aria-label="' + translate("sdp.common.edit") + '"></span> </a>'; // No I18N
            } else{
                return '<div class="btn-group tc-req-edit bs-noconflict pos-abs" style="top:18px"> <a class="cur-ptr cspr menulist icon-xs flat sdmenu-toggle vmiddle" data-switch="sdmenu" title="' + translate("sdp.common.actions") + '" ></a>' + '<ul class="sdmenu-dd" role="menu">' + $problemList.constructActioncellOptions(rd) + '</ul></div>'; // No I18N
            }
        },
        pbTbComp.constructActioncellOptions = function(rd){
            var html = "";// No I18N

            var spaAttrs = ' data-spa-module="problems" data-spa-page="problems-edit" data-spa="true" ';// No I18N
            html += $problemList.permissions.edit ? ('<li><a '+spaAttrs+' href="/ui/problems?mode=edit&entity_id='+ rd.id +'" data-problem data-cs-field="edit_problem">' + translate("sdp.common.edit") + ' </a></li>') : "";
            html += $problemList.permissions.delete ? ('<li><a href="/" data-table-delete data-entityid='+ rd.id +'>'  + translate("sdp.common.delete") + '</a></li>') : "";// No I18N
            return html;
        },

        pbTbComp.constructNotesCell = function (table_data,_self) {
            var rd = table_data.row_data;
            var cl = "tc-notes",title = "sdp.requests.notes.addnotes.title"; // No I18N
            if (!rd.notes_present) {
                cl = "tc-nonotes"; // No I18N
            } else {
                title="sdp.requests.note.viewaddnote";// No I18N
        }
            var clickEvent='data-event="click" data-handler="showConversationInDialog(\'/common/ViewConversationsFromList.jsp?mode=view&amp;module=problems&amp;id=' + rd.id +'&amp;view=notes\',\'note' + rd.id + '\')" nonce="'+sdpNonce+'"';//no i18n

            return '<div id="req_notes_' + rd.id + '" class="vbottom mr5 disp-ib"><a href="/" '+clickEvent+' role="img" aria-label="'+ translate(title) +'" title="'+ translate(title) +'" rel="uitip" class="' + cl + '" id="note' + rd.id + '"> </a></div>'; // No I18N
    },

    pbTbComp.constructNewTabIcon = function(tdata){
        return '<div><div class="right0 top0 p5 pr5" style="display: inline-block;"><a href="/ui/problems?mode=detail&entity_id=' + tdata.row_data.id + '#detail" target="_blank" class="cspr flat icon-sm newtab" title="' + translate('sdp.requests.newrequest.autosuggest.newwindow.open') + '" rel="uitip noopener" nonce="'+sdpNonce+'"></a></div></div>';
    },
    pbTbComp.constructTechnician = function(table_data){
            var rd = table_data.row_data;
            let content = rd.technician ? e_html(rd.technician.name) : translate("sdp.common.unAssign"); // No I18N
            return '<span rel="uitip" mode_ellipsis="true" title="'+content+'">'+content+'</span>';
        },
        //User / default personlization data, also gsearch data is appended
        pbTbComp.tableEntityInfo = function(personalize_key){
            var table_info = getPersonalizeData(personalize_key),_self=this;
            var filter_by;
            if(!$problemList.associatedEntityId){
                var current_view = Object.assign({}, sdp_user.CLIENT_CONF.problems_currentview);
                if(current_view && current_view.filter_by && current_view.filter_by.id){
                    filter_by = current_view.filter_by;
                }
            else{
                filter_by = {name:"my_open_problems"};// No I18N
            }
            }
            if(_self.listViewType){
                filter_by = {name:_self.listViewType};
            }
            if($problemList.filter_view_display_name){
                jQuery('#problems-filters').text($problemList.filter_view_display_name);// No I18N
                jQuery('#prob_listview_btn').attr("title",$problemList.filter_view_display_name);// No I18N
            }
            //Modifying listview filter display name using Personalized Data if filter_by is present in table_info for asset association.
            if( ($problemList.fromCMDB || $problemList.operation=='associateto') ) {
                let filterObj = [];
                if(!jQuery.isEmptyObject(table_info) && !jQuery.isEmptyObject(table_info.list_info.filter_by)){
                    filterObj = $problemList.filterObj.filter(function(x) { if ( x.value == table_info.list_info.filter_by.name || x.id == table_info.list_info.filter_by.id) { return x; } });
                }
                if(filterObj.length==0){
                    filterObj = $problemList.defaultFilter;
                }
                filter_by = {
                    name:filterObj[0].value
                };
                jQuery("#problemFilterDropdown").select2("val", filterObj[0].id).change();   //No I18N
            }
            if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
                var t_info,_self=this;
                var listInfo = {
                    start_index : 1,
                    row_count : 10,
                    get_total_count :"true" // No I18N
                };
                if(pbTbComp.current_view_mode == "linear"){
                    t_info = {
                        "list_info": listInfo, //No i18N
                    "fields_required" : {"notes_present":"","technician":"","due_by_time":"","status":""},// No I18N
                    "column_order" : ["notes_present","technician","due_by_time","status"] // No I18N
                    };
                }
                else if($problemList.operation == "associated"){
                    if($problemList.from == "change"){ //No I18N
                        t_info = {
                            "list_info": listInfo, //No i18N
                        "fields_required" : {"id":"","title":"",  "status": "","priority":"","technician":""},// No I18N
                        "column_order" : ["id","title","problem_type",  "status","priority","technician"] // No I18N
                        };
                    }
                    else if($problemList.fromCMDB){
                        //Adding search_criteria to fetch asset associated problem entries.
                        listInfo.search_criteria = $problemList.getSearchCriteriaForCMDB();
                        listInfo.filter_by = { "name" : "open_problems" }	//No I18N
                        t_info = {
                            "list_info": listInfo, //No i18N
                        "fields_required" : {"id":"","title":"","problem_type":"", "status": "","priority":"","technician":"","scheduled_start_time":"","scheduled_end_time":""},// No I18N
                        "column_order" : ["id","title","problem_type","status","priority","technician","scheduled_start_time","scheduled_end_time"] // No I18N
                        };
                    }
                }
                else{
                    t_info = {
                        "list_info": listInfo, //No i18N
                    "fields_required": {"notes_present":"","id":"","title":"", "reported_by":"","technician":"","category":"","priority":"","status":"","urgency":""},// No I18N
                    "column_order" : ["notes_present","tasks","id","title", "reported_by","technician","category","priority","status","urgency",]// No I18N
                    };
                    if(!_self.from){
                        t_info.fields_required["tasks"] = ""; // No I18N
                    }
                    if(_self.operation == 'associateto'){
                        listInfo.filter_by = { "name" : "open_problems" }	//No I18N
                        //When No personalisation go with category filter
                        if(["request","change"].indexOf(_self.from)!=-1){
                            let defFilId = jQuery("#problemFilterDropdown").select2('data').id; //No I18N
                            if(defFilId==-1){
                                listInfo.filter_by = {"id":defFilId}; //No I18N
                            }
                        }
                    }
                }
                table_info = t_info;
            }
            //search_criteria handling is not present in default personalization. So adding search criteria for asset association if not present.
            else if( $problemList.fromCMDB && !table_info.list_info.search_criteria ) {
                table_info.list_info.search_criteria = $problemList.getSearchCriteriaForCMDB();
            }

        if(filter_by){
                table_info.list_info.filter_by = filter_by;
            }
            if($problemList.search_text){
                table_info.list_info.gsearch = $problemList.search_text;
                delete table_info.list_info.filter_by;
                jQuery("#subheader_search_box").val($problemList.search_text); // No I18N
            }else{
                jQuery("#subheader_search_box").val(""); // No I18N
            }
            return table_info;
        },
        //Table / Classic View Switch
        pbTbComp.switchProblemView = function(view_mode) {
            var current_view = {};
            if(sdp_user.CLIENT_CONF.problems_currentview){
                current_view = Object.assign({}, sdp_user.CLIENT_CONF.problems_currentview);
            }
            var viewMode;
            var viewModeMap = {
                classic: 'linear', // No I18N
                table: 'table' // No I18N
            };
            if (view_mode in viewModeMap) {
                $problemList.viewMode = view_mode;
                viewMode = viewModeMap[view_mode];
                current_view.view = view_mode;
            }
            addPersonalization("problems_currentview",current_view); // No I18N
            //pass view as kanban to settemplate for a classic view
            current_view.view = (current_view.view == "classic") ? "kanban" : current_view.view; // No I18N
                $problemList.setTemplate(current_view.view,viewMode);

        },
        pbTbComp.setDataMetaInfo = function(){
            return {"for":"list_view"}; // No I18N
        },
        pbTbComp.setHeight = function(){
            var height;
            var listview_height;
            if($problemList.operation == "associated" && $problemList.from == "change"){ // No I18N
                    return 150;
            }else if($problemList.operation == "associateto"){ // No I18N
                return (jQuery(window).height()- (100));
            }
            listview_height = pbTbComp.current_view_mode == "linear" ? 70 : 110; // No I18N
            var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
            jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
            return (height-30);
        },
        pbTbComp.setWidth = function(){
            var width = jQuery("#listview").width(); // No I18N
            if($problemList.operation == "associated"){  // No I18N
                if($problemList.from == "change"){ //No I18N
                    return width - 2;
                }else if ($problemList.from == "request"){  //No I18N
                    return width - 4;
                }
            }
            else if($problemList.operation == "associateto"){
                return jQuery(window).width() - 4;
            }
            else{
                return width;
            }
        },
        //No data string is printed inside Table's View
        pbTbComp.setNoDataString = function(){
            let message = translate("sdp.problems.listview.noproblemmessage");
            if(pbTbComp.current_view_mode == "linear"){ // No I18N
                return '<div class="tc p15"><span>'+message+'</span></div>';
            }
            else{
                return '<span>'+ message +'</span>';// No I18N
            }
        },
        //This hides the table component and diplays the problem HTML
        pbTbComp.setNoDataBanner = function(table_data){
            var table_info = table_data.t_obj.table_info;

            if(table_info.list_info){
                search_filter = (table_info.list_info.gsearch || table_info.list_info.search_fields) ? true : ((table_info.list_info.search_criteria && (table_info.list_info.search_criteria.length > 0)) ? true : false);
            }
            if($problemList.operation == "associated" && $problemList.from == "change"){ //NO I18N
                jQuery("#pb_table_render_div").removeClass("listview").css("display", "inline"); //NO I18N
                var html = '<div id="no_assocProblemList" class="alert-nodata"><div class="msg">'; // No I18N
                html +=  translate("change.noproblemassociationmsg") + '&nbsp'; // No I18N
                if($problemList.permissions.add && !$problemList.printPreview){
                    html += (sdp_user.ROLES.indexOf("ModifyProblems") != -1) ?  ('<a class="text-primary" href="/" data-event="click" data-handler="$previewComponent.load(\'/ui/problems?mode=list&from=change&associatedEntityId='+ $problemList.associatedEntityId+'&externalframe=true&operation=associateto\',\'' + translate("sdp.change.associateproblem") +'\',null,null,null,\'listview_popup\')" nonce="'+sdpNonce+'">' + translate("associate.child.existing",[translate("common.newproblem")]) + '</a></div></div>') : ''; // No I18N
                }
                return html;
            }
            return false;
        },
        /**
         * CallBack to handle field search.
         * For problem cmdb association we always need search criteria to be present.
         * But API don't support list_info with both search_criteria and search_fields. Also table component doesn't have any proper handling for this.
         * So we are converting search_fields into search_criteria and appending this criteria with cmdb_base_criteria.
         */
        pbTbComp.callbackSearchFunction = function() {
            var _self = this;
            var search_criteria = [];
            var cmdb_base_criteria = $problemList.getSearchCriteriaForCMDB();
            cmdb_base_criteria !=null && search_criteria.push(cmdb_base_criteria);
            //search_fields to search_criteria conversion
            var search_fields  = _self.table_comp_problem.t_obj.table_info.list_info.search_fields;
            var metainfo = _self.table_comp_problem.t_obj.meta_info;
            jQuery.each(search_fields,function(key,value){
                var condition = "contains"; // No I18N
                if(metainfo[key] && (metainfo[key].type === "long" ||  metainfo[key].type === "int")){ // No I18N
                    condition = "is"; // No I18N
                }
                search_criteria.push({
                    "field" : key, // No I18N
                    "value" : value, // No I18N
                    "condition" : condition, // No I18N
                    "logical_operator" : "AND" // No I18N
                });
            });
            //Deleting search_fields to prevent issues from tableComponent side.
            delete _self.table_comp_problem.t_obj.table_info.list_info.search_fields;
            _self.table_comp_problem.t_obj.table_info.list_info.search_criteria = search_criteria;
            //Refreshing table component to reflect new data.
            $problemList.table_comp_problem.refreshTable("refresh"); //NO I18N
        },
        pbTbComp.additionalMetaInfo = function(){
            var additionalMetaInfo =  {
                "known_error_details.is_known_error": {"sortable" : "true"}, //No I18N
                "reported_by":{"value_path" : "reported_by.name", "type" : "string"}, //No I18N
                "technician":{"value_path" : "technician.name", "type" : "string"}, //No I18N
                "priority":{"value_path" : "priority.name", "type" : "string"}, //No I18N
                "status":{"value_path" : "status.name", "type" : "string"}, //No I18N
                "site":{"value_path" : "site.name", "type" : "string","text":"sdp.requests.common.site"}, //No I18N
                "template":{"value_path" : "template.name", "type" : "string"}, //No I18N
                "category":{"value_path" : "category.name", "type" : "string"}, //No I18N
                "subcategory":{"value_path" : "subcategory.name", "type" : "string"}, //No I18N
                "item":{"value_path" : "item.name", "type" : "string"}, //No I18N
                "impact":{"value_path" : "impact.name", "type" : "string"}, //No I18N
                "urgency":{"value_path" : "urgency.name", "type" : "string"}, //No I18N
                "group":{"value_path" : "group.name", "type" : "string"} //No I18N
            };
            return additionalMetaInfo;
        }
    return pbTbComp;
}()),$problemList);
