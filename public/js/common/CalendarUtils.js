window.CalendarUtils = {
	"aggregateTimes": function (aSectionList) {
		var aggregateTimes = {};

		// Aggregate all classes by weekday
		for (var i = 0; i < aSectionList.length; i++) {
			var section = aSectionList[i];
			for (var j = 0; j < section.classes.length; j++) {
				var clazz = section.classes[j];
				for (var k = 0; k < clazz.indexedWeekdays.length; k++) {
					var day = clazz.indexedWeekdays[k];
					var list = aggregateTimes[day] || [];
					var uid = section.uid + ":" + j;

					list.push({
						"time": clazz.startTime,
						"isStart": 1,
						"sectionUid": section.uid,
						"classIndex": clazz.classIndex,
						"uid": uid
					});

					list.push({
						"time": clazz.endTime,
						"isStart": 0,
						"uid": uid
					});

					aggregateTimes[day] = list;
				}
			}
		}

		return aggregateTimes;
	},

	"findIntersection": function (aAggregateTimes) {
		var timesCount = {};

		// Sort and consolidate
		for (var day in aAggregateTimes){
			var aggregate = aAggregateTimes[day];

			aAggregateTimes[day].sort(function (c1, c2) {
				// End blocks are always parsed before start blocks if time is equal
				return c1.time - c2.time || c1.isStart - c2.isStart;
			});

			var counter = 0;
			var usedPositions = [];
			var times = timesCount[day] || {};

			for (var i = 0; i < aggregate.length; i++) {
				var timeBlock = aggregate[i];

				if (timeBlock.isStart) {
					counter ++;

					// Find the next free position
					var freePos = 0;
					for (; usedPositions[freePos] != undefined &&
							freePos <= usedPositions.length; freePos++);
					usedPositions[freePos] = timeBlock.uid;

					// Add the current timeblock
					var time = times[timeBlock.time] || {};
					time.count = counter;
					var classes = time.classes || [];
					classes.push({
						"sectionUid": timeBlock.sectionUid,
						"classIndex": timeBlock.classIndex,
						"day": day,
						"position": freePos
					});
					time.classes = classes;
					times[timeBlock.time] = time;
				} else {
					counter --;

					// Remove the current time block from the used positions list
					var usedPos = 0;
					for (; usedPositions[usedPos] !== timeBlock.uid &&
							usedPos < usedPositions.length; usedPos++);

					if (usedPos < usedPositions.length)
						usedPositions[usedPos] = undefined;
				}
			}

			timesCount[day] = times;
		}

		return timesCount;
	}
};
