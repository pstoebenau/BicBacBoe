let dimensionSlider = document.getElementById("dimensionRange");
let zoomSlider = document.getElementById("zoomRange");
let opponentID = document.getElementById("opponentID");
canvas.addEventListener("mousedown", startSelect);
canvas.addEventListener("mousemove", updateMousePos);
canvas.addEventListener("mouseup", stopSelect);
dimensionSlider.addEventListener("input", changeDim);
zoomSlider.addEventListener("input", zoom);
opponentID.addEventListener("input", () => pickOpponent(opponentID.value));
window.addEventListener("resize", resizeBoard);

let mouse = {position: new position(0,0), isDown: false, isDragging: false};
let startMousePos = new position(0,0);
let startBoard = new position(0,0);

let board = createBoard();

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

function resizeBoard()
{
  let size = calcBoardSize();

  // Resize board according to zoom and screen size
  board.resize(size*zoomSlider.value/10);
  board.move(new position(canvas.width/2, canvas.height/2));
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

function zoom()
{
  let size = calcBoardSize();

  board.resize(size*zoomSlider.value/10);
}

socket.on('updateBoard', (data) => {
  dimensionSlider.value = data.dimensions;
  board.loadBoard(data);
});

function startSelect(mouseX, mouseY)
{
  if(mouseX && mouseY){
    mouse.position.x = mouseX;
    mouse.position.y = mouseY;
  }
  else
  {
    mouse.position.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.position.y = event.clientY - canvas.getBoundingClientRect().top;
  }

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
  if(mouseX && mouseY)
  {
    mouse.position.x = mouseX;
    mouse.position.y = mouseY;
  }
  else
  {
    mouse.position.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.position.y = event.clientY - canvas.getBoundingClientRect().top;
  }

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
async function stopSelect()
{
  mouse.isDown = false;

  if(mouse.isDragging)
  {
    mouse.isDragging = false;
    return;
  }
  mouse.isDragging = false;

  if(board.turn == 0)
    setPlayerMark(board.turn);

  var mark = await getPlayerMark();

  if(mark != board.turn%2)
    return;

  if(board.createMove(mouse.position))
    sendBoardData(board.getBoardData());
}
