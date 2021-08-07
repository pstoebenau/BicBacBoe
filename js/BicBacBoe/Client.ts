// import io from 'socket.io-client';
// import BoardData from '../models/BoardData';
// import ConnectionData from '../models/ConnectionData';
// import Player from '../models/Player';
// import UI from './UI';

// export default class Client {
//   ui: UI;
//   socket: SocketIOClient.Socket;
//   playerID: number;
//   playerList: Player[];
//   opponentName = "N/A";
//   isConnected = false;

//   constructor() {
//     this.socket = io.connect();

//     this.socket.on('socketID', (id: number) => this.playerID = id);

//     this.socket.on('playerList', (playerList: Player[]) => {
//       this.playerList = playerList;
//       this.ui.updatePlayerTable();
//     });

//     this.socket.on('connectionDetails', (connectionData: ConnectionData) => {
//       this.isConnected = connectionData.isConnected;
//       this.opponentName = connectionData.opponentName;
//     });

//     this.socket.on('lose', () => this.ui.lose());
//   }

//   getPlayerID() {
//     return this.playerID;
//   }

//   getPlayerList() {
//     return this.playerList;
//   }

//   isMultiplayer() {
//     return this.isConnected;
//   }

//   setUsername(username: string) {
//     this.socket.emit('updateUsername', username);
//   }

//   setOpponent(username: string) {
//     this.socket.emit('updateOpponent', username);
//   }

//   sendBoardData(boardData: BoardData) {
//     this.socket.emit('update', boardData);
//   }

//   pickOpponent(username: string) {
//     this.socket.emit('updateOpponent', username);
//   }

//   setPlayerMark(mark: number) {
//     this.socket.emit('setPlayerMark', mark);
//   }

//   win() {
//     this.socket.emit('win');
//   }
// }
