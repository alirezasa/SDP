/*
 * SDP Jalali (Shamsi) calendar utilities.
 *
 * Pure Gregorian <-> Jalali conversion helpers, independent of any UI
 * library. Used to make the date-picker widgets display the Persian
 * (Jalali/Shamsi) calendar while every date that is actually written into
 * a form field (and therefore sent to the SDP server) stays a normal
 * Gregorian date, exactly as the backend expects.
 *
 * The conversion is the well known, widely used 33-year-cycle algorithm
 * for the Jalali calendar (accurate for the entire range of dates a
 * helpdesk application will ever deal with).
 */
(function (global) {
	"use strict";

	function div(a, b) {
		return a >= 0 ? Math.floor(a / b) : -Math.floor(-a / b);
	}

	var GREG_CUM_DAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

	/** Converts a Gregorian (y, m [1-12], d) date to Jalali {jy, jm, jd}. */
	function gregorianToJalali(gy, gm, gd) {
		var jy;
		if (gy > 1600) {
			jy = 979;
			gy -= 1600;
		} else {
			jy = 0;
			gy -= 621;
		}
		var gy2 = (gm > 2) ? (gy + 1) : gy;
		var days = (365 * gy) + div(gy2 + 3, 4) - div(gy2 + 99, 100) +
			div(gy2 + 399, 400) - 80 + gd + GREG_CUM_DAYS[gm - 1];
		jy += 33 * div(days, 12053);
		days %= 12053;
		jy += 4 * div(days, 1461);
		days %= 1461;
		if (days > 365) {
			jy += div(days - 1, 365);
			days = (days - 1) % 365;
		}
		var jm, jd;
		if (days < 186) {
			jm = 1 + div(days, 31);
			jd = 1 + (days % 31);
		} else {
			jm = 7 + div(days - 186, 30);
			jd = 1 + ((days - 186) % 30);
		}
		return { jy: jy, jm: jm, jd: jd };
	}

	/** Converts a Jalali (jy, jm [1-12], jd) date to a real Gregorian Date object. */
	function jalaliToGregorian(jy, jm, jd) {
		var gy;
		if (jy > 979) {
			gy = 1600;
			jy -= 979;
		} else {
			gy = 621;
		}
		var days = (365 * jy) + (div(jy, 33) * 8) + div(((jy % 33) + 3), 4) +
			78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
		gy += 400 * div(days, 146097);
		days %= 146097;
		if (days > 36524) {
			days -= 1;
			gy += 100 * div(days, 36524);
			days %= 36524;
			if (days >= 365) {
				days += 1;
			}
		}
		gy += 4 * div(days, 1461);
		days %= 1461;
		if (days > 365) {
			gy += div(days - 1, 365);
			days = (days - 1) % 365;
		}
		var gd = days + 1;
		var leap = ((gy % 4 === 0) && (gy % 100 !== 0)) || (gy % 400 === 0);
		var monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var gm = 1;
		for (; gm <= 12; gm++) {
			if (gd <= monthDays[gm]) {
				break;
			}
			gd -= monthDays[gm];
		}
		return new Date(gy, gm - 1, gd);
	}

	function toJalali(date) {
		return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
	}

	function isLeapJalaliYear(jy) {
		var g = jalaliToGregorian(jy, 12, 30);
		var back = gregorianToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
		return back.jy === jy && back.jm === 12 && back.jd === 30;
	}

	function jalaliMonthLength(jy, jm) {
		if (jm <= 6) {
			return 31;
		}
		if (jm <= 11) {
			return 30;
		}
		return isLeapJalaliYear(jy) ? 30 : 29;
	}

	var PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

	function toPersianDigits(value) {
		return String(value).replace(/[0-9]/g, function (d) {
			return PERSIAN_DIGITS[d];
		});
	}

	var MONTH_NAMES = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
		"مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

	// Persian week, Saturday first: index 0 = Saturday ... 6 = Friday.
	var DAY_NAMES_FULL = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
	var DAY_NAMES_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

	/** Maps JS Date#getDay() (0=Sun..6=Sat) to the Persian week index (0=Sat..6=Fri). */
	function persianWeekday(jsDay) {
		return (jsDay + 1) % 7;
	}

	global.SDPJalali = {
		toJalali: toJalali,
		toGregorian: jalaliToGregorian,
		isLeapYear: isLeapJalaliYear,
		monthLength: jalaliMonthLength,
		toPersianDigits: toPersianDigits,
		persianWeekday: persianWeekday,
		MONTH_NAMES: MONTH_NAMES,
		DAY_NAMES_FULL: DAY_NAMES_FULL,
		DAY_NAMES_SHORT: DAY_NAMES_SHORT
	};
})(window);
