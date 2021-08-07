import UI from "./BicBacBoe/UI";
import Canvas from "./misc/Canvas";
import Board from './BicBacBoe/Board';
import BoardData from "./models/BoardData";
import Peer from 'peerjs';
import { GameRequest } from "./models/Network";

const canvas: Canvas = new Canvas("BicBacBoe");
const board: Board = createBoard();
const ui: UI = new UI(board, canvas);

let peer: Peer = new Peer();
let conn: Peer.DataConnection;

function createBoard() {
  let size = canvas.getBoundingDimension();
  let board = new Board(canvas.getCenter(), size, 1);
  return board;
}

// Game loop
function update() {
  canvas.clear();

  board.update();
}

// UI Events
ui.onUpdate.on(() => update());

// Board Events
board.onWin.on((winner) => console.log(winner))
board.onDrawGrid.on((grid) => ui.drawGrid(grid, board.color));

// Multiplayer Events
peer.on('open', (id) => {
  console.log(id);
})
const startConn = (id: string) => {
  conn = peer.connect(id);
  conn.on('open', () => {
    conn.send('hi!');
  });
}
(window as any).startConn = startConn;

peer.on('connection', (conn) => {
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

update();
