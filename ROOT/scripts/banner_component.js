/* $Id$ */
/**
 * BannerComponent
 * This class provides a banner.
 * The component can be initialized with custom data, container, and template.
 * The component provides methods to add, remove, and navigate banners.
 * The component also provides event handlers for banner navigation and button actions.
 * options:
 *    container - Used to render the banner
 *    data - Used to pass the data to the banner
 *        Data usage guide
 *        {
 *          type: 'info', 
 *          content_i18n: 'Banner 1 Content', //inside content of the banner
 *          icon_class: 'fas fa-info-circle', //icon for the banner 
 *          button: [{
 *            btn_class: 'btn-primary',  
 *            tooltip: true, 
 *            title: 'Close', 
 *            content_i18n: 'Remind Me later', | isHTML 
 *            type: 'button',   | link 
 *            action: () => alert('Button 1 clicked on Banner 1')
 *            actionParam:  [] | {} action callback parameters
 *            // On Close, store the value in cookie or localstorage
 *            store: {
 *              key: "close_antivirus_Customization_"+sdp_user.LOGGEDIN_USERID,
 *              days: 7,
 *              isCookie: true
 *            }
 *            cbClose: function(){} close callback 
 *            cbCloseParam: [] | {} close callback parameters
 *            tooltipAlwaysShown : true // If true, tooltip will always be shown on the button
 *          }]
 *        },
 *    template - function used to pass custom banner template or default template can be used, template contain the sdRider slide html format
 *    cbCustomBanner - Callback method has the default sdRider structure, only inside context we replace with ours
 *    showHideBanner - Button to show or hide the banner container
 *    showBannerCount - Used to show banner count in banners
 *    bannerInterval - Used to set the interval for the banners
 */
class BannerComponent {
    constructor(options) {
      this.options = options;
      this.bannerData = options.data || [];
      if(!options.container) {
        console.error('Container is not provided for the banners');
        return;
      }
      this.container = jQuery(
        options.container
      );
      this.template = options.template || this.defaultTemplate;
      this.isBannerVisible = true;
      this.showHideBanner = options.showHideBanner || false;
      this.showBannerCount = options.showBannerCount || false;
      this.cbCustomBanner = typeof options.cbCustomBanner === 'function' ? options.cbCustomBanner : null;
      this.init();
    }
  
    /**
     * Initialize the carousel.
     * This function renders the banners and initializes event handlers.
     */
    init() {
      this.renderBanners();
      this.initEvents();
    }
  
    /**
     * Render the banners using the provided or default template.
     * This function clears existing banners and appends new banners to the container.
     */
    renderBanners() {
      let bannerContainer = this.container.find(".sdrider-inner");
      if(bannerContainer.length === 0){
        this.renderBannerBody();
        bannerContainer = this.container.find(".sdrider-inner");
      }
      bannerContainer.html(""); // Clear existing banners
  
      this.bannerData.forEach((banner, index) => {
        const bannerHTML = this.template(banner, index, this);
        bannerContainer.append(bannerHTML);
      });
      if(this.bannerData.length === 0) {
        this.container.addClass('hide');
      }
      //Remove the control if only one banner
      if(this.bannerData.length === 1) {
        jQuery(this.container).find('.sdrider-control').hide();
      }
    }
  
    /**
     * Renders the HTML structure for the banner body.
     * This includes the main container, inner container for banners, and navigation controls.
     * The function sets necessary attributes and classes for the banner container.
     */
    renderBannerBody () {
      const bannerBody =  `
        <div class="banner-container">
          <div class="sdrider-inner"></div>
          <a class="left sdrider-control btn btn-default ml15" href="${this.options.container}" role="button" data-slide="prev" rel="uitip" title="${e_html(translate('sdp.common.previous'))}">
                <span class="cspr icon-sm chevron-left flat left1 flip-x" aria-hidden="true"></span>
          </a>
          <a class="right sdrider-control btn btn-default mr15" href="${this.options.container}" role="button" data-slide="next" rel="uitip" title="${e_html(translate('common.next'))}">
              <span class="cspr icon-sm chevron-right flat left4 flip-x" aria-hidden="true"></span>
          </a>
        </div>
      `
      this.container.html(bannerBody);
      this.container.find('.banner-container').addClass('sdrider slide band-slide p0');
    }
  
    /**
     * Default banner template if no custom template is passed.
     * This function generates the HTML for a banner based on the provided data.
     * @param {Object} banner - The banner data.
     * @param {number} index - The index of the banner.
     * @returns {string} - The HTML string for the banner.
     */
    defaultTemplate(banner, index, context) {
      /**Icon  */
      let iconHTML = "";
      let bannerType = banner.type || 'info'; // No I18N
      if (banner.icon_class) {
        iconHTML += `<span class="${banner.icon_class} top0 mr5 minw-20px"></span>`;
      }
      /** Button  */
      let btnHTML = "";
      if (banner.buttons && banner.buttons.length > 0) {
        banner.buttons.forEach(function (btn, btnIndex) {
          let btnClass = btn.btn_class ? btn.btn_class : 'btn-primary'; // No I18N
          let btnContent = btn.isHTML
            ? btn.content_i18n
            : btn.content_i18n
            ? e_html(translate(btn.content_i18n))
            : "";
          if (btn.type === "link") {
            btnHTML += `<a href="${btn.href ? btn.href : "#"}" role="link" ${btn.target ? 'target="' + btn.target + '"' : "" } class="${btnClass} ml10 maxw-120px text-overflow" title="${ btn.title ? e_attr(translate(btn.title)) : btnContent }" rel="uitip" ${btn.tooltipAlwaysShown ? '' : 'mode_ellipsis="true"'}  ${btn.isHTML ? 'mode_html="true"' : ''}>${btnContent}</a>`; // No I18N
          } else {
            btnHTML += `<button data-action=${btnIndex} class="btn ${btnClass} ml10 maxw-10per text-overflow" type="button" title="${ btn.title ? e_attr(translate(btn.title)) : btnContent }" rel="uitip" ${btn.tooltipAlwaysShown ? '' : 'mode_ellipsis="true"'} ${btn.isHTML ? 'mode_html="true"' : ''}>${btnContent}</button>`; // No I18N
          }
        });
      }
      const bannerContent = `
          <div class="item ${index === 0 ? 'active' : ''} wspace-nowwrap" data-banner-id=${  // No I18N
        banner.id
      }>
          ${!context.cbCustomBanner ?  
            `<div class="top-evalband banner-${bannerType}">
              <div class="evalcopy pl5 pr5">
                  <div class="disp-flex align-vh-center p0">
                    ${iconHTML}
                    <div class="disp-ib text-overflow banner-holder maxw-60per">
                    ${translate(banner.content_i18n)} 
                    </div>
                    ${' '}
                    ${btnHTML}
                  </div>
              </div>
              ${context.showBannerCount ? `
                <div class="slidebatch font-xsmall bg-dark text-white top0">${index+1} / ${context.bannerData.length}</div>
              ` : ''}
            </div>
            `
            : 
            context.cbCustomBanner(banner, index, context)}
          </div>
        `;
      return bannerContent;
    }
  
    /**
     * Add a new banner to the banners(slider).
     * This function appends the new banner data to the existing banners data and re-renders the banners.
     * @param {Object} newBanner - The data for the new banner.
     */
    addBanner(newBanner) {
      this.bannerData.push(newBanner);
      this.renderBanners();
    }
  
    /**
     * Remove a banner by its ID.
     * This function filters out the banner with the specified ID from the banner data and re-renders the banners.
     * @param {string} bannerID - The ID of the banner to be removed.
     */
    removeBanner(bannerID) {
      this.bannerData = this.bannerData.filter(
        (banner) => banner.id !== bannerID
      );
      this.renderBanners();
    }
  
    /**
     * Update a banner by its ID.
     * This function updates the content of the banner with the specified ID and re-renders the banners.
     * @param {string} bannerID - The ID of the banner to be updated.
     * @param {Object} updatedContent - The new content for the banner.
     */
    updateBanner(bannerID, updatedContent) {
      const bannerIndex = this.bannerData.findIndex(
        (banner) => banner.id === bannerID
      );
      if (bannerIndex > -1) {
        this.bannerData[bannerIndex] = {
          ...this.bannerData[bannerIndex],
          ...updatedContent,
        };
        this.renderBanners();
      }
    }
  
    /**
     * Initialize event handlers for the banner.
     * This function sets up event listeners for button actions and the hide/show toggle.
     */
    initEvents() {
      const _this = this;
      this.container.off('.bannercomp');
      // Handle button actions inside banners
      this.container.on("click.bannercomp", function (event) {
        const button = event.target.closest("button[data-action]");
        if (button) {
          const bannerID = button.closest(".item").dataset.bannerId;
          const actionIndex = button.dataset.action;
          _this.handleAction(bannerID, actionIndex);
        }
      });
  
      if(this.showHideBanner){
        // Handle hide/show toggle
        const toggleButton = this.container.find(".toggle-banner");
        if(toggleButton.length  === 0){
          this.container.append(`
            <div id="banner_dd_btn" class="anndropdown tc">
              <a href="/" role="button" class="disp-ib toggle-banner" title="${e_html(translate('sdp.common.collapse'))}" data-action rel="uitip">
                <div class="pl5 pr5">
                  <span class="cspr icon-sm chevron-left2 vmiddle top0"></span>
                </div>
              </a>
            </div>
          `)
          this.container.addClass('openannounce')
        }
        this.container.find('.toggle-banner').css(("RTL" == sdp_user.DIRECTION ? 'left' : 'right'), '50%')
        this.container.find('.banner-container').css('height', this.container.find('.sdrider-inner').height())
        this.container.find('.toggle-banner').on("click.bannercomp", function () {
          _this.toggleBanner();
        });
      }
  
      this.container
      .on("click.bannercomp", "[data-slide]", function (e) { // No I18N
        e.preventDefault();
        e.stopPropagation();
        const bannerContainer = _this.container.find('.banner-container')
        const slideDir = jQuery(this).attr('data-slide');
        slideDir === 'prev' ?   bannerContainer.sdRider("prev"):   bannerContainer.sdRider("next");
      })
      initTooltip('#',this.options.container)
  
      this.initDropDown();
      /**
       * init the slider(sdRider) for the banner
       */
      this.container.find('.banner-container').sdRider({interval:_this.options.bannerInterval || 5000});
    }
  
    /**
     * Handle button actions inside a banner.
     * This function triggers the action associated with the button in the banner.
     * @param {string} bannerID - The ID of the banner containing the button.
     * @param {number} actionIndex - The index of the button within the banner.
     */
    handleAction(bannerID, actionIndex) {
      const banner = this.bannerData.find((banner) => banner.id === bannerID);
      if(!banner || !banner.buttons) return;
      const button = banner.buttons[actionIndex];
      if(!button) return;

      // Handle close action
      if (button.action && button.action === "close") {
        this.removeBanner(bannerID);
        if (typeof button.cbClose === 'function') {
          button.cbClose(button.cbCloseParam ? button.cbCloseParam : []);
        } else if (typeof button.cbClose === 'string') {
          execFuncByName(
            button.cbClose,
            window,
            ...(button.cbCloseParam ? button.cbCloseParam : [])
          );
        }
        button.store && this.cbStore(button.store);
        return;
      }


      if (button && typeof button.action === "function") {
        button.action(button.actionParam || []);
      } else if(typeof button.action === "string") {
        execFuncByName(
          button.action,
          window,
          ...(button.actionParam ? button.actionParam : [])
        )
      }
  
     
    }
  
    /**
     * Callback function to store data after closing a banner.
     * @param {Object} store - Configuration object for storing data.
     * allowed params key | days | isCookies
     */
    cbStore(store) {
      const key = store.key,
        days = store.days,
        isCookie = store.isCookie || false,
        value = store.value || true;
      if (key && days) {
        Store.setItem({ key: key, value: value, isCookie: isCookie, days: days });
      }
    }
  
    /**
     * Toggle the banner visibility.
     * This function toggles the visibility of the banner and updates the toggle button text
     */
    toggleBanner() {
      const bannerContainer = this.container.find('.banner-container');
      if (this.isBannerVisible) {
        this.container.removeClass("openannounce");
        bannerContainer.slideToggle()
        this.isBannerVisible = false;
        this.container.find('#banner_dd_btn a').uitooltip({"content":e_html(translate('sdp.common.expand'))}).attr("title", e_html(translate('sdp.common.expand')));
      } else {
        bannerContainer.slideToggle();
        this.container.addClass("openannounce");
        this.isBannerVisible = true;
        this.container.find('#banner_dd_btn a').uitooltip({"content":e_html(translate('sdp.common.collapse'))}).attr("title", e_html(translate('sdp.common.collapse')));
      }
    }
  
    initDropDown(){
      const _self = this;
      setTimeout(() => {
        // Handling for overflown context in banner
        const bannerDiv = _self.container.find('.item.active');
        if (!bannerDiv.attr('b_dropdown')) {
          const context = bannerDiv.find('.banner-holder').get(0);
          if (context && checkOverflow(context)) {
            const drop = jQuery('<div>');
            drop.addClass('sdmenu-dd p10');
            drop.append(jQuery(context).html());
            sdpDropDown(context, drop.get(0), { type: 'hover' });
            bannerDiv.attr('b_dropdown', true);
          }
        }
    
        // Ensure the event listener is attached only once
        if (!_self.bannerEventAttached) {
          _self.container.find('.banner-container').on('slide.sdp.sdrider', function () {
            _self.initDropDown();
          });
          _self.bannerEventAttached = true;
        }
      }, 10); // Delay for DOM operations
    }
  }

function checkOverflow(element) {
  if (!element) return false;

  // Create a temporary clone for measurement
  const clone = jQuery(element).clone()
    .css({
      'position': 'absolute',
      'visibility': 'hidden',
      'width': jQuery(element).width(), // Force same width
      'max-width': jQuery(element).width(),
      'white-space': 'nowrap',
      'overflow': 'visible'
    })
    .appendTo('body');

  // Get actual content width without constraints
  const naturalWidth = clone.get(0).scrollWidth - 5;
  const containerWidth = jQuery(element).width();
  
  // Cleanup
  clone.remove();

  // Compare natural content width to container width
  return naturalWidth > containerWidth;
}
