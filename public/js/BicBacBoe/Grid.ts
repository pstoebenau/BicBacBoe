import Position from "../misc/Position";
import GridData from "../models/GridData";

const GRID_GAP = 3.3;

export default class Grid
{
  position;
  closed = false;
  selectable = false;
  size;
  ctx;
  gridPoints: [Position[], Position[], Position[]] = [[],[],[]];
  moves: [string[], string[], string[]] = null;
  parent: Grid = null;
  children: [Grid[], Grid[], Grid[]] = null;

  constructor(position: Position, size: number, ctx: CanvasRenderingContext2D)
  {
    this.position = position;
    this.size = size;
    this.ctx = ctx;

    this.updateGridPoints();
  }

  resize(grid: Grid, size: number, position: Position)
  {
    grid.size = size;
    grid.position = position.copy();
    grid.updateGridPoints();

    if(grid.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        grid.children[i][j].resize(grid.children[i][j], size/GRID_GAP, grid.gridPoints[i][j]);
  }

  move(grid: Grid, posChange: Position)
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
  getGrid(grid: Grid, position: Position, player: number): Grid
  {
    if(!position.isInsideBox(grid.position, grid.size))
      return;

    if(grid.children != null)
    {
      for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
        {
          // Return only if grid is found
          let retval = this.getGrid(grid.children[i][j], position, player);
          if(retval)
            return retval;
        }

      return;
    }

    return grid;
  }

  // Gets the row and col of box in pos
  getBox(position: Position)
  {
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        if(position.isInsideBox(this.gridPoints[i][j], this.size/3))
          return {row: i, col: j};
  }

  getIndexRelParent()
  {
    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
      {
        let grid = this.parent.children[i][j];
        if(this == grid)
          return {row: i, col: j};
      }
  }

  makeAllSelectable(grid: Grid)
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

  resetSelectable(grid: Grid)
  {
    grid.selectable = false;

    if(grid.children == null)
      return;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        grid.resetSelectable(grid.children[i][j]);
  }

  close()
  {
    this.closeHelper(this);
  }

  closeHelper(grid: Grid)
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

  fillBox(row: number, col: number, player: number)
  {
    if(this.moves[row][col] != null)
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

  checkWin(player: number)
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

  trailCheck(row: number, col: number, rDirect: number, cDirect: number, playerMark: string)
  {
    if(this.moves[row][col] == playerMark)
      if(this.moves[row][col] == this.moves[row+rDirect][col+cDirect] && this.moves[row][col] == this.moves[row+2*rDirect][col+2*cDirect])
        return true;

    return false;
  }

  getGridData() {
    let gridData: GridData = {
      closed: this.closed,
      selectable: this.selectable,
      moves: [[],[],[]],
      children: [[],[],[]]
    };
    
    this.getGridDataRecur(this, gridData);
    
    return gridData;
  }

  getGridDataRecur(grid: Grid, gridData: GridData) {
    // Set grid data
    gridData.closed = grid.closed;
    gridData.selectable = grid.selectable;
    
    // Set moves
    if (grid.moves == null)
      gridData.moves = null;
    else
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          gridData.moves[i][j] = grid.moves[i][j];

    // Base Case
    if (grid.children == null) {
      gridData.children = null;
      return;
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        gridData.children[i].push(<GridData>{
          closed: false,
          selectable: false,
          moves: [[],[],[]],
          children: [[],[],[]]
        });
      }
    }

    // Get all child grids data
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.getGridDataRecur(grid.children[i][j], gridData.children[i][j]);
  }

  updateData(grid: Grid)
  {
    this.closed = grid.closed;
    this.selectable = grid.selectable;

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.moves[i][j] = (grid.moves == null) ? null : grid.moves[i][j];
  }

  addChildren()
  {
    this.updateGridPoints();

    // Initialize Children
    this.children = [[],[],[]];
    for (var i = 0; i < 3; i++)
    {
      this.children[i] = [];
      for (var j = 0; j < 3; j++)
      {
        let point = this.gridPoints[i][j];
        this.children[i][j] = new Grid(point, this.size/GRID_GAP, this.ctx);
        this.children[i][j].parent = this;
      }
    }
  }

  updateGridPoints()
  {
    this.gridPoints[0][0] = new Position(this.position.x-this.size/3, this.position.y-this.size/3);
    this.gridPoints[0][1] = new Position(this.position.x, this.position.y-this.size/3);
    this.gridPoints[0][2] = new Position(this.position.x+this.size/3, this.position.y-this.size/3);
    this.gridPoints[1][0] = new Position(this.position.x-this.size/3, this.position.y);
    this.gridPoints[1][1] = new Position(this.position.x, this.position.y);
    this.gridPoints[1][2] = new Position(this.position.x+this.size/3, this.position.y);
    this.gridPoints[2][0] = new Position(this.position.x-this.size/3, this.position.y+this.size/3);
    this.gridPoints[2][1] = new Position(this.position.x, this.position.y+this.size/3);
    this.gridPoints[2][2] = new Position(this.position.x+this.size/3, this.position.y+this.size/3);
  }

  draw(color: string)
  {
    // Grid
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x-this.size/6, this.position.y-this.size/2);
    this.ctx.lineTo(this.position.x-this.size/6, this.position.y+this.size/2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x+this.size/6, this.position.y-this.size/2);
    this.ctx.lineTo(this.position.x+this.size/6, this.position.y+this.size/2);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x-this.size/2, this.position.y-this.size/6);
    this.ctx.lineTo(this.position.x+this.size/2, this.position.y-this.size/6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x-this.size/2, this.position.y+this.size/6);
    this.ctx.lineTo(this.position.x+this.size/2, this.position.y+this.size/6);
    this.ctx.stroke();
    this.ctx.closePath();

    // Player markers
    if (this.moves != null)
      for (let i = 0; i < this.moves.length; i++)
      {
        for (let j = 0; j < this.moves[i].length; j++)
        {
          if(this.moves[i][j] == "X" || this.moves[i][j] == "O")
          {
            this.ctx.beginPath();
            this.ctx.font = this.size/3 + "px Arial";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = color;
            this.ctx.fillText(this.moves[i][j], this.gridPoints[i][j].x, this.gridPoints[i][j].y);
            this.ctx.closePath();
          }
        }
      }

    // Highlight selectable grids
    if(this.selectable && !this.closed)
    {
      this.ctx.beginPath();
      this.ctx.globalAlpha = 0.2;
      this.ctx.rect(this.position.x-this.size/2,this.position.y-this.size/2,this.size,this.size);
      this.ctx.fillStyle = "green";
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      this.ctx.closePath();
    }
  }
}
