/* $Id$ */
var success = 0;
/**
 * APIactions is an object containing various utility methods for handling API-related actions
 * such as loading pages, validating forms, resizing elements, toggling sidebar links, and
 * implementing search functionality.
 */
var APIactions = {
	/**
	 * Loads an HTML page into the #api-section div. If the load fails, it defaults to the API intro page.
	 * Also sets up form validation and input restrictions.
	 * 
	 * @param {string} url - The URL of the HTML page to load.
	 */
	loadAPIpage: function (url) {
		jQuery('#api-section').load(url, function (response, status) {	//No I18N
			if (status == "error") {
				APIactions.loadAPIpage('/html/doctool/api-intro-page.html');//No I18N
			}
			APIactions.resize();

			// Validate on blur
			jQuery('.api-form input.req_field').on("blur", function () {	//No I18N
				if (!jQuery(this).val().trim()) {
					jQuery(this).parent().addClass('has-error');
				}
				else { jQuery(this).parent().removeClass('has-error'); }
			});

			// Number Input
			jQuery('.api-form input.req_field').on("keypress", function (evt) {	//No I18N
				var theEvent = evt || window.event;
				key = theEvent.which;
				regex = /[0-9]|\./;
				key = String.fromCharCode(key);

				if (!regex.test(key)) {
					theEvent.returnValue = false;
					if (theEvent.preventDefault) { theEvent.preventDefault(); }
				}
			});
		});
	},
	/**
	 * Validates if all mandatory fields in the given API panel are filled.
	 * Highlights fields with errors and focuses on the first invalid field.
	 * 
	 * @param {string} apiPanel - The selector for the API panel to validate.
	 */
	validate: function (apiPanel) {

		jQuery(apiPanel + ' .api-form li').removeClass('has-error');	//No I18N
		var fields = true;
		fields = !jQuery(apiPanel + ' .api-form input.req_field').toArray().some(input => {
			return !jQuery(input).val().trim();
		});

		if (fields) {
			success = 1;
		}
		else {
			success = 0;
			jQuery(apiPanel + ' .api-form input.req_field').each(function () {	//No I18N
				if (!jQuery(this).val().trim()) {
					jQuery(this).parent().addClass('has-error');
					jQuery(this).focus();
				}
			});
		}
	},
	/**
	 * Adjusts the height of the .api-form textarea based on the window height.
	 * Ensures proper resizing for different screen sizes.
	 */
	resize: function () {

		// .api-form textarea height
		var h = jQuery(window).height();
		var x = h - 666;
		var l = jQuery('.api-form ul li').length;	//No I18N
		if (h > 666) {
			jQuery('.api-form textarea').height(150 + x);	//No I18N
			if (l > 3) { jQuery('.api-form textarea').height(75 + x); }
		}
	},
	/**
	 * Toggles the active and opened states of sidebar links.
	 * Handles navigation and scrolling behavior for sidebar elements.
	 * 
	 * @param {HTMLElement} element - The sidebar link element to toggle.
	 */
	toggleSidebarLinks: function (element) {

		if (jQuery('#sidebar-nav').hasClass('searching')) {
			jQuery('#sidebar-nav').find('a').removeClass('active')	//No I18N
		}
		if (jQuery(element).parent().hasClass('opened')) {
			jQuery(element).closest('ul').find('li,a').removeClass('active opened').end().end()	//No I18N
				.addClass('active');
		}
		else {
			jQuery(element).closest('ul').find('li,a').removeClass('active opened').end().end()	//No I18N
				.addClass('active').parent('li').addClass('opened');//No I18N
		}

		if (jQuery(element).parent().hasClass('has-child') && jQuery(element).parent().hasClass('opened')) {
			jQuery(element).blur().focus();
			if (jQuery('.api-sidebar .opened').eq(-1).offset().top > 200) {
				jQuery('#sidebar-nav, #sidebar-nav>.nav-stacked').scrollTop(jQuery('#sidebar-nav, #sidebar-nav>.nav-stacked').scrollTop() + 100);//No I18N
			}
		}
	},
	/**
	 * Sets up a search attribute for table rows and filters rows based on user input.
	 * 
	 * @param {HTMLElement} el - The input element used for searching.
	 */
	searchAttrs: function (el) {

		jQuery(el).closest('tbody').find('tr').each(function () {	//No I18N
			jQuery(this).attr('data-search', jQuery(this).find('label').eq(0).text().toLowerCase());	//No I18N
		});

		jQuery(el).off("keyup").on("keyup", function () {	 //No I18N
			var val = jQuery(this).val().toLowerCase();
			sn = jQuery(el).closest('tbody');	//No I18N
			sn.find('tr:not(:nth-child(2))').hide(); //No I18N
			sn.find('tr').each(function () {
				var data = jQuery(this).attr('data-search');	//No I18N
				if (data.indexOf(val) >= 0) {
					jQuery(this).show();
				}
			});

		});
	},
	/**
	 * Toggles the visibility of the table search input and activates the search functionality.
	 * 
	 * @param {HTMLElement} el - The element triggering the table search toggle.
	 */
	callTableSearch: function (el) {

		var a = jQuery(el).closest('table').find('.api-table-search');//No I18N

		if (!jQuery(el).hasClass('active')) {
			APIactions.searchAttrs(a.find('input'));
			jQuery(el).addClass('active');
			a.show().find('input').focus();
		}
		else {
			jQuery(el).removeClass('active');
			a.hide();
		}
	}
};

jQuery(document).ready(function () {
    /** Adjust textarea height based on window resize */
	jQuery(window).resize(function () {
		// .api-form textarea height,Calculate height adjustment
		var h = jQuery(window).height();
		var x = h - 666;
		var l = jQuery('.api-form ul li').length;	//No I18N
		if (h > 666) {
			jQuery('.api-form textarea').height(150 + x);	//No I18N
			if (l > 3) {
				jQuery('.api-form textarea').height(75 + x);    	//No I18N
			}
		}
	});
	/* Load the home page content */
	APIactions.loadAPIpage('/html/doctool/api-intro-page.html');//No I18N
	/** Initialize nice scroll for the sidebar */
	jQuery(".api-sidebar").niceScroll({ cursorwidth: "8px", cursorcolor: "#a0a0a0", zindex: 9 }); //No I18N
    /** Resize nice scroll on mouseover */
	jQuery(".api-sidebar").mouseover(function () {	//No I18N
		jQuery(".api-sidebar").getNiceScroll().resize();	//No I18N
	});
	/** Toggle visibility of output/tasks section */
	jQuery(document).on('click', '.show-attr', function () { //No I18N
        /** Toggle button text */
		jQuery(this).text(function (i, text) {
			return text === translate("admin.meproducts.action.map.fields", [translate("ae.cmdb.cirelationships.attributes")]) + " >>" ? translate("doctool.show.attributes", [translate("ae.cmdb.cirelationships.attributes")]) + " >>" : translate("admin.meproducts.action.map.fields", [translate("ae.cmdb.cirelationships.attributes")]) + " >>"; //No I18N
		});
        /** Show/hide different sections based on conditions */
		if (jQuery('#api-section .attr-list')[0].style.display === 'none') {
			jQuery('#api-section .attr-list').show();	//No I18N
			APISection.hideOtherElements(['attr-list']);	//No I18N
		}
		else if (jQuery('#api-section').find('.api-response')[0] && jQuery('#api-section').find('.api-response')[0].innerHTML != '') {
			jQuery('#api-section .api-response').show();	//No I18N
			APISection.hideOtherElements(['api-response']);	//No I18N
		}
		else if (jQuery('#api-section .check-output')[0]) {
			jQuery('#api-section .check-output')[0].style.display = '';
			APISection.hideOtherElements(['check-output']);	//No I18N
		}
		else {
			jQuery('#api-section .attr-list')[0].style.display = 'none';
		}
         /**Toggle background and resize */
		jQuery('#api-section .preview-panel').toggleClass('white-bg'); //No I18N
		APIactions.resize();
	});
	/**Handle "Try Now" button click to show response body */
	jQuery(document).on('click', '#tryNowBtn', function () { //No I18N
		var apiPanel = '#api-section';//No I18N
		APIactions.validate(apiPanel);

		if (success) {

			try { APISection.createResponse(apiPanel); } catch (ex) { alert(ex); }

			jQuery(apiPanel + ' .api-response').show();	//No I18N
			jQuery(apiPanel + ' .check-output').remove();	//No I18N

			APISection.hideOtherElements(['api-response']);	//No I18N

			jQuery(apiPanel + ' .preview-panel').removeClass('white-bg');	//No I18N
			jQuery(apiPanel + ' .show-attr').addClass('opened');	//No I18N
			if (jQuery(apiPanel + ' .show-attr')[0]) {
				jQuery(apiPanel + ' .show-attr')[0].textContent = translate("doctool.show.attributes", [translate("ae.cmdb.cirelationships.attributes")]) + " >>"; //No I18N
			}
		}
	});
	/** Initialize sidebar search links */
	setTimeout(function () {
		jQuery('#sidebar-nav li').each(function () {	//No I18N
			jQuery(this).attr('data-search', jQuery(this).find('>a').text().toLowerCase());	//No I18N
		});
	}, 1000);
	/** Handle sidebar search input */
	jQuery('#api-search>input').off("keyup").on("keyup", function () {	//No I18N

		var val = jQuery(this).val().toLowerCase();
		if (!jQuery(this).val()) { jQuery(this).next('span').hide(); }
		else { jQuery(this).next('span').show(); }	//No I18N
		sn = jQuery('#sidebar-nav');	//No I18N

		if (val) { sn.addClass('searching'); jQuery('#sidebar-nav, #sidebar-nav>.nav-stacked').scrollTop(0) }
		else { sn.removeClass('searching'); }

		/** Highlight matching items */ 
		sn.find('li').removeClass('has-keyword').parentsUntil('#sidebar-nav').removeClass('has-data');//No I18N
		sn.find('li').each(function () {
			var data = jQuery(this).attr('data-search');	//No I18N
			if (data && data.indexOf(val) >= 0) {
				jQuery(this).addClass('has-keyword').parentsUntil('#sidebar-nav').addClass('has-data');//No I18N
			}
		});

	});

	/** Clear search input on span click */
	jQuery('#api-search span').off("click").on("click", function () {	//No I18N
		jQuery(this).hide().parent().find('input').val('');
		jQuery('#sidebar-nav').removeClass('searching').find('li').removeClass('has-keyword').parentsUntil('#sidebar-nav').removeClass('has-data');	//No I18N
	});
	/** Open dynamic table schema in a new window */
	jQuery(document).on('click', '.entity-table-name,.attr-table-data', function () {//No I18N
		var table = jQuery(this).text().split(':')[0].trim();
		encodeURI(NewWindow("/reports/report-DB-viz.jsp?tableName=" + table, 'Dynamic_table_schema', '950', '600', 'yes', 'center', 'noopener'));	//No I18N
	});
	
	/** Expand/collapse response body */
	jQuery(document).on('click', '.res-toggle-btn', function () {//No I18N
		var obj = jQuery(this),
			title = obj.attr('title'),	//No I18N
			height = 'auto';//No I18N

		obj.toggleClass('active');//No I18N

		if (obj.closest('div').attr('class') == "res-body") {
			var div = obj.closest(".res-body");//No I18N
			if (obj.hasClass('active')) {
				height = jQuery('.api-response').height() - 100;	//No I18N
			}
		}
		else {
			var div = obj.closest('li').find("#input_data");
			if (!obj.hasClass('active')) {
				height = div[0].scrollHeight;
			}
		}

		div.height(height);
        /** Update title attribute */
		obj.attr('title', (title === translate("doctool.click.expand") ? translate("doctool.click.collapse") : translate("doctool.click.expand"))); //No I18N
	});
	/** Handle SDtabs navigation */
	jQuery(document).on('click', '#api-content .nav-sdtabs>li>a', function (event) { //No I18N
		event.preventDefault();
		var id = jQuery(this).attr('href');	//No I18N
		jQuery(this).parent('li').addClass('active').siblings('li').removeClass('active'); //No I18N
		jQuery(this).closest('.attr-list').find(id).addClass('active').siblings('.sdtab-pane').removeClass('active'); //No I18N
	});
});