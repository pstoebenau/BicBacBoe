function position(x, y){
  this.x = x;
  this.y = y;

  this.inside = (p1, p2) => {
    if(this.x >= p1.x && this.x <= p2.x && this.y >= p1.y && this.y <= p2.y)
      return true;

    return false;
  }
}

function ticTacToeBoard(x, y, dimensions){
  this.position = new position(0,0);
  this.position.x = x;
  this.position.y = y;
  this.size;
  this.dimensions = dimensions;
  this.turn = 0;
  this.grids = [];

  this.initialize = function(){
    this.grids[0] = [];
    this.grids[0][0] = new grid(this.position.x, this.position.y, this.size);
    if(this.dimensions == 0)
      this.grids[0][0].selectable = true;
    this.createGrids(this.grids[0][0], this.dimensions);
  }

  this.restart = function(){
    this.position.x = canvas.width/2;
    this.position.y = canvas.height/2;
    this.dimensions = dimensionSlider.value;
    this.grids = [];
    this.turn = 0;
    this.initialize();
  }

  this.resize = function(size){
    this.grids[0][0].size = size;
    this.grids[0][0].updatePlayPoints();
    for(let i = 1; i < this.grids.length; i++)
      for(let j = 0; j < this.grids[i].length; j++){
        this.grids[i][j].size = size/(3.5**i);
        let row = Math.floor((j%9)/3);
        let col = (j%9)-row*3;
        this.grids[i][j].position.x = this.grids[i-1][Math.floor(j/9)].playPoints[row][col].x;
        this.grids[i][j].position.y = this.grids[i-1][Math.floor(j/9)].playPoints[row][col].y;
        this.grids[i][j].updatePlayPoints();
      }
  }

  this.move = function(posX, posY){
    let movDistX = posX - this.position.x;
    let movDistY = posY - this.position.y;
    this.position = new position(posX, posY);
    for(let i = 0; i < this.grids.length; i++)
      for(let j = 0; j < this.grids[i].length; j++){
        this.grids[i][j].position.x += movDistX;
        this.grids[i][j].position.y += movDistY;
        this.grids[i][j].updatePlayPoints();
      }
  }

  this.draw = function(){
    for (let i = 0; i < this.grids.length; i++) {
      for (let j = 0; j < this.grids[i].length; j++) {
        if(this.grids[i][j].position.inside(new position(0,0), new position(canvas.width,canvas.height)))
          this.grids[i][j].draw();
      }
    }
  }

  this.createGrids = function(pastGrid, dimensions){
    if(dimensions == 0)
      return;

    let dim = this.dimensions-dimensions+1;
    if(this.grids[dim] == null)
      this.grids[dim] = [];
    for(let i = 0; i < pastGrid.playPoints.length; i++){
      for (let j = 0; j < pastGrid.playPoints[i].length; j++) {
        let currentGrid = new grid(pastGrid.playPoints[i][j].x, pastGrid.playPoints[i][j].y, pastGrid.size/3.5);
        if(dim == this.dimensions)
          currentGrid.selectable = true;
        this.grids[dim].push(currentGrid);
        if(dimensions > 1)
          this.createGrids(currentGrid, dimensions-1);
      }
    }
  }

  this.update = function(){
    this.draw();
  }
}

function grid(x, y, size){
  this.position = new position(x, y);
  this.closed = false;
  this.winner = 0;
  this.selectable = false;
  this.size = size;
  this.playPoints = [];
  this.playPoints[0] = [];
  this.playPoints[1] = [];
  this.playPoints[2] = [];
  this.moves = [[],[],[]];

  this.updatePlayPoints = function(){
    this.playPoints[0][0] = new position(this.position.x-this.size/3, this.position.y-this.size/3);
    this.playPoints[0][1] = new position(this.position.x, this.position.y-this.size/3);
    this.playPoints[0][2] = new position(this.position.x+this.size/3, this.position.y-this.size/3);
    this.playPoints[1][0] = new position(this.position.x-this.size/3, this.position.y);
    this.playPoints[1][1] = new position(this.position.x, this.position.y);
    this.playPoints[1][2] = new position(this.position.x+this.size/3, this.position.y);
    this.playPoints[2][0] = new position(this.position.x-this.size/3, this.position.y+this.size/3);
    this.playPoints[2][1] = new position(this.position.x, this.position.y+this.size/3);
    this.playPoints[2][2] = new position(this.position.x+this.size/3, this.position.y+this.size/3);
  }

  this.draw = function(){
    //Grid
    c.beginPath();
    c.moveTo(this.position.x-this.size/6, this.position.y-this.size/2);
    c.lineTo(this.position.x-this.size/6, this.position.y+this.size/2);
    c.stroke();
    c.closePath();
    c.beginPath();
    c.moveTo(this.position.x+this.size/6, this.position.y-this.size/2);
    c.lineTo(this.position.x+this.size/6, this.position.y+this.size/2);
    c.stroke();
    c.closePath();
    c.beginPath();
    c.moveTo(this.position.x-this.size/2, this.position.y-this.size/6);
    c.lineTo(this.position.x+this.size/2, this.position.y-this.size/6);
    c.stroke();
    c.closePath();
    c.beginPath();
    c.moveTo(this.position.x-this.size/2, this.position.y+this.size/6);
    c.lineTo(this.position.x+this.size/2, this.position.y+this.size/6);
    c.stroke();
    c.closePath();

    //Player markers
    for (let i = 0; i < this.moves.length; i++) {
      for (let j = 0; j < this.moves[i].length; j++) {
        if(this.moves[i][j] == "X" || this.moves[i][j] == "O"){
          c.beginPath();
          c.font = this.size/3 + "px Arial";
          c.fillStyle = "#000";
          c.textBaseline = "middle";
          c.textAlign = "center";
          c.fillText(this.moves[i][j], this.playPoints[i][j].x, this.playPoints[i][j].y);
          c.closePath();
        }
      }
    }

    //Selectable highlight
    if(this.selectable && !this.closed){
      c.beginPath();
      c.globalAlpha = 0.2;
      c.rect(this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size);
      c.fillStyle = "green";
      c.fill();
      c.globalAlpha = 1;
      c.closePath();
    }
  }

  this.fillBox = function(row, col, player){

    if(this.moves[row][col] == "X" || this.moves[row][col] == "O")
      return;
    if(player == 0)
      this.moves[row][col] = "X";
    else if(player == 1)
      this.moves[row][col] = "O";
    else
      console.error("Invalid box index!");
  }

  this.checkWin = function(){
    let playerMark = ["X", "O"];

    for(let i = 0; i < 2; i++){
      //Check rows
      for(let j = 0; j < 3; j++){
        if(this.trailCheck(j, 0, 0, 1, playerMark[i]))
          return i+1;
      }

      //Check columns
      for(let j = 0; j < 3; j++){
        if(this.trailCheck(0, j, 1, 0, playerMark[i]))
          return i+1;
      }

      //Check diagonal
      if(this.trailCheck(0, 0, 1, 1, playerMark[i]))
        return i+1;

      //Check other diagonal
      if(this.trailCheck(0, 2, 1, -1, playerMark[i]))
        return i+1;
    }
    return 0;
  }

  this.trailCheck = function(row, col, rDirect, cDirect, playerMark){
    if(this.moves[row][col] == playerMark)
      if(this.moves[row][col] == this.moves[row+rDirect][col+cDirect] && this.moves[row][col] == this.moves[row+2*rDirect][col+2*cDirect])
        return true;

    return false;
  }

  this.updatePlayPoints();
}
