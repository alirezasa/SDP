// $Id$
var $spaceTree = {
    current_column: "campus", // NO I18N
    is_loading: false,
    personalization:{},
	selected_building_type:'Floors and Rooms', // NO I18N
	space_floors_copy: {
            total: false,
            sort_order: "asc",// NO I18N
            api_key: "space_floors",// NO I18N
			class_api_key: "space-floors", // No I18N
            entity: "space_floor",// NO I18N
            search_key: "space_floor.id",// NO I18N
            name: translate("space.floor"),// NO I18N
            selected: false,
            disable: false,
            count: 0,
			heading_html:'<div id="space_floors_heading" class="space-tree-title-container fl space-floors-heading highlight-heading" data-column="space_floors">'+
                    '<div class="space-tree-title text-overflow" rel="uitip" mode_ellipsis=true title="'+translate("space.floor")+'">'+translate("space.floor") +'</div>'+
                       '<div class="space-count text-overflow hide" rel="uitip" mode_ellipsis=true title="0">( 0 )</div>'+
						'<span class="sort">'+
                                '<span class="cspr icon-sm sort-up ml10 cur-ptr space-tree-sort" title="'+translate("common.sortby.ascending")+'" role="img"></span>'+
							'</span>'+
							'<div id="space_floors_search_result" class="pl30 tree-search-result-container hide">'+
                    '<span class="disp-ib text-overflow text-color3 nobold" style="max-width:calc(100% - 42px);" title="" ></span>'+
                    '<span id="space_floors_close_results" class="cspr close3 cur-ptr opac5 ml5 vtop mt3" title="'+translate('sdp.common.close')+'" rel="uitip" ></span>'+
                '</div>'+
                    '<span class="cspr search1 icon-sm space-tree-search-icon flat" title="'+translate("common.search.title")+'" role="img" data-name="search-icon" ></span>'+
                '<div data-name="search-input" class="space-tree-search-container hide">'+
                    '<input class="form-control" placeholder="'+translate("common.search.title")+" "+translate("space.floor")+'" id="'+translate("common.search.title")+""+translate("space.floor")+'">'+
                    '<!-- <span class="cspr icon-sm close4 pos-abs right5 cur-ptr top10" data-spacetree="close" title="Close" role="img" role="button"></span> -->'+
                    '<div class="space-tree-search-placeholder-container">'+
                        '<div class="tree-search-placeholder"><label for="'+translate("common.search.title")+""+translate("space.floor")+'">'+translate("hit.enter.and.search")+'</label></div>'+
                    '</div>'+
                '</div>'+
            '</div>',	
			body_html:'<div class="space-tree-wrapper fl" id="cards-space_floors">'+
            '<div class="upper-arrow">'+    
            '</div>'+
			'<div id="space_floors-space_structures" class="scroll-line-container fl">'+
			'<div id="white_space" class="white-space"></div>'+
			'<div class="vertical-line">'+
				'<div data-name="scroll_line" class="scroll-line connecting-line" ></div>'+
                '<div data-name="gray_line" class="connecting-line" ></div>'+
				'<div data-name="connecting_line" class="connecting-line" ></div>'+
			'</div>'+
			'</div>'+
            '<div id="space_floors_container" class="space-floors-container space-scroll-container" data-column="space_floors" >'+
				'<div class="table-wrapper space-cardview" data-name="space_floors">'+
				'<div class="table-area card-view-area" >'+
                    '<div class="card-holder"></div>'+
				'</div>'+
				'</div>'+
            '</div>'+
            '<div class="bottom-arrow">'+          
            '</div>'+
        '</div>',
			floating_class : '',
            list_info: {
                get_total_count: true,
                row_count: "25",// NO I18N
                sort_field: "name",// NO I18N
                sort_order: "asc",// NO I18N
                start_index: 1
            }
        },
    columns: {
        space_campuses: {
            total: false,
            sort_order: "asc", // NO I18N
            api_key: "space_campuses",// NO I18N
			class_api_key: "space-campuses", // No I18N
            name: translate("space.campus"),// NO I18N
            entity: "space_campus",// NO I18N
            disable: true,
            count: 0,
            selected: false,
            search_key: "space_campus.id",// NO I18N
			floating_class : '',
            list_info: {
                get_total_count: true,
                row_count: "25",// NO I18N
                sort_field: "name",// NO I18N
                sort_order: "asc",// NO I18N
                start_index: 1
            }
        },
        space_structures: {
            total: false,
            sort_order: "asc",// NO I18N
            search_key: "space_building.id",// NO I18N
            api_key: "space_structures",// NO I18N
			class_api_key: "space-structures", // No I18N
            name: translate("space.structure"),// NO I18N
            entity: "space_structure",// NO I18N
            disable: true,
            selected: false,
            count: 0,
			floating_class : '',
            list_info: {
                get_total_count: true,
                row_count: "25",// NO I18N
                sort_field: "name",// NO I18N
                sort_order: "asc",// NO I18N
                start_index: 1
            }
        },
        space_floors: {
            total: false,
            sort_order: "asc",// NO I18N
            api_key: "space_floors",// NO I18N
			class_api_key: "space-floors", // No I18N
            entity: "space_floor",// NO I18N
            search_key: "space_floor.id",// NO I18N
            name: translate("space.floor"),// NO I18N
            selected: false,
            disable: true,
            count: 0,
			floating_class : '',
            list_info: {
                get_total_count: true,
                row_count: "25",// NO I18N
                sort_field: "name",// NO I18N
                sort_order: "asc",// NO I18N
                start_index: 1
            }
        },
        space_rooms: {
            total: false,
            sort_order: "asc",// NO I18N
            api_key: "space_rooms",// NO I18N
			class_api_key: "space-rooms", // No I18N
            entity: "space_room",// NO I18N
            search_key: "room.id",// NO I18N
            selected: false,
            name: translate("room.and.space"),// NO I18N
            disable: true,
            count: 0,
			floating_class : '',
            list_info: {
                get_total_count: true,
                row_count: "25",// NO I18N
                sort_field: "name",// NO I18N
                sort_order: "asc",// NO I18N
                start_index: 1
            }
        }
    },
    /**
     *
     */
    init: function() {
        var self = this;
        var data = {
            columns: self.columns,
			status_allowed_values: self.fetchStatusAllowedValues()
        };
		var personalization = getPersonalizeData("spacetree");
		var spaceColumns=["space_campuses","space_structures","space_floors","space_rooms"]; // NO I18N
		self.getLinksData();
		if(personalization)
		{
			self.personalization=personalization;
			for(var i=0;i<4;i++)
			{
				if(personalization[spaceColumns[i]]){
					self.columns[spaceColumns[i]].selected = personalization[spaceColumns[i]].id;
					self.columns[spaceColumns[i]].selected_card_html=self.getHTML(spaceColumns[i],personalization[spaceColumns[i]].id);
				}
			}
		}
		if(self.selected_building_type=="Rooms Only")
		{
			delete self.columns["space_floors"];
		}
		else{
			if(!self.columns["space_floors"]){
			self.columns["space_floors"]=self.space_floors_copy;
			}
		}		
        /**
         * Render the
         */
        let eventBindCallback = function(){
            spaceColumns.forEach(element => {
                jQuery('#'+element+"_heading #space-tree-close-results").off('click').on('click', (event) => { // No I18N
                    $spaceTree.closeResults(element);
                });
            });
        };
        renderhbs("#treeview", "spacetree-container", data, false, "spacemodule",null,true,eventBindCallback);// NO I18N
       /* this.renderColumn({
            column: "space_campuses",// NO I18N
            callback:function(){
                self.syncPersonalization();
            }
        });*/
		self.syncPersonalization();
        /**
         * Global Event Binder
         */
        this.bindEvents();
        self.treeHeight();
        jQuery(window).on('resize',function(){
            self.treeHeight();
        });
		initTooltip('#treeview');// NO I18N
    },
    treeHeight: function(){
        var height,
        listview_height = 110,
        chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
        jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
        jQuery('#treeview div.space-tree').css('height',height+48+'px').find('.space-scroll-container').css('height',height-29+'px');//No I18N
    },
    getLinksData : function(moduleURL){
		var viewRequestsModule=false;
		if(sdp_user.ROLES.contains("ViewRequests")){
			viewRequestsModule=true;
		}
        var links_data = {permissions : {"viewRequestsModule":viewRequestsModule}}; //NO I18N
        var url = "/api/v3/spaces/_links";//NO I18N
            sdpAjax({
                url: url,
                success: function (response) {
                    var links = response._links;
                    links = links.links || links;
                    links.forEach(function (link) {
                        if(link.name){
                            links_data.permissions[link.name] = true;
                        }
                    });
                },
                async: false
            });
		this.permissions=links_data.permissions;
    },
	fetchStatusAllowedValues : function () {
		var allowedValues=[];
		var has_more_rows=false;
		var i=1;
		do
		{
			var inputjson = {"list_info": {"row_count": "100","start_index": i } };// NO I18N
			var dataVal = sdpAjaxInputData(inputjson);
			sdpAjax(
			{
				url: '/api/v3/spaces/space_campuses/status', // No I18N
				cache: false,
				data: dataVal,
				async: false,
				success: function(resp)
				{
					allowedValues=allowedValues.concat(resp.status);
					i=parseInt(resp.list_info.end_index)+1;
					has_more_rows=resp.list_info.has_more_rows;
				}
			});
		}while(has_more_rows);
		return allowedValues;
	},
   /**
    *  Next Column of the stack
    * @param {string} column 
    * @returns {string} 
    */
    getNextColumn: function(column) {
		var self=this;
        switch (column) {
            case "space_campuses":// NO I18N
                return "space_structures";// NO I18N
            case "space_structures":// NO I18N
				if(self.selected_building_type=="Rooms Only")
				{
					return "space_rooms"; // NO I18N
				}
                return "space_floors";// NO I18N
            case "space_floors":// NO I18N
                return "space_rooms";// NO I18N
            default:
                return "";
        }
    },
    /**
     *  Previous column of the stack
     * @param {string} column 
     * @returns {string} 
     */
    getPreviousColumn: function(column) {
		var self=this;
        switch (column) {
            case "space_structures":// NO I18N
                return "space_campuses";// NO I18N
            case "space_floors":// NO I18N
                return "space_structures";// NO I18N
            case "space_rooms":// NO I18N
				if(self.selected_building_type=="Rooms Only")
				{
					return "space_structures"; // NO I18N
				}
                return "space_floors";// NO I18N
            default:
                return "";// NO I18N
        }
    },
    /**
     * Render the each column
     * @param options 
     * @param options.column {string} column name
     * @param options.isAppend {boolean} is append or not
     * @param options.skipEmpty {boolean} option to skip the next column empty
     * @param options.search {string} search value
     * @returns {void}
     */
    renderColumn: function(options) {
        var column = options.column;
        var isAppend = options.isAppend;
        var skipEmpty = options.skipEmpty;
        var callback = options.callback;
        var search = options.search;
        var self = this;
        var nextColumn = self.getNextColumn(column);
        var previousColumn = self.getPreviousColumn(column);
        var input_data = self.getInputData(column, previousColumn,options.loadMore);
        if (!input_data.list_info) {
            return false;
        }
        if (!isAppend) {
            input_data.list_info.start_index = 1;
            input_data.list_info.get_total_count = true;
        }
        /** Construct search info */
        if (search) {
            if (!input_data.list_info.search_criteria) {
                input_data.list_info.search_criteria = [];
            }
            input_data.list_info.search_criteria.push({
                field: "name",// NO I18N
                condition: "like",// NO I18N
                value: search,// NO I18N
                logical_operator: "and"// NO I18N
            });
        }
        /**
         * If the column is not present in the need to add
         */
       /* if(!self.personalization[column]){
            self.personalization[column] = {
                id:false
            };
        }*/
        var url = "/api/v3/spaces/" + column;// NO I18N
        jQuery(".page-progressbar").show(); //No I18N
        sdpAjax({
            url: url,
            data: sdpAjaxInputData(input_data),
            success: function(res) {
              /** Hide the progress bar */
                jQuery(".page-progressbar").fadeOut(); //No I18N
				if(res&&res[column]&&res[column].length>0)
				{
					if(!self.isValidParent(previousColumn,column,res[column][0]))
					{
						return false;
					}
				}
				else{
					if(nextColumn)
					{
						self.columns[nextColumn].selected=false;
					}
				}
                var start_index = parseInt(self.columns[column].list_info.start_index, 10);
                self.is_loading = false;
                self.columns[column].list_info = {
                    get_total_count: false,
                    row_count: "25",// NO I18N
                    sort_field: res.list_info.sort_field,
                    sort_order: res.list_info.sort_order,
                    start_index: start_index + 25
                };
                /** Set the has more rows options from the API */
                self.columns[column].has_more_rows = res.list_info.has_more_rows;
                var apiData = {
                    data: res[column],
                    current: column,
                    entity_plural: column,
                    entity: self.columns[column].entity,
                    name: self.columns[column].name,
					selected: self.columns[column].selected,
					permissions: self.permissions
                };
                if (isAppend && !res[column].length) {
                    return false;
                }
                /**
                 * Render all card in this area
                 */
                renderhbs("#cards-" + column + " .card-holder", "spacetree-cards", apiData, isAppend, "spacemodule",null,true);// NO I18N
				if(search||options.clearSearch){
					self.calculateLines(column);
				}
                if (callback && jQuery.isFunction(callback)) {
                  /** Call the callback */
                    callback(column);
                }
				self.columns[column].disable=false;
                if (!isAppend) {
                    /**
                     * Show the total count and hide show the remaining section
                     */
                    jQuery("[data-column='" + column + "'] .space-count").text("( " + res.list_info.total_count + " )").removeClass("hide").attr("title","( " + res.list_info.total_count + " )");// NO I18N
                    jQuery("[data-column='" + column + "'] > span").addClass("text-color4");// NO I18N
                }
            }
        });
        /**
         * After the column was render we need discard all columns from left->right;
         */
        if (!isAppend && !skipEmpty) {
          /** Infinite loop : But it will iterate only about 3 times*/
            while (true) {
                self.emptyColumn(nextColumn);
                nextColumn = self.getNextColumn(nextColumn);
                if (nextColumn === "") {
                    break;
                }
            }
        }
    },
	isValidParent : function(previous,current,data)
	{
		var self=this;
		if(previous)
		{
			var entity=self.columns[previous].entity;
			if(entity=="space_structure")
			{
				entity="space_building";// NO I18N
			}
			if(!self.columns[previous].selected||(!self.columns[previous].selected&&!self.columns[current].selected)||(self.columns[previous].selected&&self.columns[previous].selected!=data[entity].id))
			{
				self.columns[current].selected=false;
				return  false;
			}
		}
		return true;
	},
    /**
     * If one column is generate, then we need to empty all other column
     * @param {string} column 
     */
    emptyColumn: function(column) {
        var jQBody = jQuery("body");// NO I18N
        jQBody.find("[data-column='" + column + "'] .space-count").text("( 0 )").addClass("hide");// NO I18N
        jQBody.find("[data-column='" + column + "'] > span").removeClass("text-color4");// NO I18N
        jQBody.find("#cards-" + column + " .card-holder").html("");// NO I18N
        jQBody.find("#cards-" + column + " .connecting-line").css({// NO I18N
            height: 0
        });
        if (this.columns[column]) {
          //  this.columns[column].selected = false;
            this.columns[column].disable = true;
        }
    },
    /**
     * Construct the input data based on the column
     * @param {string} column 
     * @param {string} previousColumn 
     * @returns 
     */
    getInputData: function(column, previousColumn,loadMore) {
        var currentColumn = this.columns[column];
        previousColumn = this.columns[previousColumn];
        if (!currentColumn) {
            return false;
        }
        var list_info = currentColumn.list_info || undefined;
        var input_data = {
            list_info: list_info
        };
        list_info.fields_required = ["name", "status", "building_type","type", "template","total_capacity"];// NO I18N
		if(this.permissions.viewRequestsModule){
			input_data.list_info.fields_required.push("request_count");
		}
		if(column=="space_campuses"){
			input_data.list_info.fields_required.push("site");
		}
		else if(column=="space_structures"){
			key="space_campus"; // No I18N
			input_data.list_info.fields_required.push("site","space_campus");
		}
		else if(column=="space_floors"){
			key="space_building"; // No I18N
			input_data.list_info.fields_required.push("site","space_campus","space_building");
		}
		else if(column=="space_rooms"){
			key="space_floor"; // No I18N
			input_data.list_info.fields_required.push("site","space_campus","space_building","space_floor");
		}		
        /**
         * Build Search Criteria
         */
        var search_criteria = [];
        if (previousColumn && previousColumn.selected) {
            search_criteria.push({
                condition: "is",// NO I18N
                field: previousColumn.search_key,
                value: previousColumn.selected,
                logical_operator: "and"// NO I18N
            });
        }
		if (loadMore&&currentColumn && currentColumn.selected) {
            search_criteria.push({
                condition: "is_not",// NO I18N
                field: "id", // No I18N
                values: [currentColumn.selected],
                logical_operator: "and"// NO I18N
            });			
		}
        if (search_criteria.length) {
            input_data.list_info.search_criteria = search_criteria;
        }
        return input_data;
    },
    /**
     *  Activate the active tabs and call the connecting lines
     */
    calculateLines: function() {
        /**
         * Add Active class for all selected cards
         */
        var jQBody = jQuery("body");// NO I18N
        jQBody.find("#treeview .sdp-card").removeClass("selected-card top-float bottom-float");// NO I18N
        var self = this;
        jQuery.each(self.columns, function(index, item) {
            if (item.selected) {
                jQBody.find(".sdp-card[data-id='" + item.selected + "']").addClass("selected-card "+this.floating_class);// NO I18N
            }
        });
        /**
         * Reset the calucated colors
         */
        jQBody.find(".right-line, .left-line, .connecting-line").css("background", "#CCCCCC");// NO I18N
        self.connectingLine();
    },
    /**
     * It generate the lines based on the selected positions
     */
    connectingLine: function() {
        var self = this;
        var jQBody = jQuery("body");// NO I18N
        jQuery.each(self.columns, function(index) {
            /**
             * Get First and Last Line of card
             */
            var column = jQBody.find("#cards-" + index);// NO I18N
			var firstCard = column.find(".sdp-card").first();
			var start_height = firstCard.position();		//No i18N
			if(firstCard.hasClass("top-float selected-card")){
				start_height.top = 15;
			}
			var end_height = column.find(".sdp-card").last().position();			//No i18N
			var card_height = column.find(".sdp-card").height()/2;
			var previousColumn = self.getPreviousColumn(index);
            var previousColumnCards = jQBody.find("#cards-" + previousColumn);// NO I18N
			if(index!="space_campuses"&&column.find('.sdp-card').length >= 1){
            column.find('[data-name="gray_line"]').css({// NO I18N
                height: (end_height.top - start_height.top + 1),
                top: (start_height.top + card_height-20)
            });
			previousColumnCards.find(".selected-card .right-line").show();// NO I18N
			}
			else{
				 column.find('[data-name="gray_line"]').css('height','0px');// No I18N
			}
            /**
             * Open the previous active left
             */
            
            /**
             * Show the blue color
             */
			 var previous_level = self.getPreviousColumn(index);
			if(previous_level){
				var current_level_selected = column.find(".sdp-card").hasClass('selected-card');// No I18N
				var current_level_position = column.find(".sdp-card").position();
				if(current_level_selected){
					current_level_position = column.find(".selected-card").position();
					var blue = "#0192B8"; // NO I18N
                    column.find('[data-name="connecting_line"]').css({background: blue});
					previousColumnCards.find(".selected-card .right-line").css("background", blue); // NO I18N
                    column.find(".selected-card .left-line").css("background", blue);// NO I18N
				}
				var prev_level_position = jQBody.find("#cards-" + previousColumn).find(".selected-card").position();
				if(current_level_position && prev_level_position){
					var heightDifference = current_level_position.top > prev_level_position.top? current_level_position.top - prev_level_position.top : prev_level_position.top - current_level_position.top;
					var current_level_height = column.find('.space-card-container').height()/2;
					var prev_level_height = previousColumnCards.find('.space-card-container').height()/2;
					if(current_level_position.top < prev_level_position.top){
						column.find('[data-name="connecting_line"]').css('height', heightDifference - current_level_height + prev_level_height + 1).css('top', current_level_position.top + current_level_height-20);// No I18N
					}else{
						column.find('[data-name="connecting_line"]').css('height', heightDifference - prev_level_height + current_level_height + 1).css('top', prev_level_position.top + prev_level_height-20);// No I18N
					}
					if(current_level_height > prev_level_height && heightDifference <= current_level_height - prev_level_height && current_level_position.top <= prev_level_position.top){
						column.find('[data-name="connecting_line"]').css('height',current_level_height - prev_level_height - heightDifference + 1).css('top',prev_level_position.top + prev_level_height-20);// No I18N
					}else if(current_level_height < prev_level_height && heightDifference <= prev_level_height - current_level_height && current_level_position.top >= prev_level_position.top){
						column.find('[data-name="connecting_line"]').css('height',prev_level_height - current_level_height - heightDifference + 1).css('top',current_level_position.top + current_level_height-20);// No I18N
					}
				}
			}
			var headingElement= jQuery('#'+index+"_heading");
			column.off("mouseenter").on("mouseenter", function(event){ // No I18N
					headingElement.find(".space-tree-search-icon").addClass("search-icon-visible");
			});
			column.off("mouseleave").on("mouseleave", function(event){ // No I18N
					headingElement.find(".space-tree-search-icon").removeClass("search-icon-visible");
			});
        });
    },
    /**
     * Get the Top Offset of the element
     * @param {HTMLElement} el 
     * @returns {Number} Offset of the element
     */
    getOffset: function(el) {
        if (el instanceof jQuery) {
            //el = el[0];
        }
        try {
            var bodyRect = document.getElementById('treeview').getBoundingClientRect(),
                elemRect = el.getBoundingClientRect(),
                offset = elemRect.top - bodyRect.top;
            return offset;
        } catch (e) {
            return 0;
        }
    },
    /**
     * If user reaches the last, we need to call the API again to 
     * load next set of the cards
     * @param {string} column 
     */
    loadMore: function(column) {
        var jQBody = jQuery("body");
        // jQBody.find("#cards-" + column + " .bottom-arrow").show();
        if (!this.is_loading && this.columns[column].has_more_rows) {
            this.renderColumn({
                column: column,
                isAppend: true,
				loadMore: true
            });
            this.is_loading = true;
        }
    },
    /**
     * Search the columns
     * @param {string} value 
     * @param {string} column 
     */
    search: function(value, column) {
        if(this.columns[column] && !this.columns[column].disable){
			jQuery("#"+column+"_heading").addClass('search-result');
			jQuery("#"+column+"_search_result").removeClass('hide').find('span:first').html(translate("search.results.for",["\""+e_html(value)+"\""])).attr("title",e_attr(value));
            this.renderColumn({
                column: column,
                search: value
            });
        }
    },
    /**
     * Sort the column
     * @param {jQuery<el>} jQuery element
     */
    sort: function(el){
        var self = this;
        var column = jQuery(el).closest("[data-column]").data("column");// NO I18N
        if(self.columns[column] && self.columns[column].disable){
            return false;
        }
        var order = "asc";// NO I18N
        var icons = jQuery(el).find("> span");// NO I18N
        var activeElementID = jQuery("#cards-" + column + " .selected-card").data("id");// NO I18N
        if (activeElementID) {
            var activeElement = jQuery("#cards-" + column + " .selected-card")[0].outerHTML;// NO I18N
        }
        if (icons.hasClass("sort-down")) {// NO I18N
            icons.removeClass("sort-down").addClass("sort-up");// NO I18N
            order = "desc";// NO I18N
			icons.attr("title",translate("common.sortby.ascending"));
        } else {
            icons.removeClass("sort-up").addClass("sort-down");// NO I18N
			icons.attr("title",translate("common.sortby.descending"));
        }
        self.columns[column].list_info.sort_order = order;
        var callback = function(column) {
            if (activeElementID) {
                if (!jQuery("#cards-" + column + " [data-id='" + activeElementID + "'] ").length) {
                    jQuery("#cards-" + column + " .card-holder").prepend(activeElement);
                }
                setTimeout(function() {
                    //jQuery("#cards-" + column + " [data-id='" + activeElementID + "'] ").trigger("click");
                }, 100);
				self.calculateLines();
            }
        };
        self.renderColumn({
            column: column,
            skipEmpty: true,
            callback: callback
        });
    },
    /**
     * More options on card
     * @param {jQuery<element>} el clicked card
     */
    moreOptions: function(e,el){
		var _self=this;
		if(jQuery("#showPopover").is(":visible")){
			jQuery("#showPopover").hide();
			return;
		}
        var card = jQuery(el).closest(".sdp-card");// NO I18N
		var spaceId=card.find(".space-name-container").attr("data-space-id");
        let spaceName=card.find(".space-name-container").text();
		var dataSpaceModule=card.find(".space-name-container").attr("data-space-module");
        showPopover(e, false, function() {
            /**
             * Instead of Dropdown, we are use popover
             * To reduce the DOM node count
             */
            jQuery("#showPopover").find(".popover-inner").html(// NO I18N
                '<div class="sdmenu open more-options">'+// NO I18N
                '<ul class="sdmenu-dd" role="menu">'+// NO I18N
                (_self.permissions.edit?'<li><a id="edit-space-popover" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-edit" rel="noopener" href="/ui/space?mode=edit&module='+dataSpaceModule+'&entity_id='+spaceId+'"  >'+translate("common.edit")+'</a></li>':'')+// NO I18N
                (_self.permissions.links_create_request?'<li><a id="create-request-popover" href="/"  >'+translate("chat.create.request")+'</a></li>':'')+// NO I18N
                '<li><a href="/" id="view-space-popover"  >'+translate("common.viewdetails")+'</a></li>'+// NO I18N
                '</ul>'+// NO I18N
                '</div>'// NO I18N
            );
            let ele = jQuery("#showPopover").find(".popover-inner").first();
                ele.find('#create-request-popover').first().off('click').on('click', (event) => {
                    $spaceTree.addRequest(spaceId,spaceName);
                    return false;
                });
                ele.find('#view-space-popover').first().off('click').on('click', (event) => {
                    window.open('/ui/space?mode=details&module='+dataSpaceModule+'&entity_id='+spaceId,'_blank','noopener');
                });
            jQuery(".popover-ui").css({
                border: "none",// NO I18N
                "box-shadow": "none"// NO I18N
            });
        });
    },
	addRequest : function (spaceId,spaceName){
		jQuery("#showPopover").hide();
		$space.openRequestForm('create_requst_popup','create_request_tree_container',spaceId,spaceName,"tree"); // No I18N
	},
	handlePostRequestCreation: function(spaceID){
		var container = jQuery('div[data-id="'+spaceID+'"]');
		var reqCount= container.find('.child-space-count').attr("data-requests-count");
		reqCount=parseInt(reqCount)+1;
		container.find('.child-space-count').attr("data-requests-count",reqCount);
		container.find('.child-space-count').attr("title",translate('sdp.requests.viewrequest.openrequests')+' : '+reqCount);
		container.find('.child-space-count').find("span:nth-child(2)").html(reqCount);
	},
    /**
     * Bind all events related to SpaceTree
     */
    bindEvents: function() {
        var self = this;
        /**
         * Card Next Columns
         */
        jQuery("#treeview").on("click", ".sdp-card", function(e) {// NO I18N
            var jQBody = jQuery("body");// NO I18N
            var card = jQBody.find(this);
            var column = card.data("column");// NO I18N
			var building_type=card.data("building-type"); // NO I18N
			var common_module=card.data("common-module"); // NO I18N
            if (!column) {
                return;
            }
			if(common_module=="space_building"&&self.selected_building_type!=building_type)
			{
				if(building_type=="Rooms Only")
				{
					jQuery('#space_floors_heading').remove();
					jQuery('#cards-space_floors').remove();
					delete self.columns["space_floors"];
				}
				else{
                    let xhtml= self.space_floors_copy.heading_html;
                    xhtml = jQuery(xhtml);
					jQuery('#space_structures_heading').after(xhtml);
                    xhtml.find('#space_floors_close_results').first().off('click').on('click', (event) => {
                        $spaceTree.closeResults('space_floors');
                    });
					jQuery('#cards-space_structures').after(self.space_floors_copy.body_html);
					self.bindEvents();
					self.emptyColumn("space_rooms"); // NO I18N
					self.columns["space_rooms"].disable = false;
					self.columns["space_floors"]=self.space_floors_copy;
                    initTooltip('#space_floors_heading');// NO I18N
				}
				self.selected_building_type=building_type
			}
            var entity_id = card.data("id");// NO I18N
            var nextColumn = self.getNextColumn(column);
            self.columns[column].selected = entity_id;
            self.columns[column].disable = false;
            /**
             * Add data to the personalization
             */
            self.savePersonalization(column);
            if (e.hasOwnProperty("originalEvent")) {// NO I18N
                self.renderColumn({
                    column: nextColumn
                });
            }
            /**
             * Hide the connecting line, then we show them based on the calulation
             */
            jQBody.find(".sdp-card .right-line").hide();// NO I18N
            /**
             * Give sometime to data render
             */
            setTimeout(function() {
                self.calculateLines(column);
            }, 200);
        });
        /**
         * Connecting Lines Events
         */
        jQuery("#treeview, .space-scroll-container").on("scroll.treeview", function() {// NO I18N
            self.connectingLine();
        });
        /**
         * Close the popover and input, if the user clicks body
         */
		jQuery(document.body).on("click", function() {// NO I18N
            jQuery("#showPopover").hide();
		});
        var skipSelectors = [".more-options", ".more-options *", "[data-name='search-input']", "[data-name='search-input'] *", "[data-name='column-name']", "[data-name='column-name'] *"];// NO I18N
        jQuery(document.body).on("click", ":not(" + skipSelectors.join(",") + ")", function() {// NO I18N
            jQuery("#showPopover").hide();
            var container = jQuery(".space-tree-title-container");// NO I18N
            container.find('[data-name="search-input"]').addClass("hide");// NO I18N
            container.find('[data-name="column-name"]').removeClass("hide");// NO I18N
			container.removeClass("hide-heading");
        });
        /**
         * Prevent expand the tree, when name was clicked
         */
        jQuery("#treeview .space-card-name").off("click").on("click", function(e) {// NO I18N
            e.stopPropagation();
        });
        /**
         * Open the Show More dropdown
         */
        jQuery("#treeview").on("click", " [data-name='more']", function(e) {// NO I18N
            e.stopPropagation();
           self.moreOptions(e,this);
        });
        /**
         * Load More Events
         */
        jQuery(".space-scroll-container").on("scroll.treeview-column", function() {// NO I18N
            if (Math.round(jQuery(this).scrollTop() + jQuery(this).innerHeight(), 10) >= Math.round(jQuery(this)[0].scrollHeight, 10)) {
                self.loadMore(jQuery(this).data("column"));// NO I18N
            }
			var column=jQuery(this).data("column"); // No I18N
			var container = jQuery("#"+column+"_container");
			var columnContainer = jQuery('#cards-'+column);
			if(container.scrollTop() > 10){
				columnContainer.find('.upper-arrow').html('<div class="upper-scroll-button" title="'+translate('scroll.up')+'"></div>');
				columnContainer.find('.upper-arrow .upper-scroll-button').on('click', function(event){
					container.animate({scrollTop : 0}, {speed : 'slow'});	//No i18N
				});
			}
			else{
				columnContainer.find('.upper-arrow').html('');
			}
			if(container.scrollTop() + container.innerHeight() < container[0].scrollHeight - 10){
				columnContainer.find('.bottom-arrow').html('<div class="bottom-scroll-button" title="'+translate('scroll.down')+'"></span></div>');
				var height = container[0].scrollHeight;
				columnContainer.find('.bottom-arrow .bottom-scroll-button').on('click', function(event){
					container.animate({scrollTop : height }, {speed : 'slow'});	//No i18N
				});
			} else{
				columnContainer.find('.bottom-arrow').html('');
			}
			var selectedCard = columnContainer.find(".selected-card");
			var selected_card_position = selectedCard.position();
			if(selected_card_position && selected_card_position.top <= 25){
				selectedCard.addClass("top-float");
			}else{
				selectedCard.removeClass("top-float");
			}
			if(selected_card_position && container.innerHeight() < selected_card_position.top + 110){
				selectedCard.addClass("bottom-float");
			}else{
				selectedCard.removeClass("bottom-float");
			}			
        });
        /**
         * Sort the column
         */
        jQuery("#treeview .sort").on("click", function() {// NO I18N
            self.sort(this);
        });
        /**
         * Search Button Toggle
         */
        var cont = jQuery(".space-tree-title-container");// NO I18N
        cont.find(" [data-name='search-icon']").on("click", function(e) {// NO I18N
            e.stopPropagation();
            if(jQuery("#showPopover").is(":visible")){
                jQuery("#showPopover").hide(); // NO I18N
            }
            var container = jQuery(this).closest(".space-tree-title-container");// NO I18N
            container.find('[data-name="search-input"]').removeClass("hide");// NO I18N
            container.find('[data-name="column-name"]').addClass("hide");// NO I18N
			container.addClass('hide-heading');
			var columnsList=["space_campuses","space_structures","space_floors","space_rooms"];  // No I18N
			var currentColumn=container.attr("data-column");
			for(var i=0;i<4;i++){
				if(currentColumn!=columnsList[i]){
					var otherContainer=jQuery("#"+columnsList[i]+"_heading");
					if(otherContainer.length>0){
						otherContainer.removeClass('search-result');
						otherContainer.find("#"+columnsList[i]+"_search_result").addClass('hide').find('span:first').text("").attr("title","");	
					    otherContainer.find('[data-name="search-input"]').addClass("hide");// NO I18N
						otherContainer.find('[data-name="column-name"]').removeClass("hide");// NO I18N
						otherContainer.removeClass("hide-heading");
					}
				}
			}
            setTimeout(function() {
                container.find('.form-control').focus();// NO I18N
            }, 100)
        });
        /**
         * Stop the event propagation to avoid unwanted search hidden issue
         */
        cont.find("[data-name='search-input']").on("click", function(e) {// NO I18N
            e.stopPropagation();
        });
        /**
         * On Search Enter
         */
        cont.find(".form-control").on("keypress", function(e) {// NO I18N
            if (e.keyCode === 13) {
                if(jQuery("#showPopover").is(":visible")){
                    jQuery("#showPopover").hide(); // NO I18N
                }
                var column = jQuery(this).closest('[data-column]').data("column");// NO I18N
                self.search(e.target.value, column);
                var container = jQuery(this).closest(".space-tree-title-container");// NO I18N
                container.find('[data-name="search-input"]').addClass("hide");// NO I18N
                container.find('[data-name="column-name"]').removeClass("hide");// NO I18N
				container.removeClass("hide-heading");
            }
        });
    },
    /**
     * Save Personal Information
     */
    savePersonalization: function(currentColumn){
        var personalization = {};
		var skipColumns={"space_campuses":["space_structures","space_floors","space_rooms"],"space_structures":["space_floors","space_rooms"],"space_floors":["space_rooms"],"space_rooms":[]}; // NO I18N
        var self = this;
        jQuery.each(this.columns, function(column, value){
            if(value.selected ){
                if( jQuery("#cards-"+column+" [data-id='"+value.selected+"']").length&&!skipColumns[currentColumn].includes(column)){
                    personalization[column] ={
                        id: value.selected
                    }
                }else{
                    self.columns[column].selected = false;
                }
            }
        });
        /**
         * Save in user Personalization
         */
        addPersonalization("spacetree", personalization, true); // NO I18N
    },
    /**
     * Sync Personalization data
     * i.e Keep the page last time they visit
     */
    syncPersonalization: function(){
        var self = this;
        var jQBody = jQuery("body");
        var personalization = self.personalization;
        /**
         * A helper for active the element programatically
         * @param {Number} id 
         * @param {HTMLElement<string>} html 
         * @param {string} column 
         */
        var activateElement = function (id, column) {
            if(id){
				if (jQBody.find("#cards-" + column + " [data-id='" + id + "'] ").length === 0) {
                    let xhtml=self.columns[column].selected_card_html;
                    xhtml = jQuery(xhtml); 
                    jQBody.find("#cards-" + column + " .card-holder").prepend(xhtml);
				}
			}
			self.columns[column].disable = false;
			self.calculateLines(column);
          //  jQBody.find("#cards-" + column + " [data-id='" + id + "'] ").trigger("click");
        }
        jQuery.each(personalization, function(key, value){
            if(self.columns[key]){
                self.columns[key].selected = value.id;
            }
            /*if(self.columns[key] && self.columns[key].disable){
                self.columns[key].disable = false;
                /**
                 * Personalized column is not available, so need to render
                 */
               /* self.renderColumn({
                    column:key,
                    callback:function(){
                        activateElement( value.id, key );
                    }
                })
            }else{
                activateElement(value.id, key);
            }*/
        });
		 self.renderColumn({
			column:"space_campuses",// NO I18N
            callback:function(){
				activateElement( personalization["space_campuses"]? personalization["space_campuses"].id:null, "space_campuses" );// NO I18N
				if(personalization["space_campuses"]){
				self.renderColumn({
					column:"space_structures",// NO I18N
					callback:function(){
						activateElement( personalization["space_structures"]?personalization["space_structures"].id:null, "space_structures" );// NO I18N
						if(self.selected_building_type=="Rooms Only"){
							if(personalization["space_structures"]){
								self.renderColumn({
									column:"space_rooms",// NO I18N
									callback:function(){
										activateElement( personalization["space_rooms"]?personalization["space_rooms"].id:null, "space_rooms" );// NO I18N
									}
								});
							}
						}
						else{
						if(personalization["space_structures"]){
						self.renderColumn({
							column:"space_floors",// NO I18N
							callback:function(){
								activateElement( personalization["space_floors"]? personalization["space_floors"].id:null, "space_floors" );// NO I18N
								if(personalization["space_floors"]){
								self.renderColumn({
									column:"space_rooms",// NO I18N
									callback:function(){
										activateElement( personalization["space_rooms"]?personalization["space_rooms"].id:null, "space_rooms" );// NO I18N
									}
								});
								}
							}
						});	
						}						
						}
					}
				});
				}
            }
       });
    },
	getHTML : function (column,id)
	{
		var self=this;
		var key='';
		var input= {"list_info": {"search_criteria": [{"field": "id", "condition": "is", "values": [id]}], "fields_required": ["name", "type", "template", "total_capacity", "building_type", "status"]}}; // No I18N
		if(self.permissions.viewRequestsModule){
			input.list_info.fields_required.push("request_count");
		}
		if(column=="space_campuses"){
			input.list_info.fields_required.push("site");
		}
		else if(column=="space_structures"){
			key="space_campus"; // No I18N
			input.list_info.fields_required.push("site","space_campus");
		}
		else if(column=="space_floors"){
			key="space_building"; // No I18N
			input.list_info.fields_required.push("site","space_campus","space_building");
		}
		else if(column=="space_rooms"){
			key="space_floor"; // No I18N
			input.list_info.fields_required.push("site","space_campus","space_building","space_floor");
		}
		var dataVal = sdpAjaxInputData(input);
		var html='';
		sdpAjax(
		{
				url: '/api/v3/spaces/'+column, // No I18N
				cache: false,
				data: dataVal,
				async: false,
				success: function(resp)
				{
					var dataresp=resp[column];
					if(dataresp&&dataresp.length>0){
						dataresp=dataresp[0];
				if(column=="space_rooms"&&self.selected_building_type=="Rooms Only")
				{
					key="space_building"; // No I18N
				}		
				if(column!="space_campuses"&&self.columns[self.getPreviousColumn(column)].selected!=dataresp[key].id)
				{
					self.columns[column].selected=false;
					return false;
				}
				if(column=="space_structures"&&dataresp.building_type)
				{
					self.selected_building_type=dataresp.building_type;
				}
					html+= '<div class="sdp-card" data-id="'+dataresp.id+'" data-column="'+e_attr(column)+'" data-building-type="'+e_attr(dataresp.building_type)+'" data-common-module="'+e_attr(dataresp.common_module)+'">'+
        '<div class="sdp-table-card">'+
            '<div class="space-card-container">'+
                '<div class="space-card-details">'+
                    '<div class="menu-button dot-button" title="'+translate('common.options')+'" role="img">'+
                        '<span>'+
                            '<span class="">'+
                                '<div class="choose-drop-btn">'+
                                    '<input class="choose-drop-btn-select fl" type="hidden" value="" />'+
                                '</div>'+
                                '<span class="space-card-options-button cur-ptr" closeon-bodyclick="yes" custom-class="space-popover" data-name="more" ></span>'+
                            '</span>'+
                        '</span>'+
                    '</div>'+
                    '<div class="status-indication" style="background: '+e_attr(dataresp.status.color)+';" title="'+e_attr(dataresp.status.name)+'" role="img" ></div>'+
                    '<div id="space-card-text-container" class="space-card-text-container" >'+
                        '<div class="space-card-name text-overflow" data-url="" title="'+e_attr(dataresp.name)+'"><a rel="noopener" href="/ui/space?mode=details&module='+dataresp.common_module.substring(6)+'&entity_id='+dataresp.id+'" data-spa="true" data-spa-module="spaces" data-spa-page="spaces-details" data-name="space-name-container" data-space-id="'+e_attr(dataresp.id)+'" data-space-module="'+(dataresp.common_module.substring(6))+'"  class="space-name-container">'+e_html(dataresp.name)+'</a></div>'+
                        '<div class="space-card-type text-overflow" title="'+e_attr(dataresp.template.name)+'"> '+e_html(dataresp.template.name)+'</div>'+
                    '</div>'+
                    '<div class="space-card-inner-details">'+
                        '<div class="space-card-capacity text-overflow mr-3" role="img" title="'+translate('sdp.inventory.asset.printerinfo.totalCapacity')+' : '+e_attr(dataresp.total_capacity)+'">'+
						'<span class="sspr icon-sm people mr5 top-1"></span>'+
                            e_html(dataresp.total_capacity)+
                        '</div>'+
                        (self.permissions.viewRequestsModule? ('<div data-requests-count="'+dataresp.requests.open+'" class="child-space-count text-overflow" role="img" title="'+translate('sdp.requests.viewrequest.openrequests')+' : '+dataresp.requests.open+'"><span class="sspr icon-sm ticket mr5"></span><span>'+e_html(dataresp.requests.open)+'</span></div>') : '' )+
                    '</div>'+
                '</div>'+
                '<div class="left-line"></div>'+
                '<div class="right-line"></div>'+
            '</div>'+
        '</div>'+
    '</div>';
					}
				}
		});
		return html;
	},
	closeResults : function(column){
		jQuery("#"+column+"_heading").removeClass('search-result');
		jQuery("#"+column+"_heading").find('[data-name="search-input"]').find(':input').val('');				
		jQuery("#"+column+"_search_result").addClass('hide').find('span:first').text("").attr("title","");		
		 this.renderColumn({
			column: column,
			isAppend : false,
			clearSearch: true
         });
	}
  };
Handlebars.registerHelper('getModule', function(common_module) { //NO I18N 
	return common_module.substring(6);	
});