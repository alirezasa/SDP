var $ldapListView = {
    view: 'table',//No I18N
    viewMode: 'table',//No I18N
    table_comp_ldap_lv:{},
    module: 'ldap_domains',//No I18N

    init: function(options){
        let contextObj = {};
        contextObj.module = this.module;
        contextObj.view = this.viewMode;
        contextObj.viewMode = this.viewMode;
        renderhbs('#ldap_domain_list', 'ldap_list_container', options, false, 'ldap');//No I18N

        if($ldapListView.table_comp_ldap_lv && !jQuery.isEmptyObject($ldapListView.table_comp_ldap_lv)){
            $ldapListView.table_comp_ldap_lv.destroy();
        }
        renderhbs('#ldap_listviewloader', 'ldap_action_header', contextObj, false, 'ldap', false, null, function(){//No I18N
            renderhbs('#ldap_table_render_div', 'ldap_domain_lv_web_component', contextObj, false, 'ldap');//No I18N
        });
        this.loadLdapTableComponent();
    },

    loadLdapTableComponent: function(){
        let componentName = 'webc-ldapDomains';//No I18N
        delete WebComponents.instancePool[componentName];
        WebComponents.render(componentName);
        this.table_comp_ldap_lv = WebComponents.getInstance(componentName);
    },

    tableEntityInfo: function(personalize_key){
        let table_info = getPersonalizeData(personalize_key);

        if(jQuery.isEmptyObject(table_info) || jQuery.isEmptyObject(table_info.fields_required)){
            let list_info = {
                "start_index" : 1,//No I18N
                "row_count" : 10,//No I18N
                "get_total_count" : "true"//No I18N
            };
            table_info = {
                "list_info": list_info,//No I18N
                "fields_required": {"domain_controller": "", "username": "", "base_dn": "", "search_filter": "", "is_imported": "", "ldap_import": ""},//No I18N
                "column_order": ["domain_controller", "username", "base_dn", "search_filter", "is_imported", "ldap_import"]//No I18N
            }
        }
        return table_info;
    },

    //ldap_import is removed from the fields_required array as it is not a field in ldap domain entity
    rowDataConstruct: function(tableInfo, args){
        let inputObject = {};
        let fields_required_arr = tableInfo.fields_required ? Object.keys(tableInfo.fields_required) : [];
        let importBtnInd = fields_required_arr.indexOf('ldap_import');

        if(importBtnInd > -1){
            fields_required_arr.splice(importBtnInd, 1);
        }
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = tableInfo.list_info;
        return inputObject;
    },

    tableCompOptions: function(){
        options = {
            "default_sort_field":{//No I18N
                "sort_field": "id",//No I18N
                "sort_order": "desc"//No I18N
              },

              "reinitializeCalback": this.reinitializeCalback //No I18N
        };

        return options;
    },

    reinitializeCalback: function(){
        this.loadLdapTableComponent();
    },

    //User Imported column is a boolean and it need to be sorted
    additionalMetaInfo: function(){
        let add_meta_info = {
            "is_imported" : {"sortable" : "true"}//No I18N
        }
        return add_meta_info;
    },

    //disabling delete domain option for demo
    callbackInitialRender: function(){

        if(sdp_app.IS_DEMO_BUILD){
            jQuery('#deleteicon_'+this.module).find('#'+this.module+"_btn_delete").off("click").on("click", function(){ //No I18N
                disableForDemo();
            });
        }
    },

    setWidth: function(){
        return jQuery('#listview').width();
    },

    setHeight: function(){
        return 400;
    },

    //Import column cell will have a link. On click, it will import the users from LDAP immediately
    constructImportCell: function(table_data){
        let rd = table_data.row_data;
        let data_handler = sdp_app.IS_DEMO_BUILD ? 'disableForDemo()' : 'importLdapfromListView('+rd.id+')'; //No I18N
        let cell_data = '<a href="/" data-event="click" data-handler="'+data_handler+'" nonce='+sdpNonce+'>'
                            +'<span class="cspr import icon-sm flat mr5"></span>'+translate("sdp.inventory.assetImport.importButtonValue")
                        +'</a>';
        return cell_data;
    },

    //Domain controller column cell will have a link to edit the specific controller
    constructDCCell: function(table_data){
        let rd = table_data.row_data;
        let cell_data = '<a href="/ImportLdapUsers.do?module=editLDAP&amp;LDAP_ID='+rd.id+'&amp;" null="" target="SDPHeaderFrame">'+e_html(rd.domain_controller)+'</a>';
        return cell_data;
    },

    setNoDataString: function(){
        let message = translate('sdp.ldap.listview.nodcmessage');
        return '<span>' + message + '<span>';
    }
};

