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
	address: "0.0.0.0", // Address to listen on, can be:
	                      // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	                      // - another specific IPv4/6 to listen on a specific interface
	                      // - "", "0.0.0.0", "::" to listen on any interface
	                      // Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: [], // Set [] to allow all IP addresses
	                                                       // or add a specific IPv4 of 192.168.1.5 :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	                                                       // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	                                                       // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "tr",
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
			module: "calendar",
			position: "bottom_right",	// This can be any of the regions. Best results in left or right regions.
			config: {
					calendars: [
						{
							symbol: "calendar-check-o",
							url: "https://calendar.google.com/calendar/ical/aalperenelbasan%40gmail.com/private-0c2094d5f955c491c2a0eacb933da98b/basic.ics",
							maximumEntries: 9,
						}
					]
			}
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
		
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "Ankara",
				locationID: "",  //ID from http://bulk.openweathermap.org/sample/; unzip the gz file and find your city
				appid: "802ae46fc023bc8775cec2aa9ba06466"
			}
		},
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
					ogrenciNo: 161101003
				}
		},
    {
				module: 'ABC-EtuExamTimeTable',
				position: "top_center",
        config: {
					ogrenciNo: 161101003
				}
    },
    {
        module: 'ABC-EtuShuttleInfo',
				position: "bottom_left",
    },
		{
				module: 'ABC-Controller'
		},
		{
				module: 'MMM-AlarmClock',
				position: 'top_right',
				config: {
						alarms: [
							{time: "18:30", days: [1,2,3,4,5,6,7], title: "Alarm", message: "Alarm!"}
						]
				}
		},
		{
			module: 'email',
				position: 'bottom_left',
				header: 'Email',
				config: {
						accounts: [
							{
								user: 'etu.abc@gmail.com',
								password: '1234QwEr',
								host: 'imap.gmail.com',
								port: 993,
								tls: true,
								authTimeout: 10000,
								numberOfEmails: 2,

						}
						],
						fade: true,
						maxCharacters: 30
				}
		}

	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
