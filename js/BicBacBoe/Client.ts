import Peer from "peerjs";
import { TypedEvent } from "../misc/TypedEvent";
import { GameRequest } from "../models/Network";

export default class Client {
  peer: Peer;
  conn: Peer.DataConnection;
  isConnected = false;

  // Event listeners
  onPeer = new TypedEvent<string>();

  constructor() {
    this.peer = new Peer();
    
    (window as any).peer = this.peer;
    
    this.peer.on('open', (id) => {
      this.onPeer.emit(id);
    })
    
    this.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data);
      });
      conn.on('open', () => {
        const req: GameRequest = {
          method: 'Game Request',
          username: 'jeff',
        }
        conn.send(JSON.stringify(req));
      });
    });
  }

  resetID() {
    this.peer = new Peer();
    console.log("wow");
    this.peer.on('open', (id) => {
      console.log("wow");
      this.onPeer.emit(id);
    })
  }

  requestGame(opponentID: string) {
    this.conn = this.peer.connect(opponentID);
    this.conn.on('open', () => {
      this.conn.send('hi!');
    });
  }
}
