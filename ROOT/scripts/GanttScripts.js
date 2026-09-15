//$Id$	
	// this variables should not be initialized to null..
	// will create problems in the gantt view..while loading the task,milestone ,project details..
	var ganttProperties;
	var currentActionLayer;
	var gantbardir = 'left'; //NO I18N
	if(parent.sdp_user.DIRECTION=='RTL')
	{
		gantbardir = 'right'; //NO I18N
	}
	var timeUlList = null; 
	var showGanttPopup = true;

	var timeLineBefore = document.createElement('i');
	parent.jQuery( timeLineBefore ).addClass('timeline-before');

	var timeLineAfter = document.createElement('i');
	parent.jQuery( timeLineAfter ).addClass('timeline-after')

	function createGanttChart()
	{
		
		var GanttTable = document.createElement('table');	
		jQuery(GanttTable).attr('cellSpacing',0);
		jQuery(GanttTable).attr('cellPadding',0);
        	jQuery(GanttTable).attr('width','100%');
		jQuery(GanttTable).css('table-layout','fixed'); //NO I18N
		
		var GanttTable_tbody = document.createElement('tbody');

		setStartEndTimeForMonth();
		createTimeHeader(GanttTable_tbody);
		
		//bar creation

		var BarViewRow = document.createElement('tr');
		var BarViewTD = document.createElement('td');
		//BarViewTD.width = '100%';
		BarViewTD.colspan = ganttProperties.numberofCells;
		

		// for each users we will create a table and mark the number of rows for 
		//that user to calculate the relative pixals to draw the dependencies.


		
		//ganttProperties.taskDetailsList = '{"4":[{}],"5":[{}],"6":[{"1201":[64,352,4]}],"7":[{}],"8":[{"1202":[352,928,4],"1203":[928,1072,3],"1205":[1075,1216,4],"1206":[208,352,4],"1207":[208,352,4],"1208":[208,352,4],"1209":[208,352,4]}],"9":[{"1204":[1072,1216,4]}]} '; 
		//json structure {techid:[ { taskid:[startpixel , endpixel, colorindex ] , taskid1:[startpixel , endpixel , colorindex] } ] }

		var rowDetailsJson = JSON.parse(ganttProperties.taskDetailsList);
		var rowDetailsArray = rowDetailsJson["root"];
	
	
	
		

		var ganttRow_Count = 0;

		// for each technician a table will be created..
		// for each row of bars without collision will be appended as <tr>
		// each tr will have the maxLength attribute to find out the highest end point..if 2 bars with 10-20 and 30-40 then max will be 40	
		// order the json based on the startindex..
		// 
		var timelineblock = document.createElement('div');
		jQuery(timelineblock).attr('id','gantt-timeline');
		BarViewTD.appendChild(timelineblock);

	for( var i =0 ; i< rowDetailsArray.length ; i++ ){

		var taskDetailsListArray = rowDetailsArray[i];

		for(var techListArray in taskDetailsListArray){

			var techBarTable = document.createElement('table');
			jQuery(techBarTable).attr('cellSpacing',0);
			jQuery(techBarTable).attr('cellPadding',0);
			jQuery(techBarTable).attr('width','100%');
			jQuery(techBarTable).attr('id','technician_'+techListArray);
			jQuery(techBarTable).css('border-bottom','1px solid #e9e9e9');//NO I18N
			
			var trArray = createTechTaskBars( taskDetailsListArray[techListArray] );
			
			for(var j=0;j<trArray.length;j++){
				techBarTable.appendChild(trArray[j]);
			}
			jQuery(techBarTable).attr('rowCount',trArray.length);
			
			timelineblock.appendChild(techBarTable);

			var rowValue = parent.document.getElementById('gantt_rowtype').value
			var rowID_Title = null;

			if( rowValue == 'milestone' ){
				if( ganttProperties.milestoneJSON[techListArray] ){
					rowID_Title = ganttProperties.milestoneJSON[techListArray];
				}else{
					rowID_Title = getMessageForKey('sdp.project.heading.project')+' - '+ganttProperties.projectJSON[techListArray.substring(2)];
				}
			}else if( rowValue == 'tasks' ){	//NO I18N
				rowID_Title = ganttProperties.tasksJSON[techListArray]
			}else if( rowValue == 'project' ){	//NO I18N
				rowID_Title = ganttProperties.projectJSON[techListArray]
			}else if( rowValue == 'users' ){	//NO I18N
				rowID_Title = ganttProperties.usersJSON[techListArray]
			}
			createGanttY_axisRow(trArray.length , 'technician_'+techListArray , rowID_Title , techListArray);	//NO I18N

			ganttRow_Count++

			// row count limited to 500 to avoid overloading the client browser... bar count will be done in the server side..	
			// this is done in the client side since the same cann't to done in server...if done in server the data passed will be invalid state..
			if( ganttRow_Count == 500 ){	
				
				parent.invokeProgressIndicator(null,getMessageForKey('sdp.project.gantt.maxrows'),null,null,true,500,'alert-warn-icon');	//NO I18N
			       	
				break;	// break the row construction after 500 odd ones...	
			}
		}
	}
	
		createEmptyBottom_Row(timelineblock);	
		
		BarViewRow.appendChild(BarViewTD);
                GanttTable_tbody.appendChild(BarViewRow);
                GanttTable.appendChild(GanttTable_tbody);
		
		var mainDiv = parent.document.getElementById('GanttMainDiv');
		mainDiv.appendChild(GanttTable);

		if("tasks" === ganttProperties.barType){	drawGanttDependencies();	}
	}

	function createEmptyBottom_Row(timelineblock){
		var techBarTable = document.createElement('table');
		jQuery(techBarTable).attr('cellSpacing',0);
		jQuery(techBarTable).attr('cellPadding',0);
		jQuery(techBarTable).attr('width','100%');
		jQuery(techBarTable).attr('id','technician_-1');
		//jQuery(techBarTable).css('border-bottom','1px solid #e9e9e9');//NO I18N

		var BarViewRow = document.createElement('tr');

		var BarViewTD = document.createElement('td');
		jQuery(BarViewTD).attr('valign','top').css('height',( 5 * ganttProperties.cellHieght )).css('vertical-align','top');//NO I18N
                       
		BarViewRow.appendChild(BarViewTD);    	
		var BarViewbody = document.createElement('tbody');
                BarViewbody.appendChild(BarViewRow);	
		techBarTable.appendChild(BarViewbody);
		timelineblock.appendChild(techBarTable);

		var techTable = document.createElement('table');
		jQuery(techTable).attr('cellspacing',0);
		jQuery(techTable).attr('cellpadding',0);
		jQuery(techTable).attr('width','100%');
		
		//jQuery(techTable).css('border-bottom','1px solid #e9e9e9');//NO I18N
		jQuery(techTable).attr('id',"name_-1");
		
		
		var techRow = document.createElement('tr');

		var techTD = document.createElement('td');
	
		jQuery(techTD).css( 'height',( 5 * ganttProperties.cellHieght ) );//NO I18N

		techRow.appendChild(techTD);
			
		var techBody = document.createElement('tbody');
                techBody.appendChild(techRow);
                techTable.appendChild(techBody);

		var mainDiv = document.getElementById('gantt-left-section');
		jQuery(mainDiv).append(techTable);
	}
	function enableRowEditable(element , entityid ){

		var isViewable = true;
		
		if( 'milestone' == ganttProperties.rowType ){	
		
			if(entityid.indexOf("p_")==0){	
				
				isViewable = parent.jQuery.inArray( parseInt( entityid.substring(2) ) , ganttProperties.ViewProject )  >=0 ; 
			}else{
				var projectid = ganttProperties.mileToProject[entityid];

				isViewable = parent.jQuery.inArray( parseInt( projectid ) , ganttProperties.ViewMileStone )  >=0 ;  
			}
		
		}else if( 'project' == ganttProperties.rowType ){	//NO I18N
		
			isViewable = parent.jQuery.inArray( parseInt( entityid ) , ganttProperties.ViewProject )  >=0 ; 

		}else if( 'users' == ganttProperties.rowType ){	//NO I18N
			
			isViewable = false;
		}

		if( isViewable != true ){
			element.off('click');		//NO I18N
			element.css( 'cursor', 'default' );	//NO I18N
		}
	}
	function createGanttY_axisRow(rowCount , techId , rowTitle , entityid){
		
		var techBarTable = document.createElement('table');
		jQuery(techBarTable).attr('cellspacing',0);
		jQuery(techBarTable).attr('cellpadding',0);
		jQuery(techBarTable).attr('width','100%');
		
		jQuery(techBarTable).css('border-bottom','1px solid #e9e9e9');//NO I18N
		jQuery(techBarTable).attr('id',"name_"+techId);
		
		
		var BarViewRow = document.createElement('tr');

		var BarViewTD = document.createElement('td');
	
		jQuery(BarViewTD).css( 'height',(ganttProperties.cellHieght*parseInt(rowCount)) );//NO I18N
		jQuery(BarViewTD).attr( 'valign' , 'top' );
		
		var bold = document.createElement('B');
		jQuery(bold).addClass('gantt-font-ui1');

		var rowHref = document.createElement('a');

		if(ganttProperties.rowType == 'users' && entityid == '0'){
		
			rowHref.appendChild(document.createTextNode( getMessageForKey( rowTitle ) ));
			
		}else{
			var title_span = document.createElement('span');
			jQuery(title_span).attr('id',"name_title_"+techId);
			jQuery(title_span).attr('class','truncate-wrapper fw');//NO I18N
			
			title_span.appendChild( document.createTextNode( truncateString(rowTitle,50) ) );
			rowHref.appendChild( title_span );

			if( ! ( ganttProperties.rowType == "tasks" || ganttProperties.rowType == "users" ) ){	getDateSpanForEntity(entityid,rowHref,techId);	}
			
			jQuery(rowHref).attr('title',rowTitle);
		}
		jQuery(rowHref).attr('entityid',techId);
		jQuery(rowHref).attr('href','/');
		jQuery(rowHref).off('click').on('click',function(){loadGanttRowDetails(entityid)}); 		//NO I18N
		jQuery(rowHref).attr('class','truncate-ellipsis');//NO I18N
		enableRowEditable( jQuery(rowHref) , entityid );

		bold.appendChild(rowHref);
		BarViewTD.appendChild(bold);
		
		BarViewRow.appendChild(BarViewTD);
			
		var BarViewbody = document.createElement('tbody');
                BarViewbody.appendChild(BarViewRow);
                techBarTable.appendChild(BarViewbody);

		var mainDiv = document.getElementById('gantt-left-section');
		jQuery(mainDiv).append(techBarTable);
		
	}
	function getDivCount(divArray , barStartPx){
		
		var maxIndex = 0;
		var i=0;

		for(;i<divArray.length;i++){
			maxIndex = divArray[i].getAttribute('maxIndex');

			if(parseInt(barStartPx)>(parseInt(maxIndex)+5)){
				return i;
			}
		}
		// if the startindex is below the maxindex of all divs then create a new div..
			
		var BarViewDiv = document.createElement('div');
		jQuery(BarViewDiv).addClass('gantt-barview-div');
		jQuery(BarViewDiv).css({
			'height'	:ganttProperties.cellHieght,//NO I18N
			'position'	:'relative'//NO I18N
		});
		jQuery(BarViewDiv).attr('maxIndex',0);

		divArray[divArray.length] = BarViewDiv;

		return divArray.length - 1;
	}

	function createTechTaskBars( techTaskJson ){

		var trArray = new Array();
		var divArray = new Array();

		var barCount = 0;
	
		//JSONObject has been changed to Array of JSONObject due to ordering issues while parsing
		for(var techTask =0; techTask < techTaskJson.length; techTask++){

			var techTaskArray = techTaskJson[techTask];

			for(var taskArray in techTaskArray){

				var taskDetails = techTaskArray[taskArray];

				constructGanttBars(divArray , taskDetails , taskArray );

				barCount++;
			}
		}
		// for the actions list
		//<!--span style="height: 10px; left: 523px; width: 10px; top: 12.5px; position: 
		//absolute; background: none repeat scroll 0% 0% blue; display: block;"-->

		// if there is no bars then an empty rows need to be created..
		if(barCount==0){
			
			// this will create a empty div if there is no bars
			var BarViewDiv = document.createElement('div');
			jQuery(BarViewDiv).css({'height':ganttProperties.cellHieght , 'position': 'relative' });//NO I18N
			jQuery(BarViewDiv).attr('maxIndex',0).addClass('gantt-barview-div');
			
			divArray[divArray.length] = BarViewDiv;
		}
		
		for(var i=0; i<divArray.length ; i++){

			var BarViewRow = document.createElement('tr');

			var BarViewTD = document.createElement('td');
			jQuery(BarViewTD).attr('valign','top').css('height',ganttProperties.cellHieght).css('vertical-align','top');//NO I18N
                        
			divArray[i].rowNumber = i;

			jQuery(BarViewTD).html( timeUlList.outerHTML );
			
			BarViewTD.appendChild(divArray[i]);
			BarViewRow.appendChild(BarViewTD);
                     	
			var BarViewbody = document.createElement('tbody');
                        BarViewbody.appendChild(BarViewRow);
                        
                        trArray[i] = BarViewbody;
		}
		
		return trArray;	
		
	}

	function checkSize(text)
	{
		if(gantbardir == 'left'){	var ruler = jQuery('<span data-style="font-size:10px;"></span>'); $sdStyleConverter(ruler)	}
        else{	var ruler = jQuery('<span class="font-xsmall"></span>');	}
		ruler.text(text);
		jQuery('body').append(ruler);
		var txtWidth = ruler.width();
		ruler.remove();
		return txtWidth;
	}

	function constructGanttBars(divArray , taskDetails , taskID , span_DIV)
	{
			var s_barStartPx = getGanttPixelValue(taskDetails[0],"startPx");
			var s_barEndPx = getGanttPixelValue(taskDetails[1],"endPx");

			s_barStartPx = getStartPixIFZero(s_barStartPx , s_barEndPx);
			s_barEndPx = getEndPixIFZero(s_barStartPx , s_barEndPx);

			var s_barWidthPx = s_barEndPx - s_barStartPx;

			var a_barStartPx = getGanttPixelValue(taskDetails[2],"startPx");
			var a_barEndPx = getGanttPixelValue(taskDetails[3],"endPx");
			
			a_barStartPx = getStartPixIFZero(a_barStartPx , a_barEndPx);
			a_barEndPx = getEndPixIFZero(a_barStartPx , a_barEndPx);

			var b_StartPX = s_barStartPx;

			if( ( taskDetails[2] > 0 ) && ( a_barStartPx < b_StartPX ) ){	b_StartPX = a_barStartPx;		}	

			var closedIcon = false; 
			var noTimeIcon = false; 

			if( taskDetails[0] == null && taskDetails[1] == null && taskDetails[2] == null && taskDetails[3] == null ){
				
				noTimeIcon = true;
			}
			if( parent.jQuery.inArray(taskDetails[7].toString(), ganttProperties.completedStatusIds) !== -1 ){
				
				closedIcon = true;
			}

			var colorIndex = taskDetails[4];

			var ownerID = (taskDetails[11] !== null && taskDetails[11] !== undefined) ? taskDetails[11] : taskDetails[6];
			// outer bar span..
			var BarViewSpan = document.createElement('span');

			jQuery(BarViewSpan).attr('id','task_'+taskID);//NO I18N
			
			jQuery(BarViewSpan).attr('taskStart',taskDetails[0]);
			jQuery(BarViewSpan).attr('taskEnd',taskDetails[1]);
			jQuery(BarViewSpan).attr('a_taskStart',taskDetails[2]);
			jQuery(BarViewSpan).attr('a_taskEnd',taskDetails[3]);

			jQuery(BarViewSpan).attr('ScopeId',taskDetails[5]);//NO I18N
			jQuery(BarViewSpan).attr('entityid',taskID);//NO I18N
			jQuery(BarViewSpan).attr('ownerid',ownerID);//NO I18N

			jQuery(BarViewSpan).attr('statusid',taskDetails[7]);//NO I18N
			jQuery(BarViewSpan).attr('projectid',taskDetails[8]);//NO I18N
			jQuery(BarViewSpan).attr('milestoneid',taskDetails[9]);//NO I18N

			jQuery(BarViewSpan).attr('class','timeline');

			BarViewSpan.innerHTML = "<div id='task_"+taskID+"_DESC' class='proj-gantt-infopop'></div>";	

			// scedule bar start..
			var s_BarViewSpan = document.createElement('span');

			jQuery(s_BarViewSpan).css('height'	, ganttProperties.barHeight);		//NO I18N
			jQuery(s_BarViewSpan).css(gantbardir	, s_barStartPx);		//NO I18N
			jQuery(s_BarViewSpan).css('width'	, s_barWidthPx);		//NO I18N
			jQuery(s_BarViewSpan).css('top'		, ( ganttProperties.cellHieght-(2 * (ganttProperties.barHeight)) )/2 + 5);	//NO I18N
			jQuery(s_BarViewSpan).css('background'	, ganttProperties.color[colorIndex][0]);	//NO I18N
							

			jQuery(s_BarViewSpan).attr('startPX',s_barStartPx).addClass('gantt-barview-span');
			jQuery(s_BarViewSpan).attr('endPX',s_barEndPx);
			
			jQuery(s_BarViewSpan).attr('id','s_task_'+taskID);//NO I18N
			
			if(taskDetails[10] != undefined && taskDetails[10] != 0 && taskDetails[10] != 100){

				var percentageBar = document.createElement('b');
				jQuery(percentageBar).addClass('data-progress').css('width',taskDetails[10]+'%');	//NO I18N

				s_BarViewSpan.appendChild(percentageBar);
				jQuery(BarViewSpan).attr('percentComplete',taskDetails[10]+'%');
			}
			
			if(taskDetails[11] !== null && taskDetails[11] !== undefined){
				
				//loading dotted border for marked task bar
				jQuery(BarViewSpan).attr('marked', 'true');
				jQuery(s_BarViewSpan).css('border', '2px dotted #000');		//NO I18N
			}

			//jQuery(s_BarViewSpan).attr( 'onmouseover' , "showGanttActions('"+taskID+"')" );
			
		if( taskDetails[0] !=null && taskDetails[0] < parent.ganttProperties.startTime ){	jQuery(s_BarViewSpan).append( timeLineBefore.outerHTML );   }
		if( taskDetails[1] !=null && taskDetails[1] > parent.ganttProperties.endTime ){		jQuery(s_BarViewSpan).append( timeLineAfter.outerHTML );    }

			var textWidth = 0;
			if(ganttProperties.barType != ganttProperties.rowType){

				var s_TitleSpan = document.createElement('span');
				
				var title = truncateString( getTitleDisp_Str(taskID) , 50 );
				textWidth = checkSize(title); // checking the pixels occupied by the text
				
				jQuery(s_TitleSpan).css('height', '12px');	//NO I18N
				jQuery(s_TitleSpan).css(gantbardir	, s_barStartPx );		//NO I18N
				jQuery(s_TitleSpan).css('top'	, '0px' );	//NO I18N
				jQuery(s_TitleSpan).css('white-space'	, 'nowrap' );	//NO I18N
				jQuery(s_TitleSpan).addClass('gantt-barview-span-taskinfo');
				jQuery(s_TitleSpan).attr('nowrap','true');
				jQuery(s_TitleSpan).attr('id','t_task_'+taskID);//NO I18N

				jQuery(s_TitleSpan).text( title );

				if( closedIcon ){		jQuery(s_TitleSpan).prepend("<i class='timeline-tick'></i>");	textWidth = textWidth + 15;	}

				if( noTimeIcon ){		jQuery(s_TitleSpan).prepend("<i class='timeline-clock'></i>");	textWidth = textWidth + 15;	}

				textWidth = textWidth + 10; // Textwidth increased for dependency icon

				jQuery(s_TitleSpan).css('width'	, textWidth+'px'  );		//NO I18N

				BarViewSpan.appendChild(s_TitleSpan);

			}
			BarViewSpan.appendChild(s_BarViewSpan);

			if(ganttProperties.barType == ganttProperties.rowType){

				var s_OwnerSpan = document.createElement('span');

				var owner = encodeHTML(getOwnerDisp_Str(taskDetails[6]));

				textWidth = owner.length * 6 ; // each charecter occupies 6px

				jQuery(s_OwnerSpan).css('height', '12px');	//NO I18N
				jQuery(s_OwnerSpan).css(gantbardir	, s_barStartPx + s_barWidthPx +15 );		//NO I18N
				jQuery(s_OwnerSpan).css('top'	, '5px');	//NO I18N
				jQuery(s_OwnerSpan).css('white-space'	, 'nowrap' );	//NO I18N
				jQuery(s_OwnerSpan).addClass('gantt-barview-span-ownerinfo');
				jQuery(s_OwnerSpan).attr('nowrap','true');
				jQuery(s_OwnerSpan).attr('id','t_task_'+taskID);//NO I18N

				if( closedIcon ){		owner = "<i class='timeline-tick'></i>"+owner;	textWidth = textWidth + 15; 	}

				if( noTimeIcon ){		owner = "<i class='timeline-clock'></i>"+owner;	textWidth = textWidth + 15; 	}

				jQuery(s_OwnerSpan).html( owner );

				jQuery(s_OwnerSpan).css('width'	, textWidth+'px' );		//NO I18N

				BarViewSpan.appendChild(s_OwnerSpan);

			}

			// scedule bar Ends..

			// actual bar start..
		
			if( ganttProperties.showactual != 'false' && taskDetails[2] > 0 ){

				var a_barWidthPx = a_barEndPx - a_barStartPx;

				var a_BarViewSpan = document.createElement('span');


			       	jQuery(a_BarViewSpan).css({
					'height'	:( ganttProperties.barHeight - 2 ),//NO I18N
					'width'		:a_barWidthPx,//NO I18N
					'top'		:( ( (ganttProperties.cellHieght-(2 * (ganttProperties.barHeight)) )/2 )+ganttProperties.barHeight )+ 7,//NO I18N
					'position'	:'absolute',//NO I18N
					'background'	: "#BBBBBB",//NO I18N
					'display'	:'block'//NO I18N							
				});

				if(gantbardir == 'left'){	jQuery(a_BarViewSpan).css({ 'left':a_barStartPx });	}
				else			{	jQuery(a_BarViewSpan).css({ 'right':a_barStartPx });	}	//NO I18N

				jQuery(a_BarViewSpan).attr('startPX',a_barStartPx);
				jQuery(a_BarViewSpan).attr('endPX',a_barEndPx);

				jQuery(a_BarViewSpan).attr('id','a_task_'+taskID);//NO I18N
		
		if( taskDetails[2] !=null && taskDetails[2]  < parent.ganttProperties.startTime ){	jQuery(a_BarViewSpan).append( timeLineBefore.outerHTML );   }
		if( taskDetails[3] !=null && taskDetails[3]  > parent.ganttProperties.endTime ){	jQuery(a_BarViewSpan).append( timeLineAfter.outerHTML );    }

				BarViewSpan.appendChild(a_BarViewSpan);
			}
			// actual bar Ends..

			var b_EndPX = a_barEndPx;

			if( s_barEndPx > b_EndPX  ){	b_EndPX = s_barEndPx;	}

			if( b_EndPX - b_StartPX < textWidth ){ 	b_EndPX = b_StartPX + textWidth;	}

			jQuery(BarViewSpan).attr('b_StartPX',b_StartPX);//NO I18N
			jQuery(BarViewSpan).attr('b_EndPX',b_EndPX);//NO I18N


			if( span_DIV == null ){
			
				var divCount = getDivCount(divArray , b_StartPX);

				span_DIV = divArray[divCount];
			}

			span_DIV.appendChild(BarViewSpan);

			if( jQuery(span_DIV).attr( 'maxIndex' ) < b_EndPX ){
	
				jQuery(span_DIV).attr( 'maxIndex' , b_EndPX );
			}
	
	}


	function showGanttActions(entityid,containerid)
	{
		jQuery(document.getElementById('actionLayer_'+entityid)).attr('class','hide');
		var actionlayer = 'GanttActionLayer_'+document.GanttForm.gantt_bartype.value;// NO I18N

		if( document.getElementById('actionLayer_'+entityid) ){
		
			jQuery(document.getElementById('actionLayer_'+entityid)).html( document.getElementById(actionlayer).html() );// NO I18N
		}
		jQuery(document.getElementById('actionLayer_'+entityid)).show(100);
		jQuery(document.getElementById(containerid)).on('mouseleave', function(){
			jQuery(document.getElementById('actionLayer_'+entityid)).attr('class','hide');
		});
		ganttProperties.actionEntityid = entityid;
		ganttProperties.scopeid =  jQuery(document.getElementById(containerid)).attr('ScopeId');
	}

	function submitGanttActionInDialog(url,topValue,leftValue,hieght,width,titleValue,entityid)
	{
	    window.scrollTo(0, 0);
	    var taskUrl, assEntity = 'project', assoId, projectId;//NO I18N
        if(ganttProperties.barType == "tasks"){
            var eleId = ganttProperties.actionEntityid;
            if(!jQuery("#task_"+eleId).attr("milestoneid")){
                assoId = jQuery("#task_"+eleId).attr("projectid");
            }else{
                assEntity = "milestone";//NO I18N
                assoId = jQuery("#task_"+eleId).attr("milestoneid");
                projectId = jQuery("#task_"+eleId).attr("projectid");
            }
        }
		var json = {


		        "addTimeEntry": "", // NO I18N
		        "viewTaskComment": "tasks", // NO I18N

		        "viewMilestone": "MileStoneAction.do?submitaction=ViewMileStone&milestoneid=", // NO I18N
		        "viewMilestoneComment": "milestones", // NO I18N

		        "viewProject": "ProjectAction.do?submitaction=ViewProject&projectid=", // NO I18N
		        "viewProjectComment": "projects" // NO I18N
		    };
		    var divId;
		    switch (json[url]) {
		        case "tasks": //No I18N
		            divId = "TaskComments_DIV"; //No I18N
		            break;
		        case "projects": //No I18N
		            divId = "ProjectComments_DIV"; //No I18N
		            break;
		        case "milestones": //No I18N
		            divId = "MileStoneComments_DIV"; //No I18N

		    }
		    var html = "<div><div id='ui-framework-design1'><div class='ui-container'><div class='ui-container-panel'><div class='ui-tabs1-contentpanel'></div></div></div></div></div>";
		    var jhtml = parent.jQuery(html);
		    jhtml.find('.ui-tabs1-contentpanel').append('<div id=' + divId + '></div>');
		    if (entityid == null) { entityid = ganttProperties.actionEntityid; }
			var ele = jQuery("#" + ganttProperties.bar_hover);
		    if (divId) {
		        showDialog(jhtml.html(), " modal=yes, height=" + 600 + ", width=" + 1000 + ", title=" + titleValue + ",position=absmiddle", function() { //No I18N
					if(json[url] === "milestones") {
						var navinfo = {
							entity: "milestones", // NO I18N
							entityId: entityid,
							entityOwner: null,
							parentEntity: "projects",// NO I18N
							parentEntityId: ganttProperties.scopeid
						}
					} else if(json[url] === "tasks") {
						if(ele[0].getAttribute("milestoneid")) {
							var navinfo = {
								entity: "tasks", // NO I18N
								entityId: entityid,
								entityOwner: null,
								parentEntity: "milestones", // NO I18N
								parentEntityId: ele[0].getAttribute("milestoneid"),
								grandParentEntity: "projects", // NO I18N
								grandParentEntityId: ele[0].getAttribute("projectid")
							}
						} else {
							var navinfo = {
								entity: "tasks", // NO I18N
								entityId: entityid,
								entityOwner: null,
								parentEntity: "projects", // NO I18N
								parentEntityId: ele[0].getAttribute("projectid")
							}
						}
					} else if(json[url] === "projects") {
						var navinfo = {
							entity: "projects", // NO I18N
							entityId: entityid,
							entityOwner: null
						}
					}
		            showComments(navinfo);
		        });
		    } else {
				if(url == "addTimeEntry"){
					window.scrollTo(0, 0);
                    $tasks.loadWorkLog("form", "task", ganttProperties.actionEntityid, "project", ganttProperties.scopeid); //NO I18N
				}
				else{
					if(url == "addTimeEntry"){
                        var title = getMessageForKey("sdp.common.form.newworklog");//No I18N
                        window.scrollTo(0, 0);
                        $previewComponent.load(json[url], title, "1035px", parseInt(jQuery(window).height()) - 25, null, "worklogs_popup");//NO I18N
                    }else{
                        if(url === 'viewTask'){
                            $tasks.loadTasks('detail',assEntity,assoId,eleId,'gantt', projectId);// NO I18N
                        }else if(json[url].indexOf("submitaction=ViewProject") !== -1 || json[url].indexOf("submitaction=ViewMileStone") !== -1) {
                            showURLInDialog(json[url] + (entityid + "&from=gantt"), " overflow:auto,modal=yes, height=" + hieght + ", width=" + width + ", title=" + titleValue + ",position=absmiddle"); // NO I18N
                        }
                    }
				}
		    }

		    parent.scrollToElement(parent.jQuery('#_DIALOG_LAYER'), 600);
	}
	
	function refreshGanttInlineRow_Bar( url ){
		
		var tempEntity = parent.ganttProperties.barType;
		var tempEntityid = parent.ganttProperties.actionEntityid; 

		var tempRefreshRow = parent.ganttProperties.refreshRow ;

		if( tempRefreshRow ){	tempEntity = parent.ganttProperties.rowType;		}

		if( "viewTask" == url && "tasks" == tempEntity ){

			parent.document.g_TaskForm.TASKID.value = tempEntityid;
			parent.document.g_TaskForm.entityid.value = tempEntityid;
			
			if( tempRefreshRow ){	parent.document.g_TaskForm.refreshRow.value = 'true';		}

			parent.document.g_TaskForm.submitaction.value = 'viewTask';	// NO I18N
			parent.document.g_TaskForm.submit();
			parent.document.g_TaskForm.submitaction.value = 'updateTask';	// NO I18N

		}else if("viewMilestone" == url && "milestone" == tempEntity ){	// NO I18N

			parent.document.g_MileStoneForm.milestoneid.value = tempEntityid;
			parent.document.g_MileStoneForm.entityid.value = tempEntityid;

			if( tempRefreshRow ){	parent.document.g_MileStoneForm.refreshRow.value = 'true';		}

			parent.document.g_MileStoneForm.submitaction.value = 'ViewMileStone';	// NO I18N
			parent.document.g_MileStoneForm.submit();
			parent.document.g_MileStoneForm.submitaction.value = 'UpdateMileStone';	// NO I18N

		}else if("viewProject" == url && "project" == tempEntity ){		// NO I18N
			
			parent.document.g_ProjectForm.projectid.value = tempEntityid;
			parent.document.g_ProjectForm.entityid.value = tempEntityid;

			if( tempRefreshRow ){	parent.document.g_ProjectForm.refreshRow.value = 'true';		}

			parent.document.g_ProjectForm.submitaction.value = 'ViewProject';	// NO I18N
			parent.document.g_ProjectForm.submit();
			parent.document.g_ProjectForm.submitaction.value = 'UpdateProject';	// NO I18N
		}
		parent.scrollToElement(parent.jQuery('#ProListHeader'),600);
		
	}
	function setGanttBarType(value){

		if( "users" == value || "project" == value ){	return;		}

		var element = document.GanttForm.gantt_bar;

		if(element){

			var preValue = document.GanttForm.gantt_bar.value ;
			var setValue = preValue;
			
			if( value.indexOf("milestone") != -1 &&  preValue.indexOf("project") != -1 ){
					
				setValue = 'all_milestone';//NO I18N

			}else if(value.indexOf("tasks") != -1 &&  ( preValue.indexOf("project") != -1 || preValue.indexOf("milestone")  != -1 )){	//NO I18N

				setValue = "all_tasks";		//NO I18N
			}
			document.GanttForm.gantt_bar.value = 	setValue;
			parent.set_ULLI_ListSelected(parent.document.getElementById('gantt_bar_'+setValue),'gantt_bar',false);//NO I18N
		}
	}
	function NewDate(str)
        {
	  str=str.split('-');
          var date=new Date();
          date.setUTCFullYear(str[0], str[1]-1, str[2]);
          date.setUTCHours(0, 0, 0, 0);
          return date;
         }


	function checkDateDiff(dateType,callbackFunc)
	{
		var start = document.getElementById('gantt_startdate').value;
		var end = document.getElementById('gantt_enddate').value;
		if(start!='' && end!=''){
			var maxEnd = NewDate(start);
			
			var startTime1 = NewDate(start).getTime();
			
			var endTime1 = NewDate(end).getTime();
				
			
			var maxEndTime = maxEnd.getTime();
			var selCellType = 'HOURS';//NO I18N
			selCellType = document.GanttForm.gantt_celltype.value;
			
			var msg = null;
			if(selCellType=="MONTH"){
				//5 years for month.
				maxEnd.setFullYear((parseInt(maxEnd.getFullYear()))+5);
				maxEndTime = maxEnd.getTime();
				msg = parent.getMessageForKey("sdp.project.gantt.monthdiff.errormsg");
			}else if(selCellType=='DAY'){//NO I18N
				// 6 months for days 
				maxEnd.setMonth((parseInt(maxEnd.getMonth()))+6);				
				maxEndTime = maxEnd.getTime();
				msg = parent.getMessageForKey("sdp.project.gantt.daydiff.errormsg");
			}else{
				// 15 days for hours
				maxEndTime = startTime1+(15*24*60*60*1000);
				msg = parent.getMessageForKey("sdp.project.gantt.hrsdiff.errormsg");
			}
			if(endTime1>maxEndTime){
				document.getElementById('gantt_enddate').value = constructDateFromLong(maxEndTime);
				alert(msg);
			}	
			
		}
		if (callbackFunc){

			resetDropDowns();
		}
				
	}
	
	function checkGanttForm(){

		checkDateDiff();

		if(document.GanttForm.Disp_gantt_showactual.checked){

			document.GanttForm.gantt_showactual.value = true;
		}else{
			document.GanttForm.gantt_showactual.value = false;
		}

		var barValue = document.GanttForm.gantt_bar.value;

		var rowValue = parent.document.getElementById('gantt_rowtype').value;
	
		if( barValue.indexOf('milestone') != -1 && rowValue == 'tasks' ){
			rowValue = 'milestone';		//NO I18N
		}else if( barValue.indexOf('project') != -1 && ( rowValue == 'tasks' || rowValue == 'milestone' ) ){	//NO I18N
			rowValue = 'project';		//NO I18N
		}
		parent.document.getElementById('gantt_rowtype').value = rowValue;

		removeDropDowns();

		return true;	
	}

	function getRowCount(taskTableId , taskDivCount){
		var mainDiv = parent.document.getElementById('GanttMainDiv');
		var tableList = mainDiv.getElementsByTagName('table');
		var rowCount = 1; // for header
		for(var i=0;i<tableList.length;i++){
			
			if(taskTableId != tableList[i].getAttribute('id')){
				if(tableList[i].getAttribute('rowCount')!=null){
					rowCount = parseInt(rowCount) + parseInt(tableList[i].getAttribute('rowCount'));
				}
			}else{
				break;
			}
		}
		return rowCount;
	}

	function getStartPixIFZero(startPx , endPx)
	{
		// if the end time alone set and starttime is zero then..
		if(startPx<=0){		startPx = endPx - 50;		}

		// if the starttime falls below zero then set zero
		if(startPx<=0){		startPx = 0;			}

		return startPx;
	}
	function getEndPixIFZero(startPx , endPx)
	{
		// if the end time alone set and starttime is zero then..
		if(endPx<=0){		endPx = startPx + 50;		}

		return endPx;
	}	
	// return the value in pixel used for tasks bars in the gant view..
	function getGanttPixelValue(timeValue , pixType) 
	{
		if(timeValue == 0 || timeValue == null ){
			return 0;
		}
	
		timeValue = parent.getClientTimeZoneDateObjectTime( timeValue );

		if( (timeValue<= parent.ganttProperties.startPixTime ) && (pixType=="startPx") ){	//NO I18N
			return 1;
		}else if( (timeValue>parent.ganttProperties.endPixTime) && (pixType=="endPx") ){		//NO I18N
			timeValue = parent.ganttProperties.endPixTime;
		}
		
		// results in diff mins
		timeValue = (timeValue- parent.ganttProperties.startPixTime)/(1000*60);
		
		if(parent.ganttProperties.cellType =="HOURS"){//NO I18N

			timeValue = ( timeValue / 60 );
		}else if(parent.ganttProperties.cellType=="MONTH"){//NO I18N
			
			// currently we are calculating this by considering 30 days a month..
			// but some months will have 28,29,31 days we need to handle this case in future..
			timeValue = ( timeValue / (60*24*30) );

		}else{	// parent.ganttProperties.cellType will be day
			
			timeValue =  ( timeValue / (60*24) );
		}

		// timeVlaue is added to componsate the grid lines 1 pixel
		timeValue =  timeValue + ( timeValue * ganttProperties.cellwidth );
		
		// this is to limit the endpoint before the grid line..
		if( pixType=="endPx" ){		timeValue =  timeValue - 1;		}

		return timeValue;
	}
	function createThForTimeRow(timeRowValue,timeRowWidth){
		var timeHeader =  document.createElement('th');
		jQuery(timeHeader).css({
			//'height':ganttProperties.cellHieght/2,//NO I18N
			'height':'13.5px',//NO I18N
			'width':timeRowWidth//NO I18N
		});
		jQuery(timeHeader).html(timeRowValue).addClass('timeHeader');
		return timeHeader;
	}

	function createTimeHeader(GanttTable_tbody){

		// header creation code
		var outertimerow = document.createElement('tr');
		var outertimetd = document.createElement('td');
		outertimetd.className = 'tasksdetail-header-row4';
		jQuery(outertimetd).attr('valign','top');
		var headerrow = document.createElement('div');
		jQuery(headerrow).attr('id','gantt-headerrow');

		var subtimetable = document.createElement('table'); // Header - Month Table Row
		jQuery(subtimetable).attr('cellPadding',0);
		jQuery(subtimetable).attr('cellSpacing',0);
		jQuery(subtimetable).attr('width','100%');	
		jQuery(subtimetable).css('table-layout','fixed');	//NO I18N
		jQuery(subtimetable).addClass('');

		// header creation code
		var subtimerow = document.createElement('tr');
			
		var timetable = document.createElement('table'); // Header - Year Table Row
		jQuery(timetable).attr('cellPadding',0);
		jQuery(timetable).attr('cellSpacing',0);
		jQuery(timetable).attr('width','100%');
		
		
		timeUlList = document.createElement('ul');
		jQuery(timeUlList).addClass('gantt-grid-ul');

		// header creation code
		var timerow = document.createElement('tr');

		var timerowvalue = null;
		var pretimerowvalue = null;
		var timerowwidth = 0;
		for(var i=0; i<ganttProperties.numberofCells ; i++ ){
			
			cellwidth = ganttProperties.cellwidth;
			var startPixDate = new Date(ganttProperties.startPixTime);
			if(ganttProperties.cellType == 'MONTH'){
				startPixDate.setMonth( startPixDate.getMonth() + i );
				yearcount = startPixDate.getFullYear();
				monthcount = startPixDate.getMonth();
				var noOfDays = new Date(yearcount,monthcount + 1,0).getDate();
				cellwidth = ( ganttProperties.cellwidth / 30 ) * noOfDays;
			}
			var subtimeheader =  document.createElement('th');
                        jQuery(subtimeheader).css({
				//'height':ganttProperties.cellHieght/2,//NO I18N
			        'height':'15px',//NO I18N	
				'width':cellwidth+1//NO I18N
			});
                        subtimeheader.className = 'subtimeheader';

			var liRow =  document.createElement('li');
			jQuery(liRow).css({
				'height':ganttProperties.cellHieght,//NO I18N
				'width':cellwidth//NO I18N
			});
			jQuery(timeUlList).append(liRow);

			if(ganttProperties.cellType=='HOURS'){
				subtimeheader.innerHTML = (i%ganttProperties.countMax);
				if( (i%ganttProperties.countMax)==0 ){
					var temp = (new Date(ganttProperties.startPixTime+((i/ganttProperties.countMax)*24*60*60*1000)));
					timerowvalue = temp.getDate()+" "+ganttProperties.monList[temp.getMonth()]+" "+temp.getFullYear();
					timerowwidth = ((24)*(ganttProperties.cellwidth+1) );	// +1 to adjust the grid line
					timerow.appendChild(createThForTimeRow(timerowvalue,timerowwidth-12));	
				}
			}else if(ganttProperties.cellType=='DAY'){//NO I18N
				startPixDate.setDate( startPixDate.getDate() + i );
				subtimeheader.innerHTML = '<img src="/images/spacer.gif" width="'+ganttProperties.cellwidth+'" height="1">'+ startPixDate.getDate();
				timerowvalue = ganttProperties.monList[startPixDate.getMonth()]+" "+startPixDate.getFullYear();
				
				if(pretimerowvalue==null){
					pretimerowvalue = timerowvalue;
				}
				if(timerowvalue!=pretimerowvalue){
					timerow.appendChild(createThForTimeRow(pretimerowvalue,timerowwidth-12));
					timerowwidth = 0;
					pretimerowvalue = timerowvalue;
				}
				timerowwidth = timerowwidth+ganttProperties.cellwidth+1;	// +1 to adjust the grid line
			}else{
				subtimeheader.innerHTML = ganttProperties.monList[monthcount];

				timerowvalue = yearcount;
				if(pretimerowvalue==null){
					pretimerowvalue = timerowvalue;
				}
				if( timerowvalue!=pretimerowvalue ){
					timerow.appendChild(createThForTimeRow(pretimerowvalue,timerowwidth));
					timerowwidth = 0;
					pretimerowvalue = timerowvalue;
				}
				timerowwidth = timerowwidth+cellwidth;

			}
			subtimerow.appendChild(subtimeheader);

		}

		if((ganttProperties.cellType=='DAY'||ganttProperties.cellType=='MONTH')){
			timerow.appendChild(createThForTimeRow(timerowvalue,timerowwidth));
		}

		// this titleHeader is to avoid the title expanding beyond dates selected
		var titleHeader =  document.createElement('th');
		jQuery(titleHeader).css({
			//'height':ganttProperties.cellHieght/2,//NO I18N
			'height':'13.5px',//NO I18N
			'width':'300px'//NO I18N
		});
		jQuery(titleHeader).addClass('timeHeader');

		timerow.appendChild(titleHeader);

        	var timebody = document.createElement('tbody');
                timebody.appendChild(timerow);
                timetable.appendChild(timebody);
			  headerrow.appendChild(timetable);
		
         	var subtimebody = document.createElement('tbody');
            	subtimebody.appendChild(subtimerow);
		subtimetable.appendChild(subtimebody);
		outertimetd.appendChild(headerrow);
		headerrow.appendChild(subtimetable);
		outertimetd.appendChild(document.createElement('div'));

		outertimerow.appendChild(outertimetd);
		GanttTable_tbody.appendChild(outertimerow);

	}

	function constructDateFromLong(date2){
		var date1 = new Date(parseInt(date2));
		var month = date1.getMonth()+1;
		if(month<10){
			month = '0'+month;
		}
		var day = date1.getDate()
		if(day<10){
			day = '0'+day;
		}	
		return date1.getFullYear()+"-"+month+"-"+day;
	}

	function getGanttCellDetails(){
		var diffTime = (ganttProperties.endPixTime - ganttProperties.startPixTime)/(1000*60*60);

		ganttProperties.ganttMinwidth = parseInt( parent.jQuery('.gantt-controls-right').width() - 20);

		if(ganttProperties.cellType =="HOURS"){
			ganttProperties.cellwidth = 30;
			ganttProperties.maxNumberofCells = 168;
			ganttProperties.numberofCells = diffTime;
			ganttProperties.countMax = 24;
		}else if(ganttProperties.cellType=="MONTH"){//NO I18N
			ganttProperties.cellwidth = 120;
			ganttProperties.maxNumberofCells = 36;
			ganttProperties.countMax = 12;	
			var monthDiff = ( (new Date(ganttProperties.endPixTime)).getMonth() - (new Date(ganttProperties.startPixTime)).getMonth() );
			var yearDiff = ( (new Date(ganttProperties.endPixTime)).getFullYear() - (new Date(ganttProperties.startPixTime)).getFullYear() );
			ganttProperties.numberofCells = monthDiff + (yearDiff*12) +1;

		}else{	//ganttProperties.cellType will be day
			 ganttProperties.cellwidth = 120;
			 ganttProperties.maxNumberofCells = 90;
			 ganttProperties.countMax = 30;
			 ganttProperties.numberofCells = diffTime/(24);
		}

		if( parseInt( ganttProperties.numberofCells ) < ganttProperties.numberofCells ){
		
			ganttProperties.numberofCells = parseInt( ganttProperties.numberofCells ) + 1;
		}

		if( ( parseInt( ganttProperties.numberofCells ) * parseInt( ganttProperties.cellwidth ) ) < parseInt( ganttProperties.ganttMinwidth ) )
		{
			ganttProperties.cellwidth = parseInt( parseInt( ganttProperties.ganttMinwidth ) / parseInt( ganttProperties.numberofCells ) );

			if( parseInt( ganttProperties.ganttMinwidth ) % parseInt( ganttProperties.numberofCells ) >0 ){

				ganttProperties.cellwidth = ganttProperties.cellwidth +1;
			}
		}

		if(window.resizeGanttCell) {
            if(ganttProperties.cellType=="MONTH") {
                ganttProperties.cellwidth += (Number(ganttProperties.numberofCells) <= 7)? 100 : 240;
            } else if(ganttProperties.cellType =="HOURS") { //NO I18N
                ganttProperties.cellwidth += 40;
            } else {
                ganttProperties.cellwidth += 160;
            }
        }

		ganttProperties.ganttWidth = ganttProperties.cellwidth*ganttProperties.numberofCells;

		var mainDiv = parent.document.getElementById('GanttMainDiv');

               // jQuery(mainDiv).css('width', ganttProperties.ganttWidth);//NO I18N

        // Adding expand option to more settings dropdown
        if(window.location.href.indexOf('projectid') > -1) {
            var moreSettingsEle = document.getElementById('ProjectsFilterMenuList')

            var ul = document.createElement("ul");
            ul.className = "barsettinglist-ui1";

            var li = document.createElement("li");
            var span = document.createElement("span");
            span.className = "optgroup";
            span.textContent = translate('common.reset.columnresize');

            li.appendChild(span);
            ul.appendChild(li);

            li = document.createElement('li')
            var div = document.createElement('div');
            div.className = 'disp-flex valign-center mt10'

            var label = document.createElement('label');
            label.className = 'disp-iflex mr10 ml10'

            var input = document.createElement('input');
            input.type = 'checkbox'
            input.className = 'togglechk'
            input.checked = window.resizeGanttCell
            input.onclick = expandOrResetChart

            label.appendChild(input)

            span = document.createElement('span');
            span.className = 'slide-toggle togg-sm'
            var childSpan = document.createElement('span');
            childSpan.className = 'switch-toggle'
            span.appendChild(childSpan);

            label.appendChild(span)
            div.appendChild(label)

            span = document.createElement('span');
            span.textContent = translate('sdp.common.expand')
            div.appendChild(span)

            li.appendChild(div)
            ul.appendChild(li)

            moreSettingsEle.appendChild(ul);
        }
	}


function loadGanttConfigurations(){

	var jQuery = parent.jQuery;

	if(jQuery != null) {
	
		jQuery(document).ready(function(){
			jQuery('#proj-tab-container-tabs a').on('click', function(){
				jQuery(this).addClass('active');
				jQuery(this).siblings().each(function(){	
					jQuery(this).removeClass('active');
				});
				var divname= this.id;
				jQuery("#"+divname+"-tab-container").show().siblings().not('.proj-tab-container-tabs').hide();//No I18N
				});
				
				jQuery('#ProjectsMenu').QuickActionsMenu({
        		 	animSpeed: 100, 
            			selector: '#ProjectsMenuParent', //No I18N
			        list: '#projectslist', //No I18N
        	    		currentClass: 'languageSelectBox1', //No I18N
            			activeClass: 'languageSelectBox1-active',//No I18N
				setCurrentObj: true,
				isPropagate: true
         		});//No I18N
		 
		 	jQuery('#MilestonesMenu').QuickActionsMenu({
         			animSpeed: 100, 
            			selector: '#MilestonesMenuParent', //No I18N
            			list: '#milestoneslist', //No I18N
            			currentClass: 'languageSelectBox1', //No I18N
            			activeClass: 'languageSelectBox1-active',//No I18N
				setCurrentObj: true,
				isPropagate: true
         		});//No I18N
		 	
			jQuery('#ProjectStatusMenu').QuickActionsMenu({
         			animSpeed: 100, 
            			selector: '#ProjectStatusMenuParent', //No I18N
            			list: '#projectstatuslist', //No I18N
            			currentClass: 'languageSelectBox1', //No I18N
            			activeClass: 'languageSelectBox1-active',//No I18N
				setCurrentObj: true,
				isPropagate: true
         		});//No I18N

		 	jQuery('#barsetting1').QuickActionsMenu({
         			animSpeed: 100, 
            			selector: '#barsetting1Parent', //No I18N
            			list: '#barsetting1-list', //No I18N
            			currentClass: 'languageSelectBox1 fl', //No I18N
            			activeClass: 'languageSelectBox1 fl',//No I18N
				setCurrentObj: true,
				isPropagate: true
         		});//No I18N
		 
		 	jQuery('#barsetting2').QuickActionsMenu({
         			animSpeed: 100, 
            			selector: '#barsetting2Parent', //No I18N
            			list: '#barsetting2-list', //No I18N
            			currentClass: 'languageSelectBox1 fl mleft8', //No I18N
            			activeClass: 'languageSelectBox1 fl mleft8',//No I18N
				setCurrentObj: true
         		});//No I18N
		 
		 	jQuery('#barsetting3').QuickActionsMenu({
         			animSpeed: 100, 
            			selector: '#barsetting3Parent', //No I18N
            			list: '#barsetting3-list', //No I18N
            			currentClass: 'languageSelectBox1 fl mleft8', //No I18N
            			activeClass: 'languageSelectBox1 fl mleft8',//No I18N
				setCurrentObj: true,
				isPropagate: true
         		});//No I18N
				
			jQuery('#datesetting').QuickActionsMenu({
         			animSpeed: 0, 
            			selector: '#datesettingParent', //No I18N
            			list: '#datesetting-list', //No I18N
            			currentClass: null, //No I18N
            			activeClass: null, //No I18N
									isPropagate: true //No I18N
         		});
				
			jQuery('#ganttsetting').QuickActionsMenu({
         			animSpeed: 0, 
            			selector: '#ganttsettingParent', //No I18N
            			list: '#ganttsetting-list', //No I18N
            			currentClass: null, //No I18N
            			activeClass: null, //No I18N
									isPropagate: true //No I18N
         		});
			
			jQuery('#ProjDetFilterMenu').QuickActionsMenu({
					animSpeed: 0, 
					selector: '#ProListHeader', //No I18N
					list: '#ProjDetFilterMenuList', //No I18N
					currentClass: null, //No I18N
					activeClass: null, //No I18N
					isPropagate: true //No I18N
				});
                                 
		});
	}
}

	function selectGanttCellTimeType(val,callbackFunc)
	{
		if ( document.getElementById('GanttCellTimeType_'+val).className == 'btnswitch2 btnswitch2-active' ){

			callbackFunc = false;
		}
		jQuery('#GanttCellTimeType_HOURS').removeClass('btnswitch2-active');
		jQuery('#GanttCellTimeType_DAY').removeClass('btnswitch2-active');
		jQuery('#GanttCellTimeType_MONTH').removeClass('btnswitch2-active');

		jQuery('#GanttCellTimeType_'+val).addClass('btnswitch2-active');
		parent.document.GanttForm.gantt_celltype.value = val;

		setPreValues();

		if (callbackFunc){
		
			parent.document.getElementById('Options_Div').innerHTML = parent.jQuery('#'+val+'_Div').html();
			parent.jQuery('#Options_Div').find('.ui-formcombo').removeAttr('id').attr('id','selectrange');// NO I18N
			
			trimValues(val);
		}
	}

function set_ULLI_ListSelected(selElement,entity,toSubmit){

	if(!selElement){   return;	}

	var targetId = null;
	var idStart = null;
	var selEntityId = selElement.getAttribute("entityid");

	if(entity=='projectstatuslist'){

		parent.document.getElementById('gantt_projectstatus').value = selEntityId;
		targetId = 'selected_projectstatus';// NO I18N

		if(toSubmit)
		{
			parent.document.getElementById('gantt_projectid').value = '0';
			parent.set_ULLI_ListSelected(parent.document.getElementById('gantt_projectid_'+parent.document.getElementById('gantt_projectid').value),'project',false);//NO I18N
		}
		idStart = 'projectstatus_';//NO I18N
	}

	if(entity=='project'){
		parent.document.getElementById('gantt_projectid').value = selEntityId;
		targetId = 'selected_project';// NO I18N
	
		// if the project list has only "All Projects then the milestone list has to be empty.."
		if( selEntityId != '0' ){

			construct_UL_LI_List(ganttProperties.milestoneJSON,'milestone','milestone_List');// NO I18N
		}
	
		// while loading the selected project and milestone we should not reset the milestone value.
		if(toSubmit){	
			parent.document.getElementById('gantt_milestoneid').value = '0';
			parent.set_ULLI_ListSelected(parent.document.getElementById('gantt_milestoneid_'+parent.document.getElementById('gantt_milestoneid').value),'milestone',false);//NO I18N
		}
		
		idStart = 'gantt_projectid_';//NO I18N
	}
	if(entity=='gantt_bar'){
		
		parent.document.getElementById('gantt_bar').value = selEntityId;
		targetId = 'selected_gantt_bar';// NO I18N

		idStart = 'gantt_bar_';//NO I18N

	}
	if(entity=='gantt_y_axis_filter'){

		parent.document.getElementById('gantt_rowtype').value = selEntityId;
		targetId = 'selected_y_axis_filter';// NO I18N

		// will set the bar type of gantt settings..
		setGanttBarType( selElement.getAttribute("entityid") );
		
		idStart = 'gantt_y_axis_filter_';//NO I18N
	}

	if(entity=='filter'){

		parent.document.getElementById('filter').value = selEntityId;
		targetId = 'selected_filter';// NO I18N

		idStart = 'filter_';//NO I18N
	}

	var targetElement = parent.document.getElementById(targetId);

	var prev_entityid = targetElement.getAttribute("entityid");

	targetElement.innerHTML = selElement.innerHTML;
	targetElement.title = selElement.title;
	targetElement.setAttribute("entityid",selElement.getAttribute("entityid"));

	parent.jQuery('#'+idStart + selElement.getAttribute("entityid")).parent().attr('class','hide');
	parent.jQuery('#'+idStart + prev_entityid).parent().attr('class','show');

	if(entity=='filter' && toSubmit){
		
		parent.document.ProjectForm.submit();

	}else if(toSubmit){	refreshGantt();	}
}

// this function will construct the select list for project & milestone list in the gantt view..
function construct_UL_LI_List(arrayJson,module,targetElement){

	var element1 = parent.document.getElementById(targetElement);
	//element1.innerHTML = '';

	// if there is no elements in the json then just empty the list...	
	if(!arrayJson){	return; }

	for (var key in arrayJson) {

		var liElement = parent.document.createElement('li');

		var ahref = parent.document.createElement('a');

		var valueStr = arrayJson[key];
		var valueId = key;

		if('milestone'==module){
			
			ahref.setAttribute("id","gantt_milestoneid_"+key);

		}else if('project'==module){		// NO I18N

			ahref.setAttribute("id","gantt_projectid_"+key);

		}else if('projectlist_filter'==module){	// NO I18N
			
			valueStr = key;	// NO I18N
			valueId = arrayJson[key];

			ahref.setAttribute("id","projectlist_filter_"+valueId);
		}else if('projectstatuslist'==module){	// NO I18N
			
			valueStr = getMessageForKey('sdp.project.list.statusfilter',[key]);	// NO I18N
			valueId = arrayJson[key];

			ahref.setAttribute("id","projectstatus_"+valueId);
		}

		ahref.setAttribute("title",valueStr);
		ahref.setAttribute("entityid",valueId);
		ahref.onclick = set_ULLI_ListSelected.bind(this,this,module,true);
		ahref.setAttribute("href","/");
		
		if(valueStr.length>30){
			ahref.innerHTML = encodeHTML(( valueStr.substring(0,30) )+'..');
		}else{
			ahref.innerHTML = encodeHTML(valueStr);
		}

		liElement.innerHTML = ahref.outerHTML;
		element1.appendChild(liElement);
	}
}

function refreshGantt(){
	checkGanttForm();
	parent.document.GanttForm.submit();	
}
function loadGanttDate(element,entity)
{
	document.getElementById('g_Inline_'+entity+'_'+element).innerHTML = document.getElementById(entity+'Form_'+element).innerHTML;

	// reset the id value to make the calendar popup position correctly..
	parent.jQuery('#g_Inline_'+entity+'_'+element).find('#'+entity+'_'+element+'_Display_Temp').attr('id',entity+'_'+element+'_Display');

	var prev_val = document.getElementById(entity+'_'+element).value;

	if(  prev_val && prev_val != null && prev_val != "" ){
	
		document.getElementById(entity+'_'+element+'_Display').value = parent.getDateStringGantt( prev_val );
	}
	jQuery('#'+entity+'Form_'+element).find('#'+entity+'_'+element+'_Display').attr('id',entity+'_'+element+'_Display_temp');
	document.getElementById(entity+'_'+element+'_Display').value = parent.getDateStringGantt( document.getElementById(entity+'_'+element).value );

	jQuery('#g_Details_'+entity+'_'+element).attr('class','hide');
	jQuery('#g_Inline_'+entity+'_'+element).attr('class','show');

	ganttProperties.inlineGanttCoumn = entity+'_'+element;

	initGanttInlineCal(entity+'_'+element);	// NO I18N	
	// For  ganttactionprojectforms, ganttactionmilestoneform, and ganttactiontaskform form calender init
	document.getElementById('g_Inline_'+entity+'_'+element).querySelectorAll('[forfieldid="'+entity+'_'+element+'"]').forEach(field => {         //No I18N
        field.addEventListener('click', () => initGanttInlineCal(entity+'_'+element) );
    });
}

function initGanttInlineCal(entity){

	var json = {	
		
		"Task_scheduledstarttime":["Task_scheduledendtime"],	// NO I18N
		"Task_scheduledendtime":["Task_scheduledstarttime"],	// NO I18N

		"Task_actualstarttime":["Task_actualendtime"],	// NO I18N
		"Task_actualendtime":["Task_actualstarttime"],	// NO I18N
		
		"MileStone_scheduledstarttime":["MileStone_scheduledendtime"],	// NO I18N
		"MileStone_scheduledendtime":["MileStone_scheduledstarttime"],	// NO I18N
		
		"MileStone_actualstarttime":["MileStone_actualendtime"],	// NO I18N
		"MileStone_actualendtime":["MileStone_actualstarttime"],	// NO I18N

		"Project_scheduledstarttime":["Project_scheduledendtime"],	// NO I18N
		"Project_scheduledendtime":["Project_scheduledstarttime"],	// NO I18N
		
		"Project_actualstarttime":["Project_actualendtime"],	// NO I18N
		"Project_actualendtime":["Project_actualstarttime"]	// NO I18N
	};
	

	var startEndArray = 	json[entity];

	if( startEndArray != null ){

		if( entity =='Project_scheduledstarttime' || entity == 'MileStone_scheduledstarttime' || entity == 'Project_actualstarttime'|| entity == 'MileStone_actualstarttime' ){
			errorCondition = '';	showNow_Today = null;	setHrsMins = '00:00';	hideTime = true;	//NO I18N

		}else if( entity =='Project_scheduledendtime' || entity == 'MileStone_scheduledendtime' || entity == 'MileStone_actualendtime'|| entity == 'Project_actualendtime' ){	//NO I18N

			errorCondition = 'less';	showNow_Today = null;	setHrsMins = '23:59';	hideTime = true;	//NO I18N

		}else if( entity =='Task_scheduledstarttime' || entity == 'Task_actualstarttime' ){	//NO I18N

			errorCondition = '';	showNow_Today = true;	setHrsMins = '00:00';	hideTime = null;	//NO I18N

		}else if( entity =='Task_scheduledendtime' || entity == 'Task_actualendtime' ){		//NO I18N

			errorCondition = 'less';	showNow_Today = true;	setHrsMins = '23:59';	hideTime = null;	//NO I18N
		}

		initRelationalCal('checkGanttInlineDates',entity , startEndArray[0] , errorCondition , showNow_Today , setHrsMins , hideTime);	// NO I18N
	}
}

    //To get project, milestone and task id
    function getIdsForGanttToolTip() {
        var projectId = parent.jQuery( '#'+ganttProperties.bar_hover ).attr('projectid');
        var milestoneId = parent.jQuery( '#'+ganttProperties.bar_hover ).attr('milestoneid');
        var taskId = parent.jQuery( '#'+ganttProperties.bar_hover ).attr('entityid');
        return [projectId, milestoneId, taskId]
    }

function checkGanttInlineDates(start,end,msg,errorCondition)
{
	if( checkValidDate(start,end,msg,errorCondition) ){
		if(shouldSubmit){
		    if(start.startsWith("Task")){
                var ids = getIdsForGanttToolTip();
                var projectId = ids[0]
                var milestoneId = ids[1]
                var taskId = ids[2]

                var scheduledStart = parent.jQuery('#Task_scheduledstarttime').length && parent.jQuery('#Task_scheduledstarttime')['0'].value
                var scheduledEnd = parent.jQuery('#Task_scheduledendtime').length && parent.jQuery('#Task_scheduledendtime')['0'].value
                var actualStart = parent.jQuery('#Task_actualstarttime').length && parent.jQuery('#Task_actualstarttime')['0'].value
                var actualEnd = parent.jQuery('#Task_actualendtime').length && parent.jQuery('#Task_actualendtime')['0'].value

                var input_data = {"task": {}} // NO I18N

                if(scheduledStart) {
                    input_data.task.scheduled_start_time = (scheduledStart === 'null')? null : {value: scheduledStart} // NO I18N
                }
                if(scheduledEnd) {
                    input_data.task.scheduled_end_time = (scheduledEnd === 'null')? null : {value: scheduledEnd} // NO I18N
                }
                if(actualStart) {
                    input_data.task.actual_start_time = (actualStart === 'null')? null : {value: actualStart} // NO I18N
                }
                if(actualEnd) {
                    input_data.task.actual_end_time = (actualEnd === 'null')? null : {value: actualEnd} // NO I18N
                }

                $tasks.saveGanttTaskChanges(input_data, projectId, milestoneId, taskId);
            }else{
                submitGanttInlineForm();
            }
		}
	}else{

		return false;
	}
}
function submitGanttInlineForm()
{
	if( "tasks" == ganttProperties.barType ){
		
		parent.document.g_TaskForm.submit();

	}else if( "milestone" == ganttProperties.barType ){	// NO I18N

		parent.document.g_MileStoneForm.submit();

	}else if( "project" == ganttProperties.barType ){	// NO I18N
		
		parent.document.g_ProjectForm.submit();
	}	
}
function loadProject_MilestoneDetailsInDialog(entity,that)
{
	if('project' == entity){
		submitGanttActionInDialog('viewProject',50,200,500,1200 , getMessageForKey("sdp.project.heading.projectdetails"),parent.jQuery(that).attr('projid'));
	}else {
		submitGanttActionInDialog('viewMilestone',50,300,500,1200, getMessageForKey("sdp.project.heading.milestonedetails"),parent.jQuery(that).attr('mileid'));
	}
}
function loadGanttRowDetails(entityid)
{
	var rowType = ganttProperties.rowType;

	// if row and bar are same type refresh bar needs to be done..
	if( rowType != ganttProperties.barType ){	ganttProperties.refreshRow = true;	}

	ganttProperties.actionEntityid = entityid;

	if( "tasks" == rowType ){
		
		submitGanttActionInDialog('viewTask','100','1000',500 , 1200 , getMessageForKey("sdp.common.taskdetails"));

	}else if( "milestone" == rowType ){	// NO I18N

		if( entityid.indexOf('p_') != -1 ){		
			
			// the projectdetails should not be shown from the gantt view under a project..
			if( ganttProperties.isProjectGnatt ){		return false;	}

			ganttProperties.actionEntityid = entityid.substring(2);		
		
			submitGanttActionInDialog('viewProject',50,200,500,1200 , getMessageForKey("sdp.project.heading.projectdetails"));
		}else{

			submitGanttActionInDialog('viewMilestone',50,300,500,1200, getMessageForKey("sdp.project.heading.milestonedetails"));
		}

	}else if( "project" == rowType ){	// NO I18N
		
		submitGanttActionInDialog('viewProject',50,200,500,1200 , getMessageForKey("sdp.project.heading.projectdetails"));
	}
}
// <!--this is for on-mouseover of task bars-->

function getDateStringGantt(longValue){

	if(longValue!=null && longValue!='null' && longValue!=''){
		
		var dt = parent.getClientTimeZoneDateObject( longValue );

		if("milestone" == ganttProperties.barType || "project" == ganttProperties.barType){
			return sdpDate.format({"entire_date" : dt , "type" : "D MMMM , YYYY"}); // NO I18N
		}else{
			return sdpDate.format({"entire_date" : dt , "type" : "D MMMM , YYYY hh:mm A"}); // NO I18N
		}
	}else{
		return 'N/A';	//NO I18N
	}
}
function getClientTimeZoneDateObject(longValue){
	
	var dt = new Date( parseInt(longValue) );

	//When the client is in a different format and the time zone selected is in a different format, then while editing the values will be displayed on the client timezone. To overcome this, the selected time zone's offset is obtained and calculated.
	var utc = dt.getTime() + (dt.getTimezoneOffset() * 60000); // Adding local timezone offset to get UTC time
	if(parent.sdp_user.OFFSET) {
		utc = utc + (parent.sdp_user.OFFSET); //NO I18N
	}               
	dt.setTime(utc);

	return dt;
}
function getClientTimeZoneDateObjectTime(longValue){
	
	var dt = getClientTimeZoneDateObject(longValue);

	return dt.getTime();
}
function getOwnerDisp_Str(ownerid){

	// ganttProperties.usersJSON[ownerid] != undefined will be useful when a user assigned to milestone and 
	// later his role is reduced to team member..
	if(ownerid!=null && ownerid!='null' && ganttProperties.usersJSON[ownerid] != undefined ){
	
		return ganttProperties.usersJSON[ownerid];
	
	}else{
		return 'N/A';	//NO I18N
	}	
}
function getBarStatusDisp_Str(statusid){

	if(statusid!=null && statusid!='null'){
	
		return truncateString( ganttProperties.allStatusJSON[statusid] , 50 );
	
	}else{
		return 'N/A';	//NO I18N
	}	
}
function getProjectDisp_Str(projectid){

	if(projectid!=null && projectid!='null'){
	
		return truncateString( ganttProperties.projectJSON[projectid] , 50 );
	
	}else{
		return 'N/A';	//NO I18N
	}	
}
function getMilestoneDisp_Str(milestoneid){

	if(milestoneid!=null && milestoneid!='null'){
	
		return truncateString( ganttProperties.milestoneJSON[milestoneid] , 50 );
	
	}else{
		return 'N/A';	//NO I18N
	}	
}
function getTitleDisp_Str(entityid){
	
	if(entityid!=null && entityid!='null'){
		
		var retTitle = "";
		if( "tasks" == ganttProperties.barType ){
			retTitle =  ganttProperties.tasksJSON[entityid];
		}else if( "milestone" == ganttProperties.barType ){	//NO I18N
			retTitle =  ganttProperties.milestoneJSON[entityid];
		}else if( "project" == ganttProperties.barType ){	//NO I18N
			retTitle =  ganttProperties.projectJSON[entityid];
		}
		return truncateString( retTitle , window.resizeGanttCell? 25 : 50 );
	}else{
		return 'N/A';	//NO I18N
	}
}
function setValueToForm(element , val){

	if(element){

		if(val!=null && val !='null'){
	
			element.value = val;
		}else{
			element.value = '';
		}
	}
}

		
function GanttOn_hoverScript()
{
	var cntwidth = parent.jQuery('.ci-desc-count').width();

	parent.jQuery(".gantt-barview-span").on('click', function (e){		callG_BarOnClickfunction();	});
	parent.jQuery(".gantt-barview-span-taskinfo").on('click', function (e){		callG_BarOnClickfunction();	});

	parent.jQuery(".timeline").on('mouseenter', function (e){

		var bar_hover = ganttProperties.bar_hover;
		// if there is already opened layer we should not open new one..
		if(bar_hover != null  && bar_hover != jQuery(this).parent().attr('id')){		return;		}

		jQuery(this).closest('.gantt-barview-div').css('z-index',2);	//NO I18N
		jQuery('.gantt-barview-span').removeClass('gantt-barview-h'); // mouseover effect removed for previous hovered span
		jQuery('.gantt-barview-span-taskinfo').removeClass('gantt-barview-taskinfo-h');

		bar_hover = parent.jQuery(this).attr('id');
		ganttProperties.bar_hover = bar_hover;

		var bar_span =  parent.jQuery( '#'+bar_hover );
		jQuery(this).find('.gantt-barview-span').addClass('gantt-barview-h'); // mouseover effect added for previous hovered span
		jQuery(this).find('.gantt-barview-span-taskinfo').addClass('gantt-barview-taskinfo-h');

		var entityid = bar_span.attr('entityid');
		var s_start = bar_span.attr('taskStart');
		var s_end = bar_span.attr('taskEnd');
		var a_start = bar_span.attr('a_taskStart');
		var a_end = bar_span.attr('a_taskEnd');

		var statusid = bar_span.attr('statusid');
		var projectid = bar_span.attr('projectid');
		var milestoneid = bar_span.attr('milestoneid');
		var marked = bar_span.attr('marked');
		
		//this will be used to set owner and markedowner in g_TaskForm
		var ownerid = ( marked != null && marked == "true" ) ? null : bar_span.attr('ownerid');
		var markedOwnerID = ( marked != null && marked == "true" ) ? bar_span.attr('ownerid') : null;
		
		var x = (e.pageX - parent.jQuery(this).offset().left)-10;
		
		ganttProperties.actionEntityid = entityid;
		ganttProperties.refreshRow = false;
		ganttProperties.scopeid =  bar_span.attr('ScopeId');
		ganttProperties.parentEntity =  milestoneid != null ? "milestone" : "project"; //NO I18N

		parent.jQuery(this).find('.ci-desc-count table').attr('width',cntwidth);

		if( "tasks" == ganttProperties.barType ){
			parent.jQuery('#'+bar_hover+'_DESC').html( parent.jQuery('#TaskBarDesc_DIV').html());

			if( ! ganttProperties.isProjectGnatt ){

				parent.jQuery(this).find('#g_project_title').text(getProjectDisp_Str(projectid));
				parent.jQuery(this).find('#g_project_title').attr('projid',projectid);
			}else{
				parent.jQuery(this).find('#g_project_title').attr('class','hide');
				parent.jQuery(this).find('#MileStoneTitle_IndentArrow').attr('class','hide');
			}
			if(milestoneid != null && milestoneid != 'null'){
				parent.jQuery(this).find('#g_milestone_title').text(getMilestoneDisp_Str(milestoneid));
				parent.jQuery(this).find('#g_milestone_title').attr('mileid',milestoneid);
			}else{
				parent.jQuery(this).find('#show_MileStoneTitle_ForTasks').attr('class','hide');
			}

			setValueToForm(parent.document.g_TaskForm.TASKID , entityid);
			setValueToForm(parent.document.g_TaskForm.entityid , entityid);
			setValueToForm(parent.document.g_TaskForm.refreshRow , 'false');

			setValueToForm(parent.document.g_TaskForm.Task_SCHEDULEDSTARTTIME , s_start);
			setValueToForm(parent.document.g_TaskForm.Task_SCHEDULEDENDTIME , s_end);
			setValueToForm(parent.document.g_TaskForm.Task_ACTUALSTARTTIME , a_start);
			setValueToForm(parent.document.g_TaskForm.Task_ACTUALENDTIME , a_end);

			setValueToForm(parent.document.g_TaskForm.OWNERID , ownerid);
			setValueToForm(parent.document.g_TaskForm.MarkedOwnerID , markedOwnerID);
			setValueToForm(parent.document.g_TaskForm.STATUSID , statusid);
			let task = translate("sdp.common.taskdetails");     // NO I18N
			let comment = translate("sdp.tasks.comments");      // NO I18N
			let worklog= translate("sdp.common.form.worklogdetails");       // NO I18N
			window.top.handleProjectEvents([
				{ selector: '[sdpJs="js-event-GanttActionsTaskLayer-0"]', event: 'click', handler: function(event) { parent.loadProject_MilestoneDetailsInDialog("project",this) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-1"]', event: 'click', handler: function(event) { parent.loadProject_MilestoneDetailsInDialog("milestone",this) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-2"]', event: 'click', handler: function(event) { parent.editGanttBarOwner(); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-3"]', event: 'click', handler: function(event) { parent.submitGanttOwner() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-4"]', event: 'click', handler: function(event) { parent.getG_barStatusList() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-5"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledstarttime','Task') } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-6"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledendtime','Task'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-7"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualstarttime','Task'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-8"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualendtime','Task'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-9"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewTask","100","1000",500,1200,task) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-10"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewTaskComment","100","1000",350,700,comment) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsTaskLayer-11"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("addTimeEntry","100","1000",485,1150,worklog) } }       //No I18N
		    ]);
		}else if( "milestone" == ganttProperties.barType ){	//NO I18N
			
			parent.jQuery('#'+bar_hover+'_DESC').html( parent.jQuery('#MileStoneBarDesc_DIV').html());
		
			if( ! ganttProperties.isProjectGnatt ){	
				parent.jQuery(this).find('#g_project_title').text(getProjectDisp_Str(projectid));
				parent.jQuery(this).find('#g_project_title').attr('projid',projectid);
			}else{
				parent.jQuery(this).find('#g_project_title').attr('class','hide');
			}
			setValueToForm(parent.document.g_MileStoneForm.milestoneid , entityid);
			setValueToForm(parent.document.g_MileStoneForm.entityid , entityid);
			setValueToForm(parent.document.g_MileStoneForm.refreshRow , 'false');

			setValueToForm(parent.document.g_MileStoneForm.scheduledstarttime , s_start);
			setValueToForm(parent.document.g_MileStoneForm.scheduledendtime , s_end);
			setValueToForm(parent.document.g_MileStoneForm.actualstarttime , a_start);
			setValueToForm(parent.document.g_MileStoneForm.actualendtime , a_end);

			setValueToForm(parent.document.g_MileStoneForm.ownerid , ownerid);
			setValueToForm(parent.document.g_MileStoneForm.statusid , statusid);
    		let milestone = translate("sdp.project.heading.milestonedetails");      // NO I18N
    		let comment = translate("sdp.milestone.comments");      // NO I18N
			window.top.handleProjectEvents([
				{ selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-0"]', event: 'click', handler: function(event) { parent.loadProject_MilestoneDetailsInDialog("project",this) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-1"]', event: 'click', handler: function(event) { parent.getProjectMembers() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-2"]', event: 'click', handler: function(event) { parent.getG_barStatusList() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-3"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledstarttime','MileStone'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-4"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledendtime','MileStone'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-5"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualstarttime','MileStone'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-6"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualendtime','MileStone'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-7"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewMilestone",50,300,500,1200,milestone) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsMileStoneLayer-8"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewMilestoneComment",50,300,350,700,comment) } }       //No I18N
		    ]);
		}else if( "project" == ganttProperties.barType ){	//NO I18N
			parent.jQuery('#'+bar_hover+'_DESC').html( parent.jQuery('#ProjectBarDesc_DIV').html());

			setValueToForm(parent.document.g_ProjectForm.projectid , entityid);
			setValueToForm(parent.document.g_ProjectForm.entityid , entityid);
			setValueToForm(parent.document.g_ProjectForm.refreshRow , 'false');

			setValueToForm(parent.document.g_ProjectForm.scheduledstarttime , s_start);
			setValueToForm(parent.document.g_ProjectForm.scheduledendtime , s_end);
			setValueToForm(parent.document.g_ProjectForm.actualstarttime , a_start);
			setValueToForm(parent.document.g_ProjectForm.actualendtime ,  a_end);

			setValueToForm(parent.document.g_ProjectForm.ownerid ,  ownerid);
			setValueToForm(parent.document.g_ProjectForm.statusid , statusid);
			let project = translate("sdp.project.heading.projectdetails");      // NO I18N
			let comment = translate("sdp.projects.comments");       // NO I18N
			window.top.handleProjectEvents([
				{ selector: '[sdpJs="js-event-GanttActionsProjectLayer-0"]', event: 'click', handler: function(event) { parent.getProjectMembers() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-1"]', event: 'click', handler: function(event) { parent.getG_barStatusList() } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-2"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledstarttime','Project'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-3"]', event: 'click', handler: function(event) { parent.loadGanttDate('scheduledendtime','Project'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-4"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualstarttime','Project'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-5"]', event: 'click', handler: function(event) { parent.loadGanttDate('actualendtime','Project'); } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-6"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewProject",50,200,500,1200,project) } },       //No I18N
		        { selector: '[sdpJs="js-event-GanttActionsProjectLayer-7"]', event: 'click', handler: function(event) { parent.submitGanttActionInDialog("viewProjectComment",50,300,350,700,comment) } }       //No I18N
		    ]);
			//parent.jQuery('#'+bar_hover+'_DESC').find('#g_ProjectForm').attr('name','g_ProjectForm'+bar_hover);
		}

		bar_span.find('#g_schedulestart').html(getDateStringGantt(s_start));
		bar_span.find('#g_scheduleend').html(getDateStringGantt(s_end));
		bar_span.find('#g_actualstart').html(getDateStringGantt(a_start));
		bar_span.find('#g_actualend').html(getDateStringGantt(a_end));

		var dispOwnerID = ( markedOwnerID != null ) ? markedOwnerID : ownerid;
		var dispOwner = encodeHTML(getOwnerDisp_Str(dispOwnerID));

        if( bar_span.attr('marked') != undefined && bar_span.attr('marked') == 'true' ){
            dispOwner += "<img src='/images/spacer.gif' class='mark-icon-right pos-rel left3 top-4 fl-none'";		//NO I18N
            dispOwner += " title='"+ parent.translate('task.marked.markedtooltip') +"' rel='uitip'>";					//NO I18N
        }
        bar_span.find('#g_ownerid').html(dispOwner);

		bar_span.find('#g_statusid').html(encodeHTML(getBarStatusDisp_Str(statusid)));

		if( parent.jQuery.inArray( parseInt( projectid ) , ganttProperties.barEditRole ) == -1 ){

			bar_span.find('#g_schedulestart').removeClass('ui-textlink1');
			bar_span.find('#g_schedulestart').off('click');		//NO I18N
			bar_span.find('#g_scheduleend').removeClass('ui-textlink1');
			bar_span.find('#g_scheduleend').off('click');		//NO I18N
			bar_span.find('#g_actualstart').removeClass('ui-textlink1');
			bar_span.find('#g_actualstart').off('click');		//NO I18N
			bar_span.find('#g_actualend').removeClass('ui-textlink1');
			bar_span.find('#g_actualend').off('click');		//NO I18N
			bar_span.find('#g_ownerid').removeClass('ui-textlink1');
			bar_span.find('#g_ownerid').off('click');		//NO I18N
			bar_span.find('#g_statusid').removeClass('ui-textlink1');
			bar_span.find('#g_statusid').off('click');		//NO I18N

			bar_span.find('#hover_addTaskTimeEntry').addClass('hide')
		}

		if( parent.jQuery.inArray( parseInt( projectid ) , ganttProperties.ViewProject ) == -1 ){
			
			bar_span.find('#g_project_title').removeClass('ui-textlink1');
			bar_span.find('#g_project_title').off('click');		//NO I18N
		}
		if( parent.jQuery.inArray( parseInt( projectid ) , ganttProperties.ViewMileStone ) == -1 ){

			bar_span.find('#g_milestone_title').removeClass('ui-textlink1');
			bar_span.find('#g_milestone_title').off('click');		//NO I18N
		}
		bar_span.find('#g_title').text(getTitleDisp_Str(entityid));
		if( bar_span.attr('percentComplete') != undefined && bar_span.attr('percentComplete') != 0 && bar_span.attr('percentComplete') != 100){
			bar_span.find('#g_percent').html(bar_span.attr('percentComplete'));
		}

		jQuery(this).find('.proj-gantt-infopop').css({   //NO I18N

			left: x+'px', 	//NO I18N
			top: '8px' 	//NO I18N
		});
		if(showGanttPopup){	jQuery(this).find('.proj-gantt-infopop').show();	}

	}).on('mouseleave', function(e){

		var infopop = parent.jQuery(this).find('.proj-gantt-infopop');

		if(parent.jQuery('#_CALDIALOG_LAYER').css('visibility') == 'visible')
			jQuery(this).closest('.gantt-barview-div').css('z-index',2);			 //NO I18N
		else if(infopop.css('display') == 'block' && infopop.html() != ''){
			jQuery(this).closest('.gantt-barview-div').css('z-index',2);			 //NO I18N
		}
		if( parent.jQuery('#_CALDIALOG_LAYER').css('visibility') != 'visible' && parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerid').attr('class') != 'hide' && parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusid').attr('class') != 'hide' ){
		    if(calendarOpen(ganttProperties)) {
                return;
            }
			infopop.hide();

			jQuery(this).closest('.gantt-barview-div').css('z-index','auto'); //NO I18N
			parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').html('');
			ganttProperties.bar_hover = null;

			var old_bar_div = parent.jQuery('#old_task').parent(); 
			parent.jQuery('#old_task').remove();

			if(old_bar_div.children()[0] == null){
				var prev_table = old_bar_div.parent().parent().parent().parent()[0];

				var pre_rowCount = parent.jQuery( prev_table ).attr('rowcount');
				var prev_tableid = parent.jQuery( prev_table ).attr('id');

				var new_RowCount = ( parseInt( pre_rowCount ) )-1;

				if( parseInt(new_RowCount) > 0 ){
				
					parent.jQuery( prev_table ).attr('rowcount',new_RowCount);

					old_bar_div.parent().parent().parent()[0].remove();

					var new_hieght = ( parent.ganttProperties.cellHieght * parseInt(new_RowCount) );
					
					parent.jQuery( parent.jQuery( '#name_'+prev_tableid ).children()[0].children[0].children[0] ).css({'height' : new_hieght+'px' });
				}
			}	
		}
	});
}

/* To hide tooltip based on calendar */
function calendarOpen(ganttProperties) {
	var dateEle = false, calendarEle = false;
	// Inline date fields
	var taskElts = ["g_Inline_Task_scheduledstarttime","g_Inline_Task_scheduledendtime","g_Inline_Task_actualstarttime","g_Inline_Task_actualendtime"]; //NO I18N
	var milestoneElts = ["g_Inline_MileStone_scheduledstarttime", "g_Inline_MileStone_scheduledendtime", "g_Inline_MileStone_actualstarttime", "g_Inline_MileStone_actualendtime"]; //NO I18N
	var projectElts = ["g_Inline_Project_scheduledstarttime", "g_Inline_Project_scheduledendtime", "g_Inline_Project_actualstarttime", "g_Inline_Project_actualendtime"] //NO I18N

	checkElement(taskElts);
	!dateEle && checkElement(milestoneElts);
	!dateEle && checkElement(projectElts);

	if(!dateEle) {
		return false;
	}

	// Calendar
	taskElts = ['Task_scheduledstarttime_calendar_parent', 'Task_scheduledendtime_calendar_parent', 'Task_actualstarttime_calendar_parent', 'Task_actualendtime_calendar_parent']; //NO I18N
	milestoneElts = ['MileStone_scheduledstarttime_calendar_parent', 'MileStone_scheduledendtime_calendar_parent', 'MileStone_actualstarttime_calendar_parent', 'MileStone_actualendtime_calendar_parent']; //NO I18N
	projectElts = ['Project_scheduledstarttime_calendar_parent', 'Project_scheduledendtime_calendar_parent', 'Project_actualstarttime_calendar_parent', 'Project_actualendtime_calendar_parent']; //NO I18N

	checkCalendar(taskElts);
	!calendarEle && checkCalendar(milestoneElts);
	!calendarEle && checkCalendar(projectElts);

	function checkElement(elements) {
		jQuery.each(elements, function(index, ele) {
			if(parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#' + ele).attr('class') === 'show') {
				dateEle = true;
			}
		});
	}

	function checkCalendar(elements) {
		jQuery.each(elements, function(index, ele) {
			if(parent.jQuery('#' + ele).attr('aria-hidden') === 'false') {
				calendarEle = true;
			}
		});
	}
	return calendarEle;
}

function getProjectMembers()
	{
		var ids = getIdsForGanttToolTip();
        var projectid = ids[0]
        var milestoneId = ids[1]
        var taskId = ids[2]
	
		var ownerid = parent.jQuery( '#'+ganttProperties.bar_hover ).attr('ownerid');		//NO I18N

		var members_Span = parent.jQuery('#Project_MembersList_'+projectid)[0];

		var closeIcon = "<img src = '/images/spacer.gif' class='ui-cancelicon pos-rel left5' id='GanttOwnerCancelIcon' data-event='click' data-handler='cancelOwnerEdit();' nonce="+sdpNonce+">";
		var techSelectList;
		if(members_Span == null){

			var project_members_Span = document.createElement('span');
	
			techSelectList = document.createElement('Select');
			
			parent.jQuery( techSelectList ).attr('name','memberid');
			parent.jQuery( techSelectList ).attr('id','memberid');

			var membersList = ganttProperties.proj_membersJSON[projectid];

			var mem_Option = document.createElement('Option');
			
			parent.jQuery(mem_Option).val( 'null' ); // NO I18N
			parent.jQuery(mem_Option).html( '--'+getMessageForKey("sdp.project.form.selectowner")+'--' );

			techSelectList.appendChild( mem_Option );

			var technicianValues = new Array();
			
			for(var i=0;i<membersList.length;i++){

				technicianValues[i] = getOwnerDisp_Str( membersList[i] );
			}

			technicianValues.sort(
				function(a, b) {

					if (a.toLowerCase() < b.toLowerCase()) return -1;
					if (a.toLowerCase() > b.toLowerCase()) return 1;
					return 0;
				}
			);

			for(var j=0; j<technicianValues.length; j++){

				// this if check will be used when the user has no permission to reassign..
				if( ganttProperties.usersName_IdJSON[technicianValues[j]] != undefined ){
				
					mem_Option = document.createElement('Option');
			
					parent.jQuery(mem_Option).val( ganttProperties.usersName_IdJSON[technicianValues[j]] );

					parent.jQuery(mem_Option).html( encodeHTML(technicianValues[j]) );

					techSelectList.appendChild( mem_Option );
				}
			}

			parent.jQuery( project_members_Span ).attr('id','Project_MembersList_'+projectid);
			members_Span = project_members_Span.appendChild( techSelectList );

			parent.jQuery('#Project_MembersList').append( project_members_Span );	
		}
		
		parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').html(members_Span.outerHTML+closeIcon);
		$sdEventListener(parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList'))

		parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').find('#memberid').val(ownerid);
		
		//When the owner is unavailable (null), the value is set to null explicitly
		if(parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').find('#memberid').val() == null) {
			parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').find('#memberid').val('null');
		}

		parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerid').attr('class','hide');
		parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#memberid').off('change').on('change',function(){parent.submitGanttOwner(this.value,projectid,milestoneId,taskId)})
	}

function swapJSONKeyValues(userJson){

	var returnJSON = {};
	for(var id in userJson){

		returnJSON[userJson[id]] = id;
	}
	return returnJSON;
}

function getG_barStatusList()
{
    var ids = getIdsForGanttToolTip();
    var projectId = ids[0]
    var milestoneId = ids[1]
    var taskId = ids[2]

	var statusid = parent.jQuery( '#'+ganttProperties.bar_hover ).attr('statusid');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusList').html( parent.jQuery('#Project_BarStatusList').html() );
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusList').find('#g_barstatusid').val(statusid);
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusid').attr('class','hide');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_barstatusid').on('change',function(){parent.submitGanttBarStatus(this.value,projectId,milestoneId,taskId)});
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('[sdpJs="js-event-GanttActionsLayer-cancel"]').on('click',function(){parent.cancelBarStatusEdit()});
}

function cancelBarStatusEdit(){

	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusList').html('');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusid').attr('class','ui-textlink1');
}

function submitGanttBarStatus(val, projectId, milestoneId, taskId)
{
	if( "tasks" == ganttProperties.barType ){
		$tasks.saveGanttTaskChanges({ "task": {"status": { "id": val } } }, projectId, milestoneId, taskId); // NO I18N
		parent.document.g_TaskForm.STATUSID.value = val;
	}else if( "milestone" == ganttProperties.barType ){	// NO I18N

		parent.document.g_MileStoneForm.statusid.value = val;
		parent.document.g_MileStoneForm.submit();

	}else if( "project" == ganttProperties.barType ){	// NO I18N
		
		parent.document.g_ProjectForm.statusid.value = val;
		parent.document.g_ProjectForm.submit();
	}

	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusid').html( encodeHTML(getBarStatusDisp_Str(val)) );
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusList').html('');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_statusid').attr('class','ui-textlink1');
}

function callG_BarOnClickfunction()
{
	if( "tasks" == ganttProperties.barType ){
		
		submitGanttActionInDialog('viewTask','100','1000',500,1200, parent.getMessageForKey("sdp.common.taskdetails"));

	}else if( "milestone" == ganttProperties.barType ){	// NO I18N

		submitGanttActionInDialog('viewMilestone',50,300,500,1200, parent.getMessageForKey("sdp.project.heading.milestonedetails"));

	}else if( "project" == ganttProperties.barType ){	// NO I18N
		
		submitGanttActionInDialog('viewProject',50,200,500,1200, parent.getMessageForKey("sdp.project.heading.projectdetails"));
	}	
}

function truncateString(str,length){

	if(str != null){	return str.truncate(length,'..');	}
}

function setStartEndTimeForMonth(){

	if( parent.ganttProperties.cellType != "MONTH" ){
		
		return;
	}
	var start = new Date(ganttProperties.startPixTime);
	start.setDate(1);
	ganttProperties.startPixTime = start.getTime()

	var end = new Date(ganttProperties.endPixTime);
	end.setDate(1);
	var nextMonth = end.getMonth()+1;
	end.setDate(1);
	if( nextMonth == 12){
		end.setMonth(0);
		end.setMonth(end.getYear()+1);
	}else{
		end.setMonth(nextMonth);
	}

	ganttProperties.endPixTime = end.getTime()-(24*60*60*1000);
}

var Hours_Max = 'TW', Days_Max = 'TM', Months_Max = 'TY';		// NO I18N

function getStartDate(key,value){
	var dateObj = new Date();
	
	if (key == 'Days'){
	
		dateObj.setDate(dateObj.getDate()-value);
		
	}else if (key == 'Months'){		// NO I18N

		dateObj.setMonth(dateObj.getMonth()-value);

	}else if (key == 'Year'){		// NO I18N

		dateObj.setYear(dateObj.getYear()-value);

	}else if (key == 'ThisWeek' || key == 'PreviousWeek'){		// NO I18N

		var day = dateObj.getDay();
		
		if((day-parent.sdp_app.WEEK_START_DAY)<0){	day = (day-parent.sdp_app.WEEK_START_DAY) + 7;

		}else{				day = day-parent.sdp_app.WEEK_START_DAY;				}

		dateObj.setDate(dateObj.getDate()-day);

		if (key == 'PreviousWeek'){	dateObj.setDate(dateObj.getDate()-7);	}

	}else if (key == 'ThisMonth' || key == 'PreviousMonth'){	// NO I18N

		if (key == 'PreviousMonth'){	dateObj.setMonth(dateObj.getMonth()-1);	}
		
		dateObj.setDate(1);
		
	}else if (key == 'ThisYear' || key == 'PreviousYear'){		// NO I18N

		if (key == 'PreviousYear'){	dateObj.setYear(dateObj.getFullYear()-1);		}
		
		dateObj.setMonth(0);
		dateObj.setDate(1);
	}
	return getFormattedDateString(dateObj);
}

function getEndDate(key,value){

	var dateObj = new Date();
	
	if (key == 'Days'){
	
		dateObj.setDate(dateObj.getDate()+value);
		
	}else if (key == 'Months'){		// NO I18N
	
		dateObj.setMonth(dateObj.getMonth()+value);

	}else if (key == 'Year'){		// NO I18N

		dateObj.setYear(dateObj.getYear()+value);

	}else if (key == 'ThisWeek' || key == 'PreviousWeek'){		// NO I18N

		var day = dateObj.getDay();
		
		if((day-parent.sdp_app.WEEK_START_DAY)<0){	day = (day-parent.sdp_app.WEEK_START_DAY) + 7;

		}else{				day = day-parent.sdp_app.WEEK_START_DAY;				}

		dateObj.setDate(dateObj.getDate()+(6-day));

		if (key == 'PreviousWeek'){	dateObj.setDate(dateObj.getDate()-7);	}

	}else if (key == 'ThisMonth' || key == 'PreviousMonth'){	// NO I18N

		if (key == 'PreviousMonth'){	dateObj.setMonth(dateObj.getMonth()-1);		}

		dateObj.setDate(new Date(dateObj.getYear(),dateObj.getMonth()+1,0).getDate());
		
	}else if (key == 'ThisYear' || key == 'PreviousYear'){		// NO I18N

		if (key == 'PreviousYear'){	dateObj.setYear(dateObj.getFullYear()-1);		}

		dateObj.setMonth(11);
		dateObj.setDate(31);
	}
	return getFormattedDateString(dateObj);
}

function getFormattedDateString(dateObj){
	
	var returnStr = dateObj.getFullYear()+"-";

	if (dateObj.getMonth() < 9){	returnStr += "0";	}

	returnStr += (dateObj.getMonth()+1)+"-";
	
	if (dateObj.getDate() < 10){	returnStr += "0";	}

	return returnStr+dateObj.getDate();
}
			
function getQuickSpanValues(key,value){

	return [getStartDate(key,value), getEndDate(key,value)];
}

function ganttcheckperiodval(ele){

	var periodval = jQuery(ele).val()+"";
	var dict = getDetailsHashTable();
	var dates = new Array();
	
	if ( periodval != "" && periodval != "0"){

		if (! (/[/T|P/g]/.test(periodval)) ){
		
			dates =  getQuickSpanValues( dict[periodval.substring(periodval.length-1, periodval.length)], parseInt(periodval.substring(0, periodval.length-1))  );			
		}
		else{
			dates = [getStartDate(dict[periodval]), getEndDate(dict[periodval])];
		}

		jQuery('#gantt_startdate').val(dates[0]);
		jQuery('#gantt_enddate').val(dates[1]);
	}
}

function removeDropDowns(){

	arr = ['HOURS_Div','DAY_Div','MONTH_Div'];	// NO I18N
	for (i=0; i<arr.length; i++){

		var ele = jQuery('#'+arr[i]).find('select');
		ele.remove();
	}
}

function resetDropDowns(){

	arr = ['HOURS_Div','DAY_Div','MONTH_Div','Options_Div'];	// NO I18N
	
	for (i=0; i<arr.length; i++){		jQuery('#'+arr[i]).find('select').val('0');		}
}

function trimValues(id){

	var dict = getDetailsHashTable();
	var option = "",val="0";

	if (jQuery('#gantt_startdate').val() != ""){
	
		if ( id.indexOf('HOURS') != -1 ){		option = val = Hours_Max;	}
		else if ( id.indexOf('DAY') != -1 ){	option = val = Days_Max;		}
		else if ( id.indexOf('MONTH') != -1 ){	option = val = Months_Max;	}
		
		var startdatevalue = getStartDate( dict[option], null );
		var enddatevalue = getEndDate( dict[option], null );
		
		if (enddatevalue != null && startdatevalue != null){

			parent.jQuery('#gantt_startdate').val(startdatevalue);
			parent.jQuery('#gantt_enddate').val(enddatevalue);
			parent.jQuery('#selectrange').val(val);
		}
	}
}

function getDetailsHashTable(){

	return {'D':'Days','M':'Months','Y':'Year','TW':'ThisWeek','TM':'ThisMonth','TY':'ThisYear', 'PW':'PreviousWeek','PM':'PreviousMonth','PY':'PreviousYear'};								// NO I18N
}


function setPreValues(){

	jQuery('#prestarttime').val(jQuery('#gantt_startdate').val());
	jQuery('#preendtime').val(jQuery('#gantt_enddate').val());
}
function cancelQuickSpan(){

	jQuery('#gantt_startdate').val(jQuery('#prestarttime').val());
	jQuery('#gantt_enddate').val(jQuery('#preendtime').val());
	
	setPreDropDownValue();
	parent.selectGanttCellTimeType(jQuery('#precelltype').val(),false);
	
	document.getElementById('datesetting-list').style.display='none';

	// disp-ib class is added in ZSDPCalendar.js file, since the dropdown closes when mouse moves outside the dropdown, added this class to keep the dropdown open even after selecting date.
	jQuery('#datesetting-list').removeClass('disp-ib');
}

function setPreDropDownValue(){

	var divName = getQuickSpanDivName(parent.jQuery('#preselectrange').val());
	if ( divName == null || divName == undefined ){

		var cellTypeArray = ['DAY','MONTH','HOURS'];	//NO I18N
		for (i=0;i<cellTypeArray.length;i++){

			if ( document.getElementById('GanttCellTimeType_'+cellTypeArray[i]).className == 'btnswitch2 btnswitch2-active' ){

				divName = cellTypeArray[i]+'_Div';
				break;
			}
		}
	}
	parent.document.getElementById('Options_Div').innerHTML = parent.jQuery('#'+divName).html();
	parent.jQuery('#Options_Div').find('.ui-formcombo').removeAttr('id').attr('id','selectrange');	// NO I18N
	parent.jQuery('#selectrange').val( parent.jQuery('#preselectrange').val() );
	
	var selectedElement = parent.document.getElementById('selectrange')[parent.document.getElementById('selectrange').selectedIndex];

	if (parent.document.getElementById('selectrange').selectedIndex != 0){

		parent.document.getElementById('gannt_quickspan_dispaly_date').innerHTML = '[ '+selectedElement.innerHTML+' ]';
		parent.jQuery('#gannt_quickspan_dispaly_date').attr('title',selectedElement.title);
	}
}
function getQuickSpanDivName(key){

	var hash = {"TM":"DAY_Div", "PM":"DAY_Div", "15D":"DAY_Div", "1M":"DAY_Div", "2M":"DAY_Div", "3D":"HOURS_Div", "7D":"HOURS_Div",  "6M":"MONTH_Div", "3M":"MONTH_Div", "PY":"MONTH_Div", "TY":"MONTH_Div"};		//NO I18N

	return hash[key];
}

function setGanttBottom_RightScroll()
{
	parent.jQuery("#gantt-left-section").on('scroll', function (){
		parent.jQuery("#gantt-timeline").scrollTop(parent.jQuery("#gantt-left-section").scrollTop());
	});
	parent.jQuery("#gantt-timeline").on('scroll', function (){
		parent.jQuery("#gantt-left-section").scrollTop(parent.jQuery("#gantt-timeline").scrollTop());
		parent.jQuery("#gantt-headerrow").scrollLeft(parent.jQuery("#gantt-timeline").scrollLeft());
	});
}

function getDateSpanForEntity(entityid, rowSpan , techId){

	
	var jsonObject = ganttProperties.projectTimeJSON;

	if( ganttProperties.rowType == "milestone" ){

		jsonObject = ganttProperties.milestoneTimeJSON;				
		
	}
	var dateStr = jsonObject[entityid];
	if (dateStr == undefined && ganttProperties.rowType == "milestone"){

		dateStr = ganttProperties.projectTimeJSON[entityid.substring(2,entityid.length)];
	}

	var spanEle = document.createElement('span');
	parent.jQuery(spanEle).attr('id','name_time_'+techId);
	parent.jQuery(spanEle).addClass('fr').css('font-size','11px');	//NO I18N
		
	if (dateStr != "" && dateStr != undefined){		spanEle.appendChild(document.createTextNode(" "+dateStr));		}

	rowSpan.appendChild(document.createElement("br"));
	rowSpan.appendChild(spanEle);
}

function setShowingMileStoneDuration(){

	var milestoneId = parent.document.getElementById('gantt_milestoneid').value;
	var mileHeader = parent.document.getElementById('header_selected_milestone_duration');
	var selectedMile = parent.getOptionInnerHTML(parent.document.getElementById('gantt_milestoneid') , milestoneId);

	if(selectedMile.length > 50){		selectedMile = selectedMile.substring(0,50)+'...';		}

	parent.document.getElementById('header_selected_milestone').innerHTML = selectedMile;

	if(milestoneId != "0"){

		mileHeader.innerHTML = parent.ganttProperties.milestoneTimeJSON[milestoneId];
			
	}else if (parent.document.getElementById('gantt_projectid').value != "0"){

		mileHeader.innerHTML = parent.ganttProperties.projectTimeJSON[parent.document.getElementById('gantt_projectid').value];//NO I18N	
	}
	if(mileHeader.innerHTML == "undefined"){
	
		mileHeader.innerHTML = "";
	}
}
function getOptionInnerHTML(ele , value){
			
	var length = ele.options.length;

	for(var i=0;i<length;i++){

		if( ele[i].value == value ){		return	ele[i].innerHTML; 	}
	}
}
function resizegantt() {
	var outerpanelpos = parent.jQuery('.gantt-grid-outerpanel').position(); //NO I18N
	var tabletop1 = outerpanelpos.top;
	var gantttableheight = parent.jQuery(document).height() - tabletop1 - 80 + "px"; //NO I18N
    	if( gantttableheight > 550+'px' )
	{
		parent.jQuery("#gantt-table").attr("height", gantttableheight); //NO I18N
		//parent.jQuery('#gantt-table tr:first-child').height(jQuery('.gantt-controls-left').height());
		parent.jQuery('#gantt-left-section').height(parent.jQuery('.gantt-grid-separator').height()-20+'px'); //NO I18N
		parent.jQuery('#gantt-timeline').height(parent.jQuery('.gantt-grid-separator').height()); //NO I18N
	}
}

function editGanttBarOwner(){
	
	var showMarkAssign = 'true';
	
	parent.getProjectMembers();
	
	var mark_Assign = 'Mark';					//NO I18N
	
	if( parent.jQuery( '#'+ganttProperties.bar_hover ).attr('marked') === undefined ){
		
		mark_Assign = 'Assign';					//NO I18N
	}
	
	if( parent.jQuery( '#'+ganttProperties.bar_hover ).attr('ownerid') !== undefined && parent.jQuery( '#'+ganttProperties.bar_hover ).attr('marked') === undefined ){
		
		//this condition will match only for Assigned task
		showMarkAssign = 'false';
	}
	
	if( showMarkAssign === 'true' ){
		
		parent.jQuery('#Gantt_Mark_Assign_Button').removeClass('hide');
		parent.jQuery('#Gantt_Mark_Assign_Button').addClass('ganttmarkassign');
		
		parent.jQuery('#GanttLayer_Status').attr('class','hide');
		
		parent.jQuery('#OwnerStatusSeparator').addClass('hide');

		parent.jQuery('#g_ownerList').find('#memberid').off('change');		//NO I18N
		
		parent.jQuery('#GanttOwnerSaveIcon').after( parent.jQuery('#GanttOwnerCancelIcon') );
	}
	
	toggleMark_AssignStyle(mark_Assign, parent.jQuery('#Gantt_Mark_Assign_Button'));
	
	parent.jQuery('#MarkedStatus').val(mark_Assign);
	window.top.handleProjectEvents([
		{ selector: '[sdpJs="js-event-MarkAssignButton-0"]', event: 'click', handler: function(event) { setMarkAssigntoggle('Mark', this.form) } }, //No I18N
        { selector: '[sdpJs="js-event-MarkAssignButton-1"]', event: 'click', handler: function(event) { setMarkAssigntoggle('Assign', this.form) } } //No I18N
    ]);
}

function cancelOwnerEdit(){

	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').html('');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerid').attr('class','ui-textlink1');
	
	parent.jQuery('#Gantt_Mark_Assign_Button').addClass('ganttmarkassign hide');
	
	parent.jQuery('#Gantt_Mark_Assign_Button').find('#GanttOwnerCancelIcon').remove();
	
	parent.jQuery('#OwnerStatusSeparator').removeClass('hide');
	
	parent.jQuery('#GanttLayer_Status').attr('class','show');
}

function submitGanttOwner(val, projectId, milestoneId, taskId)
{
	if( "tasks" === ganttProperties.barType ){
		
		val = parent.jQuery('#Gantt_Mark_Assign_Button').parent().find('#memberid')[0].value;		// NO I18N

		var input_data = {"task": {}} // NO I18N
        if(val !== 'null'){
            if(parent.jQuery("#Gantt_Mark_Assign_Button").find("[name=MarkedStatus]").val() == "Mark"){
                input_data.task.marked_owner = {id: val};
            }else{
                input_data.task.owner = {id: val};
            }
        }else{
            input_data.task.owner = null;
        }

        if(!projectId) {
            var ids = getIdsForGanttToolTip();
            projectId = ids[0]
            milestoneId = ids[1]
            taskId = ids[2]
        }

        $tasks.saveGanttTaskChanges(input_data, projectId, milestoneId, taskId)

	}else if( "milestone" === ganttProperties.barType ){	// NO I18N

		parent.document.g_MileStoneForm.ownerid.value = val;
		parent.document.g_MileStoneForm.submit();

	}else if( "project" === ganttProperties.barType ){	// NO I18N
		
		parent.document.g_ProjectForm.ownerid.value = val;
		parent.document.g_ProjectForm.submit();
	}	

	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerid').html( encodeHTML(getOwnerDisp_Str(val)) );
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerList').html('');
	parent.jQuery('#'+ganttProperties.bar_hover+'_DESC').find('#g_ownerid').attr('class','ui-textlink1');
		
	parent.jQuery('#Gantt_Mark_Assign_Button').find('#GanttOwnerCancelIcon').remove();
	parent.jQuery('#Gantt_Mark_Assign_Button').addClass('ganttmarkassign hide');
	parent.jQuery('#OwnerStatusSeparator').removeClass('hide');
	parent.jQuery('#GanttLayer_Status').removeClass('hide');
	
}

function disableDocumentClicks(e){
   
	e.stopPropagation();
    e.preventDefault();
}

function submitExportAsPDFForm()
{
	parent.Store.removeCookie('pdfExport');		//NO I18N

    /* Issue in asset-viz.js when there is no dependency between tasks temporary workaround for now */
	if(document.exportasPDFForm.exportPDFFrom && document.exportasPDFForm.exportPDFFrom.value == "TaskDependencies") {
		parent.document.exportasPDFForm.pagewidth.value = parent.jQuery('#cmdbViz-canvas').width();
		parent.document.exportasPDFForm.pageheight.value = parent.jQuery('#cmdbViz-canvas').height();
		if(parent.clientTime > 20000) {
			var clientTimeEnd = (new Date()).getTime();
			parent.clientTime = clientTimeEnd-parent.clientTime;
		}
	}

	document.exportasPDFForm.timeLapse.value=parent.clientTime;
	parent.jQuery('#exportpdf').css('opacity', '0.5');		//NO I18N

	/* Removing existing form data to prevent sending duplicate params when generating pdf multiple times without page refresh */
    parent.jQuery(".exportFormElement").remove();

	/* Copying gantt data from other separate forms to export form */
	parent.jQuery("#ganttExport").append("<div class='exportFormElement'></div>"); // NO I18N
	//Adding resize element to the export form
    var resizeEle = document.createElement('input')
    resizeEle.id = "gantt_resize_chart"
    resizeEle.name = "gantt_resize_chart"
    resizeEle.value = window.resizeGanttCell? true : false
    document.querySelector('.exportFormElement').appendChild(resizeEle)
	parent.jQuery("#gantt_bar").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_celltype").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_rowtype").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_bartype").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("[name=gantt_showactual]").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_projectstatus").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_projectid").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_milestoneid").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#selectrange").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_startdate").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("#gantt_enddate").clone().appendTo(".exportFormElement"); // NO I18N
	parent.jQuery("[name=gantt_colorcode]").parent().parent().clone().appendTo(".exportFormElement"); // NO I18N

    /* Hiding all export form elements to prevent UI issue when exporting multiple times */
	parent.jQuery(".exportFormElement").css("display", "none"); // NO I18N

	/* Project/Milestone filter data is not personalized so manually setting it to export form for WYSWYG support */
	if(document.getElementById('gantt_projectid')) {
		parent.jQuery("#ganttExport #gantt_projectid").val(document.getElementById('gantt_projectid').value).change();
	}
	if(document.getElementById('gantt_milestoneid')) {
		parent.jQuery("#ganttExport #gantt_milestoneid").val(document.getElementById('gantt_milestoneid').value).change();
	}
	if(document.getElementById('gantt_projectstatus')) {
		parent.jQuery("#ganttExport #gantt_projectstatus").val(document.getElementById('gantt_projectstatus').value).change();
	}
	if(document.getElementById('selectrange')) {
		parent.jQuery("#ganttExport #selectrange").val(document.getElementById('selectrange').value).change();
	}
	if(window.resizeGanttCell) {
        var pdfWidth = Number(document.querySelector('#ganttExport [name="pagewidth"]').value) + 2000 // NO I18N
        document.querySelector('#ganttExport [name="pagewidth"]').value = '' + pdfWidth // NO I18N
    }

    /* Below if block is for Gantt Range issue SD-101921 */
    var url = new URL(window.location.href)
    var projectId = url.searchParams.get('projectid')
    if(projectId) { //Restricting for gantt inside a project.
        var formEle = exportasPDFForm.querySelector('.exportFormElement') //NO I18N
        var projectIdEle = document.createElement('input');
        projectIdEle.id = 'projectid';
        projectIdEle.name = 'projectid';
        projectIdEle.type = 'text';
        var url = new URL(window.location.href)
        projectIdEle.value = url.searchParams.get('projectid')
        formEle.appendChild(projectIdEle);

        //The below element is set to project title in the filter during export, since the select element will contain only first 500 records.
        var projectTitleEle = document.createElement('input');
        projectTitleEle.id = 'project_title';
        projectTitleEle.name = 'project_title';
        projectTitleEle.type = 'text';
        var valueToSet = (parent.document.getElementById('header_project_title').textContent).substring(0,50);
        valueToSet = valueToSet.split('&').join(''); //Replacing & in title if present.
        projectTitleEle.value = valueToSet;
        formEle.appendChild(projectTitleEle);
    }
	var formData = jQuery('#ganttExport').serializeArray();

  	// Log the key-value pairs to the console
	const map={pagewidth:'width',pageheight:'height'} //NO I18N
	  const opt={
		url:`/GanttAction.do?mode=read&requestFrom=exportPDF`,
		showLoading:()=>{jQuery('#exportpdf').append('<span id="depLoader" class="icon-sm spinner-icon1 vmiddle top-2 ml10"></span>').addClass("ptr-ev-none");},   		//NO I18N
		hideLoading:(isSuccess)=>{
	    	parent.jQuery('#exportpdf').removeClass("ptr-ev-none").css('opacity', '1.0');		//NO I18N
	    	jQuery('#depLoader').remove();
			var msgKey = isSuccess ? 'sdp.export.pdf.completed' : 'sdp.export.pdf.failure';		//NO I18N
			showalert("success", translate(msgKey), "isAutoHide=true");
		},
		pdf:{
			scale:1.8
		},
		fileName:`ProjectGanttView_${sdp_user.LOGGEDIN_USERID}`
	  }
  	formData.map((data,i)=>{
		const {name,value}=data;
		if(name.startsWith("gantt_")){
			opt["url"]+=`&${name}=${value}`;
		}
		map[name]?opt[map[name]]=Math.round(value):""
	})
	opt["height"]+=500;
	exportPdf(opt);
	parent.jQuery('#_DIALOG_CONTENT').position({of:jQuery(window)});
}

function expandOrResetChart(e) {
	e.target.checked? resizeCell() : restoreCellSize()
}

function resizeCell(forExport) {
	window.resizeGanttCell = true
	forExport !== true && refreshGantt()
}

function restoreCellSize() {
	window.resizeGanttCell = false
	refreshGantt()
}
