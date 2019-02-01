/* global Module */

/* Magic Mirror
 * Module: ABC-EtuExamTimeTable
 *
 * By Cemal Kılıç
 * MIT Licensed.
 */

Module.register("ABC-EtuExamTimeTable", {
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

		var urlApi = "https://etuders.demirbilek.eu/api/sinavprogramsorgula/"+self.config.ogrenciNo;
		var retry = true;

		var dataRequest = new XMLHttpRequest();

		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader('Content-type', 'text/plain');
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
                    // this is a temporary fix for now
                    // since my own api does not provide the courses
                    // taken by student, i use this urlApi as a gateway
					const arr = JSON.parse(this.response);
					console.log(arr);
					let courses = [];
					arr.forEach(function(elem) {
						if (!courses.includes(elem[0])) {
							courses.push(elem[0]);
						}
					});

                    // get exams for each course
                    self.getExamDetailsBeautiful(courses);

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

	getExamDetailsBeautiful: function(courses) {
		var exam_details = [];
		// TODO just for now...
		const url_base = "http://localhost:5000/exam/";
		var self = this;

		courses.forEach(function (elem) {
			var dataRequest = new XMLHttpRequest();
			var url = url_base + elem;
			dataRequest.open("GET", url, true);
			dataRequest.setRequestHeader('Content-type', 'text/plain');
			dataRequest.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						var exams = JSON.parse(this.response);
						exams.forEach(function(exam) {
							exam_details.push(exam);
						});
						// when all exams are fetched, show the table
						if (courses.length <= exam_details.length) {
							exam_details.sort(function(a,b){
								// TODO-cemal check if the exam date is past
								return self.dateHelper(a.exam_date, "dd/MM/yyyy", "/") - self.dateHelper(b.exam_date, "dd/MM/yyyy", "/");
							});
							self.processData(exam_details);
						}
					} else if (this.status === 401) {
						self.updateDom(self.config.animationSpeed);
						Log.error(self.name, this.status);
					} else {
						Log.error(self.name, "Could not load data.");
					}
				}
			};
			dataRequest.send();
		});
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
			wrapper.appendChild(examTimeTable(this.config.ogrenciNo, this.dataRequest));
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			wrapper.appendChild(wrapperDataNotification);
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"ABC-EtuExamTimeTable.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("ABC-EtuExamTimeTable-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "ABC-EtuExamTimeTable-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},

	/** Adopted from
	 * https://jsfiddle.net/Sushil231088/q56yd0rp/
	 */
	dateHelper: function(string, format, delimiter) {
		var date = string;
		var formatedDate = null;
		var formatLowerCase = format.toLowerCase();
		var formatItems = formatLowerCase.split(delimiter);
		var dateItems = date.split(delimiter);
		var monthIndex = formatItems.indexOf("mm");
		var monthNameIndex = formatItems.indexOf("mmm");
		var dayIndex = formatItems.indexOf("dd");
		var yearIndex = formatItems.indexOf("yyyy");
		var d = dateItems[dayIndex];
		if (d < 10) {
			d = "0"+ d;
		}
		if (monthIndex > -1) {
			var month = parseInt(dateItems[monthIndex]);
			month -= 1;
			if (month < 10) {
				month = "0" + month;
			}
			formatedDate = new Date(dateItems[yearIndex], month, d);
		} else if (monthNameIndex > -1) {
			var monthName = dateItems[monthNameIndex];
			month = getMonthIndex(monthName);
			if (month < 10) {
				month = "0" + month;
			}
			formatedDate = new Date(dateItems[yearIndex], month, d);
		}
		return formatedDate;
	}
});


function examTimeTable(ogrencino, exam_details) {
	// console.log("in tablo olustur", exam_details);

	var table = document.createElement("table");
	table.className="customtable";

	var tablehead = document.createElement("thead");

	var tr = document.createElement("tr");
	tr.className="title";

	var th0 = document.createElement("th");
	var day0 = document.createTextNode("151201022");
	th0.appendChild(day0);
	tr.appendChild(th0);

	var th1 = document.createElement("th");
	var day1 = document.createTextNode("Tarih");
	th1.appendChild(day1);
	tr.appendChild(th1);

	var th2 = document.createElement("th");
	var day2 = document.createTextNode("Saat");
	th2.appendChild(day2);
	tr.appendChild(th2);

	var th3 = document.createElement("th");
	var day3 = document.createTextNode("Ders Kodu");
	th3.appendChild(day3);
	tr.appendChild(th3);

	var th4 = document.createElement("th");
	var day4 = document.createTextNode("Ders Adi");
	th4.appendChild(day4);
	tr.appendChild(th4);

	tablehead.appendChild(tr);
	table.appendChild(tablehead);

	var programPanel = document.createElement("tbody");
	for(var i=0;i<exam_details.length;i++){
		var tr = document.createElement('tr');
		var th = document.createElement('th');

		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		var td3 = document.createElement('td');
		var td4 = document.createElement('td');

		th.scope="row";
		th.className="text-white ";
		text1 = document.createTextNode(exam_details[i]['exam_date']);
		text2 = document.createTextNode(exam_details[i]['exam_time']);
		text3 = document.createTextNode(exam_details[i]['course_code']);
		text4 = document.createTextNode(exam_details[i]['course_name']);

		td1.appendChild(text1);
		td2.appendChild(text2);
		td3.appendChild(text3);
		td4.appendChild(text4);

		tr.appendChild(th);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);

		programPanel.appendChild(tr);
	}
	table.appendChild(programPanel);
	return table;
}