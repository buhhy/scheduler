Scheduler.models.ClassData = Scheduler.models.Model.extend({
	"defaults": {
		"classList": undefined
	},

	"CLASS_DATA_URL": "http://localhost:4888/api/class",

	"initialize": function () {
		Scheduler.models.Model.prototype.initialize.call(this);
	},

	"fetchTermClassList": function (aOnFinish) {
		var self = this;

		$.ajax({
			"url": this.CLASS_DATA_URL
		}).done(function (aData) {
			self.set("classList", new Scheduler.models.SectionCollection(aData));
			if (aOnFinish)
				aOnFinish(self.get("classList"));
		})
	},

	"search": function (aText) {
		return this.get("classList").search(aText);
	}
});