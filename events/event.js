class event{
    var players = [];
    constructor(name, id, creator_name){
        this.name = name;
        this.id = id;
        this.creator_name = creator_name;
    }

    function AddPlayer(name){
          players.push(name);
    }
}
module.exports = event;
