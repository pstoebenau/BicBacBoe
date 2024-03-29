import UI from "./BicBacBoe/UI";
import Canvas from "./misc/Canvas";
import Board from './BicBacBoe/Board';
import Client from "./BicBacBoe/Client";

import '../css/style.scss';

const canvas: Canvas = new Canvas("BicBacBoe");
const board: Board = createBoard();
const ui: UI = new UI(board, canvas);
const client: Client = new Client();

(window as any).canvas = canvas;
(window as any).board = board;
(window as any).ui = ui;
(window as any).client = client;

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
ui.onOpponentChange.on((opponentId) => client.requestGame(opponentId));
ui.onUsernameChange.on((username) => {
  client.setUsername(username);
  ui.updatePlayerTable(client.player.id, client.player.username);
});
ui.onMove.on((boardData) => client.sendBoardData(boardData));

// Board Events
board.onWin.on((winner) => ui.win(winner))
board.onDrawGrid.on((grid) => ui.drawGrid(grid, board.color));

// Multiplayer Events
client.onPeer.on((player) => ui.updatePlayerTable(player.id, player.username));
client.onConn.on((username) => console.log(`Playing with ${username}!`));
client.onReject.on((username) => console.log(`${username} hates you!`));
client.onBoardUpdate.on((boardData) => {
  board.loadBoard(boardData);
  ui.playAudio('bruh');
  update();
});

update();
