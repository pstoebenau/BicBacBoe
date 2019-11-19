import UI from "./ui.js";
import CanvasSetup from "../misc/canvasSetup.js";
import Board from './board.js';
import Position from '../misc/position.js';
import Client from "./client.js";

const canvasSetup = new CanvasSetup("BicBacBoe");
const board = createBoard();
const client = new Client();
const ui = new UI(board, canvasSetup, client, update);
board.ui = ui;

var boardSize = calcBoardSize();

// Allows debugging in developer console
window.board = board;
window.client = client;
window.ui = ui;

function createBoard() {
  let size = calcBoardSize();

  let board = new Board(
    canvasSetup.canvas.width/2,
    canvasSetup.canvas.height/2,
    size,
    1,
    canvasSetup.canvas,
  );

  return board;
}

function calcBoardSize() {
  let size;

  if(canvasSetup.canvas.width < canvasSetup.canvas.height)
    size = canvasSetup.canvas.width/2;
  else
    size = canvasSetup.canvas.height/2;

  return size;
}

// Game loop
function update() {
  canvasSetup.ctx.clearRect(0, 0, canvasSetup.canvas.width, canvasSetup.canvas.height);

  board.update();
}

client.socket.on('updateBoard', (data) => {
  ui.dimensionSlider.value = data.dimensions;
  board.loadBoard(data);
  update();
});

client.socket.on('updatePlayerMark', (mark) => {
  ui.playerMark = mark;
});

update();
