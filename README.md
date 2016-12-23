# SeraphimBot
A discord bot written in javascript using node.js and discord.js 


#Progress List:
1. Welcome new users [x]
2. Automaticaly promote new users [x]
3. Post new group [x]
4. Join group [x]
5. Leave group [x] 
6. Ping each player in group [x]
7. Clear chat [x]
8. Delete group [x]
9. Link destiny account to Discord account [x]
10. Get destiny player kd over x amount of games (max 25) [x]
11. Get destiny player elo from guardian.gg, (using guardian.gg api) [x]
12. Generate charts from elo or kd data []
13. Event API [x]

#Mod Commands
|Command|Description|
|-------|-----------|
!clear  | Clears recent messages in the channel 
!addrole <role> <username>  | adds the role to user, if both exist"
!removerole <role> <username>  | removes the role from the user, if both exist

#General Commands
|Command|Description|
|-------|-----------|
!ping  	|  A tiny bit about the bot
			
#LFG Commands
|Command|Description|
|-------|-----------|
!post <activity> <time> <timezone>  |  Creates a new group. <activity> can be an abbreviation like wotm or vog. If you do not enter a recognized abbreviation, it will take whatever you entered. You can also add -n or -h to the activity to show normal or hard mode. To use a name with spaces in it put \" around it.
!groups  |  Displays all active groups 
!group <ID>  |  Displays a specific group with the given ID
!joingroup <ID>  |  Join the group with the given ID
!leavegroup <ID>  |  Leave the group with the given ID
!removegroup <ID>  | Removes the group with the given ID. Removed groups erased and can no longer be joined. Only the creator can use this
!rolecall <ID>  |  @ mentions everyone in the given group.
You can also view active groups at: http://seraphimbot.mod.bz/home/groups
			
#Destiny Commands
|Command|Description|
|-------|-----------|
!destiny link <psn_name> | Link your Discord account to your Destiny account (REQUIRED)
!destiny gr | Get your current grimoire score
!destiny elo | Get your current highest Elo from guardian.gg
!destiny kd <games> | Get your kd ratio over a number of games, including your average kd ratio over these games. This will get data from your last played character


#Event API
Endpoints are defined in routes.js and in bot.js, It's a bit of a mess. 
| Endpoint | Description|
|----------|-------------|
|/groups   |Returns a JSON file containing all currently avalible groups |
|/groups/{groupID}/ | returns JSON Data on specific group |

#Bot API
| Endpoint | Description|
|----------|-------------|
|/         | Return bot status, will be replaced with /status with / redirecting to /home |
|/chart/generate/:hash/ | Returns chart data on a specific file. Hash is SHA1 hash corresponding to a specific file, generated using !destiny elochart |

