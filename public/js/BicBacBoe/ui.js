import Position from "../misc/position.js";

export default class UI
{
  client;
  canvas;
  canvasSetup;
  board;
  playerMark = 0;
  // Buttons & sliders
  dimensionSlider;
  zoomSlider;
  opponentID;
  fullscrnBttn;
  resetBttn;
  saveBttn;
  // Mouse
  mouse;
  startMousePos;
  startTouchDistance;
  isPinching;
  startBoard;

  constructor(board, canvasSetup, client)
  {
    this.client = client;
    this.board = board;
    this.canvasSetup = canvasSetup;
    this.canvas = canvasSetup.canvas;

    this.dimensionSlider = document.getElementById("dimensionRange");
    this.zoomSlider = document.getElementById("zoomRange");
    this.opponentID = document.getElementById("opponentID");
    this.fullScrnBttn = document.getElementById("fullScrnBttn");
    this.resetBttn = document.getElementById("resetBttn");
    this.saveBttn = document.getElementById("saveBttn");

    this.mouse = {position: new Position(0,0), isDown: false, isDragging: false};
    this.startMousePos = new Position(0,0);
    this.startTouchDistance = 0;
    this.isPinching = false;
    this.startBoard = new Position(0,0);

    // Mouse and touch controls
    // Mouse
    this.canvas.addEventListener("mousedown", (e) => this.startSelect(e.clientX, e.clientY));
    this.canvas.addEventListener("mousemove", (e) => this.updateMousePos(e.clientX, e.clientY));
    this.canvas.addEventListener("mouseup", () => this.stopSelect());
    document.body.addEventListener("wheel", (e) => {
      const delta = Math.sign(e.deltaY);
      this.zoom(delta);
    });
    // Touch
    this.canvas.addEventListener("touchstart", () => this.startTouch(), false);
    this.canvas.addEventListener("touchmove", () => this.moveTouch(), false);
    this.canvas.addEventListener("touchend", () => this.stopTouch(), false);
    this.canvas.addEventListener("touchcancel", () => this.stopTouch(), false);

    // Board Controls
    this.dimensionSlider.addEventListener("input", () => this.changeDim());
    this.opponentID.addEventListener("input", () => this.client.pickOpponent(opponentID.value));
    window.addEventListener("resize", () => this.resizeBoard(this.calcBoardSize()));
    this.fullScrnBttn.addEventListener('click', () => this.psuedoFullscreen());
    this.resetBttn.addEventListener('click', () => {
      this.resizeBoard(this.calcBoardSize());
      this.board.reset();
    });
  }

  toggleFullScreen()
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

  psuedoFullscreen()
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

    this.canvasSetup.resizeCanvas();
    this.resizeBoard(this.calcBoardSize());
  }

  calcBoardSize()
  {
    let size;

    if(this.canvas.width < this.canvas.height)
      size = this.canvas.width/2;
    else
      size = this.canvas.height/2;

    return size;
  }

  resizeBoard(size)
  {
    // Resize board according to zoom and screen size
    this.board.resize(size);
    this.board.move(new Position(this.canvas.width/2, this.canvas.height/2));
  }

  changeDim()
  {
    this.board.changeDim(this.dimensionSlider.value);
  }

  zoom(amount)
  {
    let movPos;
    let center = new Position(this.canvas.width/2, this.canvas.height/2);
    let boardSize = this.board.size;
    let deltaSize = this.board.size;

    boardSize += amount*this.board.size/10;
    this.board.resize(boardSize);

    // Scale with respect to center
    // MATH!
    deltaSize = boardSize/deltaSize;
    movPos = center.subtract(this.board.position);
    movPos = movPos.mult(deltaSize);
    movPos = movPos.add(this.board.position);
    movPos = movPos.subtract(center);
    this.board.move(this.board.position.subtract(movPos));
  }

  startTouch()
  {
    event.preventDefault();

    let touch = new Position(event.touches[0].pageX, event.touches[0].pageY);

    if(event.touches.length >= 2)
    {
      let secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      this.startTouchDistance = touch.distance(this.secondTouch);
    }

    if(this.isPinching)
      return;

    this.startSelect(touch.x, touch.y);
  }

  moveTouch()
  {
    let touch = new Position(event.touches[0].pageX, event.touches[0].pageY);

    event.preventDefault();

    if(event.touches.length >= 2)
    {
      // Scale Board
      let secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      let touchDistance = touch.distance(secondTouch);
      let delta = touchDistance-startTouchDistance;
      this.zoom(delta/10);

      // Calculate for next move
      secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      this.startTouchDistance = touch.distance(secondTouch);

      this.isPinching = true;
      return;
    }

    if(this.isPinching)
      return;

    this.isPinching = false;
    this.updateMousePos(touch.x, touch.y)
  }

  stopTouch()
  {
    if(event.touches.length <= 0 && this.isPinching)
    {
      this.mouse.isDown = false;

      if(mouse.isDragging)
      {
        this.mouse.isDragging = false;
        return;
      }
      this.mouse.isDragging = false;

      this.isPinching = false;
      return;
    }
    if(this.isPinching)
      return;

    this.stopSelect();
  }

  startSelect(mouseX, mouseY)
  {
    this.mouse.position.x = mouseX - this.canvas.getBoundingClientRect().left;
    this.mouse.position.y = mouseY - this.canvas.getBoundingClientRect().top;

    if(!this.mouse.isDragging)
    {
      this.startBoard = this.board.position;
      this.startMousePos = this.mouse.position.copy();
    }

    this.mouse.isDown = true;
  }

  // Update mouse variable
  updateMousePos(mouseX, mouseY)
  {
    this.mouse.position.x = mouseX - this.canvas.getBoundingClientRect().left;
    this.mouse.position.y = mouseY - this.canvas.getBoundingClientRect().top;

    if(this.mouse.isDown)
      this.mouse.isDragging = true;

    // Moves board when dragging
    if(this.mouse.isDragging)
    {
      let newPos = this.startBoard.add(this.mouse.position.subtract(this.startMousePos));

      this.board.move(newPos);
    }
  }

  // Update board on mouse release
  stopSelect()
  {
    this.mouse.isDown = false;

    if(this.mouse.isDragging)
    {
      this.mouse.isDragging = false;
      return;
    }
    this.mouse.isDragging = false;

    if(this.opponentID.value)
    {
      if(this.board.turn == 0)
        this.client.setPlayerMark(this.board.turn);

      if(this.playerMark != this.board.turn%2)
        return;
    }

    if(this.board.createMove(this.mouse.position))
      this.client.sendBoardData(this.board.getBoardData());
  }
}
