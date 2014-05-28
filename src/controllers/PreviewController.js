var sprintf = require("../lib/sprintf").s;

var Printer = require("../Printer");
var MongoStore = require("../MongoStore");

exports.htmlPreview = function (aReq, aRes) {
	var hash = aReq.params.hash;
	var width = aReq.query.width || Printer.PAPER_SIZES.A4.heightStr();
	var height = aReq.query.height || Printer.PAPER_SIZES.A4.widthStr();

	MongoStore.findUserSchedule(hash, function (aData) {
		if (!aData) {
			aRes.send(404, sprintf("Could not find schedule with url hash `%s`.", hash));
		} else {
			// TODO: Less hackery here plz
			var pageSize = Printer.PAPER_SIZES.A4;
			var globalTheme = aData.globalTheme;
			var userClassList = aData.userClassList;


			var calStartTime = aData.calendarSettings.startTime;
			var calEndTime = aData.calendarSettings.endTime;
			var interval = aData.calendarSettings.interval;
			var startOffset = aData.calendarSettings.startOffset;
			var thresholds = aData.calendarSettings.thresholds;

			var timeLabels = [];
			var dayLabels = [
				"<b>SUN</b>DAY",
				"<b>MON</b>DAY",
				"<b>TUE</b>SDAY",
				"<b>WED</b>NESDAY",
				"<b>THU</b>RSDAY",
				"<b>FRI</b>DAY",
				"<b>SAT</b>URDAY"
			];

			var minutesToStringFormat = function (aMin) {
				var pastNoon = aMin >= 12 * 60;
				var hour = Math.floor(aMin / 60) % 12 || 12;
				var min = aMin % 60;
				return hour + (pastNoon ? " PM" : " AM");
			};

			var themeToStyle = function (aTheme) {
				var styles = {}

				if (aTheme.backgroundColor)
					styles.backgroundColor = sprintf("background-color:%s;", aTheme.backgroundColor);
				if (aTheme.fontColor)
					styles.fontColor = sprintf("color:%s;", aTheme.fontColor);
				if (aTheme.borderColor)
					styles.borderColor = sprintf("border-color:%s;", aTheme.borderColor.join(" "));

				return styles;
			};

			/**
			 * Determines which calendar bracket the given time belongs to. For example, for a
			 * calendar starting at 8:00AM and a bracket size of 60 minutes, 8:30AM would be bracket
			 * 0.5, 9:00AM would be bracket 1, and 11:30AM would be bracket 3.5.
			 * @param  {[number]} aTime [Time in minutes]
			 * @return {[number]}
			 */
			var calculateBracketPosition = function (aTime) {
				return (aTime - calStartTime + startOffset) / interval;
			};

			var classesByDays = [];

			// Retrives for each day, a list of classes that occur on that day
			userClassList.forEach(function (aSection) {
				aSection.classList.forEach(function (aClass) {
					aClass.indexedWeekdays.forEach(function (aIndex) {
						var classesByDay = classesByDays[aIndex] || [];

						// Determines what CSS class to apply to the class element, `short`,
						// `regular`, `long`, etc
						var classDurationClass = "";
						var classDuration = aClass.endTime - aClass.startTime;
						for (var i = 0; i < thresholds.length; i++) {
							if (classDuration <= thresholds[i].threshold) {
								classDurationClass = thresholds[i].name;
								break;
							}
						}

						classesByDay.push({
							"name": aSection.title,
							"subject": aSection.subject,
							"catalog": aSection.catalogNumber,
							"section": aSection.sectionNumber,
							"type": aSection.sectionType,
							"building": aClass.building,
							"room": aClass.room,
							"classDuration": classDurationClass,
							"styles": themeToStyle(aSection.theme),
							"startTimeBracket": calculateBracketPosition(aClass.startTime),
							"endTimeBracket": calculateBracketPosition(aClass.endTime),
							"startTime": aClass.startTime,
							"classIndex": aClass.classIndex,
							"uid": aSection.uid
						});

						classesByDays[aIndex] = classesByDay;
					});
				});
			});

			for (var i = calStartTime + startOffset; i < calEndTime; i += interval)
				timeLabels.push(minutesToStringFormat(i));

			var dayData = dayLabels.map(function (aLabel, aIndex) {
				return {
					"label": aLabel,
					"entries": classesByDays[aIndex] || []
				};
			});

			// Landscape, hence reversed page sizes
			var pageSizeStyle = sprintf("width: %s; height: %s;", width, height);

			var renderParams = {
				"timeLabels": timeLabels,
				"dayData": dayData,
				"sectionList": userClassList,
				"pageSizeStyle": pageSizeStyle,
				"dayStyles": themeToStyle(globalTheme.daysTheme),
				"timeStyles": themeToStyle(globalTheme.timeTheme),
				"tableStyles": themeToStyle(globalTheme.tableTheme)
			};

			console.log(JSON.stringify(renderParams, null, "  "));

			aRes.render("preview.ejs", renderParams);
		}
	});
};

exports.imagePreview = function (aReq, aRes) {
	var hash = aReq.params.hash;
	MongoStore.findUserSchedule(hash, function (aSchedule, aError) {
		if (aError) {
			aRes.send(404, aError);
		} else {
			// TODO: store the url
			aRes.render("image-preview.ejs", {
				"appId": fbAppId,
				"siteName": "Pinecone - UW schedule customizer",
				"title": "My schedule", // TODO: more term specific info here
				"url": RouteUtils.getFullUrlFromRequest(aReq),
				"desc": "Create and customize your University of Waterloo class schedules!",
				"type": "object",
				"imgSrc": sprintf("%s/gen/img/%s.png", RouteUtils.getRootUrlFromRequest(aReq), hash)
			});
		}
	});
};