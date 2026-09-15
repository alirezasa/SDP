/* $Id$ */
var serviceSLARules = {

    /*
    To load Associated Business Rules
    wrapper - div id to wrap table content
    slaObj - service sla data
    isForDetailView - boolean for List View or Details Page
    tableHolder - rule_sla_associations
    */
    load: function( wrapper ,slaObj  , isForDetailView , tableHolder) {

        var row_count = (isForDetailView ? 3 : 10);
        //for detail view only 3 rows are shown
        var table_info = {"list_info":{"row_count": row_count ,"start_index":"1"}}; //NO I18N

        serviceSLARules.slaObj = slaObj ? slaObj : serviceSLARules.slaObj;
        serviceSLARules.isForDetailView = isForDetailView == true ;
        serviceSLARules.wrapper = wrapper ? wrapper : serviceSLARules.wrapper;

        jQuery(serviceSLARules.wrapper).empty();
        var tableHolder = tableHolder ? tableHolder : "rule_sla_associations"; // NO I18N
        renderhbs( serviceSLARules.wrapper,'service-sla-br', {"isForDetailView" : isForDetailView , "tableHolder" : tableHolder},false,'admin'); // NO I18N

            jQuery("#rule_sla_associations_div").empty();
            jQuery("#rule_sla_associations_wrap").fadeIn();

             var table_content = {};
              table_content.header = serviceSLARules.headerdataConstruct(serviceSLARules);
              table_info.fields_required = {
                  "name" : { // No I18N
                      "column_settings": { "view_type": "row" ,"rowposition":0 }, // No I18N
                      "hide_label": true, //No I18N
                      "default": true, // No I18N
                      "dataCelltransformer" : serviceSLARules.nameCellTransformerRuleGrpTitle // No I18N
                   },
              }
              table_info.list_info.search_criteria={field:"sla.id",value:serviceSLARules.slaObj.id,condition:"eq"};// No I18N
              if(serviceSLARules.slaObj.id!=null){
                
                  setTimeout(function() {
                    var options = {

                        callbackRowfunction : serviceSLARules.rowDataConstruct,
                        row_inputdata       : serviceSLARules.rowDataConstruct(table_info,serviceSLARules),
                        callbackURL: "slas/"+serviceSLARules.slaObj.id+"/_associated_workflows", // No I18N
                        columnChooserEnabled: false,
                        view : "kanban", // No I18N
                        view_mode : "linear", // No I18N
                        nodataString: '<div class="pos-rel tc p10">'+translate("sdp.listview.nodataavailble")+'</div>',
                        callbackAfterBodyRender : serviceSLARules.showTotalCount,
                        entity_name: "associated_workflows", // No I18N
                        getmetaInfo: false,
                        search : true,
                        height: " ",
                        isFR_ListInfo_Support: true,
                        isODAPI: true,
                        multiDeleteEnabled: false,
                        paginationEnabled: true,
                        searchEnabled: false,
                        sortingEnabled: false,
                        tableHolder: "rule_sla_associations", // No I18N
                        width : "auto" // No I18N

                    };

                    var table_compreq = new tableComponent(table_info,table_content,options,serviceSLARules);
                    serviceSLARules.tableComp= table_compreq;

                  },10);
              }
    },

    /*
    To open Rule Association Popup in Service Sla details page
    wrapper (List View) - slaBrContentHolder
    wrapper (Details Page - Inline) - slaBrContentHolder
    wrapper (Details Page - Popup) - slaBrContentHolderPopup
    */
    openPopupForDetailView : function()
    {
          var dialog=jQuery('#associateSLA').dialog({
                'resizable':false,// No I18N
                'draggable':false,// No I18N
                'autoOpen':false,// No I18N
                 show: {
                  effect:'fade',// No I18N
                },
                'title':'',// No I18N
                'width':'1200',// No I18N
                'height':'570',// No I18N
                'modal':true,// No I18N
                close:function(){
                   jQuery("#slaBrContentHolderPopup").empty();

                   //for jsp page refelction on close
                   var associationCount = serviceSLARules.tableComp ? serviceSLARules.tableComp.t_obj.table_info.list_info.total_count : 0;
                   if(associationCount != 0)
                   {
                    jQuery("#BRassocList").removeClass("hide");
                    jQuery("#noBRAssoc").addClass("hide");

                    serviceSLARules.load("#slaBrContentHolder",null,true,"rule_sla_associations"); // NO I18N

                   }
                   else
                   {
                    jQuery("#BRassocList").addClass("hide");
                    jQuery("#noBRAssoc").removeClass("hide");
                   }
                }
          });

          dialog.data( "sdpDialog" )._title = function(title) {//NO I18N
             title.html( this.options.title );
          };

         jQuery('#associateSLA').dialog("open"); // NO I18N
         jQuery("#slaBrContentHolder").empty();
         serviceSLARules.load("#slaBrContentHolderPopup",null,false,"rule_sla_associations"); // NO I18N
         
    },

    /*
    To show Total Count of BR SLA Association
    For SLA List View - Add total count as title in Auto-Applied via Rules Popup
    For Details Page - Add Count in Details pPage and show View More option only if Count is greater than 3
    */
    showTotalCount : function()
    {
        var associationCount = serviceSLARules.tableComp ? serviceSLARules.tableComp.t_obj.table_info.list_info.total_count : "0";

        if(!serviceSLARules.isForDetailView)
        {
            var title = translate('sla.availablerules');
            title=title+' ('+associationCount+') - '+e_html(serviceSLARules.slaObj.name);// No I18N    
            jQuery("#associateSLA").dialog('option', 'title',title);//NO I18N
            jQuery('#pagination_comp_rule_sla_associations').children().removeClass('ml10');
        }
        else
        {
            jQuery("#sla-rules-count").text(" ("+associationCount+")");
            if(associationCount > 3){
				var html =  '<div class="tc-row cv-task-item p0 visi-parent"><div class="disp-t ml30 p10"><a href="/" id="br-associate-popup" class="text-primary pl10" >'+translate('sdp.project.history.viewmore')+'</a></div></div>';
            	jQuery("#rule_sla_associations_kanban_div").append(html);
            	jQuery("#br-associate-popup").off('click').on('click', (event) => {
                    serviceSLARules.openPopupForDetailView();
                })
			}
        }
        
    },

    /*
    To construct header data for table comp
    controller - ServiceSLARules
    */
    headerdataConstruct: function(controller) {

          var meta_data = {
                  "name" : { // No I18N
                      "column_settings": { "view_type": "row" ,"rowposition":0 }, // No I18N
                      "hide_label": true, //No I18N
                      "default": true, // No I18N
                      "dataCelltransformer" : controller.nameCellTransformerRuleGrpTitle // No I18N
                   }
              }; 
          return meta_data;
    }, 

    /*
    To construct list info
    tableData - contains table info
    Row Count for Details Page (Inline) - 3
    */
    rowDataConstruct : function(tableData){
        var inputObject = {};
        inputObject.list_info = tableData.list_info;
        inputObject.list_info = {"get_total_count":true, "row_count":tableData.list_info.row_count}; // No I18N
        return  inputObject;
    },

    /*
    To construct row data with Rule Details
    tableData - contains table info
    */
    nameCellTransformerRuleGrpTitle : function(tableData)
    {
      var row_data=tableData.row_data;

      if(row_data)
      {
        
        var rule = row_data.rule ? row_data.rule : {} ;
        var rule_group = rule.group ? rule.group : {} ;
        var description = rule.description ? rule.description : "-";
        var rule_nav_url = "app#/admin/modules/servicecatalogbrules/"+rule_group.id+"/"+rule.id;   // No I18N

        var disabled_html = rule.is_enabled ? '' : '<span class="alert-danger1 mr10"><span class="cspr icon-sm disable-no mr3"></span>'+translate('common.disabled')+'</span>';
        return '<div class="row p-hidethis m0 p15"><div class="col-xs-11 p0 pl30 ml5"><div class="truncate-ellipsis"> <div class="disp-flex"><span class="vmiddle disp-ib sb text-overflow" rel="uitip" mode_ellipsis="true" title="'+e_attr(rule.name)+'">'+e_html(rule_group.name)+' &gt;&gt; '+e_html(rule.name)+'</span><span class="hidethis" rel="uitip" title="'+translate("table.open.newtab")+'"><a href="'+rule_nav_url+'" target="_blank" class="cspr flat icon-sm newtab ml10 mr10 top0" role="img" rel="noopener"></a></span>'+disabled_html+'</div><div class="text-overflow mt10"><span class="text-muted" title="'+e_attr(description)+'" rel="uitip" mode_ellipsis="true" >'+e_html(description)+'</span></div></div></div></div>';
      }
      
      return "-";

    },

 }