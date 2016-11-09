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
    }
}


