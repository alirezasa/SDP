// popup functions 
openWins = new Array();
curWin = 0;
function NewWindow(mypage,myname,w,h,scroll,pos,x,y,mode,blockAccessToParentWindow)
{
blockAccessToParentWindow = blockAccessToParentWindow ? blockAccessToParentWindow : false;
ind = myname.indexOf("-");
var temp = myname.substring(0,ind)+myname.substring(ind+1);
myname = temp;
var win=null;
if(scroll!='No' && scroll!='no' && scroll!='NO'){
	scroll="yes";//No I18N
}
if(pos=="random"){LeftPosition=(screen.width)?Math.floor(Math.random()*(screen.width-w)):100;TopPosition=(screen.height)?Math.floor(Math.random()*((screen.height-h)-75)):100;}
if(pos=="center"){LeftPosition=(screen.width)?(screen.width-w)/2:100;TopPosition=(screen.height)?(screen.height-h)/2:100;}
else if((pos!="center" && pos!="random") || pos==null){LeftPosition=x;TopPosition=y}
settings='width='+w+',height='+h+',top='+TopPosition+',left='+LeftPosition+',scrollbars='+scroll+',location=no,directories=no,status=no,menubar=no,toolbar=no,resizable=yes';//No I18N
//openWins[curWin++] = window.open(mypage,myname,settings);
win = window.open(mypage,myname,settings);

//To avoid this child window from accessing parent window
if( blockAccessToParentWindow )
{
	win.opener=null;
}
navapp = navigator.appVersion
if(navapp.indexOf("MSIE 5.0")== -1){
win.focus();
}
if(mode=="changeAsset" || mode=="callback"){
return win;
}
iframeTextoutlook();//SD-70067
darkMode();
}

function NewWindowP(mypage,myname,w,h,scroll,pos,x,y,menu,tool,blockAccessToParentWindow)
{
blockAccessToParentWindow = blockAccessToParentWindow ? blockAccessToParentWindow : false;
ind = myname.indexOf("-");
var temp = myname.substring(0,ind)+myname.substring(ind+1);
myname = temp;
var win=null;
if(scroll!='No' && scroll!='no' && scroll!='NO'){
	scroll="yes";//No I18N
}
if(menu!='No' && menu!='no' && menu!='NO'){
	menu="yes";//No I18N
}
if(tool!='No' && tool!='no' && tool!='NO'){
	tool="yes";//No I18N
}
if(pos=="random"){LeftPosition=(screen.width)?Math.floor(Math.random()*(screen.width-w)):100;TopPosition=(screen.height)?Math.floor(Math.random()*((screen.height-h)-75)):100;}
if(pos=="center"){LeftPosition=(screen.width)?(screen.width-w)/2:100;TopPosition=(screen.height)?(screen.height-h)/2:100;}
else if((pos!="center" && pos!="random") || pos==null){LeftPosition=x;TopPosition=y}
settings='width='+w+',height='+h+',top='+TopPosition+',left='+LeftPosition+',screenX='+x+', screenX='+y+',scrollbars='+scroll+',location=no,directories=no,status=no,menubar='+menu+',toolbar='+tool+',resizable=yes';//No I18N
//openWins[curWin++] = window.open(mypage,myname,settings);
win = window.open(mypage,myname,settings);
//To avoid this child window from accessing parent window
if( blockAccessToParentWindow )
{
	win.opener=null;
}
navapp = navigator.appVersion
if(navapp.indexOf("MSIE 5.0")== -1){
win.focus();
}
}

function closeAll() {
    for(i=0; i<openWins.length; i++) if (openWins[i] && !openWins[i].closed) openWins[i].close();
}

