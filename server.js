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

    if (player.opponentID >= 0) {
      let opponentSocket = getSocketFromID(player.opponentID);
      if (opponentSocket != null)
        opponentSocket.emit('connectionDetails', {isConnected: false, opponentName: "N/A"});
    }

    socket.emit('connectionDetails', {isConnected: false, opponentName: "N/A"});
  });

  socket.on('updateOpponent', (username) => {
    let opponentID = getIDFromUsername(username);

    if (opponentID < 0) {
      console.error("Opponent username specified is invalid");
      return;
    }

    // Notify previous opponent of change
    if (player.opponentID >= 0 && player.opponentID != opponentID) {
      let opponentSocket = getSocketFromID(player.opponentID)

      if (opponentSocket != null)
        opponentSocket.emit('connectionDetails', {isConnected: false, opponentName: "N/A"});
    }

    player.opponentID = opponentID;
    updatePlayerList();

    // Notify clients of connection to opponent
    let opponent = getPlayerFromID(opponentID);
    if (opponent.opponentID === player.id){
      getSocketFromID(opponentID).emit('connectionDetails', {isConnected: true, opponentName: player.username});
      socket.emit('connectionDetails', {isConnected: true, opponentName: opponent.username});
    }
  });

  socket.on('updateUsername', (username) => {
    player.username = username;
    updatePlayerList();
  })

  socket.on('setPlayerMark', (mark) => {
    let opponent = getPlayerFromID(player.opponentID);

    if(!opponent)
    {
      console.error("No oppenent specified");
      return;
    }

    updatePlayerMarkers(player, opponent, mark);
    updatePlayerList();
  });

  socket.on('win', () => {
    let opponent = getSocketFromID(player.opponentID);

    opponent.emit('lose');
  });

  socket.on('update', (data) => {
    let opponent = getPlayerFromID(player.opponentID);
    player.boardData = data;

    if(player.opponentID >= 0 && opponent != null && opponent.opponentID == player.id)
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

function getPlayerFromID(id) {
  for (let player of PLAYER_LIST)
    if (player.id === id)
      return player;

  return null;
}

function updatePlayerMarkers(player, opponent, mark) {
  let playerSocket = getSocketFromID(player.id);
  let opponentSocket = getSocketFromID(opponent.id);

  player.playerMark = mark;
  opponent.playerMark = (mark+1)%2;

  playerSocket.emit('updatePlayerMark', player.playerMark);
  opponentSocket.emit('updatePlayerMark', opponent.playerMark);
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
