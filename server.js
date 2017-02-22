const fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var querystring = require('querystring');
var sha1 = require('sha1');
var util = require('util');
var app = express();
module.exports = {
	Start: function(){
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));
		app.use('/home', express.static('/home'));

		var routes = require('./routes/routes')(app);
		var server = app.listen(8080, function() {
			console.log("Listening on port: %s", server.address().port);
		});
	}
}
app.get('/image/:filename', function(req, res){
	return res.sendFile(__dirname + "/home/"+req.params['filename']);
});


/*app.get('/groups/', function(req, res){
	return res.send(JSON.stringify(events));
});
app.get('/links/', function(req, res){
	return res.send(JSON.stringify(linked_users));
});
app.get('/groups/:groupId', function(req, res){
	var id = req.params['groupId'];

	var reqevent = events.find(x => x.id == id);
	return res.end(JSON.stringify(reqevent));
	
	
});*/
/*app.get('/groups/:groupId/detail', function(req, res){
	var reqid = req.params['groupId'];
	var reqevent = events.find(x => x.id == reqid);
	var output = reqevent.name + " - " +reqevent.creator + "\nPlayers:\n";
	for(i = 0; i < reqevent.players.length; i++){
		output += "\n"+reqevent.players[i].user.username;
	}
	return res.end(output);
});
app.get('/destiny/link/:DiscordName/:DestinyID', function(req, res){
	var DiscordName = req.params['DiscordName'];
	var DestinyID = req.params['DestinyID'];
	
	var linker = {discordName: DiscordName, destinyId: DestinyID};
	console.log(linker);
	linked_users.push(linker);	
	for(i = 0; i < client.channels.array().length; ++i){
		if(client.channels.array()[i].name == "general")
		{
			client.channels.array()[i].sendMessage("Manual Destiny <-> Discord Link Successful!");
			
		}
		
	}
	updateLinksJSON();	
});*/
