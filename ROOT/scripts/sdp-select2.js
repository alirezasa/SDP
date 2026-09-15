/* Select2 with api lazy loading Starts======= */
(function($) {
    // select2 3.5.1 version edge browser auto fill issue fix - 10590425 - SD-125108
   // while autofill call all select2 open due to `input` event trigger for all select2 input fields
   function edgeAutoFillFix() {
      var isEdge =()=> navigator.userAgent.indexOf('Edg') > -1;
      if (!window.Select2 && !isEdge()) {
        //skip if select2 is not loaded
        return;
      }

      //get the original initContainer function from select2
      const initContainer = window.Select2.class.single.prototype.initContainer;
      const initContainerMulti = window.Select2.class.multi.prototype.initContainer;

      //initialize the container with the original function
      const initContainerCall = (_self, initContainer) => initContainer.apply(_self);
      const removeEvent = ($elem, eventNames) =>eventNames.forEach((eventName)=>$elem.off(eventName)) ;
      const emptyEvent = (evt)=>evt.key === undefined;
      const mapValidEvent = function (evt,eventHandler) {
        if (!emptyEvent(evt)) {
          //if event not come from auto fill, so we can call it safely
          eventHandler(evt);
        }
     }

      const getExistingEvent = ($element, eventName) => {
        if ($element) {
           const existingHandlers = jQ._data($element.get(0), 'events')[eventName];
           return existingHandlers ? existingHandlers[0].handler : null;
        }
      }

      if (initContainer && initContainerMulti) {
        //add the custom logic to the initContainer function for single select
        window.Select2.class.single.prototype.initContainer = function () {
          initContainerCall(this, initContainer);
          const keyupHandler = getExistingEvent(this.focusser, 'keyup');
          removeEvent(this.focusser, ['input','keyup']);

          this.focusser.on('keyup',(evt)=>mapValidEvent(evt,keyupHandler));
        }

        //add the custom logic to the initContainer function for multi select
        window.Select2.class.multi.prototype.initContainer = function () {
          initContainerCall(this, initContainerMulti);
          const keydownHandler = getExistingEvent(this.search, 'keydown');
          removeEvent(this.search, ['keydown','input']);

          this.search.on('keydown', (evt)=>mapValidEvent(evt,keydownHandler));
        }
      }
   }
   edgeAutoFillFix();

  $.fn.sdp_select2 = function(options) {
    var def_options = {
      closeOnSelect: true,
      multiple: false,
      nextSearchTerm: true,
      cache: {},
      sort: true,
      more: false,
      search_field: "name",
      createSearchChoice: function(term, data) {
        //Used while creating tags this used when we are providing tag options
        var patt = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (data.length == 0 && patt.test(term)) {
          return {
            id: term,
            text: term
          };
        }
      },
      placeholder: translate("sdp.change.sla.select"), //No i18n
      list_info: {
        start_index: 1,
        sort_field: "name",
        row_count: 20
      }, //No i18n
      processResults: function(search_data, data, field) { // default process result
        var key = options.key || "text";
        var name = ""; //No i18n
        if (options.value_path) {
          if (options.value_path.indexOf('.') != -1) {
            name = table_comp.getFieldsRequiredByString(data, options.value_path);
          } else {
            name = data[options.value_path];
          }
        }
        if (!name) {
          name = data.name || data.display_name || data.text || data.value || data[field];
        }

        /** for some fields like id will not be available, only name is present */
        var processedResult = {
          id: data.id || name
        };
        processedResult[key] = name;
        search_data.push(processedResult);
      },
      processRemoteData: function(data, _self) { //( without search terms ) 
        //This is used to store and return the Processed remote data( without search terms ) so it will saved in cache and Callback to caller to customize the text
        var search_data = [];
        var cache = _self.settings.cache;
        var field = _self.field;
        if (typeof _self.url_options.processResults == "undefined") {
          _self.url_options.processResults = _self.settings.processResults;
        }
        if (typeof cache[field] == "undefined") {
          cache[field] = {};
          cache[field][field] = [];
          var defaultOptions = _self.settings.default_option;
          if(defaultOptions){
            /**
             * We have provided an option to load multiple default option.
             */
            if(defaultOptions.length){
              cache[field][field] = cache[field][field].concat(defaultOptions);
              search_data = search_data.concat(defaultOptions);
            }else{
              cache[field][field].push(defaultOptions);
              search_data.push(defaultOptions);
            }
          }
          cache[field].has_more_rows = true;
          // Store in global variable for multiple fields
          if (_self.settings.globalCache) {
            window.select2Cache = window.select2Cache || {};
            window.select2Cache[field] = cache[field];
          }
        }
        //If no data is present, we can add None value using this callback
        if (!data[field].length && options.addNoneOption) {
          data[field] = options.addNoneOption(field) || [];
        }
        for (var i = 0; i < data[field].length; i++) {
          if (typeof options.filterRemoteData === "function") {
            if (!options.filterRemoteData(data[field][i])) {
              continue;
            }
          }
          _self.url_options.processResults(cache[field][field], data[field][i], field, _self, data[field]);
        }
        if (data.list_info) {
          cache[field].has_more_rows = data.list_info.has_more_rows;
          cache[field].start_index = parseInt(data.list_info.start_index || 1) + parseInt(data.list_info.row_count);
        } else {
          cache[field].has_more_rows = false;
        }
        for (var i = 0; i < data[field].length; i++) {
          if (typeof options.filterRemoteData === "function") {
            if (!options.filterRemoteData(data[field][i])) {
              continue;
            }
          }
          _self.url_options.processResults(search_data, data[field][i], field, _self, data[field]);
        }
        return search_data;
      },
      processSearchData: function(data, _self) {
        //This is used to call when select is used with search terms 
        var search_data = [];
        if (typeof _self.url_options.processResults == "undefined") {
          _self.url_options.processResults = _self.settings.processResults;
        }
        for (var i = 0; i < data[_self.field].length; i++) {
          _self.url_options.processResults(search_data, data[_self.field][i], _self.field, _self, data[_self.field]);
        }
        return search_data;
      }
    };
    var cacheTemp = options.cache || {};
    options = jQuery.extend(true, {}, def_options, options);
    options.cache = cacheTemp;
    var field=options.field || options.url[0].field;
    if (options.globalCache && window.select2Cache && window.select2Cache[field]) {
      options.cache[field] = window.select2Cache[field];
    }
    var input_data = {
      multiple: options.multiple,
      closeOnSelect: options.closeOnSelect,
      placeholder: options.placeholder,
      formatNoMatches: function() {
        return translate('ae.select2.no.message');
      }, //NO i18N
      ajax: {
        url: options.url[0].url,
        transport: function(ajaxOptions, a, b, c) {
          /*
          This is to configure the call and process the data 
          This will trigger at two places while opening and onscroll
          */
          var settings = ajaxOptions.data.options;
          var url = ajaxOptions.data.options.url;
          var search_data = [];
          settings.more = false;
          var async = false;
          for (var i = 0; i < url.length; i++) {
            var url_options = url[i];
            var info = jQuery.extend(true, {}, url_options.list_info || settings.list_info);
            info.start_index = 1;
            if (settings.cache[url_options.field]) {
              info.start_index = settings.cache[url_options.field].start_index;
            }
            if (ajaxOptions.data.term.trim().length) {
              if (url_options.isOPAPI) {
                info.search_fields = info.search_fields || {};
                info.search_fields[url_options.search_field || "name"] = ajaxOptions.data.term;
              } else {
                var search_criteria = info.search_criteria || [];
                if (url_options.search_keys && url_options.search_keys.length > 0) {
                  for (var j = 0, jlen = url_options.search_keys.length; j < jlen; j++) {
                    search_criteria.push({
                      field: url_options.search_keys[j],
                      condition: 'like',
                      values: [ajaxOptions.data.term],
                      logical_operator: "or"
                    });
                  }
                } else if (typeof settings.criteriaCallback == "function") {
                  search_criteria = settings.criteriaCallback(ajaxOptions.data.term);
                } else {
                  search_criteria.push({
                    field: url_options.search_field || "name",
                    condition: 'like',
                    values: [ajaxOptions.data.term],
                    logical_operator: "and"
                  });
                }
                info.search_criteria = search_criteria;
              }
              info.start_index = 1
              info.row_count = 100;
            }
            settings.current_url = url_options;
            /** when list_info.has_more_rows is false or list_info itself is set to false, more values won't be fetched */
            if (settings.cache[url_options.field] && (settings.cache[url_options.field].has_more_rows == false || url_options.list_info === false) && ajaxOptions.data.term.trim().length == 0 && ajaxOptions.data.page == 1) {
              // search_data = search_data.concat(settings.cache[url_options.field][url_options.field]);
              search_data = search_data.concat(settings.processSearchData(settings.cache[url_options.field], {
                url_options: url_options,
                settings: settings,
                term: ajaxOptions.data.term,
                page: ajaxOptions.data.page,
                field: url_options.field
              }));
              continue;
            }
            if (info.search_criteria) {
              /**
               * If prototype exists, we use "toArray()" method.
               */
              info.search_criteria = (info.search_criteria.toArray) ? info.search_criteria.toArray() : JSON.parse(sdpToJSON(info.search_criteria));  
            }
            var input_data = {};
            if (url_options.list_info !== false) {
              input_data.list_info = info;
            }
            if (url_options.input_fields) {
              for (var key in url_options.input_fields) {
                input_data[key] = url_options.input_fields[key];
              }
            }
            if (options.include_inactive_value) {
              input_data.include_inactive_value = options.include_inactive_value;
            }
            if (options["for"]) { //NO i18N
              input_data["for"] = options["for"]; //NO i18N
            }

            //input data call back from formcomponent field 
            if (typeof url_options.input_data_Callback == "function") {
              input_data = url_options.input_data_Callback(url_options, input_data, ajaxOptions.data.term);
            }
            var headerAccept = {
              Accept: "*/*"
            };
            if (url_options.headers) {
              headerAccept = url_options.headers;
            }
            // option for modifying the inputdata before api call
            if (typeof options.searchInputDataCallback === "function") {
              input_data = options.searchInputDataCallback(input_data);
            }
            async = url_options.async ? url_options.async : false;//Check ajax is async true or false
            sdpAjax({
              url: url_options.url,
              async: async,
              cache: false,
              headers: headerAccept, //No I18N
              data: {
                input_data: sdpToJSON(input_data)
              },
              context: {
                url_options: url_options,
                settings: settings,
                term: ajaxOptions.data.term,
                page: ajaxOptions.data.page,
                field: url_options.field
              },
              complete:(ajaxRes)=>url_options.complete && url_options.complete(ajaxRes),
              success: function(data, str, jqxhr, $this) {
                if ($this.term.length == 0) {
                  var previous_data = settings.cache[url_options.field];
                  if ($this.page == 1 && previous_data && previous_data[url_options.field] && previous_data[url_options.field].length) {
                    search_data = search_data.concat(previous_data[url_options.field]);
                  }
                  search_data = search_data.concat(settings.processRemoteData(data, $this));
                  settings.more = settings.more || (data.list_info ? data.list_info.has_more_rows : false);
                  var field_data = {};
                  field_data[url_options.field] = search_data;
                  search_data = settings.processSearchData(field_data, $this);
                } else {
                  search_data = search_data.concat(settings.processSearchData(data, $this));
                }
                if(async) {//async: true,  --> After fetching data pass response to component
                  ajaxOptions.success(search_data);
                }
              }
            });
          }
          if(!async) {
            ajaxOptions.success(search_data);
          }
        },
        quietMillis: 200,
        nextSearchTerm: function displayCurrentValue(selectedObject, currentSearchTerm) {
          return currentSearchTerm;
        },
        dataType: 'json', //NO I18N
        data: function(term, page) {
          if (options.url[0].field.indexOf("udf_pickref_") != -1 || options.localsearch) {
            options.cache = options.cache || {};
            options.localsearch = true;
          }
          var params = {
            term: term,
            options: options,
            page: page
          };
          return params;
        },
        results: function(search_data, page, params) {
          var settings = this.data();
          var more = settings.options.more;
          var field = settings.options.url[0].field;
          if (typeof settings.term !== "undefined" && settings.term.length == 0) {
            more = false;
          }
          if (field.indexOf("udf_pickref_") != -1 || settings.options.localsearch) {
            if (params.term.trim().length) {
              if (params.term !== "") {
                var temp_search_data = search_data;
                search_data = [];
                for (var i = 0; i < temp_search_data.length; i++) {
                  if (temp_search_data[i].name.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
                    search_data.push(temp_search_data[i]);
                  }
                }
              }
            }
            if (typeof settings.options.cache[field] == "undefined") {
              settings.options.cache[field] = {};
              settings.options.cache[field][field] = search_data;
              settings.options.cache[field].has_more_rows = true;
            }
            more = false;
          }
          return {
            results: search_data,
            more: more
          };
        }
      }
    };
    input_data.maximumSelectionSize = options.maximumSelectionSize;
    if (options.formatSelectionTooBig) {
      input_data.formatSelectionTooBig = options.formatSelectionTooBig;
    }
    if (options.tags) {
      if (options.multiple) {
        input_data.tags = [];
        input_data.tokenSeparators = [",",";"];//108609 -- include 'semicolon' to add dynamic data in component
      }
      input_data.createSearchChoice = options.createSearchChoice;
      input_data.createSearchChoicePosition = options.createSearchChoicePosition || "bottom"; //No I18N
    }
    if (options.formatResult) {
      input_data.formatResult = options.formatResult;
    }
    if (options.formatSelection) {
      input_data.formatSelection = options.formatSelection;
    }
    if (options.formatNoRecordsFound) {
      input_data.formatNoRecordsFound = options.formatNoRecordsFound;
    }
    if (options.formatNoMatches) {
      input_data.formatNoMatches = options.formatNoMatches;
    }
    if (options.formatSearching) {
      input_data.formatSearching = options.formatSearching;
    }
    if (options.width) {
      input_data.width = options.width;
    }
    if (options.allowClear) {
      input_data.allowClear = options.allowClear;
    }
    if (options.minimumResultsForSearch) {
      input_data.minimumResultsForSearch = options.minimumResultsForSearch;
    }
    if (options.minimumInputLength) {
      input_data.minimumInputLength = options.minimumInputLength;
      input_data.formatInputTooShort = function() {
        return translate("sdp.common.header.searchvaluemsg"); //no i18n
      }
    }
    if (options.dropdownCssClass) {
      input_data.dropdownCssClass = options.dropdownCssClass;
    }
    
    //Added for, to support reply email drag and drop 
    if(options.formatSelectionCssClass){
      input_data.formatSelectionCssClass=options.formatSelectionCssClass;
    }
    
    if(options.separator) {//107654 -- Change separator for multi select field
      input_data.separator = options.separator;
    }
    if (options.separator) {
      input_data.separator = options.separator;
    }

   //SD-119907 - On giving comma the entered user name disappears issue fix
   input_data.tokenizer = function defaultTokenizer(input, selection, selectCallback, opts) {
        var original = input, // store the original so we can compare and know if we need to tell the search to update its text
            dupe = false, // check for whether a token we extracted represents a duplicate selected choice
            token, // token
            index, // position at which the separator was found
            i, l, // looping variables
            separator; // the matched separator
        var allTokens = [];


        /**
         * Compares equality of a and b
         * @param a
         * @param b
         */
        function equal(a, b) {
            if (a === b) return true;
            if (a === undefined || b === undefined) return false;
            if (a === null || b === null) return false;
            // Check whether 'a' or 'b' is a string (primitive or object).
            // The concatenation of an empty string (+'') converts its argument to a string's primitive.
            if (a.constructor === String) return a+'' === b+''; // a+'' - in case 'a' is a String object
            if (b.constructor === String) return b+'' === a+''; // b+'' - in case 'b' is a String object
            return false;
        }

        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

        while (true) {
            index = -1;
            for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
                separator = opts.tokenSeparators[i];
                index = input.indexOf(separator);
                if (index >= 0) break;
            }

            if (index < 0) break; // did not find any token separator in the input string, bail

            token = input.substring(0, index);
            input = input.substring(index + separator.length);

            if (token.length > 0) {
                token =  opts.createSearchChoice.call(this, token, selection);
                allTokens.push(token);
                const isMaxSelection = ()=>opts.maximumSelectionSize && this.val().length >= opts.maximumSelectionSize;
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
                    dupe = false;
                    for (i = 0, l = selection.length; i < l; i++) {
                        if (equal(opts.id(token), opts.id(selection[i]))) {
                            dupe = true; break;
                        }
                    }

                    if (!dupe && !isMaxSelection()) selectCallback(token);
                }
            }
        }

        var hasValidChoice = allTokens.some((item)=>item != undefined);
        if(!hasValidChoice) return;// it will continue search, if all tokens are invalid
        

        if (original!==input) return input;
    }
   // fix end 
   
    this.select2("destroy"); //no i18n
    this.select2(input_data);
    var _self = this;
    //deleting cache for the field while resetting
    options.reset = function() {
      var eleObj = _self.data("sdp_select2");
      var entity_urls = eleObj.url || [];
      for (var i = 0; i < entity_urls.length; i++) {
        delete eleObj.cache[entity_urls[i].field];
      }

    }
    this.data("sdp_select2", options);
    if (options.value) {
      this.select2("data", options.value); //no i18n
    }
  };

}(jQuery));
/* Select2 with api lazy loading Ends======= */



/** Start - Select2 custom cutom option for tabs ui and add new button **/
(function ( $, window, document, undefined ) {
  /*****
   * Render select2 component with tabs and add button UI when select2 in open stage
   * We can use sdp_select2 option and function
   * options
   *  {
    * "tabs": {
      "list": [{"id":"users","display_name":"Users"},{"id":"technicians","display_name":"Technicians"}],
      "meta": {
        "users": {
          "url": [{
            "url": "/api/v3/users",
            "field": "users",
            "list_info": {}
          }],
          (or)
          "allowed_values": [{"id":"users","text":"Users"}]
        }
        }
      "active_tab": {"id":"users","display_name":"Users"},
    }
    * "button": {
      "icon": "",
      "display_name": "",
      "meta": {
        "url": [{
          "url": "/api/v3/users",
          "field": "users",
          "list_info": {}
        }],
        (or)
        "allowed_values": [{"id":"users","text":"Users"}]
      }
      "callbackfn": function(){}
    }
    * "pos": "top|bottom",
    * "element": "",
   *  }
   * 
   * 
  *****/
  var pluginName = "custom_select2",
        defaults = {
      "tabs": {},
      "button": {},
      "element": "",
      "closeOnSelect": false,
      "multiple": false,
      "dropdownCssClass": "custabs",
    };
        function Plugin( element, options ) {
          this.element = element;

          this.options = jQuery.extend( {}, defaults, options) ;

          this._defaults = defaults;
          this._name = pluginName;

          this.init();
      }

      Plugin.prototype = {
        init :function(opt,_self) {
        var _self = this;
        var s_opt = this.options;
        if(!jQuery.isEmptyObject(s_opt.tabs)) {
          /** Tabs UI option configured **/
          var tabs = s_opt.tabs;
          this.config(tabs.meta[tabs.active_tab.id]);
        }
        if(!jQuery.isEmptyObject(s_opt.button)) {
          /** Button option configured **/
          this.config(s_opt.button.meta);
        }
        jQuery(s_opt.element).off("select2-open.sdp-select")
        .on("select2-open.sdp-select",function() {
          var dropdown = jQuery(_self.options.element).select2("dropdown");
          dropdown.find(".action-tabs").remove();
          if(!s_opt.pos || s_opt.pos == "top") {
            dropdown.prepend(_self.tabUIhtml());
          } else if(s_opt.pos == "bottom") {
            dropdown.append(_self.tabUIhtml());
          }
          _self.action();
          initTooltip(".action-tabs");
        });
      },



      switchtabs: function(id) {
        /** Tabs switch event 
         * Destroy select2 component and reinitalize 
         *  **/
        var data = this.get(this.options.element);
        jQuery(this.options.element).select2("destroy");
        var tabs = this.options.tabs.list;
        for(var i=0; i<tabs.length; i++) {
          if(tabs[i].id === id) {
            this.options.tabs.active_tab = tabs[i];
          }
        }
        this.init(this.options.element, this.options);
        jQuery(this.options.element).select2("data",data);
        jQuery(this.options.element).select2("open");
      },
      btnclick: function() {
        /** Button click event 
         * callbackfn is mandatory for this case
         *  **/
        if(typeof this.options.button.callbackfn === "string") {
          execFuncByName(this.options.button.callbackfn, window, this.options);
        } else {
          this.options.button.callbackfn(this.options);
        }
      },
      tabUIhtml: function() {
          /** After select2 component configured add tabs and button UI
           * 
           * **/
          var opt = this.options;
          var tabsli = [];
          var listTabs = '';
          if(!jQuery.isEmptyObject(opt.tabs)) {
            var tabs = opt.tabs.list;
            var tabswidth = 100 / tabs.length;
            for(var i=0; i<tabs.length; i++) {
              var active = tabs[i].id == opt.tabs.active_tab.id ? "active" : "";
              var liElement = jQuery('<li>',{
                class:"tc text-nowrap "+active,
                css:{width:tabswidth+'%'},
                id:tabs[i].id+'_li'
              });
              var anchorElem = jQuery('<a>',{
                class:'update_tab text-overflow disp-ib',
                attr:{rel:'uitip',mode_ellipsis:'true',title:tabs[i].display_name,id:tabs[i].id,tabtype:tabs[i].id},
                href:'#',
                text:tabs[i].display_name,
              });

              liElement.append(anchorElem);
              tabsli.push(liElement);
          
            }
            var posspace = (!opt.pos || opt.pos == "top") ? "mb10" : "mt10 hr-light"
            var ulElement = jQuery('<ul>',{ class:'nav nav-sdtabs'}).append(tabsli);

            listTabs = jQuery('<div>',{
              class:'sdtabs-ui2 '+posspace+' action-tabs',
              attr:{'action-tabs':''}
            }).append(ulElement);
          }
          if(!jQuery.isEmptyObject(opt.button)) {
            var icon = !opt.button.icon ? "common-sprite icon-xs common-add-icon4" : opt.button.icon;
              var anchorElem = jQuery('<a>',{
                class:'btn btn-default btn-xs p10 noborder tl fw',
                href:'#',
                text:opt.button.display_name,
              }).append('<span>',{ class:icon+' mr5'});

              listTabs =  jQuery('<div>',{ class:'select2-filter-option p0 action-tabs oyh oxh'}).append(anchorElem);     
          }

          return  listTabs;
        },
        config: function(opt) {
          if(opt.url) { //Render data from API
          this.options = jQuery.extend(true, this.options, opt);
          jQuery(this.options.element).sdp_select2(this.options);
        }
        if(opt.allowed_values) { //Render data from allowed values
          this.options["data"] = opt.allowed_values;
          jQuery(this.options.element).select2(this.options);
        }
        },
      action: function() {
        var _self = this;
        var s_opt = this.options;
        var dropdown = jQuery(_self.options.element).select2("dropdown");
        if(!jQuery.isEmptyObject(s_opt.tabs)) {
          dropdown.off('.select2-tabs-actions').on("click.select2-tabs-actions",".sdtabs-ui2.action-tabs li a", function() {
            _self.switchtabs(this.id);
          });
        }
        if(!jQuery.isEmptyObject(s_opt.button)) {
          dropdown.off('.select2-tabs-actions').on("click.select2-tabs-actions",".action-tabs a", function() {
            _self.btnclick();
          });
        }
      },
      get: function(ele) {
        /** Get select2 data values **/
        return jQuery(ele).select2("data");
      }
      };

      jQuery.fn[pluginName] = function ( options ) {
          return this.each(function () {
              if (!jQuery.data(this, "plugin_" + pluginName)) {
                  jQuery.data(this, "plugin_" + pluginName,
                  new Plugin( this, options ));
              }
          });
      };
})( jQuery, window, document );
/** End - Select2 custom cutom option for tabs ui and add new button **/

// select2 hierarchy tree start-----------
 var hierarchySelect2 = (function(){
  'use strict';
  var cache = {};

  var hierarchySelect2Intance = {
    //allow URL only if it contains one of these keys
    allowedUrl: [ "contracts", "purchase_orders", "asset", "product_type", "consumable", "cmdb", "ci_types", "sub_module", "integration_sync_rules", "ci_sync_rules", "configuration_items"],//No I18N
    constructChildData: function (data) {
        var map = {};
        for(var i = 0; i < data.length; i++){
            map[data[i]["name"]] = data[i];
        }
        var child = new Set();
        var addChildrenItem = (item,data)=>{
          !item.children && (item.children =[]); // create empty array if not have children
          item.children.push(data);
          child.add(data.name); // add child name
        }

        for(var entity in map) {
            let currEntity = map[entity];
            let currParentData = currEntity['parent'];
            let currentParentName = currParentData && currParentData.name || null;
            let mapParentItem = map[currentParentName];
            let parentItem = currParentData && mapParentItem;

            parentItem && addChildrenItem(mapParentItem,currEntity); // add children item

        }
        var toReturn  = [];
        for(var entity in map){
            if(!child.has(entity)){
                toReturn.push(map[entity]);
            }
        }
        return toReturn;
    },
    fetchAllApiData: function (options) {
        var apiURL = options.url;
        var entity = options.entity;
        var data = [];
        var inputData = options.inputData;
        var inputData = options.inputData || {
            list_info: { "start_index": 1, "row_count": 100 }//No I18N
        };
        var maxRecordCount = 500; // max fetch row count
        // var isAllProductURL = ()=>options.url.indexOf('all_product_types')>0;
        const listInfo = options.inputData.list_info;
        if(listInfo.fields_required && listInfo.fields_required.includes('display_name')) {
            inputData.list_info = jQuery.extend({ "sort_field": "display_name", "sort_order": "asc" }, listInfo); //No I18N
        }
        function getData() {
            return sdpAjax({
                url:apiURL,
                data: sdpAjaxInputData(inputData)
            });
        }
        function fetchAllData(resolve) {
            getData().then(function (response) {

                //if start_index not given default 1 will be considered
                inputData.list_info.start_index = inputData.list_info.start_index || 1;

                inputData.list_info.start_index += 100;
                data = data.concat(response[entity]);
                //restrict by has more record and its less than max record fetch
                if (response.list_info.has_more_rows && inputData.list_info.start_index < maxRecordCount) {
                    fetchAllData(resolve);
                } else {
                    resolve(data);
                }
            });
        }
        return new Promise((resolve, reject) => {
            const isAllowed = hierarchySelect2Intance.allowedUrl.some((key) => options.url.includes(key));
            if(!isAllowed) {
                reject(new Error("hierarchy select2: URL is not allowed"));//No I18N
                return;
            }
            fetchAllData(resolve);
        });
    },
    getChildrenTreeData: function (options) {
        return new Promise(function (resolve) {
          hierarchySelect2Intance.fetchAllApiData(options).then(function(data) {
                data = data.map(function(value) {
                    value.text = value.display_name || value.name;
                    return value;
                });

                var hierarchyData = hierarchySelect2Intance.constructChildData(data);
                if(options.needOriginalData) {
                    return resolve({
                        data: hierarchyData,
                        originalData: data
                    })
                }
                resolve(hierarchyData);
            });
        });
    },
    init : function(options) {
      var element = jQuery("#"+options.id);
      var placeHolder = options.placeHolder || options.placeholder;
      var selectedValue = options.selectedValue;
      var selectedValueByApiName = options.selectedValueByApiName;
      var defaultOption = options.defaultOption;
      var events = options.events;
      var disabled = options.disabled;
      var displayField = options.displayField;
      var cacheKey = options.cacheKey;

      options.needOriginalData = true;

      var listInfo = {"start_index": 1, "row_count": 100,"sort_field":"display_name","sort_order":"asc"};//No I18N
      if(options.list_info){
          listInfo = Object.assign(listInfo, options.list_info);
      }
      options.inputData = options.inputData || {"list_info":listInfo}; //No I18N

      var promise = options.promise || cache[cacheKey] || hierarchySelect2Intance.getChildrenTreeData(options);
      if(cacheKey && !cache[cacheKey]) {
        cache[cacheKey] = promise;
      }

      var initSelect2 = function(data){
        var opt = Object.assign({}, {
          data: data||[],
          placeholder: placeHolder,
          formatResult: function(result) {
            var text =  result.display_name || result.name;
            var className = result.disabledOption ? "disableDiv" : "";//No I18N

            return `<div class="${className}">${e_html(text)}</div>`;
          },
          dropdownCssClass:'s2-hover-ui1 text-wrap',
          formatSelection: function(result) {
            var displayText = displayField ? result.display_name : result.name;
            return e_html(displayText);
          },
          formatNoMatches: translate("ae.select2.no.message")
        }, options);

        element.select2(opt);
        if(!data){
          //disable select2 if initial
          element.select2("enable", false);
        } else {
          //enable select2 after data load
          element.select2("enable", true);
        }
        preventSelecting(element);
      }

      function preventSelecting(element) {
        const dropdown = element.select2("dropdown");//No I18N
        dropdown.addClass("s2-custom-p0");
        var eventNameSpace = '.heirarchy-select2';

        element.off('select2-selecting'+eventNameSpace)
        .on('select2-selecting'+eventNameSpace,function(evt) {
            var item = evt.choice;
            if(item.disabledOption == true) {
                evt.preventDefault();
            }
        });
      }

      initSelect2();

      var renderSelect2 = function(response) {
          var data = response.data;
          var originalData = response.originalData;
          if(selectedValue) {
            selectedValue = originalData.find(obj => obj.id ==  selectedValue.id) || selectedValue;
          }
          if(selectedValueByApiName) {
            selectedValueByApiName = originalData.find(obj => obj.name ==  selectedValueByApiName.name) || selectedValueByApiName;
          }

          // create the option and append to Select2
          if(defaultOption){
            data.unshift(defaultOption);
          }

          delete options.id;

          initSelect2(data);

          if(selectedValue === 0){
              element.select2("data", defaultOption);//No I18N
          } else if(selectedValue && (!Array.isArray(selectedValue) || selectedValue.length > 0)){
              element.select2("data", selectedValue);//No I18N
          }else if(selectedValueByApiName && (!Array.isArray(selectedValueByApiName) || selectedValueByApiName.length > 0)){
              element.select2("data", selectedValueByApiName);//No I18N
          } else if(options.shouldSelectAnAllowedValue && data && data.length > 0) {
              element.select2("data", data[0]);//No I18N
          }

          if(disabled != undefined) {
            element.select2("enable", !disabled); //No I18N
          }

      };
      promise.then(renderSelect2);
      if (options.rules != undefined) {
          var rules = options.rules;
          for(var operation in rules){
              jQuery(element).rules(operation, rules[operation]);
          }
      }
      for (var event in events) {
          element.on(event, events[event]);
      }
      return promise;
    },
    clearCache:function(key){
        if(key){
          delete cache[key];
        } else {
          cache = {}
        }
    },
    disableDisallowedValues: function(values, allowedValues) {
      const ids = {};

      allowedValues.forEach((data) => {
          ids[data.id] = true;
      });

      //remove disabled values which have no children
      function filterChildren(values) {
          if(!Array.isArray(values)) {
              return [];
          }
          return values.filter((option) => {
              let { children } = option;
              if(children) {
                  children = option.children = filterChildren(children);
              }
              return option.id || children && children.length > 0;
          });
      }

      //disable values which are not in allowed values
      function disableCiTypes(allValues) {
          allValues.forEach((option) => {
              if(!ids[option.id]) {
                  // option.id = null;
                  option.disabledOption = true;
                  // option.disabled = true; // by enable this disable gray color showing for children item too.so workaround did
              }
              if(option.children && option.children.length) {
                  disableCiTypes(option.children);
              }
          });
      }

      disableCiTypes(values);

      return filterChildren(values, ids);
    }
  }

  return {
    init:hierarchySelect2Intance.init,
    disableDisallowedValues:hierarchySelect2Intance.disableDisallowedValues,
    getChildrenTreeData:hierarchySelect2Intance.getChildrenTreeData,
    fetchAllApiData:hierarchySelect2Intance.fetchAllApiData,
    clearCache:hierarchySelect2Intance.clearCache,
    constructChildData: hierarchySelect2Intance.constructChildData
  }

}());
// select2 hierarchy tree end-----------
