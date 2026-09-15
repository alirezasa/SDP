/* $Id$ */
var rtaconfigTab = {
    renderTab:function(context, emberModel) {
        "use strict";  // NO I18N
        rtaconfigTab.emberModel = emberModel;
        var methods = {
            container:null,
            sdpHeaderData : null,
            //To init select2 for font, size and image option field
            initSelect2:function(elem,data,name) {
                var opt = {
                    data:data,
                    formatNoMatches: translate("ae.common.select2nomatchesfound")
                };
        
                if(name == 'fontFamily') {
                    function formatter(data) {
                        var styleInline;
                        if (name == 'fontFamily' ) {
                            styleInline = 'style="font-family: ' + e_attr(data.id) + ';"'; // NO I18N
                        } 
                        return '<span id=' + e_attr(data.id) + ' '+styleInline+' class="text-wrap">' + e_html(data.text) + '</span>';
                    }
        
                    opt.formatResult = formatter;
                    opt.formatSelection = formatter;
                }
        
                elem && jQuery(elem).select2(opt);
            },
            //It give diff json of RTA setting data to show diff in history component
            convertToRTADiff: function (data) {
                var self = this;
                 try {
                        var previous_value = data.previous_value ? JSON.parse(data.previous_value) : data.previous_value;
                        var current_value  = data.current_value ? JSON.parse(data.current_value)   : data.current_value;
                        var diff = [];
                        var displayKeys = {
                            fontFamily:translate('zeditor.fontfamily'),
                            fontSize:translate('zeditor.fontsize'),
                            fontColor:translate('zeditor.forecolor'),
                            defaultImageOption:translate('zeditor.imageoptions'),
                            editHtml:translate('zeditor.editHtml'),
                            allowUserPersonalize:translate('admin.allowCustomizeRTAUser'),
                            tabKeyHandling:translate('zeditor.tabkeyhandling'),
                        }
                        
                        function addDiffField(fieldName,displayName,oldValue,newValue) {
                            var data = {
                                field:{name:fieldName,display_name:displayName}
                            }
                            if(fieldName == 'fontColor') {
                                data.current_value='#'+newValue;
                                data.previous_value= oldValue ? '#'+oldValue : '';
                                data.field.name = 'color'; //No I18N
                            } else {
                                data.current_value = {id:newValue,name:self.getFieldDisplayValue(fieldName,newValue)};
                                data.previous_value = oldValue !=null ? {id:oldValue,name:self.getFieldDisplayValue(fieldName,oldValue)} : null;
                            }
                            diff.push(data);
                        }
                        
                        if(current_value) {
                            Object.keys(current_value).forEach(function(key) {
                                    if(key != 'editHtml' && previous_value && previous_value[key] != current_value[key]) {
                                        var displayName = displayKeys[key];
                                        var  oldValue = previous_value && key != "allowUserPersonalize" ? previous_value[key] : null;
                                        //for boolean value of allowUserPersonalize - there is no previous value  
                                        var  newValue = current_value ? current_value[key] : null;
                                        addDiffField(key,displayName,oldValue,newValue);
                                    } else if(key != 'editHtml' && previous_value == null && current_value) { // NO I18N
                                        //means newly added case
                                        var displayName = displayKeys[key];
                                        var  oldValue =  null;
                                        var  newValue = current_value ? current_value[key] : null;
                                        addDiffField(key,displayName,oldValue,newValue);
                                    }
                            });
                        }
                        
                        return diff;
                    } catch(e) {
                        return null;
                    }    
            },
            //To show display label for each field in history view panel
            getFieldDisplayValue:function (fieldName,fieldId) {
                var self = this;
                //convert boolean type to string data type,because false condition will fail in history-component.hbs {{else if this.name}}
                fieldName == 'allowUserPersonalize' && (fieldId = fieldId+''); // NO I18N

                if(self[fieldName+'Data']) {
                   var found = self[fieldName+'Data'].filter(function(data){
                        if(data.id == fieldId+'') {
                            return true;
                        }
                    }).map(function(item) {
                        return item.text;
                    });
                    if(found.length) {
                        return found[0];
                    }
                }
                return fieldId;
            },
            //To init color picker for font color field
            initColorPicker:function(){
                var self = this;
                var picker = jQuery(self.colorPicker);
                var previewElem = jQuery(self.colorPickerPreview);
        
                picker.zcolorpicker({
                    defaultColorButton: false,
                    noColorButton:false,
                    valueColorModel:'hex',//No I18N
                    'advancedPickerOptions': { //NO I18N
                        'OKButtonLabel': 'Done' //NO I18N
                    }
                }).off('zcolorpickerchange').on('zcolorpickerchange', function(origEvent) { //NO I18N
                    self.fontColorInput.value  = origEvent.detail.color.replace('#','');
                    previewElem.css('backgroundColor',origEvent.detail.color);//No I18N
                    jQuery(self.fontColorInput).trigger('change');
                });
        
                previewElem.off('click.rtaSetting').on('click.rtaSetting', function() { // NO I18N
                    if (picker.is(':visible')) {
                        picker.zcolorpicker('close'); //NO I18N
                    } else {
                        picker.zcolorpicker('setAttribute', 'value', '#'+self.fontColorInput.value); //NO I18N
                        picker.zcolorpicker('open'); //NO I18N
                    }
                });
            },
            //To render select2 for font, size and image options
            renderSelect2:function() {
                var self = this;
                var container = self.container; 
        
                self.fontFamilyInput = container.querySelector('#rta_fontFamily');//No I18N
                self.fontSizeInput = container.querySelector('#rta_fontSize');//No I18N
                self.defaultImageOptionInput = container.querySelector('#rta_defaultImageOption');//No I18N
                self.fontColorInput = container.querySelector('#rta_fontColor');//No I18N
                self.colorPicker = container.querySelector('#rta_fontcolor_picker');//No I18N
                self.colorPickerPreview = container.querySelector('#rta_fontcolor_preview');//No I18N
        
                self.initSelect2(self.fontFamilyInput,self.fontFamilyData,'fontFamily');//No I18N
                self.initSelect2(self.fontSizeInput,self.fontSizeData);
                self.initSelect2(self.defaultImageOptionInput,self.defaultImageOptionData);
            },
            //To set select2 value
            select2Val:function(elem,value) {
                elem && jQuery(elem).select2('val',value);//No I18N
            },
            //To get RTA font family
            getFont:function(fontFamily) {
                //it check fontFamily exist in font data
                var font = fontFamily ||  ZE_Init.getRTASetting(true).fontFamily; // NO I18N // if no fontFamily given move to default font
                var found = this.fontFamilyData.filter(function(item){
                    var id = (item.id+'').toLowerCase();
                    font = font.toLowerCase();
                    if(id.indexOf(font) >= 0) {
                        return true; 
                    }
                });
                if(found.length) {
                   return found[0].id;
                }
                return null;
            },
            //To preview the font, size and color which is view in RTA
            updatePreview:function() {
                var context = this.context;
                var elements = this.container.querySelectorAll('input[data-param-key][name=fontFamily],input[data-param-key][name=fontSize],input[data-param-key][name=fontColor]');//No I18N
                var style = {'font-family':'','font-size':'','color':''}; // NO I18N
                var keyMap = {fontFamily:'font-family',fontSize:'font-size',fontColor:'color'};
                var previewContainer = this.container.querySelector('.rta_preview'); // NO I18N
                var updateValue = (key,value)=> style[key] = value;
                       
                var clearOldFontColor = ()=>{
                    var data = previewContainer.dataset;
                    delete data.ogsc;
                    delete data.zcontrastcolor;
                }
                var setDarkFontColor = ()=>{
                    var selector = context == 'user' ? '#userRTAconfig' : '#rtaconfigTabsSection';
                    ThemeCustomizer.zcontrastcolorinit(selector);
                }
                clearOldFontColor(); // To clear old rta font color in contrast data

                function updateStyle(elem) {
                    var key = elem.name;
                    var updatedKey = keyMap[key];
                    var hasStyleKeyPresent = key in keyMap;
                    var updateStyleValue = ()=>updateValue(updatedKey,elem.value);

                    hasStyleKeyPresent && updateStyleValue();
                }

                elements.forEach(updateStyle); // update style property

                //data-content='rta' attribute added for preview div container for Night mode font color support 
                (previewContainer.dataset && !previewContainer.dataset.hasOwnProperty('content')) && (previewContainer.dataset.content='rta');

                if(previewContainer) {
                    function setStyle(styleName) {
                        var value = styleName == 'font-size' ? style[styleName]+'pt' : style[styleName];
                            value = styleName == 'color' ? '#'+style[styleName] : value;// NO I18N
                            previewContainer.style[styleName] = value;
                    }
                    Object.keys(style).forEach(setStyle);
                }

                setDarkFontColor(); // set dark mode contract font color
            },
            //To set data for each field
            //data - given data or takent from RTA settings
            setValue: function(data) {
               var self = this;
               var context = self.context; 
               var config = data || ZE_Init.getRTASetting(false,context);
               var font  = self.getFont(config.fontFamily) || self.getFont();
        
               self.select2Val(self.fontFamilyInput,font);
               self.select2Val(self.fontSizeInput,config.fontSize);
               self.select2Val(self.defaultImageOptionInput,config.defaultImageOption);
               self.fontColorInput && (self.fontColorInput.value = context == "user" ? sdp_app.CLIENT_CONF.RTA.fontColor : config.fontColor); // NO I18N
               
               self.colorPickerPreview && (self.colorPickerPreview.style.backgroundColor = '#'+config.fontColor);

               var findElement =(id)=>self.container.querySelector(id);

               var tabKeyInput = findElement('#rta_tabKeyHandling_'+config.tabKeyHandling);  // NO I18N
               var allowUserInput = findElement('#allowUserPersonalize'); // NO I18N

               allowUserInput && (allowUserInput.checked = config.hasOwnProperty('allowUserPersonalize') ? config.allowUserPersonalize  : false);//No I18N
               tabKeyInput && (tabKeyInput.checked = true);

            },
            //check form data changed or not
            hasDataChange:function() {
                var self = this;
                var elements = self.container.querySelectorAll('input[data-param-key]');//No I18N
                var hasChange = false;
                var context = self.context;
                var getData = ()=> {
                    // get saved data  
                    return context == 'user' ?  ZE_Init.getRTASetting(false,'user')  : {editHtml:true} // hidden field so add statically; //No I18N
                }
                var personalise_data = getData();
                function adminDataChange(input) {
                    var dataset = input.dataset;
                    var value = input.value;
        
                    if(dataset.paramKey == 'tabKeyHandling' && input.checked != true ) {
                        return; // skip to save
                    } else if(dataset.paramKey == 'tabKeyHandling' && input.checked == true ) { //No I18N
                        value = "true" == value ? true : false;
                    } else if(dataset.paramKey == 'allowUserPersonalize' ) { //No I18N
                        value = !!input.checked;
                    }
        
                    if(sdp_app.CLIENT_CONF.RTA[input.name] != value) {
                       hasChange = true;
                    }
                    personalise_data[input.name] = value;
                }

                function userDataChange(input) {
                    var value = input.value;
                    if( sdp_user.CLIENT_CONF.RTA && sdp_user.CLIENT_CONF.RTA[input.name] != value) {
                         hasChange = true;
                    } else if(sdp_user.CLIENT_CONF.RTA == undefined) {
                        // considered as new user personalize data to save, so allowing to save
                        hasChange = true; 
                    }
                    personalise_data[input.name] = value;
                }

                var dataChange = context == 'user' ? userDataChange : adminDataChange; // NO I18N
                elements.forEach(dataChange);
                return [hasChange,personalise_data];
            },
            noChangeMsg:()=>showalert('warning', translate('common.nothing.to.save'),'isAutoHide=false'), //No I18N
            //To save data to Global/Personalize api
            saveAll:function() {
                const self = this;
                const isDisableMode =()=>sdp_app.IS_DEMO_BUILD;
                if(isDisableMode()) {
                    //for demo build this feature is disabled
                    disableForDemo();
                    return;
                }
                self.sdpHeaderData = self.sdpHeaderData || window.opener && window.opener.sdpheader_data || sdpheader_data || {};
                if(Object.keys(self.sdpHeaderData).length === 0 && self.context == 'user'){ 
                    sdpAjax({
                        cache: false,
                        async: false,
                        url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N
                        success: function (data) {
                            self.sdpHeaderData = data;
                        }
                    });
                }
                if(self.sdpHeaderData.esm_details && self.sdpHeaderData.esm_details.current_portal.canAllowedDBOperation==false) {
                    //for restricted portal this feature is disabled
                    showalert('failure', translate("mdh.restricted.portals.cud.msg"),'isAutoHide=false');//No I18N
                    return;
                }

                var [hasChange,personalise_data] = self.hasDataChange();
                hasChange ? self.saveToAjax(personalise_data) : self.noChangeMsg();
            },
            //save the RTA data to sdp_app.CLIENT_CONF.RTA
            saveLocalConfig:function(personalise_data) {
                var self = this;
                function saveData(key) {
                    var input = self.container.querySelector('input[name="'+key+'"]');//No I18N
                    if(input) {
                        var configKey = input.name;
                        var value = personalise_data[key];
                        sdp_app.CLIENT_CONF.RTA[configKey] = value;
                    }
                }
                Object.keys(personalise_data).forEach(saveData);
            },
            saveToAjax:function(personalise_data) {
                let self = this;
                var context = self.context;
                var getRTAConfigData = ()=>{
                    let rta_config = {
                        key    : 'rta_config', //No I18N
                        data   : personalise_data,
                        success: function() {
                            showalert('success', translate("api.saved.success",[translate("admin.rtaconfigtab")]),'isAutoHide=true');//No I18N
                            self.saveLocalConfig(personalise_data);   
                            if(rtaconfigTab.emberModel) {
                                Ember.set(rtaconfigTab.emberModel, "id", global_personalization.rta_config); //No I18N
                            }
                       }
                    };
                    return rta_config;
                }

                if(context == 'admin') {
                     //clear cached of RTA settings, To save global personalize get call
                     delete ZE_Init.getRTASetting.cache;
                    setGlobalPersonalization(getRTAConfigData());
                } else if (context == 'user') { // NO I18N
                    delete personalise_data.allowUserPersonalize;
                     //clear cached of RTA settings, To save global personalize get call
                    delete ZE_Init.getRTASetting.cache;
                    var showAlertMessage = (success)=>{
                        var statusType = success ? 'success' : 'failure';
                        var message = success ? translate("api.saved.success",[translate("admin.rtaconfigtab")]) :  translate('common.failure.message',[' '+translate('admin.rtaconfigtab')]);
                        showalert(statusType, message,'isAutoHide='+success);//No I18N
                        const pageReload = ()=>window.location.reload();
                        setTimeout(pageReload,600);
                    };
                    ClientUtil.addUserPersonalization('user_rta_config',personalise_data).then((result) => { //No I18N
                        showAlertMessage(true);
                    }).catch((error) => {
                        showAlertMessage(false);
                    });
                }
            },
            //To show history diff to popup
            processHistory: function(history) {
                var self = this;
                function mergeDiff(changes) {
                    if(changes.diff.length == 2) {
                        if(changes.diff[0].current_value == 'rta_config') {
                            //merge the two diff for newly added content
                            changes.diff[0].current_value = changes.diff[1].current_value;
                        }
                        //remove the data
                        changes.diff.pop();
                    }
                    var diff = changes.diff.map(function(diff_items) {
                        return self.convertToRTADiff(diff_items);
                    });
                    changes.diff = diff && diff.length ? diff[0] :changes.diff;
                }

                history.forEach(mergeDiff);
                $history.processHistory(history,null,true);
            },
            //To render view in admin RTA setting tab
            afterRender:function() {
                this.renderSelect2();
                this.initColorPicker();
                this.setValue();
                this.updatePreview();
            },
            //To disable image option for AE
            disableImageOption:function() {
                var self = this;
                const hideImage = ()=>{
                    const imageOption = document.querySelector('#rta_image_option_div');//No I18N
                    imageOption && (imageOption.style.display = 'none');//No I18N
                }
                sdp_app.IS_AE && hideImage();
            },
            //To reset to last saved RTA setting data in form
            resetToDefault:function() {
                var self = this;
                const doReset = ()=>{
                    self.setFormData();
                    self.updatePreview();
                }
                const info = 'title='+translate("common.confirm")+', message=' + translate("form.reset.alert") + ', submitbutton='+translate('sdp.common.ok')+', cancelbutton='+translate('sdp.common.cancel')+', closebutton=yes, closeOnEscKey=yes'; // NO I18N
                showconfirm(true, info, (isConfirm)=>isConfirm && doReset());
            },
            //To add event change event for fields and tab switch
            addEventMethods : function() {
                var self = this;
                rtaconfigTab.saveAll = self.saveAll.bind(self);
                rtaconfigTab.resetToDefault = self.resetToDefault.bind(self);
                rtaconfigTab.processHistory = self.processHistory.bind(self);
                var $container = jQuery(self.container);
                var eventNameSpace = '.rta-config';

                $container.off(eventNameSpace); // off the event

                function clearLocalData(){ 
                    //To clear rtaconfigTab object data when rta container removed
                    delete rtaconfigTab.saveAll;
                    delete rtaconfigTab.resetToDefault;
                }

                $container
                .on('remove.rta-config',clearLocalData)//No I18N
                .on('change.rta-config','input',()=> self.updatePreview()); // to update preview on form field change

                // add form actions Save and Reset button events
                $container
                .on('click'+eventNameSpace,'#rta_submit',rtaconfigTab.saveAll) //save button click
                .on('click'+eventNameSpace,'#rta_reset_default',rtaconfigTab.resetToDefault); //reset button click
            },
            //add default data list
            addDefaultDataList:function() {
                //Here it will add data list for fields - font,size,image options, color and tab key handling 
                var self = this;
                var data = ZE_Init.getDefaultRTADataList(); // this function is defined in ze_init.js
                Object.assign(self,data);
            },
            //To set form data
            setFormData:function(){
                var self = this;
                var context = self.context;
                var data = ZE_Init.getRTASetting(false,context);
                self.setValue(data);
            },
            //init RTA Setting for admin and user personalize tab
            //context - user/admin - default is admin
            init:function(context){
                methods.context = context;
                methods.addDefaultDataList();
                methods.data = ZE_Init.getRTASetting(false,context);
                var doAdminInit = ()=>{
                     //To render rta config template
                     renderhbs('#rta-config', 'rta-config', {} , false , 'admin',null,null,callback); // NO I18N
                     function callback() {
                        methods.container = document.querySelector('#rtaconfigTabsSection');//No I18N
                        methods.afterRender();
                        methods.addEventMethods();
                        methods.disableImageOption(); //to disable image option for AE
                     }
                }
                var doUserInit = ()=>{
                    jQuery('a#link_rtaconfig').removeClass('hide');
                    methods.container = document.querySelector('#rtaConfigForm');//No I18N
                    methods.renderSelect2();
                    methods.setFormData();
                    methods.addEventMethods();
                    methods.updatePreview();
                    methods.disableImageOption(); //to disable image option for AE
                }

                context == 'admin' ? doAdminInit() : doUserInit();
            }
        };
        try {
           context = context || 'admin'; // NO I18N 
           // default context admin, no need to say explicit
           methods.init(context);
        } catch(e){
            clientErrorHandling.log(e);
        }
    }
};


