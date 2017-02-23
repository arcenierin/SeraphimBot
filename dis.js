const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const Events = require('./events/event');
var colors = require('colors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Jimp = require('jimp');
var Destiny = require('./destiny-client');
var guardianApi = require('./guardiangg/guardian')
var querystring = require('querystring');
var sha1 = require('sha1');
var util = require('util');
var plotly = require('plotly')("NullRoz007", "2yYBQDRLXf5OyHfHUHuA");
var striptags = require('striptags');
var messages = [];
var events = [];
var event_offset = 0;
var linked_users = [];
var destiny = Destiny('af70e027a7694afc8ed613589bf04a60');

//game modes for guardian.gg
var gg_modes = {
	"skirmish": "9", 
	"control": "10", 
	"clash": "12", 
	"rumble": "13", 
	"trials": "14",
	"ironbanner": "19",
	"elimination": "23",
	"rift": "24",
	"zonecontrol": "28", 
	"supremacy": "31", 
	"all": "34",
	"rumblesupremacy": "531"
}

var months = {
	"1": "Jan",
	"2": "Feb",
	"3": "Mar",
	"4": "Apr",
	"5": "May",
	"6": "Jun",
	"7": "Jul",
	"8": "Aug",
	"9": "Sep",
	"10": "Oct",
	"11": "Nov",
	"12": "Dec"
}
var VERSION = "1.2.2";
var changelog = "1.2.2: \n" +
				"	 1) Added !destiny event command"
				
client.on('ready', () => {
	console.log('Client Connected!');	
	updateGroupsList();
	updateLinksList();
	
	client.user.setGame("Ver: " + VERSION)
		.then(console.log("Set the game status"))
		.catch(err => console.log(err));
		
});

client.on('message', message => {
	//update the list of messages with the send message.
    messages.push(message);
    if(message.content === "!ping"){
	message.reply('You called? (This bot was made by Ben (NullRoz007) and Reusableduckk, @ one of them if there are any problems.\nCurrent Version: '+VERSION);
    }
	else if(message.content ==="!changelog"){
		message.channel.sendMessage("Current Version: "+VERSION+"\n"+"Change Log: \n"+changelog);
	}
	
	//clear messages from channel
    else if(message.content === "!clear"){
		
		if (hasModPerms(message)){
			
			//fetch our messages from the channel
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
	//rebuild the groups and links
	else if(message.content === "!rebuild"){
		if(isBotCommander(message)){
			try{
				console.log("Rebuilding groups...");
				message.channel.sendMessage("Rebuilding groups...");
				updateGroupsJSON();
				updateGroupsList();
				message.channel.sendMessage("Rebuilding destiny<->discord links...");
				updateLinksJSON();
				updateLinksList();
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
		
		var h_mod = "**Mod Commands**\n" +
					 "!clear  :  Clears recent messages in the channel\n" +
					 "!clearuser <amount> <username>  :  searches through <amount> message and deletes any authored by <username>\n" +
					 "!addrole <role> <username>  : adds the role to user, if both exist\n" +
					 "!removerole <role> <username>  : removes the role from the user, if both exist\n\n";

		var h_gen = "**General Commands**\n" +
					"!ping  :  A tiny bit about the bot\n" +
					"!changelog : Display the Changelog\n" +
					"!help : Display this message\n\n";
			
		
		var h_lfg = "**LFG Commands**\n" +
					"!post <activity> <time> <timezone>  :  Creates a new group. <activity> can be an abbreviation like wotm or vog. If you do not enter a recognized abbreviation, it will take whatever you entered. You can also add -n or -h to the activity to show normal or hard mode. To use a name with spaces in it put \" around it. \n" +
					"!groups  :  Displays all active groups\n" +
					"!mygroups : Display all active groups that you are a member of\n"+
					"!group <ID>  :  Displays a specific group with the given ID\n" +
					"!joingroup <ID>  :  Join the group with the given ID\n" +
					"!leavegroup <ID>  :  Leave the group with the given ID\n" +
					"!removegroup <ID>  :  Removes the group with the given ID. Removed groups erased and can no longer be joined. Only the creator can use this\n" +
					"!rolecall <ID>  :  @ mentions everyone in the given group. Please do not abuse this.\n\n";
		
		var h_des = "**Destiny Commands**\n"+
					"!destiny link <psn_name> : Link your Discord account to your Destiny account (REQUIRED)\n" +
					"!destiny unlink : Unlink your Discord and Destiny accounts\n"+
					"!destiny gr : Get your current grimoire score \n"+
					"!destiny elo : Get your current highest Elo from guardian.gg\n" +
					"!destiny kd <games> <characterindex 0-2>: Get your kd ratio over a number of games, including your average kd ratio over these games.\n" +
					"!destiny raids <optionalstat> : Get your raid clears on all characters, + an option stat\n"+
					"!destiny elograph <gamemode> <graphtype> <specialoption> : graphtype can be anything found at the bottom of this webpage: https://plot.ly/javascript, however scatter works best. specialoptions can only be -f, for fill.\n" + 
					"!destiny current : Displays the current activity you are in.\n" + 
					"!destiny event list : list avaliable events.\n"+
					"!destiny event <eventname>"
			
		message.reply("I'm sending you a DM now...");
		
		
		if (hasModPerms(message)){
			message.author.sendMessage(h_mod)
				.then(console.log("Sucess"))
				.catch(err => console.log(err));
		}
				
		message.author.sendMessage(h_gen)
				.then(console.log("Sucess"))
				.catch(err => console.log(err));
				
		message.author.sendMessage(h_lfg)
				.then(console.log("Sucess"))
				.catch(err => console.log(err));
				
		message.author.sendMessage(h_des)
				.then(console.log("Sucess"))
				.catch(err => console.log(err));
		
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
			
			if(splitMessage[0] === "!createRole"){
				if(hasModPerms(message))
				{
					var rolename = splitMessage[1];
					if(rolename[0] == '"'){
						var string_split = message.content.split('"')[1];
						rolename = string_split;
					}
					var guild = message.guild;
					guild.createRole({
						name: rolename,
					})
					.then(role => message.channel.sendMessage("Created role: "+rolename))
					.catch(console.error);
				}
				
			}
			else if(splitMessage[0] === "!deleteRole"){
				if(hasModPerms(message)){
					var rolename = splitMessage[1];
					if(rolename[0] == '"'){
						var string_split = message.content.split('"')[1];
						rolename = string_split;
					}
					var role = message.guild.roles.find('name', rolename);
					role.delete()
						.then(message.channel.sendMessage("Deleted role: "+rolename))
						.catch(console.error);
				}
				
			}
	    	else if(splitMessage[0] === "!clear"){
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
				else if(splitMessage[1] === "summary"){
					if(splitMessage.length == 2){
						var messageName = String(message.member.user.username);
						if(splitMessage.length == 3){
							messageName = splitMessage[2];
						}
						for(i = 0; i < linked_users.length; i++){
							if(String(linked_users[i].discordName) == messageName){
								var id = linked_users[i].destinyId;
								var grScore = "";
								var charCount = 0;
								var characters = [];
								var characterSummarys = [];
								console.log(id);
								destiny.Account({
									membershipType: 2,
									membershipId: id
								}).then(res => {
									//console.log(res);
									grScore = res.grimoireScore;
									charCount = res.characters.length;
									console.log(charCount);
									for(x = 0; x < charCount; x++){
										var character = res.characters[x];
										var characterBase = character.characterBase;
										var characterGender = characterBase.genderType;
										var characterLevel = character.characterLevel;
										var powerLevel = characterBase.powerLevel;
										
										var character_def = {'Level': characterLevel, 'Gender':characterGender, 'Light': powerLevel};
										console.log(character_def);
										characterSummarys.push(character_def);
									}
									var output = "Player summary for "+messageName+":\nGrimiore Score: "+grScore + " - Characters: " + charCount+"\n";
									for(x = 0; x < characterSummarys.length; x++){
										var summary = characterSummarys[x];
										output += "```Level: "+summary.Level;
									}
									
									console.log(output);
									message.channel.sendMessage(output);
									
								});
							}
						}
					}
				}
				else if(splitMessage[1] === "event"){
					var name = splitMessage[2];
					console.log(name);
					destiny.Advisors({
						definitions: true
					}).then(res => {	
						if(name == "list"){
							console.log("!");
							var m = "";
							var i = 0;
							Object.keys(res.activities).forEach(function(key){
								i++;
								var val = res.activities[key];
								console.log(val.identifier);
								m += String(i)+") " + String(val.identifier)+"\n";
							});
							
							message.channel.sendMessage("Events: \n"+m);
							return;
						}
						var status = res.activities[name].status;
						var vendorHash = res.activities[name].vendorHash;
						var act = res.activities[name];
						var dis = act.display;
						
						var tipString = "";
						for(i = 0; i < dis.tips.length; i++){
							tipString += String(dis.tips[i]) + "\n";
						}
						console.log(dis);
						var about = dis.about;
						about = striptags(about);
						
						
						const embed = new Discord.RichEmbed()
							.setTitle(dis.advisorTypeCategory)
							.setColor(0x00AE86)
							.setDescription(about)
							.setThumbnail("http://bungie.net/"+dis.icon)
							
						
						var activityHash = dis.activityHash;
						console.log(activityHash);
						destiny.Manifest({
							type: 'Activity',
							hash: activityHash
						}).then(res => {
							console.log(res);
							var name = res.activity.activityName;
							var about = res.activity.activityDescription;
							embed.addField("Activity: "+name, about);
							embed.addField("Tips",tipString);
							embed.setImage("http://www.bungie.net"+res.activity.pgcrImage);
							console.log(embed);
							message.channel.sendEmbed(embed);
						});
						
						//console.log(act);
					});
				}
				else if(splitMessage[1] === "eventvendor"){
					var name = splitMessage[2];
					console.log(name);
					destiny.Advisors({
						definitions: true
					}).then(res => {	
						if(name == "list"){
							console.log("!");
							var m = "";
							var i = 0;
							Object.keys(res.activities).forEach(function(key){
								i++;
								var val = res.activities[key];
								console.log(val.identifier);
								m += String(i)+") " + String(val.identifier)+"\n";
							});
							
							message.channel.sendMessage("Event Vendors: \n"+m);
							return;
						}
						var status = res.activities[name].status;
						var vendorHash = res.activities[name].vendorHash;
						
						console.log(vendorHash);
						destiny.Manifest({
							type: 'Vendor',
							hash: vendorHash
						}).then(ven => {
							console.log(ven);
							//console.log("--------------------------------------------\n" +
								//ven.vendor.summary.vendorDescription);
							var categories = ven.vendor.categories;
							var processed_catagories = [];
							
							var sales = ven.vendor.sales;
							console.log(sales);
							const embed = new Discord.RichEmbed()
								.setTitle(ven.vendor.summary.vendorName)
								.setColor(0xFDFF00)
								.addField("Description: ", ven.vendor.summary.vendorDescription)
								//.setImage("http://www.bungie.net/"+ven.vendor.summary.vendorPortrait)
								.setThumbnail("http://www.bungie.net/"+ven.vendor.summary.vendorPortrait);
							for(i = 0; i < categories.length; i++){
								var category = categories[i];
								if(category.displayTitle.includes('Rewards') && !processed_catagories.contains(category.displayTitle)){
									embed.addField("**Items**", "*Items avaliable for purchase from "+ven.vendor.summary.vendorName+":*", true);
									//console.log(category);
									processed_catagories.push(category.displayTitle);
								}
								
							}
							var itemnames = "";
							var proc = 0;
							var sent = false;
							for(i = 0; i < sales.length; i++){
								console.log(i);
								var item = sales[i];
								//console.log(item);
								destiny.Manifest({
									type: 'InventoryItem', 
									hash: item.itemHash
								}).then(res => {
									console.log(res);
									embed.addField("	"+res.inventoryItem.itemName, "		*"+res.inventoryItem.itemDescription+"*\n");
									if(embed.fields.length == 7 && !sent){
										console.log("sending...")
										message.channel.sendEmbed(embed);
										sent = true;
									}
									
								});
								
							}
							
							
						});
						if(!status.active){
							message.channel.sendMessage(name+" is not avaliable at this time.");
							return;
						}
						
					});
				}
				else if(splitMessage[1] === "weeklysummary"){
					destiny.Advisors({
						definitions: true
					}).then(adv => {
						// NIGHTFALL -----------------------------------------------------------
						var nfHash = adv.activities["nightfall"].display.activityHash;
						var nfSkulls = adv.activities["nightfall"].extended.skullCategories[0].skulls;
						
						destiny.Manifest({
							type: 'Activity',
							hash: nfHash
							}).then(res => {								
								var name = res.activity.activityName;								
								const embed = new Discord.RichEmbed()
									.setTitle("Nightfall: " + name)
									.setThumbnail("http://bungie.net/"+res.activity.icon)
									.setColor(0x00AE86);
									
								var i;
								for(i = 0; i < nfSkulls.length; i++){
									embed.addField(nfSkulls[i].displayName, nfSkulls[i].description);
								}
								
								//console.log(embed);
								message.channel.sendEmbed(embed);
							});
						
						// HEROICS -----------------------------------------------------------
						var hsHash = adv.activities["heroicstrike"].display.activityHash;
						var hsSkulls = adv.activities["heroicstrike"].extended.skullCategories[0].skulls;
							
						destiny.Manifest({
							type: 'Activity',
							hash: hsHash
							}).then(res => {
								//console.log(res.activity);								
								var name = res.activity.activityName;								
								const embed = new Discord.RichEmbed()
									.setTitle("Heroic Playlist: " + name)
									.setThumbnail("http://bungie.net/"+res.activity.icon)
									.setColor(0x00AE76);
									
								var i;
								for(i = 0; i < hsSkulls.length; i++){
									embed.addField(hsSkulls[i].displayName, hsSkulls[i].description);
								}
								
								//console.log(embed);
								message.channel.sendEmbed(embed);
							});
						
						// KINGS FALL
						var kfHash = adv.activities["kingsfall"].display.activityHash;
						
						destiny.Manifest({
							type: 'Activity',
							hash: kfHash
							}).then(res => {
								//console.log(res.activity);
								var kfSkulls = res.activity.skulls;
								var name = res.activity.activityName;

								var start = new Date("2015-12-8");
								var today = new Date();
								var weeks = Math.round((today-start)/ 604800000);
								var offset = 1;
								var ind = ((weeks % 3) + offset) % 3; 
								
								const embed = new Discord.RichEmbed()
									.setTitle("Raid: " + name)
									.setThumbnail("http://bungie.net/"+kfSkulls[ind].icon)
									.setColor(0x00AE76);
											
								embed.addField(kfSkulls[ind].displayName, kfSkulls[ind].description);
								
								//console.log(embed);
								message.channel.sendEmbed(embed);
							});
						
						// WOTM
						var wmHash = adv.activities["wrathofthemachine"].display.activityHash;
						
						destiny.Manifest({
							type: 'Activity',
							hash: wmHash
							}).then(res => {
								console.log(res.activity);
								var wmSkulls = res.activity.skulls;
								var name = res.activity.activityName;

								var start = new Date("2016-11-1");
								var today = new Date();
								var weeks = Math.round((today-start)/ 604800000);
								var offset = 0;
								var ind = ((weeks % 2) + offset) % 3;
								
								const embed = new Discord.RichEmbed()
									.setTitle("Raid: " + name)
									.setThumbnail("http://bungie.net/"+wmSkulls[ind].icon)
									.setColor(0x00AE76);
											
								embed.addField(wmSkulls[ind].displayName, wmSkulls[ind].description);
								
								//console.log(embed);
								message.channel.sendEmbed(embed);
							});
						
					}).catch(err => console.log(err));
				}
				else if(splitMessage[1] === "current"){
					for(i = 0; i < linked_users.length; i++){
						var messageName = String(message.member.user.username);
						if(splitMessage.length == 3){
							messageName = splitMessage[2];
						}
						if(String(linked_users[i].discordName) == messageName){
							var id = linked_users[i].destinyId;
							console.log(id);
							destiny.Account({
								membershipType: 2,
								membershipId: id
							}).then(res => {
								//console.log(res.characters[0].characterBase);
								var output = "";
								var current_hash = res.characters[0].characterBase.currentActivityHash;
								if(current_hash != 0){
									destiny.Manifest({
										type: 'Activity',
										hash: current_hash
									}).then(act => {
										console.log(act);
										var activity_name = act.activity.activityName;
										var description = act.activity.activityDescription;
										var icon = act.activity.icon;
										
										var destination_hash = act.activity.destinationHash;
										var activityTypeHash = act.activity.activityTypeHash;
										destiny.Manifest({
											type: "Destination",
											hash: destination_hash
										}).then(des => {
											console.log(des);
											var destination_name = des.destination.destinationName;
											output = message.member.user.username + " is in "+destination_name + ", playing: " + activity_name+"\n\n";	
											var color = 0x000000;
											var level = act.activity.activityLevel;
											if(level <= 10){
												color = 0xFFFFFF;
											}
											else if(level >= 11 && level <= 20){
												color = 0x00AE86;
											}
											else if(level >= 21 && level <= 30){
												color = 0xADD8E6;
											}
											else if(level >= 31 && level <= 40){
												color = 0x800080;
											}
											else if(level > 40){
												color = 0xFDFF00;
											}
											const embed = new Discord.RichEmbed()
												.setTitle(output)
												.setColor(color)
												.addField("Description: ", act.activity.activityDescription)
												.setImage("http://www.bungie.net/"+des.destination.icon)
												.setThumbnail("http://www.bungie.net/"+icon);
											console.log(embed);
											message.channel.sendEmbed(embed);											
										});										
									});
								}
								else{
									output = message.member.user + " is not online or is in Orbit."
									message.channel.sendMessage(output);
								}
							
							});
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
										message.channel.sendMessage(messageName+"'s Average Elo is "+elo);
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
											//console.log(eloChart[i].mode)
											if(eloChart[i].mode == gameModeCode){
												var date = new Date();
												date.setTime(eloChart[i].x);
												
												var month = date.getUTCMonth() + 1; 
												var day = date.getUTCDate();
												var year = date.getUTCFullYear();
												var date_string = day+"/"+month + "/" + year;
												
												//console.log("Date: "+String(date));
												gamemodeData.push({"x": date_string, "y": eloChart[i].y})
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
											width: 840, 
											height: 480
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
				else if(splitMessage[1] === "raids"){
					var messageName = String(message.member.user.username);
					var completions = '';
					var otherstats = [];
					for(i = 0; i < linked_users.length; i++){
						if(String(linked_users[i].discordName) == messageName){
							var id = linked_users[i].destinyId;
							//console.log(id);
							destiny.Stats({
							membershipType: 2, 
								membershipId: id, 
								characterId: 0
							}).then(stats => {
								completions = stats.raid.allTime.activitiesCleared.basic.value;
								
								
								var output = "\n"+messageName+"'s Raid Completions: " + completions+"\n";
								if(splitMessage.length == 3){
									output += "Other Stats:";
									var lookup = splitMessage[2];
									var result = stats.raid.allTime[lookup].basic.value;
									output += lookup+": "+result;
									
								}
								
								message.channel.sendMessage(output);
							});	
						}
					}
					
				}
				else if(splitMessage[1] === "kd"){
					var messageName = String(message.member.user.username);
					var limit = splitMessage[2];
					var character_index = -1;
					if(splitMessage.length == 4){
						character_index = parseInt(splitMessage[3]);
					}
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
									if(character_index != -1){
										characterId = characters[character_index].characterBase.characterId;
									}
									
								
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
			if(splitMessage.length >= 3){
				var amount = splitMessage[1];
				
				var name = splitMessage[2];
				var i;
				for(i = 3; i < splitMessage.length; i++){
					name = name + " " + splitMessage[i];
				}
				console.log("Looking for messages from: " + name);
				if(hasModPerms(message)){
					var messagePromise = message.channel.fetchMessages({limit: amount});
					messagePromise.then(function (pastMsgs) {
						
						for(i = 0; i < pastMsgs.array().length; i++){
							var msg = pastMsgs.array()[i];
							var msgUsr = String(msg.member.displayName);
							//console.log(msgUsr +", "+name);
							if(msgUsr === name){
								msg.delete()
									.then(res => console.log("Deleted message from " + res.author + "\n"))
									.catch(err => console.log(err)); 
									//(node:24522) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): Error: Bad Request
							}
							
						}
					});
					messagePromise.catch(function (err){
						console.loh(err);
					});
					
				}
				else{
					message.channel.sendMessage("You don't have mod permissions.");
				}
			}
			else{
				message.channel.sendMessage("Incorrect syntax, please use: !clearuser <amount> <name>");
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
					
					const embed = new Discord.RichEmbed()
						.setTitle(event.name)
						.setColor(0x00AE86)
						.addField("Start Time", event.startTime + "-" + event.timeZone)
						
					
						
					//output = "```\n================================\n"+event.name+"\n================================\nStart Time: "+event.startTime + "-"+event.timeZone+"\n================================\nGroup ID: "+event.id+"\n================================"+"\nRoster:\n";
					var playerIndex = 1;
					var players = "";
					for(i = 0; i < event.players.length; i++){
						if(playerIndex==7)
						{
							output += "Substitutes:\n";
						}
						players += playerIndex+". "+event.players[i]+"\n";
						++playerIndex;
					}
					embed.addField("Players", players);
					message.channel.sendEmbed(embed);
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
					message.reply("removed you from "+event.name);
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
						message.channel.sendMessage("Removed group: "+event.name);
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
			client.channels.array()[i].sendMessage("Welcome to Seraphim Elite "+member.user+", make sure you read the rules in # welcome-read-me, and feel free to introduce yourself to the rest of the clan! If you haven't already, you can set Seraphim Elite as your active clan at: https://www.bungie./en/Clan/Detail/1866434");
			var initRole = client.channels.array()[i].guild.roles.find('name', 'Initiate');
			member.addRole(initRole.id);
		}
		
	}
});

module.exports = {
	Start: function(){
			//client.login('MjQ0NjEzOTYyOTE2NjkxOTY4.CwFLlA.-JAnNUCZg1DdQwbtlIrW1r51xg4'); //BenBot
			client.login('MjQxODI2MjM3OTk0MTA2ODgw.Cv2KwA.LSE2UW3q0TY_xlpifGhSr3EijSY'); //DuckBot
	}
}
process.on('uncaughtException', function(err) {
  for(i = 0; i < client.channels.array().length; ++i){
		if(client.channels.array()[i].name == "general")
		{
			client.channels.array()[i].sendMessage("I've hit a snag, the error is: "+ err);
		}
		
	}
});

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
function fileExists(file){
	fs.stat(file, function(err, stat){
		if(err == null){
			return true;
		}
		else {
			return false;
		}
	});
}
function random (low, high) {
    return Math.random() * (high - low) + low;
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
