const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const Events = require('./events/event');
var colors = require('colors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Destiny = require('destiny-client');
var guardianApi = require('./guardiangg/guardian')
var querystring = require('querystring');
var sha1 = require('sha1');
var util = require('util');
var plotly = require('plotly')("NullRoz007", "2yYBQDRLXf5OyHfHUHuA");

var messages = [];
var events = [];
var event_offset = 0;
var linked_users = [];
var destiny = Destiny('af70e027a7694afc8ed613589bf04a60');

client.on('ready', () => {
	console.log('Client Connected!');	
	updateGroupsList();
	updateLinksList();
});

var gg_modes = {
	"skirmish": "9", 
	"control": "10", 
	"clash": "12", 
	"rumble": "13", 
	"ironbanner": "19",
	"elimination": "23",
	"rift": "24",
	"zonecontrol": "28", 
	"supremacy": "31", 
	"all": "34",
	"rumblesupremacy": "531"
}
var VERSION = "1.0.0";
var changelog = "```1.0.0: \n"+
				"	 1) Added !mygroups command.\n" +
				"	 2) Added !changelog command.\n" +
				"     3) Fixed double destiny <-> discord account linking.\n" + 
				"     4) Added !unlink command\n" +
				"     5) Seperated the Server and the Discord Client into their own js files."+
				"```";

client.on('message', message => {
    messages.push(message);
    if(message.content === "!ping"){
	message.reply('You called? (This bot was made by Ben (NullRoz007) and Reusableduckk, @ one of them if there are any problems.');
    }
	else if(message.content == "!changelog"){
		message.channel.sendMessage("Current Version: "+VERSION+"\n"+"Change Log: \n"+changelog);
	}
    else if(message.content === "!clear"){
		
		if (hasModPerms(message)){
			
			var msgPromise = message.channel.fetchMessages(); 
			
			msgPromise.then(function (pastMsgs) {
				console.log('Finished fetching messages...');
				var promiseArray = pastMsgs.deleteAll();
			
				console.log(promiseArray.length);
			
				for (var i = 0; i < promiseArray.length; i++){
					promiseArray[i].then(function (test){
							console.log('Message deleted');
						});
					promiseArray[i].catch(function (err){
							console.log('FAILURE DELETING MESSAGE', err);
						});
				}
			});
			
			msgPromise.catch(function (err){
							console.log('WE GOT ERR - 1', err);
						});		
						
		} else {
			message.reply('You are not a moderator');
		}	
    }
	// this doesn't work
	/*else if (message.content === "!mutechannel"){
		if (hasModPerms(message)){
			
			var everyoneRole = message.guild.roles.find('name', '@everyone');
			message.channel.overwritePermissions(everyoneRole, {
					SEND_MESSAGES: false
			})
			.then(() => message.channel.sendMessage("This channel has been muted"))
			.catch(e => console.log(e));
			
		} else {
			// No mod perms
		}
	} */
	else if(message.content === "!fixjson"){
		if(isBotCommander(message)){
			try{
				console.log("Rebuilding groups...");
				message.channel.sendMessage("Rebuilding groups...");
				updateGroupsJSON();
			}
			catch(err){
				console.log(err);
			}
		}
		else{
			message.channel.sendMessage("You are not a Bot Commander, using this command could have unintended consequences ");
		}
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
	else if (message.content === "!allstar"){
		message.channel.sendMessage("https://www.youtube.com/watch?v=L_jWHffIx5E");
		message.channel.sendMessage("Somebody once told me.....");
	}
	else if (message.content === "!friday"){
		
		var today = new Date();
		
		if (today.getDay() == 5){
			message.channel.sendMessage("https://www.youtube.com/watch?v=kfVsfOSbJY0");
		} else {
			message.channel.sendMessage("Today is not Friday");
		}	
	}
	else if (message.content === "!hepballs"){
		
		message.channel.sendMessage("https://youtu.be/Tctfq4tplQ4?t=22s");	
	}
    else if(message.content === "!help"){
		var output = "";
		
		if (hasModPerms(message)){
			output = "**Mod Commands**\n" +
					 "!clear  :  Clears recent messages in the channel\n" +
					 "!addrole <role> <username>  : adds the role to user, if both exist\n" +
					 "!removerole <role> <username>  : removes the role from the user, if both exist\n\n";
		}
		
		output = output +
			"**General Commands**\n" +
			"!ping  :  A tiny bit about the bot\n" +
			"!changelog : Display the Changelog\n" +
			"!help : Display this message\n\n" +
			
			"**LFG Commands**\n" +
			"!post <activity> <time> <timezone>  :  Creates a new group. <activity> can be an abbreviation like wotm or vog. If you do not enter a recognized abbreviation, it will take whatever you entered. You can also add -n or -h to the activity to show normal or hard mode. To use a name with spaces in it put \" around it. \n" +
			"!groups  :  Displays all active groups\n" +
			"!mygroups : Display all active groups that you are a member of\n"+
			"!group <ID>  :  Displays a specific group with the given ID\n" +
			"!joingroup <ID>  :  Join the group with the given ID\n" +
			"!leavegroup <ID>  :  Leave the group with the given ID\n" +
			"!removegroup <ID>  :  Removes the group with the given ID. Removed groups erased and can no longer be joined. Only the creator can use this\n" +
			"!rolecall <ID>  :  @ mentions everyone in the given group. Please do not abuse this.\n" +
			"You can also view active groups at: http://seraphimbot.mod.bz/home/groups\n\n"+
			
			"**Destiny Commands**\n"+
			"!destiny link <psn_name> : Link your Discord account to your Destiny account (REQUIRED)\n" +
			"!destiny unlink : Unlink your Discord and Destiny accounts\n"+
			"!destiny gr : Get your current grimoire score \n"+
			"!destiny elo : Get your current highest Elo from guardian.gg\n" +
			"!destiny kd <games>: Get your kd ratio over a number of games, including your average kd ratio over these games. **This will get data from your last played character**\n" +
			"!destiny elograph <gamemode> <graphtype> <specialoption> : graphtype can be anything found at the bottom of this webpage: https://plot.ly/javascript, however scatter works best. specialoptions can only be -f, for fill.";
		message.channel.sendMessage(output);	
    }
	else if(message.content === "!mygroups"){
		var username = message.member.user.username;
		var user_events = getGroups(username);
		var output = "```";
			for(i = 0; i < user_events.length; i++){
				try{
					
					output += "ID: "+user_events[i].id+", "+user_events[i].name+ ", Start Time: "+user_events[i].startTime + "-"+user_events[i].timeZone +"\n";
				}
				catch(err){
					message.channel.sendMessage(err);
				}
				
			}
			output += "```\nTo get more specific details about a group, type !group <id>.\nYou can also check available groups at: http://seraphimbot.mod.bz/home/groups";
			message.channel.sendMessage(output);
	}
    else if(message.content === "!groups"){
		if(events.length != 0){
			console.log("Getting groups...");
			var output = "```";
			for(i = 0; i < events.length; i++){
				try{
					
					output += "ID: "+events[i].id+", "+events[i].name+ ", Start Time: "+events[i].startTime + "-"+events[i].timeZone +"\n";
				}
				catch(err){
					message.channel.sendMessage(err);
				}
				
			}
			output += "```\nTo get more specific details about a group, type !group <id>.\nYou can also check available groups at: http://seraphimbot.mod.bz/home/groups";
			message.channel.sendMessage(output);
		}
		else{
			message.channel.sendMessage("There are no groups, use !post to create one.");
		}
		
    }
    else if(message.content.split(' ').length >= 1){
		var splitMessage = message.content.split(' ');
	    	if(splitMessage[0] === "!clear"){
			var amount = splitMessage[1];
			if (hasModPerms(message)){
			
				var msgPromise = message.channel.fetchMessages({limit: amount}); 
			
				msgPromise.then(function (pastMsgs) {
					console.log('Finished fetching messages...');
					var promiseArray = pastMsgs.deleteAll();
			
					console.log(promiseArray.length);
			
					for (var i = 0; i < promiseArray.length; i++){
						promiseArray[i].then(function (test){
							console.log('Message deleted '+i+'/'+amount);
						});
						promiseArray[i].catch(function (err){
							console.log('FAILURE DELETING MESSAGE', err);
						});
					}
				});
			
				msgPromise.catch(function (err){
					console.log('WE GOT ERR - 1', err);
				});		
						
				} 
			else {
				message.reply('You are not a moderator');
				}
			}
			else if(splitMessage[0] === "!destiny"){
				if(splitMessage[1] === "link"){
					if(splitMessage.length == 3){
						destiny.Search({
							membershipType: 2, 
							name: String(splitMessage[2])
						}).then(res => {
							var user = res[0];
							console.log(user);
							for(x = 0; x < linked_users.length; x++){
								var check = linked_users[x].discordName;
								if(message.member.user.username == check){
									message.channel.sendMessage("Sorry, "+message.member.user.username+" your account is already linked.");
									return;
								}
							}
							var linker = {discordName: message.member.user.username, destinyId: user.membershipId};
							console.log(linker);
							linked_users.push(linker);
							
							message.channel.sendMessage("Linked destiny account: "+user.membershipId + " to "+message.member.user.username);
							updateLinksJSON();
						});
						
					}
				}
				else if(splitMessage[1] === 'unlink'){
					if(splitMessage.length == 2){
						var messageName = String(message.member.user.username);
						for(i = 0; i < linked_users.length; i++){
							if(String(linked_users[i].discordName) == messageName){
								var user = linked_users[i];
								linked_users.splice(i, 1);
								message.channel.sendMessage("Unlinked destiny account: "+user.membershipId + " from "+message.member.user.username);
								return;
							}
						}
					}
				}
				else if(splitMessage[1] === "elo"){
					if(splitMessage.length == 2){
						var messageName = String(message.member.user.username);
						for(i = 0; i < linked_users.length; i++){
							if(String(linked_users[i].discordName) == messageName){
								if(messageName == "Ben (NullRoz007)"){
									message.channel.sendMessage(messageName+"'s Elo is 9999");
								}
								else{
									var id = linked_users[i].destinyId;
									console.log(id);
									guardianApi.getElo(id, function(elo){
										message.channel.sendMessage(messageName+"'s Elo is "+elo);
									});
								}
							}
						}
					}
					else if(splitMessage.length == 3){
						
						
					}
				}
				else if(splitMessage[1] === "elograph"){
							var messageName = String(message.member.user.username);
							var gameMode = splitMessage[2];
							var graphType = splitMessage[3];
							console.log(gameMode);
							var gameModeCode = gg_modes[gameMode];
							
							console.log(gameModeCode);
							for(i = 0; i < linked_users.length; i++){
								if(String(linked_users[i].discordName) == messageName){
									var id = linked_users[i].destinyId;
									console.log(id);
									guardianApi.getEloChart(String(id), function(eloChart){
										var hashedData = sha1(eloChart);
										var gamemodeData = [];
										
										var x_array = [];
										var y_array = [];
										
										for(i = 0; i < eloChart.length; i++){
											console.log(eloChart[i].mode)
											if(eloChart[i].mode == gameModeCode){
												gamemodeData.push({"x": eloChart[i].x, "y": eloChart[i].y})
											}
										}
										
									
										for(i = 0; i < gamemodeData.length; i++){
											console.log(gamemodeData[i]);
											x_array.push(gamemodeData[i].x);
											y_array.push(gamemodeData[i].y);
										}
										var dataArray = {x: x_array, y: y_array, type: graphType};
										if(graphType == "scatter" && splitMessage.indexOf("-f") > -1){
											dataArray = {x: x_array, y: y_array, type: "scatter", fill: "tozeroy"};
										}
										else if(graphType == "area"){
											dataArray = {r: x_array, t: ["this", "is", "a", "placeholder"], type: "area"};
										}
										
										//var graphOptions = {filename: hashedData+"-h2d", fileopt: "overwrite"};
										
										//plotly.plot(dataArray, graphOptions, function(err, msg){
										//	console.log("Uploaded at: "+msg.url);
										//});
										var figure = {'data': [dataArray]};
										var imgOpts = {
											format: 'png',
											width: 500, 
											height: 250
										};
										
										plotly.getImage(figure, imgOpts, function(err, imgStream){
											if(err) return console.log("GIR: "+err);
											
											var fileStream = fs.createWriteStream(hashedData+".png");
											imgStream.pipe(fileStream);
											fileStream.on('finish', () => {
												message.channel.sendFile(hashedData+".png").then(function () {
													fs.unlink(hashedData+".png");
													console.log("Done!");
												});
												
											});
										});
										
									});
									
								}
							}
						}
				else if(splitMessage[1] === "gr"){
					var messageName = String(message.member.user.username);
					for(i = 0; i < linked_users.length; i++){
						if(String(linked_users[i].discordName) == messageName){
							var id = linked_users[i].destinyId;
							console.log(id);
							destiny.Account({
								membershipType: 2,
								membershipId: id
							}).then(res => {
								console.log(res);
								var grScore = res.grimoireScore;
								message.channel.sendMessage(messageName+"'s Grimoire Score is: "+grScore);
							});
						}
					}
				}
				else if(splitMessage[1] === "kd"){
					var messageName = String(message.member.user.username);
					var limit = splitMessage[2];
					for(i = 0; i < linked_users.length; i++){
						if(String(linked_users[i].discordName) == messageName){
		
							var id = linked_users[i].destinyId;
							console.log(id);
							destiny.Account({
									membershipType: 2,
									membershipId: id
								}).then(res => {
									console.log(res);
									var characters = res.characters;
									var characterId = characters[0].characterBase.characterId;
								
									destiny.ActivityHistory({
										membershipType: 2,
										membershipId: id, 
										characterId: characterId,
										definitions: true, 
										mode: 5
										}).then(act => {
		
											var kds = [];
											var output = messageName+"'s Kill Death ratios for the past "+limit + " games are: \n";
											
											for(i = 0; i < limit; i++){
												var activity = act.activities[i];
												var kd = activity.values.killsDeathsRatio.basic.displayValue;
												console.log("KD: "+kd);
												kds.push(kd);
												output += i+1 +") "+kd+"\n";
											}
											console.log(kds);
											var total = 0.00;
											for(x = 0; x < kds.length; x++){
												total += parseFloat(kds[x]);
											}
											console.log(total);
											var avg = total / kds.length;
											output+= "\nAvg: "+Number((avg).toFixed(2));
											message.channel.sendMessage(output);
										
										}).catch(function(err){
											console.log(err);
											
									});
								});
							}								
						
						
					}
				}
			}
	    	else if(splitMessage[0] === "!clearuser"){
			if(splitMessage.length == 3){
				var name = String(splitMessage[1]);
				var amount = splitMessage[2];
				if(hasModPerms(message)){
					var messagePromise = message.channel.fetchMessages({limit: amount});
					messagePromise.then(function (pastMsgs) {
						
						for(i = 0; i < pastMsgs.array().length; i++){
							var msg = pastMsgs.array()[i];
							var msgUsr = String(msg.member.user.username);
							console.log(msgUsr +", "+name);
							if(msgUsr === name){
								//msg.delete(); //(node:24522) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): Error: Bad Request
							}
							
						}
					});
					messagePromise.catch(function (err){
						console.loh(err);
					});
					
				}
			}
			else{
				message.channel.sendMessage("Incorrent syntax, please use: !clearuser <name> <amount>");
			}
				
		}
		else if(splitMessage[0] === "!post")
		{
			
			console.log("Creating new event...");
			
			try
			{
				var name = "";
				var n = 0;
				var fullName = "";
				//var starttime = "";
				//var timezone = "";
				console.log(message.content.indexOf('"'));
				if(String(message.content).indexOf('"') > -1){
					console.log('!');
					var split = message.content.split('"');
					if(split.length == 3){
						fullName = split[1];
						n = fullName.split(' ').length - 1;
						console.log(n);
					}
					else{
						message.reply("Invalid Syntax");
					}
				}
					
				else{
					
					name = splitMessage[1];
					var diff = "";
					
					if(name.indexOf('-') > -1){
						//contains a dash, ie wotm-h
						console.log("!");
						diff = name.split('-')[1];
						console.log(diff);
						if(String(diff) == "h"){
							diff = "Hard Mode";
						}
						else if(String(diff) == "n"){
							diff = "Normal Mode"
						}
						else {
							diff = "";
						}
							
					}
					
					
					
					if(name.split('-')[0] == "wotm")
					{
						fullName = "Wrath of The Machine "+diff;
					}
					else if(name.split('-')[0] == "kf")
					{
						fullName = "King's Fall "+diff;
					}
					else if(name.split('-')[0] == "ce")
					{
						fullName = "Crota's End "+diff;
					}
					else if(name.split('-')[0] == "vog"){
						fullName = "Vault of Glass "+diff;
					}
					else if(name.split('-')[0] == "coe"){
						fullName = "Challenge of Elders";
					}
					else{
						fullName = name;
					}
				}
					
				var newEvent = new Events.Event(events.length + 1, fullName, splitMessage[2 + n], splitMessage[3 + n], message.member.user.username); 
				
				message.channel.sendMessage("```\n================================\n"+fullName+"\n================================\nStart Time: "+newEvent.startTime + "-"+newEvent.timeZone+"\n================================\nGroup ID: "+newEvent.id+"\n================================```");
				Events.addPlayer(newEvent, message.member.user.username);
				//message.reply("Creating your event: ID="+event.id+", Name="+event.name+", Start time="+event.startTime+"-"+event.timeZone);
				console.log(newEvent);
				events.push(newEvent);
			}	
			catch(err)
			{
				console.log(err.message);
			}
			updateGroupsJSON();
			
		}
	    else if(splitMessage[0] == "!group"){
			if(splitMessage.length == 2){
				if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events[parseInt(id) - 1];
					output = "```\n================================\n"+event.name+"\n================================\nStart Time: "+event.startTime + "-"+event.timeZone+"\n================================\nGroup ID: "+event.id+"\n================================"+"\nRoster:\n";
					var playerIndex = 1;
					for(i = 0; i < event.players.length; i++){
						if(playerIndex==7)
						{
							output += "Substitutes:\n";
						}
						output += playerIndex+". "+event.players[i]+"\n";
						++playerIndex;
					}
					output+="```";
					message.channel.sendMessage(output);
				}
			}
		}
		}
	    else if(splitMessage[0] == "!joingroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events.find(x => x.id == id);
					Events.addPlayer(event, message.member.user.username);
					message.reply("added you to "+event.name);
					updateGroupsJSON();
				}
				
			}
		}
	    else if(splitMessage[0] == "!leavegroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					
					var event = events.find(x => x.id == id);
					Events.removePlayer(event, message.member.user.username);
					updateGroupsJSON();
				}
			}
		}
		else if(splitMessage[0] === "!removegroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				
				if(id - 1 < events.length && id >= 0){
					try{
						var event = events.find(x => x.id == id);
						var eventC = String(event.creator);
						var messageC = String(message.member.user.username);
						
						if(hasModPerms(message)){
							index = events.findIndex(x => x.id==id);
							events.splice(index, 1);
							for(i = 0; i < events.length; i++){
								events[i].id = i + 1;
							}
						}
						
						else if(eventC === messageC){
							var index = events.findIndex(x => x.id==id);
							events.splice(index, 1);
							for(i = 0; i < events.length; i++){
								events[i].id = i + 1;
							}
						}
						else{
							console.log(message.member.user.username + ", "+event.creator);
							message.channel.sendMessage("You can't delete that group because you are not the creator!");
						}
						updateGroupsJSON();
					}
					catch(err){
						console.log(err);
					}
					
				}
			}
			
		}
		
    	else if(splitMessage[0] === "!rolecall"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events.find(x => x.id == id);
					var output = "Rolecall for "+event.name+" at "+event.startTime+" "+event.timeZone+"\n";
					for(i = 0; i < event.players.length; i++){
						var userToPing = findUserNoMsg(event.players[i]);
						output += userToPing;
					}
					message.channel.sendMessage(output);
				}
			}
		}
		
		else if (splitMessage[0] === "!addtogroup"){
			if (splitMessage.length >= 3){
				
				var id = splitMessage[1];
				
				if (id - 1 < events.length && id > 0){
					
					var event = events.find(x => x.id == id);
					var userToFind = splitMessage[2];
						
					// Build the user name, for when there are spaces in the name
					for (var i = 3; i < splitMessage.length; i++){
						userToFind = userToFind + " " + splitMessage[i];
					}
					var foundUser = findUser(message, userToFind);
				
					if (foundUser != null) {
						// All is good, add user to group
						Events.addPlayer(event, foundUser);
						message.channel.sendMessage("Added " + foundUser.user.username + " to group " + id);
						updateGroupsJSON();
					
					} else {
						// Could not find user
						message.channel.sendMessage("I could not find that user");
					}
				} else {
					// Could not find event
					message.channel.sendMessage("I could not find that event");
				}
			} else {
				//Missing parameters
				message.channel.sendMessage("There are missing parameters. Here is a usage example: \n```!addtogroup 1 Reusableduckk```");
			}
		}
		
		else if (splitMessage[0] === "!removefromgroup"){
			if (splitMessage.length >= 3){
				
				var id = splitMessage[1];
				
				if (id - 1 < events.length && id > 0){
					
					var event = events.find(x => x.id == id);
					var userToFind = splitMessage[2];
						
					// Build the user name, for when there are spaces in the name
					for (var i = 3; i < splitMessage.length; i++){
						userToFind = userToFind + " " + splitMessage[i];
					}
					var foundUser = findUser(message, userToFind);
				
					if (foundUser != null) {
						// All is good, remove user from group
						Events.removePlayer(event, foundUser.user.username);
						
						message.channel.sendMessage("Removed " + foundUser.user.username + " from group " + id);
						updateGroupsJSON();
					
					} else {
						// Could not find user
						message.channel.sendMessage("I could not find that user");
					}
				} else {
					// Could not find event
					message.channel.sendMessage("I could not find that group");
				}
			} else {
				//Missing parameters
				message.channel.sendMessage("There are missing parameters. Here is a usage example: \n```!removefromgroup 1 Reusableduckk```");
			}
		}
		/*
		else if (splitMessage[0] === "!muteuser"){
				if (hasModPerms(message)){
					if(splitMessage.length == 2){
						
						var name = splitMessage[1];
						var found = findUser(message, name);
						
						if (found != null){
							message.channel.overwritePermissions(found.user, {
								SEND_MESSAGES: false
								})
								.then(() => console.log("User " + found.user.username + " has been muted"))
								.catch(e => console.log("Error muting user!"));
						} else {
							message.channel.sendMessage("Could not find a user with that name/nickname");
						}
					}
				}
		}
			else if (splitMessage[0] === "!unmuteuser"){
				if (hasModPerms(message)){
					if(splitMessage.length == 2){
						
						var name = splitMessage[1];
						var found = findUser(message, name);
						
						if (found != null){
							message.channel.overwritePermissions(found.user, {
								SEND_MESSAGES: true
								})
								.then(() => console.log("User " + found.user.username + " has been unmuted"))
								.catch(e => console.log("Error muting user!"));
						} else {
							message.channel.sendMessage("Could not find a user with that name/nickname");
						}
					}
				}
		}
		*/
			else if (splitMessage[0] === "!addrole"){
				if (hasModPerms(message)){
					if(splitMessage.length >= 3){
						
						var roleToFind = splitMessage[1];
						var userToFind = splitMessage[2];
						
						// Build the user name, for when there are spaces in the name
						for (var i = 3; i < splitMessage.length; i++){
							userToFind = userToFind + " " + splitMessage[i];
						}
						
						var foundUser = findUser(message, userToFind);
						var foundRole = message.guild.roles.find('name', roleToFind);
			
						
						if (foundUser != null){
							if (foundRole != null){
								
								foundUser.addRole(foundRole.id)
									.then(() => message.channel.sendMessage("Added role " + roleToFind + " to " + userToFind))
									.catch(() => message.channel.sendMessage("Error adding role, I probably don't have the proper permissions"));	
							} else {
								// no role
								message.channel.sendMessage("The role: " + roleToFind + " does not exist");
							}
						} else {
							// user not found
							message.channel.sendMessage("The user: " + userToFind + " does not exist");
						}
					} else {
						// improper syntax
						message.channel.sendMessage("Improper syntax. Proper use: !addrole <role> <username>, spaces in the username are okay");
					}
				} else {
					// No mod perms
					message.channel.sendMessage("You do not have moderator permissions");
				}
		}
			else if (splitMessage[0] === "!removerole"){
				if (hasModPerms(message)){
					if(splitMessage.length >= 3){
						
						var roleToFind = splitMessage[1];
						var userToFind = splitMessage[2];
						
						// Build the user name, for when there are spaces in the name
						for (var i = 3; i < splitMessage.length; i++){
							userToFind = userToFind + " " + splitMessage[i];
						}
						
						var foundUser = findUser(message, userToFind);
						var foundRole = message.guild.roles.find('name', roleToFind);
			
						
						if (foundUser != null){
							if (foundRole != null){
								
								foundUser.removeRole(foundRole.id)
									.then(() => message.channel.sendMessage("Removed role " + roleToFind + " from " + userToFind))
									.catch(() => message.channel.sendMessage("Error removing role, I probably don't have the proper permissions"));	
							} else {
								// no role
								message.channel.sendMessage("The role: " + roleToFind + " does not exist");
							}
						} else {
							// user not found
							message.channel.sendMessage("The user: " + userToFind + " does not exist");
						}
					} else {
						// improper syntax
						message.channel.sendMessage("Improper syntax. Proper use: !removerole <role> <username>, spaces in the username are okay");
					}
				} else {
					// No mod perms
					message.channel.sendMessage("You do not have moderator permissions");
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
			client.channels.array()[i].sendMessage("Welcome to Seraphim Elite "+member.user+", make sure you read the rules in # welcome-read-me, and feel free to introduce yourself to the rest of the clan! If you haven't already, you can set Seraphim Elite as your active clan at: https://www.bungie.net/en/Clan/Detail/1866434");
			//console.log(client.channels.array()[i].guild.roles);
			var initRole = client.channels.array()[i].guild.roles.find('name', 'Initiate');
			//console.log(client.channels.array()[i].guild.roles);
			member.addRole(initRole.id);
		}
		
	}
});

module.exports = {
	Start: function(){
			client.login('MjQ0NjEzOTYyOTE2NjkxOTY4.CwFLlA.-JAnNUCZg1DdQwbtlIrW1r51xg4'); //BenBot
			//client.login('MjQxODI2MjM3OTk0MTA2ODgw.Cv2KwA.LSE2UW3q0TY_xlpifGhSr3EijSY'); //DuckBot
	}
}


// returns event
// null if id is not found
function findEvent(eID){
	
	var result = null;
	
	for(var i = 0; i < events.length; i++){
		if (events[i].id == eID){
			result = events[i];
		}
	}
	
	return result;
}

// @param input: input message
// @param name: Nickname or Username, SPACES ALLOWED
// @return GuildMember: Member obj or null
function findUser(input, name){
	
	var memberList = input.guild.members.array();
	var foundMember = null;
	
	var username = null;
	var nickname = null;
	
	for (var i = 0; i < memberList.length; i++){
		
		if (memberList[i].nickname != null){
			nickname = memberList[i].nickname.trim();
		} else {
			nickname = null;
		}
		
		if (memberList[i].user.username != null){
			username = memberList[i].user.username.trim();
		} else {
			username = null;
		}
		
		if (memberList[i].nickname == name.trim()){
			foundMember = memberList[i];
		} else if (memberList[i].user.username == name.trim()){
			foundMember = memberList[i];
		}
		//console.log("Nickname: " + memberList[i].nickname);
		//console.log("Username: " + memberList[i].user.username);
	}
	if (foundMember != null){
		console.log("Found user");
	} else {
		console.log("Could not find user");
	}
	return foundMember;
}
function isLinked(name){
	for(i = 0; i < linked_users.length; i++){
		var linker = linked_users[i];
		if(linker.DiscordName == name){
			return true;
		}
	}
}
function findUserNoMsg(name){
	var g = null;
	for(i = 0; i < client.channels.array().length; ++i){
		if(client.channels.array()[i].name == "general")
		{
			g = client.channels.array()[i].guild;
		}
		
	}
	var memberList = g.members.array();
	var foundMember = null;
	
	var username = null;
	var nickname = null;
	
	for (var i = 0; i < memberList.length; i++){
		
		if (memberList[i].nickname != null){
			nickname = memberList[i].nickname.trim();
		} else {
			nickname = null;
		}
		
		if (memberList[i].user.username != null){
			username = memberList[i].user.username.trim();
		} else {
			username = null;
		}
		
		if (memberList[i].nickname == name.trim()){
			foundMember = memberList[i];
		} else if (memberList[i].user.username == name.trim()){
			foundMember = memberList[i];
		}
		//console.log("Nickname: " + memberList[i].nickname);
		//console.log("Username: " + memberList[i].user.username);
	}
	if (foundMember != null){
		console.log("Found user");
	} else {
		console.log("Could not find user");
	}
	return foundMember;
}
function updateGroupsJSON(){
	if(events.length > 0){
		try{
			var eventString = JSON.stringify(events);
			
			fs.writeFile('home/events.json', eventString);
			
		}
		catch(err){
			console.log(err);
			fs.writeFile('home/events.json', "");
		}
	}
	
	
}

function updateLinksJSON(){
	if(linked_users.length > 0){
		console.log('Updating links JSON');
		try{
			var jsonString = JSON.stringify(linked_users);
			fs.writeFile("home/links.json", jsonString);
		}
		catch(err){
			console.log(err);
		}
	}
}
function updateLinksList(){
	fs.exists("home/links.json", function(exists){
		if(exists){
			fs.readFile('home/links.json', (err, data) => {
				var arrayObject = JSON.parse(data);
				linked_users = arrayObject;
			});
			
		}
		else{
			console.log("Link file does not exist.");
		}
		
	});
}
function exitHandler(options, err) {
    if (options.cleanup) {
	    console.log("Saving groups...")
	    updateGroupsJSON();
		updateGroupsList();
	    
    }
    else if (err) 
    {
	    console.log(err.stack);
    }
    else if (options.exit) {
	    //CTRL-C
	    process.exit();
	    
    }
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));

process.on('SIGINT', exitHandler.bind(null, {exit:true}));

process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

function updateGroupsList(){
	fs.exists("home/events.json", function(exists){
		if(exists){
			fs.readFile('home/events.json', (err, data) => {
				try{
					var jObject = JSON.parse(data); 
					events = jObject;
				}
				catch(err){
					console.log(err)
				}
				
			});
			
		}
		else{
			console.log("Event file does not exist.");
		}
		
	});
	
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function getGroups(username){
	var return_events = [];
	for(i = 0; i < events.length; i++){
		var event = events[i];
		if(event.players.contains(username)){
			return_events.push(event);
		}
		
	}
	return return_events;
}
function isBotCommander(input){
	console.log(input.member.roles);
	return input.member.roles.exists('name', 'Bot Commander')
			
}
function hasModPerms(input) {
	try{
 
		var modPerms = [ "MANAGE_MESSAGES", "MANAGE_ROLES_OR_PERMISSIONS" ];
		var mod = input.member.permissions.hasPermissions(modPerms, true);
		return mod;
		
	}
	catch(err){
		console.log(err.message);
	}

} 
