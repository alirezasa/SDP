 org.owasp.esapi.ESAPI.initialize();

function encodeHTML( data )
{
	if( !data )
	{
		return data;
	}
	return ZSEC.Encoder.encodeForHTML(data);
}
function decodeHTML( data )
{
    if( !data )
    {
            return data;
    }
    return $ESAPI.encoder().decodeForHTML( data );
}
function encodeHTMLAttribute( data )
{
	if( !data )
	{
		return data;
	}
	return ZSEC.Encoder.encodeForHTMLAttribute(data);
}
function decodeHTMLAttribute( data )
{
    if( !data )
    {
            return data;
    }
    return $ESAPI.encoder().decodeForHTMLAttribute( data );
}

function replaceHTMLCode( htmltext )
{
	if( htmltext == null )
	{
		return htmltext;
	}

	return htmltext.toString().split("\\n").join("\n").replace(/&#34;/g,"\"").replace(/&#39;/g,"'").replace(  new RegExp( "&#47;", 'g'), "/" ).replace( new RegExp( "&#92;" , 'g' ) , "\\" ).replace( new RegExp( "%28" , 'g' ) , "(" ).replace( new RegExp( "%29" , 'g' ) , ")" ).replace( new RegExp( "&#13;" , 'g') , "" );//NO I18N
}
