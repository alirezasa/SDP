//$Id$

/* This file contains source for d3 map */

var view = (function() {
	var initializeView = function (baseCIName) {
		if(attributes.assetDetailsTab || attributes.iframe) {
	        jQuery(".svgbdy").css("padding-top", 0); //no i18n
	    }
		if(attributes.iframe) {
			jQuery('#zoom-slider').css("height", "80px"); //no i18n
		}
		if(attributes.assetDetailsTab) {
	    	jQuery("body").removeClass("svgbdy")
	    }
		if(attributes.adminDetailsTab){
			jQuery("body").css("overflow", "auto");    //NO I18N
		}
	    if(attributes.editable != undefined && attributes.editable == false) {
	    	jQuery("#save").remove();
	    }
	    if(!attributes.viewId) {
	    	jQuery("#saved-view-header").hide();
	    	if(!attributes.newView) {
	    		jQuery("#ciNameLabel").text(baseCIName);
	    		jQuery("#savethisviewLabel").remove();
	    		if(sdp_user.ROLES.contains("ViewCI")){
                    jQuery("#saveviewbtn").text(getMessageForKey("ae.cmdb.businessview.save.title")); //no i18n
                }
                else{
                    jQuery("#saveviewbtn").remove();
                }
	    	}
	    }
	    else {
            jQuery("#ciNameLabel").remove(); // set ci name in ui
	    	jQuery("#new-view-header").remove();
	    	jQuery("#saved-view-header").show();
	   	}
	}

	var showProgressIndicator = function() {
		invokeProgressIndicator(null, 'sdp.common.loading', 'progress', null, false, 200, 200); // no i18n
	}

	var removeProgressIndicator = function () {
        jQuery('[id^=_DIALOG_LAYER]').remove();
	}

    return {
        initializeView: initializeView,
        showProgressIndicator: showProgressIndicator,
        removeProgressIndicator: removeProgressIndicator
    };
})();

var header = (function() {
    var buildViewDropdown = function (data, currentViewId) {
        var dropdown = jQuery("#viewsDropDown");
        dropdown.empty();
        if(data.length != 0) {
            jQuery.each(data, function() {
                var viewNameDecoded = this.name;
                if(viewNameDecoded.length > 25) {//rel tooltip not required for these element
                    dropdown.append(jQuery("<option />").attr({"title": viewNameDecoded, "data-ciid": this.baseCIID}).val(this.viewId).text(viewNameDecoded.substring(0,25) + "..."));
                }
                else {
                    dropdown.append(jQuery("<option />").attr("data-ciid", this.baseCIID).val(this.viewId).text(viewNameDecoded));
                }
            });
            if(currentViewId != null) {
                dropdown.val(currentViewId)
            }
            else {
                dropdown.val(-1);
            }
            dropdown.css('display', 'inline-block') //no i18n
        }
        else {
            dropdown.css("display", "none"); // no i18n
        }
        initTooltip("#saved-view-header"); //NO I18N
    }

    var changeView = function (c) {
        var viewId = jQuery(c).val();
        var baseCIID = jQuery(c).find(":selected").data("ciid"); //no i18n
        var pathname = window.location.pathname;
        if(pathname.startsWith("/")){      // to remove '/' from the pathname. (Eg. pathname = '/RelationshipMapD3.do')
            pathname = pathname.substring(1);
        }
        var protocol = window.location.protocol;
        if(protocol.endsWith(":")){  //to remove ':' from protocol. (Eg. protocol = 'https:')
            protocol = protocol.substring(0, protocol.length - 1);
        }
        var port = window.location.port;
        if(viewId != -1) {
            if(port != null && port != ''){
                window.location = encodeURIComponent(protocol) + "://" + encodeURIComponent(window.location.hostname) + ":" + encodeURIComponent(port)  + "/" + encodeURIComponent(pathname) + "?operation=showRelD3&viewId=" + encodeURIComponent(viewId) + "&ciId=" + encodeURIComponent(baseCIID);
                //Eg. window.location = encodeURIComponent(https) + "://" + encodeURIComponent(localhost) + ":" + encodeURIComponent(8089) + "/" + encodeURIComponent(RelationshipMapD3.do) + "?operation=showRelD3&viewId=" + encodeURIComponent(304) + "&ciId=" + encodeURIComponent(1019)
                //URL : "https://localhost:8089/RelationshipMapD3.do?operation=showRelD3&viewId=304&ciId=1019"
            }
            else {
                window.location = encodeURIComponent(protocol) + "://" + encodeURIComponent(window.location.host) + "/" + encodeURIComponent(pathname) + "?operation=showRelD3&viewId=" + encodeURIComponent(viewId) + "&ciId=" + encodeURIComponent(baseCIID);
                //Eg. window.location = encodeURIComponent(https) + "://" + encodeURIComponent(demo.servicedeskplus.com) + "/" + encodeURIComponent(RelationshipMapD3.do) + "?operation=showRelD3&viewId=" + encodeURIComponent(1) + "&ciId=" + encodeURIComponent(1806)
                //URL : https://demo.servicedeskplus.com/RelationshipMapD3.do?operation=showRelD3&viewId=1&ciId=1806
            }
        }
        else {
            if(port != null && port != ''){
                window.location = encodeURIComponent(protocol) + "://" + encodeURIComponent(window.location.hostname) + ":" + encodeURIComponent(port) + "/" + encodeURIComponent(pathname) + "?operation=showRelD3&ciId=" + encodeURIComponent(attributes.ciId);
            }
            else{
                window.location = encodeURIComponent(protocol) + "://" + encodeURIComponent(window.location.host) + "/" + encodeURIComponent(pathname) + "?operation=showRelD3&ciId=" + encodeURIComponent(attributes.ciId);
            }
        }
    }

    var switchHeaderState = function() {
    	if(attributes.viewId) {
    		jQuery('#saved-view-header').show();
    		jQuery('#new-view-header').hide();
    	}
    }

	return {
		buildViewDropdown: buildViewDropdown,
        changeView: changeView,
        switchHeaderState: switchHeaderState
	};
})();

var exportUtil = (function() {

    function process(element) {
        var clone = element.cloneNode(true);
        var ct = jQuery(clone);
        // remove unnecessary elements
        ct.find(".no-child").remove();
        ct.find(".no-noti").remove();
        ct.find(".plus-group").remove();
        // toggle text nodes
        ct.find(".label-text").addClass("active-text");
        return getDataUri(element, clone);
	}

    function getDataUri(element, clone) {
        var outer = document.createElement("div");
        var dimensions = getDimensions(element);
        if(clone.getAttribute("transform") != undefined) {
        	clone.setAttribute("transform", clone.getAttribute("transform").replace(/translate\(.*?\)/, "translate(" + dimensions.tx + ", " + dimensions.ty + ")"));
        }
        var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");// no i18n
        svg.appendChild(clone);
        clone = svg;

        //set namespaces and dimension attributes
        clone.setAttribute("version", "1.1");
        clone.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg"); // no i18n
        clone.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink"); // no i18n
        clone.setAttribute("width", dimensions.width * 2);
        clone.setAttribute("height", dimensions.height * 2);
        clone.setAttribute("viewBox", [0, 0, dimensions.width, dimensions.height].join(" "));

        outer.appendChild(clone);

        var doctype = "<?xml version='1.0' standalone='no'?><!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>"; // no i18n
        var xmlString = doctype + outer.innerHTML;
        var uri = window.btoa(unescape(encodeURIComponent(xmlString)));
        return {uri: uri, width: dimensions.width, height: dimensions.height};
    }

    function getDimensions(element) {
        // find width and height
	    var width, height;
	    var box = element.getBBox();
        var tx = 0, ty = 0;

        if(box.x < 0) {
            tx = -box.x + 10;
        }

        if(box.y < 0) {
            ty = -box.y + 60;
        }

        width = box.x + box.width + tx;
        height = box.y + box.height + ty + 50;

        return {width: width, height: height, tx: tx, ty: ty};
    }

    function setExportForm(data) {
        jQuery('#datauri').val(data.uri);
        jQuery('#imageWidth').val(data.width);
        jQuery('#imageHeight').val(data.height);
        jQuery('#exportType').val(data.fileType);
        jQuery('#exportFileName').val(data.fileName);
        jQuery('#exportCIId').val(data.ciId);
    }

	var exportMap = function(element, fileName, ciId, fileType) {
        var data = process(element);
        data.fileName = fileName;
        data.ciId = ciId;
        data.fileType = fileType;
        setExportForm(data);
	    jQuery('#exportForm').trigger('submit');
	}

	return {
		exportMap: exportMap
	};
})();

var map = (function() {
    var mapData = (function() {
        var nodeId = 0;
        var linkId = 0;
        var data = {nodes: [], links: []};
        var ciMap = {};
        var linkMap = {};
        var baseCI;

        var getData = function(allData) {
            //jQuery.grep is much faster than native Array.filter because of the overheads with .filter
            function filterCollapsedData(d) {
                return d.visible;
            }

            if(allData) {
                return data;
            }
            else {
                return {
                    nodes: jQuery.grep(data.nodes, filterCollapsedData),
                    links: jQuery.grep(data.links, filterCollapsedData)
                };
            }
        }

        var setData = function(mapdata) {
        	mapdata.links.forEach(function(d) {
                //add links only if they don't already exist
                if(linkMap[d.source + "+" + d.target] == undefined) {
                    if(d.id == undefined) {
                    	d.id = linkId++;
                    }
                    d.visible = true;
                    //if target in the link already exist in the map, this is a reference link. This is used when two links point to a same node if one of the link collapses, node shouldn't collapse.
                    if(ciMap[d.target] != undefined) {
                    	d.isReference = true;
                    }
                    linkMap[d.source + "+" + d.target] = true;
                    data.links.push(d);
                }
            });
        	mapdata.nodes.forEach(function(d) {
                if(ciMap[d.CIID] == undefined) {
                    if(d.id == undefined) {
                    	d.id = nodeId++;
                    }
                    d.visible = true;
                    ciMap[d.CIID] = data.nodes.length;
                    data.nodes.push(d);
                }
            });
        }

        var getBaseCI = function() {
            return baseCI;
        }

        var setBaseCI = function(baseCIData) {
            baseCI = baseCIData;
        }

        return {
            getData: getData,
            setData: setData,
            getBaseCI: getBaseCI,
            setBaseCI: setBaseCI,
            ciMap: ciMap
        }
    })();

    var zoom = (function() {
        var zoomIdentity = d3.zoomIdentity;
        var previousZoom;
        var slider;
        var zoomElement;

        var zoomer = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed);

        function zoomed() {
            if(slider != undefined) {
                //Always make sure that svg transform value, d3 internal zoom value and slider value are synced
                slider.slider('value', d3.event.transform.k); // no i18n
            }
            d3.select('#rootG').attr('transform', d3.event.transform.toString()); //no i18n
        }

        var enableZoom = function(element, sliderElement) {
            zoomElement = element;
            //set zoom and disabling zoom on double click
            zoomElement.call(zoomer).on('dblclick.zoom', null); // no i18n

            if(sliderElement != undefined) {
                slider = jQuery(sliderElement).slider({
                    orientation: 'vertical', // no i18n
                    min: 0.5,
                    max: 2,
                    value: 1,
                    step: 0.1,
                    slide: function(event, ui){
                        zoomer.scaleTo(zoomElement, ui.value);
                    }
                });
            }
            else {
            	jQuery(sliderElement).remove();
            }
        }

        var setZoom = function (transform) {
   			if(transform.k && transform.x && transform.y) {
   				zoomElement.call(zoomer.transform, d3.zoomTransform(this).translate(transform.x, transform.y).scale(transform.k));
   			}
   			else if(transform.x && transform.y && !transform.k) {
   				zoomElement.call(zoomer.transform, d3.zoomTransform(this).translate(transform.x, transform.y));
   			}
   			else if(transform.k && !transform.x) {
   				//maintain consistency between mouse zoom, slider and zoom btn
   				zoomer.scaleTo(zoomElement, transform.k)
   			}
        }

        var resetZoom = function() {
            previousZoom = d3.zoomTransform(zoomElement.node());
            setZoom(zoomIdentity);
        }

        var revertReset = function() {
            setZoom(previousZoom);
        }

        var getCurrentZoom = function() {
            return d3.zoomTransform(zoomElement);
        }

        var zoomBtnHandler = function(btn) {
            var inc = (btn=="zoom-in")? 0.1 : -0.1; // no i18n
            slider.slider("value", slider.slider("value") + inc); // no i18n
            setZoom({k: slider.slider("value")}); //no i18n
        }

        return {
            enable: enableZoom,
            getCurrentZoom: getCurrentZoom,
            set: setZoom,
            reset: resetZoom,
            revertReset: revertReset,
            zoomBtnHandler: zoomBtnHandler
        }
    })();

    // Important. Do not touch this code unless you have full understanding of d3 force layout and it's parameters and read through their documentation.
    var renderer = (function() {
        var force;
        var svg;
        var width;
        var height;
        var node;
        var link;
        var nodesDOM = {};
        var noOfTicks = 0;

        var initialize = function (baseCI) {
            // to measure correct width & height
            if(attributes.assetDetailsTab) {
              width = jQuery("#Right-Section").width();
              if(attributes.adminDetailsTab){
            	  width = jQuery("#svgmapdiv").width();
              }
              height = 500;
            }
            else {
              width = jQuery(window).width();
              height = jQuery(window).height();
            }

            //init force layout.
            force = d3.forceSimulation()
                        .force("charge", d3.forceManyBody().strength(-500)) //no i18n
                        .force("link", d3.forceLink().distance(200).id(function(d) { return d.CIID;}) ) //no i18n
                        //.force("collide", d3.forceCollide(40).strength(0.3)) //no i18n
                        .on("tick", tick); //no i18n

            //root svg
            svg = d3.select("div#svg-div") //no i18n
                    .append("svg") //no i18n
                    .attr("id", "rootSVG") // No i18n
                    .attr("width", width) // No i18n
                    .attr("height", height)// No i18n

           	zoom.enable(svg, '#zoom-slider');//no i18n

            svg = svg.append("g")//no i18n
            		.attr("id", "rootG")// No i18n
            appendMarker();

            link = svg.selectAll(".link");//no i18n
            node = svg.selectAll(".node");//no i18n


            update();
            //Centering root node on startup
            if(baseCI.fx == undefined && baseCI.fy == undefined) {
                baseCI.fx = width / 4;
                baseCI.fy = height / 2;
                mapData.setBaseCI(baseCI);
            }

            var scale = attributes.fromDashboard?0.8:1;
            var cx = width / 4 - baseCI.fx * scale;
            var cy = height / 2 - baseCI.fy * scale;
            zoom.set({k: scale, x: cx, y: cy});

            // Resize SVG
            jQuery(window).on('resize', function(){
            	if(!attributes.assetDetailsTab) {
                	jQuery('#rootSVG').attr({'width': window.outerWidth-30, 'height': window.outerHeight-150});
            	}
            });
        }

        var getProperties = function() {
        	return {
        		force: force,
        		width: width,
        		height: height
        	};
        }

        function appendMarker() {
            // Arrows
            svg.append("defs").append("marker")//no i18n
                .attr("id", "arrowhead")// No i18n
                .attr("refY", 3)// No i18n
                .attr("markerUnits", "userSpaceOnUse")// No i18n
                .attr("markerWidth", 120)// No i18n
                .attr("markerHeight", 80)// No i18n
                .attr("orient", "auto")// No i18n
                .append("path").attr("d", "M 0,0 V 7 L 7,3 ");//no i18n

            svg.append("defs").append("marker")//no i18n
                .attr("id", "arrowhead2")// No i18n
                .attr("refY", 3)// No i18n
                .attr("markerUnits", "userSpaceOnUse")// No i18n
                .attr("markerWidth", 120)// No i18n
                .attr("markerHeight", 80)// No i18n
                .attr("orient", "auto")// No i18n
                .append("path").attr("d", "M 7,0 V 7 L 0,3 Z");//no i18n
        }

        var update = function () {
            var nodes, links;

            var data = mapData.getData();
            nodes = data.nodes;
            links = data.links;

            force.nodes(nodes);
            force.force("link").links(links)// no i18n

            // Update links. if id is not given as key, links may have duplicate ids causing problems
            link = link.data(links, function(d) { return d.id;});
            link.exit().remove();

            var linkEnter = link.enter().insert("path", ".node")//no i18n
                                .attr("class", "link")  // No i18n
                                .attr("id", function(d) { return "link" + d.id; })// No i18n
                                .attr("stroke", "black")  // No i18n
                                .attr("stroke-width", "1")  // No i18n
                                .on("mouseout", this.nodeMouseout)//no i18n

            //enter will have only new elements, need to merge that with old nodes.
            link = linkEnter.merge(link)

            // Update nodes.
            node = node.data(nodes, function(d) { return d.id; });

            node.exit().remove();

            node.attr("class", function(d) {
                var cl = "node"; //no i18n
                if(d.hasChildren && (d.expanded == undefined || (d.expanded != undefined && d.expanded == false)))  {
                	cl += " closed";  //no i18n
                }
                return cl;
            })

            var nodeEnter = node.enter().append("g")//no i18n
                                .attr("class", function(d) {
                                    var cl = "node"; //no i18n
                                    if(d.hasChildren && (d.expanded == undefined || (d.expanded != undefined && d.expanded == false))) {
                                    	cl += " closed"; //no i18n
                                    }
                                    if(d.cidata.canview == "false") {
                                    	cl += " inactive"; //no i18n
                                    }
                                    return cl;
                                })
                                .attr("id", function(d) { return "node" + d.id})// No i18n
                                .on("mouseover", nodeMouseover)// no i18n
                                .on("mouseout", nodeMouseout)// no i18n
                                .call(d3.drag()
                                    .clickDistance(5)
                                    .on("start", dragstarted)// no i18n
                                    .on("drag", dragged)// no i18n
                                    .on("end", dragended));// no i18n

            function dragstarted(d){
                //If alphaTarget is not given, drag won't be visible.
                if (!d3.event.active) {
                	force.alphaTarget(0.3).restart();
                }
            }

            function dragged(d){
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d){
                //This check is done to hide that "save this view as" message in header
                force.alphaTarget(0)
            }

            //Caching selections for performance.
            nodeEnter.call(cacheDOM)

            //node icon
            nodeEnter.append("image")//no i18n
                .attr("xlink:href", function(d) { return window.location.protocol + "//"+ window.location.host + d.cidata.imageIcon; }) // No i18n
                .attr("height", 42)// No i18n
                .attr("width", 42)// No i18n
                .attr("x", function(d) {   // No i18n
                	d.textLength = (d.name.length>=20)?20:d.name.length;
                	return d.textLength*2.5; });

            // Node text group
            nodeEnter.append("rect")// no i18n
                .attr("height", 24)// No i18n
                .attr("transform", "translate(-7, 42)")// No i18n
                .attr("id", function(d) { return "border" + d.id })// No i18n
                .attr("class", function(d){ return d.hasChildren? "has-child": "has-no-child" })// No i18n
                .attr("stroke", "#d3d3d3")// No i18n
                .attr("fill", "rgb(247, 247, 247)")  //no i18n
                .on("click", controller.viewCIDetails)// no i18n

            nodeEnter.append("text")//no i18n
            	.attr("id", function(d) { return "cilabeltext" + d.id })// No i18n
                .attr("dx", function(d) { return d.hasChildren ? 2 : 13; })// No i18n
                .attr("dy", 58)// No i18n
                .text(function(d) { return d.name.length >= 20?(d.name.substring(0, 20) + "..."):d.name;}) // No i18n
                .on("click", controller.viewCIDetails)// no i18n

            // dependency icon
            nodeEnter.call(function(nd) {
                var nodeElements = nd.nodes();

                //for loop faster than .each(). Also enclose this in setTimeout with <5ms interval to prevent browser freezes.
                for(var nc = 0; nc < nodeElements.length; nc++) {
                    var nodeElement = d3.select(nodeElements[nc]);
                    var nodeData = d3.select(nodeElements[nc]).datum();

                    var textWidth = 0;
                    if(nodeData.textWidth == undefined) {
                        textWidth = d3.select("#node" + nodeData.id + " text").node().getBBox().width; //no i18n
                        nodeData.textWidth = textWidth;
                    }
                    else {
                        textWidth = nodeData.textWidth;
                    }

                    d3.select("#border" + nodeData.id).attr("width", textWidth+44); //no i18n

                    if(nodeData.hasChildren) {
                        var dep = nodeElement.append("g")//no i18n
                            .attr("class",function(d){ return d.hasChildren?"node-dep":"node-dep no-child";})
                            .attr("transform", function(d) { return "translate(" + (textWidth + 12) + ", " + 42 + ")"; })
                            .on("click", controller.click); //no i18n

                        dep.append("svg") //no i18n
                            .attr("width", "14px")// No i18n
                            .attr("height", "14px")// No i18n
                            .attr("x", 5)// No i18n
                            .attr("y", 5)// No i18n
                            .attr("style", "cursor:pointer")// No i18n
                            .attr("class", function(d){ return d.hasChildren? "toggle-nodes": "hide" })// No i18n
                            .attr("viewBox", "0 0 512 512") // No i18n
                            .append("polygon").attr("points","508.3,204.302 508.3,94.372 232.104,94.372 232.104,119.163 2.128,119.163 2.128,148.02 103.282,148.02   103.282,395.751 104.073,395.751 104.073,395.879 231.416,395.879 231.416,433.091 507.612,433.091 507.612,323.161   231.416,323.161 231.416,365.65 135.572,365.65 135.572,148.02 232.104,148.02 232.104,204.302 ") //no i18n

                        dep.append("rect") //no i18n
                            .attr("width", "0.5") // No i18n
                            .attr("height", "24px") // No i18n
                            .attr("class", function(d){ return d.hasChildren? "has-child": "hide" }) // No i18n
                            .attr("stroke", "#ddd") // No i18n

                        dep.append("rect") //no i18n
                            .attr("width", "25px") // No i18n
                            .attr("height", "24px") // No i18n
                            .attr("class", function (d){ return d.hasChildren? "has-child": "hide" }) // No i18n
                            .attr("style", "color: #f7f7f7; opacity:0")  // No i18n
                    }

                    // Node notification count
                    if(nodeData.cidata.otherAppsCount != undefined && nodeData.cidata.otherAppsCount != 0) {
                        var gnoti = nodeElement.append('g')// no i18n
                                        .attr("class", function(d) { return d.cidata.otherAppsCount?'noti-group':'noti-group no-noti';   }) // No i18n
                                        .on("click", controller.viewOtherAppDetails);// no i18n

                        gnoti.append("rect")// no i18n
                            //Previously width is fixed to 20px, due to that 3 digit counts are not shown correctly. So modified to take dynamic width.
                            .attr("width", function(d) { return ( 7.5 + (7.5 * d.cidata.otherAppsCount.toString().length) ); }) // No i18n
                            .attr("height", 16) // No i18n
                            .attr("x", function(d) { return 35+d.textLength*3; }) // No i18n
                            .attr("y", 0) // No i18n
                            .attr("class", function(d) { return d.cidata.otherAppsCount?"noti-text":"hide"; }) // No i18n
                            .attr("fill", "#d75959")
                            .attr("rx", 2) // No i18n
                            .attr("ry", 2) // No i18n

                        gnoti.append("text")//no i18n
                            .attr("dx", function(d) {
                            	return 40+d.textLength*3;
                            })
                            .attr("dy", 12) // No i18n
                            .attr("noti-count", true) // No i18n
                            .attr("fill", "#fff")
                            .text(function(d) { return d.cidata.otherAppsCount?d.cidata.otherAppsCount:""; });//no i18n
                    }

                    //append add relationship button only for cis the user has access
                    if(nodeData.cidata.canview != undefined && nodeData.cidata.canview == "true" && nodeData.cidata.can_add_relationship != undefined && nodeData.cidata.can_add_relationship == "true" && !attributes.fromDashboard) {
                        // Node plus button group for new relationship
                        var gplus = nodeElement.append("g")// no i18n
                                        .attr("class", "plus-group") // No i18n
                                        .on("click", controller.addRelationship);// no i18n

                        gplus.append("rect")// no i18n
                            .attr("width", 23) // No i18n
                            .attr("height", 24) // No i18n
                            .attr("y", 42) // No i18n
                            .attr("x", textWidth+38);

                        gplus.append("text")//no i18n
                            .attr("transform", function(d) {
                            		return "translate(" + (textWidth + 45) + ", " + 58 + ")"; //no i18n
                            })
                            .text('+'); // No i18n

                        gplus.append("title").text(getMessageForKey("ae.cmdb.admin.citype.addrelationship"));// no i18n
                    }
                }
            });

            node = nodeEnter.merge(node);
            // Arrow line text
            var labelText = svg.selectAll(".label-text").data(links, function(d) { return d.id; });//no i18n

            var labelEnter = labelText.enter().append("text")//no i18n
                .attr("class", "label-text") // No i18n
                .attr("id", function(d) { return "text" + d.id}) // No i18n
                .attr("text-anchor", "middle") // No i18n
                .attr("dy", -2) // No i18n
                .attr("font-size", 10) // No i18n
                .append("textPath")//no i18n
                .attr("startOffset", "50%") // No i18n
                .attr("xlink:href", function(d) { return "#link" + d.id; }) // No i18n
                .text(function(d) { return d.relationshipData.relation;});

            labelText.exit().remove();

            labelText = labelEnter.merge(labelText)

            /*for(var i = 0; i < 500; i++) {
                view.tick();
            }*/
        }

        function cacheDOM(nodeElement) {
            nodeElement.nodes().each(function(d) {
                var nodeid = d.id;
                nodesDOM[nodeid] = d;
            });
        }

        function tick() {
            noOfTicks++;

            if(noOfTicks % 5 == 0) {
                var x1, x2, y1, y2;
                //align link. source to destination
                link.attr("d", function(d) { // No i18n
                    x1 = d.source.x ,
                    x2 = d.target.x ,
                    y1 = d.source.y ,
                    y2 = d.target.y ;

                    /*var nodeBBox = d.source.imgbbox;
                    if(nodeBBox == undefined || nodeBBox == null) {
                    	nodeBBox = d3.select("#node" + d.source.id + " image").node().getBBox(); //no i18n
                    	d.source.imgbbox = nodeBBox;
                    } */
                    var nodeBBox = {x: 25, y: 0, width: 42, height: 42};

                    if(x1 < x2) {
                        // for links in rhs
                        var moveFrom = moveFromNode(d, nodesDOM["node"+d.source.id], nodesDOM["node"+d.target.id]);
                        var lineTo = lineToNode(d, nodesDOM["node"+d.source.id], nodesDOM["node"+d.target.id], moveFrom);
                        return "M" + (d.source.x + nodeBBox.x + nodeBBox.width/2) + "," + (d.source.y + nodeBBox.height/2) + "L " + lineTo.x + ", " + lineTo.y; //no i18n
                    }
                    else {
                        // for links in lhs
                        var moveFrom = moveFromNode(d, nodesDOM["node"+d.source.id], nodesDOM["node"+d.target.id]);
                        var lineTo = lineToNode(d, nodesDOM["node"+d.source.id], nodesDOM["node"+d.target.id], moveFrom);
                        return "M" + lineTo.x + "," + lineTo.y + "L " + (d.source.x + nodeBBox.x + nodeBBox.width/2) + "," + (d.source.y + nodeBBox.height/2); //no i18n
                    }

                  /*  if(x1 < x2) {
                    	return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
                    }
                    else {
                    	return "M" + d.target.x + "," + d.target.y + "L" + d.source.x + "," + d.source.y;
                    } */
                })
                .attr("marker-end", function(d) { // No i18n
                    return (d.source.x < d.target.x) ? "url(#arrowhead)" : null; // no i18n
                })
                .attr("marker-start", function(d) { // No i18n
                    return (d.source.x > d.target.x) ? "url(#arrowhead2)" : null;// no i18n
                })

                // set node x,y
                node.attr("transform", function(d) {
                    return "translate(" + (d.x ) + "," + (d.y ) + ")"; // no i18n
                });
            }
        }

        function linkMouseover(d, nodeId) {
            // mouse over behavior for links. highlink link
            svg.select("#text" + d.id).classed("active-text", true);//no i18n
            svg.select("#border" + d.target.id).classed("active", true);//no i18n
            if(d.source.px < d.target.px) {
                svg.select("#arrowhead").classed("activeArr", true);//no i18n
            }
            else {
                svg.select("#arrowhead2").classed("activeArr", true);//no i18n
            }

            if(d.relationshipData.ciRelAttr && nodeId == d.target.id) {
                jQuery('#relAttributes').html('');
                for(var c = 1; c < d.relationshipData.ciRelAttr.count; c++) {
                    if (d.relationshipData.ciRelAttr[c].Type == 'Color'){
                        p = jQuery("<div class='btn-group' />").html(e_html(d.relationshipData.ciRelAttr[c].Name) + ": <div class='fr ml10' style='height: 12px; width: 50px; background-color:"+ d.relationshipData.ciRelAttr[c].Value +"'/>");
                    }
                    else {
                        p = jQuery("<p class='text-wrap'/>").text(d.relationshipData.ciRelAttr[c].Name + ": " + d.relationshipData.ciRelAttr[c].Value);
                    }
                   jQuery('#relAttributes').append(p);
                }
                jQuery('#ci-attr').show().css({
                    'top': jQuery('#node' + d.target.id).closest('.node').find('rect').offset().top + 30, //no i18n
                    'left': jQuery('#node' + d.target.id).closest('.node').find('rect').offset().left,//no i18n
					'right': 'inherit' //no i18n
                });
            }
        }

        function nodeMouseover(d) {
            // mouse over behavior for links. highlink link
            svg.selectAll(".link").classed("active", function(p) { // no i18n
                return d3.select(this).classed("active") || p.source === d || p.target === d;
            });
            svg.selectAll(".link.active").each(function(l){linkMouseover(l, d.id)})//no i18n
            svg.classed("hover", true); // no i18n
        }

        function nodeMouseout(d) {
            // mouse out behavior.
            svg.selectAll(".active").classed("active", false);//no i18n
            svg.selectAll(".active-text").classed("active-text",false);//no i18n
            svg.classed("hover", false); // no i18n

            jQuery('#ci-attr').hide();
        }

        var addDependencyIcon = function(nodeElement) {
            //This is for adding relationship to a node that doesn't have children.
            //This could be easily done by d3 general update pattern but this is a rare operation, so to avoid unnecessary loops every time map is updated, done manually.

            d3.select(nodeElement + " text").attr("dx", 2); //no i18n
            var dep = d3.select(nodeElement).append("g")//no i18n
                .attr("class",function(d){ return d.hasChildren?"node-dep":"node-dep no-child";})
                .attr("transform", function(d) { return "translate(" + (d.textWidth + 12) + ", " + 42 + ")"; })
                .on("click", controller.click); //no i18n

            dep.append("svg") //no i18n
                .attr("width", "14px")// No i18n
                .attr("height", "14px")// No i18n
                .attr("x", 5)// No i18n
                .attr("y", 5)// No i18n
                .attr("style", "cursor:pointer")// No i18n
                .attr("class", function(d){ return d.hasChildren? "toggle-nodes": "hide" })// No i18n
                .attr("viewBox", "0 0 512 512") // No i18n
                .append("polygon").attr("points","508.3,204.302 508.3,94.372 232.104,94.372 232.104,119.163 2.128,119.163 2.128,148.02 103.282,148.02   103.282,395.751 104.073,395.751 104.073,395.879 231.416,395.879 231.416,433.091 507.612,433.091 507.612,323.161   231.416,323.161 231.416,365.65 135.572,365.65 135.572,148.02 232.104,148.02 232.104,204.302 ") //no i18n

            dep.append("rect") //no i18n
                .attr("width", "0.5") // No i18n
                .attr("height", "24px") // No i18n
                .attr("class", function(d){ return d.hasChildren? "has-child": "hide" }) // No i18n
                .attr("stroke", "#ddd") // No i18n

            dep.append("rect") //no i18n
                .attr("width", "25px") // No i18n
                .attr("height", "24px") // No i18n
                .attr("class", function (d){ return d.hasChildren? "has-child": "hide" }) // No i18n
                .attr("style", "color: #f7f7f7; opacity:0")  // No i18n
        }

        return {
            initialize: initialize,
            update: update,
            getProperties: getProperties,
            addDependencyIcon: addDependencyIcon
        }
    })();

    var controller = (function() {
    	var initializeMap = function (data) {
            mapData.setData(data);

            var baseCI = getBaseCI(data);
            mapData.setBaseCI(baseCI);
            renderer.initialize(baseCI);
    	}

        function getBaseCI() {
            var nodes = mapData.getData().nodes;
            for(var i = 0; i < nodes.length; i++) {
                if(nodes[i].CIID == attributes.ciId) {
                	return nodes[i];
                }
            }
        }

	    var exportMap = function(type) {
	    	var fileName = attributes.viewName?attributes.viewName:mapData.getBaseCI().name;
	    	zoom.reset();
            exportUtil.exportMap(document.getElementById('rootG'), fileName, attributes.ciId, type);
            zoom.revertReset();
	    }

        function collapseNode(d) {
            var data = mapData.getData();
            //get all links with d has source
            var t = jQuery.grep(data.links, function(l) {
                return l.source === d;
            });
            //for each link l with source d
            t.forEach(function(l) {
            	if(l.isReference == undefined || !l.isReference) {
                    //recursively collapse all nodes that are connected to d and are visible and not reference links (new links connecting existing nodes)
                    var x = jQuery.grep(data.links, function(l2) {
                        return l2.target === l.target && l2.visible && !l2.isReference;
                    });
                    //if l.target is a target of more than 1 node, don't collapse l.target.
                    if(x.length == 1) {
                        collapseNode(l.target);
                    }
                    //if x is less than or equal to 1, l.target is safe to collapse and hide.
                    if(x.length <= 1) {
                    	l.target.visible = false;
                    }
            	}
                l.visible = false;
            });
            if(d.expanded == true) {
                d.expanded = false;
            }
        }

        function expandNode(d) {
            var data = mapData.getData(true);
            var nodesToBeAdded = [];
            //get all links with source as d
            data.links.forEach(function(l) {
                if(l.source.CIID == d.CIID) {
                    nodesToBeAdded.push(l.target.CIID);
                    l.visible = true;
                    l.target.visible = true;
                }
            });
            d.expanded = true;
        }

        var click = function(d) {

            d3.event.stopPropagation();
            //Click will always trigger dragstarted event and in dragstarted event alphaTarget is set to 0.3 which if not set to 0 will lead to graph instabilities.
            renderer.getProperties().force.alpha(0.5).alphaTarget(0).alphaDecay(0.02).restart();
            if (d.expanded == true) {
                // Collapse d. save children in another attribute to avoid ajax call

                collapseNode(d);
                renderer.update();
                d3.select("#node"+d.id).classed("closed", true) //no i18n
            }
            else {
                d3.select("#node"+d.id).classed("closed", false) //no i18n
                if(d.expanded == undefined) {
                    //if children is expanded for the first time.
                    //Taking into account only the source nodes, since it will not have any targets. (Yet to be expanded)
                    var mappedCiids = "";
                    mapData.getData().links.forEach(function(l) {
                        if(l.target.CIID == d.CIID) {
                            mappedCiids += l.source.CIID + ",";
                        }
                    });
                    mappedCiids = mappedCiids.slice(0, -1);

                    view.showProgressIndicator();
                    app.callServerForRelGetData('/RelationshipMapD3.do', {operation: "getRelatedCIData", ciId: d.CIID, mappedCIIDS: mappedCiids}, function(data) { //no i18n
                        if(data != undefined) {
                            jQuery('[id^=_DIALOG_LAYER]').remove();
                            if(data.nodes == undefined || data.nodes.length == 0) { // If the same CI is expanded elsewhere in map
                                showalert('info', getMessageForKey("ae.cmdb.businessview.warning.expanded"), 'isAutoHide=true'); // no i18n
                            }
                            else {
                                mapData.setData(data);
                                expandNode(d);
                                renderer.update();
                            }
                        }
                    });
                }
                else if(d.expanded == false){
                    // If CI has been expanded before
                    expandNode(d);
                    renderer.update();
                }

                //To make node centered on the screen on click. Disabled for now.
                /*var currentScale = zoom.getCurrentZoom();
                var cx = renderer.getProperties().width / 2 - d.x * currentScale;
                var cy = renderer.getProperties().height / 2 - d.y * currentScale;
                zoom.set({x: cx, y: cy});*/
                d.expanded = true;
            }
        }

        function processData(data) {
            var links = [];
            var nodes = {};
            data.links.forEach(function(l) {
                var link = {source: l.source.CIID, target: l.target.CIID, relationshipId: l.relationshipData.relId};
                if(l.isReference != undefined) {
                	link.isReference = true;
                }
                links.push(link)
            });

            data.nodes.forEach(function(n) {
                nodes[n.CIID] = {CIID: n.CIID, x: n.x, y: n.y};
                if(n.expanded != undefined && n.expanded == true) {
                    nodes[n.CIID].expanded = n.expanded;
			}
            });
            return {links: links, nodes: nodes};
        }

        var save = function() {
            zoom.reset();
            //Save As button
            var formData = jQuery("#saveForm").serializeArray();
            if(jQuery("#saveForm input[name=viewName]").val().trim() == "") {
                jQuery("#alert-failure").css("display", "block") //no i18n
                jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.emptyname"));
            }
            else {
                var data = mapData.getData();
                data = processData(data);
                var viewData = { name: "viewData", value:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) }; //no i18n
                formData.push(viewData);
                var operation = {name: "operation", value: "saveView"}; // no i18n
                var baseCIID = {name: "baseCiid", value: mapData.getBaseCI().CIID} // no i18n
                formData.push(operation)
                formData.push(baseCIID)
                if(!jQuery("input:checkbox[name='editable']").is(":checked")) {
                    var editable = {name: "editable", value: "off"} // no i18n
                    formData.push(editable);
                }
                app.callServer('/BusinessView.do', formData, //no i18n
                    function(data) {
                        if(data == null) {
                            jQuery("#alert-failure").css("display", "block")  //no i18n
                            jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.generic"));
                        }
                        else if(data == "emptyviewname") {
                            jQuery("#alert-failure").css("display", "block") //no i18n
                            jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.emptyname"));

                        }else if(data.toString().indexOf("AuthError.jsp") !== -1){
                             jQuery("#alert-failure").css("display", "block") //no i18n
                             jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.unsafename"));
                        }else {
                            jQuery("#alert-success").css("display", "block") //no i18n
                                setTimeout(function() {
                                closeDialog();
                            }, 1000);
                            attributes.viewId = data.viewId;
                            attributes.viewName = data.viewName;
                            jQuery("#ciNameLabel").remove(); // set ci name in ui
                            header.buildViewDropdown(data.listOfViews, data.viewId);
                            header.switchHeaderState();
                        }
                    },
                    function() {
                        jQuery("#alert-failure").css("display", "block") //no i18n
                        jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.generic")); //no i18n
                    }
                );
            }
            zoom.revertReset();
            return false;
        }

        var updateView = function() {
            zoom.reset();
            //Save button
            var postData = [];
            var data = mapData.getData();
            data = processData(data);
            var viewData = { name: "viewData", value:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) }; //no i18n
            postData.push(viewData);
            var viewId = { name: "viewId", value:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(attributes.viewId) : JSON.stringify(attributes.viewId) }; //no i18n
            postData.push(viewId);
            var baseCIID = {name: "baseCiid", value: mapData.getBaseCI().CIID} // no i18n
            postData.push(baseCIID)
            var operation = {name: "operation", value: "updateView"}; // no i18n
            postData.push(operation)
            app.callServer('/BusinessView.do', postData, //no i18n
                function() {
                    showalert('success', getMessageForKey("ae.cmdb.businessview.success.saved"), 'isAutoHide=true'); // no i18n
                    jQuery("#save").prop("disabled", true); //no i18n
                    setTimeout(function() {
                        jQuery("#save").prop("disabled", false); //no i18n
                        jQuery("#alertbox").remove();
                    }, 3000);
                },
                function() {
                    showalert('failure', getMessageForKey("ae.cmdb.businessview.error.generic"), 'isAutoHide=true')//no i18n
                });
            zoom.revertReset();
        }

      	//Update children on adding new relationship. Add new nodes and links to existing data and update map.
        var updateChildren = function(ciId, nodeId) {
            var mappedCiids = "";
            var node = d3.select("#node" + nodeId).datum(); //no i18n
            var allData = mapData.getData(true);
            allData.links.forEach(function(l) {
                if(l.target.id == nodeId) {
                    mappedCiids += l.source.CIID + ",";
                }
                if(l.source.id == nodeId) {
                    mappedCiids += l.target.CIID + ",";
                }
            });
            mappedCiids = mappedCiids.slice(0, -1);

            view.showProgressIndicator();
            app.callServerForRelGetData('/RelationshipMapD3.do', {operation: "getRelatedCIData", ciId: ciId, mappedCIIDS: mappedCiids}, function(data) { //no i18n
                if(data != undefined) {
                    jQuery('[id^=_DIALOG_LAYER]').remove();

                    if(data.nodes != undefined && data.nodes.length != 0) {
                        if(node.hasChildren == false) {
                            node.hasChildren = true;
                            renderer.addDependencyIcon('#node' + nodeId);
                        }
                        mapData.setData(data);
                        expandNode(node);
                        renderer.getProperties().force.alpha(0.3).alphaTarget(0).alphaDecay(0.02).restart();
                        renderer.update();
                    }
                }
            });
        }

        var viewCIDetails = function(d) {
            if(d.cidata.canview == "true") {
                // view ci details
                var ciId = d.CIID;
                if (!d3.event.defaultPrevented){
                    if(!attributes.fromDashboard) {
                        assetsObj.loadCIDetailsPopup(ciId,d.cidata.api_plural_name);
                    }
                    else {
                        assetsObj.loadCIDetailsInNewWindow(ciId,d.cidata.api_plural_name);
                    }
                }
            }
        }

        function viewOtherAppDetails(d) {
            let options = {
                defaultTab : "association"
            };
            if (!d3.event.defaultPrevented){
                if(!attributes.fromDashboard) {
                    assetsObj.loadCIDetailsPopup(d.CIID,d.cidata.api_plural_name,options);
                }
                else {
                    assetsObj.loadCIDetailsInNewWindow(d.CIID,d.cidata.api_plural_name,options);
                }
            }
        }

        var addRelationship = function(d) {
            if (!d3.event.defaultPrevented){
                var fromModuleVal = jQuery("#fromModule").val();//NO I18N
                $ciRelationship.openRelationAddForm(d.cidata.api_plural_name,d.cidata.api_name,d.cidata.display_name,d.CIID,d.name,"mapView",d.id);   //NO I18N
            }
        }

    	// Method to call more info popup. type and forbaseci parameters are to scroll to a particular listview on load.
    	function showMoreInfo() {
    		var url = "/BusinessView.do?operation=showMoreInfo&viewId=" + attributes.viewId + "&ciId=" + attributes.ciId; // no i18n
            var title = attributes.viewName;
    	    showURLInDialog(url, "title='" + encodeHTML(title) + "',modal=yes,method=GET,position=absmiddle,width=1200,heigth=500"); //NO I18N
    	}

        return {
        	initializeMap: initializeMap,
        	click: click,
        	viewCIDetails: viewCIDetails,
        	viewOtherAppDetails: viewOtherAppDetails,
        	addRelationship: addRelationship,
        	exportMap: exportMap,
        	save: save,
        	updateView: updateView,
        	updateChildren: updateChildren,
        	showMoreInfo: showMoreInfo
        }
    })();

	return {
		controller: controller,
		zoom: zoom
	};
})();

var app = (function() {
	var initialize = function() {
		callServerForRelGetData('/RelationshipMapD3.do', {operation: 'getData', viewId: attributes.viewId, ciId: attributes.ciId}, function(data) { //no i18n
		    var viewData = data.viewData;
			if(viewData.missingLinks != undefined) {
				showalert('failure', getMessageForKey("ae.cmdb.businessview.error.partiallyloaded", [ZSEC.Encoder.encodeForHTML(viewData.ciWithMissingLink)]), 'isAutoHide=false'); // no i18n
			}
			var baseCIName = viewData.baseCIName;
			view.initializeView(baseCIName);
           	map.controller.initializeMap(viewData);
           	if(attributes.viewId) {
               	var listOfViews = data.listOfViews;
               	header.buildViewDropdown(listOfViews, attributes.viewId);
               	var viewName = jQuery.grep(listOfViews, function(v) { return v.viewId == attributes.viewId; })[0].name;
               	attributes.viewName = viewName;
           	}
	});
	}

	var callServer = function(url, data, successCallback, failureCallback) {
		data[getCSRFParamName()]=getCSRFParamValue(); //No I18N
		jQuery.ajax({
			url: url,
            data: data,
            type: 'POST', //no i18n
	    	success: successCallback,
            error: failureCallback
        });
	}

	var callServerForRelGetData = function(url, data, successCallback, failureCallback) {
		jQuery.ajax({
			url: url,
            data: data,
            type: 'GET', //no i18n
	    	success: successCallback,
            error: failureCallback
        });
	}

    return {
        initialize: initialize,
        callServer: callServer,
        callServerForRelGetData : callServerForRelGetData
    };
})();
