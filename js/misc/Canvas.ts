import Position from "./Position";

export default class Canvas {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  bounds = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener("resize", () => this.resizeCanvas());

    this.resizeCanvas();
  }

  resizeCanvas() {
    //  Set canvas to bounds of container
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.bounds.top = this.canvas.getBoundingClientRect().top;
    this.bounds.left = this.canvas.getBoundingClientRect().left;
    this.bounds.bottom = this.canvas.getBoundingClientRect().bottom;
    this.bounds.right = this.canvas.getBoundingClientRect().right;
  }

  getElement() {
    return this.canvas;
  }

  getCenter() {
    return new Position(this.canvas.width / 2, this.canvas.height / 2);
  }

  setWidth(width: number) {
    this.canvas.width = width;
  }

  setHeight(height: number) {
    this.canvas.height = height;
  }

  getBoundingDimension() {
    if(this.canvas.width < this.canvas.height)
      return this.canvas.width/2;
    else
      return this.canvas.height/2;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
