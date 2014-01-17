Scheduler.models.ClassData = Scheduler.models.Model.extend({
	"defaults": {
		"classList": undefined,
		"termList": undefined,
		"selectedTerm": "currentTerm"
	},

	"DOMAIN": "http://localhost:4888/%s",

	"CLASS_DATA_URL": "api/class",
	"TERM_DATA_URL": "api/term",
	"SEARCH_URL": "api/%d/class",

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);

		this.fetchTermList();
	},

	"buildApiUrl": function (aUrl, aArgs) {
		var args = aArgs || [];
		var url = vsprintf(aUrl, args);
		return sprintf(this.DOMAIN, url);
	},

	// "fetchTermClassList": function (aOnFinish) {
	// 	var self = this;

	// 	$.ajax({
	// 		"url": this.CLASS_DATA_URL
	// 	}).done(function (aData) {
	// 		self.set("classList", new Scheduler.models.SectionCollection(aData));
	// 		if (aOnFinish)
	// 			aOnFinish(self.get("classList"));
	// 	})
	// },

	"fetchTermList": function () {
		var self = this;

		$.ajax({
			"url": this.buildApiUrl(this.TERM_DATA_URL)
		}).done(function (aData) {
			if (aData)
				self.set("termList", aData);
		});
	},

	"getSelectedTerm": function () {
		return this.get("termList")[this.get("selectedTerm")];
	},

	"search": function (aText, aOnResult) {
		if (aText && aText.length) {
			var selTerm = this.getSelectedTerm();

			if (selTerm) {
				$.ajax({
					"url": this.buildApiUrl(this.SEARCH_URL, [selTerm.id]),
					"data": {
						"search": aText
					}
				}).done(function (aData) {
					if (aData)
						aOnResult(new Scheduler.models.SectionCollection(aData));
				});
			}
		}
	}
});