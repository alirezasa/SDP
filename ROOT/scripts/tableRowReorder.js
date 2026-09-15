/* $Id$ */
function tableRowReorder(tableInstance) {
    "use strict";
    var eventNameSpace = '.tableRowReorder';
    var _self = tableInstance;

    var reorderInstance = {
        //Reorder methods starts here
            reorderState: false,
            init:function(){
                // reorderInstance.disablePagination();
                reorderInstance.constructReorderButton();
                reorderInstance.bindEvents();
            },
            togglePagination:function(show){
                var pageElem = jQuery('#pagination_comp_' + _self.tableId);
                // When reorder enables we restricting the pagination and sorting in the table list
                show ? pageElem.removeClass('hide') : pageElem.addClass('hide')
            },
            enablePagination:function(){
                // When reorder enables we restricting the pagination and sorting in the table list
                jQuery('#pagination_comp_' + _self.tableId).removeClass('hide');
            },
            constructReorderButton: function () {
                reorderInstance.$container = jQuery('#reorder_' + _self.tableId);
                var getId = (idName)=>_self.getTableId("#",idName);
                
                var buttons = '<button id="'+_self.tableId+'_reorder_enable_btn" data-reorder-action="toggleReorder" type="button" class="btn btn-default btn-sm" >'+translate("sdp.dashboard.common.reorder")+'</button>'+
                    '<button id="'+_self.tableId+'_reorder_apply_btn" data-reorder-action="applyRowOrder"  type="button" class="btn btn-primary btn-sm mr10" rel="uitip">'+translate("sdp.change.sla.applychanges")+'</button>'+
                    '<button id="'+_self.tableId+'_reorder_cancel_btn" data-reorder-action="toggleReorder" type="button" class="btn btn-default btn-sm" rel="uitip">'+translate("common.cancel")+'</button>';
                
                buttons = jQ(buttons);
                buttons.filter(getId('_reorder_apply_btn')+','+getId('_reorder_cancel_btn')).css('display','none'); // show reorder button and hide other buttons

                reorderInstance.$container.empty().append(buttons);
            },
            bindEvents: function(){

                reorderInstance.$container.off("click"+eventNameSpace);
                
                reorderInstance.$container
                .on('click'+eventNameSpace,"#" + _self.tableId + "_reorder_enable_btn, #"+_self.tableId+"_reorder_cancel_btn", function (e) {
                    var dontSkip = !e.isDefaultPrevented();
                    dontSkip && reorderInstance.toggleReorder(e);
                });
    
                reorderInstance.$container
                .on("click"+eventNameSpace,"#" + _self.tableId + "_reorder_apply_btn", function(e){
                    var dontSkip = !e.isDefaultPrevented();
                    dontSkip && reorderInstance.applyRowOrder(e);
                }); 
                
                //Mapping actions
                // reorderInstance.addEvent(reorderInstance.$container,'click','button[data-reorder-action]');
                
                //Reorder on change in input
                reorderInstance.addEvent(_self.tblContainer,'change','input[data-reorder-input]');

            },
            addEvent:function($element,evtName,selector,callback){
                callback = callback || reorderInstance.actionMapper;
                $element
                .off(evtName+eventNameSpace);
                typeof selector == 'string' ? $element.on(evtName+eventNameSpace,selector,callback) : $element.on(evtName+eventNameSpace,callback);
            },
            actionMapper:function(e) {
                if(e.isDefaultPrevented()){
                    //To stop our job
                    return;
                }
                var action = this.dataset.reorderAction;
                reorderInstance[action] && reorderInstance[action].call(this,e);
            },
            addReorderTemplate:function(){
                var notHaveHeaderTemplate = _self.tblContainer.find('thead#'+_self.tableId+'_head>tr>th.tbl-reorder-cell').length == 0;
                var notHaveRowTemplate = _self.tblContainer.find('tbody#'+_self.tableId+'_body>tr.tc-row>td.tbl-reorder-cell').length == 0;
                if(notHaveHeaderTemplate) {
                    let headerTemplate = `<th width="31px" class="tbl-reorder-cell"></th>
                                          <th width="31px" class="tbl-reorder-cell"></th>`;

                    _self.tblContainer.find('thead#'+_self.tableId+'_head>tr>th:first').before(headerTemplate);
                }
                if(notHaveRowTemplate) {
                    let getRowTemplate = (i)=>{
                        return `<td class="tc-row visi-parent tbl-reorder-cell">
                                <span class="cspr drag1 icon-xs ml5 mr10 left3 row-handle"></span>
                            </td>
                            <td class="tc-row visi-parent tbl-reorder-cell">
                                <span> <input class="form-control" type="text" value="${i}" data-reorder-action="reorderByInput" data-reorder-input> </span>
                            </td>`;
                     }
                     let rows = _self.tblContainer.find('tbody#'+_self.tableId+'_body>tr.tc-row').get();
                     let addRowTemplate = (row,ind)=>jQuery('td:first',row).before(getRowTemplate(ind+1));
                     rows.forEach(addRowTemplate);
                }
            },
            setReorderState: function(state) {
                reorderInstance.reorderState = state;
            },
            toggleReorder: function() {
                var isEnabled = reorderInstance.reorderState;
                var toggleCheckboxColumn = (show)=>{
                   var columns = jQ('thead th:eq(3),tbody tr td.headercheckbox',_self.tblContainer);
                   show ? columns.removeClass('hide') : columns.addClass('hide');
                }
                if(!isEnabled){
                    reorderInstance.addReorderTemplate();
                    _self.tblContainer.find(".tbl-reorder-cell").removeClass("hide").end().find('input#'+_self.tableId+'_head_chk').addClass("hide");
                    jQuery("#"+_self.tableId+"_reorder_apply_btn, #"+_self.tableId+"_reorder_cancel_btn").show();
                    jQuery("#"+_self.tableId+"_reorder_enable_btn").hide();
                    reorderInstance.initReorder();
                    reorderInstance.reorderState = true;
                    reorderInstance.togglePagination(false);
                    toggleCheckboxColumn(false); //hide checkbox column
                } else {
                    reorderInstance.destroySortable();
                    _self.tblContainer.find(".tbl-reorder-cell").addClass("hide").end().find('input#'+_self.tableId+'_head_chk').removeClass("hide")
                    jQuery("#"+_self.tableId+"_reorder_apply_btn, #"+_self.tableId+"_reorder_cancel_btn").hide();
                    jQuery("#"+_self.tableId+"_reorder_enable_btn").show();
                    _self.constructRowData(_self.visibleContents);
                    reorderInstance.reorderState = false;
                    reorderInstance.togglePagination(true);
                    toggleCheckboxColumn(true); //show checkbox column
                }
            },
            reorderByInput: function (){
                const newIndex = parseInt(this.value);
                const isInvalidInput = ()=>newIndex <= 0 || isNaN(newIndex) ? reorderInstance.swapRows(0, null) || false : true;

                if(isInvalidInput() && isNumeric(newIndex)) {
                    var tableContainer = _self.tblContainer.find('tbody#'+_self.tableId +'_body');
                    var rowSelector = 'tr.tc-row';
                    var oldIndex = jQuery(this).closest(rowSelector).index();

                    var totalRows = tableContainer.find(rowSelector+' input[data-reorder-input]').length;
                    if(totalRows === 1){
                        //skip if it has only one row to swap
                        this.value = 1;
                        return;
                    }
                    if(newIndex > totalRows){
                        reorderInstance.swapRows(totalRows-1, oldIndex)
                        return;
                    }
                    
                    var isExist = tableContainer.find(rowSelector).eq(newIndex-1);
                    if(isExist.length > 0){
                        isExist.find('input[data-reorder-input]').val(oldIndex+1);
                        var row1Index = newIndex-1;
                        var row2Index = oldIndex;
                        reorderInstance.swapRows(row1Index, row2Index);
                    }
                }
            },
            initReorder:function(){
                _self.tblContainer.find("#"+_self.tableId+'_body').sortable({
                    placeholder: "move-state-highlight", // No I18N
                    handle: ".row-handle",
                    axis:'y',
                    helper: reorderInstance.orderHelper,
                    stop: reorderInstance.updateRowOrder
                });
            },
            destroySortable:function() {
                _self.tblContainer.find("#"+_self.tableId+'_body').sortable("destroy");
            },
            orderHelper: function(e, tr) {
                var $originals = tr.children();
                var $helper = tr.clone();
                $helper.children().each(function(index) {
                    jQuery(this).width($originals.eq(index).width());
                });
                return $helper;
            },
            highlightRow:function(row,focusInput){
                row.closest('tr').addClass('reorderhiglite');
                focusInput && row.find('input[data-reorder-input]').focus();
                setTimeout(function(){
                    row.removeClass('reorderhiglite');
                },500);
            },
            /**
             * 
             * @param {number} index1 
             * @param {number} index2 
             * used to swap to rows
             */
            swapRows: function(index1, index2) {
                if (!isValidIndex(index2)) {
                    // If index2 is not valid, return early
                    return;
                }

                function isValidIndex(index) {
                    return index !== null && index !== undefined;
                }
                var tableContainer = jQuery("#"+ _self.tableId +'_body',_self.tblContainer);
                var rowSelector = '>tr.tc-row';
                var toSwapRow = tableContainer.find(rowSelector).eq(index2);
                
                // Detach the rows from the DOM
                toSwapRow.detach();
                // Insert toSwapRow at index1
                var row = tableContainer.find(rowSelector);
                index1 === 0 ? row.eq(index1).before(toSwapRow) : row.eq(index1- 1).after(toSwapRow);
               
                reorderInstance.highlightRow(toSwapRow,true);
                reorderInstance.updateRowOrder();
            },
            updateRowOrder: function(e,ui){
                ui && reorderInstance.highlightRow(ui.item);
                jQuery("#"+ _self.tableId +'_body [data-cs-field]:not(.hide)',_self.tblContainer).get()
                .forEach((elem,index) => {
                    jQuery(elem).find('input[data-reorder-input]').val(index + 1);
                });
            },
            applyRowOrder: function(){
                var opt = _self.t_obj.options;
                var row_order = jQuery("#"+ _self.tableId +'_body [data-cs-field]',_self.tblContainer).get()
                .map((elem)=>{
                    return elem.dataset.entityid;
                });
                var isOneRow = ()=>row_order.length <= 1;
                if(isOneRow()){
                    // If there is only one row, we don't need to reorder
                    reorderInstance.toggleReorder();
                    return;
                }

                var input_data = {
                    reorder: {
                        source_module:{
                            id: opt.reorderEntityId
                        },
                        index: row_order
                    }
                }

                if(typeof opt.callbackReorderPreSave == 'function')  {
                    input_data = opt.callbackReorderPreSave(input_data, _self);
                }

                input_data = sdpAjaxInputData(input_data);
                sdpAjax({
                    url: opt.defaultpath + (opt.reorderURL ? opt.callbackReorderURL : opt.callbackURL+"/_reorder") ,
                    // async: false,
                    type: "POST",
                    data: input_data,
                    success: function(resp){
                        reorderInstance.toggleReorder();
                        _self.refreshTable('reorderSave');
                        var message = resp.response_status.messages;
                        message = message ? message : _self.localTranslate("sdp.admin.common.updatedsuccessfully");
                        
                        showalert('success', message, "isAutoHide=true"); // No I18N

                         (opt.callbackReorderPostSave instanceof Function) && opt.callbackReorderPostSave(_self);

                    }
                })
            }
        };

        // jQuery.extend(tableInstance,reorderInstance);
        tableInstance.toggleReorder = reorderInstance.toggleReorder;
        tableInstance.setReorderState = reorderInstance.setReorderState;

        reorderInstance.init();
}

