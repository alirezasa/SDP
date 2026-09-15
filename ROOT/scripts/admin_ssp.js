// SDP file for writing JS code common to both ApplicationSetting.jsp and Settings.jsp as suggested by thangamani.s@zohocorp.com

// $ssp variable for GlobalConfig update for MSP/SCP Unapproved user settings starts
/**
 * Self service portal for global config val presentation js code prototype starts.
 * ******************************************************************************************************/

if (!admin) {
    var admin = {};
}

admin.ssp = function() {
    // you can define some global values here
    // Functions are being used in Self Service Portal new GLobal Config View
}
admin.ssp.prototype = {
    renderRandomView: function(json) {
        for (var key in json) {
          var data = json[key], type = data.element_type, paramVal = data.param_value, obj = jQuery('#' + key);

          obj.attr('category', data.category);
          obj.attr('data-type', type);

          if (type === 'ternary') {
            var optionToCheck = obj.find('[name=req_status]')[Number(paramVal)];
            if(optionToCheck) {
              optionToCheck.setAttribute('checked', true);
            }
          } else if (type === 'binary') { // NO I18N
            obj.toggleSlider({slider: true, activeClass: 'btn-success'}); // NO I18N

            if (paramVal) {
              obj.find('.toggle-spot')[0].click();
            }
          } else if (type === 'text') { // NO I18N
            obj.find('input').val(paramVal);
          } else if (type === 'select') { // NO I18N
            var selObj = obj.find('select');
            $ssp.appendOpt(paramVal, selObj);
          }
        }
        window.history.pushState('', '', 'SetUpWizard.do?forwardTo=settings'); // NO I18N
    },
    getTech4Notif: function() { // Get all the technician who can approve requester for notification list
        jQuery('#unapproveNotif').select2();

        jQuery.getJSON('/servlet/AJaxServlet?action=approveReqTechList', function(data) {   // NO I18N
            $ssp.addOpt(data, "unapproveNotif", 0); // No I18N
            var approveTech = jQuery('#approveTech').val();
            jQuery('#unapproveNotif').select2('val', approveTech.split(','));  // NO I18N

            jQuery(document).off('change', '#unapproveNotif').on('change', '#unapproveNotif', function() { // NO I18N
                jQuery('#s2id_unapproveNotif').css('border', ''); // NO I18N
            }).off('click', '#approveNewUser').on('click', '#approveNewUser', function() { // NO I18N
                if (!this.checked) {
                    jQuery('#s2id_unapproveNotif').css('border', ''); // NO I18N
                }
            });
        });
    },
    addOpt: function (json, destId, selectedId) { // Append options in select box
        var selBoxObj = jQuery('#' + destId), i, len = json.length;

        $ssp.appendOpt(json, selBoxObj, selectedId);
    },
    appendOpt: function(json, target, selectedId) {
        var selBoxObj = jQuery(target), i, len = json.length;

        for (i = 0; i < len; i++) {
            var data = json[i], opt = document.createElement("option"); // NO I18N

            if (data.id == selectedId || data.selected) {
                opt.selected = true;
            }
            if (data.name != undefined) {
                opt.text = data.name;
            } else {
                opt.text = data.text;
            }

            if (data.disabled) {
                opt.disabled = true;
            }

            opt.value = data.id;
            selBoxObj.append(opt);
        }
    }
}
var $ssp = new admin.ssp();
// $ssp variable for GlobalConfig update for MSP/SCP Unapproved user settings ends