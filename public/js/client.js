var socket = io();

function sendBoardData(data)
{
  socket.emit('update', data);
}

function pickOpponent(id)
{
  socket.emit('updateOpponentID', id);
}

async function getPlayerMark()
{
  let response = socket.on('getPlayerMark');
  console.log(response);
  let playerMark = await response.resolve();
  console.log(playerMark);

  return playerMark;
}

function setPlayerMark(mark)
{
  socket.emit('setPlayerMark', mark);
}

socket.on('socketID', (id) =>
{
  document.getElementById("clientID").innerHTML = "Client ID: " + id;
});
