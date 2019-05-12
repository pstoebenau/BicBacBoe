var container = document.getElementById("BicBacBoe");
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
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Call update function at constant frame rate
function setFrameRate()
{
  // Game loop
  requestAnimationFrame(setFrameRate);

  elapsed = Date.now() - past;

  if(elapsed >= frameRate){
    past = Date.now() - (elapsed%(1000/fps));

    if(typeof update === "function")
      update();
  }
}

resizeCanvas();
setFrameRate();
