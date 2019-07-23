var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

//set port
var port = process.env.PORT || 8080

app.use(express.static(__dirname + "/public"));

//routes
app.get("/", (req, res) =>
{
  res.render("index");
});

serv.listen(port, () =>
{
  console.log("app running");
});

var SOCKET_LIST = [null];
var PLAYER_LIST = [null];

function Player(id)
{
  this.id = id;
  this.opponentID;
  this.playerMark = 0;
  this.boardData;
}

io.sockets.on('connection', (socket) =>{
  let player;

  socket.id = getID(SOCKET_LIST);
  SOCKET_LIST[socket.id] = socket;

  player = new Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.emit('socketID', socket.id);

  socket.on('disconnect', () =>
  {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });

  socket.on('updateOpponentID', (id) =>
  {
    player.opponentID = id;
  });

  socket.on('setPlayerMark', (mark) =>
  {
    if(!PLAYER_LIST[player.opponentID])
    {
      console.error("No oppenent specified");
      return;
    }

    updatePlayerMarkers(player, PLAYER_LIST[player.opponentID], mark);
  });

  socket.on('update', (data) =>
  {
    player.boardData = data;
    if(player.opponentID && PLAYER_LIST[player.opponentID] && PLAYER_LIST[player.opponentID].opponentID == player.id)
    {
      update(player.id, player.opponentID);
    }
  });
});

function getID(arr)
{
  if(arr.length < 1)
    return 0;

  for(let i = 0; i < arr.length; i++)
    if(arr[i] == null)
      return i;

  return arr.length;
}

function updatePlayerMarkers(player, opponent, mark)
{
  player.playerMark = mark;
  opponent.playerMark = (mark+1)%2;
  SOCKET_LIST[player.id].emit('updatePlayerMark', player.playerMark);
  SOCKET_LIST[opponent.id].emit('updatePlayerMark', opponent.playerMark);
}

function update(id, opponentID)
{
  let socket = SOCKET_LIST[opponentID];

  if(!socket)
    return;

  socket.emit('updateBoard', PLAYER_LIST[id].boardData);
}

setInterval(() =>
{

}, 1000/10);
