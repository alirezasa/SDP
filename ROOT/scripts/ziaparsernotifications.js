var zia_parser = {
    entity_id : '',
    from_module : '',
    selected_ids: [],
    startIndex: 1,
    rowCount: 10,
    supported_actions: [],
    init: function(fromModule, id) {
        this.from_module = fromModule;
        this.entity_id = id;
        if(zia_parser.supported_actions.length < 1) {
            zia_parser.supported_actions = zia_parser.getSupportedActions(this.from_module.toLowerCase());
            zia_parser.supported_actions.unshift({"id" : 0, "text" : translate("dre.all.actions")}); //No I18N
        }
        this.getFirstList(fromModule, id);
        if(fromModule === "Request") {
         let ele = '#' + fromModule + '_zia_notify_parser_div';
         let hasActions = zia_list.moduleTblObj.parser.data.actions && zia_list.moduleTblObj.parser.data.actions.length > 0;
         let callbackFn = hasActions ? '' : zia_parser.afterInit;
         renderhbs(ele, 'ziaparser_feedback', zia_list.moduleTblObj.parser, false, 'zia/zia-prediction', true, false, callbackFn); //No I18N
            if(hasActions) {
                renderhbs('#zp_actions', 'ziaparser_feedback_actions', zia_list.moduleTblObj.parser, false, 'zia/zia-prediction', true, false, zia_parser.afterInit); //No I18N
            }
        }
    },
    getSupportedActions: function(entity) {
        let response = {};
        sdpAjax({
            url: "/api/v3/zia_actions/_supported_parser_actions/" + entity, //No I18N
            method: "GET", //No I18N
            async: false,
            success: function(resp) {
                response = resp.supported_parser_actions;
            }
        });
        return response;
    },
    initViewMoreEvent : function() {
        let notifyDiv = jQuery('#' + zia_parser.from_module + '_zia_notify');
        ['#prop_showmore', '#action_showmore'].forEach((selector, index) => { //No I18N
            let showMoreEle = notifyDiv.find(selector);
            if (showMoreEle.length) {
                let handler = index === 0 ? zia_parser.viewMoreProperties : zia_parser.viewMoreActions;
                showMoreEle.off('click.zpfeedback').on('click.zpfeedback', function() { handler(this); }); // No I18N
            }
        });
    },
    afterInit: function() {
        let notifyDiv = jQuery('#' + zia_parser.from_module + '_zia_notify');
        notifyDiv.find('#actionstype').select2({
            data: zia_parser.supported_actions,
            placeHolder: false,
            allowClear: false
        }).select2('val', 0); //No I18N
        jQuery('#actionstype').off('select2-open').on('select2-open', function() { //No I18N
            jQuery('#' + zia_parser.from_module + '_zia_notify').on('hide.sdp.sdmenu.ziadropdown',function(e){e.preventDefault();})
        }).off('select2-close').on('select2-close', function() { //No I18N
            setTimeout(function() {
            jQuery('#' + zia_parser.from_module + '_zia_notify').off('hide.sdp.sdmenu.ziadropdown');
            }, 1000);
        });

        let tab = '';
        if(zia_list.moduleTblObj.parser.data.count.properties > 0) {
            tab = '#properties_tab'; //No I18N
            }
        else if(zia_list.moduleTblObj.parser.data.count.actions > 0) {
            tab = '#actions_tab'; //No I18N
        }
        if(tab !== '' && jQuery(tab).length > 0) {
        jQuery(tab).sdtab('show'); //No I18N
        }

        zia_parser.appendCheckboxEvent();
        let fromSlider = notifyDiv.parent('div').hasClass('panel-slider'); //No I18N
        if(!fromSlider) {
            jQuery('#' + zia_parser.from_module + '_zia_notify_parser_div').find('span,a').each(function(index, e) { jQuery(e).attr('rel-class', 'pos-abs'); });
            initTooltip('#' + zia_parser.from_module + '_zia_notify_parser_div');
        }

        zia_parser.initViewMoreEvent();

    },
    appendCheckboxEvent: function() {
        let notifyDiv = jQuery('#' + zia_parser.from_module + '_zia_notify');
         notifyDiv.find('input[type="checkbox"]').each((id, ele) => {
             jQuery(ele).off('click.zpfeedback').on('click.zpfeedback', function(){ //No I18N
                zia_parser.selectProp();
             });
         });
    },
    selectProp: function() {
        let selectedItems = jQuery('#' + zia_parser.from_module + '_zia_notify_parser_div').find('input[type=checkbox]:checked').length;
        if(selectedItems > 0) {
            zia_parser.enableDisableFeedback(true);
        }
        else {
            zia_parser.enableDisableFeedback(false);
        }
    },
    enableDisableFeedback: function(canEnable) {
        let feedback_buttons = jQuery('#zia_parser_like,#zia_parser_dislike');
        if(canEnable) {
            feedback_buttons.removeAttr("disabled");
        }
        else {
            feedback_buttons.attr("disabled", "disabled");
        }
    },
    submitFeedback: function(userFeedback) {
        //hide the mail details panel if present
        this.closePreviousMailDetails();
        let data = {};
        data.command = "updateTechVerification"; //NO I18N
        data.verifiedas = userFeedback;
        let ids = [];
        let ele = '#' + zia_parser.from_module + '_zia_notify_parser_div';
        let selectedEle = jQuery(ele).find('input[type=checkbox]:checked');
        selectedEle.each((id, ele) => {
            ids.push(jQuery(ele).val());
        });
        data.ziaid = ids.join(","); //No I18N
        data.frommodule = zia_parser.from_module;
        data.action = "parser";
        sdpAjax({
            url: '/servlet/AIAjaxServlet', //No I18N
            data: data,
            method: "POST", //No I18N
            async: false,
            success: function(resp) {
             if(resp && resp.status == 'success') {
                 zia_parser.enableDisableFeedback(false);
                 let count = selectedEle.length;
                 selectedEle.each((i, ele) => {
                     let checkboxEle = jQuery(ele);
                     let type = checkboxEle.attr('data-type');
                     if("zp_actions" == type) { //NO I18N
                         let li_ele = jQuery(ele).closest('li'); //No I18N
                         jQuery(ele).closest('div').remove(); //No I18N
                         //Check whether there are any other actions for the selected action type
                         if(jQuery(li_ele).find('input[type=checkbox][data-type=zp_actions]').length == 0) {
                             li_ele.remove();
                         }
                     }
                     else {
                         jQuery(ele).closest('li').remove(); //No I18N
                     }
                 });
                 let zpdctAlert = jQuery('#zpdct-alert');
                 zpdctAlert.find('span').html(resp.message);
                 zpdctAlert.removeClass('hide');
                 setTimeout(function() {
                     zpdctAlert.addClass('hide');
                     zia_parser.enableDisableFeedback(true);
                     reqzia_counts.parser_count -= count;
                     zia_list.moduleTblObj.parser.list_info.total_count -= count;
                     zia_list.loadzianotifications(zia_parser.from_module, zia_list.entity_id);
                 }, 3000);
             }
            }
        });
    },
    getFirstList: function(fromModule, id) {
        let _self = this;
        let data = {};
        let response = this.getParserNotifications(fromModule, id, _self.startIndex, _self.rowCount, null, null, data);
        let parser_notifications = {};
        parser_notifications.data = response.parser_notifications[0];
        parser_notifications.data.entity = fromModule;
        parser_notifications.data.entityid = id;
        parser_notifications.data.nextstartindex = Number(_self.startIndex) + Number(_self.rowCount);
        parser_notifications.data.supported_actions = zia_parser.supported_actions;
        parser_notifications.list_info = response.list_info;
        zia_list.moduleTblObj.parser = parser_notifications;
    },
    loadActions: function(event) {
        zia_parser.clearActionHighlight();
        zia_parser.closePreviousMailDetails();
        let ele = event.target;
        let actionId = jQuery(ele).val();
        if(!this.openPanelOnViewMore(false, actionId)) {
            actionId = (actionId == 0) ? null : actionId;
            let response = zia_parser.getParserNotifications(zia_parser.from_module, zia_parser.entity_id, 1, 10, "actions", actionId); //No I18N
            let parser_notifications = {};
            parser_notifications.data = response.parser_notifications[0];
            parser_notifications.data.entity = zia_parser.from_module;
            parser_notifications.data.entityid = zia_parser.entity_id;
            parser_notifications.data.nextstartindex = 11;
            parser_notifications.list_info = response.list_info;
            renderhbs('#zp_actions', 'ziaparser_feedback_actions', parser_notifications, false, 'zia/zia-prediction', true); //No I18N
            zia_parser.appendCheckboxEvent();
            zia_parser.initViewMoreEvent();
        }

    },
    viewMoreActions: function(ele) {
        let viewMoreEle = jQuery(ele);
        viewMoreEle.attr('id', '').parent('li').hide(); //No I18N
        if(!zia_parser.openPanelOnViewMore(false)) {
            let startIndex = jQuery(viewMoreEle).attr('data-next-start');
            let actionId = jQuery('#actionstype').val();
            actionId = (actionId == 0) ? null : actionId;
            let response = zia_parser.getParserNotifications(zia_parser.from_module, zia_parser.entity_id, startIndex, 10, "actions", actionId); //No I18N
            let parser_notifications = {};
            parser_notifications.data = response.parser_notifications[0];
            parser_notifications.data.entity = zia_parser.from_module;
            parser_notifications.data.entityid = zia_parser.entity_id;
            parser_notifications.data.nextstartindex = Number(startIndex) + 10;
            parser_notifications.list_info = response.list_info;
            let firstActionJson = parser_notifications.data.actions[0];
            let existingActionDiv = jQuery('#zp_actions').find('li[data-action-type="' + firstActionJson.internal_name + '"]');
            if(existingActionDiv.length != 0) {
                let actionJson = parser_notifications.data.actions.shift();
                let documentFragment = document.createDocumentFragment();
                actionJson.actions.forEach(action => {
                    const $div = jQuery('<div>', {
                        class : 'text-overflow' //No I18N
                    });

                    // Create the input element
                    const $input = jQuery('<input>', {
                        type : 'checkbox', //No I18N
                        id : 'zp_' + action.id, //No I18N
                        value : action.id,
                        class: 'vmiddle mt-1', //No I18N
                        'data-type' : 'zp_actions' //No I18N
                    });

                    // Create the anchor (a) element
                    const $anchor = jQuery('<a>', {
                        class: 'text-link cur-ptr maxw-200px disp-ib vmiddle text-overflow', //No I18N
                        title : action.value,
                        rel : 'uitip', //No I18N
                        mode_ellipsis : 'true',
                        'rel-class' : 'maxw-250px pos-abs left0 mlp30 wb-bw', //No I18N
                        'data-mail-render' : 'true', //No I18N
                        text: action.value
                    });

                    // Append the input and anchor to the div
                    $div.append($input, $anchor);

                    // Append the div to the DocumentFragment
                    jQuery(documentFragment).append($div);
                });
                existingActionDiv.find('#actions_checkbox_list').append(documentFragment);
            }
            // Create a DocumentFragment
            let fragment = document.createDocumentFragment();
            if(parser_notifications.data.actions.length > 0) {
                zia_parser.getActionsForAppend(parser_notifications, fragment);
            }
            if(parser_notifications.data.hasmore.actions) {
                zia_parser.getViewMore(false, parser_notifications.data.nextstartindex, fragment);
            }
            let containerJQ = jQuery('#zpdct-ul1');
            containerJQ.append(fragment);

            //Handle events
            containerJQ.find('#action_showmore').off('click.zpfeedback').on('click.zpfeedback', function() { zia_parser.viewMoreActions(this); }); //No I18N
            containerJQ.find('a[data-mail-render="true"]').off('click.zpfeedback').on('click.zpfeedback', function() { zia_parser.renderMailDetails(this, event); }); //No I18N
            initTooltip('#zpdct-ul1'); //No I18N


            zia_parser.appendCheckboxEvent();
        }
    },
    viewMoreProperties: function(ele) {
        let viewMoreEle = jQuery(ele);
        let startIndex = jQuery(viewMoreEle).attr('data-next-start');
        //This element id is emptied since another element with same id is to be rendered
        jQuery(ele).attr('id', '').parent('li').hide(); //No I18N
        if(!zia_parser.openPanelOnViewMore(true)) {
            let response = zia_parser.getParserNotifications(zia_parser.from_module, zia_parser.entity_id, startIndex, 10, "properties", null); //No I18N
            let parser_notifications = {};
            parser_notifications.data = response.parser_notifications[0];
            parser_notifications.data.entity = zia_parser.from_module;
            parser_notifications.data.entityid = zia_parser.entity_id;
            parser_notifications.data.nextstartindex = Number(startIndex) + 10;
            parser_notifications.list_info = response.list_info;
            if(parser_notifications.data.properties.length > 0) {
                let fragment = document.createDocumentFragment();
                zia_parser.getPropertiesForAppend(parser_notifications, fragment);
                if(parser_notifications.data.hasmore.properties) {
                    this.getViewMore(true, parser_notifications.data.nextstartindex, fragment);
                }
                let containerJQ = jQuery('#zpdct-ul');
                containerJQ.append(fragment);

                //Handle events
                containerJQ.find('#prop_showmore').off('click.zpfeedback').on('click.zpfeedback', function() { zia_parser.viewMoreProperties(this); }); //No I18N
                containerJQ.find('a[data-mail-render="true"]').off('click.zpfeedback').on('click.zpfeedback', function() { zia_parser.renderMailDetails(this, event); }); //No I18N
                initTooltip('#zpdct-ul'); //No I18N
                zia_parser.appendCheckboxEvent();
            }
        }
    },
    getPropertiesForAppend: function(parser_notifications, fragment) {
        parser_notifications.data.properties.forEach(propertyJson => {

            // Create the main li element
            const $li = jQuery('<li>', {
                class : 'pos-rel', //No I18N
                'data-type' : 'zp_properties' //No I18N
            });

            // Create the label element
            const $label = jQuery('<label>', {
            });

            // Create the input element
            const $input = jQuery('<input>', {
                type : 'checkbox', //No I18N
                id : 'zp_' + propertyJson.id, //No I18N
                class: 'vmiddle mt-1', //No I18N
                value : propertyJson.id,
                'data-type' : 'zp_properties' //No I18N
            });

            // Create the first span element
            const $span1 = jQuery('<span>', {
                class : 'text-overflow disp-ib vmiddle w-100px ml3', //No I18N
                rel : 'uitip', //No I18N
                mode_ellipsis : 'true',
                'rel-class' : 'maxw-250px pos-abs left0 ml10 wb-bw', //No I18N
                title : propertyJson.name,
                text : propertyJson.name
            });

            // Create the second span element
            const $span2 = jQuery('<li>', {
                class : 'disp-ib vmiddle mr3 ml3 w-10px', //No I18N
                text: ':'
            });

            // Create the anchor (a) element
            const $anchor = jQuery('<a>', {
                class : 'disp-ib vmiddle text-overflow w-250px text-link cur-ptr', //No I18N
                rel : 'uitip', //No I18N
                mode_ellipsis : 'true',
                'rel-class' : 'maxw-250px pos-abs left0 mlp30 wb-bw', //No I18N
                'data-mail-render' : 'true', //No I18N
                title : propertyJson.value,
                text : propertyJson.value
            });

            // Append the input, spans, and anchor to the label
            $label.append($input, $span1, $span2, $anchor);

            // Append the label to the li element
            $li.append($label);

            // Append the li element to the DocumentFragment
            jQuery(fragment).append($li);
        });
    },
    getActionsForAppend: function(parser_notifications, fragment) {

        parser_notifications.data.actions.forEach(actionsJson => {
            // Create the main li element
            const $li = jQuery('<li>', {
                class: 'pos-rel', //No I18N
                'data-action-type': actionsJson.internal_name  //No I18N
            });

            // Create the div with class 'disp-t'
            const $div = jQuery('<div>', {
                class : 'disp-t fw' //No I18N
            });

            // Create the first inner div with class 'disp-c vtop'
            const $firstInnerDiv = jQuery('<div>', {
                class : 'disp-c vtop w-100px' //No I18N
            });

            // Create the span element
            const $span = jQuery('<span>', {
                class: 'text-color1 text-overflow disp-ib maxw-100px', //No I18N
                title : actionsJson.name,
                rel : 'uitip', //No I18N
                mode_ellipsis : 'true',
                text : actionsJson.name
            });

            // Append the span to the first inner div
            $firstInnerDiv.append($span);

            // Create the second inner div with class 'disp-c vtop'
            const $secondInnerDiv = jQuery('<div>', {
                class : 'disp-c vtop w-10px', //No I18N
                text: ' : '
            });

            // Create the third inner div with class 'disp-c vtop' and id 'actions_checkbox_list'
            const $thirdDiv = jQuery('<div>', {
                class : 'disp-c vtop w-250px', //No I18N
                id : 'actions_checkbox_list' //No I18N
            });

            // Loop through the actions and create the inner elements
            actionsJson.actions.forEach(actionJson => {
                // Create the div with class 'text-overflow'
                const $inputDiv = jQuery('<div>', {
                    class : 'text-overflow' //No I18N
                });

                // Create the input element
                const $input = jQuery('<input>', {
                    type : 'checkbox', //No I18N
                    id : 'zp_' + actionJson.id, //No I18N
                    'value' : actionJson.id, //No I18N
                    class : 'vmiddle mt-1', //No I18N
                    'data-type' : 'zp_actions' //No I18N
                });

                // Create the anchor (a) element
                const $anchor = jQuery('<a>', {
                    class : 'text-link cur-ptr maxw-200px disp-ib vmiddle text-overflow', //No I18N
                    title : actionJson.value,
                    rel : 'uitip', //No I18N
                    mode_ellipsis : 'true',
                    'rel-class' : 'maxw-250px pos-abs left0 mlp30 wb-bw', //No I18N
                    'data-mail-render' : 'true', //No I18N
                    text : actionJson.value
                });

                // Append the input and anchor to the div with class 'text-overflow'
                $inputDiv.append($input, $anchor);

                // Append the div with class 'text-overflow' to the third inner div
                $thirdDiv.append($inputDiv);
            });

            // Append the inner divs to the div with class 'disp-t'
            $div.append($firstInnerDiv, $secondInnerDiv, $thirdDiv);

            // Append the div with class 'disp-t' to the li element
            $li.append($div);

            // Append the li element to the DocumentFragment
            jQuery(fragment).append($li);
        });

        return fragment;
    },
    getViewMore: function(forProperty, startIndex, fragment) {

        let divElement = document.createElement('li');
        divElement.setAttribute('data-type', 'showmore');

        let anchorElement = document.createElement('a');
        anchorElement.id = forProperty ? "prop_showmore" : "action_showmore";
        anchorElement.className = 'ml25 cur-ptr';
        anchorElement.setAttribute('data-type', 'zp_actions');
        anchorElement.setAttribute('data-next-start', startIndex);
        anchorElement.textContent = translate("sdp.project.history.viewmore");

        divElement.appendChild(anchorElement);

        fragment.append(divElement);

    },
    openPanelOnViewMore: function(fromProperties, actionId) {
        let fromSlider = jQuery('#' + zia_parser.from_module + '_zia_notify').parent('div').hasClass('panel-slider'); //No I18N
        if(!fromSlider) {
            zia_parser.rowCount = 20;
            zia_list.loadZiaNotificationsInPanel(zia_parser.from_module, this.entity_id);
            zia_parser.rowCount = 10;
            setTimeout(function() {
                if(fromProperties) {
                    jQuery('#properties_tab').sdtab("show"); //No I18N
                }
                else {
                    jQuery('#actions_tab').sdtab("show"); //No I18N
                    if(actionId && actionId != 0) {
                        jQuery('#actionstype').val(actionId).trigger('change');
                    }
                }
            }, 200);
            return true;
        }
        return false;
    },
    getParserNotifications: function(fromModule, id, startIndex, rowCount, type, actionId, data) {
        let response;

        //construct input data
        let parser_notification = {};
        parser_notification.entity = fromModule.toLowerCase();
        parser_notification.entityid = id;
        if(type) {
            parser_notification.type = type;
            if(type === 'actions' && actionId) {
                parser_notification.actionid = actionId;
            }
        }

        let list_info = {};
        list_info.get_total_count = true;
        list_info.start_index = startIndex;
        list_info.row_count = rowCount;
        let input_data = {};
        input_data.list_info = list_info;
        input_data.parser_notification = parser_notification;
        sdpAjax({
            url: "api/v3/zia_actions/_parser_notifications", //No I18N
            method: "GET", //No I18N
            data: sdpAjaxInputData(input_data),
            async: false,
            success: function(resp) {
                response = resp;
            }
            });
        return response;
    },
    appendParserNotifications: function(fromModule, id, startIndex, rowCount, parser_notifications) {
        let hasMoreRows = false;
        let list_info = {};
        let parser_notification = {};
        parser_notification.entity = fromModule.toLowerCase();
        parser_notification.entityid = id;
        list_info.get_total_count = true;
        list_info.start_index = startIndex;
        list_info.row_count = rowCount;
        let input_data = {};
        input_data.list_info = list_info;
        input_data.parser_notification = parser_notification;
        sdpAjax({
            url: "api/v3/zia_actions/_parser_notifications", //No I18N
            method: "GET", //No I18N
            data: sdpAjaxInputData(input_data),
            async: false,
            success: function(resp) {
                let parser_data = resp.parser_notifications[0];
                if(parser_data) {
                    if(parser_data.properties) {
                         parser_data.properties.toArray().forEach(property => {
                             parser_notifications.data.properties.push(property);
                         });
                    }
                    if(parser_data.actions) {
                         if(parser_notifications.data.actions.length == 0) {
                             parser_data.actions.toArray().forEach(action => {
                                 parser_notifications.data.actions.push(action);
                             });
                         }
                         else {
                             zia_parser.mergeActions(parser_notifications, parser_data);
                         }
                    }
                    parser_notifications.data.count = parser_data.count;
                }
                parser_notifications.list_info = resp.list_info;
                hasMoreRows = resp.list_info.has_more_rows;
            }
        });
        return hasMoreRows;
    },
    mergeActions: function(parser_notifications, parser_data) {
        parser_data.actions.toArray().forEach(action => {
            let actionName = action.name;
            let count = action.count;
            parser_notifications.data.actions.toArray().forEach(e_action => {
                if(e_action.name == actionName) {
                    let c = e_action.count;
                    e_action.count = (c + count);
                    action.value.forEach(v => {
                        e_action.value.push(v);
                    });
                }
            });
        });
    },
    getMailDetails: function(id) {
        let mail_details = {};
        let input_data = {};
        input_data.entity = zia_parser.from_module.toLowerCase();
        input_data.entityid = zia_parser.entity_id;
        if(!isNaN(id)) {
            sdpAjax({
                url: "/api/v3/zia_actions/_get_mail_content/" + id, //No I18N
                data: sdpAjaxInputData(input_data),
                method: "GET", //No I18N
                async: false,
                success: function(resp) {
                    mail_details = resp.zia_action;
                }
            });
        }
        return mail_details;
    },
    renderMailDetails: function(ele, event) {
        event.preventDefault();
        let zia_action_id = jQuery(ele).siblings('input').val(); //No I18N
        let fromSlider = jQuery('#' + zia_parser.from_module + '_zia_notify').parent('div').hasClass('panel-slider'); //No I18N
        let type = jQuery(ele).siblings('input').attr('data-type'); //No I18N
        if(!fromSlider) {
            let callback = {};
            callback.function = this.renderMailDetails;
            callback.params = {
                "param1" : ele, //No I18N
                "param2" : event //No I18N
            };
            zia_list.loadZiaNotificationsInPanel(zia_parser.from_module, this.entity_id, callback);
            setTimeout(function() {
                if(type === 'zp_properties') {
                    jQuery('#properties_tab').sdtab('show'); //No I18N
                }
                else {
                    jQuery('#actions_tab').sdtab('show'); //No I18N
                }
            }, 200);
            return;
        }
        zia_parser.clearActionHighlight();
        if(type === 'zp_properties') {
            jQuery('#zp_' + zia_action_id).parent('label').parent('li').addClass("active");
        }
        else {
            jQuery('#zp_' + zia_action_id).parent('div').addClass('active'); //No I18N
        }
        let mail_details = zia_parser.getMailDetails(zia_action_id);
        let target = jQuery('#' + zia_parser.from_module + '_zia_notify');
        let targetCloseButton = target.siblings('div').find('button'); //No I18N
        let parserMailDetailsDiv = jQuery('#parser_mail_details');
        if(parserMailDetailsDiv.hasClass("ui-dialog-content")) {
            parserMailDetailsDiv.html(ajaxBar());
            renderhbs('#parser_mail_details', 'mail_details', mail_details, false, 'zia/zia-prediction'); //No I18N
        }
        else {
            let panelConfig = {
                title: translate('sdp.about.details'), //NO I18N
                width: 420,
                header: true,
                modal: false,
                placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                dialogClass: "sdtabui-rightpanel ziaprsr-slider2", // NO I18N
                open: function() {
                    renderhbs('#parser_mail_details', 'mail_details', mail_details, false, 'zia/zia-prediction'); //No I18N
                    jQuery('#zpc-1').hide();
                    targetCloseButton.addClass('hide');
                },
                close: function() {
                    let parserMailDetailsDiv = jQuery('#parser_mail_details');
                    parserMailDetailsDiv.html('');
                    parserMailDetailsDiv.dialog('destroy'); //No I18N
                    jQuery('body').removeClass('subheader-of-h of-h');
                    jQuery('#zpc-1').show();
                    targetCloseButton.removeClass('hide');
                    zia_parser.clearActionHighlight();
                },
                position : {
                    my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                    at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
                    of : target
                }
            };
            parserMailDetailsDiv.show().panelSlider(panelConfig);
        }
        initTooltip('#parser_mail_details'); //No I18N
    },
    clearActionHighlight: function() {
        jQuery('#zp_actions').find('.text-overflow.active').removeClass("active");
        jQuery('#zpdct-ul').find('li.pos-rel.active').removeClass("active");

    },
    closePreviousMailDetails: function() {
        let parserMailDetailsDiv = jQuery('#parser_mail_details');
        if(parserMailDetailsDiv.hasClass("ui-dialog-content")) {
            parserMailDetailsDiv.dialog('close'); //No I18N
        }
    },
    showmore: function(ele) {
        let anchorEle = jQuery(ele);
        if("zp_actions" === anchorEle.attr("data-type")) {
            anchorEle.closest('li').find('div[data-overflow="true"]').toggleClass('hide'); //No I18N
        }
        else {
            anchorEle.closest('ul').find('li[data-overflow="true"]').toggleClass('hide'); //No I18N
        }
        anchorEle.toggleClass('hide'); //No I18N
        anchorEle.siblings('a').toggleClass('hide'); //No I18N
    }
}