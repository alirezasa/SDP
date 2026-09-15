/* $Id$ */
if (!replyTemp) {
    var replyTemp = {};
}
var rtListComp = {};

replyTemp.ReplyTemplate = function() {};

replyTemp.ReplyTemplate.prototype = {
    loadNewRT: function(id, isReplyAdd) {
        jQuery('#alertbox').remove();

        jQuery.getJSON('/ReplyTemplate.do?mode=getInfo', function(info) { // NO I18N
            if (id !== '') {
                sdpAjax({
                    url : '/api/v3/reply_templates/' + id, // NO I18N
                    success : function(json){
                        var rtObj = json.reply_template;
                        rtObj.custom_var = info.reply_template.custom_var;
                        rtObj.is_edit = true;
                        rtObj.is_hd_config = info.reply_template.is_hd_config;

                        if (sdp_user.ROLES.indexOf('HelpdeskConfig') < 0) {
                            // User can update Reply Template created by hmself, so disabling update
                            if ((Number(json.reply_template.created_by.id) !== sdp_user.LOGGEDIN_USERID)) {
                                rtObj.save_disable = 'disabled'; // NO I18N
                                rtObj.is_edit = false;
                            }
                            rtObj.is_crud_allowed = info.reply_template.is_crud_allowed;
                        } else {
                            rtObj.is_crud_allowed = true;
                        }
                    
                        $replyTemp.renderNewRT(json, isReplyAdd);
                    }
                });
            } else {
                info.reply_template.is_edit = false;
                $replyTemp.renderNewRT(info, isReplyAdd);
            }
            tooltipFix(1500);
            initTooltip("#add_target");// NO I18N
            return info;
        });
    },
    renderNewRT: function(json, isReplyAdd) {
        json.reply_template.is_reply_add = isReplyAdd;

        var th, width = 1000,
            pageTitle = 'sdp.admin.newreplytemplate', rtObj = json.reply_template, content = rtObj.description, rtTxt = 'sdp.admin.replytemplate', // NO I18N
            woCloseLink = 'href="$RequestCloseLink"', woLink = 'href="$RequestLink"', dis_class = 'class="ptr-ev-none"'; // NO I18N

        renderhbs('#add_target', 'add-reply-template', json, false, 'reply_templates'); //No I18N

        th = jQuery('#add_target');

        if (!isReplyAdd) {
            if (json.reply_template.save_disable === 'disabled') {
                width = 800;
            }
            showjQModal("add_target", width, 650, 800, false, true); // NO I18N
            jQuery('#htmleditor_Change_Notif_Content').css('height', '350px'); // NO I18N
            initTooltip();
        }

        // This check is for view alone, if user has not created this reply template then we need to show detaila as plain text
        if (rtObj.save_disable) {
            content = content.replace(woCloseLink, woCloseLink + dis_class);
            content = content.replace(woLink, woLink + dis_class);

            th.find('#desc').html(content);
            pageTitle = rtTxt;
        } else {
            $replyTemp.loadEditor(json, th);

            th.find('#name').trigger('focus');

            // Changing the title of the popup when we switch from new RT to edit RT
            if (rtObj.is_edit) {
                pageTitle = 'ae.cmdb.inventory.editNewCI'; // NO I18N
            }
            $replyTemp.bind(isReplyAdd);

        }

        pageTitle = translate(pageTitle, [translate(rtTxt)]);
        jQuery(".ui-dialog-title, #rt_title").html(pageTitle); // NO I18N
    },
    loadEditor: function(json, th) {
        if (json.reply_template.is_reply_add) {
            zeditor({element: 'RTHTMLDesc', customName: 'editor2', avoidMoreOption: true, isEnterKeyHandler: true, edithtml: true, inlineimagesAPI: '/api/v3/reply_templates/images'}); // NO I18N
            th.find('#rtVar').data(json);
            setTimeout(function() { $replyTemp.initZE(json, th); }, 400);
        } else {
            zeditor({element: 'RTHTMLDesc', customName: 'editor', avoidMoreOption: true, isEnterKeyHandler: true, edithtml: true, inlineimagesAPI: '/api/v3/reply_templates/images'}); // NO I18N
            setTimeout(function() { $replyTemp.initZE(json, th); }, 400);
        }
    },
    bind: function(isReplyAdd) {
        var th = jQuery('#add_target');

        th.off('click', '#save').on('click', '#save', function(e) { // NO I18N
            $replyTemp.save(th, isReplyAdd);
        }).off('click', '#cancel').on('click', '#cancel', function(e) { // NO I18N
            if (isReplyAdd) {
                $replyTemp.showReplyWindow();
            } else {
                closejQModal('add_target'); // NO I18N
            }
        });
    },
    save: function(th, isReplyAdd) {
        var desc;

        if (isReplyAdd) {
            desc = parent.editor2.getHTML();
        } else {
            desc = getHTMLDescription();
        }

        var name = th.find('#name').val(), id = th.find('#rtId').val(), desc = trimAll(desc),
            input = {reply_template: { name : name, description: desc, inactive: !th.find('#inactive').is(':checked'), // NO I18N
                is_public: th.find('#ispublic').is(':checked')}}, url = '/api/v3/reply_templates', method = 'POST', status = 'failure', // NO I18N
                autoHide = 'isAutoHide=true', msg = 'api.added.success'; // NO I18N

        jQuery('#alertbox').remove();

        if (name == '') {
            showalert(status, th.find('#nameErr').html(), autoHide);
            return;
        }
        if (desc == '') {
            showalert(status, th.find('#descErr').html(), autoHide);
            return;
        }

        if (id !== '') {
            url += '/' + id; // NO I18N
            method = 'PUT'; // NO I18N
            msg = 'api.updated.success'; // NO I18N
        }

        sdpAjax({
            type: method,
            url: url,
            data : sdpAjaxInputData(input),
            success: function(json) {
                if (isReplyAdd) {
                    $replyTemp.processReplyRTList(jQuery(document));
                    json.is_reply_add = isReplyAdd;

                    $replyTemp.showReplyWindow(json);
                } else {
                    msg = translate(msg, [translate('sdp.admin.replytemplate')]);
                    var status = json.response_status.status;

                    if (status == 'failed') {
                        status = 'failure'; // NO I18N
                        msg = json.response_status.messages[0].message;
                    } else {
                        status = json.response_status.status;

                        closejQModal('add_target'); // NO I18N
                        $replyTemp.initRTList();
                    }

                    showalert(status, msg, autoHide);
                }
            },
            error: function(json) {
                json = json.responseJSON;
                var resObj = json.response_status.messages[0];

                if (resObj.field === 'name') {
                    if (resObj.message !== undefined) {
                        msg = resObj.message;
                    } else {
                        msg = translate('sdp.admin.RequestReply.deleteReplyTemplate.failure.duplicate');
                    }
                } else if(resObj.status_code == '4018'){
                     //SD-114033 : limited added reply templates
                     msg = resObj.message;
                } else {
                    msg = 'Error with ' + json.response_status.messages[0].field + ' while adding Reply Templates'; // NO I18N
                }
                showalert(status, msg, autoHide);
            }
        });
    },
    delRT: function(th) {
        var idObj = th.find('#reply_templates_body input:enabled:checked'), len = idObj.length, i, autoHide = 'isAutoHide=true', ids = ''; // NO I18N

        jQuery('#alertbox').remove();

        if (len > 0){
            if (confirm(th.find('#del_confirm').html())) {
                for (i = 0; i < len; i++) {
                    ids += ',' + idObj[i].value;
                }

                sdpAjax({
                    cache: false,
                    async: false,
                    type: 'DELETE', // NO I18N
                    url: '/api/v3/reply_templates?ids=' + ids.slice(1), // NO I18N
                    success: function(json) {
                        $replyTemp.initRTList();

                        var statusObj = json.response_status, len = statusObj.length, successIds = [], failedIds = [],
                            msg = '', status = 'success'; // NO I18N

                        for (i = 0; i < len; i++) {
                            var obj = statusObj[i];

                            if (obj.status === status) {
                                successIds.push(obj.id);
                            } else {
                                failedIds.push(obj.id);
                            }
                        }

                        if (successIds.length > 0) {
                            msg = translate('sdp.admin.replytemplate.delinfo', [successIds]); // NO I18N
                        }
                        if (failedIds.length > 0) {
                            msg = translate('sdp.admin.replytemplate.delerror', [failedIds]); // NO I18N
                            status = 'warning' // NO I18N
                        }
                        showalert(status, msg, autoHide);
                    },
                    error: function (json){
                        // If the ID given is invalid then the call will be failed, so need to handle the failure cases in failure callback method.
                        $replyTemp.initRTList();

                        var statusObj = json.responseJSON.response_status, len = statusObj.length, successIds = [], failedIds = [],
                            msg = '', status = 'success'; // NO I18N

                        for (i = 0; i < len; i++) {
                            var obj = statusObj[i];

                            if (obj.status === status) {
                                successIds.push(obj.id);
                            } else {
                                failedIds.push(obj.id);
                            }
                        }

                        if (successIds.length > 0) {
                            msg = translate('sdp.admin.replytemplate.delinfo', [successIds]); // NO I18N
                        }
                        if (failedIds.length > 0) {
                            msg = translate('sdp.admin.replytemplate.delerror', [failedIds]); // NO I18N
                            status = 'warning' // NO I18N
                        }
                        showalert(status, msg, autoHide);
                    }
                });
            }
        } else {
            showalert('failure', th.find('#confirm2').html(), autoHide); // No I18N
        }
    },
    headerCheckBoxProcess: function(th, obj) {
        // Processing event when user check/uncheck header checkboox.
        // This event enable/disable delete button.
        var selObjLen = th.find('[name=rtRow_cbox]').length;

        if (obj.checked && selObjLen > 0) {
            th.find('#del_rt').prop('disabled', false); // NO I18N
        } else {
            th.find('#del_rt').prop('disabled', true); // NO I18N
        }
    },
    listCheckBoxProcess: function(th, obj) {
        // Processing event when user check/uncheck list checkboox. This event enable/disable
        // (when all the checkbox are checked/unchecked) delete button and checking/unchecking header checkbox.
        var checkHedaerObj = th.find('#reply_templates_head_chk'), checkedLen = th.find('[name=rtRow_cbox]:checked').length;

        if (obj.checked) {
            if (th.find('[name=rtRow_cbox]').length == checkedLen) {
                checkHedaerObj.prop('checked', true); // NO I18N
            }
            th.find('#del_rt').prop('disabled', false); // NO I18N
        } else {
            checkHedaerObj.prop('checked', false); // NO I18N

            if (checkedLen < 1) {
                th.find('#del_rt').prop('disabled', true); // NO I18N
            }
        }
    },
    initZE: function(json, th) {
        var contentVar = {}, customInfo = json.reply_template.custom_var, len = customInfo.length, i,
            $editor = jQuery('.text-compelete-message'), regexp = "\\\$([\\\S]*)$"; // NO I18N

        contentVar.Message = [];

        for (i = 0; i < len; i++) {
            var obj = customInfo[i];
            contentVar.Message.push({text: e_html(obj.name), value: obj.value});
        }

        var editorObj = jQuery('#htmleditor_Change_Notif_Content iframe');

        $editor = editorObj.contents().find('body'),
        $editor.attr({contentEditable: 'true'});
        autoSuggestion($editor, contentVar.Message, regexp);

        th.find('#name').trigger('focus');
    },
    changeStatus: function(obj) {
        var url =  '/ReplyTemplate.do?mode=changeStatus&id=' + obj.id + '&status=' + obj.getAttribute("data"); // NO I18N
        jQuery.ajax({
            type: 'POST', // NO I18N
            url: url,
            success: function(json) {
                if (json.response_status.status === 'success') {
                    $replyTemp.initRTList();
                }
                jQuery('#alertbox').remove();
                showalert(json.response_status.status, json.response_status.message, 'isAutoHide=true'); // No I18N
            }
        });
    },
    initRTList: function(filterType, faceTxt) {
        // Rendering Reply Template list using table component
        if (rtListComp.hasOwnProperty('tableId')) {
            var crit = {},s_field = {}, list_info = {}, sortField = 'name', isInactive = jQuery('#has_inactive').hasClass('on'); // NO I18N

            // Applying Reply Templates different view criteria
            if (filterType === 'private') { // NO I18N
                crit = {"field":"is_public","value":"false","condition":"is"};// NO I18N
                s_field.is_public = false;
            } else if (filterType === 'public') { // NO I18N
                crit = {"field":"is_public","value":"true","condition":"is"};// NO I18N
                s_field.is_public = true;
            } else {
                if (faceTxt === undefined) {
                    faceTxt = translate('sdp.home.ssp.templates.showall'); // NO I18N
                }
            }

             if (!isInactive) {
                if(!jQuery.isEmptyObject(crit)){
                    public_crit = crit;
                    crit = [];
                    crit.push(public_crit);
                    crit.push({"field":"inactive","value":"false","condition":"is","logical_operator":"and"});
                }else{
                    crit = {"field":"inactive","value":"false","condition":"is"};// NO I18N
                }
                s_field.inactive = false;
             }

            //SD-109851 : Sort Field is modified as per Personalization
            list_info.sort_field = rtListComp.t_obj.table_info.list_info.hasOwnProperty('sort_field')? rtListComp.t_obj.table_info.list_info.sort_field : sortField; // NO I18N
            list_info.search_criteria = crit;
            list_info.sort_order = rtListComp.t_obj.table_info.list_info.hasOwnProperty('sort_order')? rtListComp.t_obj.table_info.list_info.sort_order : 'asc'; // NO I18N
            list_info.row_count=rtListComp.t_obj.table_info.list_info.row_count;
            rtListComp.t_obj.table_info.default_searchfields = s_field;
            rtListComp.t_obj.table_info.list_info = list_info;

            rtListComp.refreshTable('clearSearch'); // NO I18N
            rtListComp.toggleSearchRow(false);

            // Disbaling delete button when table is not reinitialized (on delete it keeps enabled)
            jQuery('#del_rt').prop('disabled', true); // NO I18N
        } else {
            var th = $replyTemp.renderListAttr(), table_content = {}, table_info = table_comp.getTableInfo('reply_templates'), _self = this, // NO I18N
                options = {}, entityName = 'reply_templates'; // NO I18N

            table_content.header = this.headerdataConstruct(this);
            if(!table_info || (table_info && !Object.prototype.hasOwnProperty.call(table_info, "list_info"))){
                table_info = {list_info:{}}
            }
            table_info.list_info.search_criteria = { field: 'inactive', value: false, condition: 'eq' }; //No I18N
            setTimeout(function() {
                options.paginationEnabled   = true;
                options.multiDeleteEnabled  = true;
                options.searchEnabled       = true;
                options.sortingEnabled      = true;
                options.isODAPI             = true
                options.callbackRowfunction = _self.rowdataConstruct;
                options.callbackURL         = entityName;
                options.entity_name         = entityName;
                options.row_inputdata       = _self.rowdataConstruct(table_info, _self);
                //SD-109851 : Instead of default sort field setting up the sort field from list_info
                options.row_inputdata.list_info.sort_field = table_info.list_info.hasOwnProperty("sort_field")? table_info.list_info.sort_field : 'name'; //NO I18N
                options.staticHeader = true;
                options.width = jQuery("#reply_templates_div").width();
                options.height = jQ(window).height() - 300;
                options.personalize_key = entityName;
                options.support_search_criteria = true;

                rtListComp = new tableComponent(table_info, table_content, options, _self);

                $replyTemp.bindListEle(th);
            }, 1);
        }
        // Displaying applied criteria as view to the face
        var filterFaceObj = jQuery('#filterFace');

        filterFaceObj.html(faceTxt);
        filterFaceObj.attr('type', filterType);
    },
    renderListAttr: function() {
        // Rendering list Reply Template Attribute i.e. Add New, Delete
        var th = jQuery('#template_data'),
            isAdmin = location.href.indexOf('SetUp') > 0, rtInfo = th.find('#rt_info').data(),
            attrJson = {is_admin_tab: isAdmin, show_private_list: rtInfo.show_private_list,
                is_crud_allowed: rtInfo.is_crud_allowed, is_hd_config: rtInfo.is_hd_config};

        renderhbs(th.find('#rt_attr'), 'reply-template-list-view-header', attrJson, false, 'reply_templates'); //No I18N
        th.find('#list').css('display', 'block').end().find('#add_target').css('display', 'none'); // NO I18N

        th = jQuery('#template_data #list');

        if (isAdmin) {
            th.removeClass('darkbg');
            jQuery('#rt_admin').removeClass('hide');
        }
        return th;
    },
    bindListEle: function(th) {
        // Binding list view attribute events
        th.off('click', '#reply_templates_head_chk').on('click', '#reply_templates_head_chk', function(e) { // NO I18N
            $replyTemp.headerCheckBoxProcess(th, this);
        }).off('click', '[name=rtRow_cbox]').on('click', '[name=rtRow_cbox]', function() { // NO I18N
            $replyTemp.listCheckBoxProcess(th, this);
        }).off('click', '#del_rt').on('click', '#del_rt', function() { // NO I18N
            $replyTemp.delRT(th);
        }).off('click', '[name=addNEdit]').on('click', '[name=addNEdit]', function() { // NO I18N
            $replyTemp.loadNewRT(this.id, false);
        }).off('click', '[name=changeStatus]:not(.opac5)').on('click', '[name=changeStatus]:not(.opac5)', function() { // NO I18N
            $replyTemp.changeStatus(this);
        }).off('click', '[name=filter]').on('click', '[name=filter]', function() { // NO I18N
            var liObj = jQuery(this), filterType = liObj.attr('type'), faceTxt =  translate('sdp.home.ssp.templates.showall');

            if (filterType === 'private') { // NO I18N
                faceTxt =  translate('sdp.admin.replytemplate.filter.private')
            } else if (filterType === 'public') { // NO I18N
                faceTxt =  translate('sdp.admin.replytemplate.filter.public')
            } else if (filterType === 'inactive') { // NO I18N
                faceTxt =  translate('sdp.template.filter.inactive')
            }

            $replyTemp.initRTList(filterType, faceTxt);
        }).off('click', '#inactiveToggle').on('click', '#inactiveToggle', function() { // NO I18N
            //$event.renderOnToggle(th, this);
            var curElement = jQuery('#has_inactive');

            if (curElement.hasClass("on")) {
                curElement.addClass("off").removeClass('on');
            } else if(curElement.hasClass("off")) { // NO I18N
                curElement.addClass("on").removeClass('off')
            }

            var filterType = th.find('#filterFace').attr('type'), faceTxt = th.find('#filterFace').html();

            $replyTemp.initRTList(filterType, faceTxt);
        }).off('click','#history').on('click','#history',function(event){//NO i18N
               viewModuleHistory(jQuery(this).get(0));
        });
    },
    rowdataConstruct : function(table_info,controller) {
        var fields_required = table_info.fields_required, inputObject = {}, fields_required_arr = Object.keys(fields_required);

        fields_required_arr.push('id');
        fields_required_arr.push('name');
        fields_required_arr.push('description');

        fields_required_arr.push('is_public');
        fields_required_arr.push('inactive');

        fields_required_arr.push('created_by');
        fields_required_arr.push('created_time');

        inputObject.list_info = table_info.list_info;
        inputObject.list_info.fields_required = fields_required_arr;
        return inputObject;
    },
    headerdataConstruct : function(controller) {
        return {reply_templates_head_chk: {type: 'checkbox', dataCelltransformer: controller.selectCell}, // NO I18N
            inactive: {type: 'icon', dataCelltransformer: controller.statusCell}, // NO I18N
            is_public: {type: 'icon', dataCelltransformer: controller.privacyCell}, // NO I18N
            name: {text: 'common.templatename', width: '300px', dataCelltransformer: controller.processName}, // NO I18N
            description: {text: 'sdp.admin.replytemplate.content', width: '650px', dataCelltransformer: controller.processContent, disableSearching: true, disableSorting: true}, // NO I18N
            created_time: {text: 'ae.cmdb.inventory.addNewCI.createdDate', width: '220px', dataCelltransformer: controller.createdBy, disableSearching: true} // NO I18N
        }
    },
    selectCell : function(table_data, controller) {
        var row_data = table_data.row_data, del_disable = '', name = 'rtRow_cbox'; // NO I18N

        if (sdp_user.ROLES.indexOf('HelpdeskConfig') < 0) {
            if ((Number(row_data.created_by.id) !== sdp_user.LOGGEDIN_USERID)) {
                del_disable = 'disabled'; // NO I18N
                name = 'rtRow_cbox_dis'; // NO I18N
            }
        }
        return '<input type="checkbox" name="' + name + '" value="' + row_data.id + '" ' + del_disable + ' data-table-checkbox>';
    },
    createdBy : function(table_data, controller) {
        var row_data = table_data.row_data, userName = escapeForUDF(row_data.created_by.name), createdTime = row_data.created_time.display_value,
            onTxt = translate('sdp.common.on'), title = userName + " " + onTxt + " " + createdTime;

        return '<span rel="uitip" title="' + title + '"><span>' + userName + '</span></br><span class="text-muted">' + onTxt + ' </span><span>' + createdTime + '</span></span>'; // NO I18N
    },
    processName: function(table_data, controller) {
        var row_data = table_data.row_data, name = escapeForUDF(row_data.name);

        return '<a href="/" name="addNEdit" id="' + row_data.id + '" rel="uitip" title="' + escapeForUDF(name) + '">' + name + '</a>'; // NO I18N
    },
    processContent: function(table_data, controller) {
        return table_data.row_data.description.replace(/<\/?[^>]+(>|$)/g, '');
    },
    statusCell : function(table_data, controller) {
        var row_data = table_data.row_data, css_class = 'enable', data = 1, title = translate('sdp.change.sla.enabled') + '. ' + translate('common.click.to.disable'); // NO I18N

        if (row_data.inactive) {
            css_class = 'disable-no'; // NO I18N
            data = 0;
            title = translate('sdp.change.sla.disabled') + '. ' + translate('common.click.to.enable');
        }
        if (sdp_user.ROLES.indexOf('HelpdeskConfig') < 0) {
            if (Number(row_data.created_by.id) !== sdp_user.LOGGEDIN_USERID) {
                css_class += ' opac5 hover-off'; // NO I18N
                title = '';
            }
        }
        return '<a href="/" class="cspr icon-sm ' + css_class + '" id="' + row_data.id + '"  rel="uitip" title="' + title + '" name="changeStatus" data="' + data + '"></a>'; // NO I18N
    },
    privacyCell : function(table_data, controller) {
        var privacy = 'lock1', title = 'sdp.admin.replytemplate.privacy'; // NO I18N

        if (table_data.row_data.is_public) {
            privacy = 'flat user-group-new'; // NO I18N
            title = 'sdp.admin.replytemplate.privacy.public'; // NO I18N
        }

        return '<span class="cspr ' + privacy + ' icon-md pos-rel top0" rel="uitip" title="' + translate(title) + '"></span>'; // NO I18N
    },
    formatRTList: function(state) {
        var title = translate('sdp.dashboard.common.private'), css_class = 'cspr lock1 icon-sm top-2'; // NO I18N

        if (state.is_public) {
            title = translate('sdp.dashboard.common.public');
            css_class = 'cspr icon-sm user-group'; // NO I18N
        }
        return "<div title='" + title + "'><span class='" + css_class + "'></span> " + e_html(state.name) + "</div>"; // NO I18N

    },
    processReplyRTList: function(th) {
        th.find('#addRT').on('click', function(e) {
            // Switching to new reply template view from reply/forward window
            window.editor2.setContent('');
            th.find('#add_target').find('#name').val('').end().find('#template-reply1 input').prop('checked', true);
            th.find('#add_target').animate({left: '0%'}, 200).removeClass('hide').end().find('#notifyWO').hide().end().find('#rtList').select2('close'); // NO I18N

            var targetObj = jQuery('#add_target'), data = targetObj.find('#rtVar').data();
            setTimeout(function() { $replyTemp.initZE(data, targetObj); }, 400);
        });
    },
    showReplyWindow: function(json) {
        jQuery('#add_target').animate({left: '100%'}, 200).addClass('hide');
        jQuery('#send-notification-section').addClass("show").removeClass("hide");

        if (json != undefined && json.is_reply_add) {
            setTimeout(function() { $replyTemp.useNow(json); }, 1);
        }
    },
    useNow: function(json) {
        if(confirm(translate('sdp.admin.replytemplate.use'))){
            jQuery('#rt_requests').select2("data", {id:json.reply_template.id, name: json.reply_template.name}).trigger('change');//No I18N
        }
    }
};

var $replyTemp = new replyTemp.ReplyTemplate();


function showjQModal(id, w, minh, maxh, resize, mod)
{
    jQuery('#' + id).dialog({
        width: w,
        minHeight: minh,
        maxHeight: maxh,
        resizable: resize,
        modal: mod,
        zIndex: 988,
        create: function () {
            jQuery(this).find('.scroller').css({
                "maxHeight": maxh, // No I18N
                "minHeight": minh, // No I18N
                "overflow": 'auto' // No I18N
            });
        }
    });
    setTimeout(function() { jQuery('#' + id).dialog({position:{at: "center center"}}); }, 1);
}

function closejQModal(id)
{
    jQuery(".ui-dialog:visible").find("#" + id).dialog("close");
}

