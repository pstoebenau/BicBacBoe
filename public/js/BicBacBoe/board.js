function position(x, y)
{
  this.x = x;
  this.y = y;

  this.add = (pos) =>
  {
    return new position(this.x + pos.x, this.y + pos.y);
  }

  this.subtract = (pos) =>
  {
    return new position(this.x - pos.x, this.y - pos.y);
  }

  this.copy = () =>
  {
    return new position(this.x, this.y);
  }

  this.isInside = (p1, p2) =>
  {
    return (this.x >= p1.x && this.x <= p2.x && this.y >= p1.y && this.y <= p2.y);
  }
}

function ticTacToeBoard(x, y, size, dimen)
{
  this.position = new position(0,0);
  this.position.x = x;
  this.position.y = y;
  this.size = size;
  this.dimensions = dimen;
  this.turn;
  this.grids;

  this.initialize = () =>
  {
    this.grids = new grid(this.position.x, this.position.y, this.size);
    this.turn = 0;
    this.createGrids(this.grids, this.dimensions-1);
  }

  this.changeDim = (dimensions) =>
  {
    this.dimensions = dimensions;
    this.initialize();
  }

  this.resize = (size) =>
  {
    this.size = size;

    this.grids.resize(this.grids, size, this.position);
  }

  this.move = (pos) =>
  {
    let posChange = pos.subtract(this.position);

    this.position = pos.copy();
    this.grids.move(this.grids, posChange);
  }

  this.createGrids = (grid, dimension) =>
  {
    if(dimension == 0)
    {
      grid.updateGridPoints();
      return;
    }

    grid.addChildren();

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.createGrids(grid.children[i][j], dimension-1);
  }

  this.makeAllSelectable = () =>
  {
    this.makeAllSelectableHelper(this.grids);
  }

  this.makeAllSelectableHelper = (grid) =>
  {
    if(grid.children == null)
    {
      grid.selectable = true;
      return;
    }

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.makeAllSelectableHelper(grid.children[i][j]);
  }

  this.draw = (grid, dimension) =>
  {
    if(dimension == 0)
      return;

    grid.draw();

    if(grid.children == null)
      return;

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.draw(grid.children[i][j], dimension-1);
  }

  this.update = () =>
  {
    this.draw(this.grids, this.dimensions);
  }
}

function grid(x, y, _size)
{
  const GRID_GAP = 3.3;
  this.position = new position(x, y);
  this.closed = false;
  this.winner;
  this.selectable = false;
  this.size = _size;
  this.gridPoints = [[],[],[]];
  this.moves = [[],[],[]];
  this.children = null;

  this.resize = (grid, size, pos) =>
  {
    grid.size = size;
    grid.position = pos.copy();
    grid.updateGridPoints();

    if(grid.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        grid.children[i][j].resize(grid.children[i][j], size/GRID_GAP, grid.gridPoints[i][j]);
  }

  this.move = (grid, posChange) =>
  {
    grid.position = grid.position.add(posChange);
    grid.updateGridPoints();

    if(grid.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        grid.children[i][j].move(grid.children[i][j], posChange);
  }

  this.addChildren = () =>
  {
    this.updateGridPoints();

    this.children = [];
    for (var i = 0; i < 3; i++)
    {
      this.children[i] = [];
      for (var j = 0; j < 3; j++)
      {
        let point = this.gridPoints[i][j];
        this.children[i][j] = new grid(point.x, point.y, this.size/GRID_GAP);
      }
    }
  }

  this.updateGridPoints = () =>
  {
    this.gridPoints[0][0] = new position(this.position.x-this.size/3, this.position.y-this.size/3);
    this.gridPoints[0][1] = new position(this.position.x, this.position.y-this.size/3);
    this.gridPoints[0][2] = new position(this.position.x+this.size/3, this.position.y-this.size/3);
    this.gridPoints[1][0] = new position(this.position.x-this.size/3, this.position.y);
    this.gridPoints[1][1] = new position(this.position.x, this.position.y);
    this.gridPoints[1][2] = new position(this.position.x+this.size/3, this.position.y);
    this.gridPoints[2][0] = new position(this.position.x-this.size/3, this.position.y+this.size/3);
    this.gridPoints[2][1] = new position(this.position.x, this.position.y+this.size/3);
    this.gridPoints[2][2] = new position(this.position.x+this.size/3, this.position.y+this.size/3);
  }

  this.resetSelectable = () =>
  {
    if(this.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.children[i][j].selectable = false;
  }

  this.draw = () =>
  {
    // Grid
    ctx.beginPath();
    ctx.moveTo(this.position.x-this.size/6, this.position.y-this.size/2);
    ctx.lineTo(this.position.x-this.size/6, this.position.y+this.size/2);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.position.x+this.size/6, this.position.y-this.size/2);
    ctx.lineTo(this.position.x+this.size/6, this.position.y+this.size/2);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.position.x-this.size/2, this.position.y-this.size/6);
    ctx.lineTo(this.position.x+this.size/2, this.position.y-this.size/6);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(this.position.x-this.size/2, this.position.y+this.size/6);
    ctx.lineTo(this.position.x+this.size/2, this.position.y+this.size/6);
    ctx.stroke();
    ctx.closePath();

    // Player markers
    for (let i = 0; i < this.moves.length; i++)
    {
      for (let j = 0; j < this.moves[i].length; j++)
      {
        if(this.moves[i][j] == "X" || this.moves[i][j] == "O")
        {
          ctx.beginPath();
          ctx.font = this.size/3 + "px Arial";
          ctx.fillStyle = "#000";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(this.moves[i][j], this.gridPoints[i][j].x, this.gridPoints[i][j].y);
          ctx.closePath();
        }
      }
    }

    // Selectable highlight
    if(this.selectable && !this.closed)
    {
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      ctx.rect(this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size);
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.closePath();
    }
  }

  this.fillBox = (row, col, player) =>
  {
    if(this.moves[row][col] == "X" || this.moves[row][col] == "O")
      return;
    if(player == 0)
      this.moves[row][col] = "X";
    else if(player == 1)
      this.moves[row][col] = "O";
    else
      console.error("Invalid box index!");
  }

  this.checkWin = () =>
  {
    let playerMark = ["X", "O"];

    for(let i = 0; i < 2; i++)
    {
      //Check rows
      for(let j = 0; j < 3; j++)
        if(this.trailCheck(j, 0, 0, 1, playerMark[i]))
          return i+1;

      //Check columns
      for(let j = 0; j < 3; j++)
        if(this.trailCheck(0, j, 1, 0, playerMark[i]))
          return i+1;

      //Check diagonal
      if(this.trailCheck(0, 0, 1, 1, playerMark[i]))
        return i+1;

      //Check other diagonal
      if(this.trailCheck(0, 2, 1, -1, playerMark[i]))
        return i+1;
    }
    return 0;
  }

  this.trailCheck = (row, col, rDirect, cDirect, playerMark) =>
  {
    if(this.moves[row][col] == playerMark)
      if(this.moves[row][col] == this.moves[row+rDirect][col+cDirect] && this.moves[row][col] == this.moves[row+2*rDirect][col+2*cDirect])
        return true;

    return false;
  }

  this.updateGridPoints();
}
