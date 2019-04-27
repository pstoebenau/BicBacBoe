let menuBar = document.getElementById("menuBar");
let menuBarHeight = menuBar.clientHeight + 3;
let dimensionSlider = document.getElementById("dimensionRange");
let zoomSlider = document.getElementById("zoomRange");
let opponentID = document.getElementById("opponentID");
let canvas = document.querySelector('canvas');
canvas.addEventListener("mousedown", startSelect);
canvas.addEventListener("mousemove", updateMousePos);
canvas.addEventListener("mouseup", stopSelect);
dimensionSlider.addEventListener("input", restartBoard);
zoomSlider.addEventListener("input", zoom);
opponentID.addEventListener("input", function(){ pickOpponent(opponentID.value); });
window.addEventListener("resize", resizeCanvas);
// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
  var touch = e.touches[0];
  startSelect(touch.clientX, touch.clientY);
}, false);
document.body.addEventListener("touchmove", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
  var touch = e.touches[0];
  updateMousePos(touch.clientX, touch.clientY);
}, false);
document.body.addEventListener("touchend", stopSelect, false);

let c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = document.documentElement.scrollHeight - menuBarHeight;

let mouse = {x:0, y:0};
let isDragging = false;
let startMouse = {x:0, y:0};
let startBoardPos = {x:0, y:0};
let fps = 30;

let board = new ticTacToeBoard(canvas.width/2, canvas.height/2, dimensionSlider.value);
if(canvas.width < canvas.height){
  board.size = canvas.width/2;
}else{
  board.size = canvas.height/2;
}
board.initialize();

function restartBoard() {
  board.restart();
}

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = 0;
  canvas.height = document.documentElement.scrollHeight - menuBarHeight;
  let boardSize;
  if(canvas.width < canvas.height){
    boardSize = canvas.width/2;
  }else{
    boardSize = canvas.height/2;
  }
  board.resize(boardSize);
  board.move(canvas.width/2, canvas.height/2);
}

function zoom(){
  board.resize(board.size*zoomSlider.value/10);
}

function updateClient(data){
  console.log(data);
  let n = 0;
  for (let i = 0; i < board.grids.length; i++) {
    for (let j = 0; j < board.grids[i].length; j++) {
      board.grids[i][j].moves = data.moves[n];
      board.grids[i][j].selectable = data.selectable[n];
      board.grids[i][j].closed = data.closed[n];
      n++;
    }
  }
  board.turn = data.turn;
}

function startSelect(mouseX, mouseY){
  if(mouseX && mouseY){
    mouse.x = mouseX;
    mouse.y = mouseY;
  }else{
    mouse.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  }
  let boxSize = board.grids[board.dimensions][0].size/3;
  for(let i = 0; i < board.grids[board.dimensions].length; i++){
    if(!board.grids[board.dimensions][i].selectable || board.grids[board.dimensions][i].closed){
      continue;
    }
    for (let j = 0; j < board.grids[board.dimensions][i].playPoints.length; j++)
      for (let k = 0; k < board.grids[board.dimensions][i].playPoints[j].length; k++)
        if(board.grids[board.dimensions][i].playPoints[j][k].x > mouse.x-boxSize/2
           && board.grids[board.dimensions][i].playPoints[j][k].x < mouse.x+boxSize/2
           && board.grids[board.dimensions][i].playPoints[j][k].y > mouse.y-boxSize/2
           && board.grids[board.dimensions][i].playPoints[j][k].y < mouse.y+boxSize/2){
             return;
        }
  }

  if(isDragging == false){
    startMouse.x = mouse.x;
    startMouse.y = mouse.y;
    startBoardPos.x = board.position.x;
    startBoardPos.y = board.position.y;
  }
  isDragging = true;
}

function updateMousePos(mouseX, mouseY){
  if(mouseX && mouseY){
    mouse.x = mouseX;
    mouse.y = mouseY;
  }else{
    mouse.x = event.clientX - canvas.getBoundingClientRect().left;
    mouse.y = event.clientY - canvas.getBoundingClientRect().top;
  }
  if(isDragging){
    let posX = startBoardPos.x + (mouse.x-startMouse.x);
    let posY = startBoardPos.y + (mouse.y-startMouse.y);
    board.move(posX, posY);
  }
}
function stopSelect(){
  if(isDragging){
    isDragging = false;
    return;
  }

  let grids = board.grids[board.dimensions];
  let boxSize = grids[0].size/3;
  if(board.dimensions == 0){
    for (let j = 0; j < grids[0].playPoints.length; j++)
      for (let k = 0; k < grids[0].playPoints[j].length; k++)
        if(grids[0].playPoints[j][k].x > mouse.x-boxSize/2
           && grids[0].playPoints[j][k].x < mouse.x+boxSize/2
           && grids[0].playPoints[j][k].y > mouse.y-boxSize/2
           && grids[0].playPoints[j][k].y < mouse.y+boxSize/2){
           if(grids[0].selectable && !grids[0].moves[j][k]){
             grids[0].fillBox(j, k, board.turn);
             checkForWin(grids[0], 0);
           }
        }
  }else{
    selectSelectable(grids, boxSize);
  }

  board.turn = 1-board.turn;

  let pack = {moveData: [], selectable: [], closed: [], turn:board.turn};
  for (let i = 0; i < board.grids.length; i++) {
    for (let j = 0; j < board.grids[i].length; j++) {
      pack.moveData.push(board.grids[i][j].moves);
      pack.selectable.push(board.grids[i][j].selectable);
      pack.closed.push(board.grids[i][j].closed);
    }
  }
  sendBoardData(pack);
}

function selectSelectable(grids, boxSize){
  for(let i = 0; i < grids.length; i++)
    for (let j = 0; j < grids[i].playPoints.length; j++)
      for (let k = 0; k < grids[i].playPoints[j].length; k++)
        if(grids[i].playPoints[j][k].x > mouse.x-boxSize/2 && grids[i].playPoints[j][k].x < mouse.x+boxSize/2
           && grids[i].playPoints[j][k].y > mouse.y-boxSize/2 && grids[i].playPoints[j][k].y < mouse.y+boxSize/2)
           if(grids[(i-i%9)+(j*3+k)].closed){
             makeAllSelectable(grids, i-i%9);
             grids[i].fillBox(j, k, board.turn);
             checkForWin(grids[i], board.dimensions, i,(j*3+k));
             return;
           }else if(grids[i].selectable && !grids[i].closed && !grids[i].moves[j][k]){
            resetSelectable(grids);
            grids[i].selectable = false;
            //grids[(i-i%9)+(j*3+k)].selectable = true;
            grids[i].fillBox(j, k, board.turn);
            checkForWin(grids[i], board.dimensions, i, (j*3+k));
            return;
          }
}

function checkForWin(grid, dimension, i, nextIndex){
  let winner = grid.checkWin();
  let index = Math.floor(i/9);
  let row = Math.floor((i%9)/3);
  let col = (i%9)-row*3;

  if(dimension == 0){
    if(winner != 0){
      alert("Player " + winner + " has won! THE GAME IS OVER!");
      for(let i = 0; i < board.grids.length; i++)
        resetSelectable(board.grids[i]);
    }else if(board.dimensions != 0){
      board.grids[board.dimensions][(i-i%9)+nextIndex].selectable = true;
    }
    return;
  }

  if(winner != 0){
    grid.closed = true;
    board.grids[dimension-1][index].fillBox(row, col, board.turn);
    checkForWin(board.grids[dimension-1][index], dimension-1, index, nextIndex);
  }else{
    nextIndex += (i-i%9);
    if(!board.grids[board.dimensions][nextIndex].closed)
      board.grids[board.dimensions][nextIndex].selectable = true;
    else
      makeAllSelectable(board.grids[board.dimensions], nextIndex - nextIndex%9);
  }
}

function resetSelectable(grids){
  for(let i = 0; i < grids.length; i++)
    grids[i].selectable = false;
}

function makeAllSelectable(grids, index){
  for(let i = index; i < index+9; i++)
    grids[i].selectable = true;
}

let frameRate = 1000/fps;
let elapsed = 0;
let past = Date.now();
function setFrameRate(){
  requestAnimationFrame(setFrameRate);

  elapsed = Date.now() - past;

  if(elapsed >= frameRate){
    past = Date.now()- (elapsed%(frameRate));
    animate();
  }
}

function animate() {
  c.clearRect(0,0,canvas.width,canvas.height);
  board.update();
}

setFrameRate();
resizeCanvas();
