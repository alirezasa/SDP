/* $Id$ */
jQuery(document).ready(function () {
        if (parent.sdp_user.KB_SHORTCUTS) {

            //Open Shortcut UI 
            Mousetrap.bind('shift+/', function (e) {
                if(proceedKBAction(e)) {
                        return;
                }
                jQuery("#openkbsc").trigger("click");
            });

            //Escape
            Mousetrap.bind('esc', function (e) {
                //SD-60746 Status comment not mandated , in global edit.
                var keyCode = e.which;
                if(keyCode == 27 && closeOnEscKey == true && oDialog != null && oDialog.style.visibility != "hidden")
                {
                    closeDialog();
                }
            });

            //Go to Home
            Mousetrap.bind('g h', function (e) {
                if(window.externalframe || proceedKBAction(e)) {
                        return;
                }
                var url = "/ui/home";  // NO I18N
                try {
                    $spa.navigate(url,"home","home"); // NO I18N
                } catch (error) {
                    window.location.href = url;
                }
            });

            //Cursor Focus to Search
            Mousetrap.bind('/', function (e) {
                e.preventDefault();
                if(window.externalframe || proceedKBAction(e)) {
                        return;
                }
                var jD = jQuery(document);
                if(jD.find('#dd-searchbox:visible').length > 0 && jD.find('#FreezeLayer_search:visible').length === 0) {
                    jD.find('#dd-searchbox').trigger('click'); // No I18N
                } else {
                    var isPresent = jQuery('[name="searchText"]').val();
                    var searchboxName = jQuery('[name="searchText"]')
                    if (isPresent == undefined)
                    {
                        searchboxName = jQuery('[name="SearchText"]');
                    }
                    setTimeout(function () {
                        jD.find('#subheader_search_box').trigger('focus').val('');
                    }, 150);
                }
            });

            //Left Nav Open Close
            Mousetrap.bind('[', function (e) {
                if(window.externalframe || proceedKBAction(e)) {
                        return;
                }
                var fdisplay = jQuery("#Left-Section").css('display');  //No i18N
                if (fdisplay == 'block')
                {
                    jQuery("#LeftIndicatorClosed").trigger("click");
                }
                else
                {
                    jQuery("#LeftIndicator").trigger("click");
                }
                window.focus();
            });

            //spot search
            Mousetrap.bind('s', function (e) {
                if(proceedKBAction(e)) {
                        return;
                }
                //TASKID-74988
                if(jQuery(".tableSearchButton").attr('table_el') || jQuery(".tableSearchCloseButton").attr('table_el')){
                    if (jQuery(".tableSearchButton").attr('table_el') == "OSBTN")
                    {
                        jQuery(".tableSearchButton:visible").trigger("click");
                        setTimeout(function() {
                            jQuery('.tableSpotSearch:first').trigger('focus').val('');
                        }, 1);
                    }
                    else
                    {
                        jQuery(".tableSearchCloseButton").trigger("click");

                    }
                }else if(jQuery("[id*='_listSearch']:visible").length > 0){ //It is related to new Table component search
                    setTimeout(function() {
                        jQuery("[id*='_listSearch']:visible").trigger('click');
                    }, 1);
                }else{      //  table_el will not be present in requests view. So handling this case with a simple check
                    setTimeout(function() {
                        jQuery("#listSearch:visible,[data-name=spot_search]:visible").trigger('click');
                    }, 1);
                }
            });

            Mousetrap.bind('c s', function (e) {
                if(proceedKBAction(e)) {
                        return;
                }
                var destination = jQuery('.columnEditButton').attr('id');
                jQuery("#" + destination).trigger("click");
                setTimeout(function () {
                    Effect.ScrollTo('_DIALOG_LAYER');
                }, 1000);
            });

            // Filter search
            Mousetrap.bind('v', function (e) {
                if(proceedKBAction(e)) {
                        return;
                }
                var destination = jQuery("#ListViewFilterMenu").children(":first").attr('id'); //No i18N
                if (destination == null)
                {
                    destination = jQuery("#ProjectsFilterMenu").children(":first").attr('id'); //No i18N
                    if (destination == null)
                    {
                        showMenuInDialog('SolutionStatusActions', 'SoluitonStatus');  //No i18N
                    }
                }
                if(jQuery("body").css('overflow')!='hidden') { //to avoid hiding the header
                    Effect.ScrollTo(destination);
                }
                jQuery("#" + destination).trigger("click");
                setTimeout(function () {
                    jQuery('.srchfiltertxt').trigger('focus').val('');
                    jQuery('.inputclear-icon').trigger('click');
                }, 1);
            });

            //escape
            jQuery(document).on('keyup', function (event) {
                if(proceedKBAction(event)) {
                        return;
                }
                if (event.keyCode == 27) {
                    jQuery('input').trigger('blur');
                    jQuery('select').trigger('blur');
                    document.body.focus();
                    var jD = jQuery(document);
                    jD.find('.dd-searchanim').removeClass('dd-searchanimation'); // No I18N
                    jD.find('#FreezeLayer_search').remove();  // No I18N
                    jD.find('.dd-searchanim input').off('blur'); // No I18N
                }
            });
            if (parent.sdp_user.ROLES.indexOf("CreateRequests") != -1)
            {
                //Create New Request
                Mousetrap.bind('n r', function (e) {
                    if(window.externalframe || proceedKBAction(e)) {
                        return;
                    }
                    url = "/WorkOrder.do?woMode=newWO"; // NO I18N
                    try {
                        $spa.navigate(url,"requests","requests-new"); // NO I18N
                    } catch (error) {
                        window.location.href = url
                    }
                });
            }
            if (parent.sdp_user.ROLES.indexOf("ViewRequests") != -1)
            {
                //Go to Requests Tab
                Mousetrap.bind('g r', function (e) {
                    if(window.externalframe || proceedKBAction(e)) {
                        return;
                    }
                    var url = "/WOListView.do";  // NO I18N
                    try {
                        $spa.navigate(url,"requests","requests-list"); // NO I18N
                    } catch (error) {
                        window.location.href = url
                    }
                });

                //Go to Request
                Mousetrap.bind('alt+r', function (e) {
                    if(window.externalframe || proceedKBAction(e)) {
                        return;
                    }
                    Mousetrap.unbind('r'); //No i18N
                    showURLInDialog('/jsp/goToReq.jsp', 'modal=yes,closeOnEscKey=yes,height=80,width=300,closeButton=yes,title=Go to Request,position=absmiddle'); //No i18N
                    jQuery('#_DIALOG_CONTENT').find('#searchReq').trigger('focus');
                    setTimeout(function () {
                        jQuery('#_DIALOG_CONTENT').find('#searchReq').trigger('focus').val('');
                        Mousetrap.bind('r', function (e) {
                            jQuery("#Req_Det_Reply").trigger('click');
                        });
                    }, 150);
                });
            }

                if (parent.sdp_user.ROLES.indexOf("ViewRequests") != -1)
                {
                    //Forward request
                    Mousetrap.bind('f', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        jQuery("#Req_Det_ForwardReq").trigger('click');
                    });
                    //Reply Request
                    Mousetrap.bind('r', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        jQuery("#Req_Det_Reply").trigger('click');
                    });
                    //Add Note
                    Mousetrap.bind('n n', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        jQuery('[data-id="add-note"]').trigger('click');
                    });
					//MSP added shortcut key to make call from in request detail view
                    if(window.checkIfMSPOrSCP() && parent.sdp_feature_status.is_cti_kbshortcut_enabled){
	                    Mousetrap.bind('shift+c', function (e) {
	                        jQuery("#ctiCall").trigger('click');
	                    });
                    }

                    //notes list
                    Mousetrap.bind('n l', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        $req.details.changeTab('details');    //No I18N
                        setTimeout(function(){
                            jQuery('html, body').animate({
                                scrollTop: jQuery("#req-conversation .latest-conv").offset().top - 65    //No I18N
                            });
                        },200);
                    });


                    //Print Preview
                    Mousetrap.bind('shift+p', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        jQuery("#Req_Det_PrintPreview").trigger("click");
                        window.focus();
                    });

                    //Next Request
                    Mousetrap.bind('right', function(e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if (jQuery(".atp-box").length > 0 && jQuery(".atp-box").is(":visible")) {
                            return;
                        }
                        e.preventDefault();
                        if($req.details.operational_data && $req.details.nav_next) {
                            $req.details.navigateWO($req.details.nav_next);
                        }
                    });

                    //Previous Request
                    Mousetrap.bind('left', function(e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if (jQuery(".atp-box").length > 0 && jQuery(".atp-box").is(":visible")) {
                            return;
                        }
                        e.preventDefault();
                        if($req.details.operational_data && $req.details.nav_prev) {
                            $req.details.navigateWO($req.details.nav_prev);
                        }
                    });

                    //Go to task/worklog list
                    Mousetrap.bind('o t', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if($req.details.checkUserAccess('tasks')) {
                            $req.details.changeTab('tasks');    //No I18N
                        }
                    });


                    //Open resolution
                    Mousetrap.bind('o r', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        $req.details.changeTab('details');    //No I18N
                    });

                    //Open resolution
                    Mousetrap.bind('o s', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if($req.details.checkUserAccess('resolution')) {
                            jQuery('#resolution-tab').trigger('click'); //No I18N
                        }
                    });
                    //open last conversation
                    Mousetrap.bind('l c', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        $req.details.changeTab('details');    //No I18N
                        setTimeout(function(){
                            jQuery('html, body').animate({
                                scrollTop: jQuery("#req-conversation").offset().top - 65    //No I18N
                            }, function() {
                                if($req.details.conv) {
                                    $req.details.conv.openLatestConversation();
                                }
                            });
                        },200);
                    });
                    //link Request
                    Mousetrap.bind('l', function (e) {
                        if(proceedKBAction(e)) {
                            return;
                        }
                        jQuery("#Req_Det_LinkReq").trigger('click');
                    });
                    //Open approvals tab
                    Mousetrap.bind('o a', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if($req.details.checkUserAccess('approvals')) {
                            $req.details.changeTab('approvals');    //No I18N
                        }
                    });

                    if(checkIfMSPOrSCP()) {
                        //Change Account
                        Mousetrap.bind('alt+a', function (e) {
                            var changeAccountEle = jQuery('#Req_ChangeAccount');
                            if (changeAccountEle.length > 0)
                            {
                                window.location.href = changeAccountEle.attr('href');
                                window.focus();
                            }
                        });
                    }
                }
                if (parent.sdp_user.ROLES.indexOf("ModifyRequests") != -1)
                {
                    //Add worklog
                    Mousetrap.bind('n w', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if($req.details.checkUserAccess('worklogs')) {
                            jQuery("#Req_Det_AddWorkLog").trigger('click');  //No I18N
                        }
                    });
                    //Edit Request
                    Mousetrap.bind('e', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        var editReq = jQuery('#Req_Det_Edit');
                        if (editReq.length > 0) {
                            editReq.trigger('click');
                        }
                    });
                }
                if (parent.sdp_user.ROLES.indexOf("AssigningTechnician") != -1)
                {
                    //Assign Tech Request
                    Mousetrap.bind('a', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if(jQuery('#technician-right-panel').length > 0 || jQuery('#group-right-panel').length > 0 || jQuery('#site-right-panel').length > 0 ||  getSDPURLParams().from==='dashboard') {
                            $req.sgt.openAssignDialog();
                            e.preventDefault();
                        }
                    });
                    //Pick Up Request
                    Mousetrap.bind('i', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if(jQuery("#pickupTech").length > 0) {
                            jQuery("#pickupTech").trigger("click");
                        }
                    });
                }
                if (parent.sdp_user.ROLES.indexOf("AddingRequestTasks") != -1)
                {
                    //New Task from request Details
                    Mousetrap.bind('n t', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        if($req.details.checkUserAccess('tasks')) {
                            jQuery("#Req_Det_AddTask").trigger('click');  //No I18N
                        }
                    });
                }
                if (parent.sdp_user.ROLES.indexOf("ClosingRequest") != -1)
                {
                    //close request
                    Mousetrap.bind('c', function (e) {
                        if(proceedKBAction(e) || !window.req_details) {
                            return;
                        }
                        var closeId = parseInt($req.details.operational_data.close_status_id);
                        if(closeId!="-1" && closeId !== parseInt($req.details.request_info.status.id)){
                            if(Object.keys($req.prop.rulesObj).length){
                                if($req.resource.checkResBulkEdit){
                                    $req.resource.resourceCancel();
                                }
                                this.checkRightPanel = true;
                                this.checkBulkEdit = false;
                                $req.prop.sectionalEdit();
                                $req.prop.sectionalCancel();
                                $se.onDetailPage = false;
                                setTimeout(function() {
                                    jQuery('[data-name=status]').removeClass('hide').parents('.fafr-row').find('.spot-form').addClass('hide'); //NO I18N
                                    jQuery('[name=status]').val(closeId).trigger('change');
                                },100);
                            }else{
                                $req.prop.setInlineEdit("status"); //NO I18N
                                jQuery('[data-name=status]').removeClass('hide').parents('.fafr-row').find('.spot-form').addClass('hide'); //NO I18N
                                jQuery('[name=status]').val(closeId).trigger('change');
                            }
                        }   
                    });
                }
        }
});
function proceedKBAction(e) {
    if (jQuery(e.target).closest('body').length === 0) {
          return true; // If the event target is not within the body, treat it as an external dialog
    }
    return isDialogVisible();
}
function isDialogVisible() {
    if(jQuery(".ui-dialog:visible").length > 0 || jQuery(".sdpzcompdialog,.zdialog--overlay").length>0 || jQuery(".ze_orly:visible").length > 0 || (jQuery("#_DIALOG_LAYER").length > 0 && jQuery("#_DIALOG_LAYER").css("visibility") !== "hidden") || (jQuery(".atp-box").length > 0 && jQuery(".atp-box.freezelayerbg1").is(':visible')) || (jQuery(".req-temp #content-panel").is(":visible")) || jQuery('#templatePopUp:visible').length > 0) {
        return true;
    }
    return false;
}

//Function that toggles the look of the button(Enable/Disable) 
function toggleKBStatus() {
    let data, message;
    if (jQuery('#kb_stsTxt').text() == getMessageForKey('sdp.requests.fieldFormRules.rules.enabled')) {
        jQuery('#kb_stsTxt').text(getMessageForKey('sdp.requests.fieldFormRules.rules.disabled'));
        jQuery('#kb_status').removeClass();
        jQuery('#kb_status').addClass('kbsc-disabled ');
        data = {kbShortcuts: false};
        message = translate("common.action.disabled", [translate("sdp.kbs.kbs")]);
    } else {
        jQuery('#kb_stsTxt').text(getMessageForKey('sdp.requests.fieldFormRules.rules.enabled'));
        jQuery('#kb_status').removeClass();
        jQuery('#kb_status').addClass('kbsc-enabled');
        data = {kbShortcuts: true};
        message = translate("common.action.enabled", [translate("sdp.kbs.kbs")]);
    }
    showalert("success", message, "isAutoHide=true"); // NO I18N
    sdpAjax({
        url: "/Language.do", // NO I18N
        type: "POST", // NO I18N
        data: data
    });
    setTimeout(function() {
        window.location.reload();
    }, 500);
}

