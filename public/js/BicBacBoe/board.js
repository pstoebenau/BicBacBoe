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

  this.mult = (x) =>
  {
    return new position(this.x * x, this.y * x);
  }

  this.distance = (pos) =>
  {
    let distance = Math.pow(this.x-pos.x, 2);
    distance += Math.pow(this.y-pos.y, 2);
    distance = Math.sqrt(distance, 2);
    return distance;
  }

  this.angle = (pos) =>
  {
    return Math.atan((this.y-pos.y)/(this.x-pos.x));
  }

  this.equals = (pos) =>
  {
    return this.x == pos.x && this.y == pos.y;
  }

  this.copy = () =>
  {
    return new position(this.x, this.y);
  }

  this.isInsideBox = (center, size) =>
  {
    let radius = new position(size/2, size/2);
    let topLeftCorner = center.subtract(radius);
    let botRightCorner = center.add(radius);

    if(this.x < topLeftCorner.x || this.y < topLeftCorner.y)
      return false;

    if(this.x > botRightCorner.x || this.y > botRightCorner.y)
      return false;

    return true;
  }
}

function ticTacToeBoard(x, y, size, dimen)
{
  this.position = new position(x, y);
  this.size = size;
  this.color = "silver";
  this.dimensions = dimen;
  this.turn;
  this.grids;

  this.initialize = () =>
  {
    this.grids = new grid(this.position.x, this.position.y, this.size);
    this.turn = 0;
    this.createGrids(this.grids, this.dimensions-1);
    this.makeAllSelectable();
  }

  this.getBoardData = () =>
  {
    var gridData = new dataGrid();
    this.getGridData(this.grids, gridData);

    return {
      dimensions: this.dimensions,
      turn: this.turn,
      gridData: gridData,
    };
  }

  this.getGridData = (grid, gridData) =>
  {
    if(grid.children == null)
    {
      grid.getData(gridData);
      return;
    }

    grid.getData(gridData);
    gridData.addChildren();

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.getGridData(grid.children[i][j], gridData.children[i][j]);
  }

  this.loadBoard = (boardData) =>
  {
    this.changeDim(boardData.dimensions);
    this.turn = boardData.turn;
    this.updateGridData(this.grids, boardData.gridData);
  }

  this.updateGridData = (grid, dataGrid) =>
  {
    if(grid.children == null)
    {
      grid.updateData(dataGrid);
      return;
    }

    grid.updateData(dataGrid);

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.updateGridData(grid.children[i][j], dataGrid.children[i][j]);
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

  this.createMove = (pos) =>
  {
    let grid;
    let gridBox;
    let trail = [];

    grid = this.grids.getGrid(this.grids, pos, this.turn%2);

    if(!grid || !grid.selectable || grid.closed)
      return false;

    // Get index of box corresponding to pos
    gridBox = grid.getBox(pos);
    // Check if box is already filled
    if(grid.moves[gridBox.row][gridBox.col])
      return false;
    trail.push(gridBox);

    grid.fillBox(gridBox.row, gridBox.col, this.turn%2);
    this.resetSelectable();

    // Check for wins
    this.checkAllWin(grid, trail);
    grid = this.getNextGrid(grid, trail, 0);
    grid.selectable = true;

    if(grid.closed)
      this.makeAllSelectable();

    this.turn++;
    return true;
  }

  this.checkAllWin = (grid, trail) =>
  {
    let index;
    let win = grid.checkWin(this.turn%2);

    if(grid.parent == null)
    {
      if(win)
      {
        grid.close();
        alert("Player " + (this.turn%2+1) + " has won!");
      }
      return;
    }

    if(!win)
      return;

    grid.close();
    index = grid.getIndexRelParent();
    grid.parent.fillBox(index.row, index.col, this.turn%2);
    trail.push(index);

    this.checkAllWin(grid.parent, trail);
  }

  this.getNextGrid = (grid, trail, i) =>
  {
    if(grid.parent == null)
      return grid;

    if(trail[i+1])
    {
      grid = this.getNextGrid(grid.parent, trail, i+1);
      return grid.children[trail[i].row][trail[i].col];
    }

    return grid.parent.children[trail[i].row][trail[i].col];
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
    this.grids.makeAllSelectable(this.grids);
  }

  this.resetSelectable = () =>
  {
    this.grids.resetSelectable(this.grids);
  }

  this.draw = (grid, dimension) =>
  {
    if(dimension == 0)
      return;

    grid.draw(this.color);

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
  this.selectable = false;
  this.size = _size;
  this.gridPoints = [[],[],[]];
  this.moves = [[],[],[]];
  this.parent = null;
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

  // Writes the players move to grid
  this.getGrid = (grid, pos, player) =>
  {
    if(!pos.isInsideBox(grid.position, grid.size))
      return;

    if(grid.children != null)
    {
      for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
        {
          // Return only if grid is found
          let retval = this.getGrid(grid.children[i][j], pos, player);
          if(retval)
            return retval;
        }

      return;
    }

    return grid;
  }

  // Gets the row and col of box in pos
  this.getBox = (pos) =>
  {
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        if(pos.isInsideBox(this.gridPoints[i][j], this.size/3))
          return {row: i, col: j};
  }

  this.getIndexRelParent = () =>
  {
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
      {
        let grid = this.parent.children[i][j];
        if(this == grid)
          return {row: i, col: j};
      }
  }

  this.makeAllSelectable = (grid) =>
  {
    if(grid.children == null)
    {
      grid.selectable = true;
      return;
    }

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.makeAllSelectable(grid.children[i][j]);
  }

  this.resetSelectable = (grid) =>
  {
    grid.selectable = false;

    if(grid.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        grid.resetSelectable(grid.children[i][j]);
  }

  this.close = () =>
  {
    this.closeHelper(this);
  }

  this.closeHelper = (grid) =>
  {
    if(grid.children == null)
    {
      grid.closed = true;
      return;
    }

    grid.closed = true;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.closeHelper(grid.children[i][j]);
  }

  this.fillBox = (row, col, player) =>
  {
    if(this.moves[row][col] == "X" || this.moves[row][col] == "O")
      return;
    if(player == 0)
      this.moves[row][col] = "X";
    else if(player == 1)
      this.moves[row][col] = "O";
    else if(row < 0 || row > 2 || col < 0 || col > 2)
      console.error("Invalid box index!");
    else
      console.error("Invalid player!");
  }

  this.checkWin = (player) =>
  {
    let mark = player ? "O" : "X";

    //Check rows
    for(let j = 0; j < 3; j++)
      if(this.trailCheck(j, 0, 0, 1, mark))
        return 1;

    //Check columns
    for(let j = 0; j < 3; j++)
      if(this.trailCheck(0, j, 1, 0, mark))
        return 1;

    //Check diagonal
    if(this.trailCheck(0, 0, 1, 1, mark))
      return 1;

    //Check other diagonal
    if(this.trailCheck(0, 2, 1, -1, mark))
      return 1;

    return 0;
  }

  this.trailCheck = (row, col, rDirect, cDirect, playerMark) =>
  {
    if(this.moves[row][col] == playerMark)
      if(this.moves[row][col] == this.moves[row+rDirect][col+cDirect] && this.moves[row][col] == this.moves[row+2*rDirect][col+2*cDirect])
        return true;

    return false;
  }

  this.getData = (data) =>
  {
    let isNull = true;

    data.closed = this.closed;
    data.selectable = this.selectable;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
      {
        if(this.moves[i][j])
          isNull = false;

        data.moves[i][j] = this.moves[i][j];
      }

    if(isNull)
      data.moves = null;
  }

  this.updateData = (grid) =>
  {
    this.closed = grid.closed;
    this.selectable = grid.selectable;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.moves[i][j] = (grid.moves == null) ? null : grid.moves[i][j];
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
        this.children[i][j].parent = this;
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

  this.draw = (color) =>
  {
    // Grid
    ctx.strokeStyle = color;
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
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillStyle = color;
          ctx.fillText(this.moves[i][j], this.gridPoints[i][j].x, this.gridPoints[i][j].y);
          ctx.closePath();
        }
      }
    }

    // Highlight selectable grids
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

  this.updateGridPoints();
}

function dataGrid()
{
  this.closed = null;
  this.selectable = null;
  this.moves = [[],[],[]];
  this.children = null;

  this.addChildren = () =>
  {
    this.children = [];
    for (var i = 0; i < 3; i++)
    {
      this.children[i] = [];
      for (var j = 0; j < 3; j++)
        this.children[i][j] = new dataGrid();
    }
  }
}
