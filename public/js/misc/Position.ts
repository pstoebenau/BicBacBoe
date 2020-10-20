export default class Position
{
  x: number;
  y: number;

  constructor(x: number, y: number)
  {
    this.x = x;
    this.y = y;
  }

  add(pos: Position)
  {
    return new Position(this.x + pos.x, this.y + pos.y);
  }

  subtract(pos: Position)
  {
    return new Position(this.x - pos.x, this.y - pos.y);
  }

  mult(x: number)
  {
    return new Position(this.x * x, this.y * x);
  }

  distance(pos: Position)
  {
    return Math.sqrt(Math.pow(this.x - pos.x, 2) + Math.pow(this.y - pos.y, 2));
  }

  angle(pos: Position)
  {
    return Math.atan((this.y-pos.y)/(this.x-pos.x));
  }

  equals(pos: Position)
  {
    return this.x == pos.x && this.y == pos.y;
  }

  copy()
  {
    return new Position(this.x, this.y);
  }

  isInsideBox(center: Position, size: number)
  {
    let radius = new Position(size/2, size/2);
    let topLeftCorner = center.subtract(radius);
    let botRightCorner = center.add(radius);

    if(this.x < topLeftCorner.x || this.y < topLeftCorner.y)
      return false;

    if(this.x > botRightCorner.x || this.y > botRightCorner.y)
      return false;

    return true;
  }
}
