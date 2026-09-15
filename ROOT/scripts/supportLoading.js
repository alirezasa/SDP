var count = 3;
var running = true;
var fileLink = "";
var firstTime =0;



function showDownloadingMsg()
{
  var id = "Waiting";//No I18N
  document.getElementById(id).style.display = 'none';
  id = "Loading";//No I18N
  document.getElementById(id).style.display = 'block';
  showEstimatedTime();
}

function showEstimatedTime()
{
  if(running)
  {
    count--;
    var id = "div1";//No I18N
    document.getElementById(id).innerHTML= document.getElementById('creatingfile').innerHTML+'<br><span class="sb">'+document.getElementById('timeleft').innerHTML+' '+count+' '+document.getElementById('seconds').innerHTML+'</span><br>';

    if(count <= 1)
    {
    running = false;
    setTimeout(function() { showSuccessMsg(); }, 1000);
    }
    setTimeout(function() { showEstimatedTime(); }, 1000);
  }
}

function generateAndDownloadSupportFile()
{
  if(firstTime == 0)
  {
    firstTime++;
    document.getElementById("supportCreationFrame").src=document.getElementById("hiddensupporturl").href;
  }
  checkForCookie = setInterval(function()
  {
    var cookieName = "isLogFileDownloaded=" //No I18N
    var cookies = document.cookie.split(';');
    for(var i=0; i<cookies.length; i++) 
    {
      var cookie = cookies[i];
      while (cookie.charAt(0)==' ') 
      {
        cookie = cookie.substring(1)
      }
      if (cookie.indexOf(cookieName) != -1)
      {
        fileName = cookie.substring(cookie.indexOf("=")+1)
        Store.removeCookie("isLogFileDownloaded"); //No I18N
        showDownloadingMsg();
        clearInterval(checkForCookie)
        break;
      } 
    }  
  },1000); //No I18N
}
function showSuccessMsg()
{
  var id = "Loading";//No I18N
  document.getElementById(id).style.display = 'none';
  id = "Showing";//No I18N
  document.getElementById(id).style.display = 'block';
}
function openSupportFileLink()
{
  document.getElementById("linkToDownload").href = "/workorder/FileDownload.jsp?module=support";
}
