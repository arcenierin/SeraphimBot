module.exports = {
    Event: function(id, name, time, timezone){
        this.players = [];
        this.id = id;
        this.name = name;
        this.startTime = time;
        this.timeZone = timezone;
    }, 
    addPlayer: function(player){
        this.players.push(player);
        console.log('Event: '+this.id+", adding player: "+player);
    }
}


