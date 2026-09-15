/**
 * Related code of zia bot.
 */
var ziabot = {
	/**
	 * For checking the bot initialize.
	 */
	is_zia_bot_init: false,
	is_bot_command_init: false,
	approval_comment_mandatory: true,
	mandate_comments_for_approval_action: 'all',//No I18N
	/**
	 * Initializing the zia bot function.
	 */
	init_zia_bot: function () {
		/**
		 * This object is used to zia component file.
		 */
		window.zia = {};
		var dependency_files = ["/zia/addons/@zia/ziaSkillsSdk/assets/js/zia-skills-sdk.js"]; //No I18N
		ResourceLoader({
			js: dependency_files,
			success: function () {
				// For switching portals in Embed Zia, need to load ziabot's skeleton first
				// Since Zia Skills loading takes time, added function called successFn and called it with a delay.
				if (typeof (is_initial_load) != 'undefined' && !is_initial_load) {
					setTimeout(function () {
						successFn()
					}, 500);
				} else {
					successFn()
				}
			}
		})
		var successFn = function () {
			ziabot.zia_override_funtion();
			var zia_location = window.location;
			// SD-130642 - requireJs anonymous module definition issue fix
			ziabot.define = window.define;
			window.define = undefined;
			ziaskills.init({
				/**
				 * Not need for "/" before api. Because it is already included from the lyte.
				 */
				"api_namespace": "api/v3/zia_skills", // No I18N
				"zia_url": zia_location.protocol + "//" + zia_location.host, // No I18N
				"static_urls": "/zia/", // No I18N
				"cancel_requests": {	//NO I18N
					"sdkcontract": true	//NO I18N
				}
			});
			/**
			 * Hidden the tabs to avoid css breakage.
			 */
			jQuery("#zia_tabs").find("li:not(:first-child)").css("display", "none"); //NO I18N
			/**
			 * Zia call back functions.
			 */
			ziabot.zia_callback_functions();
			/**
			 * Login user name is shown in the top of the bot while initializing the first time.
			 */
			jQuery("#zia_login_tech").text(translate("sdp.admin.zreports.notification.content.hi.message") + " " + sdp_user.USERNAME);
		}
	},

	zia_callback_functions: function () {
		/**
		 * "didConnect" function will be called after initializing the BOT.
		 */
		zia.didConnect = function () {
		    // SD-130642 - requireJs anonymous module definition issue fix
			window.define = ziabot.define;
			/**
			 * Adding the class for showing the bot.
			 */
			ziabot.zia_bot_invoke_class();
			/**
			 * Appending footer for showing tech and stop icon.
			 */
			ziabot.zia_append_footer();
			/**
			 * For hiding the loader icon.
			 */
			jQuery("#ziachatbotdiv").find("#network_loadingIcon").css("display", "none"); // No I18N
			var zia_get_bot_body = jQuery("#ziachatbotdiv").find(".home-page-body-pseudo");
			/**
			 * To avoid the bot icon alignment issue.
			 */
			if (!is_external_chat && (sdp_user.USERTYPE == "Requester" || (sdp_user.USERTYPE == "Technician" && !sdp_app.IS_CHAT_ENABLED))) {
				jQuery("#ziachatbotdiv").css("bottom", "-1px"); // No I18N
			}
			/**
			 * Triggering the event while clicking on the stop icon.
			 */
			jQuery("#input_cancelled_wrapper .stoppable_btn , #zia_stop").off("click").on("click", function () {    //NO I18N
				ziabot.zia_comment_action();
				ziabot.zia_hide_conversation_button();
				ziabot.zia_remove_technician();
			})
			var footer_div = jQuery("#ziabot_footer");
			footer_div.find("#zia_stop").off("click.zia_stop").on("click.zia_stop", function () {    //NO I18N
                ziabot.zia_stop_chat();
			})
			footer_div.find("#zia-technician-assistance").off("click.zia_transfer").on("click.zia_transfer", function () {    //NO I18N
    			ziabot.zia_transfer_chat();
            })
			/**
			 * To set the default placeholder as 'Message Zia...'
			 * To hide the active buttons/elements when a message is sent by typing
			 */
			jQuery("#ziaComp_message_box")
				.attr('placeholder', translate('zia.bot.placeholder'))
				.off('keydown').on('keydown', function (event) {    //NO I18N
					if (event.key === 'Enter' && this.value && this.value.trim() != "") {
						ziabot.zia_comment_action();
						ziabot.zia_hide_conversation_button();
						ziabot.zia_remove_technician();
					}
					/**
					 * To hide the active buttons/elements while selecting a bot command
					 */
					if (!ziabot.is_bot_command_init) {
						var bot_command_element = jQuery('ul.invocationSentencesList');
						if (bot_command_element.is(":visible")) {
							ziabot.is_bot_command_init = true;
							bot_command_element.off("click").on("click", function () {  //NO I18N
								ziabot.zia_comment_action();
								ziabot.zia_hide_conversation_button();
								ziabot.zia_remove_technician();
							});
						}
					}
				});
			/**
			 * Adding the tooltip in the "start a new conversation" link.
			 */
			if (!is_external_chat) {
				var zia_get_start_link = jQuery("#input_cancelled_wrapper").find(".stoppable_btn");
				zia_get_start_link.attr({ "title": e_attr(zia_get_start_link.text()), "rel": "uitip" , "mode_ellipsis": true});
			}
            initTooltip('#zia_bot_container'); //NO I18N
			jQuery("#zia_tabs").find("li:not(:first-child)").css("display", ""); //NO I18N
		}
		/**
		 * We can customize the date using the below function.
		 * @param {string} zia_function_name
		 * @param {Array} zia_data
		 * @param {object} zia_element
		 * @param {function} zia_response_handled
		 * @param {boolean} zia_from_history
		 * @returns
		 */
		zia.handleResponse = function (zia_function_name, zia_data, zia_element, zia_response_handled, zia_from_history) {
			/**
			 * For override the chat.
			 */
			var zia_get_construct_html = ziabot.zia_override_chat({ "zia_function_name": zia_function_name, "zia_data": zia_data, "zia_element": zia_element, "zia_response_handled": zia_response_handled, "zia_from_history": zia_from_history }); // No I18N
			if (zia_get_construct_html != "") {
				zia_get_construct_html += "</div>";
				zia_element.innerHTML = zia_get_construct_html;
			}
            initTooltip('#zia_bot_container'); //NO I18N
            $sdEventListener('#zia_bot_container');     // No I18N
			return false;
		}
		/**
		 * Function will be called while minimize the chat.
		 */
		zia.minimizeChat = function () {
            // When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
			if (is_external_chat && !(sdp_app.IS_SDP_EXT_CHAT_ENABLED && sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE)) {
				minimizeExternalIframe('zia');//NO I18N
			}
			ziabot.zia_trigger_close_icon();
		}
	},
	/**
	 * checking whether zia bot is enabled for minimize the container.
	 */
	zia_minimize_validation: function () {
		(typeof zia != "undefined") ? zia.minimizeChat() : ziabot.zia_trigger_close_icon(); // No I18N
	},
	/**
	 * We can customize the chat using the below function.
	 * @param {object} options
	 * @returns
	 */
	zia_override_chat: function (options) {
		var zia_construct_html = "";
		var zia_get_data_msg = options.zia_data.messages;
		zia_construct_html += '<div class="disp-c zia-view-clr p10">';
		var is_platformai_input = false;
		var is_char_limit_placeholder = false;

		for (var i = 0; i < zia_get_data_msg.length; i++) {
			/**
			 * Getting the message details.
			 */
			var zia_get_msg_details = zia_get_data_msg[i].message_details;
			zia_get_msg_details.PORTAL_ID = sdp_app.PORTAL_ID;
			/**
			 * Getting the message type.
			 */
			var zia_get_msg_type = zia_get_data_msg[i].message_type;
			/**
			 * Getting the message title.
			 */
			var zia_get_msg_title = zia_get_msg_details.title;
			/**
			 * Getting the message text.
			 */
			var zia_get_msg_text = zia_get_msg_details.text;
			/**
			 * Getting the filter name.
			 */
			var zia_get_filter_name = ziabot.zia_get_filter_name({ "zia_msg_details": zia_get_msg_details }); // No I18N
			zia_get_msg_details.is_platformai_input ? is_platformai_input = true : '';
			zia_get_msg_details.char_limit_placeholder ? is_char_limit_placeholder = true : '';

			/**
			 * If the message type is "button" or "text".
			 */
			if (zia_get_msg_type == "button" || zia_get_msg_type == "text") {
				var zia_link_required = zia_get_msg_details.link_required;
				var zia_link_details = zia_get_msg_details.link_details;

				if (zia_get_msg_title || zia_get_msg_text) {
					var wf_msq_result = zia_get_msg_title || zia_get_msg_text;
					zia_construct_html += '<p class="ml10">' + e_html(wf_msq_result) + '</p>'; //Encoding not required only static (non-user) text is given from the server
				}
				/**
				 * If a link is required.
				 */
				if (zia_link_required) {
					var zia_get_location = window.location;
					var zia_construct_url = zia_get_location.protocol + "//" + zia_get_location.host + "/";
					var zia_construct_link_text = translate("zia.bot.view.link");
					/**
					 * Getting the module name of link details.
					 */
					var zia_get_ld_module = zia_link_details.module;
					/**
					 * Getting the id of link details.
					 */
					var zia_get_link_id = zia_link_details.id;
					/**
					 * For constructing the link.
					 */
					if (zia_get_ld_module == "request") {
						zia_construct_url += 'WorkOrder.do?woMode=viewWO&woID=' + zia_get_link_id; // No I18N
					} else if (zia_get_ld_module == "task") { // No I18N
						zia_construct_url += 'ui/tasks?mode=detail&from=showAllTasks&taskId=' + zia_get_link_id; // No I18N
					} else if (zia_get_ld_module == "create_request") { // No I18N
						zia_construct_url += 'WorkOrder.do?woMode=newWO'; // No I18N
						zia_construct_link_text = translate("sdp.common.clickhere");
					}
					var zia_construct_link = '<a class="text-link" href=' + zia_construct_url + ' target="_blank">' + zia_construct_link_text + '</a>'; // No I18N

					if (zia_get_ld_module == 'solution') {
						zia_construct_link = '';
						// Solution module details will be loaded in the same tab in slider
						// For Solution module alone, zia_get_link_id will always be an array of solution ids
                        for (var k = 0; k < zia_get_link_id.length; k++) {
                            var solution_id = zia_get_link_id[k].id;
								var solution_title = zia_get_link_id[k].title;
								var trimmed_solution_title = solution_title.length > 30 ? solution_title.substring(0, 30) + "..." : solution_title;
                            if (is_external_chat) {
                                zia_construct_link += `<li><a class="text-link" href="/ui/solutions?entity_id=${solution_id}&mode=detail" target="_blank">${e_html(trimmed_solution_title)}</a></li>`;
                            } else {
                                zia_construct_link += `<li><a class="text-link" nonce='${sdpNonce}' data-event="click" data-handler='ziabot.loadSolutionDetail(${solution_id});' rel='uitip' title='${e_attr(solution_title)}'>${e_html(trimmed_solution_title)}</a></li>`;
                            }
                        }
						zia_construct_html += '<p class="ml10"><strong>' + translate('zia.bot.reference.solutions') + '</strong><ul>' + zia_construct_link + '</ul></p>';
					} else {
					    zia_construct_html += '<p class="ml10">' + zia_construct_link + '</p>';
				    }
				}
				/**
				 * For constructing the options.
				 */
				if (zia_get_msg_details.options) {
					for (var j = 0; j < zia_get_msg_details.options.length; j++) {
						zia_construct_html += ziabot.zia_construct_options({ "zia_option_id": zia_get_msg_details.options[j].id, "zia_option_text": zia_get_msg_details.options[j].text, "zia_is_platformai_button": zia_get_msg_details.options[j].is_platformai_button });
					}
				}
			}
			/**
			 * If the message type is user feedback.
			 */
			else if (zia_get_msg_type == "user_feedback") {
				zia_construct_html += '<p class="ml10">' + e_html(zia_get_msg_title) + '</p>';
				/**
				 * Getting the user feed back HTML.
				 */
                 var zia_user_feedback_template = renderhbs(null, "zia_user_feedback", zia_get_msg_details, false, 'zia/zia-bot', false, false, false, true);
                 zia_construct_html += zia_user_feedback_template;

			}
			/**
			 * If the message type is "exit bot" and "transferred to tech".
			 */
			else if (zia_get_msg_type == "exit_bot" || zia_get_msg_type == "transferred_to_tech") {
				zia_construct_html += '<p class="ml10">' + e_html(zia_get_msg_text) + '</p>';
				if (!options.zia_from_history) {
					if (zia_get_msg_type == "transferred_to_tech") {
                        // When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
						if (!is_external_chat) {
    						sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE = true;
							jQuery('.zia-chat').addClass('hide');
							chtload.chatpickalignmentfn();
							zia.minimizeChat();
						} else if(sdp_app.IS_SDP_EXT_CHAT_ENABLED) {
                            sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE = true;
                            chtload.chatpickalignmentfn();
                            zia.minimizeChat();
                            // Need to add 'external-zia' when zia is present and remove for livechat - transfer_to_tech
                            jQuery('#sdp-chat-bar').removeClass('external-zia');   //NO I18N
						}
					} else {
						setTimeout(function () {
							zia.minimizeChat();
						}, 1000);
					}
					ziabot.zia_comment_action();
				}
			}
			/**
			 * If the message type is "show count".
			 */
			else if (zia_get_msg_type == "show_count") {
				var zia_get_temp_info = ziabot.zia_customize_list_info(zia_get_msg_details.list_info);
				/** The listview_properties holds the module property to render the listview using the generic table component written */
				var listview_properties = zia_get_msg_details.listview_properties;

				setTimeout(function () {
					jQuery('a#zia_bot_show_count').on('click',  function (event) {
					    event.preventDefault();
						ziabot.renderListViewDialog(zia_get_temp_info, listview_properties);
					});
				}, 10);

				if (zia_get_msg_details.list_info && zia_get_msg_details.list_info.total_count == 0) {
					zia_construct_html += '<p class="ml10">' + e_html(zia_get_msg_text) + '</p>';
				} else {
					zia_construct_html += '<a href="/" class="txt-dec-none-i text-link ml10" id="zia_bot_show_count" >' + e_html(zia_get_msg_text) + '</a>';
				}
			}
			/**
			 * If the message type is "list".
			 */
			else if (zia_get_msg_type == "list") {
				/**
				 * Getting the column list
				 */
				var listview_properties = zia_get_msg_details.listview_properties;
				var zia_get_list_info = zia_get_msg_details.list_info;
				var zia_get_temp_info = ziabot.zia_customize_list_info(zia_get_list_info);
				var zia_get_module = zia_get_msg_details.module;

				var zia_get_column_list = ziabot.zia_get_column_list({ "zia_display_columns": zia_get_msg_details.display_columns, "zia_data": zia_get_msg_details.data, "zia_module": zia_get_msg_details.module, "listview_properties": listview_properties, "details_page": listview_properties.details_page }); // No I18N

				var zia_get_title_key = zia_get_module;
				var zia_get_total_count = zia_get_msg_details.list_info.total_count;
				zia_get_msg_details.list_view_datas = zia_get_column_list;

				if (!zia_get_total_count) {
					if (!zia_get_msg_details.list_info.has_more_rows) {
						zia_get_total_count = zia_get_msg_details.list_info.row_count;
					} else {
						zia_get_msg_details.display_total_count_str = '+';
					}
				}
				zia_get_title_key = listview_properties.display_name;

				if (zia_get_total_count > "3") {
					zia_get_msg_details.display_total_count_str = '+' + (zia_get_total_count - 3);
				}
				setTimeout(function () {
					jQuery(options.zia_element).find("[data-id=zia_view_list]").click(function () {
						/** The listview_properties holds the module property to render the listview using the generic table component written */
						ziabot.renderListViewDialog(zia_get_temp_info, listview_properties);
					});
				}, 10);

				zia_get_msg_details.title = translate(zia_get_title_key);

				var display_columns = zia_get_msg_details.display_columns;
				display_columns.forEach(function (field) {
					if (field != 'id' && field != 'is_icon' && field != 'subject' && field != 'title') {
						zia_get_msg_details.other_field = field;
					}
				});

				/**
				 * Getting the list view HTML
				 */
				zia_get_msg_details.is_external_chat = is_external_chat;
                var zia_bot_list_template = renderhbs(null, "zia_bot_list", zia_get_msg_details, false, 'zia/zia-bot', false, false, false, true);
                zia_construct_html += zia_bot_list_template;
			}
			/**
			 * If the message type is "radio".
			 */
			else if (zia_get_msg_type == "radio") {
				if (zia_get_msg_details.module == "technician") {
					/**
					   * Getting the technician HTML
					 */
					if (!options.zia_from_history) {
                        var templData = {"title" : e_attr(wf_msq_result)};
                        var zia_bot_technician_template = renderhbs(null, "zia_bot_technician", templData, false, 'zia/zia-bot', false, false, false, true);
                        zia_construct_html += zia_bot_technician_template;
						setTimeout(function () {
							var zia_tech_input = jQuery("#zia_tech_input"); //NO I18N
							ziabot.zia_construct_technician({ "zia_get_tech_input": zia_tech_input, "zia_tech_entity_id": zia_get_msg_details.entity_id }); // No I18N
							ziabot.zia_set_overflow({ "zia_overflow_value": "hidden" }); //NO I18N
							/**
							 * Disabling the message box while showing the tech list.
							 */
							jQuery("#ziaComp_message_box").prop('disabled', true); //NO I18N
							setTimeout(function () {
								/**
								 * Triggering the tech events.
								 */
								ziabot.zia_technician_events({ "zia_options": options, "zia_get_tech_input": zia_tech_input, "zia_tech_entity_id": zia_get_msg_details.entity_id, "zia_get_msg_result": wf_msq_result }); // No I18N
							}, 15);
						}, 10);
					}
				}
			}
			/**
			 * If the message type is "take action".
			 */
			else if (zia_get_msg_type == "take_action") {
                var zia_take_action_template = renderhbs(null, "zia_take_action", {}, false, 'zia/zia-bot', false, false, false, true);      // No I18N
				zia_construct_html += zia_take_action_template;
				ziabot.approval_comment_mandatory = zia_get_msg_details.comment_mandatory;
				if (zia_get_msg_details.module == "request") {
					ziabot.mandate_comments_for_approval_action = zia_get_msg_details.mandate_comments_for_approval_action;
				}
			}
			/**
			 * If the message type is "feedback comment".
			 */
			else if (zia_get_msg_type == "feedback_comment") {
                var zia_feedback_comment_template = renderhbs(null, "zia_bot_feedback_comment", {}, false, 'zia/zia-bot', false, false, false, true);      // No I18N
				zia_construct_html += zia_feedback_comment_template;
			}
			/**
			 * if the message type is to show the Request preview-form
			 */
			else if (zia_get_msg_type == "open_request_slider") { // NO I18N
				ziabot.create_request_preview(zia_get_msg_details.template_id, zia_get_msg_details.subject, zia_get_msg_details.mode_id, zia_get_msg_details.predicted_by);
				zia_construct_html += '<p class="ml10">' + e_html(zia_get_msg_text) + '</p>';
			}
		}
		ziabot.modify_start_link_as_gpt(is_platformai_input, is_char_limit_placeholder);
		return zia_construct_html;
	},
	/**
	 * For overriding the start a new conversation button.
	 */
	start_new_convo: {
		is_modified: false
	},
	is_char_limit_placeholder_modified: false,
	/**
	 * For changing the start link to 'Exit chat GPT' and change it back to original state
	 * if: If the input is GPT and start link is not yet modified, then change the start link to 'Exit chatGPT' and placeholder to "Message ChatGPT".
	 * Also whole bot container will be observed for the bot reply message container to append the powered by chatgpt message.
	 *
	 * else-if: If the input is not GPT and start link is modified, then change the start link to 'Start a new conversation', placeholder to "Message Zia" and disconnect the observer.
	 *
	 * @param {boolean} is_platformai_input
	 */
	modify_start_link_as_gpt: function (is_platformai_input, is_char_limit_placeholder) {

		var zia_get_start_link = jQuery("#input_cancelled_wrapper").find(".stoppable_btn");
		const is_start_link_modified = ziabot.start_new_convo.is_modified;
		if (is_platformai_input && !is_start_link_modified) {

			ziabot.start_new_convo = {
				is_modified: true,
				"text": zia_get_start_link.text(),   //NO I18N
				"click": zia_get_start_link.attr('click')   //NO I18N
			};

			const extiGPTText = translate('zia.bot.exit.gpt');
			zia_get_start_link.text(extiGPTText)
				.attr('title', extiGPTText)
				.removeAttr('click')
				.on('click.platformai', function () {
					ziaskills.sendMessage(extiGPTText, "exit_gpt"); //NO I18N
				});

			jQuery('#ziaComp_message_box').attr('placeholder', translate('chat.gpt.placeholder'));

			const targetDiv = document.querySelector('#ziachatbotdiv'); //NO I18N
			const observer = new MutationObserver((mutationsList, observer) => {
				for (let mutation of mutationsList) {
					// Check if new nodes were added
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						mutation.addedNodes.forEach(node => {
							if (node.nodeType === Node.ELEMENT_NODE) { // Check if the node is an element
								let botRepliedContainer = jQuery(node).find('div.botSentContainer div.zia_paragraph');
								if (botRepliedContainer.length) {	//Check if the message node is bot replied
									//Append the powered by chatgpt text and icon after the timestamp in the botReply message node
									let text = translate('zia.gpt.history');
									jQuery(node).find('div.dateTimeDiv').after(`<span class='text-muted pos-abs right0 font-xsmall bottom-23'><svg width='13' height='13' class='vmiddle grn-gpt ml3 mr3'>
												<use href='#chatgpt-xxl'></use></svg><span class="disp-ib text-overflow maxw-110px vmiddle" rel="uitip" title="${text}" mode_ellipsis="true">${text}</span></span>`);
									initTooltip('.botSentContainer');   //NO I18N

									//Set the minimum width of the botReply message node as 170px to avoid the text overflow of timestamp and powered by chatgpt
									jQuery(node).find('div.showZiaMessage').addClass('minw-170px');

									//Adding padding-bottom to the botReply message container to have gap between powered by chatgpt and the next message sent by the user
									jQuery(node).addClass('pb10');

								}
							}
						});
					}
				}
			});

			const config = {
				childList: true,    // Observe child node changes
				subtree: true      // Set to true if you want to monitor all descendants
			};
			observer.observe(targetDiv, config);
			ziabot.start_new_convo.observer = observer;

		} else if (!is_platformai_input && is_start_link_modified) {

			zia_get_start_link.text(ziabot.start_new_convo.text)
				.attr('title', ziabot.start_new_convo.text)
				.attr('click', ziabot.start_new_convo.click)
				.off('click.platformai');  //NO I18N

			ziabot.start_new_convo.observer.disconnect(); // Disconnect the observer to avoid multiple observers

			//Resetting the start new convo object
			ziabot.start_new_convo = {
				is_modified: false
			};

			jQuery('#ziaComp_message_box').attr('placeholder', translate('zia.bot.placeholder'));

		}

		if (is_char_limit_placeholder && !ziabot.is_char_limit_placeholder_modified) {
			jQuery('#ziaComp_message_box').attr('placeholder', translate('sdp.software.license.agreement.description'));
			ziabot.is_char_limit_placeholder_modified = true;

		} else if (!is_char_limit_placeholder && ziabot.is_char_limit_placeholder_modified) {
			jQuery('#ziaComp_message_box').attr('placeholder', translate('zia.bot.placeholder'));
			ziabot.is_char_limit_placeholder_modified = false;
		}
	},
	/**
	 * For customizing the list info
	 * @param {object} data
	 * @returns
	 */
	zia_customize_list_info: function (data) {
		var temp_info = jQuery.extend({}, data);
		temp_info.hasOwnProperty("total_count") && delete temp_info.total_count; //No I18N
		temp_info.hasOwnProperty("has_more_rows") && delete temp_info.has_more_rows; //No I18N
		temp_info.hasOwnProperty("row_count") && delete temp_info.row_count; //No I18N
		return temp_info;
	},
	/**
	 * For set the overflow value in CSS.
	 * @param {object} options
	 */
	zia_set_overflow: function (options) {
		jQuery("#ziachatbotdiv .home-page-body .home-page-body-pseudo").css("overflow-y", options.zia_overflow_value); //NO I18N
	},
	/**
	 * For constructing the technician.
	 * @param {object} options
	 */
	zia_construct_technician: function (options) {
		var zia_get_tech_input = options.zia_get_tech_input;
		ziabot.zia_get_tech({ "zia_tech_input": zia_get_tech_input, "zia_entity_id": options.zia_tech_entity_id }); //NO I18N
		zia_get_tech_input.data("select2").body = jQuery("#zia_techician_list"); //NO I18N
		zia_get_tech_input.data('select2').positionDropdown = function () { } //NO I18N
		zia_get_tech_input.select2("open"); //NO I18N
	},
	/**
	 * Defined technician events
	 * @param {object} options
	 */
	zia_technician_events: function (options) {
		var zia_get_tech_input = options.zia_get_tech_input;
		jQuery("#zia_techician_list").off('select2-selecting').on('select2-selecting', function (techObj) {
			options.zia_options.zia_element.innerHTML = '<div class="disp-c zia-view-clr p10"><p class="ml10">' + e_html(options.zia_get_msg_result) + '</p></div>';
			ziaskills.sendMessage(techObj.object.text, techObj.object.id);
			ziabot.zia_set_overflow({ "zia_overflow_value": "auto" }); // No I18N
			/**
			 * Enabling the message box while closing the tech list.
			 */
			jQuery("#ziaComp_message_box").prop('disabled', false); //NO I18N
		});
		/**
		 * while navigating the online to offline
		 */
		jQuery("#zia_techician_list").find('#zia_show_online_technician').off('click').on('click', function (e) {
			zia_get_tech_input.select2("destroy"); 	// No I18N
			ziabot.zia_construct_technician({ "zia_get_tech_input": zia_get_tech_input, "zia_tech_entity_id": options.zia_tech_entity_id }); // No I18N
		});
	},
	/**
	 * Removing the technician after complete the action.
	 */
	zia_remove_technician: function () {
		var zia_get_tech_list = jQuery("#zia_techician_list");
		if (zia_get_tech_list && zia_get_tech_list.length != 0) {
			zia_get_tech_list.remove();
			ziabot.zia_set_overflow({ "zia_overflow_value": "auto" }); // No I18N
			/**
			 * Enabling the message box while closing the tech list.
			 */
			jQuery("#ziaComp_message_box").prop('disabled', false); //NO I18N
		}
	},
	/**
	 * Getting the filter name to send the list information.
	 * @param {object} options
	 * @returns
	 */
	zia_get_filter_name: function (options) {
		var zia_get_msg_details = options.zia_msg_details;
		return (zia_get_msg_details.list_info && zia_get_msg_details.list_info.filter_by) ? zia_get_msg_details.list_info.filter_by.name : "";
	},
	/**
	 * Constructing the options.
	 * @param {object} options
	 * @returns
	 */
	zia_construct_options: function (options) {
		const modifyStartLinkMethod = options.zia_is_platformai_button ? "ziabot.modify_start_link_as_gpt(true);" : ""; //NO I18N
		const gptIcon = options.zia_is_platformai_button ? "<svg width='18' height='18' class='vmiddle grn-gpt ml5 mr5'><use href='#chatgpt-xxl'></use></svg>" : "";    //NO I18N
		//EncodeURIComponent is done to avoid XSS attacks and decoding will be done in a different method so that exact value will be passed.
		return `<p class="zia-task btn" data-button="zia_button" nonce='${sdpNonce}' data-event="click" data-handler='ziabot.zia_hide_conversation_button();${modifyStartLinkMethod}ziabot.zia_send_message("${e_attr(encodeURIComponent(options.zia_option_text))}","${options.zia_option_id}")'>${e_html(options.zia_option_text)}${gptIcon}</p>`;
	},
	/**
	 * Function to decode the parameters and then pass it to ziaSkills sendMessage function
	 * @param {*} encodedParam
	 * @param {*} id
	 */
	zia_send_message: function (encodedParam, id) {
		ziaskills.sendMessage(decodeURIComponent(encodedParam), id);
	},
	/**
	 * Function is triggered while executing the "take action".
	 * @param {string} button_name
	 * @returns
	 */
	zia_take_action: function (button_name) {
		var zia_get_take_action_comment = jQuery("#ziachatbotdiv").find("#zia_take_action_comment");
		var comment = zia_get_take_action_comment.val();
		if (comment && comment.trim() != '') {
			if (comment.length > 2000) {
				//For both request and change module the max length limit is 2000 for approval comments
				var args = [];
				args[0] = translate('common.comments'); //No I18N
				args[1] = 2000;
				showalert('failure', translate('sdp.app.common.maxlength.characters', args), 'isAutoHide=false,closeOnEscKey=yes,width=450,height=80');// No I18N
				zia_get_take_action_comment.focus();
				return;
			}
			else {
				ziaskills.sendMessage(comment.trim(), button_name);
			}
		} else if (ziabot.approval_comment_mandatory && (ziabot.mandate_comments_for_approval_action == 'all' || (ziabot.mandate_comments_for_approval_action == 'reject' && button_name == 'reject'))) {//No I18N
			showalert('failure', translate("sdp.approval.empty.comment.error"), "isAutoHide=false"); //NO I18N
			zia_get_take_action_comment.focus();
			return;
		} else {
			ziaskills.sendMessage(button_name, button_name);
		}
		ziabot.zia_comment_action();
		ziabot.zia_hide_conversation_button();
	},
	/**
	 * Function is triggered while executing the "happy feedback".
	 * @param {string} button_name
	 * @returns
	 */
	zia_happy_feedback: function (option) {
		if(option == 'happy'){
			var msg = translate('zia.bot.happy.services') + '\n' + translate('zia.bot.chat.ended'); // NO I18N
			var time = Date.now();
			ziaskills.pushTranscript({
				"mode": "chat", // No I18N
				"content_type": "text", // No I18N
				"sender": "zia", // No I18N
				"time": time, // No I18N
				"message": msg, // NO I18N
				"display": true, // No I18N
				"show": true, // No I18N
				"status": "action_completion" // No I18N
			});
		}
	},
	/**
	 * Function is triggered while executing the "sad feedback comment".
	 * @param {string} button_name
	 * @returns
	 */
	zia_sad_feedback: function (button_name) {
		var zia_sad_feedback_comment = jQuery("#ziachatbotdiv").find("#zia_bot_feedback_comment");
		var msg = translate('zia.bot.chat.ended');
		var comment = zia_sad_feedback_comment.val();
		if(button_name == 'cancel'){
			ziaskills.sendMessage(translate('sdp.common.cancel'), button_name); // No I18N
		} else {
		if (comment && comment.trim() != '') {
				msg = translate('zia.bot.sad.services') + '\n' + msg; // NO I18N
			if (comment.length > 2000) {
				var args = [];
				args[0] = translate('common.comments'); //No I18N
				args[1] = 2000;
				showalert('failure', translate('sdp.app.common.maxlength.characters', args), 'isAutoHide=false,closeOnEscKey=yes,width=450,height=80');// No I18N
				zia_sad_feedback_comment.focus();
				return;
			}
			else {
				ziaskills.sendMessage(comment.trim(), button_name);
			}
		} else {
				ziaskills.sendMessage(translate('sdp.changedetails.comments.nocomments'), button_name); // No
		}
		}
		var time = Date.now();
		ziaskills.pushTranscript({
			"mode": "chat", // No I18N
			"content_type": "text", // No I18N
			"sender": "zia", // No I18N
			"time": time, // No I18N
			"message": msg, // No I18N
			"display": true, // No I18N
			"show": true, // No I18N
			"status": "action_completion" // No I18N
		});
		ziabot.zia_comment_action('#zia_bot_feedback_comment');
		ziabot.zia_hide_conversation_button();
	},
	/**
	 * For removing the unwanted actions in comment box.
	 */
	zia_comment_action: function (divName) {
		var defaultDivName = '#zia_take_action_comment'; // No I18N
		if (divName) {
			defaultDivName = divName;
		}
		var zia_get_take_action_comment = jQuery("#ziachatbotdiv").find(defaultDivName);
		if (zia_get_take_action_comment.is(":visible")) {
			zia_get_take_action_comment.prop("disabled", "disabled").val(""); //NO I18N
			zia_get_take_action_comment.attr('style', 'resize : none !important;'); //NO I18N
			zia_get_take_action_comment.removeAttr('id');
		}
	},

	/**
	 * For stop the chat.
	 */
	zia_stop_chat: function () {
		ziabot.zia_comment_action();
		ziaskills.sendMessage("stop");//NO I18N
	},
	/**
	 * To re-initiate the zia chat from start when Zia Bot workflow is being modified
	 */
	zia_reload_chat: function (mess) {
		if (ziabot.is_zia_bot_init) {
			ziabot.zia_comment_action();
			ziaskills.sendMessage(mess.message, "reload_chat");//NO I18N
		}
	},
	/**
	 * For transfer the chat.
	 */
	zia_transfer_chat: function () {
		ziabot.zia_comment_action();
		ziaskills.sendMessage("Need technician assistance");//NO I18N
	},
	/**
	 * Getting the column list for listing the list view.
	 * @param {object} options
	 * @returns
	 */
	zia_get_column_list: function (options) {
		var zia_get_display_columns = options.zia_display_columns;
		var zia_get_datas = options.zia_data;
		var zia_get_display_columns_length = zia_get_display_columns.length;
		var zia_get_data_length = zia_get_datas.length;
		var zia_new_data = [];

		//To get the data of the associated entity which is present one level below in the given array
		var row_data_field;
		if (options.listview_properties) {
			row_data_field = options.listview_properties.row_data_field;
		}

		for (var i = 0; i < zia_get_display_columns_length; i++) {
			for (var j = 0; j < zia_get_data_length; j++) {

				var zia_get_data = zia_get_datas[j];
				if (row_data_field) {
					zia_get_data = zia_get_data[row_data_field];
				}

				if (zia_get_display_columns[i] == "title" || zia_get_display_columns[i] == "subject") {
					(zia_new_data[j] && zia_new_data[j].length != 0) ? zia_new_data[j].subject = zia_get_data[zia_get_display_columns[i]] : zia_new_data.push({ "subject": zia_get_data[zia_get_display_columns[i]] });
				}
				else {
					(zia_new_data[j] && zia_new_data[j].length != 0) ? zia_new_data[j][zia_get_display_columns[i]] = zia_get_data[zia_get_display_columns[i]] : zia_new_data.push({ [zia_get_display_columns[i]]: zia_get_data[zia_get_display_columns[i]] });
				}
				(options.zia_module == "request") ? zia_new_data[j]["is_icon"] = true : ""; // No I18N
			}
		}

		/** details_page object holds the URL format for the module to be listed and the field to be used for hyperlinking the URL */
		var details_page = options.listview_properties.details_page;
		if (details_page) {
			for (var i = 0; i < zia_get_data_length; i++) {
				zia_new_data[i].url = details_page.url.replace('{id}', zia_new_data[i].id);
			}
		}
		return zia_new_data;
	},
	/**
	 * Getting the request filter name
	 * @param {string} key
	 * @returns
	 */
	zia_get_request_filter_name: function (key) {
		var zia_i18n_key_name = {
			"All_User": "sdp.requests.viewrequest.allmyrequests", // No I18N
			"Open_User": "sdp.requests.viewrequest.myopenrequests", // No I18N
			"All_Pending_User": "sdp.requests.viewrequest.allmypendingrequests", // No I18N
			"All_Completed_User": "sdp.requests.viewrequest.mycompletedrequests", // No I18N
			"Overdue_User": "sdp.requests.viewrequest.myoverduerequests" // No I18N
		}
		return translate(zia_i18n_key_name[key]);
	},
	/**
	 * Adding the class for showing the bot.
	 */
	zia_bot_invoke_class: function () {
		var zia_get_bot_container = jQuery("#ziachatbotdiv");
		if (zia_get_bot_container.is(':visible')) {
			zia_get_bot_container.css({ "visibility": "visible", "opacity": "1" }); // No I18N
			zia_get_bot_container.addClass("zia-chat-open").removeClass('zia-chat-close');
			zia_get_bot_container.find("#ziaComp_message_box").focus();
		}
	},
	/**
	 * Appending the footer for showing tech and stop icon.
	 */
	zia_append_footer: function () {
		var show_transfer_button = (is_external_chat && sdp_app.IS_SDP_CHAT_ENABLED && sdp_app.IS_SDP_EXT_CHAT_ENABLED && (!sdp_app.IS_CHAT_DURING_OP_HOURS_ENABLED || sdp_user.isOperational)) || (!is_external_chat && sdp_app.IS_CHAT_ENABLED && (!sdp_app.IS_CHAT_DURING_OP_HOURS_ENABLED || sdp_user.isOperational));
        var templData = {"user_type" : sdp_user.USERTYPE, "is_chat_enabled" : sdp_app.IS_CHAT_ENABLED, "show_transfer_button": show_transfer_button };
        var zia_get_footer_data = renderhbs(null, 'zia_bot_footer', templData, false, 'zia/zia-bot', false, false, false, true);
		jQuery("#ziachatbotdiv").find(".home-page-footer .zvoice-row").before(zia_get_footer_data);
	},
	/**
	 * Override the default function.
	 */
	zia_override_funtion: function () {
		var zia_iframe = document.createElement('iframe');
		document.body.appendChild(zia_iframe);
		var zia_iframe_window = zia_iframe.contentWindow;
		var zia_remove_function = zia_iframe_window.document.body.remove;
		if (zia_remove_function == undefined) {
			zia_remove_function = function () {
				if (this.parentNode !== null) {
					this.parentNode.removeChild(this);
				}
			}
		}
		(function (arr) {
			arr.forEach(function (item) {
				Object.defineProperty(item, 'remove', { //No I18N
					configurable: true,
					enumerable: true,
					writable: true,
					value: zia_remove_function
				});
			});
		}
		)([Element.prototype, DocumentType.prototype, HTMLElement.prototype]);

		window.Array.from = zia_iframe_window.Array.from;
		zia_iframe.style.visibility = "hidden";
		zia_iframe.style.position = "fixed";
	},
	/**
	 * For hiding the conversation button
	 */
	zia_hide_conversation_button: function () {
		jQuery("#ziachatbotdiv").find("[data-button=zia_button]").hide();
	},
	/**
	 * Getting the list of technicians
	 * @param {object} options
	 */
	zia_get_tech: function (options) {
		var zia_tech_url = "", zia_tech_key = "";
		(options.zia_entity_id) ? (zia_tech_url = "/api/v3/requests/" + options.zia_entity_id + "/technician", zia_tech_key = "technician") : (zia_tech_url = "/api/v3/technicians", zia_tech_key = "technicians"); // No I18N
		jQuery(options.zia_tech_input).select2({
			ajax: {
				url: zia_tech_url,
				dataType: 'json', // No I18N
				type: "GET", // No I18N
				data: function (term) {
					var zia_tech_list_info = { "list_info": { "fields_required": ["name", "id", "is_online"], "search_criteria": [{ "field": "name", "condition": "contains", "value": term, "logical_operator": "AND" }], "row_count": 10 } }; // No I18N
					var zia_get_online_technician = jQuery("#zia_show_online_technician").prop("checked"); // No I18N
					if (zia_get_online_technician) {
						zia_tech_list_info.list_info.search_criteria.push({ "field": "is_online", "condition": "is", "value": "1", "logical_operator": "AND" });
					}
					/**
					 * true - For searching backslash.
					 */
					return sdpAjaxInputData(zia_tech_list_info, true);
				},
				results: function (data) {
					return {
						results: jQuery.map(data[zia_tech_key], function (item) {
							return { text: item.name, id: item.id, is_online: item.is_online };
						})
					};
				},
			},
			formatResult: function (data, element) {
				return ziabot.zia_tech_formatResult(data, element);
			},
			formatNoMatches: function () {
				return translate('ae.select2.no.message'); //No I18N
			},
		});
	},
	/**
	 * Technician format result
	 * @param {object} state
	 * @returns
	 */
	zia_tech_formatResult: function (state) {
		var zia_tech_status = "", zia_tech_status_class = "";
		if (state.is_online === "1") {
			zia_tech_status = "sdp.techMarking.online"; //NO I18N
			zia_tech_status_class = "onlineicon btn-success"; //NO I18N
		} else if (state.is_online === "2") { //NO I18N
			zia_tech_status = "sdp.techMarking.offline"; //NO I18N
			zia_tech_status_class = "offlineicon btn-secondary"; //NO I18N
		}
		else {
			zia_tech_status = "sdp.techMarking.logout"; //NO I18N
			zia_tech_status_class = "logedicon"; //NO I18N
		}
		return '<div title="' + translate(zia_tech_status) + '" id="status" class="text-nowrap ml5"><span class="' + zia_tech_status_class + ' mr10"></span>' + e_html(state.text) + '</div>'; //NO I18N
	},
	/**
	 * Function is used to multi tab actions.
	 * @param {object} options
	 */
	zia_reinit_bot: function (options) {
		if (ziabot.is_zia_bot_init) {
			setTimeout(function () {
				var zia_get_latest_msg = jQuery(".zvoice-col-xs-12.message_" + options.chat_id);
				if (zia_get_latest_msg && zia_get_latest_msg.length == 0) {
					var zia_get_last_rpl_msg = options.last_reply_msg;
					var zia_get_last_rpl_msg_length = zia_get_last_rpl_msg.length
					if (zia_get_last_rpl_msg && zia_get_last_rpl_msg_length != 0)
						for (var i = 0; i < zia_get_last_rpl_msg_length; i++) {
							ziabot.zia_hide_conversation_button();
							ziabot.zia_remove_technician();
							ziabot.zia_hide_bottom_sheet();
							ziabot.zia_comment_action();
							ziabot.closeRequestPreview();
							ziaskills.pushTranscript(zia_get_last_rpl_msg[i]);
						}
				}
			}, 1000);
		}
	},
	/**
	 * For triggering the close icon.
	 */
	zia_trigger_close_icon: function (checkEntity) {
		if (sdp_app.zia_info.IS_NOTIFICATION_AVAILABLE && !is_external_chat) {
			jQuery("#global_ziaripple").show();
		}
		jQuery("#zia_bot_container").addClass('hide');
		// Needed to show Zia Icon during minimize action as it is hidden in external chat
		if (is_external_chat) {
			jQuery('.zia-chat>.chat-mini-header').removeClass('hide')
			// SD-122566 Need to minimize iframe only if requester chat is not open
			if(!sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE) {
    			minimizeExternalIframe('zia');//NO I18N
			}
		}
		// The below line is used to dynamically show the zia bot icon border accoriding to the state
		if (checkEntity != 'entity') {
			setTimeout(function () {
				jQuery('li#ziabotli').toggleClass('active'); //NO I18N
			}, 10);
		}
		if (sdp_app.IS_CHAT_ENABLED) {
			//show channels icon when zia is closed in requester login
			chtload.toggleChannelsMenu();

			chtload.chatpickalignmentfn();
		}
	},
	/**
	 * For hide the bottom sheet.
	 */
	zia_hide_bottom_sheet: function () {
		var zia_get_chat_visibility = jQuery("#zia_bot_container").find(".footer-wrapper").hasClass("footer_visible"); //NO I18N
		if (zia_get_chat_visibility) {
			ziaskills.hideBottomSheet();
		}
	},
	/** This object is used to hold the last subject and description given by user and use it later for setting in Request preview form */
	request_props: {},
	/**
	 * Method to construct and open the Request Preview form from Zia Bot
	 *
	 * @param {long} templateID Template ID
	 * @param {string} subject Subject of the request
	 */
	create_request_preview: function (templateID, subject, modeid, predicted_by) {
		var title = translate("sdp.requests.newrequest.addtitle");  //NO I18N
		var settings = {};
		settings.width = "1140px";
		settings.height = parseInt(jQuery(window).height()) - 65;
		settings.top = "35";
		this.request_props.zia_suggested_template = templateID;
		var url = "/WorkOrder.do?woMode=newWO&minpreview=true&externalframe=true&isFromZiaBot=true&reqTemplate=" + templateID; //NO I18N
		if(is_external_chat) {
		    url += "&is_external_chat=true"     //NO I18N
		}
			if(typeof(subject) !== 'undefined'){
				this.request_props.subject = subject;
			}
		if(typeof(modeid) !== 'undefined'){
			this.request_props.chatbot_modeid = modeid;
		}
		if(predicted_by != 'INVALID'){
		    this.request_props.predicted_by = predicted_by;
		}

		this.request_props.requester = { "id": sdp_user.LOGGEDIN_USERID, "name": sdp_user.USERNAME };    //NO I18N
        $previewComponent.load(url, title, settings.width, settings.height, null, "new_request_popup");  // No I18N
		if(is_external_chat) {
             maximizeExternalIframe('preview_component');    //NO I18N
         }
	},
	/** This boolean is used to find whether the request properties from bot is set in the request preview form once loaded.
	 * 	It will be helpful in avoiding the bot request properties getting set in the preview form again when template gets changed manually or via Zia prediction.
	 */
	isRequestFormLoaded: false,
	/**
	 * Callback function after the form got loaded in the Preview to retain the subject/description/requester fields
	 * Refer WOForm.js
	 */
	requestFormAfterLoad: function () {
	    var parentFrame = $previewComponent.iframeActiveParent()
		if (!this.isRequestFormLoaded && parentFrame.ziabot.request_props && typeof $req !== "undefined" && $req.form) {
			if(parentFrame.ziabot.request_props.subject) {
				$rf.setFieldValue('subject', parentFrame.ziabot.request_props.subject);    //NO I18N
			}
			$rf.setFieldValue('requester', parentFrame.ziabot.request_props.requester);    //NO I18N
			if(parentFrame.ziabot.request_props.chatbot_modeid) {
			$rf.setFieldValue('mode', parentFrame.ziabot.request_props.chatbot_modeid);    //NO I18N
			}
			parentFrame.ziabot.requestFormCloseOnClick();
		}
		this.isRequestFormLoaded = true;
	},
	/**
	 * Hook to send Stop message in bot when we close the Request Preview form
	 */
	requestFormCloseOnClick: function() {
		jQuery('#new_request_popup_previewclose').on('click', function(){
			ziabot.closeRequestPreview();
			ziaskills.sendMessage("stop"); // No I18N
		});
	},
	/**
	 * Callback function after successful creation of request from the preview form
	 * Refer WOForm.js
	 * @param {long} woID Request ID
	 */
	requestPostSuccess: function (woID, woTemplateID) {

	    var parentFrame = $previewComponent.iframeActiveParent()
		var isZiaSuggestedTemplateUsed = woTemplateID == parentFrame.ziabot.request_props.zia_suggested_template;
		parentFrame.ziaskills.sendMessage(translate("zia.bot.add.more.details.history"), sdpToJSON({ "id": woID, "is_request_created": true, "is_zia_suggested_template_used": isZiaSuggestedTemplateUsed }));    //NO I18N

		ziabot.closeRequestPreview();

		parentFrame.ziabot.zia_hide_conversation_button();},
	/**
	 * Closes the Request Preview form opened from Zia Bot
	 */
	closeRequestPreview: function () {
	    // SD-121212 | External Zia chat is not in sync
	    // When add more details is opened in external site and stop button is pressed from inside SDP, request view is not closed
	    var parentFrame = null;
        if(is_external_chat) {
            for(var i=0; i < window.length; i++) {
                var windowUrl = window[i].location.href;
                if(windowUrl.includes('externalframe') && windowUrl.includes('isFromZiaBot')) {
                    parentFrame = window[i].$previewComponent.iframeActiveParent();
                    break;
                }
            }
            if(parentFrame == null) {
                return;
            }
        } else {
            parentFrame = (typeof(externalframe) !== 'undefined' && externalframe) ? $previewComponent.iframeActiveParent() : top;      // No I18N
        }

		parentFrame.$previewComponent.closePreview('new_request_popup');    //NO I18N
		if(is_external_chat) {
            maximizeExternalIframe('zia');  //NO I18N
		}
	},
	/**
	 * Function to enable/disable the entity (zia-bot-action/zia-bot-button)
	 * @param {integer} id - entity ID
	 * @param {string} entity - entity to be updated
	 */
	updateActionButton: function (id, entity) {
		var toggleElement = jQuery('#' + entity + '-toggle-' + id);
		var isenabled = toggleElement.prop('checked');  //NO I18N

		var entityURL = "/api/v3/zia_bot_buttons/" + id + "/_modify"; // No I18N
		var inputData = { "zia_bot_button": { "is_enabled": isenabled } };	// No I18N
		if (entity == 'action') {
			entityURL = "/api/v3/zia_bot_actions/" + id + "/_modify"; // No I18N
			inputData = { "zia_bot_action": { "is_enabled": isenabled } };	// No I18N
		}

		sdpAjax({
			url: entityURL,
			type: 'PUT', // No I18N
			async: false,
			data: sdpAjaxInputData(inputData),
			success: function (response) {
				showalert('success', response.response_status.messages[0].message, 'isAutoHide=true,closeOnEscKey=yes,width=auto,height=80'); // No I18N
				document.getElementById(entity + '-toggle-label-' + id).setAttribute('title', isenabled ? translate('common.enabled') : translate('common.disabled'));
			},
			error: function (response) {
				showalert('failure', response.responseJSON.response_status.messages[0].message, "isAutoHide=false");// No I18N
				toggleElement.prop('checked', !isenabled);  //NO I18N
			}
		});
	},
	/**
	 * Function to render the listview using the table component in a generic way for all modules
	 *
	 * @param {object} list_info - list_info object used as input_data for hitting the GET_ALL API call
	 * @param {object} listview_properties - module properties to render the list view
	 */
	renderListViewDialog: function (list_info, listview_properties) {
		var entity_name = listview_properties.entity_name;
		var custom_function_id = listview_properties.custom_function_id;
		var display_name = listview_properties.display_name;
		var callback_url = listview_properties.callback_url;
		var list_view_columns = listview_properties.list_view_columns;
		var user_personalize_key = listview_properties.user_personalize_key;
		var discarded_fields = listview_properties.discarded_fields;
		var is_row_data_process = false;
		var is_search_enabled = true;
		var is_column_chooser_enabled = true;
		var is_sorting_enabled = true;
		var is_metainfo_enabled = true;
		var is_meta_info_entity = false;
		var meta_info_entity = callback_url;

		if (listview_properties.row_data_field) {
			is_row_data_process = true;
			ziabot.row_data_field = listview_properties.row_data_field;
		}

		if (listview_properties.search_disabled) {
			is_search_enabled = false
		}

		if (listview_properties.column_chooser_disabled) {
			is_column_chooser_enabled = false;
		}

		if (listview_properties.sorting_disabled) {
			is_sorting_enabled = false;
		}

		if (listview_properties.metainfo_disabled) {
			is_metainfo_enabled = false;
		}

		if (listview_properties.is_meta_info_entity) {
			is_meta_info_entity = true;
			if (listview_properties.meta_info_entity) {
				meta_info_entity = listview_properties.meta_info_entity;
			}
		}

		if (listview_properties.details_page) {
			ziabot.details_page = listview_properties.details_page;
		}

		ziabot.personalize_key = null;
		if (user_personalize_key) {
			ziabot.personalize_key = user_personalize_key;
		}


		var fields_required = listview_properties.fields_required ? listview_properties.fields_required : list_view_columns;
		var stringified_field = sdpToJSON(fields_required);
		ziabot.fields_required = JSON.parse(stringified_field);


		//List View table height will be 70% of the screen height
		var table_height = (jQuery(window).height() / 100) * 70.0;

		var templData = { "entity_name": entity_name, "custom_function_id": custom_function_id, "callback_url": callback_url, "list_view_columns": list_view_columns, "is_row_data_process": is_row_data_process, "details_page": listview_properties.details_page, "table_height": table_height, "user_personalize_key": user_personalize_key, "is_search_enabled": is_search_enabled, "is_column_chooser_enabled": is_column_chooser_enabled, "is_sorting_enabled": is_sorting_enabled, "is_metainfo_enabled": is_metainfo_enabled, "list_view_fields_display_name": listview_properties.list_view_fields_display_name, "is_meta_info_entity": is_meta_info_entity, "meta_info_entity": meta_info_entity, "discarded_fields": discarded_fields }; //NO I18N
        renderhbs('body', 'zia_bot_listview_container', templData, true, 'zia/zia-bot');

		ziabot.list_info = list_info;

		if (is_external_chat) {
			maximizeExternalIframe('dialog')    // No I18N
            // Since we need to change the iframe size before rendering, adding a small delay
			setTimeout(function () {
				ziabot.renderFn(entity_name, display_name)
			}, 10);
		} else {
			ziabot.renderFn2(entity_name, display_name)
		}
	},
	/**
	 * To render Zia Bot List View
	 * @param {jQueryObject} entity_name - Request / Solution etc
	 * @param {jQueryObject} display_name - Display name of the entity
	 */
	list_view_entity: '',
	list_view_title: '',
	// For Embed Zia
	renderFn: function (entity_name, display_name) {
		ziabot.list_view_entity = entity_name;
		var width = parseInt(jQuery(window).width() - 70, 10);
		var webComponentId = "webc-" + entity_name; //NO I18N
		ziabot.list_view_title = translate('pagescripts.request.listview', [display_name]), //NO I18N;
		ziabot.webComponentId = webComponentId;
		jQuery('#bot-listview-container').dialog({
			resizable: false,
			width: width,
			title: ziabot.list_view_title,
			modal: true,
			position: { my: "center top", at: "center top+85", of: window }, //No I18N
			open: function () {
				WebComponents.render(webComponentId);
			},
			close: function () {
				if (is_external_chat) {
					maximizeExternalIframe('zia')       // No I18N
				}
				delete WebComponents.instancePool[webComponentId];
				jQuery('#bot-listview-container').remove();
			}
		});
	},
	// For SDP Zia
	renderFn2: function (entity_name, display_name) {

		ziabot.list_view_entity = entity_name;
		var width = parseInt(jQuery(window).width() - 250, 10);
		var listViewContainer = jQuery('#bot-listview-container');
		jQuery("body").append("<div id='zia-bot-lv-popup-wrapper'></div>"); //No I18N
		jQuery("#zia-bot-lv-popup-wrapper").append(listViewContainer); //No I18N

		var webComponentId = "webc-" + entity_name; //NO I18N
		WebComponents.render(webComponentId);
		ziabot.webComponentId = webComponentId;
		ziabot.list_view_title = translate('pagescripts.request.listview', [display_name]);
		var options = {
            title: ziabot.list_view_title,
            minimizable: false,
            maximizable: false,
            type: "modal", //No I18N
            width: width,
            closeOnEscKey: true,
            closeOnOverlayClick: true,
            resizeWindow: true,
            open: function () {
                jQuery('.page-progressbar,#freeze-details').hide(); // Stoping progress bar after opening the dialog //No I18N
            },
            beforeclose: function () {
                jQuery("#zia-bot-lv-popup-wrapper").remove(); //No I18N
                delete WebComponents.instancePool[webComponentId];
                jQuery('#bot-listview-container').remove();
            },
            height: jQuery(window).height(),
            position: {
                right: "0px", //No I18N
                top: "0px" //No I18N
            },
            draggable: false,
            animation: {
                open: {
                    className: 'zeffects--slideright', //No I18N
                    duration: 300
                }
            }
        };
        if (sdp_user.DIRECTION == "RTL") { //No I18N
            options.position = {
                left: "0px", //No I18N
                top: "0px" //No I18N
            };
            options.animation = {
                open: {
                    className: 'zeffects--slideleft', //No I18N
                    duration: 300
                }
            }
        }
        jQuery("#zia-bot-lv-popup-wrapper").sdp_zcomponent_dialog(options); //No I18N
	},

	/**
	 * Callback function to manipulate the data inside the Input Data of the API call
	 *
	 * @param {object} table_info - It holds the list_info and fields_required of the API call
	 * @returns
	 */
	row_inputdata: function (table_info) {

		var row_inputdata = { "list_info": table_info.list_info };  //NO I18N

		var fields_required = ziabot.fields_required;
		if (fields_required && table_info.fields_required) {
			jQuery.each(table_info.fields_required, function (field) {
				if (!fields_required.includes(field)) {
					fields_required.push(field);
				}
			});
		}

		if (fields_required) {
			row_inputdata.fields_required = fields_required;
		}

		return row_inputdata;
	},
	/**
	 * Function will return data in second level object.
	 * It will be required when rendering the list view of the sub-entities
	 *
	 * @param {object} row_data - It has the data required to render each cells in a row of a list view table
	 * @returns second level object is returned as row_data
	 */
	process_rowdata: function (row_data) {
		return row_data[ziabot.row_data_field];
	},
	/**
	 * Function for setting the custom list_info in tableInfo object to hit the GET_ALL API call for listview accordingly
	 * @returns table_info object
	 */
	tableInfo: function () {
		var tableInfo = {};
		tableInfo.list_info = ziabot.list_info;

		if (ziabot.personalize_key) {
			var table_info = getPersonalizeData(ziabot.personalize_key);
			if (!jQuery.isEmptyObject(table_info)) {
				if (ziabot.list_info.search_fields) {
					table_info.list_info.search_fields = ziabot.list_info.search_fields;
				} else if (ziabot.list_info.search_criteria) {
					table_info.list_info.search_criteria = ziabot.list_info.search_criteria;
				} else if (ziabot.list_info.gsearch) {
					table_info.list_info.gsearch = ziabot.list_info.gsearch;
				}

				tableInfo = table_info;
			}
		}

		if (ziabot.fields_required) {
			tableInfo.list_info.fields_required = ziabot.fields_required;
		}

		return tableInfo;
	},
	/**
	 * Function to render the details page hyperlinked column cells
	 * @param {object} table_data - It has the data required to render the cell and the entity id
	 * @returns The HTML content of the cell is returned with module's details page URL hyperlinked
	 */
	constructDetailsPageURLColumn: function (table_data) {
		var row_data = table_data.row_data;
		var url = ziabot.details_page.url.replace('{id}', row_data.id).replace('{portal_id}', sdp_app.PORTAL_ID);
		var col_str;
		if (ziabot.list_view_entity == 'solutions' && !is_external_chat) {
			col_str = "<a class='cur-ptr' data-id='"+ row_data.id +"' data-event='click' data-handler='ziabot.loadDetailPageInIframe(" + row_data.id + ", &quot;" + url + "&quot;);' rel='uitip' title='" + e_attr(row_data[ziabot.details_page.field]) + "'>" + e_html(row_data[ziabot.details_page.field]) + "</a>";
		} else {
			col_str = "<a href='" + url + "' target='_blank' rel='uitip' title='" + e_attr(row_data[ziabot.details_page.field]) + "'>" + e_html(row_data[ziabot.details_page.field]) + "</a>";
		}
		return col_str;
	},
	/**
	 * Callback function to set the default table component options
	 * Here 'id' column is set as default sort field for any entity
	 *
	 * @returns - default_sort_field object
	 */
	tableCompOptions: function (options) {
		var otherOptions= {
			"default_sort_field": {//NO I18N
				"sort_field": "id",//NO I18N
				"sort_order": "asc"//NO I18N
			}
		};
		/**
        *  "for" param is passed in the metaInfo call for the Requests Module List view
        *  This is to avoid listing Resource Question's and unSupported additional fields in the list view
        */
        if("requests" == options.entity_name)
        {
            otherOptions.metaInfo_input = {
                "for": "request_list_view" //No I18N
            }
        }
        return otherOptions;
	},
	/**
	 * Callback function to set the base criteria set in Zia Bot before performing the list view search
	 *
	 */
	callbackSearchFunction: function () {
		var tablecomp = WebComponents.getInstance(ziabot.webComponentId);
		var ziabot_criteria = ziabot.list_info.search_criteria;	//Base criteria set in the Zia Bot

		if (ziabot_criteria &&
			((Array.isArray(ziabot_criteria) && !ziabot_criteria.length) ||
				(!Array.isArray(ziabot_criteria) && !jQuery.isEmptyObject(ziabot_criteria)))) {

			var stringified_field = sdpToJSON(ziabot_criteria);	//To cut down the object reference from zia_bot
			var search_criteria = JSON.parse(stringified_field);
			var list_view_search_criteria = tablecomp.t_obj.table_info.list_info.search_criteria;
			if (list_view_search_criteria) {
				if (!Array.isArray(search_criteria)) {
					if (!search_criteria.children) {
						search_criteria.children = [];
					}
					if (!Array.isArray(list_view_search_criteria)) {
						//list view search criteria as an object
						search_criteria.children.push(list_view_search_criteria);
					} else {
						//list view search criteria as an array
						for (var i = 0; i < list_view_search_criteria.length; i++) {
							search_criteria.children.push(list_view_search_criteria[i]);
						}
					}
				} else {
					if (!Array.isArray(list_view_search_criteria)) {
						//list view search criteria as an object
						search_criteria.push(list_view_search_criteria);
					} else {
						//list view search criteria as an array
						for (var i = 0; i < list_view_search_criteria.length; i++) {
							search_criteria.push(list_view_search_criteria[i]);
						}
					}
				}
			}
			tablecomp.t_obj.table_info.list_info.search_criteria = search_criteria;
		}
		tablecomp.refreshTable("refresh"); // No I18N
	},
	/* To view solution detail page in preview */
	loadSolutionDetail: function(id) {
		$previewComponent.load('/ui/solutions?entity_id='+id+'&mode=detail&externalframe=true',"Solution Details",'75%',null,null,'sol_details_preview');  // No I18N
	},
	/* To render Entity detail page in iframe of the slider window. */
	loadDetailPageInIframe: function(id, url){
		jQuery('#bot-listview-container').addClass('hide');
		ziabot.addBackButton();
		url += '&externalframe=true';  // No I18N
		jQuery('<iframe>', {
			src: url,
			id:  'dynamic-lv-iframe',  // No I18N
			frameborder: 0,
			class: 'soln-slider-hgt' // No I18N
		}).appendTo('#zia-bot-lv-popup-wrapper > .zdialog__content');  // No I18N

		var iframe = document.getElementById('dynamic-lv-iframe');
		iframe.addEventListener('load', function() {
			iframe.contentWindow.document.getElementById('content-inner').classList.add('minw-100px'); // No I18N
		});
		jQuery('.zdialog__title').text(translate('pagescripts.request.details.page', [translate('common.newsolution')]));
	},
	/* To add back button in the Detail preview page */
	addBackButton: function(){
		var backBtn = "<button id='zia_back_to_list' class='btn btn-default btn-xs fl mr10' rel='uitip' title='Back to list view' aria-label='Back to list view' role='button'>"  // No I18N
                + "<span class='common-sprite icon-sm common-go-back-icon1'></span></button>";  // No I18N
		jQuery('#zia-bot-lv-popup-wrapper > .zdialog__header').prepend(backBtn);
		setTimeout(function () {
			jQuery('#zia_back_to_list').off('click').on('click', function() {  // No I18N
				ziabot.backToListViewPage();
				return false;
			});
		}, 10);
	},
	/* To show the list view page when back button is clicked from the Detail page. */
	backToListViewPage: function(){
		jQuery('#zia_back_to_list').remove();
		jQuery('#dynamic-lv-iframe').remove();
		jQuery('#bot-listview-container').removeClass('hide');
		jQuery('.zdialog__title').text(ziabot.list_view_title);
	}
};