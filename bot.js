const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log('Client Connected!');	
});


var messages = [];

client.on('message', message => {
	messages.push(message);
	if(message.content == '!ping'){
		message.reply('You called? (This bot was made by Ben(NullRoz007), you can grab the source at: https://github.com/GitDwarf/SeraphimBot');
	}
	else if(message.content == "!clear"){
		
		message.channel.sendMessage("I can't do that because Ben (NullRoz007) is bad at his job.");
	}
	else if(message.content == "!log"){
		for(index = 0; index < messages.length; ++index){
			console.log(messages[index].author+":"+messages[index].content);	

			
		}
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


function login_output(error, token)
{
	if(error)
	{
		console.log("Error logging in with token: "+token);
	}	
	else 
	{
		console.log("Logged in with token: "+token)
	}
}

client.login('MjQ0NjEzOTYyOTE2NjkxOTY4.CwFLlA.-JAnNUCZg1DdQwbtlIrW1r51xg4');
