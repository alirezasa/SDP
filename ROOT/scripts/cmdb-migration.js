//# sourceURL=cmdb-migration.js
var CMDBMigration = {
    //if container is passed freeze the container and render on the container
    init: function(isModel) {
        jQuery("body").append("<div id='cmdb-migration-dialog'></div>");
        this.ciCustomSelectionRow = undefined; //reset
        CMDBMigration.renderDialog(isModel);
    },
    renderDialog: async function(isModel) {
        await new Promise((resolve) => {
            if(sdp_app.IS_DEVELOPMENT_MODE) {
                resolve();
                return;
            }
            ResourceLoader({
                js: ["/scripts/hbs-template-cmdb.js"], // No I18N
                success: function () {
                    resolve();
                }
            });
        });
        const link = sdp_app.IS_AE ? 'https://help.assetexplorer.com/portal/en/kb/articles/migrate-ci-attributes' : 'https://help.servicedeskplus.com/migrate-ci-attributes';   //No I18N
        renderhbs("#cmdb-migration-dialog", "migration", {link : link}, false, "cmdb"); //No I18N
        jQuery('#cmdb-migration-dialog').sdp_zcomponent_dialog({
            title: translate("cmdb.migration.title"),//No I18N
            type: "modal",//No I18N
            closeButton: !isModel,
            closeOnEscKey: !isModel,
            width: "90%", //No I18N
            position: "center",//No I18N
            className: "sdpzcompdialog cust-width cust-height",//No I18N
            height: "80%"
        });

        CMDBMigration.render("intro");
    },
    renderOnPageVisit: async function(cmdbPostMigration) {
          const urls = {
            "all_product_types": "#content-inner .content-section, .content-panel-inner",//No I18N
            "ci-types/sync-rules": "#content-inner .admin-wrapper",//No I18N
            "asset_sync_rules": "#content-inner .admin-wrapper",//No I18N
            "admin/ci-types": "#content-inner .content-section, .content-panel-inner" //No I18N
          };
          const url = Object.keys(urls).find((url) => window.location.href.includes(url));
          const selector = urls[url];
          if(selector) {
            let data = cmdbPostMigration || {};
            if(!cmdbPostMigration) {
                await sdpAjax({
                  cache: false,
                  url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N
                  success: function(response) {
                    data = response.cmdbPostMigration;
                  }
                });
            }
            const interval = setInterval(() => {
              const container = jQuery(selector);
              if(container.length) { //wait for container to render
                  container.addClass("pos-rel");
                  let configureButton = "";
                  let message = ""

                  if(!data) {
                    clearInterval(interval);
                    return;
                  }
                  if(data.isConfigured) {
                    message = "<p>" + translate("cmdb.postmigration.configured.msg") + "</p>";
                  } else {
                    configureButton = `<button id="cmdb-pm-config-btn" role="button" class="btn btn-link uppercase mt-5">${translate("sdp.inventory.home.scan.configurenow")}</button>`;//No I18N
                    message = translate("cmdb.postmigration.inprogress.msg", [configureButton])//No I18N
                  }

                  if(data.postMigrationStatus === "failed") {
                    message = "<p>" + translate("cmdb.postmigration.failed.msg") + "</p>";
                  }

                  container.prepend(`<div id="cmdb-migration-freeze">
                    <div class="pos-abs z-ind95 top30 fw">
                        <div class="bgwhite w-50per m-center">
                            <div class="block-highlighted p10"> <span class="h4">${translate("cmdb.migration.header")}</span></div>
                            <div class="p10">
                                <div class="disp-t">
                                    <div class="disp-c vmiddle pr10">
                                        <img src="/images/migration-err.svg">
                                    </div>
                                    <div class="disp-c">
                                        <div id="cmdb-post-migration-msg">
                                            ${message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-dark fh fw left0 opac3 pos-abs top0 z-ind20"></div>
                  </div>`);

                  jQuery("#cmdb-pm-config-btn").on("click", () => { showCMDBMigration(false); });
                  if(data.isScheduleCompleted) {
                    jQuery(window).off("popstate.cmdb-post-migration-switch");//No I18N
                  }

                  if(!data.isConfigured && data.isShowRmdLtr) {
                    showCMDBMigration(false);
                  }
                  clearInterval(interval);
              }
          }, 100);
        }
    },
    isChoice2Valid: function() {
        const noOfRows = jQuery('#child-attributes-form [data-attr="clonerows"]').length;

        if(noOfRows > 1) {
            return jQuery('#child-attributes-form').valid();
        } else {
            return jQuery('[id^=child-ci-type-]').val() === "" || jQuery('[id^=child-ci-attributes-]').val() !== "";
        }
    },
    countNonDisabledTypes: function(ciTypes) {
        let count = 0;

        // If disabledOption is undefined, consider the item as not disabled
        if (!Array.isArray(ciTypes) && ciTypes.disabledOption === undefined) {
            return 1;
        }

        if(Array.isArray(ciTypes)) {
            ciTypes.forEach(child => {
                if (child.disabledOption === undefined) {
                    count++;
                }
                // Check children recursively
                if(child.children && child.children.length) {
                    count += this.countNonDisabledTypes(child.children);
                }
            });
        }

        return count;
    },
    render: function(page) {
        //when going to previous or next page, form should be valid.
        if(page === "last" || page === "choice 1") {
            if(!this.isChoice2Valid()) {
                jQuery("#child-attributes-form").valid();
                return;
            }
        }

        jQuery("[data-migration-page]").hide();
        jQuery(`[data-migration-page="${page}"]`).show();

        switch(page) {
            case "choice 1"://No I18N
                this.renderParentCiTypes();
                break;
            case "choice 2"://No I18N
                this.getSecondChoiceTypes("", undefined, (ciTypes) => {
                    this.renderSecondChoice(ciTypes);
                });
                break;
        }

        this.initEvents();
    },
    initEvents: function() {
        const self = this;
        jQuery("[data-navigation-button]").off("click").on("click", function () {//No I18N
            self.render(jQuery(this).data("navigation-button"));//No I18N
        });

        jQuery("#cmdb-migration-cancel").off("click").one("click", function () {//No I18N
            sdpAjax({
                url: "/api/v3/CMDBPostMigrationServlet",//No I18N
                data: {migrationType: "ignoreConfiguration"},//No I18N
                type: "post",//No I18N
                success: function() {
                    self.closeDialog();
                    self.enableContainer();
                }
            });
        });

        jQuery("#migration-submit-btn").off("click").on("click", function () {//No I18N
            self.submit();
        });

        initFormValidator("child-attributes-form", {}, {});//No I18N
    },
    validateSecondChoice: function(id) {
        const ciType = jQuery("#child-ci-type-" + id);
        const attributes = jQuery("#child-ci-attributes-" + id);
        ciType.rules("add", {//No I18N
            required: function() {
                return jQuery("[id^=child-ci-type-]").length > 1 ? ciType.val() === "" : false;
            }
        });

        attributes.rules('add', {//No I18N
            required: function() {
                return attributes.val() === "" ? ciType.val() !== "" : false;
            }
        });
    },
    renderSecondChoice: function(ciTypes) {
        const self = this;
        const max_rows = Math.min(this.countNonDisabledTypes(ciTypes), 300) || 1;

        if(this.ciCustomSelectionRow) {
            this.ciCustomSelectionRow.options.max_rows = max_rows;
            const addButton = jQuery('#child-attributes-form [data-action="addrow"]');
            addButton.prop("disabled", addButton.length >= max_rows);//NO I18N
            return;
        }

        this.ciCustomSelectionRow = new cloneRows({
            data: {},
            skip_addrow_validation: true,
            selector: "child-attributes-form", //No I18N
            min_rows: 1,
            max_rows: max_rows,
            meta_info: {
                child_attr: {
                    required : true,
                    renderFieldHTML: (options, index) => {
                        return `
                            <div>
                                <input id='child-ci-type-${index}' data-name='child_attr' name='child-ci-type-${index}' data-index="${index}" data-rule-required="true" class="form-control fw"></input>
                            </div>
                            <div>
                                <input class="mt10" id='child-ci-attributes-${index}' data-name='child_attr' name='child-ci-attributes-${index}'  data-index="${index}" data-rule-required="true" class="form-control fw"></input>
                            </div>
                        `;
                    }
                },
                source_field: {
                    required : true,
                    renderFieldHTML: (options, index) => {
                        return `
                            <input hidden data-name='source_field' id="parent-ci-type-value-${index}"/>
                            <div id="parent-ci-type-${index}">${translate("ae.cmdb.parent.ci.type")}</div>
                        `;
                    }
                },
            },
            callbackRowAdd: function (options, evt) {
                const index = jQuery(evt.target).closest('[data-attr="clonerows"]').next().data("row-id");//No I18N
                self.initCiType("child-ci-type-" + index);//No I18N
                self.renderCiTypeAttributes(undefined, index);
                self.validateSecondChoice(index);
            }
        });

        setTimeout(() => {
            self.initCiType("child-ci-type-" + 1);//No I18N
            this.renderCiTypeAttributes(undefined, 1);
            this.validateSecondChoice(1);
        });
    },
    initCiTypeAttributes: function(index) {
        const ciType = jQuery("#child-ci-type-" + index).select2("data");//No I18N

        if(!ciType) {
            jQuery("#child-ci-attributes-" + index).select2("data", []);//No I18N
            jQuery("#child-ci-attributes-" + index).valid();
            return;
        }

        sdpAjax({
            url: `/api/v3/ci_types/${ciType.id}/_new_form`
        }).then((response) => {
            this.renderCiTypeAttributes(response, index);
        });

        this.renderCiTypeAttributes(undefined, index);
    },
    renderCiTypeAttributes: function(response, index) {
        const element = jQuery("#child-ci-attributes-" + index);
        const data = this.getAllowedValuesFromLayout(response);

        element.select2("enable", true);//No I18N
        element.select2({
            data,
            width: "100%",
            placeholder: translate("sdp.requests.fieldFormRules.listview.fields"),
            multiple: true,
            closeOnSelect: false,
            maximumSelectionSize: 100
        }).on("change", () => {
            element.valid();
        })
    },
    getFields: function (fields) {
        let allowedValues = [];
        function getField(fields, key) {
            const field = fields[key];
            field.id = key;
            field.text = field.display_name;
            return { ...field, ...{ key } };
        }

        for (let key in fields) {
            if (fields[key].type === "group" || fields[key].type === "udf") {
                const subFields = fields[key].fields;
                const values = Object.keys(subFields).map(function (key) {
                    return getField(subFields, key);
                });
                allowedValues = allowedValues.concat(values);
            } else {
                allowedValues.push(getField(fields, key));
            }
        }

        return allowedValues;
    },
    getAllowedValuesFromLayout: function (response) {
        if(!response) {
            return [];
        }

        const { metadata } = response;
        const metaInfoFields = response.new_form.meta_info.udf_fields.fields;
        let allowedValues = [];

        // Iterate over the fields and log their names
        response.new_form.default_layout.sections.forEach(section => {
            section.fields.forEach(field => {
                if(metaInfoFields[field.name]) {
                    const fieldObj = metaInfoFields[field.name];
                    fieldObj.id = field.name;
                    fieldObj.text = fieldObj.display_name;
                    allowedValues.push(fieldObj);
                }
            });
        });

        return allowedValues.filter(function (field) {
            return field.hasOwnProperty("display_name");//No I18N
        });
    },
    closeDialog: function(){
        jQuery('#cmdb-migration-dialog').sdp_zcomponent_dialog("close");    //No I18N
        jQuery("#cmdb-post-migration").hide(); //remove header message
    },
    enableContainer() {
        jQuery("#cmdb-migration-freeze").remove();
    },
    fetchCiTypes(callback) {
        //return from cache.
        if(!this.ciTypes) {
            this.ciTypes = sdpAjax({
                url: "/api/v3/CMDBPostMigrationServlet?migrationType=getCITypes"//No I18N
            });
        }

        this.ciTypes.then((response) => {
            const data = this.ci_types = jQuery.extend(true, {}, response).ci_types;
            const map = this.ci_type_product_type_mapping = response.ci_type_product_type_mapping;
            this.ci_type_to_field_existence_mapping = response.ci_type_to_field_existence_mapping;

            data.forEach((ciType) => {
                ciType.text = ciType.display_name;
                ciType.product_type = map[ciType.id];
            });

            const ciTypes = hierarchySelect2.constructChildData(data);

            callback(ciTypes.filter((ciType) => map[ciType.id] && ciType.children));
        });
    },
    //shows all parent ci types. child ci types are included just to view and disabled as it can't be selected.
    renderParentCiTypes() {
        //if already rendered, ignore
        if(Array.isArray(jQuery("#ci-types-migration").select2("data"))) {
            return;
        }
        //fetch all ci types to show in hierarchy format
        this.fetchCiTypes((ciTypes) => {
            const element = jQuery("#ci-types-migration");

            this.disableChildren(ciTypes);

            function hasChildren(ciType, id) {
                // Base case: Check if the current CI type matches the ID and has children
                if (ciType.id === id) {
                    return true;
                }

                // Recursive case: Traverse through children if they exist
                if (ciType.children) {
                    for (let child of ciType.children) {
                        if (hasChildren(child, id)) {
                            return true;
                        }
                    }
                }

                return false; // No match found with children
            }

            hierarchySelect2.init({
                data: [],
                promise: new Promise((resolve) => resolve({
                    data: []
                })),
                query: function (query) {
                    const childIds = Array.from(document.querySelectorAll("[id^=child-ci-type-]")).map((element) => element.value);//No I18N
                    const matcher = this.matcher;

                    query.callback({
                        results: ciTypes.filter((ciType) => {
                            return matcher(query.term, ciType.display_name) && !childIds.some((id) => hasChildren(ciType, id))
                        })
                    });
                },
                displayField: true,
                id: "ci-types-migration", //No I18N
                placeholder: translate("sdp.change.sla.select"), //No I18N
                multiple: true,
                closeOnSelect: false,
                width: "400px"//No I18N
            });

            element.select2("dropdown").addClass("s2-custom-p0")    //No I18N
        });
    },
    disableChildren: function(ciTypes) {
        const self = this;
        if(!ciTypes) {
            return ciTypes;
        }
        ciTypes.forEach((ciType) => {
            const children = ciType.children || [];
            children.forEach((child) => {
                self.ci_type_product_type_mapping[child.id] = self.ci_type_product_type_mapping[ciType.id];
                child.disabledOption = true;
            });
            this.disableChildren(children);
        });

    },
    getSecondChoiceTypes: function(search, id, callback) {
        const self = this;
        function filterNestedData(data, searchTerm, seenIds = new Set()) {
            return data
                .map(item => {
                    // Check if the current item's display_name matches the search term
                    const isMatch = item.display_name.toLowerCase().includes(searchTerm.toLowerCase());

                    // Recursively filter children, if any
                    let filteredChildren = [];
                    if (item.children) {
                        filteredChildren = filterNestedData(item.children, searchTerm, seenIds)
                            .filter(child => child !== null); // Remove null results
                    }

                    // Only consider the current item if it is unique and matches or has matching children
                    if (isMatch || filteredChildren.length > 0) {
                        if (!seenIds.has(item.id)) {
                            seenIds.add(item.id); // Track this item as seen
                            return { ...item, children: filteredChildren }; // Keep only matched children
                        }
                        return null; // Duplicate item, return null
                    }

                    // If no match found and no matching children, return null
                    return null;
                })
                .filter(item => item !== null); // Remove null results from the top-level array
        }

        function disableParents(data, disableValues) {
            /**
             * remove empty string in disableValues
             */
            disableValues = disableValues.filter((value) => value);

            // Helper function to check if an item should be disabled
            function processItem(item) {
                // Check if the current item's id is in the disableValues array
                const shouldDisable = disableValues.includes(item.id) || !self.ci_type_to_field_existence_mapping[item.id];

                // Recursively process children if they exist
                let filteredChildren = [];
                if (item.children && item.children.length > 0) {
                    filteredChildren = disableParents(item.children, disableValues)
                        .filter(child => child !== null); // Remove null results for children
                }

                // If the item is in the disableValues and it has children, disable it but keep its children
                if (shouldDisable) {
                    if (filteredChildren.length > 0) {
                        item.disabledOption = true;
                        item.children = filteredChildren; // Keep children
                        return item;
                    } else {
                        // If the item is a leaf node, return null to remove it
                        return null;
                    }
                }

                // If not in disableValues, return the item with its filtered children
                return { ...item, children: filteredChildren };
            }

            // Process each item in the data array
            const result = [];
            const seenIds = new Set();

            for (let item of data) {
                // Check if the item has been processed
                if (!seenIds.has(item.id)) {
                    const processedItem = processItem(item);
                    if (processedItem) {
                        seenIds.add(item.id);
                        result.push(processedItem);
                    }
                }
            }

            return result;
        }

        function getCiTypes(ciTypes) {
            const choiceOneSelectedTypes = jQuery("#ci-types-migration").select2("data");       //No I18N
            /**
             * remove selected ci types from the list
             */
            function filter(ciTypes) {
                return ciTypes.filter((ciType) => {
                return !choiceOneSelectedTypes.find((selected) => selected.id === ciType.id);
            });
            }

            const matchedValues = search ? filterNestedData(filter(ciTypes), search) : filter(ciTypes);
            let disabledValues = id ? Array.from(document.querySelectorAll(`#child-attributes-form [id^=child-ci-type-]:not(#${id})`)).map((ciType) => { return ciType.value }) : [];


            /**
             * add citypes in 1st level to disabledvalues
             */
            disabledValues = disabledValues.concat(ciTypes.map((data) => (data.id)))

            return disableParents(matchedValues, disabledValues);
        }

        this.fetchCiTypes((ciTypes) => {
            callback(getCiTypes(ciTypes));
        });
    },
    initCiType: function(id) {
        const self = this;
        const element = jQuery("#" + id);
        hierarchySelect2.init({
            data: [],
            displayField: true,
            id,
            promise: new Promise((resolve) => resolve({
                data: []
            })),
            width: "100%",
            allowClear: true,
            query: function (query) {
                self.getSecondChoiceTypes(query.term, id, (ciTypes) => {
                    query.callback({
                        results: ciTypes
                    });
                });
            },
            placeholder: translate("ae.cmdb.admin.citype.citype")
        });

        const dropdown = element.select2("dropdown");       //No I18N

        element.on("select2-open", () => {
            dropdown.find(".select2-disabled").css({"background": "unset", color: "unset"});   //No I18N
        });

        element.off("change").on("change", function() { //No I18N
            const index = jQuery(this).data("index");//No I18N
            self.initCiTypeAttributes(index);
            element.valid();

            if(element.val()) {
                const parentId = jQuery("#child-ci-type-" + index).select2("data").parent.id;//No I18N
                jQuery("#parent-ci-type-" + index).text(self.ci_type_product_type_mapping[parentId].name).attr("data-product-type-id", self.ci_type_product_type_mapping[parentId].id);//No I18N
                jQuery("#parent-ci-type-value-" + index).val(parentId);//No I18N
            } else {
                jQuery("#parent-ci-type-" + index).text(translate("ae.cmdb.parent.ci.type"));
            }
        });
    },
    submit: function() {
        let choic1InputData = [];
        const choice1 = jQuery("#ci-types-migration").select2("data");//No I18N

        if(choice1.length) {
            choic1InputData = jQuery("#ci-types-migration").select2("data").map((ciType) => {   //No I18N
                return {
                    "sourceCITypeId": ciType.id,    //No I18N
                    "productTypeId": ciType.product_type.id,    //No I18N
                    "copy_whole_hierarchy": true,       //No I18N
                }
            });
        }

        const getValues = ((id) => {
            return jQuery(`[id^=${id}]`).map(function() {
                return jQuery(this).val();
            }).get().filter((value) => value);
        });

        const ciTypes = getValues("child-ci-type-");    //No I18N
        let choice2InputData = [];

        const productTypes = jQuery("[id^=parent-ci-type-]").map(function() {
            return jQuery(this).attr("data-product-type-id");
        }).get();

        /**
         * save attributes for each ci type selected
         */
        const attributes = {};
        jQuery("[id^=child-ci-attributes-]").map(function(index,element) {
            attributes[index] = jQuery(element).select2("data").map((attr) => attr.id);
        });

        if(ciTypes.length) {
            choice2InputData = ciTypes.map((id, index) => {
                return {
                    "sourceCITypeId": id,                   //No I18N
                    "productTypeId": productTypes[index],   //No I18N
                    "copy_whole_hierarchy": false,          //No I18N
                    "attributes": attributes[index]         //No I18N
                }
            })
        }

        choic1InputData = choic1InputData.concat(choice2InputData);
        if(!choic1InputData.length) {
            showalert("failure", translate("configure.atleast.one.choice"), "isAutoHide=true"); // No I18N
            return;
        }

        sdpAjax({
            url: "/api/v3/CMDBPostMigrationServlet",        //No I18N
            type: "post",                                   //No I18N
            data: sdpAjaxInputData(choic1InputData),
            ignorefailuremessage: true,
            success: () => {
                jQuery("#cmdb-post-migration-msg").text(translate("cmdb.postmigration.configured.msg"));
                this.closeDialog();
                showalert("success", translate("cmdb.configure.success.msg"), "isAutoHide=true"); // No I18Nshowalert();    //No I18N
            },
            callbackOnAPIFailure: () => {
                showalert("failure", translate("cmdb.configure.failure.msg"), "isAutoHide=true"); // No I18N
            },
            beforeSend: () => {
                jQuery("#migration-submit-btn").button("loading"); //No I18N
            },
            complete: () => {
                jQuery("#migration-submit-btn").button("reset"); //No I18N
            }
        });
    }
}
