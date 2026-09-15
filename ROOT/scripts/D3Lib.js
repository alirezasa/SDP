//$Id$
	function neighboring(a, b) {
		return linkedByIndex[a.name + "," + b.name] || a.index == b.index;
	}
	
	function truncate(word, length){
		if(word.length > length){
			return word.substring(0,length-1)+'..';
		}
	  return  word;
	}

	function smartPathStartFromBox(sourceX, sourceY, sourceWidth, sourceHeight, destX, destY){
		var pointToBeReturned = [];
		var padding = 110 ;
		
		if(destX > (sourceX - padding) && destX < (sourceX+sourceWidth+padding) && !(destY > sourceY && destY < (sourceY+sourceHeight))){
			// top or bottom.
			pointToBeReturned.x = sourceX + (sourceWidth/2);
			if(destY < sourceY){
				// top
				pointToBeReturned.y = sourceY;
			}
			else{
				// bottom
				pointToBeReturned.y = sourceY + sourceHeight;
			}
		}
		else{
			// left or right.
			pointToBeReturned.y = sourceY + (sourceHeight/2);
			if(destX < sourceX){
				// left
				pointToBeReturned.x = sourceX;
			}
			else{
				// right
				pointToBeReturned.x = sourceX + sourceWidth;
			}
			
		}
		return pointToBeReturned;
	}
	
	function getBoundingBoxForRect(element, quadrant){
		if(element.bbox == undefined) {
				element.bbox = element.getBBox();
		}
		
		var bbox = element.bbox;
		
		var boundary = {};
		/*boundary.width = parseFloat(element[0][0].attr("width"));											//No I18N
		boundary.height = parseFloat(element[0][0].attr("height"));										//No I18N
		boundary.x = parseFloat(element[0][0].attr("x"));													//No I18N
		boundary.y = parseFloat(element[0][0].attr("y"));*/													//No I18N*/
		boundary.x = bbox.x;
		boundary.y = bbox.y;
		boundary.width = bbox.width;
		boundary.height = bbox.height;
		if(quadrant == 1) {
			boundary.y += 10;
			boundary.x -= 10;
		}
		if(quadrant == 2) {
			boundary.x += 10;
			boundary.y -= 5;
		}
		if(quadrant == 3) {
			boundary.y -= 0;
			boundary.x -= 30;
		}
		if(quadrant == 4) {
			boundary.x += 10;
		}
		return boundary;
		
	}
	
	function getClusterDetails(clusterID){	
		var boundary = getBoundingBoxForRect("#grouprect"+clusterID);								//No I18N
		var rectCluster = d3.select("#cluster"+clusterID);											//No I18N
		var clusterData = rectCluster.property("__data__");											//No I18N
		var xOfTargetCluster = clusterData.dragx;													
		var yOfTargetCluster = clusterData.dragy;
		boundary.x += xOfTargetCluster;
		boundary.y += yOfTargetCluster;
		return boundary;
	}		
		function moveFromNode(d, source, target) {
			// Locate the node where the path will start
				// Retrieve the width and height attributes
				//var sourceNodeDetails = getBoundingBoxForRect("#node"+d.source.id);									//No I18N
				var sourceNodeDetails = getBoundingBoxForRect(source);									//No I18N
				var sourceWidth = sourceNodeDetails.width;
				var sourceHeight = sourceNodeDetails.height;
				var sourceX = sourceNodeDetails.x + d.source.x;
				var sourceY = sourceNodeDetails.y + d.source.y;
				
				var targetNodeDetails = getBoundingBoxForRect(target);									//No I18N									
				
				var targetWidth = targetNodeDetails.width;
				var targetHeight = targetNodeDetails.height;
				var targetX = targetNodeDetails.x + d.target.x;
				var targetY = targetNodeDetails.y + d.target.y;
				
				var nodeToBEReturned = {};
				// ...so we can change the x,y coordinates of the node to be
				// at its center rather than the top-left corner
				nodeToBEReturned.xForLineTo = sourceX;
				nodeToBEReturned.yForLineTo = sourceY;
				//d3.select("#grouprect"+d.source.group).attr("x",-30)
				//.attr("y",0).attr("width",w).attr("height",h).attr("fill","blue");
				var point = smartPathStartFromBox(sourceX, sourceY, sourceWidth, sourceHeight, d.target.x, d.target.y);
				nodeToBEReturned.x = point.x ;
				nodeToBEReturned.y = point.y;
				nodeToBEReturned.height = sourceHeight;
				nodeToBEReturned.width = sourceWidth;
				return nodeToBEReturned;
		};
		
		
		function lineToNode(d, source, target, moveFrom) {
			// Retrieve the width and height attributes...
			var quadrant = 0 ;
			if(d.target.y < d.source.y && d.source.x < d.target.x) {
				quadrant = 1;
			}
			else if(d.target.y > d.source.y && d.source.x < d.target.x) {
				quadrant = 2;
			}
			else if(d.source.x > d.target.x && d.source.y < d.target.y) {
				quadrant = 3;
			}
			else if(d.source.x > d.target.x && d.source.y > d.target.y) {
				quadrant = 4;
			}
			//var nodeDetails = getBoundingBoxForRect("#node"+d.target.id, quadrant);												//No I18N
			var nodeDetails = getBoundingBoxForRect(target, quadrant);												//No I18N
			var w = nodeDetails.width;
			var h = nodeDetails.height;
			var x = d.target.x + nodeDetails.x;
			var y = d.target.y + nodeDetails.y;
			
			// ...so we can locate the x,y coordinates of the center of target
			// the node...
			var cx = x + (w/2);
			var cy = y + (h/2);
			// ...which we will use to calculate the x,y coordinates of
			// the point on the perimeter of the node where the path will
			// end -- the idea is that the arrowhead at the end of the
			// path is "smart" enough to move around the perimeter of the
			// rectangular node as the node moves around the screen.
			return smartPathEndToBox(d, w, h,x,y,cx,cy,moveFrom);												//No I18N
		};
		
		function smartPathEndToBox(d, tw, th,tx,ty,tcx,tcy,moveFrom) {
		
				var newx,newy;
				var sourceW = moveFrom.width;
				var sourceH = moveFrom.height;
				var sourceX = moveFrom.xForLineTo;
				var sourceY = moveFrom.yForLineTo;
				var sourceCenterPointX = sourceX + (sourceW);
				var sourceCenterPointY = sourceY + (sourceH/2);
				// We need to work out the (tan of the) angle between the
				// imaginary horizontal line running through the center of the
				// target node and the imaginary line connecting the center of
				// the target node with the top-left corner of the same
				// node. Of course, this angle is fixed.
				var tanRatioFixed =
						(tcy - ty)
						/
						(tcx - tx);
				// We also need to work out the (tan of the) angle between the
				// imaginary horizontal line running through the center of the
				// target node and the imaginary line connecting the center of
				// the target node with the center of the source node. This
				// angle changes as the nodes move around the screen.
				var tanRatioMoveable =
						Math.abs(tcy - sourceCenterPointY)
						/
						Math.abs(tcx - sourceCenterPointX); // Note,
						// JavaScript handles division-by-zero by returning
						// Infinity, which in this case is useful, especially
						// since it handles the subsequent Infinity arithmetic
						// correctly.
				// Now work out the intersection point
				if (tanRatioMoveable == tanRatioFixed) {
						// Then path is intersecting at corner of textbox so draw
						// path to that point

						// By default assume path intersects a left-side corner
						newx = tx;

						// But...
						if (tcx < sourceCenterPointX) {
								// i.e. if target node is to left of the source node
								// then path intersects a right-side corner
								newx = tx + tw;
						}

						// By default assume path intersects a top corner
						newy = ty;

						// But...
						if (cy < sourceCenterPointY) {
								// i.e. if target node is above the source node
								// then path intersects a bottom corner
								newy = ty + th;
						}
				}

				if (tanRatioMoveable < tanRatioFixed) {
						// Then path is intersecting on a vertical side of the
						// textbox, which means we know the x-coordinate of the
						// path endpoint but we need to work out the y-coordinate
						// By default assume path intersects left vertical side
						newx = tx;
						// But...
						if (tcx < sourceCenterPointX) {
								// i.e. if target node is to left of the source node
								// then path intersects right vertical side
								newx = tx + tw;
						}

						// Now use a bit of trigonometry to work out the y-coord.

						// By default assume path intersects towards top of node								
						newy = tcy - ((tcx - tx)*tanRatioMoveable);

						// But...
						if (tcy < sourceCenterPointY) {
								// i.e. if target node is above the source node
								// then path intersects towards bottom of the node
								newy = (2 * ty) - newy + th;
						}
				}

				if (tanRatioMoveable > tanRatioFixed) {
						// Then path is intersecting on a horizontal side of the
						// textbox, which means we know the y-coordinate of the
						// path endpoint but we need to work out the x-coordinate

						// By default assume path intersects top horizontal side
						newy = ty;

						// But...
						if (tcy < sourceCenterPointY) {
								// i.e. if target node is above the source node
								// then path intersects bottom horizontal side
								newy = ty + th;
						}

						// Now use a bit of trigonometry to work out the x-coord.

						// By default assume path intersects towards lefthand side
						newx = tcx - ((tcy - ty)/tanRatioMoveable);

						// But...
						if (tcx < sourceCenterPointX) {
								// i.e. if target node is to left of the source node
								// then path intersects towards the righthand side
								newx = (2 * tx) - newx + tw;
						}
				}
				return {x: newx, y: newy};													//No I18N
		}


