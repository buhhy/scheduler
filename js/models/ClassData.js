Scheduler.models.ClassData = Scheduler.models.Model.extend({

	"API_KEY": "fa310af514876676292c421cf7673a49",
	"TERM_LIST_API_URL": "https://api.uwaterloo.ca/v2/terms/list",
	"SUBJECT_LIST_API_URL": "https://api.uwaterloo.ca/v2/codes/subjects",
	"TERM_SUBJECT_API_URL": "https://api.uwaterloo.ca/v2/terms/%d/%s/schedule",

	"currentTerm": undefined,
	"subjects": undefined,
	"classes": undefined,

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	},

	"buildApiUrl": function (aUrl, aArgs) {
		var args = aArgs || [];
		var url = vsprintf(aUrl, args);
		return sprintf("%s.json?key=%s", url, this.API_KEY);
	},

	"fetchTermClassList": function (aOnFinish) {
		// We should aggregate the total section data on the server side to reduce the total
		// number of API calls to the school's server. It will also reduce the number of AJAX
		// calls in general.

		var self = this;
		var countdown = 2;		// Synchronizes 2 asynchronous calls

		var resultValid = function (aResult) {
			if (aResult && aResult.data)
				return aResult.data;
			return null;
		};

		var fetchClasses = function () {
			countdown --;

			// Fetch all classes.
			if (!countdown) {
				var classCountdown = self.subjects.length;

				self.classes = new Scheduler.models.SectionCollection();

				_(self.subjects).each(function (aElem) {
					var subject = aElem.subject;
					var url = self.buildApiUrl(
						self.TERM_SUBJECT_API_URL, [ self.currentTerm, subject ]);

					$.ajax({
						"url": url
					}).done(function (aResult) {
						var result = resultValid(aResult);

						if (result) {
							classCountdown --;

							self.classes.add(result);

							if (!classCountdown && aOnFinish)
								aOnFinish(self.classes);
						}
					});
				});
			}
		}

		// Fetch list of all subjects.
		$.ajax({
			"url": self.buildApiUrl(self.SUBJECT_LIST_API_URL, [ self.currentTerm ])
		}).done(function (aResult) {
			var result = resultValid(aResult);

			if (result) {
				self.subjects = result;

				fetchClasses();
			}
		});

		// Fetch current term.
		$.ajax({
			"url": this.buildApiUrl(this.TERM_LIST_API_URL)
		}).done(function (aResult) {
			var result = resultValid(aResult);

			if (result) {
				self.currentTerm = result.current_term;

				fetchClasses();
			}
		});
	}
});