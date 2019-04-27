let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');
window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousedown", startSelect);
window.addEventListener("mousemove", updateMousePos);
window.addEventListener("mouseup", stopSelect);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isSelecting = false;
let mouse = {x: 0, y:0 };
let particles = [];
let numParticles = 50;

let gravity = 0.5;
let energyLoss = 0.4;

function resizeCanvas(){
  particles = [];
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function startSelect(){
  isSelecting = true;
}

function stopSelect(){
  isSelecting = false;
}

function updateMousePos(){
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function pickColor(){
  let color = ["#F2E74B", "#F2AE2E", "#F27B13", "#F25C05", "#A62103"];
  return color[Math.floor(Math.random()*color.length)];
}

function Particle(x, y, vx, vy, radius){
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.radius = radius;
  this.color = pickColor();

  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, radius, 0, 2*Math.PI);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  this.wallColls = function(){
    if(this.x + this.vx < this.radius ||
       this.x + this.vx > innerWidth-this.radius)
    {
      this.vx *= -energyLoss;
    }
    if(this.y + this.vy < this.radius ||
       this.y + this.vy> innerHeight-this.radius)
    {
      this.vy *= -energyLoss;
    }
  }

  this.update = function(){
    this.draw();
    this.wallColls();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += gravity;
  }
}

function createParticles(){
  if(particles.length > numParticles){
    particles.splice(0, particles.length-numParticles-1);
  }
  if(isSelecting){
    let xVel = (Math.random()-0.5)*10;
    let yVel = (Math.random()-0.5)*10;
    particles.push(new Particle(mouse.x, mouse.y, xVel, yVel, 1.5));
  }
}

function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0, innerWidth, innerHeight);

  createParticles();

  for(let i = 0; i < particles.length; i++){
    particles[i].update();
  }
}

animate();
