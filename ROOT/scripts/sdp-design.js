/* ========================================================================
  SDP-DESIGN SDMENU
* ======================================================================== */
// Immediately Invoked Function Expression (IIFE) to prevent polluting the global namespace
+function ($) {
    'use strict'; // Strict mode to catch common errors and enforce best practices

    // Constants for selector strings to prevent typos and facilitate changes
    const Backdrop = '.sdmenu-backdrop', //NO I18N
    toggle = '[data-switch="sdmenu"]'; //NO I18N

    // Class representing the 'Sdmenu' functionality
    class Sdmenu {
        // Constructor initializes the menu with an element and binds click event
        constructor(element) {
            $(element).off('click.sdmenu').on('click.sdmenu', this.toggle);
        }

        // Toggle function to show or hide the menu
        toggle(e) {
            const $this = $(this);

            // If the clicked element is disabled, do nothing
            if ($this.is('.disabled, :disabled')) return;

            const $parent = getParent($this), // Get the parent menu container
            isActive = $parent.hasClass('open'); // Check if it's already active

            clearMenus(); // Clear any open menus

            // If the menu is not active, proceed to open it
            if (!isActive) {
                $parent.trigger(e = $.Event('show.sdp.sdmenu', { relatedTarget: this })); // Trigger the 'show' event

                // If the event was prevented, stop here
                if (e.isDefaultPrevented() && $this.attr('href') != '/') return; //href check for anchor tag is for CSP activity

                $this
                    .trigger('focus')              // Focus the toggling element
                    .attr('aria-expanded', 'true'); // Update aria-expanded attribute

                $parent
                    .toggleClass('open') // Toggle the 'open' class
                    .trigger($.Event('shown.sdp.sdmenu', { relatedTarget: this })); // Trigger the 'shown' event
            }

            return false; // Prevent default action and bubbling
        }

        // Function to handle keyboard navigation within the menu
        keydown(e) {
            // Define key code constants for readability and maintainability
            const KEY_CODES = {
                UP: 38,
                DOWN: 40,
                ESC: 27,
                SPACE: 32
            };
            
            // Do nothing if the pressed key is not handled or if the target is input/textarea
            if (!Object.values(KEY_CODES).includes(e.which) || /input|textarea/i.test(e.target.tagName)) {
                return;
            }
            
            const $this = $(this);

            e.preventDefault();
            // If the element is disabled, do nothing
            if ($this.is('.disabled, :disabled')) return;
            
            const $parent = getParent($this), // Get the parent menu container
            isActive = $parent.hasClass('open'); // Check if menu is active

            // Close the menu if ESC is pressed or if it's not active
            if ((isActive && e.which === KEY_CODES.ESC) || !isActive) {
                if (e.which === KEY_CODES.ESC) {
                    $parent.find(toggle).trigger('focus'); // Focus the toggle button
                }
                return $this.trigger('click'); // Simulate a click on the element
            }
            
            // Define selector string for visible dropdown items
            const desc = ' li:not(.disabled):visible a', //NO I18N

            // Get all focusable menu items
            $items = isActive ? $parent.find(`.sdmenu-dd${desc}`) : []; 
            
            if (!$items.length) return; // If no items, do nothing
            
            // Determine the index of the currently focused item
            let index = $items.index(e.target);
            
            // Handle up and down arrow key navigation
            switch (e.which) {
                case KEY_CODES.UP:
                    index = Math.max(index - 1, 0); // Go up in the menu, stop at first item
                    break;
                case KEY_CODES.DOWN:
                    index = Math.min(index + 1, $items.length - 1); // Go down, stop at last item
                    break;
            }
            
            $items.eq(index).trigger('focus'); // Set focus to new menu item
        }
    }

    // Helper function to get the parent menu of an element based on data attributes or closest parent
    function getParent($this) {
        let selector = $this.attr('data-target'); //NO I18N

        // Ensure selector is a valid anchor and not just a hash symbol
		if (!selector) {
			selector = $this.attr('href') //NO I18N
			selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
		}

		const $parent = selector === '#' ? null : $(document).find(selector);

		// Find and return the selector within the document or return the element's parent if not found
		return $parent && $parent.length ? $parent : $this.parent();
    }

    // Function to clear all menus by removing backdrops and hiding open menus
    function clearMenus(e) {
        if (e && e.which === 3) return;

        // Remove the backdrop from the DOM
        $(Backdrop).remove();

        // Process each toggle element to close its associated menu
        $(toggle).each(function() {
            const $this = $(this),
            $parent = getParent($this);

            // If the parent menu is not open, skip
            if (!$parent.hasClass('open')) return;

            const relatedTarget = { relatedTarget: this },
            hideEvent = $.Event('hide.sdp.sdmenu', relatedTarget); // Trigger 'hide' event
            $parent.trigger(hideEvent);

            // If the hide event was prevented, do not close the menu
            if (hideEvent.isDefaultPrevented()) return;

            $this.attr('aria-expanded', 'false'); // Update aria-expanded attribute
            // Remove the 'open' class from the menu
            $parent.removeClass('open');
            
            // Trigger 'hidden' event after the menu is collapsed
            $parent.trigger($.Event('hidden.sdmenu', relatedTarget));
        });
    }

    // Plugin function to initialize the menu or call a method if a string is passed
    function Plugin(option) {
        return this.each(function () {
            const $this = $(this);
            let data = $this.data('sdmenu'); //NO I18N

            // Instantiate Sdmenu class if not already done so
            if (!data) $this.data('sdmenu', (data = new Sdmenu(this)))
            // Call a method on the Sdmenu instance if 'option' is a string
            if (typeof option == 'string') data[option].call($this)
        })
    }

    // Assign Plugin to jQuery prototype and set constructor and noConflict properties
    $.fn.sdmenu = Plugin
    $.fn.sdmenu.Constructor = Sdmenu

    // Utility function to check if the browser is Firefox and the target is the body
    function isFirefoxAndBody(target) {
        var isFireFox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; //NO I18N
        var isBody = () => target === document.body;
        return isFireFox && isBody();
    }

    // Event handlers using delegated events
    $(document).off('click.sdmenu.data-api').on('click.sdmenu.data-api',(e) =>{
        const $Etarget = e.target,
        $toggleElement = $($Etarget).closest(toggle);

        if (isFirefoxAndBody($Etarget)) {
            //Quick Create Incident popup, on select2 click - close issue in firefox
            return;
        }
        
        if($Etarget.closest('.sdmenu form') > 0) { 
            e.preventDefault();  // Prevent closing on form clicks
        } 
        else if($toggleElement.length > 0){
            Sdmenu.prototype.toggle.call($toggleElement[0],e); // Toggle menus on click
        }
        else{
            clearMenus(e); // Clear menus on document click
        }; 
    }).off('keydown.sdmenu.data-api').on('keydown.sdmenu.data-api',(e) =>{
        const toggleElement = $(e.target).closest(toggle),
        dropdownElement = $(e.target).closest('.sdmenu-dd');
        
        if (toggleElement.length > 0) { 
            Sdmenu.prototype.keydown.call(toggleElement[0], e); // Handle keydown for opening menus
        } else if (dropdownElement.length > 0) {
            Sdmenu.prototype.keydown.call(dropdownElement[0], e); // Handle keydown inside dropdown menus
        }
    });
}(jQuery); // Pass jQuery object to the IIFE

/* ========================================================================
  SDP-DESIGN SDTAB
* ======================================================================== */
/**
 * This section of code is responsible for handling the tab functionality within a webpage.
 * It uses jQuery to manage tab switching and to display the content associated with the selected tab.
 */

// Immediately-Invoked Function Expression (IIFE) to encapsulate the plugin logic
+function ($) {
    'use strict'; // Enable strict mode for better error checking

    // Define constants for class names used by the plugin
    const ACTIVE_CLASS = 'active';
    const FADE_CLASS = 'in';
    
    /**
     * Defines the Plugin function that handles tab switching logic.
     *
     * @param {jQuery Object} $el - The element that triggered the plugin.
     */
    function Plugin($el) {
        // Determine the target element based on whether the trigger is an <a> tag or not
        const $target = ($el.prop('tagName').toLowerCase() === 'a' && $el.attr('href').indexOf('/') === -1) ? $($el.attr('href')) : $el;    // CSP ACTIVITY

        // Find the corresponding element that should be marked active
        const $element = ($el.prop('tagName').toLowerCase() === 'a') ? $el.parent() : $(`a[href="#${$el.attr('id')}"]`).parent();
		
        // Set the correct active classes on the tab and content
        setActive($element, $target,$el);
    }

    /**
     * Updates the tab elements' classes to reflect the current active state.
     *
     * @param {jQuery Object} $parent - The parent element of the clicked tab.
     * @param {jQuery Object} $target - The target content element related to the clicked tab.
     * @param {jQuery Object} $el - The element that triggered the active state change.
     */
    function setActive($parent, $target,$el) {
		const $siblings = $parent.siblings();
        
		$siblings.removeClass(ACTIVE_CLASS);

		// Add the active class to the clicked tab's parent element
		$parent.addClass(ACTIVE_CLASS);

        // Check if the parent element is a tab within a dropdown menu
        if($parent.closest('ul').hasClass('sdmenu-dd')){ //NO I18N
            if($parent.parents('.nav-sdtabs').length ==  1){ //NO I18N
                $parent.parents('.nav-sdtabs').find('> li').removeClass(ACTIVE_CLASS); //NO I18N
            }
        }

		// Handle displaying the tab content by toggling classes
		if ($target.length > 0 && $target !== 'undefined') {
			const $targetSiblings = $target.siblings();
            $targetSiblings.removeClass(`${ACTIVE_CLASS} ${FADE_CLASS}`);
			$target.removeClass(FADE_CLASS).addClass(`${ACTIVE_CLASS}`);
            setTimeout(() => {
                $target.addClass(FADE_CLASS);
            }, 10);
		}

		// Trigger a custom event after the new tab has been shown
		$el.trigger({type: 'shown.sdp.sdtab'});
    }
    
    // Event listener for click events on elements with data attribute 'data-switch="sdtab"'
    $(document).off('click.sdtabclick').on('click.sdtabclick', '[data-switch="sdtab"]', function (e) {
        e.preventDefault(); // Prevent default action of the event
        Plugin($(this)); // Call the Plugin function with the clicked element as argument
    });
    
    // Extend jQuery prototype to add sdtab method for elements
    $.fn.sdtab = function (state) {
        if (state === 'show') {
            Plugin(this); // Execute the Plugin function if the state argument is 'show'
        }
        // Event listener for click events on elements with data attribute 'data-switch="sdtab"'
        $('a[data-switch="sdtab"]').off('click.sdtabclick').on('click.sdtabclick', function (e) {
            e.preventDefault(); // Prevent default action of the event
        });
    };

}(jQuery); // Pass the jQuery object into our IIFE

/* ========================================================================
  SDP-DESIGN SDRIDER
* ======================================================================== */
// Immediately Invoked Function Expression (IIFE) to enable jQuery noConflict and encapsulate the code
+function ($) {
    'use strict'; // Enforce stricter parsing and error handling in the script

    // Class definition for SdRider - a carousel/slider component
    class SdRider {
        // Constructor to initialize the slider with options and DOM elements
        constructor(element, options) {
            // Extends default options with those passed to the constructor
            this.options = $.extend({}, SdRider.DEFAULTS, options);
            // Cache jQuery object of the element targeted
            this.$element = $(element);
            // Find and cache the inner container of the slider
            this.$inner = this.$element.find(".sdrider-inner");
            // Find and cache the indicators of the slider
            this.$indicators = this.$element.find(".sdrider-indicators");
            // Calls the init method to set up the slider
            this.$active = this.$inner.find(">.active");
            this.$activePosition = this.$active.index();
            this.init();
        }

        // Initializes the slider functionality
        init() { 
            // Update active items on initialization
            this.updateActiveItems();

            // Setup autoplay interval if specified
            if (this.options.interval) {
                this.SInterval();
            }

            // Attach relevant event listeners
            this.setupEventListeners();
        }

        // Set up or reset interval for auto navigation
        SInterval() {
            // Clear any existing intervals
            this.clearIntervals();
            // Set new interval if provided as a number
            if (typeof this.options.interval === 'number') {
                this.interval = setInterval(() => {
                    // Navigate to next item at each interval tick
                    this.navigate('next');
                }, this.options.interval);
            }
        }

        // Clears any existing navigation intervals
        clearIntervals() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        // Attaches event listeners for keyboard and mouse interactions
        setupEventListeners() {
            // Listen for left/right arrow keydown events for navigation
            $(document).off('keydown.sdRider').on('keydown.sdRider', e => {
                if (/input|textarea/i.test(e.target.tagName)) return; // Ignore inside inputs/textareas
                const $jQsdrider = jQuery('div[data-rider="sdrider"]');
                if($jQsdrider.length > 0 && $jQsdrider.length == 1){
                    if (e.which === 37) this.navigate('prev'); // Left arrow press
                    if (e.which === 39) this.navigate('next'); // Right arrow press
                }
                else if($jQsdrider.length > 1){
                    $jQsdrider.each(function(){
                        if($(this).is(":focus")){
                            const $sdRiderId = $('#'+$(this).attr('id'));
                            if (e.which === 37) $sdRiderId.sdRider('prev'); // Left arrow press
                            if (e.which === 39) $sdRiderId.sdRider('next'); // Right arrow press
                        }
                    });
                }
            });
            // Pause autoplay when mouse enters slider and resume on leave
            this.$element.off('mouseenter.sdRider').on('mouseenter.sdRider', () => {
                this.clearIntervals();
                
            }).off('mouseleave.sdRider').on('mouseleave.sdRider', () => {
                this.SInterval();
            });
        }

        // Updates the active indicator based on the active item
        updateActiveItems() {
            // Find the active item and cache it
            this.$active = this.$inner.find(">.active");
            // Get the position of the active item
            this.$activePosition = this.$active.index();
            // Update indicators to reflect the active item
            this.$indicators.find("li").removeClass("active").eq(this.$activePosition).addClass("active");
        }

        // Navigate the slider in a specified direction ('next' or 'prev')
        navigate(direction) {
            // Determine the next item in the given direction
            let $next = this.getNextItem(direction);
            // If there is no next item and wrapping is disabled, do nothing
            if (!$next.length) {
                if (!this.options.wrap) {
                    return false;
                }
                // Select first/last child as next item depending on direction
                $next = direction === 'next' ? this.$inner.children().first(): this.$inner.children().last();
            }
            // Perform slide transition to the next item
            this.doSlide($next, direction);
        }

        // Execute slide animation to transition to the next item
        doSlide($next, direction) {
            const $this = this;
            $this.updateActiveItems();
            if($this.$inner.find(">.item").length > 1) {
                $this.$active = $this.$inner.find(">.active");
            
            // Determine the types of classes to add based on direction
            const type1 = direction === 'next' ? 'left' : 'right';
            const type2 = direction === 'next' ? 'right' : 'left';
            const $active = $($this.$active);

            // Start animating the current active item out
            $active.addClass(type1);
            
            $active.addClass("vhide");

            // Prepare next item and animate it in as active
            $next.addClass(direction).addClass("active");
    
            // Finalize animation for next item, clean classes, update active items
            $next.addClass(type2).delay(10).queue(function (next) {
                $active.removeClass("active vhide");
                $(this).removeClass(`${direction} ${type2}`);
                $active.removeClass(type1);
				// Update indicators after animation completes
				$this.updateActiveItems();
                if($this.options.wrap === false){
                    if($this.$activePosition === $this.$inner.children().length - 1){
                        $this.$element.find(".sdrider-next").addClass("cur-na");
                    }
                    else{
                        $this.$element.find(".sdrider-next").removeClass("cur-na");
                    }
                    if($this.$activePosition === 0){
                        $this.$element.find(".sdrider-prev").addClass("cur-na");
                    }
                    else{
                        $this.$element.find(".sdrider-prev").removeClass("cur-na");
                    }
                }
                // Trigger custom slide event
                $this.$element.trigger({type: 'slide.sdp.sdrider'});
                next();
            });
            }
        }

        // Helper method to get the next item in a given direction
        getNextItem(direction) {
            this.updateActiveItems();
            return direction === 'next' ? this.$active.next() : this.$active.prev();
        }

        // Public method to jump to a specific slide by index
        to(slideIndex) {
            const $active = this.$active;
            const $next = this.$inner.children().eq(slideIndex);
            // Do nothing if attempting to go to the currently active slide
            if ($next.hasClass("active")) return;
            if ($next.length) {
                // Slide to next or previous based on index comparision
                this.doSlide($next, $next.index() > $active.index() ? 'next' : 'prev');
            }
        }
    }

    // Default options for SdRider instances
    SdRider.DEFAULTS = {
        interval: false, // Autoplay interval (false disables autoplay)
        wrap: true,      // Whether the slider should cycle continuously
    };

    // Plugin function to instantiate SdRider or invoke methods/options
    function Plugin(option) {
        return this.each(function () {
            const $this = $(this);
            let data = $this.data('sdRider');
            if(data == undefined){
                $this.data('sdRider', (data = new SdRider(this, option)));
            }
            if(data){
                const options = typeof option === 'object' && option;

                if(typeof option === 'object') {
                    // Initialize SdRider instance for element if not already initialized
                    if (data) {
                        // Update options if SdRider already initialized
                        data.options = $.extend({}, SdRider.DEFAULTS, options);
                    }
                }
                else if (typeof option === 'string'){
                    // Call navigate method if 'prev' or 'next' commands are issued
                    if(option === 'prev' || option === 'next'){
                        data.navigate(option);
                    }
                }
                else if(typeof option === 'number') {
                    // Go to specific slide by index
                    data.to(option);
                }

                // Configure autoplay interval based on options
                if(options.interval === false){
                    data.clearIntervals();
                }
                else if(typeof options.interval === 'number'){
                    data.SInterval();
                }
            }
        });
    }

    // Define the jQuery plugin
    $.fn.sdRider = Plugin;
    // Expose constructor to allow modification of default options
    $.fn.sdRider.Constructor = SdRider;

    // Auto-initialize sliders using data attributes upon document ready
    $(function initializeSliders() {
        $('div[data-rider="sdrider"]').each(function () {
            const $this = $(this);
            Plugin.call($this, $this.data());
        });

        // Event delegation for click events on data-slide attributes
        $(document).off('click.sdRider.data-api', '[data-slide]').on('click.sdRider.data-api', '[data-slide]', function (e) {
            e.preventDefault();
            const $this = $(this);
            const target = $this.attr('data-target') || $this.attr('href');
            
            if(target){
                $(target).sdRider($this.attr('data-slide'));
            }
        });

        // Event delegation for click events on data-slide-to attributes
        $(document).off('click.sdRider.data-api', '[data-slide-to]').on('click.sdRider.data-api', '[data-slide-to]', function (e) {
            e.preventDefault();
            const $this = $(this);
            const target = $this.attr('data-target') || $this.attr('href');
            const slideIndex = $this.data('slide-to');
            
            // Activate specific slide by index via data-slide-to attribute
            if(typeof slideIndex === 'number'){
                $(target).sdRider(slideIndex);
            }
        });
    });
// Pass the jQuery object to the IIFE
}(jQuery);

/* ========================================================================
  SDP-DESIGN BUTTON
* ======================================================================== */
// Encloses the Button plugin logic in a self-executing anonymous function
// to prevent polluting the global scope, passing jQuery ($) as an argument.
+(function ($) {
    'use strict'; // Enforces strict mode which helps catch common coding mistakes and "unsafe" actions.

    // Define a Button class with methods for button state management.
    class Button {
        /**
         * Constructor for the Button class.
         *
         * @param {Object} options - An object containing configuration options for the button.
         */
        constructor(options) {
            // Use jQuery's extend method to merge passed options with default options.
            this.options = $.extend({}, {
                loadingText: 'loading...' // Default text displayed when the button is in a loading state.
            }, options);
            // Initial state of isLoading is set to false.
            this.isLoading = false;
        }
        
        /**
         * Sets the button state by changing its text and disabling/enabling it.
         *
         * @param {jQuery Element} el - The element that will have its state changed.
         * @param {string} state - A string indicating the state to be applied to the button.
         * @param {Object} data - An object containing state-specific values.
         */
        setState(el, state, data) {
            state += 'Text'; // Append 'Text' to the state to form keys like 'loadingText'.
            // Store original button text if it hasn't been saved yet.
            if (data.resetText == null) el.data('resetText', el.html());
            
            // Asynchronous call to ensure any pending changes are processed before this executes.
            setTimeout(() => {
                // Update the button's HTML content based on the provided state or default options.
                el.html(data[state] == null ? this.options[state] : data[state]);
                
                // If we're setting the button to the loading state, disable the button.
                if (state === 'loadingText') {
                    this.isLoading = true;
                    el.addClass('disabled').attr('disabled', 'disabled').prop('disabled', true);
                // If the button was previously in the loading state, restore to enabled state.
                } else if (this.isLoading) {
                    this.isLoading = false;
                    el.removeClass('disabled').removeAttr('disabled').prop('disabled', false);
                }
            }, 0);
        }
    }
    
    // Extend jQuery's prototype by adding the `button` method to handle
    // button state changes via jQuery objects.
    $.fn.button = function(option) {
        return this.each(function () {
            const $this = $(this); // Cache the jQuery-wrapped version of the current element.
            // Retrieve the button data associated with the element or initialize it.
            let data = $this.data('sdp.button');
            
            // Process the option as an object, if applicable.
            const options = typeof option === 'object' && option;
            
            // If the button instance does not exist, create a new one.
            if (!data) $this.data('sdp.button', (data = new Button(options)));
            
            // Apply state change if the passed option is anything other than 'toggle'.
            if (option && option !== 'toggle') data.setState($this, option, $this.data());
        });
    };

    // Expose the Button class explicitly through jQuery's prototype.
    $.fn.button.Constructor = Button;

}(jQuery)); // Pass the jQuery library into the IIFE.

/* ========================================================================
  SDP-DESIGN COLLAPSE PANEL
* ======================================================================== */
const sdpcollapsepanel = {
	toggle(ele) {
		const curEle = jQuery(ele);
		const dataTarget = curEle.attr('data-target'); // NO I18N
		const isCollapsed = curEle.toggleClass('collapsed').hasClass('collapsed'); // NO I18N

		curEle.attr('aria-expanded', !isCollapsed); // NO I18N
		jQuery(dataTarget)
			.attr('aria-expanded', !isCollapsed) // NO I18N
			.toggleClass('collapsing collapse in', !isCollapsed) // NO I18N
			.delay(50)
			.removeClass('collapsing')
			.queue(function (next) {
                const $self = jQuery(this);
				$self.toggleClass('collapsing collapse') // NO I18N
				next();
				$self.delay(50).removeClass('collapsing');
			});
	}
};

/* ========================================================================
  SDP-DESIGN OVERWRITE JS
* ======================================================================== */
function bsmenu_show(){
    jQuery('ul.sdmenu-dd').off('*.sdmenudd', '[data-switch=sdmenu]').on('click.sdmenudd','[data-switch=sdmenu]', function (e) {//NO I18N
        e.preventDefault();
        // e.stopPropagation();
        var btnParent = this.parentElement; //refers button parent element
        stopCloseDropdown(btnParent,true);//to stop close dropdown
        const $self = jQuery(this);
        $self.parent().siblings().removeClass('open');//NO I18N
        $self.parent().toggleClass('open');//NO I18N
        if($self.parents('ul.sdmenu-dd').length > 0){
            if($self.parent().hasClass('open')){
                $self.parent().trigger('shown.sdp.sdmenu');
            }
            else{
                $self.parent().trigger('hidden.sdp.sdmenu');
            }
            const chosSettings = $self.parents('li.column-chos-setting');
            if($self.parents('li.column-chos-setting').length > 0){
                chosSettings.find('button#columnsort').hide();
            }
        }
    });
}
jQuery(document).ready((e) => {
	const browserDir = jQuery("body").css("direction").toLowerCase(); // NO I18N
	let btnClass;
   /*  bsmenu_show();
	jQuery(document).off('click.docclick').on('click.docclick',function(){
        bsmenu_show();
    }); */
    bsmenu_show();
    jQuery(document).off('mouseenter.docclick').on('mouseenter.docclick','ul.sdmenu-dd',function(){
        bsmenu_show();
    });
    
	show_bs_menu();
	show_close_menu();


	/* Hide actions menu on mouselave of the row */
	if (jQuery('.listview').length != 0) {//NO I18N
		menuScroll();
	}

	// By default, sdp select box component does not swap the existing selected value with currently choosen option value.
	// The script below will do swap the values and also pass the color indicator values to selected value, if color is defined.
    jQuery('.sdmenu-dd-picker').off('click.menu-picker','> li > a').on('click.menu-picker','> li > a',function(){ // NO I18N
        const $self = jQuery(this);
		const selText = $self.text();
		// NOTE: If we use 'data' instead of 'attr' then the value does not getting updated. Need to check why.
		const selBg = $self.attr('data-background');//NO I18N
		const parent = $self.closest('ul').prev("a[data-switch='sdmenu']");//NO I18N
		const parentBg = parent.attr('data-background');//NO I18N
		const indicator = parent.prev('em');//NO I18N
		btnClass = parent.is('button') ? 'btn sdmenu-toggle ' : ''; // NO I18N
		parent.html(`${selText} <em class="caret"></em>`).attr({//NO I18N
			'data-background': selBg//NO I18N
		});
		$self.attr('data-background', parentBg);//NO I18N
		if (indicator.length == 1) { indicator.css('background-color', selBg) }//NO I18N
		/* Request Actions Menu Fix */
		$self.parent().closest('div').toggleClass('open');//NO I18N
	});

    jQuery('.sdmenu-dd-options').off('click.menu-options','> li > a').on('click.menu-options','> li > a',function(){ // NO I18N
        const $self = jQuery(this);
		const selText = $self.text();
		const parent = $self.closest('ul').prev("span[data-switch='sdmenu']");//NO I18N
		const parentText = parent.text(); // GET
		btnClass = parent.is('button') ? 'btn sdmenu-toggle ' : ''; // NO I18N
		parent.html(`${selText} <em class="caret"></em>`);
		$self.text(parentText);
		/* Request Actions Menu Fix */
		$self.parent().closest('div').toggleClass('open');//NO I18N
	});

	// Center Positioning Sdmenu Menu
	document.querySelectorAll('ul.sdmenu-dd.pull-center').forEach(function (element) {//NO I18N
        const curElement = jQuery(element);
		const parentWidth = curElement.parent().innerWidth();
		const menuWidth = curElement.innerWidth();
		let margin = (parentWidth / 2) - (menuWidth / 2);
		margin += "px";//NO I18N
		if (browserDir == 'ltr') {
			curElement.css("margin-left", margin);//NO I18N
		}
		else {
			curElement.css("margin-right", margin);//NO I18N
		}
	});
});
function show_close_menu() {
    const showmenupopup = jQuery('.showmenupopup');
	if (showmenupopup.length != 0) {
		showmenupopup.off('click.showmenpop').on({ // NO I18N
			"shown.sdp.sdmenu": function () { this.closable = false; }, // NO I18N
			"click.showmenpop": function () { // NO I18N
				this.closable = true;
				if (jQuery(this).attr('data-name') == 'close') {
					showmenupopup.removeClass('open'); // NO I18N
				}
			},
			"hide.sdp.sdmenu": function () { return this.closable; } // NO I18N
		});
	}
}
function show_bs_menu() {
	/* Prevent hiding Filtermenu on clicking over or inside it */
	jQuery('.showmenu').off('click.showbsmenu').on('click.showbsmenu', (event) => {//NO I18N
        //  Add the `data-sdmenu="prevent-bsmenu"` attribute to the element that will perform the close operation.
        let hasDataAttribute = jQuery(event.target).closest('*[data-sdmenu="prevent-bsmenu"]').length > 0;
		if(!hasDataAttribute){
            let events = jQuery._data(document, 'events') || {};//NO I18N
            events = events.click || [];
            for (const eventElement of events) {
                if (eventElement.selector) {

                    //Check if the clicked element matches the event selector
                    if (jQuery(event.target).is(eventElement.selector)) {
                        eventElement.handler.call(event.target, event);
                    }

                    // Check if any of the clicked element parents matches the 
                    // delegated event selector (Emulating propagation)
                    Array.from(jQuery(event.target).parents(eventElement.selector)).forEach(function(parent) {
                        sbshandleEvent.call(parent,event,eventElement);
                    });
                }
            }
            var $elem = jQuery(event.target).parents('.sdmenu-dd');//NO I18N
            $elem.parent().one('hide.sdp.sdmenu',function(evt){
                evt.preventDefault();
            });
        }
	});
}

function sbshandleEvent(event,eventElement) {
    eventElement.handler.call(this, event);
}

function menuScroll() {
	const tr = jQuery('.listview').find('tbody tr');//NO I18N
	const divBlk = jQuery('.listview').find('.tablelist .table-blk'); // NO I18N
	const scrollDiv = jQuery(".tablelist"); // NO I18N

	tr.find('.menutoggle').off('click.trElement','button').on('click.trElement','button', function () {//NO I18N
		const btn = jQuery(this);
		//btn.uitooltip('disable');//NO I18N
		jQuery(this).closest('tr').off('mouseleave.mtoggle').on('mouseleave.mtoggle', () => {//NO I18N
			if (btn.closest('.menutoggle').hasClass('open')) {//NO I18N
				setTimeout(() => {
					btn.closest('.menutoggle').removeClass('open');//NO I18N
					//btn.uitooltip('enable');//NO I18N
				}, 500);
			}
		});
		scrollDiv.animate({ scrollTop: scrollDiv.height() }, 1000);
	});

	divBlk.find('.menutoggle').off('click.divBlkElement','button').on('click.divBlkElement','button', function () {//NO I18N
		const btn = jQuery(this);
		//btn.uitooltip('disable');//NO I18N
		jQuery(this).closest('.table-blk').off('mouseleave.metoggle').on('mouseleave.metoggle', () => {//NO I18N
			if (btn.closest('.menutoggle').hasClass('open')) {//NO I18N
				setTimeout(() => {
					btn.closest('.menutoggle').removeClass('open');//NO I18N
					//btn.uitooltip('enable');//NO I18N
				}, 500);
			}
		});
		const boolenData = scrollDiv.height() < (btn.closest('.table-blk').position().top + btn.closest('.menutoggle').find('ul').height() + 20); // NO I18N
		boolenData ? scrollDiv.animate({ scrollTop: (scrollDiv.scrollTop() + btn.closest('.menutoggle').find('ul').height()) }, 1000) : ''; // NO I18N
	});
}

/* ========================================================================
  SDP-DESIGN ALERT JS
* ======================================================================== */
// Immediate function to initialize the alert plugin with jQuery passed as an argument.
+function ($) {
    'use strict'; // Enable strict mode for JavaScript.

    // Selector for elements that will dismiss alerts.
    var dismiss = '[data-switch="sdalert"]'

    // Alert class definition
    class Alert {
      // Constructor takes an element and binds the click event on the element with the dismiss selector.
      constructor(el) {
        $(el).on('click', dismiss, this.close);
      }

      // Close method to close the alert.
      close(e) {
        var $this = $(this); // jQuery object of the clicked element.
        var selector = $this.attr('data-target'); // Get the data-target attribute which corresponds to the ID of the alert.
        
        // If there is no data-target attribute, fallback to using href attribute.
        if (!selector) {
          selector = $this.attr('href');
          // Strip off any URL before # sign (for IE7 support).
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
        }
        
        // In case the selector is just "#", create an empty jQuery object instead.
        selector = selector === '#' ? [] : selector;
        // Find the actual alert in the DOM.
        var $parent = $(document).find(selector);

        // Prevent the default action if it's a link or button.
        if (e) e.preventDefault();

        // If the above methods didn't find an element, try to find the closest parent with class 'alert'.
        if (!$parent.length) {
          $parent = $this.closest('.alert');
        }
        
        // Trigger a custom event on the alert before closing it.
        $parent.trigger(e = $.Event('close.sdp.alert'));
        
        // If the event was prevented by any listener, don't proceed with closing.
        if (e.isDefaultPrevented()) return;

        // Remove the "in" class which would be controlling the showing of alert.
        $parent.removeClass('in');

        // Detach the alert from DOM, trigger the closed event, then remove it completely.
        $parent.detach().trigger('closed.sdp.alert').remove();
      }
    }
  
    // Plugin definition to handle instantiation and method calls on the Alert.
    function Plugin(option) {
      return this.each(function () {
        var $this = $(this); // Current element to apply the plugin.
        var data  = $this.data('sdp.alert'); // Fetch existing alert data bound to the element.
  
        // If there's no alert data, create a new instance of Alert for the element.
        if (!data) $this.data('sdp.alert', (data = new Alert(this)));
        
        // If an option is provided as a string, call the corresponding method on the instance of Alert.
        if (typeof option == 'string') data[option].call($this);
      })
    }
  
    // Store previous version of the `alert` method to allow noConflict mode.
    var old = $.fn.alert;
  
    // Define the new Alert plugin on the jQuery prototype. 
    $.fn.alert             = Plugin;
    // Attach the constructor to the plugin allowing access to Alert class outside.
    $.fn.alert.Constructor = Alert;
    // noConflict method to revert the $.fn.alert namespace to its previous owner.
    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this;
    }

    // Event listener to bind the close method to click events matching the dismiss selector.
    $(document).on('click.sdp.alert.data-api', dismiss, Alert.prototype.close);
  
}(jQuery); // Pass jQuery into the self-invoking function.
