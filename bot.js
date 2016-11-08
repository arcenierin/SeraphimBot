const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const Events = require('./events/event');


client.on('ready', () => {
	console.log('Client Connected!');	
});


var messages = [];
var events = [];
client.on('message', message => {
    messages.push(message);
    if(message.content === "!ping"){
	message.reply('You called? (This bot was made by Ben (NullRoz007) and Reusableduck, @ one of them if there are any problems.');
    }
    else if(message.content === "!clear"){
	//need to figure out how to clear the entire chat
    }
    else if(message.content === "!log"){
	var output = "";
	for(index = 0; index < messages.length; ++index){
	    console.log(messages[index].author+":"+messages[index].content);	
	    output += messages[index].author+":"+messages[index].content+"\n";	

	}
	fs.writeFile("log-"+client.uptime+".log", output, function(err){
		if(err){
			return console.log(err);
		}
		console.log("Wrote log.");
	});
    }
    else if(message.content === "!help"){
    }
    else if(message.content.split(' ').length >= 1){
		var splitMessage = message.content.split(' ');
		//syntax: !event new 'Event name' time (00:00) timezone (CST, CET, CEST etc)
		if(splitMessage[0] === "!event")
		{
			if(splitMessage[1] === "new")
			{
				console.log("Creating new event...");
				//eventually this will take you to an externel webpage to setup the event, rather than doing it all here
				try
				{
					var name = "";
					var n = 0;
					//var starttime = "";
					//var timezone = "";
					console.log(message.content.indexOf('"'));
					if(String(message.content).indexOf('"') > -1){
						console.log('!');
						var split = message.content.split('"');
						if(split.length == 3){
							name = split[1];
							n = name.split(' ').length;
						}
						else{
							message.reply("Invalid Syntax");
						}
					}
					
					else{
						name = splitMessage[2];
					}
					
					var event = new Events.Event(events.length+1, name, splitMessage[3 + n], splitMessage[4 + n]); 
					console.log(event);
					message.reply("Creating your event: ID="+event.id+", Name="+event.name+", Start time="+event.startTime+"-"+event.timeZone);
					events.push(event);
				}	
				catch(err)
				{
					console.log(err.message);
				}
			}
		}
    }
    else if(message.content == "!clearlog"){
	//WIP
    }
});

client.on("guildMemberAdd", (member) => {
	console.log("New Member Joined!");
	console.log(member.user);
	for(i = 0; i < client.channels.array().length; ++i){
		if(client.channels.array()[i].name == "general")
		{
			client.channels.array()[i].sendMessage("Welcome to Seraphim Elite "+member.user+", make sure you read the rules in # welcome-read-me, and feel free to introduce yourself to the rest of the clan! If you haven't already, you can set Seraphim Elite as your active clan at: https://www.bungie.net/en/Clan/Forum/1669611");
		}
	}
});

client.login('MjQ0NjEzOTYyOTE2NjkxOTY4.CwFLlA.-JAnNUCZg1DdQwbtlIrW1r51xg4');
