class event{
    constructor(name, id, creator_name){
        this.name = name;
        this.id = id;
        this.creator_name = creator_name;
        this.players = [];
    }
    addPlayer(player){
        this.players.push(player);
    }
}
module.exports = event;
