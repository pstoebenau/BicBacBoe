export default class Client
{
  socket;

  constructor(io)
  {
    this.socket = io.connect();

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
