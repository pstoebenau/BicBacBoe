var express = require('express');
var app = express();
var serv = require('http').Server(app);

//set port
var port = process.env.PORT || 8080

app.use(express.static(__dirname + "/public"));

//routes
app.get("/", function(req, res) {
  res.render("index");
})

serv.listen(port, function() {
  console.log("app running");
})

var SOCKET_LIST = [];
var PLAYER_LIST = [];

function Player(id){
  this.moves;
  this.selectable;
  this.closed;
  this.turn;
  this.id = id;
  this.opponentID;
}

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function(socket){
  socket.id = getID(SOCKET_LIST);
  SOCKET_LIST[socket.id] = socket;

  let player = new Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.emit('socketID', socket.id);

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });

  socket.on('updateOpponent', function(id){
    player.opponentID = id;
  });

  socket.on('updateBoard', function(data){
    player.moves = data.moveData;
    player.selectable = data.selectable;
    player.closed = data.closed;
    player.turn = data.turn;
    if(player.opponentID && PLAYER_LIST[player.opponentID] && PLAYER_LIST[player.opponentID].opponentID == player.id){
      update(player.id, player.opponentID);
    }
  });

});

function getID(arr){
  if(arr.length > 0){
    for(let i = 0; i < arr.length; i++){
      if(!arr[i])
        return i;
    }
    return arr.length
  }else {
    return 0;
  }
}

function update(id, opponentID){
  let socket = SOCKET_LIST[opponentID];
  if(!socket)
    return;
  socket.emit('newBoard', PLAYER_LIST[id]);
}

setInterval(function(){



}, 1000/10);
