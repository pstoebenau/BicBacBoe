import Position from "../misc/Position";
import Grid from "./Grid"
import GridData from "../models/GridData"
import BoardData from "../models/BoardData";
import UI from "./UI";

interface Index {
  row: number,
  col: number,
}

export default class Board {
  position: Position;
  size: number;
  color: string;
  dimensions: number;
  turn: number;
  rootGrid: Grid;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ui: UI;

  constructor(position: Position, size: number, dimensions: number, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.position = position;
    this.size = size;
    this.color = "silver";
    this.dimensions = dimensions;
    this.rootGrid = new Grid(position, size, this.ctx);
    this.turn = 0;

    this.createGrids(this.rootGrid, this.dimensions - 1);
    this.makeAllSelectable(this.rootGrid);
  }

  reset() {
    this.rootGrid = new Grid(this.position, this.size, this.ctx);
    this.turn = 0;

    this.createGrids(this.rootGrid, this.dimensions - 1);
    this.makeAllSelectable(this.rootGrid);
  }

  getBoardData() {
    let gridData = this.rootGrid.getGridData();

    return <BoardData>{
      dimensions: this.dimensions,
      turn: this.turn,
      gridData: gridData
    };
  }

  loadBoard(boardData: BoardData) {
    this.changeDim(boardData.dimensions);
    this.turn = boardData.turn;
    this.updateGridData(this.rootGrid, boardData.gridData);
  }

  updateGridData(grid: Grid, gridData: GridData) {
    if (grid.children == null) {
      grid.updateData(<Grid>gridData);
      return;
    }

    grid.updateData(<Grid>gridData);

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.updateGridData(grid.children[i][j], gridData.children[i][j]);
  }

  changeDim(dimensions: number) {
    this.dimensions = dimensions;
    this.reset();
  }

  resize(size: number) {
    this.size = size;

    this.rootGrid.resize(this.rootGrid, size, this.position);
  }

  move(pos: Position) {
    let posChange = pos.subtract(this.position);

    this.position = pos.copy();
    this.rootGrid.move(this.rootGrid, posChange);
  }

  processMove(pos: Position) {
    let grid;
    let gridBox;
    let trail: Index[] = [];

    grid = this.rootGrid.getGrid(this.rootGrid, pos, this.turn % 2);

    if (!grid || !grid.selectable || grid.closed)
      return false;

    // Get index of box corresponding to pos
    gridBox = grid.getBox(pos);
    // Initialize moves
    if (grid.moves == null)
      grid.moves = [[null, null, null],[null, null, null],[null, null, null]];
    // Check if box is already filled
    if (grid.moves[gridBox.row][gridBox.col])
      return false;
    trail.push(gridBox);

    grid.fillBox(gridBox.row, gridBox.col, this.turn % 2);
    this.resetSelectable();

    // Check for wins
    this.checkWin(grid, trail);

    // Make next Grid selectable
    grid = this.getNextGrid(grid, trail, 0);
    grid.selectable = true;

    if (grid.closed && grid.parent)
      this.makeAllSelectable(grid.parent);

    this.turn++;
    return true;
  }

  checkWin(grid: Grid, trail: Index[]) {
    let index;
    let win = grid.checkWin(this.turn % 2);
    
    if (!win)
      return;

    // Handle game win
    if (grid.parent == null && win) {
      grid.close();
      this.ui.win(this.turn % 2);
      return;
    }

    // Handle grid win
    // Initialize moves
    if (grid.parent.moves == null)
      grid.parent.moves = [[null, null, null],[null, null, null],[null, null, null]];
    
    grid.close();
    index = grid.getIndexRelParent();
    grid.parent.fillBox(index.row, index.col, this.turn % 2);
    trail.push(index);

    this.checkWin(grid.parent, trail);
  }

  getNextGrid(grid: Grid, trail: Index[], i: number) {
    if (grid.parent == null)
      return grid;

    if (trail[i + 1]) {
      grid = this.getNextGrid(grid.parent, trail, i + 1);
      return grid.children[trail[i].row][trail[i].col];
    }

    return grid.parent.children[trail[i].row][trail[i].col];
  }

  createGrids(grid: Grid, dimension: number) {
    if (dimension == 0) {
      grid.updateGridPoints();
      return;
    }

    grid.addChildren();

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.createGrids(grid.children[i][j], dimension - 1);
  }

  private makeAllSelectable(grid: Grid) {
    this.rootGrid.makeAllSelectable(grid);
  }

  resetSelectable() {
    this.rootGrid.resetSelectable(this.rootGrid);
  }

  draw(grid: Grid, dimension: number) {
    if (dimension == 0)
      return;

    grid.draw(this.color);

    if (grid.children == null)
      return;

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.draw(grid.children[i][j], dimension - 1);
  }

  update() {
    this.draw(this.rootGrid, this.dimensions);
  }
}
