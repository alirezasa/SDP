var $platformai_summary = {
    /**
     * Render the Summary option in the Request Details page
     */
    showOption: function () {
        renderhbs('#platformai-request-summary', 'platformai_summary', {}, false, "common");  //NO I18N
        $platformai_summary.init();
    },
    /**
     * To initialize the events for the Summary option in the Request Details page
     * Show Summary - To show the summary of the request using platform_ai API
     * Hide Summary - To hide the summary of the request
     */
    init: function () {
        var showSummaryButton = jQuery('#platformai-show-summary');

        var resultSummarySection = jQuery('#platformai-result-summary-section');
        var isSummarizedAlready = false;
        showSummaryButton.off('click.platformai-show-summary').on('click.platformai-show-summary', function () {    //NO I18N
            showSummaryButton.parent().addClass('hide');
            resultSummarySection.removeClass('hide');

            if (!isSummarizedAlready) {
                resultSummarySection.find('#platformai-summary-process-div').removeClass('hide');
                resultSummarySection.find('#platformai-summary-show-div').addClass('hide');

                var input_data = { "platform_ai": { "workorderid": $req.details.request_info.id } };    //NO I18N
                sdpAjax({
                    url: '/api/v3/platform_ai/_request_summarization',   //NO I18N
                    type: 'POST', // No I18N
                    data: sdpAjaxInputData(input_data),
                    success: function (response) {
                        $platformai_summary.showResult(resultSummarySection, response);
                        isSummarizedAlready = true;
                    },
                    error: function (response) {
                        showalert('failure', response.responseJSON.response_status.messages[0].message, 'isAutoHide=false'); //No I18N
                        resultSummarySection.find('#platformai-hide-summary').trigger('click.platformai-hide-summary');
                    }
                });
            } else {
                $platformai_summary.showResult(resultSummarySection);
            }
        });
        resultSummarySection.find('#platformai-hide-summary, #platformai-close-summary').off('.platformai-hide-summary').on('click.platformai-hide-summary', function () {  //NO I18N
            showSummaryButton.parent().removeClass('hide');
            resultSummarySection.addClass('hide');
        });
    },
    /**
     * Show the Summary of the request after getting the response or either already summarized
     * @param {Element} resultSummarySection - The section where the summary result need to be shown
     * @param {Object} response - The response from the platform_ai API
     */
    showResult: function (resultSummarySection, response) {
        resultSummarySection.find('#platformai-summary-process-div').addClass('hide');
        resultSummarySection.find('#platformai-summary-show-div').removeClass('hide');
        if (response) {
            resultSummarySection.find('#platformai-result-summary').html(encodeHTML(response.platform_ai.query_response).replaceAll('&#xa;', '<br>'));
        }
    }
};
