Scheduler.models.ClassData = Scheduler.models.Model.extend({
	"defaults": {
		"classList": undefined,
		"termList": undefined,
		"selectedTermId": undefined
	},

	"DOMAIN": "http://localhost:4888/%s",

	"CLASS_DATA_URL": "/api/class",
	"TERM_DATA_URL": "/api/term",
	"SEARCH_URL": "/api/%d/class",

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	},

	"fetchTermList": function () {
		var self = this;

		$.ajax({
			"url": this.TERM_DATA_URL
		}).done(function (aData) {
			if (aData) {
				self.set("termList", aData);
				self.set("selectedTermId", aData["currentTerm"].id);
			}
		});
	},

	"search": function (aText, aOnResult) {
		if (aText && aText.length) {
			var selTerm = this.get("selectedTermId");

			if (selTerm != null) {
				$.ajax({
					"url": sprintf(this.SEARCH_URL, selTerm),
					"data": {
						"search": aText
					}
				}).done(function (aData) {
					if (aData) {
						// Wrap the result list of the search groupings in backbone collections
						_.forEach(aData, function (aGroup) {
							aGroup.sections =
								_.object(_.map(aGroup.sections, function (aValue, aKey) {
									return [ aKey, new Scheduler.models.SectionCollection(aValue)];
								}));
						});
						aOnResult(aData);
					}
				});
			}
		}
	}
});