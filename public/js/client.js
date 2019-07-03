import io from 'socket.io-client';

export default class Client
{
  socket;

  constructor()
  {
    this.socket = io();
    console.log(this.socket);

    this.socket.on('socketID', (id) =>
    {
      document.getElementById("clientID").innerHTML = "Client ID: " + id;
    });
  }

  sendBoardData(data)
  {
    this.socket.emit('update', data);
  }

  pickOpponent(id)
  {
    this.socket.emit('updateOpponentID', id);
  }

  setPlayerMark(mark)
  {
    this.socket.emit('setPlayerMark', mark);
  }
}
