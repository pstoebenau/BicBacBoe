import Position from "../misc/position.js";
import Grid from "./grid.js"
import DataGrid from "./dataGrid.js"

export default class Board {
  position;
  size;
  color;
  dimensions;
  turn;
  grids;
  canvas;
  ctx;

  constructor(x, y, size, dimen, canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.position = new Position(x, y);
    this.size = size;
    this.color = "silver";
    this.dimensions = dimen;
    this.grids = new Grid(x, y, size, this.ctx);
    this.turn = 0;

    this.createGrids(this.grids, this.dimensions - 1);
    this.makeAllSelectable(this.grids);
  }

  reset() {
    this.grids = new Grid(this.position.x, this.position.y, this.size, this.ctx);
    this.turn = 0;

    this.createGrids(this.grids, this.dimensions - 1);
    this.makeAllSelectable(this.grids);
  }

  getBoardData() {
    var gridData = new DataGrid();
    this.getGridData(this.grids, gridData);

    return {
      dimensions: this.dimensions,
      turn: this.turn,
      gridData: gridData,
    };
  }

  getGridData(grid, gridData) {
    if (grid.children == null) {
      grid.getData(gridData);
      return;
    }

    grid.getData(gridData);
    gridData.addChildren();

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.getGridData(grid.children[i][j], gridData.children[i][j]);
  }

  loadBoard(boardData) {
    this.changeDim(boardData.dimensions);
    this.turn = boardData.turn;
    this.updateGridData(this.grids, boardData.gridData);
  }

  updateGridData(grid, dataGrid) {
    if (grid.children == null) {
      grid.updateData(dataGrid);
      return;
    }

    grid.updateData(dataGrid);

    for (var i = 0; i < 3; i++)
      for (var j = 0; j < 3; j++)
        this.updateGridData(grid.children[i][j], dataGrid.children[i][j]);
  }

  changeDim(dimensions) {
    this.dimensions = dimensions;
    this.reset();
  }

  resize(size) {
    this.size = size;

    this.grids.resize(this.grids, size, this.position);
  }

  move(pos) {
    let posChange = pos.subtract(this.position);

    this.position = pos.copy();
    this.grids.move(this.grids, posChange);
  }

  createMove(pos) {
    let grid;
    let gridBox;
    let trail = [];

    grid = this.grids.getGrid(this.grids, pos, this.turn % 2);

    if (!grid || !grid.selectable || grid.closed)
      return false;

    // Get index of box corresponding to pos
    gridBox = grid.getBox(pos);
    // Check if box is already filled
    if (grid.moves[gridBox.row][gridBox.col])
      return false;
    trail.push(gridBox);

    grid.fillBox(gridBox.row, gridBox.col, this.turn % 2);
    this.resetSelectable();

    // Check for wins
    this.checkAllWin(grid, trail);
    grid = this.getNextGrid(grid, trail, 0);
    grid.selectable = true;

    if (grid.closed && grid.parent)
      this.makeAllSelectable(grid.parent);

    this.turn++;
    return true;
  }

  checkAllWin(grid, trail) {
    let index;
    let win = grid.checkWin(this.turn % 2);

    if (grid.parent == null) {
      if (win) {
        grid.close();
        this.winner = this.turn % 2 + 1;
      }
      return;
    }

    if (!win)
      return;

    grid.close();
    index = grid.getIndexRelParent();
    grid.parent.fillBox(index.row, index.col, this.turn % 2);
    trail.push(index);

    this.checkAllWin(grid.parent, trail);
  }

  getNextGrid(grid, trail, i) {
    if (grid.parent == null)
      return grid;

    if (trail[i + 1]) {
      grid = this.getNextGrid(grid.parent, trail, i + 1);
      return grid.children[trail[i].row][trail[i].col];
    }

    return grid.parent.children[trail[i].row][trail[i].col];
  }

  createGrids(grid, dimension) {
    if (dimension == 0) {
      grid.updateGridPoints();
      return;
    }

    grid.addChildren();

    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.createGrids(grid.children[i][j], dimension - 1);
  }

  makeAllSelectable(grid) {
    this.grids.makeAllSelectable(grid);
  }

  resetSelectable() {
    this.grids.resetSelectable(this.grids);
  }

  draw(grid, dimension) {
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
    this.draw(this.grids, this.dimensions);
  }
}
