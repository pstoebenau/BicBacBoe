var socket = io();

function sendBoardData(data)
{
  socket.emit('update', data);
}

function pickOpponent(id)
{
  socket.emit('updateOpponentID', id);
}

socket.on('socketID', (id) =>
{
  document.getElementById("clientID").innerHTML = "Client ID: " + id;
});
