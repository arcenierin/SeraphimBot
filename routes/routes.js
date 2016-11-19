const fs = require('fs');
var path = require('path');
var appRouter = function(app){
	app.get("/", function(req, res){
		return res.send({"status": "online"});
	});
	app.get("/home", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/index.html'));
	});
	app.get("/groupsremoved", function(req, res){
		fs.exists("events.json", function(exists){
		if(exists){
				var resString = "";
				var lineReader = require("readline").createInterface({
					input: fs.createReadStream("events.json")
				});
				
				lineReader.on('line', function(line){
					resString += line;
				});
				lineReader.on('end', function (){
				});
				return res.sendFile("events.json");
			}
			else{
				return res.send({"status": "error: No event file found."})
			}
		
		});
	});
}

module.exports = appRouter;