let classActivePreviousId = null;
let totalNotificationCount = 0;
let notificationSearchText = null;
let openedSliderId = -1;
var openedDialogNotificationID = null;
let isAnnounceDialogOpened = false;
let $notif = jQuery("#Notifications"); //NO I18N
let $notifContainer = null;
let hasMoreRows = true;
let selectEle = null;

/* function to change unread status to read status for only account locked notification */

var $bellNotifications = {
    init : function(){
        sdpAjax({
            type: 'GET', //NO I18N
            url: '/api/v3/user_notifications', //NO I18N
            success : function(responseObj){
                const notifLength = responseObj.user_notifications.length;
                $bellNotifications.setTotalNotificationCount(notifLength); 
            }
        })
    },
    handleToggle: function() {
        let toggledata = {};
        const doNotDisturb = jQuery('#dnd:checked').val() === 'on'; // No I18N
        toggledata.is_enabled = doNotDisturb;
        jQuery('#dndIcon').toggleClass('default-fill', !doNotDisturb).toggleClass('thmicon-fill', doNotDisturb); //NO I18N
        jQuery('#doNotDisturbToggle').attr('title', translate(doNotDisturb ? 'bell.disturb.enabled' : 'bell.disturb.disabled')); // No I18N
        ClientUtil.addUserPersonalization("dont_disturb_controller", toggledata); //No I18N
      },
    mark_as_read: function(id, event) {
        $bellNotifications.mark_as_read(id, event, fal);
    },
    mark_as_read: function(id, event, skipalert) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
        sdpAjax({
            type: 'PUT', //NO I18N
            url: '/api/v3/user_notifications/' + id + '/_mark_as_read', //NO I18N
            success: function(responseJson) {
                let $obj = $notifContainer.find('[data-id=' + id + ']'); //NO I18N
                if (!skipalert) {
                    window.showalert('success', translate("api.updated.success",[translate("common.notification")]), 'isAutoHide=true,width=auto'); //NO I18N
                }
                $obj.removeClass('highlight').end().find('#mark_as_read_unread').attr('title', translate("mark.as.unread")); //NO I18N
                $obj.find('#mark_as_read_unread').attr('data-handler', "$bellNotifications.mark_as_unread('" + id + "',event)"); //NO I18N
                $obj.find('#mark_as_read_unread').find('#readUnreadBtn').removeClass('m-read').addClass('m-unread'); //NO I18N
                $bellNotifications.updateLocalHbsRenderedData(id, true);
            }
        });
    },
    sortNotifications: function() {
        $bellNotifications.getNotificationApi();
    },
    changeSortNotificationOrder: function() {
        let sortType = jQuery('#changeSortNotificationOrder').attr('value') === '0' ? '1' : '0'; //NO I18N
        let sortText = sortType === '0' ? translate('bell.sort.recent') : translate('bell.sort.older'); //NO I18N
        const $span = jQuery('#changeSortNotificationOrder span.cspr'); //NO I18N
        $span.toggleClass('asc', sortType == '0').toggleClass('desc1', sortType == '1'); //NO I18N

        jQuery('#changeSortNotificationOrder').attr({ //NO I18N
            'value': sortType, //NO I18N
            'title': sortText //NO I18N
        });
        $bellNotifications.getNotificationApi();
    },
    sortNotificationsByModule: function() {
        $bellNotifications.getNotificationApi();
    },
    mark_as_unread: function(id, event) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
        sdpAjax({
            type: 'PUT', //NO I18N
            url: '/api/v3/user_notifications/' + id + '/_mark_as_unread', //NO I18N
            success: function(responseJson) {
                var $obj = $notifContainer.find('[data-id=' + id + ']'); //NO I18N
                window.showalert('success', translate("api.updated.success",[translate("common.notification")]), 'isAutoHide=true,width=auto'); //NO I18N
                $obj.addClass('highlight').end().find('#mark_as_read_unread').attr('title', translate("mark.as.read")); //NO I18N
                $obj.find('#mark_as_read_unread').attr('data-handler', "$bellNotifications.mark_as_read('" + id + "',event)"); //NO I18N
                $obj.find('#mark_as_read_unread').find('#readUnreadBtn').removeClass('m-unread').addClass('m-read'); //NO I18N
                $bellNotifications.updateLocalHbsRenderedData(id, false);
            }
        });
    },
    enhancedSearchCriteria: function(currentVal) {
        notificationSearchText = currentVal.length > 0 ? currentVal : null;
        $bellNotifications.getNotificationApi();
    },
    defaultSearchCriteriaforText: function(value, field) {
        let defaultCriteria = [{
                "field": "owner.name", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or" //NO I18N
            },
            {
                "field": "type", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or" //NO I18N
            }
        ];

        if (field == 'is_read') { //NO I18N
            defaultCriteria.push({
                "field": "module", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or"  //NO I18N
            });
        }
        return defaultCriteria;
    },
    defaultSearchCriteriaforNum: function(value, field) {
        var defaultCriteria = [{
                "field": "module_id", //NO I18N
                "value": value, //NO I18N
                "condition": "is", //NO I18N
                "logical_operator": "or" //NO I18N
            },
            {
                "field": "owner.name", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or" //NO I18N
            },
            {
                "field": "type", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or" //NO I18N
            }
        ]

        if (field === 'is_read') { //NO I18N
            defaultCriteria.push({
                "field": "module", //NO I18N
                "value": value, //NO I18N
                "condition": "contains", //NO I18N
                "logical_operator": "or" //NO I18N
            }); 
        }
        return defaultCriteria;
    },
    removeHighlight: function(id) {
        $notifContainer.find('[data-id=' + id + ']').removeClass('highlight').end().find('#mark_as_read_unread').attr('title', translate("mark.as.unread")); //NO I18N
        const $obj = $notifContainer.find('[data-id=' + id + ']').find('#mark_as_read_unread'); //NO I18N
        const is_read = $obj.find('#readUnreadBtn').hasClass('m-uread'); //NO I18N
        if(!is_read){
            $notifContainer.find('[data-id=' + id + ']').find('#mark_as_read_unread').attr('onclick', "$bellNotifications.mark_as_unread('" + id + "',event)"); //NO I18N
            $notifContainer.find('[data-id=' + id + ']').find('#mark_as_read_unread').find('#readUnreadBtn').removeClass('m-read').addClass('m-unread'); //NO I18N
        }
    },
    notificationDetailsPreview: function(notifyurl, id, moduleName) {
        //to avoid multiple callbacks
        if(notifyurl == "License expired"){ //NO I18N
            showRestrictedNotificationAlert();
            return false;
        }
        const isCurrentSliderOpened = $notifContainer.find('[data-id=' + id + ']').hasClass('active'); //NO I18N
        if(isCurrentSliderOpened){
            return;
        }
        const urlParams = getSDPURLParams(notifyurl);
        const moduleId = urlParams.moduleId;
        const notifyType = urlParams.notifyType;
        const jsonData = {
            moduleId: moduleId,
            notifyType: notifyType,
            module: moduleName
        };

        sdpAjax({
            type : 'GET',//NO I18N
            dataType :'json',//NO I18N
            url: "/servlet/AJaxServlet?action=isBellNotifEntityExist", //NO I18N
            data: jsonData,
            success: function(data){
                const entityExists = data.message;
                const is_archeived = data.is_archieve_workorder;

                if(is_archeived && is_archeived != null && typeof is_archeived != 'undefined'){ //NO I18N
                    const destinationURL = '/DynamicNotification.do?method=redirectModuleUrl&moduleId='+moduleId+'&notifyType=req-assign&dynamicNotifId='+id; //NO I18N
                    window.open(destinationURL, '_blank'); //NO I18N
                    return;
                }
                if(entityExists){
                    $bellNotifications.handleTick(id);
                    let openDialog = $bellNotifications.getDialogOpenedStatuses();
                    if(openDialog.length != 0){
                        $bellNotifications.handleDynamicPopupNotifications(openDialog[0], id, 'slider');
                    }
                    $bellNotifications.setOpenedSliderID(id);
                    $notifContainer.find('[data-id=' + id + ']').removeClass("highlight").addClass("active"); //NO I18N
                    $notif.find("[data-action='close']").removeClass("disp-ib").addClass("vhide"); //NO I18N
                    $previewComponent.load(notifyurl + "&openInIframe=true", translate("common.details"), '70%', null, null, "module-preview", null, '100', "position:391px,freeze_index:100,loaderPos:40%,isFullPage:true,preview_ovr:box-shd-left,renderin_prev_frame:true,f_index:100,closecallback:$bellNotifications.removeTick"); //NO I18N
                    $bellNotifications.showCloseicon();
                    $bellNotifications.removeHighlight(id);
                    $bellNotifications.updateLocalHbsRenderedData(id, true);
                }else{
                    window.showalert('failure',translate("sdp.api.entity.donotexists"), 'isAutoHide=true,width=auto'); //NO I18N
                }

            }, error : function(err){
                window.showalert('failure',translate("sdp.api.entity.donotexists"), 'isAutoHide=true,width=auto'); //NO I18N
            }
        });

        jQuery('body').find("#freeze-layer").on("click", function(e) { //NO I18N
            e.preventDefault();
            $notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
            $previewComponent.closePreview("module-preview"); //NO I18N
            $bellNotifications.initActiveClass();
        });
    },
    removeTick: function() {
            $notifContainer.find(`[data-id=${openedSliderId}]`).toggleClass('active', openedSliderId < -1); //NO I18N
            $bellNotifications.initActiveClass();
            setTimeout(function() {
                //we need to make the changes here.
                const isDialogOpened = $bellNotifications.getDialogOpenedStatuses();
                const isPreviewSliderOpened = $bellNotifications.isPreviewSliderOpened();
                if(isDialogOpened.length == 0){
                    $notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide");
                }else if(isDialogOpened[0] === undefined && !isPreviewSliderOpened){
                    $notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide");
                }
                window.top.jQuery('body').focus(); //No I18N
            },100)
        },
    showCloseicon: function() {
        setTimeout(function() {
            jQuery("#module-preview").find("#module-preview_previewclose").on('click', function() { //NO I18N
                $notif.find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
                $notifContainer.find('[data-id=' + classActivePreviousId + ']').removeClass("active"); //NO I18N
                $bellNotifications.initActiveClass();
            });
        }, 1500);
    },
    SearchCriteriaConditions: function(list_info, field, value, condition) {
        if(value == undefined) return;
        const sort_module = jQuery('select#filter_notif option:selected').val(); //NO I18N
        if (notificationSearchText !== null && notificationSearchText !== "") {
            const searchCriteria = isNaN(notificationSearchText)
                ? $bellNotifications.defaultSearchCriteriaforText(notificationSearchText, field)
                : $bellNotifications.defaultSearchCriteriaforNum(notificationSearchText, field);
            const jsonObj = {
                field,
                value,
                condition,
                logical_operator: sort_module === 'all' ? 'or' : 'and' //NO I18N
            };
            searchCriteria.push(jsonObj);
            list_info.search_criteria = searchCriteria;
        } else {
            list_info.search_criteria = {
                field,
                value,
                condition
            };
        }
        return list_info;
    },    
    getNotificationTypeIcon: function(notiicationType) {
        let type = {
            'req-assign': 'cart-tckt', //NO I18N
            'notes-add': 'note-ylw', //NO I18N
            'user-merge': 'user-merge-md', //NO I18N
            'req-approval': 'time-log', //NO I18N
            'task-assign': 'user-note', //NO I18N
            'req-approved': 'success-green', //NO I18N
            'req-rejected': 'close-red-bg', //NO I18N
            'req-reply': 'mail-red', //NO I18N
            'PR-assign': 'pur-notify', //NO I18N
            'PR-approval': 'time-log', //NO I18N
            'PR-approved': 'success-green', //NO I18N
            'PR-rejected': 'close-red-bg', //NO I18N
            'PR-canceled': 'close-red-bg', //NO I18N
            'canceled': 'close-red-bg', //NO I18N
            'PO-canceled': 'close-red-bg', //NO I18N
            'account-locked': 'req-lock', //NO I18N
            'req-edit': 'cart-tckt', //NO I18N
            'req-share': 'cart-tckt', //No I18N
            'req-count': 'cart-tckt', //NO I18N
            'user-delete': 'user-notify', //NO I18N
            'tech-count': 'tech-notify', //NO I18N
            'user-count': 'success-green', //NO I18N
            'failed-user-count': 'close-red-bg', //NO I18N
            'domain-error': 'close-red-bg', //NO I18N
            'pwd-policy-mismatch': 'close-red-bg', //NO I18N
            'user-count-with-failure': 'close-red-bg', //NO I18N
            'azure-user-count':'success-green', //NO I18N
            'azure-user-delete': 'user-notify', //NO I18N
            'azure-req-count': 'user-notify', //NO I18N
            'azure-tech-count': 'tech-notify', //NO I18N
            'azure-failed-user-count': 'close-red-bg', //NO I18N
            'azure-user-count-failure': 'close-red-bg', //NO I18N
            'azure-domain-error': 'close-red-bg', //NO I18N
            'azure-pwd-policy-mismatch': 'close-red-bg', //NO I18N
            'azure-delta-req-count': 'user-notify', //NO I18N
            'azure-delta-tech-count': 'tech-notify', //NO I18N
            'broadcast_message': 'announcement', //No I18N
            'project-comment-mention': 'prj-notify', //No I18N
            'project-comment-reply': 'prj-notify', //No I18N
            'task-comment-mention': 'task-cmt-motify', //No I18N
            'task-comment-reply': 'task-cmt-motify', //No I18N
            'milestone-comment-mention': 'mile-st-notify', //No I18N
            'milestone-comment-reply': 'mile-st-notify', //No I18N
            'Loan-Expired': 'loan-exp', //No I18N
            'request-notes-mention': 'note-ylw', //No I18N
            'prob-note-mention': 'note-ylw', //No I18N
            'release-notes-mention': 'note-ylw', //No I18N
            'dept-association': 'user-assign', //No I18N
            'site-association': 'user-assign', //No I18N
            'zia-app-balanced': 'zia-noti', //NO I18N
            'zia-app-imbalanced': 'zia-noti', //NO I18N
            'zia-reopen-balanced': 'zia-noti', //NO I18N
            'zia-reopen-imbalanced': 'zia-noti', //NO I18N
            'zia-category-accuracy': 'zia-noti', //NO I18N
            'zia-template-accuracy': 'zia-noti', //NO I18N
            'zia-category-training': 'zia-noti', //NO I18N
            'zia-template-training': 'zia-noti', //NO I18N
            'zia-category-failure': 'zia-noti', //NO I18N
            'zia-template-failure': 'zia-noti', //NO I18N
            'zia-parser-training': 'zia-noti', //NO I18N
            'zia-parser-failure': 'zia-noti', //NO I18N
            'zia-parser-init-failure': 'zia-noti', //NO I18N
            'zia-prediction-dependency': 'zia-noti', //NO I18N
            'zia-approvalprediction-dependency': 'zia-noti', //NO I18N
            'zia-needmoreinfo-alert': 'zia-noti', //NO I18N
            'platformai-insufficient-quota': 'triangle-red  tf1-2', //NO I18N
            "Announcement_UPDATE": 'announcement', //NO I18N
            'Announcement_ADD': 'announcement', //NO I18N
            'integration-key-reassign': 'people-arrow', //NO I18N
            'integration-key-auto-assign': 'people-arrow', //NO I18N
            'integration-key-before-expiry': 'key-alert', //NO I18N
            'integration-key-after-expired': 'key-alert', //NO I18N
            'integration-key-assigned-role-delete': 'colored-trash', //NO I18N
            'mailfetching-connectivity-issue': 'mail-fetch', //NO I18N
            'mail-ews-o365-error': 'mail-fetch', //NO I18N
            'mailfetching-stopped': 'mail-fetch', //NO I18N
            'throttle-exceed': 'excl-mark-circle', //NO I18N
            'change-notes-mention':'th-change', //NO I18N
            'Booking-allocation':'loan-exp',//No I18N
            'change-services-modified':'hspr ri-change',//NO I18N
            'change-downtime-schedule-modified':'hspr ri-change',//NO I18N
            'change-incomingmail':'hspr ri-change',//NO I18N
            'change-assetsinvolved-modified':'hspr ri-change',//NO I18N
            'change-sla-violated':'hspr ri-change',//NO I18N
            'change-release-schedule-modified':'hspr ri-change',//NO I18N
            'change-release-actual-modified':'hspr ri-change',//NO I18N
            'change-approval-mail-sent':'hspr ri-change',//NO I18N
            'change-approvallevel-accepted':'hspr ri-change',//NO I18N
            'change-approvallevel-rejected':'hspr ri-change',//NO I18N
            'change-status-action-taken':'hspr ri-change',//NO I18N
            'change-emergency-services-modified':'hspr ri-change-emer',//NO I18N
            'change-emergency-downtime-schedule-modified':'hspr ri-change-emer',//NO I18N
            'change-emergency-incomingmail':'hspr ri-change-emer',//NO I18N
            'change-emergency-assetsinvolved-modified':'hspr ri-change-emer',//NO I18N
            'change-emergency-sla-violated':'hspr ri-change-emer',//NO I18N
            'change-emergency-release-schedule-modified':'hspr ri-change-emer',//NO I18N
            'change-emergency-release-actual-modified':'hspr ri-change-emer',//NO I18N
            'change-emergency-approval-mail-sent':'hspr ri-change-emer',//NO I18N
            'change-emergency-approvallevel-accepted':'hspr ri-change-emer',//NO I18N
            'change-emergency-approvallevel-rejected':'hspr ri-change-emer',//NO I18N
            'change-emergency-status-action-taken':'hspr ri-change-emer',//NO I18N
            'solution-comment-mention':'hspr ri-solutn',//NO I18N
            'solution-comment-reply':'hspr ri-solutn', //NO I18N
            'cmdb-post-migration-completed':'th-cmdb',  //NO I18N
            "cmdb-post-migration-started":'th-cmdb',    //NO I18N
            "cmdb-post-migration-failed":'th-cmdb'      //NO I18N
        };
        return type[notiicationType] ? type[notiicationType] : notiicationType;
    },
    getNotificationApi: function() {
        let list_info = {
            sort_field: "time", //NO I18N
            sort_order: jQuery('#changeSortNotificationOrder').attr('value') === '0' ? 'desc' : 'asc', //NO I18N
            row_count: 100,
            search_criteria: null
        };

        let sort_module = jQuery('#filter_notif').val(); //NO I18N
        sort_module = sort_module.length == 0 ? undefined : sort_module;

        if (sort_module != 'all') { //NO I18N
            list_info.search_criteria = [];
            const field = sort_module === 'unread' ? 'is_read' : 'module'; //NO I18N
            const value = sort_module === 'unread' ? false : sort_module; //NO I18N
            $bellNotifications.SearchCriteriaConditions(list_info, field, value, sort_module === 'unread' ? 'eq' : 'is'); //NO I18N
        } else if (notificationSearchText !== null) {
            list_info.search_criteria = [];
            $bellNotifications.SearchCriteriaConditions(list_info, "module", notificationSearchText, 'contains'); //NO I18N
        }
        let inputObject = {}
        inputObject.list_info = list_info;
        let dataVal = sdpAjaxInputData(inputObject);
        $notifContainer.html('<div class="nfload-container highindex"><div class="nfload-element">'+ajaxBar()+'</div></div>'); //NO I18N
        sdpAjax({
            type: 'GET', //NO I18N
            url: '/api/v3/user_notifications', //NO I18N
            data: dataVal,
            success: function(responseJson) {
                hasMoreRows = responseJson.list_info.has_more_rows;
                if(hasMoreRows){
                    $bellNotifications.persistActiveClass(activeClassID);
                }
                if (!isNotificationPanelOpened) {
                    totalNotifications = responseJson.user_notifications.length;
                    $notification.setNotificationPanelOpenStatus(true);
                }
                if(sort_module === 'all' || typeof sort_module == 'undefined'){
                    totalNotifications = responseJson.user_notifications.length;
                    $bellNotifications.setTotalNotificationCount(totalNotifications); 
                }
                if (responseJson.user_notifications.length == 0) {
                    renderhbs($notifContainer, 'bell-notification-detail', null, false, 'bell-notification', true); // NO I18N
                    if (notificationSearchText == null) {
                        $notif.find(".panel-search").hide(); //NO I18N
                        jQuery("#markAsReadUnreadDropdown").hide(); //NO I18N
                        if(sort_module == 'all'){
                            jQuery("#bell_notifications_parent").hide(); //NO I18N
                            return;
                        }else{
                            if(responseJson.user_notifications.length == 0 && totalNotificationCount != 0){
                                jQuery("#bell_notifications_parent").show(); //NO I18N
                                return;
                            }
                        }
                    }
                    jQuery("#markAsReadUnreadDropdown").hide(); //NO I18N
                    if (isNotificationPanelOpened && totalNotificationCount > 0) {
                        jQuery("#bell_notifications_parent").show(); //NO I18N
                    } else {
                        jQuery("#bell_notifications_parent").hide(); //NO I18N
                        jQuery('.emptyinfo-content p').text(translate('bell.notification.notfound')); //NO I18N
                    }
                    return;
                }
                $notif.find(".panel-search").show(); //NO I18N
                jQuery("#markAsReadUnreadDropdown").show(); //NO I18N
                jQuery('#bell_notifications_parent').show(); //NO I18N
                let dateGroup = [];
                notificationsGroupByDate = [];
                dateGroup.push(responseJson.user_notifications[0]);
                let notificationsGroupByDate_index = 0;
                for (let index = 1; index < responseJson.user_notifications.length; index++) {
                    if (responseJson.user_notifications[index].client_time.date != dateGroup[0].client_time.date) {
                        notificationsGroupByDate_index++;
                        notificationsGroupByDate.push(dateGroup);
                        dateGroup = [];
                    }
                    dateGroup.push(responseJson.user_notifications[index])
                }
                notificationsGroupByDate.push(dateGroup);
                renderhbs($notifContainer, 'bell-notification-detail', notificationsGroupByDate, false, 'bell-notification', true); // NO I18N
                if(isActiveClassAdded){ $bellNotifications.persistActiveClass(activeClassID); }
                jQuery("#Notifications [name='searchText']").menuSearch({
                parentElement: "#notification-container", //NO I18N
                inputParent: "#panel-search", //NO I18N
                parent: "#Notifications", //NO I18N
                onSearch: function(val) {
                    if (!val) {
                        jQuery("#notification-container").find("ul[aria-labelledby='notification-menu']").removeClass("hide");
                        return;
                    }
                    jQuery("#notification-container").find("ul[aria-labelledby='notification-menu']").each(function() {
                        var ele = jQuery(this);
                        if (!ele.hasClass("sdmenu-dd") & ele.find("li.show").length === 0) {
                            ele.addClass("hide");
                        } else {
                            ele.removeClass("hide");
                        }
                    });
                },
                });
                jQuery('#Notifications').find(".sub-header-panel-content").on('scroll', function() { // No I18N
                    if(hasMoreRows){
                    let divHeight = jQuery(this).scrollTop() + jQuery(this).innerHeight();
                    let scrollHeight = jQuery(this)[0].scrollHeight;
                    //Getting API call, whenver scroll reaches the bottom of the div and "has_more_rows" is true
                    if (Math.abs(divHeight - scrollHeight) <= 1 && !this.isRefresh) {
                        let list_info = {
                            sort_field: "time", // NO I18N
                            sort_order: jQuery('#changeSortNotificationOrder').attr('value') === '0' ? 'desc' : 'asc', // NO I18N
                            row_count: 25,
                            start_index: $notifContainer.find("li").length + 1, //NO I18N
                          };
                          sort_module = jQuery('#filter_notif').val(); //NO I18N
                          sort_module = sort_module.length == 0 ? undefined : sort_module;
                          if (sort_module != 'all') {
                            list_info.search_criteria = [];
                            if (sort_module === 'unread') { //NO I18N
                              $bellNotifications.SearchCriteriaConditions(list_info, "is_read", false, "eq"); //NO I18N
                            } else {
                              $bellNotifications.SearchCriteriaConditions(list_info, "module", sort_module, "contains"); //NO I18N
                            }
                          }

                        let inputObject = {}
                        inputObject.list_info = list_info;
                        let dataVal = sdpAjaxInputData(inputObject);
                        sdpAjax({
                            type: 'GET', //NO I18N
                            url: '/api/v3/user_notifications', //NO I18N
                            data: dataVal,
                            async: false,
                            success: function(responseJson) {
                                hasMoreRows = responseJson.list_info.has_more_rows;
                                let notificationsGroupByDate_index = notificationsGroupByDate.length - 1;
                                let dateGroup = []
                                for (var index = 0; index < responseJson.user_notifications.length; index++) {
                                    if (responseJson.user_notifications[index].client_time.date != notificationsGroupByDate[notificationsGroupByDate_index][0].client_time.date) {
                                        dateGroup.push(responseJson.user_notifications[index])
                                        index++;
                                        break;
                                    }
                                    notificationsGroupByDate[notificationsGroupByDate_index].push(responseJson.user_notifications[index])
                                }
                                for (; index < responseJson.user_notifications.length; index++) {
                                    if (responseJson.user_notifications[index].client_time.date != dateGroup[0].client_time.date) {
                                        notificationsGroupByDate_index++;
                                        notificationsGroupByDate.push(dateGroup);
                                        dateGroup = [];
                                    }
                                    dateGroup.push(responseJson.user_notifications[index])
                                }
                                if (dateGroup.length > 0) {
                                    notificationsGroupByDate.push(dateGroup);
                                }
                                renderhbs($notifContainer, 'bell-notification-detail', notificationsGroupByDate, false, 'bell-notification', true); // NO I18N
                                if(isActiveClassAdded){ $bellNotifications.persistActiveClass(activeClassID); }
                            }
                        });
                    } else {
                        this.isRefresh = false
                    }
                }
                });
            }
        });
    },
    handleTick(id) {
        if (isActiveClassAdded) {
            $notifContainer.find('[data-id=' + activeClassID + ']').removeClass("active"); //NO I18N
            $notification.setPreviousActiveClassID(id);
        }
        if (!isActiveClassAdded && activeClassID === -1) {
            $notifContainer.find('[data-id=' + id + ']').addClass("active"); //NO I18N
            $notification.setActiveClass(true);
            $notification.setPreviousActiveClassID(id);
        }
    },
    openNotifications: function() {
        $notification.setNotificationPanelOpenStatus(true);
        renderhbs('#Notifications', 'bell-notification-header',{"is_sdp":sdp_app.IS_SDP},false,'bell-notification'); //NO I18N
        initTooltip('#Notifications'); //NO I18N
        $notifContainer = jQuery('#notification-container'); //NO I18N
        jQuery("#rt-ldr").html(ajaxBar());
        jQuery("#Notifications [name='searchText']").val("") //NO I18N
        jQuery('#sort_notif_id').val('desc'); // NO I18N
        jQuery('#changeSortNotificationOrder').attr('value', '0'); //NO I18N
        notificationSearchText = null;

        let dontDisturb = ClientUtil.getUserPersonalization("dont_disturb_controller"); //NO I18N
        let isDontDisturbObjectEmpty = jQuery.isEmptyObject(dontDisturb);

        if(!dontDisturb.is_enabled || typeof dontDisturb == "undefined" || isDontDisturbObjectEmpty){
            jQuery('#doNotDisturbToggle').find('#dnd').prop('checked', false); //No I18N
        }else{
            jQuery('#doNotDisturbToggle').find('#dnd').prop('checked', true); //No I18N
        }

        if(!dontDisturb.is_enabled || typeof dontDisturb === "undefined" || isDontDisturbObjectEmpty){
            jQuery('#doNotDisturbToggle').attr('title', translate('bell.disturb.disabled')); //No I18N
        }else{
            jQuery('#doNotDisturbToggle').attr('title', translate('bell.disturb.enabled')); //No I18N
        }
        $notif.show().css('visibility', 'visible').panelSlider({ // NO I18N
            width: 390,
            header: false,
            placement: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            dialogClass: "tabui-rightpanel", // NO I18N
            open: function() {
                selectEle = jQuery("#filter_notif"); //NO I18N

                selectEle.sdp_select2({
                    closeOnSelect: true,
                    allowClear: false,
                    dropdownCssClass: 'soption-nowrap', //NO I18N
                    tooltipClass: 'uitip', //NO I18N
                    placeholder: 'All', // NO I18N
                    minimumResultsForSearch: -1,
                    url :[{
                    url : '/api/v3/user_notifications/_get_filters', //NO I18N
                    field : "_get_filters", //NO I18N
                    dataType: "json", //NO I18N
                    }],
                });

                selectEle.on("select2-open", function(e) { //NO I18N
                    setTimeout(function() {
                        var notModule1 = jQuery('.soption-nowrap li > .select2-result-label'); //NO I18N
                        notModule1.each(function() {
                            let curEle = jQuery(this);
                            curEle.attr({
                                'title': curEle.text(), //NO I18N
                                'rel': 'uitip', //NO I18N
                                'mode_ellipsis': true, //NO I18N
                            });
                        });
                        initTooltip('.soption-nowrap'); //NO I18N
                    }, 1000);
                });
                selectEle.on('change', function(e) {
                    var Chosen = selectEle.prev().find('.select2-chosen'); //NO I18N
                    Chosen.attr({
                        'title': Chosen.text(), //NO I18N
                        'rel': 'uitip', //NO I18N
                        'mode_ellipsis': true //NO I18N
                    });
                    initTooltip('#s2id_filter_notif'); //NO I18N
                    $bellNotifications.getNotificationApi();
                });

                let Notifications = $notif;
                Notifications.find(".sdtabs-ui2").removeClass("hide"); //NO I18N
                Notifications.find("#rt-ldr").remove(); //NO I18N
                Handlebars.registerHelper('notificationIcon', function(notiicationType) { //No I18N
                    return $bellNotifications.getNotificationTypeIcon(notiicationType);
                });

                Handlebars.registerHelper('notificationUrl', function(data, param) { //No I18N
                    return $notification.getDynamicNotificationURL(data, param);
                });
                if (Notifications.find(".nav-sdtabs li").length === 1) { //NO I18N
                    Notifications.find(".nav-sdtabs").hide(); //NO I18N
                    Notifications.find(".sdtab-content").removeClass("mt20"); //NO I18N
                }
                $bellNotifications.getNotificationApi();
            },
            beforeClose: function() {
                //check for the dialogs/sliders are opened first
                const dialogOpenedStatus = $bellNotifications.getDialogOpenedStatuses();
                if(dialogOpenedStatus.length != 0){
                    $bellNotifications.handleTick(activeClassID);
                    $bellNotifications.handleDynamicPopupNotifications(dialogOpenedStatus[0], openedDialogNotificationID);
                    $bellNotifications.initActiveClass();
                    return false;
                }
            
                //if only notification panel is opened we set the focus on notificaiton panel and close the notificationpanel;
                window.top.jQuery('body').focus(); //No I18N
                return true;
            },
            close: function() {
                $notification.setPreviousActiveClassID(-1);
                $notification.setNotificationPanelOpenStatus(false);
                jQuery('body').removeClass('subheader-of-h');
            }
        });
    },
    markAllRead: function() {
        sdpAjax({
            type: 'PUT', //NO I18N
            url: '/api/v3/user_notifications/_mark_all_as_read', //NO I18N
            success: function(responseJson) {
                $bellNotifications.getNotificationApi();
            }, error : function(err){
                window.showalert('failure', err, 'isAutoHide=true,width=auto'); //NO I18N
            }
        });
        jQuery("#notificationMenu").removeClass("open"); //NO I18N
        window.showalert('success', translate("api.updated.success",[translate("common.notifications")]), 'isAutoHide=true,width=auto'); //NO I18N
    },
    deleteAllRead: function() {
        sdpAjax({
            type: 'DELETE', //NO I18N
            url: '/api/v3/user_notifications/_delete_all_read', //NO I18N
            success: function(responseJson) {
                let openDialog = $bellNotifications.getDialogOpenedStatuses();
                if(openDialog.length != 0){
                    $bellNotifications.handleDynamicPopupNotifications(openDialog[0], -1, '');
                }
                $bellNotifications.setTotalNotificationCount(0);
                totalNotifications = 0;
                $bellNotifications.getNotificationApi();
            }
        });
        jQuery("#notificationMenu").removeClass("open"); //NO I18N
        window.showalert('success', translate("api.deleted.success",[translate("common.notifications")]), 'isAutoHide=true,width=auto'); //NO I18N
    },
    closeSlider: function(e) {
        //adding timeout to resolve the Notification Panel Close Jerking issue
        setTimeout(function() {
            jQuery("#Notifications.ui-widget-content").dialog("close"); // NO I18N
        }, 200);
    },
    deleteNotification: function(id, event) {
            const previewSlider = jQuery('#module-preview_previewclose'); //NO I18N
            if(previewSlider.length == 1){
                previewSlider.click();
            }
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            sdpAjax({
                type: 'DELETE', //NO I18N
                url: '/api/v3/user_notifications/' + id, //NO I18N
                success: function() {
                    $bellNotifications.init();
                    $bellNotifications.getNotificationApi();
                    window.showalert('success', translate('common.delete.success'), 'isAutoHide=true,delay=3,width=auto'); //NO I18N
                }
            });
        },
    isPreviewSliderOpened: function() {
        return jQuery("#module-preview-frame").length === 1; //NO I18N
    },
    isAnnounceDialogOpened : function(){
        return jQuery('#announceDialogDiv').length == 1; //NO I18N
    },

    getDialogOpenedStatuses: function() {
        const { isPreviewSliderOpened, isAnnounceDialogOpened} = $bellNotifications;
        const dialogStatus = [];
      
        if (isAnnounceDialogOpened()) dialogStatus.push('announcement'); //NO I18N
        if (isPreviewSliderOpened()) dialogStatus.push('slider'); //NO I18N
        if (isBCMDialogOpened) dialogStatus.push('broadcast'); //NO I18N
      
        return dialogStatus;
      },
    removeButtons : function(){
        //Using the below block of code to handle the Announcement dialog notificatiosns when the notification panel is opened
        isAnnounceDialogOpened = $bellNotifications.isAnnounceDialogOpened();
        if(isNotificationPanelOpened && isAnnounceDialogOpened){
            jQuery('#prevbtn').remove();
            jQuery('#nextbtn').remove();
            $notif.find("[data-action='close']").removeClass("disp-ib").addClass("vhide"); //NO I18N
        }
    },
    handleOpenDialogNotifications(dynNotif, currentClickedNotification){
        $bellNotifications.setOpenedDialogNotificationID(dynNotif);
        let openDialog = null;
        openDialog = $bellNotifications.getDialogOpenedStatuses();
        $bellNotifications.handleTick(dynNotif);
        if(currentClickedNotification === 'announcement'){
            isAnnouncementOpened = $bellNotifications.isAnnounceDialogOpened();
            if(isAnnouncementOpened == 1){
                jQuery('#announceDialogDiv').dialog('close'); //NO I18N
                $notifContainer.find('[data-id=' + dynNotif + ']').addClass("active"); //NO I18N
                if(typeof currentClickedNotification == "undefined"){
                    $bellNotifications.initActiveClass();
                }
            }
            if(isNotificationPanelOpened && isNotificationPanelOpened != null){
                openDialog = $bellNotifications.getDialogOpenedStatuses();
            }
        }else if(currentClickedNotification === 'broadcast'){ //NO I18N
            jQuery('#showBroadcastDialog').css({'position': 'absolute', 'z-index':'1000'}); //NO I18N
            openDialog = $bellNotifications.getDialogOpenedStatuses();
            jQuery("#Notifications").find("[data-action='close']").removeClass("disp-ib").addClass("vhide");
            $notification.setBroadCastDialogOpenedStatus(true);
        }
        $notifContainer.find('[data-id=' + dynNotif + ']').addClass("active"); //NO I18N
        
        if(openDialog.length != 0){
            $bellNotifications.handleDynamicPopupNotifications(openDialog[0], dynNotif, currentClickedNotification);
        }
    },
    handleDynamicPopupNotifications: function(dialog, id, currentClickedNotification) {
        if(currentClickedNotification != dialog){
            if (dialog === 'slider') { //NO I18N
                $previewComponent.closePreview("module-preview"); //NO I18N
            } else if (dialog === 'broadcast') { //NO I18N
                $notification.setBroadCastDialogOpenedStatus(false);
                jQuery('#bcm-notificationbox').addClass('anim-scalehide'); //NO I18N
            } else if (dialog === 'announcement' ) { //NO I18N
                jQuery('#announceDialogDiv').dialog('close'); //NO I18N
            }
            if(typeof currentClickedNotification == "undefined"){
                $bellNotifications.initActiveClass();
            }
        }
        const closeButton = jQuery("#Notifications").find("[data-action='close']"); //NO I18N
        if (typeof currentClickedNotification !== "undefined" && currentClickedNotification !== "") {
            closeButton.removeClass("disp-ib").addClass("vhide");
        } else {
            closeButton.addClass("disp-ib").removeClass("vhide");
        }
    },
    persistActiveClass : function(id){
        jQuery("#notification-container").find('[data-id='+id+']').addClass("active").removeClass("highlight");
    },
    handleClosedDialogNotfications: function(dynNotif){
        if(isNotificationPanelOpened){
        jQuery("#notification-container").find('[data-id='+dynNotif+']').removeClass("active");
        jQuery("#Notifications").find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
        }
    },
    initActiveClass : function(){
        $notification.setPreviousActiveClassID(-1);
        $notification.setActiveClass(false);
    },
    updateLocalHbsRenderedData : function(id, boolean){
        let currentLiIndex = ($notifContainer.find('[data-id=' + id + ']').index() / 2) - 1;
        notificationsGroupByDate[0][currentLiIndex].is_read = boolean;
    },
    setTotalNotificationCount: function(val) {
        totalNotificationCount = val;
    },
    setOpenedSliderID: function(val) {
        openedSliderId = val;
    },
    setOpenedDialogNotificationID : function(val){
        openedDialogNotificationID = val;
    }, getIsNotificationPanelOpened : function(){
        return isNotificationPanelOpened;
    },
     markNotificationAsRead : function(is_read, id){
         if(!is_read){
             markAsRead(id);
         }
     },methodStop : function(e){
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
           },
	handleThrottleNotification : function(module_id, is_read, id, helpdesk_id, fromListView) {
	   	if(typeof rateLimitDetails === 'undefined'){
			const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/rate_limit_details.js"] : ["/scripts/hbs-template-throttle.js", "/scripts/rate_limit_min.js"] ; //NO I18N
	        ResourceLoader({
	           js: getScript,
	           success: function() {
	   			rateLimitDetails.showSuspiciousNotificationAlert(module_id, is_read , id, helpdesk_id, fromListView, false);
	           }});
	    }
	   	else {
	   		rateLimitDetails.showSuspiciousNotificationAlert(module_id, is_read , id, helpdesk_id, fromListView, false);
	   	}
	}
};







