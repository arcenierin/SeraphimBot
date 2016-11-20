const fs = require('fs');
var path = require('path');
var appRouter = function(app){
	app.get("/", function(req, res){
		return res.send({"status": "online"});
	});
	app.get("/home", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/index.html'));
	});
	app.get("/home/groups", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/groups.html'));
	});
	app.get("/home/botwrapper.js", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/botwrapper.js'));
	});
	app.get("/home/events", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/events.json'));
	});
	app.get("/home/links", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/links.json'));
	});
	app.get("/home/fixed-menu.css", function(req, res){
		res.sendFile(path.join(__dirname+'/../home/fixed-menu.css'));
	});

}

module.exports = appRouter;