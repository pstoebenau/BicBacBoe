let menuBar = document.getElementById("menuBar");
let menuBarHeight = menuBar.clientHeight + 3;
let canvas = document.querySelector('canvas');
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousedown", startSelect);
canvas.addEventListener("mousemove", updateMousePos);
canvas.addEventListener("mouseup", stopSelect);

let c = canvas.getContext('2d');
let isSelecting = false;
let mouse = {x:0, y:0};

let balls = [];
let gravity = 0.5;
let energyLoss = 0.975;

let cp = new CircularParticle(mouse.x, mouse.y, 0.1, 25, 3);

let past = Date.now();
let elapsed = 0;
let fps = 60;
let frameRate = 1000/fps;

resizeCanvas();
CreateBalls();
setFramRate();

function pickColor(){
  let color = ["#353E42", "#596A72", "#BD5E40", "#F5EBE9", "#A39797"];
  return color[Math.floor(Math.random()*color.length)];
}

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - menuBarHeight;
  CreateBalls();
}

function CircularParticle(x, y, speed, radius, particles){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.numParticles = particles;
  this.particles = [];

  this.draw = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].x = this.x + Math.cos(this.particles[i].rad)*this.radius;
      this.particles[i].y = this.y + Math.sin(this.particles[i].rad)*this.radius;
      this.particles[i].draw();
      this.particles[i].trail();
      this.particles[i].rad += speed;
    }
  }

  this.createParticles = function(){
    for (var i = 0; i < this.numParticles; i++) {
      let startRadian = (2*Math.PI/this.numParticles)*i;
      this.particles.push(new Particle(0,0,2,startRadian));
    }
  }

  this.update = function(){
    this.x = mouse.x;
    this.y = mouse.y;
    this.draw();
  }
}

function Particle(x, y, radius, rad){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.rad = rad;
  this.trailLength = 10;
  let trailX = [];
  let trailY = [];

  this.trail = function(){
    trailX.push(this.x);
    trailY.push(this.y);

    if(trailX.length > this.trailLength || trailY.length > this.trailLength){
      trailX.splice(0, trailX.length-this.trailLength-1);
      trailY.splice(0, trailY.length-this.trailLength-1);
    }

    for (let i = 0; i < trailX.length; i++) {
      c.beginPath();
      c.rect(trailX[i], trailY[i], 1, 1);
      c.fill();
      c.closePath();
    }
  }

  this.clearTrail = function(){
    trailX = [];
    trailY = [];
  }

  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, radius, 0, 2*Math.PI);
    c.fill();
    c.closePath();
  }
}

cp.createParticles();
function selectBall(){
  cp.update();
  for(let i = 0; i < balls.length; i++){
    if(distance(mouse.x, balls[i].x, mouse.y, balls[i].y) <= 50){
      balls[i].vy += 1.5;
      balls[i].opacity = 0.85;
    }else{
      balls[i].opacity = 0.2;
    }
  }
}

function startSelect(){
  mouse.x = event.clientX;
  mouse.y = event.clientY-menuBarHeight;
  isSelecting = true;
}
function updateMousePos(){
  if(isSelecting){
    mouse.x = event.clientX;
    mouse.y = event.clientY-menuBarHeight;
  }
}
function stopSelect(){
  isSelecting = false;
  for(let i = 0; i < balls.length; i++){
    balls[i].opacity = .2;
  }
  for (let i = 0; i < cp.particles.length; i++) {
    cp.particles[i].clearTrail();
  }
}

function distance(x1, x2, y1, y2){
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function Ball(x, y, vx, radius){
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = 0;
  this.radius = radius;
  this.mass = 1;
  this.color = pickColor();
  this.opacity = 0.2;

  this.draw = function(){
    c.beginPath();
    c.arc(this.x, this.y, radius, 0, 2*Math.PI);
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.stroke();
    c.closePath();
  }

  this.wallColls = function(){
    if(this.x + this.vx < this.radius ||
       this.x + this.vx > innerWidth-this.radius)
    {
      this.vx *= -energyLoss;
    }
    if(this.y + this.vy < this.radius ||
       this.y + this.vy> innerHeight-this.radius-menuBarHeight)
    {
      this.vy *= -energyLoss;
    }
  }

  this.update = function(){
    this.draw();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += gravity;
    this.wallColls();
  }
}

function CreateBalls(){
  balls = [];
  for(var i = 0; i < 10; i++){
    let radius = (Math.random()*10)+20;
    let xPos = (Math.random()*(innerWidth-2*radius))+radius;
    let yPos = (Math.random()*(innerHeight-2*radius-menuBarHeight))+radius;
    let xVel = (Math.random()*20)-10;
    balls.push(new Ball(xPos, yPos, xVel, radius));
  }
}

function setFramRate(){
  requestAnimationFrame(setFramRate);

  elapsed = Date.now() - past;

  if(elapsed >= frameRate){
    past = Date.now()- (elapsed%(1000/fps));
    animate();
  }
}

function animate() {
  c.clearRect(0, 0, innerWidth, innerHeight);

  if(isSelecting)
    selectBall();

  for(var i = 0; i < balls.length; i++){
    balls[i].update();
  }
}
