import UI from "./ui.js";
import CanvasSetup from "../canvasSetup.js";
import Board from './Board.js';
import Position from '../aux/Position.js';

const canvasSetup = new CanvasSetup(update);
const board = createBoard(1);
const ui = new UI(board, canvasSetup);

var boardSize = calcBoardSize();
var playerMark = 0;

function createBoard(dimensions)
{
  let size = calcBoardSize();

  let board = new Board(
    canvasSetup.canvas.width/2,
    canvasSetup.canvas.height/2,
    size,
    dimensions,
    canvasSetup.canvas,
  );

  return board;
}

function calcBoardSize()
{
  let size;

  if(canvasSetup.canvas.width < canvasSetup.canvas.height)
    size = canvasSetup.canvas.width/2;
  else
    size = canvasSetup.canvas.height/2;

  return size;
}

// Game loop
function update()
{
  canvasSetup.ctx.clearRect(0, 0, canvasSetup.canvas.width, canvasSetup.canvas.height);

  board.update();
}

socket.on('updateBoard', (data) => {
  dimensionSlider.value = data.dimensions;
  board.loadBoard(data);
});

socket.on('updatePlayerMark', (mark) => {
  playerMark = mark;
});
