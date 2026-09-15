/* $Id$ */
/**
 * Method to convert data-style to css using jQuery
 * This method should only be used before appending content to DOM, using it after appending will cause UI glitches
 * @param {DOM} dom hbs template dom
 */
function convertDataStyle(dom) {
  if(!dom) { return; }
  //Get the data-style attribute value and remove the attribute
  dom = dom.jquery ? dom.get(0) : dom;
  var style_val = dom.getAttribute('data-style');
  dom.removeAttribute('data-style');

  if(!style_val) { return; }
  var $dom = jQuery(dom);
  //If style has important add it as it is using cssText
  if (style_val.indexOf("important") > -1) {
    $dom.css("cssText", style_val); // NO I18N
    return;
  }
  //Format and structure the style attribute into an object for applying styles
  var fineTrim = (el) => el.nativeTrim();
  var arr = style_val.indexOf(';') == -1 ? [style_val] : style_val.split(';');
  arr = arr.map(fineTrim);

  var style_obj = {};
  for (var i = 0, len = arr.length, tmp; i < len; ++i) {
      if (arr[i].indexOf(':') == -1) continue;      // Empty or wrong style
      tmp = arr[i].split(':').map(fineTrim);
      style_obj[tmp[0]] = tmp[1];
  }
  $dom.css(style_obj);
}
/**
 * Converts elements' data-style attributes to inline styles within a container.
 * 
 * @param {string | HTMLElement | NodeList} container - A selector string, a DOM element, or a NodeList representing the container(s) to process.
 * 
 * If the container is a string, it will be used as a selector to find the container element.
 * If the container is an object (i.e., a DOM element or a NodeList), it will be processed directly.
 * If the container is an array, the first element of the array will be processed.
 * 
 * The function looks for elements within the container (including the container itself) that have the `data-style` attribute
 * and converts these attributes into inline CSS styles.
 */
function $sdStyleConverter(container) {
    // If a valid container element is found, proceed with the conversion
    if (container) {
        container.each(function() {
            var $this = jQuery(this);

            // Convert data-style attribute of the container itself if present
            if ($this.attr("data-style") !== undefined) {
                convertDataStyle($this);
            }

            // Find all descendants with a data-style attribute and convert them
            jQuery($this).find("[data-style]").each(function () {
                convertDataStyle(this);
            });
        });
    }
}


var $sdThis, $sdEvent;
function $sdReuturnfalse() {
  return false;
}
function $sdEventListener(container) {
  // Select the container element if it's a string or use the first element if it's an object
    if (typeof container === "string") {//No I18N
        container = jQ(container); // for string to find selector given case
    } else if (container.jquery) {//No I18N
        container = container; // for jQuery element case
    } else {
      container = jQ(container); //for direct element give case, so convert to jQuery
    }

    if (container) {
        function sdEventBinding(evt, $this) {
            evt.preventDefault();
            //if(sdpNonce && (($this.nonce == sdpNonce)||($this.getAttribute("snonce") == sdpNonce))) {//Validate nonce present in element
              // Retrieve the handler function name and split if there are multiple handlers
              $sdThis = evt.currentTarget || $this;
              $sdEvent = evt;
              let paramsplit = $this.getAttribute('data-handler');
              if(paramsplit) {
                paramsplit = paramsplit.replace(/this/g,'$sdThis');//No I18N
                paramsplit = paramsplit.replace(/event/g,'$sdEvent');//No I18N
                paramsplit = paramsplit.replace(/return false;/g,'$sdReuturnfalse();');//No I18N
                jQuery.globalEval(paramsplit);
                // clear global variable after work done
                $sdEvent = null;
                $sdThis = null;
              }
            //} else {
              //console.warn("Warning! : CSP not handling properly");
            //}
        }
        // Select all elements with the data-event attribute within the container
        const elements = container.find('[data-event]').add(container.get()).get();//No I18N
        
            elements.forEach(element => {
                // Get the event type from the data-event attribute
                if(element.sdEventListenerAdded || !element.getAttribute) {return;} // skip if already added event
                const eventType = element.getAttribute('data-event');//No I18N

                // Attach the event listener using jQuery
                jQuery(element).on(eventType + ".sdevent", function(evt) {//No I18N
                    sdEventBinding(evt, this);
                });
                element.sdEventListenerAdded=true; // add its event added
            });
    }
}

(function(jQuery) {
    var originalGlobalEval = jQuery.globalEval;
    // Override globalEval function
    jQuery.globalEval = function(code) {
        var defaultOptions = {
            nonce: typeof sdpNonce != "undefined" ? sdpNonce : "rAnd0m",//No I18N
        };
        // Call original globalEval with modified options
        return originalGlobalEval.call(this, code, defaultOptions);
    };
})(jQuery);

/**
* A function used to fecth the template in development mode
* and get the precompiled template in production mode
* @param container {String} - Where the compiled output goes
* @param template {String} - Name of the template
* @param data {Object} - Data for the compiled handlebars
* @param append {boolean} - whether to set the html or append it to the container
* @param namespace {String} - Namespace for the template i.e folder
* @param tooltip {boolean} - whether the tooltip should be initialized after the HTML insertion
* @param cache {boolean} - whether to fetch from cachedTemplates or not - by default it is true
* @param gethtml {boolean} - whether to return compiled html or not - by default it is false
*/
window.cachedTemplates = {};
function renderhbs(container, template, data, append, namespace, tooltip, cache, callBack, gethtml) {
     if((!container && !gethtml) || !template) {
         /* eslint-disable no-console */
         console.error("Handlebars Template cannnot be rendered. Either container  ( " + container + ") or template ( " + template + ") is missing."); // No I18N
         /* eslint-enable no-console */
     }
     /*To get compiled HTML,dont' need container*/
     if(!gethtml){
         if(!(container instanceof jQuery)) {
               var _container = container;
             container = jQuery(container);
         }
         if(container.length === 0) {
             /* eslint-disable no-console */
               console.error("Container to insert the compiled html not found : " + _container);    //No I18N
             /* eslint-enable no-console */
         }
     }


    /**
     * This function retrieves a compiled template for rendering using Handlebars.js.
     * @param {string} template - The name of the template to retrieve.
     * @param {Object} data - The data to be passed into the template for rendering.
     * @param {string} namespace - The namespace or directory where the template is located.
     * @param {boolean} cache - Indicates whether to cache the compiled template. Defaults to true.
     * @returns {Function|string} - The compiled template function or rendered HTML string.
     */
    function getCompiledTemplate(template, data, namespace, cache){
        var compiledTempl;
        /**
         * Check if the template is already cached in the global cachedTemplates object
         */
        if (window.cachedTemplates[template]) {
            compiledTempl = window.cachedTemplates[template];
        }
        /**
         * Check if the template is already compiled and stored in Handlebars.templates object
         */
        else if (Handlebars.templates && Handlebars.templates[template]) {
            compiledTempl = Handlebars.templates[template];
        } 
        /**
         * If template is not found in cache or Handlebars.templates, fetch it via AJAX
         */
        else {
            if(sdp_app && sdp_app.IS_DEVELOPMENT_MODE) {
                sdpAjax({
                    dataType: "html", // NO I18N
                    url: "/hbs/" + namespace + "/" + template + ".hbs", // NO I18N
                    cache: false,
                    async: false,
                    ignorefailuremessage: true,
                    success: function(res) {
                        theTemplateScript = res;
                        compiledTempl = Handlebars.compile(theTemplateScript);
                        /**
                         * Cache the compiled template if caching is not explicitly disabled
                         */
                        if(cache !== false) {
                            window.cachedTemplates[template] = compiledTempl;
                        }
                    },
                    error: function() {
                        /**
                         * Throw an error if template retrieval fails
                         */
                        throw new Error("Handlebars Template not found : " + template);   //No I18N
                    }
                });
            } else {
                throw new Error("Handlebars Template not found : " + template);   //No I18N
            }
        }
        /**
         * If data is provided, render the compiled template with the data
         */
        if (data) {
            compiledTempl = compiledTempl(data);
        }
        /**
         * Return the compiled template function or rendered HTML string
         */
        return compiledTempl;
    }
     var compiledTempl = getCompiledTemplate(template, data, namespace, cache);
     
     //Convert data-style to style for CSP    
     if (!gethtml && typeof compiledTempl !== 'function') {
       compiledTempl = jQuery(compiledTempl);
       
       function handleChildren() {
         convertDataStyle(this);
       }
       function handleTemplate() {
         var $this = jQuery(this);
         if ($this.attr("data-style") !== undefined) {  // NO I18N
           convertDataStyle($this);
         }
         $this.find("[data-style]").each(handleChildren); // NO I18N
       }
       compiledTempl.each(handleTemplate);
     }
     if(gethtml){
       return compiledTempl;
     }else{
       if(append) {
           container.append(compiledTempl);
       } else {
           container.html(compiledTempl);
       }
       var containerId = container.attr("id");
       if(tooltip && containerId) {
         initTooltip("#" + containerId); //No I18N
       }
     }
     if(typeof callBack === "function") {
       callBack();
     }
     $sdEventListener(container);
 }

/**
 * This function performs a logical OR operation on an array of boolean values.
 * @param {Array} argArray - An array containing boolean values to be evaluated.
 * @returns {boolean} - The result of the logical OR operation on the input array.
 */
function booleanOr(argArray){
    /**
     * Initialize the result to false
     */
    var result=false;
    /**
     * Iterate through each element in the array
     */
    for(var i = 0; i < argArray.length; i++){
        /**
         * Perform logical OR operation with the current element
         */
        result = result || argArray[i];
    }
    /**
     * Return the final result
     */
    return result;
}

/**
 * This function performs a logical AND operation on an array of boolean values.
 * @param {Array} argArray - An array containing boolean values to be evaluated.
 * @returns {boolean} - The result of the logical AND operation on the input array.
 */
function booleanAnd(argArray){
    /**
     * Initialize the result to true
     */
    var result = true;
    /**
     * Iterate through each element in the array
     */
    for(var i = 0; i < argArray.length; i++){
        /**
         * Perform logical AND operation with the current element
         */
        result = result && argArray[i];
    }
    /**
     *  Return the final result
     */
    return result;
}

/**
 * Execute a function by its name within a given context.
 * @param {string} functionName - The name of the function to execute.
 * @param {Object} context - The context (object) in which to execute the function.
 * @returns {*} - The result of the executed function.
 */
function execFuncByName(functionName, context) {
    /**
     * Extract arguments passed to the function (excluding functionName and context)
     */
    var args = Array.prototype.slice.call(arguments, 2);
    /**
     * Split the function name by dot to handle nested functions
     */
    var namespaces = functionName.split(".");
    /**
     * Extract the actual function name
     */
    var func = namespaces.pop();
    /**
     * Traverse through the namespaces to get the appropriate context
     */
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    if(typeof context[func] == "function") {
        return context[func].apply(context, args);
    } else {
        console.warn(`Handler function is not defined`);
        return false;
    }
}

/**
 * Function to handle dropdown visibility events in Kanban view.
 * Adds padding-bottom to '.tc-kanban' class when the last list is shown.
 */
function show_kanbandropdown() {
    /**
     * Attach event handlers for shown and hide events of dropdown
     */
	jQuery('.kanban-showdropdown').on({
        /**
         * Event handler for shown.sdp.sdmenu event
         */
		"shown.sdp.sdmenu": function() {
            /**
             * Find the closest '.tc-kanban' element
             */
			var tkanban = jQuery(this).closest('.tc-kanban');
            /**
             * Check if the current row is the last row in '.tc-kanban'
             */
			if(tkanban.find('.tc-row').length - 1 == jQuery(this).closest('.tc-row').index()) {
                /**
                 * Calculate and set padding-bottom with height of dropdown menu plus 10px
                 */
				tkanban[0].style.setProperty('padding-bottom', ($(this).find('.sdmenu-dd').height() + 10)+'px', 'important');
			}
		},

        /**
         * Event handler for hide.sdp.sdmenu event
         */
		"hide.sdp.sdmenu":  function() {
            /**
             * Check if padding-bottom is not set to default value
             */
			if(jQuery(this).closest('.tc-kanban').css('padding-bottom') != '10px') {
                /**
                 * Remove padding-bottom from '.tc-kanban' class
                 */
				jQuery(this).closest('.tc-kanban').css('padding-bottom', '');
			}
		}	
	});
};

/**
 * Function to trim leading and trailing whitespace from a string
 * @param {*} str 
 * @returns 
 */
function trim(str) {
    /**
     * Check if the input string is not undefined
     */
    if(str!==undefined) {
        /**
         * Use regular expression to remove leading and trailing whitespace characters
         * /^...$/g is the regular expression pattern for matching leading (^) and trailing ($) whitespace (\s*)
         * The g flag ensures that it replaces all instances of leading and trailing whitespace
         */
        return str.replace(/^\s*|\s*$/g, "");
    }
};
function handleResizeBtnVal($container,options) {
    // Reference to the current object
    options = options || {};
    let eventNamespace = '.'+options.eventNameSpace||'btnResize';
    let containerElem = $container && $container.get(0) || null;
    if(!$container || $container.length == 0){
        //skip init,without container
        return;
    }

    function configBtnval(containerElem, options) {

        let resizeDebounce,resizeObserver;
        let offResizeEvent = ()=>{
            delete containerElem.offBtnToggleEvent;
            // jQ(window).off('resize'+eventNamespace);
            resizeObserver && resizeObserver.unobserve(containerElem);
        }
        let commonoptions = {
            screenwidth: 1200
        };
        if(options) {
            commonoptions = Object.assign(commonoptions,options);
        }

        var isTitleChanged = (element)=>typeof element.dataset.iconConstructTitle !== undefined && element.dataset.iconConstructTitle == "false";
        var hasNoHtmlContent =(element)=>typeof element.dataset.inhtml === undefined || typeof element.dataset.inhtml === 'undefined';
        var getNewWidth =(new_body_width,elem)=>(new_body_width - elem.offsetWidth);
        var getState = (new_width)=>new_width <= commonoptions.screenwidth ? 'small' : 'large';
        //for small view icon changes
        function showSmallView(element,etitle,titlechange){
            let xhtml = '';
            let data = element.dataset;
            if(data.viewType == 'small'){
                //skip keep doing same work
                // return;
            }
            if (data.iconClass) {
                xhtml = `<span class="${data.iconClass}"></span>`;
            } 
            // If data-iconSvg is available, use it for HTML content
            else if (data.iconSvg) {
                xhtml = data.iconSvg;
            }
            
            // Update button HTML content, title, and rel attributes
            element.innerHTML = xhtml;
            if(etitle && titlechange) {
                element.setAttribute('title', etitle);
                element.setAttribute('rel', 'uitip');
            }
            data.viewType = 'small';
            return true;
        }
        //for large view icon changes
        function showLargeView(element,titlechange){
            let data = element.dataset;
            if(data.viewType == 'large'){
                //skip keep doing same work
                // return;
            }

            if(data.inhtml) {
                element.innerHTML = data.inhtml;
            } else {
                element.textContent = translate(data.i18nKey);
            }
            if(titlechange) {
                element.removeAttribute('title');
                data.viewType = 'large';
            }
            return true;
        }

        //To toggle button icon/text
        let updateIcon = function(element){
            // Get the current body width
            let titlechange = true;
            if(isTitleChanged(element)) {
                titlechange = false;
            }
            if(hasNoHtmlContent(element)) {
                element.setAttribute('data-inhtml', `${element.innerHTML}`);
            }
            if(titlechange && element.title) {
                element.setAttribute('data-etitle', element.title);
            }
            let etitle = element.dataset.etitle ? element.dataset.etitle : translate(element.dataset.i18nKey);
            
            // Adjust button display based on the width
            this.new_width <= commonoptions.screenwidth ? showSmallView(element,etitle,titlechange) : showLargeView(element,titlechange);
        }

        
        if(containerElem && containerElem.offBtnToggleEvent){
            //skip, its already init for this element
            return;
        }

        // Function to handle resizing events
        const initResizeBtn = function() {
            // Select all elements with data-icontoggle attribute set to true
            if(!containerElem || !containerElem.isConnected) {
                //kill the resize event when containerElem not connect in dom tree or null
                offResizeEvent();
                return;
            }

            const new_body_width = document.body.clientWidth;
            let new_width = new_body_width;
            if(containerElem) {
                new_width -= getNewWidth(new_body_width,containerElem);
            }

            let currentSate = getState(new_width);
            if(containerElem.lastState == currentSate) {
                //skip, same state work
                return;
            }
            
            !containerElem.offBtnToggleEvent && (containerElem.offBtnToggleEvent = offResizeEvent);
            let buttons = $container.find('[data-icontoggle=true]').get();
            buttons.forEach(updateIcon,{new_width:new_width});
            containerElem.lastState = getState(new_width);

            // Initialize tooltips for buttons inside the #listcontrols element
            initTooltip(".listcontrols");
        };

        // Add a resize event listener with a delay to handle resize events
        offResizeEvent();
        var resizeHandler = ()=>{
            resizeDebounce = clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(initResizeBtn,100)
        }

        function addListener(){
            // jQ(window).on('resize'+eventNamespace,resizeHandler);

            resizeObserver = new ResizeObserver((entries)=>{
                resizeHandler();
            });
            // Start observing the div
            resizeObserver.observe(containerElem);
        }
        
        addListener();

        // Initial invocation of initResizeBtn to adjust button display on page load
        initResizeBtn();

    }
    jQuery($container).each(function(){
        if(this.checkVisibility()) {
            delete this.offBtnToggleEvent;
            delete this.lastState;
            configBtnval(this, options);
        }
    });
}

