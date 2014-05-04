// TODO: pull from server
var temp = [
				"#CC5C5C",
				"#CC5E85",
				"#A765A8",
				"#6163AC",
				"#677FBD",
				"#66A7CB",
				"#67C5C4",
				"#6AC4AA",
				"#B0B76A",
				"#B5A86B",
				"#B1826B",
				"#AF6C6B",
				"#DC9F3E",
				"#CBBF2C",
				"#6D9841",
				"#419949",
				"#32B14A",
				"#429872",
				"#409991",
				"#3F8298",
				"#3F6599",
				"#3F4299",
				"#8B4298",
				"#AE3670",
				"#AF3635",
				"#FFFFFF",
				"#444444",
				"#6D6D6D"
			];

Scheduler.models.ThemeData = Scheduler.models.Model.extend({
	"defaults": {
		"table": {
			"backgroundColor": temp,
			"fontColor": temp,
			"borderColor": temp
		},
		"days": {
			"backgroundColor": temp,
			"fontColor": temp
		},
		"time": {
			"backgroundColor": temp,
			"fontColor": temp
		},
		"section": {
			"backgroundColor": temp,
			"fontColor": temp,
			"borderColor": temp
		}
	}
});