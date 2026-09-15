var $assetReplenishList = {
    init: function () {
        var self = this;
        this.getTemplateData(function (data) {
            self.filterData = sdp_user.CLIENT_CONF["asset_replenishment_filter"] || {}; // No I18N
            self.renderList(data);
            var promise = self.initFilter();
            self.initList(promise);
        });
        initTooltip("#asst_repln_st_info"); // No I18N
        jQuery(window).on('resize', function () {
            self.handleOverflow();
        });
    },
    handleOverflow: function () {
        var width = sdp_user.ROLES.indexOf("SDAdmin") > -1 ? 1580 : 1387;
        var isOverflowed = window.innerWidth<=width;
        jQuery("#repln_header_rt_sect").toggle(!isOverflowed);
        jQuery("#repln_header_rt_sect_icon").toggle(isOverflowed);
    },
    getTemplateData: function (callbak) {
        var getUrl = "/api/v3/asset_replenishments/_links"; // No I18N
        if(isMSP)
        {
            getUrl += "?persistentAccountId="+getAccountId(); // No I18N
        }
        sdpAjax({
            url: getUrl,
            success: function (response) {
                var links = {};

                response._links.forEach(function (link) {
                    links[link.name] = link;
                });

                links.data = sdp_user.CLIENT_CONF["asset_replenishments_list"] || {}; // No I18N
                links.canUpdateState = sdp_user.ROLES.indexOf("SDAdmin") > -1;

                callbak(links);
            }
        });
    },
    redirectTo: function (view) {
        var url, container;
        var isHistory = view === "history"; //NO I18N
        var historyContainer = "asst_repln_histroy"; //NO I18N
        var listContainer = "asst_repln_list_container"; //NO I18N

        jQuery("#" + listContainer).toggle(!isHistory); //No I18N
        jQuery("#" + historyContainer).css("height", (this.getHeight() + 43) + "px").toggle(isHistory); //No I18N
        jQuery("#asst_rpln_histry_header").toggle(isHistory); //No I18N

        if (isHistory) {
            container = historyContainer;
            url = "/common/ViewHistory.jsp?module=asset_replenishments&key=repln_sort_order"; //No I18N
            jQuery("#" + container).html('<div class="pos-rel">' + ajaxBar() + '</div>').load(url);
        } else {
            container = listContainer;
            //refresh, if list view already loaded
            if (!jQuery("#" + container).is(':empty')) {
                $assetReplenishList.refreshList();
                return;
            }
            $assetReplenishList.init();
        }
    },
    renderList: function (links) {
        renderhbs("#asst_repln_list_container", "assets-replenishment-listview-template", links, null, "asset-replenishment"); // No I18N
    },
    initList: function (promise) {
        var self = this;
        promise.then(function () {
            WebComponents.render("webc-asst-replenishmentList"); // No I18N
            self.tableObject = WebComponents.getInstance("webc-asst-replenishmentList");// No I18N
        });
    },
    initFilter: function () {
        var self = this;

        this.select2({
            id: "site_filter", // No I18N
            url: "asset_replenishments/site", // No I18N
            field: "site", // No I18N
            width: "160px", // No I18N
            placeholder: getMessageForKey("sdp.admin.org.technician.allsite"),
            allowClear: true,
            default_option: sdp_user.ROLES.includes("Resources not in any site") || sdp_user.ROLES.includes("SDAdmin") ? { id: "-1", text: translate("common.site.nosite") } : "",
            change: function (id) {
                self.filterData.site = id;
                self.filter();
                self.personalizeFilter();
            }
        });

        $assetReplenishList.handleOverflow();

        return jQuery.when(
            self.setProductTypeFilter(),
            self.setSiteFilterData()
        )
    },
    setProductTypeFilter: function () {
        var self = this;
        var promise = hierarchySelect2.init({
            id: "asset_module_filter", // No I18N
            url: "/api/v3/asset_replenishments/asset_module", //No I18N
            entity: "asset_module", //No I18N
            width: "175px", // No I18N
            allowClear: true,
            disabled: false,
            placeholder: getMessageForKey("sdp.admin.snmp.all.producttype"),
            list_info : {"sort_field" : "display_name", "sort_order" : "asc"}, //No I18N
            displayField : "display_name", // NO I18N
            events: {
                change: function (e) {
                    self.filterData.asset_module = e.val;
                    self.filter();
                    self.personalizeFilter();
                }
            }
        });
        return jQuery.when(
            promise && promise.then(function () {
                self.setFilter("asset_module")// No I18N
            })
        )
    },
    filter: function () {
        var self = $assetReplenishList;
        self.search();
        self.tableObject.changeFilterString("clearOnly");//No I18N
    },
    setSiteFilterData: function () {
        var id = this.filterData.site;
        if (id == -1) {
            jQuery("#site_filter").select2("data", {// No I18N
                id: id,
                text: translate("common.site.nosite")
            });
            return true;
        } else {
            return this.setFilter("site");// No I18N
        }
    },
    setFilter: function (field) {
        var self = this;
        var id = this.filterData[field];
        if (!id) {
            return true;
        }
        return sdpAjax({
            url: "/api/v3/asset_replenishments/" + encodeURIComponent(field),// No I18N
            async: false,
            data: sdpAjaxInputData({
                list_info: {
                    search_criteria: {
                        "field" : "id",         // No I18N
                        "condition" : "is",     // No I18N
                        "value": id             // No I18N
                    }
                }
            }),
            success: function (response) {
                var data = response[field][0];
                if (data) {
                    if(field === "site") { // NO I18N
                        jQuery("#" + field + "_filter").select2("data", {
                            id: data.id,
                            text: data.name
                        });
                    } else if(field === "asset_module") { // NO I18N
                        jQuery("#" + field + "_filter").select2("data", {
                            id: data.id,
                            text: e_html(data.display_name)
                        });
                        jQuery("#" + field + "_filter").select2("val",
                            data.id
                        );
                    }
                } else {
                    delete self.filterData[field];
                }
            },
            ignorefailuremessage: true
        });
    },
    getSelectedListHtml: function (assetReplenishment) {
        var product = assetReplenishment.product;

        if (!product) {
            return getMessageForKey("sdp.admin.servicecatalog.resource.question.answer.options.allproducts");
        }

        return e_html(product.name);
    },
    personalizeFilter: function () {
        var self = $assetReplenishList;
        var data = {};
        var site = self.filterData.site;
        var productType = self.filterData.asset_module;
        if (site) {
            data.site = site;
        }
        if (productType) {
            data.asset_module = productType;
        }
        addPersonalization("asset_replenishment_filter", data); // No I18N
    },
    getProductTypeCriteria: function (id) {
        if (id === "") {
            return {};
        }
        return { "field": "asset_module.id", "condition": "is", "value": id, "logical_operator": "and" };// No I18N
    },
    getSiteCriteria: function (siteId) {
        if (siteId === "") {
            return {};
        }
        siteId = siteId == -1 ? null : siteId;
        return { "field": siteId ? "site.id" : "site", "condition": "is", "value": siteId };// No I18N
    },
    getWidth: function () {
        var widthTable = window.innerWidth - jQuery("#asset_left_pane_container").width() - 25;  // No I18N
        return (jQuery("body[data-header-tabs=topbar]").length) ? widthTable : widthTable - jQuery(".sidebar-container").width(); // No I18N
    },
    getHeight: function () {
        function getHeightOf(ids) {
            return ids.reduce(function (totalHeight, id) {
                return totalHeight + (jQuery("#" + id).outerHeight() || 0)
            }, 0);
        }
        return jQuery(window).height() - (120 + getHeightOf(["top-subheader", "topheader-fixed", "sdp-chat-bar", "securityrisk"])); // No I18N
    },
    getRowInputData: function (table_info) {
        var inputObject = {};
        var list_info = table_info.list_info;
        var siteId = this.filterData.site;
        var productTypeId = this.filterData.asset_module;
        var criteria = list_info.search_criteria = [];
        table_info.list_info.fields_required = ["id", "site", "asset_module", "product", "created_by", "inventory_count", "threshold_count"]; // No I18N

        if(isMSP)
        {
            table_info.list_info.fields_required.push("account");
        }
        if (siteId) {
            criteria.push(this.getSiteCriteria(siteId));
        }
        if (productTypeId) {
            criteria.push(this.getProductTypeCriteria(productTypeId));
        }

        inputObject.list_info = table_info.list_info;
        return inputObject;
    },
    getNoDataBannerHtml: function () {
        var self = $assetReplenishList;
        var isFilterApplied = !self.hasNoData();
        var data = {
            isFilterApplied: isFilterApplied,
            height: self.getHeight() + 89 + "px" // No I18N
        };
        if (isFilterApplied) {
            return false;
        }
        return renderhbs(null,"assets-replenishment-nodata-banner-template",data,false,"asset-replenishment",null, null, null, true);// No I18N
    },
    getNoDataString: function () {
        return renderhbs(null,"assets-replenishment-empty-listview",{
            height: this.getHeight() - 5
        },false,"asset-replenishment",null, null, null, true);
    },
    hasNoData: function () {
        var self = $assetReplenishList;
        var isIntialized = self.tableObject !== undefined;
        var listInfo;
        var searchCriteria;
        var searchFields;

        if (!isIntialized) {
            return jQuery.isEmptyObject(self.filterData) && jQuery("#asset_module_filter").val() === "";// No I18N
        }

        listInfo = self.tableObject.t_obj.table_info.list_info;
        searchCriteria = listInfo.search_criteria;
        // In UI we wont be sending this in search fields
        searchFields = listInfo.search_fields;

        return !(searchFields || (Array.isArray(searchCriteria) ? searchCriteria.length > 0 : !jQuery.isEmptyObject(searchCriteria)))
    },
    getSelectedIds: function () {
        var ids = [];

        jQuery("#asset_replenishments_body [data-table-checkbox]:checked").map(function (index, checkbox) {
            ids.push(parseInt(checkbox.value));
        });

        return ids;
    },
    loadForm: function (id, isBulkEdit) {
        if (isBulkEdit) {
            id = this.getSelectedIds();
        }
        $assetReplenishForm.initForm(id);
        initTooltip("#asst_repln_form");  // No I18N
    },
    getInventoryCountHtml: function (table) {
        var count = table.row_data.inventory_count;
        return count || "0";
    },
    getEditIconHtml: function (table) {
        var id = table.row_data.id;
        return '<a class="cur-ptr disp-b tc" data-event="click" data-handler="$assetReplenishList.loadForm(' + id + '); return false;" nonce="'+sdpNonce+'">\
                <span role="img" class="tc-edit" title="' + translate("sdp.common.edit") + '" rel="uitip">\
                </span>\
            </a>';
    },
    getProductTypeHtml: function (table) {
        var asset_module = e_html(table.row_data.asset_module.display_name);
        return '<div class="d_w" rel="uitip" mode_ellipsis=true title="' + asset_module + '">' + asset_module + '</div>';    // No I18N'
    },
    getProductHtml: function (table) {
        var product = table.row_data.product, productName;
        productName = product ? product.name : getMessageForKey("sdp.admin.servicecatalog.resource.question.answer.options.allproducts");
        return '<div class="d_w" rel="uitip" mode_ellipsis=true title="' + e_attr(productName) + '">' + e_html(productName) + '</div>';    // No I18N
    },
    getAccountInfo: function(table){
        var account = e_attr(table.row_data.account.name);
        return account;
    },
    loadAssetStatePopup: function () {
        var self = this;
        jQuery.when(
            sdpAjax({
                url: "/api/v3/asset_replenishment_states",  //get selected states // No I18N
                data: sdpAjaxInputData({
                    list_info: { row_count: 100 }
                })
            }),
            sdpAjax({
                url: "/api/v3/asset_replenishment_states/state",  //get state allowed value // No I18N
                data: sdpAjaxInputData({
                    list_info: { row_count: 100 }
                })
            })
        ).then(function (stateResponse, allowedValuesResponse) {
            var allowedValues = allowedValuesResponse[0].state;
            var states = stateResponse[0].asset_replenishment_states;
            var statesToDelete = states.map(function (data) {
                return data.id;
            });
            var selectedValues = states.map(function (data) {
                return data.state.id;
            });

            var options = {
                allowed_values: allowedValues,
                selected_values: selectedValues,
                dialogtitle: getMessageForKey("asset.replenishment.state"),
                saveCallBack: function (selection) {
                    if (!selection.selectedIds.length) {
                        var closeDialogReference = closeDialog;
                        closeDialog = function () { }; //don't close the dialog
                        showalert("failure", getMessageForKey("ae.common.empty.field.msg", [getMessageForKey("sdp.inventory.detailAsset.AssetState")]), "isAutoHide=false");    //No I18N
                        setTimeout(function () {
                            closeDialog = closeDialogReference; //reset close function
                        }, 1);
                    } else {
                        self.updateState(selection, statesToDelete);
                    }
                }
            };

            new BulkAssociationComponent(options);
        });
    },
    deleteStates: function (ids, callback) {
        if (!ids.length) {
            return callback();
        }
        //delete selected states then add the states
        sdpAjax({
            url: "/api/v3/asset_replenishment_states?ids=" + ids, // No I18N
            type: "delete", // No I18N
        }).then(function () {
            callback();
        });
    },
    updateState: function (selection, stateIdsTodelete) {
        var self = this;
        var states = selection.selectedObjects.map(function (state) {
            return { state: state }
        });
        this.deleteStates(stateIdsTodelete, function () {
            //add selected states
            sdpAjax({
                url: "/api/v3/asset_replenishment_states", // No I18N
                type: "POST", // No I18N
                data: sdpAjaxInputData({ asset_replenishment_states: states })
            }).then(function () {
                self.refreshList();
                showalert("success", translate("api.updated.success", [getMessageForKey("sdp.inventory.detailAsset.AssetState")]), "isAutoHide=true");  //No I18N
            });
        });
    },
    search: function () {
        var self = $assetReplenishList;
        var listInfo = self.tableObject.t_obj.table_info.list_info;
        var criteria = [];
        // In UI we wont be sending this in search fields
        var search_fields = listInfo.search_fields;
        var metaInfo = self.tableObject.t_obj.meta_info;
        var filterData = self.filterData;

        if (filterData.site) {
            criteria.push(self.getSiteCriteria(filterData.site));
        }

        if (filterData.asset_module) {
            criteria.push(self.getProductTypeCriteria(filterData.asset_module));
        }
        // Converting search fields to search criteria
        jQuery.each(search_fields, function (field, value) {
            var meta = metaInfo[field];
            var condition = "contains"; // No I18N
            if (field === "product.name" && $assetReplenishForm.hasAllProductsText(value)) {
                criteria.push({
                    "field": "product.name", // No I18N
                    "condition": "like", // No I18N
                    "value": value, // No I18N
                    "logical_operator": "and", // No I18N
                    "children": [{ "field": "product", "value": null, "condition": "is", "logical_operator": "or" }] // No I18N
                });
                return;
            } else if (field === "site.name" && $assetReplenishForm.hasNoSiteText(value)) { // No I18N
                criteria.push({
                    "field": "site.name", // No I18N
                    "condition": "like", // No I18N
                    "value": value, // No I18N
                    "logical_operator": "and", // No I18N
                    "children": [{ "field": "site", "value": null, "condition": "is", "logical_operator": "or" }] // No I18N
                });
                return;
            } else if(field === "threshold_count" && !isInteger(value)) { // No I18N
                criteria.push({
                    "field": field, // No I18N
                    "value": null, // No I18N
                    "condition": "is", // No I18N
                    "logical_operator": "AND" // No I18N
                });
                return;
            }
            if (meta && (meta.type === "long")) { // No I18N
                condition = "is"; // No I18N
            }
            if (meta && meta.lookup_field) {
                field += "." + meta.lookup_field;
            }
            criteria.push({
                "field": field, // No I18N
                "value": value, // No I18N
                "condition": condition, // No I18N
                "logical_operator": "AND" // No I18N
            });
        });

        if (criteria) {
            listInfo.search_criteria = criteria;
        }
        // deleting the search fields from list info
        delete self.tableObject.t_obj.table_info.list_info.search_fields;
        self.tableObject.refreshTable('search'); // No I18N
    },
    refreshList: function () {
        this.tableObject.refreshTable("refresh");// No I18N
    },
    select2: function (options) {
        var element = jQuery("#" + options.id);
        var validationMsg = options.validationMsg;

        //just reset list info if already initialized.
        if (element.data('select2')) {
            if (options.list_info) {
                jQuery(element).data("sdp_select2").list_info = options.list_info; // No I18N
                jQuery(element).data("sdp_select2").cache = {}; // No I18N
            }
            if (options.value) {
                jQuery(element).select2("data", options.value);// No I18N
            }
            return element;
        }

        element.prop("disabled", false); // No I18N

        var select2Options = {
            width: options.width || "100%", // No I18N
            url: [{
                url: "/api/v3/" + options.url,//NO I18N
                field: options.field,
                input_data_Callback: options.input_data_Callback
            }],
            list_info: options.list_info,
            placeholder: options.placeholder
        };

        if (validationMsg) {
            this.addValidator(element, validationMsg);
        }

        element.sdp_select2(jQuery.extend(options, select2Options));

        options.change && element.on("change", function () { // No I18N
            validationMsg && jQuery(this).valid();
            options.change(this.value, this);
        });

        options.opening && element.on("select2-opening", function () { // No I18N
            options.opening(this.value, this);
        });

        options.selecting && element.on("select2-selecting", function (e) { // No I18N
            options.selecting(this.value, e);
        });

        element.trigger("select2-opening");

        return element;
    }
};

var $assetReplenishForm = {
    select2: $assetReplenishList.select2,
    initForm: function (id) {
        var self = this;
        var isBulkEdit = this.isBulkEdit = Array.isArray(id);
        this.edit = isBulkEdit || isInteger(id);
        this.id = id;
        this.resetRowData();
        var data = $assetReplenishList.filterData;
        this.isRestrictedUser = false;


        if(!this.edit) {
            sdpAjax({
                url : "/servlet/AssetApiServlet?module=get_configurations",//NO I18N
                type : "GET",//NO I18N
                dataType : 'json',//NO I18N
                async: false,
                success : function(data){
                    $assetReplenishForm.isRestrictedUser = data.configurations.is_site_restricted_user;
                }
            });
        }

        renderhbs("#asst_repln_form_container", "assets-replenishment-form-template", this.getRowData(isBulkEdit ? id[0] : id), false, "asset-replenishment", undefined, true);//No I18N

        jQuery("#asst_repln_form").dialog({
            draggable: false,
            width: "1200px",//No I18N
            modal: true,
            open: function () {
                jQuery(this).closest("div.ui-dialog").wrap("<div id='autodialogposwrap'  class='autodialogposwrap'></div>");
            },
            beforeClose: function () {
                if (self.isFormSubmit) {
                    return true;
                }
                return self.hasUnsavedChanges() ? confirm(translate("form.leave.alert")) : true;
            },
            close: function () {
                jQuery(this).dialog("destroy");//No I18N
                jQuery("#autodialogposwrap").remove();
            }
        });

        initFormValidator("asst_repln_config_form", {}, {});//No I18N
        renderhbs("#repln_row_container", "assets-replenishment-row-template", this.getRowData(isBulkEdit ? id[0] : id),true,"asset-replenishment");//No I18N
        if (this.edit) {
            this.initThresholdCount(0);
        } else {
            initTooltip("#asst_repln_form");//No I18N
            var data = $assetReplenishList.filterData;
            if (sdp_app.IS_SITE_CONFIGURE && !this.isRestrictedUser) {
                this.setSite(this.index);
                $assetReplenishForm.resetDependentFields("site", 0);// No I18N
            } else if (this.isRestrictedUser){
                this.setSite(this.index);
                if (!data.site) {
                    jQuery("#asst_repln_site").select2('focus');// No I18N
                }
            } else {
                this.siteId = -1;
                $assetReplenishForm.resetDependentFields("site", 0);// No I18N
            }
            this.setRemoveButtonVisibility();
        }
        if (data.site) {
            this.siteId = data.site;
        } else {
            this.siteId = -1;
        }

        if (!isBulkEdit && (data.site || !sdp_app.IS_SITE_CONFIGURE)) {
            this.selectProductType();
        }
        if (this.isBulkEdit) {
            id.slice(1).forEach(function (rowId, index) {
                self.renderRow(self.getNewRowData(rowId));
                self.initThresholdCount(index + 1);
            });

            jQuery("#threshold_count_0").focus();
        }

        jQuery("#asst_repln_config_form").submit(function (e) {
            e.preventDefault();
            jQuery("#repln_frm_submt").trigger("click");
        });

        this.limit = this.defaultLimit = 100; //default maximum configuration limit
    },
    setMaxRowLimit: function (siteId) {
        var self = this;
        var configuredReplenishmentCount;
        var productCount, productTypeCount;
        jQuery.when(
            sdpAjax({
                url: "/api/v3/asset_replenishments/",//NO I18N
                data: sdpAjaxInputData({ list_info: { search_criteria: $assetReplenishList.getSiteCriteria(siteId), get_total_count: true, row_count: 0 } }),
                success: function (response) {
                    configuredReplenishmentCount = response.list_info.total_count;
                }
            }),
            sdpAjax({
                url: "/api/v3/asset_replenishments/product/",//NO I18N
                data: sdpAjaxInputData({ list_info: { get_total_count: true, row_count: 0 }, filter_criteria: { "site": siteId } }), //NO I18N
                success: function (response) {
                    productCount = response.list_info.total_count;
                }
            }),
            sdpAjax({
                url: "/api/v3/asset_replenishments/asset_module/",//NO I18N
                data: sdpAjaxInputData({ list_info: { get_total_count: true, row_count: 0 } }),
                success: function (response) {
                    productTypeCount = response.list_info.total_count;
                }
            })
        ).then(function () {
            self.limit = productCount + productTypeCount - configuredReplenishmentCount;
        });
    },
    resetRowData: function () {
        this.index = 0; //to generate unique row elements id
        this.count = 1;
        this.productByProductType = {};//to get products of each product type
        this.product = {}; //to latest product of each row
        this.productType = {}; //to latest product of each row
        this.productTypeLimit = {};
    },
    getTableData: function (id) {
        return $assetReplenishList.tableObject.loadedRecords[id];
    },
    getNewRowData: function (id) {
        this.index++;
        this.count++;
        return this.getRowData(id);
    },
    getRowData: function (id) {
        return {
            index: this.index,
            count: this.count,
            edit: this.edit,
            isRestrictedUser : this.isRestrictedUser,
            data: this.getTableData(id) //load data for edit
        }
    },
    addRow: function (addButton) {
        var limit = this.limit;
        var container = jQuery("#asst_repln_frm_lst_cnt");
        var errorMsg;

        if (this.count >= this.defaultLimit) {
            errorMsg = translate("common.limit.message", [this.defaultLimit]);
        } else if (this.count >= limit) {
            errorMsg = getMessageForKey("ae.replenishment.config.noproducts");
        }

        if(errorMsg) {
            showalert("failure", errorMsg, "isAutoHide=false"); //NO I18N
            return false;
        }

        this.renderRow(this.getNewRowData());
        jQuery(addButton).css("visibility", "hidden"); //hide previous row add button //No I18N

        this.setRemoveButtonVisibility();
        this.selectProductType();

        container.animate({ scrollTop: container.prop('scrollHeight') }, 1000); //scroll to bottom //No I18N
    },
    renderRow: function (data) {
        renderhbs("#repln_row_container", "assets-replenishment-row-template", data,true,"asset-replenishment");//No I18N
        initTooltip("[data-row-index=" + this.getRowData().index + "]"); //No I18N
    },
    removeRow: function (removeButton) {
        var index = removeButton.dataset.index;

        jQuery(removeButton).closest("tr").remove(); //remove the row //No I18N

        this.count--;
        this.setRemoveButtonVisibility();//hide remove button if there is only one row.
        this.showAddButton();
        this.disableAddButton(false);

        //delete field data of the row
        this.deleteProductData(index);
        delete this.productType[index];
    },
    showAddButton: function () {
        jQuery('[data-field="add-button"]:last').css("visibility", "visible"); //show last row add button //No I18N
    },
    disableAddButton: function (disabled) {
        disabled = disabled === undefined ? true : false;
        var btn = jQuery('[data-field="add-button"]:last').prop("disabled", disabled); //No I18N
        btn.parent().toggleClass("cur-na", disabled); //No I18N
    },
    setRemoveButtonVisibility: function () {
        var noOfRows = this.count;
        if (noOfRows === 2) {
            jQuery('[data-field="remove-button"]:first').css("visibility", "visible"); //No I18N
        } else if (noOfRows === 1) {
            jQuery('[data-field="remove-button"]').css("visibility", "hidden").removeClass("cur-na"); //No I18N
        }
    },
    hasUnsavedChanges: function () {
        var isChanged = false;
        jQuery("#asst_repln_config_form").find("input[name]").not('[data-field="site"]').each(function () { //NO I18N
            isChanged = this.value !== this.defaultValue;
            return !isChanged; // return if at least one element value has changed
        });
        return isChanged;
    },
    setSite: function () {
        var self = this;
        var siteID = jQuery("#site_filter").select2("data") != null ? jQuery("#site_filter").select2("data").id : null;  //NO I18N
        return this.select2({
            id: "asst_repln_site", //No I18N
            url: "asset_replenishments/site", //No I18N
            field: "site", // No I18N
            allowClear: self.isRestrictedUser ? false : true,
            value: siteID != null && siteID != -1 ? jQuery("#site_filter").select2("data") : null, // No I18N
            selecting: function (value, e) {
                var hasChanged = e.target.value !== e.val;
                if (hasChanged && self.hasUnsavedChanges() && !confirm(getMessageForKey("ae.replenishment.change.dataloss.alert"))) {
                    e.preventDefault();
                    return false;
                }
                return true;
            },
            change: function (id) {
                jQuery('[data-row-index]:not(:first)').remove();
                var index = jQuery('[data-row-index]').data("row-index"); //first row index //No I18N
                self.siteId = id!="" ? id : null;
                self.resetRowData(); //reset data
                self.resetDependentFields("site", index); //No I18N
                self.disableAddButton(false);
                self.showAddButton();
                self.setRemoveButtonVisibility();//hide remove button
                self.setMaxRowLimit(self.siteId);
            }
        });
    },
    //return products id that should not present in the product allowed values
    //which prevents adding multiple threshold limit for the same product of a product type.
    getExcludedProductsId: function (rowIndex, productId) {
        var products = Object.values(this.productByProductType[this.productType[rowIndex]]);
        var index = products.indexOf(productId);

        if (index > -1) { //product is avilable only when it's selected.
            products.splice(index, 1); //ignore current product id as should not be removed from allowed values.
        }
        return products;
    },
    setMaxProductTypeLimit: function (productTypeId) {
        var self = this;
        var listInfo;

        if (!productTypeId) {
            return false;
        }

        listInfo = this.getProductCriteria(productTypeId);
        listInfo.get_total_count = true;
        listInfo.row_count = 0;

        return sdpAjax({
            url: "/api/v3/asset_replenishments/product/",//No i18n
            data: sdpAjaxInputData({ 
                list_info: listInfo,
                filter_criteria: { "site": self.siteId ,"asset_module": productTypeId} //NO I18N
            }),
            success: function (response) {
                var allProducts = response.product.length; //if "all products" option available(length will be one). //No i18n
                self.productTypeLimit[productTypeId] = response.list_info.total_count + allProducts;
            }
        });
    },
    getOccurrencesOf: function (object, value) {
        return Object.values(object).reduce(function (count, currentValue) {
            return currentValue === value ? count + 1 : count;
        }, 0);
    },
    getProductTypeCount: function (productType) {
        return this.getOccurrencesOf(this.productType, productType);
    },
    setProductType: function (index, value) {
        var self = this;

        productTypeSelect2 = hierarchySelect2.init({
            id: "asst_repln_asset_module_" + index, //No I18N
            url: "/api/v3/asset_replenishments/asset_module", //No I18N
            entity: "asset_module", //No I18N
            disabled: false,
            validationMsg: translate("common.validation.select", [translate("sdp.helpdesk.common.citype")]),
            selectedValue: value,
            rules:{ add:
                {
                    required: function (e) {
                        return jQuery(e).select2("data") === null; //No I18N
            },
                    messages: {
                        required: translate("common.validation.select", [translate("sdp.helpdesk.common.citype")]),
                    }
                }
            },
            formatResult: function(data){
                return e_html(data.display_name)
            },
            formatSelection: function(data){
                return e_html(data.display_name)
            },
            events: {
                "change": function (e) { //No I18N
                    var id = e.val;
                    self.onProductTypeSelect(id, index);
                jQuery("#asst_repln_product_" + index).select2("open"); //No I18N
            },
                "processResults": function (search_data, data) { //No I18N
                var name = data.name || data.text;
                var id = data.id;
                if (!self.canIncludeProductType(id, index)) {
                    return false;
                }

                var processedResult = {
                    id: id || name,
                    text: name
                };
                search_data.push(processedResult);
                },

                "input_data_Callback": function (options, input_data) { //No I18N
                    input_data.filter_criteria = { "site": self.siteId }; //NO I18N
                    return input_data;
                }
            }
        });

        productTypeSelect2.then(function(){
            jQuery("#asst_repln_asset_module_" + index).select2("focus");// No I18N
        })
    },
    canIncludeProductType: function (id, index) {
        var isProductTypeLimitReached = this.getProductTypeCount(id) >= this.productTypeLimit[id];
        if (isProductTypeLimitReached && this.productType[index] !== id) {
            return false;
        }
        return true;
    },
    onProductTypeSelect: function (id, index) {
        if (!this.productByProductType.hasOwnProperty(id)) {
            this.productByProductType[id] = {};
        }
        this.productType[index] = id;
        this.resetDependentFields("asset_module", index); //No I18N
        this.setMaxProductTypeLimit(id);
    },
    getProductCriteria: function (productTypeId) {
        return {
            "search_criteria": [{ //No I18N
                "field": "all_product_type.id", //No I18N
                "condition": "is", //No I18N
                "value": productTypeId //No I18N
            }],
             "sort_field": "name" //No I18N
        }
    },
    setProduct: function (index) {
        var self = this;
        var elementId = "asst_repln_product_" + index; // No I18N
        var siteId = self.siteId;
        function getListInfo() {
            var productTypeId = self.productType[index]; //get latest product type of the row
            return self.getProductCriteria(productTypeId);
        }

        this.select2({
            id: elementId,
            url: "asset_replenishments/product", //No I18N
            field: "product", //No I18N
            list_info: getListInfo(),
            input_data_Callback: function (options, input_data) {
                input_data.filter_criteria = { "site": siteId, "asset_module": self.productType[index] }; //NO I18N
                return input_data;
            },
            validationMsg: translate("common.validation.select", [getMessageForKey("common.newproduct")]),
            change: function (productId) {
                var productType = self.productType[index];
                productId = isNaN(productId) ? null : productId; //set null for "All products" as it doesn't has id. //No I18N

                self.product[index] = self.productByProductType[productType][index] = productId;
                self.resetDependentFields("product", index); //No I18N
            },
            processResults: function (search_data, data) {
                var name = data.name || data.text;
                var id = data.id;
                var selectedProducts = self.productByProductType[self.productType[index]];
                var searchText = jQuery("#" + elementId).data("select2").search.val();

                //remove "all products" options if already selected for the product type.
                if (self.product[index] !== null && id === null && selectedProducts && Object.values(selectedProducts).indexOf(null) > -1) {
                    return false;
                }

                if (searchText &&  self.hasAllProductsText(name) && !self.hasAllProductsText(searchText)) {
                    return false;
                }

                var processedResult = {
                    id: id || name,
                    text: name
                };
                search_data.push(processedResult);
            },
            opening: function () {
                var listInfo = getListInfo();

                //remove products from allowed values that already added for other rows
                var excludedIds = self.getExcludedProductsId(index, self.product[index]);

                excludedIds.length && listInfo.search_criteria.push({
                    "field": "id", //No I18N
                    "condition": "is_not", //No I18N
                    "values": excludedIds, //No I18N
                    logical_operator: "AND" //No I18N
                });

                self.select2({
                    id: elementId,
                    list_info: listInfo
                });
            }
        });
    },
    resetDependentFields: function (field, index) {
        switch (field) {
            case "site": //No I18N
                this.disableDependentFields("site", index); //No I18N
                this.productTypeLimit = {};
                delete this.productType[index];
                this.selectProductType(index);
                break;

            case "asset_module": //No I18N
                this.setProduct(index);
                this.deleteProductData(index);
                this.disableDependentFields("product", index); //No I18N
                break;

            case "product": //No I18N
                this.setInventoryCount(index);
                this.initThresholdCount(index);
                break;
        }
    },
    disableDependentFields: function (field, index) {
        var isSite = field === "site";// No I18N
        if (isSite) {
            jQuery("#asst_repln_asset_module_" + index).val("").prop("disabled", true).select2('destroy');
        }
        if (isSite || field === "asset_module") {
            jQuery("#asst_repln_product_" + index).val("").prop("disabled", true).select2('destroy');
        }

        jQuery("#asst_repln_" + field + "_" + index).select2("val", ""); //reset selected value //No I18N
        jQuery("#inventory_count_" + index).text(getMessageForKey("ae.common.not.applicable"));
        jQuery("#threshold_count_" + index).val("").prop("disabled", true);
    },
    deleteProductData: function (index) {
        var productTypeId = this.productType[index];

        if (productTypeId) {
            delete this.productByProductType[productTypeId][index]; //delete old product of the row(as product type changed).
            delete this.product[index];
        }
    },
    toI18nLowerCase: function(str) {
        try {
            return str.toLocaleLowerCase(sdp_user.LOCALE.replace("_", "-"));
        } catch (e) {
            return str.toLocaleLowerCase();
        }
    },
    hasSubString: function (str1, str2) {
        return this.toI18nLowerCase(str1).indexOf(this.toI18nLowerCase(str2)) !== -1;
    },
    hasNoSiteText: function (value) {
        return this.hasSubString(getMessageForKey("sdp.admin.technician.addtechnician.nosite"), value);
    },
    hasAllProductsText: function (value) {
        return this.hasSubString(translate("sdp.admin.servicecatalog.resource.question.answer.options.allproducts"), value);
    },
    initThresholdCount: function (index) {
        var element = jQuery("#threshold_count_" + index);
        if (!this.isBulkEdit) {
            element.prop("disabled", false).focus(); //No I18N
        }

        jQuery(element).rules("add", { //No I18N
            required: true,
            digits: true,
            min: 1,
            max: Number.MAX_SAFE_INTEGER,
            messages: {
                required: translate("common.validation", [getMessageForKey("asset.threshold.count")]),
                digits: getMessageForKey("ae.barcode.formValidation.validNumber"),
                min: translate("form.value.minimumvalue.alert", [0]),
                max: translate("form.value.maximumvalue.alert", [Number.MAX_SAFE_INTEGER])
            }
        });
    },
    selectProductTypeValue: function(id, index) {
        if (!this.canIncludeProductType(id)) {
            this.setProductType(index);
        } else {
            this.setProductType(index, jQuery("#asset_module_filter").select2("data")); // No I18N
            this.onProductTypeSelect(id, index);
            setTimeout(function() {
                jQuery("#asst_repln_product_" + index).select2("focus");// No I18N
            }, 1);
        }
    },
    selectProductType: function() {
        var self = this;
        var data = $assetReplenishList.filterData;
        var index = $assetReplenishForm.index;
        var id = data.asset_module;


        if (id) {
            if (this.productTypeLimit[id] === undefined) {
                var promise = this.setMaxProductTypeLimit(id);
                promise.then(function () {
                    self.selectProductTypeValue(id, index);
                });
            } else {
                this.selectProductTypeValue(id, index);
            }
        } else {
            this.setProductType(index);
        }
    },
    setInventoryCount: function (index) {
        var siteId = this.siteId;
        var productTypeId = this.productType[index];
        var productId = this.product[index];

        sdpAjax({
            url: "/api/v3/asset_replenishments/_get_inventory_count", //No I18N
            data: sdpAjaxInputData({
                "site": { "id": siteId }, //No I18N
                "product": productId ? { "id": productId } : null, //No I18N
                "asset_module": { "id": productTypeId } //No I18N
            }),
        }).then(function (response) {
            jQuery("#inventory_count_" + index).text(response.inventory_count.assets_count);
        });
    },
    addValidator: function (element, message) {
        jQuery(element).rules("add", { //No I18N
            required: function (e) {
                return jQuery(e).select2("data") === null; //No I18N
            },
            messages: {
                required: message,
            }
        });
    },
    ajax: function (options, successMsg) {
        var self = this;
        var button;
        if (!jQuery("#asst_repln_config_form").valid()) {
            return false;
        }

        button = jQuery(document.activeElement).button("loading");

        sdpAjax(options).then(function () {
            showalert("success", successMsg, "isAutoHide=true"); //NO I18N
            self.isFormSubmit = true;//to prevent asking for dialog close with form changes 
            jQuery("#asst_repln_form").dialog("close"); //NO I18N
            self.isFormSubmit = false;
        }).always(function () {
            button.button('reset'); //NO I18N
            $assetReplenishList.refreshList();
        });
    },
    getEditData: function () {
        var self = $assetReplenishForm;
        var updatedData = [];
        if (this.isBulkEdit) {
            jQuery("#asst_repln_config_form").find("[data-edit-id]").each(function(id) {
                var isChanged = this.value !== this.defaultValue;
                if(isChanged) {
                    updatedData.push({
                        id: jQuery(this).data("editId"),//No I18N
                        threshold_count: this.value
                    });
                }
            });
            return updatedData;
        } else {
            return {
                threshold_count: jQuery("#threshold_count_0").val()
            }
        }
    },
    update: function () {
        var data = {};
        var entity = this.isBulkEdit ? "asset_replenishments" : "asset_replenishment";//No I18N
        data[entity] = this.getEditData();

        if (!this.hasUnsavedChanges()) {
            showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true");   //No I18N
            return;
        }

        this.ajax({
            url: "/api/v3/asset_replenishments/" + (this.isBulkEdit ? "" : this.id), //No I18N
            type: "PUT", //No I18N
            data: sdpAjaxInputData(data),
        },
            getMessageForKey("sdp.admin.common.updatedsuccessfully")
        );
    },
    getData: function (row, site) {
        var getValue = function (field) {
            return jQuery(row).find('[data-field=' + field + ']').val();
        };
        var productId = getValue("product"); //No I18N
        if (site) {
            var hasNoSite = !sdp_app.IS_SITE_CONFIGURE || site.id === "-1";
            site = { id: hasNoSite ? -1 : site.id };
        }
        var returnObject = {
            site: site,
            product: isInteger(productId) ? { id: productId } : null,
            asset_module: { id: getValue("asset_module") }, //No I18N
            threshold_count: getValue("threshold_count") //No I18N
        };
        if(isMSP)
        {
            var account = { id: siteAccountModel[site.id].toString() }
            returnObject["account"] = account;
        }
        return returnObject;
    },
    save: function () {
        var self = this;
        var data = [];
        var site = jQuery("#asst_repln_site").select2("data"); //No I18N

        //add each row data
        jQuery("#asst_repln_config_form").find("tr.tc-row").each(function (index, row) {
            data.push(self.getData(row, site));
        });

        this.ajax(
            {
                url: "/api/v3/asset_replenishments", //No I18N
                type: "POST", //No I18N
                data: sdpAjaxInputData({ asset_replenishments: data })
            },
            getMessageForKey("sdp.admin.common.addedsuccessfully")
        );
    }
};
