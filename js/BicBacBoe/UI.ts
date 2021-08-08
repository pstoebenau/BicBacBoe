import Canvas from "../misc/Canvas";
import { TypedEvent } from "../misc/TypedEvent";
import Position from "../misc/Position";
import Board from "./Board";
import Grid from "./Grid";

const DRAG_THRESHHOLD = 20;

export default class UI {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  board: Board;
  playerMark = 0;

  // Event Listeners
  onUpdate = new TypedEvent<void>();

  // Audio
  bruhAudio: HTMLAudioElement;
  reallyNibbaAudio: HTMLAudioElement;
  airHornAudio: HTMLAudioElement;
  ninjaAudio: HTMLAudioElement;
  sadViolinAudio: HTMLAudioElement;

  // Modals
  multiplayerPane: HTMLElement;

  // Buttons and Sliders
  multiplayerButton: HTMLButtonElement;
  fullScrnBttn: HTMLButtonElement;
  resetBttn: HTMLButtonElement;
  saveBttn: HTMLButtonElement;
  downloadBttn: HTMLButtonElement;
  dimensionSlider: HTMLInputElement;
  zoomSlider: HTMLInputElement;
  opponentButton: HTMLButtonElement;
  usernameButton: HTMLButtonElement;

  // Text inputs
  opponentID: HTMLTextAreaElement;
  opponentText: HTMLTextAreaElement;
  usernameText: HTMLTextAreaElement;

  // Mouse
  mouse: {
    position: Position,
    isDown: boolean,
    isDragging: boolean
  };
  startMousePos: Position;
  startTouchDistance: number;
  isPinching: boolean;
  startBoard: Position;

  constructor(board: Board, canvas: Canvas) {
    this.board = board;
    this.canvas = canvas;
    this.ctx = canvas.canvas.getContext('2d');

    // Audio
    this.bruhAudio = new Audio('../../audio/bruh.mp3');
    this.airHornAudio = new Audio('../../audio/air_horn.mp3');
    this.ninjaAudio = new Audio('../../audio/ninja.mp3');
    this.sadViolinAudio = new Audio('../../audio/sad_violin.mp3');

    // Modals
    this.multiplayerPane = document.getElementById("multiplayerPane");

    // Buttons and Sliders
    this.multiplayerButton = <HTMLButtonElement>document.getElementById("multiplayerButton");
    this.dimensionSlider = <HTMLInputElement>document.getElementById("dimensionRange");
    this.zoomSlider = <HTMLInputElement>document.getElementById("zoomRange");
    this.fullScrnBttn = <HTMLButtonElement>document.getElementById("fullScrnBttn");
    this.resetBttn = <HTMLButtonElement>document.getElementById("resetBttn");
    this.saveBttn = <HTMLButtonElement>document.getElementById("saveBttn");
    this.downloadBttn = <HTMLButtonElement>document.getElementById("downloadBttn");
    this.opponentButton = <HTMLButtonElement>document.getElementById("opponentButton");
    this.usernameButton = <HTMLButtonElement>document.getElementById("usernameButton");
    
    // Inputs
    this.opponentText = <HTMLTextAreaElement>document.getElementById("opponentText");
    this.usernameText = <HTMLTextAreaElement>document.getElementById("usernameText");
    this.opponentID = <HTMLTextAreaElement>document.getElementById("opponentID");
    

    // Mouse
    this.mouse = {
      position: new Position(0,0),
      isDown: false,
      isDragging: false
    };
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
    this.canvas.getElement().addEventListener("mouseleave", (e) => this.mouse.isDown = false);
    this.canvas.getElement().addEventListener("mousedown", (e) => {
      if (e.button === 0)
        this.startSelect(e.clientX, e.clientY);
    });
    this.canvas.getElement().addEventListener("mousemove", (e) => {
      if (e.button === 0)
        this.updateMousePos(e.clientX, e.clientY);
    });
    this.canvas.getElement().addEventListener("mouseup", (e) => {
      if (e.button === 0)
        this.stopSelect();
    });
    document.body.addEventListener("wheel", (e) => {
      const delta = Math.sign(e.deltaY);
      this.zoom(delta);
    });
    // Touch
    this.canvas.getElement().addEventListener("touchstart", (e) => this.startTouch(e), false);
    this.canvas.getElement().addEventListener("touchmove", (e) => this.moveTouch(e), false);
    this.canvas.getElement().addEventListener("touchend", (e) => this.stopTouch(e), false);
    this.canvas.getElement().addEventListener("touchcancel", (e) => this.stopTouch(e), false);

    // Multiplayer Controls
    this.multiplayerButton.addEventListener('click', () => this.showMultiplayerPane());
    // this.opponentButton.addEventListener('click', () => this.client.setOpponent(this.opponentText.value));
    // this.usernameButton.addEventListener('click', () => this.client.setUsername(this.usernameText.value));

    // Board Controls
    this.dimensionSlider.addEventListener("input", () => this.changeDim());
    this.fullScrnBttn.addEventListener('click', () => console.log("No fullscreen functionality yet!"));
    this.resetBttn.addEventListener('click', () => {
      this.resizeBoard(this.calcBoardSize());
      this.board.reset();
      this.onUpdate.emit();
    });
    this.downloadBttn.addEventListener('click', () => this.downloadBoard());
  }

  unlockAudio() {
    let soundEffects = [this.bruhAudio, this.airHornAudio, this.ninjaAudio, this.sadViolinAudio];

    for (let audio of soundEffects) {
      audio.load();
      audio.play();
      audio.pause();
      audio.currentTime = 0;
    }
  }

  playAudio(audioName: string) {
    let soundEffects: { [id: string]: HTMLAudioElement}= {
      "bruh": this.bruhAudio,
      "air horn": this.airHornAudio,
      "ninja": this.ninjaAudio,
      "sad violin": this.sadViolinAudio
    }
    let soundEffect: HTMLAudioElement = soundEffects[audioName];
    if (!soundEffect) {
      console.error("Sound effect does not exist");
      return;
    }

    soundEffect.load();
    soundEffect.play();
  }

  updatePlayerTable(id: string, username: string) {
    let playerTable: HTMLTableElement = <HTMLTableElement>document.getElementById('playerTable');

    for (let i = playerTable.rows.length - 1; i >= 1; i--)
      playerTable.deleteRow(i);

    let row = playerTable.insertRow(playerTable.rows.length);

    row.insertCell(0).innerHTML = id;
    row.insertCell(1).innerHTML = username;
    row.style.color = "green";
  }

  showMultiplayerPane() {
    if(this.multiplayerPane.style.display === "block")
      this.multiplayerPane.style.display = "none";
    else {
      this.multiplayerPane.style.display = "block";
    }
  }

  calcBoardSize() {
    return this.canvas.getBoundingDimension();
  }

  resizeBoard(size: number) {
    // Resize board according to zoom and screen size
    this.board.resize(size);
    this.board.move(this.canvas.getCenter());
    this.onUpdate.emit();
  }

  downloadBoard() {
    let boardDataJSON = JSON.stringify(this.board.getBoardData());
    navigator.clipboard.writeText(boardDataJSON);
  }

  changeDim() {
    this.board.changeDim(Number.parseInt(this.dimensionSlider.value));
    this.onUpdate.emit();
  }

  zoom(amount: number) {
    let movPos;
    let center = this.canvas.getCenter();
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

    this.onUpdate.emit();
  }

  startTouch(event: TouchEvent) {
    event.preventDefault();

    let touch = new Position(event.touches[0].pageX, event.touches[0].pageY);

    if(event.touches.length >= 2) {
      let secondTouch = new Position(event.touches[1].pageX, event.touches[1].pageY);
      this.startTouchDistance = touch.distance(secondTouch);
    }

    if(this.isPinching)
      return;

    this.startSelect(touch.x, touch.y);
    this.unlockAudio();
  }

  moveTouch(event: TouchEvent) {
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

  stopTouch(event: TouchEvent) {
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

  startSelect(mouseX: number, mouseY: number) {
    this.mouse.position.x = mouseX - this.canvas.bounds.left;
    this.mouse.position.y = mouseY - this.canvas.bounds.top;

    if(!this.mouse.isDragging) {
      this.startBoard = this.board.position;
      this.startMousePos = this.mouse.position.copy();
    }

    this.mouse.isDown = true;
  }

  // Update mouse variable
  updateMousePos(mouseX: number, mouseY: number) {
    if (!this.mouse.isDown) {
      this.mouse.isDragging = false;
      return;
    }

    this.mouse.position.x = mouseX - this.canvas.bounds.left;
    this.mouse.position.y = mouseY - this.canvas.bounds.top;
    let moveDistance = this.mouse.position.distance(this.startMousePos);

    if(this.mouse.isDown && moveDistance > DRAG_THRESHHOLD)
      this.mouse.isDragging = true;

    // Moves board when dragging
    if(this.mouse.isDragging) {
      let newPos = this.startBoard.add(this.mouse.position.subtract(this.startMousePos));

      this.board.move(newPos);
    }

    this.onUpdate.emit();
  }

  // Update board on mouse release
  stopSelect() {
    this.mouse.isDown = false;
    
    if(this.mouse.isDragging) {
      this.mouse.isDragging = false;
      return;
    }
    this.mouse.isDragging = false;

    // if(this.client.isMultiplayer()) {
    //   if(this.board.turn == 0)
    //     this.client.setPlayerMark(this.board.turn);

    //   if(this.playerMark != this.board.turn%2)
    //     return;
    // }

    if(this.board.processMove(this.mouse.position)) {
      this.playAudio("bruh");
      
      // if (this.client.opponentName != "N/A")
      //   this.client.sendBoardData(this.board.getBoardData());
    }

    this.onUpdate.emit();
  }

  lose() {
    this.playAudio("sad violin");
  }

  win(winner: number) {
    this.playAudio("air horn");
  }

  drawGrid(grid: Grid, color: string)
  {
    // Grid
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(grid.position.x-grid.size/6, grid.position.y-grid.size/2);
    this.ctx.lineTo(grid.position.x-grid.size/6, grid.position.y+grid.size/2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(grid.position.x+grid.size/6, grid.position.y-grid.size/2);
    this.ctx.lineTo(grid.position.x+grid.size/6, grid.position.y+grid.size/2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(grid.position.x-grid.size/2, grid.position.y-grid.size/6);
    this.ctx.lineTo(grid.position.x+grid.size/2, grid.position.y-grid.size/6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(grid.position.x-grid.size/2, grid.position.y+grid.size/6);
    this.ctx.lineTo(grid.position.x+grid.size/2, grid.position.y+grid.size/6);
    this.ctx.stroke();
    this.ctx.closePath();

    // Player markers
    if (grid.moves != null)
      for (let i = 0; i < grid.moves.length; i++)
      {
        for (let j = 0; j < grid.moves[i].length; j++)
        {
          if(grid.moves[i][j] == "X" || grid.moves[i][j] == "O")
          {
            this.ctx.beginPath();
            this.ctx.font = grid.size/3 + "px Arial";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = color;
            this.ctx.fillText(grid.moves[i][j], grid.gridPoints[i][j].x, grid.gridPoints[i][j].y);
            this.ctx.closePath();
          }
        }
      }

    // Highlight selectable grids
    if(grid.selectable && !grid.closed)
    {
      this.ctx.beginPath();
      this.ctx.globalAlpha = 0.2;
      this.ctx.rect(grid.position.x-grid.size/2,grid.position.y-grid.size/2,grid.size,grid.size);
      this.ctx.fillStyle = "green";
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      this.ctx.closePath();
    }
  }
}
