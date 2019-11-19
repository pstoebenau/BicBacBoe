import io from 'socket.io-client'

export default class Client {
  socket;
  playerID;
  playerList;

  constructor() {
    this.socket = io.connect();

    this.socket.on('socketID', (id) => {
      this.playerID = id;
    });

    this.socket.on('playerList', (playerList) => {
      this.playerList = playerList;
    });
  }

  getPlayerID() {
    return this.playerID;
  }

  getPlayerList() {
    return this.playerList;
  }

  setUsername(username) {
    this.socket.emit('updateUsername', username);
  }

  setOpponent(username) {
    this.socket.emit('updateOpponent', username);
  }

  sendBoardData(data) {
    this.socket.emit('update', data);
  }

  pickOpponent(username) {
    this.socket.emit('updateOpponent', username);
  }

  setPlayerMark(mark) {
    this.socket.emit('setPlayerMark', mark);
  }
}
