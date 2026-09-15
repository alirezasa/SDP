//$Id$	
	function refreshGanttBar(taskDetails ,taskid){

		var textWidth = 0;
		if(parent.ganttProperties.barType != parent.ganttProperties.rowType){

			var title = parent.truncateString( parent.getTitleDisp_Str(taskid) , 50 );
			textWidth = parent.checkSize(title) + 10;
		}
		if( taskDetails[0] == null && taskDetails[1] == null && taskDetails[2] == null && taskDetails[3] == null ){
			
			textWidth = textWidth + 15;//Task does not have any time(both scheduled and actual) 
		}
		if( parent.jQuery.inArray(taskDetails[7].toString(), parent.ganttProperties.completedStatusIds) !== -1 ){
			
			textWidth = textWidth + 15;//Task is closed
		}
		var s_barStartPx = parent.getGanttPixelValue(taskDetails[0],"startPx");
		var s_barEndPx = parent.getGanttPixelValue(taskDetails[1],"endPx");

		var s_barWidthPx = s_barEndPx - s_barStartPx;

		var a_barStartPx = parent.getGanttPixelValue(taskDetails[2],"startPx");
		
		var b_StartPX = s_barStartPx;

		if( ( taskDetails[2] > 0 ) && ( a_barStartPx < b_StartPX ) ){	b_StartPX = a_barStartPx;	}

		var a_barEndPx = parent.getGanttPixelValue(taskDetails[3],"endPx");
		var a_barWidthPx = a_barEndPx - a_barStartPx;

		var b_EndPX = a_barEndPx;

		if( s_barEndPx > b_EndPX  ){	b_EndPX = s_barEndPx;	}

		if( b_EndPX - b_StartPX < textWidth ){ 	b_EndPX = b_StartPX + textWidth;	}

		var selectedRow_DIV = -1;

		var prev_start = parent.jQuery('#task_'+taskid).attr('b_StartPX');
		var prev_end = parent.jQuery('#task_'+taskid).attr('b_EndPX');

		var prev_Tableid = parent.jQuery('#task_'+taskid).parent().parent().parent().parent().parent().attr('id');

		var new_Table = 'technician_'+getTableId(taskid,taskDetails); 		//NO I18N

		if( new_Table == prev_Tableid ){
		
			// if the bar shrinks within it's previous outline then no need to find space in another row.
			if( ( b_StartPX >= prev_start ) && ( b_EndPX <= prev_end ) ){
	
				// we can just update the current bar width and left alone to update the change..
			
				selectedRow_DIV = 0;	
			
			}else if( check_NO_OverlappingSpan( parent.jQuery('#task_'+taskid).parent().children() , b_StartPX , b_EndPX , taskid ) ){

				selectedRow_DIV = 0;	
			}

		}else {
			
			selectedRow_DIV = getRowDivTOReDraw( b_StartPX , b_EndPX , taskid ,taskDetails)	
		}

		var prev_bar = parent.jQuery('#task_'+taskid);
		if( selectedRow_DIV == 0 ){

			// update the bar with new values in that current position itself..

			selectedRow_DIV = parent.jQuery('#task_'+taskid).parent()[0];

			if(parent.jQuery('#old_task')[0] != null ){

				prev_bar.remove();
			}else{
				prev_bar.attr('id','old_task');
				parent.jQuery('#s_task_'+taskid).remove();
				parent.jQuery('#a_task_'+taskid).remove();
				parent.jQuery('#t_task_'+taskid).remove();
			}
			parent.constructGanttBars( null , taskDetails , taskid , selectedRow_DIV );
		}else if( selectedRow_DIV == -1 ){
			
			// create new tr under that table.. and move the span under that..
	
			var BarViewDiv = document.createElement('div'); 

			parent.jQuery(BarViewDiv).addClass('gantt-barview-div');
			parent.jQuery(BarViewDiv).css({
				'height'	:parent.ganttProperties.cellHieght,//NO I18N
				'position'	:'relative'//NO I18N
			});	
			parent.jQuery(BarViewDiv).attr('maxIndex',0);

			if(parent.jQuery('#old_task')[0] != null ){
				prev_bar.remove();
			}else{
				prev_bar.attr('id','old_task');
				parent.jQuery('#s_task_'+taskid).remove();
				parent.jQuery('#a_task_'+taskid).remove();
				parent.jQuery('#t_task_'+taskid).remove();
			}
			parent.constructGanttBars( null , taskDetails , taskid , BarViewDiv );

			var BarViewTable = parent.jQuery('#'+new_Table)[0];
			var BarViewbody = document.createElement('tbody');
			var BarViewRow = document.createElement('tr');
			var BarViewTD = document.createElement('td');

			parent.jQuery(BarViewTD).css('height',parent.ganttProperties.cellHieght);//NO I18N
                        
			parent.jQuery( BarViewTD ).html(parent.timeUlList.outerHTML);
			BarViewTD.appendChild(BarViewDiv);
			BarViewRow.appendChild(BarViewTD);
                        BarViewbody.appendChild(BarViewRow);
			BarViewTable.appendChild(BarViewbody);

			// increase the height of y-axis..

			var new_RowCount = parseInt( parent.jQuery( BarViewTable ).attr('rowcount') )+1;
			
			parent.jQuery( BarViewTable ).attr('rowcount',new_RowCount);

			var new_hieght = ( parent.ganttProperties.cellHieght * parseInt(new_RowCount) );
			parent.jQuery(parent.jQuery('#name_'+new_Table).children()[0].children[0].children[0]).css({'height' : new_hieght+'px' })
		}else{

			// move the task bar span under the tr which has the available space for the bar.

			if(parent.jQuery('#old_task')[0] != null ){
				prev_bar.remove();
			}else{
				prev_bar.attr('id','old_task');
				parent.jQuery('#s_task_'+taskid).remove();
				parent.jQuery('#a_task_'+taskid).remove();
				parent.jQuery('#t_task_'+taskid).remove();
			}
			parent.constructGanttBars( null , taskDetails , taskid , selectedRow_DIV );
		}

		setTimeout(function(){
			parent.jQuery('i.line').remove();
			parent.drawTaskDependencies();
		}, 500 );

		var BarViewSpan = parent.jQuery('#task_'+parent.ganttProperties.actionEntityid);
		BarViewSpan.find('.gantt-barview-span').addClass('gantt-barview-h').end()
					.find('.gantt-barview-span-taskinfo').addClass('gantt-barview-taskinfo-h');

		parent.setGanttBottom_RightScroll();
	}

	function getTableId(taskid,taskDetails){

		var rowid = 0;
		var rowType = parent.ganttProperties.rowType;
		var barType = parent.ganttProperties.barType;
	
		if( 'users' == rowType ){
			rowid = ( taskDetails[11] != null && taskDetails[11] != "" ) ? taskDetails[11] : taskDetails[6];
		}else if( 'project' == rowType ){ 	//NO I18N
			rowid = taskDetails[8];
		}else if( 'milestone' == rowType ){	//NO I18N

			rowid = taskDetails[9];

			if( 'tasks' == barType && rowid == null ){	rowid = 'p_'+taskDetails[8];		}

		}else if( 'tasks' == rowType ){		//NO I18N
			rowid = taskid;
		}

		if( rowid == null || rowid == '' ){	rowid = 0;	}

		return rowid;
	}

	function getRowDivTOReDraw( b_StartPX , b_EndPX , taskid ,taskDetails){

		var rowArray = parent.jQuery('#technician_'+getTableId(taskid,taskDetails)).children();

		var selectedRow_DIV = -1;

		for(var i = 0 ; i<rowArray.length ; i++){

			var temp_DIV = rowArray[i].children[0].children[0].children[1]; 

			var spanArray = temp_DIV.children;

			if( check_NO_OverlappingSpan( spanArray , b_StartPX , b_EndPX , taskid ) ){		selectedRow_DIV = temp_DIV;   break;	}	
		}

		return selectedRow_DIV;		
	}

	function check_NO_OverlappingSpan( spanArray , b_StartPX , b_EndPX , taskid ){

		// iterate all the bars drawn in that row and find any overlapping.. if there is overlapping we need to quit the row..
			for(var j = 0 ; j<spanArray.length ; j++){

				var bar_span = spanArray[j];

				var startpx = parent.jQuery( bar_span ).attr('b_StartPX');
				var endpx = parent.jQuery( bar_span ).attr('b_EndPX');
				var task_bar = parent.jQuery( bar_span ).attr('id');


				// we need to skip the same task bar before update.
				if( task_bar == 'task_'+taskid || task_bar == 'old_task' ){

					continue;	
				}

				// quit that row if the below two conditions satisfied..

				if( ( b_StartPX <= startpx ) && ( b_EndPX >= startpx ) ){

					// starting before the current bar starts and ends within or after the current bar..

					return false;

				}else if( ( b_StartPX >= startpx ) && ( b_StartPX <= endpx ) ){
					
					// starting after the current bar starts and ends with or after the current bar..
					
					return false;
				}
			}
			// if there is no-overlapping then the row can be used for the new bar..
			return true;

			
	}
