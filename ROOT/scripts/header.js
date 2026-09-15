/* $Id $ */

var template_settings = {};
var sdpheader_data = {};
var msp_acc_data = {};
if(isMSP)
{
  getHeaderDetURL = "/root/servlet/MSPAjaxServlet?action=GetHeaderDetails";//no i18n
}
else
{
  getHeaderDetURL = "/servlet/AJaxServlet?action=GetHeaderDetails";//no i18n
}
var is_license_expired = false;
jQuery.ajax({
  cache: false,
  async: false,
  url: getHeaderDetURL,
  success: function(data) {
    var clone_data = JSON.parse(sdpToJSON(data));
    if(data.desktop_central_menu)
    {
        uem_integrated=data.desktop_central_menu.isintegrated;
        uem_product=data.desktop_central_menu.uemproduct;
    }
    is_service_catalog_enabled = clone_data.template_settings.is_service_catalog_enabled;
    template_settings = clone_data.template_settings;
    sdp_app.isExcludeTech = data.is_exclude_tech;
    processHeaderData(data);
	if(isMSPOrSCP){
		invokeGoogleAnalytics();
	}
    if(data.esm_details && data.esm_details.current_portal.isRetired) {
      is_license_expired = true;
    }
  }
});
