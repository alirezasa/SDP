// Accessibility JS Code
const accessibilitiesSlider = {
	/**
	 * Initializes the search functionality for accessibility controls.
	 * Binds an input event to the search input field to filter the accessibility list.
	*/
	search() {
		// Target the search input field directly by its ID 'search-acntrls'
		const $searchInput = jQuery('#search-acntrls');
		// Target the accessibility list by its ID 'aclist'
		const $aclist = jQuery('#aclist');
  
		// Bind the 'input' event to the search input
		$searchInput.off('input.acntrls').on('input.acntrls', function () {
			// Get the value entered in the search input, convert it to lowercase, and trim whitespace
			const searchValue = jQuery(this).val().toLowerCase().trim();
  
			// If there is no search value, show all items and hide 'no results' message
			if (searchValue.length < 1) {
				// Remove the 'hide' class from list items and collapsible panels
				$aclist.find('li, z-collapsiblepanel').removeClass('hide');
				// Also, show all collapsible panels
				$aclist.find('z-collapsiblepanel').removeClass('hide');
				// Hide the 'no results' message
				jQuery('#no-results-message').addClass('hide');
				// Reset the border of list items within collapsible panels
				$aclist.find('z-collapsiblepanel li').css('border-bottom', '');
				return; // Exit early if no search value
			}
  
			// Iterate over each list item in the accessibility list
			$aclist.find('li').each(function () {
				// Get the text content of each item that is marked as a search element
				const text = jQuery(this).find('*[data-accessibility="search-element"]').text().toLowerCase();
				// Create a regular expression for matching the search value
				const regex = new RegExp(searchValue);
				// Toggle the 'hide' class based on whether the item matches the search
				jQuery(this).toggleClass('hide', !regex.test(text));
			});
			
			// Iterate over each collapsible panel header
			$aclist.find('z-cpheading').each(function () {
				// Get the text content of each panel header
				const text = jQuery(this).find('*[data-accessibility="search-header"]').text().toLowerCase();
				// Create a regular expression for matching the search value
				const regex = new RegExp(searchValue);
				// Toggle the 'hide' class based on whether the header matches the search
				if(regex.test(text)){
					// Get the closest collapsible panel and show it
					const closestPanel = jQuery(this).closest('z-collapsiblepanel');
					closestPanel.removeClass('hide');
					closestPanel.find('li').css('border-bottom', '').removeClass('hide');
				}
			});
      
			// Update the visibility of collapsible panels based on search results
			accessibilitiesSlider.updatesearch();
		});
	},

	/**
	 * Updates the visibility of collapsible panels based on the search results.
	 * Shows or hides the "no results" message based on the visibility of panels.
	*/
	updatesearch() {
		// Target the accessibility list by its ID 'aclist'
		const $aclist = jQuery('#aclist');
		// Target the "no results" message by its ID
		const $noResultsMessage = jQuery('#no-results-message');
  
		// Iterate over each collapsible panel
		$aclist.find('z-collapsiblepanel').each(function () {
			// Get all visible items (not hidden)
			const $visibleItems = jQuery(this).find('li:not(.hide)');
			// If there are visible items, show the collapsible panel and reset the borders
			if ($visibleItems.length > 0) {
				jQuery(this).removeClass('hide');
				$visibleItems.css('border-bottom', ''); // Reset border
				$visibleItems.last().css('border-bottom', 'none'); // Style last visible item
				return;
			}
			// If no visible items, hide the collapsible panel
			jQuery(this).addClass('hide');
		});
		// If all collapsible panels are hidden, show the "no results" message
		if ($aclist.find('z-collapsiblepanel').length === $aclist.find('z-collapsiblepanel.hide').length) {
			$noResultsMessage.removeClass('hide');
		} else {
			$noResultsMessage.addClass('hide');
		}
	},

	/**
	 * Toggles the accessibility settings based on user input.
	 * Updates the CLIENT_CONF object and applies the changes.
	*/
	toggleaccessibilty(cur) {
		// Get the current element the user interacted with
		const $cur = jQuery(cur);
	
		// Initialize default Accessibility configuration if not already set
		sdp_user.CLIENT_CONF.Accessibility = sdp_user.CLIENT_CONF.Accessibility ? sdp_user.CLIENT_CONF.Accessibility : {
			mode: false,
			contrast: false,
			underline: false,
			animation: false,
			tabfocus: false,
			showhover: false,
			emphasizefocus: false,
			customscroll: false,
			customcursor: false,
			fontsize: "fs-normal", // NO I18N
			adhd: false,
			astigmatism: false,
			blindness: false,
			colorblind: false,
			dyslexia: false,
			epilepsy: false,
			olderusers: false,
			lowvision: false,
			motodisability: false,
			seizure: false,
			bottombar: false,
		};
	
		// Extract the current accessibility configuration
		const clientAccessibility = sdp_user.CLIENT_CONF.Accessibility;
		const Accessibility = {
			mode: clientAccessibility.mode,
			contrast: clientAccessibility.contrast,
			underline: clientAccessibility.underline,
			animation: clientAccessibility.animation,
			tabfocus: clientAccessibility.tabfocus,
			showhover: clientAccessibility.showhover,
			emphasizefocus: clientAccessibility.emphasizefocus,
			customscroll: clientAccessibility.customscroll,
			customcursor: clientAccessibility.customcursor,
			fontsize: clientAccessibility.fontsize,
			adhd: clientAccessibility.adhd,
			astigmatism: clientAccessibility.astigmatism,
			blindness: clientAccessibility.blindness,
			colorblind: clientAccessibility.colorblind,
			dyslexia: clientAccessibility.dyslexia,
			epilepsy: clientAccessibility.epilepsy,
			olderusers: clientAccessibility.olderusers,
			lowvision: clientAccessibility.lowvision,
			motodisability: clientAccessibility.motodisability,
			seizure: clientAccessibility.seizure,
			bottombar: clientAccessibility.bottombar
		};
		
		let val;
		// If the current element is a checkbox, update the corresponding Accessibility property
		if (cur.type === "checkbox") {
			val = $cur.attr("name");      
			Accessibility[val] = $cur.prop("checked");
		} 
		// If it's a radio button, update the corresponding Accessibility property
		else if (cur.type === "radio") {
			val = $cur.val();
			const prop = $cur.attr("name");
			Accessibility[prop] = val;
		}
		
		// Update the global client configuration
		sdp_user.CLIENT_CONF.Accessibility = Accessibility;
	
		// Update the UI based on the new settings
		accessibilitiesSlider.paramswitch(val, $cur.prop("checked"));
	},

	/**
	 * Switches accessibility parameters based on the type and state.
	 * Applies or removes CSS classes to enable or disable accessibility features.
	*/
	paramswitch(type, is_checked) {
		// Target iframe elements in the page
		const iframeSelector = jQuery('iframe');
		const rootSelector = jQuery('html');
		// Define the class names related to accessibility features
		const Classess = "a11ymode-body a11y-underline a11y-contrast a11y-animation a11y-showhover a11y-tabfocus a11y-emphasizefocus a11y-customscroll a11y-customcursor a11y-fs-normal a11y-fs-large a11y-fs-xlarge";  // NO I18N
		let cls = null;
		let person = null;
		const jB = jQuery("body");

		// Check the current accessibility settings to toggle
		const isAccessibility = jB.find("#a11ymodeSwitch [data-a11ycheck]:checked").length > 0 || !(jB.find("#a11ymodeSwitch [value=fs-normal]:checked").length);
		// Set the checkbox state and update the global Accessibility mode
		jB.find("[name=a11ymode]").prop("checked", isAccessibility);
		sdp_user.CLIENT_CONF.Accessibility.mode = isAccessibility;
		
		// Save the updated Accessibility configuration
		addPersonalization("Accessibility", sdp_user.CLIENT_CONF.Accessibility, true, {'is_portalspecific':'false'}); // NO I18N
		const accessibilitySettings  = {'contrast':"a11y-contrast",'underline':"a11y-underline",'animation':"a11y-animation",'tabfocus':"a11y-tabfocus",'showhover':"a11y-showhover",'emphasizefocus':"a11y-emphasizefocus",'customscroll':"a11y-customscroll",'customcursor':"a11y-customcursor",'fs-normal':"a11y-fs-normal",'fs-large':"a11y-fs-large",'fs-xlarge':"a11y-fs-xlarge"};
		const accessibilityConditions = {adhd:"adhd",astigmatism:"astigmatism",blindness:"blindness",colorblind:"colorblind",dyslexia:"dyslexia",epilepsy:"epilepsy",olderusers:"olderusers",lowvision:"lowvision",motodisability:"motodisability",seizure:"seizure"};


		// Check if there is a matching class or condition
		if (accessibilitySettings[type]) {
			cls = accessibilitySettings[type];
		}
		else if(accessibilityConditions[type]){
			person = accessibilityConditions[type];
		}

		// Apply accessibility settings if enabled
		if (commonAccessibilities.isAccessibilityEnabled()) {
			if (is_checked) {
				// Apply the features specific to the person's accessibility needs
				if (person) {
					cls = '';

					const accessibilityFeatures = {
						'tabfocus': ["adhd", "dyslexia", "motodisability"],
						'underline': ["adhd", "lowvision"],
						'contrast': ["colorblind", "epilepsy", "lowvision"],
						'animation': ["epilepsy", "seizure"],
						'showhover': ["adhd", "dyslexia", "motodisability", "blindness"],
						'emphasizefocus': ["motodisability"],
						'customcursor': ["lowvision"],
						'nightmode input': ["colorblind", "epilepsy"]
					};

					// Enable specific features based on conditions
					Object.keys(accessibilityFeatures).forEach((feature) => {
						if (accessibilityFeatures[feature].includes(person)) {
							const input = feature === 'nightmode input' ? jB.find(`#${feature}`) : jB.find(`[name="${feature}"]`);
							if (!input.prop("checked")) {
								input.prop("checked", true).trigger("change");
							}
						}
					});
					
					// Ensure that font size is set for specific conditions
					if((person == "astigmatism" || person == "olderusers" || person == "lowvision") && (jB.find("[value=fs-xlarge]").prop("checked")==false)){
						jB.find("[value=fs-xlarge]").prop("checked",true).trigger("change");
					}
					// Adjust other settings for specific accessibility needs
					if((person == "blindness" || person == "motor") && jB.find("#kb_status").hasClass("kbsc-disabled")){
						jB.find("#kb_stsTxt").prop("checked",true).trigger("change");
					}
				}

				// Apply font size-related classes
				if (cls && cls.includes("a11y-fs")) {
					rootSelector.removeClass("a11y-fs-normal a11y-fs-large a11y-fs-xlarge");
					iframeSelector.contents().find("body").removeClass("a11y-fs-normal a11y-fs-large a11y-fs-xlarge");
				}
				rootSelector.addClass(cls);
				iframeSelector.contents().find("body").addClass(cls);
			} else {
				// Remove features if unchecked
				if (person) {
					const removeFeature = (feature, datasetAttr) => {
						const input = feature === 'nightmode input' ? jB.find(`#${feature}`) : jB.find(`[name="${feature}"]`);
						if (!jB.find(`input[${datasetAttr}]:checked`).length && input.prop("checked")) {
							input.prop("checked", false).trigger("change");
						}
					};

					// Remove specific features for each condition
					const featureMapping = {
						'tabfocus': "data-focusring",
						'underline': "data-underline",
						'contrast': "data-contrast",
						'animation': "data-animation",
						'showhover': "data-hovercontent",
						'emphasizefocus': "data-emphasize",
						'customcursor': "data-cursor",
						'nightmode input': "data-nightmode"
					};

					// Iterate over each feature and remove it if necessary
					Object.keys(featureMapping).forEach((feature) => {
						removeFeature(feature, featureMapping[feature]);
					});

					// Reset font size if no input with `data-fontsize` is checked and `fs-xlarge` is selected
					if (!jB.find("input[data-fontsize]:checked").length && jB.find("[value=fs-xlarge]").prop("checked")) {
						jB.find("[value=fs-normal]").prop("checked", true).trigger("change");
					}
				}
	
				// Remove the accessibility classes
				rootSelector.removeClass(cls);
				iframeSelector.contents().find("body").removeClass(cls);
			}
		} else {
			// If accessibility is not enabled, remove all classes
			rootSelector.removeClass(Classess).addClass('a11y-fs-normal');
			iframeSelector.contents().find("body").removeClass(Classess).addClass('a11y-fs-normal');
		}
		// Trigger a resize of the header for font size customization
		if (cls && cls.includes("a11y-fs")) {
			jQuery(window).trigger('resize');
		}
	},

	/**
	 * Customizes the font size based on user selection.
	*/
	fontcustomize(cur) {
		// Toggle the accessibility setting when font size is customized
		accessibilitiesSlider.toggleaccessibilty(cur);
		const curEle = jQuery(cur);
		// Mark the selected font size as active
		curEle.closest('.fs-radio-group').find('.fs-btn').removeClass('active');
		// Highlight the button for the selected font size
		curEle.next().addClass('active');
	},

	/**
	 * Initializes the accessibility slider by setting up the search functionality and tooltips.
	*/
	init() {
		// Initialize the search functionality
		this.search();
		// Initialize tooltips for accessibility controls
		initTooltip('.acntrls-panel');
	},

	/**
	 * Closes the accessibility slider dialog.
	*/
	closeSlider() {
		// Close the accessibility settings panel dialog
		jQuery("#SlideAccessPanelHTML").dialog("close");
	},
};
