/* $Id$ */
//To Enable Table child view expand and collapse
function tableChildView(tableInstance){
    "use strict";
    var eventNameSpace = '.tableChildView';
    var _self = tableInstance; //reference to table instance

    //add methods to table component instances
    function addMethodToTableInstance(methods){
        methods.forEach((methodName)=>{
            tableInstance[methodName] = childViewInstance[methodName];
            delete childViewInstance[methodName];
        })
    }

    //search data in product data for child view, CIType search
    function searchInData(data, searchOptions) {
        const resultSet = [];
        var getParents = (ref_parent)=>ref_parent.split('_').filter(parentId=>parentId);
        var searchByField = (item,fieldName,searchTerm)=>item[fieldName] && item[fieldName].toLowerCase().includes(searchTerm);
        var addParentIds = (item)=> {
           if(item) {
                var parents = getParents(item.ref_parent||'');
                var addIdToResultSet = (id)=>{
                    if(!resultSet.includes(id)) {
                        resultSet.push(id);
                    }
                }
                parents.forEach(addIdToResultSet);
           }
        }
        var addSearchResult = (item)=>{
            resultSet.push(item.id);
            addParentIds(item);
        };
        var searchFieldItem = function (field) {
            var fieldName = Object.keys(field)[0];
            var searchTerm = field[fieldName];
            var item = this.item;
            searchTerm = searchTerm ? searchTerm.toLowerCase() : null;
            return (searchTerm && searchByField(item,fieldName,searchTerm)) || !searchTerm;   
        }
        var filterData = (item) => {
            var hasMatch = searchOptions.every(searchFieldItem,{item:item});
            hasMatch && addSearchResult(item);
        }
        var compareResult =(item)=> resultSet.includes(item.id);
        data.forEach(filterData);
        return data.filter(compareResult);
    }

    var childViewInstance = {
        //init childView
        expandFirstLevel:false,
        init:function() {
            childViewInstance.constructExpendCollapseButton();
            var methods = ['constructChildData','extendChildViewdData','getChildViewParentAttr','constructChildViewCellData','chidViewAfterRender'];
            addMethodToTableInstance(methods);
            //expand first level alone for cmdb
            childViewInstance.expandFirstLevel = _self.t_obj.options.entity_name == "ci_types";
            childViewInstance.bindEvents();
        },
        //construct button Expand All
        constructExpendCollapseButton: function(){  
            childViewInstance.button = jQuery('<button id="'+_self.tableId+'_child_expendcollapse" type="button" class="btn btn-default btn-sm"  data-tbl-state="expand">'+translate("sdp.common.expandall")+'</button>');      
            jQuery('#t_child_expendcollapse_' + _self.tableId).append(childViewInstance.button);            
        },
        //extract data from entity
        extendChildViewdData:function(data,searchTerm) {
            var opt = _self.t_obj.options;
            var ext_data = jQuery.extend(true, [], data[opt.entity_name]);
            data[opt.entity_name] = _self.constructChildData(ext_data,searchTerm);
            return data;
        },
        isSearchOpen:()=>jQ('.searchRow',_self.tblContainer).is(':visible'),
        //create attribute for parent child relationship
        getChildViewParentAttr:function(rowData,action){
            var data = {
                childCls:'',
                parentAttr:''
            };
            if(rowData.indent != 0){
                data.childCls = "hidden";
                childViewInstance.isSearchOpen() && action == "search" && (data.childCls = ""); //show child row if search is open
                rowData.parent_id && (data.parentAttr = "data-rw-parent="+rowData.parent_id+"  data-rw-ref-parent="+rowData.ref_parent);
            }
            return data;
        },
        //construct row cell toggle icon
        constructChildViewCellData:function (rowData,disp_str) {
            var arrowIcon = '<div data-id="' + rowData.id + '" data-name="child_' + _self.tableId + '_' + rowData.id + '" class="icon-sm mr10 cspr circle-arrow-down top0 preview_icon" title="'+ translate('sdp.common.expand') +'" rel="uitip"></div>';
            var noChildIcon = '<span class="mr10 cspr vhide" data-style="width:13px;"></span> '
            var childArrow = rowData.has_child ? arrowIcon : noChildIcon;
            const isRTL = (sdp_user.DIRECTION == 'RTL');
            const padding = isRTL ? 'padding-right' : 'padding-left';
            var disp_str = '<div  data-style="'+padding+':'+rowData.indent+'px">' +childArrow + disp_str + "</div>"; // No I18N
            return disp_str;
        },
        //creating parent child relationship
        constructChildData:function(data,searchOptions) {
            var ID_KEY = 'id'; //No I18N
            var PARENT_KEY = 'parent'; //No I18N
            var CHILDREN_KEY = 'children'; //No I18N
            var map = {};
            for (var i = 0; i < data.length; i++) {
                if (data[i][ID_KEY]) {
                    map[data[i][ID_KEY]] = data[i];
                    data[i][CHILDREN_KEY] = [];
                }
            }
            for (var i = 0; i < data.length; i++) {
                if (data[i][PARENT_KEY]) { // is a child
                    if (map[data[i][PARENT_KEY]["id"]]) // for dirty data
                    {
                        data[i].parent_id = data[i].parent.id;
                        map[data[i][PARENT_KEY]["id"]][CHILDREN_KEY].push(data[i]); // add child to parent
                        data.splice(i, 1); // remove from root
                        i--; // iterator correction
                    } else {
                        data[i].parent_id = 0; // clean dirty data
                    }
                }else{
                    data[i].parent_id = 0;
                }
            };
            var childData = [];
            extractChildData(data, 0);
            function extractChildData(c_data, indent, parent_id){
                for(var i = 0, len = c_data.length; i < len; i++) {
                    c_data[i].indent = indent;
                    childData.push(c_data[i]);
                    if(parent_id){
                        c_data[i].ref_parent = parent_id;
                    }
                    if(c_data[i].children.length > 0) {
                        c_data[i].has_child = true;
                        extractChildData(c_data[i].children, indent + 20, parent_id ? c_data[i].ref_parent+c_data[i].id+"_" : "_"+c_data[i].id+"_");
                        delete c_data[i].children;
                    }                        
                }
            }

            var doSearch =()=>childData = searchInData(childData, searchOptions);
            searchOptions && doSearch();
            return childData;
        },
        updateButtonText:function(button,status){
            if(status){
                button.dataset.tblState='collapse';
                jQuery(button).text(translate("sdp.common.collapseall"));
            } else {
                button.dataset.tblState='expand';
                jQuery(button).text(translate("sdp.common.expandall"));
            }
        },
        //bind events for toggle group
        bindEvents:function(){
            var button = childViewInstance.button;
            button.off(eventNameSpace).on('click'+eventNameSpace,function(evt,data){
                var forceStatus = data && data.hasOwnProperty('forceStatus') ? data.forceStatus : true;
                if(this.dataset.tblState == "expand" && forceStatus){
                     childViewInstance.expendOrCollapseChild(true);
                     childViewInstance.updateButtonText(button.get(0),true);
                } else {
                    childViewInstance.expendOrCollapseChild(false);
                    childViewInstance.updateButtonText(button.get(0),false);
                }
             });

             childViewInstance.bindToggleIconEvent();

            //  delete childViewInstance.button; // delete dom eleme reference
            //  button = null; // clearing clousure variable memory
        },
        //  event handling for toggle individual row
        bindToggleIconEvent:function(){
            _self.tblContainer.off("click"+eventNameSpace)
            .on("click"+eventNameSpace,"tbody>tr>td div[data-name^='child_']" ,function(e) {
                var cur_id = jQ(this).attr("data-id");
                if(jQuery(this).hasClass("circle-arrow-down")) {
                    jQuery(this).removeClass("circle-arrow-down").addClass("circle-arrow-up").attr("title",translate("sdp.common.collapse")).uitooltip({content:translate("sdp.common.collapse")});
                    var expandableRow =  jQ("[data-rw-parent="+cur_id+"]");
                    expandableRow.removeClass("hidden");
                } else {
                    jQuery(this).removeClass("circle-arrow-up").addClass("circle-arrow-down").attr("title",translate("sdp.common.expand")).uitooltip({content:translate("sdp.common.expand")});
                    jQuery.each(jQuery("[data-rw-ref-parent]",_self.tblContainer), function(i, el){
                        var refs = jQ(el).attr("data-rw-ref-parent");
                        if(refs.indexOf("_"+cur_id+"_") != -1){
                            jQ(el).addClass("hidden").find("[data-name^='child_']").removeClass("circle-arrow-up").addClass("circle-arrow-down");
                        }
                    })
                }
            });
        },
        chidViewAfterRender:function(action) {
            if (action === "init" || action === "searchClose") {
                //Expand First levels alone
                if(childViewInstance.expandFirstLevel) {
                    jQ(childViewInstance.button).trigger('click',{forceStatus:false});
                } else if(childViewInstance.isSearchOpen()){
                    // check if search is open, update Button to show Collapse All button, else Expand All button
                    childViewInstance.updateButtonText(childViewInstance.button.get(0),false);
                }
            } else if (action === "search") {
                childViewInstance.updateButtonText(childViewInstance.button.get(0),true);
            }
        },
        //Expand All and Collapse All actions
        expendOrCollapseChild: function(isExpend){
            if(isExpend){
                //expand all
                jQuery("[data-name^='child_']",_self.tblContainer).removeClass("circle-arrow-down").addClass("circle-arrow-up").attr("title",translate("sdp.common.collapse")).uitooltip({content:translate("sdp.common.collapse")});
                jQuery("[data-rw-parent]",_self.tblContainer).removeClass("hidden");
            }else{
                //collapse all 
                jQuery("[data-name^='child_']",_self.tblContainer).removeClass("circle-arrow-up")
                .addClass("circle-arrow-down").attr("title",translate("sdp.common.expand"))
                .uitooltip({content:translate("sdp.common.expand")});
                jQuery("[data-rw-parent]",_self.tblContainer).addClass("hidden");
                
                //Expand First levels alone
                if(childViewInstance.expandFirstLevel) {
                    let arrowElement = jQuery('tbody > tr.tc-row:not([data-rw-ref-parent]) > td div.circle-arrow-down',_self.tblContainer).get(0);
                    arrowElement && jQuery(arrowElement).trigger('click');
                }
            }
        }
    };

    //init child view expand and collapse to table
    childViewInstance.init();
}



