<%-- $Id$ --%>
<%@ taglib uri = "http://www.adventnet.com/webclient/menu-tags" prefix="menu" %>
<%@ tag import="com.adventnet.client.components.action.web.MenuItemProperties" %>
<%@ tag import="com.adventnet.persistence.*" %>
<%@ tag import="com.adventnet.customview.*" %>
<%@ tag import="com.adventnet.customview.service.*" %>
<%@ tag import="javax.swing.table.TableModel" %>
<%@ tag import="com.adventnet.ds.query.*" %>
<%@ tag import="com.adventnet.ds.query.util.*" %>
<%@ tag import="com.adventnet.client.util.LookUpUtil" %>
<%@ attribute name="name" required="true"%>
<%@ attribute name="serverColumn" required="true"%>
<%@ attribute name="clientColumn" required="false"%>
<%@ attribute name="tableName" required="false"%>
<%@ attribute name="onSelectMethodName" required="false"%>
<%@ attribute name="defaultValue" required="false"%>
<%@ attribute name="defaultValueName" required="false"%>
<%@ attribute name="selectedValue" required="false"%>
<%@ attribute name="cssClass" required="false"%>
<%@ attribute name="style" required="false"%>
<%@ attribute name="attributes" required="false"%>
<%@ attribute name="cvName" required="false"%>
<% 
String[] vals = null; 
if(selectedValue != null) { 
	vals = selectedValue.split(",");
} 
SelectQuery query = null; 
if(tableName != null){ 
	query = new SelectQueryImpl(new Table(tableName)); 
	Column column = new Column(tableName, serverColumn); 
	query.addSelectColumn(column.distinct()); 
	if(clientColumn != null){ 
		Column ccolumn = new Column(tableName, clientColumn); 
		query.addSelectColumn(ccolumn); 
	} 
} 
else if(cvName != null){ 
	Row customViewRow = new Row("CustomViewConfiguration"); 
	customViewRow.set("CVNAME",cvName); 
	DataObject customViewDO = LookUpUtil.getPersistence().get("CustomViewConfiguration", customViewRow); 
	long queryID = ((Long)customViewDO.getFirstValue("CustomViewConfiguration", "QUERYID")).longValue(); 
	query = QueryUtil.getSelectQuery(queryID); 
} 
query.setRange(new Range(1,0)); 
CustomViewRequest cvRequest = new CustomViewRequest(query); 
CustomViewManager cvMgr = LookUpUtil.getCVManagerForTable(); 
ViewData viewData = cvMgr.getData(cvRequest); 
TableModel tableModel = (TableModel) viewData.getModel(); 
StringBuffer buffer = new StringBuffer("<Select name='"); 
buffer.append(name); 
buffer.append("'"); 
if(onSelectMethodName != null){ 
	buffer.append(" onChange='"); 
	buffer.append(onSelectMethodName); 
	buffer.append("(this);'"); 
} 
if(cssClass != null){ 
	buffer.append(" class='"); 
	buffer.append(cssClass); 
	buffer.append("'"); 
} 
if(style != null){ 
	buffer.append(" style='"); 
	buffer.append(style); 
	buffer.append("'"); 
} 
if(attributes != null){ 
	buffer.append(" "); 
	buffer.append(attributes); 
} 
buffer.append(">"); 
if(defaultValue != null){ 
	if(defaultValueName == null){ 
		defaultValueName = defaultValue; 
	} 
	buffer.append("<Option value='" + defaultValue + "'>"); 
	buffer.append(defaultValueName); 
	buffer.append("</Option>"); 
} 
int serInd = 0;
int cliInd = 0;
int size = tableModel.getRowCount(); 
int cols = tableModel.getColumnCount();
for(int j = 0; j < cols; j++){
	String name = tableModel.getColumnName(j);
	if(name != null && name.equals(serverColumn)) {
		serInd = j;
	}
	if(name != null && name.equals(clientColumn)) {
		cliInd = j;
	}
}
for(int i = 0; i < size; i++){ 
	buffer.append("<Option value='"); 
	buffer.append(tableModel.getValueAt(i,serInd).toString()); 
	buffer.append("'"); 
	if(vals != null) {
		for(int j=0; j<vals.length; j++) {
			if(vals[j] != null){ 
				if(vals[j].equals(tableModel.getValueAt(i,serInd).toString())){ 
					buffer.append(" selected "); 
				} 
			} 
		}
	}
	buffer.append(">"); 
	if(clientColumn != null){ 
		buffer.append(tableModel.getValueAt(i,cliInd).toString()); 
	} 
	else { 
		buffer.append(tableModel.getValueAt(i,serInd).toString()); 
	} 
	buffer.append("</Option>"); 
} 
buffer.append("</Select>");
%>
<%=buffer%>
