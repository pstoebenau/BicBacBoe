import UI from "./UI";
import Canvas from "../misc/Canvas";
import Board from './Board';
import Client from "./Client";
import BoardData from "../models/BoardData";

const canvas: Canvas = new Canvas("BicBacBoe");
const board: Board = createBoard();
const client: Client = new Client();
const ui: UI = new UI(board, canvas, client, update);
board.ui = ui;
client.ui = ui;

// Allows debugging in developer console
// window.board = board;
// window.client = client;
// window.ui = ui;

function createBoard() {
  let size = calcBoardSize();
  let board = new Board(canvas.getCenter(), size, 1, canvas.getElement());
  return board;
}

function calcBoardSize() {
  return canvas.getBoundingDimension();
}

// Game loop
function update() {
  canvas.clear();

  board.update();
}

client.socket.on('updateBoard', (boardData: BoardData) => {
  (ui.dimensionSlider as HTMLInputElement).value = boardData.dimensions;
  ui.playAudio("bruh");
  board.loadBoard(boardData);
  update();
});

client.socket.on('updatePlayerMark', (mark: number) => {
  ui.playerMark = mark;
});

update();
