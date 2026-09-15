/* $Id$ */
//Table component advance picklist multiselect search support

//It support PL field searchable and apply search criteria
function tableInlinePLSearch(_self,options) {
    "use strict";
    var plSearchCriteria = {}; // storing the PL search criteria,which are added
    var isPLSearchEnabled =()=> options.enablePickListSearch == true;
    var tableInstance = _self;

    //To create PL search.
    function createPLSearch(config) {
        var eventNameSpace = '.tbl-pl-search';

        //To run function in order of queue
        function run(funcQueue) {
            var executeFn;
            executeFn=(input)=> funcQueue.reduce((param,func)=>func.call(input,param),input);
            return executeFn;
        }
        
        //To get dropdown template
        function getDropDownTemplate() {
            var template = `<div class="disp-flex jc-space-bt p5 pt10 pb10">
                                <div class="search-dropdown w-300px">
                                    <input class="inline-pl-search form-control btn-rad" />
                                </div>
                                <div class="pl10">
                                    <button data-action="search" type="button" class="btn btn-xs btn-primary mb10 disp-b minw-60px maxw-60px text-overflow">${translate('common.apply')}</button>
                                    <button data-action="cancel" type="button" class="btn btn-xs btn-white disp-b minw-60px maxw-60px text-overflow">${translate('common.cancel')}</button>
                                </div>
                            </div>`;

            return SDPTemplate(template).get();
        }

        //To get search icon template
        function getSearchIconTemplate(){
            var template = `
            <div class="btn-group bs-noconflict fr disp-ib adv-search-wrapper">
                 <button type="button" class="btn btn-link flat p0 ml5 init-pl-search filter-icon" rel="uitip" title="${translate('sdp.common.filter')}">
                     <span class="cspr icon-md filter3 vmiddle mt5"></span>
                 </button>
             </div>`;
            return SDPTemplate(template).get();
        }
        
        //To init search box text and filter icon tooltip
        function initSearchboxTooltip(){
            var tableId = '#'+tableInstance.tableId;
            initTooltip(tableId+' thead tr.searchRow');
        }

        //create PL search render process
        //it do search dropdown render process
        var doPLSearchRenderProcess = run([createDropdown,initSdpDropdown,initSelect2,addActions]);

        //Render dropdown and init select2
        function renderPickListSearch(container) {
            doPLSearchRenderProcess(container);
            container.isPlRendered = true;
        }

         //To create dropdown element
         function createDropdown(container){
            var dropdown = getDropDownTemplate();

            var containerGet = (toGet)=> {
                var found = container;
                toGet=='holder' && (found = container.querySelector('button.filter-icon'));
                toGet=='select2Input' && (found = dropdown.querySelector('input.inline-pl-search'));
                toGet=='dropdown' && (found = dropdown);
                return found;
            }

            return containerGet;
        }

        //init sdp dropdown component
        function initSdpDropdown(containerGet) {
            var sdpDropDownInstance;
            var container = containerGet();
            var holder = containerGet('holder');
            var dropdown = containerGet('dropdown');

            const options = {
                dropClass:'inline-pl-search-dropdown',
                scrollToClose:true,
                getDropdown:()=>dropdown
            }
            sdpDropDownInstance = sdpShowPop(holder,options);
            container.dropdownInstance = sdpDropDownInstance;
            // var open = ()=>sdpDropDownInstance.show();
            // setTimeout(open,10);

            return containerGet;
        }

        //while scroll - To close sdp dropdown and not close when select2 drop down open
        function stopCloseOnScroll(containerGet,closeTooltip){
            var container = containerGet();
            var holder = containerGet('holder');
            var dropdownInstance = container.dropdownInstance;
            var select2Input = containerGet('select2Input');

            var toggle = (e)=>{
                var isOpen = e.type == 'select2-open';
                var setConfig = dropdownInstance.setConfig;
                const toggleDropdownConfig = (isOpen, key, value, delay) => {
                    if (delay) {
                        isOpen ? setConfig(key, value) : setTimeout(() => setConfig(key, !value), delay);
                    } else {
                        setConfig(key, isOpen ? value : !value);
                    }
                };

                toggleDropdownConfig(isOpen, 'isEscapseClose', false, 300);
                toggleDropdownConfig(isOpen, 'scrollToClose', false, false);
                toggleDropdownConfig(isOpen, 'outSideClickToClose', false, 300);
            }

             
            jQuery(select2Input).on('select2-open select2-close',toggle);
            jQuery(holder).on('sdp-dropdown-open',closeTooltip);
            jQuery(holder).on('sdp-dropdown-close',closeTooltip);
        }

         //init PL select2 
         function initSelect2(containerGet) {
            var container = containerGet();
            var holder = containerGet('holder');
            var renderSelect2 = initApiSelect2;
            const closeTooltip = (evt)=>{
                 var isOpen = evt.type == 'sdp-dropdown-open';
                var tooltip = jQ(holder).data('uiTooltip');
                tooltip && isOpen && tooltip.disable();
                tooltip && !isOpen && tooltip.enable();
            }
            function initRender(){
                container.select2Instance = renderSelect2(containerGet);
                closeTooltip({type:'sdp-dropdown-open'});
                stopCloseOnScroll(containerGet,closeTooltip);
            }

            //render select2 after dropdown open first time
            jQuery(holder).one('sdp-dropdown-open',initRender);
            return containerGet;
        }

        //PL search Dropdown internal methods
        function getPLActionMethod(container) {
            var field = getFieldData(container);
            var methods = {
                closePLSearch:function() {
                    container.dropdownInstance.hide();
                    return this;
                },
                getValue:function(){
                    return container.select2Instance.data();
                },
                openSelect2Drop:function() {
                    container.select2Instance.open();
                },
                getSearchInput:function(){
                    var searchInput = container.searchInput || container.querySelector('input.default-inline-search');
                    (!container.searchInput) && (container.searchInput = searchInput);
                    return searchInput;
                },
                setSelected:function(){
                    var data = this.getValue();
                    var searchInput = this.getSearchInput();
                    var names = [],displayValue;
                    var pushItem =(item) => names.push(item.text);
                    
                    data.forEach(pushItem);
                    displayValue = names.join(', ');
                    
                    searchInput.value = displayValue;
                    this.setTitle(displayValue);
    
                    displayValue ? this.disableSearch() : this.enableSearch().focusSearch();
                    searchInput.PLSearchData = data;
                    
                    this.searchChange(field,data);
                    return this;
                },
                searchChange:function(field,searchData) {
                    var tableInstance = config.getTableInstance();
                    trigger(tableInstance,'PLSearchChange',[field,searchData]);
                },
                disableSearch:function(){
                    var searchInput = this.getSearchInput();
                    searchInput.disabled = true;
                    return this;
                },
                focusSearch:function(){
                    this.getSearchInput().focus();
                    return this;
                },
                setTitle:function(value) {
                    var searchInput = this.getSearchInput();
                    const searchContainer = searchInput.parentElement.querySelector('.pl-search-container');
                    const searchText = searchContainer.querySelector('.pl-search-text');

                    if(value){
                        searchInput.classList.add('hide');
                        searchContainer.classList.remove('hide');
                        searchText.textContent = value;
                        searchText.title = value;
                        searchText.setAttribute('rel','uitip');
                        searchText.setAttribute('mode_ellipsis','true');
                        initSearchboxTooltip();
                    } else {
                        searchInput.classList.remove('hide');
                        searchContainer.classList.add('hide');
                    }
                },
                enableSearch:function() {
                    var searchInput = this.getSearchInput();
                    searchInput.disabled = false;
                    return this;
                },
                clear:function(isClearOnly) {
                    var searchInput = this.getSearchInput();
                    searchInput.PLSearchData = null;
                    searchInput.value='';
                    container.select2Instance.data([]);
                    this.setTitle('');

                    !isClearOnly && this.searchChange(field,null);
                    
                    return this;
                }
            }
            return methods;
        }

        //Add actions to PL search dropdown
        function addActions(containerGet) {
            var container = containerGet();
            var dropdrown = containerGet('dropdown');
            //save picklist search 
            function search(){
                this.setSelected().closePLSearch();
            }
        
            //cancel picklist search
            function cancel() {
                this.clear().enableSearch()
                    .closePLSearch().focusSearch();
            }
            
            var actions = {
                search:search,
                cancel:cancel
            };

            var PLActions = getPLActionMethod(container);
            
            //action mapper
            function actionCaller(){
                let action = actions[this.dataset.action];
                action && action.call(PLActions);
            }
            
            removeInitWatcher(container); // Remove previous event if exist
            var clearPLSearch = ()=>PLActions.clear(true).enableSearch();
            
            //actions for save and cancel btn
            jQuery(dropdrown).on('click'+eventNameSpace,'[data-action]',actionCaller);
            jQuery(container).on('click'+eventNameSpace,'[data-action]',actionCaller);
            jQuery(container).on('clearPLSearch'+eventNameSpace,clearPLSearch);
        }

        //To get PL select2 options
        function getSelect2Options(config,isStaticSelect2){
            var getDefaultField = ()=>config.url.split('/').pop();
            var options = { //No I18N
                allowClear: false,
                multiple: true,
                closeOnSelect: false,
                maximumSelectionSize:5,
                placeholder: translate('search.prefix',[config.fieldText]),	//No I18N
                createSearchChoicePosition: "bottom",	//No I18N
                tags: true,
                url: [{
                    url: config.url,	//No I18N
                    field: config.field || getDefaultField(),	//No I18N
                    list_info: {
                        start_index: 1,
                        sort_field: "name",	//No I18N
                        row_count: 100
                    },
                }],
                formatSelection: (item)=> e_html(item.email_id || item.name || item.text),
                formatResult: function(item) {
                    if(item.email_id) {
                        return e_html(item.name) + " &lt;" + e_html(item.email_id) + "&gt;";	// No I18N
                    } else {
                        return e_html(item.name || item.text);
                    }
                }
            };
            isStaticSelect2 && (delete options.url);
            return options;
        }
        //To init select2 with api
        function initApiSelect2(containerGet) {
            var select2Input = containerGet('select2Input');
            var container = containerGet();
            var field = getFieldData(container) || {};

            var fieldKey = field.field_key;
            var config = {
                field:fieldKey,
                url:'/api/v3'+field.href,
            }

            config.fieldText = field.text;
            var options = getSelect2Options(config);
            //To update select2 options custom event trigger
            trigger(container,'updateInlinePLSelect2Options',[field,options]);

            jQuery(select2Input).sdp_select2(options);
            var select2 = jQuery(select2Input).data('select2');
            return select2;
        }
    
        
    //------ 

        //Render search icon to each search input right side
        function renderFilterIcon(container) {
            var searchIconTemplate = getSearchIconTemplate();
            var wrapSpan=(searchbox)=>jQuery(searchbox).wrap('<span class="pl-searchbox-wrapper disp-g"></span>');
            var searchBox = container.querySelector('input.default-inline-search');
            const searchClearTemplate = `<span class="block-bordered block-highlighted m5 p3 minw-10px vmiddle pl-search-container hide">
                                                <span class="text-overflow disp-ib vmiddle pl-search-text pl5">
                                                </span>
                                                <button type="button" class="btn btn-link p0 flat" data-action="cancel" title="${e_attr(translate('sdp.common.clear'))}" rel="uitip">
                                                    <span class="cspr icon-md close-red-bg vmiddle mt-2"></span>
                                                </button>
                                            </span>`;
    
            var addContainerClass =() => container.classList.add('inline-pl-search-enabled');
            var addFilterBtn =()=>container.append(searchIconTemplate);
            const addClearBtn =()=>searchBox.parentElement.append(SDPTemplate(searchClearTemplate).get());
            
            removePLSearchContiner(container); // remove search container if already exist
            wrapSpan(searchBox);//wrap span to inline search box
            addClearBtn();
            addFilterBtn();
            addContainerClass();
        }
        
        //Remove PL search icon and dropdown from container 
        function removePLSearchContiner(container) {
            removeSearchEvent(container);
            jQuery('.inline-pl-search',config.holder).select2('destroy');
            jQuery(container).find('.adv-search-wrapper').remove();
        }

        //To remove search icon click event
        function removeSearchEvent(container) {
            jQuery(container).off('click'+eventNameSpace);
        }
    
        
        //remove search button click watcher
        function removeInitWatcher(container) {
            container.querySelector('button.init-pl-search').classList.remove('init-pl-search');
            jQuery(container).off(eventNameSpace);
        }

    
        //custom event trigger
        //@param container - HTMLElement - container element to trigger event
        //@param eventName - String - event name 
        //@param data  - Array = data to send  as param
        function trigger(container,eventName,data) {
            jQuery(container).trigger(eventName,data);
        }
    
    
        //Fliter icon - click action call to Init PL search dropdown and sdp-select2 
        function initInlinePLSearch(evt) {
            evt.preventDefault();
            var getContainer = (input)=>input.closest('div.inline-pl-search-enabled');
            var container = getContainer(this);
            var isPickListNotRendered =(container)=>container.isPlRendered != true;
            
            isPickListNotRendered(container) && renderPickListSearch(container);
        }
    
        //Check is valid PL field to render search icon
        function isValid(container) {
            var field = container.field || getFieldData(container) || {};
            var init = false;
            var isPicklist = ()=>(field.display_type === 'Pick List') && (init=true);
            var skipPLSearch = ()=>init = false;
            var emmitInitPLEvent =()=> trigger(container,'initInlinePLSearch',[field,skipPLSearch]);
            
            isPicklist() && emmitInitPLEvent();
            
            return init;
        }
    
        //To get field data
        function getFieldData(container) {
            var getInput = container.searchInput ||(()=>container.querySelector('input')) ||{};
            var field = container.field || getInput().field || null;
            field && (container.field = field);
            return field;
        }
    
        //To destroy the component
        function destroy() {
            function doRemove(searchInput){
                var container = searchInput.parentElement;
                //To remove serch icon, dropdown and events
                removePLSearchContiner(container);
            }
            config.getContainer('select2Input').forEach(doRemove);
        }
    
        //Validate and render search icons to each valid search input
        function doRenderPLSearchBoxProcess(config) {
            function initSearch(searchInput) {
                var getContainer = ()=>searchInput.closest('div.d_w');
                var container = getContainer();

                isValid(container) && renderFilterIcon(container);
            }
            
            var searchInputs = config.getContainer('searchInput');
            searchInputs.forEach(initSearch);
            initSearchboxTooltip(); // to init tooltip for filter icon and search box text
        }

        //search icon click to render search dropdown and sdp-select2
        function addFilterIconClickWatcher() {
            var searchRow = config.getContainer();
            jQuery(searchRow).on('mousedown'+eventNameSpace,'button.init-pl-search',initInlinePLSearch);
        }
    
        // init component
        function init(config) {
            //render search icon to each valid input box
            doRenderPLSearchBoxProcess(config);
    
            //add search icon click event to render PL dropdown 
            addFilterIconClickWatcher();
            //public API method to expose
            var publicAPI = {
                destroy:destroy
            } 
        
            return publicAPI;
        }
    
        return init(config);
    }

    //To add PL search criteria methods to table component
    function addPLSearchCriteriaMethods(tableInstance) {
        var methods = {
            //To form existing search criteria with pl search criteria in array [existingSCObject,PLSCObject]
            addInlinePLSearchCriteria:function(search_criteria){
                var _self = this;
                var plSearchCriteria = _self.plSearchCriteria;
                if(plSearchCriteria) {
                    if(Array.isArray(search_criteria)) {
                        //search_criteria already having array so add our pl search criteria,
                        search_criteria = search_criteria.concat(plSearchCriteria);
                    } else if(!jQuery.isEmptyObject(search_criteria)){
                        // adding PL sc with the search criteria object children array or create new one
                        !search_criteria.children && (search_criteria.children = []);
                        if(search_criteria.children) {
                            search_criteria.children = search_criteria.children.concat(plSearchCriteria);
                        }
                    } else {
                        search_criteria = Object.assign({},plSearchCriteria); // to avoid object reference, cloning
                    }
                }
                return search_criteria;
            },
            //To clear PL Search Criteria object in table instance _self
            clearInlinePLSearchCriteria:function(){
                var _self = this;
                delete _self.plSearchCriteria;
                plSearchCriteria = {}; // clear the selected item, which are added in PLSearchChange on change event
                //search box - To clear the value and remove disabled
                jQuery('tr.searchRow > td div.inline-pl-search-enabled',tableInstance.tblContainer).trigger('clearPLSearch');
            }
        };
        var addMethods = (methodName)=>tableInstance[methodName]=methods[methodName];
        Object.keys(methods).forEach(addMethods);
    }
    


    //To get Criteria form fieldName and value
    function getCriteria(fieldName,value,update) {
        var criteria = {
            field:fieldName,
            logical_operator:'and'
        }
        var isArrayValue = Array.isArray(value);
        
        isArrayValue ? criteria.values = value : criteria.value = value;
        criteria.condition = isArrayValue ?  'eq' : 'contains';
    
        criteria = update ? update(criteria) : criteria;
        criteria = value ? criteria : null;
        return criteria;
    }

	//Add PL search change event
	function addPLSearchChangeEvent() {
		//consolidate all search criteria to one criteria with children 
		function getPLSearchCriteria() {
			var criteria;
            function createSearchCriteria(field,index){
				var criteriaObj = plSearchCriteria[field];
                !criteria && (criteria = Object.assign({},criteriaObj)); //assign first search criteria
                (index > 0 && !criteria.children) && (criteria.children = []); // creation of children to search criteria
                index > 0 && criteria.children.push(criteriaObj); //add children search criteria
			}

			Object.keys(plSearchCriteria).forEach(createSearchCriteria);

			return criteria;
		}

        function PLSearchChange(e,field,searchData) {
			var values = searchData && searchData.map((data)=>data.id) || [];
			var fieldName = field.nonApiHref ? field.id : field.id+'.id';
			var criteria = values.length && getCriteria(fieldName,values) || null;
			
			criteria ? plSearchCriteria[fieldName] = criteria : delete plSearchCriteria[fieldName];

            tableInstance.plSearchCriteria = getPLSearchCriteria();
			tableInstance.changeFilterString('Enter'); //Enter - to search the inline search
		}

		jQuery(tableInstance).off('.tbl-pl-search')
		.on('PLSearchChange.tbl-pl-search',PLSearchChange);
	}

	//add PL search to search row
	function initPLSearch(searchRow) {
        var PLInstance;
		var config = {
			getContainer:function(type) {
				var element;
				if(type == 'searchInput'){
					element = searchRow.querySelectorAll("td.tableHeader > div.d_w  input.default-inline-search");
				} else {
					element = searchRow;
				}
				return element;
			},
			getTableInstance:function(){
				return _self;
			}
		};
		//add inline PL search 
		PLInstance = createPLSearch(config);
        //adding change event to set search criteria to table
        addPLSearchChangeEvent();
        searchRow.plSearchInitialized = PLInstance;
	}

    /*   
        //To skip PL search field for perticular field eg site or group
        // example code to show how to skip the on pl search and update select2 config
		function doSkipPLSearch(e,field,skipPLSearch){
			var skipSearchList = ['Site','Group'];
			skipSearchList.includes(field.display_name) && skipPLSearch();
		}
	
		//To update PL select2 options
		function updatePLSelect2Options(e,fields,options) {
			console.log(fields,options);
		}
	
		//Add PL search Events for init PL and select2 option update 
		function addEventBindings(container) {
			jQuery(container).off('.requestSearch')
				.on('initInlinePLSearch.requestSearch',doSkipPLSearch) //event for, to skip search for any field
				.on('updateInlinePLSelect2Options.requestSearch',updatePLSelect2Options);// event for, to update the PL select2 options
		}

         //add event binding to Search Row
        //To update search field type and skip the pl search for any field
        //This event should be added before calling of createPLSearch
		addEventBindings(tableInstance.tblContainer);
     */


    //on toggle search row will call    
    function searchToggle(e,isOpen) {
        var searchRow = e.target;
        !searchRow.plSearchInitialized && isOpen && initPLSearch(searchRow);
    }

    //watcher to monitor search row open to init PL search
	function addSearchInitWatcher() {
		_self.tblContainer.on('searchRowToggle.inline-search',searchToggle);
        //add PL search criteria methods to table instance
        addPLSearchCriteriaMethods(tableInstance);
	}
	
	isPLSearchEnabled() && addSearchInitWatcher();
}




