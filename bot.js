var SeraBot = require('./dis');
var Server = require('./server');
//Start the server
console.log("Starting the server...")
Server.Start();

//Start the Discord Bot.
console.log("Starting the Discord client...")
SeraBot.Start();