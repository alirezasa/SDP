/* $Id$ */
var themes = {
    // Geting all required selectors
    selectors : function(){
        var jB = jQuery('body'),
            customFontList = jB.find("#custom-font-list"),
            changeFont = jB.find("#change-font-style"),
            defaultTabSelect = jB.find("#defaulttabselect"),
            defaultPreClr = jB.find("#default-pre-color");

        return {
            jB : jB,
            customFontList : customFontList,
            changeFont : changeFont,
            defaultTabSelect : defaultTabSelect,
            defaultPreClr : defaultPreClr
        }
    },
    settings: {},
    renderThemeHbs: function(isReload) {
        if(this.isLoaded && !isReload) {
            return;
        }
        var templateData = {orgName: sdpheader_data.org_name};
        var colors = ["body_background_color","top_header_color","tab_selected_color","tab_selected_text","tab_normal_text","tab_hover_color","primary_button_color","primary_button_text","primary_button_border","link_tab_line_color"]; //No I18N
        themes.colors = jQuery.extend([], colors);
        colors.insertAt(0, 'admin.theme.body'); // NO I18N
        colors.insertAt(2, 'admin.theme.header'); // NO I18N
        colors.insertAt(8, 'admin.theme.other'); // NO I18N
        colors.insertAt(13, 'admin.theme.font_family'); // NO I18N
        templateData.colors = colors;
        
        var defaultThemes = {"Green": "rgb(12, 173, 119)", "Red": "rgb(206, 76, 76)", "Blue": "rgb(0, 141, 221)", "Violet": "rgb(155, 89, 182)"}; //No I18N
        themes.defaultThemes = defaultThemes;

        var tempThemes = [];
        jQuery.each(defaultThemes, function(key, val) {
            tempThemes.push({name: key, color: val});
        });
        templateData.defaultThemes = tempThemes;
        this.getGlobalPersonalizationId("theme_settings"); //NO I18N
        themes.settings = getThemeSettings();
        templateData.layout = themes.settings.layout || "topbar";  // NO I18N
        templateData.isServiceDeskBuild = sdp_app.IS_SDP;
        templateData.previewModules = sdpheader_data.modules.items.slice(0, sdp_app.IS_SDP? 7:8);
		
		//personalized font family set to select2
		this.getfontSelect2(themes.settings);
		
        renderhbs( '#theme_tab','theme-settings', templateData, false, 'admin'); // NO I18N
        if(sdp_app.IS_MSP&&!(parent.sdp_app.themes.IS_USER_THEME_ENABLED && parent.sdp_user.CLIENT_CONF.userTheme  && parent.sdp_user.CLIENT_CONF.userTheme.fontFamily)){
    		var font =  themes.settings.font_family;
    			 if(document.body) {
                    document.body.style.fontFamily = font;  
                }
    	}
        themes.init(themes.colors);
        if(templateData.layout!='topbar'){
            jQuery("#top_header_color").css("background-color","#fff"); //NO I18N
            jQuery("#top_header_color > ul").addClass("hide");
        }
        jQuery(".selecttwo").select2({
            dropdownCssClass: 'selectDropDown' // NO I18N
        });
    },

    // Initialise the events
    init : function(colors) {
        var allselector = this.selectors();
        var jQBody = jQuery("body");
        var self = this;
        allselector.customFontList.on('change', function () { //NO I18N
          allselector.changeFont.css('font-family', allselector.jB.find(this).select2("data").style); //NO I18N
        });

        // Change li active the demo admin menu
        allselector.jB.find("z-accordion#cust_thm_adminmenu z-accitemcontent li").on('click',function(){
            allselector.jB.find(this).closest("z-accordion").find("z-accitemcontent li").removeClass("active").end().end() //NO I18N
                .addClass("active");
        });
        
        for(i=0;i<colors.length;i++) {
            this.bindEvent(colors[i]);
        }
		//Set font api call using sdp_select2 function in theme font input
		var fontdata = $fontapi.fontSelect2Opt();
			fontdata = $fontapi.fontSortOrder(fontdata);
		var options = {
			data: fontdata,
			formatResult: function(resdata, _self) {
				return '<span id='+resdata.id+' style="font-family: '+e_attr(resdata.style)+'" class="text-wrap">'+e_html(resdata.text)+'</span>';
			}
		};
		jQuery("[data-id=custom-font-list]").select2(options).select2("data",self.settings.font_family); //NO I18N
        allselector.changeFont.css('font-family', this.settings.font_family); //NO I18N

        if(this.settings.css_type=='Custom') {
            this.enableCustom();
        }
        else {
            jQuery("#"+this.settings.css_type+"Theme").addClass("active");
            jQuery("#CustomColor").addClass(jQuery("#"+this.settings.css_type+"Theme").data("thmclr"));
        }
        if(sdp_app.IS_MSP){
            setTimeout(function(){
                var persAccId=document.getElementById("persAccId").value;
                if(persAccId!="0"){
                    document.getElementById('allowCustomizeTheme').nextSibling.remove();
                    document.getElementById('allowCustomizeTheme').remove();
                    document.getElementById('allowCustomizeThemeHelp').nextElementSibling.remove();
                    document.getElementById('allowCustomizeThemeHelp').remove();
                    jQuery('[for=allowCustomizeTheme]').remove();
                }
            },1000);
        }
        if(this.settings.allow_user_customization) {
            jQuery("#allowCustomizeTheme").trigger('click');
        }
        themes.toggleHeaderIcon(themes.settings.layout);
        jQBody.find("#settings-navigation input[type='radio']").off().on("change", function(){
            var layoutName = jQBody.find("#settings-navigation input[type='radio']:checked").val();
            self.changeLayout(layoutName);
        });
        this.isLoaded = true;
    },

    //color picker event binding
    bindEvent: function(key) {
        var _this = themes;
        _this.setBgColor(key, _this.settings[key]);

        jQuery("#"+key+"_picker").zcolorpicker({
            defaultColorButton: false,
            'advancedPickerOptions': { //NO I18N
                'OKButtonLabel': 'Done' //NO I18N
            }
        });

        jQuery("#"+key+"_preview").on('click', function() {
            picker = jQuery("#"+key+"_picker");
            if(_this.settings.css_type=='Custom') {
                color = _this.settings[key];
                if (picker.is(':visible')) {
                    picker.zcolorpicker('close'); //NO I18N
                } else {
                    picker.off('zcolorpickerchange').on('zcolorpickerchange', function(origEvent) { //NO I18N
                        _this.setBgColor(key, origEvent.detail.color);
                    });
                    picker.zcolorpicker('setAttribute', 'value', color); //NO I18N
                    picker.zcolorpicker('open'); //NO I18N
                }
            }
        });
    },

    setBgColor: function(key, color) {
        color = color === 'none' ? 'transparent' : color; //NO I18N
        jQuery("#"+key+"_preview").css('background', color); //NO I18N
        document.documentElement.style.setProperty("--"+key+"_preview", color); //NO I18N
        if(key=='link_tab_line_color') {
            themes.settings.input_border_color = themes.setOpacity(color, "0.7"); // NO I18N
            themes.settings.input_border_shadow = themes.setOpacity(color, "0.3"); // NO I18N
            document.documentElement.style.setProperty("--input_border_color_preview", themes.settings.input_border_color); //NO I18N
            document.documentElement.style.setProperty("--input_border_shadow_preview", themes.settings.input_border_shadow); //NO I18N
        }
        else if(key=="primary_button_color") {
            rgb = color.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
            darkred = Math.round(rgb[0] - rgb[0] * 0.10);
            darkGreen = Math.round(rgb[1] - rgb[1] * 0.10);
            darkBlue = Math.round(rgb[2] - rgb[2] * 0.10);
            if(rgb[3]==undefined) {
                rgb[3] = "1";
            }
            rgb = "rgba("+darkred+","+darkGreen+","+darkBlue+","+rgb[3]+")"; // NO I18N
            themes.settings.primary_button_hover_color = rgb;
            themes.settings.primary_button_light_color = themes.setOpacity(color, "0.1"); // NO I18N
        }
        themes.settings[key] = jQuery("#"+key+"_preview").css('background-color');
    },

    setOpacity: function(color, opacity) {
        if(color.startsWith("rgba")) {
            return color.slice(0, color.lastIndexOf(","))+", "+opacity+")";
        }
        else if(color.startsWith("rgb")) {
            return color.replace(")", ", "+opacity+")").replace("rgb", "rgba");
        }
    },

    defaultColorChange : function(ele, css_type) {
        var jThis = jQuery(ele);
        this.selectors().defaultPreClr.find("span.thm-clr-circle").removeClass("active").end()
            .find("#cust-clr-change").addClass('hide');
        jThis.addClass("active");
        jQuery("#CustomColor").removeClass("green-thm red-thm blue-thm violet-thm").addClass(jThis.data("thmclr"));
        jQuery('#CustomColor div[data-rel="clr-changer"]').removeClass("cur-ptr").addClass("cur-na").attr('title', translate("admin.theme.disabled.tooltip"));

        this.settings.css_type = css_type;
        var defaultThemes = themes.defaultThemes;

        this.setBgColor("body_background_color", "rgb(243, 243, 243)"); //NO I18N
        this.setBgColor("top_header_color", "rgb(37, 46, 53)"); //NO I18N
        this.setBgColor("tab_hover_color", "rgba(59, 71, 81, 0.6)"); //NO I18N
        this.setBgColor("tab_selected_text", "rgb(255, 255, 255)"); //NO I18N
        this.setBgColor("tab_normal_text", "rgb(255, 255, 255)"); //NO I18N
        this.setBgColor("primary_button_text", "rgb(255, 255, 255)"); //NO I18N
        this.setBgColor("tab_selected_color", defaultThemes[this.settings.css_type]); //NO I18N
        this.setBgColor("primary_button_color", defaultThemes[this.settings.css_type]); //NO I18N
        this.setBgColor("primary_button_border", defaultThemes[this.settings.css_type]); //NO I18N
        this.setBgColor("link_tab_line_color", defaultThemes[this.settings.css_type]); //NO I18N
    },

    enableCustom: function() {
        this.settings.css_type = 'Custom'; //NO I18N
        jQuery("#default-pre-color .active").removeClass("active");

        this.selectors().defaultPreClr.find("span.thm-clr-circle").removeClass("active");
        jQuery("#CustomTheme .tick1").removeClass("hide");
        this.selectors().jB.find('div[data-rel="clr-changer"]').removeClass("cur-na").addClass("cur-ptr").removeAttr("title"); //NO I18N

        jQuery("#CustomColor").removeClass("green-thm red-thm blue-thm violet-thm");
    },

    saveTheme: function() {
        if(sdp_app.IS_DEMO_BUILD && sdp_user.LOGINNAME!="administrator") {
            disableForDemo();
            return;
        }
        if(sdpheader_data.esm_details.current_portal.canAllowedDBOperation==false) {
            showalert('failure', translate("mdh.restricted.portals.cud.msg"),'isAutoHide=false');//No I18N
            return;
        }

        var inputObject = themes.settings;
        var isallowedCustomizeTheme = jQuery("#allowCustomizeTheme").prop("checked") ?true:false; ///NO I18N
        var currentFontFamily = jQuery("#custom-font-list").select2("data").style; //NO I18N
        var currentLayout = jQuery("#settings-navigation").attr("data-layout");
        var refreshHeader = false, isFontChanged = false, isLayoutChanged = false;
        if(inputObject.allow_user_customization != isallowedCustomizeTheme) {
            refreshHeader = true;
        }
        if(inputObject.font_family != currentFontFamily) {
            isFontChanged = true;
        }
        var userTheme = sdp_user.CLIENT_CONF.userTheme;
        if(inputObject.layout != currentLayout) {
            if(!isallowedCustomizeTheme || !(userTheme && userTheme.layout!="")) {
                isLayoutChanged = true;
            }
        }
        inputObject.font_family = currentFontFamily;
        inputObject.allow_user_customization = isallowedCustomizeTheme;
        inputObject.layout = currentLayout;
        var dataVal = window.sdpAjaxInputData(inputObject);
        jQuery("#theme_submit").prop("disabled", false).val(translate("sdp.admin.common.saving"));  //NO I18N
        var url='/servlet/AJaxServlet?action=saveThemes';//NO I18N
		var accID;
		if(sdp_app.IS_MSP){
			accID=document.getElementById('persAccId').value;
			url='/servlet/AJaxServlet?action=saveThemes&persistentAccId='+accID;	//NO I18N	
		}	
        sdpAjax({
            type: 'POST', //NO I18N
            url: url,  
            data: dataVal,
            success: function(data) {
                if(data.success) {
                	if(sdp_app.IS_MSP&&accID!="0"){
						jQuery("#theme_submit").prop("disabled", false).val(translate("sdp.common.save")); //No I18N
                        showalert('success', translate("admin.theme.success"),'isAutoHide=true');//No I18N
					}		
                    var pers_obj = {
                        key: 'theme_settings', //No I18N
                        data: inputObject,
                        async: false,
                        success: function() {
                            sdp_app.themes.theme_settings = inputObject;
                            jQuery("#theme_submit").prop("disabled", false).val(translate("sdp.common.save")); //No I18N
                            showalert('success', translate("admin.theme.success"),'isAutoHide=true');//No I18N
                        }
                    };
                    if(!sdp_app.IS_MSP || (sdp_app.IS_MSP && accID=="0")){
                    setGlobalPersonalization(pers_obj);
                    }

                    //Updating the layout
                    var oldLayout = jQuery("body").attr("data-header-tabs");
                    if(refreshHeader || isLayoutChanged) {
                        var changedLayout = inputObject.layout;
                        if((refreshHeader && isallowedCustomizeTheme) && (userTheme && userTheme.layout!="")) {
                            changedLayout = userTheme.layout;
                        }
                        if(oldLayout!=changedLayout) {
                            window.location.reload();
                        }
                    }
                    
                    //if isUserallowedtoCustomizetheme or Font family changed
                    if(refreshHeader || isFontChanged) {
                    	if(!sdp_app.IS_MSP) {
                        sdp_app.themes.FONT_FAMILY = currentFontFamily;
                    	}
                        if(isallowedCustomizeTheme) {
                        	if(!sdp_app.IS_MSP|| sdp_app.IS_MSP&&sdp_user.USERTYPE=="Technician"&&accID=="0"){
                            jQuery(".themePersonalize").removeClass("hide");
                            jQuery(".nightmodeSwitch").removeClass("hide");
                            }
                            if(userTheme) {
                                if(userTheme.theme!='') {
                                    var cssFileName = "user_styles_"+userTheme.theme+".css?"+sdp_app.BUILD_NUMBER; //NO I18N
                                    jQuery('body').append('<link rel="stylesheet" href="/custom/style/'+cssFileName+'" type="text/css" />');//No I18N
                                }
                                if(userTheme.fontFamily!='') {
                                    currentFontFamily = (typeof userTheme.fontFamily === "object") ? userTheme.fontFamily.style : userTheme.fontFamily;//No I18N
                                }
                                if(userTheme.nightMode!= false) {
                                     jQuery('body').attr('theme','dark-mode'); //NO I18N
									 jQuery('.nightmodeSwitch input').prop('checked', true); //NO I18N
                            }
                        }
                        }
                        else {
                        	if(!sdp_app.IS_MSP|| sdp_app.IS_MSP&&sdp_user.USERTYPE=="Technician"&&accID=="0"){
                            jQuery(".themePersonalize").addClass("hide");
							jQuery('body').removeAttr('theme'); //NO I18N
                            jQuery(".nightmodeSwitch").addClass("hide");
                        }
                        }
                        document.body.style.fontFamily = currentFontFamily;
                        if(!sdp_app.IS_MSP || (sdp_app.IS_MSP && accID=="0")) {
                        sdp_app.themes.IS_USER_THEME_ENABLED = isallowedCustomizeTheme;                        
                    }
                    }

                    //if the user personalized theme is not allowed or not set
                    if(!isallowedCustomizeTheme || !userTheme || (userTheme && userTheme.theme=='')) {
                        var portalId = '';
                        if(sdp_app.IS_MDH_SETUP) {
                            if(sdp_app.PORTAL_ID!=1) {
                                portalId = '_'+sdp_app.PORTAL_ID;
                            }
                        }
                        var cssFileName = "user_styles"; //NO I18N
                        if(themes.settings.css_type=='Custom') {
                        	if(sdp_app.IS_MSP&&accID!="0"){
								 cssFileName = cssFileName+portalId+'__'+accID+'.css?'+new Date().getTime(); //NO I18N
							}else{
                            cssFileName = cssFileName+portalId+'.css?'+new Date().getTime(); //NO I18N
                        }
                        }
                        else {
                            cssFileName = cssFileName+"_"+themes.settings.css_type+'.css';
                        }
                        jQuery('body').append('<link rel="stylesheet" href="/custom/style/'+cssFileName+'" type="text/css" />');//No I18N
                    }

                    //updating the user personalize UI
                    if(userTheme && isallowedCustomizeTheme) {
                        sdp_app.themes.IS_USER_THEME_ENABLED = false;
                        if(sdp_user.CLIENT_CONF.userTheme.layout == "") {
                            jQuery("#navigation-menu #"+inputObject.layout).click();
                            //ThemeCustomizer.layout(inputObject.layout);
                        }
                        if(sdp_user.CLIENT_CONF.userTheme.fontFamily == "") {
							themes.getfontSelect2(inputObject);
                            jQuery("#userCustomFont").select2("data",inputObject.font_family); //NO I18N
                        }
                        if(sdp_user.CLIENT_CONF.userTheme.theme == "" && inputObject.css_type!='Custom') {
                            jQuery(".pro-theme li[data-theme] > span").addClass("vhide");
                            jQuery(".pro-theme li[data-theme='" + inputObject.css_type + "'] > span").removeClass("vhide");
                        }
                        sdp_app.themes.IS_USER_THEME_ENABLED = true;
                    }
                    if(jQuery("#userCustomFont").val() == null) {
                        jQuery("#userCustomFont").val(currentFontFamily);
                }
                    /**
                     * For getting the global personalization id.
                     */
                    setTimeout(function(){
                        window.location.reload(true);
                    },1000);
                }
                else {
                    showalert('failure', translate("admin.theme.failure"),'isAutoHide=false');//No I18N
                }
            }
        });
    },

    getGlobalPersonalizationId: function(key) {
        if(sdp_app.IS_MSP && key=="theme_settings"){
            var accID="0";
            if(document.getElementById('persAccId')!=null){
                accID=document.getElementById('persAccId').value;
            }
            if(accID != 0){
                key+="__"+accID;
            }
        }
        if((typeof(global_personalization)=="undefined") || global_personalization[key]==undefined) {
            getGlobalPersonalization(key);
        }
        return (typeof(global_personalization)!="undefined") ? (global_personalization[key] ? global_personalization[key] : 0) : 0; //No I18N
    },

    processHistory: function(history) {
        var colors = ["body_background_color","top_header_color","tab_selected_color","tab_selected_text","tab_normal_text","tab_hover_color","primary_button_color","primary_button_text","primary_button_border","link_tab_line_color"]; //No I18N
        themes.colors = jQuery.extend([], colors);
        var defaultThemes = {"Green": "rgb(12, 173, 119)", "Red": "rgb(206, 76, 76)", "Blue": "rgb(0, 141, 221)", "Violet": "rgb(155, 89, 182)"}; //No I18N
        themes.defaultThemes = defaultThemes;
        var keys = themes.colors;
        keys = keys.concat(["css_type", "allow_user_customization", "font_family", "layout"]); //No I18N
        var i18nKeys = {"layout": "admin.theme.navigation.menu"}; //No I18N

        $history.processHistory(history);
        for(var h=0, hlen=history.length; h<hlen; h++) {
            var diff = history[h].diff;
            if(diff){
            for(var d=0; d<diff.length; d++) {
                if(diff[d].hasOwnProperty("previous_value") && diff[d].current_value) {
                    if(!diff[d].field || diff[d].field.name !== "data") {
                        diff.splice(d, 1);
                        d--;
                        continue;
                    }
                    var prev_val = diff[d].previous_value && JSON.parse(diff[d].previous_value);
                    var curr_val = JSON.parse(diff[d].current_value);
                    var htmlCurrVal = "";

                    if(prev_val==null) {
                        prev_val = {};
                    }

                    var isThemeChanged = (prev_val.css_type!=curr_val.css_type && curr_val.css_type!='Custom'); //No I18N
                    for(var key in curr_val) { 
                        var keyIndex = keys.indexOf(key);
                        if(keyIndex!=-1 && ((isThemeChanged && keyIndex>9) || (!isThemeChanged && prev_val[key]!=curr_val[key]))) {
                                var label = translate("admin.theme."+key);
                            if(i18nKeys[key]) {
                                    label = translate(i18nKeys[key]);
                            }
                                htmlCurrVal = htmlCurrVal+"<p>"+translate(label)+" : ";
                            if(keyIndex<=9) {
                                htmlCurrVal = htmlCurrVal+"<em class='priority-badge block-bordered mr3' style='background-color:"+curr_val[key]+"'>&nbsp;</em>  ";
                            }
                            else if(key=='css_type' && curr_val[key]!='Custom') {
                                htmlCurrVal = htmlCurrVal+"<em class='priority-badge block-bordered mr3' style='background-color:"+themes.defaultThemes[curr_val[key]]+"'>&nbsp;</em>  ";
                            }
                            htmlCurrVal = htmlCurrVal+curr_val[key]+" </p>";
                        }
                    }
                    if(htmlCurrVal=="") {
                            htmlCurrVal = translate("sdp.inventory.audit.nochanges");
                    }
                    diff[d].current_value = htmlCurrVal;
                }
            }
        }
        }
    },
    changeLayout: function(layout) {
        jQuery("#settings-navigation").attr("data-layout", layout);

        if(layout === "topbar"){
            jQuery("#SideBarPreview").addClass("hide");
            jQuery("#top_header_color").css("background","var(--top_header_color_preview)");  // NO I18N
            jQuery("#top_header_color > ul").removeClass("hide");
        }
        else{
            jQuery("#SideBarPreview").removeClass("hide");
            jQuery("#top_header_color").css("background","#fff");  // NO I18N
            jQuery("#top_header_color > ul").addClass("hide");
        }
        themes.toggleHeaderIcon(layout);
        jQuery("#change-font-style").attr({
            'data-header-tabs':layout,  // NO I18N
            'data-header-preview-tabs':layout  // NO I18N
        });
    },
    toggleHeaderIcon: function(layout) {
        if(layout === "topbar"){
            jQuery("#themePreviewHeaderImage").removeClass("hide");
            jQuery("#themePreviewOrgName").addClass("hide");
        }
        else {
            jQuery("#themePreviewOrgName").removeClass("hide");
            jQuery("#themePreviewHeaderImage").addClass("hide");
        }
    },
	
	/*Font API scripts Start*/
	add_remove_myfontlist: false,//Font popup section if any font added/removed from font list event trigger we set as true after popup close trigger page reload
	editfontopt: false,//Used for edit custom font name using id
	animateid: "",//for UI animate/highlight the font name using function highlightfn
	uploadFontPopup: function() {/** Font Customization Popup render **/
		var self = this;
		jQuery("#font_library_popup").find("#uploadFont").html(ajaxBar());
		jQuery('#font_library_popup').dialog({//NO I18N
			width: 920,
			modal: true,
			draggable: false,
			resizable: false,
			dialogClass: 'pos-fix',//NO I18N
			position: { my: "center top", at: "center top+20", of: window },//NO I18N
			beforeClose: function() {
				if(jQuery("#freeze-layer").length !== 0) {/*Check history popup overlay present or not, Its static now maybe preview component changed then need updated*/
					return false;
				}
				jQuery('#alertbox').find('li.alert-danger').remove();
			},
			close:function(){
				jQuery(this).dialog("destroy"); //No I18N
				/*window refresh for application/user personalization variable configuration if any event triggered in font library ( added/removed/deleted )*/
				if(self.add_remove_myfontlist) {
					window.location.reload();
				} else {
					themes.renderThemeHbs(true);//render admin theme section
				}
				self.editfontopt = false;
			},
			open: function() {
				setTimeout(function() {
					themes.renderFontui();
				},10);
			}
		});
	},
	availablefont: [],
	/**
     * Font select2 options added in theme font / Profile font input element
     *  @param prop {object} select font object
     */
	getfontSelect2: function(prop) {
		jQuery.each(sdp_app.FONTS, function( index, value ) {
			if(value.name == prop.font_family || value.style == prop.font_family) {
				prop.font_family = value;
				prop.font_family["text"] = value.name;
			}
		});
	},
	getajaxFont: function() {
		var data = {};
		var json_data = {"list_info":{"start_index":1,"row_count": 100,"sort_field":"name","sort_order":"asc"}};// NO I18N
		sdpAjax({
			url: '/api/v3/fonts',//NO I18N
			async: false,
			data: sdpAjaxInputData(json_data),
			ignorefailuremessage: true,
			success: function(res) {
				data = res;
			}
		});
		return data;
	},
	renderFontui: function() {/** Render fonts in font library and generate / set style file(CSS) to #uploadFont for font family configuration **/
		var self = this;
		self.availablefont = [];
		var res = self.getajaxFont();
		if(!jQuery.isEmptyObject(res)) {
			var fontdata = {}, cssStyle = "", newdata = [];
			res.fonts.forEach(fres => {
				if(fres.type == "newfontfile") {
					var fname = fres.name;
					var fileid = fres.id;
					var filename = fres.filename;
					var attachfiletype = cl_attach.extension(filename);
					var formattype = "truetype"; // No I18N
					if (attachfiletype == "woff") {
						formattype = "woff"; // No I18N
					} else if (attachfiletype == "woff2") { // No I18N
						formattype = "woff2"; // No I18N
					} else if (attachfiletype == "otf") { // No I18N
						formattype = "opentype"; // No I18N
					}
					var newString = "@font-face { font-family: '"+ fname +"'; src: url('/custom/font/"+fileid+"/"+filename+"') format('"+formattype+"'); font-weight: normal; font-style: normal;}"; // No I18N
					cssStyle += newString;
				}
				self.availablefont.push(fres.name);
				newdata.push(fres);
			});
			fontdata["selected_fontFamily"] = sdp_app.themes.FONT_FAMILY;//NO I18N
			fontdata["custom_fontFamily"] = newdata;//NO I18N
			renderhbs('#uploadFont','font-library',fontdata, false, "admin", true, "", function(){// NO I18N
				jQuery("<style/>").text(cssStyle).appendTo(jQuery("#uploadFont"));//Add all fonts style to header data
				if(self.animateid != "" && jQuery("#"+self.animateid)) {
					highlightfn(jQuery("#"+self.animateid).get(0),'autoscroll=true,highlight=true,popup=true,popupparentnode=#uploadFont');
					self.animateid = "";
				}
				jQuery("#font_library_popup").find("#upload-font-style").css("font-family",sdp_app.themes.FONT_FAMILY);//NO I18N
			});
		}
	},
	/**
     * Font preview UI
     *  @param $this {element} active element
     *  @param style {string} css for active element
     */
	previewFontui: function($this,style) {
		jQuery("#font_library_popup").find("#fontUI li").removeClass("open");//NO I18N
		jQuery($this).parent().addClass("open");//NO I18N
		jQuery("#font_library_popup").find("#upload-font-style").css("font-family",style);//NO I18N
	},
	/**
     * Font form page show/hide
     *  @param loadform {boolean} Hide/Show form page
     */
	fontFormload: function(loadform) {
		var self = this;
		var fontpopup = jQuery("#font_library_popup");
		if(loadform) {
			fontpopup.find("[data-id=upload-formfont]").animate({
				left: '0'
			}, function() {//After form page animated disable event for font library, focus font name input field
				fontpopup.find(".font-popup .font-library,[data-id=updatefont]").addClass("opac5").css("pointer-events","none"); // NO I18N
				fontpopup.find("[name=fontname]").focus();
				if(self.editfontopt) {//Update button show
					fontpopup.find(".font-popup").find("[data-id=addfont]").addClass("hide").end().find("[data-id=updatefont]").removeClass("hide");
				} else {//Save button show
					fontpopup.find(".font-popup").find("[data-id=addfont]").removeClass("hide").end().find("[data-id=updatefont]").addClass("hide");
				}
			});
		} else {
			fontpopup.find("[data-id=upload-formfont]").animate({
				left: '120%'
			}, function(){//After font library animated remove disable event for font library
				themes.renderFontui();
				fontpopup.find(".font-popup .font-library").removeClass("opac5").css("pointer-events",""); // NO I18N
				fontpopup.find(".font-popup").find("[name=fontname]").val("").end().find("#font_cus").val("").end().find("[name=addfont]").text("").closest("label").removeClass("opac5").css("pointer-events","");
				
				self.editfontopt = false;
			});
		}
	},
	/**
     * Browser font file event, set font name and type to input fields
     *  @param $this {element} Input file element
     */
	uploadFontInput: function($this) {
		var input = $this;
		if (input.files && input.files.length == 0) {
			return false;
		} else if (input.files && input.files.length > 0) {
			var filename = input.files[0].name.split('.');
			jQuery("#font_library_popup").find('[name=fontname]').val(filename[0]);
			jQuery("#font_library_popup").find('[name=addfont]').text(input.files[0].name);
		}
	},
	/**
	 * Font name validation
     *  @param filename {element} font name element
     */
	fontnameValidation: function(filename) {
		var valid = true;
		var fontnamei18n = translate("admin.theme.font_family") + ' ' + translate("sdp.common.name");
		if (filename == '') {//empty error message
			showalert('failure',translate('common.validation',[fontnamei18n]),'closeOnEscKey=yes');// No I18N
			valid = false;
		}
		var pattern = /['<>�"/\\]/g;
		var dottspattern = /^(?!.*\.|\.).*$/gm;
		if(pattern.test(filename) || !dottspattern.test(filename)) {
			showalert('failure',translate('constraints.not.allowed.for.field.type',["<strong>../\\'<>\"</strong>",fontnamei18n]),'closeOnEscKey=yes');// No I18N
			valid = false;
		}
		return valid;
	},
	uploadFont: function() {
		/**
			Upload font to font library
				1. Font name mandatory for upload fonts
				2. Right now skip "Roboto" font name for upload
				3. Upload in two ways
					a. OS supportted fonts "Font name" only validated
					b. File to upload using attachment api call add file to application after that upload the font
		**/
		var data = new FormData();
		var filename = jQuery("#font_library_popup").find('[name=fontname]').val();
		var self = this;
		var valid = self.fontnameValidation(filename);
		if(!valid) {
			return false;
		}
		if (this.availablefont.indexOf(filename) != "-1") {
			var keyfontname = "<strong>" + translate("admin.theme.font_family") + ' ' + translate("sdp.common.name").toLowerCase() + "</strong>";
			showalert('failure',translate('common.entity.name.already.exist.msg',[keyfontname,"<strong>" + translate("sdp.common.name")+"</strong>"]),'closeOnEscKey=yes');// No I18N
			return false;
		}
		var fdetails = { "type" : "osfonts"}; // NO I18N
		var iserror_fileattachment = false;
		
		var input = jQuery("#font_library_popup").find("#font_cus").get(0);
		if (input.files && input.files.length > 0) {
			var allowed_ext = ["otf", "ttf", "woff", "woff2"]; // NO I18N
			var attachfiletype = cl_attach.extension(input.files[0].name);
			//Validate the file type
			if(allowed_ext.indexOf(attachfiletype) === -1) {
				showalert("failure", translate("attachment.file.type.error",[allowed_ext.toString()]), "closeOnEscKey=yes", "multi"); //NO I18N
				return false;
			}
			var filesize = "";
			jQuery.each(input.files, function(index, file) {
				filesize = file.size;
				data.append("input_file", file, file.name.replaceAll(" ","-"));// No I18N
			});
			if (filesize / 1024 / 1024 > sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB) {
				showalert("failure", translate("sdp.api.attachment.upload.size.failed", ["[ <strong>" + filename + "</strong> ]",sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB]), "closeOnEscKey=yes", "multi"); //NO I18N
				return false;
			}
			//Using attach components api call add file to server
			sdpAjax({
                url: "/api/v3/fonts/upload", // NO I18N
                type: "POST", // NO I18N
                data: data,
                dataType: "json", // NO I18N
                cache: false,
                contentType: false,
                processData: false,
				async: false,
				success: function(response) {
					fdetails["type"] = "newfontfile";// No I18N
					fdetails["font_file"] = {"id":response.attachment.id,"name":response.attachment.name}; // NO I18N
					fdetails["filename"] = response.attachment.name; // NO I18N
				},
				error: function(response) {
					iserror_fileattachment = true;
					showalert('failure',e_html(response.responseJSON.response_status.messages[0].message),'closeOnEscKey=yes');//NO I18N
				}
			});
		}
		if(iserror_fileattachment) {
			return false;
		}
		var fonts = {"name":filename,"is_enabled":false};// NO I18N
			fonts = jQuery.extend({},fonts,fdetails);
		var json_data = {"fonts": fonts}; // NO I18N
		jQuery('[data-id=addfont]').attr("disabled",true);
		sdpAjax({
			url: "/api/v3/fonts", // NO I18N
			type: 'POST', // NO I18N
			data: sdpAjaxInputData(json_data),
			success:function(resp){
				self.animateid = resp.fonts.id;
				themes.fontFormload(false);
				showalert('success',translate('api.added.success',[translate('admin.theme.font_family')]),'isAutoHide=true,delay=3');//NO I18N
				jQuery('[data-id=addfont]').attr("disabled",false);
			},
			error: function(resp) {
				if(resp.responseJSON && resp.responseJSON.response_status.messages && resp.responseJSON.response_status.messages[0].status_code == 4018) {
					showalert('failure',translate("api.error.message.maximum.reach"),'closeOnEscKey=yes');// No I18N
				}
				jQuery('[data-id=addfont]').attr("disabled",false);
			}
		})
	},
	/**
     * Add / Remove font to application font list
     *  @param id {string} element id
     *  @param myfontopt {boolean} Font available in apppliation or not
     */
	addtomyfontlist: function(id,myfontopt) {
		var self = this;
		function myfontsubmitfn(proceed) {
			if(proceed) {
				var json_data = {"fonts": {"is_enabled":myfontopt}};// NO I18N
				sdpAjax({
					url: "/api/v3/fonts/"+id,// NO I18N
					type: 'PUT',// NO I18N
					data: sdpAjaxInputData(json_data),
					success: function(resp) {
						self.add_remove_myfontlist = true;
						themes.renderFontui();
						var msg = (myfontopt) ? 'common.added.to' : 'common.removed.from';//NO I18N
						showalert('success',translate(msg,[translate("common.font.list")]),'isAutoHide=true,delay=3');//NO I18N
					}
				});
			}
			
		}
		if(myfontopt) {
			myfontsubmitfn(true);
		} else {
			showconfirm(true,'title='+translate("common.confirm.submit")+', message='+translate("font.remove.confirm.message")+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',myfontsubmitfn); // NO I18N
		}
	},
	fontnamekeyupfn: function() {
		if(this.editfontopt) {
			jQuery("#font_library_popup").find("[data-id=updatefont]").removeClass("opac5").removeAttr("style");// NO I18N
		}
	},
	/**
     * Edit custom font event
     *  @param id {string} font id
     *  @param fontname {string} font name
     *  @param fontfilename {string} font attached file name
     *  @param is_enabled {boolean} font active or not in application list
     */
	editfont: function(id,fontname,fontfilename,is_enabled) {/** Edit custom font event **/
		this.editfontopt = true;
		themes.fontFormload(true);
		jQuery("#font_library_popup").find("[name=fontname]").val(fontname).data({"fontid":id,"enabled":is_enabled});// No I18N
		jQuery("#font_library_popup").find("[name=addfont]").text(fontfilename).closest("label").addClass("opac5").css("pointer-events","none");// No I18N
	},
	updateFontname: function() {/** Upload edited font submit event **/
		var self = this;
		var filename = jQuery("#font_library_popup").find('[name=fontname]').val();
		var valid = self.fontnameValidation(filename);
		if(!valid) {
			return false;
		}
		var fontid = jQuery("#font_library_popup").find('[name=fontname]').data("fontid");// NO I18N
		var enabled = jQuery("#font_library_popup").find('[name=fontname]').data("enabled");// NO I18N
		function editoperation(enable) {
			if(enable) {
				var json_data = {"fonts": {"name":filename}};// NO I18N
				jQuery('[data-id=addfont]').attr("disabled",true);
				sdpAjax({
					url: "/api/v3/fonts/"+fontid, // NO I18N
					type: 'PUT', // NO I18N
					data: sdpAjaxInputData(json_data),
					success:function(resp) {
						self.animateid = resp.fonts.id;
						self.add_remove_myfontlist = true;
						themes.fontFormload(false);
						showalert('success',translate('api.updated.success',[translate('admin.theme.font_family') + ' ' + translate('sdp.common.name')]),'isAutoHide=true,delay=3');//NO I18N
						jQuery('[data-id=addfont]').attr("disabled",false);
					},
					error: function(resp) {
						var message = translate("apicodes.4001");
						if(resp.responseJSON && resp.responseJSON.response_status.messages && resp.responseJSON.response_status.messages[0].message) {
							message = e_html(resp.responseJSON.response_status.messages[0].message);
							var s_code = resp.responseJSON.response_status.messages[0].status_code;
							if(s_code == "4008") {
								var keyfontname = "<strong>" + translate("admin.theme.font_family") + ' ' + translate("sdp.common.name").toLowerCase() + "</strong>";
								message = translate('common.entity.name.already.exist.msg',[keyfontname,"<strong>" + translate("sdp.common.name")+"</strong>"]);
							}
						}
						showalert('failure',message,'closeOnEscKey=yes');// No I18N
						jQuery('[data-id=addfont]').attr("disabled",false);
						return false;
					}
				})
			}
		}
		if(enabled) {
			showconfirm(true,'title='+translate("common.confirm.submit")+', message='+translate("font.remove.confirm.message")+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',editoperation); // NO I18N
		} else {
			editoperation(true);
		}
	},
	/**
     * Font preview UI
     *  @param id {element} active element
     */
	removefont: function(id) {
		var self = this;
		function removefontsubmitfn(proceed) {
			if(proceed) {
				sdpAjax({
					url: "/api/v3/fonts/"+id,// NO I18N
					type: "DELETE",// NO I18N
					success: function(resp) {
						self.add_remove_myfontlist = true;
						delete sdp_app.FONTS[id];
						themes.renderFontui();
						var msg = translate('api.deleted.success',[translate('admin.theme.font_family')]);//NO I18N
						showalert('success',msg,'isAutoHide=true,delay=3');//NO I18N
					},
					error: function(resp) {
						showalert('failure',resp.responseJSON.response_status.messages[0].message,'isAutoHide=true,delay=3');//NO I18N
					}
				});
			}
		}
		showconfirm(true,'title='+translate("common.confirm.submit")+', message='+translate("font.remove.confirm.message")+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',removefontsubmitfn); // NO I18N
	},
	fontHistory: function() {/** Font history tab hist components triggered **/
        jQuery("#font_library_popup").find("#font_history").load("/common/ViewHistory.jsp?module=fonts&key=fonts"); //No I18N
	},
	fontHistoryRenderData: function(response, sort_order) {/** Font history data render callback function in history components **/
		/**
			Font edit opertion we didn't pass font to input data, history component show table data diff only (id, is_enabled options), so we get the font name using font api call and set to fontobj with id
		**/
		var fontobj = {};
		var res = this.getajaxFont();
		if(!jQuery.isEmptyObject(res)) {
			var fontdata = res.fonts;
			for(var i=0; i<fontdata.length; i++) {
				fontobj[fontdata[i].id] = {"name":fontdata[i].name};
			}
		}
		var data = [];
		for (var history_index = 0; history_index < response.history.length; history_index++) {
            var item = response.history[history_index];
			if (item.operation === "delete") {
                item.className = "cspr trash icon-sm opac7 vmiddle left1";
				item.display_operation_name = translate("sdp.itil.propview.deleted");
				item["diff"] = [{"current_value" : '<strong>' + e_html(item.fonts.name) + '</strong> ' + translate("admin.theme.font_family") + " " + translate("sdp.itil.propview.deleted")}]; //NO I18N
			} else if (item.operation === "add") { //NO I18N
                item.className = "common-sprite icon-sm common-add-icon1 opac7 vmiddle left1 cur-def";
				item.display_operation_name = translate("sdp.history.added");
				item["diff"] =  [{"current_value" : '<strong>' + e_html(item.fonts.name) + '</strong> ' + translate("admin.theme.font_family") + " " + translate("sdp.history.added")}]; //NO I18N
			} else if (item.operation === "edit") { //NO I18N
                item.className = "cspr edit icon-sm opac7 vmiddle left1";
				item.display_operation_name = translate("sdp.requests.history.updated");
				if(item.diff[0]["current_value"] == "false") {
					var is_enabled = "common.removed.from"; //NO I18N
				} else {
					var is_enabled = "common.added.to"; //NO I18N
				}
				if(fontobj[item.fonts.id]) {
					var fontname = fontobj[item.fonts.id].name;
					if(item.diff.length === 1) {
						item.diff[0]["current_value"] = '<strong>' + e_html(fontname) + '</strong> ' + translate(is_enabled,[translate("common.font.list")]); //NO I18N
					} else if(item.diff.length === 2) {
						var is_enabled = "sdp.requests.history.modified"; //NO I18N
						var keyfontname = translate("admin.theme.font_family") + ' ' + translate("sdp.common.name").toLowerCase();
						item.diff[0]["current_value"] = translate(is_enabled,[keyfontname,'<strong>' + e_html(item.diff[1]["previous_value"]) + '</strong> ','<strong>'+e_html(item.diff[1]["current_value"]) + '</strong> ']); //NO I18N
						item.diff[1]["current_value"] = '';
					}
				} else {
					/** Skip the removed fonts edit(Enable/Disable) operation in history component UI **/
					item = {};
				}
			} else if (item.operation === "attachment_add") { //NO I18N
				item = {};
			}
			if(!jQuery.isEmptyObject(item)) {
				data.push(item);
			}
    }
		return data;
	},
	/*Font API scripts End*/
}
var browserTitle ={
    defaultTitles: {requests: "#$id, $subject", problems: "#$id, $subject", changes: "#$id, $subject", projects: "$title", releases: "#$id, $title", solutions: "#$id, $title", maintenances: "#$id, $title", spaces: "#$id, $title", assets: "$assetname", cmdb: "$ciname", purchase: "#$id, $subject", contracts: "#$id, $subject"}, //NO I18N
    renderBrowserTitleHbs: function(isReload) {
        if(this.isLoaded && !isReload) {
            return;
        }
        var allowedModules = [];
        var items = sdpheader_data.modules.items;
        for(i=0;i<items.length;i++) { 
            allowedModules.push(items[i].id); //collecting allowed modules
        }
        var defaultTitles = browserTitle.defaultTitles;
        var modules = Object.keys(defaultTitles);

        var templateData = {modules: []};
        var displayNames = browserTitle.getAllMouduleName();
        for(m=0;m<modules.length;m++) {
            templateData.modules[m] = { 
                enabled: allowedModules.includes(modules[m]),
                name: displayNames[modules[m]],
                id: modules[m],
                title: defaultTitles[modules[m]]
            };
        }
        
        renderhbs( '#title_tab','browser-title', templateData, false, 'admin'); // NO I18N
        if(sdp_app.IS_SDP) {
            browserTitle.init();
        }
    },
    getAllMouduleName: function() {
        var modules = Object.keys(browserTitle.defaultTitles);
        var displayNames = {};
        for(m=0;m<modules.length;m++) {
            displayNames[modules[m]] = 'sdp.header.'+modules[m];
            if(modules[m]=='assets') {
                displayNames[modules[m]] = 'sdp.header.inventory';
            }
            else if(modules[m] == "releases"){
                displayNames[modules[m]] = 'admin.module.releases';
            }else if(sdp_app.IS_MSPOrSCP && modules[m] == "accounts"){
                displayNames[modules[m]] = 'sdp.msp.account';
            }
	        else if(modules[m] == "maintenances"){
				displayNames[modules[m]] = 'common.maintenance';
			}
        }
        return displayNames;
    },
    save: function() {
        if(sdp_app.IS_DEMO_BUILD && sdp_user.LOGINNAME!="administrator") {
            disableForDemo();
            return;
        }
        if(sdpheader_data.esm_details.current_portal.canAllowedDBOperation==false) {
            showalert('failure', translate("mdh.restricted.portals.cud.msg"),'isAutoHide=false');//No I18N
            return;
        }
        var titleData = {
            selectedtab : jQuery("input[name=selectedtab]:checked").val(),
            detailsPage : {}
        };
        var modules = Object.keys(browserTitle.defaultTitles);
        for(i=0;i<modules.length;i++) {
            var detailsPageTitle = jQuery("#"+modules[i]+"DetailsPageTitle");
            if(detailsPageTitle.length) {
                if(detailsPageTitle.val().trim()=='') {
                    showalert("failure", translate("sdp.api.security.exception.value.empty"), "isAutoHide=false"); //No I18N
                    detailsPageTitle.trigger('focus');
                    return;
                }
                var detailsPage = {
                    enabled: jQuery("#"+modules[i]+"DetailsPage:checked").length>0,
                    title: detailsPageTitle.val()
                };
                titleData.detailsPage[modules[i]] = detailsPage;
            }
        }
        browserTitle.personalize(titleData);
    },
    personalize: function(titleData) {
        jQuery("#savebrowser").prop("disabled", false).val(translate("sdp.admin.common.saving"));  //NO I18N
        var pers_obj = {
            key: 'browser_title', //No I18N
            data: titleData,
            success: function() {
                jQuery("#savebrowser").prop("disabled", false).val(translate("sdp.common.save")); //No I18N
                showalert('success', translate("sdp.admin.SettingsAction.success.save"),'isAutoHide=true');//No I18N
                sdp_app.themes.browser_title = titleData;
                applyBrowserTitle();
                /**
                 * For getting the global personalization id.
                 */
                setTimeout(function(){
                    window.location.reload(true);
                },1000);
            }
        };
        setGlobalPersonalization(pers_obj);
    },
    init: function(type) {
        themes.getGlobalPersonalizationId("browser_title"); //No I18N
        var titleData = sdp_app.themes.browser_title ? jQuery.extend({}, sdp_app.themes.browser_title) : undefined;
        this.bindEvents();
        if(titleData) {
            this.loadValues(titleData);
        }
        else {
            jQuery("#defaulttabselect").trigger('click');
        }
        jQuery("span[data-input=requestsDetailsPageTitle]").trigger('click');
        this.isLoaded = true;
    },
    loadValues: function(titleData) {
        jQuery("input[name=selectedtab][value="+titleData.selectedtab+"]").trigger('click');
        for(var page in titleData.detailsPage) { 
            jQuery("#"+page+"DetailsPage").prop("checked", titleData.detailsPage[page].enabled); 
            var titleField = jQuery("#"+page+"DetailsPageTitle");
            if(titleData.detailsPage[page].enabled) {
                titleField.prop('disabled', false);  //NO I18N
            }
            else {
                titleField.prop('disabled', true);  //NO I18N
            }
            if(page=='cmdb') {
                titleData.detailsPage[page].title =  titleData.detailsPage[page].title.replaceAll(/\$assetname/g, "$ciname");  //NO I18N
            }
            titleField.val(titleData.detailsPage[page].title);
        }
    },
    bindEvents: function() {
        // enable/disable events
        jQuery("#title_tab input[type=checkbox]").on('click', function(event) {
            if(event.target.checked) {
                jQuery("#"+event.target.id+"Title").prop('disabled', false); 
            }
            else {
                jQuery("#"+event.target.id+"Title").prop('disabled', true); 
            }
            jQuery("span[data-input="+event.target.id+"Title]").trigger('click');
        });
        //Preview events
        jQuery("#detailsPageSection .brow-prev-ic").on('click', function(event) { 
            browserTitle.previewTitle(event, "#detailPageTitlePreview"); //No I18N
        });
        jQuery("input[name=selectedtab]").on('click', function(event) {
            if(event.target.value=='default') {
                jQuery("#selectedTabPreview").text(sdp_app.PRODUCT_NAME);
            }
            else {
                jQuery("#selectedTabPreview").text(translate("sdp.header.requests"));
            }
        });
    },
    previewTitle: function(event, previewId) {
        var eventElement = event.target;
        if(!jQuery(eventElement).data("input")) {
            eventElement = eventElement.parentElement;
        }
        var titleField = jQuery(eventElement).data("input"); //No I18N
        var moduleName = jQuery(eventElement).data("module"); //No I18N
        var previewData = {id: '236273', subject: 'Unable to fetch mail', title: 'Project Title', assetname: 'Asset name', ciname: 'CI Name'};
            if(moduleName == "releases"){ //No I18N
                previewData = {id: '236273', title: 'Release Title'}; //No I18N
            }
            else if(moduleName == "spaces"){ //No I18N
                previewData = {id: '236273', title: 'Space Title'}; //No I18N
            }
		else if(moduleName == "maintenances"){ //No I18N
                previewData = {id: '236273', title: 'Maintenance Subject'}; //No I18N
        }
        
        if(sdp_app.IS_MSPOrSCP){
                previewData['accountname']='Account Name'; // NO I18N
            }
        var checkboxField = jQuery("#"+titleField.replace("Title", ""));
        if(checkboxField.prop('checked')) {
            var title = jQuery("#"+titleField).val();
            for(var key in previewData) { 
                title=title.replace('$'+key, previewData[key]); 
            }
            jQuery(previewId).text(title); 
        }
        else {
            jQuery(previewId).text(sdp_app.PRODUCT_NAME);
        }
    },
    resetToDefault: function() {
        showconfirm(true,'title='+translate("sdp.requests.restorerequests")+', message='+translate("admin.browsertitle.restore")+', submitbutton='+translate('sdp.admin.settings.yes')+', cancelbutton='+translate('common.no')+', closebutton=yes, closeOnEscKey=yes', function(proceed) { //NO I18N
            if(proceed) {
                var titleData = {
                    selectedtab : "default", //No I18N
                    detailsPage : {}
                };
                var modules = Object.keys(browserTitle.defaultTitles);
                for(m=0;m<modules.length;m++) {
                    titleData.detailsPage[modules[m]] = {enabled: false, title: browserTitle.defaultTitles[modules[m]]};
                }
                browserTitle.loadValues(titleData);
                browserTitle.personalize(titleData);
            }
        });
    },

    processHistory: function(history) {
        var modules = Object.keys(browserTitle.defaultTitles);
        var displayNames = browserTitle.getAllMouduleName();;

        $history.processHistory(history);
        for(var h=0, hlen=history.length; h<hlen; h++) {
            var diff = history[h].diff;
            if(diff){
            for(var d=0; d<diff.length; d++) {
                if(diff[d].hasOwnProperty("previous_value") && diff[d].current_value) {
                    if(!diff[d].field || diff[d].field.name !== "data") {
                        diff.splice(d, 1);
                        d--;
                        continue;
                    }
                    var prev_val = diff[d].previous_value && JSON.parse(diff[d].previous_value);
                    var curr_val = JSON.parse(diff[d].current_value);
                    var htmlCurrVal = ""; 

                    if(prev_val==null) {
                        prev_val = {};
                    }

                    if(prev_val.selectedtab!=curr_val.selectedtab) {
                            var selectedtab = (curr_val.selectedtab=='default') ? translate("admin.browserTitle.defaultTitle"):translate("admin.browserTitle.selectedModule");
                            htmlCurrVal = htmlCurrVal + "<p>"+translate("sdp.admin.css.selectedtab")+" : "+selectedtab+"</p>";
                    }

                    var hasChange = false, sectionHtml = "";
                    for(i=0;i<modules.length;i++) {
                        var currVal = curr_val.detailsPage[modules[i]];
                        var preVal = Object.keys(prev_val).length ? prev_val.detailsPage[modules[i]] : "";
                            if(typeof preVal == 'undefined' || typeof currVal == 'undefined') {
                                continue;
                            }
                        if(preVal.enabled != currVal.enabled || preVal.title != currVal.title) {
                                var selectedTxt = currVal.enabled?translate("sdp.common.selected"):translate("sdp.common.deselected");
                                sectionHtml = sectionHtml+"<p class='ml20'>"+translate(displayNames[modules[i]])+" : "+selectedTxt+" ("+e_html(currVal.title)+") </p>";
                            hasChange = true;
                        }
                    }
                    if(hasChange) {
                            htmlCurrVal = htmlCurrVal + "<p class='sb'>"+translate("admin.broserTitle.detailsPage")+"</p>" + sectionHtml;
                    }
                    

                    if(htmlCurrVal=="") {
                            htmlCurrVal = translate("sdp.inventory.audit.nochanges");
                    }
                    diff[d].current_value = htmlCurrVal;
                }
                    else if(history[h].operation == "add"){
            }
        }
            }
        }
    },
}
Handlebars.registerHelper('startsWith', function (string, subString) {  // NO I18N
    return string.startsWith(subString);
});
Handlebars.registerHelper('lowercase', function (string) {  // NO I18N
    return string.toLowerCase();
});
if(sdp_app.IS_MSPOrSCP){
    browserTitle.defaultTitles['accounts']="#$id, $accountname"; // NO I18N
    delete browserTitle.defaultTitles.releases;
    delete browserTitle.defaultTitles.spaces;
    if(sdp_app.IS_SCP){
        delete browserTitle.defaultTitles.contracts;
        delete browserTitle.defaultTitles.purchase;
        delete browserTitle.defaultTitles.cmdb;
        delete browserTitle.defaultTitles.assets;
        delete browserTitle.defaultTitles.projects;
        delete browserTitle.defaultTitles.changes;
        delete browserTitle.defaultTitles.problems;
    }
}
