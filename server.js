var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

//set port
var port = process.env.PORT || 8080

app.use(express.static(__dirname + "/public"));

//routes
app.get("/", (req, res) => {
  res.redirect("/BicBacBoe.html");
});

serv.listen(port, () => {
  console.log("app running");
});

var SOCKET_LIST = [];
var PLAYER_LIST = [];

function Player(id) {
  this.username = "Player" + id;
  this.id = id;
  this.opponentID;
  this.playerMark = 0;
  this.boardData;
}

io.sockets.on('connection', (socket) =>{
  let player;

  socket.id = getID();
  SOCKET_LIST.splice(socket.id, 0, socket);

  player = new Player(socket.id);
  PLAYER_LIST.splice(socket.id, 0, player);

  socket.emit('socketID', socket.id);

  updatePlayerList();

  socket.on('disconnect', () => {
    SOCKET_LIST.splice(socket.id, 1);
    PLAYER_LIST.splice(socket.id, 1);
    updatePlayerList();
  });

  socket.on('updateOpponent', (username) => {
    let opponentID = getIDFromUsername(username);

    if (opponentID < 0) {
      console.error("Opponent username specified is invalid");
      return;
    }

    player.opponentID = opponentID;
    updatePlayerList();
  });

  socket.on('updateUsername', (username) => {
    player.username = username;
    updatePlayerList();
  })

  socket.on('setPlayerMark', (mark) => {
    if(!PLAYER_LIST[player.opponentID])
    {
      console.error("No oppenent specified");
      return;
    }

    updatePlayerMarkers(player, PLAYER_LIST[player.opponentID], mark);
    updatePlayerList();
  });

  socket.on('update', (data) => {
    player.boardData = data;

    if(player.opponentID && PLAYER_LIST[player.opponentID] && PLAYER_LIST[player.opponentID].opponentID == player.id)
      update(player, player.opponentID);
  });
});

function getID() {
  if (!SOCKET_LIST)
    return 0;

  for(let i = 0; i < SOCKET_LIST.length; i++)
    if(i < SOCKET_LIST[i].id)
      return i;

  return SOCKET_LIST.length;
}

function getClientPlayerList() {
  let copy = [];

  for (let i = 0; i < PLAYER_LIST.length; i++) {
    let player = PLAYER_LIST[i];
    delete player.boardData;
    copy.push(player);
  }

  return copy;
}

function getIDFromUsername(username) {
  for (let player of PLAYER_LIST)
    if (player.username === username)
      return player.id;

  return -1;
}

function getSocketFromID(id) {
  for (let socket of SOCKET_LIST)
    if (socket.id === id)
      return socket;

  return null;
}

function updatePlayerMarkers(player, opponent, mark) {
  player.playerMark = mark;
  opponent.playerMark = (mark+1)%2;
  SOCKET_LIST[player.id].emit('updatePlayerMark', player.playerMark);
  SOCKET_LIST[opponent.id].emit('updatePlayerMark', opponent.playerMark);
}

function update(player) {
  let socket = getSocketFromID(player.opponentID);

  if(!socket) {
    console.error("Invalid opponent");
    return;
  }

  socket.emit('updateBoard', player.boardData);
}

function updatePlayerList() {
  let playerList = getClientPlayerList(PLAYER_LIST);

  for (let socket of SOCKET_LIST)
    socket.emit('playerList', playerList);
}

setInterval(() => {
}, 1000/10);
