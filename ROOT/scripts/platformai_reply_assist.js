var $platformai_reply_assist = {
    /**
     * To store the ZEditor.notificationDescEditor instance and used in all the functions of $platformai_reply_assist
     */
    replyEditor: null,
    /**
     * Method to initialize the $platformai_reply_assist
     */
    init: function () {
        let _self = this;
        setTimeout(function () {
            if (ZEditor && ZEditor.notificationDescEditor) {
                _self.replyEditor = ZEditor.notificationDescEditor;
                if (_self.replyEditor.toolbardiv) {
                    let ZEditorToolbar = jQuery(_self.replyEditor.toolbardiv);
                    let replyAssistOption = ZEditorToolbar.find("li:has(.chat-gpt)");
                    $platformai_reply_assist.initTextSelection(replyAssistOption);
                }
            }
        }, 500); // Delay to ensure the ZEditor is loaded
    },
    /**
     * Method to listen the text selection event in ZEditor
     * @param {Element} replyAssistOption - Chat GPT Icon element shown in ZEditor
     */
    initTextSelection: function (replyAssistOption) {
        let _self = this;
        if (_self.replyEditor.squireInstance && _self.replyEditor.win) {
            let zEditorWindow = _self.replyEditor.win;
            let editorOuterDiv = jQuery(_self.replyEditor.outerdiv);
            jQuery(_self.replyEditor.squireInstance).off('selectionchange.reply-assist-selection').on('selectionchange.reply-assist-selection', function () { //NO I18N
                setTimeout(function () {
                    let selectedText = zEditorWindow.getSelection().toString().trim();
                    replyAssistOption[0].selectedText = selectedText || '';
                    let replyAssistDropdown = editorOuterDiv.find('#reply-assist-dropdown, #reply-assist-result-dropdown');
                    if (replyAssistDropdown.is(':visible')) {
                        replyAssistOption[0].sdpShowDropInstance.destroy();
                    }
                }, 10); // Delay to ensure the selection is registered
            });
        }
    },
    /**
     * Method to show the Reply Assist Dropdown when clicked on the Chat GPT Icon in ZEditor
     * @param {String} notificationType - reply/forward/conversation
     */
    showDropDown: function (notificationType) {
        let _self = this;
        let ZEditorToolbar = jQuery(_self.replyEditor.toolbardiv);
        let replyAssistOption = ZEditorToolbar.find("li:has(.chat-gpt)")[0];
        let replyAssistDropdown = jQuery(_self.replyEditor.outerdiv).find('#reply-assist-dropdown, #reply-assist-result-dropdown');
        if (!replyAssistDropdown.is(':visible')) {
            $platformai_reply_assist.constructDropdown(replyAssistOption, notificationType);
        } else if (replyAssistDropdown[0].id === 'reply-assist-dropdown') {
            replyAssistOption.sdpShowDropInstance.destroy();
        }
    },
    /**
     * Method to show the Reply Assist Dropdown based on the selection
     * If the text is selected then following three options will be shown - Write Assistant, Rephrase and Grammar check
     * If not selected then Write Assistant option will be shown
     *
     * @param {Element} element - Chat GPT Icon element which is clicked in the ZEditor
     * @param {String} notificationType - reply/forward/conversation
     * @param {String} textAreaContent - Text entered in the Generate Content pop-up from back button click
     */
    constructDropdown: function (element, notificationType, textAreaContent) {
        let holder = element;

        let selectedText = holder.selectedText;
        if (selectedText && selectedText.length > 10000) {
            showalert('failure', translate('reply.assistant.max.char.limit'), 'isAutoHide=false'); //No I18N
            return;
        }
        let replyAssistDropdownId = "reply-assist-dropdown";   //NO I18N

        let replyAssistContainerId = "ze_notifDescText";   //NO I18N
        let replyAssistContainer = document.getElementById(replyAssistContainerId);
        let replyAssistHTML = '';
        let replyAssistData = {};
        if (selectedText) {
            replyAssistHTML = '<ul class="sdmenu-dd cgpt-rplyassist" id="' + replyAssistDropdownId + '"></ul>';
            replyAssistData = { "dropdown-name": "options", "notificationType": notificationType };   //NO I18N

        } else {
            replyAssistHTML = '<div class="sdmenu-dd p0" id="' + replyAssistDropdownId + '"></div>';
            replyAssistData = { "dropdown-name": "reply-assist-input" };    //NO I18N
        }
        jQuery(replyAssistContainer).append(replyAssistHTML);

        renderhbs('#' + replyAssistDropdownId, 'platformai_reply_assist', replyAssistData, false, "platform_ai");    //NO I18N

        let replyAssistDropdown = document.getElementById(replyAssistDropdownId);

        let replyAssistDropDownHandler = sdpDropDown(holder, replyAssistDropdown, { dropDownContainer: replyAssistContainer, positionConfig: { within: '#' + replyAssistContainerId }, scrollToClose: false, removeDropOnClose: true });

        let replyAssistDropdownElement = jQuery(replyAssistDropdown);

        setTimeout(function () {
            replyAssistDropDownHandler.show();
            initTooltip('#' + replyAssistDropdownId);
            if (!selectedText) {
                let replyAssistTextArea = replyAssistDropdownElement.find('#reply-assist-textarea');
                //Focus on the textarea when the Generate Content dropdown is shown
                replyAssistTextArea.focus();

                //When back button is clicked from the result dropdown, the text entered in the textarea will be shown again
                if (textAreaContent) {
                    replyAssistTextArea.val(textAreaContent);
                }

                //Show error message when the textarea is empty by listening 'input' event
                let textAreaError = replyAssistDropdownElement.find('#reply-assist-textarea-error');
                replyAssistTextArea.off('input.reply-assist-textarea').on('input.reply-assist-textarea', function () {  //NO I18N
                    let userInput = replyAssistTextArea.val();
                    if (userInput.length >= 10000 || !userInput.trim()) {
                        const errorMsg = !userInput.trim() ? translate('dre.clone.field.error.msg') : translate("form.character.maximumlength.alert", ['10000']);
                        textAreaError.html(errorMsg);
                        textAreaError.removeClass('hide');
                    } else {
                        textAreaError.addClass('hide');
                    }
                });
            } else {
                //Below fix is done to close the dropdown when Esc key is pressed
                replyAssistDropdownElement.find('#generate-option').focus();
            }
        }, 10);//Delay to ensure the gpt icon click event gets completed before showing the dropdown other wise dropdown will be closed

        if (selectedText) {
            //Write Assistant, Rephrase and Grammar check buttons in the Reply Assistant options dropdown
            replyAssistDropdownElement.find('#generate-option, #rephrase-option, #grammar-option')
                .off('click.reply-assist-options').on('click.reply-assist-options', function (event) {   //NO I18N
                    event.preventDefault();
                    let optionId = this.id;
                    let category = optionId.substr(0, optionId.length - 7);
                    replyAssistDropDownHandler.destroy();

                    /**
                     * Only for forward, when a text is selected and clicked 'generate' option, a elaborated content will be generated for rest of the notification types Email Reply format will be generated
                     */
                    if (category == 'generate' && notificationType != 'forward') {
                        category = 'reply'; //NO I18N
                    }
                    $platformai_reply_assist.generateResponse(true, selectedText, category, holder, replyAssistContainerId, replyAssistContainer, false, notificationType);
                });
        } else {
            //Generate button in the Write Assistant dropdown
            replyAssistDropdownElement.find('#reply-assist-generate')
                .off('click.reply-assist-generate').on('click.reply-assist-generate', function () { //NO I18N
                    let replyAssistTextArea = replyAssistDropdownElement.find('#reply-assist-textarea')
                    let userInput = replyAssistTextArea.val().trim();
                    if (userInput) {
                        replyAssistDropDownHandler.destroy();
                        $platformai_reply_assist.generateResponse(false, userInput, 'generate', holder, replyAssistContainerId, replyAssistContainer, false); //NO I18N
                    } else {
                        replyAssistTextArea.focus();
                        replyAssistDropdownElement.find('#reply-assist-textarea-error').removeClass('hide').html(translate('dre.clone.field.error.msg'));
                    }
                });

            //Close button in the Write Assistant dropdown
            replyAssistDropdownElement.find('#reply-assist-close')
                .off('click.reply-assist-close').on('click.reply-assist-close', function () {   //NO I18N
                    replyAssistDropDownHandler.destroy();
                });
        }
    },
    /**
     * Method to hit the '_reply_assistance' API with the selected/given text
     *
     * @param {Boolean} isTextSelected - Result dropdown will have different options based on the text selection
     * @param {String} text - Text to be sent to the API
     * @param {String} category - generate/reply/rephrase/grammar
     * @param {Element} holder - Chat GPT Icon element shown in ZEditor
     * @param {String} replyAssistContainerId - Id of the container where the dropdown will be appended
     * @param {Element} replyAssistContainer - Container where the dropdown will be appended
     * @param {Boolean} isRegenerate - If the response is to be regenerated
     * @param {String} notificationType - reply/forward/conversation
     */
    generateResponse: function (isTextSelected, text, category, holder, replyAssistContainerId, replyAssistContainer, isRegenerate, notificationType) {
        let replyAssistResultDropdownId = 'reply-assist-result-dropdown';   //NO I18N
        let replyAssistResultHTML = '<div class="sdmenu-dd p0" id="' + replyAssistResultDropdownId + '"></div>';
        let replyAssistData = { "dropdown-name": "result" };    //NO I18N
        jQuery(replyAssistContainer).append(replyAssistResultHTML);
        renderhbs('#' + replyAssistResultDropdownId, 'platformai_reply_assist', replyAssistData, false, "platform_ai");    //NO I18N

        let replyAssistResultDropdown = document.getElementById(replyAssistResultDropdownId);
        let replyAssistResultDropdownCallbackMethod = sdpDropDown(holder, replyAssistResultDropdown, { dropDownContainer: replyAssistContainer, positionConfig: { within: '#' + replyAssistContainerId }, scrollToClose: false, removeDropOnClose: true });

        let replyAssistResultDropDownElement = jQuery(replyAssistResultDropdown);

        setTimeout(function () {
            replyAssistResultDropdownCallbackMethod.show();
            initTooltip('#' + replyAssistResultDropdownId);
        }, 10);//Delay to ensure the click event gets completed before showing the dropdown other wise dropdown will be closed

        //Processing icon will be shown and close/back/reply-assistant options will be hidden in the dropdown until the response is received from the API
        replyAssistResultDropDownElement.find('#reply-assist-processing').removeClass('hide');
        replyAssistResultDropDownElement.find('#reply-assist-generated-result, #reply-assist-close, #reply-assist-back, #reply-assist-result-options').addClass('hide');
        replyAssistResultDropDownElement.find('#rply-assist-title').text(isRegenerate ? translate('reply.asssistant.regenerating.response') : translate('reply.asssistant.generating.response'));

        let input_data = { "platform_ai": { "query": text, "category": category, "isRegenerate": isRegenerate } };    //NO I18N
        sdpAjax({
            url: '/api/v3/platform_ai/_reply_assistance',   //NO I18N
            type: 'POST', // No I18N
            async: true,
            data: sdpAjaxInputData(input_data),
            success: function (response) {
                $platformai_reply_assist.replyAssistSuccessCallback(response.platform_ai.query_response, replyAssistResultDropDownElement, isTextSelected, text, category, holder, replyAssistContainerId, replyAssistContainer, isRegenerate, notificationType);
            },
            error: function (response) {
                showalert('failure', response.responseJSON.response_status.messages[0].message, 'isAutoHide=false'); //No I18N
            }
        });
    },
    /**
     * Method to render the reply-assist result dropdown with the response received from the API with editor options like Replace, Append, Move to Editor, Copy, Regenerate and Close
     *
     * @param {String} resultText - Response received from the API
     * @param {Element} replyAssistResultDropDownElement - Reply Assist Result Dropdown element
     * @param {Boolean} isTextSelected - If the text is selected in the ZEditor
     * @param {String} text -  Text selected in the ZEditor/Text entered in the Write Assistant textarea
     * @param {String} category - generate/reply/rephrase/grammar
     * @param {String} holder - Chat GPT Icon element shown in ZEditor
     * @param {String} replyAssistContainerId  - Id of the container where the dropdown will be appended
     * @param {Element} replyAssistContainer - Container where the dropdown will be appended
     * @param {Boolean} isRegenerate - If the response is to be regenerated
     * @param {String} notificationType - reply/forward/conversation
     */
    replyAssistSuccessCallback: function (resultText, replyAssistResultDropDownElement, isTextSelected, text, category, holder, replyAssistContainerId, replyAssistContainer, isRegenerate, notificationType) {

        let _self = this;
        //Set the generated result text in the dropdown element
        //&#xa; is the hexadecimal representation for a line feed (new line).
        replyAssistResultDropDownElement.find('#reply-assist-generated-result-text')
            .html(encodeHTML(resultText).replaceAll('&#xa;', '<br>')); //NO I18N

        //Hide the processing icon and show the generated result
        replyAssistResultDropDownElement.find('#reply-assist-processing').addClass('hide');
        replyAssistResultDropDownElement.find('#reply-assist-generated-result').removeClass('hide');

        //To Show Generate/Regenerate Text
        replyAssistResultDropDownElement.find('#rply-assist-gstatus').text(isRegenerate ? translate('sdp.admin.tech.sdpapi.key.regenerate') : translate('sdp.admin.tech.sdpapi.key.generate'));

        //To Show Pop-Up Title
        let titleKey = category == 'generate' ? 'reply.assistant.label.generate.content' : category == 'reply' ? 'reply.assistant.option.generate.reply' : category == 'rephrase' ? 'reply.assistant.option.rephrase' : 'reply.assistant.option.grammar'; //NO I18N
        replyAssistResultDropDownElement.find('#rply-assist-title').text(translate(titleKey));

        //Show the reply-assist editor options
        replyAssistResultDropDownElement.find('#reply-assist-result-options').removeClass('hide');

        let replyAssistResultDropdownCallbackMethod = holder.sdpShowDropInstance;

        if (isTextSelected) {
            //Show Replace button
            replyAssistResultDropDownElement.find('#reply-assist-replace').removeClass('hide')
                .off('click.reply-assist-replace')  //NO I18N
                .on('click.reply-assist-replace', function () {
                    $platformai_reply_assist.insertTextinZEditor(resultText, replyAssistResultDropdownCallbackMethod);
                });

            if (category === 'generate' || category === 'reply') {
                //Show Move to top button for 'Generate'/'Reply' category alone
                replyAssistResultDropDownElement.find('#reply-assist-movetotop').removeClass('hide')
                    .off('click.reply-assist-movetotop')  //NO I18N
                    .on('click.reply-assist-movetotop', function () {
                        $platformai_reply_assist.moveToTop(resultText, replyAssistResultDropdownCallbackMethod);
                    });
            } else {
                //Hide Move to top button
                replyAssistResultDropDownElement.find('#reply-assist-movetotop').addClass('hide')
            }

            replyAssistResultDropDownElement.find('#reply-assist-append').addClass('hide');
            /*
            temporariily commented since not needed as per requirement

            //Show Append button
            replyAssistResultDropDownElement.find('#reply-assist-append').removeClass('hide')
                .off('click.reply-assist-append')   //NO I18N
                .on('click.reply-assist-append', function () {
                    $platformai_reply_assist.appendAfterSelectedText(resultText, replyAssistResultDropdownCallbackMethod);
                });
            */

            //Hide Move to editor button
            replyAssistResultDropDownElement.find('#reply-assist-movetoeditor').addClass('hide');

        } else {

            //If description is empty in Zeditor then show 'Move to Editor' buttor or show 'Append' button
            let desc = _self.replyEditor.getHTML().trim();
            let buttonToHide = desc ? '#reply-assist-movetoeditor' : '#reply-assist-append';    //NO I18N
            let buttonToShow = desc ? '#reply-assist-append' : '#reply-assist-movetoeditor';    //NO I18N
            replyAssistResultDropDownElement.find(buttonToShow).removeClass('hide')
                .off('click.reply-assist-buttons')  //NO I18N
                .on('click.reply-assist-buttons', function () {
                    $platformai_reply_assist.insertTextinZEditor(resultText, replyAssistResultDropdownCallbackMethod);
                });
            replyAssistResultDropDownElement.find(buttonToHide).addClass('hide');

            //Hide Replace button
            replyAssistResultDropDownElement.find('#reply-assist-replace').addClass('hide');

            //Show Move to top button if description is not empty
            if (desc) {
                replyAssistResultDropDownElement.find('#reply-assist-movetotop').removeClass('hide')
                    .off('click.reply-assist-movetotop')  //NO I18N
                    .on('click.reply-assist-movetotop', function () {
                        $platformai_reply_assist.moveToTop(resultText, replyAssistResultDropdownCallbackMethod);
                    });
            } else {
                //Hide Move to top button if description is empty
                replyAssistResultDropDownElement.find('#reply-assist-movetotop').addClass('hide');
            }
        }

        //Close Button
        replyAssistResultDropDownElement.find('#reply-assist-close')
            .removeClass('hide')
            .off('click.reply-assist-close').on('click.reply-assist-close', function (evt) {    //NO I18N
                replyAssistResultDropdownCallbackMethod.destroy();
                jQuery(holder).removeClass('rply-assist-active');
            });

        //Back Button
        replyAssistResultDropDownElement.find('#reply-assist-back')
            .removeClass('hide')
            .off('click.reply-assist-back').on('click.reply-assist-back', function (evt) {  //NO I18N
                replyAssistResultDropdownCallbackMethod.destroy();
                $platformai_reply_assist.constructDropdown(holder, notificationType, text);

            });

        //Copy Icon
        replyAssistResultDropDownElement.find('#reply-assist-copy')
            .off('click.reply-assist-copy').on('click.reply-assist-copy', function () { //NO I18N
                let tempTextarea = jQuery('<textarea>');
                replyAssistResultDropDownElement.append(tempTextarea);
                tempTextarea.val(resultText).select();
                let result = document.execCommand('copy'); // No I18N
                tempTextarea.remove();
                if (result) {
                    showalert('success', translate("msteams.copied"), 'isAutoHide=true'); //NO I18N
                }
            });

        //Regenerate Button
        replyAssistResultDropDownElement.find('#reply-assist-regenerate')
            .off('click.reply-assist-regenerate').on('click.reply-assist-regenerate', function () { //NO I18N
                replyAssistResultDropdownCallbackMethod.destroy();
                //For rephrase category, the result text will be sent again for rephrasing
                let textToBeRegenerated = category === 'rephrase' ? resultText : text;  //NO I18N
                $platformai_reply_assist.generateResponse(isTextSelected, textToBeRegenerated, category, holder, replyAssistContainerId, replyAssistContainer, true);
            });

    },
    /**
     * Method to insert the text in the ZEditor
     * Used while using Append/Replace/Move to Editor options
     * @param {String} text - text to be inserted in the ZEditor
     * @param {callbackMethods} dropdownCallBackMethod - Dropdown callback method to destroy the dropdown
     */
    insertTextinZEditor: function (text, dropdownCallBackMethod) {
        let _self = this;
        if (_self.replyEditor.doc) {
            _self.replyEditor.doc.execCommand('insertText', false, text);  //NO I18N
            _self.replyEditor.saveCurrentState();

            // Focus the editor
            jQuery(_self.replyEditor.doc).find('body').focus();

            dropdownCallBackMethod.destroy();
        }
    },
    /**
     * Method to append the text after the selected text in the ZEditor
     * @param {String} text - text to be appended after the selected text
     * @param {callbackMethods} dropdownCallBackMethod - Dropdown callback method to destroy the dropdown
     */
    appendAfterSelectedText: function (text, dropdownCallBackMethod) {
        let _self = this;
        if (_self.replyEditor.doc && _self.replyEditor.win) {
            let zEditorWindow = _self.replyEditor.win;
            let zEditorDoc = _self.replyEditor.doc;
            let selection = zEditorWindow.getSelection();
            if (selection.rangeCount > 0) {
                // Save the selected text and the range
                let range = selection.getRangeAt(0);
                let endOffset = range.endOffset;
                let endContainer = range.endContainer;

                //Remove the current selection
                selection.removeAllRanges();

                //Place the cursor at the end of the selection
                let newRange = zEditorDoc.createRange();
                newRange.setStart(endContainer, endOffset);
                newRange.collapse(true);
                selection.addRange(newRange);
            }

            // Focus the editor
            jQuery(_self.replyEditor.doc).find('body').focus();

            //Insert the text after the selected text
            zEditorDoc.execCommand('insertText', false, text);  //NO I18N
            _self.replyEditor.saveCurrentState();

            dropdownCallBackMethod.destroy();
        }
    },
    /**
     * Method to append the text to starting of the ZEditor
     * @param {String} text - text to be inserted at the starting of the ZEditor
     * @param {callbackMethods} dropdownCallBackMethod - Dropdown callback method to destroy the dropdown
     */
    moveToTop: function (text, dropdownCallBackMethod) {
        let _self = this;
        if (_self.replyEditor.doc && _self.replyEditor.win) {
            let zEditorWindow = _self.replyEditor.win;
            let zEditorDoc = _self.replyEditor.doc;

            // Move the cursor to the start
            let range = zEditorDoc.createRange();
            let selection = zEditorWindow.getSelection();

            // Set range to the start of the editor
            range.setStart(range.endContainer, 0);
            range.setEnd(range.endContainer, 0);

            // Remove all existing selections
            selection.removeAllRanges();

            // Add the new range (which moves the cursor)
            selection.addRange(range);

            // Focus the editor
            jQuery(_self.replyEditor.doc).find('body').focus();

            // Insert the text at the starting of the editor
            zEditorDoc.execCommand('insertText', false, text);  //NO I18N
            _self.replyEditor.saveCurrentState();

            dropdownCallBackMethod.destroy();
        }
    }
};