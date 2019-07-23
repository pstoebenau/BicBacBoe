export default class DataGrid
{
  closed = null;
  selectable = null;
  moves = [[],[],[]];
  children = null;

  addChildren()
  {
    this.children = [];
    for (var i = 0; i < 3; i++)
    {
      this.children[i] = [];
      for (var j = 0; j < 3; j++)
        this.children[i][j] = new DataGrid();
    }
  }
}
