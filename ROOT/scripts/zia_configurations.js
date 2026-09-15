var zipssp = {
	cmEditor1: null,
	cmEditor2: null,
	cmEditor3: null,
	label_1_count: 0,
	label_2_count: 0,
	label_3_count: 0,
	lastSelectedLang: null,
	currentLang: null,
	displayCustomDataset: null,
	approvalCustomData: {},
	oldApprovalCustomData: {},
	reopenCustomData: {},
	/* To open the dialog box for customizing dataset for approval / reopen prediction. */
	ziadatasetfn: function (prediction, languageOfDataset) {

		var showDatasetDiv = jQuery('#show-dataset');
		var label1Div = jQuery('#zia-wizard-1');
		var label2Div = jQuery('#zia-wizard-2');
		var label3Div = jQuery('#zia-wizard-3');
		if (prediction == 'reopenprediction') {
			showDatasetDiv.addClass("hide");
			label3Div.addClass("hide");
			label1Div.removeClass("col-xs-4").addClass("col-xs-6");
			label2Div.removeClass("col-xs-4").addClass("col-xs-6");
		} else {
			showDatasetDiv.removeClass("hide");
			label3Div.removeClass("hide");
			label1Div.removeClass("col-xs-6").addClass("col-xs-4");
			label2Div.removeClass("col-xs-6").addClass("col-xs-4");
		}
		var titleStr = translate("admin.zia.approvalaction");
		var testziacontent = translate("zia.approvalwiz.content1");
		var trainziacontent = translate("zia.approvalwiz.content4");
		var ziawizcontent3 = translate("zia.approvalwiz.content3");

		var ziaWizardLabel_1 = translate("sdp.approve.approve");
		var ziaWizardLabel_2 = translate("common.reject");
		var ziaWizardLabel_3 = translate("sdp.approve.needclarification");

		var ziaWizardInfoMsg_1 = translate("zia.approvalwiz.approveinfo");
		var ziaWizardInfoMsg_2 = translate("zia.approvalwiz.rejectinfo");
		var ziaWizardInfoMsg_3 = translate("zia.approvalwiz.needclarificationinfo");
		if (prediction === "reopenprediction") {
			titleStr = translate("admin.zia.reopenaction");
			testziacontent = translate("zia.reopenwiz.content1");
			trainziacontent = translate("zia.reopenwiz.content4");
			ziawizcontent3 = translate("zia.reopenwiz.content3");

			ziaWizardLabel_1 = translate("zia.reopen.label");
			ziaWizardLabel_2 = translate("zia.notreopen.label");
			ziaWizardInfoMsg_1 = translate("zia.reopenwiz.reopeninfo");
			ziaWizardInfoMsg_2 = translate("zia.reopenwiz.retaininfo");
		}
		jQuery("#predictionaction").val(prediction);

		/* To scroll the page up beforehand inorder to fix addnewdata onclick event ui breakage. */
		jQuery("html, body").animate({ scrollTop: 0 }, 500); //No I18N
		setTimeout(function () {
			jQuery('#ziadataset').dialog({
				modal: true,
				open: function (event, ui) {
					jQuery('.ui-dialog-titlebar').append('<button type="button" data-id="restorebtn" class="btn btn-default mr30 pos-abs right10 top10" data-event="click" data-handler="zipssp.ziadatarestorefn()" nonce=' + sdpNonce + ' title="' + translate("zia.approvalwiz.restore.tooltip") + '" rel="uitip" mode_html=true>' + translate("common.restore_default") + '</button>'); //NO I18N
					$sdEventListener("[data-id='restorebtn']");     // No I18N
					initTooltip('.ui-dialog'); //NO I18N
					zipssp.zverfycancel();
					if (prediction == 'approvalprediction') {
						showDatasetDiv.find("#frspelang").prop('checked', true); // no i18n
						if (sdp_app.IS_MULTILINGUAL_LICENSE) {
							showDatasetDiv.find("#frspelang-options").val(languageOfDataset).trigger("change");
							showDatasetDiv.find("#frspelang-options").prop("disabled", false); // no i18n
							showDatasetDiv.find("#add-data-info").removeClass('hide');
						} else {
							showDatasetDiv.find("#frspelang-options").prop("disabled", true); // no i18n
							showDatasetDiv.find("#add-data-info").addClass('hide');
						}
					}
					jQuery('#duplicate-ziaentry').addClass('hide');
					jQuery('#ziadataset').addClass('wo-carousel');
					jQuery("#addnewdata1, #addnewdata2, #addnewdata3").removeClass('hide').off('click.ziawizard-addnewdata').on('click.ziawizard-addnewdata', function() {  //NO I18N
						var cmEditorObject = this.id === 'addnewdata1' ? zipssp.cmEditor1 : (this.id === 'addnewdata2' ? zipssp.cmEditor2 : zipssp.cmEditor3);
						cmEditorObject.setCursor(cmEditorObject.lineCount(), 0);
						cmEditorObject.focus();
						zipssp.ziahighlightfn(cmEditorObject);
					});
					zipssp.displayCustomDataset = null;
					zipssp.codemirrorfn(prediction, languageOfDataset);

					jQuery(".ui-dialog-titlebar-close").off('click').on('click', function () { //NO I18N
						zipssp.promptCancel();
					});
				},
				width: 1150,
				position: {
					my: 'top', //NO I18N
					at: 'top', //NO I18N
					of: window
				},
				dialogClass: 'ziadup-parent', // no i18n
			});
		}, 510);

		jQuery(".ui-dialog-title").text(titleStr);

		jQuery("#zia-wizard-span-1").attr("title", ziaWizardInfoMsg_1);
		jQuery("#zia-wizard-span-2").attr("title", ziaWizardInfoMsg_2);
		jQuery("#zia-wizard-label-1").text(ziaWizardLabel_1);
		jQuery("#zia-wizard-label-2").text(ziaWizardLabel_2);
		if (prediction === "approvalprediction") {
			jQuery("#zia-wizard-span-3").attr("title", ziaWizardInfoMsg_3);
			jQuery("#zia-wizard-label-3").text(ziaWizardLabel_3);
		}

		jQuery("#testzia-content").text(testziacontent);
		jQuery("#trainzia-content").text(trainziacontent);
		jQuery("#ziawiz-content3").text(ziawizcontent3);
	},
	/* To invoke getData GET call for getting the dataset and show the appropriate dataset in codemirrors using codemirrorutilfn(). */
	codemirrorfn: function (prediction, languageOfDataset) {
		if (zipssp.cmEditor1) {
			zipssp.cmEditor1.toTextArea();
		}
		if (zipssp.cmEditor2) {
			zipssp.cmEditor2.toTextArea();
		}
		if (zipssp.cmEditor3) {
			zipssp.cmEditor3.toTextArea();
		}
		zipssp.currentLang = prediction == 'approvalprediction' ? languageOfDataset : 'english'; // no i18n

		if (prediction == 'approvalprediction' && zipssp.displayCustomDataset != null) {
			// zipssp.displayCustomDataset object present so, use that
			zipssp.codemirrorutilfn(prediction, zipssp.displayCustomDataset);
		} else {
			// call AIAjaxServlet
			var newUrl = '/servlet/AIAjaxServlet?'; //NO I18N
			var params = 'command=getData&action=' + prediction;	//NO I18N

			sdpAjax({
				url: newUrl + params,
				type: 'GET', // No I18N
				success: function (response) {
					if (response.status == 'success') {
						zipssp.displayCustomDataset = response['dataset'];
						zipssp.codemirrorutilfn(prediction, zipssp.displayCustomDataset);
						if (prediction == 'approvalprediction') {
							zipssp.stuffCustomDataInitially(zipssp.displayCustomDataset);
						}
						if (response.not_yet_enabled) {
							jQuery('[data-id=restorebtn]').prop('disabled', true);  //NO I18N
							jQuery('[data-id=predictionbtn]').removeAttr('onclick').addClass('cur-def opac5').attr('title', translate('zia.wiz.testzia.disable.tooltip')).attr('rel', 'uitip');
							jQuery("#testzia-content, #test-footer").addClass("hide");
							jQuery("#trainzia-content, #train-footer").removeClass("hide");
						} else {
							jQuery('[data-id=predictionbtn]').attr('onclick', 'zipssp.zverfyPrediction()').removeClass("cur-def opac5").removeAttr('title');
							jQuery("#testzia-content, #test-footer").removeClass("hide");
							jQuery("#trainzia-content, #train-footer").addClass("hide");
						}
						var imbalanceWarningDiv = jQuery("#imbalance-warning");
						if (!response.is_balanced) {
							var positive = translate("sdp.approve.approve");
							var negative = translate("common.reject");
							if (prediction === "reopenprediction") {
								positive = translate("zia.reopen.label");
								negative = translate("zia.notreopen.label");
							}
							var imbalancewarning = translate("zia.customdata.imbalance.msg", [positive, negative]);
							imbalanceWarningDiv.removeClass("hide")
							imbalanceWarningDiv.find('.msg').text(imbalancewarning);
						} else {
							imbalanceWarningDiv.addClass("hide");
						}
						initTooltip('#ziadataset'); // NO I18N
					}
				}
			});
		}

	},
	/* Given the dataset parameter, render the dataset in codemirrors. */
	codemirrorutilfn: function (prediction, dataset) {

		//SD-121754 : Configuring the RTL as the direction to display in codemirror
		let currentLanguage=zipssp.currentLang.toLowerCase();
		let rtlLanguages=["arabic","hebrew"];   //No i18n
		let direction= rtlLanguages.indexOf(currentLanguage)==-1 ? "ltr" : "rtl"; //No i18n

		zipssp.cmEditor1 = CodeMirror.fromTextArea(document.getElementById("dataset-label-1"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: null,
			direction:direction
		});
		zipssp.cmEditor2 = CodeMirror.fromTextArea(document.getElementById("dataset-label-2"), {
			lineNumbers: true,
			lineWrapping: true,
			mode: null,
			direction:direction
		});

		if (prediction == 'reopenprediction') {
			var label_1_data = "";
			if (dataset.defaultdata.label_1 != undefined) {
				label_1_data = dataset.defaultdata.label_1.data;
				zipssp.label_1_count = dataset.defaultdata.label_1.size;
			}
			var label_2_data = "";
			if (dataset.defaultdata.label_2 != undefined) {
				label_2_data = dataset.defaultdata.label_2.data;
				zipssp.label_2_count = dataset.defaultdata.label_2.size;
			}

			var decoded_label_1_data = decodeURIComponent(label_1_data);
			var decoded_label_2_data = decodeURIComponent(label_2_data);
			zipssp.cmEditor1.setValue(decoded_label_1_data);
			zipssp.cmEditor2.setValue(decoded_label_2_data);

		} else {
			zipssp.cmEditor3 = CodeMirror.fromTextArea(document.getElementById("dataset-label-3"), {
				lineNumbers: true,
				lineWrapping: true,
				mode: null,
				direction:direction
			});


			var label_1_display_data = "";
			var label_1_custom_data = "";
			if (dataset[zipssp.currentLang].displaydata != undefined && dataset[zipssp.currentLang].displaydata.label_1 != undefined) {
				label_1_display_data = dataset[zipssp.currentLang].displaydata.label_1.data;
				zipssp.label_1_count = dataset[zipssp.currentLang].displaydata.label_1.size;
			}
			if (dataset[zipssp.currentLang].customdata != undefined && dataset[zipssp.currentLang].customdata.label_1 != undefined) {
				label_1_custom_data = dataset[zipssp.currentLang].customdata.label_1.data;
			}
			var label_2_display_data = "";
			var label_2_custom_data = "";
			if (dataset[zipssp.currentLang].displaydata != undefined && dataset[zipssp.currentLang].displaydata.label_2 != undefined) {
				label_2_display_data = dataset[zipssp.currentLang].displaydata.label_2.data;
				zipssp.label_2_count = dataset[zipssp.currentLang].displaydata.label_2.size;
			}
			if (dataset[zipssp.currentLang].customdata != undefined && dataset[zipssp.currentLang].customdata.label_2 != undefined) {
				label_2_custom_data = dataset[zipssp.currentLang].customdata.label_2.data;
			}

			var label_3_display_data = "";
			var label_3_custom_data = "";
			if (dataset[zipssp.currentLang].displaydata != undefined && dataset[zipssp.currentLang].displaydata.label_3 != undefined) {
				label_3_display_data = dataset[zipssp.currentLang].displaydata.label_3.data;
				zipssp.label_3_count = dataset[zipssp.currentLang].displaydata.label_3.size;
			}
			if (dataset[zipssp.currentLang].customdata != undefined && dataset[zipssp.currentLang].customdata.label_3 != undefined) {
				label_3_custom_data = dataset[zipssp.currentLang].customdata.label_3.data;
			}

			var decoded_label_1_display_data = decodeURIComponent(label_1_display_data);
			var decoded_label_2_display_data = decodeURIComponent(label_2_display_data);
			var decoded_label_3_display_data = decodeURIComponent(label_3_display_data);

			var decoded_label_1_custom_data = decodeURIComponent(label_1_custom_data);
			var decoded_label_2_custom_data = decodeURIComponent(label_2_custom_data);
			var decoded_label_3_custom_data = decodeURIComponent(label_3_custom_data);

			// Get unsaved positive / negative data for the given language as well to display.
			/* Append the existing custom data (if present) to the decodedPositiveData by default.
			If, you have unsaved data present for this particular language and action,
			instead of showing the existing custom data, show whatever data can be retrieved from the UI and stuff it in customData.
			*/

			if (zipssp.approvalCustomData[zipssp.currentLang] != undefined && zipssp.approvalCustomData[zipssp.currentLang]['label_1'] != undefined) {
				var unsaved_label_1_data = zipssp.getCustomDataToDisplay(zipssp.currentLang, 'label_1').join('\n'); // no i18n
				if (unsaved_label_1_data != '') {
					unsaved_label_1_data = unsaved_label_1_data + '\n'; // no i18n
				}
				if (zipssp.currentLang == 'verified-emailapproval') {
					zipssp.cmEditor1.setValue(unsaved_label_1_data);
				} else {
					zipssp.cmEditor1.setValue(decoded_label_1_display_data.replace(/\n+$/, '') + '\n' + unsaved_label_1_data); // no i18n
				}

			} else {
				zipssp.cmEditor1.setValue(decoded_label_1_display_data + decoded_label_1_custom_data);
			}

			if (zipssp.approvalCustomData[zipssp.currentLang] != undefined && zipssp.approvalCustomData[zipssp.currentLang]['label_2'] != undefined) {
				var unsaved_label_2_data = zipssp.getCustomDataToDisplay(zipssp.currentLang, 'label_2').join('\n'); // no i18n
				if (unsaved_label_2_data != '') {
					unsaved_label_2_data = unsaved_label_2_data + '\n'; // no i18n
				}
				if (zipssp.currentLang == 'verified-emailapproval') {
					zipssp.cmEditor2.setValue(unsaved_label_2_data);
				} else {
					zipssp.cmEditor2.setValue(decoded_label_2_display_data.replace(/\n+$/, '') + '\n' + unsaved_label_2_data); // no i18n
				}

			} else {
				zipssp.cmEditor2.setValue(decoded_label_2_display_data + decoded_label_2_custom_data);
			}

			if (zipssp.approvalCustomData[zipssp.currentLang] != undefined && zipssp.approvalCustomData[zipssp.currentLang]['label_3'] != undefined) {
				var unsaved_label_3_data = zipssp.getCustomDataToDisplay(zipssp.currentLang, 'label_3').join('\n'); // no i18n
				if (unsaved_label_3_data != '') {
					unsaved_label_3_data = unsaved_label_3_data + '\n'; // no i18n
				}
				if (zipssp.currentLang == 'verified-emailapproval') {
					zipssp.cmEditor3.setValue(unsaved_label_3_data);
				} else {
					zipssp.cmEditor3.setValue(decoded_label_3_display_data.replace(/\n+$/, '') + '\n' + unsaved_label_3_data); // no i18n
				}
			} else {
				zipssp.cmEditor3.setValue(decoded_label_3_display_data + decoded_label_3_custom_data);
			}
		}

		//for disable mode
		if (prediction == "approvalprediction" && zipssp.currentLang != 'verified-emailapproval') {
			zipssp.cmEditor1.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_1_count,
				ch: 0
			}, {
				readOnly: true
			});
			zipssp.cmEditor1.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_1_count,
				ch: 0
			}, {
				className: 'opac5'//NO I18N
			});

			zipssp.cmEditor2.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_2_count,
				ch: 0
			}, {
				readOnly: true
			});
			zipssp.cmEditor2.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_2_count,
				ch: 0
			}, {
				className: 'opac5'//NO I18N
			});

			zipssp.cmEditor3.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_3_count,
				ch: 0
			}, {
				readOnly: true
			});
			zipssp.cmEditor3.markText({
				line: 0,
				ch: 0
			}, {
				line: zipssp.label_3_count,
				ch: 0
			}, {
				className: 'opac5'//NO I18N
			});
		}
		// Clears the editor's undo history after setting the values for each page (dropdown selection)
		zipssp.cmEditor1.clearHistory();
		zipssp.cmEditor2.clearHistory();

		zipssp.cmEditor1.setSize("100%", "400px"); //NO I18N
		zipssp.cmEditor2.setSize("100%", "400px"); //NO I18N

		if (prediction == "approvalprediction") {
			zipssp.cmEditor3.clearHistory();
			zipssp.cmEditor3.setSize("100%", "400px"); //NO I18N
		}

		// WCAG Standards
		var language_code = 'en'; // no i18n
		if (prediction == 'approvalprediction' && zipssp.displayCustomDataset != null){
			language_code = zipssp.displayCustomDataset[zipssp.currentLang].locale_code;
			if (language_code) {
				language_code = language_code.split('_')[0];
				// For Hebrew, WCAG Standard's ISO code is 'he' but, from our code, we get 'iw'
				if (language_code == 'iw') {
					language_code = 'he'; // no i18n
				}
			} else {
				// For verified-emailapproval case
				language_code = "unavailable"; // no i18n
			}
		}

		var label1Div = jQuery('#zia-wizard-1 > .block-bordered');
		label1Div.attr('lang', language_code);
		var label2Div = jQuery('#zia-wizard-2 > .block-bordered');
		label2Div.attr('lang', language_code);
		var label3Div = prediction == 'approvalprediction' ? jQuery('#zia-wizard-3 > .block-bordered') : null; // no i18n
		if (label3Div) {
			label3Div.attr('lang', language_code);
		}
		// For verified-emailapproval case
		if (language_code == 'unavailable') {
			label1Div.removeAttr('lang');
			label2Div.removeAttr('lang');
			label3Div.removeAttr('lang');
		}

	},
	/* To invoke restoreDefaultData POST call. */
	ziadatarestorefn: function () {
		function ziarestorefn(s) {
			if (s) {
				var fromVal = "ziaconfiguration"; //NO I18N
				if (jQuery("#zia_ssp").length > 0) {
					fromVal = "ssp"; //NO I18N
				}
				var actionname = jQuery("#predictionaction").val();
				var newUrl = '/servlet/AIAjaxServlet?'; //NO I18N
				var params = 'command=restoreDefaultData&fromVal=' + fromVal + '&action=' + actionname; //NO I18N

				sdpAjax({
					url: newUrl + params,
					type: 'POST', // No I18N
					success: function (response) {
						if (response.status == "success") {
							zipssp.approvalCustomData = {};
							jQuery('#ziadataset').dialog('close'); //NO I18N
							showalert('success', translate("zia.restoredata.successmsg"), 'isAutoHide=true,delay=3'); //NO I18N
						}
						if (response.status == "retiredportal") {
							showalert('failure', translate("mdh.restricted.portals.cud.msg"), 'isAutoHide=false,delay=3'); //NO I18N
						}
					}
				});
			}
		}
		showconfirm(true, 'message=' + translate('zia.approvalwiz.restoredefault.alert') + ', submitbutton=Ok, cancelbutton=Cancel, closebutton=no, closeOnEscKey=yes', ziarestorefn); //NO I18N
	},
	/* To check for prerequisites while clicking submit button after customizing data in code mirror. */
	ziadatasetsavefn: function (operation) {
		/**approve and reject validated**/
		var submitButton = document.activeElement;
		var msg = jQuery(submitButton).button('loading');
		var eqdata = [];
		var app = 0;
		var rej = 0;
		var duplicatedInLangMap = {};

		var positive = translate("sdp.approve.approve");
		var negative = translate("common.reject");

		/*approve data validated*/
		var label_1_data = [];
		zipssp.cmEditor1.eachLine(function (line) {
			if (line.text.trim() != '') {
				label_1_data.push(line.text);
			}
		});

		/*reject data validated*/
		var label_2_data = [];
		zipssp.cmEditor2.eachLine(function (line) {
			if (line.text.trim() != '') {
				label_2_data.push(line.text);
			}
		});

		var actionname = jQuery("#predictionaction").val();
		if (actionname == 'reopenprediction') {
			positive = translate("zia.reopen.label");
			negative = translate("zia.notreopen.label");

			zipssp.cmEditor1.eachLine(function (line) {
				zipssp.cmEditor2.eachLine(function (secline) {
					if ((secline.text.toLowerCase().trim() == line.text.toLowerCase().trim()) && secline.text.toLowerCase() != '' && line.text.toLowerCase() != '') {
						if (secline.text !== "") {
							eqdata.push(secline.text);
						}
					}
				});
			});

			app = zipssp.find_duplicate_in_array(label_1_data);
			rej = zipssp.find_duplicate_in_array(label_2_data);
		} else {
			// Get a map that points to which language, which side and what data is being duplicated.
			zipssp.stuffCustomData();
			duplicatedInLangMap = zipssp.checkForDuplicates(zipssp.approvalCustomData);
		}

		if (app.length > 0) {
			showalert('warning', translate("zia.duplicate.singledata", [positive]), 'isAutoHide=false,closeOnEscKey=yes'); //NO I18N
			msg.button('reset');
			app.length = 0;
		} else if (rej.length > 0) {
			showalert('warning', translate("zia.duplicate.singledata", [negative]), 'isAutoHide=false,closeOnEscKey=yes'); //NO I18N
			msg.button('reset');
			rej.length = 0;
		} else if (eqdata.length > 0) {
			showalert('warning', translate("zia.duplicate.bothdata", [positive, negative]), 'isAutoHide=false,closeOnEscKey=yes'); //NO I18N
			msg.button('reset');
		} else if (actionname == 'approvalprediction' && zipssp.isEmailDataModifiedOrAdded(zipssp.approvalCustomData['verified-emailapproval'])) { // no i18n
			showalert('failure', translate("zia.deletion.onlyallowed.info"), 'isAutoHide=false'); // no i18n
			msg.button('reset');
		} else if (actionname == 'approvalprediction' && Object.keys(duplicatedInLangMap).length > 0) { // no i18n
			showalert('warning', translate("zia.clear.duplicates"), 'isAutoHide=true,closeOnEscKey=yes'); //NO I18N
			zipssp.showCarousel(duplicatedInLangMap);
			msg.button('reset');
		} else if ((actionname == 'reopenprediction') && (label_1_data.length == 0 || label_2_data.length == 0)) { // no i18n
			showalert('warning', translate("zia.nodata.msg"), 'isAutoHide=false,closeOnEscKey=yes'); //NO I18N
			msg.button('reset');
		} else {
			if (actionname == 'approvalprediction') {
				if (!zipssp.isChangeMadeInCustomData()) {
					jQuery('#duplicate-ziaentry').addClass('hide');
					jQuery('#ziadataset').addClass('wo-carousel');

					if (jQuery('[data-id=predictionbtn]').hasClass('cur-def opac5')) {
						zipssp.saveApprovalData(msg, operation);
					} else {
						showalert('warning', translate('sdp.common.nochangestosave'), 'isAutoHide=true,delay=5'); //NO I18N
						if (operation != undefined && operation == 'close') {
							jQuery('#ziadataset').dialog('close'); //NO I18N
						}
					}
					msg.button('reset');
				} else {
					showconfirm(true, 'title=' + translate("common.confirm") + ', message=' + translate("zia.appropriate.dataadded.warning") + ', submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes', function (confirm) { // no i18n
						if (confirm) {
							zipssp.saveApprovalData(msg, operation);
							jQuery('#duplicate-ziaentry').addClass('hide');
							jQuery('#ziadataset').addClass('wo-carousel');
						} else {
							msg.button('reset');
						}
					});
				}
			} else {
				zipssp.saveApprovalData(msg, operation);
				msg.button('reset');
			}
		}

	},
	/* To save the custom modified dataset and invoke getModifiedData POST call.  */
	saveApprovalData: function (msg, operation) {
		var fromVal = "ziaconfiguration"; //NO I18N
		if (jQuery("#zia_ssp").length > 0) {
			fromVal = "ssp"; //NO I18N
		}
		var action = jQuery("#predictionaction").val();

		var newUrl = '/servlet/AIAjaxServlet?'; //NO I18N
		var params = 'command=getModifiedData&action=' + action + '&label_1_count=' + zipssp.label_1_count + '&label_2_count=' + zipssp.label_2_count + '&fromVal=' + fromVal;//NO I18N

		// Adapting to MLAP changes.
		var customDataString;
		if (action == 'reopenprediction') {
			zipssp.reopenCustomData = {};
			zipssp.reopenCustomData['english'] = { "label_1": zipssp.cmEditor1.getValue().strip().split('\n'), "label_2": zipssp.cmEditor2.getValue().strip().split('\n') }; // no i18n
			customDataString = encodeURIComponent(sdpToJSON(zipssp.reopenCustomData));
		} else {
			customDataString = encodeURIComponent(sdpToJSON(zipssp.approvalCustomData));
			params = params + '&label_3_count=' + zipssp.label_3_count; //NO I18N
		}
		params = params + '&customData=' + customDataString; // no i18n

		sdpAjax({
			url: newUrl + params,
			type: 'POST', // No I18N
			success: function (response) {
				if (response.status == "success") {
					msg.button('reset');
					if (operation != undefined && operation == 'close') {
						jQuery('#ziadataset').dialog('close'); //NO I18N
					}
					if (response.not_yet_enabled) {
						jQuery('[data-id=predictionbtn]').removeAttr('onclick').addClass('cur-def opac5').attr('title', 'Please update Status').attr('rel', 'uitip');
					} else {
						jQuery('[data-id=predictionbtn]').attr('onclick', 'zipssp.zverfyPrediction()').removeClass("cur-def opac5").removeAttr('title');
					}
					var imbalanceWarningDiv = jQuery("#imbalance-warning");
					if (!response.is_app_balanced) {
						if (action == 'reopenprediction') {
							var positive = translate("zia.reopen.label");
							var negative = translate("zia.notreopen.label");
							var imbalancewarning = translate("zia.customdata.imbalance.msg", [positive, negative]);
							imbalanceWarningDiv.removeClass("hide");
							imbalanceWarningDiv.find(".msg").text(imbalancewarning);
							// SD-104545 Show warning alert for imbalanced data
							showalert('warning', response.message, 'isAutoHide=false,delay=5'); //NO I18N
						}
					} else {
						// If it is approval prediction, then reload oldApprovalCustomData after clicking save button.
						if (action == 'approvalprediction') {
							zipssp.oldApprovalCustomData = Object.assign({}, zipssp.approvalCustomData); // Copying without reference
							zipssp.codemirrorfn(action, zipssp.currentLang);
							showalert('success', response.message, 'isAutoHide=true,delay=5'); //NO I18N

						} else {
							// SD-104545 Show warning alert for imbalanced data
							imbalanceWarningDiv.addClass("hide");
							showalert('success', response.message, 'isAutoHide=true,delay=5'); //NO I18N
						}

					}
				} else {
					msg.button('reset');
					showalert('failure', response.message, 'isAutoHide=false,delay=3'); //NO I18N
				}
			}
		});
	},
	/* To render history page for Zia configurations.  */
	processHistory: function (response, sort_order) {
		var finalData = [],
			self = this;
		/**
		 * get the i18n string
		 */

		for (var history_index = 0; history_index < response.history.length; history_index++) {
			var item = response.history[history_index],
				history_obj = "";

			/**
			 * Set the icon for the operation
			 */
			item.className = "sdp-glyph sdp-glyph-edit2";
			item.operation = item.operation;
			item.display_operation_name = translate("sdp.requests.history.updated");//NO I18N

			finalData.push(item);

		}
		if (sort_order === "D") { // No I18N
			finalData = finalData.reverse();
		}

		return finalData;
	},
	/* To highlight codemirror eol after clicking addnewdata button. */
	ziahighlightfn: function (data) {
		var line = data.lastLine();
		data.addLineClass(line, 'text', 'highlight-anim'); // No I18N
		setTimeout(function () {
			data.removeLineClass(line, 'text', 'highlight-anim'); // No I18N
		}, 3100);
	},
	/* To freeze the language dropdown menu when switching to Added by Email section. */
	freezeDropDown: function (prediction) {

		var frspelang = jQuery('#frspelang');
		var frspelangOptionsDiv = jQuery('#frspelang-options');
		let freeze = jQuery('#abemail').is(':checked'); // no i18n
		if (freeze) {
			// Populate customData before viewing email data.
			zipssp.stuffCustomData();
			//While freezing, store the language that is last set in a global variable. using that variable, when you unfreeze the dropdown, just load that language dataset.
			zipssp.lastSelectedLang = frspelangOptionsDiv.val();
			zipssp.codemirrorfn(prediction, "verified-emailapproval"); // no i18n
			//When freezing, Add New Data should not be seen.
			jQuery("#addnewdata1,#addnewdata2, #addnewdata3").addClass('hide');
		} else {
			//Load the last selected language dataset.
			if (!frspelang.is(':checked')) {
				frspelangOptionsDiv.val(zipssp.lastSelectedLang).trigger("change");
			}
			zipssp.onChangeDropDown(prediction);
			//When unfreezing, Add New Data should be visible.
			jQuery("#addnewdata1,#addnewdata2, #addnewdata3").removeClass('hide');
		}
		if (sdp_app['IS_MULTILINGUAL_LICENSE']) {
			frspelangOptionsDiv.prop('disabled', freeze); // no i18n
		} else {
			frspelangOptionsDiv.prop('disabled', true); // no i18n
		}
	},
	/* To render the custom dataset when a language is selected from dropdown. */
	onChangeDropDown: function (prediction) {
		if (prediction == "approvalprediction") {
			// Populate customData before changing the dropdown.
			if (zipssp.cmEditor1 || zipssp.cmEditor2 || zipssp.cmEditor3) {
				zipssp.stuffCustomData();
			}
			var selectedValue = jQuery('#frspelang-options :selected').val();
			zipssp.codemirrorfn(prediction, selectedValue);
		}
	},
	/* To populate the custom dataset in the current language page while switching dataset. */
	stuffCustomData: function () {
		var prediction = jQuery("#predictionaction").val();
		if (prediction == 'approvalprediction') {
			var label_1_data = [];
			zipssp.cmEditor1.eachLine(function (line) {
				if (line.text.trim() != '') {
					label_1_data.push(line.text);
				}
			});

			var label_2_data = [];
			zipssp.cmEditor2.eachLine(function (line) {
				if (line.text.trim() != '') {
					label_2_data.push(line.text);
				}
			});

			var label_3_data = [];
			zipssp.cmEditor3.eachLine(function (line) {
				if (line.text.trim() != '') {
					label_3_data.push(line.text);
				}
			});

			var label_1_custom_added_data = label_1_data;
			var label_2_custom_added_data = label_2_data;
			var label_3_custom_added_data = label_3_data;
			if (zipssp.currentLang != 'verified-emailapproval') {
				label_1_custom_added_data = label_1_data.splice(zipssp.label_1_count);
				label_2_custom_added_data = label_2_data.splice(zipssp.label_2_count);
				label_3_custom_added_data = label_3_data.splice(zipssp.label_3_count);
			}
			zipssp.approvalCustomData[zipssp.currentLang] = { "label_1": label_1_custom_added_data, "label_2": label_2_custom_added_data, "label_3": label_3_custom_added_data }; // no i18n
		}
	},
	/* To populate custom dataset initially with the given dataset parameter. */
	stuffCustomDataInitially: function (dataset) {
		zipssp.approvalCustomData = {};
		zipssp.oldApprovalCustomData = {};
		Object.keys(dataset).forEach(key => {
			var arr1 = [];
			var arr2 = [];
			var arr3 = [];
			// All the custom data content will be stuffed initially.
			if (dataset[key].customdata.label_1 != undefined && dataset[key].customdata.label_2 != undefined && dataset[key].customdata.label_3 != undefined) {
				var label_1_custom_data_str = decodeURIComponent(dataset[key].customdata.label_1.data);
				arr1 = label_1_custom_data_str.split('\n').filter(function (elem) {
					return elem != '';
				});
				var label_2_custom_data_str = decodeURIComponent(dataset[key].customdata.label_2.data);
				arr2 = label_2_custom_data_str.split('\n').filter(function (elem) {
					return elem != '';
				});

				var label_3_custom_data_str = decodeURIComponent(dataset[key].customdata.label_3.data);
				arr3 = label_3_custom_data_str.split('\n').filter(function (elem) {
					return elem != '';
				});

				zipssp.approvalCustomData[key] = { 'label_1': arr1, 'label_2': arr2 , 'label_3': arr3 }; // no i18n
				zipssp.oldApprovalCustomData[key] = { 'label_1': arr1, 'label_2': arr2 , 'label_3': arr3 }; // no i18n
			}
		});
	},
	/* To return custom data as a list for the given language and side. */
	getCustomDataToDisplay: function (lang, act) {
		if (zipssp.approvalCustomData[lang] != undefined && zipssp.approvalCustomData[lang][act] != undefined) {
			return zipssp.approvalCustomData[lang][act];
		}
		return [];
	},
	/* To check if there is any data added to any side of the selected language dataset. */
	isCustomDataEmpty: function () {
		for (let lang in zipssp.approvalCustomData) {
			for (let act in zipssp.approvalCustomData[lang]) {
				const arr = zipssp.approvalCustomData[lang][act];
				if (arr.length != 0) {
					return false;
				}
			}
		}
		return true;
	},
	/* To check if there is any change made in approvalCustomData. */
	isChangeMadeInCustomData: function () {
		// If customData and oldCustomData are different, then there are few changes made.
		// This will be helpful in finding if unsaved changes are present while closing the window and while checking for 'No changes to save'.
		for (let lang in zipssp.approvalCustomData) {
			for (let act in zipssp.approvalCustomData[lang]) {
				const arr = zipssp.approvalCustomData[lang][act];
				if (zipssp.oldApprovalCustomData[lang] != undefined && zipssp.oldApprovalCustomData[lang][act] != undefined) {
					const oldArr = zipssp.oldApprovalCustomData[lang][act];
					if ((oldArr.length == 0) && (arr.length != 0)) {
						return true;
					} else {
						for (let i = 0; i < arr.length; i++) {
							if (oldArr.indexOf(arr[i]) == -1) {
								return true;
							}
						}
						for (let i = 0; i < oldArr.length; i++) {
							if (arr.indexOf(oldArr[i]) == -1) {
								return true;
							}
						}
					}
				} else if (arr.length > 0) {
					return true;
				} else if (Object.keys(zipssp.oldApprovalCustomData).length == 0) {
					if (!zipssp.isCustomDataEmpty()) {
						return true;
					}
				}
			}
		}
		return false;
	},
	/* To keep checks before closing the dataset dialog box for approval / reopen prediction. */
	promptCancel: function () {
		var datasetDiv = jQuery('#ziadataset');
		function promptcancelfn(t) {
			if (t) {
				zipssp.displayCustomDataset = null;
				// Make sure that lastSelectedLang and currentLang variables are refreshed properly.
				zipssp.lastSelectedLang = null;
				zipssp.currentLang = null;
				zipssp.approvalCustomData = {};
				datasetDiv.dialog('close'); // no i18n
			}
		}
		var prediction = jQuery("#predictionaction").val();
		if (prediction == 'approvalprediction') {
			zipssp.stuffCustomData();
			if (zipssp.isChangeMadeInCustomData()) {
				showconfirm(true, 'title=' + translate("common.confirm") + ', message=' + translate('form.leave.alert') + ', submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes', promptcancelfn); // no i18n
			} else {
				datasetDiv.dialog('close'); // no i18n
			}
		}
		else {
			datasetDiv.dialog('close'); // no i18n
		}
	},
	/* To animate sdrider sliding. */
	sdrider: function (whatstate, cur) {
		jQuery('#ziadup-slider').sdRider(whatstate);
		setTimeout(function () {
			jQuery(cur).trigger('blur');
		}, 10);
	},
	/* Given the duplicate data in a map, render the sdrider to show the duplicates. */
	showCarousel: function (duplicateMap) {

		jQuery('#ziadataset').removeClass('wo-carousel');
		let lenOfDuplicates = Object.keys(duplicateMap).length;
		jQuery('#noofduplicates').text(lenOfDuplicates + " ");
		var dupZiaEntry = jQuery('#duplicate-ziaentry');
		var dupZiaSlider = jQuery('#ziadup-slider');
		dupZiaEntry.removeClass('hide');
		dupZiaEntry.add(dupZiaSlider).addClass('ziadup-highlight');
		setTimeout(function () {
			dupZiaEntry.add(dupZiaSlider).removeClass('ziadup-highlight');
		}, 1000);
		jQuery('.sdrider-inner').empty();
		let dataEle = 1;
		let activeString = 'active'; // no i18n
		for (sentence in duplicateMap) {

			/* Render the duplicate sentence info */

			var sentenceDivStr = "<div class=\"item " + activeString + "\" data-ele=\"" + dataEle + "\">"
				+ "   <div>"
				+ "	   <span class=\"text-color2\">" + translate("zia.data") + " :</span>"
				+ "	   <span class=\"sb maxw-500px disp-ib text-overflow vbottom\">" + encodeHTML(sentence.capitalize()) + "</span>"
				+ "	   <span class=\"fr\">" + translate("zia.entry") + " : " + dataEle + " / " + lenOfDuplicates + "	</span>"
				+ "   </div>"
				+ "   <div class=\"mt10\">" + translate("zia.data.duplicated.in") + "</div>"
				+ "   <div class=\"ziadp-grid\"></div>"
				+ "</div>";
			activeString = '';

			jQuery('.sdrider-inner').append(sentenceDivStr);
			/* Render the language and action info */
			let sentenceOccurrence = Object.keys(duplicateMap[sentence]).length; // To get the no of occurrences of the sentence in other dataset
			Object.keys(duplicateMap[sentence]).forEach(key => {

				if (sentenceOccurrence > 1 && key == zipssp.currentLang) {
					return;
				}

				let actionArr = [...new Set(duplicateMap[sentence][key])]; // Convert this to a set and then convert it to an array.
				let dataset;
				if (key == 'verified-emailapproval') {
					dataset = 'Added by Email'; // no i18n
				} else {
					dataset = key.capitalize();
				}
				let action = actionArr.join(', ');
				if (actionArr.length != 0) {
					var datasetActionDivStr = "<div>"
						+ "	<div>"
						+ "		<span class=\"text-color2\" rel=\"uitip\" mode_ellipsis=\"true\" title=\"" + translate("zia.dataset") + "\">" + translate("zia.dataset") + "</span>"
						+ "		<span class=\"ml3 mr3\">:</span>"
						+ "		<span rel=\"uitip\" mode_ellipsis=\"true\" title=\"\" orgtitle=\"" + dataset + "\">" + dataset + "</span>"
						+ "	</div>"
						+ "	<div>"
						+ "		<span class=\"text-color2\" rel=\"uitip\" mode_ellipsis=\"true\" title=\"" + translate("common.action") + "\">" + translate("common.action") + "</span>"
						+ "		<span class=\"ml3 mr3\">:</span>"
						+ "		<span rel=\"uitip\" mode_ellipsis=\"true\" title=\"" + action + "\">" + action + "</span>"
						+ "	</div>"
						+ "	</div>"
					jQuery('[data-ele=\"' + dataEle + '\"] .ziadp-grid').append(datasetActionDivStr);
				}
			});

			dataEle += 1;

		}
		initTooltip('.ziadup-section'); // no i18n
		if (lenOfDuplicates == 1) {
			jQuery('#ziadup-next').prop('disabled', true); // no i18n
			jQuery('#ziadup-prev').prop('disabled', true); // no i18n
		} else {
			jQuery('#ziadup-next').prop('disabled', false); // no i18n
			jQuery('#ziadup-prev').prop('disabled', false); // no i18n
		}
		jQuery('#ziadup-slider').sdRider({interval:false}); // no i18n
	},
	/* Given the dataset present in Added by Email content code mirror, check if any new data is added or existing data is modified. */
	isEmailDataModifiedOrAdded: function (newEmailData) {
		let oldEmailData = zipssp.oldApprovalCustomData['verified-emailapproval']; // no i18n
		if (oldEmailData == undefined) {
			if (newEmailData && newEmailData['label_1'].length != 0) {
				return true;
			}
			if (newEmailData && newEmailData['label_2'].length != 0) {
				return true;
			}
			if (newEmailData && newEmailData['label_3'].length != 0) {
				return true;
			}
		} else {

			if (newEmailData['label_1'].length == oldEmailData['label_1'].length) {
				for (const newData of newEmailData['label_1']) {
					if (oldEmailData['label_1'].indexOf(newData) == -1) {
						return true;
					}
				}
			} else if (newEmailData['label_1'].length > oldEmailData['label_1'].length) {
				return true;
			}

			if (newEmailData['label_2'].length == oldEmailData['label_2'].length) {
				for (const newData of newEmailData['label_2']) {
					if (oldEmailData['label_2'].indexOf(newData) == -1) {
						return true;
					}
				}
			} else if (newEmailData['label_2'].length > oldEmailData['label_2'].length) {
				return true;
			}

			if (newEmailData['label_3'].length == oldEmailData['label_3'].length) {
				for (const newData of newEmailData['label_3']) {
					if (oldEmailData['label_3'].indexOf(newData) == -1) {
						return true;
					}
				}
			} else if (newEmailData['label_3'].length > oldEmailData['label_3'].length) {
				return true;
			}
		}
		return false;
	},
	/* To check if duplicate data is present in postive / negative side itself for reopen prediction code mirror. */
	find_duplicate_in_array: function (arra1) {
		var result = [];
		var object = {};
		arra1.forEach(function (item) {
			var item1 = item.trim().toLowerCase();
			if (!object[item1]) {
				object[item1] = 0;
			}
			object[item1] += 1;
		})
		for (var prop in object) {
			if (object[prop] >= 2 && prop !== "") {
				result.push(prop);
			}
		}
		return result;
	},
	/* To check if duplicate data present in dataset and return a formatted Map for showing alert. */
	checkForDuplicates: function (unsavedDataObj) {
		let outputObj = {};
		Object.keys(zipssp.displayCustomDataset).forEach(key => {
			var arr1 = [];
			var arr2 = [];
			var arr3 = [];
			if (key == 'verified-emailapproval') {
				if (unsavedDataObj[key] && unsavedDataObj[key].label_1 != undefined) {
					arr1 = unsavedDataObj[key].label_1.map(elem => {
						return elem.toLowerCase().trim();
					});
				}
				if (unsavedDataObj[key] && unsavedDataObj[key].label_2 != undefined) {
					arr2 = unsavedDataObj[key].label_2.map(elem => {
						return elem.toLowerCase().trim();
					});
				}
				if (unsavedDataObj[key] && unsavedDataObj[key].label_3 != undefined) {
					arr3 = unsavedDataObj[key].label_3.map(elem => {
						return elem.toLowerCase().trim();
					});
				}
			} else {
				var displaydata = zipssp.displayCustomDataset[key].displaydata;
				var label1DisplayDataStr = decodeURIComponent(displaydata.label_1.data);
				arr1 = label1DisplayDataStr.split('\n').filter(function (elem) {
					return elem != '';
				}).map(elem => {
					return elem.toLowerCase().trim();
				});
				var label2DisplayDataStr = decodeURIComponent(displaydata.label_2.data);
				arr2 = label2DisplayDataStr.split('\n').filter(function (elem) {
					return elem != '';
				}).map(elem => {
					return elem.toLowerCase().trim();
				});
				var label3DisplayDataStr = decodeURIComponent(displaydata.label_3.data);
				arr3 = label3DisplayDataStr.split('\n').filter(function (elem) {
					return elem != '';
				}).map(elem => {
					return elem.toLowerCase().trim();
				});
			}

			for (const lang in unsavedDataObj) {
				/* Email contents from getData call should not be compared with unsaved email contents in UI */
				if (!(key == 'verified-emailapproval' && lang == 'verified-emailapproval')) {
					for (const act in unsavedDataObj[lang]) {
						const dataArr = unsavedDataObj[lang][act];
						dataArr.forEach(function (cdata) {
							let formattedCData = cdata.toLowerCase().trim();
							if (arr1.indexOf(formattedCData) != -1) {
								if (!outputObj[formattedCData]) {
									outputObj[formattedCData] = {};
								}
								if (!outputObj[formattedCData][key]) {
									outputObj[formattedCData][key] = [];
								}
								outputObj[formattedCData][key].push(translate("approval.approve"));
							}
							if (arr2.indexOf(formattedCData) != -1) {
								if (!outputObj[formattedCData]) {
									outputObj[formattedCData] = {};
								}
								if (!outputObj[formattedCData][key]) {
									outputObj[formattedCData][key] = [];
								}
								outputObj[formattedCData][key].push(translate("approval.reject"));
							}
							if (arr3.indexOf(formattedCData) != -1) {
								if (!outputObj[formattedCData]) {
									outputObj[formattedCData] = {};
								}
								if (!outputObj[formattedCData][key]) {
									outputObj[formattedCData][key] = [];
								}
								outputObj[formattedCData][key].push(translate("sdp.approve.needclarification"));
							}
						});
					}
				}
			}
		});
		/* To check if duplicates lie among the custom dataset. */
		var visitedSentencesInUnsavedData = {};
		for (const lang in unsavedDataObj) {
			for (const act in unsavedDataObj[lang]) {
				const dataArr = unsavedDataObj[lang][act];
				dataArr.forEach(function (cdata) {
					let key = cdata.toLowerCase().trim();
					if (visitedSentencesInUnsavedData[key]) {
						visitedSentencesInUnsavedData[key].push({ 'language': lang, 'action': act });
					} else {
						visitedSentencesInUnsavedData[key] = [{ 'language': lang, 'action': act }]; // no i18n
					}
				});
			}
		}

		for (const sentence in visitedSentencesInUnsavedData) {
			let noOfOccurrences = visitedSentencesInUnsavedData[sentence].length;
			if (noOfOccurrences > 1) {
				visitedSentencesInUnsavedData[sentence].forEach(langActObj => {
					if (outputObj[sentence] == undefined) {
						outputObj[sentence] = {};
					}
					let visitedLang = langActObj['language'];
					let visitedAct = langActObj['action'];

					if (outputObj[sentence][visitedLang] == undefined) {
						outputObj[sentence][visitedLang] = [];
					}
					outputObj[sentence][visitedLang].push(visitedAct == 'label_1' ? translate("approval.approve") : visitedAct == 'label_2' ? translate("approval.reject") : translate("sdp.approve.needclarification"));
				});
			}
		}
		return outputObj;
	},
	/**
	 * The function is used to save the notification content to be displayed in the approval notification email
	 * when Zia Approval prediciton is enabled
	 * @param {String} notifyType module
	 */
	saveApprovalTokenValue: function (notifyType) {
		var tokenVal = jQuery("#ApprovalActionTokenDef").val();
		tokenVal = tokenVal.replace(/((\r\n)|(\n)|(\r))/g, "<br>");
		var percentEncodedTokenVal = tokenVal.replace(/%/g, "%25");
		percentEncodedTokenVal = encodeURIComponent(percentEncodedTokenVal);
		if (tokenVal.length <= 500) {
			var newUrl = '/servlet/SDAjaxServlet?'; //NO I18N
			var params = 'module=admin&action=saveApprovalTokenValue&tokenValue=' + percentEncodedTokenVal + '&notifyType=' + notifyType; //NO I18N
			sdpAjax({
				url: newUrl + params,
				type: 'POST', // No I18N
				success: function (response) {
					if (response.status == "success") {
						parent.suggestOnHover.innerHTML = response.token;
						closeDialog();
					}
				}
			});
		} else {
			jQuery('body').find("#lengtherror").text(translate("sdp.admin.notification.email.autosuggesttoken.edit.save.lengtherror")).show();
			jQuery("#autovaluesave").prop("disabled", false);	//No I18N
		}
	},
	ziastatustoggle: function ($this, actionname) {
		jQuery("#zialoadingfreeze").removeClass('hide');
		var this_ = jQuery($this),
			thisSpan = this_.find('span'),
			thisOn = thisSpan.hasClass('on'), //NO I18N
			thisTarget = this_.find('[name=toggleButton]').attr('id'),
			thisId = jQuery('#' + thisTarget);
		thisSpan.toggleClass('on').toggleClass('off') //NO I18N
		thisOn ? thisId.prop('checked', false) : thisId.prop('checked', true); //NO I18N
		zipssp.updatePrediction(actionname, thisOn, thisSpan);
	},
	updatePrediction: function (actionname, actionstatus, thisSpan) {
		var module = "request"; //No I18N
		if (actionname == "approvalprediction") {
			module = "general"; //No I18N
		}
		var data = {};
		data.command = "updatePrediction"; //NO I18N
		data.module = module;
		data.actionname = actionname;
		sdpAjax({
			url: "/servlet/AIAjaxServlet", //NO I18N
			data: data,
			type: 'POST', //No I18N
			success: function (response) {
				if (response != null) {
					jQuery("#zialoadingfreeze").addClass('hide');
					if (response.status == "success") {

						showalert('success', response.message, 'isAutoHide=true,delay=3'); //NO I18N
					} else if (response.status == "warning") {   //NO I18N
						showalert('warning', response.message, 'isAutoHide=false,closeOnEscKey=yes'); //NO I18N
					} else {
						showalert('failure', response.message, 'isAutoHide=false,delay=3'); //NO I18N
						thisSpan.toggleClass('on').toggleClass('off'); //NO I18N
						return false;
					}
					if (actionstatus) {
						//Hide global zia icon only when both approval action is disabled and reopen count is zero and vice versa
						if ((actionname == 'approvalprediction' && sdp_app.ZIA_REOPEN_NOTIFICATIONS_COUNT == 0) ||
							(actionname == 'reopenprediction' && sdp_app.zia_info.APPROVAL_NOTIFICATIONS_COUNT == 0)) {   //NO I18N
							sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE = false;
							sdp_app.zia_info.IS_BOT_ENABLED ? jQuery("#global_ziaripple").hide() : jQuery('.chatmain-column.zia-chat').addClass('hide');
							ziabot.zia_trigger_close_icon();
						} else {
							ziac.updateUnverifiedCount();
						}
					} else {
						if (sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && actionname == 'approvalprediction') {
							jQuery("#zia_content_approval").closest("li").addClass('hide');   //NO I18N
						}
						if (sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED && actionname == 'reopenprediction') {
							sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED = false;
							jQuery("#zia_content_reopen").closest("li").addClass('hide');   //NO I18N
						}
						if (!(sdp_app.zia_info.IS_APPROVAL_NOT_YET_ENABLED && sdp_app.zia_info.IS_REOPEN_NOT_YET_ENABLED) && sdp_app.zia_info.CAN_SHOW_UNVERIFIED_NOTIFICATION) {
							jQuery('.chatmain-column.zia-chat').removeClass('hide');
							ziac.updateUnverifiedCount();
						}
					}
					//Need to check
					if (sdp_app.IS_CHAT_ENABLED) {
						chtload.chatpickalignmentfn();
					}
				}
			}
		});
	},
	zverfycancel: function () {
		jQuery('[data-id=predictionbtn]').removeClass('hide');
		jQuery('[data-id=zverfyPrediction]').addClass('hide');
		jQuery(".zia-pred").css("opacity", "0"); //NO I18N
	},
	zverfyPrediction: function () {
		jQuery('[data-id=predictionbtn]').addClass('hide');
		jQuery('[data-id=zverfyPrediction]').removeClass('hide');
		jQuery('#ziaverify').trigger('focus').val('');
	},
	ziakeyverify: function (e) {
		if (e.which == 13) {
			zipssp.ziaverify();
		}
	},
	ziaverify: function () {
		var action = jQuery("#predictionaction").val();
		jQuery(".zia-pred").css("opacity", "0"); //NO I18N
		if (jQuery('#ziaverify').val() == '') {
			showBubbleTip(jQuery('#ziaverify'), 'Please enter text', 'focusOutHide=true,isAutoHide=false,closebutton=false'); //NO I18N
			jQuery('#ziaverify').trigger('focus');
		} else {
			jQuery('#validate-alert-msg').remove();
			var testZiaButton = jQuery('[data-id=zverfyPrediction] [name=ziaverifytestbtn]');
			var msg = jQuery(testZiaButton).button("loading");
			var newUrl = '/servlet/AIAjaxServlet?'; //NO I18N
			var testdata = jQuery("#ziaverify").val();
			var params = 'command=getQueryResult&testdata=' + encodeURIComponent(testdata) + '&action=' + action; //NO I18N

			sdpAjax({
				url: newUrl + params,
				type: 'GET', // No I18N
				success: function (response) {
					if (response.status == "success") {
						jQuery("#ziapredictionstatus").text(response.action);
						if (response.action == translate('zia.prediction.unknown')) {
							jQuery("#ziapredictionstatus").addClass("text-danger");
						} else {
							jQuery("#ziapredictionstatus").removeClass("text-danger");
						}
						jQuery(".zia-pred").css("opacity", "1"); //NO I18N
						msg.button('reset');
					} else {
						showalert('failure', response.message, 'isAutoHide=false,delay=3'); //NO I18N
						msg.button('reset');
					}
				}
			});
		}
	}
};