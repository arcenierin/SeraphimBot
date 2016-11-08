module.exports = {
    Event: function(id, name){
        this.players = [];
        this.id = id;
        this.name = name;
    }, 
    addPlayer: function(player){
        this.players.push(player);
        console.log('Event: '+this.id+", adding player: "+player);
    }
}


