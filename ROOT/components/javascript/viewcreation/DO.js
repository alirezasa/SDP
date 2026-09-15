/* $Id$ */
/*
 JS Flavour  of Dataobject
 Use it as a model and do manipulations.
 For sending ti to server use constructXML method convert 
     into xml and send it through a hidden field in a form.

 USAGE:
     var daob = new DataObject();
     daob.addRowsForTable("table1",new Array(new Array("prop1","value1"),new Array("prop2","value2")));
     daob.addRowsForTable("table1",new Array(new Array("prop1","value3"),new Array("prop2","value4"))); 
     [Use DOUtility.java to convert a java based dataobject to js ].
*/



function DataObject()
{
  this.tableToRowList = new Object(); //Contains the mapping between tables and rows
  this.tableArray = new Array(0);
  this.getRowsForTable = getRowsForTable;
  this.addRowsForTable = addRowsForTable; 
  this.containsTable = containsTable; 
  this.addNewTable = addNewTable;
  this.setColumn = setColumn;
  this.deleteFirstRow = deleteFirstRow; 
  this.deleteAllRowsInTable = deleteAllRowsInTable;  
  this.getTables = getTables;
  this.getRows = getRows; 
  this.getFirstRow = getFirstRow; 
  this.displayDO = displayDO; 
  this.constructXML = constructXML; 
  
}

function getRowsForTable(tableName)
{
   //this will return an array of rows in the table
   return this.tableToRowList[tableName]; 
}

//arr is  a two dimensional array containing property value pairs
function addRowsForTable(tableName,arr)
{

   if(!this.containsTable(tableName))
   {  
      this.addNewTable(tableName);

   }

   //this will add rows for a particular table
   var arrRows =  this.tableToRowList[tableName]; 
   arrRows[arrRows.length]  = createRow(arr);   
   return true;
}

//create row object from a two dimensional array
function createRow(col)
{
   var row = new Object();    
   for(var i=0;i<col.length;i++ )
   {
      // the second array is of the format property value pair            
      row[col[i][0]] = col[i][1]; 
    
   }
   
   return row;

}



function containsTable(tableName)
{
    var count =  this.tableArray.length;
    for (var i=0;i<count;i++)
    {
      if(this.tableArray[i] == tableName)
      {
        return true; 
      }      
    }

   return false;
}

function addNewTable(tableName)
{ 
   this.tableArray.push(tableName);
   this.tableToRowList[tableName] = new Array(0);
   return;
   
}


function setColumn(tableName,colName,value)
{
   if(!this.containsTable(tableName))
   {
      return false;
   }

   var objArray = this.tableToRowList[tableName];
   //iterate all the objects
   for(var i in objArray)
   {
      // iterate all the properties in an object to identify the column    
      for(var j in  objArray[i])
      {
          if(j == colName)              
            { 
               objArray[i][j]  = value;
            }

      } 
   } 
   
   
   return true; 
}

function deleteFirstRow(tableName,colName,value)  
{
   
   if(!this.containsTable(tableName))
   {
      return false;
   }

   var objArray = this.tableToRowList[tableName];
   var deleteRowObjectIndex = null;
   
   //iterate all the row objects
   for(var i in objArray)
   {
      // iterate all the column properties in a row object to identify the column    
      for(var j in  objArray[i])
      {
          if(j == colName  && objArray[i][j] == value  )              
            { 
                deleteRowObjectIndex = i;          
            }

      } 
   }
  
   //delete the particular index and set it
   objArray.splice(deleteRowObjectIndex,1);
   this.tableToRowList[tableName] = objArray 
   
   
   return true; 
  
  
}



//delete rows that satisfy a condition
function deleteAllRowsInTable(tableName,colName,value)    
{
   
   if(!this.containsTable(tableName))
   {
      return false;
   }



   var objArray = this.tableToRowList[tableName];
   
   // store the rows to be deleted in an array
   var delRows = new Array(0);
   
   //iterate all the row objects
   for(var i in objArray)
   {
      // iterate all the column properties in a row object to identify the column    
      for(var j in  objArray[i])
      {
         
          if(j == colName  && objArray[i][j] == value  )              
            {
                  delRows.push(i);   
                  
            }

      } 
   }
     

      

    var tempArray = new Array(0);
    var deleteRow = false; 
    for(var i in objArray)
    {
       // reinit 
       deleteRow = false;
 
       for(var j in delRows)
       {
          // if the index of the array matches with deleting index 
          if(i == delRows[j])
          {
             deleteRow = true;
           } 
       }  
       if(!deleteRow) 
       {
          tempArray.push(objArray[i]);

        }
     
    }  
   
    objArray = tempArray;
   
   //delete the particular index and set it
   this.tableToRowList[tableName] = objArray 
   

 
   //To delete all rows set an empty array
   //this.tableToRowList[tableName] = new Array(0); 
   
   return true; 
  
}


function getTables()
{

  return this.tableArray;

}


function getFirstRow(tablename,columnname,value)
{
  
  var tables = this.getTables(); // returns an array of tables
  var rows = this.getRowsForTable(tablename);
      
      // iterate all the rows in the table 
      for(var index in rows)
       {
            for(var name in rows[index]) // iterate the columns
            {
                if(rows[index][name] == value )     
                {
                    //return the specific row
                    return rows[index] ;    
                }
            }
            
       }


     return null;
}


function getRows(tablename,columnname,value)
{
  var returnRows = new Array(0);
   
  var rows = this.getRowsForTable(tablename);
      
      // iterate all the rows in the table 
      for(var index in rows)
       {
            for(var name in rows[index]) // iterate the columns
            {
                if(name == columnname && rows[index][name] == value )     
                {
                    
                     returnRows.push(rows[index]) ;    
                }
            }
            
       }


     return returnRows;
}



function displayDO()
{
  
  var tables = this.getTables(); // returns an array of tables
  var content = ""; 
  for(var k in tables)
  {
      var rows = this.getRowsForTable(tables[k]);
      content = content + "<br>Table  :"+tables[k]; 
      // iterate all the rows in the table 
      for(var index in rows)
       {
            for(var name in rows[index]) // iterate the columns
            {
                content = content + "<br>Row number"+ index + ":    " +"<i>Property name </i>   " + encodeHTML(name) + "   <i>Value</i>   " + encodeHTML(rows[index][name]) + "      ";// No I18N
            }
            content = content + "<br>";


       }
    }
  return content;
}

function constructXML()
{

  
  var tables = this.getTables();
  var outputXML = "<Data>"; 
   
  for(var k=0; k < tables.length; k++)
  {
     
     var rows = this.getRowsForTable(tables[k]);
	 // iterate all the rows in the table 
     for(var index=0; index < rows.length; index++)
       {
         outputXML = outputXML + "<" + tables[k] ;
         for(var columnname in rows[index])
         {
		 if( typeof(rows[index][columnname]) == "string" &&  rows[index][columnname] != null  && (!((rows[index][columnname]).length == 0)))
	     {
		     var value = rows[index][columnname];
			 if(value.indexOf("&") != -1)
		     {
			     value = value.replace(/&/g,"&amp;");
		     }
		     // fetch column name and fetch value
		     outputXML = outputXML +" " + columnname+ "=\"" + value +"\" " ;
	     }   
           
            else if(typeof(rows[index][columnname]) != "string"  && (!((rows[index][columnname]).length == 0)))
            {
               outputXML = outputXML +" " + columnname+ "=\"" + rows[index][columnname] +"\" " ;

             }
             

         }
        outputXML = outputXML + "/>"
     }
    

  } 
   //document.write(outputXML);   
   outputXML = outputXML +  "</Data>";

   return outputXML;

}


function demo()
{
   //create a new dataObject and display
   var daob = new DataObject();
 
   daob.addRowsForTable("table1",new Array(new Array("prop1","value1"),new Array("prop2","value2")));// No I18N

   daob.addRowsForTable("table1",new Array(new Array("prop1","value3"),new Array("prop2","value4")));// No I18N

   daob.addRowsForTable("table2",new Array(new Array("prop1","value1"),new Array("prop2","value2")));// No I18N
 
   //get the rows of a table and display
   var rows = daob.getRowsForTable("table1");// No I18N

   document.write("<B>Initial values</B><br>");// No I18N 
   //iterate the rows
   document.write(daob.displayDO());

   // update a row and display
   daob.setColumn("table1","prop1","newValue") ;// No I18N
   document.write("<br><br><B>After Updation:</B><br>")// No I18N
   document.write(daob.displayDO());

  //getTables
   document.write("<br><br><B>Get Tables:</B><br>")// No I18N
   var tableNameArray = daob.getTables()
   for(var k in tableNameArray)
   {
       document.write("<br>Table "+ k + " :  "+tableNameArray[k])   // No I18N
    }


 //delete Row
  daob.deleteAllRowsInTable("table1","prop1","newValue")// No I18N  
  document.write("<br><br><B>After Deletion:</B><br>")// No I18N
  document.write(daob.displayDO());


}
