
function Event(id, name){
    this.players = [];
    this.id = id;
    this.name = name;
}
function addPlayer(player){
    this.players.push(player);
    console.log('Event: '+this.id+", adding player: "+player);
}


