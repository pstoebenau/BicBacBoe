export default class Position
{
  x;
  y;

  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }

  add(pos)
  {
    return new Position(this.x + pos.x, this.y + pos.y);
  }

  subtract(pos)
  {
    return new Position(this.x - pos.x, this.y - pos.y);
  }

  mult(x)
  {
    return new Position(this.x * x, this.y * x);
  }

  distance(pos)
  {
    let distance = Math.pow(this.x-pos.x, 2);
    distance += Math.pow(this.y-pos.y, 2);
    distance = Math.sqrt(distance, 2);
    return distance;
  }

  angle(pos)
  {
    return Math.atan((this.y-pos.y)/(this.x-pos.x));
  }

  equals(pos)
  {
    return this.x == pos.x && this.y == pos.y;
  }

  copy()
  {
    return new Position(this.x, this.y);
  }

  isInsideBox(center, size)
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
