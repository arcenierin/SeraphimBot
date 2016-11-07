class event{
    constructor(name, id, creator_name){
        this.name = name;
        this.id = id;
        this.creator_name = creator_name;
        this.players = [];
    }

    function AddPlayer(name){
          this.players.push(name);
    }
}
module.exports = event;
