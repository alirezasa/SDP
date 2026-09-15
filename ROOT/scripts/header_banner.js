/* $Id$ */

/**
 * Product header banner implementation
 */
$header.banner = {
  /**
   * Initialize the banner based on provided data.
   * @param {Object} data - The data used to populate the banners.
   */
  initBanner: function (data) {
    if(data && data.length === 0) {
      return;
    }
    const bannerData = this.getBannerMapping(data);
    this.bannerData = bannerData;
    if (bannerData.length > 0) {
      jQuery("#header_banner").removeClass('hide');
      this.sdpBanner = new BannerComponent({
        data: this.bannerData,
        bannerInterval: 5000,
        container: '#header_banner' //NO I18N
      })
    } else {
      jQuery("#header_banner").hide();
    }
  },
  /**
   * Map the provided data to banner objects.
   * @param {Object} data - The data to be mapped.
   * @returns {Array} - An array of mapped banner objects.
   */
  getBannerMapping(data) {
    const jsonData = [];
    const keyMappings = this.bannerMappings(data);
    for (let [key, value] of Object.entries(data)) {

      /**  Handling the array based data starts */
      if (Array.isArray(value)) {
        // Handle other arrays
        value.forEach((item, index) => {
          if (item && typeof item === 'object') {
            const arrayItemKey = `${key}_${index}`;
            if (keyMappings[arrayItemKey]) {
              const mapping = keyMappings[arrayItemKey];
              const jsonItem = {
                content: mapping.content || item,
                ...mapping,
              };
              jsonData.push(jsonItem);
            }
          }
        });
        continue;
      }
      /**  Handling the array based data ends */

      /**  Handling the object based data starts*/
      if (jQuery.isPlainObject(value)) {
        const keys = Object.keys(value);
        const mapKeys = keys.filter(function (el) {
          const mapKey = key + "_" + el;
          if (keyMappings[mapKey]) {
            return true;
          }
        });
        mapKeys.length > 0 &&
          mapKeys.map(function (mk) {
            const mapping = keyMappings[key + "_" + mk];
            if (mapping) {
              const jsonItem = {
                content: mapping.content || value,
                ...mapping,
              };
              jsonData.push(jsonItem);
            }
          });
        continue;
      }
      /**  Handling the object based data ends*/

      if (value) {
        const mapping = keyMappings[key];
        if (mapping) {
          const jsonItem = {
            content: mapping.content || value,
            ...mapping,
          };
          jsonData.push(jsonItem);
        }
      }
    }
    return jsonData;
  },
  /**
   * Map keys for banner content based on provided data.
   * @param {Object} data - The data used to map keys.
   * @returns {Object} - An object containing key mappings.
   */
  bannerMappings: function (data) {
    const mapping = {
      is_early_access_build: {
        id: 'is_early_access_build', // NO I18N
        content_i18n: 'Early Access Build - Not for production use.', // NO I18N
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
      },
      WR_port_updated: {
        id: 'WR_port_updated', // NO I18N
        content_i18n: e_html(translate(
          'ae.admin.webrdpsettings.common.portusedmsg2', // NO I18N
          [data.WR_port]
        )),
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link',  // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N 
            action: 'close',  // NO I18N 
            cbClose: '$header.banner.bannerCB.closePortUsedMsg',  // NO I18N
          },
        ],
      },
      //TODO verify the i18n
      dc_service_down: {
        id: 'dc_service_down', // NO I18N
        content_i18n:
          e_html(translate(data.dc_error_message, [
            data.uem_prod_names.uem_integ_prod,
          ])) +
          ' ' +
          e_html(translate('sdp.uem.header.contact.admin')),
        icon_class: 'sdp-glyph sdp-glyph-failure-red', // NO I18N
        type: 'danger', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N // NO I18N
            cbCloseParam: ['dc_service_down'],
          },
        ],
      },
      dc_convert_to_free: {
        id: 'dc_convert_to_free', // NO I18N
        content_i18n:
          e_html(translate('sdp.dc.deploy.converttofree', [
            data.uem_prod_names.uem_integ_prod,
            data.uem_prod_names.uem_integ_prod,
          ])) +
          ' ' +
          e_html(translate('sdp.uem.header.contact.admin')),
        icon_class: 'sdp-glyph sdp-glyph-warning', // NO I18N
        type: 'warning', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N // NO I18N
            cbCloseParam: ['dc_convert_to_free'],
          },
          {
            btn_class: 'btn-link', // NO I18N
            tooltip: true,
            content_i18n: 'sdp.dc.clickhere',  // NO I18N
            type: 'link',  // NO I18N
            href: data.dc_url,
          },
        ],
      },
      dc_service_down_admin: {
        id: 'dc_service_down_admin',  // NO I18N
        content_i18n: e_html(translate(data.dc_error_message, [
          data.uem_prod_names.uem_integ_prod,
        ])),
        icon_class: 'sdp-glyph sdp-glyph-failure-red', // NO I18N
        type: 'danger', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_service_down_admin'],
          },
          {
            btn_class: 'btn-link', // NO I18N
            tooltip: true,
            content_i18n: 'sdp.admin.troubleshoot.title', // NO I18N
            type: 'button',  // NO I18N
            action: '$header.banner.bannerCB.openDCTroubleshoot', // NO I18N
          },
        ],
      },
      dc_service_running_http: {
        id: 'dc_service_running_http',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.header.dc.http.errmsg', [
          data.uem_prod_names.uem_integ_prod,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_service_running_http'],
          },
        ],
      },
      dc_service_running_https: {
        id: 'dc_service_running_https',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.header.dc.https.errmsg', [
          data.uem_prod_names.uem_integ_prod,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_service_running_https'],
          },
        ],
      },
      dc_rebranding_message: {
        id: 'dc_rebranding_message',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.rebranding.msg')),  // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_rebranding_message'],
          },
        ],
      },
      uem_prods_supported_message: {
        id: 'uem_prods_supported_message',  // NO I18N
        content_i18n: data.isAssetBuild ? e_html(translate('uem.prods.supported.ae.msg'))  : e_html(translate('uem.prods.supported.sdp.msg')),  // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.integrate.now', // NO I18N
            type: 'link',  // NO I18N
            href: '/app#/admin/uemproducts', // NO I18N
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['uem_prods_supported_message'],
          },
        ],
      },
      dc_download_and_deploy_message: {
        id: 'dc_download_and_deploy_message',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.downloadanddeploy.message', [
          data.uem_prod_names.uem_central,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_download_and_deploy_message'],
          },
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'sdp.dc.header.learnmore', // NO I18N
            type: 'button',  // NO I18N
            action: 'showDCBundleDialog', // NO I18N
            actionParam: [{ dialogFor: 'fromHeader' }], // NO I18N
          },
        ],
      },
      dc_incompatible: {
        id: 'dc_incompatible',  // NO I18N
        content_i18n: data.isAssetBuild ? e_html(translate('sdp.dc.defaultagent.header.unsupported.version.assetexplorer', [data.uem_prod_names.uem_integ_prod])):e_html(translate('sdp.dc.defaultagent.header.unsupported.version.servicedeskplus',[data.uem_prod_names.uem_integ_prod])),  // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'sdp.dc.download.patch', // NO I18N
            type: 'link',  // NO I18N
            target: '_blank', // NO I18N
            href: data.dc_patch_url,
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_incompatible'],
          },
        ],
      },
      dc_deploy_timeout: {
        id: 'dc_deploy_timeout',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.download.timeout', [
          data.uem_prod_names.uem_prod,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_deploy_timeout'],
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'sdp.dc.header.learnmore', // NO I18N
            type: 'button',  // NO I18N
            action: 'showDCBundleDialog', // NO I18N
          },
        ],
      },
      dc_upgrade_latest_version: {
        id: 'dc_upgrade_latest_version',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.security.upgrade.msg', [
          data.uem_prod_names.uem_prod,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'sdp.dc.patch.download', // NO I18N
            type: 'link',  // NO I18N
            href: data.dc_patch_url,
            target: '_blank', // NO I18N
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'remind.me.later.five.days', // NO I18N
            type: 'button',  // NO I18N
            tooltip: true,
            title: 'securitybanner.remind.me.later.tooltip.5days', // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.hideSecurityMsgBanner', // NO I18N
          },
        ],
      },
      dc_eos_msg_check: {
        id: 'dc_eos_msg_check',  // NO I18N
        content_i18n: e_html(data.dc_eos_msg),
        icon_class: 'sdp-glyph sdp-glyph-failure-red', // NO I18N
        type: 'danger', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'securitybanner.remind.me.later.15days', // NO I18N
            type: 'button',  // NO I18N
            tooltip: true,
            title: 'securitybanner.remind.me.later.15days', // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.hideEOSBanner', // NO I18N
          },
        ],
      },
      dc_show_https_msg: {
        id: 'dc_show_https_msg',  // NO I18N
        content_i18n: translate(data.isAssetBuild ? 'ae.dc.https.enforce.msg' : 'sdp.dc.https.enforce.msg',['/app#/admin/uemproducts', e_html(data.uem_prod_names.uem_integ_prod), e_html(data.uem_prod_names.uem_integ_prod),]),  // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
            cbCloseParam: ['dc_show_https_msg'],
          },
        ],
      },
      dc_deployment_success: {
        id: 'dc_deployment_success',  // NO I18N
        content_i18n: e_html(translate('sdp.dc.deployment.success', [
          data.uem_prod_names.uem_integ_prod,
        ])),
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeDCsuccessMsg', // NO I18N
          },
        ],
      },
      WR_port_used: {
        id: 'WR_port_used',  // NO I18N
        content_i18n: e_html(translate('ae.admin.webrdpsettings.common.portusedmsg')), // NO I18N
        type: 'danger', // NO I18N
        icon_class: 'sdp-glyph sdp-glyph-failure text-danger', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'ae.admin.webrdpsettings.common.portusedmsg.link', // NO I18N
            type: 'link',  // NO I18N
            href: '/SetUpWizard.do?forwardTo=rcSettings&amp;trigger=Web Remote', // NO I18N
          },
        ],
      },
      WR_restart_needed: {
        id: 'WR_restart_needed',  // NO I18N
        content_i18n: e_html(translate('ae.admin.webrdpsettings.common.restartmsg')), // NO I18N
        type: 'danger', // NO I18N
        icon_class: 'sdp-glyph sdp-glyph-failure text-danger', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'ae.admin.webrdpsettings.common.portusedmsg.link', // NO I18N
            type: 'link',  // NO I18N
            href: '/SetUpWizard.do?forwardTo=rcSettings&amp;trigger=Web Remote', // NO I18N
          },
        ],
      },
      showAntiVirusCustomizationBanner: {
        id: 'showAntiVirusCustomizationBanner',  // NO I18N
        content_i18n: data.showAntiVirusCustomizationBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_antivirus_Customization_' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 7,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.donotshowAntivirusAndOptimizePerformance', // NO I18N
            cbCloseParam: ['disable_AntiVirusCustomizationBanner'], // NO I18N
          },
        ],
      },
      showUpdateDBStatisticsBanner: {
        id: 'showUpdateDBStatisticsBanner',  // NO I18N
        content_i18n: data.showUpdateDBStatisticsBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key:
                'close_optimize_performance_tips_' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 7,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.donotshowAntivirusAndOptimizePerformance', // NO I18N
            cbCloseParam: ['disable_UpdateDBStatisticsBanner'],
          },
        ],
      },
      showTFABanner: {
        id: 'showTFABanner',  // NO I18N
        content_i18n: e_html(translate('mfa.header.tfa.banner')), // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            tooltip: true,
            content_i18n: 'sdp.common.clickhere', // NO I18N
            type: 'link',  // NO I18N
            href: '/app#/admin/two-factor-auth', // NO I18N
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'disable_tfa_banner_' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 180,
              isCookie: true,
            },
          },
        ],
      },
      showInvalidRulesRequestInfo: {
        id: 'showInvalidRulesRequestInfo',  // NO I18N
        content_i18n: data.showInvalidRulesRequestInfo,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_show_invalid_request_rules_' + sdp_user.LOGGEDIN_USERID,  // NO I18N
              days: 7,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.donotshowInvalidRequestRulesInfo', // NO I18N
          },
        ],
      },
      showADScheduleUpdateBanner: {
        id: 'showADScheduleUpdateBanner',  // NO I18N
        content_i18n: data.showADScheduleUpdateBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_adschedule_update_banner_' + sdp_user.LOGGEDIN_USERID,  // NO I18N
              days: 7,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.donotshowADScheduleUpdateBanner', // NO I18N
          },
        ],
      },
      showAAOAuthBanner: {
        id: 'showAAOAuthBanner',  // NO I18N
        content_i18n: data.showAAOAuthBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_AAOAuthBanner_' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 7,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain',  // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.donotshowOauthAABanner', // NO I18N
          },
        ],
      },
      showAUNotifyUserBanner: {
        id: 'showAUNotifyUserBanner',  // NO I18N
        content_i18n: data.showAUNotifyUserBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_AUNotifyUserBanner_' + sdp_user.LOGGEDIN_USERID,  // NO I18N
              days: 1,
              isCookie: true,
            },
          },
        ],
      },
      showAUNetworkBanner: {
        id: 'showAUNetworkBanner',  // NO I18N
        content_i18n: data.showAUNetworkBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key: 'close_AUNetworkBanner_' + sdp_user.LOGGEDIN_USERID,  // NO I18N
              days: 1,
              isCookie: true,
            },
          },
        ],
      },
      showAURestartBanner: {
        id: 'showAURestartBanner',  // NO I18N
        content_i18n: data.showAURestartBanner,
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [],
      },
      invalid_license: {
        id: 'invalid_license',  // NO I18N
        content_i18n: e_html(translate('sdp.admin.sdplicense.invalid.error')), // NO I18N
        icon_class: 'sdp-glyph sdp-glyph-warning', // NO I18N
        type: 'warning', // NO I18N
        buttons: [],
      },
      sla_migration: {
        id: 'sla_migration',  // NO I18N
        content_i18n: e_html(translate('sla.escalation.migration')), // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeSLAMsg', // NO I18N
            cbCloseParam: ['hideSLAEscMigrationMsg'],
          },
        ],
      },
      sla_migration_non_processed: {
        id: 'sla_migration_non_processed',  // NO I18N
        content_i18n: e_html(translate('sla.escalation.migration.nonprocessed')), // NO I18N
        icon_class: 'sdp-glyph sdp-glyph-warning', // NO I18N
        type: 'warning', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.closeSLAMsg', // NO I18N
            cbCloseParam: ['hideSLANonProcessedMsg'],
          },
        ],
      },
      showRequestAABanner: {
        id: 'showRequestAABanner', // NO I18N
        content_i18n: translate('sdp.admin.zreports.requestUDFBanner'), // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'sdp.dc.header.learnmore', // NO I18N
            type: 'link', // NO I18N
            href: 'https://pitstop.manageengine.com/portal/en/community/topic/announcement-for-customers-migrating-servicedesk-plus-to-build-14900-or-later', // NO I18N
            target: '_blank', // NO I18N
          },
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button', // NO I18N
            action: 'close', // NO I18N
            store: {
              key:
                'disable_Request_aplus_banner_' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 1,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button', // NO I18N
            action: 'close', // NO I18N
            cbClose: '$header.banner.bannerCB.donotShowRequestAABanner', // NO I18N
          },
        ],
      },
      showAssetAABanner: {
              id: 'showAssetAABanner', // NO I18N
              content_i18n: translate('sdp.admin.zreports.assetUDFBanner'), // NO I18N
              icon_class: 'cspr info icon-sm', // NO I18N
              type: 'info', // NO I18N
              buttons: [
                {
                  btn_class: 'btn-link uppercase', // NO I18N
                  content_i18n: 'sdp.dc.header.learnmore', // NO I18N
                  type: 'link', // NO I18N
                  href: 'https://pitstop.manageengine.com/agent/manageengine/servicedesk-plus/knowledge-base/page?articlestatus=latest&rootcategoryId=24000242084181&categoryId=24002417178375#Solutions/dv/24003390754831/en', // NO I18N
                  target: '_blank', // NO I18N
                },
                {
                  btn_class: 'btn-link uppercase', // NO I18N
                  content_i18n: 'common.close', // NO I18N
                  type: 'button', // NO I18N
                  action: 'close', // NO I18N
                  store: {
                    key:
                      'disable_Asset_aplus_banner_' + sdp_user.LOGGEDIN_USERID, // NO I18N
                    days: 1,
                    isCookie: true,
                  },
                },
                {
                  btn_class: 'btn-link uppercase', // NO I18N
                  content_i18n: 'common.dontShowAgain', // NO I18N
                  type: 'button', // NO I18N
                  action: 'close', // NO I18N
                  cbClose: '$header.banner.bannerCB.donotShowAssetAABanner', // NO I18N
                },
              ],
            },
      showSkipInlineValidationBanner: {
        id: 'showSkipInlineValidationBanner', // NO I18N
        content_i18n: translate('sdp.mail.skipInlineValidation.banner'), // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button', // NO I18N
            action: 'close', // NO I18N
            store: {
              key: "skip_inline_val_banner_" + sdp_user.LOGGEDIN_USERID, // NO I18N
              isCookie: true,
              days: 30,
            }
          },
        ],
      },
      showCMDBV1APIUsage: {
        id: 'cmdb-v1-usage', // NO I18N
        content_i18n: translate('cmdb.v1.usage.info'), // NO I18N
        icon_class: 'cspr info icon-sm mr5', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'sdp.admin.dcconfig.tools.knowmore', // NO I18N
            type: 'link', // NO I18N
            href: sdp_app.IS_AE ? 'https://help.assetexplorer.com/portal/en/kb/articles/cmdb-api-v1-and-v3-comparison' : 'https://help.servicedeskplus.com/cmdb-api-v1-and-v3-comparison', // NO I18N
            target: '_blank', // NO I18N
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'securitybanner.remind.me.later', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.configureCMDBV1UsageLater', // NO I18N
          },
        ],
      },
      showCMDBPostMigration: {
        id: 'cmdb-post-migration', // NO I18N
        content_i18n: translate('cmdb.migration.header.info',[sdp_app.IS_AE ? translate("ae.common.assetexplorer") : translate("sdp.common.servicedeskplus")]), // NO I18N
        icon_class: 'cspr info icon-sm mr5', // NO I18N
        type: 'info', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link uppercase', // NO I18N
            content_i18n: 'cmdb.migration.configure.text', // NO I18N
            type: 'button', // NO I18N
            action: 'close',  // NO I18N
            cbClose: 'showCMDBMigration', // NO I18N
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'securitybanner.remind.me.later', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: 'configureCMDBMigrationLater', // NO I18N
          }
        ],
      }
    };

    if (data.showAdminScheduleBanner != -1) {
      mapping.showAdminScheduleBanner = {
        id: 'showAdminScheduleBanner',  // NO I18N
        content_i18n: data.showAdminScheduleBanner,
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            store: {
              key:
                'close_admin_audit_history_schedule' + sdp_user.LOGGEDIN_USERID, // NO I18N
              days: 1,
              isCookie: true,
            },
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.dontShowAgain', // NO I18N
            type: 'button',  // NO I18N
            action: '$header.banner.bannerCB.disableAdminAuditHistoryScheduleBanner',  // NO I18N
          },
        ],
      };
    }

    if (data.ssl) {
      if (data.ssl.is_server_to_be_restarted) {
        mapping.ssl_is_server_to_be_restarted = {
          id: 'ssl_is_server_to_be_restarted',  // NO I18N
          content_i18n: e_html(translate('sslimport.server_restart_notif')), // NO I18N
          type: 'info', // NO I18N
          icon_class: 'cspr info icon-sm', // NO I18N
          buttons: [
            {
              btn_class: 'btn-link', // NO I18N
              content_i18n: 'common.close', // NO I18N
              type: 'button',  // NO I18N
              action: 'close',  // NO I18N
              cbClose: '$header.banner.bannerCB.hideServerRestartNotification', // NO I18N
            },
          ],
        };
      }
      if (data.ssl.is_renewal_message_to_be_displayed) {
        mapping.ssl_is_renewal_message_to_be_displayed = {
          id: 'ssl_is_renewal_message_to_be_displayed',  // NO I18N
          content_i18n:
            data.ssl.days_left_for_expiry > 0
              ? data.ssl.ssl_renewal_notif
              : data.ssl.ssl_expired_notif,
          type: data.ssl.days_left_for_expiry > 0 ? 'info' : 'danger', // NO I18N
          icon_class:
            data.ssl.days_left_for_expiry > 0
              ? 'cspr info icon-sm'  // NO I18N
              : 'cspr danger icon-sm mr5',  // NO I18N
          buttons: [],
        };
        if (data.ssl.days_left_for_expiry <= 0) {
          mapping.ssl_is_renewal_message_to_be_displayed.buttons.push({
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'common.close', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.hideSSLRenewalNotification', // NO I18N
          });
        }
      }
    }

    if (data.dbperf && data.dbperf.show_strip) {
      let contentI18n, link;
      if (data.dbperf.autogrowth && data.dbperf.snapshotisolation) {
        contentI18n =
          'ae.admin.banner.dbperformance.autogrowthandsnapshotisolationtitle';  // NO I18N
        link = data.dbperf.snapshotisolationurl;
      } else if (data.dbperf.autogrowth) {
        contentI18n = 'ae.admin.banner.dbperformance.autogrowthtitle';  // NO I18N
        link = data.dbperf.autogrowthurl;
      } else if (data.dbperf.snapshotisolation) {
        contentI18n = 'ae.admin.banner.dbperformance.snapshotisolationtitle';  // NO I18N
        link = data.dbperf.snapshotisolationurl;
      }
      contentI18n &&
        link &&
        (mapping.dbperf_show_strip = {
          id: 'dbperf_show_strip',  // NO I18N
          type: 'info', // NO I18N
          icon_class: 'cspr info icon-sm', // NO I18N
          content_i18n: e_html(translate(contentI18n)),
          buttons: [
            {
              btn_class: 'btn-link', // NO I18N
              content_i18n: 'ae.admin.banner.dbperformance.knowmore', // NO I18N
              type: 'link',  // NO I18N
              target: '_blank', // NO I18N
              href: link,
            },
            {
              btn_class: 'btn-link', // NO I18N
              content_i18n: 'common.close', // NO I18N
              type: 'button',  // NO I18N
              action: 'close',  // NO I18N
              cbClose: '$header.banner.bannerCB.setDBPerfCookie', // NO I18N
            },
          ],
        });
    }

    /** SD-106898 | contact collection banner starts */
    if (
      data.contact_collection &&
      data.contact_collection.isShowContactBanner
    ) {
      mapping.contact_collection_isShowContactBanner = {
        id: 'dbperf_show_strip',  // NO I18N
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        content_i18n: data.contact_collection.description,
        buttons: [
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'sdp.admin.security.settings.key', // NO I18N
            type: 'button',  // NO I18N
            action: '$header.banner.bannerCB.showSecurityAlerts', // NO I18N
            actionParam: [{ url: data.contact_collection.url }]
          },
          {
            btn_class: 'btn-link', // NO I18N
            content_i18n: 'securitybanner.remind.me.later', // NO I18N
            type: 'button',  // NO I18N
            action: 'close',  // NO I18N
            cbClose: '$header.banner.bannerCB.hideContactCollectionBanner', // NO I18N
          },
        ],
      };
    }
    /** SD-106898 | contact collection banner ends */

    if(data.esm_details && data.esm_details.current_portal && data.esm_details.current_portal.canAllowedDBOperation === false && data.currentURL !== '/ESM.do') {
      mapping.contact_collection_isShowContactBanner = {
        id: 'dbperf_show_strip',  // NO I18N
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        content_i18n: e_html(translate('mdh.restricted.portals.header.top.info.msg', [esm_details.current_portal.status_name])),
        buttons: [],
      };
    }

    // DC default agent message
    if (data.show_dc_default_agent_message) {
      const defaultAgentMessage = {
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm top0 mr5', // NO I18N
        buttons: []
      };
      if (data.dc_default_agent_message_details && (data.dc_default_agent_message_details.isUnsupportedVersion || data.dc_default_agent_message_details.new_agents_required)) {
        if (data.dc_default_agent_message_details.isUnsupportedVersion) {
          const content = e_html(translate('sdp.dc.defaultagent.header.changes.required', [data.uem_prod_names.uem_central])) +' <span class="status-arrow disp-ib vmiddle"></span><span class="path1"></span><span class="path2"></span></span> '; // NO I18N
          mapping.show_dc_default_agent_message_unsupported_version = {
            id: 'show_dc_default_agent_message_unsupported_version',  // NO I18N
            type: 'info', // NO I18N
            icon_class: 'cspr info icon-sm top0 mr5', // NO I18N
            content_i18n: data.isAssetBuild
              ? content + e_html(translate('sdp.dc.defaultagent.header.unsupported.version.assetexplorer', [data.uem_prod_names.uem_integ_prod]))
              : content + e_html(translate('sdp.dc.defaultagent.header.unsupported.version.servicedeskplus', [data.uem_prod_names.uem_integ_prod])),
            buttons: [
              {
                btn_class: 'btn-link', // NO I18N
                content_i18n: 'sdp.dc.download.patch', // NO I18N
                type: 'link',  // NO I18N
                target: '_blank', // NO I18N
                href: data.dc_patch_url,
              },
              {
                btn_class: 'btn-link', // NO I18N
                content_i18n: 'common.close', // NO I18N
                type: 'button',  // NO I18N
                action: 'close',  // NO I18N
                cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
                cbCloseParam: ['show_dc_default_agent_message_unsupported_version'], // NO I18N
              },
              {
                btn_class: 'btn-link uppercase', // NO I18N
                content_i18n: 'sdp.dc.header.learnmore', // NO I18N
                type: 'button',  // NO I18N
                action: 'showDCBundleDialog', // NO I18N
                actionParam: [{ dialogFor: 'fromHeader' }], // NO I18N
              },
            ],
          };
          data.show_dc_default_agent_message_unsupported_version = true
        }

        if (data.dc_default_agent_message_details.new_agents_required) {
          mapping.show_dc_default_agent_message_new_agents_required = {
            id: 'show_dc_default_agent_message_new_agents_required',  // NO I18N
            type: 'info', // NO I18N
            icon_class: 'cspr info icon-sm top0 mr5', // NO I18N
            content_i18n: e_html(translate('sdp.dc.defaultagent.header.changes.required', [data.uem_prod_names.uem_central])) +' <span class="status-arrow disp-ib vmiddle"></span><span class="path1"></span><span class="path2"></span></span> '+e_html(translate('sdp.dc.defaultagent.header.replaceagents', [data.uem_prod_names.uem_central])),
            buttons: [
              {
                btn_class: 'btn-link uppercase', // NO I18N
                content_i18n: 'sdp.dc.header.learnmore', // NO I18N
                type: 'button',  // NO I18N
                action: 'showDCBundleDialog', // NO I18N
                actionParam: [{ dialogFor: 'fromHeader' }], // NO I18N
              },
              {
                btn_class: 'btn-link', // NO I18N
                content_i18n: 'common.close', // NO I18N
                type: 'button',  // NO I18N
                action: 'close',  // NO I18N
                cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
                cbCloseParam: ['show_dc_default_agent_message_new_agents_required'], // NO I18N
              },
            ],
          };
          data.show_dc_default_agent_message_new_agents_required = true;
        }
      } else {
        //Default message
        defaultAgentMessage.id = 'show_dc_default_agent_message',  // NO I18N
        defaultAgentMessage.content_i18n = e_html(translate('sdp.dc.defaultagent.header', [data.uem_prod_names.uem_central]));
        defaultAgentMessage.buttons.push({
          btn_class: 'btn-link uppercase', // NO I18N
          content_i18n: 'sdp.dc.header.learnmore', // NO I18N
          type: 'button', // NO I18N
          action: 'showDCBundleDialog', // NO I18N
          actionParam: [{ dialogFor: 'fromHeader' }], // NO I18N
        },
        {
          btn_class: 'btn-link', // NO I18N
          content_i18n: 'common.close', // NO I18N
          type: 'button', // NO I18N
          action: 'close', // NO I18N
          cbClose: '$header.banner.bannerCB.closeDCHeaderMsg', // NO I18N
          cbCloseParam: ['show_dc_default_agent_message'], // NO I18N
        });

        mapping.show_dc_default_agent_message = defaultAgentMessage;
      }
    }

    // License show
    if (data.license && data.license.show_strip) {
      mapping.license_show_strip = {
        id: 'license_show_strip', // NO I18N
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        content_i18n: '', // NO I18N
        buttons: [],
      };
      let content = '';

      if (data.license.license_alert) {
        content += `${e_html(translate('common.licensealert.eval'))} <span class="text-danger">${data.license.license_alert.days} ${e_html(translate('common.days'))}</span>`;
      }

      if (data.license.isFreeLicense) {
        content += `${data.license.expiredMessage}&nbsp;`;
      }

      if (data.license.show_extension) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm', // NO I18N
          content_i18n: 'common.license.expiryextension', // NO I18N
          type: 'link', // NO I18N
          href: data.license.show_extension.url,
          target: '_blank', // NO I18N
        });
      }

      if (data.license.standard_free_license) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'common.license.standardfreetext', // NO I18N
          type: 'link', // NO I18N
          href: data.license.standard_free_license.url,
          target: '_blank', // NO I18N
        });
      }

      if (data.license.online_store) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'sdp.license.purchase', // NO I18N
          type: 'link', // NO I18N
          href: data.license.online_store.url,
          target: '_blank', // NO I18N
        });
      }

      if (data.license.get_quotes) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'common.license.getquote', // NO I18N
          type: 'link', // NO I18N
          href: data.license.get_quotes.url,
          target: '_blank', // NO I18N
        });
      }

      if (data.license.eval_zone) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'common.license.eval', // NO I18N
          type: 'link', // NO I18N
          href: data.license.eval_zone.url,
          target: '_blank', // NO I18N
        });
      }

      if (data.license.renew) {
        content += `${data.license.renew.message} <span class="text-danger">${data.license.renew.days} ${e_html(translate('common.days'))}</span>`;
        if (!data.license.renew.hiderenewbutton) {
          mapping.license_show_strip.buttons.push({
            btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
            content_i18n: 'common.license.title', // NO I18N
            type: 'link', // NO I18N
            href: data.license.renew.url,
            target: '_blank', // NO I18N
          });
        }
      }

      if (!data.license.isFreeLicense) {
        mapping.license_show_strip.buttons.push({
          btn_class: 'btn-link uppercase', // NO I18N
          content_i18n: 'common.close', // NO I18N
          type: 'button', // NO I18N
          action: 'close', // NO I18N
          cbClose: '$header.banner.bannerCB.setEvalCookie', // NO I18N
        });
      }

      if(content){
        mapping.license_show_strip.content_i18n = content;
      } else {
        mapping.license_show_strip.icon_class = "";
      }
    }

    // License AMS show details
    if (data.license && data.license.ams_show_strip) {
      mapping.license_ams_show_strip = {
        id: 'license_ams_show_strip', // NO I18N
        type: 'info', // NO I18N
        icon_class: 'cspr info icon-sm', // NO I18N
        content_i18n: '', // NO I18N
        buttons: [],
      };
      let content = '';

      if (data.license.amsrenew && data.license.amsrenew.showUpdateStrip) {
        content += `${e_html(translate(data.license.amsrenew.showUpdateAMS))}&nbsp;`;
        mapping.license_ams_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'sdp.ams.update', // NO I18N
          type: 'button', // NO I18N
          action: 'showURLInDialog', // NO I18N
          actionParam: ['/jsp/AMSRequestForm.jsp', 'modal=yes,draggable=no,closeOnEscKey=no,closeButton=no,width=660,position=absmiddle'], // NO I18N
        });
        mapping.license_ams_show_strip.buttons.push({
          btn_class: 'btn-link uppercase', // NO I18N
          content_i18n: 'common.close', // NO I18N
          type: 'button', // NO I18N
          action: '$header.banner.bannerCB.hideAMSUpdateBand', // NO I18N
        });
      } else {
        if (data.license.amsrenew.expired) {
          content += `${e_html(translate(data.license.amsrenew.expired))}`;
        } else {
          content += `${e_html(translate('sdp.ams.expires'))} <span class="text-danger">${data.license.amsrenew.days} ${e_html(translate('common.days'))}</span>`;
        }
        mapping.license_ams_show_strip.buttons.push({
          btn_class: 'btn-link btn-sm bg-dark text-color8', // NO I18N
          content_i18n: 'sdp.ams.renew', // NO I18N
          type: 'button', // NO I18N
          action: 'showURLInDialog', // NO I18N
          actionParam: ['/jsp/AMSRequestForm.jsp', 'modal=yes,draggable=no,closeOnEscKey=no,closeButton=no,width=660,position=absmiddle'], // NO I18N
        });
        mapping.license_ams_show_strip.buttons.push({
          btn_class: 'btn-link uppercase', // NO I18N
          content_i18n: 'common.close', // NO I18N
          type: 'button', // NO I18N
          action: 'close', // NO I18N
          cbClose: '$header.banner.bannerCB.setAMSEvalCookie', // NO I18N
          cbCloseParam: [data.license.amsrenew.days],
        });
      }

      mapping.license_ams_show_strip.content_i18n = content;
    }

    // Security Banner true case
    if (data.security_banner && data.security_banner[0] && data.security_banner[0].isShowBanner === "true" && data.isExternalFrame !== true) {
      const securityCount = this.helperFunctions.securityBannerTotalCount(data.security_banner[0]);
      const attachmentCount = this.helperFunctions.securityBannerAttachmentTotalCount(data.security_banner[0]);

      let contentMessage = '';
      if (securityCount !== 0 && attachmentCount !== 0) {
        contentMessage = e_html(translate('sdp.admin.attachment.path.unavailable.header.key_small'));
      } else {
        contentMessage = '<div class="disp-ib">' + e_html(translate('securitybanner.popup.warning')) + '</div>.';
      }

      const buttons = [{
        btn_class: 'btn btn-sm ml5 vbase btn-warning-ol-hvr', // NO I18N
        content_i18n: 'ae.admin.banner.dbperformance.knowmore', // NO I18N
        type: 'button', // NO I18N
        action: '$header.banner.bannerCB.openSecurityPopup', // NO I18N
        actionParam: []
      }];

      // Add "Remind me later" button if conditions are met
      const showRemindLater = !(data.security_banner[0].admin_password === true || 
                                data.security_banner[0].guest_password === true || 
                                data.security_banner[0].dc_admin_password === true);

      if (showRemindLater) {
        buttons.push({
          btn_class: 'text-warn-hvr text-color5 cur-ptr ml10 btn-link', // NO I18N
          content_i18n: 'securitybanner.remind.me.later', // NO I18N
          type: 'button', // NO I18N
          action: 'close', // NO I18N
          cbClose: '$header.banner.bannerCB.hideSecurityBanner', // NO I18N
          title: data.security_banner[0].remindeme_tooltip || '',
          tooltipAlwaysShown: true
        });
      }

      mapping.security_banner_0 = {
        id: 'security_banner_0', // NO I18N
        type: 'warning', // NO I18N
        icon_class: 'cspr icon-md mr5 alert-yellow vmiddle', // NO I18N
        content_i18n: contentMessage,
        buttons: buttons
      };
    }

    // Security Banner false case
    if (data.security_banner && data.security_banner[0] && data.security_banner[0].isShowBanner === "false" && data.isExternalFrame !== true) {
      const attachmentCount = this.helperFunctions.securityBannerAttachmentTotalCount(data.security_banner[0]);
      if (attachmentCount > 0) {
        const buttons = [];
        

        buttons.push({
          btn_class: 'btn btn-sm ml5 vbase btn-warning-ol-hvr', // NO I18N
          content_i18n: 'ae.admin.banner.dbperformance.knowmore', // NO I18N
          type: 'button', // NO I18N
          action: '$header.banner.bannerCB.openSecurityPopup', // NO I18N
          actionParam: [false, true]
        });
        
        mapping.security_banner_0 = {
          id: 'security_banner_0', // NO I18N
          type: 'warning', // NO I18N
          icon_class: 'cspr icon-md mr5 alert-yellow vmiddle', // NO I18N
          content_i18n: e_html(translate('sdp.admin.attachment.path.unavailable.header.key_caps')), // NO I18N
          buttons: buttons
        };
      }
    }

    // Security Advisory Banners
    if (data.security_advisory && Array.isArray(data.security_advisory) && data.security_advisory.length > 0) {
      data.security_advisory.forEach((advisory, index) => {
        const bannerKey = `security_advisory_${index}`;
        if (advisory && advisory.title) {
          
          const buttons = [];
          
          // Add "Know More" button if link exists
          if (advisory.link) {
            buttons.push({
              btn_class: 'pl10 pr10 ml5 vbase btn-warning-ol-hvr', // NO I18N
              content_i18n: 'ae.admin.banner.dbperformance.knowmore', // NO I18N
              type: 'link', // NO I18N
              target: '_blank', // NO I18N
              href: advisory.link
            });
          }
          
          // Add close button
          buttons.push({
            btn_class: 'text-warn-hvr text-color5 cur-ptr ml10 btn-link', // NO I18N
            content_i18n: 'sdp.common.close', // NO I18N
            type: 'button', // NO I18N
            action: 'close', // NO I18N
            cbClose: '$header.banner.bannerCB.setReadStatus', // NO I18N
            cbCloseParam: [advisory.id],
            title: e_html(translate('sdp.common.close'))
          });
          
          mapping[bannerKey] = {
            id: bannerKey,
            type: 'warning', // NO I18N
            icon_class: 'cspr icon-md mr5 alert-yellow vmiddle', // NO I18N
            content_i18n: '<div class="disp-ib"> ' + advisory.title + '</div>', // NO I18N
            buttons: buttons
          };
          data[bannerKey] = advisory;
        }
        
        // Handle proxy_notconnected within advisory loop (as per Handlebars structure)
        if (advisory && advisory.proxy_notconnected) {
          
          const proxyButtons = [];
          
          // Add click here button if link exists
          if (advisory.proxy_link) {
            proxyButtons.push({
              btn_class: 'pl10 pr10 ml5 vbase btn-warning-ol-hvr', // NO I18N
              content_i18n: 'sdp.common.clickhere', // NO I18N
              type: 'link', // NO I18N
              href: advisory.proxy_link
            });
          }
          
          // Add remind me later button
          proxyButtons.push({
            btn_class: 'text-warn-hvr text-color5 cur-ptr ml10 btn-link', // NO I18N
            content_i18n: 'securitybanner.remind.me.later', // NO I18N
            type: 'button', // NO I18N
            action: 'close', // NO I18N
            cbClose: '$header.banner.bannerCB.hideProxyMessage', // NO I18N
            title: advisory.remindeme_tooltip || '',
            tooltipAlwaysShown: true
          });
          const bannerKey = `security_advisory_proxy_notconnected`;
          mapping[bannerKey] = {
            id: bannerKey,
            type: 'warning', // NO I18N
            icon_class: 'cspr icon-md mr5 alert-yellow vmiddle', // NO I18N
            content_i18n: '<div class="disp-ib"> ' + advisory.message + '</div>', // NO I18N
            buttons: proxyButtons
          };
          data[bannerKey] = advisory.proxy_notconnected;
        }
      });
    }

    return mapping;
  },
  /**
   * Callback of the banners
   */
  bannerCB: {
    closePortUsedMsg: function () {
      sdpAjax({
        url: "/servlet/AJaxServlet", //NO I18N
        contentType: "application/x-www-form-urlencoded;charset=UTF-8", //NO I18N
        type: "POST", //NO I18N
        data: "action=hidePortUsedMsg", //NO I18N
        ignorefailuremessage: true
      });
    },
    closeDCHeaderMsg: function (msgName) {
      sdpAjax({
        url: "/servlet/AJaxServlet", //NO I18N
        contentType: "application/x-www-form-urlencoded;charset=UTF-8", //NO I18N
        type: "POST", //NO I18N
        data: "action=closeDCHeaderMsg&operation=" + msgName, //NO I18N
        ignorefailuremessage: true
      });
    },
    openDCTroubleshoot: function () {
      window.open( '/app#/admin/uemproducts', 'width=600,height=600,scrollbars=yes,resizable=no,noopener'); // NO I18N
    },
    hideSecurityMsgBanner: function () {
      const date = new Date();
      const endtime = date.getTime() + 86400000 * 5;
      const remindmeLaterObj = { starttime: date.getTime(), endtime: endtime };
      addPersonalization("DC_UPGRADE_MSG_PREFERENCE", remindmeLaterObj, true, { //No I18n
        is_portalspecific: false,
      });
    },
    hideEOSBanner: function () {
      var date = new Date();
      var endtime = date.getTime() + 86400000 * 15;
      var remindmeLaterObj = { starttime: date.getTime(), endtime: endtime };
      addPersonalization("DC_EOS_MSG", remindmeLaterObj, true, { // No I18N
        is_portalspecific: false,
      });
    },
    closeDCsuccessMsg: function () {
      sdpAjax({
        url: "/servlet/AJaxServlet", //NO I18N
        contentType: "application/x-www-form-urlencoded;charset=UTF-8", //NO I18N
        type: "POST", //NO I18N
        data: "action=hideDCContentMsg", //NO I18N
        ignorefailuremessage: true
      });
    },

    donotshowAntivirusAndOptimizePerformance: function (operation) {
      var input_data = { operation: operation };
      var dataVal = sdpAjaxInputData(input_data);
      sdpAjax({
        url: "/servlet/ConfigurePerformance", //NO I18N
        type: "POST", //NO I18N
        data: dataVal,
        ignorefailuremessage: true
      });
    },
    hideServerRestartNotification: function () {
      sdpAjax({
        url: "/importssl/controller", //NO I18N
        type: "GET", //NO I18N
        cache: false,
        data: { action: "hideServerRestartNotification" }, //NO I18N
        ignorefailuremessage: true
      });
    },
    hideSSLRenewalNotification: function () {
      sdpAjax({
        url: "/importssl/controller", //NO I18N
        type: "GET", //NO I18N
        cache: false,
        data: { action: "hideSSLRenewalNotification" }, //NO I18N
        ignorefailuremessage: true
      });
    },
    disableAdminAuditHistoryScheduleBanner: function () {
      try {
        sdpAjax({
          async: false,
          url: "/servlet/AJaxServlet?action=disableAdminAuditScheduleBanner", //NO I18N
          type: "POST", //NO I18N
          ignorefailuremessage: true,
        });
      }
      finally {
        //Post request alway returns empty data so banner removel handled here
        $header.banner.sdpBanner.removeBanner("showAdminScheduleBanner"); //NO I18N
      }
    },
    donotshowInvalidRequestRulesInfo: function () {
      sdpAjax({
        async: false,
        url: "/servlet/SDAjaxServlet?action=disable_ShowInvalidRequestRulesInfo", //NO I18N
        type: "POST", //NO I18N
        dataType: "text", //NO I18N
        ignorefailuremessage: true
      });
    },
    donotshowADScheduleUpdateBanner: function () {
      sdpAjax({
        url: "/servlet/AJaxServlet?action=disable_ADScheduleUpdateBanner", //NO I18N
        type: "POST", //NO I18N
        ignorefailuremessage: true,
      });
    },
    donotshowOauthAABanner: function () {
      sdpAjax({
        url: "/servlet/ZRAJaxServlet?action=disableOauthAABanner", //NO I18N
        type: "POST", //NO I18N
        ignorefailuremessage: true,
      });
    },
    donotShowRequestAABanner: function () {
      sdpAjax({
        url: "/servlet/ZRAJaxServlet?action=disableRequestUDFAABanner", //NO I18N
        type: "POST", //NO I18N
        ignorefailuremessage: true,
      });
    },
    donotShowAssetAABanner: function () {
          sdpAjax({
            url: "/servlet/ZRAJaxServlet?action=disableAssetUDFAABanner", //NO I18N
            type: "POST", //NO I18N
            ignorefailuremessage: true,
          });
        },
    /*Function to hide header message stating about non processed SLA escalations for few requests*/
    closeSLAMsg: function (SLAAction) {
      const sla_action = Array.isArray(SLAAction) ? SLAAction[0] : SLAAction;
      sdpAjax({
        url: "/servlet/AJaxServlet", //NO I18N
        contentType: "application/x-www-form-urlencoded;charset=UTF-8", //NO I18N
        type: "POST", //NO I18N
        data: "action=" + sla_action, //NO I18N
        ignorefailuremessage: true,
      });
    },
    setDBPerfCookie: function () {
      var d = new Date();
      d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
      Store.setItem({
        key: "dbperformanceremainder", //NO I18N
        value: d.getTime(),
        days: 7,
        isCookie: true,
      });
    },
    showSecurityAlerts: function (params) {
      /** if the security page already loaded, then show the security alerts */
      if (jQuery("#securityAlert").length) {
        jQuery("#contactCollectionTab > a").trigger("click");
      } else {
        params && params.url && (window.location.href = params.url);
      }
    },
    hideContactCollectionBanner: function () {
      var date = new Date();
      var endtime = date.getTime();
      var expiry_days = sdpheader_data.contact_collection.expiry_days;
      endtime = endtime + 86400000 * expiry_days;
      var remindmeLaterObj = { starttime: date.getTime(), endtime: endtime };
      addPersonalization(
        'CONTACTCOLLECTION_PREFERENCE', //NO I18N
        remindmeLaterObj,
        true,
        {
          is_portalspecific: false,
        }
      );
      jQuery("#contactCollection").hide();
    },
    hideAMSUpdateBand: function () {
      try {
        sdpAjax({
          url: "/servlet/AJaxServlet?action=hideAMSUpdateBand", //NO I18N
          type: "POST", //NO I18N
          ignorefailuremessage: true
        });
      } finally {
        $header.banner.sdpBanner.removeBanner("license_ams_show_strip"); //NO I18N
      }
    },
    setAMSEvalCookie : function (days) {
      var d = new Date();
      d.setHours(0,0,0,0);
      if(days > 3)
      {
        days = days - 3;
      }
      else if(days <= 0)
      {
        days = 30;
      }
      d.setTime(d.getTime() + (days*24*60*60*1000));
      Store.setItem({key:"amsevaluationdays",value : d.getTime(),days: days,isCookie:true}); // NO I18N
    },
    setEvalCookie: function(){
      var d = new Date();
      d.setTime(d.getTime() + (3*24*60*60*1000));
      Store.setItem({key:"evaluationlicensedays",value : d.getTime(),days: 3,isCookie:true}); // NO I18N
    },
    goOnline: function(){
      setTechStatus(1);
      location.reload();
    },
    configureCMDBV1UsageLater : function() {
      const date = new Date();
      // endtime is 2 weeks from now
      const endTime = date.getTime() + 12096e5;
      addPersonalization("CMDB_V1_API_USAGE",{//No I18N
        "starttime": date.getTime(),//No I18N
        "endtime": endTime//No I18N
      });
      jQuery("#cmdb-v1-usage").hide();
    },
    configureCMDBMigrationLater: function() {
      const date = new Date();
      const endTime = date.getTime() + 864e5;
      addPersonalization("CMDB_POST_MIGRATION_REMINDER_LATER",{//No I18N
        "starttime": date.getTime(),//No I18N
        "endtime": endTime//No I18N
      });
      jQuery("#cmdb-post-migration").hide();
      if(jQuery('#cmdb-migration-dialog').length) {
        jQuery('#cmdb-migration-dialog').sdp_zcomponent_dialog("close"); //No I18N
      }
    },
    openSecurityPopup: function(fromSecuritySettings,fromAttachmentSettings) {
      /** call for global function */
      openSecurityPopup(fromSecuritySettings, fromAttachmentSettings);
    },
    hideSecurityBanner: function () {
      // This function is called when the user clicks "Remind me later" on the security
      const license_tpye = sdpheader_data.security_banner[0].license_tpye;
      if(license_tpye !="T")
      {
          const date= new Date();
          let endtime = date.getTime();

        //getting expiry days from the globalconfig table and calculation the expiry time we have changing the date to milliseconds for calculations.
          let expiry_days = sdpheader_data.security_banner[0].expiry_days;
          endtime = endtime+86400000*expiry_days;

          
          const remindmeLaterObj = {"starttime":date.getTime(),"endtime":endtime}; //No I18n
          addPersonalization("SECURITYBANNER_PREFERENCE", remindmeLaterObj, true, { 'is_portalspecific': false }); //NO I18N
          jQuery('#securityrisk a').uitooltip('close'); //NO I18N
          jQuery("#securityrisk").hide();
      }
    },
    hideProxyMessage: function () {
      const date= new Date();
      let endtime = date.getTime();

      //getting expiry days from the globalconfig table and calculation the expiry time we have changing the date to milliseconds for calculations.
      let expiry_days = sdpheader_data.security_advisory[0].expiry_days;
      endtime = endtime+86400000*expiry_days;

      const remindmeLaterObj = {"starttime":date.getTime(),"endtime":endtime}; //No I18n
      addPersonalization("PROXYMESSAGE_PREFERENCE", remindmeLaterObj, true, { 'is_portalspecific': false }); //NO I18N
      jQuery("#proxy_connected").hide();
    },
    setReadStatus: function (advisoryId) {
      if(advisoryId){
        sdpAjax({
          url: "/event/controller", //NO I18N
          type: "POST", //NO I18N
          data: {"action": "setReadStatus", "ID": advisoryId}, //NO I18N
          ignorefailuremessage: true
        });
      }
    }
  },
  // Add helper functions
  helperFunctions: {
    // Equivalent to securityBannerTotalCount Handlebars helper
    securityBannerTotalCount: function(securityBanner) {
      if (!securityBanner) return 0;
      
      return (securityBanner.admin_password ? 1 : 0)
            + (securityBanner.guest_password ? 1 : 0)
            + (securityBanner.user_account_failure ? 1 : 0)
            + (securityBanner.reset_password_first_login ? 1 : 0)
            + (securityBanner.two_factor_auth ? 1 : 0)
            + (securityBanner.disableConcurrentLogin ? 1 : 0)
            + (securityBanner.inActiveSessionTimeout ? 1 : 0)
            + (securityBanner.mobileAppSessionTimeout ? 1 : 0)
            + (securityBanner.isPasswordEncryptionNotEnabled ? 1 : 0)
            + (securityBanner.dc_admin_password ? 1 : 0)
            + (securityBanner.backup_password ? 1 : 0)
            + (securityBanner.https_mode ? 1 : 0)
            + (securityBanner.isAttachmentsNotStoredAsPasswordProtected ? 1 : 0)
            + (securityBanner.disableDomainDropDown ? 1 : 0)
            + (securityBanner.disableShowFilterDomainList ? 1 : 0)
            + (securityBanner.disableHTTPCompression ? 1 : 0)
            + (securityBanner.disableClipboardContentOnPasswordFields ? 1 : 0)
            + (securityBanner.disableAntivirusScanning ? 1 : 0)
            + (securityBanner.disablePushNotificationForURLAccessViolation ? 1 : 0)
            + (securityBanner.disableThrottles ? 1 : 0)
            + (securityBanner.password_policy ? 1 : 0)
            + (securityBanner.attachmentSettings ? 1 : 0)
            + (securityBanner.allowNonLoginUsersToViewSolution ? 1 : 0)
            + (securityBanner.allowLoginUsersForApprovalAction ? 1 : 0)
            + (securityBanner.enableFileProtection ? 1 : 0)
            + (securityBanner.assignLowPrivilegeRolesInIntegrationKey ? 1 : 0)
            + (securityBanner.attachmentPathError ? 1 : 0)
            + (securityBanner.ro_user_configured ? 0 : 1)
            + (securityBanner.dynamicUserAddtion ? 1 : 0)
            + (securityBanner.dynamicUserLogin ? 1 : 0)
            + (securityBanner.password_policy_expires_never ? 1 : 0)
            + (securityBanner.acceptEmailFromNewUser ? 1 : 0)
            + (securityBanner.autoUpdate_disabled ? 1 : 0)
            + (securityBanner.isLocalIPEnabled ? 1 : 0);
    },
    // Equivalent to securityBannerAttachmentTotalCount Handlebars helper
    securityBannerAttachmentTotalCount: function(securityBanner) {
      if (!securityBanner) return 0;
      return (securityBanner.attachmentPathError ? 1 : 0);
    }
  }
};
