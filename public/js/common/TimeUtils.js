if (!window.TimeUtils)
	window.TimeUtils = {};

window.TimeUtils = {
	"minutesToStringFormat": function (aMin, aHideMinutes) {
		var pastNoon = aMin >= 12 * 60;
		var hour = Math.floor(aMin / 60) % 12 || 12;
		var min = aMin % 60;

		if (aHideMinutes)
			return hour + (pastNoon ? " PM" : " AM");
		else
			return hour + ":" + this.padZeroes(min, 2) + (pastNoon ? " PM" : " AM");
	},

	"padZeroes": function (aInt, aLength) {
		var str = aInt + "";
		return str.length >= aLength ? str : (new Array(aLength - str.length + 1)).join("0") + str;
	},

	/**
	 * Parses time in the format hh:mm.
	 */
	"parseTimeToMinutes": function (aTimeStr) {
		var split = aTimeStr.split(":");
		return parseInt(split[0]) * 60 + parseInt(split[1]);
	}
};