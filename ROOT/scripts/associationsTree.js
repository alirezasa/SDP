/* $Id:$ */

/**
 * 
 * @param {object} options Association Options
 * @param {object} treeData Tree data
 * @returns tree Object
 * Initialization of association tree
 */
var associationD3Tree = (options, treeData) => {
  //Default width
  const defNW = 200;
  const selector = options.selector
    ? options.selector
    : "d3tree_" + Math.floor(Math.random() * 9); // NO I18N

  // Calculate total nodes, max label length
  let totalNodes = 0;
  let maxLabelLength = 0;

  let i = 0;
  const default_duration = 750;
  let root = d3.hierarchy(treeData, function (d) {
    return d.children;
  });
  // size of the diagram
  let viewerWidth = options.width ? options.width : jQuery(document).width();
  let viewerHeight = options.height
    ? options.height
    : jQuery(document).height();

  let treemap;
  // A recursive helper function for performing some setup by walking through all nodes
  function visit(parent, visitFn, childrenFn) {
    if (!parent) return;
    visitFn(parent);
    let children = childrenFn(parent);
    if (children) {
      let count = children.length;
      for (let i = 0; i < count; i++) {
        visit(children[i], visitFn, childrenFn);
      }
    }
  }

  // Call visit function to establish maxLabelLength
  visit(
    treeData,
    function (data) {
      totalNodes++;
      maxLabelLength = Math.max(data.name.length, maxLabelLength);
    },
    function (data) {
      return data.children && data.children.length > 0 ? data.children : null;
    }
  );

  // Define the zoom function for the zoomable tree
  function zoom() {
    if (d3.event.transform != null) {
      svgGroup.attr("transform", d3.event.transform);
    }
  }

  let zoomButtons = d3
    .select("#" + selector)
    .append("div") // NO I18N
    .attr("class", "graphactions graphactionspop") // NO I18N
    .style("position", "absolute"); // NO I18N

  zoomButtons
    .append("a") // NO I18N
    .attr("class", "zoomin") // NO I18N
    .attr("title", translate("common.zoom_in")) // NO I18N
    .attr("rel", "uitip") // NO I18N
    .style("margin-right", "5px") // NO I18N
    .on("click", function () { // NO I18N
      baseSvg.call(zoomListener.scaleBy, 1.2);
    });

  zoomButtons
    .append("a") // NO I18N
    .attr("class", "zoomout") // NO I18N
    .attr("title", translate("common.zoom_out")) // NO I18N
    .attr("rel", "uitip") // NO I18N
    .style("margin-right", "5px") // NO I18N
    .on("click", function () { // NO I18N
      baseSvg.call(zoomListener.scaleBy, 0.8);
    });
  zoomButtons
    .append("a") // NO I18N
    .attr("class", "zoomfit") // NO I18N
    .attr("title", translate("sdp.admin.workflow.resetzoom")) // NO I18N
    .attr("rel", "uitip") // NO I18N
    .on("click", function () { // NO I18N
      baseSvg.call(zoomListener.transform, d3.zoomIdentity);
      centerNode(root, true);
    });
    /** Tree resize handling */
    function updateTreeSize() {
      const svg = d3.select("#" + selector + " svg");
      const width = window.innerWidth;
      const height = window.innerHeight;
      svg.attr('width', width);
      svg.attr('height', height);
    }
    jQuery(window).off('resize.d3tree').on('resize.d3tree', function(){ // NO I18N
      updateTreeSize();
    })
  // Centering the node when update happens 
  function centerNode(source, resetScale) {
    t = d3.zoomTransform(baseSvg.node());
    x = -source.y0;
    y = -source.x0;
    x = x * t.k + viewerWidth / 2;
    y = y * t.k + viewerHeight / 2;
    d3.select("#" + selector + " svg")
      .transition()
      .duration(resetScale ? 0 : default_duration)
      .call(zoomListener.transform, d3.zoomIdentity.translate(x, y).scale(t.k));
  }
  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  let zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

  // define the baseSvg, attaching a class for styling and the zoomListener
  let baseSvg = d3
    .select("#" + selector)
    .append("svg") // NO I18N
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+viewerWidth+" "+viewerHeight+"")
    .attr("class", "svg-base") // NO I18N
    .call(zoomListener)
    .on("click", () => {
      d3.select(".tree-popover").style("opacity", 0); // NO I18N
    });


  // Toggle children function
  function toggleChildren(data) {
    if (data.children) {
      data._children = data.children;
      data.children = null;
    } else if (data._children) {
      data.children = data._children;
      data._children = null;
    }
    return data;
  }

  // Toggle children on click.
  let clickTimeout;
  function click(data) {
    if (d3.event.defaultPrevented) return; // click suppressed

    if(data.parent == null || (data.children && data.children.length > 0)){
      data = toggleChildren(data);
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(()=> {
        update(data)
        centerNode(data);
      }, 300);
      return
    }
    if(data.data && data.data.s_entity_name && data.data.node_type !== "dummy"){
      update(data);
      centerNode(data);
      return;
    }

    if (data.data && data.data.node_type === "dummy") {
      fetchMoreData(data);
      update(data, 100);
      centerNode(data);
    } else {
      if(data.data && data.data.has_parent){
        const parentNode = svgGroup.selectAll(".node").filter(function(data){ // NO I18N
          return data.id === 1;
        }).datum()
        centerNode(parentNode);
        return;
      }
      /**
       * Check for existing node present in tree
       */
      const hasSourceEntity = svgGroup.selectAll(".node").filter((node)=>{ // NO I18N
        if(node.data && node.data.node_type !== "sub_node" && node.data.source_entity === data.data.source_entity){
          return true;          
        }
      }).datum()
      if(hasSourceEntity.children){
        centerNode(hasSourceEntity);
        return
      }

      if(data.children || data._children){
        data._children ? jQuery(`#${selector} [data-id="${data.id}"] path`).removeClass("opac5") : jQuery(`#${selector} [data-id="${data.id}"] path`).addClass("opac5");
        data = toggleChildren(data);
      }else{
        fetchNodeData(data)
      }
      update(data);
      centerNode(data);
    }
  }
  // Create diagonal path between each nodes
  function diagonal(source, data) {
    if (source != null && d != null) {
      let rect_width = data.parent ? 75 : 120;
      if(data.data && data.data.node_type === "sub_node"){
        rect_width = 10;
      }
      const rect_height = 0;
      const path = `M ${source.y + 10} ${source.x + rect_height / 2}
                C ${(source.y + data.y + rect_width) / 2}  ${source.x + rect_height / 2}
                  ${(source.y + data.y + rect_width) / 2}  ${data.x + rect_height / 2}
                  ${data.y + rect_width } ${data.x + rect_height / 2}`;

      return path;
    }
  }

  function update(source, custom_duration) {
    const duration = custom_duration ? custom_duration : default_duration;
    let levelWidth = [1];
    let childCount = function (level, n) {
      if (n.children && n.children.length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0);

        levelWidth[level + 1] += n.children.length;
        n.children.forEach(function (d) {
          childCount(level + 1, d);
        });
      }
    };
    childCount(0, root);
    let newHeight = d3.max(levelWidth) * 65;
    treemap = d3.tree().size([newHeight, viewerWidth]);
    let treeData = treemap(root);
    // Compute the new tree layout.
    let nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Set widths between levels based on maxLabelLength.
    nodes.forEach(function (d) {
      d.y = d.depth * 180;
    });
    // Update the nodes…
    node = svgGroup.selectAll("g.node").data(nodes, function (d) { // NO I18N
      return d.id || (d.id = ++i);
    });

    let popoverTimeout;
    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append("g") // NO I18N
      .attr("class", "node") // NO I18N
      .attr("data-id", function (d) { // NO I18N
        return d.id;
      })
      .attr("transform", function (d) { // NO I18N
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", (d)=>{
        if(d.parent == null || (d.data && d.data.node_type === "sub_node")){
          return ;
        }
        if(d.data && d.data.node_type === "dummy"){
          click(d);
        }
        if(d.data && d.data.entity_p_name){
          $previewComponent.load(`/ui/print/${d.data.entity_p_name}/${d.data.a_id}?externalframe=true`)
        }
      })
      .on("mouseenter", (d) => { // NO I18N
        /**
         * Prevent popover getting display when hover over all the nodes 
         */
        clearTimeout(popoverTimeout);
        hidePopover();
        popoverTimeout = setTimeout(()=> showPopover(d), 300);
      })
      .on("mouseleave", (d) => { // NO I18N
        clearTimeout(popoverTimeout);
        hidePopover(d);
      });

    nodeEnter
      .filter(function (d) {
        return d.data.node_type === "sub_node"; // NO I18N
      })
      .append("line") // NO I18N
      .attr("class", "nodeLine") // NO I18N
      .attr("x1", function (d) { // NO I18N
        return 0
      })
      .attr("x2", function (d) { // NO I18N
        return 0
      })
      .attr("y1", 0) // NO I18N
      .attr("y2", 0) // NO I18N
      .style("stroke", "#ddd") // NO I18N
      .style("stroke-width", 1); // NO I18N

    /** sub node constructing */
    nodeEnter
      .filter(function (d) {
        return d.data.node_type === "sub_node"; // NO I18N
      })
      .append("text") // NO I18N
      .attr("class", "nodeText") // NO I18N
      .attr("text-anchor", function (d) { // NO I18N
        return "middle"; // NO I18N
      })
      .attr("dy", function (d) { // NO I18N
        return d.parent ? "-0.5em" : "1.2em"; // NO I18N
      })
      .style("fill-opacity", 0) // NO I18N
      .style("cursor", "default") // NO I18N
      .style("font-size", "12px") // NO I18N
      .text(function (d) {
        return d.name ? d.name : d.data.name;
      })
      .attr('rel', function(d){
        const textNode = d3.select(this).node();
        let maxWidth = 120
        const txtWidth = textNode.getBoundingClientRect().width;
        return txtWidth > maxWidth ? 'uitip' : ' ';// NO I18N
      })
      .attr('title', function(d){
        return d.name ? d.name : d.data.name;
      })
      .style('fill', function(){ // NO I18N
        return isDark() ? '#e2e2e2' : '#000000'; // NO I18N
      })
      .each(textEllips);

    nodeEnter
      .filter(function (d) {
        return d.data && d.data.node_type !== "sub_node"; // NO I18N
      })
      .append("rect") // NO I18N
      .attr("class", "nodeRect") // NO I18N
      .attr("rx", function (d) { // NO I18N
        return 15;
      })
      .attr("stroke-width", function (d) { // NO I18N
        return d.parent ? 1 : 0;
      })
      .attr("stroke", function (d) { // NO I18N
        return "#7d7d7d"; // NO I18N
      })
      .attr("stroke-dasharray", function (d) { // NO I18N
        return d.children || d._children ? "0" : "2.2"; // NO I18N
      })
      .style("fill", function (d) { // NO I18N
        if(d.data && d.data.node_type === "dummy"){ // NO I18N
          return "#deffcf"; // NO I18N
        }
        const rectParentColor = isDark() ? '#304d5e' : '#03c0dc'; // NO I18N
        const rectNodeColor = isDark() ? '#2e2f31' : '#fff'; // NO I18N
        if(d.data && d.data.has_parent){
          return rectParentColor;
        }
        return d.parent ? rectNodeColor : rectParentColor; // NO I18N
      })
      .attr("ry", function (d) { // NO I18N
        return 15;
      })
      .attr("x", function (d) { // NO I18N
        return d.parent ? -75 : -120;
      })
      .attr("y", -15) // NO I18N
      .attr("width", function (d) { // NO I18N
        return d.parent ? defNW : 240;
      })
      .attr("height", 30) // NO I18N
      .style("overflow", "hidden") // NO I18N
      .style("cursor", function (d) { // NO I18N
        return d.data && d.data.node_type === "dummy" ? "pointer" : "default"; // NO I18N
      });

    nodeEnter
      .filter(function (d) {
        return d.data.node_type !== "sub_node"; // NO I18N
      })
      .append("text") // NO I18N
      .attr("dy", ".35em") // NO I18N
      .attr("dx", function(d){
        return d.parent ? '1em' : '0em'; // NO I18N
      }) 
      .attr("class", "nodeText") // NO I18N
      .attr("text-anchor", function (d) { // NO I18N
        return "middle"; // NO I18N
      })
      .style("fill-opacity", 0) // NO I18N
      .style("cursor", function (d) { // NO I18N
        return d.data && d.data.node_type === "dummy" ? "pointer" : "default"; // NO I18N
      })
      .style("color", "red") // NO I18N
      .style("font-size", "12px"); // NO I18N

    nodeEnter
      .filter(function (d) {
        return d.data.node_type !== "sub_node"; // NO I18N
      })
      .selectAll("text") // NO I18N
      .append("tspan") // NO I18N
      .attr("class", "ellipsis") // NO I18N
      .style("fill", function (d) { // NO I18N
        const textColor = isDark() ? '#e2e2e2' : '#000'; // NO I18N
        return d.parent ? textColor : "#fff"; // NO I18N
      })
      .text(function (d) {
        return d.name ? d.name : d.data.name;
      })
      .attr('rel', function(d){
        const textNode = d3.select(this).node();
        const maxWidth = d.parent ? 120 : 200;
        const txtWidth = textNode.getBoundingClientRect().width;
        return txtWidth > maxWidth ? 'uitip' : ' '; // NO I18N
      })
      .attr('title', function(d){
        return d.name ? d.name : d.data.name
      })
      .each(textEllips);

    
    // Define the rounded rectangle properties
    let rectWidth = 28;
    let rectHeight = 26;
    let cornerRadius = 12;

    // Create the path for the rounded rectangle
    let path = "M0 0"; // NO I18N
    path += "H" + (rectWidth - cornerRadius);  // NO I18N
    path += "Q" + rectWidth + " 0 " + rectWidth + " " + cornerRadius; // NO I18N
    path += "V" + (rectHeight - cornerRadius); // NO I18N
    path += "Q" + rectWidth + " " + rectHeight + " " + (rectWidth - cornerRadius) + " " + rectHeight; // NO I18N
    path += "H0";  // NO I18N
    path += "V0";  // NO I18N

    nodeEnter
      .filter(function (d) {
          return d.data && d.data.node_type !== "sub_node"; // NO I18N
        })
      .append("path") // NO I18N
      .attr("d", path)
      .attr("fill", ()=>{
        return isDark() ? "#4e4e4e" : "#ddd"; // NO I18N
      })
      .attr("class", "opac5")
      .attr("transform", function (d) { // NO I18N
        const x = d.parent ? 95 : 89; 
        return "translate(" + x  + "," + -13 + ")"; // NO I18N
      })
      

    nodeEnter
      .filter(function(d){
        return d.data && d.data.node_type !== "sub_node"; // NO I18N
      })
      .append("foreignObject") // NO I18N
      .attr("class", "tree-expand") // NO I18N
      .attr("x", (d)=>{
        var x = d.parent ? 100 : 94;
        //RTL positioning the icon
        sdp_user.DIRECTION === "RTL" && (x -= 14) // NO I18N
        return x; 
      })
      .attr("y", -9) // NO I18N
      .style("z-index", 1000) // NO I18N
      .attr("width", 30) // NO I18N
      .attr("height", 30) // NO I18N
      .style("pointer", "cursor") // NO I18N
      .html('<span class="cspr rmap icon-sm"></span>') // NO I18N
      .on("click", (d)=>{
        d3.event.stopPropagation()
        click(d)
      })

    // Update the text to reflect whether node has children or not.
    node
      .filter(function (d) {
        return d.data && d.data.node_type !== "sub_node"; // NO I18N
      })
      .select("text") // NO I18N
      .attr("text-anchor", function (d) { // NO I18N
        return "middle"; // NO I18N
      })
      .style("fill", function (d) { // NO I18N
        const textColor = isDark() ? '#e2e2e2' : '#000'; // NO I18N
        return d.parent ? textColor : "#fff"; // NO I18N
      })
      .text(function (d) {
        return d.data.name;
      })
      .attr('rel', function(d){
        const textNode = d3.select(this).node();
        const maxWidth = d.parent ? 120 : 200;
        const txtWidth = textNode.getBoundingClientRect().width;
        return txtWidth > maxWidth ? 'uitip' : ' '; // NO I18N
      })
      .attr('title', function(d){
        return d.name ? d.name : d.data.name
      })
      .each(textEllips);

    // Change the rect fill depending on whether it has children and is collapsed
    node
      .filter(function (d) {
        return d.data && d.data.node_type !== "sub_node"; // NO I18N
      })
      .select("rect.nodeRect") // NO I18N
      .attr("rx", function (d) {
        return 10;
      })
      .attr("stroke-width", function (d) { // NO I18N
        return d.parent ? 1 : 0;
      })
      .style("fill", function (d) { // NO I18N
        const rectParentColor = isDark() ? '#304d5e' : '#03c0dc' // NO I18N
        const rectNodeColor = isDark() ? '#2e2f31' : '#fff'; // NO I18N
        if(d.data && d.data.has_parent){
          return rectParentColor;
        }
        return d.parent ? rectNodeColor : rectParentColor; // NO I18N
      })
      .attr("stroke", function (d) { // NO I18N
        return "#7d7d7d"; // NO I18N
      })
      .attr("stroke-dasharray", function (d) { // NO I18N
        return d.children || d._children ? "0" : "2.2"; // NO I18N
      })
      .attr("ry", function (d) { // NO I18N
        return 10;
      })
      .attr("x", function (d) { // NO I18N
        return d.parent ? -75 : -120;
      })
      .attr("y", -15) // NO I18N
      .attr("width", function (d) { // NO I18N
        return d.parent ? defNW : 240;
      })
      .attr("height", 30) // NO I18N
      .style("overflow", "hidden") // NO I18N
      .style("cursor", function (d) { // NO I18N
        return d.data && d.data.node_type === "dummy" ? "pointer" : "default"; // NO I18N
      });

    // Transition nodes to their new position.
    let nodeUpdate = nodeEnter.merge(node);
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", function (d) { // NO I18N
        return "translate(" + d.y + "," + d.x + ")"; // NO I18N
      });
    // Fade the text in
    nodeUpdate.select("text").style("fill-opacity", 1); // NO I18N
    // Transition exiting nodes to the parent's new position.
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")"; // NO I18N
      })
      .remove();
    nodeExit.select("circle").attr("r", 0); // NO I18N
    nodeExit.select("text").style("fill-opacity", 0); // NO I18N
    // Update the links…
    let link = svgGroup.selectAll("path.link").data(links, function (d) { // NO I18N
      return d.id;
    });
    // Enter any new links at the parent's previous position.
    let linkEnter = link
      .enter()
      .insert("path", "g") // NO I18N
      .attr("class", "link") // NO I18N
      .attr("d", function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });
    // Transition links to their new position.
    let linkUpdate = linkEnter.merge(link);
    linkUpdate
      .transition()
      .duration(duration)
      .attr("d", function (d) { // NO I18N
        return diagonal(d, d.parent);
      });
    // Transition exiting nodes to the parent's new position.
    let linkExit = link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", function (d) { // NO I18N
        let o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();
    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    if(typeof options.afterTreeRender === "function"){
      initTooltip('#'+options.selector)
      options.afterTreeRender(this)
    }
  }

  // Append a group which holds all nodes and which the zoom Listener can act upon.
  let svgGroup = baseSvg.append("g"); // NO I18N

  root.x0 = viewerHeight / 2;
  root.x0 = 200;
  root.y0 = 50;

  // Layout the tree initially and center on the root node.
  update(root);
  centerNode(root);

  //position the controls buttons Note: if selector div has any margin applied the position may vary
  const selectorPos = jQuery("#" + selector).position();
  zoomButtons.style("top", selectorPos.top + 10 + "px"); // NO I18N

  /**
   * Show more data handling
   */
  function fetchMoreData(d) {
    // Perform an AJAX call or fetch data from an API
    let responseData;

    if (typeof options.cbAddMoreData === "function") { // NO I18N
      responseData = options.cbAddMoreData(d);
      if(!responseData || responseData.length === 0){
        return;
      }
    } else {
      return;
    }

    // // Remove the "Show more" node
    const parentNode = d.parent;
    const viewMoreIndex = parentNode.children.findIndex(
      (child) => child.data.node_type === "dummy" // NO I18N
    );
    if (viewMoreIndex !== -1) {
      parentNode.children.splice(viewMoreIndex, 1);
    }
    // Add fetched data as new children
    const newData = responseData.map((data) => ({
      data: data,
      depth: d.depth,
      parent: d.parent,
      x: d.x,
      y: d.y + 30,
    }));
    parentNode.children.push(...newData);
  }

  function fetchNodeData(d) {
    let responseData;
    if (typeof options.cbAddMoreData === "function") { // NO I18N
      responseData = options.cbFetchEntityData(d);
    } else {
      return;
    }

    // Add fetched data as new children
    const newData = responseData.map((data) => {
      const newHierarchy = d3.hierarchy(data);
      newHierarchy.parent = d
      newHierarchy.depth = d.depth + 1;
      
      if(newHierarchy.children && newHierarchy.children.length > 0){
        newHierarchy.children = newHierarchy.children.map((child)=>{
          return {...child , depth: newHierarchy.depth + 1}
        })
      }
      return newHierarchy
    });

    if(newData.length > 0) {
      d.children = [];
      d.children.push(...newData);
      jQuery(`#${selector} [data-id="${d.id}"] path`).removeClass("opac5")
    }
  }

  function textEllips(data) {
    const textNode = d3.select(this).node();
    let maxWidth = data.parent ? 150 : 180; // Maximum width of the rectangle
    if(data.data && data.data.node_type === 'sub_node'){
      maxWidth = 100
    }
    let ellipsisWidth = textNode.getSubStringLength(
      0,
      textNode.textContent.length - 3
    );
    let textContent = textNode.textContent;

    while (ellipsisWidth > maxWidth && textContent.length > 0) {
      textContent = textContent.slice(0, -1);
      textNode.textContent = textContent + "..."; // NO I18N
      ellipsisWidth = textNode.getSubStringLength(
        0,
        textNode.textContent.length - 3
      );
    }
  }

  function showPopover(data) {
    // Create the popover element
    const popHtml = popoverData(data);
    if (popHtml) {
      const nodeEl = document.querySelector(
        `#${selector} [data-id="${data.id}"] rect` // NO I18N
      );
      if(!nodeEl) return;
      let rx = +nodeEl.getAttribute("rx"); // NO I18N
      let ry = +nodeEl.getAttribute("ry"); // NO I18N
      let rtm = nodeEl.getCTM();
      let coords = getScreenCoords(rx, ry, rtm);
      let popover = d3
        .select("body") // NO I18N
        .append("div") // NO I18N
        .attr("class", ()=>{
          return "tree-popover " + (isDark() ? "block-bordered" : "box-shd-right"); // NO I18N
        }) 
        .style("left", coords.x - 90 + "px") // NO I18N
        .style("top", coords.y + 50 + "px") // NO I18N
        .style("max-height", "300px") // NO I18N
        .style("max-width", "300px") // NO I18N
        .style("overflow", "auto") // NO I18N
        .style("z-index", "1000"); // NO I18N
      
      // Set the popover content using the node's data
      const stylHtml= jQuery(popHtml);
      $sdStyleConverter(stylHtml);
      /** d3(popover) html method doesn't work with jquery element so create div and append the html in that  */
      popHtml && popover.html('<div id="popover_'+data.id+'"><div/>');
      jQuery('#popover_'+data.id+'').append(stylHtml);
      jQuery(".tree-popover").scrollTop(0); // NO I18N
      // Apply CSS styles to the popover
      let bgColor = isDark() ? '#000000' : '#ffffff'; // NO I18N
      popover
        .style("position", "absolute") // NO I18N
        .style("background", bgColor) // NO I18N
        .style("padding", "10px") // NO I18N
        .style("opacity", 0) // NO I18N
        .transition() // Apply transition effect
        .duration(300) // Set the transition duration in milliseconds
        .style("opacity", 1); // NO I18N

      // event for popupover
      jQuery(".tree-popover") // NO I18N
        .off("mouseleave.tree_popover") // NO I18N
        .on("mouseleave.tree_popover", () => { // NO I18N
          jQuery(".tree-popover").remove(); // NO I18N
      });
    }
  }

  // Function to hide the popover
  function hidePopover() {
    // Remove the popover element
    if (
      !d3.event.relatedTarget ||
      !d3.event.relatedTarget.classList.contains("tree-popover") || // NO I18N
      d3.event.relatedTarget.classList.contains("svg-base") // NO I18N
    ) {
      d3.select(".tree-popover").remove(); // NO I18N
    }
  }

  // Process the popover data when hover over the node in tree
  function popoverData(_data) {
    const data = _data.data;
    if (data && data.udf_data && data.udf_data.length > 0) {
      const udf_data = data.udf_data;
      let html = "<h4>" +translate("sdp.admin.leftpanel.customfields.home")+ "</h4><hr>"; // NO I18N
      for (let i = 0; i < udf_data.length; i++) {
        let value = e_html(udf_data[i].value);
        const type = udf_data[i].type;
        if(type === 'color'){
          value = `<div data-style="background-color:${value};height: 12px; width: 50px;"></div>`
        }else if(type == "bool" || type == "boolean"){ // NO I18N
          value = (value.toLowerCase() == "true") ? "Yes" : "No"; // NO I18N
        }
        html += `<div class="text-wrap"> 
          <strong>${e_html(udf_data[i].field)}</strong>
          <p>${value}</p>    
          </div>`;
      }

      return html;
    }
    return "";
  }

  /**
   *  Function to get the node position from the stage
   *  x - axis
   *  y - axis 
   *  rtm - 2d transform matrix 
   */

  function getScreenCoords(x, y, rtm) {
    let xn = rtm.e + x * rtm.a + y * rtm.c;
    let yn = rtm.f + x * rtm.b + y * rtm.d;
    return { x: xn, y: yn };
  }

  return {
    updateTree: update,
    centerTree: centerNode,
  };
};

/**
 * Association Tree handling 
 */
var associationMap = {
  treeData: {},
  /**
   * 
   * @param {string} base_entity_name 
   * @param {string} base_entity_p_name 
   * @param {string} base_entity_id 
   * @param {object} options 
   * Initialization
   */
  initMap(base_entity_name, base_entity_p_name, base_entity_id, options) {
    this.options = options;
    if (!this.options.selector) {
      throw "Missing selector for tree view"; // NO I18N
    }
    this.base_entity_id = base_entity_id;
    this.base_entity_name = base_entity_name;
    this.base_entity_p_name = base_entity_p_name;
    //Loader 
    jQuery("#"+this.options.selector).find(".loading1").remove().end().append(ajaxBar());
    jQuery("#"+this.options.selector).find(".loading1").css({"margin-top":"200px"});
    const baseEntityData = this.getEntityData(
      base_entity_name,
      base_entity_p_name,
      base_entity_id
    );
    if (!baseEntityData) {
      throw "Entity data not fetched"; // NO I18N
    }
    this.base_entity_data = baseEntityData;
    this.contructTreeData();
  },
  /**
   * Construct the tree data
   */
  contructTreeData() {
    /**
     * Level 1 Data contruct
     */
    this.treeData = {};
    const primaryValue = $MC.getprimaryfieldvalue(this.base_entity_p_name);
    this.treeData.name = primaryValue.value || this.base_entity_data.title || this.base_entity_data.name || '-'; // NO I18N
    this.treeData.type = "base"; // NO I18N
    this.treeData.children = [];

    /**
     * Level 2 Data contruct
     */
    const entityAssociationData = this.getAllAssociationData(
      this.base_entity_p_name,
      this.base_entity_id
    );
    const childData = this.transformEntityDatas(entityAssociationData, this.base_entity_p_name, this.base_entity_id);
    if(childData){
      this.treeData.children = childData
    }
    const _self = this;
    this.treeObj = associationD3Tree(
      {
        selector: this.options.selector,
        width: this.options.width
          ? this.options.width
          : jQuery(document).width() - 50,
        height: this.options.height
          ? this.options.height
          : jQuery(document).height() - 50,
          cbAddMoreData: function(d){
            if(d.data && d.data.s_entity_name){
              let assocEntityData = _self.getAssociationEntityList(
                d.data.entity_name,
                d.data.s_entity_id,
                d.data.s_entity_name,
                d.data.start_index,
              )
              if(assocEntityData.associationData && assocEntityData.associationData.length > 0){
                const transferData = _self.processEntityData(assocEntityData.associationData, d.parent.data.meta, assocEntityData.list_info);
                return transferData;
              }
            }
            return [];
          },
          cbFetchEntityData: function(d){
            if(d.data && d.data.a_id){
              const entityAssociationData = _self.getAllAssociationData(
                d.data.entity_p_name,
                d.data.a_id,
              );
          
              const childData = _self.transformEntityDatas(entityAssociationData, d.data.a_id);
              if(childData){
                return childData
              }
            }
            return [];
          },
          afterTreeRender: function(){
            jQuery("#"+_self.options.selector).find(".loading1").remove()
          }
      },
      this.treeData
    );
  },
  /**
   * 
   * @param {string} entity_name 
   * @param {string} base_entity_p_name 
   * @param {string} entity_id 
   * @returns Array of object
   */
  getEntityData(entity_name, base_entity_p_name, entity_id) {
    let entityData;
    sdpAjax({
      url: `/api/v3/${base_entity_p_name}/${entity_id}`, 
      type: "GET", // NO I18N
      async: false,
      success(resp) {
        entityData = resp[entity_name];
      },
      error() {
        entityData = undefined;
      },
    });
    return entityData;
  },
  /**
   * 
   * @param {string} base_entity_p_name 
   * @param {string} entity_id 
   * @returns entity datas
   * Function to get all associations datas
   */
  getAllAssociationData(base_entity_p_name, entity_id){
    let allData;
    sdpAjax({
      type: "GET", // NO I18N
      url: `/api/v3/${base_entity_p_name}/${entity_id}/get_all_associations`,
      async: false,
      success(resp){
        allData = resp.get_all_associations;
      }
    })
    return allData;
  },
   /**
   * 
   * @param {Object} treeData 
   * @param {Object} asociationData 
   * Function to transform the API data into tree data
   */
   transformEntityDatas(associationData, entity_name, entity_id){
    //check whether the entity doesn't has any association
    if(Object.keys(associationData.data).length === 0){
      return [];
    }
    const entities = [];
    const aData = associationData.data;
    const aMeta = associationData.metainfo;
    for(let a_key in aData){
      const curMeta = aMeta[a_key];
      const subTreeData = {
        name: curMeta.display_name,
        node_type: "sub_node", // NO I18N
        entity_name: entity_name,
        s_entity_name: curMeta.plural_name, 
        // s_entity_id: entity_id,
        // start_index: 1, 
        meta: curMeta,
        children: []
      }
      const curData = aData[a_key][a_key];
      //Assocaition entity construction
      let association_type = '';
      for(let i = 0; i< curData.length; i++){
        const curEntity = curData[i];
        association_type = curEntity.association_type && curEntity.association_type.name || '';
        const primaryField = curMeta.fields.primary_field;
        let primaryValue = '';
        if(primaryField) {
          primaryValue = this.getPrimaryFieldValue(curEntity, primaryField ,true);
          //Handling for when primary field values comes as null
          primaryValue = primaryValue === null ? '-' : primaryValue;
        }
        const title  = primaryValue || curEntity.destination.title || curEntity.destination.name || "-"
        //Additiona fields check
        const additional_fields = [];
        if(Object.keys(curMeta.fields.udf_fields.fields).length > 0){
          const fields = curMeta.fields.udf_fields.fields;
          for(let f_key in fields){
            let field_value = checkMetaValue(fields[f_key], curEntity.udf_fields[f_key])
            //TODO field type based values need to pass
            field_value = field_value ? field_value : '-'; 
            additional_fields.push({
              field: fields[f_key].display_name,
              value: field_value,
              type: fields[f_key].type,
            })
          }
        }
        let hasParent = false;
        if(curEntity.destination && curEntity.destination.entity.name === this.base_entity_name &&  curEntity.destination.id === this.base_entity_id){
          hasParent = true;
        }
        subTreeData.children.push({
          a_id: curEntity.destination.id,
          entity_p_name: curEntity.destination.entity.api_plural_name,
          entity_name: curEntity.destination.entity.name,
          source_entity: `${curEntity.destination.entity.name}_${curEntity.destination.id}`,
          has_parent: hasParent,
          name: title,
          udf_data: additional_fields
        })
      }
      subTreeData.name = association_type;
      //when has more row true add a dummy data in the node to fetch more data
      if(aData[a_key].list_info.has_more_rows){
      // if(true){
        subTreeData.children.push({
          name: translate("sdp.admin.resource.loadmore"), // NO I18N
          node_type: "dummy", // NO I18N
          entity_name: entity_name,
          s_entity_name: curMeta.plural_name, 
          s_entity_id: entity_id,
          start_index: 1
        })
      }
      // Only add the sub node if the sub node has childrens
      if(subTreeData.children.length > 0) {
        entities.push(subTreeData);
      }
    }
    return entities;
  },
  /**
   * 
   * @param {string} entity_name 
   * @param {string} entity_id 
   * @param {string} association_name 
   * @param {number} start_index 
   * @returns Object
   * Get more node (list) data 
   */
  getAssociationEntityList(entity_name, entity_id, association_name, start_index) {
    let associationData;
    let has_more_rows = false;
    let input_data = {list_info: { start_index: start_index + 100, row_count: 100} }
    input_data = sdpAjaxInputData(input_data);
    let list_info = {};
    sdpAjax({
      url: `/api/v3/${entity_name}/${entity_id}/${association_name}`, 
      data: input_data,
      type: "GET", // NO I18N
      async: false,
      success(resp) {
        associationData = resp[association_name];
        associationData = associationData.map((el) => {
          el.name = el.destination.title || el.destination.name;
          return el;
        });
        list_info = resp.list_info;
      },
      error() {
        associationData = [];
      },
    });
    return {
      associationData,
      list_info
    };
  },

  /**
   * 
   * @param {Array} entity_data fetched entity data
   * @param {object} meta meta data fo current entity
   * @param {object} list_info list info of fetch data..
   * @returns processed entity data for tree..
   * Method to process the fetched entity data into tree data. Used in the show more data.
   */
  processEntityData(entity_data, meta, list_info){
    const curData = entity_data;
    const curMeta = meta;
    const entityChildData = [];
      //Assocaition entity construction
      for(let i = 0; i< curData.length; i++){
        const curEntity = curData[i];
        //TODO get value from primary value
        const title  = curEntity.destination.title || curEntity.destination.name || '-';

        //Additiona fields check
        const additional_fields = [];
        if(Object.keys(curMeta.fields.udf_fields.fields).length > 0){
          const fields = curMeta.fields.udf_fields.fields;
          for(let f_key in fields){
            let field_value = checkMetaValue(fields[f_key], curEntity.udf_fields[f_key])
            //TODO field type based values need to pass
            field_value = field_value ? field_value : '-'; 
            additional_fields.push({
              field: fields[f_key].display_name,
              value: field_value,
              type: fields[f_key].type,
            })
          }
        }
        let hasParent = false;
        if(curEntity.destination && curEntity.destination.entity.name === this.base_entity_name &&  curEntity.destination.id === this.base_entity_id){
          hasParent = true;
        }
        entityChildData.push({
          a_id: curEntity.destination.id,
          entity_p_name: curEntity.destination.entity.api_plural_name,
          entity_name: curEntity.destination.entity.name,
          source_entity: `${curEntity.destination.entity.name}_${curEntity.destination.id}`,
          has_parent: hasParent,
          name: title,
          udf_data: additional_fields
        })
      }
      //when has more row true add a dummy data in the node to fetch more data
      if(list_info.has_more_rows){
        entityChildData.push({
          name: translate("sdp.admin.resource.loadmore"), // NO I18N
          node_type: "dummy", // NO I18N
          entity_name: entity_name,
          s_entity_name: curMeta.plural_name, 
          s_entity_id: entity_id,
          start_index: 1
        })
      }
      return entityChildData;
  },
  /**
   * 
   * @param {string} entity_data 
   * @param {string} field 
   * @param {boolean} isDestination 
   * @returns string
   * Get the primary field value
   */
  getPrimaryFieldValue(entity_data, field, isDestination){
    let fValue = isDestination ? entity_data.destination[field]: entity_data[field];
    if(!fValue){
      entity_data = isDestination ? entity_data.destination : entity_data;
      if(!jQuery.isEmptyObject(entity_data.udf_fields)){
        fValue = entity_data.udf_fields[field];
      } else if(!jQuery.isEmptyObject(entity_data.cm_fields)){
        fValue = entity_data.cm_fields[field];
      }
    }
    return fValue;
  }
};
/**
 * 
 * @param {Object} meta 
 * @param {Object} fvalue 
 * @returns Field value base on the meta type
 */
function checkMetaValue(meta, fvalue){
  let value = "";  // NO I18N
  switch(meta.type){
    case "lookup":  // NO I18N
      if(fvalue === null || fvalue === undefined) {
        value = "";  // NO I18N
        break;
      }
      if(typeof fvalue === "object") {  // NO I18N
        value = fvalue.name;
      }
      break;
    case "date": // NO I18N
    case "datetime":  // NO I18N
      value = fvalue && fvalue.display_value ? fvalue.display_value : "-";
      break;
    case "boolean":  // NO I18N
      if(fvalue === null || fvalue === undefined) {
        fvalue = value = false;
      } else {
        if (typeof fvalue == "string") {
          fvalue = value = !(fvalue == "false"); 	//No I18N
        } else {
          fvalue = value = !!fvalue;
        }
      }
      value = value ? translate("sdp.common.true") : translate("sdp.common.false");	//No I18N
      break;
    case "string":  // NO I18N
      if(meta.display_type === "Radio") {
        if(fvalue === null || fvalue === undefined || fvalue === "") {
          fvalue = value = null;
        } else {
          if(typeof fvalue === "object") {
            value = fvalue.name;
          } else {
            value = fvalue;
          }
        }
      }else {
        value = fvalue;
      }
      break;
    case "html":  // NO I18N
    default:
      if(fvalue === null || fvalue === undefined) {
        fvalue = value = null;
      } else {
        value = fvalue;
      }
  }
  return value;
}
