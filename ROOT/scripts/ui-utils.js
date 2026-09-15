/**
 * Function to determine if the current user's theme is set to dark mode.
 * @returns {boolean} True if the user's theme is set to dark mode, otherwise false.
 */
function isDark(){
    /**
     * Check if CLIENT_CONF and userTheme are defined in sdp_user, and if user theme is enabled
     */
    let darkprintMode = typeof isPrintMode === "undefined" ? true : (typeof isPrintMode !== "undefined" && !isPrintMode);
    if(darkprintMode && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.userTheme && sdp_app.themes.IS_USER_THEME_ENABLED) {
        /**
         * Return true if the user's theme is set to night mode, otherwise false
         */
        return sdp_user.CLIENT_CONF.userTheme.nightMode ? true : false;
    }
    else {
        /**
         * Return false if any of the required properties are missing or user theme is not enabled
         */
      return false;
    }
}
  
/**
 * Function to enable or disable dark mode for iframes and the main body based on user preferences.
 */
function darkMode(){
    /**
     * Embed_Zia | No need to have dark mode in external frame and embedded pages
     */
    if(window.location.href.includes('is_external_chat')) {
        return;
    }
    var path = window.location.pathname;
    var regExp = new RegExp("\/ui\/ssp(\/[0-9+].*)?$");
    var isSspEditor = false;
    if (regExp.test(path)) {
        isSspEditor = true;
    }

    var iframeSelector = jQuery('iframe'),
    iframeLength = iframeSelector.length,
    bodySelector = jQuery('body');
    /**
     * Delay execution to ensure iframes are fully loaded
     */
    setTimeout(function(){
        var iframeSelectorn = jQuery(document).find('iframe');
        /**
         * Add a 'load' event listener to each iframe
         * SD 118355 - Remove all event handlers with any namespace containing "darkmode" for the iframeSelectorn element
         * Then, add a new event handler specifically for the "load.darkmode" event
         */
        iframeSelectorn.off(".darkmode").on("load.darkmode", function () {
            var iframeSelector1 = jQuery(this);
        /**
         * Check if 'editor-style.css' stylesheet is not already included in the iframe's head
         */
        if(iframeSelector1.hasClass('ze_area')){ // NO I18N
            if(!(iframeSelector1.contents().find("head link[href*='/style/editor-style.css']").length) > 0){
                iframeSelector1.contents().find("head").append('<link type="text/css" rel="stylesheet" href="/style/editor-style.css?'+sdp_app.BUILD_NUMBER+'">');
            }
        }
        else{
            if(!(iframeSelector1.contents().find("head link[href*='/style/editor-dark.css']").length) > 0){
                iframeSelector1.contents().find("head").append('<link type="text/css" rel="stylesheet" href="/style/editor-dark.css?'+sdp_app.BUILD_NUMBER+'">');
            }
        }
        /**
         * Apply dark mode theme to the iframe's body if user preferences indicate dark mode
         */
        if(isDark() && !isSspEditor){
          iframeSelector1.contents().find("body").attr('theme','dark-mode');
        }else{
          iframeSelector1.contents().find("body").removeAttr('theme'); // NO I18N
        }
      });
    },1);
    /**
     * Iterate through all iframes
     */
    for(var j=0; j <= iframeLength - 1; j++){
        /**
         * Check if 'editor-style.css' stylesheet is not already included in the iframe's head
         */
        if(iframeSelector.eq(j).hasClass('ze_area')){
            if(!(iframeSelector.eq(j).contents().find("head link[href*='/style/editor-style.css']").length) > 0){
                /**
                 * Append the 'editor-style.css' stylesheet with a version query parameter
                 */
                iframeSelector.eq(j).contents().find("head").append('<link type="text/css" rel="stylesheet" href="/style/editor-style.css?'+sdp_app.BUILD_NUMBER+'">');
            }
        }
        else{
            if(!(iframeSelector.eq(j).contents().find("head link[href*='/style/editor-dark.css']").length) > 0){
                /**
                 * Append the 'editor-dark.css' stylesheet with a version query parameter
                 */
                iframeSelector.eq(j).contents().find("head").append('<link type="text/css" rel="stylesheet" href="/style/editor-dark.css?'+sdp_app.BUILD_NUMBER+'">');
            }
        }
    }
    /**
     * To toggle dark mode in admin Connections page
     */
    jQuery('html[dre-connection-theme]').length > 0 ? Connections.Main.changeTheme(sdp_user.CLIENT_CONF.userTheme.nightMode ? "dark":"default") : "";// NO I18N
    /**
     * Apply dark mode theme to the main body and all iframes' bodies if user preferences indicate dark mode
     */
    if(isDark() && !isSspEditor){
      bodySelector.attr('theme','dark-mode');
      iframeSelector.contents().find("body").attr('theme','dark-mode');
    }else{
    /**
     * Remove the 'theme' attribute if dark mode is not enabled
     */
      bodySelector.removeAttr('theme'); // NO I18N
      iframeSelector.contents().find("body").removeAttr('theme'); // NO I18N
      if (jQuery(".zc-pb-tile-card").length) {
        jQuery(".zc-pb-tile-card").css("box-shadow", '0 2px 2px 0 rgba(212,214,215,1)');
      }
    }
    commonAccessibilities.DarkModeIconChange();
}

/**
 * Function to generate an AJAX loading bar HTML based on the specified color.
 * @param {string} color - The color of the loading bar ('undefined' for default color).
 * @returns {string} HTML code for the loading bar.
 */
function ajaxBar(color) {
    if (color == undefined) {
        /**
         * Generate HTML for the default loading bar with multiple bars
         */
        return '<div class="loading1"><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div></div>'
    } else {
        /**
         * Generate HTML for a loading bar with the specified color and multiple bars
         */
        return '<div class="loading2"><div class="loading-bar2"></div><div class="loading-bar2"></div><div class="loading-bar2"></div><div class="loading-bar2"></div></div>'
    }
}

/**
 * Function to calculate the effective width based on the layout of the web page.
 * @param {number} width - The initial width to be adjusted based on the layout.
 * @returns {number} The adjusted width based on the layout.
 */
function calculateWidthByLayout(width) {
    /**
     * Get the layout type from the 'data-header-tabs' attribute of the 'body' element
     */
    var layout = jQuery('body').attr('data-header-tabs');
    /**
     * Check the layout type and adjust the width accordingly
     */
    if(layout=='sidebar') {
      width = width - 75;
    }
    else if(layout=='sidebarlite') {
      width = width - 40;
    }
    /**
     * Return the adjusted width based on the layout
     */
    return width;
}

/**
 * Function to append a parameter (name and value) to a URL string or an object containing parameters.
 * @param {string|object} params - The URL string or object containing parameters.
 * @param {string} paramName - The name of the parameter to append.
 * @param {string} paramValue - The value of the parameter to append.
 * @returns {string|object} The updated URL string or object with the appended parameter.
 */
function appendParameter(params, paramName, paramValue) {
    /**
     * Check if 'params' is an object (representing URL parameters)
     */
    if (params instanceof Object) {
        if (params[paramName] === undefined) {
            params[paramName] = paramValue;
        }
    } else {
        /**
         * If 'params' is not an object (a string URL)
         */
        if (params) {
            /**
             * Define a regular expression to search for the parameter in the URL
             */
            var val = new RegExp('(&|\\?|^)' + paramName + '=.*?(&|$)');
            /**
             * Check if the parameter is not already present in the URL
             */
            if (!val.test(params)) {
                /**
                 * If not present, append the parameter to the URL
                 */
                params += "&" + paramName + "=" + paramValue;
            }
        } else {
            /**
             * If 'params' is empty or undefined, create a new URL with the parameter
             */
            params = paramName + "=" + paramValue;
        }
    }
    /**
     * Return the updated URL string or object with the appended parameter
     */
    return params;
}

/**
 * Custom AJAX function with additional features and error handling.
 * @param {object} options - AJAX configuration options.
 * @returns {object} The jQuery AJAX object.
 */
function sdpAjax(options) {
    if (options.type === undefined) {
        options.type = 'GET'; //No I18N
    }
    if (options.contentType === undefined) {
        options.contentType = "application/x-www-form-urlencoded; charset=utf-8"; //No I18N
    }
    if (options.dataType === undefined) {
        options.dataType = "json";//No I18N
    }
    if (options.type == 'GET') { //No I18N
        if (options.cache == undefined) {
            options.cache = false;
        }
    } else {
        if (!options.data) {
            options.data = {};
        }
        /**
         * Append CSRF token to data for non-GET requests
         */
        options.data = appendParameter(options.data, getCSRFParamName(), getCSRFParamValue());
    }
    if (!options.skipSUBREQUEST) {
        /**
         * Append SUBREQUEST parameter to data (by default)
         */
        options.data = appendParameter(options.data, 'SUBREQUEST', 'XMLHTTP'); //No I18N        
    }
    if(!options.headers) {
        options.headers = { "If-Modified-Since": 'Thu, 1 Jan 1970 00:00:00 GMT' }; //No I18N
    }
    /**
     *  Handle ETag header in GET requests when 'ignoreHeader' is true
     */
	if(options.type === "GET" && options.ignoreHeader) {
		delete options.ignoreHeader;
		delete options.headers;
	}
    /**
     * If url starts with "/api/v3" then we send APICLIENT="sdp_web" in headers.
     */
    if(options.url && (options.url.startsWith("/api/v3") || options.url.startsWith("api/v3"))) {
        /**
         * Initialize headers if not already present
         * If we move the "headers" declaration to common, it will set an empty object in some cases. That can cause problems. That's why we duplicate the code.
         */
        options.headers = options.headers || {};
        options.headers.APICLIENT = "sdp_web"; //No I18N 
    }
    if(options.acceptODCompatible) {
        /**
         * Added for New / Old API compatibility
         */
        options.headers = options.headers || {};
        options.headers.accept = "application/vnd.manageengine.sdp.v3+json";
    }
    var sucFunc = options.success;
    var errFunc = options.error;
    var errMsgAutoHide = options.errMsgAutoHide === false ? false : true;

    options.success = function (resp, str, jqxhr) {
        /**
         * this -- it's return properties in ajax ( used in sdp-select2.js file )
         */
        var responseText = "";
        if (resp) {
            if (resp.response_status && resp.response_status.constructor === Array) {
                responseText = resp.response_status[0];
            }
            else {
                responseText = resp.response_status;
            }
            if (responseText && responseText !== "") {
                // SD - 119902 - allowWarningMessage
                if (responseText.status === "success" || (responseText.messages && responseText.messages.length && responseText.messages[0].type && responseText.messages[0].type.toLowerCase() == "success") || options.ignorefailuremessage === true || options.allowWarningMessage === true) {//No I18N
                    if (options.holderid) {
                        jQuery("#" + options.holderid).html(resp);
                    }
                    if (sucFunc) {
                        sucFunc(resp, str, jqxhr, this);
                    }
                } else {
                    if (typeof (options.failedCallBack) == "function") { //No I18N
                        options.failedCallBack(jqxhr, responseText.status);
                    } else if (typeof errFunc === "function") { //No I18N
                        errFunc(jqxhr, responseText.status);
                    } else {
                        showalert('failure', e_html(responseText.messages[0].message), "isAutoHide=true"); // No I18N
                    }
                }
            } else {
                if (sucFunc) {
                    sucFunc(resp, str, jqxhr, this);
                }
            }
        } else {
            if (sucFunc) {
                sucFunc(resp, str, jqxhr, this);
            }
        }
    };

    options.error = function (jqXHR, status) {
        if (sdp_user.LOGGEDIN_USERID && jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.response_status && jqXHR.responseJSON.response_status.messages && jqXHR.responseJSON.response_status.messages[0].status_code == 401) {
            try {
                showalert('failure', e_html(jqXHR.responseJSON.response_status.messages[0].message), "isAutoHide="+errMsgAutoHide); // No I18N
            } catch (e) {
                console.error(e);
            }
            setTimeout(function () {
                /**
                 * SD - 127986
                 */
                window.location.reload();
            }, 1000);
            return false;
        }
        var res = jqXHR.responseText || "";
        if (res.indexOf("__SDP__LOGIN") > -1) {
            window.top.location.replace("/ui/home");
        }
        else if (typeof (options.failedCallBack) == "function") //No I18N
        {
            options.failedCallBack(jqXHR, status);
        }
        if (options.ignorefailuremessage !== true) {
            var resp = jqXHR.responseJSON;
            if (resp.response_status && resp.response_status.constructor === Array) {
                responseText = resp.response_status[0];
            }
            else {
                responseText = resp.response_status;
            }
            if (responseText && responseText.messages && responseText.messages[0].message) {
                showalert('failure', e_html(responseText.messages[0].message), "isAutoHide="+errMsgAutoHide); // No I18N
            } else {
                if (typeof errFunc === "function") {
                    errFunc(jqXHR, status);
                    return;
                } else {
                    var sdtranslate = (typeof translate === "function") ? translate : translate;
                    showalert('failure', sdtranslate("sdp.api.unknown.error"), "isAutoHide="+errMsgAutoHide); //No I18N
                }
            }
        }
        if (typeof errFunc === "function") {
            errFunc(jqXHR, status);
        }
    };

    /**
     * Task ID - 134687
     * Check if preAjaxCallback is a function in the options object
     */
    if (typeof options.preAjaxCallback === "function") {
      /**
       * Call the preAjaxCallback function with options as the argument
       */
      options.preAjaxCallback(options);
      /**
       * Remove the preAjaxCallback property from the options object
       */
      delete options.preAjaxCallback;
    }

    return jQuery.ajax(options);
}

/*
Plugin Name: 
	showalert
Plugin Usage: 
	Status Boxes for AJAX Response with Success / Failure / Info / Warning Messages
Params:
	status - success / failure / info / warning
	responseText - the AJAX response or some html content
	ele - this element from checkbox or its id name.
Features:
	isAutoHide - true/false
	delayHide - true/false
	height - alert box height
	width - alert box width
	ajaxCall - alert box from ajaxcall
*/
function showalert(status,responseText,features,ele) {
    /**
     * Determine the target element (if specified) and ensure it's not focused
     */
	ele = ele != undefined ? jQuery.type(ele) == "object" ? "#"+ele.id : "#"+ele : '';
    /**
     * Remove focus from 'clicked' active element to lose its focus to prevent from re-submission. 
     */
	var focussed = document.activeElement;
	if(focussed && focussed instanceof HTMLElement && document.activeElement.tagName != 'TEXTAREA' && document.activeElement.tagName != 'INPUT' ) { focussed.blur(); } /*67543 input focus issue*/
	/**
     * Remove any existing danger alerts
     */
	jQuery('#alertbox').find('li.alert-danger').remove();
	/**
     * Parse and set alert properties based on the features
     */
	var alertProperties = new Array("isAutoHide", "delay", "width", "height", "closeOnEscKey", "ajaxCall");//No i18N
	var feature = features.split(",");//No i18N
	var featurePresent;
	/**
     * Parse features and set corresponding variables
     */
	for (var i = 0; i < alertProperties.length; i++) {
		featurePresent = false;
		for (var j = 0; j < feature.length; j++) {
			if (feature[j].indexOf(alertProperties[i]) >= 0) {
				featurePresent = true;
				break;
			}
 		}
        /**
         * Set alert properties based on the presence of features in the options
         */
		self["alert_" + alertProperties[i]] = (featurePresent) ? feature[j].substr(feature[j].indexOf("=") + 1, feature[j].length).trim() : "undefined";//No i18N
	}
	
	browserDir = jQuery.fn.getDirection();
	/**
     * Set alert dimensions and timing based on options
     */
	if(alert_width==null||alert_width=="undefined") { wt = 'auto'; owt = 0; } else { wt = parseInt(alert_width)+'px'; owt = parseInt(alert_width); } //NO I18N
	if(alert_height==null||alert_height=="undefined") { ht = 'auto'; oht = 0; } else { ht = parseInt(alert_height)+'px'; oht = parseInt(alert_height); } //NO I18N
	if(alert_delay==null||alert_delay=="undefined") { delayDuration = 3000; } else {delayDuration = parseInt(alert_delay) * 1000;} //NO I18N
	if(alert_isAutoHide != "undefined" && alert_isAutoHide == "false") { alertAutoHide = false; } else { alertAutoHide = true; } //NO I18N
	if(alert_closeOnEscKey != "undefined" && alert_closeOnEscKey == "no") { alertCloseOnEscKey = false; } else { alertCloseOnEscKey = true; } //NO I18N
	if(alert_ajaxCall != "undefined" && alert_ajaxCall == "true") { alertajaxCall = true; } else { alertajaxCall = false; } //NO I18N
	
	var msg 			= responseText,
      boxid = status === 'success' ? jQuery('#alertbox-success') : jQuery('#alertbox'), //NO I18N
      box = status === 'success' ? jQuery('<ul>', { id: 'alertbox-success' }) : jQuery('<ul>', { id: 'alertbox' });  //NO I18N
      // Ensure the alert box is added to the body if it doesn't exist
      if (boxid.length == 0) {
          box.addClass('ui-alertbox1').css({ width: wt });  //NO I18N
          if (status === 'success') {
              box.css('top', '10%');
          } else {
              box.css('top', '50%');
          }
          jQuery('body').append(box);
      } else {
          box = boxid;
      }

	var closebtn 		= jQuery('<button type="button" class="close" ><span class="cspr close2 icon-xs" aria-hidden="true"></span><span class="sr-only">Close</span></button>'), //NO I18N
		boxli		 	= jQuery(document.createElement('li')).addClass('alert alert-dismissible icon'); //NO I18N
		boxli.append(closebtn); //NO I18N

	var boxlic			= jQuery(boxli).append('<span class="msg">'+msg+'</span>').css('display','table'); //NO I18N
	jQuery("#ariaLiveStatusMsg").html(msg);
	switch(status)
	{
		case 'success': jQuery(boxli).addClass('alert-success'); break; //NO I18N
		case 'failure': jQuery(boxli).addClass('alert-danger'); break; //NO I18N
		case 'info'   : jQuery(boxli).addClass('alert-info'); break; //NO I18N
		case 'warning': jQuery(boxli).addClass('alert-warning'); break; //NO I18N
	}
	
	if( alertAutoHide ){
		boxli.attr( 'hasdelay' , delayDuration ); //NO I18N
	}
	boxlic.addClass('slim');   //NO I18N
  box.append(boxlic);  //NO I18N

	setTimeout(function(){
		boxlic.removeClass('slim').addClass( 'animclass' ); //NO I18N
		(ele != "undefined" && ele != '') ? jQuery(ele).prop('disabled',true).closest('label').addClass('disabled') : '';
	},1);

	if( alertajaxCall ) { jQuery('.ui-alertbox1').find('button.close').remove(); alertAutoHide = false; }  //NO I18N
    /**
     * Close button click handler
     */
	closebtn.on( 'click' ,function(event){ //NO I18N
    /**
     * SD - 107792
     */
    event.stopPropagation();
		close_element = jQuery( this ).closest( 'li' );  //NO I18N
		close_element.removeClass( 'animclass' ).delay( 300 ).queue(function(){  //NO I18N
			close_element.addClass( 'slim' ).delay(300).queue(function(){   //NO I18N
				close_element.remove();
				jQuery( this ).dequeue();
				(ele != "undefined" && ele != '') ? jQuery(ele).prop('disabled',false).closest('label').removeClass('disabled') : '';
			});
			jQuery( this ).dequeue();
		});
	});
	/**
     * Auto-hide alerts with delay
     */
	if( alertAutoHide ){	
    let $list = status == 'success' ? jQuery( '#alertbox-' + status + ' li[hasdelay]' ) : jQuery( '#alertbox li[hasdelay]' );
		$list.each(function(){ //NO I18N
			var delay_element = jQuery( this );
			setTimeout(function(){
				delay_element.removeClass( 'animclass' ).delay( 300 ).queue(function(){  //NO I18N
					delay_element.addClass( 'slim' ).delay( 300 ).queue(function(){   //NO I18N
						delay_element.remove();
						jQuery( this ).dequeue();
						(ele != "undefined" && ele != '') ? jQuery(ele).prop('disabled',false).closest('label').removeClass('disabled') : '';
					});
					jQuery( this ).dequeue();
				});
			},delay_element.attr( 'hasdelay' )); //NO I18N
		});
	}
    /**
     * Close alertbox on 'Esc' key press
     */
    jQuery(document).on('keyup.alertbox',function(e) { //NO I18N
       if (e.keyCode == 27 && alertCloseOnEscKey == true) { // 'esc' key
        let a_id = "#alertbox" + (status === "success" ? status : "");
        jQuery(a_id).remove(); //NO I18N
      }
    });
}

/*
 * Function to make the Tabs Responsive
 * Requirements: overflow <li> should have 'overflow-menu' class and the collapsible tabs (tabs which can be put inside the overflow menu) should have attribute [data-tab-collapse="collapse"]
 * Usage: call the below fn construtor with the id of the <ul> of the tabs
 *        ex: var sampleTabs = new ResponsiveTabs('#sample-tabs');
 * parameters: element - selector of the <ul> (id is preferred)
 *             minTabs - minimum number of tabs should always be visible even though the conainer width is lesser
 * Methods: 1) reIntialize() - When the tabs are rerendered, call this fn to reassign the element object to the function properties
 *          2) handleTabs() - To recalculate the width of the container and child tabs to get the responsive tabs.
 *          3) reArrangeTab() - To make the tab active, if the tab is selected from the overflow menu
 * Note: Also, for the resize event responsiveness handling, add the function call of the initialized object's "handleTabs" fn in resize event function at top of this file
 *       ex: sampleTabs.handleTabs();
 */
function ResponsiveTabs(element, minTabs,vertical) {
  var _self = this;
  this.element = element;
  this.minTabs = minTabs;
  this.isVertical = !!vertical;
  this.container = jQuery(this.element);
  if(!this.container.length) {
    // throw new Error("No element found for the selector - '"+element+"' while initializing the responsive tabs");  //No I18N
    return false;
  }
  this.overflow_menu = this.container.find('li.overflow-menu'); //No I18N
  //when custom widget is added as tab   the tab header is append after the overflow menu to  fix it overflow is moved to last
  if(!this.overflow_menu.find("li").length){ 
    this.container.find("li:last()").after(this.overflow_menu)
  }
  this.overflow_menu_width = null;
  this.setTabMetaData();
  this.handleTabs();
}

ResponsiveTabs.prototype = {
  element: null,
  minTabs: null,
  container: null,
  overflow_menu: null,
  overflow_menu_width: null,
  more_options_shown: false,
  style_metadata: {},
  loopRestrictor: 0,
  loopTimeout: null,

  /*
   * To reassign the element object to the properties, if the tabs are rerendered
   */
  reInitialize: function() {
    this.container = jQuery(this.element);
    this.overflow_menu = this.container.find('li.overflow-menu'); //No I18N
    this.overflow_menu_width = null;
    style_metadata = {};
    this.setTabMetaData();
    this.handleTabs();
  },

  /*
   * To recalculate the width of the container and the visible child tabs for minizing or restoring the tabs
   */
  handleTabs: function() {
    var _self = this;
    /* By any chance if the recursive calls enters infinite loop (highly unlikely), the loopRestrictor will detect the number of loops executed in a certain amount of time
     * and based on that it will restrict the further execution after 100 loop runs
     */
    if(this.loopRestrictor > 100) {
      this.loopRestrictor = 0;
      return;
    }
    this.loopRestrictor = this.loopRestrictor + 1;
    clearTimeout(this.loopTimeout);
    this.loopTimeout = setTimeout(function() {
      _self.loopRestrictor = 0;
    }, 400);

    var tabsWidth = this.visibleContentWidth();
    if( tabsWidth >= this.container.width() &&
        ( this.minTabs == null || (this.minTabs && this.minTabs < jQuery(this.container).find('li:not(.overflow-menu)').length ) ) ) {
      /* Minimizes a tab, if the visible child tabs width is greater than or equal to  the container width
         and if the minTabs is available, checks if the no of child tabs reaches the minTabs*/
      this.minimizeTab();
    } else if (this.more_options_shown) {
      /* Restores a tab, if the container width is more than the combined width of visible child tabs and the first tab in overflow menu */
      var required_width = parseInt(tabsWidth) + parseInt(this.overflow_menu.find('li:first').data('width')); //No I18N
      if(this.overflow_menu.find('>ul>li').length == 1) {
        required_width = required_width - this.overflow_menu_width;
      }

      if(required_width < this.container.width()) {
        this.restoreTab();
      }
    }
  },

  /*
   * Moves the last inactive and collapsable tab inside the overflow menu
   */
  minimizeTab: function() {
    this.more_options_shown = true;
    var index = 0, prevHiddenTab;
    var visibleTabsLen = this.container.find('>li:not(.overflow-menu)').length; //No I18N
    var nextTab = this.container.find('>li:not(.overflow-menu, .active) > a[data-tab-collapse="collapse"]:last'); //No I18N
    if(nextTab.length === 0) {
      return;
    }

    /* Removes the styles of the tab and stores it in a properties with the position */
    this.style_metadata[nextTab.data('index')] = nextTab.attr('style'); //No I18N
    nextTab.removeAttr('style');  //No I18N
    nextTab.off('mouseenter mouseleave');  //No I18N
    nextTab = nextTab.parent();

    /* checks for the proper position to insert the tab inside the overflow menu */
    do{
      prevHiddenTab = this.overflow_menu.find('>ul>li').eq(index);  //No i18N
      index++;
    } while(prevHiddenTab.data('index') < nextTab.data('index')); //No I18N
    index--;
    jQuery(this.overflow_menu).removeClass('hide').addClass('bs-noconflict'); //No I18N
    if(index > 0) {
      if(this.overflow_menu.find('>ul>li').length > index) {
        nextTab.insertBefore(this.overflow_menu.find('>ul>li').eq(index));  //No I18N
      } else {
        this.overflow_menu.find('>ul').append(nextTab);  //No I18N
      }
    } else {
      this.overflow_menu.find('>ul').prepend(nextTab);  //No I18N
    }

    if(visibleTabsLen != this.container.find('>li:not(.overflow-menu)').length) {
      /* rechecks if more tabs to be minimized */
      this.handleTabs();
    }
  },

  /*
   * Moves the first tab in overflow menu to the tabs list
   */
  restoreTab: function(restoreAll) {
    var _self = this, index = 0, prevTab;
    var visibleTabsLen = this.container.find('>li:not(.overflow-menu)').length; //No I18N
    var lastHiddenTab = this.overflow_menu.find('>ul>li:first');  //No I18N
    if(lastHiddenTab.length === 0) {
      return;
    }
    var tabIndex = lastHiddenTab.data('index'); //No I18N
    var hiddenTabsLen = this.overflow_menu.find('>ul>li').length; //No I18N

    /* checks for the proper position to insert the tab in the tabs list */
    do {
      index--;
      prevTab = this.container.find('>li:not(.overflow-menu)').eq(index); //No I18N
    } while(prevTab.data('index') > tabIndex);  //No I18N
    index++;

    /* Detaches the First tab (last hidden) from the overflow menu and inserts it in to the tabs list in the appropriate position */
    if(index < 0) {
      lastHiddenTab.insertBefore(this.container.find('>li:not(.overflow-menu)').eq(index)); //No I18N
    } else {
      lastHiddenTab.insertBefore(this.overflow_menu);
    }
    /* Restoring the styles to the tab */
    lastHiddenTab.attr('style', this.style_metadata[tabIndex]);

    /* checks if all the tabs are moved out of the overflow menu. if yes, then hide the overflow menu */
    if(hiddenTabsLen == 1) {
      _self.more_options_shown = false;
      _self.overflow_menu.removeClass('bs-noconflict').addClass('hide');  //No I18N
    } else {
      if(restoreAll && hiddenTabsLen > 1) {
        this.restoreTab(true);
        return;
      }
      if(visibleTabsLen != _self.container.find('>li:not(.overflow-menu)').length) {
        /* rechecks if more tabs to be restored */
        _self.handleTabs();
      }
    }
  },

  /*
   * returns the total width of the visible content in the container (<ul>)
   */
  visibleContentWidth: function() {
    var tabs_width = 0;
    this.container.find('>li:visible').each(function(index, tab) {  //No I18N
      tabs_width += jQuery(tab).outerWidth(true);
    });
    return tabs_width;
  },

  /*
   * sets the position and width for each tab
   */
  setTabMetaData: function() {
    var i=0;
    this.overflow_menu.removeClass('hide'); //No I18N
    this.overflow_menu_width = this.overflow_menu.outerWidth(true);
    this.overflow_menu.addClass('hide');  //No I18N
    this.container.find('>li:not(.overflow-menu)').each(function(index, tab) {  //No I18N
      var jTab = jQuery(tab);
      jTab.attr({'data-index': i, 'data-width': jTab.outerWidth(true),'data-height': jTab.outerHeight(true)});  //No I18N
      i++;
    });
  },

  /*
   *  Moves the tab to the container and makes it active, if the tab is selected from the overflow menu
   */
  reArrangeTab: function() {
    if(this.overflow_menu.find('>ul>li.active').length > 0) {
      var activeTab = this.overflow_menu.find('>ul>li.active'); //No I18N
      var index = 0, prevTab;

      /* checks for the proper position to insert the tab in the tabs list */
      do {
        index--;
        prevTab = this.container.find('>li:not(.overflow-menu)').eq(index); //No I18N
      } while(prevTab.data('index') > activeTab.data('index')); //No I18N
      index++;
      if(index < 0) {
        activeTab.insertBefore(this.container.find('>li:not(.overflow-menu)').eq(index)); //No I18N
      } else {
        activeTab.insertBefore(this.overflow_menu);
      }
      this.handleTabs();
    }
  }
};
//@param {String} string - Given template string to convert document fragment
function SDPTemplate(string) {
    var template = document.createElement('template');
        template.innerHTML = string;
    var content = template.content;
    var lastQuery;
    var methods = {};

    methods.query = function(selector) {
        lastQuery = content.querySelector(selector);
        return methods; 
    }

    methods.detach = function() {
        if(lastQuery) {
            lastQuery.remove();
            return methods;
        } else {
            return methods;
        }
    }


    methods.get = function(clone) {
        if(lastQuery) {
            if(clone == undefined) {
                var temp = lastQuery;
                lastQuery = null;
                return temp;
            } else {
                    var clone = lastQuery.cloneNode(true);
                lastQuery = null;
                return clone;
            }
            
        } else {
            if(clone == undefined) {
                if(content.children.length == 1) {
                    return content.children[0];
                } else {
                    return content.children;
                }
            } else {
                var children = Array.from(content.children);
                children = children.map(function(elem) {
                    return elem.cloneNode(true);
                });
                return children;
            }
        }
    }

    return methods;
}
//Usage -------------
/*
    var template = SDPTemplate(`<div><ul class="list"><li class="row"></li></ul></div>`);
    var rowTemplate = template.query('.row').detach().get(false);
    
    It will get the .row selector element and detach(using .detach()) the element from document fragment and 
    return it without clone( get(true) - to return clone element  ) the element

    var divElement = template.get();
    It will return the whole document fragment

*/

// Accessibility JS Code
let isAccessibilitySliderLoaded = false;
const commonAccessibilities = {
     /**
     * Toggles the visibility of the accessibility slider panel.
     * If the slider panel is visible, it closes it. Otherwise, it opens and initializes it.
     */
	showSlider(){
		const sliderPanel = jQuery("#SlideAccessPanelHTML");
		const slideAccess = jQuery("#slideAccess");
		if(sliderPanel.is(":visible")){
			sliderPanel.dialog("close");
		}
		else{
			sliderPanel.show().panelSlider({
				width: 450,
				header: false,
				dialogClass: "profile-tab",  // NO I18N
				placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
				dialogClass: "tabui-rightpanel ac-slider", // NO I18N
				open: function(){
					if(!isAccessibilitySliderLoaded){
						ResourceLoader({
							js: ["/scripts/hbs-template-accessibility.js"],
							success: function() {
                                renderhbs("#SlideAccessPanelHTML", "accessibility-slider", "", false, "accessibility", "", "", function() {
                                    ResourceLoader({
                                        js: ["/scripts/accessibility.js"],
                                        success: function() {
                                            accessibilitiesSlider.init();
                                            isAccessibilitySliderLoaded = true
                                        }
                                    })
                                })
							}
						})
					}
					slideAccess.find('> button').addClass('active');
				},
				close: function(){
					slideAccess.find('> button').removeClass('active');
                    jQuery('body').removeClass('subheader-of-h');
				}
			});
		}
	},
    /**
     * Toggles the visibility of the bottom bar accessibility icon based on the current state of the checkbox.
     * Updates the accessibility configuration accordingly.
    */
	togglebottombar(cur){
		let Accessibility = sdp_user.CLIENT_CONF.Accessibility;
        if(!Accessibility){
            Accessibility = {bottombar:false};
        }
        
		if(jQuery(cur).prop("checked")){
			jQuery("#slideAccess").removeClass("hide");
            Accessibility.bottombar = true;
		}
		else{
			jQuery("#slideAccess").addClass("hide");
			Accessibility.bottombar = false;
		}
		addPersonalization("Accessibility", Accessibility, true, {'is_portalspecific':'false'}); // NO I18N
	},
    /**
     * Initializes accessibility settings on page load.
     * Adds appropriate classes to the root and iframe elements based on the user's accessibility configuration.
    */
	onload(){
		const iframeSelector = jQuery('iframe');
		const rootSelector = jQuery('html');
		const Classess = "a11ymode-body a11y-underline a11y-contrast a11y-tabfocus a11y-showhover a11y-animation a11y-emphasizefocus a11y-customscroll a11y-customcursor a11y-fs-normal a11y-fs-large a11y-fs-xlarge";  // NO I18N

		if(typeof(externalframe) != 'undefined' && externalframe){
			rootSelector.addClass("external-frame");  // NO I18N	
		}
		if(commonAccessibilities.isAccessibilityEnabled()){
			const accessibilityConf = sdp_user.CLIENT_CONF.Accessibility;

			// Utility function to add class to both root and iframe body
			const addClassToRootAndltrame = (className)=>{
				rootSelector.addClass(className);
				iframeSelector.contents().find("body").addClass(className); // NO 118N
			};

			//Enable ally mode
			addClassToRootAndltrame("a11ymode-body");  // NO I18N

			//Add specific classes based on accessibility configuration
			const accessibilityClasses = [{condition: accessibilityConf.contrast, className: "a11y-contrast"},{condition: accessibilityConf.underline, className: "a11y-underline"},{condition: accessibilityConf.animation, className: "a11y-animation"},{condition: accessibilityConf.tabfocus, className: "a11y-tabfocus"},{condition: accessibilityConf.showhover, className: "a11y-showhover"},{condition: accessibilityConf.emphasizefocus, className: "a11y-emphasizefocus"},{condition: accessibilityConf.customscroll, className: "a11y-customscroll"},{condition: accessibilityConf.customcursor, className: "a11y-customcursor"}]; // NO I18N

			//Itreate over the configuration and add classes to root and iframe body
			accessibilityClasses.forEach((item)=>{
				if(item.condition){
					addClassToRootAndltrame(item.className);
				}
			});

            if(accessibilityConf === undefined || accessibilityConf.fontsize === undefined){
                rootSelector.removeClass("a11y-fs-normal a11y-fs-large a11y-fs-xlarge").addClass(`a11y-fs-normal`); // NO I18N
				iframeSelector.contents().find("body").addClass(`a11y-fs-normal`);  // NO I18N
            }
			else if(accessibilityConf.fontsize){
				rootSelector.removeClass("a11y-fs-normal a11y-fs-large a11y-fs-xlarge").addClass(`a11y-${sdp_user.CLIENT_CONF.Accessibility.fontsize}`); // NO I18N
				iframeSelector.contents().find("body").addClass(`a11y-${sdp_user.CLIENT_CONF.Accessibility.fontsize}`);  // NO I18N
			}
			return;
		 }
		 rootSelector.removeClass(Classess).addClass('a11y-fs-normal');  // NO I18N
	},
    /**
    * Checks if accessibility mode is enabled in the user's configuration.
    */
	isAccessibilityEnabled(){
		return sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF.Accessibility && sdp_user.CLIENT_CONF.Accessibility.mode;
	},
    /**
     * Initializes the chat bar based on the user's accessibility configuration.
     * Shows the bottom bar if it is enabled in the configuration.
    */
	initChatBar(){
		const jB = jQuery("body");
        if(sdp_user.CLIENT_CONF.Accessibility){
            if(sdp_user.CLIENT_CONF.Accessibility.bottombar){
                jB.find("#slideAccess").removeClass("hide");
            }
        }
		
	},
    /**
     * Configures the accessibility settings by closing the current slider and showing the accessibility slider after a delay.
    */
	configure(curEle) {
		$header.closeSlider(curEle);
		setTimeout(() => {
			commonAccessibilities.showSlider();
			}, 500);
	},
    /**
     * Handles the "Skip to Main Content" functionality for WCAG 2.4.1 Bypass Blocks.
     * 
     * This method:
     * - Scrolls to the main content when the skip link is clicked.
     * - Sets focus to the main content after scrolling.
     * - Handles the first tab press to set focus to a specific alert element.
     * - Ensures normal tab behavior by removing tabindex after focus.
    */
    skipToMainContent(){
        if(!jQuery('body').hasClass('esm-mainpage')){
            /* Wcag 2.4.1 Bypass Blocks */
            var firstTabPress = true;
            var gotoAlertElement = jQuery('.goto-alert');

            // Handle skip link click
            jQuery('#skip-link').on('click', function(event) {
                event.preventDefault(); // Prevent default anchor click behavior
                //Get the first element with class 'bodypad'
                var mainContent = jQuery('.bodypad').first(); //No I18N 
                if (mainContent.length) {
                jQuery('html, body').animate({
                    scrollTop: mainContent.offset().top // Scroll to the element
                }, 600, function() {
                    mainContent.attr('tabindex', '-1'); // Make the element focusable
                    mainContent.focus(); // Set focus to the element
                });
                }
            });

            // Handle first tab press
            jQuery('#header-placeholder').on('keydown', function(event) {
                if (firstTabPress && event.key === 'Tab') {
                // Set focus to the goto-alert element because no element in parentElement is focused
                if (gotoAlertElement.length) {
                    gotoAlertElement.attr('tabindex', '-1'); // Make it focusable
                    gotoAlertElement.focus(); // Set focus to the element
                    firstTabPress = false; // Ensure this only happens once
                }
                }
            });
                
            // Remove tabindex after focus to allow normal tab behavior
            gotoAlertElement.on('blur', function() {
                gotoAlertElement.removeAttr('tabindex'); //No I18N
            });
        }
   },
    // Function to toggle the night mode (dark mode) on or off
    switchDarkMode() {
        // jQuery selector to get the night mode input checkbox
        const nightModeJQ = jQuery('#nightmode input');
        
        // Check if the night mode is currently enabled or disabled
        // If night mode is enabled (true), uncheck the checkbox and trigger change event
        // If night mode is disabled (false), check the checkbox and trigger change event
        if(sdp_user.CLIENT_CONF.userTheme) {
            sdp_user.CLIENT_CONF.userTheme.nightMode ? nightModeJQ.prop("checked", false).trigger("change") : nightModeJQ.prop("checked", true).trigger("change");
        }
        else{
            jQuery('body').attr('theme') === 'dark-mode' ? nightModeJQ.prop("checked", false).trigger("change") : nightModeJQ.prop("checked", true).trigger("change");   
        }
    },

    // Function to change the icon and tooltip based on dark mode state
    DarkModeIconChange() {
        // jQuery selector to get the element with id 'LightnDarkModeSwitch'
        const LightnDarkModeSwitch = jQuery('#LightnDarkModeSwitch');
        
        // Ensure the LightnDarkModeSwitch element exists before proceeding
        if(LightnDarkModeSwitch) {
            // Get the current dark mode status (true if dark mode is enabled)
            const IsDarkMode = isDark();
            
            // Set the tooltip content based on the dark mode status (translate to appropriate text)
            const TitleContent = IsDarkMode 
                ? translate('theme.switch.light.mode') // If dark mode is on, show "Switch to Light Mode" 
                : translate('theme.switch.dark.mode'); // If dark mode is off, show "Switch to Dark Mode"

            // Update the tooltip and icon's 'href' attribute based on dark mode status
            // Change the SVG icon (light or dark mode icon) and update the tooltip content accordingly
            LightnDarkModeSwitch
                .attr({'tab-name': TitleContent})  // Set tooltip content
                .find('svg > use')                   // Find the SVG icon in the element
                .attr('href', IsDarkMode ? '#light-mode' : '#dark-mode'); // Change the icon based on dark mode status
        }
    }
};
