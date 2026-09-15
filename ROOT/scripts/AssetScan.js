var assetScan = {
    scanStatuses: null,
    scan: null,
    audit_token_id: -1,
    statusId: -1,

    statusColor: {
        "ONGOING": {//No I18N
            completed: "#ff9400",//No I18N
            remaining: "#ffe2c0" //No I18N
        },
        "SUCCESS": {//No I18N
            completed: "#01c654",//No I18N
            remaining: "#a0ee70" //No I18N
        },
        "FAILED": {//No I18N
            completed: "#fd5a57",//No I18N
            remaining: "#f4bcbe" //No I18N
        },
        "AGENT_NOT_INSTALLED": {//No I18N
            completed: "#ad48ad",//No I18N
            remaining: "#f1daf2" //No I18N
        },
        "AGENT_DOWN": {//No I18N
            completed: "#fd5a57", //No I18N
            remaining: "#f4bcbe" //No I18N
        },
        "SCAN_EXCLUDED": {//No I18N
            completed: "#fd5a57",//No I18N
            remaining: "#f4bcbe" //No I18N
        },
        "SCAN_DISABLED": {//No I18N
            completed: "#fd5a57",//No I18N
            remaining: "#f4bcbe" //No I18N
        },
        "SCAN_ALREADY_INITIATED": {//No I18N
            completed: "#fd5a57",//No I18N
            remaining: "#f4bcbe" //No I18N
        },
        "default": {//No I18N
            completed: "#999",//default //No I18N
            remaining: "#cecece" //No I18N
        }
    },
    setHeight: function() {
        windowHeight = jQuery(window).innerHeight() - jQuery('.widget-box .row>.p0').offset().top;
        jQuery('.widget-box .row [data-id=assetscan-left]').css('height', windowHeight);//No I18N
        jQuery('[data-id=aecnf-content]').css('height', (windowHeight-48));//No I18N
    },

    /* loads and updates network/domain scan statuses every 2 seconds
       *@param type: scan type e.g. networks, domains...
       *@param id: scan id e.g. network/domain id.
     */
    getIdforStatus: function(status){
        var statusid = "";
                sdpAjax({
                    url: "/api/v3/scanstatuses", //No I18N
                    data: sdpAjaxInputData({
                        list_info: { row_count: 100,
                                     search_criteria: {"field" : "status", "condition" : "is", "value" : status }} //No I18N
                    }),
                    async : false,
                    success : function(resp){
                        statusid = resp.scanstatuses[0].id;
                    }
        });
        return statusid;
    },
    init: function (options) {
        var self = this;
        var type = options.type;
        var id = options.id;
        var success_id = self.getIdforStatus("SUCCESS"); //No I18N
        var failed_id = self.getIdforStatus("FAILED"); //No I18N
        var defaultScanStatuses = [
            { display_name: translate("sdp.common.success"),  id: success_id,  is_final_state: true,  status: "SUCCESS" },   //No I18N
            { display_name: translate("sdp.common.failed"), id: failed_id, is_final_state: true, status: "FAILED"}   //No I18N
        ]

        if (type === "networks") {
            self.setTitle(translate("common.networkscan"));
        } else if (type === "domains") {//No I18N
            self.setTitle(getMessageForKey("sdp.admin.leftpanel.assetmgmt.scan.home"));
        }

        jQuery(window).resize(function() {
            self.setHeight();
        });

        self.setHeight();

        self.audit_token_id = options.auditTokenId;
        self.lastScanTotalCount = options.lastScanTotalCount;

        //updating default value in the UI as sometimes it may take long time to get the response first time for some scan type like "domain scan".
        self.updateMainChart(null, 0);//No I18N
        self.updateScanStatuses(0, defaultScanStatuses, { [success_id] : 0, [failed_id]: 0 });

        this.loadScanStatusAjax(type, id);

        jQuery("#asset_status_details").scroll(function(event) {
            var element = jQuery(event.target);
            var div = element[0];

            if (div.clientHeight < div.scrollHeight && (div.scrollHeight - element.scrollTop()) - element.outerHeight() < 10) { //scrolled to bottom
                self.updateAssetStatusInfo();
            }
        });
    },
    getStatus: function(scanStatus){
        var scanStatuses = assetScan.scanStatuses
        for(id in scanStatuses){
            var status = scanStatuses[id];
            if(status.status === scanStatus) {
                return status.id;
            }
        }
    },
    canShowStatus: function (status, count) {
        var statuses = this.visibleStatuses = this.visibleStatuses || {};
        var currentTime = new Date();
        var previousTime = statuses[status];

        if (status === "SUCCESS" || status === "FAILED") {
            return true;
        }

        if (count === 0) {
            if (previousTime) {
                //if already visible, keep showing the status for 5 seconds.
                return (currentTime - previousTime) < 5000;
            }
        } else {
            statuses[status] = currentTime;
            return true;
        }

        return false;
    },
    loadScanStatusAjax: function(type, id) {
        var self = assetScan;
        var isTypeScan = type !== "null"; //if type is "null" then it's a group scan otherwise network scan or an domain scan.//No I18N
        var summaryAPIURL = isTypeScan ? type + "/" + id + "/" : "";//No I18N

        summaryAPIURL += "scans/" + self.audit_token_id;//No I18N

        function updateScanDetails (scan, scanStatuses) {
            var scanSummary = scan.scan_summary;
            var totalCount = scan.total_count;
            var scannedCount = scan.in_progress;
            var isCompleted = scan.scan_status == 'COMPLETED' || (totalCount != '0' && scannedCount  == totalCount && scanSummary[self.getStatus("ONGOING")] === 0); //no i18n

            self.updateScanStatuses(scannedCount, scanStatuses, scanSummary);
            self.updateMainChart(totalCount, scannedCount);
            if(type == 'domains'){
                scan.is_dc_configured = true; //domain scan proceeds only if dc is configured
                scan.is_dc_compatible = true;
            }
            //show warning messages
            jQuery('#dc_nt_cnfg').toggleClass('hide', scan.is_dc_configured);//No I18N
            jQuery('#dc_user_nt_available').toggleClass('hide', !scan.is_user_available_in_dc);//No I18N
            jQuery('#dc_nt_compatible').toggleClass('hide', scan.is_dc_compatible);//No I18N
            if(isCompleted) {
                jQuery("#scan_status").text(translate("sdp.admin.statusDef.complete"));
                clearTimeout(assetScan.timer);//stop everything once the scan is completed.
            }
        }

        function getData(callback) {
            var getTotalCount = isTypeScan ? sdpAjax({ url: "/api/v3/" + type + "/" + id }) : {}; //No I18N
            var ajaxCalls = [
                sdpAjax({ url: "/api/v3/" + summaryAPIURL }), //No I18N
                sdpAjax({
                    url: "/api/v3/scanstatuses", //No I18N
                    data: sdpAjaxInputData({
                        list_info: { row_count: 100 }
                    })
                })
            ];


            if(type !== "null") {
                ajaxCalls.push(getTotalCount);
            }

            jQuery.when.apply(undefined, ajaxCalls).then(callback);
        }

        getData(function (summaryDetails, scanStatusDetails, scanTypeResponse) {
            var field = type.substring(0, type.length - 1); //remove last char s form type e.g "networks" => "network". //No I18N
            var scanStatuses = scanStatusDetails[0].scanstatuses;
            var scan = summaryDetails[0].scan;
            var scanTypeDetails = isTypeScan ? scanTypeResponse[0][field] : {};

            self.scanStatuses = scanStatuses;

            updateScanDetails(scan, scanStatuses, scanTypeDetails);

            self.timer = setInterval(function() {
                sdpAjax({ url: "/api/v3/" + summaryAPIURL }).then(function (response) {//No I18n
                    var scan = response.scan;
                    updateScanDetails(scan, scanStatuses, scanTypeDetails);
                })
            }, 2000);//update details every 2 sec.

            //show scan type title.
            if (type === "networks") {
                var ipRange = " [" + e_html(scanTypeDetails.from_ip_address + " - " + scanTypeDetails.to_ip_address) + "]";
                jQuery("#scan_type_sec_title").text(ipRange);
            } else if(type === "domains") {//No I18n
                jQuery("#scan_type_sec_title").text(scanTypeDetails.name); //add domain name.
            }
        });
    },
    setTitle: function (title) {
        jQuery("#scan_type_title").text(title);
    },

    isInitialized: false,
    updateMainChart: function(total, completed) {
        var percentage = this.getPercentage(total || 1, completed),
            data = [percentage.completed, percentage.remaining],
            text = completed;

        if(this.isInitialized) {
            donutChart.update(data, text);
        } else {
            this.isInitialized = true;
            donutChart.init("firstchart", data, ["#3391ce", "#d9f0ff"], text);//No I18n
        }

        jQuery("#completed_status_count").text(completed);
        jQuery("#total_status_count").text(total || 0);
    },

    updateScanStatuses: function (totalCount, scanStatuses, scanSummary) {
        var self = this;
        var scanStatusMap, prevCount, container;

        scanStatusMap = {};
        prevCount = this.updateScanStatuses.prevCount = this.updateScanStatuses.prevCount || {};
        container = jQuery("#scan_statuses");

        scanStatuses.forEach(function (status) {
            scanStatusMap[status.id] = status;
        });

        //returns html for bar chart.
        function getHTML(statusId, status, displayName) {
            var color = self.statusColor[status];
            return '<li class="fl fw cur-ptr">' +
                '<a class="fl fw" role="tab" data-id="scanstatusload" data-statusid=' + statusId + ' data-name='+ displayName + '>' +
                '<div class="text-danger mb5">' + displayName + '&nbsp;(<span id="status_count' + statusId + '"></span>)</div>' +
                '<div style="background-color: ' + color.remaining + '">' +
                            '<div id="scan_status_' + status + '" style="width: 0%;height: 10px; transition: 1s;background-color: ' + color.completed + ';"></div>' +
                '</div>' +
                '</a>' +
                '</li>';
        }

        for (var statusId in scanSummary) {
            var count = scanSummary[statusId] || 0;
            var scanStatus = scanStatusMap[statusId];
            var status = scanStatus.status;
            var id = "scan_status_" + status; //No I18N
            var statusCompletedElement = jQuery("#" + id);
            var percentage = self.getPercentage(totalCount, count);

            //load more items if the content is not overflowed so that user can load more item using lazy loading later.
            if(self.activeStatus == statusId) {
                var element = document.getElementById("asset_status_details");
                if (element.offsetHeight === element.scrollHeight && count > 0) {//to check overflow of the item.
                    jQuery("#no_asset_msg").hide();
                    assetScan.updateAssetStatusInfo();
                }
                jQuery("#current_status_count").text(count); //update active status count in the title of right side status panel.
            }

            statusCompletedElement.width(percentage.completed + "%");

            if(prevCount[status] === count) { //no need to update the status count if it is not changed.
                continue;
            }

            jQuery("#status_count" + statusId).text(count);


            prevCount[status] = scanSummary[statusId];

            if (count === 0 && !this.canShowStatus(status, count)) {
                statusCompletedElement.closest("li").slideUp().find('[role="tab"]').trigger("click");//No I18N
                continue;
            } else {
                statusCompletedElement.closest("li").slideDown();//No I18N
            }

            //insert html for the first time.
            if(!statusCompletedElement.length) {
                var displayName = scanStatus.display_name;
                var html = getHTML(e_html(statusId), status, e_html(displayName));
                container.append(html);//update all scan status in left panel.
                statusCompletedElement = jQuery("#" + id);
                jQuery("#status_count" + statusId).text(count);
            }
        }


        //select a status for the first time where no status is selected to view the assets for a status.
        if( !container.find(".active").length ) {
            jQuery("#scan_status_FAILED").trigger("click");
        }
    },

    getPercentage: function(totalCount, count) {
        var completed = parseInt(count) * 100 / totalCount;

        return {
            completed: completed,
            remaining: 100 - completed
        }
    },

    updateStatusDetails: function(statusId, title) {
        var container = jQuery("#current_status_container");
        var count = jQuery("#status_count" + statusId).text();
        this.jobStartIndex = {}; //to maintain startIndex of each status call
        

        this.statusId = statusId;
        this.activeStatus = statusId;
        container.empty();

        jQuery("#current_status_title").text(title);
        jQuery("#current_status_count").text(count);

        if(!isInteger(this.updateAssetStatusInfo.startIndex) || count !== "0") {
            this.updateAssetStatusInfo.startIndex = 1;//resetting start index
        }

        if(count !== "0") {
            this.updateAssetStatusInfo();
        } else {
            var msg = '<li class="p15 pl0" id="no_asset_msg">' + translate("dc.no.asset.found") + '</li>';
            container.html(msg);
        }
    },

    updateAssetStatusInfo: function() {
        var data = {list_info: {row_count: 25, start_index: this.updateAssetStatusInfo.startIndex, search_criteria: [{"field" : "status.id","condition" : "is","value": this.activeStatus},{"field" : "audit_token_id","condition" : "is","value": this.audit_token_id,"logical_operator":"AND"}]}};//No I18N
        this.jobStartIndex[data.start_index] = false;
        
        sdpAjax({
            url: "/api/v3/scanjobs", //No I18N
            data: sdpAjaxInputData(data),
            type: "GET", //No I18N
            success: this.appendAssetHTML
        });
    },

    appendAssetHTML: function(response) {
        var jobs = response.scanjobs;
        var self = assetScan;
        var container = jQuery("#current_status_container");
        var statusDataHtml = [];
        
        var jobStartIndex = self.jobStartIndex;
        var startIndex = response.list_info.start_index;

        if (self.jobStartIndex[startIndex]) {
            return false;//already appended the call
        }

        jobStartIndex[startIndex] = true;
        jobs.forEach(function(job) {
            var resName = job.resource_name;
            var msg = job.status.status === "FAILED" && job.error_message ? e_html(job.error_message) : "";//No I18N
            var errorLink = "";

            if (job.error_link) {
                errorLink = "<a target='_blank' rel='noopener noreferrer' href='" +e_html(job.error_link) + "'>" + translate("sdp.admin.troubleshoot.title") + "</a>";
            }

            msg += errorLink;

            var html = '<li class="p15 pl0"><span>' + e_html(resName) + '</span><p class="text-muted m0 mt5">' + msg + '</p></li>';
            statusDataHtml.push(html);
        });

        if(jobs.length) {
            self.updateAssetStatusInfo.startIndex += jobs.length;
            container.append(statusDataHtml);
        }
    }
};


var donutChart = {
    init: function (id, data, color, text) {
        var width = 200,
            height = 200,
            margin = 28,
                radius = Math.min(width, height) / 2 - margin;

            var color = d3.scaleOrdinal().range(color);
            var arc = this.arc = d3.arc().outerRadius(radius - 10).innerRadius(100);

            this.pie = d3.pie().sort(null).value(function (d) { return d; });//sorting value to increase chart

            var svg = d3.select("#" + id).append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            var g = svg.selectAll(".arc").data(this.pie(data)).enter().append("g").attr("class", "arc"); //No I18n

            this.path = g.append("path"); //No I18n
            this.path.attr("d", arc).transition().duration(0).attrTween("d", this.arcTween).style("fill", function (d) { //No I18n
                return color(d.data);
            });

            this.text = svg.append("text").attr("text-anchor", "middle").attr('font-size', '21px').attr('y', 10); //No I18n
        this.text.text(text);
    },
    update: function(data, text) {
        var arc = this.arc;
        this.path.data(this.pie(data)).attr("d", arc).transition().duration(300).attrTween("d", this.arcTween); //No I18n
        this.text.text(text);
    },
    arcTween: function(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return donutChart.arc(i(t));
        };
    }
};


