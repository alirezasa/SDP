/* $Id$ */
var $dd_analysis = {
    flag: false,
    chartData: [],
    root: null,
    tree: null,
    groupBy: [],
    chartNodes: "",
    options: {
        selector: "dd_canvas", //No I18N
        width: parseInt(jQuery("#dd_reports").width() - 80),
        height: parseInt(jQuery("#dd_reports").height() - 80),
        margin: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40
        }
    },
    nodeId: 0,
    ddTree: null,
    ddHierarchy: null,
    selectedNode: null,
    initial_m_count:8,
    splitup_m_count:5,
    module_options: {},
    loadModule: function(queryParams) {
        var moduleOptions = {
            module: 'requests', //No I18N
            queryParams: queryParams,
            excluded_fields: [],
            included_fields: [],
            list_info: {},
            filter_by: {},
            url: '/ui/reports/drilldown', //No I18N
        };
        moduleOptions.module_i18n = translate("sdp.requests.viewrequest.allrequests"); //No I18N
        moduleOptions.filter_by = {created_time: "sdp.requests.common.createddate", responded_time: "sdp.requests.newrequest.respondeddate", due_by_time: "sdp.requests.newrequest.duebydate", completed_time: "sdp.requests.newrequest.completeddate" }; //No I18N
        moduleOptions.excluded_fields = ["subject","reason_for_cancel","created_time","due_by_time","description","service_category", "service_sla", "scheduled_end_time","scheduled_start_time","email_ids_to_notify","is_vipuser","cancel_requested","first_response_due_by_time","on_behalf_of","is_fcr","impact_details","assets","configuration_items","editor","resolution","closure_info","is_pending_status","resources","udf_fields","update_reason"]; //NO I18N
        moduleOptions.included_fields = ["sla"]; //NO I18N
        if(isSCP){
            moduleOptions.included_fields.push("subaccount");//NO I18N
        }
        if(window.isMSPOrSCP){
            moduleOptions.excluded_fields.push("is_billable");//NO I18N
        }
        
        this.init(moduleOptions);
    },
    init: function (options) {
        var _self =this;
        _self.module_options = jQuery.extend(_self.module_options, options);
        _self.module_options.default_i18n = _self.module_options.module_i18n;
        this.initFilterBy(options.filter_by);
        this.bindEvents();
        this.loadValues();
        if(drillDownFromWidget) {
            this.updateUIForWidget();
        }
    },
    updateUIForWidget: function() {
        jQuery("#blackBorderTable").removeClass("block-bordered");
        jQuery("#drillDownTitle").text("");
        jQuery("#dd_reports").addClass("p0");
        jQuery("#drillDownHeaderDiv").addClass("mb0");
        jQuery("#dd_title").addClass("top10 ml0");
        jQuery("#dd_criteria").removeClass("top15");
    },
    initFilterBy: function(filters) {
        if(Object.keys(filters).length>0) {
            var i18nKeys = {created_time: "sdp.requests.history.created", responded_time: "drilldown.responded", due_by_time: "sdp.requests.common.dueby", completed_time: "sdp.reports.reportHome.completed"}; //No i18N
            jQuery("#dd_criteria").removeClass("hide");
            jQuery("#dd_title").removeClass("vhide");
            var filterBy = document.getElementById("dd_filter_by").options;
            var i = 0;
            for(var value in filters) {
                filterBy[i] = new Option(translate(filters[value]), value);
                filterBy[i].setAttribute("data-key", i18nKeys[value]); //NO i18N
                i++;
            }
            jQuery("#"+this.options.selector).empty();
            jQuery("#dd_summary").empty().hide();
            jQuery("#dd_filter_by").select2({ minimumResultsForSearch: -1 });
        }
        else {
            jQuery("#dd_criteria,#dd_dropdown").addClass('hide');
            jQuery("#dd_title").addClass("vhide");
            this.loadChartData();
        }
    },
    bindEvents: function () {
        var _self = this;
        jQuery("#dd_apply").off("click").on("click", function () { //NO I18N
            var filter_by = jQuery("#dd_filter_by").val();
            var period = jQuery("#calendarPlaceholder_options").val();
            var dateObj = jQuery('#calendarPlaceholder').ZSDPCalendar("getComponentDateObject"); //NO I18N
            if(jQuery.isEmptyObject(dateObj)) {
                showalert('failure', translate("sdp.admin.backup.setting.select.date.ask"),'isAutoHide=true,delay=3'); //No I18N
                return false;
            }
            
            var duration = [dateObj.from.fromValue.getTime(), dateObj.to.toValue.getTime()+86400000-1]; //+86400000 is one day milli seconds to get end time of the day.
            var filterByDisplay = translate(jQuery("#dd_filter_by option:selected").data('key')).toLowerCase(); //NO I18N
            
            var dateText = jQuery(".zselectbox__selected").text(); //NO I18N
            if(dateText.indexOf('-')!=-1) {
                dateText = " " + translate("sdp.reports.customReportFilter.during").toLowerCase() + dateText; 
            }
            jQuery("#dd_title").text(_self.module_options.default_i18n+" "+filterByDisplay+dateText);
            
            _self.loadChartData(filter_by, period, duration);
            jQuery("#dd_dropdown").removeClass("show").addClass("hide");
        });
        jQuery(document).off("click.drilldown").on("click.drilldown", function (event) { //No I18N
            if (jQuery(event.target).closest("#fields_popup").length == 0) {
                jQuery("#list_wrapper").hide();
            }
        });
        jQuery(document).off("click.dd_grouplist").on("click.dd_grouplist", "#list_cont ul li", function () { //No I18N
            var group_by = jQuery(this).attr("data-id");
            if(group_by == "field-search"){
                return false;
            }
            var swapTree = jQuery(this).attr("data-swaptree");
            if (swapTree) {
                _self.swapMoreNode(swapTree);
                jQuery("#list_wrapper").hide();
                return;
            }
            if (_self.groupBy.indexOf(group_by) == -1) {
                _self.showChildren(group_by);
            }
            jQuery("#list_wrapper").hide();
        });

        jQuery.fn.d3Click = function () {
          this.each(function (i, e) {
            var evt = new MouseEvent("click"); //No I18N
            e.dispatchEvent(evt);
          });
        };
    },
    loadChartData: function (filter_by, period, duration) {
        var _self = this;
        _self.listInfo = { list_info: { get_total_count: true } };
        if(filter_by && period && duration) {
            var params = {filter_by: filter_by};
            if(period === 'SPECIFIC_DATE' || period ==='CUSTOM_RANGE') {
                period = period.replace(' ', '_').toUpperCase();
                params.startTime = duration[0];
                params.endTime = duration[1];
            }
            params.period = period;
            _self.updateFiltersURL(params, true);
             var criteria = _self.getDateCriteria(filter_by, period, duration);
             _self.listInfo.list_info.search_criteria = [criteria];
        }
        if(_self.module_options.module=='requests') {
            _self.listInfo.list_info.group_by = [ "is_overdue", "status.in_progress" ]; //No I18N
        }
        var input_data = sdpAjaxInputData(_self.listInfo);
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/"+_self.module_options.module, //No I18N
            data: input_data,
            async:false,
            success: function (resp) {
                _self.processRespData(resp, {
                    filter_by: filter_by,
                    duration: duration,
                    criteria: criteria
                });
            }
        });
    },
    processRespData: function (resp, filters) {
        var _self = this;
        var data = {
            name: _self.module_options.default_i18n,
            count: resp.list_info.total_count,
            filter_by: filters.filter_by,
            duration: filters.duration,
            keyid: 0,
            keytype: _self.module_options.module,
            children: [],
            criteria: filters.criteria
        };

        var total_count = 0;
        if(_self.module_options.module=='requests') {
            var pending_count = 0,completed_count = 0,sla_count = 0;
            var countData = resp[_self.module_options.module];
            jQuery.each(countData, function(i,v) {
                total_count += parseInt(v["id:count"]); //No I18N
                if(!v.is_overdue && v["status.in_progress"] == "false"){ //No I18N
                    completed_count = v["id:count"]; //No I18N
                } 
                if(v["status.in_progress"] == "true"){ //No I18N
                    pending_count += parseInt(v["id:count"]); //No I18N
                }
                if(v["status.in_progress"] == "true" && v.is_overdue){
                    sla_count = v["id:count"]; //No I18N
                }
            });
            data.count = total_count;
            jQuery("#dd_summary").html("<ul><li class='active'><a id='allRequests' data-id='allRequests' data-event='click' nonce='"+sdpNonce+"' data-handler='$dd_analysis.redrawChart({count: "+total_count+", name: \"sdp.requests.viewrequest.allrequests\"})'>" + translate("sdp.requests.common.all") +"</a> ("+ total_count + ")</li>" //No I18N
                +"<li><a id='pendingRequest' data-id='pendingRequest' data-event='click' nonce='"+sdpNonce+"' data-handler='$dd_analysis.redrawChart({criteria: [{field: \"status.in_progress\", value: true}], count: "+pending_count+", name: \"sdp.home.summary.openRequestsTitle\"})'>" + translate("sdp.requests.common.Pending")+ "</a> ("+pending_count+")</li>" //No I18N
                +"<li><a id='completedRequest' data-id='completedRequest' data-event='click' nonce='"+sdpNonce+"' data-handler='$dd_analysis.redrawChart({criteria: [{field: \"status.in_progress\", value: false}, {field: \"is_overdue\", value: false}], count: "+completed_count+", name: \"sdp.home.summary.closedRequestsTitle\"})'>" + translate("sdp.admin.statusDef.complete")+ "</a> ("+completed_count+")</li>" //No I18N
                +"<li><a id='slaViolatedRequest' data-id='slaViolatedRequest' data-event='click' nonce='"+sdpNonce+"' data-handler='$dd_analysis.redrawChart({criteria: [{field: \"status.in_progress\", value: true}, {field: \"is_overdue\", value: true}], count: "+sla_count+", name: \"sdp.dashboard.view.SLAViolatedOpenChart\"})'>" + translate("sdp.request.listview.slaoverdue")+ "</a> <span class='text-danger'> ("+sla_count+")</span></li></ul>").show(); //No I18N
            $sdEventListener(jQuery("#dd_summary"));
        }
        else {
            jQuery("#dd_summary").html("<strong>"+ translate("sdp.requests.common.all") +" ("+ data.count + ")</strong>").show(); //No I18N
        }
        this.drawChart(data);
    },
    redrawChart: function(options) {
        var data = $dd_analysis.root.data;
        this.module_options.module_i18n = data.name = translate(options.name);
        data.count = options.count;
        data.children = [];
        $dd_analysis.listInfo.list_info.search_criteria = [$dd_analysis.root.data.criteria];
        if(options.criteria) {
            for(var crit of options.criteria) {
                $dd_analysis.listInfo.list_info.search_criteria.push({field: crit.field, condition:"is", value: crit.value, logical_operator: "and"}); //No I18N
            }
        }
        this.drawChart(data);
        if(event && event.target) {
            this.updateFiltersURL({subFilter: event.target.id, fields: "", values: ""}, false);
            eventElement = jQuery(event.target)[0];
            jQuery(eventElement).closest('ul').find('li').removeClass('active'); //No I18N
            jQuery(eventElement).closest('li').addClass('active'); //No I18N
        }
        var period = jQuery(".zselectbox__selected").text(); //NO I18N
        if(period.indexOf('-')!=-1) {
            period = " "+translate("sdp.reports.customReportFilter.during").toLowerCase()+period; 
        }
        var filterByDisplay = translate(jQuery("#dd_filter_by option:selected").data('key')).toLowerCase(); //NO I18N
        jQuery("#dd_title").text(data.name+ " "+filterByDisplay+period); //No I18N
    },
    drawChart: function (treeData) {
        var options = this.options;
        this.selectedNode = null;
        jQuery("#" + options.selector).empty();
        this.ddTree = d3.tree().size([options.width, options.height - 10]);
        this.ddHierarchy = function (data) {
            return d3.hierarchy(data, function (d) {
                return d.children;
            })
        }
        d3.select("#" + options.selector)
            .append("svg") //No I18N
            .attr("width", options.width) 
            .attr("height", options.height)
            .attr("class", "dd-svg-body")
            .append("g") //No I18N
            .attr("id", options.selector + "_svg_g")
            .attr("transform", "translate(0 ,"  + options.margin.top + ")");
        this.nodeId = 0;
        this.root = this.ddHierarchy(treeData, function(d){return d.children});
        this.root.x0 = (options.width) / 2;
        this.root.y0 = 0;
        this.root.descendants().forEach((d, i) => {
            d.id = i == 0 ? "0": i;
            d._children = d.children;
            // if (d.depth && d.data.name.length !== 7) d.children = null;
        });
        if(!this.meta_fields) {
            this.meta_fields = this.getMetaInfo();    
        }
        this.root._filters = this.meta_fields;
        this.updateChart(this.root);
        setTimeout(function(){
            initTooltip("#drilldown-body"); //No I18N
        },1000)
    },
    getTreeData:function(){
        return this.root;
    },
    updateChart: function (source, length, loadMore) {
        var opt = this.options, _self = this;
        var treemap = d3.tree().size([opt.width, opt.height - 10]);
        treeData = treemap(_self.root);
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        nodes.forEach(function (d) { d.y = d.depth * 120 });
        
        // ********* Node section *********

        //Update the nodes..
        var svg = d3.select("#" + opt.selector + "_svg_g");

        var oSvg = d3.select("#" + _self.options.selector).select("svg");
        
        if (!loadMore) {
            if(source.depth>2){
                var newHeight = _self.options.height+(source.depth-2)*130
                oSvg.transition().attr("height",newHeight).duration(1000);
            }else
            {
                var newHeight=_self.options.height;
                oSvg.transition().attr("height",newHeight).duration(1000);
               }
        }

        if(source.depth >= 3 &&  source.depth < 6){
            jQuery("#" + _self.options.selector +" text").css("font-size","13px");//No I18N
        }else if(source.depth >= 6 &&  source.depth < 8){
            jQuery("#" + _self.options.selector +" text").css("font-size","12px");//No I18N
        }else if(source.depth>=8){
            jQuery("#" + _self.options.selector +" text").css("font-size","11px");//No I18N
            jQuery("#" + _self.options.selector +" .splitup").css("font-size","10px");//No I18N
        }else{
            jQuery("#" + _self.options.selector +" text").css("font-size","14px");//No I18N
            jQuery("#" + _self.options.selector +" .splitup").css("font-size","11px");//No I18N
        }

        var node = svg.selectAll("g.node") //No I18N
            .data(nodes, function (d) {
                return d.id || (d.id = ++_self.nodeId);
            });
        
        node.exit().remove();
        //Enter the any new modes at the parent's previous position
        var nodeEnter = node.enter().append("g") //No I18N
            .attr("class", "node")
            .attr("id", function (d) { return "nodeId_" + d.id })
            .attr("transform", function (d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            });
        
        // Add Cricle for the Nodes
        nodeEnter.append("circle") //No I18N
            .attr("class", "node")
            .attr("r", 1e-6)
            .style("fill", function (d) { //No I18N
                if (d.data.keytype === "DummyNode") //No I18N
                {
                    return "orange"; //No I18N
                } else {
                    return d.data.color;
                }
            })
            .style("stroke", function (d) { //No I18N
                if (d.keytype === "DummyNode") {
                    return "orange"; //No I18N
                }
                else {
                    return d.data.color;
                }
            })
            .on("click", function (d) {
                if (parseInt(d.data.count) === 0) {
                    return;
                } else {
                    _self.showFilters(d);
                }
            });
        
            
        
        // Add group - labels for the nodes
        var group_node = nodeEnter.append("g"); //No I18N
            // Creating text node
        var sub_node = group_node.append("text") //No I18N
            .attr("id", function (d) {
                return "node_text_" + d.id; //No I18N
            })
            .attr("text-anchor", "middle");
            // Creating tspan
        sub_node.append("tspan") //No I18N
            .attr("class","dd-node-hover")
            .text(function (d) {
                if (d.data.name) {
                    var disname = d.data.name;
                    var txtSize = 14
                    if (disname.length > txtSize && d.depth!=0) {
                        disname = disname.substring(0, txtSize) + "...";
                    }
                    return disname;
                } else {
                    return "-";
                }
            })
            .style("fill-opacity", 1e-6) //No I18N
            .style("fill", "#333") //No I18N
            .attr("title", function (d) { //No I18N
                if (d.keytype === "DummyNode") {
                    return d.data.name;
                } else {
                    return d.data.name + " ( " + d.data.count + " ) ";
                }
            })
            .style("cursor", function (d) { //No I18N
                if (parseInt(d.data.count) === 0 || d.depth === _self.root._filters.length) {
                    return "text"; //No I18N
                } else {
                    return "pointer"; //No I18N
                }
            })
            .on("click", function (d) {
                if (parseInt(d.data.count) === 0) {
                    return null;
                } else {
                    return _self.showFilters(d);
                }
            })
            // show the tooltip when mouse over
            .on("mouseover", function(d){
                var pos = jQuery("#nodeId_" + d.id).position();
                d3.select("body").append("div") //No I18N
                .attr("class", "drill-tooltip")
                .transition()
                .duration(300)
                .style("opacity", 1) //No I18N
                .style("position", "absolute") //No I18N
                .style("top", (d3.event.pageY + 30)+"px") //No I18N
                .style("left", (d3.event.pageX + 40) +"px") //No I18N
                .text(d.data.name);
            })
            // move the tooltip when over around the node text
            .on("mousemove", function(d){
                d3.select("div.drill-tooltip") //No I18N
                .style("top", (d3.event.pageY + 30)+ "px") //No I18N
                .style("left", (d3.event.pageX + 40) +"px"); //No I18N
            })
            // remove the tooltip when mouse out from the node
            .on("mouseout", function() {
                d3.select("div.drill-tooltip").remove(); //No I18N
              });
            ;
            sub_node.append("tspan") //No I18N
            .text(function (d) {
                return " (" + d.data.count + ") ";
            })
            .style("fill-opacity", 1e-6) //No I18N
            .style("fill", "#157199") //No I18N
            .on("click", function (d) {
                if (d.data.keytype === "DummyNode") {
                    return _self.showFilters()
                } else {
                    _self.showRequestListView(d);
                }
            });
    
        
        // ********** Links Section **********
        
        // Update the links
        var link = svg.selectAll("path.link")//No I18N
            .data(links, function (d) {
                return d.id
            });
        
        var linkEnter = link.enter().insert("path", "g")//No I18N
            .attr("class", "link")
            .attr("fill", "none")
            .attr("d", function (d) {
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });
        
        // Update link
        var linkUpdate = linkEnter.merge(link);

        // Transition back to parent element position
        linkUpdate.transition()
            .duration(1000)
            .attr("d", function (d) {
                return diagonal(d, d.parent)
            });
        svg.selectAll("g.node circle").each(function (d) { //No I18N
            if(d.depth === source.depth) {
                if (d.keytype === "DummyNode"){ //No I18N
                    d3.select(this).style("fill", "orange");//No I18N
                    d3.select(this).style("stroke", "orange");//No I18N
                }
                else {
                    d3.select(this).style("fill", "#4C86B7");//No I18N
                   d3.select(this).style("stroke", "#4C86B7");//No I18N
                }
            }
            if (d.depth === _self.root._filters.length)
            {
                d3.select(this).style("fill", "red");//No I18N
                d3.select(this).style("stroke", "red");//No I18N
                return;
            }
            if (d.id === source.id && _self.selectedNode !== null) {
                d3.select(this).style("fill", "#6baa01");//No I18N
                d3.select(this).style("stroke", "#6baa01");//No I18N
            }
        })
            
        // Remove any existing links
        var linkExit = link.exit()
            // .transition()
            // .duration(1000)
            // .attr("d", function (d) {
            //     return diagonal(d, d.parent);
            // })
            .remove();
        
        
        var nodeUpdate = nodeEnter.merge(node);
    
        // Transition to the proper position of nodes
        nodeUpdate.transition()
            .duration(1000)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        
        nodeUpdate.select("circle.node") //No I18N
            .transition().duration(1000)
            .attr("r", 7)
            .attr("fill", function (d) {
                return d._children ? "#69a207" : "#4c86b7"; //No I18N
            })
        nodeUpdate.selectAll("tspan") //No I18N
            .transition().duration(1000)
            .style("fill-opacity", 1); //No I18N
        nodeUpdate.select("g") //No I18N
            .transition().duration(1000)
            .attr("transform", function (d) {
                if (d.children) {
                    return "translate(0, -16)";
                } else {
                    return "translate(0, 22)";
                }
            });
        
        svg.selectAll("path.link").style("stroke", function (d) {//No I18N
            if ((d && d.children) || d.depth === _self.root._filters.length || ( d.parent.children.length===1) ) {
                return  "#6baa01";//No I18N
            } else {
                return "#ccc";//No I18N
            }
        });
            
        
        //Remove the existing node
        var nodeExit = node.exit().transition()
            .duration(1000)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();
        
        // On exit reduce the node circles size to 0
        nodeExit.select("circle") //No I18N
            .attr("r", 1e-6);
    
        nodeExit.select("text") //No I18N
            .style("fill-opacity", 1e-6); //No I18N
        
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        function diagonal(s, d) {
            return "M" + s.x + "," + s.y //No I18N
            + "C" + s.x + "," + (s.y + d.y) / 2 //No I18N
            + " " + d.x + "," +  (s.y + d.y) / 2
            + " " + d.x + "," + d.y;
            
        }
    },
    showChildren: function(group_by) {//No I18N
        var _self = $dd_analysis;
        var svg = d3.select("#" + _self.options.selector + "_svg_g");
        var d = _self.selectedNode;
        var temp = false;
        var treemap = d3.tree().size([_self.options.width, _self.options.height - 10]);
        treeData = treemap(_self.root);
        var nodes = treeData.descendants();
        nodes.forEach(function (dtemp) {
            if (dtemp.id !== d.id && dtemp.depth >= d.depth) {
                dtemp._children = null;
                if (dtemp.children !== null) {
                    svg.select("#splitup_" + dtemp.id).transition(1000 - 300).remove(); //No I18N
                    svg.select("#splitup_bg_" + dtemp.id).transition(1000 - 300).remove(); //No I18N
                    svg.select("#node_text_bg_" + dtemp.id).transition(1000 - 300).remove(); //No I18N
                    dtemp.children = null;
                }
            }
        });
        d.children = null;
        
        if(d.depth !==0 && _self.selectedNode.parent.children.length >(_self.splitup_m_count+1)){
            _self.addMoreNode(_self.selectedNode.parent,_self.splitup_m_count,d);
        }

        var input_data = jQuery.extend(true,{},_self.listInfo);
        input_data.list_info.group_by = [group_by]
        var criteria = []
        _self.constructCriteria(d, criteria);
        if(input_data.list_info.search_criteria) {
            input_data.list_info.search_criteria = input_data.list_info.search_criteria.concat(criteria);
        }
        else {
            input_data.list_info.search_criteria = criteria;
        }
        input_data = sdpAjaxInputData(input_data);
        sdpAjax({
            url: "/api/v3/"+_self.module_options.module, //No I18N
            data: input_data,
            type: "GET", //No I18N
            success: function (resp) {//No I18N
                var data = resp[_self.module_options.module];
                var nodedata = [];
                for (var j = 0; j < data.length; j++){
                    var val = data[j];
                    if (val[group_by] == null) {
                        val[group_by] = { name : translate("sdp.common.notassigned"), id: null };
                    }
                    else if(typeof val[group_by] == "string") {
                        val[group_by] = {name: val[group_by]};
                    }
                    var hierarchy =  {
                        name: val[group_by].name,
                        keyid:val[group_by].id,
                        count: val["id:count"],//No I18N
                        keytype: group_by,
                        criteria: criteria,
                        color: "#0075c2" //No I18N
                    }
                    if(val[group_by].color) {
                        hierarchy.color = val[group_by].color;
                    }
                    var newHer = d3.hierarchy(hierarchy);
                    newHer.depth = d.depth + 1;
                    newHer.height = d.height - 1;
                    newHer.parent = d;
                    newHer.id = ++_self.nodeId;
                    if(!d.children) {
                        d.children = [];
                        d.data.children = [];
                    }
                    d.children.push(newHer);
                    d.data.children.push(newHer.data)
                    nodedata.push(newHer);
                }
                _self.addMoreNode(d,_self.initial_m_count,null)
                _self.updateChart(d,nodedata.length);
                
                var svg = d3.select("#" + _self.options.selector + "_svg_g");

                svg.select("#splitup_" + d.id).remove(); //No I18N
                svg.select("#splitup_bg_" + d.id).remove(); //No I18N
                svg.select("#node_text_bg_" + d.id).remove(); //No I18N

                svg.select("#nodeId_" + d.id).append("text")//No I18N
                        .attr("text-anchor", "middle")//No I18N
                        .attr("id", "splitup_" + d.id)//No I18N
                        .attr("class", "splitup")//No I18N
                        .attr("fill", "#555555")//No I18N
                        .attr("x", "0")//No I18N
                        .attr("y", function (d) {
                            return (d.children && d.children.length > 1) ? 55 : 80;
                        })//No I18N
                        .text(function (d) {
                            var t = "";//No I18N
                            jQuery.each(_self.root._filters, function (ind, val) {
                                if (group_by === val.id) {
                                    t = val.display_name;
                                    return false;
                                }
                            });
                            return  t;
                        })
                        .style("fill-opacity", "0")//No I18N
                        .transition()
                        .duration(1500)
                        .style("fill-opacity", "1");//No I18N

                var SVGRect = jQuery("#splitup_" + d.id)[0].getBBox();
                svg.select("#nodeId_" + d.id).insert("svg:rect", "#splitup_" + d.id)//No I18N
                        .attr("id", "splitup_bg_" + d.id)
                        .attr("x", SVGRect.x)
                        .attr("y", SVGRect.y+3)
                        .attr("width", SVGRect.width )
                        .attr("height", SVGRect.height-4)
                        .attr("fill", "#FFFFFF")
                        .style("fill-opacity", "0")//No I18N
                        .transition()
                        .duration(1500)
                        .style("fill-opacity", "1");//No I18N

                var svgrect2 = jQuery("#node_text_" + d.id)[0].getBBox();
                svg.select("#nodeId_" + d.id).selectAll("g").insert("svg:rect", "#node_text_" + d.id)//No I18N
                        .attr("id", "node_text_bg_" + d.id)
                        .attr("x", svgrect2.x)
                        .attr("y", svgrect2.y + 3)
                        .attr("width", svgrect2.width)
                        .attr("height", svgrect2.height)
                        .attr("fill", "#FFFFFF")
                        .style("fill-opacity", "0")//No I18N
                        .transition()
                        .duration(1500)
                        .style("fill-opacity", "1");//No I18N

                //Updating the URL
                treeData = treemap(_self.root);
                var nodes = treeData.descendants();
                _self.updateDrilldownFieldsURL(nodes);
            }
        });
    },
    addMoreNode: function(d, size, skipnode) {
        var _self = $dd_analysis;
        var nodeArray = d.children;
        var temp = new Array();
        var selectnode = null;
        var morenode = null;
        if(nodeArray.length==size+1) {
            size = size+1;
        }
        if(nodeArray && nodeArray.length >size) {
            if(nodeArray[nodeArray.length-1].data.keyid=="DummyNode") {
                temp=nodeArray[nodeArray.length-1].data.more;
                nodeArray.pop();
            }
            while (nodeArray.length > size) {
                var tnode2 = nodeArray.pop();
                if (tnode2.more)
                {
                    morenode = tnode2;
                    temp = morenode.more;
                }else if (skipnode && tnode2.id === skipnode.id) {
                    selectnode = tnode2;
                    size = size - 1;
                } else {
                    temp.push(tnode2);
                }
            }

            if (selectnode !== null) {
                nodeArray.push(selectnode);
            }
            var hasmorenode=true;
            if (morenode === null) {
                morenode = d3.hierarchy({ "name": translate("sdp.tag.more"), "count": 0, "keytype": "DummyNode", "keyid": "DummyNode" }); //No I18N
                morenode.depth = d.depth + 1;
                morenode.height = d.height - 1;
                morenode.parent = d;
                morenode.id = ++_self.nodeId;
                hasmorenode=false;
            }
            morenode.data.count=0;
            temp.forEach(function (dtemp) {
               morenode.data.count=morenode.data.count+Number(dtemp.data.count); 
            });
            
            if(hasmorenode){
                 jQuery("#node_text_"+morenode.data.id+" tspan")[1].textContent="("+morenode.data.count+")";//No I18N
            }
           
            morenode.data.more = temp;
            nodeArray.push(morenode);
        }
    },
    showhide: function(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }else{
            d.children = d._children;
            d._children = null;
        }
        _update(d);
    },

    groupByChange: function (group_by) {
        var _self = this;
        _self.listInfo.list_info.group_by = [];
        _self.listInfo.list_info.group_by.push(group_by);
        var input_data = sdpAjaxInputData(_self.listInfo);
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/"+_self.module_options.module, //No I18N
            data: input_data,
            success: function (resp) {
                // _self.groupBy.push(group_by);
                _self.processRespData(resp, true);
            }
        })
    },
    showFilters: function (node) {
        /**
         * Node depth greater than 8 is not possible.
         * Request api search criteria's maximum array size limit will be exceeded
         * */
        if(node.depth >= 8) {
            showalert('failure', translate('common.hierarchy.limitexceeded'),'isAutoHide=true,delay=3'); //No I18N
            return;
        }
        
        var _self = this;
        _self.selectedNode = node;
        var header = e_html(_self.selectedNode.data.name); 
        var search = '<div class="mt-6 p10 pagebg">'+
                        '<div class="search-box">'+
                            '<span class="cspr icon-sm ml-1 mt-2 opac5 pl0 search1"></span> '+
                            '<span class="sdp-glyph sdp-glyph-failure inputclear-icon pos-abs top5 mt3 right10" title="'+translate("admin.search.clear")+'" style="display: none;"></span> '+
                            '<input type="text" class="form-control pl30" autofocus="" autocomplete="off" data-sdp-action="menu-search" aria-label="'+translate("common.search.title")+'" id="search-input">'+
                            '</div>'+
                    '</div>';
        var list_items = "<div id='list_wrapper' class='open' style='box-shadow:0 6px 12px rgba(0,0,0,0.175);'><div class='dd-list-header new-dialog text-overflow' rel='uitooltip-track-table' title='"+header+"'><span class='pointer'></span><strong>" + header + "</strong></div><ul class='sdmenu-dd m0 pb0 drill-list' id='list_cont'><li class='search-box ui-component-li'>"+search+"<ul class='pl0' style='max-height:30vh;overflow-y:auto;border: 0px;'>";
        if (node.data.keytype === "DummyNode") {
            var index = 0;
            node.data.more = node.data.more.sort(function (a, b) {
                return b.count - a.count;
            })
            jQuery.each(node.data.more, function (i, val) {
                var dispName = val.data.name.length > 20 ? val.data.name.substring(0, 20)+"..." : val.data.name;
                        var dispNameTitle = val.data.name.length > 20 ? val.data.name : '';
                list_items += "<li class='disp-t fw' data-swaptree='" + index + "' data-id=" + val.id + " data-keyid="+val.data.keyid+" ><a rel='uitip' href='/' title='"+e_attr(dispNameTitle)+"'>" + e_html(dispName) + " ( " + val.data.count + " ) </a></li>";
                index++;
            });
        } else {
            var new_arr = _self.getshownFilters(_self.selectedNode);
            jQuery.each(_self.root._filters, function (i, val) {
                if (new_arr.indexOf(val.id) == -1) {
                    list_items += "<li class='disp-t fw' data-id=" + val.id + "><a href='/'>" + e_html(val.display_name) + "</a></li>";
                }
            });
        }
        list_items += "</ul></ul></div>";
        jQuery("#fields_popup").addClass("open").html(list_items);
        setTimeout(() => {
            jQuery("#list_wrapper").show();
        }, 200);
        var pos = jQuery("#nodeId_" + _self.selectedNode.id).position();
        pos.top = pos.top + 45;
        pos.left = pos.left - 76;

        jQuery("#fields_popup").offset(pos);
        jQuery('[data-sdp-action="menu-search"]').menuSearch({parent:"#list_cont", error_message:"<div class='noitem m5 mt0 p5 greybgf2 hide'>"+translate("common.no.match.found")+"</div>"}); //No I18N
        setTimeout(function(){
            jQuery('[data-sdp-action="menu-search"]').focus()
        },500)
        initTooltip("#list_cont"); //No I18N
        initTooltip("#fields_popup"); //No I18N
    },
    swapMoreNode: function (index) {
        var _self = this;
        var k = _self.selectedNode.parent.children.length;
        k = k - 2;
        var tempnode = _self.selectedNode.parent.children[k];
        var tempnode2 = _self.selectedNode.data.more[index];
        if(tempnode.children){
            var a =_self.selectedNode.parent.children[k-1];
            _self.selectedNode.parent.children[k-1]=tempnode;
            tempnode=a;
        }
        
        _self.selectedNode.parent.children[k] = tempnode2;
        _self.selectedNode.data.more[index] = tempnode;
        _self.selectedNode.data.count=0;
        _self.selectedNode.data.more.forEach(function (dtemp) {
            _self.selectedNode.data.count=_self.selectedNode.data.count+Number(dtemp.data.count); 
        });
        jQuery("#node_text_"+_self.selectedNode.id+" tspan")[1].textContent="("+_self.selectedNode.data.count+")";//No I18N
        _self.updateChart(_self.selectedNode.parent,_self.selectedNode.parent.children.length,"yes");//No I18n

    },
    getDateCriteria: function (filter_by, period, duration) {
        var values,condition;
        if(period=='SPECIFIC_DATE' || period=='CUSTOM_RANGE') {
            condition = "between"; //No I18N
            values = duration;
        } 
        else {
            values = ["$(" + period + ")"];
            condition = "is"; //No I18N
        }
        var searchCriteria = {
            field: filter_by,
            condition: condition,
            values:  values,
            logical_operator: "and" //No I18N
        }
        return searchCriteria;
    },
    toogleCPopup: function (event) {
        var isCriteriaVisible = jQuery("#dd_dropdown").hasClass("show"); //No i18n
        if(isCriteriaVisible) {
            var calendarOptions={type: 'dateselect', custom_options: {options_meta : {}}};  //No I18N
            if($dd_analysis.duration) {
                var startTime = parseInt($dd_analysis.duration.startTime);
                var endTime = parseInt($dd_analysis.duration.endTime);
                calendarOptions.calendar_options = {fromValue: new Date(startTime),toValue: new Date(endTime)};
            }
            calendarOptions.custom_options.options_meta[$dd_analysis.period] = {"selected" :true}; //No I18N
            jQuery("#calendarPlaceholder").ZSDPCalendar(calendarOptions);
            jQuery("#dd_filter_by").select2("val", $dd_analysis.filter_by); //NO I18N
        } else {
            $dd_analysis.filter_by = jQuery("#dd_filter_by").val();
            $dd_analysis.period = jQuery("#calendarPlaceholder_options").val();

            if($dd_analysis.period === 'SPECIFIC_DATE' || $dd_analysis.period ==='CUSTOM_RANGE') {
                var dateObj = jQuery('#calendarPlaceholder').ZSDPCalendar("getComponentDateObject"); //NO I18N
                var duration = [dateObj.from.fromValue.getTime(), dateObj.to.toValue.getTime()+86400000-1]; //+86400000 is one day milli seconds to get end time of the day.
                $dd_analysis.duration = {startTime: duration[0], endTime: duration[1]};
            } else {
                $dd_analysis.duration = undefined;
            }
        }
        jQuery("#dd_dropdown").toggleClass("show hide"); //No i18n
    },
    getMetaInfo: function() {
        var _self = this;
        var fields = [];
        sdpAjax({
            url: "/api/v3/"+_self.module_options.module+"/metainfo", //No i18n
            type: "GET", //No i18n
            async: false,
            success: function (data) {
                jQuery.each(data.metainfo.fields, function (index, val) {
                    if (val.display_name !== undefined && !val.read_only && _self.module_options.excluded_fields.indexOf(index) == -1) {
                        val.id = index;
                        fields.push(val);
                    }else if(val.display_name !== undefined && _self.module_options.included_fields.indexOf(index) !== -1){
                        val.id = index;
                        fields.push(val);
                    }
                });
            }
        });
        if(fields.length > 0){
            fields.sort(function(a,b) {
                var x = a.id;
                var y = b.id;
                return x < y ? -1 : x > y ? 1 : 0;
            });
        }
        return fields;
    },
    showRequestListView:function(d){
        var _self = this;
        var input_data = jQuery.extend(true, {},_self.listInfo);
        var criteria = [];
        _self.constructCriteria(d, criteria);
        if(criteria.length > 0 && input_data.list_info.search_criteria) {
            input_data.list_info.search_criteria = input_data.list_info.search_criteria.concat(criteria);
        }
        input_data.list_info.filter_by = {"name": sdp_user.USERTYPE=="Requester"?"All_Requester":"All_Requests"}; //NO I18N
        
        if(getSDPURLParams().externalframe=='true') {
            var url = "/WOListView.do?input_data="+ encodeURI(sdpToJSON(input_data)) +"&viewMode=table"; //NO I18N
            window.open(url);
        }
        else {
            var title = _self.module_options.module_i18n, subtitle = "";
            subtitle = _self.constructListViewSubtitle(d, title);
            if(subtitle){
                title = title + " >> " + subtitle; 
            }

            var listViewUrl = '/ui/load_list?module='+_self.module_options.module; //No i18n
            if(_self.module_options.entity) {
                listViewUrl += '&entity='+_self.module_options.entity; //No i18n
            }
            listview_popup.render(listViewUrl+'&from=report&'+sdpAjaxInputData(input_data), title);
        }
    },
    constructListViewSubtitle: function (node, title) {
        var _self = this;
        var subtitle = "";
        if (node.parent != undefined) {
            subtitle = _self.constructListViewSubtitle(node.parent, title);
        }

        if (_self.module_options.module != node.data.keytype) {
            subtitle = subtitle ? subtitle + " >> " : subtitle;
            subtitle = subtitle + _self.getDisplayName(node.data.keytype) + " : " + node.data.name;
        }

        return subtitle;
    },
    getDisplayName: function (keyType) {
        var _self = this;
        for (var info of _self.meta_fields) {
            if (keyType === info.id) {
                return info.display_name;
            }
        }
        return "";
    },
    constructCriteria:function(node, criteria) {
        var _self = this;
        if (node.parent) {
            this.constructCriteria(node.parent, criteria);
        }
        if (node.data.keytype !== _self.module_options.module) {
            var field = node.data.keytype + ".id"; //No I18N
            var value = node.data.keyid;
            if(node.data.keyid === undefined) {
                field = node.data.keytype;
                value = node.data.name;
            }
            else if(node.data.keyid === null) {
                field = node.data.keytype;
            }
            var newCriteria = {
                field: field,
                condition: "is", //No I18N
                value: value,
                logical_operator: "and" //No I18N
            }
            criteria.push(newCriteria);
        }
    },
    getshownFilters:function (node) {
        var temp = new Array();
        temp.push(node.data.keytype);
        var tempnode = node;
        while (tempnode.parent) {
            temp.push(tempnode.parent.data.keytype);
            tempnode = tempnode.parent;
        }
        return temp;
    },
    validateDate:function(id){
        var fromDate = jQuery("#dd_from_date").val();
        var toDate = jQuery("#dd_to_date").val();
        fromDate = Number(fromDate);
        toDate = Number(toDate);
        if(id === "dd_from_date" && toDate != NaN && toDate !=0 && fromDate > toDate){
            showalert('failure', translate("startdate.lessthan.enddate"),'isAutoHide=true,delay=3'); //No I18N
            return false
        }else{
            if(toDate != NaN && toDate !=0 && toDate < fromDate){
                showalert('failure', translate("sdp.admin.survey.alert.enddategreater"),'isAutoHide=true,delay=3'); //No I18N
                return false
            }
        }
    },
    //URL Handling
    updateFiltersURL: function(newParams, isReset) {
        if(this.isLoading && location.search.length!=0) {
            return;
        }
        if(!this.isLoading && isReset) {
            ClientUtil.addUserPersonalization("DrillDown_ChangeFilter", newParams); //No I18N
        }
        if(!drillDownFromWidget) {
            var extParams = {};
            if(window.location.href.indexOf("?")!=-1) {
                if(!isReset) {
                    extParams = window.location.href.toQueryParams();
                }
            }
            for(var param in newParams) {
                extParams[param] = newParams[param];
            }
            var newURL = this.module_options.url+"?"+jQuery.param(extParams); //No I18N
            history.replaceState({}, null, newURL);
        }
    },
    updateDrilldownFieldsURL: function(nodes) {
         if(this.isLastNode) {
            this.isLoading = false;
            this.isLastNode = false;
            return;
        }
        else if(this.isLoading || (!drillDownFromWidget && window.location.pathname!=this.module_options.url)) {
            return;
        }
        var fields = {}, values=[], previousKeytype="";
        for(var node of nodes) { 
            if(node.data.keyid!='DummyNode') {
                fields[node.data.keytype]=true;
                if(node.parent && node.data.keytype!=previousKeytype) {
                    var keyId = node.parent.data.keyid==null? -1 : node.parent.data.keyid;
                    if(node.parent.data.keyid===undefined) {
                        keyId = node.parent.data.name;
                    }
                    values.push(keyId);
                    previousKeytype = node.data.keytype;
                }
            }
        }
        var params = {
            fields: Object.keys(fields).toString(),
            values: values.toString()
        }
        this.updateFiltersURL(params, false);
    },
    loadValues: function() {
        _self = this;
        var isChartEmpty = true;
        var params = this.module_options.queryParams;

        var calendarOptions={type: 'dateselect'};  //No I18N
        if(params.filter_by) {
            _self.isLoading = true;
            if(params.startTime && params.endTime) {
                var startTime = parseInt(params.startTime);
                var endTime = parseInt(params.endTime);
                calendarOptions.calendar_options = {fromValue: new Date(startTime),toValue: new Date(endTime)};
            }
            calendarOptions.custom_options = {options_meta : {}};
            calendarOptions.custom_options.options_meta[params.period] = {"selected" :true};
            
            jQuery("#dd_filter_by").select2("val", params.filter_by); //NO I18N
            jQuery("#calendarPlaceholder").ZSDPCalendar(calendarOptions);
            jQuery("#dd_apply").click();
            isChartEmpty = false;
        }
        else {
            jQuery("#calendarPlaceholder").ZSDPCalendar(calendarOptions);
        }

        if(params.subFilter) {
            jQuery("#dd_summary li").removeClass("active");
            jQuery("#"+params.subFilter).parent().addClass("active");
            jQuery("#"+params.subFilter).click();
        }

        if(params.fields) {
            jQuery("#fields_popup").addClass("hide");
            var fields = params.fields.split(',');
            var values = [];
            if(params.values) {
                values = params.values.split(',');
            }
            function clickNode(index) {
                if(fields[index] && values[index]) {
                    setTimeout(function() {
                        var treemap = d3.tree().size([_self.options.width, _self.options.height - 10]);
                        treeData = treemap(_self.root);
                        var nodes = treeData.descendants().reverse();
                        
                        var fieldValue = values[index]==-1? null : values[index];
                        var isName = isNaN(parseInt(values[index]));
                        var isVisible = false;
                        for(var node of nodes) { 
                            if((node.data.keyid!==undefined && node.data.keyid==fieldValue) || (isName && node.data.name==fieldValue)) {
                                jQuery("#node_text_"+node.id+" tspan:first").d3Click();
                                setTimeout(function() {
                                    jQuery("#fields_popup li[data-id="+fields[index+1]+"]").click();
                                    clickNode(index+1);
                                },200);
                                isVisible=true;
                                break;
                            }
                        }
                        //Click More
                        if(!isVisible) {
                            isVisible = true;
                            for(var node of nodes) { 
                                if(node.data.keyid=="DummyNode") {
                                    jQuery("#node_text_"+node.id+" tspan:first").d3Click();
                                    setTimeout(function() {
                                        jQuery("#fields_popup li[data-keyid="+fieldValue+"]").click();
                                        clickNode(index);
                                    },200);
                                    break;
                                }
                            }
                        }
                    }, 1000);
                }
                else {
                    _self.isLastNode = true;
                    jQuery("#fields_popup").removeClass("hide");
                }
            }
            clickNode(0);
            isChartEmpty = false;
        }
        else {
            _self.isLoading = false;
            jQuery("#fields_popup").removeClass("hide");
            jQuery("#homeContent .gridsterul > .noitem").remove();
        }
        
        if(isChartEmpty && Object.keys(_self.module_options.filter_by).length>0) {
            jQuery("#dd_dropdown").removeClass("hide");
        }
    },
}