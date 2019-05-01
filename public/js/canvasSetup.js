let menuBar = document.getElementById("menuBar");
let menuBarHeight = menuBar.clientHeight + 3;
var canvas = document.querySelector('canvas');
window.addEventListener("resize", resizeCanvas);

let ctx = canvas.getContext("2d");

let fps = 60;
let past = Date.now();
let elapsed = 0;
let frameRate = 1000/fps;

function resizeCanvas()
{
  //  Set canvas to bounds of container
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - menuBarHeight;
}

// Call update function at constant frame rate
function setFrameRate()
{
  // Game loop
  requestAnimationFrame(setFrameRate);

  elapsed = Date.now() - past;

  if(elapsed >= frameRate){
    past = Date.now() - (elapsed%(1000/fps));
    update();
  }
}

resizeCanvas();
setFrameRate();
