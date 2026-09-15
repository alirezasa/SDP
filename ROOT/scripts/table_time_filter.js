/* $Id$ */

//init time filter to table component
//it will render time filter like last_30_days, last_60_day,etc and apply search criteria
//and support is_pending, is_completed etc like status in search criteria
function timeFilterLoad(evt,_self) {
    "use strict";
    //To load time filter methods to table component instance
    function loadTimeFilter(tableInstance){

        var getTimeFilterCriteria = (rangeCriteria)=> {
            //get time filter object from range_criteria [{},{}] array
            var timeFilterOption = tableInstance.t_obj.options.timeFilter;
            var fieldName = timeFilterOption.fieldName;
            var findField = (item)=>item.field == fieldName;
            var data = rangeCriteria && rangeCriteria.filter(findField);
            return data && data.length && data[0] || false;
        }
        
        var methods = {
                initTimeFilter: function () {
                    var _self = this;
                    
                    var options = _self.t_obj.options.timeFilter;
                    var isRangeCriteria = options.support_range_criteria;
                    _self.isRangeCriteria = isRangeCriteria;
                    _self.disablePersonalise = options.disablePersonalise == true ? true : false;

                    var hasHolder =  _self.doDefaultHolder();//add default holder if not exist
                    if(!hasHolder){
                        //no holder,so skip init process
                        return;
                    }
                   
                    _self.TimeFilter = timeFilter(options);
                    if(!_self.TimeFilter) {
                        //skip if no instance
                        return;
                    }

                    _self.addTimeFilterMethods();
                   
                    // time filter event bind
                    _self.initEvent();

                },
                //create status field icon for custom view filter
                createStatusFieldElement:function () {
                    var _self=this;
                    var options = _self.t_obj.options.timeFilter;
                    //adding status field value to display span
                    let timeFilterDiv = options.holder.querySelector('div.time-filter-wrapper');
                    var hasStatusElement = timeFilterDiv.querySelector('span.status-field');
                    if(hasStatusElement){
                        //skip it, it has status field element.
                        return;
                    }

                    _self.statusElem = jQ('<span>',{
                        class:'status-field cspr info icon-sm mr5',
                        rel:'uitip'
                    });

                    timeFilterDiv && jQ(timeFilterDiv).append(_self.statusElem);
                },
                addTimeFilterMethods:function(){
                    var _self = this;
                    _self.TimeFilter.afterResponse = _self.afterResponse.bind(_self);
                    _self.TimeFilter.beforeApiCall = _self.beforeApiCall.bind(_self);
                    _self.TimeFilter.addPersonalize = _self.addPersonalize.bind(_self);
                },
                doDefaultHolder:function(){
                    //it will add default holder inside div#listcontrols, if holder not exist in option
                    var _self = this;
                    var options = _self.t_obj.options.timeFilter;
                    if(!options.hasOwnProperty('holder')) {
                        var $listControl = _self.tblContainer.parent().parent().find('#listcontrols');
                        if($listControl.length){
                            options.holder= function() {
                                var holder = timeFilterLoad.holder = jQuery("<div class='fr mr10'></div>")[0];
                                $listControl.append(holder);
                                
                                return holder; 
                            };
                        }
                        return true;
                    } else if (!options.holder) {
                        return false;
                    }
                    return true;
                },
                initEvent:function(){
                    var _self = this;
                    var timeFilterInput = _self.TimeFilter.input;
                    
                    jQuery(timeFilterInput).off('timeFilterChange').on('timeFilterChange',function(){
                        _self.t_obj.table_info.list_info.start_index = 1;
                        _self.refreshTable("time-filter-change");
                    });
                },
                addCriteria:function(list_info,action) {
                    var _self = this;
                    var hasCustomView = !!list_info.view_info;
                    let value = _self.TimeFilter.getValue();
                    var defaultValue = !hasCustomView && (_self.t_obj.table_info.time_filter || value);
                    var criteria = (!hasCustomView && defaultValue) && _self.TimeFilter.getCriteria(defaultValue);

                    //for time filter change and table refresh case get the existing value of time filter
                    if(action == 'time-filter-change' || action == 'refresh') {
                        criteria = _self.TimeFilter.getCriteria(value);
                    } 

                    //For custom_view has status field criteria in hand,then add it to range_criteria 
                    (hasCustomView && _self.status_criteria) && (list_info.range_criteria = [_self.status_criteria]);

                    //defaultValue `all` means - no need to add search criteria, hence changed to null
                    defaultValue = defaultValue == 'all' ? null : defaultValue;

                    if(criteria || defaultValue ) {

                        var hasRangeCriteria = _self.isRangeCriteria;
                        var addSearchCriteria = ()=>{

                            if( !Array.isArray(list_info.search_criteria) && !jQuery.isEmptyObject(list_info.search_criteria) ){
                                //convert to array
                                list_info.search_criteria = [list_info.search_criteria];
                            }
    
                            if(list_info.search_criteria == undefined) {
                                list_info.search_criteria = criteria;
                            } else if(Array.isArray(list_info.search_criteria)) {
                                list_info.search_criteria.push(criteria);
                            }
                        }
                        var addRangeCriteria = ()=> {
                            list_info.range_criteria = tableInstance.rangeCriteria || [];
                            var rangeCriteria = list_info.range_criteria;
                            
                            let timeFilterCriteria = getTimeFilterCriteria(rangeCriteria);
                            var update = ()=>Object.assign(timeFilterCriteria, _self.TimeFilter.getCriteria());
                            var add =()=> {
                                var newCriteria = criteria || _self.TimeFilter.getCriteria(defaultValue);
                                newCriteria && rangeCriteria && rangeCriteria.push(newCriteria);
                            }

                            timeFilterCriteria ? update() : add();
                        }
                        hasRangeCriteria ? addRangeCriteria() : addSearchCriteria();
                    }
                },
                removeCriteria:function(list_info) {
                    var _self = this;
                    if(list_info.search_fields && Object.keys(list_info.search_fields).length == 0) {
                        //remove search_fields if empty
                        delete list_info.search_fields;
                    }
            
                    if( _self.TimeFilter && list_info.search_criteria) {
                        //remove time filter search criteria if exist
                        
                        var fieldName = _self.TimeFilter.getFieldName();
                        function filterCriteria(search_criteria) {
                            return  search_criteria.filter(function(item) {
                                if(item.children && item.children.length) {
                                    //clear children criteria
                                    let childCriteria = filterCriteria(item.children);
                                    (childCriteria.length) && (item.children = childCriteria) || delete item.children;
                                }
                                return item && item.field != fieldName;
                            });
                        }
                    
                        if(list_info.search_criteria && list_info.search_criteria.field == fieldName) {
                            //remove time filter in object
                            delete list_info.search_criteria;
                        } else if(Array.isArray(list_info.search_criteria)) {
                            //remove time filter in array
                            list_info.search_criteria = filterCriteria(list_info.search_criteria);
                        }
                    }
                },
                beforeApiCall: function(inputObject,action){
                    var _self = this;
                    var list_info = inputObject.list_info;
                    _self.removeCriteria(list_info);
                    _self.addCriteria(list_info,action);
                },
                afterResponse:function(rangeCriteria,action,list_info) {
                    var _self=this;
                    if(!_self.isRangeCriteria || action == 'time-filter-change' || action == 'refresh') {
                        //skip for don't have range criteria support
                         //for time-filter-change and table refresh case, no need to set the value to time filter
                        // Hence skipping it
                        return;
                    }
                    
                    // this is only for range_criteria value to be set in time filter - special handing for custom view case
                    var stopTrigger = true,value;
                    var hasCustomView = !!list_info.view_info;
                     
                    if(hasCustomView) {
                        //has custom view add status field icon
                        _self.createStatusFieldElement();
                        _self.setStatusFieldValue(rangeCriteria);
                    } else if(_self.statusElem) {
                        //don't have custom view,so remove status field icon
                        _self.statusElem.remove();
                        _self.statusElem = null;
                    }
                    
                    if(rangeCriteria) {
                        // setting the range criteria value to time filter
                        var timeFilterSearchCriteria = rangeCriteria && getTimeFilterCriteria(rangeCriteria);
                        value = timeFilterSearchCriteria && timeFilterSearchCriteria.value;
                        value = !value ? 'all' : value; // false mean no range criteria all data to show
                        var setValue = ()=>value && _self.TimeFilter.setValue(value,stopTrigger);

                        value && setTimeout(setValue,10);
                    }               
                    
                },
                setStatusFieldValue:function(criteria){
                    //To show status pending,completed and all
                    var data = {
                       'is_pending': translate('sdp.requests.viewrequest.allpendingrequests'),
                       'is_completed': translate('sdp.requests.viewrequest.allcompletedrequests'),
                       'all': translate('sdp.requests.viewrequest.requester.allrequests'),
                    },statusValue;

                    var removeDolloar= (value)=> value.replace(/\$\(|\)/g,'');
                    var getStatusField = ()=>{
                        var findStatus = (item)=>{
                            if(item.field == 'status'){
                                statusValue = removeDolloar(item.values[0]);
                                _self.status_criteria = item;
                                return true;
                            }
                        }
                        criteria && criteria.some(findStatus);
                    }
                   
                    getStatusField();
                    statusValue = data.hasOwnProperty(statusValue) && data[statusValue];
                    statusValue  = !statusValue ? '' : statusValue ;
                    _self.statusElem.attr('title',statusValue); //set title to icon

                    return statusValue;
                },
                addPersonalize:function(tbl_inf) {
                    !this.disablePersonalise && (tbl_inf.time_filter = tableInstance.TimeFilter.getValue());
                }
        };

        //add method to instance
        var addMethods = (methodName)=>tableInstance[methodName] = methods[methodName];
        Object.keys(methods).forEach(addMethods);

        methods = addMethods = null; // clear the memory

        tableInstance.initTimeFilter(tableInstance.t_obj.options.timeFilter);
    }

    //To remove old time filter wrapper div
    var removeHolder=()=>{
        timeFilterLoad.holder.remove();
        delete timeFilterLoad.holder;
    } 
    timeFilterLoad.holder && removeHolder();
   
    if(_self.t_obj.options.timeFilter && _self.t_obj.options.view_mode != "full_kanban") {
        loadTimeFilter(_self);
    }
}
jQuery(document).off('initTableComponent.timeFilter').on('initTableComponent.timeFilter',timeFilterLoad);
