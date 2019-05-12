var dimensionSlider = document.getElementById("dimensionRange");
var zoomSlider = document.getElementById("zoomRange");
var opponentID = document.getElementById("opponentID");
var bicBacBoe = document.getElementById("BicBacBoe");
var fullscrnBttn = document.getElementById("fullScrnBttn");
var resetBttn = document.getElementById("resetBttn");

// Mouse and touch controls
// Mouse
canvas.addEventListener("mousedown", (e) => startSelect(e.clientX, e.clientY));
canvas.addEventListener("mousemove", (e) => updateMousePos(e.clientX, e.clientY));
canvas.addEventListener("mouseup", stopSelect);
document.body.addEventListener("wheel", (e) => {
  const delta = Math.sign(e.deltaY);
  zoom(delta);
});
// Touch
canvas.addEventListener("touchstart", startTouch, false);
canvas.addEventListener("touchmove", moveTouch, false);
canvas.addEventListener("touchend", stopTouch, false);
canvas.addEventListener("touchcancel", stopTouch, false);

// Board Controls
dimensionSlider.addEventListener("input", changeDim);
opponentID.addEventListener("input", () => pickOpponent(opponentID.value));
window.addEventListener("resize", () => resizeBoard(calcBoardSize()));
fullScrnBttn.addEventListener('click', toggleFullScreen);
resetBttn.addEventListener('click', () => {
  resizeBoard(calcBoardSize())
  board.initialize();
});

var mouse = {position: new position(0,0), isDown: false, isDragging: false};
var startMousePos = new position(0,0);
var startTouchDistance = 0;
var isPinching = false;
var startBoard = new position(0,0);
var boardSize = calcBoardSize();

var playerMark = 0;

var board = createBoard();

function toggleFullScreen()
{
  var doc = window.document;
  var docEl = bicBacBoe;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen || psuedoFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen || psuedoFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement)
    requestFullScreen.call(docEl);
  else
    cancelFullScreen.call(doc);
}

function psuedoFullscreen()
{
  let menuBar = document.getElementById("menuBar");

  if(menuBar.style.display == "none")
  {
    window.scrollTo(1, 0);
    menuBar.style.display = "block";
  }
  else
  {
    window.scrollTo(0, 1);
    menuBar.style.display = "none";
  }

  resizeCanvas();
  resizeBoard(calcBoardSize());
}

function createBoard()
{
  let size = calcBoardSize();

  let board = new ticTacToeBoard(
    canvas.width/2,
    canvas.height/2,
    size,
    dimensionSlider.value
  );
  board.initialize();

  return board;
}

function calcBoardSize()
{
  let size;

  if(canvas.width < canvas.height)
    size = canvas.width/2;
  else
    size = canvas.height/2;

  return size;
}

function resizeBoard(size)
{
  // Resize board according to zoom and screen size
  board.resize(size);
  board.move(new position(canvas.width/2, canvas.height/2));
  boardSize = board.size;
}

// Game loop
function update()
{
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  board.update();
}

function changeDim()
{
  board.changeDim(dimensionSlider.value);
}

function zoom(amount)
{
  let movPos;
  let center = new position(canvas.width/2, canvas.height/2);
  let deltaSize = boardSize;

  boardSize += amount*boardSize/10;
  board.resize(boardSize);

  // Scale with respect to center
  // MATH!
  deltaSize = boardSize/deltaSize;
  movPos = center.subtract(board.position);
  movPos = movPos.mult(deltaSize);
  movPos = movPos.add(board.position);
  movPos = movPos.subtract(center);
  board.move(board.position.subtract(movPos));
}

function startTouch()
{
  event.preventDefault();

  let touch = new position(event.touches[0].pageX, event.touches[0].pageY);

  if(event.touches.length >= 2)
  {
    let secondTouch = new position(event.touches[1].pageX, event.touches[1].pageY);
    startTouchDistance = touch.distance(secondTouch);
  }

  if(isPinching)
    return;

  startSelect(touch.x, touch.y);
}

function moveTouch()
{
  let touch = new position(event.touches[0].pageX, event.touches[0].pageY);

  event.preventDefault();

  if(event.touches.length >= 2)
  {
    // Scale Board
    let secondTouch = new position(event.touches[1].pageX, event.touches[1].pageY);
    let touchDistance = touch.distance(secondTouch);
    let delta = touchDistance-startTouchDistance;
    zoom(delta/10);

    // Calculate for next move
    secondTouch = new position(event.touches[1].pageX, event.touches[1].pageY);
    startTouchDistance = touch.distance(secondTouch);

    isPinching = true;
    return;
  }

  if(isPinching)
    return;

  isPinching = false;
  updateMousePos(touch.x, touch.y)
}

function stopTouch()
{
  if(event.touches.length <= 0 && isPinching)
  {
    mouse.isDown = false;

    if(mouse.isDragging)
    {
      mouse.isDragging = false;
      return;
    }
    mouse.isDragging = false;

    isPinching = false;
    return;
  }
  if(isPinching)
    return;

  stopSelect();
}

function startSelect(mouseX, mouseY)
{
  mouse.position.x = mouseX - canvas.getBoundingClientRect().left;
  mouse.position.y = mouseY - canvas.getBoundingClientRect().top;

  if(!mouse.isDragging)
  {
    startBoard = board.position;
    startMousePos = mouse.position.copy();
  }

  mouse.isDown = true;
}

// Update mouse variable
function updateMousePos(mouseX, mouseY)
{
  mouse.position.x = mouseX - canvas.getBoundingClientRect().left;
  mouse.position.y = mouseY - canvas.getBoundingClientRect().top;

  if(mouse.isDown)
    mouse.isDragging = true;

  // Moves board when dragging
  if(mouse.isDragging)
  {
    let newPos = startBoard.add(mouse.position.subtract(startMousePos));

    board.move(newPos);
  }
}

// Update board on mouse release
function stopSelect()
{
  mouse.isDown = false;

  if(mouse.isDragging)
  {
    mouse.isDragging = false;
    return;
  }
  mouse.isDragging = false;

  if(opponentID.value)
  {
    if(board.turn == 0)
      setPlayerMark(board.turn);

    if(playerMark != board.turn%2)
      return;
  }

  console.log();

  if(board.createMove(mouse.position))
    sendBoardData(board.getBoardData());
}

socket.on('updateBoard', (data) => {
  dimensionSlider.value = data.dimensions;
  board.loadBoard(data);
});

socket.on('updatePlayerMark', (mark) => {
  playerMark = mark;
});
