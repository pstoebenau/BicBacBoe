import Position from "../misc/position.js";

export default class UI
{
  client;
  canvas;
  canvasSetup;
  board;
  playerMark = 0;

  // Audio
  bruhAudio;
  reallyNibbaAudio;
  airHornAudio;

  // Buttons and Sliders
  multiplayerButton;
  dimensionSlider;
  zoomSlider;
  fullScrnBttn;
  resetBttn;
  saveBttn;
  downloadBttn;

  // Text inputs
  opponentText;

  // Mouse
  mouse;
  startMousePos;
  startTouchDistance;
  isPinching;
  startBoard;

  constructor(board, canvasSetup, client, update) {
    this.client = client;
    this.board = board;
    this.canvasSetup = canvasSetup;
    this.canvas = canvasSetup.canvas;
    this.update = update;

    // Audio
    this.bruhAudio = new Audio('../../audio/bruh.mp3');
    this.reallyNiggaAudio = new Audio('../../audio/really_nigga.mp3');
    this.airHornAudio = new Audio('../../audio/air_horn.mp3');
    this.allahuAkbharAudio = new Audio('../../audio/allahu_akbar.mp3');
    this.ninjaAudio = new Audio('../../audio/ninja.mp3');
    this.sadViolinAudio = new Audio('../../audio/sad_violin.mp3');

    // Buttons and Sliders
    this.multiplayerButton = document.getElementById("multiplayerButton");
    this.multiplayerPane = document.getElementById("multiplayerPane");
    this.dimensionSlider = document.getElementById("dimensionRange");
    this.zoomSlider = document.getElementById("zoomRange");
    this.opponentID = document.getElementById("opponentID");
    this.fullScrnBttn = document.getElementById("fullScrnBttn");
    this.resetBttn = document.getElementById("resetBttn");
    this.saveBttn = document.getElementById("saveBttn");
    this.downloadBttn = document.getElementById("downloadBttn");

    // Inputs
    this.opponentText = document.getElementById("opponentText");
    this.opponentButton = document.getElementById("opponentButton");
    this.usernameText = document.getElementById("usernameText");
    this.usernameButton = document.getElementById("usernameButton");


    // Mouse
    this.mouse = {position: new Position(0,0), isDown: false, isDragging: false};
    this.startMousePos = new Position(0,0);
    this.startTouchDistance = 0;
    this.isPinching = false;
    this.startBoard = new Position(0,0);

    this.setUpControls();
  }

  setUpControls() {
    // Resize Board
    window.addEventListener("resize", () => this.resizeBoard(this.calcBoardSize()));

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

    // Multiplayer Controls
    this.multiplayerButton.addEventListener('click', () => this.showMultiplayerPane());
    this.opponentButton.addEventListener('click', () => client.setOpponent(this.opponentText.value));
    this.usernameButton.addEventListener('click', () => client.setUsername(this.usernameText.value));

    // Board Controls
    this.dimensionSlider.addEventListener("input", () => this.changeDim());
    this.fullScrnBttn.addEventListener('click', () => this.toggleFullScreen());
    this.resetBttn.addEventListener('click', () => {
      this.resizeBoard(this.calcBoardSize());
      this.board.reset();
      this.update();
    });
    this.downloadBttn.addEventListener('click', () => this.downloadBoard());
  }

  playAudio(audioName) {
    let soundEffects = [
      ["bruh", "really nigga", "air horn", "allahu akbar", "ninja", "sad violin"],
      [this.bruhAudio, this.reallyNiggaAudio, this.airHornAudio, this.allahuAkbharAudio, this.ninjaAudio, this.sadViolinAudio]
    ]

    for (let i = 0; i < soundEffects[0].length; i++){
      if (audioName === soundEffects[0][i]) {
        soundEffects[1][i].load();
        soundEffects[1][i].play();
        return;
      }
    }

    console.error("Sound Effect does not exist");
  }

  updatePlayerTable() {
    let playerTable = document.getElementById('playerTable');

    for (let i = playerTable.rows.length - 1; i >= 1; i--)
    playerTable.deleteRow(i);

    for (let player of this.client.getPlayerList()) {
      let row = playerTable.insertRow(playerTable.rows.length);

      row.insertCell(0).innerHTML = `${player.id}`;
      row.insertCell(1).innerHTML = player.username;

      if (player.id === this.client.getPlayerID())
      row.style.color = "green";
    }
  }

  toggleFullScreen() {
    var doc = window.document;
    var docEl = document;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement)
      requestFullScreen.call(docEl);
    else
      cancelFullScreen.call(doc);

    this.update();
  }

  showMultiplayerPane() {
    if(this.multiplayerPane.style.display === "block")
      this.multiplayerPane.style.display = "none";
    else {
      this.multiplayerPane.style.display = "block";
      this.updatePlayerTable();
    }
  }

  calcBoardSize() {
    let size;

    if(this.canvas.width < this.canvas.height)
      size = this.canvas.width/2;
    else
      size = this.canvas.height/2;

    return size;
  }

  resizeBoard(size) {
    // Resize board according to zoom and screen size
    this.board.resize(size);
    this.board.move(new Position(this.canvas.width/2, this.canvas.height/2));
    this.update();
  }

  downloadBoard() {
    
  }

  changeDim() {
    this.board.changeDim(this.dimensionSlider.value);
    this.update();
  }

  zoom(amount) {
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

    this.update();
  }

  startTouch() {
    event.preventDefault();

    let touch = new Position(event.touches[0].pageX, event.touches[0].pageY);

    if(event.touches.length >= 2) {
      let secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      this.startTouchDistance = touch.distance(secondTouch);
    }

    if(this.isPinching)
      return;

    this.startSelect(touch.x, touch.y);
  }

  moveTouch() {
    let touch = new Position(event.touches[0].pageX, event.touches[0].pageY);

    event.preventDefault();

    if(event.touches.length >= 2) {
      // Scale Board
      let secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      let touchDistance = touch.distance(secondTouch);
      let delta = touchDistance-this.startTouchDistance;
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

  stopTouch() {
    if(event.touches.length <= 0 && this.isPinching) {
      this.mouse.isDown = false;

      if(this.mouse.isDragging) {
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

  startSelect(mouseX, mouseY) {
    this.mouse.position.x = mouseX - this.canvas.getBoundingClientRect().left;
    this.mouse.position.y = mouseY - this.canvas.getBoundingClientRect().top;

    if(!this.mouse.isDragging) {
      this.startBoard = this.board.position;
      this.startMousePos = this.mouse.position.copy();
    }

    this.mouse.isDown = true;
  }

  // Update mouse variable
  updateMousePos(mouseX, mouseY) {
    this.mouse.position.x = mouseX - this.canvas.getBoundingClientRect().left;
    this.mouse.position.y = mouseY - this.canvas.getBoundingClientRect().top;

    if(this.mouse.isDown)
      this.mouse.isDragging = true;

    // Moves board when dragging
    if(this.mouse.isDragging) {
      let newPos = this.startBoard.add(this.mouse.position.subtract(this.startMousePos));

      this.board.move(newPos);
    }

    this.update();
  }

  // Update board on mouse release
  stopSelect() {
    this.mouse.isDown = false;

    if(this.mouse.isDragging) {
      this.mouse.isDragging = false;
      return;
    }
    this.mouse.isDragging = false;

    if(this.client.isMultiplayer()) {
      if(this.board.turn == 0)
        this.client.setPlayerMark(this.board.turn);

      if(this.playerMark != this.board.turn%2)
        return;
    }

    if(this.board.createMove(this.mouse.position)) {
      this.playAudio("bruh");
      this.client.sendBoardData(this.board.getBoardData());
    }

    this.update();
  }

  lose() {
    this.playAudio("really nigga");
    setTimeout(() => this.playAudio("sad violin"), 1000);
  }

  win(winner) {
    this.playAudio("air horn");
    client.win();
  }
}
