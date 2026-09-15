/*
 * Makes every jQuery UI Datepicker popup in SDP render the Persian
 * (Jalali/Shamsi) calendar: month names, weekday names (week starts on
 * Saturday, Friday is the weekend) and day numbers are all shown in
 * Jalali/Farsi, while the actual date that ends up in the input field
 * (and any altField, and whatever the "onSelect" handler receives) is
 * left completely untouched -- still the normal Gregorian date/format
 * the SDP server expects. Only the calendar POPUP's rendering and month
 * navigation are Jalali; storage/formatting/altField logic is native.
 *
 * This only overrides the three internal methods that decide what is
 * drawn and how prev/next/month/year navigation move: _generateHTML,
 * _adjustInstDate and _selectMonthYear. Everything else (_selectDay,
 * _selectDate, formatDate, _updateAlternate, min/max handling,
 * beforeShowDay, etc.) is the original jQuery UI code, unmodified, and
 * keeps working exactly as before.
 *
 * Because this changes core rendering of a shared, heavily used vendor
 * widget without a live SDP instance to test against, every override is
 * wrapped so that any unexpected error falls back to the original
 * (Gregorian) jQuery UI behaviour instead of breaking the date picker.
 */
(function () {
	"use strict";

	function patch() {
		if (!(window.jQuery && jQuery.datepicker && window.SDPJalali)) {
			return false;
		}

		var $ = jQuery;
		var J = window.SDPJalali;
		var dp = $.datepicker;

		var nativeGenerateHTML = dp._generateHTML;
		var nativeAdjustInstDate = dp._adjustInstDate;
		var nativeSelectMonthYear = dp._selectMonthYear;

		if (dp._sdpJalaliPatched) {
			return true;
		}

		function daylightSavingAdjust(inst, date) {
			return inst._daylightSavingAdjust ? inst._daylightSavingAdjust(date) : date;
		}

		/** Ensures inst._jDrawYear / inst._jDrawMonth (Jalali, 0-based month) are set. */
		function ensureJalaliDraw(self, inst) {
			if (typeof inst._jDrawYear !== "number" || typeof inst._jDrawMonth !== "number") {
				var anchor = self._daylightSavingAdjust(new Date(inst.drawYear, inst.drawMonth, 1));
				var j = J.toJalali(anchor);
				inst._jDrawYear = j.jy;
				inst._jDrawMonth = j.jm - 1;
			}
		}

		function selectedJalali(self, inst) {
			var real = self._daylightSavingAdjust(new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
			return J.toJalali(real);
		}

		dp._generateHTML = function (inst) {
			try {
				var self = this;
				ensureJalaliDraw(self, inst);

				var jy = inst._jDrawYear;
				var jm0 = inst._jDrawMonth;
				var jm = jm0 + 1;

				var now = new Date();
				var todayReal = self._daylightSavingAdjust(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
				var selectedReal = self._daylightSavingAdjust(new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));

				var changeMonth = self._get(inst, "changeMonth");
				var changeYear = self._get(inst, "changeYear");
				var showButtonPanel = self._get(inst, "showButtonPanel");
				var showOtherMonths = self._get(inst, "showOtherMonths");
				var selectOtherMonths = self._get(inst, "selectOtherMonths") && showOtherMonths;
				var beforeShowDay = self._get(inst, "beforeShowDay");
				var minDate = self._getMinMaxDate(inst, "min");
				var maxDate = self._getMinMaxDate(inst, "max");
				var stepMonths = parseInt(self._get(inst, "stepMonths"), 10) || 1;

				inst.dpDiv.addClass("ui-datepicker-rtl").attr("dir", "rtl");

				// ---- header: prev / next / month & year ----
				var prevHtml = "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='" +
					self._get(inst, "prevText") + "'><span class='ui-icon ui-icon-circle-triangle-e'>" + self._get(inst, "prevText") + "</span></a>";
				var nextHtml = "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='" +
					self._get(inst, "nextText") + "'><span class='ui-icon ui-icon-circle-triangle-w'>" + self._get(inst, "nextText") + "</span></a>";

				var titleHtml = "<div class='ui-datepicker-title'>";
				if (changeMonth) {
					titleHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
					for (var mi = 0; mi < 12; mi++) {
						titleHtml += "<option value='" + mi + "'" + (mi === jm0 ? " selected='selected'" : "") + ">" +
							J.MONTH_NAMES[mi] + "</option>";
					}
					titleHtml += "</select>";
				} else {
					titleHtml += "<span class='ui-datepicker-month'>" + J.MONTH_NAMES[jm0] + "</span>";
				}
				titleHtml += "&#xa0;";
				if (changeYear) {
					var todayJalaliYear = J.toJalali(todayReal).jy;
					var yearRangeOpt = self._get(inst, "yearRange") || "c-10:c+10";
					var parts = yearRangeOpt.split(":");
					var resolveYear = function (token, fallback) {
						if (!token) {
							return fallback;
						}
						if (/^c[+-]/.test(token)) {
							return jy + parseInt(token.substring(1), 10);
						}
						if (/^[+-]/.test(token)) {
							return todayJalaliYear + parseInt(token, 10);
						}
						var n = parseInt(token, 10);
						return isNaN(n) ? fallback : n;
					};
					var yLow = resolveYear(parts[0], jy - 10);
					var yHigh = resolveYear(parts[1], jy + 10);
					if (yHigh < yLow) {
						var tmp = yLow;
						yLow = yHigh;
						yHigh = tmp;
					}
					titleHtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
					for (var yy = yLow; yy <= yHigh; yy++) {
						titleHtml += "<option value='" + yy + "'" + (yy === jy ? " selected='selected'" : "") + ">" +
							J.toPersianDigits(yy) + "</option>";
					}
					titleHtml += "</select>";
				} else {
					titleHtml += "<span class='ui-datepicker-year'>" + J.toPersianDigits(jy) + "</span>";
				}
				titleHtml += "</div>";

				var headerHtml = "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all'>" +
					prevHtml + nextHtml + titleHtml + "</div>";

				// ---- weekday header row (Saturday first, Friday = weekend) ----
				var theadHtml = "<thead><tr>";
				for (var wi = 0; wi < 7; wi++) {
					theadHtml += "<th scope='col'" + (wi === 6 ? " class='ui-datepicker-week-end'" : "") + ">" +
						"<span title='" + J.DAY_NAMES_FULL[wi] + "'>" + J.DAY_NAMES_SHORT[wi] + "</span></th>";
				}
				theadHtml += "</tr></thead>";

				// ---- day grid ----
				var daysInMonth = J.monthLength(jy, jm);
				var firstOfMonthReal = self._daylightSavingAdjust(J.toGregorian(jy, jm, 1));
				var leading = J.persianWeekday(firstOfMonthReal.getDay());
				var totalCells = leading + daysInMonth;
				var weeks = Math.ceil(totalCells / 7);

				var cursor = new Date(firstOfMonthReal.getTime());
				cursor.setDate(cursor.getDate() - leading);
				cursor = self._daylightSavingAdjust(cursor);

				var bodyHtml = "<tbody>";
				for (var w = 0; w < weeks; w++) {
					bodyHtml += "<tr>";
					for (var d = 0; d < 7; d++) {
						var jCell = J.toJalali(cursor);
						var otherMonth = (jCell.jy !== jy || jCell.jm !== jm);

						if (otherMonth && !showOtherMonths) {
							bodyHtml += "<td class='" + (d === 6 ? "ui-datepicker-week-end " : "") +
								"ui-datepicker-other-month'>&#xa0;</td>";
						} else {
							var status = beforeShowDay ?
								beforeShowDay.apply(inst.input ? inst.input[0] : null, [cursor]) : [true, ""];
							var unselectable = (otherMonth && !selectOtherMonths) ||
								(status[0] === false) ||
								(minDate && cursor < minDate) ||
								(maxDate && cursor > maxDate);
							var isToday = cursor.getTime() === todayReal.getTime();
							var isSelected = cursor.getTime() === selectedReal.getTime();

							var tdClass = (d === 6 ? "ui-datepicker-week-end " : "") +
								(otherMonth ? "ui-datepicker-other-month " : "") +
								(status[1] || "") +
								(isSelected ? " " + self._currentClass : "") +
								(isToday ? " ui-datepicker-today" : "");
							var dayText = J.toPersianDigits(jCell.jd);
							var titleAttr = status[2] ? " title='" + String(status[2]).replace(/'/g, "&#39;") + "'" : "";

							if (unselectable) {
								bodyHtml += "<td class='" + tdClass.trim() + " " + self._unselectableClass +
									" ui-state-disabled'" + titleAttr + "><span class='ui-state-default'>" + dayText + "</span></td>";
							} else {
								bodyHtml += "<td data-handler='selectDay' data-event='click' data-month='" + cursor.getMonth() +
									"' data-year='" + cursor.getFullYear() + "' class='" + tdClass.trim() + "'" + titleAttr +
									"><a class='ui-state-default" + (isToday ? " ui-state-highlight" : "") +
									(isSelected ? " ui-state-active" : "") + "' href='#' data-date='" + cursor.getDate() + "'>" +
									dayText + "</a></td>";
							}
						}
						cursor.setDate(cursor.getDate() + 1);
						cursor = self._daylightSavingAdjust(cursor);
					}
					bodyHtml += "</tr>";
				}
				bodyHtml += "</tbody>";

				var tableHtml = "<table class='ui-datepicker-calendar'>" + theadHtml + bodyHtml + "</table>";

				var buttonPanelHtml = "";
				if (showButtonPanel) {
					var closeBtn = inst.inline ? "" :
						"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
						self._get(inst, "closeText") + "</button>";
					var currentBtn = "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>" +
						self._get(inst, "currentText") + "</button>";
					buttonPanelHtml = "<div class='ui-datepicker-buttonpane ui-widget-content'>" + currentBtn + closeBtn + "</div>";
				}

				inst._keyEvent = false;
				// jQuery UI reads/writes this after _generateHTML runs; keep it sane.
				this.maxRows = weeks;

				return headerHtml + tableHtml + buttonPanelHtml;
			} catch (err) {
				if (window.console && console.warn) {
					console.warn("Jalali datepicker render failed, falling back to Gregorian.", err);
				}
				return nativeGenerateHTML.call(this, inst);
			}
		};

		dp._adjustInstDate = function (inst, offset, period) {
			try {
				var self = this;
				offset = offset || 0;
				ensureJalaliDraw(self, inst);

				if (period === "D") {
					var real = self._daylightSavingAdjust(new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
					real.setDate(real.getDate() + offset);
					real = self._restrictMinMax(inst, self._daylightSavingAdjust(real));
					var jr = J.toJalali(real);
					inst.selectedDay = real.getDate();
					inst.drawMonth = inst.selectedMonth = real.getMonth();
					inst.drawYear = inst.selectedYear = real.getFullYear();
					inst._jDrawYear = jr.jy;
					inst._jDrawMonth = jr.jm - 1;
					return;
				}

				if (period === "M" || period === "Y") {
					var jy = inst._jDrawYear;
					var jm0 = inst._jDrawMonth;
					if (period === "M") {
						var total = jy * 12 + jm0 + offset;
						jy = Math.floor(total / 12);
						jm0 = ((total % 12) + 12) % 12;
					} else {
						jy = jy + offset;
					}
					var sel = selectedJalali(self, inst);
					var jd = Math.min(sel.jd, J.monthLength(jy, jm0 + 1));
					var real2 = self._restrictMinMax(inst, self._daylightSavingAdjust(J.toGregorian(jy, jm0 + 1, jd)));
					var jr2 = J.toJalali(real2);
					inst.selectedDay = real2.getDate();
					inst.drawMonth = inst.selectedMonth = real2.getMonth();
					inst.drawYear = inst.selectedYear = real2.getFullYear();
					inst._jDrawYear = jr2.jy;
					inst._jDrawMonth = jr2.jm - 1;
					self._notifyChange(inst);
					return;
				}

				// Unknown/absent period (e.g. the trailing _adjustDate() call inside
				// the native _gotoToday): just resync the Jalali draw position from
				// whatever real Gregorian date is now current.
				var syncAnchor = self._daylightSavingAdjust(new Date(inst.drawYear, inst.drawMonth, 1));
				var syncJ = J.toJalali(syncAnchor);
				inst._jDrawYear = syncJ.jy;
				inst._jDrawMonth = syncJ.jm - 1;
			} catch (err) {
				if (window.console && console.warn) {
					console.warn("Jalali datepicker navigation failed, falling back to Gregorian.", err);
				}
				nativeAdjustInstDate.call(this, inst, offset, period);
				delete inst._jDrawYear;
				delete inst._jDrawMonth;
			}
		};

		dp._selectMonthYear = function (id, select, period) {
			try {
				var self = this;
				var $target = $(id);
				var inst = self._getInst($target[0]);
				ensureJalaliDraw(self, inst);

				var val = parseInt(select.options[select.selectedIndex].value, 10);
				if (period === "M") {
					inst._jDrawMonth = val;
				} else {
					inst._jDrawYear = val;
				}

				var sel = selectedJalali(self, inst);
				var jd = Math.min(sel.jd, J.monthLength(inst._jDrawYear, inst._jDrawMonth + 1));
				var real = self._restrictMinMax(inst, self._daylightSavingAdjust(J.toGregorian(inst._jDrawYear, inst._jDrawMonth + 1, jd)));
				var jr = J.toJalali(real);
				inst.selectedDay = real.getDate();
				inst.drawMonth = inst.selectedMonth = real.getMonth();
				inst.drawYear = inst.selectedYear = real.getFullYear();
				inst._jDrawYear = jr.jy;
				inst._jDrawMonth = jr.jm - 1;

				self._notifyChange(inst);
				self._updateDatepicker(inst);
			} catch (err) {
				if (window.console && console.warn) {
					console.warn("Jalali datepicker month/year select failed, falling back to Gregorian.", err);
				}
				nativeSelectMonthYear.call(this, id, select, period);
			}
		};

		dp._sdpJalaliPatched = true;
		return true;
	}

	if (!patch()) {
		var attempts = 0;
		var timer = setInterval(function () {
			attempts++;
			if (patch() || attempts > 60) {
				clearInterval(timer);
			}
		}, 100);
	}
})();
