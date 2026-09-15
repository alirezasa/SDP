/* $Id$ */

/**
 * Load the [css/js] files in series or parallel manner
 * @usage 
 * @param {object} config
 */
var ResourceLoader = function(config) {
	/**
	 * Check if neither config.css.length nor config.js.length is truthy (both are empty).
	 */
	if (!((config.css && config.css.length) || (config.js && config.js.length))) {
		/**
		 * If both are empty, return early.
		 */
		return;
	}
    /**
     * Default options for ResourceLoader
     */
    var defaultOptions = {
        /**
         * Default callback for always
         */
        always : jQuery.noop,
        /**
         * Array to store CSS file URLs
         */
        css : [],
        /**
         * Default callback for failure
         */
        fail : jQuery.noop,
        /**
         * Array to store JavaScript file URLs
         */
        js : [],
        /**
         * Processing mode: parallel or series
         */
        process : "parallel", // || series  NO I81N
        /**
         * Default callback for success
         */
        success : jQuery.noop,
        /**
         * Default timeout for AJAX requests
         */
        timeout : 20e3,
        /**
         * Data type for AJAX requests
         */
        dataType : "script", // NO I18N
        /**
         * Asynchronous loading by default
         */
		async : true,
        /**
         * Do not cache by default
         */
		cache : false,
        /**
         * Skip loading files, if already loaded (in-memory). Default is false.
         */
        loadOnce: false
    };
    /**
     * Merge user-provided configuration with default options
     */
    var options = jQuery.extend(true, defaultOptions, config);
    /**
     * Sanitize URLs
     */
    options.js = sanitiseUrl(options.js, 'js');
    options.css = sanitiseUrl(options.css, 'css');
    /**
     * Length of js and css arrays
     */
    var jsLen = options.js.length;
    var cssLen = options.css.length;

    /**
     * Cache to track already loaded files
     */
    this.loadedFiles = this.loadedFiles || {
        js: new Set(),
        css: new Set()
    };

    /**
     * Destructure loadedFiles for easier access
     */
    const { loadedFiles } = this;

    /**
     * Series: Load JavaScript files in series if specified by the configuration.
     */
    if (options.process === "series" && jsLen) { // NO I81N
        getScript(options.js, options.success, options.fail);
    }
    /**
     * SD - 93817
     * Parallel or No JS: Append CSS if no JS files to load or processing is parallel.
     */
    if (jsLen == 0 || options.process === "parallel") {
        appendCss();
    }
    /**
     * Parallel: Load JavaScript files in parallel if specified by the configuration and there are files to load.
     */
    if (options.process === "parallel" && jsLen) { // NO I81N
		/**
		 * Create an array of promises by mapping over each URL in options.js.
		 */
		const promises = options.js.map(url => {
            /**
             * Check cache for JS
             */
            if (!options.loadOnce || !loadedFiles.js.has(url)) {
                /**
                 * Mark as loaded
                 */
                if (options.loadOnce) {
                    loadedFiles.js.add(url);
                }
                return sdpAjax({
                    url : url,
                    dataType : options.dataType,
                    ignorefailuremessage : true,
                    timeout : options.timeout,
                    cache : options.cache
                });
            }
            /**
             * Filter undefined entries
             */
        }).filter(Boolean);
		/**
		 * Wait for all promises to resolve using Promise.all.
		 */
		const allPromises = Promise.all(promises);
		/**
		 * When all promises are resolved, call the success callback.
		 */
		allPromises
			.then(() => {
				/**
				 * Call success callback after all files are loaded
				 */
				options.success();
			})
			.catch(error => {
				/**
				 * Call fail callback on error
				 */
				options.fail();
			})
			.finally(() => {
				/**
				 * Call always callback after completion
				 */
				options.always();
			});
    }

    /**
     * Util Method
     * @param {*} urls 
     * @param {*} successFnc 
     * @param {*} failFnc 
     */
    function getScript(urls, successFnc, failFnc) {
		/**
		 *  Get the first URL from the provided list.
		 */
        var getUrl = urls[0];
		/**
		 * Remove the first URL from the list so that we process the rest of the URLs in recursion.
		 */
        urls = urls.slice(1);
        /**
         * Check cache for JS
         */
        if (options.loadOnce && loadedFiles.js.has(getUrl)) {
            if (urls.length === 0) {
                /**
                 * Appending the css after getting the all script.
                 */
                appendCss();
                successFnc();
            } else {
                /**
				 * If there are more URLs, recursively call getScript to load the next one.
				 */
                getScript(urls, successFnc, failFnc);
            }
            return;
        }
        /**
         * Mark JS as loaded
         */
        if(options.loadOnce){
            loadedFiles.js.add(getUrl);
        }
        
		/**
		 * Load the script based on configuration (synchronously or asynchronously) using jQuery's getScript method.
		 */
		jQuery.getScript({
			url : getUrl,
			async : options.async,
			cache : options.cache,
            attrs : { nonce: sdpNonce }
		}).done(function(script, textStatus) {
			/**
			 * If there are no more URLs to process, append CSS and call the success callback.
			 */
		    if (urls.length === 0) {
		    	/**
		    	 SD - 93817
		    	 Appending the css after getting the all script.
		    	**/
		    	appendCss();
                successFnc();
            } else {
				/**
				 * If there are more URLs, recursively call getScript to load the next one.
				 */
                getScript(urls, successFnc, failFnc);
            }
		}).fail(function(jqxhr, settings, exception){
			/**
			 * If script loading fails, call the fail callback.
			 */
		    failFnc(jqxhr, settings, exception);
		});
    }

    /**
     * Sanitize URLs: Remove duplicates and append hashPath if available.
     * @param {string[]} urls
     */
    function sanitiseUrl(urls, type) {
        var uniqueurls = [];
        jQuery.each(urls, function(_i, el) {
            /**
             * Ensure a consistent object structure for processing.
             * If `el` is a string, wrap it inside an object with `src` as the key.
             */
            var fileObj = typeof el === "string" ? { src: el } : el;
            var sanitizedSrc = fileObj.src;
            /**
             * Skip file if `excludeInDev: true` in development mode
             */
            if (sdp_app.IS_DEVELOPMENT_MODE && fileObj.excludeInDev === true) {
                return;
            }
            /**
             * To load environment-specific files based on jsMinify.
             * If jsMinify is true, apply it to all unless explicitly set to false in the object.
             */
            var shouldJSMinify = type === "js" && !sdp_app.IS_DEVELOPMENT_MODE && ((options.jsMinify && fileObj.minify !== false) || fileObj.minify === true);
            if (shouldJSMinify) {
                sanitizedSrc = sanitizedSrc.replace(".js", ".min.js");
            }
            if (jQuery.inArray(sanitizedSrc, uniqueurls) === -1) {
                /**
                 * Safe check for ui-component access directly
                 */
				var hashPath = typeof getHashPath === 'function' ? getHashPath(sanitizedSrc) : sdp_app.BUILD_NUMBER;
                /**
                 * Append hashPath if available
                 */
                sanitizedSrc += "?" + hashPath;
                uniqueurls.push(sanitizedSrc);
            }
        });
        return uniqueurls;
    }

    /**
     * SD - 93817
     * Append CSS files inside the body tag.
     */
    function appendCss() {
    	if(cssLen){
    		var $body = jQuery("body"); // NO I81N
	        for (var i = cssLen - 1; i >= 0; i--) {
	            var href = options.css[i];
                /**
                 * Check cache for CSS
                 */
                if (!options.loadOnce || !loadedFiles.css.has(href)) {
                    /**
                     * Mark as loaded
                     */
                    if (options.loadOnce){
                        loadedFiles.css.add(href);
                    }
                    /**
                     * Currently css loaded in native's async mode
                     */
                    $body.append(jQuery("<link />", { // NO I81N
                        href: href,
                        media: "all", // NO I81N
                        rel: "stylesheet", // NO I81N
                        type: "text/css" // NO I81N
                    }));
                }
	        }
            /**
             * Call success callback if no JS files to load
             */
	        if (options.js.length === 0) {
	            options.success();
	        }
    	} 
    }
};
