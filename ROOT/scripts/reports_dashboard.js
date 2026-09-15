/* Method for Report Char Click redirects to List View Of respective module */
const chartClick = (zcData) => {
    /* Report ID */
    const reportId = String(zcData[0].reportId);
    const isAPISupported = zcData[0].isAPISupported ? zcData[0].isAPISupported : false;
    let chartXCol;
    let chartYCol;
    let chartXVal;
    let chartYVal;
    let chartColumns = [];
    let chartValues = [];
    const otherNegate = zcData[0].otherNegate;
    const len = zcData.length;
    for (let i = 0; i < len; i++) {
        const data = zcData[i];
        const columnName = data.columnname;
        const columnValue = data.value;
        if (columnName != getMessageForKey('sdp.reports.customReport.reportcount') && columnName != undefined) {
            if (!chartColumns.includes(columnName)) {
                chartColumns.push(columnName);
                chartValues.push(columnValue);
            }
        }
    }
    chartXCol = chartColumns[0];
    chartXVal = chartValues[0];
    chartYCol = chartColumns[1];
    chartYVal = chartValues[1];
    const newUrl = '/servlet/AJaxServlet';//No i18N
    let reportfilters;
    let data = {
        action: 'getCustomReportFilters', //No i18N
        reportID: reportId != null && reportId != String("null") ? reportId : 0, // No i18n
        isAPISupported: isAPISupported,
        previousConfig: sdpToJSON(parent.previousConfig),
        chartXCol: chartXCol,
        chartYCol: chartYCol,
        chartXVal: chartXVal,
        chartYVal: chartYVal,
        otherNegate: otherNegate.join(":;") //No i18n
    };
    sdpAjax({
        async: false,
        url: newUrl,
        type: 'get',//NO I18N
        data: data,
        success: (resp) => {
            reportfilters = resp;
        }
    });
    if (reportfilters != null && reportfilters != undefined) {
        if (isAPISupported) {
            const search_criteria = zcData[0].search_criteria;
            if (Array.isArray(search_criteria)) {
                if (reportfilters.customReportFilters.list_info.search_criteria.children) {
                    reportfilters.customReportFilters.list_info.search_criteria.children.push(...search_criteria);
                } else {
                    reportfilters.customReportFilters.list_info.search_criteria.children = search_criteria;
                }
            }
        }
        /* Report Details*/
        const moduleName = "module=" + reportfilters.module; //No i18n
        /* criteria from reportCriteria*/
        const input_data = reportfilters.customReportFilters;
        const title = reportfilters.title;
        let url = "/ui/load_list?"; //No I18N
        url += moduleName;
        if ("assets" == reportfilters.module) {
            url += "&entity=assets"; // No I18N
        }
        if (reportfilters.entity) {
            url += "&entity=" + reportfilters.entity; // No I18N
        }
        isMSP && handleInputDataForMSP(input_data);
        url = url + "&input_data=" + encodeURIComponent(sdpToJSON(input_data)); //No I18N
        // SD-124856 - If the chart are added as embedded frame, then open the list view in new tab
        if (getSDPURLParams().externalframe == 'true') {
            window.open(url,'_blank', 'noopener,noreferrer');
        } else {
            let options = { refreshBtn: jQuery(event.target).parents("li.widgets").find("#instantRefresh") }; //No i18n
            options.closeCB = function() {
                options.refreshBtn.trigger("click");
            }
            listview_popup.render(url, title, options);
        }
    }
}