module.exports = {
    Event: function(id, name, time, timezone){
        this.players = [];
        this.id = id;
        this.name = name;
        this.startTime = time;
        this.timeZone = timezone;
    }, 
    addPlayer: function(event, player){
        event.players.push(player);
        console.log('Event: '+event.id+", adding player: "+player);
    },
    removePlayer: function(event, playerName){
        var index = event.players.findIndex(x => x.user.username == playerName);
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


