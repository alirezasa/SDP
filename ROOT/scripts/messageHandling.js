var messageHandling = {
    messages : {
        4001: "api.error.input.not.exist",
        4002: "api.forbidden.error",
        4003: "api.closure.rule.violation",
        4004: "sdp.api.internalerror",
        4005: "api.cannot.delete.used.in.somewhere",
        4007: "api.invalid.url.or.resource",
        4008: "api.not.unique",
        4009: "api.editing.non.editable.field",
        4010: "api.editing.internal.field",
        4011: "api.no.such.field",
        4012: "api.mandatory.field.novalue",
        4013: "api.unsupported.content.type",
        4014: "api.editing.readonly.field",
        4015: "api.limit.reached",
        4016: "api.time.mismatch",
        4017: "api.not.in.trash",
        4018: "api.add.record.limit.reached",
        4019: "api.user.not.authorized",
        4021: "api.datatype.mismatch",
        4022: "admin.DCServerSettingsAction.apifailure.message",
        7001: "api.license.notSupported.module"
    },
    summary: {
        noOfRecords: 0,
        noOfRecordsUpdated: 0,
        noOfRecordsFailed: 0,
        failedRecords: [],
        reset: function() {
            this.noOfRecords = this.noOfRecordsUpdated = this.noOfRecordsFailed = 0;
            this.failedRecords = [];
        }
    },
    getMessages: function (module, entity) {
        return {
            noOfRecordsUpdatedMsg: translate("ae.noOf.records.updated", [module]),
            noOfRecordsFailedMsg: translate("ae.noOf.records.failed", [module]),
            entity: entity
        }
    },
    //returns the display name for the given field when there is field match found in the given metainfo.
    //can't use this function when two fields(from different parent or different area of the metaInfo) share the same key name in the given metaInfo.
    getDisplayValue: function (metaInfo, field) {
        var self = messageHandling;
        if (metaInfo.hasOwnProperty(field)) {
            return metaInfo[field].display_name;
        }
        for (var fieldKey in metaInfo) {
            if (metaInfo[fieldKey].hasOwnProperty("fields")) {
                var displayName = self.getDisplayValue(metaInfo[fieldKey].fields, field);
                if (displayName) {
                    return displayName;
                }
            }
        }
    },
    updateFailureSummary: function(options, userIDs) {
        var responseStatus = options.response.responseJSON.response_status;
        var failedRecords = [];
        var noOfRecords = responseStatus.length;
        var records = options.records;
        var metaInfo = options.metainfo;

        function getMsgDetail(messageObj, name) {
            var getDisplayName = typeof options.getDisplayValue === "function" ? options.getDisplayValue : messageHandling.getDisplayValue;
            var display_name = getDisplayName(metaInfo, messageObj.field) || messageObj.field;
            return {
                name: name,
                message: messageHandling.getMessageByStatusCode(messageObj, display_name)
            };
        }

        if(jQuery.isPlainObject(responseStatus)) {
            if(userIDs.length > 1) {
                return;
            }
            noOfRecords = userIDs.length;
            var msg = responseStatus.messages;
            if(msg) {
                failedRecords.push(getMsgDetail(msg[0], records[userIDs[0]].name));
            }
        } else {
            //add failure status messages to the failed records.
            for(var i = 0; i < noOfRecords; i++) {
                if (responseStatus[i].status === "failed") {
                    var status = responseStatus[i];
                    var name = records[status.id].name;
                    for(var j = 0, n = status.messages.length; j < n; j++) {
                        failedRecords.push(getMsgDetail(status.messages[j], name));
                    }
                }
            }
        }
        this.summary.noOfRecords += noOfRecords;
        this.summary.noOfRecordsUpdated += noOfRecords - failedRecords.length;
        this.summary.noOfRecordsFailed += failedRecords.length;
        this.summary.failedRecords = this.summary.failedRecords.concat(failedRecords);
    },
    getMessageByStatusCode: function(messageObj, params) {
        if(messageObj.message) {
            return messageObj.message + (params ? " - "  + params : "");
        }
        var msg = this.messages[messageObj.status_code];
        var sdtranslate = (typeof translate === "function") ? translate : translate;
        return msg ? sdtranslate(msg, params) : sdtranslate("sdp.api.unknown.error");
    }
};
