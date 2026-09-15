/* $Id$ */
$associationType = function(options) {};
$associationType.prototype = {
    //init association type select2 to show suggested relationship type(in ci type sync rule) and custom association type(in association form, sync rule form)
    init(options) {
        this.options = options;
        this.elementId = options.selectId || "association_type"; //No I18N
        this.canShowSuggestion = this.options.canShowSuggestion !== undefined;
        this.initSelect2();
    },
    formatResult(data) {
        if (this.canShowSuggestion) {
            return this.suggestedAssociationTypeResult(data, false);
        } else {
            return this.customAssociationTypeResult(data, false);
        }
    },
    getSearchCriteria(term) {
        let search_criteria;

        if(!term) {
            return;
        }

        if(this.canShowSuggestion) {
            search_criteria = [{
                field: "destination_module.display_name", //No I18N
                condition: "contains", //No I18N
                value: term
            }];
        } else {
            search_criteria = [{
                field: "name", //No I18N
                condition: "contains", //No I18N
                value: term
            },
            {
                field: "inverse_name", //No I18N
                condition: "contains", //No I18N
                value: term,
                logical_operator: "OR" // No I18N
            }];
        }

        return search_criteria;
    },
    initSelect2() {
        const canShowSuggestion = this.canShowSuggestion;
        const { suggested_url, entity_name, suggested_entity_name } = this.options;
        const url = canShowSuggestion ? suggested_url : this.options.url;
        const entity = canShowSuggestion ? suggested_entity_name : entity_name;
        const self = this;

        if(!url) {
            return;
        }

        formatResult = function () { return self.formatResult(...arguments) };

        const relationshipUrl = [{
            url: "/api/v3" + (this.canShowSuggestion ? suggested_url : url), //NO I18N
            field: entity,
            list_info: {
                start_index: 1,
                row_count: 25,
                sort_field: this.canShowSuggestion ? "association_type.name" : "name", //No I18N
                sort_order: "A" //No I18N
             }
        }];

        const element = jQuery("#" + this.elementId); //No I18N
        const select2 = element.data("sdp_select2"); //No I18N

        if(select2) {
            select2.url = relationshipUrl;
            select2.cache = {};
            this.renderOption();
            element.select2("close"); //No I18N
            element.select2("open"); //No I18N
            if(!canShowSuggestion) {
                this.renderHeader();
            } else {
                jQuery(`#${this.elementId}_dropdown_header`).remove();
            }
            return;
        }

        element.sdp_select2({
            placeholder: translate("sdp.change.sla.select"), //No I18N
            value: this.options.value,
            formatResult: formatResult,
            formatSelection: (data,ele) => {
                const type = data?.association_type || data;
                const typeName = type.is_inverse ? type.inverse_name : type.name;
                ele.attr("title", e_attr(typeName)).attr('rel', 'uitip').attr('mode_ellipsis', 'true').html(e_html(typeName));//No I18N
                initTooltip("#" + ele.prop("id"));//No I18N
                return ele;
            },
            url: relationshipUrl,
            criteriaCallback: (term) => this.getSearchCriteria(term),
            processResults: function(data, option) {
                if(this?.canShowOption && !this.canShowOption(option)) {
                    return;
                }
                if(!option.is_custom) {
                    //if it's self association add relationship for inverse association.
                    if(option.is_self_association) {
                        const inverseAssociation = cloneJson(option);
                        inverseAssociation.is_custom = true; //to remove duplicate option when processResults callback called twice form sdp select2 component.
                        const { destination_module } = inverseAssociation;

                        //swap source and destination module.
                        inverseAssociation.destination_module = inverseAssociation.source_module;
                        inverseAssociation.source_module = destination_module;

                        inverseAssociation.association_type.is_inverse = true;
                        option.association_type.is_inverse = false;

                        data.push(inverseAssociation);
                    }
                    data.push(option);
                }
            }
        });

        this.render();
    },
    //show suggested relationship type(in sync rule) that is already created for the module(ci type)
    suggestedAssociationTypeResult(data) {
        const { association_type, destination_module } = data;
        const typeName = association_type[association_type.is_inverse ? "inverse_name" : "name"]; //No I18N

        return `<div class="select2-result-label" role="option">
            <span class="sb">${e_html(typeName)} </span>
            <span>${e_html(destination_module.display_name)}</span>
        </div>`;
    },
    customAssociationTypeResult(data, isHeader) {
        const optionActiveClass = isHeader ? "" : "sel2-active-ele"; //No I18N

        return `<div class="fw">
            <div class="row ${(isHeader ? "sb m0 pt5 pb5 bg-lgt-fade br-light brdtop0 rounded5-bottom wspace-nowrap" : "")}">
                <div class="col-md-5 wb-bw wspace-normal ${optionActiveClass}">${e_html(data.name)}</div>
                <div class="col-md-1"><span class="pos-abs ml-15">|</span></div>
                <div data-is_inverse=true class="col-md-5 wb-bw wspace-normal ${optionActiveClass}">${e_html(data.inverse_name)}</div>
            </div>
        </div>`;
    },
    renderOption() {
        const { elementId } = this;
        const relationship = jQuery("#" + elementId); //No I18N

        if(!relationship.length) return;

        const relationshipDropdown = relationship.data("select2").dropdown; //No I18N
        const headerId = elementId + "_option_header"; //No I18N

        if(!this.canShowSuggestion) {
            relationshipDropdown.addClass("sel2-split-activebg innerborderbox"); //No I18N
        }
        else{
            relationshipDropdown.removeClass("sel2-split-activebg innerborderbox"); //No I18N
        }

        jQuery("#" + headerId).remove(); //No I18N

        const suggested = translate("common.suggested");
        const custom = translate("common.custom");
        relationshipDropdown.prepend(`<div id="${headerId}" class="row p15">
            <div class="col-md-5">
                <label class="radio-inline" for="${elementId}-suggested">` +//No I18N
                    `<input type="radio" id="${elementId}-suggested" name="${elementId}_option" ${this.canShowSuggestion ? "checked" : ""} value="suggested">
                    <span>${suggested}</span>
                </label>
            </div>
                
            <div data-is_inverse=true class="col-md-5">
                <label class="radio-inline" for="${elementId}-custom">` + //No I18N
                    `<input type="radio" id="${elementId}-custom" name="${elementId}_option" ${this.canShowSuggestion ? "" : "checked"} value="custom">
                    <span>${custom}</span>
                </label>
            </div>
        </div>`);

        //as search is in focus label "for" attribute won't work, hence have to trigger radio button click.
        jQuery("#" + headerId).find("label").on("click",function(){ //No I18N
            jQuery(this).find("input").trigger("click"); //No I18N
        });

        jQuery(`[name=${elementId}_option]`).one("click", (evt) => { //No I18N
            evt.stopPropagation();
            const canShowSuggestion = evt.target.value === "suggested"; //No I18N
            this.canShowSuggestion = canShowSuggestion;
            this.initSelect2();
        });
    },
    renderHeader() {
        const relationship = jQuery("#" + this.elementId); //No I18N
        const relationshipDropdown = relationship.data("select2").dropdown; //No I18N
        const results = relationship.data("select2").results; //No I18N

        if(!this.canShowSuggestion) {
            this.addHeader();
            relationshipDropdown.addClass("sel2-split-activebg innerborderbox"); //No I18N
        }
    },
    render() {
        const element = jQuery("#" + this.elementId); //No I18N
        
        this.renderHeader();

        element.on("select2-selecting", (evt) => { //No I18N
            const is_inverse = jQuery(event.target).data("is_inverse") === true; //No I18N
            let data = evt.object;
            const isSuggested = this.canShowSuggestion;

            data = {
                ...data,
                ...{
                    isSuggested: isSuggested,
                    is_inverse: is_inverse
                }
            };
            
            element.select2("data", data); //No I18N
            element.trigger("change"); //No I18N
            element.select2("close"); //No I18N
            
            return false;
        });

        this.didRender();
    },
    didRender() {
        if (this.canShowSuggestion) {
            this.renderOption();
            this.set("reloadSelect2", true); //No I18N
        }
    },
    addHeader() {
        const dropdown = jQuery("#" + this.elementId).data("select2").dropdown; //No I18N
        const headerId = this.elementId + "_dropdown_header"; //No I18N
        const { nameTitle, inverseNameTitle } = this.options;
        
        if(dropdown.find("#" + headerId).length) return; //No I18N

        jQuery(`<div id="${headerId}">
            ${this.customAssociationTypeResult({
                name: translate(nameTitle || "association.types"),
                inverse_name: translate(inverseNameTitle || "association.types.inverse")
            }, true)}
        </div>`).insertAfter(dropdown.find(".select2-search"));
    }
}
