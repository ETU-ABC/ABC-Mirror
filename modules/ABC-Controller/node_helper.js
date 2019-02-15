/* Magic Mirror
 * Node Helper: ABC-Controller
 *
 * By Cemal Kılıç
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const path = require("path");
const fs = require("fs");
const url = require("url");

var defaultModules = require(path.resolve(__dirname + "/../default/defaultmodules.js"));

module.exports = NodeHelper.create({

	start: function() {
		var self = this;

		console.log("Starting node helper for: " + self.name);

		this.configOnHd = {};

		// store all the available modules
		this.modulesAvailable = [];

		// store all the installed modules
		this.modulesInstalled = [];

		// get the current config file
		this.combineConfig();

		// read the modules
		this.readModuleData();

		// set api endpoints
		this.extraRoutes();
	},

	combineConfig: function() {
		// function copied from MichMich (MIT)
		var defaults = require(__dirname + "/../../js/defaults.js");
		var configFilename = path.resolve(__dirname + "/../../config/config.js");
		try {
			fs.accessSync(configFilename, fs.F_OK);
			var c = require(configFilename);
			var config = Object.assign({}, defaults, c);
			this.configOnHd = config;
		} catch (e) {
			if (e.code == "ENOENT") {
				console.error("WARNING! Could not find config file. Please create one. Starting with default configuration.");
				this.configOnHd = defaults;
			} else if (e instanceof ReferenceError || e instanceof SyntaxError) {
				console.error("WARNING! Could not validate config file. Please correct syntax errors. Starting with default configuration.");
				this.configOnHd = defaults;
			} else {
				console.error("WARNING! Could not load config file. Starting with default configuration. Error found: " + e);
				this.configOnHd = defaults;
			}
		}
	},

	capitalizeFirst: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	formatName: function(string) {
		string = string.replace(/MMM?-/ig, "").replace(/_/g, " ").replace(/-/g, " ");
		string = string.replace(/([a-z])([A-Z])/g, function(txt){
			// insert space into camel case
			return txt.charAt(0) + " " + txt.charAt(1);
		});
		string = string.replace(/\w\S*/g, function(txt){
			// make character after white space upper case
			return txt.charAt(0).toUpperCase() + txt.substr(1);
		});
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	readModuleData: function() {
		var self = this;

		// append default modules
		for (var i = 0; i < defaultModules.length; i++) {
			self.modulesAvailable.push({
				longname: defaultModules[i],
				name: self.capitalizeFirst(defaultModules[i]),
				isDefaultModule: true,
				installed: true,
				author: "MichMich",
				desc: "",
				id: "MichMich/MagicMirror",
				url: "https://github.com/MichMich/MagicMirror/wiki/MagicMirror%C2%B2-Modules#default-modules"
			});
			var module = self.modulesAvailable[self.modulesAvailable.length - 1];
			var modulePath = self.configOnHd.paths.modules + "/default/" + defaultModules[i];
			self.loadModuleDefaultConfig(module, modulePath);
		}

		// check for custom installed modules
		fs.readdir(path.resolve(__dirname + "/.."), function(err, files) {
			for (var i = 0; i < files.length; i++) {
				if (files[i] !== "node_modules" && files[i] !== "default") {
					self.addModule(files[i]);
				}
			}
		});
	},

	addModule: function(folderName) {
		var self = this;

		var modulePath = this.configOnHd.paths.modules + "/" + folderName;
		fs.stat(modulePath, function(err, stats) {
			if (stats.isDirectory()) {
				var isInList = false;
				var currentModule;
				self.modulesInstalled.push(folderName);
				for (var i = 0; i < self.modulesAvailable.length; i++) {
					if (self.modulesAvailable[i].longname === folderName) {
						isInList = true;
						self.modulesAvailable[i].installed = true;
						currentModule = self.modulesAvailable[i];
					}
				}
				if (!isInList) {
					var newModule = {
						longname: folderName,
						name: self.formatName(folderName),
						isDefaultModule: false,
						installed: true,
						author: "unknown",
						desc: "",
						id: "local/" + folderName,
						url: ""
					};
					self.modulesAvailable.push(newModule);
					currentModule = newModule;
				}

				self.loadModuleDefaultConfig(currentModule, modulePath);

			}
		});
	},

	loadModuleDefaultConfig: function(module, modulePath) {
		// function copied from MichMich (MIT)
		var filename = path.resolve(modulePath + "/" + module.longname + ".js");
		try {
			fs.accessSync(filename, fs.F_OK);
			var jsfile = require(filename);
			// module.configDefault = Module.configDefaults[module.longname];
		} catch (e) {
			if (e.code == "ENOENT") {
				console.error("ERROR! Could not find main module js file for " + module.longname);
			} else if (e instanceof ReferenceError || e instanceof SyntaxError) {
				console.error("ERROR! Could not validate main module js file.");
				console.error(e);
			} else {
				console.error("ERROR! Could not load main module js file. Error found: " + e);
			}
		}
	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "ABC-Controller-NOTIFICATION_TEST") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("ABC-Controller-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/ABC-Controller/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});

		this.expressApp.get("/all_modules", function (req, res) {
			res.send(self.modulesAvailable);
		});

		this.expressApp.get("/hide", function(req, res) {
			var query = url.parse(req.url, true).query;
			var payload = { module: query.module};

			self.sendSocketNotification(query.action, payload);

			if (res) {
				res.send({"status": "success"});
			}

			return true;
		});

		this.expressApp.post("/edit", function(req, res) {
			// ogrenciNo is in the JSON body of post request
			var query = url.parse(req.url, true).query;
			var payload = { module: query.module, ogrenciNo: req.body.ogrenciNo};

			self.sendSocketNotification("EDIT", payload);

			if (res) {
				res.send({"status": "success"});
			}

			return true;
		});

		this.expressApp.get('/hide_all', function(req, res) {
			self.sendSocketNotification("HIDE_ALL");

			if (res) {
				res.send({"message": "All modules are hidden!"});
			}
		});

		this.expressApp.get('/show_all', function(req, res) {
			self.sendSocketNotification("SHOW_ALL");

			if (res) {
				res.send({"message": "All modules are showed!"});
			}
		})
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
