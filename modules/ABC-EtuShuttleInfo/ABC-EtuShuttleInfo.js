/* global Module */

/* Magic Mirror
 * Module: ABC-EtuShuttleInfo
 *
 * By burakdmb
 * MIT Licensed.
 */

Module.register("ABC-EtuShuttleInfo", {
	defaults: {
		updateInterval: 60000*60,	//Updates every hour
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

		var urlApi = "https://etuders.demirbilek.eu/api/servissorgula/";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		
		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader('Content-type', 'text/plain');
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
					retry = false;
				} 
				else {
					Log.error(self.name, "Could not load coursetimetable data. HTTP code: ", this.status);
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
			wrapper.appendChild(genelTabloOlustur(this.dataRequest));
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
			"ABC-EtuShuttleInfo.css",
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
		this.sendSocketNotification("ABC-EtuShuttleInfo-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "ABC-EtuShuttleInfo-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
function genelTabloOlustur(servisBilgisi) {
	var date = new Date();
	var currentHour = date.getHours();

	var currentDay = date.getDay();
	var dayIndex=(currentDay==6)? 1:0;

	var div = document.createElement("div");
	var header = document.createElement("h4");
	header.appendChild(document.createTextNode("Ring Saatleri"));
	div.appendChild(header);
	div.className="shuttleDiv";
	
	var table = document.createElement("table");
	table.className="shuttleTable";

	var tablehead = document.createElement("thead");
	
	var tr = document.createElement("tr");
	tr.className="title";

	var th0 = document.createElement("th");
	var day0 = document.createTextNode("Hareket Saati");
	th0.appendChild(day0);
	tr.appendChild(th0);

	var th1 = document.createElement("th");
	var day1 = document.createTextNode("Başlangıç Noktası");
	th1.appendChild(day1);
	tr.appendChild(th1);

	var th2 = document.createElement("th");
	var day2 = document.createTextNode("Varış Noktası");
	th2.appendChild(day2);
	tr.appendChild(th2);

	tablehead.appendChild(tr);
	table.appendChild(tablehead);
	
	var shuttlePanel = document.createElement("tbody");
	for(var i=0;i<servisBilgisi[dayIndex].length;i++){
		var tr = document.createElement('tr');
		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		var td3 = document.createElement('td');
		td1.appendChild(document.createTextNode(servisBilgisi[dayIndex][i][1]));
		td2.appendChild(document.createTextNode(servisBilgisi[dayIndex][i][2]));
		td3.appendChild(document.createTextNode(servisBilgisi[dayIndex][i][3]));
		
		//td3.appendChild(document.createTextNode(servisBilgisi[dayIndex][i][3].charAt(0).toUpperCase()+servisBilgisi[dayIndex][i][3].substr(1).toLowerCase()));
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		//Shows the shuttles in the range of 2 hours
		if(parseInt(servisBilgisi[dayIndex][i][1].split(':')[0])>=currentHour && parseInt(servisBilgisi[dayIndex][i][1].split(':')[0])<=currentHour+1){
			shuttlePanel.appendChild(tr);
		}
	}
	table.appendChild(shuttlePanel);
	div.appendChild(table);
	return div;
}
