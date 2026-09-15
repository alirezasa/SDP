    var $autoUpdate = {
		isAUEnabled:"", // to check if Auto Update is enabled or not
		mailConfig:"", // to check if outgoingmail server is configured or not
		updateTimeTaken:"", // time taken to upgrade the patch
		auNotifyUserId:"",
		oldUsers:"",
		enableUpdateButton:"",
		startedViaService:"", // throw error if not started as service
        init: function () {
			var supportedSetup;
			var config;
			var data = $autoUpdate.getResponse("/api/v3/au_configurations"); // NO I18N
			var escalateton;
			if(data!=null){
				var list = data.au_configuration;
                for (i = 0; i < list.length; i++) {
					if(data.au_configuration[i].other_configurations != null){
						config = data.au_configuration[i].other_configurations;
					}
					data[data.au_configuration[i].parameter] = data.au_configuration[i].param_value;
				}
				if(config!=null){
					if(config.auNotifyUserId != null){
						$autoUpdate.auNotifyUserId = config.auNotifyUserId;
					}
					if(config.supportedSetup!=null){
                        supportedSetup = config.supportedSetup;
                       }
					if(config.enableUpdateButton!=null){
                        $autoUpdate.enableUpdateButton = config.enableUpdateButton;
                        if($autoUpdate.enableUpdateButton == true && config.updateTimeTaken!=''){
                        	$autoUpdate.updateTimeTaken = config.updateTimeTaken;
                        }
                    }
					if(config.mailConfig!=null){
                        $autoUpdate.mailConfig = config.mailConfig;
                    }
					if(config.startedViaService!=null){
						$autoUpdate.startedViaService = config.startedViaService;
					}
				}
				data.isAssetBuild=sdp_app.IS_AE;
				escalateton = $autoUpdate.getResponse("/api/v3/au_notifications/" + $autoUpdate.auNotifyUserId) ; // NO I18N
				oldUsers = escalateton;
                renderhbs("#autoupdate", "auto-update-template", data, false, "admin"); // NO I18N
                delete WebComponents.instancePool["webc-auTable"]; // NO I18N
                WebComponents.render("webc-auTable"); //NO I18N
				$autoUpdate.isAUEnabled = data.isAUEnabled;
                $autoUpdate.enableSettings(supportedSetup);
                $autoUpdate.enableContent($autoUpdate.enableUpdateButton, "updateButton"); // NO I18N
				initTooltip('#AutoUpdateDiv'); //NO I18N
			}

            jQuery("#ss_autoUser").sdp_select2({
                  cache:{},
                  multiple:true,
                  allowClear: true,
                  maximumSelectionSize: 50,
                  formatSelectionTooBig: function (limit) {return getMessageForKey('sdp.admin.multiselect.max.option.exceed',[50])}, //No I18N
                  url:[{
                    url:"/api/v3/au_notifications/notify_to_users",//NO I18N
                    field:'notify_to_users',//NO I18N
                    list_info:{"fields_required":["name","email_id"]} //NO I18N
                  }],
				  processResults:function(search_data,data,field){
					var tempData = data;
					var tempName = tempData.name;
					var key = "text"; //NO I18N
					data = {id : tempData.id};
					data[key] = tempData.name || tempData.text;
					if(tempData.email_id!=null){
						data[key] = data[key] + " (" + tempData.email_id + ")";
					}
					search_data.push(data);
				}
            });
			$autoUpdate.populateUsers(escalateton);
		},

		showPatchPopup: function(tableData){ // to display patch state progress popup
			var upgradeId = tableData.row_data.id;
			var status = tableData.row_data.status.name;
			var cssClass;
			if(status == getMessageForKey("au.installationCompleted")){
            	cssClass = "status-update success"; // success // NO I18N
            }else if(status == getMessageForKey("au.patchRemovedFromServer") || status == getMessageForKey("au.patchRemovedFromLocal") || status == getMessageForKey("au.latestVersion")){ // NO I18N
                cssClass = "status-update failed"; // rejected // NO I18N
            }else{
            	cssClass = "status-update info"; // In progress // NO I18N
            }
			cssClass = "disp-ib " + cssClass + " text-overflow maxw-85per mr5"; // NO I18N
			return '<span class= "' + cssClass +'" title="' + status + '" rel="uitip" mode_ellipsis="true">' + status +' </span><a href="/" sdphrefJs="js-href-AU-0" class="more-status" data-target-id="#popoverMenu" data-event="click" data-handler="$autoUpdate.populatePatchDetails('+ upgradeId +')" nonce="'+sdpNonce+'" showpopover="true" custom-class="au-popup"><span class="cspr icon-sm header-more"></span></a>'
		},

		populatePatchDetails: function(upgradeId) { // api call to get patchInstallationStatus details
			var url = "api/v3/patch_details/"+ upgradeId + "/history"; // NO I18N
			var data = $autoUpdate.getResponse(url);
			renderhbs("#popoverMenu", "au-patch-details", data, false, "admin"); // NO I18N
			setTimeout(function(){initTooltip('.popover');},100);
			showPopover(event,'click'); // NO I18N
		},

		populateUsers: function(escalateton){ // to populate users to whom notifications will be sent
			var user = [];
			if(escalateton==null){
				user=null;
			}
			else{
                for(i=0; i<escalateton.length; i++){
					if(escalateton[i].email_id != null){
						user.push({"id":escalateton[i].id,"text":escalateton[i].name + " (" + escalateton[i].email_id + ")"});
					} else{
						user.push({"id":escalateton[i].id,"text":escalateton[i].name});
					}

				}
			}
			jQuery("#ss_autoUser").select2('data', user); //No i18N
		},

		getResponse: function(url){ // to get api response
			var data;
			var json_data;
			if(url.includes("history")){
			    json_data = {"row_count": 25}; // NO I18N
            	sdpAjax({
                    url: url,
                    async: false,
                    type: "GET", //NO I18N
            	    data:sdpAjaxInputData({list_info:json_data}),
                    success: function (res) {
                        data = res;
                    }
                });
			} else{
	            sdpAjax({
                    url: url,
                    async: false,
                    type: "GET", //NO I18N
                    success: function (res) {
                        data = res;
                    }
                });
			}
			if(url.includes("au_notification")){
				return data.au_notification.notify_to_users;
			}else{
				return data;
			}

		},

        rowDataConstruct: function (table_info) {
            var inputObject = {};
            inputObject.list_info = table_info.list_info;
            return inputObject;
        },


        toggleButton: function(cur){
			cur.find("#toggle_AU_SETTINGS").toggleClass('on off'); //NO I18N
			if (cur.find('#toggle_AU_SETTINGS').hasClass('on')) {
                cur.parent().find('.onoff').text(getMessageForKey('common.enabled'));
            } else {
                cur.parent().find('.onoff').text(getMessageForKey('common.disabled'));
            }
		},


        toggleSwitchAction: function ($this) { // enable/disable AU and Hotswap settings
            var isSuccess = false;
            var cur = jQuery($this);
            // current state before toggle action
            var isEnabled = cur.find('#toggle_AU_SETTINGS').hasClass("on"); //NO I18N
            var modeName = cur.attr('data-value');
			if (modeName == "isAUEnabled" && isEnabled){
				showconfirm(true,'title='+getMessageForKey('au.au')+', message='+ getMessageForKey('au.disableAuAlert') + ', submitbutton='+getMessageForKey('common.proceed')+', cancelbutton='+getMessageForKey('common.no')+', closebutton=yes', function(proceed){ //NO I18N
				if(proceed){
					$autoUpdate.saveToggleAction(modeName, !isEnabled, cur);
				}
				},false);
			}
			else{
				$autoUpdate.saveToggleAction(modeName, !isEnabled, cur);
			}
        },

		saveToggleAction: function(modeName, isEnabled, cur){ // api call to save toggle action
			var data = [{
                    "parameter": modeName, //No i18N
                    "param_value": isEnabled //No i18N
                }
            ]
			var AUMode = false;
			var dispMsg ="au.hotswap"; //NO I18N
			sdpAjax({
                url: "/api/v3/au_configurations", //NO I18N
                async: false,
                data: sdpAjaxInputData({
                    "au_configuration": data //No i18N
                }),
                type: "PUT", //NO I18N
                success: function (data) {
                    isSuccess = true;
					if(modeName == "isAUEnabled"){
						AUMode = true;
						dispMsg = "au.au"; //NO I18N
					}
					if(isEnabled){
						$autoUpdate.showStatus("success", getMessageForKey("common.enabled.success.msg", [getMessageForKey(dispMsg)])); //NO I18N
					}
                    else{
						$autoUpdate.showStatus("success", getMessageForKey("common.disabled.success.msg", [getMessageForKey(dispMsg)])); //NO I18N
					}
					if (AUMode) {
						$autoUpdate.enableContent(isEnabled, "SettingsContent"); // NO I18N
						// to enable/disable update and restart button on AU toggle
						$autoUpdate.enableContent($autoUpdate.enableUpdateButton && isEnabled, "updateButton"); // NO I18N
					}
					$autoUpdate.toggleButton(cur);
                },
                error: function (data) {
                    isSuccess = false;
                 	$autoUpdate.showStatus("failure", data.response_status.messages[0].message); //NO I18N
                }
            });
        },

        showStatus: function (msg, action) { // to show alert
			if(msg == "success"){
				showalert('success', e_html(action) , 'isAutoHide=true'); //NO I18N
			}
			else if(msg == "failure"){
				showalert('failure', e_html(action) , 'isAutoHide=false'); //NO I18N
			}
			else{
				showalert('warning', e_html(action) , 'isAutoHide=true,delay=3'); //NO I18N
			}
		},

		enableSettings: function (isEnabled) { // to add and remove opac class
            if (isEnabled == "true" || isEnabled == true) {
                jQuery('#SettingsContent,#updateHistory,#EnableAUSettings').removeClass('opac5').prop('style', null); //NO I18N
                $autoUpdate.enableContent($autoUpdate.isAUEnabled, "SettingsContent"); // NO I18N
            } else {
                jQuery('#SettingsContent,#updateHistory,#EnableAUSettings').addClass('opac5').css('pointer-events', 'none'); //NO I18N
            }
        },

		enableContent: function (isEnabled, divName) { // to enable/disable SettingsContent tab and updateButton
            if (isEnabled == "true" || isEnabled == true) {
				if(divName == "updateButton"){
					jQuery('#' + divName).removeAttr("disabled"); //NO I18N
					jQuery('#' + divName).off("click.updateAndRestart").on("click.updateAndRestart",function(){ //NO I18N
                            $autoUpdate.updateAndRestart(this)
                    });
				}
				else{
					jQuery('#' + divName).removeClass('opac5').prop('style', null); //NO I18N
				}
            } else {
				if(divName == "updateButton"){
					jQuery('#' + divName).attr("disabled", true);
					jQuery('#' + divName).off("click.updateAndRestart"); //NO I18N
				}
				else{
                jQuery('#' + divName).addClass('opac5').css('pointer-events', 'none'); //NO I18N
				}
			}
        },

		checkIfChangePresent: function(users_list){ // to check if selected users and users already saved are same or not
			if(oldUsers==null){
				return false;
			}
			var userArr = [];
            for(i=0; i<oldUsers.length; i++){
            	userArr.push(oldUsers[i].id);
            }
            return users_list.sort().toString() === userArr.sort().toString();
		},

		saveUsers: function ($this) { // api call to save users
            var users_list = jQuery('#ss_autoUser').select2('val'); //NO I18N
			if(users_list.length>0){
				if($autoUpdate.checkIfChangePresent(users_list)){
					$autoUpdate.showStatus("warning",getMessageForKey("common.nothing.to.save")); //NO I18N
				}
				else{
				    var userData = [];
				    for(i=0;i<users_list.length;i++){
						userData.push({"id":users_list[i]});
				}
				var notify_users = [];
                notify_users.push({"notify_users": userData});
           		sdpAjax({
                    url: "/api/v3/au_configurations", //NO I18N
                    async: false,
                       data: sdpAjaxInputData({
                       "au_configuration": notify_users //NO I18N
                    }),
                    type: "PUT", //NO I18N
                success: function (data) {
                    isSuccess = true;
					$autoUpdate.showStatus("success", getMessageForKey("au.auSettings")); //NO I18N
					if($autoUpdate.mailConfig!=null && $autoUpdate.mailConfig==false){
						$autoUpdate.showStatus("warning",getMessageForKey("sdp.admin.survey.outgoingmail.notconfigured")); //NO I18N
					}
					oldUsers = data.au_configuration.notify_to_users;
                },
				error: function (data) {
                    isSuccess = false;
					$autoUpdate.showStatus("failure", getMessageForKey("sdp.common.error")); //NO I18N
                }
				});
			}
			}
			else{
				$autoUpdate.showStatus("warning", getMessageForKey("sdp.users.include.select2.placeholder")); //NO I18N
			}
		},

		cancelButton: function(){ // Reset the old users
			$autoUpdate.populateUsers(oldUsers);
		},

        sortOrder: function () { // sort the update History in descending order based on build_from
            var options = {
                default_sort_field: {
                    "sort_field": "updated_on", //No i18N
                    "sort_order": "desc" //No i18N
                }
            }
            return options;
        },

		updateAndRestart: function ($this) { //api call to upgrade restart the server
			if($autoUpdate.startedViaService==false){
				$autoUpdate.showStatus("failure", getMessageForKey("au.startViaService")); //NO I18N
			} else{
				showconfirm(true,'title='+getMessageForKey('au.updateAndRestart')+', message='+getMessageForKey("au.updateAlert",[$autoUpdate.updateTimeTaken]) + ', submitbutton='+getMessageForKey('common.proceed')+', cancelbutton='+getMessageForKey('common.no')+', closebutton=yes', function(proceed){ //NO I18N
					if(proceed){
						sdpAjax({
							url: "/api/v3/au_configurations/_server_upgrade", //NO I18N
							async: false,
							type: "POST", //NO I18N
							success: function (data) {
								var statusMsg = data.response_status.messages[0].message;
								if(statusMsg == getMessageForKey("au.restartInitiated")){
									$autoUpdate.enableContent(false, "updateButton"); // NO I18N
								}
								$autoUpdate.showStatus("success", data.response_status.messages[0].message); //NO I18N
							},
							error: function (data) {
								$autoUpdate.showStatus("failure", data.response_status.messages[0].message); //NO I18N
							}
						});
					}
				},false);
			}

		},

		afterTableRender: function(){ // for proper aligning and scroll option for table component
            jQuery("#auTable_div").attr('style','overflow-x:auto').addClass('p10 pl0 pr0').removeClass("tablebrd1");
        }
    };