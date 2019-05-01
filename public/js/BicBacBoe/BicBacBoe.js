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

let isDragging = false;
let mouse = new position(0,0);
let startMouse = new position(0,0);
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
  //resizeBoard();
}

function zoom()
{
  let size = calcBoardSize();

  board.resize(size*zoomSlider.value/10);
}

function updateClient(data)
{
  console.log(data);

  board.turn = data.turn;
}

function startSelect(mouseX, mouseY)
{
  if(mouseX && mouseY){
    mouse.x = mouseX;
    mouse.y = mouseY;
  }
  else
  {
    mouse.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  }

  if(!isDragging)
  {
    startBoard = board.position;
    startMouse = mouse.copy();
  }

  isDragging = true;
}

// Update mouse variable
function updateMousePos(mouseX, mouseY)
{
  if(mouseX && mouseY)
  {
    mouse.x = mouseX;
    mouse.y = mouseY;
  }
  else
  {
    mouse.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  }

  // Moves board when dragging
  if(isDragging)
  {
    let newPos = startBoard.add(mouse.subtract(startMouse));

    board.move(newPos);
  }
}

// Update board on mouse release
function stopSelect()
{
  if(isDragging)
  {
    isDragging = false;
    return;
  }

  //sendBoardData(pack);
}

function selectSelectable(grids, boxSize){

}
