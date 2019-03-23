/* global Module */

/* Magic Mirror
 * Module: ABC-Controller
 *
 * By Cemal Kılıç
 * MIT Licensed.
 */

Module.register("ABC-Controller", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "https://jsonplaceholder.typicode.com/posts/1";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			var wrapperDataRequest = document.createElement("div");
			// check format https://jsonplaceholder.typicode.com/posts/1
			wrapperDataRequest.innerHTML = this.dataRequest.title;

			var labelDataRequest = document.createElement("label");
			// Use translate function
			//             this id defined in translations files
			labelDataRequest.innerHTML = this.translate("TITLE");


			wrapper.appendChild(labelDataRequest);
			wrapper.appendChild(wrapperDataRequest);
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			wrapper.appendChild(wrapperDataNotification);
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"ABC-Controller.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("ABC-Controller-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "ABC-Controller-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}

		if (notification === "HIDE" || notification === "SHOW") {
			var options = {lockString: this.identifier};
			var modules = MM.getModules();
			modules.enumerate(function(module) {
				if (module.identifier.includes(payload.module)) {
					if (notification === "HIDE") {
						module.hide(1000, options);
					} else {
						if (payload.force) {
							options.force = true;
						}
						module.show(1000, options);
					}
				}
			});
		}

		if (notification === 'EDIT') {
			var modules = MM.getModules();
			modules.enumerate(function(module) {
				if (module.identifier.includes(payload.module)) {
					if (payload.module === 'ABC-EtuCourseTimetable'
						|| payload.module === 'ABC-EtuExamTimeTable') {

						// check if we have ogrenciNo as parameter
						if (payload.content && payload.content.ogrenciNo) {
							const ogrenciNo = parseInt(payload.content.ogrenciNo);
							module.config.ogrenciNo = ogrenciNo;
							module.getData();
						}
					}

					if (payload.module === 'currentweather') {
						// check payload for locationID
						if (payload.content && payload.content.locationID) {
							module.config.locationID = payload.content.locationID;
							// since we know the current module is
							// an object with updateWeather
							module.updateWeather();
						} else {
							console.log("Error on payload for current weather!");
						}
					}
					if (payload.module === 'MMM-AlarmClock') {
						// check payload for locationID
						if (payload.content && payload.content.time && payload.content.days) {
							var days = [];
							if(payload.content.days.monday==1){
								days.push(1);
							}
							if(payload.content.days.tuesday==1){
								days.push(2);
							}
							if(payload.content.days.wednesday==1){
								days.push(3);
							}
							if(payload.content.days.thursday==1){
								days.push(4);
							}
							if(payload.content.days.friday==1){
								days.push(5);
							}
							if(payload.content.days.saturday==1){
								days.push(6);
							}
							if(payload.content.days.sunday==1){
								days.push(7);
							}
							module.config.alarms.push({time: payload.content.time, days: days, title: "Alarm", message: "Alarm!", sound: "alarm.mp3"})
							// since we know the current module is
							// an object with alarmclock
							module.resetAlarmClock();
						} else {
							console.log("Error on payload for alarm clock!");
						}
						
					}
				}
			});
		}

		if (notification === 'HIDE_ALL') {
			var modules = MM.getModules();
			modules.enumerate(function (module) {
				module.hide(1000, options);
			})
		}

		if (notification === 'SHOW_ALL') {
			var modules = MM.getModules();
			modules.enumerate(function (module) {
				module.show(1000, options);
			})
		}
	},
});
