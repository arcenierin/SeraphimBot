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
	message.reply('You called? (This bot was made by Ben (NullRoz007) and Reusableduckk, @ one of them if there are any problems.');
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
		var output = "";
		
		if (hasModPerms(message)){
			output = "**Mod Commands**\n" +
					 "!clear  :  Clears recent messages in the channel\n" +
					 "!addrole <role> <username>  : adds the role to user, if both exist\n" +
					 "!removerole <role> <username>  : removes the role from the user, if both exist\n\n";
		}
		
		output = output +
			"**General Commands**\n" +
			"!ping  :  A tiny bit about the bot\n\n" +
			
			"**LFG Commands**\n" +
			"!post <activity> <time> <timezone>  :  Creates a new group. <activity> can be an abbreviation like wotm or vog. If you do not enter a recognized abbreviation, it will take whatever you entered. You can also add -n or -h to the activity to show normal or hard mode. To use a name with spaces in it put \" around it. \n" +
			"!groups  :  Displays all active groups\n" +
			"!group <ID>  :  Displays a specific group with the given ID\n" +
			"!joingroup <ID>  :  Join the group with the given ID\n" +
			"!leavegroup <ID>  :  Leave the group with the given ID\n" +
			"!removegroup <ID>  :  Removes the group with the given ID. Removed groups erased and can no longer be joined. Only the creator can use this\n" +
			"!rolecall <ID>  :  @ mentions everyone in the given group. Please do not abuse this.";
			
		message.channel.sendMessage(output);	
    }
    else if(message.content === "!groups"){
		if(events.length != 0){
			console.log("Getting groups...");
			var output = "```";
			for(i = 0; i < events.length; i++){
				var event = events[i];
				output += "ID: "+event.id+", "+event.name+"\n";
			}
			output += "```\nTo get more specific details about a group, type !group <id>.";
			message.channel.sendMessage(output);
		}
		else{
			message.channel.sendMessage("There are no groups, use !post to create one.");
		}
		
    }
    else if(message.content.split(' ').length >= 1){
		var splitMessage = message.content.split(' ');
	    	
		if(splitMessage[0] === "!post")
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
					
				var event = new Events.Event(events.length+1, fullName, splitMessage[2 + n], splitMessage[3 + n], message.member.user.username); 
				
				message.channel.sendMessage("```\n================================\n"+fullName+"\n================================\nStart Time: "+event.startTime + "-"+event.timeZone+"\n================================\nGroup ID: "+event.id+"\n================================```");
				Events.addPlayer(event, message.member);
				//message.reply("Creating your event: ID="+event.id+", Name="+event.name+", Start time="+event.startTime+"-"+event.timeZone);
				console.log(event);
				events.push(event);
			}	
			catch(err)
			{
				console.log(err.message);
			}
		}
	    else if(splitMessage[0] == "!group"){
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
							subs = 0;
						}
						output += playerIndex+". "+event.players[i].user.username+"\n";
						++playerIndex;
					}
					output+="```";
					message.channel.sendMessage(output);
				}
			}
			
			
		}
	    else if(splitMessage[0] == "!joingroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events[parseInt(id) - 1];
					Events.addPlayer(event, message.member);
					message.reply("added you to "+event.name);
				}
				
			}
		}
	    else if(splitMessage[0] == "!leavegroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					
					var event = events[parseInt(id) - 1];
					Events.removePlayer(event, message.member.user.username);
				}
			}
		}
		else if(splitMessage[0] === "!removegroup"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events[parseInt(id) - 1]
					var eventC = String(event.creator);
					var messageC = String(message.member.user.username);
					
					if(eventC === messageC){
						events.splice(id - 1, 1);
					}
					else if(hasModPerms(message)){
						events.splice(id - 1, 1);
					}
					else{
						console.log(message.member.user.username + ", "+event.creator);
						message.channel.sendMessage("You can't delete that group because you are not the creator!");
					}
				}
			}
			
		}
		
    	else if(splitMessage[0] === "!rolecall"){
			if(splitMessage.length == 2){
				var id = splitMessage[1];
				if(id - 1 < events.length && id > 0){
					var event = events[parseInt(id) - 1];
					var output = "Rolecall for "+event.name+" at "+event.startTime+" "+event.timeZone+"\n";
					for(i = 0; i < event.players.length; i++){
						var userToPing = event.players[i].user;
						output += userToPing;
					}
					message.channel.sendMessage(output);
				}
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
			client.channels.array()[i].sendMessage("Welcome to Seraphim Elite "+member.user+", make sure you read the rules in # welcome-read-me, and feel free to introduce yourself to the rest of the clan! If you haven't already, you can set Seraphim Elite as your active clan at: https://www.bungie.net/en/Clan/Detail/1792005");
			//console.log(client.channels.array()[i].guild.roles);
			var initRole = client.channels.array()[i].guild.roles.find('name', 'Initiate');
			//console.log(client.channels.array()[i].guild.roles);
			member.addRole(initRole.id);
		}
		
	}
});


client.login('MjQ0NjEzOTYyOTE2NjkxOTY4.CwFLlA.-JAnNUCZg1DdQwbtlIrW1r51xg4'); //BenBot
//client.login('MjQxODI2MjM3OTk0MTA2ODgw.Cv2KwA.LSE2UW3q0TY_xlpifGhSr3EijSY'); //DuckBot

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

function hasModPerms(input) {
	try{
 
		var modPerms = [ "MANAGE_MESSAGES", "MANAGE_ROLES_OR_PERMISSIONS" ];
	
		return input.member.permissions.hasPermissions(modPerms, true);
	}
	catch(err){
		console.log(err.message);
	}

} 
