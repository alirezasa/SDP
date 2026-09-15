/*
 * Flexigrid for jQuery -  v1.1
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */

(function ($) {
	$.addFlex = function (t, p) {
		if (t.grid) return false; //return if already exist
		p = $.extend({ //apply default properties
			height: 200, //default height
			width: 'auto', //auto width
			striped: true, //apply odd even stripes
			novstripe: false,
			/*buttons: [
					{name: 'Add', bclass: 'add', onpress : addInvoked},
					{name: 'Delete', bclass: 'delete', onpress : deleteInvoked},
					{separator: true}
				],*/
			allviews: [
					{views: '-999##--All Data--'}
				],
			minwidth: 30, //min width of columns
			minheight: 80, //min height of columns
			resizable: true, //allow table resizing
			url: false, //URL if using data from AJAX
			method: 'POST', //data sending method
			dataType: 'xml', //type of data for AJAX, either xml or json
			errormsg: 'Connection Error',
			usepager: false,
			nowrap: true,
			page: 1, //current page
			total: 1, //total pages
			useRp: true, //use the results per page select box
			rp: 15, //results per page
			rpOptions: [10, 15, 20, 30, 50], //allowed per-page values 
			title: false,
			pagestat: '{from} to {to} of {total}',
			pagetext: 'Page',
			outof: 'of',
			findtext: 'Find',
			procmsg: getMessageForKey('sdp.admin.ldap.import.error'),
			query: '',
			qtype: '',
			nomsg: getMessageForKey('list_nodata'),
			minColToggle: 1, //minimum allowed column to be hidden
			showToggleBtn: true, //show or hide column toggle popup
			hideOnSubmit: true,
			autoload: true,
			blockOpacity: 0.5,
			preProcess: false,
			customFilterEnabled: true,
			exportEnabled: false,
			columnChooserEnabled: true,
			inlineEditEnabled: true,
			onDragCol: false,
			onToggleCol: false,
			onChangeSort: false,
			onSuccess: false,
			onError: false,
			onSubmit: false, //using a custom populate function
			onChangeColumn: false,
			onReload: false,
			onChangePerPage: false,
			onClickNavigation: false,
			onSortTrigger: false,
			onSaveCustomView: false,
			customViewId: -999,
			navigationButtonClicked: false
		}, p);
		$(t).show() //show if hidden
			.attr({
				cellPadding: 0,
				cellSpacing: 0,
				border: 0
			}) //remove padding and spacing
			.removeAttr('width'); //remove width properties
		//create grid class
		var g = {
			hset: {},
			rePosDrag: function () {
				var cdleft = 0 - this.bDiv.scrollLeft;
				if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
				$(g.cDrag).css({
					top: g.hDiv.offsetTop + 1
				});
				var cdpad = this.cdpad;
				$('div', g.cDrag).hide();
				$('thead tr:first th:visible', this.hDiv).each(function () {
					var n = $('thead tr:first th:visible', g.hDiv).index(this);
					var cdpos = parseInt($('div', this).width());
					if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
					cdpos = cdpos + cdleft + cdpad;
					if (isNaN(cdpos)) {
						cdpos = 0;
					}
					$('div:eq(' + n + ')', g.cDrag).css({
						'left': cdpos + 'px'
					}).show();
					cdleft = cdpos;
				});
			},
			fixHeight: function (newH) {
				newH = false;
				if (!newH) newH = $(g.bDiv).height();
				var hdHeight = $(this.hDiv).height();

				if( hdHeight == 0 )
				{
					//Fix for IE 7
					hdHeight = 30;//Height of flexi header
					newH = p.height;//Height of flexi listview
				}
				$('div', this.cDrag).each(
					function () {
						$(this).height(newH + hdHeight);
					}
				);
				var nd = parseInt($(g.nDiv).height());
				if (nd > newH) $(g.nDiv).height(newH).width(200);
				else $(g.nDiv).height('auto').width('auto');
				$(g.block).css({
					height: newH,
					marginBottom: (newH * -1)
				});
				var hrH = g.bDiv.offsetTop + newH;
				if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
				$(g.rDiv).css({
					height: hrH
				});
			},
			dragStart: function (dragtype, e, obj) { //default drag function start
				
				//Below the fix is used to stop the text selection in chrome browser while doing drag & drop operation - Murugesan K
				if (e && e.preventDefault) {
					e.preventDefault();
				}
				else {
					window.event.returnValue = false;
				}

				if (dragtype == 'colresize') {//column resize
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					var n = $('div', this.cDrag).index(obj);
					var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
					$(obj).addClass('dragging').siblings().hide();
					$(obj).prev().addClass('dragging').show();
					this.colresize = {
						startX: e.pageX,
						ol: parseInt(obj.style.left),
						ow: ow,
						n: n
					};
					$('body').css('cursor', 'col-resize');
				} else if (dragtype == 'vresize') {//table resize
					var hgo = false;
					$('body').css('cursor', 'row-resize');
					if (obj) {
						hgo = true;
						$('body').css('cursor', 'col-resize');
					}
					this.vresize = {
						h: p.height,
						sy: e.pageY,
						w: p.width,
						sx: e.pageX,
						hgo: hgo
					};
				} else if (dragtype == 'colMove') {//column header drag
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					this.hset = $(this.hDiv).offset();
					this.hset.right = this.hset.left + $('table', this.hDiv).width();
					this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
					this.dcol = obj;
					this.dcoln = $('th', this.hDiv).index(obj);
					this.colCopy = document.createElement("div");
					this.colCopy.className = "colCopy";
					this.colCopy.innerHTML = obj.innerHTML;
					if ($.browser.msie) {
						this.colCopy.className = "colCopy ie";
					}
					$(this.colCopy).css({
						'position': 'absolute',
						'float': 'left',
						'display': 'none',
						'textAlign': obj.align
					});
					$('body').append(this.colCopy);
					$(this.cDrag).hide();
				}
				$('body').noSelect();
			},
			dragMove: function (e) {
				if (this.colresize) {//column resize
					var n = this.colresize.n;
					var diff = e.pageX - this.colresize.startX;
					var nleft = this.colresize.ol + diff;
					var nw = this.colresize.ow + diff;
					if (nw > p.minwidth) {
						$('div:eq(' + n + ')', this.cDrag).css('left', nleft);
						this.colresize.nw = nw;
					}
				} else if (this.vresize) {//table resize
					var v = this.vresize;
					var y = e.pageY;
					var diff = y - v.sy;
					if (!p.defwidth) p.defwidth = p.width;
					if (p.width != 'auto' && !p.nohresize && v.hgo) {
						var x = e.pageX;
						var xdiff = x - v.sx;
						var newW = v.w + xdiff;
						if (newW > p.defwidth) {
							this.gDiv.style.width = newW + 'px';
							p.width = newW;
						}
					}
					var newH = v.h + diff;
					if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
						this.bDiv.style.height = newH + 'px';
						p.height = newH;
						this.fixHeight(newH);
					}
					v = null;
				} else if (this.colCopy) {
					$(this.dcol).addClass('thMove').removeClass('thOver');
					if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
						//this.dragEnd();
						$('body').css('cursor', 'move');
					} else {
						$('body').css('cursor', 'pointer');
					}
					$(this.colCopy).css({
						top: e.pageY + 10,
						left: e.pageX + 20,
						display: 'block'
					});
				}
			},
			dragEnd: function () {
				if (this.colresize) {
					var n = this.colresize.n;
					var nw = this.colresize.nw;
					$('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
					$('tr', this.bDiv).each(
						function () {
							$('td:visible div:eq(' + n + ')', this).css('width', nw);
						}
					);
					this.hDiv.scrollLeft = this.bDiv.scrollLeft;
					$('div:eq(' + n + ')', this.cDrag).siblings().show();
					$('.dragging', this.cDrag).removeClass('dragging');
					this.rePosDrag();
					this.fixHeight();
					this.colresize = false;
					g.updateColumnWidth(nw, n);
				} else if (this.vresize) {
					this.vresize = false;
				} else if (this.colCopy) {
					$(this.colCopy).remove();
					if (this.dcolt != null) {
						if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
						else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
						this.switchCol(this.dcoln, this.dcolt);
						$(this.cdropleft).remove();
						$(this.cdropright).remove();
						this.rePosDrag();
						if (p.onDragCol) {
							p.onDragCol(this.dcoln, this.dcolt);
						}

						g.updateColumnPosition($('th:eq(' + this.dcolt + ')', this.hDiv).attr("abbr"));
					}
					this.dcol = null;
					this.hset = null;
					this.dcoln = null;
					this.dcolt = null;
					this.colCopy = null;
					$('.thMove', this.hDiv).removeClass('thMove');
					$(this.cDrag).show();
				}
				$('body').css('cursor', 'default');
				$('body').noSelect(false);
			},
			toggleCol: function (cid, visible) {
				var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
				var n = $('thead th', g.hDiv).index(ncol);
				var cb = $('input[value=' + cid + ']', g.nDiv)[0];
				if (visible == null) {
					visible = ncol.hidden;
				}
				if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
					return false;
				}
				if (visible) {
					ncol.hidden = false;
					$(ncol).show();
					cb.checked = true;
				} else {
					ncol.hidden = true;
					$(ncol).hide();
					cb.checked = false;
				}
				$('tbody tr', t).each(
					function () {
						if (visible) {
							$('td:eq(' + n + ')', this).show();
						} else {
							$('td:eq(' + n + ')', this).hide();
						}
					}
				);
				this.rePosDrag();
				if (p.onToggleCol) {
					p.onToggleCol(cid, visible);
				}
				return visible;
			},
			switchCol: function (cdrag, cdrop) { //switch columns
				$('tbody tr', t).each(
					function () {
						if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
						else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
					}
				);
				//switch order in nDiv
				if (cdrag > cdrop) {
					$('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
				} else {
					$('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
				}
				if ($.browser.msie && $.browser.version < 7.0) {
					$('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
				}
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
			},
			scroll: function () {
				this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				jQuery('.hDivBox').scrollLeft(this.bDiv.scrollLeft);
				this.rePosDrag();
			},
			addData: function (data) { //parse data
				if (p.dataType == 'json') {
					data = $.extend({rows: [], page: 0, total: 0}, data);
				}
				if (p.preProcess) {
					data = p.preProcess(data);
				}
				$('.pReload', this.pDiv).removeClass('loading');
				this.loading = false;
				if (!data) {
					$('.pPageStat', this.pDiv).html(p.errormsg);
					return false;
				}
				if (p.dataType == 'xml') {
					p.total = +$('rows total', data).text();
				} else {
					p.total = data.total;
				}
				if (p.total == 0) {
					$('tr, a, td, div', t).unbind();
					$(t).empty();
					p.pages = 1;
					p.page = 1;
					this.buildpager();
					$('.pPageStat', this.pDiv).html(p.nomsg);
					//return false;
				}
				p.pages = Math.ceil(p.total / p.rp);
				if (p.dataType == 'xml') {
					p.page = +$('rows page', data).text();
				} else {
					p.page = data.page;
				}
				this.buildpager();

				//build new body
				var tbody = document.createElement('tbody');
				if (p.dataType == 'json') {
					$.each(data.rows, function (i, row) {
						var tr = document.createElement('tr');
						/*if (i % 2 && p.striped) {
							tr.className = 'evenRow';
						}*/
						if (row.id) {
							tr.id = 'row' + row.id;
						}
						$('thead tr:first th', g.hDiv).each( //add cell
							function () {
								var td = document.createElement('td');
								var idx = $(this).attr('axis').substr(3);
								td.align = this.align;
								// If the json elements aren't named (which is typical), use numeric order
								if (typeof row.cell[idx] != "undefined") {
									td.innerHTML = (row.cell[idx] != null) ? row.cell[idx] : '';//null-check for Opera-browser
								} else {
									td.innerHTML = row.cell[p.colModel[idx].name];
								}
								$(td).attr('abbr', $(this).attr('abbr'));
								$(tr).append(td);
								td = null;
							}
						);
						if ($('thead', this.gDiv).length < 1) {//handle if grid has no headers
							for (idx = 0; idx < cell.length; idx++) {
								var td = document.createElement('td');
								// If the json elements aren't named (which is typical), use numeric order
								if (typeof row.cell[idx] != "undefined") {
									td.innerHTML = (row.cell[idx] != null) ? row.cell[idx] : '';//null-check for Opera-browser
								} else {
									td.innerHTML = row.cell[p.colModel[idx].name];
								}
								$(tr).append(td);
								td = null;
							}
						}
						$(tbody).append(tr);
						tr = null;
					});
				} else if (p.dataType == 'xml') {
					var i = 1;
					$("rows row", data).each(function () {
						i++;
						var tr = document.createElement('tr');
						//if (i % 2 && p.striped) {
						//	tr.className = 'evenRow';
						//}
						var nid = $(this).attr('id');
						if (nid) {
							tr.id = p.viewId + '_row' + nid;
						}

						//If no data available then need to show the message
						if( nid == -1 )
						{
							var td = document.createElement('td');
							$(td).attr("id", p.viewId + '_nodata');
							$(td).attr("colspan", p.colModel.length);
							$(td).html(p.nomsg);
							$(tr).append(td);
							td = null;
						}

						var robj = this;
						var displaySearchFields = false;
						var colIndex = 0;
						var cellObj = null;

						if( nid != -1 )
						{
							$('thead tr:first th', g.hDiv).each(function ()	{
								var td = document.createElement('td');
								var idx = $(this).attr('axis').substr(3);

								td.align = this.align;

								cellObj = $("cell[id='" + p.colModel[idx].columnid + "']", robj);

								if( cellObj.length > 0 )
								{
									$(td).attr('width', cellObj.attr('width'));

									td.innerHTML = encodeHTML(cellObj.text());

									if( td.innerHTML.indexOf('##SRH##') >= 0 && p.colModel[idx].search ) 
									{
										var tmpData = cellObj.text();
										$(td).empty();
										var input = document.createElement("input");

										$(input).attr("id", 'column_' + p.colModel[idx].columnid);
										$(input).attr("name", "searchInputField");

										input.style.width = '96%';

										if( tmpData.length == 7 )
										{
											if( !displaySearchFields )
											{
												tr.hidden = true;	
												$(tr).hide();
											}
										}
										else
										{
											tr.hidden = false;
											$(tr).show();
											displaySearchFields = true;
											$(input).attr("value_bak", tmpData.substring(8));
										}
										$(td).append(input);
										$(tr).addClass("searchFields");
									}
								}
								else
								{
									$(td).hide();
								}
								$(td).attr('abbr', $(this).attr('abbr'));
								$(td).attr('editable', $(this).attr('editable'));
								$(td).attr('datatype', $(this).attr('datatype'));
								if( p.inlineEditEnabled && p.colModel[idx].editable )
								{
									td.style.cursor = 'text';
								}
								$(tr).append(td);
								td = null;
							});
						}
						nid = null;
						if ($('thead', this.gDiv).length < 1) {//handle if grid has no headers
							$('cell', this).each(function () {
								var td = document.createElement('td');
								td.innerHTML = $(this).text();
								$(tr).append(td);
								td = null;
							});
						}
						$(tbody).append(tr);
						tr = null;
						robj = null;

					});
					$("html_rows", data).each(function () {

						var htmlContent; 
				
						try
						{
							htmlContent = new XMLSerializer().serializeToString(this);
						}
						catch(e)
						{
							htmlContent = this.xml;
						}
						htmlContent = jQuery(jQuery.parseXML(htmlContent)).find('html_rows').text();

						$(tbody).append(htmlContent);
					});
				}
				$('tr', t).unbind();
				$(t).empty();
				$(t).append(tbody);
				tbody = null;
				data = null;

				var nodataObj = jQuery('#' + p.viewId + '_nodata');//NO I18N

				if( nodataObj.length > 0  )
				{
					nodataObj.attr('style', 'text-align:center;padding:5px;');
					jQuery('#' + p.title).attr('width', '100%');
				}
				else
				{
					jQuery('#' + p.title).removeAttr('width');
				}

				i = null;
				if (p.onSuccess) {
					p.onSuccess(this);
				}
				if (p.hideOnSubmit) {
					$(g.block).remove();
				}
				//this.hDiv.scrollLeft = this.bDiv.scrollLeft;
				if ($.browser.opera) {
					$(t).css('visibility', 'visible');
				}

				var colIndex = 0;
				for (var i = 0; i < p.colModel.length; i++)
				{
					var cm = p.colModel[i];

					$("#column_" + cm.columnid).each(function() 
					{
						if( $(this).attr("value_bak") != undefined )
						{
							this.value = $(this).attr("value_bak");
							$(this).removeAttr("value_bak");
						}
						$(this).keydown(function (e) {
							if (e.keyCode == 13) {
								g.doSearch();
							}
						});
					});
				}

				if( p.pages <= 1 )
				{
					jQuery('#first-icon-' + p.viewId).addClass("pFirstDis").removeClass("pFirst");
					jQuery('#last-icon-' + p.viewId).addClass("pLastDis").removeClass("pLast");
					jQuery('#prev-icon-' + p.viewId).addClass("pPrevDis").removeClass("pPrev");
					jQuery('#next-icon-' + p.viewId).addClass("pNextDis").removeClass("pNext");
				}
				else
				{
					jQuery('#first-icon-' + p.viewId).addClass("pFirst").removeClass("pFirstDis");
					jQuery('#last-icon-' + p.viewId).addClass("pLast").removeClass("pLastDis");
					jQuery('#prev-icon-' + p.viewId).addClass("pPrev").removeClass("pPrevDis");
					jQuery('#next-icon-' + p.viewId).addClass("pNext").removeClass("pNextDis");
				}

				if( p.page == 1 )
				{
					jQuery('#first-icon-' + p.viewId).addClass("pFirstDis").removeClass("pFirst");
					jQuery('#prev-icon-' + p.viewId).addClass("pPrevDis").removeClass("pPrev");
				}

				if( p.page == p.pages )
				{
					jQuery('#last-icon-' + p.viewId).addClass("pLastDis").removeClass("pLast");
					jQuery('#next-icon-' + p.viewId).addClass("pNextDis").removeClass("pNext");
				}

				try
				{
					var displayArea = jQuery(document.getElementById('flexigrid_bdiv_' + p.viewId));

					//displayArea.niceScroll({cursorcolor:"#98AFC7"});//NO I18N
					displayArea.niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px", cursoropacitymin: 0.0, background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });//NO I18N
					displayArea.getNiceScroll().resize().show();

					setTimeout('updateListviewActivity(' + p.viewId + ')', 300000);

					listViewPostProcess(p);
				}
				catch(e){}
			},
			changeSort: function (th) { //change sortorder
				if (this.loading) {
					return true;
				}
				$(g.nDiv).hide();
				$(g.nBtn).hide();
				if (p.sortname == $(th).attr('abbr')) {
					if (p.sortorder == 'asc') {
						p.sortorder = 'desc';
					} else {
						p.sortorder = 'asc';
					}
				}
				$(th).addClass('sorted').siblings().removeClass('sorted');
				$('.sdesc', this.hDiv).removeClass('sdesc');
				$('.sasc', this.hDiv).removeClass('sasc');
				$('div', th).addClass('s' + p.sortorder);
				p.sortname = $(th).attr('abbr');
				if (p.onChangeSort) {
					p.onChangeSort(p.sortname, p.sortorder);
				} else {
					p.onReload = true;
					p.onSortTrigger = true;
					this.populate();
				}
			},
			buildpager: function () { //rebuild pager based on new properties
				$('.pcontrol input', this.pDiv).val(p.page);
				$('.pcontrol span', this.pDiv).html(p.pages);
				var r1 = (p.page - 1) * p.rp + 1;
				var r2 = r1 + p.rp - 1;
				if (p.total < r2) {
					r2 = p.total;
				}
				var stat = p.pagestat;
				stat = stat.replace(/{from}/, r1);
				stat = stat.replace(/{to}/, r2);
				stat = stat.replace(/{total}/, p.total);
				$('.pPageStat', this.pDiv).html(stat);
			},

			fetchColumnData: function(columnId, columnValue, pkColumnValue, selectTag)
			{
				var param = [{
					name: 'columnName',
					value: columnId
				}, {
					name: 'columnValue',
					value: columnValue
				}, {
					name: 'fetchColumnValue',
					value: 'true'
				},{
					name: 'pkColumnValue',
					value: pkColumnValue
				}
				];

				param[param.length] = {name: 'viewId', value: p.viewId};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data)
					{
						var length = selectTag.options.length;
						for( i=1; i<length; i++ )
						{
							selectTag.options[i] = null;
						}
						selectTag.options.length = 0;

						var xmlObj = data.getElementsByTagName("row");

						selectTag.options[0] = new Option('--Choose--', '-999');

						for( i = 1; i<=xmlObj.length; i++ )
						{
							selectTag.options[i] = new Option(xmlObj[i-1].getAttribute("value"), xmlObj[i-1].getAttribute("id"));
						}
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						       try {
							       if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						       } catch (e) {}
					       }
				});
			},
			updateColumnData: function(columnId, columnValue, pkColumnValue, dataType)
			{
				if( columnValue == '' || columnValue == '-' || columnValue == '-999' )
				{
					return;
				}
				var param = [{
					name: 'columnName',
					value: columnId
				}, {
					name: 'columnValue',
					value: columnValue
				}, {
					name: 'updateColumnValue',
					value: 'true'
				},{
					name: 'pkColumnValue',
					value: pkColumnValue
				},{
					name: 'dataType',
					value: dataType
				}
				];

				param[param.length] = {name: 'viewId', value: p.viewId};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data) {
						g.addData(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			updateColumnPosition: function(columnName, fromPosition, toPosition)
			{
				var param = [{
					name: 'columnPositionChanged',
					value: 'true'
				}
				];

				$('thead tr:first th', g.hDiv).each(function () {
					var colId = $(this).attr("columnId");
					param[param.length] = {name: 'sortedColumnId', value: colId};
					param[param.length] = {name: 'isVisible_' + colId, value: !$(this).attr("hidden")};
				});

				param[param.length] = {name: 'viewId', value: p.viewId};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data) {
						//g.addData(data);
						reloadListview(p.title);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});

			},
			updateColumnWidth: function (width, columnPosition) {

				if( width == undefined || width == '' )
				{
					return;
				}

				columnName = $('th:visible div:eq(' + columnPosition + ')', this.hDiv).parent().attr("abbr");

				var param = [{
					name: 'columnName',
					value: columnName
				}, {
					name: 'newWidth',
					value: width
				}, {
					name: 'columnSizeChanged',
					value: 'true'
				}
				];

				param[param.length] = {name: 'viewId', value: p.viewId};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data) {
						//g.addData(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			deleteCustomView: function () {
				if (this.loading) {
					return true;
				}

				if( p.customViewId == -999 )
				{
					return true;
				}

				var param = [{name: 'deleteCustomView', value: 'true'}];
				param[param.length] = {name: 'customViewId', value: p.customViewId};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					success: function (data) {
						$('#customviews :selected').remove();
						$('#customviews').val(-999);
						p.customViewId = -999;
						p.onReload = true;
						g.populate();
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			editCustomView: function () {
				if (this.loading) {
					return true;
				}
				p.customViewId = $('#customviews').val();
				var param = [{name: 'viewId', value: p.viewId}];
				param[param.length] = {name: 'editCustomView', value: 'true'};
				param[param.length] = {name: 'customViewId', value: p.customViewId};
				var cvn = document.getElementById('customviews');
				param[param.length] = {name: 'customViewName', value: cvn.options[cvn.selectedIndex].text};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					success: function (data) {
						$('#customFilterPage').remove();
						var popDiv = document.createElement('div');
						$(popDiv).attr('title', 'Custom Filter');
						$(popDiv).attr('id', 'customFilterPage');
						$(popDiv).attr('style', 'font-size:62.5%');
						popDiv.innerHTML = data;
						$(popDiv).dialog({ modal: true });
						$(popDiv).dialog( "option", "autoOpen", 'false' );
						$(popDiv).dialog( "option", "height", 'auto' );
						$(popDiv).dialog( "option", "width", 780 );
						$(popDiv).dialog( "option", "position", 'center' );
						$(popDiv).dialog( "option", "show", 'slide' );
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			openCreateCustomViewPage: function () {
				if (this.loading) {
					return true;
				}
				if (!p.url) {
					return false;
				}
				var param = [{name: 'viewId', value: p.viewId}];

				/*var columnPosition = 1;
				for (var i = 0; i < p.colModel.length; i++)
				{
					var cm = p.colModel[i];
					if( $('#' + cm.columnid).val() != undefined && !cm.hide )
					{
						param[param.length] = {name: (columnPosition) + '-SC-' + cm.tablename + '-' + cm.name, value:$('#' + cm.columnid).val()};
						columnPosition++;
					}
					else if( !cm.hide )
					{
						columnPosition++;
					}
				}*/

				var columnPosition = 1;
				jQuery('.searchFields').children().each(function ()
				{
					var inputFieldName = jQuery(this).attr('abbr');
					var inputFieldObj = jQuery(this).children().children()[0];

					if( inputFieldName != '' && inputFieldObj != undefined )
					{
						param[param.length] = {name: (inputFieldObj.id) + '-SC-' + inputFieldName, value:jQuery(inputFieldObj).val()};
					}
					columnPosition++;    
				});

				param[param.length] = {name: 'openCreateCustomViewPage', value: 'true'};

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					success: function (data) {
						$('#customFilterPage').remove();
						var popDiv = document.createElement('div');
						$(popDiv).attr('title', 'Custom Filter');
						$(popDiv).attr('id', 'customFilterPage');
						$(popDiv).attr('style', 'font-size:62.5%');
						popDiv.innerHTML = data;
						$(popDiv).dialog({ modal: true });
						//$(popDiv).dialog({ buttons: { "Ok": function() { $(this).dialog("close"); } } } );
						$(popDiv).dialog( "option", "autoOpen", 'false' );
						$(popDiv).dialog( "option", "height", 'auto' );
						$(popDiv).dialog( "option", "width", 780 );
						$(popDiv).dialog( "option", "position", 'center' );
						$(popDiv).dialog( "option", "show", 'slide' );
						//$(popDiv).dialog("option", "draggable", false);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			populate: function () { //get latest data
				if (this.loading) {
					return true;
				}
				if (p.onSubmit) {
					var gh = p.onSubmit();
					if (!gh) {
						return false;
					}
				}
				this.loading = true;
				if (!p.url) {
					return false;
				}
				$('.pPageStat', this.pDiv).html(p.procmsg);
				$('.pReload', this.pDiv).addClass('loading');
				$(g.block).css({
					top: g.bDiv.offsetTop
				});
				if (p.hideOnSubmit) {
					$(this.gDiv).prepend(g.block);
				}
				if ($.browser.opera) {
					$(t).css('visibility', 'hidden');
				}
				if (!p.newp) {
					p.newp = 1;
				}
				if (p.page > p.pages) {
					p.page = p.pages;
				}
				var param = [{
					name: 'page',
					value: p.newp
				}, {
					name: 'rp',
					value: p.rp
				}
				];

				if( p.sortname )
				{
					param[param.length] = {name: 'sortname', value: p.sortname};

					if( p.sortorder )
					{
						param[param.length] = {name: 'sortorder', value: p.sortorder};
					}
					else
					{
						param[param.length] = {name: 'sortorder', value: 'desc'};
					}
					p.onReload = true;

					if( p.onSortTrigger )
					{
						param[param.length] = {name: 'sortTriggered', value: 'true'};
						p.onSortTrigger = false;
					}
				}

				if (p.params) {
					for (var pi = 0; pi < p.params.length; pi++) {
						param[param.length] = p.params[pi];
					}
				}

				var columnPosition = 1;
				for (var i = 0; i < p.colModel.length; i++)
				{
					var cm = p.colModel[i];

					var searchText = document.getElementById('column_' + cm.columnid);

					if( searchText != undefined && !cm.hide )
					{
						param[param.length] = {name: (columnPosition) + '-SC-' + cm.tablename + '-' + cm.name, value:searchText.value};
						columnPosition++;
					}
					else if( !cm.hide )
					{
						columnPosition++;
					}
				}

				var columnPosition = 1;
				jQuery('.searchFields').children().each(function ()
				{
					var inputFieldName = jQuery(this).attr('abbr');
					var inputFieldObj = jQuery(this).children().children()[0];

					if( inputFieldName != '' && inputFieldObj != undefined )
					{
						param[param.length] = {name: (inputFieldObj.id) + '-SC-' + inputFieldName, value:jQuery(inputFieldObj).val()};
					}
					columnPosition++;    
				});

				param[param.length] = {name: 'viewId', value: p.viewId};

				if( p.onChangeColumn )
				{
					param[param.length] = {name: 'columnChanged', value: 'true'};
					param[param.length] = {name: 'columnId', value: p.onChangeColumn.name};
					param[param.length] = {name: 'columnAdded', value: p.onChangeColumn.checked};
					p.onChangeColumn = false;
				}

				if( p.onReload )
				{
					param[param.length] = {name: 'reloaded', value: 'true'};
					p.onReload = false;
				}

				if( p.onChangePerPage )
				{
					param[param.length] = {name: 'onChangeOfPerPage', value: 'true'};
					p.navigationButtonClicked = true;
					p.onChangePerPage = false;
				}

				if( p.onSaveCustomView )
				{
					param[param.length] = {name: 'saveCustomView', value: 'true'};
					p.onSaveCustomView = false;
				}

				if( p.onClickNavigation )
				{
					param[param.length] = {name: 'pageNavigation', value: 'true'};
					p.onClickNavigation = false;
				}

				if( p.total )
				{
					param[param.length] = {name: 'totalRecords', value: p.total};
				}

				if( p.parameters )
				{
					var customParams = p.parameters;

					if( customParams[0] == undefined || customParams[0] == null )
					{
						for(var keys in p.parameters )
						{
							param[param.length] = {name: keys, value: p.parameters[keys]};
						}
					}
					else
					{
						for(var keys in customParams[0] )
						{
							param[param.length] = {name: keys, value: customParams[0][keys]};
						}
					}
				}

				param[param.length] = {name: 'customViewId', value: p.customViewId};

				param[param.length] = {name: 'navigationButtonClicked', value: p.navigationButtonClicked};

				p.navigationButtonClicked = false;

				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data) {
						g.addData(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						try {
							if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
						} catch (e) {}
					}
				});
			},
			doSearch: function () {
				p.query = $('input[name=q]', g.sDiv).val();
				p.qtype = $('select[name=qtype]', g.sDiv).val();
				p.newp = 1;
				p.onReload = true;
				this.populate();
			},
			changePage: function (ctype) { //change page
				if (this.loading) {
					return true;
				}
				switch (ctype) {
					case 'first':
						p.newp = 1;
						break;
					case 'prev':
						if (p.page > 1) {
							p.newp = parseInt(p.page) - 1;
						}
						break;
					case 'next':
						if (p.page < p.pages) {
							p.newp = parseInt(p.page) + 1;
						}
						break;
					case 'last':
						p.newp = p.pages;
						break;
					case 'input':
						var nv = parseInt($('.pcontrol input', this.pDiv).val());
						if (isNaN(nv)) {
							nv = 1;
						}
						if (nv < 1) {
							nv = 1;
						} else if (nv > p.pages) {
							nv = p.pages;
						}
						$('.pcontrol input', this.pDiv).val(nv);
						p.newp = nv;
						break;
				}
				if (p.newp == p.page) {
					return false;
				}
				if (p.onChangePage) {
					p.onChangePage(p.newp);
				} else {
					p.onReload = true;
					p.onClickNavigation = true;
					this.populate();
				}
			},
			deleteRowData: function(pkColumnValue)
			{
				var param = [{
					name: 'viewId',
					value: p.viewId
				}, {
					name: 'pkColumnValue',
					value: pkColumnValue
				}, {
					name: 'rowDeleted',
					value: 'true'
				}];
				$.ajax({
					type: p.method,
					url: p.url,
					data: param,
					dataType: p.dataType,
					success: function (data)
					{
						p.onReload = true;
						g.populate();
					},
					error: function (XMLHttpRequest, textStatus, errorThrown)
					{
						alert('Unable to delete');
					}
				});
			},

			addCellProp: function () {
				$('tbody tr td', g.bDiv).each(function () {
					var tdDiv = document.createElement('div');

					var n = $('td', $(this).parent()).index(this);
					var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
					if (pth != null) {
						if (p.sortname == $(pth).attr('abbr') && p.sortname) {
							//this.className = 'sorted';
						}
						if($(this).attr("id") != (p.viewId + '_nodata') )
						{
							$(tdDiv).css({
								textAlign: pth.align,
								width: $('div:first', pth)[0].style.width
							});
						}
						else
						{
							$(tdDiv).css({
								textAlign: 'center',
								width: p.currentWidth 
							});
						}
						if (pth.hidden) {
							$(this).css('display', 'none');
						}
					}
					if (p.nowrap == false) {
						$(tdDiv).css('white-space', 'normal');
					}
					if (this.innerHTML == '') {
						this.innerHTML = '&nbsp;';
					}

					var alinks = $(this).children();

					//Code for default delete row operation
					if( alinks.length > 0 && alinks.attr('isdefault') == 'true' )
					{
						alinks.click(function(){
							g.deleteRowData($(this).parent().parent().parent().attr("id").substr(3));
						});
						$(tdDiv).append(alinks);
					}
					else
					{
						tdDiv.innerHTML = this.innerHTML;
					}
					var prnt = $(this).parent()[0];
					var pid = false;
					if (prnt.id) {
						pid = prnt.id.substr(3);
					}
					if (pth != null) {
						if (pth.process) pth.process(tdDiv, pid);
					}
					$(this).empty().append(tdDiv).removeAttr('width'); //wrap content

				});
			},
			getCellDim: function (obj) {// get cell prop for editable event
				var ht = parseInt($(obj).height());
				var pht = parseInt($(obj).parent().height());
				var wt = parseInt(obj.style.width);
				var pwt = parseInt($(obj).parent().width());
				var top = obj.offsetParent.offsetTop;
				var left = obj.offsetParent.offsetLeft;
				var pdl = parseInt($(obj).css('paddingLeft'));
				var pdt = parseInt($(obj).css('paddingTop'));
				return {
					ht: ht,
					wt: wt,
					top: top,
					left: left,
					pdl: pdl,
					pdt: pdt,
					pht: pht,
					pwt: pwt
				};
			},
			addRowProp: function () {
				$('tbody tr', g.bDiv).each(function () {
					$(this).dblclick(function (e) {
						var obj = (e.target || e.srcElement);
						if (obj.href || obj.type) return true;

						if( !p.inlineEditEnabled || $(obj).parent().attr("editable") == 'false' )
						{
							return;
						}

						//$(this).toggleClass('trSelected');
						//if (p.singleSelect) $(this).siblings().removeClass('trSelected');

						var textData = obj.innerHTML;

						//To copy the link data for inline edit
						if( $(obj).children().length > 0 )
						{
							textData = $(obj).children()[0].innerHTML;
							$($(obj).children()[0]).hide();
						}
						else
						{
							$(obj).empty();
						}

						var alink1 = document.createElement("a");
						$(alink1).attr('href', 'javascript:void(0)');
						var img1 = document.createElement("img");

						var alink2 = document.createElement("a");
						$(alink2).attr('href', 'javascript:void(0)');
						var img2 = document.createElement("img");

						var idValue = $(obj).parent().attr("abbr") + '#' + Math.floor(Math.random() * 1000);

						$(alink1).attr('columnId', idValue);
						$(alink2).attr('columnId', idValue);

						if( $(obj).parent().attr("datatype") == 'text' )
						{
							var input = document.createElement("input");
							$(input).attr("id", idValue );
							$(input).attr("name", idValue);
							$(input).attr("value", textData.replace('&nbsp;', '-'));
							//input.className = "form-control";
							$(input).addClass('InputClass');
							$(input).keydown(function (e) {
							if (e.keyCode == 13)
							{
								idValue = $(input).attr("id");
								idValue = idValue.split('#')[0];
								textData = $(input).attr("value");
								if( $(obj).children().length == 4 )
								{
									$(obj).children()[0].innerHTML = textData;
									$($(obj).children()[0]).show();
								}
								else
								{
									obj.innerHTML = textData;
								}
								g.updateColumnData(idValue, textData, $(obj).parent().parent().attr("id").substr(3), 'text');
								$(input).remove();
								$(img1).remove();
								$(img2).remove();
								$(alink1).remove();
								$(alink2).remove();
							}
							});

							input.style.width = '80%';

							$(obj).append(input);
						}
						else if($(obj).parent().attr("datatype") == 'picklist')
						{
							var input = document.createElement("select");
							input.className = 'form-control';
							//var idValue = $(obj).parent().attr("abbr");
							$(input).attr("id", idValue);
							$(input).attr("name", idValue);
							$(input).addClass('InputClass');

							input.style.width = '80%';

							var option = document.createElement("option");
							option.innerHTML = 'Loading...';
							$(input).append(option);

							$(obj).append(input);

							idValue = idValue.split('#')[0];

							g.fetchColumnData(idValue, textData, $(obj).parent().parent().attr("id").substr(3), input);
						}
						$(img1).attr("src", '/images/mytask_taskdone.gif');
						$(img1).attr("hspace", '2');
						$(img1).attr("style", 'position:relative;top:2px');

						$(img2).attr("src", '/images/alertclosebtn.gif');
						$(img2).attr("hspace", '2');
						$(img2).attr("style", 'position:relative;top:2px');

						$(alink2).click(function()
						{
							var dataType = $(obj).parent().attr("datatype");
							var input = document.getElementById($(alink2).attr("columnId"));

							$(input).remove();
							$(img1).remove();
							$(img2).remove();
							$(alink1).remove();
							$(alink2).remove();
							textData = ((textData == '-' || textData == '-999' || textData == '' ) ? '-' : textData);
							if( $(obj).children().length > 0 )
							{
								$(obj).children()[0].innerHTML = textData;
								$($(obj).children()[0]).show();
							}
							else
							{
								obj.innerHTML = textData;
							}
						});
						$(alink1).click(function()
						{
							var dataType = $(obj).parent().attr("datatype");
							var input = document.getElementById($(alink1).attr("columnId"));

							if( dataType == 'text' )
							{
								idValue = $(input).attr("id");
								idValue = idValue.split('#')[0];
								textData = $(input).attr("value");
								if( $(obj).children().length == 4 ) 
								{
									$(obj).children()[0].innerHTML = textData;
									$($(obj).children()[0]).show();
								}
								else
								{
									obj.innerHTML = textData;
								}
								g.updateColumnData(idValue, textData, $(obj).parent().parent().attr("id").substr(3), dataType);
							}
							else if( dataType == 'picklist' )
							{
								idValue = $(input).attr("id");
								idValue = idValue.split('#')[0];
								textData = input.value;

								if( textData == '-999' )
								{
									textData = '-'; 
								}

								if( $(obj).children().length == 4 )
								{
									$(obj).children()[0].innerHTML = input.options[input.options.selectedIndex].innerHTML;
									$($(obj).children()[0]).show();
								}
								else
								{
									obj.innerHTML = input.options[input.options.selectedIndex].innerHTML;;
								}
								g.updateColumnData(idValue, textData, $(obj).parent().parent().attr("id").substr(3), 'picklist');
							}
							$(input).remove();
							$(img1).remove();
							$(img2).remove();
							$(alink1).remove();
							$(alink2).remove();
						});

						$(alink1).append(img1);
						$(alink2).append(img2);

						$(obj).append(alink1);
						$(obj).append(alink2);

						if( $(input).length )
						{
							$(input).focus();
						}

					}).mousedown(function (e) {
						if (e.shiftKey) {
							$(this).toggleClass('trSelected');
							g.multisel = true;
							this.focus();
							$(g.gDiv).noSelect();
						}
					}).mouseup(function () {
						if (g.multisel) {
							g.multisel = false;
							$(g.gDiv).noSelect(false);
						}
					}).hover(function (e) {
						if (g.multisel) {
							$(this).toggleClass('trSelected');
						}
					}, function () {});
					if ($.browser.msie && $.browser.version < 7.0) {
						$(this).hover(function () {
							$(this).addClass('trOver');
						}, function () {
							$(this).removeClass('trOver');
						});
					}
				});
			},
			pager: 0
		};
		if (p.colModel) { //create model if any
			var currentWidth = 0;
			thead = document.createElement('thead');
			var tr = document.createElement('tr');
			for (var i = 0; i < p.colModel.length; i++) {
				var cm = p.colModel[i];

				var th = document.createElement('th');

				if( cm.ispkcolumn && cm.pkinputtype == 'checkbox' )
				{
					th.innerHTML = '<input type="checkbox" name="all_' + p.title + '" id="all_' + p.title + '" onclick="javascript:checkAllBoxes(this)"/>';
				}
				else if( cm.ispkcolumn && cm.pkinputtype == 'radio' )
				{
					th.innerHTML = '';
				}
				else if( cm.pkinputtype == 'edit' || cm.pkinputtype == 'delete' || cm.pkinputtype == 'custom' )
				{
					th.innerHTML = '';
				}
				else
				{
					th.innerHTML = encodeHTML(cm.display);
				}
				if (cm.name && cm.sortable) {
					if( cm.tablename != null && cm.name != null )
					{
						$(th).attr('abbr', cm.tablename + '-' + cm.name);
					}
				}
				$(th).attr('editable', cm.editable);
				$(th).attr('ispkcolumn', cm.ispkcolumn);
				$(th).attr('datatype', cm.datatype);
				$(th).attr('columnId', cm.columnid);
				$(th).attr('axis', 'col' + i);
				if (cm.align) {
					th.align = cm.align;
				}
				if (cm.width) {
					$(th).attr('width', cm.width);
				}
				if ($(cm).attr('hide')) {
					th.hidden = true;
				}
				if (cm.process) {
					th.process = cm.process;
				}
				$(tr).append(th);

				if( !$(cm).attr('hide') )
				{
					currentWidth += cm.width + 10;
				}
			}

			p.currentWidth = currentWidth;
			$(thead).append(tr);

			$(t).prepend(thead);
		} // end if p.colmodel
		//init divs
		g.gDiv = document.createElement('div'); //create global container
		g.mDiv = document.createElement('div'); //create title container
		g.hDiv = document.createElement('div'); //create header container
		g.bDiv = document.createElement('div'); //create body container
		g.bDiv.id = 'flexigrid_bdiv_' + p.viewId;
		g.vDiv = document.createElement('div'); //create grip
		g.rDiv = document.createElement('div'); //create horizontal resizer
		g.cDrag = document.createElement('div'); //create column drag
		g.block = document.createElement('div'); //creat blocker
		g.nDiv = document.createElement('div'); //create column show/hide popup
		g.nBtn = document.createElement('div'); //create column show/hide button
		g.iDiv = document.createElement('div'); //create editable layer
		g.tDiv = document.createElement('div'); //create toolbar
		g.sDiv = document.createElement('div');
		g.pDiv = document.createElement('div'); //create pager container
		if (!p.usepager) {
			g.pDiv.style.display = 'none';
		}
		g.hTable = document.createElement('table');
		g.gDiv.className = 'flexigrid';
		g.gDiv.id = 'flexigrid_' +  p.viewId;
		if (p.width != 'auto' && p.width != '100%' ) {
			//g.gDiv.style.width = p.width + 'px';
			g.gDiv.width = p.width + 'px';
		}
		//add conditional classes
		if ($.browser.msie) {
			$(g.gDiv).addClass('ie');
		}
		if (p.novstripe) {
			$(g.gDiv).addClass('novstripe');
		}
		$(t).before(g.gDiv);
		$(g.gDiv).append(t);
		if( g.gDiv.width != undefined && g.gDiv.width != '100%')
		{
			$(g.gDiv).width(g.gDiv.width);
		}
		else
		{
			$(g.gDiv).width('1px');
			//Fix for I.E - need to handle this code if the flexi view is called twice in a page
			$(g.gDiv).ready(function(){($(g.gDiv).width(jQuery('#flexigrid_' +  p.viewId).parent().width()))});
		}
		g.hDiv.className = 'hDiv';
		$(t).before(g.hDiv);
		g.hTable.cellPadding = 0;
		g.hTable.cellSpacing = 0;
		$(g.hDiv).append('<div class="hDivBox"></div>');
		$('div', g.hDiv).append(g.hTable);
		var thead = $("thead:first", t).get(0);
		if (thead) $(g.hTable).append(thead);
		thead = null;
		if (!p.colmodel) var ci = 0;
		$('thead tr:first th', g.hDiv).each(function () {
			var thdiv = document.createElement('div');
			if ($(this).attr('abbr')) {
				$(this).click(function (e) {
					if (!$(this).hasClass('thOver')) return false;
					var obj = (e.target || e.srcElement);
					if (obj.href || obj.type) return true;
					g.changeSort(this);
				});
				if ($(this).attr('abbr') == p.sortname) {
					this.className = 'sorted';

					if( p.sortorder )
					{
						thdiv.className = 's' + p.sortorder;
					}
				}
			}
			if (this.hidden) {
				$(this).hide();
			}
			if (!p.colmodel) {
				$(this).attr('axis', 'col' + ci++);
			}
			$(thdiv).css({
				textAlign: this.align,
				width: this.width + 'px',
				height: '20px'
			});
			thdiv.innerHTML = this.innerHTML;
			$(this).empty().append(thdiv).removeAttr('width').mousedown(function (e) {
				g.dragStart('colMove', e, this);
			}).hover(function () {
				if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) {
					$(this).addClass('thOver');
				}
				if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					if( p.sortorder )
					{
						$('div', this).addClass('s' + p.sortorder);
					}
				} else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';

					if( p.sortorder )
					{
						$('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
					}
				}
				if (g.colCopy) {
					var n = $('th', g.hDiv).index(this);
					if (n == g.dcoln) {
						return false;
					}
					if (n < g.dcoln) {
						$(this).append(g.cdropleft);
					} else {
						$(this).append(g.cdropright);
					}
					g.dcolt = n;
				} else if (!g.colresize) {
					var nv = $('th:visible', g.hDiv).index(this);
					var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'));
					var nw = jQuery(g.nBtn).outerWidth();
					var nl = onl - nw + Math.floor(p.cgwidth / 2);
					$(g.nDiv).hide();
					$(g.nBtn).hide();
					$(g.nBtn).css({
						'left': nl,
						top: g.hDiv.offsetTop
					}).show();
					var ndw = parseInt($(g.nDiv).width());
					$(g.nDiv).css({
						top: g.bDiv.offsetTop
					});
					if ((nl + ndw) > $(g.gDiv).width()) {
						$(g.nDiv).css('left', onl - ndw + 1);
					} else {
						$(g.nDiv).css('left', nl);
					}
					if ($(this).hasClass('sorted')) {
						$(g.nBtn).addClass('srtd');
					} else {
						$(g.nBtn).removeClass('srtd');
					}
				}
			}, function () {
				$(this).removeClass('thOver');
				if ($(this).attr('abbr') != p.sortname) {
					$('div', this).removeClass('s' + p.sortorder);
				} else if ($(this).attr('abbr') == p.sortname) {
					var no = (p.sortorder == 'asc') ? 'desc' : 'asc';
					$('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
				}
				if (g.colCopy) {
					$(g.cdropleft).remove();
					$(g.cdropright).remove();
					g.dcolt = null;
				}
			}); //wrap content
		});

		//set bDiv
		g.bDiv.className = 'bDiv';
		$(t).before(g.bDiv);
		$(g.bDiv).css({
			height: (p.height == 'auto') ? 'auto' : p.height + "px"
		}).scroll(function (e) {
			g.scroll()
		}).append(t);
		if (p.height == 'auto') {
			$('table', g.bDiv).addClass('autoht');
		}
		//add td & row properties
		g.addCellProp();
		g.addRowProp();
		//set cDrag
		var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
		if (cdcol != null) {
			g.cDrag.className = 'cDrag';
			g.cdpad = 0;
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div', cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'))) ? 0 : parseInt($('div', cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'))) ? 0 : parseInt($('div', cdcol).css('paddingRight')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
			g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));
			$(g.bDiv).before(g.cDrag);
			var cdheight = $(g.bDiv).height();
			var hdheight = $(g.hDiv).height();
			$(g.cDrag).css({
				top: -hdheight + 'px'
			});
			$('thead tr:first th', g.hDiv).each(function () {
				var cgDiv = document.createElement('div');
				//$(cgDiv).width(5);
				$(g.cDrag).append(cgDiv);
				if (!p.cgwidth) {
					if( $(cgDiv).width() > 5 )
					{
						$(cgDiv).width(5);
						g.cdpad = 10;
					}
					p.cgwidth = $(cgDiv).width();
					//p.cgwidth = -30;//$(cgDiv, g.cDrag).width();
				}

				if(cdheight == 0 )
				{
					//This fix for IE - cdheight is total flexi list height and hdheight is flexi list header height
					cdheight = p.height;
					hdheight = 30;
				}
				$(cgDiv).css({
					height: cdheight + hdheight
				}).mousedown(function (e) {
					g.dragStart('colresize', e, this);
				});
				if ($.browser.msie && $.browser.version < 7.0) {
					g.fixHeight($(g.gDiv).height());
					$(cgDiv).hover(function () {
						g.fixHeight();
						$(this).addClass('dragging')
					}, function () {
						if (!g.colresize) $(this).removeClass('dragging')
					});
				}
			});
		}
		//add strip
		if (p.striped) {
			//$('tbody tr:odd', g.bDiv).addClass('evenRow');
		}
		if (p.resizable && p.height != 'auto') {
			g.vDiv.className = 'vGrip';
			$(g.vDiv).mousedown(function (e) {
				g.dragStart('vresize', e)
			}).html('<span></span>');
			$(g.bDiv).after(g.vDiv);
		}
		if (p.resizable && p.width != 'auto' && !p.nohresize) {
			g.rDiv.className = 'hGrip';
			$(g.rDiv).hide();/*Horizontal drag is commented - Murugesan K */
			$(g.rDiv).mousedown(function (e) {
				g.dragStart('vresize', e, true);
			}).html('<span></span>').css('height', $(g.gDiv).height());
			if ($.browser.msie && $.browser.version < 7.0) {
				$(g.rDiv).hover(function () {
					$(this).addClass('hgOver');
				}, function () {
					$(this).removeClass('hgOver');
				});
			}
			$(g.gDiv).append(g.rDiv);
		}
		// add pager
		if (p.usepager) {
			g.pDiv.className = 'pDiv';
			g.pDiv.style.height = '34px';
			$(g.pDiv).css('background-color', '#f1f1f1');
			g.pDiv.innerHTML = '<div class="pDiv2"></div>';
			$(g.hDiv).before(g.pDiv);
			var html = ' <div class="pGroup"> <div id="first-icon-' + p.viewId + '" title="' + getMessageForKey('sdp.common.navigation.firstpage') + '" class="pFirst pButton"><span></span></div><div id="prev-icon-' + p.viewId + '" title="' + getMessageForKey('sdp.common.previous') + '" class="pPrev pButton"><span></span></div> </div> <!--div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input id="currentPage" type="text" size="4" value="1" /> ' + p.outof + ' <span> 1 </span></span></div--> <div class="btnseparator"></div> <div class="pGroup"> <div id="next-icon-' + p.viewId + '" class="pNext pButton" title="' + getMessageForKey('sdp.common.navigation.nextpage') + '" ><span></span></div><div id="last-icon-' + p.viewId + '" class="pLast pButton" title="' + getMessageForKey('sdp.common.navigation.lastpage') + '"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton" title="' + getMessageForKey('ae.common.reload') + '"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
			if( p.exportEnabled )
			{
				html += '<div class="btnseparator"></div><div class="pGroup"><label class="ui-button1 ui-button1-pos"><input type="button" value="' + getMessageForKey('sdp.reports.customreport.exportas') + '" class="ui-button" style="font-weight: normal;" onclick="showPopupMenu(\'export-list-as_' + p.title + '\',\'export-options_' + p.title + '\');" id="export-list-as_' + p.title + '" title="' + getMessageForKey('sdp.reports.customreport.exportas') + '"><span class="ui-downarrowright"></span></label></div>';//NO I18N
			}
			if ( p.buttons ) 
			{
			     html += '<div class="po-flx-btns fl">'
			     for (var i = 0; i < p.buttons.length; i++)
			     {
			          var btn = p.buttons[i];
			          html += '<label class="'+btn.bclass+'"><input title="'+btn.title+'" id="'+btn.styleid+'" onclick="'+btn.onpress+'()" value="'+btn.title+'" type="button"></label>'
			     }
			     html += '</div>'
		     }
			//var html = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input id="currentPage" type="text" size="4" value="1" /> ' + p.outof + ' <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
		
			if( p.customFilterEnabled )
			{
				//html += '<div class="btnseparator"></div><div class="pGroup"><span class="pfilter">Showing</span></div><div class="pGroup"><select style="width:200px" id="customviews" class="form-control"></select></div><div id="savebutton" class="fbutton"><div><span style="padding-left: 20px" title="Create new custom custom view" class="add">Create View</span></div></div> <div style="display:none" id="editbutton" class="fbutton"><div><span style="padding-left: 20px" title="Edit custom view" class="edit">Edit</span></div></div>  <div style="display:none" id="deletebutton" class="fbutton"><div><span style="padding-left: 20px" title="Delete custom view" class="delete">Delete</span></div></div>';
			}
			
			//html += ' </div>';

			$('div', g.pDiv).html(html);
			$('.pReload', g.pDiv).click(function () {
				p.onReload = true;
				g.populate()
			});
			$('.pFirst', g.pDiv).click(function () {
				p.navigationButtonClicked = true;
				g.changePage('first')
			});
			$('.pPrev', g.pDiv).click(function () {
				p.navigationButtonClicked = true;
				g.changePage('prev')
			});
			$('.pNext', g.pDiv).click(function () {
				p.navigationButtonClicked = true;
				g.changePage('next')
			});
			$('.pLast', g.pDiv).click(function () {
				p.navigationButtonClicked = true;
				g.changePage('last')
			});
			if( p.customFilterEnabled )
			{
				$('#editbutton', g.pDiv).click(function () {
					g.editCustomView();
				});
				$('#deletebutton', g.pDiv).click(function () {
					g.deleteCustomView();
				});
				$('#customviews', g.pDiv).change(function () {
					if( this.value == -999 )
					{
						$('#editbutton').hide();
						$('#deletebutton').hide();
						$('#savebutton').show();
					}
					else
					{
						$('#editbutton').show();
						$('#deletebutton').show();
						$('#savebutton').hide();
					}
					p.customViewId = this.value;
					p.onReload = true;
					g.populate();
				});
				$('#savebutton', g.pDiv).click(function () {
					g.openCreateCustomViewPage();
				});
			}
			$('.pcontrol input', g.pDiv).keydown(function (e) {
				if (e.keyCode == 13) g.changePage('input')
			});
			if ($.browser.msie && $.browser.version < 7) $('.pButton', g.pDiv).hover(function () {
				$(this).addClass('pBtnOver');
			}, function () {
				$(this).removeClass('pBtnOver');
			});

			if( p.allviews )
			{
				var tempViews = p.allviews[0].views.split(';');

				for( var av = 0; av < tempViews.length; av++ )
				{
					var customViewName = tempViews[av].split('##');

					$('#customviews').append($('<option></option>').val(customViewName[0]).html(customViewName[1]));
				}
			}
			if (p.useRp) {
				var opt = '',
					sel = '';
				for (var nx = 0; nx < p.rpOptions.length; nx++) {
					if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"';
					else sel = '';
					opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
				}
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup'><select class='form-control' style='width:60px;' name='rp' id='perPage'>" + opt + "</select></div> <div class='btnseparator'></div>");
				$('select', g.pDiv).each(function () {
					if(this.id == 'perPage')
					{
						$(this).change(function(){
							if (p.onRpChange) {
								p.onRpChange(+this.value);
							} else {
								p.newp = 1;
								p.rp = +this.value;
								p.onChangePerPage = true;
								p.onReload = true;
								g.populate();
							}
						});
					}
				});
			}
			//add search button
			//if (p.searchitems) {
				$('.pDiv2', g.pDiv).prepend("<div class='pGroup' style='width:42px' title='" + getMessageForKey('sdp.inventory.wsDetails.sw.search') + "'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
				$('.pSearch', g.pDiv).click(function () {
					if( p.total > 0 )
					{
						var searchObj = document.getElementById(p.viewId + '_row0');

						if(searchObj.getAttribute("hidden") != null)
						{
							searchObj.removeAttribute('hidden');
							searchObj.style.display = '';
							$('.searchFields:visible input:first', g.gDiv).trigger('focus');
						}
						else
						{
							searchObj.setAttribute('hidden', 'true');
							searchObj.style.display = 'none';
						}
					}
					else
					{
						alert('You can not search the empty list.');
					}
				});
			//}
		}
		$(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
		// add title
		if (p.title && false) {
			g.mDiv.className = 'mDiv';
			g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
			$(g.gDiv).prepend(g.mDiv);
			if (p.showTableToggleBtn) {
				$(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
				$('div.ptogtitle', g.mDiv).click(function () {
					$(g.gDiv).toggleClass('hideBody');
					$(this).toggleClass('vsble');
				});
			}
		}
		//setup cdrops
		g.cdropleft = document.createElement('span');
		g.cdropleft.className = 'cdropleft';
		g.cdropright = document.createElement('span');
		g.cdropright.className = 'cdropright';
		//add block
		g.block.className = 'gBlock';
		var gh = $(g.bDiv).height();
		var gtop = g.bDiv.offsetTop;
		$(g.block).css({
			width: g.bDiv.style.width,
			height: gh,
			background: 'white',
			position: 'relative',
			marginBottom: (gh * -1),
			zIndex: 1,
			top: gtop,
			left: '0px'
		});
		$(g.block).fadeTo(0, p.blockOpacity);
		// add column control
		if ($('th', g.hDiv).length) {
			g.nDiv.className = 'nDiv';
			g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
			$(g.nDiv).css({
				marginBottom: (gh * -1),
				display: 'none',
				top: gtop
			}).noSelect();
			var cn = 0;
			$('th div', g.hDiv).each(function () {
				var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
				var chk = 'checked="checked"';
				if (kcol.style.display == 'none') {
					chk = '';
				}
				if($(this).parent().attr("ispkcolumn") == 'false' && $(this).parent().attr("datatype") != 'edit' && $(this).parent().attr("datatype") != 'delete')
				{
					$('tbody', g.nDiv).append('<tr><td class="ndcol1"><input name="' + p.colModel[cn].columnid + '" type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
				}
				cn++;
			});
			if ($.browser.msie && $.browser.version < 7.0) $('tr', g.nDiv).hover(function () {
				$(this).addClass('ndcolover');
			}, function () {
				$(this).removeClass('ndcolover');
			});
			$('td.ndcol2', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
				return g.toggleCol($(this).prev().find('input').val());
			});
			$('input.togCol,td.ndcol2', g.nDiv).click(function () {
				if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked == false) return false;

				if( this.type != undefined )
				{
					$(this).parent().next().trigger('click');

					if( this.checked )
					{	
						p.colModel[this.value].hide = false;
					}
					else
					{
						p.colModel[this.value].hide = true;
					}
					p.onChangeColumn = this;
					g.populate()
				}
				else
				{
					jQuery(this).parent().find('input').each(function()
					{
						if( this.checked )
						{
							p.colModel[this.value].hide = false;
						}
						else
						{
							p.colModel[this.value].hide = true;
						}
						p.onChangeColumn = this;
						g.populate()
					});
				}
			});
			$(g.gDiv).prepend(g.nDiv);

			if( p.columnChooserEnabled )
			{
				$(g.nBtn).addClass('nBtn')
					.html('<div></div>')
					.attr('title', getMessageForKey('ae.listview.columnchooser.tooltip'))
					.click(function () {
						$(g.nDiv).toggle();
						return true;
					}
					);
				if (p.showToggleBtn) {
					$(g.gDiv).prepend(g.nBtn);
				}
			}
		}
		// add date edit layer
		$(g.iDiv).addClass('iDiv').css({
			display: 'none'
		});
		$(g.bDiv).append(g.iDiv);
		// add flexigrid events
		$(g.bDiv).hover(function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		}, function () {
			if (g.multisel) {
				g.multisel = false;
			}
		});
		$(g.gDiv).hover(function () {}, function () {
			$(g.nDiv).hide();
			$(g.nBtn).hide();
		});
		//add document events
		$(document).mousemove(function (e) {
			g.dragMove(e)
		}).mouseup(function (e) {
			g.dragEnd()
		}).hover(function () {}, function () {
			g.dragEnd()
		});
		//browser adjustments
		if ($.browser.msie && $.browser.version < 7.0) {
			$('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
				width: '100%'
			});
			$(g.gDiv).addClass('ie6');
			if (p.width != 'auto') {
				$(g.gDiv).addClass('ie6fullwidthbug');
			}
		}
		g.rePosDrag();
		g.fixHeight();
		//make grid functions accessible
		t.p = p;
		t.grid = g;
		// load data
		if (p.url && p.autoload) {
			g.populate();
		}
		return t;
	};
	//ISSUE FIXED : Below docloaded value is changed as true as because of flexi list not loading properly in showURLDialog
	//var docloaded = false;
	var docloaded = true;
	jQuery(document).ready(function () {
		docloaded = true
	});
	$.fn.flexigrid = function (p) {
		return this.each(function () {
			if (!docloaded) {
				$(this).hide();
				var t = this;
				jQuery(document).ready(function () {
					$.addFlex(t, p);
				});
			} else {
				$.addFlex(this, p);
			}
		});
	}; //end flexigrid
	$.fn.flexReload = function (p) { // function to reload grid
		return this.each(function () {
			if (this.grid && this.p.url) this.grid.populate();
		});
	}; //end flexReload
	$.fn.flexOptions = function (p) { //function to update general options
		return this.each(function () {
			if (this.grid) $.extend(this.p, p);
		});
	}; //end flexOptions
	$.fn.flexToggleCol = function (cid, visible) { // function to reload grid
		return this.each(function () {
			if (this.grid) this.grid.toggleCol(cid, visible);
		});
	}; //end flexToggleCol
	$.fn.flexAddData = function (data) { // function to add data to grid
		return this.each(function () {
			if (this.grid) this.grid.addData(data);
		});
	};
	$.fn.noSelect = function (p) { //no select plugin by me :-)
		var prevent = (p == null) ? true : p;
		if (prevent) {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () {
					return false;
				});
				else if ($.browser.mozilla) {
					$(this).css('MozUserSelect', 'none');
					$('body').trigger('focus');
				} else if ($.browser.opera) $(this).bind('mousedown', function () {
					return false;
				});
				else $(this).attr('unselectable', 'on');
			});
		} else {
			return this.each(function () {
				if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
				else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
				else if ($.browser.opera) $(this).unbind('mousedown');
				else $(this).removeAttr('unselectable', 'on');
			});
		}
	}; //end noSelect
})(jQuery);
function addInvoked(buttonObj, pkInputObj)
{
	pkInputObj.each(
		function (idx)
		{
			//alert(this.checked);
		}
	);
}
function deleteInvoked(buttonObj)
{
	alert('delete invoked..');
}
function updateInvoked(buttonObj)
{
	alert('update invoked..');
}
function selectListRow(checkbox)
{
	if( jQuery(checkbox).attr('type') == 'checkbox' )
	{
		if( checkbox.checked )
		{
			jQuery(checkbox).parent().parent().parent().toggleClass('trSelected');
		}
		else
		{
			jQuery(checkbox).parent().parent().parent().removeClass('trSelected');
		}

		if( !checkbox.checked )
		{
			document.getElementById(checkbox.name).checked = false;
		}
		else
		{
			var checkBoxes = document.getElementsByName(checkbox.name);

			if( checkBoxes != undefined )
			{
				var isAllChecked = true;

				for( var i=0; i<checkBoxes.length; i++ )
				{
					if( !checkBoxes[i].checked )
					{
						isAllChecked = false;
						break;
					}
				}

				if( isAllChecked )
				{
					document.getElementById(checkbox.name).checked = true;
				}
				else
				{
					document.getElementById(checkbox.name).checked = false;
				}
			}
		}
	}
	else if( jQuery(checkbox).attr('type') == 'radio' )
	{
		var radioBoxes = document.getElementsByName(checkbox.name);

		for( var i=0; i<radioBoxes.length; i++ )
		{
			jQuery(radioBoxes[i]).parent().parent().parent().removeClass('trSelected');
		}
		jQuery(checkbox).parent().parent().parent().toggleClass('trSelected');
	}
}
function checkAllBoxes(checkbox)
{
	var checkBoxes = document.getElementsByName(checkbox.id.split("_")[1]);

	if( checkBoxes != undefined )
	{
		var isSelected = checkbox.checked;

		for( var i=0; i<checkBoxes.length; i++ )
		{
			checkBoxes[i].checked = isSelected;
		}
	}
}

function editFlexiRow(viewName, pkColumnValue)
{
	alert('Not yet implemented!!!');
}

function deleteFlexiRow(viewName, pkColumnValue)
{
	var param = [{
			name: 'viewName',
			value: viewName
			}, {
			name: 'pkColumnValue',
			value: pkColumnValue
			}, {
			name: 'rowDeleted',
			value: 'true'
			}
		];

	jQuery.ajax({
		type: "POST",
		url: "/FlexiListView.ls?operation=fetchData",
		data: param,
		dataType: "xml",
		success: function (data)
		{
		},
		error: function (XMLHttpRequest, textStatus, errorThrown)
		{
		       try {
			       if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
		       } catch (e) {}
		}
	});
}

function addNewFilterRow(thisRow)
{
	var itemsarray = [];

	if( document.createElement && document.childNodes )
	{
		var gUniqueRowID = Math.round((999 - 100) * Math.random() + 1);
		var newElement = thisRow.cloneNode(true);
		newElement.id = "customview_" + gUniqueRowID;
		thisRow.parentNode.insertBefore(newElement,thisRow.nextSibling);

		itemsarray = updateFieldName(newElement, gUniqueRowID);
	}
	return itemsarray;
}
var criteriaID = 1;

function updateFieldName( rowObj, newId )
{
	var itemsarray = [];

	var uvhId = null;

	for(var i=0;i<rowObj.childNodes.length;i++)
	{
		if( rowObj.childNodes[i].nodeName == 'TD' )
		{
			for(var j=0; j<rowObj.childNodes[i].childNodes.length; j++)
			{
				var tags = rowObj.childNodes[i].childNodes[j];
				if(tags.nodeName == 'SELECT' || tags.nodeName == 'INPUT' || tags.nodeName == 'IMG')
				{
					if( tags.name != undefined && tags.name.indexOf("filterColumn") >= 0 )
					{
						uvhId = 1100 + this.criteriaID;
						tags.name = uvhId + "_filterColumn_" + newId;//No I18N
						tags.id = uvhId + "_filterColumn_" + newId;//No I18N
						this.criteriaID = this.criteriaID+1;
						itemsarray.push(tags);
					}
					else if(tags.name != undefined && tags.name.indexOf("selectCriteria") >= 0)
					{
						tags.name = "selectCriteria_" + newId;//No I18N
						tags.id = "select_criteria_" + newId;//No I18N
						itemsarray.push(tags);
					}
					else if(tags.name != undefined && tags.name.indexOf("matchType") >= 0)
					{
						tags.name = "matchType_" + newId;//No I18N
						tags.id = "matchType_" + newId;//No I18N
						itemsarray.push(tags);
					}
					else if(tags.name != undefined && tags.name.indexOf("criteriaValue") >= 0)
					{
						tags.name = "criteriaValue_" + newId;//No I18N
						tags.id = "criteriaValue_" + newId;//No I18N
						itemsarray.push(tags);
						/*var browser = navigator.appName;
						if( browser == "Netscape" )
						{
							tags.onclick = function(event) {showDataPicker(this,event);};
						}
						else
						{
							tags.onclick = function() {showDataPicker(this,event);};
						}*/
						tags.value = "";//No I18N
					}
					else if(tags.name != undefined && tags.name.indexOf("button") >= 0)
					{
						tags.name = "button_" + newId;//No I18N
						tags.id = "button_" + newId;//No I18N
						/*var browser = navigator.appName;
						if( browser == "Netscape" )
						{
							tags.onclick = function(event) {showDataPicker(this,event);};
						}
						else
						{
							tags.onclick = function() {showDataPicker(this,event);};
						}*/
					}
				}
			}
		}
	}

	return itemsarray;
}

function removeFilterRow( theRow )
{
	if( document.createElement && document.childNodes )
	{
		var thisRow = theRow.parentNode.parentNode;
		this.selectedRowId = thisRow.id
			if(thisRow.parentNode.rows.length == 2)
			{
				var rowId = this.selectedRowId.split("_")[1];
				var filterId = getFlexiFilterColumnId(document.reportfilter).split("&")[1];

				document.getElementById( filterId + '_filterColumn_' + rowId).value = -1;//No I18N
				document.getElementById('select_criteria_' + rowId).value = -1;//No I18N
				document.getElementById('criteriaValue_' + rowId).value = "";//No I18N
			}
			else
			{
				thisRow.parentNode.removeChild(document.getElementById(this.selectedRowId));
			}
	}
}

function getFlexiFilterColumnId( formName )
{
	var params = "";
	try {
		var elements_list = formName.elements;
		var length = elements_list.length;
		var element_type;
		for( i=0; i<length; i++ )
		{
			element_type = elements_list[i].type;
			if(element_type == 'select-one' && elements_list[i].name.indexOf("filterColumn") >= 0) {
				params += "&" + elements_list[i].name.split("_")[0]; //No I18N
			}
		}
	}
	catch(e) {
	}
	return params;
}

function updateListviewActivity( viewId )
{
	var param = [{
			name: 'viewId',
			value: viewId
			}
		];

	jQuery.ajax({
		type: 'POST',
		url: '/FlexiListView.ls?operation=updateListviewActivity&viewId=' + viewId,
		data: param,

		success: function (data)
		{
			setTimeout('updateListviewActivity(' + viewId + ')', 300000);
		},
		error: function (XMLHttpRequest, textStatus, errorThrown)
		{
			try
			{
				if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
			} catch (e) {}
		}
	});
}

function saveCustomView(formObj)
{
	var param = constructFilterFormParameters(formObj);
	if( param != '' )
	{
		jQuery.ajax({
			type: 'POST',
			url: '/FlexiListView.ls?operation=saveCustomView',
			data: param,
			success: function (data)
			{
				if( $('#customviews').val() != -999 )
				{
					$('#customviews :selected').remove();
				}
				$('#customviews').append($('<option></option>').val(data).html($('#flexiViewName').val()));
				//$('#customFilterPage').dialog('close');
				$('#customFilterPage').remove();
				$('#customviews').val(data);
				reloadListview('workstation');
			},
			error: function (XMLHttpRequest, textStatus, errorThrown)
			{
				try
				{
					if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
				} catch (e) {}
			}
		});
	}
}

function constructFilterFormParameters( formName )
{
	var params = "";
	try
	{
		var elements_list = formName.elements;
		var length = elements_list.length;
		var element_type;
		var elementId;
		var elementValue;
		for( i=0; i<length; i++ )
		{
			element_type = elements_list[i].type;
			if( element_type == 'textarea' || element_type == 'text' || element_type == 'select-one' || element_type == 'hidden' )
			{
				elementId = elements_list[i].name.split('_')[1];

				if( elements_list[i].id == 'tviewId' )
				{
					params += "&viewId=" + elements_list[i].value; //No I18N
				}
				else if( elements_list[i].id == 'tcustomViewId' )
				{
					params += "&customViewId=" + elements_list[i].value; //No I18N
				}
				else if( elements_list[i].value != -1 && elements_list[i].value != '' )
				{
					params += "&" + elements_list[i].name + "=" + encodeURIComponent(elements_list[i].value); //No I18N
				}
				else
				{
					if( elements_list[i].id == 'flexiViewName' )
					{
						showMandatoryMessage(elements_list[i].id, 'View name cannot be empty.');
					}
					else
					{
						showMandatoryMessage(elements_list[i].id, 'Please choose filter column, criteria and value!!');
					}
					params = '';
					break;
				}
			}
		}
	}
	catch(e)
	{
	}
	return params;
}

function getCriteriaOperators(selectObj)
{
}

var iframeIEHackForLW;

function showMandatoryMessage(inputElement, message)
{
	var mydiv = document.getElementById('normalbubbletooltip');//No I18N

	if(mydiv != undefined){
		mydiv.parentNode.removeChild(mydiv);
		mydiv = null;
	}

	if( mydiv == undefined )
	{
		mydiv = document.createElement('DIV');//No I18N
		document.getElementById(inputElement).parentNode.appendChild(mydiv);
	}

	mydiv.style.zIndex='300';
	mydiv.style.position='absolute';
	mydiv.id = 'normalbubbletooltip';//No I18N
	mydiv.className = 'bubbletooltip';//No I18N
	mydiv.style.display='block';

	var left = getXValue(document.getElementById(inputElement));
	var top = getYValue(document.getElementById(inputElement)) + document.getElementById(inputElement).offsetHeight;

	mydiv.style.left = left;
	mydiv.style.top = top;
	mydiv.innerHTML = "<div class='tooltip-ui1'>" + message + "<span class='close-icon4' onclick=\"document.getElementById('normalbubbletooltip').style.display='none';removeFrame();\" id='normalbubbletooltip_close' title='Close'></span></div>";//No I18N
	if (document.all && !browser_opera_ae) {
		iframeIEHackForLW = document.createElement("IFRAME");//No I18N
		iframeIEHackForLW.scrolling = "no";//No I18N
		iframeIEHackForLW.frameBorder = 0;
		if(window["CONTEXT_PATH"] != null)
		{
			iframeIEHackForLW.src= CONTEXT_PATH + "/framework/html/blank.html";//No I18N
		}
		iframeIEHackForLW.style.position = "absolute";//No I18N
		iframeIEHackForLW.style.zIndex = "200";//No I18N
		iframeIEHackForLW.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';//No I18N

		iframeIEHackForLW.style.width = mydiv.offsetWidth + "px";//No I18N
		iframeIEHackForLW.style.height = mydiv.offsetHeight + "px";//No I18N
		iframeIEHackForLW.style.top = parseInt(top) + "px";//No I18N
		iframeIEHackForLW.style.left = parseInt(left) + "px";//No I18N

		document.body.appendChild(iframeIEHackForLW);
	}

	setTimeout("hideMandatoryBox('normalbubbletooltip')", 5000);//No I18N
	setTimeout("removeFrame()", 5000);//No I18N

	try
	{
		document.getElementById(inputElement).focus();
	}
	catch(e){}
}

function removeFrame(){
	if (document.all && !browser_opera_ae && iframeIEHackForLW != undefined) {
		document.body.removeChild(iframeIEHackForLW);
		iframeIEHackForLW = null;
	}
}

function getYValue( oElement )
{
	var iReturnValue = 0;
	while( oElement != null )
	{
		iReturnValue += oElement.offsetTop;
		oElement = oElement.offsetParent;
	}
	return iReturnValue;
}
function getXValue( oElement )
{
	var iReturnValue = 0;
	while( oElement != null )
	{
		iReturnValue += oElement.offsetLeft;
		oElement = oElement.offsetParent;
	}
	return iReturnValue;
}

function hideMandatoryBox(divId) {
	var id = document.getElementById(divId);
	if(!id) { return false; }
	//createCookie(id, 'hide', 30); //No I18N
	id.style.display = 'none'; //No I18N
}

function exportlist( viewName, fileType )
{
	document.location = '/FlexiListView.ls?operation=exportlist&viewName=' + viewName + '&fileType=' + fileType;
}

function reloadListview( viewName, parameter )
{
	if( parameter != undefined && parameter != null )
	{
		var jsonObj = {"onReload":true, "page":1, "newp":1, "parameters":  parameter  };
		jQuery('#' + viewName).flexOptions(jsonObj);
	}
	else
	{
		jQuery('#' + viewName).flexOptions({ 'onReload':true, 'page':1, 'newp':1 });
	}

	jQuery('#' + viewName).flexReload();

	jQuery('#all_' + viewName).prop('checked', false);
}

