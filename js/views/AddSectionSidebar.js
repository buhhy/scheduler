Scheduler.views.AddSectionSidebar = Scheduler.views.Sidebar.extend({
	"defaults": {
		"classData": undefined,
		"userData": undefined,
	},

	"SEARCH_ENGINE_DB_NAME": "class_list",
	"ADDED_LIST_ENTRY_TEMPLATE": "#templateAddSectionAddedListEntry",

	"classData": undefined,
	"userData": undefined,

	"addedEntryMap": {},

	"$searchBox": undefined,
	"$searchButton": undefined,
	"$searchResultList": undefined,
	"$addedList": undefined,

	"initialize": function (aOpts) {
		Scheduler.views.Sidebar.prototype.initialize.call(this, aOpts);
		var opts = _.defaults(aOpts, this.defaults);
		var self = this;

		this.classData = opts.classData;
		this.userData = opts.userData;

		this.addedEntryMap = {};

		this.$searchBox = this.$el.find("#sectionSearchBox");
		this.$searchButton = this.$el.find("#sectionSearchButton");
		this.$addedList = this.$el.find("#addedList");

		this.userData.each(function (aEntry) {
			self.addAddedClassEntry(aEntry, false);
		});

		this.bindEvents();
	},

	"bindEvents": function () {
		var self = this;

		this.classData.on("change:classList", function () {
			console.log("changed!");
		});

		this.userData.on("add", function (aInsert) {
			self.addAddedClassEntry(aInsert, true);
		})

		this.$searchBox.keyup($.debounce(250, $.proxy(this.search, this)));

		this.$searchButton.click(function (aEvent) {
			aEvent.preventDefault();
			self.search();
		});
	},

	"search": function () {
		var input = this.$searchBox.val();

		if (input && input.length) {
			// Massage data into correct format: course -> section -> class
			this.classData.search(input, function (aData) {
				console.log(aData.toJSON());
			});
		}
	},

	"addAddedClassEntry": function (aEntry, aAnimated) {
		var sectionSplit = aEntry.get("section").split(" ");

		var $addedEntry = $(_.template($(this.ADDED_LIST_ENTRY_TEMPLATE).html(), {
			"subject": aEntry.get("subject"),
			"catalog": aEntry.get("catalog_number"),
			"section": sectionSplit[1],
			"type": sectionSplit[0],
			"time": "",
			"day": ""
		}));

		this.addedEntryMap[aEntry.get("uid")] = $addedEntry;
		this.$addedList.append($addedEntry);
	}
});