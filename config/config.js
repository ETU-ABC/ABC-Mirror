/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "localhost", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "en",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: "alert",
		},
		{
   			module: 'MMM-Remote-Control',
    			// uncomment the following line to show the URL of the remote control on the mirror
    			position: 'bottom_left'
    			// you can hide this module afterwards from the remote control itself
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "compliments",
			position: "lower_third",
			config: {
				compliments: {
					anytime: [
						"Her sey guzel olacak :)"
					],
					morning: [
						"Bugun guzel bir gun olacak :)",
						"Iyi uyudun mu?",
						"Yeni bir güne hazır mısınz?"
					],
					afternoon: [
						"Gun ortasina kadar neler basardin?",
						"Bugun cok iyi gorunuyorsun!",
						"Isiltinin sirri ne?"
					],
					evening: [
						"Yorucu bir gundu haa?",
						"Bugunu nasil sonlandiracaksin? Bir film?",
						"Sanirim artik keyif zamani"
					]
				}
			}
		},
		//***{
		//	module: "currentweather",
		//	position: "top_right",
		//	config: {
		//		location: "New York",
		//		locationID: "",  //ID from http://bulk.openweathermap.org/sample/; unzip the gz file and find your city
		//		appid: "YOUR_OPENWEATHER_API_KEY"
		//	}
		//},
		//{
		//	module: "weatherforecast",
		//	position: "top_right",
		//	header: "Weather Forecast",
		//	config: {
		//		location: "New York",
		//		locationID: "5128581",  //ID from https://openweathermap.org/city
		//		appid: "YOUR_OPENWEATHER_API_KEY"
		//	}
		//},
		{
				module: 'ABC-EtuCourseTimetable',
				position: "top_right",
				config: {
					ogrenciNo: 151201022
				}
		}
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
