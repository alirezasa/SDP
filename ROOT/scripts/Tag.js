var $tags = {
    /*
        *Function to initialize $tag
        *@PARAM options - Project and Task tags entity data
    */
    init(options) {
        Object.assign(this, options);
        this.tagSection = `${this.entity}_tags_section`;
        this.addNewEle = `${this.entity}_tags_addnew`;
        this.editModeEle = `${this.entity}_tags_edit`;
        this.select2Ele = `${this.entity}_tags_select`;
        this.noTagsEle = `${this.entity}_no_tags`;
        this.saveEle = `${this.entity}_tag_save`;
        this.renderTags();
    },
    /*
        *Function to render Tag.hbs
    */
    renderTags() {
        const tagSection = document.getElementById(this.tagSection);
        tagSection && tagSection.remove();
        renderhbs(`#${this.container}`, 'Tag', { associatedTags: this.associatedTags, canEdit: this.canEdit, entity: this.entity }, true, 'tags'); //NO I18N
        initTooltip(`#${this.entity}_tags_list`);
        this.afterRenderCallback && this.afterRenderCallback(this);
    },
    /*
        *Function to display the tags add section
    */
    showAddTagsInput() {
        jQuery(`#${this.tagSection}`).find(`#${this.editModeEle}`).show();
	},
	/*
        *Function to hide add secion and to display the add new and also to reset the select2 data
    */
	closeEditMode() {
		jQuery(`#${this.tagSection}`).find(`#${this.editModeEle}`).hide();
        jQuery(`#${this.tagSection}`).find(`#${this.addNewEle}`).show();
		jQuery(`#${this.tagSection}`).find(`#${this.select2Ele}`).select2('data', []); //NO I18N
	},
	/*
        *Function to detect if a tag is a newly added tag so to display the confirmation popup
    */
    openEditMode() {
		jQuery(`#${this.noTagsEle}, #${this.addNewEle}`).hide();
        this.showAddTagsInput();
        const inputData = {
            placeholder: translate('sdp.tag.select'),
            multiple: true,
            tags: true, //for createSearchChoice
            closeOnSelect: false,
            createSearchChoice: (inputText, searchResults) => {
                inputText = inputText.trim();
                let isNewTag = !searchResults || !searchResults.some(tag => tag.text.toLowerCase() === inputText.toLowerCase());
                if(isNewTag && this.entity === 'task') {
                    isNewTag = !$taskDetails.entity_data.tags.some(tag => tag.name.toLowerCase() === inputText.toLowerCase())
                } else if(isNewTag && this.entity === 'project' && this.associatedTags) { //NO I18N
                    isNewTag = !this.associatedTags.some(tag => tag.name.toLowerCase() === inputText.toLowerCase())
                }
                return isNewTag? { id: inputText, text: inputText, isNewTag: true } : null;
            },
            url: [{
                url: `${this.entityUrl}/tags`,
                field: 'tags', //NO I18N
                acceptODCompatible: true,
                processResults: (searchData, data) => {
                    let associatedTag;
                    if(this.associatedTags) {
                        this.associatedTags.forEach(tag => {
                            if(tag.id == data.id) {
                                associatedTag = true;
                                return;
                            }
                        });
                    }
                    if(!associatedTag) {
                        searchData.push({
                            id: data.id,
                            text: data.name || data.text
                        });
                    }
                }
            }]
        };

        const select2Ele = jQuery(`#${this.tagSection}`).find(`#${this.select2Ele}`);
        select2Ele.sdp_select2(inputData);
        select2Ele.off('.tagSelect2'); //NO I18N
        select2Ele.on('change.tagSelect2', () => {
            jQuery(`#${this.tagSection}`).find(`#${this.saveEle}`).prop('disabled', select2Ele.select2("data").length < 1); //NO I18N
        }).on('select2-selecting.tagSelect2', data => { //NO I18N
            data.choice.text = data.choice.text.trim();
            data.choice.isNewTag && this.addTag(data.choice.text);
        });
    },
    /*
        *Function to show the confirmation popup for new tags addition.
    */
    addTag() {
        const tagSection = jQuery(`#${this.tagSection}`);
        showconfirm(true, `title=${translate('common.confirm')}, message=${translate('sdp.select2.tag.nomatch')}, submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes`, confirm => { //NO I18N
			if(!confirm) {
				const selectedTags = tagSection.find(`#${this.select2Ele}`).select2('data'); //NO I18N
                selectedTags.pop();
                tagSection.find(`#${this.select2Ele}`).select2('data', selectedTags); //NO I18N
			}
        })
        setTimeout(function() {
            jQuery('#submitButton').focus() //To remove the focus off from select2 when showConfirm is displayed.
        }, 100);
    },
    /*
        *Function to remove tags from the entity
        *@PARAM tagId
    */
    removeTags(tagId) {
        const associatedTags = this.associatedTags;
        let inputData = associatedTags.filter(tag => tag.id != tagId).map(tag => ({ id: tag.id }));
        inputData = { [this.entity]: { tags: inputData } };
        this.associateTags(inputData, true);
    },
    /*
        *Function to check the tuple limit of the entity and proceed to associate the tags.
    */
    saveTags() {
        const tagSection = jQuery(`#${this.tagSection}`);
        const selectedTags = tagSection.find(`#${this.select2Ele}`).select2('data').map(tag => tag.isNewTag? {"name": tag.text, "module": {"name": this.entity}} : {"id": tag.id}); //NO I18N
        if (selectedTags && selectedTags.length > 0) {
            let inputData = this.associatedTags && selectedTags.concat(this.associatedTags) || selectedTags;
            inputData = { [this.entity]: { tags: inputData } };
            if((this.associatedTags && ((this.associatedTags.length + selectedTags.length) > 10)) || selectedTags.length > 10) {
                showalert('warning', translate('sdp.tags.tuple',[10]), 'isAutoHide=true'); //NO I18N
            } else {
                this.associateTags(sdpAjaxInputData(inputData));
            }
        }
    },
    /*
        *Function to associate tags to the entity
        *@PARAM inputData
        *@PARAM isDelete - For delete success message
    */
    associateTags(inputData, isDelete) {
        sdpAjax({
            url: this.entityUrl,
            type: 'PUT', //NO I18N
            data: sdpAjaxInputData(inputData),
            acceptODCompatible: true,
            success: res => {
              showalert('success', translate(isDelete ? 'sdp.tag.removed' : 'sdp.tag.added'), 'isAutoHide=true'); //NO I18N
              this.associatedTags = res[this.entity].tags;
              if(this.entity === 'task') {
                 $taskDetails.entity_data.tags = this.associatedTags;
              }
              const tagSection = jQuery(`#${this.tagSection}`);
              tagSection.find(`#${this.editModeEle}`).hide();
              tagSection.find(`#${this.addNewEle}`).show();
              jQuery(`#${this.tagSection}`).remove(); //Check
              this.renderTags();
            }
        });
    }
}
