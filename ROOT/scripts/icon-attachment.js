/* $Id$ */
/** Icon attachment component code copied/referred from Ember component "icon-attachment/component.js" **/
/***
 * Icon attachment revamp component code with ES6 class syntax so that it can be intantiated.
 *
 * default_icon: The default icon URL.
 * default_name: The default name of the icon.
 * selectedIcon: The currently selected icon.
 * servlet_url: The URL of the servlet used for uploading the icon.
 * upload_param: The upload parameter used for uploading the icon.
 * uploadTab_alone: A boolean indicating whether the upload tab is displayed alone or not.
 * max_file_size: The maximum file size allowed for the icon (in MB).
 * popover: A boolean indicating whether the component should be rendered as a popover.
 * ischanged: A boolean indicating whether the icon has been changed.
 * selector: The selector for the icon attachment component.
 * recommended_resolution: A String indicating the recommended resolution for the icon.
 * allowed_ext: An array of allowed file extensions.
 * accept_mimes: A string indicating accepted MIME type.
 * showRemoveicon - Hide/Show remove icon
 *
 * ***/
if(typeof IconAttachment === 'undefined') {
  class IconAttachment {
    constructor() {
      this.default_icon = '/images/no-image-icon.svg'; //NO I18N
      this.default_name = 'no-image-icon.png'; //NO I18N
      this.selectedIcon = '';
      this.servlet_url = '';
      this.upload_param = '';
      this.uploadTab_alone = false;
      this.max_file_size = 5; //Default maximum file size in mb
      this.popover = false; //Render as popover method using true/false
      this.ischanged = false;
      this.selector = '#icon-attachment-wrapper';
      this.is_new_ui = false;
      this.recommended_resolution = null;
      this.allowed_ext = null;
      this.accept_mimes = null;
      this.showRemoveicon = true;
      this.customClass = '';
    }
    /**
       * An initialization method that loads the icon attachment component with the provided options.
    * **/
    init(opt) {
      this.selectedIcon = '';
      this.ischanged = false;
      Object.assign(this, opt);
      this.load(this);
    }

    load(opt) {
      const attach_options = this.attachfn();
      const iconattach = jQuery(this.selector);
      if(opt.is_new_ui) {
        iconattach.addClass('brd-medium'); //TD-130611 -- implementation
      }

      renderhbs(iconattach, 'icon-attachment', opt, false, "components", false, false, () => {
        this.bindEvents(iconattach);
        new attachPreview(attach_options.element, attach_options.options);
        initTooltip(this.selector);
      });
    }

    bindEvents(iconattach) {
      const positionFunc = this.is_new_ui ? this.setDynamicPosition.bind(this) : this.setPosition.bind(this);

      iconattach
        .off('click.showmenu')
        .on('click.showmenu', '.showmenu', this.handleShowMenu.bind(this))
        .off('click.showmenuposition')
        .on('click.showmenuposition', '[data-id="showmenuposition"]', () => positionFunc(this.popover))
        .off('click.iconattachfn')
        .on('click.iconattachfn', '[data-id="iconattachfn"]', () => this.attachfn())
        .off('click.selectsvgicon')
        .on('click.selectsvgicon', '[data-id="selectsvgicon"]', (event) => this.selectSvgIcon(event.currentTarget.dataset.icon))
        .off('click.iconchoose')
        .on('click.iconchoose', '[data-id="iconchoose"]', (event) => this.iconChoose(event.currentTarget.dataset.icon))
        .off('click.reseticon')
        .on('click.reseticon', '[data-id="reseticon"]', (event) => {
          event.preventDefault();
          this.resetIcon();
        });

        if(this.is_new_ui) {
          iconattach.off('click.triggerShowMenu').on('click.triggerShowMenu','[data-id="triggerShowMenu"]', (event) => {//NO I18N
            event.preventDefault();event.stopPropagation();
            iconattach.find('[data-id="showmenuposition"]').trigger('click');
          });
        }
    }

    handleShowMenu(event) {
      const events = (jQuery._data(document, 'events') || {}).click || [];
      events.forEach(evt => {
        if (evt.selector) {
          if (jQuery(event.target).is(evt.selector)) {
            evt.handler.call(event.target, event);
          }
          jQuery(event.target).parents(evt.selector).each(function() {
            evt.handler.call(this, event);
          });
        }
      });
      event.stopPropagation();
    }

    attachfn() {
      const _self = this;
      const ele = (_self.popover) ? `${_self.selector} #showPopover #icon-browse-area` : `${_self.selector} #icon-browse-area`; //NO I18N

      const attach_options = {
        servlet_url: _self.servlet_url,
        api: false,
        upload_param: _self.upload_param,
        upload_api: true,
        upload: true,
        enable_delete: false,
        download: false,
        title: false,
        servlet_cb: function(response) {
          _self.ischanged = true;
          if(response.response_status && response.response_status.status == "failed") {/*Upload attachment failed alert message show */
            const msg = response.response_status.messages[0] && response.response_status.messages[0].message ? response.response_status.messages[0].message : sdp.security.invalid.contenttype;
            showalert('failure',msg,'isAutoHide=false');//NO I18N
            //126153 - Icon attachement element removed changed to empty
            jQuery(ele).html('');//removed attached element from attached component
            return;
          }

          if(_self.default_icon_url && response.media) {
            _self.selectedIcon = response.media['content-url']; //NO I18N
            _self.id = response.media['id'];
            _self.name = response.media['id'];
          }

          if(response.image) {
            _self.selectedIcon = response.image['content-url']; //NO I18N
            _self.name = response.image['unique_file_name'];
          }

          _self.showUpload = false;
          _self.selectedSvgIcon = false;
          jQuery("body").trigger("click");
          _self.load(_self);
        },
        max_file_size: _self.max_file_size,
        max_upload_length: _self.max_upload_length
      };

      if(_self.allowed_ext) {
        attach_options.allowed_ext = _self.allowed_ext;
        _self.ext_txt = attach_options.allowed_ext.join(", ").toUpperCase(); //NO I18N
      }

      if(_self.accept_mimes) {
        attach_options.accept_mimes = _self.accept_mimes;
      }

      return { options: attach_options, element: ele };
    }

    resetIcon() {
      this.ischanged = true;
      this["selectedIcon"] = this.is_new_ui ? '' : this.default_icon;
      this.selectedSvgIcon = false;
      this.name = this.default_name;
      if (this.default_icon_url) {
        this.id = 0;
      }
      this.load(this);
    }

    selectSvgIcon(iconId) {
      this.ischanged = true;
      this.showUpload = false;
      this.selectedSvgIcon = iconId;
      this.selectedIcon = iconId;
      this.load(this);
    }

    iconChoose(src) {
      this.ischanged = true;
      this.selectedIcon = src;
      this.name = src.split("/").pop();
      this.load(this);
    }

    setPosition(position) {
      const ele = jQuery(`${this.selector} #beforeselecticon`);
      let top, left;
      if (position) {
        top = ele.offset().top - (Math.max(jQuery(window).scrollTop() - ele.height(), -30));
        left = ele.offset().left - 50;
      } else {
        top = ele.position().top - 10;
        left = ele.position().left - 110;
      }
      ele.find('.showmenu').css("top", top);
      ele.find('.showmenu').css(sdp_user.DIRECTION == "RTL" ? "right" : "left", left);
    }

    setDynamicPosition(popover) {
      const parent = jQuery(this.selector), is_rtl = sdp_user.DIRECTION === 'RTL';
      const el = parent.find('#showPopover').css('top', 0).css('left', 0).css('right', 0); // Reset positions before opening again
      if(popover && is_rtl) {
        el.removeClass('pos-fix');
      }
      el.position({
        'of': parent,//NO I18N
        'my': is_rtl ? 'right top' : 'left top',//NO I18N
        'at': is_rtl ? 'right bottom' : 'left bottom',//NO I18N
        using: (pos, obj) => {
          let {element} = obj;
          // const dir = is_rtl ? 'right' : 'left';
          // element.element.css('top', pos.top).css(dir, Math.abs(pos.left));
          element.element.css('top', pos.top).css('left', Math.abs(pos.left));
        }
      });

      // const menu = parent.find('.showmenu');
      // menu.addClass('disp-b');
    }
  }
window['IconAttachment'] = IconAttachment;
  // For backward compatability
  // Create a singleton instance
var $iconattachment = new IconAttachment();
}
