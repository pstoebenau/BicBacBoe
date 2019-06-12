import io from 'socket.io-client';

export default class Client
{
  socket = io();

  constructor()
  {
    this.socket = io();
    console.log(this.socket);

    socket.on('socketID', (id) =>
    {
      document.getElementById("clientID").innerHTML = "Client ID: " + id;
    });
  }

  sendBoardData(data)
  {
    socket.emit('update', data);
  }

  pickOpponent(id)
  {
    socket.emit('updateOpponentID', id);
  }

  setPlayerMark(mark)
  {
    socket.emit('setPlayerMark', mark);
  }
}
