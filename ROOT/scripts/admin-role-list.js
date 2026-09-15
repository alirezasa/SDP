var $roleList = {
    loadlistview: function () {
        var commonjson = {
            "container": "#listview_div", //No I18n
            "mode": "list", //No I18n
            "name": "roles", //No I18n
            "entity_name": "roles", //No I18n
            "additional_details": { //No I18n
                "custom_class": "listview no-border" //No I18n
            },
            "list": { //No I18N
                "meta": { //No I18N
                    "view": "table", //No I18N
                    "getmetainfo": "false", //No I18N
                    "header": { //No I18N
                        "actions": { //No I18N
                            "custom_action_1": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fl mr10", //No I18N
                                "renderhtml": '<button id="role_add_btn"  class="btn btn-default btn-sm fl mr10" type="button"  title="' + translate("sdp.admin.change.template.addNewRole") + '" data-non-action="role_list">' + '<span class="common-sprite icon-xs common-add-icon4 mr5"></span>' + translate('sdp.admin.change.template.addNewRole') + '</button>',
                            },
                            "pagination_comp": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "btn-group" //No I18N
                            },
                            "custom_action_2": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fr", //No I18N
                                "renderhtml": '<a class="fr cur-ptr mr25 thm-spr" search-filter="role" entity-key="Role" data-id="roles" id="role_history_btn" rel="noopener noreferrer"><span class="disp-ib vmiddle mt2 mr5"> <svg width="20" height="20"><use href="#crspr-history-ic"></use></svg></span>' + translate('common.viewhistory') + '</a>'
                            },
                        },
                    },

                    "additional_options": { //No I18N
                        "get_total_count": false, //No I18N
                        "callback-url": 'roles', //No I18N
                        "width": "$roleList.getWidth", //No I18N
                        "height": "$roleList.getHeight", //No I18N
                        "callback-rowfunction": "$roleList.row_input_data", //No I18N
                        "row_inputdata": "$roleList.row_input_data", //No I18N
                        "other-options": "$roleList.getOtherOptions", //No I18N
                    },

                    "cells": { //No I18N
                        "fields_required": { //No I18N
                            "delete": { //No I18N
                                "type": "icon", //No I18N
                                "hide_label": true, //No I18N
                                "default": true, //No I18N
                                "width": "3%", //No I18N
                                "render": "$roleList.renderDeleteIcon", //No I18N
                                "td_class": "pos_rel", //No I18N
                            },
                            "role_association": { //No I18N
                                "type": "icon", //No I18N
                                "hide_label": true, //No I18N
                                "default": true, //No I18N
                                "width": "3%", //No I18N
                                "render": "$roleList.renderRoleAssociationIcon", //No I18N
                                "td_class": "pos_rel", //No I18N
                                "is_show": !sdp_app.IS_AE,
                            },
                            "edit": { //No I18N
                                "type": "icon", //No I18N
                                "hide_label": true, //No I18N
                                "default": true, //No I18N
                                "width": "3%", //No I18N
                                "render": "$roleList.renderEditIcon", //No I18N
                                "td_class": "pos_rel", //No I18N
                            },
                            "name": { //No I18N
                                "name": "name", //No I18N
                                "render": "$roleList.renderNameCell", //No I18N
                                "width": "200px", //No I18N
                                "sortable": false, //No I18N
                            },
                            "description": { //No I18N
                                "name": "description", //No I18N
                                "width": "300px", //No I18N
                                "render": "$roleList.renderDescriptionCell", //No I18N
                                "sortable": false, //No I18N
                            },
                        }
                    },
                },
                "options": { //No I18N
                    "component": { //No I18N
                        "callback": { //No I18N
                            "post": function (tableinfo) {} //No I18N
                        }
                    }
                }
            },
        };
        cm = new MC(commonjson);
    },
    renderDeleteIcon: function (table) {
        if (table.row_data.can_delete) {
            return '<div name="role_delete_btn" data-id="' + parseInt(table.row_data.id) + '"class="disp-b tc ml10 cur-ptr a11yemphasize"><span title="' + translate("sdp.admin.roles.listview.delete.tooltip") + ' ' + e_attr(table.row_data.name) + '" class="cspr spad-delete icon-md"></span></div>';
        } else {
            return '<div class="disp-b tc ml10 cur-na" ><span class="cspr spad-delete icon-md opac5"></span></div>';
        }
    },
    renderRoleAssociationIcon: function (table) {
        return '<a href="#"' +  (table.row_data.name == 'SDGuest' ? 'id="guest_role_association_btn"' : 'name="role_association_btn"') + ' data-id=' + parseInt(table.row_data.id) + ' > <img class="mycalendar-viewicon a11yemphasize" border="0" title="' + translate('sdp.admin.role.roletotech.title') + '" src="/images/spacer.gif" ></a>';
    },
    renderEditIcon: function (table) {
        if (table.row_data.can_edit) {
            return '<div name="role_edit_btn" data-id="' + parseInt(table.row_data.id) + '"class="disp-b tc cur-ptr a11yemphasize"><span role="img" class="cspr edit-modern1 icon-md"  title="' + translate("sdp.admin.change.tooltip.edit.role") + ' ' + e_attr(table.row_data.name) + '" rel="uitip"></span></div>';
        } else {
            return '<div class="disp-b tc cur-na"  ><span role="img" class="cspr edit-modern1 icon-md opac5"  rel="uitip"></span></div>';
        }
    },
    renderNameCell: function (table) {
        if (table.row_data.can_edit) {
            return '<a  name="role_edit_btn" data-id="' + parseInt(table.row_data.id) + '"class="cur-ptr" title="' + translate("sdp.admin.change.tooltip.edit.role") + '">' + e_html(table.row_data.name) + '</a>';
        } else {
            return '<div>' + e_html(table.row_data.name) + '</div>';
        }
    },
    renderDescriptionCell: function (table) {
        const description = table.row_data.description == '' || table.row_data.description == null ? "-" : table.row_data.description;
        return '<div class="d_w" rel="uitip" mode_ellipsis="true" title="' + e_attr(description) + '">' + e_html(description) + '</div>';
    },
    getHeight: function () {
        return '100%';
    },
    getWidth: function () {
        return '100%';
    },
    row_input_data: function (table_info) {
        let inputObject;
        if (!table_info) {
            inputObject = {
                list_info: {
                    row_count: "10",
                    start_index: "1"
                }
            }
        } else {
            inputObject = {
                list_info: table_info.list_info
            };
        }

        // Excluding Dc related roles in the list view
        const search_criteria = {
            field: "name", //No I18N
            condition: "is not", //No I18N
            values: ["DCGuest", "DCAdmin", "MDMPAdmin", "MDMPGuest"] //No I18N
        }

        inputObject.list_info.search_criteria = search_criteria;
        return inputObject;
    },
    getOtherOptions: function () {
        const _self = this;
        return {
            callbackAfterBodyRender: function () {
                _self.initEvent();
                jQuery("#roles_list_div").removeClass("tablebrd1");
                jQuery("#role_history_btn").off().on('click', function () {
                    viewModuleHistory(this);
                });
            }
        }
    },
    initEvent: function () {

        jQuery("[name='role_association_btn']").off().on('click', function (e) {
            const url = '/RoleDef.do?mode=viewRoleToTech&id=' + jQuery(this).attr('data-id'); //No I18N
            showURLInDialog(url, "position=center,closeButton=no,modal=yes") //No I18N
        });

        //No need to show roles association link for SDGuest role as it will be associated with thousands of users
        jQuery("#guest_role_association_btn").off().on('click', function () {
            const url = '/setup/RoleToTechMapping.jsp?mode=viewRoleToTech&roleName=SDGuest';
            showURLInDialog(url, "position=center,closeButton=no,modal=yes") //No I18n
        });

        jQuery("[name='role_delete_btn']").off().on('click', function (e) {
            delete_role(jQuery(this).attr('data-id'));
        });

        jQuery("[name='role_edit_btn']").off().on('click', function (e) {
            window.location.href = 'RoleDef.do?mode=edit&id=' + jQuery(this).attr('data-id');
        })

        jQuery("#role_add_btn").off().on('click', function () {
            jQuery("#sform").removeClass('hide');
            swapLayerAndSetFocusOnRoleDefPage();
        });
    }

}
