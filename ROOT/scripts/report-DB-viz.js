/* $Id$ */
/* Util classes */
// Text truncate Function for managing a constant size
function truncate(text, size){
	return (text.length > size+1)?text.substr(0,size)+'...':text;
}


function resetTimer(timer){
	if(timer){	
		clearTimeout(timer);
		timer = null;
	}
}
 
var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),//NO I18N
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');//NO I18N
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';//NO I18N
  nativeTextSupport = labelType == 'Native';//NO I18N
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
  
  

})(); 

empty	= function(){};

function CreateViz(vizContainerId, options){	
 	var defaults = {			
			onInit			:empty,
			levelsToShow	:1,
			// Node Styling and customisation options
			"Asset"			:{"$type" :"assetnode"	 , 	"$width": 220, "$height":200},									//NO I18N
			"Relation"		:{"$type" :"stroke-rect" , 	"$width": 200, "$height":200},									//NO I18N
			
			// Edge Styling
			"edgeColor"		:{ normal :"#4b79b9",  hover:"#4f7bb4", selected:"666666", disabled:"#adad00"},				//NO I18N
			
			// Containers and tip options
			"InfoContainer"	:{ id:"#ASSET_DESC_PANEL", hoverTime:1000, fadeTime:200, onShow: empty, onHide: empty },	//NO I18N	
			
			// Internal filter used to check if a relations has been processed
			filterRels		:true,
			
			// Data Feteching function
			onNodeClick		: empty,
			
			// Tip Custamisation function
			onShowTip		: empty,
			
			// Creation of node Element
			onCreateHtmlNode: empty,
			
			// Max and Min scaling for the chart
			maxScale	    :1.5,
			minScale 		:0.5
	};
	var chart 	 	= this; 
	
	vizContainerId 	= vizContainerId || "infovis";					//NO I18N
	
	options 	  	= $jit.util.extend(defaults, options);	 
	edgeColor 		= options.edgeColor;
	nodeType  		= {"asset"		: 0,  "relation"	: 1}		//NO I18N	
	infoProp  		= options.InfoContainer;
	
	$activeNode 	= null;
	
	$infoPanel 	  	= jQuery(infoProp.id);							// DOM id for the info panel of the viz. 
	$infoData		= { nodeId		:null, blocked		:false,	hoverTimer	:null, fadeTimer	:null };		 
	
	/*  Below are related functions for Showing Details of the product as Tips */
	$attrPanel = jQuery("#CI_ATTRIB_PANEL");						//NO I18N
	$attrInfo  = jQuery("#CI_ATTRIB_INFO");							//NO I18N
	
	$attrPanel.find(".ui-close").on('click', function(){					//NO I18N
												hideAttribInfo();
										});
	
	
	
	/*$morePanel  = jQuery("#CI_MORE_PANEL");							//NO I18N
	$morePanel.find(".ui-close").click(function(){					//NO I18N
												hideMoreInfo();
										});
	 
	*/
	
	var $panned 	  = false;		 
	var $pannedOffset = {x:0, y:0};
	
	var $hovered	  = false;
	var $hoverType    = 0;
	
	var $userActionFlags = { nodeClick:false, canvasPanned:false };
	
	/*
	***** Data Parsing Algorithm for Asset Relationship visualisation *****
	
		Parsing input data for the Asset relationship tree 
		A json request to the server will fetch all related assets and their 
		relationship name to the currently selected asset.
		
		Json request --> {Asset a} --> Related To name --> {Asset b}		
		data structure (Input to Javascript infoviz)
			[{
			 	id		:"$AssetID$",
				name	:"$AssetName$",
				data 	:{"$More asset related data$"}
			 }]
		The data that is coming in over a period of time based on the users interaction will be parsed and sent into a Hash map for storage and reference.
	*/
	
	var INPUT_ASSET_LIST	= $A(), 													// List of all assets currently processed in the viz.
	 	ROOT_ID				= null,														// Node if of the asset that has come in first.
	 	MASTER_TREE			= $H({'tree': []}),					//NO I18N				// Hash tree for the Asset input for the Viz.	
	 	MOREEDGELIST		= $H({'edges': []}), 				//NO I18N				// List of additional edges on the order that the data has been processed
		ASSET_REL_LIST	   	= $H(),														// All asset relations in the view and list of all assets in view
		ALL_REL_LIST 		= $H(),														// All node relations in the view
		RELATION_HASH_LIST	= $H();														// Relation ids processed till now.
		INCOMING_DATA		= $A();														// Json feed of incoming data
		NODE_CLICKED 		= $H();
	
	// The raw data coming from the server is converted into a list of assets and relations
	function ProcessRelations(data, fromId){
		// A Temporary view list for the current data being processed 
		try{
			//INCOMING_DATA = $jit.util.extend(data, INCOMING_DATA);
			$A(data)
				.each(function(info){ 
					   INCOMING_DATA.push(info);
					   if(info.data && !(RELATION_HASH_LIST.get(info.data.relId))){	 
							ConvertToTree(SplitData(info, fromId));
							if(options.filterRels) RELATION_HASH_LIST.set(info.data.relId, 1);
					   }
				 });  
		}catch(err){

		}
	}
	
	// The Jit framework uses a single node hash name for any unique incoming data for a particular type of graph
	// This function is a utility function to generate a temp unique id for and incoming asset...
	// Currently the function will return the actual data that comes in... This will be modified later if a requirement for multiple canvases with same data is to be created
	function getNodeId(id){
		//return id+"_"+vizContainerId;
		return id;
	}
	
	function getRelationId(info){
		return getNodeId(info.fromId)+'_'+info.data.relTypeId;
	}
	
	// Spliting the Asset object and its relations as two seperate nodes
	function SplitData(info, fromId){ 
		var relNode 			= {    id		 : getRelationId(info),  //NO I18N
									   relId	 : info.data.relId, 
									   relTypeId : info.data.relTypeId,
									   name		 : info.data.relation,
									   fromId	 : getNodeId(info.fromId),
									   data		 : {}, 
									   children	 : []
								  };	
		
		relNode.data 			= $jit.util.extend(relNode.data, options.Relation);
		relNode.data.objType    = nodeType.relation;

		var assetNode			= {id		: getNodeId(info.id),			   
								   name		: info.name,
								   relId	: info.data.relId, 
								   fromId	: relNode.id,								   
								   data		: {assetId: info.id}, 
								   children : []};
								   
								   
		assetNode.data 			= $jit.util.merge(assetNode.data, options.Asset, info.data);
		assetNode.data.objType  = nodeType.asset;
		
		if(INPUT_ASSET_LIST.length) 
			AssetMapping(info.fromId, info.id);										
		 

		return [relNode, assetNode];
	} 
	
	// Converting the list to a tree than can be used to feed the Viz.
	function ConvertToTree(relations){
			var tree		   = MASTER_TREE.get('tree');//NO I18N
				
			$A(relations)
				.each(function(rel){					
					if(!INPUT_ASSET_LIST.length) ROOT_ID = rel.id;  
						if(ALL_REL_LIST.get(rel.id) && !rel.data.objType){ 
							var edges 		 = MOREEDGELIST.get(rel.fromId);
							if(!edges) edges = MOREEDGELIST.set(rel.fromId, []);							
							edges.push(rel.id);													 
						}
						else if(INPUT_ASSET_LIST.length){ 
							  var temp 	     = MASTER_TREE.get(rel.fromId);
							  if(!temp) temp = MASTER_TREE.set(rel.fromId, []);
							  
						 	 temp.push(rel); 
						 	 tree.push(rel); 
						} 		
						if(INPUT_ASSET_LIST.length>1) 
						 	 NodeMapping(rel.fromId, rel.id);
						 
						INPUT_ASSET_LIST.push(rel);  			 
				});	 
			//console.clear();
			//console.log(MASTER_TREE.toSource()); 
	}	 
	// Cross Mapping relations with assets in the view
	function AssetMapping(fromId, id){
		var asset 		 	= ASSET_REL_LIST.get(fromId);
		if(!asset) asset    = ASSET_REL_LIST.set(fromId, []);							
		asset.push(id);													
			
		var asset 		    = ASSET_REL_LIST.get(id);
		if(!asset) asset    = ASSET_REL_LIST.set(id, []);							
		asset.push(fromId);	
	}
	
	// Cross Mapping Nodes with each other in the view
	function NodeMapping(fromId, id){
		var nodeId 		 	  = ALL_REL_LIST.get(fromId);
		if(!nodeId) nodeId    = ALL_REL_LIST.set(fromId, {parents:$H(), children:$H()});							
			nodeId.children.set(id, 1);													
			
		var nodeId 		      = ALL_REL_LIST.get(id);
		if(!nodeId) nodeId    = ALL_REL_LIST.set(id, 	 {parents:$H(), children:$H()});							
			nodeId.parents.set(fromId, 1);
	} 
	
	function getJsonNode(nodeId){ 	
		nodeId = getNodeId(nodeId);
		var _children 	= MASTER_TREE.get(nodeId);
		$A(_children).each(function(childnode){
				childnode.children = MASTER_TREE.get(childnode.id);
		});
				
		return (_children)?{id:nodeId, children: _children}:null;
	}
	
	
	function plotArrow(pos, dim, ctx){
		 var  c1x = pos.x, 
			  c1y = pos.y, 
			  c2x = c1x   - dim, 
			  c2y = pos.y + dim, 
			  c3x = c1x   - dim, 
			  c3y = pos.y - dim;
			ctx.beginPath();
			ctx.moveTo(c1x, c1y);
			ctx.lineTo(c2x, c2y);
			ctx.lineTo(c3x, c3y);
			ctx.closePath();
		  ctx.fill(); 
	}
	
	// Edge plotting Function 
	function plotEdges(nodeFrom, nodeTo, orn){				
			if(nodeFrom && nodeTo){
				var toColId = nodeTo.name,fromColId = nodeFrom.name;
				//console.log("toColId:"+toColId);
				//console.log("fromColId:"+fromColId);
				//console.log(nodeTo.data.objType);
				
				orn = orn || "left";//NO I18N
				var ctx 	 = st.canvas.getCtx(),
					rel 	 = nodeFrom._depth < nodeTo._depth,
					begin 	 = st.geom.getEdge(nodeFrom, 'begin', orn),//NO I18N
					end		 = st.geom.getEdge(nodeTo  , 'end',   orn); //NO I18N
					dim 	 = (end.x - begin.x);
				//console.log(begin);
				if(nodeFrom.data.objType){
					begin.x -= 80;
				}
				if(!rel){	
					end.x += nodeTo.getData("width") //NO I18N 
				}
				if(nodeFrom.data.objType) {
					begin.y -= nodeFrom.getData('height')/2;//NO I18N
				}
				else {
					begin.y -= nodeFrom.getData('height')/2;//NO I18N
				}
				if(!nodeTo.data.objType) {
					end.y -= nodeTo.getData('height')/2;//NO I18N
				}
				else {
					end.y -= nodeFrom.getData('height')/2;//NO I18N
				}	
				var shift=0
				if(nodeTo.data.objType && !nodeFrom.data.objType) {
					var colId = nodeFrom.data.columns[toColId].colId;
					shift=-45
					//console.log(toColId);
					for(var colName in  nodeFrom.data.columns) {
						shift +=31;
						if(toColId == colName) break;
					}
					shift +=14;
					//console.log('shift+++'+shift);
					//shift=-45+(6*26.64)
					//shift=-45+(6*31);
				}
				ctx.beginPath();
				ctx.strokeStyle = edgeColor.normal;
				ctx.fillStyle 	= edgeColor.normal;
				ctx.lineWidth   = 1;				
				drawArrow		= false;
				
				if($hovered && !st.busy){ 
					//if(!$hoverType){ 
						if(nodeFrom.getData("hover") && nodeTo.getData("hover")){//NO I18N
							var val = nodeTo.getData("hover") - nodeFrom.getData("hover");//NO I18N
							//console.log(nodeFrom.getData("hover")+" - "+nodeTo.getData("hover") +"= "+val);
							if(val == 1){
								ctx.strokeStyle = edgeColor.hover;
								ctx.fillStyle 	= edgeColor.hover;
								ctx.lineWidth   = 2;
								drawArrow		= true;
							} 
						} 
					//}
					/*
					else if(nodeFrom.getData("hover") || nodeTo.getData("hover")){ //NO I18N
						ctx.strokeStyle = edgeColor.hover;
						ctx.fillStyle 	= edgeColor.hover;						
						ctx.lineWidth   = 2;
						drawArrow		= true;
					}  */
				}
				/*
				else if( nodeFrom.selected && nodeTo.selected ) {
					ctx.strokeStyle = edgeColor.selected;
					ctx.lineWidth   = 2;
				}*/
				
				ctx.moveTo(begin.x, begin.y+shift);		 
		 		if(!rel){	 
					dimy  = end.y - begin.y;
					// Current node depth is higher than the connecting node					
					ctx.bezierCurveTo(begin.x - dim/4 , begin.y + dimy/4, end.x - dim/2, end.y, end.x, end.y);			 				
				}else{				 					
					ctx.bezierCurveTo(begin.x + dim , begin.y+shift , end.x-dim, end.y, end.x, end.y );		 					
				}
				 
				ctx.stroke(); 
				
				if(nodeFrom.data.objType && drawArrow){ 
						// invert edge direction 
						plotArrow(end, (rel)?5:-5, ctx);
				}
				
				
		}
	}
	
	$jit.ST.Plot.EdgeTypes.implement({
		'groupedbezier': {//NO I18N
			   'render': function(adj, canvas) {//NO I18N
				 var orn = this.getOrientation(adj),
					 nodeFrom = adj.nodeFrom,
					 nodeTo = adj.nodeTo;
					 plotEdges(nodeFrom, nodeTo, orn); 
			   }
			}
	});
	
	$jit.ST.Plot.NodeTypes.implement({
      'stroke-rect': {//NO I18N
        'render': function(node, canvas) {//NO I18N
          var width  = node.getData('width'),//NO I18N
              height = node.getData('height'),//NO I18N
              pos 	= this.getAlignedPos(node.pos.getc(true), width, height),
		from = {x:pos.x,y:(pos.y)},
              to   = {x:(pos.x+width/2) + 20, y:(pos.y)}; 
              /*from = {x:pos.x,y:(pos.y+height/2)},
              to   = {x:(pos.x+width/2)+20, y:(pos.y+height/2)}; */
		  
		  //canvas.getCtx().strokeStyle = node.getData("color");		  
          this.edgeHelper.line.render(from, to, canvas);
			
		  // Plotting Additional Edges connecting various nodes
		  var edges = MOREEDGELIST.get(node.id);
		  if(edges){
		  	$A(edges).each(function(n){
				nodeFrom = node;
				nodeTo   = st.graph.getNode(n);		
				plotEdges(nodeFrom, nodeTo);			
			});
		  }
        }
      },
	  'assetnode':{//NO I18N
			'render': function(node, canvas) {//NO I18N
				  var width = node.getData('width'),//NO I18N
					  height = node.getData('height'),//NO I18N
					  pos = this.getAlignedPos(node.pos.getc(true), width, height);
				} 
	   }
    });

	// Function to create the Asset label HTML Dom
	CreateAssetHTML = function(label, node){
			//var criticalClass = (node.data.ciCritical) ? 	" node-critical":"";//NO I18N
			//var attrClass     = (node.data.ciAttribute)? 	" node-relattr" :"";//NO I18N
			
			
			var slideButton = document.createElement("img");
			slideButton.name = "Slide";
			slideButton.src = "../images/slideout.png";
			slideButton.style.cssText = "float:right;width:8%;height:10%;cursor:pointer;";//NO I18N
			slideButton.alt = "Slide";//NO I18N
			slideButton.slideToggle = false;
			slideButton.onclick = function(){
			jQuery('.node-assetContainer').each(function(){jQuery(this).css('z-index','99');});//NO I18N
			jQuery('.node-assetContainer').animate({left: '0%'},"slow");//NO I18N
			jQuery('[name="Slide"]').each(function(){jQuery(this).attr('src', "../images/slideout.png");});
			jQuery('[name="Slide"]').each(function(){jQuery(this).attr('slideToggle',false);});
			if(this.slideToggle == false)
			{
				this.slideToggle = true;
				slideButton.src = "../images/slidein.png";
				jQuery(this.parentNode.parentNode.parentNode).animate({left: '+=30'},"slow");//NO I18N
				jQuery(this.parentNode.parentNode.parentNode.parentNode).css('z-index','100');//NO I18N
			}
			else
			{
				this.slideToggle = false;
				slideButton.src = "../images/slideout.png";
				jQuery(this.parentNode.parentNode.parentNode.parentNode).css('z-index','99');//NO I18N
				jQuery(this.parentNode.parentNode.parentNode).animate({left: '0%'},"slow");//NO I18N
			}
			}
  			nameTruncateVal   = 15;//(node.data.ciIncident)?12:15; 
			//var ciName		  = '<div class="jit-ciname header">'+node.name+'</div>',fks=node.data.fks,uk=node.data.uk,pk=node.data.pk;
			var CINAME = document.createElement("b");
			var TXT = document.createTextNode(node.name); 
			CINAME.appendChild(TXT);
			CINAME.onclick = function(){jQuery(this).next().trigger('click');};
			CINAME.style.cssText = "cursor:pointer;font-size:110%;color:white;";//NO I18N
			jQuery(CINAME).on('mouseover', function(){
					var tdes = node.data.table_desc;
					if(tdes == null)
						tdes = node.name ;
					if(localTableDescriptions[node.name] != null)
						tdes = localTableDescriptions[node.name];
					jQuery('#hoveringTooltip').show();
					jQuery('#hoveringTooltip').html(tdes);	//No I18N
					jQuery('#hoveringTooltip').css({
		             "top" : jQuery(this).offset().top + 28,	//No I18N
		             "left" : jQuery(this).offset().left + 10,	//No I18N
					 "z-index" : 1000000 //NO I18N
					});


				});
				jQuery(CINAME).on('mouseleave', function(){jQuery('#hoveringTooltip').hide();});
			var ciName		  = jQuery('<div class="jit-ciname header ui-curve-all" />').append(CINAME).append(slideButton),fks=node.data.fks,uk=node.data.uk,pk=node.data.pk;
			var columns=jQuery('<div/>');
			var pkColumn = node.data.pk[0];
			var pkColObj = node.data.columns[pkColumn];
			if(pkColumn) {
				var columnName = pkColumn;
				var isFKCol = fks[columnName] == undefined ? false:true;
				var colData = pkColObj,colId=colData.colId;
				var desc = colData.description;
				var colDataType = colData.datatype.indexOf('varchar') != -1? 'text' : colData.datatype.indexOf('bigint') != -1 && colData.isDateTime ? 'date' : colData.datatype.indexOf('BOOLEAN') != -1 ? 'boolean' :'numbers';//NO I18N
				var columnObj = jQuery('<div isFK='+isFKCol+' description=\"'+desc+'\" colName='+columnName+' colId='+colId+' tableId='+node.id+'>').addClass('jit-ciname column').addClass('DB-'+colDataType).append('<span class='+colDataType+' id='+colId+'><em>&nbsp;&nbsp;</em><span class=\'txtAln\'>'+columnName+'</span><b style=\"vertical-align: middle;font-size:150%;color:red;\" >*<b></span>'); 
				columnObj = columnObj.addClass('clickable');
				
				columnObj = columnObj.addClass('clickable').on('click', function(e){
						$activeNode = node.id;
						NODE_CLICKED.set(node.id, 1);	
						//options.onColumnClick(jQuery(this));
						var clickedColName  = jQuery(this).attr('colName');
						//console.log(clickedColName);
						//console.log(node.data.columns)
						node.data.columns[clickedColName].isClicked = true;
						node.data.columns[clickedColName].isPK = true;
						//console.log(node.data.columns[clickedColName])
						//console.log(node.data.columns[clickedColName])
						//console.log(node.anySubnode())
						if(!node.anySubnode()){
							st.onClick(node.id); 
						}else{
							options.onNodeClick(node.id);
						}
						e.stopPropagation();
					});
				var flag = true;
				if(hiddenColumns[node.name] != null)
					if(jQuery.inArray(columnName,hiddenColumns[node.name]) != -1 )
						flag = false;
				if(flag == true)		
					columns.append(columnObj);
			}
			for(var key in node.data.columns) {
				if(pkColumn == key) continue;
				var columnName = key;
				var isFKCol = fks[columnName] == undefined ? false:true;
				var colData = node.data.columns[key],colId=colData.colId;
				var desc = colData.description;
				var colDataType = colData.datatype.indexOf('CHAR') != -1? 'text' : colData.datatype.indexOf('BIGINT') != -1 && colData.isDateTime ? 'date' : colData.datatype.indexOf('BOOLEAN') != -1 ? 'boolean':'numbers';//NO I18N
				var columnObj = jQuery('<div isFK='+isFKCol+' description=\"'+desc+'\" colName='+columnName+' colId='+colId+' tableId='+node.id+'>').addClass('jit-ciname column').addClass('DB-'+colDataType).append('<span class='+colDataType+' id='+colId+' ><em>&nbsp;&nbsp;</em><span class=\'txtAln\' >'+columnName+'</span></span>');//NO I18N				
				if(isFKCol) {
					//columnObj = columnObj.addClass('clickable');
					columnObj = columnObj.addClass('clickable').on('click', function(e){
						$activeNode = node.id;
						NODE_CLICKED.set(node.id, 1);	
						//options.onColumnClick(jQuery(this));
						var clickedColName  = jQuery(this).attr('colName');
						//console.log(clickedColName);
						//console.log(node.data.columns)
						node.data.columns[clickedColName].isClicked = true;
						node.data.columns[clickedColName].isFK = true;
						//console.log(node.data.columns[clickedColName])
						//console.log(node.data.columns[clickedColName])
						//console.log(node.anySubnode())
						if(!node.anySubnode()){
							st.onClick(node.id); 
						}else{
							options.onNodeClick(node.id);
						}
						e.stopPropagation();
					});				
				}
				else
					columnObj = columnObj.css('display','none');//NO I18N
				var flag = true;
				if(hiddenColumns[node.name] != null)
					if(jQuery.inArray(columnName,hiddenColumns[node.name]) != -1 )
						flag = false;
				if(flag == true)		
					columns.append(columnObj);
				//columns.append('<div class="jit-ciname column"><span class='+colDataType+' id='+colId+'><em>&nbsp;&nbsp;</em>&nbsp;'+columnName+'<span></div>');
			}
			var buttons		  = '';//'<span class="ui-bt-expand" ><span class="expand_icon"></span></span>'; 		
			
			var visiblityToggle = false;
		
			
			var expandButton = document.createElement("img");
			expandButton.src = "/images/more.png";
			expandButton.name = "Expand";
			expandButton.alt = "Expand";//NO I18N
			expandButton.style.cssText = "cursor:pointer;width:20%;height:6px; padding:4px;";//NO I18N
			expandButton.onclick = function(){
			if(visiblityToggle == false)
			{	
				visiblityToggle = true;
				jQuery(this.siblings()[1]).find('.jit-ciname.column:not(.clickable)').each(function(){this.style.display='block';});
			}
			else
			{
				visiblityToggle = false;
				jQuery(this.siblings()[1]).find('.jit-ciname.column:not(.clickable)').each(function(){this.style.display='none';});
			}};
			
			var jit_node = jQuery('<div class="jit-assetnode" />').append(ciName).append(columns);
			if(jQuery(jit_node).find('.jit-ciname.column').not('.clickable').length > 0)
				jit_node.append(expandButton);
			//var container = jQuery('<div title="'+node.name+'" />')//NO I18N	
			var container = jQuery('<div />')//NO I18N
				.addClass('node-assetContainer').attr('style','transition:margin 3s ease-in-out')//NO I18N
				//.append('<img src="'+node.data.imageIcon+'" class="icon" />')//NO I18N
				//.append('<img src="/images/exclamation.png" class="info_critical" />')//NO I18N
				.append(jit_node)//NO I18N 
				.on('click', function(e){ 
					$activeNode = node.id;
					NODE_CLICKED.set(node.id, 1);					
					//console.log(node.anySubnode());
					//if(node.name="Expand")
					//{console.log('expand');}	
					if(!node.anySubnode()){
						st.onClick(node.id); 
					}else{
						options.onNodeClick(node.id);
					}
				})
				.appendTo(label);
			  
			  
			  jQuery(label)
					.addClass("assetElement");									//NO I18N 
				
			 options.onCreateHtmlNode(label, container, node.data);
	}
	
	// Function to Create the Relation Html
	CreateRelationHTML = function(label, node){
				label.className = 'labelElement';												//NO I18N
				label.innerHTML	= '<div class="jit-relnode">'+truncate(node.name, 15)+'</div>';	//NO I18N 
	} 
	
	var loadSave = false;
	
	options.insertData = function(nodeId, rawData, onComplete){
			//console.log('testing');
	       		//console.log(rawData);	
			if(this.isLoadingData() || (this.currentNode() == nodeId)){	   
			 	//var assetId 	= this.getAssetId(nodeId),
				var result  	= this.ProcessData(nodeId, rawData);   
	       			//console.log(result);	
				if(result){		 
					if(onComplete){
						onComplete.onComplete(nodeId, result);  
					}
					else{
						st.addSubtree(result, 'animate'); //NO I18N
						//st.onClick(nodeId);	
					}						
				}
				this.clearActiveNode();
			}
			if(onComplete)
				onComplete.onComplete();  				
	};
	
	options.isLoadingData = function(){
		return loadSave;
	};
	
	options.currentNode   = function(){ 
		return $activeNode;
	};
	
	options.ProcessData   = function(nodeId, data){
		ProcessRelations(data);
		return getJsonNode(nodeId);
	};
	
	options.clearActiveNode	= function(){
		$activeNode = null;	
	}
	
	options.getAssetId      = function(nodeId){
			return st.graph.getNode(nodeId).data.assetId;
	};
	
	options.hasNode		   = function(nodeId){
		return st.graph.hasNode(nodeId);
	}; 
	
	options.getNode		   = function(nodeId){
		return st.graph.getNode(nodeId);
	};
	
	// Getter method for getting all the assets in the graph
	options.getAssetsInView = function(){
		return ASSET_REL_LIST.keys();	
	};
	// Getter method for getting all the connected assets
	options.getAssetsInView = function(assetId){  
		return ASSET_REL_LIST.get(assetId);
	};
	
    //Asset Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
        //id of viz container element
        injectInto		: vizContainerId,
		orientation		: 'left',		  //NO I18N
		//set duration for the animation
        duration   		: 500,
		offsetX    		: 0,
		offsetY    		: 0,
		hideLabels		: false,
		constrained		: false,
        //set animation transition type
        transition		: $jit.Trans.Quart.easeInOut,
		levelsToShow	: 2, 
        //set distance between node and its children
        levelDistance	: 30,
		offsetBase      : 30,
        //enable panning
        Navigation: {
          enable:true,
          panning:true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: { 
            type: 'none',				//NO I18N
            color: edgeColor.normal,	//NO I18N
            overridable: true,
			lineWidth: 1
        },
		// Setting Edge Styles
        Edge: {
            type: 'groupedbezier',		//NO I18N
            overridable: true,
			lineWidth: 1,
			color:edgeColor.normal  	//NO I18N
        },
		
		Events:{
			enable:true,
			onDragStart: function(node, eventInfo, e){				
				 this.mPressed = true; 
				 
				 this.pos = eventInfo.getPos();
				 var canvas = st.canvas,
					ox = canvas.translateOffsetX,
					oy = canvas.translateOffsetY,
					sx = canvas.scaleOffsetX,
					sy = canvas.scaleOffsetY;
				this.pos.x *= sx;
				this.pos.x += ox;
				this.pos.y *= sy;
				this.pos.y += oy; 
			},
			onMouseMove: function(node, eventInfo, e){
				 if(!this.mPressed) return;
				
				var thispos = this.pos, 
					currentPos = eventInfo.getPos(),
					canvas = st.canvas,
					ox = canvas.translateOffsetX,
					oy = canvas.translateOffsetY,
					sx = canvas.scaleOffsetX,
					sy = canvas.scaleOffsetY;
				currentPos.x *= sx;
				currentPos.y *= sy;
				currentPos.x += ox;
				currentPos.y += oy;
				var x = currentPos.x - thispos.x,
					y = currentPos.y - thispos.y;
					 
				st.config.offsetX += x * 1/sx;
				st.config.offsetY += y * 1/sy;				
				this.pos = currentPos; 
				st.canvas.translate(x * 1/sx, y * 1/sy);	
				$panned = true;
			},
			onClick: function(node, eventInfo, e){
				 this.mPressed = false;	  
			},
			onMouseWheel: function(delta, e){  
				var val = 30 / 1000,
					ans = 1 + delta * val;
				scaleCanvas(ans, ans);				
				e.preventDefault();
			}
		},
        
        onBeforeCompute: function(node){
            //Log.write("loading " + node.name);
			//hideAttribInfo();
			//hideMoreInfo();
			hideTip();
			//console.clear();
			$('Loading').show(); 
        },
        
        onAfterCompute: function(){
  			$('Loading').hide();
  			jQuery('span[id*="c_"]').on('mouseover', function(){
					var desk = jQuery(this.parentNode).attr("description") ; 
					if(desk == "undefined")
						desk = jQuery(this.parentNode).attr("colName");
					var tbl_Name = this.parentNode.parentNode.parentNode.children[0].children[0].innerHTML ;
					if(localColumnDescriptions[tbl_Name] != null)
						if(localColumnDescriptions[tbl_Name][jQuery(this.parentNode).attr('colName')] != null)
							desk = localColumnDescriptions[tbl_Name][jQuery(this.parentNode).attr('colName')];
					jQuery('#hoveringTooltip').show();
					jQuery('#hoveringTooltip').html(desk);	//No I18N
					jQuery('#hoveringTooltip').css({
		             "top" : jQuery(this).offset().top + 28,	//No I18N
		             "left" : jQuery(this).offset().left + 10,	//No I18N
					 "z-index" : 1000000 //NO I18N
					});

				});
				jQuery('span[id*="c_"]').on('mouseleave', function(){jQuery('#hoveringTooltip').hide();});
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            label.id 		= node.id;  
		
			if(!node.data.objType)
				CreateAssetHTML(label, node);				
			else
				CreateRelationHTML(label, node); 
			
			//if(scaleOffsetX != 1) 
			scaleLabel(node, label);
		
			jQuery(label)
				.on('mouseover', function(e){
					  node.setData("hover", 3);									//NO I18N
					  $hovered   = true;			
					  $hoverType = node.data.objType;
					  
					  var parentList   = [];
					  var childrenList = [];
					  
					  if(!$hoverType){  
						 	if(ALL_REL_LIST.get(node.id)) 
							ALL_REL_LIST.get(node.id).parents.keys().each(function(parent_Id){
									parentList.push(parent_Id); 
									ALL_REL_LIST.get(parent_Id).parents.keys().each(function(parentLVL2_Id){
										parentList.push(parentLVL2_Id); 													
									});
							});
							
							parentList.each(function(nodeId){ 
									nodeObj = st.graph.getNode(nodeId);
									nodeObj.setData("hover", 1 + nodeObj.data.objType); //NO I18N
							})
							//node.setData("hover", 3);									//NO I18N
							// Setting Hover status for children Nodes
							if(ALL_REL_LIST.get(node.id)) 
							ALL_REL_LIST.get(node.id).children.keys().each(function(child_Id){
									childrenList.push(child_Id); 
									ALL_REL_LIST.get(child_Id).children.keys().each(function(childLVL2_Id){
										childrenList.push(childLVL2_Id); 													
									});
							});
							
							childrenList.each(function(nodeId){ 
									nodeObj = st.graph.getNode(nodeId);
									nodeObj.setData("hover", 5 - nodeObj.data.objType);	//NO I18N
							});								
					  }else{
						  if(ALL_REL_LIST.get(node.id)) 
							ALL_REL_LIST.get(node.id).parents.keys().each(function(parent_Id){
									parentList.push(parent_Id);
								    parentNode = st.graph.getNode(parent_Id);
									parentNode.setData("hover", 2);		//NO I18N				
							});
							if(ALL_REL_LIST.get(node.id)) 
							ALL_REL_LIST.get(node.id).children.keys().each(function(child_Id){ 
									childrenList.push(child_Id);
									childNode = st.graph.getNode(child_Id); 
									childNode.setData("hover", 4);//NO I18N
							});
					  }
					  this.hoverList = parentList.concat(childrenList);
					  st.plot();
				})
			   .on('mouseout', function(e){
					  node.setData("hover", 0);		//NO I18N									
					  $hovered = false;		
					  if(this.hoverList){ 
						  this.hoverList.each(function(nodeId){
									st.graph.getNode(nodeId).setData("hover", 0);//NO I18N
						  });
					  }
					  st.plot();								
				});
        },
		//Add a request method for requesting on-demand json trees.   
		//This method gets called when a node  
		//is clicked and its subtree has a smaller depth  
		//than the one specified by the levelsToShow parameter.  
		//In that case a subtree is requested and is added to the dataset.  
		//This method is asynchronous, so you can make an Ajax request for that  
		//subtree and then handle it to the onComplete callback.  
		//Here we just use a client-side tree generator (the getTree function).  
		request	  		: options.onNodeClick,		
		ProcessData		: options.ProcessData,		
		getAssetId		: options.getAssetId,		
		hasNode			: options.hasNode,		
		isLoadingData	: options.isLoadingData,
		currentNode 	: options.currentNode,
		clearActiveNode	: options.clearActiveNode,	
		// Getter method for getting all the assets in the graph
		getAssetsInView : options.getAssetsInView,
		// Getter method for getting all the connected assets
		getConnectedAssets : options.getConnectedAssets,		
		insertData 		: options.insertData, 
		getNode			: options.getNode,
		       
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){ 
            //add some color to the nodes in the path between the
            //root node and the selected node.
				if($hovered && node.getData("hover") && !st.busy){//NO I18N
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).addClassName("node-active");//NO I18N
						$(nodeLabel).removeClassName("node-adj");//NO I18N
						if(node.data.objType){
							node.data.$color 	 = edgeColor.hover;
							node.data.$lineWidth = 2;						
						} 
					}
				}
				/*
				else if (node.selected) {  
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).addClassName("node-active");
						$(nodeLabel).removeClassName("node-adj");
						
						node.data.$color 	 = edgeColor.selected;
						node.data.$lineWidth = 2;
						
						node.eachAdjacency(function(adj) { 
							var adjNodeLabel = st.labels.getLabel(adj.nodeTo.id);						
							if(adjNodeLabel){
								$(adjNodeLabel).addClassName("node-adj");	
								adj.nodeTo.data.$color 	   = edgeColor.selected;
								adj.nodeTo.data.$lineWidth = 2;
							} 
						});   
					}
					
				}*/
				else {
					delete node.data.$color;
					delete node.data.$lineWidth;
					//if the node belongs to the last plotted level
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).removeClassName("node-active");//NO I18N
						$(nodeLabel).removeClassName("node-adj");//NO I18N
					} 
				}
			 
        },
		
		onAfterPlotNode: function(node){
			
		}, 
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
 
        },
		onAfterPlotLine: function(adj){
 
		}
    });
	
	var initNodeList = options.saveList||[];
	var notInTree    = [];
	var loadSaveData = function(type){
		if(initNodeList.length){
			var index 	= 0;
			var nodeId 	= getNodeId(initNodeList[index]);
			if(st.graph.hasNode(nodeId)){ 
				 if(type){
						st.onClick(nodeId, {onComplete:function(){ 
														initNodeList.splice(index, 1);
														loadSaveData(type);
												}});
				 }else{
						st.select(nodeId);
						initNodeList.splice(index, 1);
						loadSaveData(type);
				 }
			}			
			else{
				notInTree.push(initNodeList[index]);
				initNodeList.splice(index, 1);
			} 
		}
		return; 
		/*st.onClick(st.root, {onComplete:function(){
				MASTER_TREE.each(function(node){
					if(node.key != "tree" && node.key != ROOT_ID){
							console.log(node.key);
							var n = getJsonNode(node.key);
							if(options.loadAnimated)
								st.onClick(node.key);
							else
								st.addSubtree(n, 'replot');					//NO I18N 
								//st.select(pair.key);
					}
					 
				});					 								
		}});*/
		
	}
	
	var init = function(){ 	  
		if(options.initFeed){
			// Process the feed that is coming in 
			ProcessRelations(options.initFeed);	 			  			
			// Load the Primary node onto the Tree
			st.loadJSON(MASTER_TREE.get(ROOT_ID));	  			
			//compute node positions and layout
			st.compute();
			//optional: make a translation of the tree
			st.geom.translate(new $jit.Complex(-200, 0), "current");//NO I18N 
			//emulate a click on the root node.
			//st.config.duration = 100;
			$activeNode = st.root;
			
			st.onClick(st.root,  {onComplete:function(){	
										loadSave = true;
 										loadSaveData(options.loadAnimated);	 
										loadSave = false;
								 }}); 
			
		
					 
			//st.config.duration = 500; 
		}  
		if(options.onInit)
			options.onInit(st); 
	};
	init();
    

 	$infoPanel
		.on('mouseover', function(e){
				if($infoData.fadeTimer)
					 resetTimer($infoData.fadeTimer); 
				if($infoData.hoverTimer)
					 resetTimer($infoData.hoverTimer);		
			})
		.on('mouseout', function(e){
				if($infoData.blocked)	  	 return;
				
				if($infoData.fadeTimer){
					resetTimer($infoData.fadeTimer);
				}				
				if($infoData.hoverTimer){
					resetTimer($infoData.hoverTimer);
				}	
				
				$infoData.fadeTimer = setTimeout(
											function(){
												resetTimer($infoData.fadeTimer);
												hideTip();
											}, infoProp.fadeTime		 
										);
			});
	
	/* Display attribute information */
	function showAttribInfo(node){
		if(st.busy) 					return; 
		
		hideMoreInfo();
		
		var nodeElement 		= st.labels.getLabel(node.id);
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ node.data.ciAttribute[x]+"</li>");//NO I18N
		}
		
		var cssConfig 			= {		
										left	: 	parseInt(nodeElement.style.left),
										top		:	parseInt(nodeElement.style.top)
								  };
		
		$attrPanel.css(cssConfig).show(300);
	}
	
	function hideAttribInfo(){
		if($attrPanel)
			$attrPanel.hide();
	}

	/* Display more information */
	function showMoreInfo(node){
		if(st.busy) 					return; 
		
		hideAttribInfo();
		
		var nodeElement 		= st.labels.getLabel(node.id);
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ node.data.ciAttribute[x]+"</li>");//NO I18N
		}
		
		var cssConfig 			= {		
										left	: 	parseInt(nodeElement.style.left),
										top		:	parseInt(nodeElement.style.top)
								  };
		
		//$morePanel.css(cssConfig).show(300);
	}
	/*
	function hideMoreInfo(){
		if($morePanel)
			$morePanel.hide();
	}*/
	
	/*	Displays available information about an Asset-Node in a DOM panel */ 
	function showTip(node, block){
		try{
		if(st.busy) 					return;
		
		// Check if the current tip is already shown
		if($infoData.nodeId == node.id)	return;
		
		if(block)						$infoData.blocked = true;
		 
		$infoData.nodeId 		= node.id;
		
		var nodeElement 		= jQuery(st.labels.getLabel(node.id));
		
		$infoPanel.find(".desc_title")//NO I18N
					.html("<img src='"+node.data.imageIcon+"' width='48px' height='48px'  />"+  //NO I18N
						  "<h2>"+node.data.ciType+"</h2>" +//NO I18N
						  "<h3>"+node.name+"</h3>");//NO I18N
		
		var incidentDisplay = $infoPanel.find(".desc_moreinfo");//NO I18N
			incidentDisplay.html("");
			
		 
		
		var nodePos = nodeElement.position();
		var bottom  = nodePos.top+nodeElement.height();
		
		
		//console.log(bottom+" "+ jQuery(document).height());
		
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ node.data.ciAttribute[x]+"</li>");//NO I18N
		}
		
		var cssConfig 			= {     top		: nodeElement.css('top'),//NO I18N
										display : 'block',//NO I18N
										left	: nodeElement.css('left')//NO I18N
								  }; 					  
								  
		var animateConfig 		= {		
										//left	: 	parseInt(nodeElement.style.left), 
										opacity :   1 
								  };
		
		$infoPanel.stop().css(cssConfig);
		
		$infoPanel.animate(animateConfig, 300, function(){
														$infoData.blocked = false;
												}); 
		
		options.onShowTip(node);
		
		}catch(e){
			alert(e);	
		}
	}
	
	/* Fade the panel away */
	function hideTip(){
		$infoData.nodeId = null;
		$infoPanel.stop()
				  .animate({ "opacity": 0 }, 300,  function(){//NO I18N
													$infoPanel.css("display", "none");//NO I18N
												});
	}
	// Primary scale is in terms of 1 meaning 100%
	// All additional scalling will be done in terms of decimal percentages
	var scaleOffsetX = 1;
	var scaleOffsetY = 1;	
	
	jQuery('#zoomin')//NO I18N
			.on('click', function(){ 
				 // Relatively Scaling the canvas and its labels by 110% 
 				 scaleCanvas(1.1, 1.1);		 
			});
			
	jQuery('#zoomout')//NO I18N
			.on('click', function(){  
				 // Relatively Scaling the canvas and its labels by 90% 							
				 scaleCanvas(0.9, 0.9);
			});
			
	jQuery('#zoomreset')//NO I18N
			.on('click', function(){   
				 resetCanvas();
			});
			
	function resetCanvas(){
		canvasContainer = jQuery("#"+vizContainerId);//NO I18N
		st.config.offsetX = 0;
		st.config.offsetY = 0;
		//st.canvas.resize(canvasContainer.width(), canvasContainer.height());
		st.canvas.resize(canvasContainer.width(), canvasContainer.height());
		scaleOffsetX = 1;
		scaleOffsetY = 1; 
		// Scaling the labels
		scaleLabels();
	}

	function scaleCanvas(scalex, scaley){   
			// Scaling the canvas data
			st.canvas.scale(scalex, scaley);
		
			// Scale offset tracks the total percentage the canvas has scaled till now
			scaleOffsetX *= scalex;
			scaleOffsetY *= scaley; 
			
			// Scaling the labels
			scaleLabels();				 
	}
	
	// Scaling the Label elements by increasing a with:height and placing a margin value so that it overlaps the bitmap element
	function scaleLabels(){
				jQuery.each(st.labels.labels, function(index, value){
					  var node = st.graph.getNode(this.id);					  
					  scaleLabel(node, this);
			  });
	}
	
	// Code for scaling a particular label element
	function scaleLabel(node, labelElement){
		    // Checking if a node exits for the particular label
			if(!node) return;
			
			// Scaling is done with respect to the actual nodes width and height
			var pw = node.getData('width'), //NO I18N
				ph = node.getData('height'),//NO I18N
				dw = parseInt(pw * scaleOffsetX),
				dh = parseInt(ph * scaleOffsetY),
				fs = 100*scaleOffsetX;
				pos = jQuery(labelElement).position();
			
			// Moving the pivot point to the center of the Dom Label element then calculating the additional margin that should be applied because of the scaling
			pos.left = parseInt((pw/2) - (dw/2)).ceil();
			pos.top  = parseInt((ph/2) - (dh/2)).ceil();
			
			// Appling scaled values to the label element
			jQuery(labelElement).css({
								  marginLeft : pos.left+5, marginTop : pos.top, 	// Margin values are added to propely position the values 
								  width 	 : dw	   , height	   : dh,	    	// Scaled width and height
								  fontSize	 : fs+'%'//NO I18N
							 });							
	} 
	
	window.onresize = function(e){	
		var tempScale = {x:scaleOffsetX, y:scaleOffsetY};
  		resetCanvas();	
		scaleCanvas(tempScale.x, tempScale.y);
  	}
	scaleCanvas(0.7, 0.7);
	// Returning Object processing information
	return {
		getNodeList : function() {
			return getAssetsInView().keys();
		},
		makeClick : function(nodeId) {
			var node = st.graph.getNode(nodeId);
			getJsonNode(node,onComplete);
		},
		isRendered : function(nodeId) {
			if(getAssetsInView().get(nodeId)) return true; else return false;	     
		},			    
		addRelation : function(nodeId, data){
			//loadSave = true;			
			ProcessRelations(data);
			var result = getJsonNode(nodeId);						
			//console.log(result);	
			st.addSubtree(result, 'replot'); //NO I18N
			st.onClick(nodeId);
			//loadSave = false;			
		}, 
		clickNode : function(nodeId){
			st.onClick(nodeId);
		},
		getSaveData : function(){
			return {root:st.root, nodes:NODE_CLICKED.keys()};	
		},
		st		   : st,
		json 	   : INCOMING_DATA
	};
}

