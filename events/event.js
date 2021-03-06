module.exports = {
    Event: function(id, name, time, timezone, creator){
        this.players = [];
        this.id = id;
        this.name = name;
        this.startTime = time;
        this.timeZone = timezone;
		this.creator = creator;
    }, 
    addPlayer: function(event, player){
        event.players.push(player);
        console.log('Event: '+event.id+", adding player: "+player);
    },
    removePlayer: function(event, playerName){
        var index = event.players.findIndex(x => x == playerName);
        if(index != -1){
            event.players.splice(index, 1);
            console.log(index);
            console.log('Event: '+event.id+", removing player: "+event.players[index]); 
        }
        else {
            console.log('Player is not in event');
        }
        
    }
}


