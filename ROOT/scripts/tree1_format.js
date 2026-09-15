var TREE1_FORMAT =
[
//0. left position
	1,
//1. top position
	2,
//2. show +/- buttons
	true,
//3. couple of button images (collapsed/expanded/blank)
	["/images/c.gif", "/images/e.gif", "/images/b.gif"],
//4. size of images (width, height,ident for nodes w/o children)
	[16,16,16],
//5. show folder image
	true,
//6. folder images (closed/opened/document)
	["/images/fc.gif", "/images/fe.gif", "/images/fc.gif"],
//7. size of images (width, height)
	[18,18],
//8. identation for each level [0/*first level*/, 16/*second*/, 32/*third*/,...]
	[0,16,32,48,64,80,96,112,124],
//9. tree background color ("" - transparent)
	"",
//10. default style for all nodes
	"clsNode",
//11. styles for each level of menu (default style will be used for undefined levels)
	[],//["clsNodeL0","clsNodeL1","clsNodeL2","clsNodeL3","clsNodeL4"],
//12. true if only one branch can be opened at same time
	false,
//13. item padding and spacing
	[1,0],
/************** PRO EXTENSIONS ********************/
//14. draw explorer like tree ( identation will be ignored )
	true,
//15. Set of explorer images (folder, openfolder, page, minus, minusbottom, plus, plusbottom, line, join, joinbottom)
	["/images/fe.gif", "/images/fe.gif", "/images/cat.gif","/images/e.gif","/images/corner_minus.gif","/images/c.gif","/images/corner_plus.gif","/images/bar.gif","/images/tee.gif","/images/corner.gif"],
//16. Explorer images width/height
	[19,16],
//17. if true state will be saved in cookies
	true,
//18. if true - relative position will be used. (tree will be opened in place where init() was called)
	true,
//19. width and height of initial rectangle for relative positioning
	[180,150],
//20. resize background //works only under IE4+, NS6+ for relatiive positioning
	true,
//21. support bgcolor changing for selected node
	true,
//22. background color for non-selected and selected node
	["#FFFFFF","#DEE6F6", "clsNode a"]
];
//#CDCDCD
//#3995CD
//#DEE6F6
