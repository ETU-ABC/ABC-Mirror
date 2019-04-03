/* global Module */

/* Magic Mirror
 * Module: ABC-EtuCourseTimetable
 *
 * By burakdmb
 * MIT Licensed.
 */

Module.register("ABC-EtuCourseTimetable", {
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
		this.getData();
		self.updateDom();
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "https://etuders.demirbilek.eu/api/programsorgula/"+self.config.ogrenciNo;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		
		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader('Content-type', 'text/plain');
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					console.log("Getting course time table for student: ", self.config.ogrenciNo);
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
			//var wrapperDataRequest = document.createElement("div");
			//wrapperDataRequest.innerHTML = "Öğrenci No: "+this.config.ogrenciNo;
			//wrapperDataRequest.innerHTML = "Öğrenci No: "+this.config.ogrenciNo+
			//								"<br>Cakışma sayısı: "+this.dataRequest.cakismasayisi+
			//								"<br>Haftalık ders saati sayısı: "+this.dataRequest.saatsayisi;

			//wrapper.appendChild(wrapperDataRequest);
			//wrapper.appendChild(tabloOlustur(this.config.ogrenciNo, this.dataRequest.grid));
			
			wrapper.appendChild(gunlukTabloOlustur(this.config.ogrenciNo, this.dataRequest.grid));
			
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			// console.log("Etuders: cakismasayisi="+this.dataNotification.cakismasayisi)
			// wrapperDataNotification.innerHTML =  this.translate("program") + ": " + this.dataNotification.cakismasayisi;

			wrapper.appendChild(wrapperDataNotification);
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"ABC-EtuCourseTimetable.css",
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
		this.sendSocketNotification("ABC-EtuCourseTimetable-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "ABC-EtuCourseTimetable-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});

function tabloOlustur(ogrencino,grid) {
	var table = document.createElement("table");
	table.className="customtable";


	var dersprogYazisi= document.createTextNode("Ders Programı");
	table.appendChild(dersprogYazisi);
	var tablehead = document.createElement("thead");
	
	var tr = document.createElement("tr");
	tr.className="title";

	var th0 = document.createElement("th");
	var day0 = document.createTextNode(ogrencino);
	//day0.className="title";
	th0.appendChild(day0);
	tr.appendChild(th0);

	var th1 = document.createElement("th");
	var day1 = document.createTextNode("Pazartesi");
	th1.appendChild(day1);
	tr.appendChild(th1);

	var th2 = document.createElement("th");
	var day2 = document.createTextNode("Salı");
	th2.appendChild(day2);
	tr.appendChild(th2);

	var th3 = document.createElement("th");
	var day3 = document.createTextNode("Çarşamba");
	th3.appendChild(day3);
	tr.appendChild(th3);

	var th4 = document.createElement("th");
	var day4 = document.createTextNode("Perşembe");
	th4.appendChild(day4);
	tr.appendChild(th4);

	var th5 = document.createElement("th");
	var day5 = document.createTextNode("Cuma");
	th5.appendChild(day5);
	tr.appendChild(th5);

	var th6 = document.createElement("th");
	var day6 = document.createTextNode("Cumartesi");
	th6.appendChild(day6);
	tr.appendChild(th6);


	tablehead.appendChild(tr);
	table.appendChild(tablehead);
	
	var programPanel = document.createElement("tbody");
	for(var i=0;i<13;i++){
		var saat1 = 8+i;
		var saat2= saat1+1;
		var tr = document.createElement('tr');
		var th = document.createElement('th');
		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		var td3 = document.createElement('td');
		var td4 = document.createElement('td');
		var td5 = document.createElement('td');
		var td6 = document.createElement('td');
		var text1 = document.createTextNode(saat1+".30-"+saat2+".20");
		th.appendChild(text1);
		var text2 = document.createTextNode('-');
		var text3 = document.createTextNode('-');
		var text4 = document.createTextNode('-');
		var text5 = document.createTextNode('-');
		var text6 = document.createTextNode('-');
		var text7 = document.createTextNode('-');
		//burası daha kısa yapılabilir, çok üşendim :)
		if(grid[i]!=null){
			var tmpstr="";
			if(grid[i][0]!=null){
				tmpstr="";
				for (var cakisma in grid[i][0]){
					tmpstr=tmpstr+grid[i][0][cakisma]+" ";
				}
				text2 = document.createTextNode(tmpstr);
			}
			if(grid[i][1]!=null){
				tmpstr="";
				for (var cakisma in grid[i][1]){
					tmpstr=tmpstr+grid[i][1][cakisma]+" ";
				}
				text3 = document.createTextNode(tmpstr);
			}
			if(grid[i][2]!=null){
				tmpstr="";
				for (var cakisma in grid[i][2]){
					tmpstr=tmpstr+grid[i][2][cakisma]+" ";
				}
				text4 = document.createTextNode(tmpstr);
			}
			if(grid[i][3]!=null){
				tmpstr="";
				for (var cakisma in grid[i][3]){
					tmpstr=tmpstr+grid[i][3][cakisma]+" ";
				}
				text5 = document.createTextNode(tmpstr);
			}
			if(grid[i][4]!=null){
				tmpstr="";
				for (var cakisma in grid[i][4]){
					tmpstr=tmpstr+grid[i][4][cakisma]+" ";
				}
				text6 = document.createTextNode(tmpstr);
			}
			if(grid[i][5]!=null){
				tmpstr="";
				for (var cakisma in grid[i][5]){
					tmpstr=tmpstr+grid[i][5][cakisma]+" ";
				}
				text7 = document.createTextNode(tmpstr);
			}
		}
		th.scope="row";
		th.className="text-white ";
		td1.appendChild(text2);
		td2.appendChild(text3);
		td3.appendChild(text4);
		td4.appendChild(text5);
		td5.appendChild(text6);
		td6.appendChild(text7);
		tr.appendChild(th);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		tr.appendChild(td4);
		tr.appendChild(td5);
		tr.appendChild(td6);
		programPanel.appendChild(tr);
	}
	table.appendChild(programPanel);
	return table;
}


function gunlukTabloOlustur(ogrencino,grid) {
	var div = document.createElement("div");
	var header = document.createElement("h4");
	header.appendChild(document.createTextNode("Ders Programı"));
	div.appendChild(header);

	div.className="customtableDiv";
	
	var table = document.createElement("table");
	table.className="customtable";

	var tablehead = document.createElement("thead");
	
	var tr = document.createElement("tr");
	tr.className="title";

	var th0 = document.createElement("th");
	var day0 = document.createTextNode(ogrencino);
	//day0.className="title";
	th0.appendChild(day0);
	tr.appendChild(th0);

	var th1 = document.createElement("th");
	var day1 = document.createTextNode("Bugün");
	th1.appendChild(day1);
	tr.appendChild(th1);

	tablehead.appendChild(tr);
	table.appendChild(tablehead);
	var date = new Date();
	var gunIndex = (date.getDay()+6) % 7;

	var programPanel = document.createElement("tbody");
	for(var i=0;i<13;i++){
		var saat1 = 8+i;
		var saat2= saat1+1;
		var tr = document.createElement('tr');
		var th = document.createElement('th');
		var td1 = document.createElement('td');
		var td2 = document.createElement('td');
		var td3 = document.createElement('td');
		var td4 = document.createElement('td');
		var td5 = document.createElement('td');
		var td6 = document.createElement('td');
		var text1 = document.createTextNode(saat1+".30-"+saat2+".20");
		th.appendChild(text1);
		var text2 = document.createTextNode('-');
		var text3 = document.createTextNode('-');
		var text4 = document.createTextNode('-');
		var text5 = document.createTextNode('-');
		var text6 = document.createTextNode('-');
		var text7 = document.createTextNode('-');
		
		if(grid[i]!=null){
			var tmpstr="";
			if(grid[i][gunIndex]!=null){
				tmpstr="";
				for (var cakisma in grid[i][gunIndex]){
					tmpstr=tmpstr+grid[i][gunIndex][cakisma]+" ";
				}
				text2 = document.createTextNode(tmpstr);
			}
			
		}
		th.scope="row";
		th.className="text-white ";
		td1.appendChild(text2);

		tr.appendChild(th);
		tr.appendChild(td1);
		console.log(text2);
		if(text2.length > 0 ){
			programPanel.appendChild(tr);
		}
	}
	table.appendChild(programPanel);
	div.appendChild(table);
	return div;
}