import Peer from "peerjs";
import { generateId, randomUsername, toNetworkId } from "../misc/Functions";
import { TypedEvent } from "../misc/TypedEvent";
import BoardData from "../models/BoardData";
import { BoardDataNetwork, ConnData, GameAccept, GameReject, GameRequest } from "../models/Network";
import Player from "../models/Player";


export default class Client {
  peer: Peer;
  conn: Peer.DataConnection;
  isConnected = false;
  player = {} as Player;

  // Event listeners
  onPeer = new TypedEvent<Player>();
  onConn = new TypedEvent<string>();
  onReject = new TypedEvent<string>();
  onBoardUpdate = new TypedEvent<BoardData>();

  constructor() {
    const simpleID = generateId(4);
    this.peer = new Peer(toNetworkId(simpleID));
    this.player.username = randomUsername();
    
    this.peer.on('open', (id) => {
      this.player.id = simpleID;
      this.onPeer.emit(this.player);
    });
    
    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.conn.on('data', (data: ConnData) => this.handleNetworkData(data));
    });
  }

  resetID() {
    const simpleId = generateId(4);
    this.peer = new Peer(toNetworkId(simpleId));
    this.peer.on('open', (id) => {
      this.player.id = simpleId;
      this.onPeer.emit(this.player);
    })
  }

  setUsername(username: string) {
    this.player.username = username;
  }

  requestGame(opponentID: string) {
    this.conn = this.peer.connect(toNetworkId(opponentID));
    this.player.opponentID = opponentID;
    this.conn.on('open', () => {
      const req: GameRequest = {
        method: 'Game Request',
        username: this.player.username,
      }
      this.conn.send(req);
    });
    this.conn.on('data', (data: ConnData) => this.handleNetworkData(data));
  }

  sendBoardData(boardData: BoardData) {
    if (!this.conn)
      return;

    const packet: BoardDataNetwork = {
      method: 'Board Data',
      boardData
    }
    this.conn.send(packet);
  }

  handleNetworkData(data: ConnData) {
    if (data.method == 'Game Request') {
      const gameReq = data as GameRequest;

      // Handle rejection (not good at this)
      if (!confirm(`Do you want to play with ${gameReq.username}?`)) {
        const rejectReq: GameReject = {
          method: 'Game Reject',
          username: this.player.username,
        }
        this.conn.send(rejectReq);
      }

      const acceptReq: GameAccept = {
        method: 'Game Accept',
        username: this.player.username,
      }
      this.onConn.emit(gameReq.username);
      this.conn.send(acceptReq);
    }
    else if (data.method === 'Game Accept') {
      const accept = data as GameAccept;
      this.onConn.emit(accept.username);
    }
    else if (data.method === 'Game Reject') {
      const rejection = data as GameReject;
      this.onReject.emit(rejection.username);
    }
    else if (data.method === 'Board Data') {
      const boardDataNetwork = data as BoardDataNetwork;
      this.onBoardUpdate.emit(boardDataNetwork.boardData);
    }
  }
}
