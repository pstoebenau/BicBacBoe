export default class CanvasSetup
{
  container;
  canvas;
  ctx;
  fps;
  past;
  elapsed;
  frameRate;
  update;

  constructor(containerId, update)
  {
    this.container = document.getElementById(containerId);
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext("2d");

    this.fps = 60;
    this.past = Date.now();
    this.elapsed = 0;
    this.frameRate = 1000/this.fps;

    this.update = update;

    window.addEventListener("resize", () => this.resizeCanvas());

    this.resizeCanvas();

    if(update)
      this.setFrameRate();
  }

  resizeCanvas()
  {
    //  Set canvas to bounds of container
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  // Call update function at constant frame rate
  setFrameRate()
  {
    if (!this.update)
      return;

    // Game loop
    requestAnimationFrame(() => this.setFrameRate());

    this.elapsed = Date.now() - this.past;

    if(this.elapsed >= this.frameRate)
    {
      this.past = Date.now() - (this.elapsed%this.frameRate);

      this.update();
    }
  }

}
