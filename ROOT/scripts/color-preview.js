/* $Id$ */
/*Listview Color Setting scripts*/
var color_setting = {
    color_settings_data:{},
    setting_permission: {//setting personalize for sdadmin/helpdeskconfig, tech_cust checkbox enable/disable, popup header tab render
        "is_mypersonalizeEnable": false, //No i18n
        "is_admin": true, //No i18n
        "render_tabs": "global", //No i18n
    },
    openColorSettingsDropDown: function(modulename) {
        var jQ = jQuery("body"),
            self = this;
        /**
         * Breakage when zohocomponents color picker used
         * Fix for prototype.js | Array filter method error
         * prototype.js?10002:709 Uncaught TypeError: Cannot read property 'indexOf' of undefined
         *     at prototype.js?10002:765
         *     at prototype.js?10002:706
         *     at Array.forEach (<anonymous>)
         *     at Array.each (prototype.js?10002:705)
         *     at Array.findAll (prototype.js?10002:764)
         *     at Object._getEvents (<anonymous>:462:22)
         */
        Array.prototype.filter = function(iterator, context) {
            var results = [];
            var array = this;
            this.forEach(function(value, index) {
                if (iterator.call(context, value, index, array)) {results.push(value)};
            });
            return results;
        };

        // Close popover if in open state
        if(typeof closeDD === "function") {
            closeDD();
        }

        /**
         * Show the loader
         */
        jQ.find("#color-loader").html(ajaxBar());


        popup_open = false;
        /**
         * Check the data is already loaded or not
         */
        if (window["cs_id"]){
            if(!window["cs_enabled"]){
                self.showCSLoader();
                 jQuery('.colorset-popover').addClass("hide");
            }else{
                 jQuery('.colorset-popover').removeClass("hide");
            }
         if( jQuery.isEmptyObject(self.color_settings_data)) {
            var wid = window["cs_id"];
            if(sdp_user.ROLES.indexOf("SDAdmin") === -1){/*Non SDAdmin we pass url to module name to for view only permission*/
                wid = modulename;
                self.setting_permission.is_admin = false;
            }
            if(modulename == "request" && sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1) {
                self.setting_permission.is_admin = true;
            }
            sdpAjax({
                async:false,
                url: "/api/v3/color_settings/" + wid, //No I18N
                success: function(response) {
                    if (response.color_setting) {
                        self.color_settings_data = response.color_setting;
                        var csJSON = self.color_settings_data.color_json;
                        if(typeof csJSON === "string") {
                            csJSON = JSON.parse(csJSON);
                        }
                        var is_mypersonalize = response.color_setting.tech_personalized;
                        if(is_mypersonalize) {//Check technician color customization enable/disable check
                            self.setting_permission.is_mypersonalizeEnable = true;
                            var tech_cust_person = sdp_user.CLIENT_CONF["Color_myPersonalize_"+modulename];//render technician own customization
                            if(self.color_settings_data.is_enabled && tech_cust_person && tech_cust_person != "false") {
                                self.color_settings_data = tech_cust_person;
                                csJSON = self.color_settings_data.color_json;
                                if(typeof csJSON === "string") {
                                    csJSON = JSON.parse(csJSON);
                                }
                                
                                self.setting_permission.render_tabs = "mypersonalize";//No I18N
                                if(csJSON.other_settings[0] && csJSON.other_settings[0].field != "emergency") {
                                    var personalizeOpt = self.personalizeFieldAvailable(modulename, csJSON);
                                    self.color_settings_data["color_json"] = sdpToJSON(personalizeOpt)
                                }
                            }
                        }
                        if(!csJSON["other_settings"].length) {
                            if(sdp_user.ROLES.indexOf("SDAdmin") !== -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1) {
                                popup_open = true;
                             }
                         }
                    }
                }
            });
        }else{
            if( window["cs_id"] && window["cs_enabled"]) {
                jQuery(".colorset-popover").removeClass("hide");
            }
            var csJSON = self.color_settings_data.color_json;
            if(typeof csJSON === "string") {
                csJSON = JSON.parse(csJSON);
            }
            if(!csJSON["other_settings"].length) {
                popup_open = true;
            }
        }
        if(popup_open) {
            self.openColorSettingsPopup(modulename);
            popup_open = true;
            jQuery('.colorset-popover').addClass("hide");
            return ;
        }
        /**
        * Prevent the again server call
        */
        if(self.color_settings_data){
            var color_json = self.color_settings_data.color_json;
            if(typeof color_json === "string") {
                color_json = JSON.parse(color_json);
            }
            if(color_json.other_settings.length){

                        var fieldname = "";
                        var colorObj = [];
                        for (var index = 0, len = color_json["other_settings"].length; index < len; index++) {
                            var item = color_json["other_settings"][index];
                            var values = [];
                            fieldname = item["field"];
                            /**
                             * Iterate the color object to get respective color values
                             */
                            for (var valIndex = 0, valCount = item["values"].length; valIndex < valCount; valIndex++) {
                                values.push(item["values"][valIndex]["name"]);
                            }
                            if(values.length){
                                colorObj.push({
                                    color: item["background_color"],
                                    name: values.join(", ")
                                }); 
                            }
                           
                        }

                        if(!colorObj.length) {
                             if(sdp_user.ROLES.indexOf("SDAdmin") !== -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1 || sdp_user.USERTYPE == "Technician"){//No i18n
                                popup_open = true;
                                self.openColorSettingsPopup(modulename);
                                jQuery('.colorset-popover').addClass("hide");
                                return ;
                             }
                        }
                        /**
                         * Compile the color settings legend data
                         */
                        var cs_popup = true;
                        if(!self.setting_permission.is_admin && !self.setting_permission.is_mypersonalizeEnable) {
                            cs_popup = false;
                        }
                        var datacsl = {cs_items:colorObj, cs_popupAction: cs_popup, module: modulename};
                        renderhbs('#clrbar-cont',"color-settings-legend",datacsl,false,"common"); // NO I18N
                        jQuery('#cs_dropdown_action_'+modulename).off('click.cs_popup').on('click.cs_popup', function() { // NO I18N
                            color_setting.openColorSettingsPopup(modulename);
                        })
                        var fname = color_setting.getFieldnameName(fieldname) || "";
                            fname =  translate("sdp.colorsettings.rowcolors")+"-"+fname;
                        jQuery('.colorset-popover .sb:first').text(fname);
                        if(window["cs_id"] && window["cs_enabled"]) {
                            jQuery(".colorset-popover").removeClass("hide");
                        }
            } else if(sdp_user.ROLES.indexOf("SDAdmin") === -1 && self.color_settings_data.tech_personalized) {
                if(!popup_open) {
                    popup_open = true;
                    self.openColorSettingsPopup(modulename);
                    jQuery('.colorset-popover').addClass("hide");
                    return ;
                }
            }
                        
        }
    }

     if(!window["cs_id"] ||(window["cs_id"] && !window["cs_enabled"]) || (window["cs_id"] && window["cs_enabled"] && !window["is_fields"])){
        if(sdp_user.ROLES.indexOf("SDAdmin") !== -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1 ){
            if(!popup_open) {
                jQuery('.colorset-popover').addClass("hide");
                self.openColorSettingsPopup(modulename);
            }
         }
     }

    },
   getFieldnameName: function(fieldname) {
        var data = {
            "group": translate("common.group"),  // No I18N
            "status": translate("sdp.requests.common.status"),  // No I18N
            "risk": translate("sdp.admin.change.risk"), //NO I18N
            "stage": translate("sdp.admin.change.stage"), //NO I18N
            "impact": translate("sdp.problem.impact"), //NO I18N
            "priority": translate("sdp.requests.common.priority"), //NO I18N
            "emergency": translate("sdp.change.rfc.emergency"), //NO I18N
            "category": translate("sdp.requests.common.category"), //NO I18N
            "change_type": translate("sdp.itil.common.changetype"), //NO I18N
            "urgency": translate("sdp.itil.common.urgency"), // NO I18N
        }
        return data[fieldname];
    },
    /**
    * A methos is used to show the color settings popup loader
    */
    showCSLoader:function(){
            jQuery("#cs-popup-cont").html('<div class="layer-box atp-box  freezelayerbg" style="background:rgba(255,255,255,0.5)"><div class="pos-rel" style="top:45%">'+ajaxBar()+'</div></div>');

    },
    /**
     * A method is used to open the color settings popup
     */
    openColorSettingsPopup: function(modulename) {
        var jQ = jQuery("body"),
            self = this;

            /**
             * close the opened color settings popup
             */
            jQ.find(".colorset-popover").closest(".btn-group").removeClass("open"); // NO I18N
                colorSettings = undefined;

                jQ.find("#cs-dialog").closest(".ui-dialog").remove();  // NO I18N
            /**
             * load the color settings popup
             * Initial it shows only the loading conent
             */
             // show the loader

             self.showCSLoader();
             /**
              * Remove previously appended div from DOM
             */
             jQuery("#cs-dialog").remove();
             var rolecheck = (sdp_user.ROLES.indexOf("SDAdmin") === -1 && sdp_user.USERTYPE == "Technician") ? (modulename == "request" && sdp_user.ROLES.indexOf("HelpdeskConfig") !== -1) ? false : true : false;//No I18N
             if(rolecheck) {
                 self.setting_permission["render_tabs"] = "mypersonalize";//No I18N
             }
             sdpAjax({
                 ignorefailuremessage:true,
                 dataType:"html", // NO I18N
                 url : "/common/ColorSettingsPopup.jsp?dir="+sdp_user.DIRECTION, // No I18N
                 success:function(res){
                    jQuery("#cs-popup-cont").html(res);
                    colorSettings.init({
                        module: modulename,
                        cs_entitiy_id: window["cs_id"] ?cs_id : "",  // NO I18N
                        cs_data: self.color_settings_data,
                        is_enabled:window["cs_enabled"] || false,
                        setting_permission: self.setting_permission
                    });
                 }
             });
    },
    
    personalizeFieldAvailable: function(modulename, csJSON) {
        var colorsetting = csJSON.other_settings;
        var ids = [];
        var activeField = '';
        for(var i=0; i<colorsetting.length; i++) {
            activeField = colorsetting[i].field;
            var val = colorsetting[i].values;
            for(var j=0; j<val.length; j++) {
                ids.push(val[j].id.toString());
            }
        }
        var inputdata = {"list_info":{"start_index":1,"row_count":ids.length,"search_criteria":[{"field":"id","condition":"is","values":ids,"logical_operator":"and"}]}};//No i18n
        if(modulename == "request") {
            var url = "/api/v3/requests/"+activeField;//No i18n
            if(activeField == "status") {
                inputdata["for"] = "list_view_filter"; //No I18N
                inputdata["include_inactive_value"] = true;
            }
        } else if(modulename == "change") {//No i18n
            var url = "/api/v3/changes/"+activeField;//No i18n
        } else if(modulename == "release") {//No i18n
            var url = "/api/v3/releases/"+activeField;//No i18n
        }
        var input = sdpAjaxInputData(inputdata);
        sdpAjax({
            url: url,
            data: input,
            async: false,
            ignorefailuremessage: true,
            success: function(res) {
                var avaField = res[activeField];
                
                for(var i=0; i<colorsetting.length; i++) {
                    var val = colorsetting[i].values;
                    var newAvailablefields = [];
                    for(var j=0; j<val.length; j++) {
                        for(var k=0; k<avaField.length; k++) {
                            if(avaField[k].id.toString() == val[j].id.toString()) {
                                newAvailablefields.push({"id":avaField[k].id,"name":avaField[k].name});
                            }
                        }
                        if(val[j].id.toString() == "0" || val[j].id.toString() == "-1") {
                            newAvailablefields.push({"id":val[j].id,"name":val[j].name});
                        }
                    }
                    colorsetting[i].values = newAvailablefields;
                }
            }
        });
        return csJSON;
    },
};

/**
 * helper for color settings
 *
*/
var color_settings_helper = {
    /**Color setting object */
    color_settings: {},
    /**
      * A method is used to call color settings api
      * @param {string} module represet the module name
      * @param {function} callback callback function
      */
     callApi: function(module, callback) {
       var self = this;
       sdpAjax({
           dataType:"html",  //No I18N
           method: "GET", //No I18N
           ignorefailuremessage:true,
           url: "/api/v3/color_settings/" + module, //No I18N
           success: function(res) {
             try {
               resJSON = JSON.parse(res);

             } catch (error) {
               resJSON = res;
             }
             var clrJSON = resJSON.color_setting.color_json;
            if(typeof clrJSON === "string") {
                clrJSON = JSON.parse(clrJSON);
            }
             if(resJSON.color_setting.is_enabled && resJSON.color_setting.tech_personalized) {//Check technician color customization enable/disable check
                 var rendermycust = sdp_user.CLIENT_CONF["Color_myPersonalize_"+module];
                 if(rendermycust && rendermycust != "false") {
                    resJSON = {"color_setting": rendermycust}; //No I18N
                 }
             }

               if (jQuery.isFunction(callback)) {
                   res = self.mappingData(resJSON);
                   callback(res);
               }
           },
           error: function(res) {
               if (jQuery.isFunction(callback)) {
                   callback(res);
               }
           }
       });
   },

   /**
     * A method is used to mapped the api data into desired format for reduce the loop
     * @param {objecj} data color settings api data
     */
    mappingData: function(data) {
      var mapped_columnName = {
          status: "status", //NO I18N
          group: "group", //NO I18N
          risk: "risk", //NO I18N
          stage: "stage", //NO I18N
          impact: "impact", //NO I18N
          priority: "priority", //NO I18N
          emergency: "emergency", //NO I18N
          change_type: "change_type", //NO I18N
          category: "category", //NO I18N
          urgency: "urgency", //NO I18N
      };
      default_background = "#fff";  //No I18N
      var background = "#fff";  //No I18N
      var color_json = data && data.color_setting && data.color_setting.color_json;
      if (color_json) {
            if(typeof color_json === "string") {
                color_json = JSON.parse(color_json);
            }
          var mapped_datas = {};/* Allowe color setting configured with default and backgroup with out field's */
            default_background = color_json.default_settings.default_background;
            background = color_json.default_settings.background_color || "#fff"; //No I18N
            if(color_json["other_settings"][0] && color_json["other_settings"][0]["field"]) {
                var field = color_json["other_settings"][0]["field"];
                field = mapped_columnName[field];
                mapped_datas[field] = {};
                currentMapping = mapped_datas[field];
                for (var i = color_json.other_settings.length - 1; i >= 0; i--) {
                    var currentObj = color_json.other_settings[i];
                    if (currentObj["values"].length) {
                        for (var j = 0; j < currentObj.values.length; j++) {
                            currentMapping[currentObj.values[j]["id"]] = {
                                name: currentObj.values[j]["name"], //NO I18N
                                background_color: currentObj.background_color
                            };
                        }
                    }
                }
            }
      }
      mapped_datas["field"] = field || [];
      mapped_datas["is_enabled"] = data && data.color_setting ?  data.color_setting["is_enabled"] : false;
      mapped_datas["default_color"] = default_background;
      mapped_datas["default_background"] = background;
      mapped_datas["columns"] = color_json["default_settings"].columns || [];
      return mapped_datas;
  }
}
